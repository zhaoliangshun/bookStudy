// 更可靠的修复脚本：找到每个 content: `...` 的边界并转义内部反引号和 ${}
const fs = require('fs');
const path = require('path');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let result = '';
  let i = 0;
  
  while (i < content.length) {
    // 查找 content: ` 模式
    const idx = content.indexOf('content:', i);
    if (idx === -1) {
      result += content.substring(i);
      break;
    }
    
    // 复制到 content: 
    result += content.substring(i, idx);
    result += 'content:';
    
    // 跳过空格
    let j = idx + 8;
    while (j < content.length && (content[j] === ' ' || content[j] === '\t')) {
      result += content[j];
      j++;
    }
    
    if (content[j] !== '`') {
      // 不是模板字符串
      i = j;
      continue;
    }
    
    // 找到起始反引号，输出它
    result += '`';
    j++;
    
    // 现在找到对应的结束反引号
    // 策略：跟踪 ${...} 的深度，深度为0时遇到的第一个 ` 就是结束
    let depth = 0;
    let start = j;
    let end = -1;
    let inStr = null; // 'single', 'double', 'backtick'
    
    for (let k = j; k < content.length; k++) {
      const ch = content[k];
      const nxt = content[k + 1];
      
      // 处理转义字符
      if (ch === '\\' && inStr) {
        k++; // skip next
        continue;
      }
      
      if (inStr === 'single') {
        if (ch === "'") inStr = null;
        continue;
      }
      if (inStr === 'double') {
        if (ch === '"') inStr = null;
        continue;
      }
      if (inStr === 'line_c') {
        if (ch === '\n') inStr = null;
        continue;
      }
      if (inStr === 'block_c') {
        if (ch === '*' && nxt === '/') { inStr = null; k++; }
        continue;
      }
      
      if (depth > 0) {
        // 在 ${...} 表达式内部
        if (ch === "'") { inStr = 'single'; continue; }
        if (ch === '"') { inStr = 'double'; continue; }
        if (ch === '/' && nxt === '/') { inStr = 'line_c'; k++; continue; }
        if (ch === '/' && nxt === '*') { inStr = 'block_c'; k++; continue; }
        if (ch === '`') { 
          // 嵌套模板字符串开始
          depth++; // 嵌套template内部也可能有${
          let nestStart = k + 1;
          // 找到这个嵌套template的结束
          let nestDepth = 1;
          let nestStr = null;
          for (let m = nestStart; m < content.length; m++) {
            const nc = content[m];
            const nn = content[m + 1];
            if (nc === '\\' && nestStr) { m++; continue; }
            if (nestStr === 's') { if (nc === "'") nestStr = null; continue; }
            if (nestStr === 'd') { if (nc === '"') nestStr = null; continue; }
            if (nestStr === 'lc') { if (nc === '\n') nestStr = null; continue; }
            if (nestStr === 'bc') { if (nc === '*' && nn === '/') { nestStr = null; m++; } continue; }
            if (nestDepth > 1) {
              if (nc === "'") nestStr = 's';
              else if (nc === '"') nestStr = 'd';
              else if (nc === '/' && nn === '/') { nestStr = 'lc'; m++; }
              else if (nc === '/' && nn === '*') { nestStr = 'bc'; m++; }
              else if (nc === '`') { nestDepth--; if (nestDepth === 1) { continue; } }
              else if (nc === '{') nestDepth++;
              else if (nc === '}') nestDepth--;
              continue;
            }
            if (nc === '`') {
              // 嵌套template结束
              k = m;
              break;
            }
            if (nc === '$' && nn === '{') { nestDepth++; m++; continue; }
          }
          continue;
        }
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
        }
        continue;
      }
      
      // depth === 0，在模板字符串内容中
      if (ch === '`') {
        end = k;
        break;
      }
      if (ch === '$' && nxt === '{') {
        depth++;
        k++; // skip {
      }
    }
    
    if (end === -1) {
      // 没找到结束，原样输出
      result += content.substring(j);
      break;
    }
    
    // 对 [start, end) 范围内的内容进行转义
    let inner = content.substring(start, end);
    
    // 转义逻辑：在模板字符串主体（非${...}内）中，
    // 未转义的 ` → \`
    // 未转义的 ${ → \${
    let escaped = '';
    let ed = 0;
    let eDepth = 0;
    let eStr = null;
    
    for (let k = 0; k < inner.length; k++) {
      const ch = inner[k];
      const nxt = inner[k + 1];
      const prv = k > 0 ? inner[k - 1] : '';
      
      if (ch === '\\' && (nxt === '`' || (nxt === '$' && inner[k+2] === '{'))) {
        // 已经转义了
        escaped += ch + nxt;
        k++;
        continue;
      }
      
      if (eDepth > 0) {
        // 在 ${...} 内部，不转义（保持代码原样）
        // 但需要跟踪嵌套深度和字符串
        if (eStr === 's') {
          if (ch === '\\') { escaped += ch + nxt; k++; continue; }
          if (ch === "'") eStr = null;
          escaped += ch;
          continue;
        }
        if (eStr === 'd') {
          if (ch === '\\') { escaped += ch + nxt; k++; continue; }
          if (ch === '"') eStr = null;
          escaped += ch;
          continue;
        }
        if (eStr === 'bt') {
          // 嵌套的template literal内部也需要转义
          if (ch === '\\') { escaped += ch + nxt; k++; continue; }
          if (ch === '`') { eStr = null; escaped += '\\`'; continue; }
          if (ch === '$' && nxt === '{') { escaped += '\\${'; k++; continue; }
          escaped += ch;
          continue;
        }
        if (ch === "'") { eStr = 's'; escaped += ch; continue; }
        if (ch === '"') { eStr = 'd'; escaped += ch; continue; }
        if (ch === '`') { eStr = 'bt'; escaped += '\\`'; continue; }
        if (ch === '{') eDepth++;
        else if (ch === '}') {
          eDepth--;
          if (eDepth === 0) {
            escaped += ch;
            continue;
          }
        }
        escaped += ch;
        continue;
      }
      
      // eDepth === 0，在模板字符串主体
      if (ch === '`') {
        escaped += '\\`';
        continue;
      }
      if (ch === '$' && nxt === '{') {
        escaped += '\\${';
        k++;
        eDepth = 1;
        eStr = null;
        continue;
      }
      escaped += ch;
    }
    
    result += escaped;
    result += '`';
    i = end + 1;
  }
  
  fs.writeFileSync(filepath, result, 'utf8');
  console.log('Fixed:', path.basename(filepath));
}

const dataDir = path.join(__dirname, 'app/courses-data');
for (let i = 1; i <= 6; i++) {
  fixFile(path.join(dataDir, `tsrx-chapters-batch${i}.js`));
}
console.log('Done!');
