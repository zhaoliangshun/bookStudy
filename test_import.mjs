import { chapters } from './app/ts3-chapters-batch3.js';

console.log('章节数量:', chapters.length);
for (const ch of chapters) {
  console.log(`- ${ch.id}: ${ch.title} (content: ${ch.content.length} chars, code: ${ch.code.length} chars)`);
}
