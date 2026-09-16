// 导出 csharp3 的 C# 代码段（默认只导出校验失败的），便于人工/批量分析
// 用法：node scripts/dump-csharp3-blocks.mjs [--all] [--chapter=ch80] > out.txt
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const all = args.includes("--all");
const chapterArg = args.find((a) => a.startsWith("--chapter="));
const chapterFilter = chapterArg ? chapterArg.slice("--chapter=".length) : null;

const results = JSON.parse(readFileSync("scripts/csharp3-verify-results.json", "utf8"));
const failMap = new Map();
for (const f of [...results.buildFails, ...results.runFails]) {
  failMap.set(f.key, f);
}

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
    if (RUNNABLE_LANGS.has(lang)) blocks.push({ lang, code: body.join("\n") });
  }
  return blocks;
}

const csharp3Chapters = [];
for (let i = 1; i <= 15; i++) {
  const mod = await import(`../app/courses-data/csharp3-chapters-batch${i}.js`);
  csharp3Chapters.push(...mod.chapters);
}

let n = 0;
for (const chapter of csharp3Chapters) {
  if (chapterFilter && !chapter.id.includes(chapterFilter)) continue;
  const blocks = extractBlocks(chapter.content);
  blocks.forEach((b, idx) => {
    const key = `${chapter.id}#${idx + 1}`;
    const fail = failMap.get(key);
    if (!all && !fail) return;
    n++;
    console.log(`\n${"=".repeat(80)}`);
    console.log(`### ${key}  ${chapter.title}  正文第 ${idx + 1} 段  [${b.lang}]`);
    if (fail) {
      console.log(`--- 失败: ${fail.phase} ${fail.reason}`);
      for (const d of fail.detail) console.log(`    ${d}`);
    }
    console.log(`${"-".repeat(80)}`);
    console.log(b.code);
  });
}
console.error(`\n导出 ${n} 段`);
