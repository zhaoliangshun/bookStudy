const fs = require('fs');
const { execSync } = require('child_process');

function testFile(filename) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${filename}`);
  console.log('='.repeat(60));
  
  const content = fs.readFileSync(filename, 'utf8');
  const module = { exports: {} };
  const chapters = eval(content.replace('export const chapters', 'const chapters'));
  
  let allPassed = true;
  for (const ch of chapters) {
    console.log(`\n--- Chapter: ${ch.id} (${ch.title}) ---`);
    const code = ch.code;
    try {
      const tmpFile = `/tmp/_py5test_${ch.id}.py`;
      fs.writeFileSync(tmpFile, code);
      execSync(`python3 ${tmpFile}`, { stdio: 'pipe', timeout: 10000 });
      const output = execSync(`python3 ${tmpFile}`, { encoding: 'utf8', timeout: 10000 });
      console.log(`  ✓ PASSED`);
      console.log(`  Output (first 200 chars): ${output.substring(0, 200).replace(/\n/g, '\\n')}...`);
      fs.unlinkSync(tmpFile);
    } catch (e) {
      console.log(`  ✗ FAILED`);
      console.log(`  Error: ${e.message.substring(0, 500)}`);
      if (e.stdout) console.log(`  stdout: ${e.stdout.toString().substring(0, 300)}`);
      if (e.stderr) console