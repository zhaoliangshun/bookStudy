// 把 \\` （双反斜杠 + 反引号）还原为 \` （单反斜杠 + 反引号）
import { readFileSync, writeFileSync } from "fs";
const f = "/Users/test/bookStudy/app/courses-data/csharp5-chapters-batch17.js";
let s = readFileSync(f, "utf8");
const target = "\\\\" + "`";
const repl = "\\" + "`";
const n = s.split(target).length - 1;
s = s.split(target).join(repl);
writeFileSync(f, s, "utf8");
console.log(`还原 ${n} 处`);
