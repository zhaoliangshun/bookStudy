// 批量验证 csharp5 教程所有章节的主 demo 代码能否编译运行
// 模拟 /api/run-csharp 的环境：net8.0 + ImplicitUsings + Nullable + AllowUnsafeBlocks
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

const WORK_ROOT = join(tmpdir(), "csharp5-batch-verify");
const PARALLEL = 4; // 并行项目数
const TIMEOUT_MS = 25000;

const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
    <AssemblyName>Runner</AssemblyName>
    <RootNamespace>Runner</RootNamespace>
  </PropertyGroup>
</Project>
`;

// 准备 N 个并行工作目录
const workers = [];
for (let i = 0; i < PARALLEL; i++) {
  const dir = join(WORK_ROOT, `w${i}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "Runner.csproj"), csproj);
  workers.push(dir);
}

function runOne(chapter, dir) {
  return new Promise((resolve) => {
    writeFileSync(join(dir, "Program.cs"), chapter.code, "utf8");
    const child = spawn("dotnet", ["run", "--project", dir, "-c", "Release"], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" },
      cwd: dir,
    });
    child.stdin.end();
    let out = "", err = "", killed = false, done = false;
    const timer = setTimeout(() => { killed = true; try { child.kill("SIGKILL"); } catch {} }, TIMEOUT_MS);
    const finish = (r) => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
    child.stdout.on("data", (d) => { out += d; if (out.length > 100000) try { child.kill("SIGKILL"); } catch {} });
    child.stderr.on("data", (d) => { err += d; if (err.length > 100000) try { child.kill("SIGKILL"); } catch {} });
    child.on("error", (e) => finish({ status: "ERROR", out, err: String(e) }));
    child.on("close", (code) => {
      if (killed) return finish({ status: "TIMEOUT", out, err });
      if (code === 0) return finish({ status: "OK", out, err });
      finish({ status: "FAIL", out, err });
    });
  });
}

const results = [];
let idx = 0;
const chapterList = csharp5Chapters.filter((c) => c.code && c.id !== "csharp5-preface");

async function workerLoop(dir) {
  while (idx < chapterList.length) {
    const my = idx++;
    const ch = chapterList[my];
    const r = await runOne(ch, dir);
    results[my] = { id: ch.id, title: ch.title, ...r };
    const tag = r.status === "OK" ? "✓" : r.status === "FAIL" ? "✗ FAIL" : r.status === "TIMEOUT" ? "⏱ TIMEOUT" : "?";
    console.error(`[${my + 1}/${chapterList.length}] ${tag} ${ch.id} ${ch.title}`);
  }
}

await Promise.all(workers.map(workerLoop));

const ok = results.filter((r) => r.status === "OK").length;
const fail = results.filter((r) => r.status === "FAIL");
const timeouts = results.filter((r) => r.status === "TIMEOUT");
console.error(`\n===== 总计 ${results.length}，OK ${ok}，FAIL ${fail.length}，TIMEOUT ${timeouts.length} =====\n`);

for (const r of fail) {
  console.log(`\n########## FAIL: ${r.id} ${r.title} ##########`);
  // 只输出编译错误关键行（CS 错误码）
  const lines = (r.err || "").split("\n").filter((l) => /error CS|error :/.test(l));
  console.log(lines.slice(0, 8).join("\n") || (r.err || "").slice(0, 800));
}
for (const r of timeouts) {
  console.log(`\n########## TIMEOUT: ${r.id} ${r.title} ##########`);
  console.log((r.out || "").slice(0, 200));
}
