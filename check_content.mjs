import { chapters } from './app/ts3-chapters-batch3.js';

console.log('=== 章节内容统计 ===\n');
for (const ch of chapters) {
  const chinese = (ch.content.match(/[\u4e00-\u9fff]/g) || []).length;
  const codeLines = ch.code.split('\n').length;
  console.log(`${ch.id}:`);
  console.log(`  总字符: ${ch.content.length}, 中文字符: ${chinese}`);
  console.log(`  代码字符: ${ch.code.length}, 代码行数: ${codeLines}`);
  console.log(`  group: "${ch.group}"`);
  console.log();
}
