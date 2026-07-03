// =============================================================
// SQL 代码执行 API 路由（基于 sqlite3 命令行工具）
// -------------------------------------------------------------
// 作用：接收前端发送的 SQL 脚本，调用系统 sqlite3 命令行工具
//       在内存数据库中执行，捕获 stdout / stderr 返回前端。
//
// 设计说明：
//   与 Python / Ruby 路由同属「解释执行 + stdin 传入」模式。
//   sqlite3 :memory: 表示使用一个纯内存数据库（进程结束即销毁，
//   不落盘、不污染本机文件），通过 stdin 传入 SQL 脚本
//   （CREATE / INSERT / SELECT 等）。
//
//   关键参数：
//     -header   让 SELECT 结果带列名表头
//     -column   让结果按列对齐（更易读）
//   sqlite3 默认交互模式不输出列头，加上这两个参数后 SELECT
//   结果会以对齐表格形式输出，方便在 playground 中阅读。
//
// 安全说明：
//   本路由用于本地开发学习，执行的是用户自己提交的 SQL。生产
//   环境切勿直接暴露此接口。当前实现做了以下基本防护：
//     1. 设置执行超时（10 秒），防止笛卡尔积等慢查询占用进程
//     2. 限制 stdout / stderr 缓冲区大小（1MB），防止内存爆炸
//     3. 子进程以独立 stdio 管道运行，不继承父进程的文件描述符
//     4. 使用 :memory: 内存库，不读写本机磁盘数据库文件
//     5. 不预设任何环境变量（只用 PATH 让 sqlite3 可被找到）
//
// 执行流程：
//   1. 从请求体读取 code 字符串（SQL 脚本）
//   2. 用 child_process.spawn 启动 sqlite3 :memory: -header -column
//   3. 通过 stdin 传入 SQL 脚本，关闭 stdin 通知执行完毕
//   4. 收集 stdout / stderr，监听 close 事件
//   5. 超时则 kill 子进程并返回超时错误
//   6. 返回 JSON { output, error, exitCode }
// =============================================================

import { NextResponse } from "next/server";
import { spawn } from "child_process";

// 执行超时（毫秒）。SQL demo 都很短，10 秒足够；
// 笛卡尔积 / 大表全表扫描等慢查询会被超时强制终止。
const EXEC_TIMEOUT_MS = 10000;

// stdout / stderr 最大缓冲（字节）。超过则截断并提示，避免内存撑爆。
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB

// sqlite3 可执行文件名。macOS 自带；Linux 可用 apt/yum install sqlite3。
const SQLITE3_BIN = "sqlite3";

/**
 * 在子进程中执行 SQL 脚本（内存数据库）。
 * @param {string} code SQL 脚本
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
function runSqlCode(code) {
  return new Promise((resolve) => {
    // 用 spawn 启动 sqlite3：
    //   :memory:  纯内存数据库，进程结束即销毁
    //   -header   SELECT 结果带列名表头
    //   -column   结果按列对齐
    // SQL 脚本通过 stdin 传入，避免命令行长度限制。
    const child = spawn(SQLITE3_BIN, [":memory:", "-header", "-column"], {
      // 不继承父进程 stdio，单独建管道
      stdio: ["pipe", "pipe", "pipe"],
      // 不继承父进程环境，只保留必要的 PATH（让 sqlite3 可被找到）
      env: { PATH: process.env.PATH, LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8" },
      // 子进程独立成新进程组，方便超时时 kill 整个组
      detached: false,
    });

    let stdoutBuf = "";
    let stderrBuf = "";
    let truncated = false;
    let killed = false;

    // 收集 stdout（SELECT 结果、命令输出会走这里）
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stdoutBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stdoutBuf += text.slice(0, MAX_OUTPUT_BYTES - stdoutBuf.length);
        truncated = true;
      } else {
        stdoutBuf += text;
      }
    });

    // 收集 stderr（SQL 语法错误会走这里）
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stderrBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stderrBuf += text.slice(0, MAX_OUTPUT_BYTES - stderrBuf.length);
        truncated = true;
      } else {
        stderrBuf += text;
      }
    });

    // 子进程出错（例如 sqlite3 不存在）
    child.on("error", (err) => {
      resolve({
        output: "",
        error:
          `无法启动 ${SQLITE3_BIN}：${err.message}\n` +
          `请确认系统已安装 sqlite3，且 ${SQLITE3_BIN} 在 PATH 中。\n` +
          `macOS 自带 sqlite3，Linux 可用 apt/yum install sqlite3。`,
        exitCode: -1,
      });
    });

    // 子进程退出
    child.on("close", (code, signal) => {
      if (killed) {
        // 被超时强制终止
        resolve({
          output: stdoutBuf,
          error:
            stderrBuf +
            `\n[执行超时] SQL 执行超过 ${EXEC_TIMEOUT_MS / 1000} 秒被强制终止。\n` +
            `请检查是否有慢查询或笛卡尔积。`,
          exitCode: -1,
        });
        return;
      }

      let output = stdoutBuf;
      let error = stderrBuf;

      if (truncated) {
        const note = `\n[输出已截断] 输出超过 ${MAX_OUTPUT_BYTES} 字节，仅显示前半部分。`;
        if (output) output += note;
        else error += note;
      }

      resolve({ output, error, exitCode: code });
    });

    // 通过 stdin 传入 SQL 脚本，然后关闭 stdin 通知 sqlite3 执行完毕
    child.stdin.write(code);
    child.stdin.end();

    // 超时处理：到时间还没退出就 kill
    const timer = setTimeout(() => {
      killed = true;
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
    }, EXEC_TIMEOUT_MS);

    // 子进程退出后清除定时器，避免内存泄漏
    child.on("close", () => clearTimeout(timer));
  });
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

  // 类型校验：防止 {code: 123} 导致 .trim() 抛未捕获异常
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

  // 调用子进程执行
  const result = await runSqlCode(code);

  // SQL 语法错误走 stderr，exitCode 非 0 表示有错误。
  // 把 stderr 作为 error 字段返回，前端会在「错误」区显示。
  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 sqlite3 版本
export async function GET() {
  return new Promise((resolve) => {
    const child = spawn(SQLITE3_BIN, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { PATH: process.env.PATH },
    });
    let version = "";
    child.stdout.on("data", (c) => (version += c.toString()));
    child.stderr.on("data", (c) => (version += c.toString()));
    // 健康检查超时保护：5 秒未响应视为不可用
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(NextResponse.json({ status: "timeout", error: "版本检查超时" }, { status: 504 }));
    }, 5000);
    child.on("close", () => {
      clearTimeout(timer);
      resolve(
        NextResponse.json({
          status: "ok",
          message: "SQL 代码执行服务正在运行",
          version: version.trim(),
        })
      );
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolve(
        NextResponse.json({
          status: "error",
          message: `未找到 ${SQLITE3_BIN}，请先安装 sqlite3`,
          version: "",
        })
      );
    });
  });
}
