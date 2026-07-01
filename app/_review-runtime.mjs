// 运行时审查脚本 v2：每个章节用子进程隔离运行，避免单个章节崩溃影响全局
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const APP_DIR = join(process.cwd(), "app");

const fileGroups = [
  ...Array.from({ length: 15 }, (_, i) => `chapters-batch${i + 1}.js`),
  ...Array.from({ length: 5 }, (_, i) => `nodejs2-chapters-batch${i + 1}.js`),
  ...Array.from({ length: 5 }, (_, i) => `nodejs3-chapters-batch${i + 1}.js`),
  ...Array.from({ length: 12 }, (_, i) => `ts-chapters-batch${i + 1}.js`),
  ...Array.from({ length: 5 }, (_, i) => `ts2-chapters-batch${i + 1}.js`),
  ...Array.from({ length: 5 }, (_, i) => `ts3-chapters-batch${i + 1}.js`),
];

// 子进程工作脚本：接收 appDir、文件名和章节 id，运行并输出 JSON 结果
const WORKER = `
import { pathToFileURL } from "node:url";
import { join } from "node:path";
const appDir = process.argv[2];
const file = process.argv[3];
const chId = process.argv[4];
const sandboxUrl = pathToFileURL(join(appDir, "sandbox-runner.js")).href;
const { runInSandbox } = await import(sandboxUrl);
let chapters = [];
try {
  const mod = await import(pathToFileURL(join(appDir, file)).href);
  chapters = mod.chapters || [];
} catch (e) {
  console.log(JSON.stringify({ error: "文件加载失败: " + e.message }));
  process.exit(0);
}
const ch = chapters.find((c) => c.id === chId);
if (!ch || !ch.code) {
  console.log(JSON.stringify({ error: "章节未找到或无 code" }));
  process.exit(0);
}
const stray = [];
process.on("uncaughtException", (e) => stray.push("uncaughtException: " + (e.stack || e.message)));
process.on("unhandledRejection", (e) => stray.push("unhandledRejection: " + (e && e.stack ? e.stack : String(e))));
try {
  const res = await runInSandbox(ch.code);
  let err = res.error;
  if (err && (err.includes("NODE_EXIT") || err.includes("process.exit"))) err = null;
  await new Promise((r) => setTimeout(r, 300));
  console.log(JSON.stringify({ error: err, stray: stray.length ? stray : null, outTail: (res.output || "").slice(-150) }));
} catch (e) {
  console.log(JSON.stringify({ error: "沙箱异常: " + (e.stack || e.message), stray: stray.length ? stray : null }));
}
process.exit(0);
`;

const tmpDir = mkdtempSync(join(tmpdir(), "review-"));
const workerPath = join(tmpDir, "worker.mjs");
writeFileSync(workerPath, WORKER);

function runChapter(file, chId) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [workerPath, APP_DIR, file, chId], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => (stdout += d.toString()));
    p.stderr.on("data", (d) => (stderr += d.toString()));
    const timer = setTimeout(() => {
      p.kill("SIGKILL");
      resolve({ error: "子进程超时", stderr });
    }, 15000);
    p.on("close", () => {
      clearTimeout(timer);
      let parsed = null;
      try {
        const lines = stdout.split("\n").filter((l) => l.trim());
        const last = lines[lines.length - 1];
        parsed = JSON.parse(last);
      } catch {
        parsed = { error: "无法解析输出", raw: stdout.slice(-300), stderr: stderr.slice(-300) };
      }
      resolve(parsed);
    });
  });
}

const results = [];
let count = 0;
for (const f of fileGroups) {
  let chapters = [];
  try {
    const mod = await import(pathToFileURL(join(APP_DIR, f)).href);
    chapters = mod.chapters || [];
  } catch (e) {
    results.push({ file: f, id: "-", err: `文件加载失败: ${e.message}` });
    continue;
  }
  for (const ch of chapters) {
    if (!ch || !ch.code) continue;
    count++;
    const res = await runChapter(f, ch.id);
    if (res.error || res.stray) {
      results.push({ file: f, id: ch.id, err: res.error || "", stray: res.stray, outTail: res.outTail });
    }
    if (count % 20 === 0) process.stderr.write(`已检查 ${count} 章节...\n`);
  }
}

if (results.length === 0) {
  console.log("运行时未发现未捕获错误。");
} else {
  console.log(`发现 ${results.length} 个运行时问题：\n`);
  for (const r of results) {
    console.log(`----- ${r.file} / ${r.id} -----`);
    if (r.err) console.log("error:", r.err.slice(0, 700));
    if (r.stray) console.log("stray:", JSON.stringify(r.stray).slice(0, 700));
    if (r.outTail) console.log("outTail:", r.outTail);
    console.log("");
  }
}
