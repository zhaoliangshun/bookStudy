// =============================================================
// JavaScript Worker 基础 - 第一批章节（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章（分组：Worker 基础）：
//   worker-intro     : Worker 概述与历史
//   worker-principle : Worker 的作用与原理
//   worker-first     : 创建第一个 Worker
//   worker-lifecycle : Worker 的生命周期
//   worker-limits    : Worker 的限制与能力边界
//
// 说明：本教程讲解的是浏览器中的 Web Worker，但代码运行在
// Node.js 沙箱中（无 window、document、Worker 等浏览器 API）。
// 因此 code 字段使用「模拟代码」来演示 Worker 的核心概念：
// 用 EventEmitter + setTimeout/setImmediate 模拟 Worker 的
// postMessage / onmessage 消息通信机制。
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：Worker 概述与历史
  // ============================================================
  {
    id: "worker-intro",
    group: "Worker 基础",
    icon: "👷",
    title: "Worker 概述与历史",
    content: `## Worker 概述与历史

### 一、什么是 Web Worker

Web Worker 是 HTML5 规范（2010 年起逐步被各大浏览器实现）提供的一种机制，它允许 JavaScript 在**主线程之外**的独立后台线程中运行脚本。简单来说，Worker 就是浏览器给我们开的"后门"——让我们能够突破 JavaScript 单线程的限制，把耗时的计算任务丢到后台去跑，主线程依然可以丝滑地响应用户操作。

《JavaScript高级程序设计》中提到：JavaScript 最初被设计为一种浏览器脚本语言，它的核心使命是"操作 DOM、响应用户交互"。为了保证 DOM 操作不会产生冲突，浏览器给 JavaScript 加了一把锁——**单线程**。所有代码都在唯一的主线程上执行。

这在早期没什么问题，毕竟那时候的网页只是展示点文字、做个表单校验。但随着 Web 应用越来越复杂——图片处理、视频编解码、大数据排序、3D 渲染——单线程的瓶颈就暴露出来了。

---

### 二、为什么要 Worker：单线程与阻塞问题

JavaScript 的单线程模型意味着：**同一时刻只能做一件事**。如果一段代码在疯狂计算，那么：

- 按钮点击没反应
- 动画卡顿掉帧
- 滚动不流畅
- 输入框打字延迟

这就是所谓的**主线程阻塞**。浏览器的主线程既负责执行 JavaScript，又负责渲染页面、处理事件、解析 CSS。一旦 JavaScript 把主线程占满了，这些工作就只能排队等候。

举个直观的例子：如果一个排序任务需要跑 3 秒，那么这 3 秒内整个页面就是"冻住"的——用户点什么都没用。这在用户体验上是不可接受的。

Worker 的出现就是为了解决这个问题：**把耗时任务搬到后台线程，主线程保持畅通**。

---

### 三、Worker 的发展历史

| 时间 | 里程碑 | 说明 |
|------|--------|------|
| 2009 | Web Workers 草案 | W3C 发布第一份工作草案 |
| 2010 | Dedicated Worker | Chrome、Firefox 率先实现专用 Worker |
| 2011 | Shared Worker | 多个页面共享同一个 Worker |
| 2015 | Service Worker | 离线缓存、推送通知的基石 |
| 2018 | Audio Worklet | 替代 ScriptProcessorNode 处理音频 |
| 2019+ | 各类 Worklet | Paint Worklet、Animation Worklet 等 |

从最初的 Dedicated Worker（专用 Worker），到 Shared Worker（共享 Worker），再到 Service Worker（服务 Worker）和 Worklet（小工作线程），Worker 家族不断壮大，覆盖了从计算到缓存再到渲染的各个场景。

---

### 四、Worker 类型一览

| 类型 | 全局作用域 | 典型用途 | 通信方式 |
|------|-----------|---------|---------|
| Dedicated Worker（专用） | \`DedicatedWorkerGlobalScope\` | 耗时计算、数据处理 | 仅与创建它的页面通信 |
| Shared Worker（共享） | \`SharedWorkerGlobalScope\` | 多标签页共享数据 | 多个端口（MessagePort） |
| Service Worker（服务） | \`ServiceWorkerGlobalScope\` | 离线缓存、推送、后台同步 | 事件驱动，作为网络代理 |
| Audio Worklet（音频） | \`AudioWorkletGlobalScope\` | 实时音频处理 | AudioParam 数据流 |
| Animation Worklet（动画） | \`WorkletGlobalScope\` | 高性能滚动动画 | Worklet API |

> 本教程主要聚焦 **Dedicated Worker**（专用 Worker），它是学习其他 Worker 的基础。

---

### 五、浏览器支持情况

| 浏览器 | Dedicated Worker | Shared Worker | Service Worker |
|--------|:---:|:---:|:---:|
| Chrome | 4+ ✅ | 5+ ✅ | 40+ ✅ |
| Firefox | 3.5+ ✅ | 29+ ✅ | 44+ ✅ |
| Safari | 4+ ✅ | 16+ ✅ | 11.1+ ✅ |
| Edge | 12+ ✅ | 79+ ✅ | 17+ ✅ |

如今 Dedicated Worker 已经被所有主流浏览器广泛支持，可以放心在生产环境使用。

---

### 六、真实应用场景

1. **图像处理**：滤镜、裁剪、压缩等像素级运算（Canvas 像素操作非常耗时）
2. **数据 crunching**：大数组排序、JSON 深度解析、CSV 解析
3. **加密/哈希**：大文件的 SHA-256、AES 加密
4. **后台同步**：Service Worker 实现离线数据同步
5. **语法高亮**：代码编辑器对大段代码做词法分析
6. **物理引擎**：WebGL 游戏中的碰撞检测计算

---

### 七、Worker 与其他异步技术的区别

很多初学者会疑惑：\`setTimeout\`、\`Promise\`、\`requestAnimationFrame\` 都是异步的，为什么还需要 Worker？关键区别在于**是否真正并行**：

| 技术 | 是否并行 | 是否阻塞主线程 | 适用场景 |
|------|:---:|:---:|---------|
| \`setTimeout\` | ❌ 否 | ✅ 阻塞（只是延后） | 延迟执行、防抖 |
| \`Promise\` | ❌ 否 | ✅ 阻塞（微任务） | 异步流程控制 |
| \`requestAnimationFrame\` | ❌ 否 | ✅ 阻塞 | 动画同步 |
| \`Web Worker\` | ✅ 是 | ❌ 不阻塞 | 耗时计算 |

\`setTimeout(fn, 0)\` 只是把 \`fn\` 推迟到当前同步代码执行完后再跑，但 \`fn\` 依然在主线程上执行，依然会阻塞 UI。而 Worker 是在**另一个 CPU 线程**上跑，主线程完全不受影响。

打个比方：\`setTimeout\` 像是"你先把碗洗完再去看电视"，而 Worker 是"雇个人帮你洗碗，你自己去看电视"。

---

### 八、小结

- Web Worker 让 JavaScript 拥有了多线程能力
- Worker 运行在真正的操作系统线程中，与主线程并行
- 适用于耗时计算场景，不适用于 DOM 操作
- 所有主流浏览器已广泛支持，可放心使用

下面的代码将演示：同样的计算任务，在主线程上执行会"卡死"一切，而交给 Worker 后主线程依然可以"边干别的边等结果"。`,
    code: `// ============================================
// 第一章演示：主线程阻塞 vs Worker 异步处理
// ============================================

// ---------- 演示 1：主线程同步阻塞 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 1：主线程被同步任务阻塞');
console.log('═══════════════════════════════════════════');

// 模拟一个耗时的同步计算任务
function heavyCompute(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
}

console.log('⏳ 主线程开始执行耗时计算...');
console.time('同步计算耗时');
const syncResult = heavyCompute(50000000);
console.timeEnd('同步计算耗时');
console.log('计算结果:', syncResult);
console.log('⚠️  在这段计算期间，页面完全卡死，用户点击/滚动全部无响应');
console.log('');

// ---------- 演示 2：模拟 Worker 异步处理 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 2：把任务交给 Worker（异步模拟）');
console.log('═══════════════════════════════════════════');

// 在浏览器中真正的写法：
// const worker = new Worker('compute-worker.js');
// worker.onmessage = function(e) { console.log('结果:', e.data); };
// worker.postMessage(50000000);

// === 在 Node.js 沙箱中模拟运行 ===
// 用 setTimeout 模拟 Worker 在独立线程中异步执行
function simulateWorker(task, callback) {
  // postMessage 后，Worker 在自己的线程里开始干活
  setTimeout(() => {
    const result = task();
    // Worker 算完后通过 postMessage 把结果送回主线程
    callback(result);
  }, 0);
}

console.log('📤 主线程：把计算任务派发给 Worker');
simulateWorker(() => heavyCompute(50000000), (result) => {
  console.log('📥 主线程：收到 Worker 返回的结果 =', result);
});

// 主线程不必等待，可以继续做别的事
console.log('✅ 主线程：任务已派发，继续渲染 UI');
console.log('✅ 主线程：继续响应用户点击');
console.log('✅ 主线程：继续播放动画');
console.log('');

// ---------- 演示 3：对比总结 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 3：两种方式对比总结');
console.log('═══════════════════════════════════════════');
console.log('  方式 A（主线程同步）：简单，但会阻塞 UI');
console.log('  方式 B（Worker 异步）：稍复杂，但 UI 不卡顿');
console.log('  结论：耗时 > 50ms 的任务，都建议用 Worker！');
console.log('');

setTimeout(() => {
  console.log('🎉 [Worker 任务全部完成，主线程全程保持流畅]');
}, 50);`
  },

  // ============================================================
  // 第二章：Worker 的作用与原理
  // ============================================================
  {
    id: "worker-principle",
    group: "Worker 基础",
    icon: "⚙️",
    title: "Worker 的作用与原理",
    content: `## Worker 的作用与原理

要真正理解 Worker，必须先搞懂 JavaScript 的执行模型。《JavaScript高级程序设计》第四版第二十五章专门讨论了 Worker，并指出：**Worker 的本质是让浏览器分配一个真正的操作系统线程来运行 JavaScript**。这一章我们从底层原理出发，彻底搞懂 Worker 是怎么工作的。

---

### 一、JavaScript 单线程模型详解

JavaScript 引擎（如 V8）在执行代码时，维护着几个核心组件：

| 组件 | 作用 |
|------|------|
| **调用栈（Call Stack）** | 存放当前正在执行的函数，后进先出 |
| **堆（Heap）** | 存放对象等引用类型，垃圾回收的主战场 |
| **任务队列（Task Queue）** | 存放 setTimeout、IO 回调等宏任务 |
| **微任务队列（Microtask Queue）** | 存放 Promise.then、queueMicrotask 等 |

**事件循环（Event Loop）** 的工作流程：

1. 从调用栈取出栈顶函数执行
2. 如果调用栈空了，先清空所有微任务
3. 再从任务队列取一个宏任务执行
4. 回到第 2 步，循环往复

关键点：**所有 JavaScript 代码都在同一个调用栈上执行**。如果一个函数要跑 3 秒，这 3 秒里调用栈被它霸占，事件循环根本转不动，其他任务（包括 UI 渲染）全部排队等待。这就是"阻塞"的根源。

---

### 二、调用栈阻塞示意

假设有这样的调用链：

\`\`\`
main() → compute() → sort(100万条数据)   ← 栈顶，耗时 2 秒
\`\`\`

在 sort 执行的 2 秒内，调用栈被堵死。此时用户点击按钮产生的 click 事件、定时器到期的回调、页面该有的重绘——全部只能干等。用户看到的就是"页面卡死了"。

---

### 三、Worker 运行在真正的独立线程

Worker 不是"伪异步"（像 Promise 那样还是在主线程上调度），而是**货真价实的操作系统线程**：

- 浏览器调用操作系统的线程 API（如 pthread）创建一个新线程
- 这个新线程拥有**独立的 JavaScript 引擎实例**（独立的 V8 isolate）
- Worker 脚本在这个新线程里执行，拥有自己的调用栈、事件循环

这意味着：Worker 里的 \`while(true)\` 死循环，不会卡住主线程。两个线程在操作系统层面并行运行，由 CPU 调度。

---

### 四、内存隔离

Worker 与主线程**不共享内存**（这是出于安全性和确定性的考虑）。每个 Worker 有自己独立的：

- 全局对象（不是 \`window\`，而是 \`DedicatedWorkerGlobalScope\`）
- 内存堆（对象不互通）
- 事件循环、任务队列

主线程和 Worker 之间传递数据，只能通过 **消息传递（message passing）** 的方式，数据会被**结构化克隆**（structured clone）一份副本传过去。也就是说，传一个对象给 Worker，Worker 拿到的是这个对象的深拷贝，两边互不影响。

> 例外：\`SharedArrayBuffer\` 允许共享内存，但需要特殊的安全上下文（COOP/COEP 头）。

---

### 五、通信模型：postMessage

主线程与 Worker 通过 \`postMessage\` 互相发消息：

\`\`\`js
// 主线程 → Worker
worker.postMessage({ cmd: 'sort', data: bigArray });

// Worker → 主线程
self.postMessage({ result: sortedArray });

// 接收消息
worker.onmessage = (e) => { /* e.data 是收到的数据 */ };
self.onmessage = (e) => { /* Worker 内部接收 */ };
\`\`\`

数据传递的两种模式：
- **结构化克隆（默认）**：深拷贝，安全但有性能开销
- **Transferable Objects（转移）**：把 ArrayBuffer 的所有权"移交"，零拷贝，但原线程不能再访问

---

### 六、主线程 vs Worker 线程对比

| 维度 | 主线程 | Worker 线程 |
|------|--------|------------|
| 全局对象 | \`window\` | \`self\`（DedicatedWorkerGlobalScope） |
| DOM 访问 | ✅ 可以 | ❌ 不可以 |
| 调用栈 | 独立 | 独立 |
| 事件循环 | 独立 | 独立 |
| 内存 | 独立堆 | 独立堆 |
| 通信 | postMessage | postMessage |
| 可用 API | 全部 | 子集（无 DOM） |

---

### 七、结构化克隆算法详解

\`postMessage\` 传递数据时使用的是**结构化克隆算法（Structured Clone Algorithm）**，它比 \`JSON.parse(JSON.stringify())\` 更强大：

| 数据类型 | JSON 序列化 | 结构化克隆 |
|---------|:---:|:---:|
| \`string/number/boolean\` | ✅ | ✅ |
| \`Date\` | ❌（变字符串） | ✅（保持 Date） |
| \`RegExp\` | ❌（变字符串） | ✅（保持 RegExp） |
| \`Map/Set\` | ❌ | ✅ |
| \`ArrayBuffer\` | ❌ | ✅ |
| \`循环引用\` | ❌（报错） | ✅ |
| \`Function\` | ❌ | ❌ |
| \`DOM 节点\` | ❌ | ❌ |

这意味着你可以直接传 Map、Set、Date、甚至带循环引用的对象给 Worker，不需要手动序列化。但函数和 DOM 节点无法传递。

**性能提示**：结构化克隆是深拷贝，传 10MB 数据大约需要 50ms。如果数据是 \`ArrayBuffer\`，可以用 **Transferable Objects** 零拷贝转移：

\`\`\`js
// 零拷贝转移 ArrayBuffer（原线程将无法再访问该 buffer）
worker.postMessage(buffer, [buffer]);
\`\`\`

---

### 八、小结

- JavaScript 单线程 = 一个调用栈 + 一个事件循环
- Worker 运行在独立的操作系统线程，拥有自己的调用栈和事件循环
- 主线程与 Worker 不共享内存，通过 postMessage 消息传递通信
- 数据传输默认用结构化克隆（深拷贝），大数组可用 Transferable 零拷贝

下面的代码用调用栈阻塞实验 + Worker 异步模拟，直观展示两者的区别。`,
    code: `// ============================================
// 第二章演示：调用栈阻塞 vs Worker 异步
// ============================================

// ---------- 演示 1：调用栈被阻塞的直观表现 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 1：调用栈阻塞实验');
console.log('═══════════════════════════════════════════');

// 模拟调用栈上的函数链
function level3() {
  // 栈顶：这里做耗时计算，把整个调用栈堵住
  let sum = 0;
  for (let i = 0; i < 30000000; i++) sum += i;
  return sum;
}

function level2() {
  return level3(); // 调用栈：main → level2 → level3
}

function level1() {
  return level2(); // 调用栈：main → level1 → level2 → level3
}

console.log('📌 调用栈结构：main → level1 → level2 → level3');
console.time('调用栈阻塞耗时');
const blockedResult = level1();
console.timeEnd('调用栈阻塞耗时');
console.log('结果:', blockedResult);
console.log('⚠️  在上面这段时间里，事件循环完全停转');
console.log('');

// ---------- 演示 2：setTimeout 也救不了阻塞主线程 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 2：setTimeout 排队的回调也被堵住');
console.log('═══════════════════════════════════════════');

// 这个回调安排在 0ms 后执行
setTimeout(() => {
  console.log('🔔 [定时器回调] 我终于执行了！');
}, 0);

// 但主线程马上要做 1 秒的重活，回调只能排队
console.log('主线程：开始做重活...');
let s = 0;
for (let i = 0; i < 30000000; i++) s += i;
console.log('主线程：重活做完了，结果 =', s);
console.log('（注意：定时器回调在重活做完之后才打印）');
console.log('');

// ---------- 演示 3：Worker 模拟 —— 真正不阻塞 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 3：模拟 Worker 独立线程，主线程不阻塞');
console.log('═══════════════════════════════════════════');

// 模拟 Worker：后台线程执行，完成后回调
function mockWorker(task, onDone) {
  // setImmediate 模拟 Worker 在独立线程启动
  setImmediate(() => {
    const result = task(); // 在"另一个线程"里计算
    onDone(result);        // 算完通知主线程
  });
}

console.log('主线程：派发任务给 Worker，不等它');
mockWorker(() => {
  let sum = 0;
  for (let i = 0; i < 30000000; i++) sum += i;
  return sum;
}, (result) => {
  console.log('📦 Worker 完成，结果 =', result);
});

// 主线程立刻继续做其他事
console.log('主线程：继续渲染 UI ✅');
console.log('主线程：响应用户点击 ✅');
console.log('主线程：播放动画 ✅');
console.log('');

setTimeout(() => {
  console.log('');
  console.log('═══ 原理总结 ═══');
  console.log('  1. 主线程同步执行 → 阻塞事件循环 → UI 卡死');
  console.log('  2. setTimeout 不能解决阻塞，只是延后排队');
  console.log('  3. Worker 在真正的独立线程运行 → 主线程畅通');
  console.log('  4. 两者通过 postMessage 通信，数据是克隆副本');
}, 20);`
  },

  // ============================================================
  // 第三章：创建第一个 Worker
  // ============================================================
  {
    id: "worker-first",
    group: "Worker 基础",
    icon: "🚀",
    title: "创建第一个 Worker",
    content: `## 创建第一个 Worker

理论讲完了，现在动手创建你的第一个 Web Worker。《JavaScript高级程序设计》强调：理解 Worker 的最佳方式就是亲手写一个。本章从最基础的创建步骤讲起，覆盖构造函数参数、消息通信、内联 Worker 等核心知识点。

---

### 一、创建 Worker 的基本语法

\`\`\`js
const worker = new Worker(url, options);
\`\`\`

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| \`url\` | string | Worker 脚本的 URL，必须同源 |
| \`options.type\` | \`'classic'\` \| \`'module'\` | 脚本类型，\`module\` 支持 import |
| \`options.name\` | string | Worker 的名称，用于调试 |
| \`options.credentials\` | string | 跨域凭证策略 |

\`type\` 的区别：
- \`'classic'\`（默认）：传统脚本，不支持 \`import\`，用 \`importScripts()\` 加载其他脚本
- \`'module'\`：ES 模块模式，支持 \`import/export\`，更现代

\`\`\`js
// 经典模式
const worker1 = new Worker('./worker.js');

// 模块模式（推荐）
const worker2 = new Worker('./worker.js', { type: 'module', name: 'calc' });
\`\`\`

---

### 二、Worker 文件长什么样

Worker 文件就是一个普通的 .js 文件，但它的全局作用域不是 \`window\`，而是 \`self\`（\`DedicatedWorkerGlobalScope\`）：

\`\`\`js
// worker.js —— Worker 脚本
self.onmessage = function(e) {
  // 接收主线程发来的消息
  const { cmd, data } = e.data;
  if (cmd === 'compute') {
    const result = doHeavyWork(data);
    // 把结果发回主线程
    self.postMessage({ cmd: 'done', result });
  }
};

function doHeavyWork(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += i;
  return sum;
}
\`\`\`

注意：Worker 文件里**没有 \`window\`、\`document\`**，\`self\` 才是全局对象。

---

### 三、主线程与 Worker 的通信

完整通信流程分三步：

**第 1 步：创建 Worker 并监听消息**
\`\`\`js
const worker = new Worker('./worker.js');
worker.onmessage = function(e) {
  console.log('收到 Worker 返回:', e.data);
};
worker.onerror = function(e) {
  console.error('Worker 出错:', e.message);
};
\`\`\`

**第 2 步：向 Worker 发送消息**
\`\`\`js
worker.postMessage({ cmd: 'compute', data: 100000000 });
\`\`\`

**第 3 步：Worker 处理并返回**
\`\`\`js
// worker.js 内部
self.onmessage = function(e) {
  const result = doHeavyWork(e.data.data);
  self.postMessage({ cmd: 'done', result });
};
\`\`\`

---

### 四、内联 Worker：Blob URL 技术

有时候我们不想单独建一个 .js 文件（比如代码很少，或想动态生成 Worker 代码）。这时可以用 **Blob URL** 创建内联 Worker：

\`\`\`js
// 把 Worker 代码写成字符串
const workerCode = \`
  self.onmessage = function(e) {
    const result = e.data * 2;
    self.postMessage(result);
  };
\`;

// 创建 Blob 和 URL
const blob = new Blob([workerCode], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);

// 用这个 URL 创建 Worker
const worker = new Worker(url);

// 用完后释放
worker.onmessage = (e) => console.log(e.data);
worker.postMessage(21);
// URL.revokeObjectURL(url); // 不再需要时释放
\`\`\`

这种技巧在 Webpack/Vite 等构建工具中也被用来实现 \`worker-loader\`。

---

### 五、常见坑

1. **同源策略**：Worker 脚本 URL 必须与页面同源，跨域会被拒绝
2. **file:// 协议**：本地用 \`file://\` 打开页面时，创建 Worker 会失败（安全限制），需用本地服务器
3. **Worker 里没有 DOM**：\`document.getElementById\` 会报错
4. **数据是克隆的**：传大对象有性能开销，可用 Transferable 优化
5. **模块 Worker 兼容性**：\`type: 'module'\` 在旧浏览器不支持

---

### 六、importScripts 与模块加载

在 classic 模式的 Worker 中，可以用 \`importScripts()\` 加载外部脚本：

\`\`\`js
// worker.js（classic 模式）
importScripts('utils.js', 'math-lib.js');
// 加载完成后，utils.js 和 math-lib.js 中的变量都可用
\`\`\`

\`importScripts()\` 是**同步阻塞**的——它会下载并执行完所有脚本后才继续。如果加载失败会抛出异常。

在 module 模式的 Worker 中，则使用标准的 ES \`import\`：

\`\`\`js
// worker.js（module 模式）
import { compute } from './math-lib.js';
import { format } from './utils.js';
\`\`\`

module 模式更现代，支持 tree-shaking 和静态分析，但旧浏览器（如 IE、旧版 Safari）不支持。如果需要兼容性，用 classic 模式；如果是现代项目，推荐 module 模式。

---

### 七、小结

- 创建 Worker：\`new Worker(url, options)\`，url 必须同源
- 通信：\`postMessage\` 发送，\`onmessage\` 接收，双向异步
- 内联 Worker：用 Blob URL 技术，无需单独文件
- classic 模式用 \`importScripts()\`，module 模式用 \`import\`

下面的代码用 Node.js 模拟了完整的 Worker 创建和通信流程。`,
    code: `// ============================================
// 第三章演示：创建第一个 Worker（模拟版）
// ============================================

const { EventEmitter } = require('events');

// ---------- 模拟浏览器的 Worker 类 ----------
// 真实浏览器中 Worker 运行在独立 OS 线程，
// 这里用 setImmediate + EventEmitter 模拟异步消息通信
class MockWorker {
  constructor(workerCode) {
    this._onmessage = null;
    this._onerror = null;
    this._terminated = false;

    // Worker 内部的 self 作用域
    const main = this;
    this._self = {
      onmessage: null,
      // Worker 内部调用 self.postMessage → 通知主线程
      postMessage(data) {
        if (main._terminated) return;
        setImmediate(() => {
          if (main._onmessage) main._onmessage({ data });
        });
      },
      close() { main.terminate(); },
    };

    // 执行 Worker 脚本（注册 self.onmessage）
    try {
      workerCode(this._self);
    } catch (err) {
      setImmediate(() => {
        if (main._onerror) main._onerror(err);
      });
    }
  }
  // 主线程发送消息给 Worker
  postMessage(data) {
    if (this._terminated) return;
    setImmediate(() => {
      if (this._self.onmessage) this._self.onmessage({ data });
    });
  }
  terminate() {
    this._terminated = true;
    this._onmessage = null;
  }
  set onmessage(fn) { this._onmessage = fn; }
  get onmessage() { return this._onmessage; }
  set onerror(fn) { this._onerror = fn; }
  get onerror() { return this._onerror; }
}

// ---------- 演示 1：基本通信 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 1：主线程 ↔ Worker 基本通信');
console.log('═══════════════════════════════════════════');

// 对应浏览器中的 worker.js 内容
const workerScript = (self) => {
  self.onmessage = (e) => {
    const n = e.data;
    // 模拟耗时计算
    let sum = 0;
    for (let i = 0; i < n; i++) sum += i;
    // 把结果发回主线程
    self.postMessage({ input: n, result: sum });
  };
};

// 对应浏览器中的 new Worker('worker.js')
const worker1 = new MockWorker(workerScript);
worker1.onmessage = (e) => {
  console.log('主线程收到结果:', e.data);
};

console.log('主线程发送: 50000000');
worker1.postMessage(50000000);
console.log('主线程已派发，继续干别的 ✅');
console.log('');

// ---------- 演示 2：模拟 Blob URL 内联 Worker ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 2：模拟 Blob URL 内联 Worker');
console.log('═══════════════════════════════════════════');

// 浏览器中：
// const blob = new Blob([code], { type: 'application/javascript' });
// const url = URL.createObjectURL(blob);
// const worker = new Worker(url);

// 模拟：把 Worker 代码写成字符串，再"加载"执行
const inlineCode = \`
  self.onmessage = function(e) {
    self.postMessage('你好，主线程！我收到了：' + e.data);
  };
\`;

console.log('内联 Worker 代码:', inlineCode.trim());

// 用 eval 模拟从 Blob URL 加载并执行
const inlineWorker = new MockWorker((self) => {
  // eslint-disable-next-line no-eval
  eval(inlineCode);
});
inlineWorker.onmessage = (e) => {
  console.log('内联 Worker 返回:', e.data);
};
inlineWorker.postMessage('Hello Worker');
console.log('');

// ---------- 演示 3：双向多次通信 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 3：多次往返通信');
console.log('═══════════════════════════════════════════');

const calcWorker = new MockWorker((self) => {
  self.onmessage = (e) => {
    const { action, value } = e.data;
    if (action === 'square') {
      self.postMessage({ action, input: value, output: value * value });
    } else if (action === 'factorial') {
      let f = 1;
      for (let i = 2; i <= value; i++) f *= i;
      self.postMessage({ action, input: value, output: f });
    }
  };
});

calcWorker.onmessage = (e) => {
  console.log('Worker 返回:', e.data.action, '→', e.data.output);
};

console.log('发送: square(12)');
calcWorker.postMessage({ action: 'square', value: 12 });
console.log('发送: factorial(10)');
calcWorker.postMessage({ action: 'factorial', value: 10 });

setTimeout(() => {
  calcWorker.terminate();
  console.log('');
  console.log('✅ Worker 已终止，通信结束');
}, 30);`
  },

  // ============================================================
  // 第四章：Worker 的生命周期
  // ============================================================
  {
    id: "worker-lifecycle",
    group: "Worker 基础",
    icon: "🔄",
    title: "Worker 的生命周期",
    content: `## Worker 的生命周期

像所有资源一样，Worker 也有"生老病死"。理解 Worker 的生命周期，才能避免内存泄漏、僵尸线程等问题。《JavaScript高级程序设计》提醒：**每一个 Worker 实例都占用一个真实的操作系统线程，用完必须释放**。

---

### 一、Worker 的状态流转

Worker 从创建到销毁，经历三个主要状态：

\`\`\`
  创建中(creating) ──→ 运行中(running) ──→ 已终止(terminated)
       │                    │
       │ new Worker()       │ 可收发消息
       └────────────────────┘
                            │
                    terminate() / self.close()
                            ↓
                       已终止(terminated)
                       （不可恢复）
\`\`\`

| 状态 | 触发时机 | 可否通信 |
|------|---------|---------|
| creating | \`new Worker()\` 调用后，脚本加载中 | ❌ |
| running | 脚本加载完成，开始监听消息 | ✅ |
| terminated | 被 terminate 或 self.close | ❌ |

---

### 二、终止 Worker 的两种方式

**方式一：从主线程终止 —— \`worker.terminate()\`**

\`\`\`js
const worker = new Worker('./worker.js');
// ... 用了一阵子 ...
worker.terminate(); // 立即终止，Worker 线程被杀死
\`\`\`

特点：**立即生效**，粗暴直接。Worker 中正在执行的代码会被强制中断，pending 的消息和回调全部丢弃。

**方式二：从 Worker 内部终止 —— \`self.close()\`**

\`\`\`js
// worker.js 内部
self.onmessage = function(e) {
  if (e.data === 'shutdown') {
    self.close(); // Worker 自己关闭
  }
};
\`\`\`

特点：**优雅退出**，Worker 可以先做完手头的清理工作再关闭。

---

### 三、资源清理：终止时会发生什么

Worker 被终止时，浏览器会自动清理：

- **未执行的消息队列**：所有排队中的 postMessage 消息被丢弃
- **定时器**：\`setTimeout\`、\`setInterval\` 全部清除
- **网络连接**：进行中的 fetch、WebSocket 被中断
- **数据库连接**：IndexedDB 事务回滚
- **内存**：Worker 的堆内存被垃圾回收

> ⚠️ 注意：如果 Worker 持有外部资源（如打开了文件、建立了 WebSocket），最好在 \`self.close()\` 前手动释放，否则可能造成短暂的资源泄漏。

---

### 四、错误处理：onerror 事件

Worker 运行出错时，不会直接崩溃主线程，而是触发 \`onerror\` 事件：

\`\`\`js
worker.onerror = function(e) {
  console.error('Worker 错误:', e.message);
  console.error('文件:', e.filename, '行:', e.lineno);
  e.preventDefault(); // 阻止错误冒泡到全局
};
\`\`\`

\`onerror\` 事件对象包含：
- \`message\`：错误信息
- \`filename\`：出错的脚本文件
- \`lineno\`：行号
- \`colno\`：列号
- \`error\`：Error 对象

此外还有 \`onmessageerror\`，当收到的消息无法被反序列化时触发。

---

### 五、Worker 能复用吗？

**不能。** 一个 Worker 被 \`terminate()\` 后就彻底死了，无法重新启动。要再次使用 Worker，必须 \`new Worker()\` 创建一个全新实例。

\`\`\`js
const worker = new Worker('./w.js');
worker.terminate();
worker.postMessage('hi'); // ❌ 无效，Worker 已死
const worker2 = new Worker('./w.js'); // ✅ 只能新建
\`\`\`

---

### 六、内存管理与最佳实践

| 场景 | 建议 |
|------|------|
| 一次性计算任务 | 算完立即 \`terminate()\` |
| 长期后台任务 | 保持 Worker 存活，用消息池复用 |
| 多个短任务 | 考虑 Worker 池（预创建几个 Worker 轮流用） |
| 页面卸载 | \`beforeunload\` 中 terminate 所有 Worker |
| Blob URL Worker | 用完 \`URL.revokeObjectURL()\` 释放 |

**创建成本**：新建一个 Worker 大约需要 10~50ms（取决于脚本大小）。频繁创建/销毁会有性能损耗，此时应考虑 Worker 池。

---

### 七、Worker 池模式

当需要频繁执行多个短任务时，反复创建/销毁 Worker 的开销很大。这时可以用**Worker 池（Worker Pool）**模式：

\`\`\`js
// 预创建 N 个 Worker，放入池中
const pool = [];
for (let i = 0; i < 4; i++) {
  pool.push(new Worker('./worker.js'));
}

// 需要执行任务时，从池中取一个空闲 Worker
function runTask(data) {
  const worker = pool.find(w => w.idle);
  worker.idle = false;
  worker.postMessage(data);
  worker.onmessage = (e) => {
    worker.idle = true; // 用完归还
  };
}
\`\`\`

Worker 池的好处：
- 避免重复创建/销毁的开销（每次省 10~50ms）
- 控制并发数，防止开太多线程抢占 CPU
- 任务排队等待空闲 Worker，平滑处理峰值

典型实现库：\`workerpool\`、\`comlink\`（Google 出品，用 RPC 模式简化 Worker 通信）。

---

### 八、小结

- Worker 生命周期：creating → running → terminated
- 终止方式：主线程 \`terminate()\`（强制）或 Worker 内 \`self.close()\`（优雅）
- 终止后不可恢复，需重新创建
- 频繁创建/销毁有开销，可用 Worker 池复用

下面的代码模拟了 Worker 的完整生命周期流转。`,
    code: `// ============================================
// 第四章演示：Worker 生命周期模拟
// ============================================

// ---------- 带生命周期的 MockWorker ----------
class LifecycleWorker {
  constructor(name, workerCode) {
    this.name = name;
    this.state = 'creating'; // creating → running → terminated
    this._onmessage = null;
    this._onerror = null;
    this._timers = []; // 记录 Worker 内部创建的定时器
    const main = this;

    this._self = {
      onmessage: null,
      postMessage(data) {
        if (main.state === 'terminated') {
          console.log('  [' + main.name + '] ⚠️ 已终止，消息被丢弃');
          return;
        }
        setImmediate(() => {
          if (main._onmessage) main._onmessage({ data });
        });
      },
      setTimeout(fn, ms) {
        const id = setTimeout(() => {
          if (main.state !== 'terminated') fn();
        }, ms);
        main._timers.push(id);
        return id;
      },
      close() { main.terminate(); },
    };

    // 模拟脚本加载延迟
    setImmediate(() => {
      if (this.state === 'terminated') return;
      try {
        workerCode(this._self);
        this.state = 'running';
        console.log('  [' + this.name + '] 🟢 状态: running');
      } catch (err) {
        if (this._onerror) this._onerror(err);
      }
    });
  }

  postMessage(data) {
    if (this.state === 'terminated') {
      console.log('  [' + this.name + '] ⚠️ 已终止，无法发送');
      return;
    }
    console.log('  [' + this.name + '] 📤 主线程发送:', data);
    setImmediate(() => {
      if (this._self.onmessage) {
        try {
          this._self.onmessage({ data });
        } catch (err) {
          // Worker 内部抛出错误 → 触发主线程的 onerror
          if (this._onerror) this._onerror(err);
        }
      }
    });
  }

  terminate() {
    if (this.state === 'terminated') return;
    this.state = 'terminated';
    this._onmessage = null;
    // 清理 Worker 内部的定时器
    this._timers.forEach((id) => clearTimeout(id));
    this._timers = [];
    console.log('  [' + this.name + '] 🔴 状态: terminated（已清理定时器）');
  }

  set onmessage(fn) { this._onmessage = fn; }
  get onmessage() { return this._onmessage; }
  set onerror(fn) { this._onerror = fn; }
  get onerror() { return this._onerror; }
}

// ---------- 演示 1：完整生命周期 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 1：Worker 完整生命周期');
console.log('═══════════════════════════════════════════');

const w = new LifecycleWorker('计算Worker', (self) => {
  self.onmessage = (e) => {
    const result = e.data * 3;
    self.postMessage(result);
  };
});
console.log('  [计算Worker] ⏳ 状态: creating');

w.onmessage = (e) => console.log('  [计算Worker] 📥 主线程收到:', e.data);
setTimeout(() => w.postMessage(15), 10);
setTimeout(() => {
  console.log('  --- 主动终止 Worker ---');
  w.terminate();
  w.postMessage(99); // 终止后再发消息，应该被丢弃
}, 40);

// ---------- 演示 2：self.close() 优雅退出 ----------
setTimeout(() => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  演示 2：Worker 内部 self.close() 优雅退出');
  console.log('═══════════════════════════════════════════');

  const w2 = new LifecycleWorker('优雅Worker', (self) => {
    self.onmessage = (e) => {
      if (e.data === 'shutdown') {
        console.log('  [优雅Worker] 收到关闭指令，先清理...');
        self.postMessage('清理完成，再见！');
        self.close(); // Worker 自己关闭
      } else {
        self.postMessage('echo: ' + e.data);
      }
    };
  });

  w2.onmessage = (e) => console.log('  [优雅Worker] 📥 主线程收到:', e.data);

  setTimeout(() => w2.postMessage('hello'), 10);
  setTimeout(() => w2.postMessage('shutdown'), 30);
}, 60);

// ---------- 演示 3：错误处理 ----------
setTimeout(() => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  演示 3：Worker 错误处理');
  console.log('═══════════════════════════════════════════');

  const w3 = new LifecycleWorker('错误Worker', (self) => {
    self.onmessage = (e) => {
      // 故意抛出错误
      throw new Error('计算过程中发生异常: ' + e.data);
    };
  });

  w3.onerror = (err) => {
    console.log('  [错误Worker] ❌ onerror 捕获:', err.message);
  };

  w3.postMessage('危险操作');
}, 100);`
  },

  // ============================================================
  // 第五章：Worker 的限制与能力边界
  // ============================================================
  {
    id: "worker-limits",
    group: "Worker 基础",
    icon: "🚧",
    title: "Worker 的限制与能力边界",
    content: `## Worker 的限制与能力边界

Worker 虽然强大，但并非"什么都能干"。它有明确的能力边界——有些 API 主线程能用而 Worker 不能用，反之亦然。《JavaScript高级程序设计》指出：**Worker 被设计为"无 UI"的计算单元**，因此所有与 DOM 相关的能力都被剥离了。搞清楚能做什么、不能做什么，才能正确选用 Worker。

---

### 一、Worker 不能访问什么

以下是 Worker 中**完全不可用**的 API：

| 不可用 API | 原因 |
|-----------|------|
| \`window\` | Worker 没有窗口概念 |
| \`document\` | 不能操作 DOM |
| \`parent\` | 没有父窗口 |
| \`localStorage\` | 同步 API，设计上排除（可用 IndexedDB） |
| \`alert / confirm / prompt\` | 这些是 window 的方法 |
| \`window.onload\` 等 UI 事件 | 没有 UI |
| \`XMLHttpRequest\` 的同步版本 | 不允许同步阻塞 |
| DOM 相关一切 | \`getElementById\`、\`createElement\` 等 |

为什么不让 Worker 碰 DOM？因为如果两个线程同时操作 DOM，会产生竞态条件（race condition），导致不可预测的混乱。这是浏览器有意为之的安全设计。

---

### 二、Worker 能访问什么

虽然不能碰 DOM，但 Worker 拥有丰富的非 UI 能力：

| 可用 API | 用途 |
|---------|------|
| \`fetch()\` | 网络请求 |
| \`XMLHttpRequest\`（异步） | 网络请求 |
| \`WebSocket\` | 双向通信 |
| \`IndexedDB\` | 客户端数据库 |
| \`Cache / caches\` | Service Worker 缓存 |
| \`navigator\`（子集） | userAgent、language 等 |
| \`location\`（只读） | Worker 脚本的 URL |
| \`setTimeout / setInterval\` | 定时器 |
| \`console\` | 调试输出 |
| \`importScripts()\` | 加载其他脚本（classic 模式） |
| \`crypto\` | 加密、随机数 |
| \`TextEncoder / TextDecoder\` | 编码转换 |
| \`BroadcastChannel\` | 同源页面间广播 |

---

### 三、self 关键字：不同的全局作用域

在主线程，全局对象是 \`window\`；在 Worker 中，全局对象是 \`self\`：

| 环境 | 全局对象 | 类型 |
|------|---------|------|
| 主线程 | \`window\` | \`Window\` |
| 专用 Worker | \`self\` | \`DedicatedWorkerGlobalScope\` |
| 共享 Worker | \`self\` | \`SharedWorkerGlobalScope\` |
| Service Worker | \`self\` | \`ServiceWorkerGlobalScope\` |

\`self\` 上有 Worker 专属的方法：
- \`self.postMessage()\`：向主线程发消息
- \`self.close()\`：关闭自己
- \`self.importScripts()\`：加载外部脚本
- \`self.name\`：Worker 名称

> 技巧：写 Worker 代码时用 \`self\` 而不是 \`window\`，可以让代码在两种模式（classic/module）下都正常工作。

---

### 四、同源策略与安全

Worker 脚本必须遵守**同源策略（Same-Origin Policy）**：

- Worker 脚本的 URL 必须与创建它的页面同源（协议+域名+端口）
- 跨域 Worker 脚本会被拒绝加载
- \`importScripts()\` 加载的脚本也必须同源（或 CORS 允许）

**CSP（内容安全策略）** 也会影响 Worker：
- \`worker-src\` 指令控制允许的 Worker 来源
- 如果 CSP 太严格，Worker 可能无法创建

\`\`\`http
Content-Security-Policy: worker-src 'self' https://trusted.cdn.com;
\`\`\`

---

### 五、性能考量

**Worker 创建成本**：新建一个 Worker 大约需要 **10~50ms**（加载脚本 + 启动线程）。对于：

- 任务本身只要 5ms → 用 Worker 反而更慢（创建开销 > 计算开销）
- 任务要跑 500ms → 用 Worker 划算

经验法则：**任务执行时间超过 50ms，才值得用 Worker**。

**数据传输成本**：\`postMessage\` 会克隆数据，传大对象有开销：

| 数据大小 | 克隆耗时（参考） |
|---------|----------------|
| 1KB | < 0.1ms |
| 1MB | ~5ms |
| 10MB | ~50ms |
| 100MB | ~500ms |

大数组建议用 \`Transferable Objects\`（转移 ArrayBuffer）来避免拷贝。

---

### 六、什么时候不该用 Worker

| 场景 | 原因 |
|------|------|
| 简单的 DOM 操作 | Worker 不能碰 DOM |
| 快速计算（< 10ms） | 创建开销不划算 |
| 频繁的 UI 更新 | 数据要来回传，延迟大 |
| 需要同步获取结果 | Worker 通信是异步的 |
| 简单的状态管理 | 过度设计 |

---

### 七、Transferable Objects 与性能优化

当需要在主线程和 Worker 之间传递大数据时，结构化克隆的深拷贝开销会很明显。\`Transferable Objects\` 提供了一种**零拷贝**的传输方式：

\`\`\`js
// 创建一个 100MB 的 ArrayBuffer
const buffer = new ArrayBuffer(100 * 1024 * 1024);

// 普通传递：克隆一份（~500ms）
worker.postMessage(buffer);

// 转移传递：零拷贝（~0ms），但原线程不能再访问 buffer
worker.postMessage(buffer, [buffer]);
console.log(buffer.byteLength); // 0，已转移走
\`\`\`

支持 Transferable 的类型：
- \`ArrayBuffer\`
- \`MessagePort\`
- \`ImageBitmap\`
- \`OffscreenCanvas\`
- \`ReadableStream\` / \`WritableStream\`

实际应用中，图像处理、音频处理等场景经常用 Transferable 来传递像素数据，避免拷贝开销。

**其他优化技巧**：
- 用 \`SharedArrayBuffer\` 实现真正的共享内存（需 COOP/COEP 安全头）
- 批量发送消息，减少通信次数
- 用 \`OffscreenCanvas\` 把 Canvas 渲染也搬到 Worker

---

### 八、小结

- Worker 不能访问 DOM、window、localStorage 等 UI 相关 API
- Worker 可以访问 fetch、IndexedDB、WebSocket、crypto 等非 UI API
- \`self\` 是 Worker 的全局对象（替代 \`window\`）
- Worker 脚本必须同源，受 CSP 约束
- 任务 > 50ms 才值得用 Worker，大数组用 Transferable 优化传输

下面的代码演示了如何检测 Worker 的能力边界。`,
    code: `// ============================================
// 第五章演示：Worker 的限制与能力边界
// ============================================

const { EventEmitter } = require('events');

// ---------- 演示 1：模拟检测 Worker 能用/不能用什么 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 1：Worker 能力检测');
console.log('═══════════════════════════════════════════');

// 模拟 Worker 的全局作用域 self
const workerSelf = {
  // Worker 能访问的
  postMessage: () => {},
  close: () => {},
  importScripts: () => {},
  console: console,
  setTimeout: setTimeout,
  setInterval: setInterval,
  fetch: () => Promise.resolve(),
  crypto: { getRandomValues: () => {} },
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
  indexedDB: { open: () => {} },
  // 注意：没有 window、document、localStorage
};

// 检测函数：某个 API 是否在 Worker 作用域中可用
function checkAvailability(scope, apiName) {
  const available = typeof scope[apiName] !== 'undefined';
  return available;
}

console.log('【Worker 中可用的 API】');
const canUse = ['postMessage', 'close', 'importScripts', 'console',
  'setTimeout', 'fetch', 'crypto', 'TextEncoder', 'indexedDB'];
canUse.forEach((api) => {
  const ok = checkAvailability(workerSelf, api);
  console.log('  ' + (ok ? '✅' : '❌') + ' ' + api);
});

console.log('');
console.log('【Worker 中不可用的 API】');
const cannotUse = ['window', 'document', 'localStorage', 'alert',
  'prompt', 'confirm', 'parent'];
cannotUse.forEach((api) => {
  const ok = checkAvailability(workerSelf, api);
  console.log('  ' + (ok ? '✅' : '❌') + ' ' + api +
    (ok ? '' : '  → 主线程专属，Worker 无法访问'));
});
console.log('');

// ---------- 演示 2：self vs window 全局对象对比 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 2：主线程 window vs Worker self');
console.log('═══════════════════════════════════════════');

// 模拟主线程的全局对象
const mainWindow = {
  document: { getElementById: () => {} },
  window: '[循环引用]',
  localStorage: { getItem: () => {} },
  alert: () => {},
  addEventListener: () => {},
  innerWidth: 1920,
  innerHeight: 1080,
};

console.log('【主线程 window 的特有属性】');
console.log('  document      :', typeof mainWindow.document);
console.log('  localStorage  :', typeof mainWindow.localStorage);
console.log('  alert         :', typeof mainWindow.alert);
console.log('  innerWidth    :', mainWindow.innerWidth);
console.log('');
console.log('【Worker self 的特有属性】');
console.log('  postMessage   :', typeof workerSelf.postMessage);
console.log('  close         :', typeof workerSelf.close);
console.log('  importScripts :', typeof workerSelf.importScripts);
console.log('');
console.log('  💡 Worker 用 self 代替 window，剥离了所有 DOM 能力');
console.log('');

// ---------- 演示 3：创建成本与使用时机 ----------
console.log('═══════════════════════════════════════════');
console.log('  演示 3：Worker 创建成本与使用时机判断');
console.log('═══════════════════════════════════════════');

// 模拟测量不同任务的执行时间
function measureTask(label, task) {
  const start = Date.now();
  task();
  const elapsed = Date.now() - start;
  console.log('  ' + label + ': ' + elapsed + 'ms' +
    (elapsed > 50 ? ' ⭐ 建议用 Worker' : ' ⚡ 主线程足够'));
  return elapsed;
}

// 快任务：不值得用 Worker
measureTask('简单计算 (1万次累加)', () => {
  let s = 0;
  for (let i = 0; i < 10000; i++) s += i;
});

// 慢任务：值得用 Worker
measureTask('重计算 (3000万次累加)', () => {
  let s = 0;
  for (let i = 0; i < 30000000; i++) s += i;
});

// 模拟 Worker 创建成本
const createStart = Date.now();
const { EventEmitter: EE } = require('events');
const fakeWorker = new EE();
fakeWorker.postMessage = () => {};
fakeWorker.terminate = () => {};
const createCost = Date.now() - createStart;
console.log('  Worker 创建成本(模拟): ~' + Math.max(createCost, 10) + 'ms' +
  '（真实浏览器约 10~50ms）');
console.log('');
console.log('  📏 经验法则：任务 > 50ms 才值得用 Worker');
console.log('  📏 数据传输也要算进去，大对象用 Transferable 优化');`
  }
];
