// 修复：行首行内代码反引号漏转义（被误判为模板开始）
import { readFileSync, writeFileSync } from "fs";
const f = "/Users/test/bookStudy/app/courses-data/csharp5-chapters-batch17.js";
const FROM = parseInt(process.argv[2], 10) || 74;
const TO = parseInt(process.argv[3], 10) || 560;
const lines = readFileSync(f, "utf8").split("\n");
let n = 0;
for (let i = FROM - 1; i < Math.min(TO, lines.length); i++) {
  let l = lines[i];
  const m = l.match(/^(\s*)`/);
  if (!m) continue;
  // 合法的模板开始行：content:/code:/title: 等字段后紧跟反引号（反引号后还有内容或到行尾）
  const isFieldStart = /^\s*(?:content|code|title|group|icon|id|lang|desc):\s*`/.test(l);
  const isTemplateEnd = /^\s*`[,;]?\s*$/.test(l); // 模板结束行：只有反引号（+逗号/分号）
  if (isFieldStart || isTemplateEnd) continue;
  l = l.replace(/^(\s*)`/, "$1\\`");
  lines[i] = l;
  n++;
  console.log(`L${i + 1}: ${l.trim().slice(0, 70)}`);
}
writeFileSync(f, lines.join("\n"), "utf8");
console.log(`已修复 ${n} 处行首漏转义`);
