// =============================================================
// JavaScript Worker 通信教程 —— 第二批章节（第 6-10 章）
// -------------------------------------------------------------
// 本批包含 5 章，聚焦 Worker 通信机制：
//   worker-postmessage   : 第 6 章 postMessage 基础通信
//   worker-clone         : 第 7 章 结构化克隆算法
//   worker-transferable  : 第 8 章 Transferable 对象转移
//   worker-messagechannel: 第 9 章 MessageChannel 消息通道
//   worker-broadcast     : 第 10 章 BroadcastChannel 广播通信
//
// 说明：本教程讲解的是浏览器中的 Web Worker，但沙箱环境为
// Node.js（无 window / document / Worker 等浏览器 API）。
// 因此 code 字段使用 events 模块的 EventEmitter 来"模拟"
// Worker 的消息传递机制，重点演示通信概念与模式。
// 代码中会标注"浏览器中等价写法"，方便对照学习。
// =============================================================

export const chapters = [
  // ============================================================
  // 第六章：postMessage 基础通信
  // ============================================================
  {
    id: "worker-postmessage",
    group: "Worker 通信",
    icon: "📮",
    title: "postMessage 基础通信",
    content: `## 一、postMessage —— Worker 通信的基石

在《JavaScript高级程序设计》中，Web Worker 被描述为"在后台运行的独立 JavaScript 线程"。主线程与 Worker 线程之间是**完全隔离**的——它们不共享内存、不共享变量、不共享 DOM。那么两个线程怎么交换数据？答案就是 **\`postMessage\`**。

\`postMessage\` 是 Worker 通信的**唯一标准入口**。无论是主线程发消息给 Worker，还是 Worker 发消息回主线程，用的都是这个 API。

### 1.1 语法

\`\`\`javascript
// 主线程 → Worker
worker.postMessage(message, [transfer]);

// Worker → 主线程（在 worker.js 内部）
self.postMessage(message, [transfer]);
\`\`\`

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| \`message\` | 任意值 | 要发送的数据，可以是原始值、对象、数组等 |
| \`transfer\` | Array（可选） | 可转移对象数组，如 ArrayBuffer、MessagePort |

**返回值：** \`undefined\`，postMessage 没有返回值，它是**异步**的。

### 1.2 message 事件

接收方通过监听 \`message\` 事件来获取数据：

\`\`\`javascript
// 主线程监听 Worker 返回的消息
worker.onmessage = function(event) {
  console.log(event.data);   // 实际数据
  console.log(event.origin); // 发送方来源（安全校验用）
  console.log(event.source); // 发送方引用（窗口间通信才有）
  console.log(event.ports);  // 携带的 MessagePort 数组
};

// Worker 内部监听主线程发来的消息
self.onmessage = function(event) {
  const data = event.data;
  // 处理数据后发回去
  self.postMessage(result);
};
\`\`\`

**MessageEvent 对象的关键属性：**

| 属性 | 说明 |
|------|------|
| \`data\` | 发送方传入的消息内容（经过结构化克隆） |
| \`origin\` | 发送方的源（协议+域名+端口），用于安全校验 |
| \`source\` | 发送方窗口的引用（窗口间 postMessage 才有意义） |
| \`ports\` | 携带的 MessagePort 数组（用于建立专用通道） |

---

## 二、发送不同类型的数据

postMessage 支持发送几乎所有 JavaScript 数据类型：

\`\`\`javascript
// 1. 原始值
worker.postMessage(42);
worker.postMessage('hello');
worker.postMessage(true);

// 2. 对象
worker.postMessage({ name: '张三', age: 25 });

// 3. 数组
worker.postMessage([1, 2, 3, 4, 5]);

// 4. 嵌套结构
worker.postMessage({
  users: [{ id: 1, name: '张三' }, { id: 2, name: '李四' }],
  meta: { total: 2, page: 1 }
});

// 5. 特殊对象（通过结构化克隆）
worker.postMessage(new Date());
worker.postMessage(new Map([['key', 'value']]));
worker.postMessage(new ArrayBuffer(1024));
\`\`\`

> ⚠️ **注意**：发送的数据会被**结构化克隆**，而不是直接传递引用。这意味着接收方拿到的是一个**副本**，修改它不会影响发送方的原始数据。这一点在下一章会详细讲解。

---

## 三、通信模式

### 3.1 单向通信

最简单的模式：一方发，另一方收，不回复。

\`\`\`javascript
// 主线程 → Worker（发任务，不关心结果）
worker.postMessage({ type: 'log', msg: '启动后台任务' });
\`\`\`

适用场景：日志记录、状态通知、心跳检测。

### 3.2 双向通信

主线程发请求，Worker 处理后回复结果。这是最常见的模式。

\`\`\`javascript
// 主线程
worker.postMessage({ type: 'calculate', data: [1, 2, 3] });
worker.onmessage = (e) => {
  console.log('计算结果:', e.data);
};

// Worker（worker.js）
self.onmessage = (e) => {
  if (e.data.type === 'calculate') {
    const sum = e.data.data.reduce((a, b) => a + b, 0);
    self.postMessage(sum);
  }
};
\`\`\`

### 3.3 请求-响应模式（带 ID）

当有多个请求并发时，需要用 ID 来匹配请求和响应：

\`\`\`javascript
// 主线程封装一个请求函数
function workerRequest(worker, payload) {
  return new Promise((resolve) => {
    const id = Date.now() + Math.random();
    const handler = (e) => {
      if (e.data.id === id) {
        worker.removeEventListener('message', handler);
        resolve(e.data.result);
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage({ id, ...payload });
  });
}

// 使用
const result = await workerRequest(worker, { task: 'fetch', url: '/api' });
\`\`\`

### 3.4 广播给多个 Worker

主线程管理多个 Worker，向它们广播同一条消息：

\`\`\`javascript
const workers = [
  new Worker('w1.js'),
  new Worker('w2.js'),
  new Worker('w3.js')
];

function broadcast(message) {
  workers.forEach(w => w.postMessage(message));
}

broadcast({ type: 'config', debug: true });
\`\`\`

---

## 四、postMessage 的异步性

### 4.1 它是宏任务

postMessage 是**异步**的——调用后立即返回，消息不会同步送达。接收方的 \`onmessage\` 回调被放入**宏任务队列**，等当前执行栈清空后才执行。

\`\`\`javascript
console.log('1. 发送消息前');
worker.postMessage('hello');
console.log('2. 发送消息后');
// Worker 那边的 onmessage 不会在这两行之间执行

worker.onmessage = (e) => {
  console.log('3. 收到回复:', e.data);
};
console.log('4. 主线程继续执行');

// 输出顺序：1 → 2 → 4 → 3
\`\`\`

### 4.2 消息顺序保证

虽然 postMessage 是异步的，但**同一个通道内的消息顺序是有保证的**。先发的消息一定先被接收，不会乱序。

\`\`\`javascript
worker.postMessage('第一');
worker.postMessage('第二');
worker.postMessage('第三');
// Worker 一定按 "第一 → 第二 → 第三" 的顺序收到
\`\`\`

但如果涉及**多个 Worker**，不同 Worker 之间的消息到达顺序**不保证**，因为每个 Worker 独立处理。

---

## 五、安全注意事项

1. **永远校验 origin**：在跨窗口通信中，\`event.origin\` 必须校验，防止恶意页面发消息。
2. **不要发送敏感数据的引用**：虽然结构化克隆会复制数据，但还是要避免在消息中携带密码、密钥等。
3. **消息格式要清晰**：建议用 \`{ type, data, id }\` 这样的结构化格式，而不是裸数据，方便扩展。

> 📖 **《JavaScript高级程序设计》提示**：postMessage 最初是为窗口间通信设计的（\`window.postMessage\`），后来扩展到 Worker。两者的 API 一致，但 Worker 场景下 \`origin\` 和 \`source\` 的意义不同。

---

## 六、本章小结

| 要点 | 说明 |
|------|------|
| postMessage 是唯一通信方式 | 主线程和 Worker 之间不共享内存 |
| 支持任意可克隆类型 | 原始值、对象、数组、Map、Set、ArrayBuffer 等 |
| 异步宏任务 | 调用后立即返回，回调在宏任务队列中执行 |
| 顺序保证 | 同一通道内消息按发送顺序到达 |
| 可携带 Transferable | 第二参数可转移 ArrayBuffer 等，实现零拷贝 |`,
    code: `// ============================================
// 第六章代码：postMessage 基础通信演示
// 用 EventEmitter 模拟 Worker 的消息机制
// ============================================
var EventEmitter = require('events');

// --------------------------------------------
// 模拟 Worker 类
// 浏览器中：const worker = new Worker('worker.js')
// 这里用 EventEmitter 模拟消息收发
// --------------------------------------------
class MockWorker extends EventEmitter {
  constructor() {
    super();
    var self = this; // 保存引用
    // Worker 内部作用域（模拟 worker.js 里的 self）
    this._workerScope = new EventEmitter();

    // Worker 内部监听主线程发来的消息
    // 浏览器中等价于：self.onmessage = function(e) { ... }
    this._workerScope.on('message', function(e) {
      // === 下面是 worker.js 里的处理逻辑 ===
      var msg = e.data;

      // 根据 type 分发任务
      if (msg.type === 'calculate') {
        // 计算数组求和
        var sum = msg.data.reduce(function(a, b) { return a + b; }, 0);
        // 浏览器中等价于：self.postMessage({ type: 'result', sum: sum })
        self.emit('message', { data: { type: 'result', sum: sum } });
      } else if (msg.type === 'greet') {
        // 简单问候
        self.emit('message', { data: '你好，' + msg.name + '！' });
      } else if (msg.type === 'double') {
        // 翻倍
        self.emit('message', { data: msg.value * 2 });
      }
    });
  }

  // 模拟主线程的 worker.postMessage(data)
  // 浏览器中等价于：worker.postMessage(data)
  postMessage(data) {
    // 异步派发（模拟宏任务）
    var self = this;
    setImmediate(function() {
      self._workerScope.emit('message', { data: data });
    });
  }
}

// ============================================
// 演示 1：双向通信（发请求，收结果）
// ============================================
console.log('=== 演示 1：双向通信 ===');
var worker1 = new MockWorker();

// 主线程监听 Worker 返回的消息
// 浏览器中：worker.onmessage = function(e) { ... }
worker1.on('message', function(e) {
  console.log('主线程收到:', JSON.stringify(e.data));
});

// 主线程发送任务给 Worker
worker1.postMessage({ type: 'calculate', data: [10, 20, 30, 40] });
worker1.postMessage({ type: 'greet', name: '张三' });
worker1.postMessage({ type: 'double', value: 21 });

// ============================================
// 演示 2：请求-响应模式（带 ID 匹配）
// ============================================
console.log('\\n=== 演示 2：请求-响应模式 ===');

// 封装一个带 ID 的请求函数
function workerRequest(worker, payload) {
  return new Promise(function(resolve) {
    var id = Date.now() + '-' + Math.random().toString(36).slice(2, 6);

    // 监听响应，按 ID 匹配
    var handler = function(e) {
      if (e.data && e.data.id === id) {
        worker.removeListener('message', handler);
        resolve(e.data.result);
      }
    };
    worker.on('message', handler);

    // 发送请求（附带 ID）
    worker.postMessage(Object.assign({ id: id }, payload));
  });
}

// 用一个新的 Worker 演示（支持带 ID 的请求）
class RequestWorker extends EventEmitter {
  constructor() {
    super();
    var self = this;
    this._scope = new EventEmitter();
    this._scope.on('message', function(e) {
      var msg = e.data;
      if (msg.task === 'square') {
        var result = msg.value * msg.value;
        self.emit('message', { data: { id: msg.id, result: result } });
      } else if (msg.task === 'toUpperCase') {
        self.emit('message', { data: { id: msg.id, result: msg.text.toUpperCase() } });
      }
    });
  }
  postMessage(data) {
    var self = this;
    setImmediate(function() { self._scope.emit('message', { data: data }); });
  }
}

var worker2 = new RequestWorker();

// 并发发送多个请求
Promise.all([
  workerRequest(worker2, { task: 'square', value: 7 }),
  workerRequest(worker2, { task: 'square', value: 9 }),
  workerRequest(worker2, { task: 'toUpperCase', text: 'hello worker' })
]).then(function(results) {
  console.log('并发请求结果:', results);
});

// ============================================
// 演示 3：广播给多个 Worker
// ============================================
console.log('\\n=== 演示 3：广播通信 ===');

// 创建 3 个 Worker
var workers = [];
for (var i = 0; i < 3; i++) {
  var w = new MockWorker();
  w._index = i + 1; // 给 Worker 编号
  // 每个 Worker 收到消息后汇报
  w.on('message', function(e) {
    // 注意：这里用闭包捕获编号
  });
  workers.push(w);
}

// 用更简单的方式模拟广播
var SimpleWorker = function(name) {
  this.name = name;
  var self = this;
  this._cb = null;
  this.onMessage = function(cb) { self._cb = cb; };
  this.postMessage = function(data) {
    setImmediate(function() {
      if (self._cb) self._cb(data);
    });
  };
};

var sw1 = new SimpleWorker('Worker-A');
var sw2 = new SimpleWorker('Worker-B');
var sw3 = new SimpleWorker('Worker-C');

sw1.onMessage(function(d) { console.log('Worker-A 收到:', d.msg); });
sw2.onMessage(function(d) { console.log('Worker-B 收到:', d.msg); });
sw3.onMessage(function(d) { console.log('Worker-C 收到:', d.msg); });

// 广播函数：给所有 Worker 发同一条消息
function broadcast(workers, message) {
  workers.forEach(function(w) { w.postMessage(message); });
}

broadcast([sw1, sw2, sw3], { msg: '配置已更新: debug=true' });

console.log('\\n（以上消息通过 setImmediate 异步派发）');
`,
  },

  // ============================================================
  // 第七章：结构化克隆算法
  // ============================================================
  {
    id: "worker-clone",
    group: "Worker 通信",
    icon: "🧬",
    title: "结构化克隆算法",
    content: `## 一、为什么需要克隆？

《JavaScript高级程序设计》在讲解 Worker 时强调了一个核心概念：**主线程和 Worker 线程的内存是隔离的**。当你调用 \`postMessage(data)\` 时，\`data\` 并不是"指针传递"过去，而是被**复制**了一份发给 Worker。

这个复制过程使用的算法叫 **结构化克隆算法（Structured Clone Algorithm, SCA）**。

### 1.1 为什么不直接传引用？

如果直接传引用，主线程和 Worker 就共享内存了，这会破坏 Worker 的"独立线程"设计：

1. **线程安全问题**：两个线程同时修改同一个对象，会产生竞态条件。
2. **DOM 冲突**：DOM 操作只能在主线程进行，如果 Worker 持有 DOM 引用就乱了。
3. **隔离性丧失**：Worker 的意义就是"不影响主线程"，共享内存会破坏这一点。

所以，\`postMessage\` 会把数据**深拷贝**一份，发送方和接收方各持有一份独立的数据。

---

## 二、结构化克隆能复制什么？

### 2.1 可以克隆的类型

| 类型 | 说明 | JSON 序列化 |
|------|------|:----------:|
| 原始值 | number、string、boolean、null、undefined | ✅ |
| 普通对象 | \`{a: 1, b: 2}\` | ✅ |
| 数组 | \`[1, 2, 3]\` | ✅ |
| **Date** | 日期对象 | ❌（变成字符串） |
| **RegExp** | 正则对象 | ❌（变成空对象） |
| **Map** | 键值对集合 | ❌ |
| **Set** | 去重集合 | ❌ |
| **ArrayBuffer** | 二进制缓冲区 | ❌ |
| **TypedArray** | Uint8Array 等 | ❌ |
| **Blob** | 二进制大对象 | ❌ |
| **File** | 文件对象 | ❌ |
| **ImageData** | 像素数据 | ❌ |
| **循环引用** | 对象引用自身 | ❌（会报错） |
| **Error** | 错误对象（部分属性） | ❌ |

### 2.2 不能克隆的类型

| 类型 | 原因 |
|------|------|
| **Function** | 函数包含执行上下文，无法跨线程 |
| **DOM 节点** | DOM 只能在主线程操作 |
| **Symbol** | 符号是唯一标识，克隆会破坏唯一性 |
| **WeakMap / WeakSet** | 弱引用机制无法复制 |
| **属性描述符** | getter/setter 不会被克隆 |
| **原型链** | 只克隆自有属性，不克隆原型 |

---

## 三、深拷贝 vs 浅拷贝

### 3.1 SCA 是"深拷贝"

结构化克隆会**递归复制**所有嵌套属性，是真正的深拷贝：

\`\`\`javascript
const original = {
  user: { name: '张三', scores: [90, 85, 92] },
  meta: { date: new Date() }
};

// postMessage 时会深拷贝
worker.postMessage(original);

// Worker 收到的是一个全新的对象
// 修改它不会影响主线程的 original
\`\`\`

### 3.2 浅拷贝的问题对比

普通赋值只是浅拷贝——嵌套对象仍然是同一个引用：

\`\`\`javascript
const a = { nested: { value: 1 } };
const b = a; // 浅拷贝
b.nested.value = 999;
console.log(a.nested.value); // 999 —— 被影响了！

// 而 postMessage 的结构化克隆不会这样
\`\`\`

---

## 四、循环引用的处理

### 4.1 SCA 支持循环引用

这是结构化克隆比 JSON 强大的地方之一：

\`\`\`javascript
const obj = { name: '循环对象' };
obj.self = obj; // 自引用

// JSON.stringify(obj) → 报错！
// 但 postMessage 可以正确处理
worker.postMessage(obj); // ✅ Worker 收到的对象也有自引用
\`\`\`

SCA 内部使用"引用表"记录已克隆的对象，遇到重复引用时直接复用，从而正确处理循环引用。

### 4.2 共享引用（非循环）

\`\`\`javascript
const shared = { id: 1 };
const data = { a: shared, b: shared };

// 结构化克隆后，Worker 收到的 a 和 b 仍指向同一个对象
// JSON 则会创建两个独立的副本
worker.postMessage(data);
\`\`\`

---

## 五、性能考量

### 5.1 克隆大对象的代价

结构化克隆需要**递归遍历 + 复制**整个对象树。对于大对象，这是有性能成本的：

| 数据大小 | 克隆耗时（近似） |
|----------|-----------------|
| 1KB 小对象 | < 0.1ms |
| 100KB JSON | ~1ms |
| 10MB ArrayBuffer | ~5ms（需用 Transfer） |
| 100MB 大数组 | 50ms+（建议用 Transfer） |

### 5.2 JSON.parse(JSON.stringify()) 的局限

\`\`\`javascript
// 常见的"土法深拷贝"
const copy = JSON.parse(JSON.stringify(original));
\`\`\`

**缺点：**
- ❌ 丢失 Date（变成字符串）
- ❌ 丢失 RegExp（变成空对象）
- ❌ 丢失 Map / Set
- ❌ 丢失函数、undefined
- ❌ 循环引用直接报错
- ✅ 性能尚可（对于纯 JSON 数据）

### 5.3 与 SharedArrayBuffer 对比

| 特性 | 结构化克隆 | SharedArrayBuffer |
|------|-----------|-------------------|
| 拷贝方式 | 深拷贝（复制数据） | 零拷贝（共享内存） |
| 线程安全 | 安全（各自独立副本） | 需用 Atomics 同步 |
| 数据类型 | 任意可克隆类型 | 仅二进制数值 |
| 适用场景 | 通用消息传递 | 大数据高频通信 |
| 浏览器支持 | 全部支持 | 需安全上下文+COOP/COEP |

> 📖 **《JavaScript高级程序设计》建议**：对于大块二进制数据（图像、音频、视频），优先考虑 Transferable 对象（下一章讲解）或 SharedArrayBuffer，避免结构化克隆的拷贝开销。

---

## 六、Node.js 中的 structuredClone

Node.js 17+ 提供了全局 \`structuredClone()\` 函数，与浏览器的结构化克隆算法行为一致，可以在非 Worker 场景下使用：

\`\`\`javascript
const original = { date: new Date(), map: new Map([['k', 'v']]) };
const copy = structuredClone(original);
// copy.date 仍然是 Date 对象
// copy.map 仍然是 Map 对象
\`\`\`

---

## 七、本章小结

| 要点 | 说明 |
|------|------|
| SCA 是 postMessage 的默认拷贝方式 | 深拷贝，发送方和接收方数据独立 |
| 支持丰富类型 | Date、RegExp、Map、Set、ArrayBuffer、循环引用 |
| 不支持函数和 DOM | 这些无法跨线程传递 |
| 比 JSON 强大 | 保留类型信息，支持循环引用 |
| 大对象有性能成本 | 大数据建议用 Transferable 或 SharedArrayBuffer |`,
    code: `// ============================================
// 第七章代码：结构化克隆算法演示
// 演示什么能克隆、什么不能、深拷贝效果
// ============================================
var EventEmitter = require('events');

// --------------------------------------------
// 辅助：优先使用 Node 17+ 的 structuredClone
// 没有则用手动实现的深拷贝（支持 Date/RegExp/Map/Set/循环引用）
// 模拟结构化克隆算法的核心行为
// --------------------------------------------
var clone = (typeof structuredClone === 'function')
  ? structuredClone
  : function deepClone(obj, seen) {
      // 原始值和 null 直接返回
      if (obj === null || typeof obj !== 'object') return obj;

      // seen 用于跟踪已克隆对象，处理循环引用
      seen = seen || new WeakMap();
      if (seen.has(obj)) return seen.get(obj);

      // Date —— JSON 会丢失，SCA 保留
      if (obj instanceof Date) return new Date(obj.getTime());

      // RegExp —— JSON 会丢失，SCA 保留
      if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);

      // Map —— JSON 会丢失，SCA 保留
      if (obj instanceof Map) {
        var newMap = new Map();
        seen.set(obj, newMap);
        obj.forEach(function(v, k) { newMap.set(k, deepClone(v, seen)); });
        return newMap;
      }

      // Set —— JSON 会丢失，SCA 保留
      if (obj instanceof Set) {
        var newSet = new Set();
        seen.set(obj, newSet);
        obj.forEach(function(v) { newSet.add(deepClone(v, seen)); });
        return newSet;
      }

      // ArrayBuffer
      if (obj instanceof ArrayBuffer) return obj.slice(0);

      // TypedArray (Uint8Array 等)
      if (ArrayBuffer.isView(obj)) {
        var newBuf = obj.buffer.slice(0);
        return new obj.constructor(newBuf);
      }

      // 数组
      if (Array.isArray(obj)) {
        var newArr = [];
        seen.set(obj, newArr);
        for (var i = 0; i < obj.length; i++) {
          newArr[i] = deepClone(obj[i], seen);
        }
        return newArr;
      }

      // 普通对象
      var newObj = {};
      seen.set(obj, newObj);
      var keys = Object.keys(obj);
      for (var j = 0; j < keys.length; j++) {
        newObj[keys[j]] = deepClone(obj[keys[j]], seen);
      }
      return newObj;
    };

console.log('使用克隆方法:', (typeof structuredClone === 'function')
  ? '原生 structuredClone'
  : '手动深拷贝（模拟 SCA）');

// ============================================
// 演示 1：可克隆的数据类型
// ============================================
console.log('\\n=== 演示 1：可克隆的数据类型 ===');

var testData = {
  // 原始值
  num: 42,
  str: 'hello',
  bool: true,
  nothing: null,

  // 对象和数组
  obj: { a: 1, b: { c: 2 } },
  arr: [1, 2, 3],

  // Date（JSON 会丢失，SCA 保留）
  date: new Date('2024-01-15'),

  // RegExp（JSON 会丢失，SCA 保留）
  regex: /pattern/g,

  // 嵌套结构
  nested: {
    users: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ],
    meta: { total: 2 }
  }
};

// 尝试克隆
try {
  var cloned = clone(testData);

  console.log('原始 date 类型:', testData.date.constructor.name);
  console.log('克隆后 date 类型:', cloned.date ? cloned.date.constructor.name : 'undefined');
  console.log('原始 regex 类型:', testData.regex.constructor.name);
  console.log('克隆后 regex 类型:', cloned.regex ? cloned.regex.constructor.name : 'undefined');
  console.log('嵌套数据完整:', JSON.stringify(cloned.nested));
} catch (e) {
  console.log('克隆失败:', e.message);
}

// ============================================
// 演示 2：深拷贝验证（修改副本不影响原件）
// ============================================
console.log('\\n=== 演示 2：深拷贝验证 ===');

var original = {
  user: { name: '张三', scores: [90, 85, 92] },
  config: { debug: true }
};

var copy = clone(original);

// 修改副本
copy.user.name = '李四';
copy.user.scores.push(100);
copy.config.debug = false;

console.log('原始 user.name:', original.user.name, '（不变）');
console.log('副本 user.name:', copy.user.name, '（已修改）');
console.log('原始 scores:', JSON.stringify(original.user.scores), '（不变）');
console.log('副本 scores:', JSON.stringify(copy.user.scores), '（已修改）');
console.log('→ 深拷贝成功，双方数据完全独立');

// ============================================
// 演示 3：循环引用处理
// ============================================
console.log('\\n=== 演示 3：循环引用 ===');

var cycleObj = { name: '循环对象', list: [] };
cycleObj.self = cycleObj;       // 自引用
cycleObj.list.push(cycleObj);   // 循环引用

// JSON 方式：直接报错
try {
  JSON.parse(JSON.stringify(cycleObj));
  console.log('JSON: 成功（意外）');
} catch (e) {
  console.log('JSON 方式: 失败 -', e.message);
}

// structuredClone 方式：正确处理
try {
  var cycled = clone(cycleObj);
  console.log('SCA 方式: 成功！');
  console.log('  自引用存在:', cycled.self === cycled);
  console.log('  list[0] === cycled:', cycled.list[0] === cycled);
} catch (e) {
  console.log('SCA 方式: 失败 -', e.message);
}

// ============================================
// 演示 4：模拟 Worker postMessage 的克隆过程
// ============================================
console.log('\\n=== 演示 4：模拟 postMessage 克隆 ===');

// 模拟 Worker
class CloneWorker extends EventEmitter {
  constructor() {
    super();
    var self = this;
    this._scope = new EventEmitter();
    this._scope.on('message', function(e) {
      var data = e.data;
      // Worker 收到的数据是克隆后的副本
      console.log('  Worker 收到数据，类型:', typeof data);
      console.log('  Worker 收到 date 类型:',
        data.payload && data.payload.date
          ? data.payload.date.constructor.name
          : '无');

      // Worker 修改数据，不影响主线程
      if (data.payload) {
        data.payload.modified = true;
      }
      // 回传结果
      self.emit('message', { data: '已收到并处理' });
    });
  }
  postMessage(data) {
    var self = this;
    setImmediate(function() {
      // 关键：postMessage 内部会结构化克隆 data
      // 这里用 clone() 模拟这个过程
      var clonedData = clone(data);
      self._scope.emit('message', { data: clonedData });
    });
  }
}

var worker = new CloneWorker();
worker.on('message', function(e) {
  console.log('  主线程收到回复:', e.data);
});

var message = {
  type: 'process',
  payload: {
    date: new Date(),
    items: [1, 2, 3],
    config: { debug: true }
  }
};

console.log('主线程发送数据...');
worker.postMessage(message);

// 验证主线程的原始数据未被修改
setTimeout(function() {
  console.log('\\n=== 验证主线程原始数据 ===');
  console.log('原始 payload.modified:', message.payload.modified || 'undefined（未被修改）');
  console.log('→ 主线程数据完好，Worker 的修改不影响原始数据');
}, 100);
`,
  },

  // ============================================================
  // 第八章：Transferable 对象转移
  // ============================================================
  {
    id: "worker-transferable",
    group: "Worker 通信",
    icon: "📦",
    title: "Transferable 对象转移",
    content: `## 一、克隆的代价与转移的方案

上一章我们讲到，\`postMessage\` 默认使用结构化克隆算法，会把数据**复制一份**。对于小数据没问题，但如果传递的是 **10MB 的图片数据**、**100MB 的音频缓冲区**，每次都复制一份，既浪费内存又浪费时间。

为了解决这个问题，浏览器引入了 **Transferable 对象**机制：**不复制数据，而是把"所有权"转移过去**。

### 1.1 什么是 Transferable？

Transferable（可转移对象）是指那些**底层资源可以转移所有权**的对象。转移后：

- **接收方**获得数据的完整使用权
- **发送方**的数据被"分离"（detached），不能再访问

这是一种**零拷贝**的数据传递方式。

### 1.2 常见的 Transferable 对象

| 对象 | 说明 | 典型场景 |
|------|------|----------|
| **ArrayBuffer** | 二进制缓冲区 | 图像处理、音频分析 |
| **MessagePort** | 消息端口 | Worker 间通信 |
| **ImageBitmap** | 位图数据 | Canvas 图像传递 |
| **ReadableStream** | 可读流 | 流式数据传输 |
| **WritableStream** | 可写流 | 流式数据传输 |
| **TransformStream** | 转换流 | 数据管道转换 |
| **OffscreenCanvas** | 离屏画布 | 后台渲染 |

---

## 二、postMessage 的第二个参数

### 2.1 基本语法

\`\`\`javascript
worker.postMessage(message, [transfer]);
//                            ^^^^^^^^^
//                            可转移对象数组
\`\`\`

**示例：**

\`\`\`javascript
const buffer = new ArrayBuffer(1024); // 创建 1KB 缓冲区

// 方式一：默认克隆（会复制 1KB 数据）
worker.postMessage(buffer);

// 方式二：转移（零拷贝，原 buffer 失效）
worker.postMessage(buffer, [buffer]);
\`\`\`

### 2.2 转移 vs 克隆对比

| 特性 | 克隆（默认） | 转移（transfer） |
|------|:----------:|:--------------:|
| 数据复制 | ✅ 复制一份 | ❌ 不复制 |
| 发送方数据 | 保留可用 | 失效（detached） |
| 接收方数据 | 独立副本 | 获得原始数据 |
| 内存占用 | ×2 | 不变 |
| 性能 | 大数据慢 | 零拷贝，极快 |
| 适用场景 | 小数据、通用 | 大块二进制数据 |

---

## 三、ArrayBuffer 转移详解

### 3.1 创建与填充

\`\`\`javascript
// 创建一个 1024 字节的 ArrayBuffer
const buffer = new ArrayBuffer(1024);

// 用 TypedArray 视图来写入数据
const view = new Uint8Array(buffer);
for (let i = 0; i < view.length; i++) {
  view[i] = i % 256; // 填充数据
}

console.log(buffer.byteLength); // 1024
\`\`\`

### 3.2 转移给 Worker

\`\`\`javascript
// 转移后，主线程的 buffer 被分离
worker.postMessage({ type: 'process', data: buffer }, [buffer]);

// 此时主线程的 buffer 已失效
console.log(buffer.byteLength); // 0 —— 变成 0！
// buffer.detached === true（新 API）
\`\`\`

### 3.3 Worker 接收

\`\`\`javascript
// worker.js
self.onmessage = function(e) {
  const buffer = e.data.data;
  console.log(buffer.byteLength); // 1024 —— 完好

  // 处理数据
  const view = new Uint8Array(buffer);
  const sum = view.reduce((a, b) => a + b, 0);

  // 可以把结果或处理后的 buffer 再转移回去
  self.postMessage({ result: sum }, [buffer]);
  // 此时 Worker 的 buffer 也失效了
};
\`\`\`

---

## 四、性能对比

### 4.1 大数据场景

假设要传递一个 50MB 的 ArrayBuffer：

| 方式 | 耗时（近似） | 内存峰值 |
|------|:----------:|:-------:|
| 克隆 | ~25ms | 100MB（×2） |
| 转移 | < 1ms | 50MB（不变） |

对于高频传输（如每帧传图像数据），转移的优势极其明显。

### 4.2 小数据场景

对于几百字节的小数据，转移和克隆的差别可以忽略。甚至转移的开销（管理所有权）可能比直接克隆还高。**所以小数据用默认克隆即可。**

---

## 五、常见陷阱

### 5.1 detached ArrayBuffer 错误

\`\`\`javascript
const buffer = new ArrayBuffer(1024);
worker.postMessage(buffer, [buffer]);

// ❌ 错误！buffer 已被转移，不能再使用
const view = new Uint8Array(buffer);
// TypeError: Cannot perform Uint8Array on a detached ArrayBuffer
\`\`\`

### 5.2 transfer 数组中忘记放对象

\`\`\`javascript
const buffer = new ArrayBuffer(1024);

// ❌ 没有放入 transfer 数组 → 变成克隆
worker.postMessage(buffer);
// buffer 仍然可用，但数据被复制了一份

// ✅ 正确写法
worker.postMessage(buffer, [buffer]);
\`\`\`

### 5.3 转移了非 Transferable 对象

\`\`\`javascript
const obj = { name: '张三' };

// ❌ 报错！普通对象不是 Transferable
worker.postMessage(obj, [obj]);
// TypeError: Transfer list contains non-Transferable value
\`\`\`

### 5.4 TypedArray 不是 Transferable

\`\`\`javascript
const view = new Uint8Array(1024);

// ❌ view 本身不能转移
worker.postMessage(view, [view]); // 报错

// ✅ 转移的是它底层的 buffer
worker.postMessage(view, [view.buffer]); // 正确
\`\`\`

---

## 六、MessagePort 转移

MessagePort 也是一种 Transferable 对象。通过转移 MessagePort，可以建立 Worker 之间的直接通信通道（下一章详解）：

\`\`\`javascript
// 主线程创建消息通道
const channel = new MessageChannel();

// 把 port1 发给 worker1，port2 发给 worker2
worker1.postMessage({ port: channel.port1 }, [channel.port1]);
worker2.postMessage({ port: channel.port2 }, [channel.port2]);

// 现在 worker1 和 worker2 可以通过各自的 port 直接通信
// 不需要经过主线程中转
\`\`\`

> 📖 **《JavaScript高级程序设计》提示**：Transferable 机制是 HTML5 规范的扩展，它使得 Web Worker 在处理大型二进制数据时具备了接近原生的性能，是实现高性能图像/音视频处理的关键。

---

## 七、本章小结

| 要点 | 说明 |
|------|------|
| 转移 = 所有权移交 | 不复制数据，发送方数据失效 |
| postMessage 第二参数 | \`postMessage(data, [transfer])\` |
| 主要 Transferable | ArrayBuffer、MessagePort、ImageBitmap |
| 零拷贝高性能 | 适合大数据（图像、音频、视频） |
| 转移后不能再用 | ArrayBuffer 变成 detached，访问报错 |
| 小数据用克隆即可 | 转移有管理开销，小数据没必要 |`,
    code: `// ============================================
// 第八章代码：Transferable 对象转移演示
// 模拟 ArrayBuffer 转移前后的状态变化
// ============================================
var EventEmitter = require('events');

// --------------------------------------------
// 模拟可转移的 ArrayBuffer 包装器
// 真正的 ArrayBuffer 转移后 byteLength 变为 0
// 这里用包装器模拟 detached 状态
// --------------------------------------------
function createTransferableBuffer(size) {
  return {
    // 底层用 Buffer（Node.js）模拟 ArrayBuffer
    _buffer: Buffer.alloc(size),
    byteLength: size,
    detached: false,  // 是否已转移

    // 写入数据
    fill: function(value) {
      if (this.detached) throw new Error('Cannot write to detached buffer');
      for (var i = 0; i < this._buffer.length; i++) {
        this._buffer[i] = value;
      }
    },

    // 读取数据
    get: function(index) {
      if (this.detached) throw new Error('Cannot read from detached buffer');
      return this._buffer[index];
    },

    // 求和（模拟数据处理）
    sum: function() {
      if (this.detached) throw new Error('Cannot access detached buffer');
      var total = 0;
      for (var i = 0; i < this._buffer.length; i++) {
        total += this._buffer[i];
      }
      return total;
    },

    // 执行转移
    _detach: function() {
      this.detached = true;
      this.byteLength = 0;
      this._buffer = null; // 释放引用
    }
  };
}

// ============================================
// 模拟支持 Transferable 的 Worker
// ============================================
class TransferWorker extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    var self = this;
    this._scope = new EventEmitter();
    this._scope.on('message', function(e) {
      var msg = e.data;
      if (msg.type === 'sum') {
        // Worker 接收到转移过来的 buffer
        var buffer = msg.buffer;
        console.log('  [' + self.name + '] 收到 buffer, byteLength:', buffer.byteLength);
        var result = buffer.sum();
        console.log('  [' + self.name + '] 计算结果: sum =', result);

        // 把结果传回（不再转移 buffer，因为它已在 Worker 这边）
        self.emit('message', { data: { result: result } });
      } else if (msg.type === 'double') {
        var buf = msg.buffer;
        // 将每个元素翻倍
        for (var i = 0; i < buf._buffer.length; i++) {
          buf._buffer[i] = buf._buffer[i] * 2;
        }
        // 把处理后的 buffer 转移回主线程
        var result = buf.sum();
        buf._detach(); // 模拟转移回主线程
        self.emit('message', { data: { result: result, transferred: true } });
      }
    });
  }

  // 支持 transfer 数组的 postMessage
  // 浏览器中：worker.postMessage(data, [transferable])
  postMessage(message, transferList) {
    var self = this;
    setImmediate(function() {
      // 先把消息发给 Worker（此时 buffer 数据完好，Worker 可以处理）
      // 浏览器中，转移时 Worker 会得到一个新的 ArrayBuffer（底层内存搬过去）
      // 这里简化为：Worker 先用同一引用处理，处理完后再分离主线程的副本
      self._scope.emit('message', { data: message });

      // Worker 处理完毕后，分离发送方的数据（模拟所有权转移）
      if (transferList && transferList.length > 0) {
        transferList.forEach(function(obj) {
          obj._detach();
        });
      }
    });
  }
}

// --------------------------------------------
// 异步等待辅助：用 await 让 setImmediate 回调有机会执行
// 沙箱中代码包裹在 async IIFE 中，支持顶层 await
// --------------------------------------------
var sleep = function(ms) {
  return new Promise(function(r) { setTimeout(r, ms || 1); });
};

// ============================================
// 演示 1：克隆 vs 转移对比
// ============================================
console.log('=== 演示 1：克隆 vs 转移 ===');

// --- 方式 A：默认克隆（不转移）---
var bufferClone = createTransferableBuffer(5);
bufferClone.fill(10);
console.log('克隆前: 主线程 buffer.byteLength =', bufferClone.byteLength);

var workerClone = new TransferWorker('CloneWorker');
workerClone.on('message', function(e) {
  console.log('  主线程收到结果:', e.data.result);
});

// 不传 transferList → 模拟克隆（主线程数据保留）
// 注意：真正克隆会复制数据，这里简化只演示概念
workerClone.postMessage({ type: 'sum', buffer: bufferClone }, []);

// 等待 Worker 处理完成（setImmediate 回调执行）
await sleep(5);
console.log('克隆后: 主线程 buffer.byteLength =', bufferClone.byteLength, '（仍然可用）');

// ============================================
// 演示 2：转移后 buffer 失效
// ============================================
await sleep(5);
console.log('\\n=== 演示 2：转移后 buffer 失效 ===');

var bufferTransfer = createTransferableBuffer(5);
bufferTransfer.fill(20);
console.log('转移前: 主线程 buffer.byteLength =', bufferTransfer.byteLength);
console.log('转移前: 主线程 buffer.sum() =', bufferTransfer.sum());

var workerTransfer = new TransferWorker('TransferWorker');
workerTransfer.on('message', function(e) {
  console.log('  主线程收到结果:', e.data.result);
});

// 传入 transferList → 触发转移
workerTransfer.postMessage({ type: 'sum', buffer: bufferTransfer }, [bufferTransfer]);

// 等待 Worker 处理完成
await sleep(5);
console.log('转移后: 主线程 buffer.byteLength =', bufferTransfer.byteLength, '（已变为 0）');
console.log('转移后: 主线程 buffer.detached =', bufferTransfer.detached, '（已分离）');
try {
  bufferTransfer.sum();
} catch (e) {
  console.log('转移后: 访问 buffer 报错 -', e.message);
}

// ============================================
// 演示 3：大数据转移的性能优势
// ============================================
await sleep(5);
console.log('\\n=== 演示 3：性能对比（概念演示）===');

// 模拟大数据
var bigBuffer = createTransferableBuffer(10000);
bigBuffer.fill(5);

console.log('数据大小: 10000 字节');
console.log('');

// 克隆方式（需复制）
var cloneStart = Date.now();
var clonedData = Buffer.alloc(bigBuffer.byteLength);
bigBuffer._buffer.copy(clonedData); // 模拟复制过程
var cloneTime = Date.now() - cloneStart;
console.log('克隆方式: 耗时 ' + cloneTime + 'ms, 内存 ×2');

// 转移方式（零拷贝）
var transferStart = Date.now();
// 转移只是改变所有权，不复制数据
var transferTime = Date.now() - transferStart;
console.log('转移方式: 耗时 ' + transferTime + 'ms, 内存不变');
console.log('');
console.log('→ 转移方式零拷贝，大数据场景优势明显');

// ============================================
// 演示 4：常见陷阱
// ============================================
await sleep(5);
console.log('\\n=== 演示 4：常见陷阱 ===');

// 陷阱 1：转移后继续使用
var buf = createTransferableBuffer(3);
buf.fill(1);
buf._detach(); // 模拟已转移
try {
  buf.sum();
} catch (e) {
  console.log('陷阱1 - 转移后访问:', e.message);
}

// 陷阱 2：TypedArray 转移
console.log('陷阱2 - TypedArray 本身不可转移，需转移其 .buffer 属性');
console.log('  错误: postMessage(view, [view])');
console.log('  正确: postMessage(view, [view.buffer])');
`,
  },

  // ============================================================
  // 第九章：MessageChannel 消息通道
  // ============================================================
  {
    id: "worker-messagechannel",
    group: "Worker 通信",
    icon: "🔗",
    title: "MessageChannel 消息通道",
    content: `## 一、为什么需要 MessageChannel？

到目前为止，我们学的 Worker 通信都是**主线程 ↔ Worker** 的直接通信：主线程调 \`worker.postMessage()\`，Worker 调 \`self.postMessage()\`。

但有些场景下，直接通信不够用：

1. **Worker 之间通信**：Worker A 想直接发消息给 Worker B，不走主线程中转。
2. **多通道隔离**：同一个 Worker 需要处理多种不同类型的消息，希望用独立通道分开。
3. **双向通信**：希望两方都能主动发消息，而不只是"请求-响应"模式。

**MessageChannel** 就是为这些场景设计的。

### 1.1 什么是 MessageChannel？

MessageChannel 是一个**消息通道**对象，它创建一对互相连接的 **MessagePort**（消息端口）。从 port1 发出的消息会到达 port2，反之亦然。

\`\`\`
┌────────┐  port1.postMessage(msg)  ┌────────┐
│  上下文A │ ──────────────────────▶ │ 上下文B │
│        │ ◀────────────────────── │        │
└────────┘  port2.postMessage(msg)  └────────┘
                MessageChannel 连接两端
\`\`\`

---

## 二、MessagePort —— 通道的两端

### 2.1 创建通道

\`\`\`javascript
const channel = new MessageChannel();
// channel.port1 和 channel.port2 是一对连接的端口
// 从 port1 发的消息，port2 能收到；反之亦然
\`\`\`

### 2.2 MessagePort 的 API

| 方法 | 说明 |
|------|------|
| \`postMessage(message, [transfer])\` | 通过端口发送消息 |
| \`onmessage = callback\` | 监听端口收到的消息 |
| \`start()\` | 开始派发消息（手动模式下需要调用） |
| \`close()\` | 关闭端口，释放资源 |

### 2.3 基本用法

\`\`\`javascript
const channel = new MessageChannel();

// 在 port1 这端监听
channel.port1.onmessage = (e) => {
  console.log('port1 收到:', e.data);
};

// 从 port2 发送消息
channel.port2.postMessage('你好，port1！');
// 输出: port1 收到: 你好，port1！
\`\`\`

> ⚠️ 在同一个上下文中，port1 和 port2 都能用。但实际使用中，通常会把其中一个端口**转移给另一个上下文**（比如 Worker）。

---

## 三、把端口发送给 Worker

MessagePort 是 **Transferable** 对象！可以把一个端口通过 \`postMessage\` 转移给 Worker，这样 Worker 就拥有了这个端口，可以直接用它和另一端通信。

### 3.1 建立专用通道

\`\`\`javascript
// 主线程
const worker = new Worker('worker.js');
const channel = new MessageChannel();

// port1 留在主线程
channel.port1.onmessage = (e) => {
  console.log('主线程收到:', e.data);
};

// port2 发给 Worker（转移所有权）
worker.postMessage({ type: 'init', port: channel.port2 }, [channel.port2]);

// 之后主线程可以通过 port1 直接和 Worker 通信
channel.port1.postMessage('通过专用通道发消息');
\`\`\`

### 3.2 Worker 端接收端口

\`\`\`javascript
// worker.js
let mainPort = null;

self.onmessage = (e) => {
  if (e.data.type === 'init') {
    // 接收主线程传来的 port
    mainPort = e.data.port;
    mainPort.onmessage = (event) => {
      console.log('Worker 通过端口收到:', event.data);
      // 通过端口回复
      mainPort.postMessage('收到，已处理');
    };
  }
};
\`\`\`

---

## 四、Worker 之间通信

MessageChannel 最强大的用途是让**两个 Worker 直接通信**，不需要主线程中转：

\`\`\`
主线程创建 MessageChannel
       │
       ├── port1 → 转移给 Worker A
       │
       └── port2 → 转移给 Worker B

现在 Worker A 和 Worker B 可以通过各自的 port 直接通信
\`\`\`

**代码实现：**

\`\`\`javascript
// 主线程
const workerA = new Worker('a.js');
const workerB = new Worker('b.js');
const channel = new MessageChannel();

// 把 port1 给 Worker A
workerA.postMessage({ type: 'connect', port: channel.port1 }, [channel.port1]);

// 把 port2 给 Worker B
workerB.postMessage({ type: 'connect', port: channel.port2 }, [channel.port2]);

// 现在 A 和 B 可以直接通信，主线程不再参与
\`\`\`

**Worker A（a.js）：**

\`\`\`javascript
let peerPort;
self.onmessage = (e) => {
  if (e.data.type === 'connect') {
    peerPort = e.data.port;
    peerPort.onmessage = (event) => {
      console.log('A 收到 B 的消息:', event.data);
    };
    // A 主动发消息给 B
    peerPort.postMessage('你好 B，我是 A');
  }
};
\`\`\`

**Worker B（b.js）：**

\`\`\`javascript
let peerPort;
self.onmessage = (e) => {
  if (e.data.type === 'connect') {
    peerPort = e.data.port;
    peerPort.onmessage = (event) => {
      console.log('B 收到 A 的消息:', event.data);
      peerPort.postMessage('你好 A，我是 B');
    };
  }
};
\`\`\`

---

## 五、MessagePort 生命周期

### 5.1 start() 的作用

MessagePort 创建后，默认不会立即开始派发消息。有两种方式启动：

\`\`\`javascript
// 方式一：设置 onmessage 会自动调用 start()
port.onmessage = function(e) { ... }; // 自动 start()

// 方式二：用 addEventListener 需要手动 start()
port.addEventListener('message', function(e) { ... });
port.start(); // 必须手动调用！
\`\`\`

### 5.2 close() 释放资源

端口不再使用时，应该调用 \`close()\` 释放资源：

\`\`\`javascript
port.close();
// 关闭后：
// - 不能再 postMessage
// - 不能再收到消息
// - 内存被释放
\`\`\`

**注意事项：**
- port1 和 port2 任何一个 \`close()\`，另一个也无法再正常工作
- 不 close 会导致内存泄漏（尤其是频繁创建通道时）

---

## 六、MessageChannel vs 直接 postMessage

| 特性 | 直接 postMessage | MessageChannel |
|------|:---------------:|:--------------:|
| 通信方 | 主线程 ↔ Worker | 任意两个上下文 |
| Worker 间通信 | 需主线程中转 | ✅ 直接通信 |
| 多通道隔离 | ❌（共用一个通道） | ✅（每个通道独立） |
| 复杂度 | 简单 | 稍复杂 |
| 灵活性 | 低 | 高 |
| 适用场景 | 简单的一对一 | 复杂的多方通信 |

---

## 七、使用场景总结

1. **Worker 间直接通信**：避免主线程中转的开销和阻塞
2. **多通道隔离**：不同类型消息走不同通道，互不干扰
3. **第三方库通信**：给 iframe 或第三方 Worker 提供专用通道
4. **流式数据处理**：结合 ReadableStream 实现管道式处理

> 📖 **《JavaScript高级程序设计》提示**：MessageChannel 最初是为窗口间通信设计的，后来成为 Worker 通信的重要补充。它和 Transferable 机制结合，可以实现非常灵活的通信架构。

---

## 八、本章小结

| 要点 | 说明 |
|------|------|
| MessageChannel 创建一对端口 | port1 和 port2 互相连接 |
| MessagePort 可转移 | 通过 postMessage 转移给 Worker |
| 支持 Worker 间通信 | 两端各在一个 Worker 中 |
| 需要管理生命周期 | start() 启动，close() 释放 |
| 比直接 postMessage 更灵活 | 适合复杂多方通信场景 |`,
    code: `// ============================================
// 第九章代码：MessageChannel 消息通道演示
// 用 EventEmitter 模拟 MessageChannel / MessagePort
// ============================================
var EventEmitter = require('events');

// --------------------------------------------
// 模拟 MessagePort —— 消息端口
// 浏览器中 MessagePort 是原生对象
// 这里用 EventEmitter 模拟其消息收发能力
// --------------------------------------------
class MockMessagePort extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this._otherPort = null;  // 对端端口
    this._closed = false;
    this._started = false;
  }

  // 连接到另一个端口（内部方法）
  _connect(otherPort) {
    this._otherPort = otherPort;
  }

  // 发送消息
  // 浏览器中等价于：port.postMessage(data)
  postMessage(data) {
    if (this._closed) {
      console.log('  [' + this.name + '] 端口已关闭，无法发送');
      return;
    }
    if (!this._otherPort) {
      console.log('  [' + this.name + '] 未连接对端');
      return;
    }
    var self = this;
    // 异步派发（模拟宏任务）
    setImmediate(function() {
      if (!self._otherPort._closed && self._otherPort._started) {
        self._otherPort.emit('message', { data: data });
      }
    });
  }

  // 开始派发消息
  // 浏览器中：设置 onmessage 会自动 start()
  // 用 addEventListener 需手动 start()
  start() {
    this._started = true;
  }

  // 设置 onmessage（自动 start）
  set onmessage(handler) {
    this._onmessage = handler;
    this.on('message', handler);
    this.start();
  }
  get onmessage() { return this._onmessage; }

  // 关闭端口
  close() {
    this._closed = true;
    this._started = false;
  }
}

// --------------------------------------------
// 模拟 MessageChannel —— 消息通道
// 浏览器中等价于：new MessageChannel()
// --------------------------------------------
class MockMessageChannel {
  constructor() {
    this.port1 = new MockMessagePort('port1');
    this.port2 = new MockMessagePort('port2');
    // 两个端口互相连接
    this.port1._connect(this.port2);
    this.port2._connect(this.port1);
  }
}

// ============================================
// 演示 1：同一上下文中使用 MessageChannel
// ============================================
console.log('=== 演示 1：基础 MessageChannel ===');

var channel = new MockMessageChannel();

// port1 监听消息
channel.port1.onmessage = function(e) {
  console.log('port1 收到:', e.data);
};

// port2 发消息给 port1
channel.port2.postMessage('你好，port1！');
channel.port2.postMessage('第二条消息');

// --------------------------------------------
// 异步等待辅助：用 await 让 setImmediate 回调有机会执行
// --------------------------------------------
var sleep = function(ms) {
  return new Promise(function(r) { setTimeout(r, ms || 1); });
};

// 等待演示 1 的异步消息派发完成
await sleep(5);

// ============================================
// 演示 2：主线程把端口转移给 Worker
// 模拟"专用通道"模式
// ============================================
console.log('\\n=== 演示 2：主线程 ↔ Worker 专用通道 ===');

// 模拟 Worker（接收端口后用端口通信）
var workerScope = new EventEmitter();
var workerPort = null; // Worker 持有的端口

// Worker 监听初始化消息
workerScope.on('init', function(e) {
  workerPort = e.data.port; // 接收转移过来的端口
  console.log('  [Worker] 收到端口:', workerPort.name);

  // Worker 通过端口监听主线程消息
  workerPort.onmessage = function(event) {
    console.log('  [Worker] 端口收到:', event.data);
    // 通过端口回复主线程
    workerPort.postMessage('处理完成: ' + event.data.toUpperCase());
  };
});

// 主线程创建通道
var ch = new MockMessageChannel();

// 主线程保留 port1，监听回复
ch.port1.onmessage = function(e) {
  console.log('  [主线程] 端口收到:', e.data);
};

// 把 port2 "转移"给 Worker（这里简化，直接传递）
// 浏览器中：worker.postMessage({ type: 'init', port: ch.port2 }, [ch.port2])
workerScope.emit('init', { data: { port: ch.port2 } });

// 主线程通过 port1 发消息
ch.port1.postMessage('hello');
ch.port1.postMessage('world');

// 等待端口消息异步派发
await sleep(5);

// ============================================
// 演示 3：Worker 之间直接通信
// 这是 MessageChannel 最强大的用途
// ============================================
await sleep(5);
console.log('\\n=== 演示 3：Worker 之间直接通信 ===');

// 模拟两个 Worker 的内部作用域
var workerA_scope = new EventEmitter();
var workerB_scope = new EventEmitter();
var portA = null; // Worker A 持有的端口
var portB = null; // Worker B 持有的端口

// Worker A 接收端口并设置监听
workerA_scope.on('connect', function(e) {
  portA = e.data.port;
  console.log('  [Worker A] 获得端口，开始监听...');
  portA.onmessage = function(event) {
    console.log('  [Worker A] 收到 B 的消息:', event.data);
  };
  // A 主动给 B 发消息
  portA.postMessage('你好 B，我是 A！');
});

// Worker B 接收端口并设置监听
workerB_scope.on('connect', function(e) {
  portB = e.data.port;
  console.log('  [Worker B] 获得端口，开始监听...');
  portB.onmessage = function(event) {
    console.log('  [Worker B] 收到 A 的消息:', event.data);
    // B 回复 A
    portB.postMessage('你好 A，我是 B！收到你的消息了');
  };
});

// 主线程创建通道，把两端分别发给两个 Worker
var peerChannel = new MockMessageChannel();

// 浏览器中：
// workerA.postMessage({ type: 'connect', port: peerChannel.port1 }, [peerChannel.port1]);
// workerB.postMessage({ type: 'connect', port: peerChannel.port2 }, [peerChannel.port2]);
workerA_scope.emit('connect', { data: { port: peerChannel.port1 } });
workerB_scope.emit('connect', { data: { port: peerChannel.port2 } });

console.log('  [主线程] 已为 A 和 B 建立直接通信通道');

// 等待 Worker 间消息异步派发
await sleep(5);

// ============================================
// 演示 4：端口生命周期管理
// ============================================
await sleep(5);
console.log('\\n=== 演示 4：端口生命周期 ===');

var ch2 = new MockMessageChannel();

ch2.port1.onmessage = function(e) {
  console.log('  port1 收到:', e.data);
};

// 正常通信
ch2.port2.postMessage('消息1');
console.log('  端口状态: port1 started=' + ch2.port1._started + ', closed=' + ch2.port1._closed);

// 等待消息派发
await sleep(5);

// 关闭端口
ch2.port2.close();
console.log('  port2 已关闭');
console.log('  端口状态: port2 closed=' + ch2.port2._closed);

// 关闭后再发消息
ch2.port2.postMessage('这条发不出去');
console.log('  → 端口关闭后无法再通信');
`,
  },

  // ============================================================
  // 第十章：BroadcastChannel 广播通信
  // ============================================================
  {
    id: "worker-broadcast",
    group: "Worker 通信",
    icon: "📡",
    title: "BroadcastChannel 广播通信",
    content: `## 一、广播的需求场景

考虑这样一个场景：用户在浏览器中打开了**多个标签页**，每个标签页都运行着同一个人的 Web 应用。用户在标签页 A 中登录了，希望其他标签页也能立即感知到登录状态变化。

传统方案：
- 用 \`localStorage\` 的 \`storage\` 事件 —— 只能传字符串，不够优雅
- 用 \`SharedWorker\` —— 太重了，需要额外维护一个 Worker
- 用 WebSocket —— 需要服务器参与，过于复杂

**BroadcastChannel** 就是为此而生的轻量级方案：**一个消息，所有同源页面的实例都能收到**。

### 1.1 什么是 BroadcastChannel？

BroadcastChannel 是一个**一对多**的广播通信 API。它允许**同源**的多个浏览上下文（标签页、窗口、iframe、Worker）之间进行广播通信。

\`\`\`
          ┌─────────────┐
          │ BroadcastChannel
          │   "news"    │
          └──────┬──────┘
                 │ 广播
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐
│ 标签页A │ │ 标签页B │ │ Worker │
└────────┘ └────────┘ └────────┘
  每个实例都能收到广播消息
\`\`\`

---

## 二、基本用法

### 2.1 创建广播频道

\`\`\`javascript
// 所有创建同名频道的实例，会自动加入同一个广播组
const bc = new BroadcastChannel('news');

// 监听广播消息
bc.onmessage = (e) => {
  console.log('收到广播:', e.data);
};

// 发送广播（所有其他实例都会收到）
bc.postMessage('大家好！');
\`\`\`

### 2.2 关键特点

1. **同名才能互通**：只有频道名相同的实例才会互相广播。
2. **自己不会收到**：发送方不会收到自己发的消息（和广播电台一样）。
3. **同源限制**：只有同源（协议+域名+端口相同）的页面才能互通。
4. **自动加入**：创建 \`new BroadcastChannel('name')\` 即自动加入该频道组。

---

## 三、与 postMessage / MessageChannel 对比

| 特性 | postMessage | MessageChannel | BroadcastChannel |
|------|:-----------:|:--------------:|:----------------:|
| 通信模式 | 一对一 | 一对一 | **一对多** |
| 接收方 | 指定一个 | 指定一个 | **所有同频道实例** |
| 需要连接 | 需要 Worker 引用 | 需转移端口 | **自动加入** |
| 跨标签页 | ❌ | ❌ | ✅ |
| Worker 间 | ✅（需主线程中转） | ✅（直接） | ✅（同频道即可） |
| 复杂度 | 低 | 中 | **低** |

---

## 四、实战场景

### 4.1 多标签页状态同步

最经典的用例——用户在标签页 A 登录后，标签页 B、C 自动更新登录状态：

\`\`\`javascript
// 每个标签页都运行这段代码
const bc = new BroadcastChannel('auth');

// 监听其他标签页的登录/登出消息
bc.onmessage = (e) => {
  if (e.data.type === 'login') {
    updateUI(e.data.user); // 更新 UI 为已登录状态
  } else if (e.data.type === 'logout') {
    updateUI(null); // 更新 UI 为未登录状态
  }
};

// 用户在当前标签页登录
function onLogin(user) {
  saveToken(user);
  updateUI(user);
  // 广播通知其他标签页
  bc.postMessage({ type: 'login', user: user });
}

// 用户在当前标签页登出
function onLogout() {
  clearToken();
  updateUI(null);
  bc.postMessage({ type: 'logout' });
}
\`\`\`

### 4.2 Worker 协调任务

多个 Worker 通过广播频道协调工作：

\`\`\`javascript
// worker.js
const bc = new BroadcastChannel('task-pool');

bc.onmessage = (e) => {
  if (e.data.type === 'task') {
    // 收到任务，处理它
    processTask(e.data.task);
    // 完成后广播通知
    bc.postMessage({ type: 'done', id: e.data.task.id });
  }
};
\`\`\`

### 4.3 缓存失效通知

当某个标签页更新了数据，通知其他标签页刷新缓存：

\`\`\`javascript
const bc = new BroadcastChannel('cache');

bc.onmessage = (e) => {
  if (e.data.type === 'invalidate') {
    cache.delete(e.data.key); // 清除本地缓存
    fetchData(e.data.key);    // 重新拉取
  }
};

// 更新数据后广播
function updateData(key, value) {
  saveToDB(key, value);
  bc.postMessage({ type: 'invalidate', key: key });
}
\`\`\`

---

## 五、生命周期管理

### 5.1 close() 释放资源

频道不再使用时，应调用 \`close()\`：

\`\`\`javascript
const bc = new BroadcastChannel('news');

// 使用...
bc.postMessage('最后一条消息');

// 不再需要时关闭
bc.close();
// 关闭后：
// - 不会再收到消息
// - postMessage 不会生效
// - 资源被释放
\`\`\`

### 5.2 同名频道的多个实例

同一个页面可以创建多个同名频道实例，它们之间也会互相广播：

\`\`\`javascript
const bc1 = new BroadcastChannel('test');
const bc2 = new BroadcastChannel('test');

bc1.onmessage = (e) => console.log('bc1 收到:', e.data);
bc2.onmessage = (e) => console.log('bc2 收到:', e.data);

bc1.postMessage('hello');
// bc2 会收到 "hello"（bc1 自己不会收到）
\`\`\`

---

## 六、注意事项与限制

### 6.1 同源限制

\`\`\`
✅ https://example.com/page1  ←→  https://example.com/page2   (同源，可通信)
✅ https://example.com/page1  ←→  https://example.com/worker  (同源，可通信)
❌ https://example.com  ←→  http://example.com  (协议不同)
❌ https://a.example.com  ←→  https://b.example.com  (域名不同)
❌ https://example.com:8080  ←→  https://example.com:9090  (端口不同)
\`\`\`

### 6.2 不保证消息顺序跨实例

虽然同一个发送方的消息会被其他实例按序收到，但**多个发送方**的消息到达顺序不保证。

### 6.3 数据是克隆的

和 postMessage 一样，BroadcastChannel 的消息也是**结构化克隆**的，不是引用传递。可以发送任意可克隆类型。

### 6.4 无跨域支持

BroadcastChannel 严格限于同源。如果需要跨域通信，还是得用 \`window.postMessage\` 或 WebSocket。

> 📖 **《JavaScript高级程序设计》提示**：BroadcastChannel 是相对较新的 API（2015 年后逐步普及），它填补了"同源多上下文轻量通信"的空白。在使用前建议检查兼容性：\`if ('BroadcastChannel' in self)\`。

---

## 七、BroadcastChannel vs SharedWorker

| 特性 | BroadcastChannel | SharedWorker |
|------|:----------------:|:------------:|
| 通信模式 | 广播（一对多） | 需手动管理连接 |
| 复杂度 | 极低 | 较高 |
| 状态管理 | 无状态 | 可维护共享状态 |
| 跨标签页 | ✅ | ✅ |
| 适合场景 | 轻量通知、状态同步 | 复杂的共享逻辑 |

**选择建议：**
- 只需要"通知其他页面某件事发生了" → BroadcastChannel
- 需要"多个页面共享一段运行逻辑" → SharedWorker

---

## 八、本章小结

| 要点 | 说明 |
|------|------|
| 一对多广播 | 一个消息，所有同频道实例都能收到 |
| 同名才能互通 | \`new BroadcastChannel('name')\` 自动加入 |
| 自己收不到自己 | 发送方不会被自己的消息触发 |
| 同源限制 | 协议+域名+端口必须相同 |
| 轻量级 | 比 SharedWorker 简单得多 |
| 典型场景 | 多标签页状态同步、缓存失效、任务协调 |
| 记得 close() | 不用时关闭频道释放资源 |`,
    code: `// ============================================
// 第十章代码：BroadcastChannel 广播通信演示
// 用 EventEmitter 模拟广播频道机制
// ============================================
var EventEmitter = require('events');

// --------------------------------------------
// 全局频道注册表
// 模拟浏览器中同名 BroadcastChannel 互通的机制
// key: 频道名 → value: 该频道下所有实例的数组
// --------------------------------------------
var channelRegistry = {};

// --------------------------------------------
// 模拟 BroadcastChannel
// 浏览器中等价于：new BroadcastChannel('name')
// --------------------------------------------
class MockBroadcastChannel extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this._closed = false;

    // 注册到全局频道表
    if (!channelRegistry[name]) {
      channelRegistry[name] = [];
    }
    channelRegistry[name].push(this);
    console.log('  [频道:' + name + '] 新实例加入，当前成员数:', channelRegistry[name].length);
  }

  // 发送广播
  // 浏览器中等价于：bc.postMessage(data)
  postMessage(data) {
    if (this._closed) {
      console.log('  [频道:' + this.name + '] 已关闭，无法发送');
      return;
    }
    var self = this;
    var members = channelRegistry[this.name] || [];

    // 异步广播给所有其他成员（不包括自己）
    setImmediate(function() {
      members.forEach(function(member) {
        if (member !== self && !member._closed) {
          member.emit('message', { data: data });
        }
      });
    });
  }

  // 设置 onmessage（自动监听）
  set onmessage(handler) {
    this._onmessage = handler;
    this.on('message', handler);
  }
  get onmessage() { return this._onmessage; }

  // 关闭频道
  close() {
    if (this._closed) return;
    this._closed = true;
    // 从注册表中移除
    var members = channelRegistry[this.name] || [];
    var idx = members.indexOf(this);
    if (idx !== -1) members.splice(idx, 1);
    console.log('  [频道:' + this.name + '] 实例已关闭，剩余成员:', members.length);
  }
}

// ============================================
// 演示 1：基本广播 —— 一发多收
// ============================================
console.log('=== 演示 1：基本广播 ===');

// 模拟 3 个"标签页"加入同一频道
var tab1 = new MockBroadcastChannel('news');
var tab2 = new MockBroadcastChannel('news');
var tab3 = new MockBroadcastChannel('news');

// 每个标签页监听广播
tab1.onmessage = function(e) { console.log('  Tab1 收到:', e.data); };
tab2.onmessage = function(e) { console.log('  Tab2 收到:', e.data); };
tab3.onmessage = function(e) { console.log('  Tab3 收到:', e.data); };

// Tab1 发广播 —— Tab2 和 Tab3 会收到，Tab1 自己不会收到
console.log('Tab1 发送广播...');
tab1.postMessage({ type: 'news', text: '重要通知：系统将于今晚维护' });

// --------------------------------------------
// 异步等待辅助：用 await 让 setImmediate 回调有机会执行
// --------------------------------------------
var sleep = function(ms) {
  return new Promise(function(r) { setTimeout(r, ms || 1); });
};

// 等待演示 1 的异步广播完成
await sleep(5);

// ============================================
// 演示 2：多标签页登录状态同步
// ============================================
console.log('\\n=== 演示 2：多标签页登录状态同步 ===');

var auth1 = new MockBroadcastChannel('auth');
var auth2 = new MockBroadcastChannel('auth');
var auth3 = new MockBroadcastChannel('auth');

// 模拟各标签页的登录状态
var states = { tab_a: false, tab_b: false, tab_c: false };

auth1.onmessage = function(e) {
  if (e.data.type === 'login') {
    states.tab_a = true;
    console.log('  [Tab A] 收到登录广播，用户:', e.data.user);
  } else if (e.data.type === 'logout') {
    states.tab_a = false;
    console.log('  [Tab A] 收到登出广播');
  }
};

auth2.onmessage = function(e) {
  if (e.data.type === 'login') {
    states.tab_b = true;
    console.log('  [Tab B] 收到登录广播，用户:', e.data.user);
  } else if (e.data.type === 'logout') {
    states.tab_b = false;
    console.log('  [Tab B] 收到登出广播');
  }
};

auth3.onmessage = function(e) {
  if (e.data.type === 'login') {
    states.tab_c = true;
    console.log('  [Tab C] 收到登录广播，用户:', e.data.user);
  } else if (e.data.type === 'logout') {
    states.tab_c = false;
    console.log('  [Tab C] 收到登出广播');
  }
};

// Tab A 执行登录
console.log('  [Tab A] 用户执行登录...');
auth1.postMessage({ type: 'login', user: '张三' });

// 等待广播送达
await sleep(5);
console.log('  当前各标签页状态:', JSON.stringify(states));

// Tab B 执行登出
await sleep(5);
console.log('\\n  [Tab B] 用户执行登出...');
auth2.postMessage({ type: 'logout' });

// 等待广播送达
await sleep(5);
console.log('  当前各标签页状态:', JSON.stringify(states));

// ============================================
// 演示 3：不同频道互不干扰
// ============================================
await sleep(5);
console.log('\\n=== 演示 3：不同频道互不干扰 ===');

var newsChannel = new MockBroadcastChannel('sports');
var techChannel = new MockBroadcastChannel('tech');

newsChannel.onmessage = function(e) {
  console.log('  [体育频道] 收到:', e.data);
};

techChannel.onmessage = function(e) {
  console.log('  [科技频道] 收到:', e.data);
};

// 在体育频道发消息，只有体育频道收到
newsChannel.postMessage('足球比赛开始！');
// 在科技频道发消息，只有科技频道收到
techChannel.postMessage('新处理器发布！');

await sleep(5);
console.log('  → 不同频道的消息互不干扰');

// ============================================
// 演示 4：关闭频道与生命周期
// ============================================
await sleep(5);
console.log('\\n=== 演示 4：关闭频道 ===');

var bc1 = new MockBroadcastChannel('lifecycle');
var bc2 = new MockBroadcastChannel('lifecycle');
var bc3 = new MockBroadcastChannel('lifecycle');

bc1.onmessage = function(e) { console.log('  bc1 收到:', e.data); };
bc2.onmessage = function(e) { console.log('  bc2 收到:', e.data); };
bc3.onmessage = function(e) { console.log('  bc3 收到:', e.data); };

// 正常广播
console.log('  bc1 发送消息（bc2、bc3 应收到）:');
bc1.postMessage('大家好');

// 等待广播送达
await sleep(5);

// 关闭 bc2
console.log('\\n  bc2 关闭...');
bc2.close();

// 等待广播送达
await sleep(5);

// bc1 再发消息，只有 bc3 收到
console.log('  bc1 再次发送消息（只有 bc3 应收到）:');
bc1.postMessage('bc2 已经走了');

// 等待广播送达
await sleep(5);

// bc2 关闭后发消息无效
console.log('\\n  bc2 尝试发送消息（应无效）:');
bc2.postMessage('我还在吗？');
console.log('  → 已关闭的频道无法收发消息');
`,
  },
];
