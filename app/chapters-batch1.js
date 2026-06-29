// =============================================================
// Node.js 交互式教程 —— 第一批章节（快速入门组，共 5 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Node.js 简介与环境搭建
  // =========================================================
  {
    id: "node-intro",
    icon: "📘",
    group: "快速入门",
    title: "Node.js 简介与环境搭建",
    content: `## Node.js 是什么？

Node.js 是一个**基于 Chrome V8 JavaScript 引擎**构建的开源、跨平台 JavaScript 运行时环境。它让 JavaScript 能够脱离浏览器，在服务器端运行。2009 年由 Ryan Dahl 创建，其核心思想是：**用事件驱动、非阻塞 I/O 模型构建高性能的网络应用**。

### V8 引擎 + libuv：Node.js 的双引擎架构

Node.js 的底层由两个核心组件驱动：

**V8 引擎**（Google 开发，C++ 编写）：
- 负责将 JavaScript 代码编译为机器码并执行
- 使用 JIT（即时编译）技术，性能远超传统解释器
- 提供垃圾回收（GC）、内存管理等运行时能力
- Google 持续投入优化，Node.js 可以免费"搭便车"

**libuv 库**（Ryan Dahl 为 Node.js 专门开发）：
- 跨平台的异步 I/O 库，封装了操作系统的底层差异
- 在 Linux 上使用 epoll，macOS 上使用 kqueue，Windows 上使用 IOCP
- 提供线程池（默认 4 个线程），处理无法异步的操作（如文件 I/O、DNS 查询、加密计算）
- 实现事件循环（Event Loop），是 Node.js 异步能力的核心引擎

### 事件驱动、非阻塞 I/O 的深层原理

这是理解 Node.js 的关键。传统服务器（如 Apache）为每个请求创建一个线程，当并发数上万时，线程上下文切换的性能开销会急剧增大。

Node.js 采用不同的策略：

1. **主线程（JavaScript 执行线程）是单线程的**——所有 JavaScript 代码在同一个线程中执行
2. **遇到 I/O 操作时，主线程不等待**——而是把任务交给 libuv 线程池或操作系统异步机制
3. **I/O 完成后，通过回调通知主线程**——事件循环在合适的时机取出回调并执行

\`\`\`
// 伪代码示例：Node.js 处理并发请求的方式
// 请求 1：读取文件 → 交给 libuv → 主线程继续处理其他请求
// 请求 2：查询数据库 → 交给 libuv → 主线程继续处理其他请求
// 请求 3：进行 HTTP 调用 → 交给操作系统 → 主线程继续处理其他请求
// ... 当任何一个 I/O 完成时，回调加入事件队列，等待主线程执行
\`\`\`

这意味着：**JavaScript 代码始终在单线程中执行，但 I/O 操作是真正并行的**。这就是 Node.js 能用少量资源处理大量并发连接的原因。

### 事件循环（Event Loop）的 6 个阶段

事件循环是 Node.js 异步能力的核心，分为 6 个主要阶段：

| 阶段 | 说明 | 典型任务 |
| --- | --- | --- |
| **timers** | 执行到期的定时器回调 | setTimeout、setInterval |
| **pending callbacks** | 执行延迟到下一轮的 I/O 回调 | TCP 错误回调 |
| **idle/prepare** | 内部使用 | libuv 内部处理 |
| **poll** | 获取新的 I/O 事件 | 文件读取、网络数据到达 |
| **check** | 执行 setImmediate 回调 | setImmediate 注册的回调 |
| **close callbacks** | 关闭事件回调 | socket 的 close 事件 |

每个阶段切换时，事件循环会先清空两个微任务队列：
- **nextTick 队列**（优先级最高）
- **Promise 微任务队列**

### 适用场景

✅ **非常适合的场景**：
- **API 服务 / RESTful 后端**：Netflix、PayPal、LinkedIn 都在用 Node.js 处理 API 请求
- **实时应用**：聊天系统、在线协作编辑、游戏服务器（WebSocket 长连接）
- **命令行工具**：Webpack、Babel、ESLint、TypeScript 编译器都是 Node.js 工具
- **服务端渲染（SSR）**：Next.js、Nuxt.js 等框架在服务端渲染 React/Vue 组件
- **微服务**：轻量、启动快，适合微服务架构
- **BFF（Backend for Frontend）**：前端团队用同一门语言写后端，聚合多个微服务 API

❌ **不太适合的场景**：
- **CPU 密集型任务**：图像处理、视频编码、科学计算——主线程会被阻塞，影响所有请求
- **高频交易系统**：对 GC 停顿极度敏感，需要 C++/Rust 级别的时间控制
- **大型单体应用**：类型系统不如 Java/C# 成熟，更适合拆分成小服务

### LTS 版本策略

Node.js 采用**双轨发版策略**：

| 版本类型 | 发布频率 | 支持周期 | 适用场景 |
| --- | --- | --- | --- |
| **Current** | 每 6 个月 | 最新特性 | 尝鲜和开发 |
| **LTS** | 每 2 年 | 30 个月 | 生产环境 |

**重要版本里程碑**：
- v14 (2020)：顶层 await 实验性支持、ESM 改进
- v16 (2021)：Apple Silicon 支持、Timers Promises API
- v18 (2022)：内置 fetch()、Test Runner、Web Streams API
- v20 (2023)：权限模型、稳定版 Test Runner、V8 11.3
- v22 (2024)：内置 WebSocket 客户端、V8 12.4、require() ESM 模块

**生产环境务必使用 LTS 版本**。

### 版本管理工具

#### nvm（Node Version Manager）—— 最推荐

\`\`\`bash
# 安装 nvm（macOS / Linux）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 安装最新 LTS
nvm install --lts

# 安装指定版本
nvm install 20.10.0

# 切换版本
nvm use 20

# 查看已安装版本
nvm ls

# 设置默认版本
nvm alias default 20
\`\`\`

#### volta —— 新一代工具，更快更安全

\`\`\`bash
# 安装 volta
curl https://get.volta.sh | bash

# 安装 Node.js
volta install node@20

# 项目级别锁定版本（写入 package.json）
volta pin node@20
\`\`\`

#### 安装验证

\`\`\`bash
node --version    # 查看 Node.js 版本
npm --version     # 查看 npm 版本
node -e "console.log('Hello, Node.js!')"  # 快速测试
\`\`\`

---

### 「底层原理」

#### V8 引擎如何执行 JavaScript 代码

V8 是 Google 为 Chrome 浏览器开发的高性能 JavaScript 引擎，Node.js 直接嵌入了 V8。V8 执行 JS 代码的过程分为几个关键阶段：

\`\`\`
源码
  │
  ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐
│  Parser     │───▶│  Ignition    │───▶│  TurboFan    │───▶│ 机器码    │
│ (解析器)    │    │ (解释器)     │    │ (JIT编译器)  │    │ (执行)    │
│ 生成AST     │    │ 生成字节码   │    │ 热点代码优化 │    │           │
└─────────────┘    └──────────────┘    └──────────────┘    └───────────┘
                          │                   ▲
                          │   类型反馈        │
                          └───────────────────┘
\`\`\`

1. **Parser（解析器）**：将源码解析为抽象语法树（AST）
2. **Ignition（解释器）**：将 AST 转换为字节码并直接解释执行，启动速度快
3. **TurboFan（JIT 编译器）**：监控热点代码（重复执行的函数），基于 Ignition 收集的类型反馈信息，将热点代码编译为高度优化的机器码
4. **去优化（Deoptimization）**：如果类型假设错误（如参数类型变化），TurboFan 会回退到 Ignition 字节码

#### libuv 事件循环的底层实现

libuv 使用 C 语言编写，是跨平台异步 I/O 的核心。事件循环本质是一个 \`while(true)\` 循环：

\`\`\`
while (uv_loop_alive(loop)) {
    uv__update_time(loop);           // 更新当前时间
    uv__run_timers(loop);            // timers 阶段：处理 setTimeout/setInterval
    ran_pending = uv__run_pending(loop); // pending callbacks
    uv__run_idle(loop);              // idle
    uv__run_prepare(loop);           // prepare
    timeout = uv_backend_timeout(loop);
    uv__io_poll(loop, timeout);      // poll 阶段：阻塞等待 I/O 事件
    uv__run_check(loop);             // check 阶段：执行 setImmediate
    uv__run_closing_handles(loop);   // close callbacks
    // 每个阶段之间处理 nextTick 和 Promise microtask
}
\`\`\`

**线程池工作机制**：

\`\`\`
         ┌─────────────────────────────────────────┐
         │           主线程 (Event Loop)            │
         │  JS执行 │ 事件循环 │ I/O回调 │ 微任务    │
         └───────┬─────────────┬───────────────────┘
                 │             │
     文件I/O     │  DNS查询    │  加密计算
     ───────────▶│────────────▶│
                 │             │
         ┌───────▼─────────────▼───────────────────┐
         │         libuv 线程池 (默认4线程)         │
         │  Thread1 │ Thread2 │ Thread3 │ Thread4   │
         │  (真正的并行执行，不阻塞主线程)           │
         └─────────────────────────────────────────┘
\`\`\`

线程池大小可通过 \`UV_THREADPOOL_SIZE\` 环境变量调整（最大 1024），但默认 4 个线程已足够大多数场景。

#### V8 内存模型

V8 的堆内存分为几个区域：

| 区域 | 说明 | 新生代/老生代 |
| --- | --- | --- |
| **New Space** | 新创建的对象，1-8MB，回收频繁 | 新生代（Scavenge GC） |
| **Old Space** | 存活较久的对象，采用标记-清除-整理 | 老生代（Mark-Sweep-Compact） |
| **Large Object Space** | 超过一定大小的对象（>1MB） | 老生代 |
| **Code Space** | JIT 编译后的机器码 | 老生代 |
| **Map Space** | 对象的隐藏类（Hidden Class） | 老生代 |

新生代垃圾回收（Scavenge）速度快，但空间利用率低；老生代回收（Mark-Sweep-Compact）速度慢但碎片少。

Node.js 默认堆内存限制约 1.4GB（32位）或 4GB（64位），可通过 \`--max-old-space-size\` 调整。

---

### 「常见陷阱」

#### 陷阱 1：用 Node.js 处理 CPU 密集型任务导致阻塞

Node.js 的主线程是单线程的，CPU 密集型计算会阻塞整个事件循环，所有 I/O 操作都要等待。

\`\`\`javascript
// ❌ 错误：在主线程执行斐波那契计算，阻塞所有请求
const http = require('http');
http.createServer((req, res) => {
  if (req.url === '/fib') {
    const fib = n => n <= 1 ? n : fib(n - 1) + fib(n - 2);
    res.end('fib(40) = ' + fib(40)); // 主线程阻塞数秒！
  } else {
    res.end('hello');
  }
}).listen(3000);
// 当 /fib 正在计算时，对 / 的请求也无法响应！

// ✅ 正确：使用 worker_threads 处理 CPU 密集任务
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  http.createServer((req, res) => {
    if (req.url === '/fib') {
      const worker = new Worker(__filename, { workerData: 40 });
      worker.on('message', result => res.end('fib(40) = ' + result));
    } else {
      res.end('hello');
    }
  }).listen(3000);
} else {
  const { workerData } = require('worker_threads');
  const fib = n => n <= 1 ? n : fib(n - 1) + fib(n - 2);
  parentPort.postMessage(fib(workerData));
}
\`\`\`

#### 陷阱 2：混淆 nextTick 和微任务执行时机

\`process.nextTick\` 的回调在**每个阶段切换之间**执行，优先级高于 Promise 微任务。递归调用 nextTick 会导致事件循环无法前进——这叫"nextTick 饿死"。

\`\`\`javascript
// ❌ 错误：递归 nextTick 阻塞 I/O
function tickForever() {
  process.nextTick(tickForever);
}
// setInterval 永远不会触发！因为 nextTick 队列始终非空
setInterval(() => console.log('timer'), 100);
tickForever();

// ✅ 正确：使用 setImmediate 或限制递归深度
function safeTick(depth = 0) {
  if (depth > 100) return; // 限制深度
  setImmediate(() => { /* 任务 */ });
}
\`\`\`

#### 陷阱 3：误以为 Node.js 完全单线程就没有并发问题

虽然 JS 代码在单线程执行，但 libuv 线程池和 V8 内部仍然存在并发访问，特别是在使用 native addon 或共享 ArrayBuffer 时。

\`\`\`javascript
// ❌ 错误：以为单线程就完全没有竞态条件
let counter = 0;
async function increment() {
  const val = await readFromDB(); // 异步操作期间控制权移交
  counter = counter + 1; // 多个异步操作可能交错
}

// ✅ 正确：理解异步操作之间仍可能有交错
// 使用原子操作或串行化机制
const { Atomic } = require('...');
// 或使用队列保证顺序
\`\`\`

#### 陷阱 4：随意修改 --max-old-space-size 解决内存问题

加大堆内存限制只是推迟问题，不是解决方案。

\`\`\`bash
# ❌ 错误：盲目加大内存，掩盖内存泄漏
node --max-old-space-size=8000 app.js

# ✅ 正确：先用工具诊断内存泄漏
node --inspect app.js
# 打开 Chrome DevTools → Memory → 取 Heap Snapshot 分析
# 或使用 clinic.js
clinic heapprofiler node app.js
\`\`\`

#### 陷阱 5：不理解 EventEmitter 的内存泄漏警告

默认情况下，EventEmitter 对同一事件注册超过 10 个监听器会打印警告，但这并不总是 bug。

\`\`\`javascript
// ❌ 错误：忽略或粗暴关闭警告
emitter.setMaxListeners(0); // 设为 0 等于无限，不推荐

// ✅ 正确：如果确实需要多个监听器，合理设置上限
emitter.setMaxListeners(20);
// 或检查是否重复注册了监听器（忘记 removeListener）
\`\`\`

---

### 「性能提示」

#### 1. 善用流（Stream）处理大数据，避免将整个文件读入内存

\`\`\`javascript
// ❌ 差：一次性读取大文件，占用大量内存
const fs = require('fs');
const data = fs.readFileSync('huge-file.txt'); // 整个文件载入内存
res.end(data);

// ✅ 好：使用流，内存占用恒定（几十KB）
fs.createReadStream('huge-file.txt').pipe(res);

// ✅ 更好：使用 pipeline 自动处理错误和资源清理
const { pipeline } = require('stream/promises');
await pipeline(
  fs.createReadStream('huge-file.txt'),
  zlib.createGzip(),
  res
);
\`\`\`

流模式下内存占用仅为 chunk 大小（默认 64KB），而 readFile 方式内存占用等于文件大小。

#### 2. 使用 \`--prof\` 进行 V8 级别的性能分析，不要凭直觉优化

\`\`\`bash
# 生成 V8 性能日志
node --prof app.js

# 压测后，分析日志生成可读报告
node --prof-process isolate-*.log > profile.txt

# 或使用更现代的 clinic.js
npm install -g clinic
clinic flame node app.js  # 生成火焰图
clinic bubbleprof node app.js  # 分析异步操作
\`\`\`

重点关注：
- **C++ 占比高**：瓶颈在 native 层，可能是 I/O 或加密操作
- **JS 占比高**：查看哪些函数最耗时，针对性优化
- **GC 占比高**：对象创建过于频繁，需要减少临时对象

#### 3. 合理配置 UV_THREADPOOL_SIZE

libuv 线程池默认 4 个线程，对于大量文件 I/O 或加密操作的场景可能不足：

\`\`\`bash
# 根据 CPU 核心数和 I/O 等待时间调整
# 例如：8 核服务器，主要做文件处理
UV_THREADPOOL_SIZE=8 node app.js

# 注意：线程数不是越多越好，过多线程会增加上下文切换开销
# 一般建议：4 ~ CPU核心数 * 2
\`\`\`

网络 I/O（HTTP、TCP）不占用线程池（由操作系统 epoll/kqueue 直接处理），只有文件系统 I/O、DNS 查询、crypto 相关操作才使用线程池。`,
    code: `// ============================================================
// 第一章代码演示：Node.js 运行时信息全景
// ============================================================
// 本章演示通过 process 和 os 模块获取 Node.js 运行时的各种底层信息

const os = require("os");

// ---- 1. 版本信息 ----
console.log("========== 版本信息 ==========");
// process.version：完整的 Node.js 版本字符串
console.log("Node.js 版本:", process.version);
// process.versions：包含各组件版本的对象
console.log("V8 引擎版本:", process.versions.v8);
console.log("libuv 版本:", process.versions.uv);
console.log("OpenSSL 版本:", process.versions.openssl);
// 以 JSON 格式展示完整版本信息
console.log("完整版本信息:");
console.log(JSON.stringify(process.versions, null, 2));

// ---- 2. 系统平台信息 ----
console.log("\\n========== 系统平台 ==========");
// process.platform：操作系统平台标识
// 可能的值：'darwin'(macOS)、'win32'(Windows)、'linux'(Linux)
console.log("操作系统平台:", process.platform);
// process.arch：CPU 架构
// 可能的值：'x64'、'arm64'、'ia32'、'arm'
console.log("CPU 架构:", process.arch);
// process.pid：当前进程 ID
console.log("进程 PID:", process.pid);
// process.ppid：父进程 ID
console.log("父进程 PPID:", process.ppid);

// ---- 3. 内存使用详情 ----
console.log("\\n========== 内存使用情况 ==========");
// process.memoryUsage()：返回 Node.js 进程的内存使用详情
const mem = process.memoryUsage();
// rss（Resident Set Size）：进程实际占用的物理内存
console.log("rss（常驻内存）:", (mem.rss / 1024 / 1024).toFixed(2), "MB");
// heapTotal：V8 堆的总量（已申请的堆空间）
console.log("heapTotal（堆总量）:", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB");
// heapUsed：V8 堆中实际已使用的部分
console.log("heapUsed（堆已用）:", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB");
// external：V8 管理的 C++ 对象（如 Buffer）占用的内存
console.log("external（外部内存）:", (mem.external / 1024 / 1024).toFixed(2), "MB");
// arrayBuffers：ArrayBuffer 和 SharedArrayBuffer 占用的内存
console.log("arrayBuffers:", ((mem.arrayBuffers || 0) / 1024 / 1024).toFixed(2), "MB");

// ---- 4. CPU 信息 ----
console.log("\\n========== CPU 信息 ==========");
// os.cpus()：返回 CPU 核心信息数组
const cpus = os.cpus();
console.log("CPU 逻辑核心数:", cpus.length);
console.log("CPU 型号:", cpus[0].model.trim());
console.log("CPU 频率:", cpus[0].speed, "MHz");

// 以表格展示各核心的时间统计
console.log("\\n各核心 CPU 时间统计（毫秒）:");
const cpuTable = cpus.map(function (cpu, i) {
  var t = cpu.times;
  var total = t.user + t.nice + t.sys + t.idle + t.irq;
  return {
    核心: "CPU" + i,
    用户态: t.user,
    系统态: t.sys,
    空闲: t.idle,
    使用率: ((1 - t.idle / total) * 100).toFixed(1) + "%",
  };
});
console.table(cpuTable);

// ---- 5. 系统内存信息 ----
console.log("\\n========== 系统内存 ==========");
// os.totalmem()：系统总内存（字节）
var totalMem = os.totalmem();
// os.freemem()：系统可用内存（字节）
var freeMem = os.freemem();
var usedMem = totalMem - freeMem;

function formatBytes(bytes) {
  var gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return gb.toFixed(2) + " GB";
  return (bytes / 1024 / 1024).toFixed(0) + " MB";
}

console.log("总内存:", formatBytes(totalMem));
console.log("已用  :", formatBytes(usedMem));
console.log("可用  :", formatBytes(freeMem));
console.log("使用率:", ((usedMem / totalMem) * 100).toFixed(1) + "%");

// ---- 6. 系统运行时间与负载 ----
console.log("\\n========== 系统运行时间 ==========");
// os.uptime()：系统从启动到现在的秒数
var uptime = os.uptime();
var days = Math.floor(uptime / 86400);
var hours = Math.floor((uptime % 86400) / 3600);
var mins = Math.floor((uptime % 3600) / 60);
console.log("系统已运行:", days + "天 " + hours + "小时 " + mins + "分钟");

// os.loadavg()：系统负载平均值（1分钟/5分钟/15分钟）
// Windows 上始终返回 [0, 0, 0]
var loadavg = os.loadavg();
console.log("\\n系统负载平均值:");
console.log("  1分钟  :", loadavg[0].toFixed(2));
console.log("  5分钟  :", loadavg[1].toFixed(2));
console.log("  15分钟:", loadavg[2].toFixed(2));
console.log("  负载/CPU比:", (loadavg[0] / cpus.length).toFixed(2), "(>1 表示过载)");

// ---- 7. 网络接口信息 ----
console.log("\\n========== 网络接口 ==========");
var nets = os.networkInterfaces();
console.log("网络接口数量:", Object.keys(nets).length);
// 遍历所有网络接口，提取关键信息
var netList = [];
for (var name in nets) {
  var interfaces = nets[name];
  for (var j = 0; j < interfaces.length; j++) {
    var net = interfaces[j];
    netList.push({
      接口: name,
      地址族: net.family,
      IP地址: net.address,
      内部接口: net.internal ? "是" : "否",
    });
  }
}
console.table(netList);

// ---- 8. 用户信息 ----
console.log("\\n========== 用户信息 ==========");
var user = os.userInfo();
console.log("用户名:", user.username);
console.log("主目录:", user.homedir);
console.log("Shell:", user.shell || "(无)");
console.log("临时目录:", os.tmpdir());

// ---- 9. process 其他属性 ----
console.log("\\n========== process 其他属性 ==========");
console.log("运行时长:", process.uptime().toFixed(4), "秒");
console.log("当前工作目录:", process.cwd());
console.log("__dirname:", __dirname);
console.log("__filename:", __filename);
console.log("argv:", process.argv);

// ---- 10. nextTick 微任务演示 ----
console.log("\\n========== nextTick 任务优先级 ==========");
console.log("1. 同步代码开始");

process.nextTick(function () {
  console.log("3. process.nextTick 回调（优先级最高）");
});

Promise.resolve().then(function () {
  console.log("4. Promise.then 回调");
});

console.log("2. 同步代码结束");
// 输出顺序：1 → 2 → 3 → 4

// ---- 11. 进程退出事件 ----
console.log("\\n========== 退出事件 ==========");
process.on("exit", function (code) {
  console.log("\\n[exit] 进程退出，退出码:", code);
  console.log("[exit] 此处只能执行同步操作");
});
console.log("已注册 exit 事件监听器，程序结束后自动触发");`,
  },

  // =========================================================
  // 第二章：第一个 Node.js 应用
  // =========================================================
  {
    id: "node-hello-world",
    icon: "🚀",
    group: "快速入门",
    title: "第一个 Node.js 应用",
    content: `## 从零开始创建 Node.js 项目

### 1. 初始化项目：npm init

每个 Node.js 项目的起点是 \`package.json\` 文件。它记录了项目的元数据、依赖和脚本：

\`\`\`bash
# 创建项目目录
mkdir my-first-app
cd my-first-app

# 初始化 package.json（交互式回答）
npm init

# 或者使用 -y 跳过所有问题，使用默认值
npm init -y
\`\`\`

初始化后得到的 \`package.json\` 基本结构：

\`\`\`json
{
  "name": "my-first-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
\`\`\`

### 2. 运行脚本

有几种方式执行 Node.js 代码：

\`\`\`bash
# 方式一：直接执行文件
node index.js

# 方式二：使用 npm scripts（在 package.json 中定义）
# "scripts": { "start": "node index.js" }
npm start

# 方式三：使用 -e 执行单行代码
node -e "console.log('Hello')"

# 方式四：REPL 交互式环境
node
# > 1 + 2
# 3
\`\`\`

### 3. console 对象——不仅仅是 log

\`console\` 是 Node.js 的全局对象，提供了丰富的输出方法。它底层封装了 \`process.stdout\` 和 \`process.stderr\`。

#### 基础输出方法

| 方法 | 输出流 | 说明 |
| --- | --- | --- |
| \`console.log(...args)\` | stdout | 普通日志输出（最常用） |
| \`console.info(...args)\` | stdout | 信息级别输出（与 log 行为一致） |
| \`console.warn(...args)\` | stderr | 警告信息 |
| \`console.error(...args)\` | stderr | 错误信息 |
| \`console.debug(...args)\` | stdout | 调试信息（默认不显示，需 --inspect） |

#### 格式化输出

\`console.log\` 支持类似 C 语言 printf 的格式化占位符：

| 占位符 | 说明 |
| --- | --- |
| \`%s\` | 字符串 |
| \`%d\` 或 \`%i\` | 整数 |
| \`%f\` | 浮点数 |
| \`%j\` | JSON 格式 |
| \`%o\` | 对象（可展开） |
| \`%O\` | 对象（紧凑） |
| \`%%\` | 百分号本身 |

\`\`\`javascript
console.log("用户 %s 的年龄是 %d 岁", "小明", 20);
// 输出：用户 小明 的年龄是 20 岁
\`\`\`

#### 表格展示：console.table

对于数组或对象，\`console.table\` 以表格形式展示数据，非常直观：

\`\`\`javascript
const users = [
  { name: "小明", age: 20, score: 92 },
  { name: "小红", age: 22, score: 88 },
];
console.table(users);
\`\`\`

#### 计时器：console.time / console.timeEnd

测量代码执行时间：

\`\`\`javascript
console.time("运算耗时");
// 执行一些耗时操作
for (let i = 0; i < 1000000; i++) {}
console.timeEnd("运算耗时");
// 输出：运算耗时: 2.345ms
\`\`\`

#### 分组输出：console.group / console.groupEnd

将相关输出组织在一起，形成缩进层次：

\`\`\`javascript
console.group("用户信息");
console.log("姓名: 小明");
console.group("详细信息");
console.log("年龄: 20");
console.log("城市: 北京");
console.groupEnd();
console.groupEnd();
\`\`\`

#### 调用栈追踪：console.trace

输出当前位置的调用栈，常用于调试：

\`\`\`javascript
function a() { b(); }
function b() { c(); }
function c() { console.trace("追踪调用栈"); }
a();
\`\`\`

#### 断言：console.assert

当条件为 false 时输出错误信息：

\`\`\`javascript
console.assert(1 === 2, "1 不等于 2？这不可能！");
// 输出：Assertion failed: 1 不等于 2？这不可能！
\`\`\`

#### 计数器：console.count / console.countReset

统计某个标签被调用的次数：

\`\`\`javascript
console.count("循环");  // 循环: 1
console.count("循环");  // 循环: 2
console.countReset("循环");  // 重置
console.count("循环");  // 循环: 1
\`\`\`

### 4. __dirname 与 __filename

这两个是 CommonJS 模块中自动注入的变量：

| 变量 | 含义 | 示例 |
| --- | --- | --- |
| \`__dirname\` | 当前文件所在**目录**的绝对路径 | \`/home/user/project/src\` |
| \`__filename\` | 当前文件的绝对路径 | \`/home/user/project/src/app.js\` |

### 5. __dirname 与 process.cwd() 的区别

这是一个常见的混淆点：

| 方法 | 含义 | 何时变化 |
| --- | --- | --- |
| \`__dirname\` | 当前脚本文件所在目录 | **不会变**——文件在哪就是哪 |
| \`process.cwd()\` | 当前工作目录 | **会变**——取决于你从哪个目录执行 \`node\` |

\`\`\`javascript
// 假设你在 /home/user 目录下执行 node /home/user/project/app.js
// __dirname  → /home/user/project  （文件所在目录）
// process.cwd() → /home/user  （执行命令时所在的目录）
\`\`\`

### 6. process.exit

控制进程退出：

\`\`\`javascript
// 正常退出（退出码 0）
process.exit(0);

// 异常退出（退出码 1，表示错误）
process.exit(1);

// 不传参数等同于 process.exit(0)
process.exit();
\`\`\`

退出码约定：
- \`0\`：正常退出
- \`1\`：一般性错误
- \`2\`：使用方式错误（如参数错误）
- \`128 + 信号值\`：被信号终止

### 7. process.argv

\`process.argv\` 是一个包含命令行参数的数组：

\`\`\`javascript
// 执行 node app.js --name=test --port=3000
// process.argv[0] = '/usr/local/bin/node'  （node 可执行文件路径）
// process.argv[1] = '/path/to/app.js'       （脚本文件路径）
// process.argv[2] = '--name=test'           （用户参数）
// process.argv[3] = '--port=3000'           （用户参数）
\`\`\`

### 8. process.env

\`process.env\` 包含所有环境变量，常用于配置管理：

\`\`\`javascript
// 读取环境变量
const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3000;
\`\`\`

---

### 「底层原理」

#### console 的底层实现：stdout 与 stderr 的本质

Node.js 中的 \`console.log\` 并不像浏览器那样连接到开发者工具，而是最终写入操作系统的**文件描述符**：

\`\`\`
console.log("hello")
      │
      ▼
┌──────────────────┐
│  Console 类      │
│  (util.inspect)  │  ← 将参数格式化为字符串
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ process.stdout   │  ← Writable Stream（可写流）
│ (fd = 1)         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    libuv         │
│  uv_tty_t /      │  ← 判断是否为终端(TTY)
│  uv_pipe_t       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 操作系统内核      │
│ write(1, buf)    │  ← 系统调用写入文件描述符1
└──────────────────┘
\`\`\`

关键细节：
- **stdout（fd=1）** 和 **stderr（fd=2）** 是进程启动时由操作系统自动打开的文件描述符
- 当 stdout 指向终端（TTY）时，libuv 使用 \`uv_tty_t\`，输出是**行缓冲**（遇到换行符才刷新）
- 当 stdout 被重定向到文件或管道时，使用 \`uv_pipe_t\`，输出是**块缓冲**（缓冲区满或显式 flush 才写入）
- \`console.error\` 写入 stderr（fd=2），即使 stdout 被重定向，错误信息仍会显示在终端

#### process 对象的内部结构

\`process\` 对象是 Node.js 启动时由 C++ 层创建并注入到 JS 上下文的全局对象，它是一个 **EventEmitter 实例**：

| 分类 | 关键属性/方法 | C++ 绑定来源 |
| --- | --- | --- |
| **进程信息** | pid, ppid, title, version, versions | node_process.cc |
| **环境信息** | env, platform, arch, cwd() | node_process.cc |
| **内存** | memoryUsage(), heapStatistics() | v8::HeapStatistics |
| **I/O 流** | stdin, stdout, stderr | stream_base.cc |
| **事件** | on('exit'), on('uncaughtException') | async_wrap.cc |
| **任务调度** | nextTick(), _tickCallback() | task_queue.cc |

#### process.nextTick 与微任务队列的 C++ 实现

\`process.nextTick\` 的回调存储在 JS 层的一个数组中，但执行时机由 C++ 层控制：

\`\`\`
每个事件循环阶段切换时:
  1. 先清空全部 nextTickQueue（循环执行直到队列为空）
  2. 再清空全部 Promise microtask queue
  3. 然后进入下一个阶段
\`\`\`

nextTick 队列的处理优先级高于 Promise 微任务，这是因为在 Node.js 的历史中，nextTick 出现得比原生 Promise 更早，保持了向后兼容性。

#### 进程退出码的操作系统含义

| 退出码 | 含义 | 操作系统层面 |
| --- | --- | --- |
| 0 | 成功 | waitpid() 返回 WIFEXITED=true, WEXITSTATUS=0 |
| 1 | 一般错误 | 未捕获异常、手动 exit(1) |
| 2 | 使用错误 | Bash 内置命令参数错误 |
| 3-124 | 应用自定义 | 程序员自定义含义 |
| 128+N | 被信号 N 终止 | 如 SIGKILL=9 → 退出码137 |
| 130 | Ctrl+C（SIGINT=2） | 128+2=130 |
| 137 | SIGKILL 杀死 | 128+9=137 |
| 143 | SIGTERM 终止 | 128+15=143 |

---

### 「常见陷阱」

#### 陷阱 1：在异步回调中访问 process.env 误以为是实时的

\`process.env\` 在 Node.js 启动时从操作系统环境变量**复制**到 JS 对象中。在 JS 中修改 \`process.env\` 不会影响操作系统环境变量，但子进程可以继承修改后的值。

\`\`\`javascript
// ❌ 误解：以为 process.env 是动态读取的
// terminal1: node app.js
// terminal2: export MY_VAR=hello  (在另一个终端设置环境变量)
// terminal1 中的 app.js 不会看到 MY_VAR，因为环境变量在启动时已固定

// ❌ 误解：修改 process.env 会影响系统环境变量
process.env.PATH = '/usr/local/bin'; // 只影响当前进程和子进程，不影响系统

// ✅ 正确：理解 process.env 的生命周期
// 环境变量在进程创建时确定，之后通过修改 process.env 只影响当前进程
// 如果需要动态配置，使用配置文件或配置中心
\`\`\`

#### 陷阱 2：console.log 影响性能，尤其在同步场景下

当 stdout 是文件/管道时，console.log 在某些情况下会变成同步操作（特别是写入到非 TTY 流时），在高吞吐日志场景下可能成为性能瓶颈。

\`\`\`javascript
// ❌ 错误：在热路径中大量使用 console.log
for (let i = 0; i < 100000; i++) {
  console.log("Processing item", i); // 大量同步 I/O 阻塞主线程
}

// ✅ 正确：生产环境使用专业日志库
// 使用 pino、winston 等支持异步写入的日志库
const pino = require('pino')();
for (let i = 0; i < 100000; i++) {
  pino.info({ item: i }, "Processing item"); // 异步写入，性能极高
}
\`\`\`

#### 陷阱 3：混淆 __dirname / __filename 的可用性

\`__dirname\` 和 \`__filename\` 只在 CommonJS 模块中存在。在 ESM 模块中直接使用会抛出 \`ReferenceError\`。

\`\`\`javascript
// ❌ 错误：在 .mjs 文件中使用 __dirname
// app.mjs
console.log(__dirname); // ReferenceError: __dirname is not defined

// ✅ 正确：ESM 中使用 import.meta.url 转换
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

#### 陷阱 4：process.exit() 导致异步操作中断

调用 \`process.exit()\` 会立即终止进程，即使有待处理的异步操作（如未完成的文件写入、数据库操作）也会被强制中断。

\`\`\`javascript
// ❌ 错误：在异步操作完成前调用 process.exit
fs.writeFile('data.json', JSON.stringify(data), (err) => {
  if (err) console.error(err);
  console.log('写入完成');
});
process.exit(0); // 文件还没写完进程就退出了！

// ✅ 正确：在所有异步操作完成后退出
fs.writeFile('data.json', JSON.stringify(data), (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log('写入完成');
    process.exit(0);
  }
});

// ✅ 更好：让事件循环自然结束（不调用 exit）
// 当没有待处理的回调时，Node.js 会自动退出，退出码为0
\`\`\`

#### 陷阱 5：process.argv 解析不当导致安全和健壮性问题

手动解析 process.argv 容易出错（如包含空格的参数、标志位等），且可能漏掉边界情况。

\`\`\`javascript
// ❌ 错误：简单地按空格分割或手动解析
// node app.js --name "John Doe" --port=3000
// 手动 slice(2) 后得到 ['--name', 'John Doe', '--port=3000']
// "John Doe" 被拆成两个参数

// ✅ 正确：使用成熟的参数解析库
// 推荐使用 minimist（轻量）或 commander（完整 CLI 框架）
const minimist = require('minimist');
const args = minimist(process.argv.slice(2));
console.log(args.name); // "John Doe"
console.log(args.port); // 3000
\`\`\`

---

### 「性能提示」

#### 1. 生产环境用专业日志库替代 console.log

\`console.log\` 是同步格式化+同步写入的（在非 TTY 环境），在请求密集的服务中会显著影响吞吐量。

\`\`\`bash
# 性能对比（每条日志约 100 字节）：
# console.log:       ~50,000 条/秒
# pino（异步）:  ~2,000,000 条/秒
# winston:         ~300,000 条/秒
\`\`\`

推荐：
- 开发环境：\`console.log\` 足够用，方便调试
- 生产环境：使用 \`pino\`（性能最优）或 \`winston\`（功能丰富），支持日志级别、日志切割、异步写入

#### 2. 合理使用 process.nextTick 避免 I/O 饥饿

虽然 \`process.nextTick\` 能保证回调在当前操作完成后立即执行，但递归调用会导致事件循环无法进入 I/O 阶段。

\`\`\`javascript
// ❌ 差：递归 nextTick 阻塞事件循环
function run() {
  process.nextTick(run);
}
run();
// setTimeout、I/O 回调永远不会执行！

// ✅ 好：使用 setImmediate 允许 I/O 回调插队
function run() {
  setImmediate(run);
}
run();
// setImmediate 在 check 阶段执行，I/O 回调在 poll 阶段有机会执行

// ✅ 更好：批处理 + 让出线程
async function processBatch(items, batchSize = 1000) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    batch.forEach(processItem);
    await new Promise(resolve => setImmediate(resolve)); // 让出事件循环
  }
}
\`\`\`

#### 3. 使用 NODE_ENV=production 优化运行时性能

设置 \`NODE_ENV=production\` 会让 Node.js 和许多框架启用生产模式优化：

\`\`\`bash
# 生产环境启动方式
NODE_ENV=production node app.js

# 或写入 .env 文件，使用 dotenv 加载
\`\`\`

优化效果：
- Express 等框架会缓存视图模板、压缩响应、禁用调试输出
- React/Vue SSR 会使用生产构建，跳过 propTypes 检查等开发期代码
- 某些 npm 包在 NODE_ENV=production 时会使用更高效的代码路径
- 性能提升通常在 2-3 倍之间（取决于框架）`,
    code: `// ============================================================
// 第二章代码演示：第一个 Node.js 应用
// 展示 console 的各种方法、路径信息、命令行参数
// ============================================================

// ---- 1. console 基础输出方法 ----
console.log("========== 1. console 基础输出 ==========");
console.log("这是一条普通日志（log，输出到 stdout）");
console.info("这是一条信息（info，与 log 行为一致）");
console.warn("这是一条警告（warn，输出到 stderr）");
console.error("这是一条错误（error，输出到 stderr）");

// ---- 2. console 格式化输出 ----
console.log("\\n========== 2. 格式化输出 ==========");
// 使用占位符格式化输出
var name = "小明";
var age = 20;
var score = 95.5;
console.log("用户 %s 的年龄是 %d 岁，成绩是 %f 分", name, age, score);
// 使用 %j 输出 JSON 格式
var obj = { name: "小明", age: 20, hobbies: ["编程", "阅读"] };
console.log("对象 JSON: %j", obj);
// 使用 %o 输出可展开的对象
console.log("对象详情: %o", obj);

// ---- 3. console.table 表格展示 ----
console.log("\\n========== 3. console.table 表格展示 ==========");
// 展示数组对象
var students = [
  { 姓名: "小明", 年龄: 20, 成绩: 92, 城市: "北京" },
  { 姓名: "小红", 年龄: 22, 成绩: 88, 城市: "上海" },
  { 姓名: "小刚", 年龄: 19, 成绩: 95, 城市: "广州" },
  { 姓名: "小美", 年龄: 21, 成绩: 85, 城市: "深圳" },
];
console.log("学生成绩表:");
console.table(students);

// 展示单个对象（键值对表格）
console.log("\\n单条学生信息:");
console.table(students[0]);

// ---- 4. console.time / timeEnd 计时 ----
console.log("\\n========== 4. 计时功能 ==========");
// 测量一段代码的执行时间
console.time("循环耗时");
var sum = 0;
for (var i = 0; i < 1000000; i++) {
  sum += i;
}
console.timeEnd("循环耗时");
console.log("循环求和结果:", sum);

// 同时运行多个计时器
console.time("操作A");
console.time("操作B");
// 操作 A 模拟短时间
for (var j = 0; j < 500000; j++) { sum += j; }
console.timeEnd("操作A");
// 操作 B 模拟稍长时间
for (var k = 0; k < 1000000; k++) { sum += k; }
console.timeEnd("操作B");

// ---- 5. console.group 分组输出 ----
console.log("\\n========== 5. 分组输出 ==========");
console.group("用户信息模块");
console.log("模块加载完成");
console.group("用户列表");
console.log("用户 1: 小明");
console.log("用户 2: 小红");
console.groupEnd();
console.log("用户总数: 2");
console.groupEnd();

// ---- 6. console.trace 调用栈追踪 ----
console.log("\\n========== 6. 调用栈追踪 ==========");
function level3() {
  console.trace("当前调用栈:");
}
function level2() {
  level3();
}
function level1() {
  level2();
}
level1();

// ---- 7. console.assert 断言 ----
console.log("\\n========== 7. 断言 ==========");
console.assert(1 === 1, "这条不会显示（条件为 true）");
console.assert(1 === 2, "断言失败：1 不等于 2");
console.log("断言不会阻止代码继续执行");

// ---- 8. console.count 计数器 ----
console.log("\\n========== 8. 计数器 ==========");
console.count("请求");
console.count("请求");
console.count("请求");
console.log("请求计数器重置");
if (typeof console.countReset === "function") {
  console.countReset("请求");
}
console.count("请求");

// ---- 9. __dirname 与 __filename ----
console.log("\\n========== 9. 路径信息 ==========");
console.log("__dirname :", __dirname);
console.log("__filename:", __filename);

// ---- 10. process.cwd() 与 __dirname 的区别 ----
console.log("\\n========== 10. cwd() vs __dirname ==========");
console.log("__dirname     :", __dirname);
console.log("process.cwd() :", process.cwd());
console.log("说明：__dirname 是脚本所在目录，不会变");
console.log("      process.cwd() 是执行命令时的目录，可以通过 cd 改变");

// ---- 11. process.argv 命令行参数 ----
console.log("\\n========== 11. 命令行参数 ==========");
console.log("argv 数组长度:", process.argv.length);
console.log("argv[0] (node 路径):", process.argv[0]);
console.log("argv[1] (脚本路径):", process.argv[1]);
// 如果有额外参数，模拟解析
if (process.argv.length > 2) {
  console.log("额外参数:");
  for (var i = 2; i < process.argv.length; i++) {
    console.log("  argv[" + i + "]:", process.argv[i]);
  }
} else {
  console.log("（没有额外命令行参数）");
}

// 模拟命令行参数解析工具
console.log("\\n模拟参数解析:");
var args = process.argv.slice(2);
var config = {};
for (var i = 0; i < args.length; i++) {
  var arg = args[i];
  if (arg.startsWith("--")) {
    var parts = arg.slice(2).split("=");
    config[parts[0]] = parts[1] || true;
  }
}
console.log("解析结果:", JSON.stringify(config, null, 2));

// ---- 12. process.env 环境变量 ----
console.log("\\n========== 12. 环境变量 ==========");
console.log("NODE_ENV:", process.env.NODE_ENV || "(未设置，默认 development)");
console.log("HOME:", process.env.HOME || process.env.USERPROFILE || "(未知)");
console.log("PATH(前80字符):", (process.env.PATH || "").slice(0, 80) + "...");

// ---- 13. process.exit 退出码 ----
console.log("\\n========== 13. 退出码信息 ==========");
console.log("正常退出码: 0");
console.log("一般错误  : 1");
console.log("使用错误  : 2");
console.log("当前进程 PID:", process.pid);
// 注意：不会真的调用 process.exit()，否则演示会中断

// ---- 14. 综合示例：创建一个简单的命令行工具 ----
console.log("\\n========== 14. 综合示例 ==========");
console.log("假设这是一个命令行工具 cli-tool");
console.log("用法: node cli-tool.js --name=<名称> --verbose");
console.log("");

// 模拟解析参数
var simulatedArgs = ["--name=my-project", "--verbose", "--port=3000"];
var cliConfig = { verbose: false, port: 3000 };
for (var i = 0; i < simulatedArgs.length; i++) {
  var arg = simulatedArgs[i];
  if (arg === "--verbose") {
    cliConfig.verbose = true;
  } else if (arg.startsWith("--")) {
    var parts = arg.slice(2).split("=");
    cliConfig[parts[0]] = parts[1] || true;
  }
}

console.log("解析到的配置:");
console.table(cliConfig);

console.log("\\n项目名称:", cliConfig["name"] || "未指定");
console.log("端口号:", cliConfig.port);
console.log("详细模式:", cliConfig.verbose ? "开启" : "关闭");

// 进程退出事件
process.on("exit", function (code) {
  console.log("\\n[exit] 程序执行完毕，退出码:", code);
});`,
  },

  // =========================================================
  // 第三章：CommonJS 模块系统
  // =========================================================
  {
    id: "node-commonjs",
    icon: "📦",
    group: "快速入门",
    title: "CommonJS 模块系统",
    content: `## 为什么需要模块系统？

在没有模块系统的时代，所有 JavaScript 代码共享一个全局作用域。如果两个文件都定义了 \`var name\`，后加载的会覆盖先加载的，导致难以调试的 bug。

**模块系统的核心目标**：
1. **隔离作用域**：每个模块有自己的独立作用域，互不污染
2. **复用代码**：把功能封装成模块，在多个项目中复用
3. **依赖管理**：明确声明依赖关系，按需加载
4. **封装实现**：只暴露必要的 API，隐藏内部细节

## CommonJS 规范

Node.js 默认使用 CommonJS 模块规范。**每个 .js 文件就是一个独立的模块**，文件内的变量和函数默认是私有的。

### 三大核心 API

| API | 作用 | 说明 |
| --- | --- | --- |
| \`require(modulePath)\` | 导入模块 | 返回模块导出的对象（即 module.exports） |
| \`module.exports\` | 导出模块 | **真正决定导出内容**的对象，require 返回的就是它 |
| \`exports\` | 导出的快捷方式 | 初始时指向 module.exports，本质是引用 |

### require 的工作原理（五步详解）

当你调用 \`require('./math')\` 时，Node.js 内部经历以下步骤：

#### 步骤 1：路径解析（Resolution）

根据参数形式确定模块的绝对路径：

| 参数形式 | 分类 | 解析方式 |
| --- | --- | --- |
| \`require('fs')\` | 核心模块 | 直接返回内置模块，速度最快 |
| \`require('./utils')\` | 相对路径文件 | 以当前文件所在目录为起点拼接 |
| \`require('lodash')\` | 第三方包 | 从当前目录逐级向上查找 node_modules |

**核心模块优先级最高**。即使 node_modules 里有叫 fs 的文件夹，\`require('fs')\` 返回的仍是内置模块。

**node_modules 查找算法**：从当前文件目录开始，逐级向上查找 node_modules，直到根目录。例如在 \`/home/user/project/src/app.js\` 中 \`require('lodash')\`：

\`\`\`
① /home/user/project/src/node_modules/lodash/
② /home/user/project/node_modules/lodash/
③ /home/user/node_modules/lodash/
④ /home/node_modules/lodash/
⑤ /node_modules/lodash/
\`\`\`

#### 步骤 2：文件定位（File Location）

找到目标后，按顺序尝试扩展名补全：
1. 精确匹配文件名
2. .js（JavaScript 文件）
3. .json（JSON 文件，自动 JSON.parse）
4. .node（C++ 编译的二进制模块）

如果是目录，则查找 package.json 的 main 字段，或默认 index.js。

#### 步骤 3：包装（Wrapping）

Node.js 读取文件后，**不会直接执行**，而是将代码包裹在模块包装器函数中：

\`\`\`javascript
// 你的原始代码
function add(a, b) { return a + b; }
module.exports = { add };

// Node.js 实际执行的代码
(function(exports, require, module, __filename, __dirname) {
  function add(a, b) { return a + b; }
  module.exports = { add };
});
\`\`\`

这个包装器函数创建了新的作用域，实现了模块隔离。

#### 步骤 4：编译执行

根据扩展名使用不同编译器：
- .js → V8 编译执行
- .json → JSON.parse 后赋值给 module.exports
- .node → dlopen 加载 C++ 二进制模块

#### 步骤 5：缓存（Caching）

模块**第一次被加载时**会执行完整流程，执行后把 module.exports 缓存到 \`require.cache\` 中。之后再 require 同一个模块，直接返回缓存，**不会再次执行**。

\`\`\`javascript
// 第一次 require → 执行模块代码，缓存结果
const config1 = require('./config');
// 第二次 require → 命中缓存，直接返回
const config2 = require('./config');
console.log(config1 === config2); // true（同一个对象）
\`\`\`

### module.exports vs exports 陷阱

这是 CommonJS 最常见的陷阱。理解它需要明白 JavaScript 的**引用传递**：

\`\`\`javascript
// Node.js 内部初始化时：
// module.exports = {};  // 创建空对象
// exports = module.exports;  // exports 指向同一个对象
\`\`\`

**四种场景分析**：

\`\`\`javascript
// ✅ 场景 1：给 exports 添加属性（正确）
exports.add = function(a, b) { return a + b; };
exports.PI = 3.14;
// module.exports 和 exports 指向同一个对象，对象内容变了

// ✅ 场景 2：给 module.exports 赋新值（正确）
module.exports = function Calculator() { /* ... */ };
// module.exports 指向新对象，exports 还指向旧对象（没关系）

// ❌ 场景 3：给 exports 赋新值（错误！）
exports = { add: function(a, b) { return a + b; } };
// exports 指向了新对象，但 module.exports 还是旧空对象 {}
// require 返回的是 module.exports，所以拿到的是空对象！

// ✅ 场景 4：混合使用（正确）
module.exports = function main() { /* ... */ };
module.exports.version = '1.0.0';
\`\`\`

**终极口诀**：最终导出的是 \`module.exports\`。导出多个值用 \`exports.xxx\`，导出单个值用 \`module.exports = xxx\`。

### 模块缓存机制

缓存键是模块的**绝对路径**。利用缓存可以实现：
- **单例模式**：整个应用只有一个实例
- **热更新**：删除缓存后重新 require

\`\`\`javascript
// 热更新实现
function reloadModule(moduleName) {
  const modulePath = require.resolve(moduleName);
  delete require.cache[modulePath];
  return require(moduleName);
}
\`\`\`

### 循环依赖

当 A require B，B 又 require A 时，Node.js 返回当前已导出的部分（可能不完整）。因为模块加载时立即创建缓存条目（空 exports），然后执行代码。如果 B 又 require A，Node.js 发现 A 在缓存中但 loaded=false，直接返回不完整的 exports。

**三个实战建议**：
1. 尽量避免循环依赖，提取共享代码到第三个模块
2. 把关键导出放在模块顶部，确保另一方 require 时能拿到
3. 把 require 放在函数内部，延迟加载

### require.cache 与 require.resolve

\`\`\`javascript
// require.cache：查看所有已缓存模块
console.log(Object.keys(require.cache));

// require.resolve：只解析路径，不执行模块
const path = require.resolve('fs');
console.log(path); // 内置模块 fs 的路径

// 检查模块是否存在
try {
  require.resolve('some-module');
} catch (e) {
  console.log('模块不存在:', e.code); // MODULE_NOT_FOUND
}
\`\`\`

---

### 「底层原理」

#### Module 构造函数与模块加载的 C++ 实现

Node.js 的 CommonJS 模块系统由 JS 层的 \`Module\` 类（\`lib/internal/modules/cjs/loader.js\`）和 C++ 层的 \`node_contextify.cc\` 共同实现。每个被加载的文件对应一个 \`Module\` 实例：

\`\`\`
┌─────────────────────────────────────────────┐
│              Module 实例                      │
├─────────────────────────────────────────────┤
│  id: 模块绝对路径（缓存键）                    │
│  path: 模块所在目录                           │
│  exports: {}  ← 模块导出对象（初始为空对象）    │
│  parent: 父模块的 Module 引用                 │
│  filename: 文件名                             │
│  loaded: false  ← 初始为false，加载完成后true  │
│  children: []  ← 本模块 require 的子模块列表   │
│  paths: []  ← node_modules 搜索路径数组        │
└─────────────────────────────────────────────┘
\`\`\`

#### require() 的完整执行流程（源码级别）

\`\`\`
require(X) 调用链：

  Module.prototype.require(id)
    │
    ▼
  Module._load(id, parent, isMain)
    │
    ├─▶ 1. 检查 Module._cache 中是否已缓存
    │     └─ 若缓存且 loaded=true → 直接返回 module.exports
    │
    ├─▶ 2. 若是原生模块（如 'fs', 'path'）
    │     └─▶ NativeModule.require() → 返回内置模块（C++绑定）
    │
    ├─▶ 3. 创建新 Module 实例，立即放入 _cache
    │     （这一步是解决循环依赖的关键——先放缓存，再执行）
    │
    ├─▶ 4. module.load(filename)
    │     │
    │     ▼
    │   5. module._compile(content, filename)
    │     │
    │     ▼
    │   6. 包裹模块代码（模块包装器）
    │     (function(exports, require, module, __filename, __dirname) {
    │       // 你的代码在这里
    │     });
    │
    └─▶ 7. 执行包裹函数 → module.loaded = true → 返回 module.exports
\`\`\`

关键细节：步骤3在执行模块代码之前就把 module 放入缓存，exports 初始为空对象 \`{}\`。这就是为什么循环依赖时另一方会拿到一个**不完整**的 exports——代码还没执行完，但模块已经在缓存里了。

#### 模块包装器的作用与实现

为什么模块内的变量不会污染全局？因为 Node.js 在执行前用包装器函数将代码包裹：

\`\`\`javascript
// Node.js 内部实际执行的代码（简化版）
(function (exports, require, module, __filename, __dirname) {
  // ↓↓↓ 你的 .js 文件内容被插入在这里 ↓↓↓
  const hello = 'world';
  module.exports = { hello };
  // ↑↑↑ 你的 .js 文件内容结束 ↑↑↑
});
\`\`\`

包装器函数的5个参数就是每个模块内部"自动可用"的变量。你可以通过以下方式查看实际的包装器源码：

\`\`\`javascript
console.log(require('module').wrapper);
// [
//   '(function (exports, require, module, __filename, __dirname) { ',
//   '\\n});'
// ]
\`\`\`

#### node_modules 查找算法的伪代码

\`\`\`
function resolveNodeModules(startDir, moduleName) {
  let currentDir = startDir;
  while (true) {
    const candidate = join(currentDir, 'node_modules', moduleName);
    if (existsSync(candidate)) {
      return candidate;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break; // 到达根目录
    currentDir = parentDir;
  }
  // 最后查找全局 node_modules 目录
  return checkGlobalPaths(moduleName);
}
\`\`\`

查找过程会逐级向上遍历目录树，这意味着：
- 每个项目可以有自己的依赖版本
- 内层 node_modules 优先于外层（就近原则）
- 查找深度可能很大（但 npm@3+ 使用扁平化结构优化）

#### JSON 模块的加载机制

当 \`require('./config.json')\` 时，Node.js 内部执行的是：

\`\`\`javascript
// 内部伪代码
Module._extensions['.json'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  try {
    module.exports = JSON.parse(stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};
\`\`\`

注意：JSON 模块是**同步读取 + JSON.parse**，大 JSON 文件会阻塞事件循环。

---

### 「常见陷阱」

#### 陷阱 1：使用 exports 直接赋值导致导出丢失

这是最经典的 CommonJS 错误。\`exports\` 只是 \`module.exports\` 的引用，给 exports 重新赋值不会改变 module.exports。

\`\`\`javascript
// ❌ 错误：exports 被重新赋值，module.exports 仍是空对象
// utils.js
exports = {
  add(a, b) { return a + b; }
};
// main.js
const utils = require('./utils');
console.log(utils); // {} ← 空对象！不是期望的 { add }

// ✅ 正确：给 module.exports 赋值
module.exports = {
  add(a, b) { return a + b; }
};

// ✅ 正确：给 exports 添加属性（不重新赋值）
exports.add = function(a, b) { return a + b; };
\`\`\`

记忆口诀：导出的是 \`module.exports\`，不是 \`exports\`。\`exports\` 只是便捷引用。

#### 陷阱 2：循环依赖导致拿到未初始化的导出

模块加载是"先入缓存，后执行代码"，循环依赖时被依赖方可能尚未执行到导出语句。

\`\`\`javascript
// ❌ 问题：循环依赖中拿到不完整对象
// a.js
console.log('a 开始');
exports.done = false;
const b = require('./b');
console.log('a 中 b.done =', b.done);
exports.done = true;
console.log('a 结束');

// b.js
console.log('b 开始');
exports.done = false;
const a = require('./a'); // a 在缓存中，但 done=false（未执行完）
console.log('b 中 a.done =', a.done); // false ← 拿到了半成品！
exports.done = true;
console.log('b 结束');

// main.js
const a = require('./a');
// 输出顺序：
// a 开始 → b 开始 → b 中 a.done = false → b 结束 → a 中 b.done = true → a 结束

// ✅ 正确：避免循环依赖
// 方案1：提取共享代码到第三个模块 c.js，a 和 b 都 require c
// 方案2：将关键导出放在文件顶部（在 require 其他模块之前先导出所有内容）
// 方案3：在函数内部延迟 require（将 require 移入函数体中，调用时才执行）
\`\`\`

#### 陷阱 3：require 路径大小写不敏感导致跨平台问题

macOS 默认文件系统是大小写不敏感的，Windows 也是，但 Linux 是大小写敏感的。

\`\`\`javascript
// ❌ 错误：在 macOS 上开发正常，部署到 Linux 崩溃
// 文件实际叫 Utils.js
const utils = require('./utils'); // macOS: 可以找到  Linux: MODULE_NOT_FOUND!

// ✅ 正确：路径大小写严格匹配实际文件名
const utils = require('./Utils');
\`\`\`

建议：文件名统一使用小写 + 连字符（kebab-case），避免大小写问题。

#### 陷阱 4：删除 require.cache 后旧引用仍然有效

热更新时删除缓存可以强制重新加载模块，但之前已经拿到的旧引用不会自动更新。

\`\`\`javascript
// ❌ 陷阱：旧引用不更新
let config = require('./config');
console.log(config.version); // "1.0.0"

delete require.cache[require.resolve('./config')];
// 修改 config.js 文件内容，version 改为 "2.0.0"
let newConfig = require('./config');
console.log(newConfig.version); // "2.0.0" ✅
console.log(config.version);    // "1.0.0" ❌ 旧引用还是老对象！

// ✅ 正确：每次使用都重新 require，或设计成可更新的模式
function getConfig() {
  delete require.cache[require.resolve('./config')];
  return require('./config');
}
\`\`\`

#### 陷阱 5：require 动态表达式导致打包工具无法静态分析

使用变量作为 require 参数时，webpack、esbuild 等打包工具无法在构建时确定依赖关系。

\`\`\`javascript
// ❌ 问题：打包工具无法识别动态 require
function loadModule(name) {
  return require('./' + name); // webpack 无法知道需要打包哪些文件
}

// ❌ 危险：用户输入可控制 require 路径，可能导致任意文件加载
const moduleName = req.query.module;
const mod = require('./plugins/' + moduleName);
// 攻击者传入 '../../etc/passwd' 可能读取敏感文件！

// ✅ 正确：使用白名单映射
function loadModule(name) {
  const modules = {
    'user': require('./user'),
    'order': require('./order'),
    'product': require('./product'),
  };
  if (!modules[name]) throw new Error('Unknown module: ' + name);
  return modules[name];
}
\`\`\`

---

### 「性能提示」

#### 1. 模块加载是同步阻塞的，避免运行时动态 require 大模块

\`require()\` 是同步操作——文件 I/O、包裹、编译、执行全部在主线程同步完成。在请求处理路径上动态 require 大模块会阻塞所有其他请求。

\`\`\`javascript
// ❌ 差：在请求处理中 require 大模块
app.get('/report', (req, res) => {
  const pdf = require('pdfkit'); // 首次请求时同步加载，阻塞！
  // ... 生成 PDF
});

// ✅ 好：在应用启动时预加载所有依赖
const pdf = require('pdfkit'); // 启动时加载，只执行一次
app.get('/report', (req, res) => {
  // 直接使用，命中缓存
});

// ✅ 好：对可选大模块使用延迟加载 + 缓存
let pdfKit = null;
function getPdfKit() {
  if (!pdfKit) pdfKit = require('pdfkit'); // 只加载一次
  return pdfKit;
}
\`\`\`

#### 2. 利用模块缓存实现高效的单例模式

CommonJS 的缓存机制天然实现了单例——模块代码只执行一次，所有 require 方共享同一个 exports 对象。

\`\`\`javascript
// ✅ 推荐：利用模块缓存实现数据库连接池单例
// db.js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({ /* 配置 */ }); // 只创建一次
module.exports = pool;

// user.js
const pool = require('./db'); // 同一个 pool

// order.js
const pool = require('./db'); // 还是同一个 pool！

// ❌ 错误：每次调用都创建新连接（浪费资源）
// db.js
module.exports = function createConnection() {
  return mysql.createConnection({ /* ... */ }); // 每次都创建新连接！
};
\`\`\`

单例模式适用场景：数据库连接池、Redis 客户端、配置对象、日志实例。

不适用场景：需要独立状态的对象（如每个请求的上下文、用户会话）——这些应导出工厂函数。

#### 3. 避免深嵌套的 node_modules 结构（npm 依赖地狱）

npm@3 之前采用嵌套安装（每个包的依赖装在自己的 node_modules 下），导致极深的目录树和大量重复包。npm@3+ 使用扁平化结构提升性能。

\`\`\`bash
# npm@2 嵌套结构（差）：
# node_modules/
#   └── express/
#       └── node_modules/
#           └── accepts/
#               └── node_modules/
#                   └── mime-types/...（路径极长，Windows 路径长度限制报错）

# npm@3+ 扁平化结构（好）：
# node_modules/
#   ├── express/
#   ├── accepts/      ← 提升到顶层
#   └── mime-types/   ← 提升到顶层

# 查看依赖树，发现重复依赖
npm ls
# 或者
npm ls mime-types  # 查看哪些包依赖了 mime-types

# 去重优化
npm dedupe  # 将能提升的依赖提升到顶层，减少重复
\`\`\`

保持依赖树扁平的好处：
- 减少文件 I/O（require 查找更快）
- 减少磁盘占用（同一个版本只存一份）
- 避免 Windows 系统路径长度限制问题（MAX_PATH=260字符）`,
    code: `// ============================================================
// 第三章代码演示：CommonJS 模块系统核心机制
// 在沙箱中用一个文件模拟 CommonJS 的完整机制
// ============================================================

// ---- 1. 基础模块导出与导入 ----
console.log("========== 1. 基础模块：数学工具 =====");

// 模拟 math.js 模块
// 真实写法：单独文件 math.js 中 module.exports = { add, ... }
var mathModule = {
  add: function (a, b) { return a + b; },
  subtract: function (a, b) { return a - b; },
  multiply: function (a, b) { return a * b; },
  divide: function (a, b) { return b !== 0 ? a / b : "除数不能为 0"; },
  PI: 3.14159265,
  E: 2.71828182,
};

// 模拟 require('./math') 的返回值
var math = mathModule;

console.log("add(3, 7) =", math.add(3, 7));
console.log("subtract(20, 8) =", math.subtract(20, 8));
console.log("multiply(6, 7) =", math.multiply(6, 7));
console.log("divide(10, 3) =", math.divide(10, 3));
console.log("PI =", math.PI);
console.log("圆面积(r=5):", (math.PI * 5 * 5).toFixed(2));

// ---- 2. 闭包实现私有状态 ----
console.log("\\n========== 2. 私有状态：计数器模块 =====");

// 模拟 counter.js 模块
// 利用闭包实现私有变量，外部无法直接访问 count
function createCounterModule() {
  var count = 0; // 模块级私有变量，外部无法访问

  return {
    increment: function () { count++; return count; },
    decrement: function () { count--; return count; },
    getValue: function () { return count; },
    reset: function () { count = 0; },
  };
}

var counter = createCounterModule();
console.log("初始值:", counter.getValue());
counter.increment(); counter.increment(); counter.increment();
console.log("加 3 次后:", counter.getValue());
counter.decrement();
console.log("减 1 次后:", counter.getValue());
counter.reset();
console.log("重置后:", counter.getValue());

// ---- 3. 导出构造函数 ----
console.log("\\n========== 3. 导出构造函数：Person 模块 =====");

// 模拟 person.js 中 module.exports = Person
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.greet = function () {
  return "你好，我是 " + this.name + "，今年 " + this.age + " 岁";
};
Person.prototype.birthday = function () {
  this.age++;
  return this;
};

var p1 = new Person("小明", 20);
var p2 = new Person("小红", 22);
console.log(p1.greet());
console.log(p2.greet());
p1.birthday().birthday();
console.log("过两次生日后:", p1.greet());
console.log("p1 instanceof Person:", p1 instanceof Person);

// ---- 4. exports vs module.exports 陷阱 ----
console.log("\\n========== 4. exports 陷阱演示 =====");

// 场景 1：给 exports 添加属性 ✅
console.log("--- 场景 1：给 exports 添加属性 ---");
var modExp1 = {};
var exp1 = modExp1;
exp1.add = function (a, b) { return a + b; };
exp1.PI = 3.14;
console.log("module.exports 有 add:", typeof modExp1.add); // function
console.log("module.exports 有 PI:", modExp1.PI); // 3.14
console.log("结果：✅ 正确");

// 场景 2：给 module.exports 赋新值 ✅
console.log("\\n--- 场景 2：给 module.exports 赋新值 ---");
var modExp2 = {};
var exp2 = modExp2;
modExp2 = function greet(name) { return "Hello, " + name + "!"; };
console.log("module.exports 是函数:", typeof modExp2); // function
console.log("exports 还是旧对象:", typeof exp2); // object
console.log("结果：✅ 正确，require 返回 greet 函数");

// 场景 3：给 exports 赋新值 ❌
console.log("\\n--- 场景 3：给 exports 赋新值（常见错误）---");
var modExp3 = {};
var exp3 = modExp3;
exp3 = { multiply: function (a, b) { return a * b; } };
console.log("exports 有 multiply:", typeof exp3.multiply); // function
console.log("module.exports 有 multiply:", typeof modExp3.multiply); // undefined
console.log("module.exports 是空对象:", JSON.stringify(modExp3)); // {}
console.log("结果：❌ 错误！require 返回 {}，导出全部丢失！");

// 场景 4：导出函数并附带属性 ✅
console.log("\\n--- 场景 4：混合使用（常见模式）---");
var myModule = {};
var exp4 = myModule;
exp4.helper = function () { return "辅助方法"; };
myModule = function main() { return "主功能"; };
myModule.helper = exp4.helper;
myModule.version = "1.0.0";
console.log("main():", myModule());
console.log("main.helper():", myModule.helper());
console.log("main.version:", myModule.version);
console.log("结果：✅ 正确，类似 express 的导出方式");

// ---- 5. require.cache 缓存与单例 ----
console.log("\\n========== 5. 缓存与单例模式 =====");

var fakeCache = {};
var loadCount = 0;

function loadDatabaseModule() {
  loadCount++;
  console.log("  [数据库模块被加载！第 " + loadCount + " 次初始化]");
  return {
    connectionId: Math.floor(Math.random() * 10000),
    loadedAt: new Date().toISOString(),
    query: function (sql) { return "执行: " + sql; },
  };
}

function fakeRequire(modulePath) {
  if (fakeCache[modulePath]) {
    console.log("  [命中缓存，直接返回]");
    return fakeCache[modulePath];
  }
  var mod = loadDatabaseModule();
  fakeCache[modulePath] = mod;
  return mod;
}

console.log("第一次 require('./database'):");
var db1 = fakeRequire("./database");
console.log("  connectionId:", db1.connectionId);

console.log("第二次 require('./database'):");
var db2 = fakeRequire("./database");
console.log("  connectionId:", db2.connectionId);

console.log("第三次 require('./database'):");
var db3 = fakeRequire("./database");
console.log("  connectionId:", db3.connectionId);

console.log("\\n模块实际初始化次数:", loadCount, "（只有第一次真正初始化）");
console.log("三次返回同一个对象:", db1 === db2 && db2 === db3);
console.log("这就是单例模式——所有 require 方共享同一个实例");

// 删除缓存，强制重新加载
console.log("\\n删除缓存后重新加载:");
delete fakeCache["./database"];
var db4 = fakeRequire("./database");
console.log("  connectionId:", db4.connectionId, "（新的连接 ID）");
console.log("db1 === db4:", db1 === db4, "（旧引用不受影响）");

// ---- 6. require.resolve 路径解析 ----
console.log("\\n========== 6. require.resolve 路径解析 =====");

var path = require("path");
var fs = require("fs");

// 模拟路径解析
function simulateResolve(requirePath) {
  if (!requirePath.startsWith("./") && !requirePath.startsWith("../") && !requirePath.startsWith("/")) {
    return "[内置模块] " + requirePath;
  }
  if (requirePath.startsWith("./") || requirePath.startsWith("../")) {
    return path.resolve(__dirname, requirePath);
  }
  return requirePath;
}

console.log("require('fs')        →", simulateResolve("fs"));
console.log("require('path')      →", simulateResolve("path"));
console.log("require('./utils')   →", simulateResolve("./utils"));
console.log("require('../config') →", simulateResolve("../config"));

console.log("\\n真实的 require.resolve:");
console.log("require.resolve('path') →", require.resolve("path"));
console.log("require.resolve('fs')   →", require.resolve("fs"));

// 找不到模块时抛出错误
try {
  require.resolve("nonexistent-module-xyz");
} catch (e) {
  console.log("require.resolve('不存在的模块') →", e.code);
}

// ---- 7. 循环依赖模拟 ----
console.log("\\n========== 7. 循环依赖模拟 =====");

function simulateCircleDependency() {
  var cache = {};

  function createModule(filename, factory) {
    var mod = { exports: {}, loaded: false, filename: filename };
    cache[filename] = mod;

    var requireFn = function (dep) {
      if (cache[dep] && !cache[dep].loaded) {
        console.log("  [" + dep + " 还在加载中，返回不完整导出]");
        return cache[dep].exports;
      }
      if (!cache[dep]) {
        return {};
      }
      return cache[dep].exports;
    };

    factory(mod.exports, requireFn, mod);
    mod.loaded = true;
    return mod;
  }

  // 先把 b.js 放入缓存（模拟 Node.js 在 require 时立即创建模块对象）
  var bModule = { exports: {}, loaded: false, filename: "b.js" };
  cache["b.js"] = bModule;

  var modA = createModule("a.js", function (exports, require) {
    console.log("a.js 开始执行");
    exports.done = false;
    console.log("a.js 触发 b.js 的加载...");

    // 模拟 b.js 的执行
    (function (exp, req) {
      console.log("b.js 开始执行");
      exp.done = false;
      var a = req("a.js"); // 循环依赖！拿到不完整的 a
      console.log("b.js 中 a.done =", a.done, "（a 还不完整！）");
      exp.done = true;
      console.log("b.js 执行完毕");
    })(bModule.exports, require);
    bModule.loaded = true;

    var b = require("b.js");
    console.log("a.js 中 b.done =", b.done);
    exports.done = true;
    console.log("a.js 执行完毕");
  });

  console.log("\\nA 模块最终导出:", JSON.stringify(modA.exports));
  console.log("B 模块最终导出:", JSON.stringify(bModule.exports));
  console.log("核心结论：b 拿到 a 时 a 还不完整，而 a 拿到 b 时 b 已完整");
}

simulateCircleDependency();

// ---- 8. node_modules 逐级查找算法 ----
console.log("\\n========== 8. node_modules 查找算法 =====");

function simulateNodeModulesLookup(startDir, moduleName) {
  var parts = startDir.split("/");
  var searchPaths = [];
  for (var i = parts.length; i >= 1; i--) {
    searchPaths.push(parts.slice(0, i).join("/") + "/node_modules/" + moduleName);
  }
  searchPaths.push("/node_modules/" + moduleName);
  return searchPaths;
}

var lookupPaths = simulateNodeModulesLookup("/home/user/project/src/utils", "lodash");
lookupPaths.forEach(function (p, i) {
  console.log("  " + (i + 1) + ". " + p);
});
console.log("Node.js 按顺序查找，找到即停止");

// ---- 9. 模块设计最佳实践 ----
console.log("\\n========== 9. 模块设计最佳实践 =====");

// ❌ 反模式：导出实例（共享状态）
function SharedLogger() {
  this.logs = [];
}
SharedLogger.prototype.log = function (msg) { this.logs.push(msg); };
SharedLogger.prototype.getLogs = function () { return this.logs; };
var shared = new SharedLogger();

// ✅ 正确：导出工厂函数
function createLogger() {
  var logs = [];
  return {
    log: function (msg) { logs.push(msg); },
    getLogs: function () { return logs; },
  };
}

console.log("--- 反模式：导出共享实例 ---");
shared.log("A 记录的日志");
shared.log("B 记录的日志");
console.log("所有调用方共享日志:", shared.getLogs());

console.log("\\n--- 推荐：导出工厂函数 ---");
var loggerA = createLogger();
var loggerB = createLogger();
loggerA.log("A 的日志");
loggerB.log("B 的日志");
console.log("loggerA 日志:", loggerA.getLogs());
console.log("loggerB 日志:", loggerB.getLogs());
console.log("两个实例独立:", loggerA !== loggerB);

console.log("\\n===== CommonJS 模块系统演示完成 =====");`,
  },

  // =========================================================
  // 第四章：ESM 模块系统
  // =========================================================
  {
    id: "node-esm",
    icon: "⚡",
    group: "快速入门",
    title: "ESM 模块系统",
    content: `## ES Modules 简介

ES Modules（ESM）是 ECMAScript 官方标准化的模块系统，从 ES2015（ES6）开始成为 JavaScript 语言标准的一部分。与 CommonJS 不同，ESM 是**静态的**——模块的导入导出在编译时就能确定，这使得打包工具可以进行 tree-shaking（移除未使用的代码）。

### 启用 ESM 的三种方式

在 Node.js 中启用 ESM：

1. **package.json 中设置 \`"type": "module"\`**（推荐，整个包都使用 ESM）
2. 使用 **.mjs** 扩展名（无论 package.json 怎么设置，.mjs 永远是 ESM）
3. 使用 **.cjs** 扩展名强制 CommonJS（在 type: "module" 的包中仍可用）

### ESM 导出语法

\`\`\`javascript
// ===== 命名导出（边定义边导出）=====
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }

// ===== 导出列表（统一导出）=====
const version = '1.0.0';
const name = 'my-lib';
export { version, name };

// ===== 重命名导出 =====
export { version as libVersion, name as libName };

// ===== 默认导出（每个模块只能有一个）=====
export default function main() { /* ... */ }
// 或
export default class App { /* ... */ }

// ===== 重新导出（从其他模块转发）=====
export { default as App } from './App.js';
export * from './utils.js';
\`\`\`

### ESM 导入语法

\`\`\`javascript
// 1. 命名导入
import { PI, add } from './math.js';

// 2. 默认导入
import Calculator from './math.js';

// 3. 混合导入
import Calculator, { PI, add } from './math.js';

// 4. 命名空间导入（全量导入）
import * as math from './math.js';
console.log(math.PI, math.add(1, 2));

// 5. 仅执行副作用（不导入任何内容）
import './init.js';

// 6. 动态导入（返回 Promise，可在任何地方使用）
const module = await import('./math.js');
\`\`\`

### ESM vs CommonJS 对比

| 特性 | CommonJS (CJS) | ES Modules (ESM) |
| --- | --- | --- |
| **语法** | \`require()\` / \`module.exports\` | \`import\` / \`export\` |
| **加载时机** | 运行时，可在条件/循环中调用 | 编译时静态分析，import 必须在顶层 |
| **加载方式** | 同步阻塞 | 异步加载 |
| **this 指向** | 指向 module.exports（初始 {}） | undefined |
| **顶层 await** | 不支持 | 支持 |
| **__dirname / __filename** | 直接可用 | 需要 import.meta.url 转换 |
| **扩展名** | 可省略（.js/.json/.node） | 必须写完整 |
| **循环依赖** | 返回不完整对象 | 活绑定（变量引用，实时更新） |
| **tree-shaking** | 不支持 | 支持（打包时可移除未使用代码） |
| **JSON 导入** | require('./data.json') | 需要 import assertion |

### ESM 的"活绑定"机制

这是 ESM 与 CJS 最重要的区别之一。ESM 的导入是**活绑定**——导入的变量是导出的**引用**，当导出值改变时，导入方也会看到新值：

\`\`\`javascript
// counter.mjs
export let count = 0;
export function increment() { count++; }

// app.mjs
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1（活绑定，看到了变化！）
\`\`\`

而在 CommonJS 中，require 拿到的是值的**副本**：

\`\`\`javascript
// counter.js
let count = 0;
module.exports = {
  get count() { return count; },  // 需要用 getter 才能实现类似效果
  increment() { count++; }
};
\`\`\`

### import.meta —— ESM 中的元数据

ESM 中没有 \`__dirname\` 和 \`__filename\`，用 \`import.meta\` 代替：

\`\`\`javascript
// import.meta.url 是当前模块的 URL（file:// 协议）
console.log(import.meta.url);
// 输出: file:///home/user/project/app.mjs

// 替代 __dirname 和 __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

### 动态 import()

ESM 支持动态导入，返回 Promise。这在按需加载、条件加载等场景中非常有用：

\`\`\`javascript
// 条件加载
if (condition) {
  const module = await import('./special-module.js');
  module.doSomething();
}

// 按需加载（懒加载）
button.addEventListener('click', async () => {
  const { default: Chart } = await import('./chart.js');
  new Chart().render();
});

// 错误处理
try {
  const module = await import('./might-not-exist.js');
} catch (err) {
  console.log('模块加载失败:', err.message);
}
\`\`\`

### ESM 与 CommonJS 互操作

| 场景 | 是否支持 | 说明 |
| --- | --- | --- |
| ESM 中导入 CJS（默认导入） | ✅ | \`import cjs from './mod.cjs'\` → 拿到 module.exports |
| ESM 中导入 CJS（命名导入） | ✅ | \`import { method } from './mod.cjs'\` → 自动解构 |
| CJS 中导入 ESM（动态 import） | ✅ | \`const esm = await import('./mod.mjs')\` |
| CJS 中 require ESM | ❌ | 不能用 require 加载 ESM 模块 |

### package.json 中的 "type" 字段

\`\`\`json
{
  "type": "module"   // 整个包下 .js 文件默认使用 ESM
}
\`\`\`

设置后：
- .js 文件 → 默认 ESM
- .cjs 文件 → 强制 CommonJS
- .mjs 文件 → 强制 ESM

不设置 \`"type"\` 或设置为 \`"commonjs"\` 时：
- .js 文件 → 默认 CommonJS
- .mjs 文件 → 强制 ESM
- .cjs 文件 → 强制 CommonJS

### 顶层 await

ESM 模块支持在模块顶层直接使用 await（不需要 async 函数包裹）：

\`\`\`javascript
// config.mjs
import fs from 'fs/promises';
const configData = await fs.readFile('./config.json', 'utf8');
export const config = JSON.parse(configData);
\`\`\`

这大大简化了需要在模块初始化时进行异步操作的场景。但注意：**导入顶层 await 模块的模块，会等待它完成后再执行**。

---

### 「底层原理」

#### ESM 模块的三阶段加载过程

ESM 与 CommonJS 最根本的区别在于加载方式。CommonJS 是**运行时同步加载**，而 ESM 分为三个独立阶段，这也是它能支持 tree-shaking 和顶层 await 的原因：

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    ESM 模块加载三阶段                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① 构造（Construction）── 同步，可并行                            │
│     ├─ 下载/读取模块文件                                         │
│     ├─ 解析 import/export 语句，解析为 Module Record             │
│     └─ 将所有模块加入模块图（Module Graph），但不执行代码          │
│     ↓                                                           │
│  ② 实例化（Instantiation）── 同步                                │
│     ├─ 为所有 export 创建绑定（内存地址）                         │
│     ├─ 将 import 指向对应 export 的内存地址（活绑定的基础）        │
│     └─ 此时还没有执行代码，export 的值是 undefined                │
│     ↓                                                           │
│  ③ 求值（Evaluation）── 可异步（顶层 await）                     │
│     ├─ 按依赖拓扑顺序执行模块代码                                 │
│     ├─ 遇到顶层 await 时，暂停当前模块，等待异步操作完成           │
│     └─ 执行完毕后，export 绑定被填充为实际值                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

这与 CommonJS 的关键不同：
- CJS 是**边加载边执行**：执行到 require 时才同步加载依赖，加载完立即执行
- ESM 是**先全部解析，再建立绑定，最后执行**：import 语句会被"提升"到模块顶部

#### 活绑定（Live Binding）的底层机制

ESM 的活绑定之所以能在导出值变化时自动更新，是因为 import 拿到的不是值的副本，而是**指向 export 绑定的引用**：

\`\`\`
// ESM 内存模型（简化）

模块 counter.mjs 的 Module Environment Record:
┌─────────────────────────────────────────┐
│  Export Bindings（导出绑定表）           │
│  ┌──────────┬───────────────────────┐  │
│  │ 名称     │ 指向的内存位置         │  │
│  ├──────────┼───────────────────────┤  │
│  │ count    │ → 0x7ffd8a... (实际值) │  │
│  │ increment│ → 0x7ffd8b... (函数)   │  │
│  └──────────┴───────────────────────┘  │
└─────────────────────────────────────────┘

模块 app.mjs 的 Module Environment Record:
┌─────────────────────────────────────────┐
│  Import Bindings（导入绑定表）           │
│  ┌──────────┬───────────────────────┐  │
│  │ 名称     │ 指向的内存位置         │  │
│  ├──────────┼───────────────────────┤  │
│  │ count    │ → counter.count 的位置 │  │ ← 直接指向源模块的内存！
│  │ increment│ → counter.increment    │  │
│  └──────────┴───────────────────────┘  │
└─────────────────────────────────────────┘

当 increment() 修改 count 时，修改的是同一块内存，
所以 app.mjs 中读取 count 总是拿到最新值。
\`\`\`

而 CommonJS 的 require 是在执行时**拷贝** module.exports 的属性值（或拷贝对象引用），没有这种直接内存绑定。

#### 顶层 await 如何暂停模块执行

顶层 await 让模块求值阶段可以异步暂停。Node.js 使用 **Async Module Evaluation** 算法处理：

\`\`\`
async function evaluateModule(module) {
  // 先求值所有依赖
  for (const dep of module.dependencies) {
    if (!dep.evaluated) {
      await evaluateModule(dep); // 等待依赖完成
    }
  }

  // 执行模块代码，如果顶层有 await，这里会暂停
  await module.execute();

  module.evaluated = true;
  // 通知所有等待此模块的父模块继续执行
}
\`\`\`

这意味着：如果 A import B，B 有顶层 await，那么 A 的执行会被推迟到 B 的 await 完成。这形成了一个隐式的依赖等待链。

#### import.meta 的内部结构

\`import.meta\` 是 V8 在模块实例化阶段创建的一个普通 JS 对象，由宿主环境（Node.js）填充属性：

| 属性 | 值 | 设置方 |
| --- | --- | --- |
| \`import.meta.url\` | 当前模块的 file:// URL | Node.js 内部 |
| \`import.meta.resolve(specifier)\` | 解析模块说明符为绝对 URL | Node.js (v16+) |

\`\`\`javascript
// import.meta 不是模块作用域的变量，而是一个特殊的语法结构
// V8 在解析时识别 import.meta 并在运行时从 HostGetImportMetaProperties 获取属性
\`\`\`

---

### 「常见陷阱」

#### 陷阱 1：ESM 中忘记写文件扩展名

CommonJS 可以省略 .js/.json 扩展名，但 ESM 中**必须**写完整路径，包括扩展名。

\`\`\`javascript
// ❌ 错误：ESM 不支持省略扩展名
import { add } from './math';    // ERR_MODULE_NOT_FOUND
import config from './config';   // ERR_MODULE_NOT_FOUND

// ✅ 正确：必须写完整路径和扩展名
import { add } from './math.js';
import config from './config.json' assert { type: 'json' };
import utils from './utils/index.js';
\`\`\`

注意：\`import fs from 'fs'\`（核心模块和第三方包）不需要写扩展名，Node.js 会在包内部通过 exports/main 字段解析。

#### 陷阱 2：ESM 中 this 是 undefined，不要用 this 指向 exports

在 CommonJS 中，模块顶层的 \`this\` 指向 \`module.exports\`；在 ESM 中，顶层 \`this\` 是 \`undefined\`。

\`\`\`javascript
// ❌ 错误：在 ESM 中用 this 导出
// app.mjs
this.greeting = 'hello'; // this 是 undefined，报错！
// TypeError: Cannot set property 'greeting' of undefined

// ✅ 正确：使用 export 语法
export const greeting = 'hello';
\`\`\`

同样，ESM 中没有 \`__dirname\`、\`__filename\`、\`require\`、\`module\`、\`exports\` 这些 CommonJS 变量。

#### 陷阱 3：在 ESM 中 require JSON 需要 import assertion

CommonJS 可以直接 \`require('./data.json')\`，但 ESM 中导入 JSON 需要显式声明类型。

\`\`\`javascript
// ❌ 错误：ESM 中直接导入 JSON（无 assert）
import data from './data.json';
// 旧 Node.js 版本：ERR_IMPORT_ASSERTION_TYPE_MISSING
// Node.js v22+ 可能自动推断，但最好显式声明

// ✅ 正确：使用 import assertion（import attributes）
import data from './data.json' assert { type: 'json' };
// 或使用 createRequire 兼容 CJS 方式
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const data = require('./data.json');
\`\`\`

#### 陷阱 4：顶层 await 导致的死锁和性能问题

顶层 await 虽然方便，但滥用可能导致整个模块树无法执行（死锁），或启动时间变长。

\`\`\`javascript
// ❌ 危险：顶层 await 等待永不 resolve 的 Promise
// deadlock.mjs
await new Promise(() => {}); // 永远 pending！
// 所有 import deadlock.mjs 的模块都会卡住，永远无法执行

// ❌ 差：顶层 await 串行等待多个异步操作
// config.mjs
const a = await fetchA(); // 等 a 完成
const b = await fetchB(); // 再等 b 完成（如果 a 和 b 独立，这是浪费）

// ✅ 好：独立的异步操作使用 Promise.all 并行
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// ✅ 好：不需要在模块初始化时完成的异步操作，放到函数中延迟执行
export async function initialize() {
  // 延迟初始化，由调用方决定何时执行
  const data = await loadData();
  return data;
}
\`\`\`

#### 陷阱 5：ESM 和 CJS 互操作时默认导入的混淆

在 ESM 中导入 CJS 模块时，默认导入拿到的是 \`module.exports\`，而命名导入是 Node.js 自动做的静态分析解构，但这并非总是能正确工作。

\`\`\`javascript
// cjs-module.cjs
module.exports = { name: 'cjs', version: '1.0.0' };

// ❌ 问题：命名导入在某些情况下不工作
// app.mjs
import { name } from './cjs-module.cjs'; // 可能在旧版本不支持或行为不一致

// ✅ 正确：导入 CJS 模块时优先使用默认导入
import cjs from './cjs-module.cjs';
console.log(cjs.name);    // 'cjs'
console.log(cjs.version); // '1.0.0'

// ❌ 错误：在 CJS 中直接 require ESM 模块
// app.cjs
const esm = require('./esm-module.mjs');
// ERR_REQUIRE_ESM: Must use import to load ES Module

// ✅ 正确：CJS 中用动态 import() 加载 ESM
async function loadEsm() {
  const esm = await import('./esm-module.mjs');
  console.log(esm.default, esm.namedExport);
}
\`\`\`

---

### 「性能提示」

#### 1. ESM 支持 tree-shaking，优先使用命名导出而非默认导出

打包工具（Rollup、esbuild、Webpack）在 ESM 模式下可以静态分析导入导出，移除未使用的代码（tree-shaking）。命名导出比默认导出更容易被静态分析。

\`\`\`javascript
// ✅ 推荐：命名导出便于 tree-shaking
// utils.mjs
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b) { return a / b; }

// 使用方
import { add } from './utils.js'; // 打包时 subtract/multiply/divide 可被移除

// ⚠️ 默认导出的对象无法被 tree-shaking 细化
// utils.mjs
export default { add, subtract, multiply, divide }; // 整个对象作为一个导出

// app.mjs
import utils from './utils.js';
// 打包工具无法移除 subtract/multiply/divide，因为它们在同一个对象上
\`\`\`

对于库作者，推荐使用**命名导出**作为主要导出方式，默认导出仅用于模块的主要功能。

#### 2. 使用 exports 字段定义包的公共 API，提升解析性能和封装性

在 package.json 中使用 \`exports\` 字段替代旧的 \`main\` 字段，可以明确暴露公共 API，同时让 Node.js 更快解析模块路径（不需要尝试多种扩展名和目录索引）。

\`\`\`json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
    "./package.json": "./package.json"
  }
}
\`\`\`

性能收益：
- Node.js 不需要尝试 .js/.json/.node 等扩展名补全
- 不需要检查目录下的 package.json 和 index.js
- 避免通过深层路径导入内部文件（\`require('pkg/dist/internal/helper.js')\`）
- 支持条件导出，CJS 和 ESM 用户各自加载对应格式

#### 3. 避免在模块顶层执行重型计算，利用 ESM 的异步加载能力

CommonJS 中模块顶层只能执行同步代码，重型计算会阻塞整个 require 链。ESM 的顶层 await 允许异步初始化，但要注意并行化。

\`\`\`javascript
// ❌ 差：CommonJS 模式的同步初始化（在 ESM 中也能写，但不推荐）
// db.mjs
import { createPoolSync } from 'mysql2';
export const pool = createPoolSync({ /* ... */ }); // 同步阻塞！

// ✅ 好：ESM 中使用异步初始化
// db.mjs
import mysql from 'mysql2/promise';
export const pool = await mysql.createPool({ /* ... */ }); // 异步，不阻塞主线程

// ✅ 更好：导出一个初始化 Promise，让使用方控制时机
// db.mjs
import mysql from 'mysql2/promise';
let pool = null;
export async function getPool() {
  if (!pool) {
    pool = await mysql.createPool({ /* ... */ });
  }
  return pool;
}
// 这样做的好处：
// 1. 不使用顶层 await，模块导入不会等待连接建立
// 2. 延迟到真正需要数据库时才连接
// 3. 支持优雅地处理连接失败重试
\`\`\``,
    code: `// ============================================================
// 第四章代码演示：ESM 模块系统概念
// 在 CommonJS 沙箱中用 require 模拟 ESM 的核心概念
// ============================================================

// ---- 1. 模拟 ESM 命名导出与导入 ----
console.log("========== 1. 模拟 ESM 命名导出 =====");

// 模拟 math.mjs 中的 ESM 导出
// 真实 ESM: export const PI = 3.14159;
//           export function add(a, b) { return a + b; }
var mathModule = {
  PI: 3.14159,
  E: 2.71828,
  add: function (a, b) { return a + b; },
  subtract: function (a, b) { return a - b; },
  multiply: function (a, b) { return a * b; },
  divide: function (a, b) { return b !== 0 ? a / b : "错误"; },
};

// 模拟 ESM 命名导入
// 真实 ESM: import { PI, add, multiply } from './math.mjs';
var PI_esm = mathModule.PI;
var add_esm = mathModule.add;
var multiply_esm = mathModule.multiply;

console.log("PI =", PI_esm);
console.log("add(3, 7) =", add_esm(3, 7));
console.log("multiply(6, 7) =", multiply_esm(6, 7));

// ---- 2. 模拟 ESM 默认导出 ----
console.log("\\n========== 2. 模拟 ESM 默认导出 =====");

// 模拟 calculator.mjs 中的默认导出
// 真实 ESM: export default class Calculator { ... }
Calculator = function () {
  this.result = 0;
};
Calculator.prototype.add = function (n) { this.result += n; return this; };
Calculator.prototype.subtract = function (n) { this.result -= n; return this; };
Calculator.prototype.getValue = function () { return this.result; };
Calculator.prototype.reset = function () { this.result = 0; return this; };

// 模拟 ESM 默认导入
// 真实 ESM: import Calculator from './calculator.mjs';
var calc = new Calculator();
calc.add(10).add(5).subtract(3);
console.log("Calculator 计算结果:", calc.getValue());

// ---- 3. 模拟 ESM 命名空间导入 ----
console.log("\\n========== 3. 模拟 ESM 命名空间导入 =====");

// 模拟 utils.mjs 导出多个值
// 真实 ESM: export const version = '1.0.0';
//           export function formatDate(d) { ... }
//           export function capitalize(s) { ... }
var utilsModule = {
  version: "1.0.0",
  formatDate: function (date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  },
  capitalize: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  truncate: function (str, len) {
    return str.length > len ? str.slice(0, len) + "..." : str;
  },
};

// 模拟 ESM 命名空间导入
// 真实 ESM: import * as utils from './utils.mjs';
var utils = utilsModule;

console.log("版本:", utils.version);
console.log("格式化日期:", utils.formatDate(new Date()));
console.log("首字母大写:", utils.capitalize("hello"));
console.log("截断文本:", utils.truncate("这是一段很长的文本内容", 8));

// ---- 4. 模拟 ESM 活绑定（Live Binding） ----
console.log("\\n========== 4. 模拟 ESM 活绑定 =====");

// ESM 的活绑定：导入的变量是导出的引用
// 当导出值改变时，导入方也会看到新值
// 在 CommonJS 中，我们需要用 getter 来模拟

var counterState = { count: 0 };
var counterModule = {
  // 使用 getter 模拟活绑定
  get count() { return counterState.count; },
  increment: function () { counterState.count++; },
  decrement: function () { counterState.count--; },
  reset: function () { counterState.count = 0; },
};

// 模拟 ESM 导入
// 真实 ESM: import { count, increment } from './counter.mjs';
var count_accessor = counterModule.count;
console.log("初始 count:", count_accessor); // 0
counterModule.increment();
counterModule.increment();
console.log("两次 increment 后 count:", counterModule.count); // 2
console.log("这就是活绑定——导入方看到的是实时值");

// 对比 CommonJS 的值拷贝
var cjsCopy = counterModule.count; // 2（此时的值拷贝）
counterModule.increment();
console.log("CJS 值拷贝:", cjsCopy, "（还是 2，没有更新）");
console.log("ESM 活绑定:", counterModule.count, "（3，实时更新）");

// ---- 5. 模拟动态 import() ----
console.log("\\n========== 5. 模拟动态 import() =====");

// 动态 import() 返回 Promise，可以在任何地方使用
// 真实 ESM: const module = await import('./math.mjs');

function dynamicImport(moduleName) {
  return new Promise(function (resolve) {
    // 模拟异步加载模块
    var modules = {
      "./math.mjs": mathModule,
      "./utils.mjs": utilsModule,
      "./counter.mjs": counterModule,
    };
    // 模拟短暂延迟
    setTimeout(function () {
      resolve(modules[moduleName] || null);
    }, 50);
  });
}

console.log("开始动态导入...");
dynamicImport("./math.mjs").then(function (mod) {
  console.log("动态导入成功！");
  console.log("  PI =", mod.PI);
  console.log("  add(10, 20) =", mod.add(10, 20));
});

// 模拟条件加载
console.log("\\n条件加载示例:");
var featureEnabled = true;
if (featureEnabled) {
  dynamicImport("./utils.mjs").then(function (mod) {
    console.log("  条件加载 utils.mjs 成功");
    console.log("  version:", mod.version);
  });
}

// 模拟错误处理
console.log("\\n错误处理示例:");
dynamicImport("./not-exist.mjs").then(function (mod) {
  if (mod === null) {
    console.log("  模块不存在，使用降级方案");
  }
});

// ---- 6. import.meta 模拟 ----
console.log("\\n========== 6. import.meta 模拟 =====");

var path = require("path");

// 在 ESM 中，import.meta.url 是当前模块的 file:// URL
// 在 CommonJS 中，我们使用 __filename 和 __dirname
console.log("CommonJS __filename:", __filename);
console.log("CommonJS __dirname:", __dirname);

// 模拟 ESM 的方式获取 __dirname
function simulateImportMetaUrl(filePath) {
  return "file://" + filePath;
}

function simulateFileURLToPath(url) {
  return url.replace("file://", "");
}

var metaUrl = simulateImportMetaUrl(__filename);
console.log("ESM import.meta.url:", metaUrl);
console.log("ESM __filename:", simulateFileURLToPath(metaUrl));

// ---- 7. ESM 重导出模拟 ----
console.log("\\n========== 7. 模拟 ESM 重导出 =====");

// 模拟一个聚合模块，把多个模块的导出聚合在一起
// 真实 ESM:
//   export { PI, add } from './math.mjs';
//   export { formatDate } from './utils.mjs';
//   export { default as Calculator } from './calculator.mjs';

var aggregateModule = {
  // 从 math 模块转发的导出
  PI: mathModule.PI,
  add: mathModule.add,
  // 从 utils 模块转发的导出
  formatDate: utilsModule.formatDate,
  // 默认导出
  Calculator: Calculator,
};

console.log("聚合模块导出:");
console.log("  PI:", aggregateModule.PI);
console.log("  add(1, 2):", aggregateModule.add(1, 2));
console.log("  formatDate:", aggregateModule.formatDate(new Date()));

// ---- 8. ESM 与 CJS 互操作模拟 ----
console.log("\\n========== 8. ESM 与 CJS 互操作 =====");

// 模拟 CJS 模块
// module.exports = { name: 'cjs-module', version: '1.0.0' };
var cjsModule = { name: "cjs-module", version: "1.0.0" };

// 模拟 ESM 中导入 CJS 模块
// ESM 默认导入：import cjs from './mod.cjs' → 拿到 module.exports
var cjsDefault = cjsModule;
console.log("ESM 默认导入 CJS:", cjsDefault.name);

// ESM 命名导入 CJS：import { name, version } from './mod.cjs'
// Node.js 会自动解构 module.exports
var cjsName = cjsModule.name;
var cjsVersion = cjsModule.version;
console.log("ESM 命名导入 CJS:", cjsName, cjsVersion);

// 模拟 CJS 中动态导入 ESM
// 这是 CJS 中使用 ESM 的唯一方式
console.log("\\nCJS 中动态导入 ESM:");
dynamicImport("./math.mjs").then(function (esmMod) {
  console.log("  CJS 成功导入 ESM 模块");
  console.log("  PI =", esmMod.PI);
});

// ---- 9. package.json type 字段模拟 ----
console.log("\\n========== 9. package.json type 字段 =====");

var fs = require("fs");
var path = require("path");

// 读取当前项目的 package.json 查看 type 字段
var pkgPath = path.join(process.cwd(), "package.json");
try {
  var pkgContent = fs.readFileSync(pkgPath, "utf8");
  var pkg = JSON.parse(pkgContent);
  var type = pkg.type || "commonjs（默认）";
  console.log("package.json type 字段:", type);
  console.log("当前模块系统:", type === "module" ? "ESM" : "CommonJS（默认）");
} catch (e) {
  console.log("无法读取 package.json:", e.message);
  console.log("默认模块系统: CommonJS");
}

// 解释 .mjs / .cjs 扩展名
console.log("\\n.mjs 扩展名：始终是 ESM（无论 package.json type 设置）");
console.log(".cjs 扩展名：始终是 CommonJS（无论 package.json type 设置）");

// ---- 10. 模块系统总结对比 ----
console.log("\\n========== 10. ESM vs CommonJS 总结 =====");

var comparison = [
  { 特性: "语法", CommonJS: "require / module.exports", ESM: "import / export" },
  { 特性: "加载时机", CommonJS: "运行时", ESM: "编译时静态分析" },
  { 特性: "加载方式", CommonJS: "同步阻塞", ESM: "异步加载" },
  { 特性: "this 指向", CommonJS: "module.exports", ESM: "undefined" },
  { 特性: "顶层 await", CommonJS: "不支持", ESM: "支持" },
  { 特性: "扩展名", CommonJS: "可省略", ESM: "必须写完整" },
  { 特性: "循环依赖", CommonJS: "返回不完整对象", ESM: "活绑定（引用）" },
  { 特性: "tree-shaking", CommonJS: "不支持", ESM: "支持" },
];
console.table(comparison);

console.log("\\n===== ESM 模块系统演示完成 =====");`,
  },

  // =========================================================
  // 第五章：package.json 详解
  // =========================================================
  {
    id: "node-package-json",
    icon: "📋",
    group: "快速入门",
    title: "package.json 详解",
    content: `## package.json 是什么？

\`package.json\` 是每个 Node.js 项目的**核心配置文件**。它位于项目根目录，包含了项目的元数据、依赖关系、脚本命令等信息。npm（Node Package Manager）依赖它来管理项目的依赖和运行脚本。

一个最小的 package.json 只需要 \`name\` 和 \`version\` 两个字段。

### 核心字段详解

#### name（必填）
包名，发布到 npm 注册表时的唯一标识。规则：
- 必须小写
- 只能包含连字符（-）和下划线（_）
- 长度不超过 214 个字符
- 不能以点（.）或下划线（_）开头

\`\`\`json
{ "name": "my-awesome-project" }
\`\`\`

#### version（必填）
遵循**语义化版本号（SemVer）**规范：\`主版本号.次版本号.修订号\`

| 版本号位置 | 含义 | 何时递增 |
| --- | --- | --- |
| 主版本号（Major） | 不兼容的 API 修改 | 1.0.0 → 2.0.0 |
| 次版本号（Minor） | 向下兼容的功能新增 | 1.0.0 → 1.1.0 |
| 修订号（Patch） | 向下兼容的问题修正 | 1.0.0 → 1.0.1 |

预发布版本可以加后缀：\`1.0.0-alpha.1\`、\`2.0.0-beta.3\`、\`3.0.0-rc.1\`

#### description
包的简短描述，显示在 npm 搜索结果中。

#### main
包的入口文件。当别人 \`require('my-package')\` 时，加载的文件。

\`\`\`json
{ "main": "dist/index.js" }
\`\`\`

默认值为 \`index.js\`，不设置时 Node.js 会尝试加载根目录的 index.js。

#### scripts
定义可以通过 npm run 执行的脚本命令。这是最重要的字段之一：

\`\`\`json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production",
    "test": "jest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
\`\`\`

**内置脚本名**（不需要 npm run 前缀，直接用 npm test 等）：
- \`npm start\` → 执行 scripts.start
- \`npm test\` → 执行 scripts.test
- \`npm restart\` → 执行 scripts.restart
- \`npm stop\` → 执行 scripts.stop

#### dependencies
项目运行时需要的依赖（生产依赖）：

\`\`\`json
{
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "~4.17.21",
    "axios": "1.6.0"
  }
}
\`\`\`

版本号前的符号含义：
- \`^\`：兼容主版本（^4.18.2 = >=4.18.2 <5.0.0）
- \`~\`：兼容次版本（~4.17.21 = >=4.17.21 <4.18.0）
- \`*\`：任意版本
- 无符号：精确版本

#### devDependencies
仅在开发时需要的依赖（测试框架、构建工具、代码检查等）：

\`\`\`json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
\`\`\`

\`npm install --production\` 不会安装 devDependencies。

#### peerDependencies
对等依赖——告诉使用者"你需要安装以下依赖"。常用于插件开发：

\`\`\`json
{
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
\`\`\`

npm 7+ 会自动安装 peerDependencies，遇到冲突会报错终止。

#### engines
指定项目需要的 Node.js 和 npm 版本：

\`\`\`json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
\`\`\`

#### private
设为 true 时，防止意外发布到 npm 注册表：

\`\`\`json
{ "private": true }
\`\`\`

#### exports（Node.js 12.7+）
比 main 更强大的模块封装，精确控制包的哪些部分可被访问：

\`\`\`json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
    "./package.json": "./package.json"
  }
}
\`\`\`

一旦定义 exports，外部就不能 \`require('my-package/dist/internal.js')\`——只有 exports 中声明的路径才能被访问。

**条件导出**（同一个包在 ESM 和 CJS 中加载不同文件）：

\`\`\`json
{
  "exports": {
    ".": {
      "import": "./esm/index.mjs",
      "require": "./cjs/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
\`\`\`

#### files
指定发布到 npm 时包含的文件（白名单模式）：

\`\`\`json
{
  "files": ["dist/", "README.md", "LICENSE"]
}
\`\`\`

#### type
指定模块系统："module" 表示 ESM，"commonjs" 表示 CommonJS。

#### workspaces
Monorepo 支持，定义工作区：

\`\`\`json
{
  "workspaces": ["packages/*"]
}
\`\`\`

### 语义化版本号（SemVer）深入

\`\`\`
版本号格式：主版本号.次版本号.修订号[-预发布标签]

1.0.0     → 正式发布
1.0.1     → 修复 bug（修订号递增）
1.1.0     → 新增功能（次版本号递增）
2.0.0     → 不兼容的 API 变更（主版本号递增）
1.0.0-alpha.1  → 内部测试版
1.0.0-beta.1   → 公开测试版
1.0.0-rc.1     → 发布候选版
\`\`\`

### package-lock.json 的作用

\`package-lock.json\` 是 npm 自动生成的锁文件，它**精确记录**了安装的每个包的版本和依赖树。它的作用是：

1. **确保一致性**：团队成员或 CI/CD 环境安装的依赖版本完全一致
2. **加速安装**：npm 可以跳过依赖解析，直接从 lock 文件读取版本
3. **安全性**：锁定版本，防止依赖更新的恶意代码被引入

**重要规则**：package-lock.json **必须提交到 Git 仓库**。

### npm install 的工作原理

\`\`\`
npm install 的执行流程：

1. 读取 package.json，获取依赖列表
2. 检查 node_modules 和 package-lock.json
3. 如果 lock 文件存在，按 lock 文件安装（精确版本）
4. 如果 lock 文件不存在，解析版本范围，生成依赖树
5. 下载依赖包到 node_modules
6. 生成/更新 package-lock.json
7. 执行依赖的 postinstall 脚本（如果有）
\`\`\`

### 其他重要字段

| 字段 | 说明 |
| --- | --- |
| \`license\` | 开源许可证（MIT、ISC、Apache-2.0 等） |
| \`author\` | 作者信息 |
| \`contributors\` | 贡献者列表 |
| \`keywords\` | 关键词数组，用于 npm 搜索 |
| \`repository\` | 代码仓库地址 |
| \`bugs\` | 问题追踪地址 |
| \`homepage\` | 项目主页 |
| \`browserslist\` | 目标浏览器配置（给 Babel 等工具使用） |
| \`sideEffects\` | 是否包含副作用（给 Webpack tree-shaking 使用） |
| \`overrides\` | 覆盖嵌套依赖的版本（npm 8.3+） |

---

### 「底层原理」

#### npm install 的依赖解析算法（Arborist）

npm v7+ 使用名为 **Arborist** 的依赖树管理工具，它负责解析依赖、构建 node_modules 树。其核心算法是**广度优先遍历 + 去重提升**：

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                    npm install 依赖树构建过程                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 读取 package.json 的 dependencies/devDependencies       │
│     构建顶层依赖列表                                          │
│                      │                                       │
│                      ▼                                       │
│  2. 广度优先遍历所有依赖及其子依赖                             │
│     - 为每个包查询 npm registry，获取版本信息                  │
│     - 根据 SemVer 范围选择最合适的版本                        │
│     - 记录依赖关系图                                          │
│                      │                                       │
│                      ▼                                       │
│  3. 扁平化（Deduplication / Hoisting）                       │
│     - 尽量将依赖"提升"到顶层 node_modules                     │
│     - 当同一包有多个版本需求时：                               │
│       · 最常被依赖的版本 → 提升到顶层                         │
│       · 不兼容的版本 → 保留在父包的 node_modules 中           │
│                      │                                       │
│                      ▼                                       │
│  4. 计算完整性校验（SHA-512），检查包的完整性                  │
│     对比 package-lock.json 中的 integrity 字段                │
│                      │                                       │
│                      ▼                                       │
│  5. 下载包到缓存目录 → 解压到 node_modules                    │
│     - npm 缓存: ~/.npm/_cacache/                             │
│     - 使用硬链接/符号链接减少磁盘占用                          │
│                      │                                       │
│                      ▼                                       │
│  6. 执行生命周期脚本（preinstall → install → postinstall）   │
│     注意：postinstall 脚本可执行任意代码，存在安全风险         │
│                      │                                       │
│                      ▼                                       │
│  7. 生成/更新 package-lock.json                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
\`\`\`

#### package-lock.json 的内部结构

lock 文件精确记录了依赖树中每个包的信息，保证不同环境安装结果一致：

\`\`\`json
{
  "name": "my-project",
  "version": "1.0.0",
  "lockfileVersion": 3,  // lock 文件格式版本（npm v9+ 使用版本3）
  "packages": {
    // 键是包在 node_modules 中的路径
    "": {
      "name": "my-project",
      "dependencies": { "express": "^4.18.2" }
    },
    "node_modules/express": {
      "version": "4.18.2",           // 实际安装的精确版本
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-...",     // SHA-512 完整性校验
      "dependencies": { /* ... */ },
      "engines": { "node": ">= 0.10.0" }
    },
    "node_modules/express/node_modules/debug": {
      "version": "2.6.9",  // 嵌套依赖（版本与顶层不兼容时才会嵌套）
    }
  }
}
\`\`\`

lockfileVersion 说明：
- v1：npm v5-v6 使用的旧格式
- v2：npm v7-v8，支持 workspaces
- v3：npm v9+，格式优化，性能更好

#### SemVer 版本范围匹配算法

npm 使用 \`semver\` 包解析版本范围，核心规则如下：

| 符号 | 示例 | 匹配范围 | 说明 |
| --- | --- | --- | --- |
| 无 | \`1.2.3\` | 精确匹配 \`1.2.3\` | 钉死版本 |
| \`^\` | \`^1.2.3\` | \`>=1.2.3 <2.0.0\` | 兼容：不改变最左非零数字 |
| \`^\` | \`^0.2.3\` | \`>=0.2.3 <0.3.0\` | 0.x 版本特殊：次版本视为不兼容 |
| \`^\` | \`^0.0.3\` | \`=0.0.3\` | 0.0.x 版本：精确匹配 |
| \`~\` | \`~1.2.3\` | \`>=1.2.3 <1.3.0\` | 近似：只允许修订号更新 |
| \`>\` \`>=\` | \`>=1.2.0\` | 大于等于 | 范围 |
| \`-\` | \`1.0.0 - 2.0.0\` | \`>=1.0.0 <=2.0.0\` | 闭区间 |
| \`x\` | \`1.x\` | \`>=1.0.0 <2.0.0\` | 通配符 |

**重要**：0.x.y 版本在 SemVer 规范中被视为初始开发阶段，\`^\` 的行为不同——次版本号变化也被认为可能不兼容。

#### scripts 命令的执行机制（npm run）

执行 \`npm run script-name\` 时，npm 做了以下事情：

\`\`\`
npm run build

1. 在 package.json 的 scripts 中查找 "build" 命令
        │
        ▼
2. 将 node_modules/.bin 临时加入 PATH 环境变量
   （这样可以直接调用本地安装的命令，如 webpack、eslint）
        │
        ▼
3. 使用系统 shell 执行命令字符串
   - Unix: /bin/sh -c "command"
   - Windows: cmd.exe /d /s /c "command"
        │
        ▼
4. 注入 npm_package_* 环境变量（package.json 各字段）
   注入 npm_config_* 环境变量（npm 配置）
        │
        ▼
5. 等待命令执行，传递退出码
\`\`\`

这就是为什么在 scripts 中可以直接写 \`"build": "webpack"\` 而不需要 \`./node_modules/.bin/webpack\`——npm 已经把 \`.bin\` 目录加到 PATH 里了。

#### npm 缓存机制

npm 使用**内容寻址缓存**（Content-Addressable Cache）存储下载的包：

\`\`\`
~/.npm/_cacache/
├── content-v2/          # 按 SHA 哈希存储的包内容
│   └── sha512/
│       └── a0/
│           └── b1/
│               └── <hash> → 实际包文件
└── index-v5/            # 元数据索引（URL → 哈希映射）
\`\`\`

同一个包版本只在缓存中存储一次，多个项目可共享。缓存永不自动删除，需手动 \`npm cache clean --force\`。

---

### 「常见陷阱」

#### 陷阱 1：dependencies 和 devDependencies 混淆

把开发依赖放到 dependencies 中会导致生产环境安装不必要的包，增加部署时间和镜像体积；把运行时依赖放到 devDependencies 中则会导致生产环境运行时找不到模块。

\`\`\`bash
# ❌ 错误：安装时不加 --save-dev/-D，开发依赖进入 dependencies
npm install jest     # jest 跑到 dependencies 里了！
npm install eslint   # eslint 也跑错地方了

# ✅ 正确：开发依赖必须加 -D
npm install jest --save-dev
npm install eslint -D

# ✅ 正确：运行时依赖不加 -D
npm install express
npm install lodash

# 安装生产依赖（仅 dependencies）：
npm install --production  # 或 --omit=dev
# 这在 Dockerfile 构建中很重要，能大幅减少镜像层大小
\`\`\`

区分原则：
- **dependencies**：代码运行时 \`require()\` / \`import\` 的包（express、lodash、react）
- **devDependencies**：构建工具、测试框架、代码检查器（webpack、jest、eslint、prettier、typescript）

#### 陷阱 2：忽略 package-lock.json 导致依赖版本不一致

\`\`\`bash
# ❌ 错误：将 package-lock.json 加入 .gitignore
# echo "package-lock.json" >> .gitignore
# 后果：每个团队成员 npm install 得到的版本可能不同
#       "我本地能跑，你那怎么不行？"

# ✅ 正确：package-lock.json 必须提交到 Git
# 它保证所有人安装的依赖版本完全一致
#
# 例外场景：
# - 如果你发布的是一个库（library），可以考虑不提交 lock 文件
#   因为库的使用者不使用你的 lock 文件
# - 如果你开发的是应用（app/service），必须提交 lock 文件
\`\`\`

什么时候需要更新 lock 文件？
- 修改 package.json 中的依赖版本后：\`npm install\` 会自动更新
- 主动更新依赖：\`npm update <package>\` 或 \`npm install <pkg>@latest\`
- 修复安全漏洞：\`npm audit fix\`

#### 陷阱 3：在 scripts 中使用跨平台不兼容的命令

npm scripts 最终调用系统 shell，Unix 和 Windows 的命令差异会导致跨平台问题。

\`\`\`json
{
  "scripts": {
    // ❌ 错误：rm -rf 在 Windows 上不存在
    "clean": "rm -rf dist",
    // ❌ 错误：环境变量设置方式不同
    "start": "NODE_ENV=production node app.js",
    // ❌ 错误：&& 在 Windows cmd 中是 & （但在 PowerShell 中也用 &&，所以复杂）
    "build": "mkdir dist && webpack"
  }
}

// ✅ 正确：使用跨平台工具
{
  "scripts": {
    // 使用 rimraf 替代 rm -rf
    "clean": "rimraf dist",
    // 使用 cross-env 设置环境变量
    "start": "cross-env NODE_ENV=production node app.js",
    // mkdir -p 在 Node.js v12+ 可用 fs.mkdirSync recursive
    // 或使用 mkdirp 包
    "build": "mkdirp dist && webpack"
  }
}
\`\`\`

建议安装：\`npm install -D rimraf cross-env mkdirp\`

#### 陷阱 4：版本范围太松（"\*"）或太死（固定版本）

\`\`\`json
{
  "dependencies": {
    // ❌ 危险："*" 允许任意版本，破坏性更新随时可能发生
    "lodash": "*",
    // ❌ 过度锁定：固定版本无法获得 bug 修复和安全更新
    "lodash": "4.17.21",
    // ✅ 推荐：^ 允许兼容更新（大多数包的默认行为）
    "lodash": "^4.17.21",
    // ✅ 推荐：~ 更保守，只接受修订号更新（稳定性要求极高的场景）
    "critical-package": "~2.3.0"
  }
}
\`\`\`

最佳实践：
- 大多数包用 \`^\`（npm install 默认行为）
- 核心基础包（数据库驱动、核心框架）可考虑用 \`~\` 或固定版本
- 永远不要用 \`*\`
- 定期运行 \`npm outdated\` 检查可更新的依赖
- 重大版本升级手动测试：\`npm install pkg@latest\`

#### 陷阱 5：不了解 postinstall 脚本的安全风险

任何包在安装时都可以通过 \`postinstall\` 脚本执行任意代码。这是供应链攻击的常见入口。

\`\`\`bash
# 查看哪些包有 install/postinstall 脚本
npm ls --all | grep -E "install|postinstall"
# 或更直接地：
find node_modules -name "package.json" -exec grep -l "postinstall" {} \;

# ✅ 防护措施：
# 1. 使用 npm audit 检查已知漏洞
npm audit

# 2. 使用 --ignore-scripts 阻止安装脚本执行（安全要求极高的环境）
npm install --ignore-scripts
# 注意：这会导致有原生编译的包（如 node-sass、bcrypt）无法正常工作
# 需要手动对可信包执行 rebuild

# 3. 锁定依赖版本（通过 package-lock.json），防止意外升级到恶意版本
# 4. 使用 npm ci 替代 npm install（严格按 lock 文件安装）
\`\`\`

---

### 「性能提示」

#### 1. 使用 npm ci 替代 npm install 进行 CI/CD 和生产构建

\`npm ci\`（CI 代表 Continuous Integration）是专为自动化环境设计的安装命令，比 \`npm install\` 更快、更可靠。

\`\`\`bash
# ❌ 普通 npm install 在 CI 中的问题：
# - 可能修改 package-lock.json（如果 package.json 与 lock 不一致）
# - 可能安装到不在 lock 文件中的版本
# - 速度较慢（需要解析依赖树）

# ✅ 使用 npm ci：
npm ci
# 要求：必须存在 package-lock.json
# 行为：
#   1. 先删除整个 node_modules 目录
#   2. 严格按照 package-lock.json 安装，不修改 lock 文件
#   3. 速度比 npm install 快 2-10 倍（跳过大版本解析）
#   4. 如果 package.json 与 lock 不一致，直接报错退出（不会静默更新）
\`\`\`

Dockerfile 最佳实践：
\`\`\`dockerfile
# 先复制 package 文件，利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci --omit=dev    # 仅安装生产依赖，且严格按 lock 文件
COPY . .
\`\`\`

#### 2. 合理使用 .npmignore 和 files 字段减小包体积

发布到 npm 的包应该只包含必要的文件，避免将源码、测试文件、配置文件等一起发布。这能加快安装速度、减少磁盘占用。

\`\`\`json
{
  // ✅ 推荐：使用 files 白名单（更安全，不会意外发布敏感文件）
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ]
  // npm 总是自动包含：package.json, README, LICENSE, CHANGELOG
  // npm 总是自动排除：.git, node_modules, .npmrc, .DS_Store 等
}
\`\`\`

\`\`\`bash
# 检查哪些文件会被发布到 npm
npm pack --dry-run

# 或者打包成 tarball 后查看内容
npm pack
tar -tzf *.tgz

# 对比：忽略 .npmignore vs files 白名单
# .npmignore（黑名单）：列出要排除的文件/目录（类似 .gitignore）
# files（白名单）：列出要包含的文件/目录 ← 推荐，更安全
\`\`\`

#### 3. 使用 workspaces 管理 Monorepo，避免重复安装依赖

对于包含多个包的项目（Monorepo），npm workspaces 可以将所有依赖提升到根目录的 node_modules，大幅减少安装时间和磁盘占用。

\`\`\`json
{
  "name": "my-monorepo",
  "private": true,  // 根目录设为 private，防止意外发布
  "workspaces": [
    "packages/*",    // packages 下每个子目录都是一个包
    "apps/*"
  ]
}
\`\`\`

目录结构：
\`\`\`
my-monorepo/
├── package.json
├── package-lock.json
├── node_modules/          # 所有依赖提升到这里
│   ├── express/
│   ├── jest/
│   └── packages/ → ../packages/* （符号链接）
├── packages/
│   ├── utils/             # workspace 包 @myorg/utils
│   │   └── package.json
│   └── ui/                # workspace 包 @myorg/ui
│       └── package.json
└── apps/
    └── web/               # workspace 包 @myorg/web
        └── package.json
\`\`\`

优点：
- 所有依赖安装一次，各包间共享
- 包间互相引用自动链接（\`import { x } from '@myorg/utils'\`）
- 一个 \`npm install\` 安装整个项目的所有依赖
- 比 Lerna 等传统方案更轻量（npm 原生支持）

其他 Monorepo 工具对比：
| 工具 | 特点 |
| --- | --- |
| npm workspaces | 原生、零配置，适合中小型 Monorepo |
| pnpm workspaces | 更快、更省磁盘空间，依赖管理更严格 |
| Turborepo | 在 workspaces 基础上加增量构建缓存 |
| Nx | 功能最全，包含依赖图分析、构建编排 |`,
    code: `// ============================================================
// 第五章代码演示：package.json 详解
// 用 fs 读取和解析 package.json，展示各字段含义
// ============================================================

var fs = require("fs");
var path = require("path");
var os = require("os");

// ---- 1. 读取项目的 package.json ----
console.log("========== 1. 读取 package.json ==========");

var pkgPath = path.join(process.cwd(), "package.json");
var pkg = null;

try {
  var pkgContent = fs.readFileSync(pkgPath, "utf8");
  pkg = JSON.parse(pkgContent);
  console.log("package.json 读取成功！");
  console.log("文件路径:", pkgPath);
} catch (e) {
  // 如果项目中没有 package.json，创建一个模拟的用于演示
  console.log("项目中没有 package.json，使用模拟数据演示");
  console.log("实际路径:", pkgPath);
  pkg = {
    name: "my-awesome-project",
    version: "1.0.0",
    description: "一个演示项目",
    main: "dist/index.js",
    type: "commonjs",
    private: true,
    scripts: {
      start: "node index.js",
      dev: "nodemon index.js",
      build: "webpack --mode production",
      test: "jest --coverage",
      lint: "eslint src/",
    },
    dependencies: {
      express: "^4.18.2",
      lodash: "~4.17.21",
      axios: "1.6.0",
    },
    devDependencies: {
      jest: "^29.0.0",
      eslint: "^8.0.0",
      typescript: "^5.0.0",
    },
    keywords: ["nodejs", "demo", "tutorial"],
    author: "开发者",
    license: "MIT",
    engines: {
      node: ">=18.0.0",
      npm: ">=9.0.0",
    },
  };
}

// ---- 2. 基本信息字段 ----
console.log("\\n========== 2. 基本信息 ==========");
console.log("名称 (name)       :", pkg.name || "(未设置)");
console.log("版本 (version)    :", pkg.version || "(未设置)");
console.log("描述 (description):", pkg.description || "(未设置)");
console.log("许可证 (license)  :", pkg.license || "(未设置)");
console.log("作者 (author)     :", typeof pkg.author === "object" ? pkg.author.name : (pkg.author || "(未设置)"));
console.log("私有 (private)    :", pkg.private ? "是（防止意外发布）" : "否");

// ---- 3. 入口文件 ----
console.log("\\n========== 3. 入口文件 ==========");
console.log("main 字段:", pkg.main || "index.js（默认）");
console.log("说明：别人 require('" + (pkg.name || "my-package") + "') 时会加载这个文件");

// ---- 4. 模块系统类型 ----
console.log("\\n========== 4. 模块系统 ==========");
var type = pkg.type || "commonjs（默认）";
console.log("type 字段:", type);
if (type === "module") {
  console.log("本项目使用 ESM 模块系统");
  console.log("  .js 文件 → ESM");
  console.log("  .cjs 文件 → 强制 CommonJS");
  console.log("  .mjs 文件 → 强制 ESM");
} else {
  console.log("本项目使用 CommonJS 模块系统");
  console.log("  .js 文件 → CommonJS");
  console.log("  .mjs 文件 → 强制 ESM");
  console.log("  .cjs 文件 → 强制 CommonJS");
}

// ---- 5. scripts 脚本命令 ----
console.log("\\n========== 5. scripts 脚本命令 ==========");
if (pkg.scripts && Object.keys(pkg.scripts).length > 0) {
  console.log("可用的 npm scripts:");
  console.table(
    Object.keys(pkg.scripts).map(function (key) {
      return { 命令: "npm run " + key, 执行的脚本: pkg.scripts[key] };
    })
  );
  console.log("\\n内置快捷命令（不需要 npm run 前缀）:");
  console.log("  npm start  →", pkg.scripts.start || "(未设置)");
  console.log("  npm test   →", pkg.scripts.test || "(未设置)");
} else {
  console.log("（没有定义 scripts）");
}

// ---- 6. 依赖解析 ----
console.log("\\n========== 6. 依赖列表 ==========");

// 生产依赖
console.log("--- 生产依赖 (dependencies) ---");
if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
  var depList = Object.keys(pkg.dependencies).map(function (name) {
    var version = pkg.dependencies[name];
    var rangeType = "精确版本";
    if (version.startsWith("^")) rangeType = "兼容主版本 (^)";
    else if (version.startsWith("~")) rangeType = "兼容次版本 (~)";
    else if (version === "*") rangeType = "任意版本";
    return { 包名: name, 版本范围: version, 版本策略: rangeType };
  });
  console.table(depList);
} else {
  console.log("（没有生产依赖）");
}

// 开发依赖
console.log("\\n--- 开发依赖 (devDependencies) ---");
if (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0) {
  var devDepList = Object.keys(pkg.devDependencies).map(function (name) {
    return { 包名: name, 版本范围: pkg.devDependencies[name] };
  });
  console.table(devDepList);
  console.log("提示：npm install --production 不会安装这些依赖");
} else {
  console.log("（没有开发依赖）");
}

// ---- 7. engines 字段 ----
console.log("\\n========== 7. 运行环境要求 ==========");
if (pkg.engines) {
  console.log("Node.js 最低版本:", pkg.engines.node || "未指定");
  console.log("npm 最低版本:", pkg.engines.npm || "未指定");
} else {
  console.log("（未设置 engines 字段）");
}

// ---- 8. 关键词与其他元数据 ----
console.log("\\n========== 8. 其他元数据 ==========");
if (pkg.keywords) {
  console.log("关键词:", pkg.keywords.join(", "));
}
if (pkg.repository) {
  var repo = typeof pkg.repository === "object" ? pkg.repository.url : pkg.repository;
  console.log("代码仓库:", repo);
}
if (pkg.bugs) {
  var bugs = typeof pkg.bugs === "object" ? pkg.bugs.url : pkg.bugs;
  console.log("问题追踪:", bugs);
}
if (pkg.homepage) {
  console.log("项目主页:", pkg.homepage);
}

// ---- 9. 语义化版本号解析 ----
console.log("\\n========== 9. 语义化版本号 (SemVer) 解析 =====");

function parseSemVer(version) {
  // 去掉前缀符号 ^ ~ = > < >= <=
  var clean = version.replace(/^[\\^~=> <]+/, "");
  var parts = clean.split(".");
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
    raw: version,
  };
}

// 解析当前项目的版本号
var currentVer = parseSemVer(pkg.version || "1.0.0");
console.log("当前版本:", pkg.version);
console.log("  主版本号 (Major):", currentVer.major);
console.log("  次版本号 (Minor):", currentVer.minor);
console.log("  修订号 (Patch):", currentVer.patch);

// 版本升级演示
console.log("\\n版本升级规则:");
console.log("  修复 bug    : " + currentVer.major + "." + currentVer.minor + "." + (currentVer.patch + 1));
console.log("  新增功能    : " + currentVer.major + "." + (currentVer.minor + 1) + ".0");
console.log("  不兼容变更  : " + (currentVer.major + 1) + ".0.0");

// ---- 10. 版本范围符号解析 ----
console.log("\\n========== 10. 版本范围符号 ==========");

var versionExamples = [
  { 符号: "^4.18.2", 含义: ">=4.18.2 且 <5.0.0", 说明: "兼容主版本，允许次版本和修订号更新" },
  { 符号: "~4.17.21", 含义: ">=4.17.21 且 <4.18.0", 说明: "兼容次版本，只允许修订号更新" },
  { 符号: "4.18.2", 含义: "=4.18.2", 说明: "精确版本，不允许任何更新" },
  { 符号: "*", 含义: "任意版本", 说明: "不推荐，版本不可控" },
  { 符号: ">=4.0.0", 含义: ">=4.0.0", 说明: "大于等于指定版本" },
  { 符号: "4.x", 含义: ">=4.0.0 且 <5.0.0", 说明: "与 ^4.0.0 相同" },
];
console.table(versionExamples);

// ---- 11. package-lock.json 说明 ----
console.log("\\n========== 11. package-lock.json =====");

var lockPath = path.join(process.cwd(), "package-lock.json");
var lockExists = fs.existsSync(lockPath);
console.log("package-lock.json 存在:", lockExists ? "是" : "否");
console.log("作用:");
console.log("  1. 锁定精确版本，确保团队依赖一致");
console.log("  2. 加速 npm install（跳过依赖解析）");
console.log("  3. 防止恶意依赖版本更新被引入");
console.log("重要：package-lock.json 必须提交到 Git 仓库");

// ---- 12. npm install 工作流程 ----
console.log("\\n========== 12. npm install 工作流程 =====");

var steps = [
  "1. 读取 package.json 获取依赖列表",
  "2. 检查 node_modules 是否存在",
  "3. 如果 package-lock.json 存在，按锁文件安装（精确版本）",
  "4. 如果锁文件不存在，解析版本范围，生成依赖树",
  "5. 下载依赖包到 node_modules 目录",
  "6. 生成 / 更新 package-lock.json",
  "7. 执行依赖的 postinstall 脚本（如果有）",
];
steps.forEach(function (step) {
  console.log("  " + step);
});

// ---- 13. 创建项目配置报告 ----
console.log("\\n========== 13. 项目配置报告 =====");

var report = {
  项目名称: pkg.name || "未设置",
  版本号: pkg.version || "未设置",
  入口文件: pkg.main || "index.js",
  模块系统: pkg.type || "commonjs",
  私有项目: pkg.private ? "是" : "否",
  生产依赖数: pkg.dependencies ? Object.keys(pkg.dependencies).length : 0,
  开发依赖数: pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0,
  脚本命令数: pkg.scripts ? Object.keys(pkg.scripts).length : 0,
  许可证: pkg.license || "未设置",
};

console.log("===== 项目配置摘要 =====");
for (var key in report) {
  console.log("  " + key + "：".padEnd(14) + report[key]);
}

// ---- 14. exports 字段说明 ----
console.log("\\n========== 14. exports 字段 =====");
if (pkg.exports) {
  console.log("exports 字段已设置:");
  console.log(JSON.stringify(pkg.exports, null, 2));
} else {
  console.log("exports 字段未设置（使用 main 字段作为入口）");
}
console.log("\\nexports 的优势:");
console.log("  - 精确控制包的哪些部分可被外部访问");
console.log("  - 支持条件导出（ESM/CJS 加载不同文件）");
console.log("  - 防止外部代码绕过 API 直接访问内部实现");
console.log("  - 一旦定义，只有 exports 中声明的路径才能被访问");

console.log("\\n===== package.json 详解演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["快速入门"];