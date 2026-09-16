// 把指定代码段标记为「不可运行片段」（csharp-snippet），去掉运行按钮
// 适用于：依赖 NuGet 的示例、项目文件片段、纯类型定义/纯注释片段
// 用法：node scripts/mark-csharp3-snippet.mjs csharp3-ch80#1 csharp3-ch80#3 ...
import { readFileSync, writeFileSync } from "node:fs";
import { keyedBlocks, scanBlocks } from "./csharp3-fix-lib.mjs";

const keys = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (!keys.length) {
  console.error("用法：node scripts/mark-csharp3-snippet.mjs <key...>");
  process.exit(1);
}
const keySet = new Set(keys);
const RUNNABLE = new Set(["csharp", "cs", "c#"]);

let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const raw = readFileSync(file, "utf8");
  const blocks = keyedBlocks(raw);
  let out = "";
  let cursor = 0;
  let changed = 0;
  for (const b of blocks) {
    if (!keySet.has(b.key) || !RUNNABLE.has(b.lang)) continue;
    const head = raw.slice(b.start, b.bodyStart);
    const newHead = head.replace(b.lang, "csharp-snippet");
    out += raw.slice(cursor, b.start) + newHead;
    cursor = b.bodyStart;
    changed++;
    total++;
    console.log(`标记 ${b.key} → csharp-snippet`);
  }
  out += raw.slice(cursor);
  if (changed) writeFileSync(file, out, "utf8");
}
console.log(`完成，共 ${total} 段`);
