// 打印指定代码段在源文件里的原始文本（含行号），便于做定点修改
// 用法：node scripts/show-csharp3-raw.mjs csharp3-ch12#1 [csharp3-ch12#2 ...]
import { readFileSync } from "node:fs";
import { keyedBlocks } from "./csharp3-fix-lib.mjs";

const keys = process.argv.slice(2);
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const raw = readFileSync(file, "utf8");
  for (const b of keyedBlocks(raw)) {
    if (!keys.includes(b.key)) continue;
    const startLine = raw.slice(0, b.bodyStart).split("\n").length;
    const endLine = startLine + b.rawBody.split("\n").length - 1;
    console.log(`\n########## ${b.key}  ${file}  行 ${startLine}-${endLine} ##########`);
    const lines = raw.split("\n").slice(startLine - 1, endLine);
    lines.forEach((l, idx) => console.log(`${String(startLine + idx).padStart(5)}| ${l}`));
  }
}
