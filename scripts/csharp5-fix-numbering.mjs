// csharp5 章节小节编号修复脚本
// 1) 把「小结/本章小结」小节移动到「练习」之前
// 2) 按出现顺序重排 "### N、" 形式的小节编号（含 "N点、" 异形）
// 3) 不动非编号栏目（十日落地、答辩常见问、练习等）
import { readFileSync, writeFileSync } from "fs";

const CN = ["一","二","三","四","五","六","七","八","九","十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
  "二十一","二十二","二十三","二十四","二十五","二十六","二十七","二十八","二十九","三十"];

// [file, chapterId] 列表：仅处理确认过乱序的章节
const targets = [
  ["csharp5-chapters-batch3.js", "csharp5-ch12"],
  ["csharp5-chapters-batch3.js", "csharp5-ch13"],
  ["csharp5-chapters-batch3.js", "csharp5-ch14"],
  ["csharp5-chapters-batch3.js", "csharp5-ch15"],
  ["csharp5-chapters-batch3.js", "csharp5-ch16"],
  ["csharp5-chapters-batch3.js", "csharp5-ch17"],
  ["csharp5-chapters-batch6.js", "csharp5-ch31"],
  ["csharp5-chapters-batch10.js", "csharp5-ch52"],
  ["csharp5-chapters-batch10.js", "csharp5-ch53"],
  ["csharp5-chapters-batch10.js", "csharp5-ch55"],
  ["csharp5-chapters-batch13.js", "csharp5-ch64"],
  ["csharp5-chapters-production.js", "csharp5-ch107"],
  ["csharp5-chapters-production.js", "csharp5-ch112"],
];

const byFile = new Map();
for (const [f, id] of targets) {
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f).push(id);
}

for (const [file, ids] of byFile) {
  const path = `/Users/test/bookStudy/app/courses-data/${file}`;
  let src = readFileSync(path, "utf8");

  for (const id of ids) {
    // 定位章节 content 模板字面量：id: 'csharp5-xxx', ... content: `...`,
    // 通过运行时导入拿到 content 再修改太复杂；直接在源文本里按 id 找到该章对象的 content 区域。
    const idIdx = Math.max(
      src.indexOf(`id: '${id}'`),
      src.indexOf(`id: "${id}"`)
    );
    if (idIdx === -1) { console.log("未找到", id); continue; }
    // content: ` 后面的模板字面量（教程内容不含未转义反引号，除注释/围栏用 \` 转义）
    const contentStart = src.indexOf("content: `", idIdx);
    if (contentStart === -1) { console.log("未找到 content", id); continue; }
    const contentEnd = src.indexOf("`,", contentStart); // 模板字面量结束（},\n 或 `,\n）
    let content = src.slice(contentStart + 10, contentEnd);

    const before = content;

    // --- 拆小节块：以 ### 开头 ---
    const lines = content.split("\n");
    const headerRe = /^### /;
    let blocks = []; // {headerIdx, header, start, end}
    let headerPositions = [];
    lines.forEach((l, i) => { if (headerRe.test(l)) headerPositions.push(i); });

    // 找出「小结」块
    let summaryIdx = headerPositions.findIndex((p) => /^### [一二三四五六七八九十]+、(本章)?小结/.test(lines[p]));
    let exerciseIdx = headerPositions.findIndex((p) => /^### 练习/.test(lines[p]));

    if (summaryIdx !== -1 && exerciseIdx !== -1 && summaryIdx > exerciseIdx) {
      // 小结在练习之后（不该出现），跳过移动
    }

    // 重建：把 header 列表按新顺序排
    let newOrder = headerPositions.map((p) => p);
    if (summaryIdx !== -1 && exerciseIdx !== -1 && summaryIdx < exerciseIdx) {
      // 小结移到练习之前
      const sumPos = headerPositions[summaryIdx];
      const exPos = headerPositions[exerciseIdx];
      // 小结后面到练习之前可能还有其他小节，需要整体后移
      const between = headerPositions.filter((p) => p > sumPos && p < exPos);
      if (between.length > 0) {
        // 提取块并重排
        const getBlock = (start) => {
          const next = headerPositions.find((p) => p > start);
          return lines.slice(start, (next ?? lines.length));
        };
        const sumBlock = getBlock(sumPos);
        const before_ = lines.slice(0, sumPos);
        const afterBlocks = [];
        for (const p of between) afterBlocks.push(getBlock(p));
        const rest = lines.slice(exPos);
        // 练习块是 rest 中 ### 练习 起始的部分；练习前面的内容（属于 between 最后一块的尾部）已包含
        content = [...before_, ...afterBlocks, ...sumBlock, ...rest].join("\n");
      }
    }

    // --- 重排编号 ---
    // 重新扫描（content 可能已变）
    const re = /^### ([一二三四五六七八九十]+)(点)?、/;
    let n = 0;
    content = content
      .split("\n")
      .map((l) => {
        const m = l.match(re);
        if (m) {
          const num = CN[n++] ?? String(n);
          return l.replace(re, `### ${num}、`);
        }
        return l;
      })
      .join("\n");

    if (content !== before) {
      src = src.slice(0, contentStart + 10) + content + src.slice(contentEnd);
      console.log(`已修复 ${id}`);
    } else {
      console.log(`无变化 ${id}`);
    }
  }
  writeFileSync(path, src, "utf8");
}
console.log("完成");
