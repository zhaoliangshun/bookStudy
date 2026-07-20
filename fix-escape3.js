// 修复脚本 v3：正确识别 content 模板字符串的结束位置
const fs = require('fs');
const path = require('path');

function fixFile(filepath) {
  let src = fs.readFileSync(filepath, 'utf8');
  let out = '';
  let i = 0;
  
  while (i < src.length) {
    // 查找 "content:" 位置
    const ci = src.indexOf('content:', i);
    if (ci === -1) {
      out += src.substring(i);
      break;
    }
    
    // 复制到 "content:" 
    out += src.substring(i, ci);
    out += 'content:';
    
    // 跳过空白字符（空格/tab）
    let p = ci + 8;
    while (p < src.length && (src[p] === ' ' || src[p] === '\t')) {
      out += src[p];
      p++;
    }
    
    // 检查是否是模板字符串
    if (src[p] !== '`') {
      i = p;
      continue;
    }
    
    // 输出起始反引号
    out += '`';
    p++;
    
    // 现在扫描到结束反引号
    // 策略：跟踪 ${ 表达式深度（平衡 {} 和嵌套模板字符串）
    // 当 depth=0 时，遇到的反引号如果后跟结束模式（逗号/换行后}）则是结束
    let depth = 0;
    let start = p;
    let end = -1;
    
    for (let k = p; k < src.length; k++) {
      const ch = src[k];
      const nxt = src[k + 1];
      
      if (depth === 0) {
        // 在模板字符串文本部分
        if (ch === '\\') {
          k++; // skip escaped char
          continue;
        }
        if (ch === '`') {
          // 检查后面的字符是否表明这是结束反引号
          // 结束反引号后面通常是：
          //   ,\n (逗号+换行)
          //   \n  } (换行+空格+})
          //   \n  , (换行+空格+,)
          let rest = src.substring(k + 1);
          // 跳过空白
          let ri = 0;
          while (ri < rest.length && (rest[ri] === ' ' || rest[ri] === '\t' || rest[ri] === '\n' || rest[ri] === '\r')) {
            ri++;
          }
          if (rest[ri] === ',' || rest[ri] === '}' || rest[ri] === ')' || rest[ri] === ';') {
            end = k;
            break;
          }
          // 否则这是内部反引号，继续扫描
          continue;
        }
        if (ch === '$' && nxt === '{') {
          depth = 1;
          k++; // skip {
          continue;
        }
      } else {
        // 在 ${...} 表达式内部
        // 需要正确处理：字符串、注释、嵌套模板字符串、嵌套的 {}
        let str = null; // 's1', 's2', 'bt', 'lc', 'bc'
        let braceDepth = depth;
        
        for (let m = k; m < src.length; m++) {
          const mc = src[m];
          const mn = src[m + 1];
          
          if (str === 's1') {
            if (mc === '\\') { m++; continue; }
            if (mc === "'") str = null;
            continue;
          }
          if (str === 's2') {
            if (mc === '\\') { m++; continue; }
            if (mc === '"') str = null;
            continue;
          }
          if (str === 'lc') {
            if (mc === '\n') str = null;
            continue;
          }
          if (str === 'bc') {
            if (mc === '*' && mn === '/') { str = null; m++; }
            continue;
          }
          if (str === 'bt') {
            // 嵌套模板字符串内部也需要跟踪 ${ 和结束
            if (mc === '\\') { m++; continue; }
            if (mc === '`') { str = null; continue; }
            if (mc === '$' && mn === '{') { braceDepth++; m++; continue; }
            if (mc === '}') {
              braceDepth--;
              if (braceDepth < depth) {
                // 这是对应我们开始的 ${ 的 }
                // 检查是否回到了模板字符串层
                // 简单处理：如果 braceDepth === depth-1，说明这个 } 闭合了我们开始的 ${
                // 但嵌套bt内的}不影响外层depth
              }
            }
            continue;
          }
          
          if (mc === "'") { str = 's1'; continue; }
          if (mc === '"') { str = 's2'; continue; }
          if (mc === '`') { str = 'bt'; continue; }
          if (mc === '/' && mn === '/') { str = 'lc'; m++; continue; }
          if (mc === '/' && mn === '*') { str = 'bc'; m++; continue; }
          if (mc === '{') braceDepth++;
          if (mc === '}') {
            braceDepth--;
            if (braceDepth === 0) {
              // 表达式结束，回到模板字符串文本
              depth = 0;
              k = m;
              break;
            }
          }
        }
        continue;
      }
    }
    
    if (end === -1) {
      // 没找到结束，原样输出
      out += src.substring(p);
      break;
    }
    
    // 现在对 [start, end) 范围内的文本进行转义
    // 策略：再次扫描，在 depth=0 区域转义 ` 和 ${，在 depth>0 区域保持原样
    let inner = src.substring(start, end);
    let escaped = '';
    let ed = 0;
    let eStr = null;
    
    for (let k = 0; k < inner.length; k++) {
      const ch = inner[k];
      const nxt = inner[k + 1];
      
      // 已转义的保持原样
      if (ch === '\\' && (nxt === '`' || (nxt === '$' && inner[k+2] === '{'))) {
        escaped += ch + nxt;
        k++;
        continue;
      }
      
      if (ed === 0) {
        if (ch === '`') {
          escaped += '\\`';
          continue;
        }
        if (ch === '$' && nxt === '{') {
          escaped += '\\${';
          k++;
          ed = 1;
          continue;
        }
        escaped += ch;
      } else {
        // ${...} 内部，不转义反引号和${}，但需要跟踪深度和字符串
        if (eStr === 's1') {
          if (ch === '\\') { escaped += ch + nxt; k++; continue; }
          if (ch === "'") eStr = null;
          escaped += ch;
          continue;
        }
        if (eStr === 's2') {
          if (ch === '\\') { escaped += ch + nxt; k++; continue; }
          if (ch === '"') eStr = null;
          escaped += ch;
          continue;
        }
        if (eStr === 'bt') {
          // 嵌套模板字符串内的需要转义
          if (ch === '\\') { escaped += ch + nxt; k++; continue; }
          if (ch === '`') { eStr = null; escaped += '\\`'; continue; }
          if (ch === '$' && nxt === '{') { escaped += '\\${'; k++; ed++; continue; }
          escaped += ch;
          continue;
        }
        if (eStr === 'lc') {
          if (ch === '\n') eStr = null;
          escaped += ch;
          continue;
        }
        if (eStr === 'bc') {
          if (ch === '*' && nxt === '/') { eStr = null; escaped += ch + nxt; k++; continue; }
          escaped += ch;
          continue;
        }
        if (ch === "'") { eStr = 's1'; escaped += ch; continue; }
        if (ch === '"') { eStr = 's2'; escaped += ch; continue; }
        if (ch === '`') { eStr = 'bt'; escaped += '\\`'; continue; }
        if (ch === '/' && nxt === '/') { eStr = 'lc'; escaped += ch + nxt; k++; continue; }
        if (ch === '/' && nxt === '*') { eStr = 'bc'; escaped += ch + nxt; k++; continue; }
        if (ch === '{') ed++;
        if (ch === '}') {
          ed--;
          if (ed === 0) {
            escaped += ch;
            continue;
          }
        }
        escaped += ch;
      }
    }
    
    out += escaped;
    out += '`';
    i = end + 1;
  }
  
  fs.writeFileSync(filepath, out, 'utf8');
  console.log('Fixed:', path.basename(filepath), 'size:', out.length);
}

const dataDir = path.join(__dirname, 'app/courses-data');
for (let i = 1; i <= 6; i++) {
  fixFile(path.join(dataDir, `tsrx-chapters-batch${i}.js`));
}
console.log('All done!');
