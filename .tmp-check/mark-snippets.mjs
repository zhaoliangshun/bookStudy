import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

const FILES = ["batch1","batch3","batch4","batch5","batch6","batch7","batch8","batch9","batch10"];

function unescape(s) {
  let out = "", i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const n = s[i + 1];
      if (n === "`") { out += "`"; i += 2; continue; }
      if (n === "$") { out += "$"; i += 2; continue; }
      if (n === "\\") { out += "\\"; i += 2; continue; }
      if (n === "n") { out += "\n"; i += 2; continue; }
      if (n === "t") { out += "\t"; i += 2; continue; }
      if (n === "r") { out += "\r"; i += 2; continue; }
    }
    out += s[i]; i++;
  }
  return out;
}

const ROOT = join(tmpdir(), "csharp2-mark");
rmSync(ROOT, { recursive: true, force: true }); mkdirSync(ROOT, { recursive: true });
const CSPROJ = `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><AllowUnsafeBlocks>true</AllowUnsafeBlocks></PropertyGroup></Project>`;
const PARALLEL = 6;
const dirs = [];
for (let i = 0; i < PARALLEL; i++) {
  const d = join(ROOT, `w${i}`); mkdirSync(d, { recursive: true });
  writeFileSync(join(d, "Runner.csproj"), CSPROJ); dirs.push(d);
}
function compile(code, dir) {
  return new Promise((res) => {
    writeFileSync(join(dir, "Program.cs"), code, "utf8");
    const c = spawn("dotnet", ["run", "--project", dir, "-c", "Release"], { stdio: ["pipe","pipe","pipe"], cwd: dir, env: { ...process.env, DOTNET_NOLOGO: "1", DOTNET_CLI_TELEMETRY_OPTOUT: "1" } });
    c.stdin.end();
    let out = "", err = "";
    c.stdout.on("data", (d) => { out += d; }); c.stderr.on("data", (d) => { err += d; });
    const t = setTimeout(() => { try { c.kill("SIGKILL"); } catch {} }, 20000);
    c.on("close", (code) => { clearTimeout(t); res({ ok: code === 0, hasBuildErr: /error CS/.test(out + err) }); });
  });
}

const OPEN = /^\\`\\`\\`\s*([a-zA-Z0-9+#-]+)/;
const CLOSE = /^\\`\\`\\`/;

// 1. 收集所有 csharp 块
const jobs = [];
for (const f of FILES) {
  const p = `app/courses-data/csharp2-chapters-${f}.js`;
  const lines = readFileSync(p, "utf8").split("\n");
  let inB = false, start = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!inB) {
      const m = t.match(OPEN);
      if (m && m[1] === "csharp") { inB = true; start = i; }
      continue;
    }
    if (CLOSE.test(t)) { jobs.push({ file: f, s: start, e: i, code: unescape(lines.slice(start + 1, i).join("\n")) }); inB = false; }
  }
}
console.log(`待检测 csharp 块: ${jobs.length}`);

// 2. 并行编译
let idx = 0;
async function worker(dir) {
  while (idx < jobs.length) {
    const my = idx++;
    jobs[my].res = await compile(jobs[my].code, dir);
  }
}
await Promise.all(dirs.map(worker));

const bad = jobs.filter((j) => !j.res.ok || j.res.hasBuildErr);
console.log(`无法独立编译的块: ${bad.length}`);

// 3. 把这些块的围栏改成 csharp-snippet（不提供运行按钮）
const byFile = {};
for (const j of bad) (byFile[j.file] ||= []).push(j);
for (const [f, list] of Object.entries(byFile)) {
  const p = `app/courses-data/csharp2-chapters-${f}.js`;
  const lines = readFileSync(p, "utf8").split("\n");
  for (const j of list) {
    lines[j.s] = lines[j.s].replace("csharp", "csharp-snippet");
  }
  writeFileSync(p, lines.join("\n"), "utf8");
  console.log(`${f}: 标记 ${list.length} 块为片段`);
}
console.log("done");
