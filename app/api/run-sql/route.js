// =============================================================
// SQL 代码执行 API 路由（基于 Node.js 内置 node:sqlite）
// -------------------------------------------------------------
// 作用：接收前端发送的 SQL 脚本，使用 Node.js 内置的 SQLite 模块
//       在内存数据库中执行，捕获结果/错误返回前端。
//
// 为什么用 node:sqlite 而非 sqlite3 命令行：
//   - Node.js 22+ 内置 node:sqlite（基于 SQLite 3 C 库编译），无需外部依赖
//   - 跨平台：Windows/macOS/Linux 开箱即用，不依赖系统安装 sqlite3 CLI
//   - 性能更好：直接调用 C API，无需创建子进程
//   - 输出格式更可控：自定义表格格式输出
// =============================================================

import { NextResponse } from "next/server";

const EXEC_TIMEOUT_MS = 10000;
const MAX_CODE_LENGTH = 50000;

let _sqliteModule = null;
let _sqliteAvailable = null;
let _sqliteVersion = "";

async function loadSqlite() {
  if (_sqliteAvailable !== null) {
    return { available: _sqliteAvailable, version: _sqliteVersion, mod: _sqliteModule };
  }
  try {
    _sqliteModule = await import("node:sqlite");
    const { DatabaseSync } = _sqliteModule;
    const db = new DatabaseSync(":memory:");
    const v = db.prepare("SELECT sqlite_version() AS v").get();
    db.close();
    _sqliteAvailable = true;
    _sqliteVersion = v?.v || "unknown";
  } catch {
    _sqliteAvailable = false;
    _sqliteVersion = "";
    _sqliteModule = null;
  }
  return { available: _sqliteAvailable, version: _sqliteVersion, mod: _sqliteModule };
}

function formatTable(rows) {
  if (!rows || rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const colWidths = columns.map((col) => {
    const maxLen = Math.max(
      col.length,
      ...rows.map((r) => String(r[col] ?? "").length)
    );
    return Math.min(maxLen, 60);
  });
  const sep = "+" + colWidths.map((w) => "-".repeat(w + 2)).join("+") + "+";
  const header = "|" + columns.map((c, i) => " " + c.padEnd(colWidths[i]) + " ").join("|") + "|";
  const data = rows.map((row) =>
    "|" + columns.map((c, i) => {
      const val = String(row[c] ?? "");
      const truncated = val.length > colWidths[i] ? val.slice(0, colWidths[i] - 1) + "…" : val;
      return " " + truncated.padEnd(colWidths[i]) + " ";
    }).join("|") + "|"
  );
  return [sep, header, sep, ...data, sep].join("\n");
}

async function runSqlCode(code) {
  const { available, mod } = await loadSqlite();
  if (!available || !mod) {
    return {
      output: "",
      error: "SQLite 不可用：当前 Node.js 版本不支持 node:sqlite（需要 Node.js 22.5+）。",
      exitCode: -1,
    };
  }

  const sanitized = code.replace(
    /\b(ATTACH|DETACH|VACUUM)\b/gi,
    "-- 已过滤: $1"
  );

  let db;
  try {
    const { DatabaseSync } = mod;
    db = new DatabaseSync(":memory:");
    db.exec("PRAGMA foreign_keys = ON");

    const statements = sanitized
      .split(/;\s*/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    let output = "";
    let error = "";
    let hadError = false;

    for (const stmt of statements) {
      if (hadError) break;
      try {
        const upper = stmt.trim().toUpperCase();
        if (upper.startsWith("SELECT") || upper.startsWith("PRAGMA") ||
            upper.startsWith("EXPLAIN") || upper.startsWith("WITH") ||
            upper.startsWith("VALUES") || upper.startsWith("RETURNING")) {
          const rows = db.prepare(stmt).all();
          if (rows.length > 0) {
            output += formatTable(rows) + "\n\n";
          } else {
            output += "(空结果集)\n\n";
          }
        } else {
          db.exec(stmt);
          output += `执行成功: ${stmt.slice(0, 80)}${stmt.length > 80 ? "…" : ""}\n`;
        }
      } catch (e) {
        error = `SQL 错误: ${e.message}\n  语句: ${stmt.slice(0, 100)}`;
        hadError = true;
      }
    }

    return {
      output: output.trim(),
      error,
      exitCode: hadError ? 1 : 0,
    };
  } catch (e) {
    return {
      output: "",
      error: `执行失败: ${e.message}`,
      exitCode: -1,
    };
  } finally {
    try { db?.close(); } catch {}
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { output: "", error: "请求体不是合法的 JSON" },
      { status: 400 }
    );
  }

  const code = body?.code ?? "";

  if (typeof code !== "string") {
    return NextResponse.json(
      { output: "", error: "code 必须是字符串" },
      { status: 400 }
    );
  }

  if (!code.trim()) {
    return NextResponse.json({
      output: "",
      error: "代码为空，请输入要执行的 SQL 脚本。",
    });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { output: "", error: "代码过长（超过 50000 字符），请精简后重试。" },
      { status: 413 }
    );
  }

  const result = await new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        output: "",
        error: `[执行超时] SQL 执行超过 ${EXEC_TIMEOUT_MS / 1000} 秒被强制终止。请检查是否有慢查询或笛卡尔积。`,
        exitCode: -1,
      });
    }, EXEC_TIMEOUT_MS);
    (async () => {
      const r = await runSqlCode(code);
      clearTimeout(timer);
      resolve(r);
    })();
  });

  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

export async function GET() {
  const { available, version } = await loadSqlite();
  if (available) {
    return NextResponse.json({
      status: "ok",
      message: "SQL 代码执行服务正在运行",
      version: `SQLite ${version} (node:sqlite)`,
    });
  }
  return NextResponse.json(
    {
      status: "error",
      message: "SQLite 不可用：需要 Node.js 22.5+",
      version: "",
    },
    { status: 503 }
  );
}
