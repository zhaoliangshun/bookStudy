// Test: import AI batch files and count actual exported chapters
const fs = require('fs');
const path = require('path');

// Transform ES module to CommonJS for require()
function loadBatch(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace `export const chapters` with `module.exports = ` (but keep the variable name)
  // Handle both `export const chapters = [` and `const chapters = [` + `export { chapters }`
  if (content.includes('export const chapters')) {
    content = content.replace('export const chapters', 'const __chapters');
    content += '\nmodule.exports = { chapters: __chapters };';
  } else if (content.includes('module.exports')) {
    // Already CommonJS (like chapters-batch7.js)
  } else {
    // Try: const chapters = [...] ... export { chapters };
    content = content.replace(/export\s*\{\s*chapters\s*\}\s*;?/, '');
    content += '\nmodule.exports = { chapters };';
  }
  // Write to a temp file and require it
  const tmpFile = path.join('/tmp', '_batch_tmp_' + Date.now() + '.js');
  // /tmp might not be writable, use cwd
  const tmpFile2 = path.join(process.cwd(), '_batch_tmp_' + Date.now() + '.js');
  fs.writeFileSync(tmpFile2, content);
  try {
    delete require.cache[tmpFile2];
    const mod = require(tmpFile2);
    fs.unlinkSync(tmpFile2);
    return mod.chapters || [];
  } catch (e) {
    fs.unlinkSync(tmpFile2);
    return { error: e.message };
  }
}

const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';
for (let i = 1; i <= 8; i++) {
  const fileName = `ai-chapters-batch${i}.js`;
  const filePath = path.join(APP_DIR, fileName);
  const result = loadBatch(filePath);
  if (Array.isArray(result)) {
    console.log(`${fileName}: ${result.length} chapters exported`);
    if (result.length > 0) {
      console.log(`  IDs: ${JSON.stringify(result.map(c => c.id))}`);
      // Check if all have content field
      const withContent = result.filter(c => c.content !== undefined);
      console.log(`  With content field: ${withContent.length}/${result.length}`);
    }
  } else {
    console.log(`${fileName}: ERROR - ${result.error}`);
  }
}
