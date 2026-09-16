// 阶段4：把出现在代码中间的 using 指令搬到文件开头
// C# 要求 using 指令必须在所有其它元素之前（CS1529 / CS1001）
import { splitMembers, applyTransform } from "./csharp3-fix-lib.mjs";

export function hoistUsings(code) {
  const members = splitMembers(code);
  const usings = members.filter((m) => m.kind === "using");
  if (!usings.length) return null;
  const firstOther = members.find((m) => m.kind !== "using");
  if (!firstOther) return null;
  const late = usings.filter((m) => m.start > firstOther.start);
  if (!late.length) return null;

  // 1. 挖掉靠后的 using 指令
  let head = "";
  let cursor = 0;
  for (const m of late) {
    head += code.slice(cursor, m.start);
    cursor = m.end;
  }
  head += code.slice(cursor);

  // 2. 收集所有 using 文本（保持顺序、去重）
  const texts = [];
  for (const m of usings) {
    const t = code.slice(m.start, m.end).trim();
    if (!texts.includes(t)) texts.push(t);
  }

  // 3. 插到最前面（注释之后）
  const lines = head.split("\n");
  let insertAt = 0;
  while (insertAt < lines.length) {
    const l = lines[insertAt].trim();
    if (l === "" || l.startsWith("//") || l.startsWith("/*") || l.startsWith("*")) {
      insertAt++;
      continue;
    }
    break;
  }
  const out = [...lines.slice(0, insertAt), ...texts, ...lines.slice(insertAt)];
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

const dry = process.argv.includes("--dry");
let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const changes = applyTransform(file, ({ code }) => hoistUsings(code), null, { dryRun: dry });
  if (changes.length) {
    console.log(`${file}: ${changes.length} 段 → ${changes.map((c) => c.key).join(", ")}`);
    total += changes.length;
  }
}
console.log(`合计 ${total} 段（${dry ? "预演" : "已写入"}）`);
