// =============================================================
// Shell / Bash 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 shell 脚本，调用系统 bash 在子进程中
//       执行，捕获 stdout / stderr 返回前端。
//
// 设计说明：
//   与 Python / Ruby 路由同属解释型语言，采用相同的 spawn +
//   stdin 模式。bash -s 表示从标准输入读取脚本，这样脚本不会
//   出现在进程参数里（不会被 ps 看到），也不受命令行长度限制。
//
//   注意：shell 脚本里没有 console.log，输出请使用 echo / printf
//   等命令。本路由不做任何语法转换，前端提交什么就原样执行。
//
// 安全说明：
//   本路由用于本地开发学习，执行的是用户自己提交的脚本。生产
//   环境切勿直接暴露此接口——shell 能直接操作系统，危险性最高，
//   应配合 Docker 容器、cgroups 资源限制、seccomp 系统调用过滤
//   等多层隔离，最好以低权限用户运行。当前实现做了以下基本防护：
//     1. 设置执行超时（10 秒），防止死循环 / sleep 占用进程
//     2. 限制 stdout / stderr 缓冲区大小（1MB），防止内存爆炸
//     3. 子进程以独立 stdio 管道运行，不继承父进程的文件描述符
//     4. 不预设任何环境变量（只用 PATH 让 bash 内置/外部命令可用）
//
// 执行流程：
//   1. 从请求体读取 code 字符串
//   2. 用 child_process.spawn 启动 bash -s，通过 stdin 传入脚本
//   3. 收集 stdout / stderr，监听 close 事件
//   4. 超时则 kill 子进程并返回超时错误
//   5. 返回 JSON { output, error, exitCode }
// =============================================================

import { NextResponse } from "next/server";
import { spawn } from "child_process";

// 执行超时（毫秒）。shell demo 都很短，10 秒足够；
// 死循环 / sleep 1000 等会被超时强制终止。
const EXEC_TIMEOUT_MS = 10000;

// stdout / stderr 最大缓冲（字节）。超过则截断并提示，避免内存撑爆。
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB
// 输入代码最大长度（字符），防止超大输入拖垮子进程
const MAX_CODE_LENGTH = 50000;

// bash 可执行文件名。macOS 自带 bash（3.x）或可通过 brew 装 5.x；
// Linux 各发行版通常默认安装。这里用 bash 而非 sh，以支持数组、
// [[ ]] 等常用扩展语法。
const SHELL_BIN = "bash";

/**
 * 在子进程中执行 shell 脚本。
 * @param {string} code shell 脚本
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
function runShellCode(code) {
  return new Promise((resolve) => {
    // 用 spawn 启动 bash，通过 stdin 传入脚本（-s 表示从标准输入读脚本）。
    // 相比 bash -c "<code>"，stdin 方式不受命令行长度限制，也更安全
    // （脚本不会出现在进程参数里，不会被 ps 命令看到）。
    const child = spawn(SHELL_BIN, ["-s"], {
      // 不继承父进程 stdio，单独建管道
      stdio: ["pipe", "pipe", "pipe"],
      // 不继承父进程环境，只保留必要的 PATH（让外部命令可被找到）
      env: { PATH: process.env.PATH, LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8", HOME: process.env.HOME || "" },
      // 子进程独立成新进程组，方便超时时 kill 整个组
      detached: false,
    });

    let stdoutBuf = "";
    let stderrBuf = "";
    let truncated = false;
    let killed = false;
    // 修复：用 resolved 标记防止多次 resolve
    let resolved = false;
    const safeResolve = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };
    // 统一清理 timer：避免定时器长时间持有子进程引用造成内存泄漏
    let timer = null;
    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

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

    // 收集 stderr（shell 的报错信息会走这里）
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stderrBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stderrBuf += text.slice(0, MAX_OUTPUT_BYTES - stderrBuf.length);
        truncated = true;
      } else {
        stderrBuf += text;
      }
    });

    // 子进程出错（例如 bash 不存在）
    child.on("error", (err) => {
      // error 事件触发后 close 可能不再触发，需在此清除超时定时器
      clearTimer();
      safeResolve({
        output: "",
        error:
          `无法启动 ${SHELL_BIN}：${err.message}\n` +
          `请确认系统已安装 ${SHELL_BIN}，且 ${SHELL_BIN} 在 PATH 中。`,
        exitCode: -1,
      });
    });

    // 子进程退出
    child.on("close", (code, signal) => {
      clearTimer();
      if (resolved) return;
      if (killed) {
        // 被超时强制终止
        safeResolve({
          output: stdoutBuf,
          error:
            stderrBuf +
            `\n[执行超时] 脚本运行超过 ${EXEC_TIMEOUT_MS / 1000} 秒被强制终止。\n` +
            `请检查是否有死循环或长时间 sleep。`,
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

      safeResolve({ output, error, exitCode: code });
    });

    // 通过 stdin 传入脚本，然后关闭 stdin 通知子进程读取完毕
    // 监听 stdin error 事件，防止子进程提前退出时 write 触发未捕获的 EPIPE
    child.stdin.on("error", () => {});
    child.stdin.write(code);
    child.stdin.end();

    // 超时处理：到时间还没退出就 kill
    timer = setTimeout(() => {
      killed = true;
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
    }, EXEC_TIMEOUT_MS);
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
      error: "代码为空，请输入要执行的 shell 脚本。",
    });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { output: "", error: "代码过长（超过 50000 字符），请精简后重试。" },
      { status: 413 }
    );
  }

  // 调用子进程执行
  const result = await runShellCode(code);

  // shell 的报错信息走 stderr，exitCode 非 0 表示有错误。
  // 把 stderr 作为 error 字段返回，前端会在「错误」区显示。
  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 bash 版本
export async function GET() {
  return new Promise((resolve) => {
    const child = spawn(SHELL_BIN, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { PATH: process.env.PATH },
    });
    let version = "";
    // 修复：用 resolved 标记防止多次 resolve
    let resolved = false;
    const safeResolve = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };
    let timer = null;
    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const onData = (c) => (version += c.toString());
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    // 健康检查超时保护：5 秒未响应视为不可用
    timer = setTimeout(() => {
      clearTimer();
      child.stdout.removeListener("data", onData);
      child.stderr.removeListener("data", onData);
      child.kill("SIGKILL");
      safeResolve(
        NextResponse.json({ status: "timeout", error: "版本检查超时" }, { status: 504 })
      );
    }, 5000);
    child.on("close", () => {
      clearTimer();
      child.stdout.removeListener("data", onData);
      child.stderr.removeListener("data", onData);
      if (resolved) return;
      safeResolve(
        NextResponse.json({
          status: "ok",
          message: "Shell 代码执行服务正在运行",
          version: version.trim(),
        })
      );
    });
    child.on("error", () => {
      clearTimer();
      child.stdout.removeListener("data", onData);
      child.stderr.removeListener("data", onData);
      if (resolved) return;
      safeResolve(
        NextResponse.json({
          status: "error",
          message: `未找到 ${SHELL_BIN}，请先安装 bash`,
          version: "",
        })
      );
    });
  });
}
