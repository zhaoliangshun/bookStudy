// Diagnose loading error for chapters-batch1.js
const fs = require('fs');
const path = require('path');

const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';
const file = 'chapters-batch1.js';
const filePath = path.join(APP_DIR, file);

let content = fs.readFileSync(filePath, 'utf8');
console.log('Original file length:', content.length);
console.log('Has "export const chapters":', content.includes('export const chapters'));
console.log('Has "module.exports":', content.includes('module.exports'));

// Transform
content = content.replace('export const chapters', 'const __chapters');
content += '\nmodule.exports = { chapters: __chapters };';

// Write to .cjs file (force CommonJS)
const tmpFile = path.join(process.cwd(), '_diag_tmp.cjs');
fs.writeFileSync(tmpFile, content);
console.log('\nWrote transformed file to', tmpFile);
console.log('Transformed file length:', content.length);

try {
    delete require.cache[tmpFile];
    const mod = require(tmpFile);
    console.log('\nSUCCESS: loaded module');
    console.log('Has chapters:', !!mod.chapters);
    if (mod.chapters) {
        console.log('Chapters count:', mod.chapters.length);
        if (mod.chapters.length > 0) {
            console.log('First chapter id:', mod.chapters[0].id);
        }
    }
} catch (e) {
    console.log('\nERROR:', e.message);
    console.log('\nStack:', e.stack);
    // Find which line the error is on
    const lines = content.split('\n');
    const match = e.stack.match(/_diag_tmp\.cjs:(\d+)/);
    if (match) {
        const lineNum = parseInt(match[1]);
        console.log(`\nError at line ${lineNum}:`);
        for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 3); i++) {
            console.log(`  ${i + 1}: ${lines[i]}`);
        }
    }
} finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
}
