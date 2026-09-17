import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

const FILES = ["batch1","batch3","batch4","batch5","batch6","batch7","batch8","batch9","batch10"];

// 单遍反转义（源码是 JS 模板字符串：\` → `, \$ → $, \\ → \, \n, \t）
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
const escape = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");

const W = join(tmpdir(), "csharp2-8803");
rmSync(W, { recursive: true, force: true }); mkdirSync(W, { recursive: true });
writeFileSync(join(W, "Runner.csproj"), `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable><AllowUnsafeBlocks>true</AllowUnsafeBlocks></PropertyGroup></Project>`);
function compile(code) {
  return new Promise((res) => {
    writeFileSync(join(W, "Program.cs"), code, "utf8");
    const c = spawn("dotnet", ["run", "--project", W, "-c", "Release"], { stdio: ["pipe","pipe","pipe"], cwd: W, env: { ...process.env, DOTNET_NOLOGO: "1" } });
    c.stdin.end();
    let out = "", err = "";
    c.stdout.on("data", (d) => { out += d; }); c.stderr.on("data", (d) => { err += d; });
    c.on("close", (code) => res({ ok: code === 0, log: out + err }));
  });
}

const TYPE_RE = /^(?:public |internal |private |protected |static |sealed |abstract |partial |readonly |file )*(?:class|struct|record|interface|enum|delegate)\s/;
function splitTopLevel(code) {
  const lines = code.split("\n");
  const segs = [];
  let cur = null, depth = 0;
  for (const line of lines) {
    if (!cur) {
      if (/^using\s/.test(line.trim())) { segs.push({ kind: "using", text: line }); continue; }
      cur = { kind: TYPE_RE.test(line.trim()) ? "type" : "stmt", lines: [line] };
      depth = (line.match(/[{[(]/g) || []).length - (line.match(/[}\])]/g) || []).length;
      if (depth <= 0) { segs.push({ kind: cur.kind, text: cur.lines.join("\n") }); cur = null; depth = 0; }
      continue;
    }
    cur.lines.push(line);
    depth += (line.match(/[{[(]/g) || []).length - (line.match(/[}\])]/g) || []).length;
    if (depth <= 0) { segs.push({ kind: cur.kind, text: cur.lines.join("\n") }); cur = null; depth = 0; }
  }
  if (cur) segs.push({ kind: cur.kind, text: cur.lines.join("\n") });
  return segs;
}
function reorder(code) {
  const segs = splitTopLevel(code);
  const usings = segs.filter((s) => s.kind === "using");
  const types = segs.filter((s) => s.kind === "type");
  const stmts = segs.filter((s) => s.kind === "stmt");
  if (!types.length || !stmts.length) return null;
  const lastTypeIdx = segs.map((s) => s.kind).lastIndexOf("type");
  if (!segs.slice(lastTypeIdx + 1).some((s) => s.kind === "stmt")) return null;
  return [...usings, ...stmts, ...types].map((s) => s.text).join("\n");
}

const OPEN = /^\\`\\`\\`\s*([a-zA-Z0-9+#-]+)/;
const CLOSE = /^\\`\\`\\`/;

let fixed = 0, scanned = 0;
for (const f of FILES) {
  const p = `app/courses-data/csharp2-chapters-${f}.js`;
  const lines = readFileSync(p, "utf8").split("\n");
  const blocks = [];
  let inB = false, start = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!inB) {
      const m = t.match(OPEN);
      if (m && m[1] === "csharp") { inB = true; start = i; }
      continue;
    }
    if (CLOSE.test(t)) { blocks.push([start, i]); inB = false; }
  }
  let changed = false;
  for (let bi = blocks.length - 1; bi >= 0; bi--) {
    const [s, e] = blocks[bi];
    const code = unescape(lines.slice(s + 1, e).join("\n"));
    if (!/static void Main|Console\.Write/.test(code)) continue;
    if (/\.\.\.|\/\/ TODO|（省略）/.test(code)) continue;
    scanned++;
    const r0 = await compile(code);
    if (r0.ok || !/error CS8803/.test(r0.log)) continue;
    const reordered = reorder(code);
    if (!reordered) continue;
    const r1 = await compile(reordered);
    if (!r1.ok) continue;
    lines.splice(s + 1, e - s - 1, ...escape(reordered).split("\n"));
    fixed++; changed = true;
  }
  if (changed) { writeFileSync(p, lines.join("\n"), "utf8"); console.log(`${f}: 已写入`); }
}
console.log(`扫描 ${scanned} 块，重排修复 ${fixed} 块`);
