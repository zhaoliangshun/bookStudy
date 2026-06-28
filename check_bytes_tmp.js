// Precisely verify the bytes of content field lines in batch5 and batch7
const fs = require('fs');
const path = require('path');

const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';

function showLineChars(file, lineNum) {
  const content = fs.readFileSync(path.join(APP_DIR, file), 'utf8');
  const lines = content.split('\n');
  const line = lines[lineNum - 1];
  console.log(`\n--- ${file} line ${lineNum} ---`);
  console.log('Raw text:', JSON.stringify(line));
  console.log('Length:', line.length);
  // Show char codes of the part after "content:"
  const idx = line.indexOf('content:');
  if (idx >= 0) {
    const after = line.slice(idx);
    console.log('After "content:":', JSON.stringify(after));
    console.log('Char codes after "content:":');
    for (let i = 0; i < after.length; i++) {
      const c = after.charAt(i);
      const code = after.charCodeAt(i);
      console.log(`  [${i}] char=${JSON.stringify(c)} code=${code} (${code === 92 ? 'BACKSLASH' : code === 96 ? 'BACKTICK' : code === 32 ? 'SPACE' : ''})`);
    }
  }
}

// batch5: line 14 (correct) vs line 2284 (suspected bug)
showLineChars('ai-chapters-batch5.js', 14);
showLineChars('ai-chapters-batch5.js', 2284);

// batch7: line 11 (correct) vs line 1026 (suspected bug) vs line 1956 (deeper indent)
showLineChars('ai-chapters-batch7.js', 11);
showLineChars('ai-chapters-batch7.js', 1026);
showLineChars('ai-chapters-batch7.js', 1956);

// Also verify: is line 1956 inside a string? Check by looking at what's around it
console.log('\n--- batch7 context around line 1956 (is it inside a string?) ---');
const b7 = fs.readFileSync(path.join(APP_DIR, 'ai-chapters-batch7.js'), 'utf8');
const b7lines = b7.split('\n');
// Find the nearest "content: `" or "code: `" before line 1956 that opens a template string
for (let i = 1955; i >= 0; i--) {
  const l = b7lines[i];
  if (/^\s{4}(content|code):\s*`/.test(l) || /^\s{4}(content|code):\s*\\`/.test(l)) {
    console.log(`  Nearest chapter-level string opener: line ${i+1}: ${JSON.stringify(l.trim())}`);
    break;
  }
}
