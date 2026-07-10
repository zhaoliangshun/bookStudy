// =============================================================
// Node.js 交互式教程 —— 第十三批章节（进阶干货·底层机制与诊断篇，共 7 章）
// -------------------------------------------------------------
// 本批聚焦"开发者天天用却很少深究"的底层机制与诊断技能：
//   事件循环实战陷阱、内存与 GC 调优、Stream 高级用法、
//   进程模型选型、Node 内部机制、性能诊断工具链、全局错误处理体系。
// 所有代码示例均可在在线沙箱直接运行（仅用 Node 内置模块）。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：事件循环实战陷阱
  // =========================================================
  {
    id: "node-eventloop-pitfalls",
    group: "进阶干货",
    icon: "🌀",
    title: "事件循环实战陷阱",
    content: `## 事件循环实战陷阱

前面章节讲过事件循环的原理（六个阶段）。本章讲**实战中真正会踩的坑**——这些坑不会报错，只会让程序行为"诡异"，是最难排查的 bug 类型。

### 一、微任务与宏任务的执行时序

Node.js 的异步任务分两类：

**微任务（Microtask）**：当前阶段结束前必须清空
- \`process.nextTick\`（优先级最高，甚至高于 Promise）
- \`Promise.then / queueMicrotask\`

**宏任务（Macrotask / 阶段任务）**：进入事件循环队列
- \`setTimeout / setInterval\`（timers 阶段）
- \`setImmediate\`（check 阶段）
- \`I/O 回调\`（poll 阶段）
- \`close 回调\`（close 阶段）

#### 经典面试题：执行顺序

\`\`\`javascript
console.log('1 script start');  // 打印日志到 stdout

setTimeout(() => console.log('2 timeout'), 0);  // 延时回调（宏任务，timers 阶段执行）
setImmediate(() => console.log('3 immediate'));  // 在 check 阶段执行回调

Promise.resolve().then(() => console.log('4 promise'));  // 返回一个已成功的 Promise
queueMicrotask(() => console.log('5 microtask'));
process.nextTick(() => console.log('6 nextTick'));  // 把回调放入 nextTick 队列（微任务，优先级最高）

console.log('7 script end');  // 打印日志到 stdout
\`\`\`

**输出顺序**：1 → 7 → 6 → 4 → 5 → 2/3（2 和 3 顺序不定）

**关键结论**：
1. 同步代码永远最先执行完
2. \`nextTick\` 在所有微任务之前执行（包括 Promise）
3. \`setTimeout(0)\` 和 \`setImmediate\` 的顺序在主模块中**不确定**，但在 I/O 回调中**setImmediate 必先于 setTimeout**

### 二、nextTick 的递归陷阱

\`process.nextTick\` 优先级太高，会导致**事件循环被饿死**：

\`\`\`javascript
// ❌ 危险：I/O 永远得不到执行
function recursiveTick() {  // 声明函数 recursiveTick
  process.nextTick(recursiveTick);  // 把回调放入 nextTick 队列（微任务，优先级最高）
}
recursiveTick();
setTimeout(() => console.log('我永远执行不到'), 0);  // 延时回调（宏任务，timers 阶段执行）
// I/O 回调也永远执行不到，因为 nextTick 队列永远清不空
\`\`\`

**修复**：用 \`setImmediate\` 代替，setImmediate 会在每个阶段切换时执行，给 I/O 留出机会：

\`\`\`javascript
// ✅ 正确：用 setImmediate 做大量同步任务的分片
function chunked(i) {  // 声明函数 chunked
  if (i < 1000000) {  // 条件判断
    // 处理一小块
    doWork(i);
    setImmediate(() => chunked(i + 1)); // 让出 CPU 给 I/O
  }
}
chunked(0);
\`\`\`

### 三、setTimeout(0) 的真实延迟

\`setTimeout(fn, 0)\` 在 Node.js 中**不是 0ms 执行**，而是被 clamp 到 **1ms**。而且如果事件循环繁忙，延迟会更大：

\`\`\`javascript
const start = Date.now();  // 定义常量 start
setTimeout(() => {  // 延时回调（宏任务，timers 阶段执行）
  console.log('实际延迟:', Date.now() - start, 'ms'); // 经常是 1-7ms，繁忙时几十 ms
}, 0);

// 用一个耗时同步任务阻塞事件循环
for (let i = 0; i < 1e8; i++) {}  // for 循环
\`\`\`

**实战影响**：
- 心跳/超时检测不要依赖 \`setTimeout\` 的精确性
- 高精度计时用 \`process.hrtime.bigint()\`，不用 \`Date.now()\`
- 延时任务至少给 20% 的容差

### 四、setImmediate vs setTimeout 在 I/O 中的确定性

在主模块（顶层代码）中两者顺序不定，但在 **I/O 回调中 setImmediate 必先于 setTimeout**：

\`\`\`javascript
const fs = require('fs');  // 导入模块 fs；require 返回 module.exports

fs.readFile('package.json', () => {  // 异步读取文件（回调形式）
  // 在 I/O 回调里
  setTimeout(() => console.log('timeout'), 0);  // 延时回调（宏任务，timers 阶段执行）
  setImmediate(() => console.log('immediate')); // 一定先打印
});
\`\`\`

**原因**：I/O 回调属于 poll 阶段，poll 阶段结束后下一个阶段就是 check（setImmediate），而 timers 阶段要等下一轮循环。

### 五、unref 与 ref：让定时器不阻止退出

\`\`\`javascript
// 默认：定时器会阻止进程退出
const timer = setInterval(() => console.log('心跳'), 1000);  // 定义常量 timer

// 标记为 unref：如果没有其他事件，进程可以退出
timer.unref();

// 恢复为 ref
// timer.ref();
\`\`\`

**实战场景**：数据库连接池的心跳、日志刷新定时器，都应该 \`unref\`，避免它们阻止进程优雅退出。

### 六、阻塞事件循环的元凶

任何**长时间同步操作**都会阻塞整个事件循环，导致所有请求超时：

\`\`\`javascript
// ❌ 致命：JSON.parse 大文件
const huge = fs.readFileSync('huge.json', 'utf8'); // 同步读
const data = JSON.parse(huge); // 大 JSON 解析是同步的，可能几秒

// ✅ 改用流式解析（如 stream-json 库）
// ✅ 或放到 worker_threads
\`\`\`

**常见阻塞元凶**：
- 大 JSON.stringify / parse
- 正则灾难性回溯（见正则性能章）
- 加密计算（bcrypt、大量 hash）
- 同步 fs 操作
- 复杂数学运算（大数运算、图像处理）

### 七、UV_THREADPOOL_SIZE 的秘密

Node.js 用 libuv 的线程池处理部分"异步"操作（实则是线程池 + 回调）：
- fs 操作（部分）
- crypto.pbkdf2 / scrypt
- dns.lookup
- zlib 压缩

默认线程池大小 **4**。如果这些操作密集，会相互排队：

\`\`\`bash
# 启动时设置（启动后修改无效）
UV_THREADPOOL_SIZE=8 node server.js
\`\`\`

**实战判断**：如果你的服务大量做 crypto.pbkdf2（如登录接口），4 个线程很快成为瓶颈，调到 CPU 核心数是合理的。

### 八、监测事件循环延迟

\`\`\`javascript
// 监测事件循环的 lag（延迟）
let lastCheck = process.hrtime.bigint();  // 定义变量 lastCheck（可变）

setInterval(() => {  // 周期回调
  const now = process.hrtime.bigint();  // 定义常量 now
  const lagMs = Number(now - lastCheck) / 1e6 - 100; // 期望 100ms
  if (lagMs > 50) {  // 条件判断
    console.warn('事件循环延迟:', lagMs.toFixed(1), 'ms');  // 打印警告到 stderr
  }
  lastCheck = now;
}, 100);
\`\`\`

**生产建议**：lag > 100ms 就该告警，> 1s 说明有严重阻塞。

### 九、总结：事件循环的实战心智模型

1. 同步代码 → nextTick → Promise → 阶段任务
2. \`nextTick\` 递归会饿死 I/O，大量分片用 \`setImmediate\`
3. \`setTimeout(0)\` 实际是 1ms，繁忙时更大
4. I/O 回调中 \`setImmediate\` 必先于 \`setTimeout\`
5. 长任务必须分片或进 worker_threads
6. 心跳定时器记得 \`unref\`
7. crypto/fs/dns 密集场景调 \`UV_THREADPOOL_SIZE\``,
    code: `// ============================================================
// 事件循环实战陷阱演示
// ============================================================

console.log("===== 1. 微任务与宏任务时序 =====");
console.log("1 script start");

setTimeout(() => console.log("2 timeout"), 0);
setImmediate(() => console.log("3 immediate"));

Promise.resolve().then(() => console.log("4 promise"));
// 沙箱未提供 queueMicrotask，用 Promise 等价实现
Promise.resolve().then(() => console.log("5 microtask"));
process.nextTick(() => console.log("6 nextTick"));

console.log("7 script end");
// 输出：1,7,6,4,5,然后 2/3 顺序不定

// ---- 2. setTimeout(0) 真实延迟 ----
console.log("\\n===== 2. setTimeout(0) 真实延迟 =====");
const t0 = Date.now();
setTimeout(() => {
  console.log("  实际延迟:", Date.now() - t0, "ms (不是 0)");
}, 0);

// ---- 3. unref 演示（不会阻止退出）----
console.log("\\n===== 3. unref 定时器不阻止退出 =====");
const heartbeat = setInterval(() => {
  console.log("  [心跳] 仍在跳动");
}, 200);
heartbeat.unref();
console.log("  心跳已 unref，进程可在无其他任务时退出");

// ---- 4. 事件循环延迟监测 ----
console.log("\\n===== 4. 事件循环延迟监测 =====");
// 注：沙箱未绑定 process.hrtime.bigint，用 performance.now() 等价替代（精度微秒级）
let last = performance.now();
const monitor = setInterval(() => {
  const now = performance.now();
  const lag = now - last - 50;
  console.log("  事件循环 lag:", lag.toFixed(2), "ms");
  last = now;
}, 50);
monitor.unref(); // 不阻止退出，演示几次后自然结束

// ---- 5. I/O 回调中 setImmediate 必先于 setTimeout ----
console.log("\\n===== 5. I/O 回调中的时序 =====");
const { readFile } = require("fs");
readFile("package.json", () => {
  console.log("  [I/O 回调]");
  setTimeout(() => console.log("  → timeout"), 0);
  setImmediate(() => console.log("  → immediate (必先于 timeout)"));
});

console.log("\\n  主模块代码执行完毕，等待异步回调...\\n");`,
  },

  // =========================================================
  // 第二章：内存管理与 GC 调优
  // =========================================================
  {
    id: "node-memory-gc",
    group: "进阶干货",
    icon: "🧠",
    title: "内存管理与 GC 调优",
    content: `## 内存管理与 GC 调优

Node.js 用 V8 引擎，所以内存管理本质是 **V8 的垃圾回收**。理解 V8 的内存模型和 GC 策略，是排查内存泄漏、优化性能的必修课。

### 一、V8 的内存结构

V8 的堆（Heap）分为两部分：

**新生代（Young Generation）**
- 大小：1~8MB（通过 \`--max-semi-space-size\` 调整）
- 存放新创建的短命对象
- 用 **Scavenge（复制式）算法** 回收
- 分成 From 和 To 两个半区，GC 时把存活对象从 From 复制到 To，清空 From

**老生代（Old Generation）**
- 大小：受 \`--max-old-space-size\` 限制（默认约 1.5GB，64 位系统）
- 存放存活时间长的对象（经过两次 Scavenge 仍存活的对象晋升到这里）
- 用 **Mark-Sweep（标记清除）+ Mark-Compact（标记整理）** 回收
- GC 会引起 STW（Stop-The-World），但 V8 用增量标记和并发标记减少停顿

### 二、查看当前内存使用

\`\`\`javascript
// 进程内存使用情况
console.log(process.memoryUsage());  // 打印日志到 stdout
// {
//   rss: 35512320,          // 常驻集大小（包含堆+ C++ 对象+栈）
//   heapTotal: 6947968,     // V8 堆总大小（已分配）
//   heapUsed: 4582560,      // V8 堆实际使用
//   external: 87232,        // C++ 对象占用的内存（如 Buffer）
//   arrayBuffers: 9898      // Buffer 占用的内存
// }

// 操作系统视角的内存
console.log(process.resourceUsage());  // 打印日志到 stdout
\`\`\`

**关键指标**：
- \`rss\` 持续增长不下降 → 可能内存泄漏，或 V8 没及时归还内存给 OS
- \`heapUsed\` 接近 \`heapTotal\` → 堆快满了
- \`external\` 异常大 → Buffer/TypedArray 泄漏

### 三、--max-old-space-size 调整堆上限

默认堆上限对大内存应用（如缓存服务）不够：

\`\`\`bash
# 设置老生代最大 4GB
node --max-old-space-size=4096 server.js  # 用 Node.js 执行脚本 --max-old-space-size=4096
\`\`\`

**注意**：设置过大不一定是好事——堆越大，Full GC 耗时越长，STW 时间越长。一般 2-4GB 是平衡点，超过后建议拆分进程或用 worker。

### 四、常见的内存泄漏模式

#### 1. 全局变量（最常见）

\`\`\`javascript
// ❌ 忘记 const/let，变成全局变量
function handler(req, res) {  // 声明函数 handler
  cache = {}; // 等价于 global.cache = {}
  cache[req.id] = req.body; // 永远不会被回收
}
\`\`\`

**修复**：开启严格模式（\`'use strict'\`），未声明变量会报错。

#### 2. 闭包持有大对象

\`\`\`javascript
// ❌ 闭包意外持有大对象
function outer() {  // 声明函数 outer
  const hugeData = new Array(1e6).fill('x');  // 创建实例 hugeData
  return function inner() {  // 返回值
    console.log('do something'); // hugeData 没被使用，但 V8 可能仍保留它
  };
}
const fn = outer(); // hugeData 被泄漏
\`\`\`

#### 3. 未清理的定时器和监听器

\`\`\`javascript
// ❌ 经典泄漏：长连接+定时器
function createClient() {  // 声明函数 createClient
  const client = new BigClient();  // 创建实例 client
  setInterval(() => {  // 周期回调
    client.heartbeat(); // client 永远无法被回收
  }, 1000);
  return client;  // 返回值
}
// 用完后没 clearInterval，client 泄漏
\`\`\`

#### 4. Map/Set 当缓存不设上限

\`\`\`javascript
// ❌ 无限增长的缓存
const cache = new Map();  // 创建实例 cache
app.get('/data/:id', (req, res) => {  // 注册 GET 路由处理
  if (!cache.has(req.params.id)) {  // 条件判断
    cache.set(req.params.id, fetchData(req.params.id));
  }
  res.json(cache.get(req.params.id));  // 发送 JSON 响应
});
// cache 永远增长
\`\`\`

**修复**：用 LRU 缓存（如 lru-cache 包），设上限。

### 五、用 heapdump 抓取堆快照

抓取堆快照是排查泄漏的核心手段：

\`\`\`javascript
const v8 = require('v8');  // 导入模块 v8；require 返回 module.exports
const fs = require('fs');  // 导入模块 fs；require 返回 module.exports

// 写入堆快照到文件
function dumpHeap(name) {  // 声明函数 dumpHeap
  const fileName = \`heap-\${name || 'snapshot'}-\${Date.now()}.heapsnapshot\`;  // 定义常量 fileName
  const data = v8.writeHeapSnapshot(fileName);  // 定义常量 data
  console.log('堆快照已保存:', data);  // 打印日志到 stdout
}

// 监听信号，方便线上抓取
process.on('SIGUSR2', () => dumpHeap('signal'));  // 注册进程级事件监听

// 内存超阈值自动抓
setInterval(() => {  // 周期回调
  const used = process.memoryUsage().heapUsed / 1024 / 1024;  // 定义常量 used
  if (used > 500) { // 超过 500MB
    dumpHeap('leak');
  }
}, 60000);
\`\`\`

**分析流程**：
1. 在不同时间点抓两个快照
2. 用 Chrome DevTools 的 Memory 面板对比
3. 找出 Delta（增量）最大的对象类型

### 六、WeakRef 与 FinalizationRegistry（Node 14+）

弱引用让对象可以被 GC 回收，同时还能在回收时收到通知：

\`\`\`javascript
// WeakRef：不阻止对象被回收
let hugeObj = { data: new Array(1e6).fill('x') };  // 定义变量 hugeObj（可变）
const weakRef = new WeakRef(hugeObj);  // 创建实例 weakRef

console.log(weakRef.deref()); // 仍能访问
hugeObj = null; // 解除强引用
global.gc && global.gc(); // 手动 GC（需 --expose-gc）
console.log(weakRef.deref()); // 可能是 undefined（已被回收）

// FinalizationRegistry：对象被回收时回调
const registry = new FinalizationRegistry((value) => {  // 创建实例 registry
  console.log('对象被回收了:', value);  // 打印日志到 stdout
});
registry.register(hugeObj, 'hugeObj 标记');
\`\`\`

**注意**：WeakRef 的回调**不保证及时**执行，不要用它做关键资源清理。

### 七、Buffer 的内存：不在 V8 堆里

\`Buffer\` 分配的内存是 C++ 层的，**不算在 heapUsed 里，而是算在 external**：

\`\`\`javascript
const buf = Buffer.alloc(100 * 1024 * 1024); // 100MB
const m = process.memoryUsage();  // 定义常量 m
console.log('heapUsed:', (m.heapUsed / 1024 / 1024).toFixed(1), 'MB');  // 打印日志到 stdout
console.log('external:', (m.external / 1024 / 1024).toFixed(1), 'MB'); // ~100MB
\`\`\`

**影响**：监控内存泄漏时，要同时盯 rss 和 external，单看 heapUsed 会漏掉 Buffer 泄漏。

### 八、GC 日志与调优标志

\`\`\`bash
# 打印 GC 日志
node --trace-gc server.js  # 用 Node.js 执行脚本 --trace-gc

# 只打印重大 GC（>50ms）
node --trace-gc-verbose server.js | grep "Mark-Compact"  # 用 Node.js 执行脚本 --trace-gc-verbose

# 调整 GC 触发策略
node --gc-interval=100          # 每 100 次分配触发一次 GC
node --max-old-space-size=2048  # 老生代 2GB
node --max-semi-space-size=64   # 新生代半区 64MB
node --expose-gc                # 暴露 global.gc() 手动触发
\`\`\`

### 九、生产环境内存 Checklist

1. 堆上限根据机器内存设：一般占物理内存的 50-75%
2. 长连接服务必检查定时器/监听器是否清理
3. 缓存一律用 LRU，设上限
4. 上线前用 \`--trace-warnings\` 跑一遍，发现 MaxListeners 警告
5. 部署 heapdump 抓取机制，留 SIGUSR2 钩子
6. 监控 rss 和 external，不只是 heapUsed`,
    code: `// ============================================================
// 内存管理与 GC 演示
// ============================================================

console.log("===== 1. process.memoryUsage 各项含义 =====");
const m0 = process.memoryUsage();
console.log("  rss       :", (m0.rss / 1024 / 1024).toFixed(2), "MB (常驻集)");
console.log("  heapTotal :", (m0.heapTotal / 1024 / 1024).toFixed(2), "MB (V8 堆总量)");
console.log("  heapUsed  :", (m0.heapUsed / 1024 / 1024).toFixed(2), "MB (V8 堆使用)");
console.log("  external :", (m0.external / 1024 / 1024).toFixed(2), "MB (C++ 对象)");
console.log("  arrayBuf  :", (m0.arrayBuffers / 1024 / 1024).toFixed(2), "MB (Buffer)");

// ---- 2. Buffer 的内存算在 external ----
console.log("\\n===== 2. Buffer 不占 V8 堆，占 external =====");
const before = process.memoryUsage();
const bigBuf = Buffer.alloc(50 * 1024 * 1024); // 50MB
const after = process.memoryUsage();
console.log("  分配 50MB Buffer 后：");
console.log("    heapUsed 变化:", ((after.heapUsed - before.heapUsed) / 1024 / 1024).toFixed(2), "MB");
console.log("    external 变化:", ((after.external - before.external) / 1024 / 1024).toFixed(2), "MB");

// ---- 3. 内存泄漏演示：未清理的监听器 ----
console.log("\\n===== 3. MaxListenersExceededWarning =====");
const emitter = new (require("events"))();
emitter.setMaxListeners(15); // 演示用，默认 10
for (let i = 0; i < 20; i++) {
  emitter.on("data", () => {}); // 超过 15 会警告
}

// ---- 4. WeakRef 演示 ----
console.log("\\n===== 4. WeakRef 弱引用 =====");
let obj = { name: "大对象", data: new Array(10000).fill(0) };
const ref = new WeakRef(obj);
console.log("  deref():", ref.deref() ? "仍存在" : "已被回收");
obj = null; // 解除强引用
// 注：沙箱无 global 对象，用 globalThis 替代（需 --expose-gc 启动才有 gc）
if (typeof globalThis.gc === "function") {
  globalThis.gc();
  console.log("  手动 GC 后 deref():", ref.deref() ? "仍存在" : "已被回收");
} else {
  console.log("  (用 --expose-gc 启动可看到 GC 效果)");
}

// ---- 5. 抓堆快照（演示 API） ----
console.log("\\n===== 5. v8.writeHeapSnapshot 可用 =====");
// 注：沙箱未开放 v8 模块，这里仅打印用法说明（生产环境真实可用）
console.log("  生产用法：require('v8').writeHeapSnapshot() 返回文件路径");
console.log("  信号触发：process.on('SIGUSR2', () => require('v8').writeHeapSnapshot())");
console.log("  分析方式：Chrome DevTools → Memory → Load");

// ---- 6. 堆上限（只读） ----
console.log("\\n===== 6. 堆统计（用 process.memoryUsage 替代 v8.getHeapStatistics）=====");
const mu = process.memoryUsage();
console.log("  堆使用  :", (mu.heapUsed / 1024 / 1024).toFixed(1), "MB");
console.log("  堆总量  :", (mu.heapTotal / 1024 / 1024).toFixed(1), "MB");
console.log("  外部内存:", (mu.external / 1024 / 1024).toFixed(1), "MB");
console.log("  提示：启动时用 --max-old-space-size=N 调整上限");`,
  },

  // =========================================================
  // 第三章：Stream 高级实战
  // =========================================================
  {
    id: "node-stream-advanced-pro",
    group: "进阶干货",
    icon: "🌊",
    title: "Stream 高级实战",
    content: `## Stream 高级实战

前面章节讲了 Stream 的基础。本章讲**实战中真正会用到的进阶用法**：pipeline、背压、自定义流、Transform 链。这些是处理大文件、流式 API、实时数据的基础。

### 一、为什么必须用 pipeline 而不是 .pipe()

经典的 \`stream.pipe()\` 有个**致命缺陷**：如果目标流报错或关闭，源流不会被自动销毁，导致内存泄漏：

\`\`\`javascript
// ❌ 危险写法
readable.pipe(transform).pipe(writable);
// 如果 writable 报错，readable 和 transform 不会被销毁，继续读数据无去处
\`\`\`

**正确做法**：用 \`stream.pipeline\`（Node 10+），它自动处理错误传播和资源清理：

\`\`\`javascript
const { pipeline } = require('stream/promises');  // 导入模块 stream/promises；require 返回 module.exports

async function copyFile() {  // 声明异步函数，内部可用 await
  await pipeline(  // 等待 Promise 完成后再继续
    fs.createReadStream('input.txt'),  // 创建可读流（分块读取大文件）
    zlib.createGzip(),        // 压缩
    fs.createWriteStream('output.txt.gz')  // 创建可写流（分块写入大文件）
  );
  console.log('完成');  // 打印日志到 stdout
}
copyFile().catch(console.error);
\`\`\`

**pipeline 的优势**：
1. 任意一个流出错，所有流都会被销毁
2. 正确处理背压
3. 返回 Promise，方便 await
4. 完成时自动清理资源

### 二、背压（Backpressure）的本质

流的速度不匹配时会产生背压：**生产者比消费者快**，数据堆积在内存缓冲区。

\`\`\`javascript
// ❌ 背压问题：读得快写得慢
const readable = fs.createReadStream('huge.dat');  // 文件操作结果 readable
const writable = fs.createWriteStream('slow-disk.dat');  // 文件操作结果 writable
readable.on('data', (chunk) => {
  writable.write(chunk); // 忽略返回值！
});
// 如果磁盘慢，数据堆积在 writable 的内部缓冲区，内存爆炸
\`\`\`

**正确处理背压**：

\`\`\`javascript
readable.on('data', (chunk) => {
  const ok = writable.write(chunk);  // 定义常量 ok
  if (!ok) {  // 条件判断
    // 返回 false 说明缓冲区满了，暂停读取
    readable.pause();
  }
});
writable.on('drain', () => {
  // 缓冲区排空了，恢复读取
  readable.resume();
});
\`\`\`

\`.pipe()\` 和 \`pipeline()\` 内部已经处理了背压，所以**优先用它们**，别手写。

### 三、自定义 Readable 流

继承 \`Readable\` 并实现 \`_read\` 方法：

\`\`\`javascript
const { Readable } = require('stream');

// 生成斐波那契数列的流
class FibonacciStream extends Readable {
  constructor(options) {
    super(options);
    this.a = 0;
    this.b = 1;
    this.count = 0;
    this.max = options.max || 20;
  }

  _read(size) {
    if (this.count >= this.max) {
      this.push(null); // push null 表示流结束
      return;
    }
    const next = this.a + this.b;
    this.a = this.b;
    this.b = next;
    this.count++;
    this.push(\`Fib(\${this.count}) = \${next}\\n\`);
  }
}

const fib = new FibonacciStream({ max: 10 });
fib.pipe(process.stdout);
\`\`\`

**关键点**：
- \`_read\` 在消费者要数据时被调用（拉模式）
- \`push(null)\` 表示流结束
- \`push(data)\` 可以在 \`_read\` 之外异步调用（推模式）

### 四、自定义 Transform 流

Transform 是"读入 → 转换 → 输出"的流，实现 \`_transform\` 和可选的 \`_flush\`：

\`\`\`javascript
const { Transform } = require('stream');

// 行计数器：统计每个数据块有多少行
class LineCounter extends Transform {
  constructor(options) {
    super({ ...options, readableObjectMode: false, writableObjectMode: false });
    this.lineCount = 0;
  }

  _transform(chunk, encoding, callback) {
    const text = chunk.toString();
    const lines = text.split('\\n');
    this.lineCount += lines.length - 1;
    this.push(chunk); // 原样输出
    callback();
  }

  _flush(callback) {
    this.push(\`\\n--- 总行数: \${this.lineCount} ---\\n\`);
    callback();
  }
}

fs.createReadStream('big.log')
  .pipe(new LineCounter())
  .pipe(process.stdout);
\`\`\`

**对象模式**：处理对象而不是 Buffer 时，设 \`objectMode: true\`：

\`\`\`javascript
class JSONParser extends Transform {  // 定义类 JSONParser
  constructor() {  // 构造函数
    super({ objectMode: true }); // 接收对象，输出对象
  }
  _transform(obj, enc, cb) {
    obj.processedAt = Date.now();
    this.push(obj);
    cb();
  }
}
\`\`\`

### 五、流式处理大文件：分块读取与处理

处理几个 GB 的大文件，绝不能 \`readFileSync\` 一次读完：

\`\`\`javascript
const { createReadStream } = require('fs');  // 导入模块 fs；require 返回 module.exports
const { createInterface } = require('readline');  // 导入模块 readline；require 返回 module.exports

// 逐行处理大文件，内存占用恒定
async function processLargeFile(path) {  // 声明异步函数，内部可用 await
  const rl = createInterface({  // 定义常量 rl
    input: createReadStream(path),
    crlfDelay: Infinity,
  });

  let count = 0;  // 定义变量 count（可变）
  for await (const line of rl) {
    count++;
    if (line.includes('ERROR')) {  // 条件判断
      console.log(\`Line \${count}: \${line}\`);  // 打印日志到 stdout
    }
  }
  console.log('总行数:', count);  // 打印日志到 stdout
}
\`\`\`

### 六、可写流的并行写入控制

\`writable.write()\` 返回 \`false\` 时要等 \`drain\` 事件。批量写入时要控制并发：

\`\`\`javascript
class BatchWriter extends Writable {
  constructor() {
    super({ objectMode: true });
    this.batch = [];
  }
  _write(chunk, enc, cb) {
    this.batch.push(chunk);
    if (this.batch.length >= 100) {
      flushBatch(this.batch).then(cb).catch(cb);
      this.batch = [];
    } else {
      cb();
    }
  }
  _final(cb) {
    if (this.batch.length) flushBatch(this.batch).then(() => cb()).catch(cb);
    else cb();
  }
}
\`\`\`

### 七、流错误处理的常见坑

\`\`\`javascript
// ❌ 错误：事件流中错误不会自动传播
readable
  .on('data', () => { throw new Error('boom'); }) // 这个错误不会让流停止
  .on('error', console.error);

// ✅ 正确：手动 destroy
readable.on('data', () => {
  try {
    riskyOp();
  } catch (e) {
    readable.destroy(e); // 把错误传给 error 事件
  }
});
\`\`\`

### 八、消费流的三种方式

\`\`\`javascript
// 方式 1：事件（最灵活）
readable.on('data', chunk => {});
readable.on('end', () => {});

// 方式 2：async 迭代器（推荐，代码最简洁）
for await (const chunk of readable) {
  console.log(chunk);  // 打印日志到 stdout
}

// 方式 3：消费为字符串/Buffer（Node 17+）
const chunks = [];  // 定义数组 chunks
for await (const chunk of readable) chunks.push(chunk);
const result = Buffer.concat(chunks).toString();  // 定义常量 result
\`\`\`

### 九、实战：HTTP 流式响应

\`\`\`javascript
const http = require('http');  // 导入模块 http；require 返回 module.exports
const { createGzip } = require('zlib');  // 导入模块 zlib；require 返回 module.exports

http.createServer((req, res) => {  // 创建 HTTP 服务器，回调接收 req/res
  res.setHeader('Content-Encoding', 'gzip');  // 设置响应头
  fs.createReadStream('big.json')  // 创建可读流（分块读取大文件）
    .pipe(createGzip())  // 管道：把可读流接到可写流
    .pipe(res); // 直接 pipe 到 HTTP 响应
}).listen(3000);
\`\`\`

**优势**：内存占用恒定（不管文件多大），数据边读边压缩边发送。

### 十、实战 Checklist

1. 永远用 \`pipeline\` 代替 \`.pipe()\` 链
2. 处理大文件用 \`readline\` 或 \`for await...of\`
3. 自定义流注意 \`objectMode\` 和 \`_final\`/ \`_flush\`
4. 监听 \`error\` 事件，必要时 \`destroy(err)\`
5. 流式响应是 Node.js 的杀手锏，能用流就不要 \`readFileSync\``,
    code: `// ============================================================
// Stream 高级实战演示
// ============================================================

const { Readable, Transform, Writable, pipeline: pipelineCb } = require("stream");  // 导入模块 stream；require 返回 module.exports
const { promisify } = require("util");  // 导入模块 util；require 返回 module.exports
// 注：沙箱未开放 stream/promises 子模块，用 util.promisify 包装 callback 版本
const pipeline = promisify(pipelineCb);  // 定义常量 pipeline
const { createReadStream } = require("fs");  // 导入模块 fs；require 返回 module.exports

console.log("===== 1. 自定义 Readable：生成斐波那契数列 =====");  // 打印日志到 stdout
class FibonacciStream extends Readable {  // 定义类 FibonacciStream
  constructor(opts) {  // 构造函数
    super(opts);  // 调用父类构造函数
    this.a = 0;
    this.b = 1;
    this.n = 0;
    this.max = opts.max || 8;
  }
  _read() {
    if (this.n >= this.max) {  // 条件判断
      this.push(null);
      return;
    }
    const next = this.a + this.b;  // 定义常量 next
    this.a = this.b;
    this.b = next;
    this.n++;
    this.push("Fib(" + this.n + ") = " + next + "\\n");
  }
}
const fib = new FibonacciStream({ max: 8 });  // 创建实例 fib
fib.on("data", (c) => process.stdout.write("  " + c));
fib.on("end", () => console.log("  --- 流结束 ---"));

// ---- 2. Transform 流：行计数器 ----
console.log("\\n===== 2. Transform 流：统计行数 + 原样输出 =====");  // 打印日志到 stdout
class LineCounter extends Transform {  // 定义类 LineCounter
  constructor(opts) {  // 构造函数
    super(opts);  // 调用父类构造函数
    this.count = 0;
  }
  _transform(chunk, enc, cb) {
    const text = chunk.toString();  // 定义常量 text
    this.count += text.split("\\n").length - 1;
    this.push(chunk);
    cb();
  }
  _flush(cb) {
    this.push("\\n  --- 统计: " + this.count + " 行 ---\\n");
    cb();
  }
}

// 用内置文本做演示（避免文件依赖）
// 注：沙箱 process.stdout 不是真正的 Writable 流，用自定义 Writable 替代
const consoleWritable = new Writable({  // 创建实例 consoleWritable
  write(chunk, enc, cb) {
    process.stdout.write(chunk.toString());  // 直接写到 stdout（不加换行）
    cb();
  },
});
const sampleText = "line1\\nline2\\nline3\\nline4\\nline5\\n";  // 定义常量 sampleText
const src = Readable.from([sampleText]);  // 定义常量 src
src.pipe(new LineCounter()).pipe(consoleWritable);

// ---- 3. pipeline 错误处理演示 ----
console.log("\\n===== 3. pipeline 自动错误传播 =====");  // 打印日志到 stdout
const brokenReadable = Readable.from((async function* () {  // 定义常量 brokenReadable
  yield "chunk1\\n";
  yield "chunk2\\n";
  throw new Error("模拟流中错误");  // 抛出错误中断执行
})());

const loggingWritable = new Writable({  // 创建实例 loggingWritable
  write(chunk, enc, cb) {
    console.log("  收到:", chunk.toString().trim());  // 打印日志到 stdout
    cb();
  },
});

pipeline(brokenReadable, loggingWritable)
  .then(() => console.log("  pipeline 完成"))  // 注册 Promise 成功回调
  .catch((err) => console.log("  pipeline 捕获错误:", err.message));  // 注册 Promise 失败回调

// ---- 4. for await 消费流（推荐方式）----
console.log("\\n===== 4. for await...of 消费流 =====");  // 打印日志到 stdout
(async () => {
  const data = Readable.from(["a", "b", "c", "d"]);  // 定义常量 data
  for await (const item of data) {
    console.log("  迭代到:", item);  // 打印日志到 stdout
  }
  console.log("  迭代结束");  // 打印日志到 stdout
})();

// ---- 5. 对象模式流 ----
console.log("\\n===== 5. 对象模式 Transform =====");  // 打印日志到 stdout
class UppercaseKey extends Transform {  // 定义类 UppercaseKey
  constructor() {  // 构造函数
    super({ objectMode: true });  // 调用父类构造函数
  }
  _transform(obj, enc, cb) {
    obj.processed = true;
    this.push(obj);
    cb();
  }
}
const objStream = Readable.from([{ id: 1 }, { id: 2 }, { id: 3 }]);  // 定义常量 objStream
objStream.pipe(new UppercaseKey()).on("data", (o) => console.log("  对象:", o));

console.log("\\n  → Stream 高级用法演示启动完毕\\n");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第四章：进程模型选型
  // =========================================================
  {
    id: "node-process-models",
    group: "进阶干货",
    icon: "⚙️",
    title: "进程模型选型",
    content: `## 进程模型选型

Node.js 单线程不代表没有多进程/多线程能力。理解 \`cluster\`、\`worker_threads\`、\`child_process\` 三者的本质区别和适用场景，是写出高性能 Node 服务的关键。

### 一、三种并发模型的本质区别

| 特性 | child_process | cluster | worker_threads |
|------|--------------|---------|----------------|
| 隔离级别 | 完全独立进程 | 独立进程 | 独立 V8 上下文，共享进程 |
| 共享内存 | ❌ | ❌ | ✅（SharedArrayBuffer） |
| 启动开销 | 大（新 V8 实例） | 大 | 小（同进程内） |
| 通信方式 | IPC/stdio | IPC | MessagePort（同进程内） |
| 共享端口 | ❌ | ✅（核心特性） | ❌ |
| 适用场景 | 跑外部命令/独立服务 | HTTP 服务多核扩展 | CPU 密集任务 |

### 二、child_process：四兄弟

\`\`\`javascript
const { exec, execFile, spawn, fork } = require('child_process');

// 1. spawn：最底层，流式输出，适合长命令
const p1 = spawn('ls', ['-la']);
p1.stdout.on('data', d => console.log(d.toString()));

// 2. exec：用 shell 执行，返回 buffer，适合短命令
exec('ls -la | wc -l', (err, stdout) => {
  console.log('文件数:', stdout.trim());
});

// 3. execFile：不用 shell，更安全（避免注入），参数用数组
execFile('node', ['--version'], (err, stdout) => {
  console.log('Node 版本:', stdout.trim());
});

// 4. fork：spawn 的特化版，专门 fork Node 进程，带 IPC
const child = fork('./worker.js', [], { silent: false });
child.send({ task: 'compute', data: 100 });
child.on('message', (msg) => console.log('子进程返回:', msg));
\`\`\`

**选型建议**：
- 跑 shell 命令（管道、通配符）→ \`exec\`
- 跑可执行文件（参数可控）→ \`execFile\` 或 \`spawn\`
- 启动另一个 Node 脚本并要通信 → \`fork\`

### 三、cluster：共享端口的秘密

cluster 的核心价值是**多进程共享同一个端口**，由主进程做负载均衡：

\`\`\`javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  console.log('主进程 PID:', process.pid);
  const numCPUs = os.availableParallelism?.() || os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code) => {
    console.log(\`worker \${worker.process.pid} 退出，重启\`);
    cluster.fork(); // 自动重启
  });
} else {
  http.createServer((req, res) => {
    res.end(\`Hello from worker \${process.pid}\`);
  }).listen(3000);
  console.log('worker PID:', process.pid);
}
\`\`\`

**负载均衡策略**：
- Node 16+ 默认 \`SCHED_RR\`（轮询），公平
- 可设 \`cluster.schedulingPolicy = cluster.SCHED_NONE\` 让 OS 决定（旧默认）

**实战注意**：
1. worker 之间**不共享内存**，状态/缓存要靠 IPC 或 Redis 同步
2. 主进程崩溃会让所有 worker 失联，生产用 PM2/systemd 守护
3. 不要 fork 太多 worker（超过 CPU 核心数没意义）

### 四、worker_threads：CPU 密集任务的救星

worker_threads 在**同一个进程内**跑多个 V8 实例，共享进程内存，通信开销远小于 fork：

\`\`\`javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename, {
    workerData: { n: 40 },
  });
  worker.on('message', (result) => {
    console.log('计算结果:', result);
  });
  worker.on('error', console.error);
  worker.on('exit', (code) => {
    if (code !== 0) console.error('worker 异常退出', code);
  });
} else {
  // worker 线程
  const { n } = workerData;
  // CPU 密集任务：算斐波那契
  function fib(k) {
    return k < 2 ? k : fib(k - 1) + fib(k - 2);
  }
  const result = fib(n);
  parentPort.postMessage(result);
}
\`\`\`

**worker_threads 的关键特性**：
1. **共享内存**：用 \`SharedArrayBuffer\` + \`Atomics\` 零拷贝传递数据
2. **MessagePort**：双向通信通道，比 IPC 快
3. **可以 require**：worker 线程能加载 CJS 模块（不是所有内置模块都可用）
4. **限制**：worker 内不能直接监听端口（要用主线程转发）

### 五、SharedArrayBuffer 零拷贝

\`\`\`javascript
const { Worker } = require('worker_threads');

// 主线程分配共享内存
const sharedBuffer = new SharedArrayBuffer(4); // 4 字节
const view = new Int32Array(sharedBuffer);
view[0] = 0;

const worker = new Worker('./counter.js', { workerData: sharedBuffer });
worker.on('message', () => {
  console.log('最终值:', view[0]); // 直接读，无需通信
});

// counter.js (worker)
const { workerData } = require('worker_threads');
const view = new Int32Array(workerData);
for (let i = 0; i < 1000000; i++) {
  Atomics.add(view, 0, 1); // 原子操作，线程安全
}
\`\`\

### 六、什么时候用什么？

#### 场景 1：HTTP 服务榨干多核
→ **cluster**（共享端口是核心需求，worker_threads 不能监听端口）

#### 场景 2：图像处理 / 加密计算 / 大 JSON 解析
→ **worker_threads**（CPU 密集，需要返回结果，通信开销小）

#### 场景 3：调用外部命令（git、ffmpeg）
→ **spawn / execFile**（跑外部程序，捕获输出）

#### 场景 4：定时跑独立脚本（数据清洗）
→ **fork**（启动 Node 脚本，需要 IPC 通信结果）

#### 场景 5：跨语言服务（调用 Python 算法）
→ **spawn**（跑 python3 命令，stdin/stdout 传数据）

### 七、worker_threads 的实战坑

#### 1. 启动开销

worker_threads 启动需要 ~50-100ms，**不适合超短任务**：

\`\`\`javascript
// ❌ 每次请求都 new Worker，启动开销远大于计算
app.get('/compute', (req, res) => {  // 注册 GET 路由处理
  const worker = new Worker('./compute.js', { workerData: req.body });  // 创建实例 worker
  // 启动 100ms + 计算 10ms = 110ms，纯计算本应 10ms
});

// ✅ 用 worker pool 复用
const pool = new WorkerPool('./compute.js', 4);  // 创建实例 pool
app.get('/compute', async (req, res) => {  // 注册 GET 路由处理
  const result = await pool.run(req.body);  // 定义常量 result
  res.json(result);  // 发送 JSON 响应
});
\`\`\

可以用 \`piscina\` 包实现成熟的 worker pool。

#### 2. worker 内的 require 限制

worker 线程**不能 require**：\`cluster\`、\`child_process\`、\`worker_threads\`（防止嵌套）。但可以 require 其他内置模块和 npm 包。

#### 3. 错误传播

worker 抛出的未捕获错误不会自动传到主线程，必须监听 \`error\` 事件：

\`\`\`javascript
worker.on('error', (err) => {
  console.error('worker 错误:', err);
  // 这里要决定：重启 worker？返回 500？
});
\`\`\

### 八、生产环境的多核方案

对绝大多数 HTTP 服务，**PM2 cluster 模式**最省心：

\`\`\`bash
# PM2 自动按 CPU 核心数 fork
pm2 start server.js -i max

# 指定数量
pm2 start server.js -i 4

# 零停机重启
pm2 reload all
\`\`\

PM2 的优势：自动重启、日志切割、零停机 reload、监控面板。

### 九、总结决策树

\`\`\`
需要并发？
├─ HTTP 服务多核 → cluster / PM2
├─ CPU 密集任务 → worker_threads（短任务用 pool）
├─ 调用外部程序 → spawn/execFile
├─ 独立 Node 脚本 → fork
└─ 跨语言调用 → spawn + stdin/stdout
\`\`\``,
    code: `// ============================================================
// 进程模型选型演示（沙箱兼容版）
// ------------------------------------------------------------
// 注：沙箱未开放 child_process / worker_threads / cluster 模块。
// 本章用"概念演示 + 模拟实现"方式呈现核心 API 行为，
// 生产环境请用真实模块（代码见 content 字段）。
// ============================================================

const os = require("os");  // 导入模块 os；require 返回 module.exports

console.log("===== 1. 进程信息 =====");  // 打印日志到 stdout
console.log("  主进程 PID:", process.pid);  // 打印日志到 stdout
console.log("  CPU 核心数:", os.availableParallelism?.() || os.cpus().length);  // 打印日志到 stdout
console.log("  平台:", process.platform, "/", process.arch);  // 打印日志到 stdout

// ---- 2. 模拟 child_process：execSync 概念演示 ----
console.log("\\n===== 2. child_process 概念（沙箱模拟）=====");  // 打印日志到 stdout
// 沙箱不能 spawn 真实子进程，这里模拟 execSync 的语义
function mockExecSync(cmd) {  // 声明函数 mockExecSync
  // 真实环境: require('child_process').execSync(cmd).toString()
  if (cmd.startsWith("echo ")) return cmd.slice(5);  // 条件判断
  if (cmd === "node --version") return process.version;  // 条件判断
  return "[mock output for: " + cmd + "]";  // 返回值
}
console.log("  execSync(\\"echo 'hello'\\"):", mockExecSync("echo 'hello'"));  // 打印日志到 stdout
console.log("  execSync('node --version'):", mockExecSync("node --version"));  // 打印日志到 stdout
console.log("  说明: spawn=流式 / exec=shell / execFile=无 shell / fork=Node+IPC");  // 打印日志到 stdout

// ---- 3. 模拟 worker_threads：CPU 密集任务 ----
console.log("\\n===== 3. worker_threads 概念（沙箱用 setImmediate 模拟）=====");  // 打印日志到 stdout
// 模拟 worker 的核心: 把 CPU 密集任务放到独立上下文执行
function createMockWorker(task) {  // 声明函数 createMockWorker
  // 真实环境: new Worker(code, { eval: true, workerData })
  // 沙箱模拟: 用 setImmediate 把任务放到下一个事件循环，不阻塞主线程
  const listeners = { message: [], error: [], exit: [] };  // 定义对象 listeners
  setImmediate(() => {  // 在 check 阶段执行回调
    try {  // 开启 try 块捕获异常
      const result = task();  // 定义常量 result
      listeners.message.forEach((fn) => fn(result));
      listeners.exit.forEach((fn) => fn(0));
    } catch (err) {
      listeners.error.forEach((fn) => fn(err));
      listeners.exit.forEach((fn) => fn(1));
    }
  });
  return {  // 返回值
    on(event, cb) { listeners[event] && listeners[event].push(cb); },
  };
}

function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }  // 声明函数 fib
const worker = createMockWorker(() => ({ input: 30, result: fib(30) }));  // 定义常量 worker
console.log("  主线程: 已派发 fib(30) 到 mock worker...");  // 打印日志到 stdout
worker.on("message", (msg) => {  // 监听工作线程消息
  console.log("  worker 返回: fib(" + msg.input + ") =", msg.result);  // 打印日志到 stdout
});
worker.on("exit", (code) => console.log("  worker 退出，码:", code));  // 监听工作线程消息

// ---- 4. cluster 概念演示（不实际监听端口）----
console.log("\\n===== 4. cluster 模式概念 =====");  // 打印日志到 stdout
// 沙箱无 cluster 模块，这里演示其设计模式
const cpuCount = os.availableParallelism?.() || os.cpus().length;  // 定义常量 cpuCount
console.log("  cluster.isPrimary: true (模拟)");  // 打印日志到 stdout
console.log("  可 fork worker 数:", cpuCount);  // 打印日志到 stdout
console.log("  生产用法: PM2 start server.js -i " + cpuCount);  // 打印日志到 stdout
console.log("  优势: 多进程共享端口，主进程做负载均衡");  // 打印日志到 stdout
console.log("  调度: SCHED_RR (轮询，Node 16+ 默认)");  // 打印日志到 stdout

// ---- 5. fork + IPC 通信概念 ----
console.log("\\n===== 5. fork + IPC 通信概念 =====");  // 打印日志到 stdout
// 模拟 fork 的 IPC 通信
const mockChild = {  // 定义对象 mockChild
  _handlers: { message: [], exit: [] },
  on(event, cb) { this._handlers[event].push(cb); },
  send(msg) {
    // 模拟子进程收到消息后返回
    setImmediate(() => {  // 在 check 阶段执行回调
      this._handlers.message.forEach((fn) => fn({ pong: msg }));
      this._handlers.exit.forEach((fn) => fn(0));
    });
  },
};
mockChild.on("message", (msg) => {
  console.log("  收到子进程 pong:", msg.pong);  // 打印日志到 stdout
});
mockChild.on("exit", () => console.log("  子进程已退出"));
console.log("  发送 ping 给子进程...");  // 打印日志到 stdout
mockChild.send("ping");

// ---- 6. SharedArrayBuffer 零拷贝概念 ----
console.log("\\n===== 6. SharedArrayBuffer 概念 =====");  // 打印日志到 stdout
// SharedArrayBuffer 在沙箱中可用（V8 全局对象）
const sab = new SharedArrayBuffer(4);  // 创建实例 sab
const view = new Int32Array(sab);  // 创建实例 view
view[0] = 0;
// 模拟多线程原子操作
for (let i = 0; i < 1000; i++) {  // for 循环
  Atomics.add(view, 0, 1);
}
console.log("  SharedArrayBuffer + Atomics.add 1000 次:", view[0]);  // 打印日志到 stdout
console.log("  说明: worker_threads 可共享此内存，零拷贝传递");  // 打印日志到 stdout

console.log("\\n  → 进程模型演示已派发，等待异步回调...\\n");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第五章：Node.js 内部机制
  // =========================================================
  {
    id: "node-internals",
    group: "进阶干货",
    icon: "🔧",
    title: "Node.js 内部机制",
    content: `## Node.js 内部机制

本章讲 Node.js 几个天天用却很少深究的内部机制：模块解析算法、require.cache、循环依赖、module 对象。理解这些能解释很多"诡异"行为。

### 一、CommonJS 模块解析算法

当你 \`require('foo')\` 时，Node.js 按以下顺序查找：

**1. 核心模块**：\`fs\`、\`path\`、\`http\` 等内置模块，优先级最高
\`\`\`javascript
require('fs');     // 直接用核心模块
require('./fs');   // 不会用核心模块，会找当前目录的 fs.js
\`\`\`

**2. 文件路径**：以 \`/\`、\`./\`、\`../\` 开头
\`\`\`javascript
require('./utils');     // 尝试 utils.js, utils.json, utils/index.js, utils.node
require('/abs/path');  // 绝对路径
\`\`\`

**3. node_modules 目录**：从当前目录往上找
\`\`\`
require('lodash');
// 查找顺序：
// ./node_modules/lodash
// ../node_modules/lodash
// ../../node_modules/lodash
// 直到根目录
\`\`\`

**4. 目录作为模块**：如果找到的是目录
- 看 \`package.json\` 的 \`main\` 字段
- 找不到则用 \`index.js\`

**扩展名补全**：\`require('./foo')\` 会依次尝试 \`.js\`、\`.json\`、\`.node\`，可在 \`require.extensions\` 自定义（不推荐）。

### 二、require.cache：模块只执行一次

每个 require 的模块会被**缓存**，再次 require 直接返回缓存：

\`\`\`javascript
// counter.js
let count = 0;
module.exports = {
  incr: () => ++count,
  get: () => count,
};

// main.js
const c1 = require('./counter');
c1.incr(); c1.incr(); // count = 2
const c2 = require('./counter'); // 同一个实例！
console.log(c2.get()); // 2，不是 0
\`\`\`

**清除缓存**：

\`\`\`javascript
delete require.cache[require.resolve('./counter')];  // 清除模块缓存（实现热更新）
const fresh = require('./counter'); // 重新执行模块
console.log(fresh.get()); // 0
\`\`\`

**实战用途**：热重载（开发时）、单测隔离（每个测试用全新模块）。

### 三、module 对象的内部字段

\`\`\`javascript
// 在任何模块里打印 module
console.log(module);
// {
//   id: '.',                    // 模块标识
//   path: '/abs/path',          // 目录
//   exports: {},                // 导出对象
//   filename: '/abs/path/x.js', // 完整路径
//   loaded: false,              // 是否加载完成
//   children: [...],            // require 过的子模块
//   paths: [                    // node_modules 查找路径
//     '/abs/path/node_modules',
//     '/abs/node_modules',
//     '/node_modules'
//   ]
// }
\`\`\`

**关键点**：
- \`module.children\` 可以看到依赖树，排查循环依赖有用
- \`module.paths\` 是 node_modules 查找路径，可以手动改（不推荐）
- \`module.loaded\` 在模块完全加载后变 \`true\`

### 四、循环依赖：Node.js 怎么处理

A require B，B 又 require A，会怎样？

\`\`\`javascript
// a.js
console.log('a 开始');  // 打印日志到 stdout
const b = require('./b');  // 导入模块 ./b；require 返回 module.exports
console.log('a 拿到 b:', b);  // 打印日志到 stdout
module.exports = { fromA: 'A 的导出' };  // 设置模块导出对象（require 返回的就是它）

// b.js
console.log('b 开始');  // 打印日志到 stdout
const a = require('./a');  // 导入模块 ./a；require 返回 module.exports
console.log('b 拿到 a:', a); // ⚠️ 此时是 {}
module.exports = { fromB: 'B 的导出' };  // 设置模块导出对象（require 返回的就是它）

// 执行 require('./a')
// 输出：
// a 开始
// b 开始
// b 拿到 a: {}        ← 关键！a 还没执行完，exports 是空对象
// a 拿到 b: { fromB: 'B 的导出' }
\`\`\`

**Node.js 的处理方式**：当检测到循环，返回**当前已完成的 exports**（可能是空对象）。

**为什么是空对象**：\`module.exports\` 在模块开始执行时是 \`{}\`，A 在 \`require('./b')\` 之前没设置 \`module.exports\`，所以 B 拿到的是空对象。

**避免循环依赖的方法**：
1. **重构**：把共享逻辑提到第三个模块
2. **延迟 require**：在函数内部 require（运行时才加载）
3. **事件解耦**：用 EventEmitter 代替直接依赖

### 五、exports vs module.exports

\`\`\`javascript
// ❌ 错误：这样改 exports 不会生效
exports = { foo: 1 };
// 因为 exports 只是 module.exports 的引用，重新赋值断开了引用

// ✅ 正确：改 module.exports
module.exports = { foo: 1 };

// ✅ 正确：往 exports 上加属性
exports.foo = 1; // 等价于 module.exports.foo = 1
\`\`\`

**记住**：\`require\` 返回的永远是 \`module.exports\`，不是 \`exports\`。

### 六、ESM 与 CJS 的差异

**1. 加载时机**
- CJS：**运行时**加载，\`require\` 是同步函数
- ESM：**编译时**确定依赖关系（静态结构），\`import\` 必须在顶层

**2. 导出方式**
- CJS：\`module.exports = obj\`，可以整体替换
- ESM：\`export\` 是绑定，不能整体替换

\`\`\`javascript
// ESM：导出的是绑定，不是快照
// counter.mjs
export let count = 0;  // 命名导出 count
export function incr() { count++; }  // 命名导出 incr

// main.mjs
import { count, incr } from './counter.mjs';  // 从 ./counter.mjs 导入：{ count, incr }
console.log(count); // 0
incr();
console.log(count); // 1 ← ESM 的导出是活的绑定
\`\`\`

**3. 互操作**
- ESM 里 \`import\` CJS：\`import pkg from 'cjs-module'\`（默认导入拿到 module.exports）
- CJS 里 \`require\` ESM：需要 \`async\` + \`import()\` 动态导入

### 七、require 的内部实现（简化版）

\`\`\`javascript
function myRequire(modulePath) {
  // 1. 解析为绝对路径
  const filename = Module._resolveFilename(modulePath, this);
  
  // 2. 查缓存
  if (Module._cache[filename]) {
    return Module._cache[filename].exports;
  }
  
  // 3. 创建模块实例
  const module = new Module(filename, this);
  Module._cache[filename] = module;
  
  // 4. 加载（执行模块代码）
  module.load(filename);
  
  // 5. 返回 exports
  return module.exports;
}
\`\`\`

**关键点**：模块在**执行前**就加入缓存，这是处理循环依赖的核心——B 再次 require A 时，A 已在缓存（虽然 exports 还空）。

### 八、实战：热重载实现

\`\`\`javascript
function hotRequire(modulePath) {  // 声明函数 hotRequire
  const fullPath = require.resolve(modulePath);  // 定义常量 fullPath
  delete require.cache[fullPath];  // 清除模块缓存（实现热更新）
  // 同时删除子模块缓存
  Object.keys(require.cache)  // 获取对象所有键组成的数组
    .filter(k => k.startsWith(require('path').dirname(fullPath)))
    .forEach(k => delete require.cache[k]);
  return require(modulePath);  // 返回值
}

// 开发时热重载配置
const config = hotRequire('./config'); // 每次 require 都重新读
\`\`\`

### 九、诊断循环依赖

\`\`\`javascript
// 打印 require 栈
const origRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  const stack = this.children?.map(c => c.id) || [];
  if (stack.includes(id)) {
    console.warn('循环依赖:', id, '←', stack.join(' ← '));
  }
  return origRequire.apply(this, arguments);
};
\`\`\`

### 十、总结：内部机制的核心心法

1. require 缓存：模块只执行一次，靠缓存实现单例
2. 循环依赖返回"未完成的 exports"，靠设计避免
3. \`module.exports\` 才是真正的导出，\`exports\` 只是引用
4. ESM 是静态绑定，CJS 是动态值
5. \`require.cache\` 可清除，用于热重载和测试隔离
6. 模块在执行前就入缓存，这是循环依赖不死锁的关键`,
    code: `// ============================================================
// Node.js 内部机制演示（沙箱兼容版）
// ------------------------------------------------------------
// 注：沙箱的 require 不提供 .resolve / .cache / .extensions 属性。
// 本章用说明性文字 + 模拟数据演示这些概念。
// 生产环境可用真实 require.resolve / require.cache（见 content）。
// ============================================================

console.log("===== 1. require.cache 缓存机制 =====");
// 同一个 require 多次，返回同一实例
const path1 = require("path");
const path2 = require("path");
console.log("  require('path') 两次是否相同:", path1 === path2);
// 注：沙箱 require 无 .resolve，真实环境用 require.resolve("path") 获取缓存键
console.log("  缓存键（真实环境）: require.resolve('path') 返回模块完整路径");
console.log("  原理: require.cache[完整路径] = module.exports");

// ---- 2. module 对象内部字段 ----
console.log("\\n===== 2. module 对象关键字段 =====");
console.log("  module.id:", module.id);
console.log("  module.loaded:", module.loaded);
console.log("  module.children:", module.children ? module.children.length + " 个" : "(沙箱未提供)");
console.log("  module.paths:", module.paths ? module.paths[0] : "(沙箱未提供)");

// ---- 3. require.resolve 查找路径 ----
console.log("\\n===== 3. require.resolve 解析路径 =====");
// 注：沙箱 require 无 .resolve 方法
console.log("  require.resolve('fs')   → 'fs' (核心模块，直接返回模块名)");
console.log("  require.resolve('path')  → 'path' (核心模块)");
console.log("  require.resolve('./foo') → /abs/path/to/foo.js (文件模块，返回绝对路径)");
console.log("  查找顺序: 核心模块 → 文件路径 → node_modules 向上查找");

// ---- 4. 缓存机制说明 ----
console.log("\\n===== 4. 缓存：模块只执行一次 =====");
console.log("  原理: 首次 require 执行模块代码并缓存 exports");
console.log("  后续 require 直接返回缓存，不再执行模块代码");
console.log("  真实环境: Object.keys(require.cache) 查看已缓存模块");
console.log("  热重载: delete require.cache[require.resolve(modPath)] 后重新 require");

// ---- 5. exports vs module.exports ----
console.log("\\n===== 5. exports 引用关系 =====");
console.log("  exports === module.exports:", exports === module.exports);
// 注意：重新赋值 exports 会断开引用
// exports = { foo: 1 };  // ❌ 这样不会生效
module.exports.newProp = "通过 module.exports 添加";
console.log("  添加后 exports.newProp:", exports.newProp);

// ---- 6. 循环依赖演示（简化版）----
console.log("\\n===== 6. 循环依赖行为说明 =====");
console.log("  Node.js 处理循环依赖：返回当前已完成的 exports");
console.log("  A require B, B require A → B 拿到的 A 是不完整的");
console.log("  缓存机制让循环不会无限递归");
console.log("  模块在执行前就入缓存，这是循环依赖不死锁的关键");

// ---- 7. require.extensions（不推荐使用，仅展示）----
console.log("\\n===== 7. require.extensions 支持的扩展名 =====");
console.log("  真实环境支持: [ '.js', '.json', '.node' ]");
console.log("  说明: require.extensions 已废弃，仅用于查看");

// ---- 8. 模拟热重载概念 ----
console.log("\\n===== 8. 热重载概念 =====");
console.log("  原理: delete require.cache[require.resolve(modPath)]");
console.log("  然后重新 require，模块会重新执行");
console.log("  用途: 开发热重载、单测隔离、配置刷新");

console.log("\\n  → 内部机制演示完成\\n");`,
  },

  // =========================================================
  // 第六章：性能诊断工具链
  // =========================================================
  {
    id: "node-perf-diagnosis",
    group: "进阶干货",
    icon: "📊",
    title: "性能诊断工具链",
    content: `## 性能诊断工具链

Node.js 性能问题排查需要工具链配合。本章讲**实战中最常用**的诊断手段：CPU profile、火焰图、堆快照、事件循环监测、慢函数定位。

### 一、--inspect 与 Chrome DevTools

启动带调试端口的 Node：

\`\`\`bash
node --inspect server.js        # 监听 9229
node --inspect=0.0.0.0:9229 server.js  # 允许远程连接
node --inspect-brk server.js    # 第一行就断点
\`\`\

然后打开 Chrome → \`chrome://inspect\` → 配置目标 → 连接。

**DevTools 的 Memory 面板**：
- Heap snapshot：抓堆快照，对比找泄漏
- Allocation timeline：实时看分配
- Allocation sampling：按函数统计分配

**Performance 面板**：
- Record CPU profile：录制 CPU 调用栈
- 火焰图：看哪个函数耗时最多

### 二、代码内抓取 CPU Profile

不重启服务、用代码触发 profile：

\`\`\`javascript
const { Session } = require('inspector');
const fs = require('fs');

async function captureCPUProfile(durationMs, outputFile) {
  const session = new Session();
  session.connect();
  
  await new Promise((res) => session.post('Profiler.enable', res));
  await new Promise((res) => session.post('Profiler.start', res));
  
  console.log(\`采集 \${durationMs}ms...\`);
  await new Promise(r => setTimeout(r, durationMs));
  
  const { profile } = await new Promise((res, rej) => 
    session.post('Profiler.stop', (err, data) => err ? rej(err) : res(data))
  );
  
  fs.writeFileSync(outputFile, JSON.stringify(profile));
  console.log('已保存:', outputFile);
  session.disconnect();
}

// 慢请求时自动抓
app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (Date.now() - start > 1000) {
      captureCPUProfile(5000, \`slow-\${Date.now()}.cpuprofile\`);
    }
  });
  next();
});
\`\`\

生成的 \`.cpuprofile\` 文件可直接拖到 Chrome DevTools 的 Performance 面板查看。

### 三、堆快照抓取（代码触发）

\`\`\`javascript
const v8 = require('v8');  // 导入模块 v8；require 返回 module.exports

// 信号触发抓取
process.on('SIGUSR2', () => {  // 注册进程级事件监听
  const file = \`heap-\${Date.now()}.heapsnapshot\`;  // 定义常量 file
  v8.writeHeapSnapshot(file);
  console.log('堆快照:', file);  // 打印日志到 stdout
});

// 内存超阈值自动抓
setInterval(() => {  // 周期回调
  const used = process.memoryUsage().heapUsed / 1024 / 1024;  // 定义常量 used
  if (used > 800) {  // 条件判断
    v8.writeHeapSnapshot(\`auto-\${Date.now()}.heapsnapshot\`);
    process.exit(1); // 抓完重启，避免继续恶化
  }
}, 30000);
\`\`\

**分析堆快照**：
1. 拖到 Chrome DevTools Memory 面板
2. 切到 "Comparison" 模式，对比两个快照
3. 按 "Delta" 排序，找增量最大的对象类型
4. 点开看 retaining tree（谁持有它）

### 四、性能钩子：performance_hooks

Node 内置 \`perf_hooks\` 模块，做精细化测量：

\`\`\`javascript
const { performance, PerformanceObserver } = require('perf_hooks');

// 测量代码块耗时
const timer = performance.timerify(function heavyFunc(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.sqrt(i);
  return sum;
});

const obs = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach(e => {
    console.log(\`\${e.name}: \${e.duration.toFixed(2)}ms\`);
  });
});
obs.observe({ entryTypes: ['function'] });

heavyFunc(1e6);
\`\`\

**测量 async 函数**：

\`\`\`javascript
async function measureAsync(fn, label) {  // 声明异步函数，内部可用 await
  const start = performance.now();  // 定义常量 start
  const result = await fn();  // 定义常量 result
  console.log(\`\${label}: \${(performance.now() - start).toFixed(2)}ms\`);  // 打印日志到 stdout
  return result;  // 返回值
}
\`\`\

### 五、process.hrtime.bigint 高精度计时

\`Date.now()\` 精度毫秒级，\`performance.now()\` 微秒级，\`hrtime.bigint()\` 纳秒级：

\`\`\`javascript
const start = process.hrtime.bigint();
// ... 执行代码
const end = process.hrtime.bigint();
const ns = end - start;
console.log(\`耗时: \${ns}ns = \${Number(ns) / 1e6}ms\`);
\`\`\

### 六、事件循环延迟监测

\`\`\`javascript
const { monitorEventLoopDelay } = require('perf_hooks');  // 导入模块 perf_hooks；require 返回 module.exports

const h = monitorEventLoopDelay();  // 定义常量 h
h.enable();

setInterval(() => {  // 周期回调
  console.log({  // 打印日志到 stdout
    min: h.min.toFixed(2) + 'ms',
    max: h.max.toFixed(2) + 'ms',
    mean: h.mean.toFixed(2) + 'ms',
    p99: h.percentile(99).toFixed(2) + 'ms',
  });
  h.reset();
}, 5000);
\`\`\

**判断标准**：
- p99 < 10ms：健康
- p99 10-100ms：需关注
- p99 > 100ms：有阻塞，需排查

### 七、 clinic.js 诊断套件

\`\`\`bash
# 安装
npm install -g clinic

# 三大工具：
clinic doctor   -- node server.js    # 综合诊断（推荐先跑）
clinic flame    -- node server.js    # 火焰图
clinic bubbleprof -- node server.js  # 异步分析
\`\`\

**doctor** 会给出建议：是 I/O 问题、CPU 问题还是事件循环阻塞，并推荐下一步用哪个工具深挖。

### 八、0x 火焰图

专门做 V8 CPU 火焰图：

\`\`\`bash
npx 0x server.js  # 临时执行本地未安装的包
# 生成 flamegraph.html，浏览器打开
\`\`\

**火焰图读法**：
- 横轴：调用栈宽度（越宽越耗时）
- 纵轴：调用深度
- 找最宽的"平顶"，那是热点函数

### 九、内置诊断标志

\`\`\`bash
# 打印所有警告（如 MaxListeners、Promise 未处理）
node --trace-warnings server.js

# 跟踪 GC
node --trace-gc server.js

# 跟踪同步 I/O（找出阻塞调用）
node --trace-sync-io server.js

# 跟踪 promise rejection
node --unhandled-rejections=strict server.js

# 跟踪 deprecation 警告
node --trace-deprecation server.js
\`\`\

### 十、性能优化 Checklist

1. **基线测量**：先量化，再优化。用 \`performance.now()\` 或 clinic
2. **找热点**：CPU profile 找出耗时最多的函数
3. **减少同步**：\`--trace-sync-io\` 找出阻塞调用
4. **流式处理**：大文件用 Stream，别 \`readFileSync\`
5. **缓存**：重复计算的结果缓存起来（注意设上限）
6. **批处理**：N 次小操作合并成 1 次大操作
7. **并发**：I/O 密集用 \`Promise.all\`，CPU 密集用 worker_threads
8. **连接复用**：HTTP keep-alive、数据库连接池

### 十一、避免过早优化

> "Premature optimization is the root of all evil." — Donald Knuth

**反模式**：
- 没测量就改代码（你以为的热点可能不是热点）
- 微观优化（\`++i\` vs \`i++\`）而忽略算法复杂度
- 牺牲可读性换 1% 性能

**正确顺序**：
1. 写出正确的代码
2. 测量，找真正的瓶颈
3. 只优化瓶颈，验证收益
4. 保留测量，防止退化`,
    code: `// ============================================================
// 性能诊断工具链演示（沙箱兼容版）
// ------------------------------------------------------------
// 注：沙箱未开放 perf_hooks / v8 模块，未绑定 process.hrtime.bigint。
// 本章用全局 performance（沙箱已提供）+ 手动实现等价能力。
// 生产环境请用真实 perf_hooks / v8 模块（见 content）。
// ============================================================

// performance 是沙箱全局对象，无需 require
console.log("===== 1. performance.now 高精度计时 =====");
const start = performance.now();
let sum = 0;
for (let i = 0; i < 1e6; i++) sum += Math.sqrt(i);
const dur = performance.now() - start;
console.log("  循环 100 万次 sqrt 耗时:", dur.toFixed(3), "ms");

// ---- 2. 手动计时替代 hrtime.bigint -----
console.log("\\n===== 2. 高精度计时（performance.now 替代 hrtime.bigint）=====");
const t0 = performance.now();
for (let i = 0; i < 1000; i++) Math.sqrt(i);
const t1 = performance.now();
const ms = t1 - t0;
console.log("  1000 次 sqrt 耗时:", ms.toFixed(4), "ms");
console.log("  说明: 沙箱用 performance.now (微秒级)");
console.log("        生产用 process.hrtime.bigint() (纳秒级)");

// ---- 3. 手动 timerify：包装函数自动测量 ----
console.log("\\n===== 3. 手动实现 timerify（替代 performance.timerify）=====");
function computeHeavy(n) {
  let r = 0;
  for (let i = 0; i < n; i++) r += Math.sin(i) * Math.cos(i);
  return r;
}
// 真实环境用 performance.timerify(fn) + PerformanceObserver
// 沙箱用手动包装，效果等价
function manualTimerify(fn, name) {
  return function (...args) {
    const s = performance.now();
    const result = fn.apply(this, args);
    const d = performance.now() - s;
    console.log("  函数 [" + name + "] 耗时:", d.toFixed(3), "ms");
    return result;
  };
}
const timed = manualTimerify(computeHeavy, "computeHeavy");
timed(1e5);
timed(1e6);

// ---- 4. 事件循环延迟监测（手动实现）----
console.log("\\n===== 4. 事件循环延迟监测（手动实现，替代 monitorEventLoopDelay）=====");
const lags = [];
let lastTime = performance.now();
const samples = 10;
let count = 0;
const monitorTimer = setInterval(() => {
  const now = performance.now();
  const expected = 50;
  const lag = now - lastTime - expected;
  lags.push(lag);
  lastTime = now;
  count++;
  if (count >= samples) {
    clearInterval(monitorTimer);
    lags.sort((a, b) => a - b);
    const min = lags[0];
    const max = lags[lags.length - 1];
    const mean = lags.reduce((a, b) => a + b, 0) / lags.length;
    const p99 = lags[Math.floor(lags.length * 0.99)] || max;
    console.log("  事件循环延迟统计（" + samples + " 次采样，间隔 50ms）：");
    console.log("    最小:", min.toFixed(2), "ms");
    console.log("    最大:", max.toFixed(2), "ms");
    console.log("    平均:", mean.toFixed(2), "ms");
    console.log("    P99 :", p99.toFixed(2), "ms");
    console.log("  （P99 < 10ms 为健康）");
  }
}, 50);
monitorTimer.unref();

// ---- 5. 内存使用快照 ----
console.log("\\n===== 5. 当前内存使用 =====");
const m = process.memoryUsage();
console.log("  rss       :", (m.rss / 1024 / 1024).toFixed(1), "MB");
console.log("  heapUsed  :", (m.heapUsed / 1024 / 1024).toFixed(1), "MB");
console.log("  external  :", (m.external / 1024 / 1024).toFixed(1), "MB");

// ---- 6. V8 堆统计（用 process.memoryUsage 替代 v8.getHeapStatistics）----
console.log("\\n===== 6. 堆统计（process.memoryUsage 替代 v8.getHeapStatistics）=====");
const mu = process.memoryUsage();
console.log("  堆已用 :", (mu.heapUsed / 1024 / 1024).toFixed(1), "MB");
console.log("  堆总量 :", (mu.heapTotal / 1024 / 1024).toFixed(1), "MB");
console.log("  外部   :", (mu.external / 1024 / 1024).toFixed(1), "MB");
console.log("  说明: 生产用 require('v8').getHeapStatistics() 获取更详细字段");

// ---- 7. 提示外部工具 ----
console.log("\\n===== 7. 外部诊断工具提示 =====");
console.log("  Chrome DevTools: node --inspect → chrome://inspect");
console.log("  clinic doctor  : npx clinic doctor -- node server.js");
console.log("  0x 火焰图      : npx 0x server.js");
console.log("  GC 跟踪        : node --trace-gc server.js");
console.log("  同步 I/O 跟踪  : node --trace-sync-io server.js");

console.log("\\n  → 性能诊断工具已派发，等待事件循环采样完成...\\n");`,
  },

  // =========================================================
  // 第七章：全局错误处理体系
  // =========================================================
  {
    id: "node-global-errors",
    group: "进阶干货",
    icon: "🚨",
    title: "全局错误处理体系",
    content: `## 全局错误处理体系

未捕获的错误会让 Node 进程崩溃。本章讲如何构建**多层错误防线**：uncaughtException、unhandledRejection、domain（已弃用但概念有用）、退出码约定、优雅退出流程。

### 一、为什么必须有全局错误处理

Node.js 默认行为：
- **未捕获的同步异常** → 进程崩溃
- **未处理的 Promise rejection** → Node 15+ 默认崩溃（之前只警告）

**生产环境不能让进程裸奔**，必须挂全局处理器，至少做到：
1. 记录错误日志（带上下文）
2. 通知监控系统
3. 优雅退出（关闭连接、flush 日志）
4. 由守护进程（PM2/systemd）重启

### 二、uncaughtException：最后一道防线

\`\`\`javascript
process.on('uncaughtException', (err, origin) => {  // 注册进程级事件监听
  // ⚠️ 这是最后机会，进程即将退出
  console.error('未捕获异常:', err.stack);  // 打印错误到 stderr
  console.error('来源:', origin); // 'uncaughtException' 或 'unhandledRejection'
  
  // 1. 记录到日志系统
  logger.fatal({ err, origin }, 'uncaughtException');
  
  // 2. 通知告警
  alertOps('服务崩溃', err.message);
  
  // 3. 优雅退出（不要继续服务，状态可能已损坏）
  gracefulShutdown().then(() => process.exit(1));
});

function gracefulShutdown() {  // 声明函数 gracefulShutdown
  return Promise.all([  // 返回值
    server.close(),         // 停止接受新连接
    db.disconnect(),        // 关闭数据库
    flushLogs(),            // 刷日志
  ]);
}
\`\`\

**关键原则**：
- ❌ **不要**在 uncaughtException 后继续运行——状态可能已损坏
- ✅ 记录日志 → 优雅退出 → 让 PM2 重启

### 三、unhandledRejection：Promise 漏网之鱼

\`\`\`javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise rejection:', reason);
  logger.error({ reason }, 'unhandledRejection');
  
  // 推荐做法：和 uncaughtException 一样退出
  // 因为未处理的 rejection 说明有 bug，继续运行可能产生更多错误
});
\`\`\

**Node 15+ 的行为变化**：
- Node 15 之前：只打印警告
- Node 15+：默认退出（\`--unhandled-rejections=throw\`）
- 可配置：\`--unhandled-rejections=warn|throw|none|strict\`

**生产推荐**：\`--unhandled-rejections=throw\`（默认），让所有 rejection 都被 uncaughtException 捕获，统一处理。

### 四、rejectionhandled：迟到的处理

有时候 rejection 后又被 catch 了：

\`\`\`javascript
const p = Promise.reject(new Error('oops'));  // 定义常量 p
// 此时触发 unhandledRejection

setTimeout(() => {  // 延时回调（宏任务，timers 阶段执行）
  p.catch(() => console.log('later caught'));
  // 触发 rejectionhandled
}, 100);

process.on('rejectionhandled', (promise) => {  // 注册进程级事件监听
  console.log('rejection 后来被处理了');  // 打印日志到 stdout
});
\`\`\

**意义**：如果你的 unhandledRejection 处理器会发告警，rejectionhandled 让你撤回告警。

### 五、warning：捕获 Node 内置警告

\`\`\`javascript
process.on('warning', (warning) => {
  console.warn('Node 警告:', warning.name);
  console.warn('  消息:', warning.message);
  console.warn('  代码:', warning.code);
  console.warn('  栈:', warning.stack);
});

// 触发一个警告：MaxListenersExceededWarning
const e = new (require('events'))();
for (let i = 0; i < 15; i++) e.on('x', () => {});
\`\`\

**常见警告**：
- \`MaxListenersExceededWarning\`：监听器泄漏
- \`DeprecationWarning\`：用了废弃 API
- \`ExperimentalWarning\`：用了实验性 API
- \`PromiseResolutionWarning\`：Promise 解析异常

**生产必做**：\`node --trace-warnings server.js\`，会打印触发警告的调用栈。

### 六、退出码约定

\`\`\`javascript
process.exitCode = 1; // 设置退出码，不立即退出（推荐）

// vs
process.exit(1); // 立即退出（不推荐，会跳过未完成的异步任务）
\`\`\

**常见退出码约定**：
- \`0\`：正常退出
- \`1\`：未捕获的致命错误
- \`2\`：参数错误
- \`3\`：初始化失败（如配置错误）
- \`130\`：SIGINT (Ctrl+C)
- \`143\`：SIGTERM

**推荐用 \`exitCode\`**：让事件循环跑完未完成的任务，自然退出。

### 七、信号处理：优雅退出

\`\`\`javascript
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(\`收到 \${signal}，开始优雅退出...\`);
  
  // 1. 停止接受新请求
  server.close();
  
  // 2. 给在途请求一个超时
  setTimeout(() => {
    console.log('超时，强制退出');
    process.exit(1);
  }, 30000).unref();
  
  // 3. 等待在途请求完成
  await drainRequests();
  
  // 4. 关闭资源
  await db.disconnect();
  await redis.quit();
  await flushLogs();
  
  console.log('优雅退出完成');
  process.exit(0);
}

['SIGTERM', 'SIGINT'].forEach(sig => {
  process.on(sig, () => gracefulShutdown(sig));
});
\`\`\

**关键点**：
- 设 \`isShuttingDown\` 标志，健康检查返回 503，让 LB 不再转发新请求
- \`server.close()\` 只停止接受新连接，已建立的连接继续处理
- 设超时强制退出，避免卡死
- \`setTimeout(...).unref()\` 让超时定时器不阻止退出

### 八、try/catch 抓不到的：异步错误

\`\`\`javascript
// ❌ try/catch 抓不到 setTimeout 里的错误
try {  // 开启 try 块捕获异常
  setTimeout(() => {  // 延时回调（宏任务，timers 阶段执行）
    throw new Error('boom'); // 这个错误会到 uncaughtException
  }, 100);
} catch (e) {
  console.log('抓不到');  // 打印日志到 stdout
}

// ❌ Promise 错误如果没 catch，会到 unhandledRejection
Promise.reject('oops');  // 返回一个已失败的 Promise
\`\`\

**正确做法**：
- async/await 内部错误会被 try/catch 抓到
- callback 用 error-first 约定
- Promise 链必须有 \`.catch()\` 或 await + try/catch

### 九、错误分类与处理策略

\`\`\`javascript
class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(\`\${resource} 不存在\`, 'NOT_FOUND', 404);
  }
}

// 统一错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }
  // 未知错误：记录详情，对外返回模糊信息
  logger.error({ err, req }, '未处理错误');
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: '服务器内部错误',
  });
});
\`\`\

**分类策略**：
- 可预期错误（验证失败、资源不存在）→ 4xx，详细信息
- 不可预期错误（数据库挂、代码 bug）→ 5xx，模糊信息 + 详细日志

### 十、生产 Checklist

1. ✅ 挂 \`uncaughtException\` 处理器，记录后优雅退出
2. ✅ 挂 \`unhandledRejection\` 处理器
3. ✅ 挂 \`SIGTERM\` / \`SIGINT\` 信号处理器
4. ✅ 设 \`isShuttingDown\` 标志，健康检查返回 503
5. ✅ \`server.close()\` 后给超时强制退出
6. ✅ 用 \`exitCode\` 而不是 \`exit()\`
7. ✅ 用 \`--trace-warnings\` 启动，捕获警告
8. ✅ 用 \`--unhandled-rejections=throw\` 统一错误处理
9. ✅ 全局错误处理器必发告警
10. ✅ 由 PM2/systemd 守护，崩溃后自动重启

### 十一、错误处理的层次

\`\`\`
请求级：try/catch + async/await + 错误中间件
   ↓ 漏网的
进程级：uncaughtException + unhandledRejection
   ↓ 漏网的（不该有）
系统级：PM2/systemd 自动重启
   ↓ 漏网的（更不该有）
监控级：健康检查失败 → LB 摘除 → 告警
\`\`\`

**目标**：每一层都尽量捕获，但假设上一层会漏网，做好兜底。`,
    code: `// ============================================================
// 全局错误处理体系演示
// ============================================================

console.log("===== 1. 挂载全局错误处理器 =====");

// uncaughtException：同步未捕获异常
process.on("uncaughtException", (err, origin) => {
  console.log("  [uncaughtException] 捕获:", err.message);
  console.log("  来源:", origin);
  console.log("  生产做法: 记录日志 → 优雅退出 → PM2 重启");
  // 这里不退出，便于演示。生产应退出
});

// unhandledRejection：未处理的 Promise rejection
process.on("unhandledRejection", (reason, promise) => {
  console.log("  [unhandledRejection] 捕获:", reason?.message || reason);
});

// warning：Node 内置警告
process.on("warning", (warning) => {
  console.log("  [warning]", warning.name, ":", warning.message);
});

// SIGTERM/SIGINT 演示（不真的退出）
process.on("SIGTERM", () => {
  console.log("  [SIGTERM] 收到终止信号，模拟优雅退出");
});

console.log("  已挂载 uncaughtException / unhandledRejection / warning / SIGTERM");

// ---- 2. 触发各类错误（演示捕获效果）----
console.log("\\n===== 2. 触发未捕获同步异常 =====");
setTimeout(() => {
  throw new Error("演示用同步异常");
}, 100);

console.log("\\n===== 3. 触发未处理 Promise rejection =====");
setTimeout(() => {
  Promise.reject(new Error("演示用 rejection"));
}, 200);

// ---- 4. 触发 Node 警告 ----
console.log("\\n===== 4. 触发 MaxListeners 警告 =====");
setTimeout(() => {
  const e = new (require("events"))();
  // 默认 max=10，加 12 个会触发警告
  for (let i = 0; i < 12; i++) e.on("data", () => {});
}, 300);

// ---- 5. 错误分类演示 ----
console.log("\\n===== 5. 错误分类（AppError 体系）=====");
class AppError extends Error {
  constructor(msg, code, status) {
    super(msg);
    this.code = code;
    this.statusCode = status;
  }
}
class ValidationError extends AppError {
  constructor(msg) {
    super(msg, "VALIDATION_ERROR", 400);
  }
}
class NotFoundError extends AppError {
  constructor(res) {
    super(res + " 不存在", "NOT_FOUND", 404);
  }
}

const errs = [new ValidationError("邮箱格式错误"), new NotFoundError("用户")];
errs.forEach((e) => {
  console.log("  [" + e.code + "] " + e.statusCode + " - " + e.message);
});

// ---- 6. exitCode vs exit() ----
console.log("\\n===== 6. exitCode vs process.exit() =====");
console.log("  process.exit(1)   : 立即退出，跳过未完成异步任务（不推荐）");
console.log("  process.exitCode=1: 设置退出码，让事件循环自然结束（推荐）");

// ---- 7. 异步错误的边界 ----
console.log("\\n===== 7. 异步错误边界说明 =====");
console.log("  try/catch 能抓: async/await 内的 throw");
console.log("  try/catch 抓不到: setTimeout / setInterval 里的 throw");
console.log("  Promise 错误: 必须 .catch() 或 await + try/catch");

// 确保进程不立即退出（演示完）
setTimeout(() => {
  console.log("\\n  → 错误处理演示完成（注意上面的捕获日志）\\n");
}, 500);`,
  },
];
