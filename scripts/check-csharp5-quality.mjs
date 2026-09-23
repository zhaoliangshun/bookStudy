import { csharp5Chapters } from '../app/courses-data/csharp5-tutorial-data.js';

const titles = {};
const issues = [];

for (const ch of csharp5Chapters) {
  if (!ch.content) issues.push(ch.id + ': no content');
  if (titles[ch.title]) issues.push(ch.id + ': duplicate title with ' + titles[ch.title]);
  titles[ch.title] = ch.id;

  const content = ch.content || '';
  // Check for unbalanced code fences
  const backticks = (content.match(/```/g) || []).length;
  if (backticks % 2 !== 0) issues.push(ch.id + ': unbalanced code fences (' + backticks + ' backticks)');

  // Check for traditional Chinese characters that should be simplified
  if (content.includes('基礎')) issues.push(ch.id + ': uses 基礎 (traditional) instead of 基础');
  if (content.includes('備份')) issues.push(ch.id + ': uses 備份 (traditional) instead of 备份');
  if (content.includes('當前')) issues.push(ch.id + ': uses 當前 (traditional)');
  if (content.includes('實踐')) issues.push(ch.id + ': uses 實踐 (traditional)');
  if (content.includes('環境')) issues.push(ch.id + ': uses 環境 (traditional)');

  // Check for missing group
  if (!ch.group) issues.push(ch.id + ': missing group');

  // Check for unclosed code blocks (````csharp without closing ```)
  const openFences = (content.match(/```[a-z]/g) || []).length;
  const closeFences = (content.match(/```$/gm) || []).length;
  // Actually count properly - opening has lang, closing is just ```
  const allTripleBacktick = (content.match(/```/g) || []).length;
}

if (issues.length > 0) {
  console.log('Issues found (' + issues.length + '):');
  for (const i of issues) console.log('  ' + i);
} else {
  console.log('No structural issues found');
}
console.log('Total chapters:', csharp5Chapters.length);
console.log('Total unique titles:', Object.keys(titles).length);
