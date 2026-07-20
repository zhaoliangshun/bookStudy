const fs = require('fs');
const src = fs.readFileSync('/Users/zhaoliangshun/nextStudy/my-app/app/courses-data/tsrx-chapters-batch3.js', 'utf8');

// Find first content:
const contentIdx = src.indexOf('content:');
console.log('First content: at char', contentIdx);
console.log('Context around content:');
console.log(JSON.stringify(src.substring(contentIdx, contentIdx + 30)));

// Find opening backtick
let p = contentIdx + 8;
while (p < src.length && (src[p] === ' ' || src[p] === '\t')) p++;
console.log('Opening backtick at char', p, 'char=', JSON.stringify(src[p]));
p++;

// Let me search for all backtick+comma patterns on same line
console.log('\nAll backtick positions followed by comma (same line, first 20):');
let found = 0;
for (let k = p; k < src.length && found < 20; k++) {
  if (src[k] === '`' && src[k-1] !== '\\') {
    // Check same line comma after spaces
    let r = k+1;
    while (r < src.length && (src[r] === ' ' || src[r] === '\t')) r++;
    const lineEnd = src.indexOf('\n', k+1);
    if (src[r] === ',' && (lineEnd === -1 || r < lineEnd)) {
      const lineStart = src.lastIndexOf('\n', k) + 1;
      const line = src.substring(lineStart, lineEnd > -1 ? lineEnd : src.length);
      console.log(`  candidate at char ${k}, comma at ${r}, line: ${line.trim().substring(0, 80)}`);
      found++;
    }
  }
}
