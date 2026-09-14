// csharp5 教程结构与内容检查脚本
import { readFileSync } from "fs";

const files = [
  "csharp5-chapters-batch1.js", "csharp5-chapters-batch2.js", "csharp5-chapters-batch3.js",
  "csharp5-chapters-batch4.js", "csharp5-chapters-batch5.js", "csharp5-chapters-batch6.js",
  "csharp5-chapters-batch7.js", "csharp5-chapters-batch8.js", "csharp5-chapters-batch9.js",
  "csharp5-chapters-batch10.js", "csharp5-chapters-batch11.js", "csharp5-chapters-batch12.js",
  "csharp5-chapters-batch13.js", "csharp5-chapters-batch14.js", "csharp5-chapters-batch15.js",
  "csharp5-chapters-batch16.js", "csharp5-chapters-batch17.js", "csharp5-chapters-production.js",
];

const all = [];
for (const f of files) {
  const m = await import(`../app/courses-data/${f}`);
  for (const arr of Object.values(m)) {
    if (Array.isArray(arr)) for (const c of arr) if (c && c.id && c.title) all.push(c);
  }
}

console.log("总章节数:", all.length);

// 1. ID 唯一性
const ids = all.map((c) => c.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log("1. 重复ID:", dupIds.length ? dupIds.join(",") : "无");

// 2. group 一致性
const groups = [...new Set(all.map((c) => c.group))];
console.log("2. 实际 group 列表:", JSON.stringify(groups));

// 3. 每章 code/lang 完整性
const noCode = all.filter((c) => !c.code || !c.lang);
console.log("3. 缺少 code/lang 的章节:", noCode.length ? noCode.map((c) => c.id).join(",") : "无");

// 4. csharp-run 代码块统计
let runFences = 0;
for (const c of all) runFences += (c.content.match(/```csharp-run/g) || []).length;
console.log("4. csharp-run 块总数:", runFences);
const chaptersNoRun = all.filter((c) => !/(```csharp-run)/.test(c.content));
console.log("   正文无 csharp-run 的章节:", chaptersNoRun.length ? chaptersNoRun.map((c) => c.id).join(",") : "无");

// 5. 主 demo 长度
const lens = all.map((c) => c.code.length);
console.log("5. 主demo平均长度:", Math.round(lens.reduce((a, b) => a + b, 0) / lens.length), "最短:", Math.min(...lens));
const shortest = all.filter((c) => c.code.length < 400).map((c) => c.id + "(" + c.code.length + ")");
console.log("   主demo过短(<400)章节:", shortest.join(", ") || "无");

// 6. 练习覆盖率
const noEx = all.filter((c) => !c.content.includes("练习"));
console.log("6. 无练习的章节:", noEx.length ? noEx.map((c) => c.id).join(",") : "无");
