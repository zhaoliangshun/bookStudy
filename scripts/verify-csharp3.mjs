// =============================================================
// csharp3 全量 demo 可运行性校验
// -------------------------------------------------------------
// csharp3 页面使用 TutorialPage 默认 inlineCodeRun=true，
// 因此正文里每一个 ```csharp / ```cs 围栏都会带"运行"按钮，
// 都会提交到 /api/run-csharp 编译执行。
// 本脚本模拟真实运行环境逐一验证：
//   net8.0 / ImplicitUsings enable / Nullable enable
//   stdin 关闭（Console.ReadLine() 返回 null）
//   15 秒硬超时（编译 + 运行）
// 用法：
//   node scripts/verify-csharp3.mjs                 全量校验
//   node scripts/verify-csharp3.mjs --chapter=ch67  只看某一章
//   node scripts/verify-csharp3.mjs --compile-only  只编译不运行
// =============================================================
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
// 直接按文件名导入各 batch（聚合入口 csharp3-tutorial-data.js 用的是无扩展名导入，
// 只有 Next 的解析器支持，node 直跑会失败）
const BATCH_COUNT = 15;
const csharp3Chapters = [];
for (let i = 1; i <= BATCH_COUNT; i++) {
  const mod = await import(`../app/courses-data/csharp3-chapters-batch${i}.js`);
  csharp3Chapters.push(...mod.chapters);
}

const args = process.argv.slice(2);
const compileOnly = args.includes("--compile-only");
const chapterArg = args.find((a) => a.startsWith("--chapter="));
const chapterFilter = chapterArg ? chapterArg.slice("--chapter=".length) : null;
const workerCount = Number(args.find((a) => a.startsWith("-j="))?.slice(3) ?? 6);

// ---- 1. 抽取所有 C# 围栏（与 MarkdownRenderer 的围栏解析规则一致）----
const RUNNABLE_LANGS = new Set(["csharp", "cs", "c#"]);
const fenceOpenRe = /^(`{3,})\s*([a-zA-Z0-9+-]+(?:#(?=$))?)?/;

function extractBlocks(content) {
  const lines = (content || "").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].trim().match(fenceOpenRe);
    if (!m) {
      i++;
      continue;
    }
    const fence = m[1];
    const lang = (m[2] || "").toLowerCase();
    const body = [];
    i++;
    while (i < lines.length) {
      const close = lines[i].trim().match(/^(`{3,})\s*$/);
      if (close && close[1].length >= fence.length) break;
      body.push(lines[i]);
      i++;
    }
    if (i < lines.length) i++;
    if (RUNNABLE_LANGS.has(lang)) {
      blocks.push({ lang, code: body.join("\n"), startLine: i });
    }
  }
  return blocks;
}

const tasks = [];
for (const chapter of csharp3Chapters) {
  if (chapterFilter && !chapter.id.includes(chapterFilter)) continue;
  const blocks = extractBlocks(chapter.content);
  blocks.forEach((b, idx) => {
    tasks.push({
      key: `${chapter.id}#${idx + 1}`,
      id: chapter.id,
      title: chapter.title,
      source: `正文第 ${idx + 1} 段 (${b.lang})`,
      code: b.code,
    });
  });
  if (chapter.code && chapter.code.trim()) {
    tasks.push({
      key: `${chapter.id}#main`,
      id: chapter.id,
      title: chapter.title,
      source: "主 demo",
      code: chapter.code,
    });
  }
}

console.log(`共抽取 ${tasks.length} 段可运行 C# 代码（${new Set(tasks.map((t) => t.id)).size} 章）`);

// ---- 2. 准备并行 worker 项目 ----
const workRoot = join(tmpdir(), "verify-csharp3");
rmSync(workRoot, { recursive: true, force: true });
mkdirSync(workRoot, { recursive: true });

const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <LangVersion>12.0</LangVersion>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
    <AssemblyName>Runner</AssemblyName>
    <RootNamespace>Runner</RootNamespace>
  </PropertyGroup>
</Project>
`;

function killTree(child) {
  try {
    // 独立进程组：杀掉整棵树，避免 dotnet 子进程残留导致管道不关闭
    if (child.pid) process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {}
  }
}

function run(cmd, cmdArgs, opts, timeout) {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, {
      ...opts,
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    });
    let out = "";
    let err = "";
    let killed = false;
    let truncated = false;
    const timer = setTimeout(() => {
      killed = true;
      killTree(child);
    }, timeout);
    // 与线上接口一致：输出超过 1MB 就截断并终止（防止死循环示例把内存打爆）
    const CAP = 1024 * 1024;
    child.stdout.on("data", (d) => {
      if (out.length < CAP) out += d.toString();
      else {
        truncated = true;
        killTree(child);
      }
    });
    child.stderr.on("data", (d) => {
      if (err.length < CAP) err += d.toString();
      else {
        truncated = true;
        killTree(child);
      }
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out, err, killed, truncated });
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: -1, out, err: err + e.message, killed, truncated });
    });
  });
}

async function prepareWorker(n) {
  const dir = join(workRoot, `w${n}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "Runner.csproj"), csproj);
  writeFileSync(join(dir, "Program.cs"), "class P { static void Main() {} }");
  const r = await run("dotnet", ["restore", "Runner.csproj"], { cwd: dir }, 120_000);
  if (r.code !== 0) throw new Error(`worker ${n} restore 失败: ${r.err || r.out}`);
  return dir;
}

const workers = [];
for (let i = 0; i < workerCount; i++) workers.push(await prepareWorker(i));

// ---- 3. 并发校验 ----
const resultFile = join(process.cwd(), "scripts", "csharp3-verify-results.json");
const results = [];
let cursor = 0;
let done = 0;

async function workerLoop(n) {
  const dir = workers[n];
  while (true) {
    const idx = cursor++;
    if (idx >= tasks.length) return;
    const task = tasks[idx];
    writeFileSync(join(dir, "Program.cs"), task.code);
    const build = await run(
      "dotnet",
      ["build", "Runner.csproj", "-c", "Release", "--no-restore", "--nologo", "-v:q"],
      { cwd: dir },
      60_000
    );
    if (build.killed) {
      results.push({ ...task, phase: "build", reason: "TIMEOUT", detail: "编译超时" });
    } else if (build.code !== 0) {
      const errs = `${build.out}\n${build.err}`
        .split("\n")
        .filter((l) => /\berror CS\d+/.test(l))
        .map((l) => l.replace(/^.*?\berror\s+/, "").trim())
        .slice(0, 8);
      results.push({ ...task, phase: "build", reason: "COMPILE", detail: [...new Set(errs)] });
    } else if (!compileOnly) {
      // 直接跑编译产物，避免 dotnet run 再派生一层子进程（超时杀不干净）
      const exec = await run(
        "dotnet",
        [join(dir, "bin", "Release", "net8.0", "Runner.dll")],
        { cwd: dir },
        15_000
      );
      const combined = exec.out + "\n" + exec.err;
      const crashed =
        exec.killed ||
        exec.truncated ||
        exec.code !== 0 ||
        /Unhandled exception/.test(combined);
      if (crashed) {
        const detail = combined
          .split("\n")
          .filter((l) => l.trim() && !/^\s*$/.test(l))
          .slice(0, 6)
          .map((l) => l.trim().slice(0, 200));
        results.push({
          ...task,
          phase: "run",
          reason: exec.killed ? "TIMEOUT" : exec.truncated ? "OUTPUT_OVERFLOW" : `EXIT=${exec.code}`,
          detail,
        });
      }
    }
    done++;
    if (done % 20 === 0 || done === tasks.length) {
      process.stdout.write(`\r进度 ${done}/${tasks.length}   失败 ${results.length}`);
      // 增量落盘：万一后面的示例卡死，也不丢已跑出来的结果
      writeFileSync(
        resultFile,
        JSON.stringify(
          { total: tasks.length, done, buildFails: results.filter((r) => r.phase === "build"), runFails: results.filter((r) => r.phase === "run") },
          null,
          2
        )
      );
    }
  }
}

const t0 = Date.now();
await Promise.all(workers.map((_, i) => workerLoop(i)));
process.stdout.write("\n");

// ---- 4. 汇总 ----
const buildFails = results.filter((r) => r.phase === "build");
const runFails = results.filter((r) => r.phase === "run");
console.log("========== 汇总 ==========");
console.log(`总代码段 ${tasks.length}｜编译失败 ${buildFails.length}｜运行失败 ${runFails.length}`);
console.log(`耗时 ${((Date.now() - t0) / 1000).toFixed(0)}s`);

console.log("\n---- 编译失败明细 ----");
for (const r of buildFails) {
  console.log(`\n[${r.key}] ${r.title} · ${r.source}`);
  for (const d of r.detail) console.log("   " + d);
}
console.log("\n---- 运行失败明细 ----");
for (const r of runFails) {
  console.log(`\n[${r.key}] ${r.title} · ${r.source}  ${r.reason}`);
  for (const d of r.detail) console.log("   " + d);
}

writeFileSync(
  resultFile,
  JSON.stringify({ total: tasks.length, buildFails, runFails }, null, 2)
);
console.log(`\n详细结果：${resultFile}`);
rmSync(workRoot, { recursive: true, force: true });
