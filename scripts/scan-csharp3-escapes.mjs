// 扫描「反斜杠被 JS 模板字符串吞掉」的写法
// 模板字符串里单个 \X：X 不是合法转义时被丢弃（如 \d → d），
// 是合法转义时被转成控制字符（如 \b → 退格）——两者都会破坏 C# 代码
import { readFileSync } from "node:fs";
import { keyedBlocks } from "./csharp3-fix-lib.mjs";

// JS 合法转义
const VALID = new Set(["n", "t", "r", "b", "f", "v", "0", "x", "u", "\\", "`", "$", "'", '"', "\n"]);

let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const raw = readFileSync(file, "utf8");
  for (const b of keyedBlocks(raw)) {
    const body = b.rawBody;
    // 判断风格：整段写成一行、用 \n 表示换行
    const escapedStyle = !body.includes("\n");
    const hits = [];
    for (let idx = 0; idx < body.length; idx++) {
      if (body[idx] !== "\\") continue;
      const c = body[idx + 1];
      if (c === undefined) continue;
      if (VALID.has(c)) {
        if (escapedStyle && "ntr".includes(c)) continue; // 该风格下 \n 是合法换行
        if (c === "\\" || c === "`" || c === "$") {
          idx++;
          continue;
        }
        hits.push({ idx, seq: "\\" + c, kind: "control" });
        idx++;
        continue;
      }
      hits.push({ idx, seq: "\\" + c, kind: "dropped" });
      idx++;
    }
    if (!hits.length) continue;
    total += hits.length;
    console.log(`\n### ${b.key} (${escapedStyle ? "转义风格" : "多行风格"}) ${hits.length} 处`);
    for (const h of hits.slice(0, 12)) {
      const start = Math.max(0, h.idx - 30);
      console.log(
        `   [${h.kind}] ...${body.slice(start, h.idx + 40).replace(/\n/g, "⏎")}...`
      );
    }
  }
}
console.log(`\n合计可疑 ${total} 处`);
