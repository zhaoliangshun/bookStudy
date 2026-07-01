const fs = require('fs');

const filePath = './app/ts3-chapters-batch3.js.bak';
const content = fs.readFileSync(filePath, 'utf-8');

let result = '';
let i = 0;
let state = 'normal'; // normal, in_code
let codeStartMarker = 'code: `';

// 我们需要逐个字符处理
while (i < content.length) {
  if (state === 'normal') {
    // 检查是否遇到 code: `
    if (content.substring(i, i + codeStartMarker.length) === codeStartMarker) {
      // 找到 code 块开始
      result += codeStartMarker; // 输出 code: `（不转义开始的反引号）
      i += codeStartMarker.length;
      state = 'in_code';
      continue;
    }
    result += content[i];
    i++;
  } else if (state === 'in_code') {
    // 在 code 块内部，需要转义未转义的 ` 和 ${
    // 但要注意结束的反引号：它通常单独一行，后面跟着 , 或换行和 }
    
    // 检查是否遇到转义字符
    if (content[i] === '\\') {
      // 保留反斜杠和下一个字符（已经转义的内容保持不变）
      result += content[i];
      if (i + 1 < content.length) {
        result += content[i + 1];
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    
    // 检查是否是结束反引号
    // 结束反引号的特征：前面是换行（或行首），后面是 , 或空白+逗号
    if (content[i] === '`') {
      // 向前看：这个反引号后面是 , 吗？（可能有空白）
      let j = i + 1;
      while (j < content.length && (content[j] === ' ' || content[j] === '\t')) j++;
      
      if (j >= content.length || content[j] === ',' || content[j] === '\n' || content[j] === '\r') {
        // 检查后面是否真的是 code 块结束（应该是 , 然后换行，然后是 } 等）
        // 更精确：结束反引号应该在一行的开始（可能有缩进）或前面是换行
        let k = i - 1;
        while (k >= 0 && (content[k] === ' ' || content[k] === '\t')) k--;
        const atLineStart = k < 0 || content[k] === '\n' || content[k] === '\r';
        
        if (atLineStart) {
          // 这是结束反引号
          result += '`'; // 不转义结束的反引号
          i++;
          state = 'normal';
          continue;
        }
      }
      
      // 不是结束反引号，是内部的反引号，需要转义
      result += '\\`';
      i++;
      continue;
    }
    
    // 检查是否是 ${
    if (content[i] === '$' && i + 1 < content.length && content[i + 1] === '{') {
      // 内部的 ${，需要转义
      result += '\\${';
      i += 2;
      continue;
    }
    
    result += content[i];
    i++;
  }
}

fs.writeFileSync('./app/ts3-chapters-batch3.js', result, 'utf-8');
console.log('修复完成！');

// 验证
try {
  const { execSync } = require('child_process');
  fs.writeFileSync('/tmp/test_fixed.mjs', result);
  execSync('node --check /tmp/test_fixed.mjs', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('✓ ESM 语法验证通过');
} catch (e) {
  console.log('✗ 语法错误:', e.stderr?.split('\n')[0] || e.message);
  const match = (e.stderr || '').match(/:(\d+)$/m) || (e.stderr || '').match(/:(\d+):/);;
  if (match) {
    const errLine = parseInt(match[1]) - 1;
    const outLines = result.split('\n');
    console.log('\n错误行附近:');
    for (let l = Math.max(0, errLine - 3); l <= Math.min(outLines.length - 1, errLine + 3); l++) {
      const marker = l === errLine ? '>>>' : '   ';
      console.log(`${marker} ${l + 1}: ${outLines[l]}`);
    }
  }
}
