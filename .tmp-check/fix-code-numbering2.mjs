// 行级精确修正：按 id 定位章节，在其 code 字段起始处替换首个"第X章"
import { readFileSync, writeFileSync } from "fs";
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

const base = "/Users/test/bookStudy/app/courses-data/";
const files = [
  "csharp5-chapters-batch1.js","csharp5-chapters-batch2.js","csharp5-chapters-batch3.js",
  "csharp5-chapters-batch4.js","csharp5-chapters-batch5.js","csharp5-chapters-batch6.js",
  "csharp5-chapters-batch7.js","csharp5-chapters-batch8.js","csharp5-chapters-batch9.js",
  "csharp5-chapters-batch10.js","csharp5-chapters-batch11.js","csharp5-chapters-batch12.js",
  "csharp5-chapters-batch13.js","csharp5-chapters-batch14.js","csharp5-chapters-batch15.js",
  "csharp5-chapters-batch16.js","csharp5-chapters-batch17.js","csharp5-chapters-production.js",
];
const headNum = new Map();
for (const ch of csharp5Chapters) {
  const m = (ch.content || "").match(/^##\s*第([零一二三四五六七八九十百]+)章/m);
  headNum.set(ch.id, m ? m[1] : null);
}
const targets = [];
for (const ch of csharp5Chapters) {
  if (!ch.code) continue;
  const want = headNum.get(ch.id);
  if (!want) continue;
  const head = ch.code.split("\n").slice(0, 3).join("\n");
  const m = head.match(/第([零一二三四五六七八九十百]+)章/);
  if (!m || m[1] === want) continue;
  targets.push({ id: ch.id, from: m[1], to: want });
}
console.log(`待修 ${targets.length} 章`);

const apply = process.argv.includes("--apply");
let done = 0, miss = [];
for (const f of files) {
  let src = readFileSync(base + f, "utf8");
  let lines = src.split("\n");
  let changed = false;
  for (const t of targets) {
    const idIdx = lines.findIndex((l) => new RegExp(`id:\\s*['"]${t.id}['"]`).test(l));
    if (idIdx < 0) continue;
    // 向下找 code 字段（范围：到下一个章节 id 之前，content 可能有几百行）
    let codeIdx = -1;
    let nextId = lines.length;
    for (let i = idIdx + 1; i < lines.length; i++) {
      if (/id:\s*['"]csharp5-/.test(lines[i])) { nextId = i; break; }
    }
    for (let i = idIdx; i < nextId; i++) {
      if (/^\s*code:\s*/.test(lines[i])) { codeIdx = i; break; }
    }
    if (codeIdx < 0) { miss.push(t.id + "(无code行)"); continue; }
    // 在 code 起始后 6 行内替换首个章号
    let hit = false;
    for (let i = codeIdx; i < Math.min(codeIdx + 6, lines.length) && !hit; i++) {
      const m = lines[i].match(/第([零一二三四五六七八九十百]+)章/);
      if (m) {
        if (m[1] === t.to) { hit = true; break; } // 已是目标值
        if (m[1] !== t.from) { miss.push(`${t.id}(章号${m[1]}≠预期${t.from})`); hit = true; break; }
        lines[i] = lines[i].replace(/第[零一二三四五六七八九十百]+章/, `第${t.to}章`);
        hit = true; changed = true; done++;
      }
    }
    if (!hit) miss.push(t.id + "(未找到章号)");
  }
  if (apply && changed) writeFileSync(base + f, lines.join("\n"), "utf8");
}
console.log(`已应用 ${apply ? done : 0} 处${apply ? "" : "（预览模式）"}`);
if (miss.length) console.log("跳过/异常:", miss.join(", "));
