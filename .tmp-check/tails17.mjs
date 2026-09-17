import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";
for (let i = 126; i <= 135; i++) {
  const id = `csharp5-ch${i}`;
  const ch = csharp5Chapters.find((c) => c.id === id);
  if (!ch) continue;
  const c = ch.content || "";
  const at = c.indexOf("### 练习");
  console.log(`\n===== ${id} =====`);
  console.log("[练习前 350 字符]");
  console.log(c.slice(Math.max(0, at - 350), at));
  console.log("[练习内容]");
  console.log(c.slice(at, at + 500));
}
