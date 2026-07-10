// =============================================================
// Node.js 运行原理教程（noderun）第 9-12 章数据
// -------------------------------------------------------------
// 包含章节：
//   nr-async-await     : async/await 原理（第二部分 异步编程原理）
//   nr-async-control   : 异步流程控制（第二部分 异步编程原理）
//   nr-require         : CommonJS require 原理（第三部分 模块系统原理）
//   nr-module-cache    : 模块缓存与循环依赖（第三部分 模块系统原理）
// =============================================================

export const chapters = [
  {
    id: "nr-async-await",
    group: "第二部分 异步编程原理",
    icon: "⏳",
    title: "async/await 原理：语法糖背后是什么",
    content: `# async/await 原理：语法糖背后是什么

## 一、async/await 不是新机制

很多开发者第一次接触 async/await 时，会以为它是 Node.js 新增的异步机制。其实不是！async/await 本质上是 **Promise + Generator 的语法糖**，它没有引入任何新的异步机制，底层依然依赖事件循环和 Promise。

理解这一点非常重要：async/await 只是用更同步的写法来组织异步代码，让代码更易读、更易维护，但它的"内核"还是 Promise。

## 二、async 函数的本质

### 2.1 自动包装成 Promise

async 函数最重要的特性是：**它的返回值会自动被包装成 Promise**。

- 如果 return 一个普通值，async 函数返回 \`Promise.resolve(值)\`
- 如果 throw 一个错误，async 函数返回 \`Promise.reject(错误)\`
- 如果 return 一个 Promise，async 函数返回这个 Promise（不会双层包装）

这意味着即使 async 函数里没有任何 await，它返回的也是 Promise。

### 2.2 为什么这样设计

这样设计的好处是统一了异步接口：调用 async 函数永远得到 Promise，调用者可以用 \`.then()\` 或 await 处理结果，不需要关心函数内部是否真的有异步操作。

## 三、await 的本质

### 3.1 暂停与恢复

await 的字面意思是"等待"，它的行为是：

1. 暂停当前 async 函数的执行
2. 等待右边的 Promise resolve
3. 拿到 resolve 的值，继续执行后面的代码
4. 如果 Promise reject，抛出错误（可以被 try/catch 捕获）

### 3.2 底层原理：等价于 then

await 的底层实现相当于把 await 后面的代码"剪切"到 then 回调里：

\`\`\`javascript
// async/await 写法
async function demo() {
  const a = await fetchA();
  const b = await fetchB(a);
  return b;
}

// 等价的 Promise 写法
function demo() {
  return fetchA().then(a => {
    return fetchB(a);
  }).then(b => {
    return b;
  });
}
\`\`\`

这就是为什么说 async/await 是语法糖——它能做的事，Promise 的 then 链也能做，只是写法更直观。

## 四、async/await 的优势

### 4.1 代码像同步一样易读

Promise 的 \`.then()\` 链虽然解决了回调地狱，但代码依然是"回调"风格。async/await 让异步代码看起来像同步代码，逻辑从上到下顺序执行，非常直观。

### 4.2 可以用 try/catch 捕获错误

Promise 的错误处理用 \`.catch()\`，但跨多个 await 的错误处理用 try/catch 更自然：

\`\`\`javascript
async function loadData() {
  try {
    const user = await getUser();
    const posts = await getPosts(user.id);
    return { user, posts };
  } catch (err) {
    // 任何一个 await 失败都会到这里
    console.error('加载失败:', err);
  }
}
\`\`\`

### 4.3 调试更方便

Promise 链中如果断点调试，会在 then 回调之间跳来跳去。async/await 是顺序执行，断点调试体验更好。

## 五、常见陷阱

### 5.1 循环中 await 导致串行

这是最常见的坑：在 for 循环中用 await，会导致每次迭代都等上一个完成才开始下一个，本来可以并行的操作变成了串行：

\`\`\`javascript
// ❌ 串行执行，慢
for (const url of urls) {
  const data = await fetch(url); // 一个接一个
}

// ✅ 并行执行，快
const results = await Promise.all(urls.map(url => fetch(url)));
\`\`\`

### 5.2 忘记加 await

忘记 await 会拿到 Promise 对象而不是值，后续操作可能出错：

\`\`\`javascript
async function bad() {
  const data = fetchData(); // 忘记 await
  console.log(data.length); // data 是 Promise，没有 length
}
\`\`\`

### 5.3 await 只能在 async 函数中

await 只能在 async 函数内部使用，在普通函数中使用会报语法错误。

## 六、生活类比：等外卖

理解 async/await，可以用"等外卖"来类比：

- **Promise** 是你点了外卖后留了电话，外卖小哥到了会打电话通知你（回调）。你可以同时做其他事，但需要处理"接到电话后做什么"的逻辑。
- **async/await** 是你站在门口等外卖，代码看起来在"等"（await），但实际上 Node.js 会去做其他事（处理其他请求），等外卖到了（Promise resolve）再回来继续执行。

关键区别是：站在门口等的不是"线程"，而是"async 函数的执行上下文"。Node.js 的事件循环依然在运转，可以处理其他任务。

## 七、日常开发启示

1. **串行还是并行**：如果多个异步操作互不依赖，用 \`Promise.all\` 并行；如果有依赖关系，用 await 串行。
2. **错误处理**：用 try/catch 包裹 await，特别是网络请求、文件操作等可能失败的场景。
3. **不要滥用 async**：如果函数内部没有 await，不需要声明为 async（除非接口要求返回 Promise）。
4. **注意 forEach 的坑**：\`Array.forEach\` 不会等待 async 回调，需要用 for...of 或 Promise.all。

## 八、总结

async/await 是 Promise 的语法糖，本质是"暂停 async 函数 + 等待 Promise + 恢复执行"。它让异步代码像同步一样易读，支持 try/catch 错误处理。但要警惕循环中 await 的串行陷阱、忘记加 await 的问题。掌握 async/await 的底层原理，能帮你写出更高效、更少 bug 的异步代码。`,
    code: `// ========== async/await 原理演示 ==========
console.log('========== async/await 原理演示 ==========\\n');

// 使用 async IIFE 包装，以便使用顶层 await
(async () => {
  // 【1. async 函数自动返回 Promise】
  console.log('【1. async 函数自动返回 Promise】');

  // 没有 await 的 async 函数，返回值也会被包装成 Promise
  async function simple() {
    return 'hello';
  }

  const result = simple();
  console.log('返回值类型:', result.constructor.name); // Promise
  result.then(val => console.log('then 获取值:', val));

  // 等价于普通函数返回 Promise.resolve
  function equivalent() {
    return Promise.resolve('hello');
  }
  console.log('等价写法返回:', equivalent().constructor.name);

  // throw 会变成 reject
  async function throwError() {
    throw new Error('出错了');
  }
  throwError().catch(err => console.log('捕获错误:', err.message));

  // 返回 Promise 不会双层包装
  async function returnPromise() {
    return Promise.resolve('已是 Promise');
  }
  returnPromise().then(val => console.log('返回 Promise:', val));
  console.log('');

  // 等待上面的 Promise 完成
  await new Promise(r => setTimeout(r, 50));

  // 【2. await 的"暂停"效果】
  console.log('【2. await 的"暂停"效果】');

  async function demoAwait() {
    console.log('  1. 开始执行');
    const value = await new Promise(resolve => {
      console.log('  2. Promise 内部执行');
      setTimeout(() => resolve('异步结果'), 100);
    });
    console.log('  3. await 后恢复，拿到:', value);
    return '完成';
  }

  console.log('调用 demoAwait 前（同步代码）');
  demoAwait().then(r => console.log('demoAwait 返回:', r));
  console.log('调用 demoAwait 后（同步代码继续）\\n');

  // 等待上面的异步完成
  await new Promise(r => setTimeout(r, 200));

  // 【3. 循环中 await 串行 vs Promise.all 并行】
  console.log('【3. 循环中 await 串行 vs Promise.all 并行】');

  // 模拟异步请求
  function mockRequest(name, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('  ' + name + ' 完成');
        resolve(name);
      }, delay);
    });
  }

  const tasks = [
    () => mockRequest('请求A', 200),
    () => mockRequest('请求B', 200),
    () => mockRequest('请求C', 200),
  ];

  // 串行：一个接一个，总时间约 600ms
  console.log('--- 串行 await（一个接一个）---');
  const serialStart = Date.now();
  const serialResults = [];
  for (const task of tasks) {
    serialResults.push(await task());
  }
  console.log('串行结果:', serialResults);
  console.log('串行总耗时:', Date.now() - serialStart, 'ms\\n');

  // 并行：同时发起，总时间约 200ms
  console.log('--- 并行 Promise.all（同时发起）---');
  const parallelStart = Date.now();
  const parallelResults = await Promise.all(tasks.map(t => t()));
  console.log('并行结果:', parallelResults);
  console.log('并行总耗时:', Date.now() - parallelStart, 'ms');
  console.log('结论：互不依赖的任务应该用 Promise.all 并行\\n');

  // 【4. try/catch 捕获 await 错误】
  console.log('【4. try/catch 捕获 await 错误】');

  async function fetchUser() {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('网络请求失败')), 50);
    });
  }

  async function fetchPosts() {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('数据库查询失败')), 50);
    });
  }

  async function loadData() {
    try {
      const user = await fetchUser();  // 如果失败，直接跳到 catch
      const posts = await fetchPosts();
      return { user, posts };
    } catch (err) {
      // 任何一个 await 失败都会到这里
      console.log('捕获到错误:', err.message);
      return null;
    }
  }

  const data = await loadData();
  console.log('loadData 返回:', data);
  console.log('');

  // 【5. 手写 async/await 转 Promise 的等价代码】
  console.log('【5. 手写 async/await 转 Promise 等价代码】');

  // async/await 原版
  async function originalCode() {
    console.log('  [原版] 步骤1');
    const a = await Promise.resolve('A');
    console.log('  [原版] 步骤2, 拿到:', a);
    const b = await Promise.resolve('B');
    console.log('  [原版] 步骤3, 拿到:', b);
    return a + b;
  }

  // 用 Promise then 链等价改写
  function equivalentCode() {
    console.log('  [等价] 步骤1');
    return Promise.resolve('A').then(a => {
      console.log('  [等价] 步骤2, 拿到:', a);
      return Promise.resolve('B').then(b => {
        console.log('  [等价] 步骤3, 拿到:', b);
        return a + b;
      });
    });
  }

  console.log('运行原版 async/await:');
  const r1 = await originalCode();
  console.log('原版结果:', r1);

  console.log('\\n运行等价 Promise 链:');
  const r2 = await equivalentCode();
  console.log('等价结果:', r2);
  console.log('两者行为完全一致！\\n');

  console.log('========== async/await 演示结束 ==========');
})();`
  },
  {
    id: "nr-async-control",
    group: "第二部分 异步编程原理",
    icon: "🎛️",
    title: "异步流程控制：并发、串行、限流实战",
    content: `# 异步流程控制：并发、串行、限流实战

## 一、为什么需要流程控制

在日常 Node.js 开发中，我们经常需要处理多个异步任务的编排：

- 批量请求 100 个 API 接口
- 串行执行一系列数据库迁移
- 限制并发数避免打爆服务器

这些场景都需要**异步流程控制**。掌握不同的控制模式，是写出高效、稳定 Node.js 应用的关键。

## 二、三种基本模式

### 2.1 串行执行

一个接一个地执行，前一个完成才开始下一个：

- 总时间 = 所有任务时间之和
- 适用于：任务之间有依赖关系（B 需要 A 的结果）

\`\`\`javascript
const results = [];
for (const task of tasks) {
  results.push(await task());
}
\`\`\`

### 2.2 全部并发

同时发起所有任务，等全部完成：

- 总时间 = 最慢的那个任务的时间
- 适用于：任务互不依赖，且资源充足

\`\`\`javascript
const results = await Promise.all(tasks.map(t => t()));
\`\`\`

### 2.3 并发限流

同时最多执行 N 个任务，一个完成才能开始下一个：

- 总时间介于串行和全部并发之间
- 适用于：任务量大，但服务器/资源有承受上限

## 三、Promise 静态方法详解

### 3.1 Promise.all

**特点**：全部成功才成功，一个失败就失败（快速失败）。

\`\`\`javascript
const [a, b, c] = await Promise.all([taskA(), taskB(), taskC()]);
\`\`\`

适用场景：所有任务都必须成功，任何一个失败都不行（如同时获取多个必要数据）。

### 3.2 Promise.allSettled

**特点**：等所有完成，无论成功失败。返回结果数组，每个元素有 status 字段。

\`\`\`javascript
const results = await Promise.allSettled([taskA(), taskB(), taskC()]);
// results: [{status:'fulfilled', value:...}, {status:'rejected', reason:...}]
\`\`\`

适用场景：不在乎部分失败，比如批量发邮件，发失败的记录下来就行。

### 3.3 Promise.race

**特点**：第一个完成（无论成功失败）就返回，其他继续执行但结果被忽略。

适用场景：请求超时控制（race 一个 setTimeout）、多个镜像源取最快响应。

### 3.4 Promise.any

**特点**：第一个成功就返回，忽略所有失败。只有全部失败才 reject。

适用场景：多个备用服务，只要有一个能用就行。

## 四、并发限流的实现原理

### 4.1 核心思想

并发限流的核心是维护一个"正在执行"的计数器：

1. 如果当前执行数 < 上限，立即开始新任务
2. 如果达到上限，等待某个任务完成再开始新的
3. 所有任务完成后，返回所有结果

### 4.2 实现思路

用 Promise 实现：

- 维护一个"正在执行"的集合
- 维护一个"等待执行"的队列
- 每个任务完成时，从队列取下一个执行

常见实现方式是"工作者池"模式：创建 N 个工作者，每个工作者不断从任务队列取任务执行，直到队列清空。

## 五、生活类比：停车场

理解并发限流，可以用"停车场"来类比：

- **全部并发** = 没有限制的露天停车场，车想来就来，可能挤爆
- **并发限流** = 限位停车场，满了就在门口等，有车出来才能进
- **串行执行** = 单车道隧道，一次只能过一辆车

并发限制就是"停车场容量"，控制同时进行的任务数，既保证效率，又不超出系统承受能力。

## 六、日常开发启示

1. **批量请求用并发限流**：比如请求 1000 个 URL，不要 \`Promise.all\` 全部并发（可能打爆服务器或触发限流），用并发限流每次 10-20 个。
2. **部分失败用 allSettled**：日志收集、批量通知等场景，个别失败不应影响整体。
3. **超时控制用 race**：\`Promise.race([请求, 超时Promise])\` 实现请求超时。
4. **备用方案用 any**：多个数据源，谁先成功用谁的结果。

## 七、总结

异步流程控制是 Node.js 开发的高频需求。串行适用于有依赖的任务，全部并发适用于独立小批量任务，并发限流适用于大批量任务。Promise.all/allSettled/race/any 各有适用场景。掌握并发限流的实现原理，能帮你写出既高效又稳定的批量处理代码。`,
    code: `// ========== 异步流程控制演示 ==========
console.log('========== 异步流程控制演示 ==========\\n');

// 模拟异步任务（返回一个函数，调用后开始执行）
function createTask(name, delay, shouldFail = false) {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        console.log('  ✗ ' + name + ' 失败');
        reject(new Error(name + ' 失败'));
      } else {
        console.log('  ✓ ' + name + ' 完成 (' + delay + 'ms)');
        resolve(name);
      }
    }, delay);
  });
}

// 使用 async IIFE 以便使用 await
(async () => {
  // 【1. 串行执行（for...of + await）】
  console.log('【1. 串行执行（for...of + await）】');
  const serialTasks = [
    createTask('任务1', 100),
    createTask('任务2', 100),
    createTask('任务3', 100),
  ];

  async function runSerial(tasks) {
    const results = [];
    for (const task of tasks) {
      results.push(await task());  // 等前一个完成才开始下一个
    }
    return results;
  }

  const serialStart = Date.now();
  const serialResults = await runSerial(serialTasks);
  console.log('串行结果:', serialResults);
  console.log('串行总耗时:', Date.now() - serialStart, 'ms (约300ms)\\n');

  // 【2. 全部并发（Promise.all）】
  console.log('【2. 全部并发（Promise.all）】');
  const parallelStart = Date.now();
  const parallelResults = await Promise.all(serialTasks.map(t => t()));
  console.log('并发结果:', parallelResults);
  console.log('并发总耗时:', Date.now() - parallelStart, 'ms (约100ms)\\n');

  // 【3. 手写并发限流函数】
  console.log('【3. 手写并发限流函数 limitConcurrency】');

  async function limitConcurrency(taskFactories, limit) {
    const results = new Array(taskFactories.length);
    let currentIndex = 0;

    // 工作者函数：不断取任务执行，直到没有任务
    async function worker() {
      while (currentIndex < taskFactories.length) {
        const index = currentIndex++;
        try {
          results[index] = { status: 'fulfilled', value: await taskFactories[index]() };
        } catch (err) {
          results[index] = { status: 'rejected', reason: err };
        }
      }
    }

    // 创建 limit 个工作者并发执行
    const workers = [];
    for (let i = 0; i < Math.min(limit, taskFactories.length); i++) {
      workers.push(worker());
    }
    await Promise.all(workers);
    return results;
  }

  // 测试：10 个任务，并发上限 3
  const manyTasks = Array.from({ length: 10 }, (_, i) =>
    createTask('任务' + (i + 1), 100)
  );

  console.log('10 个任务，并发上限 3：');
  const limitStart = Date.now();
  const limitResults = await limitConcurrency(manyTasks, 3);
  console.log('限流结果数:', limitResults.length);
  console.log('限流总耗时:', Date.now() - limitStart, 'ms (约400ms)');
  console.log('');

  // 【4. Promise.all vs Promise.allSettled】
  console.log('【4. Promise.all vs Promise.allSettled】');

  const mixedTaskFactories = [
    createTask('成功1', 50),
    createTask('失败1', 80, true),
    createTask('成功2', 60),
  ];

  // Promise.all：一个失败就整体失败
  console.log('--- Promise.all（一个失败就整体失败）---');
  try {
    const r = await Promise.all(mixedTaskFactories.map(t => t()));
    console.log('结果:', r);
  } catch (err) {
    console.log('失败:', err.message);
  }

  // Promise.allSettled：记录所有结果，无论成败
  console.log('\\n--- Promise.allSettled（记录所有结果）---');
  const settledResults = await Promise.allSettled([
    createTask('成功1', 50)(),
    createTask('失败1', 80, true)(),
    createTask('成功2', 60)(),
  ]);
  settledResults.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log('  [' + i + '] 成功:', r.value);
    } else {
      console.log('  [' + i + '] 失败:', r.reason.message);
    }
  });
  console.log('');

  // 【5. Promise.race 实现超时控制】
  console.log('【5. Promise.race 实现超时控制】');

  function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('超时 ' + ms + 'ms')), ms)
    );
    return Promise.race([promise, timeout]);
  }

  // 正常完成的请求
  console.log('请求 200ms，超时 500ms（应该成功）:');
  try {
    const r = await withTimeout(createTask('快速请求', 200)(), 500);
    console.log('结果:', r);
  } catch (err) {
    console.log('失败:', err.message);
  }

  // 超时的请求
  console.log('\\n请求 300ms，超时 100ms（应该超时）:');
  try {
    const r = await withTimeout(createTask('慢速请求', 300)(), 100);
    console.log('结果:', r);
  } catch (err) {
    console.log('失败:', err.message);
  }
  console.log('');

  // 【6. Promise.any：第一个成功就返回】
  console.log('【6. Promise.any：第一个成功就返回】');
  console.log('三个请求，第一个成功的返回:');
  const anyResult = await Promise.any([
    createTask('失败请求', 50, true)(),
    createTask('成功请求', 100)(),
    createTask('备用请求', 200)(),
  ]);
  console.log('第一个成功的结果:', anyResult);
  console.log('');

  console.log('========== 异步流程控制演示结束 ==========');
})();`
  },
  {
    id: "nr-require",
    group: "第三部分 模块系统原理",
    icon: "📦",
    title: "CommonJS require 原理：模块是怎么加载的",
    content: `# CommonJS require 原理：模块是怎么加载的

## 一、require 不是关键字

很多人以为 require 是 JavaScript 的关键字，像 import 一样。其实不是！require 只是一个**函数**，它在模块执行时被注入到模块作用域中。

当你写 \`require('fs')\` 时，实际上是在调用一个名为 require 的函数。这个函数由 Node.js 的模块系统（Module 类）提供。

## 二、require 的加载过程（5 步）

### 2.1 路径解析

第一步是把模块标识符解析成绝对路径：

- 相对路径（\`./xxx\`）→ 基于当前模块的 \`__dirname\` 解析
- 绝对路径（\`/xxx\`）→ 直接使用
- 包名（如 \`'express'\`）→ 查找 node_modules（从当前目录向上逐级查找）

### 2.2 缓存检查

第二步检查 \`Module._cache\` 中是否已经加载过这个模块：

- 如果有缓存，直接返回缓存的 \`module.exports\`
- 这就是为什么一个模块无论 require 多少次，都只会执行一次

### 2.3 文件定位

第三步找到具体的文件：

1. 如果路径有扩展名，直接尝试加载
2. 没有扩展名，依次尝试 \`.js\`、\`.json\`、\`.node\`
3. 如果是个目录，查找 \`package.json\` 的 \`main\` 字段
4. 如果没有 main 或 main 指向的文件不存在，查找 \`index.js\`

### 2.4 模块编译

第四步是核心：读取文件内容，**包装成一个函数**：

\`\`\`javascript
(function(exports, require, module, __filename, __dirname) {
  // 你的模块代码原封不动放在这里
});
\`\`\`

这个包装函数有 5 个参数：\`exports\`、\`require\`、\`module\`、\`__filename\`、\`__dirname\`。这就是为什么你在每个模块里都能直接用这 5 个变量——它们是函数参数！

### 2.5 缓存并返回

第五步把导出的 \`module.exports\` 缓存起来，返回给调用者。

## 三、模块包装函数的意义

### 3.1 隔离作用域

每个模块都被包在一个函数里执行，所以每个模块有自己的作用域。你在 \`a.js\` 里定义的变量，不会污染 \`b.js\`，即使没有用 let/const。

### 3.2 注入全局变量

通过函数参数，Node.js 给每个模块注入了 5 个"全局"变量：

- **exports**：指向 \`module.exports\` 的引用（快捷方式）
- **require**：加载其他模块的函数
- **module**：当前模块对象
- **__filename**：当前文件的绝对路径
- **__dirname**：当前文件所在目录

## 四、exports vs module.exports 的陷阱

### 4.1 它们的关系

初始时，exports 和 module.exports 指向同一个对象：

\`\`\`javascript
exports === module.exports  // true
\`\`\`

所以 \`exports.foo = 1\` 和 \`module.exports.foo = 1\` 效果相同。

### 4.2 直接赋值的陷阱

如果你直接给 exports 赋值，会断开引用：

\`\`\`javascript
exports = { foo: 1 };  // ❌ 无效！
\`\`\`

这相当于让 exports 指向新对象，但 \`module.exports\` 还是指向原来的空对象。require 返回的是 \`module.exports\`，所以调用者拿不到 foo。

正确做法：

\`\`\`javascript
module.exports = { foo: 1 };  // ✅ 正确
// 或
exports.foo = 1;  // ✅ 正确（修改原对象）
\`\`\`

## 五、require 是同步的

### 5.1 为什么同步

CommonJS 的 require 是同步的：模块加载会阻塞当前代码执行。这是因为 CommonJS 设计之初主要服务于服务器端，模块文件都在本地，同步加载很快。

### 5.2 不能在异步中条件 require

因为 require 是同步的，所以不适合在异步回调中条件 require：

\`\`\`javascript
if (condition) {
  const lib = require('lib');  // 会阻塞事件循环
}
\`\`\`

虽然技术上能执行，但会阻塞事件循环，且无法利用静态分析优化。

### 5.3 ES Modules 的区别

ES Modules 的 import 是静态的，在编译阶段就确定依赖关系，支持异步加载和 Tree Shaking。这是 ES Modules 相比 CommonJS 的优势。

## 六、生活类比：图书馆借书

require 就像去图书馆借书：

1. **路径解析**：查目录找到书在哪个书架
2. **缓存检查**：看借阅记录，这本书是否已经借过（在手上）
3. **文件定位**：走到书架，找到具体那本书
4. **编译包装**：登记借阅，给书盖上"借出"章
5. **缓存返回**：记录在案，下次借同一本书直接从你这儿拿

第一次借要完整走流程，第二次借同一本书直接从缓存（你的书架）拿，不用再跑图书馆。

## 七、日常开发启示

1. **理解 exports 的坑**：导出整个对象用 \`module.exports\`，添加属性用 \`exports.xxx\`。
2. **require 是同步的**：只在模块顶层 require，不要在异步回调里 require。
3. **模块只执行一次**：利用这个特性可以实现单例，但要注意不要在模块里存可变状态。
4. **循环依赖要小心**：后 require 的模块可能拿到不完整的导出（下一章详解）。

## 八、总结

require 是一个函数，不是关键字。模块加载经过路径解析、缓存检查、文件定位、编译包装、缓存返回 5 步。每个模块都被包装在一个函数里，所以有独立作用域。exports 是 module.exports 的引用，直接赋值 exports 会断开引用。require 是同步的，只在模块顶层使用。理解这些原理，能帮你避开 CommonJS 的各种坑。`,
    code: `// ========== CommonJS require 原理演示 ==========
console.log('========== CommonJS require 原理演示 ==========\\n');

const Module = require('module');
const path = require('path');
const fs = require('fs');

// 【1. 模拟 require 的加载过程（简化版）】
console.log('【1. 模拟 require 加载过程（简化版）】');

const moduleCache = {};

function myRequire(filename) {
  // 步骤1：路径解析（转绝对路径）
  const absolutePath = path.resolve(filename);
  console.log('  步骤1 路径解析: ' + filename + ' -> ' + absolutePath);

  // 步骤2：缓存检查
  if (moduleCache[absolutePath]) {
    console.log('  步骤2 命中缓存，直接返回');
    return moduleCache[absolutePath].exports;
  }
  console.log('  步骤2 缓存未命中，继续加载');

  // 步骤3：创建模块对象并提前缓存（处理循环依赖）
  const module = { exports: {}, id: absolutePath };
  moduleCache[absolutePath] = module;

  // 步骤4：读取文件内容
  const code = fs.readFileSync(absolutePath, 'utf-8');
  console.log('  步骤3 文件定位成功，读取 ' + code.length + ' 字符');

  // 查看 Module.wrap 的效果（包装成函数）
  const wrapped = Module.wrap(code);
  console.log('  步骤4 包装函数头部: ' + wrapped.slice(0, 80) + '...');

  // 步骤5：编译执行模块代码
  console.log('  步骤5 执行模块代码，缓存并返回');
  const compiledFn = new Function(
    'module', 'exports', 'require', '__filename', '__dirname',
    code + '\\n;return module.exports;'
  );
  compiledFn(module, module.exports, myRequire, absolutePath, path.dirname(absolutePath));

  return module.exports;
}
console.log('');

// 【2. 演示 exports vs module.exports 的区别】
console.log('【2. exports vs module.exports 的区别】');

// 模拟创建模块对象
function createModule() {
  const module = { exports: {} };
  return module;
}

// 情况1：exports.foo = xxx（正确，修改原对象）
const mod1 = createModule();
const exports1 = mod1.exports;
exports1.foo = 'bar';
console.log('情况1 exports.foo = "bar"（正确）:');
console.log('  module.exports:', JSON.stringify(mod1.exports));
console.log('  exports === module.exports:', exports1 === mod1.exports);
console.log('');

// 情况2：exports = { foo } （错误！断开引用）
const mod2 = createModule();
let exports2 = mod2.exports;
exports2 = { foo: 'bar' };  // 重新赋值，断开引用
console.log('情况2 exports = { foo: "bar" }（错误！）:');
console.log('  module.exports:', JSON.stringify(mod2.exports));
console.log('  exports === module.exports:', exports2 === mod2.exports);
console.log('  require 返回的是 module.exports（空的！）\\n');

// 情况3：module.exports = { foo }（正确）
const mod3 = createModule();
mod3.exports = { foo: 'bar' };
console.log('情况3 module.exports = { foo: "bar" }（正确）:');
console.log('  module.exports:', JSON.stringify(mod3.exports));
console.log('');

// 【3. 演示模块只执行一次（缓存验证）】
console.log('【3. 模块只执行一次（缓存验证）】');

let executionCount = 0;
const cache = {};

function requireWithCache(id, factory) {
  if (cache[id]) {
    console.log('  [' + id + '] 命中缓存，跳过执行');
    return cache[id];
  }
  console.log('  [' + id + '] 首次加载，执行模块代码');
  executionCount++;
  const exports = factory();
  cache[id] = exports;
  return exports;
}

// 同一模块 require 三次
requireWithCache('moduleA', () => ({ value: 'A' }));
requireWithCache('moduleA', () => ({ value: 'A' }));
requireWithCache('moduleA', () => ({ value: 'A' }));
console.log('  实际执行次数:', executionCount, '（只执行了一次！）\\n');

// 【4. 演示模块包装函数的存在】
console.log('【4. 演示模块包装函数的存在】');
console.log('每个模块都被包装在这个函数里:');
console.log('  (function(exports, require, module, __filename, __dirname) {');
console.log('    // 你的模块代码');
console.log('  })');
console.log('');

// 验证：在模块作用域中 arguments 就是包装函数的参数
console.log('验证：当前模块的 arguments（包装函数的参数）:');
console.log('  arguments.length:', arguments.length);
if (arguments.length >= 5) {
  console.log('  arguments[0] (exports):', typeof arguments[0]);
  console.log('  arguments[1] (require):', typeof arguments[1]);
  console.log('  arguments[2] (module):', typeof arguments[2]);
  console.log('  arguments[3] (__filename):', arguments[3]);
  console.log('  arguments[4] (__dirname):', arguments[4]);
}
console.log('');

// 【5. 查看 require.resolve 的路径解析】
console.log('【5. require.resolve 解析路径】');
console.log('require.resolve("fs"):', require.resolve('fs'));
console.log('require.resolve("path"):', require.resolve('path'));
console.log('');

// 【6. 查看 Module._cache 中的缓存】
console.log('【6. 查看模块缓存 require.cache】');
const cacheKeys = Object.keys(require.cache);
console.log('当前已缓存的模块数量:', cacheKeys.length);
console.log('部分缓存模块:');
cacheKeys.slice(0, 5).forEach(key => {
  console.log('  -', key);
});
console.log('  ... (共', cacheKeys.length, '个模块)\\n');

console.log('========== require 原理演示结束 ==========');
console.log('\\n核心要点:');
console.log('1. require 是函数，不是关键字');
console.log('2. 加载过程：路径解析→缓存检查→文件定位→编译包装→缓存返回');
console.log('3. 每个模块被包装在函数中，有独立作用域');
console.log('4. exports 是 module.exports 的引用，直接赋值会断开');
console.log('5. 模块只执行一次，结果被缓存');`
  },
  {
    id: "nr-module-cache",
    group: "第三部分 模块系统原理",
    icon: "♻️",
    title: "模块缓存与循环依赖：require 的陷阱",
    content: `# 模块缓存与循环依赖：require 的陷阱

## 一、模块缓存机制

### 1.1 缓存的基本原理

Node.js 的模块系统有一个重要特性：**每个模块在第一次被 require 时执行，执行结果被缓存到 \`Module._cache\` 中，后续的 require 直接返回缓存结果，不会重新执行模块代码。**

这意味着：

- 模块顶层的代码只会执行一次
- 无论 require 多少次，拿到的都是同一个对象引用
- 模块内部的计算只发生一次

### 1.2 缓存的好处

1. **性能提升**：避免重复加载和执行模块代码
2. **单例模式**：天然实现单例，所有引用者共享同一份数据
3. **一致性**：保证所有模块看到的是同一份配置/状态

### 1.3 缓存的坑

缓存也是把双刃剑：

- 模块内部如果保存了可变状态，修改会影响所有引用者（因为是同一个对象引用）
- 这可能导致意料之外的副作用，尤其在测试时

## 二、循环依赖（Circular Dependency）

### 2.1 什么是循环依赖

循环依赖指模块 A 依赖模块 B，模块 B 又依赖模块 A：

\`\`\`
a.js: const b = require('./b');
b.js: const a = require('./a');
\`\`\`

这是一种代码异味（code smell），通常意味着模块划分有问题。

### 2.2 Node.js 如何处理循环依赖

Node.js 通过"提前缓存"机制处理循环依赖：

1. 开始加载 \`a.js\`，**先把 a 的空 module 对象放入缓存**
2. 执行 \`a.js\` 代码，遇到 \`require('./b')\`
3. 开始加载 \`b.js\`，先把 b 的空 module 对象放入缓存
4. 执行 \`b.js\` 代码，遇到 \`require('./a')\`
5. 检查缓存，发现 a 已经在缓存中（虽然还没执行完）
6. 返回 a 的**不完整**导出对象
7. \`b.js\` 继续执行完毕
8. 回到 \`a.js\` 继续执行

### 2.3 循环依赖的结果

**后 require 的模块拿到的是不完整的导出对象。**

比如 \`a.js\` 先执行，在 require b 之前定义了函数 foo，但 require b 之后才定义函数 bar。如果 \`b.js\` 在加载时 require a，拿到的 a 只有 foo，没有 bar（因为 a 还没执行到定义 bar 的地方）。

## 三、生活类比：两人互相问问题

理解循环依赖，可以用"两人互相问问题"来类比：

- A 问 B："这个问题的答案是什么？"
- B 说："我得先问问 A"
- A 说："我还没想好，我正准备问你呢"
- B 只能先拿 A 目前想到的部分答案（不完整）
- 等 B 回答完，A 才能继续想，给出完整答案

问题在于 B 拿到的是 A 的"半成品"答案，可能不是最终结果。

## 四、解决方案

### 4.1 避免循环依赖（最佳方案）

最根本的解决办法是重构代码结构，消除循环依赖：

- 把共享的逻辑提取到第三个模块 C
- A 和 B 都依赖 C，但 A 和 B 之间不互相依赖

### 4.2 延迟 require

如果无法重构，可以在函数内部 require（延迟加载）：

\`\`\`javascript
// a.js
function doSomething() {
  const b = require('./b');  // 延迟到调用时
  b.helper();
}
module.exports = { doSomething };
\`\`\`

这样在模块加载阶段不会触发循环依赖，只有在函数实际调用时才 require。

### 4.3 确保导出在 require 之前

如果必须循环依赖，至少确保被依赖的部分在 require 之前定义：

\`\`\`javascript
// a.js
module.exports.foo = function() {};  // 先导出
const b = require('./b');  // 再 require b
module.exports.bar = function() {};  // b 拿不到 bar
\`\`\`

## 五、日常开发启示

### 5.1 "xxx is not a function" 的诡异错误

遇到 \`TypeError: xxx is not a function\` 而代码看起来没错，很可能是循环依赖导致拿到的导出不完整。被 require 的模块还没执行到定义该函数的地方。

### 5.2 利用缓存实现单例

可以利用模块缓存实现单例模式，但要注意：

- 不要在模块里存可变的全局状态
- 如果需要可变状态，提供方法修改而不是直接操作

### 5.3 测试时清除缓存

单元测试时，如果需要重新加载模块，可以用 \`delete require.cache[require.resolve('./module')]\` 清除缓存。

## 六、总结

模块缓存是 CommonJS 的核心特性：模块只执行一次，结果被缓存。这带来性能优势和单例效果，但也可能导致状态共享的副作用。循环依赖是 require 的经典陷阱：后 require 的模块拿到不完整的导出。解决方案是避免循环依赖、提取共享模块、或使用延迟 require。理解这些原理，能帮你排查 "xxx is not a function" 等诡异错误。`,
    code: `// ========== 模块缓存与循环依赖演示 ==========
console.log('========== 模块缓存与循环依赖演示 ==========\\n');

const path = require('path');
const fs = require('fs');
const os = require('os');

// 【1. 演示模块缓存的单例效果】
console.log('【1. 模块缓存的单例效果】');

// 模拟模块系统
const moduleCache = {};

function defineModule(id, factory) {
  if (moduleCache[id]) {
    return moduleCache[id].exports;
  }
  const module = { exports: {} };
  moduleCache[id] = module;
  factory(module, module.exports);
  return module.exports;
}

// 定义一个带计数器的模块
defineModule('counter', (module, exports) => {
  let count = 0;
  console.log('  [counter] 模块代码执行（只执行一次）');
  module.exports = {
    increment: () => ++count,
    getCount: () => count,
  };
});

// 多次"require"同一模块
const counter1 = moduleCache['counter'].exports;
const counter2 = moduleCache['counter'].exports;
console.log('  counter1 === counter2:', counter1 === counter2);  // true
counter1.increment();
counter1.increment();
counter2.increment();
console.log('  counter1.getCount():', counter1.getCount());  // 3
console.log('  counter2.getCount():', counter2.getCount());  // 3（同一个对象！）
console.log('');

// 【2. 模拟循环依赖场景】
console.log('【2. 模拟循环依赖场景（A require B, B require A）】');

const cache = {};

function myRequire(id, factory) {
  // 步骤1：缓存检查
  if (cache[id]) {
    console.log('  [' + id + '] 命中缓存（可能不完整！）');
    return cache[id].exports;
  }
  // 步骤2：提前创建并缓存空模块（关键！）
  const module = { exports: {} };
  cache[id] = module;
  console.log('  [' + id + '] 开始加载，创建空缓存');

  // 步骤3：执行模块代码
  factory(module, module.exports, myRequire);

  console.log('  [' + id + '] 加载完成');
  return module.exports;
}

// 模块 A：定义 funcA 后 require B，之后定义 funcA2
const moduleAFactory = (module, exports, require) => {
  exports.funcA = function() { return 'A 的函数'; };
  console.log('  [A] 定义了 funcA');
  const b = require('B', moduleBFactory);
  console.log('  [A] require B 后，b.funcB:', typeof b.funcB);
  console.log('  [A] require B 后，b.funcA:', typeof b.funcA);
  // 注意：此时 A 还没定义 funcA2
  exports.funcA2 = function() { return 'A 的第二个函数'; };
  console.log('  [A] 定义了 funcA2（B 拿不到这个！）');
};

// 模块 B：require A
const moduleBFactory = (module, exports, require) => {
  console.log('  [B] 开始执行，准备 require A');
  const a = require('A', moduleAFactory);
  console.log('  [B] require A 后，a.funcA:', typeof a.funcA);
  console.log('  [B] require A 后，a.funcA2:', typeof a.funcA2);  // undefined！
  exports.funcB = function() { return 'B 的函数'; };
  console.log('  [B] 定义了 funcB');
};

console.log('--- 开始加载模块 A ---');
const aResult = myRequire('A', moduleAFactory);
console.log('\\n--- 循环依赖结果 ---');
console.log('aResult.funcA:', typeof aResult.funcA);    // function
console.log('aResult.funcA2:', typeof aResult.funcA2);  // function
console.log('注意：B 在加载时拿到的 A 只有 funcA，没有 funcA2\\n');

// 【3. 延迟 require 解决循环依赖】
console.log('【3. 延迟 require 解决循环依赖】');

const cache2 = {};

function delayedRequire(id, factory) {
  if (cache2[id]) return cache2[id].exports;
  const module = { exports: {} };
  cache2[id] = module;
  factory(module, module.exports, delayedRequire);
  return module.exports;
}

// 模块 A：用延迟 require（在函数内部 require）
const modAFactory = (module, exports, require) => {
  exports.funcA = function() { return 'A 的函数'; };
  // 不在加载时 require B，而是延迟到调用时
  exports.useB = function() {
    const b = require('B', modBFactory);
    return b.funcB();
  };
  console.log('  [A] 定义完成（不在加载时 require B）');
};

// 模块 B
const modBFactory = (module, exports, require) => {
  const a = require('A', modAFactory);
  exports.funcB = function() {
    return 'B 的函数，调用 A: ' + a.funcA();
  };
  console.log('  [B] 定义完成');
};

console.log('--- 使用延迟 require ---');
const a2 = delayedRequire('A', modAFactory);
console.log('调用 a.useB():', a2.useB());
console.log('延迟 require 成功避免了循环依赖问题！\\n');

// 【4. 演示 require.cache 的存在和清除】
console.log('【4. require.cache 的存在和清除】');

// 查看内置模块的缓存
const pathModulePath = require.resolve('path');
console.log('path 模块路径:', pathModulePath);
console.log('require.cache 中是否有 path:', !!require.cache[pathModulePath]);

// 创建临时模块文件演示缓存清除
const tmpFile = path.join(os.tmpdir(), 'noderun_test_module_' + Date.now() + '.js');
fs.writeFileSync(tmpFile, 'let count = 0; module.exports = { getCount: () => count, increment: () => ++count };');

const modPath = require.resolve(tmpFile);
const mod1 = require(tmpFile);
mod1.increment();
mod1.increment();
console.log('\\n第一次 require，increment 两次:', mod1.getCount());  // 2

const mod2 = require(tmpFile);
console.log('第二次 require（命中缓存）:', mod2.getCount());  // 2
console.log('mod1 === mod2:', mod1 === mod2);  // true

// 清除缓存后重新 require
delete require.cache[modPath];
const mod3 = require(tmpFile);
console.log('清除缓存后重新 require:', mod3.getCount());  // 0（重新执行了！）
console.log('mod1 === mod3:', mod1 === mod3);  // false（新对象）

// 清理临时文件
fs.unlinkSync(tmpFile);
console.log('（已清理临时文件）\\n');

console.log('========== 模块缓存演示结束 ==========');
console.log('\\n核心要点:');
console.log('1. 模块只执行一次，结果缓存到 require.cache');
console.log('2. 多次 require 拿到的是同一个对象引用（单例）');
console.log('3. 循环依赖：后 require 的模块拿到不完整的导出');
console.log('4. 解决方案：避免循环依赖、提取共享模块、延迟 require');
console.log('5. 测试时可用 delete require.cache 清除缓存');`
  }
];
