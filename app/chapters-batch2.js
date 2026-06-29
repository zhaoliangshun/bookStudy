// =============================================================
// Node.js 交互式教程 —— 第二批章节（核心基础组，共 8 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：全局对象与内置常量
  // =========================================================
  {
    id: "node-globals",
    icon: "🌐",
    group: "核心基础",
    title: "全局对象与内置常量",
    content: `## 全局对象与内置常量

Node.js 启动时会自动注入一系列**全局对象**和**内置常量**。它们是无需 \`require\` 即可在任何模块中直接使用的核心 API。理解这些全局变量，是写出高效 Node.js 代码的基础。

### globalThis 与 global

在浏览器中，全局作用域是 \`window\`；在 Node.js 中，全局作用域是 \`global\`。而 \`globalThis\` 是 ES2020 引入的标准全局对象，在浏览器、Node.js 和 Web Worker 中都能统一访问全局作用域。

\`\`\`javascript
// 以下三者在 Node.js 模块顶层等价
globalThis === global; // true
globalThis === this;   // false（模块顶层 this 不是 global）
\`\`\`

> 注意：在 Node.js 模块中，顶层的 \`this\` 指向 \`module.exports\`，而不是 \`global\`。这与浏览器行为不同。

### __dirname 与 __filename

这两个是每个模块中自动注入的变量（不是 global 的属性）：

| 变量 | 含义 | 示例 |
| --- | --- | --- |
| \`__dirname\` | 当前模块所在目录的**绝对路径** | \`/home/user/project/src\` |
| \`__filename\` | 当前模块文件的**绝对路径**（含文件名） | \`/home/user/project/src/index.js\` |

\`\`\`javascript
console.log(__dirname);  // 当前文件所在目录
console.log(__filename); // 当前文件的完整路径
\`\`\`

> 在 ESM 模块中，\`__dirname\` 和 \`__filename\` 不可用，需要用 \`import.meta.url\` 配合 \`fileURLToPath\` 替代。

### process 全局对象

\`process\` 是 Node.js 中最重要的全局对象，提供了与当前进程交互的能力。它包含了环境变量、命令行参数、标准输入输出、进程信息等。详见"进程对象"章节。

### Buffer 全局类

\`Buffer\` 是处理二进制数据的全局类。它是 Node.js 特有的，在浏览器中不可用。详见"Buffer 缓冲区"章节。

### console 全局对象

\`console\` 提供了类似浏览器的控制台输出功能：

| 方法 | 说明 |
| --- | --- |
| \`console.log()\` | 标准输出（带换行） |
| \`console.info()\` | 信息输出（同 log） |
| \`console.warn()\` | 警告输出（输出到 stderr） |
| \`console.error()\` | 错误输出（输出到 stderr） |
| \`console.debug()\` | 调试输出（同 log） |
| \`console.table()\` | 以表格形式打印数据 |
| \`console.dir()\` | 打印对象结构 |
| \`console.trace()\` | 打印调用栈 |
| \`console.time()\` / \`console.timeEnd()\` | 计时器（沙箱可能不支持） |
| \`console.assert()\` | 断言输出 |

### 定时器函数

Node.js 提供与浏览器兼容的定时器函数：

| 函数 | 说明 | 清除函数 |
| --- | --- | --- |
| \`setTimeout(cb, delay)\` | 延迟执行一次 | \`clearTimeout\` |
| \`setInterval(cb, delay)\` | 每隔 delay 重复执行 | \`clearInterval\` |
| \`setImmediate(cb)\` | 在事件循环的下一个迭代立即执行 | \`clearImmediate\` |

#### setImmediate vs setTimeout(fn, 0)

\`setImmediate\` 和 \`setTimeout(fn, 0)\` 都用于延迟执行，但执行时机不同：

- \`setImmediate\`：在当前事件循环迭代的**check 阶段**执行
- \`setTimeout(fn, 0)\`：在**timers 阶段**执行（受系统调度影响，实际延迟可能 > 1ms）

\`\`\`javascript
setImmediate(() => console.log("setImmediate"));
setTimeout(() => console.log("setTimeout"), 0);
// 输出顺序取决于具体上下文，在 I/O 回调中 setImmediate 总是先执行
\`\`\`

### URL 和 URLSearchParams

这两个是 WHATWG URL 标准的全局类，无需 \`require('url')\` 即可使用。详见"URL 解析与构造"章节。

### TextEncoder / TextDecoder

这两个是 WHATWG Encoding 标准的全局类，用于字符串和二进制数据的编解码：

\`\`\`javascript
// 字符串 → Uint8Array
const encoder = new TextEncoder();
const bytes = encoder.encode("你好");

// Uint8Array → 字符串
const decoder = new TextDecoder();
const text = decoder.decode(bytes);
\`\`\`

### performance

\`performance\` 是 Web Performance API 的 Node.js 实现，用于高精度时间测量（纳秒级）：

\`\`\`javascript
const start = performance.now();
// 执行一些操作
const end = performance.now();
console.log("耗时:", (end - start).toFixed(3), "ms");
\`\`\`

### AbortController

\`AbortController\` 用于取消异步操作，常用于 fetch 请求取消、流取消等场景：

\`\`\`javascript
const controller = new AbortController();
const signal = controller.signal;

// 5 秒后取消
setTimeout(() => controller.abort(), 5000);

// 在支持 signal 的 API 中使用
fetch(url, { signal });
\`\`\`

### 其他全局变量

| 全局变量 | 说明 |
| --- | --- |
| \`require\` | 模块加载函数 |
| \`module\` | 当前模块对象 |
| \`exports\` | \`module.exports\` 的快捷引用 |
| \`Promise\` | Promise 构造函数 |

下面这段代码演示了常用全局对象的用法。`,
    code: `// ============================================================
// 第一章代码演示：全局对象与内置常量
// ============================================================

// ---- 1. globalThis 与 global ----
console.log("===== 1. globalThis 与 global =====");
// globalThis 是 ES2020 的标准全局对象，跨环境统一
console.log("globalThis === global:", globalThis === global);
// 检测 global 上的一些常用属性
console.log("global 上有 console:", "console" in global);
console.log("global 上有 process:", "process" in global);
console.log("global 上有 Buffer:", "Buffer" in global);

// ---- 2. __dirname 与 __filename ----
console.log("\\n===== 2. __dirname 与 __filename =====");
// __dirname：当前文件所在目录的绝对路径
console.log("__dirname:", __dirname);
// __filename：当前文件的完整绝对路径
console.log("__filename:", __filename);
// 用 path 模块提取文件名和扩展名
var path = require("path");
console.log("文件名:", path.basename(__filename));
console.log("扩展名:", path.extname(__filename));
console.log("所在目录:", path.dirname(__filename));

// ---- 3. console 的各种方法 ----
console.log("\\n===== 3. console 方法 =====");
// console.log：标准输出
console.log("  log: 普通日志输出");
// console.info：同 log
console.info("  info: 信息输出");
// console.warn：警告输出（到 stderr）
console.warn("  warn: 警告信息");
// console.error：错误输出（到 stderr）
console.error("  error: 错误信息");
// console.debug：调试输出
console.debug("  debug: 调试信息");
// console.table：表格形式打印数组
var users = [
  { name: "张三", age: 25, city: "北京" },
  { name: "李四", age: 30, city: "上海" },
  { name: "王五", age: 28, city: "深圳" },
];
console.log("\\n  console.table 示例:");
console.table(users);
// console.dir：打印对象结构
console.log("\\n  console.dir 示例:");
console.dir({ name: "test", nested: { a: 1, b: 2 } }, { depth: 2 });
// console.trace：打印调用栈
console.log("\\n  console.trace 示例:");
function innerFunction() {
  console.trace("  调用栈追踪");
}
function outerFunction() {
  innerFunction();
}
outerFunction();

// ---- 4. 定时器函数 ----
console.log("\\n===== 4. 定时器 setTimeout / setInterval / setImmediate =====");
// setTimeout：延迟执行一次
var timeoutId = setTimeout(function () {
  console.log("  setTimeout: 延迟 50ms 执行");
}, 50);
// clearTimeout：取消定时器
clearTimeout(timeoutId);
console.log("  setTimeout 已被取消，不会执行");

// setInterval：周期性执行
var counter = 0;
var intervalId = setInterval(function () {
  counter++;
  console.log("  setInterval 第 " + counter + " 次");
  if (counter >= 3) {
    clearInterval(intervalId);
    console.log("  setInterval 已清除");
  }
}, 20);

// setImmediate：在事件循环当前迭代完成后立即执行
setImmediate(function () {
  console.log("  setImmediate: 在当前事件循环迭代的 check 阶段执行");
});

// 演示 setTimeout(fn, 0) 与 setImmediate 的顺序
setTimeout(function () {
  console.log("  setTimeout(fn, 0): 在 timers 阶段执行");
}, 0);

// ---- 5. TextEncoder / TextDecoder ----
console.log("\\n===== 5. TextEncoder / TextDecoder =====");
// TextEncoder：将字符串编码为 Uint8Array（UTF-8）
var encoder = new TextEncoder();
var text = "Hello 你好 🎉";
var encoded = encoder.encode(text);
console.log("  原文:", text);
console.log("  编码后字节数:", encoded.length);
console.log("  Uint8Array:", encoded);

// TextDecoder：将 Uint8Array 解码为字符串
var decoder = new TextDecoder("utf-8");
var decoded = decoder.decode(encoded);
console.log("  解码后:", decoded);
console.log("  编解码一致:", text === decoded);

// 演示不同编码
var latin1Text = "Bonjour";
var latin1Encoded = encoder.encode(latin1Text);
console.log("  Latin1 文本 '" + latin1Text + "' 字节数:", latin1Encoded.length);

// ---- 6. performance 高精度计时 ----
console.log("\\n===== 6. performance 高精度计时 =====");
// performance.now() 返回毫秒级的高精度时间戳
var start = performance.now();
// 执行一些计算来模拟耗时操作
var sum = 0;
for (var i = 0; i < 1000000; i++) {
  sum += Math.sqrt(i);
}
var end = performance.now();
console.log("  100万次 sqrt 计算耗时:", (end - start).toFixed(3), "ms");

// 多次计时对比
var times = [];
for (var j = 0; j < 5; j++) {
  var t1 = performance.now();
  var s = 0;
  for (var k = 0; k < 100000; k++) {
    s += k;
  }
  var t2 = performance.now();
  times.push(parseFloat((t2 - t1).toFixed(3)));
}
console.log("  5次重复计时(ms):", times);

// ---- 7. AbortController 信号取消 ----
console.log("\\n===== 7. AbortController =====");
// AbortController 用于取消异步操作
var controller = new AbortController();
var signal = controller.signal;

// 监听 abort 事件
signal.addEventListener("abort", function () {
  console.log("  abort 事件触发：操作已被取消！");
});

// 检查 signal 状态
console.log("  取消前 aborted:", signal.aborted);
// 触发取消
controller.abort();
console.log("  取消后 aborted:", signal.aborted);
// 检查 reason
console.log("  取消原因:", signal.reason || "默认取消");

// 演示超时取消模式
var controller2 = new AbortController();
var signal2 = controller2.signal;
var timedOut = false;
// 模拟超时：150ms 后取消
var timeoutId2 = setTimeout(function () {
  timedOut = true;
  controller2.abort("操作超时");
}, 150);

// 在超时前检查并取消（模拟正常完成）
setTimeout(function () {
  if (!timedOut) {
    clearTimeout(timeoutId2);
    console.log("  操作在超时前正常完成");
  }
}, 50);

// 150ms 后检查
setTimeout(function () {
  if (signal2.aborted) {
    console.log("  超时取消已触发: " + signal2.reason);
  }
}, 200);

// ---- 8. require / module / exports ----
console.log("\\n===== 8. require / module / exports =====");
// require 是模块加载函数
console.log("  require 是一个函数:", typeof require === "function");
// module 是当前模块对象
console.log("  module.id:", module.id);
// exports 是 module.exports 的快捷引用
console.log("  exports === module.exports:", exports === module.exports);

// ---- 9. Promise 全局对象 ----
console.log("\\n===== 9. Promise 全局对象 =====");
// Promise 无需 require 即可使用
var promise = Promise.resolve("Hello Promise");
console.log("  Promise.resolve 类型:", typeof Promise.resolve);
// 使用 Promise
Promise.resolve("异步值").then(function (value) {
  console.log("  Promise 解析结果:", value);
});

// ---- 10. 总结：全局对象一览 ----
console.log("\\n===== 10. 全局对象总结 =====");
var globalObjects = [
  ["globalThis", typeof globalThis, "ES2020 标准全局对象"],
  ["global", typeof global, "Node.js 全局对象"],
  ["process", typeof process, "进程对象"],
  ["Buffer", typeof Buffer, "二进制缓冲区"],
  ["console", typeof console, "控制台输出"],
  ["setTimeout", typeof setTimeout, "延迟执行（一次性）"],
  ["setInterval", typeof setInterval, "周期性执行"],
  ["setImmediate", typeof setImmediate, "立即异步执行"],
  ["URL", typeof URL, "URL 解析（WHATWG）"],
  ["URLSearchParams", typeof URLSearchParams, "查询参数操作"],
  ["TextEncoder", typeof TextEncoder, "文本编码器"],
  ["TextDecoder", typeof TextDecoder, "文本解码器"],
  ["performance", typeof performance, "高精度性能计时"],
  ["AbortController", typeof AbortController, "取消异步操作"],
  ["Promise", typeof Promise, "Promise 异步编程"],
  ["require", typeof require, "模块加载函数"],
  ["module", typeof module, "当前模块对象"],
  ["exports", typeof exports, "导出快捷引用"],
];
console.table(globalObjects);`,
  },

  // =========================================================
  // 第二章：文件系统基础
  // =========================================================
  {
    id: "node-fs-basics",
    icon: "📁",
    group: "核心基础",
    title: "文件系统基础",
    content: `## 文件系统基础

\`fs\`（File System）模块是 Node.js 最核心的模块之一，提供了与文件系统交互的完整 API。无论是读取配置文件、写入日志、还是操作目录，都离不开 \`fs\` 模块。

### 三种 API 风格

Node.js 的 \`fs\` 模块提供了三种风格的 API：

| 风格 | 方式 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| **同步 (Sync)** | \`readFileSync\` | 阻塞当前线程，直接返回结果 | 脚本、初始化配置 |
| **回调 (Callback)** | \`readFile\` | 异步回调，不阻塞，错误优先 | 传统异步代码 |
| **Promise** | \`fs.promises.readFile\` | 返回 Promise，支持 async/await | 现代异步代码（推荐） |

#### 同步 API 详解

同步 API 以 \`Sync\` 结尾，会阻塞事件循环直到操作完成。在初始化阶段（如读取配置文件）使用是合适的，但**不要在请求处理中使用同步 API**，否则会阻塞所有请求。

\`\`\`javascript
const fs = require("fs");
const data = fs.readFileSync("/path/to/file.txt", "utf8");
console.log(data);
\`\`\`

#### 回调 API 详解

回调 API 遵循 Node.js 的**错误优先**（Error-First）约定：第一个参数是 \`err\`（没有错误则为 \`null\`），第二个参数是结果。

\`\`\`javascript
fs.readFile("/path/to/file.txt", "utf8", (err, data) => {
  if (err) {
    console.error("读取失败:", err.message);
    return;
  }
  console.log(data);
});
\`\`\`

#### Promise API 详解

Promise API 通过 \`fs.promises\` 访问，支持 async/await：

\`\`\`javascript
const fs = require("fs/promises");
const data = await fs.readFile("/path/to/file.txt", "utf8");
console.log(data);
\`\`\`

### 读取文件：readFileSync

\`\`\`javascript
// 读取文本文件（指定编码）
const text = fs.readFileSync("file.txt", "utf8");

// 读取二进制文件（不指定编码，返回 Buffer）
const buffer = fs.readFileSync("image.png");
\`\`\`

#### 编码参数

| 编码 | 返回值类型 | 用途 |
| --- | --- | --- |
| \`"utf8"\` | 字符串 | 文本文件 |
| 不传 | Buffer | 二进制文件（图片、视频等） |
| \`"base64"\` | 字符串 | Base64 编码 |
| \`"hex"\` | 字符串 | 十六进制编码 |

### 写入文件：writeFileSync

\`\`\`javascript
// 写入字符串（覆盖已有内容）
fs.writeFileSync("file.txt", "Hello World", "utf8");

// 写入 Buffer
fs.writeFileSync("file.bin", Buffer.from([0x00, 0x01, 0x02]));
\`\`\`

> **注意**：\`writeFileSync\` 会**覆盖**已有文件内容。如果需要追加内容，使用 \`appendFileSync\`。

### 文件存在性检查：existsSync

\`\`\`javascript
if (fs.existsSync("file.txt")) {
  console.log("文件存在");
}
\`\`\`

> ⚠️ **反模式**：不要用 \`existsSync\` 检查文件是否存在后再操作，因为存在竞态条件（文件可能在检查和操作之间被删除）。正确做法是直接操作并处理错误。

### 文件信息：statSync

\`statSync\` 返回一个 \`fs.Stats\` 对象，包含文件的各种元信息：

\`\`\`javascript
const stats = fs.statSync("file.txt");
console.log(stats.size);       // 文件大小（字节）
console.log(stats.isFile());   // 是否是普通文件
console.log(stats.isDirectory()); // 是否是目录
console.log(stats.mtime);      // 最后修改时间
console.log(stats.birthtime);  // 创建时间
\`\`\`

#### fs.Stats 常用属性

| 属性 | 说明 |
| --- | --- |
| \`size\` | 文件大小（字节） |
| \`isFile()\` | 是否为普通文件 |
| \`isDirectory()\` | 是否为目录 |
| \`isSymbolicLink()\` | 是否为符号链接 |
| \`dev\` | 设备 ID |
| \`ino\` | inode 编号 |
| \`mode\` | 文件权限位 |
| \`mtime\` | 最后修改时间 |
| \`ctime\` | 最后状态改变时间 |
| \`birthtime\` | 创建时间 |

### 文件描述符

文件描述符是一个非负整数，代表打开的文件。在类 Unix 系统中，0、1、2 分别代表标准输入、标准输出和标准错误。

\`\`\`javascript
// 打开文件获取文件描述符
const fd = fs.openSync("file.txt", "r");
const buf = Buffer.alloc(1024);
fs.readSync(fd, buf, 0, buf.length, 0);
fs.closeSync(fd);
\`\`\`

### 文件模式

| 模式 | 说明 | 文件不存在时 |
| --- | --- | --- |
| \`"r"\` | 只读 | 报错 |
| \`"r+"\` | 读写 | 报错 |
| \`"w"\` | 只写（覆盖） | 创建 |
| \`"w+"\` | 读写（覆盖） | 创建 |
| \`"a"\` | 追加 | 创建 |
| \`"a+"\` | 追加+读 | 创建 |

### 目录操作

| 方法 | 说明 |
| --- | --- |
| \`mkdirSync(path)\` | 创建目录 |
| \`readdirSync(path)\` | 读取目录内容（返回文件名数组） |
| \`rmdirSync(path)\` | 删除空目录 |

\`\`\`javascript
// 创建目录（recursive 选项创建多级目录）
fs.mkdirSync("a/b/c", { recursive: true });

// 读取目录
const files = fs.readdirSync(".");
console.log(files); // ["file1.js", "file2.js", "dir1"]

// 删除目录
fs.rmdirSync("emptyDir");
\`\`\`

### 文件权限

在 Unix 系统中，文件权限用三位八进制数表示：所有者、组、其他人。每个位组合读(4)、写(2)、执行(1)：

| 权限 | 数值 | 含义 |
| --- | --- | --- |
| \`r\` | 4 | 读 |
| \`w\` | 2 | 写 |
| \`x\` | 1 | 执行 |
| \`rwx\` | 7 | 读写执行 |
| \`rw-\` | 6 | 读写 |
| \`r--\` | 4 | 只读 |

\`\`\`javascript
// 0644 = 所有者可读写，组和其他人只读
fs.writeFileSync("file.txt", "data", { mode: 0o644 });
\`\`\`

下面这段代码演示了 fs 模块同步方法的核心用法。`,
    code: `// ============================================================
// 第二章代码演示：文件系统基础（fs 同步 API）
// ============================================================
var fs = require("fs");
var path = require("path");

// ---- 1. 创建临时目录用于测试 ----
console.log("===== 1. 创建临时测试目录 =====");
var testDir = path.join(__dirname, "_fs_test_" + Date.now());
fs.mkdirSync(testDir, { recursive: true });
console.log("测试目录创建:", testDir);

// ---- 2. 写入文件：writeFileSync ----
console.log("\\n===== 2. writeFileSync 写入文件 =====");
// 写入文本文件
var textFile = path.join(testDir, "hello.txt");
fs.writeFileSync(textFile, "Hello, Node.js 文件系统！\\n这是第二行内容。\\n这是第三行。", "utf8");
console.log("文本文件写入:", textFile);

// 写入 JSON 文件
var jsonFile = path.join(testDir, "config.json");
var config = {
  app: "my-app",
  version: "1.0.0",
  debug: false,
  database: { host: "localhost", port: 5432 },
};
fs.writeFileSync(jsonFile, JSON.stringify(config, null, 2), "utf8");
console.log("JSON 文件写入:", jsonFile);

// ---- 3. existsSync 检查文件是否存在 ----
console.log("\\n===== 3. existsSync 检查文件 =====");
console.log("hello.txt 存在:", fs.existsSync(textFile));
console.log("nonexistent.txt 存在:", fs.existsSync(path.join(testDir, "nonexistent.txt")));

// ---- 4. statSync 获取文件信息 ----
console.log("\\n===== 4. statSync 获取文件信息 =====");
var stats = fs.statSync(textFile);
console.log("hello.txt 文件信息:");
console.log("  大小:", stats.size, "字节");
console.log("  是文件:", stats.isFile());
console.log("  是目录:", stats.isDirectory());
console.log("  是符号链接:", stats.isSymbolicLink());
console.log("  权限模式:", "0o" + (stats.mode & 0o777).toString(8));
console.log("  修改时间:", stats.mtime);
console.log("  创建时间:", stats.birthtime);

// 目录的 stat
var dirStats = fs.statSync(testDir);
console.log("\\n测试目录信息:");
console.log("  是文件:", dirStats.isFile());
console.log("  是目录:", dirStats.isDirectory());

// ---- 5. readFileSync 读取文件 ----
console.log("\\n===== 5. readFileSync 读取文件 =====");
// 读取文本文件（指定 utf8 编码）
var textContent = fs.readFileSync(textFile, "utf8");
console.log("hello.txt 内容:");
console.log(textContent);

// 读取 JSON 文件并解析
var jsonContent = fs.readFileSync(jsonFile, "utf8");
var parsedConfig = JSON.parse(jsonContent);
console.log("config.json 解析结果:");
console.log("  app:", parsedConfig.app);
console.log("  version:", parsedConfig.version);
console.log("  database.host:", parsedConfig.database.host);

// 不指定编码返回 Buffer
var bufferContent = fs.readFileSync(textFile);
console.log("\\nBuffer 形式读取:");
console.log("  类型:", bufferContent.constructor.name);
console.log("  字节数:", bufferContent.length);
console.log("  前20字节:", bufferContent.subarray(0, 20).toString());

// ---- 6. appendFileSync 追加内容 ----
console.log("\\n===== 6. appendFileSync 追加内容 =====");
fs.appendFileSync(textFile, "\\n这是追加的第四行内容。", "utf8");
fs.appendFileSync(textFile, "\\n这是追加的第五行内容。", "utf8");
var updatedContent = fs.readFileSync(textFile, "utf8");
console.log("追加后的内容:");
console.log(updatedContent);

// ---- 7. 文件描述符操作 ----
console.log("\\n===== 7. 文件描述符操作 =====");
// 用文件描述符打开文件进行读写
var fd = fs.openSync(textFile, "r");
console.log("文件描述符:", fd);
// 用 readSync 读取
var buf = Buffer.alloc(100);
var bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
console.log("通过 fd 读取了", bytesRead, "字节");
console.log("内容:", buf.subarray(0, bytesRead).toString());
// 关闭文件描述符
fs.closeSync(fd);
console.log("文件描述符已关闭");

// ---- 8. 目录操作 ----
console.log("\\n===== 8. 目录操作 =====");
// 创建子目录
var subDir = path.join(testDir, "subdir");
fs.mkdirSync(subDir, { recursive: true });
console.log("子目录创建:", subDir);

// 在子目录中创建文件
var subFile = path.join(subDir, "subfile.txt");
fs.writeFileSync(subFile, "子目录中的文件内容", "utf8");

// 读取目录内容
var entries = fs.readdirSync(testDir);
console.log("\\n测试目录内容:");
entries.forEach(function (entry) {
  var entryPath = path.join(testDir, entry);
  var entryStats = fs.statSync(entryPath);
  var type = entryStats.isDirectory() ? "[目录]" : "[文件]";
  console.log("  " + type + " " + entry + " (" + entryStats.size + " 字节)");
});

// 读取子目录
var subEntries = fs.readdirSync(subDir);
console.log("\\n子目录内容:", subEntries);

// ---- 9. 文件权限 ----
console.log("\\n===== 9. 文件权限 =====");
// 创建带特定权限的文件
var permFile = path.join(testDir, "permission.txt");
fs.writeFileSync(permFile, "测试权限", { mode: 0o644 }); // rw-r--r--
var permStats = fs.statSync(permFile);
console.log("permission.txt 权限:", "0o" + (permStats.mode & 0o777).toString(8));
console.log("  解释: 所有者rw-(6), 组r--(4), 其他人r--(4)");

// ---- 10. 文件复制与重命名 ----
console.log("\\n===== 10. 文件复制与重命名 =====");
// 复制文件（通过读写实现）
var copyFile = path.join(testDir, "hello_copy.txt");
var sourceContent = fs.readFileSync(textFile);
fs.writeFileSync(copyFile, sourceContent);
console.log("文件复制:", path.basename(textFile), "→", path.basename(copyFile));

// 重命名文件
var renamedFile = path.join(testDir, "hello_renamed.txt");
fs.renameSync(copyFile, renamedFile);
console.log("文件重命名: hello_copy.txt → hello_renamed.txt");
console.log("旧文件存在:", fs.existsSync(copyFile));
console.log("新文件存在:", fs.existsSync(renamedFile));

// ---- 11. 删除文件与目录 ----
console.log("\\n===== 11. 删除操作 =====");
// 删除文件
fs.unlinkSync(renamedFile);
console.log("已删除: hello_renamed.txt");
console.log("文件还存在:", fs.existsSync(renamedFile));

// 删除子目录中的文件后删除子目录
fs.unlinkSync(subFile);
fs.rmdirSync(subDir);
console.log("已删除子目录:", subDir);
console.log("子目录还存在:", fs.existsSync(subDir));

// ---- 12. 错误处理：优雅处理文件操作错误 ----
console.log("\\n===== 12. 错误处理 =====");
// try-catch 包装同步操作
try {
  var missingFile = path.join(testDir, "does_not_exist.txt");
  fs.readFileSync(missingFile, "utf8");
} catch (err) {
  console.log("  捕获错误:", err.code);
  console.log("  错误信息:", err.message);
}

// 安全的文件读取函数
function safeReadFile(filePath, defaultValue) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("  文件不存在，返回默认值");
      return defaultValue;
    }
    throw err; // 其他错误继续抛出
  }
}

var result = safeReadFile(path.join(testDir, "missing.txt"), "默认内容");
console.log("  safeReadFile 结果:", result);

// ---- 13. 清理测试目录 ----
console.log("\\n===== 13. 清理测试目录 =====");
try {
  // 清理所有测试文件
  var remainingFiles = fs.readdirSync(testDir);
  remainingFiles.forEach(function (file) {
    var filePath = path.join(testDir, file);
    var st = fs.statSync(filePath);
    if (st.isDirectory()) {
      // 清理子目录中的文件
      var subFiles = fs.readdirSync(filePath);
      subFiles.forEach(function (sf) {
        fs.unlinkSync(path.join(filePath, sf));
      });
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });
  fs.rmdirSync(testDir);
  console.log("测试目录已清理:", testDir);
  console.log("清理后目录存在:", fs.existsSync(testDir));
} catch (e) {
  console.log("清理时出错:", e.message);
}

console.log("\\n===== 文件系统基础演示结束 =====");`,
  },

  // =========================================================
  // 第三章：文件系统进阶
  // =========================================================
  {
    id: "node-fs-advanced",
    icon: "📂",
    group: "核心基础",
    title: "文件系统进阶",
    content: `## 文件系统进阶

在掌握了 \`fs\` 模块的基础读写操作后，本章深入讲解文件监视、递归目录遍历、符号链接、大文件处理等进阶话题。

### 文件监视：fs.watch 与 fs.watchFile

Node.js 提供了两种文件监视方式：

| 方法 | 原理 | 跨平台 | 性能 | 推荐 |
| --- | --- | --- | --- | --- |
| \`fs.watch\` | 操作系统原生事件（inotify/FSEvents） | 部分差异 | 高 | ✅ |
| \`fs.watchFile\` | 轮询（polling）检查文件 stat | 一致 | 低 | 网络文件系统 |

#### fs.watch 详解

\`fs.watch\` 利用操作系统底层文件变更通知机制，效率最高：

\`\`\`javascript
const watcher = fs.watch("file.txt", (eventType, filename) => {
  console.log(eventType, filename); // change / rename
});
// 停止监视
watcher.close();
\`\`\`

- \`eventType\`：\`"change"\`（内容变更）或 \`"rename"\`（重命名/删除）
- \`filename\`：触发事件的文件名（可能为 null，取决于平台）
- macOS 上 \`recursive\` 选项需要以目录名结尾

#### fs.watchFile 详解

\`fs.watchFile\` 通过定期检查文件 stat 来检测变化，每隔 \`interval\` 毫秒轮询一次：

\`\`\`javascript
fs.watchFile("file.txt", { interval: 1000 }, (curr, prev) => {
  console.log("mtime changed:", curr.mtime !== prev.mtime);
});
// 停止监视
fs.unwatchFile("file.txt");
\`\`\`

> 推荐使用 \`fs.watch\`，仅在网络文件系统等 \`fs.watch\` 不可用的场景使用 \`fs.watchFile\`。

### 递归目录遍历

递归遍历目录树是一个常见的需求，Node.js 没有内置的递归遍历函数，需要自己实现：

\`\`\`javascript
function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback); // 递归
    } else {
      callback(fullPath, entry);
    }
  }
}
\`\`\`

#### readdirSync 的 withFileTypes 选项

\`\`\`javascript
// 传统方式：返回文件名数组，需要额外 stat 判断类型
const names = fs.readdirSync(dir);
// 需要逐个 stat：fs.statSync(path.join(dir, name)).isDirectory()

// 推荐方式：withFileTypes 直接返回 Dirent 对象
const entries = fs.readdirSync(dir, { withFileTypes: true });
entries[0].isDirectory(); // 直接判断，无需额外 stat
\`\`\`

> \`withFileTypes: true\` 可以避免为每个条目调用一次 \`statSync\`，大幅提升性能。

### 文件复制

Node.js 提供了多种复制文件的方式：

| 方法 | 说明 | 适用场景 |
| --- | --- | --- |
| \`copyFileSync\` | 简单复制 | 小文件（一次性读取） |
| 流式复制 | 分块复制 | 大文件（内存友好） |
| 系统命令 | 调用 cp 命令 | 保留权限等元数据 |

\`\`\`javascript
// 简单复制
fs.copyFileSync("source.txt", "dest.txt");

// 流式复制（大文件推荐）
const rs = fs.createReadStream("source.mp4");
const ws = fs.createWriteStream("dest.mp4");
rs.pipe(ws);
\`\`\`

### 文件重命名/移动

\`\`\`javascript
// 重命名（同目录内）
fs.renameSync("old.txt", "new.txt");

// 移动（不同目录）
fs.renameSync("/tmp/file.txt", "/home/user/file.txt");
\`\`\`

> \`renameSync\` 可以用于移动文件，但不能跨文件系统。跨文件系统移动需要先复制再删除。

### 符号链接

符号链接（Symbolic Link）是文件系统中的一个特殊文件，指向另一个文件或目录：

\`\`\`javascript
// 创建符号链接
fs.symlinkSync("target.txt", "link.txt");

// 创建目录的符号链接
fs.symlinkSync("/usr/local/bin", "bin");

// 读取符号链接指向的目标
const target = fs.readlinkSync("link.txt");
console.log(target); // "target.txt"
\`\`\`

### 文件权限：chmod

\`\`\`javascript
// 修改文件权限
fs.chmodSync("script.sh", 0o755); // rwxr-xr-x
fs.chmodSync("config.json", 0o600); // rw-------
\`\`\`

### 大文件分片读写

处理大文件时，不能一次性读入内存，需要分片处理：

\`\`\`javascript
const fd = fs.openSync("large.bin", "r");
const chunkSize = 64 * 1024; // 64KB
const buf = Buffer.alloc(chunkSize);
let bytesRead;
let offset = 0;

while ((bytesRead = fs.readSync(fd, buf, 0, chunkSize, offset)) > 0) {
  // 处理 buf 中的 bytesRead 字节
  offset += bytesRead;
}
fs.closeSync(fd);
\`\`\`

### 临时文件与目录

Node.js 提供了 \`os.tmpdir()\` 获取系统临时目录，配合 \`fs.mkdtempSync\` 创建唯一临时目录：

\`\`\`javascript
const os = require("os");
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "myapp-"));
// 使用完毕后清理
// fs.rmSync(tmpDir, { recursive: true });
\`\`\`

> 临时文件应在使用后及时清理，避免占用磁盘空间。

下面这段代码实现递归目录遍历，过滤特定扩展名文件，统计文件数量和大小。`,
    code: `// ============================================================
// 第三章代码演示：文件系统进阶（递归遍历、监视、复制等）
// ============================================================
var fs = require("fs");
var path = require("path");
var os = require("os");

// ---- 1. 创建测试目录结构 ----
console.log("===== 1. 创建测试目录结构 =====");
var testRoot = path.join(os.tmpdir(), "_fs_advanced_" + Date.now());
fs.mkdirSync(testRoot, { recursive: true });

// 创建多层目录结构
var dirs = [
  path.join(testRoot, "src"),
  path.join(testRoot, "src", "components"),
  path.join(testRoot, "src", "utils"),
  path.join(testRoot, "docs"),
  path.join(testRoot, "test"),
  path.join(testRoot, "dist"),
  path.join(testRoot, "dist", "assets"),
];
dirs.forEach(function (dir) {
  fs.mkdirSync(dir, { recursive: true });
});

// 创建各类文件
var files = [
  { p: path.join(testRoot, "package.json"), c: '{"name":"test","version":"1.0.0"}' },
  { p: path.join(testRoot, "README.md"), c: "# 测试项目" },
  { p: path.join(testRoot, "src", "index.js"), c: 'console.log("main entry");' },
  { p: path.join(testRoot, "src", "components", "Header.js"), c: '// Header component' },
  { p: path.join(testRoot, "src", "components", "Footer.js"), c: '// Footer component' },
  { p: path.join(testRoot, "src", "utils", "helpers.js"), c: '// helpers' },
  { p: path.join(testRoot, "src", "utils", "format.js"), c: '// format utils' },
  { p: path.join(testRoot, "docs", "guide.md"), c: '## 使用指南' },
  { p: path.join(testRoot, "docs", "api.md"), c: '## API 文档' },
  { p: path.join(testRoot, "test", "index.test.js"), c: '// test index' },
  { p: path.join(testRoot, "dist", "bundle.js"), c: '// bundled' },
  { p: path.join(testRoot, "dist", "assets", "style.css"), c: 'body { margin: 0; }' },
  { p: path.join(testRoot, ".gitignore"), c: 'node_modules\\ndist' },
];
files.forEach(function (f) {
  fs.writeFileSync(f.p, f.c, "utf8");
});
console.log("测试目录创建完成:", testRoot);

// ---- 2. 递归目录遍历（核心函数）----
console.log("\\n===== 2. 递归目录遍历 =====");

function walkDir(dir, callback, depth) {
  depth = depth || 0;
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  var indent = "  ".repeat(depth);

  entries.forEach(function (entry) {
    var fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      console.log(indent + "[目录] " + entry.name + "/");
      callback(fullPath, entry, "directory");
      walkDir(fullPath, callback, depth + 1);
    } else if (entry.isFile()) {
      var stats = fs.statSync(fullPath);
      console.log(indent + "[文件] " + entry.name + " (" + stats.size + " 字节)");
      callback(fullPath, entry, "file", stats);
    } else if (entry.isSymbolicLink()) {
      console.log(indent + "[链接] " + entry.name + " → " + fs.readlinkSync(fullPath));
      callback(fullPath, entry, "symlink");
    }
  });
}

// 执行遍历
console.log("目录树结构:");
walkDir(testRoot, function () {
  // 回调中可以收集信息
});

// ---- 3. 过滤特定扩展名文件 ----
console.log("\\n===== 3. 按扩展名过滤文件 =====");

function findFilesByExt(dir, extensions) {
  var results = [];
  function search(currentDir) {
    var entries = fs.readdirSync(currentDir, { withFileTypes: true });
    entries.forEach(function (entry) {
      var fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        search(fullPath);
      } else if (entry.isFile()) {
        var ext = path.extname(entry.name).toLowerCase();
        if (extensions.indexOf(ext) !== -1) {
          results.push(fullPath);
        }
      }
    });
  }
  search(dir);
  return results;
}

var jsFiles = findFilesByExt(testRoot, [".js"]);
console.log(".js 文件（共 " + jsFiles.length + " 个）:");
jsFiles.forEach(function (f) {
  console.log("  " + path.relative(testRoot, f));
});

var mdFiles = findFilesByExt(testRoot, [".md"]);
console.log(".md 文件（共 " + mdFiles.length + " 个）:");
mdFiles.forEach(function (f) {
  console.log("  " + path.relative(testRoot, f));
});

// ---- 4. 统计文件数量和总大小 ----
console.log("\\n===== 4. 统计文件数量与大小 =====");

function analyzeDirectory(dir) {
  var stats = {
    totalFiles: 0,
    totalDirs: 0,
    totalSize: 0,
    byExtension: {},
  };

  function collect(currentDir) {
    var entries = fs.readdirSync(currentDir, { withFileTypes: true });
    entries.forEach(function (entry) {
      var fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stats.totalDirs++;
        collect(fullPath);
      } else if (entry.isFile()) {
        stats.totalFiles++;
        var fileStats = fs.statSync(fullPath);
        stats.totalSize += fileStats.size;
        var ext = path.extname(entry.name).toLowerCase() || "(无扩展名)";
        if (!stats.byExtension[ext]) {
          stats.byExtension[ext] = { count: 0, size: 0 };
        }
        stats.byExtension[ext].count++;
        stats.byExtension[ext].size += fileStats.size;
      }
    });
  }
  collect(dir);
  return stats;
}

var analysis = analyzeDirectory(testRoot);
console.log("目录分析结果:");
console.log("  文件总数:", analysis.totalFiles);
console.log("  目录总数:", analysis.totalDirs);
console.log("  总大小:", analysis.totalSize, "字节 (" + (analysis.totalSize / 1024).toFixed(2), "KB)");
console.log("\\n  按扩展名统计:");
Object.keys(analysis.byExtension).sort().forEach(function (ext) {
  var info = analysis.byExtension[ext];
  console.log("    " + ext + ": " + info.count + " 个文件, " + info.size + " 字节");
});

// ---- 5. 文件复制与重命名 ----
console.log("\\n===== 5. 文件复制与重命名 =====");
// copyFileSync 复制文件
var sourceFile = path.join(testRoot, "src", "index.js");
var destFile = path.join(testRoot, "src", "index_backup.js");
fs.copyFileSync(sourceFile, destFile);
console.log("复制:", path.relative(testRoot, sourceFile), "→", path.relative(testRoot, destFile));

// 验证复制
var sourceContent = fs.readFileSync(sourceFile, "utf8");
var destContent = fs.readFileSync(destFile, "utf8");
console.log("复制内容一致:", sourceContent === destContent);

// renameSync 重命名/移动
var moveDest = path.join(testRoot, "dist", "index_moved.js");
fs.renameSync(destFile, moveDest);
console.log("移动:", "index_backup.js", "→", path.relative(testRoot, moveDest));
console.log("旧位置还存在:", fs.existsSync(destFile));
console.log("新位置存在:", fs.existsSync(moveDest));

// 清理
fs.unlinkSync(moveDest);

// ---- 6. 符号链接 ----
console.log("\\n===== 6. 符号链接 =====");
var targetFile = path.join(testRoot, "README.md");
var linkFile = path.join(testRoot, "README_link.md");
try {
  fs.symlinkSync(targetFile, linkFile);
  console.log("创建符号链接: README_link.md → README.md");
  var linkTarget = fs.readlinkSync(linkFile);
  console.log("链接指向:", linkTarget);
  // 读取符号链接的内容（会跟随链接）
  var linkContent = fs.readFileSync(linkFile, "utf8");
  console.log("链接内容:", linkContent.trim());
  // 判断是否为符号链接
  var linkStats = fs.lstatSync(linkFile);
  console.log("是符号链接:", linkStats.isSymbolicLink());
  // 清理
  fs.unlinkSync(linkFile);
} catch (e) {
  console.log("符号链接出错:", e.message);
}

// ---- 7. 文件权限修改 ----
console.log("\\n===== 7. 文件权限修改 =====");
var permFile = path.join(testRoot, "perm_test.txt");
fs.writeFileSync(permFile, "权限测试", "utf8");
var origStats = fs.statSync(permFile);
console.log("原始权限:", "0o" + (origStats.mode & 0o777).toString(8));
// 修改为只读
fs.chmodSync(permFile, 0o444);
var newStats = fs.statSync(permFile);
console.log("修改后权限:", "0o" + (newStats.mode & 0o777).toString(8));
// 恢复权限以便后续清理
fs.chmodSync(permFile, 0o644);

// ---- 8. 大文件分片读写演示 ----
console.log("\\n===== 8. 大文件分片读写 =====");
// 创建一个稍大的文件用于演示
var largeFile = path.join(testRoot, "large_data.bin");
var writeFd = fs.openSync(largeFile, "w");
var chunkSize = 256;
var totalWritten = 0;
for (var i = 0; i < 10; i++) {
  var chunk = Buffer.alloc(chunkSize);
  // 填充一些数据
  for (var j = 0; j < chunkSize; j++) {
    chunk[j] = (i * chunkSize + j) % 256;
  }
  fs.writeSync(writeFd, chunk, 0, chunk.length);
  totalWritten += chunk.length;
}
fs.closeSync(writeFd);

// 分片读取
var readFd = fs.openSync(largeFile, "r");
var readBuf = Buffer.alloc(128); // 每次读 128 字节
var bytesRead;
var totalRead = 0;
var readOffset = 0;
console.log("分片读取大文件:");
while ((bytesRead = fs.readSync(readFd, readBuf, 0, readBuf.length, readOffset)) > 0) {
  console.log("  读取偏移=" + readOffset + ", 字节数=" + bytesRead);
  totalRead += bytesRead;
  readOffset += bytesRead;
}
fs.closeSync(readFd);
console.log("总读取字节:", totalRead);
console.log("文件大小:", fs.statSync(largeFile).size);

// ---- 9. 临时文件与目录 ----
console.log("\\n===== 9. 临时文件与目录 =====");
console.log("系统临时目录:", os.tmpdir());
// 创建临时目录
var tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "node-demo-"));
console.log("创建临时目录:", tempDir);
// 在临时目录中写入文件
fs.writeFileSync(path.join(tempDir, "temp.txt"), "临时数据", "utf8");
console.log("临时文件已创建");
// 清理
fs.unlinkSync(path.join(tempDir, "temp.txt"));
fs.rmdirSync(tempDir);
console.log("临时目录已清理:", !fs.existsSync(tempDir));

// ---- 10. 清理所有测试文件 ----
console.log("\\n===== 10. 清理测试目录 =====");
function removeDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(function (entry) {
    var fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeDirRecursive(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  });
  fs.rmdirSync(dir);
}
removeDirRecursive(testRoot);
console.log("测试目录已清理:", !fs.existsSync(testRoot));

console.log("\\n===== 文件系统进阶演示结束 =====");`,
  },

  // =========================================================
  // 第四章：路径处理
  // =========================================================
  {
    id: "node-path",
    icon: "🛤️",
    group: "核心基础",
    title: "路径处理",
    content: `## 路径处理

\`path\` 模块是 Node.js 中处理文件和目录路径的工具集。它提供了跨平台的路径操作能力，自动处理 Windows 的反斜杠（\`\\\`）和 POSIX 的正斜杠（\`/\`）差异。

### 为什么需要 path 模块？

在 Node.js 中拼接路径时，不能简单用字符串拼接：

\`\`\`javascript
// ❌ 错误方式：硬编码路径分隔符
const filePath = dir + "/" + file; // 在 Windows 上会出错

// ✅ 正确方式：使用 path.join
const filePath = path.join(dir, file);
\`\`\`

### 路径拼接：path.join

\`path.join\` 是使用最频繁的方法，用于将多个路径片段拼接成一个规范路径：

\`\`\`javascript
path.join("/a", "b", "c");     // "/a/b/c"
path.join("/a", "/b", "c");    // "/a/b/c"（多余的 / 被规范化）
path.join("/a", "..", "b");    // "/b"（.. 表示上级目录）
path.join("a", "b", "..", "c"); // "a/c"
\`\`\`

#### join 的行为规则

- 从右向左拼接，遇到第一个绝对路径片段时停止
- 自动处理多余的 \`/\`、\`.\` 和 \`..\`
- 使用平台特定的路径分隔符

### 路径解析：path.resolve

\`path.resolve\` 将路径片段解析为**绝对路径**。如果给定的路径片段不能组成绝对路径，会自动使用当前工作目录：

\`\`\`javascript
path.resolve("a", "b");      // "/current/working/dir/a/b"
path.resolve("/a", "b");     // "/a/b"（第一个是绝对路径）
path.resolve("/a", "/b");    // "/b"（最右边的绝对路径覆盖）
path.resolve("a", "..");     // "/current/working/dir"
\`\`\`

#### join vs resolve 的区别

| 方法 | 行为 | 相对路径处理 |
| --- | --- | --- |
| \`join\` | 直接拼接，规范化 | 保留相对路径 |
| \`resolve\` | 解析为绝对路径 | 自动补全为绝对路径 |

\`\`\`javascript
path.join("a", "b");    // "a/b"
path.resolve("a", "b"); // "/current/working/dir/a/b"
\`\`\`

### 路径提取

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| \`basename(p, [ext])\` | 获取文件名 | \`/a/b/c.txt\` → \`c.txt\` |
| \`dirname(p)\` | 获取目录名 | \`/a/b/c.txt\` → \`/a/b\` |
| \`extname(p)\` | 获取扩展名 | \`/a/b/c.txt\` → \`.txt\` |

\`\`\`javascript
const p = "/home/user/docs/file.txt";

path.basename(p);       // "file.txt"
path.basename(p, ".txt"); // "file"（去掉扩展名）
path.dirname(p);        // "/home/user/docs"
path.extname(p);        // ".txt"
\`\`\`

#### extname 的细节

\`\`\`javascript
path.extname("file.txt");     // ".txt"
path.extname("file");         // ""（无扩展名）
path.extname("file.tar.gz");  // ".gz"（不是 ".tar.gz"）
path.extname(".gitignore");   // ""（点开头不是扩展名）
path.extname("file.");        // "."
\`\`\`

### 路径解析与格式化

| 方法 | 说明 |
| --- | --- |
| \`parse(p)\` | 将路径解析为对象 |
| \`format(obj)\` | 将对象格式化为路径 |

\`\`\`javascript
const parsed = path.parse("/home/user/file.txt");
// {
//   root: "/",
//   dir: "/home/user",
//   base: "file.txt",
//   ext: ".txt",
//   name: "file"
// }

const formatted = path.format(parsed);
// "/home/user/file.txt"
\`\`\`

### 路径规范化

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| \`normalize(p)\` | 规范化路径（处理多余的 /、.、..） | \`/a//b/../c\` → \`/a/c\` |
| \`relative(from, to)\` | 计算相对路径 | \`/a/b\` → \`/a/c/d\` = \`../c/d\` |

\`\`\`javascript
path.normalize("/a//b/../c/");   // "/a/c"
path.relative("/a/b", "/a/c/d"); // "../c/d"
path.relative("/a/b/c", "/a/b"); // ".."
\`\`\`

### 平台相关属性

| 属性 | POSIX | Windows |
| --- | --- | --- |
| \`path.sep\` | \`/\` | \`\\\` |
| \`path.delimiter\` | \`:\` | \`;\` |

\`\`\`javascript
console.log(path.sep);       // "/" (macOS/Linux) 或 "\\\\" (Windows)
console.log(path.delimiter); // ":" (macOS/Linux) 或 ";" (Windows)

// 解析 PATH 环境变量
const paths = process.env.PATH.split(path.delimiter);
\`\`\`

### 路径遍历攻击防范

路径遍历攻击（Path Traversal）是指攻击者通过构造 \`../\` 等特殊字符访问预期目录之外的文件：

\`\`\`javascript
// ❌ 危险：用户输入可能包含 ../ 来突破目录限制
const file = path.join("/safe/dir", userInput);
// 如果 userInput = "../../etc/passwd"，结果可能是 /etc/passwd

// ✅ 安全：使用 path.resolve 检查结果是否在允许目录内
function safePath(baseDir, userPath) {
  const resolved = path.resolve(baseDir, userPath);
  if (!resolved.startsWith(baseDir + path.sep)) {
    throw new Error("路径遍历攻击");
  }
  return resolved;
}
\`\`\`

### 跨平台路径处理技巧

\`\`\`javascript
// 1. 始终使用 path.join 而非字符串拼接
const p = path.join("a", "b", "c"); // 而非 "a/b/c"

// 2. 使用 path.resolve 获取绝对路径
const abs = path.resolve("relative/path");

// 3. 使用 path.sep 处理平台差异
const parts = somePath.split(path.sep);

// 4. posix 和 win32 子命名空间
// 在 Windows 上处理 POSIX 路径，或反过来
const normalized = path.posix.normalize("a/b/c");
\`\`\`

下面这段代码演示了 path 模块的各种核心用法。`,
    code: `// ============================================================
// 第四章代码演示：path 路径处理
// ============================================================
var path = require("path");

// ---- 1. path.join：路径拼接 ----
console.log("===== 1. path.join 路径拼接 =====");
// 基本拼接
console.log("join('a','b','c'):", path.join("a", "b", "c"));
// 多余的 / 被规范化
console.log("join('/a','/b','c'):", path.join("/a", "/b", "c"));
// .. 表示上级目录
console.log("join('/a','..','b'):", path.join("/a", "..", "b"));
// . 表示当前目录
console.log("join('a','.','b'):", path.join("a", ".", "b"));
// 连续多个 ..
console.log("join('/a/b/c','../../d'):", path.join("/a/b/c", "../../d"));

// 实际场景：构建项目文件路径
var projectDir = "/home/user/my-project";
var configFile = path.join(projectDir, "config", "app.json");
console.log("\\n项目配置文件路径:", configFile);
var srcIndex = path.join(projectDir, "src", "components", "index.js");
console.log("组件入口路径:", srcIndex);

// ---- 2. path.resolve：解析为绝对路径 ----
console.log("\\n===== 2. path.resolve 解析绝对路径 =====");
// 从右向左，遇到第一个绝对路径停止
console.log("resolve('a','b'):", path.resolve("a", "b"));
console.log("resolve('/a','b'):", path.resolve("/a", "b"));
console.log("resolve('/a','/b'):", path.resolve("/a", "/b"));
console.log("resolve('a','..'):", path.resolve("a", ".."));

// join vs resolve 的区别
console.log("\\njoin vs resolve 对比:");
console.log("  join('a','b'):", path.join("a", "b"));
console.log("  resolve('a','b'):", path.resolve("a", "b"));

// ---- 3. basename / dirname / extname：路径提取 ----
console.log("\\n===== 3. basename / dirname / extname =====");
var testPaths = [
  "/home/user/docs/file.txt",
  "/var/log/app.log",
  "/usr/local/bin/node",
  "relative/path/data.json",
  "no_ext_file",
  ".gitignore",
  "archive.tar.gz",
];

testPaths.forEach(function (p) {
  console.log("\\n路径:", p);
  console.log("  basename:", path.basename(p));
  console.log("  basename(去扩展名):", path.basename(p, path.extname(p)));
  console.log("  dirname:", path.dirname(p));
  console.log("  extname:", path.extname(p));
});

// extname 细节
console.log("\\nextname 细节:");
console.log("  'file.txt':", path.extname("file.txt"));
console.log("  'file':", path.extname("file"));
console.log("  'file.tar.gz':", path.extname("file.tar.gz"));
console.log("  '.gitignore':", path.extname(".gitignore"));
console.log("  'file.':", path.extname("file."));

// ---- 4. path.parse / path.format：解析与格式化 ----
console.log("\\n===== 4. path.parse / path.format =====");
var filePath = "/home/user/projects/my-app/src/index.js";
var parsed = path.parse(filePath);
console.log("parse('/home/user/projects/my-app/src/index.js'):");
console.log("  root:", parsed.root);
console.log("  dir:", parsed.dir);
console.log("  base:", parsed.base);
console.log("  ext:", parsed.ext);
console.log("  name:", parsed.name);

// format 还原
var formatted = path.format(parsed);
console.log("\\nformat 还原:", formatted);
console.log("还原一致:", formatted === filePath);

// 修改部分属性后 format
var modified = Object.assign({}, parsed, { name: "main", ext: ".js" });
console.log("修改后 format:", path.format(modified));

// ---- 5. normalize / relative：规范化与相对路径 ----
console.log("\\n===== 5. normalize / relative =====");
// normalize 规范化路径
console.log("normalize('/a//b/../c/'):", path.normalize("/a//b/../c/"));
console.log("normalize('/a/b/c/../../'):", path.normalize("/a/b/c/../../"));
console.log("normalize('a/./b/./c'):", path.normalize("a/./b/./c"));
console.log("normalize('/a/b/c/../../../..'):", path.normalize("/a/b/c/../../../.."));

// relative 计算相对路径
console.log("\\nrelative 相对路径:");
console.log("  relative('/a/b', '/a/c/d'):", path.relative("/a/b", "/a/c/d"));
console.log("  relative('/a/b/c', '/a/b'):", path.relative("/a/b/c", "/a/b"));
console.log("  relative('/a', '/b'):", path.relative("/a", "/b"));
console.log("  relative('/a/b', '/a/b'):", path.relative("/a/b", "/a/b"));

// actual use: 计算两个文件之间的相对路径
var from = "/home/user/project/src/components/Header.js";
var to = "/home/user/project/src/utils/helpers.js";
console.log("\\n实际场景:");
console.log("  from:", from);
console.log("  to:", to);
console.log("  relative:", path.relative(path.dirname(from), to));

// ---- 6. path.sep / path.delimiter：平台相关属性 ----
console.log("\\n===== 6. path.sep / path.delimiter =====");
console.log("path.sep:", JSON.stringify(path.sep), "(路径分隔符)");
console.log("path.delimiter:", JSON.stringify(path.delimiter), "(PATH 环境变量分隔符)");

// 演示解析 PATH 环境变量
var pathEnv = process.env.PATH || "/usr/bin:/bin:/usr/local/bin";
console.log("\\nPATH 环境变量:", pathEnv);
var pathDirs = pathEnv.split(path.delimiter);
console.log("拆分后的路径列表（前5个）:");
pathDirs.slice(0, 5).forEach(function (dir, i) {
  console.log("  " + (i + 1) + ". " + dir);
});

// ---- 7. isAbsolute：判断是否为绝对路径 ----
console.log("\\n===== 7. path.isAbsolute =====");
console.log("isAbsolute('/a/b'):", path.isAbsolute("/a/b"));
console.log("isAbsolute('/'):", path.isAbsolute("/"));
console.log("isAbsolute('a/b'):", path.isAbsolute("a/b"));
console.log("isAbsolute('.'):", path.isAbsolute("."));
console.log("isAbsolute(''):", path.isAbsolute(""));

// ---- 8. 路径遍历攻击防范 ----
console.log("\\n===== 8. 路径遍历攻击防范 =====");
function safeResolve(baseDir, userPath) {
  // 用 path.resolve 解析，然后检查是否在 baseDir 内
  var resolved = path.resolve(baseDir, userPath);
  var normalizedBase = path.resolve(baseDir) + path.sep;
  if (!resolved.startsWith(normalizedBase) && resolved !== path.resolve(baseDir)) {
    throw new Error("路径遍历攻击检测: " + userPath);
  }
  return resolved;
}

var baseDir = "/var/www/data";
console.log("基础目录:", baseDir);
console.log("安全路径 'images/logo.png':", safeResolve(baseDir, "images/logo.png"));
try {
  console.log("危险路径 '../../../etc/passwd':");
  safeResolve(baseDir, "../../../etc/passwd");
} catch (e) {
  console.log("  " + e.message);
}

// ---- 9. 跨平台路径处理 ----
console.log("\\n===== 9. 跨平台路径处理 =====");
// 使用 path.posix 在 Windows 上处理 POSIX 路径
console.log("当前平台分隔符:", path.sep);
// 构建跨平台安全的路径
function buildPath() {
  var parts = Array.prototype.slice.call(arguments);
  return path.join.apply(path, parts);
}
console.log("buildPath('a','b','c'):", buildPath("a", "b", "c"));
console.log("buildPath('/root','sub','file.txt'):", buildPath("/root", "sub", "file.txt"));

// ---- 10. 实战：文件路径工具函数 ----
console.log("\\n===== 10. 实战：路径工具函数 =====");
// 获取文件所在目录
function getDir(filePath) {
  return path.dirname(filePath);
}
// 获取不含扩展名的文件名
function getBaseName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}
// 替换文件扩展名
function replaceExt(filePath, newExt) {
  return path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)) + newExt);
}
// 判断是否为子路径
function isSubPath(parentPath, childPath) {
  var relative = path.relative(parentPath, childPath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

var testFile = "/home/user/project/src/test.js";
console.log("测试文件:", testFile);
console.log("  getDir:", getDir(testFile));
console.log("  getBaseName:", getBaseName(testFile));
console.log("  replaceExt(.ts):", replaceExt(testFile, ".ts"));
console.log("  replaceExt(.json):", replaceExt(testFile, ".json"));
console.log("  isSubPath('/home/user', '/home/user/project'):", isSubPath("/home/user", "/home/user/project"));
console.log("  isSubPath('/home/user', '/etc/passwd'):", isSubPath("/home/user", "/etc/passwd"));

console.log("\\n===== 路径处理演示结束 =====");`,
  },

  // =========================================================
  // 第五章：进程对象
  // =========================================================
  {
    id: "node-process",
    icon: "⚙️",
    group: "核心基础",
    title: "进程对象",
    content: `## 进程对象

\`process\` 是 Node.js 中最重要的全局对象，它提供了当前 Node.js 进程的信息和控制能力。从命令行参数、环境变量到进程退出、内存监控，都通过 \`process\` 对象完成。

### 命令行参数：process.argv

\`process.argv\` 是一个数组，包含启动 Node.js 时传入的命令行参数：

\`\`\`javascript
// node script.js arg1 arg2 arg3
// process.argv = [
//   "/usr/bin/node",       // Node.js 可执行文件路径
//   "/path/to/script.js",  // 脚本文件路径
//   "arg1", "arg2", "arg3" // 用户参数
// ]
\`\`\`

#### 提取用户参数

\`\`\`javascript
// 从索引 2 开始是用户参数
const args = process.argv.slice(2);
// 或使用 util.parseArgs（Node.js 18.3+）
\`\`\`

### Node.js 可执行文件信息

| 属性 | 说明 | 示例 |
| --- | --- | --- |
| \`process.execPath\` | Node.js 可执行文件的绝对路径 | \`/usr/local/bin/node\` |
| \`process.execArgv\` | 传给 Node.js 的选项（不含脚本） | \`["--inspect", "--max-old-space-size=4096"]\` |

\`\`\`javascript
// node --inspect --max-old-space-size=4096 script.js arg1
// process.execArgv = ["--inspect", "--max-old-space-size=4096"]
// process.argv[2] = "arg1"
\`\`\`

### 环境变量：process.env

\`process.env\` 是一个包含所有环境变量的对象。详见"环境变量与配置管理"章节。

### 版本信息

| 属性 | 说明 |
| --- | --- |
| \`process.version\` | Node.js 版本号（如 \`v20.10.0\`） |
| \`process.versions\` | 所有依赖组件的版本对象 |
| \`process.release\` | 发行版信息 |

\`\`\`javascript
console.log(process.version); // "v20.10.0"
console.log(process.versions);
// { node: "20.10.0", v8: "11.3.244.8", uv: "1.46.0",
//   zlib: "1.2.13", openssl: "3.0.12", ... }
\`\`\`

### 系统与架构信息

| 属性 | 说明 | 可能值 |
| --- | --- | --- |
| \`process.arch\` | CPU 架构 | \`"x64"\` / \`"arm64"\` / \`"ia32"\` |
| \`process.platform\` | 操作系统平台 | \`"darwin"\` / \`"linux"\` / \`"win32"\` |

### 进程标识

| 属性 | 说明 |
| --- | --- |
| \`process.pid\` | 当前进程 ID |
| \`process.ppid\` | 父进程 ID |

### 进程工作目录

| 方法 | 说明 |
| --- | --- |
| \`process.cwd()\` | 返回当前工作目录 |
| \`process.chdir(dir)\` | 改变当前工作目录 |

\`\`\`javascript
console.log(process.cwd()); // 当前工作目录
process.chdir("/tmp");       // 切换工作目录
\`\`\`

> 注意：\`process.cwd()\` 和 \`__dirname\` 不同！\`cwd()\` 是启动进程时的目录，\`__dirname\` 是脚本文件所在目录。

### 进程信息

| 属性/方法 | 说明 |
| --- | --- |
| \`process.uptime()\` | 进程运行时间（秒） |
| \`process.memoryUsage()\` | 内存使用情况 |
| \`process.cpuUsage()\` | CPU 使用情况 |

#### memoryUsage 详解

\`\`\`javascript
const mem = process.memoryUsage();
// {
//   rss: 内存驻留集大小（总内存占用）
//   heapTotal: V8 堆总大小
//   heapUsed: V8 堆已用大小
//   external: 绑定到 V8 的 C++ 对象内存
//   arrayBuffers: ArrayBuffer 和 SharedArrayBuffer 内存
// }
\`\`\`

#### cpuUsage 详解

\`\`\`javascript
const start = process.cpuUsage();
// 执行一些操作
const end = process.cpuUsage(start);
// end.user: 用户态 CPU 时间（微秒）
// end.system: 内核态 CPU 时间（微秒）
\`\`\`

### process.exit()

\`process.exit([code])\` 以指定退出码终止进程。0 表示成功，非 0 表示错误。

\`\`\`javascript
process.exit(0); // 成功退出
process.exit(1); // 错误退出
\`\`\`

> 注意：\`process.exit()\` 会立即终止进程，不会等待异步操作完成。推荐让它自然退出。

### process.nextTick

\`process.nextTick(callback)\` 将回调函数添加到当前操作完成后、下一个事件循环阶段开始前执行。它比 \`setImmediate\` 和 \`setTimeout(fn, 0)\` 优先级更高。

\`\`\`javascript
console.log("第一");
process.nextTick(() => console.log("nextTick"));
console.log("第二");
// 输出：第一 → 第二 → nextTick
\`\`\`

### 标准输入输出

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| \`process.stdin\` | 标准输入流 | Readable Stream |
| \`process.stdout\` | 标准输出流 | Writable Stream |
| \`process.stderr\` | 标准错误流 | Writable Stream |

### 进程事件

| 事件 | 说明 |
| --- | --- |
| \`exit\` | 进程即将退出时触发（只能执行同步操作） |
| \`beforeExit\` | 事件循环为空、进程即将退出时触发（可执行异步操作） |
| \`uncaughtException\` | 未捕获的异常（应避免依赖此事件） |
| \`unhandledRejection\` | 未处理的 Promise 拒绝 |
| \`SIGINT\` | 用户按下 Ctrl+C |

\`\`\`javascript
process.on("exit", (code) => {
  console.log("进程退出，退出码:", code);
});

process.on("SIGINT", () => {
  console.log("收到 Ctrl+C，正在退出...");
  process.exit(0);
});
\`\`\`

下面这段代码演示了 process 对象的各种属性和方法。`,
    code: `// ============================================================
// 第五章代码演示：process 进程对象
// ============================================================

// ---- 1. process.argv：命令行参数 ----
console.log("===== 1. process.argv 命令行参数 =====");
console.log("完整 argv:");
process.argv.forEach(function (arg, i) {
  console.log("  [" + i + "] " + arg);
});
// 提取用户参数（跳过 node 和脚本路径）
var userArgs = process.argv.slice(2);
console.log("用户参数:", userArgs.length > 0 ? userArgs : "(无)");

// ---- 2. process.execPath / process.execArgv ----
console.log("\\n===== 2. execPath / execArgv =====");
console.log("Node.js 可执行文件路径:", process.execPath);
console.log("Node.js 启动参数:", process.execArgv.length > 0 ? process.execArgv : "(无)");

// ---- 3. 版本信息 ----
console.log("\\n===== 3. 版本信息 =====");
console.log("Node.js 版本:", process.version);
console.log("V8 版本:", process.versions.v8);
console.log("libuv 版本:", process.versions.uv);
console.log("OpenSSL 版本:", process.versions.openssl);
console.log("zlib 版本:", process.versions.zlib);

// process.release
console.log("发行版名称:", process.release.name);
console.log("LTS 版本:", process.release.lts || "非 LTS");

// ---- 4. 系统与架构信息 ----
console.log("\\n===== 4. 系统与架构 =====");
console.log("CPU 架构:", process.arch);
console.log("操作系统平台:", process.platform);
// 平台判断
var platform = process.platform;
console.log("平台判断:");
console.log("  是 macOS:", platform === "darwin");
console.log("  是 Linux:", platform === "linux");
console.log("  是 Windows:", platform === "win32");

// ---- 5. 进程标识 ----
console.log("\\n===== 5. 进程标识 =====");
console.log("当前进程 PID:", process.pid);
console.log("父进程 PPID:", process.ppid);
console.log("进程标题:", process.title);

// ---- 6. 工作目录 ----
console.log("\\n===== 6. 工作目录 =====");
console.log("当前工作目录 cwd():", process.cwd());
console.log("脚本文件目录 __dirname:", __dirname);
console.log("cwd() === __dirname:", process.cwd() === __dirname);

// ---- 7. 进程运行信息 ----
console.log("\\n===== 7. 进程运行信息 =====");
// uptime：进程运行时间
var uptime = process.uptime();
console.log("进程运行时间:", uptime.toFixed(2), "秒");
console.log("  =", (uptime / 60).toFixed(2), "分钟");

// memoryUsage：内存使用情况
var mem = process.memoryUsage();
console.log("\\n内存使用情况:");
console.log("  RSS (常驻内存):", (mem.rss / 1024 / 1024).toFixed(2), "MB");
console.log("  heapTotal (V8堆总大小):", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB");
console.log("  heapUsed (V8堆已用):", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB");
console.log("  external (C++绑定):", (mem.external / 1024 / 1024).toFixed(2), "MB");
console.log("  arrayBuffers:", (mem.arrayBuffers / 1024).toFixed(2), "KB");

// cpuUsage：CPU 使用情况
var startCpu = process.cpuUsage();
// 执行一些计算
var sum = 0;
for (var i = 0; i < 500000; i++) {
  sum += Math.sqrt(i);
}
var endCpu = process.cpuUsage(startCpu);
console.log("\\nCPU 使用情况（500K 次 sqrt）:");
console.log("  用户态:", (endCpu.user / 1000).toFixed(2), "ms");
console.log("  内核态:", (endCpu.system / 1000).toFixed(2), "ms");

// ---- 8. process.nextTick ----
console.log("\\n===== 8. process.nextTick =====");
// nextTick 在当前操作完成后、下个事件循环阶段前执行
console.log("A: 同步输出");
process.nextTick(function () {
  console.log("C: nextTick 回调（在 B 之后、事件循环之前）");
});
console.log("B: 同步输出");

// nextTick 与 setImmediate 的优先级对比
setImmediate(function () {
  console.log("E: setImmediate 回调（在事件循环 check 阶段）");
});
process.nextTick(function () {
  console.log("D: nextTick 回调（优先级最高）");
});

// ---- 9. 标准输入输出 ----
console.log("\\n===== 9. 标准输入输出 =====");
console.log("stdout 是可写流:", process.stdout.writable);
console.log("stderr 是可写流:", process.stderr.writable);
console.log("stdin 是可读流:", process.stdin.readable);

// 使用 stdout.write（不自动换行）
process.stdout.write("  使用 stdout.write 输出（无换行）");
process.stdout.write("...\\n");

// 使用 stderr 输出
process.stderr.write("  stderr 输出（重定向时 stderr 和 stdout 可以分开）\\n");

// ---- 10. process.env 环境变量 ----
console.log("\\n===== 10. process.env 环境变量 =====");
console.log("常用环境变量:");
var commonEnvKeys = ["HOME", "USER", "PATH", "SHELL", "PWD", "LANG", "NODE_ENV"];
commonEnvKeys.forEach(function (key) {
  var value = process.env[key];
  if (value) {
    var display = value.length > 50 ? value.slice(0, 50) + "..." : value;
    console.log("  " + key + " = " + display);
  } else {
    console.log("  " + key + " = (未设置)");
  }
});

// ---- 11. process.exit 与退出码 ----
console.log("\\n===== 11. process.exit =====");
console.log("process.exitCode:", process.exitCode);
console.log("提示: process.exit(0) 成功退出, exit(1) 错误退出");
console.log("提示: 沙箱环境不会真正退出进程");

// ---- 12. 进程事件 ----
console.log("\\n===== 12. 进程事件 =====");
// beforeExit 事件（事件循环为空时触发）
var beforeExitFired = false;
process.once("beforeExit", function (code) {
  beforeExitFired = true;
  console.log("  beforeExit 事件触发，退出码:", code);
  console.log("  （沙箱环境可能不会触发此事件）");
});

// 注册 uncaughtException 处理器（仅作演示，不建议在生产中依赖）
// 在实际应用中，应让进程崩溃并重启，而非吞掉异常

// 信号处理信息
console.log("  常见信号:");
console.log("    SIGINT  - Ctrl+C 中断");
console.log("    SIGTERM - 终止信号（kill 默认）");
console.log("    SIGKILL - 强制终止（无法捕获）");
console.log("    SIGHUP  - 终端断开");

// ---- 13. 实战：解析命令行参数 ----
console.log("\\n===== 13. 实战：解析命令行参数 =====");
function parseArgs(argv) {
  var args = argv.slice(2);
  var options = {};
  var positional = [];

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg.startsWith("--")) {
      var key = arg.slice(2);
      var value = args[i + 1];
      if (value && !value.startsWith("--")) {
        options[key] = value;
        i++; // 跳过值
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith("-")) {
      var key = arg.slice(1);
      options[key] = true;
    } else {
      positional.push(arg);
    }
  }

  return { options: options, positional: positional };
}

// 模拟命令行参数
var parsed = parseArgs(["node", "script.js", "--port", "3000", "--debug", "input.txt", "-v"]);
console.log("模拟命令行: node script.js --port 3000 --debug input.txt -v");
console.log("  解析结果:");
console.log("  选项:", JSON.stringify(parsed.options));
console.log("  位置参数:", parsed.positional);

// ---- 14. 实战：进程信息概览 ----
console.log("\\n===== 14. 进程信息概览 =====");
var info = {
  "Node.js 版本": process.version,
  "V8 版本": process.versions.v8,
  "平台": process.platform,
  "架构": process.arch,
  "PID": process.pid,
  "运行时间(s)": parseFloat(process.uptime().toFixed(2)),
  "内存RSS(MB)": parseFloat((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
  "堆已用(MB)": parseFloat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
  "工作目录": process.cwd(),
};
console.table(Object.entries(info).map(function (e) {
  return { 属性: e[0], 值: e[1] };
}));

console.log("\\n===== 进程对象演示结束 =====");`,
  },

  // =========================================================
  // 第六章：环境变量与配置管理
  // =========================================================
  {
    id: "node-env-config",
    icon: "🔧",
    group: "核心基础",
    title: "环境变量与配置管理",
    content: `## 环境变量与配置管理

配置管理是生产级应用的基础。正确管理环境变量和配置，是区分"能跑"和"可靠的"项目的关键分水岭。本章深入讲解配置管理的最佳实践。

### 什么是环境变量？

环境变量是操作系统级别的键值对，进程在启动时从父进程继承。在 Node.js 中通过 \`process.env\` 访问：

\`\`\`javascript
console.log(process.env.HOME);     // "/home/user"
console.log(process.env.NODE_ENV); // "production"
\`\`\`

### NODE_ENV 环境区分

\`NODE_ENV\` 是 Node.js 生态中的约定俗成，用于区分运行环境：

| 环境 | 说明 | 典型行为 |
| --- | --- | --- |
| \`development\` | 本地开发 | 详细日志、热重载、错误堆栈 |
| \`production\` | 生产环境 | 最小日志、性能优化、缓存开启 |
| \`test\` | 测试环境 | CI 运行、模拟数据 |

\`\`\`javascript
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

if (isProduction) {
  // 启用缓存、压缩、最小日志
} else {
  // 启用详细日志、错误堆栈
}
\`\`\`

### 常用环境变量

| 变量 | 用途 | 示例 |
| --- | --- | --- |
| \`PORT\` | 服务端口 | \`3000\` |
| \`HOST\` | 绑定地址 | \`0.0.0.0\` |
| \`DATABASE_URL\` | 数据库连接串 | \`postgres://...\` |
| \`REDIS_URL\` | 缓存连接 | \`redis://...\` |
| \`API_KEY\` | 外部 API 密钥 | \`sk-xxxx\` |
| \`LOG_LEVEL\` | 日志级别 | \`debug\` / \`info\` / \`error\` |
| \`SECRET_KEY\` | 加密密钥 | \`base64...\` |
| \`CORS_ORIGIN\` | 允许的跨域来源 | \`https://example.com\` |

### .env 文件概念

\`.env\` 文件是存放环境变量的文本文件，在开发环境中使用（不应提交到版本控制）：

\`\`\`
# .env 文件示例
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://localhost:5432/myapp
API_KEY=sk-xxxxxxxxxxxx
\`\`\`

#### dotenv 库

Node.js 本身不解析 .env 文件，常用 \`dotenv\` 库：

\`\`\`javascript
require("dotenv").config(); // 加载 .env 到 process.env
const port = process.env.PORT || 3000;
\`\`\`

> 由于沙箱限制，本章代码手动实现 .env 解析逻辑。

### 配置优先级

配置来源应遵循以下优先级（从低到高）：

\`\`\`
默认值 < 配置文件 < 环境变量 < 命令行参数
\`\`\`

| 优先级 | 来源 | 说明 | 可覆盖 |
| --- | --- | --- | --- |
| 1（最低） | 代码默认值 | 硬编码的 fallback | ✅ |
| 2 | 配置文件 | \`.env\` / \`config.json\` | ✅ |
| 3 | 环境变量 | \`process.env\` | ✅ |
| 4（最高） | 命令行参数 | \`--port=3000\` | ❌ |

\`\`\`javascript
// 实现优先级：命令行 > 环境变量 > 配置文件 > 默认值
const port = args.port || process.env.PORT || configFile.port || 3000;
\`\`\`

### config 模块模式

大型项目中，通常将配置集中在一个模块中：

\`\`\`javascript
// config.js
module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || "myapp",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  logLevel: process.env.LOG_LEVEL || "info",
  isProduction: process.env.NODE_ENV === "production",
};
\`\`\`

### 12-Factor App 配置原则

12-Factor App 是一套构建云原生应用的方法论，其中第三条"配置"原则：

> **在环境中存储配置，而不是代码中。**

核心要点：
1. 配置与代码严格分离
2. 配置存储在环境变量中
3. 不同部署环境使用不同的环境变量
4. 不要把密钥、密码、连接串硬编码在代码中
5. 不要把 .env 文件提交到 Git

**违反原则的后果：**
- 代码中的密钥泄露（GitHub 有专门的扫描检测）
- 换环境部署需要改代码
- 无法区分开发/测试/生产环境的配置

### 配置验证

生产环境应验证配置的完整性，启动时检查必需的配置项：

\`\`\`javascript
const required = ["DATABASE_URL", "SECRET_KEY", "API_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    console.error("缺少必需的环境变量:", key);
    process.exit(1);
  }
}
\`\`\`

### 配置类型转换

环境变量始终是字符串，使用时需要类型转换：

\`\`\`javascript
const port = parseInt(process.env.PORT, 10); // 转数字
const debug = process.env.DEBUG === "true";   // 转布尔
const allowed = process.env.ALLOWED_ORIGINS?.split(","); // 转数组
const config = JSON.parse(process.env.COMPLEX_CONFIG);   // 转对象
\`\`\`

### 安全注意事项

| 注意事项 | 说明 |
| --- | --- |
| 不要硬编码密钥 | 使用环境变量或密钥管理服务 |
| 不要提交 .env | 添加到 .gitignore |
| 不要打印环境变量 | 日志中不要输出 process.env |
| 使用 .env.example | 提供配置模板文件 |
| 生产环境密钥轮换 | 定期更换密钥 |

下面这段代码实现了一个完整的配置管理模块。`,
    code: `// ============================================================
// 第六章代码演示：环境变量与配置管理
// ============================================================
var fs = require("fs");
var path = require("path");
var os = require("os");

// ---- 1. process.env 环境变量 ----
console.log("===== 1. process.env 环境变量 =====");
// 列出所有环境变量（仅显示前 10 个）
var envKeys = Object.keys(process.env);
console.log("环境变量总数:", envKeys.length);
console.log("前 10 个环境变量:");
envKeys.slice(0, 10).forEach(function (key) {
  var val = process.env[key];
  var display = val.length > 40 ? val.slice(0, 40) + "..." : val;
  console.log("  " + key + " = " + display);
});

// 常用环境变量检查
console.log("\\n常用环境变量:");
[["HOME", "用户主目录"], ["USER", "当前用户"], ["PATH", "可执行文件路径"],
 ["SHELL", "Shell 程序"], ["LANG", "语言设置"], ["TMPDIR", "临时目录"],
 ["NODE_ENV", "Node 环境"]].forEach(function (item) {
  var key = item[0], desc = item[1];
  var val = process.env[key];
  if (val) {
    var d = val.length > 50 ? val.slice(0, 50) + "..." : val;
    console.log("  " + key + " (" + desc + ") = " + d);
  } else {
    console.log("  " + key + " (" + desc + ") = (未设置)");
  }
});

// ---- 2. NODE_ENV 环境区分 ----
console.log("\\n===== 2. NODE_ENV 环境区分 =====");
var nodeEnv = process.env.NODE_ENV || "development";
console.log("当前 NODE_ENV:", nodeEnv);
if (nodeEnv === "production") {
  console.log("  运行在生产环境：启用缓存、压缩、最小日志");
} else if (nodeEnv === "test") {
  console.log("  运行在测试环境：使用模拟数据");
} else {
  console.log("  运行在开发环境：启用详细日志和错误堆栈");
}

// ---- 3. 手动解析 .env 文件 ----
console.log("\\n===== 3. 解析 .env 文件（模拟 dotenv）=====");
function parseEnvFile(content) {
  var result = {};
  var lines = content.split("\\n");
  lines.forEach(function (line) {
    // 去掉注释和空白
    var trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;

    var eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;

    var key = trimmed.slice(0, eqIndex).trim();
    var value = trimmed.slice(eqIndex + 1).trim();

    // 去掉引号
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  });
  return result;
}

// 创建临时 .env 文件
var tempEnvFile = path.join(os.tmpdir(), "_test_env_" + Date.now() + ".env");
var envContent = [
  "# 应用配置",
  "PORT=3000",
  "NODE_ENV=development",
  "DATABASE_URL=postgres://localhost:5432/myapp",
  "REDIS_URL=redis://localhost:6379",
  "API_KEY=sk-test-key-12345",
  "LOG_LEVEL=debug",
  "CORS_ORIGIN=https://example.com",
  'APP_NAME="My Application"',
  "DEBUG=true",
  "MAX_CONNECTIONS=100",
  "# 空行被忽略",
  "",
  "ALLOWED_HOSTS=localhost,example.com",
].join("\\n");

fs.writeFileSync(tempEnvFile, envContent, "utf8");

// 读取并解析
var envContent2 = fs.readFileSync(tempEnvFile, "utf8");
var parsedEnv = parseEnvFile(envContent2);
console.log("解析的配置项:");
console.table(Object.entries(parsedEnv).map(function (e) {
  return { 配置项: e[0], 值: e[1] };
}));

// 清理
fs.unlinkSync(tempEnvFile);

// ---- 4. 配置优先级：默认值 < 配置文件 < 环境变量 < 命令行 ----
console.log("\\n===== 4. 配置优先级 =====");
// 模拟不同来源的配置
var defaults = {
  port: 3000,
  host: "localhost",
  logLevel: "info",
  debug: false,
  maxConnections: 50,
};
var fileConfig = parseEnvFile(envContent2); // 模拟配置文件
var envConfig = { PORT: "8080" }; // 模拟环境变量
var cliConfig = { logLevel: "error" }; // 模拟命令行参数

// 实现优先级合并
function mergeConfig(defaults, fileConfig, envConfig, cliConfig) {
  // 从低到高合并
  var result = Object.assign({}, defaults);

  // 配置文件覆盖
  Object.keys(fileConfig).forEach(function (key) {
    var lowerKey = key.toLowerCase();
    result[lowerKey] = fileConfig[key];
  });

  // 环境变量覆盖（环境变量名转小写匹配）
  Object.keys(envConfig).forEach(function (key) {
    var lowerKey = key.toLowerCase();
    result[lowerKey] = envConfig[key];
  });

  // 命令行参数覆盖（最高优先级）
  Object.keys(cliConfig).forEach(function (key) {
    var lowerKey = key.toLowerCase();
    result[lowerKey] = cliConfig[key];
  });

  return result;
}

var finalConfig = mergeConfig(defaults, fileConfig, envConfig, cliConfig);
console.log("最终配置（优先级：命令行 > 环境变量 > 配置文件 > 默认值）:");
console.table(Object.entries(finalConfig).map(function (e) {
  return { 配置项: e[0], 值: String(e[1]) };
}));

// 验证优先级
console.log("\\n优先级验证:");
console.log("  port (环境变量覆盖配置文件):", finalConfig["port"], "(期望: 8080)");
console.log("  loglevel (命令行覆盖所有):", finalConfig["loglevel"], "(期望: error)");

// ---- 5. 配置管理模块（正式实现）----
console.log("\\n===== 5. 配置管理模块（正式实现）=====");

function createConfig(options) {
  var defaults = options.defaults || {};
  var envMap = options.envMap || {};

  // 从默认值开始
  var config = Object.assign({}, defaults);

  // 从环境变量读取（按映射关系）
  Object.keys(envMap).forEach(function (configKey) {
    var envKey = envMap[configKey];
    if (process.env[envKey] !== undefined) {
      config[configKey] = process.env[envKey];
    }
  });

  // 类型转换
  function get(key) {
    return config[key];
  }

  function getInt(key) {
    var val = parseInt(config[key], 10);
    if (isNaN(val)) {
      throw new Error("配置 " + key + " 不是有效的整数: " + config[key]);
    }
    return val;
  }

  function getBool(key) {
    var val = config[key];
    if (typeof val === "boolean") return val;
    return val === "true" || val === "1" || val === "yes";
  }

  function getArray(key) {
    var val = config[key];
    if (Array.isArray(val)) return val;
    return String(val).split(",").map(function (s) { return s.trim(); });
  }

  return {
    get: get,
    getInt: getInt,
    getBool: getBool,
    getArray: getArray,
    all: config,
  };
}

// 使用配置模块
var appConfig = createConfig({
  defaults: {
    port: "3000",
    host: "localhost",
    debug: "false",
    databaseUrl: "postgres://localhost:5432/defaultdb",
    logLevel: "info",
    corsOrigins: "*",
    maxConnections: "50",
  },
  envMap: {
    port: "PORT",
    host: "HOST",
    debug: "DEBUG",
    databaseUrl: "DATABASE_URL",
    logLevel: "LOG_LEVEL",
    corsOrigins: "CORS_ORIGIN",
    maxConnections: "MAX_CONNECTIONS",
  },
});

console.log("应用配置:");
console.log("  port (int):", appConfig.getInt("port"));
console.log("  host:", appConfig.get("host"));
console.log("  debug (bool):", appConfig.getBool("debug"));
console.log("  databaseUrl:", appConfig.get("databaseUrl"));
console.log("  logLevel:", appConfig.get("logLevel"));
console.log("  corsOrigins (array):", appConfig.getArray("corsOrigins"));
console.log("  maxConnections (int):", appConfig.getInt("maxConnections"));

// ---- 6. 配置验证 ----
console.log("\\n===== 6. 配置验证 =====");
function validateConfig(config, requiredKeys) {
  var errors = [];
  requiredKeys.forEach(function (key) {
    var value = config.get(key);
    if (value === undefined || value === null || value === "") {
      errors.push("缺少必需的配置项: " + key);
    }
  });
  if (errors.length > 0) {
    console.log("  配置验证失败:");
    errors.forEach(function (err) {
      console.log("    " + err);
    });
    return false;
  }
  console.log("  配置验证通过");
  return true;
}

// 验证必需配置
validateConfig(appConfig, ["port", "host", "databaseUrl"]);

// 验证缺少的配置
var incompleteConfig = createConfig({
  defaults: { port: "3000" },
  envMap: { port: "PORT", secretKey: "SECRET_KEY" },
});
validateConfig(incompleteConfig, ["port", "secretKey"]);

// ---- 7. 12-Factor App 配置原则 ----
console.log("\\n===== 7. 12-Factor App 配置原则 =====");
console.log("  原则 1: 配置与代码严格分离");
console.log("  原则 2: 配置存储在环境变量中");
console.log("  原则 3: 不同部署环境使用不同环境变量");
console.log("  原则 4: 不要把密钥硬编码在代码中");
console.log("  原则 5: 不要把 .env 文件提交到 Git");
console.log("  原则 6: 配置变更不需要重新部署代码");

// ---- 8. 安全提示 ----
console.log("\\n===== 8. 安全提示 =====");
console.log("  ✓ 使用环境变量存储密钥");
console.log("  ✓ 将 .env 添加到 .gitignore");
console.log("  ✓ 提供 .env.example 模板文件");
console.log("  ✓ 日志中不输出 process.env");
console.log("  ✓ 生产环境定期轮换密钥");
console.log("  ✗ 不要硬编码密钥在代码中");
console.log("  ✗ 不要将密钥提交到版本控制");

console.log("\\n===== 环境变量与配置管理演示结束 =====");`,
  },

  // =========================================================
  // 第七章：Buffer 缓冲区
  // =========================================================
  {
    id: "node-buffer",
    icon: "🧊",
    group: "核心基础",
    title: "Buffer 缓冲区",
    content: `## Buffer 缓冲区

\`Buffer\` 是 Node.js 处理**二进制数据**的核心全局类。从文件读写、网络通信到加密计算，Buffer 无处不在。理解 Buffer 是掌握 Node.js 底层操作的关键。

### 为什么需要 Buffer？

JavaScript 最初设计用于浏览器环境，主要处理字符串，缺乏原生二进制数据处理能力。但在服务端，二进制数据无处不在：

- **文件**：图片、视频、音频、压缩包
- **网络**：TCP 流、HTTP 请求/响应体
- **加密**：哈希值、密钥、数字签名
- **协议**：DNS、TLS 等二进制协议

Buffer 就是为了填补这个空白而设计的。它类似于一个**字节数组**（每个元素 0-255），但分配在 V8 堆外内存中，性能更高。

### Buffer 与 Uint8Array 的关系

从 Node.js v6 起，Buffer 是 \`Uint8Array\` 的子类：

\`\`\`
TypedArray (抽象基类)
  └── Uint8Array (无符号 8 位整数数组)
        └── Buffer (Node.js 扩展，添加了编码/解码等方法)
\`\`\`

这意味着 Buffer 兼容所有接受 Uint8Array 的 API，同时拥有 Node.js 特有的编码转换能力。

### 创建 Buffer 的三种方式

#### 1. Buffer.alloc(size[, fill[, encoding]])

创建指定大小的 Buffer，**默认填充 0**（安全但稍慢）：

\`\`\`javascript
const buf = Buffer.alloc(10);        // 10 字节，全 0
const buf2 = Buffer.alloc(10, 0xFF); // 10 字节，全 255
const buf3 = Buffer.alloc(10, "A");  // 10 字节，全 'A'
\`\`\`

#### 2. Buffer.allocUnsafe(size)

创建指定大小的 Buffer，但**不初始化**内容（可能包含旧数据，快但不安全）：

\`\`\`javascript
const buf = Buffer.allocUnsafe(10); // 10 字节，内容随机！
\`\`\`

> ⚠️ allocUnsafe 分配的内存可能包含前一个进程的敏感数据残留。仅在**确定会立即覆写全部内容**时使用。

#### 3. Buffer.from(source)

从各种来源创建 Buffer：

\`\`\`javascript
Buffer.from("Hello", "utf8");          // 从字符串
Buffer.from([0x48, 0x65, 0x6c]);       // 从字节数组
Buffer.from(otherBuffer);               // 从另一个 Buffer（复制）
Buffer.from(arrayBuffer, offset, len);  // 从 ArrayBuffer（共享内存）
\`\`\`

### 编码转换

Buffer 支持多种字符编码，可以在不同编码之间转换：

| 编码 | 说明 | 用途 |
| --- | --- | --- |
| \`utf8\` | UTF-8 编码（默认） | 通用文本，支持中文 |
| \`ascii\` | ASCII 编码 | 纯英文字符 |
| \`base64\` | Base64 编码 | 数据传输、Data URL |
| \`hex\` | 十六进制编码 | 哈希值、密钥表示 |
| \`latin1\` / \`binary\` | Latin-1 编码 | 每字节一个字符 |

\`\`\`javascript
const text = "你好";
const buf = Buffer.from(text, "utf8");
console.log(buf.toString("hex"));    // "e4bda0e5a5bd"
console.log(buf.toString("base64")); // "5L2g5aW9"
\`\`\`

### Buffer 读写二进制数据

Buffer 提供了丰富的二进制读写方法：

| 读取方法 | 说明 | 字节数 |
| --- | --- | --- |
| \`readUInt8(offset)\` | 无符号 8 位 | 1 |
| \`readUInt16BE(offset)\` | 无符号 16 位大端 | 2 |
| \`readUInt16LE(offset)\` | 无符号 16 位小端 | 2 |
| \`readUInt32BE(offset)\` | 无符号 32 位大端 | 4 |
| \`readInt32BE(offset)\` | 有符号 32 位大端 | 4 |
| \`readFloatBE(offset)\` | 32 位浮点 | 4 |
| \`readDoubleBE(offset)\` | 64 位浮点 | 8 |

#### 大端序 vs 小端序

| 字节序 | 说明 | 内存布局 (值 0x1234) | 用途 |
| --- | --- | --- | --- |
| BE (Big Endian) | 高位在前 | \`12 34\` | 网络协议 |
| LE (Little Endian) | 低位在前 | \`34 12\` | x86 CPU |

### 常用操作方法

| 方法 | 说明 |
| --- | --- |
| \`Buffer.concat([buf1, buf2])\` | 拼接多个 Buffer |
| \`Buffer.isBuffer(obj)\` | 判断是否为 Buffer |
| \`Buffer.byteLength(str, [enc])\` | 计算字符串的字节长度 |
| \`buf.equals(other)\` | 比较是否相等 |
| \`Buffer.compare(a, b)\` | 比较大小（-1/0/1） |
| \`buf.subarray([start, end])\` | 切片（共享内存，推荐） |
| \`buf.copy(target[, start])\` | 复制到另一个 Buffer |
| \`buf.fill(value[, start, end])\` | 填充 |
| \`buf.indexOf(value)\` | 查找字节位置 |
| \`buf.includes(value)\` | 是否包含某字节 |

### 字节长度 vs 字符串长度

这是最常见的陷阱：

\`\`\`javascript
"你好".length;                  // 2（字符数）
Buffer.byteLength("你好");       // 6（字节数，UTF-8 每个中文占 3 字节）
Buffer.from("你好").length;     // 6
\`\`\`

| 字符 | UTF-8 字节数 |
| --- | --- |
| ASCII (a-z, 0-9) | 1 |
| 拉丁扩展 (é, ñ) | 2 |
| 中文/日文/韩文 | 3 |
| Emoji (🎉) | 4 |

### Buffer 拼接的正确方式

拼接多个 Buffer 时，避免使用字符串拼接（会导致编码问题）：

\`\`\`javascript
// ❌ 错误：字符串拼接可能导致编码问题
let result = "";
bufs.forEach(b => result += b.toString());

// ✅ 正确：使用 Buffer.concat
const result = Buffer.concat(bufs);
\`\`\`

### Buffer 与 TypedArray 互转

\`\`\`javascript
// Buffer → Uint8Array（共享内存）
const buf = Buffer.from("Hello");
const u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

// Uint8Array → Buffer（共享内存）
const u8 = new Uint8Array([72, 101, 108, 108, 111]);
const buf = Buffer.from(u8.buffer);
\`\`\`

下面这段代码演示了 Buffer 的创建、操作和编码转换。`,
    code: `// ============================================================
// 第七章代码演示：Buffer 缓冲区
// ============================================================
// Buffer 是全局对象，无需 require

// ---- 1. 创建 Buffer 的各种方式 ----
console.log("===== 1. 创建 Buffer =====");
// alloc：创建指定大小的 Buffer，填充 0（安全）
var buf1 = Buffer.alloc(12);
console.log("alloc(12):", buf1);
console.log("  每个字节:", Array.from(buf1));

// alloc(10, fill)：填充指定值
var buf1b = Buffer.alloc(10, 65); // 65 = 'A' 的 ASCII
console.log("alloc(10, 65):", buf1b, "→", buf1b.toString());

// allocUnsafe：不初始化（可能含旧数据，快但不安全）
var buf2 = Buffer.allocUnsafe(10);
console.log("allocUnsafe(10):", buf2);

// from(string)：从字符串创建
var buf3 = Buffer.from("Hello Node.js Buffer!", "utf8");
console.log("from('Hello...'):", buf3, "→", buf3.toString());

// from(array)：从字节数组创建
var buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // 'Hello'
console.log("from([0x48,...]):", buf4, "→", buf4.toString());

// from(Buffer)：从另一个 Buffer 复制
var buf5 = Buffer.from(buf3);
console.log("from(buf3):", buf5, "→", buf5.toString());
console.log("  复制后是独立 Buffer:", buf3 !== buf5);

// ---- 2. 编码转换 ----
console.log("\\n===== 2. 编码转换 =====");
var text = "你好，世界！Node.js 🎉";
var utf8Buf = Buffer.from(text, "utf8");
console.log("原文:", text);
console.log("UTF-8 字节数:", utf8Buf.length);
console.log("字符数:", text.length);
console.log("Hex:", utf8Buf.toString("hex"));
console.log("Base64:", utf8Buf.toString("base64"));

// 编码往返验证
var base64 = utf8Buf.toString("base64");
var fromBase64 = Buffer.from(base64, "base64").toString("utf8");
console.log("Base64 往返:", fromBase64);
console.log("往返一致:", text === fromBase64);

var hex = utf8Buf.toString("hex");
var fromHex = Buffer.from(hex, "hex").toString("utf8");
console.log("Hex 往返:", fromHex);
console.log("往返一致:", text === fromHex);

// ---- 3. 字节长度 vs 字符串长度 ----
console.log("\\n===== 3. 字节长度 vs 字符长度 =====");
var samples = ["Hello", "你好", "Hello你好", "🎉", "abc🎉你好"];
console.log("  原文".padEnd(20) + "字符数".padEnd(10) + "字节数");
console.log("  " + "-".repeat(40));
samples.forEach(function (s) {
  console.log("  " + s.padEnd(20) + String(s.length).padEnd(10) + Buffer.byteLength(s, "utf8"));
});

// ---- 4. concat 拼接 ----
console.log("\\n===== 4. concat 拼接 =====");
var part1 = Buffer.from("Hello ");
var part2 = Buffer.from("World ");
var part3 = Buffer.from("from Buffer!");
var combined = Buffer.concat([part1, part2, part3]);
console.log("拼接结果:", combined.toString());
console.log("总字节数:", combined.length);

// 指定总长度优化性能
var combined2 = Buffer.concat([part1, part2, part3], part1.length + part2.length + part3.length);
console.log("指定总长度:", combined2.toString());

// ---- 5. 二进制读写 ----
console.log("\\n===== 5. 二进制读写 =====");
var binBuf = Buffer.alloc(20);
// writeUInt8：在偏移 0 写入 1 字节无符号整数
binBuf.writeUInt8(255, 0);
// writeUInt16BE：在偏移 1 写入 2 字节大端序整数
binBuf.writeUInt16BE(1000, 1);
// writeInt32LE：在偏移 3 写入 4 字节小端序有符号整数
binBuf.writeInt32LE(-123456, 3);
// writeFloatBE：在偏移 7 写入 4 字节浮点
binBuf.writeFloatBE(3.14159, 7);
// writeDoubleBE：在偏移 11 写入 8 字节浮点
binBuf.writeDoubleBE(2.718281828, 11);
// write：在偏移 19 写入字符串
binBuf.write("X", 19, "utf8");

console.log("二进制 Buffer:", binBuf);
console.log("readUInt8(0):", binBuf.readUInt8(0));
console.log("readUInt16BE(1):", binBuf.readUInt16BE(1));
console.log("readInt32LE(3):", binBuf.readInt32LE(3));
console.log("readFloatBE(7):", binBuf.readFloatBE(7).toFixed(5));
console.log("readDoubleBE(11):", binBuf.readDoubleBE(11).toFixed(9));

// 大端序 vs 小端序对比
var testBuf = Buffer.alloc(4);
testBuf.writeUInt32BE(0x12345678, 0);
console.log("\\n大端序 writeUInt32BE(0x12345678):");
console.log("  字节:", testBuf.toString("hex"));
console.log("  readUInt32BE:", "0x" + testBuf.readUInt32BE(0).toString(16));
console.log("  readUInt32LE:", "0x" + testBuf.readUInt32LE(0).toString(16));

// ---- 6. 判断与比较 ----
console.log("\\n===== 6. 判断与比较 =====");
console.log("isBuffer(Buffer.alloc(4)):", Buffer.isBuffer(Buffer.alloc(4)));
console.log("isBuffer('string'):", Buffer.isBuffer("string"));
console.log("isBuffer([1,2,3]):", Buffer.isBuffer([1, 2, 3]));
console.log("isBuffer(new Uint8Array(4)):", Buffer.isBuffer(new Uint8Array(4)));

var a = Buffer.from("abc");
var b = Buffer.from("abc");
var c = Buffer.from("abd");
console.log("equals (abc == abc):", a.equals(b));
console.log("equals (abc == abd):", a.equals(c));
console.log("compare (abc vs abd):", Buffer.compare(a, c));
console.log("compare (abc vs abc):", Buffer.compare(a, b));

// ---- 7. subarray / copy / fill / indexOf ----
console.log("\\n===== 7. subarray / copy / fill / indexOf =====");
var orig = Buffer.from("Hello World");

// subarray：切片（共享内存）
var sub = orig.subarray(0, 5);
console.log("subarray(0,5):", sub.toString());
sub[0] = 104; // 'h' (ASCII)
console.log("修改 sub 后 orig:", orig.toString(), "(共享内存!)");

// fill：填充
var fillBuf = Buffer.alloc(10);
fillBuf.fill(65); // 'A'
console.log("fill(65):", fillBuf.toString());
fillBuf.fill("Hi", 3, 7);
console.log("fill('Hi',3,7):", fillBuf.toString());

// copy：复制到另一个 Buffer
var target = Buffer.alloc(5);
orig.copy(target, 0, 0, 5);
console.log("copy 结果:", target.toString());

// indexOf / includes
var searchBuf = Buffer.from("Hello Node.js World");
console.log("indexOf('Node'):", searchBuf.indexOf("Node"));
console.log("indexOf('Python'):", searchBuf.indexOf("Python"));
console.log("includes('World'):", searchBuf.includes("World"));

// ---- 8. Buffer 与 TypedArray (Uint8Array) ----
console.log("\\n===== 8. Buffer 与 TypedArray =====");
console.log("Buffer 是 Uint8Array 的子类:", Buffer.alloc(4) instanceof Uint8Array);

// 从 Uint8Array 创建 Buffer
var uint8 = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
var fromU8 = Buffer.from(uint8);
console.log("从 Uint8Array 创建:", fromU8.toString());

// Buffer 转 Uint8Array（共享内存）
var buf = Buffer.from("Test");
var u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
console.log("Buffer 转 Uint8Array:", Array.from(u8));

// ---- 9. JSON 互转 ----
console.log("\\n===== 9. JSON 互转 =====");
var jsonBuf = Buffer.from("JSON Test Data");
// Buffer 的 toJSON 返回 { type: "Buffer", data: [...] }
var json = JSON.stringify(jsonBuf);
console.log("Buffer → JSON:", json);

// 从 JSON 恢复
var parsed = JSON.parse(json);
var fromJson = Buffer.from(parsed.data);
console.log("JSON → Buffer:", fromJson.toString());
console.log("往返一致:", jsonBuf.equals(fromJson));

// ---- 10. 实战：Base64 编码 ----
console.log("\\n===== 10. 实战：Base64 编码 =====");
// 模拟 PNG 文件头（8 字节）
var pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
console.log("PNG 头部 hex:", pngHeader.toString("hex"));
console.log("PNG 头部 base64:", pngHeader.toString("base64"));
console.log("Data URL: data:image/png;base64," + pngHeader.toString("base64"));

// ---- 11. 实战：Buffer 拼接 vs 字符串拼接 ----
console.log("\\n===== 11. Buffer 拼接 vs 字符串拼接 =====");
var chunks = [
  Buffer.from([0xe4, 0xbd, 0xa0]), // "你" 的第一个 UTF-8 字节
  Buffer.from([0xe5, 0xa5, 0xbd]), // "好" 的 UTF-8 字节
];

// 正确方式：Buffer.concat
var correct = Buffer.concat(chunks);
console.log("Buffer.concat 结果:", correct.toString());

// 错误方式：分别 toString 再拼接（可能破坏多字节字符）
console.log("  注意：分别 toString 再拼接可能破坏多字节字符");

// ---- 12. 实战：计算文件大小模拟 ----
console.log("\\n===== 12. 实战：字节计算 =====");
var messages = [
  { name: "英文文本", content: "Hello World" },
  { name: "中文文本", content: "你好世界" },
  { name: "混合文本", content: "Hello 你好" },
  { name: "含 Emoji", content: "Hello 🎉" },
];
messages.forEach(function (m) {
  var byteLen = Buffer.byteLength(m.content, "utf8");
  var charLen = m.content.length;
  console.log("  " + m.name + ": " + charLen + " 字符, " + byteLen + " 字节");
});

console.log("\\n===== Buffer 缓冲区演示结束 =====");`,
  },

  // =========================================================
  // 第八章：URL 解析与构造
  // =========================================================
  {
    id: "node-url",
    icon: "🔗",
    group: "核心基础",
    title: "URL 解析与构造",
    content: `## URL 解析与构造

URL（Uniform Resource Locator）是 Web 的基石。Node.js 的 \`url\` 模块和全局的 \`URL\` 类提供了完整的 URL 解析与操作能力。本章深入讲解 URL 的解析、构造、参数操作等核心功能。

### URL 的组成部分

一个完整的 URL 包含以下部分：

\`\`\`
  https://user:pass@example.com:8080/api/users?id=100&role=admin#profile
  ┕─┕─┘┕──┕─┕──┕─┕───────┕──┕──┕─┕──────┕─┕─────────────┕─┕─────┕
  协议  用户 密码     主机名    端口  路径       查询字符串     锚点
\`\`\`

| 属性 | 含义 | 示例值 |
| --- | --- | --- |
| \`protocol\` | 协议（含冒号） | \`https:\` |
| \`hostname\` | 主机名 | \`example.com\` |
| \`port\` | 端口 | \`8080\` |
| \`host\` | 主机（hostname:port） | \`example.com:8080\` |
| \`pathname\` | 路径 | \`/api/users\` |
| \`search\` | 查询字符串（含 ?） | \`?id=100&role=admin\` |
| \`hash\` | 锚点（含 #） | \`#profile\` |
| \`origin\` | 来源（只读） | \`https://example.com:8080\` |
| \`href\` | 完整 URL | 整个字符串 |

### 两套 API：Legacy vs WHATWG

Node.js 的 url 模块提供两套 API，推荐使用 WHATWG API：

| 特性 | Legacy API | WHATWG API |
| --- | --- | --- |
| 创建方式 | \`url.parse(urlStr)\` | \`new URL(urlStr)\` |
| 标准兼容 | Node.js 专有 | 与浏览器一致 |
| 推荐程度 | ⚠️ 已废弃 | ✅ 推荐 |

#### 使用 WHATWG URL 类

\`URL\` 是全局可用的类，无需 require：

\`\`\`javascript
const u = new URL("https://example.com:8080/path?a=1&b=2#hash");
console.log(u.protocol);  // "https:"
console.log(u.hostname);  // "example.com"
console.log(u.port);      // "8080"
console.log(u.pathname);  // "/path"
console.log(u.search);    // "?a=1&b=2"
console.log(u.hash);      // "#hash"
\`\`\`

#### URL 属性可读写

修改任意属性后，\`href\` 会自动更新：

\`\`\`javascript
const u = new URL("https://example.com/api");
u.protocol = "http:";
u.hostname = "api.example.com";
u.pathname = "/v2/data";
console.log(u.href); // "http://api.example.com/v2/data"
\`\`\`

### URLSearchParams 详解

\`URLSearchParams\` 是专门操作查询参数的类，可以从 URL 对象获取或独立创建：

#### 创建方式

\`\`\`javascript
// 从字符串
const p1 = new URLSearchParams("a=1&b=2");

// 从对象
const p2 = new URLSearchParams({ a: "1", b: "2" });

// 从 URL 对象
const u = new URL("https://example.com?a=1");
const p3 = u.searchParams;
\`\`\`

#### 核心方法

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| \`get(key)\` | 获取第一个值 | string |
| \`getAll(key)\` | 获取所有同名值 | string[] |
| \`has(key)\` | 判断是否存在 | boolean |
| \`set(key, value)\` | 设置（覆盖已有） | - |
| \`append(key, value)\` | 追加（不覆盖） | - |
| \`delete(key)\` | 删除 | - |
| \`sort()\` | 按 key 排序 | - |
| \`toString()\` | 序列化 | string |
| \`entries()\` | 迭代器 | Iterator |
| \`forEach(cb)\` | 遍历 | - |

#### get vs getAll 陷阱

\`\`\`javascript
const params = new URLSearchParams("tags=js&tags=node&tags=react");
params.get("tags");    // "js" ← 只返回第一个！
params.getAll("tags"); // ["js", "node", "react"] ← 获取所有
\`\`\`

#### set vs append 区别

\`\`\`javascript
const p = new URLSearchParams("a=1");
p.set("a", "2");     // a=2（覆盖）
p.append("a", "3");  // a=2&a=3（追加）
\`\`\`

### 相对路径解析

\`new URL(relative, base)\` 可以解析相对路径：

\`\`\`javascript
const base = new URL("https://example.com/docs/intro/");

new URL("./images/logo.png", base).href;
// "https://example.com/docs/intro/images/logo.png"

new URL("../style.css", base).href;
// "https://example.com/docs/style.css"

new URL("/root.js", base).href;
// "https://example.com/root.js"
\`\`\`

### file URL 与路径转换

在 ESM 模块中，\`import.meta.url\` 返回 file URL，需要转换为本地路径：

\`\`\`javascript
const url = require("url");
const fileUrl = url.pathToFileURL("/home/user/file.txt");
// file:///home/user/file.txt

const back = url.fileURLToPath(fileUrl);
// /home/user/file.txt
\`\`\`

### url.parse vs new URL

Legacy API 的 \`url.parse()\` 从 Node.js v11 起标记为废弃，不推荐在新代码中使用。但了解其用法有助于阅读旧代码：

\`\`\`javascript
const parsed = url.parse("https://example.com/path?a=1&b=2", true);
// 第二个参数 true 表示自动解析 query 为对象
console.log(parsed.query); // { a: "1", b: "2" }
\`\`\`

### 常见陷阱

1. **\`protocol\` 含冒号**：\`u.protocol\` 是 \`"https:"\`，不是 \`"https"\`
2. **\`get()\` 只返回第一个值**：多值参数用 \`getAll()\`
3. **\`new URL()\` 需要完整 URL**：相对路径需要提供 base 参数
4. **URLSearchParams 自动编码**：中文等特殊字符会被编码
5. **\`host\` vs \`hostname\`**：\`host\` 含端口，\`hostname\` 不含

下面这段代码演示了 URL 解析、构造和参数操作的完整用法。`,
    code: `// ============================================================
// 第八章代码演示：URL 解析与构造
// ============================================================
// URL 和 URLSearchParams 是全局对象，无需 require
var url = require("url");

// ---- 1. WHATWG URL 解析 ----
console.log("===== 1. WHATWG URL 解析 =====");
// 解析一个包含所有组成部分的复杂 URL
var complexUrl = new URL(
  "https://user:pass@example.com:8080/api/users?id=100&role=admin&tags=js&tags=node#profile"
);

// 展示所有属性
console.log("href     :", complexUrl.href);
console.log("protocol :", complexUrl.protocol);
console.log("username :", complexUrl.username);
console.log("password :", complexUrl.password);
console.log("host     :", complexUrl.host);
console.log("hostname :", complexUrl.hostname);
console.log("port     :", complexUrl.port);
console.log("pathname :", complexUrl.pathname);
console.log("search   :", complexUrl.search);
console.log("hash     :", complexUrl.hash);
console.log("origin   :", complexUrl.origin);

// 属性是可写的
complexUrl.port = "3000";
console.log("\\n修改端口后:");
console.log("host:", complexUrl.host);
console.log("href:", complexUrl.href);

// ---- 2. URLSearchParams 操作 ----
console.log("\\n===== 2. URLSearchParams 操作 =====");
var params = complexUrl.searchParams;

// get：获取单个值（只返回第一个）
console.log("get('id'):", params.get("id"));
console.log("get('tags'):", params.get("tags"), "(只返回第一个)");

// getAll：获取所有同名值
console.log("getAll('tags'):", params.getAll("tags"));

// has：判断是否存在
console.log("has('role'):", params.has("role"));
console.log("has('page'):", params.has("page"));

// set：设置参数（覆盖同名）
params.set("page", "1");
// append：追加参数（不覆盖）
params.append("tags", "backend");
// delete：删除参数
params.delete("role");

console.log("\\n修改后 search:", complexUrl.search);
console.log("toString():", params.toString());

// sort：按 key 字母排序
params.sort();
console.log("排序后:", params.toString());

// ---- 3. 遍历查询参数 ----
console.log("\\n===== 3. 遍历查询参数 =====");
// entries() 迭代器
console.log("entries():");
for (var kv of params.entries()) {
  console.log("  " + kv[0] + " = " + kv[1]);
}

// keys() / values()
console.log("keys():", Array.from(params.keys()));
console.log("values():", Array.from(params.values()));

// forEach
console.log("forEach:");
params.forEach(function (value, key) {
  console.log("  " + key + " => " + value);
});

// ---- 4. 独立使用 URLSearchParams ----
console.log("\\n===== 4. 构造查询字符串 =====");
// 从对象构造
var search1 = new URLSearchParams({
  name: "张三",
  age: "25",
  city: "北京",
});
console.log("从对象:", search1.toString());
console.log("解码:", decodeURIComponent(search1.toString()));

// 从字符串构造
var search2 = new URLSearchParams("foo=bar&baz=qux");
console.log("从字符串:", search2.toString());

// 从数组构造（支持同键多值）
var search3 = new URLSearchParams([["a", "1"], ["a", "2"], ["b", "3"]]);
console.log("从数组:", search3.toString());
console.log("a 的所有值:", search3.getAll("a"));

// ---- 5. Legacy API：url.parse / url.format ----
console.log("\\n===== 5. Legacy API (url.parse / url.format) =====");
try {
  var parsed = url.parse("https://example.com:3000/path?q=hello&n=42#section", true);
  console.log("url.parse 结果:");
  console.log("  protocol:", parsed.protocol);
  console.log("  hostname:", parsed.hostname);
  console.log("  port:", parsed.port);
  console.log("  pathname:", parsed.pathname);
  console.log("  query:", JSON.stringify(parsed.query));
  console.log("  hash:", parsed.hash);

  // url.format：将对象转回 URL 字符串
  var formatted = url.format({
    protocol: "https",
    hostname: "example.com",
    port: 8080,
    pathname: "/api/data",
    query: { id: 1, type: "json" },
  });
  console.log("url.format:", formatted);
} catch (e) {
  console.log("Legacy API 提示:", e.message);
}

// ---- 6. 相对路径解析 ----
console.log("\\n===== 6. 相对路径解析 =====");
// new URL(relative, base) 解析相对路径
var base = new URL("https://example.com/docs/intro/");
console.log("base:", base.href);

var img = new URL("./images/logo.png", base);
console.log("./images/logo.png →", img.href);

var style = new URL("../style.css", base);
console.log("../style.css →", style.href);

var root = new URL("/root.js", base);
console.log("/root.js →", root.href);

var abs = new URL("https://cdn.example.com/lib.js", base);
console.log("绝对 URL →", abs.href);

// url.resolve（Legacy 方式）
console.log("\\nurl.resolve (Legacy):");
console.log("  '/a/b/c' + './d':", url.resolve("/a/b/c", "./d"));
console.log("  '/a/b/c' + '../d':", url.resolve("/a/b/c", "../d"));

// ---- 7. file URL 与路径转换 ----
console.log("\\n===== 7. file URL 转换 =====");
// pathToFileURL：本地路径 → file:// URL
var fileUrl = url.pathToFileURL(__filename);
console.log("pathToFileURL:", fileUrl.href);

// fileURLToPath：file:// URL → 本地路径
var backToPath = url.fileURLToPath(fileUrl);
console.log("fileURLToPath:", backToPath);
console.log("转换一致:", backToPath === __filename);

// ---- 8. 国际化域名 ----
console.log("\\n===== 8. 国际化域名 =====");
console.log("domainToASCII('你好.com'):", url.domainToASCII("你好.com"));
console.log("domainToUnicode('xn--nnqy534a.com'):", url.domainToUnicode("xn--nnqy534a.com"));

// ---- 9. 实战：构建 API 请求 URL ----
console.log("\\n===== 9. 实战：构建 API URL =====");
function buildApiUrl(base, path, queryParams) {
  var apiUrl = new URL(path, base);
  if (queryParams) {
    Object.entries(queryParams).forEach(function (entry) {
      var key = entry[0], value = entry[1];
      if (Array.isArray(value)) {
        value.forEach(function (v) {
          apiUrl.searchParams.append(key, String(v));
        });
      } else {
        apiUrl.searchParams.set(key, String(value));
      }
    });
  }
  return apiUrl;
}

var apiUrl = buildApiUrl("https://api.example.com/v1/", "users/search", {
  q: "node.js",
  page: 1,
  limit: 20,
  tags: ["backend", "server"],
  sort: "desc",
});
console.log("构建的 API URL:", apiUrl.href);
console.log("pathname:", apiUrl.pathname);
console.log("查询参数:");
apiUrl.searchParams.forEach(function (v, k) {
  console.log("  " + k + " = " + v);
});

// ---- 10. 实战：URL 编码对比 ----
console.log("\\n===== 10. URL 编码对比 =====");
// URLSearchParams 自动编码特殊字符
var encoded = new URLSearchParams({
  msg: "Hello World & <script>",
  path: "/a/b/c",
  eq: "a=b=c",
});
console.log("自动编码:", encoded.toString());
console.log("解码:", decodeURIComponent(encoded.toString()));

// 特殊字符编码
var specialChars = new URLSearchParams({ path: "/a/b/c", eq: "a=b=c" });
console.log("特殊字符:", specialChars.toString());

// ---- 11. 常见陷阱提醒 ----
console.log("\\n===== 11. 常见陷阱 =====");
console.log("  1. protocol 含冒号: 'https:' 不是 'https'");
console.log("  2. get() 只返回第一个值，多值用 getAll()");
console.log("  3. new URL() 需要完整 URL，相对路径需要 base");
console.log("  4. URLSearchParams 自动编码中文等特殊字符");
console.log("  5. host 含端口，hostname 不含端口");
console.log("  6. url.parse() 已废弃，推荐 new URL()");

console.log("\\n===== URL 解析与构造演示结束 =====");`,
  },
];