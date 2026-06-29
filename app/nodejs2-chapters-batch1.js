export const chapters = [
  // ============================================================
  // 开篇
  // ============================================================
  {
    id: "n2-intro",
    group: "开篇",
    icon: "⬢",
    title: "Node.js 进阶之旅：从会用到精通",
    content: `# Node.js 进阶之旅：从会用到精通

欢迎来到 Node.js 进阶教程！如果你已经学会了用 Node.js 写一些简单的脚本、搭一个 Express 服务器，但对很多底层原理一知半解，经常遇到一些"诡异"的异步问题不知从何下手，对性能优化无从下手，那么这套教程就是为你准备的。

这一章我们来聊聊：为什么要进阶学习 Node.js？进阶学什么？怎么学最高效？

---

## 为什么要进阶学习 Node.js？

很多开发者学 Node.js 的路径是这样的：
1. 花一周学了语法（其实就是 JavaScript）
2. 花两周学了 Express/Koa，会写接口了
3. 开始做项目，遇到问题就搜 Stack Overflow，复制粘贴
4. 做了一两个项目后，觉得自己"会"Node.js 了

但实际工作中你会发现：
- 写的接口 QPS 一高就崩，不知道怎么优化
- 遇到异步回调顺序不符合预期，根本不知道问题出在哪
- 内存泄漏了完全不知道怎么排查
- 看 Node.js 核心源码像看天书
- 用了很多框架但不知道框架背后做了什么

这就是"会用"和"精通"的差距。**会用**能让你找到工作，**精通**能让你拿到高薪、解决别人解决不了的问题、写出高质量的代码。

Node.js 已经是全球使用最广泛的服务端 JavaScript 运行时，从后端服务到构建工具链（Webpack/Vite），从桌面应用（Electron）到 Serverless，处处都有它的身影。深入理解 Node.js，不仅能让你写服务端更得心应手，对理解整个 JavaScript 生态都大有帮助。

---

## 本教程覆盖什么？

这套进阶教程分为以下几个部分：

### 第一部分：异步编程深度解析
这是 Node.js 的灵魂，也是最容易产生误解和 bug 的地方。我们会深入：
- **事件循环（Event Loop）**：6 个阶段到底做了什么？和浏览器事件循环有什么区别？
- **process.nextTick 与微任务**：为什么 nextTick 总是比 Promise.then 先执行？递归 nextTick 为什么会饿死 IO？
- **setImmediate vs setTimeout**：为什么主模块中执行顺序不确定？IO 回调中却确定？
- **Promise 进阶**：链式调用、错误穿透、静态方法（all/race/allSettled/any）的正确用法
- **async/await 原理与陷阱**：串行 vs 并行、循环中的 await、顶层 await
- **异步错误处理**：从 error-first 到 try/catch，unhandledRejection 为什么一定要监听
- **EventEmitter 事件机制**：发布订阅模式、error 事件为什么不监听就崩溃

### 第二部分：核心模块源码解读
我们会读 Node.js 核心模块的源码，理解它们的设计思路：
- Stream：流的实现原理，背压（backpressure）机制
- Buffer：二进制数据处理
- fs：文件系统模块，同步/异步 API 的选择
- events：EventEmitter 源码
- 等等

### 第三部分：性能优化
- 如何排查性能瓶颈
- 内存管理与垃圾回收
- 集群与多进程
- 常用优化手段

### 第四部分：工程化
- 模块系统（CommonJS vs ES Modules）
- npm 包开发最佳实践
- 调试技巧
- 测试

### 第五部分：实战
综合运用所学知识完成实战项目。

---

## 学习方法建议

1. **动手写代码**：每个章节都有可运行的代码示例，一定要亲手运行、修改、观察结果。Node.js 的异步特性，光靠看是看不会的。
2. **大胆猜测，小心验证**：在运行示例之前，先自己猜一下输出顺序是什么，然后运行看和你猜的是否一致。猜错了正是学习的好机会。
3. **看源码**：当你对某个 API 有疑问时，直接去看 Node.js 的源码实现，比看十篇博客都管用。
4. **写总结**：学完一个知识点后，用自己的话把它讲出来（可以写博客、讲给同事听），能讲明白才是真懂了。
5. **遇到问题先想原理**：遇到 bug 不要立刻搜答案，先想：这个问题和事件循环有没有关系？是不是异步顺序问题？

准备好了吗？让我们开始这段进阶之旅吧！
`,
    code: `// ============================================
// 开篇示例：Node.js 核心模块综合演示
// ============================================

const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');
const crypto = require('crypto');

console.log('═══════════════════════════════════════════');
console.log('  ⬢ 欢迎来到 Node.js 进阶之旅！');
console.log('═══════════════════════════════════════════');
console.log('');

// 1. 版本信息
console.log('【运行时信息】');
console.log('  Node.js 版本:', process.version);
console.log('  平台:', process.platform);
console.log('  架构:', process.arch);
console.log('  启动目录:', process.cwd());
console.log('');

// 2. os 模块
console.log('【系统信息】');
console.log('  主机名:', os.hostname());
console.log('  CPU 核心数:', os.cpus().length);
console.log('  总内存:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('  空闲内存:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('  系统上线时间:', (os.uptime() / 3600).toFixed(1), '小时');
console.log('');

// 3. path 模块
console.log('【路径处理演示】');
const filePath = '/users/zhaoliangshun/project/app.js';
console.log('  原始路径:', filePath);
console.log('  目录:', path.dirname(filePath));
console.log('  文件名:', path.basename(filePath));
console.log('  扩展名:', path.extname(filePath));
console.log('  拼接路径:', path.join('/users', 'zhaoliangshun', 'docs', 'readme.md'));
console.log('');

// 4. crypto 模块
console.log('【加密模块演示】');
const hash = crypto.createHash('sha256');
hash.update('Hello Node.js!');
console.log('  SHA256("Hello Node.js!"):', hash.digest('hex').slice(0, 32) + '...');
console.log('');

// 5. EventEmitter 演示
console.log('【EventEmitter 演示】');
class LessonEmitter extends EventEmitter {}
const lesson = new LessonEmitter();
let step = 0;

lesson.on('start', (name) => {
  console.log('  📚 开始学习:', name);
});
lesson.on('progress', (n) => {
  console.log('  📖 已完成章节:', n);
});
lesson.on('complete', () => {
  console.log('  🎉 恭喜完成本章节！');
  console.log('');
  showTips();
});

lesson.emit('start', 'Node.js 进阶');
setTimeout(() => {
  step = 1;
  lesson.emit('progress', step);
}, 100);
setTimeout(() => {
  step = 2;
  lesson.emit('progress', step);
}, 200);
setTimeout(() => {
  lesson.emit('complete');
}, 300);

function showTips() {
  console.log('═══════════════════════════════════════════');
  console.log('  学习建议');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. 动手运行每个代码示例');
  console.log('  2. 修改代码，观察结果变化');
  console.log('  3. 遇到问题先想事件循环原理');
  console.log('  4. 准备好进入第一章：事件循环深度剖析！');
  console.log('');
}
`
  },

  // ============================================================
  // 第一章：事件循环深度剖析
  // ============================================================
  {
    id: "n2-event-loop",
    group: "第一部分 异步编程深度解析",
    icon: "🔄",
    title: "第一章：事件循环（Event Loop）深度剖析",
    content: `# 事件循环（Event Loop）深度剖析

事件循环是 Node.js 异步非阻塞 I/O 模型的核心。理解事件循环，是理解 Node.js 一切异步行为的基础。这一章我们彻底搞懂 Node.js 的事件循环到底是怎么工作的。

---

## 什么是事件循环？

JavaScript 是单线程的，但 Node.js 却能处理高并发，秘密就在于事件循环。简单来说：事件循环就是一个"无限循环"，它不断地检查有没有任务要执行，有就执行，没有就休眠等待新任务进来。

但 Node.js 的事件循环不是一个简单的"取任务→执行→取下一个"的队列，它有**6 个阶段**，每个阶段有自己的任务队列，不同类型的异步任务在不同的阶段执行。这就是为什么 setTimeout、setImmediate、Promise.then 的执行顺序总是让人困惑——它们属于不同的阶段！

---

## 事件循环的 6 个阶段

Node.js 事件循环每一轮（我们叫一个 tick）会按顺序经过以下 6 个阶段：

\`\`\`
   ┌───────────────────────────┐
┌─>│           timers          │  执行 setTimeout/setInterval 的回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  执行延迟的 I/O 回调（比如 TCP 错误）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用，忽略
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  等待新的 I/O 事件，执行 I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  执行 setImmediate 的回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  执行 socket.on('close') 等回调
   └───────────────────────────┘
\`\`\`

每个阶段都有自己的**回调队列**。当事件循环进入某个阶段时，会执行该阶段队列中的回调，直到队列清空或者达到该阶段的执行上限，然后进入下一个阶段。

### 1. timers 阶段
这是事件循环的第一个阶段，用来执行 \`setTimeout\` 和 \`setInterval\` 设置的回调。注意：定时器不是精确时间，而是**最早执行时间**——在这个时间点之后，timers 阶段会尽可能快地执行它们，但会被其他阶段阻塞。

### 2. pending callbacks 阶段
这个阶段执行一些系统操作的回调，比如 TCP 连接出错时的回调。大部分时候我们不需要关心这个阶段。

### 3. idle, prepare 阶段
这是 Node.js 内部使用的阶段，我们不需要关心。

### 4. poll 阶段（重要！）
这是最关键的阶段，事件循环在这里**等待新的 I/O 事件**。poll 阶段做两件事：
1. 执行 poll 队列中的 I/O 回调（比如文件读取完成、网络请求回来的回调）
2. 如果 poll 队列空了：
   - 如果有 \`setImmediate\` 在等待，直接进入 check 阶段
   - 如果有到期的 timer，绕回 timers 阶段
   - 否则，阻塞在这里等待新的 I/O 事件进来

### 5. check 阶段
这个阶段专门执行 \`setImmediate\` 的回调。这是 poll 阶段之后立即执行的阶段。

### 6. close callbacks 阶段
执行关闭事件的回调，比如 \`socket.on('close', ...)\`。

---

## microtask（微任务）在哪里执行？

注意上面的 6 个阶段里没有微任务！微任务（microtask）不是在某个特定阶段执行的，而是在**每个阶段切换之间**执行！

微任务有两种：
- \`process.nextTick()\` 的回调 —— nextTick 队列
- \`Promise.then()/catch()/finally()\`、\`queueMicrotask()\` 的回调 —— Promise 微任务队列

执行规则：**每个阶段执行完后，会立刻清空 nextTick 队列，然后清空 Promise 微任务队列，之后才进入下一个阶段。**

而且，nextTick 队列的优先级比 Promise 微任务队列**高**——所有 nextTick 回调执行完，才会执行 Promise 微任务。

这非常重要！记住：**nextTick > Promise.then**。

---

## 执行顺序总结

现在我们可以得出完整的执行顺序：

1. 同步代码（当前 tick 主模块）
2. 执行完同步代码后，立即清空 microtask：
   - 先清空所有 process.nextTick 回调
   - 再清空所有 Promise 微任务
3. 进入事件循环，按阶段执行：
   - timers 阶段：执行 setTimeout/setInterval 回调
     * 每个回调执行完后，都清空 microtask（nextTick 先，然后 Promise）
   - pending callbacks 阶段
     * 清空 microtask
   - idle/prepare 阶段
     * 清空 microtask
   - poll 阶段：执行 I/O 回调
     * 每个回调执行完后，都清空 microtask
   - check 阶段：执行 setImmediate 回调
     * 每个回调执行完后，都清空 microtask
   - close callbacks 阶段
     * 清空 microtask
4. 回到步骤 3，开始下一轮 tick

---

## Node.js vs 浏览器事件循环

很多人会把两者搞混，它们确实有很大区别：

| 特性 | Node.js 事件循环 | 浏览器事件循环 |
|------|-----------------|---------------|
| 阶段划分 | 6个阶段（timers/pending/idle/poll/check/close） | 宏任务/微任务两个队列 |
| 微任务执行时机 | 每个阶段切换之间、每个回调之后 | 每个宏任务执行完之后 |
| setImmediate | 有，check 阶段执行 | 没有（浏览器有自己的实现但不一样） |
| nextTick | 有，高优先级微任务 | 没有 |
| 宏任务概念 | 没有明确"宏任务"概念，分阶段执行 | 宏任务包括 setTimeout、事件回调等 |

简单记：浏览器是"一个宏任务 → 所有微任务 → 下一个宏任务"；Node.js 是"一个阶段 → 阶段中每个回调执行后都清空微任务 → 下一个阶段"。
`,
    code: `// ============================================
// 事件循环执行顺序演示
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  🔄 事件循环执行顺序');
console.log('═══════════════════════════════════════════');
console.log('');

const order = [];

// 同步代码
order.push('1. 同步代码 1');

// 微任务
process.nextTick(() => {
  order.push('7. process.nextTick 1');
  Promise.resolve().then(() => {
    order.push('    ↳ Promise 在 nextTick 回调中');
  });
  process.nextTick(() => {
    order.push('8. nextTick 中的 nextTick');
  });
});

Promise.resolve().then(() => {
  order.push('9. Promise.then 1');
  process.nextTick(() => {
    order.push('    ↳ nextTick 在 Promise 回调中');
  });
});

// timers
setTimeout(() => {
  order.push('11. setTimeout');
  Promise.resolve().then(() => {
    order.push('    ↳ setTimeout 中的 Promise');
  });
  process.nextTick(() => {
    order.push('    ↳ setTimeout 中的 nextTick');
  });
}, 0);

// check
setImmediate(() => {
  order.push('12. setImmediate');
});

// 另一个微任务
process.nextTick(() => {
  order.push('7. process.nextTick 2');
});

Promise.resolve().then(() => {
  order.push('9. Promise.then 2');
});

// 同步代码
order.push('2. 同步代码 2');

// 打印初始同步部分
console.log('【同步代码执行完毕，现在事件循环开始处理异步任务】');
console.log('');
console.log('执行顺序：');

// 等所有异步执行完后打印结果
setTimeout(() => {
  order.forEach(item => console.log('  ' + item));
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  顺序解析');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1-2: 同步代码先执行，毫无疑问');
  console.log('  7-9: 同步代码后立即清空 microtask');
  console.log('       nextTick 全部执行完才到 Promise');
  console.log('  11: timers 阶段执行 setTimeout');
  console.log('  12: check 阶段执行 setImmediate');
  console.log('');
  console.log('  💡 关键规律：');
  console.log('  - 同步代码 → nextTick队列 → Promise队列 → 事件循环各阶段');
  console.log('  - nextTick 优先级高于 Promise');
  console.log('  - 每个回调执行后都会清空 microtask');
  console.log('');
}, 500);
`
  },

  // ============================================================
  // 第二章：process.nextTick 与 microtask 队列
  // ============================================================
  {
    id: "n2-microtask",
    group: "第一部分 异步编程深度解析",
    icon: "⚡",
    title: "第二章：process.nextTick 与 microtask 队列",
    content: `# process.nextTick 与 microtask 队列

上一章我们提到了 microtask，这一章我们来深入理解 process.nextTick 和 Promise 微任务队列的机制，以及为什么 nextTick 能造成 IO 饥饿——这是 Node.js 面试的高频考点，也是实际开发中容易踩坑的地方。

---

## nextTick 是什么？

\`process.nextTick()\` 是 Node.js 特有的一个 API，它的作用是：**把回调放到当前执行栈的末尾，下一次事件循环阶段切换之前执行。**

注意，它不是事件循环的某个阶段，而是在**每个阶段之间**执行的高优先级任务。

### nextTick 的执行时机

我们上一章总结过，nextTick 在这些时候执行：
1. 同步代码执行完毕后，进入事件循环之前
2. 事件循环每个阶段（timers、poll、check等）切换之间
3. 每个异步回调执行完毕后

而且关键是：**nextTick 队列中的所有回调，会一次性全部清空，然后才会执行 Promise 微任务队列，再然后才进入事件循环的下一个阶段。**

### nextTick vs Promise.then 的优先级

这是一个经典面试题：下面代码输出什么？

\`\`\`js
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
\`\`\`

答案是：先输出 nextTick，再输出 promise。因为 nextTick 队列的优先级永远高于 Promise 微任务队列。

你可以这样理解：microtask 实际上有两个子队列，nextTick 队列是"微任务中的微任务"，优先级最高。执行顺序是：**先清空全部 nextTick 队列，再清空全部 Promise 微任务队列**。

---

## 递归 nextTick 导致 IO 饥饿

nextTick 有一个非常重要的坑：**递归调用 process.nextTick 会饿死 I/O！** 因为 nextTick 队列清空后才进入下一个阶段，如果 nextTick 递归不断往队列里加新任务，事件循环就永远无法进入 poll 阶段去处理 I/O 事件了。

看这个例子：

\`\`\`js
const fs = require('fs');

fs.readFile(__filename, () => {
  console.log('readFile 回调');
});

function nextTickRecursive(n) {
  if (n > 1000) return;
  process.nextTick(() => {
    // console.log(n); // 注释掉，不然输出太多
    nextTickRecursive(n + 1);
  });
}
nextTickRecursive(0);
\`\`\`

你可能觉得 readFile 回调会在中间执行，但实际上：所有 nextTick 递归执行完之前，readFile 的回调永远不会执行！因为事件循环根本进不到 poll 阶段，所有时间都在清空 nextTick 队列。

这就是所谓的"IO 饥饿"（I/O starvation）。

---

## 那 Promise 递归会不会饿死 IO？

会的！Promise.then 递归也会造成 IO 饥饿，因为 Promise 微任务队列也是在阶段之间清空的：

\`\`\`js
function promiseRecursive(n) {
  if (n > 1000) return;
  Promise.resolve().then(() => {
    promiseRecursive(n + 1);
  });
}
\`\`\`

不过，因为 nextTick 比 Promise 优先级高，nextTick 队列会先清空。如果既有递归 nextTick 又有递归 Promise，那么所有 nextTick 先执行完，再执行所有 Promise，之后才处理 IO。

---

## 那 setImmediate 递归呢？

setImmediate 递归**不会**饿死 IO！因为 setImmediate 在 check 阶段执行，每个 setImmediate 回调执行完后，事件循环会继续走完后续阶段（close），然后进入下一轮循环（timers → pending → poll → check），在 poll 阶段就有机会处理 IO 了。

这就是为什么我们要分批次处理大任务时，推荐用 setImmediate 而不是 nextTick。

---

## 为什么要有 nextTick？

既然 nextTick 这么危险，为什么 Node.js 要设计它？nextTick 有两个重要用途：

### 1. 允许用户在事件循环继续之前处理错误、清理资源

比如你写了一个 EventEmitter，在构造函数里 emit 一个事件，但用户可能在构造函数**之后**才监听：

\`\`\`js
class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // 如果直接 emit，用户还没机会 on('event')
    // this.emit('event', 'hello');
    // 用 nextTick，用户有机会在同步代码里注册监听器
    process.nextTick(() => {
      this.emit('event', 'hello');
    });
  }
}
const ee = new MyEmitter();
ee.on('event', (data) => console.log(data)); // 能监听到
\`\`\`

### 2. 保证回调永远异步执行

有些 API 可能同步执行回调，也可能异步执行回调，这会导致不可预期的顺序问题。用 nextTick 可以保证回调永远异步执行：

\`\`\`js
function maybeAsync(fn, callback) {
  if (fn === 'sync') {
    // 为了保证异步，用 nextTick
    process.nextTick(callback, null, 'result');
    return;
  }
  // 异步情况...
}
\`\`\`

---

## nextTick 最佳实践

1. **慎用递归 nextTick**：除非你非常确定递归很快会结束，否则不要在 nextTick 回调里递归调用 nextTick。
2. **长时间运行的任务用 setImmediate**：分批次处理大任务时，用 setImmediate 而不是 nextTick，避免饿死 IO。
3. **不要用 nextTick 延迟到"下一个 tick"**：在 IO 回调里，setImmediate 比 setTimeout(fn, 0) 快，也比 nextTick 安全。
4. **理解执行顺序**：永远记住 nextTick > Promise.then > setImmediate/setTimeout（在特定阶段）。
`,
    code: `// ============================================
// nextTick vs Promise vs setImmediate 对比演示
// ============================================

const fs = require('fs');

console.log('═══════════════════════════════════════════');
console.log('  ⚡ process.nextTick 与 microtask');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 实验 1：nextTick vs Promise 优先级 ============
console.log('【实验 1】nextTick vs Promise 优先级');
console.log('');

const order1 = [];
Promise.resolve().then(() => order1.push('2. Promise 2'));
process.nextTick(() => order1.push('1. nextTick 1'));
Promise.resolve().then(() => order1.push('2. Promise 1'));
process.nextTick(() => order1.push('1. nextTick 2'));
Promise.resolve().then(() => {
  order1.push('2. Promise 3');
  process.nextTick(() => order1.push('  ↳ nextTick 会插到所有 Promise 前面吗？不会！'));
});
process.nextTick(() => {
  order1.push('1. nextTick 3');
  Promise.resolve().then(() => order1.push('  ↳ Promise 在 nextTick 回调中'));
});

setTimeout(() => {
  order1.forEach(item => console.log('  ' + item));
  console.log('');
  console.log('  💡 结论：所有 nextTick 清空后才会执行 Promise');
  console.log('     但在 nextTick/Promise 回调中新加入的微任务');
  console.log('     会在当前微任务清空阶段继续处理');
  console.log('');
  
  // ============ 实验 2：nextTick 递归 vs setImmediate 递归 ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 2】nextTick 递归 vs setImmediate 递归（IO 饥饿）');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  let nextTickCount = 0;
  let immediateCount = 0;
  let ioDone = false;
  
  // 模拟一个 IO 操作
  fs.readFile(__filename, () => {
    ioDone = true;
    console.log('  📄 readFile 回调执行！');
    console.log('     nextTick 递归次数:', nextTickCount);
    console.log('     setImmediate 递归次数:', immediateCount);
    console.log('');
    
    // 现在演示 setImmediate 不饿死 IO
    console.log('  现在用 setImmediate 递归（不饿死 IO）:');
    console.log('');
    
    let immCount2 = 0;
    let io2Done = false;
    
    fs.readFile(__filename, () => {
      io2Done = true;
      console.log('  📄 readFile 回调（setImmediate 场景）执行！');
      console.log('     setImmediate 已执行次数:', immCount2);
      console.log('');
      setTimeout(printSummary, 500);
    });
    
    function immRecursive() {
      immCount2++;
      if (!io2Done) {
        setImmediate(immRecursive);
      }
    }
    immRecursive();
  });
  
  // nextTick 递归（有限次，演示饥饿）
  function nextTickRecursive() {
    nextTickCount++;
    if (nextTickCount < 1000) {
      process.nextTick(nextTickRecursive);
    }
  }
  nextTickRecursive();
  
  // setImmediate 递归
  function immediateRecursive() {
    immediateCount++;
    if (!ioDone) {
      setImmediate(immediateRecursive);
    }
  }
  immediateRecursive();
  
  console.log('  已启动 nextTick 递归(1000次) 和 setImmediate 递归');
  console.log('  等待 readFile 回调执行...');
  console.log('  (nextTick 递归会延迟 IO，setImmediate 不会)');
  console.log('');
}, 100);

function printSummary() {
  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. nextTick 优先级 > Promise 优先级');
  console.log('  2. nextTick 队列全部清空才执行 Promise 队列');
  console.log('  3. 递归 nextTick 会饿死 IO（事件循环进不了 poll）');
  console.log('  4. setImmediate 递归不会饿死 IO（每次一轮循环）');
  console.log('  5. 分批次处理大任务用 setImmediate，不要用 nextTick');
  console.log('');
}
`
  },

  // ============================================================
  // 第三章：setImmediate vs setTimeout
  // ============================================================
  {
    id: "n2-timers",
    group: "第一部分 异步编程深度解析",
    icon: "⏱️",
    title: "第三章：setImmediate vs setTimeout 深度对比",
    content: `# setImmediate vs setTimeout 深度对比

这是 Node.js 异步编程中最经典的"玄学"问题之一：为什么 setTimeout(fn, 0) 和 setImmediate(fn) 在主模块中执行顺序不确定，但在 IO 回调中 setImmediate 一定先执行？这一章我们彻底搞清楚。

---

## 先看现象

先运行最简单的例子：

\`\`\`js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
\`\`\`

多运行几次，你会发现有时候输出 timeout 在前，有时候 immediate 在前！这不是 bug，这是由事件循环的启动时机和 poll 阶段的行为决定的。

为什么会这样？我们需要理解事件循环启动时发生了什么。

---

## 为什么主模块中顺序不确定？

让我们回顾事件循环的流程。当 Node.js 启动时：

1. 初始化事件循环
2. 执行你的主模块代码（同步部分）
   - 遇到 \`setTimeout(fn, 0)\`：往 timers 队列插入一个 timer，过期时间 = 当前时间 + 0ms（即尽快过期）
   - 遇到 \`setImmediate(fn)\`：往 check 队列插入一个任务
3. 主模块执行完毕，开始进入事件循环

事件循环从哪里开始？它从 **timers 阶段**开始吗？并不是！事件循环进入循环后，首先检查 timers，但进入 poll 阶段后会有什么表现？

实际上，关键在于：

- **setTimeout 的过期检查**：事件循环进入 timers 阶段时，会检查是否有 timer 到期（即当前时间 >= timer 设置的时间）。但这里有个问题：setTimeout(0) 不是真的 0ms 延迟，它受系统时钟精度和启动开销影响。
- **poll 阶段的阻塞**：进入 poll 阶段后，如果 poll 队列为空，事件循环会检查是否有 setImmediate 在等待。如果有，直接进入 check 阶段。但它同时也会检查是否有 timer 已经到期，如果有 timer 到期了，它会绕回 timers 阶段。

问题就出在这里：**主模块执行完，事件循环进入 timers 阶段时，那个 setTimeout(0) 的 timer 到期了吗？**

- 如果主模块执行花了一点时间（超过 1ms），那么当事件循环进入 timers 阶段时，timer 已经到期了 → 执行 timeout 回调 → 然后经过 poll → check 执行 immediate → **timeout 在前**
- 如果主模块执行得非常快，进入 timers 阶段时 timer 还没到期（因为 setTimeout 有最小延迟，Node.js 中是 1ms）→ timers 阶段没东西可执行 → 进入 poll → poll 队列为空，发现有 setImmediate → 进入 check 阶段执行 immediate → 下一轮 timers 阶段才执行 timeout → **immediate 在前**

这就是为什么顺序不确定！它取决于你的进程性能、当前系统负载、执行同步代码花了多久。

> **setTimeout 的最小延迟**：虽然你写的是 setTimeout(fn, 0)，但 Node.js 和浏览器都规定了最小延迟。Node.js 是 1ms，浏览器（HTML5 规范）是 4ms。也就是说 0 会被强制改成 1ms。

---

## 为什么 IO 回调中 setImmediate 一定先于 setTimeout(0)？

这是确定的！如果我们在一个 IO 回调（比如 fs.readFile 的回调）里写：

\`\`\`js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
\`\`\`

**immediate 一定先输出！** 为什么？

因为 IO 回调是在 **poll 阶段**执行的。当 poll 阶段的回调执行完毕后：
1. poll 队列空了
2. 事件循环检查：有没有 setImmediate 在等待？有！
3. 直接进入 **check 阶段**执行 setImmediate 回调
4. check 阶段结束，进入 close callbacks 阶段
5. 然后才绕回**下一轮**的 timers 阶段，执行 setTimeout 回调

这就是关键区别！在 IO 回调中（也就是 poll 阶段中），poll → check 是**直接相连**的，中间不会绕回 timers。setTimeout 必须等到下一轮循环才能执行，而 setImmediate 在当前轮的 check 阶段就执行了。

\`\`\`
IO 回调在 poll 阶段执行完后的流程：
  poll 队列空
    ↓
  有 setImmediate 吗？有！
    ↓
  check 阶段（执行 setImmediate）←── setImmediate 在这里执行！
    ↓
  close callbacks
    ↓
  下一轮 timers 阶段（执行 setTimeout）←── setTimeout 在这里执行！
\`\`\`

所以在 IO 回调里，setImmediate 永远比 setTimeout(0) 快，这是 100% 确定的！

---

## 什么时候用 setTimeout，什么时候用 setImmediate？

理解了它们的执行阶段后，我们来看看实际场景中如何选择。

### 用 setTimeout 的场景

1. **需要延迟一段时间后执行**：这是 setTimeout 本来的用途。\`setTimeout(fn, 1000)\` 表示 1 秒后执行，这个没什么好说的。

2. **希望在当前 IO 回调、setImmediate 等都执行完，下一轮再执行**：但这个需求其实 setImmediate 也能做，只是执行时机不同。

### 用 setImmediate 的场景

1. **在 IO 回调后立即执行，不想等待下一轮 timers 阶段**：比如你在一个 IO 回调里安排了一些任务，希望它们在当前轮次尽快执行，但又不想在 poll 阶段递归（避免阻塞其他 IO），setImmediate 是最佳选择。

2. **递归执行长任务而不阻塞事件循环**：setImmediate 递归会在每次 check 阶段执行一次，中间事件循环可以处理其他阶段（timers、IO），不会导致饥饿。

\`\`\`js
// 用 setImmediate 分批次处理大任务，不阻塞 IO
function processLargeArray(array, index = 0) {
  const batchSize = 100;
  const end = Math.min(index + batchSize, array.length);
  
  for (let i = index; i < end; i++) {
    // 处理 array[i]
  }
  
  if (end < array.length) {
    setImmediate(() => processLargeArray(array, end));
  }
}
\`\`\`

3. **执行一些需要在 poll 阶段之后的清理工作**。

---

## setTimeout(0) 的替代品对比

我们经常想"异步执行一个函数，越快越好"，有几种方式可以做到，它们的执行顺序是：

| 方法 | 执行时机 | 会导致饥饿吗 |
|------|---------|-------------|
| process.nextTick(fn) | 当前阶段结束后立即执行，优先级最高 | 递归会饿死 IO |
| Promise.resolve().then(fn) | nextTick 之后、阶段结束前 | 递归会饿死 IO |
| queueMicrotask(fn) | 和 Promise.then 一样 | 递归会饿死 IO |
| setImmediate(fn) | poll 阶段后的 check 阶段 | 递归不会饿死 IO |
| setTimeout(fn, 0) | 下一轮或当前轮 timers 阶段（最早也要 1ms） | 递归不会饿死 IO |

**建议**：
- 如果你需要**最高优先级**且确定递归有限：用 process.nextTick（但慎用）
- 如果你需要**跨环境标准**：用 queueMicrotask
- 如果你需要**递归执行且不阻塞 IO**：用 setImmediate
- 如果你需要**真正延迟一段时间**：用 setTimeout

---

## timer 的其他坑

### 1. 延迟不是精确的

setTimeout 的延迟时间是**最小延迟**，不是保证延迟。如果事件循环被阻塞（比如有个耗时的同步计算、或者被 microtask 占满），timer 会被推迟执行。

\`\`\`js
const start = Date.now();
setTimeout(() => {
  console.log(\`实际延迟：\${Date.now() - start}ms\`); // 可能远大于 100ms！
}, 100);

// 阻塞 300ms
const end = Date.now() + 300;
while (Date.now() < end) {}
\`\`\`

上面的代码，setTimeout 设置了 100ms，但同步代码阻塞了 300ms，timer 只能等同步代码执行完才能执行，实际延迟超过 300ms。

### 2. 定时器延迟过大时会被覆盖

当延迟超过 2^31 - 1 毫秒（约 24.8 天），或者小于 1 时，delay 会被自动设置为 1。这是 Node.js 内部的限制。

### 3. clearTimeout 和 clearImmediate

- setTimeout 返回一个 Timeout 对象，用 clearTimeout 清除
- setImmediate 返回一个 Immediate 对象，用 clearImmediate 清除
- 这两个返回值都是对象，不是数字 ID（浏览器中是数字）
`,
    code: `// ============================================
// setImmediate vs setTimeout 对比演示
// ============================================

const fs = require('fs');

console.log('═══════════════════════════════════════════');
console.log('  ⏱️ setImmediate vs setTimeout');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 实验 1：主模块中的顺序（不确定）============
console.log('【实验 1】主模块中（顺序可能不确定，多运行几次试试）');
console.log('');

setTimeout(() => console.log('  1. setTimeout(0)'), 0);
setImmediate(() => console.log('  2. setImmediate'));

setTimeout(() => {
  console.log('');
  console.log('  💡 上面两个的顺序可能变化，取决于事件循环启动时 timer 是否到期');
  console.log('');
  
  // ============ 实验 2：IO 回调中（顺序确定！）============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 2】fs.readFile IO 回调中（顺序 100% 确定）');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  fs.readFile(__filename, () => {
    const order = [];
    setTimeout(() => order.push('setTimeout(0)'), 0);
    setImmediate(() => order.push('setImmediate'));
    
    // 等两个都执行完
    setTimeout(() => {
      order.forEach((item, i) => console.log('  ' + (i+1) + '.', item));
      console.log('');
      console.log('  💡 在 IO 回调（poll阶段）中，setImmediate 永远先执行！');
      console.log('     因为 poll 之后直接是 check 阶段');
      console.log('');
      
      // ============ 实验 3：setImmediate 回调中 ============
      console.log('═══════════════════════════════════════════');
      console.log('【实验 3】setImmediate 回调中');
      console.log('═══════════════════════════════════════════');
      console.log('');
      
      setImmediate(() => {
        const order2 = [];
        setTimeout(() => order2.push('setTimeout(0)'), 0);
        setImmediate(() => order2.push('nested setImmediate'));
        
        setTimeout(() => {
          order2.forEach((item, i) => console.log('  ' + (i+1) + '.', item));
          console.log('');
          printSummary();
        }, 100);
      });
    }, 100);
  });
}, 100);

function printSummary() {
  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. 主模块中：顺序不确定（取决于性能和负载)');
  console.log('  2. IO回调中：setImmediate 永远先执行（poll→check直接相连)');
  console.log('  3. setTimeout 最小延迟 1ms，不是精确的');
  console.log('  4. setImmediate 递归不会饿死 IO，nextTick 会');
  console.log('  5. 需要"尽快异步"且递归：用 setImmediate');
  console.log('  6. 需要真正延迟：用 setTimeout');
  console.log('');
}
`
  },

  // ============================================================
  // 第四章：Promise 进阶
  // ============================================================
  {
    id: "n2-promise-adv",
    group: "第一部分 异步编程深度解析",
    icon: "🔗",
    title: "第四章：Promise 进阶与异步流程控制",
    content: `# Promise 进阶与异步流程控制

Promise 已经是现代 JavaScript 异步编程的基础，但很多开发者对它的理解还停留在"new Promise 然后 then"的层面。这一章我们深入 Promise 的高级用法、常见陷阱和异步流程控制。

---

## Promise 状态不可逆性

Promise 有三种状态：pending（等待中）、fulfilled（已成功）、rejected（已失败）。**状态一旦从 pending 变成 fulfilled 或 rejected，就永远不会再改变了！**

这是一个非常重要的特性，也是 Promise 可靠性的来源：

\`\`\`js
const p = new Promise((resolve, reject) => {
  resolve('ok');
  reject(new Error('fail')); // 无效！状态已经是 fulfilled 了
  setTimeout(() => resolve('late'), 100); // 也无效！
});
p.then(console.log); // 输出 'ok'，不会输出 'fail' 或 'late'
\`\`\`

这和回调不一样：你可以在回调里被调用多次成功、多次失败，但 Promise 保证只结算一次。

---

## Promise 链式调用

Promise 的 then/catch/finally 都返回一个**新的 Promise**，所以可以链式调用：

\`\`\`js
fetchUser(id)
  .then(user => fetchOrders(user.id))
  .then(orders => filterValidOrders(orders))
  .then(validOrders => console.log(validOrders))
  .catch(err => console.error(err));
\`\`\`

这里有两个关键点：
1. **return 值穿透**：如果 then 回调里 return 一个普通值，这个值会作为下一个 then 的参数；如果 return 一个 Promise，下一个 then 会等待这个 Promise 结算。
2. **错误穿透**：链式调用中任何一个环节抛出错误（或者返回 rejected Promise），会直接跳到最近的 catch，中间的 then 都会被跳过。

### 错误穿透现象

\`\`\`js
Promise.resolve()
  .then(() => { console.log(1); })
  .then(() => { console.log(2); throw new Error('出错了'); })
  .then(() => { console.log(3); }) // 跳过！
  .then(() => { console.log(4); }) // 跳过！
  .catch(err => console.log('捕获到:', err.message)) // 在这里捕获
  .then(() => { console.log('catch 之后可以继续 then'); }); // 还能继续！
\`\`\`

输出顺序是：1 → 2 → "捕获到: 出错了" → "catch 之后可以继续 then"。3 和 4 被跳过了。

注意：**catch 本身也返回一个新的 Promise**，catch 之后的 then 还是会执行的！catch 不是"终点"，它只是捕获前面链上的错误。

---

## Promise 静态方法

Promise 有几个非常实用的静态方法，用于处理多个并发 Promise：

### Promise.all(iterable)

- 等待**所有** Promise 都成功，返回结果数组（顺序和传入顺序一致）
- **只要有一个失败，立刻失败**（短路行为），返回第一个失败的原因
- 传入空数组，直接返回已 resolve 的空数组
- 适合：多个异步任务都需要成功才能继续的场景（如并行加载多个资源）

\`\`\`js
Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]).then(([user, posts, comments]) => {
  // 三个都成功了才会到这里
}).catch(err => {
  // 任何一个失败就到这里
});
\`\`\`

### Promise.race(iterable)

- 返回第一个**结算**的 Promise 的结果（无论是成功还是失败）
- 只要有一个 Promise  settle（resolve 或 reject），race 就 settle
- 传入空数组，返回的 Promise 永远 pending（注意！会导致内存泄漏）
- 适合：超时控制、多个源取最快的一个

\`\`\`js
// 超时控制：给 fetch 加 5 秒超时
Promise.race([
  fetch(url),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), 5000)
  )
]).then(data => console.log(data)).catch(err => console.error(err));
\`\`\`

### Promise.allSettled(iterable)

- 等待**所有** Promise 都结算（无论成功还是失败）
- 返回一个数组，每个元素是 \`{status: 'fulfilled', value: ...}\` 或 \`{status: 'rejected', reason: ...}\`
- **永远不会失败**（只要传入的是可迭代对象）
- 适合：需要知道所有结果，不管成功失败的场景（如批量操作、收集多个接口结果）

### Promise.any(iterable)（ES2021）

- 返回**第一个成功**的 Promise
- 如果所有都失败，返回 AggregateError 包含所有错误
- 和 all 相反，和 race 区别是：race 会接受第一个 reject，any 忽略 reject 等第一个 resolve
- 适合：多源取数据，只要一个成功就行（如多个镜像源下载）

---

## 手写 Promise 的关键思路

理解 Promise 源码能帮你更深入理解它的行为。简单说，一个 Promise 内部需要：
1. 状态管理（pending → fulfilled/rejected，不可逆）
2. then 方法返回新 Promise，支持链式调用
3. 收集 then 中注册的回调，在 resolve/reject 时按顺序执行
4. 处理回调返回值的类型（普通值还是 Promise）
5. 异步执行回调（微任务）

不过实际工作中不需要自己手写完整 Promise，但理解这些思路很重要。

---

## Promise 常见陷阱

1. **忘记 return Promise**：then 回调里如果要链式调用，必须 return 下一个 Promise，否则后续 then 不会等待。
2. **嵌套 Promise**：不要在 then 里嵌套 then，直接 return 然后链式调用。
3. **Promise.all 的短路行为**：你需要"等待所有完成无论成败"，用 allSettled 而不是 all。
4. **空数组传入 race/any**：race([]) 和 any([]) 的行为不同，但都要注意。
5. **catch 位置**：catch 放在链的不同位置，捕获的错误范围不同。
`,
    code: `// ============================================
// Promise 静态方法与流程控制演示
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  🔗 Promise 进阶与异步流程控制');
console.log('═══════════════════════════════════════════');
console.log('');

// 辅助函数：创建一个延迟指定时间后成功/失败的 Promise
function delaySuccess(value, ms) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}
function delayFail(reason, ms) {
  return new Promise((_, reject) => setTimeout(() => reject(reason), ms));
}

// ============ 实验 1：Promise.all ============
console.log('【实验 1】Promise.all - 等待所有成功');
console.log('');

const start1 = Date.now();
Promise.all([
  delaySuccess('用户数据', 200),
  delaySuccess('文章列表', 300),
  delaySuccess('评论数据', 100)
]).then(results => {
  console.log('  ✅ all 成功，耗时:', Date.now() - start1 + 'ms');
  console.log('     结果顺序和传入顺序一致:', results);
  console.log('');
  
  // 有一个失败的情况
  return Promise.all([
    delaySuccess('成功1', 100),
    delayFail(new Error('第二个失败了'), 200),
    delaySuccess('成功3', 100)
  ]);
}).then(() => {
  console.log('  不会走到这里');
}).catch(err => {
  console.log('  ❌ all 有一个失败就立刻失败:', err.message);
  console.log('     💡 这是短路行为！其他任务还在进行但结果被忽略');
  console.log('');
  
  // ============ 实验 2：Promise.allSettled ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 2】Promise.allSettled - 等待所有完成');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  return Promise.allSettled([
    delaySuccess('成功A', 100),
    delayFail(new Error('失败B'), 200),
    delaySuccess('成功C', 150)
  ]);
}).then(results => {
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log('  ✅ 任务' + i + ' 成功:', r.value);
    } else {
      console.log('  ❌ 任务' + i + ' 失败:', r.reason.message);
    }
  });
  console.log('');
  console.log('  💡 allSettled 永远不会 reject，适合需要所有结果的场景');
  console.log('');
  
  // ============ 实验 3：Promise.race ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 3】Promise.race - 谁先结算用谁');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  return Promise.race([
    delaySuccess('快的（200ms）', 200),
    delaySuccess('慢的（500ms）', 500),
    delayFail('先失败的（100ms）', 100)
  ]);
}).then(result => {
  console.log('  race 结果（第一个结算）:', result);
}).catch(err => {
  console.log('  ❌ race 先失败了:', err);
  console.log('     💡 race 不管成功失败，第一个 settle 就用谁');
  console.log('     这里100ms就失败了，所以直接 catch');
  console.log('');
  
  // ============ 实验 4：Promise.any ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 4】Promise.any - 取第一个成功');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  return Promise.any([
    delayFail('失败1（100ms）', 100),
    delaySuccess('第一个成功（300ms）', 300),
    delaySuccess('第二个成功（400ms）', 400)
  ]);
}).then(result => {
  console.log('  any 结果（第一个成功）:', result);
  console.log('');
  
  // ============ 实验 5：错误穿透 ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 5】错误穿透');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  return Promise.resolve()
    .then(() => { console.log('  then 1'); return 1; })
    .then(() => { console.log('  then 2'); throw new Error('中间出错'); })
    .then(() => { console.log('  then 3（被跳过）'); return 3; })
    .then(() => { console.log('  then 4（被跳过）'); return 4; })
    .catch(err => {
      console.log('  catch 捕获到:', err.message);
      return '从错误中恢复';
    })
    .then(val => console.log('  catch 后的 then:', val));
}).then(() => {
  console.log('');
  printSummary();
});

function printSummary() {
  setTimeout(() => {
    console.log('═══════════════════════════════════════════');
    console.log('  总结');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('  1. Promise 状态不可逆：一旦 resolve/reject 就定型');
    console.log('  2. 链式调用：then/catch/finally 都返回新 Promise');
    console.log('  3. 错误穿透：错误会跳过中间 then 直到 catch');
    console.log('  4. Promise.all：全部成功才成功，一个失败就短路');
    console.log('  5. Promise.race：谁先结算用谁（成功或失败）');
    console.log('  6. Promise.allSettled：等所有完成，永远不失败');
    console.log('  7. Promise.any：取第一个成功的');
    console.log('');
  }, 100);
}
`
  },

  // ============================================================
  // 第五章：async/await 原理与陷阱
  // ============================================================
  {
    id: "n2-async-await",
    group: "第一部分 异步编程深度解析",
    icon: "🎯",
    title: "第五章：async/await 原理与陷阱",
    content: `# async/await 原理与陷阱

async/await 是 ES2017 引入的语法，它让异步代码写起来像同步代码，极大提升了异步代码的可读性。但方便的背后也隐藏着不少陷阱，这一章我们深入理解 async/await 的原理和常见坑。

---

## async/await 是什么？

很多人不知道，async/await 本质上是 **Generator + Promise** 的语法糖。它底层是把 async 函数转换成一个 Generator，然后自动执行 Generator，遇到 yield（也就是 await）就等待 Promise 完成。

简单说：
- \`async\` 关键字：把一个函数标记为异步函数，它的返回值永远是 Promise
- \`await\` 关键字：暂停 async 函数的执行，等待后面的 Promise 结算，然后恢复执行

### async 函数的返回值

无论 async 函数 return 什么，返回值都是 Promise：

\`\`\`js
async function f1() { return 42; }
f1().then(console.log); // 42（Promise包裹）

async function f2() { throw new Error('oops'); }
f2().catch(console.error); // 错误被 Promise reject
\`\`\`

### await 后面不是 Promise 会怎样？

如果 await 后面不是 Promise，JavaScript 会把它转成一个已经 resolve 的 Promise：

\`\`\`js
async function test() {
  const a = await 42; // 相当于 await Promise.resolve(42)
  console.log(a); // 42
  const b = await 'hello';
  console.log(b); // 'hello'
}
\`\`\`

注意：即使 await 后面是普通值，它也会"异步"一下（经过微任务队列），不会同步执行：

\`\`\`js
console.log(1);
(async () => {
  console.log(2);
  await null; // 即使是 null
  console.log(4); // 这行会在微任务中执行
})();
console.log(3);
// 输出：1, 2, 3, 4
\`\`\`

是的，即使 await 后面是普通值甚至是 null/undefined，await 之后的代码还是会放到微任务里异步执行。这是一个容易被忽略的点。

---

## 串行 vs 并行：性能差异巨大

这是 async/await 最常见的性能陷阱！看这段代码：

\`\`\`js
async function getSequential() {
  const a = await fetchA(); // 等1秒
  const b = await fetchB(); // 等1秒
  const c = await fetchC(); // 等1秒
  return [a, b, c]; // 总共 3 秒！
}
\`\`\`

这里三个请求是**串行**的：等 A 完成才开始 B，等 B 完成才开始 C。如果三个请求互相独立，完全可以并行，总共只需要 1 秒！

正确的写法是用 Promise.all：

\`\`\`js
async function getParallel() {
  const promiseA = fetchA(); // 立刻开始，不等待
  const promiseB = fetchB(); // 立刻开始
  const promiseC = fetchC(); // 立刻开始
  const [a, b, c] = await Promise.all([promiseA, promiseB, promiseC]);
  return [a, b, c]; // 总共 1 秒！
}
\`\`\`

关键区别：
- **错误写法**：先 await 再开始下一个 → 串行
- **正确写法**：先发起所有 Promise，再统一 await → 并行

或者你也可以直接：
\`\`\`js
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
\`\`\`

记住：**await 会"暂停"函数执行**。如果你有多个独立的异步任务，不要一个个 await，先全部启动再一起等。

---

## 循环中的 await 陷阱

在循环中使用 await 也很容易踩坑。

### forEach/map/filter 中 await 不工作！

很多人写过这种代码：

\`\`\`js
async function processItems(items) {
  items.forEach(async (item) => {
    await processItem(item); // forEach 不等待这个 async 回调！
  });
  console.log('所有项处理完了？不，这里会立即执行！');
}
\`\`\`

**forEach 根本不知道回调是 async 函数，它不会等待异步操作完成！** map 也一样，它会返回一个 Promise 数组，但你不 await Promise.all 的话还是不会等。

### 正确的循环写法

**需要串行执行**（一个完成再做下一个）：用 for...of

\`\`\`js
async function processSerial(items) {
  for (const item of items) {
    await processItem(item); // 一个接一个
  }
}
\`\`\`

**需要并行执行**：用 map + Promise.all

\`\`\`js
async function processParallel(items) {
  const promises = items.map(item => processItem(item));
  const results = await Promise.all(promises); // 全部并行
  return results;
}
\`\`\`

### for...in 也可以但不推荐数组用 for...in

---

## 顶层 await（Top-level await）

ES2022 支持在 ES 模块的顶层使用 await，不需要包在 async 函数里：

\`\`\`js
// 在 ES 模块（.mjs 或 package.json type: module）中
const data = await fetch('./data.json');
console.log(data);
\`\`\`

顶层 await 会让模块变成"异步模块"，导入它的模块会等待它执行完才开始执行。CommonJS 中不支持顶层 await。

---

## async/await 的错误处理

async 函数中抛出错误会导致返回的 Promise rejected，所以：
- 在 async 函数内部，用 try/catch 捕获错误
- 在外部调用 async 函数，用 .catch() 或者 await 包在 try/catch 里

这是下一章我们会详细讲的内容。

---

## async/await 最佳实践

1. **不要无脑 await**：先想清楚任务之间有没有依赖关系，独立任务并行执行
2. **不要在 forEach 里用 await**：用 for...of（串行）或 map+Promise.all（并行）
3. **合理使用 try/catch**：区分哪些错误需要本地处理，哪些可以向上抛
4. **记住 await 普通值也会异步**：不要想当然认为 await 普通值是同步的
5. **async 函数总是返回 Promise**：不要把 async 函数当同步函数用
`,
    code: `// ============================================
// async/await 串行 vs 并行演示
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  🎯 async/await 原理与陷阱');
console.log('═══════════════════════════════════════════');
console.log('');

// 模拟异步任务：延迟 ms 毫秒后返回
function fetchData(name, ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(\`\${name} 数据\`);
    }, ms);
  });
}

// ============ 实验 1：串行 vs 并行 ============
console.log('【实验 1】串行 vs 并行 性能对比');
console.log('');

async function serialFetch() {
  const start = Date.now();
  console.log('  串行执行开始...');
  const a = await fetchData('用户', 200);
  const b = await fetchData('文章', 200);
  const c = await fetchData('评论', 200);
  const elapsed = Date.now() - start;
  console.log('  串行结果:', a, b, c);
  console.log('  串行耗时:', elapsed + 'ms（预期 ~600ms）');
  return elapsed;
}

async function parallelFetch() {
  const start = Date.now();
  console.log('  并行执行开始...');
  const pA = fetchData('用户', 200);
  const pB = fetchData('文章', 200);
  const pC = fetchData('评论', 200);
  const [a, b, c] = await Promise.all([pA, pB, pC]);
  const elapsed = Date.now() - start;
  console.log('  并行结果:', a, b, c);
  console.log('  并行耗时:', elapsed + 'ms（预期 ~200ms）');
  return elapsed;
}

async function runExperiment1() {
  const serialTime = await serialFetch();
  console.log('');
  const parallelTime = await parallelFetch();
  console.log('');
  console.log('  💡 并行比串行快了', (serialTime - parallelTime) + 'ms！');
  console.log('     独立任务一定要并行，用 Promise.all');
  console.log('');
  
  // ============ 实验 2：forEach 的陷阱 ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 2】forEach 中的 await 陷阱');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  const items = ['A', 'B', 'C'];
  const processItem = (item) => new Promise(resolve => {
    setTimeout(() => {
      console.log('     处理完', item);
      resolve(item);
    }, 100);
  });
  
  console.log('  错误写法（forEach）:');
  const start2 = Date.now();
  items.forEach(async (item) => {
    await processItem(item);
  });
  console.log('  forEach 之后立即打印（不会等待！），耗时:', Date.now() - start2 + 'ms');
  
  // 等一下让它们都完成
  await new Promise(r => setTimeout(r, 400));
  console.log('');
  
  console.log('  正确串行写法（for...of）:');
  const start3 = Date.now();
  for (const item of items) {
    await processItem(item);
  }
  console.log('  for...of 之后打印，耗时:', Date.now() - start3 + 'ms（串行 ~300ms）');
  console.log('');
  
  console.log('  正确并行写法（map + Promise.all）:');
  const start4 = Date.now();
  const promises = items.map(item => processItem(item));
  await Promise.all(promises);
  console.log('  Promise.all 之后打印，耗时:', Date.now() - start4 + 'ms（并行 ~100ms）');
  console.log('');
  
  // ============ 实验 3：await 普通值 ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 3】await 普通值也会异步');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  console.log('  1');
  (async () => {
    console.log('  2');
    await null; // 即使是 null
    console.log('  4（这行在微任务中）');
  })();
  console.log('  3');
  
  await new Promise(r => setTimeout(r, 50));
  console.log('');
  console.log('  💡 即使 await null，await 之后的代码也是异步执行的');
  console.log('');
  
  printSummary();
}

function printSummary() {
  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. async/await 是 Generator+Promise 语法糖');
  console.log('  2. async 函数永远返回 Promise');
  console.log('  3. 独立异步任务：先启动所有 Promise，再 await Promise.all');
  console.log('  4. forEach/map 不等待 async 回调！');
  console.log('  5. 串行用 for...of，并行用 map+Promise.all');
  console.log('  6. await 普通值也会经过微任务异步');
  console.log('  7. 不要无脑 await，注意并行优化');
  console.log('');
}

runExperiment1();
`
  },

  // ============================================================
  // 第六章：异步错误处理
  // ============================================================
  {
    id: "n2-async-error",
    group: "第一部分 异步编程深度解析",
    icon: "🛡️",
    title: "第六章：异步错误处理最佳实践",
    content: `# 异步错误处理最佳实践

异步代码的错误处理比同步代码困难得多——try/catch 抓不到异步回调里的错误，Promise 错误不处理会导致警告，EventEmitter 的 error 事件不监听会直接崩溃。这一章我们系统梳理 Node.js 中的异步错误处理模式。

---

## 错误处理的演进

Node.js 的异步错误处理经历了几个阶段：
1. **回调时代**：error-first 回调约定
2. **Promise 时代**：.catch() 错误冒泡
3. **async/await 时代**：try/catch 同步风格
4. **全局兜底**：uncaughtException / unhandledRejection

我们一个个来看。

---

## 回调时代：error-first 约定

在 Node.js 早期，所有异步 API 都遵循 **error-first callback** 约定：
- 回调函数的第一个参数永远是 error（成功时为 null/undefined）
- 第二个及之后的参数才是成功结果

\`\`\`js
const fs = require('fs');
fs.readFile('some-file.txt', 'utf-8', (err, data) => {
  if (err) {
    // 必须处理 error！
    console.error('读文件失败:', err.message);
    return;
  }
  // 成功，data 是文件内容
  console.log(data);
});
\`\`\`

**规则**：
1. 回调的第一个参数永远是 error，必须先检查
2. 处理完 error 后 return，不要继续执行后续逻辑
3. 如果你把回调传给另一个函数，也要遵循 error-first 约定

error-first 的问题：
- 容易忘记检查 err（不检查的话错误被静默吃掉！）
- 回调嵌套导致错误处理重复且分散
- 无法用 try/catch 捕获

---

## Promise 时代：catch 错误冒泡

Promise 的错误处理比回调好得多：错误会沿着 Promise 链**向下冒泡**，直到遇到一个 catch。

\`\`\`js
fetchUser()
  .then(user => fetchOrders(user.id))
  .then(orders => processOrders(orders))
  .catch(err => {
    // 上面任何一个环节出错都能在这里捕获！
    console.error('出错了:', err);
  });
\`\`\`

这比 error-first 好太多：
- 错误自动冒泡，不需要每层都检查
- 一个 catch 可以捕获前面所有 then 的错误
- 可以用链式 catch 分层处理

但 Promise 有一个大问题：**如果你忘记加 catch，错误会怎么样？**

在早期 Node.js 版本中，未处理的 Promise rejection 会被静默忽略——这非常危险！你的代码出错了但你完全不知道。

现代 Node.js 中：
- 未处理的 Promise rejection 会触发 \`unhandledRejection\` 事件
- 未来 Node.js 版本可能会直接让进程退出（和 uncaughtException 一样）

---

## async/await 时代：try/catch 同步风格

async/await 让我们可以用传统的 try/catch 来处理异步错误，就像同步代码一样：

\`\`\`js
async function main() {
  try {
    const user = await fetchUser();
    const orders = await fetchOrders(user.id);
    return orders;
  } catch (err) {
    console.error('出错了:', err.message);
    // 可以恢复：返回默认值
    return [];
  }
}
\`\`\`

这看起来很美好，但要注意几个点：

1. **await 只在 async 函数内工作**，而且 try/catch 只能捕获到 await 的 Promise 的错误
2. **try 块里的多个 await，第一个出错就跳到 catch**，后续 await 不会执行
3. **不要用 try/catch 包裹所有东西**：有些错误应该向上层抛，不要什么错误都吞掉

### try/catch 的位置

把 try/catch 放在哪很重要：
- **放在最外层**：一个 try/catch 捕获所有，无法区分不同错误
- **每个 await 都包**：太啰嗦，代码丑陋
- **分层处理**：能本地处理的本地处理（如提供默认值），不能处理的向上抛

最佳实践：**在你能处理错误的地方加 catch**，不能处理的让它抛到上层。

---

## 必须监听的全局错误事件

无论你用什么方式处理错误，都必须监听两个全局事件，作为最后的安全网：

### 1. uncaughtException

当一个未捕获的 JavaScript 异常一直冒泡到事件循环顶部，就会触发这个事件。如果不监听，进程会直接崩溃退出。

\`\`\`js
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 记录日志后，应该优雅退出
  // 因为此时进程状态可能已经不稳定了
  process.exit(1);
});
\`\`\`

⚠️ **注意**：uncaughtException 之后不要继续运行程序！异常可能导致内存泄漏、资源未释放等问题。正确做法是：记录错误日志 → 清理资源 → 退出进程（让进程管理器如 PM2 重启）。

### 2. unhandledRejection

当一个 Promise rejected 但没有 .catch() 处理，也没有 try/catch 包裹 await 时，会触发这个事件。

\`\`\`js
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise rejection:', reason);
  // 建议：记录日志，或者直接抛出让进程退出（推荐）
  // throw reason;
});
\`\`\`

> **为什么推荐在 unhandledRejection 里退出进程？** 因为未处理的 rejection 意味着你的代码有 bug，而且你不知道程序处于什么状态。Node.js 未来版本会让 unhandledRejection 和 uncaughtException 一样直接崩溃进程，所以现在就开始严格处理吧。

---

## EventEmitter 的 error 事件

所有 EventEmitter 实例（包括 stream、http server 等）都有一个特殊规则：**如果 emit('error') 时没有注册 error 监听器，Node.js 会直接抛出错误，进程崩溃！**

\`\`\`js
const { EventEmitter } = require('events');
const ee = new EventEmitter();
ee.emit('error', new Error('崩溃！')); // 没有监听器，直接退出！

// 正确做法：永远监听 error
ee.on('error', (err) => console.error('错误:', err));
ee.emit('error', new Error('不会崩溃'));
\`\`\`

这是一个强制的设计——错误不能被静默忽略。记住：**只要你用 EventEmitter，必须监听 error 事件！**

---

## 错误处理最佳实践

1. **永远不要忽略错误**：
   - error-first 回调必须检查 err
   - Promise 链必须有 .catch()
   - async/await 要么 try/catch，要么让调用方处理
   - EventEmitter 必须监听 error

2. **分层处理**：
   - 底层：把错误包装成更有意义的错误（带上下文）
   - 中层：可以重试、降级、提供默认值
   - 顶层：记录日志、返回用户友好的错误信息

3. **区分错误类型**：
   - 操作错误（如网络超时、文件不存在）：可以预期，应该处理
   - 编程错误（如访问 undefined 属性）：是 bug，应该修复，不要试图在运行时捕获

4. **全局兜底**：
   - 必须监听 uncaughtException 和 unhandledRejection
   - uncaughtException 后优雅退出，不要继续运行

5. **不要吞错误**：空 catch 块是反模式，至少要打日志。
`,
    code: `// ============================================
// 异步错误处理演示
// ============================================

const { EventEmitter } = require('events');

console.log('═══════════════════════════════════════════');
console.log('  🛡️ 异步错误处理最佳实践');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 全局错误监听（安全网）============
process.on('unhandledRejection', (reason) => {
  console.log('⚠️  [unhandledRejection] 未处理的 Promise 错误:', reason.message);
});

// ============ 实验 1：Promise 错误冒泡 ============
console.log('【实验 1】Promise 错误冒泡');
console.log('');

Promise.resolve()
  .then(() => {
    console.log('  step 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('  step 2');
    throw new Error('step 2 出错了');
  })
  .then(() => {
    console.log('  step 3（不会执行）');
  })
  .catch(err => {
    console.log('  ✅ catch 捕获到:', err.message);
    console.log('     错误穿透了前面的 then，被这里捕获');
  })
  .then(() => {
    console.log('  catch 之后可以继续链式调用');
  });

setTimeout(() => {
  console.log('');
  
  // ============ 实验 2：async/await try/catch ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 2】async/await try/catch');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  async function mightFail(succeed) {
    if (succeed) {
      return '成功数据';
    }
    throw new Error('操作失败');
  }
  
  async function testAsync() {
    // 成功情况
    try {
      const data = await mightFail(true);
      console.log('  ✅ 成功:', data);
    } catch (err) {
      console.log('  不会走到这里');
    }
    
    // 失败情况
    try {
      const data = await mightFail(false);
      console.log('  不会走到这里');
    } catch (err) {
      console.log('  ✅ try/catch 捕获到:', err.message);
      console.log('     可以在这里提供默认值或恢复');
      const fallback = '默认数据';
      console.log('     使用默认值:', fallback);
    }
  }
  
  testAsync().then(() => {
    console.log('');
    
    // ============ 实验 3：EventEmitter error 事件 ============
    console.log('═══════════════════════════════════════════');
    console.log('【实验 3】EventEmitter error 事件必须监听');
    console.log('═══════════════════════════════════════════');
    console.log('');
    
    const ee = new EventEmitter();
    
    // 必须监听 error！
    ee.on('error', (err) => {
      console.log('  ✅ 监听到 error 事件:', err.message);
      console.log('     如果不监听，进程会直接崩溃！');
    });
    
    ee.emit('error', new Error('测试错误'));
    console.log('');
    console.log('  💡 所有 EventEmitter（Stream、HTTP Server 等）都有这个规则');
    
    setTimeout(printSummary, 300);
  });
}, 300);

function printSummary() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. error-first 回调：第一个参数是 err，必须检查');
  console.log('  2. Promise：错误冒泡，必须有 catch');
  console.log('  3. async/await 用 try/catch，分层处理错误');
  console.log('  4. 必须监听 uncaughtException 和 unhandledRejection');
  console.log('  5. EventEmitter 必须监听 error 事件');
  console.log('  6. uncaughtException 后要优雅退出，不要继续运行');
  console.log('  7. Promise.all 短路，需要所有结果用 allSettled');
  console.log('');
}
`
  },

  // ============================================================
  // 第七章：EventEmitter
  // ============================================================
  {
    id: "n2-event-emitter",
    group: "第一部分 异步编程深度解析",
    icon: "📡",
    title: "第七章：EventEmitter 事件机制深度解析",
    content: `# EventEmitter 事件机制深度解析

事件驱动是 Node.js 的核心设计哲学之一，而 EventEmitter 是事件驱动的基础。Node.js 中几乎所有核心模块都继承自 EventEmitter：http.Server、fs.ReadStream、process、net.Socket……理解 EventEmitter，就是理解 Node.js 事件架构的基石。

这一章我们深入 EventEmitter 的实现原理和使用要点。

---

## 发布订阅模式

EventEmitter 本质上是**发布订阅模式**的实现。它有三个核心概念：
- **on（订阅）**：注册监听器，当某个事件发生时执行回调
- **emit（发布）**：触发事件，按顺序同步执行该事件的所有监听器
- **off（取消订阅）**：移除已注册的监听器

### 基本用法

\`\`\`js
const { EventEmitter } = require('events');
const ee = new EventEmitter();

ee.on('data', (data) => {
  console.log('收到数据:', data);
});

ee.emit('data', 'hello'); // 同步触发所有监听器
\`\`\`

注意：**emit 是同步执行的**！它会按照监听器注册的顺序，同步地依次调用每个监听器。这一点很重要——如果你在监听器里做 CPU 密集操作，会阻塞后续监听器。

---

## 核心 API 详解

### on/addListener：注册监听器

\`on(eventName, listener)\` 和 \`addListener\` 是同一个方法，用于注册事件监听器。可以为同一个事件注册多个监听器，emit 时按注册顺序同步执行。

### once：只执行一次

\`once(eventName, listener)\` 注册的监听器只会被执行一次，执行后自动移除。常用于"只需要响应一次"的场景，比如连接成功、初始化完成。

### prependListener：插入到监听器数组开头

默认 on 把监听器添加到数组末尾，prependListener 添加到开头。

### off/removeListener：移除监听器

\`off(eventName, listener)\` 移除指定的监听器。注意：你必须传入**和 on 时完全相同的函数引用**，匿名函数无法移除！

\`\`\`js
const handler = (data) => console.log(data);
ee.on('data', handler);
ee.off('data', handler); // 正确
ee.on('data', (data) => console.log(data));
ee.off('data', (data) => console.log(data)); // 错误！新的匿名函数不是同一个引用
\`\`\`

### removeAllListeners：移除所有监听器

可以移除某个事件的所有监听器，或者移除所有事件的所有监听器（不传参数）。

### emit：触发事件

\`emit(eventName, ...args)\` 同步触发事件，按顺序执行所有监听器。返回 true 如果有监听器，false 如果没有。

---

## error 事件的特殊处理

这是 EventEmitter 最重要的规则！**如果 EventEmitter 触发了 'error' 事件，但没有注册任何 error 监听器，Node.js 会直接抛出错误，导致进程崩溃！**

\`\`\`js
const ee = new EventEmitter();
ee.emit('error', new Error('崩溃了！')); // 没有监听 error，进程直接退出！
\`\`\`

这是一个有意的设计——错误不应该被静默忽略。最佳实践是：**所有 EventEmitter 实例都必须监听 error 事件**。

---

## 事件名可以是 Symbol

除了字符串，事件名也可以是 Symbol，这对于"内部事件"很有用：

\`\`\`js
const START = Symbol('start');
ee.on(START, () => console.log('start'));
ee.emit(START);
\`\`\`

---

## 最大监听器数量警告

默认情况下，如果一个事件注册了超过 10 个监听器，Node.js 会打印警告：\`MaxListenersExceededWarning\`。这通常意味着内存泄漏（比如重复注册监听器但没有移除）。

可以用 \`setMaxListeners(n)\` 调整限制，0 表示无限。

---

## EventEmitter 在 Node.js 核心中的应用

- process：on('exit'), on('uncaughtException')
- streams：on('data'), on('end'), on('error')
- http.Server：on('request'), on('connection')
- fs.ReadStream/WriteStream：继承自 stream，有各种事件
- net.Socket：on('connect'), on('data'), on('close')

几乎所有能发射事件的对象都是 EventEmitter 的实例。
`,
    code: `// ============================================
// EventEmitter 事件机制演示
// ============================================

const { EventEmitter } = require('events');

console.log('═══════════════════════════════════════════');
console.log('  📡 EventEmitter 事件机制深度解析');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 实验 1：基本 on/emit ============
console.log('【实验 1】基本 on/emit（同步执行）');
console.log('');

const ee1 = new EventEmitter();

ee1.on('event', (arg) => {
  console.log('  监听器1:', arg);
});
ee1.on('event', (arg) => {
  console.log('  监听器2:', arg);
});
console.log('  触发 event 事件前');
ee1.emit('event', 'hello');
console.log('  触发 event 事件后');
console.log('  💡 emit 是同步执行的！监听器按注册顺序执行');
console.log('');

// ============ 实验 2：once ============
console.log('═══════════════════════════════════════════');
console.log('【实验 2】once：只执行一次');
console.log('═══════════════════════════════════════════');
console.log('');

const ee2 = new EventEmitter();
let count = 0;
ee2.once('tick', () => {
  count++;
  console.log('  tick 触发，count=' + count);
});

ee2.emit('tick');
ee2.emit('tick');
ee2.emit('tick');
console.log('  一共触发了3次emit，但once只执行了' + count + '次');
console.log('');

// ============ 实验 3：移除监听器 ============
setTimeout(() => {
  console.log('═══════════════════════════════════════════');
  console.log('【实验 3】移除监听器');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  const ee3 = new EventEmitter();
  
  const handler1 = () => console.log('  handler1 执行');
  const handler2 = () => console.log('  handler2 执行');
  
  ee3.on('test', handler1);
  ee3.on('test', handler2);
  console.log('  注册了2个监听器，触发一次:');
  ee3.emit('test');
  
  console.log('  移除 handler1 后再触发:');
  ee3.off('test', handler1);
  ee3.emit('test');
  
  console.log('');
  console.log('  💡 移除监听器必须传入同一个函数引用！');
  console.log('');
  
  // ============ 实验 4：error 事件 ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 4】error 事件必须监听');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  const ee4 = new EventEmitter();
  ee4.on('error', (err) => {
    console.log('  ✅ 监听到 error 事件:', err.message);
    console.log('  如果没有这个监听器，进程会崩溃！');
  });
  ee4.emit('error', new Error('测试错误'));
  console.log('');
  
  // ============ 实验 5：同步触发顺序 ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 5】监听器同步执行顺序');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  const ee5 = new EventEmitter();
  const order = [];
  
  ee5.on('order', () => order.push('A'));
  ee5.prependListener('order', () => order.push('B'));
  ee5.on('order', () => order.push('C'));
  
  ee5.emit('order');
  console.log('  执行顺序:', order.join(' → '));
  console.log('  💡 prependListener 把 B 插到了最前面');
  console.log('');
  
  // ============ 实验 6：自定义 EventEmitter ============
  console.log('═══════════════════════════════════════════');
  console.log('【实验 6】自定义 EventEmitter 类');
  console.log('═══════════════════════════════════════════');
  console.log('');
  
  class Timer extends EventEmitter {
    constructor(interval) {
      super();
      this.interval = interval;
      this.tickCount = 0;
    }
    start() {
      this.emit('start');
      const tick = () => {
        this.tickCount++;
        this.emit('tick', this.tickCount);
        if (this.tickCount < 3) {
          setTimeout(tick, this.interval);
        } else {
          this.emit('end', this.tickCount);
        }
      };
      setTimeout(tick, this.interval);
    }
  }
  
  const timer = new Timer(100);
  timer.on('start', () => console.log('  ⏰ 计时器启动'));
  timer.on('tick', (n) => console.log('  ⏰ tick #' + n));
  timer.on('end', (total) => {
    console.log('  ⏰ 结束，共tick' + total + '次');
    console.log('');
    printSummary();
  });
  timer.on('error', (err) => console.log('  错误:', err.message));
  
  console.log('  启动计时器...');
  timer.start();
}, 300);

function printSummary() {
  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. EventEmitter 是发布订阅模式的实现');
  console.log('  2. emit 同步触发监听器，按注册顺序执行');
  console.log('  3. once 注册的监听器只执行一次');
  console.log('  4. 移除监听器必须传入相同的函数引用');
  console.log('  5. error 事件必须监听，否则进程崩溃！');
  console.log('  6. 默认超过10个监听器会有内存泄漏警告');
  console.log('  7. 事件名可以是字符串或 Symbol');
  console.log('  8. Node.js 核心模块大量使用 EventEmitter');
  console.log('');
}
`
  }
];
