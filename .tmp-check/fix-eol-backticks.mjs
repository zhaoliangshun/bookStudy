// 修复：行内代码结尾漏转义的反引号（位于行尾、未转义、后面没有 , 或 ;）
import { readFileSync, writeFileSync } from "fs";
const f = "/Users/test/bookStudy/app/courses-data/csharp5-chapters-batch17.js";
const FROM = parseInt(process.argv[2], 10) || 74;
const TO = parseInt(process.argv[3], 10) || 560;
const lines = readFileSync(f, "utf8").split("\n");
let n = 0;
for (let i = FROM - 1; i < Math.min(TO, lines.length); i++) {
  const l = lines[i];
  // 行尾（忽略 \r）是未转义反引号 → 必然是行内代码结尾漏转义（合法模板结束是 `, 或 `;）
  if (/[^\\]`\r?$/.test(l)) {
    lines[i] = l.replace(/([^\\])`(\r?)$/, "$1\\`$2");
    n++;
    console.log(`L${i + 1}: ${l.trim().slice(-70)}`);
  }
}
writeFileSync(f, lines.join("\n"), "utf8");
console.log(`已修复 ${n} 处行尾漏转义`);
