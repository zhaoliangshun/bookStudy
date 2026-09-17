import { readFileSync, writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

const src = readFileSync("app/courses-data/csharp2-tutorial-data.js", "utf8");
writeFileSync("app/courses-data/.tmp-agg3.mjs", src.replace(/csharp2-chapters-batch(\d+)"/g, 'csharp2-chapters-batch$1.js"'));
const { csharp2Chapters } = await import("../app/courses-data/.tmp-agg3.mjs");
unlinkSync("app/courses-data/.tmp-agg3.mjs");

const blocks = [];
for (const ch of csharp2Chapters) {
  const lines = (ch.content || "").split("\n");
  let inB = false, buf = [], fence = "";
  for (const l of lines) {
    const m = l.trim().match(/^(`{3,})\s*([a-zA-Z0-9+#-]+)/);
    if (!inB && m && m[2] === "csharp") { inB = true; fence = m[1]; buf = []; continue; }
    if (inB && l.trim().startsWith(fence)) { blocks.push({ id: ch.id, code: buf.join("\n") }); inB = false; continue; }
    if (inB) buf.push(l);
  }
}
const full = blocks.filter((c) => /static void Main|Console\.Write/.test(c.code) && !/\.\.\.|\/\/ TODO|（省略）/.test(c.code));

const W = join(tmpdir(), "csharp2-inspect");
rmSync(W, { recursive: true, force: true }); mkdirSync(W, { recursive: true });
writeFileSync(join(W, "Runner.csproj"), `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><AllowUnsafeBlocks>true</AllowUnsafeBlocks></PropertyGroup></Project>`);

function run(code) {
  return new Promise((res) => {
    writeFileSync(join(W, "Program.cs"), code, "utf8");
    const c = spawn("dotnet", ["run", "--project", W, "-c", "Release"], { stdio: ["pipe","pipe","pipe"], cwd: W, env: { ...process.env, DOTNET_NOLOGO: "1" } });
    c.stdin.end();
    let out = "", err = "";
    c.stdout.on("data", (d) => { out += d; });
    c.stderr.on("data", (d) => { err += d; });
    c.on("close", (code) => res({ code, out, err }));
  });
}
const buildFail = [];
const runtimeErr = [];
let i = 0;
for (const b of full) {
  i++;
  const r = await run(b.code);
  if (r.code === 0) continue;
  const csErrs = (r.out + r.err).split("\n").filter((l) => /error CS/.test(l));
  if (csErrs.length) buildFail.push({ id: b.id, errs: csErrs.slice(0, 3), snippet: b.code.slice(0, 120) });
  else runtimeErr.push({ id: b.id, msg: (r.err || "").split("\n")[0].slice(0, 110) });
}
console.log(`=== 编译失败（真实问题）: ${buildFail.length} ===`);
buildFail.slice(0, 15).forEach((b) => {
  console.log(`\n[${b.id}]`);
  b.errs.forEach((e) => console.log("  " + e.trim().slice(0, 130)));
});
console.log(`\n=== 运行时异常（多为教学演示）: ${runtimeErr.length} ===`);
runtimeErr.slice(0, 10).forEach((b) => console.log(`[${b.id}] ${b.msg}`));
