// 回退 fix-table-issues.mjs 的修改：把表格行中的 \\| 还原为 |
// parseTableRow 修复后能正确处理反引号内的 |，不需要在数据文件中转义
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "app", "courses-data");

const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

let totalReverted = 0;
const revertedFiles = [];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf-8");
  
  // 在模板字符串源码中，fix-table-issues.mjs 把 | 改成了 \\|
  // 回退：把 \\| 改回 |
  // 注意：只回退 \\|，不回退其他修改（如注释增强）
  if (content.includes("\\\\|")) {
    const newContent = content.replace(/\\\\\|/g, "|");
    if (newContent !== content) {
      const count = (content.match(/\\\\\|/g) || []).length;
      fs.writeFileSync(filePath, newContent, "utf-8");
      totalReverted += count;
      revertedFiles.push({ file, count });
    }
  }
}

console.log(`回退完成: ${revertedFiles.length} 个文件, ${totalReverted} 处还原`);
for (const { file, count } of revertedFiles) {
  console.log(`  ${file} (${count} 处)`);
}
