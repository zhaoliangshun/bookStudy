// =============================================================
// TypeScript 交互式教程 —— 第六批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-async          — 异步编程 (Promise / async-await)
//   2. ts-iterators      — 迭代器与生成器
//   3. ts-this-deep      — this 类型深入
//   4. ts-functions-adv  — 函数进阶 (函数式编程)
//   5. ts-classes-adv    — 类进阶 (设计模式)
//   6. ts-error-handling — 错误处理
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器, isolatedModules)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
//   - 沙箱上下文自带 Math/JSON/Date/Map/Set/Array/Object 等内置对象
//   - 异步演示需在 5 秒超时内完成，所有 setTimeout 都用极短延时
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：异步编程 (Async Programming)
  // =========================================================
  {
    id: "ts-async",
    title: "异步编程",
    icon: "⚡",
    group: "核心补充",
    content: `## 异步编程 (Async Programming)

异步编程是现代 JavaScript/TypeScript 的核心能力。无论是网络请求、文件读写、定时器还是数据库查询，真实世界充满了"需要等待"的操作。如果用同步方式处理，整个程序会被阻塞；异步编程让程序在等待期间能继续做其他事，极大提升吞吐量与响应性。

本章将从 Promise 的本质讲起，系统覆盖 Promise 创建、链式调用、错误处理、组合方法（all/race/allSettled/any）、async/await 语法、并发与串行、异步迭代器、AbortController 取消，以及在 TypeScript 中对 Promise 的精确类型标注。

### 为什么需要异步

JavaScript 是**单线程**的（Web Worker 除外），这意味着同一时刻只能执行一段代码。如果一个操作需要等待（如网络请求耗时 500ms），同步方式会让整个线程"卡住"500ms——UI 不响应、定时器不触发、其他请求无法处理。

\`\`\`js
// 同步阻塞（假设 fetchSync 是同步请求）
const data = fetchSync("/api/user");  // 阻塞 500ms
console.log("用户数据:", data);        // 500ms 后才执行
console.log("我能立即执行吗？");        // 也要等 500ms
\`\`\`

异步方式则把"等待"交给运行时，主线程立即继续执行后续代码，等操作完成后通过**回调**或 **Promise** 通知：

\`\`\`js
fetch("/api/user").then(data => console.log("用户数据:", data));
console.log("我立即执行！");  // 不等 fetch 完成
\`\`\`

### 回调地狱（Callback Hell）

Promise 出现之前，异步操作用回调函数处理。多个依赖的异步操作会层层嵌套，形成难以阅读和维护的"回调金字塔"：

\`\`\`js
// 三层嵌套的回调地狱
getUser(userId, function (user) {
  getOrders(user.id, function (orders) {
    getOrderDetail(orders[0].id, function (detail) {
      console.log(detail);
    });
  });
});
\`\`\`

Promise 正是为解决回调地狱而生的——它把"嵌套"变成了"链式"。

### Promise 的三种状态

Promise 是一个代表"未来某个值"的对象。它有且仅有三种状态：

| 状态 | 含义 | 能否转换 |
| --- | --- | --- |
| **pending**（待定） | 初始状态，操作进行中 | 可变为 fulfilled 或 rejected |
| **fulfilled**（已兑现） | 操作成功完成，有最终值 | 终态，不可再变 |
| **rejected**（已拒绝） | 操作失败，有拒绝原因 | 终态，不可再变 |

**核心规则**：Promise 状态一旦从 pending 变为 fulfilled 或 rejected，就**永远固定**，不会再变。这是 Promise 可靠性的基础——你可以放心注册 then 回调，它至多被调用一次。

### 创建 Promise

用 \`new Promise(executor)\` 创建，executor 接收 \`resolve\` 和 \`reject\` 两个函数：

\`\`\`ts
const p = new Promise<string>((resolve, reject) => {
  // 异步操作...
  if (success) {
    resolve("结果数据");  // pending → fulfilled
  } else {
    reject(new Error("失败原因"));  // pending → rejected
  }
});
\`\`\`

注意 \`new Promise<string>\` 的泛型参数指定了 resolve 值的类型，这样 \`p\` 的类型是 \`Promise<string>\`，then 回调能正确推断出参数是 string。

#### 快捷方法

- \`Promise.resolve(value)\`：直接创建一个已 fulfilled 的 Promise。
- \`Promise.reject(reason)\`：直接创建一个已 rejected 的 Promise。

\`\`\`ts
const p1 = Promise.resolve(42);        // Promise<number>
const p2 = Promise.reject(new Error("x")); // Promise<never>
\`\`\`

### Promise 链式调用（then / catch / finally）

\`then\` 注册成功和失败的回调，**返回一个新的 Promise**，这是链式调用的基础：

\`\`\`ts
fetch("/api/user")
  .then(response => response.json())    // 返回新 Promise
  .then(user => user.name)              // 继续链式
  .then(name => console.log(name))
  .catch(err => console.error(err));    // 捕获链中任何错误
\`\`\`

#### then 的返回值与 Promise 渗透

then 回调的返回值有三种情况：

1. **返回普通值**：新 Promise 以该值 fulfilled。
2. **返回 Promise**：新 Promise"跟随"该 Promise 的状态。
3. **抛出异常**：新 Promise rejected。

\`\`\`ts
Promise.resolve(1)
  .then(x => x + 1)            // 返回 2，新 Promise fulfilled(2)
  .then(x => Promise.resolve(x * 10))  // 返回 Promise，跟随 → fulfilled(20)
  .then(x => { throw new Error("boom"); })  // 抛异常，新 Promise rejected
  .catch(e => console.log(e.message));  // "boom"
\`\`\`

#### catch 的本质

\`catch(onRejected)\` 等价于 \`then(undefined, onRejected)\`。它捕获**链上所有**在它之前发生的错误。**重要**：catch 之后还能继续 then，因为 catch 也返回一个新 Promise：

\`\`\`ts
Promise.reject("err")
  .catch(e => "恢复值")     // 捕获错误，返回"恢复值"
  .then(v => console.log(v));  // "恢复值"，因为 catch 后链恢复了
\`\`\`

#### finally

\`finally(onFinally)\` 无论成功失败都会执行，回调不接收参数，且**不改变**链上的值/错误（透传）：

\`\`\`ts
fetch(url)
  .then(r => r.json())
  .catch(e => fallback)
  .finally(() => loading = false);  // 关闭加载动画，不影响结果
\`\`\`

### Promise 组合方法

| 方法 | 行为 | 返回值 |
| --- | --- | --- |
| \`Promise.all\` | 全部成功才成功 | 数组，顺序与入参一致 |
| \`Promise.race\` | 第一个完成（成功或失败） | 第一个的结果/错误 |
| \`Promise.allSettled\` | 等全部完成 | \`{status, value/reason}[]\` |
| \`Promise.any\` | 第一个成功 | 第一个成功的值 |

#### Promise.all —— 全部成功

\`\`\`ts
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
// 两个请求并发执行，全部成功后解构
\`\`\`

**特点**：任一失败则整体立即 reject（fail-fast），但其他 Promise **不会被取消**（JS 没有内置取消机制）。

#### Promise.allSettled —— 全部完成（不管成败）

\`\`\`ts
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === "fulfilled") console.log(r.value);
  else console.log(r.reason);
});
\`\`\`

适用场景：批量操作，每个独立，想知道每个的结果。

#### Promise.race —— 第一个完成

\`\`\`ts
// 超时控制：5 秒内没完成则超时
const result = await Promise.race([
  fetch(url),
  new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 5000))
]);
\`\`\`

#### Promise.any —— 第一个成功

\`\`\`ts
// 从多个镜像中获取第一个成功的响应
const fastest = await Promise.any([
  fetch(mirror1),
  fetch(mirror2),
  fetch(mirror3)
]);
\`\`\`

只有全部失败才会 reject，错误是 \`AggregateError\`。

### async / await

\`async/await\` 是 Promise 的**语法糖**，让异步代码看起来像同步代码，可读性大幅提升。

- \`async\` 标记函数为异步函数，**总是返回 Promise**。
- \`await\` 暂停函数执行，等待 Promise 完成，然后返回其值。
- \`await\` 只能在 async 函数内（或顶层 await，ES2022）。

\`\`\`ts
async function fetchUser(id: number): Promise<User> {
  const response = await fetch("/api/user/" + id);  // 等待请求
  const user = await response.json();                // 等待解析
  return user;  // 返回值自动包成 Promise<User>
}
\`\`\`

#### async 函数的返回值

async 函数的返回值会被**自动包装成 Promise**：

- \`return 42\` → \`Promise.resolve(42)\`
- \`throw err\` → \`Promise.reject(err)\`
- \`return promise\` → 直接返回该 promise（不双层包装）

\`\`\`ts
async function f1() { return 42; }              // Promise<number>
async function f2() { return Promise.resolve("hi"); } // Promise<string>，不双层包
async function f3() { throw new Error("x"); }   // Promise<never>
\`\`\`

#### 错误处理

用 \`try/catch\` 包裹 await 来捕获错误：

\`\`\`ts
async function load() {
  try {
    const data = await fetch(url);
    return data;
  } catch (e) {
    console.error("加载失败:", e);
    return null;
  }
}
\`\`\`

### 并发 vs 串行

这是异步编程的核心权衡：

- **串行**：一个接一个执行，总时间 = 任务时间之和。
- **并发**：同时发起，总时间 ≈ 最慢任务的时间。

\`\`\`ts
// 串行：3 个各 1 秒，总 3 秒
for (const url of urls) {
  await fetch(url);
}

// 并发：3 个同时发，总约 1 秒
await Promise.all(urls.map(url => fetch(url)));
\`\`\`

**陷阱**：在 for 循环里用 await 会变成串行！要并发用 \`Promise.all + map\`。但如果任务太多（如 10000 个请求），需要**并发限制器**控制同时进行的数量，避免压垮服务器。

### 异步迭代器与 for await...of

普通迭代器返回 \`{value, done}\`，异步迭代器返回 \`Promise<{value, done}>\`。用 \`Symbol.asyncIterator\` 定义，用 \`for await...of\` 消费：

\`\`\`ts
async function* asyncRange(start: number, end: number) {
  for (let i = start; i < end; i++) {
    await delay(100);  // 每次产出前等待
    yield i;
  }
}

for await (const num of asyncRange(1, 4)) {
  console.log(num);  // 1, 2, 3（每次间隔 100ms）
}
\`\`\`

适用场景：流式数据处理、分页加载、逐条读取数据库。

### AbortController 取消异步操作

ES2015 的 Promise **无法取消**——一旦发起就无法中止。AbortController（Web API，Node.js 也支持）提供了取消信号机制：

\`\`\`ts
const controller = new AbortController();
const signal = controller.signal;

// 5 秒后取消
setTimeout(() => controller.abort(), 5000);

// 把 signal 传给支持取消的 API
await fetch(url, { signal });  // abort 后 fetch 抛 AbortError
\`\`\`

对于自定义 Promise，可以监听 signal 的 abort 事件来手动 reject：

\`\`\`ts
function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  signal.addEventListener("abort", () => reject(new Error("超时")));
  // ...
}
\`\`\`

### TypeScript 中的 Promise 类型标注

#### 基本标注

\`\`\`ts
// 函数返回 Promise<T>
function fetchUser(id: number): Promise<User> { ... }

// 变量类型
const p: Promise<string> = fetchString();

// 泛型参数指定 resolve 值类型
new Promise<number>((resolve) => resolve(42));
\`\`\`

#### async 函数返回类型

async 函数的返回类型**应该显式标注为 \`Promise<T>\`**，T 是实际返回的数据类型（不是 Promise）：

\`\`\`ts
// ✅ 推荐：显式标注
async function getUser(id: number): Promise<User> {
  return await db.findUser(id);
}

// ❌ 不推荐：让推断决定（实现变化时返回类型可能悄悄变）
async function getUser(id: number) {
  return await db.findUser(id);
}
\`\`\`

#### Promise<T> 的类型推断

- \`Promise.resolve(42)\` 推断为 \`Promise<number>\`
- \`async function f() { return "hi"; }\` 推断为 \`Promise<string>\`
- \`await promise\` 的类型是 promise 的泛型参数 T

\`\`\`ts
const p1: Promise<number> = Promise.resolve(42);
const n: number = await p1;  // await Promise<number> → number
\`\`\`

### 异步错误处理最佳实践

1. **总是 catch**：未捕获的 Promise rejection 在 Node.js 中会导致进程崩溃。
2. **局部 catch 优于全局**：在最近的 catch 处处理，错误信息更精确。
3. **用 try/catch 包 await**：await 抛出的拒绝不会被外层 .catch 捕获。
4. **区分预期错误和意外错误**：用自定义 Error 子类。
5. **finally 释放资源**：关闭连接、停止 loading 等。
6. **避免吞掉错误**：catch 里至少 log，别空着。

### 陷阱总结

1. **for + await 是串行**：要并发用 \`Promise.all\`。
2. **忘记 await**：\`const x = asyncFn();\` 拿到的是 Promise 不是值。
3. **return await vs return promise**：前者多一层 unwrap，性能略低但栈追踪更好。
4. **Promise.all fail-fast**：一个失败全部"失败"，但其他不会取消。
5. **catch 后链恢复**：catch 返回值会成为后续 then 的输入。
6. **async 函数总返回 Promise**：即使你 return 一个普通值。
7. **顶层 await**：在 ES Module 中可用，CommonJS 中不可。

### 本节代码演示

下面综合演示：Promise 创建与链式、组合方法（all/race/allSettled/any）、async/await 串行与并发、错误处理、超时取消、并发限制器。所有异步操作用极短延时确保 5 秒内完成。`,
    code: `// ============================================================
// 第一章代码演示：异步编程全景
// 所有异步操作使用极短延时确保 5 秒超时内完成
// ============================================================

// 工具：延时函数，返回 Promise
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- 1. Promise 创建与三种状态 ----
console.log("========== 1. Promise 创建与状态 ==========");

// new Promise 创建，executor 接收 resolve/reject
const resolved = new Promise<string>((resolve) => {
  setTimeout(() => resolve("✅ 操作成功"), 50);
});
const rejected = new Promise<string>((_, reject) => {
  setTimeout(() => reject(new Error("❌ 操作失败")), 50);
});

resolved.then((v) => console.log("  resolved.then:", v));
rejected.catch((e) => console.log("  rejected.catch:", e.message));

// 快捷方法
Promise.resolve(42).then((v) => console.log("  Promise.resolve(42):", v));
Promise.reject("快捷拒绝").catch((e) => console.log("  Promise.reject:", e));

// ---- 2. Promise 链式调用 ----
console.log("\\n========== 2. Promise 链式调用 ==========");

// then 返回新 Promise，链式传递
Promise.resolve(1)
  .then((x) => {
    console.log("  第一层:", x);
    return x + 1;                    // 返回普通值 → fulfilled(2)
  })
  .then((x) => {
    console.log("  第二层:", x);
    return Promise.resolve(x * 10);  // 返回 Promise → 跟随 → fulfilled(20)
  })
  .then((x) => {
    console.log("  第三层:", x);
    throw new Error("链中抛错");      // 抛异常 → rejected
  })
  .catch((e) => {
    console.log("  catch 捕获:", e.message);
    return "恢复值";                  // catch 返回值 → fulfilled("恢复值")
  })
  .then((v) => console.log("  catch 后 then:", v))
  .finally(() => console.log("  finally 总会执行"));

// ---- 3. Promise 组合方法 ----
console.log("\\n========== 3. Promise 组合方法 ==========");

// 模拟异步任务
function task(name: string, ms: number, success: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) resolve(name + "完成(" + ms + "ms)");
      else reject(new Error(name + "失败"));
    }, ms);
  });
}

// Promise.all：全部成功
Promise.all([task("A", 30), task("B", 20), task("C", 10)])
  .then((results) => console.log("  all 全部成功:", results))
  .catch((e) => console.log("  all 失败:", e.message));

// Promise.allSettled：全部完成（不管成败）
Promise.allSettled([task("X", 15, true), task("Y", 25, false), task("Z", 10, true)])
  .then((results) => {
    console.log("  allSettled 结果:");
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        console.log("    [" + i + "] 成功:", r.value);
      } else {
        console.log("    [" + i + "] 失败:", r.reason.message);
      }
    });
  });

// Promise.race：第一个完成（无论成功失败）
Promise.race([task("快", 10), task("慢", 50)])
  .then((v) => console.log("  race 最快:", v));

// Promise.any：第一个成功
Promise.any([task("失败1", 10, false), task("成功", 30, true), task("失败2", 20, false)])
  .then((v) => console.log("  any 第一个成功:", v))
  .catch((e) => console.log("  any 全失败:", e.errors?.length, "个"));

// ---- 4. async/await 基础 ----
console.log("\\n========== 4. async/await 基础 ==========");

// async 函数总返回 Promise
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  await delay(20);  // 模拟网络请求
  return { id: id, name: "用户" + id };
}

// await 暂停执行等待 Promise
async function demoAsyncAwait() {
  console.log("  开始获取用户...");
  const user = await fetchUser(1001);  // 等待
  console.log("  获取到:", JSON.stringify(user));
  return user;
}
demoAsyncAwait();

// ---- 5. 串行 vs 并发 ----
console.log("\\n========== 5. 串行 vs 并发 ==========");

const urls = ["url1", "url2", "url3"];

// 串行：for + await，总时间 = 各任务时间之和
async function serial() {
  const start = Date.now();
  const results: string[] = [];
  for (const url of urls) {
    const r = await task(url, 30);  // 一个接一个，总 90ms
    results.push(r);
  }
  console.log("  串行耗时:", Date.now() - start, "ms", results);
}

// 并发：Promise.all + map，总时间 ≈ 最慢任务
async function concurrent() {
  const start = Date.now();
  const results = await Promise.all(urls.map((url) => task(url, 30)));  // 同时，总 30ms
  console.log("  并发耗时:", Date.now() - start, "ms", results);
}

serial().then(() => concurrent());

// ---- 6. async 错误处理 ----
console.log("\\n========== 6. async 错误处理 ==========");

async function riskyOperation(): Promise<string> {
  await delay(10);
  if (Math.random() > 0.5) {
    throw new Error("随机失败！");
  }
  return "成功";
}

async function safeCall() {
  try {
    const result = await riskyOperation();
    console.log("  try 内:", result);
  } catch (e) {
    console.log("  catch 捕获:", (e as Error).message);
  } finally {
    console.log("  finally 执行（资源清理）");
  }
}
safeCall();

// ---- 7. 超时取消模式 ----
console.log("\\n========== 7. 超时取消 ==========");

// 用 Promise.race 实现超时
function withTimeout<T>(promise: Promise<T>, ms: number, msg: string = "超时"): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(msg)), ms);
  });
  return Promise.race([promise, timeout]);
}

async function demoTimeout() {
  try {
    // 慢任务 + 短超时 → 超时
    const r1 = await withTimeout(task("慢任务", 200), 50, "慢任务超时");
    console.log("  慢任务结果:", r1);
  } catch (e) {
    console.log("  慢任务:", (e as Error).message);
  }

  // 快任务 + 长超时 → 正常完成
  try {
    const r2 = await withTimeout(task("快任务", 10), 100, "快任务超时");
    console.log("  快任务结果:", r2);
  } catch (e) {
    console.log("  快任务:", (e as Error).message);
  }
}
demoTimeout();

// ---- 8. 并发限制器 ----
console.log("\\n========== 8. 并发限制器 ==========");

// 限制同时进行的 Promise 数量
async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      results[i] = await tasks[i]();
    }
  }

  // 启动 concurrency 个 worker
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

async function demoLimit() {
  // 6 个任务，每个 30ms，限制并发 2 → 约 90ms 完成
  const taskFns = Array.from({ length: 6 }, (_, i) => () => task("T" + i, 30));
  const start = Date.now();
  const results = await pLimit(taskFns, 2);
  console.log("  并发限制(2) 6个任务耗时:", Date.now() - start, "ms");
  console.log("  结果数:", results.length);
}
demoLimit();

// ---- 9. 异步迭代器 for await...of ----
console.log("\\n========== 9. 异步迭代器 ==========");

// 异步生成器函数
async function* asyncCounter(start: number, end: number, step: number) {
  for (let i = start; i < end; i += step) {
    await delay(10);  // 每次产出前等待
    yield i;          // 产出值
  }
}

async function demoAsyncIterator() {
  console.log("  for await...of 遍历异步生成器:");
  const collected: number[] = [];
  for await (const num of asyncCounter(1, 5, 1)) {
    collected.push(num);
    console.log("    产出:", num);
  }
  console.log("  收集到:", collected);
}
demoAsyncIterator();

// ---- 10. AbortController 取消 ----
console.log("\\n========== 10. AbortController 取消 ==========");

// 模拟支持取消的异步操作
function cancellableTask(ms: number, signal: { aborted: boolean; addEventListener: (ev: string, cb: () => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("已取消"));
      return;
    }
    const timer = setTimeout(() => resolve("任务完成"), ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Error("AbortError: 任务被取消"));
    });
  });
}

// 简化版 AbortController 模拟（沙箱中 AbortController 可能可用，这里兜底）
function createAbortSignal() {
  const listeners: (() => void)[] = [];
  return {
    aborted: false,
    addEventListener: (_ev: string, cb: () => void) => listeners.push(cb),
    abort() {
      this.aborted = true;
      listeners.forEach((cb) => cb());
    }
  };
}

async function demoAbort() {
  const signal = createAbortSignal();
  // 100ms 后取消
  setTimeout(() => signal.abort(), 30);

  try {
    const r = await cancellableTask(200, signal);
    console.log("  任务结果:", r);
  } catch (e) {
    console.log("  任务被取消:", (e as Error).message);
  }
}
demoAbort();

// ---- 11. Promise 类型在 TS 中的标注 ----
console.log("\\n========== 11. Promise 类型标注 ==========");

// 显式标注返回类型
async function fetchData(): Promise<{ code: number; data: string }> {
  await delay(10);
  return { code: 200, data: "hello" };
}

// Promise<T> 泛型
const p: Promise<number> = new Promise<number>((resolve) => resolve(42));

// await 的类型推断
async function typeInference() {
  const a: number = await p;               // Promise<number> → number
  const obj = await fetchData();           // → { code: number; data: string }
  console.log("  await Promise<number>:", a);
  console.log("  await fetchData:", JSON.stringify(obj));
}
typeInference();

console.log("\\n异步编程章节演示完成！");`,
  },

  // =========================================================
  // 第二章：迭代器与生成器 (Iterators & Generators)
  // =========================================================
  {
    id: "ts-iterators",
    title: "迭代器与生成器",
    icon: "🔄",
    group: "核心补充",
    content: `## 迭代器与生成器 (Iterators & Generators)

迭代器（Iterator）和生成器（Generator）是 JavaScript/TypeScript 中实现**自定义遍历行为**和**惰性计算**的核心机制。理解它们，你就能让任何对象支持 \`for...of\`、实现无限序列、做协程式编程、流式处理数据。ES6 引入的 \`Symbol.iterator\` 和 \`function*\` 语法，把"如何遍历"这件事彻底标准化了。

本章将系统讲解可迭代协议、迭代器协议、生成器函数、yield/yield*、异步迭代器、惰性计算，并通过斐波那契数列、范围对象等实战巩固理解。

### 可迭代协议（Iterable Protocol）

一个对象要成为"可迭代的"（iterable），必须实现 **可迭代协议**：在 \`[Symbol.iterator]\` 方法中返回一个迭代器。

\`\`\`ts
const myIterable = {
  [Symbol.iterator]() {
    return {
      next() {
        return { value: 42, done: false };
      }
    };
  }
};

for (const x of myIterable) { ... }  // 现在可以用 for...of
\`\`\`

\`Symbol.iterator\` 是一个**内置 Symbol**，是"获取迭代器"的标准入口。任何对象只要实现了这个方法，就能被 \`for...of\`、扩展运算符 \`...\`、解构赋值、\`Array.from()\` 等消费。

### 迭代器协议（Iterator Protocol）

迭代器是一个对象，实现 **迭代器协议**：拥有 \`next()\` 方法，返回 \`{ value, done }\`：

\`\`\`ts
interface Iterator<T> {
  next(): { value: T; done: boolean };
  return?(value?: any): { value: any; done: true };  // 可选：提前终止
  throw?(e?: any): { value: any; done: true };       // 可选：向生成器抛错
}
\`\`\`

- \`value\`：当前产出的值（done 为 true 时通常是 undefined）。
- \`done\`：是否遍历结束。
- \`return()\`：当 for...of 提前 break 或 return 时调用，用于清理资源。
- \`throw()\`：向生成器内部抛入错误。

#### 手写迭代器示例

\`\`\`ts
function makeRangeIterator(start: number, end: number, step: number = 1) {
  let current = start;
  return {
    next() {
      if (current < end) {
        const value = current;
        current += step;
        return { value, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}
\`\`\`

手写迭代器需要自己维护状态（current），比较繁琐。**生成器函数**能自动帮你创建迭代器，大大简化代码。

### 生成器函数 function*

\`function*\` 定义生成器函数。调用生成器函数**不执行**函数体，而是返回一个**生成器对象**（既是迭代器又是可迭代对象）：

\`\`\`ts
function* range(start: number, end: number, step: number = 1) {
  for (let i = start; i < end; i += step) {
    yield i;  // 产出值，暂停执行
  }
}

const gen = range(1, 5);  // 不执行函数体，返回生成器
gen.next();  // { value: 1, done: false }，执行到 yield 1 暂停
gen.next();  // { value: 2, done: false }，从暂停处继续
gen.next();  // { value: 3, done: false }
gen.next();  // { value: 4, done: false }
gen.next();  // { value: undefined, done: true }
\`\`\`

#### yield 的本质

\`yield\` 是一个**双向通道**：

1. **产出值**：\`yield value\` 把 value 发给调用方，暂停函数。
2. **接收值**：\`const input = yield value\`，下次 \`next(input)\` 时，input 会作为 yield 表达式的返回值。

\`\`\`ts
function* dialog() {
  const name = yield "你叫什么？";   // 产出问题，接收回答
  return "你好，" + name;
}
const g = dialog();
g.next();          // { value: "你叫什么？", done: false }
g.next("张三");    // 把"张三"作为 yield 的返回值 → { value: "你好，张三", done: true }
\`\`\`

这种双向通信是协程（coroutine）的基础。

### yield* 委托（Delegation）

\`yield*\` 用于在生成器中**委托给另一个可迭代对象**，把它的所有值依次产出：

\`\`\`ts
function* inner() {
  yield 1;
  yield 2;
}
function* outer() {
  yield 0;
  yield* inner();  // 委托：产出 1, 2
  yield 3;
}
// outer 产出：0, 1, 2, 3
\`\`\`

\`yield*\` 可以委托给任何可迭代对象：数组、字符串、Set、另一个生成器。这让生成器可以组合，构建复杂的遍历逻辑（如树形结构扁平化）。

### for...of 与 for...in

| 特性 | for...of | for...in |
| --- | --- | --- |
| **遍历对象** | 可迭代对象的**值** | 对象的**可枚举属性键** |
| **适用范围** | Array/Map/Set/String/Generator 等 | 任何对象 |
| **是否包含原型链** | 否 | 是（包括继承的属性） |
| **能否遍历普通对象** | 否（需先实现 iterable 或用 Object.values） | 是 |
| **顺序** | 按迭代器定义 | 不保证顺序（整数键升序，其余按添加顺序） |

\`\`\`ts
const arr = ["a", "b", "c"];
for (const v of arr) console.log(v);   // a, b, c（值）
for (const k in arr) console.log(k);   // 0, 1, 2（索引字符串）

const obj = { x: 1, y: 2 };
for (const v of obj) { }  // ❌ TypeError: obj 不是 iterable
for (const k in obj) console.log(k);  // x, y（键）
\`\`\`

### 内置可迭代对象

以下内置对象都实现了可迭代协议，可用 for...of：

- **Array**：遍历元素。
- **Map**：遍历 \`[key, value]\` 键值对。
- **Set**：遍历元素（不重复）。
- **String**：遍历 Unicode 码点（正确处理代理对）。
- **TypedArray**：遍历数字元素。
- **arguments**：函数参数（类数组但可迭代）。
- **NodeList**：DOM 节点列表（浏览器环境）。

\`\`\`ts
for (const [k, v] of new Map([["a", 1], ["b", 2]])) console.log(k, v);
for (const ch of "hello") console.log(ch);  // h, e, l, l, o
\`\`\`

### 自定义可迭代对象

让自定义对象支持 for...of，实现 \`[Symbol.iterator]\` 即可：

\`\`\`ts
class Range {
  constructor(public start: number, public end: number) {}
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current < end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
}

for (const n of new Range(1, 5)) console.log(n);  // 1, 2, 3, 4
\`\`\`

### 生成器实现惰性计算

惰性计算（Lazy Evaluation）是"**用到时才计算**"的策略。生成器天然支持惰性——每次 next() 才计算下一个值，不预先生成全部。这让你能表示**无限序列**：

\`\`\`ts
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {     // 无限循环！但不会卡死，因为每次只产出一个
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
fib.next();  // 0
fib.next();  // 1
fib.next();  // 1
fib.next();  // 2
// ... 无限
\`\`\`

无限序列无法用数组存储（内存会爆），但生成器可以"按需"产出。配合 \`take\` 等工具函数，可以取出前 N 个：

\`\`\`ts
function* take<T>(n: number, iterable: Iterable<T>) {
  let i = 0;
  for (const x of iterable) {
    if (i++ >= n) break;
    yield x;
  }
}

for (const n of take(10, fibonacci())) console.log(n);  // 前 10 个斐波那契数
\`\`\`

### 异步迭代器与 for await...of

普通迭代器同步产出值。异步迭代器（用 \`Symbol.asyncIterator\`）产出 \`Promise\`，用 \`for await...of\` 消费：

\`\`\`ts
async function* asyncLines() {
  const lines = ["第一行", "第二行", "第三行"];
  for (const line of lines) {
    await delay(100);  // 模拟异步读取
    yield line;
  }
}

for await (const line of asyncLines()) {
  console.log(line);  // 每隔 100ms 输出一行
}
\`\`\`

适用场景：流式读取文件、分页 API、WebSocket 消息流。

### 生成器作为协程

生成器的"暂停-恢复"和"双向通信"特性，使其能模拟**协程**（cooperative concurrency）。虽然 JS 是单线程的，但生成器让你能写"看起来并发"的代码：

\`\`\`ts
function* taskA() {
  yield "A1";
  yield "A2";
  return "A done";
}
function* taskB() {
  yield "B1";
  yield "B2";
  return "B done";
}
// 调度器交替执行两个"协程"
function* scheduler() {
  const a = taskA();
  const b = taskB();
  let ra = a.next();
  let rb = b.next();
  while (!ra.done || !rb.done) {
    if (!ra.done) { yield ra.value; ra = a.next(); }
    if (!rb.done) { yield rb.value; rb = b.next(); }
  }
}
\`\`\`

### TypeScript 中的迭代器类型

TypeScript 提供了 \`Iterable<T>\`、\`Iterator<T>\`、\`IterableIterator<T>\` 等内置接口：

\`\`\`ts
// Iterable<T>：有 [Symbol.iterator]() 方法
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
// Iterator<T>：有 next() 方法
interface Iterator<T> {
  next(value?: any): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}
// IteratorResult<T>：{ value: T; done: boolean }
\`\`\`

自定义迭代器时标注这些类型，能获得完整类型安全。

### 陷阱总结

1. **生成器只能迭代一次**：迭代结束后再 next() 永远返回 {done:true}。要多次迭代需重新调用生成器函数。
2. **next() 的第一个参数被忽略**：第一次 next() 传的值无法接收（因为还没执行到 yield）。
3. **for...of 不能遍历普通对象**：需用 Object.entries/values/keys 或实现 [Symbol.iterator]。
4. **yield* 的返回值**：\`const result = yield* gen()\`，result 是被委托生成器的 return 值。
5. **return() 的清理作用**：for...of 中 break/return/throw 会调用迭代器的 return()，用于释放资源。
6. **无限生成器要配 take**：直接 for...of 无限生成器会死循环。
7. **生成器不是线程**：它是协作式的，单线程内交替执行，没有抢占。

### 本节代码演示

下面综合演示：手写迭代器、生成器函数、yield 双向通信、yield* 委托、惰性计算（斐波那契无限序列）、自定义可迭代对象（Range）、协程调度。`,
    code: `// ============================================================
// 第二章代码演示：迭代器与生成器全景
// ============================================================

// ---- 1. 手写迭代器（迭代器协议） ----
console.log("========== 1. 手写迭代器 ==========");

// 实现 next() 返回 { value, done }
function makeRangeIterator(start: number, end: number, step: number = 1): Iterator<number> {
  let current = start;
  return {
    next(): IteratorResult<number> {
      if (current < end) {
        const value = current;
        current += step;
        return { value: value, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

const it = makeRangeIterator(1, 5, 1);
console.log("  next():", it.next());  // { value: 1, done: false }
console.log("  next():", it.next());  // { value: 2, done: false }
console.log("  next():", it.next());  // { value: 3, done: false }
console.log("  next():", it.next());  // { value: 4, done: false }
console.log("  next():", it.next());  // { value: undefined, done: true }

// ---- 2. 可迭代对象（Symbol.iterator） ----
console.log("\\n========== 2. 自定义可迭代对象 Range ==========");

// 实现 [Symbol.iterator] 让对象支持 for...of
class Range implements Iterable<number> {
  constructor(public start: number, public end: number, public step: number = 1) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    const step = this.step;
    return {
      next(): IteratorResult<number> {
        if (current < end) {
          const value = current;
          current += step;
          return { value: value, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const range = new Range(1, 10, 2);
console.log("  Range(1, 10, 2) 遍历:");
for (const n of range) {
  console.log("    ", n);  // 1, 3, 5, 7, 9
}

// 也能用扩展运算符和解构（因为实现了 iterable）
const arr = [...new Range(1, 6)];  // [1, 2, 3, 4, 5]
console.log("  扩展运算符 [...Range(1,6)]:", arr);
const [first, second] = new Range(10, 20);
console.log("  解构 [first, second]:", first, second);

// ---- 3. 生成器函数 function* ----
console.log("\\n========== 3. 生成器函数 ==========");

// function* 定义生成器，yield 产出值
function* genRange(start: number, end: number, step: number = 1): Generator<number> {
  for (let i = start; i < end; i += step) {
    yield i;  // 产出 i 并暂停
  }
}

// 调用生成器函数返回生成器对象（不执行函数体）
const gen = genRange(1, 4);
console.log("  gen.next():", gen.next());  // { value: 1, done: false }
console.log("  gen.next():", gen.next());  // { value: 2, done: false }
console.log("  gen.next():", gen.next());  // { value: 3, done: false }
console.log("  gen.next():", gen.next());  // { value: undefined, done: true }

// 生成器本身也是可迭代的，可直接 for...of
console.log("  for...of 遍历 genRange(1, 6):");
for (const n of genRange(1, 6)) {
  console.log("    ", n);
}

// ---- 4. yield 的双向通信 ----
console.log("\\n========== 4. yield 双向通信 ==========");

// yield 产出值，next(value) 把 value 传回生成器
function* dialog(): Generator<string, void, string> {
  const name = yield "你叫什么名字？";   // 产出问题，接收回答
  const age = yield name + "，你多大了？"; // 产出，接收
  yield "好的，" + name + age + "岁";
}

const d = dialog();
console.log("  ", d.next().value);          // "你叫什么名字？"（第一次 next 的参数被忽略）
console.log("  ", d.next("张三").value);    // 把"张三"作为上一个 yield 的返回值
console.log("  ", d.next("28").value);      // 把"28"作为返回值

// ---- 5. yield* 委托 ----
console.log("\\n========== 5. yield* 委托 ==========");

// yield* 把另一个可迭代对象的值依次产出
function* inner(): Generator<number> {
  yield 1;
  yield 2;
  return "inner done";
}

function* outer(): Generator<number> {
  yield 0;
  const result = yield* inner();  // 委托给 inner，result 是 inner 的 return 值
  console.log("  inner 的返回值:", result);
  yield 3;
}

console.log("  outer 委托遍历:");
for (const n of outer()) {
  console.log("    ", n);  // 0, 1, 2, 3
}

// yield* 委托给数组
function* genWithArray(): Generator<number | string> {
  yield* [10, 20, 30];       // 委托给数组
  yield* "ab";               // 委托给字符串
}
console.log("  yield* 委托数组和字符串:");
for (const x of genWithArray()) {
  console.log("    ", x);    // 10, 20, 30, "a", "b"
}

// ---- 6. 惰性计算：无限斐波那契序列 ----
console.log("\\n========== 6. 惰性计算：斐波那契 ==========");

// 无限生成器：while(true) 不会卡死，因为每次只产出一个值
function* fibonacci(): Generator<number> {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// take 工具：从可迭代对象取前 n 个
function* take<T>(n: number, iterable: Iterable<T>): Generator<T> {
  let i = 0;
  for (const x of iterable) {
    if (i++ >= n) break;
    yield x;
  }
}

// 取前 10 个斐波那契数（不会无限循环）
const fib10 = [...take(10, fibonacci())];
console.log("  前 10 个斐波那契数:", fib10);

// 生成器每次创建都是新的，可重复使用
const fib = fibonacci();
console.log("  手动 next() 5 次:");
for (let i = 0; i < 5; i++) {
  console.log("    fib.next():", fib.next().value);
}

// ---- 7. 无限素数序列（惰性） ----
console.log("\\n========== 7. 惰性计算：素数序列 ==========");

function* primes(): Generator<number> {
  yield 2;
  let n = 3;
  while (true) {
    if (isPrime(n)) yield n;
    n += 2;
  }
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// 取前 10 个素数
const primes10 = [...take(10, primes())];
console.log("  前 10 个素数:", primes10);

// ---- 8. for...of vs for...in 对比 ----
console.log("\\n========== 8. for...of vs for...in ==========");

const sampleArr = ["a", "b", "c"];
console.log("  数组 for...of（值）:");
for (const v of sampleArr) console.log("    ", v);  // a, b, c
console.log("  数组 for...in（键）:");
for (const k in sampleArr) console.log("    ", k);  // 0, 1, 2

const sampleObj = { x: 1, y: 2, z: 3 };
console.log("  对象 for...in（键）:");
for (const k in sampleObj) console.log("    ", k, "=", sampleObj[k]);
// 对象不可 for...of，需用 Object.entries
console.log("  对象 Object.entries:");
for (const [k, v] of Object.entries(sampleObj)) {
  console.log("    ", k, "=", v);
}

// ---- 9. 内置可迭代对象 ----
console.log("\\n========== 9. 内置可迭代对象 ==========");

// Map：遍历 [key, value]
const map = new Map([["name", "张三"], ["age", 28]]);
console.log("  Map for...of:");
for (const [k, v] of map) console.log("    ", k, ":", v);

// Set：遍历不重复值
const set = new Set([3, 1, 4, 1, 5, 9, 2, 6]);
console.log("  Set for...of:", [...set]);

// String：遍历字符
console.log("  String for...of:");
for (const ch of "TS") console.log("    ", ch);

// ---- 10. 生成器实现树形结构扁平化 ----
console.log("\\n========== 10. 生成器扁平化树 ==========");

interface TreeNode {
  value: number;
  children?: TreeNode[];
}

// 用 yield* 递归遍历树
function* traverseTree(node: TreeNode): Generator<number> {
  yield node.value;
  if (node.children) {
    for (const child of node.children) {
      yield* traverseTree(child);  // 递归委托
    }
  }
}

const tree: TreeNode = {
  value: 1,
  children: [
    { value: 2, children: [{ value: 4 }, { value: 5 }] },
    { value: 3, children: [{ value: 6 }] }
  ]
};

console.log("  树扁平化遍历:");
for (const v of traverseTree(tree)) {
  console.log("    ", v);  // 1, 2, 4, 5, 3, 6
}

// ---- 11. 协程调度器 ----
console.log("\\n========== 11. 协程调度 ==========");

// 生成器模拟协程：交替执行
function* taskA(): Generator<string> {
  yield "A-步骤1";
  yield "A-步骤2";
  yield "A-步骤3";
  return "A完成";
}
function* taskB(): Generator<string> {
  yield "B-步骤1";
  yield "B-步骤2";
  return "B完成";
}

// 调度器：交替推进两个协程
function* scheduler(): Generator<string> {
  const a = taskA();
  const b = taskB();
  let ra = a.next();
  let rb = b.next();
  while (!ra.done || !rb.done) {
    if (!ra.done) {
      yield ra.value;
      ra = a.next();
    }
    if (!rb.done) {
      yield rb.value;
      rb = b.next();
    }
  }
}

console.log("  协程交替执行:");
for (const step of scheduler()) {
  console.log("    ", step);
}

// ---- 12. return() 提前终止 ----
console.log("\\n========== 12. return() 提前终止 ==========");

// 生成器的 return() 方法：提前终止并执行清理
function* withCleanup(): Generator<string> {
  try {
    yield "开始";
    yield "处理中";
    yield "结束";
  } finally {
    console.log("    [清理] 资源已释放（finally 块）");
  }
}

const wc = withCleanup();
console.log("  ", wc.next().value);   // "开始"
console.log("  ", wc.next().value);   // "处理中"
console.log("  调用 return() 提前终止:");
console.log("  ", wc.return("手动终止"));  // 触发 finally，返回 { value: "手动终止", done: true }
console.log("  之后 next():", wc.next());   // { value: undefined, done: true }

console.log("\\n迭代器与生成器章节演示完成！");`,
  },

  // =========================================================
  // 第三章：this 类型深入 (this Deep Dive)
  // =========================================================
  {
    id: "ts-this-deep",
    title: "this 类型深入",
    icon: "👆",
    group: "核心补充",
    content: `## this 类型深入 (this Deep Dive)

\`this\` 是 JavaScript 中最令人困惑的关键字之一。它的值**不是在定义时确定的，而是在调用时确定的**——同一个函数，以不同方式调用，\`this\` 可能完全不同。这种"动态绑定"特性带来了极大的灵活性，也是无数 bug 的根源。TypeScript 提供了 \`this\` 参数注解和 \`ThisType<T>\` 工具类型，让 this 在编译期也能被类型约束。

本章将系统讲解 this 的四种绑定规则、箭头函数的词法 this、this 参数注解、ThisType 工具类型、bind/call/apply 的类型、this 丢失与修复，并通过实战掌握"驯服 this"的技巧。

### this 的四种绑定规则

JavaScript 中 this 的值由**调用方式**决定，有四条规则（按优先级从高到低）：

#### 规则 1：new 绑定（优先级最高）

用 \`new\` 调用函数时，this 指向新创建的对象：

\`\`\`ts
function Person(name: string) {
  this.name = name;  // this 指向 new 出来的新对象
}
const p = new Person("张三");
console.log(p.name);  // "张三"
\`\`\`

\`new\` 做了四件事：创建新对象 → 新对象的 __proto__ 指向函数的 prototype → this 绑定到新对象 → 如果函数返回非对象则返回新对象。

#### 规则 2：显式绑定（call/apply/bind）

用 \`call\`、\`apply\`、\`bind\` 显式指定 this：

\`\`\`ts
function greet(greeting: string) {
  console.log(greeting + ", " + this.name);
}
const obj = { name: "张三" };
greet.call(obj, "你好");    // this = obj，参数逐个传
greet.apply(obj, ["你好"]);  // this = obj，参数以数组传
const bound = greet.bind(obj);  // 返回 this 永久绑定为 obj 的新函数
bound("你好");
\`\`\`

| 方法 | this | 参数 | 是否立即执行 |
| --- | --- | --- | --- |
| call(thisArg, ...args) | 指定 | 逐个传 | 是 |
| apply(thisArg, argsArray) | 指定 | 数组传 | 是 |
| bind(thisArg, ...args) | 指定 | 可预置 | 否（返回新函数） |

#### 规则 3：隐式绑定（方法调用）

函数作为对象的方法调用时，this 指向该对象：

\`\`\`ts
const obj = {
  name: "张三",
  greet() {
    console.log(this.name);  // this = obj
  }
};
obj.greet();  // "张三"
\`\`\`

**陷阱：隐式丢失**。如果把方法"取出来"裸调用，this 就丢了：

\`\`\`ts
const fn = obj.greet;
fn();  // this 不再是 obj！严格模式下是 undefined，非严格是 window/global
\`\`\`

这是最常见的 this bug 来源：回调、解构、赋值都可能触发隐式丢失。

#### 规则 4：默认绑定（独立调用）

独立调用函数（非方法、非 new、非 call/apply/bind），this 指向：

- **严格模式**（\`"use strict"\`）：\`undefined\`
- **非严格模式**：全局对象（浏览器 \`window\`，Node \`global\`）

\`\`\`ts
function show() {
  console.log(this);
}
show();  // 严格模式：undefined；非严格：global/window
\`\`\`

#### 优先级总结

\`new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定\`。其中 bind 的优先级低于 new（new 会忽略 bind 绑定的 this）。

### 箭头函数的词法 this

箭头函数**没有自己的 this**，它继承定义时外层的 this（词法作用域）。这是箭头函数最重要的特性，也是解决 this 丢失的利器：

\`\`\`ts
const obj = {
  name: "张三",
  // 普通方法：this 动态绑定
  regular() {
    setTimeout(function () {
      console.log(this.name);  // ❌ this 是 window/undefined（回调丢失）
    }, 100);
  },
  // 箭头方法：this 继承外层（即 regular 的 this = obj）
  arrow() {
    setTimeout(() => {
      console.log(this.name);  // ✅ "张三"（箭头继承 arrow 的 this）
    }, 100);
  }
};
\`\`\`

#### 箭头函数 this 的"固化"

箭头函数的 this 在**定义时**就固定了，后续 call/apply/bind **无法改变**它的 this：

\`\`\`ts
const arrow = () => console.log(this);
arrow.call({ x: 1 });  // this 不变，仍是定义时的外层 this
\`\`\`

#### 何时用箭头函数 vs 普通函数

| 场景 | 推荐 | 原因 |
| --- | --- | --- |
| 回调中需要外层 this | 箭头函数 | 自动捕获外层 this，不丢失 |
| 对象方法需要 this 指向对象 | 普通函数/方法简写 | 箭头函数 this 不指向对象 |
| 需要动态 this（如 bind/call） | 普通函数 | 箭头 this 不可变 |
| 构造函数 | 普通函数 | 箭头不能 new |
| 简短回调（无 this 依赖） | 箭头函数 | 语法简洁 |

### TypeScript 的 this 参数注解

TypeScript 允许在函数参数列表**第一个位置**声明 \`this\` 参数，约束调用时 this 的类型。这个参数是**编译期的**，运行时不存在（被擦除）：

\`\`\`ts
interface Box {
  value: number;
  show(this: Box): void;  // 约束 show 调用时 this 必须是 Box
}

const box: Box = {
  value: 42,
  show(this: Box) {
    console.log(this.value);  // this 类型是 Box，有 value 属性
  }
};
box.show();  // ✅
const fn = box.show;
fn();  // ❌ 类型错误：this 不是 Box
\`\`\`

this 参数注解能在**编译期**捕获 this 丢失问题，而不用等到运行时才发现 this 是 undefined。

### ThisType<T> 工具类型

\`ThisType<T>\` 是一个特殊的工具类型，用于标注对象字面量中方法的 this 类型。需要 \`noImplicitThis\` 或严格模式开启：

\`\`\`ts
interface Counter {
  count: number;
  increment(): void;
  decrement(): void;
}

const counter: Counter & ThisType<Counter> = {
  count: 0,
  increment() {
    this.count++;  // this 类型是 Counter
  },
  decrement() {
    this.count--;
  }
};
\`\`\`

\`ThisType<T>\` 不会创建新类型，它是一个**标记接口**，告诉编译器"这个对象字面量内的 this 类型是 T"。

### bind / call / apply 的类型

TypeScript 对 call/apply/bind 的类型有完整支持，能正确推断返回值和 this 类型：

\`\`\`ts
function greet(this: Person, greeting: string): string {
  return greeting + ", " + this.name;
}

// call：this + 逐个参数
greet.call({ name: "张三" }, "你好");  // 返回 string

// apply：this + 参数数组
greet.apply({ name: "李四" }, ["你好"]);

// bind：返回新函数，this 固定，可预置参数（偏应用）
const bound = greet.bind({ name: "王五" });
bound("你好");  // "你好, 王五"

// bind 预置参数（柯里化）
const sayHi = greet.bind({ name: "赵六" }, "你好");
sayHi();  // "你好, 赵六"
\`\`\`

### this 丢失的常见场景与修复

#### 场景 1：回调丢失

\`\`\`ts
class Timer {
  private count = 0;
  start() {
    // ❌ 普通回调：this 丢失
    setInterval(function () { this.count++; }, 1000);
    // ✅ 箭头函数：捕获 this
    setInterval(() => { this.count++; }, 1000);
  }
}
\`\`\`

#### 场景 2：解构/赋值丢失

\`\`\`ts
const obj = { name: "张三", greet() { return this.name; } };
const fn = obj.greet;
fn();  // ❌ this 丢失

// 修复 1：bind
const bound = obj.greet.bind(obj);
bound();  // ✅

// 修复 2：箭头包装
const wrapped = () => obj.greet();
wrapped();  // ✅
\`\`\`

#### 场景 3：事件处理器

\`\`\`ts
class Button {
  constructor() {
    // ❌ this 丢失
    element.addEventListener("click", this.onClick);
    // ✅ 箭头函数 / 构造函数中 bind
    element.addEventListener("click", () => this.onClick());
    this.onClick = this.onClick.bind(this);  // 构造函数中统一 bind
  }
}
\`\`\`

### this 与类继承

子类方法中的 this 指向子类实例（最底层实例）。父类方法如果调用 \`this.method()\`，会调用子类覆盖的版本（多态）：

\`\`\`ts
class Animal {
  speak(): string { return this.sound(); }
  sound(): string { return "..."; }
}
class Dog extends Animal {
  sound(): string { return "汪汪"; }  // 覆盖
}
new Dog().speak();  // "汪汪"（this.sound() 调用 Dog 的版本）
\`\`\`

### this 与 getter/setter

getter/setter 中的 this 指向访问属性的对象实例：

\`\`\`ts
class Temperature {
  constructor(private _celsius: number) {}
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;  // this 指向实例
  }
  set fahrenheit(f: number) {
    this._celsius = (f - 32) * 5 / 9;
  }
}
\`\`\`

### 陷阱总结

1. **对象方法别用箭头函数**：this 不指向对象。
2. **回调用箭头函数**：避免 this 丢失。
3. **this 是调用时确定**：不是定义时（箭头函数例外）。
4. **隐式丢失最常见**：解构、赋值、回调都会触发。
5. **箭头 this 不可变**：call/apply/bind 对箭头无效。
6. **箭头不能 new**：没有 prototype，没有自己的 this。
7. **TS this 参数是编译期的**：运行时仍可能被破坏，但能在编写阶段发现。
8. **DOM 事件 this**：addEventListener 的回调 this 是元素，但箭头函数会"吃掉"它。

### 本节代码演示

下面综合演示：四种 this 绑定规则、箭头函数词法 this、this 丢失与三种修复方案、this 参数注解、ThisType 工具类型、类型安全的 bind。`,
    code: `// ============================================================
// 第三章代码演示：this 类型深入全景
// 注意：沙箱中 this 行为可能与严格模式/模块模式略有差异
// ============================================================

// ---- 1. 默认绑定（独立调用） ----
console.log("========== 1. 默认绑定 ==========");

function showThis() {
  // 独立调用：严格模式 this 是 undefined，非严格是 global
  // 沙箱中可能是 undefined 或 globalThis
  console.log("  独立调用的 this:", this === undefined ? "undefined" : (this === globalThis ? "globalThis" : String(this)));
}
showThis();

// ---- 2. 隐式绑定（方法调用） ----
console.log("\\n========== 2. 隐式绑定 ==========");

const user = {
  name: "张三",
  age: 28,
  // 方法调用：this 指向调用对象
  greet() {
    return "你好，我是 " + this.name;
  },
  getInfo() {
    return this.name + "，" + this.age + "岁";
  }
};

console.log("  user.greet():", user.greet());
console.log("  user.getInfo():", user.getInfo());

// ---- 3. 隐式丢失（经典陷阱） ----
console.log("\\n========== 3. 隐式丢失 ==========");

// 把方法取出来"裸调用"，this 丢失
const detached = user.greet;
console.log("  裸调用 detached()：");
try {
  const result = detached();
  console.log("    结果:", result);
} catch (e) {
  console.log("    抛错（this 丢失）:", (e as Error).message);
}

// 修复方案 1：bind 显式绑定
const bound = user.greet.bind(user);
console.log("  bind 修复:", bound());

// 修复方案 2：箭头函数包装
const wrapped = () => user.greet();
console.log("  箭头包装修复:", wrapped());

// 修复方案 3：call/apply 显式指定
console.log("  call 修复:", detached.call(user));
console.log("  apply 修复:", detached.apply(user));

// ---- 4. 显式绑定 call / apply / bind ----
console.log("\\n========== 4. 显式绑定 ==========");

function introduce(greeting: string, punctuation: string): string {
  return greeting + ", 我是 " + this.name + punctuation;
}

const person1 = { name: "张三" };
const person2 = { name: "李四" };

// call：this + 逐个参数
console.log("  call:", introduce.call(person1, "你好", "！"));
// apply：this + 参数数组
console.log("  apply:", introduce.apply(person2, ["嗨", "。"]));
// bind：返回 this 固定的新函数（不立即执行）
const boundIntroduce = introduce.bind(person1);
console.log("  bind 后调用:", boundIntroduce("早上好", "~"));

// bind 还能预置参数（偏应用/柯里化）
const sayHiToZhang = introduce.bind(person1, "你好");
console.log("  bind 预置参数:", sayHiToZhang("?"));

// ---- 5. new 绑定 ----
console.log("\\n========== 5. new 绑定 ==========");

// new 调用：this 指向新创建的对象
function Animal(name: string, sound: string) {
  this.name = name;
  this.sound = sound;
  this.speak = function () {
    return this.name + ": " + this.sound;
  };
}

const dog = new (Animal as any)("小狗", "汪汪");
const cat = new (Animal as any)("小猫", "喵喵");
console.log("  new Dog:", dog.speak());
console.log("  new Cat:", cat.speak());
console.log("  dog instanceof Animal:", dog instanceof Animal);

// ---- 6. 箭头函数的词法 this ----
console.log("\\n========== 6. 箭头函数词法 this ==========");

const counter = {
  count: 0,
  // 普通方法：this 动态绑定到 counter
  incrementRegular() {
    this.count++;
    return this.count;
  },
  // 箭头函数：没有自己的 this，继承外层
  // 在对象字面量中，外层是模块作用域，this 不指向 counter
  getArrowThis: () => {
    // 这里的 this 不指向 counter，而是外层作用域的 this
    return typeof this === "undefined" ? "undefined" : "外层 this";
  },
  // 正确用法：在普通方法内用箭头函数回调
  safeIncrement() {
    const inner = () => {
      this.count++;  // 箭头继承 safeIncrement 的 this = counter
      return this.count;
    };
    return inner();
  }
};

console.log("  普通方法 incrementRegular:", counter.incrementRegular());
console.log("  safeIncrement（内部箭头）:", counter.safeIncrement());
console.log("  对象内箭头函数 this:", counter.getArrowThis());

// ---- 7. 回调中 this 丢失与箭头函数修复 ----
console.log("\\n========== 7. 回调 this 修复 ==========");

class Timer {
  count: number = 0;
  private timerId: any = null;

  // ❌ 问题写法：普通函数回调，this 丢失
  startBad() {
    const self = this;  // 经典修复：保存 this 引用
    this.timerId = setTimeout(function () {
      self.count++;
      console.log("    [普通函数+self] count:", self.count);
    }, 20);
  }

  // ✅ 正确写法：箭头函数自动捕获 this
  startGood() {
    this.timerId = setTimeout(() => {
      this.count++;
      console.log("    [箭头函数] count:", this.count);
    }, 20);
  }

  stop() {
    if (this.timerId) clearTimeout(this.timerId);
  }
}

const timer = new Timer();
timer.startBad();
timer.startGood();

// ---- 8. TypeScript this 参数注解 ----
console.log("\\n========== 8. this 参数注解 ==========");

interface Box {
  value: number;
  show(this: Box): string;  // 约束 this 必须是 Box
  double(this: Box): number;
}

const box: Box = {
  value: 21,
  show(this: Box) {
    // this 类型是 Box，编译期就知道有 value
    return "值是 " + this.value;
  },
  double(this: Box) {
    return this.value * 2;
  }
};

console.log("  box.show():", box.show());
console.log("  box.double():", box.double());

// this 参数注解能防止"裸调用"导致的 this 丢失
const detachedShow = box.show;
try {
  // 运行时可能抛错或返回错误结果（this 丢失）
  const r = detachedShow();
  console.log("  裸调用结果（this 丢失）:", r);
} catch (e) {
  console.log("  裸调用抛错:", (e as Error).message);
}
// 用 bind 修复
console.log("  bind 后裸调用:", detachedShow.bind(box)());

// ---- 9. ThisType<T> 工具类型 ----
console.log("\\n========== 9. ThisType<T> ==========");

// ThisType 标注对象字面量方法的 this 类型
interface CounterInterface {
  count: number;
  increment(): void;
  decrement(): void;
  reset(): void;
  getValue(): number;
}

const counterObj: CounterInterface & ThisType<CounterInterface> = {
  count: 0,
  increment() {
    this.count++;  // this 类型是 CounterInterface
  },
  decrement() {
    this.count--;
  },
  reset() {
    this.count = 0;
  },
  getValue() {
    return this.count;
  }
};

counterObj.increment();
counterObj.increment();
counterObj.increment();
counterObj.decrement();
console.log("  ThisType 计数器:", counterObj.getValue());  // 2
counterObj.reset();
console.log("  reset 后:", counterObj.getValue());  // 0

// ---- 10. this 与类继承（多态） ----
console.log("\\n========== 10. this 与类继承 ==========");

class Shape {
  area(): number {
    return 0;
  }
  describe(): string {
    // this.area() 会调用子类覆盖的版本（多态）
    return this.constructor.name + " 面积 = " + this.area().toFixed(2);
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }
  area(): number {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(public width: number, public height: number) {
    super();
  }
  area(): number {
    return this.width * this.height;
  }
}

const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6)];
shapes.forEach((s) => console.log("  ", s.describe()));

// ---- 11. getter/setter 中的 this ----
console.log("\\n========== 11. getter/setter 中的 this ==========");

class Temperature {
  private _celsius: number;

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  get celsius(): number {
    return this._celsius;  // this 指向实例
  }
  set celsius(c: number) {
    this._celsius = c;
  }
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;
  }
  set fahrenheit(f: number) {
    this._celsius = (f - 32) * 5 / 9;
  }
}

const temp = new Temperature(100);
console.log("  100°C =", temp.fahrenheit, "°F");
temp.fahrenheit = 32;
console.log("  32°F =", temp.celsius.toFixed(2), "°C");

// ---- 12. 类型安全的 bind 实现 ----
console.log("\\n========== 12. 类型安全的 bind ==========");

// 自实现一个简易 bind，演示 this 绑定原理
function myBind<T, F extends (this: T, ...args: any[]) => any>(
  fn: F,
  thisArg: T
): (...args: any[]) => ReturnType<F> {
  return function (...args: any[]) {
    return fn.apply(thisArg, args);
  };
}

const greetFn = function (this: { name: string }, greeting: string) {
  return greeting + ", " + this.name;
};

const boundGreet = myBind(greetFn, { name: "王五" });
console.log("  myBind 结果:", boundGreet("你好"));

console.log("\\nthis 类型深入章节演示完成！");`,
  },

  // =========================================================
  // 第四章：函数进阶 (Advanced Functions)
  // =========================================================
  {
    id: "ts-functions-adv",
    title: "函数进阶",
    icon: "🔀",
    group: "核心补充",
    content: `## 函数进阶 (Advanced Functions)

函数是 JavaScript 的一等公民——可以赋值给变量、作为参数传递、作为返回值返回。这种特性让**函数式编程（Functional Programming, FP）**成为可能。函数式编程的核心思想是：用**纯函数**和**函数组合**来构建程序，避免共享状态和副作用，让代码更可预测、更可测试、更可复用。

本章将系统讲解柯里化、函数组合、偏应用、记忆化、防抖、节流、once 等高阶函数技术，以及在 TypeScript 中如何为这些函数写出精确的类型。掌握这些，你就能写出优雅、声明式、可复用的代码。

### 柯里化（Currying）

柯里化是把一个**接受多个参数的函数**，转换成**一系列接受单个参数的函数**的过程：

\`\`\`ts
// 普通函数：一次接受所有参数
function add(a: number, b: number, c: number): number {
  return a + b + c;
}
add(1, 2, 3);  // 6

// 柯里化后：逐个接受参数
function curriedAdd(a: number) {
  return function (b: number) {
    return function (c: number) {
      return a + b + c;
    };
  };
}
curriedAdd(1)(2)(3);  // 6
\`\`\`

#### 柯里化的价值

1. **参数复用**：固定部分参数，生成专用函数。
2. **延迟执行**：参数没给全时不执行。
3. **函数组合**：柯里化函数更容易组合。

\`\`\`ts
// 参数复用：固定 log 级别
const log = (level: string) => (msg: string) => console.log("[" + level + "]", msg);
const logInfo = log("INFO");
const logError = log("ERROR");
logInfo("启动完成");    // [INFO] 启动完成
logError("连接失败");   // [ERROR] 连接失败
\`\`\`

#### 通用柯里化函数

实现一个能自动柯里化任意函数的 \`curry\` 函数是经典面试题。关键是**递归**：如果参数够了就执行，否则返回一个继续收集参数的函数：

\`\`\`ts
function curry(fn: Function) {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn(...args);  // 参数够了，执行
    }
    return (...more: any[]) => curried(...args, ...more);  // 继续收集
  };
}
const sum = (a: number, b: number, c: number) => a + b + c;
const curriedSum = curry(sum);
curriedSum(1)(2)(3);     // 6
curriedSum(1, 2)(3);     // 6
curriedSum(1)(2, 3);     // 6
curriedSum(1, 2, 3);     // 6
\`\`\`

### 偏应用（Partial Application）

偏应用是"**预先固定部分参数**，返回一个接受剩余参数的函数"。与柯里化的区别：柯里化每次只接受一个参数，偏应用可以一次固定多个：

\`\`\`ts
function partial<T, R>(fn: (...args: T[]) => R, ...preset: T[]) {
  return (...rest: T[]) => fn(...preset, ...rest);
}

const multiply = (a: number, b: number, c: number) => a * b * c;
const doubleAndTriple = partial(multiply, 2, 3);  // 固定 a=2, b=3
doubleAndTriple(4);  // 24
\`\`\`

#### 柯里化 vs 偏应用

| 特性 | 柯里化 | 偏应用 |
| --- | --- | --- |
| **参数接受方式** | 每次一个 | 可一次多个 |
| **链式深度** | 等于参数个数 | 任意 |
| **典型形式** | f(a)(b)(c) | f(a, b)(c) |
| **目的** | 完全分解 | 固定部分参数 |

### 函数组合（Compose）

函数组合是把多个函数"**串联**"成一个新函数，前一个的输出是后一个的输入：

\`\`\`ts
const compose = (f, g) => x => f(g(x));

const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const addThenDouble = compose(double, addOne);  // double(addOne(x))
addThenDouble(3);  // double(4) = 8
\`\`\`

#### 多函数组合

\`\`\`ts
// 从右到左组合
function compose(...fns: Function[]) {
  return (x: any) => fns.reduceRight((acc, fn) => fn(acc), x);
}
// 从左到右组合（管道）
function pipe(...fns: Function[]) {
  return (x: any) => fns.reduce((acc, fn) => fn(acc), x);
}

const f = compose(double, addOne, x => x + 10);  // double(addOne(x+10))
f(0);  // double(addOne(10)) = double(11) = 22
\`\`\`

#### 组合的价值

组合让你把复杂逻辑拆成**小的、独立的、可测试的纯函数**，再像积木一样拼起来。这是函数式编程的核心思想——**用组合替代继承**。

### 管道（Pipe）

管道是组合的反方向版本（从左到右），更接近自然阅读顺序：

\`\`\`ts
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const pipeline = pipe(
  x => x + 1,      // 加 1
  x => x * 2,      // 乘 2
  x => x.toString  // 转字符串
);
pipeline(5);  // "12"
\`\`\`

JavaScript 有一个 **管道运算符提案** \`|>\`，能让管道写法更优雅：\`5 |> (+1) |> (*2) |> toString\`。目前处于 Stage 2，尚未标准化。

### 记忆化（Memoize）

记忆化是**缓存函数结果**，相同参数直接返回缓存值，避免重复计算。对纯函数（相同输入永远相同输出）特别有效：

\`\`\`ts
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

const slowFib = (n: number): number =>
  n < 2 ? n : slowFib(n - 1) + slowFib(n - 2);
const memoFib = memoize(slowFib);
memoFib(40);  // 第一次慢，后续秒回
\`\`\`

#### 记忆化的注意事项

1. **只对纯函数有效**：有副作用的函数不能记忆化。
2. **参数需可序列化**：对象参数用 JSON.stringify 可能丢信息。
3. **缓存会占用内存**：长期运行需考虑清理策略。
4. **递归函数需特殊处理**：递归调用也要走缓存才有效。

### 防抖（Debounce）

防抖是"**等停止触发一段时间后才执行**"。适用于：搜索框输入、窗口 resize、按钮防连点：

\`\`\`ts
function debounce(fn: Function, delay: number) {
  let timer: any = null;
  return (...args: any[]) => {
    clearTimeout(timer);  // 每次触发都清掉前一个定时器
    timer = setTimeout(() => fn(...args), delay);  // 重新计时
  };
}

// 用户连续输入，只有停止 500ms 后才搜索
const search = debounce(query => fetchResults(query), 500);
input.addEventListener("input", e => search(e.target.value));
\`\`\`

#### 防抖的变体

- **立即执行防抖**：第一次立即执行，后续在停止后才再次执行。
- **带取消功能的防抖**：提供 cancel 方法。

### 节流（Throttle）

节流是"**固定时间间隔内最多执行一次**"。适用于：滚动事件、鼠标移动、拖拽：

\`\`\`ts
function throttle(fn: Function, interval: number) {
  let lastTime = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
}

// 滚动时每 200ms 最多处理一次
const onScroll = throttle(() => updatePosition(), 200);
window.addEventListener("scroll", onScroll);
\`\`\`

#### 防抖 vs 节流

| 特性 | 防抖 | 节流 |
| --- | --- | --- |
| **触发频率** | 停止后才执行一次 | 固定间隔执行 |
| **适用场景** | 搜索输入、表单验证 | 滚动、拖拽、resize |
| **类比** | "等你说完我再回应" | "每秒最多回应一次" |

### once 函数

once 确保**函数只执行一次**，后续调用返回第一次的结果。适用于：初始化、单次弹窗、事件绑定：

\`\`\`ts
function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: any;
  return ((...args: any[]) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
}

const init = once(() => {
  console.log("初始化（只执行一次）");
  return Date.now();
});
init();  // 执行并返回时间戳
init();  // 不执行，返回上次结果
\`\`\`

### 函数式编程在 TS 中的实践

TypeScript 的类型系统让函数式编程更加安全：

1. **泛型高阶函数**：curry、compose、map、filter 都能精确推断类型。
2. **纯函数类型签名**：清晰的输入输出类型让副作用一目了然。
3. **不可变数据**：用 \`readonly\` 和 \`ReadonlyArray\` 强制不可变。

\`\`\`ts
// 类型安全的 compose
function compose<A, B, C>(f: (x: B) => C, g: (x: A) => B): (x: A) => C {
  return x => f(g(x));
}
const addOne = (x: number) => x + 1;
const toString = (x: number) => String(x);
const fn = compose(toString, addOne);  // (x: number) => string
\`\`\`

### 陷阱总结

1. **柯里化丢失 this**：柯里化函数的 this 可能不对，必要时 bind。
2. **memoize 的 key 碰撞**：JSON.stringify 对不同对象可能相同。
3. **debounce 的 leading/trailing**：注意是"停止后执行"还是"立即执行+停止后补一次"。
4. **throttle 的边界**：第一次立即执行还是等第一个间隔。
5. **箭头函数不能 new**：高阶函数返回箭头函数时注意。
6. **compose 从右到左**：\`compose(f, g)(x) = f(g(x))\`，顺序易搞反。
7. **纯函数要求**：memoize、compose 都假设纯函数，有副作用会出问题。

### 本节代码演示

下面综合演示：类型安全的柯里化、偏应用、compose、pipe、memoize（含递归斐波那契）、debounce、throttle、once。所有定时器用极短延时确保 5 秒内完成。`,
    code: `// ============================================================
// 第四章代码演示：函数进阶全景
// 所有定时器使用极短延时确保 5 秒超时内完成
// ============================================================

// ---- 1. 柯里化 Currying ----
console.log("========== 1. 柯里化 ==========");

// 手动柯里化：逐个接受参数
function curriedAdd(a: number) {
  return function (b: number) {
    return function (c: number) {
      return a + b + c;
    };
  };
}
console.log("  手动柯里化 curriedAdd(1)(2)(3):", curriedAdd(1)(2)(3));

// 参数复用：固定部分参数生成专用函数
function curriedLog(level: string) {
  return function (msg: string) {
    return "[" + level + "] " + msg;
  };
}
const logInfo = curriedLog("INFO");
const logError = curriedLog("ERROR");
console.log("  ", logInfo("启动完成"));
console.log("  ", logError("连接失败"));

// 通用柯里化函数：递归收集参数
function curry<T extends (...args: any[]) => any>(fn: T): any {
  return function curried(...args: any[]): any {
    // 参数够了就执行
    if (args.length >= fn.length) {
      return fn(...args);
    }
    // 参数不够，返回继续收集的函数
    return (...more: any[]) => curried(...args, ...more);
  };
}

const sum3 = (a: number, b: number, c: number) => a + b + c;
const curriedSum = curry(sum3);
console.log("  通用柯里化 (1)(2)(3):", curriedSum(1)(2)(3));
console.log("  通用柯里化 (1,2)(3):", curriedSum(1, 2)(3));
console.log("  通用柯里化 (1)(2,3):", curriedSum(1)(2, 3));
console.log("  通用柯里化 (1,2,3):", curriedSum(1, 2, 3));

// ---- 2. 偏应用 Partial Application ----
console.log("\\n========== 2. 偏应用 ==========");

// 偏应用：一次固定多个参数
function partial<T extends (...args: any[]) => any>(fn: T, ...preset: any[]): (...args: any[]) => any {
  return (...rest: any[]) => fn(...preset, ...rest);
}

const multiply3 = (a: number, b: number, c: number) => a * b * c;
const doubleAndTriple = partial(multiply3, 2, 3);  // 固定 a=2, b=3
console.log("  偏应用 multiply(2,3,4):", doubleAndTriple(4));  // 24

// 偏应用实战：创建预设的 ajax 请求
function ajax(method: string, url: string, data: any): string {
  return method + " " + url + " " + JSON.stringify(data);
}
const get = partial(ajax, "GET");
const post = partial(ajax, "POST");
console.log("  ", get("/api/users", { page: 1 }));
console.log("  ", post("/api/login", { user: "admin" }));

// ---- 3. 函数组合 Compose ----
console.log("\\n========== 3. 函数组合 Compose ==========");

// 类型安全的双函数组合：compose(f, g)(x) = f(g(x))
function compose2<A, B, C>(f: (x: B) => C, g: (x: A) => B): (x: A) => C {
  return (x: A) => f(g(x));
}

const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const numToStr = (x: number) => "结果=" + x;

// double(addOne(3)) = double(4) = 8
const addThenDouble = compose2(double, addOne);
console.log("  compose(double, addOne)(3):", addThenDouble(3));

// 多函数组合：从右到左
function composeMany(...fns: Array<(x: any) => any>): (x: any) => any {
  return (x: any) => fns.reduceRight((acc, fn) => fn(acc), x);
}

const pipeline1 = composeMany(numToStr, double, addOne, (x: number) => x + 10);
// 执行顺序：(x+10) → addOne → double → numToStr
console.log("  多函数组合 compose(str,double,add1,add10)(0):", pipeline1(0));

// ---- 4. 管道 Pipe ----
console.log("\\n========== 4. 管道 Pipe ==========");

// 管道：从左到右执行（更符合阅读顺序）
function pipe(...fns: Array<(x: any) => any>): (x: any) => any {
  return (x: any) => fns.reduce((acc, fn) => fn(acc), x);
}

const pipeline2 = pipe(
  (x: number) => x + 10,    // 0 → 10
  addOne,                    // 10 → 11
  double,                    // 11 → 22
  numToStr                   // 22 → "结果=22"
);
console.log("  pipe(add10, add1, double, str)(0):", pipeline2(0));

// 管道实战：数据处理管道
const processData = pipe(
  (data: number[]) => data.filter((n) => n > 0),    // 过滤正数
  (data: number[]) => data.map((n) => n * 2),       // 翻倍
  (data: number[]) => data.reduce((a, b) => a + b, 0), // 求和
  (sum: number) => "总和=" + sum
);
console.log("  数据管道:", processData([-1, 2, -3, 4, 5]));  // (2*2 + 4*2 + 5*2) = 22

// ---- 5. 记忆化 Memoize ----
console.log("\\n========== 5. 记忆化 Memoize ==========");

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>();
  let callCount = 0;
  let cacheHitCount = 0;
  const wrapped = ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      cacheHitCount++;
      return cache.get(key);
    }
    callCount++;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
  (wrapped as any).stats = () => ({ 实际计算: callCount, 缓存命中: cacheHitCount, 缓存大小: cache.size });
  return wrapped;
}

// 普通函数记忆化
function slowSquare(n: number): number {
  // 模拟耗时计算
  let result = 0;
  for (let i = 0; i < n * 1000; i++) result += i;
  return n * n;
}
const memoSquare = memoize(slowSquare);
console.log("  memoSquare(5):", memoSquare(5));
console.log("  memoSquare(5) 再次:", memoSquare(5), "（缓存命中）");
console.log("  memoSquare(6):", memoSquare(6));
console.log("  缓存统计:", (memoSquare as any).stats());

// 递归斐波那契 + 记忆化（关键：递归调用也要走缓存）
function memoFib(n: number): number {
  if (n < 2) return n;
  return memoFib(n - 1) + memoFib(n - 2);
}
// 注意：直接 memoize(memoFib) 递归调用不会走缓存
// 需要先把递归函数赋给变量再 memoize
const fibImpl = (n: number): number => n < 2 ? n : fibMemo(n - 1) + fibMemo(n - 2);
const fibMemo = memoize(fibImpl);
console.log("  memoFib(30):", fibMemo(30));
console.log("  fib 缓存统计:", (fibMemo as any).stats());

// ---- 6. 防抖 Debounce ----
console.log("\\n========== 6. 防抖 ==========");

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T & { cancel: () => void } {
  let timer: any = null;
  const debounced = (...args: any[]) => {
    if (timer) clearTimeout(timer);  // 清掉前一个
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
  (debounced as any).cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced as T & { cancel: () => void };
}

let debounceCallCount = 0;
const debouncedLog = debounce((msg: string) => {
  debounceCallCount++;
  console.log("    [防抖执行] " + msg + " (第" + debounceCallCount + "次)");
}, 30);

// 模拟连续快速调用（只有最后一次会执行）
console.log("  连续调用 5 次（间隔 10ms），只有最后一次会执行：");
debouncedLog("调用1");
setTimeout(() => debouncedLog("调用2"), 10);
setTimeout(() => debouncedLog("调用3"), 20);
setTimeout(() => debouncedLog("调用4"), 30);
setTimeout(() => debouncedLog("调用5(最终)"), 40);

// ---- 7. 节流 Throttle ----
console.log("\\n========== 7. 节流 ==========");

function throttle<T extends (...args: any[]) => any>(fn: T, interval: number): T & { cancel: () => void } {
  let lastTime = 0;
  let timer: any = null;
  const throttled = (...args: any[]) => {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    if (remaining <= 0) {
      // 间隔已过，立即执行
      if (timer) { clearTimeout(timer); timer = null; }
      lastTime = now;
      fn(...args);
    } else if (!timer) {
      // 安排最后一次执行（trailing 调用）
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
  (throttled as any).cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    lastTime = 0;
  };
  return throttled as T & { cancel: () => void };
}

let throttleCallCount = 0;
const throttledLog = throttle((msg: string) => {
  throttleCallCount++;
  console.log("    [节流执行] " + msg + " (第" + throttleCallCount + "次)");
}, 50);

// 模拟高频调用（50ms 间隔内最多执行一次）
console.log("  高频调用（50ms 间隔）：");
throttledLog("t=0");
setTimeout(() => throttledLog("t=10"), 10);
setTimeout(() => throttledLog("t=20"), 20);
setTimeout(() => throttledLog("t=60"), 60);
setTimeout(() => throttledLog("t=70"), 70);

// ---- 8. once 函数 ----
console.log("\\n========== 8. once 函数 ==========");

function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: any;
  const wrapped = ((...args: any[]) => {
    if (!called) {
      called = true;
      result = fn(...args);
      console.log("    [once] 首次执行");
    }
    return result;
  }) as T;
  return wrapped;
}

const init = once(() => {
  console.log("    初始化中...");
  return { status: "initialized", time: Date.now() };
});

console.log("  第一次调用:");
const r1 = init();
console.log("    返回:", JSON.stringify(r1));
console.log("  第二次调用（不执行）:");
const r2 = init();
console.log("    返回:", JSON.stringify(r2), r1 === r2 ? "(同一对象)" : "(不同)");

// ---- 9. 综合：函数式数据处理 ----
console.log("\\n========== 9. 综合：函数式数据处理 ==========");

// 用 compose/pipe 构建数据处理管道
const users = [
  { name: "张三", age: 28, salary: 15000 },
  { name: "李四", age: 35, salary: 25000 },
  { name: "王五", age: 22, salary: 8000 },
  { name: "赵六", age: 40, salary: 35000 },
  { name: "孙七", age: 30, salary: 18000 }
];

const analyze = pipe(
  (arr: typeof users) => arr.filter((u) => u.age >= 25),           // 过滤年龄>=25
  (arr: typeof users) => arr.map((u) => ({ ...u, tax: u.salary * 0.1 })),  // 加税
  (arr: any[]) => ({
    count: arr.length,
    totalSalary: arr.reduce((s, u) => s + u.salary, 0),
    totalTax: arr.reduce((s, u) => s + u.tax, 0),
    avgSalary: Math.round(arr.reduce((s, u) => s + u.salary, 0) / arr.length)
  })
);

const report = analyze(users);
console.log("  数据分析结果:");
console.log("    人数:", report.count);
console.log("    总工资:", report.totalSalary);
console.log("    总税额:", report.totalTax);
console.log("    平均工资:", report.avgSalary);

console.log("\\n函数进阶章节演示完成！");`,
  },

  // =========================================================
  // 第五章：类进阶 (Advanced Classes)
  // =========================================================
  {
    id: "ts-classes-adv",
    title: "类进阶",
    icon: "🏗️",
    group: "核心补充",
    content: `## 类进阶 (Advanced Classes)

类（Class）不仅是创建对象的模板，更是**设计模式**的载体。本章在前面的"类"基础之上，深入探讨 Mixin 混入模式、设计模式（单例/工厂/建造者）、私有字段的两种实现、Symbol 作为属性键、类表达式、静态初始化块等进阶主题。掌握这些，你就能用类构建出灵活、可扩展、符合工程化要求的代码架构。

### 混入模式（Mixin）

JavaScript 是**单继承**语言（一个类只能 extends 一个父类），但有时我们希望一个类同时具备多种"能力"。**Mixin 模式**通过"把方法复制到类上"实现多重复用：

\`\`\`ts
// 定义几个"能力"对象
const Serializable = {
  serialize() { return JSON.stringify(this); }
};
const Comparable = {
  equals(other: any) { return JSON.stringify(this) === JSON.stringify(other); }
};

// 用 mixin 函数把能力混入类
function applyMixins(target: any, sources: any[]) {
  sources.forEach(source => {
    Object.getOwnPropertyNames(source).forEach(name => {
      target.prototype[name] = source[name];
    });
  });
}

class User { constructor(public name: string) {} }
applyMixins(User, [Serializable, Comparable]);
// User 现在既有 serialize 又有 equals
\`\`\`

#### Mixin 的本质

Mixin 不是继承，而是**方法复制**。\`applyMixins\` 把源对象的方法**逐个复制**到目标类的 prototype 上。运行时 \`instance instanceof Serializable\` 为 false（没有继承关系），但方法可用。

#### TypeScript 中的 Mixin 类型

TypeScript 用**交叉类型**描述混入后的类类型：

\`\`\`ts
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin 工厂：接收一个类，返回扩展后的类
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
  };
}

class Entity { constructor(public id: number) {} }
const TimestampedEntity = Timestamped(Entity);
const e = new TimestampedEntity(1);  // 有 id 和 timestamp
\`\`\`

这种"类工厂"式 Mixin 是 TypeScript 推荐的写法，有完整类型支持。

### 抽象类与接口的配合

**抽象类**用 \`abstract\` 定义不能被实例化、只能被继承的类。抽象方法只有签名没有实现，由子类实现：

\`\`\`ts
abstract class Animal {
  abstract sound(): string;  // 抽象方法，子类必须实现
  breathe() { console.log("呼吸..."); }  // 具体方法，子类直接继承
}

class Dog extends Animal {
  sound() { return "汪汪"; }  // 必须实现
}
// new Animal();  // ❌ 抽象类不能实例化
new Dog().sound();  // "汪汪"
\`\`\`

#### 抽象类 vs 接口

| 特性 | 抽象类 | 接口 |
| --- | --- | --- |
| **能实例化** | 否 | 否（不是类） |
| **能有实现** | 能（具体方法） | 否（只描述结构） |
| **多继承** | 否（单继承） | 能（implements 多个） |
| **运行时存在** | 是（编译成函数） | 否（类型擦除） |
| **适合** | 共享代码+强制契约 | 描述结构、多态契约 |

**经验法则**：要共享实现用抽象类，只描述结构用接口。可以"抽象类 implements 接口"组合使用。

### 单例模式（Singleton）

单例确保**一个类只有一个实例**，并提供全局访问点。常用于：配置管理、数据库连接池、日志器：

\`\`\`ts
class Config {
  private static instance: Config;
  private constructor() {}  // 私有构造函数，外部不能 new

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}
const c1 = Config.getInstance();
const c2 = Config.getInstance();
console.log(c1 === c2);  // true，同一个实例
\`\`\`

#### 单例的关键

1. **私有构造函数**：阻止外部 new。
2. **静态实例引用**：保存唯一实例。
3. **静态获取方法**：提供全局访问，惰性创建。

### 工厂模式（Factory）

工厂模式用一个函数/类来**封装对象的创建**，把"创建哪种对象"的逻辑集中管理，调用方不直接 new：

\`\`\`ts
abstract class Animal { abstract speak(): string; }
class Dog extends Animal { speak() { return "汪"; } }
class Cat extends Animal { speak() { return "喵"; } }

class AnimalFactory {
  static create(type: "dog" | "cat"): Animal {
    switch (type) {
      case "dog": return new Dog();
      case "cat": return new Cat();
    }
  }
}
const pet = AnimalFactory.create("dog");  // 不用关心怎么 new
\`\`\`

工厂模式的价值：**解耦**创建和使用。新增类型只改工厂，调用方不变。

### 建造者模式（Builder）

建造者模式用于**逐步构建复杂对象**，把构造过程拆成多个步骤，避免"参数爆炸"的构造函数：

\`\`\`ts
class Burger {
  constructor(
    public size: number,
    public cheese?: boolean,
    public bacon?: boolean,
    public lettuce?: boolean
  ) {}
}

class BurgerBuilder {
  private burger: Burger;
  constructor(size: number) {
    this.burger = new Burger(size);
  }
  addCheese() { this.burger.cheese = true; return this; }  // 返回 this 支持链式
  addBacon() { this.burger.bacon = true; return this; }
  addLettuce() { this.burger.lettuce = true; return this; }
  build() { return this.burger; }
}

const burger = new BurgerBuilder(14)
  .addCheese()
  .addBacon()
  .build();  // 链式调用
\`\`\`

建造者的关键：**方法返回 this** 实现链式调用，最后 \`build()\` 返回成品。

### 类与原型链

JavaScript 的类本质是**原型链的语法糖**。理解原型链能看透类的底层行为：

\`\`\`ts
class Animal {
  constructor(name) { this.name = name; }       // 实例属性
  speak() { return this.name; }                  // 原型方法（Animal.prototype.speak）
  static create() { return new Animal("默认"); } // 静态方法（Animal.create）
}

const a = new Animal("小狗");
a.name;           // 实例属性，在 a 自身上
a.speak();        // 原型方法，在 Animal.prototype 上
a.__proto__ === Animal.prototype;  // true
Animal.prototype.constructor === Animal;  // true
\`\`\`

| 概念 | 位置 | 访问方式 |
| --- | --- | --- |
| 实例属性 | 实例自身 (\`a\`) | \`a.name\` |
| 原型方法 | \`Class.prototype\` | \`a.method()\`（原型链查找） |
| 静态属性/方法 | 类自身 (\`Class\`) | \`Class.method()\` |

### Symbol 作为属性键

Symbol 是**唯一且不可变**的值，非常适合作为"私有"属性键（不被 for...in、Object.keys 枚举）：

\`\`\`ts
const privateKey = Symbol("private");

class MyClass {
  [privateKey] = "secret";  // Symbol 键属性
  publicData = "public";
}
const obj = new MyClass();
Object.keys(obj);        // ["publicData"]，Symbol 键不出现
Object.getOwnPropertySymbols(obj);  // [Symbol(private)]，需主动获取
\`\`\`

Symbol 键不是真正的私有（能通过 getOwnPropertySymbols 获取），但能避免意外访问和枚举污染。真正的私有用 \`#field\`。

### 私有字段 #field vs private

TypeScript 有**两种**私有机制：

#### 1. private 关键字（TypeScript 特有）

\`\`\`ts
class A {
  private secret: string = "ts-private";  // 编译期私有
}
\`\`\`

\`private\` 是**编译期**检查，运行时无保护——编译成 JS 后属性是普通的，可访问。且跨实例访问允许（同类的两个实例能互访 private）。

#### 2. # 私有字段（ES2022 标准）

\`\`\`ts
class B {
  #secret: string = "es-private";  // 运行时私有
  getSecret() { return this.#secret; }
}
new B().#secret;  // ❌ 运行时也报错（SyntaxError）
\`\`\`

\`#field\` 是**运行时**强制的私有，外部无法访问，跨实例同类可访问。

| 特性 | private 关键字 | # 私有字段 |
| --- | --- | --- |
| **检查时机** | 编译期 | 编译期 + 运行时 |
| **运行时保护** | 无 | 有 |
| **跨实例访问** | 允许 | 允许（同类） |
| **标准** | TS 扩展 | ES2022 标准 |
| **兼容性** | 好（编译成普通属性） | 需新运行时 |

**推荐**：新项目用 \`#field\`（真正的私有），老项目或需兼容性用 \`private\`。

### 类表达式与立即执行类

类也可以用表达式定义，甚至立即执行：

\`\`\`ts
// 类表达式
const MyClass = class {
  greet() { return "hi"; }
};

// 立即执行的类（IIFE 风格）
const singleton = new (class {
  constructor() { this.time = Date.now(); }
})();
\`\`\`

立即执行类常用于创建**单例**，避免单独的 getInstance 方法。

### 静态初始化块（Static Initialization Block）

ES2022 引入的 \`static { }\` 块，用于**复杂的静态成员初始化**：

\`\`\`ts
class Config {
  static settings: Record<string, any>;
  static {
    // 复杂的初始化逻辑
    this.settings = { env: "production", debug: false };
    // 可以有 try/catch、条件判断等
  }
}
\`\`\`

静态初始化块在类加载时执行一次，比分散的静态属性赋值更灵活（能用 if/try 等控制流）。

### 陷阱总结

1. **Mixin 不建立继承关系**：instanceof 不成立，只是方法复制。
2. **abstract 不能实例化**：只能继承。
3. **单例的测试困难**：全局状态难隔离，测试间需重置。
4. **#field 与 private 不互通**：\`private #x\` 是错误的，二选一。
5. **#field 不能在类外访问**：即使子类也不行（用 protected 模拟）。
6. **静态方法 this 指向类**：不是实例。
7. **类不会提升**：先定义后使用（与 function 声明不同）。
8. **extends 只能单继承**：要多种能力用 Mixin。

### 本节代码演示

下面综合演示：Mixin 函数与类工厂 Mixin、抽象类、单例模式、工厂模式、建造者模式、Symbol 私有属性、# 私有字段、类表达式、静态初始化块。`,
    code: `// ============================================================
// 第五章代码演示：类进阶全景
// ============================================================

// ---- 1. Mixin 模式：方法复制 ----
console.log("========== 1. Mixin 模式 ==========");

// 定义几个"能力"对象
const Serializable = {
  serialize(): string {
    return JSON.stringify(this);
  }
};

const Cloneable = {
  clone(): any {
    return JSON.parse(JSON.stringify(this));
  }
};

const Loggable = {
  log(): string {
    return "[Log] " + JSON.stringify(this);
  }
};

// Mixin 函数：把源对象的方法复制到目标类的原型
function applyMixins(target: any, sources: any[]): void {
  sources.forEach((source) => {
    Object.getOwnPropertyNames(source).forEach((name) => {
      if (name !== "constructor") {
        target.prototype[name] = source[name];
      }
    });
  });
}

class Product {
  constructor(public id: number, public name: string, public price: number) {}
}

// 混入三种能力
applyMixins(Product, [Serializable, Cloneable, Loggable]);

const product = new Product(1, "TypeScript 书", 99.8);
console.log("  serialize:", product.serialize());
console.log("  log:", product.log());
const cloned = product.clone();
cloned.name = "克隆书";
console.log("  clone 后原对象:", product.name, "克隆对象:", cloned.name);

// ---- 2. 类工厂式 Mixin（TypeScript 推荐） ----
console.log("\\n========== 2. 类工厂 Mixin ==========");

// Constructor 类型：表示一个可 new 的类
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin 工厂：给类增加 timestamp 能力
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp: number = Date.now();
    getAge(): number {
      return Date.now() - this.timestamp;
    }
  };
}

// Mixin 工厂：增加版本号
function Versioned<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    version: number = 1;
    bumpVersion(): number {
      return ++this.version;
    }
  };
}

// 基础类
class Article {
  constructor(public title: string, public content: string) {}
}

// 链式应用多个 Mixin
const EnhancedArticle = Versioned(Timestamped(Article));

const article = new EnhancedArticle("TS 教程", "类进阶...");
console.log("  title:", article.title);
console.log("  timestamp:", article.timestamp);
console.log("  version:", article.version);
console.log("  bumpVersion:", article.bumpVersion());
console.log("  getAge:", article.getAge(), "ms");

// ---- 3. 抽象类 ----
console.log("\\n========== 3. 抽象类 ==========");

abstract class Shape {
  constructor(public name: string) {}

  // 抽象方法：子类必须实现
  abstract area(): number;
  abstract perimeter(): number;

  // 具体方法：子类直接继承
  describe(): string {
    return this.name + " 面积=" + this.area().toFixed(2) + " 周长=" + this.perimeter().toFixed(2);
  }
}

class CircleShape extends Shape {
  constructor(public radius: number) {
    super("圆形");
  }
  area(): number { return Math.PI * this.radius ** 2; }
  perimeter(): number { return 2 * Math.PI * this.radius; }
}

class RectShape extends Shape {
  constructor(public width: number, public height: number) {
    super("矩形");
  }
  area(): number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }
}

const shapes: Shape[] = [new CircleShape(5), new RectShape(4, 6)];
shapes.forEach((s) => console.log("  ", s.describe()));

// ---- 4. 单例模式 ----
console.log("\\n========== 4. 单例模式 ==========");

class AppConfig {
  private static instance: AppConfig;

  // 私有构造函数：外部不能 new
  private constructor(public settings: Record<string, any> = {}) {}

  // 静态获取方法：惰性创建
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig({ env: "production", debug: false });
    }
    return AppConfig.instance;
  }

  set(key: string, value: any): void {
    this.settings[key] = value;
  }
  get(key: string): any {
    return this.settings[key];
  }
}

const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();
console.log("  config1 === config2:", config1 === config2);  // true
config1.set("port", 3000);
console.log("  config2.get('port'):", config2.get("port"));  // 3000（共享状态）

// ---- 5. 工厂模式 ----
console.log("\\n========== 5. 工厂模式 ==========");

interface Vehicle {
  type: string;
  drive(): string;
}

class Car implements Vehicle {
  type = "汽车";
  drive(): string { return "汽车在公路上行驶"; }
}

class Bike implements Vehicle {
  type = "自行车";
  drive(): string { return "自行车在小路上骑行"; }
}

class Truck implements Vehicle {
  type = "卡车";
  drive(): string { return "卡车在高速上轰鸣"; }
}

// 工厂类：封装创建逻辑
class VehicleFactory {
  static create(type: "car" | "bike" | "truck"): Vehicle {
    switch (type) {
      case "car": return new Car();
      case "bike": return new Bike();
      case "truck": return new Truck();
      default: throw new Error("未知类型: " + type);
    }
  }
}

// 调用方不关心怎么 new，只需指定类型
const vehicles = [
  VehicleFactory.create("car"),
  VehicleFactory.create("bike"),
  VehicleFactory.create("truck")
];
vehicles.forEach((v) => console.log("  " + v.type + ": " + v.drive()));

// ---- 6. 建造者模式 ----
console.log("\\n========== 6. 建造者模式 ==========");

class Computer {
  // 各部件都有默认值
  cpu: string = "i5";
  ram: number = 8;
  storage: string = "512GB SSD";
  gpu?: string;
  monitor?: string;

  describe(): string {
    const parts = [this.cpu, this.ram + "GB", this.storage];
    if (this.gpu) parts.push(this.gpu);
    if (this.monitor) parts.push(this.monitor);
    return "电脑: " + parts.join(" + ");
  }
}

class ComputerBuilder {
  private computer: Computer = new Computer();

  setCpu(cpu: string): this {
    this.computer.cpu = cpu;
    return this;  // 返回 this 支持链式
  }
  setRam(ram: number): this {
    this.computer.ram = ram;
    return this;
  }
  setStorage(storage: string): this {
    this.computer.storage = storage;
    return this;
  }
  setGpu(gpu: string): this {
    this.computer.gpu = gpu;
    return this;
  }
  setMonitor(monitor: string): this {
    this.computer.monitor = monitor;
    return this;
  }
  build(): Computer {
    return this.computer;
  }
}

// 链式调用逐步构建
const gamingPC = new ComputerBuilder()
  .setCpu("i9")
  .setRam(32)
  .setStorage("2TB NVMe")
  .setGpu("RTX 4080")
  .setMonitor("4K 显示器")
  .build();

const officePC = new ComputerBuilder()
  .setCpu("i3")
  .setRam(16)
  .build();

console.log("  ", gamingPC.describe());
console.log("  ", officePC.describe());

// ---- 7. Symbol 作为属性键 ----
console.log("\\n========== 7. Symbol 属性键 ==========");

// Symbol 是唯一且不可变的，适合做"半私有"键
const internalId = Symbol("internalId");
const cacheKey = Symbol("cache");

class UserAccount {
  public name: string;
  [internalId]: number;  // Symbol 键属性
  [cacheKey]: Map<string, any> = new Map();

  constructor(name: string, id: number) {
    this.name = name;
    this[internalId] = id;
  }

  getInternalId(): number {
    return this[internalId];
  }

  cacheSet(key: string, value: any): void {
    this[cacheKey].set(key, value);
  }
  cacheGet(key: string): any {
    return this[cacheKey].get(key);
  }
}

const account = new UserAccount("张三", 10086);
console.log("  name:", account.name);
console.log("  internalId:", account.getInternalId());

// Symbol 键不出现在普通枚举中
console.log("  Object.keys:", Object.keys(account));  // 只有 name
console.log("  Object.getOwnPropertyNames:", Object.getOwnPropertyNames(account));
console.log("  Object.getOwnPropertySymbols:", Object.getOwnPropertySymbols(account).map(s => s.toString()));

account.cacheSet("lastLogin", "2024-01-01");
console.log("  cacheGet:", account.cacheGet("lastLogin"));

// ---- 8. # 私有字段（ES2022） ----
console.log("\\n========== 8. # 私有字段 ==========");

class BankAccount {
  #balance: number;  // 运行时私有字段
  public readonly owner: string;

  constructor(owner: string, initialBalance: number) {
    this.owner = owner;
    this.#balance = initialBalance;
  }

  // 只能通过方法访问私有字段
  getBalance(): number {
    return this.#balance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("存款必须为正");
    this.#balance += amount;
  }

  withdraw(amount: number): void {
    if (amount > this.#balance) throw new Error("余额不足");
    this.#balance -= amount;
  }

  // 跨实例访问：同类实例可以访问彼此的 # 私有字段
  transferTo(other: BankAccount, amount: number): void {
    this.withdraw(amount);
    other.#balance += amount;  // ✅ 同类可访问
  }
}

const acc1 = new BankAccount("张三", 1000);
const acc2 = new BankAccount("李四", 500);

console.log("  初始余额 - 张三:", acc1.getBalance(), "李四:", acc2.getBalance());
acc1.deposit(500);
console.log("  张三存 500 后:", acc1.getBalance());
acc1.transferTo(acc2, 300);
console.log("  转账 300 后 - 张三:", acc1.getBalance(), "李四:", acc2.getBalance());

// acc1.#balance;  // ❌ 语法错误：外部不能访问
// console.log(Object.keys(acc1));  // 不会出现 #balance

// ---- 9. 类表达式与立即执行类 ----
console.log("\\n========== 9. 类表达式与立即执行类 ==========");

// 类表达式：赋值给变量
const Greeter = class {
  constructor(public target: string) {}
  greet(): string {
    return "Hello, " + this.target + "!";
  }
};
console.log("  类表达式:", new Greeter("World").greet());

// 立即执行的类（创建单例）
const logger = new (class {
  private logs: string[] = [];
  log(msg: string): void {
    this.logs.push(msg);
    console.log("    [LOG] " + msg);
  }
  count(): number {
    return this.logs.length;
  }
})();

logger.log("系统启动");
logger.log("加载配置");
console.log("  日志数量:", logger.count());

// ---- 10. 静态初始化块 ----
console.log("\\n========== 10. 静态初始化块 ==========");

class Environment {
  static config: Record<string, string>;
  static initialized: boolean;

  // 静态初始化块：类加载时执行一次
  static {
    // 可以有复杂逻辑（try/catch、条件等）
    Environment.config = {
      version: "1.0.0",
      mode: "production"
    };
    Environment.initialized = true;
    console.log("    [静态块] Environment 已初始化");
  }

  static getInfo(): string {
    return JSON.stringify(Environment.config);
  }
}

console.log("  Environment.config:", Environment.getInfo());
console.log("  initialized:", Environment.initialized);

// ---- 11. 原型链验证 ----
console.log("\\n========== 11. 原型链验证 ==========");

class Person {
  constructor(public name: string) {}
  greet(): string { return "Hi, " + this.name; }
  static create(): Person { return new Person("默认"); }
}

const person = new Person("张三");
console.log("  person.name（实例属性）:", person.name);
console.log("  person.greet()（原型方法）:", person.greet());
console.log("  Person.create()（静态方法）:", Person.create().name);
console.log("  person.__proto__ === Person.prototype:", Object.getPrototypeOf(person) === Person.prototype);
console.log("  Person.prototype.constructor === Person:", Person.prototype.constructor === Person);
console.log("  person instanceof Person:", person instanceof Person);

console.log("\\n类进阶章节演示完成！");`,
  },

  // =========================================================
  // 第六章：错误处理 (Error Handling)
  // =========================================================
  {
    id: "ts-error-handling",
    title: "错误处理",
    icon: "❌",
    group: "核心补充",
    content: `## 错误处理 (Error Handling)

错误处理是软件工程中最容易被忽视、却最影响系统可靠性的部分。一个不处理错误的程序，在生产环境中会以各种神秘方式崩溃。TypeScript 提供了比 JavaScript 更强的错误处理能力——\`catch\` 变量的 \`unknown\` 类型、\`asserts\` 断言函数、\`never\` 类型与穷尽检查、Result 类型模式——让错误处理既安全又优雅。

本章将系统讲解 Error 对象、自定义 Error 子类、try/catch/finally 的类型安全、Result 类型（函数式错误处理）、断言函数、never 与不可达代码、错误层次结构设计、错误边界概念。

### Error 对象

JavaScript 中所有错误都继承自 \`Error\`。抛出错误用 \`throw\`，错误可以是任何值（但**强烈建议抛 Error 对象**）：

\`\`\`ts
const err = new Error("出错了");
err.message;  // "出错了"
err.name;     // "Error"
err.stack;    // 调用栈（非标准但普遍支持）

throw new Error("something wrong");
throw "字符串错误";  // 不推荐
throw { code: 500 };  // 不推荐
\`\`\`

#### 内置 Error 子类

| 类型 | 说明 |
| --- | --- |
| \`Error\` | 基类 |
| \`TypeError\` | 类型错误（如调用 undefined 的方法） |
| \`RangeError\` | 范围错误（如无效数组长度） |
| \`SyntaxError\` | 语法错误（如 JSON.parse 失败） |
| \`ReferenceError\` | 引用未定义变量 |
| \`URIError\` | URI 处理错误 |

### 自定义 Error 子类

创建自定义 Error 子类，让错误能被精确识别和处理：

\`\`\`ts
class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AppError";  // 重要：设置 name
  }
}

class ValidationError extends AppError {
  constructor(message: string, public field: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

throw new ValidationError("邮箱格式错误", "email");
\`\`\`

#### 自定义 Error 的关键点

1. **extends Error**：保留 stack 等特性。
2. **调用 super(message)**：初始化父类。
3. **设置 this.name**：默认是 "Error"，改成子类名便于识别。
4. **添加业务字段**：code、field、statusCode 等结构化信息。

**ES2022 改进**：现在 Error 构造函数支持 \`cause\` 属性，用于链式记录原始错误：

\`\`\`ts
try {
  JSON.parse(badJson);
} catch (e) {
  throw new Error("解析失败", { cause: e });  // 保留原始错误
}
\`\`\`

### try / catch / finally

\`\`\`ts
try {
  // 可能抛错的代码
  riskyOperation();
} catch (error) {
  // error 类型在 TS strict 模式下是 unknown
  if (error instanceof Error) {
    console.log(error.message);
  }
} finally {
  // 无论成功失败都执行（资源清理）
  cleanup();
}
\`\`\`

#### catch 变量的 unknown 类型

**TypeScript 4.4+** 在 strict 模式下，\`catch\` 变量默认是 \`unknown\`（不再是 \`any\`）。这是巨大的安全性提升——\`unknown\` 强制你**收窄**后才能使用：

\`\`\`ts
try {
  risky();
} catch (err) {
  // err 是 unknown
  // err.message;  // ❌ unknown 没有 message
  if (err instanceof Error) {
    err.message;  // ✅ 收窄后可用
  } else if (typeof err === "string") {
    err.toUpperCase();  // ✅
  }
}
\`\`\`

#### 为什么是 unknown 而不是 any

\`throw\` 可以抛任何值（字符串、数字、对象），所以 catch 到的"理论上"是任何类型。用 \`any\` 会绕过类型检查，可能访问不存在的属性；用 \`unknown\` 强制收窄，更安全。

### Result 类型：函数式错误处理

\`try/catch\` 的问题：错误是"隐式"的——调用者不知道函数可能抛什么错。函数式编程提出 **Result 类型**：把错误作为**返回值**显式表达：

\`\`\`ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "除数不能为零" };
  return { ok: true, value: a / b };
}

const r = divide(10, 0);
if (r.ok) {
  console.log(r.value);  // number
} else {
  console.log(r.error);  // string
}
\`\`\`

#### Result 的优势

1. **显式**：函数签名就声明了可能出错，调用者必须处理。
2. **类型安全**：ok 分支有 value，!ok 分支有 error，类型精确。
3. **可组合**：能用 map、chain 等组合多个 Result。
4. **无副作用**：不依赖异常机制。

#### Result 的劣势

1. **冗长**：每个调用都要 if 检查。
2. **不兼容**：很多库用 throw，需适配。
3. **不适用**：真正意外的错误（内存不足）还是 throw 合适。

### 断言函数（asserts）

TypeScript 的 \`asserts\` 关键字定义**断言函数**——函数如果不抛错，就"断言"某条件成立，编译器据此收窄类型：

\`\`\`ts
function assertDefined<T>(value: T | undefined | null): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error("值不能为空");
  }
}

const maybe: string | undefined = getValue();
assertDefined(maybe);  // 断言后，maybe 被收窄为 string
maybe.toUpperCase();  // ✅ 不需要 ! 或 if
\`\`\`

#### asserts 的几种形式

\`\`\`ts
// asserts value is T：断言 value 是 T 类型
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("不是字符串");
}

// asserts x：断言 x 为真值
function assert(truth: boolean): asserts truth {
  if (!truth) throw new Error("断言失败");
}

// 断言参数非 null/undefined
function assertNonNull<T>(x: T): asserts x is NonNullable<T> {
  if (x === null || x === undefined) throw new Error("为空");
}
\`\`\`

Node.js 的 \`assert\` 模块就用了这种模式——断言通过后类型自动收窄。

### never 与不可达代码

\`never\` 类型表示**永远不会出现的值**。利用它做**穷尽检查**：

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    default:
      // 如果新增 triangle 但没处理，这里 s 不是 never，编译报错
      const _exhaustive: never = s;
      throw new Error("未处理: " + _exhaustive);
  }
}
\`\`\`

#### never 的用途

1. **穷尽检查**：确保 switch 处理所有联合成员。
2. **不可达标记**：\`const x: never = ...\` 标记不应到达的代码。
3. **过滤类型**：\`Exclude<T, U>\` 把匹配部分变 never。
4. **无限循环/抛错函数返回值**：\`function fail(): never { throw ... }\`。

### 错误层次结构设计

大型应用应有**分层的错误体系**：

\`\`\`ts
// 基础错误
class AppError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = "AppError";
  }
}

// 领域错误（业务逻辑）
class DomainError extends AppError {}
class ValidationError extends DomainError {
  constructor(message: string, public field: string) {
    super(message, "VALIDATION", 400);
  }
}
class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message, "BUSINESS_RULE", 422);
  }
}

// 基础设施错误（技术问题）
class InfrastructureError extends AppError {}
class DatabaseError extends InfrastructureError {
  constructor(message: string, public query?: string) {
    super(message, "DATABASE", 500);
  }
}
class NetworkError extends InfrastructureError {
  constructor(message: string, public url?: string) {
    super(message, "NETWORK", 503);
  }
}
\`\`\`

分层的好处：catch 时可以按"大类"捕获（\`instanceof DomainError\`），也可以按"小类"精确处理。

### 错误边界概念

错误边界（Error Boundary）是 React 引入的概念：**在某个层级捕获子层抛出的错误，防止整个应用崩溃**。虽然这是 UI 概念，但思想通用——把错误隔离在边界内：

\`\`\`ts
// 通用错误边界：包裹可能出错的操作
async function withErrorBoundary<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[错误边界捕获]", e);
    return fallback;  // 返回兜底值，不让错误传播
  }
}

const data = await withErrorBoundary(
  () => fetchUnreliableData(),
  { default: true }  // 兜底
);
\`\`\`

### 错误处理最佳实践

1. **抛 Error 对象，不抛字符串**：保留 stack、可 instanceof 判断。
2. **自定义 Error 子类**：分层设计，精确识别。
3. **catch 后处理或重新抛出**：别吞掉错误（空 catch 是 bug）。
4. **用 unknown 收窄**：strict 模式下 catch 变量是 unknown，先 instanceof。
5. **finally 释放资源**：文件句柄、数据库连接等。
6. **错误信息面向人**：message 要可读，code 要机器可识别。
7. **保留 cause**：包装错误时用 \`{ cause: originalError }\`。
8. **区分预期错误和意外错误**：预期错误用 Result，意外错误用 throw。
9. **不要用错误处理做控制流**：try/catch 不是 if/else。

### 陷阱总结

1. **catch 变量是 unknown**：不收窄不能用，但运行时仍是任何值。
2. **throw 任何值**：但 catch 后 instanceof Error 才安全。
3. **异步错误**：Promise rejection 不会被 try/catch 捕获，需 .catch 或 await。
4. **finally 的返回值**：finally 里 return 会覆盖 try 的 return（避免）。
5. **Error.stack 非标准**：不同引擎格式不同，别依赖具体格式。
6. **asserts 不改变运行时**：只影响类型，运行时仍需真实检查。
7. **Result 不能替代所有 throw**：系统级错误（OOM）还是 throw。
8. **自定义 Error 的 name**：忘了设 name 会显示 "Error"。

### 本节代码演示

下面综合演示：自定义 Error 层次结构、try/catch/finally 与 unknown 收窄、Result 类型（ok/error 模式）、asserts 断言函数、never 穷尽检查、错误边界。`,
    code: `// ============================================================
// 第六章代码演示：错误处理全景
// ============================================================

// ---- 1. 自定义 Error 层次结构 ----
console.log("========== 1. 自定义 Error 层次结构 ==========");

// 基础应用错误
class AppError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = "AppError";
  }
}

// 领域错误（业务逻辑层）
class DomainError extends AppError {
  constructor(message: string, code: string, statusCode: number = 422) {
    super(message, code, statusCode);
    this.name = "DomainError";
  }
}

class ValidationError extends DomainError {
  constructor(message: string, public field: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message, "BUSINESS_RULE", 422);
    this.name = "BusinessRuleError";
  }
}

// 基础设施错误（技术层）
class InfrastructureError extends AppError {
  constructor(message: string, code: string, statusCode: number = 500) {
    super(message, code, statusCode);
    this.name = "InfrastructureError";
  }
}

class DatabaseError extends InfrastructureError {
  constructor(message: string, public query?: string) {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
  }
}

// 测试层次结构
function testErrorHierarchy() {
  const errors = [
    new ValidationError("邮箱格式错误", "email"),
    new BusinessRuleError("余额不足无法转账"),
    new DatabaseError("连接超时", "SELECT * FROM users")
  ];
  errors.forEach((e) => {
    console.log("  " + e.name + ": " + e.message + " [code=" + e.code + ", status=" + e.statusCode + "]");
    console.log("    instanceof AppError:", e instanceof AppError);
    console.log("    instanceof DomainError:", e instanceof DomainError);
    console.log("    instanceof InfrastructureError:", e instanceof InfrastructureError);
  });
}
testErrorHierarchy();

// ---- 2. try/catch/finally 与 unknown 收窄 ----
console.log("\\n========== 2. try/catch/finally ==========");

// 模拟可能抛错的函数
function parseJson(jsonStr: string): any {
  return JSON.parse(jsonStr);  // 可能抛 SyntaxError
}

function riskyDivide(a: number, b: number): number {
  if (b === 0) throw new ValidationError("除数不能为零", "divisor");
  return a / b;
}

// catch 变量在 strict 模式下是 unknown，必须收窄
function demoTryCatch() {
  // 场景 1：JSON 解析失败
  try {
    const data = parseJson("{ invalid json }");
    console.log("  解析成功:", data);
  } catch (err) {
    // err 是 unknown，必须收窄才能用
    if (err instanceof SyntaxError) {
      console.log("  语法错误捕获:", err.message);
    } else if (err instanceof Error) {
      console.log("  其他错误:", err.message);
    } else {
      console.log("  未知错误:", String(err));
    }
  } finally {
    console.log("  finally 块执行（资源清理）");
  }

  // 场景 2：自定义 Error 捕获
  try {
    riskyDivide(10, 0);
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log("  验证错误: " + err.message + " (字段: " + err.field + ")");
    } else if (err instanceof Error) {
      console.log("  其他错误:", err.message);
    }
  }

  // 场景 3：finally 总会执行
  try {
    console.log("  try 块执行");
    // 不抛错，正常完成
  } catch (err) {
    console.log("  不会执行这里");
  } finally {
    console.log("  finally 无论成功失败都执行");
  }
}
demoTryCatch();

// ---- 3. Result 类型：函数式错误处理 ----
console.log("\\n========== 3. Result 类型 ==========");

// Result 类型定义：ok 分支有 value，error 分支有 error
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 用 Result 包装可能出错的操作
function safeDivide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: "除数不能为零" };
  }
  return { ok: true, value: a / b };
}

function safeParseInt(str: string): Result<number, string> {
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    return { ok: false, error: "'" + str + "' 不是有效数字" };
  }
  return { ok: true, value: num };
}

// Result 工具函数：map（对成功值变换）
function mapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  if (r.ok) {
    return { ok: true, value: fn(r.value) };
  }
  return { ok: false, error: r.error };
}

// Result 工具函数：chain（链式，flatMap）
function chainResult<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  if (r.ok) {
    return fn(r.value);
  }
  return { ok: false, error: r.error };
}

function demoResult() {
  // 基本使用
  const r1 = safeDivide(10, 2);
  if (r1.ok) {
    console.log("  10/2 =", r1.value);
  } else {
    console.log("  错误:", r1.error);
  }

  const r2 = safeDivide(10, 0);
  if (r2.ok) {
    console.log("  10/0 =", r2.value);
  } else {
    console.log("  10/0 错误:", r2.error);
  }

  // map 变换成功值
  const r3 = mapResult(safeDivide(10, 2), (v) => v * 100);
  console.log("  map (10/2)*100:", r3.ok ? r3.value : r3.error);

  // chain 链式操作
  const r4 = chainResult(safeParseInt("42"), (n) => safeDivide(n, 2));
  console.log("  chain parseInt('42') then /2:", r4.ok ? r4.value : r4.error);

  const r5 = chainResult(safeParseInt("abc"), (n) => safeDivide(n, 2));
  console.log("  chain parseInt('abc') then /2:", r5.ok ? r5.value : r5.error);
}
demoResult();

// ---- 4. asserts 断言函数 ----
console.log("\\n========== 4. asserts 断言函数 ==========");

// asserts value is T：断言 value 是 T 类型
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") {
    throw new Error("断言失败: 期望 string，得到 " + typeof x);
  }
}

// asserts value is NonNullable<T>：断言非 null/undefined
function assertNonNull<T>(x: T): asserts x is NonNullable<T> {
  if (x === null || x === undefined) {
    throw new Error("断言失败: 值为 null 或 undefined");
  }
}

// asserts truth：断言为真值
function assert(condition: boolean, msg: string = "断言失败"): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

function demoAsserts() {
  // assertString：断言后类型收窄
  const maybeStr: unknown = "hello world";
  assertString(maybeStr);
  // 现在 maybeStr 被收窄为 string
  console.log("  assertString 后大写:", maybeStr.toUpperCase());

  // assertNonNull：断言非空
  const maybeNum: number | null = 42;
  assertNonNull(maybeNum);
  console.log("  assertNonNull 后:", maybeNum + 10);  // number（已收窄）

  // assert：断言条件
  const age = 25;
  assert(age >= 18, "必须年满 18 岁");
  console.log("  assert age>=18 通过，年龄:", age);

  // 断言失败会抛错
  try {
    const bad: unknown = 123;
    assertString(bad);  // 会抛错
  } catch (e) {
    console.log("  断言失败捕获:", (e as Error).message);
  }
}
demoAsserts();

// ---- 5. never 与穷尽检查 ----
console.log("\\n========== 5. never 穷尽检查 ==========");

// 可辨识联合
type ShapeKind =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "triangle"; base: number; height: number };

// 穷尽检查工具函数
function assertNever(x: never): never {
  throw new Error("未处理的类型: " + JSON.stringify(x));
}

function calcArea(s: ShapeKind): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius * s.radius;
    case "square":
      return s.size * s.size;
    case "triangle":
      return 0.5 * s.base * s.height;
    default:
      // 所有 case 处理后，s 是 never 类型
      // 如果新增 shape 变体但没处理，这里 s 不是 never，编译报错
      return assertNever(s);
  }
}

function describeShape(s: ShapeKind): string {
  switch (s.kind) {
    case "circle": return "圆(r=" + s.radius + ")";
    case "square": return "方形(s=" + s.size + ")";
    case "triangle": return "三角形(" + s.base + "x" + s.height + ")";
    default: return assertNever(s);
  }
}

function demoNever() {
  const shapes: ShapeKind[] = [
    { kind: "circle", radius: 5 },
    { kind: "square", size: 4 },
    { kind: "triangle", base: 6, height: 8 }
  ];
  shapes.forEach((s) => {
    console.log("  " + describeShape(s) + " 面积=" + calcArea(s).toFixed(2));
  });

  // never 类型也用于"不可达"标记
  function fail(msg: string): never {
    throw new Error(msg);
  }
  // function infiniteLoop(): never {
  //   while (true) {}
  // }

  try {
    // 模拟未处理分支（绕过类型检查演示运行时）
    assertNever({ kind: "hexagon" } as never);
  } catch (e) {
    console.log("  穷尽检查触发:", (e as Error).message);
  }

  // fail 返回 never，永远不会正常返回
  try {
    const result: never = fail("测试 fail 函数");
    console.log("  不会执行到这里:", result);
  } catch (e) {
    console.log("  fail 抛错:", (e as Error).message);
  }
}
demoNever();

// ---- 6. 错误边界 ----
console.log("\\n========== 6. 错误边界 ==========");

// 通用错误边界：包裹可能出错的操作，返回兜底值
function withErrorBoundary<T>(fn: () => T, fallback: T, label: string = "操作"): T {
  try {
    return fn();
  } catch (e) {
    console.log("  [错误边界] " + label + " 失败: " + (e as Error).message);
    return fallback;
  }
}

// 异步错误边界
async function asyncWithErrorBoundary<T>(
  fn: () => Promise<T>,
  fallback: T,
  label: string = "异步操作"
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.log("  [异步错误边界] " + label + " 失败: " + (e as Error).message);
    return fallback;
  }
}

// 错误处理中间件：记录错误并决定是否重新抛出
function withErrorHandler<T>(fn: () => T, shouldRethrow: boolean = false): T | null {
  try {
    return fn();
  } catch (e) {
    // 记录错误日志
    const errorInfo = {
      name: e instanceof Error ? e.name : "Unknown",
      message: e instanceof Error ? e.message : String(e),
      time: new Date().toISOString()
    };
    console.log("  [错误记录] " + JSON.stringify(errorInfo));
    if (shouldRethrow) throw e;
    return null;
  }
}

function demoErrorBoundary() {
  // 同步错误边界
  const r1 = withErrorBoundary(
    () => JSON.parse("{ bad json }"),
    { default: true },
    "JSON解析"
  );
  console.log("  同步边界结果:", JSON.stringify(r1));

  const r2 = withErrorBoundary(
    () => JSON.parse('{"valid":true}'),
    { default: false },
    "JSON解析"
  );
  console.log("  同步边界正常:", JSON.stringify(r2));

  // 错误处理中间件（不重新抛出）
  const r3 = withErrorHandler(() => {
    throw new ValidationError("字段必填", "username");
  });
  console.log("  中间件结果:", r3);

  // 错误处理中间件（重新抛出）
  try {
    withErrorHandler(() => {
      throw new Error("严重错误");
    }, true);
  } catch (e) {
    console.log("  重新抛出捕获:", (e as Error).message);
  }
}
demoErrorBoundary();

// ---- 7. 综合实战：用户注册流程 ----
console.log("\\n========== 7. 综合：用户注册 ==========");

// 用 Result 类型实现完整的注册流程
interface User {
  id: number;
  email: string;
  username: string;
  age: number;
}

function validateEmail(email: string): Result<string, string> {
  if (!email.includes("@")) {
    return { ok: false, error: "邮箱格式无效" };
  }
  return { ok: true, value: email };
}

function validateUsername(name: string): Result<string, string> {
  if (name.length < 3) {
    return { ok: false, error: "用户名至少 3 个字符" };
  }
  return { ok: true, value: name };
}

function validateAge(age: number): Result<number, string> {
  if (age < 13) {
    return { ok: false, error: "必须年满 13 岁" };
  }
  if (age > 150) {
    return { ok: false, error: "年龄不合法" };
  }
  return { ok: true, value: age };
}

// 注册函数：用 Result 链式验证
function registerUser(
  email: string,
  username: string,
  age: number
): Result<User, string> {
  // 链式验证
  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { ok: false, error: emailResult.error };

  const nameResult = validateUsername(username);
  if (!nameResult.ok) return { ok: false, error: nameResult.error };

  const ageResult = validateAge(age);
  if (!ageResult.ok) return { ok: false, error: ageResult.error };

  return {
    ok: true,
    value: { id: Date.now(), email: emailResult.value, username: nameResult.value, age: ageResult.value }
  };
}

function demoRegister() {
  // 成功注册
  const r1 = registerUser("test@example.com", "张三", 25);
  if (r1.ok) {
    console.log("  注册成功:", JSON.stringify(r1.value));
  } else {
    console.log("  注册失败:", r1.error);
  }

  // 邮箱错误
  const r2 = registerUser("bad-email", "李四", 30);
  console.log("  邮箱错误:", r2.ok ? "成功" : r2.error);

  // 用户名太短
  const r3 = registerUser("ok@test.com", "ab", 30);
  console.log("  用户名错误:", r3.ok ? "成功" : r3.error);

  // 年龄太小
  const r4 = registerUser("ok@test.com", "王五", 10);
  console.log("  年龄错误:", r4.ok ? "成功" : r4.error);
}
demoRegister();

console.log("\\n错误处理章节演示完成！");`,
  },
];