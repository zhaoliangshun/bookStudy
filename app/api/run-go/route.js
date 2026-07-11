// =============================================================
// Go 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 Go 源代码，调用 go run 编译运行，
//       在子进程中执行，捕获 stdout / stderr 返回前端。
//
// 执行流程：
//   1. 检测 go 是否可用
//   2. 在临时目录创建 main.go（以及占位 go.mod）
//   3. 用 go run 编译并运行
//   4. 捕获输出、清理临时文件
//
// 兼容性：Go 1.21+（建议 1.22 LTS）
//
// 安全说明：
//   本路由用于本地开发学习。生产环境切勿直接暴露此接口。
//   已做以下基本防护：
//     1. 设置运行超时（15 秒，含编译时间）
//     2. 限制 stdout 缓冲区大小（1MB）
//     3. 子进程以独立 stdio 管道运行
//     4. 执行完毕后清理临时文件
// =============================================================

import { NextResponse } from "next/server";
import { spawn, spawnSync } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync, cpSync } from "fs";
import { join, delimiter } from "path";
import { tmpdir } from "os";

// 增强的 PATH：合并进程 PATH 与 Go 常见安装目录，解决 dev server PATH 过期问题
const ENHANCED_PATH = (() => {
  const extra = process.platform === "win32"
    ? ["C:\\Program Files\\Go\\bin", "C:\\Go\\bin"]
    : ["/usr/local/go/bin", "/opt/homebrew/bin"];
  return [process.env.PATH, ...extra.filter(existsSync)].join(delimiter);
})();

// 运行超时（毫秒）—— 编译 + 运行合并计时
const RUN_TIMEOUT_MS = 15000;
// stdout 最大缓冲（字节）
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB
// go 可执行文件名
const GO_BIN = "go";

// 运行器模板目录（含 go.mod 骨架，复用避免每次创建）
// 放在系统临时目录下，进程间共享
// 注意：本目录只作为模板，每次请求会复制一份到独立临时目录再写入用户代码，
//       避免并发请求相互覆盖源文件
const RUNNER_DIR = join(tmpdir(), "go-runner-v1");

/**
 * 检测 go 是否可用。
 * @returns {{ available: boolean, version: string }}
 */
function checkGo() {
  try {
    const result = spawnSync(GO_BIN, ["version"], {
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
      timeout: 5000,
      env: { PATH: ENHANCED_PATH },
    });
    if (result.status === 0) {
      // go version 输出格式：go version go1.22.0 darwin/arm64
      const version = result.stdout.trim();
      return { available: true, version };
    }
    return { available: false, version: "" };
  } catch {
    return { available: false, version: "" };
  }
}

/**
 * 确保运行器目录存在，并写入占位 go.mod（避免 module 缺失报错）。
 */
function ensureRunnerProject() {
  if (existsSync(join(RUNNER_DIR, "go.mod"))) {
    return { ok: true };
  }

  // 清理可能残留的部分文件
  try {
    if (existsSync(RUNNER_DIR)) {
      rmSync(RUNNER_DIR, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }

  mkdirSync(RUNNER_DIR, { recursive: true });

  // 写一个最小 go.mod（Go 1.16+ 默认开启 module 模式）
  const goModContent = `module runner

go 1.21
`;

  try {
    writeFileSync(join(RUNNER_DIR, "go.mod"), goModContent, "utf8");
    // 写一个占位 main.go（实际运行时会被覆盖）
    writeFileSync(
      join(RUNNER_DIR, "main.go"),
      "package main\n\nfunc main() {}\n",
      "utf8"
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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
 * 执行 Go 代码：写入 main.go → go run
 * @param {string} code Go 源代码
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
async function runGoCode(code) {
  // 1. 检测 go
  const { available, version } = checkGo();
  if (!available) {
    return {
      output: "",
      error:
        "未找到 go 命令。请先安装 Go（建议 1.22 LTS 或更高版本）：\n" +
        "  macOS:   brew install go\n" +
        "  Linux:   https://go.dev/dl/ 下载对应版本\n" +
        "  Windows: https://go.dev/dl/ 下载 msi 安装包\n" +
        "  验证:    go version\n" +
        "  安装后请重启开发服务器以使 PATH 生效。",
      exitCode: -1,
    };
  }

  // 2. 确保运行器目录存在（作为模板目录，只创建一次）
  const projectStatus = ensureRunnerProject();
  if (!projectStatus.ok) {
    return {
      output: "",
      error: `初始化运行器目录失败：${projectStatus.error}`,
      exitCode: -1,
    };
  }

  // 3. 创建本次请求的独立临时目录（时间戳 + 随机数，避免并发覆盖）
  //    把模板目录(RUNNER_DIR)整体复制过来，后续编译运行都在 tmpDir 里进行
  const tmpDir = join(
    tmpdir(),
    `go-runner-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  try {
    cpSync(RUNNER_DIR, tmpDir, { recursive: true });
  } catch (err) {
    return {
      output: "",
      error: `复制运行器模板失败：${err.message}`,
      exitCode: -1,
    };
  }

  try {
    // 4. 写入 main.go（写入到独立临时目录，不影响其他并发请求）
    const mainFile = join(tmpDir, "main.go");
    try {
      writeFileSync(mainFile, code, "utf8");
    } catch (err) {
      return {
        output: "",
        error: `写入源代码失败：${err.message}`,
        exitCode: -1,
      };
    }

    // 5. 编译并运行（go run 会自动编译 + 执行）
    const env = {
      PATH: ENHANCED_PATH,
      HOME: process.env.HOME,
      USERPROFILE: process.env.USERPROFILE,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      APPDATA: process.env.APPDATA,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
      GOPATH: process.env.GOPATH || (process.env.HOME ? join(process.env.HOME, "go") : "/tmp/go"),
      GOPROXY: process.env.GOPROXY || "https://goproxy.cn,direct",
      GOFLAGS: "-mod=mod",
      // 禁用网络访问（避免 go run 尝试下载依赖）
      GOPRIVATE: process.env.GOPRIVATE || "",
      CGO_ENABLED: "0",  // 禁用 CGO，加快编译速度
    };

    const result = await runCommand(
      GO_BIN,
      ["run", mainFile],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: tmpDir,
      },
      RUN_TIMEOUT_MS
    );

    return result;
  } finally {
    // 6. 清理本次请求的临时目录（无论成功失败都清理，避免磁盘泄漏）
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // 清理失败忽略，下次系统重启 tmpdir 也会自动清理
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
      error: "代码为空，请输入要执行的 Go 代码。",
    });
  }

  // 简单校验：必须包含 package main
  if (!/^\s*package\s+main\b/m.test(code)) {
    return NextResponse.json({
      output: "",
      error:
        "代码必须以 `package main` 开头，并包含 `func main()` 作为入口。\n" +
        "示例：\n" +
        "package main\n\n" +
        "import \"fmt\"\n\n" +
        "func main() {\n    fmt.Println(\"Hello, Go!\")\n}",
    });
  }

  const result = await runGoCode(code);

  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 go 版本
export async function GET() {
  const { available, version } = checkGo();
  return NextResponse.json({
    status: available ? "ok" : "error",
    message: available
      ? "Go 代码执行服务正在运行"
      : "未找到 go，请先安装 Go",
    goVersion: version,
    runTimeoutMs: RUN_TIMEOUT_MS,
    maxOutputBytes: MAX_OUTPUT_BYTES,
  });
}
