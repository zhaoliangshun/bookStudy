// 临时脚本：检查 csharp5 教程结构完整性
import { csharp5Chapters, csharp5ChapterGroups } from "../app/courses-data/csharp5-tutorial-data.js";

const problems = [];

// 1. ID 重复检查
const idCount = new Map();
for (const ch of csharp5Chapters) {
  idCount.set(ch.id, (idCount.get(ch.id) || 0) + 1);
}
for (const [id, n] of idCount) {
  if (n > 1) problems.push(`[重复ID x${n}] ${id}`);
}

// 2. 章节字段完整性
for (const ch of csharp5Chapters) {
  if (!ch.id) problems.push(`[缺失ID] title=${ch.title}`);
  if (!ch.title) problems.push(`[缺失title] id=${ch.id}`);
  if (!ch.group) problems.push(`[缺失group] id=${ch.id}`);
  if (!ch.content || ch.content.length < 50) problems.push(`[content过短: ${(ch.content||'').length}] id=${ch.id}`);
  if (!ch.code) problems.push(`[缺失code] id=${ch.id}`);
  if (!ch.icon) problems.push(`[缺失icon] id=${ch.id}`);
  // 3. group 必须在 groups 列表中
  if (ch.group && !csharp5ChapterGroups.includes(ch.group)) {
    problems.push(`[group未注册] id=${ch.id} group="${ch.group}"`);
  }
}

// 4. groups 列表中没有章节的分组
for (const g of csharp5ChapterGroups) {
  if (!csharp5Chapters.some((c) => c.group === g)) {
    problems.push(`[空分组] "${g}"`);
  }
}

// 5. 分组顺序与章节顺序是否一致（章节应按 groups 顺序出现）
let lastGroupIdx = -1;
for (const ch of csharp5Chapters) {
  const idx = csharp5ChapterGroups.indexOf(ch.group);
  if (idx < lastGroupIdx) {
    problems.push(`[分组顺序乱] id=${ch.id} group="${ch.group}"(idx ${idx}) 出现在 idx ${lastGroupIdx} 之后`);
  }
  lastGroupIdx = Math.max(lastGroupIdx, idx);
}

// 6. code 中的常见 C# 语法可疑点（快速启发式）
const suspiciousPatterns = [
  { re: /using\s+\w+;\s*using\s+\w+;/, desc: "可能重复 using（误报忽略）" },
];
for (const ch of csharp5Chapters) {
  if (!ch.code) continue;
  if (!/namespace|class|record|interface|enum|delegate|\/\/|using/.test(ch.code)) {
    problems.push(`[code疑似非C#] id=${ch.id}`);
  }
}

console.log(`总章节数: ${csharp5Chapters.length}`);
console.log(`分组数: ${csharp5ChapterGroups.length}`);
console.log(`问题数: ${problems.length}`);
for (const p of problems) console.log(" -", p);

// 输出全部章节清单（按顺序）
console.log("\n=== 章节清单 ===");
for (const ch of csharp5Chapters) {
  console.log(`${ch.group} | ${ch.title} | ${ch.id} | content:${(ch.content||'').length} code:${(ch.code||'').length}`);
}
