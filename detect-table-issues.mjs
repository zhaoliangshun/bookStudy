// 检测并修复课程数据文件中 Markdown 表格里未转义的 |
// 只检测真正的表格（排除代码块中的 ASCII art）
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "app", "courses-data");

const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

let totalIssues = 0;
let totalFixed = 0;
const filesWithIssues = [];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  const issues = [];
  
  // 状态：是否在代码块中
  let inCodeBlock = false;
  let codeBlockMarker = null;
  
  // 表格检测状态
  let inTable = false;
  let headerColCount = 0;
  let tableLines = []; // [{ lineIdx, text }]
  
  function checkTable() {
    if (tableLines.length === 0) return;
    for (const { lineIdx, text } of tableLines) {
      // 跳过分隔行 | --- | --- |
      if (/^\|[\s:|-]+\|$/.test(text.trim())) continue;
      
      // 计算列数：把 \\| 替换为占位符，再按 | 分割
      const inner = text.trim();
      // 在源码中，转义的 | 是 \\|，未转义的是 |
      // 先把 \\| 替换为 \x00，再数 |，再加回来
      const cleaned = inner.replace(/\\\\\|/g, "\x00");
      const parts = cleaned.split("|");
      // parts[0] 是空（行首 |），parts[last] 是空（行尾 |）或非空（如果没有行尾 |）
      // 列数 = parts.length - 2（如果首尾都有 |）
      // 或者 parts.length - 1（如果只有行首 |）
      let colCount;
      if (parts[0] === "" && parts[parts.length - 1] === "") {
        colCount = parts.length - 2;
      } else if (parts[0] === "") {
        colCount = parts.length - 1;
      } else {
        colCount = parts.length - 1;
      }
      
      if (colCount > headerColCount) {
        issues.push({
          lineIdx,
          text,
          expectedCols: headerColCount,
          actualCols: colCount,
        });
      }
    }
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
      // 代码块边界，表格结束
      if (inTable) {
        checkTable();
        inTable = false;
        tableLines = [];
      }
      continue;
    }
    
    if (inCodeBlock) {
      if (inTable) {
        checkTable();
        inTable = false;
        tableLines = [];
      }
      continue;
    }
    
    // 表格检测：以 | 开头的行
    if (trimmed.startsWith("|")) {
      if (!inTable) {
        // 表头行
        inTable = true;
        const inner = trimmed;
        const cleaned = inner.replace(/\\\\\|/g, "\x00");
        const parts = cleaned.split("|");
        let colCount;
        if (parts[0] === "" && parts[parts.length - 1] === "") {
          colCount = parts.length - 2;
        } else if (parts[0] === "") {
          colCount = parts.length - 1;
        } else {
          colCount = parts.length - 1;
        }
        headerColCount = colCount;
        tableLines = [{ lineIdx: i, text: line }];
      } else {
        tableLines.push({ lineIdx: i, text: line });
      }
    } else {
      // 不以 | 开头，表格结束
      if (inTable) {
        checkTable();
        inTable = false;
        tableLines = [];
      }
    }
  }
  // 文件结束时
  if (inTable) {
    checkTable();
  }
  
  if (issues.length > 0) {
    totalIssues += issues.length;
    filesWithIssues.push({ file, issues, filePath });
    console.log(`\n${file} (${issues.length} 处问题):`);
    for (const issue of issues) {
      console.log(`  行 ${issue.lineIdx + 1}: 期望 ${issue.expectedCols} 列, 实际 ${issue.actualCols} 列`);
      console.log(`    ${issue.text.trim().substring(0, 120)}`);
    }
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log(`总计: ${filesWithIssues.length} 个文件, ${totalIssues} 处问题`);

// 输出文件列表供修复
console.log("\n需要修复的文件:");
for (const { file, issues } of filesWithIssues) {
  console.log(`  ${file}`);
}
