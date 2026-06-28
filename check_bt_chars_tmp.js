// Precisely check which content fields use escaped backtick (backslash+backtick)
// vs raw backtick, across ALL batch files in app/
const fs = require('fs');
const path = require('path');

const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';

const files = fs.readdirSync(APP_DIR).filter(f =>
  /-chapters-batch\d+\.js$/.test(f) || /-book-batch\d+\.js$/.test(f)
).sort();

const problems = [];
let checkedCount = 0;

for (const file of files) {
  const filePath = path.join(APP_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match lines that are content field definitions: leading whitespace + "content:" + space + char
    // We look for the char right after "content: "
    const m = line.match(/^(\s+)content:\s*(.+?)$/);
    if (!m) continue;
    const indent = m[1];
    const rest = m[2];
    // rest should start with a backtick for a template string
    // If it starts with backslash + backtick, that's the bug
    if (rest.charAt(0) === '\\' && rest.charAt(1) === '`') {
      // Escaped backtick - this is the bug pattern
      // But only flag if it's at the chapter/object level (indent 2-6 spaces typically)
      // Deeper indent (like codeFiles inside a string) is just example code
      const indentLen = indent.length;
      if (indentLen <= 6) {
        problems.push({ file, line: i + 1, indent: indentLen, text: line });
      }
    }
  }
  checkedCount++;
}

console.log('===== Checked ' + checkedCount + ' batch files =====');
console.log('\n===== Problems (escaped backtick in content field, indent <= 6): ' + problems.length + ' =====');
for (const p of problems) {
  console.log(`  ${p.file} line ${p.line} (indent ${p.indent}): ${JSON.stringify(p.text.trim())}`);
}

if (problems.length === 0) {
  console.log('\nNo escaped backtick problems found.');
}
