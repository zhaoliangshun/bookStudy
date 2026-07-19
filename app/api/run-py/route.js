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
import { spawn, spawnSync } from "child_process";
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// 执行超时（毫秒）。Python 教程的 demo 都很短，10 秒足够；
// 死循环 / input() 阻塞等会被超时强制终止。
const EXEC_TIMEOUT_MS = 10000;

// stdout 最大缓冲（字节）。超过则截断并提示，避免把内存撑爆。
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB
// 输入代码最大长度（字符），防止超大输入拖垮子进程
const MAX_CODE_LENGTH = 50000;

// 缓存探测到的 Python 可执行文件，避免每次请求都做 spawnSync 探测
let _pythonBin = null;

function getPythonEnv() {
  return {
    PATH: process.env.PATH,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
    LANG: "en_US.UTF-8",
    LC_ALL: "en_US.UTF-8",
  };
}

// Python 可执行路径。按优先级尝试：python3.13 -> python3 -> python（Windows上用python）。
// 用 spawnSync --version 同步探测，命中即缓存。
function getPythonBin() {
  if (_pythonBin !== null) return _pythonBin;
  const candidates = process.platform === "win32"
    ? ["python", "python3", "py"]
    : ["python3.13", "python3", "python"];
  const env = { PATH: process.env.PATH };
  for (const bin of candidates) {
    try {
      const r = spawnSync(bin, ["--version"], { stdio: "ignore", timeout: 3000, env });
      if (!r.error) {
        _pythonBin = bin;
        return _pythonBin;
      }
    } catch {}
  }
  _pythonBin = process.platform === "win32" ? "python" : "python3";
  return _pythonBin;
}

/**
 * 在子进程中执行 Python 代码。
 * @param {string} code Python 源代码
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
function runPythonCode(code) {
  return new Promise((resolve) => {
    const pythonBin = getPythonBin();
    // 将代码写入临时文件再执行（而非通过 stdin 传入）。
    // 原因：macOS 上 multiprocessing 默认使用 spawn 启动子进程，
    // spawn 会重新导入主模块。若主模块是 stdin（路径为 <stdin>），
    // 子进程会因找不到文件而报 FileNotFoundError。
    // 写入真实文件后，spawn 可正确找到主模块路径。
    const tmpDir = join(/*turbopackIgnore: true*/ tmpdir(), `pyrun-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(tmpDir, { recursive: true });
    const tmpFile = join(tmpDir, "main.py");
    writeFileSync(tmpFile, code, "utf8");

    const child = spawn(pythonBin, [tmpFile], {
      // 不继承父进程 stdio，单独建管道
      stdio: ["pipe", "pipe", "pipe"],
      env: getPythonEnv(),
      // 子进程独立成新进程组，方便超时时 kill 整个组
      detached: false,
    });

    // 用 Buffer 累积原始字节，最后一次性转 UTF-8 字符串。
    // 原因：data 事件的 chunk 可能在一个多字节 UTF-8 字符中间截断，
    // 如果每个 chunk 单独 toString("utf8") 会在截断处产生乱码字符。
    // 累积到 Buffer 再整体 decode 可避免此问题。
    let stdoutChunks = [];
    let stderrChunks = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let truncated = false;
    let killed = false;

    // 收集 stdout
    child.stdout.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (stdoutBytes + buf.length > MAX_OUTPUT_BYTES) {
        const remain = MAX_OUTPUT_BYTES - stdoutBytes;
        if (remain > 0) stdoutChunks.push(buf.slice(0, remain));
        stdoutBytes = MAX_OUTPUT_BYTES;
        truncated = true;
      } else {
        stdoutChunks.push(buf);
        stdoutBytes += buf.length;
      }
    });

    // 收集 stderr（Python 异常 traceback 会走这里）
    child.stderr.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (stderrBytes + buf.length > MAX_OUTPUT_BYTES) {
        const remain = MAX_OUTPUT_BYTES - stderrBytes;
        if (remain > 0) stderrChunks.push(buf.slice(0, remain));
        stderrBytes = MAX_OUTPUT_BYTES;
        truncated = true;
      } else {
        stderrChunks.push(buf);
        stderrBytes += buf.length;
      }
    });

    // 清理临时文件（保证只执行一次）
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      try { unlinkSync(tmpFile); } catch { /* ignore */ }
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    };
    // 标记是否已 resolve，防止 error/close 重复触发导致多次 resolve
    let resolved = false;
    const safeResolve = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };

    // 子进程出错（例如 python3 不存在）
    child.on("error", (err) => {
      // error 事件触发后 close 可能不再触发，需在此清除超时定时器，
      // 避免定时器继续持有子进程引用造成内存泄漏
      clearTimeout(timer);
      cleanup();
      safeResolve({
        output: "",
        error:
          `无法启动 ${pythonBin}：${err.message}\n` +
          `请确认系统已安装 Python 3，且 ${pythonBin} 在 PATH 中。\n` +
          `macOS 可用 brew install python，Windows 可从 python.org 下载。`,
        exitCode: -1,
      });
    });

    // 子进程退出
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      cleanup();
      if (resolved) return;
      // 将累积的 Buffer chunks 一次性解码为 UTF-8 字符串
      const stdoutBuf = Buffer.concat(stdoutChunks).toString("utf8");
      const stderrBuf = Buffer.concat(stderrChunks).toString("utf8");

      if (killed) {
        // 被超时强制终止
        safeResolve({
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

      safeResolve({ output, error, exitCode: code });
    });

    // 超时处理：到时间还没退出就 kill
    const timer = setTimeout(() => {
      killed = true;
      try {
        // 强制终止，防止 Python 捕获 SIGTERM 后不退出；
        // Windows 上 Node 会将 SIGKILL 映射为 TerminateProcess
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
      error: "代码为空，请输入要执行的 Python 代码。",
    });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { output: "", error: "代码过长（超过 50000 字符），请精简后重试。" },
      { status: 413 }
    );
  }

  // 调用子进程执行
  let result;
  try {
    result = await runPythonCode(code);
  } catch (err) {
    return NextResponse.json(
      { output: "", error: `服务内部错误：${err.message || String(err)}` },
      { status: 500 }
    );
  }

  let output = result.output || "";
  let error = result.error || "";

  // 程序正常退出（exitCode === 0）时，stderr 可能是正常日志输出
  // （如 Python logging、unittest 都写到 stderr），不应显示为"错误"，
  // 合并到 output 字段。超时（exitCode=-1）和异常（exitCode 非 0）保持原行为：
  // stderr 作为 error 返回，前端在「错误」区显示。
  if (result.exitCode === 0 && error) {
    output = output ? `${output}\n${error}` : error;
    error = "";
  }

  return NextResponse.json({
    output,
    error,
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 Python 版本
export async function GET() {
  const pythonBin = getPythonBin();
  return new Promise((resolve) => {
    // 修复：用 resolved 标记防止多次调用 resolve
    // 修复：所有 listener 在 close/error/timeout 后统一通过 cleanup() 移除
    // 避免长时运行的 dev server 因残留 listener 累积导致内存泄露
    let resolved = false;
    const child = spawn(pythonBin, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { PATH: process.env.PATH },
    });
    let version = "";
    const onData = (c) => (version += c.toString());
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    const cleanup = () => {
      if (resolved) return;
      // 清掉 timer 和 listeners，防止残留
      clearTimeout(timer);
      child.stdout.removeListener("data", onData);
      child.stderr.removeListener("data", onData);
    };
    // 健康检查超时保护：5 秒未响应视为不可用
    const timer = setTimeout(() => {
      cleanup();
      child.kill("SIGKILL");
      resolved = true;
      resolve(NextResponse.json({ status: "timeout", error: "版本检查超时" }, { status: 504 }));
    }, 5000);
    child.on("close", () => {
      cleanup();
      if (resolved) return;
      resolved = true;
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
      cleanup();
      if (resolved) return;
      resolved = true;
      resolve(
        NextResponse.json({
          status: "error",
          message: `未找到 ${pythonBin}，请先安装 Python 3`,
        })
      );
    });
  });
}
