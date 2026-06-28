// =============================================================
// Java 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 Java 源代码，调用系统 javac 编译、java
//       运行，在子进程中执行，捕获 stdout / stderr 返回前端。
//
// 与 Python 路由的区别：
//   Java 是编译型语言，执行流程比 Python 多一步：
//     1. 从源代码中提取 public class 名（Java 要求文件名与
//        public class 名一致）
//     2. 将源代码写入临时 .java 文件
//     3. 用 javac 编译生成 .class 文件
//     4. 用 java 运行 .class 文件
//     5. 清理临时文件
//
// 安全说明：
//   与 Python 路由相同，本路由用于本地开发学习。生产环境
//   切勿直接暴露此接口。当前实现做了以下基本防护：
//     1. 设置编译超时（10 秒）和运行超时（10 秒）
//     2. 限制 stdout 缓冲区大小（1MB）
//     3. 子进程以独立 stdio 管道运行
//     4. 执行完毕后清理临时文件
//     5. 限制临时文件名只允许字母数字下划线
// =============================================================

import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// 编译超时（毫秒）
const COMPILE_TIMEOUT_MS = 10000;
// 运行超时（毫秒）
const RUN_TIMEOUT_MS = 10000;
// stdout 最大缓冲（字节）
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB

// java / javac 可执行文件名
const JAVA_BIN = "java";
const JAVAC_BIN = "javac";

/**
 * 从 Java 源代码中提取 public class 名。
 * Java 要求文件名必须与 public class 名一致。
 * 如果没有 public class，则查找第一个 class 名。
 * @param {string} code Java 源代码
 * @returns {string} 类名
 */
function extractClassName(code) {
  // 先找 public class XXX
  let m = code.match(/\bpublic\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (m) return m[1];
  // 再找任意 class XXX
  m = code.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (m) return m[1];
  // 兜底
  return "Main";
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
 * 执行 Java 代码：编译 + 运行
 * @param {string} code Java 源代码
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
async function runJavaCode(code) {
  // 1. 提取类名
  const className = extractClassName(code);

  // 2. 创建临时目录
  const tempDir = join(tmpdir(), `java-run-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tempDir, { recursive: true });

  const javaFile = join(tempDir, `${className}.java`);

  try {
    // 3. 写入 .java 文件
    writeFileSync(javaFile, code, "utf8");

    // 4. 编译
    const env = { PATH: process.env.PATH, LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8", JAVA_HOME: process.env.JAVA_HOME || "" };
    const compileResult = await runCommand(
      JAVAC_BIN,
      ["-encoding", "UTF-8", javaFile],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: tempDir,
      },
      COMPILE_TIMEOUT_MS
    );

    // 编译失败
    if (compileResult.exitCode !== 0) {
      return {
        output: "",
        error: `[编译错误]\n${compileResult.error || compileResult.output}`,
        exitCode: compileResult.exitCode,
      };
    }

    // 5. 运行
    const runResult = await runCommand(
      JAVA_BIN,
      ["-Dfile.encoding=UTF-8", className],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: tempDir,
      },
      RUN_TIMEOUT_MS
    );

    return runResult;
  } finally {
    // 6. 清理临时文件
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
      error: "代码为空，请输入要执行的 Java 代码。",
    });
  }

  const result = await runJavaCode(code);

  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 Java 版本
export async function GET() {
  return new Promise((resolve) => {
    const child = spawn(JAVA_BIN, ["-version"], {
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
          message: "Java 代码执行服务正在运行",
          javaVersion: version.trim(),
          compileTimeoutMs: COMPILE_TIMEOUT_MS,
          runTimeoutMs: RUN_TIMEOUT_MS,
        })
      );
    });
    child.on("error", () => {
      resolve(
        NextResponse.json({
          status: "error",
          message: `未找到 ${JAVA_BIN}，请先安装 JDK`,
        })
      );
    });
  });
}
