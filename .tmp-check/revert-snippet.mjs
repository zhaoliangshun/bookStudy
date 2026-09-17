import { readFileSync, writeFileSync } from "fs";
const FILES = ["batch1","batch3","batch4","batch5","batch6","batch7","batch8","batch9","batch10"];
let n = 0;
for (const f of FILES) {
  const p = `app/courses-data/csharp2-chapters-${f}.js`;
  let s = readFileSync(p, "utf8");
  const before = s;
  s = s.replace(/\\`\\`\\`csharp-snippet/g, "\\`\\`\\`csharp");
  if (s !== before) { writeFileSync(p, s, "utf8"); n++; }
}
console.log("回退文件数:", n);
const left = FILES.reduce((a, f) => a + (readFileSync(`app/courses-data/csharp2-chapters-${f}.js`, "utf8").match(/csharp-snippet/g) || []).length, 0);
console.log("剩余 csharp-snippet 出现次数:", left);
