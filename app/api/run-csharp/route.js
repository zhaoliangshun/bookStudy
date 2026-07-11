// =============================================================
// C# 代码执行 API 路由
// -------------------------------------------------------------
// 作用：接收前端发送的 C# 源代码，调用 dotnet 编译运行，
//       在子进程中执行，捕获 stdout / stderr 返回前端。
//
// 执行流程：
//   1. 检测 dotnet 是否可用
//   2. 在临时目录创建控制台项目（首次或缺失时）
//   3. 将用户代码写入 Program.cs
//   4. 用 dotnet run 编译并运行
//   5. 捕获输出、清理临时文件
//
// 兼容性：C# 12 / .NET 8 LTS
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

// 增强的 PATH：合并进程 PATH 与 .NET 常见安装目录，解决 dev server PATH 过期问题
const ENHANCED_PATH = (() => {
  const extra = process.platform === "win32"
    ? ["C:\\Program Files\\dotnet", "C:\\Program Files (x86)\\dotnet"]
    : ["/usr/local/share/dotnet", "/usr/share/dotnet"];
  return [process.env.PATH, ...extra.filter(existsSync)].join(delimiter);
})();

// 运行超时（毫秒）—— 编译 + 运行合并计时
const RUN_TIMEOUT_MS = 15000;
// stdout 最大缓冲（字节）
const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB
// dotnet 可执行文件名
const DOTNET_BIN = "dotnet";

// 运行器模板目录（含 .csproj 骨架，复用避免每次 dotnet new）
// 放在系统临时目录下，进程间共享
// 注意：本目录只作为模板，每次请求会复制一份到独立临时目录再写入用户代码，
//       避免并发请求相互覆盖源文件
const RUNNER_DIR = join(tmpdir(), "csharp-runner-v1");

/**
 * 检测 dotnet 是否可用。
 * @returns {{ available: boolean, version: string }}
 */
function checkDotnet() {
  try {
    const result = spawnSync(DOTNET_BIN, ["--version"], {
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf8",
      timeout: 5000,
      env: { PATH: ENHANCED_PATH },
    });
    if (result.status === 0) {
      return { available: true, version: result.stdout.trim() };
    }
    return { available: false, version: "" };
  } catch {
    return { available: false, version: "" };
  }
}

/**
 * 确保运行器项目存在。
 * 首次调用时创建一个控制台项目骨架，后续复用。
 */
function ensureRunnerProject() {
  if (existsSync(join(RUNNER_DIR, "Runner.csproj"))) {
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

  // 动态检测已安装的 .NET SDK 主版本号，生成匹配的 TargetFramework。
  // 避免硬编码 net8.0 但系统装的是 net10 导致 NuGet 还原失败。
  const dotnetInfo = checkDotnet();
  const majorVersion = dotnetInfo.available ? dotnetInfo.version.split(".")[0] : "8";

  // 直接写入 .csproj 文件，比 dotnet new 快
  const csprojContent = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net${majorVersion}.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AssemblyName>Runner</AssemblyName>
    <RootNamespace>Runner</RootNamespace>
  </PropertyGroup>
</Project>
`;

  try {
    writeFileSync(join(RUNNER_DIR, "Runner.csproj"), csprojContent, "utf8");
    // 写一个占位 Program.cs（实际运行时会被覆盖）
    writeFileSync(
      join(RUNNER_DIR, "Program.cs"),
      "// placeholder\nclass Program { static void Main() {} }",
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
 * 执行 C# 代码：写入 Program.cs → dotnet run
 * @param {string} code C# 源代码
 * @returns {Promise<{output: string, error: string, exitCode: number}>}
 */
async function runCsharpCode(code) {
  // 1. 检测 dotnet
  const { available, version } = checkDotnet();
  if (!available) {
    return {
      output: "",
      error:
        "未找到 dotnet 命令。请先安装 .NET 8 SDK：\n" +
        "  macOS:   brew install --cask dotnet-sdk\n" +
        "  或访问:  https://dotnet.microsoft.com/download/dotnet/8.0\n" +
        "  验证:    dotnet --version",
      exitCode: -1,
    };
  }

  // 2. 确保运行器项目存在（作为模板目录，只创建一次）
  const projectStatus = ensureRunnerProject();
  if (!projectStatus.ok) {
    return {
      output: "",
      error: `初始化运行器项目失败：${projectStatus.error}`,
      exitCode: -1,
    };
  }

  // 3. 创建本次请求的独立临时目录（时间戳 + 随机数，避免并发覆盖）
  //    把模板目录(RUNNER_DIR)整体复制过来，后续编译运行都在 tmpDir 里进行
  const tmpDir = join(
    tmpdir(),
    `csharp-runner-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
    // 4. 写入 Program.cs（写入到独立临时目录，不影响其他并发请求）
    const programFile = join(tmpDir, "Program.cs");
    try {
      writeFileSync(programFile, code, "utf8");
    } catch (err) {
      return {
        output: "",
        error: `写入源代码失败：${err.message}`,
        exitCode: -1,
      };
    }

    // 5. 编译并运行（dotnet run 会自动编译 + 执行）
    // 保留全部 process.env（dotnet/NuGet 依赖大量环境变量），仅覆盖 PATH
    const env = {
      ...process.env,
      PATH: ENHANCED_PATH,
      DOTNET_CLI_TELEMETRY_OPTOUT: "1",  // 禁用遥测，加快启动
      DOTNET_NOLOGO: "1",                 // 禁用 logo
    };

    const result = await runCommand(
      DOTNET_BIN,
      [
        "run",
        "--project", tmpDir,
        // 不使用 --no-build：--no-build 会跳过编译直接运行已有程序集，
        // 但首次运行时还没有构建产物，会导致找不到可执行文件。
        // 让 dotnet run 自动构建并运行（首次稍慢，后续有缓存）。
        "-c", "Release",
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
        env,
        cwd: tmpDir,
      },
      RUN_TIMEOUT_MS
    );

    // 忽略 dotnet 的 build 输出（避免噪音），只保留运行时输出
    // 通过简单启发式：包含 "Build succeeded" 之前的内容当作编译信息
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
      error: "代码为空，请输入要执行的 C# 代码。",
    });
  }

  const result = await runCsharpCode(code);

  return NextResponse.json({
    output: result.output || "",
    error: result.error || "",
    exitCode: result.exitCode,
  });
}

// 健康检查：GET 请求返回服务状态与 dotnet 版本
export async function GET() {
  const { available, version } = checkDotnet();
  return NextResponse.json({
    status: available ? "ok" : "error",
    message: available
      ? "C# 代码执行服务正在运行"
      : "未找到 dotnet，请先安装 .NET 8 SDK",
    dotnetVersion: version,
    runTimeoutMs: RUN_TIMEOUT_MS,
    maxOutputBytes: MAX_OUTPUT_BYTES,
  });
}
