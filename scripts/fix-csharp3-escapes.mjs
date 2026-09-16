// 修复「反斜杠被 JS 模板字符串吞掉」的写法：
//   \d  →  \\d   （单个 \ 后面的字符不是合法 JS 转义时，反斜杠会被丢弃）
//   \n  →  \\n   （多行风格代码块里，\n 会被转成真实换行，撑破 C# 字符串）
// 合法、无需处理的转义：\\ \` \$ \" \' ；转义风格代码块里的 \n \t \r 表示换行/制表
import { readFileSync, writeFileSync } from "node:fs";
import { keyedBlocks } from "./csharp3-fix-lib.mjs";

const dry = process.argv.includes("--dry");

function fixBody(body) {
  const escapedStyle = !body.includes("\n");
  const keep = new Set(["\\", "`", "$", '"', "'"]);
  if (escapedStyle) for (const c of ["n", "t", "r"]) keep.add(c);
  let out = "";
  let changed = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "\\") {
      const c = body[i + 1];
      if (c === undefined) {
        out += body[i];
        continue;
      }
      if (keep.has(c)) {
        out += body[i] + c;
        i++;
        continue;
      }
      out += "\\\\" + c;
      changed++;
      i++;
      continue;
    }
    out += body[i];
  }
  return { out, changed };
}

let total = 0;
const report = [];
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const raw = readFileSync(file, "utf8");
  const blocks = keyedBlocks(raw);
  let out = "";
  let cursor = 0;
  let fileChanged = 0;
  for (const b of blocks) {
    const { out: newBody, changed } = fixBody(b.rawBody);
    if (!changed) continue;
    out += raw.slice(cursor, b.bodyStart) + newBody;
    cursor = b.bodyStart + b.rawBody.length;
    fileChanged += changed;
    report.push(`${b.key}: ${changed} 处`);
  }
  out += raw.slice(cursor);
  if (fileChanged) {
    total += fileChanged;
    if (!dry) writeFileSync(file, out, "utf8");
    console.log(`${file}: ${fileChanged} 处`);
  }
}
console.log(report.join("\n"));
console.log(`合计 ${total} 处（${dry ? "预演" : "已写入"}）`);
