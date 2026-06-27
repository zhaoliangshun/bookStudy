// =============================================================
// Node.js 交互式教程 —— 第四批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. worker    — Worker Threads 工作线程
//   2. cluster   — Cluster 集群
//   3. npm       — npm 与 package.json
//   4. debugging — 调试技巧
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的示例代码
//
// 代码运行环境约束：
//   - Node.js vm 沙箱，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, clearTimeout, clearInterval, clearImmediate,
//     URL, URLSearchParams, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - worker_threads / cluster / child_process 在沙箱中不能 require，
//     代码 demo 用 events 模块模拟概念，或用注释说明。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Worker Threads 工作线程
  // =========================================================
  {
    id: "worker",
    title: "Worker Threads 工作线程",
    icon: "🧵",
    group: "进阶实战",
    content: `## Worker Threads 工作线程

Node.js 的主线程是**单线程**的，这意味着所有 JavaScript 代码都在一个线程里执行。对于 I/O 密集型任务（网络请求、文件读写），Node.js 的事件循环和非阻塞 I/O 已经足够高效。但对于 **CPU 密集型任务**（大量计算、图像处理、加密运算），单线程会成为严重瓶颈——一个耗时的计算会阻塞整个事件循环，导致所有其他请求排队等待。

\`worker_threads\` 模块就是为解决这个问题而引入的。它允许你在 Node.js 中创建**真正的多线程**，把 CPU 密集型任务分配到独立的工作线程中并行执行，从而充分利用多核 CPU 的能力。

### 为什么需要 Worker Threads

#### 单线程模型的局限

Node.js 的核心设计哲学是"单线程 + 事件循环"。这里的"单线程"指的是 **JavaScript 代码的执行线程**只有一个。底层 libuv 实际上维护了一个线程池（默认 4 个线程）来处理 I/O 操作，但你写的 JavaScript 逻辑始终在一个线程上运行。

考虑这样一个场景：你写了一个计算斐波那契数列的函数：

\`\`\`javascript
function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
// 计算 fib(45) 大约需要 5~10 秒
const result = fib(45);
\`\`\`

当这行代码执行时，**整个事件循环被冻结**。在这 5~10 秒内：
- 所有 HTTP 请求无法被处理
- 所有定时器回调不会被执行
- 所有 I/O 完成回调被排队等待
- 服务器对外表现为"卡死"状态

这就是单线程模型最大的痛点——**一个 CPU 密集任务可以拖垮整个服务**。

#### 事件循环无法解决 CPU 密集任务

事件循环擅长处理 I/O 密集任务，因为 I/O 操作是"等待型"的——CPU 在等待磁盘/网络响应时可以去做别的事。但 CPU 密集任务是"计算型"的——CPU 一直在忙碌，没有空闲让事件循环去处理其他事情。

\`\`\`
I/O 密集任务（事件循环擅长）：
  读取文件 → [等待磁盘 10ms] → 处理数据
  在等待的 10ms 里，事件循环可以处理几百个其他请求

CPU 密集任务（事件循环无能为力）：
  开始计算 → [CPU 全速运转 5 秒] → 完成
  在这 5 秒里，事件循环完全被阻塞，什么都做不了
\`\`\`

#### 多线程并行计算的优势

如果你有一台 8 核 CPU 的服务器，单线程只能利用 1 个核心（12.5% 的算力）。通过 Worker Threads，你可以创建 7 个工作线程（留 1 个给主线程），把一个大任务拆成 7 份并行计算，理论上可以接近 **7 倍加速**。

| 模式 | CPU 利用率 | 事件循环影响 | 适用场景 |
| --- | --- | --- | --- |
| 单线程 | 1 核（约 12.5%） | CPU 密集任务会阻塞 | I/O 密集型服务 |
| Worker Threads | N 核（最高 100%） | 工作线程不影响主线程 | CPU 密集型任务 |
| Cluster | N 核（最高 100%） | 每个进程独立事件循环 | Web 服务多核扩展 |

### Worker Threads 架构详解

#### 整体架构

\`\`\`
  ┌──────────────────────────────────────────────────────┐
  │                   主线程 (Main Thread)                  │
  │                                                        │
  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
  │  │ 事件循环     │  │ Worker 实例  │  │ Worker 池    │  │
  │  │ (处理 I/O)  │  │  管理/通信   │  │ (任务调度)   │  │
  │  └─────────────┘  └──────┬──────┘  └──────────────┘  │
  │                          │                             │
  │           ┌──────────────┼──────────────┐             │
  │           ▼              ▼              ▼              │
  │     MessagePort     MessagePort    MessagePort         │
  └─────────┬──────────────┬──────────────┬────────────────┘
            │              │              │
  ┌─────────▼─────┐ ┌──────▼──────┐ ┌────▼──────────┐
  │  Worker 线程 1 │ │ Worker 线程 2│ │ Worker 线程 N │
  │               │ │             │ │               │
  │  own V8 实例   │ │ own V8 实例  │ │ own V8 实例   │
  │  own 事件循环  │ │ own 事件循环 │ │ own 事件循环  │
  │  own UV 循环   │ │ own UV 循环  │ │ own UV 循环   │
  │               │ │             │ │               │
  │  parentPort   │ │ parentPort  │ │ parentPort    │
  └───────────────┘ └─────────────┘ └───────────────┘
\`\`\`

每个 Worker 线程都有：
- **独立的 V8 引擎实例**：不是共享主线程的 V8，而是新开一个
- **独立的事件循环**：Worker 内部有自己的事件循环，不影响主线程
- **独立的 libuv 事件循环**：可以独立处理 I/O
- **parentPort**：与主线程通信的端口

#### 主线程与工作线程的关系

\`\`\`
主线程                          工作线程
  │                               │
  │  new Worker(file, opts)       │
  │ ────────────────────────────> │  创建线程，加载脚本
  │                               │
  │  worker.postMessage(task)     │
  │ ────────────────────────────> │  parentPort.on('message')
  │                               │  执行任务...
  │                               │
  │  parentPort.postMessage(result)│
  │ <──────────────────────────── │  worker.on('message')
  │                               │
  │  worker.terminate()           │
  │ ────────────────────────────> │  线程退出
  │  worker.on('exit')            │
\`\`\`

#### MessagePort 通信机制

\`MessagePort\` 是 Worker Threads 通信的核心抽象。它类似一个双向管道——一端发送消息，另一端接收。每个 Worker 自动有一个 \`parentPort\`（在子线程中）和对应的通信句柄（在主线程中通过 \`worker\` 对象访问）。

\`\`\`javascript
// 主线程
const worker = new Worker('./worker.js');
worker.postMessage({ task: 'compute', data: 100 });
worker.on('message', (result) => {
  console.log('收到结果:', result);
});

// 工作线程 (worker.js)
const { parentPort } = require('worker_threads');
parentPort.on('message', (msg) => {
  const result = heavyCompute(msg.data);
  parentPort.postMessage(result);
});
\`\`\`

#### SharedArrayBuffer 共享内存

\`postMessage\` 默认使用**结构化克隆**（Structured Clone）来传递数据，意味着数据会被复制一份。对于大对象，这个复制开销很大。

\`SharedArrayBuffer\` 允许主线程和工作线程**共享同一块内存**，实现零拷贝。但需要注意同步问题（用 \`Atomics\` 保证原子操作）。

\`\`\`javascript
// 创建 1024 字节的共享内存
const sab = new SharedArrayBuffer(1024);
const buffer = new Int32Array(sab);

// 传给 Worker（零拷贝，共享同一块内存）
const worker = new Worker('./worker.js', { workerData: sab });

// Worker 中可以直接读写这块内存
const sab = workerData;
const buffer = new Int32Array(sab);
buffer[0] = 42; // 主线程也能看到这个修改
\`\`\`

### worker_threads 模块 API 详解

#### isMainThread

\`isMainThread\` 是一个布尔值，表示当前代码是否在主线程中运行。这是区分主线程和工作线程逻辑的关键：

\`\`\`javascript
const { isMainThread } = require('worker_threads');

if (isMainThread) {
  // 主线程逻辑：创建 Worker
  const worker = new Worker(__filename);
} else {
  // 工作线程逻辑：执行任务
  const { parentPort } = require('worker_threads');
  parentPort.postMessage('我是工作线程');
}
\`\`\`

#### Worker 类

\`Worker\` 类用于创建工作线程。每个 \`Worker\` 实例代表一个独立的工作线程。

\`\`\`javascript
const worker = new Worker(filename, options);
\`\`\`

| 参数 | 说明 |
| --- | --- |
| \`filename\` | 工作线程要执行的 JS 文件路径 |
| \`options.workerData\` | 传递给工作线程的初始数据 |
| \`options.eval\` | 如果为 true，filename 被当作代码字符串执行 |
| \`options.resourceLimits\` | 资源限制（堆大小等） |

\`Worker\` 实例的常用方法和事件：

| 方法/事件 | 说明 |
| --- | --- |
| \`worker.postMessage(data)\` | 向工作线程发送消息 |
| \`worker.on('message', cb)\` | 接收工作线程的消息 |
| \`worker.on('error', cb)\` | 工作线程抛出未捕获异常时触发 |
| \`worker.on('exit', cb)\` | 工作线程退出时触发 |
| \`worker.on('online', cb)\` | 工作线程开始执行代码时触发 |
| \`worker.terminate()\` | 强制终止工作线程 |
| \`worker.threadId\` | 线程 ID |
| \`worker.ref() / unref()\` | 控制是否阻止事件循环退出 |

#### parentPort

在工作线程中，\`parentPort\` 是与主线程通信的端口：

\`\`\`javascript
const { parentPort } = require('worker_threads');

// 接收主线程消息
parentPort.on('message', (data) => {
  console.log('收到主线程消息:', data);
});

// 向主线程发送消息
parentPort.postMessage({ result: 'done' });
\`\`\`

#### workerData

\`workerData\` 是主线程在创建 Worker 时通过 \`options.workerData\` 传入的初始数据，在工作线程中可以直接读取：

\`\`\`javascript
// 主线程
const worker = new Worker('./worker.js', {
  workerData: { start: 1, end: 100000 }
});

// 工作线程
const { workerData } = require('worker_threads');
console.log(workerData.start, workerData.end); // 1 100000
\`\`\`

#### MessageChannel

\`MessageChannel\` 创建一对双向通信的端口，可以用于任意两个线程间的通信（不只是主线程和工作线程）：

\`\`\`javascript
const { MessageChannel } = require('worker_threads');

const { port1, port2 } = new MessageChannel();
port1.on('message', (msg) => console.log('port1 收到:', msg));
port2.postMessage('通过 port2 发送');

// 也可以把 port 传给 Worker
worker.postMessage({ port: port2 }, [port2]); // 注意 transferList
\`\`\`

\`transferList\` 参数用于转移对象的所有权（而不是复制），转移后原线程不能再使用该对象。

### 数据传递机制详解

#### postMessage 与结构化克隆

\`postMessage\` 默认使用 **结构化克隆算法** 复制数据。这类似于 \`JSON.parse(JSON.stringify(data))\`，但更强大——支持循环引用、Date、RegExp、Map、Set、ArrayBuffer 等。

\`\`\`javascript
// 可以传递复杂对象
worker.postMessage({
  date: new Date(),
  regex: /pattern/g,
  map: new Map([['key', 'value']]),
  buffer: new ArrayBuffer(1024)
});
\`\`\`

但**不能传递函数、DOM 节点、类实例的方法**。结构化克隆只复制数据，不复制行为。

#### transferList 转移所有权

对于 \`ArrayBuffer\`、\`MessagePort\` 等对象，可以用 \`transferList\` **转移所有权**而不是复制。转移后，原线程中的该对象变为不可用（detached），但接收线程可以直接使用，零拷贝：

\`\`\`javascript
const buffer = new ArrayBuffer(1024 * 1024); // 1MB

// 方式1：复制（默认）—— 1MB 会被复制一份
worker.postMessage({ data: buffer });

// 方式2：转移（零拷贝）—— 1MB 不会复制，但原线程的 buffer 变为不可用
worker.postMessage({ data: buffer }, [buffer]);
console.log(buffer.byteLength); // 0，已转移
\`\`\`

#### SharedArrayBuffer 共享内存

\`SharedArrayBuffer\` 是真正的共享内存——多个线程同时访问同一块内存区域，不需要复制也不需要转移。但必须用 \`Atomics\` API 保证原子性操作：

\`\`\`javascript
// 主线程
const sab = new SharedArrayBuffer(4); // 4 字节
const view = new Int32Array(sab);
view[0] = 0;

const worker = new Worker('./worker.js', { workerData: sab });

// Worker 中
const sab = workerData;
const view = new Int32Array(sab);
Atomics.add(view, 0, 1); // 原子加 1
\`\`\`

| 传递方式 | 是否复制 | 性能 | 复杂度 | 适用场景 |
| --- | --- | --- | --- | --- |
| postMessage（默认） | 是（结构化克隆） | 小对象快，大对象慢 | 低 | 传递小数据、配置 |
| transferList | 否（转移所有权） | 极快（零拷贝） | 中 | 传递大 ArrayBuffer |
| SharedArrayBuffer | 否（共享内存） | 极快（零拷贝） | 高（需同步） | 实时数据共享、大量数据 |

### 工作线程池概念

每次创建 Worker 都有开销（创建 V8 实例、初始化事件循环），约 50~100ms。如果频繁创建销毁 Worker，开销可能比计算本身还大。

**工作线程池**（Worker Pool）预先创建一组 Worker，重复利用它们处理多个任务，避免反复创建销毁：

\`\`\`
任务队列: [task1, task2, task3, task4, task5, task6]
              │
              ▼
  ┌─────────────────────────────────┐
  │         线程池管理器              │
  │  ┌──────┬──────┬──────┬──────┐ │
  │  │ W1   │ W2   │ W3   │ W4   │ │  ← 预创建的 Worker
  │  │busy  │idle  │busy  │idle  │ │
  │  └──────┴──────┴──────┴──────┘ │
  └─────────────────────────────────┘
       │      │      │      │
     task1  task3   task2   (等待)
\`\`\`

常用的工作线程池库：
- **piscina**：高性能 Worker 线程池，API 简洁
- **workerpool**：轻量级线程池
- 自定义实现：用队列 + 空闲 Worker 列表管理

### 适用场景与不适用场景

#### 适用场景（CPU 密集型）

| 场景 | 说明 | 示例 |
| --- | --- | --- |
| 数学计算 | 大量数值运算 | 质数计算、矩阵乘法、蒙特卡洛模拟 |
| 图像处理 | 像素级操作 | 缩放、滤镜、格式转换 |
| 加密运算 | 哈希、签名 | bcrypt 密码哈希、RSA 加密大数据 |
| 数据压缩 | CPU 密集压缩 | gzip/zstd 压缩大文件 |
| JSON 解析 | 超大 JSON | 解析 100MB+ 的 JSON 文件 |
| AI/ML 推理 | 模型计算 | TensorFlow.js 推理 |
| 代码编译 | 转译/打包 | Babel、TypeScript 编译 |

#### 不适用场景（I/O 密集型）

| 场景 | 为什么不适合 |
| --- | --- |
| 数据库查询 | I/O 操作本身是非阻塞的，事件循环已足够 |
| HTTP 请求 | fetch/http 模块已经是异步非阻塞的 |
| 文件读写 | fs 异步 API 不阻塞事件循环 |
| 网络服务 | 每个请求都很轻量，用 Cluster 更合适 |

> **关键原则**：如果任务是"等待型"的（等 I/O），用事件循环；如果任务是"计算型"的（占 CPU），用 Worker Threads。

### Worker Threads 与 Cluster 的区别

| 特性 | Worker Threads | Cluster |
| --- | --- | --- |
| 并行单位 | 线程 | 进程 |
| 内存共享 | 可共享（SharedArrayBuffer） | 完全隔离 |
| 通信方式 | postMessage / 共享内存 | IPC（序列化） |
| 通信性能 | 快（同进程内） | 较慢（跨进程） |
| 资源开销 | 中（每个线程约 30MB） | 大（每个进程约 50MB+） |
| 隔离性 | 弱（一个线程崩溃可能影响进程） | 强（进程完全隔离） |
| 端口共享 | 不支持 | 支持（共享监听端口） |
| 适用场景 | CPU 密集型任务并行 | Web 服务多核扩展 |
| 稳定性 | 较低（线程间互相影响） | 高（进程隔离） |
| 调试难度 | 较高 | 较低 |

### 常见陷阱与最佳实践

#### 陷阱 1：在 Worker 中使用主线程资源

Worker 线程没有主线程的某些全局对象（如 \`process.mainModule\`），也不能直接访问主线程的变量。所有数据必须通过 \`postMessage\` 或 \`workerData\` 传递。

#### 陷阱 2：数据序列化开销

传递大对象时，结构化克隆的开销可能抵消并行带来的收益。对于大于 1MB 的数据，应该用 \`transferList\` 或 \`SharedArrayBuffer\`。

#### 陷阱 3：Worker 数量过多

创建太多 Worker 不会提高性能——CPU 核心数是有限的。一般 Worker 数量不超过 CPU 核心数 - 1（留一个给主线程）。

#### 陷阱 4：忘记处理 error 事件

如果 Worker 中抛出未捕获的异常，且主线程没有监听 \`error\` 事件，会导致主线程崩溃。

\`\`\`javascript
// 正确做法
worker.on('error', (err) => {
  console.error('Worker 出错:', err);
  // 可以重新创建 Worker 或采取其他恢复措施
});
\`\`\`

#### 陷阱 5：Worker 泄漏

创建 Worker 后忘记 \`terminate()\`，会导致线程一直存活，消耗内存。使用线程池可以避免这个问题。

> **注意**：在本教程沙箱中，\`worker_threads\` 模块不能被 require。下面的代码用 \`EventEmitter\` 模拟主线程与工作线程的通信模型，演示任务分发与结果回收的概念，并实测 CPU 密集型计算对主线程的"阻塞"效果。`,

    code: `// ============================================================
// 第一章代码演示：Worker Threads 工作线程概念模拟
// ------------------------------------------------------------
// 注意：沙箱中不能 require('worker_threads')，本 demo 用 events
// 模块的 EventEmitter 模拟主线程与工作线程的消息通信机制，
// 演示任务分发、结果回收、线程池等核心概念。
// 同时用纯 JS 实现一个 CPU 密集型计算（斐波那契），演示"阻塞"。
// ============================================================

const EventEmitter = require("events");

// ============================================================
// 第一部分：CPU 密集型任务与"阻塞"现象演示
// ============================================================

console.log("========== 第一部分：CPU 密集型任务的阻塞演示 ==========");

// 斐波那契递归计算（典型的 CPU 密集型任务）
// 递归实现的时间复杂度是 O(2^n)，n=35 时大约需要数百毫秒
function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// --- 演示 1：单线程执行 CPU 密集任务 ---
console.log("\\n--- 1. 单线程执行斐波那契计算 ---");

// 记录开始时间
const startTime = Date.now();

// 设定一个 10ms 后执行的定时器，观察它是否被"阻塞"
setTimeout(() => {
  console.log("  [定时器] 我应该在 10ms 后执行");
  console.log("  [定时器] 实际执行时间:", Date.now() - startTime, "ms 后");
}, 10);

// 执行 CPU 密集计算（fib(35) 大约需要 100~300ms）
console.log("  开始计算 fibonacci(35)...");
const fibResult = fibonacci(35);
console.log("  fibonacci(35) =", fibResult);
console.log("  计算耗时:", Date.now() - startTime, "ms");

// 等待定时器执行（确保我们看到阻塞效果）
setTimeout(() => {
  console.log("  结论: 定时器被 CPU 计算阻塞了！事件循环在计算期间无法响应。");

  // ============================================================
  // 第二部分：用 EventEmitter 模拟 Worker 通信模型
  // ============================================================

  console.log("\\n========== 第二部分：模拟 Worker 通信模型 ==========");

  // --- 模拟工作线程类 ---
  // 真实的 Worker 有独立的 V8 实例和事件循环，
  // 这里用 EventEmitter 模拟消息通信机制
  class VirtualWorker extends EventEmitter {
    constructor(id, workerData) {
      super();
      this.threadId = id;       // 模拟 worker.threadId
      this.workerData = workerData; // 模拟 workerData（初始数据）
      this._terminated = false;

      // 模拟 parentPort（工作线程中用于与主线程通信的端口）
      this.parentPort = {
        // 工作线程通过 parentPort.postMessage 发送消息给主线程
        postMessage: (data) => {
          if (this._terminated) return;
          // 主线程通过 'message' 事件接收
          this.emit("message", data);
        },
        // 工作线程通过 parentPort.on 接收主线程消息
        on: (event, listener) => this.on("from-main:" + event, listener),
      };

      // 模拟主线程向工作线程发送消息
      // 主线程调用 worker.postMessage(data) 时，工作线程的 parentPort 触发 'message'
      this._postFromMain = (data) => {
        if (this._terminated) return;
        this.emit("from-main:message", data);
      };
    }

    // 主线程调用 worker.postMessage(data)
    postMessage(data) {
      this._postFromMain(data);
    }

    // 模拟 worker.terminate()
    terminate() {
      this._terminated = true;
      this.emit("exit", 0);
    }
  }

  // --- 创建工作线程 ---
  console.log("\\n--- 2. 创建虚拟工作线程 ---");

  const worker = new VirtualWorker(1, { task: "compute-primes", max: 50000 });

  console.log("  线程 ID:", worker.threadId);
  console.log("  初始数据:", JSON.stringify(worker.workerData));

  // 主线程监听工作线程的消息
  worker.on("message", (result) => {
    console.log("  [主线程] 收到工作线程结果:", JSON.stringify(result));
  });

  // 主线程监听工作线程的 error 事件（重要！不监听会导致崩溃）
  worker.on("error", (err) => {
    console.error("  [主线程] 工作线程出错:", err.message);
  });

  // 主线程监听工作线程退出
  worker.on("exit", (code) => {
    console.log("  [主线程] 工作线程退出，退出码:", code);
  });

  // 模拟工作线程内部逻辑
  // 在真实 Worker 中，这段代码在 worker 脚本文件里
  worker.parentPort.on("message", (task) => {
    console.log("  [工作线程] 收到任务:", JSON.stringify(task));

    if (task.type === "compute-primes") {
      // 执行 CPU 密集计算：统计质数
      let count = 0;
      const max = task.max || 10000;
      for (let i = 2; i <= max; i++) {
        let isPrime = true;
        for (let j = 2; j * j <= i; j++) {
          if (i % j === 0) {
            isPrime = false;
            break;
          }
        }
        if (isPrime) count++;
      }
      // 通过 parentPort.postMessage 返回结果
      worker.parentPort.postMessage({
        type: "result",
        primes: count,
        range: "2~" + max,
      });
    }
  });

  // 主线程发送任务给工作线程
  worker.postMessage({
    type: "compute-primes",
    max: 50000,
  });

  // ============================================================
  // 第三部分：模拟工作线程池
  // ============================================================

  setTimeout(() => {
    console.log("\\n========== 第三部分：模拟工作线程池 ==========");

    // --- 工作线程池实现 ---
    // 线程池预先创建多个 Worker，重复利用处理多个任务
    class WorkerPool {
      constructor(size) {
        this.workers = [];      // 所有 Worker
        this.idleWorkers = [];  // 空闲的 Worker
        this.taskQueue = [];    // 等待执行的任务队列
        this.results = [];      // 已完成的结果
        this.pending = 0;       // 待完成的任务数

        // 预创建指定数量的 Worker
        for (let i = 0; i < size; i++) {
          const w = new VirtualWorker(i + 1, null);
          this.workers.push(w);
          this.idleWorkers.push(w);
        }

        console.log("  线程池已创建，大小:", size, "（模拟 4 核 CPU）");
      }

      // 提交任务到线程池
      submit(taskName, taskData) {
        this.pending++;
        const task = { name: taskName, data: taskData };

        if (this.idleWorkers.length > 0) {
          // 有空闲 Worker，立即分配
          this._dispatch(task);
        } else {
          // 没有空闲 Worker，加入队列等待
          console.log("  [线程池] 无空闲 Worker，任务入队:", taskName);
          this.taskQueue.push(task);
        }
      }

      // 分配任务给指定 Worker
      _dispatch(task) {
        const worker = this.idleWorkers.shift();
        console.log("  [线程池] 分配任务 '" + task.name + "' 给 Worker #" + worker.threadId);

        // 设置结果回调
        worker.removeAllListeners("message");
        worker.on("message", (result) => {
          console.log("  [线程池] Worker #" + worker.threadId + " 完成任务 '" + task.name + "'，结果:", JSON.stringify(result));
          this.results.push({ worker: worker.threadId, task: task.name, result });
          this.pending--;

          // Worker 回到空闲池
          this.idleWorkers.push(worker);

          // 如果队列中还有任务，继续分配
          if (this.taskQueue.length > 0) {
            const nextTask = this.taskQueue.shift();
            this._dispatch(nextTask);
          } else if (this.pending === 0) {
            console.log("  [线程池] 所有任务完成！");
            this._printStats();
          }
        });

        // 模拟工作线程处理任务
        worker.parentPort.on("message", (task) => {
          // 模拟计算延迟
          setTimeout(() => {
            let result;
            if (task.name === "fib") {
              result = fibonacci(task.data);
            } else if (task.name === "square-sum") {
              let sum = 0;
              for (let i = 0; i <= task.data; i++) sum += i * i;
              result = sum;
            } else if (task.name === "prime-count") {
              let count = 0;
              for (let i = 2; i <= task.data; i++) {
                let isPrime = true;
                for (let j = 2; j * j <= i; j++) {
                  if (i % j === 0) { isPrime = false; break; }
                }
                if (isPrime) count++;
              }
              result = count;
            }
            worker.parentPort.postMessage({ task: task.name, value: result });
          }, 0);
        });

        // 发送任务
        worker.postMessage(task);
      }

      // 打印统计信息
      _printStats() {
        console.log("\\n  --- 线程池统计 ---");
        console.log("  总 Worker 数:", this.workers.length);
        console.log("  空闲 Worker 数:", this.idleWorkers.length);
        console.log("  完成任务数:", this.results.length);
        console.log("  各 Worker 工作量:");
        const workload = {};
        this.results.forEach((r) => {
          workload[r.worker] = (workload[r.worker] || 0) + 1;
        });
        Object.keys(workload).forEach((w) => {
          console.log("    Worker #" + w + ": 完成 " + workload[w] + " 个任务");
        });
      }
    }

    // --- 使用线程池 ---
    console.log("\\n--- 3. 使用线程池处理多个任务 ---");

    // 创建 4 个 Worker 的线程池
    const pool = new WorkerPool(4);

    // 提交 6 个任务（比 Worker 多，演示排队）
    console.log("\\n  提交 6 个计算任务：");
    pool.submit("fib", 30);           // 斐波那契(30)
    pool.submit("square-sum", 1000);  // 平方和(1000)
    pool.submit("prime-count", 20000);// 质数计数(20000)
    pool.submit("fib", 25);           // 斐波那契(25)
    pool.submit("square-sum", 500);   // 平方和(500)
    pool.submit("prime-count", 10000);// 质数计数(10000)

    console.log("\\n  （任务正在并行处理中...）");

    // ============================================================
    // 第四部分：真实 Worker Threads 用法参考（伪代码）
    // ============================================================

    setTimeout(() => {
      console.log("\\n========== 第四部分：真实 Worker 代码参考 ==========");

      const realWorkerCode = \`// ====== 主线程代码 main.js ======
const { Worker, isMainThread } = require('worker_threads');
const os = require('os');

if (isMainThread) {
  // 主线程：创建 Worker
  const numWorkers = os.cpus().length - 1; // 留一个核给主线程
  console.log('创建 ' + numWorkers + ' 个工作线程');

  const workers = [];
  for (let i = 0; i < numWorkers; i++) {
    // 创建 Worker，传入初始数据
    const worker = new Worker('./worker-task.js', {
      workerData: { workerId: i, start: i * 25000, end: (i + 1) * 25000 }
    });

    // 监听消息
    worker.on('message', (result) => {
      console.log('Worker ' + i + ' 完成:', result);
    });

    // 监听错误（重要！）
    worker.on('error', (err) => {
      console.error('Worker ' + i + ' 出错:', err);
    });

    // 监听退出
    worker.on('exit', (code) => {
      console.log('Worker ' + i + ' 退出，码:', code);
    });

    workers.push(worker);
  }

  // 发送任务
  workers.forEach((w, i) => {
    w.postMessage({ task: 'count-primes', range: [i * 25000, (i + 1) * 25000] });
  });
}

// ====== 工作线程代码 worker-task.js ======
const { parentPort, workerData, isMainThread } = require('worker_threads');

if (!isMainThread) {
  console.log('工作线程 #' + workerData.workerId + ' 启动');

  // 接收主线程消息
  parentPort.on('message', (task) => {
    if (task.task === 'count-primes') {
      const [start, end] = task.range;
      let count = 0;
      for (let i = Math.max(2, start); i <= end; i++) {
        let isPrime = true;
        for (let j = 2; j * j <= i; j++) {
          if (i % j === 0) { isPrime = false; break; }
        }
        if (isPrime) count++;
      }
      parentPort.postMessage({ workerId: workerData.workerId, count, range: task.range });
    }
  });

  // 也可以直接用 workerData 开始工作（不等消息）
  // parentPort.postMessage('工作线程已就绪');
}\`;

      console.log(realWorkerCode);

      // ============================================================
      // 第五部分：SharedArrayBuffer 共享内存概念
      // ============================================================

      console.log("\\n========== 第五部分：数据传递方式对比 ==========");

      console.log("--- 1. postMessage（结构化克隆，默认）---");
      console.log("  特点: 数据被复制一份，原线程和新线程各有一份");
      console.log("  优点: 简单安全，不会数据竞争");
      console.log("  缺点: 大对象复制开销大");
      console.log("  示例: worker.postMessage({ data: largeArray });");

      console.log("\\n--- 2. transferList（转移所有权）---");
      console.log("  特点: ArrayBuffer 等对象所有权转移，零拷贝");
      console.log("  优点: 大数据传递极快");
      console.log("  缺点: 转移后原线程不能再用该对象");
      console.log("  示例: worker.postMessage({ buf }, [buf]);");

      console.log("\\n--- 3. SharedArrayBuffer（共享内存）---");
      console.log("  特点: 多线程共享同一块内存，零拷贝");
      console.log("  优点: 实时共享数据，最高性能");
      console.log("  缺点: 需要用 Atomics 保证原子操作，复杂");
      console.log("  示例:");
      console.log("    const sab = new SharedArrayBuffer(1024);");
      console.log("    const view = new Int32Array(sab);");
      console.log("    const worker = new Worker('./w.js', { workerData: sab });");
      console.log("    // Worker 中: Atomics.add(view, 0, 1);");

      console.log("\\n========== Worker Threads 章节演示结束 ==========");
    }, 200);
  }, 100);
}, 50);`,
  },

  // =========================================================
  // 第二章：Cluster 集群
  // =========================================================
  {
    id: "cluster",
    title: "Cluster 集群",
    icon: "🏢",
    group: "进阶实战",
    content: `## Cluster 集群

Node.js 的主线程是单线程的，这意味着一个 Node.js 进程最多只能利用一个 CPU 核心。在现代服务器上，通常有 8 核、16 核甚至更多核心，单进程只能利用 1/8 或 1/16 的算力，这是巨大的浪费。

\`cluster\` 模块通过创建多个**子进程**（每个进程运行同一个应用），让它们共享同一个网络端口，从而实现多核 CPU 的充分利用。这是 Node.js 在生产环境中处理高并发 Web 服务的标准方案。

### 为什么需要 Cluster

#### 多核 CPU 利用率问题

假设你有一台 8 核 CPU 的服务器，运行一个 Express Web 服务：

\`\`\`
单进程模式：
  ┌──────────────────────────────────────────────┐
  │              8 核 CPU                          │
  │  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐          │
  │  │核1││核2││核3││核4││核5││核6││核7││核8│       │
  │  │忙││闲││闲││闲││闲││闲││闲││闲│  ← 只有1个核在工作 │
  │  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘          │
  └──────────────────────────────────────────────┘
  CPU 利用率: 12.5%（7/8 的算力被浪费）

Cluster 模式（8 个工作进程）：
  ┌──────────────────────────────────────────────┐
  │              8 核 CPU                          │
  │  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐          │
  │  │核1││核2││核3││核4││核5││核6││核7││核8│       │
  │  │忙││忙││忙││忙││忙││忙││忙││忙│  ← 8个核都在工作 │
  │  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘          │
  └──────────────────────────────────────────────┘
  CPU 利用率: ~100%（充分利用多核）
\`\`\`

#### 单进程的可靠性问题

单进程模式下，如果进程因为内存泄漏、未捕获异常等原因崩溃，整个服务就中断了。Cluster 模式下，一个工作进程崩溃，其他工作进程仍在运行，主进程还可以自动重启崩溃的进程，实现高可用。

#### 为什么不用 Worker Threads 代替

Worker Threads 适合 CPU 密集型任务的并行计算，但对于 Web 服务来说，Cluster 更合适：

| 需求 | Worker Threads | Cluster |
| --- | --- | --- |
| 共享端口 | 不支持 | 支持 |
| 进程隔离 | 弱 | 强 |
| 自动重启 | 需手动实现 | 内置支持 |
| 适合 Web 服务 | 不太适合 | 非常适合 |
| 内存隔离 | 共享进程内存 | 完全隔离 |

### Cluster 工作原理

#### 整体架构

\`\`\`
  ┌───────────────────────────────────────────────────────┐
  │                 主进程 (Master/Primary)                  │
  │                                                         │
  │   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
  │   │ 端口监听器   │  │  调度器       │  │  进程管理器   │  │
  │   │ (listen)    │  │ (round-robin)│  │  (fork/exit) │  │
  │   └──────┬──────┘  └──────┬───────┘  └──────────────┘  │
  │          │                 │                             │
  └──────────┼─────────────────┼─────────────────────────────┘
             │                 │
     ┌───────┼───────┬─────────┼────────┐
     │       │       │         │        │
     ▼       ▼       ▼         ▼        ▼
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ W1  │ │ W2  │ │ W3  │ │ W4  │ │ Wn  │  ← 工作进程
  │     │ │     │ │     │ │     │ │     │    （独立的 Node.js 进程）
  │独立  │ │独立  │ │独立  │ │独立  │ │独立  │
  │内存  │ │内存  │ │内存  │ │内存  │ │内存  │
  │事件  │ │事件  │ │事件  │ │事件  │ │事件  │
  │循环  │ │循环  │ │循环  │ │循环  │ │循环  │
  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
     │       │       │       │       │
     └───────┴───────┴───────┴───────┘
              共享同一个端口 (如 3000)
\`\`\`

#### 端口共享机制

这是 Cluster 最神奇的地方——多个进程如何共享同一个端口？

在主进程中，调用 \`server.listen(port)\` 后，主进程会在该端口上监听，但**主进程不处理请求**。当一个新连接到来时，主进程通过 IPC（进程间通信）将连接分发给某个工作进程，由工作进程处理实际的 HTTP 请求。

\`\`\`
客户端请求 → 端口 3000 → 主进程接收连接 → 分发给 Worker 2 → Worker 2 处理请求
\`\`\`

这种机制在底层是通过 **文件描述符传递**（file descriptor passing）实现的——主进程把连接的 fd 传递给工作进程，工作进程直接在这个 fd 上操作。

#### 进程创建方式

Cluster 底层使用 \`child_process.fork()\` 创建工作进程。\`fork()\` 是 \`spawn()\` 的特殊版本，它创建的子进程会自动建立 IPC 通道（用于父子进程通信）。

\`\`\`
cluster.fork() 
  → 内部调用 child_process.fork()
    → 创建新的 Node.js 进程
    → 建立 IPC 通道
    → 子进程加载相同脚本
    → 子进程执行 cluster.isPrimary === false 分支
\`\`\`

### cluster 模块 API 详解

#### cluster.isPrimary / cluster.isMaster

\`cluster.isPrimary\`（旧名 \`cluster.isMaster\`）判断当前进程是主进程还是工作进程。这是 Cluster 模式的核心分支逻辑：

\`\`\`javascript
const cluster = require('cluster');

if (cluster.isPrimary) {
  // 主进程代码：管理 Worker
  cluster.fork();
} else {
  // 工作进程代码：处理请求
  http.createServer(...).listen(3000);
}
\`\`\`

> \`isMaster\` 已被重命名为 \`isPrimary\`（Node 16+），旧名仍可用但已废弃。

#### cluster.fork([env])

创建一个新的工作进程。可选的 \`env\` 参数可以给工作进程设置环境变量：

\`\`\`javascript
// 创建 4 个工作进程
for (let i = 0; i < 4; i++) {
  cluster.fork({ WORKER_ID: i + 1 });
}

// 工作进程中
console.log(process.env.WORKER_ID); // 1, 2, 3, 4
\`\`\`

\`fork()\` 返回一个 \`Worker\` 对象。

#### cluster.workers

包含所有活跃工作进程的对象，键是工作进程的 ID：

\`\`\`javascript
// 遍历所有工作进程
for (const id in cluster.workers) {
  const worker = cluster.workers[id];
  console.log('Worker', id, 'PID:', worker.process.pid);
}
\`\`\`

#### Worker 对象

每个工作进程由一个 \`Worker\` 对象表示：

| 属性/方法 | 说明 |
| --- | --- |
| \`worker.id\` | 工作进程的唯一标识 |
| \`worker.process\` | 底层 ChildProcess 对象 |
| \`worker.send(msg)\` | 向工作进程发送消息（IPC） |
| \`worker.on('message', cb)\` | 接收工作进程消息 |
| \`worker.on('exit', cb)\` | 工作进程退出时触发 |
| \`worker.on('online', cb)\` | 工作进程开始执行时触发 |
| \`worker.on('listening', cb)\` | 工作进程调用 listen 后触发 |
| \`worker.on('disconnect', cb)\` | IPC 通道断开时触发 |
| \`worker.isConnected()\` | 是否仍连接 |
| \`worker.isDead()\` | 是否已退出 |
| \`worker.kill([signal])\` | 终止工作进程 |

#### 事件

| 事件 | 触发时机 |
| --- | --- |
| \`'fork'\` | 调用 \`cluster.fork()\` 后 |
| \`'online'\` | 工作进程创建成功，开始执行 |
| \`'listening'\` | 工作进程调用 \`listen()\` 后 |
| \`'message'\` | 收到工作进程通过 \`process.send()\` 发来的消息 |
| \`'disconnect'\` | 工作进程的 IPC 通道断开 |
| \`'exit'\` | 工作进程退出 |
| \`'setup'\` | 调用 \`cluster.setupPrimary()\` 时 |

#### 完整基础示例

\`\`\`javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  // ===== 主进程 =====
  const numCPUs = os.cpus().length;
  console.log('主进程 PID:', process.pid, '，CPU 核心数:', numCPUs);

  // fork 与 CPU 核心数相同的工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 工作进程退出时自动重启
  cluster.on('exit', (worker, code, signal) => {
    console.log('Worker', worker.id, '退出，码:', code);
    console.log('自动重启...');
    cluster.fork();
  });

  // 工作进程上线
  cluster.on('online', (worker) => {
    console.log('Worker', worker.id, '上线，PID:', worker.process.pid);
  });

} else {
  // ===== 工作进程 =====
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('由 Worker ' + cluster.worker.id + ' (PID:' + process.pid + ') 处理');
  }).listen(3000);

  console.log('Worker', cluster.worker.id, '启动，PID:', process.pid);
}
\`\`\`

### 与 child_process 的关系

Cluster 模块底层基于 \`child_process.fork()\`，但做了额外封装：

| 特性 | child_process.fork() | cluster.fork() |
| --- | --- | --- |
| 用途 | 通用子进程创建 | 专用于集群 |
| 端口共享 | 不支持 | 自动支持 |
| IPC 通信 | 支持 | 支持（封装更友好） |
| 进程管理 | 手动 | 内置（exit/online 等事件） |
| 调度策略 | 无 | round-robin 等 |
| 适用场景 | 运行不同程序 | 运行相同程序的多个实例 |

\`\`\`
cluster.fork() 
  ≈ child_process.fork(process.argv[1]) 
    + 端口共享 
    + IPC 封装 
    + 调度策略
\`\`\`

### Round-robin 调度策略

#### 什么是 Round-robin

Round-robin（轮询）是最简单的负载均衡算法——主进程依次将新连接分发给各个工作进程：

\`\`\`
连接1 → Worker 1
连接2 → Worker 2
连接3 → Worker 3
连接4 → Worker 4
连接5 → Worker 1（回到第一个）
连接6 → Worker 2
...
\`\`\`

#### 调度策略设置

\`\`\`javascript
// 设置调度策略
cluster.schedulingPolicy = cluster.SCHED_RR;     // 轮询（默认，除 Windows）
cluster.schedulingPolicy = cluster.SCHED_NONE;   // 让操作系统决定
\`\`\`

| 策略 | 说明 | 适用平台 |
| --- | --- | --- |
| \`SCHED_RR\` | 轮询：主进程依次分配连接 | Linux/macOS（默认） |
| \`SCHED_NONE\` | 共享套接字：所有 Worker 竞争接受连接 | Windows（默认） |

#### 为什么默认用 Round-robin

\`SCHED_NONE\` 模式下，所有 Worker 共享同一个监听套接字，当新连接到来时，所有 Worker 会被唤醒竞争这个连接——这叫"惊群效应"（thundering herd）。只有一个 Worker 能拿到连接，其他被白白唤醒，浪费 CPU。

Round-robin 由主进程统一分配，避免了惊群效应，负载更均衡。

#### 调度策略对比

\`\`\`
Round-robin（推荐）:
  连接1 → Master → W1
  连接2 → Master → W2
  连接3 → Master → W3
  连接4 → Master → W4
  连接5 → Master → W1
  负载均衡: 非常均匀

共享套接字（SCHED_NONE）:
  连接1 → 所有 Worker 竞争 → W2 赢了
  连接2 → 所有 Worker 竞争 → W2 又赢了（可能）
  连接3 → 所有 Worker 竞争 → W1 赢了
  负载均衡: 不均匀（取决于 OS 调度）
\`\`\`

### 进程间通信（IPC）

#### 主进程 → 工作进程

\`\`\`javascript
// 主进程
worker.send({ type: 'broadcast', message: '系统维护通知' });

// 工作进程
process.on('message', (msg) => {
  console.log('收到主进程消息:', msg);
});
\`\`\`

#### 工作进程 → 主进程

\`\`\`javascript
// 工作进程
process.send({ type: 'stats', requests: 1000, memory: '50MB' });

// 主进程
worker.on('message', (msg) => {
  console.log('Worker', worker.id, '上报:', msg);
});
\`\`\`

#### 实际应用：广播消息

\`\`\`javascript
// 主进程广播消息给所有 Worker
function broadcast(message) {
  for (const id in cluster.workers) {
    cluster.workers[id].send(message);
  }
}

// 示例：每分钟广播一次统计请求
setInterval(() => {
  broadcast({ type: 'report-stats' });
}, 60000);
\`\`\`

### 优雅退出（Graceful Shutdown）

优雅退出是指收到关闭信号时，不立即杀死进程，而是：
1. 停止接收新连接
2. 等待当前正在处理的请求完成
3. 清理资源（关闭数据库连接等）
4. 然后退出

\`\`\`javascript
// 工作进程中的优雅退出
process.on('SIGTERM', () => {
  console.log('Worker 收到 SIGTERM，开始优雅退出...');

  // 1. 停止接收新连接
  server.close(() => {
    // 2. 所有连接处理完毕后退出
    console.log('所有请求处理完毕，退出');
    process.exit(0);
  });

  // 3. 设置超时强制退出（防止某些请求卡住）
  setTimeout(() => {
    console.error('优雅退出超时，强制退出');
    process.exit(1);
  }, 10000);
});
\`\`\`

#### 主进程的优雅退出

\`\`\`javascript
// 主进程优雅退出
process.on('SIGTERM', () => {
  console.log('主进程收到 SIGTERM');

  // 通知所有 Worker 优雅退出
  for (const id in cluster.workers) {
    cluster.workers[id].send({ type: 'shutdown' });
    cluster.workers[id].process.kill('SIGTERM');
  }

  // 等待所有 Worker 退出后主进程退出
  let exited = 0;
  const total = Object.keys(cluster.workers).length;
  cluster.on('exit', () => {
    exited++;
    if (exited === total) {
      console.log('所有 Worker 已退出，主进程退出');
      process.exit(0);
    }
  });
});
\`\`\`

#### 零停机重启

通过"逐个重启"策略实现零停机部署：

\`\`\`
1. 通知 Worker 1 优雅退出（停止接收新连接，等处理完当前请求）
2. 主进程 fork 新的 Worker 1'
3. Worker 1 退出后，通知 Worker 2 优雅退出
4. 主进程 fork 新的 Worker 2'
5. ... 重复直到所有 Worker 更新完毕
\`\`\`

这样在任何时刻都有足够的 Worker 处理请求，实现零停机。

### PM2 等进程管理器简介

在生产环境中，通常不直接用 \`cluster\` 模块，而是用 **PM2** 等进程管理器，它们提供了更完善的集群管理功能。

#### PM2 核心功能

| 功能 | 说明 |
| --- | --- |
| 自动集群 | \`pm2 start app.js -i max\` 自动按 CPU 核心数启动 |
| 自动重启 | 进程崩溃自动重启 |
| 零停机重载 | \`pm2 reload app\` 逐个重启 Worker |
| 日志管理 | 自动收集 stdout/stderr，支持日志轮转 |
| 监控面板 | \`pm2 monit\` 实时查看 CPU/内存 |
| 启动脚本 | \`pm2 startup\` 生成开机自启脚本 |
| 配置文件 | ecosystem.config.js 管理多应用 |

#### PM2 常用命令

\`\`\`bash
# 启动应用（集群模式，自动按 CPU 核心数）
pm2 start app.js -i max

# 指定进程数
pm2 start app.js -i 4

# 零停机重载（逐个重启 Worker）
pm2 reload app

# 查看进程列表
pm2 list

# 查看详细信息
pm2 show app

# 查看监控
pm2 monit

# 查看日志
pm2 logs

# 停止应用
pm2 stop app

# 删除应用
pm2 delete app

# 保存进程列表（配合 startup 实现开机自启）
pm2 save
pm2 startup
\`\`\`

#### PM2 配置文件示例

\`\`\`javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-api',
    script: './app.js',
    instances: 'max',        // 按 CPU 核心数
    exec_mode: 'cluster',    // 集群模式
    max_memory_restart: '1G',// 内存超过 1G 自动重启
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001
    }
  }]
};

// 启动: pm2 start ecosystem.config.js
// 开发环境: pm2 start ecosystem.config.js --env development
\`\`\`

#### 其他进程管理器

| 工具 | 特点 |
| --- | --- |
| **PM2** | 最流行，功能全面，支持集群/日志/监控 |
| **Forever** | 简单的进程守护，不支持集群 |
| **StrongLoop PM** | 企业级，支持远程管理 |
| **Docker + K8s** | 容器化部署，用多容器代替集群 |
| **systemd** | Linux 原生进程管理，轻量 |

> **现代趋势**：在容器化（Docker/K8s）环境中，通常每个容器只跑一个 Node 进程，通过部署多个容器副本实现"集群"，而不是在单个容器内用 cluster。这样更符合容器的"单进程"哲学，也更便于弹性伸缩。

### Cluster vs Worker Threads 对比

| 维度 | Cluster | Worker Threads |
| --- | --- | --- |
| **并行单位** | 进程（Process） | 线程（Thread） |
| **内存模型** | 完全独立（每个进程独立地址空间） | 共享进程内存（可用 SharedArrayBuffer） |
| **资源开销** | 大（每个进程 50~100MB+） | 中（每个线程 30MB+） |
| **启动速度** | 慢（需启动新进程、加载 V8） | 较快（共享 V8 进程资源） |
| **通信方式** | IPC 序列化（process.send/worker.send） | postMessage / 共享内存 |
| **通信性能** | 较慢（跨进程序列化） | 快（同进程内或共享内存） |
| **隔离性** | 强（进程崩溃互不影响） | 弱（线程崩溃可能影响整个进程） |
| **端口共享** | 支持（核心特性） | 不支持 |
| **适合场景** | Web 服务多核扩展、高可用 | CPU 密集型任务并行计算 |
| **稳定性** | 高 | 中 |
| **调试难度** | 较低（每个进程独立调试） | 较高（线程间交互复杂） |
| **生产使用** | 非常广泛（PM2 等） | 逐渐增多（piscina 等线程池） |

#### 何时用 Cluster

- Web API 服务的多核扩展
- 需要高可用性（进程崩溃自动重启）
- 需要端口共享
- I/O 密集型服务

#### 何时用 Worker Threads

- CPU 密集型计算（图像处理、加密、数学计算）
| 需要频繁传递大块数据（用 SharedArrayBuffer） |
| 需要更低延迟的线程间通信 |
| 不需要端口共享 |

#### 两者可以结合使用

\`\`\`javascript
// Cluster + Worker Threads 结合使用
if (cluster.isPrimary) {
  // 主进程：fork 多个工作进程
  for (let i = 0; i < numCPUs; i++) cluster.fork();
} else {
  // 每个工作进程内部再创建 Worker Threads 处理 CPU 密集任务
  const worker = new Worker('./cpu-task.js');
  http.createServer(...).listen(3000);
}
\`\`\`

### 常见陷阱与最佳实践

#### 陷阱 1：全局状态不共享

每个工作进程有独立的内存空间，全局变量、内存缓存等不共享：

\`\`\`javascript
// 错误理解：以为这个计数器在所有 Worker 间共享
let requestCount = 0;
http.createServer((req, res) => {
  requestCount++; // 每个 Worker 各自计数！
  res.end('请求数: ' + requestCount);
}).listen(3000);

// 正确做法：用 Redis 等外部存储共享状态
\`\`\`

#### 陷阱 2：文件描述符泄漏

每个 Worker 都会打开文件、数据库连接等。Worker 数量 × 每个 Worker 的连接数可能超出系统限制。

#### 陷阱 3：session 不共享

如果用内存存储 session，不同 Worker 的 session 不互通。需要用 Redis 等共享存储。

#### 陷阱 4：定时器重复执行

在主进程设置的定时器，不会在 Worker 中执行。但如果在 Worker 中设置定时器，每个 Worker 都会执行一次：

\`\`\`javascript
// 这段代码每个 Worker 都会执行一次！
setInterval(() => {
  cleanupTask(); // 4 个 Worker = 执行 4 次
}, 60000);

// 正确做法：只在主进程执行
if (cluster.isPrimary) {
  setInterval(() => cleanupTask(), 60000);
}
\`\`\`

> **注意**：在本教程沙箱中，\`cluster\` 模块不能被 require。下面的代码用 \`EventEmitter\` 模拟集群的任务分发和 round-robin 调度概念。`,

    code: `// ============================================================
// 第二章代码演示：Cluster 集群概念模拟
// ------------------------------------------------------------
// 注意：沙箱中不能 require('cluster')，本 demo 用 events 模块
// 的 EventEmitter 模拟集群的任务分发、round-robin 调度、
// 进程间通信和优雅退出等核心概念。
// ============================================================

const EventEmitter = require("events");
const os = require("os");

// ============================================================
// 第一部分：集群架构概览
// ============================================================

console.log("========== 第一部分：集群架构概览 ==========");

console.log("CPU 核心数:", os.cpus().length);
console.log("CPU 型号:", os.cpus()[0].model);
console.log("");

// 打印集群架构图
console.log("集群架构示意：");
console.log(
  "  ┌─────────────────────────────────────┐\\n" +
    "  │      主进程 Master (PID: 1)          │\\n" +
    "  │   管理工作进程，不处理业务请求        │\\n" +
    "  │   负责端口监听 + Round-robin 调度     │\\n" +
    "  └──────────┬──────────────────────────┘\\n" +
    "             │ fork() 创建子进程\\n" +
    "     ┌───────┼───────┬───────┬───────┐\\n" +
    "     ▼       ▼       ▼       ▼       ▼\\n" +
    "  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐\\n" +
    "  │ W1  │ │ W2  │ │ W3  │ │ W4  │ │ ... │  工作进程\\n" +
    "  │独立  │ │独立  │ │独立  │ │独立  │ │     │  （共享端口 3000）\\n" +
    "  │内存  │ │内存  │ │内存  │ │内存  │ │     │\\n" +
    "  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘"
);

// ============================================================
// 第二部分：模拟虚拟工作进程类
// ============================================================

console.log("========== 第二部分：模拟集群运行 ==========");

// --- 虚拟工作进程类 ---
// 模拟 cluster 中的 Worker 对象
class VirtualWorkerProcess extends EventEmitter {
  constructor(id, env) {
    super();
    this.id = id;                    // 模拟 worker.id
    this.process = {
      pid: 1000 + id,               // 模拟进程 PID
      kill: (signal) => {
        console.log("  [Master] 向 Worker #" + id + " 发送信号 " + signal);
        this._handleSignal(signal);
      },
    };
    this.env = env || {};            // 模拟 fork 传入的环境变量
    this.isConnected = true;
    this.isDead = false;
    this.requestCount = 0;           // 该 Worker 处理的请求数
    this.state = "idle";             // idle / busy / exiting

    // 模拟 process.send（工作进程 → 主进程通信）
    this._sendToMaster = (msg) => {
      if (!this.isConnected) return;
      // 主进程通过 'message' 事件接收
      setImmediate(() => {
        if (this.isConnected) {
          this.emit("message", msg);
        }
      });
    };

    // 模拟工作进程内部监听主进程消息
    this._receiveFromMaster = (msg) => {
      if (!this.isConnected) return;
      this.emit("from-master", msg);
    };
  }

  // 主进程 → 工作进程通信
  send(msg) {
    if (!this.isConnected) {
      console.log("  [Master] Worker #" + this.id + " 已断开，无法发送消息");
      return false;
    }
    this._receiveFromMaster(msg);
    return true;
  }

  // 处理信号
  _handleSignal(signal) {
    if (signal === "SIGTERM") {
      this.state = "exiting";
      console.log("  [Worker #" + this.id + "] 收到 SIGTERM，开始优雅退出...");
      // 模拟优雅退出：停止接收新请求，等当前请求处理完
      setTimeout(() => {
        this.isConnected = false;
        this.isDead = true;
        this.emit("exit", 0, signal);
      }, 50);
    } else if (signal === "SIGKILL") {
      this.isConnected = false;
      this.isDead = true;
      this.emit("exit", 1, signal);
    }
  }

  // 模拟处理请求
  handleRequest(requestId) {
    this.requestCount++;
    this.state = "busy";
    // 模拟异步处理请求
    const processingTime = 10 + Math.floor(Math.random() * 20);
    setTimeout(() => {
      this.state = "idle";
      this._sendToMaster({
        type: "request-done",
        workerId: this.id,
        requestId: requestId,
        processingTime: processingTime,
      });
    }, processingTime);
  }

  // 终止工作进程
  kill(signal) {
    this.process.kill(signal || "SIGTERM");
  }

  disconnect() {
    this.isConnected = false;
    this.emit("disconnect");
  }
}

// ============================================================
// 第三部分：模拟 Cluster 主进程
// ============================================================

// --- 虚拟集群类 ---
class VirtualCluster {
  constructor() {
    this.isPrimary = true;
    this.workers = {};      // 所有工作进程
    this.workerCount = 0;   // 工作进程计数
    this.rrIndex = 0;       // round-robin 轮询索引
    this.workerIds = [];    // 工作进程 ID 列表（用于 round-robin）
  }

  // fork 创建工作进程
  fork(env) {
    this.workerCount++;
    const id = this.workerCount;
    const worker = new VirtualWorkerProcess(id, env);

    this.workers[id] = worker;
    this.workerIds.push(id);

    // 触发 'fork' 事件
    this.emit("fork", worker);

    // 模拟工作进程上线
    setTimeout(() => {
      this.emit("online", worker);
    }, 10);

    // 模拟工作进程开始监听端口
    setTimeout(() => {
      this.emit("listening", worker, { address: "0.0.0.0", port: 3000 });
    }, 20);

    // 监听工作进程退出
    worker.on("exit", (code, signal) => {
      this.emit("exit", worker, code, signal);
    });

    return worker;
  }

  // Round-robin 调度：选择下一个工作进程
  _getNextWorker() {
    if (this.workerIds.length === 0) return null;

    // 轮询选择
    const workerId = this.workerIds[this.rrIndex % this.workerIds.length];
    this.rrIndex++;
    return this.workers[workerId];
  }

  // 分发请求给工作进程
  dispatchRequest(requestId) {
    const worker = this._getNextWorker();
    if (worker && worker.isConnected && !worker.isDead) {
      console.log("  [调度器] 请求 #" + requestId + " → Worker #" + worker.id);
      worker.handleRequest(requestId);
      return worker.id;
    }
    console.log("  [调度器] 无可用 Worker！");
    return null;
  }
}

// 让 VirtualCluster 继承 EventEmitter
Object.setPrototypeOf(VirtualCluster.prototype, EventEmitter.prototype);

// --- 创建集群 ---
const cluster = new VirtualCluster();

// 监听集群事件
cluster.on("fork", (worker) => {
  console.log("  [Master] fork Worker #" + worker.id + " (PID:" + worker.process.pid + ")");
});

cluster.on("online", (worker) => {
  console.log("  [Master] Worker #" + worker.id + " 已上线");
});

cluster.on("listening", (worker, address) => {
  console.log("  [Master] Worker #" + worker.id + " 正在监听 " + address.address + ":" + address.port);
});

cluster.on("exit", (worker, code, signal) => {
  console.log("  [Master] Worker #" + worker.id + " 退出，码:" + code + " 信号:" + (signal || "无"));

  // 自动重启（模拟高可用）
  if (code !== 0) {
    console.log("  [Master] 异常退出，自动重启 Worker...");
    setTimeout(() => {
      cluster.fork({ RESTARTED: true });
    }, 100);
  }
});

// 创建 4 个工作进程
console.log("\\n--- 创建工作进程 ---");
const numWorkers = 4;
for (let i = 0; i < numWorkers; i++) {
  cluster.fork({ WORKER_ID: i + 1 });
}

// ============================================================
// 第四部分：Round-robin 调度演示
// ============================================================

setTimeout(() => {
  console.log("\\n========== 第三部分：Round-robin 调度演示 ==========");

  console.log("\\n--- 模拟 8 个请求的调度 ---");

  // 模拟接收 8 个请求，用 round-robin 分发
  for (let i = 1; i <= 8; i++) {
    cluster.dispatchRequest(i);
  }

  // 等待所有请求处理完毕
  setTimeout(() => {
    console.log("\\n--- 各 Worker 处理统计 ---");
    let totalRequests = 0;
    for (const id in cluster.workers) {
      const w = cluster.workers[id];
      console.log("  Worker #" + w.id + " (PID:" + w.process.pid + "): 处理了 " + w.requestCount + " 个请求");
      totalRequests += w.requestCount;
    }
    console.log("  总请求数:", totalRequests);
    console.log("  Round-robin 调度结果: 请求均匀分布到各 Worker");

    // ============================================================
    // 第五部分：进程间通信演示
    // ============================================================

    console.log("\\n========== 第四部分：进程间通信（IPC） ==========");

    // --- 主进程 → 工作进程 ---
    console.log("\\n--- 1. 主进程 → 工作进程（广播）---");

    // 向所有工作进程广播消息
    Object.values(cluster.workers).forEach((worker) => {
      // 工作进程监听消息
      worker.on("from-master", (msg) => {
        if (msg.type === "broadcast") {
          console.log("  [Worker #" + worker.id + "] 收到广播:", msg.message);
        } else if (msg.type === "shutdown") {
          console.log("  [Worker #" + worker.id + "] 收到关闭指令，准备优雅退出");
        }
      });

      // 主进程发送广播
      worker.send({ type: "broadcast", message: "系统将于今晚 22:00 维护" });
    });

    // --- 工作进程 → 主进程 ---
    setTimeout(() => {
      console.log("\\n--- 2. 工作进程 → 主进程（状态上报）---");

      // 主进程监听工作进程消息
      Object.values(cluster.workers).forEach((worker) => {
        worker.on("message", (msg) => {
          if (msg.type === "request-done") {
            console.log("  [Master] Worker #" + msg.workerId + " 完成请求 #" + msg.requestId + " (耗时" + msg.processingTime + "ms)");
          } else if (msg.type === "stats") {
            console.log("  [Master] Worker #" + msg.workerId + " 上报: 请求数=" + msg.requests);
          }
        });

        // 工作进程主动上报状态
        worker._sendToMaster({
          type: "stats",
          workerId: worker.id,
          requests: worker.requestCount,
        });
      });

      // ============================================================
      // 第六部分：优雅退出演示
      // ============================================================

      setTimeout(() => {
        console.log("\\n========== 第五部分：优雅退出演示 ==========");

        console.log("\\n--- 模拟收到 SIGTERM 信号 ---");
        console.log("  [Master] 收到关闭信号，开始优雅退出...");

        // 逐个关闭工作进程（零停机策略）
        const workerList = Object.values(cluster.workers);
        let shutdownIndex = 0;

        function shutdownNextWorker() {
          if (shutdownIndex >= workerList.length) {
            console.log("  [Master] 所有 Worker 已退出，主进程退出");
            console.log("\\n========== Cluster 章节演示结束 ==========");

            // 打印完整集群代码参考
            printRealClusterCode();
            return;
          }

          const worker = workerList[shutdownIndex];
          console.log("\\n  [Master] 正在关闭 Worker #" + worker.id + "...");

          // 发送关闭指令
          worker.send({ type: "shutdown" });

          // 发送 SIGTERM 信号
          worker.kill("SIGTERM");

          // 等待退出后关闭下一个
          worker.on("exit", () => {
            shutdownIndex++;
            setTimeout(shutdownNextWorker, 50);
          });
        }

        shutdownNextWorker();
      }, 200);
    }, 200);
  }, 200);
}, 100);

// ============================================================
// 第七部分：真实 Cluster 代码参考
// ============================================================

function printRealClusterCode() {
  console.log("\\n========== 真实 Cluster 代码参考 ==========");

  const code = \`// ====== 完整的 Cluster 集群示例 ======
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  // ===== 主进程逻辑 =====
  const numCPUs = os.cpus().length;
  console.log('主进程 PID:', process.pid, 'CPU 核心数:', numCPUs);

  // 创建与 CPU 核心数相同的工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 工作进程上线
  cluster.on('online', (worker) => {
    console.log('Worker', worker.id, '上线，PID:', worker.process.pid);
  });

  // 工作进程退出 → 自动重启
  cluster.on('exit', (worker, code, signal) => {
    console.log('Worker', worker.id, '退出，码:', code);
    if (code !== 0) {
      console.log('Worker 异常退出，自动重启...');
      cluster.fork();
    }
  });

  // 接收工作进程消息
  cluster.on('message', (worker, msg) => {
    console.log('收到 Worker', worker.id, '消息:', msg);
    // 可以转发给其他 Worker 实现跨进程通信
  });

  // 优雅退出
  process.on('SIGTERM', () => {
    console.log('主进程收到 SIGTERM');
    for (const id in cluster.workers) {
      cluster.workers[id].process.kill('SIGTERM');
    }
  });

} else {
  // ===== 工作进程逻辑 =====
  const server = http.createServer((req, res) => {
    // 模拟处理请求
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('由 Worker ' + cluster.worker.id + 
            ' (PID:' + process.pid + ') 处理\\\\n');
  });

  server.listen(3000, () => {
    console.log('Worker', cluster.worker.id, 
                '监听 3000，PID:', process.pid);
  });

  // 接收主进程消息
  process.on('message', (msg) => {
    if (msg.type === 'shutdown') {
      console.log('Worker', cluster.worker.id, '收到关闭指令');
      server.close(() => {
        console.log('Worker', cluster.worker.id, '优雅退出');
        process.exit(0);
      });
    }
  });

  // 上报统计信息
  setInterval(() => {
    process.send({
      type: 'stats',
      workerId: cluster.worker.id,
      memory: process.memoryUsage().rss
    });
  }, 30000);

  // 优雅退出
  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
    // 超时强制退出
    setTimeout(() => process.exit(1), 10000);
  });
}

// 运行: node cluster-app.js
// 测试: curl http://localhost:3000 （多次访问看不同 Worker 处理）
\`;

  console.log(code);

  console.log("\\n--- PM2 命令速查 ---");
  console.log("  pm2 start app.js -i max      # 集群模式启动（按 CPU 核心数）");
  console.log("  pm2 start app.js -i 4        # 指定 4 个进程");
  console.log("  pm2 reload app               # 零停机重载（逐个重启）");
  console.log("  pm2 list                     # 查看进程列表");
  console.log("  pm2 monit                    # 实时监控");
  console.log("  pm2 logs                     # 查看日志");
  console.log("  pm2 stop app                 # 停止应用");
  console.log("  pm2 delete app               # 删除应用");
  console.log("  pm2 save && pm2 startup      # 保存并设置开机自启");
}`,
  },

  // =========================================================
  // 第三章：npm 与 package.json
  // =========================================================
  {
    id: "npm",
    title: "npm 与 package.json",
    icon: "📦",
    group: "工程化",
    content: `## npm 与 package.json

\`npm\`（Node Package Manager）是 Node.js 的默认包管理器，也是世界上最大的软件注册表——拥有超过 200 万个开源包。\`package.json\` 是每个 Node.js 项目的核心配置文件，定义了项目的元信息、依赖、脚本命令等。

理解 npm 和 package.json 是 Node.js 工程化的基础。无论你用什么框架（Express、Koa、Next.js、NestJS），都绕不开它们。

### npm 是什么

#### npm 的三个组成部分

npm 不仅仅是 \`npm install\` 命令，它包含三个部分：

\`\`\`
  ┌─────────────────────────────────────────────────┐
  │                  npm 生态系统                     │
  ├─────────────────┬────────────────┬───────────────┤
  │   npm CLI        │  npm Registry  │  npm Website  │
  │   (命令行工具)    │  (包注册表)     │  (npmjs.com)  │
  │                  │                │               │
  │  npm install     │  存储所有包     │  搜索/浏览包   │
  │  npm publish     │  的数据库       │  管理账户      │
  │  npm run         │  全球 CDN 分发  │  查看文档      │
  └─────────────────┴────────────────┴───────────────┘
\`\`\`

1. **npm CLI**：你在终端使用的命令行工具（\`npm install\`、\`npm run\` 等）
2. **npm Registry**：存储所有包的公共数据库，全球 CDN 分发
3. **npm Website**：[npmjs.com](https://www.npmjs.com)，用于搜索包、查看文档、管理账户

#### npm 版本与 Node.js 的关系

npm 随 Node.js 一起安装（Node.js 安装包内置 npm）。不同 Node.js 版本对应不同 npm 版本：

| Node.js | npm 版本 | 重要变化 |
| --- | --- | --- |
| Node 14 | npm 6 | 经典版本，许多人仍在用 |
| Node 16 | npm 7+ | 支持 workspaces、package-lock v2 |
| Node 18 | npm 8+ | 性能改进 |
| Node 20 | npm 9+ | package-lock v3 |
| Node 22 | npm 10+ | 进一步优化 |

\`\`\`bash
# 查看版本
node -v   # v20.10.0
npm -v    # 10.2.1

# 更新 npm（不随 Node 更新）
npm install -g npm@latest
\`\`\`

### package.json 详解

\`package.json\` 是每个 Node.js 项目的清单文件。它不仅记录依赖，还包含项目信息、入口、脚本等。可以用 \`npm init\` 交互式创建，或 \`npm init -y\` 快速生成默认配置。

#### 所有字段详解

\`\`\`json
{
  "name": "my-app",
  "version": "1.4.2",
  "description": "项目描述",
  "keywords": ["node", "tutorial"],
  "homepage": "https://github.com/user/my-app",
  "bugs": {
    "url": "https://github.com/user/my-app/issues",
    "email": "bugs@my-app.com"
  },
  "license": "MIT",
  "author": "张三 <zs@example.com> (https://zs.example.com)",
  "contributors": [
    { "name": "李四", "email": "ls@example.com" }
  ],
  "main": "index.js",
  "module": "dist/index.mjs",
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  },
  "type": "commonjs",
  "bin": {
    "mycli": "./bin/cli.js"
  },
  "man": ["./man/myapp.1"],
  "directories": {
    "lib": "./lib",
    "bin": "./bin",
    "test": "./test",
    "doc": "./docs"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "build": "webpack"
  },
  "config": {
    "port": "3000"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  },
  "peerDependencies": {
    "react": ">=16.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true }
  },
  "bundleDependencies": ["some-package"],
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "os": ["darwin", "linux"],
  "cpu": ["x64", "arm64"],
  "private": true,
  "workspaces": ["packages/*"],
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/user/my-app.git"
  }
}
\`\`\`

#### 字段分类详解

##### 1. 基本信息

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| \`name\` | 包名（小写，无空格，可含 - 和 _） | \`"my-app"\` |
| \`version\` | 语义化版本 | \`"1.4.2"\` |
| \`description\` | 项目描述 | \`"一个超赞的应用"\` |
| \`keywords\` | 关键词数组（npm 搜索用） | \`["node", "api"]\` |
| \`license\` | 开源协议 | \`"MIT"\` / \`"Apache-2.0"\` |
| \`author\` | 作者 | \`"张三 <zs@example.com>"\` |
| \`contributors\` | 贡献者数组 | \`[{ "name": "李四" }]\` |
| \`homepage\` | 项目主页 | \`"https://my-app.com"\` |
| \`repository\` | 代码仓库 | \`{ "type": "git", "url": "..." }\` |
| \`bugs\` | bug 反馈地址 | \`{ "url": "..." }\` |

> \`name\` 和 \`version\` 是**必填字段**，其他都是可选的。要发布到 npm 的包，这两个字段必须有。

##### 2. 入口与模块

| 字段 | 说明 |
| --- | --- |
| \`main\` | CommonJS 入口文件（\`require('pkg')\` 时加载的文件） |
| \`module\` | ES Module 入口（webpack/rollup 等打包工具使用） |
| \`exports\` | 现代入口配置（Node 12+ 支持，可定义多个子路径） |
| \`type\` | 模块系统：\`"module"\` 用 ESM，\`"commonjs"\` 用 CJS（默认） |
| \`bin\` | 注册可执行命令（CLI 工具用） |
| \`man\` | man 手册页文件 |
| \`directories\` | 目录结构说明（已过时，仅文档用途） |
| \`files\` | 发布到 npm 时包含的文件（白名单） |

###### main vs module vs exports

这三个字段都定义"入口"，但用途不同：

\`\`\`json
{
  "main": "./lib/index.js",      // CommonJS 入口（旧标准）
  "module": "./es/index.mjs",    // ESM 入口（打包工具用）
  "exports": {                   // 现代标准（Node 12+）
    ".": {
      "import": "./es/index.mjs",   // import 时用这个
      "require": "./lib/index.js",  // require 时用这个
      "default": "./lib/index.js"
    },
    "./utils": "./lib/utils.js",    // 子路径导出
    "./package.json": "./package.json"
  }
}
\`\`\`

\`exports\` 是最强大的——它允许：
- 区分 \`import\` 和 \`require\` 的不同入口
- 定义子路径导出（如 \`import pkg from 'pkg/utils'\`）
- 封装内部模块（只暴露允许的路径）

> 优先级：\`exports\` > \`module\` > \`main\`。如果定义了 \`exports\`，其他入口字段会被忽略。

###### type 字段

\`\`\`json
{ "type": "module" }      // 项目中所有 .js 文件用 ESM
{ "type": "commonjs" }    // 项目中所有 .js 文件用 CJS（默认）
\`\`\`

注意：\`.mjs\` 文件永远是 ESM，\`.cjs\` 文件永远是 CJS，不受 \`type\` 影响。

###### bin 字段（CLI 工具）

\`\`\`json
{
  "bin": {
    "mycli": "./bin/cli.js"
  }
}
\`\`\`

当用户 \`npm install -g my-cli\` 后，\`mycli\` 命令就全局可用。\`cli.js\` 文件需要有 shebang 行：

\`\`\`javascript
#!/usr/bin/env node
// bin/cli.js
console.log('Hello from mycli');
\`\`\`

##### 3. 脚本

| 字段 | 说明 |
| --- | --- |
| \`scripts\` | 自定义 npm 命令 |
| \`config\` | 脚本中可用的配置变量 |

\`\`\`json
{
  "scripts": {
    "dev": "node --watch index.js",
    "start": "node index.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "config": {
    "port": "3000"
  }
}
\`\`\`

运行：\`npm run dev\`、\`npm test\`（test 可省略 run）、\`npm start\`（start 可省略 run）。

在脚本中可以用 \`npm_package_config_port\` 读取 config 中的值。

##### 4. 依赖

| 字段 | 说明 |
| --- | --- |
| \`dependencies\` | 生产依赖（运行时需要） |
| \`devDependencies\` | 开发依赖（仅开发/测试时需要） |
| \`peerDependencies\` | 同伴依赖（需要宿主项目提供） |
| \`optionalDependencies\` | 可选依赖（安装失败不报错） |
| \`bundleDependencies\` | 打包依赖（发布时一起打包） |

##### 5. 环境限制

| 字段 | 说明 |
| --- | --- |
| \`engines\` | 指定 Node/npm 版本 |
| \`os\` | 支持的操作系统 |
| \`cpu\` | 支持的 CPU 架构 |
| \`private\` | 设为 true 防止误发布到 npm |

\`\`\`json
{
  "engines": {
    "node": ">=18.0.0 <21.0.0",
    "npm": ">=9.0.0"
  },
  "os": ["darwin", "linux", "win32"],
  "cpu": ["x64", "arm64"],
  "private": true
}
\`\`\`

> \`private: true\` 非常重要！私有项目一定要设置，防止不小心 \`npm publish\` 把代码发布到公共 npm。

##### 6. 工作空间（Workspaces）

\`\`\`json
{
  "workspaces": ["packages/*"]
}
\`\`\`

用于 monorepo（单仓库多包）管理。npm 会自动把 \`packages/\` 下的每个子目录当作独立包，并在根目录 \`node_modules\` 中创建符号链接。

\`\`\`
my-monorepo/
├── package.json          (workspaces: ["packages/*"])
├── package-lock.json
├── node_modules/         (共享依赖)
└── packages/
    ├── core/             (packages/core)
    │   └── package.json  (name: "@my/core")
    ├── ui/               (packages/ui)
    │   └── package.json  (name: "@my/ui")
    └── utils/            (packages/utils)
        └── package.json  (name: "@my/utils")
\`\`\`

### 语义化版本（SemVer）

#### 版本号格式

语义化版本（Semantic Versioning，SemVer）的格式是 \`主版本.次版本.修订号\`（\`MAJOR.MINOR.PATCH\`）：

\`\`\`
1.4.2
│ │ │
│ │ └── PATCH（修订号）：向后兼容的 bug 修复
│ │    例：修复了某个 bug，不影响 API
│ └── MINOR（次版本）：向后兼容的新功能
│    例：新增了一个方法，旧代码仍能工作
└── MAJOR（主版本）：不兼容的 API 变更
     例：删除/重命名了 API，旧代码可能不能用
\`\`\`

#### 版本号递进规则

| 变更类型 | 版本变化 | 示例 |
| --- | --- | --- |
| Bug 修复 | PATCH +1 | 1.4.2 → 1.4.3 |
| 新增功能（兼容） | MINOR +1, PATCH 归 0 | 1.4.2 → 1.5.0 |
| 破坏性变更 | MAJOR +1, 其余归 0 | 1.4.2 → 2.0.0 |
| 预发布版 | 加 -alpha/beta/rc | 1.4.2-alpha.1 |
| 构建元数据 | 加 +build | 1.4.2+20240101 |

\`\`\`
1.4.2-alpha.1      ← alpha 预发布
1.4.2-beta.3       ← beta 预发布
1.4.2-rc.1         ← release candidate
1.4.2              ← 正式版
1.4.2+build.123    ← 构建元数据（不影响版本顺序）
\`\`\`

#### 版本范围符号

在 \`package.json\` 中指定依赖版本时，可以用各种范围符号：

| 符号 | 含义 | 示例 | 匹配范围 |
| --- | --- | --- | --- |
| \`^\` | 兼容版本（最常用） | \`^1.4.2\` | \`>=1.4.2 <2.0.0\` |
| \`~\` | 近似版本 | \`~1.4.2\` | \`>=1.4.2 <1.5.0\` |
| 精确 | 精确版本 | \`1.4.2\` | \`=1.4.2\` |
| \`>\` | 大于 | \`>1.4.2\` | \`>1.4.2\` |
| \`>=\` | 大于等于 | \`>=1.4.2\` | \`>=1.4.2\` |
| \`<\` | 小于 | \`<2.0.0\` | \`<2.0.0\` |
| \`<=\` | 小于等于 | \`<=1.4.2\` | \`<=1.4.2\` |
| \`*\` | 任意版本 | \`*\` | 任意 |
| \`x\` | 任意（占位） | \`1.x\` | \`>=1.0.0 <2.0.0\` |
| \`\|\|\` | 或 | \`1.4.2 \|\| 2.0.0\` | 1.4.2 或 2.0.0 |
| \`-\` | 范围 | \`1.2.3 - 1.5.0\` | \`>=1.2.3 <=1.5.0\` |
| \`latest\` | 最新版 | \`latest\` | 最新发布版本 |

#### ^ 和 ~ 的区别（最容易混淆）

\`\`\`
^1.4.2（脱字符）：
  允许 1.4.2 ~ 1.x.x（不升主版本）
  匹配: 1.4.2, 1.4.3, 1.5.0, 1.9.9
  不匹配: 2.0.0

~1.4.2（波浪号）：
  允许 1.4.2 ~ 1.4.x（不升次版本）
  匹配: 1.4.2, 1.4.3
  不匹配: 1.5.0, 2.0.0
\`\`\`

**特殊规则**：
- \`^0.2.3\` → \`>=0.2.3 <0.3.0\`（0.x 时，^ 等同于 ~）
- \`^0.0.3\` → \`>=0.0.3 <0.0.4\`（0.0.x 时，^ 等同于精确版本）
- \`~1\` → \`>=1.0.0 <2.0.0\`（只指定主版本时，~ 等同于 ^）
- \`~1.2\` → \`>=1.2.0 <1.3.0\`

> **最佳实践**：默认用 \`^\`（npm install 默认就是 ^），它允许自动获取兼容的 bug 修复和新功能，同时避免不兼容的破坏性变更。

#### 预发布版本的特殊规则

预发布版本（如 \`1.4.2-beta.1\`）只会在版本范围**明确包含相同预发布标签**时才被匹配：

\`\`\`
范围 ^1.4.2:
  匹配 1.4.2, 1.4.3, 1.5.0
  不匹配 1.5.0-beta.1（即使版本号在范围内）

范围 ^1.5.0-beta.1:
  匹配 1.5.0-beta.1, 1.5.0-beta.2, 1.5.0, 1.6.0
  不匹配 1.4.2
\`\`\`

### dependencies vs devDependencies vs peerDependencies

#### dependencies（生产依赖）

运行时需要的包。\`npm install --production\` 或 \`NODE_ENV=production npm install\` 时会安装这些包。

\`\`\`json
{
  "dependencies": {
    "express": "^4.18.2",    // Web 框架
    "lodash": "^4.17.21",    // 工具库
    "mysql2": "^3.6.0"       // 数据库驱动
  }
}
\`\`\`

**判断标准**：如果代码运行时（生产环境）需要 \`require/import\` 这个包，就是 \`dependencies\`。

#### devDependencies（开发依赖）

仅开发和测试时需要的包，不会进入生产环境。

\`\`\`json
{
  "devDependencies": {
    "jest": "^29.7.0",       // 测试框架
    "eslint": "^8.50.0",     // 代码检查
    "nodemon": "^3.0.0",     // 开发热重载
    "webpack": "^5.89.0"     // 打包工具
  }
}
\`\`\`

**判断标准**：只在开发/测试/构建时需要，运行时不需要的包。

> 安装时用 \`npm i -D <pkg>\` 或 \`npm i --save-dev <pkg>\`。

#### peerDependencies（同伴依赖）

用于插件/库的场景——表示"我需要宿主项目提供这个包"。

例如 React 组件库：

\`\`\`json
// react-component-lib 的 package.json
{
  "peerDependencies": {
    "react": ">=16.0.0",
    "react-dom": ">=16.0.0"
  }
}
\`\`\`

这意味着：使用这个组件库的项目必须自己安装 React。组件库不会重复安装 React，而是要求宿主项目提供。

\`\`\`
项目 A 使用 react-component-lib:
  项目 A 的 package.json:
    dependencies: {
      "react": "^18.2.0",              ← 项目自己安装 React
      "react-component-lib": "^1.0.0"  ← 组件库（不重复安装 React）
    }
\`\`\`

#### optionalDependencies（可选依赖）

安装失败不会报错的依赖。通常用于平台特定的可选增强：

\`\`\`json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2"  // macOS 文件监视（Linux/Windows 上可选）
  }
}
\`\`\`

#### bundleDependencies（打包依赖）

\`npm pack\` / \`npm publish\` 时会一起打包的依赖。较少使用。

#### 依赖类型对比表

| 类型 | 安装位置 | 生产环境 | 安装失败 | 典型包 |
| --- | --- | --- | --- | --- |
| dependencies | node_modules | 安装 | 报错 | express, lodash |
| devDependencies | node_modules | 不安装 | 报错 | jest, eslint |
| peerDependencies | 不安装（需宿主提供） | 宿主提供 | 警告 | react（插件库的宿主） |
| optionalDependencies | node_modules | 安装 | 不报错 | fsevents |
| bundleDependencies | 打包进 tarball | 安装 | 报错 | 较少使用 |

### npm 命令大全

#### 安装相关

| 命令 | 说明 |
| --- | --- |
| \`npm install\` / \`npm i\` | 安装 package.json 中的所有依赖 |
| \`npm i <pkg>\` | 安装包到 dependencies |
| \`npm i <pkg>@<version>\` | 安装指定版本 |
| \`npm i <pkg>@latest\` | 安装最新版 |
| \`npm i -D <pkg>\` / \`--save-dev\` | 安装到 devDependencies |
| \`npm i -g <pkg>\` / \`--global\` | 全局安装 |
| \`npm i --production\` | 只安装 dependencies（不装 devDependencies） |
| \`npm i --force\` | 强制安装（忽略冲突） |
| \`npm i --legacy-peer-deps\` | 忽略 peerDependencies 冲突 |
| \`npm i --no-save\` | 安装但不写入 package.json |
| \`npm i <pkg> --exact\` / \`-E\` | 安装精确版本（不加 ^） |

#### 卸载/更新

| 命令 | 说明 |
| --- | --- |
| \`npm uninstall <pkg>\` / \`npm un\` | 卸载包 |
| \`npm uninstall -D <pkg>\` | 从 devDependencies 卸载 |
| \`npm uninstall -g <pkg>\` | 卸载全局包 |
| \`npm update\` | 更新所有依赖（在范围内） |
| \`npm update <pkg>\` | 更新指定包 |
| \`npm outdated\` | 查看过时的依赖 |
| \`npm upgrade\` | 同 update |

#### 项目管理

| 命令 | 说明 |
| --- | --- |
| \`npm init\` | 交互式创建 package.json |
| \`npm init -y\` | 快速生成默认 package.json |
| \`npm init <template>\` | 用模板创建（如 \`npm create vite@latest\`） |
| \`npm run <script>\` | 运行 scripts 中的命令 |
| \`npm test\` / \`npm t\` | 运行 test 脚本 |
| \`npm start\` | 运行 start 脚本 |
| \`npm stop\` | 运行 stop 脚本 |
| \`npm restart\` | 运行 restart 脚本 |
| \`npm run\` | 列出所有可用脚本 |

#### 发布相关

| 命令 | 说明 |
| --- | --- |
| \`npm publish\` | 发布包到 npm |
| \`npm publish --access public\` | 发布 scoped 公开包 |
| \`npm unpublish <pkg>@<version>\` | 撤销发布的版本（72小时内） |
| \`npm deprecate <pkg> "message"\` | 标记包为废弃 |
| \`npm version <type>\` | 升级版本号（patch/minor/major） |
| \`npm version 1.2.3\` | 直接设置版本号 |
| \`npm dist-tag add <pkg>@<version> <tag>\` | 添加 dist-tag |
| \`npm owner add <user> <pkg>\` | 添加包的维护者 |

#### 查看信息

| 命令 | 说明 |
| --- | --- |
| \`npm list\` / \`npm ls\` | 查看已安装的依赖树 |
| \`npm list --depth=0\` | 只看顶层依赖 |
| \`npm list -g\` | 查看全局安装的包 |
| \`npm info <pkg>\` | 查看包信息 |
| \`npm info <pkg> versions\` | 查看包的所有版本 |
| \`npm view <pkg> dependencies\` | 查看包的依赖 |
| \`npm audit\` | 检查安全漏洞 |
| \`npm audit fix\` | 自动修复漏洞 |
| \`npm fund\` | 查看寻求资助的包 |
| \`npm explain <pkg>\` | 解释为什么安装了某个包 |

#### 缓存与配置

| 命令 | 说明 |
| --- | --- |
| \`npm cache clean --force\` | 清除 npm 缓存 |
| \`npm cache verify\` | 验证缓存 |
| \`npm config list\` | 查看配置 |
| \`npm config set <key> <value>\` | 设置配置 |
| \`npm config get <key>\` | 获取配置 |
| \`npm config delete <key>\` | 删除配置 |
| \`npm config set registry <url>\` | 设置镜像源 |

### npx 简介

\`npx\`（npm package executor）是 npm 5.2+ 内置的工具，用于**临时执行** npm 包中的命令，无需全局安装。

\`\`\`bash
# 传统方式：先全局安装再用
npm install -g create-react-app
create-react-app my-app

# npx 方式：直接执行，不污染全局
npx create-react-app my-app
\`\`\`

#### npx 的用途

1. **执行未安装的包**：自动下载、执行、不残留
2. **执行本地安装的包**：不用写完整路径 \`./node_modules/.bin/jest\`
3. **执行特定版本**：\`npx pkg@1.0.0\`
4. **执行 GitHub 上的代码**：\`npx github:user/repo\`
5. **运行一次性脚本**：\`npx cowsay "hello"\`

\`\`\`bash
# 常见用法
npx create-next-app my-app     # 创建 Next.js 项目
npx eslint --init              # 初始化 ESLint 配置
npx tsc --version              # 检查 TypeScript 版本
npx prettier --write .         # 格式化代码
npx http-server                # 临时启动静态文件服务器
\`\`\`

> npm 7+ 中 \`npx\` 已被 \`npm exec\` 替代，但 \`npx\` 命令仍可用。

### .npmrc 配置文件

\`.npmrc\` 是 npm 的配置文件，可以设置镜像源、认证信息、默认参数等。

#### 配置文件位置

| 位置 | 作用范围 |
| --- | --- |
| \`/etc/npmrc\` | 全局（所有用户） |
| \`~/.npmrc\` | 用户级（当前用户的所有项目） |
| \`项目根目录/.npmrc\` | 项目级（仅当前项目） |

#### 常用配置

\`\`\`ini
# .npmrc 文件示例

# 镜像源设置
registry=https://registry.npmmirror.com/

# 镜像源（淘宝镜像）
registry=https://registry.npmmirror.com/

# 私有 registry
@mycompany:registry=https://npm.mycompany.com/

# 认证 token
//registry.npmjs.org/:_authToken=\${NPM_TOKEN}
//npm.mycompany.com/:_authToken=xxx-xxx-xxx

# 默认安装前缀（不自动加 ^）
save-exact=true

# 安装时忽略 peerDependencies 冲突
legacy-peer-deps=true

# 设置代理
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080

# 不自动生成 package-lock
package-lock=false

# 缓存目录
cache=/tmp/npm-cache

# 默认日志级别
loglevel=error
\`\`\`

#### 用命令配置

\`\`\`bash
# 设置镜像源
npm config set registry https://registry.npmmirror.com/

# 查看当前镜像源
npm config get registry

# 设置保存精确版本
npm config set save-exact true

# 列出所有配置
npm config list
npm config list -l  # 包含默认值
\`\`\`

### package-lock.json 与确定性安装

#### 为什么需要 package-lock.json

\`package.json\` 中的版本范围（如 \`^1.4.2\`）允许安装 1.4.2 到 1.x.x 的任何版本。这意味着：
- 今天 \`npm install\` 安装了 1.4.2
- 明天包作者发布了 1.5.0
- 明天 \`npm install\` 就会安装 1.5.0

这导致**不同时间、不同机器安装的依赖版本可能不同**，引发"在我电脑上没问题"的诡异 bug。

\`package-lock.json\` 记录了**每个依赖的确切版本和下载地址**，确保每次 \`npm install\` 都安装完全相同的依赖树。

#### package-lock.json 的结构

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "packages": {
    "": {
      "dependencies": {
        "express": "^4.18.2"
      }
    },
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "body-parser": "1.20.1",
        "cookie": "0.5.0"
        // ... 50+ 个子依赖
      }
    },
    "node_modules/body-parser": {
      "version": "1.20.1",
      "resolved": "..."
    }
  }
}
\`\`\`

#### lockfileVersion

| 版本 | npm 版本 | 说明 |
| --- | --- | --- |
| 1 | npm 6 | 旧格式 |
| 2 | npm 7-8 | 支持 workspaces |
| 3 | npm 9+ | 优化格式（默认） |

> npm 7+ 会自动把 v1 升级为 v2/v3 格式。

#### 最佳实践

1. **把 package-lock.json 提交到版本控制**（git）
2. **不要手动编辑 package-lock.json**
3. **CI/CD 中用 \`npm ci\` 安装**（比 \`npm install\` 更快、更严格）
4. **删除 node_modules 后用 \`npm install\` 能完全还原**（因为有 lock）

\`\`\`bash
# npm ci（持续集成推荐）
npm ci
# 特点：
#   - 必须存在 package-lock.json
#   - 完全按照 lock 安装，不更新
#   - 如果 package.json 和 lock 不一致会报错
#   - 比 npm install 快
#   - 安装前自动删除 node_modules
\`\`\`

### npm scripts 钩子（pre/post）

npm 会自动在执行某个脚本前后运行 \`pre\` 和 \`post\` 钩子：

\`\`\`json
{
  "scripts": {
    "prebuild": "rimraf dist",           // build 前自动执行
    "build": "webpack --mode production",
    "postbuild": "echo 构建完成",          // build 后自动执行
    "pretest": "cross-env NODE_ENV=test",
    "test": "jest",
    "posttest": "npm run lint"
  }
}
\`\`\`

执行 \`npm run build\` 时，实际执行顺序：
1. \`npm run prebuild\`（清理 dist 目录）
2. \`npm run build\`（webpack 构建）
3. \`npm run postbuild\`（输出"构建完成"）

#### 生命周期钩子

npm 内置了一些生命周期脚本，在特定时机自动执行：

| 钩子 | 触发时机 |
| --- | --- |
| \`preinstall\` / \`postinstall\` | \`npm install\` 前后 |
| \`preuninstall\` / \`postuninstall\` | \`npm uninstall\` 前后 |
| \`prepublish\` | \`npm publish\` 前（已废弃，用 prepublishOnly） |
| \`prepublishOnly\` | \`npm publish\` 前（仅发布时） |
| \`prepare\` | \`npm install\` 后 + \`npm publish\` 前 |
| \`prepack\` / \`postpack\` | \`npm pack\` 前后 |
| \`preversion\` / \`postversion\` | \`npm version\` 前后 |
| \`prerestart\` / \`postrestart\` | \`npm restart\` 前后 |
| \`prestart\` / \`poststart\` | \`npm start\` 前后 |
| \`pretest\` / \`posttest\` | \`npm test\` 前后 |
| \`prestop\` / \`poststop\` | \`npm stop\` 前后 |

#### 自定义脚本组合

\`\`\`json
{
  "scripts": {
    "clean": "rimraf dist",
    "lint": "eslint src",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build": "webpack",
    "build:dev": "webpack --mode development",
    "build:prod": "webpack --mode production",
    "deploy": "npm run build && npm run publish",
    "ci": "npm run lint && npm run test && npm run build"
  }
}
\`\`\`

#### 脚本中串联命令

\`\`\`json
{
  "scripts": {
    // && 串行：前一个成功才执行下一个
    "build": "npm run clean && npm run compile && npm run bundle",

    // & 并行（Windows 不支持，用 concurrently 或 npm-run-all）
    "dev": "npm run watch:js & npm run watch:css",

    // 推荐用 concurrently 实现跨平台并行
    "dev": "concurrently \\"npm run watch:js\\" \\"npm run watch:css\\""
  }
}
\`\`\`

### 私有包与 scope（@scope/name）

#### scope 命名

\`scope\` 是包名前缀，用于命名空间隔离：

\`\`\`
@angular/core        ← Angular 组织的 core 包
@babel/preset-env    ← Babel 组织的 preset-env 包
@mycompany/utils     ← 你公司的 utils 包
@username/my-tool    ← 你个人的 my-tool 包
\`\`\`

#### 创建 scoped 包

\`\`\`bash
# 初始化 scoped 包
npm init --scope=@myusername

# package.json 中
{
  "name": "@myusername/my-tool",
  "version": "1.0.0"
}
\`\`\`

#### 发布 scoped 包

\`\`\`bash
# scoped 包默认是私有的（需要付费 npm 账户）
npm publish

# 发布为公开的 scoped 包（免费）
npm publish --access public
\`\`\`

#### 安装 scoped 包

\`\`\`bash
npm install @angular/core      # 安装公开的 scoped 包
npm install @mycompany/utils   # 安装私有 scoped 包（需配置 registry）
\`\`\`

#### 私有 registry 配置

\`\`\`ini
# .npmrc
@mycompany:registry=https://npm.mycompany.com/
//npm.mycompany.com/:_authToken=\${NPM_TOKEN}
\`\`\`

\`\`\`bash
# 只从私有 registry 安装 @mycompany 包
npm install @mycompany/utils
\`\`\`

### 常见镜像源配置

由于网络原因，国内访问 npm 官方源可能较慢。可以配置国内镜像源加速。

#### 常见镜像源

| 镜像源 | URL | 说明 |
| --- | --- | --- |
| npm 官方 | \`https://registry.npmjs.org/\` | 默认 |
| 淘宝镜像 | \`https://registry.npmmirror.com/\` | 最常用（原 cnpm） |
| 腾讯镜像 | \`https://mirrors.cloud.tencent.com/npm/\` | 腾讯云 |
| 华为镜像 | \`https://mirrors.huaweicloud.com/repository/npm/\` | 华为云 |
| cnpm | \`https://r.cnpmjs.org/\` | 淘宝旧地址（已迁移） |

#### 配置镜像源

\`\`\`bash
# 临时使用
npm install --registry=https://registry.npmmirror.com/

# 永久设置
npm config set registry https://registry.npmmirror.com/

# 验证
npm config get registry
# 输出: https://registry.npmmirror.com/
\`\`\`

#### 使用 nrm 管理多个镜像源

\`\`\`bash
# 安装 nrm
npm install -g nrm

# 列出所有可用镜像源
nrm ls
# * npm ---------- https://registry.npmjs.org/
#   yarn --------- https://registry.yarnpkg.com/
#   tencent ------ https://mirrors.cloud.tencent.com/npm/
#   cnpm --------- https://r.cnpmjs.org/
#   taobao ------- https://registry.npmmirror.com/

# 切换镜像源
nrm use taobao

# 测试速度
nrm test

# 添加自定义镜像源
nrm add company https://npm.company.com/
\`\`\`

#### 配置 Node.js 二进制镜像

某些包（如 node-sass、electron）会下载 Node.js/Electron 二进制文件，也需要配置镜像：

\`\`\`ini
# .npmrc
registry=https://registry.npmmirror.com/

# Node.js 二进制镜像
disturl=https://npmmirror.com/mirrors/node/

# 常见二进制包镜像
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
electron_mirror=https://npmmirror.com/mirrors/electron/
puppeteer_download_host=https://npmmirror.com/mirrors/
chromedriver_cdnurl=https://npmmirror.com/mirrors/chromedriver
operadriver_cdnurl=https://npmmirror.com/mirrors/operadriver
phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs
python_mirror=https://npmmirror.com/mirrors/python
\`\`\`

### 常见陷阱与最佳实践

#### 陷阱 1：^ 导致版本不一致

\`^1.4.2\` 可能安装 1.4.2 或 1.5.0，导致不同环境版本不一致。**解决**：提交 package-lock.json，CI 用 \`npm ci\`。

#### 陷阱 2：全局安装污染

全局安装的包版本可能与项目本地版本冲突。**解决**：项目依赖用本地安装，不用全局。

#### 陷阱 3：peerDependencies 冲突

npm 7+ 会自动安装 peerDependencies，可能引发版本冲突。**解决**：用 \`--legacy-peer-deps\` 忽略。

#### 陷阱 4：误发布私有代码

忘记设 \`private: true\` 导致内部代码发布到公共 npm。**解决**：所有非公开项目设 \`"private": true\`。

#### 陷阱 5：scripts 中的路径问题

Windows 和 Unix 路径分隔符不同。**解决**：用 \`path.join()\` 或跨平台工具（\`cross-env\`、\`rimraf\`）。

> 下面通过代码构建一个完整的 package.json 对象，实现语义化版本比较函数，并演示 scripts 的 pre/post 钩子概念。`,

    code: `// ============================================================
// 第三章代码演示：npm 与 package.json
// ------------------------------------------------------------
// 本 demo 演示：
//   1. 构造一个完整的 package.json 对象并解析展示
//   2. 实现语义化版本（SemVer）解析与比较
//   3. 模拟 npm scripts 的 pre/post 钩子执行
//   4. 模拟依赖安装分析
// ============================================================

// ============================================================
// 第一部分：完整的 package.json 对象
// ============================================================

console.log("========== 第一部分：完整 package.json 示例 ==========");

// 构造一个功能完整的 package.json 对象
const packageJson = {
  // --- 基本信息 ---
  name: "my-awesome-app",           // 包名（小写，无空格）
  version: "1.4.2",                 // 语义化版本: 主.次.修
  description: "一个功能完善的 Node.js 应用",
  keywords: ["nodejs", "tutorial", "express", "api"],  // npm 搜索关键词
  license: "MIT",                   // 开源协议
  author: "张三 <zs@example.com> (https://zs.example.com)",
  homepage: "https://github.com/zs/my-app",
  repository: {                     // 代码仓库
    type: "git",
    url: "https://github.com/zs/my-app.git",
  },
  bugs: {                           // bug 反馈
    url: "https://github.com/zs/my-app/issues",
    email: "bugs@my-app.com",
  },

  // --- 入口与模块 ---
  main: "dist/index.js",            // CommonJS 入口
  module: "dist/index.mjs",         // ES Module 入口
  exports: {                        // 现代导出配置
    ".": {
      import: "./dist/index.mjs",   // import 时用这个
      require: "./dist/index.js",   // require 时用这个
    },
    "./utils": "./dist/utils.js",   // 子路径导出
    "./package.json": "./package.json",
  },
  type: "commonjs",                 // 模块系统: "module" 或 "commonjs"
  bin: {                            // CLI 可执行命令
    mycli: "./bin/cli.js",
  },
  files: [                          // 发布到 npm 时包含的文件
    "dist",
    "bin",
    "README.md",
    "LICENSE",
  ],

  // --- 脚本命令 ---
  scripts: {
    // 开发相关
    dev: "node --watch index.js",       // 开发模式（Node 18+ 内置 --watch）
    start: "node index.js",             // 生产启动
    // 构建相关（含 pre/post 钩子）
    prebuild: "rimraf dist",            // build 前自动执行（清理）
    build: "webpack --mode production", // 构建
    postbuild: "echo 构建完成",          // build 后自动执行
    // 测试相关
    pretest: "cross-env NODE_ENV=test", // test 前设置环境变量
    test: "jest",                       // 运行测试
    posttest: "npm run lint",           // test 后运行 lint
    // 其他
    lint: "eslint src",
    format: "prettier --write .",
    deploy: "npm run build && npm run publish",
  },

  // --- 依赖 ---
  dependencies: {                   // 生产依赖（运行时需要）
    express: "^4.18.2",             // ^ 允许 4.x.x
    lodash: "~4.17.21",             // ~ 允许 4.17.x
    mysql2: "3.6.0",                // 精确版本
    "dotenv": "^16.3.1",
  },
  devDependencies: {                // 开发依赖（仅开发时需要）
    jest: "^29.7.0",
    eslint: "^8.50.0",
    webpack: "^5.89.0",
    "cross-env": "^7.0.3",
    rimraf: "^5.0.5",
  },
  peerDependencies: {               // 同伴依赖（需要宿主提供）
    react: ">=16.0.0",
  },
  optionalDependencies: {           // 可选依赖（安装失败不报错）
    fsevents: "^2.3.2",             // macOS 文件监视
  },

  // --- 环境限制 ---
  engines: {                        // 运行环境版本要求
    node: ">=18.0.0",
    npm: ">=9.0.0",
  },
  os: ["darwin", "linux", "win32"], // 支持的操作系统
  cpu: ["x64", "arm64"],            // 支持的 CPU 架构

  // --- 其他 ---
  private: false,                   // false=可发布, true=不可发布
  workspaces: ["packages/*"],       // monorepo 工作空间
  publishConfig: {                  // 发布配置
    registry: "https://registry.npmjs.org/",
    access: "public",
  },
  config: {                         // 脚本中可用的配置
    port: "3000",
  },
};

// 打印完整 package.json
console.log("完整的 package.json：");
console.log(JSON.stringify(packageJson, null, 2));

// 字段解析
console.log("\\n--- 关键字段解析 ---");
console.log("包名:", packageJson.name);
console.log("版本:", packageJson.version);
console.log("模块系统:", packageJson.type);
console.log("CommonJS 入口:", packageJson.main);
console.log("ES Module 入口:", packageJson.module);
console.log("生产依赖数:", Object.keys(packageJson.dependencies).length);
console.log("开发依赖数:", Object.keys(packageJson.devDependencies).length);
console.log("脚本数:", Object.keys(packageJson.scripts).length);

// ============================================================
// 第二部分：语义化版本（SemVer）解析与比较
// ============================================================

console.log("\\n========== 第二部分：语义化版本 SemVer ==========");

// --- SemVer 版本号解析器 ---
// 把 "1.4.2-beta.1+build.123" 解析成结构化对象
function parseSemVer(version) {
  // 正则匹配：主版本.次版本.修订号-预发布+构建
  const match = version.match(
    /^(\\d+)\\.(\\d+)\\.(\\d+)(?:-([a-zA-Z0-9.]+))?(?:\\+([a-zA-Z0-9.]+))?$/
  );
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),       // 主版本
    minor: parseInt(match[2], 10),       // 次版本
    patch: parseInt(match[3], 10),       // 修订号
    prerelease: match[4] || null,        // 预发布标签（如 alpha.1）
    build: match[5] || null,             // 构建元数据
    raw: version,                        // 原始字符串
  };
}

// 比较两个 SemVer 版本
// 返回: -1 (v1 < v2), 0 (v1 == v2), 1 (v1 > v2)
function compareSemVer(v1, v2) {
  const p1 = parseSemVer(v1);
  const p2 = parseSemVer(v2);
  if (!p1 || !p2) throw new Error("无效的版本号");

  // 1. 比较主版本
  if (p1.major !== p2.major) return p1.major < p2.major ? -1 : 1;
  // 2. 比较次版本
  if (p1.minor !== p2.minor) return p1.minor < p2.minor ? -1 : 1;
  // 3. 比较修订号
  if (p1.patch !== p2.patch) return p1.patch < p2.patch ? -1 : 1;

  // 4. 比较预发布版本
  // 有预发布的 < 无预发布的（1.0.0-beta < 1.0.0）
  if (p1.prerelease && !p2.prerelease) return -1;
  if (!p1.prerelease && p2.prerelease) return 1;
  if (p1.prerelease && p2.prerelease) {
    // 比较预发布标签
    const pre1 = p1.prerelease.split(".");
    const pre2 = p2.prerelease.split(".");
    for (let i = 0; i < Math.max(pre1.length, pre2.length); i++) {
      if (pre1[i] === undefined) return -1;
      if (pre2[i] === undefined) return 1;
      const n1 = parseInt(pre1[i], 10);
      const n2 = parseInt(pre2[i], 10);
      if (!isNaN(n1) && !isNaN(n2)) {
        if (n1 !== n2) return n1 < n2 ? -1 : 1;
      } else {
        if (pre1[i] !== pre2[i]) {
          return pre1[i] < pre2[i] ? -1 : 1;
        }
      }
    }
    return 0;
  }
  return 0; // 完全相等（忽略构建元数据）
}

// --- 测试版本解析 ---
console.log("\\n--- 1. 版本号解析 ---");
const testVersions = ["1.4.2", "2.0.0", "1.5.0-beta.1", "1.5.0-alpha.3", "1.5.0-rc.1", "1.5.0+build.123"];
testVersions.forEach((v) => {
  const parsed = parseSemVer(v);
  console.log("  " + v.padEnd(22) + "→ 主:" + parsed.major + " 次:" + parsed.minor + " 修:" + parsed.patch + 
    (parsed.prerelease ? " 预发布:" + parsed.prerelease : "") +
    (parsed.build ? " 构建:" + parsed.build : ""));
});

// --- 测试版本比较 ---
console.log("\\n--- 2. 版本比较 ---");
const comparisons = [
  ["1.0.0", "2.0.0"],     // -1 (主版本不同)
  ["1.0.0", "1.1.0"],     // -1 (次版本不同)
  ["1.0.0", "1.0.1"],     // -1 (修订号不同)
  ["1.0.0", "1.0.0"],     // 0  (相同)
  ["2.0.0", "1.9.9"],     // 1  (主版本更大)
  ["1.0.0", "1.0.0-beta"], // 1  (正式版 > 预发布)
  ["1.0.0-alpha", "1.0.0-beta"], // -1 (alpha < beta)
  ["1.0.0-alpha.1", "1.0.0-alpha.2"], // -1
  ["1.0.0-rc.1", "1.0.0-rc.2"], // -1
];
comparisons.forEach(([v1, v2]) => {
  const result = compareSemVer(v1, v2);
  const symbol = result < 0 ? "<" : result > 0 ? ">" : "==";
  console.log("  " + v1 + " " + symbol + " " + v2);
});

// --- 版本范围匹配（^ 和 ~）---
console.log("\\n--- 3. 版本范围匹配 ---");

// 检查版本是否匹配 ^ 范围
function matchesCaret(version, range) {
  const v = parseSemVer(version);
  const r = parseSemVer(range);
  if (!v || !r) return false;

  // ^1.4.2 → >=1.4.2 <2.0.0
  // ^0.2.3 → >=0.2.3 <0.3.0（0.x 特殊处理）
  // ^0.0.3 → >=0.0.3 <0.0.4（0.0.x 特殊处理）
  if (r.major !== 0) {
    return v.major === r.major && 
           (v.minor > r.minor || (v.minor === r.minor && v.patch >= r.patch));
  } else if (r.minor !== 0) {
    return v.major === 0 && v.minor === r.minor && v.patch >= r.patch;
  } else {
    return v.major === 0 && v.minor === 0 && v.patch === r.patch;
  }
}

// 检查版本是否匹配 ~ 范围
function matchesTilde(version, range) {
  const v = parseSemVer(version);
  const r = parseSemVer(range);
  if (!v || !r) return false;

  // ~1.4.2 → >=1.4.2 <1.5.0
  return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
}

// 测试 ^ 范围
console.log("  ^1.4.2 范围匹配：");
const caretTests = ["1.4.2", "1.4.3", "1.5.0", "1.9.9", "2.0.0", "1.4.1"];
caretTests.forEach((v) => {
  const matches = matchesCaret(v, "1.4.2");
  console.log("    " + v + ": " + (matches ? "✓ 匹配" : "✗ 不匹配"));
});

// 测试 ~ 范围
console.log("  ~1.4.2 范围匹配：");
const tildeTests = ["1.4.2", "1.4.3", "1.4.9", "1.5.0", "1.3.9"];
tildeTests.forEach((v) => {
  const matches = matchesTilde(v, "1.4.2");
  console.log("    " + v + ": " + (matches ? "✓ 匹配" : "✗ 不匹配"));
});

// --- 版本范围总结表 ---
console.log("\\n--- 4. 版本范围符号总结 ---");
const rangeTable = [
  ["^1.4.2", ">=1.4.2 <2.0.0", "允许 1.x.x（不升主版本）", "最常用"],
  ["~1.4.2", ">=1.4.2 <1.5.0", "允许 1.4.x（不升次版本）", "较保守"],
  ["1.4.2",  "=1.4.2",         "精确版本", "最安全"],
  [">=1.4.2", ">=1.4.2",       "大于等于", "少用"],
  ["<2.0.0", "<2.0.0",         "小于 2.0", "限制上限"],
  ["1.x", ">=1.0.0 <2.0.0", "通配符", "等价 ^1.0.0"],
  ["*", "任意版本", "任意", "危险，不推荐"],
  ["latest", "最新版", "最新发布", "不安全"],
];
console.log("  符号        范围                   说明                    备注");
console.log("  " + "-".repeat(85));
rangeTable.forEach((row) => {
  console.log("  " + row[0].padEnd(11) + row[1].padEnd(22) + row[2].padEnd(24) + row[3]);
});

// ============================================================
// 第三部分：npm scripts 的 pre/post 钩子模拟
// ============================================================

console.log("\\n========== 第三部分：npm scripts 钩子模拟 ==========");

// --- 模拟 npm run 的执行器 ---
// 实现 pre/post 钩子逻辑
class NpmScriptRunner {
  constructor(scripts) {
    this.scripts = scripts;     // scripts 对象
    this.log = [];              // 执行日志
  }

  // 运行脚本（含 pre/post 钩子）
  run(scriptName) {
    const preHook = "pre" + scriptName;
    const postHook = "post" + scriptName;
    const main = this.scripts[scriptName];
    const pre = this.scripts[preHook];
    const post = this.scripts[postHook];

    console.log("\\n  $ npm run " + scriptName);
    console.log("  " + "─".repeat(50));

    // 1. 执行 pre 钩子（如果存在）
    if (pre) {
      this._execute(preHook, pre);
    }

    // 2. 执行主脚本
    if (main) {
      this._execute(scriptName, main);
    } else {
      console.log("  [错误] 脚本 '" + scriptName + "' 不存在");
      console.log("  可用脚本:", Object.keys(this.scripts).filter(s => !s.startsWith("pre") && !s.startsWith("post")).join(", "));
      return;
    }

    // 3. 执行 post 钩子（如果存在）
    if (post) {
      this._execute(postHook, post);
    }

    console.log("  " + "─".repeat(50));
    console.log("  ✓ 完成");
  }

  // 执行单个脚本（模拟）
  _execute(name, command) {
    console.log("  > " + name + ": " + command);
    // 模拟执行
    if (command.includes("rimraf")) {
      console.log("    [模拟] 清理 dist 目录...");
    } else if (command.includes("webpack")) {
      console.log("    [模拟] webpack 打包中...");
      console.log("    [模拟] 输出: dist/main.js (250KB), dist/vendor.js (1.2MB)");
    } else if (command.includes("jest")) {
      console.log("    [模拟] 运行 42 个测试...");
      console.log("    [模拟] 全部通过 ✓ (耗时 3.2s)");
    } else if (command.includes("eslint")) {
      console.log("    [模拟] 检查 28 个文件...");
      console.log("    [模拟] 无错误，2 个警告");
    } else if (command.includes("cross-env")) {
      console.log("    [模拟] 设置 NODE_ENV=test");
    } else if (command.includes("echo")) {
      console.log("    [模拟] 输出: " + command.replace(/.*echo /, ""));
    } else if (command.includes("node")) {
      console.log("    [模拟] 启动 Node.js 服务...");
    } else {
      console.log("    [模拟] 执行命令...");
    }
    this.log.push(name);
  }

  // 列出所有可用脚本
  list() {
    console.log("\\n  可用脚本列表：");
    Object.keys(this.scripts).forEach((name) => {
      const isHook = name.startsWith("pre") || name.startsWith("post");
      const marker = isHook ? "  (钩子)" : "";
      console.log("    " + name.padEnd(15) + this.scripts[name] + marker);
    });
  }
}

// 创建脚本运行器
const runner = new NpmScriptRunner(packageJson.scripts);

// 列出所有脚本
runner.list();

// 运行 build（会自动执行 prebuild → build → postbuild）
console.log("\\n--- 运行 npm run build（含 pre/post 钩子）---");
runner.run("build");

// 运行 test（会自动执行 pretest → test → posttest）
console.log("\\n--- 运行 npm test（含 pre/post 钩子）---");
runner.run("test");

// 运行一个没有钩子的脚本
console.log("\\n--- 运行 npm run lint（无钩子）---");
runner.run("lint");

// 运行不存在的脚本
console.log("\\n--- 运行不存在的脚本 ---");
runner.run("deploy");

// ============================================================
// 第四部分：依赖分析工具
// ============================================================

console.log("\\n========== 第四部分：依赖分析 ==========");

// --- 分析 package.json 的依赖 ---
function analyzeDependencies(pkg) {
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  const peerDeps = pkg.peerDependencies || {};
  const optionalDeps = pkg.optionalDependencies || {};

  console.log("\\n--- 依赖统计 ---");
  console.log("  dependencies:       " + Object.keys(deps).length + " 个");
  console.log("  devDependencies:    " + Object.keys(devDeps).length + " 个");
  console.log("  peerDependencies:   " + Object.keys(peerDeps).length + " 个");
  console.log("  optionalDependencies: " + Object.keys(optionalDeps).length + " 个");

  // 分析版本范围使用情况
  console.log("\\n--- 版本范围使用统计 ---");
  const allDeps = { ...deps, ...devDeps };
  const rangeStats = { caret: 0, tilde: 0, exact: 0, other: 0 };

  Object.entries(allDeps).forEach(([name, version]) => {
    if (version.startsWith("^")) rangeStats.caret++;
    else if (version.startsWith("~")) rangeStats.tilde++;
    else if (/^\\d+/.test(version)) rangeStats.exact++;
    else rangeStats.other++;
  });
  console.log("  ^ (兼容版本): " + rangeStats.caret + " 个");
  console.log("  ~ (近似版本): " + rangeStats.tilde + " 个");
  console.log("  精确版本:     " + rangeStats.exact + " 个");
  console.log("  其他:         " + rangeStats.other + " 个");

  // 列出所有依赖
  console.log("\\n--- 生产依赖列表 ---");
  Object.entries(deps).forEach(([name, version]) => {
    console.log("  " + name.padEnd(20) + version);
  });

  console.log("\\n--- 开发依赖列表 ---");
  Object.entries(devDeps).forEach(([name, version]) => {
    console.log("  " + name.padEnd(20) + version);
  });

  // 版本范围建议
  console.log("\\n--- 版本范围建议 ---");
  if (rangeStats.caret > 0) {
    console.log("  ^ 依赖较多: 建议提交 package-lock.json 保证一致性");
  }
  if (rangeStats.exact === 0 && Object.keys(allDeps).length > 0) {
    console.log("  无精确版本: 关键依赖建议用 save-exact 锁定");
  }
}

analyzeDependencies(packageJson);

// --- npm 命令速查表 ---
console.log("\\n========== npm 命令速查表 ==========");
const commandTable = [
  ["安装相关", "npm install / npm i", "安装所有依赖"],
  ["", "npm i <pkg>", "安装包到 dependencies"],
  ["", "npm i -D <pkg>", "安装到 devDependencies"],
  ["", "npm i -g <pkg>", "全局安装"],
  ["", "npm ci", "CI 环境严格安装（按 lock）"],
  ["卸载更新", "npm uninstall <pkg>", "卸载包"],
  ["", "npm update", "更新所有依赖"],
  ["", "npm outdated", "查看过时依赖"],
  ["项目管理", "npm init -y", "快速生成 package.json"],
  ["", "npm run <script>", "运行脚本"],
  ["", "npm test / npm t", "运行测试"],
  ["发布相关", "npm publish", "发布包"],
  ["", "npm version <type>", "升级版本号"],
  ["", "npm deprecate <pkg>", "标记废弃"],
  ["查看信息", "npm list", "查看依赖树"],
  ["", "npm info <pkg>", "查看包信息"],
  ["", "npm audit", "安全漏洞检查"],
  ["配置缓存", "npm config set registry", "设置镜像源"],
  ["", "npm cache clean --force", "清除缓存"],
];
commandTable.forEach((row) => {
  if (row[0]) console.log("\\n  [" + row[0] + "]");
  console.log("    " + row[1].padEnd(28) + row[2]);
});

console.log("\\n========== npm 章节演示结束 ==========");`,
  },

  // =========================================================
  // 第四章：调试技巧
  // =========================================================
  {
    id: "debugging",
    title: "调试技巧",
    icon: "🐛",
    group: "工程化",
    content: `## 调试技巧

调试是程序员最重要的技能之一。有人说"编程是 20% 写代码 + 80% 调试"。Node.js 提供了丰富的调试工具——从简单的 \`console.log\` 到强大的 Chrome DevTools 调试器，从性能分析到内存泄漏检测。掌握这些工具，能让你在面对 bug 时事半功倍。

### 调试的重要性

#### 为什么调试很重要

1. **bug 不可避免**：即使是最优秀的程序员也会写出 bug。重要的是能快速定位和修复。
2. **生产环境问题更难排查**：本地能复现的 bug 好解决，生产环境偶发的 bug 才是噩梦。
3. **理解代码运行机制**：调试过程也是深入理解代码执行流程的过程。
4. **性能优化的前提**：不经过性能分析就优化，往往是"盲优化"。

#### 调试的层次

\`\`\`
调试的三个层次：
  ┌─────────────────────────────────────┐
  │  Level 1: 修复 bug（最低要求）        │
  │  → 找到原因，修复，测试通过            │
  ├─────────────────────────────────────┤
  │  Level 2: 理解 bug（进阶）            │
  │  → 理解为什么会出现，根本原因是什么     │
  ├─────────────────────────────────────┤
  │  Level 3: 预防 bug（最高境界）        │
  │  → 总结模式，改进流程，防止类似问题     │
  └─────────────────────────────────────┘
\`\`\`

### console 调试技巧

\`console\` 是最简单也最常用的调试工具。但很多人只知道 \`console.log\`，其实 console 家族有很多强大的方法。

#### console 方法大全

| 方法 | 说明 | 使用场景 |
| --- | --- | --- |
| \`console.log()\` | 普通输出 | 日常调试 |
| \`console.info()\` | 信息输出 | 同 log，语义化 |
| \`console.warn()\` | 警告输出 | 潜在问题 |
| \`console.error()\` | 错误输出 | 错误信息 |
| \`console.debug()\` | 调试输出 | 开发时调试（可过滤） |
| \`console.table()\` | 表格输出 | 数组/对象可视化 |
| \`console.dir()\` | 对象详情 | 查看对象结构 |
| \`console.trace()\` | 堆栈追踪 | 查看调用链 |
| \`console.time()\` / \`timeEnd()\` | 计时 | 测量代码耗时 |
| \`console.timeLog()\` | 中途输出计时 | 不停止计时器输出当前时间 |
| \`console.group()\` / \`groupEnd()\` | 分组输出 | 组织相关日志 |
| \`console.groupCollapsed()\` | 折叠分组 | 默认折叠的分组 |
| \`console.assert()\` | 断言 | 条件为 false 时输出 |
| \`console.count()\` | 计数 | 统计代码执行次数 |
| \`console.countReset()\` | 重置计数 | 重置 count 计数器 |
| \`console.clear()\` | 清屏 | 清空控制台 |

#### console.log 的格式化

\`console.log\` 支持 printf 风格的格式化占位符：

| 占位符 | 说明 | 示例 |
| --- | --- | --- |
| \`%s\` | 字符串 | \`console.log('Name: %s', 'Alice')\` |
| \`%d\` / \`%i\` | 整数 | \`console.log('Age: %d', 25)\` |
| \`%f\` | 浮点数 | \`console.log('PI: %f', 3.14)\` |
| \`%j\` | JSON | \`console.log('Data: %j', {a:1})\` |
| \`%o\` | 对象 | \`console.log('Obj: %o', obj)\` |
| \`%O\` | 对象（详细） | \`console.log('Obj: %O', obj)\` |
| \`%c\` | CSS 样式 | \`console.log('%cRed', 'color:red')\` |

\`\`\`javascript
const user = { name: 'Alice', age: 25 };
console.log('用户 %s，年龄 %d，详情 %o', user.name, user.age, user);
// 输出: 用户 Alice，年龄 25，详情 { name: 'Alice', age: 25 }
\`\`\`

#### console.table 表格输出

\`console.table\` 非常适合展示数组或对象的数据：

\`\`\`javascript
const users = [
  { name: 'Alice', age: 25, city: '北京' },
  { name: 'Bob', age: 30, city: '上海' },
  { name: 'Charlie', age: 35, city: '广州' },
];
console.table(users);
// 输出表格：
// ┌─────────┬───────────┬──────┬────────┐
// │ (index) │   name    │ age  │  city  │
// ├─────────┼───────────┼──────┼────────┤
// │    0    │  'Alice'  │  25  │ '北京'  │
// │    1    │   'Bob'   │  30  │ '上海'  │
// │    2    │ 'Charlie' │  35  │ '广州'  │
// └─────────┴───────────┴──────┴────────┘

// 也可以只显示指定列
console.table(users, ['name', 'age']);
\`\`\`

#### console.time 计时

\`\`\`javascript
console.time('循环耗时');
for (let i = 0; i < 1000000; i++) {
  // 模拟耗时操作
}
console.timeEnd('循环耗时');
// 输出: 循环耗时: 15.234ms

// 中途输出（不停止计时器）
console.time('total');
// ... 操作 A
console.timeLog('total'); // 输出当前耗时
// ... 操作 B
console.timeEnd('total'); // 输出总耗时
\`\`\`

#### console.trace 堆栈追踪

\`\`\`console.trace\` 输出当前的调用栈，帮你理解"是谁调用了这个函数"：

\`\`\`javascript
function deepFunction() {
  console.trace('追踪调用栈');
}

function middleFunction() {
  deepFunction();
}

function topFunction() {
  middleFunction();
}

topFunction();
// 输出:
// Trace: 追踪调用栈
//     at deepFunction (file.js:2:11)
//     at middleFunction (file.js:6:3)
//     at topFunction (file.js:10:3)
//     at Object.<anonymous> (file.js:13:1)
\`\`\`

#### console.group 分组输出

\`\`\`javascript
console.group('用户管理');
console.log('创建用户: Alice');
console.log('创建用户: Bob');
  console.group('权限设置');
  console.log('Alice: admin');
  console.log('Bob: user');
  console.groupEnd();
console.groupEnd();
\`\`\`

#### console.count 计数

\`\`\`javascript
function processItem(item) {
  console.count('processItem 调用次数');
  // ...
}
processItem('a'); // processItem 调用次数: 1
processItem('b'); // processItem 调用次数: 2
processItem('c'); // processItem 调用次数: 3
\`\`\`

#### console.assert 断言

\`\`\`javascript
// 条件为 false 时才输出
console.assert(1 + 1 === 2, '数学正确'); // 不输出（条件为 true）
console.assert(1 + 1 === 3, '数学错误！'); // 输出: Assertion failed: 数学错误！
\`\`\`

### Node.js Inspector 详解

Node.js 内置了基于 Chrome DevTools Protocol 的调试器，可以用 Chrome 浏览器进行可视化调试。

#### 启动调试器

\`\`\`bash
# 方式 1：启动后可附加调试器（程序继续运行）
node --inspect app.js

# 方式 2：启动后在第一行暂停（等待调试器连接）
node --inspect-brk app.js

# 指定调试端口（默认 9229）
node --inspect=9229 app.js
node --inspect-brk=127.0.0.1:9229 app.js

# 远程调试（监听所有地址）
node --inspect=0.0.0.0:9229 app.js
\`\`\`

启动后会看到类似输出：

\`\`\`
Debugger listening on ws://127.0.0.1:9229/abc-123-def
For help, see: https://nodejs.org/en/docs/inspector
\`\`\`

#### 连接 Chrome DevTools

1. 在 Chrome 浏览器地址栏输入 \`chrome://inspect\`
2. 点击 "configure" 添加 \`localhost:9229\`
3. 在 "Remote Target" 中点击你的 Node.js 应用旁的 "inspect"
4. DevTools 调试面板打开，可以开始调试

#### 断点类型

| 断点类型 | 说明 | 使用方式 |
| --- | --- | --- |
| **普通断点** | 代码执行到此处暂停 | 点击行号旁的灰色区域 |
| **条件断点** | 满足条件才暂停 | 右键行号 → "Add conditional breakpoint" |
| **Logpoint** | 输出日志但不暂停 | 右键行号 → "Add logpoint" |
| **行内断点** | 在同一行内设置多个断点 | 复杂表达式的细粒度断点 |

##### 条件断点示例

\`\`\`
// 只在 i === 500 时暂停
for (let i = 0; i < 1000; i++) {
  if (i === 500) {  // ← 在这行设置条件断点: i === 500
    console.log(i);
  }
}
\`\`\`

条件断点非常适合调试循环中的特定迭代，不需要手动添加 \`if\` 判断。

##### Logpoint 示例

Logpoint 类似于"不打断的 console.log"——在不暂停执行的情况下输出日志。适合不想修改代码但又想看变量值的场景。

#### 步进调试

| 操作 | 快捷键 | 说明 |
| --- | --- | --- |
| **Continue** | F8 | 继续执行到下一个断点 |
| **Step Over** | F10 | 执行下一行（不进入函数内部） |
| **Step Into** | F11 | 执行下一行（进入函数内部） |
| **Step Out** | Shift+F11 | 执行到当前函数结束 |
| **Step** | F9 | 执行下一步（同 Step Into） |
| **Restart** | Ctrl+Shift+F10 | 重新开始调试 |
| **Stop** | Shift+F5 | 停止调试 |

\`\`\`
Step Over vs Step Into:
  function outer() {
    const result = inner();  ← 在这行暂停
    console.log(result);
  }

  Step Over (F10): 执行 inner()，在 console.log 暂停
    → 不会进入 inner 函数内部

  Step Into (F11): 进入 inner 函数
    → 在 inner 函数的第一行暂停
\`\`\`

#### Watch 表达式

在 DevTools 的 Watch 面板中，可以添加表达式来实时监控变量值：

\`\`\`
Watch 表达式示例：
  i              → 当前循环变量值
  arr.length     → 数组长度
  this.context   → 当前上下文
  JSON.stringify(obj) → 对象的字符串表示
\`\`\`

#### Call Stack 调用栈

调用栈面板显示当前的函数调用链——从底部（入口点）到顶部（当前执行位置）。点击栈中的每一帧可以跳到对应的代码位置，查看该帧的变量。

### VS Code 调试

VS Code 内置了强大的 Node.js 调试支持，比 Chrome DevTools 更方便（不需要切换浏览器）。

#### 基本调试

1. 打开 JS 文件
2. 在行号旁点击设置断点（红点）
3. 按 \`F5\` 启动调试
4. 选择 "Node.js" 环境

#### launch.json 配置

在 \`.vscode/launch.json\` 中配置调试任务：

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动程序",
      "program": "\${workspaceFolder}/app.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "调试当前文件",
      "program": "\${file}",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "带参数启动",
      "program": "\${workspaceFolder}/app.js",
      "args": ["--port", "3000", "--debug"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "通过 npm 启动",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229
    },
    {
      "type": "node",
      "request": "attach",
      "name": "附加到进程",
      "port": 9229,
      "restart": true,
      "localRoot": "\${workspaceFolder}",
      "remoteRoot": "/app"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Mocha 测试",
      "program": "\${workspaceFolder}/node_modules/.bin/mocha",
      "args": ["--inspect-brk", "test/"],
      "console": "integratedTerminal"
    }
  ]
}
\`\`\`

| 字段 | 说明 |
| --- | --- |
| \`type\` | 调试器类型（node） |
| \`request\` | launch（启动新进程）或 attach（附加到已有进程） |
| \`name\` | 配置名称（显示在调试面板下拉框） |
| \`program\` | 要调试的入口文件 |
| \`args\` | 命令行参数 |
| \`env\` | 环境变量 |
| \`cwd\` | 工作目录 |
| \`port\` | 调试端口（attach 时用） |
| \`runtimeExecutable\` | 运行时（npm/nodemon 等） |
| \`runtimeArgs\` | 运行时参数 |
| \`skipFiles\` | 调试时跳过的文件（如 node 内部模块） |
| \`console\` | 输出到哪（integratedTerminal/internalConsole） |
| \`restart\` | 进程退出后是否自动重启 |
| \`stopOnEntry\` | 是否在第一行暂停 |

#### VS Code 调试技巧

1. **条件断点**：右键断点 → "Edit Breakpoint" → 输入条件
2. **Logpoint**：右键行号 → "Add Logpoint" → 输入要输出的表达式
3. **内联值**：调试时变量值直接显示在代码旁边
4. **Debug Console**：在调试控制台中执行任意表达式
5. **多配置切换**：在调试面板下拉框选择不同配置

### 常用调试 API

#### process.debugPort

\`\`\`javascript
// 查看当前调试端口（未启用调试时为 undefined）
console.log(process.debugPort); // 9229
\`\`\`

#### inspector 模块

Node.js 的 \`inspector\` 模块提供了与 V8 Inspector 交互的 API：

\`\`\`javascript
const inspector = require('inspector');

// 打开调试器会话
const session = new inspector.Session();
session.connect();

// 发送 V8 Inspector 命令
session.post('Runtime.evaluate', {
  expression: '2 + 2'
}, (err, result) => {
  console.log(result.result.value); // 4
});

// 获取堆快照
session.post('HeapProfiler.takeHeapSnapshot', null, (err, snap) => {
  // snap 是堆快照数据
});

session.disconnect();
\`\`\`

#### --inspect 标志检测

\`\`\`javascript
// 检测是否在调试模式
const isDebugging = typeof process.debugPort === 'number';
console.log('调试模式:', isDebugging);

// 或检测 --inspect 参数
const hasInspectFlag = process.execArgv.some(arg => arg.includes('--inspect'));
\`\`\`

### 性能分析

#### --prof CPU 分析

\`\`\`bash
# 运行并生成 CPU 分析文件（isolate-xxx-v8.log）
node --prof app.js

# 分析生成的日志文件
node --prof-process isolate-xxx-v8.log > profile.txt
\`\`\`

生成的报告包含各函数的执行次数和耗时，帮助你找到性能热点。

#### --cpu-prof CPU 火焰图

\`\`\`bash
# 生成 CPU.Profile 文件（可用 Chrome DevTools 打开）
node --cpu-prof app.js

# 指定文件名
node --cpu-prof --cpu-prof-name=my-profile.cpuprofile app.js

# 指定输出目录
node --cpu-prof --cpu-prof-dir=./profiles app.js
\`\`\`

生成的 \`.cpuprofile\` 文件可以在 Chrome DevTools 的 Performance 面板中打开，查看火焰图。

#### console.time 简单计时

\`\`\`javascript
// 方式 1: console.time
console.time('operation');
// ... 要测量的代码
console.timeEnd('operation');

// 方式 2: process.hrtime（高精度）
const start = process.hrtime.bigint();
// ... 要测量的代码
const end = process.hrtime.bigint();
console.log('耗时:', Number(end - start) / 1e6, 'ms');
\`\`\`

#### clinic.js 性能诊断工具

\`clinic.js\` 是 Node.js 基金会维护的性能诊断工具套件：

\`\`\`bash
# 安装
npm install -g clinic

# 1. doctor - 诊断性能问题
clinic doctor -- node app.js

# 2. flame - 火焰图
clinic flame -- node app.js

# 3. bubbleprof - 异步操作分析
clinic bubbleprof -- node app.js

# 4. heap - 内存分析
clinic heap -- node app.js
\`\`\`

#### 0x 火焰图

\`0x\` 是一个生成火焰图的工具：

\`\`\`bash
npm install -g 0x
0x app.js
# 生成 flamegraph.html，用浏览器打开查看
\`\`\`

#### 性能分析最佳实践

1. **先测量，再优化**：不要凭感觉优化，用工具找到真正的瓶颈
2. **关注热点函数**：80% 的时间花在 20% 的代码上，优化这 20%
3. **对比优化前后**：每次优化后重新测量，确认确实有提升
4. **生产环境采样**：用 \`--prof\` 在生产环境采样（注意性能开销）

### 内存分析

#### process.memoryUsage 监控

\`\`\`javascript
const mem = process.memoryUsage();
console.log({
  rss: (mem.rss / 1024 / 1024).toFixed(2) + ' MB',        // 常驻内存
  heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2) + ' MB', // 堆总量
  heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',  // 堆已用
  external: (mem.external / 1024 / 1024).toFixed(2) + ' MB',  // 外部内存
  arrayBuffers: (mem.arrayBuffers / 1024 / 1024).toFixed(2) + ' MB' // ArrayBuffer
});
\`\`\`

| 字段 | 说明 |
| --- | --- |
| \`rss\` | Resident Set Size，进程占用的物理内存总量 |
| \`heapTotal\` | V8 堆总大小（已分配） |
| \`heapUsed\` | V8 堆实际使用量 |
| \`external\` | V8 管理的 C++ 对象内存（如 Buffer） |
| \`arrayBuffers\` | ArrayBuffer 专用内存 |

#### --heap-prof 堆分析

\`\`\`bash
# 生成堆分析文件
node --heap-prof app.js

# 在 Chrome DevTools Memory 面板中打开
\`\`\`

#### 堆快照（Heap Snapshot）

\`\`\`javascript
const inspector = require('inspector');
const fs = require('fs');

const session = new inspector.Session();
session.connect();

session.post('HeapProfiler.takeHeapSnapshot', null, (err, data) => {
  // data 包含堆快照信息
  // 可以保存为 .heapsnapshot 文件
  fs.writeFileSync('snapshot.heapsnapshot', JSON.stringify(data));
  // 在 Chrome DevTools Memory 面板中加载
});
\`\`\`

#### heapdump 模块

\`\`\`bash
npm install heapdump
\`\`\`

\`\`\`javascript
const heapdump = require('heapdump');

// 手动生成堆快照
heapdump.writeSnapshot('/tmp/snapshot-' + Date.now() + '.heapsnapshot', (err, filename) => {
  console.log('堆快照已保存:', filename);
});

// 或通过信号触发（SIGUSR2）
// kill -USR2 <pid>
\`\`\`

#### 内存泄漏排查

1. **监控趋势**：定时记录 \`heapUsed\`，看是否持续增长
2. **对比快照**：在不同时间点拍堆快照，对比差异
3. **查找泄漏对象**：在 DevTools 中用 "Retained Size" 排序，找到占用最大的对象
4. **常见泄漏模式**：
   - 全局变量未清理
   - 闭包引用大对象
   - 事件监听器未移除
   - 定时器未清除
   - 缓存无限增长

\`\`\`javascript
// 内存监控工具
function monitorMemory(interval = 5000) {
  let maxHeap = 0;
  const timer = setInterval(() => {
    const mem = process.memoryUsage();
    const heapMB = mem.heapUsed / 1024 / 1024;
    if (heapMB > maxHeap) {
      maxHeap = heapMB;
      console.log(\`[内存] 新高: \${heapMB.toFixed(2)} MB (rss: \${(mem.rss / 1024 / 1024).toFixed(2)} MB)\`);
    }
  }, interval);
  return () => clearInterval(timer);
}
\`\`\`

### 常见错误模式与排查

#### 未捕获的 Promise 拒绝

\`\`\`javascript
// 问题：Promise 拒绝没有被 catch
async function riskyTask() {
  throw new Error('操作失败');
}
riskyTask(); // ← 没有 .catch()，变成 unhandledRejection

// 排查方法 1：全局监听
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  console.error('Promise:', promise);
});

// 排查方法 2：用 --trace-warnings 运行
// node --trace-warnings app.js

// 修复：总是 .catch() 或 try/catch
riskyTask().catch(err => console.error(err));
\`\`\`

#### 内存泄漏

\`\`\`javascript
// 常见泄漏 1：全局变量
global.cache = {}; // 永远不清理

// 常见泄漏 2：事件监听器
function setupListener() {
  element.on('data', handler); // 每次调用都注册，不移除
}
// 修复：element.off('data', handler)

// 常见泄漏 3：闭包
function createHandler() {
  const hugeData = getHugeData(); // 大对象
  return () => {
    console.log(hugeData.length); // 闭包持有 hugeData，无法 GC
  };
}
// 修复：只保留需要的部分

// 常见泄漏 4：定时器
function startTimer() {
  setInterval(() => { /* ... */ }, 1000); // 永远不清除
}
// 修复：保存引用，在不需要时 clearInterval
\`\`\`

#### 事件循环阻塞

\`\`\`javascript
// 问题：同步操作阻塞事件循环
app.get('/heavy', (req, res) => {
  const result = heavyComputation(100000000); // 阻塞 5 秒
  res.send(result);
});

// 排查方法：
// 1. 用 clinic doctor 检测
// 2. 用 --trace-event-categories=node.async_hooks 跟踪

// 修复 1：用 Worker Threads
// 修复 2：分片处理（每次处理一部分，用 setImmediate 让出）
function chunkedProcess(data, callback) {
  let i = 0;
  function processChunk() {
    const end = Math.min(i + 1000, data.length);
    for (; i < end; i++) {
      // 处理 data[i]
    }
    if (i < data.length) {
      setImmediate(processChunk); // 让出事件循环
    } else {
      callback();
    }
  }
  processChunk();
}
\`\`\`

### 日志最佳实践

在生产环境中，\`console.log\` 不够用。需要专业的日志库来管理日志级别、格式化、轮转、传输等。

#### winston 简介

\`winston\` 是最流行的 Node.js 日志库：

\`\`\`javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('服务器启动', { port: 3000 });
logger.error('数据库连接失败', { error: err.message });
\`\`\`

#### pino 简介

\`pino\` 是高性能日志库（比 winston 快 5~10 倍）：

\`\`\`javascript
const pino = require('pino');

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

logger.info('服务器启动', { port: 3000 });
logger.error({ err }, '数据库连接失败');
\`\`\`

#### 日志最佳实践

| 实践 | 说明 |
| --- | --- |
| 用日志级别 | DEBUG/INFO/WARN/ERROR，生产环境设 INFO 或以上 |
| 结构化日志 | 输出 JSON 格式，方便 ELK 等工具解析 |
| 加上下文 | 每条日志附带 requestId/userId 等追踪信息 |
| 不要日志密码 | 敏感信息（密码/token）不能出现在日志中 |
| 异步写入 | 日志 I/O 不应阻塞主线程 |
| 日志轮转 | 防止日志文件无限增长 |
| 集中收集 | 用 ELK/Splunk/CloudWatch 集中管理 |

> 下面通过代码演示 console 调试技巧、堆栈追踪、内存监控和性能计时器工具。`,

    code: `// ============================================================
// 第四章代码演示：调试技巧
// ------------------------------------------------------------
// 本 demo 演示：
//   1. console 系列调试方法（time/dir/trace/group/table/count）
//   2. 用 Error.stack 获取调用栈
//   3. 用 process.memoryUsage 监控内存
//   4. 实现一个性能计时器工具
//   5. 模拟内存泄漏检测
// ============================================================

const util = require("util");

// --- 沙箱兼容性 polyfill ---
// 教程运行在 vm 沙箱中，沙箱的 console 只实现了基础方法（log/info/warn/
// error/debug/table/dir/trace），缺少 time/timeEnd/timeLog/group/groupEnd。
// 这里给它们补上简易实现，让下面的演示代码可以正常运行。
// （真实 Node.js 环境里这些方法都是 console 原生自带的，无需 polyfill）
if (typeof console.time !== "function") {
  // 计时器表：记录每个 label 的开始时间
  const _timers = {};
  // group 缩进层级
  let _groupIndent = "";

  // 取高精度时间戳（纳秒）。沙箱里 process.hrtime 是被 .bind 过的函数，
  // 直接调用 process.hrtime.bigint() 会失败（bigint 是属性不是方法），
  // 所以这里用 Date.now() 做毫秒级计时，足够演示用途。
  function nowNs() {
    return Date.now() * 1e6;
  }

  console.time = function (label) {
    _timers[label] = nowNs();
  };
  console.timeEnd = function (label) {
    if (_timers[label] === undefined) {
      console.log(label + ": 计时器不存在");
      return;
    }
    const elapsed = nowNs() - _timers[label];
    // 转换为毫秒
    console.log(label + ": " + (elapsed / 1e6).toFixed(3) + "ms");
    delete _timers[label];
  };
  console.timeLog = function (label) {
    if (_timers[label] === undefined) {
      console.log(label + ": 计时器不存在");
      return;
    }
    const elapsed = nowNs() - _timers[label];
    console.log(label + ": " + (elapsed / 1e6).toFixed(3) + "ms");
  };
  console.group = function () {
    console.log(_groupIndent + "┌ " + Array.prototype.slice.call(arguments).join(" "));
    _groupIndent += "│ ";
  };
  console.groupCollapsed = console.group;
  console.groupEnd = function () {
    if (_groupIndent.length >= 2) _groupIndent = _groupIndent.slice(2);
    console.log(_groupIndent + "└");
  };
  // count/countReset：统计某个 label 被调用的次数
  const _counters = {};
  console.count = function (label) {
    label = label === undefined ? "default" : label;
    _counters[label] = (_counters[label] || 0) + 1;
    console.log(label + ": " + _counters[label]);
  };
  console.countReset = function (label) {
    label = label === undefined ? "default" : label;
    _counters[label] = 0;
  };
  // console.assert：断言失败时输出错误
  if (typeof console.assert !== "function") {
    console.assert = function (condition) {
      if (!condition) {
        var args = Array.prototype.slice.call(arguments, 1);
        console.log("Assertion failed:", args.join(" "));
      }
    };
  }
}

// ============================================================
// 第一部分：console 调试技巧
// ============================================================

console.log("========== 第一部分：console 调试技巧 ==========");

// --- 1. console.table 表格输出 ---
console.log("\\n--- 1. console.table 表格输出 ---");
const users = [
  { id: 1, name: "Alice", age: 25, role: "admin" },
  { id: 2, name: "Bob", age: 30, role: "user" },
  { id: 3, name: "Charlie", age: 35, role: "user" },
];
console.table(users);

// --- 2. console.dir 对象详情 ---
console.log("\\n--- 2. console.dir 对象详情 ---");
const complexObj = {
  name: "Node.js",
  version: "20.10.0",
  features: ["ESM", "Worker Threads", "Fetch API"],
  nested: {
    deep: {
      value: "深层嵌套数据",
    },
  },
};
// console.dir 可以控制深度
console.log("默认深度（2层）:");
console.dir(complexObj, { depth: 2, colors: false });
console.log("\\n完整深度（null = 无限）:");
console.dir(complexObj, { depth: null, colors: false });

// --- 3. console.time / timeEnd / timeLog ---
console.log("\\n--- 3. console.time 计时 ---");
console.time("总耗时");

// 操作 A
console.time("操作A");
let sum = 0;
for (let i = 0; i < 500000; i++) sum += i;
console.timeEnd("操作A");

// 操作 B
console.time("操作B");
const arr = new Array(100000).fill(0).map((_, i) => i * 2);
console.timeEnd("操作B");

// 中途输出总耗时（不停止计时器）
console.timeLog("总耗时");

// 操作 C
console.time("操作C");
arr.reduce((a, b) => a + b, 0);
console.timeEnd("操作C");

console.timeEnd("总耗时");

// --- 4. console.trace 堆栈追踪 ---
console.log("\\n--- 4. console.trace 堆栈追踪 ---");

function level3() {
  // 输出当前调用栈
  console.trace("追踪调用栈（从 level3）");
}

function level2() {
  level3();
}

function level1() {
  level2();
}

console.log("调用 level1() 触发 trace：");
level1();

// --- 5. console.group 分组输出 ---
console.log("\\n--- 5. console.group 分组输出 ---");
console.group("用户管理模块");
console.log("初始化用户服务...");
console.log("加载用户数据: 3 条记录");
  console.group("处理用户 Alice");
  console.log("验证权限: admin");
  console.log("更新最后登录时间");
  console.groupEnd();
  console.group("处理用户 Bob");
  console.log("验证权限: user");
  console.log("更新最后登录时间");
  console.groupEnd();
console.log("用户处理完成");
console.groupEnd();

// --- 6. console.count 计数 ---
console.log("\\n--- 6. console.count 计数 ---");
function processItem(item) {
  // 统计该函数被调用的次数
  console.count("processItem 调用");
  return item * 2;
}
for (let i = 0; i < 5; i++) {
  processItem(i);
}
console.countReset("processItem 调用"); // 重置计数器
console.log("（计数器已重置）");
processItem(100);
console.count("processItem 调用");

// --- 7. console.assert 断言 ---
console.log("\\n--- 7. console.assert 断言 ---");
function assertCondition(condition, message) {
  // 条件为 false 时输出错误
  console.assert(condition, "断言失败: " + message);
}

assertCondition(1 + 1 === 2, "加法正确"); // 不会输出
assertCondition(1 + 1 === 3, "加法错误"); // 会输出
assertCondition(typeof users === "object", "users 是对象"); // 不会输出
assertCondition(users.length === 5, "用户数应为5"); // 会输出

// ============================================================
// 第二部分：Error.stack 调用栈分析
// ============================================================

console.log("\\n========== 第二部分：Error.stack 调用栈 ==========");

// --- 创建自定义错误并分析堆栈 ---
function createUserError(userId) {
  // 在这里抛出错误
  throw new Error("用户 " + userId + " 不存在");
}

function fetchUser(userId) {
  // 调用可能出错的操作
  return createUserError(userId);
}

function handleRequest(requestId, userId) {
  // 处理请求
  return fetchUser(userId);
}

console.log("\\n--- 捕获错误并分析堆栈 ---");
try {
  handleRequest("REQ-001", 999);
} catch (err) {
  // err.name: 错误类型名称
  console.log("错误名称:", err.name);
  // err.message: 错误信息
  console.log("错误信息:", err.message);
  // err.stack: 完整堆栈（包含 name + message + 调用栈）
  console.log("\\n完整堆栈:");
  console.log(err.stack);
}

// --- 自定义错误类（带额外信息）---
console.log("\\n--- 自定义错误类 ---");

class AppError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "AppError";
    this.code = code;         // 错误码
    this.details = details;   // 额外详情
    this.timestamp = new Date().toISOString();

    // 捕获堆栈（不影响构造函数链）
    Error.captureStackTrace(this, AppError);
  }

  // 格式化输出
  toString() {
    return "[" + this.code + "] " + this.message + " (" + this.timestamp + ")";
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super("VALIDATION_ERROR", message, { field });
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super("NOT_FOUND", resource + " 不存在", { resource, id });
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
  }
}

// 使用自定义错误
try {
  throw new ValidationError("email", "邮箱格式不正确");
} catch (err) {
  console.log("错误类型:", err.name);
  console.log("错误码:", err.code);
  console.log("错误字段:", err.field);
  console.log("格式化:", err.toString());
}

console.log();
try {
  throw new NotFoundError("用户", 12345);
} catch (err) {
  console.log("错误类型:", err.name);
  console.log("错误码:", err.code);
  console.log("资源:", err.resource);
  console.log("ID:", err.id);
  console.log("格式化:", err.toString());
}

// --- 用 instanceof 区分错误类型 ---
console.log("\\n--- 用 instanceof 区分错误类型 ---");
function handleError(err) {
  if (err instanceof ValidationError) {
    return "校验错误: 字段 " + err.field + " - " + err.message;
  } else if (err instanceof NotFoundError) {
    return "未找到: " + err.resource + " #" + err.id;
  } else if (err instanceof AppError) {
    return "应用错误: [" + err.code + "] " + err.message;
  } else if (err instanceof TypeError) {
    return "类型错误: " + err.message;
  } else {
    return "未知错误: " + err.message;
  }
}
console.log(handleError(new ValidationError("name", "必填")));
console.log(handleError(new NotFoundError("文章", 42)));
console.log(handleError(new TypeError("Cannot read property of undefined")));

// ============================================================
// 第三部分：process.memoryUsage 内存监控
// ============================================================

console.log("\\n========== 第三部分：process.memoryUsage 内存监控 ==========");

// --- 内存信息打印工具 ---
function printMemory(tag) {
  const m = process.memoryUsage();
  console.log(
    "[" + tag + "] " +
    "rss: " + (m.rss / 1024 / 1024).toFixed(2) + " MB | " +
    "heapUsed: " + (m.heapUsed / 1024 / 1024).toFixed(2) + " MB | " +
    "heapTotal: " + (m.heapTotal / 1024 / 1024).toFixed(2) + " MB | " +
    "external: " + (m.external / 1024 / 1024).toFixed(2) + " MB"
  );
}

// --- 内存使用对比 ---
console.log("\\n--- 内存使用对比 ---");
printMemory("初始状态");

// 分配一些内存
const bigArray1 = new Array(100000).fill("hello world");
printMemory("分配 100K 字符串数组后");

const bigArray2 = new Array(500000).fill(0).map((_, i) => ({ id: i, data: "item-" + i }));
printMemory("分配 500K 对象数组后");

const bigBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB Buffer
printMemory("分配 10MB Buffer 后");

// 释放内存
bigArray1.length = 0;
bigArray2.length = 0;

// 手动触发 GC（需要 --expose-gc 标志，沙箱中可能不支持）
// 用 globalThis 兼容沙箱（沙箱里没有 global，只有 globalThis）
if (typeof globalThis.gc === "function") {
  globalThis.gc();
  printMemory("手动 GC 后");
} else {
  console.log("\\n（提示: 用 node --expose-gc 运行可手动触发 GC）");
}

// --- 内存监控器 ---
console.log("\\n--- 内存监控器 ---");

class MemoryMonitor {
  constructor(name) {
    this.name = name;
    this.samples = [];
    this.maxHeap = 0;
    this.peakHeap = 0;
  }

  // 采样
  sample() {
    const mem = process.memoryUsage();
    const heapMB = mem.heapUsed / 1024 / 1024;
    const rssMB = mem.rss / 1024 / 1024;

    this.samples.push({ time: Date.now(), heap: heapMB, rss: rssMB });

    if (heapMB > this.peakHeap) {
      this.peakHeap = heapMB;
      console.log("  [" + this.name + "] 堆内存新高: " + heapMB.toFixed(2) + " MB");
    }

    return { heap: heapMB, rss: rssMB };
  }

  // 报告
  report() {
    if (this.samples.length === 0) return;

    const heaps = this.samples.map(s => s.heap);
    const avgHeap = heaps.reduce((a, b) => a + b, 0) / heaps.length;
    const minHeap = Math.min(...heaps);
    const maxHeap = Math.max(...heaps);

    console.log("\\n  --- " + this.name + " 内存报告 ---");
    console.log("  采样次数: " + this.samples.length);
    console.log("  堆内存平均: " + avgHeap.toFixed(2) + " MB");
    console.log("  堆内存最低: " + minHeap.toFixed(2) + " MB");
    console.log("  堆内存最高: " + maxHeap.toFixed(2) + " MB");
    console.log("  堆内存峰值: " + this.peakHeap.toFixed(2) + " MB");
  }
}

// 使用内存监控器
const monitor = new MemoryMonitor("内存监控");

// 模拟内存使用波动
console.log("  采样内存数据...");
monitor.sample();
const temp1 = new Array(50000).fill("data");
monitor.sample();
const temp2 = new Array(100000).fill("more data");
monitor.sample();
temp1.length = 0;
monitor.sample();
temp2.length = 0;
monitor.sample();

monitor.report();

// ============================================================
// 第四部分：性能计时器工具
// ============================================================

console.log("\\n========== 第四部分：性能计时器工具 ==========");

// --- 高精度计时器 ---
// 使用 Date.now() 精度只有毫秒级
// 使用 process.hrtime() 可以达到纳秒级

// 兼容性辅助：返回纳秒级时间戳。
// 沙箱里 process.hrtime 是被 .bind 过的函数，可以正常调用得到 [秒, 纳秒] 数组；
// 但 process.hrtime.bigint() 在沙箱中不可用（bigint 是属性而非方法）。
// 这里优先用 hrtime()，失败则回退到 Date.now()（毫秒精度，足够演示）。
function hrNs() {
  try {
    var t = process.hrtime(); // [seconds, nanoseconds]
    return t[0] * 1e9 + t[1];
  } catch (e) {
    return Date.now() * 1e6;
  }
}

class PerformanceTimer {
  constructor() {
    this.timers = new Map();   // 活跃的计时器
    this.history = [];          // 历史记录
  }

  // 开始计时
  start(label) {
    this.timers.set(label, hrNs());
    return this;
  }

  // 结束计时并返回结果
  end(label) {
    const start = this.timers.get(label);
    if (start === undefined) {
      console.log("  [警告] 计时器 '" + label + "' 不存在");
      return null;
    }

    const end = hrNs();
    const durationNs = end - start; // 纳秒
    const durationMs = durationNs / 1e6;     // 毫秒
    const durationSec = durationNs / 1e9;    // 秒

    this.timers.delete(label);
    this.history.push({ label, durationMs, timestamp: Date.now() });

    // 根据耗时大小选择合适的单位
    let display;
    if (durationMs < 1) {
      display = durationNs + " ns";
    } else if (durationMs < 1000) {
      display = durationMs.toFixed(3) + " ms";
    } else {
      display = durationSec.toFixed(3) + " s";
    }

    console.log("  ⏱  " + label.padEnd(20) + " → " + display);
    return durationMs;
  }

  // 测量函数执行时间
  measure(label, fn) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  // 异步测量
  async measureAsync(label, asyncFn) {
    this.start(label);
    const result = await asyncFn();
    this.end(label);
    return result;
  }

  // 打印历史报告
  report() {
    console.log("\\n  --- 性能报告 ---");
    if (this.history.length === 0) {
      console.log("  无计时记录");
      return;
    }

    // 按耗时排序
    const sorted = [...this.history].sort((a, b) => b.durationMs - a.durationMs);

    console.log("  按耗时排序（从慢到快）:");
    sorted.forEach((item, i) => {
      console.log("    " + (i + 1) + ". " + item.label.padEnd(20) + " " + item.durationMs.toFixed(3) + " ms");
    });

    // 统计信息
    const durations = this.history.map(h => h.durationMs);
    const total = durations.reduce((a, b) => a + b, 0);
    const avg = total / durations.length;
    console.log("\\n  统计:");
    console.log("    总耗时: " + total.toFixed(3) + " ms");
    console.log("    平均耗时: " + avg.toFixed(3) + " ms");
    console.log("    最快: " + Math.min(...durations).toFixed(3) + " ms");
    console.log("    最慢: " + Math.max(...durations).toFixed(3) + " ms");
  }

  // 清除历史
  clear() {
    this.timers.clear();
    this.history = [];
  }
}

// --- 使用性能计时器 ---
const timer = new PerformanceTimer();

console.log("\\n--- 测量各种操作 ---");

// 测量数学计算
timer.measure("斐波那契(30)", () => {
  function fib(n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
  }
  return fib(30);
});

// 测量数组操作
timer.measure("数组排序 10万", () => {
  const arr = Array.from({ length: 100000 }, () => Math.random());
  arr.sort((a, b) => a - b);
});

// 测量字符串操作
timer.measure("字符串拼接 1万次", () => {
  let str = "";
  for (let i = 0; i < 10000; i++) {
    str += "item" + i + ",";
  }
  return str.length;
});

// 测量 JSON 操作
timer.measure("JSON 解析大对象", () => {
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: "user" + i,
    email: "user" + i + "@example.com",
  }));
  const json = JSON.stringify(data);
  return JSON.parse(json).length;
});

// 测量对象创建
timer.measure("创建 10万对象", () => {
  const arr = [];
  for (let i = 0; i < 100000; i++) {
    arr.push({ id: i, value: Math.random() });
  }
  return arr.length;
});

// 手动控制计时
timer.start("手动计时的操作");
let tempSum = 0;
for (let i = 0; i < 1000000; i++) {
  tempSum += Math.sqrt(i);
}
timer.end("手动计时的操作");

// 打印报告
timer.report();

// ============================================================
// 第五部分：调试技巧总结
// ============================================================

console.log("\\n========== 第五部分：调试技巧总结 ==========");

console.log("\\n--- 1. 调试方法选择 ---");
console.log("  快速查看变量     → console.log / console.dir");
console.log("  查看数组/对象    → console.table");
console.log("  测量耗时         → console.time / PerformanceTimer");
console.log("  查看调用栈       → console.trace / Error.stack");
console.log("  条件调试         → console.assert");
console.log("  可视化断点调试   → node --inspect + Chrome DevTools");
console.log("  IDE 调试         → VS Code F5 + launch.json");
console.log("  性能分析         → --prof / --cpu-prof / clinic.js");
console.log("  内存分析         → --heap-prof / process.memoryUsage");

console.log("\\n--- 2. 常见错误排查 ---");
console.log("  未捕获异常       → process.on('uncaughtException')");
console.log("  未处理的 Promise  → process.on('unhandledRejection')");
console.log("  内存泄漏         → 定时记录 heapUsed，对比堆快照");
console.log("  事件循环阻塞     → clinic doctor / --trace-event-categories");
console.log("  性能瓶颈         → --cpu-prof 生成火焰图");

console.log("\\n--- 3. 日志最佳实践 ---");
console.log("  开发环境         → console.log + console.debug");
console.log("  生产环境         → winston / pino（结构化日志）");
console.log("  错误追踪         → 记录完整 err.stack");
console.log("  请求追踪         → 每条日志附带 requestId");
console.log("  敏感信息         → 绝不记录密码/token");

console.log("\\n--- 4. 启动参数速查 ---");
console.log("  node --inspect app.js          # 启用调试器");
console.log("  node --inspect-brk app.js       # 第一行暂停");
console.log("  node --prof app.js              # CPU 分析");
console.log("  node --cpu-prof app.js          # CPU 火焰图");
console.log("  node --heap-prof app.js         # 堆分析");
console.log("  node --trace-warnings app.js    # 追踪警告");
console.log("  node --expose-gc app.js         # 暴露 gc() 函数");
console.log("  node --max-old-space-size=4096  # 堆内存上限 4GB");

console.log("\\n========== 调试技巧章节演示结束 ==========");`,
  },
];