import { readFileSync, writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

const src = readFileSync("app/courses-data/csharp2-tutorial-data.js", "utf8");
writeFileSync("app/courses-data/.tmp-agg2.mjs", src.replace(/csharp2-chapters-batch(\d+)"/g, 'csharp2-chapters-batch$1.js"'));
const { csharp2Chapters } = await import("../app/courses-data/.tmp-agg2.mjs");
unlinkSync("app/courses-data/.tmp-agg2.mjs");

// 提取每章正文里第一个 "可执行代码在前" 风格的 csharp 代码块（许多章不是完整程序，跳过明显片段）
const candidates = [];
for (const ch of csharp2Chapters) {
  const lines = (ch.content || "").split("\n");
  let inB = false, buf = [], fence = "";
  for (const l of lines) {
    const m = l.trim().match(/^(`{3,})\s*([a-zA-Z0-9+#-]+)/);
    if (!inB && m && m[2] === "csharp") { inB = true; fence = m[1]; buf = []; continue; }
    if (inB && l.trim().startsWith(fence)) { candidates.push({ id: ch.id, title: ch.title, code: buf.join("\n") }); inB = false; continue; }
    if (inB) buf.push(l);
  }
}

// 只测「看起来是完整程序」的块：含 Main 或顶级语句特征且不含 TODO/省略号
const full = candidates.filter((c) =>
  /static void Main|Console\.Write/.test(c.code) &&
  !/\.\.\.|\/\/ TODO|（省略）/.test(c.code)
);
console.log(`代码块 ${candidates.length} 个，其中疑似完整程序 ${full.length} 个`);

const WORK = join(tmpdir(), "csharp2-verify");
const PARALLEL = 4;
const csproj = `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><AllowUnsafeBlocks>true</AllowUnsafeBlocks></PropertyGroup></Project>`;
const workers = [];
for (let i = 0; i < PARALLEL; i++) {
  const d = join(WORK, `w${i}`); rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true });
  writeFileSync(join(d, "Runner.csproj"), csproj); workers.push(d);
}
function run(code, dir) {
  return new Promise((res) => {
    writeFileSync(join(dir, "Program.cs"), code, "utf8");
    const c = spawn("dotnet", ["run", "--project", dir, "-c", "Release"], { stdio: ["pipe","pipe","pipe"], cwd: dir, env: { ...process.env, DOTNET_NOLOGO: "1" } });
    c.stdin.end();
    let err = "", done = false;
    const t = setTimeout(() => { try { c.kill("SIGKILL"); } catch {} }, 25000);
    c.stdout.on("data", () => {});
    c.stderr.on("data", (d) => { err += d; });
    c.on("error", (e) => { if (!done) { done = true; clearTimeout(t); res("ERROR:" + e.message); } });
    c.on("close", (code) => { if (!done) { done = true; clearTimeout(t); res(code === 0 ? "OK" : "FAIL"); } });
  });
}
const results = []; let idx = 0;
async function loop(dir) {
  while (idx < full.length) {
    const my = idx++;
    const st = await run(full[my].code, dir);
    results[my] = { ...full[my], st };
  }
}
await Promise.all(workers.map(loop));
const ok = results.filter((r) => r.st === "OK").length;
console.log(`编译运行: OK ${ok} / ${results.length}`);
results.filter((r) => r.st !== "OK").forEach((r) => console.log(` ✗ ${r.st} ${r.id} ${r.title}`));
