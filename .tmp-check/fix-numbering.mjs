// 把每章 code 注释中的"第 X 章"统一修正为与正文标题一致的章号（章号 = 清单位置 - 1）
import { readFileSync, writeFileSync } from "fs";
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

const cn = ["零","一","二","三","四","五","六","七","八","九"];
function toCn(n) {
  if (n < 10) return cn[n];
  if (n < 20) return "十" + (n % 10 ? cn[n % 10] : "");
  if (n < 100) return cn[Math.floor(n / 10)] + "十" + (n % 10 ? cn[n % 10] : "");
  const h = Math.floor(n / 100), r = n % 100;
  let s = cn[h] + "百";
  if (r === 0) return s;
  if (r < 10) return s + "零" + cn[r];
  if (r < 20) return s + "一十" + (r % 10 ? cn[r % 10] : "");
  return s + cn[Math.floor(r / 10)] + "十" + (r % 10 ? cn[r % 10] : "");
}

// 1. 建立 id → 正确章号
const correct = new Map();
let idx = 0;
for (const ch of csharp5Chapters) {
  idx++;
  const m = (ch.content || "").match(/^##\s*第([零一二三四五六七八九十百]+)章/m);
  // 以正文标题为准；正文无编号时退化为 位置-1
  const hm = (ch.content || "").match(/^##\s*第([零一二三四五六七八九十百]+)章/m);
  correct.set(ch.id, hm ? hm[1] : toCn(idx - 1));
}

// 2. 扫描源文件，统计每章 code 中需要修正的注释
const files = [
  "csharp5-chapters-batch1.js","csharp5-chapters-batch2.js","csharp5-chapters-batch3.js",
  "csharp5-chapters-batch4.js","csharp5-chapters-batch5.js","csharp5-chapters-batch6.js",
  "csharp5-chapters-batch7.js","csharp5-chapters-batch8.js","csharp5-chapters-batch9.js",
  "csharp5-chapters-batch10.js","csharp5-chapters-batch11.js","csharp5-chapters-batch12.js",
  "csharp5-chapters-batch13.js","csharp5-chapters-batch14.js","csharp5-chapters-batch15.js",
  "csharp5-chapters-batch16.js","csharp5-chapters-batch17.js","csharp5-chapters-production.js",
];
const base = "/Users/test/bookStudy/app/courses-data/";

// 收集所有需要修改的（文件 → 修改列表）
const plan = [];
for (const f of files) {
  let src = readFileSync(base + f, "utf8");
  const lines = src.split("\n");
  const edits = [];
  for (let i = 0; i < lines.length; i++) {
    // 只匹配注释行首的章号：// 第X章 或 //第X章，且该行不是"参见/见/详"等交叉引用
    const m = lines[i].match(/^(\s*\/\/\s*)第([零一二三四五六七八九十百]+)章(.*)$/);
    if (!m) continue;
    const rest = m[3];
    // 排除交叉引用（形如"参见第X章"通常不在行首，这里已限制 // 开头；再排除"参见"）
    if (/参见|详见|见第/.test(rest.slice(0, 6))) continue;
    edits.push({ line: i + 1, oldNum: m[2], raw: lines[i] });
  }
  if (edits.length) plan.push({ f, lines, edits });
}

console.log("=== 需要修正的注释行（按文件）===");
let total = 0;
for (const p of plan) {
  console.log(`\n[${p.f}] ${p.edits.length} 处`);
  for (const e of p.edits) {
    // 找到该注释属于哪一章：向上找最近的 id: "csharp5-ch...
    let owner = null;
    for (let i = e.line - 1; i >= 0; i--) {
      const im = p.lines[i].match(/id:\s*["'](csharp5-[a-z0-9-]+)["']/);
      if (im) { owner = im[1]; break; }
    }
    const want = owner ? correct.get(owner) : null;
    const flag = want && want !== e.oldNum ? `→ 改为「第${want}章」` : (want ? "一致✓" : "??无归属");
    console.log(`  L${e.line} 第${e.oldNum}章 ${flag} | ${e.raw.trim().slice(0, 60)}`);
    if (want && want !== e.oldNum) total++;
  }
}
console.log(`\n需要修改总数: ${total}`);
if (process.argv.includes("--apply")) {
  let changed = 0;
  for (const p of plan) {
    let modified = false;
    for (const e of p.edits) {
      let owner = null;
      for (let i = e.line - 1; i >= 0; i--) {
        const im = p.lines[i].match(/id:\s*["'](csharp5-[a-z0-9-]+)["']/);
        if (im) { owner = im[1]; break; }
      }
      const want = owner ? correct.get(owner) : null;
      if (want && want !== e.oldNum) {
        p.lines[e.line - 1] = p.lines[e.line - 1].replace(/第[零一二三四五六七八九十百]+章/, `第${want}章`);
        modified = true;
        changed++;
      }
    }
    if (modified) writeFileSync(base + p.f, p.lines.join("\n"), "utf8");
  }
  console.log(`已应用修改: ${changed} 处`);
}
