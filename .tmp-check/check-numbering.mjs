// 检查全书章节编号：正文首个 ## 标题 vs id 序号 vs demo 注释中的"第 X 章"
import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";

const cn = ["零","一","二","三","四","五","六","七","八","九"];
function toCn(n) {
  if (n < 10) return cn[n];
  if (n < 20) return "十" + (n % 10 ? cn[n % 10] : "");
  if (n < 100) return cn[Math.floor(n / 10)] + "十" + (n % 10 ? cn[n % 10] : "");
  const h = Math.floor(n / 100), r = n % 100;
  let s = cn[h] + "百";
  if (r === 0) return s;
  if (r < 10) return s + "零" + cn[r];
  if (r < 20) return s + "一十" + (r % 10 ? cn[r % 10] : "");
  return s + cn[Math.floor(r / 10)] + "十" + (r % 10 ? cn[r % 10] : "");
}

let idx = 0;
const rows = [];
for (const ch of csharp5Chapters) {
  idx++;
  const m = (ch.content || "").match(/^##\s*(.+)$/m);
  const heading = m ? m[1].trim() : "(无)";
  const hm = heading.match(/^第([零一二三四五六七八九十百]+)章/);
  const codeM = (ch.code || "").match(/\/\/\s*第([零一二三四五六七八九十百]+)章/);
  rows.push({ idx, id: ch.id, heading: heading.slice(0, 40), headNum: hm ? hm[1] : null, codeNum: codeM ? codeM[1] : null });
}

// 统计：正文标题编号 与 位置 idx 的关系
let mismatchPos = 0, mismatchId = 0, codeMismatch = 0;
console.log("位置 | id | 正文标题 | 正文编号 | demo注释编号");
for (const r of rows) {
  if (!r.headNum) continue;
  const expectByPos = toCn(r.idx);
  const idNum = parseInt((r.id.match(/ch(\d+)$/) || [])[1] || "0", 10);
  const expectById = toCn(idNum);
  const byPos = r.headNum === expectByPos ? "pos✓" : "pos✗";
  const byId = r.headNum === expectById ? "id✓" : "id✗";
  if (r.headNum !== expectByPos) mismatchPos++;
  if (r.headNum !== expectById) mismatchId++;
  if (r.codeNum && r.codeNum !== r.headNum) codeMismatch++;
  console.log(`${r.idx} | ${r.id} | ${r.heading} | ${r.headNum}(${byPos},${byId}) | ${r.codeNum ?? "-"}${r.codeNum && r.codeNum !== r.headNum ? " ←与正文不一致" : ""}`);
}
console.log(`\n正文编号≠位置序号: ${mismatchPos} 章；正文编号≠id序号: ${mismatchId} 章；demo注释≠正文: ${codeMismatch} 章`);
