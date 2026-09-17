import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

const course = process.argv[2]; // csharp | csharp3 | csharp4
function unescape(s){let o="",i=0;while(i<s.length){if(s[i]==="\\"&&i+1<s.length){const n=s[i+1];if(n==="`"){o+="`";i+=2;continue;}if(n==="$"){o+="$";i+=2;continue;}if(n==="\\"){o+="\\";i+=2;continue;}if(n==="n"){o+="\n";i+=2;continue;}if(n==="t"){o+="\t";i+=2;continue;}if(n==="r"){o+="\r";i+=2;continue;}if(n==='"'){o+='"';i+=2;continue;}}o+=s[i];i++;}return o;}

// 收集所有 batch 文件的 csharp 块 + csharp4 的 code 字段
const jobs = [];
const files = readdirSync("app/courses-data").filter((f) => f.startsWith(`${course}-chapters-batch`) && f.endsWith(".js"));
const OPEN = /^\\`\\`\\`\s*([a-zA-Z0-9+#-]+)/;
const CLOSE = /^\\`\\`\\`/;
for (const f of files) {
  const lines = readFileSync(`app/courses-data/${f}`, "utf8").split("\n");
  let inB = false, start = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!inB) {
      const m = t.match(OPEN);
      if (m && m[1] === "csharp") { inB = true; start = i; }
      continue;
    }
    if (CLOSE.test(t)) { jobs.push({ file: f, line: start, code: unescape(lines.slice(start + 1, i).join("\n")) }); inB = false; }
  }
  // csharp4 风格的 code: `...` 字段
  let m;
  const src = lines.join("\n");
  const CODE_RE = /code: `([\s\S]*?)`(?=,\s*\n\s*\})/g;
  while ((m = CODE_RE.exec(src))) jobs.push({ file: f, line: -1, code: m[1], isCodeField: true });
}
console.log(`${course}: 待编译 ${jobs.length} 块`);

const ROOT = join(tmpdir(), `cs-${course}`);
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
    const c = spawn("dotnet", ["build", dir, "-c", "Release", "--nologo", "-v", "q"], { stdio: ["pipe","pipe","pipe"], cwd: dir, env: { ...process.env, DOTNET_NOLOGO: "1" } });
    c.stdin.end();
    let out = "", err = "";
    c.stdout.on("data", (d) => { out += d; }); c.stderr.on("data", (d) => { err += d; });
    const t = setTimeout(() => { try { c.kill("SIGKILL"); } catch {} }, 25000);
    c.on("close", (code) => { clearTimeout(t); res({ ok: code === 0, log: out + err }); });
  });
}
let idx = 0;
async function worker(dir) {
  while (idx < jobs.length) {
    const my = idx++;
    jobs[my].res = await compile(jobs[my].code, dir);
    if ((idx % 50) === 0) console.error(`  进度 ${idx}/${jobs.length}`);
  }
}
await Promise.all(dirs.map(worker));

const bad = jobs.filter((j) => !j.res.ok);
console.log(`编译失败: ${bad.length}`);
const byCode = {};
for (const j of bad) {
  const errs = [...j.res.log.matchAll(/error (CS\d+):/g)].map((m) => m[1]);
  for (const e of [...new Set(errs)]) (byCode[e] ||= []).push(j);
}
console.log("=== 按错误码分组 ===");
Object.entries(byCode).sort((a, b) => b[1].length - a[1].length).forEach(([k, v]) => console.log(`  ${k}: ${v.length}`));
console.log("\n=== 明细 ===");
for (const j of bad) {
  const first = j.res.log.match(/error CS\d+: [^\n\[]+/);
  console.log(`[${j.file}:${j.line}] ${first ? first[0].slice(0, 120) : "?"}`);
}
