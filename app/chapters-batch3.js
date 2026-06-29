// =============================================================
// Node.js 交互式教程 —— 第三批章节（异步编程组，共 6 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：回调与错误优先
  // =========================================================
  {
    id: "node-callbacks",
    group: "异步编程",
    icon: "📞",
    title: "回调与错误优先",
    content: `## 回调与错误优先

回调（Callback）是 Node.js 异步编程的**起点**。在 Promise 和 async/await 出现之前，所有异步操作都通过回调函数来传递结果。理解回调模式和 error-first 约定，是深入掌握 Node.js 异步编程的基础。

### 什么是回调函数？

回调函数是一个**作为参数传递给另一个函数，并在异步操作完成时被调用**的函数。Node.js 的 I/O 模型天然依赖回调——文件读写、网络请求、数据库查询，都是异步的。

\`\`\`javascript
// 回调函数作为参数传入
function doAsyncTask(callback) {
  setTimeout(() => {
    // 异步操作完成后调用回调
    callback("任务完成");
  }, 1000);
}

// 使用回调
doAsyncTask((result) => {
  console.log(result); // "任务完成"
});
\`\`\`

### Error-First 回调约定

Node.js 生态中最核心的约定是 **error-first callback**（错误优先回调）。所有 Node.js 核心模块的异步方法都遵循这个约定：

\`\`\`javascript
// 约定：回调的第一个参数是错误对象，第二个是结果
asyncFunction(arg1, arg2, (err, result) => {
  if (err) {
    // 处理错误
    console.error("操作失败:", err.message);
    return; // 必须 return，防止继续执行
  }
  // 处理结果
  console.log("操作成功:", result);
});
\`\`\`

#### Error-First 三条核心规则

1. **回调必须是最后一个参数**：方便识别和传递
2. **第一个参数是 Error 对象**：无错误时为 \`null\`
3. **有错误必须 return**：防止错误后继续执行后续代码

\`\`\`javascript
// 符合 error-first 约定的函数定义
function divide(a, b, callback) {
  if (b === 0) {
    // 第一个参数是错误
    callback(new Error("除数不能为 0"), null);
  } else {
    // 第一个参数是 null，表示无错误
    callback(null, a / b);
  }
}

divide(10, 2, (err, result) => {
  if (err) return console.error(err);
  console.log("10 / 2 =", result);
});
\`\`\`

### 回调地狱（Callback Hell）

当多个异步操作存在依赖关系时，回调会层层嵌套，形成所谓的"回调地狱"：

\`\`\`javascript
// ❌ 回调地狱：读取三个文件，依次处理
fs.readFile("a.txt", (err, dataA) => {
  if (err) return console.error(err);
  fs.readFile("b.txt", (err, dataB) => {
    if (err) return console.error(err);
    fs.readFile("c.txt", (err, dataC) => {
      if (err) return console.error(err);
      // 终于拿到所有数据了
      console.log(dataA, dataB, dataC);
    });
  });
});
// 代码向右缩进越来越深，难以阅读和维护！
\`\`\`

#### 回调地狱的五大危害

| 问题 | 描述 |
| --- | --- |
| 可读性差 | 代码向右无限缩进，逻辑难以追踪 |
| 错误处理冗长 | 每一层都要重复写 \`if (err) return\` |
| 无法正常 return | 回调中的 return 只退出回调，不退出外层函数 |
| 难以复用 | 逻辑绑定在嵌套结构中，无法单独提取 |
| 调试困难 | 异步调用栈不完整，难以定位问题 |

### 控制反转与信任问题

使用回调还有一个更深层次的问题：**控制反转**（Inversion of Control）。你把自己的代码交给第三方函数执行，你失去了控制权：

\`\`\`javascript
// 你把回调交给了 processPayment
processPayment(order, (err, result) => {
  // 这里面的代码，你无法控制：
  // - 被调用几次？（可能多次）
  // - 什么时候调用？（可能太早或太晚）
  // - 是否会被调用？（可能永远不会）
  if (err) {
    // 退款操作可能被调用多次！
    refund(order);
  }
});
\`\`\`

Promise 正是为了解决回调地狱和控制反转问题而诞生的。

### 解决回调地狱的策略

#### 1. 命名回调函数（减少嵌套）

\`\`\`javascript
function handleDataA(err, dataA) {
  if (err) return console.error(err);
  fs.readFile("b.txt", handleDataB);
}

function handleDataB(err, dataB) {
  if (err) return console.error(err);
  console.log(dataB);
}

fs.readFile("a.txt", handleDataA);
\`\`\`

#### 2. 用 util.promisify 转换 ⭐

\`\`\`javascript
const util = require("util");
const fs = require("fs");

// 将回调风格的函数转换为返回 Promise 的函数
const readFile = util.promisify(fs.readFile);

// 现在可以用 Promise 链或 async/await 了
readFile("a.txt")
  .then(data => readFile("b.txt"))
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

#### 3. 用 async/await（终极方案）

\`\`\`javascript
const readFile = util.promisify(fs.readFile);

async function readAll() {
  try {
    const a = await readFile("a.txt");
    const b = await readFile("b.txt");
    console.log(a, b);
  } catch (err) {
    console.error(err);
  }
}
readAll();
\`\`\`

### util.promisify 详解

\`util.promisify(fn)\` 是衔接回调时代和 Promise 时代的桥梁。它接收一个 error-first 回调风格的函数，返回一个返回 Promise 的函数。

#### promisify 的工作原理

\`\`\`javascript
// promisify 的简化实现
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
\`\`\`

#### promisify 的要求

被转换的函数必须满足：
1. 最后一个参数是回调函数
2. 回调遵循 error-first 约定：\`(err, result) => {}\`

#### 自定义 promisify 行为

如果回调有多个参数，可以通过 \`util.promisify.custom\` 自定义：

\`\`\`javascript
const fs = require("fs");
const util = require("util");

// fs.read 的回调有三个参数：err, bytesRead, buffer
fs.read[util.promisify.custom] = (fd, buffer, ...args) => {
  return new Promise((resolve, reject) => {
    fs.read(fd, buffer, ...args, (err, bytesRead, buffer) => {
      if (err) reject(err);
      else resolve({ bytesRead, buffer });
    });
  });
};
\`\`\`

### 回调模式在现代 Node.js 中的位置

虽然 async/await 是主流，回调仍然常见于：

- **事件监听器**：\`emitter.on("event", callback)\`
- **流处理**：\`stream.on("data", callback)\`
- **数组方法**：\`[1,2,3].forEach(callback)\`
- **旧版库**：很多 npm 包仍使用回调风格

理解回调模式和 error-first 约定，能帮你更好地理解 Node.js 的异步本质。

### 「底层原理」

回调的异步执行依赖 libuv 线程池和事件循环的协作。当你调用 \`fs.readFile\` 这样的异步 API 时，调用栈跨越了 JavaScript → C++ → libuv → 操作系统内核四层：

\`\`\`
  调用时序（fs.readFile 为例）:
  ─────────────────────────────────────────────
  JavaScript  │  fs.readFile(path, cb)
              │      ↓
  C++ Bindings│  node::fs::Read() → 提交请求
              │      ↓
  libuv       │  uv_fs_read() → 将请求放入
              │      │          线程池任务队列
              │      ↓
  Thread Pool │  工作线程执行阻塞 I/O
              │  (读取文件，不阻塞主线程)
              │      ↓
  I/O 完成    │  线程池通知主线程
              │  (uv_async_send)
              │      ↓
  poll 阶段   │  事件循环取出完成的请求
              │  将回调放入微任务/宏任务队列
              │      ↓
  JavaScript  │  回调函数被调用: cb(err, data)
  ─────────────────────────────────────────────
\`\`\`

**关键细节**：
1. **线程池默认大小**：libuv 线程池默认 4 个线程（可通过 \`UV_THREADPOOL_SIZE\` 调整，最大 1024）。文件 I/O、DNS 解析、zlib、crypto 等耗时操作都在这个线程池中执行。
2. **回调的调用栈**：回调执行时，外层函数早已返回，因此回调中的 \`return\` 只退出回调本身，无法影响外层函数。这也是 \`try/catch\` 无法捕获回调中异常的原因——当回调执行时，外层 \`try\` 块的调用栈帧已经弹出。
3. **error-first 约定的设计考量**：将 err 作为第一个参数，确保开发者**必须显式处理错误**——Node.js 不提供默认的错误吞掉机制。
4. **控制反转的本质**：回调将"何时调用"的控制权交给了第三方函数，Promise 通过状态不可逆性解决了这个信任问题。

### 「常见陷阱」

#### 陷阱 1：回调中忘记 return，导致错误后继续执行

\`\`\`javascript
// ❌ 错误：没有 return，错误后继续执行
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error("读取失败:", err);
    // 没有 return！下面的代码会继续执行
  }
  console.log("文件内容:", data); // err 时 data 为 undefined，可能崩溃
});

// ✅ 正确：错误后必须 return
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error("读取失败:", err);
    return; // 阻止后续执行
  }
  console.log("文件内容:", data);
});
\`\`\`

#### 陷阱 2：回调被调用多次（控制反转信任问题）

\`\`\`javascript
// ❌ 危险：第三方函数可能多次调用回调
function riskyPayment(callback) {
  // bug 或恶意代码可能导致回调被调用两次
  callback(null, { id: "pay123" });
  callback(null, { id: "pay123" }); // 重复调用！退款也会执行两次
}

let paid = false;
riskyPayment((err, result) => {
  if (err) return;
  // ❌ 没有防护：重复支付
  chargeCustomer();
});

// ✅ 正确：添加防护标志
let called = false;
riskyPayment((err, result) => {
  if (called) return; // 防止多次调用
  called = true;
  if (err) return;
  chargeCustomer();
});
\`\`\`

#### 陷阱 3：回调地狱导致无法正常 return 和 throw

\`\`\`javascript
// ❌ 回调中的 throw 无法被外层捕获
function readConfig(callback) {
  fs.readFile("config.json", (err, data) => {
    if (err) {
      throw err; // 这个 throw 只会在回调内部，无法被外层 try/catch 捕获！
      // 会触发 uncaughtException，可能导致进程崩溃
    }
    callback(null, JSON.parse(data));
  });
}

// ✅ 正确：错误通过 callback 传递
function readConfig(callback) {
  fs.readFile("config.json", (err, data) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(data));
    } catch (parseErr) {
      callback(parseErr); // JSON.parse 也可能出错
    }
  });
}
\`\`\`

#### 陷阱 4：回调中 this 指向丢失

\`\`\`javascript
// ❌ this 丢失
class Service {
  constructor() { this.name = "MyService"; }
  fetchData(callback) {
    fs.readFile("data.txt", function(err, data) {
      // 普通 function 中的 this 不是 Service 实例！
      console.log(this.name); // undefined
      callback(err, data);
    });
  }
}

// ✅ 正确：使用箭头函数或 bind
class Service {
  fetchData(callback) {
    fs.readFile("data.txt", (err, data) => {
      console.log(this.name); // "MyService"
      callback(err, data);
    });
  }
}
\`\`\`

#### 陷阱 5：回调永远不被调用

\`\`\`javascript
// ❌ 某些代码路径上 callback 没有被调用
function readIfExists(path, callback) {
  fs.access(path, fs.constants.F_OK, (err) => {
    if (err) {
      console.log("文件不存在");
      // 没有调用 callback！调用方永远等不到结果
    } else {
      fs.readFile(path, callback);
    }
  });
}

// ✅ 正确：确保所有路径都调用 callback
function readIfExists(path, callback) {
  fs.access(path, fs.constants.F_OK, (err) => {
    if (err) return callback(null, null); // 文件不存在时返回 null
    fs.readFile(path, callback);
  });
}
\`\`\`

### 「性能提示」

#### 1. 及时将回调转为 Promise，用 async/await 组织代码

\`\`\`javascript
// ❌ 嵌套回调：难以维护，性能调优困难
fs.readFile("a.txt", (err, a) => {
  fs.readFile("b.txt", (err, b) => {
    fs.readFile("c.txt", (err, c) => {
      // 串行读取，无法并行
    });
  });
});

// ✅ 使用 promisify + Promise.all 并发处理
const readFile = util.promisify(fs.readFile);
const [a, b, c] = await Promise.all([
  readFile("a.txt"),
  readFile("b.txt"),
  readFile("c.txt"),
]);
// 并发读取，耗时 = 最慢的一个
\`\`\`

#### 2. 避免在热路径中创建过多闭包回调

\`\`\`javascript
// ❌ 每次调用都创建新的闭包
function processFiles(files) {
  files.forEach(file => {
    fs.readFile(file, (err, data) => { // 每次创建新的回调闭包
      // 处理
    });
  });
}

// ✅ 复用处理函数（高并发场景更友好）
function handleFileResult(err, data) {
  if (err) return console.error(err);
  // 处理逻辑
}

function processFiles(files) {
  files.forEach(file => {
    fs.readFile(file, handleFileResult); // 复用同一个函数引用
  });
}
\`\`\`

#### 3. 使用 \`setImmediate\` 而非递归回调拆分大任务

\`\`\`javascript
// ❌ 同步递归回调：阻塞事件循环
function processArraySync(arr, index = 0) {
  if (index >= arr.length) return;
  processItem(arr[index]); // CPU 密集
  processArraySync(arr, index + 1); // 同步递归
}

// ✅ 使用 setImmediate 拆分，让出事件循环
async function processArrayAsync(arr, index = 0) {
  if (index >= arr.length) return;
  processItem(arr[index]);
  await new Promise(resolve => setImmediate(resolve)); // 让出事件循环
  await processArrayAsync(arr, index + 1);
}
\`\`\`

下面这段代码演示了回调模式、error-first 约定和 util.promisify 的完整实践。`,
    code: `// ============================================================
// 第一章代码演示：回调与错误优先
// ============================================================

// ---- 1. 基本回调函数 ----
console.log("===== 1. 基本回调函数 =====");
// 回调函数：作为参数传入，在异步操作完成时调用
function asyncTask(callback) {
  // 模拟异步操作（如读取文件、网络请求）
  setTimeout(function () {
    callback("异步操作完成");
  }, 10);
}

console.log("  开始异步任务...");
asyncTask(function (result) {
  console.log("  回调收到结果:", result);
});
console.log("  异步任务已发起（不会阻塞）");

// ---- 2. Error-First 回调约定 ----
console.log("\\n===== 2. Error-First 约定 =====");
// Node.js 核心约定：回调第一个参数是 error（无错误时为 null）
function divide(a, b, callback) {
  if (b === 0) {
    // 第一个参数是错误对象
    callback(new Error("除数不能为 0"), null);
  } else {
    // 第一个参数是 null，表示无错误
    callback(null, a / b);
  }
}

// 正常除法
divide(10, 2, function (err, result) {
  if (err) {
    console.error("  错误:", err.message);
    return;
  }
  console.log("  10 / 2 =", result);
});

// 除数为 0
divide(10, 0, function (err, result) {
  if (err) {
    console.error("  错误:", err.message);
    return;
  }
  console.log("  不会执行到这里");
});

// ---- 3. 回调地狱演示 ----
console.log("\\n===== 3. 回调地狱（层层嵌套）=====");
// 模拟一个 error-first 回调风格的异步文件读取函数
function fakeReadFile(filename, callback) {
  setTimeout(function () {
    if (filename === "error") {
      callback(new Error("文件不存在: " + filename), null);
    } else {
      callback(null, "[" + filename + " 的内容]");
    }
  }, 10);
}

// 回调地狱：三层嵌套才能拿到所有数据
fakeReadFile("file1", function (err, data1) {
  if (err) return console.error("  出错:", err.message);
  fakeReadFile("file2", function (err, data2) {
    if (err) return console.error("  出错:", err.message);
    fakeReadFile("file3", function (err, data3) {
      if (err) return console.error("  出错:", err.message);
      console.log("  回调地狱结果:", data1, "+", data2, "+", data3);
    });
  });
});

// ---- 4. 解决回调地狱：命名回调 ----
console.log("\\n===== 4. 命名回调减少嵌套 =====");
function handleStep1(err, result) {
  if (err) return console.error("  step1 出错:", err.message);
  console.log("  step1:", result);
  fakeReadFile("b", handleStep2);
}

function handleStep2(err, result) {
  if (err) return console.error("  step2 出错:", err.message);
  console.log("  step2:", result);
  fakeReadFile("c", handleStep3);
}

function handleStep3(err, result) {
  if (err) return console.error("  step3 出错:", err.message);
  console.log("  step3:", result);
  console.log("  命名回调结果：所有步骤完成");
}

fakeReadFile("a", handleStep1);

// ---- 5. util.promisify：回调转 Promise ⭐ ----
console.log("\\n===== 5. util.promisify 转换 =====");
var util = require("util");

// 将 error-first 回调风格的函数转为返回 Promise 的函数
var readFileAsync = util.promisify(fakeReadFile);

// 方式一：Promise 链式调用
readFileAsync("data1")
  .then(function (data) {
    console.log("  Promise 链: 读取 data1 →", data);
    return readFileAsync("data2");
  })
  .then(function (data) {
    console.log("  Promise 链: 读取 data2 →", data);
    return readFileAsync("data3");
  })
  .then(function (data) {
    console.log("  Promise 链: 读取 data3 →", data);
    console.log("  Promise 链: 全部完成（无嵌套）");
  })
  .catch(function (err) {
    console.error("  Promise 链: 出错:", err.message);
  });

// 方式二：async/await（推荐）
async function readFiles() {
  try {
    var d1 = await readFileAsync("d1");
    console.log("  async: 读取 d1 →", d1);
    var d2 = await readFileAsync("d2");
    console.log("  async: 读取 d2 →", d2);
    var d3 = await readFileAsync("d3");
    console.log("  async: 读取 d3 →", d3);
    console.log("  async: 全部完成（同步写法）");
  } catch (err) {
    console.error("  async: 出错:", err.message);
  }
}
readFiles();

// ---- 6. promisify + 实际 fs 模块 ----
console.log("\\n===== 6. promisify + fs 模块实战 =====");
var fs = require("fs");
var path = require("path");

// 将 fs.readFile 转为 Promise 版本
var readFilePromise = util.promisify(fs.readFile);

// 读取当前文件自身
async function readSelf() {
  try {
    var data = await readFilePromise(__filename, "utf8");
    // 只取前 50 个字符显示
    console.log("  当前文件前 50 个字符:", data.slice(0, 50));
    console.log("  当前文件总长度:", data.length, "字符");
  } catch (err) {
    console.error("  读取失败:", err.message);
  }
}
readSelf();

// ---- 7. promisify 实战：包装 setTimeout ----
console.log("\\n===== 7. promisify 包装 setTimeout =====");
// setTimeout 不遵循 error-first 约定，需要手动包装
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function demo() {
  var start = Date.now();
  console.log("  开始等待...");
  await sleep(30);
  console.log("  等待了", Date.now() - start, "ms");
}
demo();

// ---- 8. 控制反转问题演示 ----
console.log("\\n===== 8. 控制反转信任问题 =====");
// 回调的信任问题：你无法控制回调是否被调用、调用几次
function unreliableApi(callback) {
  // 模拟一个可能调用多次回调的不可靠 API
  setTimeout(function () {
    callback(null, "第一次");
    // 模拟 bug：不小心又调用了一次
    callback(null, "第二次（不应该调用）");
  }, 10);
}

var callCount = 0;
unreliableApi(function (err, result) {
  callCount++;
  if (err) return console.error("  错误:", err.message);
  console.log("  第 " + callCount + " 次回调:", result);
  if (callCount > 1) {
    console.log("  ⚠️ 回调被调用了多次！这是控制反转的信任问题");
    console.log("  Promise 可以解决这个问题（状态一旦确定就不会变）");
  }
});

// ---- 9. 自定义 promisify 行为 ----
console.log("\\n===== 9. 自定义 promisify 行为 =====");
// 如果回调有多个参数，可以通过 util.promisify.custom 自定义
function multiResult(name, callback) {
  setTimeout(function () {
    if (name === "error") {
      callback(new Error("出错了"), null, null);
    } else {
      // 回调有三个参数：err, result1, result2
      callback(null, "结果一", "结果二");
    }
  }, 10);
}

// 自定义 promisify 行为，让 Promise resolve 返回多个值
multiResult[util.promisify.custom] = function (name) {
  var self = this;
  return new Promise(function (resolve, reject) {
    multiResult(name, function (err, r1, r2) {
      if (err) reject(err);
      else resolve({ first: r1, second: r2 });
    });
  });
};

var multiAsync = util.promisify(multiResult);

multiAsync("test").then(function (result) {
  console.log("  自定义 promisify 结果:", JSON.stringify(result));
});

multiAsync("error").catch(function (err) {
  console.log("  自定义 promisify 错误:", err.message);
});

// ---- 10. 回调 vs Promise vs async/await 对比 ----
console.log("\\n===== 10. 三种方式对比总结 =====");
// 回调方式
fakeReadFile("对比", function (err, data) {
  if (err) return console.error("  回调方式出错:", err.message);
  console.log("  回调方式结果:", data);
});

// Promise 方式
readFileAsync("对比").then(function (data) {
  console.log("  Promise 方式结果:", data);
}).catch(function (err) {
  console.error("  Promise 方式出错:", err.message);
});

// async/await 方式（推荐）
(async function () {
  try {
    var data = await readFileAsync("对比");
    console.log("  async/await 方式结果:", data);
  } catch (err) {
    console.error("  async/await 方式出错:", err.message);
  }
})();

console.log("\\n===== 回调与错误优先演示结束 =====");
console.log("关键要点:");
console.log("  1. 回调遵循 error-first 约定: (err, result) => {}");
console.log("  2. 回调地狱用 util.promisify 或 async/await 解决");
console.log("  3. util.promisify 将 error-first 回调转为 Promise");
console.log("  4. 控制反转问题由 Promise 解决（状态不可变）");
console.log("  5. 现代代码推荐 async/await 写法");`,
  },

  // =========================================================
  // 第二章：Promise 深入
  // =========================================================
  {
    id: "node-promise",
    group: "异步编程",
    icon: "🤝",
    title: "Promise 深入",
    content: `## Promise 深入

Promise 是 JavaScript 异步编程的**基石**。它解决了回调地狱和控制反转问题，为 async/await 提供了底层支持。深入理解 Promise 的状态机制、链式调用和静态方法，是写出可靠异步代码的关键。

### Promise 的三种状态

Promise 是一个状态机，只有三种状态，且状态变化**不可逆**：

\`\`\`
  pending（等待中）———— 初始状态，结果未知
    |         |
    | resolve | reject
    ↓         ↓
  fulfilled（已成功）  rejected（已失败）
  
  状态一旦改变，就永远停留，不能再变
\`\`\`

\`\`\`javascript
const p = new Promise((resolve, reject) => {
  // executor 立即执行
  setTimeout(() => {
    resolve("成功"); // 状态: pending → fulfilled
    // 之后再调用 resolve 或 reject 都会被忽略
    reject("失败"); // 被忽略！状态已经确定
  }, 100);
});
\`\`\`

#### 状态的关键特性

1. **初始状态为 pending**
2. **只能从 pending 变为 fulfilled 或 rejected**
3. **一旦改变，不可逆**
4. **resolve 或 reject 只生效一次，后续调用被忽略**
5. **executor 函数立即同步执行**

### 创建 Promise

#### 基本创建

\`\`\`javascript
// 方式一：new Promise
const p1 = new Promise((resolve, reject) => {
  // 异步操作
  if (成功) resolve(result);
  else reject(error);
});

// 方式二：Promise.resolve（快速创建已成功的 Promise）
const p2 = Promise.resolve("立即成功");

// 方式三：Promise.reject（快速创建已失败的 Promise）
const p3 = Promise.reject(new Error("立即失败"));
\`\`\`

#### executor 的注意事项

\`\`\`javascript
// executor 中的同步错误会被自动捕获
const p = new Promise((resolve, reject) => {
  throw new Error("executor 中抛出的错误");
  // 等价于 reject(new Error("executor 中抛出的错误"))
});

p.catch(err => console.log(err.message)); // "executor 中抛出的错误"
\`\`\`

### then / catch / finally 链式调用

每个 \`.then()\` 都返回一个新的 Promise，形成链式调用：

\`\`\`javascript
Promise.resolve(1)
  .then(n => n + 1)        // 返回 2
  .then(n => n * 3)        // 返回 6
  .then(n => console.log(n)) // 输出 6
  .catch(err => console.error(err))
  .finally(() => console.log("完成")); // 无论如何都执行
\`\`\`

#### then 的返回值规则

\`.then()\` 回调的返回值决定下一个 Promise 的状态：

| 回调返回值 | 下一个 Promise 状态 |
| --- | --- |
| 返回普通值 | fulfilled，值为该值 |
| 返回 undefined | fulfilled，值为 undefined |
| 返回 Promise | 等待该 Promise 完成 |
| 抛出错误 | rejected，错误为抛出的值 |

\`\`\`javascript
Promise.resolve(1)
  .then(n => Promise.resolve(n + 1)) // 返回 Promise
  .then(n => n * 2)                  // 等上一个 Promise resolve
  .then(n => { throw new Error("错"); }) // 转为 rejected
  .catch(err => console.log(err.message)); // 捕获错误
\`\`\`

### Promise 链中的错误冒泡

Promise 链中的错误会**沿链向下传播**，直到遇到第一个 \`.catch()\`：

\`\`\`javascript
Promise.resolve()
  .then(() => { throw new Error("A 出错"); })
  .then(() => console.log("B 不会执行"))
  .then(() => console.log("C 不会执行"))
  .catch(err => console.log(err.message)); // "A 出错"

  // 错误跳过 B 和 C，直接到 catch
\`\`\`

#### catch 后的恢复

\`.catch()\` 处理完错误后，链可以继续：

\`\`\`javascript
Promise.reject("失败")
  .catch(err => {
    console.log("处理错误:", err);
    return "默认值"; // 返回默认值，链恢复
  })
  .then(result => {
    console.log("继续执行:", result); // "继续执行: 默认值"
  });
\`\`\`

### Promise 与微任务队列

Promise 的 \`.then()\`、\`.catch()\`、\`.finally()\` 回调被放入**微任务队列**（microtask queue），在当前同步代码执行完后、事件循环继续前执行：

\`\`\`javascript
console.log("1. 同步");

Promise.resolve().then(() => {
  console.log("3. 微任务 Promise");
});

console.log("2. 同步");

// 输出: 1 → 2 → 3
\`\`\`

微任务优先级：\`process.nextTick\` > \`Promise.then\` > 宏任务（setTimeout/setImmediate）

### Promise 静态方法详解

#### Promise.all([p1, p2, ...])

**全部成功才成功，一个失败立即失败**：

\`\`\`javascript
const [user, posts, friends] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchFriends(userId),
]);
// 三者并发执行，全部完成才返回
// 一个失败 → 整体失败，其他成功结果被丢弃！
\`\`\`

**关键特性**：
- 并发执行，结果顺序与输入顺序一致
- **快速失败**：一个 reject 立即导致整体 reject
- 适用于"全部都需要"的场景

#### Promise.allSettled([p1, p2, ...])

**等全部完成，不管成功失败**：

\`\`\`javascript
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"), // 这个可能失败
  fetch("/api/c"),
]);

results.forEach((r, i) => {
  if (r.status === "fulfilled") {
    console.log("任务", i, "成功:", r.value);
  } else {
    console.log("任务", i, "失败:", r.reason);
  }
});
// 每个结果都有 status 字段，失败的结果不会被丢弃
\`\`\`

**适用场景**：批量操作需要收集所有结果，不想因为部分失败而丢失成功数据。

#### Promise.race([p1, p2, ...])

**第一个完成的 Promise 决定结果**（无论成功或失败）：

\`\`\`javascript
// 经典用法：超时控制
const result = await Promise.race([
  fetch("/api/slow"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("超时")), 5000)
  ),
]);
\`\`\`

#### Promise.any([p1, p2, ...])

**第一个成功的决定结果，全部失败才失败**：

\`\`\`javascript
// 从多个镜像获取数据，哪个快用哪个
const data = await Promise.any([
  fetch("https://mirror1.com/data"),
  fetch("https://mirror2.com/data"),
  fetch("https://mirror3.com/data"),
]);
\`\`\`

#### all vs allSettled vs race vs any 对比

| 方法 | 成功条件 | 失败条件 | 结果 |
| --- | --- | --- | --- |
| \`all\` | 全部成功 | 任意一个失败 | 结果数组 |
| \`allSettled\` | 永远不失败 | 永远不失败 | 状态数组 |
| \`race\` | 第一个完成 | 第一个完成且失败 | 第一个结果 |
| \`any\` | 第一个成功 | 全部失败 | 第一个成功值 |

### Promise 的常见陷阱

#### 1. 忘记 return Promise

\`\`\`javascript
// ❌ 忘记 return，链会断裂
fetchUser(id).then(user => {
  fetchPosts(user.id); // 没有 return！下一个 then 拿到 undefined
}).then(posts => {
  console.log(posts); // undefined，不是帖子数据
});

// ✅ 正确：return Promise
fetchUser(id).then(user => {
  return fetchPosts(user.id);
}).then(posts => {
  console.log(posts); // 正确的帖子数据
});
\`\`\`

#### 2. Promise.all 快速失败丢失数据

\`\`\`javascript
// ❌ 一个失败，其他成功的结果全部丢失
await Promise.all([fetchA(), fetchB(), fetchC()]);

// ✅ 需要容错时用 allSettled
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
\`\`\`

#### 3. 在非 async 函数中用 await

\`\`\`javascript
// ❌ 语法错误：await 只能在 async 函数或模块顶层使用
function getData() {
  const data = await fetch("/api"); // SyntaxError
}

// ✅ 标记为 async
async function getData() {
  const data = await fetch("/api");
}
\`\`\`

### 「底层原理」

#### V8 引擎中的 Promise 实现

Promise 在 V8 中由 \`JSPromise\` 对象表示，内部维护三个核心字段：

\`\`\`
  JSPromise 内部结构（简化）:
  ┌─────────────────────────────────────────┐
  │  status: PromiseState (pending/0,       │
  │          fulfilled/1, rejected/2)       │
  │  result: 存储 resolve 的值或 reject 的   │
  │          原因                            │
  │  reactions: 链表，存储 .then/.catch 注册  │
  │             的回调（onFulfilled/onRejected）│
  └─────────────────────────────────────────┘
\`\`\`

**状态流转的 C++ 层实现**：
1. \`resolve(value)\` → V8 检查 status 是否为 pending，若是则设为 fulfilled 并将 reactions 链表中的回调加入微任务队列。
2. 一旦 status 非 pending，后续 \`resolve\`/\`reject\` 调用直接返回（保证不可逆性）。
3. 已 resolve 的 Promise 调用 \`.then()\` 时，回调会**立即**被包装成微任务入队，而不是等待。

#### 微任务队列的工作机制

\`\`\`
  微任务入队与执行时序:
  ──────────────────────────────────────────
  JS 调用栈   │ Promise.resolve(1).then(cb)
              │   → V8 创建 PromiseReaction
              │   → 将 cb 加入 MicrotaskQueue
              │ ... 同步代码执行完毕 ...
              │
  调用栈为空   │ V8 开始 Drain MicrotaskQueue
              │   → 取出 cb(1) 执行
              │   → 如果 cb 返回新的 Promise
              │     且有后续 .then，则新的回调
              │     继续加入微任务队列
              │   → 直到微任务队列清空
              │
  事件循环     │ 微任务清空后，才进入下一个
              │ 宏任务阶段
  ──────────────────────────────────────────
\`\`\`

**关键细节**：
- **微任务队列是 FIFO**：先入队的回调先执行。\`process.nextTick\` 有独立的队列，且总是在 Promise 微任务之前执行。
- **微任务中新增的微任务**：如果微任务回调中又注册了新的微任务（如 \`.then()\` 里又 return 了一个 Promise），这些新微任务也会在当前轮次中被清空——不会留给下一个宏任务。
- **Promise 链的内存模型**：每个 \`.then()\` 返回一个新的 \`JSPromise\`，它们通过 \`reaction\` 链表串联，形成一条链。链上任何一个节点 reject，后续的 onFulfilled 回调都会跳过，直到遇到 onRejected 回调（即 \`.catch()\`）。

#### Promise.all/race 的内部调度

\`Promise.all\` 内部维护一个计数器 \`remaining\`：
- 初始值 = 传入的 Promise 数量
- 每个子 Promise resolve 时，\`remaining--\`，并将结果存入对应位置的数组
- \`remaining === 0\` 时，整体 resolve
- 任意子 Promise reject 时，立即 reject（不取消其他 Promise，但忽略其结果）

\`Promise.race\` 则更简单：第一个 settle（resolve 或 reject）的子 Promise 决定结果，其他结果被忽略。

### 「常见陷阱」

#### 陷阱 1：未捕获的 Promise rejection 导致进程崩溃

\`\`\`javascript
// ❌ 未处理的 rejection（Node.js v15+ 会导致进程退出）
async function fetchData() {
  const data = await riskyApiCall(); // 如果 rejected，没有 catch
  return data;
}
fetchData(); // 没有 await，也没有 .catch()
// 触发 unhandledRejection → 进程崩溃

// ✅ 正确：始终有错误处理
async function fetchData() {
  try {
    return await riskyApiCall();
  } catch (err) {
    console.error("获取失败:", err);
    return null;
  }
}
// 或在调用处处理
fetchData().catch(err => console.error(err));
\`\`\`

#### 陷阱 2：Promise 构造器反模式（嵌套 Promise）

\`\`\`javascript
// ❌ 反模式：用 new Promise 包装已有的 Promise
function getUser(id) {
  return new Promise((resolve, reject) => {
    fetchUser(id) // 已经返回 Promise
      .then(user => resolve(user))
      .catch(err => reject(err)); // 多余的包装
    // 如果 fetchUser 抛同步异常，这里不会被捕获！
  });
}

// ✅ 正确：直接返回 Promise，链式调用
function getUser(id) {
  return fetchUser(id); // 直接返回
}
// 或者需要做额外处理时：
function getUser(id) {
  return fetchUser(id).then(user => ({ ...user, fetchedAt: Date.now() }));
}
\`\`\`

#### 陷阱 3：在 .then 中忘记 return

\`\`\`javascript
// ❌ 忘记 return，链断裂
fetchUser(1)
  .then(user => {
    fetchPosts(user.id); // 没有 return！
  })
  .then(posts => {
    console.log(posts); // undefined
  });

// ✅ 正确：return Promise
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts));
\`\`\`

#### 陷阱 4：Promise.all 快速失败导致资源泄漏

\`\`\`javascript
// ❌ 一个失败，其他请求已发出但结果被丢弃
const results = await Promise.all([
  fetch("/api/a"), // 成功，但结果被丢弃
  fetch("/api/b"), // 失败 → 整体 reject
  fetch("/api/c"), // 成功，但结果被丢弃
]);
// 如果这些请求有副作用（如占用连接、写入数据库），
// 它们仍在执行但结果被忽略，可能造成资源泄漏

// ✅ 容错场景用 allSettled
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c"),
]);
// 或者对单个 Promise 添加 .catch() 降级
const results = await Promise.all([
  fetch("/api/a").catch(e => ({ error: e })),
  fetch("/api/b").catch(e => ({ error: e })),
  fetch("/api/c").catch(e => ({ error: e })),
]);
\`\`\`

#### 陷阱 5：在 then 回调中同时使用 resolve 和 Promise 链返回

\`\`\`javascript
// ❌ 混用回调风格和 Promise 风格
function readConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile("config.json", (err, data) => {
      if (err) reject(err);
      resolve(data); // ❌ err 时没有 else，resolve 仍然会执行！
    });
  });
}

// ✅ 正确：错误时 return
function readConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile("config.json", (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}
\`\`\`

### 「性能提示」

#### 1. 使用 Promise.all 并发独立任务

\`\`\`javascript
// ❌ 串行：总耗时 = 所有时间之和
const user = await fetchUser();    // 200ms
const posts = await fetchPosts();  // 150ms
const friends = await fetchFriends(); // 100ms
// 总计: 450ms

// ✅ 并行：总耗时 = 最慢的那个
const [user, posts, friends] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchFriends(),
]);
// 总计: ~200ms
\`\`\`

#### 2. 避免不必要的 Promise 包装

\`\`\`javascript
// ❌ 多余包装：已经是 Promise 的值不需要再包 Promise.resolve()
async function getData() {
  return Promise.resolve(fetchFromCache()); // fetchFromCache 已返回 Promise
}

// ✅ 直接返回
async function getData() {
  return fetchFromCache(); // async 函数自动包装 Promise
}

// ❌ new Promise 包装同步函数
function compute(x, y) {
  return new Promise(resolve => {
    resolve(x + y); // 同步操作不需要 Promise
  });
}

// ✅ 同步函数直接返回，调用方可以 Promise.resolve() 包裹使用
function compute(x, y) {
  return x + y;
}
\`\`\`

#### 3. 长 Promise 链时考虑 async/await 可读性与调试

\`\`\`javascript
// ❌ 过长的 Promise 链难以调试，错误栈不清晰
fetchUser()
  .then(u => fetchPosts(u.id))
  .then(p => fetchComments(p[0].id))
  .then(c => fetchLikes(c[0].id))
  .then(l => console.log(l))
  .catch(err => console.error(err)); // 无法快速定位哪一步出错

// ✅ async/await 错误栈更清晰，易于断点调试
async function getFirstLike() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  const likes = await fetchLikes(comments[0].id);
  return likes;
}
// 出错时堆栈能准确定位到具体行号
\`\`\`

下面这段代码演示了 Promise 的所有核心用法。`,
    code: `// ============================================================
// 第二章代码演示：Promise 深入
// ============================================================

// ---- 1. Promise 创建与状态 ----
console.log("===== 1. Promise 创建与状态 =====");

// 创建 Promise：executor 立即同步执行
var p = new Promise(function (resolve, reject) {
  console.log("  executor 立即执行（同步）");
  // 模拟异步操作
  setTimeout(function () {
    resolve("成功结果");
    // 状态已确定，后续的 resolve/reject 都会被忽略
    reject("这个 reject 会被忽略");
  }, 20);
});

console.log("  Promise 创建完成，状态: pending");

p.then(function (value) {
  console.log("  then 回调:", value);
}).catch(function (err) {
  console.log("  catch 回调:", err);
});

// Promise.resolve 快速创建已成功的 Promise
var resolved = Promise.resolve("立即可用");
resolved.then(function (v) {
  console.log("  Promise.resolve 结果:", v);
});

// Promise.reject 快速创建已失败的 Promise
var rejected = Promise.reject(new Error("立即失败"));
rejected.catch(function (err) {
  console.log("  Promise.reject 错误:", err.message);
});

// ---- 2. then/catch/finally 链式调用 ----
console.log("\\n===== 2. then/catch/finally 链式调用 =====");

// 每个 then 返回新 Promise，形成链式调用
Promise.resolve(1)
  .then(function (n) {
    console.log("  then 1: 收到", n, "→ 返回", n + 1);
    return n + 1;
  })
  .then(function (n) {
    console.log("  then 2: 收到", n, "→ 返回", n * 3);
    return n * 3;
  })
  .then(function (n) {
    console.log("  then 3: 收到", n, "→ 最终结果");
    return n;
  })
  .catch(function (err) {
    console.log("  catch:", err.message);
  })
  .finally(function () {
    console.log("  finally: 无论如何都会执行");
  });

// ---- 3. then 返回值规则 ----
console.log("\\n===== 3. then 返回值规则 =====");

// 返回普通值
Promise.resolve(1)
  .then(function (n) {
    return n + 10; // 返回普通值，下一个 then 收到 11
  })
  .then(function (n) {
    console.log("  返回普通值:", n);
  });

// 返回 Promise
Promise.resolve(1)
  .then(function (n) {
    // 返回 Promise，下一个 then 会等它完成
    return Promise.resolve(n + 100);
  })
  .then(function (n) {
    console.log("  返回 Promise:", n);
  });

// 抛出错误
Promise.resolve(1)
  .then(function (n) {
    throw new Error("手动抛出错误");
  })
  .then(function (n) {
    console.log("  不会执行");
  })
  .catch(function (err) {
    console.log("  抛出错误 → catch:", err.message);
  });

// ---- 4. 错误冒泡与 catch 恢复 ----
console.log("\\n===== 4. 错误冒泡与 catch 恢复 =====");

Promise.resolve()
  .then(function () {
    console.log("  步骤 1: 正常");
    throw new Error("步骤 2 出错");
  })
  .then(function () {
    console.log("  步骤 2: 不会执行（错误冒泡跳过）");
  })
  .then(function () {
    console.log("  步骤 3: 也不会执行");
  })
  .catch(function (err) {
    console.log("  catch 捕获:", err.message);
    return "恢复值"; // catch 返回的值可以恢复链
  })
  .then(function (result) {
    console.log("  catch 后继续:", result);
  });

// ---- 5. Promise.all 并发执行 ----
console.log("\\n===== 5. Promise.all 并发 =====");

// 模拟异步任务
function asyncTask(name, delay, shouldFail) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shouldFail) {
        reject(new Error(name + " 失败"));
      } else {
        resolve(name + " 完成");
      }
    }, delay);
  });
}

// Promise.all：全部成功才成功，结果顺序与输入一致
console.log("  Promise.all 并发执行 3 个任务...");
var startAll = Date.now();
Promise.all([
  asyncTask("任务A", 30, false),
  asyncTask("任务B", 20, false),
  asyncTask("任务C", 10, false),
]).then(function (results) {
  console.log("  Promise.all 结果:", results);
  console.log("  Promise.all 耗时:", Date.now() - startAll, "ms");
  console.log("  （并发执行，耗时 ≈ 最慢的一个，不是三个之和）");
});

// Promise.all 快速失败
console.log("\\n  Promise.all 快速失败演示...");
Promise.all([
  asyncTask("任务X", 30, false),
  asyncTask("任务Y", 10, true), // 这个会失败
  asyncTask("任务Z", 20, false),
]).then(function (results) {
  console.log("  不会执行");
}).catch(function (err) {
  console.log("  Promise.all 快速失败:", err.message);
  console.log("  （一个失败，整体立即失败，其他结果丢失）");
});

// ---- 6. Promise.allSettled 容错 ----
console.log("\\n===== 6. Promise.allSettled 容错 =====");

// allSettled：等全部完成，不管成功失败，收集所有结果
Promise.allSettled([
  asyncTask("任务1", 30, false),
  asyncTask("任务2", 10, true),  // 这个会失败
  asyncTask("任务3", 20, false),
]).then(function (results) {
  console.log("  allSettled 结果:");
  results.forEach(function (r, i) {
    if (r.status === "fulfilled") {
      console.log("    任务" + (i + 1) + ": ✓ 成功 →", r.value);
    } else {
      console.log("    任务" + (i + 1) + ": ✗ 失败 →", r.reason.message);
    }
  });
  console.log("  （即使有任务失败，其他结果也保留）");
});

// ---- 7. Promise.race 超时控制 ----
console.log("\\n===== 7. Promise.race 超时控制 =====");

// 用 race 实现超时功能
function withTimeout(promise, ms) {
  var timeout = new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error("操作超时（" + ms + "ms）"));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

// 正常完成（不超时）
withTimeout(asyncTask("快速任务", 30, false), 50)
  .then(function (r) { console.log("  未超时:", r); })
  .catch(function (e) { console.log("  超时:", e.message); });

// 超时情况
withTimeout(asyncTask("慢速任务", 100, false), 30)
  .then(function (r) { console.log("  不会执行"); })
  .catch(function (e) { console.log("  超时捕获:", e.message); });

// ---- 8. Promise.any 竞速 ----
console.log("\\n===== 8. Promise.any 竞速 =====");

// Promise.any：第一个成功的决定结果，全部失败才失败
Promise.any([
  asyncTask("镜像1", 30, true),  // 失败
  asyncTask("镜像2", 20, true),  // 失败
  asyncTask("镜像3", 10, false), // 成功
  asyncTask("镜像4", 5, false),  // 更快但不一定拿到（因为 any 拿到第一个成功就返回）
]).then(function (result) {
  console.log("  Promise.any 第一个成功:", result);
}).catch(function (err) {
  console.log("  Promise.any 全部失败:", err);
});

// ---- 9. Promise 与微任务队列 ----
console.log("\\n===== 9. Promise 与微任务队列 =====");

console.log("  [1] 同步代码开始");

// nextTick 优先级最高
process.nextTick(function () {
  console.log("  [3] process.nextTick");
});

// Promise.then 是微任务，在 nextTick 之后
Promise.resolve().then(function () {
  console.log("  [4] Promise.then 1");
});

Promise.resolve().then(function () {
  console.log("  [5] Promise.then 2");
});

// setTimeout 是宏任务，在微任务之后
setTimeout(function () {
  console.log("  [6] setTimeout (宏任务)");
}, 0);

console.log("  [2] 同步代码结束");
// 输出顺序: 1 → 2 → 3 → 4 → 5 → 6

// ---- 10. 常见陷阱：忘记 return ----
console.log("\\n===== 10. 常见陷阱：忘记 return =====");

// 模拟异步函数
function getUser(id) {
  return Promise.resolve({ id: id, name: "用户" + id });
}

function getPosts(userId) {
  return Promise.resolve(["帖子A", "帖子B"]);
}

// ❌ 忘记 return，下一个 then 拿到 undefined
getUser(1).then(function (user) {
  getPosts(user.id); // 没有 return！
}).then(function (posts) {
  console.log("  忘记 return 的结果:", posts, "(undefined!)");
});

// ✅ 正确 return
getUser(1).then(function (user) {
  return getPosts(user.id); // 正确 return
}).then(function (posts) {
  console.log("  正确 return 的结果:", posts);
});

// ---- 11. 综合实战：批量请求 ----
console.log("\\n===== 11. 综合实战：批量请求处理 =====");

// 模拟 5 个请求，部分可能失败
var requests = [
  asyncTask("请求1", 10, false),
  asyncTask("请求2", 20, true),  // 失败
  asyncTask("请求3", 15, false),
  asyncTask("请求4", 25, false),
  asyncTask("请求5", 5, true),   // 失败
];

// 用 allSettled 处理所有结果
Promise.allSettled(requests).then(function (results) {
  var success = results.filter(function (r) { return r.status === "fulfilled"; });
  var failed = results.filter(function (r) { return r.status === "rejected"; });
  console.log("  批量请求结果:");
  console.log("    成功:", success.length, "个");
  success.forEach(function (r) { console.log("      ✓", r.value); });
  console.log("    失败:", failed.length, "个");
  failed.forEach(function (r) { console.log("      ✗", r.reason.message); });
});

console.log("\\n===== Promise 深入演示结束 =====");
console.log("关键要点:");
console.log("  1. Promise 状态不可逆，一旦确定就不可改变");
console.log("  2. then 返回新 Promise，形成链式调用");
console.log("  3. 错误沿链冒泡，到第一个 catch 为止");
console.log("  4. all 快速失败，allSettled 容错收集");
console.log("  5. race 用于超时，any 用于取第一个成功");
console.log("  6. 永远不要忘记在 then 中 return Promise");`,
  },

  // =========================================================
  // 第三章：Async/Await 实战
  // =========================================================
  {
    id: "node-async-await",
    group: "异步编程",
    icon: "⏳",
    title: "Async/Await 实战",
    content: `## Async/Await 实战

\`async/await\` 是 JavaScript 异步编程的**终极方案**。它建立在 Promise 之上，让异步代码看起来和同步代码一样直观。自 ES2017 引入以来，它已成为现代 Node.js 开发的主流写法。

### async 函数基础

\`async\` 关键字标记一个函数为异步函数。async 函数**总是返回 Promise**：

\`\`\`javascript
// async 函数声明
async function fetchData() {
  return "数据"; // 自动包装为 Promise.resolve("数据")
}

// 等价于
function fetchData() {
  return Promise.resolve("数据");
}

// async 函数返回的 Promise
fetchData().then(data => console.log(data)); // "数据"
\`\`\`

#### async 函数的返回值规则

| 返回值类型 | 实际返回 |
| --- | --- |
| 普通值 | \`Promise.resolve(value)\` |
| \`undefined\` | \`Promise.resolve(undefined)\` |
| Promise | 直接返回该 Promise |
| 抛出错误 | \`Promise.reject(error)\` |

### await 表达式

\`await\` 只能在 async 函数内部使用（或模块顶层）。它**暂停** async 函数的执行，等待 Promise 完成：

\`\`\`javascript
async function getUser() {
  // await 等待 Promise resolve，直接获取结果
  const user = await fetchUser(123);
  // 上一行完成后，才会执行下一行
  const posts = await fetchPosts(user.id);
  return { user, posts };
}
\`\`\`

#### await 的本质

\`\`\`javascript
// 以下两段代码等价：

// async/await 写法
const result = await somePromise;
console.log(result);

// Promise 写法
somePromise.then(result => {
  console.log(result);
});
\`\`\`

\`await\` 让异步代码的写法回归同步风格，但**不阻塞事件循环**——它只暂停当前 async 函数，不影响其他代码执行。

### 错误处理：try/catch

async/await 的最大优势之一是可以用 \`try/catch\` 处理异步错误：

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    // 捕获所有 await 表达式的错误
    console.error("请求失败:", error.message);
    return null; // 返回默认值
  }
}
\`\`\`

#### 细粒度错误处理

\`\`\`javascript
async function processData() {
  let user, posts;

  try {
    user = await fetchUser(userId);
  } catch (err) {
    console.error("获取用户失败:", err.message);
    return; // 用户都获取不到，停止处理
  }

  try {
    posts = await fetchPosts(user.id);
  } catch (err) {
    console.error("获取帖子失败:", err.message);
    posts = []; // 帖子获取失败不影响，用空数组代替
  }

  return { user, posts };
}
\`\`\`

### 串行执行 vs 并行执行

这是 async/await 中最容易被忽视的性能陷阱：

#### 串行执行（一个接一个）

\`\`\`javascript
// ❌ 串行：总耗时 = 三个请求之和
const user = await fetchUser(1);    // 200ms
const posts = await fetchPosts(1);  // 150ms
const friends = await fetchFriends(1); // 100ms
// 总耗时: 450ms
\`\`\`

#### 并行执行（同时发起）

\`\`\`javascript
// ✅ 并行：总耗时 = 最慢的一个
const [user, posts, friends] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchFriends(1),
]);
// 总耗时: 200ms（最慢的那个）
\`\`\`

#### 判断是否需要串行

**关键问题**：下一个请求是否依赖上一个请求的结果？

| 场景 | 策略 | 示例 |
| --- | --- | --- |
| 无依赖关系 | \`Promise.all\` 并行 | 同时获取 A、B、C 三个 API |
| 有依赖关系 | 串行 await | 先获取用户 ID，再获取用户详情 |
| 部分依赖 | 混合策略 | 先获取用户，再并行获取帖子和好友 |

#### 混合策略示例

\`\`\`javascript
async function loadUserPage(userId) {
  // 第一步：获取用户信息（必须最先完成）
  const user = await fetchUser(userId);

  // 第二步：基于用户信息，并行获取帖子和好友
  const [posts, friends] = await Promise.all([
    fetchPosts(user.id),
    fetchFriends(user.id),
  ]);

  return { user, posts, friends };
}
\`\`\`

### for-await-of 循环

\`for-await-of\` 用于遍历异步可迭代对象（Async Iterable），如 Readable Stream：

\`\`\`javascript
// 逐行读取文件（Node.js 18+）
const readable = fs.createReadStream("large.log");

for await (const chunk of readable) {
  console.log("读取到:", chunk.length, "字节");
}
\`\`\`

#### 与 for...of 的区别

\`\`\`javascript
// 同步遍历：遍历同步可迭代对象
for (const item of [1, 2, 3]) {
  console.log(item); // 同步执行
}

// 异步遍历：遍历异步可迭代对象（每个元素是 Promise）
for await (const item of asyncIterable) {
  console.log(item); // 每次 await 一个元素
}
\`\`\`

### 顶层 await

在 ES Modules 中，可以在模块顶层直接使用 \`await\`（无需 async 函数包裹）：

\`\`\`javascript
// config.mjs (ESM 模块)
import { readFile } from "fs/promises";

// 顶层 await：模块加载时会等待
const config = JSON.parse(
  await readFile("./config.json", "utf8")
);

export { config };
// 其他模块 import 这个文件时会等待 config 读取完成
\`\`\`

> CommonJS（\`.js\` + \`require\`）不支持顶层 await。需要用 async IIFE 包裹。

### 常见陷阱

#### 1. forEach 中 await 不生效

\`\`\`javascript
// ❌ forEach 不会等待 async 回调
[1, 2, 3].forEach(async (n) => {
  await delay(1000);
  console.log(n);
});
console.log("完成"); // 会立即输出！

// ✅ 用 for...of
for (const n of [1, 2, 3]) {
  await delay(1000);
  console.log(n);
}

// ✅ 或用 Promise.all + map（并行）
await Promise.all([1, 2, 3].map(n => delay(1000)));
\`\`\`

#### 2. 忘记 await

\`\`\`javascript
// ❌ 忘记 await，拿到的是 Promise 对象
const data = fetchData(); // data 是 Promise，不是数据
console.log(data); // Promise { <pending> }

// ✅ 加上 await
const data = await fetchData(); // data 是实际数据
\`\`\`

#### 3. 不必要的串行

\`\`\`javascript
// ❌ 三个没有依赖关系的请求却串行执行
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// ✅ 用 Promise.all 并行
const [a, b, c] = await Promise.all([
  fetchA(), fetchB(), fetchC()
]);
\`\`\`

### 「底层原理」

#### async/await 是 Promise + Generator 的语法糖

async/await 并非全新的异步机制，而是建立在 Promise 和 Generator（生成器）之上的语法糖。V8 引擎在编译 async 函数时，本质上做了以下转换：

\`\`\`javascript
// 你写的 async/await 代码
async function getUserData(id) {
  const user = await fetchUser(id);
  const posts = await fetchPosts(user.id);
  return { user, posts };
}

// V8 编译后的等价逻辑（概念模型，非真实输出）
function getUserData(id) {
  // 本质上是一个基于 Promise 的状态机
  return new Promise((resolve, reject) => {
    let step = 0;
    function next(value) {
      try {
        switch (step) {
          case 0:
            step = 1;
            fetchUser(id).then(next, reject);
            return;
          case 1:
            step = 2;
            const user = value;
            fetchPosts(user.id).then(next, reject);
            return;
          case 2:
            const posts = value;
            resolve({ user, posts });
        }
      } catch (err) {
        reject(err);
      }
    }
    next();
  });
}
\`\`\`

#### 函数暂停与恢复：生成器的内部机制

\`await\` 之所以能"暂停"函数，底层依赖 V8 的**暂停点（Suspend Point）**机制：

\`\`\`
  async 函数执行状态机:
  ┌──────────────────────────────────────────┐
  │                                          │
  │  1. 函数开始执行，直到第一个 await       │
  │     ┌───────┐                           │
  │     │ 运行态 │ → 遇到 await              │
  │     └───────┘      │                     │
  │          ↑         ↓                     │
  │          │    ┌──────────┐               │
  │          │    │ 暂停/挂起 │               │
  │          │    │ 保存上下文│               │
  │          │    │ (栈帧/变量│               │
  │          │    │  位置)    │               │
  │          │    └──────────┘               │
  │          │         │                     │
  │          │         ↓ Promise resolve     │
  │          │    ┌──────────┐               │
  │     ┌───────┐│ 恢复执行  │               │
  │     │ 运行态 ││ 还原上下文│               │
  │     └───────┘│ 继续到下一个│              │
  │          │   │ await 或 return│           │
  │          ↓   └──────────┘               │
  │     重复或结束                           │
  └──────────────────────────────────────────┘
\`\`\`

**关键细节**：
1. **栈帧保存**：await 暂停时，V8 将当前函数的局部变量、执行位置（PC 指针）等上下文保存到堆上（而非栈上），以便后续恢复。这就是为什么 async 函数的"调用栈"在调试时看起来完整——V8 做了特殊的栈追踪处理。
2. **微任务调度**：Promise resolve 时，恢复函数执行的回调被放入微任务队列，与普通 \`.then()\` 回调享有相同的调度优先级。
3. **同步抛错**：async 函数体内的同步 \`throw\` 会被 V8 自动包装为 \`Promise.reject()\`，不需要手动包装。
4. **返回值自动包装**：\`return value\` 等价于 \`return Promise.resolve(value)\`——即使你返回的是一个普通值。

#### await 的"非阻塞"本质

\`await\` **不会阻塞事件循环**，它只暂停当前 async 函数的执行。当函数被挂起时，事件循环继续处理其他任务：

\`\`\`javascript
console.log("A");
async function demo() {
  console.log("B");
  await Promise.resolve();
  console.log("D"); // 微任务，在同步代码后执行
}
demo();
console.log("C");
// 输出: A → B → C → D
// 注意: await 后的 D 是在微任务中执行，不是同步
\`\`\`

### 「常见陷阱」

#### 陷阱 1：forEach/map/filter 中 await 不生效

\`\`\`javascript
// ❌ forEach 不等待 async 回调
async function processItems(items) {
  items.forEach(async (item) => {
    await processItem(item);
    console.log("处理完成:", item);
  });
  console.log("全部完成"); // 会立即输出！forEach 不等待
}

// ✅ 正确串行：用 for...of
async function processItems(items) {
  for (const item of items) {
    await processItem(item);
    console.log("处理完成:", item);
  }
  console.log("全部完成");
}

// ✅ 正确并行：用 Promise.all + map
async function processItems(items) {
  await Promise.all(items.map(item => processItem(item)));
  console.log("全部完成");
}
\`\`\`

#### 陷阱 2：await 后续代码被推迟到微任务，即使 Promise 已 resolve

\`\`\`javascript
// ❌ 误以为 await 已 resolve 的 Promise 是同步执行
let value = 0;
async function demo() {
  value = 1;
  await Promise.resolve(); // 即使立即 resolve
  value = 2; // 这行也是微任务，不是同步
}
demo();
console.log(value); // 1，不是 2！因为 await 后的代码是微任务

// ✅ 如果你确实需要同步获取已完成的值，不需要 await
function getValue() {
  const cached = cache.get(key);
  if (cached) return cached; // 直接返回，不需要 await
  return fetchFromDB(key);
}
\`\`\`

#### 陷阱 3：try/catch 只能捕获 await 的错误，漏掉非 await 的 Promise

\`\`\`javascript
// ❌ 漏包错误
async function fetchData() {
  try {
    const promise = riskyOp(); // Promise 可能立即 reject
    // 在 await 之前如果 promise 是 rejected 且是同步创建的...
    // 实际上这不会有问题，因为 await 会处理
    // 但以下情况会出问题：
    const p1 = fetchA(); // 发起请求
    const p2 = fetchB(); // 这两个都是"悬空"Promise
    await p1;
    await p2; // 如果 p2 在 p1 await 期间就已经 reject 了，会怎样？
  } catch (err) {
    // p2 如果在 await p1 期间 reject，可能触发 unhandledRejection
  }
}

// ✅ 正确：用 Promise.all 统一捕获
async function fetchData() {
  try {
    const [a, b] = await Promise.all([fetchA(), fetchB()]);
    return { a, b };
  } catch (err) {
    console.error("获取失败:", err);
    return null;
  }
}
\`\`\`

#### 陷阱 4：async 函数总是返回 Promise，忘记 await 得到 Promise 对象

\`\`\`javascript
// ❌ 忘记 await
async function getUserName() {
  return "Alice";
}
const name = getUserName();
console.log(name); // Promise { "Alice" }，不是字符串
console.log(name.toUpperCase()); // TypeError: name.toUpperCase is not a function

// ✅ 记住 await
const name = await getUserName();
console.log(name.toUpperCase()); // "ALICE"
\`\`\`

#### 陷阱 5：在循环中错误使用 await 导致串行化

\`\`\`javascript
// ❌ map 中 async 回调返回 Promise 数组，但没有 await 结果
const results = items.map(async (item) => {
  return await fetchItem(item);
});
// results 是 Promise 数组，不是数据数组
console.log(results[0].id); // undefined!

// ✅ 正确：用 Promise.all 等待全部完成
const results = await Promise.all(
  items.map(item => fetchItem(item))
);
\`\`\`

### 「性能提示」

#### 1. 识别独立任务，使用 Promise.all 并行

\`\`\`javascript
// ❌ 串行 await：总耗时累加
async function loadPage(id) {
  const user = await fetchUser(id);     // 200ms
  const posts = await fetchPosts(id);    // 150ms
  const comments = await fetchComments(id); // 100ms
  return { user, posts, comments };
  // 总计: ~450ms
}

// ✅ 并行 Promise.all：总耗时 = 最慢的一个
async function loadPage(id) {
  const [user, posts, comments] = await Promise.all([
    fetchUser(id),
    fetchPosts(id),
    fetchComments(id),
  ]);
  return { user, posts, comments };
  // 总计: ~200ms
}
\`\`\`

#### 2. 避免不必要的 await（减少微任务开销）

\`\`\`javascript
// ❌ 不必要的 await：增加微任务切换开销
async function process(data) {
  const result = await validate(data); // 如果 validate 同步返回，不需要 async
  return await transform(result); // await 返回值是多余的
}

// ✅ 直接返回 Promise，省去额外的微任务
async function process(data) {
  validateSync(data); // 如果是同步验证，直接调用
  return transform(data); // 直接返回 Promise，不需要 await
}

// ❌ async IIFE 中不必要的包装
(async () => {
  const data = await fetchData();
  console.log(data);
})();

// 如果顶层 await 可用（ESM），直接写：
// const data = await fetchData();
// console.log(data);
\`\`\`

#### 3. 使用 Promise.allSettled 避免全失败，并实现背压

\`\`\`javascript
// ✅ 批量操作时考虑背压（避免同时发起过多请求）
async function batchFetch(urls, concurrency = 5) {
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(url => fetch(url))
    );
    results.push(...batchResults);
    // 每批之间可以做限流等待
    if (i + concurrency < urls.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  return results;
}
\`\`\`

下面这段代码演示了 async/await 的各种模式和最佳实践。`,
    code: `// ============================================================
// 第三章代码演示：Async/Await 实战
// ============================================================

// 模拟异步 API 调用
function apiCall(name, delay, shouldFail) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shouldFail) {
        reject(new Error(name + " 请求失败"));
      } else {
        resolve(name + " 数据 (耗时" + delay + "ms)");
      }
    }, delay);
  });
}

// ---- 1. async 函数基础 ----
console.log("===== 1. async 函数基础 =====");

// async 函数总是返回 Promise
async function greet(name) {
  return "你好, " + name + "!";
}

// 等价于
function greetSync(name) {
  return Promise.resolve("你好, " + name + "!");
}

greet("张三").then(function (msg) {
  console.log("  async 函数返回:", msg);
});

// 验证返回类型
var result = greet("李四");
console.log("  返回值类型:", result instanceof Promise);

// async 函数中抛出错误 → 返回 rejected Promise
async function fail() {
  throw new Error("async 函数中的错误");
}

fail().catch(function (err) {
  console.log("  async 函数错误:", err.message);
});

// ---- 2. await 表达式 ----
console.log("\\n===== 2. await 表达式 =====");

async function demoAwait() {
  console.log("  开始执行");

  // await 等待 Promise 完成，直接获取结果
  var data1 = await apiCall("用户", 20, false);
  console.log("  获取到:", data1);

  var data2 = await apiCall("帖子", 10, false);
  console.log("  获取到:", data2);

  console.log("  demoAwait 完成");
  return data1 + " + " + data2;
}

demoAwait().then(function (result) {
  console.log("  最终结果:", result);
});

// ---- 3. async/await 错误处理 try/catch ----
console.log("\\n===== 3. try/catch 错误处理 =====");

async function fetchWithErrorHandling() {
  try {
    console.log("  尝试请求...");
    var data = await apiCall("不稳定服务", 10, true); // 会失败
    console.log("  不会执行:", data);
  } catch (err) {
    console.log("  try/catch 捕获:", err.message);
    return "默认值"; // 返回默认值恢复
  }
}

fetchWithErrorHandling().then(function (result) {
  console.log("  错误处理后返回:", result);
});

// 细粒度错误处理：不同的 await 可以有不同的 catch
async function fineGrainedError() {
  var user, posts;

  try {
    user = await apiCall("用户服务", 10, false);
    console.log("  用户获取成功:", user);
  } catch (err) {
    console.log("  用户获取失败:", err.message);
    return; // 用户都获取不到，提前返回
  }

  try {
    posts = await apiCall("帖子服务", 10, true); // 失败
    console.log("  帖子获取成功:", posts);
  } catch (err) {
    console.log("  帖子获取失败:", err.message);
    posts = []; // 帖子失败不影响，用空数组代替
  }

  return { user: user, posts: posts };
}

fineGrainedError().then(function (result) {
  console.log("  细粒度错误处理结果:", result);
});

// ---- 4. 串行执行 vs 并行执行 ----
console.log("\\n===== 4. 串行执行 vs 并行执行 =====");

// 串行执行：一个接一个
async function serialExecution() {
  var start = Date.now();
  var a = await apiCall("A", 30, false);
  var b = await apiCall("B", 30, false);
  var c = await apiCall("C", 30, false);
  var elapsed = Date.now() - start;
  console.log("  串行结果:", [a, b, c]);
  console.log("  串行耗时:", elapsed + "ms (≈ 90ms，三个累加)");
}

// 并行执行：同时发起
async function parallelExecution() {
  var start = Date.now();
  var results = await Promise.all([
    apiCall("A", 30, false),
    apiCall("B", 30, false),
    apiCall("C", 30, false),
  ]);
  var elapsed = Date.now() - start;
  console.log("  并行结果:", results);
  console.log("  并行耗时:", elapsed + "ms (≈ 30ms，最慢的一个)");
}

serialExecution().then(function () {
  return parallelExecution();
});

// 混合策略：先串行获取依赖，再并行获取无依赖数据
async function hybridStrategy() {
  var start = Date.now();

  // 第一步：获取用户（必须最先完成，后面依赖它）
  var user = await apiCall("用户信息", 20, false);
  console.log("  [混合] 第一步（串行）:", user);

  // 第二步：基于用户 ID，并行获取帖子和好友
  var results = await Promise.all([
    apiCall("用户帖子", 30, false),
    apiCall("用户好友", 30, false),
  ]);
  console.log("  [混合] 第二步（并行）:", results);

  console.log("  混合策略耗时:", Date.now() - start + "ms (≈ 20 + 30)");
}

hybridStrategy();

// ---- 5. for-await-of 循环 ----
console.log("\\n===== 5. for-await-of 循环 =====");

// 创建异步生成器（模拟流式数据）
async function* asyncGenerator() {
  for (var i = 1; i <= 3; i++) {
    await new Promise(function (r) { setTimeout(r, 10); });
    yield "数据块 " + i;
  }
}

async function consumeAsyncIterable() {
  console.log("  开始消费异步可迭代对象...");
  var index = 0;
  for await (var chunk of asyncGenerator()) {
    index++;
    console.log("  [" + index + "] 收到:", chunk);
  }
  console.log("  for-await-of 循环完成");
}

consumeAsyncIterable();

// ---- 6. 顶层 await 说明 ----
console.log("\\n===== 6. 顶层 await 说明 =====");
console.log("  在 ES Modules (.mjs) 中可以直接在模块顶层用 await:");
console.log("    // config.mjs");
console.log("    const config = await fetch('/api/config');");
console.log("    export { config };");
console.log("");
console.log("  在 CommonJS 中需要用 async IIFE 包裹:");
console.log("    (async () => {");
console.log("      const result = await someAsyncFn();");
console.log("    })();");

// 演示 async IIFE（立即执行的异步函数表达式）
(async function () {
  var result = await apiCall("IIFE 测试", 10, false);
  console.log("  async IIFE 结果:", result);
})();

// ---- 7. 常见陷阱：forEach 中 await 不生效 ----
console.log("\\n===== 7. forEach 中 await 的陷阱 =====");

async function forEachTrap() {
  var items = ["A", "B", "C"];

  console.log("  ❌ forEach + await（不生效）:");
  var start = Date.now();
  items.forEach(async function (item) {
    await new Promise(function (r) { setTimeout(r, 20); });
    console.log("    处理:", item);
  });
  console.log("  forEach 立即完成:", Date.now() - start + "ms");

  // 等待一会儿让 forEach 里的异步逻辑完成
  await new Promise(function (r) { setTimeout(r, 80); });

  console.log("  ✅ for...of + await（正确）:");
  start = Date.now();
  for (var i = 0; i < items.length; i++) {
    await new Promise(function (r) { setTimeout(r, 20); });
    console.log("    处理:", items[i]);
  }
  console.log("  for...of 耗时:", Date.now() - start + "ms");

  console.log("  ✅ Promise.all + map（并行）:");
  start = Date.now();
  await Promise.all(items.map(function (item) {
    return new Promise(function (r) {
      setTimeout(function () {
        console.log("    处理:", item);
        r();
      }, 20);
    });
  }));
  console.log("  Promise.all 耗时:", Date.now() - start + "ms");
}

forEachTrap();

// ---- 8. 忘记 await 的陷阱 ----
console.log("\\n===== 8. 忘记 await 的陷阱 =====");

async function forgetAwait() {
  // ❌ 忘记 await：拿到的是 Promise，不是数据
  var data = apiCall("测试", 10, false);
  console.log("  忘记 await 的结果:", data); // Promise { <pending> }
  console.log("  是 Promise 吗?", data instanceof Promise);

  // ✅ 加上 await
  var data2 = await apiCall("测试", 10, false);
  console.log("  加上 await 的结果:", data2); // 实际数据
}

forgetAwait();

// ---- 9. 综合实战：数据聚合服务 ----
console.log("\\n===== 9. 综合实战：数据聚合服务 =====");

// 模拟一个用户数据聚合服务
async function aggregateUserData(userId) {
  var start = Date.now();

  try {
    // 第一步：获取用户基本信息
    console.log("  获取用户基本信息...");
    var user = await apiCall("用户" + userId, 20, false);

    // 第二步：并行获取所有关联数据
    console.log("  并行获取关联数据...");
    var relatedData = await Promise.allSettled([
      apiCall("订单列表", 30, false),
      apiCall("购物车", 25, Math.random() > 0.5), // 50% 概率失败
      apiCall("收藏列表", 20, false),
      apiCall("浏览历史", 15, false),
    ]);

    // 整理结果
    var success = [];
    var failed = [];
    var labels = ["订单", "购物车", "收藏", "历史"];
    relatedData.forEach(function (r, i) {
      if (r.status === "fulfilled") {
        success.push(labels[i] + ": " + r.value);
      } else {
        failed.push(labels[i] + ": " + r.reason.message);
      }
    });

    console.log("  聚合结果:");
    console.log("    用户:", user);
    console.log("    成功:", success.length, "个");
    success.forEach(function (s) { console.log("      ✓", s); });
    if (failed.length > 0) {
      console.log("    失败:", failed.length, "个");
      failed.forEach(function (f) { console.log("      ✗", f); });
    }
    console.log("  聚合耗时:", Date.now() - start + "ms");

    return { user: user, success: success, failed: failed };
  } catch (err) {
    console.error("  聚合失败:", err.message);
    return null;
  }
}

aggregateUserData(42);

// ---- 10. async/await 最佳实践总结 ----
console.log("\\n===== 10. async/await 最佳实践 =====");
console.log("  1. 总是用 try/catch 包裹 await 表达式");
console.log("  2. 无依赖关系的请求用 Promise.all 并行");
console.log("  3. 有依赖关系的请求串行 await");
console.log("  4. 不要忘记 await（否则拿到 Promise 对象）");
console.log("  5. forEach 不支持 await，用 for...of 代替");
console.log("  6. async 函数总是返回 Promise");
console.log("  7. 用 async IIFE 在非 async 上下文中使用 await");

console.log("\\n===== Async/Await 实战演示结束 =====");`,
  },

  // =========================================================
  // 第四章：事件循环原理
  // =========================================================
  {
    id: "node-eventloop",
    group: "异步编程",
    icon: "🔄",
    title: "事件循环原理",
    content: `## 事件循环原理

事件循环（Event Loop）是 Node.js 的**核心引擎**。它让单线程的 Node.js 能够高效处理数以万计的并发连接。理解事件循环的工作原理，是写出高性能 Node.js 应用的关键。

### 事件循环的 6 个阶段

Node.js 事件循环由 libuv 实现，每一轮（tick）包含 6 个阶段：

\`\`\`
  ┌────────────────────────────────────────────┐
  │            事件循环一轮（tick）               │
  │                                             │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
  │  │ 1.timers │→│2.pending │→│ 3.idle/  │  │
  │  │ 定时器到期│  │ 系统回调  │  │  prepare │  │
  │  └──────────┘  └──────────┘  └──────────┘  │
  │       ↓                              ↓     │
  │  ┌──────────┐              ┌──────────┐    │
  │  │ 4.poll   │←─────────────│ 5.check  │    │
  │  │ I/O 轮询  │              │setImmediate│   │
  │  └──────────┘              └──────────┘    │
  │       ↓                         ↓          │
  │  ┌──────────┐                            │
  │  │ 6.close  │                            │
  │  │ 关闭回调  │                            │
  │  └──────────┘                            │
  └────────────────────────────────────────────┘
\`\`\`

#### 各阶段详解

**1. timers 阶段** — 执行到期的 \`setTimeout\` 和 \`setInterval\` 回调

**2. pending callbacks 阶段** — 执行延迟到下一轮的 I/O 回调（如 TCP 错误）

**3. idle, prepare 阶段** — libuv 内部使用，通常不需要关心

**4. poll 阶段（最重要）** — 获取新的 I/O 事件，执行 I/O 相关回调。如果没有定时器到期，会在此阻塞等待

**5. check 阶段** — 执行 \`setImmediate\` 回调

**6. close callbacks 阶段** — 执行关闭事件回调（如 \`socket.on('close')\`）

### 宏任务 vs 微任务

这是理解事件循环执行顺序的关键概念：

| 类型 | 代表 | 执行时机 |
| --- | --- | --- |
| 微任务 | \`process.nextTick\` | 每个阶段之间，**最先执行** |
| 微任务 | \`Promise.then\` | nextTick 队列之后 |
| 宏任务 | \`setTimeout\` / \`setInterval\` | timers 阶段 |
| 宏任务 | \`setImmediate\` | check 阶段 |
| 宏任务 | I/O 回调 | poll 阶段 |

**核心规则**：每个阶段之间，事件循环会清空所有微任务队列（先 nextTick，后 Promise）。

\`\`\`
  阶段 N → [清空 nextTick] → [清空微任务] → 阶段 N+1
\`\`\`

### process.nextTick vs Promise.then

\`process.nextTick\` 的优先级**高于** \`Promise.then\`：

\`\`\`javascript
console.log("1. 同步");

process.nextTick(() => console.log("3. nextTick"));
Promise.resolve().then(() => console.log("4. Promise"));

console.log("2. 同步");

// 输出: 1 → 2 → 3 → 4
\`\`\`

#### nextTick 的陷阱：饿死 I/O

如果递归调用 \`nextTick\`，微任务队列永远不会清空，事件循环无法进入下一个阶段，I/O 回调永远得不到执行：

\`\`\`javascript
// ❌ 危险：递归 nextTick 会饿死 I/O
function recursiveTick() {
  process.nextTick(recursiveTick);
}
recursiveTick();
// setTimeout(() => console.log("永远执行不到"), 0);
\`\`\`

> **最佳实践**：优先使用 \`setImmediate\`，除非你有特殊理由需要微任务级别的优先级。

### setImmediate vs setTimeout 的顺序之谜

在**主模块**中，\`setTimeout(fn, 0)\` 和 \`setImmediate(fn)\` 的执行顺序是**不确定的**：

\`\`\`javascript
setTimeout(() => console.log("timeout"));
setImmediate(() => console.log("immediate"));
// 可能: timeout → immediate
// 也可能: immediate → timeout
\`\`\`

原因：取决于进程启动到执行这段代码的耗时。如果耗时超过 1ms，\`setTimeout\` 已经到期，会比 \`setImmediate\` 先执行。

但在 **I/O 回调**中，\`setImmediate\` **一定先于** \`setTimeout\`：

\`\`\`javascript
fs.readFile("file.txt", () => {
  setTimeout(() => console.log("timeout"));   // 下一轮 timers
  setImmediate(() => console.log("immediate")); // 当轮 check
  // 输出: immediate → timeout
});
\`\`\`

原因：I/O 回调在 poll 阶段执行，poll 之后是 check（setImmediate），然后才进入下一轮的 timers。

### poll 阶段的阻塞行为

poll 阶段是事件循环中**最复杂**的阶段：

1. 有 I/O 事件就绪 → 执行回调
2. 无 I/O 事件：
   - 有 \`setImmediate\` 待执行 → 不阻塞，转入 check 阶段
   - 有定时器到期 → 不阻塞，转入 timers 阶段
   - 都没有 → **阻塞等待**新的 I/O 事件

> 这就是为什么没有定时器和 I/O 时，Node.js 进程会自动退出——poll 阶段没有东西可等了。

### 完整执行顺序示例

\`\`\`javascript
console.log("1");

setTimeout(() => console.log("6"), 0);

fs.readFile(__filename, () => {
  console.log("7"); // I/O 回调（poll 阶段）
  setImmediate(() => console.log("8"));
  setTimeout(() => console.log("9"), 0);
});

setImmediate(() => console.log("5"));

process.nextTick(() => console.log("3"));

Promise.resolve().then(() => console.log("4"));

console.log("2");

// 可能的输出: 1→2→3→4→5→6→7→8→9
// （5 和 6 的顺序可能互换，主模块中不确定）
\`\`\`

### 常见面试题

#### 题目：嵌套 setTimeout 中的执行顺序

\`\`\`javascript
setTimeout(() => {
  console.log("A");
  setTimeout(() => console.log("B"), 0);
  setImmediate(() => console.log("C"));
  process.nextTick(() => console.log("D"));
  Promise.resolve().then(() => console.log("E"));
}, 0);
// 输出: A → D → E → C → B
// 解释：A 是宏任务，进入宏任务后先清空微任务(D→E)，
// 然后进入 check 阶段(C)，最后下一轮 timers(B)
\`\`\`

### 「底层原理」

#### libuv 事件循环的 C 语言核心

事件循环并非 JavaScript 语言特性，而是由 libuv（C 语言编写的跨平台异步 I/O 库）实现的。Node.js 的 \`while\` 循环核心近似如下：

\`\`\`c
  // libuv 事件循环核心（简化伪代码）
  int uv_run(uv_loop_t* loop, uv_run_mode mode) {
    while (uv__loop_alive(loop)) {
      // 1. 计算即将到期的定时器
      uv__update_time(loop);

      // 2. timers 阶段：执行到期的 setTimeout/setInterval
      uv__run_timers(loop);

      // 3. pending callbacks：执行延迟的 I/O 回调
      uv__run_pending(loop);

      // 4. idle/prepare：内部使用
      uv__run_idle(loop);
      uv__run_prepare(loop);

      // 5. poll 阶段：阻塞等待 I/O 事件（核心）
      timeout = uv__backend_timeout(loop);
      uv__io_poll(loop, timeout); // 调用 epoll/kqueue/IOCP

      // 6. check 阶段：执行 setImmediate 回调
      uv__run_check(loop);

      // 7. close callbacks：执行 close 事件
      uv__run_closing_handles(loop);

      // ⚠️ 关键：每个阶段后都检查并执行 process.nextTick 和微任务
      _run_next_ticks_and_microtasks();
    }
  }
\`\`\`

#### epoll/kqueue/IOCP：操作系统层面的 I/O 多路复用

\`\`\`
  poll 阶段底层 I/O 多路复用:
  ┌─────────────────────────────────────────────┐
  │                                             │
  │  Linux:    epoll_create/epoll_ctl/epoll_wait│
  │  macOS:    kqueue                           │
  │  Windows:  IOCP (完成端口)                   │
  │                                             │
  │  poll 阶段调用 uv__io_poll()，本质是：       │
  │                                             │
  │  1. 收集所有已注册的 fd (文件描述符)         │
  │  2. 传入 timeout（最近一个定时器到期时间）    │
  │  3. 调用 epoll_wait 阻塞等待                 │
  │     → 有 I/O 事件就绪：返回，处理回调        │
  │     → 超时时间到：返回，回到 timers 阶段     │
  │     → 没有定时器也没有 I/O：进程可以退出      │
  │                                             │
  └─────────────────────────────────────────────┘
\`\`\`

#### libuv 线程池的工作机制

\`\`\`
  Thread Pool（默认 4 个工作线程）:
  ┌─────────────────────────────────────────────┐
  │                                             │
  │  主线程 (V8/Event Loop)                     │
  │    │                                        │
  │    ├─→ uv_queue_work(loop, req, fn, after)  │
  │    │       │                                │
  │    │       ↓ 提交任务到工作队列              │
  │    │  ┌─────────┐                           │
  │    │  │ 任务队列 │ ← 互斥锁保护              │
  │    │  └────┬────┘                           │
  │    │       │ 工作线程竞争取任务              │
  │    │  ┌────┴────────────────────┐           │
  │    │  │ 线程1 │ 线程2 │ 线程3 │ 线程4 │      │
  │    │  │ 阻塞I/O│ DNS解 │ zlib │ crypto│      │
  │    │  │ 文件读写│ 析    │ 压缩 │ 加密  │      │
  │    │  └────┬────────────────────┘           │
  │    │       │ 完成后 uv_async_send 通知主线程 │
  │    │       ↓                                │
  │    │  回调加入对应阶段队列，下轮事件循环执行  │
  │                                             │
  └─────────────────────────────────────────────┘
\`\`\`

**线程池承载的操作**：文件 I/O（\`fs.*\`）、DNS 解析（\`dns.lookup\`）、zlib 压缩、crypto 加密（\`crypto.pbkdf2\`、\`crypto.scrypt\` 等）。**网络 I/O 不走线程池**，由操作系统 epoll/kqueue 直接通知。

#### 阶段切换与微任务清空的精确时机

\`\`\`
  阶段切换微任务清空点:
  ─────────────────────────────────────────────
  timers 阶段
      → [清空 nextTick 队列]
      → [清空 Promise microtask 队列]
  pending callbacks 阶段
      → [清空 nextTick 队列]
      → [清空 Promise microtask 队列]
  idle/prepare 阶段
      → [清空 nextTick 队列]
      → [清空 Promise microtask 队列]
  poll 阶段（执行完一个 I/O 回调后也要清空微任务！）
      → 每个 I/O 回调之后
      → [清空 nextTick 队列]
      → [清空 Promise microtask 队列]
  check 阶段
      → [清空 nextTick 队列]
      → [清空 Promise microtask 队列]
  close callbacks 阶段
  ─────────────────────────────────────────────

  ⚠️ 注意：不仅是阶段之间，在 poll 阶段执行完
     单个 I/O 回调后，也会清空微任务队列！
\`\`\`

### 「常见陷阱」

#### 陷阱 1：同步 CPU 密集计算阻塞事件循环

\`\`\`javascript
// ❌ 阻塞事件循环：所有异步操作被暂停
app.get("/compute", (req, res) => {
  let sum = 0;
  for (let i = 0; i < 10_000_000_000; i++) {
    sum += i; // 这个循环可能持续几秒！
  }
  res.send({ sum });
  // 在这几秒内，服务器无法响应任何其他请求
});

// ✅ 正确：拆分任务或使用 Worker Threads
// 方法1：setImmediate 拆分
async function computeLarge() {
  let sum = 0;
  for (let i = 0; i < 10_000_000_000; i++) {
    sum += i;
    if (i % 1_000_000 === 0) {
      await new Promise(r => setImmediate(r)); // 让出事件循环
    }
  }
  return sum;
}

// 方法2：使用 Worker Threads（推荐 CPU 密集场景）
const { Worker } = require("worker_threads");
\`\`\`

#### 陷阱 2：process.nextTick 递归导致 I/O 饿死

\`\`\`javascript
// ❌ nextTick 递归微任务饥饿
function starving() {
  process.nextTick(starving); // 永远不清空微任务队列
}
starving();
// setTimeout、I/O 回调、setImmediate 永远没有机会执行

// ✅ 使用 setImmediate 代替递归 nextTick
function nonStarving() {
  setImmediate(nonStarving); // 每个 check 阶段执行一次
  // I/O 和 timer 有机会执行
}
\`\`\`

#### 陷阱 3：误以为 setTimeout(fn, 0) 零延迟

\`\`\`javascript
// ❌ 认为 setTimeout(fn, 0) 会立即执行
const start = Date.now();
setTimeout(() => {
  console.log("延迟:", Date.now() - start);
  // 通常是 1-2ms 以上，不是 0ms！
}, 0);

// 原因：
// 1. 事件循环粒度：setTimeout 到期检测精度约 1ms
// 2. 要等当前同步代码和微任务全部执行完
// 3. 要等 poll 阶段的 I/O 回调处理完
// 4. 系统定时器调度有延迟

// ✅ 需要微任务级延迟用 Promise.resolve().then() 或 queueMicrotask
queueMicrotask(() => {
  console.log("微任务比 setTimeout(0) 更早执行");
});
\`\`\`

#### 陷阱 4：主模块中 setImmediate vs setTimeout(fn, 0) 顺序不确定

\`\`\`javascript
// ❌ 依赖 setTimeout(0) 和 setImmediate 在主模块中的执行顺序
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
// 输出顺序不确定！可能是 timeout→immediate，也可能反过来

// ✅ 如果需要确定性顺序：
// 1. 在 I/O 回调中：setImmediate 总是先于 setTimeout
// 2. 或者都使用 Promise 微任务保证顺序
// 3. 不要依赖主模块中的不确定顺序
\`\`\`

#### 陷阱 5：在 poll 阶段执行长时间操作拖慢整个事件循环

\`\`\`javascript
// ❌ I/O 回调中的耗时操作影响其他阶段
server.on("connection", (socket) => {
  socket.on("data", (data) => {
    // data 事件在 poll 阶段触发
    const processed = heavyProcessing(data); // 耗时 100ms
    socket.write(processed);
    // 这 100ms 内所有 timer、其他 I/O 事件都被推迟
  });
});

// ✅ 将耗时操作移出 poll 回调
socket.on("data", (data) => {
  setImmediate(() => {
    // 放到 check 阶段执行，让其他 I/O 先处理
    const processed = heavyProcessing(data);
    socket.write(processed);
  });
});
\`\`\`

### 「性能提示」

#### 1. 优先使用 setImmediate 而非 process.nextTick

\`\`\`javascript
// ❌ process.nextTick 优先级过高，容易饿死 I/O
process.nextTick(() => doSomething());

// ✅ setImmediate 在 check 阶段执行，允许 I/O 在期间完成
setImmediate(() => doSomething());

// ✅ 如果确实需要微任务级别，优先使用 queueMicrotask 而非 nextTick
// queueMicrotask 的语义更清晰，且在浏览器中也可用
queueMicrotask(() => doSomething());
\`\`\`

#### 2. CPU 密集任务使用 Worker Threads，避免阻塞主线程

\`\`\`javascript
// ✅ 使用 worker_threads 处理 CPU 密集任务
// worker.js
const { parentPort, workerData } = require("worker_threads");
const result = heavyCompute(workerData); // 不阻塞主线程
parentPort.postMessage(result);

// main.js
const { Worker } = require("worker_threads");
function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: data });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}
app.get("/compute", async (req, res) => {
  const result = await runWorker(req.query.n);
  res.send({ result }); // 主线程不被阻塞，可以处理其他请求
});
\`\`\`

#### 3. 监控事件循环延迟，及时发现阻塞

\`\`\`javascript
// ✅ 监控事件循环延迟
function measureEventLoopLag(thresholdMs = 100) {
  let last = Date.now();
  function check() {
    const now = Date.now();
    const lag = now - last - 100;
    if (lag > thresholdMs) {
      console.warn(\`事件循环延迟: \${lag}ms，可能有阻塞！\`);
    }
    last = now;
    setTimeout(check, 100);
  }
  setTimeout(check, 100);
}
measureEventLoopLag();

// 或者使用专业监控库：blocked-at、event-loop-lag
\`\`\`

下面这段代码用编号输出清晰展示事件循环的执行顺序。`,
    code: `// ============================================================
// 第四章代码演示：事件循环原理
// ============================================================

// ---- 1. 基本执行顺序：同步 → 微任务 → 宏任务 ----
console.log("===== 1. 基本执行顺序 =====");
console.log("  [1] 同步代码开始");

// process.nextTick：最高优先级微任务
process.nextTick(function () {
  console.log("  [3] process.nextTick（微任务）");
});

// Promise.then：微任务，在 nextTick 之后
Promise.resolve().then(function () {
  console.log("  [4] Promise.then（微任务）");
});

// setTimeout：宏任务，在 timers 阶段
setTimeout(function () {
  console.log("  [5] setTimeout(0)（宏任务：timers 阶段）");
}, 0);

// setImmediate：宏任务，在 check 阶段
setImmediate(function () {
  console.log("  [6] setImmediate（宏任务：check 阶段）");
});

console.log("  [2] 同步代码结束");
// 输出: 1 → 2 → 3 → 4 → 5/6（5 和 6 顺序不定）

// ---- 2. nextTick 优先级高于 Promise ----
console.log("\\n===== 2. nextTick vs Promise 优先级 =====");

console.log("  [A] 同步");

process.nextTick(function () {
  console.log("  [B] nextTick（先执行）");
});

Promise.resolve().then(function () {
  console.log("  [C] Promise（后执行）");
});

process.nextTick(function () {
  console.log("  [D] 第二个 nextTick");
});

Promise.resolve().then(function () {
  console.log("  [E] 第二个 Promise");
});

console.log("  [F] 同步结束");
// 输出: A → F → B → D → C → E（先清空所有 nextTick，再清空所有 Promise）

// ---- 3. 嵌套 setTimeout 中的执行顺序（经典面试题）----
console.log("\\n===== 3. 嵌套 setTimeout 执行顺序 =====");

setTimeout(function () {
  console.log("  [1] 外层 setTimeout 执行");

  // 在 setTimeout 回调中注册新的任务
  setTimeout(function () {
    console.log("  [5] 内层 setTimeout（下一轮 timers）");
  }, 0);

  setImmediate(function () {
    console.log("  [4] 内层 setImmediate（当轮 check）");
  });

  process.nextTick(function () {
    console.log("  [2] 内层 nextTick（微任务）");
  });

  Promise.resolve().then(function () {
    console.log("  [3] 内层 Promise（微任务）");
  });
}, 100);
// 输出: 1 → 2 → 3 → 4 → 5
// 解释：宏任务执行后，先清空微任务(2→3)，然后 check(4)，最后下一轮 timers(5)

// ---- 4. I/O 回调中的 setImmediate vs setTimeout ----
console.log("\\n===== 4. I/O 回调中的执行顺序 =====");

var fs = require("fs");

fs.readFile(__filename, function () {
  console.log("  [1] I/O 回调执行（poll 阶段）");

  // 在 I/O 回调中，setImmediate 一定先于 setTimeout
  setTimeout(function () {
    console.log("  [3] I/O 中的 setTimeout（下一轮 timers）");
  }, 0);

  setImmediate(function () {
    console.log("  [2] I/O 中的 setImmediate（当轮 check）");
  });
});
// 输出: 1 → 2 → 3（在 I/O 回调中 setImmediate 一定先于 setTimeout）

// ---- 5. process.nextTick 递归与饿死 I/O ----
console.log("\\n===== 5. nextTick 递归饿死 I/O 演示 =====");

var tickCount = 0;
var maxTicks = 3; // 限制递归次数，避免死循环

function safeTick() {
  tickCount++;
  console.log("  nextTick 第 " + tickCount + " 次执行");
  if (tickCount < maxTicks) {
    process.nextTick(safeTick);
  }
}
process.nextTick(safeTick);

// 这个 setTimeout 在 nextTick 递归期间不会执行
setTimeout(function () {
  console.log("  setTimeout 终于执行了（nextTick 递归结束后）");
}, 0);

console.log("  同步代码结束（nextTick 递归即将开始）");

// ---- 6. 微任务在阶段间清空 ----
console.log("\\n===== 6. 微任务在宏任务之间清空 =====");

setTimeout(function () {
  console.log("  [timer1] 第一个 setTimeout 执行");

  // 在 timer1 中注册微任务
  process.nextTick(function () {
    console.log("  [tick1] timer1 中的 nextTick");
  });
  Promise.resolve().then(function () {
    console.log("  [micro1] timer1 中的 Promise");
  });
}, 50);

setTimeout(function () {
  console.log("  [timer2] 第二个 setTimeout 执行");
  // timer2 一定在 timer1 的微任务清空后才执行
}, 50);
// 输出: timer1 → tick1 → micro1 → timer2

// ---- 7. setImmediate 的确定性场景 ----
console.log("\\n===== 7. setImmediate 在 I/O 中的确定性 =====");

// 模拟 I/O 操作
var path = require("path");
var filename = path.join(__dirname, "nonexistent.txt");

// 使用 fs.access 在回调中观察 setImmediate 与 setTimeout 的顺序
fs.access(__filename, fs.constants.F_OK, function (err) {
  if (err) {
    console.log("  I/O 回调: 文件不存在");
  } else {
    console.log("  I/O 回调: 文件存在（poll 阶段）");
  }

  // 在 I/O 回调中注册
  var immediateCount = 0;
  var timeoutCount = 0;

  setImmediate(function () {
    immediateCount++;
    console.log("    [" + immediateCount + "] setImmediate（check 阶段）");
  });

  setTimeout(function () {
    timeoutCount++;
    console.log("    [" + timeoutCount + "] setTimeout（下一轮 timers）");
  }, 0);

  var immediateCount2 = 0;
  var timeoutCount2 = 0;

  setImmediate(function () {
    immediateCount2++;
    console.log("    [" + immediateCount2 + "] setImmediate 2（check 阶段）");
  });

  setTimeout(function () {
    timeoutCount2++;
    console.log("    [" + timeoutCount2 + "] setTimeout 2（下一轮 timers）");
  }, 0);
});

// ---- 8. 事件循环阶段总结图 ----
console.log("\\n===== 8. 事件循环阶段总结 =====");

console.log("  ┌────────────────────────────────────────────┐");
console.log("  │  事件循环一轮 (tick) 的 6 个阶段:            │");
console.log("  │                                             │");
console.log("  │  1. timers    → setTimeout / setInterval   │");
console.log("  │  2. pending   → 系统级 I/O 回调             │");
console.log("  │  3. idle/prep → libuv 内部使用              │");
console.log("  │  4. poll      → I/O 事件与回调（核心）       │");
console.log("  │  5. check     → setImmediate 回调           │");
console.log("  │  6. close     → close 事件回调              │");
console.log("  │                                             │");
console.log("  │  每个阶段之间: 清空 nextTick + microtask   │");
console.log("  └────────────────────────────────────────────┘");

// ---- 9. queueMicrotask 演示 ----
console.log("\\n===== 9. queueMicrotask 演示 =====");

// 沙箱中可能没有全局 queueMicrotask，用 Promise 模拟
var microtask = typeof queueMicrotask === "function"
  ? queueMicrotask
  : function (cb) { Promise.resolve().then(cb); };

console.log("  [1] 同步");
microtask(function () {
  console.log("  [3] queueMicrotask 回调");
});
Promise.resolve().then(function () {
  console.log("  [4] Promise.then");
});
process.nextTick(function () {
  console.log("  [2] nextTick");
});
console.log("  [5] 同步");
// 输出: 1 → 5 → 2 → 3 → 4

// ---- 10. 完整执行顺序综合演示 ----
console.log("\\n===== 10. 完整执行顺序综合演示 =====");

// 使用一个异步入口来观察完整的执行顺序
setTimeout(function () {
  console.log("  === 综合演示开始 ===");

  console.log("  [A] 同步");

  process.nextTick(function () {
    console.log("  [B] nextTick");
  });

  Promise.resolve().then(function () {
    console.log("  [C] Promise.then 1");
  });

  Promise.resolve().then(function () {
    console.log("  [D] Promise.then 2");
  });

  setTimeout(function () {
    console.log("  [E] 内层 setTimeout");
  }, 0);

  setImmediate(function () {
    console.log("  [F] setImmediate");
  });

  console.log("  [G] 同步结束");
  // 预期: A → G → B → C → D → F → E
}, 100);

// ---- 11. ref/unref 机制 ----
console.log("\\n===== 11. ref/unref 机制 =====");

// ref()：定时器保持进程运行（默认）
// unref()：定时器不阻止进程退出
var unrefTimer = setTimeout(function () {
  console.log("  unref 定时器执行了（说明还有其他任务保持进程运行）");
}, 200);
unrefTimer.unref();
console.log("  已创建 unref 定时器（200ms，不会阻止进程退出）");

// 创建一个普通定时器来保持进程运行（让 unref 定时器有机会执行）
var keepAlive = setTimeout(function () {
  console.log("  普通定时器执行，进程即将退出");
}, 250);

console.log("\\n===== 事件循环原理演示结束 =====");
console.log("关键要点:");
console.log("  1. 微任务（nextTick/Promise）在阶段之间执行");
console.log("  2. nextTick 优先级高于 Promise.then");
console.log("  3. 递归 nextTick 会饿死 I/O");
console.log("  4. I/O 回调中 setImmediate 一定先于 setTimeout");
console.log("  5. 主模块中 setTimeout(0) 和 setImmediate 顺序不定");
console.log("  6. poll 阶段是核心，负责 I/O 事件的轮询");
console.log("  7. 没有定时器和 I/O 时，进程自动退出");`,
  },

  // =========================================================
  // 第五章：并发控制
  // =========================================================
  {
    id: "node-concurrency",
    group: "异步编程",
    icon: "🚦",
    title: "并发控制",
    content: `## 并发控制

并发控制是 Node.js 高性能编程中**不可或缺**的技能。当你有成百上千个异步任务需要执行时，一股脑地全部发起可能会导致资源耗尽、连接过多、触发限流。本章将教你如何优雅地控制并发。

### 并发 vs 并行

首先澄清两个容易被混淆的概念：

| 概念 | 含义 | Node.js 中的体现 |
| --- | --- | --- |
| **并发**（Concurrency） | 多个任务在**同一时间段内**交替执行 | 事件循环在不同任务间切换 |
| **并行**（Parallelism） | 多个任务在**同一时刻**同时执行 | Worker Threads 多线程 |

\`\`\`
  并发（单线程交替）:
  任务A: ████░░░░████░░░░
  任务B: ░░░░████░░░░████
         时间 →

  并行（多线程同时）:
  线程1: 任务A: ████████████
  线程2: 任务B: ████████████
         时间 →
\`\`\`

Node.js 是单线程的，但通过事件循环实现了**高并发**。多个异步任务可以同时"在途"（in-flight），但同一时刻只有一个在执行。

### 为什么需要并发控制？

#### 不限制并发的风险

\`\`\`javascript
// ❌ 危险：无限制并发发送 1000 个请求
const urls = [...Array(1000)].map((_, i) => "/api/item/" + i);

// 同时发起 1000 个请求！
await Promise.all(urls.map(url => fetch(url)));

// 问题：
// 1. 可能耗尽文件描述符（EMFILE 错误）
// 2. 可能触发 API 限流
// 3. 可能耗尽内存（每个请求都有 buffer）
// 4. 目标服务器可能被压垮
\`\`\`

#### 哪些场景需要并发控制？

- **爬虫/数据采集**：避免触发反爬机制
- **批量 API 调用**：遵守 API 速率限制
- **文件批量处理**：避免打开过多文件描述符
- **数据库批量写入**：避免连接池耗尽
- **图片/视频处理**：CPU 密集型任务需要限制并发数

### 信号量模式

信号量（Semaphore）是并发控制最经典的实现方式：

\`\`\`javascript
class Semaphore {
  constructor(limit) {
    this.limit = limit;       // 最大并发数
    this.running = 0;         // 当前运行数
    this.queue = [];          // 等待队列
  }

  async acquire() {
    if (this.running < this.limit) {
      this.running++;
      return;
    }
    // 达到上限，加入等待队列
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.running--;
    // 从等待队列中取出下一个
    if (this.queue.length > 0) {
      this.queue.shift()();
    }
  }
}
\`\`\`

### 并发限制器实现

一个实用的并发限制器需要处理以下问题：

1. **限制同时进行的任务数**
2. **任务完成后释放槽位**
3. **等待队列公平调度**
4. **收集所有任务结果**

#### 核心实现

\`\`\`javascript
async function asyncPool(limit, items, iteratorFn) {
  const results = [];
  const executing = [];

  for (const item of items) {
    // 创建任务 Promise
    const p = Promise.resolve().then(() => iteratorFn(item));
    results.push(p);

    // 达到限制时，等待一个完成
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(results);
}
\`\`\`

### 批量处理模式

#### 分批处理（Batch Processing）

将大量任务分成固定大小的批次，逐批处理：

\`\`\`javascript
async function batchProcess(items, batchSize, processor) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
    console.log("完成批次:", i / batchSize + 1);
  }
  return results;
}
\`\`\`

#### 滑动窗口模式

与固定批次不同，滑动窗口在任务完成后立即启动新任务，始终保持最大并发数：

\`\`\`
  固定批次: [A B C] → [D E F] → [G H I]
  滑动窗口: A B C → D B C → D E C → D E F → ...
  （一个完成立即启动下一个，始终保持最大并发）
\`\`\`

滑动窗口比固定批次**效率更高**，因为不会出现"等待最慢任务"的空闲时间。

### 实战：带超时和重试的并发限制器

将并发控制与超时、重试结合，形成一个健壮的任务执行器：

\`\`\`javascript
async function executeWithLimit(tasks, options = {}) {
  const {
    limit = 5,        // 最大并发数
    timeout = 30000,  // 单个任务超时（ms）
    retries = 0,      // 重试次数
    retryDelay = 1000,// 重试间隔
  } = options;

  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = executeWithRetry(task, timeout, retries, retryDelay)
      .then(r => { results.push(r); executing.delete(p); });

    executing.add(p);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
\`\`\`

### 常见陷阱

1. **Promise.all 无限制并发**：1000 个任务一起发，可能打垮服务
2. **固定批次效率低**：批次中有一个慢任务，整个批次进度被拖慢
3. **忘记收集结果**：并发控制器的结果需要正确收集
4. **错误处理不当**：一个任务失败不应该影响其他任务

### 「底层原理」

#### 操作系统层面的并发限制

Node.js 的并发能力受多个系统级资源的约束：

\`\`\`
  并发上限的多层限制:
  ┌─────────────────────────────────────────────┐
  │                                             │
  │  应用层: 并发限制器 (Semaphore/asyncPool)    │
  │    ↓ 你控制的并发数                          │
  │  libuv 线程池: 默认 4 线程 (UV_THREADPOOL_SIZE)│
  │    ↓ 文件I/O/DNS/zlib/crypto 的并行上限      │
  │  操作系统文件描述符: ulimit -n (默认 1024)   │
  │    ↓ 每个 socket/文件占用一个 fd             │
  │  TCP 连接池: 操作系统端口范围、TIME_WAIT     │
  │    ↓ 高并发下端口耗尽                       │
  │  目标服务: API 速率限制、数据库连接池         │
  │    ↓ 第三方服务的承载能力                    │
  │                                             │
  └─────────────────────────────────────────────┘
\`\`\`

#### 文件描述符耗尽机制

每个 TCP 连接、打开的文件、管道都占用一个文件描述符（fd）：

\`\`\`javascript
// 查看当前进程的 fd 限制
import { getrlimit } from "os"; // 概念性
// 实际上: ulimit -n 查看，ulimit -n 65535 修改

// ❌ 1000 个并发 fetch 可能触发 EMFILE 错误
const urls = Array.from({ length: 10000 }, (_, i) => \`/api/item/\${i}\`);
await Promise.all(urls.map(u => fetch(u)));
// Error: connect EMFILE → 打开文件描述符过多
\`\`\`

**关键细节**：
1. **libuv 线程池默认 4 线程**：意味着最多 4 个文件 I/O 操作并行执行。增大 \`UV_THREADPOOL_SIZE\` 可以提高文件 I/O 并行度，但线程间切换也有开销。
2. **TCP 半连接队列（SYN Backlog）**：大量并发连接时，内核 TCP 队列可能溢出，导致 \`ECONNRESET\`。
3. **数据库连接池**：如 PostgreSQL 默认 100 个连接。超过限制的查询会排队等待空闲连接，此时 Node.js 侧的并发限制器再高也无济于事。
4. **HTTP Agent 的 keepAlive 和 maxSockets**：Node.js 的 HTTP 客户端默认对每个 host:port 最多 Infinity 个连接，但使用 \`http.Agent({ keepAlive: true, maxSockets: 10 })\` 可以限制。

#### 滑动窗口 vs 固定批次的调度差异

\`\`\`
  固定批次 (batchSize=3):
  ─────────────────────────────────────────────
  [A(100ms) B(10ms) C(10ms)] → 等A完成(100ms)
  [D(10ms) E(10ms) F(10ms)] → 10ms完成
  总耗时 ≈ 110ms，B和C完成后有空闲浪费

  滑动窗口 (limit=3):
  ─────────────────────────────────────────────
  [A B C] 启动
  B完成 → 启动D  → [A C D]
  C完成 → 启动E  → [A D E]
  D完成 → 启动F  → [A E F]
  E完成 →        → [A F]
  F完成 →        → [A]
  A完成 → 全部完成
  总耗时 ≈ 100ms（被最慢的A决定），无空闲槽位
  ─────────────────────────────────────────────

  滑动窗口的槽位利用率始终是 100%（直到任务耗尽）
\`\`\`

滑动窗口的核心是 \`Promise.race(executing)\`：任何一个任务完成，立即启动下一个，始终保持最大并发数。

### 「常见陷阱」

#### 陷阱 1：错误的并发假设——以为异步代码天然安全

\`\`\`javascript
// ❌ 并发修改共享状态导致竞态条件
let counter = 0;
async function increment() {
  const current = counter;
  await delay(1); // 模拟异步操作
  counter = current + 1; // 读和写之间有间隙！
}
await Promise.all(Array(100).fill(null).map(increment));
console.log(counter); // 不是 100，可能是 1 或其他小数字！

// ✅ 正确：使用原子操作或锁
let counter = 0;
const queue = [];
let processing = false;
async function increment() {
  return new Promise(resolve => {
    queue.push(resolve);
    if (!processing) processQueue();
  });
}
async function processQueue() {
  processing = true;
  while (queue.length > 0) {
    counter++;
    queue.shift()();
    await Promise.resolve(); // 让出但保持顺序
  }
  processing = false;
}
\`\`\`

#### 陷阱 2：并发限制器中错误处理不当导致死锁

\`\`\`javascript
// ❌ 任务 reject 时没有释放信号量/槽位，导致永久卡住
async function badPool(limit, items, fn) {
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing); // ❌ 如果 p reject，不会从 executing 中移除
    }
  }
  return Promise.all(executing);
}
// 一个任务 reject → Promise.race 返回但 executing 中仍有这个 p
// → 后续的 splice 清理逻辑缺失 → executing 永远 >= limit → 死锁

// ✅ 正确：无论成功失败都清理槽位
const e = p
  .catch(() => {}) // 防止错误导致 Promise.race 提前返回但不清理
  .then(() => {
    const idx = executing.indexOf(e);
    if (idx > -1) executing.splice(idx, 1);
  });
executing.push(e);
if (executing.length >= limit) {
  await Promise.race(executing);
}
\`\`\`

#### 陷阱 3：结果顺序丢失

\`\`\`javascript
// ❌ 结果按完成顺序而非输入顺序收集
async function badPool(limit, items, fn) {
  const results = [];
  // ... 并发执行
  // 如果用 results.push() 在完成回调中收集，顺序不可控

  // ✅ 正确：使用数组索引保持顺序
  const results = new Array(items.length);
  // 任务 i 完成后 → results[i] = result
  return Promise.all(results.map(r => r)); // 等待所有位置填充
}
\`\`\`

#### 陷阱 4：忽视背压（Backpressure）

\`\`\`javascript
// ❌ 数据消费速度 < 生产速度，内存无限增长
async function processStream(stream) {
  const allData = [];
  stream.on("data", (chunk) => {
    // 没有暂停，数据持续涌入内存
    allData.push(chunk); // 如果处理慢于接收，内存暴涨
  });
}

// ✅ 正确：使用背压，处理完再继续读
async function processStreamWithBackpressure(readable, concurrency = 5) {
  const executing = new Set();
  for await (const chunk of readable) {
    const task = processChunk(chunk).finally(() => executing.delete(task));
    executing.add(task);
    if (executing.size >= concurrency) {
      await Promise.race(executing); // 等待一个处理完
    }
  }
  await Promise.all(executing);
}
\`\`\`

#### 陷阱 5：过高并发数反而降低吞吐量

\`\`\`javascript
// ❌ 并发数设置过高
// 场景：数据库连接池只有 10 个，却发起 100 个并发查询
const concurrency = 100; // 太高！
// 结果：
// 1. 大部分查询在排队等待数据库连接
// 2. 大量 Promise 挂起占用内存
// 3. TCP 连接数过多增加内核开销
// 4. 数据库压力过大反而变慢

// ✅ 合理设置并发数
// 经验值：
// - 数据库操作：并发数 ≤ 连接池大小
// - HTTP 请求：并发数 5-20（视目标服务能力）
// - 文件 I/O：并发数 ≤ UV_THREADPOOL_SIZE
// - CPU 密集（Worker Threads）：并发数 ≤ CPU 核心数
\`\`\`

### 「性能提示」

#### 1. 选择合适的并发数（关键调优点）

\`\`\`javascript
// ✅ 根据任务类型设置并发数
const CONCURRENCY = {
  cpuBound: os.cpus().length,           // CPU 密集：核心数
  fileIO: Number(process.env.UV_THREADPOOL_SIZE) || 4, // 文件 I/O：线程池大小
  httpAPI: 10,                          // HTTP API：5-20，视对方限制
  dbQuery: 5,                           // 数据库：连接池大小以内
};

// 根据系统资源动态调整
import os from "os";
const optimalConcurrency = Math.min(
  os.cpus().length * 2,  // CPU 考虑
  64,                     // 安全上限
  MAX_CONCURRENCY_CONFIG  // 用户配置
);
\`\`\`

#### 2. 使用流式背压处理大数据集

\`\`\`javascript
// ✅ 处理大文件/大量数据时，结合流式读取和并发控制
import { createReadStream } from "fs";
import readline from "readline";

async function processLargeFile(filePath) {
  const rl = readline.createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const executing = new Set();
  const CONCURRENCY = 10;
  let count = 0;

  for await (const line of rl) {
    const task = processLine(line)
      .then(() => count++)
      .finally(() => executing.delete(task));
    executing.add(task);
    if (executing.size >= CONCURRENCY) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  console.log(\`处理完成，共 \${count} 行\`);
}
// 内存占用恒定（不会一次性加载整个文件）
\`\`\`

#### 3. 使用 p-limit 或 async-pool 等成熟库代替手写

\`\`\`javascript
// ✅ 生产环境推荐使用经过验证的库
import pLimit from "p-limit";

const limit = pLimit(10); // 限制 10 个并发

const tasks = urls.map(url =>
  limit(() => fetch(url)) // 每个任务用 limit 包装
);
const results = await Promise.all(tasks);

// p-limit 的优势：
// 1. 经过大量生产验证，无死锁 bug
// 2. 支持动态调整并发数
// 3. 类型定义完备（TypeScript）
// 4. 极小体积，无额外依赖
\`\`\`

下面这段代码实现了完整的并发限制器，并演示了它在实际场景中的应用。`,
    code: `// ============================================================
// 第五章代码演示：并发控制
// ============================================================

// ---- 1. 模拟异步任务 ----
console.log("===== 1. 模拟异步任务 =====");

// 模拟一个耗时不等的异步任务（如 API 请求、文件处理）
function createTask(id, delay, shouldFail) {
  return function () {
    return new Promise(function (resolve, reject) {
      console.log("  [任务 " + id + "] 开始执行 (耗时 " + delay + "ms)");
      setTimeout(function () {
        if (shouldFail) {
          console.log("  [任务 " + id + "] 执行失败");
          reject(new Error("任务 " + id + " 失败"));
        } else {
          console.log("  [任务 " + id + "] 执行完成");
          resolve("结果" + id);
        }
      }, delay);
    });
  };
}

// ---- 2. 信号量实现 ----
console.log("\\n===== 2. 信号量（Semaphore）实现 =====");

// 信号量：经典的并发控制原语
function Semaphore(limit) {
  this.limit = limit;   // 最大并发数
  this.running = 0;     // 当前运行数
  this.queue = [];      // 等待队列
}

// 获取信号量：如果达到上限就等待
Semaphore.prototype.acquire = function () {
  var self = this;
  return new Promise(function (resolve) {
    if (self.running < self.limit) {
      self.running++;
      resolve();
    } else {
      // 达到上限，加入等待队列
      self.queue.push(resolve);
    }
  });
};

// 释放信号量：唤醒等待队列中的下一个任务
Semaphore.prototype.release = function () {
  this.running--;
  if (this.queue.length > 0) {
    // 从等待队列中取下一个，让它开始执行
    this.running++;
    var next = this.queue.shift();
    next();
  }
};

// 演示信号量
var sem = new Semaphore(2);
var semTaskCount = 0;

function runWithSemaphore(id) {
  sem.acquire().then(function () {
    console.log("  信号量任务 " + id + " 获得许可（当前运行: " + sem.running + "）");
    setTimeout(function () {
      console.log("  信号量任务 " + id + " 完成，释放许可");
      sem.release();
    }, 30);
  });
}

console.log("  启动 4 个信号量任务（限制 2 个并发）...");
runWithSemaphore("A");
runWithSemaphore("B");
runWithSemaphore("C");
runWithSemaphore("D");

// ---- 3. 并发限制器 asyncPool ⭐ ----
console.log("\\n===== 3. 并发限制器 asyncPool =====");

// 核心实现：限制同时进行的异步任务数量，滑动窗口模式
async function asyncPool(limit, items, iteratorFn) {
  var results = new Array(items.length);
  var executing = []; // 正在执行的 Promise 包装

  for (var i = 0; i < items.length; i++) {
    // 创建任务
    (function (index) {
      var item = items[index];
      var p = Promise.resolve().then(function () {
        return iteratorFn(item, index);
      });
      results[index] = p;

      // 如果任务数小于限制数，不需要控制
      if (limit <= items.length) {
        // 给每个 Promise 附加清理逻辑
        var e = p.then(function () {
          var idx = executing.indexOf(e);
          if (idx > -1) executing.splice(idx, 1);
        });
        executing.push(e);

        // 达到并发上限时，等一个完成
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    })(i);
  }

  // 等待所有任务完成
  await Promise.all(executing);
  return Promise.all(results);
}

// 测试 asyncPool：6 个任务，限制 2 个并发
var tasks = [
  { id: 1, delay: 50 },
  { id: 2, delay: 30 },
  { id: 3, delay: 80 },
  { id: 4, delay: 20 },
  { id: 5, delay: 60 },
  { id: 6, delay: 10 },
];

var activeCount = 0;
var maxActive = 0;

console.log("  启动 6 个任务，限制 2 个并发（滑动窗口模式）...");

asyncPool(2, tasks, function (task, index) {
  activeCount++;
  if (activeCount > maxActive) maxActive = activeCount;
  console.log("    [" + index + "] 任务 " + task.id + " 开始（当前并发: " + activeCount + "）");
  return new Promise(function (resolve) {
    setTimeout(function () {
      activeCount--;
      console.log("    [" + index + "] 任务 " + task.id + " 完成");
      resolve("结果" + task.id);
    }, task.delay);
  });
}).then(function (results) {
  console.log("  asyncPool 完成！结果:", results);
  console.log("  最大并发数:", maxActive, "（限制为 2）");
});

// ---- 4. 固定批次 vs 滑动窗口对比 ----
console.log("\\n===== 4. 固定批次 vs 滑动窗口 =====");

// 固定批次：一批全部完成再开始下一批
async function batchProcess(items, batchSize, processor) {
  var results = [];
  for (var i = 0; i < items.length; i += batchSize) {
    var batch = items.slice(i, i + batchSize);
    var batchResults = await Promise.all(batch.map(function (item) {
      return processor(item);
    }));
    results = results.concat(batchResults);
    console.log("  批次 " + Math.floor(i / batchSize + 1) + " 完成");
  }
  return results;
}

// 演示：对比固定批次和滑动窗口的效率
var batchTasks = [
  { id: 1, delay: 100 }, // 慢任务
  { id: 2, delay: 10 },
  { id: 3, delay: 10 },
  { id: 4, delay: 10 },
];

console.log("  固定批次（batchSize=2）: 第一组[慢任务+快任务]必须等慢任务完成");
console.log("  滑动窗口（limit=2）: 快任务完成后立即启动下一个");

// ---- 5. 带超时的并发控制 ----
console.log("\\n===== 5. 带超时的并发控制 =====");

// 给任务添加超时控制
function withTimeout(promise, ms) {
  var timeout = new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error("任务超时（" + ms + "ms）"));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

// 并发限制器 + 超时
async function asyncPoolWithTimeout(limit, items, iteratorFn, timeoutMs) {
  var results = [];
  var executing = [];

  for (var i = 0; i < items.length; i++) {
    (function (index) {
      var item = items[index];
      var p = Promise.resolve().then(function () {
        // 给每个任务加上超时控制
        return withTimeout(iteratorFn(item, index), timeoutMs);
      });
      results.push(p);

      if (limit <= items.length) {
        var e = p.catch(function () {}).then(function () {
          var idx = executing.indexOf(e);
          if (idx > -1) executing.splice(idx, 1);
        });
        executing.push(e);

        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    })(i);
  }

  await Promise.all(executing);
  return Promise.allSettled(results); // 用 allSettled 收集所有结果
}

var timeoutTasks = [
  { id: 1, delay: 20 },
  { id: 2, delay: 80 }, // 这个会超时
  { id: 3, delay: 20 },
];

console.log("  启动 3 个任务，限制 2 并发，超时 40ms...");

asyncPoolWithTimeout(2, timeoutTasks, function (task, index) {
  console.log("    任务 " + task.id + " 开始（" + task.delay + "ms）");
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("结果" + task.id);
    }, task.delay);
  });
}, 40).then(function (results) {
  results.forEach(function (r, i) {
    if (r.status === "fulfilled") {
      console.log("    任务 " + (i + 1) + ": ✓ 成功 →", r.value);
    } else {
      console.log("    任务 " + (i + 1) + ": ✗ " + r.reason.message);
    }
  });
});

// ---- 6. 带重试的并发控制 ----
console.log("\\n===== 6. 带重试的并发控制 =====");

// 重试函数
async function retry(fn, maxRetries, delayMs) {
  var lastError;
  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.log("    第 " + attempt + " 次尝试失败: " + err.message);
      if (attempt < maxRetries) {
        await new Promise(function (r) { setTimeout(r, delayMs); });
      }
    }
  }
  throw lastError;
}

// 不稳定任务（前几次失败，最后成功）
var unstableCount = {};
function unstableTask(id) {
  return function () {
    unstableCount[id] = (unstableCount[id] || 0) + 1;
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (unstableCount[id] < 3) {
          reject(new Error("任务 " + id + " 第 " + unstableCount[id] + " 次失败"));
        } else {
          resolve("任务 " + id + " 第 " + unstableCount[id] + " 次成功");
        }
      }, 10);
    });
  };
}

console.log("  执行不稳定任务（最多重试 3 次）...");

retry(unstableTask("X"), 3, 10)
  .then(function (r) { console.log("  重试成功:", r); })
  .catch(function (e) { console.log("  重试全部失败:", e.message); });

// ---- 7. 综合实战：批量数据处理 ----
console.log("\\n===== 7. 综合实战：批量数据处理 =====");

// 模拟一个完整的批量数据处理场景
// 场景：处理 10 个数据项，限制 3 个并发，单个超时 60ms，失败重试 2 次
async function batchProcessData(items) {
  var results = {
    success: [],
    failed: [],
    total: items.length,
    startTime: Date.now(),
  };

  var executing = [];
  var limit = 3;

  for (var i = 0; i < items.length; i++) {
    (function (index) {
      var item = items[index];

      var p = (async function () {
        // 重试逻辑
        var lastError;
        for (var attempt = 1; attempt <= 2; attempt++) {
          try {
            // 超时控制
            var taskPromise = new Promise(function (resolve) {
              var taskDelay = 10 + Math.random() * 50;
              setTimeout(function () {
                // 10% 概率失败
                if (Math.random() < 0.3) {
                  reject(new Error("处理失败"));
                } else {
                  resolve("处理结果: " + item);
                }
              }, taskDelay);
            });

            var timeoutPromise = new Promise(function (_, reject) {
              setTimeout(function () { reject(new Error("超时")); }, 60);
            });

            var result = await Promise.race([taskPromise, timeoutPromise]);
            results.success.push({ index: index, item: item, result: result });
            return;
          } catch (err) {
            lastError = err;
            if (attempt < 2) {
              await new Promise(function (r) { setTimeout(r, 10); });
            }
          }
        }
        results.failed.push({ index: index, item: item, error: lastError.message });
      })();

      var e = p.catch(function () {}).then(function () {
        var idx = executing.indexOf(e);
        if (idx > -1) executing.splice(idx, 1);
      });
      executing.push(e);

      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    })(i);
  }

  await Promise.all(executing);
  results.elapsed = Date.now() - results.startTime;
  return results;
}

// 10 个数据项
var dataItems = [];
for (var i = 1; i <= 10; i++) {
  dataItems.push("数据项" + i);
}

console.log("  处理 " + dataItems.length + " 个数据项（限制 3 并发，60ms 超时，2 次重试）...");

batchProcessData(dataItems).then(function (results) {
  console.log("  批量处理完成！");
  console.log("    总数:", results.total);
  console.log("    成功:", results.success.length);
  console.log("    失败:", results.failed.length);
  if (results.failed.length > 0) {
    results.failed.forEach(function (f) {
      console.log("      ✗ " + f.item + ": " + f.error);
    });
  }
  console.log("    耗时:", results.elapsed + "ms");
});

console.log("\\n===== 并发控制演示结束 =====");
console.log("关键要点:");
console.log("  1. 并发 ≠ 并行，Node.js 通过事件循环实现高并发");
console.log("  2. 信号量是并发控制的基本原语");
console.log("  3. 滑动窗口比固定批次效率更高");
console.log("  4. 生产环境需要结合超时和重试机制");
console.log("  5. 用 Promise.allSettled 收集结果，避免丢失失败信息");`,
  },

  // =========================================================
  // 第六章：异步错误处理
  // =========================================================
  {
    id: "node-async-errors",
    group: "异步编程",
    icon: "🛡️",
    title: "异步错误处理",
    content: `## 异步错误处理

异步错误处理是 Node.js 开发中**最容易出问题**的环节。一个未被捕获的 Promise rejection 或异步回调中的异常，可能导致整个进程崩溃。本章将全面讲解异步环境下的错误处理策略。

### 异步错误的特殊性

#### 同步错误可以被 try/catch 捕获

\`\`\`javascript
try {
  throw new Error("同步错误");
} catch (err) {
  console.log("捕获:", err.message); // ✅ 能捕获
}
\`\`\`

#### 异步错误不能被 try/catch 捕获

\`\`\`javascript
// ❌ try/catch 捕获不到异步回调中的错误
try {
  setTimeout(() => {
    throw new Error("异步错误"); // 不会被下面的 catch 捕获！
  }, 100);
} catch (err) {
  console.log("捕获不到:", err.message);
}

// ❌ try/catch 捕获不到 Promise rejection
try {
  Promise.reject(new Error("Promise 错误"));
} catch (err) {
  console.log("捕获不到:", err.message);
}
\`\`\`

**原因**：当异步回调执行时，外层 try/catch 的代码早已执行完毕，调用栈已经不同了。

### 异步错误处理的三种方式

#### 1. 回调 Error-First

\`\`\`javascript
function readFile(path, callback) {
  fs.readFile(path, (err, data) => {
    if (err) return callback(err); // 传递错误
    callback(null, data);          // 传递结果
  });
}
\`\`\`

#### 2. Promise .catch()

\`\`\`javascript
fetchData()
  .then(data => processData(data))
  .then(result => console.log(result))
  .catch(err => console.error("出错:", err));
  // catch 捕获链中任何一步的错误
\`\`\`

#### 3. async/await + try/catch（推荐）

\`\`\`javascript
async function fetchData() {
  try {
    const data = await apiCall();
    return processData(data);
  } catch (err) {
    console.error("出错:", err);
    return null;
  }
}
\`\`\`

### 全局异常捕获（最后防线）

#### uncaughtException

当同步代码或异步回调中抛出未被捕获的异常时触发：

\`\`\`javascript
process.on("uncaughtException", (err, origin) => {
  console.error("未捕获异常:", err.message);
  console.error("来源:", origin);
  // 记录日志后必须退出！
  process.exit(1);
});
\`\`\`

> ⚠️ **绝对不要**在 uncaughtException 后继续运行。应用状态可能已损坏，应记录日志→优雅关闭→退出→由进程管理器重启。

#### unhandledRejection

当 Promise 被 reject 但没有 .catch() 时触发：

\`\`\`javascript
process.on("unhandledRejection", (reason, promise) => {
  console.error("未处理的 Promise 拒绝:", reason);
  // Node.js v15+ 默认会因此退出进程
});
\`\`\`

> 从 Node.js v15 起，未处理的 Promise 拒绝默认会导致进程退出。务必用 .catch() 处理所有 Promise。

### 错误包装与上下文

当错误从底层传递到上层时，每层都应该添加上下文信息，同时保留原始错误：

#### 使用 cause 属性（ES2022）

\`\`\`javascript
async function getUserData(userId) {
  try {
    const response = await fetch("/api/users/" + userId);
    return await response.json();
  } catch (err) {
    // 包装错误：添加上下文，保留原始错误
    throw new Error("获取用户 " + userId + " 失败", { cause: err });
  }
}

try {
  await getUserData(123);
} catch (err) {
  console.log(err.message);       // "获取用户 123 失败"
  console.log(err.cause.message); // 底层错误详情
}
\`\`\`

#### 自定义错误类

\`\`\`javascript
class ApiError extends Error {
  constructor(message, statusCode, cause) {
    super(message, { cause });
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

// 使用
throw new ApiError("请求失败", 500, originalError);
\`\`\`

### 防御性编程

#### 1. 总是处理 Promise 错误

\`\`\`javascript
// ❌ 危险：未处理的 rejection
promise.then(data => console.log(data));

// ✅ 总是加 .catch() 或 try/catch
promise
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

#### 2. 给 async 函数加 try/catch

\`\`\`javascript
async function handler() {
  try {
    await riskyOperation();
  } catch (err) {
    // 记录日志、返回默认值、或重新抛出
    logger.error(err);
    throw err; // 或 return defaultValue
  }
}
\`\`\`

#### 3. 区分操作错误和程序错误

| 类型 | 说明 | 处理方式 |
| --- | --- | --- |
| 操作错误 | 可预见的运行时错误 | 优雅处理，返回错误信息 |
| 程序错误 | 代码 bug | 修复代码，可让进程崩溃重启 |

#### 4. 不要吞掉错误

\`\`\`javascript
// ❌ 吞掉错误（最糟糕的做法）
try { riskyOperation(); } catch (e) {}

// ✅ 至少记录日志
try {
  riskyOperation();
} catch (err) {
  logger.error("操作失败", err);
  // 根据情况决定返回默认值或重新抛出
}
\`\`\`

### 异步错误处理最佳实践总结

1. **async/await + try/catch** 是现代 Node.js 的最佳选择
2. **Promise 链末尾总是加 .catch()**
3. **注册 uncaughtException 和 unhandledRejection 作为兜底**
4. **用 cause 属性保留错误链，不丢失上下文**
5. **区分操作错误和程序错误，采用不同策略**
6. **uncaughtException 后必须退出，不能继续运行**
7. **EventEmitter 必须监听 error 事件**
8. **错误信息要有足够的上下文，方便定位问题**

### 「底层原理」

#### V8 异常传播与调用栈机制

JavaScript 异常通过**调用栈展开（Stack Unwinding）**传播。当 \`throw\` 发生时，V8 从当前栈帧开始逐层向上查找 catch 块：

\`\`\`
  同步错误传播路径:
  ┌─────────────────────────────────────────────┐
  │                                             │
  │  调用栈:                                     │
  │  ┌──────────────┐                           │
  │  │ 顶层 try/catch│ ← 找到 catch，错误被捕获  │
  │  ├──────────────┤                           │
  │  │ functionC    │ ← 没有 catch，栈帧弹出     │
  │  ├──────────────┤                           │
  │  │ functionB    │ ← 没有 catch，栈帧弹出     │
  │  ├──────────────┤                           │
  │  │ functionA    │ ← throw new Error()        │
  │  └──────────────┘                           │
  │                                             │
  │  异步错误：调用栈已经不是 throw 时的栈了！    │
  │                                             │
  │  setTimeout 回调执行时的调用栈：              │
  │  ┌──────────────┐                           │
  │  │ Timer 回调   │ ← throw 发生在这里          │
  │  ├──────────────┤                           │
  │  │ 微任务/宏任务 │                           │
  │  │ 调度器       │ ← 没有 try/catch！         │
  │  └──────────────┘                           │
  │  原始调用者 functionA 早已返回，栈帧已销毁    │
  │  → 错误直接到 process.on('uncaughtException')│
  │                                             │
  └─────────────────────────────────────────────┘
\`\`\`

**这就是为什么异步 try/catch 失效**：当异步回调执行时，调用栈中只有事件循环调度器和回调函数本身，外层注册的 \`try\` 块对应的栈帧早已出栈。

#### Promise 异常捕获的内部机制

\`\`\`javascript
// Promise.reject 的传播路径
// 1. reject(reason) 设置 JSPromise 状态为 rejected
// 2. 沿 reaction 链表查找 onRejected 回调（.catch 或 .then 的第二个参数）
// 3. 找到 → 将回调加入微任务队列，错误被"消费"
// 4. 找不到 → 链末端仍为 rejected
//    → 微任务执行完后，V8 检测到未处理的 rejection
//    → 触发 process.on('unhandledRejection')

// 时序图：
// Promise.reject(err)
//     │
//     ↓ .then(a).then(b).catch(handler)
//     │
//     ↓ 沿链查找 onRejected
//     │ a 没有 → b 没有 → 找到 handler
//     │
//     ↓ microtask queue: handler(err)
//     │
//     ↓ 错误被处理，不触发 unhandledRejection
\`\`\`

#### async/await 错误捕获的 V8 变换

\`\`\`javascript
// async 函数中的 try/catch 为什么能捕获 await 的错误？
async function demo() {
  try {
    await riskyOp();
  } catch (err) {
    console.error(err);
  }
}

// V8 内部将 await 编译为（概念模型）:
// 1. riskyOp() 返回 Promise
// 2. 注册 .then(继续执行后续代码, 跳转到 catch 块)
// 3. Promise reject 时 → 调用 onRejected 回调 → 进入 catch 逻辑
// 本质上 await 就是 .then(resume, throwToCatch) 的语法糖
\`\`\`

#### unhandledRejection 的检测时机

\`\`\`
  unhandledRejection 检测时序:
  ─────────────────────────────────────────────
  微任务队列处理过程中，某个 rejected Promise
  的 microtask 执行完后：
    1. 检查该 Promise 是否有 onRejected 回调
    2. 检查该 Promise 的结果是否被后续 .then/.catch 消费
    3. 如果既没有 catch，也没有被 await
       → 在本轮事件循环结束（或 nextTick）时
       → 触发 unhandledRejection 事件

  注意：如果你在同一轮同步代码中给 Promise 加了 .catch()，
  即使 Promise 已经 reject，也不会触发 unhandledRejection：
  ─────────────────────────────────────────────
  const p = Promise.reject(new Error("test"));
  // p 当前是 rejected，暂无 catch
  // 但在当前同步 tick 内加上 .catch() 就没事
  p.catch(err => console.log("ok")); // 安全
\`\`\`

### 「常见陷阱」

#### 陷阱 1：空 catch 块吞掉错误

\`\`\`javascript
// ❌ 最危险的做法：完全吞掉错误
try {
  await riskyOperation();
} catch (e) {
  // 什么都不做！错误被吞，无法排查
}

// ❌ 只打日志不处理
try {
  await riskyOperation();
} catch (e) {
  console.log(e); // 用 console.log 不用 console.error
  // 没有恢复逻辑，没有重新抛出，没有降级
}

// ✅ 正确：至少记录错误上下文并做合理处理
try {
  await riskyOperation();
} catch (err) {
  logger.error({ err, operation: "riskyOperation" }, "操作失败");
  // 选择一种策略：
  // 1. 返回默认值：return defaultValue;
  // 2. 重新抛出：throw err;
  // 3. 包装后抛出：throw new Error("...", { cause: err });
}
\`\`\`

#### 陷阱 2：忘记处理 Promise.all 中的部分失败

\`\`\`javascript
// ❌ 一个失败导致所有结果丢失
try {
  const [user, posts, friends] = await Promise.all([
    fetchUser(),
    fetchPosts(), // 如果这个失败
    fetchFriends(),
  ]);
} catch (err) {
  // 其他两个成功的数据也丢了
  console.log("全部失败:", err); // 但其实只有一个失败
}

// ✅ 使用 allSettled 或对单个 Promise 加 catch
const results = await Promise.allSettled([
  fetchUser(),
  fetchPosts(),
  fetchFriends(),
]);
const user = results[0].status === "fulfilled" ? results[0].value : null;
// 或：
const [user, posts, friends] = await Promise.all([
  fetchUser().catch(e => null),
  fetchPosts().catch(e => []),
  fetchFriends().catch(e => []),
]);
\`\`\`

#### 陷阱 3：EventEmitter 不监听 error 事件

\`\`\`javascript
// ❌ EventEmitter 触发 error 但没有监听器 → 进程崩溃
const { EventEmitter } = require("events");
const emitter = new EventEmitter();
emitter.emit("error", new Error("出错了"));
// 抛出未捕获异常 → 进程退出！

// ✅ 始终监听 error 事件
const emitter = new EventEmitter();
emitter.on("error", (err) => {
  console.error("Emitter 错误:", err.message);
});
emitter.emit("error", new Error("出错了")); // 安全处理
\`\`\`

#### 陷阱 4：uncaughtException 后继续运行

\`\`\`javascript
// ❌ 危险：记录日志后继续运行，应用状态可能已损坏
process.on("uncaughtException", (err) => {
  console.error("未捕获异常:", err);
  // 没有退出！内存泄漏、状态不一致、连接池耗尽可能正在发生
});

// ✅ 正确：记录日志 → 优雅关闭 → 退出
process.on("uncaughtException", (err) => {
  console.error("未捕获异常，进程即将退出:", err);
  // 1. 停止接受新请求
  server.close(() => {
    // 2. 清理资源（关闭数据库连接等）
    db.end();
    // 3. 退出进程，让 PM2/systemd 重启
    process.exit(1);
  });
  // 强制退出超时保护
  setTimeout(() => process.exit(1), 3000).unref();
});
\`\`\`

#### 陷阱 5：丢失错误堆栈信息

\`\`\`javascript
// ❌ 错误对象被转成字符串，丢失堆栈
try {
  await riskyOp();
} catch (err) {
  throw err.message; // 抛出字符串！不是 Error 对象，堆栈丢失
}

// ❌ 创建新 Error 但不保留原始错误链
try {
  await dbQuery();
} catch (err) {
  throw new Error("查询失败"); // 丢失了原始错误的堆栈和信息
}

// ✅ 正确：使用 cause 属性保留错误链
try {
  await dbQuery();
} catch (err) {
  throw new Error("查询用户数据失败", { cause: err });
}
// 捕获后可以遍历 err.cause 获取完整错误链
\`\`\`

### 「性能提示」

#### 1. 避免在热路径中过度包装错误

\`\`\`javascript
// ❌ 频繁创建 Error 对象有性能开销（堆栈捕获成本较高）
function validateInput(data) {
  if (!data.id) throw new Error("id is required"); // 每次调用都捕获堆栈
  if (!data.name) throw new Error("name is required");
}

// ✅ 对于频繁调用的验证函数，使用轻量方式
function validateInput(data) {
  if (!data.id) return { error: "ID_REQUIRED" }; // 返回错误码，不 throw
  if (!data.name) return { error: "NAME_REQUIRED" };
  return { data };
}
// 只在真正的异常路径上 throw Error
\`\`\`

#### 2. 错误处理不要影响正常路径性能

\`\`\`javascript
// ✅ try/catch 在现代 V8 中几乎零开销（只要不进入 catch 块）
// 但 catch 块中的错误堆栈格式化成本高
// 所以：不要为了"方便"把不相关代码放进 try 块
async function handleRequest(req, res) {
  // ❌ 整个函数都在 try 里，范围太大
  try {
    const user = await getUser(req.query.id);
    const posts = await getPosts(user.id);
    // 这里的逻辑本身不应该出错，但也在 try 里
    const response = { user, posts, timestamp: Date.now() };
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ✅ 精确 try/catch 范围
async function handleRequest(req, res) {
  let user, posts;
  try {
    user = await getUser(req.query.id);
    posts = await getPosts(user.id);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  // 正常逻辑在 try 外，不需要异常处理开销
  const response = { user, posts, timestamp: Date.now() };
  res.json(response);
}
\`\`\`

#### 3. 全局错误处理器中异步日志要加保护

\`\`\`javascript
// ✅ 全局处理器中避免再次抛异常（否则会无限循环）
process.on("unhandledRejection", async (reason) => {
  // ❌ 如果日志写入本身又出错，可能导致问题
  await logger.logError(reason); // 如果 logger 失败...

  // ✅ 同步记录或用 try/catch 包裹
  try {
    logger.error({ err: reason }, "Unhandled Rejection");
  } catch (logErr) {
    // 日志也失败时，用最原始的方式输出
    console.error("Failed to log:", logErr);
    console.error("Original error:", reason);
  }
  // 建议生产环境 unhandledRejection 也退出进程（和 uncaughtException 一致）
  // process.exit(1);
});
\`\`\`

下面这段代码演示了异步错误处理的所有核心模式。`,
    code: `// ============================================================
// 第六章代码演示：异步错误处理
// ============================================================

// ---- 1. 同步 vs 异步错误捕获 ----
console.log("===== 1. 同步 vs 异步错误捕获 =====");

// 同步错误：try/catch 可以捕获
try {
  throw new Error("同步错误");
} catch (err) {
  console.log("  ✅ try/catch 捕获同步错误:", err.message);
}

// 异步错误：try/catch 捕获不到
try {
  setTimeout(function () {
    // 这里的错误不会被外层 try/catch 捕获！
    // 因为在 setTimeout 回调执行时，try/catch 早已结束
    console.log("  异步回调中的错误（不会被外层 try/catch 捕获）");
  }, 10);
} catch (err) {
  console.log("  这里不会执行");
}

// Promise 错误：try/catch 也捕获不到
try {
  Promise.reject(new Error("Promise 错误"));
} catch (err) {
  console.log("  这里也不会执行（try/catch 捕获不到 Promise rejection）");
}

// 正确处理：用 .catch()
Promise.reject(new Error("Promise 错误")).catch(function (err) {
  console.log("  ✅ .catch() 捕获 Promise 错误:", err.message);
});

// ---- 2. 回调 Error-First 错误处理 ----
console.log("\\n===== 2. 回调 Error-First 错误处理 =====");

// 遵循 error-first 约定的异步函数
function readFileCallback(filename, callback) {
  setTimeout(function () {
    if (!filename) {
      // 第一个参数是错误
      callback(new Error("文件名不能为空"), null);
    } else if (filename === "error") {
      callback(new Error("文件不存在: " + filename), null);
    } else {
      // 第一个参数是 null（无错误），第二个是结果
      callback(null, "文件[" + filename + "]的内容");
    }
  }, 10);
}

// 正常情况
readFileCallback("data.txt", function (err, data) {
  if (err) {
    console.log("  错误:", err.message);
    return;
  }
  console.log("  成功:", data);
});

// 错误情况
readFileCallback("error", function (err, data) {
  if (err) {
    console.log("  错误:", err.message);
    return;
  }
  console.log("  不会执行");
});

// ---- 3. Promise 错误处理 ----
console.log("\\n===== 3. Promise 错误处理 =====");

// 模拟 Promise 异步操作
function fetchData(shouldFail) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shouldFail) {
        reject(new Error("数据获取失败"));
      } else {
        resolve({ id: 1, name: "测试数据" });
      }
    }, 10);
  });
}

// 用 .catch() 处理错误
fetchData(false)
  .then(function (data) {
    console.log("  Promise 成功:", data.name);
    return fetchData(true); // 下一步会失败
  })
  .then(function (data) {
    console.log("  不会执行");
  })
  .catch(function (err) {
    console.log("  Promise .catch():", err.message);
  })
  .finally(function () {
    console.log("  Promise .finally(): 无论如何都执行");
  });

// 错误冒泡：跳过中间 then，直接到 catch
Promise.resolve()
  .then(function () { throw new Error("步骤1 出错"); })
  .then(function () { console.log("  跳过"); })
  .then(function () { console.log("  跳过"); })
  .catch(function (err) { console.log("  错误冒泡到 catch:", err.message); });

// ---- 4. async/await + try/catch（推荐） ----
console.log("\\n===== 4. async/await + try/catch =====");

async function fetchUserData(userId) {
  try {
    console.log("  获取用户 " + userId + " 的数据...");
    // 模拟 API 调用
    var data = await fetchData(userId === "error");
    console.log("  用户数据:", data.name);
    return data;
  } catch (err) {
    console.log("  捕获错误:", err.message);
    return null; // 返回默认值
  }
}

fetchUserData("123");
fetchUserData("error");

// 细粒度错误处理
async function fineGrainedHandler() {
  var user, orders;

  // 获取用户：失败则停止
  try {
    user = await fetchData(false);
    console.log("  用户获取成功");
  } catch (err) {
    console.log("  用户获取失败，停止处理:", err.message);
    return;
  }

  // 获取订单：失败不影响，用空数组
  try {
    orders = await fetchData(true); // 会失败
  } catch (err) {
    console.log("  订单获取失败，使用空数组:", err.message);
    orders = [];
  }

  console.log("  最终结果: user=" + user.name + ", orders=" + orders.length);
}

fineGrainedHandler();

// ---- 5. 全局错误捕获 ----
console.log("\\n===== 5. 全局错误捕获 =====");

// uncaughtException：捕获未被 try/catch 捕获的同步异常
// 这是最后一道防线，触发后应该记录日志并退出
process.on("uncaughtException", function (err) {
  console.log("  [uncaughtException] 未捕获异常:", err.message);
  console.log("  [uncaughtException] 生产环境应记录日志后退出");
});

// unhandledRejection：捕获未被 .catch() 处理的 Promise rejection
process.on("unhandledRejection", function (reason) {
  console.log("  [unhandledRejection] 未处理的 Promise 拒绝:", reason.message);
  console.log("  [unhandledRejection] Node.js v15+ 默认会因此退出进程");
});

// 模拟触发 uncaughtException（用 process.emit 安全触发）
setImmediate(function () {
  process.emit("uncaughtException", new Error("模拟未捕获异常"));
});

// 模拟触发 unhandledRejection
var demoReason = new Error("模拟未处理的 Promise 拒绝");
process.emit("unhandledRejection", demoReason);
Promise.reject(demoReason).catch(function () {}); // 接住避免宿主崩溃

console.log("  已注册全局错误处理器");

// ---- 6. 错误包装与 cause 链 ----
console.log("\\n===== 6. 错误包装与 cause 链 =====");

// 底层函数：数据库操作
async function databaseQuery() {
  throw new Error("ECONNREFUSED: 数据库连接被拒绝");
}

// 中层函数：数据访问层
async function dataAccessLayer() {
  try {
    return await databaseQuery();
  } catch (err) {
    // 包装错误，添加上下文，保留原始错误链
    throw new Error("查询用户数据失败", { cause: err });
  }
}

// 顶层函数：业务逻辑层
async function businessLogic() {
  try {
    return await dataAccessLayer();
  } catch (err) {
    // 再次包装，添加业务上下文
    throw new Error("获取用户主页数据失败", { cause: err });
  }
}

// 最终捕获
(async function () {
  try {
    await businessLogic();
  } catch (err) {
    console.log("  顶层错误:", err.message);
    console.log("  中层错误:", err.cause.message);
    console.log("  底层错误:", err.cause.cause.message);

    // 遍历完整错误链
    console.log("  完整错误链:");
    var current = err;
    var level = 0;
    while (current) {
      console.log("    L" + level + ":", current.message);
      current = current.cause;
      level++;
    }
  }
})();

// ---- 7. 自定义错误类 ----
console.log("\\n===== 7. 自定义错误类 =====");

// 业务校验错误
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = "VALIDATION_ERROR";
  }
}

// 资源未找到错误
class NotFoundError extends Error {
  constructor(resource, id) {
    super(resource + " 不存在: " + id);
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
    this.code = "NOT_FOUND";
  }
}

// 数据库错误
class DatabaseError extends Error {
  constructor(message, query, cause) {
    super(message, { cause: cause });
    this.name = "DatabaseError";
    this.query = query;
    this.code = "DB_ERROR";
  }
}

// 使用自定义错误
function findUser(id) {
  if (id < 0) {
    throw new ValidationError("用户 ID 不能为负数", "id");
  }
  if (id > 1000) {
    throw new NotFoundError("用户", id);
  }
  return { id: id, name: "用户" + id };
}

// 测试各种错误类型
[42, -1, 9999].forEach(function (id) {
  try {
    var user = findUser(id);
    console.log("  ✓ 查找 " + id + ": " + user.name);
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log("  ✗ 校验错误: " + err.message + " (字段: " + err.field + ")");
    } else if (err instanceof NotFoundError) {
      console.log("  ✗ 未找到: " + err.message);
    } else {
      console.log("  ✗ 未知错误: " + err.message);
    }
  }
});

// ---- 8. EventEmitter 错误处理 ----
console.log("\\n===== 8. EventEmitter 错误处理 =====");

var EventEmitter = require("events").EventEmitter;
var emitter = new EventEmitter();

// 重要：必须注册 error 事件监听器
// 如果 EventEmitter 触发 error 事件但没有监听器，Node.js 会抛出异常
emitter.on("error", function (err) {
  console.log("  [emitter] 捕获 error 事件:", err.message);
});

emitter.on("data", function (data) {
  console.log("  [emitter] 收到数据:", data);
});

// 正常事件
emitter.emit("data", "hello");

// 错误事件（有监听器，安全）
emitter.emit("error", new Error("处理数据时出错"));

// ---- 9. 防御性编程实践 ----
console.log("\\n===== 9. 防御性编程实践 =====");

// 为 async 函数创建安全的包装器（自动捕获错误）
function safeAsync(fn) {
  return function () {
    var args = arguments;
    return Promise.resolve().then(function () {
      return fn.apply(null, args);
    }).catch(function (err) {
      console.error("  [safeAsync] 捕获异步错误:", err.message);
      return null; // 返回安全默认值
    });
  };
}

// 不安全的函数
async function riskyOperation(shouldFail) {
  if (shouldFail) {
    throw new Error("操作失败");
  }
  await new Promise(function (r) { setTimeout(r, 10); });
  return "操作成功";
}

// 包装为安全函数
var safeOperation = safeAsync(riskyOperation);

safeOperation(false).then(function (r) {
  console.log("  安全函数成功:", r);
});

safeOperation(true).then(function (r) {
  console.log("  安全函数失败:", r, "(返回 null，不会崩溃)");
});

// ---- 10. 异步错误处理最佳实践总结 ----
console.log("\\n===== 10. 异步错误处理最佳实践 =====");
console.log("  1. 同步错误用 try/catch，异步错误用 .catch() 或 async/await + try/catch");
console.log("  2. Promise 链末尾总是加 .catch()");
console.log("  3. 注册 uncaughtException 和 unhandledRejection 作为兜底");
console.log("  4. uncaughtException 后必须退出，不能继续运行");
console.log("  5. 用 cause 属性保留错误链");
console.log("  6. 使用自定义错误类，用 instanceof 区分错误类型");
console.log("  7. EventEmitter 必须监听 error 事件");
console.log("  8. 不要吞掉错误（catch (e) {} 是反模式）");
console.log("  9. 错误信息要有足够的上下文");
console.log("  10. 区分操作错误（可恢复）和程序错误（应修复）");

console.log("\\n===== 异步错误处理演示结束 =====");`,
  },
];