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

在没有模块系统的时代，所有 JavaScript 代码都运行在同一个全局作用域中。如果两个脚本都定义了 \`var x = 10\`，后者会覆盖前者。这在小型项目中勉强可以接受，但当项目规模增大、引入多个第三方库时，**全局变量污染**会成为噩梦。

模块系统的核心目标是：
1. **隔离作用域**：每个模块有自己的独立作用域，不污染全局。
2. **复用代码**：把功能封装成模块，在多个项目中复用。
3. **依赖管理**：明确声明依赖关系，按需加载。
4. **封装实现**：只暴露接口，隐藏内部实现细节。

### CommonJS 规范详解

Node.js 默认使用 **CommonJS** 模块规范（由 Kevin Dangoor 在 2009 年发起的 ServerJS 工作组制定）。每个 \`.js\` 文件默认就是一个 CommonJS 模块。

CommonJS 的三个核心 API：

| API | 作用 | 说明 |
| --- | --- | --- |
| \`require(modulePath)\` | 导入模块 | 返回模块导出的对象 |
| \`module.exports\` | 导出模块 | 这才是真正决定模块导出内容的对象 |
| \`exports\` | 导出的快捷方式 | 初始时是 \`module.exports\` 的引用 |

### require 的工作流程（四步走）

当你调用 \`require('./math')\` 时，Node.js 内部会经历以下四个步骤：

#### 步骤 1：路径解析（Resolution）

确定模块的绝对路径。根据 require 参数的不同形式，解析方式不同：

| 参数形式 | 含义 | 示例 |
| --- | --- | --- |
| \`require('fs')\` | 内置模块或 node_modules | 直接返回内置模块 |
| \`require('./utils')\` | 相对当前文件的路径 | 从当前文件目录开始找 |
| \`require('../utils')\` | 上级目录 | 从上级目录开始找 |
| \`require('/abs/path')\` | 绝对路径 | 直接使用 |
| \`require('lodash')\` | 不带路径前缀 | 从当前目录开始逐级向上查找 node_modules |

#### 步骤 2：文件定位（File Location）

找到文件的确切位置，涉及扩展名补全和目录处理：

**扩展名补全规则**（按顺序尝试）：
1. 先看是否是文件（尝试 \`math\` → \`math.js\` → \`math.json\` → \`math.node\`）
2. 如果不是文件，尝试作为目录加载

**目录加载规则**：
1. 如果是目录，先读取 \`package.json\` 的 \`main\` 字段
2. 如果没有 package.json 或 main 字段指向的文件不存在，尝试 \`index.js\` → \`index.json\` → \`index.node\`

#### 步骤 3：编译执行（Compilation）

读取文件内容，将其包装在一个函数中执行。Node.js 会把模块代码包裹在如下函数中：

\`\`\`javascript
(function(exports, require, module, __filename, __dirname) {
  // 你的模块代码在这里
});
\`\`\`

这就是为什么每个模块有自己的 \`require\`、\`module\`、\`exports\`、\`__filename\`、\`__dirname\`——它们是函数参数注入的，而不是真正的全局变量。

#### 步骤 4：缓存（Caching）

模块**第一次被加载时**会执行完整流程，执行后把导出对象缓存到 \`require.cache\` 中。之后再 require 同一个模块，直接返回缓存的对象，**不会再次执行模块代码**。这意味着：

- 模块代码只会执行一次
- 多次 require 同一个模块返回的是同一个对象
- 可以利用这个特性做单例模式

### 模块加载顺序

当 require 一个模块名（不带 ./ 或 / 前缀）时，加载顺序是：

1. **内置模块**（fs, path, http 等）—— 最高优先级
2. **node_modules**：从当前文件目录开始，逐级向上查找 \`node_modules\` 目录，直到文件系统根目录

例如，在 \`/home/user/project/src/app.js\` 中 require('lodash')，Node.js 会依次查找：
1. \`/home/user/project/src/node_modules/lodash\`
2. \`/home/user/project/node_modules/lodash\`
3. \`/home/user/node_modules/lodash\`
4. \`/home/node_modules/lodash\`
5. \`/node_modules/lodash\`

### module.exports vs exports 的陷阱（详解）

这是 CommonJS 最常见的陷阱，理解它需要明白 JavaScript 的引用传递机制。

\`\`\`javascript
// 初始状态：Node.js 在模块内部做了这件事
// module.exports = {};        // 创建一个空对象
// exports = module.exports;   // exports 指向同一个对象
\`\`\`

**正确用法一：给 exports 添加属性**
\`\`\`javascript
exports.add = function(a, b) { return a + b; };
exports.PI = 3.14;
// ✅ 有效！因为 exports 和 module.exports 指向同一个对象
// 给 exports 加属性等于给 module.exports 加属性
\`\`\`

**正确用法二：直接给 module.exports 赋新值**
\`\`\`javascript
module.exports = {
  add: function(a, b) { return a + b; },
  PI: 3.14
};
// ✅ 有效！module.exports 被重新赋值，require 返回新对象
// 此时 exports 仍然指向旧对象，但没关系，因为最终导出的是 module.exports
\`\`\`

**错误用法：直接给 exports 赋新值**
\`\`\`javascript
exports = {
  add: function(a, b) { return a + b; },
  PI: 3.14
};
// ❌ 无效！exports 被重新赋值为新对象，但 module.exports 没变
// require 返回的是 module.exports（仍然是初始的空对象 {}）
// 结果：require('./math') 返回 {}，你的导出全部丢失！
\`\`\`

**记住这个规则**：最终导出的是 \`module.exports\`，不是 \`exports\`。\`exports\` 只是一个方便的引用快捷方式。

### 模块缓存机制与循环依赖

#### require.cache

\`require.cache\` 是一个对象，键是模块的绝对文件路径，值是模块对象。你可以通过它查看或操作缓存：

\`\`\`javascript
// 查看已缓存的模块
console.log(Object.keys(require.cache));

// 删除缓存，强制下次重新加载
delete require.cache[require.resolve('./myModule')];
\`\`\`

#### 循环依赖处理

当模块 A require 模块 B，模块 B 又 require 模块 A 时，就形成了循环依赖。Node.js 的处理方式是：**返回模块 A 当前已导出的部分（可能是不完整的）**。

\`\`\`javascript
// a.js
console.log('a 开始');
exports.loaded = false;
const b = require('./b');  // 此时去加载 b
console.log('a 中 b.loaded =', b.loaded);
exports.loaded = true;
console.log('a 结束');

// b.js
console.log('b 开始');
const a = require('./a');  // a 还没执行完，返回 a 的部分导出
console.log('b 中 a.loaded =', a.loaded);  // false（不完整）
exports.loaded = true;
console.log('b 结束');
\`\`\`

执行 \`node a.js\` 的输出：
\`\`\`
a 开始
b 开始
b 中 a.loaded = false    ← a 还没执行到 exports.loaded = true
b 结束
a 中 b.loaded = true     ← b 已经执行完了
a 结束
\`\`\`

**最佳实践**：尽量避免循环依赖。如果必须用，把共享的代码提取到第三个模块中。

### ES Modules 简介

ES Modules（ESM）是 ECMAScript 官方的模块系统，从 Node.js v13.2 开始稳定支持。

启用 ESM 的方式：
1. 在 \`package.json\` 中设置 \`"type": "module"\`
2. 使用 \`.mjs\` 扩展名
3. 在 \`package.json\` 的 \`"exports"\` 字段中指定

\`\`\`javascript
// ESM 语法
// 导出
export const PI = 3.14;
export function add(a, b) { return a + b; }
export default class Calculator {}

// 导入
import { PI, add } from './math.js';
import Calculator from './math.js';
import * as math from './math.js';  // 命名空间导入
\`\`\`

### CommonJS 与 ESM 的差异

| 特性 | CommonJS | ES Modules |
| --- | --- | --- |
| 语法 | require / module.exports | import / export |
| 加载方式 | 运行时动态加载（可条件加载） | 静态分析、编译时确定 |
| this 指向 | module.exports | undefined |
| 顶层 await | 不支持 | 支持 |
| __dirname / __filename | 可用 | 不可用（用 import.meta.url 替代） |
| 是否需要扩展名 | 可省略 | 必须写完整 |
| 循环依赖 | 返回部分导出 | 通过"活绑定"处理 |
| tree-shaking | 不支持 | 支持 |

### CommonJS 与 ESM 互操作

\`\`\`javascript
// 在 ESM 中导入 CommonJS（可以）
import cjsModule from './commonjs-module.cjs';
// cjsModule 等于 CommonJS 模块的 module.exports

// 在 CommonJS 中导入 ESM（只能用动态 import）
async function load() {
  const esm = await import('./esm-module.mjs');
}
\`\`\`

下面这段代码在一个文件中用对象字面量模拟多个模块的定义与导入，帮助理解 CommonJS 的导出/导入机制。`,
    code: `// ============================================================
// 第二章代码演示：CommonJS 模块系统模拟
// ============================================================
// 沙箱环境只有一个文件，无法真正 require 自定义模块，
// 因此我们用「对象字面量 + 闭包」来模拟 CommonJS 的机制。
// 在真实项目中，这些代码会分散在多个 .js 文件中。

// ---- 模拟 1：math.js 模块（导出函数和常量）----
// 在真实文件 math.js 中，这段代码会这样写：
//   function add(a, b) { return a + b; }
//   function subtract(a, b) { return a - b; }
//   const PI = 3.14159265;
//   module.exports = { add, subtract, PI };
const mathModule = {
  // 导出普通函数
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
  multiply(a, b) {
    return a * b;
  },
  // 导出常量
  PI: 3.14159265,
  E: 2.71828182,
};
// 这等价于 require('./math') 的返回值
const math = mathModule;

// 使用 math 模块
console.log("===== 使用 math 模块 =====");
console.log("add(1, 2) =", math.add(1, 2));
console.log("subtract(10, 3) =", math.subtract(10, 3));
console.log("multiply(4, 5) =", math.multiply(4, 5));
console.log("PI =", math.PI);
console.log("E =", math.E);

// ---- 模拟 2：counter.js 模块（导出闭包，实现私有状态）----
// CommonJS 模块天然支持闭包，可以创建私有变量
function createCounterModule() {
  // 这里的 count 是模块级私有变量，外部无法直接访问
  // 只有通过返回的方法才能操作
  let count = 0;

  return {
    // 增加计数
    increment() {
      count++;
      return count;
    },
    // 减少计数
    decrement() {
      count--;
      return count;
    },
    // 获取当前值
    getValue() {
      return count;
    },
    // 重置
    reset() {
      count = 0;
    },
  };
}
console.log("\\n===== 闭包模拟私有状态 =====");
const counter = createCounterModule();
console.log("初始值:", counter.getValue()); // 0
counter.increment();
counter.increment();
counter.increment();
console.log("加3次后:", counter.getValue()); // 3
counter.decrement();
console.log("减1次后:", counter.getValue()); // 2
counter.reset();
console.log("重置后:", counter.getValue()); // 0

// ---- 模拟 3：导出构造函数（类）----
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.greet = function () {
  return "你好，我是 " + this.name + "，今年 " + this.age + " 岁";
};
Person.prototype.birthday = function () {
  this.age++;
  return this;
};
// 在真实文件中：module.exports = Person;
const PersonModule = Person;

console.log("\\n===== 导出构造函数 =====");
const person = new PersonModule("小明", 20);
console.log(person.greet());
person.birthday().birthday(); // 链式调用
console.log("过两次生日后:", person.greet());

// ---- 模拟 4：exports vs module.exports 陷阱演示 ----
console.log("\\n===== exports vs module.exports 陷阱 =====");

// 模拟 Node.js 内部初始化
let moduleExports1 = {}; // 这是 module.exports
let exports1 = moduleExports1; // exports 指向同一个对象

// 正确做法 1：给 exports 添加属性 ✅
exports1.add = function (a, b) { return a + b; };
console.log("正确做法1 - exports.add:", typeof moduleExports1.add); // function

// 重置
moduleExports1 = {};
exports1 = moduleExports1;

// 正确做法 2：给 module.exports 赋新值 ✅
moduleExports1 = { subtract: function (a, b) { return a - b; } };
console.log("正确做法2 - module.exports 有 subtract:", typeof moduleExports1.subtract); // function
console.log("正确做法2 - exports 还是指向旧对象:", typeof exports1.subtract); // undefined

// 重置
moduleExports1 = {};
exports1 = moduleExports1;

// 错误做法：给 exports 赋新值 ❌
exports1 = { multiply: function (a, b) { return a * b; } };
// 此时 exports 指向新对象，但 module.exports 还是旧对象 {}
console.log("错误做法 - exports 有 multiply:", typeof exports1.multiply); // function
console.log("错误做法 - module.exports 没有 multiply:", typeof moduleExports1.multiply); // undefined
console.log("错误做法 - require 返回的是空对象:", JSON.stringify(moduleExports1));

// ---- 模拟 5：require.cache 概念演示 ----
console.log("\\n===== require.cache 缓存概念 =====");

// 模拟一个模块工厂（真实环境中模块只会执行一次）
let moduleLoadedCount = 0;
function loadExpensiveModule() {
  moduleLoadedCount++;
  console.log("  [模块被加载了！这是第 " + moduleLoadedCount + " 次]");
  return { data: "expensive data", loadedCount: moduleLoadedCount };
}

// 模拟 require.cache
const fakeRequireCache = {};

function fakeRequire(modulePath) {
  // 检查缓存
  if (fakeRequireCache[modulePath]) {
    console.log("  [命中缓存，直接返回已加载的模块]");
    return fakeRequireCache[modulePath];
  }
  // 第一次加载：执行模块代码
  const moduleObj = loadExpensiveModule();
  // 存入缓存
  fakeRequireCache[modulePath] = moduleObj;
  return moduleObj;
}

console.log("第一次 require('./expensive'):");
const r1 = fakeRequire("./expensive");
console.log("  返回:", JSON.stringify(r1));

console.log("第二次 require('./expensive'):");
const r2 = fakeRequire("./expensive");
console.log("  返回:", JSON.stringify(r2));

console.log("第三次 require('./expensive'):");
const r3 = fakeRequire("./expensive");
console.log("  返回:", JSON.stringify(r3));

console.log("模块实际加载次数:", moduleLoadedCount, "（只有第一次真正执行了模块代码）");
console.log("三次返回的是同一个对象:", r1 === r2 && r2 === r3);

// ---- 模拟 6：模块对象的结构 ----
console.log("\\n===== module 对象的结构 =====");
// 在真实模块中，module 对象有以下属性：
const sampleModule = {
  id: ".",                    // 模块标识，主模块为 '.'
  path: __dirname,            // 模块所在目录
  exports: mathModule,        // 导出对象（require 的返回值）
  filename: __filename,       // 文件完整路径
  loaded: true,               // 是否已加载完成
  children: [],               // 子模块数组
  paths: [                    // node_modules 查找路径
    "/current/node_modules",
    "/parent/node_modules",
    "/node_modules",
  ],
  require: function () { },   // 模块专属的 require 函数
};
console.log("module 对象关键字段:");
console.log(JSON.stringify({
  id: sampleModule.id,
  path: sampleModule.path,
  loaded: sampleModule.loaded,
  childrenCount: sampleModule.children.length,
  pathsCount: sampleModule.paths.length,
}, null, 2));`,
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
    // 删除工作目录本身
    fs.rmdirSync(workDir);
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
