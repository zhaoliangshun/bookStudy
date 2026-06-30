const fs = require('fs');

const filePath = './app/ts3-chapters-batch3.js.bak';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// 问题开始于第 3314 行（0-indexed: 3313）的 ship_order 处理器
// 在此之前，第 3303 行是最后一个正确转义的行
// 从第 3316 行（throw new Error(`无法发货...）开始出现问题

// 我们需要修复的是 code 模板字符串内部的内容
// code 模板字符串以 ` 开头（前面是 code: ），以 ` 结尾（后面是 , 或换行然后 }）

// 更好的方法：逐行处理，跟踪我们是否在 code 模板字符串内
// 并在需要的地方添加转义

let result = [];
let inCodeBlock = false;
let codeBlockStartLine = -1;
let foundShipOrder = false;

for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  let line = lines[lineNum];
  
  // 检测 code: ` 开始
  if (line.includes('code: `') && !line.includes('code: \\`')) {
    inCodeBlock = true;
    codeBlockStartLine = lineNum;
    result.push(line);
    continue;
  }
  
  // 检测 code 块结束：行只包含 `, 或 ` 后跟 , 或 `); 等
  if (inCodeBlock) {
    const trimmed = line.trim();
    if (trimmed === '`,' || trimmed === '`' || 
        (trimmed.startsWith('`') && (trimmed.endsWith(',') || trimmed.endsWith('},') || trimmed.endsWith(');')))) {
      inCodeBlock = false;
      result.push(line);
      continue;
    }
  }
  
  if (inCodeBlock) {
    // 我们在 code 块内部
    // 从第 3316 行（1-indexed 即 lineNum 3315）开始，需要确保所有 ` 和 ${ 都被转义
    // 但要注意不要重复转义已经转义的 \` 和 \${
    
    let escaped = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const prev = i > 0 ? line[i - 1] : '';
      const next = i < line.length - 1 ? line[i + 1] : '';
      
      if (ch === '\\') {
        // 反斜杠，保留并保留后面的字符
        escaped += ch;
        if (next !== undefined) {
          escaped += next;
          i++;
        }
      } else if (ch === '`') {
        // 未转义的反引号，需要转义
        escaped += '\\`';
      } else if (ch === '$' && next === '{') {
        // 未转义的 ${，需要转义
        escaped += '\\${';
        i++; // 跳过 {
      } else {
        escaped += ch;
      }
    }
    result.push(escaped);
  } else {
    result.push(line);
  }
}

const output = result.join('\n');
fs.writeFileSync('./app/ts3-chapters-batch3.js', output, 'utf-8');
console.log('修复完成！');

// 验证
const vm = require('vm');
try {
  // 使用 node --check 验证（通过子进程）
  const { execSync } = require('child_process');
  execSync('node --check ./app/ts3-chapters-batch3.js', { encoding: 'utf-8' });
  console.log('✓ JavaScript 语法验证通过 (node --check)');
} catch (e) {
  console.log('✗ 语法错误:', e.message);
}
