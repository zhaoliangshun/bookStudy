// 把指定行范围内、模板字符串内部的裸反引号转义为 \`
import { readFileSync, writeFileSync } from "fs";
const file = "/Users/test/bookStudy/app/courses-data/csharp5-chapters-batch17.js";
const FROM = parseInt(process.argv[2], 10) || 74;
const TO = parseInt(process.argv[3], 10) || 530;
const src = readFileSync(file, "utf8");
const lines = src.split("\n");
let n = 0;
for (let i = FROM - 1; i < Math.min(TO, lines.length); i++) {
  let l = lines[i];
  let out = "";
  for (let j = 0; j < l.length; j++) {
    const c = l[j];
    if (c === "`" && !(j > 0 && l[j - 1] === "\\")) {
      const after = l.slice(j + 1).trim();
      const isEnd = after === "" || /^[,;)\]]/.test(after);
      const before = l.slice(0, j).trimEnd();
      const isStart = /(?:content|code|title|group|icon|id|lang):\s*$/.test(before) || before === "";
      if (!isEnd && !isStart) { out += "\\`"; n++; continue; }
    }
    out += c;
  }
  lines[i] = out;
}
writeFileSync(file, lines.join("\n"), "utf8");
console.log(`已转义 ${n} 处反引号（行 ${FROM}-${TO}）`);
