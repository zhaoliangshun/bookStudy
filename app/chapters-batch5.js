// =============================================================
// Node.js 交互式教程 —— 第五批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. node-memory    — 内存管理与垃圾回收
//   2. node-v8-engine — V8 引擎深入
//   3. node-repl      — REPL 与交互式开发
//   4. node-cli       — 命令行参数与环境变量
//   5. node-logging   — 日志与调试基础
//   6. node-error-adv — 错误处理深入
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
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
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：内存管理与垃圾回收
  // =========================================================
  {
    id: "node-memory",
    title: "内存管理与垃圾回收",
    icon: "🧠",
    group: "基础补充",
    content: `## V8 内存结构全景

Node.js 基于 V8 引擎运行，V8 的内存管理机制直接影响着 Node.js 应用的性能和稳定性。理解 V8 的内存结构是写出高效、无内存泄漏的 Node.js 应用的基础。

### 内存分区概览

V8 将内存分为几个关键区域：

| 区域 | 说明 | 特点 |
| --- | --- | --- |
| **栈（Stack）** | 存储原始值和对象引用 | 自动分配释放，速度快，空间小（通常 1-8MB） |
| **堆（Heap）** | 存储对象、闭包、函数等 | 由 GC 管理，空间大，分配成本较高 |
| **新生代（New Space）** | 堆的一部分，存放新创建的对象 | 空间小（通常 1-8MB），GC 频繁但快速 |
| **老生代（Old Space）** | 堆的一部分，存放长期存活的对象 | 空间大（可达 1.4GB），GC 较少但耗时长 |
| **大对象空间（Large Object Space）** | 存放超过一定大小的对象 | 独立管理，避免在新生代中频繁复制 |
| **代码空间（Code Space）** | 存放 JIT 编译后的机器码 | 由 V8 内部管理 |
| **Cell Space / Property Cell Space** | 存放全局变量、常量等 | 内部使用 |

**栈 vs 堆的关键区别**：

\`\`\`javascript
// 栈上存储（原始值直接存在栈上）
let age = 25;          // number 直接压在栈上
let name = "hello";    // 短字符串也可能在栈上

// 堆上存储（对象在堆上，栈上只存引用）
let obj = { a: 1 };   // { a: 1 } 在堆上，obj 在栈上存放指向堆的指针
let arr = [1, 2, 3];  // 数组在堆上
\`\`\`

### 新生代（New Space / Young Generation）

新生代是大多数对象"出生"的地方。当你创建一个新对象时，V8 首先把它分配在新生代。

**新生代的结构**：新生代使用 **半空间（Semi-space）** 设计，分为两个大小相等的半空间：

| 半空间 | 作用 |
| --- | --- |
| **From 空间** | 当前活跃对象所在的空间 |
| **To 空间** | 空闲空间，GC 时作为目标 |

任何时候只有一个半空间在使用，另一个保持空闲。

**Scavenge 算法（Cheney 算法）详解**：

Scavenge 是新生代的 GC 算法，采用**复制**策略。它的工作流程如下：

1. **标记阶段**：从根对象（Root Set，包括全局对象、栈上的局部变量等）出发，标记所有可达的对象。
2. **复制阶段**：把 From 空间中所有存活的对象复制到 To 空间，并更新引用指针。
3. **翻转阶段**：交换 From 和 To 空间的角色。原来的 To 空间变成新的 From 空间，原来的 From 空间被整体清空（一次性释放）。

\`\`\`javascript
// 模拟 Scavenge 的过程
// 假设 From 空间中有 3 个对象，其中 2 个存活
// From: [objA(存活), 碎片, objB(存活), 碎片, objC(已死)]
// 复制后：
// To:   [objA, objB, 空闲, 空闲, 空闲]
// 然后翻转：From ↔ To
\`\`\`

**Scavenge 的优缺点**：

| 优点 | 缺点 |
| --- | --- |
| 速度极快（只处理存活对象） | 空间利用率只有 50%（一半空间始终空闲） |
| 无内存碎片（复制时会整理） | 不适合大对象（复制成本高） |
| 新生代对象大多"朝生夕死"，存活率低，所以复制成本低 | 需要额外的内存空间 |

**对象晋升（Promotion）**：一个对象在新生代中存活足够久后，会被"晋升"到老生代。晋升条件有两个：

1. **经历过一次 Scavenge 后仍然存活**：对象从 From 复制到 To 时，如果它已经经历过一次 Scavenge（即不是第一次被复制），则直接晋升到老生代。
2. **To 空间使用率超过 25%**：当一个对象被复制到 To 空间时，如果 To 空间的使用率已经超过 25%，这个对象会直接晋升到老生代。这个阈值是为了确保下次 Scavenge 时 To 空间有足够的空闲空间。

### 老生代（Old Space / Old Generation）

老生代存放经历过多次 GC 仍然存活的对象，以及大对象。老生代的 GC 使用两种算法配合：

**Mark-Sweep（标记-清除）算法**：

这是老生代的主要 GC 算法，分为两个阶段：

1. **标记阶段（Mark）**：从根对象出发，递归遍历所有可达对象，将它们标记为"存活"。
2. **清除阶段（Sweep）**：遍历整个老生代堆，回收所有未被标记的对象的内存空间。

\`\`\`javascript
// Mark-Sweep 示意
// 标记后： [objA✓, 碎片, objB✓, 碎片, objC(未标记), 碎片]
// 清除后： [objA, 空闲, objB, 空闲, 空闲, 空闲]
// 注意：产生了内存碎片！
\`\`\`

**Mark-Compact（标记-整理）算法**：

当老生代碎片化严重时，V8 会使用 Mark-Compact 来整理内存。它在 Mark-Sweep 的基础上增加了第三步：

1. **标记阶段**：同 Mark-Sweep。
2. **整理阶段（Compact）**：把所有存活对象向一端移动，消除碎片。
3. **更新引用**：更新所有指向被移动对象的指针。

\`\`\`javascript
// Mark-Compact 示意
// 整理前：[objA, 空闲, objB, 空闲, 空闲, objC, 空闲]
// 整理后：[objA, objB, objC, 空闲, 空闲, 空闲, 空闲]
// 所有对象紧密排列，无碎片
\`\`\`

**三色标记法（Tri-color Marking）**：

V8 使用**增量标记（Incremental Marking）**来减少 GC 暂停时间，其核心是**三色标记法**：

| 颜色 | 含义 | 状态 |
| --- | --- | --- |
| **白色** | 尚未被标记的对象 | 初始状态，GC 结束时白色对象会被回收 |
| **灰色** | 自身已被标记，但子对象尚未扫描 | 中间状态，表示"待处理" |
| **黑色** | 自身和所有子对象都已被标记 | 最终状态，确定存活 |

增量标记的工作方式：GC 不一次性完成所有标记工作，而是和 JavaScript 执行交替进行。每次执行一小段标记后，把控制权交还给 JavaScript 执行，然后再继续标记。这样虽然总的 GC 时间变长了，但每次暂停时间很短，用户几乎感觉不到。

**写屏障（Write Barrier）**：在增量标记期间，JavaScript 代码可能修改对象引用关系。写屏障的作用是：当黑色对象被添加了一个指向白色对象的新引用时，把黑色对象重新标记为灰色，确保不会漏标。

### GC 触发条件

V8 的 GC 不是随机触发的，而是基于以下条件：

| 触发条件 | 说明 |
| --- | --- |
| **新生代空间不足** | 当新生代分配新对象时发现空间不够，触发 Scavenge |
| **老生代空间不足** | 当老生代分配新对象时空间不够，触发 Mark-Sweep |
| **增量标记完成** | 增量标记的最终阶段触发完整 GC |
| **空闲时间 GC（Idle GC）** | 当事件循环空闲时，V8 主动执行 GC |
| **手动触发** | 可通过 \`--expose-gc\` 和 \`global.gc()\` 手动触发（仅开发调试用） |

**关键内存限制**：

V8 对堆大小有硬性限制：
- **64 位系统**：老生代默认约 1.4GB（新生代约 32MB）
- **32 位系统**：老生代默认约 0.7GB（新生代约 16MB）

可以通过 Node.js 启动参数调整：

\`\`\`bash
# 调整老生代最大内存（单位 MB）
node --max-old-space-size=4096 app.js   # 4GB

# 调整新生代最大内存（单位 MB）
node --max-semi-space-size=64 app.js

# 查看当前的 GC 相关参数
node --v8-options | grep gc
\`\`\`

### process.memoryUsage() 详解

\`process.memoryUsage()\` 返回一个对象，描述当前进程的内存使用情况：

| 字段 | 含义 | 说明 |
| --- | --- | --- |
| \`rss\` | Resident Set Size | 进程实际占用的物理内存（包括代码段、堆、栈、共享库等所有部分） |
| \`heapTotal\` | V8 堆总申请量 | V8 已向操作系统申请的内存总量 |
| \`heapUsed\` | V8 堆实际使用量 | V8 堆中实际被对象占用的内存 |
| \`external\` | 外部内存 | V8 管理的 C++ 对象占用的内存（如 Buffer 的底层内存） |
| \`arrayBuffers\` | ArrayBuffer 内存 | ArrayBuffer 和 SharedArrayBuffer 占用的内存（Node 12+） |

\`\`\`javascript
const mem = process.memoryUsage();
// rss 通常 > heapTotal，因为 rss 包含了堆之外的内存
// heapUsed 通常 < heapTotal，因为堆中有一部分空闲空间
// external 主要来自 Buffer 分配
\`\`\`

### Buffer 内存分配的特殊性

Buffer 的内存分配不经过 V8 堆，而是直接在堆外分配（通过 C++ 的 \`malloc\`）。这意味着：

1. **不参与 V8 GC**：Buffer 的内存不受 V8 GC 管理，不会触发 GC 暂停。
2. **计入 external**：在 \`process.memoryUsage()\` 中显示为 \`external\` 字段。
3. **独立释放**：当 Buffer 对象被 GC 回收时，其底层内存通过 C++ 析构函数释放。
4. **大 Buffer 使用慢速分配**：小于 4KB 的 Buffer 从预分配的内存池中分配（快速），大于 4KB 的直接调用 \`malloc\`（稍慢）。

\`\`\`javascript
// 观察 Buffer 分配对 external 内存的影响
const mem1 = process.memoryUsage();
console.log('分配前 external:', mem1.external);

const buf = Buffer.alloc(10 * 1024 * 1024); // 10MB
const mem2 = process.memoryUsage();
console.log('分配后 external:', mem2.external);
// external 会增加约 10MB
\`\`\`

### 内存泄漏常见原因

在 Node.js 中，内存泄漏通常由以下原因引起：

| 原因 | 说明 | 示例 |
| --- | --- | --- |
| **全局变量** | 全局变量永远不会被 GC 回收 | \`global.cache = {}\` 不断累积数据 |
| **闭包引用** | 闭包无意中持有大对象的引用 | 回调函数持有外部大对象的引用 |
| **事件监听器未移除** | EventEmitter 的监听器累积 | 每次请求添加监听器但不移除 |
| **定时器未清除** | setInterval 持续运行 | 忘记 clearInterval 的定时器 |
| **流未关闭** | 文件流、网络流未正确关闭 | 忘记 close 的 readStream |
| **缓存无限增长** | 缓存没有淘汰策略 | 把所有请求结果都缓存在内存中 |
| **Promise 未处理的拒绝** | 未处理的 Promise 拒绝会持有引用 | 忘记 catch 的 Promise |
| **模块级缓存** | require.cache 持有模块引用 | 模块中缓存大量数据 |

**检测内存泄漏的方法**：

\`\`\`javascript
// 方法 1：监控 process.memoryUsage()
// 如果 heapUsed 持续增长而不回落，可能存在内存泄漏

// 方法 2：使用 Node.js 内置的 --inspect 和 Chrome DevTools
// node --inspect app.js
// 在 Chrome 中打开 chrome://inspect，使用 Memory 面板

// 方法 3：使用 process.memoryUsage() 配合定时器监控
setInterval(() => {
  const mem = process.memoryUsage();
  console.log(\`heapUsed: \${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\`);
}, 5000);
\`\`\`

### 垃圾回收的最佳实践

1. **避免在热路径中创建大量临时对象**：每次 GC 都要扫描这些对象，频繁创建会触发频繁 GC。
2. **使用对象池复用大对象**：对于频繁创建销毁的大对象，考虑使用对象池。
3. **及时释放引用**：不再使用的对象设置为 \`null\`，帮助 GC 识别。
4. **合理使用 Buffer**：处理大文件时使用流（Stream），而不是一次性读入内存。
5. **监控内存**：在生产环境中监控 \`process.memoryUsage()\`，设置告警阈值。

下面这段代码演示了内存使用监控、内存泄漏模拟、Buffer 内存分配等内容。`,
    code: `// ============================================================
// 第一章代码演示：内存管理与垃圾回收实战
// ============================================================
const os = require("os");

// ---- 1. 基础内存使用情况 ----
console.log("===== 1. 基础内存使用情况 =====");
function printMemory(label) {
  const mem = process.memoryUsage();
  console.log("\\n[" + label + "]");
  console.log("  rss          : " + (mem.rss / 1024 / 1024).toFixed(2) + " MB  (常驻物理内存)");
  console.log("  heapTotal    : " + (mem.heapTotal / 1024 / 1024).toFixed(2) + " MB  (V8堆申请总量)");
  console.log("  heapUsed     : " + (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB  (V8堆实际使用)");
  console.log("  external     : " + (mem.external / 1024 / 1024).toFixed(2) + " MB  (外部内存)");
  if (mem.arrayBuffers !== undefined) {
    console.log("  arrayBuffers : " + (mem.arrayBuffers / 1024 / 1024).toFixed(2) + " MB  (ArrayBuffer)");
  }
  return mem;
}

// 初始内存快照
const snapshot1 = printMemory("初始内存快照");

// ---- 2. 模拟对象分配，观察内存增长 ----
console.log("\\n===== 2. 模拟对象分配观察内存增长 =====");

// 创建一个大型数组来消耗堆内存
const largeArray = [];
const objectCount = 100000;
console.log("创建 " + objectCount + " 个对象...");
for (let i = 0; i < objectCount; i++) {
  largeArray.push({
    id: i,
    name: "Item-" + i,
    data: "x".repeat(50), // 50 字节字符串
    timestamp: Date.now(),
  });
}
// 每个对象大概 100-200 字节，10 万个大约 10-20 MB
const snapshot2 = printMemory("分配 " + objectCount + " 个对象后");

// 计算增长量
console.log("\\n--- 内存增长对比 ---");
console.log("heapUsed 增长: " + ((snapshot2.heapUsed - snapshot1.heapUsed) / 1024 / 1024).toFixed(2) + " MB");
console.log("rss 增长: " + ((snapshot2.rss - snapshot1.rss) / 1024 / 1024).toFixed(2) + " MB");

// ---- 3. Buffer 内存分配演示 ----
console.log("\\n===== 3. Buffer 内存分配演示 =====");

// Buffer 内存分配在 V8 堆外，会计入 external
const externalBefore = process.memoryUsage().external;
console.log("分配前 external: " + (externalBefore / 1024 / 1024).toFixed(2) + " MB");

// 分配多个 Buffer 观察 external 增长
const buffers = [];
const bufSize = 1024 * 1024; // 1MB
const bufCount = 5;
console.log("分配 " + bufCount + " 个 " + (bufSize / 1024 / 1024) + "MB Buffer...");
for (let i = 0; i < bufCount; i++) {
  buffers.push(Buffer.alloc(bufSize, i));
}
const externalAfter = process.memoryUsage().external;
console.log("分配后 external: " + (externalAfter / 1024 / 1024).toFixed(2) + " MB");
console.log("external 增长: " + ((externalAfter - externalBefore) / 1024 / 1024).toFixed(2) + " MB");
console.log("Buffer 数量: " + buffers.length);

// Buffer 大小分类
console.log("\\nBuffer 大小分类:");
// 小于 4KB 的 Buffer 从 V8 的内存池分配
const smallBuf = Buffer.alloc(1024);      // 1KB ← 从内存池
const mediumBuf = Buffer.alloc(4096);    // 4KB ← 边界
const largeBuf = Buffer.alloc(8192);     // 8KB ← 直接 malloc
console.log("  1KB Buffer  : " + smallBuf.length + " 字节 (从内存池)");
console.log("  4KB Buffer  : " + mediumBuf.length + " 字节 (边界)");
console.log("  8KB Buffer  : " + largeBuf.length + " 字节 (直接 malloc)");

// ---- 4. 模拟内存泄漏 ----
console.log("\\n===== 4. 模拟内存泄漏 =====");

// 场景 1：全局缓存无限增长（常见泄漏模式）
console.log("--- 场景 1：缓存无限增长 ---");
const leakyCache = [];
function addToLeakyCache() {
  for (let i = 0; i < 1000; i++) {
    leakyCache.push({
      id: leakyCache.length,
      data: "leaked-data-" + "x".repeat(200),
      time: Date.now(),
    });
  }
}

// 初始状态
const memBeforeLeak = process.memoryUsage();
console.log("泄漏前 heapUsed: " + (memBeforeLeak.heapUsed / 1024 / 1024).toFixed(2) + " MB");

// 模拟 3 轮泄漏
for (let round = 1; round <= 3; round++) {
  addToLeakyCache();
  const mem = process.memoryUsage();
  console.log("第 " + round + " 轮泄漏后 heapUsed: " + (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB");
  console.log("  缓存中的对象数: " + leakyCache.length);
}

// 释放引用
console.log("\\n释放泄漏的缓存引用...");
leakyCache.length = 0; // 清空数组，让 GC 可以回收

// 场景 2：事件监听器泄漏（模拟）
console.log("\\n--- 场景 2：事件监听器泄漏 ---");
const events = require("events");
const emitter = new events.EventEmitter();

// 添加大量监听器（模拟每次请求添加但不移除）
let listenerCount = 0;
for (let i = 0; i < 20; i++) {
  emitter.on("data", function handler() {
    listenerCount++;
  });
}
console.log("已添加监听器数量: " + emitter.listenerCount("data"));
// 注意：默认最大监听器数量是 10，超过会打印警告
console.log("如果超过 10 个监听器，Node.js 会发出 MaxListenersExceededWarning");

// 正确做法：移除不需要的监听器
emitter.removeAllListeners("data");
console.log("移除后监听器数量: " + emitter.listenerCount("data"));

// ---- 5. 系统内存信息 ----
console.log("\\n===== 5. 系统内存信息 =====");
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
console.log("系统总内存: " + (totalMem / 1024 / 1024 / 1024).toFixed(2) + " GB");
console.log("系统可用内存: " + (freeMem / 1024 / 1024 / 1024).toFixed(2) + " GB");
console.log("系统已用内存: " + (usedMem / 1024 / 1024 / 1024).toFixed(2) + " GB");
console.log("系统内存使用率: " + ((usedMem / totalMem) * 100).toFixed(1) + "%");

// Node 进程占用系统内存的比例
const processMem = process.memoryUsage();
const processRssGB = processMem.rss / 1024 / 1024 / 1024;
console.log("\\nNode 进程 RSS: " + processRssGB.toFixed(4) + " GB");
console.log("Node 进程占系统内存比例: " + ((processMem.rss / totalMem) * 100).toFixed(2) + "%");

// ---- 6. 内存使用总结报告 ----
console.log("\\n===== 6. 内存使用总结报告 =====");
const finalMem = process.memoryUsage();
console.log("字段               | 值                    | 说明");
console.log("-------------------|----------------------|-----------------------------");
console.log("rss                | " + (finalMem.rss / 1024 / 1024).toFixed(2).padStart(10) + " MB      | 进程实际物理内存");
console.log("heapTotal          | " + (finalMem.heapTotal / 1024 / 1024).toFixed(2).padStart(10) + " MB      | V8 堆申请量");
console.log("heapUsed           | " + (finalMem.heapUsed / 1024 / 1024).toFixed(2).padStart(10) + " MB      | V8 堆实际使用");
console.log("external           | " + (finalMem.external / 1024 / 1024).toFixed(2).padStart(10) + " MB      | 外部内存(Buffer等)");
console.log("系统总内存         | " + (totalMem / 1024 / 1024 / 1024).toFixed(2).padStart(10) + " GB      | 操作系统可用的总内存");

console.log("\\n=== 内存管理关键要点 ===");
console.log("1. V8 堆内存分为新生代和老生代，分别用不同算法回收");
console.log("2. Buffer 内存分配在堆外，不受 V8 GC 管理");
console.log("3. 内存泄漏常见原因：全局缓存、事件监听器、定时器");
console.log("4. 生产环境应监控 heapUsed 趋势，防止内存泄漏");
console.log("5. 大文件处理使用流(Stream)，避免一次性读入内存");`,
  },

  // =========================================================
  // 第二章：V8 引擎深入
  // =========================================================
  {
    id: "node-v8-engine",
    title: "V8 引擎深入",
    icon: "⚡",
    group: "基础补充",
    content: `## V8 引擎架构

V8 是 Google 开发的高性能 JavaScript 和 WebAssembly 引擎，用 C++ 编写。它是 Node.js 和 Chrome 浏览器的核心引擎。V8 不只是一个简单的解释器——它是一套完整的**即时编译（JIT）**系统，能够在运行时将 JavaScript 代码编译成高效的机器码。

### V8 整体架构

V8 的编译流水线经历了多次演进。目前（V8 9.x+，对应 Node.js 18+）的架构如下：

\`\`\`
源代码（JavaScript）
    │
    ▼
解析器（Parser） ───► 生成 AST（抽象语法树）
    │
    ▼
Ignition（解释器） ───► 生成字节码并执行
    │
    │  （收集类型反馈信息）
    ▼
TurboFan（优化编译器） ───► 生成高度优化的机器码
    │
    │  （如果优化假设失效）
    ▼
去优化（Deoptimization） ───► 回退到 Ignition 解释执行
\`\`\`

### 各组件详解

#### 1. 解析器（Parser）

解析器将 JavaScript 源代码转换为**抽象语法树（AST）**。V8 的解析器做了很多优化：

- **惰性解析（Lazy Parsing）**：对于不立即执行的函数，V8 只做快速扫描（Pre-parsing），检查语法错误但不生成完整的 AST。只有当函数真正被调用时才会完整解析。这大大减少了启动时间。
- **流式解析（Streaming Parsing）**：从网络加载脚本时，V8 可以边下载边解析，不等整个文件下载完。
- **代码缓存（Code Caching）**：解析后的字节码可以被缓存，下次加载同一脚本时跳过解析步骤。

#### 2. Ignition（解释器）

Ignition 是 V8 的字节码解释器，于 2017 年引入（V8 5.9），取代了旧的 Full-codegen 编译器。它负责：

- 将 AST 编译为字节码（比机器码更紧凑，节省内存）
- 逐条解释执行字节码
- 在执行过程中**收集类型反馈（Type Feedback）**信息

**类型反馈**是 V8 优化的关键。当 Ignition 执行代码时，它记录每个操作的实际类型信息，例如：

\`\`\`javascript
function add(a, b) {
  return a + b;
}
// Ignition 执行时会记录：
// - 第一次调用 add(1, 2)：a 和 b 都是 Smi（小整数）
// - 第二次调用 add(1, 2)：a 和 b 还是 Smi → 确认是稳定的整数类型
// - 这些信息被传递给 TurboFan 用于优化
\`\`\`

#### 3. TurboFan（优化编译器）

TurboFan 是 V8 的优化编译器，于 2017 年引入，取代了旧的 Crankshaft 编译器。当 Ignition 发现某个函数被频繁调用（"热点"函数），TurboFan 会介入：

1. 获取 Ignition 收集的类型反馈信息
2. 基于"大多数情况下类型是稳定的"这一假设，生成高度优化的机器码
3. 在优化代码中插入**类型检查守卫**，如果运行时类型与假设不符，触发去优化

**TurboFan 的优化技术**：

- **内联（Inlining）**：把被调用函数体直接嵌入调用处，消除函数调用开销
- **逃逸分析（Escape Analysis）**：如果对象不逃逸出函数，直接在栈上分配
- **循环优化**：循环不变量外提、循环展开等
- **死代码消除**：移除永远不会执行的代码
- **类型特化**：基于类型反馈生成针对特定类型的机器码

### 隐藏类（Hidden Classes / Maps）

V8 使用**隐藏类**（也叫 Map 或 Shape）来优化对象属性访问。这是 V8 性能优化的核心概念之一。

**问题背景**：JavaScript 对象是动态的，可以随时添加或删除属性。如果每次访问属性都要遍历对象的所有属性来查找，效率会很低。V8 通过隐藏类实现类似 C++ 中通过偏移量直接访问属性的效果。

**隐藏类的工作原理**：

\`\`\`javascript
// 场景 1：标准化属性初始化
function Point(x, y) {
  this.x = x;  // 创建隐藏类 HC1（无属性 → 有 x）
  this.y = y;  // 过渡到隐藏类 HC2（有 x → 有 x, y）
}
// 所有 Point 实例共享相同的隐藏类 HC2
// 属性访问变成：对象 + 固定偏移量 → 直接读取
\`\`\`

\`\`\`javascript
// 场景 2：非标准化属性初始化（破坏隐藏类共享）
function Point(x, y) {
  this.x = x;
  this.y = y;
}
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
p2.z = 5;  // p2 现在有不同的隐藏类！
// p1 和 p2 不再共享隐藏类，优化失效
\`\`\`

**隐藏类的关键规则**：

| 规则 | 说明 |
| --- | --- |
| 相同顺序初始化属性 | 用相同顺序添加属性，对象共享隐藏类 |
| 构造函数中初始化所有属性 | 避免在构造函数之外添加属性 |
| 避免删除属性 | 删除属性会改变隐藏类，用 \`obj.prop = null\` 代替 |
| 避免动态属性 | 不要用 \`obj["prop" + index]\` 模式 |

### 内联缓存（Inline Cache / IC）

内联缓存是 V8 加速属性访问的另一项关键技术。它缓存了属性访问的"路径"，避免重复查找。

**工作流程**：

\`\`\`javascript
function getX(obj) {
  return obj.x;  // 属性访问
}
// 第一次调用 getX({x:1})：
//   1. 查找 obj 的隐藏类
//   2. 在隐藏类中找到 x 的偏移量
//   3. 缓存这个 "隐藏类 → 偏移量" 映射（内联缓存）
// 第二次调用 getX({x:2})：
//   1. 检查 obj 的隐藏类是否与缓存匹配
//   2. 如果匹配，直接用缓存的偏移量读取（非常快）
//   3. 如果不匹配，重新查找并更新缓存
\`\`\`

**内联缓存的状态**：

| 状态 | 说明 | 性能 |
| --- | --- | --- |
| **单态（Monomorphic）** | 只见过一种隐藏类 | 最快（直接比较 + 偏移读取） |
| **多态（Polymorphic）** | 见过 2-4 种隐藏类 | 较慢（需要比较多个缓存） |
| **超态（Megamorphic）** | 见过 5+ 种隐藏类 | 最慢（放弃缓存，每次查找） |

\`\`\`javascript
// 单态示例（最佳性能）
function process(obj) { return obj.x + obj.y; }
process({x:1, y:2});
process({x:3, y:4});  // 相同的隐藏类 → 单态

// 多态示例
function process(obj) { return obj.x + obj.y; }
process({x:1, y:2});      // 隐藏类 A
process({x:1, y:2, z:3}); // 隐藏类 B → 多态

// 超态示例（性能最差）
function process(obj) { return obj.x; }
process({x:1}); process({x:2, a:1}); process({x:3, b:2});
process({x:4, c:3}); process({x:5, d:4}); process({x:6, e:5});
// 6 种不同的隐藏类 → 超态
\`\`\`

### 去优化（Deoptimization）

当 TurboFan 生成的优化代码基于的类型假设不再成立时，就会发生去优化：V8 丢弃优化后的机器码，回退到 Ignition 解释执行。

**触发去优化的常见条件**：

| 条件 | 说明 | 示例 |
| --- | --- | --- |
| 类型变化 | 函数的参数类型与优化时假设不同 | 原来都是整数，突然传入字符串 |
| 隐藏类变化 | 对象属性结构与优化时不同 | 调用函数时传入不同形状的对象 |
| \`try-catch\` | 包含 try-catch 的函数 | 优化编译器可能避开 |
| \`arguments\` 对象 | 在非严格模式使用 arguments | 会阻止某些优化 |
| \`eval()\` | 使用 eval | 完全阻止优化 |
| \`for-in\` 循环 | 某些情况下 | 可能阻止优化 |
| \`delete\` 操作 | 删除对象属性 | 改变隐藏类 |
| \`with\` 语句 | 使用 with | 严重阻止优化 |

**如何避免去优化**：

\`\`\`javascript
// ❌ 避免：函数参数类型不稳定
function add(a, b) {
  return a + b;
}
add(1, 2);     // 优化为整数加法
add("a", "b");  // 去优化！实际是字符串拼接

// ✅ 推荐：保持参数类型稳定
function addInts(a, b) {
  return a + b;
}
addInts(1, 2);
addInts(3, 4); // 都是整数，稳定优化

// ❌ 避免：在构造函数外添加属性
function Point(x, y) {
  this.x = x;
  this.y = y;
}
const p = new Point(1, 2);
p.z = 3; // 改变隐藏类

// ✅ 推荐：在构造函数中初始化所有属性
function Point(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z || 0; // 即使不需要也初始化
}
\`\`\`

### 函数优化禁止原因

V8 会阻止某些函数的优化，常见原因包括：

| 原因 | 触发条件 |
| --- | --- |
| **使用了 \`arguments\`** | 非严格模式下访问 arguments |
| **使用了 \`eval()\`** | 任何形式的 eval |
| **try-catch / try-finally** | 包含异常处理的函数 |
| **for-in 循环** | 某些情况下 |
| **过大的函数** | 函数体超过一定大小（约 600 字节码） |
| **调试器语句** | 使用了 debugger 语句 |

可以通过 Node.js 的 \`--trace-opt\` 和 \`--trace-deopt\` 标志来观察优化和去优化情况：

\`\`\`bash
# 观察哪些函数被优化了
node --trace-opt app.js

# 观察哪些函数被去优化了
node --trace-deopt app.js

# 观察哪些函数没有被优化
node --trace-opt --trace-opt-verbose app.js
\`\`\`

### V8 版本与 Node.js 对应关系

| Node.js 版本 | V8 版本 | 关键特性 |
| --- | --- | --- |
| Node 16 | V8 9.0 - 9.4 | 指针压缩、WebAssembly 改进 |
| Node 18 | V8 10.1 - 10.7 | 更快的属性访问、WebAssembly 异常处理 |
| Node 20 | V8 11.3 | 字符串性能改进、新的 GC 优化 |
| Node 22 | V8 12.4 | WebAssembly 多内存、新正则表达式引擎 |

### V8 性能最佳实践

1. **保持对象形状一致**：在构造函数中初始化所有属性，按相同顺序添加。
2. **避免动态属性名**：使用 \`obj.prop\` 而非 \`obj["prop"]\`。
3. **保持函数参数类型稳定**：不要同一函数时而传数字时而传字符串。
4. **避免使用 \`arguments\`**：使用剩余参数 \`...args\` 代替。
5. **避免 \`delete\` 操作**：用 \`obj.prop = null\` 代替。
6. **避免在热路径中使用 try-catch**：将 try-catch 移到外层。
7. **使用数组字面量**：\`[1, 2, 3]\` 比 \`new Array(1, 2, 3)\` 更快。

下面这段代码演示了隐藏类、内联缓存、去优化等 V8 核心概念，并通过性能对比展示优化效果。`,
    code: `// ============================================================
// 第二章代码演示：V8 引擎优化实战
// ============================================================

// ---- 1. 隐藏类（Hidden Classes）演示 ----
console.log("===== 1. 隐藏类（Hidden Classes）演示 =====");

// 场景 A：标准化初始化（共享隐藏类）✅
console.log("--- 场景 A：标准化初始化 ---");
function PointGood(x, y) {
  this.x = x;  // 隐藏类 HC1: {} → {x}
  this.y = y;  // 隐藏类 HC2: {x} → {x, y}
}
const p1 = new PointGood(1, 2);
const p2 = new PointGood(3, 4);
// p1 和 p2 共享相同的隐藏类链
console.log("p1 属性: x=" + p1.x + ", y=" + p1.y);
console.log("p2 属性: x=" + p2.x + ", y=" + p2.y);
console.log("p1 和 p2 共享相同隐藏类 → 属性访问可被优化");

// 场景 B：非标准化初始化（破坏隐藏类共享）❌
console.log("\\n--- 场景 B：非标准化初始化 ---");
function PointBad(x, y) {
  this.x = x;
  if (y > 0) {
    this.y = y;  // 条件性添加属性
  }
}
const p3 = new PointBad(1, 2);
const p4 = new PointBad(3, -1); // y 为负值，不会添加 y 属性
console.log("p3 属性: x=" + p3.x + ", y=" + p3.y);
console.log("p4 属性: x=" + p4.x + ", y=" + p4.y);
console.log("p3 和 p4 隐藏类不同 → 属性访问无法被优化");

// 场景 C：在构造函数外添加属性 ❌
console.log("\\n--- 场景 C：事后添加属性 ---");
function PointPartial(x) {
  this.x = x;
}
const p5 = new PointPartial(1);
p5.y = 2; // 事后添加，改变隐藏类
const p6 = new PointPartial(3);
p6.y = 4;
p6.z = 5; // p6 有三个属性，隐藏类与 p5 完全不同
console.log("p5 在构造后添加了 y");
console.log("p6 在构造后添加了 y 和 z → 隐藏类不稳定");

// ---- 2. 内联缓存（Inline Cache）状态演示 ----
console.log("\\n===== 2. 内联缓存（IC）状态演示 =====");

// 单态（Monomorphic）—— 只见过一种隐藏类
console.log("--- 单态（Monomorphic）---");
function getValue(obj) {
  return obj.value;
}
const monoObj = { value: 42 };
console.log("调用 1: " + getValue(monoObj));
console.log("调用 2: " + getValue(monoObj));
console.log("调用 3: " + getValue(monoObj));
console.log("→ 单态：IC 只缓存了一种隐藏类，性能最优");

// 多态（Polymorphic）—— 见过 2-4 种隐藏类
console.log("\\n--- 多态（Polymorphic）---");
function getValuePoly(obj) {
  return obj.value;
}
const polyObj1 = { value: 1 };
const polyObj2 = { value: 2, extra: true };
const polyObj3 = { value: 3, name: "test" };
console.log("调用 1: " + getValuePoly(polyObj1));
console.log("调用 2: " + getValuePoly(polyObj2));
console.log("调用 3: " + getValuePoly(polyObj3));
console.log("→ 多态：IC 缓存了 3 种隐藏类，需要比较匹配");

// 超态（Megamorphic）—— 见过 5+ 种隐藏类
console.log("\\n--- 超态（Megamorphic）---");
function getValueMega(obj) {
  return obj.value;
}
const megaObjs = [];
for (let i = 0; i < 6; i++) {
  const obj = { value: i };
  // 给每个对象添加不同的额外属性，制造不同的隐藏类
  obj["extra" + i] = "data" + i;
  megaObjs.push(obj);
  getValueMega(obj);
}
console.log("调用了 6 种不同隐藏类的对象");
console.log("→ 超态：IC 放弃缓存，每次都要查找，性能最差");

// ---- 3. 去优化触发条件演示 ----
console.log("\\n===== 3. 去优化（Deoptimization）触发演示 =====");

// 场景：参数类型不稳定 → 触发去优化
console.log("--- 场景：参数类型不稳定 ---");
function add(a, b) {
  return a + b;
}

// 先以整数参数调用（V8 会优化为整数加法）
console.log("整数调用: add(1, 2) = " + add(1, 2));
console.log("整数调用: add(3, 4) = " + add(3, 4));

// 突然传入字符串 → 类型假设失效 → 去优化！
console.log("字符串调用: add('hello', 'world') = " + add("hello", "world"));
console.log("→ 类型从整数变为字符串，触发去优化");

// 场景：delete 操作改变隐藏类
console.log("\\n--- 场景：delete 改变隐藏类 ---");
const obj = { a: 1, b: 2, c: 3 };
console.log("原始对象: " + JSON.stringify(obj));
delete obj.b; // delete 会改变隐藏类结构
console.log("delete b 后: " + JSON.stringify(obj));
console.log("→ delete 操作改变了隐藏类，可能触发去优化");

// ---- 4. 性能对比：优化 vs 未优化 ----
console.log("\\n===== 4. 性能对比测试 =====");

// 测试 1：单态 vs 多态 vs 超态 性能对比
const iterations = 1000000;

function benchmarkMonomorphic() {
  const obj = { a: 1, b: 2, c: 3 };
  let sum = 0;
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    sum += obj.a + obj.b + obj.c; // 始终同一隐藏类
  }
  const elapsed = Date.now() - start;
  return { sum, elapsed };
}

function benchmarkPolymorphic() {
  const shapes = [
    { a: 1, b: 2, c: 3 },
    { a: 1, b: 2, c: 3, d: 4 },
    { a: 1, b: 2, c: 3, e: 5 },
    { a: 1, b: 2, c: 3, f: 6 },
  ];
  let sum = 0;
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    const obj = shapes[i % 4]; // 4 种不同隐藏类
    sum += obj.a + obj.b + obj.c;
  }
  const elapsed = Date.now() - start;
  return { sum, elapsed };
}

console.log("运行 " + (iterations / 1000).toFixed(0) + "k 次迭代...");
const monoResult = benchmarkMonomorphic();
const polyResult = benchmarkPolymorphic();

console.log("\\n--- 属性访问性能对比 ---");
console.log("单态（1种隐藏类）: " + monoResult.elapsed + "ms");
console.log("多态（4种隐藏类）: " + polyResult.elapsed + "ms");
if (monoResult.elapsed < polyResult.elapsed) {
  const slowdown = (polyResult.elapsed / monoResult.elapsed).toFixed(1);
  console.log("单态比多态快约 " + slowdown + " 倍");
  console.log("→ 结论：保持对象形状一致显著提升性能");
} else {
  console.log("（注意：小规模测试中差异可能不明显，但大规模应用下差异巨大）");
}

// 测试 2：构造函数初始化 vs 事后添加属性
console.log("\\n--- 构造函数初始化 vs 事后添加 ---");
const iterations2 = 500000;

function benchmarkConstructorInit() {
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }
  let sum = 0;
  const start = Date.now();
  for (let i = 0; i < iterations2; i++) {
    const p = new Point(i, i + 1);
    sum += p.x + p.y;
  }
  const elapsed = Date.now() - start;
  return { sum, elapsed };
}

function benchmarkLateAdd() {
  function Point(x) {
    this.x = x;
  }
  let sum = 0;
  const start = Date.now();
  for (let i = 0; i < iterations2; i++) {
    const p = new Point(i);
    p.y = i + 1; // 构造后添加属性
    sum += p.x + p.y;
  }
  const elapsed = Date.now() - start;
  return { sum, elapsed };
}

const constrResult = benchmarkConstructorInit();
const lateResult = benchmarkLateAdd();

console.log("构造函数初始化: " + constrResult.elapsed + "ms");
console.log("构造后添加属性: " + lateResult.elapsed + "ms");

// ---- 5. V8 版本信息 ----
console.log("\\n===== 5. V8 版本信息 =====");
console.log("Node.js 版本: " + process.version);
console.log("V8 版本: " + process.versions.v8);
console.log("V8 版本号格式: 主版本.次版本.构建号.补丁号");

// ---- 6. V8 性能优化建议总结 ----
console.log("\\n===== 6. V8 性能优化建议总结 =====");
console.log("1. ✅ 在构造函数中初始化所有属性");
console.log("2. ✅ 保持函数参数类型稳定");
console.log("3. ✅ 避免 delete 操作，用 obj.prop = null 代替");
console.log("4. ✅ 避免使用 arguments，用剩余参数 ...args");
console.log("5. ✅ 避免在热路径中使用 try-catch");
console.log("6. ✅ 保持对象形状一致，让它们共享隐藏类");
console.log("7. ✅ 使用数组字面量 [] 而非 new Array()");
console.log("8. ❌ 避免在构造函数外添加属性");
console.log("9. ❌ 避免动态属性名 obj['prop' + index]");
console.log("10. ❌ 避免使用 eval() 和 with 语句");`,
  },

  // =========================================================
  // 第三章：REPL 与交互式开发
  // =========================================================
  {
    id: "node-repl",
    title: "REPL 与交互式开发",
    icon: "🖥️",
    group: "基础补充",
    content: `## REPL 概述

REPL 是 **Read-Eval-Print Loop**（读取-求值-输出-循环）的缩写，是 Node.js 内置的交互式编程环境。它让你可以在终端中逐行输入 JavaScript 代码，立即看到执行结果，非常适合快速测试代码片段、探索 API 和学习新特性。

### REPL 启动方式

有几种方式可以进入 Node.js REPL：

**方式 1：直接运行 node（最常用）**

\`\`\`bash
$ node
> 
\`\`\`

只需在终端输入 \`node\`（不带任何参数），就会进入 REPL 环境。提示符 \`>\` 表示等待输入。

**方式 2：执行代码后进入 REPL**

\`\`\`bash
$ node -i -e "const x = 10"
> x
10
> 
\`\`\`

\`-i\` 标志表示执行代码后进入交互模式，\`-e\` 表示执行后面的代码字符串。

**方式 3：require REPL 模块**

\`\`\`bash
$ node -e "require('repl').start()"
> 
\`\`\`

**方式 4：管道输入**

\`\`\`bash
$ echo "1 + 2" | node -i
3
> 
\`\`\`

### REPL 特殊命令

在 REPL 环境中，以点号（\`.\`）开头的命令是 REPL 的特殊命令（不是 JavaScript 代码）：

| 命令 | 说明 | 示例 |
| --- | --- | --- |
| \`.help\` | 显示所有可用命令 | \`.help\` |
| \`.break\` | 中断当前多行输入（如输入到一半的代码块） | 按 Ctrl+C 也可以 |
| \`.clear\` | 清空 REPL 上下文，重置为初始状态 | \`.clear\` |
| \`.exit\` | 退出 REPL（按 Ctrl+D 两次也可以） | \`.exit\` |
| \`.save <file>\` | 把当前 REPL 会话的历史保存到文件 | \`.save session.js\` |
| \`.load <file>\` | 加载并执行一个 JavaScript 文件 | \`.load myScript.js\` |
| \`.editor\` | 进入编辑器模式（适合输入多行代码） | \`.editor\` 然后 Ctrl+D 执行 |

**\`.editor\` 模式的详细用法**：

\`\`\`
> .editor
// 进入编辑器模式
// 可以输入多行代码，像在文件中写代码一样
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));
// 按 Ctrl+D 结束输入并执行
55
\`\`\`

### REPL 的实用技巧

**1. 特殊变量 \`_\`**

\`_\` 保存了**上一个表达式的结果**：

\`\`\`
> 1 + 2
3
> _ * 10
30
> Math.pow(_, 2)
900
\`\`\`

**2. Tab 键自动补全**

在 REPL 中输入部分代码后按 Tab 键，可以自动补全变量名、属性名、方法名等。如果有多个可能的补全，按两次 Tab 会列出所有选项。

\`\`\`
> process.ver<Tab>
> process.version
\`\`\`

**3. 多行输入**

当你输入未完成的代码块时（如函数定义、循环、条件语句），REPL 会自动切换到多行模式，提示符变为 \`...\`：

\`\`\`
> function add(a, b) {
... return a + b;
... }
undefined
> add(3, 4)
7
\`\`\`

**4. 访问核心模块**

REPL 中可以直接使用所有全局对象和核心模块（通过 require）：

\`\`\`
> const fs = require('fs')
> fs.readdirSync('.')
[ 'app.js', 'package.json', ... ]
\`\`\`

**5. REPL 的上下文**

REPL 有一个全局上下文，你在其中定义的所有变量都会保留，直到退出 REPL 或使用 \`.clear\` 清空。

### 自定义 REPL（repl 模块）

Node.js 的 \`repl\` 模块允许你创建自定义的 REPL 环境，可以定制提示符、评估函数、完成器等。

**基本用法**：

\`\`\`javascript
const repl = require('repl');

// 启动自定义 REPL
const server = repl.start({
  prompt: 'my-app> ',           // 自定义提示符
  useColors: true,              // 语法高亮
  ignoreUndefined: true,       // 忽略 undefined 返回值
  replMode: repl.REPL_MODE_SLOPPY, // 或 REPL_MODE_STRICT
});
\`\`\`

**repl.start() 的配置选项**：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`prompt\` | string | \`'> '\` | 提示符字符串 |
| \`input\` | ReadableStream | \`process.stdin\` | 输入流 |
| \`output\` | WritableStream | \`process.stdout\` | 输出流 |
| \`terminal\` | boolean | \`true\` | 是否终端模式（支持 ANSI 颜色） |
| \`eval\` | function | 默认 eval | 自定义评估函数（可做沙箱） |
| \`writer\` | function | 默认格式化 | 自定义输出格式化函数 |
| \`completer\` | function | 默认补全 | 自定义自动补全函数 |
| \`useColors\` | boolean | \`false\` | 是否启用语法高亮 |
| \`useGlobal\` | boolean | \`true\` | 是否使用全局上下文 |
| \`ignoreUndefined\` | boolean | \`false\` | 忽略 \`undefined\` 返回 |
| \`replMode\` | symbol | \`REPL_MODE_SLOPPY\` | 严格模式或宽松模式 |
| \`breakEvalOnSigint\` | boolean | \`false\` | Ctrl+C 是否中断执行 |
| \`preview\` | boolean | \`false\` | 是否显示输入预览 |

**自定义 eval 函数（实现沙箱）**：

\`\`\`javascript
const repl = require('repl');
const vm = require('vm');

const server = repl.start({
  eval: (cmd, context, filename, callback) => {
    // cmd 是用户输入的代码
    // context 是 REPL 的上下文对象
    try {
      const result = vm.runInContext(cmd, context);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  },
});
\`\`\`

**自定义自动补全（completer）**：

\`\`\`javascript
const server = repl.start({
  completer: (line) => {
    const completions = ['.help', '.exit', '.clear', '.save', '.load'];
    const hits = completions.filter((c) => c.startsWith(line));
    // 返回 [匹配列表, 匹配的原始字符串]
    return [hits.length ? hits : completions, line];
  },
});
\`\`\`

### REPL 与 async/await

在 Node.js 16+ 中，REPL 支持顶层 await：

\`\`\`
> await Promise.resolve(42)
42
> const data = await fetch('https://api.github.com')
> data.status
200
\`\`\`

### REPL 的历史记录

REPL 会将输入历史保存到 \`~/.node_repl_history\` 文件中，可以通过环境变量 \`NODE_REPL_HISTORY\` 自定义路径：

\`\`\`bash
# 设置自定义历史文件路径
export NODE_REPL_HISTORY=~/.my_node_history

# 设置历史记录最大条数（默认 1000）
export NODE_REPL_HISTORY_SIZE=5000
\`\`\`

### REPL 环境变量

| 环境变量 | 说明 | 默认值 |
| --- | --- | --- |
| \`NODE_REPL_HISTORY\` | 历史文件路径 | \`~/.node_repl_history\` |
| \`NODE_REPL_HISTORY_SIZE\` | 最大历史记录数 | 1000 |
| \`NODE_REPL_MODE\` | REPL 模式 | \`sloppy\`（可设为 \`strict\`） |

下面这段代码模拟了自定义 REPL 环境的创建和使用，演示了 REPL 的核心概念。`,
    code: `// ============================================================
// 第三章代码演示：REPL 交互式开发模拟
// ============================================================
// 注意：repl 模块不在沙箱允许的 require 列表中，
// 因此本章用代码模拟 REPL 的核心概念和行为。

const util = require("util");

// ---- 1. REPL 核心概念：Read-Eval-Print-Loop 模拟 ----
console.log("===== 1. REPL 核心循环模拟 =====");

// 模拟 REPL 的 Read-Eval-Print 循环
function simulateRepl(inputs) {
  const context = {}; // 模拟 REPL 上下文
  const results = [];

  for (const input of inputs) {
    // Read：读取输入（已完成）
    console.log("\\n> " + input);

    try {
      // Eval：用 eval 评估输入（REPL 内部使用 vm 模块）
      // 注意：真实 REPL 使用 vm.createContext 沙箱
      const result = eval(input);

      // Print：打印结果
      if (result !== undefined) {
        const formatted = util.inspect(result, {
          colors: false,
          depth: 3,
          maxArrayLength: 20,
        });
        console.log(formatted);
        results.push({ input, result, error: null });
      } else {
        results.push({ input, result: undefined, error: null });
      }
    } catch (err) {
      // Print Error
      console.log("Uncaught " + err.name + ": " + err.message);
      results.push({ input, result: null, error: err.message });
    }
  }

  return results;
}

// 模拟一段 REPL 会话
console.log("模拟 REPL 会话:");
simulateRepl([
  "1 + 2",
  "Math.pow(3, 4)",
  "const greeting = 'Hello, REPL!'",
  "greeting.toUpperCase()",
  "typeof greeting",
  "JSON.stringify({name: 'test', value: 42})",
  "[1, 2, 3].map(x => x * 2)",
]);

// ---- 2. REPL 特殊变量 _ 模拟 ----
console.log("\\n===== 2. REPL 特殊变量 _ 模拟 =====");

// 在真实 REPL 中，_ 自动保存上一个表达式的结果
let replLastResult = undefined;

function replEval(input) {
  console.log("> " + input);
  // 替换 _ 为上一次的结果
  const processedInput = input.replace(/\\b_\\b/g,
    JSON.stringify(replLastResult)
  );
  try {
    const result = eval(processedInput);
    replLastResult = result;
    if (result !== undefined) {
      console.log(result);
    }
  } catch (e) {
    console.log(e.message);
  }
}

console.log("模拟 REPL _ 变量:");
replEval("2 + 3");
replEval("_ * 10");       // 应该输出 50
replEval("Math.pow(_, 2)"); // 应该输出 2500

// ---- 3. 自定义 REPL 配置模拟 ----
console.log("\\n===== 3. 自定义 REPL 配置模拟 =====");

// 模拟 repl.start() 的配置选项
function createCustomRepl(options) {
  console.log("--- 创建自定义 REPL ---");
  console.log("配置选项:");
  console.log("  prompt: " + JSON.stringify(options.prompt || "> "));
  console.log("  useColors: " + (options.useColors || false));
  console.log("  ignoreUndefined: " + (options.ignoreUndefined || false));
  console.log("  replMode: " + (options.replMode === "strict" ? "严格模式" : "宽松模式"));

  // 模拟自定义 writer（格式化输出）
  const writer = options.writer || util.inspect;

  return {
    prompt: options.prompt || "> ",
    context: {},
    eval: function (input) {
      try {
        const result = eval(input);
        if (result === undefined && options.ignoreUndefined) {
          return ""; // 忽略 undefined
        }
        return writer(result);
      } catch (e) {
        return "Error: " + e.message;
      }
    },
  };
}

// 创建不同配置的 REPL
const repl1 = createCustomRepl({
  prompt: "my-app> ",
  useColors: true,
  ignoreUndefined: true,
  replMode: "strict",
});

const repl2 = createCustomRepl({
  prompt: "debug> ",
  ignoreUndefined: false,
});

console.log("\\nREPL 1 (my-app) 评估: " + repl1.eval("1 + 2"));
console.log("REPL 1 (my-app) 评估 undefined: '" + repl1.eval("var x = 1") + "' (被忽略)");
console.log("REPL 2 (debug) 评估 undefined: '" + repl2.eval("var x = 1") + "'");

// ---- 4. 自动补全（Completer）模拟 ----
console.log("\\n===== 4. 自动补全（Completer）模拟 =====");

// 模拟补全逻辑
function createCompleter(completions) {
  return function (line) {
    const hits = completions.filter(function (c) {
      return c.startsWith(line);
    });
    // 真实补全返回 [hits, line]
    if (hits.length === 1) {
      return { completion: hits[0], matches: hits };
    } else if (hits.length > 1) {
      return { completion: line, matches: hits };
    }
    return { completion: line, matches: [] };
  };
}

// 模拟一个带自定义命令的 REPL 补全
const customCommands = [
  ".help", ".exit", ".clear", ".save", ".load",
  ".editor", ".break",
];
const globalCompletions = [
  "console", "process", "Buffer", "setTimeout", "setInterval",
  "require", "module", "__dirname", "__filename",
  "Math", "JSON", "Array", "Object", "String", "Number",
  "Promise", "Map", "Set", "Date", "RegExp",
];

const replCompleter = createCompleter(
  customCommands.concat(globalCompletions)
);

console.log("输入 'con' 的补全:");
console.log(replCompleter("con"));

console.log("\\n输入 'process' 的补全:");
console.log(replCompleter("process"));

console.log("\\n输入 '.he' 的补全:");
console.log(replCompleter(".he"));

console.log("\\n输入 'xyz' 的补全:");
console.log(replCompleter("xyz"));

// ---- 5. REPL 多行输入模拟 ----
console.log("\\n===== 5. 多行输入模拟 =====");

// 模拟 REPL 检测未完成的代码块
function isIncompleteCode(code) {
  // 简单检测：计算括号平衡
  const openParens = (code.match(/[{(\\[]/g) || []).length;
  const closeParens = (code.match(/[})\\]]/g) || []).length;
  if (openParens !== closeParens) return true;

  // 检测函数定义未完成
  if (/function\\s*\\w*\\s*\\([^)]*\\)\\s*\\{[^}]*$/.test(code)) return true;

  // 检测以 { 结尾但未闭合
  if (code.trim().endsWith("{")) return true;

  return false;
}

const testCases = [
  "function add(a, b) {",
  "return a + b;",
  "}",
  "if (true) {",
  "  console.log('hello')",
  "}",
  "const obj = { name: 'test',",
  "  age: 20",
  "}",
  "1 + 2",
];

let accumulated = "";
for (const line of testCases) {
  accumulated += (accumulated ? "\\n" : "") + line;
  const incomplete = isIncompleteCode(accumulated);
  console.log((incomplete ? "... " : "> ") + line);
  if (!incomplete) {
    console.log("  → 完整代码块，可以执行");
    // 执行代码
    try {
      const result = eval(accumulated);
      if (result !== undefined) {
        console.log("  结果: " + util.inspect(result));
      }
    } catch (e) {
      console.log("  错误: " + e.message);
    }
    accumulated = "";
  }
}

// ---- 6. .editor 模式模拟 ----
console.log("\\n===== 6. .editor 模式模拟 =====");

// .editor 模式允许多行输入，按 Ctrl+D 结束
function simulateEditorMode(code) {
  console.log("// 进入 editor 模式");
  console.log("// 输入以下代码:");
  console.log(code);
  console.log("// 按 Ctrl+D 结束输入并执行");
  console.log("\\n执行结果:");
  try {
    const result = eval(code);
    if (result !== undefined) {
      console.log(util.inspect(result, { depth: 3 }));
    }
  } catch (e) {
    console.log("Error: " + e.message);
  }
}

simulateEditorMode(
  "function fibonacci(n) {\\n" +
  "  if (n <= 1) return n;\\n" +
  "  return fibonacci(n - 1) + fibonacci(n - 2);\\n" +
  "}\\n" +
  "fibonacci(10)"
);

// ---- 7. REPL 历史记录模拟 ----
console.log("\\n===== 7. REPL 历史记录模拟 =====");

// 模拟 REPL 历史记录管理
function createHistoryManager(maxSize) {
  const history = [];
  return {
    add: function (input) {
      // 忽略空行和重复命令
      if (input.trim() === "") return;
      if (history.length > 0 && history[history.length - 1] === input) return;
      history.push(input);
      if (history.length > maxSize) {
        history.shift(); // 移除最旧的记录
      }
    },
    getAll: function () {
      return history.slice();
    },
    getRecent: function (n) {
      return history.slice(-n);
    },
    size: function () {
      return history.length;
    },
    clear: function () {
      history.length = 0;
    },
  };
}

const history = createHistoryManager(5);
history.add("const x = 10");
history.add("x * 2");
history.add("Math.pow(x, 3)");
history.add("const y = 20");
history.add("x + y");
history.add("console.log(x, y)"); // 第6条，会挤掉第1条

console.log("历史记录（最多保留 " + 5 + " 条）:");
history.getAll().forEach(function (cmd, i) {
  console.log("  " + (i + 1) + ". " + cmd);
});

// ---- 8. .save 和 .load 模拟 ----
console.log("\\n===== 8. .save 和 .load 模拟 =====");

const fs = require("fs");
const path = require("path");
const os = require("os");

// 模拟 .save：保存当前会话历史到文件
const historyFile = path.join(os.tmpdir(), "repl-session-demo.js");
const sessionCode = [
  "const greeting = 'Hello from saved session';",
  "const numbers = [1, 2, 3, 4, 5];",
  "const sum = numbers.reduce((a, b) => a + b, 0);",
  "console.log('Sum:', sum);",
].join("\\n");

try {
  fs.writeFileSync(historyFile, sessionCode, "utf8");
  console.log(".save → 已保存会话到: " + historyFile);
} catch (e) {
  console.log("保存失败: " + e.message);
}

// 模拟 .load：加载并执行文件
try {
  const loadedCode = fs.readFileSync(historyFile, "utf8");
  console.log(".load → 加载文件内容:");
  console.log("---");
  console.log(loadedCode.trim());
  console.log("---");
  console.log("执行加载的代码:");
  eval(loadedCode);

  // 清理
  fs.unlinkSync(historyFile);
} catch (e) {
  console.log("加载失败: " + e.message);
}

// ---- 9. REPL 使用技巧总结 ----
console.log("\\n===== 9. REPL 使用技巧总结 =====");
console.log("1. 直接输入 node 进入 REPL");
console.log("2. _ 变量保存上一个表达式的结果");
console.log("3. Tab 键自动补全，按两次显示所有选项");
console.log("4. .editor 进入多行编辑模式");
console.log("5. .save 和 .load 保存/加载会话");
console.log("6. .clear 清空上下文，.exit 退出");
console.log("7. .break 或 Ctrl+C 中断当前输入");
console.log("8. Ctrl+D 两次退出 REPL（或 .exit）");
console.log("9. 使用 repl 模块创建自定义 REPL 环境");
console.log("10. Node 16+ 支持 REPL 顶层 await");`,
  },

  // =========================================================
  // 第四章：命令行参数与环境变量
  // =========================================================
  {
    id: "node-cli",
    title: "命令行参数与环境变量",
    icon: "⚙️",
    group: "基础补充",
    content: `## 命令行参数与环境变量概述

在 Node.js 中，\`process.argv\` 和 \`process.env\` 是两个最常用的全局对象，用于获取启动参数和环境配置。它们是构建 CLI 工具和配置应用的基础。

### process.argv 详解

\`process.argv\` 是一个字符串数组，包含启动 Node.js 进程时传入的所有命令行参数。

**数组结构**：

| 索引 | 内容 | 说明 |
| --- | --- | --- |
| \`argv[0]\` | Node.js 可执行文件的绝对路径 | 如 \`/usr/local/bin/node\` |
| \`argv[1]\` | 正在执行的脚本文件的绝对路径 | 如 \`/home/user/app.js\` |
| \`argv[2]\` | 第一个用户传入的参数 | 程序的实际参数从这里开始 |
| \`argv[3]\` | 第二个用户传入的参数 | ... |
| ... | 更多参数 | ... |

**示例**：

\`\`\`bash
$ node app.js --name=test --verbose --port 3000
\`\`\`

\`\`\`javascript
console.log(process.argv);
// [
//   '/usr/local/bin/node',           // argv[0]
//   '/home/user/app.js',             // argv[1]
//   '--name=test',                   // argv[2]
//   '--verbose',                     // argv[3]
//   '--port',                        // argv[4]
//   '3000'                           // argv[5]
// ]
\`\`\`

**process.argv0**：\`process.argv0\` 是启动 Node.js 时使用的原始命令名，不等于 \`process.argv[0]\`，后者是解析后的完整路径。

\`\`\`javascript
// 如果你用 /usr/local/bin/node 启动，但 PATH 中的 node 是符号链接
// process.argv0 可能是 'node'
// process.argv[0] 是 '/usr/local/bin/node'
\`\`\`

**process.execArgv**：Node.js 自身的启动参数（如 \`--inspect\`、\`--harmony\`），不包含脚本名和用户参数。

\`\`\`bash
$ node --inspect --max-old-space-size=4096 app.js --port 3000
\`\`\`

\`\`\`javascript
process.execArgv  // ['--inspect', '--max-old-space-size=4096']
process.argv      // [..., 'app.js', '--port', '3000']
\`\`\`

### 解析命令行参数的最佳实践

**简单解析（自己实现）**：

\`\`\`javascript
// 从 argv[2] 开始解析用户参数
const args = process.argv.slice(2);

// 获取位置参数
const input = args[0];
const output = args[1];

// 获取命名参数
const verbose = args.includes('--verbose');
const portIndex = args.indexOf('--port');
const port = portIndex !== -1 ? args[portIndex + 1] : 3000;
\`\`\`

**使用第三方库（推荐）**：

在生产环境中，推荐使用成熟的 CLI 参数解析库：

| 库 | 特点 | 适用场景 |
| --- | --- | --- |
| \`commander\` | 最流行，功能全面 | 复杂 CLI 工具 |
| \`yargs\` | 功能丰富，自动生成帮助 | 需要复杂参数解析 |
| \`minimist\` | 极简，轻量 | 简单参数解析 |
| \`arg\` | 现代化，TypeScript 友好 | 需要类型安全 |

### process.env 详解

\`process.env\` 是一个包含所有环境变量的对象。环境变量是操作系统级别的配置，在进程启动时被注入。

**基本用法**：

\`\`\`javascript
// 读取环境变量
const nodeEnv = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;

// 如果环境变量不存在，返回 undefined
console.log(process.env.NOT_SET_VAR); // undefined
\`\`\`

**重要环境变量**：

| 环境变量 | 说明 | 常见值 |
| --- | --- | --- |
| \`NODE_ENV\` | 运行环境标识 | \`'development'\`, \`'production'\`, \`'test'\` |
| \`PORT\` | 应用端口号 | \`3000\`, \`8080\` |
| \`PATH\` | 可执行文件搜索路径 | 系统 PATH |
| \`HOME\` | 用户主目录 | \`/home/user\` 或 \`C:\\\\Users\\\\user\` |
| \`USER\` / \`USERNAME\` | 当前用户名 | 当前登录用户 |
| \`TMPDIR\` / \`TEMP\` | 临时目录 | 系统临时文件目录 |
| \`LANG\` | 系统语言和区域设置 | \`en_US.UTF-8\` |
| \`SHELL\` | 默认 Shell | \`/bin/bash\`, \`/bin/zsh\` |
| \`PWD\` | 当前工作目录 | 当前所在目录 |

**环境变量的特点**：

1. **值始终是字符串**：即使你设置了 \`PORT=3000\`，\`process.env.PORT\` 的值也是字符串 \`'3000'\`，不是数字。
2. **键名大小写敏感**：在大多数系统上，\`process.env.PATH\` 和 \`process.env.path\` 是不同的。
3. **Windows 不区分大小写**：在 Windows 上，环境变量名不区分大小写（但 Node.js 会保持原始大小写）。
4. **值是只读快照**：\`process.env\` 是进程启动时的环境变量快照，在运行时修改只会影响当前进程。

### NODE_ENV 详解

\`NODE_ENV\` 是 Node.js 生态系统中的约定俗成的环境变量，并不是 Node.js 内核的一部分。它被广泛用于区分开发环境和生产环境。

**典型用法**：

\`\`\`javascript
if (process.env.NODE_ENV === 'production') {
  // 生产环境：启用缓存、压缩、最小化日志
} else if (process.env.NODE_ENV === 'test') {
  // 测试环境：使用测试数据库、模拟服务
} else {
  // 开发环境：详细日志、热重载
}
\`\`\`

**设置 NODE_ENV 的方式**：

\`\`\`bash
# Unix / macOS
NODE_ENV=production node app.js
export NODE_ENV=production && node app.js

# Windows (CMD)
set NODE_ENV=production && node app.js

# Windows (PowerShell)
$env:NODE_ENV="production"; node app.js

# 使用 cross-env（跨平台）
npx cross-env NODE_ENV=production node app.js
\`\`\`

**注意**：许多框架（Express、Next.js 等）会根据 \`NODE_ENV\` 自动调整行为。

### NODE_OPTIONS 环境变量

\`NODE_OPTIONS\` 是一个特殊的环境变量，用于向 Node.js 传递命令行选项，而不需要在命令行中显式指定。

\`\`\`bash
# 设置最大内存
NODE_OPTIONS="--max-old-space-size=4096" node app.js

# 开启调试
NODE_OPTIONS="--inspect" node app.js

# 多个选项
NODE_OPTIONS="--max-old-space-size=4096 --inspect" node app.js
\`\`\`

**NODE_OPTIONS 的限制**：

- 不能使用 \`--require\` 或 \`--loader\`（出于安全考虑，Node 19+）
- 不能使用 \`--v8-options\`
- 不能使用 \`--perf-basic-prof\`
- 如果选项在 \`NODE_OPTIONS\` 和命令行中同时出现，**命令行中的选项优先**

### 进程退出码（Exit Code）

退出码是进程结束时返回给操作系统的整数，表示进程的执行结果。

**约定**：

| 退出码 | 含义 |
| --- | --- |
| \`0\` | 正常退出，没有错误 |
| \`1\` | 一般性错误（Uncaught Fatal Exception） |
| \`2\` | 使用错误（如参数不正确） |
| \`3\` | 内部 JavaScript 解析错误 |
| \`4\` | 内部 JavaScript 执行失败 |
| \`5\` | 致命错误（V8 无法恢复） |
| \`6\` | 非函数的内部异常处理 |
| \`7\` | 内部异常处理运行时失败 |
| \`9\` | 无效参数 |
| \`10\` | 内部 JavaScript 运行时失败 |
| \`12\` | 无效的调试参数 |
| \`128 + 信号值\` | 被信号终止（如 \`SIGTERM\` 的 15 → 退出码 143） |

**使用方式**：

\`\`\`javascript
// 方式 1：process.exit() 立即退出
process.exit(0);  // 正常退出
process.exit(1);  // 异常退出

// 方式 2：process.exitCode 设置退出码，等待进程自然结束
process.exitCode = 1;
// 进程会在事件循环为空时自然退出，退出码为 1
\`\`\`

**process.exit() vs process.exitCode**：

| 特性 | process.exit(code) | process.exitCode = code |
| --- | --- | --- |
| 退出时机 | 立即退出，跳过后续代码 | 等待进程自然结束 |
| 异步操作 | 不会等待异步操作完成 | 等待事件循环清空 |
| exit 事件 | 会触发 | 会触发 |
| stdout/stderr | 可能丢失未刷新的数据 | 数据正常刷新 |

**最佳实践**：

\`\`\`javascript
// ✅ 推荐：让进程自然退出
process.exitCode = 1;

// ❌ 避免：在正常流程中强行退出
// process.exit(0);  // 可能中断正在进行的 I/O 操作

// ✅ 只在需要立即终止时使用 exit
process.on('uncaughtException', (err) => {
  console.error('致命错误:', err);
  process.exit(1);  // 这种情况下立即退出是合理的
});
\`\`\`

### 环境变量文件 (.env)

对于复杂的配置，建议使用 \`.env\` 文件配合 \`dotenv\` 库管理环境变量：

\`\`\`bash
# .env 文件
DATABASE_URL=postgres://localhost:5432/mydb
API_KEY=secret-key-here
PORT=3000
NODE_ENV=development
\`\`\`

\`\`\`javascript
// 加载 .env 文件
require('dotenv').config();
console.log(process.env.DATABASE_URL);
\`\`\`

> 注意：\`.env\` 文件不应提交到版本控制（添加到 \`.gitignore\`），应提供 \`.env.example\` 作为模板。

下面这段代码演示了命令行参数解析、环境变量读取、退出码等实战用法。`,
    code: `// ============================================================
// 第四章代码演示：命令行参数与环境变量
// ============================================================

// ---- 1. process.argv 详解 ----
console.log("===== 1. process.argv 详解 =====");
console.log("argv[0] (Node.js 路径): " + process.argv[0]);
console.log("argv[1] (脚本路径): " + process.argv[1]);
console.log("argv 完整数组: " + JSON.stringify(process.argv));
console.log("用户参数数量: " + Math.max(0, process.argv.length - 2));

// 提取用户参数（从 argv[2] 开始）
const userArgs = process.argv.slice(2);
console.log("用户参数: " + JSON.stringify(userArgs));

// ---- 2. process.execArgv ----
console.log("\\n===== 2. process.execArgv =====");
// execArgv 是 Node.js 自身的启动参数
console.log("Node.js 启动参数: " + JSON.stringify(process.execArgv));
if (process.execArgv.length === 0) {
  console.log("（未传入任何 Node.js 启动参数）");
}

// ---- 3. 简易命令行参数解析器 ----
console.log("\\n===== 3. 简易命令行参数解析器 =====");

// 模拟命令行参数（实际运行时从 process.argv 读取）
const simulatedArgs = [
  "--name=myapp",
  "--port",
  "8080",
  "--verbose",
  "--config",
  "./config.json",
  "input.txt",
  "output.txt",
];

function parseArgs(args) {
  const result = {
    _: [],        // 位置参数（非命名参数）
    flags: {},    // 布尔标志
    options: {},  // 键值对选项
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // 处理 --key=value 格式
    if (arg.startsWith("--") && arg.includes("=")) {
      const eqIndex = arg.indexOf("=");
      const key = arg.slice(2, eqIndex);
      const value = arg.slice(eqIndex + 1);
      result.options[key] = value;
    }
    // 处理 --key value 格式
    else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      // 查看下一个参数是否是值
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        result.options[key] = args[i + 1];
        i++; // 跳过下一个参数
      } else {
        result.flags[key] = true; // 布尔标志
      }
    }
    // 处理 -k value 格式（短选项）
    else if (arg.startsWith("-") && arg.length === 2) {
      const key = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        result.options[key] = args[i + 1];
        i++;
      } else {
        result.flags[key] = true;
      }
    }
    // 位置参数
    else {
      result._.push(arg);
    }
  }

  return result;
}

const parsed = parseArgs(simulatedArgs);
console.log("模拟输入: " + simulatedArgs.join(" "));
console.log("\\n解析结果:");
console.log("  位置参数: " + JSON.stringify(parsed._));
console.log("  布尔标志: " + JSON.stringify(parsed.flags));
console.log("  键值选项: " + JSON.stringify(parsed.options));

// 获取常用选项
const appName = parsed.options.name || "default-app";
const port = parseInt(parsed.options.port) || 3000;
const verbose = !!parsed.flags.verbose;
const configFile = parsed.options.config || "./config.json";

console.log("\\n应用配置:");
console.log("  名称: " + appName);
console.log("  端口: " + port + " (类型: " + typeof port + ")");
console.log("  详细模式: " + verbose);
console.log("  配置文件: " + configFile);

// ---- 4. process.env 环境变量 ----
console.log("\\n===== 4. process.env 环境变量 =====");

// 所有环境变量的键
const envKeys = Object.keys(process.env);
console.log("环境变量总数: " + envKeys.length);

// 常用环境变量
console.log("\\n常用环境变量:");
console.log("  NODE_ENV        : " + (process.env.NODE_ENV || "(未设置)"));
console.log("  HOME            : " + (process.env.HOME || "(未设置)"));
console.log("  USER            : " + (process.env.USER || process.env.USERNAME || "(未设置)"));
console.log("  PATH (前50字符) : " + (process.env.PATH || "").slice(0, 50) + "...");
console.log("  SHELL           : " + (process.env.SHELL || "(未设置)"));
console.log("  LANG            : " + (process.env.LANG || "(未设置)"));
console.log("  PWD             : " + (process.env.PWD || "(未设置)"));
console.log("  TMPDIR          : " + (process.env.TMPDIR || process.env.TEMP || "(未设置)"));

// ---- 5. 环境变量默认值模式 ----
console.log("\\n===== 5. 环境变量默认值模式 =====");

// 模式 1：|| 运算符（简单默认值）
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || "5432";
console.log("数据库主机: " + dbHost + " (默认: localhost)");
console.log("数据库端口: " + dbPort + " (默认: 5432)");

// 模式 2：空值合并运算符 ??（区别空字符串和未设置）
const apiKey = process.env.API_KEY ?? "default-key";
const emptyStr = process.env.EMPTY_TEST ?? "default-val";
console.log("API Key: " + apiKey + " (默认: default-key)");
console.log("空字符串测试: " + JSON.stringify(emptyStr) + " (当未设置时使用默认值)");

// 模式 3：类型转换
const maxConnections = parseInt(process.env.MAX_CONNECTIONS) || 10;
const enableSsl = process.env.ENABLE_SSL === "true";
const timeout = parseFloat(process.env.TIMEOUT) || 5.0;
console.log("最大连接数: " + maxConnections + " (类型: " + typeof maxConnections + ")");
console.log("启用 SSL: " + enableSsl + " (类型: " + typeof enableSsl + ")");
console.log("超时时间: " + timeout + " (类型: " + typeof timeout + ")");

// ---- 6. NODE_ENV 模式判断 ----
console.log("\\n===== 6. NODE_ENV 模式判断 =====");

const nodeEnv = process.env.NODE_ENV || "development";
console.log("当前 NODE_ENV: " + nodeEnv);

switch (nodeEnv) {
  case "production":
    console.log("→ 生产模式：启用缓存、压缩、最小化日志");
    break;
  case "test":
    console.log("→ 测试模式：使用测试数据库、模拟服务");
    break;
  case "development":
  default:
    console.log("→ 开发模式：详细日志、热重载");
    break;
}

// ---- 7. 进程退出码演示 ----
console.log("\\n===== 7. 进程退出码 =====");

// 退出码约定
const exitCodes = {
  0: "正常退出",
  1: "一般性错误",
  2: "使用错误（参数不正确）",
  3: "内部 JavaScript 解析错误",
  5: "致命错误（V8 无法恢复）",
  9: "无效参数",
  128: "被信号终止的基准偏移",
};

console.log("常见退出码及其含义:");
for (const [code, desc] of Object.entries(exitCodes)) {
  console.log("  " + code + " → " + desc);
}

// process.exitCode 演示
console.log("\\n当前 process.exitCode: " + (process.exitCode || "未设置（默认 0）"));

// 设置 exitCode（不会立即退出）
// process.exitCode = 0; // 正常退出

// exit 事件监听
process.on("exit", function (code) {
  console.log("\\n[exit 事件] 进程退出码: " + code);
  if (code === 0) {
    console.log("[exit 事件] 程序正常退出");
  } else {
    console.log("[exit 事件] 程序异常退出（退出码: " + code + "）");
  }
});

// ---- 8. 环境变量安全性 ----
console.log("\\n===== 8. 环境变量安全性 =====");

// 敏感信息检查：不要在生产环境中打印所有环境变量
const sensitiveKeys = ["PASSWORD", "SECRET", "KEY", "TOKEN", "CREDENTIAL"];
const safeEnvKeys = envKeys.filter(function (key) {
  const upperKey = key.toUpperCase();
  return !sensitiveKeys.some(function (sk) {
    return upperKey.includes(sk);
  });
});

console.log("环境变量总数: " + envKeys.length);
console.log("过滤掉敏感键后: " + safeEnvKeys.length);
console.log("（生产环境中绝不应打印完整的环境变量内容）");

// ---- 9. 构建配置对象的最佳实践 ----
console.log("\\n===== 9. 构建配置对象 =====");

function loadConfig() {
  return {
    // 应用配置
    app: {
      name: process.env.APP_NAME || "my-app",
      env: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || "0.0.0.0",
    },
    // 数据库配置
    db: {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      name: process.env.DB_NAME || "myapp",
      user: process.env.DB_USER || "postgres",
      // 密码应该有更安全的管理方式
      password: process.env.DB_PASSWORD ? "***" : "(未设置)",
    },
    // 日志配置
    log: {
      level: process.env.LOG_LEVEL || "info",
      format: process.env.LOG_FORMAT || "json",
      file: process.env.LOG_FILE || "app.log",
    },
    // 特性开关
    features: {
      debug: process.env.DEBUG === "true",
      maintenance: process.env.MAINTENANCE_MODE === "true",
      beta: process.env.ENABLE_BETA === "true",
    },
  };
}

const config = loadConfig();
console.log("应用配置（从环境变量加载）:");
console.log(JSON.stringify(config, null, 2));

// ---- 10. process.argv0 与 process.argv[0] 的区别 ----
console.log("\\n===== 10. process.argv0 vs process.argv[0] =====");
console.log("process.argv0: " + process.argv0 + "  (原始命令名)");
console.log("process.argv[0]: " + process.argv[0] + "  (解析后的完整路径)");
console.log("相同? " + (process.argv0 === process.argv[0]));

console.log("\\n===== 命令行参数与环境变量演示完成 =====");`,
  },

  // =========================================================
  // 第五章：日志与调试基础
  // =========================================================
  {
    id: "node-logging",
    title: "日志与调试基础",
    icon: "📋",
    group: "基础补充",
    content: `## 日志与调试概述

日志是应用程序的"黑匣子"，记录了程序运行时的各种信息。Node.js 提供了丰富的内置工具来帮助你记录日志和调试代码，包括 \`console\` 对象全家、\`util.inspect\`、\`util.format\` 等。

### console 对象全家桶

\`console\` 是 Node.js 的全局对象，无需 require 即可使用。它提供了 20+ 种方法，覆盖了各种输出需求。

#### 基本输出方法

| 方法 | 输出目标 | 说明 |
| --- | --- | --- |
| \`console.log(...args)\` | stdout | 普通日志输出（最常用） |
| \`console.info(...args)\` | stdout | 信息级别日志，行为与 log 一致 |
| \`console.debug(...args)\` | stdout | 调试信息（默认不显示，需 \`NODE_DEBUG\` 或 \`--inspect\`） |
| \`console.warn(...args)\` | stderr | 警告信息 |
| \`console.error(...args)\` | stderr | 错误信息 |

\`\`\`javascript
console.log("普通信息");
console.info("信息日志");
console.warn("警告信息");
console.error("错误信息");
// warn 和 error 输出到 stderr，其他输出到 stdout
\`\`\`

#### 格式化输出

\`console.log\` 支持 printf 风格的格式化占位符：

| 占位符 | 说明 | 示例 |
| --- | --- | --- |
| \`%s\` | 字符串 | \`console.log('Hello %s', 'World')\` |
| \`%d\` / \`%i\` | 整数 | \`console.log('Count: %d', 42)\` |
| \`%f\` | 浮点数 | \`console.log('PI: %f', 3.14159)\` |
| \`%j\` | JSON 格式 | \`console.log('Data: %j', {a: 1})\` |
| \`%o\` | 对象（展开显示） | \`console.log('Obj: %o', {a: 1, b: 2})\` |
| \`%O\` | 对象（展开显示，含更多细节） | \`console.log('Obj: %O', {a: 1})\` |
| \`%%\` | 百分号本身 | \`console.log('100%%')\` 输出 \`100%\` |

\`\`\`javascript
const name = "Alice";
const age = 30;
console.log("用户 %s 的年龄是 %d 岁", name, age);
// 输出：用户 Alice 的年龄是 30 岁
\`\`\`

#### 计时方法

\`console.time()\` 和 \`console.timeEnd()\` 用于测量代码执行时间：

\`\`\`javascript
console.time('loop');
for (let i = 0; i < 1000000; i++) { /* ... */ }
console.timeEnd('loop');
// loop: 2.345ms

// 可以同时运行多个计时器（用不同标签区分）
console.time('db-query');
console.time('api-call');

// 中间查看耗时（不结束计时器）
console.timeLog('db-query', '查询进行中...');

console.timeEnd('db-query');
console.timeEnd('api-call');
\`\`\`

#### 分组输出

\`\`\`javascript
console.group('用户信息');
console.log('姓名: Alice');
console.log('年龄: 30');
console.group('地址');
console.log('城市: 北京');
console.log('街道: 长安街');
console.groupEnd(); // 结束地址分组
console.groupEnd(); // 结束用户信息分组
\`\`\`

#### 表格输出

\`console.table()\` 以表格形式展示数据，非常适合数组和对象数组：

\`\`\`javascript
const users = [
  { name: 'Alice', age: 30, role: 'admin' },
  { name: 'Bob', age: 25, role: 'user' },
];
console.table(users);
// ┌─────────┬─────────┬─────┬─────────┐
// │ (index) │  name   │ age │  role   │
// ├─────────┼─────────┼─────┼─────────┤
// │    0    │ 'Alice' │ 30  │ 'admin' │
// │    1    │  'Bob'  │ 25  │ 'user'  │
// └─────────┴─────────┴─────┴─────────┘
\`\`\`

#### 调用栈追踪

\`console.trace()\` 输出当前调用栈：

\`\`\`javascript
function a() { b(); }
function b() { c(); }
function c() { console.trace('当前位置'); }
a();
// Trace: 当前位置
//     at c (...)
//     at b (...)
//     at a (...)
\`\`\`

#### 断言与计数

\`\`\`javascript
// console.assert：条件为 false 时输出错误
console.assert(1 === 2, '断言失败：1 不等于 2');
// Assertion failed: 断言失败：1 不等于 2

// console.count：计数器
for (let i = 0; i < 3; i++) {
  console.count('loop');
}
// loop: 1
// loop: 2
// loop: 3

console.countReset('loop'); // 重置计数器
\`\`\`

#### 其他方法

| 方法 | 说明 |
| --- | --- |
| \`console.clear()\` | 清空控制台（发送 ANSI 转义序列） |
| \`console.dir(obj, opts)\` | 以交互式列表形式打印对象 |
| \`console.profile(label)\` | 启动 CPU 分析（需 --inspect） |
| \`console.profileEnd(label)\` | 停止 CPU 分析 |

### util.inspect —— 深度对象打印

\`util.inspect()\` 是 Node.js 中用于将任意对象转换为可读字符串的核心工具。\`console.log\` 内部就是使用它来格式化对象的。

**基本用法**：

\`\`\`javascript
const util = require('util');

const obj = {
  name: 'test',
  nested: { a: { b: { c: 'deep' } } },
  arr: [1, 2, 3],
  fn: function() { return 'hello'; },
};

console.log(util.inspect(obj));
\`\`\`

**配置选项**：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`showHidden\` | boolean | \`false\` | 是否显示不可枚举属性 |
| \`depth\` | number | \`2\` | 递归深度（\`null\` 表示无限） |
| \`colors\` | boolean | \`false\` | 是否使用 ANSI 颜色 |
| \`maxArrayLength\` | number | \`100\` | 数组最大显示元素数 |
| \`maxStringLength\` | number | \`10000\` | 字符串最大显示长度 |
| \`breakLength\` | number | \`80\` | 每行最大长度 |
| \`compact\` | boolean | \`3\` | 紧凑模式（元素少于 3 个时单行） |
| \`sorted\` | boolean | \`false\` | 是否按字母排序属性 |
| \`getters\` | boolean | \`false\` | 是否显示 getter 的值 |
| \`numericSeparator\` | boolean | \`false\` | 是否使用数字分隔符 |

\`\`\`javascript
// 自定义 inspect 深度
util.inspect(deepObj, { depth: 5, colors: true });

// 设置全局默认 inspect 选项
util.inspect.defaultOptions.depth = 5;
util.inspect.defaultOptions.colors = true;
\`\`\`

### util.format —— 字符串格式化

\`util.format()\` 类似于 \`console.log\` 的格式化引擎，但返回字符串而不是输出到控制台：

\`\`\`javascript
const util = require('util');

const msg = util.format('用户 %s 的年龄是 %d', 'Alice', 30);
console.log(msg); // '用户 Alice 的年龄是 30'

// 也可以直接格式化对象
const objMsg = util.format('数据: %j', { a: 1 });
console.log(objMsg); // '数据: {"a":1}'
\`\`\`

### 日志级别设计

一个良好的日志系统应该定义清晰的日志级别：

| 级别 | 值 | 说明 | 使用场景 |
| --- | --- | --- | --- |
| **fatal** | 60 | 致命错误，应用无法继续运行 | 数据库连接断开、磁盘满 |
| **error** | 50 | 错误，但应用可以继续运行 | API 调用失败、文件读写错误 |
| **warn** | 40 | 警告，潜在问题 | 配置缺失、即将达到限制 |
| **info** | 30 | 一般信息，记录关键操作 | 服务启动、用户登录、请求处理 |
| **debug** | 20 | 调试信息，开发时使用 | 变量值、函数调用链路 |
| **trace** | 10 | 最详细的追踪信息 | 方法进入/退出、详细的变量值 |

**环境与日志级别的关系**：

\`\`\`javascript
const LOG_LEVELS = {
  production: 'info',   // 生产环境只记录 info 及以上
  staging: 'debug',     // 预发布环境记录 debug 及以上
  development: 'debug', // 开发环境记录 debug 及以上
  test: 'error',        // 测试环境只记录 error 及以上
};
\`\`\`

### 结构化日志

传统的文本日志难以被机器解析和分析。结构化日志（如 JSON 格式）可以被日志聚合系统（如 ELK、Splunk）轻松索引和搜索。

\`\`\`javascript
// ❌ 非结构化日志（难以解析）
console.log('User Alice logged in at 2024-01-01 10:00:00');

// ✅ 结构化日志（JSON 格式，易于搜索和分析）
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  event: 'user_login',
  user: 'Alice',
  ip: '192.168.1.1',
}));
\`\`\`

### 调试技巧

**1. 使用 util.debuglog**

\`\`\`javascript
const util = require('util');
const debug = util.debuglog('myapp');

// 只有在 NODE_DEBUG=myapp 时才输出
debug('这条消息只在 NODE_DEBUG=myapp 时显示');
\`\`\`

**2. 使用 Node.js 内置调试器**

\`\`\`bash
# 启动调试模式
node inspect app.js

# 使用 Chrome DevTools
node --inspect app.js
node --inspect-brk app.js  # 在第一行暂停
\`\`\`

**3. 使用 debug 模块**

\`debug\` 是 Node.js 生态中最流行的调试日志库，支持命名空间过滤：

\`\`\`javascript
const debug = require('debug')('app:db');
debug('数据库查询: %s', sql);
// 运行时通过 DEBUG=app:* node app.js 启用
\`\`\`

下面这段代码演示了 console 各种方法、性能测量、深度对象打印和简易日志系统的实现。`,
    code: `// ============================================================
// 第五章代码演示：日志与调试基础实战
// ============================================================
const util = require("util");

// ---- 1. console 基本输出方法 ----
console.log("===== 1. console 基本输出方法 =====");
console.log("✓ console.log   → 普通日志（stdout）");
console.info("✓ console.info  → 信息日志（stdout）");
console.warn("⚠ console.warn  → 警告信息（stderr）");
console.error("✗ console.error → 错误信息（stderr）");

// ---- 2. console 格式化占位符 ----
console.log("\\n===== 2. 格式化占位符 =====");
const name = "Alice";
const age = 30;
const pi = 3.14159265;
const data = { id: 1, name: "test", tags: ["a", "b"] };

console.log("字符串 %%s: 用户 %s 的年龄是 %d", name, age);
console.log("整数 %%d: 数量 %d, 十六进制 %d", 255, 255);
console.log("浮点数 %%f: PI = %f", pi);
console.log("JSON %%j: %j", data);
console.log("对象 %%o: %o", { a: 1, b: { c: 2 } });
console.log("百分号 %%%%: 完成率 100%%");

// ---- 3. console.table 表格展示 ----
console.log("\\n===== 3. console.table 表格展示 =====");

// 对象数组（最常用）
const users = [
  { name: "Alice", age: 30, role: "admin", active: true },
  { name: "Bob", age: 25, role: "user", active: true },
  { name: "Charlie", age: 35, role: "moderator", active: false },
  { name: "Diana", age: 28, role: "user", active: true },
];
console.log("用户列表:");
console.table(users);

// 二维数组
console.log("\\n二维数组:");
console.table([
  ["姓名", "年龄", "城市"],
  ["Alice", 30, "北京"],
  ["Bob", 25, "上海"],
]);

// 简单对象
console.log("\\n简单对象:");
console.table({ a: 1, b: 2, c: 3 });

// ---- 4. console.dir 深度打印对象 ----
console.log("\\n===== 4. console.dir 深度打印 =====");

const deepObj = {
  level1: {
    name: "L1",
    level2: {
      name: "L2",
      level3: {
        name: "L3",
        level4: {
          name: "L4",
          value: "very deep",
        },
      },
      siblings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  },
  fn: function hello() { return "world"; },
  date: new Date(),
  reg: /test/i,
};

console.log("console.dir 默认深度:");
console.dir(deepObj);
console.log("\\nconsole.dir 深度=5, 显示隐藏属性:");
console.dir(deepObj, { depth: 5, showHidden: false });

// ---- 5. 性能测量（console.time / Date.now）----
console.log("\\n===== 5. 性能测量 =====");

// 方式 1：Date.now() 手动计时
function measurePerformance(label, fn) {
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  console.log(label + ": " + elapsed + "ms");
  return result;
}

// 测试循环性能
measurePerformance("100 万次循环求和", function () {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  return sum;
});

// 测试字符串拼接
measurePerformance("10 万次字符串拼接", function () {
  let str = "";
  for (let i = 0; i < 100000; i++) {
    str += "a";
  }
  return str.length;
});

// 测试数组操作
measurePerformance("10 万次数组 push", function () {
  const arr = [];
  for (let i = 0; i < 100000; i++) {
    arr.push(i);
  }
  return arr.length;
});

// 测试对象创建
measurePerformance("10 万个对象创建", function () {
  const objs = [];
  for (let i = 0; i < 100000; i++) {
    objs.push({ id: i, name: "obj-" + i });
  }
  return objs.length;
});

// ---- 6. util.inspect 深度对象打印 ----
console.log("\\n===== 6. util.inspect 深度对象打印 =====");

const complexObj = {
  name: "root",
  values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  nested: {
    a: { b: { c: { d: { e: "deep" } } } },
  },
  secret: "should-not-show",
  createdAt: new Date(),
  buffer: Buffer.from("Hello"),
};

// 不同配置的 inspect
console.log("默认 inspect (depth=2):");
console.log(util.inspect(complexObj));

console.log("\\ndepth=5, compact=false:");
console.log(util.inspect(complexObj, { depth: 5, compact: false }));

console.log("\\nmaxArrayLength=5, sorted=true:");
console.log(util.inspect(complexObj, {
  maxArrayLength: 5,
  sorted: true,
  depth: 3,
}));

console.log("\\nshowHidden=true, getters=true:");
console.log(util.inspect(complexObj, {
  showHidden: true,
  getters: true,
  depth: 2,
}));

// ---- 7. util.format 格式化 ----
console.log("\\n===== 7. util.format 格式化 =====");

// 基本格式化
console.log(util.format("Hello %s, you have %d messages", "Alice", 5));

// 对象格式化
console.log(util.format("Config: %j", { port: 3000, host: "localhost" }));

// 多个占位符
console.log(util.format(
  "[%s] %s - %s (耗时 %dms)",
  new Date().toISOString(),
  "INFO",
  "用户登录成功",
  42
));

// 不提供足够参数时，占位符保持原样
console.log(util.format("Hello %s and %s", "Alice"));

// ---- 8. console.trace 调用栈追踪 ----
console.log("\\n===== 8. console.trace 调用栈 =====");

function level3() {
  console.trace("当前位置：level3");
}
function level2() {
  level3();
}
function level1() {
  level2();
}
level1();
console.log("（上面显示了从 level1 → level2 → level3 的完整调用链）");

// ---- 9. console.assert 断言 ----
console.log("\\n===== 9. console.assert 断言 =====");

console.assert(true, "这条不会显示（断言通过）");
console.assert(1 === 2, "断言失败：1 不等于 2");
console.assert(3 > 5, "断言失败：3 不大于 5");
console.assert("hello".length === 5, "这条不会显示（断言通过）");

// ---- 10. console.count 计数器 ----
console.log("\\n===== 10. console.count 计数器 =====");

for (let i = 0; i < 3; i++) {
  console.count("loop-A");
}
console.count("loop-A");
console.countReset("loop-A");
console.log("（重置计数器后）");
console.count("loop-A");

// 不同标签的计数器独立
console.count("users");
console.count("users");
console.count("products");
console.count("users");

// ---- 11. 简易结构化日志系统 ----
console.log("\\n===== 11. 简易结构化日志系统 =====");

const LOG_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const LOG_LABELS = {
  trace: "TRACE",
  debug: "DEBUG",
  info: "INFO ",
  warn: "WARN ",
  error: "ERROR",
  fatal: "FATAL",
};

function createLogger(options) {
  const opts = Object.assign({
    level: "info",
    format: "json", // 'json' 或 'text'
    timestamp: true,
  }, options);

  const minLevel = LOG_LEVELS[opts.level] || 30;

  function shouldLog(level) {
    return (LOG_LEVELS[level] || 0) >= minLevel;
  }

  function formatMessage(level, message, meta) {
    if (opts.format === "json") {
      return JSON.stringify({
        level: level,
        timestamp: opts.timestamp ? new Date().toISOString() : undefined,
        message: message,
        ...meta,
      });
    } else {
      const ts = opts.timestamp ? "[" + new Date().toISOString() + "] " : "";
      const label = LOG_LABELS[level] || level.toUpperCase();
      const metaStr = meta && Object.keys(meta).length > 0
        ? " " + JSON.stringify(meta)
        : "";
      return ts + "[" + label + "] " + message + metaStr;
    }
  }

  return {
    trace: function (msg, meta) {
      if (shouldLog("trace")) console.log(formatMessage("trace", msg, meta));
    },
    debug: function (msg, meta) {
      if (shouldLog("debug")) console.log(formatMessage("debug", msg, meta));
    },
    info: function (msg, meta) {
      if (shouldLog("info")) console.log(formatMessage("info", msg, meta));
    },
    warn: function (msg, meta) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", msg, meta));
    },
    error: function (msg, meta) {
      if (shouldLog("error")) console.error(formatMessage("error", msg, meta));
    },
    fatal: function (msg, meta) {
      if (shouldLog("fatal")) console.error(formatMessage("fatal", msg, meta));
    },
  };
}

// 创建不同级别的日志器
const prodLogger = createLogger({ level: "info", format: "json" });
const devLogger = createLogger({ level: "debug", format: "text" });

console.log("--- 生产环境日志器（level=info, json）---");
prodLogger.debug("这条不会显示（debug < info）");
prodLogger.info("应用启动", { port: 3000, env: "production" });
prodLogger.warn("磁盘空间不足", { usage: "92%", disk: "/dev/sda1" });
prodLogger.error("数据库连接失败", { host: "db.example.com", retry: 3 });

console.log("\\n--- 开发环境日志器（level=debug, text）---");
devLogger.debug("变量值", { x: 10, y: 20 });
devLogger.info("请求处理", { method: "GET", path: "/api/users" });
devLogger.warn("缓存未命中", { key: "user:123" });
devLogger.error("文件读取失败", { file: "config.json", code: "ENOENT" });

// ---- 12. 日志级别过滤演示 ----
console.log("\\n===== 12. 日志级别过滤 =====");

const levels = ["trace", "debug", "info", "warn", "error", "fatal"];
const testLogger = createLogger({ level: "info", format: "text" });

console.log("当日志级别设为 'info' 时，以下级别会被过滤:");
levels.forEach(function (level) {
  const levelNum = LOG_LEVELS[level];
  const infoNum = LOG_LEVELS["info"];
  const visible = levelNum >= infoNum;
  console.log("  " + level + " (" + levelNum + ") → " + (visible ? "✓ 显示" : "✗ 过滤"));
});

// ---- 13. console.group 分组 ----
console.log("\\n===== 13. console.group 分组 =====");

console.group("🔍 用户请求详情");
console.log("方法: GET");
console.log("路径: /api/users");
console.group("📋 请求头");
console.log("Content-Type: application/json");
console.log("Authorization: Bearer ***");
console.groupEnd();
console.group("📊 响应");
console.log("状态码: 200");
console.log("耗时: 42ms");
console.groupEnd();
console.groupEnd();

console.log("\\n===== 日志与调试演示完成 =====");`,
  },

  // =========================================================
  // 第六章：错误处理深入
  // =========================================================
  {
    id: "node-error-adv",
    title: "错误处理深入",
    icon: "⚠️",
    group: "基础补充",
    content: `## 错误处理深入概述

错误处理是 Node.js 应用健壮性的基石。一个没有良好错误处理的应用，在生产环境中随时可能崩溃。Node.js 提供了丰富的错误处理机制，包括内置错误类型、自定义错误类、堆栈捕获、全局异常处理等。

### Error 类型体系

Node.js 内置了多种错误类型，每种类型都继承自 \`Error\`：

| 错误类型 | 说明 | 常见场景 |
| --- | --- | --- |
| \`Error\` | 通用错误，所有错误类型的基类 | 通用错误 |
| \`TypeError\` | 类型错误 | 对非函数类型的值调用、访问 null 的属性 |
| \`RangeError\` | 范围错误 | 数组长度无效、数字超出范围 |
| \`ReferenceError\` | 引用错误 | 访问未定义的变量 |
| \`SyntaxError\` | 语法错误 | JSON.parse 失败、eval 执行无效代码 |
| \`URIError\` | URI 错误 | encodeURI/decodeURI 参数无效 |
| \`EvalError\` | Eval 错误 | eval 相关错误（已基本不用） |
| \`AssertionError\` | 断言错误 | assert 模块断言失败 |
| \`SystemError\` | 系统错误 | 操作系统层面的错误（文件不存在、权限不足） |

**Error 对象的属性**：

| 属性 | 说明 |
| --- | --- |
| \`name\` | 错误类型名称（如 'Error'、'TypeError'） |
| \`message\` | 错误描述信息 |
| \`stack\` | 错误堆栈跟踪字符串 |
| \`code\` | 错误码（字符串，如 'ENOENT'、'ECONNREFUSED'） |
| \`cause\` | 引发此错误的原始错误（ES2022，Node 16.9+） |

\`\`\`javascript
const err = new Error('Something went wrong');
console.log(err.name);     // 'Error'
console.log(err.message);  // 'Something went wrong'
console.log(err.stack);    // 完整的堆栈跟踪
\`\`\`

### Error.captureStackTrace 详解

\`Error.captureStackTrace()\` 是 V8 提供的一个强大工具，用于创建自定义的堆栈跟踪。它可以让你控制堆栈跟踪的起点和范围。

**语法**：

\`\`\`javascript
Error.captureStackTrace(targetObject[, constructorOpt])
\`\`\`

- \`targetObject\`：要在其上添加 \`.stack\` 属性的对象
- \`constructorOpt\`（可选）：一个函数，堆栈跟踪将在该函数之后开始（即隐藏该函数及其调用者）

**为什么需要它？**

当你创建自定义错误类时，默认的堆栈跟踪会包含构造函数本身的调用。\`captureStackTrace\` 可以让你排除构造函数，让堆栈跟踪从用户代码开始。

\`\`\`javascript
// 自定义错误类
class MyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MyError';
    // 捕获堆栈，排除 MyError 构造函数本身
    Error.captureStackTrace(this, MyError);
  }
}
\`\`\`

**实用场景**：

\`\`\`javascript
// 场景 1：创建自定义错误类
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Error.captureStackTrace(this, ValidationError);
  }
}

// 场景 2：给普通对象添加堆栈信息
const result = { error: true, data: null };
Error.captureStackTrace(result);
console.log(result.stack); // 现在 result 对象有 stack 属性了
\`\`\`

### 自定义 Error 类

在实际项目中，创建自定义错误类可以让你更好地分类和处理错误：

\`\`\`javascript
// 基础应用错误
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // 标记为可预期的操作错误
    Error.captureStackTrace(this, this.constructor);
  }
}

// 具体错误类型
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
    this.isOperational = false; // 数据库错误通常是系统性的
  }
}
\`\`\`

### 操作错误 vs 程序错误

区分两种错误类型对于错误处理策略至关重要：

| 类型 | 说明 | 示例 | 处理方式 |
| --- | --- | --- | --- |
| **操作错误（Operational Error）** | 可预期的运行时错误 | 用户输入无效、文件不存在、网络超时 | 优雅处理，返回错误信息 |
| **程序错误（Programmer Error）** | 代码中的 bug | 读取 undefined 的属性、类型错误 | 立即崩溃，让进程管理器重启 |

\`\`\`javascript
// 操作错误：可以处理
try {
  const data = fs.readFileSync('config.json', 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('配置文件不存在，使用默认配置');
  }
}

// 程序错误：应该让它崩溃
// 不要在 try-catch 中吞掉程序错误！
\`\`\`

### uncaughtException 与 unhandledRejection

这两个事件是 Node.js 进程最后的"安全网"，用于捕获未被处理的异常。

#### uncaughtException

当同步代码中抛出异常且没有被 try-catch 捕获时，会触发 \`uncaughtException\` 事件：

\`\`\`javascript
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录日志后退出
  process.exit(1);
});

// 触发 uncaughtException
throw new Error('Oops!');
\`\`\`

**重要警告**：uncaughtException 是一个非常危险的机制。当它被触发时，应用可能处于不一致的状态，继续运行可能导致更严重的问题。**最佳实践是在 uncaughtException 中记录错误后立即退出进程**。

#### unhandledRejection

当 Promise 被拒绝但没有 \`.catch()\` 处理时，会触发 \`unhandledRejection\` 事件：

\`\`\`javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  // 记录日志后退出
  process.exit(1);
});

// 触发 unhandledRejection
Promise.reject(new Error('Async error!'));
\`\`\`

**两种事件的对比**：

| 特性 | uncaughtException | unhandledRejection |
| --- | --- | --- |
| 触发时机 | 同步代码抛出未捕获异常 | Promise 被拒绝且无 catch |
| 默认行为 | 打印堆栈，进程退出 | 打印警告（Node 15+ 会退出） |
| 是否可恢复 | 理论上可以，但强烈不推荐 | 理论上可以，但强烈不推荐 |
| 建议处理 | 记录日志 → 优雅退出 | 记录日志 → 优雅退出 |

### 优雅退出（Graceful Shutdown）

优雅退出是指进程在终止前，完成正在处理的请求、关闭数据库连接、刷新日志等清理工作。

**优雅退出的步骤**：

1. 停止接收新请求
2. 等待当前请求处理完成（设置超时）
3. 关闭数据库连接、缓存连接等
4. 刷新日志缓冲区
5. 退出进程

\`\`\`javascript
// 优雅退出实现
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(\`收到 \${signal} 信号，开始优雅退出...\`);

  // 1. 停止接收新请求
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });

  // 2. 设置强制退出超时（30 秒后强制退出）
  setTimeout(() => {
    console.error('强制退出（超时）');
    process.exit(1);
  }, 30000);

  // 3. 关闭数据库连接
  try {
    await db.disconnect();
    console.log('数据库连接已关闭');
  } catch (err) {
    console.error('关闭数据库连接失败:', err);
  }

  // 4. 退出
  process.exit(0);
}

// 监听退出信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
\`\`\`

### 错误处理最佳实践

1. **使用 async/await 配合 try-catch**：比 Promise 链更清晰的错误处理。
2. **区分操作错误和程序错误**：操作错误可以处理，程序错误应该崩溃。
3. **创建自定义错误类**：让错误分类更清晰。
4. **使用 Error.cause 链式传递错误**：保留原始错误信息。
5. **不要在回调中抛出异常**：在异步回调中抛出异常无法被 try-catch 捕获。
6. **总是处理 Promise 的拒绝**：每个 Promise 都应有 catch 或 try-catch。
7. **使用 uncaughtException 和 unhandledRejection 作为最后防线**：但处理后就退出。
8. **实现优雅退出**：确保资源被正确释放，不丢失数据。

### 错误处理的反模式

以下是常见但不推荐的错误处理方式：

| 反模式 | 说明 | 为什么不好 |
| --- | --- | --- |
| 吞掉错误 | \`try { ... } catch(e) {}\` | 隐藏了问题，导致难以调试 |
| 在回调中抛出异常 | 异步回调中 \`throw err\` | 无法被 try-catch 捕获，会触发 uncaughtException |
| 返回错误码 | 用返回值表示错误 | 容易忘记检查，不如抛出异常 |
| 过度使用 uncaughtException | 依赖它来恢复应用 | 应用可能处于不一致状态 |
| 混合使用回调和 Promise | 同一函数又用回调又用 Promise | 容易导致错误漏掉或被处理两次 |

下面这段代码演示了自定义错误类、Error.captureStackTrace、uncaughtException 处理和优雅退出等核心概念。`,
    code: `// ============================================================
// 第六章代码演示：错误处理深入实战
// ============================================================

// ---- 1. Error 基本属性 ----
console.log("===== 1. Error 基本属性 =====");

const basicErr = new Error("Something went wrong");
console.log("name: " + basicErr.name);
console.log("message: " + basicErr.message);
console.log("stack 前 100 字符:");
console.log(basicErr.stack.slice(0, 150) + "...");

// ---- 2. 内置错误类型 ----
console.log("\\n===== 2. 内置错误类型 =====");

// TypeError
try {
  null.someMethod();
} catch (e) {
  console.log("TypeError: " + e.name + " - " + e.message.slice(0, 50));
}

// RangeError
try {
  new Array(-1);
} catch (e) {
  console.log("RangeError: " + e.name + " - " + e.message.slice(0, 50));
}

// SyntaxError
try {
  JSON.parse("{invalid json}");
} catch (e) {
  console.log("SyntaxError: " + e.name + " - " + e.message.slice(0, 50));
}

// ReferenceError
try {
  eval("console.log(undefinedVariable)");
} catch (e) {
  console.log("ReferenceError: " + e.name + " - " + e.message.slice(0, 50));
}

// ---- 3. 自定义 Error 类 ----
console.log("\\n===== 3. 自定义 Error 类 =====");

// 基础应用错误
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.code = code || "INTERNAL_ERROR";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 具体错误类型
class NotFoundError extends AppError {
  constructor(message) {
    super(message || "Resource not found", 404, "NOT_FOUND");
  }
}

class ValidationError extends AppError {
  constructor(message, errors) {
    super(message || "Validation failed", 400, "VALIDATION_ERROR");
    this.errors = errors || [];
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || "Unauthorized", 401, "UNAUTHORIZED");
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError) {
    super(message || "Database error", 500, "DATABASE_ERROR");
    this.originalError = originalError || null;
    this.isOperational = false;
  }
}

// 演示自定义错误
console.log("--- NotFoundError ---");
const notFound = new NotFoundError("用户 ID: 12345 不存在");
console.log("name: " + notFound.name);
console.log("message: " + notFound.message);
console.log("statusCode: " + notFound.statusCode);
console.log("code: " + notFound.code);
console.log("isOperational: " + notFound.isOperational);
console.log("instanceof Error: " + (notFound instanceof Error));
console.log("instanceof AppError: " + (notFound instanceof AppError));
console.log("instanceof NotFoundError: " + (notFound instanceof NotFoundError));

console.log("\\n--- ValidationError ---");
const validation = new ValidationError("输入验证失败", [
  { field: "email", message: "邮箱格式不正确" },
  { field: "age", message: "年龄必须在 1-150 之间" },
]);
console.log("name: " + validation.name);
console.log("errors: " + JSON.stringify(validation.errors));

// ---- 4. Error.captureStackTrace 演示 ----
console.log("\\n===== 4. Error.captureStackTrace 演示 =====");

// 场景 1：自定义错误类中排除构造函数
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomError";
    // 排除 CustomError 构造函数，堆栈从调用 CustomError 的地方开始
    Error.captureStackTrace(this, CustomError);
  }
}

function createError() {
  return new CustomError("从 createError 中创建");
}

const capturedErr = createError();
console.log("堆栈跟踪（CustomError 构造函数被排除）:");
console.log(capturedErr.stack.slice(0, 200) + "...");

// 场景 2：给普通对象添加堆栈信息
const resultObj = { error: true, data: null, message: "操作失败" };
Error.captureStackTrace(resultObj);
console.log("\\n普通对象也有了 stack 属性:");
console.log("resultObj.stack 存在: " + (typeof resultObj.stack === "string"));
console.log(resultObj.stack.slice(0, 150) + "...");

// 场景 3：对比有无 captureStackTrace 的堆栈
class ErrorWithoutCapture extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorWithoutCapture";
    // 没有调用 Error.captureStackTrace
  }
}

class ErrorWithCapture extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorWithCapture";
    Error.captureStackTrace(this, ErrorWithCapture);
  }
}

function throwErrors() {
  const e1 = new ErrorWithoutCapture("无 captureStackTrace");
  const e2 = new ErrorWithCapture("有 captureStackTrace");
  console.log("\\n--- 无 captureStackTrace 的堆栈 ---");
  console.log(e1.stack.slice(0, 200) + "...");
  console.log("\\n--- 有 captureStackTrace 的堆栈 ---");
  console.log(e2.stack.slice(0, 200) + "...");
  console.log("\\n注意：有 captureStackTrace 的堆栈不包含 ErrorWithCapture 构造函数");
}
throwErrors();

// ---- 5. 操作错误 vs 程序错误 ----
console.log("\\n===== 5. 操作错误 vs 程序错误 =====");

// 操作错误：可以预期并处理
function readConfigFile(filePath) {
  try {
    // 模拟文件不存在的情况
    throw { code: "ENOENT", message: "文件不存在: " + filePath };
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("操作错误: 配置文件不存在，使用默认配置");
      return { port: 3000, host: "localhost" };
    }
    // 其他错误继续抛出
    throw err;
  }
}

const config = readConfigFile("config.json");
console.log("默认配置: " + JSON.stringify(config));

// 程序错误：应该让它崩溃（这里用 try-catch 模拟展示）
console.log("\\n--- 程序错误示例 ---");
try {
  // 这模拟了一个程序错误：访问 undefined 的属性
  const obj = undefined;
  // 在实际代码中这行会抛出 TypeError
  // obj.property; // 取消注释会导致程序错误
  console.log("（跳过模拟程序错误，避免实际崩溃）");
} catch (e) {
  console.log("程序错误（不应该吞掉，应该让它崩溃）: " + e.message);
}

// ---- 6. 错误处理模式对比 ----
console.log("\\n===== 6. 错误处理模式对比 =====");

// 模式 1：同步 try-catch
console.log("--- 模式 1：同步 try-catch ---");
function syncOperation(shouldFail) {
  if (shouldFail) {
    throw new Error("同步操作失败");
  }
  return "同步操作成功";
}

try {
  console.log("成功: " + syncOperation(false));
} catch (e) {
  console.log("失败: " + e.message);
}

try {
  syncOperation(true);
} catch (e) {
  console.log("捕获: " + e.message);
}

// 模式 2：错误优先回调（Error-first Callback）
console.log("\\n--- 模式 2：错误优先回调 ---");
function callbackOperation(shouldFail, callback) {
  if (shouldFail) {
    callback(new Error("回调操作失败"), null);
  } else {
    callback(null, "回调操作成功");
  }
}

callbackOperation(false, function (err, result) {
  if (err) {
    console.log("错误: " + err.message);
  } else {
    console.log("成功: " + result);
  }
});

callbackOperation(true, function (err, result) {
  if (err) {
    console.log("错误: " + err.message);
  } else {
    console.log("成功: " + result);
  }
});

// 模式 3：Promise 链
console.log("\\n--- 模式 3：Promise 链 ---");
function promiseOperation(shouldFail) {
  return new Promise(function (resolve, reject) {
    if (shouldFail) {
      reject(new Error("Promise 操作失败"));
    } else {
      resolve("Promise 操作成功");
    }
  });
}

promiseOperation(false)
  .then(function (result) {
    console.log("成功: " + result);
  })
  .catch(function (err) {
    console.log("错误: " + err.message);
  });

promiseOperation(true)
  .then(function (result) {
    console.log("成功: " + result);
  })
  .catch(function (err) {
    console.log("错误: " + err.message);
  });

// 模式 4：async/await
console.log("\\n--- 模式 4：async/await ---");
async function asyncOperationHandler() {
  try {
    const result = await promiseOperation(false);
    console.log("成功: " + result);
  } catch (err) {
    console.log("错误: " + err.message);
  }

  try {
    await promiseOperation(true);
  } catch (err) {
    console.log("错误: " + err.message);
  }
}

// 立即执行 async 函数
asyncOperationHandler();

// ---- 7. 错误链式传递（Error Cause）----
console.log("\\n===== 7. 错误链式传递（Error Cause）====");

function parseUserData(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    // 使用 cause 属性保留原始错误
    throw new Error("解析用户数据失败", { cause: err });
  }
}

try {
  parseUserData("{invalid json}");
} catch (err) {
  console.log("外层错误: " + err.message);
  if (err.cause) {
    console.log("原始错误: " + err.cause.message);
    console.log("原始错误类型: " + err.cause.constructor.name);
  }
}

// ---- 8. uncaughtException 处理模拟 ----
console.log("\\n===== 8. uncaughtException 处理 =====");

// 注册 uncaughtException 处理器（作为最后防线）
// 注意：在实际代码中，uncaughtException 后应该退出进程
// 这里只是演示，不会实际触发
const hadUncaughtHandler = process.listenerCount("uncaughtException") > 0;
console.log("uncaughtException 监听器数量: " + process.listenerCount("uncaughtException"));
if (!hadUncaughtHandler) {
  console.log("（未注册 uncaughtException 处理器——在生产环境中应该注册）");
}

// ---- 9. unhandledRejection 处理模拟 ----
console.log("\\n===== 9. unhandledRejection 处理 =====");

const hadRejectionHandler = process.listenerCount("unhandledRejection") > 0;
console.log("unhandledRejection 监听器数量: " + process.listenerCount("unhandledRejection"));
if (!hadRejectionHandler) {
  console.log("（未注册 unhandledRejection 处理器——在生产环境中应该注册）");
}

// 演示：正确处理 Promise 拒绝
console.log("\\n--- 正确处理 Promise 拒绝 ---");
Promise.resolve()
  .then(function () {
    return Promise.reject(new Error("这是一个被处理的拒绝"));
  })
  .catch(function (err) {
    console.log("已捕获: " + err.message);
  });

// 演示：未处理的 Promise 拒绝（仅演示，实际不会执行）
console.log("\\n--- 潜在未处理的 Promise 拒绝示例 ---");
console.log("// 以下代码在生产环境中会导致 unhandledRejection");
console.log("// Promise.reject(new Error('未被处理的拒绝'));");
console.log("// 正确的做法是始终添加 .catch() 或 try-catch");

// ---- 10. 优雅退出模拟 ----
console.log("\\n===== 10. 优雅退出（Graceful Shutdown）模拟 =====");

// 模拟优雅退出流程
const shutdownSteps = [];

function simulateGracefulShutdown(signal) {
  console.log("收到信号: " + signal);

  // 步骤 1：停止接收新请求
  shutdownSteps.push("停止接收新请求");
  console.log("  1. ✓ 停止接收新请求");

  // 步骤 2：等待当前请求完成
  shutdownSteps.push("等待当前请求完成");
  console.log("  2. ✓ 等待当前请求完成（设置 30s 超时）");

  // 步骤 3：关闭数据库连接
  shutdownSteps.push("关闭数据库连接");
  console.log("  3. ✓ 关闭数据库连接");

  // 步骤 4：关闭缓存连接
  shutdownSteps.push("关闭缓存连接");
  console.log("  4. ✓ 关闭 Redis 缓存连接");

  // 步骤 5：刷新日志
  shutdownSteps.push("刷新日志缓冲区");
  console.log("  5. ✓ 刷新日志缓冲区");

  // 步骤 6：退出
  shutdownSteps.push("退出进程");
  console.log("  6. ✓ 退出进程（exit code: 0）");
}

console.log("模拟 SIGTERM 信号触发的优雅退出:");
simulateGracefulShutdown("SIGTERM");

console.log("\\n完整退出步骤:");
shutdownSteps.forEach(function (step, i) {
  console.log("  " + (i + 1) + ". " + step);
});

// ---- 11. 错误处理最佳实践总结 ----
console.log("\\n===== 11. 错误处理最佳实践总结 =====");

const bestPractices = [
  "使用 async/await 配合 try-catch，比 Promise 链更清晰",
  "区分操作错误（可处理）和程序错误（应崩溃）",
  "创建自定义错误类，让错误分类更清晰",
  "使用 Error.cause 链式传递错误，保留上下文",
  "不要在异步回调中抛出异常，使用 callback(err)",
  "每个 Promise 都应有 .catch() 或 try-catch 处理",
  "uncaughtException 和 unhandledRejection 处理后立即退出",
  "实现优雅退出，确保资源被正确释放",
  "使用 Error.captureStackTrace 美化堆栈跟踪",
  "生产环境记录完整错误日志，但不要暴露给用户",
];

console.log("错误处理 10 条黄金法则:");
bestPractices.forEach(function (rule, i) {
  console.log("  " + (i + 1) + ". " + rule);
});

console.log("\\n===== 错误处理深入演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["基础入门", "核心模块", "异步编程", "进阶实战", "工程化", "基础补充"];