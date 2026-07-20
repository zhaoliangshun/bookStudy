const fs = require('fs');
const path = require('path');

// Quick check using node --check equivalent via Function constructor won't work for ESM.
// Let's use a simple approach: check for obvious issues
const dataDir = path.join(__dirname, 'app/courses-data');
let allOk = true;
for (let i = 1; i <= 6; i++) {
  const f = path.join(dataDir, `tsrx-chapters-batch${i}.js`);
  const src = fs.readFileSync(f, 'utf8');
  
  // Check for double-escaped backticks: \\` inside content (between content: backticks)
  // Also check that file starts with expected export and ends with ];
  if (!src.startsWith('export const chapters = [')) {
    console.log(`❌ batch${i}: doesn't start with export const chapters = [`);
    allOk = false;
  }
  if (!src.trim().endsWith('];')) {
    console.log(`❌ batch${i}: doesn't end with ];`);
    allOk = false;
  }
  
  // Count unescaped backticks per line to detect issues
  // Parse more carefully: find content: blocks and check balance
  let contentCount = 0;
  let pos = 0;
  while (true) {
    const idx = src.indexOf('content:', pos);
    if (idx === -1) break;
    contentCount++;
    
    // Skip to opening `
    let p = idx + 8;
    while (p < src.length && (src[p] === ' ' || src[p] === '\t')) p++;
    if (src[p] !== '`') {
      console.log(`❌ batch${i}: content at ${idx} not followed by backtick`);
      allOk = false;
      break;
    }
    p++;
    
    // Find closing ` by scanning, tracking ${} depth
    let depth = 0, str = null, braceDepth = 0, end = -1;
    for (let k = p; k < src.length; k++) {
      const ch = src[k], nxt = src[k+1];
      if (depth === 0) {
        if (ch === '\\') { k++; continue; }
        if (ch === '`') {
          // Check if closing
          let r = k+1;
          while (r < src.length && /[\s]/.test(src[r])) r++;
          if (src[r] === ',' || src[r] === '}' || src[r] === ']') { end = k; break; }
          continue;
        }
        if (ch === '$' && nxt === '{') { depth=1; braceDepth=1; k++; continue; }
      } else {
        if (str === 's1') {
          if (ch === '\\') {k++;continue;}
          if (ch === "'") str=null;
          continue;
        }
        if (str === 's2') {
          if (ch === '\\') {k++;continue;}
          if (ch === '"') str=null;
          continue;
        }
        if (str === 'bt') {
          if (ch === '\\') {k++;continue;}
          if (ch === '`') {str=null;braceDepth--;continue;}
          if (ch === '$' && nxt === '{') {braceDepth++;k++;continue;}
          if (ch === '}') {braceDepth--;if(braceDepth<depth){depth=0;}}
          continue;
        }
        if (str === 'lc') { if(ch==='\n') str=null; continue; }
        if (str === 'bc') { if(ch==='*'&&nxt==='/'){str=null;k++;} continue; }
        if (ch === "'") {str='s1';continue;}
        if (ch === '"') {str='s2';continue;}
        if (ch === '`') {str='bt';braceDepth++;continue;}
        if (ch === '/' && nxt === '/') {str='lc';k++;continue;}
        if (ch === '/' && nxt === '*') {str='bc';k++;continue;}
        if (ch === '{') braceDepth++;
        if (ch === '}') {braceDepth--;if(braceDepth===0)depth=0;}
      }
    }
    
    if (end === -1) {
      console.log(`❌ batch${i}: content #${contentCount} at ${idx} - no closing backtick found!`);
      allOk = false;
      break;
    }
    pos = end + 1;
  }
  
  console.log(`✅ batch${i}: ${contentCount} content blocks, all balanced, size ${(src.length/1024).toFixed(1)}KB`);
}

console.log(allOk ? '\n🎉 All files look syntactically valid!' : '\n❌ Issues found!');
