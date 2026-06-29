// =============================================================
// TypeScript 交互式教程 —— 第五批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts2-async            — 异步编程精通
//   2. ts2-error-handling   — 错误处理模式
//   3. ts2-patterns         — 设计模式 TypeScript 实现
//   4. ts2-performance      — 类型性能优化
//   5. ts2-best-practices   — 最佳实践与避坑指南
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为 "实战与进阶"）
//   content : Markdown 格式的详细讲解（文字量是普通教程的 10 倍）
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
//   - isolatedModules 下 const enum 当普通枚举处理
//   - 沙箱不能 require 本地文件，不涉及文件系统操作
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：异步编程精通
  // =========================================================
  {
    id: "ts2-async",
    title: "异步编程精通",
    icon: "⏳",
    group: "实战与进阶",
    content: `## 异步编程精通 (Async Programming Mastery)

在 TypeScript 中编写异步代码，不仅是"加个 async/await 就完事了"——真正的异步编程精通，意味着你理解 Promise 的类型系统、async/await 的类型推导、异步迭代器的类型、错误处理的类型安全、以及 TypeScript 提供的各种异步工具类型。本章将极其详细地拆解 TypeScript 异步编程的方方面面。

### 1. Promise 的类型化

Promise 是 JavaScript 异步编程的基石，而 TypeScript 为它提供了完整的类型系统。\`Promise<T>\` 是一个泛型类型，\`T\` 是 resolve 时传递的值类型：

\`\`\`ts
// Promise<string>：resolve 的值是 string
const p: Promise<string> = new Promise((resolve) => {
  resolve("hello");
});
\`\`\`

**关键点**：Promise 构造函数的回调参数 \`resolve\` 的类型是 \`(value: T) => void\`。TypeScript 会根据你声明的 \`Promise<T>\` 类型来约束 resolve 的参数类型。如果你写 \`Promise<string>\` 但 resolve 传了数字，编译器会报错。

**Promise 链的类型推导**：\`.then()\` 返回一个新的 Promise，其类型由回调函数的返回值决定：

\`\`\`ts
Promise.resolve(1)           // Promise<number>
  .then(n => n.toString())   // Promise<string>
  .then(s => s.length)       // Promise<number>
  .then(l => l > 0);         // Promise<boolean>
\`\`\`

每个 \`.then()\` 的返回值类型被自动推导为下一个 Promise 的泛型参数。这种"链式类型推导"让异步管道既安全又简洁。

**catch 的类型**：\`.catch()\` 返回 \`Promise<T | never>\`（因为 catch 可能返回任何值来恢复）。如果你在 catch 中返回一个值，类型会与上游合并：

\`\`\`ts
Promise.resolve<number>(1)
  .catch(() => "fallback")  // 返回 Promise<string | number>
\`\`\`

### 2. async/await 的类型推导

async 函数始终返回 \`Promise<T>\`，其中 \`T\` 是函数体 return 的值的类型。TypeScript 自动为你包装：

\`\`\`ts
async function fetchUser(): Promise<string> {
  return "张三"; // 自动包装为 Promise.resolve("张三")
}

// 即使你不写返回类型，TypeScript 也会推导
async function getName() {
  return "李四"; // 推导为 Promise<string>
}
\`\`\`

**await 解开类型**：\`await\` 一个 \`Promise<T>\` 得到 \`T\`。如果 await 一个非 Promise 值，TypeScript 不会报错（JavaScript 允许），但类型不变：

\`\`\`ts
async function demo() {
  const a = await Promise.resolve(42);  // a: number
  const b = await 100;                   // b: number（非 Promise 直接透传）
}
\`\`\`

**错误处理**：async 函数中抛出的异常会被自动包装为 rejected Promise。在函数体内用 try/catch，在调用处用 .catch()——两者类型行为一致。

### 3. Promise.all / Promise.race / Promise.allSettled / Promise.any 的类型

这些组合方法都有精确的 TypeScript 类型签名：

**Promise.all**：类型签名是 \`Promise.all<T extends readonly unknown[]>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>\`。简单说，它把每个元素的 Promise 解开，返回一个元组类型的 Promise：

\`\`\`ts
const [user, posts] = await Promise.all([
  fetchUser(),        // Promise<User>
  fetchPosts(),       // Promise<Post[]>
]);
// user: User, posts: Post[]
\`\`\`

注意，TypeScript 4.7+ 使用了 \`Awaited<T>\` 来递归解开 Promise 嵌套。如果传入的是 \`Promise<Promise<number>>\`，\`Awaited\` 会解开为 \`number\`。

**Promise.race**：返回第一个完成的 Promise 的类型。由于不知道哪个先完成，返回类型是传入所有 Promise 的联合类型：

\`\`\`ts
const result = await Promise.race([
  fetch<string>("/api/fast"),
  fetch<number>("/api/slow"),
]);
// result: string | number
\`\`\`

**Promise.allSettled**：返回每个 Promise 的"结果包装"对象，不论成功还是失败。类型是 \`PromiseSettledResult<T>[]\`：

\`\`\`ts
const results = await Promise.allSettled([p1, p2, p3]);
// results: PromiseSettledResult<A>[] 
// 每个元素是 { status: "fulfilled", value: A } | { status: "rejected", reason: any }
\`\`\`

**Promise.any**：返回第一个成功的 Promise，如果全部失败则抛 AggregateError。返回类型是传入所有 Promise 的联合类型。

### 4. Awaited 工具类型

TypeScript 4.5 引入了 \`Awaited<T>\` 工具类型，它递归地解开 Promise 包装：

\`\`\`ts
type A = Awaited<Promise<string>>;       // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<boolean | Promise<number>>; // boolean | number
\`\`\`

\`Awaited\` 的实现很巧妙——它用条件类型递归展开：

\`\`\`ts
type Awaited<T> = T extends null | undefined ? T
  : T extends object & { then(onfulfilled: infer F, ...args: never[]): any }
    ? F extends (value: infer V, ...args: never[]) => any
      ? Awaited<V>
      : never
    : T;
\`\`\`

这个实现通过检查"thenable"对象来递归展开，因此不仅支持原生 Promise，还支持任何符合 thenable 接口的第三方实现。

### 5. 异步生成器 (Async Generators)

异步生成器用 \`async function*\` 声明，用 \`yield\` 产出值，用 \`for await...of\` 消费：

\`\`\`ts
async function* generateNumbers(): AsyncGenerator<number> {
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 100));
    yield i;
  }
}

// 消费
for await (const num of generateNumbers()) {
  console.log(num); // 0, 1, 2, 3, 4（每隔 100ms 输出一个）
}
\`\`\`

异步生成器的类型是 \`AsyncGenerator<T, TReturn, TNext>\`：
- \`T\`：yield 产出的值类型
- \`TReturn\`：return 返回的值类型
- \`TNext\`：通过 \`.next(val)\` 传入的值类型

### 6. 异步迭代器 (Async Iterators)

\`AsyncIterable<T>\` 和 \`AsyncIterator<T>\` 是异步迭代协议的类型。任何实现了 \`[Symbol.asyncIterator]()\` 方法的对象都是异步可迭代的：

\`\`\`ts
interface AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}

interface AsyncIterator<T> {
  next(): Promise<IteratorResult<T>>;
}
\`\`\`

Node.js 的 Readable Stream 在 Node 10+ 中实现了 \`Symbol.asyncIterator\`，因此你可以用 \`for await...of\` 逐行读取文件或流式数据。

### 7. 异步中的错误处理

异步错误处理最棘手的地方是"错误可能在任何 Promise 链中发生"。最佳实践：

**方案一：try/catch 包围 await**：

\`\`\`ts
async function safeCall() {
  try {
    const data = await fetchData();
    return data;
  } catch (err) {
    // err 的类型是 unknown（TypeScript 4.0+）
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
}
\`\`\`

**方案二：Result 模式**（返回一个包装对象，避免 throw）：

\`\`\`ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function safeFetch(): Promise<Result<string>> {
  try {
    const data = await fetchData();
    return { ok: true, value: data };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}
\`\`\`

### 8. 取消模式 (Cancellation Patterns)

JavaScript 原生没有取消 Promise 的机制，但可以用 AbortController + AbortSignal 实现：

\`\`\`ts
function fetchWithTimeout(url: string, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve("data"), 2000);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
\`\`\`

在 Node.js 中，\`AbortController\` 是全局可用的（Node 15+），许多内置 API（如 \`fs.readFile\`、\`fetch\`）都接受 \`signal\` 参数。

### 9. 异步中的类型收窄

await 后的类型收窄需要注意：如果 await 一个联合类型的 Promise，TypeScript 会保留联合类型，你需要用条件判断收窄：

\`\`\`ts
type Response = { type: "success"; data: string } | { type: "error"; message: string };

async function handle() {
  const res: Response = await fetchResponse();
  if (res.type === "success") {
    // res 收窄为 { type: "success"; data: string }
    console.log(res.data);
  }
}
\`\`\`

### 10. 异步陷阱

1. **忘记 await**：TypeScript 不会警告你"Promise 值未 await 就使用了"——你得到的是 \`Promise<T>\` 而非 \`T\`。使用 \`@typescript-eslint/no-floating-promises\` 规则可以捕获。
2. **forEach 中的 async**：\`arr.forEach(async (item) => { ... })\` 不会等待异步完成，应改用 \`for...of\` 或 \`Promise.all(arr.map(async ...))\`。
3. **async 函数中的隐式返回**：async 函数体末尾没有 return 时，等价于 return undefined，类型是 \`Promise<undefined>\`。
4. **并行 vs 串行**：\`Promise.all\` 是并行，\`for...of\` + await 是串行。选择错误会导致性能问题。

### 本节代码演示

下面实现一个完整的异步任务调度器，展示 Promise 链、async/await 类型推导、Promise.all 组合、异步生成器、错误处理、超时取消等核心模式。`,
    code: `// ============================================================
// 第一章代码演示：异步编程精通
// ============================================================
// 演示 Promise 类型化、async/await 类型推导、Promise.all
// 组合、异步生成器、错误处理、超时取消、任务调度器。

// ---- 1. Promise 类型化与链式调用 ----
console.log("========== 1. Promise 类型化与链式调用 ==========");

// 显式声明 Promise 类型
const p1: Promise<string> = new Promise((resolve) => {
  setTimeout(() => resolve("hello"), 50);
});

// 链式 then：每个 then 返回新 Promise，类型自动推导
p1
  .then((s) => {
    console.log("  第一步: 收到", s, "（类型: string）");
    return s.length; // 返回 number
  })
  .then((n) => {
    console.log("  第二步: 长度 =", n, "（类型: number）");
    return n > 0; // 返回 boolean
  })
  .then((b) => {
    console.log("  第三步: >0 ?", b, "（类型: boolean）");
  });

// Promise.resolve 类型推导
const pNum = Promise.resolve(42);       // Promise<number>
const pStr = Promise.resolve("test");   // Promise<string>
console.log("Promise.resolve 类型推导: pNum 是 Promise<number>, pStr 是 Promise<string>");

// ---- 2. async/await 类型推导 ----
console.log("\\n========== 2. async/await 类型推导 ==========");

// async 函数返回 Promise<T>，T 自动推导
async function getUser(name: string): Promise<{ name: string; id: number }> {
  // 模拟异步操作
  await new Promise((r) => setTimeout(r, 10));
  return { name, id: Math.floor(Math.random() * 1000) };
}

async function demoAsync() {
  const user = await getUser("张三");
  console.log("  await 结果:", user, "（类型: { name: string; id: number }）");

  // await 非 Promise 值：类型不变
  const x = await 123;
  console.log("  await 123:", x, "（类型: number，非 Promise 直接透传）");

  // await 解开嵌套 Promise
  const nested = await Promise.resolve(Promise.resolve("deep"));
  console.log("  await Promise<Promise<string>>:", nested, "（类型: string）");
}
demoAsync().then(() => console.log("  async 演示完成"));

// ---- 3. Promise.all 类型安全组合 ----
console.log("\\n========== 3. Promise.all 类型安全组合 ==========");

async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  await new Promise((r) => setTimeout(r, 20));
  return { id, name: "用户" + id };
}

async function fetchPosts(uid: number): Promise<{ title: string; count: number }> {
  await new Promise((r) => setTimeout(r, 30));
  return { title: "用户" + uid + "的帖子", count: Math.floor(Math.random() * 50) };
}

async function fetchStats(): Promise<{ views: number; likes: number }> {
  await new Promise((r) => setTimeout(r, 15));
  return { views: 1000, likes: 250 };
}

// Promise.all：元组类型安全
async function loadDashboard() {
  const [user, posts, stats] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchStats(),
  ]);
  console.log("  Promise.all 结果:");
  console.log("    用户:", user.name, "（类型: { id: number; name: string }）");
  console.log("    帖子:", posts.title, "共", posts.count, "篇");
  console.log("    统计:", stats.views, "浏览", stats.likes, "赞");
  console.log("  → 三个请求并行执行，总耗时约 30ms（最短者）");
}
loadDashboard().then(() => console.log("  Promise.all 演示完成"));

// ---- 4. Promise.race / Promise.allSettled / Promise.any ----
console.log("\\n========== 4. Promise.race / allSettled / any ==========");

// Promise.race：返回第一个完成的
async function demoRace() {
  const fast = new Promise<string>((r) => setTimeout(() => r("快速"), 30));
  const slow = new Promise<string>((r) => setTimeout(() => r("慢速"), 100));
  const result = await Promise.race([fast, slow]);
  console.log("  Promise.race 胜出:", result, "（类型: string）");
}
demoRace();

// Promise.allSettled：全完成后返回结果数组
async function demoAllSettled() {
  const results = await Promise.allSettled([
    Promise.resolve("成功"),
    Promise.reject(new Error("失败")),
    Promise.resolve(42),
  ]);
  console.log("  Promise.allSettled 结果:");
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log("    [" + i + "] 成功:", r.value);
    } else {
      console.log("    [" + i + "] 失败:", r.reason.message);
    }
  });
}
demoAllSettled();

// Promise.any：第一个成功的
async function demoAny() {
  const results = await Promise.any([
    Promise.reject("err1"),
    Promise.resolve("second succeeds"),
    Promise.reject("err3"),
  ]);
  console.log("  Promise.any 成功值:", results);
}
demoAny();

// ---- 5. Awaited 工具类型 ----
console.log("\\n========== 5. Awaited 工具类型 ==========");

// 演示 Awaited 的递归展开效果
type A1 = Awaited<Promise<string>>;          // string
type A2 = Awaited<Promise<Promise<number>>>;  // number
type A3 = Awaited<Promise<string> | number>;  // string | number

// 运行时验证
async function awaitedDemo() {
  const v1: A1 = "hello";
  const v2: A2 = 42;
  const v3: A3 = 100;
  console.log("  Awaited<Promise<string>> = string:", v1);
  console.log("  Awaited<Promise<Promise<number>>> = number:", v2);
  console.log("  Awaited<Promise<string> | number> = string | number:", v3);
}
awaitedDemo();

// 实现一个简易版 Awaited（类型级演示）
// 注：以下为类型级代码，运行时不可见，仅作演示
// type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

// ---- 6. 异步生成器 ----
console.log("\\n========== 6. 异步生成器 ==========");

// 异步生成器：产出分页数据
async function* paginateData(pageSize: number, total: number): AsyncGenerator<number[]> {
  for (let offset = 0; offset < total; offset += pageSize) {
    await new Promise((r) => setTimeout(r, 30)); // 模拟网络延迟
    const page: number[] = [];
    for (let i = offset; i < Math.min(offset + pageSize, total); i++) {
      page.push(i + 1);
    }
    yield page;
  }
}

async function consumeGenerator() {
  console.log("  消费异步生成器（分页数据）:");
  for await (const page of paginateData(3, 10)) {
    console.log("    页码数据:", page);
  }
}
consumeGenerator().then(() => console.log("  异步生成器演示完成"));

// ---- 7. 异步错误处理模式 ----
console.log("\\n========== 7. 异步错误处理模式 ==========");

// 定义 Result 类型（Rust 风格）
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// 包装异步操作，返回 Result 而非抛异常
async function safeAsync<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// 使用 Result 模式
async function demoResultPattern() {
  // 成功的操作
  const r1 = await safeAsync(Promise.resolve("数据获取成功"));
  if (r1.ok) {
    console.log("  ✅ 成功:", r1.value);
  } else {
    console.log("  ❌ 失败:", r1.error.message);
  }

  // 失败的操作
  const r2 = await safeAsync(Promise.reject(new Error("连接超时")));
  if (r2.ok) {
    console.log("  ✅ 成功:", r2.value);
  } else {
    console.log("  ❌ 失败:", r2.error.message);
  }
}
demoResultPattern();

// 传统 try/catch 模式（catch 中 err 是 unknown）
async function demoTryCatch() {
  try {
    await Promise.reject(new Error("测试错误"));
  } catch (err) {
    // TypeScript 4.0+ err 是 unknown，需要类型守卫
    if (err instanceof Error) {
      console.log("  try/catch 捕获:", err.message);
    } else {
      console.log("  try/catch 捕获非 Error:", String(err));
    }
  }
}
demoTryCatch();

// ---- 8. 超时取消模式 ----
console.log("\\n========== 8. 超时取消模式 ==========");

// 创建一个可取消的 Promise
function createCancellable<T>(
  executor: (resolve: (value: T) => void, reject: (reason: Error) => void) => void,
  abortSignal: AbortSignal
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (abortSignal.aborted) {
      reject(new Error("已取消"));
      return;
    }
    const onAbort = () => reject(new Error("操作被取消"));
    abortSignal.addEventListener("abort", onAbort, { once: true });
    executor(
      (value) => {
        abortSignal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (reason) => {
        abortSignal.removeEventListener("abort", onAbort);
        reject(reason);
      }
    );
  });
}

// 带超时的操作
function withTimeout<T>(promise: Promise<T>, ms: number, msg: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  const wrapped = createCancellable<T>(
    (resolve, reject) => {
      promise.then(
        (v) => { clearTimeout(timeout); resolve(v); },
        (e) => { clearTimeout(timeout); reject(e); }
      );
    },
    controller.signal
  );
  return wrapped;
}

async function demoTimeout() {
  // 正常完成的操作
  try {
    const result = await withTimeout(
      new Promise<string>((r) => setTimeout(() => r("正常完成"), 50)),
      100,
      "超时"
    );
    console.log("  正常完成:", result);
  } catch (err) {
    console.log("  超时/取消:", (err as Error).message);
  }

  // 会超时的操作
  try {
    const result = await withTimeout(
      new Promise<string>((r) => setTimeout(() => r("永远不会到达"), 200)),
      50,
      "超时"
    );
    console.log("  结果:", result);
  } catch (err) {
    console.log("  超时/取消:", (err as Error).message);
  }
}
demoTimeout();

// ---- 9. 异步任务调度器 ----
console.log("\\n========== 9. 异步任务调度器 ==========");

// 简单的并发控制调度器：限制同时执行的 Promise 数量
class AsyncScheduler {
  private maxConcurrency: number;
  private running = 0;
  private queue: Array<() => Promise<void>> = [];

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency;
  }

  addTask<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          this.next();
        }
      };

      if (this.running < this.maxConcurrency) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  private next() {
    if (this.queue.length > 0 && this.running < this.maxConcurrency) {
      const task = this.queue.shift()!;
      task();
    }
  }
}

async function demoScheduler() {
  const scheduler = new AsyncScheduler(2); // 最多 2 个并发

  const tasks = [1, 2, 3, 4, 5].map((i) =>
    scheduler.addTask(async () => {
      const start = Date.now();
      await new Promise((r) => setTimeout(r, 50 + i * 10));
      console.log("    任务" + i + " 完成, 耗时 " + (Date.now() - start) + "ms");
      return "结果" + i;
    })
  );

  const results = await Promise.all(tasks);
  console.log("  所有任务完成:", results);
  console.log("  → 2 个并发确保同时最多 2 个任务运行");
}
demoScheduler();

// ---- 10. 异步陷阱演示 ----
console.log("\\n========== 10. 异步陷阱演示 ==========");

// 陷阱 1: forEach 中的 async 不会等待
async function trapForEach() {
  console.log("  陷阱 1: forEach(async) 不会等待");
  const items = [1, 2, 3];
  items.forEach(async (item) => {
    await new Promise((r) => setTimeout(r, 30));
    console.log("    forEach 中的异步:", item);
  });
  console.log("    forEach 结束（但异步还在跑！）");
  await new Promise((r) => setTimeout(r, 150)); // 等异步完成
}
trapForEach().then(() => console.log("  forEach 陷阱演示完成"));

// 正确做法：用 for...of
async function correctForOf() {
  console.log("  正确做法: for...of + await（串行）");
  const items = [1, 2, 3];
  for (const item of items) {
    await new Promise((r) => setTimeout(r, 30));
    console.log("    for...of 中的异步:", item);
  }
  console.log("    for...of 全部完成");
}
correctForOf().then(() => console.log("  for...of 正确做法演示完成"));

// 陷阱 2: 并行用 Promise.all + map
async function correctParallel() {
  console.log("  正确做法: Promise.all + map（并行）");
  const items = [1, 2, 3];
  const results = await Promise.all(
    items.map(async (item) => {
      await new Promise((r) => setTimeout(r, 30));
      return "处理" + item;
    })
  );
  console.log("    并行结果:", results);
}
correctParallel().then(() => console.log("  并行处理演示完成"));

console.log("\\n异步编程精通演示完成！掌握类型安全的异步编程，事半功倍。");`,
  },

  // =========================================================
  // 第二章：错误处理模式
  // =========================================================
  {
    id: "ts2-error-handling",
    title: "错误处理模式",
    icon: "🚨",
    group: "实战与进阶",
    content: `## 错误处理模式 (Error Handling Patterns)

TypeScript 的类型系统为错误处理带来了前所未有的可能性——你可以用类型精确描述"什么情况下会出错"、"错误携带什么信息"、"如何处理错误才能不遗漏"。本章将极其详细地讲解 TypeScript 中的错误处理模式：错误类层次结构、自定义错误类、可辨识联合错误处理、Result 模式（Rust 风格）、never 类型穷尽检查、try/catch 的类型行为、以及断言函数。

### 1. 错误类层次结构

JavaScript 的内置错误类型形成了一个层次结构：

\`\`\`
Error
├── RangeError       // 数值超出范围
├── ReferenceError   // 引用不存在的变量
├── SyntaxError      // 语法错误
├── TypeError        // 类型错误
├── URIError         // URI 编码/解码错误
├── EvalError        // eval() 错误（已废弃）
└── AggregateError   // 多个错误的集合（ES2021）
\`\`\`

在 TypeScript 中，每个错误类都有对应的构造函数和类型定义。你可以通过 \`instanceof\` 来区分不同错误类型：

\`\`\`ts
try {
  JSON.parse("invalid json");
} catch (err) {
  if (err instanceof SyntaxError) {
    // 处理 JSON 解析错误
  } else if (err instanceof TypeError) {
    // 处理类型错误
  } else {
    // 未知错误
  }
}
\`\`\`

### 2. 自定义错误类

在实际项目中，你应该创建自己的错误类层次结构，让错误携带更多上下文信息：

\`\`\`ts
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError"; // 必须设置 name，否则是 "Error"
    // 修复原型链（TypeScript 编译到 ES5 时需要）
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(resource + " 未找到: " + id, "NOT_FOUND", 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
\`\`\`

**关键点**：
- \`Error.captureStackTrace\` 可以生成更干净的堆栈跟踪。
- 继承时要设置 \`this.name\`，否则 \`instanceof\` 检查可能失效。
- 跨执行上下文（如 iframe、vm 沙箱）时 \`instanceof\` 可能失效，需要用 \`err.name\` 或 \`err.code\` 做后备判断。

### 3. 可辨识联合（Discriminated Union）错误处理

这是 TypeScript 错误处理中最强大的模式。将错误建模为可辨识联合类型，让每个分支的类型都被精确收窄：

\`\`\`ts
type ApiResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; code: "NOT_FOUND"; message: string }
  | { status: "error"; code: "UNAUTHORIZED"; message: string }
  | { status: "error"; code: "SERVER_ERROR"; message: string; retryAfter?: number }
  | { status: "error"; code: "NETWORK_ERROR"; message: string; isTimeout: boolean };
\`\`\`

\`code\` 字段是可辨识标签（discriminant），switch/case 根据它收窄类型：

\`\`\`ts
function handleApiResult(result: ApiResult<unknown>): string {
  if (result.status === "success") {
    return "数据: " + JSON.stringify(result.data);
  }
  switch (result.code) {
    case "NOT_FOUND":
      return "404: " + result.message;
    case "UNAUTHORIZED":
      return "401: " + result.message;
    case "SERVER_ERROR":
      // 这里可以访问 result.retryAfter
      return "500: " + result.message + (result.retryAfter ? " 重试" + result.retryAfter + "s" : "");
    case "NETWORK_ERROR":
      return "网络错误: " + result.message + (result.isTimeout ? "（超时）" : "");
  }
}
\`\`\`

这种模式的优势：
- **编译期穷尽检查**：如果新增一个 error code，所有 switch 处理处会报错。
- **类型安全的字段访问**：每个分支的字段都能被精确推导。
- **自文档化**：类型本身就是错误处理文档。

### 4. Result 模式（Rust 风格）

Rust 语言用 \`Result<T, E>\` 类型表示"可能失败的操作"，TypeScript 也可以实现类似模式：

\`\`\`ts
// 成功
type Ok<T> = { ok: true; value: T };
// 失败
type Err<E> = { ok: false; error: E };
// Result 类型
type Result<T, E = Error> = Ok<T> | Err<E>;
\`\`\`

Result 模式的核心理念：**不抛异常，而是返回一个"成功或失败"的包装对象**。调用方必须显式处理两种情况：

\`\`\`ts
function parseAge(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  if (isNaN(n)) return { ok: false, error: "无效的数字: " + input };
  if (n < 0 || n > 150) return { ok: false, error: "年龄超出范围: " + n };
  return { ok: true, value: n };
}

// 使用方必须处理两种结果
const result = parseAge("25");
if (result.ok) {
  console.log("年龄:", result.value); // 安全访问 value
} else {
  console.log("错误:", result.error); // 安全访问 error
}
\`\`\`

Result 模式比 try/catch 的优势：
- **类型安全**：不需要在 catch 中做 unknown 类型守卫。
- **不打断控制流**：不会像 throw 那样跳转，代码更易阅读。
- **可组合**：可以用 \`map\`/\`andThen\`/\`orElse\` 等方法链式操作。

**实用工具函数**：

\`\`\`ts
// 包装一个可能抛异常的函数
function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}

// 异步版本
async function tryCatchAsync<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await promise };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}
\`\`\`

### 5. never 类型与穷尽检查

在 switch 语句的 default 分支中，用 \`never\` 类型守卫确保所有情况都被处理：

\`\`\`ts
function assertNever(x: never): never {
  throw new Error("未处理的情况: " + JSON.stringify(x));
}

type Status = "idle" | "loading" | "success" | "error";

function handleStatus(s: Status): string {
  switch (s) {
    case "idle": return "空闲";
    case "loading": return "加载中";
    case "success": return "成功";
    case "error": return "错误";
    default:
      // 如果 Status 新增了成员，s 的类型不是 never，编译报错
      return assertNever(s);
  }
}
\`\`\`

这个模式在错误处理中同样适用——当你的错误类型是可辨识联合时，在 default 分支放 \`assertNever\` 可以确保新增错误码不会被遗漏。

### 6. try/catch 的类型行为

TypeScript 4.0 起，catch 子句中的错误变量类型从 \`any\` 改为 \`unknown\`。这意味着你不能直接访问 \`err.message\` 而不做类型守卫：

\`\`\`ts
try {
  // ...
} catch (err) {
  // err 是 unknown
  // console.log(err.message); // ❌ 编译错误
  if (err instanceof Error) {
    console.log(err.message); // ✅ 类型守卫后可以
  }
}
\`\`\`

这个改动让错误处理更安全——你被迫显式判断错误类型，减少"假设错误有 message 属性"的潜在 bug。

**如何修改 catch 变量的类型**：你可以在 tsconfig 中设置 \`useUnknownInCatchVariables: false\` 回到旧行为（err 是 any），但**不推荐**。

### 7. 断言函数（Assertion Functions）

TypeScript 3.7 引入断言函数，用 \`asserts\` 关键字声明一个函数会在条件不满足时抛异常，从而影响后续代码的类型收窄：

\`\`\`ts
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "断言失败");
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("不是字符串");
  }
}

// 使用
let x: unknown = "hello";
assertIsString(x);
// 在这之后，x 被收窄为 string
console.log(x.toUpperCase()); // ✅ 不需要再断言
\`\`\`

断言函数在错误处理中很有用——你可以用它来"在运行时验证前提条件"，验证通过后编译器就知道类型已被收窄。

### 8. 错误处理最佳实践

1. **创建自定义错误类层次**：不同的错误类型携带不同的上下文信息，方便上层针对性处理。
2. **用 Result 模式替代 try/catch**：在不需要 throw 打断控制流的场景，Result 更优雅。
3. **可辨识联合错误类型**：把错误建模为有 type/code 标签的联合类型，配合 switch 做穷尽处理。
4. **catch 中的 err 是 unknown**：总是用 \`instanceof\` 或自定义类型守卫判断。
5. **never 穷尽检查**：在 switch 的 default 分支放 \`assertNever\`，防止遗漏。
6. **不要吞掉错误**：空 catch 块是代码坏味道。至少记录日志或重新抛出。
7. **错误信息要包含上下文**：不仅说"失败了"，还要说"什么操作失败了、因为什么、输入是什么"。

### 本节代码演示

下面实现一个完整的错误处理系统：自定义错误类层次、可辨识联合错误处理、Result 模式、never 穷尽检查、断言函数、以及一个模拟的 API 调用场景。`,
    code: `// ============================================================
// 第二章代码演示：错误处理模式
// ============================================================
// 演示自定义错误类、可辨识联合错误、Result 模式、
// never 穷尽检查、断言函数、try/catch 类型行为。

// ---- 1. 自定义错误类层次结构 ----
console.log("========== 1. 自定义错误类层次结构 ==========");

// 基础错误类
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 验证错误
class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// 未找到错误
class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(resource + " 未找到: " + id, "NOT_FOUND", 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// 网络错误
class NetworkError extends AppError {
  constructor(
    message: string,
    public isTimeout: boolean,
    public retryAfter?: number
  ) {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

// 演示错误类层次结构
function handleError(err: Error): string {
  if (err instanceof ValidationError) {
    return "验证错误 (" + err.code + "): " + err.message + " | 字段: " + JSON.stringify(err.fields);
  }
  if (err instanceof NotFoundError) {
    return "未找到 (" + err.code + "): " + err.message;
  }
  if (err instanceof NetworkError) {
    return "网络错误: " + err.message + " | 超时:" + err.isTimeout + " | 重试:" + (err.retryAfter ?? "无");
  }
  if (err instanceof AppError) {
    return "应用错误 (" + err.code + "): " + err.message;
  }
  return "未知错误: " + err.message;
}

console.log(handleError(new ValidationError("邮箱格式不正确", { email: "invalid" })));
console.log(handleError(new NotFoundError("用户", "123")));
console.log(handleError(new NetworkError("连接超时", true, 5)));
console.log(handleError(new Error("常规错误")));

// ---- 2. 可辨识联合错误处理 ----
console.log("\\n========== 2. 可辨识联合错误处理 ==========");

// 用可辨识联合建模 API 响应
type ApiResult<T> =
  | { status: "success"; data: T; timestamp: number }
  | { status: "error"; code: "NOT_FOUND"; message: string }
  | { status: "error"; code: "UNAUTHORIZED"; message: string; redirectUrl: string }
  | { status: "error"; code: "SERVER_ERROR"; message: string; retryAfter?: number }
  | { status: "error"; code: "NETWORK_ERROR"; message: string; isTimeout: boolean }
  | { status: "error"; code: "VALIDATION_ERROR"; fields: Record<string, string> };

// 穷尽检查：所有 error code 都处理
function handleApiResult<T>(result: ApiResult<T>): string {
  if (result.status === "success") {
    return "✅ 成功: " + JSON.stringify(result.data) + " (时间: " + result.timestamp + ")";
  }
  // 用 switch 确保穷尽
  switch (result.code) {
    case "NOT_FOUND":
      return "❌ 404: " + result.message;
    case "UNAUTHORIZED":
      return "❌ 401: " + result.message + " → 重定向到 " + result.redirectUrl;
    case "SERVER_ERROR":
      return "❌ 500: " + result.message + (result.retryAfter !== undefined ? " (重试 " + result.retryAfter + "s 后)" : "");
    case "NETWORK_ERROR":
      return "❌ 网络错误: " + result.message + (result.isTimeout ? " (超时)" : "");
    case "VALIDATION_ERROR":
      return "❌ 验证错误: " + JSON.stringify(result.fields);
  }
}

// 模拟不同的 API 结果
const results: ApiResult<string>[] = [
  { status: "success", data: "用户数据", timestamp: Date.now() },
  { status: "error", code: "NOT_FOUND", message: "用户不存在" },
  { status: "error", code: "UNAUTHORIZED", message: "请先登录", redirectUrl: "/login" },
  { status: "error", code: "SERVER_ERROR", message: "数据库连接失败", retryAfter: 3 },
  { status: "error", code: "NETWORK_ERROR", message: "请求超时", isTimeout: true },
  { status: "error", code: "VALIDATION_ERROR", fields: { email: "格式不正确", age: "必须为正数" } },
];

results.forEach((r) => console.log("  " + handleApiResult(r)));

// ---- 3. Result 模式（Rust 风格） ----
console.log("\\n========== 3. Result 模式（Rust 风格）==========");

// 定义 Result 类型
type Ok<T> = { ok: true; value: T };
type Err<E = Error> = { ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

// 工具函数：包装同步操作
function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}

// 工具函数：包装异步操作
async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    return { ok: false, error: err as Error };
  }
}

// Result 的 map 操作
function mapResult<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
}

// 使用演示
function parseAge(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  if (isNaN(n)) return { ok: false, error: "无效的数字: " + input };
  if (n < 0 || n > 150) return { ok: false, error: "年龄超出范围(0-150): " + n };
  return { ok: true, value: n };
}

function formatResult(r: Result<number, string>): string {
  if (r.ok) {
    return "✅ 年龄: " + r.value + " 岁";
  } else {
    return "❌ " + r.error;
  }
}

console.log(formatResult(parseAge("25")));
console.log(formatResult(parseAge("abc")));
console.log(formatResult(parseAge("-5")));
console.log(formatResult(parseAge("200")));

// 链式操作
const chainResult = mapResult(parseAge("30"), (age) => "用户年龄: " + age + " 岁");
console.log("链式 map:", chainResult.ok ? chainResult.value : chainResult.error);

// 异步 Result 演示
async function demoAsyncResult() {
  const r1 = await tryCatchAsync(async () => {
    return "异步操作成功";
  });
  console.log("  异步成功:", r1.ok ? r1.value : r1.error.message);

  const r2 = await tryCatchAsync(async () => {
    throw new Error("异步操作失败");
  });
  console.log("  异步失败:", r2.ok ? r2.value : r2.error.message);
}
demoAsyncResult();

// ---- 4. never 穷尽检查 ----
console.log("\\n========== 4. never 穷尽检查 ==========");

// assertNever 函数：永远不会返回
function assertNever(x: never): never {
  throw new Error("未处理的情况: " + JSON.stringify(x));
}

// 可辨识联合 + 穷尽检查
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; delta: number };

function handleEvent(event: Event): string {
  switch (event.type) {
    case "click":
      return "点击位置: (" + event.x + ", " + event.y + ")";
    case "keydown":
      return "按键: " + event.key;
    case "scroll":
      return "滚动: " + event.delta + "px";
    default:
      // 如果 Event 新增了成员，event 的类型不是 never，编译报错
      return assertNever(event);
  }
}

const events: Event[] = [
  { type: "click", x: 100, y: 200 },
  { type: "keydown", key: "Enter" },
  { type: "scroll", delta: 50 },
];

events.forEach((e) => console.log("  " + handleEvent(e)));

// ---- 5. 断言函数 ----
console.log("\\n========== 5. 断言函数 ==========");

// 通用断言
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "断言失败");
  }
}

// 类型断言函数
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("期望 string，实际是 " + typeof value);
  }
}

function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error("期望 number，实际是 " + typeof value);
  }
}

// 使用断言函数进行类型收窄
function processValue(input: unknown): string {
  assertIsString(input);
  // 这里 input 已被收窄为 string
  return "字符串长度: " + input.length;
}

try {
  console.log("  processValue('hello'):", processValue("hello"));
} catch (err) {
  console.log("  错误:", (err as Error).message);
}

try {
  console.log("  processValue(123):", processValue(123));
} catch (err) {
  console.log("  错误:", (err as Error).message);
}

// 带字段验证的断言
function assertNonEmptyArray<T>(value: T[]): asserts value is [T, ...T[]] {
  if (value.length === 0) {
    throw new Error("数组不能为空");
  }
}

const arr1 = [1, 2, 3];
assertNonEmptyArray(arr1);
console.log("  非空数组首元素:", arr1[0]);

const arr2: number[] = [];
try {
  assertNonEmptyArray(arr2);
  console.log("  首元素:", arr2[0]);
} catch (err) {
  console.log("  空数组断言失败:", (err as Error).message);
}

// ---- 6. try/catch 类型行为（TypeScript 4.0+） ----
console.log("\\n========== 6. try/catch 类型行为 ==========");

console.log("  TypeScript 4.0+ catch 中 err 是 unknown 类型");

try {
  throw new TypeError("类型错误");
} catch (err) {
  // err 是 unknown，需要类型守卫
  if (err instanceof TypeError) {
    console.log("  ✅ 捕获 TypeError:", err.message);
  } else if (err instanceof Error) {
    console.log("  ✅ 捕获 Error:", err.message);
  } else {
    console.log("  ✅ 捕获非 Error 值:", String(err));
  }
}

// 抛非 Error 值（不规范但合法）
try {
  throw "这是个字符串错误";
} catch (err) {
  console.log("  捕获非 Error:", typeof err, "→", String(err));
}

// ---- 7. 综合场景：模拟 API 请求错误处理 ----
console.log("\\n========== 7. 综合场景：API 请求错误处理 ==========");

// 模拟 API 调用
async function simulatedApiCall(endpoint: string): Promise<ApiResult<string>> {
  await new Promise((r) => setTimeout(r, 20));

  // 根据 endpoint 模拟不同结果
  if (endpoint === "/api/user") {
    return { status: "success", data: "用户数据", timestamp: Date.now() };
  }
  if (endpoint === "/api/user/999") {
    return { status: "error", code: "NOT_FOUND", message: "用户 999 不存在" };
  }
  if (endpoint === "/api/protected") {
    return { status: "error", code: "UNAUTHORIZED", message: "未授权", redirectUrl: "/login" };
  }
  if (endpoint === "/api/crash") {
    return { status: "error", code: "SERVER_ERROR", message: "内部错误", retryAfter: 5 };
  }

  // 模拟网络错误（抛异常而非返回 Result）
  throw new Error("网络连接失败");
}

// 安全的 API 调用包装器
async function safeApiCall(endpoint: string): Promise<ApiResult<string>> {
  try {
    return await simulatedApiCall(endpoint);
  } catch (err) {
    return {
      status: "error",
      code: "NETWORK_ERROR",
      message: (err as Error).message,
      isTimeout: false,
    };
  }
}

async function demoApiScenario() {
  const endpoints = [
    "/api/user",
    "/api/user/999",
    "/api/protected",
    "/api/crash",
    "/api/bad-connection",
  ];

  for (const ep of endpoints) {
    const result = await safeApiCall(ep);
    console.log("  " + ep + " → " + handleApiResult(result));
  }
}
demoApiScenario();

console.log("\\n错误处理模式演示完成！类型安全的错误处理让代码更健壮。");`,
  },

  // =========================================================
  // 第三章：设计模式 TypeScript 实现
  // =========================================================
  {
    id: "ts2-patterns",
    title: "设计模式 TypeScript 实现",
    icon: "🎯",
    group: "实战与进阶",
    content: `## 设计模式 TypeScript 实现 (Design Patterns in TypeScript)

设计模式（Design Patterns）是解决常见软件设计问题的可复用方案。TypeScript 的类型系统让这些模式更加类型安全、更加简洁。本章将用 TypeScript 实现八种经典设计模式：Builder、Factory、Singleton、Observer、Strategy、Chain of Responsibility、Adapter、Decorator，每个模式都配有完整的类型注解和实战代码。

### 1. Builder 模式（建造者模式）

Builder 模式用于**一步步构建复杂对象**，将对象的构造过程与表示分离。当对象有大量可选参数、或构造逻辑复杂时，Builder 比直接 new 更可读。

**TypeScript 实现要点**：
- Builder 类的方法返回 \`this\`，实现链式调用（Fluent API）。
- 最终 \`build()\` 方法返回目标对象。
- 可以用泛型约束 Builder 的类型参数。

\`\`\`ts
class RequestBuilder {
  private url: string = "";
  private method: "GET" | "POST" | "PUT" = "GET";
  private headers: Record<string, string> = {};
  private body: unknown = null;

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setMethod(method: "GET" | "POST" | "PUT"): this {
    this.method = method;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  build() {
    return { url: this.url, method: this.method, headers: this.headers, body: this.body };
  }
}
\`\`\`

**TypeScript 进阶**：可以用泛型 Builder 实现"逐步约束"——每个方法返回不同类型的 Builder，确保必填字段在 build() 前已填写。不过这属于"类型级 Builder"，实现较复杂，本节代码演示了简化版。

### 2. Factory 模式（工厂模式）

Factory 模式**将对象的创建委托给工厂方法**，而不是直接 new。当需要根据参数动态决定创建哪种对象、或需要统一的创建逻辑时，工厂模式非常有用。

**TypeScript 实现要点**：
- 用泛型约束工厂的输入输出类型。
- 工厂返回的类型可以是联合类型，用可辨识联合区分。
- 配合 enum 或字面量联合指定"产品类型"。

\`\`\`ts
interface PaymentProcessor {
  process(amount: number): string;
}

class WechatPay implements PaymentProcessor {
  process(amount: number) { return "微信支付: " + amount + " 元"; }
}

class Alipay implements PaymentProcessor {
  process(amount: number) { return "支付宝支付: " + amount + " 元"; }
}

class PaymentFactory {
  static create(type: "wechat" | "alipay"): PaymentProcessor {
    switch (type) {
      case "wechat": return new WechatPay();
      case "alipay": return new Alipay();
    }
  }
}
\`\`\`

工厂模式的关键价值在于**解耦创建与使用**——调用方不需要知道具体类名，只需指定类型标识。

### 3. Singleton 模式（单例模式）

Singleton 确保一个类**只有一个实例**，并提供全局访问点。在 TypeScript 中实现很简单：

\`\`\`ts
class Database {
  private static instance: Database;

  private constructor() {} // 私有构造，阻止外部 new

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  query(sql: string): string {
    return "执行: " + sql;
  }
}
\`\`\`

**TypeScript 的私有构造**是 Singleton 的关键——\`private constructor()\` 阻止了外部 \`new\`，确保只能通过 \`getInstance()\` 获取实例。

### 4. Observer 模式（观察者模式）

Observer 模式定义了**一对多**的依赖关系——当一个对象（Subject）状态变化时，所有依赖它的对象（Observer）都会收到通知。这是事件驱动架构的核心模式。

**TypeScript 实现要点**：
- 用 interface 定义 Observer 和 Subject 的契约。
- Subject 维护一个 Observer 列表，提供 subscribe/unsubscribe 方法。
- 泛型约束事件数据的类型。

\`\`\`ts
interface Observer<T> {
  update(data: T): void;
}

class Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notify(data: T): void {
    this.observers.forEach((o) => o.update(data));
  }
}
\`\`\`

**泛型 \`T\`** 让事件数据类型安全——每个 Observer 的 \`update\` 方法接收精确类型的事件数据，防止"传错数据"。

### 5. Strategy 模式（策略模式）

Strategy 模式定义一系列算法，把它们封装成独立的类，让它们可以**互相替换**。策略模式让算法的变化独立于使用算法的客户端。

**TypeScript 实现要点**：
- 用 interface 定义策略契约。
- 每个策略是一个实现了该接口的类。
- 上下文（Context）持有一个策略引用，可以动态切换。

\`\`\`ts
interface SortStrategy {
  sort(data: number[]): number[];
}

class BubbleSort implements SortStrategy {
  sort(data: number[]): number[] {
    // 冒泡排序实现
    const arr = [...data];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    return arr;
  }
}

class QuickSort implements SortStrategy {
  sort(data: number[]): number[] {
    // 快速排序实现
    if (data.length <= 1) return [...data];
    const pivot = data[0];
    const left = data.slice(1).filter((x) => x <= pivot);
    const right = data.slice(1).filter((x) => x > pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class Sorter {
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }

  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}
\`\`\`

### 6. Chain of Responsibility 模式（责任链模式）

责任链模式让多个处理器**形成一条链**，请求沿着链传递，直到被某个处理器处理。每个处理器决定"自己处理"还是"传给下一个"。

**TypeScript 实现要点**：
- 用抽象类或 interface 定义处理器契约。
- 每个处理器持有对下一个处理器的引用。
- 泛型约束请求类型。

\`\`\`ts
abstract class Handler<T> {
  private next: Handler<T> | null = null;

  setNext(handler: Handler<T>): Handler<T> {
    this.next = handler;
    return handler; // 返回下一个，方便链式 setNext
  }

  handle(request: T): string | null {
    const result = this.process(request);
    if (result !== null) return result;
    if (this.next) return this.next.handle(request);
    return null;
  }

  protected abstract process(request: T): string | null;
}
\`\`\`

### 7. Adapter 模式（适配器模式）

Adapter 模式将一个类的接口**转换成客户端期望的另一个接口**，让原本不兼容的接口可以一起工作。在整合第三方库或遗留代码时非常有用。

**TypeScript 实现**：适配器类实现目标接口，内部持有被适配对象的引用，通过委托调用完成转换。

### 8. Decorator 模式（装饰器模式）

Decorator 模式**动态地给对象添加额外的职责**，比继承更灵活。TypeScript 有两种实现方式：类装饰器（实验性语法）和手动包装。

**手动包装实现**：

\`\`\`ts
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

class TimestampLogger implements Logger {
  constructor(private logger: Logger) {}
  log(message: string): void {
    this.logger.log("[" + new Date().toISOString() + "] " + message);
  }
}

class LevelLogger implements Logger {
  constructor(private logger: Logger, private level: string) {}
  log(message: string): void {
    this.logger.log("[" + this.level + "] " + message);
  }
}
\`\`\`

装饰器可以嵌套——\`new LevelLogger(new TimestampLogger(new ConsoleLogger()), "INFO")\`——每个装饰器添加一层功能，最终产生组合效果。

### 本节代码演示

下面实现所有八种设计模式，每个模式配有完整的 TypeScript 类型注解和实战用例。`,
    code: `// ============================================================
// 第三章代码演示：设计模式 TypeScript 实现
// ============================================================
// 演示 Builder、Factory、Singleton、Observer、Strategy、
// Chain of Responsibility、Adapter、Decorator 八种模式。

// ---- 1. Builder 模式（建造者模式）----
console.log("========== 1. Builder 模式 ==========");

class RequestBuilder {
  private url: string = "";
  private method: "GET" | "POST" | "PUT" = "GET";
  private headers: Record<string, string> = {};
  private body: unknown = null;
  private timeout: number = 5000;

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setMethod(method: "GET" | "POST" | "PUT"): this {
    this.method = method;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  setBody(body: unknown): this {
    this.body = body;
    return this;
  }

  setTimeout(ms: number): this {
    this.timeout = ms;
    return this;
  }

  build() {
    return {
      url: this.url,
      method: this.method,
      headers: this.headers,
      body: this.body,
      timeout: this.timeout,
    };
  }
}

// 链式调用构建请求
const request = new RequestBuilder()
  .setUrl("/api/users")
  .setMethod("POST")
  .setHeader("Content-Type", "application/json")
  .setHeader("Authorization", "Bearer token123")
  .setBody({ name: "张三", age: 28 })
  .setTimeout(3000)
  .build();

console.log("Builder 构建的请求:");
console.log("  URL:", request.url);
console.log("  方法:", request.method);
console.log("  头部:", JSON.stringify(request.headers));
console.log("  请求体:", JSON.stringify(request.body));
console.log("  超时:", request.timeout + "ms");

// ---- 2. Factory 模式（工厂模式）----
console.log("\\n========== 2. Factory 模式 ==========");

interface PaymentProcessor {
  process(amount: number): string;
  getName(): string;
}

class WechatPay implements PaymentProcessor {
  getName() { return "微信支付"; }
  process(amount: number) { return "微信支付: ¥" + amount.toFixed(2); }
}

class Alipay implements PaymentProcessor {
  getName() { return "支付宝"; }
  process(amount: number) { return "支付宝支付: ¥" + amount.toFixed(2); }
}

class BankTransfer implements PaymentProcessor {
  getName() { return "银行转账"; }
  process(amount: number) { return "银行转账: ¥" + amount.toFixed(2); }
}

// 支付类型：字面量联合
type PaymentType = "wechat" | "alipay" | "bank";

// 工厂类
class PaymentFactory {
  static create(type: PaymentType): PaymentProcessor {
    switch (type) {
      case "wechat": return new WechatPay();
      case "alipay": return new Alipay();
      case "bank": return new BankTransfer();
    }
  }
}

// 使用工厂
const paymentTypes: PaymentType[] = ["wechat", "alipay", "bank"];
paymentTypes.forEach((type) => {
  const processor = PaymentFactory.create(type);
  console.log("  " + processor.getName() + ":", processor.process(99.99));
});

// ---- 3. Singleton 模式（单例模式）----
console.log("\\n========== 3. Singleton 模式 ==========");

class Database {
  private static instance: Database;
  private connectionId: string;

  private constructor() {
    this.connectionId = "DB-" + Math.random().toString(36).slice(2, 8);
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  query(sql: string): string {
    return "[" + this.connectionId + "] 执行: " + sql;
  }
}

// 多次获取，确认是同一个实例
const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log("db1 === db2:", db1 === db2, "（相同实例）");
console.log(db1.query("SELECT * FROM users"));
console.log(db2.query("INSERT INTO logs VALUES (1)"));

// ---- 4. Observer 模式（观察者模式）----
console.log("\\n========== 4. Observer 模式 ==========");

// 观察者接口
interface Observer<T> {
  update(data: T): void;
}

// 主题（被观察者）
class Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notify(data: T): void {
    this.observers.forEach((o) => o.update(data));
  }
}

// 具体观察者：日志记录器
class LogObserver implements Observer<{ message: string; level: string }> {
  update(data: { message: string; level: string }): void {
    console.log("  [日志观察者] " + data.level + ": " + data.message);
  }
}

// 具体观察者：邮件通知
class EmailObserver implements Observer<{ message: string; level: string }> {
  private email: string;
  constructor(email: string) { this.email = email; }
  update(data: { message: string; level: string }): void {
    if (data.level === "ERROR") {
      console.log("  [邮件观察者] 发送邮件到 " + this.email + ": " + data.message);
    }
  }
}

// 设置观察者模式
const eventBus = new Subject<{ message: string; level: string }>();
const logObs = new LogObserver();
const emailObs = new EmailObserver("admin@example.com");

eventBus.subscribe(logObs);
eventBus.subscribe(emailObs);

console.log("发布 INFO 事件:");
eventBus.notify({ message: "系统正常运行", level: "INFO" });

console.log("发布 ERROR 事件:");
eventBus.notify({ message: "数据库连接失败", level: "ERROR" });

// 取消订阅
eventBus.unsubscribe(logObs);
console.log("取消日志观察者后发布事件:");
eventBus.notify({ message: "不会再被日志观察者接收", level: "WARN" });

// ---- 5. Strategy 模式（策略模式）----
console.log("\\n========== 5. Strategy 模式 ==========");

interface SortStrategy {
  name: string;
  sort(data: number[]): number[];
}

class BubbleSort implements SortStrategy {
  name = "冒泡排序";
  sort(data: number[]): number[] {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

class QuickSort implements SortStrategy {
  name = "快速排序";
  sort(data: number[]): number[] {
    if (data.length <= 1) return [...data];
    const pivot = data[0];
    const left = data.slice(1).filter((x) => x <= pivot);
    const right = data.slice(1).filter((x) => x > pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class NativeSort implements SortStrategy {
  name = "原生排序";
  sort(data: number[]): number[] {
    return [...data].sort((a, b) => a - b);
  }
}

// 上下文：排序器
class Sorter {
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }

  execute(data: number[]): number[] {
    console.log("  使用策略: " + this.strategy.name);
    return this.strategy.sort(data);
  }
}

const testData = [5, 2, 8, 1, 9, 3, 7, 4, 6];
console.log("原始数据:", testData);

const sorter = new Sorter(new BubbleSort());
console.log("冒泡排序结果:", sorter.execute(testData));

sorter.setStrategy(new QuickSort());
console.log("快速排序结果:", sorter.execute(testData));

sorter.setStrategy(new NativeSort());
console.log("原生排序结果:", sorter.execute(testData));

// ---- 6. Chain of Responsibility 模式（责任链模式）----
console.log("\\n========== 6. Chain of Responsibility 模式 ==========");

// 请求类型
interface SupportRequest {
  type: "password" | "hardware" | "billing" | "other";
  description: string;
  priority: "low" | "medium" | "high";
}

// 抽象处理器
abstract class SupportHandler {
  private next: SupportHandler | null = null;

  setNext(handler: SupportHandler): SupportHandler {
    this.next = handler;
    return handler;
  }

  handle(request: SupportRequest): string {
    const result = this.process(request);
    if (result !== null) return result;
    if (this.next) return this.next.handle(request);
    return "无人处理: " + request.description;
  }

  protected abstract process(request: SupportRequest): string | null;
}

// 密码重置处理器
class PasswordHandler extends SupportHandler {
  protected process(request: SupportRequest): string | null {
    if (request.type === "password") {
      return "密码团队处理: " + request.description;
    }
    return null;
  }
}

// 硬件问题处理器
class HardwareHandler extends SupportHandler {
  protected process(request: SupportRequest): string | null {
    if (request.type === "hardware") {
      return "硬件团队处理: " + request.description;
    }
    return null;
  }
}

// 账单问题处理器
class BillingHandler extends SupportHandler {
  protected process(request: SupportRequest): string | null {
    if (request.type === "billing") {
      return "财务团队处理: " + request.description;
    }
    return null;
  }
}

// 构建责任链
const passwordHandler = new PasswordHandler();
const hardwareHandler = new HardwareHandler();
const billingHandler = new BillingHandler();

passwordHandler.setNext(hardwareHandler).setNext(billingHandler);

const supportRequests: SupportRequest[] = [
  { type: "password", description: "忘记密码，需要重置", priority: "high" },
  { type: "hardware", description: "显示器不亮", priority: "medium" },
  { type: "billing", description: "账单金额不对", priority: "low" },
  { type: "other", description: "茶水间咖啡机坏了", priority: "low" },
];

supportRequests.forEach((req) => {
  console.log("  " + passwordHandler.handle(req));
});

// ---- 7. Adapter 模式（适配器模式）----
console.log("\\n========== 7. Adapter 模式 ==========");

// 目标接口：统一的日志接口
interface Logger {
  log(message: string, level: string): void;
}

// 第三方日志库的接口（与我们的不同）
class ThirdPartyLogger {
  writeLog(level: number, msg: string): void {
    console.log("  [第三方日志] level=" + level + " msg=" + msg);
  }
}

// 适配器：将 ThirdPartyLogger 适配为 Logger 接口
class LoggerAdapter implements Logger {
  constructor(private thirdParty: ThirdPartyLogger) {}

  log(message: string, level: string): void {
    // 将字符串 level 转换为数字
    const levelMap: Record<string, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    const numLevel = levelMap[level] ?? 1;
    this.thirdParty.writeLog(numLevel, message);
  }
}

// 使用适配器
const thirdParty = new ThirdPartyLogger();
const adaptedLogger: Logger = new LoggerAdapter(thirdParty);

adaptedLogger.log("系统启动", "info");
adaptedLogger.log("警告: 磁盘空间不足", "warn");
adaptedLogger.log("错误: 无法连接数据库", "error");
console.log("→ 适配器成功将第三方接口转换为标准 Logger 接口");

// ---- 8. Decorator 模式（装饰器模式）----
console.log("\\n========== 8. Decorator 模式 ==========");

// 基础组件接口
interface Notifier {
  send(message: string): string;
}

// 基础组件
class EmailNotifier implements Notifier {
  send(message: string): string {
    return "邮件发送: " + message;
  }
}

// 装饰器：添加时间戳
class TimestampDecorator implements Notifier {
  constructor(private notifier: Notifier) {}
  send(message: string): string {
    const timestamp = new Date().toISOString().slice(11, 19);
    return this.notifier.send("[" + timestamp + "] " + message);
  }
}

// 装饰器：添加加密标记
class EncryptDecorator implements Notifier {
  constructor(private notifier: Notifier) {}
  send(message: string): string {
    return this.notifier.send("🔒[加密] " + message);
  }
}

// 装饰器：添加统计
class StatsDecorator implements Notifier {
  private count = 0;
  constructor(private notifier: Notifier) {}
  send(message: string): string {
    this.count++;
    return this.notifier.send(message) + " (第" + this.count + "次发送)";
  }
}

// 组合装饰器
const basicNotifier = new EmailNotifier();
console.log("基础发送:", basicNotifier.send("你好"));

const timestamped = new TimestampDecorator(basicNotifier);
console.log("加时间戳:", timestamped.send("你好"));

const encrypted = new EncryptDecorator(timestamped);
console.log("加加密:", encrypted.send("你好"));

const withStats = new StatsDecorator(encrypted);
console.log("加统计:", withStats.send("你好"));
console.log("再次发送:", withStats.send("再见"));

// 另一种组合
const encryptedFirst = new EncryptDecorator(new StatsDecorator(new EmailNotifier()));
console.log("\\n不同组合:", encryptedFirst.send("测试消息"));

console.log("\\n设计模式演示完成！TypeScript 的类型系统让设计模式更安全、更简洁。");`,
  },

  // =========================================================
  // 第四章：类型性能优化
  // =========================================================
  {
    id: "ts2-performance",
    title: "类型性能优化",
    icon: "⚡",
    group: "实战与进阶",
    content: `## 类型性能优化 (Type System Performance)

你可能觉得"类型性能"这个词很奇怪——类型不是编译期就消失了吗？怎么会影响性能？实际上，TypeScript 的类型检查过程本身需要时间和内存，在大型项目中不合理的类型设计会让编译变得非常慢。本章将深入讲解类型系统的性能优化：type vs interface 的性能差异、条件类型的惰性求值、避免过度递归、名义类型 vs 结构类型、编译器性能技巧、以及增量编译策略。

### 1. type vs interface 的性能差异

这是最常见的性能问题来源。type 和 interface 在功能上有很多重叠，但它们的**内部处理方式**不同：

**interface 的性能优势**：
- interface 可以被**缓存**——TypeScript 编译器会为每个 interface 创建单一的内部表示，重复引用时直接复用。
- interface 支持**声明合并**（declaration merging），编译器能高效地合并多个同名 interface。
- 在对象类型检查时，interface 的检查速度通常快于 type。

**type 的性能特点**：
- type 别名在每次使用时都会被**展开**——如果 type 是一个复杂的交叉类型或映射类型，展开的成本会累积。
- type 支持联合类型、交叉类型、条件类型等复杂构造，这些操作在类型检查时更消耗计算资源。

**性能建议**：
- 对于**对象形状**（object shapes），优先使用 interface。
- 对于**联合类型、交叉类型、映射类型**，使用 type。
- 对于**函数类型**，两者性能差异不大，interface 略优。

\`\`\`ts
// ✅ 推荐：对象形状用 interface
interface User {
  id: number;
  name: string;
  email: string;
}

// ✅ 推荐：联合类型用 type
type Status = "idle" | "loading" | "success" | "error";

// ✅ 推荐：映射类型用 type
type ReadonlyUser = { readonly [K in keyof User]: User[K] };

// ❌ 不推荐：简单的对象形状用 type（每次展开）
type UserType = { id: number; name: string; email: string };
\`\`\`

### 2. 条件类型的惰性求值

TypeScript 的条件类型是**惰性求值**的——只有当条件分支被实际使用时，才会计算对应的类型。你可以利用这个特性来优化性能：

\`\`\`ts
// 惰性：T 被确定后，只计算匹配的分支
type IsString<T> = T extends string ? "yes" : "no";

// 利用惰性求值避免不必要的计算
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function ? T[P] : DeepReadonly<T[P]>
    : T[P];
};
\`\`\`

**性能陷阱**：虽然条件类型是惰性的，但**分布式条件类型**（distributive conditional types）会对联合类型的每个成员分别计算。如果联合类型成员很多，计算量会线性增长：

\`\`\`ts
// 分布式条件类型：T 是 "a" | "b" | "c" | ... | "z" 时，会计算 26 次
type Upper<T> = T extends string ? Uppercase<T> : T;
\`\`\`

### 3. 避免过度递归

递归类型（如 \`DeepReadonly\`、\`DeepPartial\`）在嵌套层级很深时会导致编译器**耗尽递归深度**（默认限制是 50 层）。优化策略：

1. **尾递归优化**：TypeScript 4.5+ 对尾递归条件类型做了优化（如 \`Awaited<T>\` 的实现），但并非所有递归都能被优化。
2. **限制递归深度**：在类型中添加深度参数，手动限制递归层数：

\`\`\`ts
type DeepReadonly<T, Depth extends number = 5> = {
  readonly [P in keyof T]: Depth extends 0
    ? T[P]
    : T[P] extends object
      ? DeepReadonly<T[P], Subtract<Depth, 1>>
      : T[P];
};
\`\`\`

3. **避免不必要的递归**：如果数据结构只有一层，直接使用 \`Readonly<T>\` 而非 \`DeepReadonly<T>\`。

### 4. 名义类型 vs 结构类型

TypeScript 默认使用**结构类型**（Structural Typing），即"鸭子类型"——两个类型如果结构相同，它们就是兼容的。这有时会导致意外：

\`\`\`ts
interface UserId { value: string; }
interface OrderId { value: string; }

let uid: UserId = { value: "u1" };
let oid: OrderId = uid; // ✅ 结构兼容！但逻辑上不应该
\`\`\`

**名义类型**（Nominal Typing）可以解决这个问题，但在 TypeScript 中需要手动模拟：

\`\`\`ts
// 品牌类型（Branded Types）
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

let uid: UserId = "u1" as UserId;
// let oid: OrderId = uid; // ❌ 编译错误：类型不兼容
\`\`\`

品牌类型在**编译期完全消失**，运行时零开销，但在类型层面提供了名义类型的安全性。

### 5. 编译器性能技巧

以下技巧能显著提升大型项目的编译速度：

**a) 避免大型交叉类型**：
\`\`\`ts
// ❌ 慢：大型交叉类型
type Mega = A & B & C & D & E & F & G & H;

// ✅ 快：拆分为多个 interface
interface Mega extends A, B, C, D, E, F, G, H {}
\`\`\`

**b) 使用具体的类型而非宽泛的泛型**：
\`\`\`ts
// ❌ 慢：过度泛型
function map<T, U>(arr: T[], fn: (item: T) => U): U[] { ... }

// ✅ 快：如果类型已知，直接写具体类型
function mapNumbers(arr: number[], fn: (item: number) => number): number[] { ... }
\`\`\`

**c) 避免在联合类型上做复杂的条件类型**：
\`\`\`ts
// ❌ 慢：对大型联合类型做分布式条件
type AllKeys = keyof (A | B | C | D | E); // 计算量巨大

// ✅ 快：分开处理
type AKeys = keyof A;
type BKeys = keyof B;
// ... 然后手动合并
\`\`\`

**d) 使用 interface 声明合并而非交叉类型**：

\`\`\`ts
// ❌ 慢：复杂交叉类型
type Extended = Base & { extra: string };

// ✅ 快：interface 继承
interface Extended extends Base {
  extra: string;
}
\`\`\`

### 6. 增量编译与项目引用

大型项目应该使用 TypeScript 的**增量编译**和**项目引用**：

- **\`--incremental\`**：生成 \`.tsbuildinfo\` 文件，记录上次编译的各文件指纹。下次编译时只重新检查变化的文件。
- **\`--build\`** 模式：配合 \`references\` 字段，把大型项目拆成多个子项目，各自独立增量编译。

\`\`\`json
// tsconfig.json（根项目）
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ]
}
\`\`\`

每个子项目有自己的 \`tsconfig.json\`，\`composite: true\` 启用增量编译。改一个子项目时，只重新编译该子项目及其依赖者。

### 7. 跳过类型检查的编译

如果只是想快速运行代码而不关心类型错误，可以使用：

- **\`transpileOnly: true\`**（ts-node 配置）：只做转译，不做类型检查，速度提升 10 倍以上。
- **esbuild / swc**：用 Go/Rust 编写的转译器，速度比 tsc 快 100 倍，但不做类型检查。适合开发期热重载。
- **\`tsc --noEmit\`**：只做类型检查不输出 JS，适合 CI 中并行运行。

### 8. 类型性能基准参考

以下是一些性能基准参考（在大型项目中）：

| 操作 | 相对性能 |
| --- | --- |
| interface 对象检查 | 最快（缓存） |
| type 对象别名检查 | 略慢（每次展开） |
| 条件类型（简单） | 中等 |
| 条件类型（分布式，大型联合） | 慢 |
| 映射类型 | 中等 |
| 递归类型（浅层） | 中等 |
| 递归类型（深层，>10） | 慢 |
| 模板字面量类型（复杂） | 慢 |
| 交叉类型（大型） | 慢 |

### 本节代码演示

下面用代码演示类型性能关键概念：interface 缓存 vs type 展开、品牌类型（名义类型）、可控递归深度、以及编译优化技巧。`,
    code: `// ============================================================
// 第四章代码演示：类型性能优化
// ============================================================
// 演示 interface vs type 性能差异、品牌类型（名义类型）、
// 递归深度控制、避免过度计算、编译器优化技巧。

// ---- 1. interface 缓存 vs type 展开 ----
console.log("========== 1. interface 缓存 vs type 展开 ==========");

// 对象形状：推荐用 interface（编译器缓存）
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// 等价的 type 别名（每次使用都会展开，性能略差）
type UserType = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

// interface 支持声明合并（编译器利用此特性做缓存）
interface User {
  role?: string; // 合并后 User 多了 role 属性
}

const user: User = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
  createdAt: new Date(),
  role: "admin",
};

console.log("interface User（声明合并后）:", JSON.stringify(user));

// 使用场景判断
console.log("\\n类型选择指南:");
console.log("  对象形状 → interface（缓存优化）");
console.log("  联合类型 → type（如 Status = 'a' | 'b'）");
console.log("  映射类型 → type（如 Readonly<T>）");
console.log("  交叉类型 → type 或 interface extends");
console.log("  函数类型 → 两者均可，interface 略优");

// ---- 2. 品牌类型（名义类型，零运行时开销）----
console.log("\\n========== 2. 品牌类型（名义类型）==========");

// 品牌类型工具
type Brand<T, B> = T & { __brand: B };

// 不同的 ID 类型（结构相同但名义不同）
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type ProductId = Brand<string, "ProductId">;

// 创建品牌类型的辅助函数
function makeUserId(id: string): UserId {
  return id as UserId; // 运行时就是普通 string
}

function makeOrderId(id: string): OrderId {
  return id as OrderId;
}

function makeProductId(id: string): ProductId {
  return id as ProductId;
}

// 使用品牌类型
const uid = makeUserId("user-001");
const oid = makeOrderId("order-001");
const pid = makeProductId("prod-001");

console.log("UserId:", uid);
console.log("OrderId:", oid);
console.log("ProductId:", pid);

// 品牌类型在编译期防止混淆
// let wrong: OrderId = uid;  // ❌ 编译错误
console.log("→ 品牌类型编译期阻止类型混淆，运行时零开销（就是普通字符串）");

// 使用品牌类型的函数
function getUserById(id: UserId): string {
  return "用户: " + id;
}

function getOrderById(id: OrderId): string {
  return "订单: " + id;
}

console.log(getUserById(uid));
console.log(getOrderById(oid));
// console.log(getUserById(oid)); // ❌ 编译错误

// ---- 3. 控制递归深度 ----
console.log("\\n========== 3. 控制递归深度 ==========");

// 问题：深度递归的类型可能导致编译器耗尽递归深度
// 解决方案：用深度参数限制递归层数

// 辅助类型：减法
type Subtract<A extends number, B extends number> = 
  [0, 1, 2, 3, 4, 5][A] extends [0, 1, 2, 3, 4, 5][B] ? never : A;

// 带深度限制的 DeepReadonly
type DeepReadonly<T, Depth extends number = 3> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? T[P] extends Function
          ? T[P]
          : DeepReadonly<T[P], 2> // 限制深度
        : T[P];
    };

// 演示：三层嵌套对象
interface DeepConfig {
  level1: {
    value1: string;
    level2: {
      value2: number;
      level3: {
        value3: boolean;
      };
    };
  };
}

// 使用带深度限制的 DeepReadonly
const config: DeepReadonly<DeepConfig, 3> = {
  level1: {
    value1: "hello",
    level2: {
      value2: 42,
      level3: {
        value3: true,
      },
    },
  },
};

console.log("DeepReadonly 配置:", JSON.stringify(config));
// 以下都是编译错误（readonly），但运行时不会报错
// config.level1.value1 = "changed"; // ❌
console.log("→ DeepReadonly 保护所有层，但限制了递归深度防止性能问题");

// ---- 4. 避免过度计算：惰性条件类型 ----
console.log("\\n========== 4. 惰性条件类型 ==========");

// 动作类型：根据 ActionType 精确返回对应的 Action 类型
type ActionType = "create" | "update" | "delete" | "read";

type Action<T extends ActionType> = T extends "create"
  ? { type: "create"; payload: unknown }
  : T extends "update"
    ? { type: "update"; id: number; payload: Partial<unknown> }
    : T extends "delete"
      ? { type: "delete"; id: number }
      : { type: "read"; id?: number };

// 运行时演示
function createAction<T extends ActionType>(type: T, ...args: any[]): Action<T> {
  switch (type) {
    case "create":
      return { type: "create", payload: args[0] } as Action<T>;
    case "update":
      return { type: "update", id: args[0], payload: args[1] } as Action<T>;
    case "delete":
      return { type: "delete", id: args[0] } as Action<T>;
    case "read":
      return { type: "read", id: args[0] } as Action<T>;
  }
}

const actions = [
  createAction("create", { name: "新项目" }),
  createAction("update", 123, { name: "新名称" }),
  createAction("delete", 456),
  createAction("read", 789),
];

actions.forEach((a) => {
  console.log("  动作:", JSON.stringify(a));
});
console.log("→ 条件类型惰性求值，只计算匹配的分支，减少不必要的类型计算");

// ---- 5. 避免大型交叉类型 ----
console.log("\\n========== 5. 避免大型交叉类型 ==========");

// ❌ 慢：大型交叉类型
interface A { a: string; }
interface B { b: number; }
interface C { c: boolean; }
interface D { d: string[]; }
interface E { e: Date; }

// 类型别名：每次使用都需展开 A & B & C & D & E
type MegaType = A & B & C & D & E;

// ✅ 快：interface extends（编译器缓存）
interface MegaInterface extends A, B, C, D, E {}

// 运行时两者等价，但类型检查性能不同
const mega: MegaInterface = {
  a: "hello",
  b: 42,
  c: true,
  d: ["x", "y"],
  e: new Date(),
};

console.log("MegaInterface:", JSON.stringify({ a: mega.a, b: mega.b, c: mega.c, d: mega.d }));
console.log("→ interface extends 比 type 交叉类型更高效（编译器缓存）");

// ---- 6. 使用具体类型而非宽泛泛型 ----
console.log("\\n========== 6. 使用具体类型 ==========");

// 泛型版本（类型检查开销大，因为 T 和 U 不确定）
function genericMap<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// 具体类型版本（类型检查开销小，因为类型已知）
function stringMap(arr: string[], fn: (item: string) => string): string[] {
  return arr.map(fn);
}

// 在类型已知的场景，用具体类型更高效
const result1 = genericMap([1, 2, 3], (x) => (x * 2).toString());
const result2 = stringMap(["a", "b", "c"], (s) => s.toUpperCase());

console.log("泛型 map:", result1);
console.log("具体类型 map:", result2);
console.log("→ 类型已知时用具体类型，减少泛型推断开销");

// ---- 7. 增量编译与项目引用概念演示 ----
console.log("\\n========== 7. 增量编译概念演示 ==========");

// 模拟增量编译的"指纹"机制
import * as crypto from "crypto";

function hash(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
}

// 模拟 .tsbuildinfo 缓存的指纹
const buildCache: Record<string, string> = {
  "shared.ts": hash("export interface User { id: number; name: string; }"),
  "server.ts": hash("import { User } from './shared'; function handle(u: User) {}"),
  "client.ts": hash("import { User } from './shared'; function render(u: User) {}"),
};

// 当前文件内容
const currentFiles: Record<string, string> = {
  "shared.ts": "export interface User { id: number; name: string; email: string; }", // 改了
  "server.ts": "import { User } from './shared'; function handle(u: User) {}",
  "client.ts": "import { User } from './shared'; function render(u: User) {}",
};

console.log("增量编译分析:");
for (const [file, content] of Object.entries(currentFiles)) {
  const currentHash = hash(content);
  const cachedHash = buildCache[file];
  const changed = currentHash !== cachedHash;
  console.log("  " + file + ": " + (changed ? "❌ 已变化 → 重新编译" : "✅ 未变化 → 跳过"));
}
// shared.ts 改了，依赖它的 server.ts 和 client.ts 也需要重新编译
console.log("→ shared.ts 变化，其依赖者也需重新编译（依赖图传播）");

// ---- 8. 跳过类型检查的转译 ----
console.log("\\n========== 8. 跳过类型检查的转译 ==========");

// 模拟 transpileOnly 模式：只擦除类型，不检查
function transpileOnly(source: string): string {
  return source
    .replace(/:\s*[A-Za-z_][\w\s|&<>[\]]*/g, "") // 去除类型注解
    .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, "") // 去除 interface
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, ""); // 去除 type 别名
}

const tsCode = [
  "let name: string = 'hello';",
  "let count: number = 42;",
  "interface User { id: number; }",
  "const u: User = { id: 1 };",
  "type Status = 'on' | 'off';",
  "let s: Status = 'on';",
].join("\\n");

console.log("原始 TS:");
console.log(tsCode);
console.log("\\ntranspileOnly 后（跳过类型检查）:");
console.log(transpileOnly(tsCode));
console.log("→ transpileOnly 模式速度提升 10x+，但跳过类型检查");

// ---- 9. 性能优化清单 ----
console.log("\\n========== 9. 性能优化清单 ==========");

const tips: Array<{ tip: string; impact: string }> = [
  { tip: "对象形状用 interface 而非 type", impact: "中" },
  { tip: "大型交叉类型改用 interface extends", impact: "高" },
  { tip: "限制递归类型深度", impact: "高" },
  { tip: "避免对大型联合类型使用分布式条件类型", impact: "高" },
  { tip: "类型已知时用具体类型而非泛型", impact: "中" },
  { tip: "使用增量编译 --incremental", impact: "高" },
  { tip: "拆分大型项目为项目引用 references", impact: "高" },
  { tip: "开发期使用 transpileOnly 或 esbuild", impact: "极高" },
  { tip: "CI 中 tsc --noEmit 只做类型检查", impact: "中" },
  { tip: "使用品牌类型而非包装类实现名义类型", impact: "低" },
];

tips.forEach((t) => {
  console.log("  [" + t.impact + "] " + t.tip);
});

console.log("\\n类型性能优化演示完成！好类型设计 = 快速编译 + 安全代码。");`,
  },

  // =========================================================
  // 第五章：最佳实践与避坑指南
  // =========================================================
  {
    id: "ts2-best-practices",
    title: "最佳实践与避坑指南",
    icon: "🏆",
    group: "实战与进阶",
    content: `## 最佳实践与避坑指南 (Best Practices & Pitfalls)

TypeScript 的类型系统是一把双刃剑——用得好，代码健壮且可维护；用得不好，类型复杂度失控，反而拖慢开发效率。本章将汇总 TypeScript 开发中的最佳实践和常见陷阱，涵盖：strict 模式必选项、避免 any 用 unknown、非空断言替代方案、可辨识联合优于可选属性、readonly 无处不在、const 断言、satisfies 关键字、以及类型体操的边界。

### 1. strict 模式必开项

TypeScript 的 \`strict: true\` 会开启以下所有严格检查选项。每个选项都很重要：

**\`strictNullChecks\`**：最重要的选项。开启后 \`null\` 和 \`undefined\` 不再是所有类型的子类型，你必须显式处理它们：

\`\`\`ts
// strictNullChecks: off
let x: string = null; // ✅ 不报错（危险！）

// strictNullChecks: on
let y: string = null; // ❌ 编译错误
let z: string | null = null; // ✅ 正确：显式标注可为 null
\`\`\`

**\`strictFunctionTypes\`**：函数参数类型检查更严格（逆变检查）。它能防止通过函数类型赋值绕过类型检查。

**\`strictBindCallApply\`**：对 \`bind\`/\`call\`/\`apply\` 的参数做严格检查。

**\`strictPropertyInitialization\`**：类的属性必须在构造函数中初始化，防止未初始化的属性被访问。

**\`noImplicitAny\`**：禁止隐式 any。如果 TypeScript 无法推断类型，它必须显式标注，否则报错。

**\`noImplicitReturns\`**：函数的所有分支必须有返回值（或 throw）。

**\`noUnusedLocals\` / \`noUnusedParameters\`**：未使用的变量和参数报错。

**结论**：新项目**必须开 \`strict: true\`**。如果是迁移老项目，至少开启 \`strictNullChecks\` 和 \`noImplicitAny\`。

### 2. 避免 any，使用 unknown

\`any\` 是 TypeScript 的"逃生舱"——用了 any，等于关闭了类型检查。更好的替代品是 \`unknown\`：

\`\`\`ts
// ❌ any：完全放弃类型检查
let data: any;
data.foo();          // 不报错，运行时可能崩溃
data.bar = "hello";  // 不报错

// ✅ unknown：安全——必须类型收窄后才能使用
let data2: unknown;
// data2.foo();      // ❌ 编译错误
if (typeof data2 === "string") {
  console.log(data2.toUpperCase()); // ✅ 收窄后安全
}
\`\`\`

**any 的合法使用场景**（极少）：
- 逐步迁移 JS 项目到 TS 时的过渡期。
- 与没有类型定义的第三方库交互时（但优先用 \`@types\` 或声明文件）。
- 极少数泛型约束无法表达的场景（但先尝试 \`unknown\`）。

### 3. 非空断言（!）的替代方案

非空断言 \`!\` 告诉编译器"这个值一定不是 null/undefined"，但它是**运行时无保护的**——如果值实际上是 null，程序会崩溃：

\`\`\`ts
// ❌ 非空断言：危险
let user: User | null = getUser();
console.log(user!.name); // 如果 user 是 null，运行时崩溃！

// ✅ 方案 1：类型守卫
let user2: User | null = getUser();
if (user2 !== null) {
  console.log(user2.name); // 安全
}

// ✅ 方案 2：可选链
console.log(user?.name);

// ✅ 方案 3：提前返回
let user3: User | null = getUser();
if (user3 === null) return;
console.log(user3.name); // 编译器知道 user3 非 null

// ✅ 方案 4：Result 模式
// 返回 { ok: true, value: User } | { ok: false, error: Error }
\`\`\`

**非空断言唯一合理的使用场景**：你 100% 确定值非空，且 TypeScript 的类型推断能力有限无法推导出来。例如，在 \`Map.get()\` 后你确定 key 存在（但更好的做法是写类型守卫）。

### 4. 可辨识联合优于可选属性

当对象有多种形态时，用可辨识联合比用可选属性更类型安全：

\`\`\`ts
// ❌ 可选属性：类型不安全
interface Shape {
  kind: "circle" | "rect";
  radius?: number;   // 只有 circle 时需要
  width?: number;    // 只有 rect 时需要
  height?: number;   // 只有 rect 时需要
}

function area(s: Shape): number {
  if (s.kind === "circle") {
    return Math.PI * s.radius! ** 2; // 需要非空断言！不安全
  }
  return s.width! * s.height!; // 需要非空断言！不安全
}

// ✅ 可辨识联合：类型安全
type Circle = { kind: "circle"; radius: number };
type Rect = { kind: "rect"; width: number; height: number };
type Shape2 = Circle | Rect;

function area2(s: Shape2): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2; // 编译器知道 radius 存在
    case "rect":
      return s.width * s.height; // 编译器知道 width/height 存在
  }
}
\`\`\`

### 5. readonly 无处不在

给所有不该被修改的属性加上 \`readonly\`，这是成本最低的防御性编程：

\`\`\`ts
// ❌ 全部可变
interface Config {
  host: string;
  port: number;
  timeout: number;
}

// ✅ 只读属性
interface Config {
  readonly host: string;
  readonly port: number;
  readonly timeout: number;
}

// 函数参数加 readonly
function sum(arr: readonly number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}
\`\`\`

**建议**：默认给所有属性和函数参数加 \`readonly\`，只在确实需要修改时才去掉。这是"默认不可变"的编程哲学。

### 6. const 断言

\`as const\` 是 TypeScript 最被低估的特性之一。它把一个值推断为**最窄的字面量类型**，并将所有属性变为 \`readonly\`：

\`\`\`ts
// 不用 as const
const config = { host: "localhost", port: 3000 };
// 类型: { host: string; port: number } —— 太宽

// 用 as const
const config2 = { host: "localhost", port: 3000 } as const;
// 类型: { readonly host: "localhost"; readonly port: 3000 } —— 精确
\`\`\`

**重要用途**：从数组推导字面量联合类型，实现"单一数据源"：

\`\`\`ts
const STATUSES = ["idle", "loading", "success", "error"] as const;
type Status = typeof STATUSES[number]; // "idle" | "loading" | "success" | "error"
\`\`\`

### 7. satisfies 关键字

TypeScript 4.9 引入的 \`satisfies\` 是一个**不改变类型推导**的类型检查。它让你验证一个值是否符合某个类型，同时保留更精确的推导：

\`\`\`ts
// 用类型注解：丢失了精确信息
const palette: Record<string, string | number> = {
  red: "#ff0000",
  green: [0, 255, 0], // 拼写错误但没报错！
  blue: 255,
};
// palette.red.toUpperCase()  // ❌ 编译错误！red 是 string | number

// 用 satisfies：保留精确类型，同时检查
const palette2 = {
  red: "#ff0000",
  green: [0, 255, 0],
  blue: 255,
} satisfies Record<string, string | number>;
// palette2.red.toUpperCase() // ✅ 可以！red 的类型是 string 而非 string | number
// palette2.green 类型是 number[]，但满足了 Record<string, string | number>
\`\`\`

\`satisfies\` 的典型场景：
- 验证对象字面量符合某个接口，但保留每个属性自己的精确类型。
- 验证配置对象的结构，但不丢失每个配置项的具体值类型。

### 8. 类型体操的边界

TypeScript 的类型系统是图灵完备的，但这**不意味着你应该用它做所有事情**。类型体操（Type-level Programming）的合法边界：

**适合用类型体操**：
- 从现有类型推导新类型（如 \`Partial<T>\`、\`Pick<T, K>\`）。
- 类型安全的工具函数签名（如 \`call\`、\`bind\` 的类型）。
- 从数据推导字面量联合类型（\`as const\` + \`typeof\`）。

**不适合用类型体操**：
- 在类型中做复杂的业务逻辑（如计算税务、验证日期）。
- 用递归类型处理无限层级（运行时一个递归函数更清晰）。
- 试图用类型系统替代运行时验证（运行时数据来自外部，类型系统保护不了）。

**黄金法则**：如果类型比运行时代码还复杂，你可能做错了。好的类型应该是**简洁、清晰、易于理解**的，而不是炫耀技巧。

### 9. 常见陷阱汇总

1. **\`enum\` 的数值陷阱**：数值枚举对任意 number 开放，\`let x: MyEnum = 999\` 不报错。优先用字符串枚举或字面量联合。
2. **\`const enum\` 的跨工具链问题**：isolatedModules 下 const enum 会降级为普通枚举，跨文件内联失效。
3. **\`Object.keys()\` 返回 \`string[]\`**：TS 故意如此设计，因为运行时对象可能有额外属性。用 \`(Object.keys(obj) as (keyof typeof obj)[])\` 或自定义类型守卫。
4. **\`JSON.parse()\` 返回 \`any\`**：总是给解析结果加类型注解或类型守卫。
5. **函数重载顺序**：最具体的重载放在前面，TypeScript 按顺序匹配。
6. **\`this\` 的类型**：在回调函数中，\`this\` 的类型可能丢失，需要在函数签名中显式声明 \`this: SomeType\`。
7. **\`as\` 类型断言不是类型转换**：它只是编译期提示，运行时不做任何转换。\`"123" as unknown as number\` 不会真的把字符串变成数字。
8. **\`Partial<T>\` 的陷阱**：\`Partial<T>\` 让所有属性可选，但嵌套对象的属性仍是必填的。要用深 Partial 需自定义类型。

### 本节代码演示

下面演示 strict 模式效果、避免 any 用 unknown、非空断言替代方案、可辨识联合、as const、satisfies 关键字、以及常见陷阱。`,
    code: `// ============================================================
// 第五章代码演示：最佳实践与避坑指南
// ============================================================
// 演示 strict 模式效果、避免 any、非空断言替代、
// 可辨识联合、as const、satisfies、常见陷阱。

// ---- 1. strict 模式效果演示 ----
console.log("========== 1. strict 模式效果演示 ==========");

// 模拟 strictNullChecks 的效果
// strictNullChecks: on 时，以下代码编译错误
// let name: string = null; // ❌

// 正确做法：显式标注可为 null
let name: string | null = null;
console.log("string | null:", name, "（显式标注可为 null）");

// strictPropertyInitialization 效果
class User {
  // 用 ! 或构造函数初始化
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

const user = new User("张三", 28);
console.log("User 实例:", user.name, user.age);

// noImplicitReturns 效果
function getStatus(n: number): string {
  if (n > 0) return "正数";
  if (n < 0) return "负数";
  // 如果 n === 0 没有处理，noImplicitReturns 会报错
  return "零"; // 必须覆盖所有分支
}
console.log("getStatus(0):", getStatus(0));
console.log("getStatus(5):", getStatus(5));
console.log("getStatus(-3):", getStatus(-3));

// ---- 2. 避免 any，使用 unknown ----
console.log("\\n========== 2. 避免 any，使用 unknown ==========");

// any 的危险：完全跳过类型检查
let dangerous: any = "hello";
dangerous = 42;
dangerous = { foo: "bar" };
console.log("any 变量可以随意赋值:", dangerous);

// unknown 的安全：必须类型收窄
let safe: unknown = "hello world";
console.log("unknown 变量:", safe);
// console.log(safe.toUpperCase()); // ❌ 编译错误：unknown 没有 toUpperCase

// 类型收窄后安全使用
if (typeof safe === "string") {
  console.log("  收窄为 string 后:", safe.toUpperCase());
}

// 类型守卫函数
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function safeProcess(input: unknown): string {
  if (typeof input === "string") {
    return "字符串: " + input;
  }
  if (typeof input === "number") {
    return "数字: " + input.toFixed(2);
  }
  if (Array.isArray(input)) {
    return "数组: [" + input.join(", ") + "]";
  }
  if (isError(input)) {
    return "错误: " + input.message;
  }
  return "未知类型: " + typeof input;
}

console.log(safeProcess("hello"));
console.log(safeProcess(42));
console.log(safeProcess([1, 2, 3]));
console.log(safeProcess(new Error("出错了")));
console.log(safeProcess({ a: 1 }));

// ---- 3. 非空断言替代方案 ----
console.log("\\n========== 3. 非空断言替代方案 ==========");

interface Profile {
  name: string;
  avatar?: string;
}

function getProfile(): Profile | null {
  // 模拟可能返回 null
  return Math.random() > 0.3 ? { name: "张三", avatar: "avatar.png" } : null;
}

// ❌ 非空断言：危险
const profile1 = getProfile();
// console.log(profile1!.name); // 如果 profile1 是 null，运行时崩溃

// ✅ 替代方案 1：类型守卫
const profile2 = getProfile();
if (profile2 !== null) {
  console.log("方案 1 (类型守卫): " + profile2.name);
} else {
  console.log("方案 1: profile 为 null");
}

// ✅ 替代方案 2：可选链
const profile3 = getProfile();
console.log("方案 2 (可选链): " + (profile3?.name ?? "未知"));

// ✅ 替代方案 3：提前返回
function renderProfile(): string {
  const profile = getProfile();
  if (profile === null) {
    return "暂无用户信息";
  }
  // 这里 profile 被收窄为 Profile
  return "用户: " + profile.name + (profile.avatar ? " (有头像)" : " (无头像)");
}
console.log("方案 3 (提前返回): " + renderProfile());

// ✅ 替代方案 4：Result 模式
type Result2<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function safeGetProfile(): Result2<Profile> {
  const profile = getProfile();
  if (profile === null) {
    return { ok: false, error: new Error("用户不存在") };
  }
  return { ok: true, value: profile };
}

const result = safeGetProfile();
if (result.ok) {
  console.log("方案 4 (Result): " + result.value.name);
} else {
  console.log("方案 4 (Result): " + result.error.message);
}

// ---- 4. 可辨识联合优于可选属性 ----
console.log("\\n========== 4. 可辨识联合优于可选属性 ==========");

// ❌ 可选属性：需要非空断言，类型不安全
interface OldShape {
  kind: "circle" | "rect";
  radius?: number;
  width?: number;
  height?: number;
}

// ✅ 可辨识联合：类型安全，无需断言
type Circle = { kind: "circle"; radius: number };
type Rect = { kind: "rect"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };
type Shape = Circle | Rect | Triangle;

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
    case "triangle":
      return 0.5 * s.base * s.height;
  }
}

function describeShape(s: Shape): string {
  return "面积: " + area(s).toFixed(2);
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rect", width: 10, height: 20 },
  { kind: "triangle", base: 6, height: 8 },
];

shapes.forEach((s) => {
  console.log("  " + s.kind + " → " + describeShape(s));
});

// 穷尽检查：如果新增 shape 类型，default 分支会报错
function assertNeverShape(x: never): never {
  throw new Error("未处理的形状: " + JSON.stringify(x));
}

// 对比：可选属性版本需要大量非空断言
function areaOld(s: OldShape): number {
  if (s.kind === "circle") {
    return Math.PI * (s.radius ?? 0) ** 2; // 需要 ?? 0 防御
  }
  return (s.width ?? 0) * (s.height ?? 0); // 需要 ?? 0 防御
}
console.log("  可选属性版（需防御性编程）: circle area =", areaOld({ kind: "circle", radius: 5 }).toFixed(2));
console.log("→ 可辨识联合让每个分支的类型精确，无需非空断言");

// ---- 5. as const 断言 ----
console.log("\\n========== 5. as const 断言 ==========");

// 不用 as const：类型被宽化
const config1 = { host: "localhost", port: 3000, ssl: false };
// config1 类型: { host: string; port: number; ssl: boolean }

// 用 as const：类型精确
const config2 = { host: "localhost", port: 3000, ssl: false } as const;
// config2 类型: { readonly host: "localhost"; readonly port: 3000; readonly ssl: false }

console.log("宽类型 host:", config1.host, "（类型: string）");
console.log("精确类型 host:", config2.host, "（类型: 'localhost'）");

// 从数组推导字面量联合类型（单一数据源）
const DIRECTIONS = ["up", "down", "left", "right"] as const;
type Direction = typeof DIRECTIONS[number]; // "up" | "down" | "left" | "right"

console.log("DIRECTIONS 数组:", DIRECTIONS);
const move: Direction = "up";
console.log("Direction 类型值:", move);

// 从对象推导映射类型
const STATUS_MAP = {
  idle: "空闲",
  loading: "加载中",
  success: "成功",
  error: "出错",
} as const;

type StatusKey = keyof typeof STATUS_MAP; // "idle" | "loading" | "success" | "error"
type StatusValue = typeof STATUS_MAP[StatusKey]; // "空闲" | "加载中" | "成功" | "出错"

console.log("STATUS_MAP:", STATUS_MAP);
console.log("→ 一处定义，同时得到值和类型");

// ---- 6. satisfies 关键字 ----
console.log("\\n========== 6. satisfies 关键字 ==========");

// 用类型注解：丢失精确类型
const palette1: Record<string, string | number> = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  opacity: 0.8,
};
// palette1.red.toUpperCase() // ❌ red 是 string | number，没有 toUpperCase

// 用 satisfies：保留精确类型，同时验证结构
const palette2 = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  opacity: 0.8,
} satisfies Record<string, string | number>;

// 可以调用 string 方法，因为 TypeScript 知道 red 是 string
console.log("satisfies 保留精确类型: red =", palette2.red.toUpperCase());
console.log("  green =", palette2.green);
console.log("  opacity =", palette2.opacity.toFixed(1));

// satisfies 的另一个场景：验证配置对象
interface AppSettings {
  theme: { mode: string; colors: Record<string, string> };
  features: Record<string, boolean>;
}

const settings = {
  theme: {
    mode: "dark",
    colors: { primary: "#333", secondary: "#666" },
  },
  features: {
    darkMode: true,
    notifications: false,
    analytics: true,
  },
} satisfies AppSettings;

// 可以访问具体属性
console.log("AppSettings: theme=" + settings.theme.mode + ", features=" + JSON.stringify(settings.features));
console.log("→ satisfies 验证结构但不丢失精确类型");

// ---- 7. readonly 最佳实践 ----
console.log("\\n========== 7. readonly 最佳实践 ==========");

// 函数参数默认加 readonly
function sum(arr: readonly number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function processItems(items: readonly string[]): string {
  return items.map((s) => s.toUpperCase()).join(", ");
}

const myNumbers = [1, 2, 3, 4, 5];
const myItems = ["apple", "banana", "cherry"];

console.log("sum:", sum(myNumbers));
console.log("processItems:", processItems(myItems));
console.log("原数组未变:", myNumbers, myItems);

// readonly 防御意外修改
interface ReadonlyConfig {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly retries: number;
}

const appConfig: ReadonlyConfig = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};
// appConfig.timeout = 3000; // ❌ 编译错误
console.log("只读配置:", appConfig);
console.log("→ readonly 在编译期阻止意外修改");

// ---- 8. 常见陷阱演示 ----
console.log("\\n========== 8. 常见陷阱演示 ==========");

// 陷阱 1: Object.keys() 返回 string[]
console.log("陷阱 1: Object.keys() 返回 string[]");
const obj = { name: "张三", age: 28 };
const keys = Object.keys(obj); // string[]
console.log("  Object.keys 类型:", keys, "（类型是 string[]，不是 ('name' | 'age')[]）");
// 解决方案：类型断言
const typedKeys = Object.keys(obj) as (keyof typeof obj)[];
console.log("  类型断言后:", typedKeys);

// 陷阱 2: JSON.parse() 返回 any
console.log("\\n陷阱 2: JSON.parse() 返回 any");
const raw = '{"name":"李四","age":30}';
const parsed: { name: string; age: number } = JSON.parse(raw); // 必须显式注解
console.log("  JSON.parse 结果:", parsed.name, parsed.age, "（必须显式类型注解）");

// 陷阱 3: 数值枚举对任意 number 开放
console.log("\\n陷阱 3: 数值枚举的宽松检查");
enum Role {
  Admin = 0,
  User = 1,
  Guest = 2,
}
let role: Role = 999 as Role; // 不报错！数值枚举允许任意 number
console.log("  Role = 999 不报错:", role, "（数值枚举的宽松检查，历史原因）");

// 更好的做法：字符串枚举
enum SafeRole {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}
// let safeRole: SafeRole = "OTHER"; // ❌ 编译错误
console.log("  字符串枚举更严格: SafeRole.Admin =", SafeRole.Admin);

// 陷阱 4: as 断言不是类型转换
console.log("\\n陷阱 4: as 断言不是类型转换");
const strNum = "123";
const num = strNum as unknown as number; // 编译通过，但运行时 strNum 仍是字符串！
console.log("  '123' as unknown as number:", num, "（运行时仍是字符串！类型: " + typeof num + "）");
console.log("  → as 断言只在编译期有效，运行时不做任何转换");

// 陷阱 5: Partial<T> 是浅层的
console.log("\\n陷阱 5: Partial<T> 是浅层的");
interface Nested {
  a: { b: { c: number } };
}
type PartialNested = Partial<Nested>;
// PartialNested 的 a 是可选的，但 { b: { c: number } } 中的 b 和 c 仍是必填
console.log("  Partial<Nested> 只让 a 可选，b 和 c 仍是必填的（浅层 Partial）");

// ---- 9. 最佳实践清单 ----
console.log("\\n========== 9. 最佳实践清单 ==========");

const practices: Array<{ practice: string; reason: string }> = [
  { practice: "开启 strict: true", reason: "所有严格检查的基础" },
  { practice: "避免 any，用 unknown", reason: "any 关闭类型检查，unknown 强制安全收窄" },
  { practice: "避免非空断言 !", reason: "用类型守卫/可选链/提前返回代替" },
  { practice: "可辨识联合代替可选属性", reason: "每个分支类型精确，无需断言" },
  { practice: "默认加 readonly", reason: "防止意外修改，成本极低" },
  { practice: "用 as const 定义常量", reason: "保留字面量类型，实现单一数据源" },
  { practice: "用 satisfies 验证对象", reason: "验证结构但不丢失精确类型" },
  { practice: "对象形状用 interface", reason: "编译器缓存，性能更好" },
  { practice: "字符串枚举替代数值枚举", reason: "序列化友好，类型更严格" },
  { practice: "类型体操适可而止", reason: "类型比代码还复杂说明方向错了" },
];

practices.forEach((p, i) => {
  console.log("  " + (i + 1) + ". " + p.practice);
  console.log("     " + p.reason);
});

console.log("\\n最佳实践演示完成！好习惯让 TypeScript 成为生产力工具而非负担。");`,
  },
];