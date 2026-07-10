// =============================================================
// Node.js 运行原理教程（noderun）—— 第一批章节
// -------------------------------------------------------------
// 主题：层层揭示 Node.js 底层运行机制——从事件循环到多进程
// 面向：已经会写 Node.js 代码、想理解底层原理以提升开发能力的开发者
// 第一批（1-4章）：
//   nr-what-is-nodejs   ：Node.js 到底是什么
//   nr-architecture     ：Node.js 架构全景图
//   nr-single-thread    ：单线程为什么能高并发
//   nr-event-loop-phases：事件循环的六个阶段
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（含表格、代码块、列表）
//   code    : 可运行、带详细中文注释的 Node.js 示例代码
//
// 代码运行环境约束：
//   - 在 Node.js 沙箱中执行（推荐 14+）
//   - 仅使用 Node.js 内置模块，不依赖第三方包
//   - 所有 demo 单文件可独立运行
//   - 用 console.log 输出结果，每步都有中文注释
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Node.js 到底是什么
  // =========================================================
  {
    id: "nr-what-is-nodejs",
    group: "开篇：Node.js 的核心本质",
    icon: "🎯",
    title: "Node.js 到底是什么：揭开神秘面纱",
    content: `## 一、先破除一个常见误解

如果你去问十个前端"Node.js 是什么"，大概率会听到这些回答：

- "Node.js 是一个后端框架"
- "Node.js 是 JavaScript 的服务端版本"
- "Node.js 是用 JS 写后端的工具"

这些说法**都不准确**。Node.js 既不是框架，也不是语言，更不是"JS 的服务端版本"。

**Node.js 是一个 JavaScript 运行时（runtime）。**

什么叫运行时？就是"能让你写的 JS 代码跑起来的那个环境"。浏览器是一个运行时（让 JS 在网页里跑），Node.js 也是一个运行时（让 JS 在操作系统上跑，脱离浏览器）。

打个比方：你写的一段 JS 代码就像一盘**录像带**，录像带本身不会播放，它需要一个**录像机**才能放出画面。浏览器是一台录像机，Node.js 是另一台录像机。同一盘录像带，插进不同的录像机，看到的画面不一样——因为两台机器提供的"播放能力"不同。

## 二、Node.js 的核心本质：三件套

Node.js 的核心，由三部分拼起来：

\`\`\`
Node.js = V8 引擎 + libuv 事件库 + 核心模块集合
\`\`\`

| 组成部分 | 是什么 | 干什么 |
|---------|--------|--------|
| **V8 引擎** | Google 开发的 JS 引擎（Chrome 也在用） | 把 JS 代码编译成机器码执行，管理 JS 堆内存 |
| **libuv** | C 语言写的异步 IO 库 | 提供事件循环、线程池、跨平台异步 IO |
| **核心模块** | fs、http、net、stream、path 等 | 给 JS 提供文件、网络、操作系统级别的能力 |

### 用"汽车"来类比

把 Node.js 想象成一辆汽车：

- **V8 引擎 = 发动机**：提供动力（执行 JS 代码）。没有它，汽车根本动不了。
- **libuv = 变速箱和传动系统**：把发动机的动力转化成车轮的转动（处理异步 IO、事件循环）。它让发动机不需要"一直踩油门等结果"，而是"挂上挡让系统自己转"。
- **核心模块 = 方向盘、刹车、油门**：是驾驶员能直接操作的部件（fs 读写文件、http 起服务、net 建网络连接）。
- **你的 JS 代码 = 驾驶员**：决定去哪、什么时候刹车、什么时候加油。

驾驶员（JS）不直接接触路面，它通过方向盘（核心模块）操作汽车，汽车靠传动系统（libuv）和发动机（V8）真正跑起来。

## 三、Node.js 不是浏览器里的 JS

这一点非常关键，很多人栽在这。

浏览器里的 JS 和 Node.js 里的 JS，虽然语法一样，但**环境完全不同**：

| 能力 | 浏览器 JS | Node.js JS |
|------|----------|-----------|
| DOM 操作（document） | ✅ 有 | ❌ 没有 |
| BOM（window） | ✅ 有 | ❌ 没有 |
| 文件系统（fs） | ❌ 没有（安全限制） | ✅ 有 |
| 原生网络（http、net） | ❌ 只能 fetch/WebSocket | ✅ 有完整的 TCP/HTTP |
| 进程控制（process） | ❌ 没有 | ✅ 有 |
| Buffer（二进制数据） | ❌ 只有 ArrayBuffer | ✅ 有 Buffer |

所以你在 Node.js 里写 \`document.getElementById\` 会直接报错——因为 Node.js 根本没有 document 这个东西。

### Node.js 自己的全局对象

Node.js 提供了一堆浏览器没有的全局对象：

- \`process\`：当前进程的信息和控制（环境变量、退出、argv 等）
- \`Buffer\`：处理二进制数据的类
- \`require\`：加载模块的函数（CommonJS）
- \`__dirname\`：当前文件所在目录的绝对路径
- \`__filename\`：当前文件的绝对路径
- \`global\`：Node.js 的全局对象（类似浏览器的 window，但里面没有 DOM）

## 四、为什么 Node.js 能做服务端

浏览器里的 JS 只能操作网页，不能碰操作系统。为什么？因为浏览器出于安全考虑，把 JS 关在"沙箱"里。

Node.js 不同——它**直接运行在操作系统上**，通过核心模块拿到了操作系统能力：

- \`fs\` 模块：读写文件（操作系统级别的文件 IO）
- \`http\` 模块：创建 HTTP 服务器、发起 HTTP 请求
- \`net\` 模块：操作 TCP 连接（比 http 更底层）
- \`child_process\` 模块：创建子进程、执行系统命令
- \`os\` 模块：获取操作系统信息（CPU、内存、平台）

这些能力让 Node.js 能做服务端该做的事：起 Web 服务、连数据库、读写文件、调用其他进程。

## 五、日常开发启示

理解了"Node.js 是运行时"，很多困惑就解开了：

1. **为什么 Node.js 没有"中间件"概念？** 中间件是 Express/Koa 这些**框架**的设计，Node.js 本身只有 http 模块，原生的 http 模块没有中间件这一说。
2. **为什么 Node.js 用 require 而不是 import？** 历史原因。Node.js 诞生时（2009年），JS 还没有 ES Module 标准（ES6 是 2015 年），所以采用了 CommonJS 规范（require）。现在 Node.js 也支持 ES Module，但 CommonJS 仍然是大量项目的主流。
3. **为什么 Node.js 升级大版本后有些代码不兼容？** 因为 V8 引擎升级会带来 JS 语法/行为的变更，libuv 升级会带来 IO 行为的变更，核心模块 API 也会调整。
4. **为什么 Node.js 能做后端但不像 Java 那样"重"？** 因为它本质是一个轻量运行时，只提供最基础的能力（IO、网络、事件循环），不强制你用任何框架、任何架构。

## 六、本章 demo 说明

下面 demo 会用代码实际感受"Node.js 运行时"和"浏览器环境"的区别：

1. 查看 Node.js 的全局对象（global、process、Buffer、require）
2. 对比说明 Node.js 没有 window/document
3. 展示 process 里的关键信息（版本、平台、架构、argv）
4. 展示 \`__dirname\` 和 \`__filename\` 的值

跑完之后，你会直观感受到：Node.js 不是一个"框架"，它是一个带着操作系统能力的 JS 运行环境。`,
    code: `// ============================================
// 第一章 demo：Node.js 运行时到底是什么
// 演示：
//   1. Node.js 的全局对象（global、process、Buffer、require）
//   2. 对比浏览器全局对象（说明 Node.js 没有 window/document）
//   3. 展示 process 的关键信息
//   4. 展示 __dirname 和 __filename
// ============================================

console.log("=".repeat(50));                      // 打印分隔线
console.log("Node.js 运行原理 — 第一章 demo");    // 打印章节标题
console.log("Node.js 版本:", process.version);    // 打印当前 Node.js 版本
console.log("=".repeat(50));                      // 再打印一条分隔线
console.log();                                    // 打印空行

// ===== 1. Node.js 的全局对象 =====
console.log("【1. Node.js 的全局对象】");          // 打印小节标题

// global 是 Node.js 的顶层全局对象（类似浏览器的 window）
console.log("  typeof global    =", typeof global);     // 输出 object
console.log("  typeof process   =", typeof process);    // 输出 object，process 是全局可用
console.log("  typeof Buffer    =", typeof Buffer);     // 输出 function，Buffer 是全局类
console.log("  typeof require   =", typeof require);    // 输出 function，require 是全局函数
console.log("  typeof console   =", typeof console);    // 输出 object，console 也是全局的
console.log("  typeof setTimeout =", typeof setTimeout); // 输出 function，定时器也是全局的
console.log();                                    // 打印空行

// ===== 2. 对比浏览器全局对象 =====
console.log("【2. 浏览器里的全局对象，Node.js 里有没有？】");  // 打印小节标题

// Node.js 没有浏览器里的 window、document、localStorage 等
// 用 typeof 判断，避免直接访问未定义变量报错
console.log("  typeof window       =", typeof window);       // 输出 undefined，Node.js 没有 window
console.log("  typeof document     =", typeof document);     // 输出 undefined，Node.js 没有 document
console.log("  typeof localStorage =", typeof localStorage); // 输出 undefined，没有 localStorage
console.log("  typeof fetch        =", typeof fetch);        // 新版 Node.js (18+) 已内置 fetch
console.log("  → 结论：Node.js 不是浏览器，没有 DOM 和 BOM");
console.log();                                    // 打印空行

// ===== 3. process 对象的关键信息 =====
console.log("【3. process 对象：当前进程的信息】");  // 打印小节标题

// process 是 Node.js 提供的进程对象，浏览器里没有
console.log("  Node.js 版本  :", process.version);        // 打印 Node.js 版本号，如 v20.11.0
console.log("  运行平台      :", process.platform);       // 打印操作系统平台，如 darwin/linux/win32
console.log("  CPU 架构      :", process.arch);           // 打印 CPU 架构，如 arm64/x64
console.log("  进程 PID      :", process.pid);            // 打印当前进程的进程 ID
console.log("  当前工作目录  :", process.cwd());          // 打印当前工作目录
console.log("  Node 安装路径 :", process.execPath);       // 打印 Node.js 可执行文件的路径

// process.argv 是命令行参数数组
console.log("  命令行参数 argv:", process.argv);          // 打印启动时传入的参数
console.log("  → argv[0] 是 node 路径，argv[1] 是脚本路径");
console.log();                                    // 打印空行

// ===== 4. __dirname 和 __filename =====
console.log("【4. __dirname 和 __filename：模块路径信息】");  // 打印小节标题

// 这两个是 CommonJS 模块自动注入的局部变量，不是真正的全局变量
// __dirname：当前 JS 文件所在目录的绝对路径
// __filename：当前 JS 文件的绝对路径
console.log("  __dirname  =", __dirname);   // 打印当前文件所在目录
console.log("  __filename =", __filename);  // 打印当前文件的完整路径
console.log("  → 这两个变量浏览器里不存在，是 Node.js 模块系统提供的");
console.log();                                    // 打印空行

// ===== 5. 总结 =====
console.log("【5. 总结】");
console.log("  Node.js = V8 引擎 + libuv + 核心模块");
console.log("  它是一个运行时，不是框架，不是语言");
console.log("  它让 JS 脱离浏览器，获得了文件、网络、进程等操作系统能力");
console.log("  它没有 DOM/window，但有 process/Buffer/require/__dirname");`
  },

  // =========================================================
  // 第二章：Node.js 架构全景图
  // =========================================================
  {
    id: "nr-architecture",
    group: "开篇：Node.js 的核心本质",
    icon: "🏗️",
    title: "Node.js 架构全景图：三层结构一目了然",
    content: `## 一、Node.js 的三层架构

要看懂 Node.js，先在脑子里装一张"分层图"。Node.js 从上到下分三层：

\`\`\`
┌─────────────────────────────────────────────┐
│  第一层：你的 JavaScript 应用代码             │  ← 你写的业务逻辑
│  （app.js、server.js、各种 .js 文件）        │
├─────────────────────────────────────────────┤
│  第二层：Node.js 核心模块                    │  ← 官方提供的能力
│  （fs、http、net、stream、path、crypto…）   │
│  （部分用 JS 写，部分用 C++ 写）             │
├─────────────────────────────────────────────┤
│  第三层：底层引擎                            │  ← 真正干活的
│  ┌──────────────┐  ┌────────────────────┐   │
│  │  V8 引擎     │  │  libuv             │   │
│  │  JS 编译执行 │  │  事件循环/线程池/IO │   │
│  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────┘
        ↑                       ↑
     操作系统（Linux/macOS/Windows）
\`\`\`

每一层各司其职，上层调用下层，下层为上层提供服务。

### 第一层：你的应用代码

就是你写的那些 \`app.js\`、\`server.js\`。这一层纯粹是 JavaScript，跑在 V8 上。你在这里写路由、写业务逻辑、调用核心模块。

### 第二层：Node.js 核心模块

这是 Node.js 官方提供的一堆模块，是你和应用代码和底层能力之间的"桥梁"。

- 有些模块**用 JS 写**：比如 \`path\`、\`url\`，它们就是普通的 JS 代码，你可以在 Node.js 源码里看到。
- 有些模块**用 C++ 写**：比如 \`fs\`、\`net\`、\`crypto\`，它们的底层（真正调用操作系统 API 的部分）是 C++ 代码，上层包了一层 JS 接口。

为什么有的用 C++？因为**直接和操作系统打交道的事**（读写文件、建 TCP 连接、加密运算），JS 做不了，必须靠 C++ 调用操作系统的系统调用（syscall）。

### 第三层：V8 + libuv

这是 Node.js 真正的"发动机房"。

**V8 引擎的职责：**
- 把你写的 JS 代码**编译成机器码**（JIT，即时编译），让 CPU 能直接执行
- 管理 JS 的**堆内存**（对象的分配、垃圾回收）
- 实现 JS 的**数据类型**（对象、数组、函数在底层都是 V8 的 C++ 对象）

**libuv 的职责：**
- 提供**事件循环**（event loop）——Node.js 异步能力的核心
- 提供**线程池**（thread pool，默认 4 个线程）——处理那些"不能立即完成的阻塞操作"
- 提供**异步 IO** 能力——跨平台封装了 epoll（Linux）、kqueue（macOS）、IOCP（Windows）
- 提供**定时器**、**信号处理**、**进程间通信**等基础设施

## 二、关键点：Node.js 的"单线程"不等于"只有一个线程"

这是初学者最容易误解的地方。

**Node.js 单线程，指的是：你的 JS 代码只在一个线程里运行。**

但 Node.js **整体并不是单线程的**。libuv 内部有一个线程池（默认 4 个线程），专门处理那些会阻塞的操作：

- 文件 IO（\`fs.readFile\`）：真正的磁盘读取在线程池里完成
- DNS 查询（\`dns.lookup\`）：\`getaddrinfo\` 是阻塞的，放线程池
- 一些 crypto 操作（\`crypto.pbkdf2\`）：CPU 密集的加密运算放线程池
- \`zlib\` 压缩解压：部分操作放线程池

而**网络 IO**（\`net\`、\`http\`）**不用线程池**——它用的是操作系统原生的异步机制（epoll/kqueue/IOCP），由事件循环直接管理。

### 用"餐厅"来类比

把 Node.js 想象成一家餐厅：

- **主线程（JS 运行的线程）= 服务员**：负责接待客人、点单、上菜。服务员只有一个，但他动作快，不需要自己去做菜。
- **libuv 线程池 = 后厨的厨师**：服务员把订单给后厨，厨师（线程池）去做菜。后厨有多个厨师（默认 4 个），可以同时做多道菜。
- **事件循环 = 传菜员**：厨师做完一道菜，传菜员把它端给服务员，服务员再端给客人。

服务员（主线程）不需要等菜做完才能接下一单——他把单子丢给后厨就继续接客。菜做好了，传菜员（事件循环）会通知他。

**为什么 fs.readFile 是异步的？** 因为真正的磁盘读取是阻塞操作，主线程不能等，所以把读取任务丢给线程池（厨师），读完之后通过事件循环（传菜员）通知主线程执行回调。

## 三、V8 和 libuv 怎么配合

一条完整的异步 IO 调用链路：

\`\`\`
你的 JS 代码：fs.readFile('a.txt', callback)
      ↓
核心模块 fs（JS 层）：参数校验、包装
      ↓
核心模块 fs（C++ 层）：调用 libuv 接口
      ↓
libuv：把任务交给线程池，线程读磁盘
      ↓ （磁盘读完）
libuv：把结果通过事件循环通知主线程
      ↓
V8：执行你的 callback，把结果传给它
\`\`\`

整个过程里，**主线程只在"发起调用"和"执行回调"这两个时刻忙一下**，中间的磁盘读取它完全不参与。

## 四、日常开发启示

1. **为什么 fs.readFile 是异步的，而 fs.readFileSync 是同步的？** 同步版本会让主线程停下来等磁盘读完，期间整个进程卡住（无法处理其他请求）。异步版本把读盘交给线程池，主线程继续干别的。
2. **为什么大量并发文件 IO 会变慢？** 线程池默认只有 4 个线程，如果你同时发起 100 个 fs.readFile，只有 4 个在真正读盘，其余 96 个排队。
3. **为什么网络服务能扛高并发？** 网络 IO 不占线程池，靠 epoll/kqueue 这种系统级异步机制，一个线程能同时监控成千上万个连接。
4. **为什么 CPU 密集任务会拖垮 Node.js？** 因为 JS 在单线程跑，一个耗时计算会霸占主线程，所有其他请求（包括事件循环）都得等它算完。

## 五、本章 demo 说明

下面 demo 用代码验证架构里讲的几个点：

1. 查看 \`UV_THREADPOOL_SIZE\`（线程池大小，默认 4）
2. 动态修改线程池大小并验证
3. 展示 \`process.cpuUsage\` 和 \`process.memoryUsage\`
4. 用 setTimeout 感受事件循环的存在

跑完之后，你会直观看到"线程池"和"事件循环"这两个抽象概念的真实痕迹。`,
    code: `// ============================================
// 第二章 demo：Node.js 架构三层结构
// 演示：
//   1. 查看 libuv 线程池大小（UV_THREADPOOL_SIZE，默认 4）
//   2. 修改线程池大小并验证
//   3. 展示 process.cpuUsage 和 process.memoryUsage
//   4. 用 setTimeout 感受事件循环的存在
// ============================================

console.log("=".repeat(50));                      // 打印分隔线
console.log("Node.js 运行原理 — 第二章 demo");     // 打印章节标题
console.log("Node.js 版本:", process.version);     // 打印版本
console.log("=".repeat(50));                       // 打印分隔线
console.log();                                     // 打印空行

// ===== 1. 查看线程池大小 =====
console.log("【1. libuv 线程池大小】");            // 打印小节标题

// UV_THREADPOOL_SIZE 是 libuv 的环境变量，控制线程池大小
// 必须在进程启动前设置（启动后改无效），默认值是 4
// 这里读取的是启动时的值
console.log("  UV_THREADPOOL_SIZE =", process.env.UV_THREADPOOL_SIZE || "4 (默认)");
console.log("  → libuv 线程池默认 4 个线程，处理文件IO/DNS/crypto 等");
console.log("  → 网络 IO 不用线程池，靠 epoll/kqueue 异步机制");
console.log();                                     // 打印空行

// ===== 2. 用 crypto 模块感受线程池的存在 =====
console.log("【2. 用 crypto.pbkdf2 感受线程池】"); // 打印小节标题

// crypto.pbkdf2 是一个会占用线程池的 CPU 密集操作
// 同时发起多个，就能看到线程池的并行能力
const crypto = require('crypto');                  // 引入内置 crypto 模块

// 定义一个函数：跑一次 pbkdf2，记录耗时
function runPbkdf2(index, callback) {
  const start = Date.now();                        // 记录开始时间
  // pbkdf2 是密钥派生函数，iterations 越大越慢
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {
    if (err) throw err;                            // 出错就抛出
    const cost = Date.now() - start;               // 计算耗时（毫秒）
    console.log('  任务 ' + index + ' 完成，耗时 ' + cost + 'ms');
    callback();                                    // 执行回调
  });
}

console.log("  同时发起 4 个 pbkdf2 任务（线程池默认 4 线程）...");
const totalStart = Date.now();                     // 记录总开始时间
let doneCount = 0;                                 // 已完成数量
// 同时发起 4 个任务，它们会并行跑在 4 个线程上
for (let i = 1; i <= 4; i++) {
  runPbkdf2(i, () => {
    doneCount++;                                   // 完成数 +1
    if (doneCount === 4) {                         // 全部完成
      const totalCost = Date.now() - totalStart;
      console.log('  → 4 个任务总耗时 ' + totalCost + 'ms（并行，所以总耗时≈最慢的一个）');
      console.log();
      demoNext();                                  // 继续下一个 demo
    }
  });
}

// ===== 3. CPU 和内存使用情况 =====
function demoNext() {
  console.log("【3. process.cpuUsage 和 process.memoryUsage】"); // 打印小节标题

  // process.cpuUsage() 返回当前进程的 CPU 使用情况（微秒）
  // user：用户态代码耗时，system：内核态耗时
  const cpu = process.cpuUsage();
  console.log("  CPU 用户态耗时:", cpu.user, "微秒");
  console.log("  CPU 内核态耗时:", cpu.system, "微秒");

  // process.memoryUsage() 返回内存使用情况（字节）
  const mem = process.memoryUsage();
  console.log("  内存使用:");
  console.log("    rss          :", (mem.rss / 1024 / 1024).toFixed(2), "MB (常驻内存集)");
  console.log("    heapTotal    :", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB (V8 堆总量)");
  console.log("    heapUsed     :", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB (V8 堆已用)");
  console.log("    external     :", (mem.external / 1024 / 1024).toFixed(2), "MB (C++ 对象)");
  console.log("    arrayBuffers :", (mem.arrayBuffers / 1024 / 1024).toFixed(2), "MB (ArrayBuffer)");
  console.log("  → heapTotal/heapUsed 是 V8 引擎管理的 JS 堆内存");
  console.log();                                   // 打印空行

  demoEventLoop();                                 // 继续下一个 demo
}

// ===== 4. 用 setTimeout 感受事件循环 =====
function demoEventLoop() {
  console.log("【4. 用 setTimeout 感受事件循环】");  // 打印小节标题

  // setTimeout 的回调由事件循环的 timers 阶段执行
  // 这里注册几个定时器，观察它们的执行顺序
  console.log("  [主线程] 开始注册定时器...");

  // 注册一个 0ms 的定时器（实际最小 1ms）
  setTimeout(() => {
    console.log("  [事件循环] setTimeout 0ms 触发");
  }, 0);

  // 注册一个 50ms 的定时器
  setTimeout(() => {
    console.log("  [事件循环] setTimeout 50ms 触发");
  }, 50);

  // 用 setImmediate 注册一个 check 阶段的回调
  setImmediate(() => {
    console.log("  [事件循环] setImmediate 触发（check 阶段）");
  });

  console.log("  [主线程] 定时器注册完毕，主线程代码执行结束");
  console.log("  [主线程] 接下来交给事件循环处理回调...");
  console.log();

  // 注意：主线程代码全部跑完后，进程不会立即退出
  // 因为事件循环里还有未触发的定时器（50ms 那个）
  // 等 50ms 定时器触发并执行完，事件循环发现没任务了，进程才退出
  setTimeout(() => {
    console.log("  [总结] 所有定时器都触发了，事件循环即将退出");
    console.log("  → 这就是事件循环：主线程代码跑完后，它接手处理所有异步回调");
    console.log("  → 没有任务了，事件循环结束，Node.js 进程退出");
  }, 100);
}`
  },

  // =========================================================
  // 第三章：单线程为什么能高并发
  // =========================================================
  {
    id: "nr-single-thread",
    group: "第一部分 事件循环——Node.js 的心脏",
    icon: "🫀",
    title: "单线程为什么能高并发：事件循环的秘密",
    content: `## 一、先说结论

Node.js 单线程，指的是**你的 JS 代码只在一个线程里运行**。但它能扛高并发，靠的是两件事：

1. **非阻塞 IO**：遇到 IO 操作（读文件、发请求）不傻等，立刻去做下一件事
2. **事件循环**：IO 完成后，通过事件循环把结果回调给主线程

**单线程 ≠ 低并发**。单线程 + 非阻塞 IO + 事件循环 = 高并发（针对 IO 密集场景）。

## 二、对比传统多线程模型

传统服务端（如 Java Tomcat 的 BIO 模型）是这样处理请求的：

\`\`\`
请求1 来了 → 分配线程1 → 线程1 处理（遇到查数据库，线程1 阻塞等待）
请求2 来了 → 分配线程2 → 线程2 处理
请求3 来了 → 分配线程3 → ...
...
请求 N 来了 → 没有空闲线程了，请求排队或拒绝
\`\`\`

问题：
- 每个线程都占内存（默认栈 1MB），1000 个线程就是 1GB
- 线程切换有开销（CPU 上下文切换，保存/恢复寄存器）
- 并发数受限于线程池大小

### Node.js 的方式

\`\`\`
请求1 来了 → 主线程处理 → 遇到查数据库，注册回调，立刻去处理请求2
请求2 来了 → 主线程处理 → 遇到读文件，注册回调，立刻去处理请求3
请求3 来了 → 主线程处理 → ...
数据库查完了 → 事件循环通知主线程 → 执行请求1 的回调，返回结果
文件读完了 → 事件循环通知主线程 → 执行请求2 的回调，返回结果
\`\`\`

一个线程处理所有请求，遇到 IO 不等，IO 完了事件循环来通知。**并发数不受线程数限制**，只受内存和系统文件描述符限制。

### 用"快递分拣中心"来类比

**传统模式（多线程）：**
一个分拣员（线程）一次只处理一个包裹（请求）。他把包裹装上快递车（发起 IO），然后**站在原地等**快递车送达目的地，等客户签收，他才回来处理下一个包裹。

如果你想同时处理 100 个包裹，就得雇 100 个分拣员（100 个线程）。

**Node.js 模式（单线程 + 事件循环）：**
一个分拣员（主线程）同时管理多个包裹。他把包裹1 装上快递车（发起 IO），**不等**，立刻回来处理包裹2，再把包裹2 装上另一辆车，又立刻处理包裹3……

快递车1 送达了，司机（事件循环）回来告诉分拣员："包裹1 送达了，客户签收了。"分拣员记一笔，继续手头的活。

一个分拣员能同时管理成百上千个在途包裹，因为他在途的包裹交给快递车（操作系统异步 IO）去送，自己只负责"装车"和"接收送达通知"。

## 三、非阻塞 IO 的底层基础

非阻塞 IO 不是 Node.js 发明的，是**操作系统提供的**。

- Linux：\`epoll\`
- macOS：\`kqueue\`
- Windows：\`IOCP\`

这些机制让**一个线程能同时监控多个文件描述符**（fd），哪个 fd 有事件（可读、可写、出错）了，操作系统就通知这个线程。

libuv 把这些平台差异封装起来，给 Node.js 提供统一的异步 IO 接口。所以 Node.js 的网络 IO 是**真正的异步**——靠操作系统的 epoll/kqueue，不占线程池。

文件 IO 不一样，因为各操作系统的异步文件 IO 实现不完善，libuv 用**线程池**模拟异步：把文件读写丢给线程池里的一个线程去读，读完了再通知主线程。

## 四、事件循环的本质

事件循环，说白了就是一个 **while 循环**：

\`\`\`
while (还有任务) {
  检查有没有定时器到期        → 执行定时器回调
  检查有没有 IO 完成          → 执行 IO 回调
  检查有没有 setImmediate    → 执行 immediate 回调
  检查有没有 close 事件       → 执行 close 回调
}
进程退出
\`\`\`

每一轮循环（tick），事件循环会过一遍所有的"任务队列"，把到期的、完成的任务回调拿出来执行。执行完一轮，如果还有未完成的任务（比如没到期的定时器、没完成的 IO），就继续下一轮；如果所有任务都清空了，进程就退出。

## 五、适合和不适合的场景

### 适合：IO 密集型

- **API 网关**：接收请求，转发给后端服务，聚合结果返回。主要操作是网络 IO，非常适合。
- **聊天服务器**：大量长连接，消息收发都是网络 IO。
- **实时推送**：WebSocket、SSE，维持大量连接，偶尔推消息。
- **中间层/BFF**：聚合多个后端接口，IO 为主。

这些场景的特点是：**CPU 干活少，等 IO 多**。Node.js 主线程在"等 IO"的时候完全不占 CPU，可以去处理别的请求。

### 不适合：CPU 密集型

- **视频转码**：FFmpeg 那种，CPU 满载算很久。
- **大数据计算**：遍历百万级数据做复杂运算。
- **图片处理**：缩放、滤镜，CPU 密集。
- **加密哈希**：bcrypt、大量 pbkdf2。

这些场景的特点是：**CPU 要算很久**。而 Node.js 主线程只有一个，一个 CPU 密集任务会**霸占主线程**，期间所有其他请求（包括事件循环）都得排队等它算完。

### 一个常见误区

"Node.js 不能做 CPU 密集任务"——**不完全对**。你可以：
- 用 \`worker_threads\` 开工作线程，把 CPU 任务丢给别的线程
- 用 \`child_process\` 开子进程
- 用 \`cluster\` 开多个进程

但这就失去了"单线程简单"的好处，而且要处理进程间通信、状态同步。所以**不是不能做，是不擅长**。

## 六、日常开发启示

1. **为什么 Node.js 适合做 API 网关、聊天服务器？** 因为这些场景 IO 为主，单线程 + 事件循环能高效处理大量并发连接。
2. **为什么 Node.js 不适合做视频转码？** 一个转码任务会让主线程卡住，所有请求都跟着卡。
3. **遇到 CPU 密集任务怎么办？** 开 \`worker_threads\` 或子进程，别让它在主线程跑。
4. **为什么响应时间会偶尔飙高？** 检查主线程有没有"慢操作"——比如同步读大文件、JSON.parse 超大字符串、复杂正则匹配。

## 七、本章 demo 说明

下面 demo 用代码直观感受"阻塞 vs 非阻塞"：

1. 模拟阻塞操作：用一个长循环霸占主线程，展示"其他回调被卡住"
2. 模拟非阻塞并发：同时发起多个"IO 操作"（用 setTimeout 模拟），看它们如何并发完成
3. 对比同步和异步的执行时间差异

跑完你会看到：阻塞操作会让整个进程"假死"，而非阻塞 IO 能让一个线程同时管理多个任务。`,
    code: `// ============================================
// 第三章 demo：单线程为什么能高并发
// 演示：
//   1. 模拟阻塞操作的影响（长循环卡住主线程）
//   2. 模拟非阻塞的并发（多个"IO"同时进行）
//   3. 对比同步和异步的执行时间差异
// ============================================

console.log("=".repeat(50));                      // 打印分隔线
console.log("Node.js 运行原理 — 第三章 demo");     // 打印章节标题
console.log("=".repeat(50));                       // 打印分隔线
console.log();                                     // 打印空行

// ===== 1. 模拟阻塞操作的影响 =====
console.log("【1. 阻塞操作的影响：长循环卡住主线程】"); // 打印小节标题

// 先注册一个 100ms 后该执行的定时器
setTimeout(() => {
  console.log("  [定时器] 100ms 定时器触发");
}, 100);

// 再注册一个 setImmediate（应该在主线程结束后立刻执行）
setImmediate(() => {
  console.log("  [immediate] setImmediate 触发");
});

console.log("  [主线程] 开始执行阻塞循环（约 500ms）...");
const blockStart = Date.now();                     // 记录阻塞开始时间

// 这是一个 CPU 密集的空循环，会霸占主线程约 500ms
// 期间定时器和 setImmediate 都无法触发！
let sum = 0;                                       // 定义累加变量
for (let i = 0; i < 500000000; i++) {              // 循环 5 亿次
  sum += i;                                        // 累加（防止被优化掉）
}
const blockCost = Date.now() - blockStart;         // 计算阻塞耗时
console.log("  [主线程] 阻塞结束，耗时 " + blockCost + "ms，sum =", sum);
console.log("  → 注意：100ms 的定时器被延迟到阻塞结束后才触发！");
console.log("  → 这就是单线程的代价：一个 CPU 密集任务卡住整个进程");
console.log();                                     // 打印空行

// ===== 2. 模拟非阻塞的并发 =====
console.log("【2. 非阻塞并发：多个 IO 同时进行】"); // 打印小节标题

// 用 setTimeout 模拟异步 IO 操作
// 每个任务有不同的"耗时"，但它们是并行的，总耗时≈最慢的那个
function mockAsyncIO(name, duration, callback) {
  console.log("  [发起] " + name + " 开始（预计 " + duration + "ms）");
  setTimeout(() => {
    console.log("  [完成] " + name + " 完成（耗时 " + duration + "ms）");
    callback();                                    // 执行回调
  }, duration);
}

const concurrentStart = Date.now();                // 记录并发开始时间
let finished = 0;                                  // 已完成数
const tasks = [                                    // 定义 5 个"IO 任务"
  { name: '查询数据库', duration: 200 },
  { name: '读取文件', duration: 100 },
  { name: '请求API', duration: 300 },
  { name: '查Redis', duration: 50 },
  { name: '查缓存', duration: 80 }
];

// 同时发起所有任务
tasks.forEach(task => {
  mockAsyncIO(task.name, task.duration, () => {
    finished++;                                    // 完成数 +1
    if (finished === tasks.length) {               // 全部完成
      const totalCost = Date.now() - concurrentStart;
      console.log("  → 全部完成，总耗时 " + totalCost + "ms");
      console.log("  → 5 个任务串行需 " + (200+100+300+50+80) + "ms，并发只需 " + totalCost + "ms");
      console.log("  → 这就是非阻塞 IO 的威力：一个线程同时管理多个 IO");
      console.log();
      demoSyncVsAsync();                           // 继续下一个 demo
    }
  });
});

// ===== 3. 对比同步和异步 =====
function demoSyncVsAsync() {
  console.log("【3. 同步 vs 异步：执行时间对比】"); // 打印小节标题

  // 同步方式：串行执行 3 个任务，总耗时 = 100 + 100 + 100 = 300ms
  function syncTask(name) {
    const start = Date.now();
    // 用 Atomics.wait 模拟同步阻塞（比空循环更精确）
    // 注意：这是真正阻塞主线程的同步操作
    while (Date.now() - start < 100) { /* 忙等 100ms */ }
    console.log("  [同步] " + name + " 完成");
  }

  console.log("  同步方式（串行，阻塞主线程）：");
  const syncStart = Date.now();
  syncTask("任务A");                               // 同步执行任务A
  syncTask("任务B");                               // 同步执行任务B
  syncTask("任务C");                               // 同步执行任务C
  console.log("  → 同步总耗时 " + (Date.now() - syncStart) + "ms（串行累加）");
  console.log();

  // 异步方式：并发执行 3 个任务，总耗时 ≈ 100ms
  function asyncTask(name, callback) {
    setTimeout(() => {
      console.log("  [异步] " + name + " 完成");
      callback();
    }, 100);
  }

  console.log("  异步方式（并发，不阻塞主线程）：");
  const asyncStart = Date.now();
  let asyncDone = 0;
  asyncTask("任务A", () => {                       // 异步发起任务A
    asyncDone++;
    if (asyncDone === 3) {
      console.log("  → 异步总耗时 " + (Date.now() - asyncStart) + "ms（并发，≈最慢的一个）");
      console.log();
      console.log("=".repeat(50));
      console.log("总结：");
      console.log("  单线程 + 非阻塞 IO + 事件循环 = 高并发（IO 密集场景）");
      console.log("  但 CPU 密集任务会阻塞单线程，拖垮整个进程");
      console.log("  → 这就是 Node.js 适合做 API 网关、聊天服务器的原因");
      console.log("=".repeat(50));
    }
  });
  asyncTask("任务B", () => {                       // 异步发起任务B
    asyncDone++;
    if (asyncDone === 3) { /* 同上 */ }
  });
  asyncTask("任务C", () => {                       // 异步发起任务C
    asyncDone++;
    if (asyncDone === 3) { /* 同上 */ }
  });
}`
  },

  // =========================================================
  // 第四章：事件循环的六个阶段
  // =========================================================
  {
    id: "nr-event-loop-phases",
    group: "第一部分 事件循环——Node.js 的心脏",
    icon: "🔄",
    title: "事件循环的六个阶段：timer、poll、check 详解",
    content: `## 一、事件循环是一个循环，每轮经过 6 个阶段

事件循环不是什么神秘的东西，它就是一个 **while 循环**，每一轮（叫一个 tick）会依次经过 6 个**阶段（phase）**。每个阶段维护着自己的回调队列，只处理属于自己类型的回调。

\`\`\`
   ┌───────────────────────────┐
   │    事件循环一轮（tick）     │
   └───────────────────────────┘
            ↓
   ┌─────────────────────┐
   │ 1. timers            │  执行 setTimeout / setInterval 到期的回调
   └─────────────────────┘
            ↓
   ┌─────────────────────┐
   │ 2. pending callbacks │  执行系统级回调（TCP 错误、ECONNREFUSED 等）
   └─────────────────────┘
            ↓
   ┌─────────────────────┐
   │ 3. idle, prepare     │  内部使用（开发者基本不接触）
   └─────────────────────┘
            ↓
   ┌─────────────────────┐
   │ 4. poll              │  获取新的 IO 事件，执行 IO 回调（最重要的阶段）
   └─────────────────────┘
            ↓
   ┌─────────────────────┐
   │ 5. check             │  执行 setImmediate 回调
   └─────────────────────┘
            ↓
   ┌─────────────────────┐
   │ 6. close callbacks   │  执行 close 事件回调（socket.on('close')）
   └─────────────────────┘
            ↓
       （回到 timers，下一轮）
\`\`\`

## 二、六个阶段详解

### 1. timers 阶段

这个阶段检查所有\`setTimeout\`和\`setInterval\`注册的回调，把**到期的**拿出来执行。

注意：\`setTimeout(fn, 100)\`的 fn 不一定在第 100ms 精确执行。因为 timers 阶段是在每轮循环开始时检查，如果上一轮 poll 阶段耗时较长，fn 可能会晚一些。这就是为什么 Node.js 文档说"setTimeout 的延迟是**最小值**，不是精确值"。

### 2. pending callbacks 阶段

执行一些**系统级回调**，比如：
- TCP 连接失败时的 \`ECONNREFUSED\` 错误回调
- socket 收到 EAGAIN 等错误时的回调

这些不是你日常主动写的代码，是操作系统层面的错误回调。日常开发基本不用关心这个阶段。

### 3. idle, prepare 阶段

这两个阶段是 Node.js **内部使用**的，用来做一些准备工作。开发者写的代码不会在这里执行，可以忽略。

### 4. poll 阶段（最重要的阶段）

这是事件循环的**核心阶段**。做两件事：

1. **获取新的 IO 事件**：检查有没有文件描述符可读/可写，有的话拿出来
2. **执行 IO 相关回调**：把完成的 IO 事件的回调执行掉

你在代码里写的 \`fs.readFile\` 的回调、\`http.get\` 的回调、\`socket.on('data')\` 的回调，都是在这个阶段执行的。

**poll 阶段的特殊行为：**

- 如果 poll 队列**不为空**：依次执行队列里的所有回调
- 如果 poll 队列**为空**：
  - 如果有 \`setImmediate\` 回调（check 阶段有任务）：poll 不等待，直接进入 check 阶段
  - 如果有到期的定时器：回到 timers 阶段
  - 都没有：poll 会**阻塞等待**，直到有 IO 事件到来（这样进程就不会空转浪费 CPU）

### 5. check 阶段

执行 \`setImmediate\` 注册的回调。

\`setImmediate\` 是 Node.js 特有的（浏览器没有），它的回调在 check 阶段执行，**在 poll 阶段之后**。

### 6. close callbacks 阶段

执行 close 事件的回调，比如：
- \`socket.on('close', ...)\`
- \`server.on('close', ...)\`
- \`stream.on('close', ...)\`

当一个连接或资源被关闭时，close 回调会在这里执行。

## 三、每轮循环的执行顺序

\`\`\`
timers → pending → idle/prepare → poll → check → close → （下一轮 timers）
\`\`\`

注意：**process.nextTick 不在这 6 个阶段里**。它有自己的队列，在**每个阶段切换之间**执行。也就是说，从一个阶段切到下一个阶段之前，Node.js 会先把所有 nextTick 回调执行完，再进入下一个阶段。

\`\`\`
timers → [nextTick 队列] → pending → [nextTick 队列] → poll → [nextTick] → check → ...
\`\`\`

所以 \`process.nextTick\` 的优先级**比 Promise 还高**，比 \`setImmediate\` 和 \`setTimeout\` 都高。

## 四、setTimeout(fn, 0) vs setImmediate(fn)：谁先？

这是经典面试题。答案是：**取决于上下文**。

### 在主模块（顶层代码）里：顺序不确定

\`\`\`javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
\`\`\`

在主模块里，这两个谁先谁后**不确定**。因为执行到这行时，事件循环还没完全启动，timers 阶段的检查时机取决于进程启动耗时。多跑几次，你会看到不同的顺序。

### 在 IO 回调里：setImmediate 一定先

\`\`\`javascript
fs.readFile('a.txt', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
\`\`\`

在 IO 回调里，\`setImmediate\` **一定先**执行。因为 IO 回调在 poll 阶段执行，执行完后下一个阶段是 check（setImmediate），然后再回到 timers（setTimeout）。

### 用"工厂流水线"来类比

事件循环是一条**流水线**，产品（回调）在不同**工位**（阶段）被处理：

- timers 工位：处理"定时到点"的产品
- poll 工位：处理"IO 完成"的产品
- check 工位：处理"立即执行"的产品

每个工位只处理属于自己类型的产品。一个产品从流水线起点（timers）进入，经过各个工位，如果这个工位认它，就处理掉；不认就往下传。

\`setTimeout(fn, 0)\` 的产品从 timers 工位进入，\`setImmediate(fn)\` 的产品从 check 工位进入。在 poll 工位（IO 回调里）注册这两个产品时，下一个工位是 check，所以 setImmediate 先被处理。

## 五、日常开发启示

1. **为什么我的 setTimeout(fn, 0) 比预期晚？** 因为它要等到下一轮循环的 timers 阶段才执行，如果当前轮次的其他阶段耗时，就会被推迟。
2. **想"尽快"执行，用 setImmediate 还是 process.nextTick？** \`setImmediate\` 更规范（在 check 阶段），\`process.nextTick\` 太优先了会"插队"太多，可能让事件循环饿死（nextTick 递归会让 IO 回调永远执行不到）。
3. **为什么推荐用 setImmediate 而不是 setTimeout(fn, 0)？** \`setImmediate\` 语义更清晰（"立即"），而且在 IO 回调里顺序确定；\`setTimeout(fn, 0)\` 实际会被 clamp 到 1ms，且顺序不确定。
4. **排查"回调比预期晚执行"的问题：** 想想你的回调在哪个阶段？前面有没有大量回调排队？

## 六、本章 demo 说明

下面 demo 用代码验证事件循环阶段的执行顺序：

1. 在主模块里对比 \`setTimeout(fn, 0)\` 和 \`setImmediate\` 的顺序（不确定）
2. 在 IO 回调里对比两者（setImmediate 一定先）
3. 展示 \`process.nextTick\` 的优先级（最高）
4. 用注释画出事件循环阶段的执行顺序图

跑完你会对"代码执行顺序"有可预测的判断力。`,
    code: `// ============================================
// 第四章 demo：事件循环的六个阶段
// 演示：
//   1. 主模块里 setTimeout(0) vs setImmediate（顺序不确定）
//   2. IO 回调里 setTimeout(0) vs setImmediate（setImmediate 先）
//   3. process.nextTick 的优先级（最高）
//   4. 用注释画出事件循环阶段顺序图
// ============================================

console.log("=".repeat(50));                      // 打印分隔线
console.log("Node.js 运行原理 — 第四章 demo");     // 打印章节标题
console.log("=".repeat(50));                       // 打印分隔线
console.log();                                     // 打印空行

// ===== 先画个事件循环阶段顺序图 =====
console.log("【事件循环六个阶段顺序图】");
console.log("  ┌─────────────────────┐");
console.log("  │ 1. timers            │ ← setTimeout / setInterval");
console.log("  │    ↓ [nextTick 队列]  │ ← process.nextTick 在阶段间执行");
console.log("  │ 2. pending callbacks │ ← 系统级错误回调");
console.log("  │    ↓ [nextTick 队列]  │");
console.log("  │ 3. idle, prepare     │ ← 内部使用");
console.log("  │    ↓ [nextTick 队列]  │");
console.log("  │ 4. poll              │ ← IO 回调（最重要）");
console.log("  │    ↓ [nextTick 队列]  │");
console.log("  │ 5. check             │ ← setImmediate");
console.log("  │    ↓ [nextTick 队列]  │");
console.log("  │ 6. close callbacks   │ ← socket.on('close')");
console.log("  └─────────────────────┘");
console.log("        → 回到 timers，下一轮");
console.log();                                     // 打印空行

// ===== 1. 主模块里 setTimeout(0) vs setImmediate =====
console.log("【1. 主模块里：setTimeout(0) vs setImmediate】"); // 打印小节标题
console.log("  顺序不确定（取决于进程启动耗时），多跑几次可能不同：");

// 在主模块顶层注册，顺序不确定
// 因为执行到这里时，事件循环可能还没完全启动
setTimeout(() => {
  console.log("    → setTimeout 触发");
}, 0);

setImmediate(() => {
  console.log("    → setImmediate 触发");
});
console.log("  （上面两个谁先输出，是不确定的）");
console.log();                                     // 打印空行

// ===== 2. IO 回调里 setTimeout(0) vs setImmediate =====
console.log("【2. IO 回调里：setImmediate 一定先于 setTimeout(0)】"); // 打印小节标题

// 用 fs.readFile 模拟 IO 操作
// 在 IO 回调（poll 阶段）里注册 setTimeout 和 setImmediate
const fs = require('fs');                           // 引入 fs 模块

// 读取当前文件本身（保证文件存在）
fs.readFile(__filename, () => {
  // 这里是 poll 阶段执行的 IO 回调
  console.log("  进入 fs.readFile 回调（poll 阶段）：");

  // 在 poll 阶段注册两个回调
  setTimeout(() => {
    console.log("    → setTimeout 触发（下一轮 timers 阶段）");
  }, 0);

  setImmediate(() => {
    console.log("    → setImmediate 触发（当前轮 check 阶段）");
  });

  // 执行顺序：poll 结束 → check（setImmediate）→ 下一轮 timers（setTimeout）
  // 所以 setImmediate 一定先！
});
console.log("  （fs.readFile 是异步的，回调会在后面执行）");
console.log();                                     // 打印空行

// ===== 3. process.nextTick 的优先级 =====
console.log("【3. process.nextTick 优先级最高】"); // 打印小节标题

// process.nextTick 的回调在每个阶段切换之间执行
// 优先级高于 Promise、setTimeout、setImmediate
console.log("  注册 nextTick、Promise、setTimeout、setImmediate：");

// 注册顺序：nextTick → Promise → setTimeout → setImmediate
// 执行顺序：nextTick → Promise（微任务）→ ... → timers/check

process.nextTick(() => {
  console.log("    → process.nextTick 触发（优先级最高，阶段间执行）");
});

Promise.resolve().then(() => {
  console.log("    → Promise.then 触发（微任务，nextTick 之后）");
});

setTimeout(() => {
  console.log("    → setTimeout 触发（timers 阶段）");
}, 0);

setImmediate(() => {
  console.log("    → setImmediate 触发（check 阶段）");
});

console.log("  （主线程代码先执行完，然后才处理异步回调）");
console.log();                                     // 打印空行

// ===== 4. nextTick 递归会"饿死"事件循环 =====
console.log("【4. 警告：nextTick 递归会饿死事件循环】"); // 打印小节标题
console.log("  process.nextTick 太多会让 IO 回调永远执行不到：");
console.log("  示例（不实际跑，只演示原理）：");
console.log("    function recursiveTick() {");
console.log("      process.nextTick(recursiveTick);  // 一直插队");
console.log("    }");
console.log("    recursiveTick();");
console.log("    setTimeout(() => console.log('永远跑不到'), 0);");
console.log("  → nextTick 队列清不完，事件循环进不到 timers 阶段");
console.log();                                     // 打印空行

// ===== 5. 总结对比表 =====
console.log("【5. 四种异步方式对比】");
console.log("  ┌──────────────────┬───────────────┬────────────────────┐");
console.log("  │ 方式              │ 执行阶段       │ 优先级             │");
console.log("  ├──────────────────┼───────────────┼────────────────────┤");
console.log("  │ process.nextTick  │ 阶段之间       │ 最高（会插队）       │");
console.log("  │ Promise.then      │ 微任务队列     │ 高（nextTick 之后）  │");
console.log("  │ setImmediate      │ check 阶段    │ 中                 │");
console.log("  │ setTimeout(fn, 0) │ timers 阶段   │ 低（可能被 clamp 1ms）│");
console.log("  └──────────────────┴───────────────┴────────────────────┘");
console.log();
console.log("=".repeat(50));
console.log("总结：理解事件循环阶段，你就能预测代码执行顺序");
console.log("  - timers：定时器回调");
console.log("  - poll：IO 回调（最重要）");
console.log("  - check：setImmediate 回调");
console.log("  - nextTick：阶段间执行，优先级最高");
console.log("=".repeat(50));`
  }
];
