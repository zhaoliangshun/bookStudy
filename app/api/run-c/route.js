// =============================================================
// C 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 C 源代码，调用系统 clang（或 cc）编译成
//       临时可执行文件后运行，捕获 stdout / stderr 返回前端。
//
// 与 Python / Ruby 路由的区别：
//   C 是编译型语言，执行流程比解释型语言多一步编译：
//     1. 将源代码写入临时 .c 文件
//     2. 用 clang（优先）或 cc（回退）编译成临时可执行文件 Playground
//     3. 运行该可执行文件
//     4. 清理临时文件
//
//   二进制名固定为 Playground，避免与系统命令冲突，也便于在
//   临时目录里统一识别和清理。
//
// 安全说明：
//   与 Python 路由相同，本路由用于本地开发学习。生产环境切勿
//   直接暴露此接口。当前实现做了以下基本防护：
//     1. 设置编译超时（10 秒）和运行超时（10 秒）
//     2. 限制 stdout / stderr 缓冲区大小（1MB）
//     3. 子进程以独立 stdio 管道运行
//     4. 执行完毕后清理临时目录（try/finally 保证异常也清理）
//     5. 临时目录用时间戳 + 随机数命名，避免并发冲突
// =============================================================

import { NextResponse } from "next/server";
import { spawn, spawnSync } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// 编译超时（毫秒）
const COMPILE_TIMEOUT_MS = 10000;
// 运行超时（毫秒）
const RUN_TIMEOUT_MS = 10000;
// stdout / stderr 最大缓冲（字节）
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB

// 编译器优先级：优先 clang（错误信息更友好），回退 cc（系统默认 C 编译器）
const PREFERRED_CC = "clang";
const FALLBACK_CC = "cc";

// 输出二进制名固定为 Playground，避免与系统命令冲突
const OUTPUT_BIN_NAME = "Playground";
// 临时源文件名
const SOURCE_FILE_NAME = "playground.c";

// 缓存探测到的编译器，避免每次请求都做 spawnSync 探测
let _resolvedCc = null;

/**
 * 探测可用的 C 编译器：优先 clang，不可用则回退 cc。
 * 用 spawnSync --version 同步探测，命中即缓存。
 * @returns {string} 编译器可执行文件名
 */
function pickCompiler() {
  if (_resolvedCc !== null) return _resolvedCc;
  for (const bin of [PREFERRED_CC, FALLBACK_CC]) {
    try {
      const r = spawnSync(bin, ["--version"], {
        stdio: "ignore",
        env: { PATH: process.env.PATH },
      });
      // error 表示二进制不存在；status 为数字表示能正常启动
      if (!r.error) {
        _resolvedCc = bin;
        return bin;
      }
    } catch {
      // ignore，继续尝试下一个
    }
  }
  // 都没找到，回退到首选，让后续 spawn 报出真实的 ENOENT 错误
  _resolvedCc = PREFERRED_CC;
  return PREFERRED_CC;
}

/**
 * 在子进程中执行命令，收集 stdout / stderr。
 * @param {string} cmd 可执行文件名
 * @param {string[]} args 参数数组
 * @param {object} opts spawn 选项
 * @param {number} timeout 超时毫秒
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
function runCommand(cmd, args, opts, timeout) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, opts);
    let stdoutBuf = "";
    let stderrBuf = "";
    let truncated = false;
    let killed = false;

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stdoutBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stdoutBuf += text.slice(0, MAX_OUTPUT_BYTES - stdoutBuf.length);
        truncated = true;
      } else {
        stdoutBuf += text;
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stderrBuf.length + text.length > MAX_OUTPUT_BYTES) {
        stderrBuf += text.slice(0, MAX_OUTPUT_BYTES - stderrBuf.length);
        truncated = true;
      } else {
        stderrBuf += text;
      }
    });

    child.on("error", (err) => {
      resolve({
        output: "",
        error: `无法启动 ${cmd}：${err.message}`,
        exitCode: -1,
      });
    });

    child.on("close", (code, signal) => {
      if (killed) {
        resolve({
          output: stdoutBuf,
          error: stderrBuf + `\n[执行超时] 超过 ${timeout / 1000} 秒被强制终止。`,
          exitCode: -1,
        });
        return;
      }

      if (truncated) {
        const note = `\n[输出已截断] 输出超过 ${MAX_OUTPUT_BYTES} 字节。`;
        if (stdoutBuf) stdoutBuf += note;
        else stderrBuf += note;
      }

      resolve({ output: stdoutBuf, error: stderrBuf, exitCode: code });
    });

    const timer = setTimeout(() => {
      killed = true;
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
    }, timeout);

    child.on("close", () => clearTimeout(timer));
  });
}

/**
 * 执行 C 代码：编译 + 运行
 * @param {string} code C 源代码
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
async function runCCode(code) {
  const compiler = pickCompiler();

  // 1. 创建临时目录（时间戳 + 随机数，避免并发冲突）
  const tempDir = join(
    tmpdir(),
    `c-run-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  mkdirSync(tempDir, { recursive: true });

  const sourceFile = join(tempDir, SOURCE_FILE_NAME);
  const outputFile = join(tempDir, OUTPUT_BIN_NAME);

  try {
    // 2. 写入 .c 源文件
    writeFileSync(sourceFile, code, "utf8");

    const env = {
      PATH: process.env.PATH,
      LANG: "en_US.UTF-8",
      LC_ALL: "en_US.UTF-8",
    };

    // 3. 编译：clang -o Playground playground.c
    //    -O0 关闭优化（编译更快、报错行号更准确），-Wall 输出常见警告
    const compileResult = await runCommand(
      compiler,
      ["-O0", "-Wall", "-o", outputFile, sourceFile],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: tempDir,
      },
      COMPILE_TIMEOUT_MS
    );

    // 编译失败：编译错误 stderr 放进 error 字段
    if (compileResult.exitCode !== 0) {
      return {
        output: "",
        error: `[编译错误]\n${compileResult.error || compileResult.output}`,
        exitCode: compileResult.exitCode,
      };
    }

    // 4. 运行可执行文件（用绝对路径，不依赖 PATH）
    const runResult = await runCommand(
      outputFile,
      [],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: tempDir,
      },
      RUN_TIMEOUT_MS
    );

    return runResult;
  } finally {
    // 5. 清理临时目录（无论成功失败都清理）
    try {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
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

  if (!code.trim()) {
    return NextResponse.json({
      output: "",
      error: "代码为空，请输入要执行的 C 代码。",
    });
  }

  const result = await runCCode(code);

  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与编译器版本
export async function GET() {
  const compiler = pickCompiler();
  return new Promise((resolve) => {
    const child = spawn(compiler, ["--version"], {
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
          message: "C 代码执行服务正在运行",
          version: version.trim(),
        })
      );
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolve(
        NextResponse.json({
          status: "error",
          message: `未找到 ${PREFERRED_CC} / ${FALLBACK_CC}，请先安装 C 编译器`,
          version: "",
        })
      );
    });
  });
}
