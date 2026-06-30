const fs = require('fs');

const filePath = './app/ts3-chapters-batch3.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 找到所有 code: `...` 块
// 我们需要找到 code: 后跟一个反引号开始的模板字符串，然后找到匹配的结束反引号
// 注意：模板字符串可以包含转义的反引号 \`，所以不能简单地找下一个 `

function escapeTemplateLiteralContent(codeContent) {
  // 输入是模板字符串的内部内容（不包含外层的反引号）
  // 需要转义所有未转义的 ` 和 ${
  let result = '';
  for (let i = 0; i < codeContent.length; i++) {
    const ch = codeContent[i];
    const nextCh = codeContent[i + 1];
    
    if (ch === '\\') {
      // 已经是转义字符，保留它和下一个字符
      result += ch;
      if (nextCh !== undefined) {
        result += nextCh;
        i++;
      }
    } else if (ch === '`') {
      // 未转义的反引号，转义它
      result += '\\`';
    } else if (ch === '$' && nextCh === '{') {
      // 未转义的 ${，转义它
      result += '\\${';
      i++; // 跳过 {
    } else {
      result += ch;
    }
  }
  return result;
}

// 使用状态机来解析和修复
let result = '';
let i = 0;
let inCode = false;
let codeStart = -1;
let codeContentStart = -1;
let codeDepth = 0;

while (i < content.length) {
  // 查找 "code: `" 模式
  if (!inCode && 
      content.substring(i, i + 6) === 'code: ' && 
      content[i + 6] === '`') {
    // 找到 code 块开始
    result += content.substring(i, i + 7); // 添加 "code: `"
    i += 7;
    inCode = true;
    codeContentStart = i;
    continue;
  }
  
  if (inCode) {
    // 现在在 code 模板字符串内部
    // 我们需要找到结束的反引号（未转义的）
    let found = false;
    
    if (content[i] === '\\') {
      // 转义字符，跳过下一个字符
      i += 2;
      continue;
    }
    
    if (content[i] === '`') {
      // 可能是结束反引号
      // 结束反引号后面应该跟着 , 或换行或空白然后是 } 或 ,
      let j = i + 1;
      while (j < content.length && (content[j] === ' ' || content[j] === '\t')) j++;
      
      if (j >= content.length || 
          content[j] === ',' || 
          content[j] === '\n' || 
          content[j] === ')' ||
          content.substring(j, j + 3) === '},\n' ||
          content.substring(j, j + 2) === '},') {
        // 这是结束反引号
        const codeContent = content.substring(codeContentStart, i);
        const escaped = escapeTemplateLiteralContent(codeContent);
        result += escaped;
        result += '`'; // 结束反引号
        i++;
        inCode = false;
        found = true;
      }
    }
    
    if (!found) {
      // 继续扫描，我们会在循环结束时处理
      i++;
    }
    continue;
  }
  
  result += content[i];
  i++;
}

fs.writeFileSync(filePath, result, 'utf-8');
console.log('修复完成！');

// 验证语法
const vm = require('vm');
try {
  new vm.Script(result);
  console.log('✓ JavaScript 语法验证通过');
} catch (e) {
  console.log('✗ 语法错误:', e.message);
  console.log('错误位置附近:', result.substring(Math.max(0, e.lineNumber * 200 - 100), e.lineNumber * 200 + 100));
}
