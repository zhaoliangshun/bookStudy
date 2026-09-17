// 分析 csharp3 所有章节，找出需要修复的问题
import { readFileSync, writeFileSync } from "fs";

const files = [];
for (let i = 1; i <= 15; i++) files.push(`csharp3-chapters-batch${i}.js`);

const allChapters = [];

// 加载所有章节
for (const f of files) {
  const m = await import(`../app/courses-data/${f}`);
  for (const arr of Object.values(m)) {
    if (Array.isArray(arr)) {
      for (const c of arr) {
        if (c && c.id && c.title) {
          allChapters.push({
            file: f,
            id: c.id,
            title: c.title,
            group: c.group,
            content: c.content
          });
        }
      }
    }
  }
}

console.log(`总章节数: ${allChapters.length}\n`);

// 分析代码块
function extractCodeBlocks(content) {
  const blocks = [];
  const regex = /````csharp\n([\s\S]*?)````/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

// 常见问题检查
const issues = {
  chinesePunctuationInCode: [],  // 代码中的中文标点
  missingUsings: [],              // 缺少 using 语句
  consoleReadLine: [],            // 包含 Console.ReadLine
  fileOperations: [],             // 文件操作
  networkOperations: [],          // 网络操作
  duplicateDefinitions: [],       // 重复定义
  incompleteCode: [],             // 不完整代码
  topLevelAfterTypes: [],         // 类型定义后的顶级语句
};

allChapters.forEach(chapter => {
  const blocks = extractCodeBlocks(chapter.content);
  
  blocks.forEach((code, idx) => {
    const blockId = `${chapter.id}-block${idx + 1}`;
    
    // 检查中文标点（在字符串外的）
    const lines = code.split('\n');
    lines.forEach((line, lineNum) => {
      // 跳过注释行
      if (line.trim().startsWith('//')) return;
      
      // 检查是否在字符串内（简单判断）
      const stringContent = line.match(/"[^"]*"/g) || [];
      const codeWithoutStrings = line.replace(/"[^"]*"/g, '');
      
      // 在非字符串部分检查中文标点
      if (/[，：；（）【】]/.test(codeWithoutStrings)) {
        issues.chinesePunctuationInCode.push({
          id: blockId,
          line: lineNum + 1,
          content: line.trim().substring(0, 80)
        });
      }
    });
    
    // 检查 Console.ReadLine
    if (/Console\.ReadLine\s*\(\)/.test(code)) {
      issues.consoleReadLine.push({
        id: blockId,
        chapter: chapter.title
      });
    }
    
    // 检查文件操作
    if (/File\.(Read|Write|Delete|Move|Copy)/.test(code) || 
        /Directory\./.test(code) ||
        /StreamReader|StreamWriter/.test(code)) {
      issues.fileOperations.push({
        id: blockId,
        chapter: chapter.title
      });
    }
    
    // 检查网络操作
    if (/HttpClient|WebClient|Socket/.test(code)) {
      issues.networkOperations.push({
        id: blockId,
        chapter: chapter.title
      });
    }
    
    // 检查类型定义后的顶级语句
    if (/\n(namespace|class|interface|struct|enum|record)\s+\w+[\s\S]*?\n\s*Console\./.test(code)) {
      issues.topLevelAfterTypes.push({
        id: blockId,
        chapter: chapter.title
      });
    }
  });
});

// 输出报告
console.log("=== 问题分析报告 ===\n");

console.log(`1. 代码中的中文标点: ${issues.chinesePunctuationInCode.length} 处`);
if (issues.chinesePunctuationInCode.length > 0) {
  console.log("   前5个:");
  issues.chinesePunctuationInCode.slice(0, 5).forEach(p => {
    console.log(`   - ${p.id} 行${p.line}: ${p.content}`);
  });
}

console.log(`\n2. 需要用户输入的代码: ${issues.consoleReadLine.length} 处`);
console.log(`3. 文件操作代码: ${issues.fileOperations.length} 处`);
console.log(`4. 网络操作代码: ${issues.networkOperations.length} 处`);
console.log(`5. 类型定义后顶级语句: ${issues.topLevelAfterTypes.length} 处`);

// 保存详细报告
writeFileSync(
  '/tmp/csharp3-analysis.json',
  JSON.stringify(issues, null, 2)
);

console.log("\n详细报告已保存到: /tmp/csharp3-analysis.json");
