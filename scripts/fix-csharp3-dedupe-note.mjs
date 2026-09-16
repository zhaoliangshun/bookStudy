// 清理重复插入的「说明」注释（多次运行重排脚本可能产生）
import { readFileSync, writeFileSync } from "node:fs";

const L1 = "// 说明：C# 的顶级语句必须写在类型声明之前，";
const L2 = "// 所以演示代码放在前面，类型定义放在文件末尾。";

function isBlankOrComment(line) {
  const t = line.trim();
  return t === "" || t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const raw = readFileSync(file, "utf8");
  const lines = raw.split("\n");
  const drop = new Set();
  const hits = [];
  for (let idx = 0; idx < lines.length - 1; idx++) {
    if (lines[idx].trim() === L1 && lines[idx + 1].trim() === L2) hits.push(idx);
  }
  for (let k = 1; k < hits.length; k++) {
    const prev = hits[k - 1];
    const cur = hits[k];
    // 若两个说明之间只有空行/注释（没有代码），说明是重复插入，删掉后一个
    let onlyComments = true;
    for (let j = prev + 2; j < cur; j++) {
      if (!isBlankOrComment(lines[j])) {
        onlyComments = false;
        break;
      }
    }
    if (onlyComments) {
      drop.add(cur);
      drop.add(cur + 1);
      total++;
    }
  }
  if (drop.size) {
    const out = lines.filter((_, idx) => !drop.has(idx));
    writeFileSync(file, out.join("\n"), "utf8");
    console.log(`${file}: 去掉 ${drop.size / 2} 处重复说明`);
  }
}
console.log(`合计 ${total} 处`);
