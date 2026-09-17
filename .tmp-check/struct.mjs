import { readFileSync, writeFileSync, unlinkSync } from "fs";

const course = process.argv[2]; // csharp | csharp3 | csharp4
const entry = `app/courses-data/${course}-tutorial-data.js`;
const src = readFileSync(entry, "utf8");
// 补 .js 后缀（webpack 可省略，node 不行）
writeFileSync(
  "app/courses-data/.tmp-agg.mjs",
  src.replace(new RegExp(`${course}-chapters-batch(\\d+)"`, "g"), `${course}-chapters-batch$1.js"`)
);
const mod = await import("../app/courses-data/.tmp-agg.mjs");
const key = `${course}Chapters`;
const gkey = `${course}ChapterGroups`;
const chapters = mod[key];
const groups = mod[gkey];
unlinkSync("app/courses-data/.tmp-agg.mjs");

const problems = [];
const ids = new Map();
for (const ch of chapters) ids.set(ch.id, (ids.get(ch.id) || 0) + 1);
for (const [id, n] of ids) if (n > 1) problems.push(`[重复ID x${n}] ${id}`);
for (const ch of chapters) {
  if (!ch.title) problems.push(`[缺title] ${ch.id}`);
  if (!ch.group) problems.push(`[缺group] ${ch.id}`);
  if (!ch.content || ch.content.length < 50) problems.push(`[content过短] ${ch.id} len=${(ch.content || "").length}`);
  if (!ch.icon) problems.push(`[缺icon] ${ch.id}`);
  if (ch.group && groups && !groups.includes(ch.group)) problems.push(`[group未注册] ${ch.id}: ${ch.group}`);
}
if (groups) for (const g of groups) if (!chapters.some((c) => c.group === g)) problems.push(`[空分组] ${g}`);
// 分组顺序
let last = -1;
if (groups) for (const ch of chapters) {
  const idx = groups.indexOf(ch.group);
  if (idx >= 0 && idx < last) problems.push(`[分组顺序乱] ${ch.id}: ${ch.group}`);
  last = Math.max(last, idx);
}
console.log(`=== ${course} ===`);
console.log(`章节数: ${chapters.length} | 分组数: ${groups ? groups.length : "无groups"} | 问题: ${problems.length}`);
problems.slice(0, 40).forEach((p) => console.log(" -", p));
console.log("章节清单:");
chapters.forEach((ch, i) => console.log(`  ${i + 1}. ${ch.id} | ${ch.title} | ${ch.group}`));
