// 精确修正：只改每章 code 字段开头那条标题注释的章号，使其与正文标题章号一致。
// 做法：从源文件文本中定位该章 code 原文整块，替换其中第一处"第X章"。
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

// 正文章号
const headNum = new Map();
for (const ch of csharp5Chapters) {
  const m = (ch.content || "").match(/^##\s*第([零一二三四五六七八九十百]+)章/m);
  headNum.set(ch.id, m ? m[1] : null);
}

const plan = [];
for (const ch of csharp5Chapters) {
  if (!ch.code) continue;
  const want = headNum.get(ch.id);
  if (!want) continue;
  // 只处理 code 开头 3 行内的标题注释
  const head = ch.code.split("\n").slice(0, 3).join("\n");
  const m = head.match(/第([零一二三四五六七八九十百]+)章/);
  if (!m) continue;
  if (m[1] === want) continue;
  plan.push({ id: ch.id, from: m[1], to: want });
}

console.log(`需要修正的章: ${plan.length}`);
for (const p of plan) console.log(`  ${p.id}: 第${p.from}章 → 第${p.to}章`);

if (process.argv.includes("--apply")) {
  // 缓存源文件内容
  const srcCache = new Map();
  for (const f of files) srcCache.set(f, readFileSync(base + f, "utf8"));
  let done = 0;
  for (const p of plan) {
    const ch = csharp5Chapters.find((c) => c.id === p.id);
    // code 原文在源文件中的表示：模板字符串里 \n 是真实换行，反引号需转义，这里直接用原文查找
    const codeRaw = ch.code;
    for (const f of files) {
      let src = srcCache.get(f);
      const at = src.indexOf(codeRaw);
      if (at < 0) continue;
      // 只替换这一块内的第一处"第X章"
      const before = src.slice(0, at);
      const block = src.slice(at, at + codeRaw.length);
      const replaced = block.replace(/第[零一二三四五六七八九十百]+章/, `第${p.to}章`);
      if (replaced === block) { console.log(`  跳过（无变化）${p.id}`); break; }
      src = before + replaced + src.slice(at + codeRaw.length);
      srcCache.set(f, src);
      done++;
      break;
    }
  }
  for (const f of files) writeFileSync(base + f, srcCache.get(f), "utf8");
  console.log(`已应用: ${done} 处`);
}
