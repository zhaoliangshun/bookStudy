// Verify batch7 structure: check if ai-legal-ethics definition is embedded
// inside ai-code-pitfalls's code string
const fs = require('fs');
const path = require('path');

const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';

// Load batch7 using the same technique as check_ai_tmp.js
function loadBatch(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('export const chapters')) {
    content = content.replace('export const chapters', 'const __chapters');
    content += '\nmodule.exports = { chapters: __chapters };';
  }
  const tmpFile = path.join(process.cwd(), '_batch_tmp_' + Date.now() + '.js');
  fs.writeFileSync(tmpFile, content);
  try {
    delete require.cache[tmpFile];
    const mod = require(tmpFile);
    fs.unlinkSync(tmpFile);
    return mod.chapters || [];
  } catch (e) {
    fs.unlinkSync(tmpFile);
    return { error: e.message };
  }
}

const b7 = loadBatch(path.join(APP_DIR, 'ai-chapters-batch7.js'));
if (Array.isArray(b7)) {
  console.log('batch7 exported ' + b7.length + ' chapters:');
  for (const ch of b7) {
    console.log(`\n  id: ${ch.id}`);
    console.log(`  title: ${ch.title}`);
    console.log(`  content length: ${ch.content ? ch.content.length : 'N/A'}`);
    console.log(`  code length: ${ch.code ? ch.code.length : 'N/A'}`);
    // Check if code contains ai-legal-ethics
    if (ch.code && ch.code.includes('ai-legal-ethics')) {
      console.log(`  *** code field CONTAINS "ai-legal-ethics" (embedded!) ***`);
      const idx = ch.code.indexOf('ai-legal-ethics');
      console.log(`  context around it: ...${ch.code.substring(Math.max(0, idx - 50), idx + 100)}...`);
    }
    if (ch.content && ch.content.includes('ai-legal-ethics')) {
      console.log(`  *** content field CONTAINS "ai-legal-ethics" (embedded!) ***`);
    }
  }
} else {
  console.log('Error: ' + b7.error);
}

// Also check batch5
console.log('\n\n===== batch5 =====');
const b5 = loadBatch(path.join(APP_DIR, 'ai-chapters-batch5.js'));
if (Array.isArray(b5)) {
  console.log('batch5 exported ' + b5.length + ' chapters:');
  for (const ch of b5) {
    console.log(`\n  id: ${ch.id}`);
    console.log(`  title: ${ch.title}`);
    console.log(`  content length: ${ch.content ? ch.content.length : 'N/A'}`);
    console.log(`  code length: ${ch.code ? ch.code.length : 'N/A'}`);
    // Check if content/code contains other chapter ids
    const otherIds = ['ai-version-control', 'ai-project-mgmt', 'ai-tech-writing', 'ai-workbench'];
    for (const oid of otherIds) {
      if (ch.content && ch.content.includes(oid)) {
        console.log(`  *** content field CONTAINS "${oid}" (embedded!) ***`);
      }
      if (ch.code && ch.code.includes(oid)) {
        console.log(`  *** code field CONTAINS "${oid}" (embedded!) ***`);
      }
    }
  }
} else {
  console.log('Error: ' + b5.error);
}
