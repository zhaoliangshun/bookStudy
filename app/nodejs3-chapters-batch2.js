export const chapters = [
  {
    id: "n3-compose",
    group: "第一部分 手写核心模块",
    icon: "🧅",
    title: "手写 Koa 风格中间件 compose",
    content: `# 手写 Koa 风格中间件 compose

Koa 是 Node.js 社区最流行的 Web 框架之一，它最核心的设计就是"洋葱模型"中间件机制。而洋葱模型的灵魂，就是一个只有几十行代码的 \`compose\` 函数。理解了 compose，你就理解了 Koa 的全部精髓。

---

## 什么是洋葱模型？

想象一个洋葱，你从外面一层层剥进去，再从里面一层层穿出来。Koa 的中间件执行顺序就是这样：

\`\`\`
请求 → [中间件1 前] → [中间件2 前] → [中间件3 前] → 路由处理
响应 ← [中间件1 后] ← [中间件2 后] ← [中间件3 后] ←
\`\`\`

这和 Express 的中间件模型不同，Express 是线性的"next 调用下一个"，而 Koa 是"进去再出来"，每个中间件都有**两次**处理机会：next() 之前处理请求，next() 之后处理响应。

这种设计的威力在于：你可以在 next() 之后统一处理响应，比如设置响应头、格式化响应体、捕获错误、记录响应时间，等等。

---

## compose 函数做了什么？

\`compose\` 的输入是一个中间件函数数组 \`[fn1, fn2, fn3]\`，输出是**一个函数**。当你调用这个函数时，它会按洋葱顺序依次执行所有中间件。

中间件的签名是：
\`\`\`js
async function middleware(ctx, next) {
  // 请求进来时：next() 之前的逻辑
  await next(); // 调用下一个中间件
  // 响应出去时：next() 之后的逻辑
}
\`\`\`

注意 \`await next()\`——这是关键！因为 next() 返回的是一个 Promise，你必须 await 它，才能在它 resolve 之后（也就是后面的中间件都执行完了）继续执行后面的代码。

---

## 递归实现 compose 的核心逻辑

compose 的实现非常巧妙，核心是一个递归的 \`dispatch(i)\` 函数：

1. \`dispatch(0)\` 开始执行第一个中间件
2. 把 \`() => dispatch(1)\` 作为 next 参数传给第一个中间件
3. 当第一个中间件调用 \`await next()\` 时，实际上就是在调用 \`dispatch(1)\`，开始执行第二个中间件
4. 第二个中间件又拿到 \`() => dispatch(2)\` 作为 next...
5. 直到最后一个中间件调用 next()，此时 \`dispatch(middlewares.length)\` 返回一个已 resolve 的 Promise
6. 然后逐层 await 返回，执行每个中间件 next() 之后的代码

这就是递归的魔力！dispatch(i) 永远返回一个 Promise，这样 await next() 就能等待后面所有中间件执行完。

---

## 为什么要返回 Promise？

为什么 compose 要返回 Promise，而不是同步执行？因为中间件可能是异步的——比如要查询数据库、读取文件、调用接口，这些都是异步操作。

如果不返回 Promise，就无法用 \`await next()\` 等待后面的异步中间件完成，洋葱模型的"回来"部分就无法正确执行。在异步世界里，你必须用 Promise 来表示"完成"这个概念。

实际上，Koa1 时期用的是 Generator + co 来做异步，Koa2 之后全面拥抱 async/await，compose 也就变成了基于 Promise 的实现。

---

## next() 的作用是什么？

\`next\` 不是一个魔法关键字，它就是一个函数——**下一个中间件的启动器**。当你调用 \`await next()\`，你是在说："暂停当前中间件，去执行后面的所有中间件，等它们全部完成后，再回来继续执行我后面的代码。"

如果你不调用 \`await next()\`，后面的中间件就**永远不会执行**——这就是所谓的"熔断"，比如认证中间件发现用户没登录，直接返回 401，不调用 next()，后面的路由处理就不会执行。

这是中间件模式最强大的地方：你可以控制请求是否继续向下传递。

---

## context 上下文如何传递？

\`ctx\` 是贯穿所有中间件的上下文对象。第一个中间件拿到 ctx，然后把同一个 ctx 传给第二个，第二个传给第三个...所有中间件操作的都是**同一个对象**。

所以你可以在前面的中间件往 ctx 上挂属性，后面的中间件就能读到。比如：
- 日志中间件：\`ctx.requestId = uuid()\`
- 认证中间件：\`ctx.user = await getUser(token)\`
- 响应时间中间件：在 next() 后读 \`ctx.status\` 设置响应头

这就是 ctx 作为"上下文"的意义：它是中间件之间共享数据的载体。

---

## 为什么要判断 next 不能多次调用？

这是一个非常重要的安全检查：在同一个中间件里，你不能多次调用 next()。为什么？

想象一下：如果你在一个中间件里调用两次 next()，相当于把后面的中间件链执行两次。这会导致：
- 响应可能被发送两次（报错 "Can't set headers after they are sent"）
- 业务逻辑被重复执行（比如扣了两次钱）
- 洋葱模型的顺序被打乱

所以 compose 内部用一个 \`index\` 变量记录当前执行到哪个中间件了，每次调用 dispatch 时检查：如果 \`i <= index\`，说明 next() 被多次调用了，直接 reject 一个错误。

---

## 对比 Redux 的 compose

你可能用过 Redux 的 compose，它和 Koa 的 compose 名字一样，但行为完全不同：

\`\`\`js
// Redux compose：右到左执行，把前一个函数的返回值传给后一个
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
// compose(f, g, h)(x) === f(g(h(x)))
\`\`\`

Redux compose 是**函数组合**：把多个函数串起来，h 的输出给 g，g 的输出给 f，从右往左执行，没有"回来"的过程。

Koa compose 是**中间件编排**：每个函数都可以决定什么时候调用下一个，并且在回来后继续执行，形成一个双向的洋葱圈。

简单说：Redux compose 是"一条线穿过去"，Koa compose 是"穿过去再穿回来"。
`,
    code: `// ============================================
// 手写 Koa 风格 compose 函数
// ============================================

function compose(middlewares) {
  if (!Array.isArray(middlewares)) {
    throw new TypeError('Middlewares must be an array!');
  }
  for (const fn of middlewares) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middleware must be composed of functions!');
    }
  }

  return function (context, next) {
    let index = -1;
    return dispatch(0);

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

// ============ 演示：洋葱模型执行顺序 ============
console.log('═══════════════════════════════════════════');
console.log('  🧅 Koa 洋葱模型演示');
console.log('═══════════════════════════════════════════');
console.log('');

const executionOrder = [];

const middleware1 = async (ctx, next) => {
  executionOrder.push('1. 中间件1 - 进入（日志记录开始）');
  ctx.startTime = Date.now();
  await next();
  const cost = Date.now() - ctx.startTime;
  executionOrder.push('6. 中间件1 - 出来（请求完成，耗时: ' + cost + 'ms）');
};

const middleware2 = async (ctx, next) => {
  executionOrder.push('2. 中间件2 - 进入（响应计时开始）');
  ctx.responseTimeStart = Date.now();
  await next();
  executionOrder.push('5. 中间件2 - 出来（设置 X-Response-Time 响应头）');
};

const middleware3 = async (ctx, next) => {
  executionOrder.push('3. 中间件3 - 进入（认证检查）');
  ctx.user = { id: 1, name: '测试用户' };
  await next();
  executionOrder.push('4. 中间件3 - 出来（记录用户访问日志）');
};

const fn = compose([middleware1, middleware2, middleware3]);

const ctx = { url: '/api/user', method: 'GET' };

fn(ctx).then(() => {
  console.log('【执行顺序】');
  executionOrder.forEach((item, i) => console.log('  ' + item));
  console.log('');
  console.log('  💡 顺序：1→2→3→4→5→6，完美的洋葱模型！');
  console.log('  ctx 上的数据：', JSON.stringify(ctx));
  console.log('');

  // ============ 演示：next() 多次调用会报错 ============
  console.log('═══════════════════════════════════════════');
  console.log('【验证：next() 多次调用会报错】');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const badMiddleware = async (ctx, next) => {
    await next();
    await next();
  };

  const badFn = compose([badMiddleware]);
  badFn({}).then(() => {
    console.log('  不应该走到这里');
  }).catch(err => {
    console.log('  ❌ 正确捕获错误:', err.message);
    console.log('');
    console.log('  💡 这就是为什么 compose 要做 index 检查');
    console.log('');
  });

  // ============ 演示：不调用 next() 熔断 ============
  setTimeout(() => {
    console.log('═══════════════════════════════════════════');
    console.log('【验证：不调用 next() 会熔断后续中间件】');
    console.log('═══════════════════════════════════════════');
    console.log('');

    const authMiddleware = async (ctx, next) => {
      if (!ctx.token) {
        ctx.status = 401;
        ctx.body = '未授权';
        console.log('  🚫 认证失败，不调用 next()，直接返回');
        return;
      }
      await next();
    };

    const handler = async (ctx) => {
      ctx.status = 200;
      ctx.body = '敏感数据';
      console.log('  ✅ 路由处理器执行了（不应该看到这行）');
    };

    const authFn = compose([authMiddleware, handler]);
    authFn({ token: null }).then(() => {
      console.log('  结果：status=' + ctx.status + ', body=' + ctx.body);
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('  总结');
      console.log('═══════════════════════════════════════════');
      console.log('');
      console.log('  1. compose 用递归 dispatch(i) 实现洋葱模型');
      console.log('  2. 返回 Promise 支持 async/await 异步中间件');
      console.log('  3. next() 是下一个中间件的启动器，不调用就熔断');
      console.log('  4. ctx 在所有中间件间共享，用来传递数据');
      console.log('  5. index 检查防止 next() 被多次调用');
      console.log('');
    });
  }, 100);
});
`
  },
  {
    id: "n3-promise-pool",
    group: "第一部分 手写核心模块",
    icon: "🏊",
    title: "手写 Promise 并发控制池",
    content: `# 手写 Promise 并发控制池

在开发中我们经常遇到这样的场景：有 100 个异步任务要执行，但不能同时开 100 个并发——可能是浏览器有同源连接数限制（Chrome 最多 6 个），可能是数据库连接池有限，可能是怕把对方服务器打挂。这时候你需要一个**并发控制池**：同时最多跑 N 个任务，完成一个补一个，直到所有任务完成。

---

## 为什么要控制并发？

不控制并发会带来什么问题？

1. **TCP 连接数限制**：浏览器对同一域名的并发连接数有限制（HTTP/1.1 是 6 个），如果同时发几百个请求，后面的请求只能排队等待，甚至超时。
2. **数据库连接池耗尽**：数据库连接池通常只有十几个连接，同时发起太多查询会导致连接池耗尽，后续请求全部排队超时。
3. **服务器限流/封 IP**：如果你写爬虫或者调用第三方 API，并发太高会被限流甚至封 IP。
4. **内存占用过高**：每个异步操作都有开销，同时挂太多 Promise 会占用过多内存。

所以"让所有任务同时跑"并不是最优解，合理控制并发数才能既快又稳。

---

## 并发池的核心原理

并发池的逻辑其实很简单：

1. 设定一个并发上限 \`limit\`（比如 3）
2. 先启动最多 \`limit\` 个任务
3. 每当有一个任务完成（无论成功失败），就从待执行队列里取下一个任务启动
4. 重复步骤 3，直到所有任务都执行完
5. 收集所有任务的结果，按顺序返回（或者不按顺序，看需求）

这就像一个游泳池：最多同时 N 个人在水里游，出来一个才能进去一个。

关键的难点在于：
- 任务可能是异步的，完成时机不确定
- 需要处理成功和失败两种情况
- 需要跟踪哪些任务在跑、哪些在等
- 最终结果的顺序怎么保证（通常要和输入顺序一致）

---

## asyncPool 的两种实现方式

### 方式一：Promise.all + 递归递推

这是最经典的实现方式：用一个"跑任务"的递归函数，不断从任务池里取任务执行，直到所有任务都被取完。

核心思路：
- 维护一个 \`running\` 计数器和当前任务索引 \`i\`
- 启动 \`limit\` 个"消费线程"，每个"线程"做一个循环：取任务 → 执行 → 再取，直到没任务了
- 用 Promise.all 等所有"线程"结束

### 方式二：异步迭代器（for await...of）

ES2018 引入了异步迭代器，我们可以用更优雅的方式实现：维护一个待执行任务队列，同时启动最多 limit 个 worker，每个 worker 不断从队列取任务执行。

这两种方式本质是一样的，只是写法不同。递归方式更兼容旧环境，异步迭代器写法更现代。

---

## 结果顺序的问题

并发执行任务时，任务完成的顺序是不确定的——先启动的任务可能后完成。但我们通常希望最终返回的结果数组和输入的任务数组**顺序一致**。

怎么做到？很简单：不要按完成顺序 push 结果，而是按任务的**原始索引**存结果：

\`\`\`js
const results = [];
// 第 i 个任务完成后
results[i] = await task();
\`\`\`

这样不管谁先完成，results 数组里的位置都是对的。

---

## 支持优先级的扩展

基础的并发池是"先进先出"（FIFO），但有时候我们需要优先级——比如用户触发的任务比后台预加载的任务优先级高。

实现优先级也不难：把待执行队列改成**优先队列**（堆结构），每次取优先级最高的任务执行。或者更简单的，用多个队列：高优先级队列和低优先级队列，高优先级的任务没了才从低优先级取。

---

## 错误处理

并发池中的一个任务失败了怎么办？两种策略：
1. **快速失败（fail-fast）**：只要有一个任务 reject，整个 pool 立刻 reject（类似 Promise.all 的行为）
2. **等待所有完成**：等所有任务都 settle，收集成功和失败的结果（类似 Promise.allSettled）

具体用哪种看业务需求。我们实现的版本采用快速失败策略，但你可以很容易改成 allSettled 版本。
`,
    code: `// ============================================
// 手写 Promise 并发池 asyncPool
// ============================================

function asyncPool(limit, tasks) {
  const results = [];
  let executing = 0;
  let index = 0;
  let rejected = false;

  return new Promise((resolve, reject) => {
    function run() {
      if (rejected) return;
      while (executing < limit && index < tasks.length) {
        const currentIndex = index;
        const task = tasks[currentIndex];
        index++;
        executing++;

        Promise.resolve()
          .then(() => task())
          .then(result => {
            results[currentIndex] = result;
            executing--;
            if (index === tasks.length && executing === 0) {
              resolve(results);
            } else {
              run();
            }
          })
          .catch(err => {
            rejected = true;
            reject(err);
          });
      }
    }
    run();
  });
}

// ============ 模拟异步任务 ============
console.log('═══════════════════════════════════════════');
console.log('  🏊 Promise 并发控制池');
console.log('═══════════════════════════════════════════');
console.log('');

function createTask(id, delay) {
  return () => new Promise(resolve => {
    const startTime = Date.now();
    console.log(\`  🚀 任务\${id} 开始执行（预计耗时\${delay}ms）\`);
    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      console.log(\`  ✅ 任务\${id} 完成（实际耗时\${elapsed}ms）\`);
      resolve({ id, delay, elapsed });
    }, delay);
  });
}

// 创建 10 个任务，每个耗时 100~800ms 随机
const tasks = [];
for (let i = 1; i <= 10; i++) {
  const delay = 100 + Math.floor(Math.random() * 700);
  tasks.push(createTask(i, delay));
}

const CONCURRENCY_LIMIT = 3;
const totalStart = Date.now();

console.log(\`  总共 \${tasks.length} 个任务，并发限制: \${CONCURRENCY_LIMIT}\`);
console.log('');
console.log('【执行过程】');
console.log('');

asyncPool(CONCURRENCY_LIMIT, tasks).then(results => {
  const totalCost = Date.now() - totalStart;
  console.log('');
  console.log('【所有任务完成】');
  console.log('  总耗时:', totalCost + 'ms');
  console.log('');
  console.log('【结果（按原始顺序）】');
  results.forEach(r => {
    console.log(\`  任务\${r.id}: 预计\${r.delay}ms，实际\${r.elapsed}ms\`);
  });

  // 验证：任意时刻正在执行的任务数不超过 limit
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('【验证：并发数不超过 ' + CONCURRENCY_LIMIT + '】');
  console.log('═══════════════════════════════════════════');
  console.log('');

  let maxConcurrent = 0;
  let currentConcurrent = 0;
  const events = [];

  function createTrackedTask(id, delay) {
    return () => new Promise(resolve => {
      currentConcurrent++;
      maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
      const start = Date.now();
      setTimeout(() => {
        currentConcurrent--;
        resolve(id);
      }, delay);
    });
  }

  const trackedTasks = [];
  for (let i = 1; i <= 10; i++) {
    trackedTasks.push(createTrackedTask(i, 50 + Math.random() * 150));
  }

  asyncPool(3, trackedTasks).then(() => {
    console.log('  最大并发数:', maxConcurrent);
    console.log('  限制数:', CONCURRENCY_LIMIT);
    console.log('  ✅', maxConcurrent <= CONCURRENCY_LIMIT ? '并发控制正确！' : '有问题！');
    console.log('');

    // ============ 对比：无并发控制会怎样 ============
    console.log('═══════════════════════════════════════════');
    console.log('  总结');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('  1. 并发池原理：完成一个补一个，始终不超过 limit');
    console.log('  2. 用 Promise 包装每个任务，递归启动新任务');
    console.log('  3. 按原始索引存结果，保证顺序一致');
    console.log('  4. 可扩展：优先级队列、allSettled 模式');
    console.log('  5. 适用场景：批量请求、爬虫、文件并行处理');
    console.log('');
    console.log('  💡 如果没有并发控制，10个任务同时跑，');
    console.log('     总耗时约等于最长任务时间（~800ms），');
    console.log('     但会瞬间占满所有连接/资源。');
    console.log('     有了并发池，总耗时 ~ (总工作量 / limit)，更平稳。');
    console.log('');
  });
});
`
  },
  {
    id: "n3-module-loader",
    group: "第一部分 手写核心模块",
    icon: "📦",
    title: "手写简单的模块加载器",
    content: `# 手写简单的模块加载器

Node.js 的 CommonJS 模块系统我们每天都在用：\`require('fs')\`、\`module.exports = ...\`，但它背后是怎么工作的？为什么 require 能找到文件？为什么模块里有 \`exports\`、\`require\`、\`module\`、\`__filename\`、\`__dirname\` 这些变量？为什么循环引用不会导致无限递归？

这一章我们来手写一个简化版的模块加载器，彻底搞懂 CommonJS 的原理。

---

## CommonJS 模块加载的核心流程

当你调用 \`require('./a')\` 时，Node.js 内部做了这些事情：

1. **解析路径（Module._resolveFilename）**：把 \`./a\` 变成绝对路径，尝试补全后缀（.js、.json、.node），检查文件是否存在。
2. **检查缓存（Module._cache）**：如果这个路径的模块已经加载过了，直接返回 \`module.exports\`，不会重新执行。
3. **创建 Module 实例（new Module）**：new 一个 Module 对象，放到缓存里（注意：是先放缓存再执行，这样循环引用时能拿到未完成的 exports）。
4. **加载模块（tryModuleLoad）**：根据后缀名选择不同的加载方式：
   - .js：读取文件内容，包裹成函数，执行
   - .json：读取文件，JSON.parse 后直接赋给 module.exports
   - .node：C++ 扩展，用 process.dlopen 加载
5. **编译执行（module.compile）**：这是最关键的一步！

---

## module wrapper：模块注入的魔法

为什么每个模块里都能直接用 \`exports\`、\`require\`、\`module\`、\`__filename\`、\`__dirname\`？这些变量从哪来的？

答案是：**Node.js 会把你的模块代码包裹在一个函数里！**

你的代码：
\`\`\`js
// a.js
const fs = require('fs');
module.exports = { hello: 'world' };
\`\`\`

实际上被包裹成：
\`\`\`js
(function (exports, require, module, __filename, __dirname) {
  // 你的代码在这里！
  const fs = require('fs');
  module.exports = { hello: 'world' };
});
\`\`\`

然后 Node.js 调用这个函数，传入这 5 个参数。所以它们不是全局变量，而是**函数参数**！这就是为什么每个模块都有自己独立的作用域——因为每个模块都在这个匿名函数的闭包里。

你可以在 Node.js 里验证：
\`\`\`js
console.log(arguments.length); // 5
console.log(require('module').wrapper); // 看包裹函数的头尾
\`\`\`

---

## 模块缓存机制

模块加载后会被缓存到 \`require.cache\` 对象里，key 是模块的绝对路径。所以：
- 同一个模块被 require 多次，只会执行一次，返回同一个 exports 对象
- 这就是为什么 Node.js 的模块是天然的单例
- 你可以手动删除 \`require.cache[path]\` 来强制重新加载（但一般不推荐）

缓存的一个重要细节：**在执行模块代码之前，就先把 module 实例放进缓存了**。为什么？因为要处理循环引用！

---

## 循环引用的处理

假设 a.js require 了 b.js，b.js 又 require 了 a.js，会不会无限递归？不会！Node.js 是这样处理的：

1. 加载 a.js：创建 a 的 Module 实例，**立刻放入缓存**（此时 a.exports 是空对象 {}）
2. 开始执行 a.js 的代码
3. a.js 执行到 require('./b')：开始加载 b.js
4. 创建 b 的 Module 实例，放入缓存
5. 开始执行 b.js 的代码
6. b.js 执行到 require('./a')：检查缓存，a 已经在缓存里了！直接返回 a.exports（此时 a 还没执行完，exports 可能只有一部分）
7. b.js 继续执行完，b.exports 完成
8. 回到 a.js，继续执行 require('./b') 之后的代码，a.exports 最终完成

所以循环引用时，后加载的模块拿到的是**未完成的 exports 对象**。这不是 bug，是设计如此。你需要自己保证在循环引用的情况下，拿到的 exports 是可用的。

---

## 为什么不能在浏览器里直接用 CommonJS？

CommonJS 是同步加载的：\`const fs = require('fs')\` 会阻塞直到模块加载完成。这在 Node.js 里没问题，因为文件都在本地硬盘上，加载很快。

但在浏览器里：
- 没有 \`fs\` 模块，没法同步读取文件
- 网络请求是异步的，同步加载会阻塞整个页面
- 没有 \`module\`、\`exports\`、\`require\` 这些全局变量/函数
- 浏览器没有原生的模块系统（ES Modules 出现之前）

所以浏览器端需要用打包工具（Webpack、Rollup、Vite、esbuild）把 CommonJS/ESM 模块打包成浏览器能运行的代码——其实打包工具做的事情本质上就是实现了一个浏览器端的模块加载器。

---

## 我们实现的简化版

真实的 Node.js 模块加载器非常复杂（要处理路径解析、后缀查找、package.json main 字段、ES Modules 互操作等等），但核心原理就是我们上面说的。我们手写一个内存版的模块加载器，模拟核心逻辑：缓存、wrapper 函数注入、循环引用处理。
`,
    code: `// ============================================
// 手写简化版 CommonJS 模块加载器
// ============================================

function createModuleSystem() {
  const cache = {};
  const modules = {};

  function define(name, factory) {
    modules[name] = factory;
  }

  function require(name) {
    if (cache[name]) {
      return cache[name].exports;
    }

    const module = {
      id: name,
      exports: {}
    };

    cache[name] = module;

    const factory = modules[name];
    if (!factory) {
      throw new Error(\`Module '\${name}' not found\`);
    }

    const dirname = name.includes('/') ? name.slice(0, name.lastIndexOf('/')) : '.';
    const filename = name;

    factory(module.exports, require, module, filename, dirname);

    return module.exports;
  }

  return { define, require, cache };
}

console.log('═══════════════════════════════════════════');
console.log('  📦 手写简化版 CommonJS 模块加载器');
console.log('═══════════════════════════════════════════');
console.log('');

const { define, require, cache } = createModuleSystem();

// ============ 定义模块：logger.js ============
define('logger', (exports, require, module, __filename, __dirname) => {
  console.log('  [执行 logger.js] __filename:', __filename, '__dirname:', __dirname);

  function log(msg) {
    console.log('  [LOG]', msg);
  }

  function error(msg) {
    console.log('  [ERR]', msg);
  }

  module.exports = { log, error };
});

// ============ 定义模块：a.js（引用 b.js，制造循环引用）============
define('a', (exports, require, module, __filename, __dirname) => {
  console.log('  [执行 a.js 开始]');
  exports.name = '模块A';
  exports.value = 100;

  console.log('  a.js 中 require b...');
  const b = require('b');
  console.log('  a.js 拿到 b:', JSON.stringify(b));

  exports.getBName = () => b.name;
  exports.aAfterLoadB = '这是 a 加载完 b 之后加的属性';

  console.log('  [执行 a.js 结束]');
});

// ============ 定义模块：b.js（引用 a.js，循环引用）============
define('b', (exports, require, module, __filename, __dirname) => {
  console.log('  [执行 b.js 开始]');
  exports.name = '模块B';
  exports.value = 200;

  console.log('  b.js 中 require a...');
  const a = require('a');
  console.log('  b.js 拿到 a:', JSON.stringify(a));
  console.log('  💡 注意：a 还没执行完，但已经能拿到部分 exports！');

  exports.getAName = () => a.name;
  exports.bAfterLoadA = '这是 b 加载完 a 之后加的属性';

  console.log('  [执行 b.js 结束]');
});

// ============ 定义模块：main.js（入口）============
define('main', (exports, require, module) => {
  console.log('  [执行 main.js]');
  const logger = require('logger');
  const a = require('a');

  logger.log('main 中调用 logger');
  console.log('');

  module.exports = function () {
    console.log('  main 函数运行');
    console.log('  a.name:', a.name);
    console.log('  a.value:', a.value);
    console.log('  a.getBName():', a.getBName());
    console.log('  a.aAfterLoadB:', a.aAfterLoadB);
  };
});

// ============ 运行 ============
console.log('【开始加载 main 模块】');
console.log('');
const main = require('main');
console.log('');
console.log('【main 加载完成，调用 main 函数】');
console.log('');
main();

console.log('');
console.log('【缓存中的模块】');
Object.keys(cache).forEach(key => {
  console.log('  -', key, ':', Object.keys(cache[key].exports).join(', '));
});

// ============ 验证：require 多次返回同一个对象（缓存）============
setTimeout(() => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('【验证：require 缓存，多次 require 返回同一个对象】');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const a1 = require('a');
  const a2 = require('a');
  console.log('  require("a") === require("a"):', a1 === a2);
  console.log('  ✅ 是同一个对象！因为缓存。');
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. require 流程：路径解析 → 查缓存 → 创建 Module → 包裹执行');
  console.log('  2. 模块代码被 (exports, require, module, __filename, __dirname) => {} 包裹');
  console.log('  3. 先放缓存再执行，解决循环引用问题');
  console.log('  4. 循环引用时，拿到的是"未完成"的 exports');
  console.log('  5. 模块缓存导致 Node.js 模块天然是单例');
  console.log('  6. CommonJS 同步加载不适合浏览器，需要打包工具');
  console.log('');
}, 100);
`
  },
  {
    id: "n3-singleton",
    group: "第二部分 创建型设计模式",
    icon: "1️⃣",
    title: "单例模式（Singleton）",
    content: `# 单例模式（Singleton）

单例模式是设计模式中最简单、最常用、也是面试最常考的模式之一。它的定义非常简单：**保证一个类只有一个实例，并提供一个全局访问点**。

在 Node.js 和前端开发中，单例无处不在——但很多时候你可能已经在用单例了，只是不知道它叫这个名字。

---

## 模式定义与 UML 类图

**意图**：确保一个类只有一个实例，并提供该实例的全局访问点。

**UML 类图**：
\`\`\`
┌─────────────────────┐
│     Singleton       │
├─────────────────────┤
│ - instance: Singleton │ ← 静态私有变量，保存唯一实例
├─────────────────────┤
│ - constructor()     │ ← 构造函数私有化，外部不能 new
│ + getInstance()     │ ← 静态公有方法，返回唯一实例
└─────────────────────┘
\`\`\`

核心要点：
1. **构造函数私有**：防止外部用 new 创建多个实例
2. **自行创建实例**：类自己负责创建自己的唯一实例
3. **全局访问点**：提供一个静态方法让外部获取这个实例

---

## 应用场景

什么时候需要单例？当你需要"全局只有一个"的东西时：

1. **配置管理器**：整个应用的配置只需要一份，到处读写都应该是同一份。
2. **日志实例**：日志对象不需要多个，一个配置好的 logger 到处用就行。
3. **数据库连接池**：创建连接池开销很大，整个应用应该共用一个连接池。
4. **全局状态管理**：比如 Redux/Vuex 的 store，全局只有一个。
5. **线程池/进程池**：和连接池同理，资源有限，共享使用。
6. **注册表/缓存**：全局缓存对象，所有地方读写同一个缓存。

判断标准：**如果这个类有两个实例会出问题（或者没有意义），那就应该用单例。**

---

## JS 中实现单例的方式

JavaScript 没有传统面向对象语言的"私有构造函数"，但我们有很多方式实现单例。

### 1. 闭包 + 立即执行函数（IIFE）

这是最经典的 JS 单例写法：用闭包保存一个私有 instance 变量，外部无法直接访问，只能通过 getInstance 获取。

### 2. 类的静态属性

ES6 class 支持静态属性，我们可以把 instance 存到类的静态属性上。但注意：JS 的构造函数没法真正私有（除非用 ES2022 私有字段 #instance），外部还是能 new，需要在构造函数里判断。

### 3. ES6 模块天然单例

这可能是你每天都在用但没意识到的：**ES6 Module 和 CommonJS 的模块导出天然是单例！**

还记得我们上一章手写的模块加载器吗？模块加载后会缓存，多次 require/import 返回的是同一个 exports 对象。所以你根本不需要写什么 getInstance，直接导出一个实例就是单例：

\`\`\`js
// config.js
class Config { ... }
export default new Config(); // 整个应用 import 这个模块，拿到的都是同一个实例！
\`\`\`

这是 JS 中最自然、最常用的单例实现方式。

---

## 饿汉式 vs 懒汉式

单例有两种初始化策略：

**饿汉式**：程序启动/类加载时就立即创建实例。
- 优点：线程安全（JS 单线程更不用担心）、实现简单
- 缺点：如果创建开销大但可能用不到，会浪费资源

**懒汉式**：第一次 getInstance 时才创建实例（延迟初始化）。
- 优点：用到才创建，节省资源
- 缺点：需要注意第一次访问时的初始化时机
- 在多线程语言（Java）中需要加锁，但 JS 是单线程的，没有线程安全问题！

Node.js 虽然是单线程事件循环，但如果是异步创建单例（比如异步初始化数据库连接池），需要注意并发调用 getInstance 时可能触发多次创建。这时候需要加一个"锁"或者用 Promise 缓存。

---

## Node.js 中模块缓存就是天然单例

再强调一次：Node.js 的模块系统是单例模式最好的例子。当你 \`require('lodash')\` 多次，返回的是同一个 lodash 对象，因为模块被缓存了。

但有一个"陷阱"：模块缓存是按**路径**缓存的。如果你的项目里因为依赖版本问题，存在两个路径不同的同名模块（比如 node_modules/a/node_modules/lodash 和 node_modules/lodash），它们会被认为是两个不同的模块，各有各的缓存。不过这是特殊情况，一般不用考虑。

---

## 单例模式的缺点

单例不是银弹，它有一些缺点：
1. **扩展困难**：单例一般没有抽象层，继承和扩展比较困难
2. **职责过重**：单例既当"工厂"又当"产品"，违背单一职责（但很多时候这是可接受的）
3. **测试麻烦**：单例状态在测试用例之间共享，可能导致测试互相影响，需要 mock 或重置
4. **内存无法释放**：单例一旦创建就常驻内存，程序退出才释放（一般不是问题）
`,
    code: `// ============================================
// 单例模式多种实现方式
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  1️⃣ 单例模式（Singleton）');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 方式 1：闭包 + IIFE（懒汉式）============
console.log('【方式 1：闭包 + IIFE 实现单例】');
console.log('');

const ConfigManager = (function () {
  let instance;

  function ConfigManager() {
    if (instance) {
      throw new Error('请用 ConfigManager.getInstance() 获取实例');
    }
    this.config = {};
    this.initialized = false;
  }

  ConfigManager.prototype.set = function (key, value) {
    this.config[key] = value;
  };

  ConfigManager.prototype.get = function (key) {
    return this.config[key];
  };

  ConfigManager.prototype.init = function (config) {
    if (this.initialized) return;
    Object.assign(this.config, config);
    this.initialized = true;
  };

  ConfigManager.getInstance = function () {
    if (!instance) {
      instance = new ConfigManager();
    }
    return instance;
  };

  return ConfigManager;
})();

const cfg1 = ConfigManager.getInstance();
const cfg2 = ConfigManager.getInstance();

cfg1.set('db.host', 'localhost');
cfg1.set('db.port', 3306);

console.log('  cfg1 === cfg2:', cfg1 === cfg2);
console.log('  cfg2.get("db.host"):', cfg2.get('db.host'));
console.log('  ✅ 两个引用指向同一个实例，数据共享');
console.log('');

try {
  new ConfigManager();
  console.log('  不应该走到这里');
} catch (e) {
  console.log('  尝试 new ConfigManager() 报错:', e.message);
}
console.log('');

// ============ 方式 2：ES6 Class 静态属性（饿汉式/懒汉式）============
console.log('═══════════════════════════════════════════');
console.log('【方式 2：ES6 Class 静态属性】');
console.log('═══════════════════════════════════════════');
console.log('');

class Logger {
  static #instance = null;

  constructor() {
    if (Logger.#instance) {
      return Logger.#instance;
    }
    this.logs = [];
    Logger.#instance = this;
  }

  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  info(msg) {
    const entry = '[INFO] ' + new Date().toISOString() + ' ' + msg;
    this.logs.push(entry);
    console.log(' ' + entry);
  }

  error(msg) {
    const entry = '[ERROR] ' + new Date().toISOString() + ' ' + msg;
    this.logs.push(entry);
    console.log(' ' + entry);
  }

  getLogCount() {
    return this.logs.length;
  }
}

const log1 = new Logger();
const log2 = new Logger();
const log3 = Logger.getInstance();

console.log('  new Logger() === new Logger():', log1 === log2);
console.log('  new Logger() === Logger.getInstance():', log1 === log3);

log1.info('第一条日志');
log2.info('第二条日志（来自另一个引用）');
log3.error('出错了');

console.log('  日志总数:', log1.getLogCount());
console.log('  ✅ 即使直接 new，也返回同一个实例（构造函数里返回了 instance）');
console.log('');

// ============ 方式 3：ES6 Module 风格（模拟，最自然的方式）============
console.log('═══════════════════════════════════════════');
console.log('【方式 3：模块导出实例（Node.js 中最常用）】');
console.log('═══════════════════════════════════════════');
console.log('');

const moduleCache = {};
function myRequire(moduleName) {
  if (moduleCache[moduleName]) return moduleCache[moduleName];

  let exports;
  if (moduleName === 'database') {
    class Database {
      constructor() {
        this.connected = false;
        this.poolSize = 10;
        console.log('  [Database] 初始化数据库连接池...');
      }
      connect() {
        if (this.connected) return;
        this.connected = true;
        console.log('  [Database] 连接成功');
      }
      query(sql) {
        console.log('  [Database] 执行查询:', sql);
        return [{ id: 1 }, { id: 2 }];
      }
    }
    exports = new Database();
  }
  moduleCache[moduleName] = exports;
  return exports;
}

const db1 = myRequire('database');
const db2 = myRequire('database');

console.log('  db1 === db2:', db1 === db2);
db1.connect();
const result = db2.query('SELECT * FROM users');
console.log('  查询结果:', result.length, '条');
console.log('  ✅ 模块导出的实例天然是单例，这是 Node.js 最推荐的方式');
console.log('');

// ============ 方式 4：异步单例（处理异步初始化）============
console.log('═══════════════════════════════════════════');
console.log('【方式 4：异步单例（连接池等需要异步初始化的场景）】');
console.log('═══════════════════════════════════════════');
console.log('');

class AsyncDB {
  static #instance = null;
  static #initPromise = null;

  constructor() {
    this.connected = false;
  }

  static async getInstance() {
    if (AsyncDB.#instance) {
      return AsyncDB.#instance;
    }
    if (!AsyncDB.#initPromise) {
      AsyncDB.#initPromise = (async () => {
        console.log('  [AsyncDB] 开始异步初始化连接池...');
        await new Promise(r => setTimeout(r, 200));
        const instance = new AsyncDB();
        instance.connected = true;
        instance.pool = Array(10).fill({ busy: false });
        AsyncDB.#instance = instance;
        console.log('  [AsyncDB] 初始化完成');
        return instance;
      })();
    }
    return AsyncDB.#initPromise;
  }
}

(async () => {
  const results = await Promise.all([
    AsyncDB.getInstance(),
    AsyncDB.getInstance(),
    AsyncDB.getInstance()
  ]);

  console.log('  并发调用 3 次 getInstance，返回的是同一个实例:', 
    results[0] === results[1] && results[1] === results[2]);
  console.log('  ✅ 异步单例用 Promise 缓存防止重复初始化');
  console.log('');

  console.log('═══════════════════════════════════════════');
  console.log('  总结');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('  1. 单例：一个类只有一个实例，全局访问');
  console.log('  2. JS 实现方式：闭包、Class静态属性、最推荐直接 export 实例');
  console.log('  3. 饿汉式（启动即创建）vs 懒汉式（用到才创建）');
  console.log('  4. JS 单线程无传统线程安全问题，但异步初始化需注意');
  console.log('  5. Node.js 模块缓存天然就是单例模式');
  console.log('');
})();
`
  },
  {
    id: "n3-factory",
    group: "第二部分 创建型设计模式",
    icon: "🏭",
    title: "工厂模式（Factory）",
    content: `# 工厂模式（Factory）

工厂模式是创建型设计模式中最常用的一种。它的核心思想很朴素：**不要直接 new 对象，而是把创建对象的逻辑封装到一个"工厂"里，由工厂来负责创建对象**。

你可能会问：new 有什么不好的？为什么要用工厂？当对象的创建逻辑复杂、需要根据不同条件创建不同类型的对象、或者创建对象需要依赖其他东西时，直接 new 就会导致代码耦合、难以维护。工厂模式就是用来解决这个问题的。

---

## 为什么不用直接 new？

来看一个反例：
\`\`\`js
// 不好的写法：到处直接 new，和具体类强耦合
if (role === 'user') {
  user = new User(name, email, DEFAULT_USER_PERMISSIONS);
} else if (role === 'admin') {
  user = new Admin(name, email, ALL_PERMISSIONS, 'super-secret-key');
} else if (role === 'guest') {
  user = new Guest(name);
}
// 权限变了、类构造函数参数变了，你要改所有地方！
\`\`\`

如果我们把创建逻辑封装到工厂里：
\`\`\`js
// 好的写法：只和工厂打交道，不管具体怎么创建
const user = UserFactory.create(role, { name, email });
\`\`\`

好处：
1. **解耦**：使用方不需要知道具体类名、构造参数、初始化逻辑
2. **开闭原则**：新增类型时只改工厂，不用改所有使用方
3. **复用**：创建逻辑集中管理，不会到处复制粘贴
4. **可读性**：工厂方法名可以自文档化（如 createAdmin、createFromToken）

---

## 工厂模式的三种形态

工厂模式不是一个模式，而是一组模式，从简单到复杂分为三种：

### 1. 简单工厂（Simple Factory）

最简单的形态：一个工厂类/函数，根据传入的参数决定创建哪个类的实例。

**UML**：
\`\`\`
┌─────────────┐     creates     ┌─────────────┐
│   Factory   │ ──────────────> │  Product    │
│ +create()   │                 │   (接口)    │
└─────────────┘                 └──────┬──────┘
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                  ┌───────────┐ ┌───────────┐ ┌───────────┐
                  │ProductA   │ │ProductB   │ │ProductC   │
                  └───────────┘ └───────────┘ └───────────┘
\`\`\`

缺点：新增产品类型必须修改工厂的 switch/if-else，违反开闭原则。但在简单场景下完全够用，是最实用的。

### 2. 工厂方法（Factory Method）

把创建逻辑推迟到子类：定义一个创建对象的接口，但让子类来决定实例化哪个类。

每个产品类型对应一个工厂子类：
- LoggerFactory 是抽象工厂
  - FileLoggerFactory extends LoggerFactory，创建 FileLogger
  - ConsoleLoggerFactory extends LoggerFactory，创建 ConsoleLogger
  - RemoteLoggerFactory extends LoggerFactory，创建 RemoteLogger

优点：新增产品时只需要加新的工厂子类，不需要改已有代码，符合开闭原则。
缺点：类的数量变多了，每个产品都要对应一个工厂。

### 3. 抽象工厂（Abstract Factory）

创建**一系列相关/互相依赖的对象**的接口，不需要指定具体类。抽象工厂是"工厂的工厂"——一个工厂可以生产多种产品，但它们是同一个"家族"的。

比如 UI 组件库：
- LightThemeFactory：创建浅色的 Button、Input、Card
- DarkThemeFactory：创建深色的 Button、Input、Card
- 每个工厂生产一整套配套的组件（同一主题的按钮、输入框、卡片都是同风格的）

这才是真正的 GoF 23 种设计模式里的"抽象工厂"。简单工厂和工厂方法是抽象工厂的简化和衍生。

---

## 应用场景

什么时候用工厂模式？

1. **创建逻辑复杂**：对象创建需要很多步骤、依赖配置、或者有很多默认参数
2. **需要根据类型/配置创建不同对象**：比如根据日志级别/配置输出到不同地方
3. **跨平台/跨环境**：比如根据运行环境创建不同的 API 实现（浏览器版 vs Node.js 版）
4. **对象复用/池化**：工厂可以管理对象池，返回已有实例而不是每次新建（类似单例但支持多类型）
5. **依赖注入**：工厂可以注入依赖，使用方不需要手动传递所有依赖
6. **测试时 mock**：用工厂可以方便地替换成真/假实现

---

## JS 特性让工厂模式更简单

在传统面向对象语言（Java/C++）里，工厂模式需要写很多接口、抽象类、实现类，非常繁琐。但在 JavaScript 里：
- 函数是一等公民，工厂就是一个返回对象的函数
- 没有强类型约束，不需要定义接口，鸭子类型就行
- 对象字面量可以直接创建对象，不需要类
- 闭包可以实现私有变量，不需要复杂的类结构

所以 JS 中的工厂模式非常轻量，很多时候一个简单的工厂函数就够了，不需要上抽象工厂那一套。记住：**模式是思想，不是固定的类结构**。
`,
    code: `// ============================================
// 工厂模式三种实现方式
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  🏭 工厂模式（Factory）');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 1. 简单工厂：创建不同角色的用户 ============
console.log('【1. 简单工厂：根据角色创建不同用户】');
console.log('');

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.role = 'user';
    this.permissions = ['read:own'];
  }
  describe() {
    return \`普通用户 \${this.name}，权限：\${this.permissions.join(', ')}\`;
  }
}

class Admin {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.role = 'admin';
    this.permissions = ['read:all', 'write:all', 'delete:all', 'manage:users'];
    this.adminKey = 'ADMIN-KEY-XXXX';
  }
  describe() {
    return \`管理员 \${this.name}，拥有所有权限\`;
  }
}

class Guest {
  constructor() {
    this.name = '访客';
    this.role = 'guest';
    this.permissions = ['read:public'];
  }
  describe() {
    return \`访客，只有公开内容读取权限\`;
  }
}

const UserFactory = {
  create(role, options = {}) {
    switch (role) {
      case 'user':
        if (!options.name || !options.email) {
          throw new Error('用户需要 name 和 email');
        }
        return new User(options.name, options.email);
      case 'admin':
        if (!options.name || !options.email) {
          throw new Error('管理员需要 name 和 email');
        }
        return new Admin(options.name, options.email);
      case 'guest':
        return new Guest();
      default:
        throw new Error('未知角色: ' + role);
    }
  }
};

const user = UserFactory.create('user', { name: '张三', email: 'zhangsan@test.com' });
const admin = UserFactory.create('admin', { name: '李四', email: 'lisi@test.com' });
const guest = UserFactory.create('guest');

console.log('  ' + user.describe());
console.log('  ' + admin.describe());
console.log('  ' + guest.describe());
console.log('');

// ============ 2. 工厂方法：日志记录器工厂 ============
console.log('═══════════════════════════════════════════');
console.log('【2. 工厂方法：不同日志输出器】');
console.log('═══════════════════════════════════════════');
console.log('');

class ConsoleLogger {
  log(msg) {
    console.log('  [Console]', msg);
  }
}

class FileLogger {
  constructor() {
    this.filePath = '/var/log/app.log';
    this.buffer = [];
  }
  log(msg) {
    const line = '[' + new Date().toISOString() + '] ' + msg;
    this.buffer.push(line);
    console.log('  [File -> ' + this.filePath + ']', msg);
  }
  flush() {
    console.log('  [File] 写入磁盘，共 ' + this.buffer.length + ' 条');
  }
}

class RemoteLogger {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.queue = [];
  }
  log(msg) {
    this.queue.push({ msg, time: Date.now() });
    console.log('  [Remote -> ' + this.endpoint + ']', msg);
  }
  send() {
    console.log('  [Remote] 批量发送 ' + this.queue.length + ' 条到服务器');
    this.queue = [];
  }
}

class LoggerFactory {
  createLogger() {
    throw new Error('子类必须实现 createLogger');
  }
}

class ConsoleLoggerFactory extends LoggerFactory {
  createLogger() {
    return new ConsoleLogger();
  }
}

class FileLoggerFactory extends LoggerFactory {
  createLogger() {
    return new FileLogger();
  }
}

class RemoteLoggerFactory extends LoggerFactory {
  constructor(endpoint) {
    super();
    this.endpoint = endpoint;
  }
  createLogger() {
    return new RemoteLogger(this.endpoint);
  }
}

function setupLogger(factory) {
  return factory.createLogger();
}

const consoleLogger = setupLogger(new ConsoleLoggerFactory());
const fileLogger = setupLogger(new FileLoggerFactory());
const remoteLogger = setupLogger(new RemoteLoggerFactory('https://logs.example.com/collect'));

consoleLogger.log('Hello Console!');
fileLogger.log('Hello File!');
fileLogger.flush();
remoteLogger.log('Hello Remote!');
remoteLogger.send();
console.log('');

// ============ 3. 抽象工厂：UI 组件库（跨主题）============
console.log('═══════════════════════════════════════════');
console.log('【3. 抽象工厂：UI 组件工厂（浅色/深色主题）】');
console.log('═══════════════════════════════════════════');
console.log('');

class LightButton {
  render() { return '🔳 浅色按钮 [白底黑字]'; }
}
class LightInput {
  render() { return '▭ 浅色输入框 [白底黑框]'; }
}
class LightCard {
  render() { return '◻️ 浅色卡片 [浅灰背景圆角]'; }
}

class DarkButton {
  render() { return '🔲 深色按钮 [黑底白字]'; }
}
class DarkInput {
  render() { return '▬ 深色输入框 [黑底灰框]'; }
}
class DarkCard {
  render() { return '◼️ 深色卡片 [深灰背景圆角]'; }
}

class UIThemeFactory {
  createButton() { throw new Error('抽象方法'); }
  createInput() { throw new Error('抽象方法'); }
  createCard() { throw new Error('抽象方法'); }
}

class LightThemeFactory extends UIThemeFactory {
  createButton() { return new LightButton(); }
  createInput() { return new LightInput(); }
  createCard() { return new LightCard(); }
}

class DarkThemeFactory extends UIThemeFactory {
  createButton() { return new DarkButton(); }
  createInput() { return new DarkInput(); }
  createCard() { return new DarkCard(); }
}

function renderApp(themeFactory) {
  const btn = themeFactory.createButton();
  const input = themeFactory.createInput();
  const card = themeFactory.createCard();
  console.log(' ' + btn.render());
  console.log(' ' + input.render());
  console.log(' ' + card.render());
}

console.log('  --- 浅色主题 ---');
renderApp(new LightThemeFactory());
console.log('');
console.log('  --- 深色主题 ---');
renderApp(new DarkThemeFactory());
console.log('');

// ============ JS 风格：工厂函数（不需要 class）============
console.log('═══════════════════════════════════════════');
console.log('【JS 风格：纯工厂函数（不需要类）】');
console.log('═══════════════════════════════════════════');
console.log('');

function createApiClient(baseURL, options = {}) {
  const { timeout = 5000, headers = {} } = options;
  
  async function request(path, opts = {}) {
    const url = baseURL + path;
    const config = {
      headers: { ...headers, ...opts.headers },
      timeout,
      ...opts
    };
    console.log('  → ' + (opts.method || 'GET') + ' ' + url);
    return { data: { ok: true, url } };
  }

  return {
    get: (path, opts) => request(path, { ...opts, method: 'GET' }),
    post: (path, data, opts) => request(path, { ...opts, method: 'POST', body: data }),
    put: (path, data, opts) => request(path, { ...opts, method: 'PUT', body: data }),
    delete: (path, opts) => request(path, { ...opts, method: 'DELETE' })
  };
}

const api = createApiClient('https://api.example.com', {
  timeout: 3000,
  headers: { 'Authorization': 'Bearer xxx' }
});

api.get('/users');
api.post('/users', { name: 'test' });
console.log('  ✅ JS 中工厂函数比工厂类更简洁自然');
console.log('');

console.log('═══════════════════════════════════════════');
console.log('  总结');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('  1. 工厂模式：封装对象创建逻辑，解耦使用方和具体类');
console.log('  2. 三种形态：简单工厂（最常用）、工厂方法、抽象工厂');
console.log('  3. 简单工厂：一个工厂根据参数创建不同对象');
console.log('  4. 工厂方法：子类决定创建什么，符合开闭原则');
console.log('  5. 抽象工厂：创建一整套相关对象（跨主题/跨平台）');
console.log('  6. JS 中工厂函数往往比类层次结构更实用');
console.log('');
`
  },
  {
    id: "n3-builder",
    group: "第二部分 创建型设计模式",
    icon: "🏗️",
    title: "建造者模式（Builder）",
    content: `# 建造者模式（Builder）

建造者模式也是创建型模式的一种，它的核心思想是：**将一个复杂对象的构建过程与它的表示分离，使得同样的构建过程可以创建不同的表示**。

说人话就是：创建一个对象需要很多步骤、很多参数，与其搞一个十几二十个参数的"巨型构造函数"，不如用一个建造者对象，一步步设置属性，最后调用 build() 一把生成最终对象。

---

## 为什么需要建造者模式？

想象一下你要创建一个 HTTP 请求对象，它有很多可选参数：
\`\`\`js
// 反面教材： telescoping constructor（望远镜构造函数）
const req = new Request(
  'https://api.example.com/users',  // url
  'POST',                           // method
  { 'Content-Type': 'application/json' }, // headers
  JSON.stringify({ name: 'test' }), // body
  5000,                             // timeout
  true,                             // withCredentials
  'arraybuffer',                    // responseType
  3,                                // retries
  1000,                             // retryDelay
  // ... 可能还有更多参数
);
\`\`\`

这种写法的问题：
1. **参数太多，记不住顺序**：第 7 个参数是什么？鬼知道。
2. **可读性差**：看到一堆 true/5000/3 根本不知道是什么意思。
3. **可选参数组合爆炸**：你可能需要很多重载版本来支持不同参数组合。
4. **无法分步构建**：有时候你需要在不同地方设置不同属性，最后再生成对象。

建造者模式就是来解决这个问题的：
\`\`\`js
const req = new RequestBuilder()
  .url('https://api.example.com/users')
  .method('POST')
  .header('Content-Type', 'application/json')
  .body({ name: 'test' })
  .timeout(5000)
  .retry(3, 1000)
  .build();
\`\`\`

是不是清晰多了？这就是我们最熟悉的**链式调用**风格。

---

## 建造者模式 vs 工厂模式

很多人会混淆建造者和工厂，它们的区别是什么？

| 维度 | 工厂模式 | 建造者模式 |
|------|---------|-----------|
| 创建方式 | 一次性创建整个对象 | 分步骤一步步构建 |
| 关注点 | "创建什么类型" | "怎么一步步创建" |
| 复杂度 | 适合对象本身不复杂，但类型多的场景 | 适合对象创建过程复杂、参数多的场景 |
| 产物 | 立刻返回最终对象 | 最后 build() 才生成最终对象 |
| 过程 | 创建过程对使用方隐藏 | 使用方明确知道自己在设置什么 |

简单说：**工厂是"你告诉我要什么，我给你造出来"；建造者是"你一步步指挥我怎么造，最后给你成品"。**

---

## 链式调用的原理

建造者模式的标志性特征就是**链式调用**（Fluent Interface），它的原理非常简单：**每个设置方法都 return this**。

\`\`\`js
class Builder {
  setA(a) {
    this.a = a;
    return this; // 返回自己，就能继续 .setB()
  }
  setB(b) {
    this.b = b;
    return this;
  }
  build() {
    return { a: this.a, b: this.b };
  }
}
\`\`\`

jQuery 就是链式调用的经典例子：\`$('.btn').addClass('active').show().on('click', handler)\`。现代 JS 的很多库（axios、lodash、knex）都大量使用这种风格。

---

## Director 角色是什么？

标准的建造者模式有一个 Director（指挥者）角色：Director 定义了"构建流程"，它知道按什么顺序调用建造者的方法，但不关心具体部件怎么创建。

比如你要做一个"默认请求"的构建流程：
\`\`\`js
class RequestDirector {
  static buildDefaultApiRequest(builder) {
    return builder
      .method('GET')
      .timeout(5000)
      .header('Accept', 'application/json')
      .withCredentials()
      .retry(2)
      .build();
  }
}
// 使用
const req = RequestDirector.buildDefaultApiRequest(
  new RequestBuilder().url('/api/users')
);
\`\`\`

Director 封装了"标准构建步骤"，使用方只需要填差异化的部分（比如 url）。但在 JS 实践中，Director 经常被省略——建造者本身提供默认值，使用方直接链式调用设置就行。

---

## 应用场景

什么时候用建造者模式？

1. **配置对象特别复杂**：参数多、有很多可选配置、有默认值（如 HTTP 请求、数据库连接配置）
2. **SQL 查询构建器**：knex.js、Sequelize 的 query builder，\`select().from().where().orderBy()\` 链式调用
3. **测试数据构建**：单元测试中构建测试对象，用 builder 可以只设置关心的字段，其他用默认值
4. **文档/报表生成**：构建复杂的文档对象，可以一步步加标题、段落、图片
5. **邮件/消息构建**：收件人、主题、正文、附件分步骤添加
6. **DTO/验证对象**：构建时顺便做验证，build() 时检查必填项是否都有了

---

## JS 中的建造者模式

JS 中建造者模式更轻量：
- 不需要 Builder 接口和 ConcreteBuilder 类分层
- 链式调用 return this 就行
- 甚至不需要类，用闭包返回一个带方法的对象就行
- 对象字面量 + 展开运算符有时也能解决问题（如 \`{...defaults, ...options}\`），但当有逻辑（验证、默认值依赖、步骤顺序）时，建造者更合适
`,
    code: `// ============================================
// 建造者模式（Builder）
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  🏗️ 建造者模式（Builder）');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 1. HTTP 请求构建器 ============
console.log('【1. HTTP 请求构建器（链式调用）】');
console.log('');

class RequestBuilder {
  constructor() {
    this._url = '';
    this._method = 'GET';
    this._headers = {};
    this._body = null;
    this._timeout = 3000;
    this._withCredentials = false;
    this._retries = 0;
    this._retryDelay = 1000;
  }

  url(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('url 不能为空');
    }
    this._url = url;
    return this;
  }

  method(method) {
    const allowed = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    const m = method.toUpperCase();
    if (!allowed.includes(m)) {
      throw new Error('不支持的 HTTP 方法: ' + method);
    }
    this._method = m;
    return this;
  }

  header(key, value) {
    this._headers[key] = value;
    return this;
  }

  headers(obj) {
    Object.assign(this._headers, obj);
    return this;
  }

  body(data) {
    this._body = data;
    if (data && typeof data === 'object') {
      if (!this._headers['Content-Type']) {
        this._headers['Content-Type'] = 'application/json';
      }
    }
    return this;
  }

  timeout(ms) {
    if (ms < 0) throw new Error('timeout 不能为负');
    this._timeout = ms;
    return this;
  }

  withCredentials() {
    this._withCredentials = true;
    return this;
  }

  retry(count, delay = 1000) {
    this._retries = count;
    this._retryDelay = delay;
    return this;
  }

  get() { this._method = 'GET'; return this; }
  post() { this._method = 'POST'; return this; }
  put() { this._method = 'PUT'; return this; }
  delete() { this._method = 'DELETE'; return this; }

  build() {
    if (!this._url) {
      throw new Error('必须设置 url');
    }
    if (['POST', 'PUT', 'PATCH'].includes(this._method) && !this._body) {
      console.log('  ⚠️  注意：' + this._method + ' 请求通常需要 body');
    }
    return Object.freeze({
      url: this._url,
      method: this._method,
      headers: { ...this._headers },
      body: this._body,
      timeout: this._timeout,
      withCredentials: this._withCredentials,
      retries: this._retries,
      retryDelay: this._retryDelay
    });
  }
}

const getUserReq = new RequestBuilder()
  .url('https://api.example.com/users/123')
  .timeout(5000)
  .header('Authorization', 'Bearer token123')
  .build();

const createUserReq = new RequestBuilder()
  .url('https://api.example.com/users')
  .post()
  .body({ name: '张三', email: 'zhangsan@test.com' })
  .timeout(8000)
  .withCredentials()
  .retry(3, 500)
  .build();

console.log('  GET 请求:');
console.log('    url:', getUserReq.url);
console.log('    method:', getUserReq.method);
console.log('    headers:', JSON.stringify(getUserReq.headers));
console.log('    timeout:', getUserReq.timeout + 'ms');
console.log('');
console.log('  POST 请求:');
console.log('    url:', createUserReq.url);
console.log('    method:', createUserReq.method);
console.log('    Content-Type 自动设置:', createUserReq.headers['Content-Type']);
console.log('    body:', JSON.stringify(createUserReq.body));
console.log('    retries:', createUserReq.retries);
console.log('');

// ============ 2. SQL 查询构建器 ============
console.log('═══════════════════════════════════════════');
console.log('【2. SQL 查询构建器】');
console.log('═══════════════════════════════════════════');
console.log('');

class SqlBuilder {
  constructor() {
    this._select = '*';
    this._from = '';
    this._where = [];
    this._orderBy = [];
    this._limit = null;
    this._offset = null;
    this._joins = [];
    this._params = [];
  }

  select(fields) {
    if (Array.isArray(fields)) {
      this._select = fields.join(', ');
    } else {
      this._select = fields;
    }
    return this;
  }

  from(table) {
    this._from = table;
    return this;
  }

  where(condition, ...params) {
    this._where.push(condition);
    this._params.push(...params);
    return this;
  }

  andWhere(condition, ...params) {
    return this.where(condition, ...params);
  }

  join(table, on) {
    this._joins.push('JOIN ' + table + ' ON ' + on);
    return this;
  }

  leftJoin(table, on) {
    this._joins.push('LEFT JOIN ' + table + ' ON ' + on);
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this._orderBy.push(field + ' ' + direction.toUpperCase());
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  offset(n) {
    this._offset = n;
    return this;
  }

  build() {
    if (!this._from) {
      throw new Error('必须指定 from 表名');
    }
    let sql = 'SELECT ' + this._select + ' FROM ' + this._from;
    if (this._joins.length) {
      sql += ' ' + this._joins.join(' ');
    }
    if (this._where.length) {
      sql += ' WHERE ' + this._where.join(' AND ');
    }
    if (this._orderBy.length) {
      sql += ' ORDER BY ' + this._orderBy.join(', ');
    }
    if (this._limit !== null) {
      sql += ' LIMIT ' + this._limit;
    }
    if (this._offset !== null) {
      sql += ' OFFSET ' + this._offset;
    }
    return { sql: sql + ';', params: [...this._params] };
  }
}

const query1 = new SqlBuilder()
  .select(['id', 'name', 'email'])
  .from('users')
  .where('age > ?', 18)
  .where('status = ?', 'active')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .build();

console.log('  分页查询活跃用户：');
console.log('  SQL:', query1.sql);
console.log('  参数:', query1.params);
console.log('');

const query2 = new SqlBuilder()
  .select('u.id, u.name, COUNT(o.id) as order_count')
  .from('users u')
  .leftJoin('orders o', 'o.user_id = u.id')
  .where('u.created_at > ?', '2024-01-01')
  .groupBy = undefined;
console.log('  💡 实际的 SQL builder 还会有 groupBy/having 等');
console.log('');

// ============ 3. 邮件构建器 ============
console.log('═══════════════════════════════════════════');
console.log('【3. 邮件消息构建器】');
console.log('═══════════════════════════════════════════');
console.log('');

function createEmailBuilder() {
  let _from = '';
  let _to = [];
  let _cc = [];
  let _bcc = [];
  let _subject = '';
  let _text = '';
  let _html = '';
  let _attachments = [];

  return {
    from(addr) { _from = addr; return this; },
    to(addr) {
      _to = _to.concat(Array.isArray(addr) ? addr : [addr]);
      return this;
    },
    cc(addr) {
      _cc = _cc.concat(Array.isArray(addr) ? addr : [addr]);
      return this;
    },
    subject(subj) { _subject = subj; return this; },
    text(content) { _text = content; return this; },
    html(content) { _html = content; return this; },
    attach(filename, content) {
      _attachments.push({ filename, content });
      return this;
    },
    build() {
      if (!_to.length) throw new Error('收件人不能为空');
      if (!_subject) throw new Error('主题不能为空');
      return {
        from: _from,
        to: _to,
        cc: _cc,
        bcc: _bcc,
        subject: _subject,
        text: _text,
        html: _html,
        attachments: _attachments
      };
    }
  };
}

const welcomeEmail = createEmailBuilder()
  .from('noreply@example.com')
  .to(['user1@test.com', 'user2@test.com'])
  .cc('admin@test.com')
  .subject('欢迎注册！')
  .html('<h1>欢迎你！</h1><p>感谢注册我们的服务</p>')
  .text('欢迎你！感谢注册我们的服务')
  .attach('welcome-guide.pdf', 'PDF二进制内容...')
  .build();

console.log('  欢迎邮件：');
console.log('    发件人:', welcomeEmail.from);
console.log('    收件人:', welcomeEmail.to.join(', '));
console.log('    抄送:', welcomeEmail.cc.join(', '));
console.log('    主题:', welcomeEmail.subject);
console.log('    附件数:', welcomeEmail.attachments.length);
console.log('');

console.log('═══════════════════════════════════════════');
console.log('  总结');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('  1. 建造者模式：分步骤构建复杂对象，链式调用');
console.log('  2. 核心原理：每个设置方法 return this 支持链式');
console.log('  3. vs 工厂：工厂关注"创建什么"，建造者关注"怎么一步步创建"');
console.log('  4. Director 封装标准构建流程（JS 中常省略）');
console.log('  5. 典型应用：HTTP client、SQL builder、测试数据构造器');
console.log('');
`
  },
  {
    id: "n3-prototype",
    group: "第二部分 创建型设计模式",
    icon: "🧬",
    title: "原型模式（Prototype）",
    content: `# 原型模式（Prototype）

原型模式可能是 JavaScript 中最"原生"的设计模式——因为 JavaScript 本身就是基于原型的语言！原型模式的核心思想是：**通过克隆一个已有对象来创建新对象，而不是通过 new 实例化类**。

在 Java/C++ 这类基于类的语言中，原型模式需要实现 Cloneable 接口、重写 clone() 方法。但在 JavaScript 中，原型链机制让原型模式成为语言的一部分，\`Object.create()\` 就是原型模式的原生实现。

---

## 模式定义

**意图**：用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。

简单说：你有一个"原型对象"，新对象不是从头创建，而是以这个原型为模板，克隆出一个新对象，可以在克隆后修改部分属性。

**UML 类图**：
\`\`\`
┌─────────────────┐
│    Prototype    │
├─────────────────┤
│ + clone()       │ ← 克隆自己的方法
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ConcA  │ │ConcB  │  具体原型类实现 clone()
└───────┘ └───────┘

客户端代码：
const p1 = new ConcretePrototype1();
const p2 = p1.clone(); // 通过克隆创建新对象
\`\`\`

---

## JavaScript 中的原型链 = 语言级别的原型模式

理解原型模式的关键是理解 JavaScript 的原型链：

- 每个对象都有一个隐藏的 \`[[Prototype]]\` 属性（可以通过 \`__proto__\` 或 \`Object.getPrototypeOf()\` 访问），指向它的原型对象
- 当你访问一个对象的属性时，如果对象本身没有，就去它的原型上找，原型还没有就去原型的原型找，直到 null（原型链尽头）
- \`Object.create(proto)\` 创建一个新对象，新对象的 \`[[Prototype]]\` 指向 proto

这就是原型模式！你不需要"克隆"整个对象（深拷贝），只需要让新对象继承原型对象的属性。原型上的方法是**所有实例共享**的，节省内存。

这也是 ES6 class 的本质：\`class\` 语法糖背后还是原型链。\`new Circle()\` 创建的对象，其 \`[[Prototype]]\` 指向 \`Circle.prototype\`。

---

## Object.create() 的用法

\`Object.create(proto, propertiesObject)\` 是原型模式的核心 API：

\`\`\`js
const shape = {
  type: 'shape',
  getType() { return this.type; },
  area() { return 0; }
};

const circle = Object.create(shape, {
  radius: { value: 5, writable: true },
  type: { value: 'circle' },
  area: {
    value() { return Math.PI * this.radius * this.radius; }
  }
});

console.log(circle.getType()); // 'circle' —— 自己有 type，用自己的
console.log(circle.area()); // 自己有 area
// getType 在 shape 上，但 circle 通过原型链能访问到
\`\`\`

Object.create 比直接 \`{}\` 更纯粹——它创建一个真正"空"的对象（连 toString 都没有，因为原型是 null：\`Object.create(null)\`）。

---

## 浅克隆 vs 深克隆

原型模式的"克隆"有两种：

**浅克隆（Shallow Clone）**：复制基本类型属性，引用类型属性仍然指向原来的对象。
- \`Object.create(proto)\`：新对象继承原型，共享原型上的引用属性
- \`Object.assign({}, obj)\`：浅拷贝
- 展开运算符 \`{...obj}\`：浅拷贝
- 数组的 \`slice()\`、\`concat()\`、\`[...arr]\`：浅拷贝

**深克隆（Deep Clone）**：递归复制所有嵌套对象，新老对象完全独立互不影响。
- \`JSON.parse(JSON.stringify(obj))\`：简单但有局限（不能处理函数、循环引用、Date、RegExp 等）
- \`structuredClone()\`：浏览器/Node.js 新 API，支持更多类型但仍不支持函数
- 手写递归深拷贝：最灵活但要处理各种边界情况

在原型模式的语境中，我们通常说的是**原型继承式的克隆**——不是拷贝所有属性，而是让新对象的原型指向原型对象，共享方法。这是一种"懒惰"的克隆：方法共享，属性需要时才覆盖。

---

## 原型继承 vs 类继承

JavaScript 中这两种风格你都会遇到：

**类风格（ES6 class）**：
\`\`\`js
class Shape {
  constructor(x, y) { this.x = x; this.y = y; }
  move(x, y) { this.x += x; this.y += y; }
}
class Circle extends Shape {
  constructor(x, y, r) { super(x, y); this.r = r; }
  area() { return Math.PI * this.r * this.r; }
}
\`\`\`

**原型风格（Object.create）**：
\`\`\`js
const Shape = {
  init(x, y) { this.x = x; this.y = y; return this; },
  move(x, y) { this.x += x; this.y += y; }
};
const Circle = Object.create(Shape);
Circle.init = function(x, y, r) {
  Shape.init.call(this, x, y);
  this.r = r;
  return this;
};
Circle.area = function() { return Math.PI * this.r * this.r; };

const c = Object.create(Circle).init(0, 0, 5);
\`\`\`

ES6 class 本质上就是原型继承的语法糖，让写法更接近传统 OOP 语言。理解了原型，你就理解了 JS 继承的本质。

---

## 性能优势：为什么用克隆？

原型模式（克隆）相比 new 有什么性能优势？

当对象的创建/初始化开销很大时（比如需要大量计算、读取配置、加载数据），克隆一个已经创建好的"模板"对象比重新初始化要快得多。

特别是在需要创建大量相似对象的场景：
- 游戏中生成大量敌人/粒子，用原型克隆比每次 new + 初始化快
- 文档编辑器中创建大量相似形状，克隆模板后只改位置/大小
- 测试中创建测试数据，克隆基础模板后只改差异字段

但在 JS 中，\`Object.create()\` 和 \`new\` 的性能差异在现代引擎中已经很小，性能不是选择原型模式的主要理由——**代码组织和内存共享**才是。

---

## 内存共享：原型方法不占多份内存

这是原型模式一个重要但常被忽略的好处：**原型上的方法被所有实例共享，不会每个实例都拷贝一份**。

\`\`\`js
// 不好：每个对象都有自己的方法副本（占内存）
function createBadCircle(r) {
  return {
    r,
    area() { return Math.PI * r * r; }, // 每个对象都创建一个新函数！
    circumference() { return 2 * Math.PI * r; }
  };
}

// 好：方法在原型上，所有实例共享
const circlePrototype = {
  area() { return Math.PI * this.r * this.r; },
  circumference() { return 2 * Math.PI * this.r; }
};
function createCircle(r) {
  const c = Object.create(circlePrototype);
  c.r = r;
  return c;
}
// 创建 10000 个 circle，方法在内存中只有一份！
\`\`\`

这也是为什么 JS 引擎把 class 的方法放在 prototype 上——这是语言设计的优化。
`,
    code: `// ============================================
// 原型模式（Prototype）
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  🧬 原型模式（Prototype）');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 1. 用 Object.create 实现原型继承 ============
console.log('【1. Shape 原型体系：原型继承】');
console.log('');

const Shape = {
  type: 'shape',
  
  init(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  },
  
  area() {
    return 0;
  },
  
  toString() {
    return this.type + ' at (' + this.x + ', ' + this.y + ')';
  }
};

const Circle = Object.create(Shape);
Circle.type = 'circle';

Circle.init = function(x, y, radius) {
  Shape.init.call(this, x, y);
  this.radius = radius;
  return this;
};

Circle.area = function() {
  return Math.PI * this.radius * this.radius;
};

Circle.toString = function() {
  return Shape.toString.call(this) + ', radius=' + this.radius + ', area=' + this.area().toFixed(2);
};

const Rectangle = Object.create(Shape);
Rectangle.type = 'rectangle';

Rectangle.init = function(x, y, width, height) {
  Shape.init.call(this, x, y);
  this.width = width;
  this.height = height;
  return this;
};

Rectangle.area = function() {
  return this.width * this.height;
};

const c1 = Object.create(Circle).init(10, 20, 5);
const c2 = Object.create(Circle).init(30, 40, 10);
const r1 = Object.create(Rectangle).init(0, 0, 8, 6);

console.log('  ' + c1.toString());
console.log('  ' + c2.toString());
console.log('  ' + r1.toString());
console.log('');
console.log('  c1.move(5, 5):', c1.move(5, 5).toString());
console.log('');

// 验证：原型方法共享
console.log('  c1.area === c2.area:', c1.area === c2.area);
console.log('  c1.move === c2.move:', c1.move === c2.move);
console.log('  c1.toString === c2.toString:', c1.toString === c2.toString);
console.log('  ✅ 方法在原型上，所有实例共享同一份，节省内存');
console.log('');

// ============ 2. 克隆模式：从原型对象创建新对象 ============
console.log('═══════════════════════════════════════════');
console.log('【2. 对象克隆：浅克隆与深克隆】');
console.log('═══════════════════════════════════════════');
console.log('');

const enemyPrototype = {
  type: 'enemy',
  health: 100,
  attack: 10,
  position: { x: 0, y: 0 },
  skills: ['attack', 'defend'],
  
  takeDamage(dmg) {
    this.health -= dmg;
    return this.health;
  },
  
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned.health = this.health;
    cloned.attack = this.attack;
    cloned.type = this.type;
    cloned.position = { ...this.position };
    cloned.skills = [...this.skills];
    return cloned;
  }
};

const enemy1 = Object.create(enemyPrototype);
enemy1.init = function(x, y) {
  this.position = { x, y };
  return this;
};

const bossPrototype = Object.create(enemyPrototype);
bossPrototype.type = 'boss';
bossPrototype.health = 500;
bossPrototype.attack = 50;
bossPrototype.skills = ['attack', 'defend', 'fireball', 'summon'];

const goblin1 = Object.create(enemyPrototype).init(100, 200);
const goblin2 = goblin1.clone();
goblin2.position = { x: 150, y: 200 };
goblin2.takeDamage(20);

const boss1 = Object.create(bossPrototype).init(500, 500);

console.log('  哥布林1: HP=' + goblin1.health + ' at (' + goblin1.position.x + ',' + goblin1.position.y + ')');
console.log('  哥布林2(克隆): HP=' + goblin2.health + ' at (' + goblin2.position.x + ',' + goblin2.position.y + ')');
console.log('  💡 哥布林2是克隆的，但受击是独立的（HP变了不影响哥布林1）');
console.log('  BOSS: ' + boss1.type + ' HP=' + boss1.health + ' 技能=' + boss1.skills.join(','));
console.log('');

// ============ 3. 内存对比：原型方式 vs 工厂函数每个对象创建方法 ============
console.log('═══════════════════════════════════════════');
console.log('【3. 内存共享验证：原型方法不重复创建】');
console.log('═══════════════════════════════════════════');
console.log('');

function createCircleNew(r) {
  return {
    r,
    area() { return Math.PI * r * r; },
    circumference() { return 2 * Math.PI * r; }
  };
}

const protoCircle = {
  area() { return Math.PI * this.r * this.r; },
  circumference() { return 2 * Math.PI * this.r; }
};
function createCircleProto(r) {
  const c = Object.create(protoCircle);
  c.r = r;
  return c;
}

const N = 10000;
const badCircles = [];
const goodCircles = [];

for (let i = 0; i < N; i++) {
  badCircles.push(createCircleNew(Math.random() * 100));
  goodCircles.push(createCircleProto(Math.random() * 100));
}

let badMethodCount = 0;
for (let i = 0; i < Math.min(5, N); i++) {
  for (let j = i + 1; j < Math.min(5, N); j++) {
    if (badCircles[i].area !== badCircles[j].area) badMethodCount++;
  }
}

let goodMethodShared = 0;
for (let i = 0; i < Math.min(5, N); i++) {
  for (let j = i + 1; j < Math.min(5, N); j++) {
    if (goodCircles[i].area === goodCircles[j].area) goodMethodShared++;
  }
}

console.log('  创建 ' + N + ' 个圆形对象对比:');
console.log('');
console.log('  ❌ 工厂函数（方法在对象上）:');
console.log('     每个对象都有自己的 area/circumference 函数');
console.log('     前5个对象中，方法不相同的对数:', badMethodCount);
console.log('');
console.log('  ✅ 原型方式（方法在原型上）:');
console.log('     所有实例共享原型上的方法');
console.log('     前5个对象中，方法相同的对数:', goodMethodShared);
console.log('');

// ============ 4. 原型模板：文档编辑器例子 ============
console.log('═══════════════════════════════════════════');
console.log('【4. 原型注册表：模板克隆】');
console.log('═══════════════════════════════════════════');
console.log('');

class PrototypeRegistry {
  constructor() {
    this.prototypes = {};
  }
  
  register(name, proto) {
    this.prototypes[name] = proto;
  }
  
  create(name, overrides = {}) {
    const proto = this.prototypes[name];
    if (!proto) throw new Error('原型不存在: ' + name);
    const obj = Object.create(proto);
    Object.assign(obj, overrides);
    return obj;
  }
}

const registry = new PrototypeRegistry();

registry.register('document', {
  type: 'document',
  title: '未命名文档',
  author: '匿名',
  created: Date.now(),
  sections: [],
  addSection(title, content) {
    this.sections.push({ title, content });
    return this;
  }
});

registry.register('report', Object.create(registry.prototypes['document'], {
  type: { value: 'report' },
  header: { value: '公司机密报告' },
  footer: { value: '© 2024 公司名' }
}));

registry.register('invoice', Object.create(registry.prototypes['document'], {
  type: { value: 'invoice' },
  items: { value: [], writable: true },
  total: {
    get() {
      return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    }
  }
}));

const report = registry.create('report', {
  title: 'Q4 季度财报',
  author: '财务部门'
});
report.addSection('概述', '第四季度营收增长20%');

const invoice = registry.create('invoice', {
  title: '发票 #1001',
  author: '销售部门'
});
invoice.items.push({ name: '笔记本电脑', price: 8000, qty: 2 });
invoice.items.push({ name: '鼠标', price: 200, qty: 5 });

console.log('  报告:', report.title, '-', report.author);
console.log('  章节数:', report.sections.length);
console.log('  发票:', invoice.title, '- 总金额:', invoice.total + '元');
console.log('');

console.log('═══════════════════════════════════════════');
console.log('  总结');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('  1. 原型模式：通过克隆原型创建新对象，而不是 new');
console.log('  2. JavaScript 原生支持原型链，Object.create() 是核心 API');
console.log('  3. 原型上的方法被所有实例共享，节省内存');
console.log('  4. 浅克隆只复制引用，深克隆递归复制所有嵌套对象');
console.log('  5. ES6 class 是原型继承的语法糖');
console.log('  6. 适用场景：相似对象批量创建、模板复用、避免昂贵初始化');
console.log('');
`
  },
  {
    id: "n3-creational-summary",
    group: "第二部分 创建型设计模式",
    icon: "⚖️",
    title: "总结：创建型模式对比与选择",
    content: `# 总结：创建型模式对比与选择

我们已经学习了四种经典创建型设计模式（单例、工厂、建造者、原型），再加上隐式存在的简单工厂/模块机制，GoF 23 种设计模式中的 5 种创建型模式我们都接触到了。这一章我们做一个横向对比，搞清楚**什么时候该用哪种模式**，以及在 JavaScript 中创建型模式有哪些更简单的替代方案。

---

## 创建型模式的核心目标

所有创建型模式都在解决同一个问题：**把对象的创建和使用分离**。

为什么要分离？因为"怎么创建对象"是变化的重灾区：
- 构造函数参数可能变
- 创建的具体类型可能变（从 FileLogger 换成 RemoteLogger）
- 创建过程可能变复杂（从直接 new 变成需要先读配置、先建立连接）
- 可能需要控制创建数量（单例/对象池）

如果你的代码里到处都是 \`new SomeClass(xxx)\`，一旦创建逻辑变了，你要改所有地方——这就是强耦合。创建型模式就是在创建方和使用方之间加一层，让变化被隔离在这一层里。

记住这个核心目标，你就不用死记硬背每个模式的定义了——所有创建型模式都是为了解耦"创建"和"使用"，只是解决的具体场景不同。

---

## 五种创建型模式速查表

| 模式 | 解决什么问题 | 关键词 | 典型例子 |
|------|------------|--------|---------|
| **单例 (Singleton)** | 全局只能有一个实例 | 唯一实例、全局访问 | 配置、日志、连接池、store |
| **简单工厂 (Simple Factory)** | 根据参数创建不同类型对象 | if/switch 创建、集中管理 | UserFactory 根据角色创建用户 |
| **工厂方法 (Factory Method)** | 子类决定创建什么，支持扩展 | 继承、多态、开闭原则 | 不同 LoggerFactory 创建不同 Logger |
| **抽象工厂 (Abstract Factory)** | 创建一整套相关/配套对象 | 产品族、跨主题/跨平台 | UI 组件库（深色/浅色主题） |
| **建造者 (Builder)** | 对象创建步骤多、参数复杂 | 链式调用、分步构建、build() | HTTP 请求、SQL 查询、邮件 |
| **原型 (Prototype)** | 从已有对象克隆，避免重复初始化 | clone()、Object.create、原型链 | 模板文档、游戏单位、形状 |

---

## 怎么选？决策树

当你要创建对象时，问自己几个问题：

1. **这个东西全局需要几个？**
   - 只要一个 → **单例模式**（直接 export 实例就行）
   - 可以有多个 → 继续往下

2. **创建什么类型是固定的还是运行时决定的？**
   - 需要根据参数/配置/环境创建不同类型 → **工厂模式**
     - 类型不多、不太会扩展 → **简单工厂**
     - 经常要加新类型、想符合开闭原则 → **工厂方法**
     - 需要创建一整套配套对象 → **抽象工厂**
   - 类型固定，但创建过程复杂 → 继续往下

3. **创建过程是复杂的多步骤、很多可选参数吗？**
   - 是，参数多、有默认值、需要链式/分步设置 → **建造者模式**
   - 不是，直接构造就行 → 继续往下

4. **有没有一个"模板"对象，新对象和它差不多只改一点点？**
   - 是，从已有对象克隆更快更方便 → **原型模式**
   - 不是，那就直接 new 吧，不需要什么模式！

**最后记住：YAGNI（You Aren't Gonna Need It）——如果你不确定需要模式，就不要用模式。** 简单的场景直接 new 或者直接写对象字面量，不要为了用模式而用模式。

---

## JavaScript 中创建型模式的简化

JavaScript 是一门灵活的语言，很多在 Java/C# 中需要用设计模式解决的问题，在 JS 中有更简单的原生方案。这是 JS 的优势也是陷阱——不要把 Java 的模式生搬硬套到 JS 里。

### 1. 单例 → 模块导出
Java 里要写单例类、私有构造函数、getInstance，JS 里直接：
\`\`\`js
// config.js
export default { db: 'mysql', port: 3306 };
// 所有 import 的地方拿到的是同一个对象，天然单例！
\`\`\`

### 2. 工厂 → 工厂函数
不需要工厂类层次结构，一个函数就行：
\`\`\`js
const createLogger = (type) => type === 'file' ? new FileLogger() : new ConsoleLogger();
\`\`\`

### 3. 建造者 → 链式对象/配置对象
很多时候不需要专门的 Builder 类，一个带默认值的配置对象 + 展开运算符就够了：
\`\`\`js
const request = ({
  url,
  method = 'GET',
  headers = {},
  timeout = 3000,
  ...rest
}) => ({ url, method, headers, timeout, ...rest });
\`\`\`
但当需要 build() 时验证、需要隐式设置 Content-Type 这类逻辑时，建造者还是更好的选择。

### 4. 原型 → Object.create / 原型链
JS 天生是原型语言，Object.create 就是原生的原型模式，不需要写 clone() 方法。

### 5. 高阶函数/闭包替代类结构
很多创建型模式本质上是"封装创建逻辑"，JS 的闭包和高阶函数天然就能封装，不需要类：
\`\`\`js
// 用闭包实现"单例工厂"
const getLogger = (() => {
  let instance;
  return () => instance || (instance = createLogger());
})();
\`\`\`

---

## 创建型模式组合使用

在真实项目中，创建型模式不是互斥的，它们经常组合使用。比如：

- **单例工厂**：整个应用只有一个工厂实例，工厂负责创建各种对象
- **建造者 + 工厂**：工厂里用建造者构建复杂对象
- **原型 + 工厂**：工厂根据名称找到原型然后克隆
- **单例 + 原型注册表**：全局唯一的原型注册表（类似我们上一章写的 PrototypeRegistry）

这些组合不是什么高大上的架构，就是根据需求自然组合而已。

---

## 警惕设计模式滥用

设计模式是工具，不是宗教。滥用设计模式反而会让代码变复杂：

1. **过度工程**：明明一个函数能搞定，非要搞工厂类+抽象工厂+建造者，代码量翻三倍
2. **为了面试而用**：知道了模式就处处想用，简单的 new 也要包装成工厂
3. **生搬硬套**：把 Java 的模式原封不动搬到 JS 里，写一堆没用的抽象类、接口
4. **忽略语言特性**：JS 的闭包、原型链、函数式特性很多时候比模式更简单

判断标准：**如果用了模式之后，代码变得更容易理解、更容易扩展、更容易测试，那就用；如果只是为了"用了设计模式"看起来高级，那就不要用。**
`,
    code: `// ============================================
// 创建型模式综合实例：简单文档编辑器
// ============================================

console.log('═══════════════════════════════════════════');
console.log('  ⚖️ 创建型模式综合应用：文档编辑器');
console.log('═══════════════════════════════════════════');
console.log('');

// ============ 1. 单例：编辑器配置 ============
const EditorConfig = (function () {
  let instance;
  return {
    getInstance() {
      if (!instance) {
        instance = {
          theme: 'light',
          fontSize: 14,
          fontFamily: 'Menlo',
          autoSave: true,
          autoSaveInterval: 30000,
          language: 'zh-CN',
          set(key, value) { this[key] = value; },
          get(key) { return this[key]; }
        };
      }
      return instance;
    }
  };
})();

const config = EditorConfig.getInstance();
console.log('【单例】编辑器配置（全局唯一）:');
console.log('  主题:', config.theme);
console.log('  字体:', config.fontFamily, config.fontSize + 'px');
console.log('');

// ============ 2. 原型：文档模板 ============
const documentPrototypes = {
  blank: {
    type: 'blank',
    title: '空白文档',
    content: '',
    metadata: { created: Date.now(), modified: Date.now() },
    clone() {
      return {
        ...this,
        metadata: { ...this.metadata, created: Date.now(), modified: Date.now() }
      };
    }
  },
  letter: {
    type: 'letter',
    title: '信件模板',
    content: '尊敬的XXX：\\n\\n您好！\\n\\n此致\\n敬礼\\n\\nXXX\\n' + new Date().toLocaleDateString(),
    metadata: { created: Date.now(), modified: Date.now() },
    clone() {
      return {
        ...this,
        title: this.title + ' (副本)',
        metadata: { ...this.metadata, created: Date.now(), modified: Date.now() }
      };
    }
  },
  report: {
    type: 'report',
    title: '报告模板',
    content: '# 报告标题\\n\\n## 一、概述\\n\\n## 二、详细内容\\n\\n## 三、结论\\n',
    metadata: { created: Date.now(), modified: Date.now() },
    clone() {
      return {
        ...this,
        title: this.title + ' (副本)',
        metadata: { ...this.metadata, created: Date.now(), modified: Date.now() }
      };
    }
  }
};

console.log('【原型】可用文档模板:', Object.keys(documentPrototypes).join(', '));
console.log('');

// ============ 3. 工厂：创建不同类型文档 ============
const DocumentFactory = {
  create(type, title) {
    const proto = documentPrototypes[type];
    if (!proto) {
      throw new Error('未知文档类型: ' + type);
    }
    const doc = proto.clone();
    if (title) doc.title = title;
    return doc;
  },
  
  createFromTemplate(templateName, customizations = {}) {
    const doc = this.create(templateName);
    Object.assign(doc, customizations);
    return doc;
  }
};

// ============ 4. 建造者：构建复杂文档 ============
class DocumentBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.doc = {
      type: 'custom',
      title: '',
      sections: [],
      metadata: {
        created: Date.now(),
        modified: Date.now(),
        tags: [],
        author: config.get('defaultAuthor') || '匿名'
      }
    };
    return this;
  }
  
  setTitle(title) {
    this.doc.title = title;
    return this;
  }
  
  setAuthor(author) {
    this.doc.metadata.author = author;
    return this;
  }
  
  addTag(tag) {
    this.doc.metadata.tags.push(tag);
    return this;
  }
  
  addHeading(text, level = 1) {
    this.doc.sections.push({ type: 'heading', level, text });
    return this;
  }
  
  addParagraph(text) {
    this.doc.sections.push({ type: 'paragraph', text });
    return this;
  }
  
  addList(items, ordered = false) {
    this.doc.sections.push({ type: 'list', items, ordered });
    return this;
  }
  
  addCode(language, code) {
    this.doc.sections.push({ type: 'code', language, code });
    return this;
  }
  
  addTable(headers, rows) {
    this.doc.sections.push({ type: 'table', headers, rows });
    return this;
  }
  
  build() {
    if (!this.doc.title) {
      throw new Error('文档必须有标题');
    }
    this.doc.metadata.modified = Date.now();
    
    let content = '# ' + this.doc.title + '\\n\\n';
    content += '作者: ' + this.doc.metadata.author + '\\n\\n';
    
    for (const section of this.doc.sections) {
      switch (section.type) {
        case 'heading':
          content += '#'.repeat(section.level) + ' ' + section.text + '\\n\\n';
          break;
        case 'paragraph':
          content += section.text + '\\n\\n';
          break;
        case 'list':
          const marker = section.ordered ? (i) => (i + 1) + '. ' : () => '- ';
          section.items.forEach((item, i) => {
            content += marker(i) + item + '\\n';
          });
          content += '\\n';
          break;
        case 'code':
          content += '\`\`\`' + section.language + '\\n' + section.code + '\\n\`\`\`\\n\\n';
          break;
        case 'table':
          content += '| ' + section.headers.join(' | ') + ' |\\n';
          content += '| ' + section.headers.map(() => '---').join(' | ') + ' |\\n';
          section.rows.forEach(row => {
            content += '| ' + row.join(' | ') + ' |\\n';
          });
          content += '\\n';
          break;
      }
    }
    
    const result = {
      ...this.doc,
      content,
      wordCount: content.length
    };
    
    this.reset();
    return result;
  }
}

console.log('【工厂 + 建造者】创建文档演示');
console.log('');

const letter = DocumentFactory.create('letter');
console.log('  从模板创建信件:', letter.title);
console.log('');

const projectReport = new DocumentBuilder()
  .setTitle('项目进度周报')
  .setAuthor('张三')
  .addTag('周报')
  .addTag('项目A')
  .addHeading('本周工作', 2)
  .addParagraph('本周主要完成了以下工作：')
  .addList([
    '完成用户模块开发',
    '修复了 5 个 bug',
    '编写了单元测试，覆盖率 85%'
  ])
  .addHeading('下周计划', 2)
  .addList([
    '开始开发订单模块',
    '进行代码 review',
    '部署到测试环境'
  ], true)
  .addHeading('风险与问题', 2)
  .addParagraph('目前有一个阻塞问题需要协调...')
  .build();

console.log('  用建造者构建复杂文档:', projectReport.title);
console.log('  作者:', projectReport.metadata.author);
console.log('  标签:', projectReport.metadata.tags.join(', '));
console.log('  章节数:', projectReport.sections.length);
console.log('  字数:', projectReport.wordCount);
console.log('');

// 输出文档预览
console.log('--- 文档预览 ---');
console.log(projectReport.content.split('\\n').slice(0, 15).join('\\n'));
console.log('...');
console.log('');

// ============ 5. 原型：克隆已有文档 ============
console.log('【原型】克隆已有文档');
const reportCopy = {
  ...projectReport,
  title: projectReport.title + ' (副本)',
  metadata: { ...projectReport.metadata, created: Date.now() }
};
console.log('  克隆后的文档标题:', reportCopy.title);
console.log('  和原文档是不同对象:', reportCopy !== projectReport);
console.log('  但是独立的副本，修改不会影响原文档');
console.log('');

// ============ 6. 文档管理器（单例）============
const DocumentManager = (function () {
  let instance;
  
  function createInstance() {
    const docs = new Map();
    
    return {
      open(doc) {
        docs.set(doc.title, doc);
        console.log('  打开文档:', doc.title);
        return this;
      },
      close(title) {
        docs.delete(title);
        console.log('  关闭文档:', title);
        return this;
      },
      get(title) {
        return docs.get(title);
      },
      list() {
        return Array.from(docs.keys());
      },
      count() {
        return docs.size;
      }
    };
  }
  
  return {
    getInstance() {
      if (!instance) instance = createInstance();
      return instance;
    }
  };
})();

const docManager = DocumentManager.getInstance();
docManager.open(letter);
docManager.open(projectReport);
docManager.open(reportCopy);

console.log('【单例】文档管理器（全局唯一）');
console.log('  已打开文档数:', docManager.count());
console.log('  文档列表:', docManager.list().join(', '));
console.log('');

// ============ 总结 ============
console.log('═══════════════════════════════════════════');
console.log('  创建型模式总结');
console.log('═══════════════════════════════════════════');
console.log('');
console.log('  本综合例子中用到了：');
console.log('  1. 单例：EditorConfig（全局配置）、DocumentManager（文档管理）');
console.log('  2. 原型：documentPrototypes（文档模板克隆）、克隆已有文档');
console.log('  3. 工厂：DocumentFactory（根据类型/模板创建文档）');
console.log('  4. 建造者：DocumentBuilder（链式构建复杂文档）');
console.log('');
console.log('  什么时候用哪种模式？');
console.log('  ──────────────────────────────────────');
console.log('  🔹 全局唯一 → 单例（最常用：直接 export 实例）');
console.log('  🔹 多种类型创建 → 工厂（简单场景用工厂函数）');
console.log('  🔹 多步骤/多参数构建 → 建造者（链式调用最直观）');
console.log('  🔹 模板/克隆 → 原型（Object.create 或展开运算符）');
console.log('');
console.log('  JS 中的简化原则：');
console.log('  - 模块导出天然单例，不用写 getInstance()');
console.log('  - 工厂函数比工厂类更简洁');
console.log('  - 配置对象+默认值在简单场景可替代建造者');
console.log('  - Object.create 是 JS 原生的原型模式');
console.log('  - 不要过度设计，简单场景直接 new/对象字面量');
console.log('');
console.log('  💡 核心：创建型模式的本质是"创建和使用分离"，');
console.log('     让创建逻辑集中管理、方便修改、易于扩展。');
console.log('');
`
  }
];
