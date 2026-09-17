import { csharp2Chapters, csharp2ChapterGroups } from "../app/courses-data/csharp2-tutorial-data.js";

const problems = [];
// ID 重复
const ids = new Map();
for (const ch of csharp2Chapters) ids.set(ch.id, (ids.get(ch.id) || 0) + 1);
for (const [id, n] of ids) if (n > 1) problems.push(`[重复ID x${n}] ${id}`);
// 字段完整
for (const ch of csharp2Chapters) {
  if (!ch.title) problems.push(`[缺title] ${ch.id}`);
  if (!ch.group) problems.push(`[缺group] ${ch.id}`);
  if (!ch.content || ch.content.length < 50) problems.push(`[content过短] ${ch.id}`);
  if (!ch.code) problems.push(`[缺code] ${ch.id}`);
  if (!ch.icon) problems.push(`[缺icon] ${ch.id}`);
  if (ch.group && !csharp2ChapterGroups.includes(ch.group)) problems.push(`[group未注册] ${ch.id}: ${ch.group}`);
}
// 空分组
for (const g of csharp2ChapterGroups) if (!csharp2Chapters.some((c) => c.group === g)) problems.push(`[空分组] ${g}`);
// 分组顺序
let last = -1;
for (const ch of csharp2Chapters) {
  const idx = csharp2ChapterGroups.indexOf(ch.group);
  if (idx < last) problems.push(`[分组顺序乱] ${ch.id}: ${ch.group}(idx ${idx}) 在 idx ${last} 后`);
  last = Math.max(last, idx);
}
console.log(`章节数: ${csharp2Chapters.length} | 分组数: ${csharp2ChapterGroups.length} | 问题: ${problems.length}`);
for (const p of problems) console.log(" -", p);
console.log("\n=== 章节顺序 ===");
for (const ch of csharp2Chapters) console.log(`${ch.group} | ${ch.title} | ${ch.id} | content:${(ch.content||'').length} code:${(ch.code||'').length}`);
