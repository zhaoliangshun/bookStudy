const fs = require('fs');

const filePath = './app/ts3-chapters-batch3.js.bak';
const content = fs.readFileSync(filePath, 'utf-8');

// 分割为行
const lines = content.split('\n');
const output = [];

let inCodeBlock = false;
let codeContentLines = [];
let codeStartLineIndex = -1;

// 查找 code: ` 开始标记
function isCodeBlockStart(line) {
  // 匹配 "    code: `" 开头（有缩进，code: 后跟空格和反引号）
  return /^\s*code:\s*`$/.test(line) || /^\s*code:\s*`/.test(line);
}

// 查找 code 块结束标记
function isCodeBlockEnd(line) {
  const trimmed = line.trim();
  // 结束行应该是 `, 或 ` 后跟 , 或 ` 是行的最后一个有意义的字符（后跟逗号或右括号）
  return trimmed === '`,' || trimmed === '`' || 
         (trimmed.startsWith('`') && (trimmed.endsWith(',') || trimmed.endsWith('},') || trimmed.endsWith('});')));
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (!inCodeBlock && isCodeBlockStart(line)) {
    // 开始一个新的 code 块
    inCodeBlock = true;
    codeStartLineIndex = i;
    codeContentLines = [];
    
    // 检查 code: ` 是否在行尾（即内容从下一行开始）
    // 还是 code: `...content 在同一行
    const match = line.match(/^(\s*code:\s*)`(.*)$/);
    if (match) {
      const afterBacktick = match[2];
      if (afterBacktick && !isCodeBlockEnd(afterBacktick)) {
        // 同一行开始有内容
        codeContentLines.push(afterBacktick);
      }
    }
    output.push(line.substring(0, line.indexOf('`') + 1)); // 只输出到开始的 `
    continue;
  }
  
  if (inCodeBlock) {
    if (isCodeBlockEnd(line) && !line.includes('\\`')) {
      // 这是 code 块的结束行
      // 首先处理收集到的 code 内容，转义内部的 ` 和 ${
      const escapedContent = codeContentLines.map(contentLine => {
        return escapeCodeLine(contentLine);
      });
      
      // 输出转义后的内容
      for (const escapedLine of escapedContent) {
        output.push(escapedLine);
      }
      
      // 输出结束的 `,
      const trimmed = line.trim();
      const endBacktick = trimmed.startsWith('`,') ? '`,' : trimmed.startsWith('`') ? '`' : '`';
      const indent = line.substring(0, line.indexOf('`'));
      output.push(indent + endBacktick);
      
      inCodeBlock = false;
      codeContentLines = [];
      continue;
    } else {
      // 这是 code 块的内容行，收集起来
      codeContentLines.push(line);
      continue;
    }
  }
  
  output.push(line);
}

function escapeCodeLine(line) {
  // 转义一行 code 内容中未转义的 ` 和 ${
  let result = '';
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    const prev = j > 0 ? line[j - 1] : '';
    const next = j < line.length - 1 ? line[j + 1] : '';
    
    if (ch === '\\') {
      // 已经是转义字符，保留它和下一个字符
      result += ch;
      if (next) {
        result += next;
        j++;
      }
    } else if (ch === '`' && prev !== '\\') {
      // 未转义的反引号，转义它
      result += '\\`';
    } else if (ch === '$' && next === '{' && prev !== '\\') {
      // 未转义的 ${，转义它
      result += '\\${';
      j++; // 跳过 {
    } else {
      result += ch;
    }
  }
  return result;
}

const finalContent = output.join('\n');
fs.writeFileSync('./app/ts3-chapters-batch3.js', finalContent, 'utf-8');
console.log('修复完成！');

// 验证语法
try {
  const { execSync } = require('child_process');
  // 复制为 .mjs 进行严格的 ESM 语法检查
  fs.writeFileSync('/tmp/test_fixed.mjs', finalContent);
  execSync('node --check /tmp/test_fixed.mjs', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('✓ ESM 语法验证通过');
} catch (e) {
  console.log('✗ 语法错误:', e.stderr || e.message);
  // 找到错误行
  const match = (e.stderr || '').match(/:(\d+)$/m);
  if (match) {
    const errLine = parseInt(match[1]) - 1;
    console.log('\n错误行附近:');
    for (let l = Math.max(0, errLine - 3); l <= Math.min(output.length - 1, errLine + 3); l++) {
      console.log(`${l + 1}: ${output[l]}`);
    }
  }
}
