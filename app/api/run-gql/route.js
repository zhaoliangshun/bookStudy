// =============================================================
// GraphQL 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 GraphQL 代码（包含 SDL 定义 + Resolvers +
//        Query 三段式），通过子进程调用 executor.js 执行查询，
//       返回 JSON 结果。
//
// 架构说明：
//   - 路由处理器只负责解析代码和调度子进程
//   - executor.js 作为独立进程加载 graphql 包，避免 Turbopack 打包问题
//   - 与 Python 教程的 run-py 使用相同的子进程模式
//
// 执行流程：
//   1. 解析 code 字符串，提取三个部分
//   2. 启动 Node.js 子进程运行 executor.js
//   3. 通过 stdin 传递 { sdl, resolversCode, query }
//   4. 从 stdout 读取执行结果 JSON
//   5. 返回 { data, errors } 给前端
// =============================================================

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 用 new Function 阻断 Turbopack 静态分析：executor.js 是运行时子进程脚本，
// 不应被 Turbopack 当作模块打包。new Function 使路径在运行时才计算。
const EXECUTOR_PATH = new Function("p", "d", "return p.join(d, 'executor.js')")(path, __dirname);

// 子进程 stdout/stderr 最大字节数：超过则截断并提示，避免恶意 resolver
// 用大量 console.log 耗尽内存（与其他子进程路由保持一致）
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB

/**
 * 从 code 字符串中提取三段内容。
 */
function parseCode(code) {
  const schemaMatch = code.match(
    /# === Schema ===\n([\s\S]*?)(?=\n# === Resolvers ===)/
  );
  const resolversMatch = code.match(
    /# === Resolvers ===\n([\s\S]*?)(?=\n# === Query ===)/
  );
  const queryMatch = code.match(/# === Query ===\n([\s\S]*)/);

  if (!schemaMatch) {
    return {
      error:
        '缺少 Schema 部分，请确保代码中包含 "# === Schema ===" 标记。',
    };
  }
  if (!resolversMatch) {
    return {
      error:
        '缺少 Resolvers 部分，请确保代码中包含 "# === Resolvers ===" 标记。',
    };
  }
  if (!queryMatch) {
    return {
      error:
        '缺少 Query 部分，请确保代码中包含 "# === Query ===" 标记。',
    };
  }

  return {
    sdl: schemaMatch[1].trim(),
    resolversCode: resolversMatch[1].trim(),
    query: queryMatch[1].trim(),
    error: null,
  };
}

/**
 * 通过子进程执行 GraphQL 查询。
 * @returns {Promise<{data: object|null, errors: [{message: string}]|null}>}
 */
function executeGraphQL(sdl, resolversCode, query) {
  return new Promise((resolve) => {
    const child = spawn("node", [EXECUTOR_PATH], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let stdoutTruncated = false;
    let stderrTruncated = false;

    // 超时定时器先于事件回调注册，避免 close/error 回调引用未声明的 timer（TDZ）
    let timer = setTimeout(() => {
      try { child.kill(); } catch {}
      resolve({
        data: null,
        errors: [{ message: "执行超时（10秒），请检查代码是否有死循环。" }],
      });
    }, 10000);

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      if (stdoutTruncated) return;
      if (stdout.length + text.length > MAX_OUTPUT_BYTES) {
        stdout += text.slice(0, MAX_OUTPUT_BYTES - stdout.length);
        stdoutTruncated = true;
      } else {
        stdout += text;
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      if (stderrTruncated) return;
      if (stderr.length + text.length > MAX_OUTPUT_BYTES) {
        stderr += text.slice(0, MAX_OUTPUT_BYTES - stderr.length);
        stderrTruncated = true;
      } else {
        stderr += text;
      }
    });

    child.on("close", (exitCode) => {
      // 子进程已退出，清理超时定时器，避免悬挂触发无效的 kill/resolve
      clearTimeout(timer);
      if (stdout) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
          return;
        } catch {
          // 解析失败，继续用 stderr 报错
        }
      }

      const truncateNote =
        stdoutTruncated || stderrTruncated
          ? "\n[输出已截断] 子进程输出超过 1MB。"
          : "";
      resolve({
        data: null,
        errors: [
          {
            message: stderr
              ? `执行错误: ${stderr.trim()}${truncateNote}`
              : `子进程退出码 ${exitCode}，无输出${truncateNote}`,
          },
        ],
      });
    });

    child.on("error", (err) => {
      // 启动失败同样需要清理超时定时器
      clearTimeout(timer);
      resolve({
        data: null,
        errors: [{ message: `启动子进程失败: ${err.message}` }],
      });
    });

    // 写入输入数据
    const input = JSON.stringify({ sdl, resolversCode, query });
    child.stdin.write(input);
    child.stdin.end();
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, errors: [{ message: "请求体不是合法的 JSON" }] },
      { status: 400 }
    );
  }

  const code = body?.code ?? "";

  // 类型校验：防止 {code: 123} 导致 .trim() 抛未捕获异常
  if (typeof code !== "string") {
    return NextResponse.json(
      { data: null, errors: [{ message: "code 必须是字符串" }] },
      { status: 400 }
    );
  }

  if (!code.trim()) {
    return NextResponse.json({
      data: null,
      errors: [{ message: "代码为空，请输入要执行的 GraphQL 代码。" }],
    });
  }

  // 解析三段内容
  const parsed = parseCode(code);
  if (parsed.error) {
    return NextResponse.json({
      data: null,
      errors: [{ message: parsed.error }],
    });
  }

  // 通过子进程执行
  const result = await executeGraphQL(
    parsed.sdl,
    parsed.resolversCode,
    parsed.query
  );

  return NextResponse.json(result);
}

// 健康检查
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "GraphQL 执行服务正在运行（子进程模式）",
    graphqlVersion: "16.14.2",
  });
}