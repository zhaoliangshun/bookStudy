import { readFileSync, writeFileSync } from "fs";

const p = "app/courses-data/csharp2-chapters-batch10.js";
const lines = readFileSync(p, "utf8").split("\n");

// 找到两个目标块：调试技巧章（靠前）与综合项目终章（靠后）
let debugIdx = -1, finalIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\s*id: "csharp2-ch53"/.test(lines[i])) {
    if (debugIdx === -1) debugIdx = i;
    else finalIdx = i;
  }
}
if (debugIdx === -1 || finalIdx === -1) {
  console.log("未定位到两个章节"); process.exit(1);
}
// 靠前的（调试技巧）= 第五十二章；靠后的（综合项目+结语）= 第五十三章
lines[debugIdx] = lines[debugIdx].replace("csharp2-ch53", "csharp2-ch52");
lines[finalIdx] = lines[finalIdx].replace("csharp2-ch53", "csharp2-ch53"); // 已是终章
writeFileSync(p, lines.join("\n"), "utf8");
console.log(`调试技巧章(行${debugIdx + 1}) -> ch52；终章(行${finalIdx + 1}) -> ch53`);
