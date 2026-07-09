const fs = require('fs');
const content = fs.readFileSync('/Users/zhaoliangshun/nextStudy/my-app/app/py-backend-chapters-batch1.js', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('content: `')) {
    console.log(`Line ${i+1}: content starts`);
  }
  if (line.match(/[^\\]`[^`]/) || line.trim() === '`') {
    if (!line.includes('```')) {
      console.log(`Line ${i+1}: possible backtick: ${line.substring(0, 100)}`);
    }
  }
}
