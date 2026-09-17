import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";
const ids = [];
for (let i = 126; i <= 135; i++) ids.push(`csharp5-ch${i}`);
for (const id of ids) {
  const ch = csharp5Chapters.find((c) => c.id === id);
  if (!ch) continue;
  const lines = (ch.content || "").split("\n");
  const heads = lines.filter((l) => /^#{2,3}\s/.test(l));
  console.log(`\n===== ${id} | ${ch.title} | content=${(ch.content || "").length} code=${(ch.code || "").length} =====`);
  console.log(heads.join(" | "));
  console.log("--- 是否有生产检查:", /###\s*生产检查/.test(ch.content || "") ? "有" : "无");
  // 打印正文开头 600 字符以了解风格
  console.log("--- 开头 ---");
  console.log((ch.content || "").slice(0, 500).replace(/\n/g, "\n"));
}
