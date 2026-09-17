import { readFileSync, writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

const src = readFileSync("app/courses-data/csharp2-tutorial-data.js", "utf8");
writeFileSync("app/courses-data/.tmp-agg4.mjs", src.replace(/csharp2-chapters-batch(\d+)"/g, 'csharp2-chapters-batch$1.js"'));
const { csharp2Chapters } = await import("../app/courses-data/.tmp-agg4.mjs");
unlinkSync("app/courses-data/.tmp-agg4.mjs");

const blocks = [];
for (const ch of csharp2Chapters) {
  const lines = (ch.content || "").split("\n");
  let inB = false, buf = [], fence = "", startLine = 0;
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    const m = l.trim().match(/^(`{3,})\s*([a-zA-Z0-9+#-]+)/);
    if (!inB && m && m[2] === "csharp") { inB = true; fence = m[1]; buf = []; startLine = k + 2; continue; }
    if (inB && l.trim().startsWith(fence)) { blocks.push({ id: ch.id, code: buf.join("\n"), startLine }); inB = false; continue; }
    if (inB) buf.push(l);
  }
}
const full = blocks.filter((c) => /static void Main|Console\.Write/.test(c.code) && !/\.\.\.|\/\/ TODO|（省略）/.test(c.code));

const W = join(tmpdir(), "csharp2-report");
rmSync(W, { recursive: true, force: true }); mkdirSync(W, { recursive: true });
writeFileSync(join(W, "Runner.csproj"), `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><AllowUnsafeBlocks>true</AllowUnsafeBlocks></PropertyGroup></Project>`);
function run(code) {
  return new Promise((res) => {
    writeFileSync(join(W, "Program.cs"), code, "utf8");
    const c = spawn("dotnet", ["run", "--project", W, "-c", "Release"], { stdio: ["pipe","pipe","pipe"], cwd: W, env: { ...process.env, DOTNET_NOLOGO: "1" } });
    c.stdin.end();
    let out = "", err = "";
    c.stdout.on("data", (d) => { out += d; }); c.stderr.on("data", (d) => { err += d; });
    c.on("close", (code) => res({ code, out, err }));
  });
}
const fails = [];
for (const b of full) {
  const r = await run(b.code);
  if (r.code === 0) continue;
  const all = (r.out + "\n" + r.err);
  const ms = [...all.matchAll(/Program\.cs\((\d+),\d+\): error (CS\d+): ([^\n\[]+)/g)];
  if (!ms.length) continue;
  fails.push({
    id: b.id,
    startLine: b.startLine,
    codes: [...new Set(ms.map((m) => m[2]))],
    first: ms[0],
    lines: b.code.split("\n"),
  });
}
// 按错误码分组统计
const byCode = {};
for (const f of fails) for (const c of f.codes) byCode[c] = (byCode[c] || 0) + 1;
console.log("=== 错误码分布（块数）===");
Object.entries(byCode).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\n=== 明细（共 ${fails.length} 块）===`);
for (const f of fails) {
  const ln = parseInt(f.first[1]);
  console.log(`[${f.id}] 块起始行${f.startLine} 错误行${ln} ${f.first[2]}: ${f.first[3].slice(0, 45)}`);
  console.log(`    源码: ${(f.lines[ln - 1] || "").trim().slice(0, 80)}`);
}
