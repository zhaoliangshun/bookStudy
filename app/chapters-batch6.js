// =============================================================
// Node.js 交互式教程 —— 第六批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. node-timers-deep  — Timers 深入
//   2. node-child-process — 子进程 (Child Process)
//   3. node-net           — Net 模块 (TCP)
//   4. node-dns           — DNS 模块
//   5. node-tls           — TLS/SSL 模块
//   6. node-http2         — HTTP/2 与 HTTP/3
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
//   - 注意：沙箱中无法真正启动子进程或建立TCP连接，用对象字面量+接口模拟相关概念
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Timers 深入
  // =========================================================
  {
    id: "node-timers-deep",
    title: "Timers 深入",
    icon: "⏱️",
    group: "核心模块补充",
    content: `## Timers 深入：从原理到高级用法

定时器是 JavaScript 中最基础也最容易被误解的异步机制。从浏览器到 Node.js，定时器看似简单，实则背后涉及事件循环、系统调度、精度限制等诸多细节。本章将深入剖析 Node.js 中定时器的方方面面。

---

### 一、定时器在事件循环中的位置

Node.js 的事件循环分为 6 个阶段，定时器回调在 **Timers 阶段** 执行：

\`\`\`
    ┌───────────────────────────┐
 ┌─>│           timers          │ ← setTimeout / setInterval 到期回调在这里执行
 │  └─────────────┬─────────────┘
 │  ┌─────────────┴─────────────┐
 │  │     pending callbacks     │ ← 系统级回调（TCP错误等）
 │  └─────────────┬─────────────┘
 │  ┌─────────────┴─────────────┐
 │  │       idle, prepare       │ ← libuv 内部使用
 │  └─────────────┬─────────────┘
 │  ┌─────────────┴─────────────┐
 │  │           poll            │ ← I/O 回调（文件读取、网络数据等）
 │  └─────────────┬─────────────┘
 │  ┌─────────────┴─────────────┐
 │  │           check           │ ← setImmediate 回调在这里执行
 │  └─────────────┬─────────────┘
 │  ┌─────────────┴─────────────┐
 │  │      close callbacks      │ ← socket.destroy() 等关闭回调
 │  └───────────────────────────┘
 └──────────────────────────────────────────────────────────────┘
\`\`\`

关键理解：**定时器的回调并不在设定的时间点精确执行，而是在事件循环运行到 Timers 阶段时，检查哪些定时器已经到期，然后执行它们的回调**。如果事件循环在 Poll 阶段被阻塞了很久，定时器回调就会延迟执行。

---

### 二、setTimeout 精度与最小延迟

#### 2.1 理论上的 0ms ≠ 实际的 0ms

当你写 \`setTimeout(fn, 0)\` 时，很多人以为回调会立即执行。但实际上，Node.js 和浏览器都有一个**最小延迟限制**：

| 环境 | setTimeout(fn, 0) 实际延迟 | 说明 |
| --- | --- | --- |
| Node.js | 约 1ms | libuv 会将 0 自动提升为 1ms |
| 浏览器（Chrome） | 约 1ms（嵌套层级 ≤ 5） | 嵌套超过 5 层后提升到 4ms |
| 浏览器（Firefox） | 约 4ms | 较保守的最小延迟 |

**为什么 Node.js 会把 0ms 提升到 1ms？** 这是 libuv 的设计决策。libuv 的定时器实现基于 \`uv_timer_start\`，当传入 \`timeout=0\` 时，它会自动将其设为 1ms，以避免过于频繁的定时器触发导致 CPU 空转。

\`\`\`javascript
// 测量实际延迟
const start = Date.now();
setTimeout(() => {
  console.log('实际延迟:', Date.now() - start, 'ms');
}, 0);
// 输出通常为 1~3ms，而非 0ms
\`\`\`

#### 2.2 嵌套定时器的 4ms 限制

在浏览器中，当 setTimeout 嵌套超过 5 层时，最小延迟会被强制提升到 4ms。Node.js 对嵌套定时器没有这个限制，但仍然受限于 1ms 的最小值。

\`\`\`javascript
// 浏览器行为：嵌套第 6 层开始延迟 ≥ 4ms
// Node.js 行为：始终 ≥ 1ms，没有额外限制
\`\`\`

#### 2.3 高精度定时器：performance.now()

如果你需要精确测量时间间隔（而非调度回调），应该使用 \`performance.now()\` 而非 \`Date.now()\`：

| 方法 | 精度 | 基准点 | 用途 |
| --- | --- | --- | --- |
| \`Date.now()\` | 毫秒级 | 1970-01-01 | 获取时间戳 |
| \`performance.now()\` | 微秒级（Node.js 中通常是纳秒级） | 进程启动时 | 测量时间间隔 |

\`\`\`javascript
const { performance } = require('perf_hooks');
const t0 = performance.now();
// ... 执行一些操作 ...
const t1 = performance.now();
console.log('耗时:', (t1 - t0).toFixed(3), 'ms');
\`\`\`

---

### 三、setTimeout(fn, 0) vs setImmediate(fn) 的经典问题

这是 Node.js 面试中最高频的问题之一。两者的执行顺序是**不确定的**——取决于事件循环的启动时机。

#### 3.1 在主模块中：顺序不确定

\`\`\`javascript
// 在主模块（入口文件）中执行
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
// 输出顺序不确定！
// 有时 setTimeout 先，有时 setImmediate 先
\`\`\`

**原因分析**：当 Node.js 启动时，事件循环需要初始化。在 Timers 阶段，如果系统时间已经过了 1ms，setTimeout 回调就会在这一轮执行，早于同轮后面的 check 阶段的 setImmediate。但如果系统时间还没到，setTimeout 会被推迟到下一轮，而 setImmediate 在当前轮就会执行。

#### 3.2 在 I/O 回调中：setImmediate 一定先执行

\`\`\`javascript
const fs = require('fs');
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
  // 输出顺序确定：setImmediate → setTimeout
});
\`\`\`

**原因分析**：I/O 回调在 Poll 阶段执行。Poll 阶段之后紧接着是 Check 阶段（setImmediate）。而 Timers 阶段在下一轮事件循环的开头。所以 setImmediate 一定在当前轮执行，setTimeout 在下一轮。

#### 3.3 对比总结表

| 场景 | setTimeout(fn, 0) | setImmediate(fn) | 谁先执行 |
| --- | --- | --- | --- |
| 主模块 | Timers 阶段 | Check 阶段 | **不确定** |
| I/O 回调内 | 下一轮 Timers | 当前轮 Check | **setImmediate 先** |
| process.nextTick 内 | 迟于 nextTick | 迟于 nextTick | 取决于主模块规则 |
| Promise.then 内 | 迟于微任务 | 迟于微任务 | 取决于主模块规则 |

---

### 四、process.nextTick：优先级之王

#### 4.1 执行优先级

\`process.nextTick\` 的回调拥有最高的执行优先级，它不属于事件循环的任何阶段，而是在**每个阶段转换之间**执行：

\`\`\`
同步代码 → process.nextTick 队列 → 微任务队列(Promise) → 事件循环阶段
\`\`\`

#### 4.2 执行顺序演示

\`\`\`javascript
console.log('1. 同步');
process.nextTick(() => console.log('3. nextTick'));
Promise.resolve().then(() => console.log('4. Promise'));
setTimeout(() => console.log('5. setTimeout'), 0);
setImmediate(() => console.log('6. setImmediate'));
console.log('2. 同步');
// 输出: 1 → 2 → 3 → 4 → (5/6顺序不确定)
\`\`\`

#### 4.3 nextTick 的递归陷阱

如果在 nextTick 回调中递归调用 nextTick，会**饿死事件循环**：

\`\`\`javascript
// ❌ 危险！事件循环被永远阻塞
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}
recursiveNextTick();
// setTimeout / setImmediate 永远不会执行！
\`\`\`

Node.js 对此有保护机制：\`process.maxTickDepth\` 默认值为 1000，当 nextTick 递归超过此深度时，会强制让出给事件循环。但**依赖此保护机制是不安全的**，不同版本可能不同。

#### 4.4 nextTick 的适用场景

| 场景 | 说明 |
| --- | --- |
| **错误处理** | 在构造函数中，可以在抛出错误前给用户注册事件监听器的机会 |
| **释放资源** | 在当前操作完成后立即释放锁/资源 |
| **保证异步** | 让回调始终异步执行，避免 Zalgo 问题 |
| **批量处理** | 把多次操作合并到一次 nextTick 中 |

\`\`\`javascript
// 经典用法：保证回调始终异步
function maybeAsync(arg, callback) {
  if (arg) {
    return callback(null, 'sync');  // 同步调用
  }
  process.nextTick(() => callback(null, 'async'));  // 异步调用
}
// 这样调用方始终可以用统一的方式处理回调
\`\`\`

---

### 五、setInterval 的累积延迟问题

#### 5.1 问题描述

\`setInterval\` 不会等待上一次回调执行完毕再开始计时。如果回调的执行时间超过了间隔时间，就会发生**回调堆积**：

\`\`\`javascript
setInterval(() => {
  // 如果这个回调执行了 200ms
  heavyTask(); // 耗时 200ms
}, 100); // 但间隔只有 100ms
// 后果：回调不断堆积，CPU 使用率飙升
\`\`\`

#### 5.2 解决方案：递归 setTimeout

用递归 setTimeout 替代 setInterval 可以避免堆积：

\`\`\`javascript
// ✅ 推荐：递归 setTimeout
function safeInterval(fn, delay) {
  function run() {
    fn();
    setTimeout(run, delay);  // 等 fn 执行完毕后再设置下一次
  }
  setTimeout(run, delay);
}

// 使用
safeInterval(() => {
  heavyTask(); // 即使耗时超过 delay，也不会堆积
}, 100);
\`\`\`

#### 5.3 setInterval 的另一个陷阱：不精确

即使回调执行很快，setInterval 的间隔也不精确。受事件循环繁忙程度影响，实际间隔可能比设定值大。

\`\`\`javascript
let count = 0;
const start = Date.now();
const timer = setInterval(() => {
  count++;
  const elapsed = Date.now() - start;
  const expected = count * 100;
  console.log(\`第\${count}次，预期\${expected}ms，实际\${elapsed}ms，偏差\${elapsed - expected}ms\`);
  if (count >= 10) clearInterval(timer);
}, 100);
// 你能看到偏差在逐渐累积
\`\`\`

---

### 六、ref() 与 unref()：控制事件循环退出

#### 6.1 事件循环何时退出？

Node.js 的事件循环在**没有待处理的任务**时退出。一个活动的定时器会阻止事件循环退出：

\`\`\`javascript
setTimeout(() => console.log('done'), 5000);
// 事件循环会等待 5 秒，直到定时器触发
// 即使没有其他代码，进程也不会退出
\`\`\`

#### 6.2 unref()：让定时器不阻止退出

\`\`\`javascript
const timer = setTimeout(() => {
  console.log('这条日志可能永远不会打印');
}, 5000);
timer.unref();  // 告诉事件循环：不要因为这个定时器而保持运行
// 如果事件循环没有其他任务，进程会立即退出
// 定时器回调会被丢弃
\`\`\`

#### 6.3 ref()：恢复阻止退出

\`\`\`javascript
timer.unref();
// ... 过了一会，你决定还是需要这个定时器
timer.ref();  // 恢复，事件循环会等待这个定时器
\`\`\`

#### 6.4 实际应用场景

\`\`\`javascript
// 场景：HTTP 服务器空闲超时自动关闭
const server = require('http').createServer();
let idleTimer = setTimeout(() => {
  server.close();
  console.log('服务器空闲超时，已关闭');
}, 30000);
idleTimer.unref(); // 如果只有这个定时器，允许进程退出

server.on('request', () => {
  // 有请求时重置空闲计时器
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => server.close(), 30000);
  idleTimer.unref();
});
\`\`\`

---

### 七、clearTimeout / clearInterval 的正确用法

#### 7.1 清除不存在的定时器是安全的

\`\`\`javascript
clearTimeout(undefined);  // 不会报错
clearTimeout(null);       // 不会报错
clearTimeout(12345);      // 不会报错（即使 12345 不是有效的定时器 ID）
\`\`\`

#### 7.2 定时器 ID 的复用

Node.js 会复用定时器 ID。当你清除一个定时器后，新创建的定时器可能会获得相同的 ID。所以**不要依赖定时器 ID 来做判断**：

\`\`\`javascript
// ❌ 错误做法
const timer = setTimeout(() => {}, 1000);
clearTimeout(timer);
// 此时 timer 的值可能被新定时器复用
if (timer) { /* 这个判断不可靠 */ }
\`\`\`

#### 7.3 推荐的清除模式

\`\`\`javascript
let timer = null;

function start() {
  stop(); // 先清除旧的
  timer = setTimeout(doSomething, 1000);
}

function stop() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;  // 重置为 null
  }
}
\`\`\`

---

### 八、requestAnimationFrame 在 Node.js 中不存在

浏览器中的 \`requestAnimationFrame\` 用于在下一次浏览器重绘前执行动画更新。Node.js 没有渲染循环，因此**没有原生的 requestAnimationFrame**。

如果你需要在 Node.js 中模拟类似的行为，可以用 \`setImmediate\`（它会在当前事件循环轮次中尽快执行，类似于 rAF 在帧末尾执行的行为）：

\`\`\`javascript
// 浏览器：
// requestAnimationFrame(() => updateAnimation());

// Node.js 替代：
// setImmediate(() => processFrame());
// 或者用 setTimeout(fn, 16) 模拟 60fps
\`\`\`

---

### 九、Timers Promises API（Node.js 16+）

从 Node.js 16 开始，\`timers/promises\` 模块提供了基于 Promise 的定时器 API：

\`\`\`javascript
import { setTimeout } from 'timers/promises';

await setTimeout(1000);  // 暂停 1 秒
console.log('1 秒后执行');

// 也可以用 AbortController 取消
const ac = new AbortController();
setTimeout(2000, null, { signal: ac.signal }).catch(() => {});
ac.abort();  // 取消定时器
\`\`\`

---

### 十、最佳实践总结

| 场景 | 推荐方案 |
| --- | --- |
| 延迟执行代码 | \`setTimeout\` |
| 尽快异步执行（I/O 回调后） | \`setImmediate\` |
| 最高优先级异步执行 | \`process.nextTick\`（谨慎使用） |
| 重复执行 | \`递归 setTimeout\`（而非 setInterval） |
| 让定时器不阻塞退出 | \`timer.unref()\` |
| 需要可取消的延迟 | \`AbortController + timers/promises\` |
| 精确计时 | \`performance.now()\` |
| 动画/游戏循环 | \`setImmediate\` 或 \`setTimeout(16)\` 模拟 |

下面这段代码将完整演示定时器的执行顺序、精度、ref/unref、防抖和节流等核心概念。`,
    code: `// ============================================================
// 第一章代码演示：Timers 深入——执行顺序、精度、防抖节流
// ============================================================

// ---- 1. 执行顺序对比：nextTick vs Promise vs setTimeout vs setImmediate ----
console.log("===== 1. 执行优先级对比 =====");
console.log("A. 同步代码开始");

// process.nextTick：最高优先级的异步回调
process.nextTick(() => {
  console.log("D. process.nextTick 回调（优先级最高）");
  // 在 nextTick 中嵌套 nextTick
  process.nextTick(() => {
    console.log("E. 嵌套的 nextTick（在上一个nextTick后立即执行）");
  });
});

// Promise.then：微任务，优先级次于 nextTick
Promise.resolve().then(() => {
  console.log("F. Promise.then 回调（微任务）");
  Promise.resolve().then(() => {
    console.log("G. 嵌套的 Promise.then");
  });
});

// queueMicrotask：与 Promise.then 同级
if (typeof queueMicrotask === "function") {
  queueMicrotask(() => {
    console.log("H. queueMicrotask 回调（与Promise同级）");
  });
}

// setTimeout(fn, 0)：宏任务，Timers 阶段
setTimeout(() => {
  console.log("I. setTimeout(()=>{}, 0) 回调（Timers阶段）");
}, 0);

// setImmediate：宏任务，Check 阶段
setImmediate(() => {
  console.log("J. setImmediate 回调（Check阶段）");
});

console.log("B. 同步代码中间部分");
console.log("C. 同步代码结束");

// 执行顺序预期：
// A → B → C → D → E → F → G → H → (I/J 顺序不确定)

// ---- 2. setTimeout 精度测量 ----
setTimeout(() => {
  console.log("\\n===== 2. setTimeout 精度测量 =====");

  // 测量 setTimeout(fn, 0) 的实际延迟
  const t0 = Date.now();
  setTimeout(() => {
    const delay = Date.now() - t0;
    console.log("setTimeout(fn, 0) 实际延迟:", delay, "ms");
    console.log("（理论值 0ms，实际约 1~3ms，取决于系统负载）");
  }, 0);

  // 测量 setTimeout(fn, 1) 的实际延迟
  const t1 = Date.now();
  setTimeout(() => {
    const delay = Date.now() - t1;
    console.log("setTimeout(fn, 1) 实际延迟:", delay, "ms");
  }, 1);

  // 测量 setTimeout(fn, 10) 的实际延迟
  const t2 = Date.now();
  setTimeout(() => {
    const delay = Date.now() - t2;
    console.log("setTimeout(fn, 10) 实际延迟:", delay, "ms");
  }, 10);

  // 测量 setTimeout(fn, 100) 的实际延迟
  const t3 = Date.now();
  setTimeout(() => {
    const delay = Date.now() - t3;
    console.log("setTimeout(fn, 100) 实际延迟:", delay, "ms");
    console.log("（延迟越大，相对精度越高）");
  }, 100);
}, 50);

// ---- 3. setTimeout vs setImmediate 在 I/O 回调中 ----
setTimeout(() => {
  console.log("\\n===== 3. I/O 回调中的 setTimeout vs setImmediate =====");
  console.log("模拟 I/O 回调（如 fs.readFile 的回调）:");
  // 在 I/O 回调的"模拟"中，setImmediate 一定先于 setTimeout
  setImmediate(() => console.log("  [1] setImmediate 先执行（Check阶段紧随Poll）"));
  setTimeout(() => console.log("  [2] setTimeout 后执行（下一轮Timers阶段）"), 0);
  console.log("  [0] I/O 回调中的同步代码先执行");
}, 100);

// ---- 4. 用性能计时器测量精度 ----
setTimeout(() => {
  console.log("\\n===== 4. 高精度计时 =====");
  // 使用 Date.now() 进行毫秒级计时
  const start = Date.now();
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += Math.sqrt(i);
  }
  const elapsed = Date.now() - start;
  console.log("100万次 sqrt 计算耗时:", elapsed, "ms");
  console.log("（Date.now() 精度为毫秒级）");
}, 200);

// ---- 5. ref / unref 演示 ----
setTimeout(() => {
  console.log("\\n===== 5. ref / unref —— 控制事件循环退出 =====");

  // 创建一个 5 秒的定时器
  const longTimer = setTimeout(() => {
    console.log("这条消息不会打印（因为 unref 后进程会提前退出）");
  }, 5000);

  console.log("创建了一个 5 秒后的定时器");
  console.log("定时器对象:", typeof longTimer, "hasRef:", longTimer.hasRef ? longTimer.hasRef() : "unknown");

  // unref：让这个定时器不再阻止事件循环退出
  longTimer.unref();
  console.log("调用 unref() 后，如果只有这个定时器，进程会退出");

  // ref：恢复阻止退出
  longTimer.ref();
  console.log("调用 ref() 后，定时器恢复阻止退出");

  // 再次 unref
  longTimer.unref();
  console.log("再次 unref()，定时器不再阻止退出");

  // 在另一个定时器中清除 longTimer
  setTimeout(() => {
    clearTimeout(longTimer);
    console.log("longTimer 已被清除");
  }, 100);
}, 300);

// ---- 6. 递归 setTimeout 替代 setInterval（避免累积延迟） ----
setTimeout(() => {
  console.log("\\n===== 6. 递归 setTimeout vs setInterval =====");

  // 6a. 使用 setInterval（有累积延迟问题）
  let intervalCount = 0;
  const intervalStart = Date.now();
  console.log("--- setInterval 方式 ---");
  const intervalId = setInterval(() => {
    intervalCount++;
    // 模拟稍重的计算（约 30ms）
    const busyStart = Date.now();
    while (Date.now() - busyStart < 30) { /* busy wait */ }
    const elapsed = Date.now() - intervalStart;
    const expected = intervalCount * 80;
    console.log(
      "  setInterval 第" + intervalCount + "次，" +
      "预期" + expected + "ms，实际" + elapsed + "ms，" +
      "偏差" + (elapsed - expected) + "ms"
    );
    if (intervalCount >= 5) {
      clearInterval(intervalId);
      console.log("  setInterval 已清除");
    }
  }, 80);

  // 6b. 使用递归 setTimeout（推荐，避免累积）
  setTimeout(() => {
    let recCount = 0;
    const recStart = Date.now();
    console.log("\\n--- 递归 setTimeout 方式（推荐）---");
    function recTimeout() {
      recCount++;
      // 模拟稍重的计算（约 30ms）
      const busyStart = Date.now();
      while (Date.now() - busyStart < 30) { /* busy wait */ }
      const elapsed = Date.now() - recStart;
      const expected = recCount * 80;
      console.log(
        "  recTimeout 第" + recCount + "次，" +
        "预期" + expected + "ms，实际" + elapsed + "ms，" +
        "偏差" + (elapsed - expected) + "ms"
      );
      if (recCount < 5) {
        // 等上一次回调执行完毕后再设置下一次
        setTimeout(recTimeout, 80);
      } else {
        console.log("  recTimeout 已完成");
        console.log("\\n注意：递归 setTimeout 不会堆积，");
        console.log("即使回调耗时超过间隔，也只会延迟不会堆积");
      }
    }
    setTimeout(recTimeout, 80);
  }, 800);
}, 400);

// ---- 7. 防抖（Debounce）函数 ----
setTimeout(() => {
  console.log("\\n===== 7. 防抖函数（Debounce）====");

  /**
   * 防抖：在事件触发后等待一段时间，如果期间再次触发则重新计时。
   * 适用场景：搜索框输入、窗口 resize、按钮点击（防止重复提交）
   */
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      // 清除之前的定时器
      if (timer !== null) {
        clearTimeout(timer);
      }
      // 设置新的定时器
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    };
  }

  // 模拟：用户快速输入搜索关键词
  const search = debounce((keyword) => {
    console.log('🔍 实际发起搜索请求: "' + keyword + '"');
  }, 300);

  console.log("模拟用户快速输入 'hello':");
  search("h");       // 被取消
  search("he");      // 被取消
  search("hel");     // 被取消
  search("hell");    // 被取消
  search("hello");   // 只有这个会真正执行

  setTimeout(() => {
    console.log("\\n模拟用户输入 'world' (有停顿):");
    search("w");       // 被取消
    search("wo");      // 被取消
    // 停顿 400ms
    setTimeout(() => {
      search("wor");    // 被取消
      search("worl");   // 被取消
      search("world");  // 只有这个会真正执行
    }, 400);
  }, 500);
}, 2000);

// ---- 8. 节流（Throttle）函数 ----
setTimeout(() => {
  console.log("\\n===== 8. 节流函数（Throttle）====");

  /**
   * 节流：在指定时间内只执行一次，无论触发多少次。
   * 适用场景：滚动事件、鼠标移动、游戏帧更新
   */
  function throttle(fn, interval) {
    let lastTime = 0;
    let timer = null;
    return function (...args) {
      const now = Date.now();
      const remaining = interval - (now - lastTime);

      if (remaining <= 0) {
        // 超过间隔时间，立即执行
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastTime = now;
        fn.apply(this, args);
      } else if (!timer) {
        // 还没到时间，设置一个定时器
        timer = setTimeout(() => {
          lastTime = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  // 模拟：滚动事件（每 200ms 最多处理一次）
  const handleScroll = throttle((position) => {
    console.log("📜 处理滚动事件，位置:", position);
  }, 200);

  console.log("模拟快速滚动（每 50ms 触发一次，但处理节流到 200ms）:");
  let scrollPos = 0;
  const scrollTimer = setInterval(() => {
    scrollPos += 50;
    handleScroll(scrollPos);
    if (scrollPos >= 1000) {
      clearInterval(scrollTimer);
      console.log("滚动模拟结束");
    }
  }, 50);
}, 3500);

// ---- 9. 组合实践：带防抖的自动保存 ----
setTimeout(() => {
  console.log("\\n===== 9. 实战：自动保存（防抖模式）====");

  // 模拟保存到"数据库"的操作
  const saveData = debounce((data) => {
    console.log('💾 保存数据: ' + JSON.stringify(data));
  }, 500);

  console.log("编辑文档...");
  saveData({ title: "未命名文档", content: "A" });
  saveData({ title: "未命名文档", content: "AB" });
  saveData({ title: "未命名文档", content: "ABC" });
  saveData({ title: "我的文档", content: "ABCD" });
  console.log("停止编辑 500ms 后，只会保存最后一次内容");
}, 5000);

// ---- 10. 定时器 ID 与清除安全 ----
setTimeout(() => {
  console.log("\\n===== 10. 定时器清除的安全性 =====");

  // 清除不存在的定时器不会报错
  console.log("清除 undefined 定时器:");
  clearTimeout(undefined);
  console.log("  ✓ 没有报错");

  console.log("清除 null 定时器:");
  clearTimeout(null);
  console.log("  ✓ 没有报错");

  console.log("清除已过期的定时器:");
  const expired = setTimeout(() => {}, 0);
  setTimeout(() => {
    clearTimeout(expired);
    console.log("  ✓ 没有报错");
  }, 50);

  // 正确的清除模式
  console.log("\\n推荐模式：清除后置 null");
  let timer = setTimeout(() => {}, 1000);
  clearTimeout(timer);
  timer = null;
  console.log("clearTimeout 后 timer =", timer);
}, 5500);

// ---- 11. 执行总结 ----
setTimeout(() => {
  console.log("\\n===== 11. 定时器优先级总结 =====");
  console.log("┌─────────────────────────────────────┐");
  console.log("│ 执行优先级（从高到低）              │");
  console.log("│ 1. 同步代码                         │");
  console.log("│ 2. process.nextTick 回调            │");
  console.log("│ 3. Promise.then / queueMicrotask    │");
  console.log("│ 4. setTimeout / setInterval         │");
  console.log("│ 5. setImmediate（I/O中确定在4前）   │");
  console.log("├─────────────────────────────────────┤");
  console.log("│ 关键技巧                            │");
  console.log("│ • 递归setTimeout替代setInterval     │");
  console.log("│ • unref() 让定时器不阻止退出        │");
  console.log("│ • 防抖debounce：等待停止后执行      │");
  console.log("│ • 节流throttle：固定间隔执行        │");
  console.log("└─────────────────────────────────────┘");
}, 6000);`,
  },

  // =========================================================
  // 第二章：子进程 (Child Process)
  // =========================================================
  {
    id: "node-child-process",
    title: "子进程 (Child Process)",
    icon: "👶",
    group: "核心模块补充",
    content: `## 子进程 (Child Process)：让 Node.js 打破单进程限制

Node.js 的主进程是单线程的，但通过 \`child_process\` 模块，你可以创建子进程来执行系统命令、运行其他程序、或启动新的 Node.js 实例。这是 Node.js 扩展能力的关键机制之一。

---

### 一、为什么需要子进程？

#### 1.1 单进程的局限

Node.js 单进程面临的核心问题：

| 问题 | 说明 |
| --- | --- |
| **CPU 密集型任务阻塞** | 一个耗时的计算会阻塞整个事件循环 |
| **无法利用多核** | 单进程只能使用一个 CPU 核心 |
| **进程崩溃影响全局** | 一个未捕获的异常可能导致整个进程退出 |
| **无法调用系统命令** | 需要执行 shell 脚本或其他语言编写的程序 |

#### 1.2 子进程能解决什么

| 能力 | 说明 |
| --- | --- |
| **并行计算** | 把 CPU 密集型任务分给子进程，主进程继续处理请求 |
| **多核利用** | 通过 fork 创建多个 Node.js 子进程，充分利用多核 |
| **隔离崩溃** | 子进程崩溃不会影响主进程（可以监听 exit 重启） |
| **系统集成** | 调用 Python 脚本、shell 命令、C++ 编译的程序等 |

---

### 二、四种创建方式详解

\`child_process\` 模块提供了四种创建子进程的方法，各有不同的适用场景：

#### 2.1 spawn —— 最通用的方式

\`spawn(command, [args], [options])\` 启动一个子进程来执行命令，返回 \`ChildProcess\` 对象。它是**流式**的，适合处理大量数据输出。

\`\`\`javascript
const { spawn } = require('child_process');

// 执行 ls -la 命令
const ls = spawn('ls', ['-la', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(\`stdout: \${data}\`);
});

ls.stderr.on('data', (data) => {
  console.error(\`stderr: \${data}\`);
});

ls.on('close', (code) => {
  console.log(\`子进程退出，退出码: \${code}\`);
});
\`\`\`

**特点**：
- 不会创建 shell（默认），更安全、更高效
- 输出是流式的，适合处理大文件
- 可以精确控制参数，避免命令注入
- 不缓冲输出，没有大小限制

#### 2.2 exec —— 执行完整命令字符串

\`exec(command, [options], callback)\` 执行一个完整的 shell 命令字符串，通过回调返回结果。它会缓冲 stdout 和 stderr 到内存中。

\`\`\`javascript
const { exec } = require('child_process');

exec('ls -la /usr | wc -l', (error, stdout, stderr) => {
  if (error) {
    console.error(\`执行出错: \${error}\`);
    return;
  }
  console.log(\`stdout: \${stdout}\`);
  console.error(\`stderr: \${stderr}\`);
});
\`\`\`

**特点**：
- 默认使用 shell 执行（\`/bin/sh\` 或 \`cmd.exe\`）
- 支持管道、重定向等 shell 特性
- 有 **maxBuffer** 限制（默认 1MB），超出会杀死进程
- 适合执行短命令、输出量小的场景

#### 2.3 execFile —— 直接执行可执行文件

\`execFile(file, [args], [options], callback)\` 直接执行一个可执行文件，**不通过 shell**。

\`\`\`javascript
const { execFile } = require('child_process');

execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) throw error;
  console.log('Node.js 版本:', stdout.trim());
});
\`\`\`

**特点**：
- 不通过 shell，更安全、更高效
- 没有 shell 注入风险
- 不能使用管道、重定向等 shell 特性
- 适合执行已知路径的可执行文件

#### 2.4 fork —— 创建 Node.js 子进程

\`fork(modulePath, [args], [options])\` 是 \`spawn\` 的特殊变体，专门用于创建 Node.js 子进程。它默认建立了 IPC 通信通道。

\`\`\`javascript
// parent.js
const { fork } = require('child_process');
const child = fork('./child.js');

child.on('message', (msg) => {
  console.log('父进程收到:', msg);
});

child.send({ hello: 'world' });

// child.js
process.on('message', (msg) => {
  console.log('子进程收到:', msg);
  process.send({ result: 'ok' });
});
\`\`\`

**特点**：
- 自动建立 IPC 通道（基于 \`process.send()\` 和 \`message\` 事件）
- 子进程是独立的 V8 实例（独立的内存空间）
- 额外开销比 spawn 大（需要启动完整的 Node.js）
- 适合 CPU 密集型任务的分发

---

### 三、四种方式对比

| 特性 | spawn | exec | execFile | fork |
| --- | --- | --- | --- | --- |
| **使用 shell** | 默认否 | 默认是 | 默认否 | 默认否 |
| **数据输出** | 流式（Stream） | 缓冲（Buffer） | 缓冲（Buffer） | 流式（Stream） |
| **输出大小限制** | 无限制 | maxBuffer（1MB） | maxBuffer（1MB） | 无限制 |
| **IPC 通信** | 可选 | 否 | 否 | 默认启用 |
| **命令格式** | 命令 + 参数数组 | 完整命令字符串 | 文件路径 + 参数 | 模块路径 |
| **适用场景** | 长运行、大输出 | 短命令、小输出 | 执行已知程序 | Node.js 子进程 |
| **安全性** | 较高（无 shell 注入） | 较低（shell 注入风险） | 最高 | 高 |

---

### 四、stdio 管道配置详解

\`options.stdio\` 用于配置子进程的标准输入/输出/错误流的处理方式，是子进程通信的核心。

#### 4.1 stdio 配置格式

\`stdio\` 可以是一个数组 \`[stdin, stdout, stderr]\`，每个元素可以是：

| 值 | 说明 |
| --- | --- |
| \`'pipe'\` | 在父子进程间创建管道（默认值，stdin/stdout/stderr 都是 pipe） |
| \`'inherit'\` | 子进程直接使用父进程的 stdio（输出会直接显示在终端） |
| \`'ignore'\` | 忽略该流（数据会被丢弃） |
| \`'ipc'\` | 创建 IPC 通道（用于 \`process.send()\` 通信） |
| \`Stream\` 对象 | 使用已有的流对象 |
| \`正整数（fd）\` | 使用指定的文件描述符 |

#### 4.2 常见配置示例

\`\`\`javascript
// 配置1：只捕获 stdout，忽略 stderr
spawn('cmd', ['arg'], { stdio: ['pipe', 'pipe', 'ignore'] });

// 配置2：子进程的输出直接显示在终端
spawn('cmd', ['arg'], { stdio: 'inherit' });

// 配置3：IPC 通信 + 忽略 stdio
fork('child.js', [], { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });

// 配置4：stdin 来自文件，stdout 写入文件
const fs = require('fs');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./err.log', 'a');
spawn('cmd', ['arg'], { stdio: ['ignore', out, err] });
\`\`\`

---

### 五、IPC 通信（进程间通信）

#### 5.1 fork 的 IPC 通道

fork 自动建立 IPC 通道，父子进程可以通过 \`send()\` 和 \`message\` 事件通信：

\`\`\`javascript
// 父进程
const child = fork('child.js');
child.send({ type: 'task', data: [1, 2, 3] });  // 发送任务
child.on('message', (msg) => {
  console.log('收到结果:', msg.result);
});

// 子进程（child.js）
process.on('message', (msg) => {
  if (msg.type === 'task') {
    const result = msg.data.reduce((a, b) => a + b, 0);
    process.send({ result });  // 返回结果
  }
});
\`\`\`

#### 5.2 IPC 通信的序列化

IPC 通信使用**结构化克隆算法**（structured clone algorithm）进行序列化。可以传递的类型包括：

- 基本类型：string, number, boolean, null, undefined
- 对象和数组（无循环引用）
- Date, RegExp, Map, Set
- Buffer, ArrayBuffer, TypedArray
- Error 对象

**不能传递**：
- 函数（会报错）
- Symbol
- DOM 节点（Node.js 中不适用）
- 包含循环引用的对象

#### 5.3 双向通信模式

\`\`\`javascript
// 请求-响应模式
// 父进程
const child = fork('worker.js');
const pending = new Map();
let reqId = 0;

function request(task) {
  return new Promise((resolve) => {
    const id = ++reqId;
    pending.set(id, resolve);
    child.send({ id, task });
  });
}

child.on('message', (msg) => {
  if (pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
});

// 使用
const result = await request({ action: 'compute', data: 42 });
\`\`\`

---

### 六、子进程生命周期管理

#### 6.1 事件

| 事件 | 触发时机 |
| --- | --- |
| \`'spawn'\` | 子进程成功启动 |
| \`'message'\` | 收到子进程的 IPC 消息 |
| \`'error'\` | 启动失败或无法发送消息 |
| \`'exit'\` | 子进程退出（code + signal） |
| \`'close'\` | 子进程的 stdio 流关闭 |
| \`'disconnect'\` | IPC 通道断开 |

**exit 和 close 的区别**：
- \`exit\`：子进程自身退出时触发（可能 stdio 还没关闭）
- \`close\`：子进程的 stdio 流全部关闭时触发（通常在 exit 之后）

#### 6.2 终止子进程

\`\`\`javascript
// 1. child.kill([signal]) —— 发送信号
child.kill();        // 默认发送 SIGTERM
child.kill('SIGINT'); // 发送 Ctrl+C 信号
child.kill('SIGKILL'); // 强制杀死（不可捕获）

// 2. child.disconnect() —— 断开 IPC（子进程可能继续运行）
child.disconnect();

// 3. 超时自动杀死
const child = spawn('long-running-task');
setTimeout(() => {
  child.kill('SIGTERM');
  // 给子进程 5 秒优雅退出
  setTimeout(() => {
    if (!child.killed) {
      child.kill('SIGKILL'); // 强制杀死
    }
  }, 5000);
}, 30000); // 30 秒超时
\`\`\`

#### 6.3 退出码

| 退出码 | 含义 |
| --- | --- |
| 0 | 正常退出 |
| 1 | 一般性错误 |
| 127 | 命令未找到 |
| 128 + N | 被信号 N 终止（如 130 = 128 + 2 = SIGINT） |
| null | 子进程被信号杀死（通过 \`child.kill()\`） |

---

### 七、shell 选项的安全风险

#### 7.1 命令注入攻击

当使用 \`exec\` 且命令字符串包含用户输入时，存在**命令注入**风险：

\`\`\`javascript
// ❌ 危险！用户输入被直接拼接到命令中
const userInput = req.query.filename; // 用户输入: "; rm -rf /"
exec(\`cat \${userInput}\`, (err, stdout) => {
  // 实际执行: cat ; rm -rf /
  // 后果：灾难性的！
});

// ✅ 安全：使用 spawn + 参数数组
const { spawn } = require('child_process');
const child = spawn('cat', [userInput]); // 即使包含特殊字符也只作为参数
\`\`\`

#### 7.2 安全防护建议

| 建议 | 说明 |
| --- | --- |
| 避免 exec 处理用户输入 | 优先使用 spawn/execFile |
| 参数白名单验证 | 只允许预定义的参数值 |
| shell: false | 不启用 shell 可以减少攻击面 |
| 输入转义 | 如果必须用 exec，对用户输入进行转义 |
| 最小权限原则 | 子进程以最小必要权限运行 |

---

### 八、子进程错误处理

\`\`\`javascript
const child = spawn('some-command', ['arg']);

child.on('error', (err) => {
  // 无法启动子进程（如命令不存在、权限不足）
  console.error('启动失败:', err.message);
});

child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(\`异常退出，code=\${code}, signal=\${signal}\`);
  }
});

child.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});

// 确保子进程不会无限运行
const timeout = setTimeout(() => {
  child.kill('SIGKILL');
  console.error('子进程超时，已强制终止');
}, 30000);

child.on('exit', () => clearTimeout(timeout));
\`\`\`

---

### 九、常见陷阱与最佳实践

1. **exec 的 maxBuffer 限制**：如果预期输出较大，用 spawn 代替 exec
2. **僵尸进程**：确保监听 exit 事件并清理，或使用 \`child.unref()\`
3. **环境变量继承**：子进程默认继承父进程的环境变量，可以通过 \`options.env\` 覆盖
4. **Windows 兼容性**：spawn 在 Windows 上需要特殊处理（\`shell: true\` 或使用 \`.cmd\` 后缀）
5. **错误优先**：始终监听 error、exit、close 事件

下面这段代码通过对象字面量模拟四种进程创建方式、IPC 通信、stdio 管道和生命周期管理。`,
    code: `// ============================================================
// 第二章代码演示：子进程概念模拟（对象字面量 + 接口模拟）
// ============================================================
// 注意：沙箱无法真正创建子进程，以下代码用对象字面量模拟核心概念。
// 在真实 Node.js 环境中，使用 require('child_process') 替换模拟。
// 但进程退出事件、IPC 模式、生命周期管理等概念是通用的。

const EventEmitter = require("events");

// ---- 1. 模拟子进程基类 ----
console.log("===== 1. 模拟子进程类型定义 =====");

/**
 * 模拟 ChildProcess 类
 * 真实环境中由 child_process 模块返回
 */
class SimulatedChildProcess extends EventEmitter {
  constructor(options = {}) {
    super();
    this.pid = Math.floor(Math.random() * 90000) + 10000;
    this.killed = false;
    this.connected = options.ipc || false;
    this.exitCode = null;
    this.signalCode = null;
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.stdin = { write: () => {}, end: () => {} };
    this._messageQueue = [];
    this._messageHandlers = [];
  }

  // 模拟发送 IPC 消息
  send(message) {
    if (!this.connected) {
      throw new Error("IPC channel is not open");
    }
    console.log(
      "  [父进程 → 子进程] send:",
      JSON.stringify(message).slice(0, 60)
    );
    // 模拟子进程收到消息后回复
    setTimeout(() => {
      if (this._messageHandlers.length > 0) {
        const handler = this._messageHandlers.shift();
        handler(message);
      }
    }, 10);
    return true;
  }

  // 模拟注册消息处理器（子进程侧）
  onMessage(handler) {
    this._messageHandlers.push(handler);
  }

  // 模拟子进程发送消息给父进程
  _sendToParent(message) {
    console.log(
      "  [子进程 → 父进程] send:",
      JSON.stringify(message).slice(0, 60)
    );
    this.emit("message", message);
  }

  // 模拟杀死子进程
  kill(signal = "SIGTERM") {
    if (this.killed) return false;
    this.killed = true;
    this.signalCode = signal;
    console.log("  [kill] 发送信号:", signal);
    // 模拟退出
    setTimeout(() => {
      const code = signal === "SIGKILL" ? null : 0;
      this.exitCode = code;
      this.emit("exit", code, signal);
      this.emit("close", code, signal);
    }, 20);
    return true;
  }

  // 断开 IPC
  disconnect() {
    this.connected = false;
    this.emit("disconnect");
    console.log("  [disconnect] IPC 通道已断开");
  }
}

// ---- 2. 模拟 spawn：流式输出，无输出限制 ----
console.log("\\n===== 2. spawn 模式模拟 =====");
console.log("特点：流式输出，适合大输出量的命令");

function simulateSpawn(command, args, options = {}) {
  console.log("spawn('" + command + "', " + JSON.stringify(args) + ")");
  const child = new SimulatedChildProcess(options);

  // 模拟命令执行
  setTimeout(() => {
    if (command === "notexist") {
      child.emit("error", new Error("spawn notexist ENOENT"));
      return;
    }

    // 模拟 stdout 流式输出
    console.log("  [stdout] 流式数据块1: 'line1\\n'");
    child.stdout.emit("data", Buffer.from("line1\\n"));
    setTimeout(() => {
      console.log("  [stdout] 流式数据块2: 'line2\\n'");
      child.stdout.emit("data", Buffer.from("line2\\n"));
      setTimeout(() => {
        console.log("  [stdout] 流式数据块3: 'line3\\n'");
        child.stdout.emit("data", Buffer.from("line3\\n"));
        // 流结束，子进程退出
        child.exitCode = 0;
        child.emit("exit", 0, null);
        child.emit("close", 0, null);
      }, 10);
    }, 10);
  }, 10);

  return child;
}

// 使用 spawn 模拟
const spawnChild = simulateSpawn("cat", ["file.txt"]);
spawnChild.stdout.on("data", (data) => {
  console.log("  收到流数据:", data.toString().trim());
});
spawnChild.on("exit", (code) => {
  console.log("  spawn 子进程退出，退出码:", code);
});

// ---- 3. 模拟 exec：缓冲输出，有 maxBuffer 限制 ----
setTimeout(() => {
  console.log("\\n===== 3. exec 模式模拟 =====");
  console.log("特点：缓冲全部输出，有 maxBuffer（默认1MB）限制");

  function simulateExec(command, options, callback) {
    console.log("exec('" + command + "', callback)");
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    const maxBuffer = options.maxBuffer || 1024 * 1024; // 默认 1MB

    const child = new SimulatedChildProcess();
    let stdout = "";
    let stderr = "";

    setTimeout(() => {
      // 模拟命令输出
      const output = "total 5\\ndrwxr-xr-x  3 user  staff   96\\n";
      stdout += output;

      if (Buffer.byteLength(stdout) > maxBuffer) {
        child.kill("SIGKILL");
        callback(
          new Error("stdout maxBuffer length exceeded"),
          "",
          "maxBuffer exceeded"
        );
        return;
      }

      child.exitCode = 0;
      child.emit("exit", 0, null);
      callback(null, stdout, stderr);
    }, 10);

    return child;
  }

  simulateExec("ls -la", (error, stdout, stderr) => {
    if (error) {
      console.log("  exec 出错:", error.message);
    } else {
      console.log("  exec 输出:");
      console.log(stdout.trim());
    }
  });

  // 模拟 maxBuffer 超限
  simulateExec(
    "cat hugefile",
    { maxBuffer: 10 },
    (error, stdout, stderr) => {
      setTimeout(() => {
        console.log("\\n--- maxBuffer 超限模拟 ---");
        console.log("  exec 命令: cat hugefile");
        console.log("  maxBuffer 限制: 10 字节");
        console.log("  stdout 超过 10 字节，子进程被 SIGKILL");
        console.log("  错误:", error ? error.message : "无");
      }, 20);
    }
  );
}, 100);

// ---- 4. 模拟 execFile：直接执行文件，无 shell ----
setTimeout(() => {
  console.log("\\n===== 4. execFile 模式模拟 =====");
  console.log("特点：不通过 shell，直接执行可执行文件，安全性最高");

  function simulateExecFile(file, args, callback) {
    console.log("execFile('" + file + "', " + JSON.stringify(args) + ")");

    setTimeout(() => {
      if (file === "nonexistent") {
        callback(new Error("spawn nonexistent ENOENT"), "", "");
        return;
      }
      // 模拟输出
      const stdout = "v20.10.0\\n";
      callback(null, stdout, "");
    }, 10);
  }

  simulateExecFile("node", ["--version"], (error, stdout, stderr) => {
    console.log("  Node.js 版本:", stdout.trim());
    console.log("  注意：execFile 不经过 shell，无法使用管道和重定向");
  });
}, 200);

// ---- 5. 模拟 fork：Node.js 子进程 + IPC ----
setTimeout(() => {
  console.log("\\n===== 5. fork 模式模拟（IPC 通信）====");
  console.log("特点：独立 V8 实例，默认 IPC 通道");

  function simulateFork(modulePath, args = [], options = {}) {
    console.log("fork('" + modulePath + "')");
    const child = new SimulatedChildProcess({ ipc: true });
    child._isFork = true;

    // 模拟子进程启动
    console.log("  子进程 PID:", child.pid);
    console.log("  独立 V8 实例已启动");

    // 模拟子进程的消息处理逻辑（相当于 child.js 中的代码）
    child.onMessage((msg) => {
      console.log("  [子进程收到消息]", JSON.stringify(msg));
      if (msg.type === "compute") {
        const result = msg.data.reduce((a, b) => a + b, 0);
        // 子进程回复
        child._sendToParent({
          id: msg.id,
          type: "result",
          result: result,
          pid: child.pid,
        });
      } else if (msg.type === "ping") {
        child._sendToParent({ id: msg.id, type: "pong", timestamp: Date.now() });
      }
    });

    return child;
  }

  // 模拟父进程
  const forkChild = simulateFork("./worker.js");

  // 父进程监听消息
  forkChild.on("message", (msg) => {
    console.log("  [父进程收到回复]", JSON.stringify(msg));
  });

  // 父进程发送任务
  setTimeout(() => {
    console.log("\\n  父进程发送计算任务:");
    forkChild.send({ id: 1, type: "compute", data: [1, 2, 3, 4, 5] });
  }, 20);

  setTimeout(() => {
    console.log("\\n  父进程发送 ping:");
    forkChild.send({ id: 2, type: "ping" });
  }, 40);

  setTimeout(() => {
    forkChild.kill("SIGTERM");
  }, 80);
}, 300);

// ---- 6. stdio 管道配置模拟 ----
setTimeout(() => {
  console.log("\\n===== 6. stdio 管道配置模拟 =====");

  const stdioConfigs = [
    {
      config: "['pipe', 'pipe', 'pipe']",
      desc: "默认配置：stdin/stdout/stderr 都通过管道传输",
      effects: "父进程可以捕获子进程的输出，也可以向子进程输入数据",
    },
    {
      config: "'inherit'",
      desc: "子进程直接使用父进程的 stdio",
      effects: "子进程的 console.log 直接显示在父进程的终端中",
    },
    {
      config: "['pipe', 'pipe', 'ignore']",
      desc: "忽略 stderr",
      effects: "stderr 数据被丢弃，不会触发 data 事件",
    },
    {
      config: "['ignore', 'ignore', 'ignore', 'ipc']",
      desc: "只保留 IPC 通道（fork 常用）",
      effects: "子进程的 stdio 全部忽略，仅通过 IPC 通信",
    },
    {
      config: "['pipe', fs.openSync('out.log'), fs.openSync('err.log')]",
      desc: "stdout 写入文件，stderr 写入另一个文件",
      effects: "适合长时间运行的子进程，输出持久化到文件",
    },
  ];

  console.table(stdioConfigs.map((c) => ({
    配置: c.config,
    说明: c.desc,
    效果: c.effects.slice(0, 40) + "...",
  })));
}, 400);

// ---- 7. 子进程生命周期模拟 ----
setTimeout(() => {
  console.log("\\n===== 7. 子进程生命周期管理 =====");

  const lifeChild = new SimulatedChildProcess({ ipc: true });
  console.log("子进程创建，PID:", lifeChild.pid);

  // 监听所有生命周期事件
  lifeChild.on("spawn", () => console.log("  [事件] spawn - 子进程启动"));
  lifeChild.on("error", (err) => console.log("  [事件] error -", err.message));
  lifeChild.on("exit", (code, signal) =>
    console.log("  [事件] exit - code:", code, "signal:", signal)
  );
  lifeChild.on("close", (code, signal) =>
    console.log("  [事件] close - code:", code, "signal:", signal)
  );
  lifeChild.on("disconnect", () =>
    console.log("  [事件] disconnect - IPC断开")
  );

  // 模拟正常生命周期
  console.log("\\n--- 正常退出流程 ---");
  setTimeout(() => {
    lifeChild.emit("spawn");
    setTimeout(() => {
      lifeChild.exitCode = 0;
      lifeChild.emit("exit", 0, null);
      lifeChild.emit("close", 0, null);
      console.log("  退出码 0 表示正常退出");
    }, 20);
  }, 10);

  // 模拟异常退出
  setTimeout(() => {
    console.log("\\n--- 异常退出流程 ---");
    const errChild = new SimulatedChildProcess();
    errChild.on("exit", (code, signal) => {
      console.log("  [exit] 异常退出 code:", code, "signal:", signal);
      console.log("  退出码非 0 表示错误，signal 非 null 表示被信号终止");
    });
    errChild.kill("SIGTERM");
  }, 80);
}, 500);

// ---- 8. 退出码含义表 ----
setTimeout(() => {
  console.log("\\n===== 8. 退出码含义 =====");
  const exitCodes = [
    { code: 0, meaning: "正常退出", example: "程序执行完毕" },
    { code: 1, meaning: "一般性错误", example: "程序逻辑错误" },
    { code: 2, meaning: "误用 shell 命令", example: "bash 语法错误" },
    { code: 126, meaning: "命令无法执行", example: "权限不足" },
    { code: 127, meaning: "命令未找到", example: "command not found" },
    { code: 128, meaning: "无效的退出参数", example: "exit 3.14" },
    { code: "128+N", meaning: "被信号 N 终止", example: "130 = 128+2 = SIGINT" },
    { code: "null", meaning: "被信号杀死", example: "child.kill('SIGKILL')" },
  ];
  console.table(exitCodes);
}, 600);

// ---- 9. 安全：shell 注入风险对比 ----
setTimeout(() => {
  console.log("\\n===== 9. 命令注入安全风险 =====");

  const userInput = "; rm -rf /";

  console.log("用户输入:", JSON.stringify(userInput));
  console.log("");

  // ❌ 危险方式（exec）
  console.log("❌ exec 方式（危险）:");
  const dangerousCmd = "cat " + userInput;
  console.log("  拼接后的命令:", dangerousCmd);
  console.log("  实际会执行: cat ; rm -rf /");
  console.log("  （先执行 cat（无参数），然后执行 rm -rf /）");
  console.log("");

  // ✅ 安全方式（spawn）
  console.log("✅ spawn 方式（安全）:");
  console.log("  spawn('cat', ['" + userInput + "'])");
  console.log("  cat 会尝试打开名为 '; rm -rf /' 的文件");
  console.log("  特殊字符被当作文件名的一部分，不会作为命令执行");
  console.log("");
  console.log("安全建议：");
  console.log("  1. 优先使用 spawn/execFile");
  console.log("  2. 避免 exec 处理用户输入");
  console.log("  3. 对参数进行白名单验证");
  console.log("  4. 设置 shell: false 减少攻击面");
}, 700);

// ---- 10. 综合总结 ----
setTimeout(() => {
  console.log("\\n===== 10. 四种方式选择指南 =====");
  console.log("┌──────────┬──────────────────────────────┐");
  console.log("│ spawn    │ 通用方案，流式输出，大输出量  │");
  console.log("│ exec     │ 短命令，小输出，需要 shell    │");
  console.log("│ execFile │ 执行已知程序，安全性最高      │");
  console.log("│ fork     │ Node.js 子进程，IPC 通信      │");
  console.log("├──────────┴──────────────────────────────┤");
  console.log("│ 关键事件：error → exit → close          │");
  console.log("│ IPC 通信：send() + message 事件          │");
  console.log("│ 生命周期：kill() + 信号 + 退出码         │");
  console.log("└─────────────────────────────────────────┘");
}, 800);`,
  },

  // =========================================================
  // 第三章：Net 模块 (TCP)
  // =========================================================
  {
    id: "node-net",
    title: "Net 模块 (TCP)",
    icon: "🌐",
    group: "核心模块补充",
    content: `## Net 模块：TCP 网络编程

\`net\` 模块是 Node.js 网络编程的基石。它提供了创建 TCP 服务器和客户端的异步网络 API。HTTP 模块、HTTPS 模块、甚至很多数据库驱动，底层都是基于 net 模块构建的。

---

### 一、TCP 协议基础

#### 1.1 什么是 TCP？

TCP（Transmission Control Protocol，传输控制协议）是互联网协议栈中**传输层**的核心协议。它提供：

| 特性 | 说明 |
| --- | --- |
| **面向连接** | 通信前需要三次握手建立连接 |
| **可靠传输** | 保证数据按序到达、不丢失、不重复 |
| **全双工** | 双方可以同时发送和接收数据 |
| **流式传输** | 数据是连续的字节流，没有消息边界 |
| **流量控制** | 通过滑动窗口机制防止发送方过快 |
| **拥塞控制** | 自动调整发送速率适应网络状况 |

#### 1.2 TCP vs UDP 对比

| 特性 | TCP | UDP |
| --- | --- | --- |
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠（确认+重传） | 不可靠（发送即忘） |
| 顺序 | 保证有序 | 不保证 |
| 速度 | 相对较慢 | 快 |
| 适用场景 | HTTP、文件传输、数据库 | 视频直播、DNS、游戏 |
| 头部开销 | 20 字节 | 8 字节 |

#### 1.3 TCP 三次握手

\`\`\`
客户端                          服务器
  │                               │
  │──── SYN (seq=x) ────────────▶│  第1次：客户端请求建立连接
  │                               │
  │◀─── SYN+ACK (seq=y,ack=x+1) ─│  第2次：服务器确认并同意
  │                               │
  │──── ACK (ack=y+1) ──────────▶│  第3次：客户端确认
  │                               │
  │◀══════ 连接建立，开始通信 ════▶│
\`\`\`

---

### 二、net.createServer —— 创建 TCP 服务器

#### 2.1 基本用法

\`\`\`javascript
const net = require('net');

const server = net.createServer((socket) => {
  // socket 是 Duplex Stream（可读可写）
  // 每个新连接都会触发这个回调

  console.log('客户端已连接:', socket.remoteAddress, socket.remotePort);

  // 接收数据
  socket.on('data', (data) => {
    console.log('收到:', data.toString());
    // 回复客户端
    socket.write('服务器已收到: ' + data.toString());
  });

  // 连接关闭
  socket.on('end', () => {
    console.log('客户端断开连接');
  });

  // 错误处理
  socket.on('error', (err) => {
    console.error('Socket 错误:', err.message);
  });
});

server.listen(3000, () => {
  console.log('TCP 服务器监听在 3000 端口');
});
\`\`\`

#### 2.2 服务器事件

| 事件 | 触发时机 |
| --- | --- |
| \`'listening'\` | 服务器开始监听 |
| \`'connection'\` | 新的客户端连接建立 |
| \`'close'\` | 服务器关闭 |
| \`'error'\` | 服务器出错（如端口被占用） |

---

### 三、net.createConnection —— 创建 TCP 客户端

\`\`\`javascript
const net = require('net');

const client = net.createConnection({ port: 3000, host: 'localhost' }, () => {
  console.log('已连接到服务器');
  client.write('Hello, Server!');
});

client.on('data', (data) => {
  console.log('服务器回复:', data.toString());
  client.end(); // 关闭连接
});

client.on('end', () => {
  console.log('连接已断开');
});

client.on('error', (err) => {
  console.error('连接错误:', err.message);
});
\`\`\`

---

### 四、Socket 事件详解

net.Socket 继承自 stream.Duplex，因此它既是可读流又是可写流。

#### 4.1 核心事件

| 事件 | 触发时机 | 说明 |
| --- | --- | --- |
| \`'data'\` | 收到数据 | 参数是 Buffer，可能包含粘包数据 |
| \`'end'\` | 对方发送 FIN 包 | 半关闭：对方不再发送数据，但本端可能还能发送 |
| \`'close'\` | Socket 完全关闭 | 双向关闭 |
| \`'connect'\` | 连接建立成功 | 仅客户端 socket 触发 |
| \`'drain'\` | 写缓冲区排空 | 当 write() 返回 false 后，缓冲区排空时触发 |
| \`'error'\` | 发生错误 | 必须监听，否则会抛出未捕获异常 |
| \`'timeout'\` | 超时 | 通过 socket.setTimeout() 设置 |
| \`'lookup'\` | DNS 解析完成 | 连接建立前的 DNS 查询 |

#### 4.2 Socket 属性

| 属性 | 说明 |
| --- | --- |
| \`socket.remoteAddress\` | 远端 IP 地址 |
| \`socket.remotePort\` | 远端端口号 |
| \`socket.localAddress\` | 本地 IP 地址 |
| \`socket.localPort\` | 本地端口号 |
| \`socket.remoteFamily\` | 远端地址族（IPv4/IPv6） |
| \`socket.bytesRead\` | 接收的字节数 |
| \`socket.bytesWritten\` | 发送的字节数 |
| \`socket.readyState\` | 连接状态（'opening'/'open'/'readOnly'/'writeOnly'） |

---

### 五、半双工 vs 全双工通信

#### 5.1 概念对比

| 模式 | 说明 | 类比 |
| --- | --- | --- |
| **单工** | 单向通信 | 广播电台 |
| **半双工** | 双向通信，但同一时间只能一个方向 | 对讲机 |
| **全双工** | 双向同时通信 | 电话 |

TCP 是**全双工**的，双方可以同时发送和接收数据。但 TCP 也支持**半关闭**：通过 \`socket.end()\` 关闭本端的写端，对方会收到 \`'end'\` 事件，但本端仍可以接收数据。

\`\`\`javascript
// 半关闭示例
socket.end('最后一段数据');  // 发送完最后的数据后关闭写端
// 此时 socket 仍可接收数据
socket.on('data', (data) => {
  // 还能接收对方发来的数据
});
\`\`\`

---

### 六、Buffer 收发与编码

TCP 传输的是**字节流**，Node.js 中使用 Buffer 表示：

\`\`\`javascript
socket.on('data', (buffer) => {
  // buffer 是 Buffer 对象
  console.log('原始字节:', buffer);
  console.log('十六进制:', buffer.toString('hex'));
  console.log('UTF-8 文本:', buffer.toString('utf8'));
});

// 发送文本
socket.write('Hello', 'utf8');

// 发送二进制
socket.write(Buffer.from([0x01, 0x02, 0x03]));
\`\`\`

---

### 七、TCP 粘包问题与处理（重点）

#### 7.1 什么是粘包？

TCP 是**流式协议**，没有消息边界。当你连续发送多个数据包时，TCP 可能把它们合并（粘包）或拆分（拆包）：

\`\`\`
发送方：  write("ABC")  write("DEF")  write("GHI")
接收方可能收到：
  情况1: "ABCDEFGHI"        （全部粘在一起）
  情况2: "ABC" "DEF" "GHI" （恰好分开，但不可靠）
  情况3: "ABCD" "EFGHI"    （部分粘包）
  情况4: "AB" "CDEFG" "HI" （各种拆分+粘合）
\`\`\`

#### 7.2 为什么会有粘包？

1. **Nagle 算法**：TCP 默认启用的优化算法，会把小的数据包合并后再发送
2. **发送缓冲区**：TCP 发送缓冲区满了才发送，可能把多个 write 的数据合并
3. **接收缓冲区**：接收方读取速度可能和发送速度不一致

#### 7.3 解决方案一：分隔符协议

用特殊字符（如 \`\\n\`）分割消息：

\`\`\`javascript
let buffer = '';

socket.on('data', (chunk) => {
  buffer += chunk.toString();
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf('\\n')) !== -1) {
    const message = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);
    console.log('完整消息:', message);
  }
});
\`\`\`

**优点**：简单直观，适合文本协议  
**缺点**：分隔符不能出现在消息内容中（需要转义）；二进制数据不适用

#### 7.4 解决方案二：长度前缀协议

在每条消息前加上固定长度的头部，表明消息体的长度：

\`\`\`javascript
// 发送：4字节长度前缀 + 消息体
function sendMessage(socket, message) {
  const body = Buffer.from(message, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);  // 大端序写入长度
  socket.write(Buffer.concat([header, body]));
}

// 接收：先读4字节头部，再读对应长度的消息体
let buffer = Buffer.alloc(0);

socket.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  while (buffer.length >= 4) {
    const bodyLength = buffer.readUInt32BE(0);
    if (buffer.length < 4 + bodyLength) break; // 数据不完整

    const body = buffer.slice(4, 4 + bodyLength);
    buffer = buffer.slice(4 + bodyLength);
    console.log('完整消息:', body.toString('utf8'));
  }
});
\`\`\`

**优点**：支持任意二进制数据，无转义问题  
**缺点**：需要额外 4 字节（或 2 字节）的头部开销

#### 7.5 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| **分隔符** | 简单直观，可读性好 | 需要转义，不适合二进制 | 文本协议（如 Redis RESP） |
| **长度前缀** | 支持二进制，无转义 | 需要额外头部开销 | 二进制协议（如 gRPC） |
| **固定长度** | 最简单 | 浪费带宽 | 每条消息大小固定的场景 |
| **JSON+分隔符** | 易读易调试 | 性能较低 | 内部工具、调试用 |

---

### 八、net 模块与 HTTP 模块的关系

HTTP 协议是建立在 TCP 之上的应用层协议。当你用 \`http.createServer()\` 创建 HTTP 服务器时，底层实际上是在使用 net 模块：

\`\`\`javascript
// HTTP 服务器底层等价于
const net = require('net');
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    // 解析 HTTP 请求
    const request = parseHttpRequest(data.toString());
    // 构造 HTTP 响应
    const response = 'HTTP/1.1 200 OK\\r\\nContent-Length: 13\\r\\n\\r\\nHello World!';
    socket.write(response);
  });
});
\`\`\`

这意味着你完全可以用 net 模块手动实现一个 HTTP 服务器，只不过 HTTP 模块已经帮你处理好了协议解析、头部管理、状态码等繁琐细节。

---

### 九、常见陷阱与最佳实践

1. **必须监听 error 事件**：未处理的 socket error 会抛出异常导致进程崩溃
2. **粘包处理**：始终假设数据可能粘包或拆包，实现消息边界
3. **背压处理**：\`socket.write()\` 返回 false 时，应该暂停发送，等待 drain 事件
4. **超时设置**：设置 socket 超时，防止僵尸连接
5. **优雅关闭**：使用 \`socket.end()\` 而非 \`socket.destroy()\`，让数据发送完毕
6. **连接池**：客户端应使用连接池复用连接，避免频繁创建/销毁

下面这段代码模拟了 TCP 服务器/客户端通信、粘包处理、Socket 事件流等核心概念。`,
    code: `// ============================================================
// 第三章代码演示：Net 模块（TCP）概念模拟
// ============================================================
// 注意：沙箱无法建立真正的 TCP 连接，以下代码用对象字面量模拟。
// 所有核心概念（粘包、事件流、消息边界）都是通用的。

const EventEmitter = require("events");

// ---- 1. 模拟 Socket 类 ----
console.log("===== 1. Socket 类型定义 =====");

class SimulatedSocket extends EventEmitter {
  constructor(options = {}) {
    super();
    this.remoteAddress = options.remoteAddress || "127.0.0.1";
    this.remotePort = options.remotePort || 0;
    this.remoteFamily = "IPv4";
    this.localAddress = options.localAddress || "127.0.0.1";
    this.localPort = options.localPort || 3000;
    this.bytesRead = 0;
    this.bytesWritten = 0;
    this.readyState = "opening";
    this._partner = null; // 通信的另一端
    this._writeBuffer = [];
    this._destroyed = false;
    this._timeout = null;
    this._timeoutMs = 0;
  }

  // 模拟关联两端（配对）
  pair(partner) {
    this._partner = partner;
    partner._partner = this;
    this.readyState = "open";
    partner.readyState = "open";
  }

  // 模拟写入数据
  write(data, encoding = "utf8") {
    if (this._destroyed) {
      this.emit("error", new Error("Socket is destroyed"));
      return false;
    }
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, encoding);
    this.bytesWritten += buf.length;

    // 模拟数据发送给对端
    if (this._partner && !this._partner._destroyed) {
      // 模拟网络延迟
      setTimeout(() => {
        this._partner.bytesRead += buf.length;
        this._partner.emit("data", buf);
      }, 5);
    }

    // 模拟背压：如果缓冲区超过 64KB，返回 false
    this._writeBuffer.push(buf);
    const bufferSize = this._writeBuffer.reduce((s, b) => s + b.length, 0);
    if (bufferSize > 64 * 1024) {
      // 模拟 drain 事件
      setTimeout(() => {
        this._writeBuffer = [];
        this.emit("drain");
      }, 10);
      return false;
    }
    return true;
  }

  // 模拟关闭写端（半关闭）
  end(data) {
    if (data) {
      this.write(data);
    }
    this.readyState = "readOnly";
    if (this._partner && !this._partner._destroyed) {
      setTimeout(() => {
        this._partner.emit("end");
      }, 5);
    }
  }

  // 模拟销毁
  destroy(error) {
    this._destroyed = true;
    this.readyState = "closed";
    this.emit("close", !!error);
    if (error) {
      this.emit("error", error);
    }
    if (this._partner && !this._partner._destroyed) {
      this._partner.destroy();
    }
  }

  // 模拟设置超时
  setTimeout(ms) {
    this._timeoutMs = ms;
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this.emit("timeout");
    }, ms);
  }

  // 模拟连接
  connect(port, host, callback) {
    this.readyState = "open";
    this.remotePort = port;
    this.remoteAddress = host;
    if (callback) setTimeout(() => callback(), 5);
    this.emit("connect");
  }
}

// ---- 2. 模拟 TCP 服务器 ----
console.log("\\n===== 2. 模拟 TCP 服务器 =====");

class SimulatedServer extends EventEmitter {
  constructor() {
    super();
    this._connections = [];
    this._listening = false;
  }

  listen(port, callback) {
    this._listening = true;
    this._port = port;
    console.log("TCP 服务器正在监听端口:", port);
    this.emit("listening");
    if (callback) callback();
  }

  // 模拟接受新连接
  _acceptConnection(clientSocket) {
    const serverSocket = new SimulatedSocket({
      remoteAddress: clientSocket.remoteAddress,
      remotePort: clientSocket.remotePort,
      localAddress: "127.0.0.1",
      localPort: this._port,
    });
    serverSocket.pair(clientSocket);
    this._connections.push(serverSocket);
    this.emit("connection", serverSocket);
    return serverSocket;
  }

  close(callback) {
    this._listening = false;
    this._connections.forEach((s) => s.destroy());
    this._connections = [];
    this.emit("close");
    if (callback) callback();
  }
}

// 创建服务器
const server = new SimulatedServer();
server.on("listening", () => console.log("  [事件] listening - 服务器已启动"));
server.on("connection", (socket) => {
  console.log(
    "  [事件] connection - 新客户端:",
    socket.remoteAddress + ":" + socket.remotePort
  );
});
server.on("close", () => console.log("  [事件] close - 服务器已关闭"));
server.listen(3000);

// ---- 3. 模拟 TCP 客户端连接 ----
console.log("\\n===== 3. 模拟 TCP 客户端 =====");

const client = new SimulatedSocket({
  remoteAddress: "127.0.0.1",
  remotePort: 3000,
  localAddress: "127.0.0.1",
  localPort: 54321,
});

// 客户端事件监听
client.on("connect", () => {
  console.log("  [事件] connect - 客户端已连接");
});
client.on("data", (data) => {
  console.log("  [事件] data - 客户端收到:", data.toString().trim());
});
client.on("end", () => {
  console.log("  [事件] end - 服务器关闭了写端");
});
client.on("close", () => {
  console.log("  [事件] close - 连接已关闭");
});
client.on("error", (err) => {
  console.log("  [事件] error -", err.message);
});

// 服务器接受连接
const serverSocket = server._acceptConnection(client);
client.readyState = "open";
client.emit("connect");

// 服务器端事件监听
serverSocket.on("data", (data) => {
  console.log("  [服务器] data - 收到:", data.toString().trim());
  // 服务器回复
  serverSocket.write("Echo: " + data.toString().trim());
});

// ---- 4. 基本通信演示 ----
console.log("\\n===== 4. 基本通信 =====");

setTimeout(() => {
  console.log("客户端发送: Hello Server!");
  client.write("Hello Server!");
}, 20);

setTimeout(() => {
  console.log("客户端发送: 第二条消息");
  client.write("第二条消息");
}, 40);

setTimeout(() => {
  console.log("客户端发送完毕，关闭写端");
  client.end();
}, 60);

// ---- 5. Socket 属性展示 ----
setTimeout(() => {
  console.log("\\n===== 5. Socket 属性 =====");
  const props = {
    remoteAddress: serverSocket.remoteAddress,
    remotePort: serverSocket.remotePort,
    remoteFamily: serverSocket.remoteFamily,
    localAddress: serverSocket.localAddress,
    localPort: serverSocket.localPort,
    bytesRead: serverSocket.bytesRead,
    bytesWritten: serverSocket.bytesWritten,
    readyState: serverSocket.readyState,
  };
  console.table(props);
}, 100);

// ---- 6. TCP 粘包问题模拟 ----
setTimeout(() => {
  console.log("\\n===== 6. TCP 粘包问题模拟 =====");

  // 创建新的服务器和客户端来演示粘包
  const server2 = new SimulatedServer();
  server2.listen(3001);

  const client2 = new SimulatedSocket();
  const serverSock2 = server2._acceptConnection(client2);
  client2.readyState = "open";
  client2.emit("connect");

  // 模拟发送方发送 3 条消息
  console.log("发送方连续发送 3 条消息:");
  client2.write("ABC");
  client2.write("DEF");
  client2.write("GHI");
  console.log("  发送: 'ABC', 'DEF', 'GHI'");

  // 接收方可能收到粘包的数据
  const receivedChunks = [];
  let totalData = "";
  serverSock2.on("data", (chunk) => {
    receivedChunks.push(chunk.toString());
    totalData += chunk.toString();
  });

  setTimeout(() => {
    console.log("\\n接收方实际收到的数据块:");
    receivedChunks.forEach((chunk, i) => {
      console.log("  块" + (i + 1) + ": '" + chunk + "'");
    });

    if (receivedChunks.length === 1) {
      console.log("\\n⚠️  发生粘包！3 条消息被合并成 1 个数据块: '" + totalData + "'");
      console.log("如果没有消息边界，接收方无法区分 ABC、DEF、GHI");
    }

    console.log("\\n粘包原因:");
    console.log("  1. Nagle 算法：合并小的数据包");
    console.log("  2. TCP 是流式协议，没有消息边界");
    console.log("  3. 接收方 read 速度与发送方 write 速度不一致");
  }, 30);
}, 200);

// ---- 7. 粘包解决方案一：分隔符协议 ----
setTimeout(() => {
  console.log("\\n===== 7. 解决方案一：分隔符协议 =====");

  class DelimiterProtocol {
    constructor(delimiter = "\\n") {
      this._delimiter = delimiter;
      this._buffer = "";
    }

    feed(chunk) {
      this._buffer += chunk.toString();
      const messages = [];
      let idx;
      while ((idx = this._buffer.indexOf(this._delimiter)) !== -1) {
        messages.push(this._buffer.slice(0, idx));
        this._buffer = this._buffer.slice(idx + this._delimiter.length);
      }
      return messages;
    }
  }

  const proto = new DelimiterProtocol("\\n");

  // 模拟接收混合数据
  const testData = [
    "message1\\nmessage2\\nmess",  // 不完整
    "age3\\nmessage4\\n",          // 完整 + 新消息
  ];

  console.log("分隔符: '\\\\n'");
  testData.forEach((chunk, i) => {
    console.log("收到数据块" + (i + 1) + ": " + JSON.stringify(chunk));
    const msgs = proto.feed(chunk);
    msgs.forEach((m) => console.log("  → 解析出完整消息: '" + m + "'"));
  });
  console.log("缓冲区剩余: " + JSON.stringify(proto._buffer));

  console.log("\\n优点: 简单直观，适合文本协议");
  console.log("缺点: 消息内容不能包含分隔符（需转义）");
}, 400);

// ---- 8. 粘包解决方案二：长度前缀协议 ----
setTimeout(() => {
  console.log("\\n===== 8. 解决方案二：长度前缀协议 =====");

  class LengthPrefixProtocol {
    constructor(headerSize = 4) {
      this._headerSize = headerSize; // 默认 4 字节头部
      this._buffer = Buffer.alloc(0);
    }

    // 打包消息：4字节长度(大端序) + 消息体
    static pack(message) {
      const body = Buffer.from(message, "utf8");
      const header = Buffer.alloc(4);
      header.writeUInt32BE(body.length, 0);
      return Buffer.concat([header, body]);
    }

    // 喂数据，返回解析出的完整消息
    feed(chunk) {
      this._buffer = Buffer.concat([this._buffer, chunk]);
      const messages = [];

      while (this._buffer.length >= this._headerSize) {
        const bodyLength = this._buffer.readUInt32BE(0);
        const totalLength = this._headerSize + bodyLength;
        if (this._buffer.length < totalLength) break;

        const body = this._buffer.slice(this._headerSize, totalLength);
        messages.push(body.toString("utf8"));
        this._buffer = this._buffer.slice(totalLength);
      }
      return messages;
    }
  }

  // 打包消息
  console.log("打包消息:");
  const packed1 = LengthPrefixProtocol.pack("Hello");
  console.log("  'Hello' →", packed1.toString("hex"), "(" + packed1.length + " 字节)");
  console.log("  头部(4字节):", packed1.slice(0, 4).toString("hex"), "= 长度 5");
  console.log("  消息体:", packed1.slice(4).toString());

  const packed2 = LengthPrefixProtocol.pack("World!");
  console.log("  'World!' →", packed2.toString("hex"), "(" + packed2.length + " 字节)");

  // 模拟接收（粘包）
  const proto = new LengthPrefixProtocol();
  const combined = Buffer.concat([packed1, packed2]);
  console.log("\\n接收方收到粘包数据:", combined.toString("hex"));

  const msgs = proto.feed(combined);
  msgs.forEach((m, i) => console.log("  → 解析出消息" + (i + 1) + ": '" + m + "'"));

  console.log("\\n优点: 支持任意二进制数据，无转义问题");
  console.log("缺点: 额外 4 字节头部开销");
}, 600);

// ---- 9. 背压（Backpressure）处理 ----
setTimeout(() => {
  console.log("\\n===== 9. 背压（Backpressure）处理 =====");

  const bpClient = new SimulatedSocket();
  const bpServer = new SimulatedSocket();
  bpServer.pair(bpClient);

  let drainCount = 0;
  let writeCount = 0;

  bpClient.on("drain", () => {
    drainCount++;
    console.log("  [drain] 缓冲区已排空，可以继续写入 (第" + drainCount + "次)");
  });

  console.log("模拟大量写入，触发背压:");

  // 写入大量数据直到 write 返回 false
  const largeData = Buffer.alloc(32 * 1024, "X"); // 32KB
  for (let i = 0; i < 5; i++) {
    const result = bpClient.write(largeData);
    writeCount++;
    if (!result) {
      console.log(
        "  write() 返回 false (第" + writeCount + "次写入)，缓冲区已满！"
      );
      console.log("  应该暂停写入，等待 drain 事件");
      break;
    }
  }

  console.log("\\n背压处理最佳实践:");
  console.log("  function writeData(socket, data, callback) {");
  console.log("    if (!socket.write(data)) {");
  console.log("      socket.once('drain', callback);");
  console.log("    } else {");
  console.log("      process.nextTick(callback);");
  console.log("    }");
  console.log("  }");
}, 800);

// ---- 10. 半关闭（Half-close）演示 ----
setTimeout(() => {
  console.log("\\n===== 10. 半关闭（Half-close）演示 =====");

  const hcClient = new SimulatedSocket();
  const hcServer = new SimulatedSocket();
  hcServer.pair(hcClient);

  hcServer.on("data", (data) => {
    console.log("  服务器收到:", data.toString().trim());
  });
  hcServer.on("end", () => {
    console.log("  服务器收到 end 事件（客户端不再发送数据）");
    console.log("  但服务器仍可以发送数据！");
    hcServer.write("最后的回复");
    console.log("  服务器发送完毕");
    hcServer.end();
  });

  hcClient.on("data", (data) => {
    console.log("  客户端收到:", data.toString().trim());
  });
  hcClient.on("end", () => {
    console.log("  客户端收到 end 事件");
  });

  // 客户端发送数据后关闭写端
  console.log("客户端发送请求并关闭写端:");
  hcClient.write("请求数据");
  hcClient.end(); // 半关闭：只关写端，读端仍然开放

  console.log("\\nTCP 全双工 + 半关闭 = 灵活的资源管理");
}, 1000);

// ---- 11. 超时处理 ----
setTimeout(() => {
  console.log("\\n===== 11. Socket 超时处理 =====");

  const timeoutSocket = new SimulatedSocket();
  timeoutSocket.on("timeout", () => {
    console.log("  [timeout] Socket 超时（30 秒无活动）");
    console.log("  应关闭连接防止资源泄漏");
    timeoutSocket.destroy();
  });

  timeoutSocket.setTimeout(30);
  console.log("Socket 超时设置为 30ms");
  console.log("（生产环境通常设为 30-60 秒）");
}, 1200);

// ---- 12. 综合总结 ----
setTimeout(() => {
  console.log("\\n===== 12. Net 模块总结 =====");
  console.log("┌──────────────────────────────────────────┐");
  console.log("│ TCP 核心概念                              │");
  console.log("│ • 全双工：双方可同时收发                 │");
  console.log("│ • 流式传输：无消息边界，需处理粘包       │");
  console.log("│ • 可靠传输：确认+重传+有序               │");
  console.log("├──────────────────────────────────────────┤");
  console.log("│ 粘包解决方案                              │");
  console.log("│ • 分隔符：\\\\n 等特殊字符分割            │");
  console.log("│ • 长度前缀：4字节头 + 消息体             │");
  console.log("│ • 固定长度：每条消息大小固定             │");
  console.log("├──────────────────────────────────────────┤");
  console.log("│ Socket 事件流                             │");
  console.log("│ connect → data... → end → close          │");
  console.log("│ drain ← 背压恢复                         │");
  console.log("│ timeout ← 超时警告                        │");
  console.log("└──────────────────────────────────────────┘");
}, 1400);`,
  },

  // =========================================================
  // 第四章：DNS 模块
  // =========================================================
  {
    id: "node-dns",
    title: "DNS 模块",
    icon: "🔍",
    group: "核心模块补充",
    content: `## DNS 模块：域名解析的原理与实践

DNS（Domain Name System，域名系统）是互联网的"电话簿"。当你输入 \`google.com\` 时，DNS 负责将其转换为计算机可以理解的 IP 地址（如 \`142.250.80.46\`）。Node.js 的 \`dns\` 模块提供了这个转换能力。

---

### 一、DNS 基础概念

#### 1.1 DNS 解析流程

当你在浏览器输入 \`www.example.com\` 时，DNS 解析经历以下步骤：

\`\`\`
1. 浏览器缓存 → 2. 操作系统缓存 → 3. 路由器缓存
    ↓（都未命中）
4. 本地 DNS 服务器（ISP 提供）
    ↓
5. 根域名服务器（Root .） → 返回 .com 服务器地址
    ↓
6. .com 顶级域名服务器 → 返回 example.com 的权威 DNS
    ↓
7. example.com 权威 DNS → 返回 www.example.com 的 IP
    ↓
8. 返回给浏览器，浏览器建立 TCP 连接
\`\`\`

#### 1.2 DNS 记录类型

| 记录类型 | 全称 | 说明 | 示例 |
| --- | --- | --- | --- |
| **A** | Address | IPv4 地址 | example.com → 93.184.216.34 |
| **AAAA** | IPv6 Address | IPv6 地址 | example.com → 2606:2800:220:1:248:1893:25c8:1946 |
| **CNAME** | Canonical Name | 别名（指向另一个域名） | www.example.com → example.com |
| **MX** | Mail Exchange | 邮件服务器 | example.com → mail.example.com (priority 10) |
| **NS** | Name Server | 权威 DNS 服务器 | example.com → ns1.example.com |
| **TXT** | Text | 文本信息（常用于 SPF/DKIM 验证） | example.com → "v=spf1 ..." |
| **SRV** | Service | 服务位置 | _sip._tcp.example.com → sipserver:5060 |
| **PTR** | Pointer | 反向解析（IP → 域名） | 93.184.216.34 → example.com |
| **SOA** | Start of Authority | 域管理信息 | 包含主 DNS、管理员邮箱、序列号等 |

---

### 二、dns.lookup vs dns.resolve：核心区别

这是 DNS 模块中最重要、最容易被误解的概念。两者虽然都做域名解析，但底层机制完全不同。

#### 2.1 dns.lookup —— 使用操作系统解析器

\`dns.lookup(hostname, [options], callback)\` 使用操作系统的 \`getaddrinfo()\` 函数进行解析。

\`\`\`javascript
const dns = require('dns');

dns.lookup('example.com', (err, address, family) => {
  console.log('IP 地址:', address);    // 93.184.216.34
  console.log('地址族:', family);      // 4
});
\`\`\`

**特点**：
- 使用操作系统底层的 DNS 解析器（调用 libc 的 getaddrinfo）
- 受操作系统 DNS 缓存影响（如 \`/etc/hosts\` 文件）
- **在 libuv 线程池中执行**（会占用一个线程池线程）
- 默认同时解析 IPv4 和 IPv6（可通过 options 控制）
- 不能指定 DNS 服务器
- 速度较快（有系统缓存）

#### 2.2 dns.resolve —— 使用 libuv 的异步解析器

\`dns.resolve(hostname, [rrtype], callback)\` 使用 libuv 内置的异步 DNS 解析器。

\`\`\`javascript
const dns = require('dns');

dns.resolve4('example.com', (err, addresses) => {
  console.log('IPv4 地址:', addresses);  // ['93.184.216.34']
});

dns.resolveMx('google.com', (err, addresses) => {
  addresses.forEach((mx) => {
    console.log(\`MX: \${mx.exchange}, 优先级: \${mx.priority}\`);
  });
});
\`\`\`

**特点**：
- 使用 libuv 内置的 c-ares 库进行异步 DNS 解析
- **不经过操作系统 DNS 缓存**
- 不在 libuv 线程池中执行（真正的异步 I/O）
- 通过 \`dns.setServers()\` 可以指定 DNS 服务器
- 可以查询特定类型的记录（MX、CNAME、TXT 等）
- 绕过 \`/etc/hosts\` 文件

#### 2.3 核心区别对比表

| 特性 | dns.lookup | dns.resolve |
| --- | --- | --- |
| **底层实现** | 系统 getaddrinfo() | libuv c-ares 库 |
| **执行位置** | libuv 线程池（阻塞线程） | 真正的异步 I/O（不阻塞） |
| **系统 hosts 文件** | 受其影响 | 不受影响 |
| **DNS 缓存** | 使用系统缓存 | 不使用 |
| **自定义 DNS 服务器** | 不支持 | 支持（dns.setServers） |
| **查询特定记录类型** | 只返回 IP 地址 | 支持 MX、CNAME、TXT 等 |
| **并发大量请求** | 可能耗尽线程池 | 更适合高并发 |
| **返回格式** | 单个 IP 字符串 | IP 地址数组 |

#### 2.4 何时使用哪个？

| 场景 | 推荐 |
| --- | --- |
| 一般 HTTP 请求（通过 http 模块） | 使用默认行为（http 模块内部用 lookup） |
| 需要查询 MX/TXT/CNAME 等特定记录 | **dns.resolve** |
| 需要指定 DNS 服务器 | **dns.resolve** |
| 高并发 DNS 查询 | **dns.resolve**（不占用线程池） |
| 需要遵循系统 hosts 配置 | **dns.lookup** |

---

### 三、dns.resolve* 系列方法

#### 3.1 所有 resolve 方法

| 方法 | 查询类型 | 返回值 |
| --- | --- | --- |
| \`dns.resolve(hostname, rrtype)\` | 通用查询 | 根据 rrtype 不同 |
| \`dns.resolve4(hostname)\` | A 记录 | \`string[]\`（IPv4 地址数组） |
| \`dns.resolve6(hostname)\` | AAAA 记录 | \`string[]\`（IPv6 地址数组） |
| \`dns.resolveMx(hostname)\` | MX 记录 | \`object[]\`（\`{exchange, priority}\`） |
| \`dns.resolveCname(hostname)\` | CNAME 记录 | \`string[]\`（规范域名数组） |
| \`dns.resolveNs(hostname)\` | NS 记录 | \`string[]\`（DNS 服务器地址） |
| \`dns.resolveTxt(hostname)\` | TXT 记录 | \`string[][]\`（文本数组的数组） |
| \`dns.resolveSrv(hostname)\` | SRV 记录 | \`object[]\`（\`{name, port, priority, weight}\`） |
| \`dns.resolvePtr(hostname)\` | PTR 记录 | \`string[]\`（域名数组） |
| \`dns.resolveSoa(hostname)\` | SOA 记录 | \`object\`（域管理信息） |
| \`dns.resolveAny(hostname)\` | 所有记录 | \`object[]\`（已废弃，不建议使用） |

#### 3.2 使用示例

\`\`\`javascript
// 查询 MX 记录（邮件服务器）
dns.resolveMx('google.com', (err, addresses) => {
  // [
  //   { exchange: 'aspmx.l.google.com', priority: 10 },
  //   { exchange: 'alt1.aspmx.l.google.com', priority: 20 },
  //   ...
  // ]
});

// 查询 TXT 记录（SPF 验证）
dns.resolveTxt('google.com', (err, records) => {
  // records 是一个二维数组，因为 TXT 记录可能包含多个字符串
  records.forEach(record => {
    console.log(record.join(''));
  });
});
\`\`\`

---

### 四、dns.reverse —— 反向解析

反向解析是 DNS 查询的逆过程：从 IP 地址查找对应的域名。

\`\`\`javascript
dns.reverse('8.8.8.8', (err, hostnames) => {
  console.log(hostnames);  // ['dns.google']
});

dns.reverse('93.184.216.34', (err, hostnames) => {
  console.log(hostnames);  // ['example.com']
});
\`\`\`

**反向解析原理**：DNS 有一个特殊的顶级域 \`arpa\`，用于反向解析。查询 \`8.8.8.8\` 实际上会查询 \`8.8.8.8.in-addr.arpa\` 的 PTR 记录。

---

### 五、dns.setServers —— 设置 DNS 服务器

\`dns.setServers()\` 允许你指定自定义 DNS 服务器（仅影响 \`dns.resolve\` 系列方法，不影响 \`dns.lookup\`）：

\`\`\`javascript
// 使用 Google 的公共 DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// 使用 Cloudflare 的 DNS
dns.setServers(['1.1.1.1', '1.0.0.1']);

// 使用阿里 DNS
dns.setServers(['223.5.5.5', '223.6.6.6']);
\`\`\`

**注意**：
- IP 地址必须包含端口（默认 53），格式如 \`'8.8.8.8:53'\`
- 设置后所有后续的 \`dns.resolve\` 调用都使用新服务器
- 不影响 \`dns.lookup\`（它使用系统 DNS）

---

### 六、DNS 缓存与 TTL

#### 6.1 什么是 TTL？

TTL（Time To Live）是 DNS 记录的有效期（秒）。DNS 服务器会缓存查询结果，在 TTL 过期前不再重新查询。

\`\`\`javascript
// 查询 SOA 记录可以获取 TTL 信息
dns.resolveSoa('example.com', (err, soa) => {
  console.log('最小 TTL:', soa.minimum);  // 如 86400（24小时）
});
\`\`\`

#### 6.2 Node.js 中的 DNS 缓存

Node.js 本身**不内置 DNS 缓存**。但：
- \`dns.lookup\` 受操作系统 DNS 缓存影响
- \`dns.resolve\` 每次都是全新查询，不受缓存影响

如果你的应用需要 DNS 缓存以提高性能，可以自己实现：

\`\`\`javascript
const dnsCache = new Map();
const TTL = 60 * 1000; // 60 秒

async function cachedResolve(hostname) {
  const cached = dnsCache.get(hostname);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.addresses;
  }

  const addresses = await dns.promises.resolve4(hostname);
  dnsCache.set(hostname, { addresses, timestamp: Date.now() });
  return addresses;
}
\`\`\`

---

### 七、dns.promises API

Node.js 10+ 提供了 Promise 版本的 DNS API：

\`\`\`javascript
const dns = require('dns');
const { Resolver } = dns.promises;

// 使用默认解析器
dns.promises.resolve4('example.com')
  .then(addresses => console.log(addresses))
  .catch(err => console.error(err));

// 使用自定义 Resolver 实例
const resolver = new Resolver();
resolver.setServers(['8.8.8.8']);
const addresses = await resolver.resolve4('example.com');
\`\`\`

\`Resolver\` 实例的好处：
- 每个实例可以有不同的 DNS 服务器配置
- 可以独立管理超时和重试
- 不会互相干扰

---

### 八、DNS 解析的性能影响

#### 8.1 每次 HTTP 请求都做 DNS 解析？

\`http\` 模块默认使用 \`dns.lookup\` 进行 DNS 解析。每次 \`http.get()\` 都会触发 DNS 查询。在高并发场景下，这会成为性能瓶颈。

**优化建议**：
1. 使用 \`http.Agent\` 的 \`keepAlive\` 复用连接（同域名只解析一次）
2. 自己实现 DNS 缓存层
3. 使用 IP 直连（跳过 DNS 解析）

\`\`\`javascript
// 使用 keepAlive Agent 复用连接
const http = require('http');
const agent = new http.Agent({ keepAlive: true });

http.get({ hostname: 'example.com', agent }, (res) => {
  // 连接被复用，不会重复 DNS 解析
});
\`\`\`

#### 8.2 dns.lookup 的线程池问题

\`dns.lookup\` 在 libuv 线程池中执行。如果你的应用有大量并发 DNS 查询，线程池可能被耗尽（默认 4 个线程）。如果有大量自定义 DNS 查询，建议使用 \`dns.resolve\`。

---

### 九、DNS over HTTPS (DoH) 概念

传统的 DNS 查询是明文传输的（UDP 53 端口），容易被中间人窃听和篡改。DNS over HTTPS（DoH）通过 HTTPS 加密 DNS 查询，提供更好的隐私保护。

Node.js 目前不原生支持 DoH，但可以通过第三方库实现：

\`\`\`javascript
// 使用 https 模块手动查询 Cloudflare 的 DoH 服务
const https = require('https');

function dohResolve(hostname) {
  return new Promise((resolve, reject) => {
    const url = \`https://cloudflare-dns.com/dns-query?name=\${hostname}&type=A\`;
    https.get(url, {
      headers: { 'Accept': 'application/dns-json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        resolve(json.Answer?.map(a => a.data) || []);
      });
    }).on('error', reject);
  });
}
\`\`\`

---

### 十、常见错误码

| 错误码 | 含义 |
| --- | --- |
| \`ENOTFOUND\` | 域名不存在 |
| \`ENODATA\` | 域名存在但没有请求的记录类型 |
| \`ETIMEOUT\` | DNS 查询超时 |
| \`ESERVFAIL\` | DNS 服务器返回错误 |
| \`ECONNREFUSED\` | DNS 服务器拒绝连接 |
| \`EBADQUERY\` | 查询格式错误 |

下面这段代码演示了 DNS 模块的各种用法，并在安全环境中展示核心概念。`,
    code: `// ============================================================
// 第四章代码演示：DNS 模块——域名解析全解析
// ============================================================
// 尝试加载 dns 模块，沙箱环境中可能不可用，回退到模拟实现
var dns;
try {
  dns = require("dns");
} catch (e) {
  // 模拟 dns 模块（沙箱环境回退方案）
  dns = {
    _servers: ["8.8.8.8"],
    lookup: function (hostname, options, callback) {
      if (typeof options === "function") { callback = options; options = {}; }
      var addresses = { "localhost": "127.0.0.1", "example.com": "93.184.216.34" };
      setTimeout(function () {
        var addr = addresses[hostname] || "93.184.216.34";
        if (options.all) {
          callback(null, [{ address: addr, family: 4 }]);
        } else {
          callback(null, addr, 4);
        }
      }, 10);
    },
    resolve4: function (hostname, callback) {
      setTimeout(function () {
        if (hostname === "thishostdoesnotexist12345.com") {
          callback({ code: "ENOTFOUND", hostname: hostname });
        } else if (hostname === "localhost") {
          callback({ code: "ENODATA" });
        } else {
          callback(null, ["93.184.216.34"]);
        }
      }, 10);
    },
    resolve6: function (hostname, callback) {
      setTimeout(function () {
        callback(null, ["2606:2800:220:1:248:1893:25c8:1946"]);
      }, 10);
    },
    resolveMx: function (hostname, callback) {
      setTimeout(function () {
        if (hostname === "localhost") {
          callback({ code: "ENODATA" });
        } else {
          callback(null, [{ exchange: "aspmx.l.google.com", priority: 10 }]);
        }
      }, 10);
    },
    resolveCname: function (hostname, callback) {
      setTimeout(function () {
        callback(null, ["github.com"]);
      }, 10);
    },
    resolveTxt: function (hostname, callback) {
      setTimeout(function () {
        callback(null, [["v=spf1 include:_spf.google.com ~all"]]);
      }, 10);
    },
    resolveNs: function (hostname, callback) {
      setTimeout(function () {
        callback(null, ["a.iana-servers.net", "b.iana-servers.net"]);
      }, 10);
    },
    reverse: function (ip, callback) {
      setTimeout(function () {
        callback(null, ["dns.google"]);
      }, 10);
    },
    getServers: function () { return this._servers.slice(); },
    setServers: function (servers) { this._servers = servers.slice(); },
    promises: {
      resolve4: function (hostname) {
        return new Promise(function (resolve, reject) {
          dns.resolve4(hostname, function (err, result) {
            if (err) reject(err); else resolve(result);
          });
        });
      },
      resolve6: function (hostname) {
        return new Promise(function (resolve, reject) {
          dns.resolve6(hostname, function (err, result) {
            if (err) reject(err); else resolve(result);
          });
        });
      },
      resolveMx: function (hostname) {
        return new Promise(function (resolve, reject) {
          dns.resolveMx(hostname, function (err, result) {
            if (err) reject(err); else resolve(result);
          });
        });
      },
    },
  };
  console.log("（提示：当前运行在沙箱环境中，dns 模块使用模拟数据）");
}

// ---- 1. dns.lookup：系统级解析 ----
console.log("===== 1. dns.lookup（系统解析器）====");
console.log("特点：使用 getaddrinfo，受 hosts 文件影响，在 libuv 线程池执行");

// 尝试真实查询
dns.lookup("localhost", (err, address, family) => {
  if (err) {
    console.log("  lookup('localhost') 出错:", err.code);
  } else {
    console.log("  lookup('localhost'):");
    console.log("    IP 地址:", address);
    console.log("    地址族:", family, "(4=IPv4, 6=IPv6)");
  }
});

// 查询所有地址
dns.lookup("localhost", { all: true }, (err, addresses) => {
  if (err) {
    console.log("  lookup('localhost', {all:true}) 出错:", err.code);
  } else {
    console.log("\\n  lookup('localhost', {all:true}):");
    addresses.forEach((addr) => {
      console.log("    " + addr.address + " (IPv" + addr.family + ")");
    });
  }
});

// ---- 2. dns.resolve4：IPv4 地址解析 ----
setTimeout(() => {
  console.log("\\n===== 2. dns.resolve4（IPv4 解析）====");
  console.log("特点：使用 c-ares 库，绕过系统缓存，不占用线程池");

  // 尝试真实解析
  dns.resolve4("example.com", (err, addresses) => {
    if (err) {
      console.log("  resolve4('example.com') 出错:", err.code);
      console.log("  （沙箱环境可能无法进行网络DNS查询）");
    } else {
      console.log("  example.com 的 IPv4 地址:");
      addresses.forEach((addr) => console.log("    " + addr));
    }
  });

  // 查询一个可能有多个 IP 的域名
  dns.resolve4("google.com", (err, addresses) => {
    if (err) {
      console.log("  resolve4('google.com') 出错:", err.code);
    } else {
      console.log("\\n  google.com 的 IPv4 地址:");
      addresses.forEach((addr) => console.log("    " + addr));
    }
  });
}, 100);

// ---- 3. dns.resolveMx：邮件服务器查询 ----
setTimeout(() => {
  console.log("\\n===== 3. dns.resolveMx（MX 邮件记录）====");

  dns.resolveMx("google.com", (err, addresses) => {
    if (err) {
      console.log("  resolveMx('google.com') 出错:", err.code);
    } else {
      console.log("  google.com 的邮件服务器:");
      addresses
        .sort((a, b) => a.priority - b.priority)
        .forEach((mx) => {
          console.log("    优先级 " + mx.priority + ": " + mx.exchange);
        });
    }
  });
}, 200);

// ---- 4. dns.resolveCname：别名解析 ----
setTimeout(() => {
  console.log("\\n===== 4. dns.resolveCname（CNAME 别名）====");

  dns.resolveCname("www.github.com", (err, addresses) => {
    if (err) {
      console.log("  resolveCname('www.github.com') 出错:", err.code);
    } else {
      console.log("  www.github.com 的 CNAME:");
      addresses.forEach((cname) => console.log("    " + cname));
    }
  });
}, 300);

// ---- 5. dns.resolveTxt：TXT 记录查询 ----
setTimeout(() => {
  console.log("\\n===== 5. dns.resolveTxt（TXT 记录）====");

  dns.resolveTxt("google.com", (err, records) => {
    if (err) {
      console.log("  resolveTxt('google.com') 出错:", err.code);
    } else {
      console.log("  google.com 的 TXT 记录:");
      records.forEach((record, i) => {
        console.log("    [" + i + "]: " + record.join("").slice(0, 80) + "...");
      });
    }
  });
}, 400);

// ---- 6. dns.resolveNs：权威 DNS 服务器 ----
setTimeout(() => {
  console.log("\\n===== 6. dns.resolveNs（NS 记录）====");

  dns.resolveNs("example.com", (err, addresses) => {
    if (err) {
      console.log("  resolveNs('example.com') 出错:", err.code);
    } else {
      console.log("  example.com 的权威 DNS:");
      addresses.forEach((ns) => console.log("    " + ns));
    }
  });
}, 500);

// ---- 7. dns.reverse：反向解析 ----
setTimeout(() => {
  console.log("\\n===== 7. dns.reverse（反向解析）====");

  dns.reverse("8.8.8.8", (err, hostnames) => {
    if (err) {
      console.log("  reverse('8.8.8.8') 出错:", err.code);
    } else {
      console.log("  8.8.8.8 的反向解析:");
      hostnames.forEach((name) => console.log("    " + name));
    }
  });

  // 反向解析的原理
  console.log("\\n  反向解析原理:");
  console.log("  查询 8.8.8.8 的 PTR 记录");
  console.log("  = 查询 8.8.8.8.in-addr.arpa 的 PTR");
  console.log("  (IP 地址倒序 + .in-addr.arpa)");
}, 600);

// ---- 8. dns.setServers：自定义 DNS 服务器 ----
setTimeout(() => {
  console.log("\\n===== 8. dns.setServers（自定义 DNS）====");

  // 获取当前 DNS 服务器
  console.log("  当前 DNS 服务器:", dns.getServers());

  // 设置为 Google 公共 DNS
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("  设置后 DNS 服务器:", dns.getServers());

  // 验证新 DNS 服务器是否生效
  dns.resolve4("example.com", (err, addresses) => {
    if (err) {
      console.log("  使用 Google DNS 查询出错:", err.code);
    } else {
      console.log("  使用 Google DNS 查询 example.com:", addresses);
    }
  });

  console.log("\\n  常用公共 DNS:");
  console.log("    Google:    8.8.8.8 / 8.8.4.4");
  console.log("    Cloudflare: 1.1.1.1 / 1.0.0.1");
  console.log("    阿里:      223.5.5.5 / 223.6.6.6");
  console.log("    腾讯:      119.29.29.29 / 182.254.116.116");
}, 700);

// ---- 9. dns.promises Promise API ----
setTimeout(() => {
  console.log("\\n===== 9. dns.promises（Promise API）====");

  async function promiseDemo() {
    try {
      // 并行查询多个记录
      const [ipv4, ipv6, mx] = await Promise.all([
        dns.promises.resolve4("google.com").catch(() => ["N/A"]),
        dns.promises.resolve6("google.com").catch(() => ["N/A"]),
        dns.promises.resolveMx("google.com").catch(() => []),
      ]);

      console.log("  IPv4:", ipv4.slice(0, 2).join(", "));
      console.log("  IPv6:", ipv6[0] ? ipv6[0].slice(0, 30) + "..." : "N/A");
      console.log("  MX 数量:", mx.length);
      if (mx.length > 0) {
        console.log("  首选 MX:", mx[0].exchange, "(优先级 " + mx[0].priority + ")");
      }
    } catch (err) {
      console.log("  Promise 查询出错:", err.code);
    }

    // 时序对比
    console.log("\\n  时序对比（dns.lookup vs dns.resolve4）:");
    const start1 = Date.now();
    dns.lookup("localhost", () => {
      console.log("    lookup 耗时:", Date.now() - start1, "ms");
    });

    const start2 = Date.now();
    dns.resolve4("localhost").then(() => {
      console.log("    resolve4 耗时:", Date.now() - start2, "ms");
    }).catch(() => {});
  }

  promiseDemo();
}, 800);

// ---- 10. DNS 缓存模拟 ----
setTimeout(() => {
  console.log("\\n===== 10. DNS 缓存策略模拟 =====");

  class DNSCache {
    constructor(ttlMs = 60000) {
      this._cache = new Map();
      this._ttl = ttlMs;
    }

    async resolve(hostname) {
      const cached = this._cache.get(hostname);
      if (cached && Date.now() - cached.timestamp < this._ttl) {
        console.log("    [缓存命中] " + hostname + " → " + cached.addresses.join(", "));
        return cached.addresses;
      }

      console.log("    [缓存未命中] " + hostname + "，发起真实查询");
      try {
        const addresses = await dns.promises.resolve4(hostname);
        this._cache.set(hostname, { addresses, timestamp: Date.now() });
        return addresses;
      } catch (err) {
        throw err;
      }
    }

    getStats() {
      return {
        entries: this._cache.size,
        ttl: this._ttl + "ms",
        hosts: Array.from(this._cache.keys()),
      };
    }

    clear() {
      this._cache.clear();
    }
  }

  async function cacheDemo() {
    const cache = new DNSCache(30000); // 30 秒 TTL

    // 第一次查询（缓存未命中）
    console.log("  第一次查询 example.com:");
    await cache.resolve("example.com").catch((e) => console.log("    查询失败:", e.code));

    // 第二次查询（缓存命中）
    console.log("\\n  第二次查询 example.com:");
    await cache.resolve("example.com").catch(() => {});

    console.log("\\n  缓存统计:", JSON.stringify(cache.getStats()));
    console.log("\\n  缓存策略:");
    console.log("    • TTL 过期后自动失效");
    console.log("    • 内存缓存，重启后丢失");
    console.log("    • 适合高频查询的域名");
  }

  cacheDemo();
}, 1000);

// ---- 11. lookup vs resolve 深度对比 ----
setTimeout(() => {
  console.log("\\n===== 11. dns.lookup vs dns.resolve 深度对比 =====");

  const comparison = [
    {
      特性: "底层实现",
      lookup: "系统 getaddrinfo()",
      resolve: "libuv c-ares 库",
    },
    {
      特性: "执行位置",
      lookup: "libuv 线程池（阻塞线程）",
      resolve: "真正异步 I/O（不阻塞）",
    },
    {
      特性: "系统 hosts 文件",
      lookup: "受其影响",
      resolve: "不受影响",
    },
    {
      特性: "系统 DNS 缓存",
      lookup: "使用系统缓存",
      resolve: "不使用",
    },
    {
      特性: "自定义 DNS 服务器",
      lookup: "不支持",
      resolve: "支持（setServers）",
    },
    {
      特性: "查询特定记录类型",
      lookup: "只返回 IP",
      resolve: "支持 MX/CNAME/TXT 等",
    },
    {
      特性: "并发大量请求",
      lookup: "可能耗尽线程池",
      resolve: "更适合高并发",
    },
    {
      特性: "http 模块默认",
      lookup: "是（内部使用）",
      resolve: "否",
    },
  ];

  console.table(comparison);
}, 1200);

// ---- 12. DNS 错误码演示 ----
setTimeout(() => {
  console.log("\\n===== 12. DNS 常见错误码 =====");

  // 查询一个不存在的域名
  dns.resolve4("thishostdoesnotexist12345.com", (err) => {
    if (err) {
      console.log("  ENOTFOUND: 域名不存在");
      console.log("    code:", err.code);
      console.log("    hostname:", err.hostname);
    }
  });

  // 查询一个存在但无 MX 记录的域名
  setTimeout(() => {
    dns.resolveMx("localhost", (err) => {
      if (err) {
        console.log("\\n  ENODATA: 域名存在但无对应记录类型");
        console.log("    code:", err.code);
        console.log("    （localhost 没有 MX 记录）");
      }
    });
  }, 100);
}, 1400);

// ---- 13. 综合总结 ----
setTimeout(() => {
  console.log("\\n===== 13. DNS 模块总结 =====");
  console.log("┌──────────────────────────────────────────┐");
  console.log("│ DNS 查询方法选择指南                      │");
  console.log("│                                           │");
  console.log("│ 一般 HTTP 请求 → 默认行为（lookup）      │");
  console.log("│ 查询 MX/TXT/CNAME → dns.resolve*()       │");
  console.log("│ 自定义 DNS 服务器 → dns.resolve + setServers │");
  console.log("│ 高并发 DNS 查询 → dns.resolve            │");
  console.log("│ 需要系统 hosts 生效 → dns.lookup          │");
  console.log("│ 现代异步代码 → dns.promises               │");
  console.log("├──────────────────────────────────────────┤");
  console.log("│ 关键区别                                  │");
  console.log("│ lookup  = 系统解析器 + 线程池              │");
  console.log("│ resolve = c-ares 库 + 真正异步 I/O        │");
  console.log("└──────────────────────────────────────────┘");
}, 1800);`,
  },

  // =========================================================
  // 第五章：TLS/SSL 模块
  // =========================================================
  {
    id: "node-tls",
    title: "TLS/SSL 模块",
    icon: "🔐",
    group: "核心模块补充",
    content: `## TLS/SSL 模块：网络安全的基石

TLS（Transport Layer Security，传输层安全协议）及其前身 SSL（Secure Sockets Layer）是保障互联网通信安全的核心协议。每次你访问 HTTPS 网站、使用加密的 API、或通过安全 WebSocket 通信，背后都是 TLS 在工作。

---

### 一、TLS/SSL 协议基础

#### 1.1 为什么需要 TLS？

在 TCP 层面，数据是明文传输的。任何能够截获网络包的人都可以读取其中的内容。TLS 在 TCP 之上添加了三个关键保障：

| 保障 | 说明 | 实现方式 |
| --- | --- | --- |
| **加密（Encryption）** | 数据在传输过程中被加密，无法被窃听 | 对称加密（AES、ChaCha20） |
| **身份验证（Authentication）** | 确认通信对方的身份，防止中间人攻击 | 非对称加密 + 证书链 |
| **完整性（Integrity）** | 确保数据在传输过程中未被篡改 | MAC（Message Authentication Code） |

#### 1.2 TLS 协议在协议栈中的位置

\`\`\`
┌─────────────────┐
│   HTTP / SMTP   │ ← 应用层
├─────────────────┤
│      TLS        │ ← 安全层（本章重点）
├─────────────────┤
│      TCP        │ ← 传输层
├─────────────────┤
│       IP        │ ← 网络层
└─────────────────┘
\`\`\`

TLS 运行在 TCP 之上、应用层协议之下。它不改变应用层协议的逻辑，只是在传输过程中加了一层"保护壳"。

#### 1.3 TLS 握手过程（简化版）

TLS 握手是建立安全连接的第一步，也是最复杂的过程：

\`\`\`
客户端                                    服务器
  │                                         │
  │── ClientHello ──────────────────────▶  │
  │   (支持的TLS版本、密码套件、随机数)     │
  │                                         │
  │◀── ServerHello ──────────────────────  │
  │   (选定的TLS版本、密码套件、随机数)     │
  │◀── Certificate ──────────────────────  │
  │   (服务器的证书链)                     │
  │◀── ServerHelloDone ────────────────    │
  │                                         │
  │── ClientKeyExchange ────────────────▶  │
  │   (用服务器公钥加密的预主密钥)         │
  │── ChangeCipherSpec ────────────────▶   │
  │── Finished ────────────────────────▶   │
  │                                         │
  │◀── ChangeCipherSpec ────────────────   │
  │◀── Finished ────────────────────────   │
  │                                         │
  │◀════ 安全通道建立，开始加密通信 ════▶  │
\`\`\`

**握手的关键步骤**：
1. **协商加密参数**：客户端和服务器就 TLS 版本、加密算法达成一致
2. **身份验证**：服务器发送证书证明身份（可选双向认证）
3. **密钥交换**：双方通过非对称加密安全地交换"会话密钥"
4. **切换到加密通信**：后续所有数据使用会话密钥进行对称加密

---

### 二、对称加密 vs 非对称加密

TLS 同时使用两种加密方式，取长补短：

#### 2.1 对称加密

使用**同一个密钥**进行加密和解密：

| 特性 | 说明 |
| --- | --- |
| 速度 | **快**（适合大量数据加密） |
| 密钥管理 | 困难（如何安全地共享密钥？） |
| 常用算法 | AES-256-GCM、ChaCha20-Poly1305 |
| TLS 中的用途 | 加密实际传输的数据（会话密钥） |

#### 2.2 非对称加密

使用**一对密钥**（公钥和私钥）：

| 特性 | 说明 |
| --- | --- |
| 速度 | **慢**（不适合大量数据） |
| 密钥管理 | 简单（公钥可以公开，私钥保密） |
| 常用算法 | RSA、ECDSA、Ed25519 |
| TLS 中的用途 | 握手阶段交换会话密钥、验证证书 |

#### 2.3 TLS 1.3 的改进

TLS 1.3 相比 TLS 1.2 做了重大简化：

| 改进 | TLS 1.2 | TLS 1.3 |
| --- | --- | --- |
| 握手往返次数 | 2-RTT | 1-RTT（或 0-RTT 恢复） |
| 支持的密钥交换 | RSA、DHE、ECDHE | 仅 ECDHE（前向安全性） |
| 密码套件数量 | 数十个 | 5 个（简化且更安全） |
| 过时算法 | 支持 RC4、DES、MD5 | 全部移除 |

---

### 三、证书与 CA 体系

#### 3.1 证书是什么？

证书是一个**数字文档**，包含以下信息：
- 域名（Subject/CNAME）
- 颁发者（Issuer，即 CA）
- 有效期（Not Before / Not After）
- 公钥
- 签名（CA 用其私钥对上述信息签名）

#### 3.2 证书链

浏览器信任的不是服务器证书，而是**根 CA 证书**。通过证书链验证：

\`\`\`
根 CA 证书（信任锚点，预装在操作系统/浏览器中）
  └── 中间 CA 证书（由根 CA 签名）
        └── 服务器证书（由中间 CA 签名）
\`\`\`

#### 3.3 自签名证书 vs CA 证书

| 特性 | 自签名证书 | CA 签发证书 |
| --- | --- | --- |
| 颁发者 | 自己 | 受信任的 CA（如 Let's Encrypt） |
| 浏览器信任 | ❌ 不信任（显示警告） | ✅ 自动信任 |
| 费用 | 免费 | 免费（Let's Encrypt）或付费 |
| 适用场景 | 开发/测试/内网 | 生产环境 |
| 生成方式 | openssl 自签 | 向 CA 申请 |

\`\`\`bash
# 生成自签名证书（开发用）
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
\`\`\`

---

### 四、Node.js 中创建 TLS 服务器

#### 4.1 tls.createServer

\`\`\`javascript
const tls = require('tls');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server-key.pem'),   // 私钥
  cert: fs.readFileSync('server-cert.pem'), // 证书
  // 可选：CA 证书（用于客户端认证）
  ca: fs.readFileSync('ca-cert.pem'),
  // 可选：要求客户端证书
  requestCert: true,
  rejectUnauthorized: true,  // 拒绝无效证书
};

const server = tls.createServer(options, (socket) => {
  console.log('安全连接已建立');
  console.log('客户端已授权:', socket.authorized);
  console.log('客户端证书:', socket.getPeerCertificate());

  socket.write('欢迎使用 TLS 安全连接!');
  socket.setEncoding('utf8');
  socket.on('data', (data) => {
    console.log('收到:', data);
  });
});

server.listen(8443, () => {
  console.log('TLS 服务器监听在 8443 端口');
});
\`\`\`

#### 4.2 tls.connect（客户端）

\`\`\`javascript
const tls = require('tls');

const options = {
  host: 'localhost',
  port: 8443,
  // 如果不验证证书（仅开发环境！）
  rejectUnauthorized: false,
  // 或提供 CA 证书进行验证
  // ca: fs.readFileSync('ca-cert.pem'),
};

const socket = tls.connect(options, () => {
  console.log('已连接到 TLS 服务器');
  console.log('服务器证书:', socket.getPeerCertificate());
  socket.write('Hello Secure World!');
});

socket.on('data', (data) => {
  console.log('收到:', data.toString());
});
\`\`\`

---

### 五、ALPN / NPN 协议协商

ALPN（Application-Layer Protocol Negotiation）允许客户端和服务器在 TLS 握手阶段协商应用层协议（如 HTTP/2 或 HTTP/1.1）：

\`\`\`javascript
const server = tls.createServer({
  ALPNProtocols: ['h2', 'http/1.1'],  // 服务器支持的协议
  key, cert
}, (socket) => {
  console.log('协商的协议:', socket.alpnProtocol);  // 'h2' 或 'http/1.1'
});

// 客户端
const socket = tls.connect({
  ALPNProtocols: ['h2', 'http/1.1'],
  host, port
}, () => {
  console.log('协商的协议:', socket.alpnProtocol);
});
\`\`\`

---

### 六、SNI（Server Name Indication）

SNI 允许在同一 IP 地址上托管多个 TLS 站点（虚拟主机）。在 TLS 握手的 ClientHello 中包含目标域名，服务器据此选择正确的证书：

\`\`\`javascript
const server = tls.createServer((socket) => {
  // SNI 回调：在握手期间触发
});

server.on('secureConnection', (socket) => {
  console.log('SNI 域名:', socket.servername);
});

// 或者使用 SNICallback
const options = {
  SNICallback: (servername, cb) => {
    // 根据域名动态选择证书
    if (servername === 'site1.example.com') {
      cb(null, tls.createSecureContext({
        key: site1Key, cert: site1Cert
      }));
    } else {
      cb(null, tls.createSecureContext({
        key: defaultKey, cert: defaultCert
      }));
    }
  }
};
\`\`\`

---

### 七、安全配置最佳实践

#### 7.1 禁用弱密码

\`\`\`javascript
const server = tls.createServer({
  key, cert,
  // 只允许安全的密码套件
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
  ].join(':'),
  // 要求最低 TLS 1.2
  minVersion: 'TLSv1.2',
  // 禁用不安全的 TLS 1.0/1.1
  maxVersion: 'TLSv1.3',
});
\`\`\`

#### 7.2 安全配置检查清单

| 配置项 | 推荐设置 |
| --- | --- |
| 最低 TLS 版本 | TLS 1.2（建议 TLS 1.3） |
| 密码套件 | 仅允许 ECDHE + AEAD（如 AES-GCM、ChaCha20-Poly1305） |
| 证书密钥长度 | RSA 2048+ 或 ECDSA P-256+ |
| 证书有效期 | 不超过 90 天（Let's Encrypt 标准） |
| HSTS | 开启（Strict-Transport-Security） |
| 证书验证 | \`rejectUnauthorized: true\`（生产环境必须） |

#### 7.3 常见安全漏洞防护

| 漏洞 | 说明 | 防护 |
| --- | --- | --- |
| POODLE | 利用 SSL 3.0 的 CBC 模式缺陷 | 禁用 SSL 3.0 |
| BEAST | 利用 TLS 1.0 的 CBC 缺陷 | 使用 TLS 1.2+ |
| CRIME/BREACH | 利用压缩率泄露信息 | 禁用 TLS 压缩 |
| Heartbleed | OpenSSL 心跳扩展的越界读取 | 升级 OpenSSL |
| 降级攻击 | 强制使用低版本协议 | 禁用旧协议版本 |

---

### 八、TLS 与 crypto 模块的关系

TLS 模块底层依赖 \`crypto\` 模块完成加密、解密、签名、哈希等操作。crypto 模块提供了 TLS 所需的全部密码学原语：

\`\`\`javascript
// crypto 模块提供 TLS 需要的密码学操作
const crypto = require('crypto');

// 1. 生成密钥对（模拟 TLS 握手中的密钥交换）
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// 2. 哈希计算（证书签名验证中使用）
const hash = crypto.createHash('sha256').update('data').digest('hex');

// 3. 对称加密（TLS 会话加密）
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
\`\`\`

---

### 九、最佳实践

1. **生产环境必须使用 CA 签发的证书**（Let's Encrypt 免费）
2. **私钥绝不要提交到版本控制**（使用 .gitignore）
3. **定期更新证书**（Let's Encrypt 证书 90 天过期，建议自动续期）
4. **开启 HSTS** 防止降级攻击
5. **使用 TLS 1.3** 获得更好的安全性和性能
6. **禁用不安全的密码套件**
7. **使用 Mozilla SSL Configuration Generator** 生成安全的配置

下面这段代码使用 crypto 模块模拟 TLS 握手、证书验证和加密通信。`,
    code: `// ============================================================
// 第五章代码演示：TLS/SSL 概念模拟（crypto + 对象字面量）
// ============================================================
// 沙箱中无法创建真正的 TLS 服务器/客户端，但 crypto 模块可用。
// 以下代码用 crypto 生成密钥对，模拟 TLS 握手和加密通信。

const crypto = require("crypto");

// ---- 1. 对称加密 vs 非对称加密对比 ----
console.log("===== 1. 对称加密 vs 非对称加密 =====");

// 1a. 对称加密：同一个密钥加密和解密
console.log("--- 对称加密（AES-256-GCM）---");
const symmetricKey = crypto.randomBytes(32); // 256 位密钥
const iv = crypto.randomBytes(12); // 96 位初始化向量

// 加密
const cipher = crypto.createCipheriv("aes-256-gcm", symmetricKey, iv);
let encrypted = cipher.update("这是需要加密的敏感数据", "utf8", "hex");
encrypted += cipher.final("hex");
const authTag = cipher.getAuthTag(); // 认证标签，用于完整性验证
console.log("  原始数据: 这是需要加密的敏感数据");
console.log("  加密后(hex):", encrypted.slice(0, 40) + "...");
console.log("  认证标签:", authTag.toString("hex"));
console.log("  密钥(hex):", symmetricKey.toString("hex").slice(0, 20) + "...");

// 解密
const decipher = crypto.createDecipheriv("aes-256-gcm", symmetricKey, iv);
decipher.setAuthTag(authTag);
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
console.log("  解密后:", decrypted);
console.log("  特点: 加解密用同一个密钥，速度快");

// 1b. 非对称加密：公钥加密，私钥解密
console.log("\\n--- 非对称加密（RSA-2048）---");
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// 公钥加密
const plaintext = "会话密钥内容";
const encrypted2 = crypto.publicEncrypt(
  publicKey,
  Buffer.from(plaintext, "utf8")
);
console.log("  原始数据:", plaintext);
console.log("  公钥加密后:", encrypted2.toString("base64").slice(0, 40) + "...");

// 私钥解密
const decrypted2 = crypto.privateDecrypt(privateKey, encrypted2);
console.log("  私钥解密后:", decrypted2.toString("utf8"));
console.log("  特点: 加解密用不同密钥，安全但速度慢");

// ---- 2. 模拟 TLS 握手中的密钥交换 ----
console.log("\\n===== 2. TLS 握手密钥交换模拟 =====");

/**
 * 模拟 TLS 握手过程：
 * 1. 客户端生成随机数
 * 2. 服务器发送证书（含公钥）
 * 3. 客户端用服务器公钥加密"预主密钥"
 * 4. 双方用预主密钥 + 随机数生成会话密钥
 */
function simulateTLSHandshake() {
  console.log("--- TLS 握手开始 ---");

  // 步骤1: 客户端生成随机数
  const clientRandom = crypto.randomBytes(32);
  console.log("1. 客户端生成随机数:", clientRandom.toString("hex").slice(0, 20) + "...");

  // 步骤2: 服务器生成密钥对（模拟证书中的公钥）
  const serverKeys = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const serverRandom = crypto.randomBytes(32);
  console.log("2. 服务器→客户端: 证书(含公钥) + 随机数");
  console.log("   服务器随机数:", serverRandom.toString("hex").slice(0, 20) + "...");

  // 步骤3: 客户端生成预主密钥，用服务器公钥加密
  const preMasterSecret = crypto.randomBytes(48); // 48字节预主密钥
  const encryptedPMS = crypto.publicEncrypt(
    serverKeys.publicKey,
    preMasterSecret
  );
  console.log("3. 客户端: 生成预主密钥，用服务器公钥加密后发送");
  console.log("   加密的预主密钥:", encryptedPMS.toString("hex").slice(0, 30) + "...");

  // 步骤4: 服务器用私钥解密预主密钥
  const decryptedPMS = crypto.privateDecrypt(
    serverKeys.privateKey,
    encryptedPMS
  );
  console.log("4. 服务器: 用私钥解密获得预主密钥");

  // 步骤5: 双方用 PRF（伪随机函数）生成会话密钥
  const seed = Buffer.concat([clientRandom, serverRandom]);
  const masterSecret = crypto
    .createHmac("sha256", decryptedPMS)
    .update(seed)
    .digest();
  console.log("5. 双方生成会话密钥:", masterSecret.toString("hex").slice(0, 20) + "...");

  console.log("--- TLS 握手完成，后续通信使用会话密钥 ---");
  return masterSecret;
}

const sessionKey = simulateTLSHandshake();

// ---- 3. 用会话密钥加密通信 ----
console.log("\\n===== 3. TLS 加密通信模拟 =====");

function encryptWithSessionKey(key, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key.slice(0, 32), iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("hex"), encrypted, tag: tag.toString("hex") };
}

function decryptWithSessionKey(key, encryptedData) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key.slice(0, 32),
    Buffer.from(encryptedData.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));
  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// 加密消息
const message1 = "GET /api/users HTTP/1.1";
const encrypted1 = encryptWithSessionKey(sessionKey, message1);
console.log("客户端发送(加密):", encrypted1.encrypted.slice(0, 40) + "...");

// 解密消息
const decrypted1 = decryptWithSessionKey(sessionKey, encrypted1);
console.log("服务器解密后:", decrypted1);

// 双向通信
const response = 'HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\n\\r\\n{"users":[]}';
const encryptedResp = encryptWithSessionKey(sessionKey, response);
console.log("服务器回复(加密):", encryptedResp.encrypted.slice(0, 40) + "...");
const decryptedResp = decryptWithSessionKey(sessionKey, encryptedResp);
console.log("客户端解密后:", decryptedResp.slice(0, 50) + "...");

// ---- 4. 证书验证模拟（签名验证） ----
console.log("\\n===== 4. 证书签名验证模拟 =====");

// 模拟 CA 用自己的私钥签发证书
const caKeys = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// 证书内容
const certificate = {
  subject: "example.com",
  issuer: "Trusted CA",
  validFrom: "2024-01-01",
  validTo: "2025-01-01",
  publicKey: publicKey,
};

// CA 对证书签名
const sign = crypto.createSign("sha256");
sign.update(JSON.stringify(certificate));
const signature = sign.sign(caKeys.privateKey, "base64");
console.log("CA 签发了证书:");
console.log("  域名:", certificate.subject);
console.log("  签发者:", certificate.issuer);
console.log("  签名:", signature.slice(0, 30) + "...");

// 客户端验证证书签名
const verify = crypto.createVerify("sha256");
verify.update(JSON.stringify(certificate));
const isValid = verify.verify(caKeys.publicKey, signature, "base64");
console.log("\\n客户端验证证书:");
console.log("  签名验证:", isValid ? "✅ 通过" : "❌ 失败");

// 模拟篡改证书
const tamperedCert = { ...certificate, subject: "evil.com" };
const verify2 = crypto.createVerify("sha256");
verify2.update(JSON.stringify(tamperedCert));
const isValid2 = verify2.verify(caKeys.publicKey, signature, "base64");
console.log("  篡改后验证:", isValid2 ? "✅ 通过（危险！）" : "❌ 失败（证书被篡改！）");

// ---- 5. 哈希与完整性校验 ----
console.log("\\n===== 5. 哈希与完整性校验 =====");

const data = "重要数据，不能篡改";
const hash = crypto.createHash("sha256").update(data).digest("hex");
console.log("原始数据:", data);
console.log("SHA-256 哈希:", hash);

// 验证数据完整性
const receivedData = "重要数据，不能篡改";
const receivedHash = crypto
  .createHash("sha256")
  .update(receivedData)
  .digest("hex");
console.log("\\n完整性验证:", hash === receivedHash ? "✅ 数据完整" : "❌ 数据被篡改");

// 模拟篡改
const tamperedData = "重要数据，已被篡改";
const tamperedHash = crypto
  .createHash("sha256")
  .update(tamperedData)
  .digest("hex");
console.log("篡改后验证:", hash === tamperedHash ? "一致" : "❌ 不一致（检测到篡改）");

// ---- 6. TLS 安全配置总结 ----
console.log("\\n===== 6. TLS 安全配置最佳实践 =====");
console.log("┌──────────────────────────────────────────┐");
console.log("│ TLS 安全配置清单                          │");
console.log("│ • 最低版本: TLS 1.2（推荐 1.3）          │");
console.log("│ • 密码套件: 仅 ECDHE + AEAD             │");
console.log("│ • 密钥长度: RSA 2048+ 或 ECDSA P-256+   │");
console.log("│ • 证书管理: Let's Encrypt 自动续期      │");
console.log("│ • 禁用: SSLv3, TLS 1.0, TLS 1.1         │");
console.log("│ • 开启: HSTS, OSCP Stapling              │");
console.log("├──────────────────────────────────────────┤");
console.log("│ 两种加密方式                              │");
console.log("│ 对称加密: 速度快，适合大量数据（AES）    │");
console.log("│ 非对称加密: 安全，但慢（RSA/ECDSA）      │");
console.log("│ TLS 组合: 握手用非对称，通信用对称       │");
console.log("└──────────────────────────────────────────┘");`,
  },

  // =========================================================
  // 第六章：HTTP/2 与 HTTP/3
  // =========================================================
  {
    id: "node-http2",
    title: "HTTP/2 与 HTTP/3",
    icon: "🚄",
    group: "核心模块补充",
    content: `## HTTP/2 与 HTTP/3：下一代 HTTP 协议

HTTP/2 和 HTTP/3 是 HTTP 协议的最新迭代，它们解决了 HTTP/1.1 的许多固有问题。Node.js 从 v8.4 开始提供 http2 模块，支持 HTTP/2 服务器和客户端。

---

### 一、HTTP/1.1 的局限性

#### 1.1 队头阻塞（Head-of-Line Blocking）

HTTP/1.1 在一个 TCP 连接上，请求必须按顺序处理。如果第一个请求慢，后面所有请求都得等：

\`\`\`
连接1: [请求1]────────────[响应1]────────────[请求3]──[响应3]
                       ↑ 请求1 慢，阻塞了请求2 和请求3
连接2: [请求2]────────────[响应2]
\`\`\`

这导致浏览器通常需要打开 6-8 个并发 TCP 连接来并行加载资源，但每个连接都有队头阻塞问题。

#### 1.2 多连接开销

| 问题 | 说明 |
| --- | --- |
| 连接数限制 | 浏览器通常限制同域名 6-8 个并发连接 |
| 连接建立成本 | 每个连接都需要 TCP 三次握手 + TLS 握手 |
| 带宽竞争 | 多个 TCP 连接互相竞争带宽 |
| 连接管理复杂 | 需要维护连接池、超时重连等逻辑 |

#### 1.3 头部冗余

HTTP/1.1 每次请求都发送完整的头部（Cookie、User-Agent 等），这些头部在多次请求中大量重复：

\`\`\`http
GET /page1 HTTP/1.1
Host: example.com
Cookie: session_id=abc123...(500字节)
User-Agent: Mozilla/5.0...(200字节)
Accept: text/html,application/xhtml+xml...(100字节)

GET /page2 HTTP/1.1
Host: example.com
Cookie: session_id=abc123...(500字节)  ← 完全重复！
User-Agent: Mozilla/5.0...(200字节)    ← 完全重复！
Accept: text/html,application/xhtml+xml...(100字节) ← 完全重复！
\`\`\`

---

### 二、HTTP/2 核心特性

HTTP/2 不改变 HTTP 的语义（方法、状态码、URI 等），但完全改变了传输方式。

#### 2.1 多路复用（Multiplexing）

HTTP/2 在一个 TCP 连接上可以同时发送多个请求和响应，这些请求/响应被分解为**帧（Frame）**，交错传输：

\`\`\`
HTTP/1.1:
连接: [请求1──────────响应1──────────][请求2──响应2]

HTTP/2:
连接: [帧1.1][帧2.1][帧1.2][帧2.2][帧1.3][帧2.3]...
       ↑ 请求1和请求2的帧交错传输，互不阻塞
\`\`\`

#### 2.2 二进制帧（Binary Framing）

HTTP/2 将数据分解为二进制帧。每个帧有类型标识：

| 帧类型 | 说明 |
| --- | --- |
| DATA | 传输 HTTP 消息体 |
| HEADERS | 传输 HTTP 头部 |
| PRIORITY | 指定流的优先级 |
| RST_STREAM | 终止流 |
| SETTINGS | 连接级别的参数协商 |
| PUSH_PROMISE | 服务器推送通知 |
| PING | 心跳检测 |
| GOAWAY | 优雅关闭连接 |
| WINDOW_UPDATE | 流量控制 |
| CONTINUATION | 继续传输头部片段 |

#### 2.3 流（Stream）与优先级

每个请求/响应在一个"流"上进行，流有独立的 ID（客户端发起的流是奇数，服务器推送是偶数）：

| 特性 | 说明 |
| --- | --- |
| 流 ID | 唯一标识一个流 |
| 优先级 | 1-256，高优先级先分配资源 |
| 依赖关系 | 流可以依赖其他流（如 CSS 依赖 HTML） |
| 权重 | 同优先级下分配带宽的比例 |

#### 2.4 头部压缩（HPACK）

HTTP/2 使用 HPACK 算法压缩头部，大幅减少冗余：

| 技术 | 说明 |
| --- | --- |
| 静态表 | 61 个预定义的常见头部（如 :method: GET） |
| 动态表 | 连接期间动态维护的头部表 |
| Huffman 编码 | 对字符串进行压缩编码 |

\`\`\`
HTTP/1.1 头部: 约 500-800 字节
HTTP/2 头部: 约 20-100 字节（首次后更少）
\`\`\`

#### 2.5 服务器推送（Server Push）

服务器可以主动推送客户端尚未请求的资源：

\`\`\`javascript
// 当客户端请求 index.html 时，服务器主动推送 style.css
stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
  pushStream.respond({ ':status': 200, 'content-type': 'text/css' });
  pushStream.end('body { color: red; }');
});
\`\`\`

---

### 三、http2 模块用法

#### 3.1 创建 HTTP/2 服务器

\`\`\`javascript
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
});

server.on('stream', (stream, headers) => {
  // stream 是双向流
  console.log('请求路径:', headers[':path']);

  stream.respond({
    ':status': 200,
    'content-type': 'text/html',
  });

  stream.end('<h1>Hello HTTP/2!</h1>');
});

server.listen(8443);
\`\`\`

#### 3.2 创建 HTTP/2 客户端

\`\`\`javascript
const http2 = require('http2');

const client = http2.connect('https://localhost:8443');

const req = client.request({ ':path': '/' });

req.on('response', (headers) => {
  console.log('状态码:', headers[':status']);
});

let data = '';
req.on('data', (chunk) => data += chunk);
req.on('end', () => {
  console.log('响应体:', data);
  client.close();
});

req.end();
\`\`\`

#### 3.3 服务器推送（Server Push）

\`\`\`javascript
server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/') {
    // 推送 CSS 文件
    stream.pushStream({ ':path': '/style.css' }, (err, pushStream) => {
      if (err) throw err;
      pushStream.respond({ ':status': 200, 'content-type': 'text/css' });
      pushStream.end('body { font-family: sans-serif; }');
    });

    // 响应 HTML
    stream.respond({ ':status': 200, 'content-type': 'text/html' });
    stream.end('<link rel="stylesheet" href="/style.css"><h1>Hello</h1>');
  }
});
\`\`\`

---

### 四、HTTP/2 vs HTTP/1.1 性能对比

| 特性 | HTTP/1.1 | HTTP/2 |
| --- | --- | --- |
| 连接复用 | 多个 TCP 连接 | 单个 TCP 连接 |
| 请求并发 | 6-8 个/域名 | 无限制（多路复用） |
| 头部压缩 | 无 | HPACK |
| 请求优先级 | 无 | 有（流优先级） |
| 服务器推送 | 无 | 有 |
| 协议格式 | 文本 | 二进制帧 |
| 队头阻塞 | 有（HTTP 层） | 有（TCP 层，已大幅缓解） |
| 连接建立 | 慢（多连接） | 快（单连接） |

---

### 五、HTTP/3 与 QUIC

#### 5.1 HTTP/3 的核心变化

HTTP/3 最大的变化是：**不再使用 TCP，而是使用 QUIC（基于 UDP）**。

| 对比 | HTTP/2 | HTTP/3 |
| --- | --- | --- |
| 传输层 | TCP | QUIC（基于 UDP） |
| 连接建立 | 3 次握手 + TLS | 0-RTT 或 1-RTT |
| 队头阻塞 | TCP 层仍有 | 完全消除 |
| 连接迁移 | 不支持（换 IP 需重连） | 支持（Connection ID） |
| 加密 | TLS 1.2+ | 内置 TLS 1.3 |
| 头部压缩 | HPACK | QPACK（改进版） |

#### 5.2 QUIC 的关键优势

1. **0-RTT 恢复**：之前连接过的服务器可以 0-RTT 恢复会话
2. **无队头阻塞**：每个流独立，一个丢包不影响其他流
3. **连接迁移**：切换网络（WiFi→4G）时连接不中断
4. **内置加密**：QUIC 自带 TLS 1.3，不再需要额外的 TLS 握手

#### 5.3 Node.js 对 HTTP/3 的支持

截至 2024 年，Node.js 核心模块**尚未内置 HTTP/3 支持**。但可以通过以下方式使用：
- 使用 \`nodejs/quic\` 实验性模块
- 通过第三方库如 \`@fails-components/quic\`
- 使用反向代理（如 Nginx + HTTP/3）在前面

---

### 六、实际应用建议

1. **大多数场景直接使用 HTTP/2**，Node.js 原生支持
2. **HTTP/2 需要 HTTPS**（浏览器要求，但 Node.js 支持明文 h2c）
3. **服务器推送要谨慎使用**，避免推送不需要的资源
4. **HTTP/3 在 CDN/边缘节点层面使用**，应用层暂时不需要关心
5. **向后兼容**：HTTP/2 服务器依旧可以处理 HTTP/1.1 请求

下面这段代码用对象字面量模拟 HTTP/2 多路复用、头部压缩和服务器推送。`,
    code: `// ============================================================
// 第六章代码演示：HTTP/2 多路复用、头部压缩、服务器推送模拟
// ============================================================
// 沙箱中无法建立真正的 HTTP/2 连接，以下代码用对象字面量模拟。
// 核心概念：多路复用、流、帧、头部压缩、服务器推送。

// ---- 1. HTTP/1.1 队头阻塞演示 ----
console.log("===== 1. HTTP/1.1 队头阻塞 =====");

function simulateHTTP11() {
  console.log("HTTP/1.1 请求模型（同一连接串行）:");
  const requests = [
    { id: 1, resource: "index.html", delay: 100 },
    { id: 2, resource: "style.css", delay: 30 },
    { id: 3, resource: "script.js", delay: 50 },
    { id: 4, resource: "logo.png", delay: 80 },
  ];

  let totalTime = 0;
  requests.forEach((req) => {
    totalTime += req.delay;
    console.log(\`  [请求\${req.id}] \${req.resource} → 耗时 \${req.delay}ms\`);
  });
  console.log(\`  HTTP/1.1 总耗时: \${totalTime}ms（串行累积）\`);
  console.log(\`  如果请求1很慢，后续请求全部排队等待\`);
}
simulateHTTP11();

// ---- 2. HTTP/2 多路复用模拟 ----
console.log("\\n===== 2. HTTP/2 多路复用 =====");

/**
 * 模拟 HTTP/2 连接：一个连接上多个流并发传输
 */
class HTTP2Connection {
  constructor() {
    this.streams = new Map();
    this.nextStreamId = 1; // 客户端发起的流使用奇数 ID
    this.nextPushStreamId = 2; // 服务器推送的流使用偶数 ID
    this._settings = {
      SETTINGS_MAX_CONCURRENT_STREAMS: 100,
      SETTINGS_INITIAL_WINDOW_SIZE: 65535,
      SETTINGS_MAX_FRAME_SIZE: 16384,
      SETTINGS_ENABLE_PUSH: 1,
    };
  }

  // 创建请求流
  createStream(headers) {
    const streamId = this.nextStreamId;
    this.nextStreamId += 2;
    const stream = new HTTP2Stream(streamId, "client", headers);
    this.streams.set(streamId, stream);
    return stream;
  }

  // 创建推送流（服务器推送）
  createPushStream(promisedStreamId, headers) {
    const stream = new HTTP2Stream(promisedStreamId, "server", headers);
    this.streams.set(promisedStreamId, stream);
    return stream;
  }

  getSettings() {
    return this._settings;
  }
}

/**
 * 模拟 HTTP/2 流
 */
class HTTP2Stream {
  constructor(id, type, headers) {
    this.id = id;
    this.type = type; // 'client' or 'server'
    this.headers = headers || {};
    this.state = "idle"; // idle → open → half-closed → closed
    this._data = [];
    this._frames = [];
  }

  // 发送 HEADERS 帧
  sendHeaders(headers) {
    this.state = "open";
    this._frames.push({ type: "HEADERS", streamId: this.id, headers });
    console.log(
      \`  [流\${this.id}] HEADERS 帧 → \${JSON.stringify(headers).slice(0, 50)}...\`
    );
  }

  // 发送 DATA 帧
  sendData(data) {
    this._frames.push({ type: "DATA", streamId: this.id, length: data.length });
    console.log(\`  [流\${this.id}] DATA 帧 → \${data.length} 字节\`);
  }

  // 响应
  respond(headers) {
    this.sendHeaders(headers);
  }

  // 结束流
  end(data) {
    if (data) this.sendData(data);
    this.state = "closed";
    this._frames.push({ type: "END_STREAM", streamId: this.id });
  }

  // 推送流
  pushStream(headers, callback) {
    const pushId = this.id + 1;
    this._frames.push({
      type: "PUSH_PROMISE",
      streamId: this.id,
      promisedStreamId: pushId,
      headers,
    });
    console.log(
      \`  [流\${this.id}] PUSH_PROMISE → 推送流\${pushId}: \${JSON.stringify(headers).slice(0, 50)}...\`
    );
    const pushStream = new HTTP2Stream(pushId, "server", headers);
    callback(null, pushStream);
    return pushStream;
  }

  // 优先级
  setPriority(weight, dependsOn) {
    this._frames.push({
      type: "PRIORITY",
      streamId: this.id,
      weight,
      dependsOn,
    });
    console.log(
      \`  [流\${this.id}] PRIORITY → 权重=\${weight}, 依赖流\${dependsOn || "无"}\`
    );
  }
}

// 模拟 HTTP/2 多路复用
function simulateHTTP2Multiplexing() {
  const conn = new HTTP2Connection();
  console.log("HTTP/2 连接建立（单个 TCP 连接）");
  console.log("设置:", JSON.stringify(conn.getSettings()));

  // 并发发起多个请求
  const requests = [
    { path: "/index.html", priority: 256, weight: 40 },
    { path: "/style.css", priority: 200, weight: 30 },
    { path: "/script.js", priority: 150, weight: 20 },
    { path: "/logo.png", priority: 100, weight: 10 },
  ];

  const streams = requests.map((req) => {
    const stream = conn.createStream({ ":method": "GET", ":path": req.path });
    stream.setPriority(req.weight, 1);
    console.log(\`  创建流\${stream.id}: \${req.path} (权重 \${req.weight})\`);
    return stream;
  });

  // 模拟响应（交错）
  console.log("\\n帧交错传输:");
  streams.forEach((stream, i) => {
    setTimeout(() => {
      stream.sendHeaders({ ":status": 200, "content-type": "text/html" });
      stream.sendData(\`\${stream.headers[":path"]} 的内容\`);
      stream.end();
    }, i * 5);
  });

  setTimeout(() => {
    console.log("\\nHTTP/2 多路复用优势:");
    console.log("  • 所有请求共享一个 TCP 连接");
    console.log("  • 请求/响应帧交错传输，互不阻塞");
    console.log("  • 1 个慢请求不会阻塞其他请求");
    console.log("  • 支持流优先级，重要资源优先传输");
  }, 50);
}

simulateHTTP2Multiplexing();

// ---- 3. 头部压缩（HPACK）模拟 ----
setTimeout(() => {
  console.log("\\n===== 3. 头部压缩（HPACK）模拟 =====");

  /**
   * 模拟 HPACK 的静态表和动态表
   */
  class HPACKSimulator {
    constructor() {
      // 静态表（HPACK 预定义的 61 个常见头部，这里展示部分）
      this._staticTable = [
        { name: ":authority", value: "" },
        { name: ":method", value: "GET" },
        { name: ":method", value: "POST" },
        { name: ":path", value: "/" },
        { name: ":path", value: "/index.html" },
        { name: ":status", value: "200" },
        { name: ":status", value: "404" },
        { name: "content-type", value: "text/html" },
        { name: "content-type", value: "application/json" },
        { name: "accept", value: "*/*" },
        { name: "accept-encoding", value: "gzip, deflate" },
      ];
      this._dynamicTable = []; // 动态表（连接期间维护）
      this._totalCompressed = 0;
      this._totalOriginal = 0;
    }

    // 查找表索引
    _lookup(name, value) {
      // 先查静态表
      for (let i = 0; i < this._staticTable.length; i++) {
        if (
          this._staticTable[i].name === name &&
          this._staticTable[i].value === value
        ) {
          return { index: i + 1, type: "static" };
        }
      }
      // 再查动态表
      for (let i = 0; i < this._dynamicTable.length; i++) {
        if (
          this._dynamicTable[i].name === name &&
          this._dynamicTable[i].value === value
        ) {
          return { index: this._staticTable.length + i + 1, type: "dynamic" };
        }
      }
      return null;
    }

    // 压缩头部
    compress(headers) {
      const result = [];
      let originalSize = 0;

      for (const [name, value] of Object.entries(headers)) {
        originalSize += name.length + value.length + 2;
        const lookup = this._lookup(name, value);

        if (lookup) {
          // 命中静态表或动态表，只需发送索引
          result.push({ type: "indexed", index: lookup.index });
        } else {
          // 未命中，发送完整头部并加入动态表
          result.push({ type: "literal", name, value });
          this._dynamicTable.unshift({ name, value });
          // 动态表大小限制（模拟）
          if (this._dynamicTable.length > 100) {
            this._dynamicTable.pop();
          }
        }
      }

      const compressedSize = JSON.stringify(result).length;
      this._totalCompressed += compressedSize;
      this._totalOriginal += originalSize;

      console.log(
        \`  原始: \${originalSize}B → 压缩: \${compressedSize}B (节省 \${((1 - compressedSize / originalSize) * 100).toFixed(0)}%)\`
      );

      return result;
    }

    getStats() {
      return {
        totalOriginal: this._totalOriginal,
        totalCompressed: this._totalCompressed,
        compressionRatio:
          ((1 - this._totalCompressed / this._totalOriginal) * 100).toFixed(
            1
          ) + "%",
        dynamicTableSize: this._dynamicTable.length,
      };
    }
  }

  const hpack = new HPACKSimulator();

  // 第1次请求
  console.log("第1次请求（首次，头部全量发送）:");
  hpack.compress({
    ":method": "GET",
    ":path": "/index.html",
    ":authority": "example.com",
    "user-agent": "Mozilla/5.0",
    "accept": "text/html",
    "cookie": "session=abc123",
  });

  // 第2次请求（大部分头部命中动态表）
  console.log("\\n第2次请求（复用动态表，仅需发送索引）:");
  hpack.compress({
    ":method": "GET",
    ":path": "/style.css",
    ":authority": "example.com",
    "user-agent": "Mozilla/5.0",
    "accept": "text/css",
    "cookie": "session=abc123",
  });

  // 第3次请求
  console.log("\\n第3次请求（更多命中）:");
  hpack.compress({
    ":method": "GET",
    ":path": "/script.js",
    ":authority": "example.com",
    "user-agent": "Mozilla/5.0",
    "cookie": "session=abc123",
  });

  console.log("\\nHPACK 压缩统计:", JSON.stringify(hpack.getStats()));

  // HTTP/1.1 对比
  console.log("\\nHTTP/1.1 对比:");
  console.log("  HTTP/1.1: 每次请求都发送完整头部（无压缩）");
  console.log("  HTTP/2:   首次后头部大幅压缩（HPACK）");
  console.log("  效果: Cookie/User-Agent 等重复头部仅首次发送");
}, 100);

// ---- 4. 服务器推送（Server Push）模拟 ----
setTimeout(() => {
  console.log("\\n===== 4. 服务器推送（Server Push）模拟 =====");

  console.log("场景: 客户端请求 index.html");
  console.log("服务器主动推送 style.css 和 script.js");

  const conn = new HTTP2Connection();

  // 客户端请求 index.html
  const mainStream = conn.createStream({
    ":method": "GET",
    ":path": "/index.html",
  });

  // 服务器推送 style.css（在响应 index.html 之前）
  console.log("\\n服务器推送:");
  mainStream.pushStream({ ":path": "/style.css" }, (err, pushStream) => {
    pushStream.respond({
      ":status": 200,
      "content-type": "text/css",
    });
    pushStream.sendData("body { margin: 0; }");
    pushStream.end();
    console.log("  ✓ 已推送 style.css");
  });

  // 服务器推送 script.js
  mainStream.pushStream({ ":path": "/script.js" }, (err, pushStream) => {
    pushStream.respond({
      ":status": 200,
      "content-type": "application/javascript",
    });
    pushStream.sendData("console.log('loaded');");
    pushStream.end();
    console.log("  ✓ 已推送 script.js");
  });

  // 响应主请求
  mainStream.respond({ ":status": 200, "content-type": "text/html" });
  mainStream.sendData("<html>...</html>");
  mainStream.end();

  console.log("\\n服务器推送 vs 传统方式:");
  console.log("  传统: 客户端请求 HTML → 解析 → 请求 CSS → 请求 JS");
  console.log("  推送: 客户端请求 HTML → 同时收到 CSS + JS");
  console.log("  优势: 减少 1-2 个 RTT，首屏加载更快");
  console.log("  注意: 不要推送不需要的资源，避免浪费带宽");
}, 200);

// ---- 5. HTTP/2 vs HTTP/1.1 关键对比 ----
setTimeout(() => {
  console.log("\\n===== 5. HTTP/2 vs HTTP/1.1 对比 =====");

  const comparison = [
    {
      特性: "传输格式",
      "HTTP/1.1": "文本（人类可读）",
      "HTTP/2": "二进制帧（机器友好）",
    },
    {
      特性: "连接复用",
      "HTTP/1.1": "多个TCP连接（6-8个/域名）",
      "HTTP/2": "单个TCP连接",
    },
    {
      特性: "请求并发",
      "HTTP/1.1": "串行（队头阻塞）",
      "HTTP/2": "多路复用（无阻塞）",
    },
    {
      特性: "头部压缩",
      "HTTP/1.1": "无",
      "HTTP/2": "HPACK（静态表+动态表+Huffman）",
    },
    {
      特性: "请求优先级",
      "HTTP/1.1": "无",
      "HTTP/2": "流优先级+权重+依赖",
    },
    {
      特性: "服务器推送",
      "HTTP/1.1": "无",
      "HTTP/2": "PUSH_PROMISE 帧",
    },
    {
      特性: "流量控制",
      "HTTP/1.1": "TCP 级别",
      "HTTP/2": "连接级 + 流级别",
    },
    {
      特性: "连接建立",
      "HTTP/1.1": "慢（多连接）",
      "HTTP/2": "快（单连接）",
    },
  ];

  console.table(comparison);
}, 300);

// ---- 6. HTTP/3 (QUIC) 概念介绍 ----
setTimeout(() => {
  console.log("\\n===== 6. HTTP/3 与 QUIC =====");

  const quicAdvantages = [
    {
      特性: "传输层",
      "HTTP/2": "TCP",
      "HTTP/3 (QUIC)": "UDP + QUIC",
    },
    {
      特性: "连接建立",
      "HTTP/2": "TCP握手 + TLS握手 = 2-3 RTT",
      "HTTP/3 (QUIC)": "0-RTT（恢复）或 1-RTT（新建）",
    },
    {
      特性: "队头阻塞",
      "HTTP/2": "TCP 层仍有（丢包重传阻塞所有流）",
      "HTTP/3 (QUIC)": "完全消除（每流独立重传）",
    },
    {
      特性: "连接迁移",
      "HTTP/2": "不支持（换IP需重连）",
      "HTTP/3 (QUIC)": "支持（Connection ID 保持连接）",
    },
    {
      特性: "加密",
      "HTTP/2": "TLS 1.2+（可选，但浏览器要求）",
      "HTTP/3 (QUIC)": "内置 TLS 1.3（强制）",
    },
    {
      特性: "Node.js 支持",
      "HTTP/2": "v8.4+ 稳定支持",
      "HTTP/3 (QUIC)": "实验性（2024年尚未内置）",
    },
  ];

  console.table(quicAdvantages);

  console.log("\\nQUIC 核心优势:");
  console.log("  1. 0-RTT: 之前连接过的服务器可瞬间恢复会话");
  console.log("  2. 无队头阻塞: 一个流丢包不影响其他流");
  console.log("  3. 连接迁移: WiFi→4G 切换时连接不中断");
  console.log("  4. 内置加密: 不再需要单独的 TLS 握手");
  console.log("\\n当前建议:");
  console.log("  • 生产环境使用 HTTP/2（Node.js 原生支持）");
  console.log("  • HTTP/3 通过 CDN/反向代理（Nginx）提供");
  console.log("  • 关注 Node.js HTTP/3 支持进展");
}, 400);

// ---- 7. 综合总结 ----
setTimeout(() => {
  console.log("\\n===== 7. HTTP 协议演进总结 =====");
  console.log("┌──────────────────────────────────────────┐");
  console.log("│ HTTP 协议演进                              │");
  console.log("│                                           │");
  console.log("│ HTTP/1.1 (1997)  → 文本，队头阻塞        │");
  console.log("│ HTTP/2   (2015)  → 二进制，多路复用      │");
  console.log("│ HTTP/3   (2022)  → QUIC，零队头阻塞      │");
  console.log("├──────────────────────────────────────────┤");
  console.log("│ HTTP/2 核心特性                           │");
  console.log("│ • 多路复用: 单连接并发请求/响应           │");
  console.log("│ • 二进制帧: 高效解析，扩展性强           │");
  console.log("│ • 头部压缩: HPACK 大幅减少冗余           │");
  console.log("│ • 服务器推送: 主动推送资源               │");
  console.log("│ • 流优先级: 重要资源优先传输              │");
  console.log("└──────────────────────────────────────────┘");
}, 500);`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = [
  "基础入门",
  "核心模块",
  "核心模块补充",
  "异步编程",
  "进阶实战",
  "工程化",
];