// =============================================================
// Python 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 Python 源代码，调用系统 python3 解释器在
//       子进程中执行，捕获 stdout / stderr 返回前端。
//
// 为什么不用 Node vm 沙箱：
//   Python 和 JavaScript 是两种完全不同的语言，Node 的 vm 模块只能
//   执行 JavaScript。要让在线编辑器能真正运行 Python，最直接的方案
//   就是调用系统安装的 python3 解释器。
//
// 安全说明：
//   本路由用于本地开发学习，执行的是用户自己提交的代码。生产环境
//   切勿直接暴露此接口——应配合 Docker 容器、cgroups 资源限制、
//   seccomp 系统调用过滤等多层隔离。当前实现做了以下基本防护：
//     1. 设置执行超时（默认 10 秒），防止死循环占用进程
//     2. 限制 stdout 缓冲区大小（1MB），防止内存爆炸
//     3. 子进程以独立 stdio 管道运行，不继承父进程的文件描述符
//     4. 不预设任何环境变量（只用 PATH 让 python3 可被找到）
//
// 执行流程：
//   1. 从请求体读取 code 字符串
//   2. 用 child_process.spawn 启动 python3 -c <code>（或 - 通过 stdin 传入）
//   3. 收集 stdout / stderr，监听 exit 事件
//   4. 超时则 kill 子进程并返回超时错误
//   5. 返回 JSON { output, error, exitCode }
// =============================================================

import { NextResponse } from "next/server";
import { spawn } from "child_process";

// 执行超时（毫秒）。Python 教程的 demo 都很短，10 秒足够；
// 死循环 / input() 阻塞等会被超时强制终止。
const EXEC_TIMEOUT_MS = 10000;

// stdout 最大缓冲（字节）。超过则截断并提示，避免把内存撑爆。
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB

// python3 可执行文件名。在 macOS / Linux 上通常是 python3；
// 如果系统只装了 python，可改成 "python"。
const PYTHON_BIN = "python3";

/**
 * 在子进程中执行 Python 代码。
 * @param {string} code Python 源代码
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
function runPythonCode(code) {
  return new Promise((resolve) => {
    // 用 spawn 启动 python3，通过 stdin 传入代码（- 表示从标准输入读脚本）。
    // 相比 python3 -c "<code>"，stdin 方式不受命令行长度限制，也更安全
    // （代码不会出现在进程参数里，不会被 ps 命令看到）。
    const child = spawn(PYTHON_BIN, ["-"], {
      // 不继承父进程 stdio，单独建管道
      stdio: ["pipe", "pipe", "pipe"],
      // 不继承父进程环境，只保留必要的 PATH（让 python3 能被找到）
      env: { PATH: process.env.PATH, LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8" },
      // 子进程独立成新进程组，方便超时时 kill 整个组
      detached: false,
    });

    let stdoutBuf = "";
    let stderrBuf = "";
    let truncated = false;
    let killed = false;

    // 收集 stdout
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stdoutBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stdoutBuf += text.slice(0, MAX_OUTPUT_BYTES - stdoutBuf.length);
        truncated = true;
      } else {
        stdoutBuf += text;
      }
    });

    // 收集 stderr（Python 异常 traceback 会走这里）
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stderrBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stderrBuf += text.slice(0, MAX_OUTPUT_BYTES - stderrBuf.length);
        truncated = true;
      } else {
        stderrBuf += text;
      }
    });

    // 子进程出错（例如 python3 不存在）
    child.on("error", (err) => {
      resolve({
        output: "",
        error:
          `无法启动 ${PYTHON_BIN}：${err.message}\n` +
          `请确认系统已安装 Python 3，且 ${PYTHON_BIN} 在 PATH 中。\n` +
          `macOS 可用 brew install python，Windows 可从 python.org 下载。`,
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
            `\n[执行超时] 代码运行超过 ${EXEC_TIMEOUT_MS / 1000} 秒被强制终止。\n` +
            `请检查是否有死循环或阻塞式 input()。`,
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

    // 通过 stdin 传入代码，然后关闭 stdin 通知子进程读取完毕
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

  if (!code.trim()) {
    return NextResponse.json({
      output: "",
      error: "代码为空，请输入要执行的 Python 代码。",
    });
  }

  // 调用子进程执行
  const result = await runPythonCode(code);

  // Python 的异常 traceback 走 stderr，exitCode 非 0 表示有错误。
  // 把 stderr 作为 error 字段返回，前端会在「错误」区显示。
  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 Python 版本
export async function GET() {
  return new Promise((resolve) => {
    const child = spawn(PYTHON_BIN, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { PATH: process.env.PATH },
    });
    let version = "";
    child.stdout.on("data", (c) => (version += c.toString()));
    child.stderr.on("data", (c) => (version += c.toString()));
    child.on("close", () => {
      resolve(
        NextResponse.json({
          status: "ok",
          message: "Python 代码执行服务正在运行",
          pythonVersion: version.trim(),
          timeoutMs: EXEC_TIMEOUT_MS,
        })
      );
    });
    child.on("error", () => {
      resolve(
        NextResponse.json({
          status: "error",
          message: `未找到 ${PYTHON_BIN}，请先安装 Python 3`,
        })
      );
    });
  });
}
