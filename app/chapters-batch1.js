// =============================================================
// Node.js 交互式教程 —— 第一批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. intro    — Node.js 简介
//   2. modules  — 模块系统 (CommonJS)
//   3. globals  — 全局对象
//   4. path     — Path 路径模块
//   5. fs       — 文件系统 (fs)
//   6. os       — OS 操作系统模块
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
  // 第一章：Node.js 简介
  // =========================================================
  {
    id: "intro",
    title: "Node.js 简介",
    icon: "📘",
    group: "基础入门",
    content: `## 什么是 Node.js？

Node.js 是一个**基于 V8 JavaScript 引擎**构建的、开源的、跨平台的 JavaScript 运行时环境（Runtime）。它让 JavaScript 能够脱离浏览器，在服务器端、命令行工具、桌面应用等场景中运行。简单来说，**浏览器让 JavaScript 运行在客户端，而 Node.js 让 JavaScript 运行在服务端**。

### 起源故事

2009 年，**Ryan Dahl** 在欧洲 JSConf 上首次公布 Node.js 项目。当时他发现一个令人沮丧的问题：Apache HTTP Server（当时最流行的 Web 服务器）在处理每个并发连接时都会创建一个新线程或进程，当并发连接数达到上万时，系统资源会被线程上下文切换消耗殆尽。他意识到，**大多数服务端程序的实际工作是等待 I/O（等待数据库返回、等待磁盘读取、等待网络响应），而不是做 CPU 计算**。既然大部分时间在"等"，为什么不用单线程 + 事件驱动的方式来做？

于是他选择了 Google Chrome 的 **V8 引擎**（一个用 C++ 编写的高性能 JavaScript 引擎），搭配他自己编写的 **libuv** 库（一个跨平台的异步 I/O 库），创造了 Node.js。

### 为什么选 V8？

Ryan Dahl 选择 V8 有几个关键原因：

1. **速度极快**：V8 使用即时编译（JIT）技术，把 JavaScript 直接编译成机器码执行，性能远超传统的解释器。在 2009 年的基准测试中，V8 比 SpiderMonkey（Firefox 的引擎）快数倍。
2. **C++ 编写，可嵌入**：V8 被设计为一个可嵌入的库，任何 C++ 程序都可以把它集成进来，这正好符合 Node.js 作为"V8 + 额外能力"的设计理念。
3. **Google 持续投入**：Google 在 Chrome 浏览器上投入了大量资源优化 V8，Node.js 可以免费"搭便车"享受这些优化。
4. **标准兼容**：V8 严格遵循 ECMAScript 标准，代码可移植性好。

### 事件驱动、非阻塞 I/O 与单线程的深层原理

这是 Node.js 三个最核心的特性，它们是紧密关联的，需要一起理解。

#### 1. 单线程 ≠ 没有并发

很多人听到"单线程"就觉得 Node.js 不能并发，这是一个误解。Node.js 的**主线程**（JavaScript 执行线程）确实是单线程的，但它背后有一个 **libuv 线程池**（默认 4 个线程，可通过 \`UV_THREADPOOL_SIZE\` 环境变量调整到最多 1024），专门处理那些无法异步完成的 I/O 操作。

工作流程是这样的：
- 当 Node.js 遇到一个 I/O 操作（如读文件、DNS 查询、加密计算），它不会在主线程等待，而是把这个任务交给 libuv 线程池或操作系统异步机制。
- 主线程继续执行后面的 JavaScript 代码。
- 当 I/O 操作完成，libuv 会把"完成"这个事件放入事件循环的队列。
- 事件循环在合适的时机取出这个事件，执行对应的 JavaScript 回调函数。

所以，**JavaScript 代码始终在单线程中执行，但 I/O 操作是真正并行的**。

#### 2. 事件循环（Event Loop）

事件循环是 Node.js 异步能力的核心引擎。它本质上是一个无限循环，不断地检查各个阶段的队列里有没有待处理的任务。事件循环分为 6 个主要阶段：

| 阶段 | 说明 | 处理的内容 |
| --- | --- | --- |
| **timers** | 执行到期的定时器回调 | setTimeout / setInterval 到期的回调 |
| **pending callbacks** | 执行系统级回调 | TCP 错误回调、DNS 错误等 |
| **idle/prepare** | 内部使用 | libuv 内部处理，开发者一般不接触 |
| **poll** | 获取新的 I/O 事件，执行 I/O 回调 | 文件读取完成、网络数据到达等 |
| **check** | 执行 setImmediate 回调 | setImmediate 注册的回调 |
| **close callbacks** | 关闭事件回调 | socket.destroy() 后的 close 事件 |

每个阶段之间，事件循环会检查两个微任务队列：
- **nextTick 队列**：process.nextTick 注册的回调（优先级最高）
- **微任务队列**：Promise.then 注册的回调

#### 3. libuv 线程池

libuv 提供了一个线程池（默认大小 4），用于处理那些操作系统不提供异步 API 的操作，包括：
- **文件系统操作**（大部分 fs 操作）
- **DNS 查询**（dns.lookup）
- **CPU 密集型加密操作**（crypto.pbkdf2、crypto.scrypt 等）
- **Zlib 压缩**（某些场景）

> 注意：网络 I/O（HTTP 请求、TCP 连接）通常不需要线程池，因为操作系统提供了 epoll（Linux）/kqueue（macOS）/IOCP（Windows）等真正的异步机制。

### 与浏览器 JavaScript 的全面对比

| 维度 | 浏览器中的 JavaScript | Node.js 中的 JavaScript |
| --- | --- | --- |
| **全局对象** | window, document, localStorage | global, globalThis, process |
| **DOM 操作** | 有（document.getElementById 等） | 无 |
| **BOM 操作** | 有（location, history, navigator） | 无 |
| **文件系统** | 受限（File API 只能读用户选择的文件） | 完整的 fs 模块，可任意读写 |
| **网络通信** | fetch, XMLHttpRequest, WebSocket | http/https 模块，可创建服务器和发起请求 |
| **模块系统** | ES Modules（import/export） | CommonJS（默认）+ ES Modules |
| **运行环境** | 浏览器沙箱，受安全策略限制 | 操作系统级别，可访问所有系统资源 |
| **多线程** | Web Workers（受限） | Worker Threads（更强大），Cluster（多进程） |
| **定时器** | setTimeout, setInterval, requestAnimationFrame | setTimeout, setInterval, setImmediate, process.nextTick |
| **Buffer/二进制** | ArrayBuffer, TypedArray, Blob | Buffer（更强大的二进制处理） |
| **入口** | HTML 页面中的 script 标签 | node 命令执行 .js 文件 |
| **生命周期** | 随页面打开/关闭 | 由 process 控制，可监听退出事件 |
| **全局变量污染** | var 会污染 window | var 会污染 global（CommonJS 模块作用域内不会） |

### 适用场景与不适用场景（详细分析）

#### ✅ 非常适合的场景

1. **API 服务 / RESTful 后端**：大量时间花在等待数据库返回，Node.js 的事件循环能高效处理成千上万的并发连接。Netflix、LinkedIn、PayPal 都用 Node.js 做 API 服务。

2. **实时应用**：聊天系统、在线协作编辑、多人游戏、实时数据推送。Node.js 的事件驱动模型天然适合 WebSocket 长连接，能轻松维护大量并发连接。Slack 的部分服务就是 Node.js 构建的。

3. **中间层 / BFF（Backend for Frontend）**：前端团队可以用同一门语言（JavaScript）写后端，聚合多个微服务的 API，为前端定制数据格式。

4. **命令行工具**：npm 生态有大量 CLI 工具库（commander、yargs、inquirer、chalk），用 Node.js 写 CLI 极其方便。Webpack、Babel、ESLint、TypeScript 编译器都是 Node.js 工具。

5. **服务端渲染（SSR）**：Next.js、Nuxt.js 等框架用 Node.js 在服务端渲染 React/Vue 组件，提升首屏速度和 SEO。

6. **微服务**：轻量、启动快，适合做微服务的各个节点。

#### ❌ 不太适合的场景

1. **CPU 密集型任务**：如图像处理、视频编码、科学计算、大数据分析。因为主线程是单线程的，一个耗时的 CPU 计算会阻塞整个事件循环，所有其他请求都得等。解决方案：用 Worker Threads 把 CPU 任务放到子线程，或者用 C++ 原生扩展（N-API）。

2. **超低延迟高频交易系统**：这类系统通常用 C++ 或 Rust，对 GC 停顿极度敏感。Node.js 的 V8 引擎有垃圾回收（GC），虽然通常很快但不可控，高频交易无法接受任何不确定性。

3. **大型单体应用**：Node.js 更适合拆分成小服务，不适合构建巨大的单体应用。类型系统（TypeScript）可以缓解，但不如 Java/C# 那样成熟。

### Node.js 版本演进

Node.js 采用 **LTS（长期支持）** 和 **Current（当前版）** 双轨发版策略：

| 版本 | 发布年份 | 重要特性 |
| --- | --- | --- |
| v0.x | 2009-2015 | 初始版本，CommonJS 模块系统 |
| v4 | 2015 | 合并 io.js，引入 ES6 部分特性 |
| v6 | 2016 | Buffer 安全改进、更完整的 ES6 |
| v8 | 2017 | 引入 async/await、N-API |
| v10 | 2018 | fs.promises API、HTTP/2 稳定 |
| v12 | 2019 | Worker Threads 稳定、V8 7.4 |
| v14 | 2020 | 顶层 await（实验）、ESM 改进 |
| v16 | 2021 | Apple Silicon 支持、Timers Promises |
| v18 | 2022 | 内置 fetch、Test Runner、Web Streams |
| v20 | 2023 | 权限模型、stable Test Runner |
| v22 | 2024 | 内置 WebSocket 客户端、V8 12.4 |

**LTS 版本**每两年发布一个大版本，获得 30 个月的维护支持，适合生产环境。**Current 版本**包含最新特性但不稳定，适合尝鲜和开发。生产环境**务必使用 LTS 版本**。

### 安装方式

#### 方式一：nvm（Node Version Manager）—— 推荐

\`\`\`bash
# macOS / Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 安装最新 LTS 版
nvm install --lts

# 安装指定版本
nvm install 20.10.0

# 切换版本
nvm use 20

# 查看已安装版本
nvm ls
\`\`\`

nvm 的优势是可以在同一台机器上安装和切换多个 Node.js 版本，非常适合需要在不同项目间切换的开发场景。

#### 方式二：官方安装包

从 [nodejs.org](https://nodejs.org) 下载对应平台的安装包（.pkg / .msi），一路点击安装即可。缺点是只能装一个版本，切换不方便。

#### 方式三：Docker

\`\`\`bash
# 拉取官方镜像
docker pull node:20-lts

# 运行容器并进入交互式
docker run -it --rm node:20-lts node
\`\`\`

适合 CI/CD 环境和保持开发环境一致性。

### REPL 介绍

REPL（Read-Eval-Print Loop）是 Node.js 的交互式命令行环境。在终端输入 \`node\` 即可进入：

\`\`\`
$ node
> 1 + 2
3
> const x = 10
> x * 2
20
> .help    # 查看帮助
> .exit    # 退出
\`\`\`

REPL 的实用技巧：
- 输入 \`process\` 可以查看当前进程信息
- 按 Tab 键自动补全
- 输入 \`_\` 可以引用上一个表达式的结果
- \`.load file.js\` 可以加载并执行一个文件
- \`.save file.js\` 可以把当前 REPL 历史保存到文件

### Hello World 示例

最简单的 Node.js 程序：

\`\`\`js
console.log("Hello, Node.js!");
\`\`\`

把它保存为 \`hello.js\`，然后在终端执行 \`node hello.js\`。

下面这段代码演示了如何通过 \`process\` 全局对象获取 Node.js 运行时的各种信息，你可以修改后点击"运行代码"查看效果。`,
    code: `// ============================================================
// 第一章代码演示：Node.js 运行时信息全景
// ============================================================
// process 是 Node.js 的全局对象，无需 require 即可使用。
// 它提供了当前 Node.js 进程的各种信息和控制方法。

// ---- 1. 版本信息 ----
console.log("========== 版本信息 ==========");
// process.version: 完整的 Node.js 版本字符串，如 v20.10.0
console.log("Node.js 版本:", process.version);
// process.versions: 一个包含各组件版本的对象
// 包含 v8、uv（libuv）、zlib、openssl、modules 等
console.log("V8 引擎版本:", process.versions.v8);
console.log("libuv 版本:", process.versions.uv);
console.log("OpenSSL 版本:", process.versions.openssl);
// 打印完整的 versions 对象（用 JSON.stringify 格式化输出）
console.log("完整版本信息:");
console.log(JSON.stringify(process.versions, null, 2));

// ---- 2. 系统平台信息 ----
console.log("\\n========== 系统平台 ==========");
// process.platform: 操作系统平台
// 可能的值: 'darwin' (macOS), 'win32' (Windows), 'linux' (Linux), 'freebsd' 等
console.log("操作系统平台:", process.platform);
// process.arch: CPU 架构
// 可能的值: 'x64', 'arm64', 'ia32', 'arm', 'mips' 等
console.log("CPU 架构:", process.arch);
// process.pid: 当前进程的 ID（Process ID）
// 操作系统用它来唯一标识一个运行中的进程
console.log("进程 PID:", process.pid);

// ---- 3. 工作目录 ----
console.log("\\n========== 工作目录 ==========");
// process.cwd(): 返回当前工作目录（Current Working Directory）
// 注意：这是启动 Node.js 时所在的目录，不是脚本文件所在目录
// 脚本文件所在目录应该用 __dirname（CommonJS 中可用）
console.log("当前工作目录(cwd):", process.cwd());
// __dirname: 当前脚本文件所在的目录的绝对路径
console.log("__dirname:", __dirname);
// __filename: 当前脚本文件的绝对路径
console.log("__filename:", __filename);

// ---- 4. 命令行参数 ----
console.log("\\n========== 命令行参数 ==========");
// process.argv: 命令行参数数组
// argv[0] = node 可执行文件的路径
// argv[1] = 正在执行的脚本文件路径
// argv[2] 及之后 = 用户传入的额外参数
// 沙箱环境模拟了简化的 argv
console.log("argv 数组:", process.argv);

// ---- 5. 环境变量 ----
console.log("\\n========== 环境变量 ==========");
// process.env: 包含所有环境变量的对象
// 环境变量是操作系统级别的配置，Node.js 应用常通过它来传递配置
console.log("NODE_ENV:", process.env.NODE_ENV || "(未设置)");
console.log("HOME:", process.env.HOME || process.env.USERPROFILE || "(未知)");
console.log("PATH(前60字符):", (process.env.PATH || "").slice(0, 60) + "...");

// ---- 6. 内存使用情况 ----
console.log("\\n========== 内存使用 ==========");
// process.memoryUsage(): 返回描述 Node.js 进程内存使用情况的对象
const mem = process.memoryUsage();
// rss (Resident Set Size): 常驻内存集合，进程实际占用的物理内存
// 包括代码段、堆、栈等所有部分
console.log("rss (常驻内存):", (mem.rss / 1024 / 1024).toFixed(2), "MB");
// heapTotal: V8 堆的总量（已申请的堆空间）
console.log("heapTotal (堆总量):", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB");
// heapUsed: V8 堆中实际使用的部分
console.log("heapUsed (堆已用):", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB");
// external: V8 管理的 C++ 对象（如 Buffer）占用的内存
console.log("external (外部内存):", (mem.external / 1024 / 1024).toFixed(2), "MB");
// arrayBuffers: ArrayBuffer 和 SharedArrayBuffer 占用的内存
console.log("arrayBuffers:", ((mem.arrayBuffers || 0) / 1024 / 1024).toFixed(2), "MB");

// ---- 7. 进程运行时长 ----
console.log("\\n========== 运行时长 ==========");
// process.uptime(): 当前 Node.js 进程已经运行的秒数
console.log("进程已运行:", process.uptime().toFixed(4), "秒");

// ---- 8. 标准流 ----
console.log("\\n========== 标准流 ==========");
// process.stdout: 标准输出流（console.log 底层就是用它）
// 可以直接用 write 方法输出（不会自动换行，需要手动加 \\n）
process.stdout.write("这行用 process.stdout.write 输出");
process.stdout.write(" —— 接着输出\\n");
// process.stderr: 标准错误流（通常用于输出错误信息）
process.stderr.write("这行用 process.stderr 输出\\n");

// ---- 9. process.nextTick：微任务调度 ----
console.log("\\n========== nextTick 微任务 ==========");
// process.nextTick(fn): 在当前操作完成后、事件循环继续前执行 fn
// 它的优先级比 Promise.then 还高
console.log("1. 同步代码第一行");
process.nextTick(() => {
  console.log("3. nextTick 回调（在同步代码全部执行完后才运行）");
});
console.log("2. 同步代码第二行");
// 执行顺序: 1 → 2 → 3

// ---- 10. 进程退出事件 ----
console.log("\\n========== exit 事件 ==========");
// process.on('exit', cb): 监听进程退出事件
// 注意：此回调中只能执行同步操作，不能做异步 I/O
process.on("exit", (code) => {
  // eslint-disable-next-line no-console
  console.log("\\n[exit 事件] 进程即将退出，退出码:", code);
  console.log("[exit 事件] 此处只能执行同步操作");
});
console.log("注册了 exit 事件监听器，进程结束时会被调用");
console.log("\\n（程序继续执行到末尾后自动退出，届时会触发 exit 事件）");`,
  },

  // =========================================================
  // 第二章：模块系统 (CommonJS)
  // =========================================================
  {
    id: "modules",
    title: "模块系统 (CommonJS)",
    icon: "📦",
    group: "基础入门",
    content: `## 为什么需要模块系统？

### 没有模块系统时的噩梦

让我们先看一个真实的例子。假设你有一个 HTML 页面，引入了三个脚本：

\`\`\`html
<script src="utils.js"></script>
<script src="app.js"></script>
<script src="third-party.js"></script>
\`\`\`

这三个文件都运行在同一个全局作用域中。如果 \`utils.js\` 定义了 \`var name = "工具函数"\`，而 \`app.js\` 也定义了 \`var name = "主应用"\`，那么**后加载的会覆盖先加载的**。更糟糕的是，\`third-party.js\` 可能内部也用了 \`name\` 变量，导致三方库莫名其妙地出 bug。

这就是**全局变量污染**——所有代码共享一个全局作用域，变量名冲突变得不可避免。在小型项目中勉强可以接受，但当项目规模增大、引入多个第三方库时，这将成为噩梦。

模块系统就是为解决这个问题而生的。它的核心目标是：

1. **隔离作用域**：每个模块有自己的独立作用域，模块内部的变量不会污染全局，也不会被其他模块意外修改。
2. **复用代码**：把功能封装成模块，在多个项目中复用，不需要复制粘贴。
3. **依赖管理**：明确声明模块之间的依赖关系，按需加载，不需要手动管理 script 标签的顺序。
4. **封装实现**：只暴露必要的接口（API），隐藏内部实现细节，降低耦合。

---

## CommonJS 规范详解

Node.js 默认使用 **CommonJS** 模块规范。它由 Kevin Dangoor 在 2009 年发起的 ServerJS 工作组制定（后来改名为 CommonJS），目标是让 JavaScript 在服务端也能拥有模块化能力。

### 一句话理解 CommonJS

**每个 \`.js\` 文件就是一个独立的模块。** 文件内的变量和函数默认是私有的，只有通过 \`module.exports\` 或 \`exports\` 明确导出的内容，才能被其他文件通过 \`require()\` 导入。

### 三大核心 API 详解

| API | 作用 | 本质 | 比喻 |
| --- | --- | --- | --- |
| \`require(modulePath)\` | 导入模块 | 返回模块导出的对象（即 \`module.exports\`） | 像"取快递"——你拿到的是别人打包好的包裹 |
| \`module.exports\` | 导出模块 | **真正决定模块导出内容**的对象，require 返回的就是它 | 像"快递盒"——最终寄出去的就是这个盒子 |
| \`exports\` | 导出的快捷方式 | 初始时指向 \`module.exports\`，本质是引用 | 像"快递盒上的标签"——贴标签可以，但换盒子就不行 |

### 从一个最简单的例子开始

假设你有一个 \`math.js\` 文件：

\`\`\`javascript
// math.js —— 定义一个数学工具模块
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

const PI = 3.14159265;

// 把需要暴露的函数和常量挂到 module.exports 上
module.exports = {
  add: add,
  subtract: subtract,
  PI: PI
};
\`\`\`

然后在 \`app.js\` 中使用它：

\`\`\`javascript
// app.js —— 使用 math 模块
const math = require('./math');  // 导入 math.js，拿到它的导出对象

console.log(math.add(1, 2));        // 输出: 3
console.log(math.subtract(10, 3));  // 输出: 7
console.log(math.PI);               // 输出: 3.14159265
\`\`\`

运行 \`node app.js\`，你会看到正确的输出。请注意：
- \`require('./math')\` 中的 \`./\` 表示"当前目录"，不能省略
- \`math\` 变量接收的就是 \`module.exports\` 对象
- add、subtract、PI 这三样是你可以使用的，math.js 内部的其他变量（如果有的话）你访问不到

### 模块作用域五大变量

每个 CommonJS 模块被包装在函数中执行，因此模块内部拥有以下"伪全局"变量。它们不是真正的全局变量，而是**函数参数注入**的：

| 变量 | 含义 | 典型用法 |
| --- | --- | --- |
| \`__filename\` | 当前模块文件的完整路径 | 读取同目录下的配置文件 |
| \`__dirname\` | 当前模块文件所在目录的完整路径 | 拼接其他文件的路径 |
| \`require\` | 当前模块专属的 require 函数 | 导入其他模块 |
| \`module\` | 当前模块的 module 对象 | 获取 module.parent、module.children |
| \`exports\` | module.exports 的引用 | 导出多个值时的快捷方式 |

**动手验证**：在任意 \`.js\` 文件中加一行 \`console.log(__filename)\`，然后 \`node\` 运行它，你会看到当前文件的完整路径。

---

## require 的工作流程（五步详解）

当你调用 \`require('./math')\` 时，Node.js 内部经历以下五个步骤。每一步都有精确的算法规则，理解它们能帮你诊断各种模块加载问题。

### 步骤 1：路径解析（Resolution）—— 确定"去哪里找"

首先要确定模块的绝对路径。根据 require 参数的不同形式，解析方式截然不同：

| 参数形式 | 分类 | 解析方式 | 示例 |
| --- | --- | --- | --- |
| \`require('fs')\` | 核心模块 | 直接返回内置模块，**速度最快** | fs, path, http, crypto, os, events 等 |
| \`require('./utils')\` | 相对路径文件 | 以当前文件所在目录为起点拼接 | \`./utils\` → \`/home/project/src/utils\` |
| \`require('../utils')\` | 相对路径文件 | 向上一级目录拼接 | \`../utils\` → \`/home/project/utils\` |
| \`require('/abs/path')\` | 绝对路径文件 | 直接使用，不做转换 | \`/usr/local/lib/myModule\` |
| \`require('lodash')\` | 第三方包 | 从当前目录逐级向上查找 node_modules | 见下方详解 |

**核心模块的优先级最高**。即使你在 \`node_modules\` 里放了一个叫 \`fs\` 的文件夹，\`require('fs')\` 返回的依然是 Node.js 内置的文件系统模块，不会被你的文件夹覆盖。

**node_modules 查找算法（逐级向上）**：

这是 Node.js 最精妙的设计之一。从当前文件所在目录开始，逐级向上查找 \`node_modules\` 目录，直到文件系统根目录。

例如，在 \`/home/user/project/src/app.js\` 中 \`require('lodash')\`，Node.js 会依次查找：

\`\`\`
① /home/user/project/src/node_modules/lodash/
② /home/user/project/node_modules/lodash/
③ /home/user/node_modules/lodash/
④ /home/node_modules/lodash/
⑤ /node_modules/lodash/
\`\`\`

**这意味着什么？** 你可以在项目根目录 \`npm install lodash\`，它会被安装到 \`/home/user/project/node_modules/lodash/\`。无论你的代码在 \`src/\` 还是 \`src/utils/\` 还是 \`src/utils/deep/\`，\`require('lodash')\` 都能找到它——因为 Node.js 会一路向上搜索，直到找到为止。

**npm 的 \`node_modules\` 扁平化**：npm v3+ 会尽量把依赖安装在项目根目录的 \`node_modules\` 中，避免嵌套过深。但如果有版本冲突，npm 会在子目录创建自己的 \`node_modules\` 来安装特定版本。

**NODE_PATH 环境变量**：还可以通过设置 \`NODE_PATH\` 环境变量添加额外的模块搜索路径。但**不推荐**在生产中使用，因为它会破坏模块的可移植性——你的代码换一台机器就可能找不到模块。

### 步骤 2：文件定位（File Location）—— 确定"具体是哪个文件"

找到目标目录后，还需要确定具体加载哪个文件。这涉及扩展名补全和目录加载两层逻辑。

**扩展名补全规则**（按顺序尝试，找到即停）：

\`require('./math')\` 会依次尝试以下文件：
1. \`./math\` —— 精确匹配文件名（不加扩展名）
2. \`./math.js\` —— JavaScript 文件
3. \`./math.json\` —— JSON 文件
4. \`./math.node\` —— C++ 编译的二进制模块（\`.node\` 扩展名）

**关于 \`.json\` 文件**：当你 \`require('./config.json')\` 时，Node.js 会读取文件内容，自动调用 \`JSON.parse()\` 解析，然后把解析后的对象赋值给 \`module.exports\`。不需要手动 \`fs.readFileSync\` + \`JSON.parse\`。

**目录加载规则**（当找到了一个**目录**而非文件时）：

\`require('./myModule')\` 如果 \`myModule\` 是一个目录，Node.js 会：
1. 读取目录下的 \`package.json\`，取 \`"main"\` 字段指定的文件（如 \`"main": "lib/index.js"\`）
2. 如果没有 \`package.json\` 或 main 指向的文件不存在，尝试 \`index.js\`
3. 再尝试 \`index.json\`
4. 最后尝试 \`index.node\`

这就是为什么很多 npm 包的主入口是 \`index.js\`——因为这是 Node.js 的默认行为。

**\`require.resolve()\` 方法**：只做路径解析和文件定位，不执行模块。返回模块的绝对路径字符串，常用于检查模块是否存在：

\`\`\`javascript
// 获取模块的绝对路径，但不加载
const lodashPath = require.resolve('lodash');
console.log(lodashPath);
// 输出: "/home/user/project/node_modules/lodash/lodash.js"

// 如果找不到模块，抛出 MODULE_NOT_FOUND 错误
try {
  require.resolve('nonexistent-module');
} catch (e) {
  console.log(e.code); // 输出: 'MODULE_NOT_FOUND'
}
\`\`\`

### 步骤 3：包装（Wrapping）—— 给模块代码穿上"外套"

这是最关键的一步，也是很多初学者不理解的地方。Node.js 读取文件内容后，**不会直接执行它**，而是将代码包裹在一个**模块包装器函数**中：

\`\`\`javascript
// 你的 math.js 文件内容（原始代码）：
function add(a, b) { return a + b; }
module.exports = { add };

// Node.js 实际执行的是（包装后的代码）：
(function(exports, require, module, __filename, __dirname) {
  function add(a, b) { return a + b; }
  module.exports = { add };
});
\`\`\`

**为什么要包装？** 因为函数创建了新的作用域！\`add\` 函数被定义在包装器函数内部，所以它不会成为全局变量。这就是模块隔离的底层原理。

**动手看一下包装器**：运行下面这行代码，可以看到 \`module\` 内置模块暴露的包装器字符串：

\`\`\`javascript
const m = require('module');
console.log(m.wrapper[0]);
// 输出: '(function (exports, require, module, __filename, __dirname) { '
console.log(m.wrapper[1]);
// 输出: '\n});'
\`\`\`

**包装器的五个作用**：
1. **隔离作用域**：模块顶级声明的 \`var\`、\`let\`、\`const\` 不会污染全局
2. **注入专属变量**：每个模块有自己的 \`require\`、\`module\`、\`exports\`、\`__filename\`、\`__dirname\`
3. **隐式返回**：函数执行完后，\`module.exports\` 就是导出的值
4. **调试友好**：函数名保留在调用栈中，便于定位错误发生在哪个模块
5. **this 指向**：在模块顶级作用域中，\`this\` 等于 \`module.exports\`（初始为 \`{}\`）

### 步骤 4：编译执行（Compilation & Execution）—— 真正运行代码

根据文件扩展名使用不同的编译器：

| 扩展名 | 编译器 | 处理方式 |
| --- | --- | --- |
| \`.js\` | JavaScript 编译器 | 用 \`vm.compileFunction()\` 编译包装器函数，然后调用它 |
| \`.json\` | JSON 编译器 | 直接 \`JSON.parse()\` 后赋值给 \`module.exports\`，**不执行代码** |
| \`.node\` | 原生模块 | 用 \`process.dlopen()\` 加载 C++ 编译的二进制模块 |
| \`.mjs\` | ESM 加载器 | 走 ESM 解析流程，不走 CommonJS 包装器 |

**__filename 和 __dirname 的生成**：它们是包装器函数的参数，在函数调用前由 Node.js 计算：

\`\`\`javascript
// Node.js 内部伪代码：
const __filename = '/home/user/project/src/app.js';
const __dirname = path.dirname(__filename); // '/home/user/project/src'
// 然后把这两个值作为参数传给包装器函数
\`\`\`

### 步骤 5：缓存（Caching）—— 模块只执行一次

模块**第一次被加载时**会执行完整流程，执行后把 \`module.exports\` 对象缓存到 \`require.cache\` 中。之后再 require 同一个模块，**直接返回缓存的对象，不会再次执行模块代码**。

**缓存的工作原理**（用生活中的例子理解）：

想象你有一个"数据库连接"模块。第一次 \`require('./database')\` 时，模块代码执行，创建数据库连接，然后把连接对象缓存起来。之后 100 次、1000 次 \`require('./database')\`，返回的都是同一个连接对象，不会重复创建连接。

\`\`\`javascript
// 演示：缓存让模块只执行一次
// config.js 的内容：
console.log('config.js 被执行了！');
module.exports = { env: 'production' };

// app.js 的内容：
const config1 = require('./config'); // 输出: config.js 被执行了！
const config2 = require('./config'); // 不会输出，因为命中了缓存
console.log(config1 === config2);    // 输出: true（同一个对象）
\`\`\`

**缓存的关键特性**：
- 缓存键是模块的**绝对路径**（不是相对路径）
- 多次 require 同一个模块返回的是**同一个对象引用**
- 可以利用缓存实现**单例模式**（整个应用只有一个实例）
- 删除缓存可以**强制重新加载**模块

\`\`\`javascript
// 查看所有已缓存的模块
console.log(Object.keys(require.cache));

// 删除缓存，强制下次重新加载
const modulePath = require.resolve('./myModule');
delete require.cache[modulePath];

// 注意：删除缓存后，之前已获取的旧引用不会自动更新
// 需要重新 require 才能拿到新版本
\`\`\`

---

## module 对象详解

每个模块执行时，都有一个 \`module\` 对象表示当前模块本身。它就像模块的"身份证"：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| \`module.id\` | string | 模块标识符。主模块为 \`'.'\`，其他模块为其绝对路径 |
| \`module.exports\` | any | **模块的导出对象**，require 的返回值 |
| \`module.filename\` | string | 模块文件的完整路径 |
| \`module.path\` | string | 模块文件所在目录 |
| \`module.parent\` | object | 第一个 require 本模块的模块对象 |
| \`module.children\` | array | 本模块直接 require 的子模块列表 |
| \`module.loaded\` | boolean | 模块是否已完成加载 |
| \`module.paths\` | string[] | 本模块的 node_modules 搜索路径 |
| \`module.require\` | function | 本模块的 require 函数（和全局 require 一样） |

### module.parent 与 module.children —— 模块的"父子关系"

每个模块都有一个 \`module.parent\`，指向第一个 require 它的模块。主模块（入口文件）的 \`module.parent\` 为 \`null\`。通过 \`module.children\` 可以遍历依赖树，了解整个应用的模块结构：

\`\`\`javascript
// 打印依赖树（可以看到模块之间的引用关系）
function printTree(mod, indent) {
  indent = indent || '';
  console.log(indent + '├── ' + mod.filename);
  mod.children.forEach(function(child) {
    printTree(child, indent + '│   ');
  });
}
// 在入口文件 app.js 中运行：
printTree(module);
\`\`\`

### \`require.main\` —— 判断"我是主模块吗？"

\`require.main\` 指向程序的入口模块。这是一个非常实用的技巧，可以让你写一个模块既可以被其他模块 require，也可以直接运行：

\`\`\`javascript
// 一个模块既可以被 require，也可以直接运行
function myFunction() {
  return 'Hello World';
}

// 如果当前模块是入口模块（被 node xxx.js 直接运行），执行测试代码
if (require.main === module) {
  console.log('直接运行这个模块，执行测试:');
  console.log(myFunction()); // 输出: Hello World
}

// 导出给其他模块使用
module.exports = myFunction;
\`\`\`

---

## module.exports vs exports 陷阱（深度剖析）

这是 CommonJS 最常见也最容易出错的陷阱。很多人在这里掉坑，花几个小时 debug。理解它需要明白 JavaScript 的**引用传递**机制。

### 用"快递"来理解

\`\`\`
│   module.exports  = 快递盒 （最终寄出去的就是这个）
│   exports         = 快递盒上的标签 （贴标签可以，换盒子不行）
│   require()       = 收快递 （拿到的是快递盒里的内容）
\`\`\`

### 内存模型图解

\`\`\`javascript
// Node.js 在模块内部初始化时做了这两件事：
// module.exports = {};        // 创建一个空对象，假设内存地址为 0x001
// exports = module.exports;   // exports 和 module.exports 都指向地址 0x001
//
// 内存状态（可视化）：
//   module.exports ───┐
//                     ├──► { }  (地址 0x001)
//   exports ──────────┘
//   两个变量指向同一个对象！
\`\`\`

### 四种典型场景（逐个分析）

**场景一：给 exports 添加属性 ✅ 正确——最常用的导出方式**

\`\`\`javascript
// 初始状态：module.exports = {} (0x001), exports → 0x001
exports.add = function(a, b) { return a + b; };
exports.subtract = function(a, b) { return a - b; };
exports.PI = 3.14;

// 内存变化：两个变量仍指向同一个对象，只是对象的内容变了
//   module.exports ───┐
//                     ├──► { add: fn, subtract: fn, PI: 3.14 } (0x001)
//   exports ──────────┘
// 结果：require 返回 { add: fn, subtract: fn, PI: 3.14 }  ✅
\`\`\`

**场景二：给 module.exports 赋新值 ✅ 正确——导出单个值**

\`\`\`javascript
// 初始状态：module.exports = {} (0x001), exports → 0x001
module.exports = function Calculator() {
  this.add = function(a, b) { return a + b; };
};

// 内存变化：module.exports 指向了新对象，exports 还指向旧对象
//   module.exports ──────► function Calculator() {} (0x002)
//   exports ─────────────► { } (0x001)  ← 被抛弃了，但没关系
// 结果：require 返回 Calculator 函数 ✅
// 使用时：const Calculator = require('./calculator');
//         const calc = new Calculator();
\`\`\`

**场景三：给 exports 赋新值 ❌ 错误——最常见的陷阱**

\`\`\`javascript
// 初始状态：module.exports = {} (0x001), exports → 0x001
exports = {
  add: function(a, b) { return a + b; },
  PI: 3.14
};

// 内存变化：exports 指向了新对象，但 module.exports 还是旧对象
//   module.exports ──────► { } (0x001)  ← require 返回这个空对象！
//   exports ─────────────► { add: fn, PI: 3.14 } (0x003)  ← 白写了！
// 结果：require 返回 {} ❌ 你的导出全部丢失！
\`\`\`

**场景四：混合使用 ✅ 正确——导出函数并附带属性**

\`\`\`javascript
// 导出主函数，同时附带工具方法
function main() {
  return '这是主功能';
}
main.version = '1.0.0';
main.helper = function() { return '这是辅助方法'; };

module.exports = main;

// 结果：require 返回 main 函数，同时可以访问 main.version 和 main.helper()
// 类比：express 就是这样导出的—— express() 是一个函数，
//        但 express.static()、express.json() 是它的属性
\`\`\`

### 终极口诀

> **最终导出的是 \`module.exports\`，不是 \`exports\`。\`exports\` 只是一个可能会被覆盖的引用。**
>
> - 如果你需要导出**多个值**（一个对象包含多个函数/常量），用 \`exports.xxx = ...\` 或 \`module.exports = { ... }\` 都可以。
> - 如果你需要导出**单个值**（一个函数、一个类、一个字符串），**必须**用 \`module.exports = ...\`。

---

## 模块缓存机制与循环依赖（深度剖析）

### 缓存的实际效果

\`require.cache\` 是一个普通 JavaScript 对象，键是模块的绝对文件路径，值是对应的 \`module\` 对象。你可以直接操作它：

\`\`\`javascript
// 查看缓存中有哪些模块
console.log(Object.keys(require.cache));

// 查看某个模块的缓存
const fsPath = require.resolve('fs');
console.log(require.cache[fsPath].loaded); // true
\`\`\`

### 热更新（Hot Reload）—— 利用缓存实现

开发环境中，你修改了配置文件，想让应用重新加载而不重启，可以利用缓存删除：

\`\`\`javascript
function reloadModule(moduleName) {
  // 1. 找到模块的绝对路径
  const modulePath = require.resolve(moduleName);
  // 2. 从缓存中删除
  delete require.cache[modulePath];
  // 3. 重新加载（此时会再次执行模块代码）
  return require(moduleName);
}

// 使用示例
const config1 = require('./config');
console.log(config1.version); // "1.0.0"

// 修改 config.js 后热更新
const config2 = reloadModule('./config');
console.log(config2.version); // "1.1.0"（新版本）

// ⚠️ 注意：config1 仍然是旧版本！旧引用不会自动更新
console.log(config1.version); // 还是 "1.0.0"
\`\`\`

### 循环依赖：当 A 引用 B，B 又引用 A

当模块 A require 模块 B，模块 B 又 require 模块 A 时，就形成了**循环依赖**。这在真实项目中很常见，比如两个模块互相引用对方的工具函数。

**Node.js 的处理方式**：返回当前已导出的部分（可能是不完整的）。

**执行时间线（按时间顺序）**：

\`\`\`
时间 1: a.js 开始执行
时间 2: a.js 设置了 exports.done = false
时间 3: a.js 调用 require('./b')，暂停执行
时间 4: b.js 开始执行
时间 5: b.js 设置了 exports.done = false
时间 6: b.js 调用 require('./a')，发现 a 已经在加载中
时间 7: b.js 拿到 a 的不完整导出 { done: false }
时间 8: b.js 输出 "b 中 a.done = false"
时间 9: b.js 设置 exports.done = true
时间 10: b.js 执行完毕，a.js 恢复执行
时间 11: a.js 拿到 b 的完整导出 { done: true }
时间 12: a.js 输出 "a 中 b.done = true"
时间 13: a.js 执行完毕
\`\`\`

**为什么不会无限循环？** 因为当 b require a 时，Node.js 发现 a 已经在加载中（有缓存但 loaded=false），就直接返回 a 当前的不完整导出，不会再执行 a——这就是缓存的另一个作用：**防止无限递归**。

**三个实战建议**：
1. **尽量避免循环依赖**：把共享代码提取到第三个模块（如 \`common.js\`）
2. **如果必须循环依赖**：把需要被依赖的导出放在模块**最顶部**，确保另一方 require 时能拿到
3. **延迟 require**：把 \`require()\` 放在函数内部，而不是模块顶层，这样只有在函数被调用时才会触发 require，绕过了循环依赖

---

## package.json 中的模块相关字段

### \`"main"\` 字段 —— 指定包的入口文件

当你发布一个 npm 包时，别人 \`require('my-package')\` 会加载哪个文件？由 \`"main"\` 决定：

\`\`\`json
{
  "name": "my-package",
  "version": "1.0.0",
  "main": "dist/index.js"   // 默认值为 "index.js"
}
\`\`\`

### \`"exports"\` 字段（Node.js 12.7+）—— 更强大的模块封装

\`"exports"\` 比 \`"main"\` 更强大，可以精确控制包的哪些部分可以被外部访问：

\`\`\`json
{
  "name": "my-package",
  "exports": {
    ".": "./dist/index.js",           // 主入口：require('my-package')
    "./utils": "./dist/utils.js",     // 子路径：require('my-package/utils')
    "./package.json": "./package.json" // 允许读取 package.json
  }
}
\`\`\`

**关键特性：封装**。一旦定义了 \`"exports"\`，外部就不能 \`require('my-package/dist/internal.js')\`——只有 exports 中明确声明的路径才能被访问。这提供了真正的模块封装，防止外部代码绕过 API 直接访问内部实现。

### 条件导出 —— 同一个包在 ESM 和 CJS 中加载不同文件

\`\`\`json
{
  "exports": {
    ".": {
      "import": "./esm/index.mjs",     // import 时使用
      "require": "./cjs/index.cjs",    // require 时使用
      "default": "./dist/index.js"     // 兜底
    }
  }
}
\`\`\`

---

## ES Modules 深入

ES Modules（ESM）是 ECMAScript 官方的模块系统，从 Node.js v13.2 开始稳定支持。它是 JavaScript 的未来。

### 启用 ESM 的三种方式

1. **\`package.json\` 中设置 \`"type": "module"\`**（推荐，整个包都使用 ESM）
2. 使用 \`.mjs\` 扩展名（无论 package.json 怎么设置，.mjs 永远是 ESM）
3. 使用 \`.cjs\` 扩展名强制 CommonJS（在 type: "module" 的包中仍可用）

### ESM 导入导出完整语法

\`\`\`javascript
// ===== 导出方式 =====
// 1. 命名导出（边定义边导出）
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class Calculator {}

// 2. 导出列表（统一导出）
const version = '1.0.0';
const name = 'my-lib';
export { version, name };

// 3. 重命名导出
export { version as libraryVersion, name as libraryName };

// 4. 默认导出（每个模块只能有一个）
export default function main() {}

// 5. 重新导出（从其他模块转发）
export { default as App } from './App.js';
export * from './utils.js';

// ===== 导入方式 =====
// 1. 命名导入
import { PI, add } from './math.js';

// 2. 默认导入
import Calculator from './math.js';

// 3. 混合导入
import Calculator, { PI, add } from './math.js';

// 4. 命名空间导入
import * as math from './math.js';

// 5. 仅执行副作用（不导入任何内容）
import './init.js';

// 6. 动态导入（返回 Promise）
const module = await import('./math.js');
\`\`\`

### \`import.meta\` —— ESM 中的元数据

ESM 模块中没有 \`__dirname\` 和 \`__filename\`，用 \`import.meta\` 代替：

\`\`\`javascript
// import.meta.url 是当前模块的 URL（file:// 协议）
console.log(import.meta.url);
// 输出: "file:///home/user/project/app.mjs"

// 替代 __dirname 和 __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

### ESM 的"活绑定"—— 变量是引用，不是副本

ESM 的导入是**活绑定**，即导入的变量是导出的引用。当导出值改变时，导入方也会看到新值：

\`\`\`javascript
// counter.mjs
export let count = 0;
export function increment() { count++; }

// app.mjs
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1（活绑定，看到了变化）
\`\`\`

---

## CommonJS 与 ESM 完整对比

| 特性 | CommonJS (CJS) | ES Modules (ESM) |
| --- | --- | --- |
| **语法** | \`require()\` / \`module.exports\` | \`import\` / \`export\` |
| **加载时机** | 运行时，可放在条件/循环中 | 编译时静态分析，import 必须在顶层 |
| **加载方式** | 同步阻塞（服务端 OK） | 异步加载 |
| **this 指向** | 指向 \`module.exports\`（初始 {}） | \`undefined\` |
| **顶层 await** | 不支持 | 支持 |
| **__dirname / __filename** | 直接可用 | 需要 \`import.meta.url\` 转换 |
| **扩展名** | 可省略（.js/.json/.node） | 必须写完整 |
| **循环依赖** | 返回不完整对象 | 活绑定（变量引用） |
| **tree-shaking** | 不支持 | 支持（打包时可移除未使用代码） |
| **JSON 导入** | \`require('./data.json')\` | 需要 import assertion |

### 互操作规则

| 场景 | 是否支持 | 说明 |
| --- | --- | --- |
| ESM 中导入 CJS（默认导入） | ✅ | \`import cjs from './mod.cjs'\` → 拿到 module.exports |
| ESM 中导入 CJS（命名导入） | ✅ | \`import { method } from './mod.cjs'\` → 自动解构 |
| CJS 中导入 ESM（动态 import） | ✅ | \`const esm = await import('./mod.mjs')\` |
| CJS 中 require ESM | ❌ | 不能用 require 加载 ESM 模块 |

---

## 其他模块系统简介

### AMD — 浏览器的异步模块加载

\`\`\`javascript
define(['moduleA', 'moduleB'], function(a, b) {
  return { combine: function() { return a.x + b.y; } };
});
\`\`\`

### UMD — 兼容一切的万能包装

\`\`\`javascript
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);           // AMD
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();    // CommonJS
  } else {
    root.MyLib = factory();       // 浏览器全局变量
  }
}(typeof self !== 'undefined' ? self : this, function() {
  return { /* 库的代码 */ };
}));
\`\`\`

### 模块系统演进时间线

\`\`\`
2009 ─── CommonJS 规范诞生（ServerJS）
2010 ─── Node.js 采用 CommonJS
2011 ─── AMD 流行（RequireJS）
2014 ─── UMD 出现（兼容方案）
2015 ─── ES6 发布，ES Modules 成为标准
2017 ─── Node.js 8.5 引入 ESM 实验性支持
2019 ─── Node.js 13.2 ESM 稳定
2020+ ── 生态逐步迁移到 ESM，双包并存
\`\`\`

---

## 实战：模块设计最佳实践

### 1. 单一职责

一个模块只做一件事。如果一个模块导出了 10 个不相关的函数，就该拆分了。

### 2. 显式导出

\`\`\`javascript
// ✅ 推荐：在文件末尾一次性导出
module.exports = { add, subtract, multiply, PI };

// ❌ 避免：分散在文件各处，难以追踪
exports.add = add;
// ...（100 行后）
exports.PI = 3.14;
\`\`\`

### 3. 导出工厂函数而非实例

\`\`\`javascript
// ✅ 推荐：导出工厂函数，每个调用方有自己的实例
module.exports = function createLogger(options) { /* ... */ };

// ❌ 避免：导出实例，所有调用方共享状态
module.exports = new Logger();
\`\`\`

### 4. 模块顶层不要有副作用

\`\`\`javascript
// ❌ 避免：模块加载时产生副作用
console.log('模块被加载了！');
fs.writeFileSync('/tmp/log.txt', 'loaded');

// ✅ 推荐：封装在函数中
module.exports = function init() {
  console.log('初始化完成');
};
\`\`\`

### 5. 延迟 require 解决循环依赖

\`\`\`javascript
// 把 require 放在函数内部，延迟到调用时才加载
function doSomething() {
  const other = require('./other'); // 延迟加载
  return other.helper();
}
\`\`\`

下面这段代码在一个文件中用对象字面量模拟 CommonJS 的完整机制，涵盖导出/导入、缓存、循环依赖、exports 陷阱等所有核心概念。`,
    code: `// ============================================================
// 第二章代码演示：CommonJS 模块系统深度模拟
// ============================================================
// 沙箱环境只有一个文件，无法真正 require 自定义模块，
// 因此我们用「对象字面量 + 闭包」来模拟 CommonJS 的机制。
// 在真实项目中，这些代码会分散在多个 .js 文件中。

// ============================================================
// 演示 1：基础模块导出 / 导入（math 模块）
// ============================================================
// 真实 math.js 中的写法：
//   function add(a, b) { return a + b; }
//   function subtract(a, b) { return a - b; }
//   const PI = 3.14159265;
//   module.exports = { add, subtract, PI };
const mathModule = {
  add(a, b) { return a + b; },
  subtract(a, b) { return a - b; },
  multiply(a, b) { return a * b; },
  PI: 3.14159265,
  E: 2.71828182,
};
// 这等价于 require('./math') 的返回值
const math = mathModule;

console.log("===== 演示 1：基础模块导出 / 导入 =====");
console.log("add(3, 7) =", math.add(3, 7));
console.log("subtract(20, 8) =", math.subtract(20, 8));
console.log("multiply(6, 7) =", math.multiply(6, 7));
console.log("PI =", math.PI);
console.log("圆的面积(r=5):", math.PI * 5 * 5);

// ============================================================
// 演示 2：闭包实现私有状态（counter 模块）
// ============================================================
// CommonJS 模块天然支持闭包，可以创建私有变量
// 外部无法直接访问 count，只能通过方法操作
function createCounterModule() {
  let count = 0; // 模块级私有变量

  return {
    increment() { count++; return count; },
    decrement() { count--; return count; },
    getValue() { return count; },
    reset() { count = 0; },
  };
}

console.log("\\\\n===== 演示 2：闭包实现私有状态 =====");
const counter = createCounterModule();
console.log("初始值:", counter.getValue());
counter.increment(); counter.increment(); counter.increment();
console.log("加 3 次后:", counter.getValue());
counter.decrement();
console.log("减 1 次后:", counter.getValue());
counter.reset();
console.log("重置后:", counter.getValue());

// ============================================================
// 演示 3：导出构造函数 / 类
// ============================================================
// 真实 person.js 中：module.exports = Person;
// 然后 const Person = require('./person');
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.greet = function () {
  return "你好，我是 " + this.name + "，今年 " + this.age + " 岁";
};
Person.prototype.birthday = function () {
  this.age++;
  return this; // 链式调用
};

console.log("\\\\n===== 演示 3：导出构造函数 =====");
const person = new Person("小明", 20);
console.log(person.greet());
person.birthday().birthday();
console.log("过两次生日后:", person.greet());

// 检查 instanceof 关系
console.log("person instanceof Person:", person instanceof Person);

// ============================================================
// 演示 4：require.resolve() 模拟 —— 路径解析
// ============================================================
// require.resolve() 只解析路径，不执行模块，返回绝对路径
console.log("\\\\n===== 演示 4：require.resolve() 路径解析 =====");

// 用 path 模块展示真实的文件路径解析
const path = require("path");

// 模拟各种 require 参数形式的路径解析
const currentFile = __filename;
const currentDir = __dirname;

function simulateResolve(requirePath) {
  // 内置模块
  if (!requirePath.startsWith("./") && !requirePath.startsWith("../") && !requirePath.startsWith("/")) {
    return "[内置模块] " + requirePath;
  }
  // 相对路径：拼接当前目录
  if (requirePath.startsWith("./") || requirePath.startsWith("../")) {
    return path.resolve(currentDir, requirePath);
  }
  // 绝对路径
  return requirePath;
}

console.log("require('fs')        →", simulateResolve("fs"));
console.log("require('path')      →", simulateResolve("path"));
console.log("require('./utils')   →", simulateResolve("./utils"));
console.log("require('../config') →", simulateResolve("../config"));
console.log("require('/usr/lib')  →", simulateResolve("/usr/lib"));

// 真实环境中 require.resolve 返回模块绝对路径
console.log("\\\\n真实的 require.resolve:");
console.log("require.resolve('path') →", require.resolve("path"));
console.log("require.resolve('fs')   →", require.resolve("fs"));

// 找不到模块时抛出 MODULE_NOT_FOUND
try {
  require.resolve("nonexistent-module-xyz");
} catch (e) {
  console.log("require.resolve('不存在的模块') →", e.code);
}

// ============================================================
// 演示 5：module.exports vs exports 陷阱（内存模型可视化）
// ============================================================
console.log("\\\\n===== 演示 5：exports vs module.exports 内存模型 =====");

// 场景 1：给 exports 添加属性 ✅
console.log("--- 场景 1：给 exports 添加属性 ---");
let modExp1 = {};
let exp1 = modExp1; // exports = module.exports
exp1.add = function (a, b) { return a + b; };
exp1.PI = 3.14;
console.log("module.exports 有 add:", typeof modExp1.add); // function
console.log("module.exports 有 PI:", modExp1.PI); // 3.14
console.log("结果：✅ 正确，require 返回 { add: fn, PI: 3.14 }");

// 场景 2：给 module.exports 赋新值 ✅
console.log("\\\\n--- 场景 2：给 module.exports 赋新值 ---");
let modExp2 = {};
let exp2 = modExp2;
modExp2 = function greet(name) { return "Hello, " + name; };
console.log("module.exports 是函数:", typeof modExp2); // function
console.log("exports 还是旧对象:", typeof exp2); // object
console.log("结果：✅ 正确，require 返回 greet 函数");

// 场景 3：给 exports 赋新值 ❌
console.log("\\\\n--- 场景 3：给 exports 赋新值（常见错误）---");
let modExp3 = {};
let exp3 = modExp3;
exp3 = { multiply: function (a, b) { return a * b; } };
console.log("exports 有 multiply:", typeof exp3.multiply); // function
console.log("module.exports 有 multiply:", typeof modExp3.multiply); // undefined
console.log("module.exports 还是空对象:", JSON.stringify(modExp3)); // {}
console.log("结果：❌ 错误！require 返回 {}，你的导出全部丢失！");

// 场景 4：同时用两种方式 ✅
console.log("\\\\n--- 场景 4：混合使用（常见模式）---");
let modExp4 = {};
let exp4 = modExp4;
exp4.helper = function () { return "helper"; };
modExp4 = function main() { return "main"; };
modExp4.helper = exp4.helper; // 手动把 helper 挂到新对象上
console.log("main():", modExp4());
console.log("main.helper():", modExp4.helper());
console.log("结果：✅ 正确，手动合并实现完整导出");

// ============================================================
// 演示 6：require.cache 模拟 —— 缓存与单例
// ============================================================
console.log("\\\\n===== 演示 6：require.cache 缓存与单例 =====");

// 模拟 require.cache 结构
const fakeCache = {};

// 模拟一个"昂贵"的模块初始化
let loadCount = 0;
function loadDatabaseModule() {
  loadCount++;
  console.log("  ［数据库模块被加载！第 " + loadCount + " 次初始化］");
  return {
    connectionId: Math.floor(Math.random() * 10000),
    loadedAt: new Date().toISOString(),
    query: function (sql) { return "执行: " + sql; },
  };
}

function fakeRequire(modulePath) {
  if (fakeCache[modulePath]) {
    console.log("  ［命中缓存，直接返回！］");
    return fakeCache[modulePath];
  }
  const mod = loadDatabaseModule();
  fakeCache[modulePath] = mod;
  return mod;
}

console.log("第一次 require('./database'):");
const db1 = fakeRequire("./database");
console.log("  connectionId:", db1.connectionId);

console.log("第二次 require('./database'):");
const db2 = fakeRequire("./database");
console.log("  connectionId:", db2.connectionId);

console.log("第三次 require('./database'):");
const db3 = fakeRequire("./database");
console.log("  connectionId:", db3.connectionId);

console.log("\\\\n模块实际初始化次数:", loadCount, "（只有第一次真正初始化了模块）");
console.log("三次返回同一个对象:", db1 === db2 && db2 === db3);
console.log("这就是单例模式——所有 require 方共享同一个实例");

// 模拟删除缓存，强制重新加载
console.log("\\\\n删除缓存后重新加载:");
delete fakeCache["./database"];
const db4 = fakeRequire("./database");
console.log("  connectionId:", db4.connectionId, "（新的连接 ID）");

// ============================================================
// 演示 7：循环依赖模拟
// ============================================================
console.log("\\\\n===== 演示 7：循环依赖模拟 =====");

// 模拟循环依赖：a.js → b.js → a.js
// Node.js 的处理方式：遇到 require 时立即创建模块缓存条目（空 exports），
// 然后执行模块代码。如果被依赖的模块又 require 回来，会拿到不完整的 exports。
function simulateCircleDependency() {
  var cache = {};

  function createModule(filename, factory) {
    // 模拟 Node.js 的模块加载逻辑
    var mod = { exports: {}, loaded: false, filename: filename };
    cache[filename] = mod;

    // 如果模块已经在加载中（loaded=false 但有缓存），
    // 直接返回不完整的 exports（防止无限递归）
    var requireFn = function (dep) {
      if (cache[dep] && !cache[dep].loaded) {
        console.log("  [" + dep + " 还在加载中，返回不完整导出]");
        return cache[dep].exports;
      }
      if (!cache[dep]) {
        console.log("  [错误：" + dep + " 模块不存在]");
        return {};
      }
      return cache[dep].exports;
    };

    factory(mod.exports, requireFn, mod);
    mod.loaded = true;
    return mod;
  }

  // 关键：先把 b.js 放入缓存（模拟 Node.js 在 require 时创建模块对象）
  // 这模拟了 Node.js 的真实行为：模块解析后立即创建 Module 实例并放入缓存
  var bModule = { exports: {}, loaded: false, filename: "b.js" };
  cache["b.js"] = bModule;

  // 模块 a：a.js 依赖 b.js
  var modA = createModule("a.js", function (exports, require) {
    console.log("a.js 开始执行");
    exports.done = false;

    // 此时 b.js 在缓存中但未加载（loaded=false）
    // 模拟 Node.js 加载 b.js
    console.log("a.js 触发 b.js 的加载...");
    (function (exp, req) {
      console.log("b.js 开始执行");
      exp.done = false;
      // b.js 又 require a.js —— 此时 a.js 在缓存中且 loaded=false
      var a = req("a.js"); // 循环依赖！拿到不完整的 a
      console.log("b.js 中 a.done =", a.done, "（a 还不完整！）");
      exp.done = true;
      console.log("b.js 执行完毕");
    })(bModule.exports, require);
    bModule.loaded = true;

    var b = require("b.js"); // b 已加载完成
    console.log("a.js 中 b.done =", b.done);
    exports.done = true;
    console.log("a.js 执行完毕");
  });

  console.log("\\\\nA 模块的最终导出:", JSON.stringify(modA.exports));
  console.log("B 模块的最终导出:", JSON.stringify(bModule.exports));
  console.log("核心：b 拿到 a 时 a 还不完整（done=false），而 a 拿到 b 时 b 已完整");
}

simulateCircleDependency();

// ============================================================
// 演示 8：module 对象结构
// ============================================================
console.log("\\\\n===== 演示 8：module 对象结构 =====");

// 在真实模块中，module 对象有以下属性
const sampleModule = {
  id: ".",                // 主模块为 '.'，其他模块为绝对路径
  path: __dirname,        // 模块所在目录
  exports: {},            // 导出对象
  filename: __filename,   // 文件完整路径
  loaded: true,           // 是否已加载完成
  parent: null,           // 第一个 require 本模块的模块
  children: [],           // 子模块列表
  paths: [                // node_modules 查找路径
    path.join(__dirname, "node_modules"),
    path.join(path.dirname(__dirname), "node_modules"),
    "/node_modules",
  ],
  require: function () {},// 模块专属的 require
};

console.log("module.id:", sampleModule.id);
console.log("module.filename:", sampleModule.filename);
console.log("module.path:", sampleModule.path);
console.log("module.loaded:", sampleModule.loaded);
console.log("module.parent:", sampleModule.parent);
console.log("module.children 数量:", sampleModule.children.length);
console.log("module.paths 数量:", sampleModule.paths.length);

// ============================================================
// 演示 9：require.main === module（判断入口模块）
// ============================================================
console.log("\\\\n===== 演示 9：require.main === module =====");

// 模拟：如果当前模块是入口模块
function isMainModule(mainRef, currentMod) {
  return mainRef === currentMod;
}

const entryModule = { id: "." };
const otherModule = { id: "/some/path.js" };

console.log("主模块的情况:", isMainModule(entryModule, entryModule));
console.log("被 require 的模块:", isMainModule(entryModule, otherModule));

// 在真实环境中，可以这样判断：
// if (require.main === module) {
//   console.log("我是入口模块");
// } else {
//   console.log("我被其他模块 require 了");
// }

// ============================================================
// 演示 10：模拟 node_modules 逐级查找算法
// ============================================================
console.log("\\\\n===== 演示 10：node_modules 逐级查找 =====");

function simulateNodeModulesLookup(startDir, moduleName) {
  const parts = startDir.split("/");
  const searchPaths = [];

  for (let i = parts.length; i >= 1; i--) {
    const candidate = parts.slice(0, i).join("/") + "/node_modules/" + moduleName;
    searchPaths.push(candidate);
  }

  // 也搜索根目录下的 node_modules
  searchPaths.push("/node_modules/" + moduleName);

  return searchPaths;
}

const lookupPaths = simulateNodeModulesLookup("/home/user/project/src", "lodash");
lookupPaths.forEach(function (p, i) {
  console.log("  " + (i + 1) + ". " + p);
});
console.log("Node.js 会按顺序逐个查找，找到即停止");

// ============================================================
// 演示 11：模块热加载模拟
// ============================================================
console.log("\\\\n===== 演示 11：模块热加载 =====");

function createConfigModule() {
  return {
    version: "1.0.0",
    debug: false,
    updatedAt: new Date().toISOString(),
  };
}

const hotCache = {};
function hotRequire(name) {
  if (!hotCache[name]) {
    console.log("  首次加载模块 '" + name + "'");
    hotCache[name] = createConfigModule();
  }
  return hotCache[name];
}
function hotReload(name) {
  console.log("  热更新模块 '" + name + "'");
  delete hotCache[name];
  return hotRequire(name);
}

console.log("首次加载:");
const cfg1 = hotRequire("config");
console.log("  version:", cfg1.version, "| updatedAt:", cfg1.updatedAt);

// 等待一小段时间模拟修改
setTimeout(() => {
  console.log("\\\\n热更新后:");
  const cfg2 = hotReload("config");
  console.log("  version:", cfg2.version, "| updatedAt:", cfg2.updatedAt);
  console.log("  cfg1 === cfg2:", cfg1 === cfg2, "（热更新返回新对象）");

  // ============================================================
  // 演示 12：模块设计最佳实践对比
  // ============================================================
  console.log("\\\\n===== 演示 12：模块设计最佳实践 =====");

  // ❌ 反模式：导出实例（共享状态）
  function LoggerInstance() {
    this.logs = [];
    this.log = function (msg) { this.logs.push(msg); };
    this.getLogs = function () { return this.logs; };
  }
  const sharedLogger = new LoggerInstance(); // 所有 require 方共享

  // ✅ 正确：导出工厂函数
  function createLogger() {
    var logs = []; // 每个实例独立
    return {
      log: function (msg) { logs.push(msg); },
      getLogs: function () { return logs; },
    };
  }

  console.log("--- 反模式：导出共享实例 ---");
  sharedLogger.log("A 记录的日志");
  sharedLogger.log("B 记录的日志");
  console.log("所有调用方共享日志:", sharedLogger.getLogs());

  console.log("\\\\n--- 推荐：导出工厂函数 ---");
  var loggerA = createLogger();
  var loggerB = createLogger();
  loggerA.log("A 的日志");
  loggerB.log("B 的日志");
  console.log("loggerA 的日志:", loggerA.getLogs());
  console.log("loggerB 的日志:", loggerB.getLogs());
  console.log("两个实例独立:", loggerA !== loggerB);

  console.log("\\\\n===== 所有演示完成 =====");
}, 100);`,
  },

  // =========================================================
  // 第三章：全局对象
  // =========================================================
  {
    id: "globals",
    title: "全局对象",
    icon: "🌐",
    group: "基础入门",
    content: `## Node.js 全局对象体系

在 Node.js 中，"全局"对象分为几个不同的层次，理解它们的区别对于掌握 Node.js 的作用域规则至关重要。

### 全局对象 vs 模块作用域 vs 函数作用域

| 层次 | 说明 | 变量是否污染全局 |
| --- | --- | --- |
| **全局作用域** | 在所有模块中都能访问 | 是 |
| **模块作用域** | 模块文件内部的顶级作用域 | 否（每个模块独立） |
| **函数作用域** | 函数内部的局部作用域 | 否 |

在 CommonJS 模块中，每个文件被包装在一个函数中执行，所以**模块的顶级 \`var\` 声明不会污染全局对象**。这与浏览器不同——在浏览器中，顶级 \`var x = 1\` 会让 \`window.x\` 变成 1。

\`\`\`javascript
// 在 Node.js 模块中
var x = 10;
console.log(global.x);  // undefined —— 不会挂到 global 上！

// 在浏览器中
var x = 10;
console.log(window.x);  // 10 —— 会挂到 window 上
\`\`\`

### global / globalThis 的关系

- **\`global\`**：Node.js 专有的全局对象，类似浏览器的 \`window\`。
- **\`globalThis\`**：ES2020 引入的**跨环境统一**的全局对象名。在浏览器中指向 \`window\`，在 Node.js 中指向 \`global\`，在 Worker 中指向 \`self\`。

\`\`\`javascript
// 在 Node.js 中
console.log(global === globalThis);  // true
\`\`\`

**最佳实践**：写跨平台代码时用 \`globalThis\`，只在 Node.js 环境中用 \`global\`。

### process 对象概览

\`process\` 是 Node.js 最重要的全局对象之一，代表当前运行的 Node.js 进程。它本身是一个 \`EventEmitter\` 实例，可以监听和触发事件。

#### 常用属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| \`process.version\` | string | Node.js 版本，如 'v20.10.0' |
| \`process.versions\` | object | 各组件版本（V8, uv, openssl 等） |
| \`process.platform\` | string | 平台（'darwin'/'win32'/'linux'） |
| \`process.arch\` | string | CPU 架构（'x64'/'arm64'） |
| \`process.pid\` | number | 进程 ID |
| \`process.ppid\` | number | 父进程 ID |
| \`process.argv\` | string[] | 命令行参数数组 |
| \`process.env\` | object | 环境变量 |
| \`process.cwd()\` | string | 当前工作目录 |
| \`process.memoryUsage()\` | object | 内存使用情况 |
| \`process.uptime()\` | number | 进程运行时长（秒） |

#### 常用方法

| 方法 | 说明 |
| --- | --- |
| \`process.exit([code])\` | 退出进程（0=正常，非0=异常） |
| \`process.on(event, cb)\` | 监听进程事件 |
| \`process.chdir(dir)\` | 改变工作目录 |
| \`process.nextTick(cb)\` | 在事件循环继续前执行回调 |
| \`process.stdout.write(str)\` | 写标准输出（不换行） |
| \`process.stderr.write(str)\` | 写标准错误 |

#### 重要事件

| 事件 | 说明 |
| --- | --- |
| \`exit\` | 进程即将退出（只能执行同步操作） |
| \`SIGINT\` | 收到 Ctrl+C 中断信号 |
| \`SIGTERM\` | 收到终止信号（如 kill 命令） |
| \`uncaughtException\` | 未捕获的同步异常 |
| \`unhandledRejection\` | 未处理的 Promise 拒绝 |
| \`warning\` | Node.js 发出的警告 |

### console 的所有方法

\`console\` 对象提供了丰富的输出方法。在 Node.js 中，\`console\` 本质上是对 \`process.stdout\` 和 \`process.stderr\` 的封装。

| 方法 | 输出流 | 说明 |
| --- | --- | --- |
| \`console.log(...args)\` | stdout | 普通日志输出（最常用） |
| \`console.info(...args)\` | stdout | 信息级别（与 log 行为一致） |
| \`console.debug(...args)\` | stdout | 调试信息（默认不显示，需 --inspect） |
| \`console.warn(...args)\` | stderr | 警告信息 |
| \`console.error(...args)\` | stderr | 错误信息 |
| \`console.table(data)\` | stdout | 以表格形式展示数据 |
| \`console.dir(obj, opts)\` | stdout | 以对象形式展示（可配置深度） |
| \`console.trace(...args)\` | stderr | 输出调用栈 |
| \`console.time(label)\` | - | 开始计时 |
| \`console.timeEnd(label)\` | - | 结束计时并输出耗时 |
| \`console.timeLog(label)\` | - | 输出当前耗时（不结束计时） |
| \`console.group(label)\` | - | 分组输出（缩进） |
| \`console.groupEnd()\` | - | 结束分组 |
| \`console.groupCollapsed()\` | - | 折叠分组（Node.js 中与 group 一致） |
| \`console.assert(cond, msg)\` | stderr | 断言失败时输出错误 |
| \`console.count(label)\` | stdout | 计数器（输出 label 被调用的次数） |
| \`console.countReset(label)\` | - | 重置计数器 |
| \`console.clear()\` | - | 清屏 |

### Buffer 概览

\`Buffer\` 是 Node.js 处理二进制数据的全局对象。它类似一个字节数组（每个元素 0-255），但分配在 V8 堆外内存中，性能更高。Buffer 在文件操作、网络通信、加密等场景中无处不在。

\`\`\`javascript
// 从字符串创建
const buf = Buffer.from('Hello', 'utf8');
console.log(buf);              // <Buffer 48 65 6c 6c 6f>
console.log(buf.length);       // 5（字节长度）
console.log(buf.toString());   // 'Hello'

// 分配指定大小的 Buffer（填充 0，安全）
const buf2 = Buffer.alloc(8);
\`\`\`

> Buffer 有专门一章详细讲解，这里只做概览。

### __dirname / __filename

这两个变量是 **CommonJS 专有**的，在 ES Modules 中不可用。

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| \`__dirname\` | 当前文件所在目录的绝对路径 | \`/home/user/project/src\` |
| \`__filename\` | 当前文件的绝对路径 | \`/home/user/project/src/app.js\` |

**在 ESM 中如何获取？**

\`\`\`javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

### setTimeout / setInterval / setImmediate 对比

| API | 说明 | 返回值 | 清除方法 |
| --- | --- | --- | --- |
| \`setTimeout(fn, ms)\` | ms 毫秒后执行一次 | Timeout 对象 | \`clearTimeout\` |
| \`setInterval(fn, ms)\` | 每隔 ms 毫秒重复执行 | Timeout 对象 | \`clearInterval\` |
| \`setImmediate(fn)\` | 在当前事件循环 check 阶段执行 | Timeout 对象 | \`clearImmediate\` |

### queueMicrotask

\`queueMicrotask(fn)\` 把一个函数加入微任务队列，优先级与 \`Promise.then\` 相同，但**低于 \`process.nextTick\`**。

\`\`\`javascript
queueMicrotask(() => console.log('微任务'));
Promise.resolve().then(() => console.log('Promise then'));
process.nextTick(() => console.log('nextTick'));
// 执行顺序：nextTick → 微任务 → Promise then
\`\`\`

### 定时器执行顺序详解

为什么有时 \`setImmediate\` 比 \`setTimeout(fn, 0)\` 快？

在**主模块代码**中，\`setTimeout(fn, 0)\` 和 \`setImmediate(fn)\` 的执行顺序是**不确定**的——取决于事件循环启动时 1ms 是否已经过去。

但在 **I/O 回调**中，\`setImmediate\` **一定先于** \`setTimeout(fn, 0)\` 执行，因为 I/O 回调在 poll 阶段，紧接着就是 check 阶段（setImmediate），而 timers 阶段要等下一轮循环。

\`\`\`javascript
// 在 I/O 回调中：
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
  // 输出顺序一定是：setImmediate → setTimeout
});
\`\`\`

下面这段代码演示了各种全局对象的用法和定时器执行顺序。`,
    code: `// ============================================================
// 第三章代码演示：全局对象与定时器
// ============================================================

// ---- 1. __dirname / __filename ----
console.log("===== 1. __dirname / __filename =====");
// __dirname: 当前文件所在目录的绝对路径
console.log("__dirname :", __dirname);
// __filename: 当前文件的绝对路径
console.log("__filename:", __filename);

// ---- 2. globalThis 全局对象 ----
console.log("\\n===== 2. globalThis =====");
// globalThis 是 ES2020 引入的跨环境全局对象名
// 在 Node.js 中，globalThis 等于 global
// 在浏览器中，globalThis 等于 window
console.log("globalThis 类型:", typeof globalThis);
// 在 globalThis 上挂载的变量，在任何地方都能访问
globalThis.mySharedVar = "我是全局共享变量";
console.log("直接访问 mySharedVar:", mySharedVar);
// 用 var 在模块顶级声明的变量不会挂到 globalThis（CommonJS 模块作用域）
var localVar = "我是模块局部变量";
console.log("globalThis.localVar:", globalThis.localVar); // undefined

// ---- 3. console.table 表格展示 ----
console.log("\\n===== 3. console.table =====");
// console.table 可以把数组或对象以表格形式展示
// 对于数组：每行一个元素，列是属性名
const students = [
  { name: "小明", age: 20, score: 92, city: "北京" },
  { name: "小红", age: 22, score: 88, city: "上海" },
  { name: "小刚", age: 19, score: 95, city: "广州" },
  { name: "小美", age: 21, score: 85, city: "深圳" },
];
console.log("学生列表:");
console.table(students);
// 也可以展示对象（键作为第一列）
console.log("单个学生信息:");
console.table(students[0]);

// ---- 4. console.dir 深度打印对象 ----
console.log("\\n===== 4. console.dir =====");
// console.dir 可以控制打印的深度和格式
const complexObj = {
  name: "root",
  value: 1,
  children: {
    name: "level1",
    children: {
      name: "level2",
      children: {
        name: "level3",
        children: {
          name: "level4",
          value: "很深的数据",
        },
      },
    },
  },
};
console.log("console.dir 默认深度（2层）:");
console.dir(complexObj);
console.log("console.dir 深度设为 5:");
console.dir(complexObj, { depth: 5 });

// ---- 5. 用 Date.now() 模拟计时（console.time 不可用） ----
console.log("\\n===== 5. 计时演示 =====");
// console.time/timeEnd 在沙箱中可能不可用
// 用 Date.now() 手动计时是更通用的方式
const start = Date.now();
let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += i;
}
const elapsed = Date.now() - start;
console.log("循环 100 万次求和:", sum);
console.log("耗时:", elapsed, "ms");

// ---- 6. process 对象信息 ----
console.log("\\n===== 6. process 对象 =====");
console.log("Node.js 版本:", process.version);
console.log("平台:", process.platform);
console.log("架构:", process.arch);
console.log("PID:", process.pid);
console.log("运行时长:", process.uptime().toFixed(4), "秒");

// 内存信息
const mem = process.memoryUsage();
console.log("内存占用:");
console.log("  rss       :", (mem.rss / 1024 / 1024).toFixed(2), "MB");
console.log("  heapTotal :", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB");
console.log("  heapUsed  :", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB");
console.log("  external  :", (mem.external / 1024 / 1024).toFixed(2), "MB");

// process.stdout.write（不自动换行）
console.log("\\n===== 7. process.stdout =====");
process.stdout.write("用 stdout.write 输出");
process.stdout.write(" —— 不换行\\n");
console.log("console.log 底层就是封装了 process.stdout.write");

// ---- 8. 定时器执行顺序对比 ----
console.log("\\n===== 8. 定时器执行顺序 =====");
// 执行优先级（从高到低）：
// 同步代码 → process.nextTick → 微任务(Promise/queueMicrotask) → 宏任务(setTimeout/setImmediate)
console.log("1. 同步代码开始");

// nextTick：优先级最高的微任务
process.nextTick(() => {
  console.log("3. process.nextTick 回调");
});

// Promise 微任务
Promise.resolve().then(() => {
  console.log("4. Promise.then 回调");
});

// queueMicrotask：与 Promise 同级的微任务
// 沙箱可能没有 queueMicrotask，用安全的方式调用
const qmt = typeof queueMicrotask === "function" ? queueMicrotask : (cb) => Promise.resolve().then(cb);
qmt(() => {
  console.log("5. queueMicrotask 回调");
});

// setTimeout 宏任务
setTimeout(() => {
  console.log("7. setTimeout(0) 回调");
}, 0);

// setImmediate 宏任务（在 check 阶段执行）
setImmediate(() => {
  console.log("8. setImmediate 回调");
});

console.log("2. 同步代码结束");
// 预期输出顺序: 1 → 2 → 3 → 4 → 5 → (6/7 顺序不确定) → 8
// 在主模块中 setTimeout(0) 和 setImmediate 的顺序不确定
// 但 nextTick 和微任务一定先于宏任务

// ---- 9. 定时器清除 ----
console.log("\\n===== 9. 定时器清除 =====");
// 创建一个 1 秒后执行的定时器
const timer1 = setTimeout(() => {
  console.log("这行不会被打印（定时器被清除了）");
}, 1000);
// 立即清除它
clearTimeout(timer1);
console.log("已清除 timer1，它的回调不会执行");

// 创建一个间隔定时器
const timer2 = setInterval(() => {
  console.log("这行也不会被打印");
}, 500);
clearInterval(timer2);
console.log("已清除 timer2");

// ---- 10. setImmediate 递归（注意不要无限递归） ----
console.log("\\n===== 10. setImmediate 递归 =====");
let callCount = 0;
function immediateTask() {
  callCount++;
  console.log("setImmediate 第 " + callCount + " 次执行");
  if (callCount < 3) {
    setImmediate(immediateTask);
  } else {
    console.log("setImmediate 递归结束");
  }
}
setImmediate(immediateTask);

// ---- 11. process.exit 事件 ----
console.log("\\n===== 11. exit 事件 =====");
process.on("exit", (code) => {
  // eslint-disable-next-line no-console
  console.log("\\n[exit] 进程退出，代码:", code);
  console.log("[exit] 此处只能做同步操作");
});
console.log("已注册 exit 事件监听器");`,
  },

  // =========================================================
  // 第四章：Path 路径模块
  // =========================================================
  {
    id: "path",
    title: "Path 路径模块",
    icon: "🛤️",
    group: "基础入门",
    content: `## 为什么需要 path 模块？

不同操作系统使用不同的路径分隔符：
- **POSIX 系统**（Linux、macOS）：使用 \`/\` 作为分隔符，如 \`/usr/local/bin\`
- **Windows 系统**：使用 \`\\\` 作为分隔符，如 \`C:\\\\Users\\\\admin\\\\Documents\`

如果你用字符串拼接来构造路径（如 \`dir + '/' + file\`），在 Windows 上就会出问题。\`path\` 模块帮你处理这些跨平台差异，自动使用当前系统的分隔符。

\`\`\`javascript
const path = require('path');

// ❌ 不要这样写
const filePath = dir + '/' + filename;  // Windows 上可能出问题

// ✅ 应该这样写
const filePath = path.join(dir, filename);  // 自动处理分隔符
\`\`\`

### path 模块的所有方法详解

#### 1. path.join(...paths) —— 拼接路径

把多个路径片段拼接成一个路径，**自动处理分隔符**和多余的 \`.\` / \`..\`。

\`\`\`javascript
path.join('a', 'b', 'c')        // 'a/b/c'（POSIX）或 'a\\\\b\\\\c'（Windows）
path.join('a', '/b', 'c')       // 'a/b/c'
path.join('a', '..', 'b')       // 'b'（.. 回退一级）
path.join('a', './b')           // 'a/b'
path.join()                     // '.'（无参数返回当前目录）
\`\`\`

> 如果拼接过程中出现了非字符串参数，会抛出 TypeError。

#### 2. path.resolve(...paths) —— 解析为绝对路径

类似在终端里依次执行 \`cd\` 命令，最终返回 \`pwd\` 的结果。

\`\`\`javascript
// 假设当前工作目录是 /home/user
path.resolve('a', 'b')           // '/home/user/a/b'
path.resolve('a', '/b', 'c')     // '/b/c'（/b 是绝对路径，从根开始）
path.resolve('/a', 'b', 'c')     // '/a/b/c'
path.resolve()                   // '/home/user'（返回 cwd）
\`\`\`

#### 3. path.join vs path.resolve（详细对比）

| 特性 | path.join | path.resolve |
| --- | --- | --- |
| 返回值 | 相对路径或绝对路径（取决于输入） | **始终返回绝对路径** |
| 绝对路径处理 | 绝对路径片段被当作普通字符串拼接 | 遇到绝对路径片段会"重置"起始点 |
| 无参数时 | 返回 '.' | 返回当前工作目录 |
| 用途 | 拼接路径片段 | 把相对路径转为绝对路径 |

\`\`\`javascript
path.join('a', '/b', 'c')     // 'a/b/c'（/b 被当作普通片段）
path.resolve('a', '/b', 'c')  // '/b/c'（/b 重置了起点）
\`\`\`

#### 4. path.normalize(path) —— 规范化路径

处理路径中的 \`.\`（当前目录）和 \`..\`（上级目录），并修复多余的斜杠。

\`\`\`javascript
path.normalize('/a//b/../c/./d')   // '/a/c/d'
path.normalize('a/b/../../c')      // '../c'（如果 .. 太多，保留在开头）
path.normalize('C:\\\\temp\\\\\\\\foo\\\\bar')  // Windows: 'C:\\\\temp\\\\foo\\\\bar'
\`\`\`

#### 5. path.relative(from, to) —— 计算相对路径

返回从 \`from\` 到 \`to\` 的相对路径。

\`\`\`javascript
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
// '../../impl/bbb'

path.relative('/home/user/docs', '/home/user/docs/file.txt')
// 'file.txt'
\`\`\`

#### 6. path.dirname(path) —— 获取目录名

返回路径的目录部分（去掉最后的文件名）。

\`\`\`javascript
path.dirname('/a/b/c.txt')    // '/a/b'
path.dirname('/a/b/')         // '/a/b'（末尾斜杠会被忽略）
path.dirname('file.txt')      // '.'（没有目录部分）
path.dirname('/')             // '/'（根目录的目录还是根目录）
\`\`\`

#### 7. path.basename(path, ext) —— 获取文件名

返回路径的最后一部分（文件名），可选择性去掉扩展名。

\`\`\`javascript
path.basename('/a/b/c.txt')         // 'c.txt'
path.basename('/a/b/c.txt', '.txt') // 'c'（去掉指定后缀）
path.basename('/a/b/')              // 'b'（末尾斜杠被忽略）
\`\`\`

#### 8. path.extname(path) —— 获取扩展名

返回路径的扩展名（从最后一个 \`.\` 到末尾），包含 \`.\`。

\`\`\`javascript
path.extname('file.txt')       // '.txt'
path.extname('file.tar.gz')   // '.gz'（只取最后一个点之后）
path.extname('file')          // ''（无扩展名）
path.extname('.gitignore')    // ''（以点开头的文件名不算有扩展名）
path.extname('a/b/file.')     // '.'（末尾的点是空扩展名）
\`\`\`

#### 9. path.parse(path) —— 解析路径为对象

把路径解析成包含 5 个字段的对象：

\`\`\`javascript
path.parse('/home/user/docs/file.txt')
// {
//   root: '/',           // 根目录
//   dir: '/home/user/docs', // 完整目录路径
//   base: 'file.txt',    // 文件名（含扩展名）
//   ext: '.txt',         // 扩展名
//   name: 'file'         // 文件名（不含扩展名）
// }
\`\`\`

Windows 示例：
\`\`\`javascript
path.parse('C:\\\\Users\\\\admin\\\\file.txt')
// {
//   root: 'C:\\\\',
//   dir: 'C:\\\\Users\\\\admin',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }
\`\`\`

#### 10. path.format(pathObject) —— 对象转路径

\`path.parse\` 的逆操作，把路径对象转回字符串。

\`\`\`javascript
path.format({
  dir: '/home/user/docs',
  name: 'file',
  ext: '.txt'
})
// '/home/user/docs/file.txt'
\`\`\`

优先级规则：\`base\` 优先于 \`name + ext\`，\`root\` 会被 \`dir\` 覆盖。

#### 11. path.isAbsolute(path) —— 判断是否绝对路径

\`\`\`javascript
path.isAbsolute('/a/b')      // true
path.isAbsolute('a/b')       // false
path.isAbsolute('C:\\\\')     // Windows 上 true
\`\`\`

#### 12. path.sep —— 路径分隔符

当前系统的路径分隔符。

\`\`\`javascript
// POSIX: '/'
// Windows: '\\\\'
console.log(path.sep)
\`\`\`

#### 13. path.delimiter —— 环境变量分隔符

PATH 环境变量中分隔多个路径的字符。

\`\`\`javascript
// POSIX: ':'
// Windows: ';'
console.log(path.delimiter)
\`\`\`

#### 14. path.posix / path.win32 —— 强制使用特定平台的 API

\`\`\`javascript
// 无论在什么平台上，都使用 POSIX 规则
path.posix.join('a', 'b')     // 'a/b'

// 无论在什么平台上，都使用 Windows 规则
path.win32.join('a', 'b')     // 'a\\\\b'
\`\`\`

这在跨平台工具中很有用——比如你在 Linux 上处理 Windows 路径时，可以用 \`path.win32\`。

### 路径解析的常见陷阱

1. **不要用字符串拼接路径**：\`dir + '/' + file\` 在 Windows 上会出问题，用 \`path.join\`。

2. **\`..\` 可以超出根目录吗？** 不行。\`path.normalize('/../../../a')\` 结果是 \`'/a'\`，\`..\` 不会超出根目录。

3. **空字符串参数**：\`path.join('a', '', 'b')\` 结果是 \`'a/b'\`，空字符串被忽略。

4. **path.resolve 的 cwd 依赖**：\`path.resolve('a')\` 的结果依赖当前工作目录，在不同目录运行结果不同。这在测试中可能导致问题。

5. **basename 去后缀只去精确匹配**：\`path.basename('file.txt', '.js')\` 返回 \`'file.txt'\`（不匹配就不去）。

下面这段代码演示了 path 模块所有常用方法的用法。`,
    code: `// ============================================================
// 第四章代码演示：path 路径模块全面演示
// ============================================================
const path = require("path");

// ---- 1. path.join：拼接路径 ----
console.log("===== 1. path.join 拼接路径 =====");
// join 会自动使用当前系统的分隔符，并处理 . 和 ..
console.log("join('a', 'b', 'c')        :", path.join("a", "b", "c"));
console.log("join('a', '/b', 'c')       :", path.join("a", "/b", "c"));
console.log("join('a', '..', 'b')       :", path.join("a", "..", "b"));
console.log("join('a', './b', 'c')      :", path.join("a", "./b", "c"));
console.log("join('/a', 'b', '../c')    :", path.join("/a", "b", "../c"));
console.log("join()                      :", path.join());  // '.'

// ---- 2. path.resolve：解析为绝对路径 ----
console.log("\\n===== 2. path.resolve 解析绝对路径 =====");
// resolve 类似在终端 cd，遇到绝对路径会重置起点
console.log("resolve('a', 'b')          :", path.resolve("a", "b"));
console.log("resolve('a', '/b', 'c')    :", path.resolve("a", "/b", "c"));
console.log("resolve('/a', 'b', 'c')    :", path.resolve("/a", "b", "c"));
console.log("resolve()                   :", path.resolve());  // 当前工作目录
console.log("resolve('..')              :", path.resolve(".."));  // 上级目录

// ---- 3. join vs resolve 对比 ----
console.log("\\n===== 3. path.join vs path.resolve 对比 =====");
console.log("join('a', '/b')    =", path.join("a", "/b"), "  ← /b 被当普通片段");
console.log("resolve('a', '/b') =", path.resolve("a", "/b"), "  ← /b 重置了起点");
console.log("join('a', 'b')     =", path.join("a", "b"), "  ← 相对路径");
console.log("resolve('a', 'b')  =", path.resolve("a", "b"), "  ← 绝对路径");

// ---- 4. path.normalize：规范化路径 ----
console.log("\\n===== 4. path.normalize 规范化 =====");
// 处理多余的 . 和 .. 和斜杠
console.log("normalize('/a//b/../c/./d')   :", path.normalize("/a//b/../c/./d"));
console.log("normalize('a/b/../../c')      :", path.normalize("a/b/../../c"));
console.log("normalize('/a/./b/./c')       :", path.normalize("/a/./b/./c"));
console.log("normalize('/a/../../../b')    :", path.normalize("/a/../../../b")); // 不会超出根

// ---- 5. path.dirname：获取目录名 ----
console.log("\\n===== 5. path.dirname 获取目录名 =====");
console.log("dirname('/a/b/c.txt')  :", path.dirname("/a/b/c.txt"));   // '/a/b'
console.log("dirname('/a/b/')       :", path.dirname("/a/b/"));        // '/a/b'
console.log("dirname('file.txt')    :", path.dirname("file.txt"));     // '.'
console.log("dirname('/')           :", path.dirname("/"));            // '/'

// ---- 6. path.basename：获取文件名 ----
console.log("\\n===== 6. path.basename 获取文件名 =====");
console.log("basename('/a/b/c.txt')        :", path.basename("/a/b/c.txt"));          // 'c.txt'
console.log("basename('/a/b/c.txt', '.txt'):", path.basename("/a/b/c.txt", ".txt"));  // 'c'
console.log("basename('/a/b/c.txt', '.js') :", path.basename("/a/b/c.txt", ".js"));   // 'c.txt'（不匹配不去）
console.log("basename('/a/b/')             :", path.basename("/a/b/"));               // 'b'

// ---- 7. path.extname：获取扩展名 ----
console.log("\\n===== 7. path.extname 获取扩展名 =====");
console.log("extname('file.txt')     :", path.extname("file.txt"));      // '.txt'
console.log("extname('file.tar.gz')  :", path.extname("file.tar.gz"));   // '.gz'
console.log("extname('file')         :", path.extname("file"));          // ''
console.log("extname('.gitignore')   :", path.extname(".gitignore"));    // ''
console.log("extname('a/b.c/d')      :", path.extname("a/b.c/d"));       // ''
console.log("extname('a/b.c/d.txt')  :", path.extname("a/b.c/d.txt"));   // '.txt'

// ---- 8. path.parse：解析路径为对象 ----
console.log("\\n===== 8. path.parse 解析路径为对象 =====");
const parsed = path.parse("/home/user/docs/readme.md");
console.log("解析 '/home/user/docs/readme.md':");
console.table(parsed);
// parsed 包含: root, dir, base, ext, name

// Windows 风格路径解析（用 path.win32）
console.log("解析 Windows 路径 'C:\\\\Users\\\\admin\\\\file.txt':");
console.table(path.win32.parse("C:\\\\Users\\\\admin\\\\file.txt"));

// ---- 9. path.format：对象转路径（parse 的逆操作）----
console.log("\\n===== 9. path.format 对象转路径 =====");
const pathObj = {
  dir: "/home/user/docs",
  name: "report",
  ext: ".pdf",
};
console.log("format({dir, name, ext}):", path.format(pathObj));
// base 优先于 name + ext
const pathObj2 = {
  dir: "/home/user",
  base: "override.txt",  // base 会覆盖 name 和 ext
  name: "ignored",
  ext: ".ignored",
};
console.log("format({dir, base, name, ext}):", path.format(pathObj2));

// ---- 10. path.relative：计算相对路径 ----
console.log("\\n===== 10. path.relative 计算相对路径 =====");
console.log("relative('/a/b/c', '/a/b/d')     :", path.relative("/a/b/c", "/a/b/d"));     // 'd'
console.log("relative('/a/b/c', '/a/x/y')     :", path.relative("/a/b/c", "/a/x/y"));     // '../../x/y'
console.log("relative('/data/test', '/data')  :", path.relative("/data/test", "/data"));  // '..'
console.log("relative('/a/b', '/a/b')         :", path.relative("/a/b", "/a/b"));         // ''

// ---- 11. path.isAbsolute：判断绝对路径 ----
console.log("\\n===== 11. path.isAbsolute 判断绝对路径 =====");
console.log("isAbsolute('/a/b')    :", path.isAbsolute("/a/b"));    // true
console.log("isAbsolute('a/b')     :", path.isAbsolute("a/b"));     // false
console.log("isAbsolute('./a')     :", path.isAbsolute("./a"));     // false
console.log("isAbsolute('../a')    :", path.isAbsolute("../a"));    // false
console.log("isAbsolute('/')       :", path.isAbsolute("/"));       // true

// ---- 12. 常量：sep、delimiter ----
console.log("\\n===== 12. 路径常量 =====");
// path.sep: 路径分隔符（POSIX 是 '/'，Windows 是 '\\\\'）
console.log("path.sep             :", JSON.stringify(path.sep));
// path.delimiter: 环境变量分隔符（POSIX 是 ':'，Windows 是 ';'）
console.log("path.delimiter       :", JSON.stringify(path.delimiter));

// ---- 13. path.posix / path.win32：跨平台路径处理 ----
console.log("\\n===== 13. path.posix / path.win32 =====");
// path.posix: 无论在什么平台，都用 POSIX 规则（用 / 分隔）
console.log("posix.join('a', 'b')     :", path.posix.join("a", "b"));
// path.win32: 无论在什么平台，都用 Windows 规则（用 \\\\ 分隔）
console.log("win32.join('a', 'b')     :", path.win32.join("a", "b"));
console.log("posix.sep                :", JSON.stringify(path.posix.sep));
console.log("win32.sep                :", JSON.stringify(path.win32.sep));

// ---- 14. 实战：解析 PATH 环境变量 ----
console.log("\\n===== 14. 实战：解析 PATH 环境变量 =====");
// 利用 path.delimiter 分割 PATH 环境变量
const pathEnv = "/usr/local/bin:/usr/bin:/bin";  // 模拟一个 PATH
const dirs = pathEnv.split(path.delimiter);
console.log("PATH 各目录:");
dirs.forEach((dir, i) => {
  console.log("  " + (i + 1) + ". " + dir + " → basename: " + path.basename(dir));
});

// ---- 15. 实战：获取文件名（不含扩展名）的多种方式 ----
console.log("\\n===== 15. 获取文件名（不含扩展名）=====");
const filePath = "/home/user/project/src/app.component.ts";
// 方式 1：parse + name
console.log("方式1 parse().name:", path.parse(filePath).name);
// 方式2 basename + extname
console.log("方式2 basename去后缀:", path.basename(filePath, path.extname(filePath)));
// 两者结果一致：'app.component'

// ---- 16. 实战：构建跨平台安全的文件路径 ----
console.log("\\n===== 16. 构建安全的文件路径 =====");
const baseDir = __dirname;
const dataDir = path.join(baseDir, "data");
const logFile = path.join(dataDir, "logs", "app.log");
console.log("基础目录:", baseDir);
console.log("数据目录:", dataDir);
console.log("日志文件:", logFile);
console.log("是否绝对路径:", path.isAbsolute(logFile));
console.log("日志文件名:", path.basename(logFile));
console.log("日志文件扩展名:", path.extname(logFile));
console.log("日志所在目录:", path.dirname(logFile));`,
  },

  // =========================================================
  // 第五章：文件系统 (fs)
  // =========================================================
  {
    id: "fs",
    title: "文件系统 (fs)",
    icon: "📁",
    group: "基础入门",
    content: `## fs 模块概述

\`fs\`（File System）模块是 Node.js 最核心、最常用的模块之一。它提供了完整的文件系统操作能力：读写文件、创建/删除目录、查看文件信息、监听文件变化、修改权限等。

### 三种 API 风格

fs 模块提供三种风格的 API，适用于不同场景：

| 风格 | 命名特征 | 示例 | 特点 |
| --- | --- | --- | --- |
| **同步 API** | 带 \`Sync\` 后缀 | \`fs.readFileSync()\` | 阻塞主线程，简单直观 |
| **异步回调 API** | 无后缀 | \`fs.readFile(cb)\` | 非阻塞，回调函数返回结果 |
| **Promise API** | \`fs.promises\` | \`fs.promises.readFile()\` | 非阻塞，可配合 async/await |

#### 同步 API 示例
\`\`\`javascript
const data = fs.readFileSync('file.txt', 'utf8');
console.log(data);  // 阻塞直到读取完成
\`\`\`

#### 异步回调 API 示例
\`\`\`javascript
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);  // 读取完成后回调
});
\`\`\`

#### Promise API 示例
\`\`\`javascript
const fsp = fs.promises;
const data = await fsp.readFile('file.txt', 'utf8');
console.log(data);
\`\`\`

### 同步 vs 异步的选择

| 场景 | 推荐 API | 原因 |
| --- | --- | --- |
| 服务端运行时（Web 服务） | Promise / 异步回调 | 不能阻塞事件循环，否则影响所有请求 |
| 应用启动时加载配置 | 同步 | 只执行一次，简单方便 |
| CLI 工具 / 脚本 | 同步 | 顺序执行更直观，性能不是瓶颈 |
| 批量文件处理 | Promise + 并发控制 | 需要控制并发数，避免同时打开太多文件 |
| 测试代码 | 同步 | 测试代码更简洁可读 |

**核心原则**：在服务端运行时（处理用户请求的代码中），**永远不要用同步 API**，因为它会阻塞整个事件循环。

### 常用方法分类详解

#### 读文件

| 方法 | 说明 |
| --- | --- |
| \`fs.readFile(path, [enc], cb)\` | 异步读取整个文件 |
| \`fs.readFileSync(path, [enc])\` | 同步读取整个文件 |
| \`fs.createReadStream(path, [opts])\` | 创建可读流（适合大文件） |
| \`fs.read(fd, buf, offset, len, pos, cb)\` | 底层读取（基于文件描述符） |

\`\`\`javascript
// 读取文本文件
const text = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(text);

// 读取二进制文件（返回 Buffer）
const imageBuf = fs.readFileSync('logo.png');

// 流式读取大文件
const stream = fs.createReadStream('huge.log', { encoding: 'utf8', highWaterMark: 64 * 1024 });
stream.on('data', (chunk) => { /* 处理每块数据 */ });
stream.on('end', () => { /* 读取完成 */ });
\`\`\`

#### 写文件

| 方法 | 说明 |
| --- | --- |
| \`fs.writeFile(path, data, [opts], cb)\` | 异步写入（覆盖已有内容） |
| \`fs.writeFileSync(path, data, [opts])\` | 同步写入 |
| \`fs.appendFile(path, data, cb)\` | 追加写入 |
| \`fs.createWriteStream(path, [opts])\` | 创建可写流 |

\`\`\`javascript
// 写入文件（覆盖）
fs.writeFileSync('output.txt', 'Hello World', 'utf8');

// 追加写入
fs.appendFileSync('log.txt', new Date() + ' 新日志\\n');

// 写入选项
fs.writeFileSync('data.bin', buffer, { flag: 'w', mode: 0o644 });
\`\`\`

#### 目录操作

| 方法 | 说明 |
| --- | --- |
| \`fs.mkdir(path, [opts], cb)\` | 创建目录 |
| \`fs.mkdirSync(path, [opts])\` | 同步创建目录 |
| \`fs.readdir(path, [opts], cb)\` | 读取目录内容 |
| \`fs.readdirSync(path, [opts])\` | 同步读取目录 |
| \`fs.rmdir(path, cb)\` | 删除空目录 |
| \`fs.rm(path, [opts], cb)\` | 删除文件或目录（递归） |

\`\`\`javascript
// 递归创建目录（类似 mkdir -p）
fs.mkdirSync('a/b/c', { recursive: true });

// 读取目录内容
const files = fs.readdirSync('./src');
// 带文件类型
const entries = fs.readdirSync('./src', { withFileTypes: true });
entries.forEach(e => {
  console.log(e.name, e.isDirectory() ? '目录' : '文件');
});

// 递归删除目录（类似 rm -rf）
fs.rmSync('old-dir', { recursive: true, force: true });
\`\`\`

#### 删除与重命名

| 方法 | 说明 |
| --- | --- |
| \`fs.unlink(path, cb)\` | 删除文件 |
| \`fs.unlinkSync(path)\` | 同步删除文件 |
| \`fs.rm(path, [opts], cb)\` | 删除文件或目录（Node 14+） |
| \`fs.rename(old, new, cb)\` | 重命名/移动文件 |
| \`fs.renameSync(old, new)\` | 同步重命名 |

#### 文件信息 (stat)

\`fs.stat()\` 返回一个 \`Stats\` 对象，包含文件的详细信息：

| 属性/方法 | 说明 |
| --- | --- |
| \`stats.size\` | 文件大小（字节） |
| \`stats.isFile()\` | 是否普通文件 |
| \`stats.isDirectory()\` | 是否目录 |
| \`stats.isSymbolicLink()\` | 是否符号链接 |
| \`stats.birthtime\` | 创建时间 |
| \`stats.mtime\` | 修改时间（内容变更） |
| \`stats.ctime\` | 变更时间（元数据变更） |
| \`stats.atime\` | 访问时间 |
| \`stats.mode\` | 文件权限 |
| \`stats.uid / gid\` | 所有者 ID / 组 ID |

\`\`\`javascript
const stats = fs.statSync('package.json');
console.log('大小:', stats.size, '字节');
console.log('修改时间:', stats.mtime);
console.log('是文件:', stats.isFile());
\`\`\`

#### 监听文件变化

| 方法 | 说明 |
| --- | --- |
| \`fs.watch(path, [opts], cb)\` | 监听文件/目录变化（推荐，效率高） |
| \`fs.watchFile(path, [opts], cb)\` | 轮询监听（兼容性好但效率低） |

\`\`\`javascript
// 监听目录变化
fs.watch('./src', (eventType, filename) => {
  console.log(eventType, filename);  // 'change' 或 'rename'
});
\`\`\`

> \`fs.watch\` 在不同平台上的行为不一致，不建议用于生产环境的关键路径。推荐使用 \`chokidar\` 第三方库。

#### 权限操作

| 方法 | 说明 |
| --- | --- |
| \`fs.chmod(path, mode, cb)\` | 修改文件权限 |
| \`fs.chown(path, uid, gid, cb)\` | 修改文件所有者 |
| \`fs.access(path, [mode], cb)\` | 检查文件可访问性 |

### 文件描述符 (fd) 简介

文件描述符（File Descriptor）是操作系统分配给打开文件的整数标识。在 Node.js 中，大部分高级 API 内部使用 fd，但你也可以直接使用 fd 进行底层操作。

\`\`\`javascript
const fd = fs.openSync('file.txt', 'r');  // 打开文件，返回 fd
const buf = Buffer.alloc(100);
fs.readSync(fd, buf, 0, 100, 0);  // 从 fd 读取
fs.closeSync(fd);  // 关闭文件
\`\`\`

通常你不需要直接操作 fd，高级 API（readFile/writeFile）已经封装好了。

### FileHandle (fs.promises) 简介

\`fs.promises.open()\` 返回一个 \`FileHandle\` 对象，类似 C 语言的 FILE 指针，可以在同一个文件句柄上做多次读写操作，并且**必须手动关闭**（用 \`fileHandle.close()\` 或 \`await using\`）。

\`\`\`javascript
const fsp = fs.promises;
const fh = await fsp.open('file.txt', 'r');
const buf = Buffer.alloc(100);
await fh.read(buf, 0, 100, 0);
await fh.close();
\`\`\`

### 编码问题

读取文件时如果不指定编码，返回的是 \`Buffer\`（二进制数据）。指定编码后返回字符串。

| 编码 | 说明 |
| --- | --- |
| \`'utf8'\` / \`'utf-8'\` | UTF-8 编码（最常用，支持中文） |
| \`'ascii'\` | ASCII 编码 |
| \`'base64'\` | Base64 编码 |
| \`'hex'\` | 十六进制编码 |
| \`'latin1'\` / \`'binary'\` | Latin-1 编码 |
| \`'utf16le'\` | UTF-16 小端序 |
| 不指定 | 返回 Buffer（二进制） |

\`\`\`javascript
// 读取为字符串
const text = fs.readFileSync('file.txt', 'utf8');

// 读取为 Buffer
const buf = fs.readFileSync('file.txt');
console.log(buf);  // <Buffer 48 65 6c 6c 6f>
\`\`\`

### 错误处理

fs 操作可能抛出各种错误，常见错误码：

| 错误码 | 含义 | 原因 |
| --- | --- | --- |
| \`ENOENT\` | No such file or directory | 文件/目录不存在 |
| \`EACCES\` | Permission denied | 权限不足 |
| \`EEXIST\` | File already exists | 文件已存在（如 mkdir 已存在的目录） |
| \`EISDIR\` | Is a directory | 对目录执行了文件操作 |
| \`ENOTDIR\` | Not a directory | 对文件执行了目录操作 |
| \`EMFILE\` | Too many open files | 打开的文件描述符太多 |
| \`ENOSPC\` | No space left on device | 磁盘空间不足 |

**最佳实践**：用 try/catch（同步）或错误优先回调/Promise.catch（异步）处理错误。

\`\`\`javascript
try {
  const data = fs.readFileSync('might-not-exist.txt', 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('文件不存在');
  } else {
    throw err;  // 重新抛出未知错误
  }
}
\`\`\`

下面这段代码演示了 fs 的各种操作，在系统临时目录中创建、读取、删除文件。`,
    code: `// ============================================================
// 第五章代码演示：fs 文件系统操作实战
// ============================================================
const fs = require("fs");
const path = require("path");
const os = require("os");

// 使用系统临时目录作为工作区，避免污染项目文件
const workDir = path.join(os.tmpdir(), "node-tutorial-fs-demo");

// ---- 1. 创建工作目录 ----
console.log("===== 1. 创建目录 =====");
// fs.existsSync: 同步检查路径是否存在（返回布尔值）
// 注意：existsSync 是少数推荐的同步方法之一，因为检查存在性很快
if (!fs.existsSync(workDir)) {
  // recursive: true 表示递归创建（类似 mkdir -p）
  // 即使父目录不存在也会一起创建
  fs.mkdirSync(workDir, { recursive: true });
}
console.log("工作目录:", workDir);
console.log("目录存在:", fs.existsSync(workDir));

// ---- 2. 同步写入文件 ----
console.log("\\n===== 2. 同步写入文件 =====");
const filePath = path.join(workDir, "hello.txt");
// writeFileSync: 同步写入文件（如果文件已存在会被覆盖）
// 参数: 文件路径, 数据, 编码
fs.writeFileSync(filePath, "第一行：Hello Node.js!\\n", "utf8");
console.log("文件已写入:", filePath);

// ---- 3. 追加写入 ----
console.log("\\n===== 3. 追加写入 =====");
// appendFileSync: 在文件末尾追加内容（不覆盖已有内容）
fs.appendFileSync(filePath, "第二行：fs 模块很好用\\n");
fs.appendFileSync(filePath, "第三行：追加写入演示\\n");
console.log("已追加两行内容");

// ---- 4. 同步读取文件 ----
console.log("\\n===== 4. 同步读取文件 =====");
// readFileSync: 同步读取文件
// 不指定编码返回 Buffer，指定 'utf8' 返回字符串
const content = fs.readFileSync(filePath, "utf8");
console.log("--- 文件内容 ---");
console.log(content);
console.log("--- 文件内容结束 ---");

// 不指定编码，读取为 Buffer
const bufContent = fs.readFileSync(filePath);
console.log("Buffer 形式:", bufContent);
console.log("字节长度:", bufContent.length);
console.log("转字符串:", bufContent.toString("utf8").slice(0, 30) + "...");

// ---- 5. 获取文件信息 (stat) ----
console.log("\\n===== 5. 文件信息 stat =====");
// statSync: 返回文件信息对象 Stats
const stats = fs.statSync(filePath);
console.log("文件大小:", stats.size, "字节");
console.log("是否文件:", stats.isFile());
console.log("是否目录:", stats.isDirectory());
console.log("创建时间:", stats.birthtime.toISOString());
console.log("修改时间:", stats.mtime.toISOString());
console.log("访问时间:", stats.atime.toISOString());
console.log("权限模式:", stats.mode.toString(8));

// 目录的 stat
const dirStats = fs.statSync(workDir);
console.log("\\n工作目录的 stat:");
console.log("是否目录:", dirStats.isDirectory());
console.log("是否文件:", dirStats.isFile());

// ---- 6. 读取目录内容 ----
console.log("\\n===== 6. 读取目录内容 =====");
// 先创建几个测试文件
fs.writeFileSync(path.join(workDir, "a.txt"), "文件A");
fs.writeFileSync(path.join(workDir, "b.json"), '{"key":"value"}');
fs.mkdirSync(path.join(workDir, "subdir"));

// readdirSync: 读取目录内容，返回文件名数组
const files = fs.readdirSync(workDir);
console.log("目录内容:", files);

// 带 withFileTypes: true 选项，返回 Dirent 对象（包含类型信息）
const entries = fs.readdirSync(workDir, { withFileTypes: true });
console.log("带类型的目录内容:");
entries.forEach((entry) => {
  const type = entry.isDirectory() ? "目录" : entry.isFile() ? "文件" : "其他";
  console.log("  " + entry.name + " → " + type);
});

// ---- 7. 重命名/移动文件 ----
console.log("\\n===== 7. 重命名文件 =====");
const oldPath = path.join(workDir, "a.txt");
const newPath = path.join(workDir, "a-renamed.txt");
fs.renameSync(oldPath, newPath);
console.log("重命名: a.txt → a-renamed.txt");
console.log("a.txt 存在:", fs.existsSync(oldPath));
console.log("a-renamed.txt 存在:", fs.existsSync(newPath));

// ---- 8. 读取 package.json（如果存在）----
console.log("\\n===== 8. 读取项目文件 =====");
// 尝试读取当前工作目录下的 package.json
const pkgPath = path.join(process.cwd(), "package.json");
try {
  const pkgContent = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(pkgContent);
  console.log("项目名称:", pkg.name);
  console.log("项目版本:", pkg.version);
  console.log("依赖数量:", pkg.dependencies ? Object.keys(pkg.dependencies).length : 0);
  console.log("scripts:", JSON.stringify(pkg.scripts || {}));
} catch (err) {
  // 错误处理：检查错误码
  if (err.code === "ENOENT") {
    console.log("package.json 不存在于:", pkgPath);
  } else if (err.code === "EACCES") {
    console.log("没有权限读取 package.json");
  } else {
    console.log("读取出错:", err.message);
  }
}

// ---- 9. 异步 Promise API 演示 ----
console.log("\\n===== 9. Promise API (fs.promises) =====");
// fs.promises 提供基于 Promise 的 API，推荐配合 async/await 使用
// 注意: 沙箱中不能 require('fs/promises')，但可以用 require('fs').promises
const fsp = fs.promises;

(async () => {
  try {
    // 异步写入
    const asyncFile = path.join(workDir, "async-demo.txt");
    await fsp.writeFile(asyncFile, "用 Promise API 写入的内容\\n", "utf8");
    console.log("Promise API 写入成功");

    // 异步追加
    await fsp.appendFile(asyncFile, "追加的一行\\n");

    // 异步读取
    const data = await fsp.readFile(asyncFile, "utf8");
    console.log("Promise API 读取结果:");
    console.log(data.trim());

    // 异步 stat
    const stat = await fsp.stat(asyncFile);
    console.log("Promise API stat - 大小:", stat.size, "字节");

    // ---- 10. 批量并发读取 ----
    console.log("\\n===== 10. 批量并发读取 =====");
    // Promise.all 可以并发读取多个文件
    const fileList = ["async-demo.txt", "b.json", "hello.txt"];
    const results = await Promise.all(
      fileList.map(async (name) => {
        const fp = path.join(workDir, name);
        try {
          const content = await fsp.readFile(fp, "utf8");
          return { name, success: true, content: content.slice(0, 50) };
        } catch (e) {
          return { name, success: false, error: e.code };
        }
      })
    );
    console.log("并发读取结果:");
    console.table(results.map((r) => ({
      文件名: r.name,
      状态: r.success ? "成功" : "失败",
      内容: r.success ? r.content.replace(/\\n/g, " ").slice(0, 30) : r.error,
    })));

    // ---- 11. 清理：删除所有演示文件 ----
    console.log("\\n===== 11. 清理演示文件 =====");
    // 逐个删除文件
    const allFiles = fs.readdirSync(workDir);
    for (const file of allFiles) {
      const fp = path.join(workDir, file);
      const fstat = fs.statSync(fp);
      if (fstat.isFile()) {
        fs.unlinkSync(fp);  // 删除文件
      } else if (fstat.isDirectory()) {
        // fs.rmSync 可以递归删除目录（Node 14+）
        fs.rmSync(fp, { recursive: true, force: true });
      }
    }
    // 删除工作目录本身（使用 fs.rmSync 替代废弃的 fs.rmdirSync）
    fs.rmSync(workDir, { recursive: true, force: true });
    console.log("已删除所有演示文件和目录");
    console.log("工作目录还存在:", fs.existsSync(workDir));
  } catch (err) {
    console.log("Promise API 出错:", err.message);
    // 确保清理
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.log("清理失败:", e.message);
    }
  }
})();`,
  },

  // =========================================================
  // 第六章：OS 操作系统模块
  // =========================================================
  {
    id: "os",
    title: "OS 操作系统模块",
    icon: "💻",
    group: "基础入门",
    content: `## os 模块概述

\`os\`（Operating System）模块提供了一组与操作系统交互的实用属性和方法。通过它，你可以获取硬件信息（CPU、内存）、系统信息（平台、版本、运行时间）、网络信息和用户信息。

os 模块的主要应用场景：
1. **系统监控**：获取 CPU 使用率、内存使用率、系统负载
2. **跨平台适配**：根据平台（darwin/win32/linux）执行不同逻辑
3. **临时文件处理**：用 \`os.tmpdir()\` 获取系统临时目录
4. **集群配置**：根据 \`os.cpus().length\` 决定启动多少个 Worker
5. **日志记录**：记录主机名、用户名等系统信息

### 所有属性和方法详解

#### 系统基本信息

| 方法/属性 | 返回值 | 说明 |
| --- | --- | --- |
| \`os.platform()\` | string | 操作系统平台：\`'darwin'\`(macOS), \`'win32'\`(Windows), \`'linux'\`(Linux) |
| \`os.arch()\` | string | CPU 架构：\`'x64'\`, \`'arm64'\`, \`'ia32'\`, \`'arm'\` |
| \`os.type()\` | string | 操作系统名称：\`'Darwin'\`, \`'Windows_NT'\`, \`'Linux'\` |
| \`os.release()\` | string | 操作系统版本号（如 macOS 的内核版本） |
| \`os.hostname()\` | string | 计算机主机名 |
| \`os.version()\` | string | 操作系统版本字符串（Node 13+，更详细） |
| \`os.uptime()\` | number | 系统运行时长（秒） |
| \`os.loadavg()\` | number[] | 系统负载平均值（1/5/15 分钟） |

\`\`\`javascript
const os = require('os');
console.log(os.platform());  // 'darwin' (macOS)
console.log(os.type());      // 'Darwin'
console.log(os.hostname());  // 'MacBook-Pro.local'
\`\`\`

> \`os.platform()\` 和 \`process.platform\` 返回值相同，但 \`os.type()\` 返回更友好的名称。
> \`os.loadavg()\` 在 Windows 上始终返回 [0, 0, 0]（Windows 没有这个概念）。

#### 内存信息

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| \`os.totalmem()\` | number | 系统总内存（字节） |
| \`os.freemem()\` | number | 系统可用内存（字节） |

\`\`\`javascript
const total = os.totalmem();
const free = os.freemem();
const used = total - free;
const usagePercent = (used / total * 100).toFixed(1);
console.log(\`内存使用率: \${usagePercent}%\`);
\`\`\`

#### CPU 信息

\`os.cpus()\` 返回一个数组，每个元素代表一个 CPU 核心（逻辑核心），包含以下字段：

| 字段 | 说明 |
| --- | --- |
| \`model\` | CPU 型号（如 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz'） |
| \`speed\` | CPU 频率（MHz） |
| \`times\` | CPU 时间统计对象 |

\`times\` 对象包含：
| 字段 | 说明 |
| --- | --- |
| \`user\` | 用户态时间（毫秒） |
| \`nice\` | nice 优先级时间（毫秒） |
| \`sys\` | 内核态时间（毫秒） |
| \`idle\` | 空闲时间（毫秒） |
| \`irq\` | 硬件中断时间（毫秒） |

\`\`\`javascript
const cpus = os.cpus();
console.log('CPU 核心数:', cpus.length);
console.log('CPU 型号:', cpus[0].model);
\`\`\`

#### 网络信息

\`os.networkInterfaces()\` 返回一个对象，键是网络接口名（如 \`'en0'\`, \`'Wi-Fi'\`, \`'lo'\`），值是接口信息数组。

每个接口信息包含：

| 字段 | 说明 |
| --- | --- |
| \`address\` | IP 地址 |
| \`netmask\` | 子网掩码 |
| \`family\` | 地址族：\`'IPv4'\` 或 \`'IPv6'\` |
| \`mac\` | MAC 地址 |
| \`internal\` | 是否内部接口（如 localhost） |
| \`cidr\` | CIDR 表示法（如 '192.168.1.100/24'） |

\`\`\`javascript
const nets = os.networkInterfaces();
for (const [name, interfaces] of Object.entries(nets)) {
  for (const net of interfaces) {
    if (net.family === 'IPv4' && !net.internal) {
      console.log(\`\${name}: \${net.address}\`);
    }
  }
}
\`\`\`

#### 用户与目录信息

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| \`os.userInfo([opts])\` | object | 当前用户信息 |
| \`os.homedir()\` | string | 当前用户主目录 |
| \`os.tmpdir()\` | string | 系统默认临时文件目录 |

\`os.userInfo()\` 返回的对象包含：

| 字段 | 说明 |
| --- | --- |
| \`username\` | 用户名 |
| \`uid\` | 用户 ID（POSIX） |
| \`gid\` | 组 ID（POSIX） |
| \`shell\` | 默认 shell（POSIX） |
| \`homedir\` | 用户主目录 |

\`\`\`javascript
const userInfo = os.userInfo();
console.log('用户名:', userInfo.username);
console.log('主目录:', userInfo.homedir);
console.log('Shell:', userInfo.shell);
\`\`\`

#### 常量

| 属性 | 说明 |
| --- | --- |
| \`os.EOL\` | 系统换行符（POSIX: \`'\\\\n'\`，Windows: \`'\\\\r\\\\n'\`） |
| \`os.constants\` | 包含信号码、错误码等常量的对象 |

\`os.EOL\` 在跨平台文件写入时很重要：

\`\`\`javascript
const os = require('os');
// 跨平台正确的换行方式
const line = '第一行' + os.EOL + '第二行';
fs.writeFileSync('output.txt', line);
\`\`\`

### os.constants 简介

\`os.constants\` 包含操作系统相关的常量：

\`\`\`javascript
// 信号常量
os.constants.signals.SIGINT   // 2（Ctrl+C）
os.constants.signals.SIGTERM  // 15（终止信号）
os.constants.signals.SIGKILL  // 9（强制终止）

// 错误码常量
os.constants.errno.ENOENT     // 文件不存在
os.constants.errno.EACCES     // 权限不足
\`\`\`

### 应用场景

#### 场景 1：系统监控

\`\`\`javascript
// 获取 CPU 使用率（通过两次采样计算差值）
function getCPUUsage() {
  const cpus1 = os.cpus();
  // 等待 100ms
  // const cpus2 = os.cpus();
  // 计算 idle 和 total 的差值
}
\`\`\`

#### 场景 2：集群配置

\`\`\`javascript
const cluster = require('cluster');
const os = require('os');
// 根据 CPU 核心数启动对应数量的 Worker
const numCPUs = os.cpus().length;
for (let i = 0; i < numCPUs; i++) {
  cluster.fork();
}
\`\`\`

#### 场景 3：跨平台适配

\`\`\`javascript
const os = require('os');
const path = require('path');
// 根据平台设置不同的默认路径
const configPath = os.platform() === 'win32'
  ? path.join(os.homedir(), 'AppData', 'Roaming', 'myapp', 'config.json')
  : path.join(os.homedir(), '.config', 'myapp', 'config.json');
\`\`\`

#### 场景 4：临时文件

\`\`\`javascript
const os = require('os');
const path = require('path');
const fs = require('fs');
// 在系统临时目录创建文件
const tmpFile = path.join(os.tmpdir(), 'myapp-' + Date.now() + '.tmp');
fs.writeFileSync(tmpFile, '临时数据');
\`\`\`

下面这段代码展示了 os 模块的所有主要功能。`,
    code: `// ============================================================
// 第六章代码演示：OS 操作系统模块全景
// ============================================================
const os = require("os");

// ---- 1. 系统基本信息 ----
console.log("===== 1. 系统基本信息 =====");
// os.platform(): 返回操作系统平台标识
// 'darwin' = macOS, 'win32' = Windows, 'linux' = Linux
console.log("平台(platform) :", os.platform());
// os.type(): 返回操作系统名称（更可读）
// 'Darwin' = macOS, 'Windows_NT' = Windows, 'Linux' = Linux
console.log("类型(type)     :", os.type());
// os.release(): 操作系统内核版本号
console.log("版本(release)  :", os.release());
// os.version(): 更详细的版本字符串（Node 13+）
console.log("详细版本       :", os.version ? os.version() : "(不支持)");
// os.arch(): CPU 架构
console.log("架构(arch)     :", os.arch());
// os.hostname(): 计算机主机名
console.log("主机名         :", os.hostname());

// ---- 2. 系统运行时间 ----
console.log("\\n===== 2. 系统运行时间 =====");
// os.uptime(): 系统从启动到现在的时间（秒）
const uptimeSec = os.uptime();
const uptimeDays = Math.floor(uptimeSec / 86400);
const uptimeHours = Math.floor((uptimeSec % 86400) / 3600);
const uptimeMins = Math.floor((uptimeSec % 3600) / 60);
console.log("系统运行时长:", uptimeSec.toFixed(0), "秒");
console.log("换算:", uptimeDays + "天 " + uptimeHours + "小时 " + uptimeMins + "分钟");

// ---- 3. 系统负载 ----
console.log("\\n===== 3. 系统负载 =====");
// os.loadavg(): 返回 [1分钟, 5分钟, 15分钟] 的平均负载
// 这个值表示系统中正在运行和等待 CPU 的平均进程数
// 注意：Windows 上始终返回 [0, 0, 0]
const loadavg = os.loadavg();
console.log("1分钟平均负载 :", loadavg[0].toFixed(2));
console.log("5分钟平均负载 :", loadavg[1].toFixed(2));
console.log("15分钟平均负载:", loadavg[2].toFixed(2));
// 负载数 / CPU 核心数 > 1 表示 CPU 过载
const cpuCount = os.cpus().length;
console.log("负载/CPU比    :", (loadavg[0] / cpuCount).toFixed(2), "(>1 表示过载)");

// ---- 4. CPU 信息 ----
console.log("\\n===== 4. CPU 信息 =====");
const cpus = os.cpus();
console.log("CPU 逻辑核心数:", cpus.length);
console.log("CPU 型号      :", cpus[0].model);
console.log("CPU 频率      :", cpus[0].speed, "MHz");

// 用 console.table 展示每个核心的使用时间统计
console.log("\\n各核心 CPU 时间统计（毫秒）:");
const cpuTable = cpus.map((cpu, i) => {
  const t = cpu.times;
  const total = t.user + t.nice + t.sys + t.idle + t.irq;
  return {
    核心: "CPU" + i,
    用户态: t.user,
    系统态: t.sys,
    空闲: t.idle,
    中断: t.irq,
    使用率: ((1 - t.idle / total) * 100).toFixed(1) + "%",
  };
});
console.table(cpuTable);

// ---- 5. 内存信息 ----
console.log("\\n===== 5. 内存信息 =====");
// os.totalmem(): 系统总内存（字节）
const totalMem = os.totalmem();
// os.freemem(): 系统可用内存（字节）
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsagePercent = (usedMem / totalMem * 100).toFixed(1);

// 转换为 GB 和 MB 方便阅读
function bytesToReadable(bytes) {
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return gb.toFixed(2) + " GB";
  return (bytes / 1024 / 1024).toFixed(0) + " MB";
}

console.log("总内存  :", bytesToReadable(totalMem), "(" + totalMem + " 字节)");
console.log("已用    :", bytesToReadable(usedMem));
console.log("可用    :", bytesToReadable(freeMem));
console.log("使用率  :", memUsagePercent + "%");

// 用表格展示内存信息
console.table({
  内存概况: {
    "总量(GB)": (totalMem / 1024 / 1024 / 1024).toFixed(2),
    "已用(GB)": (usedMem / 1024 / 1024 / 1024).toFixed(2),
    "可用(GB)": (freeMem / 1024 / 1024 / 1024).toFixed(2),
    "使用率(%)": memUsagePercent,
  },
});

// ---- 6. 用户信息 ----
console.log("\\n===== 6. 用户信息 =====");
// os.userInfo(): 返回当前用户信息
const userInfo = os.userInfo();
console.log("用户名   :", userInfo.username);
console.log("主目录   :", userInfo.homedir);
console.log("Shell    :", userInfo.shell || "(Windows 无 shell 字段)");
console.log("UID      :", userInfo.uid ?? "(Windows 无 uid)");
console.log("GID      :", userInfo.gid ?? "(Windows 无 gid)");

// os.homedir(): 用户主目录（与 userInfo().homedir 相同）
console.log("os.homedir():", os.homedir());

// ---- 7. 临时目录 ----
console.log("\\n===== 7. 临时目录 =====");
// os.tmpdir(): 系统默认临时文件目录
// POSIX: 通常是 /tmp
// Windows: 通常是 C:\\Users\\xxx\\AppData\\Local\\Temp
console.log("临时目录:", os.tmpdir());

// ---- 8. 网络接口信息 ----
console.log("\\n===== 8. 网络接口 =====");
// os.networkInterfaces(): 返回所有网络接口信息
const nets = os.networkInterfaces();
// 遍历所有网络接口
const netTable = [];
for (const [name, interfaces] of Object.entries(nets)) {
  for (const net of interfaces) {
    netTable.push({
      接口名: name,
      地址族: net.family,
      IP地址: net.address,
      子网掩码: net.netmask,
      MAC地址: net.mac,
      是否内部: net.internal ? "是" : "否",
    });
  }
}
console.log("所有网络接口:");
console.table(netTable);

// 过滤显示外部 IPv4 地址
console.log("\\n外部 IPv4 地址:");
for (const [name, interfaces] of Object.entries(nets)) {
  for (const net of interfaces) {
    // 只显示非内部的 IPv4 地址（即真实的局域网/公网 IP）
    if (net.family === "IPv4" && !net.internal) {
      console.log("  " + name + ": " + net.address + " (MAC: " + net.mac + ")");
    }
  }
}

// ---- 9. 换行符 ----
console.log("\\n===== 9. 系统换行符 =====");
// os.EOL: 当前系统的换行符
// POSIX: '\\n'（LF）
// Windows: '\\r\\n'（CRLF）
console.log("os.EOL:", JSON.stringify(os.EOL));
if (os.EOL === "\\n") {
  console.log("当前系统使用 LF 换行符（Unix/Linux/macOS）");
} else {
  console.log("当前系统使用 CRLF 换行符（Windows）");
}

// ---- 10. os.constants 常量 ----
console.log("\\n===== 10. os.constants 常量 =====");
// os.constants: 包含信号和错误码常量
console.log("常用信号常量:");
const signals = os.constants.signals;
console.log("  SIGINT  (Ctrl+C)    :", signals.SIGINT);   // 2
console.log("  SIGTERM (终止信号)  :", signals.SIGTERM);  // 15
console.log("  SIGKILL (强制终止)  :", signals.SIGKILL);  // 9

console.log("\\n常用错误码常量:");
const errno = os.constants.errno;
console.log("  ENOENT (文件不存在) :", errno.ENOENT);
console.log("  EACCES (权限不足)   :", errno.EACCES);
console.log("  EEXIST (文件已存在) :", errno.EEXIST);

// ---- 11. 综合应用：系统信息报告 ----
console.log("\\n===== 11. 系统信息报告 =====");
const report = {
  "操作系统": os.type() + " " + os.release(),
  "平台": os.platform(),
  "架构": os.arch(),
  "主机名": os.hostname(),
  "CPU": cpus[0].model,
  "CPU核心数": cpus.length,
  "总内存": bytesToReadable(totalMem),
  "可用内存": bytesToReadable(freeMem),
  "内存使用率": memUsagePercent + "%",
  "系统运行": uptimeDays + "天" + uptimeHours + "小时",
  "当前用户": userInfo.username,
  "主目录": userInfo.homedir,
  "临时目录": os.tmpdir(),
  "换行符": os.EOL === "\\n" ? "LF (Unix)" : "CRLF (Windows)",
};
console.log("===== 系统信息摘要 =====");
for (const [key, value] of Object.entries(report)) {
  console.log("  " + key.padEnd(12) + ": " + value);
}

// ---- 12. 实战：计算 CPU 使用率 ----
console.log("\\n===== 12. CPU 使用率采样 =====");
// 通过两次采样 CPU 时间，计算间隔内的 CPU 使用率
function getCPUInfo() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  return { idle: totalIdle, total: totalTick };
}

const start1 = getCPUInfo();
// 等待一小段时间后再次采样
setTimeout(() => {
  const end = getCPUInfo();
  const idleDiff = end.idle - start1.idle;
  const totalDiff = end.total - start1.total;
  const usagePercent = ((1 - idleDiff / totalDiff) * 100).toFixed(1);
  console.log("CPU 使用率（采样间隔）:", usagePercent + "%");
  console.log("(此值为采样周期内的平均使用率)");
}, 100);`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["基础入门", "核心模块", "异步编程", "进阶实战", "工程化"];
