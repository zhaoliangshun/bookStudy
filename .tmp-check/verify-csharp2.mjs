import { readFileSync, writeFileSync, unlinkSync } from "fs";

// 生成带 .js 后缀的临时聚合文件（原生 node 需要显式扩展名）
const src = readFileSync("app/courses-data/csharp2-tutorial-data.js", "utf8");
writeFileSync(
  "app/courses-data/.tmp-agg.mjs",
  src.replace(/csharp2-chapters-batch(\d+)"/g, 'csharp2-chapters-batch$1.js"')
);

const { csharp2Chapters, csharp2ChapterGroups } = await import("../app/courses-data/.tmp-agg.mjs");

const problems = [];
const ids = new Map();
for (const ch of csharp2Chapters) ids.set(ch.id, (ids.get(ch.id) || 0) + 1);
for (const [id, n] of ids) if (n > 1) problems.push(`[重复ID x${n}] ${id}`);

for (const ch of csharp2Chapters) {
  if (!ch.title) problems.push(`[缺title] ${ch.id}`);
  if (!ch.group) problems.push(`[缺group] ${ch.id}`);
  if (!ch.content || ch.content.length < 50) problems.push(`[content过短] ${ch.id}`);
  if (!ch.icon) problems.push(`[缺icon] ${ch.id}`);
  if (ch.group && !csharp2ChapterGroups.includes(ch.group)) problems.push(`[group未注册] ${ch.id}: ${ch.group}`);
  // title 不应含「第X章」前缀
  if (/^第[一二三四五六七八九十百]+章/.test(ch.title || "")) problems.push(`[title带章号前缀] ${ch.id}: ${ch.title}`);
  // 正文首行标题应含「第X章」
  const h = (ch.content || "").split("\n").find((l) => l.startsWith("##")) || "";
  if (!/^## 第[一二三四五六七八九十百]+章/.test(h)) problems.push(`[正文标题缺章号] ${ch.id}: ${h.slice(0, 30)}`);
  if (/\$1/.test(ch.content || "")) problems.push(`[残留$1] ${ch.id}`);
}

for (const g of csharp2ChapterGroups) if (!csharp2Chapters.some((c) => c.group === g)) problems.push(`[空分组] ${g}`);

// 章号须按升序
const nums = csharp2Chapters.filter((c) => /^csharp2-ch\d+$/.test(c.id)).map((c) => parseInt(c.id.slice(9)));
for (let i = 1; i < nums.length; i++) {
  if (nums[i] <= nums[i - 1]) problems.push(`[章号非升序] 位置${i}: ${nums[i - 1]} -> ${nums[i]}`);
}

console.log(`章节数: ${csharp2Chapters.length} | 分组数: ${csharp2ChapterGroups.length} | 问题: ${problems.length}`);
problems.forEach((p) => console.log(" -", p));
console.log("\n=== 末尾 8 章 ===");
csharp2Chapters.slice(-8).forEach((ch) => {
  const h = (ch.content || "").split("\n").find((l) => l.startsWith("##")) || "";
  console.log(`${ch.id} | title=${ch.title} | heading=${h.replace("## ", "").slice(0, 26)}`);
});
unlinkSync("app/courses-data/.tmp-agg.mjs");
