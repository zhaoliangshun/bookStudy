// =============================================================
// Node.js 交互式教程 —— 第七批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. node-eventemitter-deep  — EventEmitter 深入
//   2. node-stream-deep       — Stream 深入
//   3. node-promise-deep      — Promise 深入
//   4. node-async-await-deep  — Async/Await 深入
//   5. node-concurrency       — 并发控制与限流
//   6. node-async-patterns    — 异步错误处理模式
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
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：EventEmitter 深入
  // =========================================================
  {
    id: "node-eventemitter-deep",
    title: "EventEmitter 深入",
    icon: "🎧",
    group: "异步编程补充",
    content: `## EventEmitter 概述

EventEmitter 是 Node.js 事件驱动架构的核心基石。它是一个**观察者模式（Observer Pattern）**的实现，允许对象接收命名事件、调用已注册的回调函数（监听器）。Node.js 的许多核心模块都是 EventEmitter 的子类，包括 \`net.Server\`、\`fs.ReadStream\`、\`process\`、\`stream\` 等。

理解 EventEmitter 是理解整个 Node.js 异步编程模型的关键——它不仅仅是"一个事件订阅工具"，而是一种**架构模式**，用于解耦生产者和消费者。

### 为什么需要 EventEmitter？

在传统的同步编程中，函数调用是"推"模型：调用方主动调用函数，获取结果。但在异步世界中，很多操作是"未来某个时刻完成的"——如果不使用事件，你就需要轮询（polling），这非常低效。

EventEmitter 提供了"发布-订阅"模型：
- **发布者（Emitter）**：在事件发生时发出通知，但不关心谁在听
- **订阅者（Listener）**：注册感兴趣的事件，当事件发生时被通知

这种解耦设计让代码更灵活、更容易扩展。

---

## EventEmitter 类继承模式

### 方式一：直接继承 EventEmitter（ES6 Class）

\`\`\`javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super(); // 必须调用 super()
    this.data = [];
  }

  addItem(item) {
    this.data.push(item);
    this.emit('itemAdded', item); // 触发事件
  }
}

const emitter = new MyEmitter();
emitter.on('itemAdded', (item) => {
  console.log('新项目:', item);
});
\`\`\`

### 方式二：使用 util.inherits（旧式写法）

\`\`\`javascript
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this); // 调用父类构造函数
  this.data = [];
}
util.inherits(MyEmitter, EventEmitter);
\`\`\`

### 方式三：Mixin 模式（不继承，组合使用）

\`\`\`javascript
const EventEmitter = require('events');

const myObj = {};
// 将 EventEmitter 的原型方法复制到 myObj
Object.assign(myObj, EventEmitter.prototype);
// 或者直接使用 EventEmitter 构造函数
const emitter = new EventEmitter();
\`\`\`

### 方式四：直接实例化（简单场景）

\`\`\`javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// 直接使用，不需要继承
emitter.on('data', handler);
emitter.emit('data', payload);
\`\`\`

---

## 核心 API 详解

### on(eventName, listener) —— 注册监听器

注册一个在指定事件触发时执行的监听器函数。监听器会按照注册顺序**同步**执行。

\`\`\`javascript
emitter.on('event', (arg1, arg2) => {
  console.log('第一个监听器', arg1, arg2);
});
emitter.on('event', (arg1, arg2) => {
  console.log('第二个监听器', arg1, arg2);
});
\`\`\`

**返回值**：返回 EventEmitter 实例本身，支持链式调用：
\`\`\`javascript
emitter
  .on('start', () => console.log('start'))
  .on('end', () => console.log('end'));
\`\`\`

### once(eventName, listener) —— 一次性监听器

注册一个只触发一次就会自动移除的监听器。适用于只需要一次响应的场景（如初始化完成、连接建立）。

\`\`\`javascript
emitter.once('ready', () => {
  console.log('只触发一次');
});
emitter.emit('ready'); // 触发
emitter.emit('ready'); // 不会触发（已移除）
\`\`\`

**内部实现原理**：\`once\` 实际上包装了一个 \`on\`，在回调执行后自动调用 \`off\` 移除自身。

### emit(eventName, ...args) —— 触发事件

同步触发指定事件的所有已注册监听器，按注册顺序依次执行。返回 \`true\` 表示有监听器，\`false\` 表示没有。

\`\`\`javascript
const hasListeners = emitter.emit('data', { id: 1 });
console.log(hasListeners); // true 或 false
\`\`\`

### off(eventName, listener) / removeListener(eventName, listener) —— 移除监听器

移除指定事件的指定监听器。注意：**必须传入同一个函数引用**，匿名函数无法通过 off 移除。

\`\`\`javascript
// ✅ 正确：保存函数引用
function handler(data) {
  console.log(data);
}
emitter.on('data', handler);
emitter.off('data', handler); // 移除成功

// ❌ 错误：匿名函数无法移除
emitter.on('data', (data) => console.log(data));
emitter.off('data', (data) => console.log(data)); // 无效！两个箭头函数是不同的引用
\`\`\`

### removeAllListeners([eventName]) —— 移除所有监听器

如果不传参数，移除所有事件的所有监听器。传入事件名则只移除该事件的所有监听器。

\`\`\`javascript
emitter.removeAllListeners('data'); // 只移除 data 事件的监听器
emitter.removeAllListeners();       // 移除所有事件的所有监听器
\`\`\`

---

## 事件名规范与命名约定

1. **事件名区分大小写**：\`'data'\` 和 \`'Data'\` 是两个不同的事件
2. **推荐使用 camelCase**：\`'userLogin'\` 而非 \`'user-login'\`
3. **避免使用保留事件名**：\`'newListener'\`、\`'removeListener'\`、\`'error'\` 是 Node.js 内部特殊事件
4. **事件名应该是名词或动词短语**：\`'data'\`、\`'connection'\`、\`'request'\`、\`'close'\`

---

## 监听器数量限制

默认情况下，任何单个事件最多注册 **10 个**监听器。超过这个数量，Node.js 会输出警告：

\`\`\`
(node:12345) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
11 data listeners added. Use emitter.setMaxListeners() to increase limit
\`\`\`

### 为什么要限制？

这是为了防止**内存泄漏**。如果你不小心在循环中注册监听器，可能会无限增长，导致内存耗尽。10 个监听器通常足够了——如果超过，说明你的架构可能有问题。

### 调整限制

\`\`\`javascript
// 调整单个实例的限制
emitter.setMaxListeners(20);

// 调整所有 EventEmitter 实例的默认限制
EventEmitter.defaultMaxListeners = 50;

// 设置为 Infinity 表示不限制（不推荐）
emitter.setMaxListeners(0);
\`\`\`

### 获取当前监听器数量

\`\`\`javascript
// 获取某个事件的监听器数量
emitter.listenerCount('data');

// 获取所有监听器
emitter.listeners('data'); // 返回监听器数组的副本

// 获取原始监听器数组（用于某些高级场景）
emitter.rawListeners('data'); // 返回原始数组（含 once 包装器）
\`\`\`

---

## 同步 vs 异步事件触发

### 监听器是同步执行的

EventEmitter 的 \`emit()\` 方法**同步调用**所有监听器。这意味着：

\`\`\`javascript
emitter.on('event', () => console.log('a'));
emitter.on('event', () => console.log('b'));
console.log('before');
emitter.emit('event');
console.log('after');
// 输出顺序：before → a → b → after
\`\`\`

### 如果需要异步处理

在监听器内部使用 \`setImmediate\` 或 \`process.nextTick\` 来异步化：

\`\`\`javascript
emitter.on('event', (data) => {
  setImmediate(() => {
    // 这里的代码异步执行，不会阻塞 emit
    heavyProcessing(data);
  });
});
\`\`\`

### 陷阱：监听器中的同步错误会中断后续监听器

\`\`\`javascript
emitter.on('event', () => { throw new Error('崩了'); });
emitter.on('event', () => console.log('这行不会执行'));
emitter.emit('event'); // 抛出异常，第二个监听器被跳过
\`\`\`

---

## error 事件特殊处理

\`'error'\` 事件是 EventEmitter 中最特殊的事件。如果触发了 \`'error'\` 事件但没有监听器，**Node.js 会抛出未捕获的异常并导致进程崩溃**。

\`\`\`javascript
// ❌ 危险：没有 error 监听器
const emitter = new EventEmitter();
emitter.emit('error', new Error('未处理的错误'));
// 进程崩溃！Error: 未处理的错误

// ✅ 安全：始终添加 error 监听器
emitter.on('error', (err) => {
  console.error('发生错误:', err.message);
});
emitter.emit('error', new Error('已处理的错误')); // 安全
\`\`\`

**最佳实践**：任何继承 EventEmitter 的类，都应该在文档中说明它会触发哪些事件，特别是 \`'error'\` 事件。使用者应该始终监听 \`'error'\` 事件。

---

## EventEmitter 内存泄漏

### 常见泄漏模式

1. **在循环中注册监听器**：
\`\`\`javascript
// ❌ 泄漏：每次循环都注册新监听器
for (let i = 0; i < 100; i++) {
  emitter.on('data', () => processData(i));
}
\`\`\`

2. **忘记移除监听器**：
\`\`\`javascript
// ❌ 泄漏：每次请求都注册，从不移除
function handleRequest(req, res) {
  database.on('connected', () => {
    res.send('ok');
  });
}
\`\`\`

3. **闭包引用了大量对象**：
\`\`\`javascript
// ❌ 泄漏：监听器闭包引用了大对象
const bigData = new Array(1000000);
emitter.on('update', () => {
  console.log(bigData.length); // bigData 永远不会被垃圾回收
});
\`\`\`

### 修复方案

\`\`\`javascript
// ✅ 使用 once 代替 on（一次性监听器）
emitter.once('connected', handler);

// ✅ 在不需要时主动移除
emitter.on('data', handler);
// ... 使用完后
emitter.off('data', handler);

// ✅ 关闭不再需要的 emitter
emitter.removeAllListeners();
\`\`\`

---

## newListener / removeListener 特殊事件

### newListener 事件

在任何监听器被添加**之前**触发。这让你可以在监听器注册时做拦截或包装。

\`\`\`javascript
emitter.on('newListener', (eventName, listener) => {
  console.log('正在为', eventName, '添加监听器');
  // 可以在这里包装监听器
});
\`\`\`

### removeListener 事件

在监听器被移除**之后**触发。

\`\`\`javascript
emitter.on('removeListener', (eventName, listener) => {
  console.log('已移除', eventName, '的监听器');
});
\`\`\`

### 陷阱：newListener 中注册监听器

如果你在 \`newListener\` 事件的处理函数中注册监听器，小心无限递归——因为注册监听器本身又会触发 \`newListener\`。

---

## EventEmitter 与浏览器 EventTarget 对比

| 特性 | Node.js EventEmitter | 浏览器 EventTarget |
| --- | --- | --- |
| 监听器注册 | \`on(event, fn)\` / \`addListener(event, fn)\` | \`addEventListener(type, fn)\` |
| 一次性监听 | \`once(event, fn)\` | \`addEventListener(type, fn, { once: true })\` |
| 移除监听器 | \`off(event, fn)\` / \`removeListener(event, fn)\` | \`removeEventListener(type, fn)\` |
| 触发事件 | \`emit(event, ...args)\` | \`dispatchEvent(new Event(type))\` |
| 事件对象 | 任意参数（多个） | 单个 Event 对象 |
| 最大监听器 | 默认 10 个（有警告） | 无限制 |
| 同步/异步 | 同步执行监听器 | 异步执行（微任务） |
| 错误处理 | 未监听的 error 抛异常 | 有 error 事件，不抛异常 |
| 继承方式 | 类继承 | 无法直接继承 |

---

## 实现自己的 EventEmitter

下面是一个简化版 EventEmitter 的核心实现思路：

\`\`\`javascript
class SimpleEventEmitter {
  constructor() {
    this._events = {}; // 存储所有事件和监听器
  }

  on(eventName, listener) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(listener);
    return this;
  }

  emit(eventName, ...args) {
    const listeners = this._events[eventName];
    if (!listeners || listeners.length === 0) return false;
    listeners.forEach(fn => fn(...args));
    return true;
  }

  off(eventName, listener) {
    const listeners = this._events[eventName];
    if (!listeners) return this;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
    return this;
  }

  once(eventName, listener) {
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      listener(...args);
    };
    this.on(eventName, wrapper);
    return this;
  }
}
\`\`\`

下面这段代码完整演示了 EventEmitter 的各种用法，包括手写实现、error 事件处理、内存泄漏演示等。`,
    code: `// ============================================================
// 第一章代码演示：EventEmitter 深入实战
// ============================================================
const EventEmitter = require("events");

// ============================================================
// 演示 1：手写实现一个简化版 EventEmitter
// ============================================================
class SimpleEventEmitter {
  constructor() {
    // 用一个对象存储所有事件和对应的监听器数组
    // 结构：{ eventName: [listener1, listener2, ...] }
    this._events = {};
  }

  // 注册监听器（支持链式调用）
  on(eventName, listener) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(listener);
    return this; // 链式调用
  }

  // 触发事件（同步执行所有监听器，按注册顺序）
  emit(eventName, ...args) {
    const listeners = this._events[eventName];
    if (!listeners || listeners.length === 0) {
      return false; // 没有监听器返回 false
    }
    // 创建副本遍历，防止在回调中修改数组导致问题
    const listenersCopy = listeners.slice();
    for (const fn of listenersCopy) {
      fn(...args);
    }
    return true;
  }

  // 移除指定监听器
  off(eventName, listener) {
    const listeners = this._events[eventName];
    if (!listeners) return this;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
    return this;
  }

  // 一次性监听器（触发后自动移除）
  once(eventName, listener) {
    // 使用箭头函数包装：执行后自动移除自己
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      listener(...args);
    };
    // 保存原始 listener 引用，方便 off 时能匹配
    wrapper._original = listener;
    this.on(eventName, wrapper);
    return this;
  }

  // 获取某事件的监听器数量
  listenerCount(eventName) {
    const listeners = this._events[eventName];
    return listeners ? listeners.length : 0;
  }

  // 移除所有监听器
  removeAllListeners(eventName) {
    if (eventName) {
      delete this._events[eventName];
    } else {
      this._events = {};
    }
    return this;
  }
}

// ---- 测试手写的 EventEmitter ----
console.log("===== 1. 手写 EventEmitter 测试 =====");
const myEmitter = new SimpleEventEmitter();

// 测试 on 和 emit
myEmitter.on("greet", (name, age) => {
  console.log("  你好, " + name + ", 年龄 " + age);
});
myEmitter.on("greet", (name) => {
  console.log("  欢迎, " + name + "!");
});
console.log("触发 greet 事件...");
myEmitter.emit("greet", "小明", 25);
console.log("emit 返回值:", myEmitter.emit("greet", "小红", 22));

// 测试 once
console.log("\\n--- 测试 once ---");
myEmitter.once("init", () => console.log("  初始化完成（只触发一次）"));
console.log("第一次 emit('init'):");
myEmitter.emit("init");
console.log("第二次 emit('init'):");
myEmitter.emit("init"); // 不会触发（已完成）
console.log("init 监听器数量:", myEmitter.listenerCount("init")); // 0

// 测试 off
console.log("\\n--- 测试 off ---");
function clickHandler() { console.log("  点击了！"); }
myEmitter.on("click", clickHandler);
myEmitter.on("click", () => console.log("  另一个点击处理器"));
console.log("移除前 click 监听器数量:", myEmitter.listenerCount("click"));
myEmitter.off("click", clickHandler);
console.log("移除后 click 监听器数量:", myEmitter.listenerCount("click"));
myEmitter.emit("click");

// 测试 removeAllListeners
console.log("\\n--- 测试 removeAllListeners ---");
myEmitter.on("test1", () => {});
myEmitter.on("test2", () => {});
myEmitter.on("test3", () => {});
console.log("移除前 事件列表:", Object.keys(myEmitter._events));
myEmitter.removeAllListeners();
console.log("移除后 事件列表:", Object.keys(myEmitter._events));

// ============================================================
// 演示 2：使用 Node.js 原生 EventEmitter
// ============================================================
console.log("\\n===== 2. 原生 EventEmitter 用法 =====");
const emitter = new EventEmitter();

// 链式调用
emitter
  .on("start", () => console.log("  1. 开始处理"))
  .on("start", () => console.log("  2. 初始化数据库"))
  .on("progress", (percent) => console.log("  进度:", percent + "%"))
  .on("end", () => console.log("  3. 处理完成"));

emitter.emit("start");
emitter.emit("progress", 50);
emitter.emit("progress", 100);
emitter.emit("end");

// ---- 获取事件信息 ----
console.log("\\n--- 事件信息 ---");
// eventNames(): 获取所有已注册的事件名
console.log("已注册事件:", emitter.eventNames());
// listenerCount(): 获取某事件的监听器数量
console.log("start 监听器数量:", emitter.listenerCount("start"));
// listeners(): 获取某事件的监听器数组（副本）
console.log("start 监听器数量:", emitter.listeners("start").length);

// ============================================================
// 演示 3：error 事件特殊处理
// ============================================================
console.log("\\n===== 3. error 事件处理 =====");

// 场景 1：监听 error 事件——安全
const safeEmitter = new EventEmitter();
safeEmitter.on("error", (err) => {
  console.log("  捕获到错误:", err.message);
  console.log("  错误码:", err.code);
});
safeEmitter.emit("error", new Error("这是一个被处理的错误"));

// 场景 2：没有监听 error 事件——危险
// 创建一个新的 emitter，不监听 error，然后触发 error
// 注意：这会导致进程崩溃，所以我们用 try-catch 包裹
const noHandlerEmitter = new EventEmitter();
try {
  // 在 vm 沙箱中，未监听的 error 也会抛出异常
  noHandlerEmitter.emit("error", new Error("无人处理的错误"));
} catch (e) {
  console.log("  未捕获的 error 事件:", e.message);
  console.log("  这就是为什么必须始终监听 error 事件！");
}

// ============================================================
// 演示 4：newListener 和 removeListener 特殊事件
// ============================================================
console.log("\\n===== 4. newListener / removeListener 特殊事件 =====");
const specialEmitter = new EventEmitter();

// 监听 newListener：在每次添加监听器前触发
specialEmitter.on("newListener", (eventName, listener) => {
  console.log("  [newListener] 正在为 '" + eventName + "' 添加监听器");
  // 实际使用场景：可以在这里做日志记录、监控统计
});

// 监听 removeListener：在每次移除监听器后触发
specialEmitter.on("removeListener", (eventName, listener) => {
  console.log("  [removeListener] 已移除 '" + eventName + "' 的监听器");
});

// 注册普通监听器
const handlerA = () => console.log("    handlerA 执行");
const handlerB = () => console.log("    handlerB 执行");

specialEmitter.on("demo", handlerA);
specialEmitter.on("demo", handlerB);
specialEmitter.emit("demo");

// 移除一个监听器
specialEmitter.off("demo", handlerA);
console.log("  移除 handlerA 后 demo 监听器数量:", specialEmitter.listenerCount("demo"));

// ============================================================
// 演示 5：监听器数量限制与内存泄漏
// ============================================================
console.log("\\n===== 5. 监听器数量限制 =====");
const limitEmitter = new EventEmitter();

// 默认最大监听器数量是 10
console.log("默认最大监听器数量:", limitEmitter.getMaxListeners());

// 注册 11 个监听器（超过默认限制）
console.log("注册 11 个监听器...");
for (let i = 0; i < 11; i++) {
  limitEmitter.on("data", () => {});
}
console.log("data 监听器数量:", limitEmitter.listenerCount("data"));
// Node.js 会输出警告：MaxListenersExceededWarning
// 但监听器仍然会被注册

// 使用 setMaxListeners 提高限制
const safeLimiter = new EventEmitter();
safeLimiter.setMaxListeners(20);
console.log("\\n调整后最大监听器数量:", safeLimiter.getMaxListeners());

// ============================================================
// 演示 6：内存泄漏场景与修复
// ============================================================
console.log("\\n===== 6. 内存泄漏场景演示 =====");

// 场景：模拟"忘记移除监听器"导致的内存泄漏
const leakEmitter = new EventEmitter();
let leakCount = 0;
let cleanCount = 0;

// 泄漏模式：每次注册新的匿名函数，从不移除
function simulateLeak() {
  for (let i = 0; i < 100; i++) {
    leakEmitter.on("data", () => {
      leakCount++;
    });
  }
}

// 正确模式：使用具名函数，用完后移除
function simulateClean() {
  const handler = () => {
    cleanCount++;
  };
  leakEmitter.on("data", handler);
  // 使用 once 更安全
  // 或者手动移除
  leakEmitter.off("data", handler);
}

simulateLeak();
simulateClean();
leakEmitter.emit("data");
console.log("泄漏模式触发的监听器数量:", leakCount);
console.log("clean 模式触发的监听器数量:", cleanCount);
console.log("当前 data 监听器总数:", leakEmitter.listenerCount("data"));
console.log("\\n这就是内存泄漏！100 个监听器一直在内存中");

// 清理泄漏
leakEmitter.removeAllListeners("data");
console.log("清理后 data 监听器数量:", leakEmitter.listenerCount("data"));

// ============================================================
// 演示 7：实战——构建一个任务处理器
// ============================================================
console.log("\\n===== 7. 实战：基于 EventEmitter 的任务处理器 =====");

class TaskProcessor extends EventEmitter {
  constructor(maxConcurrent) {
    super();
    this.maxConcurrent = maxConcurrent || 3;
    this.running = 0;
    this.queue = [];
    this.completed = 0;
    this.failed = 0;
  }

  // 添加任务
  addTask(task) {
    const taskId = this.queue.length + 1;
    this.queue.push({ id: taskId, task });
    this.emit("taskQueued", taskId);
    this._processNext();
    return taskId;
  }

  // 处理下一个任务
  _processNext() {
    if (this.queue.length === 0) {
      if (this.running === 0) {
        this.emit("drain"); // 所有任务完成
        this.emit("summary", {
          completed: this.completed,
          failed: this.failed,
          total: this.completed + this.failed,
        });
      }
      return;
    }
    if (this.running >= this.maxConcurrent) return;

    const { id, task } = this.queue.shift();
    this.running++;
    this.emit("taskStarted", id);

    // 执行任务（模拟异步操作）
    task()
      .then((result) => {
        this.completed++;
        this.emit("taskCompleted", id, result);
      })
      .catch((err) => {
        this.failed++;
        this.emit("taskFailed", id, err);
      })
      .finally(() => {
        this.running--;
        this._processNext();
      });
  }
}

// 创建任务处理器
const processor = new TaskProcessor(2);

// 监听各种事件
processor.on("taskQueued", (id) => {
  console.log("  [排队] 任务 #" + id + " 已加入队列");
});
processor.on("taskStarted", (id) => {
  console.log("  [开始] 任务 #" + id + " 开始执行");
});
processor.on("taskCompleted", (id, result) => {
  console.log("  [完成] 任务 #" + id + " 完成:", result);
});
processor.on("taskFailed", (id, err) => {
  console.log("  [失败] 任务 #" + id + " 失败:", err.message);
});
processor.on("drain", () => {
  console.log("  [全部] 所有任务处理完毕！");
});
processor.on("summary", (stats) => {
  console.log("  [统计] 完成:" + stats.completed + " 失败:" + stats.failed + " 总计:" + stats.total);
});

// 添加一些任务
console.log("添加 5 个任务...");
processor.addTask(() => Promise.resolve("数据 A"));
processor.addTask(() => Promise.resolve("数据 B"));
processor.addTask(() => Promise.reject(new Error("网络超时")));
processor.addTask(() => Promise.resolve("数据 C"));
processor.addTask(() => Promise.resolve("数据 D"));

console.log("\\n（任务正在异步处理中...）");`,
  },

  // =========================================================
  // 第二章：Stream 深入
  // =========================================================
  {
    id: "node-stream-deep",
    title: "Stream 深入",
    icon: "🌊",
    group: "异步编程补充",
    content: `## Stream 概述

Stream（流）是 Node.js 中处理流式数据的核心抽象。它的核心哲学是：**不要一次性把所有数据加载到内存中，而是把数据分成小块（chunk），一块一块地处理**。这让 Node.js 能够高效处理 GB 级别的文件、网络数据流，而不会耗尽内存。

Node.js 的 Stream 模块基于 EventEmitter，所有流都是 EventEmitter 的实例。这意味着你可以用熟悉的事件模式来监听流的状态变化。

### 为什么需要 Stream？

假设你要读取一个 10GB 的日志文件，找出包含特定关键词的行。如果用 \`fs.readFileSync()\`，需要把 10GB 全部加载到内存——你的机器可能只有 8GB 内存，程序会直接崩溃。使用 Stream，你只需要维护一个很小的缓冲区，每次读取 64KB 的数据，处理完就丢弃，内存占用始终保持在 MB 级别。

同样的道理适用于：
- 处理大文件上传/下载
- 实时音视频传输
- 数据库大量数据导出
- 日志处理管道
- 数据压缩/解压缩

---

## 四种流类型

Node.js 提供四种基本流类型，它们形成了一套完整的流处理体系：

| 类型 | 说明 | 典型用途 | 可读 | 可写 |
| --- | --- | --- | --- | --- |
| **Readable** | 可读流（数据来源） | 文件读取、HTTP 请求体、数据库查询结果 | ✅ | ❌ |
| **Writable** | 可写流（数据去向） | 文件写入、HTTP 响应、数据库写入 | ❌ | ✅ |
| **Duplex** | 双工流（可读可写） | TCP Socket、加密通道 | ✅ | ✅ |
| **Transform** | 转换流（读写之间转换数据） | 压缩、加密、数据格式转换 | ✅ | ✅ |

### Readable（可读流）

可读流是数据的**生产者**。它从某个来源（文件、网络、内存）读取数据，通过 \`'data'\` 事件或 \`read()\` 方法输出。

**核心事件**：
| 事件 | 触发时机 |
| --- | --- |
| \`'data'\` | 有新数据块可读时 |
| \`'readable'\` | 流中有数据可读时（非流动模式） |
| \`'end'\` | 数据读取完毕时 |
| \`'error'\` | 读取过程中发生错误 |
| \`'close'\` | 底层资源关闭时 |

### Writable（可写流）

可写流是数据的**消费者**。它接收数据并写入某个目标（文件、网络、内存）。

**核心方法**：
| 方法 | 说明 |
| --- | --- |
| \`write(chunk, [encoding], [callback])\` | 写入数据块 |
| \`end([chunk], [encoding], [callback])\` | 结束写入 |
| \`cork()\` / \`uncork()\` | 批量写入优化 |

**核心事件**：
| 事件 | 触发时机 |
| --- | --- |
| \`'drain'\` | 内部缓冲区排空，可以继续写入 |
| \`'finish'\` | 所有数据写入完毕，end() 调用后 |
| \`'pipe'\` | 当有可读流 pipe 到本流时 |
| \`'error'\` | 写入过程中发生错误 |

### Duplex（双工流）

双工流同时实现了 Readable 和 Writable 接口。读和写是独立的，可以同时进行。典型用例：TCP Socket、加密流。

### Transform（转换流）

转换流是一种特殊的双工流，它的输出是输入经过某种转换的结果。典型用例：\`zlib.createGzip()\`（压缩）、\`crypto.createCipher()\`（加密）。

---

## 流动模式 vs 暂停模式

Readable 流有两种读取模式：

### 流动模式（Flowing Mode）

数据自动从底层系统读取，并通过 \`'data'\` 事件以最快速度提供给消费者。

**进入流动模式的方式**：
- 添加 \`'data'\` 事件监听器
- 调用 \`stream.resume()\`
- 调用 \`stream.pipe()\`

\`\`\`javascript
const stream = fs.createReadStream('file.txt');
stream.on('data', (chunk) => {
  console.log('收到数据:', chunk.length, '字节');
});
// 此时流处于流动模式，数据自动推送
\`\`\`

### 暂停模式（Paused Mode）

数据不会自动推送，需要显式调用 \`stream.read()\` 来读取数据。

**进入暂停模式的方式**：
- 调用 \`stream.pause()\`
- 移除所有 \`'data'\` 监听器后调用 \`stream.unpipe()\`
- 添加 \`'readable'\` 事件监听器

\`\`\`javascript
const stream = fs.createReadStream('file.txt');
stream.on('readable', () => {
  let chunk;
  while ((chunk = stream.read()) !== null) {
    console.log('手动读取:', chunk.length, '字节');
  }
});
\`\`\`

### 两种模式对比

| 特性 | 流动模式 | 暂停模式 |
| --- | --- | --- |
| 数据获取 | 自动推送（data 事件） | 手动拉取（read()） |
| 内存控制 | 由 highWaterMark 控制 | 由开发者手动控制 |
| 适用场景 | 简单处理，数据量可控 | 需要精确控制读取节奏 |
| 暂停方式 | stream.pause() | 本身就是暂停状态 |

---

## 背压（Backpressure）机制

背压是 Stream 最核心的概念之一，也是理解 \`pipe()\` 的关键。

### 什么是背压？

当可读流的数据生产速度**快于**可写流的消费速度时，数据会在内存中堆积。如果不处理，内存会不断增长最终导致崩溃。**背压就是可写流告诉可读流"我处理不过来了，请慢一点"的机制**。

### 背压的工作流程

1. 可写流的 \`write()\` 方法返回 \`false\`（内部缓冲区已满）
2. 可读流暂停推送数据（调用 \`pause()\`）
3. 可写流排空缓冲区后触发 \`'drain'\` 事件
4. 可读流恢复推送数据（调用 \`resume()\`）

\`\`\`javascript
const readable = fs.createReadStream('large-file.bin');
const writable = fs.createWriteStream('output.bin');

readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    // 写不进去了，暂停读取
    readable.pause();
    // 等缓冲区排空后恢复
    writable.once('drain', () => {
      readable.resume();
    });
  }
});
\`\`\`

### pipe() 自动处理背压

上述代码的手动背压处理非常繁琐。\`pipe()\` 方法**自动处理了背压**，这就是为什么推荐使用 \`pipe()\` 的原因：

\`\`\`javascript
// pipe() 内部自动处理了背压，一行代码搞定
readable.pipe(writable);
\`\`\`

---

## pipe 与 pipeline 的区别

### pipe() 方法

\`pipe()\` 是 Readable 流的方法，将一个可读流连接到可写流：

\`\`\`javascript
source.pipe(destination);
\`\`\`

**pipe() 的局限性**：
- 不自动处理错误和流销毁
- 不返回 Promise，无法用 async/await
- 链式调用时出错复杂

### pipeline() 函数（Node 10+）

\`pipeline()\` 是 \`stream\` 模块提供的工具函数，它解决了 \`pipe()\` 的局限性：

\`\`\`javascript
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

await pipelineAsync(
  fs.createReadStream('input.txt'),
  transformStream,
  fs.createWriteStream('output.txt')
);
// 自动处理错误、自动销毁所有流、返回 Promise
\`\`\`

### pipe vs pipeline 对比

| 特性 | pipe() | pipeline() |
| --- | --- | --- |
| 错误处理 | 不自动传播错误 | 自动传播和销毁 |
| 流完整销毁 | 需要手动处理 | 自动销毁所有流 |
| Promise 支持 | 不支持 | 支持（promisify 后） |
| 回调完成 | 不通知 | 完成后回调 |
| 适用场景 | 简单场景 | 生产环境推荐 |

---

## Stream 错误处理与销毁

### 错误处理

流中的错误不会自动传播——每个流都必须单独监听 \`'error'\` 事件。这是 Stream 最容易被忽视的陷阱：

\`\`\`javascript
// ❌ 常见错误：只监听了一个流的 error
readable.pipe(transform).pipe(writable);
readable.on('error', handleError);
// transform 和 writable 的错误没有被处理！

// ✅ 正确：每个流都监听 error
[readable, transform, writable].forEach(stream => {
  stream.on('error', handleError);
});
\`\`\`

### 流的销毁

\`stream.destroy([error])\` 方法销毁流，释放底层资源。在发生错误时，应该销毁相关流防止资源泄漏：

\`\`\`javascript
readable.on('error', (err) => {
  readable.destroy();
  writable.destroy();
});
\`\`\`

### pipeline() 自动处理

\`pipeline()\` 在任何一个流出错时，会自动销毁所有流，并回调错误。这是推荐 \`pipeline()\` 的主要原因。

---

## 自定义流

### 自定义 Readable 流

继承 \`Readable\` 类，实现 \`_read(size)\` 方法：

\`\`\`javascript
const { Readable } = require('stream');

class MyReadable extends Readable {
  constructor(options) {
    super(options);
    this._index = 0;
  }

  _read(size) {
    // 每次调用 push 一些数据
    if (this._index < 10) {
      this.push(\`数据块 #\${this._index++}\`);
    } else {
      this.push(null); // 推送 null 表示结束
    }
  }
}
\`\`\`

### 自定义 Writable 流

继承 \`Writable\` 类，实现 \`_write(chunk, encoding, callback)\` 方法：

\`\`\`javascript
const { Writable } = require('stream');

class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    console.log('写入:', chunk.toString());
    callback(); // 必须调用 callback 表示处理完毕
  }
}
\`\`\`

### 自定义 Transform 流

继承 \`Transform\` 类，实现 \`_transform(chunk, encoding, callback)\` 方法：

\`\`\`javascript
const { Transform } = require('stream');

class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}
\`\`\`

---

## objectMode 详解

默认情况下，流处理的是 Buffer 或字符串。开启 \`objectMode\` 后，流可以处理任意 JavaScript 对象：

\`\`\`javascript
const { Readable } = require('stream');

// objectMode 可读流——推送 JavaScript 对象
const objStream = new Readable({
  objectMode: true,
  read() {
    this.push({ id: 1, name: 'item1' });
    this.push({ id: 2, name: 'item2' });
    this.push(null); // 结束
  }
});

objStream.on('data', (obj) => {
  console.log(obj.id, obj.name); // 直接拿到对象
});
\`\`\`

**objectMode 的适用场景**：
- 数据库查询结果流
- 消息队列处理
- 数据管道中的中间转换
- CSV 解析/生成

---

## highWaterMark 调优

\`highWaterMark\` 控制内部缓冲区的大小。合理设置可以平衡内存使用和吞吐量：

| 模式 | 默认 highWaterMark | 单位 |
| --- | --- | --- |
| Buffer 模式 | 16KB（Readable）/ 16KB（Writable） | 字节 |
| objectMode | 16 | 对象个数 |

**调优建议**：
- 处理大文件：增大 highWaterMark（如 64KB 或 128KB），减少系统调用次数
- 内存受限：减小 highWaterMark，降低内存峰值
- 实时流：减小 highWaterMark，降低延迟
- 对象流：根据对象大小调整，大对象减少数量

\`\`\`javascript
// 大文件使用较大的缓冲区
const stream = fs.createReadStream('huge.bin', { highWaterMark: 1024 * 1024 }); // 1MB
\`\`\`

---

## 流与文件处理最佳实践

1. **始终使用 pipeline() 而非 pipe()**：自动错误处理和流销毁
2. **每个流都监听 error 事件**：即使使用了 pipeline
3. **大文件使用流式处理**：避免 readFileSync 加载全部内容
4. **合理设置 highWaterMark**：根据场景调优
5. **用完流记得关闭**：文件描述符是有限资源
6. **使用 stream.finished() 检测流结束**：比 end/finish 事件更可靠

下面这段代码完整演示了自定义流的实现、背压处理、pipeline 使用和 objectMode。`,
    code: `// ============================================================
// 第二章代码演示：Stream 深入实战
// ============================================================
const { Readable, Writable, Transform, pipeline } = require("stream");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");

// 将 pipeline 转为 Promise 版本
const pipelineAsync = promisify(pipeline);

// ============================================================
// 演示 1：自定义 Readable 流——生成数字序列
// ============================================================
console.log("===== 1. 自定义 Readable 流 =====");

class NumberReadable extends Readable {
  constructor(options) {
    // 调用父类构造函数，传入选项
    super(options);
    this._current = 0; // 当前数字
    this._max = options.max || 10; // 生成的数字总数
  }

  // _read() 是 Readable 流必须实现的方法
  // 当流内部需要更多数据时，Node.js 会自动调用这个方法
  // size 参数由 highWaterMark 决定，建议但不强制推送等量数据
  _read(size) {
    // 每次推送一个数字（转为字符串）
    if (this._current < this._max) {
      this._current++;
      const data = "数字 " + this._current;
      // this.push() 将数据推入内部缓冲区
      // 返回 true 表示还可以继续推送，false 表示缓冲区已满
      const canPushMore = this.push(data);
      if (!canPushMore) {
        // 缓冲区满了，等待下次 _read 调用
      }
    } else {
      // push(null) 表示数据已经全部推送完毕
      this.push(null);
      console.log("  数字流生成完毕");
    }
  }
}

// 创建数字流
const numberStream = new NumberReadable({ max: 5, highWaterMark: 2 });
console.log("开始读取数字流...");
numberStream.on("data", (chunk) => {
  console.log("  收到:", chunk.toString());
});
numberStream.on("end", () => {
  console.log("  数字流结束");
});

// ============================================================
// 演示 2：自定义 Transform 流——大写转换器
// ============================================================
console.log("\\n===== 2. 自定义 Transform 流 =====");

class UpperCaseTransform extends Transform {
  constructor(options) {
    super(options);
    this._transformCount = 0; // 转换计数
  }

  // _transform() 是 Transform 流必须实现的方法
  // chunk: 输入的数据块
  // encoding: 编码（Buffer 模式下为 'buffer'）
  // callback: 处理完成后必须调用
  _transform(chunk, encoding, callback) {
    this._transformCount++;
    // 将数据转为大写
    const upper = chunk.toString().toUpperCase();
    console.log("  转换 #" + this._transformCount + ": '" + chunk.toString().trim() + "' -> '" + upper.trim() + "'");
    // this.push() 将转换后的数据推入可读端
    this.push(upper);
    // 调用 callback 通知流处理完毕，可以接收下一个 chunk
    callback();
  }

  // _flush() 在流结束时调用，用于推送最后的剩余数据
  _flush(callback) {
    console.log("  转换流冲洗中...");
    this.push("\\n--- 转换完成 ---\\n");
    callback();
  }
}

// 创建转换流
const upperTransform = new UpperCaseTransform();

// 测试转换流
upperTransform.write("hello world");
upperTransform.write("node.js stream");
upperTransform.end("goodbye");

upperTransform.on("data", (chunk) => {
  console.log("  输出:", chunk.toString().trim());
});
upperTransform.on("end", () => {
  console.log("  转换流结束");
});

// ============================================================
// 演示 3：自定义 Writable 流——数据收集器
// ============================================================
console.log("\\n===== 3. 自定义 Writable 流 =====");

class DataCollector extends Writable {
  constructor(options) {
    super(options);
    this.chunks = []; // 收集所有写入的数据块
    this.totalBytes = 0;
  }

  // _write() 是 Writable 流必须实现的方法
  // 每次外部调用 write() 时，会触发这个方法
  _write(chunk, encoding, callback) {
    this.chunks.push(chunk.toString());
    this.totalBytes += chunk.length;
    console.log("  写入数据块:", chunk.toString().trim(), "(", chunk.length, "字节)");
    // 调用 callback 表示处理完毕，可以接收下一个 chunk
    // 如果 callback 不调用，流会阻塞
    callback();
  }

  // _final() 在流结束时调用（end() 被调用后）
  _final(callback) {
    console.log("  收集器 final 阶段");
    console.log("  共收集", this.chunks.length, "个数据块,", this.totalBytes, "字节");
    this.emit("collected", this.chunks.join(""));
    callback();
  }
}

// 测试可写流
const collector = new DataCollector();
collector.on("collected", (allData) => {
  console.log("  收集到的全部数据:", allData);
});
collector.write("片段A");
collector.write("片段B");
collector.write("片段C");
collector.end("最终片段");

// ============================================================
// 演示 4：背压（Backpressure）机制演示
// ============================================================
console.log("\\n===== 4. 背压机制演示 =====");

// 创建一个快速生产者（可读流）
class FastProducer extends Readable {
  constructor() {
    super({ highWaterMark: 3 }); // 小缓冲区，容易触发背压
    this._count = 0;
  }
  _read() {
    if (this._count < 10) {
      this._count++;
      // push 返回 false 表示缓冲区已满
      const ok = this.push("数据块#" + this._count);
      if (!ok) {
        console.log("  [生产者] 缓冲区已满，暂停推送");
      }
    } else {
      this.push(null);
    }
  }
}

// 创建一个慢速消费者（可写流）
class SlowConsumer extends Writable {
  constructor() {
    super({ highWaterMark: 3 });
    this._processed = 0;
  }
  _write(chunk, encoding, callback) {
    this._processed++;
    console.log("  [消费者] 处理:", chunk.toString(), "(第" + this._processed + "个)");
    // 模拟慢速处理：延迟 50ms 再调用 callback
    // 这会导致内部缓冲区堆积，触发背压
    setTimeout(() => {
      callback();
    }, 50);
  }
}

const producer = new FastProducer();
const consumer = new SlowConsumer();

console.log("开始背压演示...");
// 手动实现背压处理（演示 pipe 内部的原理）
producer.on("data", (chunk) => {
  const canWrite = consumer.write(chunk);
  if (!canWrite) {
    console.log("  [背压] 消费者处理不过来，暂停生产者");
    producer.pause();
    // 等待消费者排空缓冲区
    consumer.once("drain", () => {
      console.log("  [drain] 消费者缓冲区排空，恢复生产者");
      producer.resume();
    });
  }
});
producer.on("end", () => {
  consumer.end();
  console.log("  生产者结束");
});
consumer.on("finish", () => {
  console.log("  消费者处理完毕");
});

// ============================================================
// 演示 5：pipeline 组合流
// ============================================================
console.log("\\n===== 5. pipeline 组合流 =====");

// 创建临时测试文件
const tmpDir = path.join(os.tmpdir(), "node-stream-demo");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}
const inputFile = path.join(tmpDir, "input.txt");
const outputFile = path.join(tmpDir, "output.txt");

// 写入测试数据
const testData = "第一行：Hello Node.js Stream\\n第二行：Pipeline 演示\\n第三行：自动错误处理\\n";
fs.writeFileSync(inputFile, testData, "utf8");

// 创建一个行号追加 Transform 流
class LineNumberTransform extends Transform {
  constructor() {
    super();
    this._lineNumber = 0;
    this._remainder = ""; // 保存不完整的行
  }

  _transform(chunk, encoding, callback) {
    // 将新数据和之前剩余的不完整行合并
    const data = this._remainder + chunk.toString();
    const lines = data.split("\\n");
    // 最后一行可能不完整，保留到下次处理
    this._remainder = lines.pop();

    for (const line of lines) {
      this._lineNumber++;
      this.push(this._lineNumber + ": " + line + "\\n");
    }
    callback();
  }

  _flush(callback) {
    // 处理最后剩余的不完整行
    if (this._remainder) {
      this._lineNumber++;
      this.push(this._lineNumber + ": " + this._remainder + "\\n");
    }
    callback();
  }
}

// 使用 pipeline 组合多个流
(async () => {
  try {
    console.log("输入文件内容:");
    console.log(fs.readFileSync(inputFile, "utf8"));

    await pipelineAsync(
      fs.createReadStream(inputFile, { encoding: "utf8" }), // 读取文件
      new LineNumberTransform(),                             // 添加行号
      fs.createWriteStream(outputFile, { encoding: "utf8" }) // 写入文件
    );

    console.log("\\n输出文件内容:");
    console.log(fs.readFileSync(outputFile, "utf8"));
    console.log("pipeline 执行成功！");

    // 清理文件
    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);
    fs.rmdirSync(tmpDir);
  } catch (err) {
    console.log("pipeline 出错:", err.message);
    // 清理
    try {
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
      if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
    } catch (e) { /* ignore */ }
  }
})();

// ============================================================
// 演示 6：objectMode 演示——对象流处理
// ============================================================
console.log("\\n===== 6. objectMode 对象流 =====");

// 创建对象可读流
class UserReadable extends Readable {
  constructor() {
    super({ objectMode: true }); // 启用 objectMode
    this._users = [
      { id: 1, name: "张三", score: 85 },
      { id: 2, name: "李四", score: 92 },
      { id: 3, name: "王五", score: 78 },
      { id: 4, name: "赵六", score: 95 },
      { id: 5, name: "钱七", score: 60 },
    ];
  }

  _read() {
    if (this._users.length > 0) {
      this.push(this._users.shift());
    } else {
      this.push(null);
    }
  }
}

// 创建对象转换流——成绩分级
class GradeTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(user, encoding, callback) {
    // 根据分数添加等级
    let grade;
    if (user.score >= 90) grade = "A";
    else if (user.score >= 80) grade = "B";
    else if (user.score >= 70) grade = "C";
    else if (user.score >= 60) grade = "D";
    else grade = "F";

    this.push({
      ...user,
      grade: grade,
      passed: user.score >= 60,
    });
    callback();
  }
}

// 创建对象可写流——收集结果
class ResultCollector extends Writable {
  constructor() {
    super({ objectMode: true });
    this.results = [];
  }

  _write(user, encoding, callback) {
    this.results.push(user);
    callback();
  }

  _final(callback) {
    console.log("  成绩报告:");
    console.table(this.results.map((u) => ({
      ID: u.id,
      姓名: u.name,
      分数: u.score,
      等级: u.grade,
      通过: u.passed ? "是" : "否",
    })));

    const avgScore = (this.results.reduce((s, u) => s + u.score, 0) / this.results.length).toFixed(1);
    const passCount = this.results.filter((u) => u.passed).length;
    console.log("  平均分:", avgScore, "| 通过率:", passCount + "/" + this.results.length);
    callback();
  }
}

// 使用 pipeline 组合对象流
const userStream = new UserReadable();
const gradeStream = new GradeTransform();
const resultStream = new ResultCollector();

pipeline(userStream, gradeStream, resultStream, (err) => {
  if (err) {
    console.log("  对象流 pipeline 出错:", err.message);
  } else {
    console.log("  对象流处理完成！");
  }
});`,
  },

  // =========================================================
  // 第三章：Promise 深入
  // =========================================================
  {
    id: "node-promise-deep",
    title: "Promise 深入",
    icon: "🤝",
    group: "异步编程补充",
    content: `## Promise 概述

Promise 是 JavaScript 异步编程的基石。它解决了"回调地狱"问题，提供了统一的异步操作处理方式。理解 Promise 的底层机制，是成为高级 JavaScript 开发者必经之路。

Promise 本质上是一个**状态机**，也是异步操作的**容器**。它代表一个异步操作的最终完成（或失败）及其结果值。

### 为什么需要 Promise？

在 Promise 之前，异步编程依赖回调函数：

\`\`\`javascript
// 回调地狱：嵌套的回调函数
fs.readFile('a.txt', (err, dataA) => {
  if (err) throw err;
  fs.readFile('b.txt', (err, dataB) => {
    if (err) throw err;
    fs.readFile('c.txt', (err, dataC) => {
      if (err) throw err;
      console.log(dataA + dataB + dataC);
    });
  });
});
\`\`\`

Promise 将嵌套的回调变成了链式调用：

\`\`\`javascript
Promise.all([
  fsp.readFile('a.txt'),
  fsp.readFile('b.txt'),
  fsp.readFile('c.txt')
]).then(([a, b, c]) => {
  console.log(a + b + c);
});
\`\`\`

---

## Promise 状态机

Promise 有三种状态，且状态转换是**不可逆**的：

\`\`\`
new Promise() ──► pending（待定）
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   fulfilled（已完成）      rejected（已拒绝）
        │                       │
        └───────────┬───────────┘
                    ▼
            settled（已敲定，终态）
\`\`\`

| 状态 | 说明 | 触发条件 | 可否逆转 |
| --- | --- | --- | --- |
| **pending** | 待定状态，初始状态 | 创建 Promise 时 | 只能变为 fulfilled 或 rejected |
| **fulfilled** | 已完成 | 调用 resolve(value) | 不可逆，不可变 |
| **rejected** | 已拒绝 | 调用 reject(reason) 或抛出异常 | 不可逆，不可变 |

### 关键特性

1. **状态不可逆**：一旦从 pending 变为 fulfilled 或 rejected，就不能再变
2. **结果不可变**：resolve/reject 的值在 settled 后不可变
3. **then 返回新 Promise**：每次调用 .then() 都返回一个新的 Promise
4. **异步执行**：即使 Promise 立即 resolve，then 回调也在微任务中执行

---

## then / catch / finally 链式调用

### then(onFulfilled, onRejected)

\`then()\` 返回一个新的 Promise，这使得链式调用成为可能。then 回调的返回值会影响链上后续 Promise 的状态：

\`\`\`javascript
Promise.resolve(1)
  .then(v => v + 1)      // 返回 2，后续 then 收到 2
  .then(v => v * 3)      // 返回 6，后续 then 收到 6
  .then(v => console.log(v)); // 输出 6
\`\`\`

**then 返回值规则**：
| 返回值类型 | 对后续 Promise 的影响 |
| --- | --- |
| 非 Promise 值 | 包装为 Promise.resolve(value) |
| Promise 对象 | 等待该 Promise 完成，传递其值 |
| 没有 return | 相当于 return undefined |
| 抛出异常 | 相当于 return Promise.reject(error) |

### catch(onRejected)

\`catch()\` 本质上是 \`then(undefined, onRejected)\` 的语法糖。它专门处理链上的错误：

\`\`\`javascript
Promise.reject(new Error('出错了'))
  .catch(err => {
    console.log('捕获:', err.message);
    return '恢复值'; // 返回恢复值，后续 then 可以继续
  })
  .then(v => console.log('继续:', v)); // 输出: 继续: 恢复值
\`\`\`

### finally(onFinally)

\`finally()\` 在 Promise settled 后执行（无论成功还是失败），不接收参数，通常用于清理操作：

\`\`\`javascript
showLoading(true);
fetchData()
  .then(data => render(data))
  .catch(err => showError(err))
  .finally(() => showLoading(false)); // 无论成功失败都关闭 loading
\`\`\`

**finally 的特殊行为**：
- 除非抛出异常或返回 rejected Promise，否则**不改变**链上传递的值
- finally 回调没有参数

---

## Promise 静态方法

### Promise.all(iterable)

接收一个 Promise 可迭代对象，返回一个新的 Promise：
- 所有 Promise 都 fulfilled → 返回所有结果的数组（保持顺序）
- 任何一个 Promise rejected → 立即 reject，返回第一个 reject 的原因

\`\`\`javascript
Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => console.log('全部完成'))
  .catch(err => console.log('有一个失败:', err));
\`\`\`

**适用场景**：需要等待多个独立异步操作全部完成。如：同时请求多个 API，合并结果。

### Promise.race(iterable)

返回第一个 settled 的 Promise 的结果（无论成功或失败）：

\`\`\`javascript
Promise.race([p1, p2, p3])
  .then(result => console.log('最快完成:', result));
\`\`\`

**适用场景**：超时控制、竞速请求。

### Promise.allSettled(iterable)（ES2020）

等待所有 Promise 都 settled（成功或失败），返回每个 Promise 的结果对象：

\`\`\`javascript
const results = await Promise.allSettled([p1, p2, p3]);
// results = [
//   { status: 'fulfilled', value: 42 },
//   { status: 'rejected', reason: Error('出错了') },
//   { status: 'fulfilled', value: 'hello' },
// ]
\`\`\`

**适用场景**：批量操作，需要知道每个操作的结果，即使有些失败也继续。

### Promise.any(iterable)（ES2021）

返回第一个 fulfilled 的 Promise 的结果。如果所有 Promise 都 rejected，返回 AggregateError：

\`\`\`javascript
Promise.any([p1, p2, p3])
  .then(result => console.log('第一个成功:', result))
  .catch(err => console.log('全部失败'));
\`\`\`

**适用场景**：从多个镜像/CDN 获取资源，哪个先成功用哪个。

### Promise.resolve(value) / Promise.reject(reason)

快速创建已 settled 的 Promise：

\`\`\`javascript
Promise.resolve(42);   // 等价于 new Promise(resolve => resolve(42))
Promise.reject('err');  // 等价于 new Promise((_, reject) => reject('err'))
\`\`\`

---

## Promise 静态方法对比

| 方法 | 等待行为 | 成功条件 | 失败条件 | 返回值 |
| --- | --- | --- | --- | --- |
| Promise.all | 全部完成 | 全部成功 | 任一失败 | 成功值数组 |
| Promise.race | 第一个 settled | 第一个成功 | 第一个失败 | 第一个 settled 的值 |
| Promise.allSettled | 全部完成 | 永不失败 | 全部完成才返回 | 结果对象数组 |
| Promise.any | 第一个成功 | 任一成功 | 全部失败 | 第一个成功的值 |

---

## 微任务队列

Promise 的 \`then/catch/finally\` 回调被放入**微任务队列（Microtask Queue）**，而不是宏任务队列。

### 执行优先级

\`\`\`
同步代码 → process.nextTick → 微任务(Promise/queueMicrotask) → 宏任务(setTimeout/setImmediate)
\`\`\`

\`\`\`javascript
console.log('1. 同步');
Promise.resolve().then(() => console.log('3. 微任务'));
setTimeout(() => console.log('5. 宏任务'), 0);
process.nextTick(() => console.log('2. nextTick'));
console.log('4. 同步');
// 输出顺序: 1 → 4 → 2 → 3 → 5
\`\`\`

---

## Promise 错误穿透

Promise 链中，错误会一直向下传播，直到被 catch 捕获。没有被 catch 的错误会变成 \`unhandledRejection\`：

\`\`\`javascript
Promise.resolve(1)
  .then(v => { throw new Error('步骤1出错'); })
  .then(v => console.log('这步被跳过'))
  .then(v => console.log('这步也被跳过'))
  .catch(err => console.log('捕获:', err.message)); // 这里捕获到错误
\`\`\`

---

## Promise 反模式

### 反模式 1：过度嵌套

\`\`\`javascript
// ❌ 反模式：嵌套 Promise（又回到了回调地狱）
fetchUser().then(user => {
  fetchOrders(user.id).then(orders => {
    fetchDetails(orders[0].id).then(details => {
      console.log(details);
    });
  });
});

// ✅ 正确：扁平化链式调用
fetchUser()
  .then(user => fetchOrders(user.id))
  .then(orders => fetchDetails(orders[0].id))
  .then(details => console.log(details));
\`\`\`

### 反模式 2：then 中的 Promise 未 return

\`\`\`javascript
// ❌ 反模式：忘记 return
fetchUser().then(user => {
  fetchOrders(user.id); // 忘记 return！后续 then 不会等待
}).then(orders => {
  console.log(orders); // undefined！因为上一个 then 没 return
});

// ✅ 正确：return Promise
fetchUser().then(user => {
  return fetchOrders(user.id);
}).then(orders => {
  console.log(orders); // 正确获取
});
\`\`\`

### 反模式 3：不必要的 Promise 包装

\`\`\`javascript
// ❌ 反模式：已经返回 Promise 还包装一层
function fetchData() {
  return new Promise((resolve, reject) => {
    fetch(url).then(resolve).catch(reject);
  });
}

// ✅ 正确：直接返回
function fetchData() {
  return fetch(url);
}
\`\`\`

---

## Promise 取消

原生 Promise 不支持取消，但可以结合 AbortController 实现：

\`\`\`javascript
function createCancellablePromise(asyncFn, signal) {
  return new Promise((resolve, reject) => {
    // 监听取消信号
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    signal.addEventListener('abort', () => {
      reject(new DOMException('Aborted', 'AbortError'));
    });
    asyncFn(resolve, reject);
  });
}
\`\`\`

---

## Promise 超时实现

\`\`\`javascript
function promiseWithTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('操作超时')), timeoutMs)
    ),
  ]);
}
\`\`\`

下面这段代码完整演示了 Promise 状态机、各种静态方法、超时和取消实现。`,
    code: `// ============================================================
// 第三章代码演示：Promise 深入实战
// ============================================================

// ============================================================
// 演示 1：模拟 Promise 状态机
// ============================================================
console.log("===== 1. 模拟 Promise 状态机 =====");

// 手写一个简化版 Promise 状态机，帮助理解内部原理
class SimplePromise {
  constructor(executor) {
    // 初始状态：pending
    this._state = "pending";
    // 存储结果值
    this._value = undefined;
    // 存储 then 回调队列
    this._callbacks = [];

    const resolve = (value) => {
      // 状态不可逆：只有 pending 状态才能变更
      if (this._state !== "pending") return;
      this._state = "fulfilled";
      this._value = value;
      console.log("  [状态机] pending → fulfilled, 值:", value);
      // 执行所有已注册的回调
      this._executeCallbacks();
    };

    const reject = (reason) => {
      if (this._state !== "pending") return;
      this._state = "rejected";
      this._value = reason;
      console.log("  [状态机] pending → rejected, 原因:", reason);
      this._executeCallbacks();
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  _executeCallbacks() {
    // 异步执行回调（微任务级别）
    setImmediate(() => {
      for (const cb of this._callbacks) {
        if (this._state === "fulfilled" && cb.onFulfilled) {
          cb.onFulfilled(this._value);
        } else if (this._state === "rejected" && cb.onRejected) {
          cb.onRejected(this._value);
        }
      }
      this._callbacks = [];
    });
  }

  then(onFulfilled, onRejected) {
    this._callbacks.push({ onFulfilled, onRejected });
    // 如果已经 settled，立即异步执行回调
    if (this._state !== "pending") {
      this._executeCallbacks();
    }
    return this; // 简化：不返回新 Promise
  }
}

// 测试手写 Promise 状态机
console.log("创建 Promise...");
const sp = new SimplePromise((resolve, reject) => {
  console.log("  executor 同步执行");
  resolve("成功结果");
});
sp.then(
  (v) => console.log("  then fulfilled:", v),
  (e) => console.log("  then rejected:", e)
);

// 测试状态不可逆
console.log("\\n测试状态不可逆:");
const sp2 = new SimplePromise((resolve, reject) => {
  resolve("第一次");
  resolve("第二次"); // 不会生效
  reject("会拒绝吗"); // 不会生效
});
sp2.then((v) => console.log("  结果:", v));

// 测试 executor 中抛出异常
console.log("\\n测试异常捕获:");
const sp3 = new SimplePromise((resolve, reject) => {
  throw new Error("executor 抛出异常");
});
sp3.then(
  (v) => console.log("  fulfilled:", v),
  (e) => console.log("  rejected:", e.message)
);

// ============================================================
// 演示 2：实现 Promise.all / race / allSettled / any
// ============================================================
console.log("\\n===== 2. 实现 Promise 静态方法 =====");

// 实现 Promise.all
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError("参数必须是可迭代对象"));
    }
    const results = [];
    let completed = 0;
    const total = promises.length;

    if (total === 0) {
      return resolve([]);
    }

    promises.forEach((promise, index) => {
      // 确保每个元素都是 Promise
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value; // 保持顺序
          completed++;
          if (completed === total) {
            resolve(results);
          }
        },
        (reason) => {
          reject(reason); // 任一失败立即 reject
        }
      );
    });
  });
}

// 实现 Promise.race
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const promise of promises) {
      Promise.resolve(promise).then(resolve, reject);
    }
  });
}

// 实现 Promise.allSettled
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;
    const total = promises.length;

    if (total === 0) {
      return resolve([]);
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = { status: "fulfilled", value };
          completed++;
          if (completed === total) resolve(results);
        },
        (reason) => {
          results[index] = { status: "rejected", reason };
          completed++;
          if (completed === total) resolve(results);
        }
      );
    });
  });
}

// 实现 Promise.any
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let rejectedCount = 0;
    const total = promises.length;

    if (total === 0) {
      return reject(new AggregateError([], "All promises were rejected"));
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => resolve(value), // 任一成功立即 resolve
        (reason) => {
          errors[index] = reason;
          rejectedCount++;
          if (rejectedCount === total) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        }
      );
    });
  });
}

// 测试实现的静态方法
(async () => {
  console.log("--- Promise.all ---");
  try {
    const allResult = await promiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ]);
    console.log("  all 结果:", allResult);
  } catch (e) {
    console.log("  all 失败:", e.message);
  }

  // all 失败场景
  try {
    await promiseAll([
      Promise.resolve(1),
      Promise.reject(new Error("中间失败")),
      Promise.resolve(3),
    ]);
  } catch (e) {
    console.log("  all 失败场景:", e.message);
  }

  console.log("\\n--- Promise.race ---");
  const raceResult = await promiseRace([
    new Promise((r) => setTimeout(() => r("慢"), 100)),
    new Promise((r) => setTimeout(() => r("快"), 10)),
    new Promise((r) => setTimeout(() => r("中"), 50)),
  ]);
  console.log("  race 结果:", raceResult);

  console.log("\\n--- Promise.allSettled ---");
  const settledResult = await promiseAllSettled([
    Promise.resolve("成功"),
    Promise.reject(new Error("失败")),
    Promise.resolve(42),
  ]);
  console.log("  allSettled 结果:");
  settledResult.forEach((r, i) => {
    console.log("    #" + i + ": " + r.status + " - " + (r.status === "fulfilled" ? r.value : r.reason.message));
  });

  console.log("\\n--- Promise.any ---");
  try {
    const anyResult = await promiseAny([
      new Promise((_, reject) => setTimeout(() => reject(new Error("失败1")), 10)),
      new Promise((resolve) => setTimeout(() => resolve("成功的那个"), 30)),
      new Promise((_, reject) => setTimeout(() => reject(new Error("失败2")), 20)),
    ]);
    console.log("  any 结果:", anyResult);
  } catch (e) {
    console.log("  any 全部失败:", e.message);
  }

  // ============================================================
  // 演示 3：Promise 超时实现
  // ============================================================
  console.log("\\n===== 3. Promise 超时 =====");

  function promiseWithTimeout(promise, timeoutMs, timeoutMsg) {
    const msg = timeoutMsg || "操作超时 (" + timeoutMs + "ms)";
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(msg)), timeoutMs)
      ),
    ]);
  }

  // 测试超时
  try {
    const fastPromise = new Promise((resolve) =>
      setTimeout(() => resolve("快速完成"), 50)
    );
    const result = await promiseWithTimeout(fastPromise, 200, "太快了");
    console.log("  快速操作结果:", result);
  } catch (e) {
    console.log("  快速操作失败:", e.message);
  }

  try {
    const slowPromise = new Promise((resolve) =>
      setTimeout(() => resolve("太慢了"), 200)
    );
    const result = await promiseWithTimeout(slowPromise, 50, "超时啦");
    console.log("  慢速操作结果:", result);
  } catch (e) {
    console.log("  慢速操作超时:", e.message);
  }

  // ============================================================
  // 演示 4：可取消 Promise
  // ============================================================
  console.log("\\n===== 4. 可取消 Promise =====");

  function createCancellablePromise(asyncTask, timeoutMs) {
    let cancelFn = null;

    const promise = new Promise((resolve, reject) => {
      // 创建取消函数
      cancelFn = (reason) => {
        reject(new Error(reason || "任务已取消"));
      };

      // 执行异步任务
      asyncTask(resolve, reject);
    });

    // 附加取消功能
    promise.cancel = (reason) => {
      if (cancelFn) {
        cancelFn(reason);
        cancelFn = null;
      }
    };

    return promise;
  }

  // 测试取消
  const cancellableTask = createCancellablePromise((resolve) => {
    const timer = setTimeout(() => {
      resolve("任务完成");
    }, 200);
    // 这里可以保存 timer 引用用于清理，简化实现省略
  });

  cancellableTask.then(
    (v) => console.log("  任务结果:", v),
    (e) => console.log("  任务取消:", e.message)
  );

  // 在 50ms 后取消
  setTimeout(() => {
    console.log("  取消任务...");
    cancellableTask.cancel("用户手动取消");
  }, 50);

  // ============================================================
  // 演示 5：Promise 错误穿透与链式调用
  // ============================================================
  console.log("\\n===== 5. 错误穿透与链式调用 =====");

  Promise.resolve("初始值")
    .then((v) => {
      console.log("  步骤1:", v);
      return v + " → 步骤1";
    })
    .then((v) => {
      console.log("  步骤2:", v);
      throw new Error("步骤2出错了");
    })
    .then((v) => {
      // 这个不会被调用，因为步骤2抛出了错误
      console.log("  步骤3（不会执行）:", v);
      return v + " → 步骤3";
    })
    .catch((err) => {
      console.log("  catch 捕获:", err.message);
      return "恢复的值"; // 返回恢复值，链可以继续
    })
    .then((v) => {
      console.log("  步骤4（恢复后）:", v);
      return v + " → 步骤4";
    })
    .finally(() => {
      console.log("  finally: 清理操作（无论成功失败都执行）");
    })
    .then((v) => {
      console.log("  最终结果:", v);
    });

  // ============================================================
  // 演示 6：微任务执行顺序
  // ============================================================
  console.log("\\n===== 6. 微任务执行顺序 =====");

  console.log("1. 同步代码开始");

  setTimeout(() => console.log("6. setTimeout 宏任务"), 0);
  setImmediate(() => console.log("7. setImmediate 宏任务"));

  Promise.resolve().then(() => {
    console.log("4. 第一个 Promise.then");
    // 嵌套的 Promise.then 会在当前微任务之后执行
    Promise.resolve().then(() => {
      console.log("5. 嵌套的 Promise.then");
    });
  });

  process.nextTick(() => {
    console.log("3. nextTick 回调");
  });

  console.log("2. 同步代码结束");
  // 预期顺序: 1 → 2 → 3 → 4 → 5 → 6/7（顺序不确定）

  // ============================================================
  // 演示 7：Promise 反模式对比
  // ============================================================
  console.log("\\n===== 7. Promise 反模式对比 =====");

  // 反模式：then 中 Promise 未 return
  console.log("--- 反模式：未 return ---");
  function badChain() {
    return Promise.resolve(1)
      .then((v) => {
        Promise.resolve(v * 10); // 忘记 return！
      })
      .then((v) => {
        console.log("  未 return 的结果:", v); // undefined
      });
  }

  // 正确模式：return Promise
  console.log("--- 正确：return Promise ---");
  function goodChain() {
    return Promise.resolve(1)
      .then((v) => {
        return Promise.resolve(v * 10); // 正确 return
      })
      .then((v) => {
        console.log("  return 的结果:", v); // 10
      });
  }

  badChain();
  goodChain();
})();`,
  },

  // =========================================================
  // 第四章：Async/Await 深入
  // =========================================================
  {
    id: "node-async-await-deep",
    title: "Async/Await 深入",
    icon: "⏳",
    group: "异步编程补充",
    content: `## Async/Await 概述

Async/Await 是 ES2017（ES8）引入的异步编程语法糖，它建立在 Promise 之上，让异步代码**看起来像同步代码**。这极大地提高了代码的可读性和可维护性。

### 核心概念

- **async 函数**：声明为 \`async\` 的函数**始终返回 Promise**
- **await 表达式**：暂停 async 函数执行，等待 Promise 完成，然后恢复执行并返回 Promise 的结果

---

## async 函数本质

### async 函数返回 Promise

声明为 \`async\` 的函数，无论函数体内是否使用 \`await\`，返回值都会被自动包装为 Promise：

\`\`\`javascript
async function foo() {
  return 42; // 等价于 return Promise.resolve(42)
}

foo().then(v => console.log(v)); // 42
\`\`\`

**返回值规则**：
| 返回值类型 | 实际返回 |
| --- | --- |
| 非 Promise 值 | Promise.resolve(value) |
| Promise 对象 | 直接返回该 Promise |
| 抛出异常 | Promise.reject(error) |
| 无 return | Promise.resolve(undefined) |

### async 函数中的同步部分

async 函数中，\`await\` 之前的代码是**同步执行**的，直到遇到第一个 \`await\`，函数暂停并将控制权交还给调用者：

\`\`\`javascript
async function demo() {
  console.log('1. 同步部分');
  await Promise.resolve();
  console.log('3. 异步部分');
}
console.log('2. 调用者');
demo();
// 输出: 1 → 2 → 3
\`\`\`

---

## await 暂停与恢复

\`await\` 的本质是把 async 函数变成一个**协程**。当遇到 \`await\` 时：

1. 计算 \`await\` 后面的表达式
2. 如果表达式是 Promise，等待它 settled
3. 函数暂停执行，控制权交还给调用者
4. Promise settled 后，恢复执行
5. 如果 Promise fulfilled，\`await\` 返回其值
6. 如果 Promise rejected，\`await\` 抛出异常

\`\`\`javascript
async function fetchData() {
  console.log('开始请求');
  const data = await fetch('/api/data'); // 暂停，等待 Promise
  console.log('收到数据:', data);        // 恢复执行
  return data;
}
\`\`\`

---

## 错误处理

### try-catch 方式

在 async 函数中，可以使用熟悉的 \`try-catch\` 语法处理异步错误：

\`\`\`javascript
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    const json = await data.json();
    return json;
  } catch (err) {
    console.error('请求失败:', err.message);
    return null; // 返回默认值，优雅降级
  }
}
\`\`\`

### .catch() 方式

也可以在调用 async 函数时用 \`.catch()\` 处理错误：

\`\`\`javascript
async function fetchData() {
  const data = await fetch('/api/data');
  return data.json();
}

fetchData()
  .then(json => console.log(json))
  .catch(err => console.error('失败:', err));
\`\`\`

### 两种方式对比

| 方式 | 适用场景 | 优势 |
| --- | --- | --- |
| try-catch | 函数内部处理错误 | 可以处理多个 await 的错误，类似同步代码 |
| .catch() | 调用方处理错误 | 集中处理，不侵入函数内部逻辑 |

**最佳实践**：在 async 函数内部处理可恢复的错误，在调用方处理致命错误。

---

## 并发执行 vs 串行执行

### 串行执行（Sequential）

每个 await 等待前一个完成后再执行：

\`\`\`javascript
// 串行：总耗时 = t1 + t2 + t3
async function sequential() {
  const r1 = await fetch1(); // 等待 t1
  const r2 = await fetch2(); // 等待 t2
  const r3 = await fetch3(); // 等待 t3
  return [r1, r2, r3];
}
\`\`\`

### 并发执行（Concurrent）

多个 Promise 同时启动，然后等待全部完成：

\`\`\`javascript
// 并发：总耗时 = max(t1, t2, t3)
async function concurrent() {
  const [r1, r2, r3] = await Promise.all([
    fetch1(),
    fetch2(),
    fetch3(),
  ]);
  return [r1, r2, r3];
}
\`\`\`

### 性能对比

如果每个请求耗时 100ms：

| 方式 | 3 个请求总耗时 |
| --- | --- |
| 串行 | 100 + 100 + 100 = 300ms |
| 并发 | max(100, 100, 100) = 100ms |

**3 倍的性能差距！** 这就是为什么需要理解并发。

---

## return vs return await

### 区别在于错误堆栈

在 async 函数中，\`return await promise\` 和 \`return promise\` 在大多数情况下行为相同，但有一个关键区别：

\`\`\`javascript
// 方式 A：return await
async function fooA() {
  return await bar(); // 如果 bar() rejects，堆栈包含 fooA
}

// 方式 B：return（无 await）
async function fooB() {
  return bar(); // 如果 bar() rejects，堆栈不包含 fooB
}
\`\`\`

**规范建议**：
- 在 try-catch 中必须使用 \`return await\`（否则 catch 捕获不到）
- 在函数最后一行，不需要 \`return await\`（让调用方处理）
- 使用 ESLint 的 \`no-return-await\` 规则自动检测

---

## 顶层 await（Top-level Await）

ES2022 引入，Node.js 14.8+ 支持。在模块顶层直接使用 \`await\`（无需 async 函数包装）：

\`\`\`javascript
// 在 .mjs 文件或 type: "module" 的包中
const data = await fetch('https://api.example.com/data');
const json = await data.json();
export default json;
\`\`\`

**使用限制**：
- 仅在 ES Modules 中可用（.mjs 或 type: "module"）
- CommonJS 模块不支持顶层 await
- 会阻塞依赖该模块的其他模块加载

---

## async 迭代器（for-await-of）

\`for-await-of\` 可以遍历异步可迭代对象：

\`\`\`javascript
async function* asyncGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

async function consume() {
  for await (const value of asyncGenerator()) {
    console.log(value); // 依次输出 1, 2, 3
  }
}
\`\`\`

**适用场景**：
- 遍历数据库查询游标（分页）
- 逐行读取大文件
- 处理流式 API 响应

---

## async 生成器

async 生成器结合了 async/await 和生成器的能力：

\`\`\`javascript
async function* paginatedFetch(url) {
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await fetch(\`\${url}?page=\${page}\`);
    const data = await response.json();
    yield data.items;
    hasMore = data.hasMore;
    page++;
  }
}
\`\`\`

---

## 性能陷阱

### 陷阱 1：不必要的串行

\`\`\`javascript
// ❌ 慢：3 个独立请求串行执行
async function slow() {
  const user = await fetchUser();
  const orders = await fetchOrders();    // 不依赖 user，不必等待
  const products = await fetchProducts(); // 不依赖 orders，不必等待
  return { user, orders, products };
}

// ✅ 快：并发执行
async function fast() {
  const [user, orders, products] = await Promise.all([
    fetchUser(),
    fetchOrders(),
    fetchProducts(),
  ]);
  return { user, orders, products };
}
\`\`\`

### 陷阱 2：循环中的 await

\`\`\`javascript
// ❌ 慢：循环中串行 await
async function slowLoop(ids) {
  const results = [];
  for (const id of ids) {
    results.push(await fetchItem(id)); // 每个都要等前一个完成
  }
  return results;
}

// ✅ 快：map + Promise.all
async function fastLoop(ids) {
  const results = await Promise.all(ids.map(id => fetchItem(id)));
  return results;
}
\`\`\`

### 陷阱 3：忘记 await

\`\`\`javascript
// ❌ 错误：忘记 await
async function buggy() {
  const data = fetchData(); // data 是 Promise，不是实际数据！
  console.log(data);        // Promise { <pending> }
}

// ✅ 正确：加上 await
async function correct() {
  const data = await fetchData();
  console.log(data);        // 实际数据
}
\`\`\`

下面这段代码完整演示了 async/await 的各种用法、性能对比和陷阱。`,
    code: `// ============================================================
// 第四章代码演示：Async/Await 深入实战
// ============================================================

// ============================================================
// 演示 1：async 函数本质
// ============================================================
console.log("===== 1. async 函数本质 =====");

// async 函数始终返回 Promise
async function returnValue() {
  return 42; // 等价于 return Promise.resolve(42)
}
async function returnPromise() {
  return Promise.resolve("hello");
}
async function throwError() {
  throw new Error("出错了");
}

returnValue().then((v) => console.log("  returnValue:", v));
returnPromise().then((v) => console.log("  returnPromise:", v));
throwError().catch((e) => console.log("  throwError:", e.message));

// async 函数中 await 之前的代码同步执行
console.log("\\n--- 同步 vs 异步 ---");
async function syncStart() {
  console.log("  1. async 函数中 await 之前（同步）");
  await Promise.resolve();
  console.log("  3. await 之后（异步）");
}
console.log("  2. 调用者");
syncStart();
// 输出顺序: 1 → 2 → 3

// ============================================================
// 演示 2：错误处理对比
// ============================================================
console.log("\\n===== 2. 错误处理对比 =====");

// try-catch 方式
async function withTryCatch() {
  try {
    const result = await Promise.reject(new Error("拒绝的 Promise"));
    console.log("  不会执行:", result);
  } catch (err) {
    console.log("  try-catch 捕获:", err.message);
    return "恢复值";
  }
}

// .catch 方式
async function withDotCatch() {
  const result = await Promise.reject(new Error("另一个错误"));
  return result;
}

withTryCatch().then((v) => console.log("  try-catch 返回:", v));
withDotCatch().catch((e) => console.log("  .catch 捕获:", e.message));

// ============================================================
// 演示 3：串行 vs 并发性能对比
// ============================================================
console.log("\\n===== 3. 串行 vs 并发性能对比 =====");

// 模拟异步任务：延迟指定毫秒后返回结果
function delay(ms, value) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), ms)
  );
}

// 串行执行：逐个等待
async function sequential() {
  const start = Date.now();
  const r1 = await delay(50, "结果1");
  const r2 = await delay(50, "结果2");
  const r3 = await delay(50, "结果3");
  const elapsed = Date.now() - start;
  console.log("  串行耗时:", elapsed, "ms", "结果:", [r1, r2, r3]);
  return elapsed;
}

// 并发执行：同时启动所有 Promise
async function concurrent() {
  const start = Date.now();
  const [r1, r2, r3] = await Promise.all([
    delay(50, "结果1"),
    delay(50, "结果2"),
    delay(50, "结果3"),
  ]);
  const elapsed = Date.now() - start;
  console.log("  并法耗时:", elapsed, "ms", "结果:", [r1, r2, r3]);
  return elapsed;
}

// 同时运行串行和并发对比
(async () => {
  const seqTime = await sequential();
  const concTime = await concurrent();
  console.log("  性能对比: 串行 " + seqTime + "ms vs 并发 " + concTime + "ms");
  console.log("  并发快约 " + (seqTime / concTime).toFixed(1) + " 倍");
})();

// ============================================================
// 演示 4：return vs return await 错误堆栈差异
// ============================================================
console.log("\\n===== 4. return vs return await =====");

async function innerError() {
  throw new Error("inner 错误");
}

// return await：错误堆栈包含 fooA
async function fooA() {
  return await innerError();
}

// return（无 await）：错误堆栈可能不包含 fooB
async function fooB() {
  return innerError();
}

fooA().catch((e) => {
  console.log("  fooA (return await) 堆栈包含 fooA:", e.stack.includes("fooA"));
});
fooB().catch((e) => {
  console.log("  fooB (return) 堆栈包含 fooB:", e.stack.includes("fooB"));
});

// 在 try-catch 中必须使用 return await
async function mustUseReturnAwait() {
  try {
    return await innerError(); // 必须用 await，否则 catch 捕获不到
  } catch (err) {
    console.log("  try-catch 中 return await 捕获到:", err.message);
    return "恢复";
  }
}
mustUseReturnAwait().then((v) => console.log("  返回:", v));

// ============================================================
// 演示 5：async 迭代器
// ============================================================
console.log("\\n===== 5. async 迭代器（for-await-of）=====");

// 创建一个 async 可迭代对象
const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      async next() {
        if (i < 3) {
          // 模拟异步操作
          await delay(10);
          return { value: "项目" + (++i), done: false };
        }
        return { done: true };
      },
    };
  },
};

// 使用 for-await-of 遍历
(async () => {
  console.log("  遍历 async 可迭代对象:");
  for await (const item of asyncIterable) {
    console.log("    ->", item);
  }
  console.log("  遍历完成");
})();

// ============================================================
// 演示 6：async 生成器
// ============================================================
console.log("\\n===== 6. async 生成器 =====");

// async 生成器函数：可以 yield Promise
async function* numberGenerator() {
  for (let i = 1; i <= 5; i++) {
    // 模拟异步操作
    await delay(10);
    yield i;
  }
}

// async 生成器返回 async 可迭代对象
(async () => {
  console.log("  使用 async 生成器:");
  const gen = numberGenerator();
  for await (const num of gen) {
    console.log("    生成:", num);
  }
  console.log("  生成器结束");

  // 也可以手动调用 next()
  const gen2 = numberGenerator();
  const result1 = await gen2.next();
  console.log("  手动 next():", result1.value);
  const result2 = await gen2.next();
  console.log("  手动 next():", result2.value);
})();

// ============================================================
// 演示 7：不必要的串行陷阱
// ============================================================
console.log("\\n===== 7. 不必要的串行陷阱 =====");

// 模拟获取用户信息、订单、商品（三个独立请求）
function fetchUser() { return delay(30, { id: 1, name: "张三" }); }
function fetchOrders() { return delay(30, [{ id: 101 }, { id: 102 }]); }
function fetchProducts() { return delay(30, [{ id: 201 }, { id: 202 }]); }

// ❌ 串行陷阱：三个请求一个接一个
async function fetchDashboardSlow() {
  const start = Date.now();
  const user = await fetchUser();
  const orders = await fetchOrders();
  const products = await fetchProducts();
  const elapsed = Date.now() - start;
  console.log("  串行耗时:", elapsed, "ms");
  return { user, orders, products, elapsed };
}

// ✅ 并发优化：三个请求同时发起
async function fetchDashboardFast() {
  const start = Date.now();
  const [user, orders, products] = await Promise.all([
    fetchUser(),
    fetchOrders(),
    fetchProducts(),
  ]);
  const elapsed = Date.now() - start;
  console.log("  并发耗时:", elapsed, "ms");
  return { user, orders, products, elapsed };
}

(async () => {
  const slow = await fetchDashboardSlow();
  const fast = await fetchDashboardFast();
  console.log("  性能提升: " + (slow.elapsed / fast.elapsed).toFixed(1) + " 倍");
})();

// ============================================================
// 演示 8：循环中的 await 陷阱
// ============================================================
console.log("\\n===== 8. 循环中的 await 陷阱 =====");

const ids = [1, 2, 3, 4, 5];

// ❌ 慢：for 循环中串行 await
async function slowLoop() {
  const start = Date.now();
  const results = [];
  for (const id of ids) {
    const result = await delay(20, "ID:" + id);
    results.push(result);
  }
  const elapsed = Date.now() - start;
  console.log("  for-await 串行耗时:", elapsed, "ms");
  return { results, elapsed };
}

// ✅ 快：map + Promise.all 并发
async function fastLoop() {
  const start = Date.now();
  const results = await Promise.all(
    ids.map((id) => delay(20, "ID:" + id))
  );
  const elapsed = Date.now() - start;
  console.log("  Promise.all 并发耗时:", elapsed, "ms");
  return { results, elapsed };
}

// 如果必须串行（如需要前一个结果来决定下一个）
async function necessarySequential() {
  const start = Date.now();
  let accumulator = 0;
  for (const id of ids) {
    const result = await delay(20, id);
    accumulator += result; // 依赖前一个结果
  }
  const elapsed = Date.now() - start;
  console.log("  必要串行耗时:", elapsed, "ms, 累加结果:", accumulator);
  return elapsed;
}

(async () => {
  const slow = await slowLoop();
  const fast = await fastLoop();
  await necessarySequential();
  console.log("  性能提升: " + (slow.elapsed / fast.elapsed).toFixed(1) + " 倍");
})();

// ============================================================
// 演示 9：async/await 与 Promise 组合模式
// ============================================================
console.log("\\n===== 9. async/await 组合模式 =====");

// 模式：并发请求 + 部分失败不影响整体
async function fetchWithFallback() {
  const results = await Promise.allSettled([
    delay(20, "主要数据源"),
    delay(40, "备用数据源"),
  ]);

  const data = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  const failures = results.filter((r) => r.status === "rejected");
  console.log("  成功:", data.length, "个, 失败:", failures.length, "个");
  console.log("  数据:", data);
  return data;
}

fetchWithFallback();

// 模式：超时控制
async function fetchWithTimeout() {
  try {
    const result = await Promise.race([
      delay(30, "正常结果"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("超时")), 100)
      ),
    ]);
    console.log("  超时测试结果:", result);
  } catch (e) {
    console.log("  超时测试:", e.message);
  }
}

fetchWithTimeout();`,
  },

  // =========================================================
  // 第五章：并发控制与限流
  // =========================================================
  {
    id: "node-concurrency",
    title: "并发控制与限流",
    icon: "🚦",
    group: "异步编程补充",
    content: `## 并发控制概述

在实际项目中，并发控制是一个至关重要的主题。无论你是在处理大量 API 请求、文件 I/O 操作、还是数据库查询，同时发起太多操作会导致：
- 系统资源耗尽（CPU、内存、文件描述符）
- 目标服务被压垮（触发限流、雪崩）
- 网络带宽占满
- 数据库连接池耗尽

并发控制的目标是：**在保证系统稳定的前提下，最大化吞吐量**。

---

## 并发 vs 并行

### 概念区分

| 概念 | 含义 | 类比 |
| --- | --- | --- |
| **并发（Concurrency）** | 多个任务在**同一时间段**交替执行 | 单核 CPU 时间片轮转 |
| **并行（Parallelism）** | 多个任务在**同一时刻**同时执行 | 多核 CPU 同时运行 |

**JavaScript 是单线程的，所以是"并发"而非"并行"**。但 I/O 操作（网络请求、文件读写）背后有 libuv 线程池，这些是真正的并行。

### 为什么需要并发控制？

假设你需要处理 1000 个文件，每个文件处理需要 1 秒。如果同时处理所有 1000 个文件：
- 打开 1000 个文件描述符（可能超过系统限制 EMFILE 错误）
- 内存中同时有 1000 个缓冲区，可能耗尽内存
- 磁盘 I/O 争抢，导致每个文件的处理速度都变慢

如果限制并发数为 10：
- 同时只有 10 个文件在处理
- 内存占用可控
- 磁盘 I/O 有序进行
- 总体完成时间可能更快（因为减少了资源争抢）

---

## 并发限制器（信号量模式）

信号量（Semaphore）是一种经典的并发控制机制。它的核心思想是维护一个"许可计数器"：

1. 初始化 \`N\` 个许可（最大并发数）
2. 每个任务开始前，尝试获取一个许可
3. 如果许可用完，任务排队等待
4. 任务完成后，释放许可，让等待中的任务获取

### 实现思路

\`\`\`javascript
class Semaphore {
  constructor(maxConcurrency) {
    this.max = maxConcurrency;     // 最大许可数
    this.current = 0;              // 当前已使用的许可数
    this.queue = [];               // 等待队列
  }

  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    // 许可用完，加入等待队列
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    if (this.queue.length > 0) {
      // 有等待者，直接唤醒
      const next = this.queue.shift();
      next();
    } else {
      this.current--;
    }
  }
}
\`\`\`

### 使用方式

\`\`\`javascript
async function runWithLimit(tasks, limit) {
  const semaphore = new Semaphore(limit);
  return Promise.all(tasks.map(async (task) => {
    await semaphore.acquire();
    try {
      return await task();
    } finally {
      semaphore.release();
    }
  }));
}
\`\`\`

---

## 批量请求处理（分批执行）

当任务数量巨大时，可以分批处理——每批处理固定数量的任务，完成后再处理下一批：

\`\`\`javascript
async function processInBatches(tasks, batchSize) {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
    console.log(\`完成批次 \${Math.floor(i / batchSize) + 1}\`);
  }
  return results;
}
\`\`\`

---

## 任务队列模式

任务队列是更高级的并发控制模式，支持：
- 动态添加任务（不只是静态数组）
- 优先级排序
- 暂停/恢复
- 任务重试

\`\`\`javascript
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._process();
    });
  }

  _process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
      task()
        .then(resolve, reject)
        .finally(() => {
          this.running--;
          this._process();
        });
    }
  }
}
\`\`\`

---

## 限流算法

### 令牌桶（Token Bucket）

维护一个令牌桶，以固定速率生成令牌。请求需要获取令牌才能执行。如果令牌用完，请求被拒绝或排队。

**特点**：允许突发流量（桶中的令牌可以累积）

### 漏桶（Leaky Bucket）

请求以任意速率到达，进入漏桶，以固定速率流出处理。如果桶满，新请求被丢弃。

**特点**：平滑输出速率，不允许突发

### 滑动窗口（Sliding Window）

维护一个时间窗口（如 1 秒），限制窗口内的请求数。每次请求时检查窗口内的请求数是否超过限制。

**特点**：精确控制，但实现复杂

### 算法对比

| 算法 | 突发处理 | 实现复杂度 | 适用场景 |
| --- | --- | --- | --- |
| 令牌桶 | 允许（桶容量内） | 中等 | API 限流、流量整形 |
| 漏桶 | 不允许 | 简单 | 严格速率限制 |
| 滑动窗口 | 不自然支持 | 较高 | 精确计数场景 |

---

## p-limit / p-queue 概念

- **p-limit**：简单的并发限制器，包装一个函数，限制同时执行的数量
- **p-queue**：更强大的任务队列，支持优先级、暂停/恢复、超时等

---

## 优先级队列

优先级队列允许高优先级任务插队执行：

\`\`\`javascript
class PriorityQueue {
  constructor() {
    this.queues = { high: [], medium: [], low: [] };
  }

  enqueue(task, priority = 'medium') {
    this.queues[priority].push(task);
  }

  dequeue() {
    for (const priority of ['high', 'medium', 'low']) {
      if (this.queues[priority].length > 0) {
        return this.queues[priority].shift();
      }
    }
    return null;
  }
}
\`\`\`

---

## 取消机制

在并发控制中，任务取消是一个重要功能。当任务不再需要时（如用户关闭页面、超时），应该能够取消正在执行或等待中的任务。

\`\`\`javascript
// 可取消任务
function createCancellableTask(fn) {
  let cancelled = false;
  const promise = new Promise((resolve, reject) => {
    if (cancelled) return reject(new Error('已取消'));
    fn().then(resolve, reject);
  });
  return {
    promise,
    cancel: () => { cancelled = true; },
  };
}
\`\`\`

下面这段代码完整演示了并发限制器、任务队列、令牌桶、优先级调度器和取消机制。`,
    code: `// ============================================================
// 第五章代码演示：并发控制与限流实战
// ============================================================

// 模拟异步任务：延迟一定时间后返回结果
function delay(ms, value) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), ms)
  );
}

// ============================================================
// 演示 1：并发限制器（信号量模式）
// ============================================================
console.log("===== 1. 并发限制器（信号量）=====");

class Semaphore {
  constructor(maxConcurrency) {
    this.max = maxConcurrency; // 最大并发数
    this.current = 0;          // 当前正在运行的任务数
    this.queue = [];            // 等待队列
  }

  // 获取许可
  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    // 没有可用许可，加入等待队列
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  // 释放许可
  release() {
    if (this.queue.length > 0) {
      // 有等待者，直接唤醒它（current 不变）
      const next = this.queue.shift();
      next();
    } else {
      this.current--;
    }
  }
}

// 并发限制执行器
async function runWithLimit(tasks, limit) {
  const semaphore = new Semaphore(limit);
  let running = 0; // 当前正在运行的任务数

  return Promise.all(
    tasks.map(async (task, index) => {
      await semaphore.acquire();
      running++;
      console.log("  [并发:" + running + "/" + limit + "] 开始任务 #" + (index + 1));
      try {
        const result = await task();
        console.log("  [完成] 任务 #" + (index + 1) + ":", result);
        return result;
      } finally {
        running--;
        semaphore.release();
      }
    })
  );
}

// 创建 8 个任务，限制并发数为 3
const tasks = [];
for (let i = 0; i < 8; i++) {
  tasks.push(() => delay(50 + Math.random() * 50, "结果" + (i + 1)));
}
console.log("执行 8 个任务，并发限制为 3:");
runWithLimit(tasks, 3).then((results) => {
  console.log("全部完成:", results.length, "个任务");
});

// ============================================================
// 演示 2：任务队列模式
// ============================================================
console.log("\\n===== 2. 任务队列 =====");

class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
    this.results = [];
  }

  // 添加任务，返回 Promise
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._processNext();
    });
  }

  // 处理下一个任务
  _processNext() {
    // 如果已达最大并发数或队列为空，不处理
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;
      console.log("  [队列] 开始处理任务 (运行中: " + this.running + "/" + this.concurrency + ")");
      task()
        .then((result) => {
          this.results.push(result);
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        })
        .finally(() => {
          this.running--;
          console.log("  [队列] 任务完成 (运行中: " + this.running + "/" + this.concurrency + ")");
          this._processNext();
        });
    }
  }

  // 获取队列状态
  getStatus() {
    return {
      running: this.running,
      pending: this.queue.length,
      completed: this.results.length,
    };
  }
}

// 测试任务队列
const queue = new TaskQueue(2);

console.log("任务队列（并发数=2）:");
queue.add(() => delay(50, "A"));
queue.add(() => delay(40, "B"));
queue.add(() => delay(30, "C"));
queue.add(() => delay(60, "D"));
queue.add(() => delay(20, "E"));

// 查看状态
setTimeout(() => {
  const status = queue.getStatus();
  console.log("  队列状态: 运行中=" + status.running + " 等待中=" + status.pending + " 已完成=" + status.completed);
}, 100);

// ============================================================
// 演示 3：令牌桶限流算法
// ============================================================
console.log("\\n===== 3. 令牌桶限流算法 =====");

class TokenBucket {
  constructor(capacity, refillRate, refillInterval) {
    this.capacity = capacity;          // 桶容量（最大令牌数）
    this.tokens = capacity;            // 当前令牌数（初始满）
    this.refillRate = refillRate;      // 每次补充的令牌数
    this.refillInterval = refillInterval; // 补充间隔（毫秒）

    // 定时补充令牌
    this._refillTimer = setInterval(() => {
      this.tokens = Math.min(this.capacity, this.tokens + this.refillRate);
    }, this.refillInterval);
  }

  // 尝试获取令牌，返回是否成功
  tryConsume(count = 1) {
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false; // 令牌不足，被限流
  }

  // 获取当前令牌数
  getTokens() {
    return this.tokens;
  }

  // 停止补充
  stop() {
    if (this._refillTimer) {
      clearInterval(this._refillTimer);
    }
  }
}

// 创建一个容量为 5、每 100ms 补充 1 个令牌的桶
const bucket = new TokenBucket(5, 1, 100);
console.log("令牌桶: 容量=5, 每100ms补充1个令牌");
console.log("初始令牌数:", bucket.getTokens());

// 模拟请求：每次请求消耗 1 个令牌
const requestResults = [];
for (let i = 1; i <= 8; i++) {
  const allowed = bucket.tryConsume(1);
  requestResults.push({ 请求: i, 允许: allowed ? "通过" : "限流", 剩余令牌: bucket.getTokens() });
}
console.log("突发请求结果:");
console.table(requestResults);

// 等待补充后再试
setTimeout(() => {
  console.log("\\n等待 200ms 后令牌数:", bucket.getTokens());
  const laterResults = [];
  for (let i = 1; i <= 3; i++) {
    const allowed = bucket.tryConsume(1);
    laterResults.push({ 请求: i, 允许: allowed ? "通过" : "限流", 剩余令牌: bucket.getTokens() });
  }
  console.log("后续请求结果:");
  console.table(laterResults);
  bucket.stop();
}, 200);

// ============================================================
// 演示 4：带优先级的任务调度器
// ============================================================
console.log("\\n===== 4. 带优先级的任务调度器 =====");

class PriorityTaskScheduler {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    // 优先级队列：high > medium > low
    this.queues = {
      high: [],
      medium: [],
      low: [],
    };
    this.completed = [];
  }

  // 添加任务
  addTask(task, priority = "medium") {
    const priorityLevels = ["high", "medium", "low"];
    if (!priorityLevels.includes(priority)) {
      priority = "medium";
    }
    return new Promise((resolve, reject) => {
      this.queues[priority].push({ task, resolve, reject, priority });
      this._process();
    });
  }

  // 从队列中取出最高优先级的任务
  _dequeue() {
    for (const level of ["high", "medium", "low"]) {
      if (this.queues[level].length > 0) {
        return this.queues[level].shift();
      }
    }
    return null;
  }

  _process() {
    while (this.running < this.concurrency) {
      const item = this._dequeue();
      if (!item) break;

      this.running++;
      const { task, resolve, reject, priority } = item;
      console.log("  [调度] 执行优先级=" + priority + " 的任务 (运行中:" + this.running + "/" + this.concurrency + ")");

      task()
        .then((result) => {
          this.completed.push({ priority, result });
          resolve(result);
        })
        .catch(reject)
        .finally(() => {
          this.running--;
          this._process();
        });
    }
  }

  getReport() {
    return {
      running: this.running,
      pending: this.queues.high.length + this.queues.medium.length + this.queues.low.length,
      completed: this.completed.length,
    };
  }
}

// 测试优先级调度器
const scheduler = new PriorityTaskScheduler(2);

console.log("优先级调度器（并发数=2）:");
scheduler.addTask(() => delay(40, "低优先级1"), "low");
scheduler.addTask(() => delay(40, "低优先级2"), "low");
scheduler.addTask(() => delay(30, "中优先级1"), "medium");
scheduler.addTask(() => delay(50, "高优先级1"), "high"); // 高优先级会插队
scheduler.addTask(() => delay(30, "高优先级2"), "high");

setTimeout(() => {
  const report = scheduler.getReport();
  console.log("  调度报告: 运行中=" + report.running + " 等待中=" + report.pending + " 已完成=" + report.completed);
  console.log("  完成顺序（高优先级优先）:");
  scheduler.completed.forEach((item, i) => {
    console.log("    " + (i + 1) + ". 优先级=" + item.priority + " 结果=" + item.result);
  });
}, 200);

// ============================================================
// 演示 5：取消机制
// ============================================================
console.log("\\n===== 5. 取消机制 =====");

// 可取消的任务包装器
function createCancellableTask(asyncFn) {
  let cancelled = false;
  let cancelReason = null;

  const promise = new Promise((resolve, reject) => {
    if (cancelled) {
      return reject(new Error(cancelReason || "任务已取消"));
    }
    asyncFn()
      .then((result) => {
        if (cancelled) {
          reject(new Error(cancelReason || "任务已取消"));
        } else {
          resolve(result);
        }
      })
      .catch((err) => {
        if (cancelled) {
          reject(new Error(cancelReason || "任务已取消"));
        } else {
          reject(err);
        }
      });
  });

  return {
    promise,
    cancel: (reason) => {
      cancelled = true;
      cancelReason = reason;
    },
    isCancelled: () => cancelled,
  };
}

// 测试取消
const task1 = createCancellableTask(() => delay(200, "任务1完成"));
const task2 = createCancellableTask(() => delay(200, "任务2完成"));

task1.promise.then(
  (v) => console.log("  任务1:", v),
  (e) => console.log("  任务1:", e.message)
);
task2.promise.then(
  (v) => console.log("  任务2:", v),
  (e) => console.log("  任务2:", e.message)
);

// 在 50ms 后取消任务1
setTimeout(() => {
  console.log("  取消任务1...");
  task1.cancel("用户手动取消");
}, 50);

// ============================================================
// 演示 6：实战——批量文件处理模拟
// ============================================================
console.log("\\n===== 6. 实战：批量处理模拟 =====");

// 模拟处理一批文件
async function batchProcess(items, concurrency, processor) {
  const semaphore = new Semaphore(concurrency);
  let completed = 0;
  const total = items.length;

  const startTime = Date.now();

  const results = await Promise.all(
    items.map(async (item, index) => {
      await semaphore.acquire();
      try {
        const result = await processor(item, index);
        completed++;
        const progress = ((completed / total) * 100).toFixed(0);
        console.log("  进度: " + progress + "% (" + completed + "/" + total + ")");
        return result;
      } finally {
        semaphore.release();
      }
    })
  );

  const elapsed = Date.now() - startTime;
  console.log("  批量处理完成! 耗时:", elapsed, "ms");
  return results;
}

// 模拟处理 10 个任务，并发数 3
const items = [
  "文件A", "文件B", "文件C", "文件D", "文件E",
  "文件F", "文件G", "文件H", "文件I", "文件J",
];

batchProcess(items, 3, async (item) => {
  await delay(40 + Math.random() * 40); // 模拟处理时间
  return "处理完成: " + item;
}).then((results) => {
  console.log("  处理结果:", results.length, "个文件");
});`,
  },

  // =========================================================
  // 第六章：异步错误处理模式
  // =========================================================
  {
    id: "node-async-patterns",
    title: "异步错误处理模式",
    icon: "🛡️",
    group: "异步编程补充",
    content: `## 异步错误处理概述

错误处理是软件开发中最容易被忽视但又最重要的环节。在异步编程中，错误处理比同步编程更加复杂——错误可能发生在任何时候，可能来自不同的执行上下文，如果不正确处理，轻则导致功能异常，重则导致进程崩溃。

Node.js 中异步错误处理涉及多个层面：
1. 函数级别的错误处理（回调/Promise/async-await）
2. 进程级别的全局错误处理
3. 架构级别的容错模式（重试/熔断/降级）

---

## 错误优先回调（Error-first Callback）

这是 Node.js 最传统的异步错误处理模式，也称为"Node 风格回调"：

\`\`\`javascript
function readConfig(callback) {
  fs.readFile('config.json', 'utf8', (err, data) => {
    if (err) {
      // 错误作为第一个参数传递
      return callback(err);
    }
    try {
      const config = JSON.parse(data);
      callback(null, config); // 成功时第一个参数为 null
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}
\`\`\`

### 模式规则

1. 回调函数的第一个参数始终是错误对象（如果没有错误则为 null）
2. 错误必须被传递，不能吞掉
3. 回调只能被调用一次（不能同时调用成功和失败）

### 优缺点

| 优点 | 缺点 |
| --- | --- |
| 简单直接，历史悠久 | 容易导致回调地狱 |
| Node.js 生态广泛使用 | 错误处理逻辑分散 |
| 性能好（无 Promise 开销） | 容易忘记检查错误 |

---

## Promise 链式错误处理

Promise 链中，错误会沿着链向下传播，直到被 catch 捕获：

\`\`\`javascript
fetchData()
  .then(validateData)      // 如果 throw，跳到 catch
  .then(transformData)     // 如果 throw，跳到 catch
  .then(saveData)          // 如果 throw，跳到 catch
  .catch(handleError);     // 统一处理所有错误
\`\`\`

### 常见陷阱

1. **catch 后不 return 恢复值**：后续 then 会收到 undefined
2. **catch 中又 throw**：错误继续向下传播
3. **忘记 catch**：导致 unhandledRejection

---

## async/await 错误处理模式

### 模式 1：try-catch 包裹

\`\`\`javascript
async function processData() {
  try {
    const data = await fetchData();
    const validated = await validateData(data);
    return await saveData(validated);
  } catch (err) {
    console.error('处理失败:', err);
    throw err; // 或返回默认值
  }
}
\`\`\`

### 模式 2：Go 风格错误处理

借鉴 Go 语言的错误处理模式，将错误作为值返回：

\`\`\`javascript
async function to(promise) {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null]);
}

async function processData() {
  const [err, data] = await to(fetchData());
  if (err) return handleError(err);
  // 继续处理 data...
}
\`\`\`

### 模式 3：Promise 包装

\`\`\`javascript
async function processData() {
  const result = await fetchData().catch(err => {
    console.error('获取数据失败:', err);
    return null; // 返回默认值，不中断流程
  });
  if (!result) return;
  // 继续处理...
}
\`\`\`

---

## 全局未捕获异常处理

### uncaughtException

当同步代码中抛出未捕获的异常时触发：

\`\`\`javascript
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录日志，尝试优雅关闭
  // 注意：进程可能处于不一致状态，应该重启
  process.exit(1);
});
\`\`\`

**重要警告**：\`uncaughtException\` 是最后的手段。处理完之后进程可能处于不一致状态，**最佳实践是记录日志后重启进程**。

### unhandledRejection

当 Promise 被拒绝但没有 .catch() 处理时触发：

\`\`\`javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  // 记录日志，但不一定要退出进程
});
\`\`\`

### 两者对比

| 事件 | 触发场景 | 默认行为 | 建议处理 |
| --- | --- | --- | --- |
| uncaughtException | 同步代码未捕获异常 | 进程崩溃 | 记录日志 + 重启 |
| unhandledRejection | Promise 未 catch | 警告（Node 15+ 会崩溃） | 记录日志 + 监控 |

---

## 优雅降级（Graceful Degradation）

优雅降级是指当某个功能失败时，系统仍然能提供基本服务（可能功能受限），而不是完全崩溃。

### 降级策略

1. **返回默认值**：数据获取失败时返回缓存数据或默认值
2. **功能降级**：推荐系统失败时显示热门内容
3. **服务降级**：第三方服务不可用时跳过该功能
4. **读写分离**：主库故障时切换到只读从库

\`\`\`javascript
async function getUserProfile(userId) {
  try {
    return await fetchFromPrimaryDB(userId);
  } catch (err) {
    console.warn('主库失败，尝试从库:', err.message);
    try {
      return await fetchFromReplicaDB(userId);
    } catch (err2) {
      console.warn('从库也失败，返回缓存:', err2.message);
      return getCachedProfile(userId) || getDefaultProfile();
    }
  }
}
\`\`\`

---

## 重试机制（指数退避）

网络请求失败时，不要立即报错，而是尝试重试。指数退避是最常用的重试策略：

### 指数退避原理

每次重试的等待时间按指数增长，同时加入随机抖动（jitter）防止"惊群效应"：

\`\`\`javascript
// 重试等待时间：100ms, 200ms, 400ms, 800ms, 1600ms...
function getBackoffDelay(attempt, baseDelay = 100) {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // 加入随机抖动（0-50%）
  const jitter = Math.random() * exponentialDelay * 0.5;
  return exponentialDelay + jitter;
}
\`\`\`

### 重试策略要点

1. **最大重试次数**：超过后放弃，防止无限重试
2. **指数退避**：避免立即重试加重服务负担
3. **随机抖动**：防止多个客户端同时重试
4. **可重试错误判断**：只重试临时性错误（网络超时、503），不重试永久性错误（400、401）
5. **幂等性保证**：确保重试不会产生副作用（如重复扣款）

---

## 熔断器模式（Circuit Breaker）

熔断器是一种防止级联失败的保护机制。当某个服务持续失败时，熔断器"跳闸"，暂时停止向该服务发送请求，给它恢复的时间。

### 熔断器状态

\`\`\`
                ┌─────────────────────┐
                │      CLOSED（关闭）   │
                │  正常状态，请求通过    │
                └──────┬──────────────┘
                       │ 失败次数达到阈值
                       ▼
                ┌─────────────────────┐
                │      OPEN（打开）     │
                │  拒绝请求，快速失败    │
                └──────┬──────────────┘
                       │ 超时时间到
                       ▼
                ┌─────────────────────┐
                │   HALF-OPEN（半开）   │
                │  允许少量请求试探      │
                └──────┬──────────────┘
                 成功  │    失败
               ┌──────┘    └──────┐
               ▼                  ▼
            CLOSED              OPEN
\`\`\`

### 熔断器参数

| 参数 | 说明 | 典型值 |
| --- | --- | --- |
| failureThreshold | 失败次数阈值 | 5 次 |
| timeout | 打开状态持续时间 | 30 秒 |
| successThreshold | 半开状态成功次数阈值 | 2 次 |
| halfOpenMaxRequests | 半开状态允许的最大请求数 | 3 次 |

---

## 超时与取消

### 超时模式

为每个异步操作设置超时限制，防止资源被无限占用：

\`\`\`javascript
async function withTimeout(promise, timeoutMs, errorMsg) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMsg || \`操作超时 (\${timeoutMs}ms)\`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle); // 清理定时器
  }
}
\`\`\`

### 取消模式

当超时或用户主动取消时，需要确保底层资源被释放：

\`\`\`javascript
const controller = new AbortController();
const signal = controller.signal;

// 5 秒后自动取消
setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal });
  return await response.json();
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('请求已取消');
  }
}
\`\`\`

---

## 错误日志与监控

### 日志级别

| 级别 | 使用场景 | 示例 |
| --- | --- | --- |
| error | 需要立即关注的问题 | 数据库连接失败 |
| warn | 潜在问题 | 使用了废弃 API |
| info | 重要业务流程 | 用户登录成功 |
| debug | 调试信息 | 函数参数值 |

### 日志最佳实践

1. 包含时间戳、请求 ID、错误堆栈
2. 结构化日志（JSON 格式），便于日志分析
3. 不要在日志中记录敏感信息（密码、token）
4. 设置日志轮转，防止磁盘占满

### 监控指标

- 错误率（按类型、接口、服务分组）
- 错误趋势（是否在上升）
- 重试次数和成功率
- 熔断器状态变化

---

下面这段代码完整演示了指数退避重试、熔断器、超时包装、全局错误处理和优雅降级。`,
    code: `// ============================================================
// 第六章代码演示：异步错误处理模式实战
// ============================================================

// 模拟异步任务：延迟指定毫秒后返回结果（可能失败）
function delay(ms, value) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), ms)
  );
}

// ============================================================
// 演示 1：指数退避重试机制
// ============================================================
console.log("===== 1. 指数退避重试 =====");

// 计算退避延迟（指数增长 + 随机抖动）
function getBackoffDelay(attempt, baseDelayMs) {
  const base = baseDelayMs || 100;
  // 指数增长：base * 2^attempt
  const exponentialDelay = base * Math.pow(2, attempt);
  // 加入随机抖动（0 到 50%），防止"惊群效应"
  const jitter = Math.random() * exponentialDelay * 0.5;
  return exponentialDelay + jitter;
}

// 带重试的函数执行器
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,          // 最大重试次数
    baseDelay = 100,         // 基础延迟（毫秒）
    retryOn = () => true,    // 判断是否应该重试的函数
    onRetry = null,          // 每次重试时的回调
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log("  第 " + attempt + " 次重试...");
      }
      const result = await fn();
      if (attempt > 0) {
        console.log("  重试成功！");
      }
      return result;
    } catch (err) {
      lastError = err;

      // 判断是否应该重试
      if (attempt >= maxRetries || !retryOn(err)) {
        throw err;
      }

      // 计算退避延迟
      const delay = getBackoffDelay(attempt, baseDelay);
      console.log("  失败: " + err.message + " (尝试 " + (attempt + 1) + "/" + (maxRetries + 1) + ")，等待 " + delay.toFixed(0) + "ms 后重试");

      if (onRetry) {
        onRetry(err, attempt + 1, delay);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// 测试：模拟一个偶尔失败的操作
let unstableCallCount = 0;
async function unstableOperation() {
  unstableCallCount++;
  await delay(10);
  // 前 2 次调用失败，第 3 次成功
  if (unstableCallCount <= 2) {
    throw new Error("临时故障 #" + unstableCallCount);
  }
  return "操作成功！";
}

console.log("测试不稳定操作（自动重试）:");
withRetry(unstableOperation, {
  maxRetries: 4,
  baseDelay: 50,
  retryOn: (err) => err.message.includes("临时故障"),
  onRetry: (err, attempt, delay) => {
    // 这里可以记录日志、发送告警等
  },
}).then(
  (result) => console.log("  最终结果:", result),
  (err) => console.log("  最终失败:", err.message)
);

// 测试：不可重试的错误
async function permanentError() {
  await delay(10);
  throw new Error("参数错误（不可重试）");
}
console.log("\\n测试永久性错误（不重试）:");
withRetry(permanentError, {
  maxRetries: 3,
  baseDelay: 50,
  retryOn: (err) => !err.message.includes("参数错误"), // 参数错误不重试
}).catch((err) => {
  console.log("  永久性错误，不重试:", err.message);
});

// ============================================================
// 演示 2：简易熔断器（Circuit Breaker）
// ============================================================
console.log("\\n===== 2. 简易熔断器（Circuit Breaker）=====");

// 熔断器状态枚举
const CircuitState = {
  CLOSED: "CLOSED",       // 关闭：正常状态
  OPEN: "OPEN",           // 打开：拒绝请求
  HALF_OPEN: "HALF_OPEN", // 半开：试探性请求
};

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.timeout = options.timeout || 200;
    this.successThreshold = options.successThreshold || 2;
    this.halfOpenMaxRequests = options.halfOpenMaxRequests || 3;

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenRequests = 0;
    this.nextAttempt = 0;
    this.stats = { success: 0, failure: 0, rejected: 0 };
  }

  async call(fn) {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        this.halfOpenRequests = 0;
        console.log("  [熔断器] OPEN → HALF_OPEN（试探性恢复）");
      } else {
        this.stats.rejected++;
        throw new Error("熔断器已打开，请求被拒绝");
      }
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenRequests >= this.halfOpenMaxRequests) {
        this.stats.rejected++;
        throw new Error("熔断器半开状态，请求数已达上限");
      }
      this.halfOpenRequests++;
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      console.log("  [熔断器] 半开成功 " + this.successCount + "/" + this.successThreshold);
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        console.log("  [熔断器] HALF_OPEN → CLOSED（恢复正常）");
      }
    } else {
      this.failureCount = 0;
    }
    this.stats.success++;
  }

  _onFailure() {
    this.stats.failure++;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.failureCount = this.failureThreshold;
      this.nextAttempt = Date.now() + this.timeout;
      console.log("  [熔断器] HALF_OPEN → OPEN（半开状态失败）");
      return;
    }

    this.failureCount++;
    console.log("  [熔断器] 失败计数: " + this.failureCount + "/" + this.failureThreshold);
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      console.log("  [熔断器] CLOSED → OPEN（失败次数达到阈值，熔断！）");
    }
  }

  getState() {
    return this.state;
  }

  getStats() {
    return { ...this.stats, state: this.state };
  }
}

// 测试熔断器
console.log("测试熔断器...");
const breaker = new CircuitBreaker({
  failureThreshold: 3,
  timeout: 200,
  successThreshold: 2,
});

let callCount = 0;
async function flakyService() {
  callCount++;
  await delay(10);
  if (callCount <= 4) {
    throw new Error("服务故障 #" + callCount);
  }
  return "服务正常 #" + callCount;
}

async function testBreaker() {
  for (let i = 1; i <= 8; i++) {
    try {
      const result = await breaker.call(flakyService);
      console.log("  请求 #" + i + " 成功:", result);
    } catch (err) {
      console.log("  请求 #" + i + " 失败:", err.message);
    }
    await delay(20);
  }

  console.log("\\n等待熔断器超时恢复...");
  await delay(250);

  for (let i = 9; i <= 12; i++) {
    try {
      const result = await breaker.call(flakyService);
      console.log("  请求 #" + i + " 成功:", result);
    } catch (err) {
      console.log("  请求 #" + i + " 失败:", err.message);
    }
    await delay(20);
  }

  console.log("\\n熔断器统计:", JSON.stringify(breaker.getStats()));
}

testBreaker();

// ============================================================
// 演示 3：超时包装
// ============================================================
console.log("\\n===== 3. 超时包装 =====");

async function withTimeout(promise, timeoutMs, errorMsg) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMsg || "操作超时 (" + timeoutMs + "ms)"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function testTimeout() {
  try {
    const fastResult = await withTimeout(
      delay(100, "快速完成"),
      200,
      "快速操作超时"
    );
    console.log("  快速操作:", fastResult);
  } catch (e) {
    console.log("  快速操作:", e.message);
  }

  try {
    const slowResult = await withTimeout(
      delay(300, "慢速完成"),
      200,
      "慢速操作超时"
    );
    console.log("  慢速操作:", slowResult);
  } catch (e) {
    console.log("  慢速操作:", e.message);
  }
}

testTimeout();

// ============================================================
// 演示 4：全局错误处理
// ============================================================
console.log("\\n===== 4. 全局错误处理 =====");

process.on("uncaughtException", (err) => {
  console.log("  [uncaughtException] 捕获到未处理异常:", err.message);
  console.log("  [uncaughtException] 建议：记录日志后重启进程");
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("  [unhandledRejection] 捕获到未处理的 Promise 拒绝:", reason.message);
  console.log("  [unhandledRejection] 建议：添加 .catch() 处理");
});

console.log("模拟 unhandledRejection...");
Promise.reject(new Error("这是一个未处理的 Promise 拒绝"));

// ============================================================
// 演示 5：优雅降级
// ============================================================
console.log("\\n===== 5. 优雅降级 =====");

const primaryDB = {
  users: { 1: { name: "张三", vip: true } },
};

const replicaDB = {
  users: { 1: { name: "张三", vip: true } },
};

const cache = {
  users: { 1: { name: "张三", vip: false } },
};

function getDefaultProfile() {
  return { name: "游客", vip: false };
}

async function fetchFromPrimaryDB(userId) {
  await delay(10);
  if (primaryDB.users[userId]) {
    return { source: "主库", ...primaryDB.users[userId] };
  }
  throw new Error("用户不存在");
}

async function fetchFromReplicaDB(userId) {
  await delay(10);
  if (Math.random() < 0.5) {
    throw new Error("从库连接超时");
  }
  if (replicaDB.users[userId]) {
    return { source: "从库", ...replicaDB.users[userId] };
  }
  throw new Error("从库中用户不存在");
}

function getCachedProfile(userId) {
  if (cache.users[userId]) {
    return { source: "缓存", ...cache.users[userId] };
  }
  return null;
}

async function getUserProfile(userId) {
  try {
    console.log("  尝试主库...");
    return await fetchFromPrimaryDB(userId);
  } catch (err) {
    console.log("  主库失败:", err.message);
  }

  try {
    console.log("  尝试从库...");
    return await fetchFromReplicaDB(userId);
  } catch (err) {
    console.log("  从库失败:", err.message);
  }

  const cached = getCachedProfile(userId);
  if (cached) {
    console.log("  使用缓存数据");
    return cached;
  }

  console.log("  使用默认值");
  return { source: "默认", ...getDefaultProfile() };
}

getUserProfile(1).then((profile) => {
  console.log("  最终结果:", JSON.stringify(profile));
  console.log("  这就是优雅降级——逐层回退，确保系统不崩溃");
});

// ============================================================
// 演示 6：Go 风格错误处理
// ============================================================
console.log("\\n===== 6. Go 风格错误处理 =====");

async function to(promise) {
  return promise
    .then((data) => [null, data])
    .catch((err) => [err, null]);
}

async function processWithGoStyle() {
  const [err1, data1] = await to(delay(10, "原始数据"));
  if (err1) {
    console.log("  第一步失败:", err1.message);
    return;
  }
  console.log("  第一步成功:", data1);

  const [err2, data2] = await to(
    Promise.resolve(data1 + " → 已处理")
  );
  if (err2) {
    console.log("  第二步失败:", err2.message);
    return;
  }
  console.log("  第二步成功:", data2);

  const [err3, data3] = await to(delay(10, data2 + " → 已保存"));
  if (err3) {
    console.log("  第三步失败:", err3.message);
    return;
  }
  console.log("  第三步成功:", data3);
  console.log("  Go 风格处理完成！");
}

processWithGoStyle();

// ============================================================
// 演示 7：综合错误处理策略
// ============================================================
console.log("\\n===== 7. 综合错误处理策略 =====");

async function robustFetch(fetchFn, options = {}) {
  const {
    retries = 2,
    timeout = 100,
    fallback = null,
    retryOn = () => true,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await withTimeout(
        fetchFn(),
        timeout,
        "请求超时"
      );
      if (attempt > 0) {
        console.log("  重试成功！(第 " + attempt + " 次重试)");
      }
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < retries && retryOn(err)) {
        const wait = getBackoffDelay(attempt, 50);
        console.log("  失败: " + err.message + "，等待 " + wait.toFixed(0) + "ms 后重试");
        await delay(wait);
      }
    }
  }

  if (fallback) {
    console.log("  所有重试失败，使用降级方案");
    return typeof fallback === "function" ? fallback() : fallback;
  }

  throw lastError;
}

let robustCount = 0;
async function unreliableService() {
  robustCount++;
  await delay(20);
  if (robustCount <= 3) {
    throw new Error("服务不可用 #" + robustCount);
  }
  return "服务正常";
}

robustFetch(unreliableService, {
  retries: 3,
  timeout: 100,
  fallback: "默认降级数据",
  retryOn: (err) => err.message.includes("服务不可用"),
}).then(
  (result) => console.log("  综合处理结果:", result),
  (err) => console.log("  综合处理最终失败:", err.message)
);`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["基础入门", "核心模块", "异步编程", "异步编程补充", "进阶实战", "工程化"];