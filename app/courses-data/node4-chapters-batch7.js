export const chapters = [
  {
    id: "n4-logging",
    group: "第六部分 工程化",
    icon: "📝",
    title: "日志系统：结构化日志与分级输出",
    content: `# 日志系统：结构化日志与分级输出

## 一、为什么日志至关重要

日志是应用程序的"黑匣子"，是排查问题、监控运行状态、审计操作行为的核心依据。

### 1.1 日志的三大用途

| 用途 | 说明 | 示例 |
|------|------|------|
| **调试排错** | 开发和线上问题定位 | 记录错误堆栈、请求参数、执行流程 |
| **运行监控** | 实时了解应用健康状态 | 请求量、响应时间、错误率指标 |
| **安全审计** | 追溯操作行为，满足合规要求 | 用户登录、数据修改、权限变更记录 |

### 1.2 不好的日志实践

- \`console.log\` 到处打，无法区分级别和来源
- 只打"出错了"，不打上下文信息
- 同步写日志阻塞事件循环
- 日志文件无限增长撑满磁盘
- 敏感信息（密码、token）明文输出

---

## 二、日志级别（Log Levels）

合理的日志分级可以帮助我们快速过滤信息。

| 级别 | 数值 | 适用场景 |
|------|------|----------|
| **debug** | 0 | 开发调试细节，生产环境通常关闭 |
| **info** | 1 | 正常运行的关键信息 |
| **warn** | 2 | 警告信息，不影响运行但需注意 |
| **error** | 3 | 错误，某个功能失败但应用可继续 |
| **fatal** | 4 | 致命错误，应用即将崩溃 |

---

## 三、结构化日志（Structured Logging）

非结构化文本日志人能看懂但机器难以解析。结构化日志使用 JSON 格式：

\`\`\`json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "用户登录成功",
  "userId": "u_123",
  "requestId": "req_abc123"
}
\`\`\`

优势：支持按字段精确搜索、方便统计分析、可以对接日志收集系统（ELK/Loki）。

---

## 四、日志传输（Transports）

日志可以同时输出到多个目的地：Console（开发调试）、File（持久化）、HTTP/Stream（远程收集）。

日志轮转（Log Rotation）：按大小或时间切分日志文件，保留最近几天的日志，旧日志归档或删除。

---

## 五、子日志器（Child Loggers）

为请求创建子日志器，自动带上 requestId、userId 等上下文：

\`\`\`javascript
const reqLogger = logger.child({ requestId: 'req_abc', userId: 'u_1' });
reqLogger.info('开始处理请求'); // 自动带上 requestId
\`\`\`

---

## 六、异步日志

日志 I/O 不应阻塞事件循环。正确做法是：内存中维护缓冲区，异步批量写入，高吞吐量下也不会阻塞业务。

---

## 七、日志最佳实践

1. 永远不要记录敏感信息
2. 日志要有意义，不要打"到达这里"
3. 添加上下文，错误记录相关参数和状态
4. 使用合适的级别
5. 开发环境用 pretty 格式，生产环境用 JSON
6. 错误日志要包含堆栈信息
`,
    code: `// ============================================
// 从零构建类似 winston 的日志库
// 功能：分级输出、多transport、JSON格式、颜色、子日志器、异步写入
// ============================================

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };

const COLORS = {
  debug: '\\x1b[36m', info: '\\x1b[32m', warn: '\\x1b[33m',
  error: '\\x1b[31m', fatal: '\\x1b[41m', reset: '\\x1b[0m', dim: '\\x1b[2m',
};

class ConsoleTransport {
  constructor(options = {}) {
    this.colorize = options.colorize !== false;
    this.prettyPrint = options.prettyPrint !== false;
  }
  formatTimestamp(date) {
    const pad = n => String(n).padStart(2, '0');
    const padMs = n => String(n).padStart(3, '0');
    return \`\${date.getFullYear()}-\${pad(date.getMonth()+1)}-\${pad(date.getDate())} \${pad(date.getHours())}:\${pad(date.getMinutes())}:\${pad(date.getSeconds())}.\${padMs(date.getMilliseconds())}\`;
  }
  colorizeLevel(level) {
    const upper = level.toUpperCase().padEnd(5);
    if (!this.colorize) return \`[\${upper}]\`;
    return \`\${COLORS[level]}[\${upper}]\${COLORS.reset}\`;
  }
  log(entry) {
    const ts = this.formatTimestamp(new Date(entry.timestamp));
    const levelTag = this.colorizeLevel(entry.level);
    let line = \`\${COLORS.dim}\${ts}\${COLORS.reset} \${levelTag} \${entry.message}\`;
    const meta = { ...entry };
    delete meta.timestamp; delete meta.level; delete meta.message;
    if (Object.keys(meta).length > 0) {
      line += \`\\n\${COLORS.dim}\${JSON.stringify(meta, null, 2)}\${COLORS.reset}\`;
    }
    if (entry.stack) line += \`\\n\${COLORS.dim}\${entry.stack}\${COLORS.reset}\`;
    const stream = entry.level === 'error' || entry.level === 'fatal' ? process.stderr : process.stdout;
    stream.write(line + '\\n');
  }
}

class FileTransport {
  constructor(options = {}) {
    this.filename = options.filename || path.join(process.cwd(), 'app.log');
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.maxFiles = options.maxFiles || 5;
    this.buffer = [];
    this.writing = false;
    this.writeInterval = options.writeInterval || 1000;
    const dir = path.dirname(this.filename);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.flushTimer = setInterval(() => this.flush(), this.writeInterval);
    process.on('exit', () => this.flushSync());
  }
  checkRotation() {
    try {
      const stats = fs.statSync(this.filename);
      if (stats.size >= this.maxSize) this.rotate();
    } catch (e) {}
  }
  rotate() {
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = i === 1 ? this.filename : \`\${this.filename}.\${i - 1}\`;
      const newFile = \`\${this.filename}.\${i}\`;
      if (fs.existsSync(oldFile)) { try { fs.renameSync(oldFile, newFile); } catch (e) {} }
    }
  }
  async flush() {
    if (this.writing || this.buffer.length === 0) return;
    this.writing = true;
    this.checkRotation();
    const entries = this.buffer.splice(0);
    const data = entries.map(e => JSON.stringify(e)).join('\\n') + '\\n';
    fs.appendFile(this.filename, data, (err) => {
      this.writing = false;
      if (err) this.buffer.unshift(...entries);
    });
  }
  flushSync() {
    if (this.buffer.length === 0) return;
    clearInterval(this.flushTimer);
    const data = this.buffer.map(e => JSON.stringify(e)).join('\\n') + '\\n';
    try { fs.appendFileSync(this.filename, data); } catch (e) {}
    this.buffer = [];
  }
  log(entry) { this.buffer.push(entry); }
}

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.defaultMeta = options.defaultMeta || {};
    this.transports = options.transports || [new ConsoleTransport()];
    this.context = {};
  }
  isLevelEnabled(level) { return LOG_LEVELS[level] >= LOG_LEVELS[this.level]; }
  log(level, message, meta = {}) {
    if (!this.isLevelEnabled(level)) return;
    let msg = message, stack;
    if (message instanceof Error) { msg = message.message; stack = message.stack; }
    const entry = { timestamp: new Date().toISOString(), level, message: msg, ...this.defaultMeta, ...this.context, ...meta };
    if (stack) entry.stack = stack;
    for (const transport of this.transports) transport.log(entry);
  }
  debug(m, meta) { this.log('debug', m, meta); }
  info(m, meta) { this.log('info', m, meta); }
  warn(m, meta) { this.log('warn', m, meta); }
  error(m, meta) { this.log('error', m, meta); }
  fatal(m, meta) { this.log('fatal', m, meta); }
  child(bindings) {
    const child = new Logger({ level: this.level, defaultMeta: { ...this.defaultMeta, ...bindings }, transports: this.transports });
    child.context = { ...this.context, ...bindings };
    return child;
  }
}

function createLogger(options) { return new Logger(options); }

// 演示
console.log('=== 日志系统演示 ===\\n');
const logDir = path.join(__dirname, 'logs');
const logger = createLogger({
  level: 'debug',
  defaultMeta: { app: 'node4-demo', version: '1.0.0' },
  transports: [
    new ConsoleTransport({ colorize: true, prettyPrint: true }),
    new FileTransport({ filename: path.join(logDir, 'app.log'), maxSize: 1024 * 1024, maxFiles: 3 }),
  ],
});
logger.debug('数据库连接池初始化完成', { poolSize: 10 });
logger.info('服务启动成功', { port: 3000, env: 'development' });
logger.warn('内存使用率超过70%', { memoryUsage: process.memoryUsage().heapUsed });
logger.error('数据库查询失败', { query: 'SELECT * FROM users', errorCode: 'ECONNREFUSED' });
try { throw new Error('模拟未捕获异常'); } catch (err) { logger.fatal(err, { module: 'main' }); }

console.log('\\n--- 子日志器演示 ---');
function handleRequest(requestId, userId) {
  const reqLogger = logger.child({ requestId, userId });
  reqLogger.info('收到HTTP请求', { method: 'GET', path: '/api/users' });
  reqLogger.info('请求处理完成', { durationMs: 45, statusCode: 200 });
}
handleRequest('req_abc123', 'u_001');
handleRequest('req_def456', 'u_002');

console.log('\\n--- 级别过滤（warn级别）---');
const prodLogger = createLogger({ level: 'warn', transports: [new ConsoleTransport({ colorize: true })] });
prodLogger.debug('这条debug不显示');
prodLogger.info('这条info不显示');
prodLogger.warn('这条warn会显示');
prodLogger.error('这条error会显示');

setTimeout(() => {
  console.log('\\n=== 日志演示完成 ===');
  console.log(\`日志文件位置: \${path.join(logDir, 'app.log')}\`);
}, 1500);
`,
  },
  {
    id: "n4-performance",
    group: "第六部分 工程化",
    icon: "📊",
    title: "性能分析：profiling 与瓶颈定位",
    content: `# 性能分析：profiling 与瓶颈定位

## 一、Node.js 性能基础概念

### 1.1 CPU 密集型 vs I/O 密集型

| 类型 | 特点 | Node.js 表现 | 解决方案 |
|------|------|-------------|----------|
| **I/O 密集型** | 网络请求、文件读写、数据库查询 | 非阻塞I/O表现极佳 | 调大连接池、缓存 |
| **CPU 密集型** | 加密、图像处理、大数据循环、JSON解析 | 阻塞事件循环 | worker_threads、cluster |

> 「过早优化是万恶之源」—— 先测量，再优化！不要凭感觉猜哪里慢。

---

## 二、基础计时工具

### 2.1 console.time / console.timeEnd

\`\`\`javascript
console.time('parse');
JSON.parse(largeData);
console.timeEnd('parse'); // parse: 12.345ms
\`\`\`

### 2.2 process.hrtime.bigint()（纳秒级精度）

\`\`\`javascript
const start = process.hrtime.bigint();
// ... 执行操作
const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
\`\`\`

### 2.3 perf_hooks 模块

Node.js 内置性能钩子，类似浏览器 Performance API：

\`\`\`javascript
const { performance, PerformanceObserver } = require('perf_hooks');
performance.mark('start');
// ...
performance.mark('end');
performance.measure('op', 'start', 'end');
\`\`\`

---

## 三、CPU Profiling

### 3.1 --prof 生成 V8 分析日志

\`\`\`bash
node --prof app.js
node --prof-process v8.log > profile.txt
\`\`\`

### 3.2 --inspect + Chrome DevTools

\`\`\`bash
node --inspect app.js
\`\`\`
打开 chrome://inspect，使用 Profiler 标签录制火焰图。火焰图中X轴是时间，Y轴是调用栈深度，平顶宽块通常是瓶颈。

---

## 四、事件循环延迟监控

事件循环延迟高说明有阻塞操作。正常延迟 < 10ms。

---

## 五、常见性能反模式

| 反模式 | 问题 | 修复 |
|--------|------|------|
| 请求处理器用同步I/O | 阻塞所有并发请求 | 使用异步API |
| JSON.parse大对象 | 同步操作会卡 | 流式解析或拆分 |
| 灾难性回溯正则 | ReDoS漏洞 | 避免嵌套量词 |
| console.log高频调用 | 同步写stdout阻塞 | 使用异步日志 |
`,
    code: `// ============================================
// 性能分析与基准测试演示
// ============================================

const { performance, PerformanceObserver, monitorEventLoopDelay } = require('perf_hooks');
const crypto = require('crypto');

console.log('=== 性能分析演示 ===\\n');

console.log('--- 1. 不同计时方法精度对比 ---');
const t1 = Date.now();
for (let i = 0; i < 100000; i++) {}
console.log(\`Date.now() 测量10万次空循环: \${Date.now() - t1}ms\`);

const h1 = process.hrtime.bigint();
for (let i = 0; i < 100000; i++) {}
console.log(\`hrtime.bigint(): \${(Number(process.hrtime.bigint() - h1) / 1e6).toFixed(3)}ms\`);

console.time('console.time 测量');
for (let i = 0; i < 1000000; i++) {}
console.timeEnd('console.time 测量');

console.log('\\n--- 2. perf_hooks Performance API ---');
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach(e => console.log(\`  [perf] \${e.name}: \${e.duration.toFixed(3)}ms\`));
  performance.clearMarks(); performance.clearMeasures();
});
obs.observe({ entryTypes: ['measure'] });

const largeObj = { users: Array.from({ length: 10000 }, (_, i) => ({ id: i, name: \`User\${i}\`, data: crypto.randomBytes(10).toString('hex') })) };
performance.mark('s0');
const jsonStr = JSON.stringify(largeObj);
performance.mark('s1');
performance.measure('JSON.stringify 1万条', 's0', 's1');
performance.mark('p0');
JSON.parse(jsonStr);
performance.mark('p1');
performance.measure('JSON.parse 1万条', 'p0', 'p1');

console.log('\\n--- 3. 函数基准测试 ---');
function benchmark(name, fn, iterations = 1000) {
  for (let i = 0; i < Math.min(100, iterations / 10); i++) fn();
  const durations = [];
  for (let i = 0; i < iterations; i++) {
    const s = performance.now(); fn(); durations.push(performance.now() - s);
  }
  durations.sort((a, b) => a - b);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  console.log(\`  【\${name}】\${iterations}次 | 平均:\${avg.toFixed(4)}ms P50:\${p50.toFixed(4)}ms P95:\${p95.toFixed(4)}ms\`);
}

const testArr = Array.from({ length: 1000 }, (_, i) => i % 200);
benchmark('Set去重', () => [...new Set(testArr)], 10000);
benchmark('filter+indexOf', () => testArr.filter((item, idx) => testArr.indexOf(item) === idx), 10000);

console.log('\\n--- 4. 事件循环阻塞检测 ---');
let maxLag = 0;
const lagTimer = setInterval(() => {
  const s = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - s) / 1e6;
    if (lag > maxLag) maxLag = lag;
    if (lag > 20) console.log(\`  ⚠️ 事件循环延迟: \${lag.toFixed(2)}ms\`);
  });
}, 50);

await new Promise(r => setTimeout(r, 100));
console.log('  执行阻塞操作（500万次循环）...');
let sum = 0;
for (let i = 0; i < 5000000; i++) sum += Math.sqrt(i);
await new Promise(r => setTimeout(r, 100));
clearInterval(lagTimer);
console.log(\`  最大延迟: \${maxLag.toFixed(2)}ms\`);

setTimeout(() => {
  console.log('\\n=== 性能分析演示完成 ===');
  console.log('提示: node --inspect 连接Chrome DevTools查看火焰图');
}, 500);
`,
  },
  {
    id: "n4-memory",
    group: "第六部分 工程化",
    icon: "🧠",
    title: "内存管理与泄漏排查",
    content: `# 内存管理与泄漏排查

## 一、V8 内存结构

- **新生代（New Space）**：16-128MB，新创建的短生命周期对象，Scavenge GC，速度快
- **老生代（Old Space）**：约1.4GB，长期存活的对象，Mark-Sweep-Compact GC，停顿较长
- **Large Object Space**：大对象直接分配在老生代
- **External**：C++层分配的内存（如Buffer底层数据）

---

## 二、垃圾回收基础

GC Roots包括：全局对象、调用栈变量、闭包引用变量。从Roots出发可达的对象存活，不可达的被回收。

新生代经历2次GC仍存活就晋升到老生代。

---

## 三、process.memoryUsage()

| 字段 | 说明 |
|------|------|
| **heapUsed** | JS堆已用内存，持续增长说明可能泄漏 |
| **heapTotal** | V8申请的堆总大小 |
| **rss** | 进程总物理内存 |
| **external** | C++层内存 |

---

## 四、常见内存泄漏模式

1. **全局变量/闭包意外持有引用**：大数组被闭包捕获无法回收
2. **未移除的事件监听器**：每次请求on添加监听器从不移除
3. **无界缓存**：Map/Object缓存无限增长
4. **未清理的定时器**：setInterval持有回调引用
5. **未销毁的Stream**：流未正确关闭

修复：使用LRU缓存、及时removeListener、clearInterval、销毁stream。

---

## 五、排查工具

- \`node --expose-gc\` + \`global.gc()\` 手动触发GC
- \`node --inspect\` + Chrome DevTools拍堆快照对比
- 定期打印memoryUsage观察趋势：锯齿形正常，持续上升是泄漏
`,
    code: `// ============================================
// 内存管理与泄漏排查演示
// ============================================

const { EventEmitter } = require('events');

console.log('=== 内存管理演示 ===\\n');

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
function logMem(label) {
  const m = process.memoryUsage();
  console.log(\`  [\${label}] heapUsed:\${formatBytes(m.heapUsed)} rss:\${formatBytes(m.rss)}\`);
}

console.log('--- 1. 正常GC行为 ---');
logMem('初始');
function allocObjs(count, size) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push({ id: i, data: Buffer.alloc(size, 'x').toString() });
  return arr;
}
let data = allocObjs(1000, 1024);
logMem('分配1000个1KB对象');
data = null;
if (global.gc) { console.log('  (手动GC)'); global.gc(); }
else console.log('  (提示: node --expose-gc 可手动GC)');
logMem('释放引用后');

console.log('\\n--- 2. 无界缓存泄漏 vs LRU缓存 ---');
const badCache = {};
let badSize = 0;
class LRUCache {
  constructor(max = 100) { this.max = max; this.cache = new Map(); }
  get(k) { if (!this.cache.has(k)) return; const v = this.cache.get(k); this.cache.delete(k); this.cache.set(k, v); return v; }
  set(k, v) { if (this.cache.has(k)) this.cache.delete(k); this.cache.set(k, v); if (this.cache.size > this.max) this.cache.delete(this.cache.keys().next().value); }
  size() { return this.cache.size; }
}
const goodCache = new LRUCache(100);
logMem('插入前');
for (let i = 0; i < 10000; i++) {
  const k = \`key\${i}\`, v = { i, p: 'x'.repeat(500) };
  badCache[k] = v; badSize++; goodCache.set(k, v);
}
logMem('插入10000条后');
console.log(\`  坏缓存条目: \${badSize} (泄漏!) | LRU缓存: \${goodCache.size()} (正常淘汰)\`);

console.log('\\n--- 3. 事件监听器泄漏 ---');
const emitter = new EventEmitter();
for (let i = 0; i < 5; i++) emitter.on('data', () => {});
console.log(\`  data事件监听器数量: \${emitter.listenerCount('data')} (持续增长=泄漏)\`);
emitter.removeAllListeners('data');

console.log('\\n--- 4. WeakRef和FinalizationRegistry ---');
let obj = { name: '大对象' };
const weakRef = new WeakRef(obj);
console.log('  GC前 WeakRef:', weakRef.deref() ? '对象存在' : '已回收');
obj = null;
if (global.gc) { global.gc(); console.log('  GC后 WeakRef:', weakRef.deref() ? '仍存在' : '已回收 ✅'); }

const registry = new FinalizationRegistry(v => console.log(\`  🗑️ 对象被GC: \${v}\`));
let obj2 = { name: '临时' };
registry.register(obj2, 'obj2-临时');
obj2 = null;
if (global.gc) global.gc();

setTimeout(() => console.log('\\n=== 内存管理演示完成 ==='), 1000);
`,
  },
  {
    id: "n4-cluster",
    group: "第六部分 工程化",
    icon: "🏭",
    title: "cluster 集群：多进程充分利用多核 CPU",
    content: `# cluster 集群：多进程充分利用多核 CPU

## 一、为什么需要 cluster

Node.js 默认单进程单线程运行，即便服务器有 32 核 CPU 也只能用 1 核，浪费严重。cluster 模块让 Node.js 应用可以 fork 出多个进程共享同一个端口，充分利用多核。

## 二、cluster 工作模型

- **Primary 主进程**：负责监听端口、fork worker 进程、管理worker生命周期
- **Worker 工作进程**：实际处理业务逻辑，独立的V8实例，独立事件循环
- **IPC通信**：进程间通过 process.send() / message 事件传递消息

默认使用**Round-Robin轮询**（Windows除外）：主进程接受连接后按顺序分发给worker。

## 三、核心特性

### 3.1 自动重启
worker崩溃退出时，主进程收到exit事件，重新fork新的worker。

### 3.2 零停机重启
逐个重启worker：fork新worker，等待其就绪，kill旧worker，循环直到全部更新。

### 3.3 端口共享
多个worker可以监听同一个端口：socket句柄由主进程创建后传递给worker。

## 四、cluster vs child_process vs worker_threads

| 方案 | 适用场景 | 内存共享 | 通信 | 开销 |
|------|----------|---------|------|------|
| **cluster** | Web服务多进程部署 | 不共享 | IPC(JSON) | 大 |
| **child_process.fork** | 独立子进程任务 | 不共享 | IPC | 大 |
| **worker_threads** | CPU密集并行 | SharedArrayBuffer | postMessage | 小 |
`,
    code: `// ============================================
// cluster 集群演示
// 注意：需要作为独立文件运行，不能直接复制到REPL
// ============================================

const cluster = require('cluster');
const http = require('http');
const os = require('os');
const path = require('path');

const PORT = 3000;
const NUM_CPUS = os.cpus().length;

if (cluster.isPrimary) {
  console.log(\`=== 主进程 \${process.pid} 启动 ===\`);
  console.log(\`CPU核心数: \${NUM_CPUS}，将fork \${NUM_CPUS} 个worker\\n\`);

  const workers = [];
  const requests = new Map();

  for (let i = 0; i < NUM_CPUS; i++) {
    const worker = cluster.fork({ WORKER_ID: i });
    workers.push(worker);
    requests.set(worker.id, 0);
    worker.on('message', (msg) => {
      if (msg.type === 'request') requests.set(worker.id, (requests.get(worker.id) || 0) + 1);
      if (msg.type === 'broadcast') workers.filter(w => w.id !== worker.id).forEach(w => w.send(msg));
    });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(\`\\n⚠️ Worker \${worker.process.pid} 退出 (code:\${code} signal:\${signal})，2秒后重启...\`);
    setTimeout(() => {
      const newWorker = cluster.fork();
      requests.set(newWorker.id, 0);
      console.log(\`✅ 新Worker \${newWorker.process.pid} 已启动\`);
    }, 2000);
  });

  setInterval(() => {
    let total = 0;
    console.log('\\n📊 Worker 负载统计:');
    for (const [id, count] of requests) {
      console.log(\`  Worker ID=\${id} 请求数=\${count}\`);
      total += count;
    }
    console.log(\`  总计请求: \${total}\`);
  }, 5000);

  process.on('SIGUSR2', () => {
    console.log('\\n🔄 收到SIGUSR2，开始零停机重启...');
    const restartOne = (idx) => {
      if (idx >= workers.length) { console.log('✅ 零停机重启完成'); return; }
      const oldWorker = workers[idx];
      const newWorker = cluster.fork();
      newWorker.on('listening', () => {
        console.log(\`  新Worker \${newWorker.process.pid} ready，kill旧Worker \${oldWorker.process.pid}\`);
        oldWorker.kill('SIGTERM');
        workers[idx] = newWorker;
        setTimeout(() => restartOne(idx + 1), 1000);
      });
    };
    restartOne(0);
  });

} else {
  const workerId = process.env.WORKER_ID;
  const pid = process.pid;
  console.log(\`  Worker #\${workerId} (PID:\${pid}) 已启动\`);

  const server = http.createServer((req, res) => {
    process.send({ type: 'request' });
    if (req.url === '/crash') {
      console.log(\`  Worker #\${workerId} 将在500ms后崩溃\`);
      setTimeout(() => process.exit(1), 500);
      res.end(\`Worker #\${workerId} 即将崩溃!\`);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ workerId, pid, pid: process.pid, url: req.url }));
  });

  server.listen(PORT, () => { console.log(\`  Worker #\${workerId} 监听端口 \${PORT}\`); });

  process.on('SIGTERM', () => {
    console.log(\`  Worker #\${workerId} (PID:\${pid}) 收到SIGTERM，优雅退出...\`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000);
  });
}
`,
  },
  {
    id: "n4-worker-threads",
    group: "第六部分 工程化",
    icon: "🧵",
    title: "worker_threads：CPU 密集型任务并行",
    content: `# worker_threads：CPU 密集型任务并行

## 一、何时用 worker_threads

- **CPU密集**：斐波那契、大素数计算、图像处理、大数据排序、复杂正则 → 用worker_threads
- **I/O密集**：HTTP请求、数据库查询 → 用异步I/O或cluster即可，不需要thread

worker_threads 是真正的操作系统线程，共享进程内存空间（通过SharedArrayBuffer），通信开销比进程IPC小得多。

## 二、核心 API

| API | 作用 |
|-----|------|
| **Worker** | 创建新工作线程，传入脚本路径或URL |
| **parentPort** | 子线程中使用，向主线程发消息 |
| **workerData** | 主线程传给子线程的初始数据（拷贝） |
| **MessageChannel** | 创建一对连通的MessagePort实现线程间直接通信 |
| **SharedArrayBuffer** | 共享内存，多线程可直接读写 |
| **Atomics** | 原子操作，避免共享内存竞态条件 |

## 三、transferList 传输所有权

ArrayBuffer、MessagePort等可以通过transferList传递所有权，传输后原线程不可再用，零拷贝。

## 四、Worker Pool 模式

预先创建固定数量的worker，任务分配给空闲worker，避免频繁创建销毁线程开销。
`,
    code: `// ============================================
// worker_threads 演示
// ============================================

const { Worker, isMainThread, parentPort, workerData, MessageChannel, WorkerPool } = require('worker_threads');
const os = require('os');
const NUM_CPUS = os.cpus().length;

function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}

if (isMainThread) {
  console.log('=== worker_threads 演示 ===\\n');

  console.log('--- 1. 单线程阻塞演示 ---');
  {
    const start = Date.now();
    fib(42);
    console.log(\`  单线程计算fib(42)耗时: \${Date.now() - start}ms\`);
  }

  console.log('\\n--- 2. 使用Worker并行计算 ---');
  async function runWorker(n) {
    return new Promise((resolve, reject) => {
      const w = new Worker(__filename, { workerData: { n } });
      w.on('message', resolve);
      w.on('error', reject);
      w.on('exit', (code) => { if (code !== 0) reject(new Error(\`exit \${code}\`)); });
    });
  }
  {
    const start = Date.now();
    const results = await Promise.all([runWorker(40), runWorker(40), runWorker(40), runWorker(40)]);
    console.log(\`  4个Worker并行计算fib(40)x4: \${Date.now() - start}ms, 结果:\${results.join(',')}\`);
  }

  console.log('\\n--- 3. Worker Pool 线程池 ---');
  class SimplePool {
    constructor(size) {
      this.size = size; this.workers = []; this.queue = []; this.idle = [];
      for (let i = 0; i < size; i++) {
        const w = new Worker(__filename, { workerData: { mode: 'pool' } });
        w._id = i; this.workers.push(w); this.idle.push(w);
        w.on('message', (result) => {
          w._resolve(result);
          if (this.queue.length > 0) {
            const { task, resolve, reject } = this.queue.shift();
            w._resolve = resolve; w._reject = reject; w.postMessage(task);
          } else { this.idle.push(w); }
        });
      }
    }
    exec(task) {
      return new Promise((resolve, reject) => {
        if (this.idle.length > 0) {
          const w = this.idle.pop();
          w._resolve = resolve; w._reject = reject;
          w.postMessage(task);
        } else this.queue.push({ task, resolve, reject });
      });
    }
  }
  const pool = new SimplePool(Math.min(NUM_CPUS, 4));
  const start2 = Date.now();
  const tasks = Array.from({ length: 8 }, (_, i) => pool.exec({ n: 38 + i % 3 }));
  const res2 = await Promise.all(tasks);
  console.log(\`  线程池处理8个fib任务: \${Date.now() - start2}ms\`);

  console.log('\\n--- 4. MessageChannel 双线程直接通信 ---');
  const ch = new MessageChannel();
  const w1 = new Worker(__filename, { workerData: { mode: 'channel', port: ch.port1 }, transferList: [ch.port1] });
  const w2 = new Worker(__filename, { workerData: { mode: 'channel', port: ch.port2 }, transferList: [ch.port2] });
  w1.postMessage({ cmd: 'send', to: 'w2', msg: 'hello from w1' });
  setTimeout(() => { w1.terminate(); w2.terminate(); console.log('\\n=== worker_threads 演示完成 ==='); }, 500);

} else {
  if (workerData.mode === 'channel') {
    const port = workerData.port;
    port.on('message', (m) => {
      console.log(\`  线程\${process.env.WORKER_ID || '?'} 收到: \${JSON.stringify(m)}\`);
      if (m.reply) port.postMessage({ reply: true, msg: 'got it' });
    });
  } else {
    parentPort.on('message', (task) => {
      const result = fib(task.n);
      parentPort.postMessage(result);
    });
    parentPort.postMessage(fib(workerData.n));
  }
}
`,
  },
  {
    id: "n4-process-mgmt",
    group: "第六部分 工程化",
    icon: "🔄",
    title: "进程管理：守护进程与 PM2 原理",
    content: `# 进程管理：守护进程与 PM2 原理

## 一、为什么需要进程管理器

生产环境不能直接 \`node app.js\`：终端关闭进程就退出，崩溃了无法自动重启，也没法多核利用、监控状态。

进程管理器（如PM2）解决：
- **守护**：后台运行，不依赖终端
- **自动重启**：崩溃或内存超限自动拉起
- **负载均衡**：内置cluster多进程
- **日志管理**：收集stdout/stderr到文件
- **监控**：CPU/内存状态面板
- **零停机重启**：重载时不中断服务

## 二、守护进程（Daemon）原理

守护进程是脱离终端、在后台长期运行的进程。创建步骤：
1. \`spawn\`时设置\`detached: true\`
2. \`child.unref()\`让父进程可以独立退出
3. 重定向stdin/stdout/stderr到文件（丢弃或写日志）
4. 将PID写入pidfile方便管理

## 三、进程信号

| 信号 | 含义 | 默认行为 | Node中如何处理 |
|------|------|---------|---------------|
| **SIGINT** | Ctrl+C中断 | 终止 | 优雅关闭 |
| **SIGTERM** | 请求终止（kill默认） | 终止 | 优雅关闭（先处理完请求） |
| **SIGKILL** | 强制杀死 | 终止 | 不能捕获！最后手段 |
| **SIGHUP** | 终端断开/重载配置 | 终止 | 通常用于reload配置 |

## 四、优雅关闭（Graceful Shutdown）

收到SIGTERM时不要立即退出：
1. 停止接受新连接（server.close()）
2. 等待已接收请求处理完成
3. 关闭数据库连接
4. 清理资源
5. 退出进程
`,
    code: `// ============================================
// 进程管理：守护进程 + 优雅关闭 + 简单监控器
// ============================================

const { spawn, fork } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.env.MY_PROCESS_MANAGER !== 'true') {
  console.log('=== 进程管理器演示 ===\\n');
  const __thisFile = __filename;
  function startDaemon() {
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const outLog = fs.openSync(path.join(logDir, 'daemon-out.log'), 'a');
    const errLog = fs.openSync(path.join(logDir, 'daemon-err.log'), 'a');
    const child = spawn(process.execPath, [__thisFile], {
      detached: true, stdio: ['ignore', outLog, errLog, 'ipc'],
      env: { ...process.env, MY_PROCESS_MANAGER: 'true', DAEMON_MODE: 'true' }
    });
    child.unref();
    fs.writeFileSync(path.join(logDir, 'daemon.pid'), String(child.pid));
    console.log(\`✅ 守护进程已启动 PID=\${child.pid}\`);
    return child;
  }

  function stopDaemon() {
    const pidFile = path.join(__dirname, 'logs', 'daemon.pid');
    if (!fs.existsSync(pidFile)) { console.log('没有运行中的守护进程'); return false; }
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8'), 10);
    try {
      process.kill(pid, 'SIGTERM');
      console.log(\`📤 已发送SIGTERM到PID \${pid}\`);
      fs.unlinkSync(pidFile);
      return true;
    } catch (e) { console.log(\`发送信号失败: \${e.message}\`); fs.unlinkSync(pidFile); return false; }
  }

  const cmd = process.argv[2] || 'demo';
  if (cmd === 'start') { startDaemon(); }
  else if (cmd === 'stop') { stopDaemon(); }
  else {
    console.log('--- 演示优雅关闭 ---');
    const child = fork(__thisFile, ['child-server'], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
    child.stdout.on('data', d => process.stdout.write('  [子进程] ' + d));
    setTimeout(() => {
      console.log('\\n  发送SIGTERM给子进程，观察优雅关闭...');
      child.kill('SIGTERM');
    }, 2000);
    child.on('exit', (code) => {
      console.log(\`  子进程退出码: \${code}\\n\`);
      console.log('--- 守护进程命令示例 ---');
      console.log(\`  node \${path.basename(__filename)} start   # 启动守护进程\`);
      console.log(\`  node \${path.basename(__filename)} stop    # 停止守护进程\`);
    });
  }

} else if (process.env.DAEMON_MODE === 'true') {
  const pid = process.pid;
  const log = (m) => fs.appendFileSync(path.join(__dirname, 'logs', 'daemon.log'), \`[\${new Date().toISOString()}] \${m}\\n\`);
  log(\`守护进程启动 PID=\${pid}\`);

  let activeRequests = 0;
  let shuttingDown = false;
  const interval = setInterval(() => { log(\`心跳 active=\${activeRequests}\`); }, 5000);

  process.on('SIGTERM', () => {
    log('收到SIGTERM，开始优雅关闭...');
    shuttingDown = true;
    clearInterval(interval);
    const tryExit = () => {
      if (activeRequests === 0) {
        log('所有请求已完成，退出');
        process.exit(0);
      } else {
        log(\`等待\${activeRequests}个请求完成...\`);
        setTimeout(tryExit, 200);
      }
    };
    setTimeout(() => { log('等待超时，强制退出'); process.exit(1); }, 5000);
    tryExit();
  });

  process.on('SIGINT', () => process.kill(process.pid, 'SIGTERM'));
  process.on('uncaughtException', (e) => { log(\`未捕获异常: \${e.stack}\`); });

} else if (process.argv[2] === 'child-server') {
  console.log('子服务启动，PID=' + process.pid);
  let active = 0;
  const fakeReq = setInterval(() => {
    active++;
    setTimeout(() => active--, 1000 + Math.random() * 1000);
  }, 300);
  process.on('SIGTERM', () => {
    console.log('收到SIGTERM，停止接新请求，等待' + active + '个活跃请求...');
    clearInterval(fakeReq);
    const check = setInterval(() => {
      if (active === 0) { clearInterval(check); console.log('所有请求处理完毕，退出'); process.exit(0); }
    }, 100);
    setTimeout(() => { console.log('优雅退出超时，强制退出'); process.exit(1); }, 4000);
  });
}
`,
  },
  {
    id: "n4-docker-deploy",
    group: "第六部分 工程化",
    icon: "🐳",
    title: "Docker 容器化部署",
    content: `# Docker 容器化部署

## 一、Docker 基础概念

| 概念 | 说明 |
|------|------|
| **镜像（Image）** | 只读模板，包含运行应用所需的代码、运行时、库、配置 |
| **容器（Container）** | 镜像的运行实例，轻量级，相互隔离 |
| **Dockerfile** | 构建镜像的脚本，定义每一层 |
| **Registry** | 镜像仓库（Docker Hub、私有仓库） |

容器 vs VM：容器共享宿主机内核，只隔离开进程、文件系统、网络，MB级别；VM是完整OS，GB级别。

## 二、Dockerfile 指令

| 指令 | 作用 |
|------|------|
| **FROM** | 基础镜像（如node:20-alpine） |
| **WORKDIR** | 工作目录（相当于cd） |
| **COPY** | 复制文件到镜像 |
| **RUN** | 构建时执行命令（安装依赖等） |
| **ENV** | 环境变量 |
| **EXPOSE** | 声明监听端口 |
| **CMD** | 容器启动时执行的命令（最后一条） |
| **USER** | 指定运行用户（不要用root！） |

## 三、Node.js Docker 最佳实践

1. 使用alpine镜像（小，约100MB vs 1GB）
2. 多阶段构建：构建阶段装全依赖，运行阶段只装production依赖
3. 先copy package.json再npm install，利用Docker缓存
4. .dockerignore排除node_modules、.git、logs
5. 用非root用户运行
6. npm ci而不是npm install（确定性安装）
7. 正确处理SIGTERM：用exec form或者tini做init

## 四、Docker Compose

定义多服务（app + db + redis）的yaml文件，一键启动整个栈。
`,
    code: `// ============================================
// Docker 部署相关文件生成演示
// 运行此脚本会在 ./docker-demo/ 生成一个可直接build的Node.js Docker项目
// ============================================

const fs = require('fs');
const path = require('path');

const demoDir = path.join(__dirname, 'docker-demo');
if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true });

console.log('=== Docker 部署演示：生成示例文件 ===\\n');

const dockerfile = \`# ============================================
# Node.js Dockerfile 最佳实践（多阶段构建）
# ============================================

# ---------- 第一阶段：构建阶段 ----------
FROM node:20-alpine AS builder
WORKDIR /app
# 先复制package文件利用Docker缓存
COPY package*.json ./
# 安装所有依赖（包括devDependencies用于构建）
RUN npm ci --frozen-lockfile || npm install
# 复制源代码
COPY . .
# 如果有构建步骤（如TypeScript编译）在这里执行
# RUN npm run build

# ---------- 第二阶段：运行阶段 ----------
FROM node:20-alpine AS runtime
# 安装tini处理PID 1信号问题
RUN apk add --no-cache tini
# 创建非root用户
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
WORKDIR /app
# 只复制package文件和生产依赖
COPY package*.json ./
RUN npm ci --production --frozen-lockfile || npm install --production
# 从builder阶段复制构建产物或源代码
COPY --from=builder /app/src ./src
# 更改文件所有者
RUN chown -R nodeapp:nodeapp /app
# 使用非root用户
USER nodeapp
EXPOSE 3000
ENV NODE_ENV=production
# tini作init进程，正确转发信号
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
\`;

const dockerignore = \`node_modules
npm-debug.log
.git
.gitignore
*.md
.env
.env.*
logs
.nyc_output
coverage
.DS_Store
\`;

const packageJson = JSON.stringify({
  name: "docker-node-demo", version: "1.0.0",
  scripts: { start: "node src/server.js" },
  dependencies: {}
}, null, 2);

const server = \`const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', pid: process.pid }));
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ msg: 'Hello from Docker!', pid: process.pid, time: new Date().toISOString() }));
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
});
server.listen(port, () => console.log(\`Server running on port \${port}, PID=\${process.pid}\`));
\`;

const composeYml = \`version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
\`;

const srcDir = path.join(demoDir, 'src');
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
fs.writeFileSync(path.join(demoDir, 'Dockerfile'), dockerfile);
fs.writeFileSync(path.join(demoDir, '.dockerignore'), dockerignore);
fs.writeFileSync(path.join(demoDir, 'package.json'), packageJson);
fs.writeFileSync(path.join(srcDir, 'server.js'), server);
fs.writeFileSync(path.join(demoDir, 'docker-compose.yml'), composeYml);

console.log('✅ 已在 ./docker-demo/ 生成以下文件：');
console.log('  ├── Dockerfile        (多阶段构建，非root用户)');
console.log('  ├── .dockerignore     (排除不必要文件)');
console.log('  ├── package.json');
console.log('  ├── docker-compose.yml(含健康检查)');
console.log('  └── src/server.js     (优雅关闭的HTTP服务)');
console.log('');
console.log('--- 构建和运行命令 ---');
console.log('  cd docker-demo');
console.log('  docker build -t my-node-app .');
console.log('  docker run -p 3000:3000 my-node-app');
console.log('  docker-compose up -d');
console.log('  curl http://localhost:3000/health');
`,
  },
  {
    id: "n4-npm-publish",
    group: "第六部分 工程化",
    icon: "📦",
    title: "npm 包开发：从编写到发布",
    content: `# npm 包开发：从编写到发布

## 一、npm 包结构

一个可发布的npm包至少包含：
- **package.json**：包元信息（name, version, main, files等）
- **index.js** 或 **main字段指定的入口**
- **README.md**：使用文档

## 二、package.json 关键字段

| 字段 | 说明 |
|------|------|
| **name** | 包名，全局唯一，scoped包格式\`@scope/name\` |
| **version** | 语义化版本：\`major.minor.patch\` |
| **main** | CommonJS入口，Node原生支持 |
| **module** | ESM入口，构建工具(webpack/rollup)使用 |
| **exports** | 现代入口映射，可定义子路径导入 |
| **bin** | CLI命令名到可执行文件的映射 |
| **files** | 要发布的文件白名单（优于.npmignore） |
| **type** | "module"表示ESM，默认是CommonJS |
| **dependencies** | 运行时依赖，会被安装到用户的node_modules |
| **peerDependencies** | 同伴依赖（如插件依赖宿主包版本） |
| **devDependencies** | 开发依赖，不会随包安装 |

## 三、语义化版本（SemVer）

- **major**：不兼容的API变更（1.0.0→2.0.0）
- **minor**：向下兼容的功能新增（1.0.0→1.1.0）
- **patch**：向下兼容的bug修复（1.0.0→1.0.1）
- 预发布标签：1.0.0-beta.1、1.0.0-alpha.2

## 四、发布流程

1. \`npm login\` 登录账号
2. \`npm version <major|minor|patch>\` 升级版本（自动打git tag）
3. \`npm publish\` 发布（scoped公共包需--access public）
4. 打标签：\`npm dist-tag add pkg@1.0.0 latest\`、\`beta\`、\`next\`

## 五、本地测试

- \`npm link\` 在包目录创建全局软链
- 在测试项目里 \`npm link <包名>\` 引用本地包

## 六、CLI包

bin字段指向可执行文件，文件首行必须是\`#!/usr/bin/env node\`，npm会自动创建软链到PATH。
`,
    code: `// ============================================
// npm包开发演示：生成一个可发布的字符串工具包
// 运行此脚本生成 ./str-utils/ 目录包含完整包结构
// ============================================

const fs = require('fs');
const path = require('path');

const pkgDir = path.join(__dirname, 'str-utils-pkg');
if (!fs.existsSync(pkgDir)) fs.mkdirSync(pkgDir, { recursive: true });

console.log('=== npm 包开发演示 ===\\n');

const pkg = {
  name: "@your-scope/str-utils-demo", version: "1.0.0",
  description: "一个简单的字符串工具函数包 - Node.js教程演示",
  main: "src/index.js",
  bin: { "str-utils": "bin/cli.js" },
  files: ["src", "bin", "README.md"],
  scripts: { test: "node test.js" },
  keywords: ["string", "utils", "nodejs-tutorial"],
  author: "Your Name", license: "MIT",
  engines: { node: ">=14.0.0" }
};

const srcCode = \`// ============================================
// 字符串工具函数库 - npm包入口
// ============================================

function camelCase(str) {
  return str.replace(/[-_\\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[_\\s]+/g, '-').toLowerCase();
}

function snakeCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[-\\s]+/g, '_').toLowerCase();
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function titleCase(str) { return str.toLowerCase().replace(/\\b\\w/g, c => c.toUpperCase()); }

function truncate(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

function reverse(str) { return str.split('').reverse().join(''); }
function isPalindrome(str) { const s = str.toLowerCase().replace(/[^a-z0-9]/g, ''); return s === reverse(s); }
function words(str) { return str.match(/[A-Za-z0-9]+/g) || []; }
function count(str, substr) { return (str.match(new RegExp(substr.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g')) || []).length; }

function pad(str, length, char = ' ', side = 'both') {
  if (str.length >= length) return str;
  const padLen = length - str.length;
  if (side === 'left') return char.repeat(padLen) + str;
  if (side === 'right') return str + char.repeat(padLen);
  const left = Math.floor(padLen / 2), right = padLen - left;
  return char.repeat(left) + str + char.repeat(right);
}

module.exports = { camelCase, kebabCase, snakeCase, capitalize, titleCase, truncate, reverse, isPalindrome, words, count, pad };
module.exports.default = module.exports;
\`;

const cliCode = \`#!/usr/bin/env node
// ============================================
// CLI入口 - npm link后可以直接用 str-utils 命令
// ============================================

const { camelCase, kebabCase, snakeCase, capitalize, titleCase, truncate, reverse, isPalindrome, words, pad } = require('../src/index');

const args = process.argv.slice(2);
const cmd = args[0];
const input = args.slice(1).join(' ');

const colors = { reset: '\\x1b[0m', green: '\\x1b[32m', cyan: '\\x1b[36m', yellow: '\\x1b[33m' };
function print(label, value) { console.log(\`  \${colors.cyan}\${label.padEnd(12)}\${colors.reset} \${colors.green}\${value}\${colors.reset}\`); }

if (!cmd || cmd === 'help' || cmd === '-h') {
  console.log(\`\${colors.yellow}str-utils - 字符串工具 CLI\${colors.reset}\\n\`);
  console.log('用法: str-utils <命令> <字符串>\\n');
  console.log('命令: camel, kebab, snake, cap, title, truncate, reverse, palindrome, words, pad');
  process.exit(0);
}

switch (cmd) {
  case 'camel': print('camelCase', camelCase(input)); break;
  case 'kebab': print('kebab-case', kebabCase(input)); break;
  case 'snake': print('snake_case', snakeCase(input)); break;
  case 'cap': print('capitalize', capitalize(input)); break;
  case 'title': print('Title Case', titleCase(input)); break;
  case 'reverse': print('reversed', reverse(input)); break;
  case 'palindrome': print('palindrome?', isPalindrome(input) ? 'Yes' : 'No'); break;
  case 'words': print('words', words(input).join(', ')); break;
  case 'pad': print('padded', pad(input, 40, '-', 'both')); break;
  default: console.log('未知命令: ' + cmd);
}
\`;

const testCode = \`const utils = require('./src/index');
const assert = require('assert');
let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('  ✅', name); } catch (e) { failed++; console.log('  ❌', name, e.message); } }

test('camelCase', () => { assert.strictEqual(utils.camelCase('hello-world-test'), 'helloWorldTest'); });
test('kebabCase', () => { assert.strictEqual(utils.kebabCase('helloWorld test'), 'hello-world-test'); });
test('truncate', () => { assert.strictEqual(utils.truncate('hello world', 8), 'hello...'); });
test('isPalindrome', () => { assert.strictEqual(utils.isPalindrome('A man a plan a canal Panama'), true); });

console.log(\`\\n测试结果: \${passed}通过 \${failed}失败\`);
if (failed > 0) process.exit(1);
\`;

const readme = \`# @your-scope/str-utils-demo

一个简单的字符串工具函数包。

## 安装

\\\`\\\`\\\`bash
npm install @your-scope/str-utils-demo
\\\`\\\`\\\`

## 使用

\\\`\\\`\\\`javascript
const { camelCase, kebabCase } = require('@your-scope/str-utils-demo');
console.log(camelCase('hello-world')); // helloWorld
\\\`\\\`\\\`

## CLI

\\\`\\\`\\\`bash
npm install -g @your-scope/str-utils-demo
str-utils camel "hello world"
\\\`\\\`\\\`

## API

- camelCase(str)
- kebabCase(str)
- snakeCase(str)
- capitalize(str)
- titleCase(str)
- truncate(str, maxLength, suffix?)
- reverse(str)
- isPalindrome(str)
- words(str)
- count(str, substr)
- pad(str, length, char?, side?)
\`;

const srcDir = path.join(pkgDir, 'src');
const binDir = path.join(pkgDir, 'bin');
fs.mkdirSync(srcDir, { recursive: true }); fs.mkdirSync(binDir, { recursive: true });
fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(pkg, null, 2));
fs.writeFileSync(path.join(srcDir, 'index.js'), srcCode);
fs.writeFileSync(path.join(binDir, 'cli.js'), cliCode);
fs.chmodSync(path.join(binDir, 'cli.js'), 0o755);
fs.writeFileSync(path.join(pkgDir, 'test.js'), testCode);
fs.writeFileSync(path.join(pkgDir, 'README.md'), readme);

console.log('✅ 已在 ./str-utils-pkg/ 生成完整npm包结构：');
console.log('  ├── package.json   (name/version/main/bin/files)');
console.log('  ├── README.md');
console.log('  ├── test.js');
console.log('  ├── src/index.js   (工具函数实现)');
console.log('  └── bin/cli.js     (命令行工具)');
console.log('');
console.log('--- 本地测试流程 ---');
console.log('  cd str-utils-pkg');
console.log('  npm test           # 运行测试');
console.log('  npm link           # 全局链接（可能需要sudo）');
console.log('  str-utils camel "hello world"  # CLI测试');
console.log('');
console.log('--- 发布流程 ---');
console.log('  1. 注册npmjs.com账号');
console.log('  2. npm login');
console.log('  3. npm publish --access public  # scoped包需要public');
console.log('  4. npm version patch && npm publish  # 升级补丁版本');
`,
  },
  {
    id: "n4-crawler",
    group: "第七部分 进阶实战",
    icon: "🕷️",
    title: "网络爬虫：数据抓取与解析",
    content: `# 网络爬虫：数据抓取与解析

## 一、爬虫工作原理

网络爬虫模拟浏览器发送HTTP请求，获取HTML响应，解析提取结构化数据，然后跟随链接继续抓取。

基本流程：种子URL → 下载页面 → 解析内容/提取链接 → 存储数据 → 去重后继续抓取新链接 → 达到深度/数量停止。

## 二、礼貌与合规

### 2.1 robots.txt
网站根目录下/robots.txt定义允许爬取的路径，应当遵守。User-agent: * 对所有爬虫生效。Disallow: /private/禁止爬取private目录。

### 2.2 礼貌原则
- 控制请求频率（至少间隔1-2秒）
- 设置合理的User-Agent标识自己
- 不要爬取敏感/个人数据
- 遵守网站服务条款

## 三、HTML解析方案

在不使用第三方库的情况下：
- 正则表达式：简单模式匹配快速但脆弱，不能处理嵌套标签
- 字符串查找：indexOf/split适合非常简单的场景
- 状态机手写解析器：更健壮但复杂

实战中通常用cheerio/jsdom，但本课程只用内置模块，用正则实现基础链接提取。

## 四、关键技术点

| 技术 | 作用 |
|------|------|
| **URL去重** | Set/Map记录已访问URL避免重复 |
| **深度控制** | BFS广度优先，限制最大深度 |
| **并发控制** | 同时请求数限制，避免打爆服务器 |
| **限速** | 请求间间隔延迟 |
| **重试** | 失败请求重试几次 |
| **数据存储** | JSON/CSV/数据库 |
`,
    code: `// ============================================
// 简易网络爬虫：支持BFS、深度控制、限速、去重
// ============================================

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

class SimpleCrawler {
  constructor(options = {}) {
    this.maxDepth = options.maxDepth || 2;
    this.maxPages = options.maxPages || 50;
    this.delay = options.delay || 1500;
    this.concurrency = options.concurrency || 2;
    this.userAgent = options.userAgent || 'Node.js-Tutorial-Crawler/1.0';
    this.visited = new Set();
    this.queue = [];
    this.results = [];
    this.running = 0;
  }

  fetch(url) {
    return new Promise((resolve, reject) => {
      let urlObj;
      try { urlObj = new URL(url); } catch (e) { return reject(e); }
      const lib = urlObj.protocol === 'https:' ? https : http;
      const req = lib.get(url, {
        headers: { 'User-Agent': this.userAgent, 'Accept': 'text/html' },
        timeout: 10000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          const nextUrl = new URL(res.headers.location, url).href;
          return resolve(this.fetch(nextUrl));
        }
        if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ url, html: data, status: res.statusCode }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  }

  extractLinks(html, baseUrl) {
    const links = new Set();
    const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      try {
        const href = match[1];
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;
        const absolute = new URL(href, baseUrl);
        if (['http:', 'https:'].includes(absolute.protocol)) links.add(absolute.origin + absolute.pathname);
      } catch (e) {}
    }
    return [...links];
  }

  extractTitle(html) {
    const m = html.match(/<title>([^<]*)<\\/title>/i);
    return m ? m[1].trim() : '';
  }

  async crawl(seedUrl) {
    console.log('=== 简易爬虫演示 ===\\n');
    console.log(\`种子URL: \${seedUrl}\`);
    console.log(\`配置: maxDepth=\${this.maxDepth}, maxPages=\${this.maxPages}, delay=\${this.delay}ms\\n\`);
    this.queue.push({ url: seedUrl, depth: 0 });
    return new Promise((resolve) => {
      const processNext = async () => {
        if (this.results.length >= this.maxPages || this.queue.length === 0) {
          if (this.running === 0) return resolve(this.results);
          return setTimeout(processNext, this.delay);
        }
        if (this.running >= this.concurrency) return setTimeout(processNext, 100);
        const item = this.queue.shift();
        if (this.visited.has(item.url) || item.depth > this.maxDepth) return processNext();
        this.visited.add(item.url);
        this.running++;
        try {
          console.log(\`  [深度\${item.depth}] 抓取: \${item.url}\`);
          const { html } = await this.fetch(item.url);
          const title = this.extractTitle(html);
          this.results.push({ url: item.url, depth: item.depth, title, linkCount: (html.match(/<a/g) || []).length });
          if (item.depth < this.maxDepth) {
            const links = this.extractLinks(html, item.url);
            for (const link of links) if (!this.visited.has(link)) this.queue.push({ url: link, depth: item.depth + 1 });
          }
        } catch (e) {
          console.log(\`  ❌ 失败: \${item.url} -> \${e.message}\`);
        } finally {
          this.running--;
          setTimeout(processNext, this.delay);
        }
      };
      for (let i = 0; i < this.concurrency; i++) setTimeout(processNext, i * 100);
    });
  }
}

async function main() {
  const crawler = new SimpleCrawler({ maxDepth: 1, maxPages: 10, delay: 1000, concurrency: 2 });
  const results = await crawler.crawl('http://example.com');
  console.log('\\n--- 爬取结果 ---');
  console.log(\`共抓取 \${results.length} 个页面:\`);
  results.forEach((r, i) => console.log(\`  \${i + 1}. [d=\${r.depth}] \${r.title || '无标题'} - \${r.url}\`));
  const outFile = path.join(__dirname, 'crawl-results.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(\`\\n结果已保存到: \${outFile}\`);
}

if (require.main === module) main().catch(console.error);
`,
  },
  {
    id: "n4-proxy",
    group: "第七部分 进阶实战",
    icon: "🔀",
    title: "HTTP 代理服务器：转发与负载均衡",
    content: `# HTTP 代理服务器：转发与负载均衡

## 一、代理类型

| 类型 | 方向 | 作用 |
|------|------|------|
| **正向代理（Forward Proxy）** | 客户端→代理→互联网 | 客户端知道要访问谁，代理帮转发。用于翻墙、缓存、访问控制、隐藏客户端IP |
| **反向代理（Reverse Proxy）** | 互联网→代理→后端服务器 | 客户端不知道后端是谁。用于负载均衡、SSL终止、缓存、静态文件服务、API网关 |

Nginx是最流行的反向代理。本章我们用Node.js实现。

## 二、负载均衡算法

| 算法 | 原理 | 适用场景 |
|------|------|---------|
| **轮询（Round Robin）** | 按顺序依次分配 | 后端服务器配置相同 |
| **随机（Random）** | 随机选择 | 简单场景 |
| **最少连接（Least Connections）** | 发给当前连接数最少的 | 处理时长差异大 |
| **加权轮询** | 性能好的服务器权重高 | 服务器配置不同 |
| **IP Hash** | 同IP固定到同一后端 | 需要会话粘性 |

## 三、代理实现原理

正向代理：客户端发请求到代理（完整URL），代理解析后转发请求到目标服务器，将响应管道回客户端。

反向代理：代理接收请求，根据算法选择后端，转发请求并转发响应，可修改请求/响应头。

## 四、关键HTTP头

- **X-Forwarded-For**：记录原始客户端IP
- **X-Forwarded-Proto**：记录原始协议(http/https)
- **X-Forwarded-Host**：记录原始Host
- **Host**：代理需要重写为后端服务器Host
`,
    code: `// ============================================
// HTTP 代理服务器：正向代理 + 反向代理（负载均衡）
// ============================================

const http = require('http');
const net = require('net');
const { URL } = require('url');

const BACKENDS = [
  { host: '127.0.0.1', port: 4001, healthy: true },
  { host: '127.0.0.1', port: 4002, healthy: true },
  { host: '127.0.0.1', port: 4003, healthy: true },
];
let rrIdx = 0;
const connectionCounts = BACKENDS.reduce((acc, b) => (acc[b.port] = 0, acc), {});

function roundRobin() {
  const healthy = BACKENDS.filter(b => b.healthy);
  if (healthy.length === 0) return null;
  rrIdx = (rrIdx + 1) % healthy.length;
  return healthy[rrIdx];
}
function leastConn() {
  return BACKENDS.filter(b => b.healthy).sort((a, b) => connectionCounts[a.port] - connectionCounts[b.port])[0] || null;
}

function createBackendServer(port, name) {
  return http.createServer((req, res) => {
    connectionCounts[port]++;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ server: name, port, pid: process.pid, url: req.url }));
      connectionCounts[port]--;
    }, 50 + Math.random() * 100);
  }).listen(port, () => console.log(\`  后端 \${name} 监听 :\${port}\`));
}

function createReverseProxy(port) {
  return http.createServer((clientReq, clientRes) => {
    const backend = roundRobin();
    if (!backend) {
      clientRes.writeHead(503); clientRes.end('No healthy backend'); return;
    }
    const options = {
      host: backend.host, port: backend.port,
      path: clientReq.url, method: clientReq.method,
      headers: {
        ...clientReq.headers, host: \`\${backend.host}:\${backend.port}\`,
        'X-Forwarded-For': clientReq.socket.remoteAddress,
        'X-Forwarded-Proto': 'http', 'X-Forwarded-Host': clientReq.headers.host,
      }
    };
    const proxyReq = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes);
    });
    proxyReq.on('error', (e) => { clientRes.writeHead(502); clientRes.end('Bad Gateway: ' + e.message); });
    clientReq.pipe(proxyReq);
  }).listen(port, () => console.log(\`  反向代理监听 :\${port} (Round-Robin负载均衡)\`));
}

function createForwardProxy(port) {
  const server = http.createServer((clientReq, clientRes) => {
    const target = new URL(clientReq.url);
    const lib = target.protocol === 'https:' ? require('https') : http;
    const options = { hostname: target.hostname, port: target.port || (target.protocol === 'https:' ? 443 : 80), path: target.pathname + target.search, method: clientReq.method, headers: { ...clientReq.headers, host: target.host } };
    const proxyReq = lib.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes);
    });
    proxyReq.on('error', (e) => { clientRes.writeHead(502); clientRes.end(e.message); });
    clientReq.pipe(proxyReq);
  });
  server.on('connect', (clientReq, clientSocket, head) => {
    const [host, port] = clientReq.url.split(':');
    const serverSocket = net.connect(parseInt(port) || 443, host, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\\r\\n\\r\\n');
      serverSocket.write(head);
      clientSocket.pipe(serverSocket);
      serverSocket.pipe(clientSocket);
    });
    serverSocket.on('error', () => clientSocket.end());
  });
  server.listen(port, () => console.log(\`  正向代理监听 :\${port}\`));
}

if (require.main === module) {
  console.log('=== HTTP代理服务器演示 ===\\n');
  const servers = [];
  ['Server-A', 'Server-B', 'Server-C'].forEach((name, i) => servers.push(createBackendServer(4001 + i, name)));
  setTimeout(() => {
    createReverseProxy(3000);
    createForwardProxy(8888);
    console.log('\\n--- 使用方法 ---');
    console.log('反向代理: curl http://localhost:3000/api/test');
    console.log('正向代理: curl -x http://localhost:8888 http://example.com');
    console.log('\\n按 Ctrl+C 停止服务器...');
  }, 500);
}
`,
  },
  {
    id: "n4-queue",
    group: "第七部分 进阶实战",
    icon: "📬",
    title: "消息队列：异步任务处理系统",
    content: `# 消息队列：异步任务处理系统

## 一、为什么需要消息队列

Web请求中不要做耗时操作（发邮件、图片处理、报表生成）：用户等太久，超时风险。将耗时任务放入队列，立即返回响应，后台Worker异步处理。

队列的价值：
- **解耦**：生产者（API）不需要知道消费者是谁
- **异步**：不阻塞主流程
- **削峰填谷**：突发请求平滑处理，避免服务过载
- **重试**：失败自动重试
- **可观测**：任务状态、进度、失败记录

## 二、核心概念

| 概念 | 说明 |
|------|------|
| **Producer** | 生产者，向队列添加任务 |
| **Consumer/Worker** | 消费者，从队列取任务执行 |
| **Queue** | 任务队列，FIFO |
| **Job** | 具体任务，包含类型、数据、选项 |
| **Concurrency** | 并发处理数，控制压力 |
| **Retry/Backoff** | 失败重试 + 指数退避延迟 |
| **Delayed Jobs** | 延迟任务（如10分钟后执行） |
| **Dead Letter Queue** | 超过最大重试次数的任务进入死信队列 |
| **Events** | 任务事件：complete, failed, progress, stalled |

## 三、BullMQ/Bull 是Node.js最流行的队列库

本章我们用纯内置模块实现一个类似BullMQ的内存队列，涵盖核心功能。
`,
    code: `// ============================================
// 内存消息队列实现：类似BullMQ
// 功能：并发控制、指数退避重试、延迟任务、进度事件、事件监听
// ============================================

const { EventEmitter } = require('events');

class Queue extends EventEmitter {
  constructor(name, options = {}) {
    super();
    this.name = name;
    this.concurrency = options.concurrency || 4;
    this.maxRetries = options.maxRetries || 3;
    this.backoff = options.backoff || { type: 'exponential', delay: 1000 };
    this.waiting = [];
    this.delayed = [];
    this.active = new Map();
    this.completed = [];
    this.failed = [];
    this.running = 0;
    this.processFn = null;
    this.checkTimer = setInterval(() => this.processDelayed(), 500);
  }

  add(data, options = {}) {
    const job = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      data, attempts: 0, maxRetries: options.maxRetries || this.maxRetries,
      delay: options.delay || 0, priority: options.priority || 0,
      progress: 0, timestamp: Date.now(), status: 'waiting'
    };
    if (job.delay > 0) { job.status = 'delayed'; job.processAt = Date.now() + job.delay; this.delayed.push(job); }
    else {
      if (job.priority > 0) this.waiting.unshift(job);
      else this.waiting.push(job);
    }
    this.emit('waiting', job);
    this.processNext();
    return job;
  }

  process(fn) { this.processFn = fn; this.processNext(); }

  processDelayed() {
    const now = Date.now();
    const ready = this.delayed.filter(j => j.processAt <= now);
    this.delayed = this.delayed.filter(j => j.processAt > now);
    for (const job of ready) { job.status = 'waiting'; this.waiting.push(job); this.emit('waiting', job); }
    this.processNext();
  }

  processNext() {
    if (!this.processFn) return;
    while (this.running < this.concurrency && this.waiting.length > 0) {
      const job = this.waiting.shift();
      this.running++;
      this.active.set(job.id, job);
      job.status = 'active'; job.startedAt = Date.now();
      this.execute(job);
    }
  }

  async execute(job) {
    job.attempts++;
    this.emit('active', job);
    try {
      const result = await this.processFn(job, (p) => {
        job.progress = p; this.emit('progress', job, p);
      });
      job.status = 'completed'; job.result = result; job.finishedAt = Date.now();
      this.completed.push(job); this.active.delete(job.id); this.running--;
      this.emit('completed', job, result);
    } catch (err) {
      if (job.attempts < job.maxRetries) {
        const delay = this.calculateBackoff(job.attempts);
        job.status = 'delayed'; job.processAt = Date.now() + delay;
        this.delayed.push(job); this.active.delete(job.id); this.running--;
        this.emit('retrying', job, err, delay);
      } else {
        job.status = 'failed'; job.error = err.message; job.finishedAt = Date.now();
        this.failed.push(job); this.active.delete(job.id); this.running--;
        this.emit('failed', job, err);
      }
    }
    this.processNext();
  }

  calculateBackoff(attempts) {
    if (this.backoff.type === 'fixed') return this.backoff.delay;
    return this.backoff.delay * Math.pow(2, attempts - 1);
  }

  getStats() {
    return { waiting: this.waiting.length, active: this.active.size, delayed: this.delayed.length, completed: this.completed.length, failed: this.failed.length };
  }

  close() { clearInterval(this.checkTimer); }
}

if (require.main === module) {
  console.log('=== 消息队列演示 ===\\n');
  const queue = new Queue('emails', { concurrency: 2, maxRetries: 3, backoff: { type: 'exponential', delay: 500 } });
  queue.on('completed', (j, r) => console.log(\`  ✅ Job \${j.id.slice(0,8)} 完成: \${r}\`));
  queue.on('failed', (j, e) => console.log(\`  ❌ Job \${j.id.slice(0,8)} 最终失败: \${e.message} (尝试\${j.attempts}次)\`));
  queue.on('retrying', (j, e, d) => console.log(\`  ⏳ Job \${j.id.slice(0,8)} 失败(\${e.message})，\${d}ms后重试第\${j.attempts}次\`));
  queue.on('progress', (j, p) => process.stdout.write(\`  📊 Job \${j.id.slice(0,8)} 进度: \${p}%\\r\`));

  queue.process(async (job, setProgress) => {
    for (let i = 0; i <= 100; i += 25) { setProgress(i); await new Promise(r => setTimeout(r, 100)); }
    if (job.data.forceFail && job.attempts < job.maxRetries) throw new Error('模拟失败');
    return \`发送邮件到\${job.data.to}\`;
  });

  queue.add({ to: 'user1@test.com' });
  queue.add({ to: 'user2@test.com', forceFail: true });
  queue.add({ to: 'user3@test.com' }, { delay: 2000 });
  queue.add({ to: 'user4@test.com' });

  const statsTimer = setInterval(() => {
    const s = queue.getStats();
    if (s.waiting === 0 && s.active === 0 && s.delayed === 0 && s.completed + s.failed >= 4) {
      clearInterval(statsTimer); queue.close();
      console.log(\`\\n  统计: 完成=\${s.completed} 失败=\${s.failed}\`);
      console.log('=== 消息队列演示完成 ===');
    }
  }, 500);
}
`,
  },
  {
    id: "n4-scheduler",
    group: "第七部分 进阶实战",
    icon: "⏲️",
    title: "定时任务：cron 调度原理与实现",
    content: `# 定时任务：cron 调度原理与实现

## 一、定时任务应用场景

- 每天凌晨2点清理临时文件
- 每5分钟采集服务器指标
- 每周一发送周报表
- 30分钟后取消未支付订单
- 定时备份数据库

## 二、cron 表达式语法

标准cron：\`分 时 日 月 周\`（5个字段）

| 字段 | 范围 | 特殊字符 |
|------|------|---------|
| 分钟 | 0-59 | * , - / |
| 小时 | 0-23 | * , - / |
| 日期 | 1-31 | * , - / ? |
| 月份 | 1-12 | * , - / |
| 星期 | 0-7 (0/7=周日) | * , - / |

特殊字符：
- **\\***：任意值
- **,**：枚举（1,3,5）
- **-**：范围（1-5）
- **/**：步长（*/5每5个单位，0-23/2每2小时）

例子：
- \`* * * * *\` - 每分钟
- \`0 * * * *\` - 每整点
- \`0 2 * * *\` - 每天凌晨2点
- \`*/5 * * * *\` - 每5分钟
- \`0 9 * * 1-5\` - 工作日早9点
- \`0 0 1 * *\` - 每月1号零点

## 三、实现原理

每秒检查一次：解析cron表达式，计算下一次执行时间，到时间就触发。用setTimeout做精确到秒的调度，避免CPU空转。

## 四、Node.js 生态

常用库：node-cron（最简单）、node-schedule（精确到秒）、BullMQ重复任务（分布式场景）。Linux原生crontab是系统级方案。
`,
    code: `// ============================================
// Cron 调度器实现：解析cron表达式，计算下次执行时间
// ============================================

class CronExpression {
  constructor(pattern) {
    this.pattern = pattern.trim();
    const fields = this.pattern.split(/\\s+/);
    if (fields.length !== 5) throw new Error('cron表达式需要5个字段: 分 时 日 月 周');
    this.minute = this.parseField(fields[0], 0, 59);
    this.hour = this.parseField(fields[1], 0, 23);
    this.dayOfMonth = this.parseField(fields[2], 1, 31);
    this.month = this.parseField(fields[3], 1, 12);
    this.dayOfWeek = this.parseField(fields[4], 0, 6);
  }
  parseField(field, min, max) {
    const set = new Set();
    for (const part of field.split(',')) {
      if (part === '*') { for (let i = min; i <= max; i++) set.add(i); continue; }
      let [range, step] = part.split('/'); step = step ? parseInt(step) : 1;
      let start, end;
      if (range === '*') { start = min; end = max; }
      else if (range.includes('-')) { [start, end] = range.split('-').map(Number); }
      else { start = parseInt(range); end = step > 1 ? max : start; }
      for (let i = start; i <= end; i += step) if (i >= min && i <= max) set.add(i);
    }
    return [...set].sort((a, b) => a - b);
  }
  matches(date) {
    return this.minute.includes(date.getMinutes()) && this.hour.includes(date.getHours()) &&
           this.month.includes(date.getMonth() + 1) &&
           (this.dayOfMonth.includes(date.getDate()) || this.dayOfWeek.includes(date.getDay()));
  }
  next(from = new Date()) {
    const next = new Date(from); next.setSeconds(0, 0); next.setMinutes(next.getMinutes() + 1);
    for (let i = 0; i < 366 * 24 * 60; i++) {
      if (this.matches(next)) return new Date(next);
      next.setMinutes(next.getMinutes() + 1);
    }
    throw new Error('无法计算下次执行时间');
  }
}

class Scheduler {
  constructor() { this.jobs = new Map(); this.timers = new Map(); this.running = false; }
  add(id, pattern, fn, options = {}) {
    const cron = new CronExpression(pattern);
    const job = { id, pattern, fn, cron, runOnce: !!options.runOnce, nextRun: null, enabled: true, runs: 0 };
    this.jobs.set(id, job);
    this.scheduleNext(job);
    return job;
  }
  scheduleNext(job) {
    if (!job.enabled) return;
    const now = new Date();
    job.nextRun = job.cron.next(now);
    const delay = job.nextRun.getTime() - now.getTime();
    if (this.timers.has(job.id)) clearTimeout(this.timers.get(job.id));
    this.timers.set(job.id, setTimeout(() => this.run(job), Math.min(delay, 2147483647)));
  }
  async run(job) {
    job.runs++;
    const start = Date.now();
    try { await job.fn(); } catch (e) { console.error(\`Job \${job.id} 执行错误:\`, e.message); }
    if (!job.runOnce) this.scheduleNext(job); else this.jobs.delete(job.id);
  }
  start() { this.running = true; for (const job of this.jobs.values()) this.scheduleNext(job); }
  stop(id) {
    if (id) { const j = this.jobs.get(id); if (j) { j.enabled = false; clearTimeout(this.timers.get(id)); this.timers.delete(id); } }
    else { for (const tid of this.timers.values()) clearTimeout(tid); this.timers.clear(); this.running = false; }
  }
  list() { return [...this.jobs.values()].map(j => ({ id: j.id, pattern: j.pattern, runs: j.runs, nextRun: j.nextRun, enabled: j.enabled })); }
}

if (require.main === module) {
  console.log('=== Cron调度器演示 ===\\n');
  const scheduler = new Scheduler();
  console.log('--- Cron表达式解析测试 ---');
  const tests = ['* * * * *', '*/5 * * * *', '0 2 * * *', '0 9 * * 1-5', '30 12 1 1 *'];
  tests.forEach(p => { const c = new CronExpression(p); console.log(\`  \${p.padEnd(15)} → 下次: \${c.next().toLocaleString('zh-CN')}\`); });
  console.log('\\n--- 快速演示（任务间隔5秒）---');
  scheduler.add('heartbeat', '* * * * *', () => console.log(\`  [心跳] \${new Date().toLocaleTimeString()}\`));
  scheduler.add('once', '* * * * *', () => console.log('  [一次性] 执行一次'), { runOnce: true });
  console.log('  任务列表:', scheduler.list().map(j => j.id));
  console.log('  (提示：完整cron精确到分钟，演示中可自行修改缩短间隔测试)');
  setTimeout(() => { scheduler.stop(); console.log('\\n=== Cron调度器演示完成 ==='); }, 2000);
}
`,
  },
  {
    id: "n4-cli-advanced",
    group: "第七部分 进阶实战",
    icon: "⌨️",
    title: "CLI 工具高级开发：从参数解析到交互",
    content: `# CLI 工具高级开发：从参数解析到交互

## 一、CLI 工具架构

优秀的Node.js CLI工具（如Vue CLI、Create React App、npm）通常包含：
- **命令解析**：子命令支持（\`git commit\`、\`npm install\`）
- **参数解析**：选项（\`--force\`、\`-f\`）、位置参数、值传参（\`--port 3000\`）
- **帮助信息**：\`--help\`自动生成使用说明
- **彩色输出**：ANSI转义码给文字上色
- **交互提示**：询问用户输入、确认、选择
- **进度指示**：进度条、spinner加载动画
- **表格输出**：格式化数据展示

## 二、ANSI 转义码

| 代码 | 效果 |
|------|------|
| \\x1b[30-37m | 前景色（黑红黄绿蓝紫青白） |
| \\x1b[40-47m | 背景色 |
| \\x1b[1m | 加粗 |
| \\x1b[2m | 暗色 |
| \\x1b[0m | 重置 |
| \\x1b[2J | 清屏 |
| \\x1b[nA/nB/nC/nD | 光标移动 |
| \\r | 回车回到行首（用于进度重绘） |

## 三、readline 模块

内置模块，用于逐行读取输入，实现交互式提示。

## 四、commander + inquirer + chalk 原理

commander是参数解析库，inquirer是交互提示库，chalk是彩色输出库。我们用纯内置模块实现它们的核心功能。
`,
    code: `// ============================================
// CLI 工具框架：命令解析 + 彩色输出 + 交互提示 + 进度条 + Spinner
// ============================================

const readline = require('readline');

const color = {
  reset: '\\x1b[0m', bold: '\\x1b[1m', dim: '\\x1b[2m',
  black: '\\x1b[30m', red: '\\x1b[31m', green: '\\x1b[32m', yellow: '\\x1b[33m',
  blue: '\\x1b[34m', magenta: '\\x1b[35m', cyan: '\\x1b[36m', white: '\\x1b[37m',
};
function style(c, s) { return color[c] + s + color.reset; }
const c = {
  red: s => style('red', s), green: s => style('green', s), yellow: s => style('yellow', s),
  blue: s => style('blue', s), cyan: s => style('cyan', s), bold: s => style('bold', s), dim: s => style('dim', s),
};

class CLI {
  constructor() { this.commands = new Map(); this.programName = ''; this.version = '1.0.0'; }
  command(name, desc) {
    const cmd = { name, desc, options: [], args: [], action: null };
    this.commands.set(name, cmd);
    return { option: (f, s, d) => { cmd.options.push({ flag: f, short: s, desc: d }); return this; }, action: (fn) => { cmd.action = fn; return this; } };
  }
  parse(argv) {
    const args = argv.slice(2);
    this.programName = argv[1].split('/').pop();
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') return this.help();
    if (args[0] === '--version' || args[0] === '-v') return console.log(this.version);
    const cmdName = args[0];
    if (!this.commands.has(cmdName)) { console.error(c.red('未知命令: ' + cmdName)); return this.help(); }
    const cmd = this.commands.get(cmdName);
    const opts = {}, positional = [];
    for (let i = 1; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith('--')) {
        const key = a.slice(2); const next = args[i+1];
        if (next && !next.startsWith('-')) { opts[key] = next; i++; } else opts[key] = true;
      } else if (a.startsWith('-') && a.length === 2) opts[a.slice(1)] = true;
      else positional.push(a);
    }
    cmd.action(opts, positional);
  }
  help() {
    console.log(c.cyan('\\n用法: ') + this.programName + ' <命令> [选项]\\n');
    console.log(c.bold('命令:'));
    for (const cmd of this.commands.values()) console.log(\`  \${c.green(cmd.name.padEnd(12))} \${cmd.desc}\`);
    console.log('\\n' + c.bold('选项:'));
    console.log('  ' + c.green('--help, -h'.padEnd(12)) + '显示帮助');
    console.log('  ' + c.green('--version, -v'.padEnd(12)) + '显示版本');
  }
  ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(res => rl.question(c.cyan(question), a => { rl.close(); res(a); }));
  }
  async confirm(question) { const a = await this.ask(question + ' (y/n) '); return a.toLowerCase() === 'y' || a.toLowerCase() === 'yes'; }
  async select(question, choices) {
    console.log(c.cyan(question));
    choices.forEach((ch, i) => console.log(\`  \${c.yellow((i+1) + '.')} \${ch}\`));
    const a = await this.ask('请选择编号: '); const idx = parseInt(a) - 1;
    if (idx >= 0 && idx < choices.length) return choices[idx];
    return null;
  }
  progressBar(total, width = 30) {
    let current = 0;
    return {
      update: (val) => {
        current = val;
        const pct = current / total;
        const filled = Math.round(width * pct);
        const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
        process.stdout.write(\`\\r  \${c.cyan(bar)} \${Math.round(pct*100)}% (\${current}/\${total})\`);
        if (current >= total) process.stdout.write('\\n');
      }
    };
  }
  spinner(text = '加载中') {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0; const id = setInterval(() => {
      process.stdout.write(\`\\r  \${c.cyan(frames[i])} \${text}\`); i = (i + 1) % frames.length;
    }, 80);
    return { stop: (msg = '完成') => { clearInterval(id); process.stdout.write(\`\\r  \${c.green('✓')} \${msg}\\n\`); } };
  }
  table(data, headers) {
    const cols = headers.map((h, i) => Math.max(h.length, ...data.map(r => String(r[i]).length)));
    const line = cols.map(w => '─'.repeat(w + 2)).join('┼');
    const sep = '─'.repeat(line.length + cols.length + 1);
    console.log('┌' + cols.map((w, i) => '─'.repeat(w + 2)).join('┬') + '┐');
    const fmt = (row) => '│ ' + row.map((v, i) => String(v).padEnd(cols[i])).join(' │ ') + ' │';
    console.log(fmt(headers));
    console.log('├' + line + '┤');
    data.forEach(r => console.log(fmt(r)));
    console.log('└' + cols.map((w, i) => '─'.repeat(w + 2)).join('┴') + '┘');
  }
}

if (require.main === module) {
  const cli = new CLI();
  console.log('=== CLI 工具框架演示 ===\\n');
  cli.command('greet', '打印问候语').option('--name', '-n', '名字').action(async (opts) => {
    console.log(c.green('你好, ' + (opts.name || '世界') + '!'));
    const name = await cli.ask('你叫什么名字? ');
    console.log(c.green('很高兴认识你, ' + name));
    const ok = await cli.confirm('继续演示?');
    if (ok) {
      console.log('\\n--- 进度条 ---');
      const bar = cli.progressBar(100);
      for (let i = 0; i <= 100; i++) { await new Promise(r => setTimeout(r, 20)); bar.update(i); }
      console.log('\\n--- Spinner ---');
      const sp = cli.spinner('正在处理...');
      setTimeout(() => sp.stop('处理完成!'), 2000);
      setTimeout(() => {
        console.log('\\n--- 表格输出 ---');
        cli.table([['Alice', 28, 'Engineer'], ['Bob', 32, 'Designer'], ['Charlie', 25, 'PM']], ['名字', '年龄', '职业']);
        console.log('\\n=== CLI 演示完成 ===');
      }, 2500);
    }
  });
  cli.command('help', '显示帮助').action(() => cli.help());
  cli.parse(process.argv);
  if (process.argv.length <= 2) cli.parse(['node', 'cli', 'greet']);
}
`,
  },
  {
    id: "n4-design-patterns",
    group: "第七部分 进阶实战",
    icon: "🏗️",
    title: "Node.js 常用设计模式",
    content: `# Node.js 常用设计模式

设计模式是前人总结的可复用解决方案，在Node.js异步编程和模块系统下尤其重要。

## 一、单例模式（Singleton）

保证一个类只有一个实例，常用于数据库连接池、配置对象、日志实例。Node.js模块缓存天然提供单例！

## 二、工厂模式（Factory）

不暴露创建逻辑，通过工厂方法动态创建对象，根据参数返回不同实现。

## 三、中间件模式（Middleware）

Express/Koa核心模式：请求经过一系列处理函数，每个函数可以修改req/res、决定是否继续next()。洋葱模型。

## 四、观察者模式（Observer）

EventEmitter就是观察者：事件触发者emit，订阅者on监听。一对多依赖。

## 五、Promise/回调模式

异步处理的两种方式。回调是Node.js传统，Promise和async/await是现代标准。

## 六、流模式（Stream）

处理大数据的标配：逐块处理而不是一次性加载到内存。

## 七、仓储模式（Repository）

数据访问抽象层，业务逻辑不直接操作数据库，通过仓储接口，便于切换数据源和测试。

## 八、依赖注入（DI）

依赖从外部传入而不是内部创建，解耦组件，方便测试。不需要框架也能手动实现。

## 九、熔断模式（Circuit Breaker）

调用不稳定服务时，失败率超过阈值则"熔断"，一段时间内快速失败，避免雪崩。

## 十、重试模式（Retry）

瞬时错误（网络波动）自动重试，配合指数退避。

## 十一、装饰器模式（Decorator）

不改变原对象，包装一层添加新功能，如日志装饰器、缓存装饰器。
`,
    code: `// ============================================
// Node.js 常用设计模式演示
// ============================================

const { EventEmitter } = require('events');

console.log('=== Node.js 设计模式演示 ===\\n');

console.log('--- 1. 单例模式（Singleton）---');
class Database {
  constructor(url) { if (Database.instance) return Database.instance; this.url = url; this.pool = { size: 10 }; Database.instance = this; }
  query(sql) { return \`执行: \${sql}\`; }
}
const db1 = new Database('postgres://localhost');
const db2 = new Database('postgres://other');
console.log('  单例验证:', db1 === db2 ? '✓ 同一实例' : '✗ 不同实例');

console.log('\\n--- 2. 工厂模式（Factory）---');
class LoggerFactory {
  static create(type) {
    if (type === 'console') return { log: m => console.log('  [Console]', m) };
    if (type === 'file') return { log: m => console.log('  [File] (写入文件)', m) };
    if (type === 'json') return { log: m => console.log('  [JSON]', JSON.stringify({ msg: m })); };
    throw new Error('未知logger类型');
  }
}
const jsonLogger = LoggerFactory.create('json');
jsonLogger.log('工厂创建的logger');

console.log('\\n--- 3. 中间件模式（Middleware）---');
class App {
  constructor() { this.middlewares = []; }
  use(fn) { this.middlewares.push(fn); }
  async handle(ctx) {
    let idx = 0;
    const next = async () => { idx++; if (idx < this.middlewares.length) await this.middlewares[idx](ctx, next); };
    if (this.middlewares.length > 0) await this.middlewares[0](ctx, next);
  }
}
const app = new App();
app.use(async (ctx, next) => { console.log('  [Logger] 请求:', ctx.url); const s = Date.now(); await next(); console.log('  [Logger] 耗时:', Date.now()-s+'ms'); });
app.use(async (ctx, next) => { ctx.body = 'Hello'; await next(); });
app.use(async (ctx) => { console.log('  [Handler] 响应:', ctx.body); });
app.handle({ url: '/api/users' });

console.log('\\n--- 4. 观察者模式（EventEmitter）---');
class OrderService extends EventEmitter {}
const orders = new OrderService();
orders.on('created', (o) => console.log('  监听: 订单创建 -', o.id));
orders.on('shipped', (o) => console.log('  监听: 订单发货 -', o.id));
orders.emit('created', { id: 'ORD001', total: 99 });

console.log('\\n--- 5. 熔断模式（Circuit Breaker）---');
class CircuitBreaker {
  constructor(fn, opts = {}) { this.fn = fn; this.failureThreshold = opts.threshold || 3; this.resetTimeout = opts.timeout || 5000; this.failures = 0; this.state = 'closed'; }
  async exec(...args) {
    if (this.state === 'open') {
      if (Date.now() - this.lastFail > this.resetTimeout) this.state = 'half-open';
      else throw new Error('熔断中，快速失败');
    }
    try { const r = await this.fn(...args); this.onSuccess(); return r; }
    catch (e) { this.onFailure(); throw e; }
  }
  onSuccess() { this.failures = 0; this.state = 'closed'; }
  onFailure() {
    this.failures++; this.lastFail = Date.now();
    if (this.state === 'half-open' || this.failures >= this.failureThreshold) this.state = 'open';
    console.log(\`  失败次数:\${this.failures} 状态:\${this.state}\`);
  }
}
let callCount = 0;
const unstableApi = async () => { callCount++; if (callCount < 5) throw new Error('服务不可用'); return 'ok'; };
const breaker = new CircuitBreaker(unstableApi, { threshold: 3, timeout: 1000 });
(async () => {
  for (let i = 0; i < 4; i++) {
    try { await breaker.exec(); } catch (e) { console.log('  调用:', e.message); }
  }
})();

console.log('\\n--- 6. 装饰器模式 ---');
function withCache(fn, ttl = 1000) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key) && Date.now() - cache.get(key).t < ttl) { console.log('  (缓存命中)'); return cache.get(key).v; }
    const r = fn.apply(this, args); cache.set(key, { v: r, t: Date.now() }); return r;
  };
}
const expensiveOp = (n) => { console.log('  执行昂贵计算...'); return n * 2; };
const cached = withCache(expensiveOp, 5000);
console.log('  结果:', cached(21));
console.log('  结果:', cached(21));

setTimeout(() => console.log('\\n=== 设计模式演示完成 ==='), 500);
`,
  },
  {
    id: "n4-realtime-app",
    group: "第七部分 进阶实战",
    icon: "💬",
    title: "实战：实时聊天室与通知系统",
    content: `# 实战：实时聊天室与通知系统

综合运用前面所学知识，构建一个完整的实时聊天应用。

## 一、架构设计

- **HTTP服务**：静态页面、REST API（登录、获取历史消息）
- **WebSocket**：实时双向通信
- **认证**：简单Token认证，握手阶段验证
- **房间**：多个聊天频道（大厅、技术、闲聊等）
- **在线用户**：追踪连接状态
- **消息历史**：内存存储，可扩展到SQLite
- **心跳机制**：ping/pong检测死连接
- **私信**：用户间一对一消息
- **打字指示**：实时通知正在输入

## 二、WebSocket 协议

WebSocket是独立协议，ws://和wss://（加密），握手通过HTTP Upgrade头升级协议。Node.js内置没有WebSocket模块，但我们可以：
- 使用net模块直接实现WebSocket协议（帧、握手、掩码等）
- 理解WebSocket帧结构：FIN、opcode（1=text,2=binary,8=close,9=ping,10=pong）、mask、payload length

本章为了教学目的，直接用net模块实现简化版WebSocket服务，展示协议原理。

## 三、核心功能实现要点

1. 握手：解析Sec-WebSocket-Key，计算Sec-WebSocket-Accept响应
2. 帧解码：读取2字节头，解析长度、掩码，解码payload
3. 帧编码：构建符合规范的帧发送
4. 连接管理：Map存储userId到socket映射
5. 消息广播：遍历房间内所有连接发送消息
6. 心跳：定时ping，超时未pong则断开
`,
    code: `// ============================================
// 实时聊天室：HTTP + WebSocket（纯内置模块实现）
// ============================================

const http = require('http');
const crypto = require('crypto');
const net = require('net');

const PORT = 3000;
const MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const users = new Map();
const rooms = new Map([['lobby', { name: '大厅', members: new Set() }], ['tech', { name: '技术', members: new Set() }]]);
const history = new Map([['lobby', []], ['tech', []]]);
const typingUsers = new Map();

function acceptKey(key) { return crypto.createHash('sha1').update(key + MAGIC).digest('base64'); }
function encodeFrame(payload, opcode = 1) {
  const buf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  const len = buf.length; let frame;
  if (len < 126) { frame = Buffer.alloc(2 + len); frame[0] = 0x80 | opcode; frame[1] = len; buf.copy(frame, 2); }
  else if (len < 65536) { frame = Buffer.alloc(4 + len); frame[0] = 0x80 | opcode; frame[1] = 126; frame.writeUInt16BE(len, 2); buf.copy(frame, 4); }
  else { frame = Buffer.alloc(10 + len); frame[0] = 0x80 | opcode; frame[1] = 127; frame.writeBigUInt64BE(BigInt(len), 2); buf.copy(frame, 10); }
  return frame;
}
function decodeFrame(buffer) {
  if (buffer.length < 2) return null;
  const fin = (buffer[0] & 0x80) !== 0; const opcode = buffer[0] & 0x0f;
  let masked = (buffer[1] & 0x80) !== 0; let payloadLen = buffer[1] & 0x7f; let offset = 2;
  if (payloadLen === 126) { if (buffer.length < 4) return null; payloadLen = buffer.readUInt16BE(2); offset = 4; }
  else if (payloadLen === 127) { if (buffer.length < 10) return null; payloadLen = Number(buffer.readBigUInt64BE(2)); offset = 10; }
  if (masked) { if (buffer.length < offset + 4) return null; const mask = buffer.slice(offset, offset + 4); offset += 4; if (buffer.length < offset + payloadLen) return null; const payload = Buffer.alloc(payloadLen); for (let i = 0; i < payloadLen; i++) payload[i] = buffer[offset + i] ^ mask[i % 4]; return { fin, opcode, payload: payload.toString() }; }
  if (buffer.length < offset + payloadLen) return null;
  return { fin, opcode, payload: buffer.slice(offset, offset + payloadLen).toString() };
}

class WsConnection {
  constructor(socket) { this.socket = socket; this.userId = null; this.username = null; this.room = null; this.buffer = Buffer.alloc(0); this.isAlive = true; }
  send(data) { try { this.socket.write(encodeFrame(typeof data === 'string' ? data : JSON.stringify(data))); } catch (e) {} }
  ping() { try { this.socket.write(encodeFrame('', 9)); } catch (e) {} }
  close() { try { this.socket.write(encodeFrame('', 8)); this.socket.end(); } catch (e) {} }
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<html><head><meta charset="utf-8"><title>WebSocket聊天室</title>
<style>body{font-family:sans-serif;max-width:800px;margin:20px auto}#messages{height:300px;border:1px solid #ccc;overflow-y:auto;padding:10px;margin-bottom:10px}#users{float:right;width:150px;border:1px solid #ccc;padding:10px}.msg{margin:5px 0}.sys{color:#888;font-style:italic}</style></head>
<body><h2>Node.js WebSocket 聊天室</h2><div id="users"></div><div id="messages"></div>
<input id="msg" placeholder="输入消息 (登录后)" style="width:70%" />
<button onclick="send()">发送</button><button onclick="login()">登录</button>
<script>let ws,user;function login(){const name=prompt('用户名:');if(!name)return;user=name;ws=new WebSocket('ws://'+location.host);ws.onopen=()=>ws.send(JSON.stringify({type:'login',username:name}));ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type=='message'){const d=document.getElementById('messages');d.innerHTML+='<div class="msg"><b>'+m.user+':</b> '+m.text+'</div>';d.scrollTop=d.scrollHeight;}else if(m.type=='system'){const d=document.getElementById('messages');d.innerHTML+='<div class="sys">'+m.text+'</div>';}else if(m.type=='users'){document.getElementById('users').innerHTML='<b>在线:</b><br>'+m.users.join('<br>');}};}function send(){const i=document.getElementById('msg');if(ws&&i.value){ws.send(JSON.stringify({type:'message',text:i.value,room:'lobby'}));i.value='';}}</script>
</body></html>\`);
  } else { res.writeHead(404); res.end('Not Found'); }
});

server.on('upgrade', (req, socket) => {
  if (req.headers['upgrade'] !== 'websocket') { socket.destroy(); return; }
  const key = req.headers['sec-websocket-key'];
  socket.write('HTTP/1.1 101 Switching Protocols\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\nSec-WebSocket-Accept: ' + acceptKey(key) + '\\r\\n\\r\\n');
  const conn = new WsConnection(socket);
  socket.on('data', (chunk) => {
    conn.buffer = Buffer.concat([conn.buffer, chunk]);
    let frame;
    while ((frame = decodeFrame(conn.buffer)) !== null) {
      conn.buffer = conn.buffer.slice(conn.buffer.length);
      if (frame.opcode === 8) { conn.close(); return; }
      if (frame.opcode === 9) { conn.socket.write(encodeFrame('', 10)); return; }
      if (frame.opcode === 10) { conn.isAlive = true; return; }
      if (frame.opcode === 1) handleMessage(conn, frame.payload);
    }
  });
  socket.on('close', () => handleDisconnect(conn));
  socket.on('error', () => {});
});

function handleMessage(conn, data) {
  let msg; try { msg = JSON.parse(data); } catch (e) { return; }
  if (msg.type === 'login' && msg.username) {
    conn.username = msg.username; conn.userId = 'u_' + Date.now(); conn.room = 'lobby';
    users.set(conn.userId, conn); rooms.get('lobby').members.add(conn.userId);
    broadcast('lobby', { type: 'system', text: \`\${conn.username} 加入了房间\` });
    conn.send({ type: 'system', text: '欢迎来到聊天室!', history: history.get('lobby').slice(-20) });
    broadcastUserList();
  } else if (msg.type === 'message' && conn.userId) {
    const m = { type: 'message', user: conn.username, text: msg.text, time: Date.now() };
    history.get(conn.room).push(m); if (history.get(conn.room).length > 100) history.get(conn.room).shift();
    broadcast(conn.room, m);
  }
}

function handleDisconnect(conn) {
  if (!conn.userId) return;
  users.delete(conn.userId);
  if (conn.room) { rooms.get(conn.room).members.delete(conn.userId); broadcast(conn.room, { type: 'system', text: \`\${conn.username} 离开了\` }); }
  broadcastUserList();
}

function broadcast(room, msg) { if (!rooms.has(room)) return; for (const uid of rooms.get(room).members) { const c = users.get(uid); if (c) c.send(msg); } }
function broadcastUserList() { const list = [...users.values()].map(c => c.username); for (const c of users.values()) c.send({ type: 'users', users: list }); }

setInterval(() => {
  for (const c of users.values()) { if (!c.isAlive) { c.close(); continue; } c.isAlive = false; c.ping(); }
}, 30000);

server.listen(PORT, () => {
  console.log('=== 实时聊天室演示 ===\\n');
  console.log(\`服务器监听 http://localhost:\${PORT}\`);
  console.log('浏览器打开以上地址即可体验聊天');
  console.log('功能: WebSocket实时消息、在线列表、心跳检测、房间、消息历史');
});
`,
  },
  {
    id: "n4-summary",
    group: "第八部分 总结展望",
    icon: "🎓",
    title: "课程总结：从入门到精通的进阶之路",
    content: `# 课程总结：从入门到精通的进阶之路

恭喜你完成了这个完整的Node.js系列课程！让我们回顾一下所学内容，并展望未来的学习方向。

## 一、课程回顾

### 第一部分：基础入门
- **Node.js简介**：历史、特性、事件驱动、非阻塞I/O
- **环境搭建**：安装、REPL、npm基础、模块系统（CommonJS/ESM）
- **JavaScript回顾**：ES6+语法、异步编程基础（回调、Promise、async/await）

### 第二部分：核心模块
- **fs文件系统**：同步/异步文件读写、流、目录操作
- **path路径**：路径拼接、解析、规范化
- **http/https**：创建HTTP服务器、客户端请求
- **events事件**：EventEmitter、事件监听与发射
- **stream流**：可读流、可写流、双工流、管道、背压
- **buffer**：二进制数据处理
- **process/os**：进程信息、操作系统交互

### 第三部分：Web开发
- **HTTP协议深入**：请求方法、状态码、头部、Cookie/Session
- **Express/Koa**：Web框架原理、中间件模式
- **路由**：RESTful API设计、参数解析
- **模板引擎**：服务端渲染
- **静态文件服务**
- **错误处理**：全局错误捕获、404处理
- **文件上传**：multipart/form-data解析

### 第四部分：数据存储
- **JSON文件存储**
- **SQLite**：轻量关系型数据库
- **MongoDB/Mongoose**：NoSQL概念
- **Redis**：缓存概念
- **数据库连接池**
- **CRUD操作**

### 第五部分：安全与认证
- **密码哈希**：bcrypt原理、加盐
- **JWT认证**：Token生成与验证
- **CORS**：跨域配置
- **输入验证**：防止注入攻击
- **XSS/CSRF防护**
- **HTTPS/TLS**

### 第六部分：工程化
- **模块化架构**：目录结构、分层设计
- **环境配置**：dotenv原理、多环境管理
- **日志系统**：分级、结构化、多输出
- **性能分析**：profiling、事件循环监控
- **内存管理**：泄漏排查、GC
- **cluster集群**：多进程利用多核
- **worker_threads**：CPU密集并行
- **进程管理**：守护进程、优雅关闭
- **Docker部署**
- **npm包开发**

### 第七部分：进阶实战
- **网络爬虫**
- **HTTP代理与负载均衡**
- **消息队列**
- **定时任务**
- **CLI工具开发**
- **设计模式**
- **实时应用（WebSocket）**

## 二、Node.js 学习路线图

继续深入学习的方向：

| 方向 | 推荐学习 |
|------|---------|
| **Web框架** | Express → Koa → Fastify → NestJS（企业级） |
| **数据库** | Prisma（现代ORM）、TypeORM、Sequelize |
| **TypeScript** | 强烈推荐学习，大型项目必备 |
| **测试** | Jest/Vitest单元测试、Supertest接口测试 |
| **微服务** | gRPC、消息队列（RabbitMQ/Kafka）、服务发现 |
| **Serverless** | Vercel、AWS Lambda、Cloudflare Workers |
| **GraphQL** | Apollo Server、TypeGraphQL |
| **实时应用** | Socket.io（成熟方案）、WebSockets |
| **DevOps** | Docker、Kubernetes、CI/CD |

## 三、常见面试题要点

1. **事件循环机制**：宏任务/微任务、各阶段执行顺序
2. **Stream背压处理**：为什么需要pipe、如何处理
3. **cluster和worker_threads区别**：什么时候用哪个
4. **内存泄漏场景**：常见泄漏模式和排查方法
5. **中间件原理**：洋葱模型、next机制
6. **Promise异步链**：错误传播、async/await原理
7. **CommonJS vs ESM**：区别、加载机制
8. **进程间通信方式**

## 四、作品集项目建议

用你学到的知识构建以下项目，可以放到GitHub作为作品集：

1. **个人博客系统**：Express + SQLite + JWT + Markdown
2. **待办事项API**：RESTful设计、CRUD、认证
3. **CLI工具**：类似我们做的，比如项目脚手架
4. **实时聊天应用**：WebSocket、房间、私信
5. **简单爬虫**：数据采集、存储到CSV/JSON
6. **静态文件服务器**：类似serve，支持缓存、压缩

## 五、社区资源

- Node.js官方文档：nodejs.org/docs
- npm官网：npmjs.com
- GitHub: github.com/nodejs
- Stack Overflow [node.js标签]
- Node.js 中文网：nodejs.cn

## 六、结语

编程学习没有捷径，**多写代码、多读源码、多解决实际问题**是最好的学习方式。

本课程的所有示例都只用了Node.js内置模块，目的是让你理解底层原理。在实际工作中，可以根据需求选用成熟的第三方库，但理解了原理后，你用任何库都会更得心应手。

祝你在Node.js的世界里探索愉快，构建出优秀的应用！🚀
`,
    code: `// ============================================
// 综合应用：迷你API服务器
// 整合所学：HTTP服务器、路由、中间件、错误处理、日志、认证、CRUD
// ============================================

const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const users = new Map();
const posts = new Map();
const tokens = new Map();
let postId = 1;

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function generateToken() { return crypto.randomBytes(32).toString('hex'); }
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
function send(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); }

const middlewares = [];
function use(fn) { middlewares.push(fn); }
async function runMiddlewares(req, res) {
  let idx = 0;
  const next = async () => { idx++; if (idx < middlewares.length) await middlewares[idx](req, res, next); };
  if (middlewares.length > 0) await middlewares[0](req, res, next);
}

use(async (req, res, next) => {
  req.startTime = Date.now();
  const method = req.method, url = req.url;
  res.on('finish', () => console.log(\`[\${new Date().toISOString()}] \${method} \${url} \${res.statusCode} \${Date.now()-req.startTime}ms\`));
  await next();
});
use(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    if (tokens.has(token)) { req.user = tokens.get(token); }
  }
  await next();
});

const routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
function get(p, h) { routes.GET[p] = h; }
function post(p, h) { routes.POST[p] = h; }

function requireAuth(req, res, next) {
  if (!req.user) { send(res, 401, { error: '未认证' }); return false; }
  return true;
}

post('/api/register', async (req, res) => {
  const body = await parseBody(req);
  if (!body.username || !body.password) return send(res, 400, { error: '需要用户名和密码' });
  if (users.has(body.username)) return send(res, 409, { error: '用户已存在' });
  const salt = crypto.randomBytes(16).toString('hex');
  users.set(body.username, { username: body.username, passwordHash: hashPassword(body.password, salt), salt, createdAt: new Date() });
  send(res, 201, { message: '注册成功' });
});
post('/api/login', async (req, res) => {
  const body = await parseBody(req);
  const user = users.get(body.username);
  if (!user || hashPassword(body.password, user.salt) !== user.passwordHash) return send(res, 401, { error: '用户名或密码错误' });
  const token = generateToken();
  tokens.set(token, { username: body.username });
  setTimeout(() => tokens.delete(token), 3600000);
  send(res, 200, { token, expiresIn: 3600 });
});
get('/api/posts', async (req, res) => {
  send(res, 200, Array.from(posts.values()).reverse());
});
post('/api/posts', async (req, res) => {
  if (!requireAuth(req, res)) return;
  const body = await parseBody(req);
  if (!body.title || !body.content) return send(res, 400, { error: '需要标题和内容' });
  const post = { id: postId++, title: body.title, content: body.content, author: req.user.username, createdAt: new Date() };
  posts.set(post.id, post);
  send(res, 201, post);
});
get('/api/me', async (req, res) => {
  if (!requireAuth(req, res)) return;
  const user = users.get(req.user.username);
  send(res, 200, { username: user.username, createdAt: user.createdAt });
});

const server = http.createServer(async (req, res) => {
  await runMiddlewares(req, res);
  if (res.writableEnded) return;
  const url = new URL(req.url, 'http://localhost');
  const handler = routes[req.method] && routes[req.method][url.pathname];
  if (handler) { try { await handler(req, res); } catch (e) { send(res, 500, { error: e.message }); } }
  else send(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log('=== 综合API服务器演示 ===\\n');
  console.log(\`服务器启动在 http://localhost:\${PORT}\`);
  console.log('\\nAPI端点:');
  console.log('  POST /api/register  - 注册 {username,password}');
  console.log('  POST /api/login     - 登录，获得token');
  console.log('  GET  /api/posts     - 获取文章列表');
  console.log('  POST /api/posts     - 创建文章 (需要Authorization: Bearer <token>)');
  console.log('  GET  /api/me        - 获取当前用户信息 (需要认证)');
  console.log('\\n整合特性: HTTP服务器、路由、中间件模式、密码哈希、JWT风格认证、CRUD、日志中间件');
});
`,
  },
];







