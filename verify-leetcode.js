const fs = require('fs');
const path = require('path');

const leetcodeDir = path.join(__dirname, 'app', 'leetcode');

// 模拟简单的导入计数
let totalChapters = 0;
const groups = new Set();

for (let i = 1; i <= 20; i++) {
  const filePath = path.join(leetcodeDir, `leetcode-chapters-batch${i}.js`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // 简单统计 chapters 数组中的对象数量（通过 id: 计数）
    const idMatches = content.match(/id:\s*"lc-[^"]+"/g);
    const count = idMatches ? idMatches.length : 0;
    totalChapters += count;
    
    // 提取所有 group
    const groupMatches = content.match(/group:\s*"([^"]+)"/g);
    if (groupMatches) {
      groupMatches.forEach(m => {
        const groupName = m.match(/group:\s*"([^"]+)"/)[1];
        groups.add(groupName);
      });
    }
    
    console.log(`batch${i}: ${count} problems`);
  } else {
    console.log(`batch${i}: MISSING!`);
  }
}

console.log('\n==================');
console.log(`Total problems: ${totalChapters}`);
console.log(`Groups found: ${Array.from(groups).join(', ')}`);
console.log('==================\n');

// 检查必要文件
const requiredFiles = ['page.js', 'leetcode-tutorial-data.js'];
for (const f of requiredFiles) {
  const fp = path.join(leetcodeDir, f);
  console.log(`${f}: ${fs.existsSync(fp) ? '✓ EXISTS' : '✗ MISSING'}`);
}
