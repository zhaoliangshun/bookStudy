// 找出模板字符串内部未转义的裸反引号（会导致语法错误）
import { readFileSync } from "fs";
const file = "/Users/test/bookStudy/app/courses-data/csharp5-chapters-batch17.js";
const src = readFileSync(file, "utf8");
const lines = src.split("\n");
const bad = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  for (let j = 0; j < l.length; j++) {
    if (l[j] !== "`") continue;
    if (j > 0 && l[j - 1] === "\\") continue; // 已转义
    // 判断是否为模板边界：反引号后紧跟 , ; ) 或行尾，或前面是 code:/content: 的开头
    const after = l.slice(j + 1).trim();
    const isEnd = after === "" || /^[,;)\]]/.test(after);
    const before = l.slice(0, j).trimEnd();
    const isStart = /(?:content|code|title|group|icon|id|lang):\s*$/.test(before) || before === "";
    if (!isEnd && !isStart) {
      bad.push({ line: i + 1, col: j, text: l });
    }
  }
}
console.log(`可疑裸反引号: ${bad.length} 处`);
for (const b of bad) console.log(`L${b.line}: ${b.text.trim().slice(0, 120)}`);
