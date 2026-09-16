// 阶段1：把「类型声明在语句之前」的代码段改为语句在前、类型在后
import { moveTypesAfterStatements, applyTransform } from "./csharp3-fix-lib.mjs";

const dryRun = process.argv.includes("--dry");
let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const changes = applyTransform(
    file,
    ({ code, lang }) => {
      if (lang === "csharp-snippet" || lang === "cs-snippet") return null;
      return moveTypesAfterStatements(code);
    },
    null,
    { dryRun }
  );
  if (changes.length) {
    console.log(`${file}: ${changes.length} 段已重排`);
    total += changes.length;
  }
}
console.log(`合计 ${total} 段（${dryRun ? "预演" : "已写入"}）`);
