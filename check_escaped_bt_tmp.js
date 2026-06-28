// Check for escaped backtick issue (content: \`) across all batch files
// This pattern indicates a content template literal that's malformed
const fs = require('fs');
const path = require('path');
const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';

const prefixes = [
  { prefix: 'chapters-batch', count: 12, name: 'tutorial' },
  { prefix: 'ts-chapters-batch', count: 9, name: 'ts' },
  { prefix: 'tw-chapters-batch', count: 4, name: 'tw' },
  { prefix: 'py-chapters-batch', count: 8, name: 'py' },
  { prefix: 'java-chapters-batch', count: 22, name: 'java' },
  { prefix: 'csharp-chapters-batch', count: 5, name: 'csharp' },
  { prefix: 'go-chapters-batch', count: 5, name: 'go' },
  { prefix: 'sass-chapters-batch', count: 4, name: 'sass' },
  { prefix: 'gql-chapters-batch', count: 4, name: 'gql' },
  { prefix: 'backend-chapters-batch', count: 8, name: 'backend' },
  { prefix: 'ai-chapters-batch', count: 8, name: 'ai' },
  { prefix: 'career-chapters-batch', count: 4, name: 'career' },
  { prefix: 'comm-chapters-batch', count: 4, name: 'comm' },
  { prefix: 'psychology-chapters-batch', count: 5, name: 'psychology' },
  { prefix: 'work-chapters-batch', count: 5, name: 'work' },
  { prefix: 'stomach-chapters-batch', count: 5, name: 'stomach' },
  { prefix: 'dui-chapters-batch', count: 5, name: 'dui' },
  { prefix: 'fandui-chapters-batch', count: 5, name: 'fandui' },
  { prefix: 'curse-chapters-batch', count: 5, name: 'curse' },
  { prefix: 'quotes-chapters-batch', count: 24, name: 'quotes' },
  { prefix: 'mahjong-chapters-batch', count: 4, name: 'mahjong' },
];

const bt = String.fromCharCode(96); // backtick
const bs = String.fromCharCode(92); // backslash

// Pattern: content: ` (raw backtick) - correct
const rawBtRegex = new RegExp('content:\\s*' + bt, 'g');
// Pattern: content: \` (escaped backtick at line start, top-level) - PROBLEM
// This matches `content: ` + backslash + backtick where it appears at the start of a line (with indentation)
const escapedBtRegex = new RegExp('^[ \\t]+content:[ \\t]*' + bs + bt, 'gm');

console.log('=== Checking for escaped backtick content fields ===\n');
let foundAny = false;

for (const book of prefixes) {
  for (let i = 1; i <= book.count; i++) {
    const fileName = `${book.prefix}${i}.js`;
    const filePath = path.join(APP_DIR, fileName);
    const content = fs.readFileSync(filePath, 'utf8');

    escapedBtRegex.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = escapedBtRegex.exec(content)) !== null) {
      const lineNum = content.slice(0, m.index).split('\n').length;
      matches.push(lineNum);
    }

    if (matches.length > 0) {
      foundAny = true;
      console.log(`!! ${fileName}: ${matches.length} escaped backtick content fields at lines: ${matches.join(', ')}`);
    }
  }
}

if (!foundAny) {
  console.log('No escaped backtick content fields found.');
}
