// 测试脚本：提取 pyprocess 各章节的 Python 代码并通过 API 运行
import http from 'http';

const chaptersToTest = [
  { batch: 1, ids: ['mp-04'] },
  { batch: 2, ids: ['mp-05', 'mp-08'] },
  { batch: 3, ids: ['mp-09', 'mp-10', 'mp-12', 'mp-13'] },
  { batch: 4, ids: ['mp-15', 'mp-17'] },
  { batch: 5, ids: ['mp-19', 'mp-20', 'mp-21', 'mp-23'] },
];

async function runCode(code) {
  const data = JSON.stringify({ code });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/run-py',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
    timeout: 30000,
  };
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ error: 'parse_error', raw: body.slice(0, 500) });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.write(data);
    req.end();
  });
}

async function main() {
  for (const { batch, ids } of chaptersToTest) {
    const mod = await import(`./app/pyprocess-chapters-batch${batch}.js`);
    for (const ch of mod.chapters) {
      if (!ids.includes(ch.id)) continue;
      process.stdout.write(`[${ch.id}] ${ch.title} ... `);
      const result = await runCode(ch.code);
      const out = result.output || '';
      const err = result.error || '';
      const exitCode = result.exitCode;
      if (exitCode === 0 && !err) {
        if (out.includes('Traceback') || out.includes('Error')) {
          console.log(`❌ 输出含错误`);
          console.log(`  output: ${out.slice(0, 400)}`);
        } else {
          console.log(`✅ 成功 (${out.split('\n').length} 行输出)`);
        }
      } else {
        console.log(`❌ 失败 exitCode=${exitCode}`);
        console.log(`  error: ${err.slice(0, 400)}`);
        if (out) console.log(`  output: ${out.slice(0, 200)}`);
      }
    }
  }
}

main().catch(console.error);
