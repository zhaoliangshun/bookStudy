import { chapters } from './app/ts3-chapters-batch3.js';
import vm from 'vm';
import * as events from 'events';
import * as stream from 'stream';
import * as crypto from 'crypto';
import * as util from 'util';
import * as buffer from 'buffer';
import * as path from 'path';
import * as url from 'url';
import assert from 'assert';

console.log('=== TS3 Batch3 章节验证 ===\n');

for (const chapter of chapters) {
  console.log(`\n--- 章节: ${chapter.id} - ${chapter.title} ---`);
  
  // 统计中文字符数
  const chineseChars = (chapter.content.match(/[\u4e00-\u9fff]/g) || []).length;
  console.log(`内容长度: ${chapter.content.length} 字符, 中文字符: ${chineseChars}`);
  console.log(`代码长度: ${chapter.code.length} 字符`);
  console.log(`分组: ${chapter.group}`);
  
  if (chineseChars < 3000) {
    console.log(`⚠️ 警告: 中文字符数 ${chineseChars} 少于 3000`);
  } else {
    console.log('✓ 内容长度达标');
  }
  
  // 尝试运行代码
  try {
    const sandbox = {
      console,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      setImmediate,
      clearImmediate,
      Buffer: buffer.Buffer,
      URL: url.URL,
      URLSearchParams: url.URLSearchParams,
    };
    
    vm.createContext(sandbox);
    const script = new vm.Script(chapter.code, {
      filename: `${chapter.id}.ts`,
    });
    
    // 捕获 console.log 输出以验证
    const logs = [];
    const originalLog = console.log;
    sandbox.console = {
      log: (...args) => logs.push(args.map(a => typeof a === 'string' ? a : util.inspect(a)).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.map(a => typeof a === 'string' ? a : util.inspect(a)).join(' ')),
    };
    
    script.runInContext(sandbox, { timeout: 10000 });
    
    console.log(`✓ 代码执行成功，产生 ${logs.length} 行输出`);
    if (logs.length > 0) {
      console.log('  前5行输出:');
      logs.slice(0, 5).forEach(l => console.log(`    ${l.substring(0, 100)}${l.length > 100 ? '...' : ''}`));
    }
  } catch (error) {
    console.log(`✗ 代码执行失败: ${error.message}`);
    console.log(`  错误堆栈: ${error.stack?.split('\n').slice(0, 3).join('\n  ')}`);
  }
}

console.log('\n=== 验证完成 ===');
