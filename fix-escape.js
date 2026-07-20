// 修复 tsrx-chapters-batch*.js 文件中 content 模板字符串内未转义的反引号和 ${}
const fs = require('fs');
const path = require('path');

function escapeTemplateLiteral(content) {
  let result = '';
  let i = 0;
  let inTemplate = false;
  let templateDepth = 0;
  let inString = null; // 'single', 'double', 'template'
  let inComment = null; // 'line', 'block'
  let inContentField = false;
  
  // 状态机：解析JS代码，找到 content: `...` 的模板字符串
  // 在模板字符串内部，将 ` 转为 \`，将 ${ 转为 \${
  // 但要正确处理 ${...} 内部嵌套的表达式（这些表达式内部可能有字符串、嵌套template等）
  
  while (i < content.length) {
    const c = content[i];
    const next = content[i + 1];
    const prev = i > 0 ? content[i - 1] : '';
    
    // 处理注释
    if (!inString && !inTemplate) {
      if (c === '/' && next === '/' && !inComment) {
        inComment = 'line';
        result += c;
        i++;
        continue;
      }
      if (c === '/' && next === '*' && !inComment) {
        inComment = 'block';
        result += c;
        i++;
        continue;
      }
      if (inComment === 'line' && c === '\n') {
        inComment = null;
        result += c;
        i++;
        continue;
      }
      if (inComment === 'block' && c === '*' && next === '/') {
        inComment = null;
        result += c + next;
        i += 2;
        continue;
      }
      if (inComment) {
        result += c;
        i++;
        continue;
      }
    }
    
    // 如果我们在 content 模板字符串内部（深度为0时才是真正的字符串内容）
    if (inContentField && templateDepth === 0) {
      // 检查是否到达结束位置：content字段的结束反引号后面跟 , 或 } 或换行+空格
      if (c === '`') {
        // 检查后续字符来判断这是结束反引号还是需要转义的
        const rest = content.substring(i + 1);
        const match = rest.match(/^(\s*\n\s*\}|\s*,|\s*\n\s*,|\s*\n\s*\))/);
        if (match) {
          // 这是结束反引号
          inContentField = false;
          inTemplate = false;
          result += c;
          i++;
          continue;
        } else {
          // 这是内部反引号，需要转义
          result += '\\`';
          i++;
          continue;
        }
      }
      // 检查 ${ 
      if (c === '$' && next === '{') {
        // 这是内部的 ${，需要转义
        result += '\\${';
        i += 2;
        continue;
      }
      result += c;
      i++;
      continue;
    }
    
    // 如果在 content 模板字符串内部但深度 > 0（即 ${...} 内部）
    if (inContentField && templateDepth > 0) {
      // 处理 ${...} 嵌套
      if (c === '}' && !inString) {
        templateDepth--;
        if (templateDepth === 0) {
          // 回到模板字符串内容
          result += c;
          i++;
          continue;
        }
      }
      
      if (!inString) {
        if (c === "'") { inString = 'single'; }
        else if (c === '"') { inString = 'double'; }
        else if (c === '`') { inString = 'template'; }
        else if (c === '/' && next === '/') {
          result += c;
          i++;
          result += next;
          i++;
          continue;
        } else if (c === '/' && next === '*') {
          // skip block comment
          result += c + next;
          i += 2;
          while (i < content.length && !(content[i] === '*' && content[i+1] === '/')) {
            result += content[i];
            i++;
          }
          result += '*/';
          i += 2;
          continue;
        }
        
        // 在 ${...} 内部检查是否有新的 ${ 嵌套（比如嵌套template literal）
        if (c === '$' && next === '{' && inString !== 'template') {
          // 如果在嵌套的template string中，这可能是新的插值
          templateDepth++;
        }
        if (c === '`' && inString === 'template') {
          inString = null;
        }
      } else {
        if (c === '\\') {
          result += c + (content[i+1] || '');
          i += 2;
          continue;
        }
        if ((c === "'" && inString === 'single') ||
            (c === '"' && inString === 'double') ||
            (c === '`' && inString === 'template')) {
          inString = null;
        }
      }
      
      // 在 ${...} 内部也可能有嵌套的模板字符串
      if (c === '`' && !inString && templateDepth > 0) {
        inString = 'template';
      }
      
      result += c;
      i++;
      continue;
    }
    
    // 普通代码区域，查找 content: `
    if (!inString && !inTemplate && !inContentField) {
      // 查找 content: ` 模式
      if (c === 'c' && content.substring(i, i + 8) === 'content:') {
        // 找到 content: 后面的反引号
        let j = i + 8;
        while (j < content.length && (content[j] === ' ' || content[j] === '\t')) j++;
        if (content[j] === '`') {
          // 输出从 i 到 j+1 的内容
          result += content.substring(i, j + 1);
          i = j + 1;
          inContentField = true;
          templateDepth = 0;
          continue;
        }
      }
    }
    
    result += c;
    i++;
  }
  
  return result;
}

// 另一种更简单但更可靠的方法：直接在Markdown代码块内容中转义
function fixFile(filepath) {
  console.log('Processing:', filepath);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // 策略：找到所有 content: ` 开头，然后找到下一个合理的结束 `
  // 然后在中间部分进行转义
  
  // 使用更简单的方法：把文件按章节分割，对每个章节的 content 部分进行处理
  let result = content;
  
  // 匹配 content: `...` 的模式 - 但这很难处理嵌套
  // 改用：手动扫描，状态机
  
  let output = '';
  let pos = 0;
  
  while (pos < content.length) {
    // 查找 content: `
    const contentStart = content.indexOf('content:', pos);
    if (contentStart === -1) {
      output += content.substring(pos);
      break;
    }
    
    // 找到 content: 后面的反引号
    let backtickPos = contentStart + 8;
    while (backtickPos < content.length && /\s/.test(content[backtickPos])) {
      backtickPos++;
    }
    
    if (content[backtickPos] !== '`') {
      // 不是 content: ` 模式，继续
      output += content.substring(pos, contentStart + 8);
      pos = contentStart + 8;
      continue;
    }
    
    // 找到了 content: ` 起始
    output += content.substring(pos, backtickPos + 1);
    pos = backtickPos + 1;
    
    // 现在扫描找到结束反引号
    // 结束反引号的特征：后面跟 , 或 } 或 )，且不在 ${...} 嵌套内
    let depth = 0;
    let str = null;
    let startPos = pos;
    let endPos = -1;
    
    for (let j = pos; j < content.length; j++) {
      const ch = content[j];
      const nxt = content[j + 1];
      
      if (str === 'line-comment') {
        if (ch === '\n') str = null;
        continue;
      }
      if (str === 'block-comment') {
        if (ch === '*' && nxt === '/') { str = null; j++; }
        continue;
      }
      
      if (str === 'single' || str === 'double' || str === 'template-nested' || str === 'regex') {
        if (ch === '\\') { j++; continue; }
        if (str === 'single' && ch === "'") str = null;
        else if (str === 'double' && ch === '"') str = null;
        else if (str === 'template-nested' && ch === '`') str = null;
        else if (str === 'regex' && ch === '/') str = null;
        continue;
      }
      
      if (ch === "'" && depth > 0) { str = 'single'; continue; }
      if (ch === '"' && depth > 0) { str = 'double'; continue; }
      if (ch === '/' && nxt === '/' && depth > 0) { str = 'line-comment'; j++; continue; }
      if (ch === '/' && nxt === '*' && depth > 0) { str = 'block-comment'; j++; continue; }
      
      if (depth === 0) {
        // 在模板字符串主体中
        if (ch === '`') {
          // 这是结束反引号
          endPos = j;
          break;
        }
        if (ch === '$' && nxt === '{') {
          depth++;
          j++; // skip {
          continue;
        }
      } else {
        // 在 ${...} 内部
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            // 回到模板字符串
            continue;
          }
        }
        // 在 ${...} 内部可能有嵌套的模板字符串
        if (ch === '`') { str = 'template-nested'; continue; }
        if (ch === '/' && depth > 0) {
          // 可能是除法或正则，简化处理：不处理正则
        }
      }
    }
    
    if (endPos === -1) {
      // 没找到结束，原样输出
      output += content.substring(pos);
      break;
    }
    
    // 对 pos 到 endPos 之间的内容进行转义
    let innerContent = content.substring(pos, endPos);
    
    // 转义反引号和 ${
    // 需要小心：已经被转义的不要重复转义
    let escaped = '';
    for (let k = 0; k < innerContent.length; k++) {
      const ch = innerContent[k];
      const nxt = innerContent[k + 1];
      const prev = k > 0 ? innerContent[k - 1] : '';
      
      if (ch === '\\' && (nxt === '`' || (nxt === '$' && innerContent[k+2] === '{'))) {
        // 已经转义了，保留
        escaped += ch + nxt;
        k++;
        continue;
      }
      
      if (ch === '`') {
        escaped += '\\`';
        continue;
      }
      if (ch === '$' && nxt === '{') {
        escaped += '\\${';
        k++;
        continue;
      }
      escaped += ch;
    }
    
    output += escaped;
    output += '`'; // 结束反引号
    pos = endPos + 1;
  }
  
  fs.writeFileSync(filepath, output, 'utf8');
  console.log('Fixed:', filepath);
}

const dataDir = path.join(__dirname, 'app/courses-data');
for (let i = 1; i <= 6; i++) {
  fixFile(path.join(dataDir, `tsrx-chapters-batch${i}.js`));
}

console.log('Done!');
