// 扫描模板字符串状态，找出在哪一行提前退出模板
import { readFileSync } from "fs";
const file = "/Users/test/bookStudy/app/courses-data/csharp5-chapters-batch17.js";
const src = readFileSync(file, "utf8");
let inT = false, line = 1;
const events = [];
for (let i = 0; i < src.length; i++) {
  const c = src[i];
  if (c === "\n") { line++; continue; }
  if (c === "\\") { i++; continue; } // 跳过转义字符
  if (c === "`") {
    inT = !inT;
    events.push({ line, to: inT, ctx: src.slice(Math.max(0, i - 60), i + 10).replace(/\n/g, "\\n") });
  }
}
console.log(`文件结束时的模板状态: ${inT ? "在模板内(异常)" : "在模板外(正常)"}`);
// 打印 ch126 补充区域内（L60-L140）的所有切换
console.log("\n=== L55-L140 的模板切换事件 ===");
for (const e of events.filter((e) => e.line >= 55 && e.line <= 140)) {
  console.log(`L${e.line} → ${e.to ? "进入模板" : "退出模板"} | ...${e.ctx.slice(-70)}`);
}
