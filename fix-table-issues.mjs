// 自动修复课程数据文件中 Markdown 表格里未转义的 |
// 只修复真正的表格（必须有 | --- | 分隔行才算表格）
// 修复方式：把单元格内容中的 | 转义为 \\|（在模板字符串源码中）
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "app", "courses-data");

const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

let totalFixed = 0;
const fixedFiles = [];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  const originalContent = content;
  
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBlockMarker = null;
  
  // 表格检测
  let inTable = false;
  let headerColCount = 0;
  let tableStartIdx = -1;
  
  function isSeparatorLine(line) {
    const t = line.trim();
    // | --- | --- | 或 |:---:|---:|
    return /^\|[\s:|-]+$/.test(t) && t.includes("-");
  }
  
  function countCols(line) {
    // 计算列数：把 \\| 替换为占位符，再按 | 分割
    const inner = line.trim();
    const cleaned = inner.replace(/\\\\\|/g, "\x00");
    const parts = cleaned.split("|");
    if (parts[0] === "" && parts[parts.length - 1] === "") {
      return parts.length - 2;
    } else if (parts[0] === "") {
      return parts.length - 1;
    } else {
      return parts.length - 1;
    }
  }
  
  // 修复一行的内容：把单元格内容中的未转义 | 转义为 \\|
  function fixLine(line, expectedCols) {
    const trimmed = line.trimStart();
    const leading = line.substring(0, line.length - trimmed.length);
    const t = trimmed.trimEnd();
    const trailing = line.substring(line.length - (trimmed.length - t.length));
    
    // 去掉首尾的 |
    let startsWithPipe = t.startsWith("|");
    let endsWithPipe = t.endsWith("|");
    let inner = t;
    if (startsWithPipe) inner = inner.substring(1);
    if (endsWithPipe) inner = inner.substring(0, inner.length - 1);
    
    // 把已有的 \\| 保护起来
    inner = inner.replace(/\\\\\|/g, "\x00");
    
    // 现在内层只剩下未转义的 |，需要转义它们
    // 但要小心：如果 | 是用来分隔单元格的，我们不能转义
    // 策略：按 | 分割，得到各单元格内容，然后把每个单元格内容中的 | 转义
    // 但问题是：如果内容里有 |，分割后单元格数会多于 expectedCols
    // 我们需要把多余的 | 合并回去
    
    const cells = inner.split("|");
    // cells.length - 1 = 当前的 | 数量
    // 我们需要把单元格数减少到 expectedCols
    // 即 cells.length 减少到 expectedCols + 1（因为首尾没有 | 后，n 列 = n-1 个 |）
    // 不对，去掉首尾 | 后，n 列应该有 n-1 个 |，所以 cells 应该有 n 个元素
    // 等等，如果原来首尾都有 |（标准表格），去掉后：
    // | a | b | → " a | b " → split("|") → [" a ", " b ", " "] 
    // 但最后一个 " " 是因为末尾 | 后面没有内容... 不对
    // | a | b | → 去掉首 | → " a | b |" → 去掉尾 | → " a | b " 
    // → split("|") → [" a ", " b "] → 2 列 ✓
    
    // 如果内容里有 |：| a | c | d | → " a | c | d " 
    // → split("|") → [" a ", " c ", " d "] → 3 列（如果 expected 是 2 列）
    // 我们需要把 [" a ", " c ", " d "] 合并成 2 个单元格
    // 但怎么知道哪些该合并？这很难自动判断...
    
    // 更好的方法：逐个检查单元格，如果某单元格内容看起来像表格分隔符（前后有空格），就不合并
    // 如果单元格内容里有 | 的迹象（比如类型联合 A | B），就合并
    
    // 算了，用另一种策略：只在内容里有明确的 | 需要转义时才修复
    // 具体来说：如果 cells.length > expectedCols + (startsWithPipe ? 0 : 0)
    // 且能识别出哪些 | 应该转义
    
    // 实际上，让我用更简单的策略：
    // 如果当前列数比期望多 N，说明有 N 个 | 需要转义
    // 从左到右扫描，找到第一个不在反引号内的 |，转义它
    // 重复 N 次
    
    if (cells.length <= expectedCols) {
      return line; // 不需要修复
    }
    
    let needEscape = cells.length - expectedCols;
    
    // 重建 inner：把多余的 | 转义
    // 从右到左扫描，找到需要转义的 |（不在反引号内的）
    let result = "";
    let escaped = 0;
    let inBacktick = false;
    
    // 重新处理：先把 \\| 恢复回去（用 \x01 代替 |，后续再还原）
    let working = inner.replace(/\x00/g, "\\|");
    
    // 逐字符扫描
    let i = 0;
    while (i < working.length && escaped < needEscape) {
      const ch = working[i];
      if (ch === "`") {
        inBacktick = !inBacktick;
      }
      if (ch === "|" && !inBacktick) {
        // 这个 | 需要转义
        result = working.substring(0, i) + "\\|" + working.substring(i + 1);
        working = result;
        i += 2; // 跳过 \|
        escaped++;
      } else {
        i++;
      }
    }
    
    // 重新组装
    let fixed = working;
    if (startsWithPipe) fixed = "|" + fixed;
    if (endsWithPipe) fixed = fixed + "|";
    
    return leading + fixed + trailing;
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 代码块检测
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      const marker = trimmed.substring(0, 3);
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockMarker = marker;
      } else if (marker === codeBlockMarker) {
        inCodeBlock = false;
        codeBlockMarker = null;
      }
      if (inTable) {
        inTable = false;
      }
      continue;
    }
    
    if (inCodeBlock) {
      if (inTable) inTable = false;
      continue;
    }
    
    // 表格检测
    if (trimmed.startsWith("|")) {
      if (!inTable) {
        // 可能是表头，检查下一行是否是分隔行
        if (i + 1 < lines.length && isSeparatorLine(lines[i + 1])) {
          inTable = true;
          headerColCount = countCols(line);
          tableStartIdx = i;
        }
      }
      
      if (inTable) {
        // 跳过分隔行
        if (isSeparatorLine(line)) continue;
        
        // 检查并修复这一行
        const fixed = fixLine(line, headerColCount);
        if (fixed !== line) {
          lines[i] = fixed;
          totalFixed++;
          if (!fixedFiles.includes(file)) {
            fixedFiles.push(file);
          }
        }
      }
    } else {
      inTable = false;
    }
  }
  
  // 写回文件
  const newContent = lines.join("\n");
  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent, "utf-8");
  }
}

console.log(`修复完成: ${fixedFiles.length} 个文件, ${totalFixed} 处修复`);
for (const f of fixedFiles) {
  console.log(`  ${f}`);
}
