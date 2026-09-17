// 提取 csharp5 教程正文 content 中所有 cs-run/csharp-run 围栏代码块并批量编译验证
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

// 1. 提取所有 run 围栏代码块
const blocks = [];
for (const ch of csharp5Chapters) {
  const lines = (ch.content || "").split("\n");
  let inBlock = false, buf = [], fence = "";
  for (const line of lines) {
    const m = line.trim().match(/^(`{3,})\s*([a-zA-Z0-9+#-]+)/);
    if (!inBlock && m) {
      const lang = (m[2] || "").toLowerCase();
      if (["cs-run", "csharp-run"].includes(lang)) { inBlock = true; fence = m[1]; buf = []; continue; }
    } else if (inBlock && line.trim().startsWith(fence)) {
      blocks.push({ id: ch.id, title: ch.title, code: buf.join("\n") });
      inBlock = false; continue;
    }
    if (inBlock) buf.push(line);
  }
}
console.log(`共提取 ${blocks.length} 个 run 围栏代码块`);

// 2. 批量编译
const WORK_ROOT = join(tmpdir(), "csharp5-runblock-verify");
const PARALLEL = 4;
const TIMEOUT_MS = 25000;
const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
  </PropertyGroup>
</Project>`;
const workers = [];
for (let i = 0; i < PARALLEL; i++) {
  const dir = join(WORK_ROOT, `w${i}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "Runner.csproj"), csproj);
  workers.push(dir);
}
function runOne(code, dir) {
  return new Promise((resolve) => {
    writeFileSync(join(dir, "Program.cs"), code, "utf8");
    const child = spawn("dotnet", ["run", "--project", dir, "-c", "Release"], {
      stdio: ["pipe", "pipe", "pipe"], cwd: dir,
      env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" },
    });
    child.stdin.end();
    let out = "", err = "", killed = false, done = false;
    const timer = setTimeout(() => { killed = true; try { child.kill("SIGKILL"); } catch {} }, TIMEOUT_MS);
    const finish = (r) => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("error", (e) => finish({ status: "ERROR", out, err: String(e) }));
    child.on("close", (code) => {
      if (killed) return finish({ status: "TIMEOUT", out, err });
      finish(code === 0 ? { status: "OK", out, err } : { status: "FAIL", out, err });
    });
  });
}
const results = [];
let idx = 0;
async function loop(dir) {
  while (idx < blocks.length) {
    const my = idx++;
    const b = blocks[my];
    const r = await runOne(b.code, dir);
    results[my] = { ...b, ...r };
    console.error(`[${my + 1}/${blocks.length}] ${r.status} ${b.id} ${b.title}`);
  }
}
await Promise.all(workers.map(loop));
const ok = results.filter((r) => r.status === "OK");
const bad = results.filter((r) => r.status !== "OK");
console.error(`\n===== OK ${ok.length} / 总 ${results.length} =====`);
for (const r of bad) {
  console.log(`\n########## ${r.status}: ${r.id} ${r.title} ##########`);
  const lines = (r.err || "").split("\n").filter((l) => /error CS|error :|Unhandled/.test(l));
  console.log(lines.slice(0, 6).join("\n") || (r.err || "").slice(0, 500));
}
