const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/chapters-batch2.js');
let content = fs.readFileSync(filePath, 'utf8');

// 转义所有未转义的反引号（前面不是\的`）
let fixed = content.replace(/(^|[^\\])`/g, '$1\\`');

fs.writeFileSync(filePath, fixed);
console.log('修复完成');

// 验证语法
try {
  require(filePath);
  console.log('语法检查通过！');
} catch(e) {
  console.log('仍有语法错误:', e.message);
  // 找出错误行
  const match = e.message.match(/(\d+)/);
  if (match) {
    const lines = fixed.split('\n');
    const lineNum = parseInt(match[1]);
    console.log('错误行附近:');
    for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 3); i++) {
      console.log((i+1) + ': ' + lines[i]);
    }
  }
}
