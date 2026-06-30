const ts = require('typescript');
const vm = require('vm');
const fs = require('fs');

const fileContent = fs.readFileSync('./app/ts3-chapters-batch3.js', 'utf-8');

const chaptersMatch = fileContent.match(/export const chapters = (\[[\s\S]*\]);\s*$/);
if (!chaptersMatch) {
  console.error('无法解析 chapters 数组');
  process.exit(1);
}

const chaptersJs = chaptersMatch[1];

const wrappedCode = `
const chapters = ${chaptersJs};
module.exports = chapters;
`;

const chapters = vm.runInNewContext(wrappedCode, { console });

console.log('=== 验证 ts3-chapters-batch3.js ===\n');
console.log(`章节数量: ${chapters.length}`);
console.log('');

for (const chapter of chapters) {
  console.log(`\n--- 验证章节: ${chapter.id} (${chapter.title}) ---`);
  console.log(`  group: ${chapter.group}`);
  console.log(`  icon: ${chapter.icon}`);
  
  const contentLen = chapter.content.length;
  console.log(`  content 长度: ${contentLen} 字符`);
  if (contentLen < 3000) {
    console.log(`  ⚠️  警告: content 长度不足 3000 字符！`);
  } else {
    console.log(`  ✓ content 长度符合要求 (>= 3000)`);
  }
  
  const codeLen = chapter.code.length;
  console.log(`  code 长度: ${codeLen} 字符`);
  
  try {
    const result = ts.transpileModule(chapter.code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        experimentalDecorators: true,
        esModuleInterop: true,
      }
    });
    
    console.log(`  ✓ TypeScript 编译成功`);
    
    const sandbox = {
      console: {
        log: (...args) => console.log('    [LOG]', ...args),
        error: (...args) => console.log('    [ERR]', ...args),
        warn: (...args) => console.log('    [WARN]', ...args),
        info: (...args) => console.log('    [INFO]', ...args),
      },
      Buffer,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Promise,
      Date,
      Math,
      JSON,
      RegExp,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
      ReferenceError,
      Map,
      Set,
      WeakMap,
      WeakSet,
      Symbol,
      Proxy,
      Reflect,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURI,
      decodeURI,
      encodeURIComponent,
      decodeURIComponent,
      process: {
        env: { NO_COLOR: '1' },
        version: process.version,
        nextTick: process.nextTick,
      },
      require: (mod) => {
        if (mod === 'events') return require('events');
        if (mod === 'stream' || mod === 'node:stream') return require('stream');
        if (mod === 'crypto' || mod === 'node:crypto') return require('crypto');
        if (mod === 'util' || mod === 'node:util') return require('util');
        if (mod === 'buffer' || mod === 'node:buffer') return require('buffer');
        if (mod === 'path' || mod === 'node:path') return require('path');
        if (mod === 'url' || mod === 'node:url') return require('url');
        if (mod === 'assert' || mod === 'node:assert') return require('assert');
        throw new Error(`Cannot find module '${mod}'`);
      },
    };
    
    vm.createContext(sandbox);
    
    try {
      vm.runInContext(result.outputText, sandbox, {
        timeout: 10000,
        filename: `${chapter.id}.js`
      });
      console.log(`  ✓ 代码执行成功`);
    } catch (execErr) {
      console.log(`  ✗ 代码执行错误: ${execErr.message}`);
      if (execErr.stack) {
        const stackLines = execErr.stack.split('\n').slice(0, 3);
        console.log(`    ${stackLines.join('\n    ')}`);
      }
    }
    
  } catch (compileErr) {
    console.log(`  ✗ TypeScript 编译错误: ${compileErr.message}`);
  }
}

console.log('\n=== 验证完成 ===');
