// =============================================================
// Node.js 交互式教程 —— 第三批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. process   — Process 进程对象
//   2. eventloop — 定时器与事件循环
//   3. async     — 异步编程
//   4. util      — Util 工具模块
//   5. errors    — 错误处理
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
//   - console 仅支持: log, info, warn, error, debug, table, dir, trace
//   - process 是 EventEmitter 的实例，支持 on/emit，process.exit() 会
//     抛出特殊错误终止执行，process.argv 在沙箱中为 ["node","sandbox.js"]
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Process 进程对象
  // =========================================================
  {
    id: "process",
    title: "Process 进程对象",
    icon: "⚙️",
    group: "异步编程",
    content: `## Process 进程对象

\`process\` 是 Node.js 中最重要的全局对象之一。它代表当前 Node.js 进程，提供了与操作系统交互的桥梁——获取进程信息、读写标准流、管理环境变量、监听退出事件、处理信号等等。你不需要 \`require\` 它，它在任何文件中都可以直接使用。

### process 对象概述

\`process\` 是一个**全局对象**（Global Object），意味着你在任何模块中都可以直接访问它，无需 \`require('process')\`（虽然 Node.js 也允许你这样写）。它本质上是 \`EventEmitter\` 的实例，因此你可以用 \`process.on(event, callback)\` 来监听各种进程级事件。

\`\`\`
process 对象的核心能力图谱：

  ┌─────────────────────────────────────────────┐
  │                process 对象                   │
  ├──────────┬──────────┬──────────┬─────────────┤
  │ 进程信息  │ 标准流   │ 环境变量  │  事件与信号  │
  │ version  │ stdin    │ env      │ exit        │
  │ platform │ stdout   │ NODE_ENV │ beforeExit  │
  │ arch     │ stderr   │          │ SIGINT      │
  │ pid      │          │          │ SIGTERM     │
  │ argv     │          │          │ uncaughtEx  │
  └──────────┴──────────┴──────────┴─────────────┘
  ┌──────────┬──────────┬──────────┐
  │ 资源监控  │ 工作目录  │ 异步控制  │
  │ memoryU  │ cwd()    │ nextTick  │
  │ cpuUsage │ chdir()  │           │
  │ uptime() │          │           │
  └──────────┴──────────┴──────────┘
\`\`\`

### 进程信息属性详解

\`process\` 提供了大量只读属性来描述当前进程的状态：

| 属性 | 类型 | 说明 | 示例值 |
| --- | --- | --- | --- |
| \`version\` | string | Node.js 版本号 | \`"v20.10.0"\` |
| \`versions\` | object | 各依赖版本（V8、zlib、openssl 等） | \`{ v8: "...", zlib: "..." }\` |
| \`platform\` | string | 操作系统平台 | \`"darwin"\` / \`"win32"\` / \`"linux"\` |
| \`arch\` | string | CPU 架构 | \`"x64"\` / \`"arm64"\` |
| \`pid\` | number | 当前进程 ID | \`12345\` |
| \`ppid\` | number | 父进程 ID | \`12340\` |
| \`title\` | string | 进程名（可改，影响 ps 命令显示） | \`"node"\` |
| \`argv\` | string[] | 命令行参数数组 | \`["node", "app.js", "--port", "3000"]\` |
| \`execPath\` | string | Node 可执行文件的绝对路径 | \`"/usr/local/bin/node"\` |
| \`execArgv\` | string[] | Node 启动参数（--inspect 等） | \`["--inspect"]\` |
| \`argv0\` | string | 启动命令的第一个参数（只读） | \`"node"\` |

#### platform vs arch

\`platform\` 表示操作系统类型，\`arch\` 表示 CPU 架构。它们是独立的：

| platform | 含义 | arch | 含义 |
| --- | --- | --- | --- |
| \`darwin\` | macOS | \`x64\` | 64 位 Intel |
| \`win32\` | Windows | \`arm64\` | ARM 64 位 |
| \`linux\` | Linux | \`ia32\` | 32 位 |
| \`freebsd\` | FreeBSD | \`arm\` | ARM 32 位 |

> 注意：Windows 在 64 位系统上 \`platform\` 也是 \`"win32"\`，这不是 bug，而是历史兼容。

#### pid 与 ppid

每个进程都有唯一的进程 ID（PID）。\`pid\` 是当前进程的 ID，\`ppid\` 是父进程的 ID。比如你在终端运行 \`node app.js\`，那么 \`app.js\` 的 \`ppid\` 就是终端（shell）的 PID。

\`\`\`javascript
console.log(process.pid);  // 比如 12345
console.log(process.ppid); // 比如 12340（终端 shell）
\`\`\`

> 在本教程的沙箱中，\`pid\` 和 \`ppid\` 来自宿主进程（Next.js 服务器），不是你自己的进程。

#### process.versions 的内容

\`process.versions\` 包含了 Node.js 所有核心组件的版本信息：

\`\`\`javascript
{
  node: "20.10.0",      // Node.js 版本
  v8: "11.3.244.8",     // V8 引擎版本（决定 JS 特性支持）
  uv: "1.46.0",         // libuv 版本（事件循环库）
  zlib: "1.3.0",        // zlib 版本（压缩）
  openssl: "3.1.4",     // OpenSSL 版本（TLS/加密）
  modules: "115",       // 模块系统版本
  ...
}
\`\`\`

### 环境变量：process.env

\`process.env\` 是一个对象，包含所有环境变量。环境变量是操作系统级别的配置，常用于：

1. **区分环境**：\`NODE_ENV=production\` / \`development\`
2. **配置端口**：\`PORT=3000\`
3. **密钥管理**：\`DATABASE_URL\`、\`JWT_SECRET\`（不要硬编码在代码里！）
4. **路径配置**：\`PATH\`、\`HOME\`

\`\`\`javascript
// 读取环境变量
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// 设置环境变量（仅当前进程有效）
process.env.MY_VAR = "hello";
console.log(process.env.MY_VAR); // "hello"

// 删除环境变量
delete process.env.MY_VAR;
\`\`\`

#### NODE_ENV 的重要性

\`NODE_ENV\` 是 Node.js 生态中最重要的环境变量之一。许多框架会根据它来优化行为：

| NODE_ENV | 含义 | 影响 |
| --- | --- | --- |
| \`production\` | 生产环境 | Express 缓存视图、关闭详细日志、错误信息精简 |
| \`development\` | 开发环境 | 启用热重载、详细日志、错误堆栈完整 |
| \`test\` | 测试环境 | 测试框架使用、禁用日志输出 |
| 不设置 | 默认 | 性能最差（Express 不会缓存！） |

> ⚠️ **关键陷阱**：Express 在 \`NODE_ENV\` 未设置时性能比 \`production\` 差 **3 倍**以上！生产环境一定要设置 \`NODE_ENV=production\`。

#### 环境变量的类型问题

\`process.env\` 的所有值都是**字符串**（或 undefined），即使你写了数字：

\`\`\`javascript
process.env.COUNT = 5;
typeof process.env.COUNT; // "string"，不是 "number"！
process.env.COUNT === 5;  // false
process.env.COUNT === "5"; // true
\`\`\`

> 转换技巧：\`Number(process.env.COUNT)\` 或 \`parseInt(process.env.COUNT, 10)\`。

### 标准流：stdin / stdout / stderr

\`process\` 提供了三个标准流：

| 流 | 方向 | 类型 | 用途 |
| --- | --- | --- | --- |
| \`process.stdin\` | 输入 | 可读流 | 读取用户输入 |
| \`process.stdout\` | 输出 | 可写流 | 正常输出（\`console.log\` 封装了它） |
| \`process.stderr\` | 错误输出 | 可写流 | 错误输出（\`console.error\` 封装了它） |

\`\`\`javascript
// console.log 的本质
console.log("hello");
// 等价于
process.stdout.write("hello\\n");

// console.error 输出到 stderr
console.error("出错了");
// 等价于
process.stderr.write("出错了\\n");
\`\`\`

#### stdout vs stderr 的区别

- \`stdout\` 用于**正常输出**，可以被重定向到文件：\`node app.js > output.txt\`
- \`stderr\` 用于**错误和警告**，不会被 \`>\` 重定向：\`node app.js > output.txt 2> error.txt\`

\`\`\`bash
# 只重定向正常输出
node app.js > log.txt

# 分别重定向 stdout 和 stderr
node app.js > log.txt 2> err.txt

# 合并重定向
node app.js > all.txt 2>&1
\`\`\`

> 在本教程沙箱中，\`stdout.write\` 和 \`stderr.write\` 的输出都会被收集到控制台显示。

### 工作目录：cwd() 与 chdir()

\`cwd()\` 返回当前工作目录（Current Working Directory），\`chdir()\` 可以改变它：

\`\`\`javascript
console.log(process.cwd()); // 比如 "/Users/me/project"

// 改变工作目录
process.chdir("/tmp");
console.log(process.cwd()); // "/tmp"
\`\`\`

> **注意**：\`cwd()\` 是进程级的状态，\`chdir()\` 会影响整个进程的所有模块。\`__dirname\` 是文件级的，不受 \`chdir\` 影响。

\`\`\`javascript
// 假设文件位于 /Users/me/project/src/app.js
console.log(process.cwd());  // 取决于在哪里运行 node
console.log(__dirname);      // 永远是 /Users/me/project/src
\`\`\`

### 退出相关

#### process.exit([code])

\`process.exit()\` 强制终止进程。\`code\` 是退出码：

| 退出码 | 含义 |
| --- | --- |
| \`0\` 或不传 | 正常退出 |
| 非 0 | 异常退出（shell 中 \`$?\` 可获取） |

\`\`\`javascript
// 正常退出
process.exit(0);

// 异常退出（表示出错）
process.exit(1);
\`\`\`

> 在本教程沙箱中，\`process.exit()\` 会抛出一个特殊错误来终止代码执行。所以不要在演示代码中随意调用它，否则后面的代码不会执行。

#### process.exitCode

\`exitCode\` 是一个更优雅的退出方式——设置退出码但不立即退出，让事件循环自然结束：

\`\`\`javascript
// 推荐方式：设置退出码，不强制退出
process.exitCode = 1;
// 后面的代码仍会执行，进程会在事件循环清空后自然退出
\`\`\`

> \`exitCode\` 比 \`exit()\` 更安全，因为它允许未完成的异步操作（如日志写入）完成。

#### beforeExit 事件

\`beforeExit\` 在进程即将退出时触发（事件循环为空时）。你可以在这里安排异步工作，进程会等待：

\`\`\`javascript
process.on("beforeExit", (code) => {
  console.log("即将退出，退出码:", code);
  // 可以在这里安排最后的异步任务
});
\`\`\`

> ⚠️ \`beforeExit\` 不会因为 \`process.exit()\` 或未捕获异常而触发。它是"自然退出"时才触发的。

#### exit 事件

\`exit\` 在进程确实要退出时触发。**此时事件循环已经停止**，只能执行同步操作：

\`\`\`javascript
process.on("exit", (code) => {
  // 只能做同步操作！
  console.log("进程退出，退出码:", code);
  // 以下异步操作不会执行：
  // setTimeout(() => {}, 0); // 不会执行！
});
\`\`\`

#### beforeExit vs exit 的区别

| 特性 | \`beforeExit\` | \`exit\` |
| --- | --- | --- |
| 触发时机 | 事件循环为空，即将退出 | 确实要退出 |
| 能否执行异步 | ✅ 可以，会延迟退出 | ❌ 只能同步 |
| \`process.exit()\` 触发 | ❌ 不触发 | ✅ 触发 |
| 未捕获异常触发 | ❌ 不触发 | ❌ 不触发 |
| 可触发次数 | 可能多次（安排新任务后） | 只一次 |

### 信号处理

POSIX 系统中，进程可以接收各种信号。Node.js 通过 \`process.on(signal, callback)\` 来处理：

| 信号 | 含义 | 触发方式 |
| --- | --- | --- |
| \`SIGINT\` | 中断信号 | Ctrl + C |
| \`SIGTERM\` | 终止信号 | \`kill PID\` 命令 |
| \`SIGHUP\` | 挂起信号 | 终端关闭 |
| \`SIGUSR1\` / \`SIGUSR2\` | 用户自定义信号 | 调试器使用 |

\`\`\`javascript
// 捕获 Ctrl+C，优雅退出
process.on("SIGINT", () => {
  console.log("\\n收到 Ctrl+C，正在清理...");
  // 做清理工作（关闭数据库连接、保存数据等）
  cleanup().then(() => {
    process.exit(0);
  });
});
\`\`\`

> ⚠️ **重要**：注册了 \`SIGINT\` / \`SIGTERM\` 监听器后，Node.js **不会自动退出**，你必须手动调用 \`process.exit()\`，否则进程会一直运行。

#### Windows 上的信号

Windows 不完全支持 POSIX 信号：
- \`SIGINT\` 可以通过 Ctrl+C 触发
- \`SIGTERM\` 可以被监听但不能被真正发送（kill 命令在 Windows 上行为不同）
- \`SIGHUP\` 在 Windows 上几乎不触发

> 写跨平台代码时，用 \`process.platform\` 判断系统来处理信号差异。

### 未捕获异常

#### uncaughtException

当同步代码或异步回调中抛出异常且没有被 try/catch 捕获时，触发 \`uncaughtException\`：

\`\`\`javascript
process.on("uncaughtException", (err, origin) => {
  console.error("未捕获异常:", err.message);
  console.error("来源:", origin);
  // 记录日志后应该退出，因为应用可能处于不稳定状态
  process.exit(1);
});
\`\`\`

> ⚠️ **最佳实践**：\`uncaughtException\` 触发后，应用可能处于不可预测的状态（资源泄漏、数据不一致）。正确做法是**记录日志后退出**，由进程管理器（PM2、Docker）重启进程。不要试图继续运行。

#### unhandledRejection

当 Promise 被 reject 但没有 \`.catch()\` 时，触发 \`unhandledRejection\`：

\`\`\`javascript
process.on("unhandledRejection", (reason, promise) => {
  console.error("未处理的 Promise 拒绝:", reason);
  // Node.js 未来版本会直接退出进程
});
\`\`\`

> 从 Node.js v15 起，未处理的 Promise 拒绝**默认会导致进程退出**。你应该总是用 \`.catch()\` 或 \`try/await/catch\` 来处理错误。

### 警告：warning 事件

Node.js 会产生各种警告（如废弃 API、性能提示、内存泄漏警告）。你可以监听 \`warning\` 事件：

\`\`\`javascript
process.on("warning", (warning) => {
  console.log(warning.name);    // 警告类型
  console.log(warning.message); // 警告信息
  console.log(warning.stack);   // 堆栈
});
\`\`\`

#### --trace-warnings 标志

运行 \`node --trace-warnings app.js\` 可以在警告输出中包含完整堆栈，帮你定位警告来源：

\`\`\`bash
node --trace-warnings app.js
node --trace-deprecation app.js    # 只看废弃警告
node --no-warnings app.js          # 关闭所有警告
\`\`\`

### 资源监控

#### process.memoryUsage()

返回内存使用情况：

\`\`\`javascript
const m = process.memoryUsage();
// {
//   rss: 35553280,        // 常驻集大小（Resident Set Size），进程占用的物理内存
//   heapTotal: 7335936,   // V8 堆总大小（已申请）
//   heapUsed: 5222576,    // V8 堆实际使用
//   external: 965207,     // V8 管理的 C++ 对象内存（如 Buffer）
//   arrayBuffers: 10560   // ArrayBuffer 占用的内存
// }
\`\`\`

| 字段 | 含义 | 何时关注 |
| --- | --- | --- |
| \`rss\` | 物理内存占用 | 内存泄漏排查 |
| \`heapTotal\` | V8 堆总量 | 内存不足 |
| \`heapUsed\` | V8 堆已用 | 实际 JS 对象内存 |
| \`external\` | C++ 对象内存 | Buffer/Stream 使用多时 |
| \`arrayBuffers\` | ArrayBuffer 内存 | 处理二进制数据时 |

#### process.cpuUsage()

返回 CPU 使用时间（微秒）：

\`\`\`javascript
const start = process.cpuUsage();
// ... 执行一些代码
const end = process.cpuUsage(start);
// { user: 50000, system: 10000 }  // user=用户态, system=内核态（微秒）
\`\`\`

#### process.uptime()

返回进程运行时长（秒）：

\`\`\`javascript
console.log(process.uptime()); // 比如 3.523（秒）
\`\`\`

### process.nextTick 详解

\`process.nextTick(callback)\` 是 Node.js 中**优先级最高**的异步调度方式。它把回调放入 \`nextTick 队列\`，在**当前同步操作完成后、事件循环继续之前**执行。

\`\`\`javascript
console.log("1. 同步开始");
process.nextTick(() => {
  console.log("3. nextTick 回调");
});
console.log("2. 同步结束");
// 输出：1 → 2 → 3
\`\`\`

#### nextTick vs Promise.then vs setImmediate vs setTimeout

| 方法 | 类型 | 执行时机 | 优先级 |
| --- | --- | --- | --- |
| \`process.nextTick\` | 微任务 | 当前操作后，事件循环前 | **最高** |
| \`Promise.then\` | 微任务 | nextTick 队列之后 | 高 |
| \`setImmediate\` | 宏任务 | check 阶段 | 中 |
| \`setTimeout(fn, 0)\` | 宏任务 | timers 阶段 | 中（与 setImmediate 顺序不定） |

\`\`\`javascript
console.log("1. 同步");
process.nextTick(() => console.log("2. nextTick"));
Promise.resolve().then(() => console.log("3. Promise"));
setTimeout(() => console.log("4. setTimeout"));
setImmediate(() => console.log("5. setImmediate"));
console.log("6. 同步");
// 输出：1 → 6 → 2 → 3 → 4/5（4和5顺序不定）
\`\`\`

#### nextTick 的陷阱：饿死 I/O

\`nextTick\` 优先级太高，如果递归调用会**饿死 I/O**（I/O 回调永远没机会执行）：

\`\`\`javascript
// ❌ 危险：递归 nextTick，I/O 回调永远执行不到
function recursiveTick() {
  process.nextTick(recursiveTick);
}
recursiveTick();
// setTimeout(() => console.log("我永远执行不到"), 0);
\`\`\`

> **最佳实践**：除非有特殊需求，优先用 \`setImmediate\` 而非 \`nextTick\`，因为 \`setImmediate\` 不会饿死 I/O。

### process.argv 命令行参数解析

\`process.argv\` 是一个数组，包含命令行参数：

\`\`\`
$ node app.js --port 3000 --debug

process.argv = [
  "/usr/local/bin/node",   // argv[0]: Node 可执行文件路径
  "/path/to/app.js",       // argv[1]: 脚本文件路径
  "--port",                // argv[2]: 第一个用户参数
  "3000",                  // argv[3]: 第二个用户参数
  "--debug"                // argv[4]: 第三个用户参数
]
\`\`\`

#### 解析命令行参数

\`\`\`javascript
// 简单解析
const args = process.argv.slice(2); // 去掉前两个

// 解析 --key=value 或 --key value
function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (arg.includes("=")) {
        const [k, v] = key.split("=");
        result[k] = v;
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        result[key] = argv[++i];
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

const config = parseArgs(process.argv.slice(2));
// { port: "3000", debug: true }
\`\`\`

> 生产环境推荐用 \`util.parseArgs()\`（Node 18.3+ 内置）或 \`commander\`、\`yargs\` 等第三方库。

### 常见陷阱

1. **\`process.env\` 的值都是字符串**：\`process.env.PORT === 3000\` 永远是 \`false\`，需要 \`Number()\` 转换

2. **\`exit\` 事件中不能做异步操作**：事件循环已停止，\`setTimeout\`、\`fs.writeFile\` 都不会执行

3. **\`uncaughtException\` 后不要继续运行**：应用状态可能已损坏，应记录日志后退出

4. **递归 \`nextTick\` 会饿死 I/O**：用 \`setImmediate\` 代替递归 \`nextTick\`

5. **\`NODE_ENV\` 未设置时性能差**：生产环境务必设置 \`NODE_ENV=production\`

6. **\`cwd()\` vs \`__dirname\`**：\`cwd\` 是运行时的工作目录（可变），\`__dirname\` 是文件所在目录（不变）

7. **信号处理不自动退出**：注册了 \`SIGINT\` 监听器后必须手动 \`process.exit()\`

下面这段代码演示了 process 对象的所有核心功能。`,
    code: `// ============================================================
// 第一章代码演示：Process 进程对象全面实战
// ============================================================

// ---- 1. 进程基本信息 ----
console.log("===== 1. 进程基本信息 =====");
// process.version：Node.js 版本号
console.log("Node.js 版本   :", process.version);
// process.platform：操作系统平台
console.log("操作系统平台   :", process.platform);
// process.arch：CPU 架构
console.log("CPU 架构       :", process.arch);
// process.pid：当前进程 ID
console.log("进程 PID       :", process.pid);
// process.ppid：父进程 ID
console.log("父进程 PID     :", process.ppid);
// process.title：进程标题（在 ps 命令中显示）
console.log("进程标题       :", process.title);

// ---- 2. 版本信息详情 ----
console.log("\\n===== 2. 版本信息详情 =====");
// process.versions：包含各核心组件版本
var versions = process.versions;
console.log("Node.js   :", versions.node);
console.log("V8 引擎   :", versions.v8);
console.log("uv (libuv):", versions.uv);
console.log("zlib      :", versions.zlib);
console.log("openssl   :", versions.openssl);
console.log("modules   :", versions.modules);

// ---- 3. 命令行参数 argv ----
console.log("\\n===== 3. 命令行参数 argv =====");
// process.argv 是一个数组：
//   argv[0] = node 可执行文件路径
//   argv[1] = 执行的脚本路径
//   argv[2+] = 用户传入的参数
// 沙箱中 process.argv = ["node", "sandbox.js"]
console.log("完整 argv:", JSON.stringify(process.argv));
console.log("argv[0] (node 路径):", process.argv[0]);
console.log("argv[1] (脚本路径):", process.argv[1]);
var userArgs = process.argv.slice(2); // 用户参数
console.log("用户参数:", userArgs.length > 0 ? userArgs : "(无)");

// 命令行参数解析实战
function parseArgs(argv) {
  var result = {};
  for (var i = 0; i < argv.length; i++) {
    var arg = argv[i];
    if (arg.indexOf("--") === 0) {
      var key = arg.slice(2);
      var eqIdx = arg.indexOf("=");
      if (eqIdx > -1) {
        // --key=value 形式
        result[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else if (i + 1 < argv.length && argv[i + 1].indexOf("--") !== 0) {
        // --key value 形式
        result[key] = argv[++i];
      } else {
        // --flag 形式（布尔标志）
        result[key] = true;
      }
    }
  }
  return result;
}

// 模拟解析命令行参数
var mockArgv = ["--port", "3000", "--debug", "--name=myapp"];
var config = parseArgs(mockArgv);
console.log("模拟解析结果:", JSON.stringify(config));

// ---- 4. 环境变量 ----
console.log("\\n===== 4. 环境变量 =====");
// process.env：环境变量对象
console.log("NODE_ENV :", process.env.NODE_ENV || "(未设置)");
console.log("PATH     :", (process.env.PATH || "").slice(0, 50) + "...");
console.log("HOME     :", process.env.HOME || process.env.USERPROFILE || "(未知)");

// 设置环境变量（仅当前进程有效）
process.env.MY_CUSTOM_VAR = "hello-world";
console.log("MY_CUSTOM_VAR:", process.env.MY_CUSTOM_VAR);

// 注意：env 的值都是字符串
process.env.COUNT = 5;
console.log("COUNT 的类型:", typeof process.env.COUNT, "(注意是字符串!)");
console.log("COUNT === 5 :", process.env.COUNT === 5);
console.log("COUNT === '5':", process.env.COUNT === "5");

// ---- 5. 标准流 ----
console.log("\\n===== 5. 标准流 =====");
// process.stdout：标准输出流（console.log 封装了它）
console.log("用 console.log 输出");
process.stdout.write("用 process.stdout.write 输出（不自动换行）\\n");
process.stdout.write("可以分多次");
process.stdout.write("写入同一行\\n");

// process.stderr：标准错误流（console.error 封装了它）
console.error("用 console.error 输出（到 stderr）");
process.stderr.write("用 process.stderr.write 输出\\n");

console.log("提示: stdout 和 stderr 可以分别重定向:");
console.log("  node app.js > log.txt 2> err.txt");

// ---- 6. 工作目录 ----
console.log("\\n===== 6. 工作目录 =====");
// process.cwd()：当前工作目录
console.log("当前工作目录:", process.cwd());
// __dirname：当前文件所在目录（沙箱中指向工作目录）
console.log("__dirname   :", __dirname);
console.log("两者关系: cwd 可通过 chdir 改变, __dirname 是固定的");

// ---- 7. 内存使用情况 ----
console.log("\\n===== 7. 内存使用 memoryUsage =====");
var mem = process.memoryUsage();
console.log("rss (常驻内存)    :", (mem.rss / 1024 / 1024).toFixed(2), "MB");
console.log("heapTotal (堆总量):", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB");
console.log("heapUsed (堆已用) :", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB");
console.log("external (外部)   :", (mem.external / 1024 / 1024).toFixed(2), "MB");
if (mem.arrayBuffers !== undefined) {
  console.log("arrayBuffers      :", (mem.arrayBuffers / 1024).toFixed(2), "KB");
}

// ---- 8. CPU 使用时间 ----
console.log("\\n===== 8. CPU 使用 cpuUsage =====");
// cpuUsage 返回 { user, system }，单位微秒
var cpuStart = process.cpuUsage();
// 执行一些计算
var sum = 0;
for (var i = 0; i < 1000000; i++) {
  sum += i;
}
var cpuEnd = process.cpuUsage(cpuStart);
console.log("计算 100万次累加的 CPU 使用:");
console.log("  用户态:", cpuEnd.user, "微秒 (" + (cpuEnd.user / 1000).toFixed(2) + "ms)");
console.log("  内核态:", cpuEnd.system, "微秒 (" + (cpuEnd.system / 1000).toFixed(2) + "ms)");

// ---- 9. 进程运行时长 ----
console.log("\\n===== 9. 进程运行时长 uptime =====");
console.log("进程已运行:", process.uptime().toFixed(4), "秒");

// ---- 10. process.nextTick：微任务调度 ----
console.log("\\n===== 10. process.nextTick 微任务 =====");
console.log("1. 同步代码开始");
// nextTick 回调在当前同步代码执行完后、事件循环继续前执行
process.nextTick(function () {
  console.log("3. nextTick 回调（在同步代码之后执行）");
});
console.log("2. 同步代码结束");
// 输出顺序: 1 → 2 → 3

// ---- 11. nextTick vs Promise vs setImmediate vs setTimeout ----
console.log("\\n===== 11. 异步调度顺序对比 =====");
console.log("--- 开始 ---");

// setTimeout 和 setImmediate 在主模块中顺序不确定
// 但 nextTick 和 Promise 总是先于它们
setTimeout(function () {
  console.log("  [4] setTimeout (timers 阶段)");
}, 0);

setImmediate(function () {
  console.log("  [5] setImmediate (check 阶段)");
});

process.nextTick(function () {
  console.log("  [2] nextTick (最高优先级微任务)");
});

Promise.resolve().then(function () {
  console.log("  [3] Promise.then (微任务，在 nextTick 之后)");
});

console.log("--- 同步代码结束 ---");
// 输出顺序: 开始 → 同步结束 → nextTick → Promise → setTimeout/setImmediate

// ---- 12. process.on('exit')：注册退出回调 ----
console.log("\\n===== 12. exit 事件（退出时触发）=====");
// exit 事件在进程退出时触发，此时只能执行同步操作
process.on("exit", function (code) {
  // 这里只能做同步操作！
  // setTimeout / fs.writeFile 等异步操作不会执行
  console.log("\\n[exit 事件] 进程即将退出");
  console.log("[exit 事件] 退出码:", code);
  console.log("[exit 事件] 可以在这里做同步清理（如写日志到文件）");
});

// 可以注册多个 exit 监听器
process.on("exit", function () {
  console.log("[exit 事件] 第二个 exit 监听器也会执行");
});

console.log("已注册 exit 事件监听器（进程结束时会看到输出）");

// ---- 13. process.on('warning')：监听警告 ----
console.log("\\n===== 13. warning 事件 =====");
process.on("warning", function (warning) {
  console.log("[警告] 类型:", warning.name);
  console.log("[警告] 信息:", warning.message);
});
console.log("已注册 warning 监听器");
console.log("提示: 用 node --trace-warnings 可查看警告完整堆栈");

// ---- 14. beforeExit 事件说明 ----
console.log("\\n===== 14. beforeExit 事件说明 =====");
console.log("beforeExit: 事件循环为空时触发，可以安排异步任务");
console.log("exit: 进程确实退出时触发，只能同步");
console.log("区别: beforeExit 不因 process.exit() 触发, exit 会");

// ---- 15. 信号处理说明 ----
console.log("\\n===== 15. 信号处理 =====");
console.log("常见信号:");
console.log("  SIGINT  - Ctrl+C 中断信号");
console.log("  SIGTERM - 终止信号 (kill 命令)");
console.log("  SIGHUP  - 终端关闭信号");
console.log("");
console.log("优雅退出示例代码:");
console.log("  process.on('SIGINT', () => {");
console.log("    console.log('收到 Ctrl+C, 清理中...');");
console.log("    cleanup().then(() => process.exit(0));");
console.log("  });");

// ---- 16. 全局错误处理说明 ----
console.log("\\n===== 16. 全局错误处理 =====");
console.log("uncaughtException: 捕获未处理的同步异常");
console.log("  process.on('uncaughtException', (err) => {");
console.log("    console.error('未捕获异常:', err.message);");
console.log("    process.exit(1); // 记录后退出");
console.log("  });");
console.log("");
console.log("unhandledRejection: 捕获未处理的 Promise 拒绝");
console.log("  process.on('unhandledRejection', (reason) => {");
console.log("    console.error('未处理拒绝:', reason);");
console.log("  });");

// ---- 17. 综合实战：简易命令行工具 ----
console.log("\\n===== 17. 综合实战：环境检测 =====");
function getEnvironment() {
  var env = process.env.NODE_ENV || "development";
  return {
    env: env,
    isDev: env === "development",
    isProd: env === "production",
    isTest: env === "test",
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    uptime: process.uptime(),
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
  };
}

var envInfo = getEnvironment();
console.log("环境检测结果:");
Object.keys(envInfo).forEach(function (key) {
  var val = envInfo[key];
  var display = typeof val === "number" ? val + (key === "memory" ? " MB" : key === "uptime" ? " 秒" : "") : val;
  console.log("  " + key.padEnd(12) + ":", display);
});

console.log("\\n===== Process 模块演示结束 =====");
console.log("提示: process 是全局对象, 无需 require");
console.log("提示: 生产环境一定要设置 NODE_ENV=production");
console.log("提示: exit 事件中只能做同步操作!");`,
  },

  // =========================================================
  // 第二章：定时器与事件循环
  // =========================================================
  {
    id: "eventloop",
    title: "定时器与事件循环",
    icon: "🔄",
    group: "异步编程",
    content: `## 定时器与事件循环

事件循环（Event Loop）是 Node.js 的**心脏**。它让单线程的 Node.js 能够高效处理数以万计的并发连接，是理解 Node.js 异步非阻塞 I/O 的关键。本章将深入剖析事件循环的工作原理。

### 为什么需要事件循环？

#### 单线程的困境

JavaScript 是单线程的——同一时刻只能执行一段代码。如果所有操作都同步执行，一个耗时操作（如读取大文件）会**阻塞**整个进程，后续的所有请求都得等待。

\`\`\`javascript
// ❌ 同步阻塞：读取文件期间，整个进程卡住
const data = fs.readFileSync("huge.log"); // 耗时 2 秒
console.log("文件读取完成");
// 这 2 秒内，其他所有请求都被阻塞！
\`\`\`

#### 事件循环的解决方案

事件循环让 Node.js 在等待 I/O 时**不阻塞**，而是继续处理其他任务：

\`\`\`
  同步代码             I/O 操作（交给系统）
  ┌──────┐            ┌──────────┐
  │ 代码1 │ ──请求I/O──→│ 系统处理   │
  │ 代码2 │            │ (不阻塞)   │
  │ 代码3 │←──I/O完成───│ 回调通知   │
  └──────┘            └──────────┘
       ↑
  事件循环不断检查：
  1. 有没有到期的定时器？
  2. 有没有完成的 I/O？
  3. 有没有 setImmediate？
\`\`\`

\`\`\`javascript
// ✅ 异步非阻塞：读取文件期间可以继续做其他事
fs.readFile("huge.log", (err, data) => {
  console.log("文件读取完成"); // I/O 完成后回调
});
console.log("我先执行，不等文件读完");
// 读取期间可以处理其他请求！
\`\`\`

#### 类比：餐厅服务员

事件循环就像一个餐厅服务员：
- **同步模式**：服务员点完菜后站在厨房等菜做好，再去找下一桌客人（效率极低）
- **异步模式**：服务员点完菜后把订单交给厨房，立刻去服务下一桌客人，菜好了厨房通知他来端菜（高效）

### 事件循环的 6 个阶段

Node.js 事件循环由 libuv 实现，每一轮（tick）包含 6 个阶段：

\`\`\`
  ┌─────────────────────────────────────────────────┐
  │                  事件循环一轮（tick）               │
  │                                                  │
  │  ┌─────────┐  ┌──────────┐  ┌────────────┐      │
  │  │ 1.timers│→│ 2.pending│→│ 3.idle/    │      │
  │  │         │  │ callbacks│  │   prepare  │      │
  │  │ 到期的   │  │ 系统级   │  │ 内部使用    │      │
  │  │ setTimeout│  │ 回调     │  │            │      │
  │  │ setInterval│  │ TCP错误等│  │            │      │
  │  └─────────┘  └──────────┘  └────────────┘      │
  │       ↓                                     ↓    │
  │  ┌─────────┐                       ┌──────────┐  │
  │  │ 4.poll  │ ←─────────────────────│ 5.check  │  │
  │  │         │                       │          │  │
  │  │ 获取新的  │                       │setImmediate│  │
  │  │ I/O事件  │                       │  回调     │  │
  │  │ 执行I/O  │                       │          │  │
  │  │ 回调     │                       └──────────┘  │
  │  └─────────┘                            ↓        │
  │                                  ┌──────────┐    │
  │                                  │ 6.close  │    │
  │                                  │ callbacks│    │
  │                                  │ close事件 │    │
  │                                  └──────────┘    │
  └─────────────────────────────────────────────────┘
\`\`\`

#### 各阶段详解

**1. timers（定时器阶段）**
- 执行到期的 \`setTimeout\` 和 \`setInterval\` 回调
- 检查哪些定时器到了执行时间
- 注意：定时器的执行时间不一定精确（可能被前面的回调延迟）

**2. pending callbacks（待处理回调阶段）**
- 执行上一轮延迟的系统级回调
- 如 TCP 连接错误（\`ECONNREFUSED\`）、DNS 错误等
- 不是用户直接创建的回调

**3. idle, prepare（空闲/准备阶段）**
- libuv 内部使用
- 通常不需要关心

**4. poll（轮询阶段）** ⭐ 最重要的阶段
- 获取新的 I/O 事件（文件读取完成、网络数据到达等）
- 执行 I/O 相关的回调
- 如果没有定时器到期，会在此阶段**阻塞等待**新的 I/O 事件
- 如果有 \`setImmediate\` 待执行，不会阻塞，转入 check 阶段

**5. check（检查阶段）**
- 执行 \`setImmediate\` 注册的回调
- \`setImmediate\` 专门在此阶段执行

**6. close callbacks（关闭回调阶段）**
- 执行关闭事件的回调
- 如 \`socket.on('close', ...)\`、\`fs.on('close', ...)\`

#### 阶段间的微任务检查

**每两个阶段之间**，事件循环会清空两个微任务队列：

1. **nextTick 队列**：\`process.nextTick\` 注册的回调（优先级最高）
2. **microtask 队列**：\`Promise.then\` 注册的回调

\`\`\`
  阶段1 → [清空 nextTick] → [清空 microtask] → 阶段2 → [清空 nextTick] → [清空 microtask] → ...
\`\`\`

### 微任务 vs 宏任务

| 类型 | 方法 | 执行时机 | 优先级 |
| --- | --- | --- | --- |
| **微任务** | \`process.nextTick\` | 每个阶段切换前，最先执行 | 最高 |
| **微任务** | \`Promise.then\` / \`queueMicrotask\` | nextTick 之后 | 高 |
| **宏任务** | \`setTimeout\` / \`setInterval\` | timers 阶段 | 中 |
| **宏任务** | \`setImmediate\` | check 阶段 | 中 |
| **宏任务** | I/O 回调 | poll 阶段 | 中 |

#### 关键规则

1. \`nextTick\` 总是先于 \`Promise.then\` 执行
2. 微任务总是在宏任务之前清空
3. 微任务队列清空后才会进入下一个宏任务阶段
4. 递归 \`nextTick\` 会饿死 I/O（永远进不了下一个阶段）

### 执行顺序完整图解

\`\`\`
  console.log("1");                        // 同步
  
  setTimeout(() => console.log("6"));      // → timers 阶段
  setImmediate(() => console.log("7"));    // → check 阶段
  Promise.resolve().then(() => console.log("3")); // → microtask
  process.nextTick(() => console.log("2"));      // → nextTick
  
  console.log("4");                        // 同步
  
  执行顺序:
  ┌──────────────────────────────────────────┐
  │ 同步代码:     1 → 4                      │
  │ nextTick:     2                          │ ← 当前操作后立即执行
  │ microtask:    3                          │ ← nextTick 后执行
  │ ─── 事件循环开始 ───                      │
  │ timers:       6 (setTimeout)             │
  │ ─── 阶段切换 ───                         │
  │ check:        7 (setImmediate)           │
  └──────────────────────────────────────────┘
  最终输出: 1 → 4 → 2 → 3 → 6 → 7
\`\`\`

### setImmediate vs setTimeout 的顺序之谜

在**主模块**中，\`setTimeout(fn, 0)\` 和 \`setImmediate(fn)\` 的执行顺序是**不确定**的：

\`\`\`javascript
// 主模块中，以下两种顺序都可能出现：
setTimeout(() => console.log("timeout"));
setImmediate(() => console.log("immediate"));
// 可能输出 timeout → immediate
// 也可能输出 immediate → timeout
\`\`\`

原因：取决于进程启动到执行这段代码的耗时。如果耗时超过 1ms，\`setTimeout\` 已经到期，会先执行；否则 \`setImmediate\` 先执行。

#### I/O 回调中的确定性

但在 **I/O 回调**中，\`setImmediate\` **一定先于** \`setTimeout\`：

\`\`\`javascript
fs.readFile("file.txt", () => {
  // 在 I/O 回调中
  setTimeout(() => console.log("timeout"));  // 下一轮的 timers
  setImmediate(() => console.log("immediate")); // 当轮的 check
  // 一定输出: immediate → timeout
});
\`\`\`

原因：I/O 回调在 poll 阶段执行，poll 之后就是 check（setImmediate），然后才进入下一轮的 timers（setTimeout）。

\`\`\`
  poll 阶段（I/O 回调）
    ↓
  check 阶段（setImmediate）← 先执行
    ↓
  [微任务清空]
    ↓
  下一轮 timers 阶段（setTimeout）← 后执行
\`\`\`

### poll 阶段的阻塞行为

poll 阶段是事件循环中**最复杂**的阶段。它的行为：

1. 如果有 I/O 事件就绪 → 执行回调
2. 如果没有 I/O 事件：
   - 如果有 \`setImmediate\` → 不阻塞，转入 check 阶段
   - 如果有到期的定时器 → 不阻塞，转入 timers 阶段
   - 否则 → **阻塞等待**新的 I/O 事件（有超时限制）

> 这就是为什么没有定时器和 I/O 时，Node.js 进程会退出——poll 阶段没有东西可等了。

### 定时器对比

| 方法 | 说明 | 执行阶段 | 精确度 |
| --- | --- | --- | --- |
| \`setTimeout(fn, ms)\` | 延迟 ms 后执行一次 | timers | 低（可能延迟） |
| \`setInterval(fn, ms)\` | 每 ms 重复执行 | timers | 低（可能延迟） |
| \`setImmediate(fn)\` | 当前事件循环 check 阶段执行 | check | 中 |
| \`process.nextTick(fn)\` | 当前操作后立即执行 | 微任务 | 高 |

#### setTimeout 的不精确性

\`setTimeout(fn, 1000)\` 不保证刚好 1 秒后执行。实际延迟可能更长：

\`\`\`javascript
console.time("timer");
setTimeout(() => {
  console.timeEnd("timer"); // 可能是 1001ms、1005ms 甚至更久
}, 1000);
\`\`\`

延迟原因：
- 事件循环可能正忙于处理其他回调
- HTML5 规范规定最小延迟 4ms（嵌套超过 5 层时）
- Node.js 中 \`setTimeout(fn, 0)\` 实际延迟 1ms

#### setTimeout vs setInterval 的陷阱

\`setInterval\` 的间隔是从**上次开始执行**算起，不是上次结束：

\`\`\`javascript
// 如果回调执行需要 500ms
setInterval(() => {
  // 执行 500ms 的操作
}, 1000);
// 实际间隔只有 500ms！（1000 - 500 = 500）
\`\`\`

> 更安全的方式是用**递归 setTimeout**：

\`\`\`javascript
function run() {
  // 执行 500ms 的操作
  setTimeout(run, 1000); // 操作完成后才设置下次
}
setTimeout(run, 1000);
// 实际间隔: 1000 + 500 = 1500ms（可预测）
\`\`\`

### 清除函数

每个定时器都有对应的清除函数：

| 注册 | 清除 |
| --- | --- |
| \`setTimeout(fn, ms)\` | \`clearTimeout(timer)\` |
| \`setInterval(fn, ms)\` | \`clearInterval(timer)\` |
| \`setImmediate(fn)\` | \`clearImmediate(immediate)\` |

\`\`\`javascript
const timer = setTimeout(() => {
  console.log("我不会执行");
}, 1000);
clearTimeout(timer); // 取消定时器
\`\`\`

### ref / unref 机制

每个定时器对象都有 \`ref()\` 和 \`unref()\` 方法：

- \`ref()\`（默认）：定时器会保持进程运行
- \`unref()\`：定时器不会保持进程运行（如果它是唯一的任务）

\`\`\`javascript
const timer = setInterval(() => {
  console.log("心跳");
}, 1000);
timer.unref(); // 不因为心跳定时器而阻止进程退出
// 如果没有其他任务，进程会直接退出，不会执行心跳
\`\`\`

> \`unref()\` 常用于心跳检测、日志刷新等"非关键"定时任务，防止它们阻止进程正常退出。

### 常见面试题解析

#### 题目 1：执行顺序

\`\`\`javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
process.nextTick(() => console.log("4"));
console.log("5");
// 答案: 1 → 5 → 4 → 3 → 2
\`\`\`

#### 题目 2：嵌套定时器

\`\`\`javascript
setTimeout(() => {
  console.log("A");
  setTimeout(() => console.log("B"), 0);
  setImmediate(() => console.log("C"));
}, 0);
// A → C → B（在 setTimeout 回调中，setImmediate 一定先于内层 setTimeout）
\`\`\`

#### 题目 3：nextTick 递归

\`\`\`javascript
let count = 0;
function tick() {
  count++;
  if (count < 3) process.nextTick(tick);
  else console.log("done");
}
tick();
setTimeout(() => console.log("timer"), 0);
// done → timer（nextTick 递归会先清空，然后才执行 setTimeout）
\`\`\`

下面这段代码用一系列嵌套的定时器清晰展示了事件循环各阶段的执行顺序。`,
    code: `// ============================================================
// 第二章代码演示：定时器与事件循环执行顺序详解
// ============================================================
// 本代码通过编号输出，让你直观看到事件循环各阶段的执行顺序

// ---- 1. 基本执行顺序：同步 → nextTick → Promise → 宏任务 ----
console.log("===== 1. 基本执行顺序 =====");
console.log("  [1] 同步代码开始");

// nextTick：最高优先级的微任务，在同步代码后立即执行
process.nextTick(function () {
  console.log("  [3] process.nextTick");
});

// Promise.then：微任务，在 nextTick 队列之后执行
Promise.resolve().then(function () {
  console.log("  [4] Promise.then");
});

// setTimeout：宏任务，在 timers 阶段执行
setTimeout(function () {
  console.log("  [5] setTimeout(0)");
}, 0);

// setImmediate：宏任务，在 check 阶段执行
setImmediate(function () {
  console.log("  [6] setImmediate");
});

console.log("  [2] 同步代码结束");
// 输出顺序: 1 → 2 → 3 → 4 → 5/6（5和6顺序不定）

// ---- 2. nextTick vs Promise 的优先级 ----
console.log("\\n===== 2. nextTick vs Promise =====");
console.log("  [A] 同步");

process.nextTick(function () {
  console.log("  [B] nextTick (先执行)");
});

Promise.resolve().then(function () {
  console.log("  [C] Promise (后执行)");
});

process.nextTick(function () {
  console.log("  [D] 第二个 nextTick");
});

Promise.resolve().then(function () {
  console.log("  [E] 第二个 Promise");
});

console.log("  [F] 同步结束");
// 输出: A → F → B → D → C → E（先清空所有 nextTick，再清空所有 Promise）

// ---- 3. 嵌套定时器的执行顺序 ----
console.log("\\n===== 3. 嵌套定时器执行顺序 =====");
setTimeout(function () {
  console.log("  [1] 外层 setTimeout 执行");

  // 在 setTimeout 回调中注册新的定时器
  setTimeout(function () {
    console.log("  [3] 内层 setTimeout");
  }, 0);

  setImmediate(function () {
    console.log("  [2] 内层 setImmediate");
  });

  process.nextTick(function () {
    console.log("  [1.5] 内层 nextTick");
  });

  Promise.resolve().then(function () {
    console.log("  [1.8] 内层 Promise");
  });

  console.log("  [1.x] 外层 setTimeout 同步部分结束");
}, 100);
// 输出: 1 → 1.x → 1.5 → 1.8 → 2 → 3

// ---- 4. I/O 回调中的 setImmediate vs setTimeout ----
console.log("\\n===== 4. I/O 回调中的执行顺序 =====");
// 使用 fs.readFile 模拟 I/O 操作
var fs = require("fs");
fs.readFile(__filename, function () {
  console.log("  [1] I/O 回调执行 (poll 阶段)");

  // 在 I/O 回调中，setImmediate 一定先于 setTimeout 执行
  setTimeout(function () {
    console.log("  [3] I/O 回调中的 setTimeout (下一轮 timers)");
  }, 0);

  setImmediate(function () {
    console.log("  [2] I/O 回调中的 setImmediate (当轮 check)");
  });

  console.log("  [1.x] I/O 回调同步部分结束");
});
// 输出: 1 → 1.x → 2 → 3（在 I/O 回调中 setImmediate 一定先！）

// ---- 5. setInterval vs 递归 setTimeout ----
console.log("\\n===== 5. 递归 setTimeout 模拟间隔 =====");
var tickCount = 0;
function recursiveTimeout() {
  tickCount++;
  console.log("  第 " + tickCount + " 次执行 (递归 setTimeout)");
  if (tickCount < 3) {
    setTimeout(recursiveTimeout, 10);
  } else {
    console.log("  递归 setTimeout 结束");
  }
}
setTimeout(recursiveTimeout, 10);

// ---- 6. 清除定时器 ----
console.log("\\n===== 6. 清除定时器 =====");
var willCancel1 = setTimeout(function () {
  console.log("  这个 setTimeout 不会执行");
}, 1000);

var willCancel2 = setInterval(function () {
  console.log("  这个 setInterval 不会执行");
}, 500);

var willCancel3 = setImmediate(function () {
  console.log("  这个 setImmediate 不会执行");
});

// 清除定时器
clearTimeout(willCancel1);
clearInterval(willCancel2);
clearImmediate(willCancel3);
console.log("  已清除 3 个定时器，它们不会执行");

// ---- 7. ref / unref 说明 ----
console.log("\\n===== 7. ref/unref 机制 =====");
console.log("  ref()  : 定时器保持进程运行（默认）");
console.log("  unref(): 定时器不阻止进程退出");
console.log("  示例:");
console.log("    var timer = setInterval(() => heartbeat(), 1000);");
console.log("    timer.unref(); // 如果没有其他任务，进程会退出");
console.log("");

// 演示 unref：这个定时器不会阻止程序结束
var unrefTimer = setTimeout(function () {
  console.log("  unref 定时器执行了（说明还有其他任务保持进程运行）");
}, 200);
unrefTimer.unref();
console.log("  已创建 unref 定时器（200ms）");

// ---- 8. 微任务在宏任务之间清空 ----
console.log("\\n===== 8. 微任务在阶段间清空 =====");
console.log("  [同步] 开始");

setTimeout(function () {
  console.log("  [timer1] 第一个 setTimeout");
  // 在 timer1 中注册微任务
  Promise.resolve().then(function () {
    console.log("  [micro1] timer1 中的 Promise");
  });
  process.nextTick(function () {
    console.log("  [tick1] timer1 中的 nextTick");
  });
}, 50);

setTimeout(function () {
  console.log("  [timer2] 第二个 setTimeout");
  // timer2 会等 timer1 的微任务全部清空后才执行
}, 50);

console.log("  [同步] 结束");
// 输出: 同步 → timer1 → tick1 → micro1 → timer2

// ---- 9. queueMicrotask 演示 ----
console.log("\\n===== 9. queueMicrotask =====");
console.log("  [1] 同步");
// 沙箱中没有全局 queueMicrotask，用 Promise.resolve().then 模拟（二者同属微任务队列）
var microtask = (typeof queueMicrotask === "function")
  ? queueMicrotask
  : function (cb) { Promise.resolve().then(cb); };
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
// 输出: 1 → 5 → 2 → 3 → 4（nextTick > queueMicrotask = Promise）

// ---- 10. 事件循环阶段总结 ----
console.log("\\n===== 10. 事件循环阶段总结 =====");
console.log("  ┌──────────────────────────────────────┐");
console.log("  │  事件循环一轮 (tick):                  │");
console.log("  │  1. timers    → setTimeout/setInterval │");
console.log("  │  2. pending   → 系统级回调             │");
console.log("  │  3. idle/prep → 内部使用               │");
console.log("  │  4. poll      → I/O 回调（核心阶段）   │");
console.log("  │  5. check     → setImmediate           │");
console.log("  │  6. close     → close 事件回调         │");
console.log("  │  每个阶段间清空: nextTick + microtask  │");
console.log("  └──────────────────────────────────────┘");

console.log("\\n===== 事件循环演示结束 =====");
console.log("关键要点:");
console.log("  1. nextTick 优先级最高，但递归会饿死 I/O");
console.log("  2. Promise.then 在 nextTick 之后执行");
console.log("  3. I/O 回调中 setImmediate 一定先于 setTimeout");
console.log("  4. 主模块中 setTimeout(0) 和 setImmediate 顺序不定");
console.log("  5. setInterval 用递归 setTimeout 替代更安全");`,
  },

  // =========================================================
  // 第三章：异步编程
  // =========================================================
  {
    id: "async",
    title: "异步编程",
    icon: "⚡",
    group: "异步编程",
    content: `## 异步编程

异步编程是 Node.js 的**灵魂**。由于 Node.js 是单线程的，所有 I/O 操作（文件读写、网络请求、数据库查询）都必须异步执行，否则会阻塞整个进程。本章将全面讲解异步编程的演进历程和最佳实践。

### 异步编程的演进

Node.js 异步编程经历了四个阶段：

\`\`\`
  回调函数 (Callback)     → 简单但容易产生回调地狱
      ↓
  Promise                → 解决回调地狱，链式调用
      ↓
  Generator + co         → 同步写法（过渡方案）
      ↓
  async/await            → 终极方案，同步写法 + 原生支持
\`\`\`

| 方案 | 引入时间 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 回调 | Node.js 起源 | 简单直接 | 回调地狱、错误处理麻烦 |
| Promise | ES6 (2015) | 链式调用、错误传播 | 仍有嵌套 |
| Generator | ES6 (2015) | 可暂停执行 | 需要 co 库驱动 |
| async/await | ES2017 | 同步写法、清晰易读 | 需要 Promise 基础 |

### 回调地狱问题

#### 什么是回调地狱？

当多个异步操作有依赖关系时，回调会层层嵌套，形成难以阅读和维护的"金字塔"结构：

\`\`\`javascript
// ❌ 回调地狱：读取三个文件，依次处理
fs.readFile("a.txt", (err, dataA) => {
  if (err) return console.error(err);
  fs.readFile("b.txt", (err, dataB) => {
    if (err) return console.error(err);
    fs.readFile("c.txt", (err, dataC) => {
      if (err) return console.error(err);
      fs.readFile("d.txt", (err, dataD) => {
        if (err) return console.error(err);
        // 终于可以处理所有数据了
        console.log(dataA, dataB, dataC, dataD);
      });
    });
  });
});
// 向右缩进越来越深，难以维护！
\`\`\`

#### 回调地狱的危害

1. **可读性差**：代码向右不断缩进，逻辑难以追踪
2. **错误处理困难**：每一层都要单独处理 err
3. **无法正常 return**：回调中的 return 不会跳出外层函数
4. **难以复用**：逻辑绑定在嵌套结构中，无法提取
5. **调试困难**：调用栈不完整，难以定位问题

### 回调的 error-first 约定

Node.js 所有异步回调都遵循 **error-first**（错误优先）约定：

\`\`\`javascript
// 约定：回调函数的第一个参数是错误对象，第二个是结果
asyncFunction(args, (err, result) => {
  if (err) {
    // 处理错误
    console.error(err);
    return; // 必须返回，否则会继续执行
  }
  // 处理结果
  console.log(result);
});
\`\`\`

#### error-first 规则

1. 回调函数必须是**最后一个参数**
2. 第一个参数是**错误对象**（无错误时为 \`null\`）
3. 第二个参数是**结果数据**
4. 有错误时必须 \`return\`，防止继续执行

\`\`\`javascript
function divide(a, b, callback) {
  // error-first 约定
  if (b === 0) {
    callback(new Error("除数不能为 0"), null); // 第一个参数是错误
  } else {
    callback(null, a / b); // 第一个参数 null 表示无错误
  }
}

divide(10, 0, (err, result) => {
  if (err) {
    console.error("出错:", err.message);
    return;
  }
  console.log("结果:", result);
});
\`\`\`

### Promise 详解

Promise 是异步操作的**最终结果**的占位符。它有三种状态：

\`\`\`
  pending（等待中）
    ↓           ↓
  fulfilled    rejected
  （已成功）   （已失败）
  
  状态变化不可逆：一旦从 pending 变为 fulfilled 或 rejected，就不会再变
\`\`\`

#### 创建 Promise

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  // 异步操作
  if (成功) {
    resolve(result); // 将状态改为 fulfilled
  } else {
    reject(error);   // 将状态改为 rejected
  }
});
\`\`\`

#### then / catch / finally

\`\`\`javascript
promise
  .then((result) => {
    // 状态为 fulfilled 时执行
    console.log("成功:", result);
  })
  .catch((error) => {
    // 状态为 rejected 时执行
    console.error("失败:", error);
  })
  .finally(() => {
    // 无论成功失败都执行（不接收参数）
    console.log("完成");
  });
\`\`\`

#### 链式调用

\`.then()\` 返回一个新的 Promise，可以链式调用：

\`\`\`javascript
Promise.resolve(1)
  .then((n) => n + 1)        // 2
  .then((n) => n * 3)        // 6
  .then((n) => console.log(n)) // 6
  .catch((err) => console.error(err));
\`\`\`

#### then 的返回值规则

\`.then()\` 的返回值决定了下一个 Promise 的状态：

| 返回值 | 下一个 Promise |
| --- | --- |
| 普通值（数字、字符串、对象） | \`fulfilled\`，值为返回值 |
| \`undefined\` | \`fulfilled\`，值为 \`undefined\` |
| 一个 Promise | 等待该 Promise 完成 |
| \`throw error\` | \`rejected\`，错误为抛出的值 |

\`\`\`javascript
Promise.resolve(1)
  .then((n) => Promise.resolve(n + 1)) // 返回 Promise
  .then((n) => n * 2)
  .then((n) => { throw new Error("故意出错"); })
  .catch((err) => console.log(err.message)); // "故意出错"
\`\`\`

#### 错误传播

Promise 链中的错误会**沿链向下传播**，直到遇到 \`.catch()\`：

\`\`\`javascript
Promise.resolve()
  .then(() => { throw new Error("A 出错"); })
  .then(() => console.log("B 不会执行"))
  .then(() => console.log("C 不会执行"))
  .catch((err) => console.log(err.message)); // "A 出错"
\`\`\`

> **最佳实践**：在 Promise 链末尾总是加 \`.catch()\`，防止未处理的 rejection。

#### Promise 静态方法

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| \`Promise.resolve(value)\` | 创建已成功的 Promise | \`fulfilled\` |
| \`Promise.reject(error)\` | 创建已失败的 Promise | \`rejected\` |
| \`Promise.all([p1, p2])\` | 全部成功才成功 | 数组（按顺序） |
| \`Promise.race([p1, p2])\` | 第一个完成（成功或失败） | 第一个结果 |
| \`Promise.allSettled([p1, p2])\` | 全部完成（不管成功失败） | \`[{status, value/reason}]\` |
| \`Promise.any([p1, p2])\` | 第一个成功 | 第一个成功值 |

#### Promise.all：全部成功

\`\`\`javascript
// 并发执行 3 个请求，等全部完成
const [a, b, c] = await Promise.all([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c"),
]);
// 一个失败 → 整体失败（其他成功的结果会被丢弃！）
\`\`\`

> ⚠️ \`Promise.all\` 有**快速失败**特性：任意一个 Promise 失败，整体立即失败，其他 Promise 的结果不会被收集。

#### Promise.allSettled：容错收集

\`\`\`javascript
// 等所有 Promise 完成，不管成功失败
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"),  // 即使这个失败，a 和 c 的结果仍会收集
  fetch("/api/c"),
]);
results.forEach((r) => {
  if (r.status === "fulfilled") {
    console.log("成功:", r.value);
  } else {
    console.log("失败:", r.reason);
  }
});
\`\`\`

#### Promise.race vs Promise.any

| 方法 | 第一个成功 | 第一个失败 |
| --- | --- | --- |
| \`Promise.race\` | 返回成功 | 返回失败 |
| \`Promise.any\` | 返回成功 | **继续等待**（直到有成功或全部失败） |

\`\`\`javascript
// 用 race 实现超时
const result = await Promise.race([
  fetch("/api/slow"),
  new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), 5000)),
]);

// 用 any 获取第一个成功的
const fastest = await Promise.any([
  fetch("https://mirror1.com/data"),
  fetch("https://mirror2.com/data"),
  fetch("https://mirror3.com/data"),
]);
\`\`\`

### async/await 详解

\`async/await\` 是 Promise 的**语法糖**，让异步代码看起来像同步代码。

#### 基本语法

\`\`\`javascript
async function fetchData() {
  // await 等待 Promise 完成，直接获取结果
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

// async 函数总是返回 Promise
fetchData().then((data) => console.log(data));
\`\`\`

#### 错误处理

用 \`try/catch\` 捕获 \`await\` 的错误：

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("请求失败:", error.message);
    return null; // 返回默认值
  }
}
\`\`\`

#### 并发 vs 串行

\`\`\`javascript
// ❌ 串行：一个接一个，总耗时 = a + b + c
const a = await fetch("/api/a"); // 等 2 秒
const b = await fetch("/api/b"); // 等 2 秒
const c = await fetch("/api/c"); // 等 2 秒
// 总耗时 6 秒

// ✅ 并发：同时发起，总耗时 = max(a, b, c)
const [a, b, c] = await Promise.all([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c"),
]);
// 总耗时 2 秒
\`\`\`

> ⚠️ **常见陷阱**：如果你不需要前一个请求的结果来发下一个请求，就应该用 \`Promise.all\` 并发！

#### 顶层 await

在 ES Modules（\`type: "module"\`）中，可以直接在模块顶层使用 \`await\`：

\`\`\`javascript
// config.js (ESM)
export const config = await fetch("/api/config").then((r) => r.json());
// 其他模块 import 这个文件时会等待 fetch 完成
\`\`\`

> CommonJS（\`.js\`）不支持顶层 await。在 CommonJS 中需要用 async IIFE 包裹。

#### 常见陷阱

**1. forEach 中用 await 不生效**

\`\`\`javascript
// ❌ forEach 不会等待 await
const urls = ["/api/a", "/api/b", "/api/c"];
urls.forEach(async (url) => {
  const data = await fetch(url); // 不会等待！
});
console.log("完成"); // 会先执行

// ✅ 用 for...of 代替
for (const url of urls) {
  const data = await fetch(url); // 会等待
}

// ✅ 或用 Promise.all + map
await Promise.all(urls.map((url) => fetch(url)));
\`\`\`

**2. 忘记 await**

\`\`\`javascript
// ❌ 忘记 await，拿到的是 Promise 而不是结果
const data = fetchData(); // data 是 Promise，不是数据
console.log(data); // Promise { <pending> }

// ✅ 加上 await
const data = await fetchData();
console.log(data); // 实际数据
\`\`\`

**3. 串行了本可并发的任务**

\`\`\`javascript
// ❌ 不需要顺序依赖，却用了串行 await
const user = await getUser(userId);
const posts = await getPosts(userId);
const friends = await getFriends(userId);
// 总耗时 = 3 个请求之和

// ✅ 用 Promise.all 并发
const [user, posts, friends] = await Promise.all([
  getUser(userId),
  getPosts(userId),
  getFriends(userId),
]);
// 总耗时 = 最慢的一个
\`\`\`

### 异步流程控制实战

#### 并发限制

当有大量任务需要并发但不想同时发起太多（如爬虫、API 限流）：

\`\`\`javascript
async function asyncPool(limit, items, iteratorFn) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const promise = iteratorFn(item).then((result) => {
      results.push(result);
      executing.delete(promise);
    });
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing); // 等一个完成
    }
  }

  await Promise.all(executing); // 等剩余完成
  return results;
}

// 限制同时最多 3 个并发
await asyncPool(3, urls, (url) => fetch(url));
\`\`\`

#### 超时控制

\`\`\`javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("操作超时")), ms)
  );
  return Promise.race([promise, timeout]);
}

// 5 秒超时
const data = await withTimeout(fetch("/api/slow"), 5000);
\`\`\`

#### 重试机制

\`\`\`javascript
async function retry(fn, times = 3, delay = 1000) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === times - 1) throw error; // 最后一次失败才抛出
      console.log(\`第 \${i + 1} 次失败，\${delay}ms 后重试...\`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

const data = await retry(() => fetch("/api/unstable"), 3, 1000);
\`\`\`

### 常见陷阱总结

1. **forEach 中 await 无效**：用 \`for...of\` 或 \`Promise.all\`
2. **忘记 await**：拿到 Promise 而非结果
3. **不必要的串行**：能并发的用 \`Promise.all\`
4. **Promise.all 快速失败**：需要容错用 \`Promise.allSettled\`
5. **async 函数返回值**：永远返回 Promise，\`return\` 的值会被 \`resolve\`
6. **await 只能在 async 函数中**（除非顶层 await）
7. **错误不处理会变成 unhandledRejection**

下面这段代码演示了回调 → Promise → async/await 的完整演进和流程控制。`,
    code: `// ============================================================
// 第三章代码演示：异步编程全面实战
// ============================================================

// ---- 1. 回调方式（error-first 约定）----
console.log("===== 1. 回调方式 =====");
// 模拟一个异步读取文件的函数（error-first 回调约定）
function fakeReadFileCallback(name, callback) {
  setTimeout(function () {
    if (name === "error") {
      // 第一个参数是错误，第二个是 null
      callback(new Error("文件不存在: " + name), null);
    } else {
      // 第一个参数是 null（无错误），第二个是结果
      callback(null, "[" + name + " 的内容]");
    }
  }, 10);
}

// 使用回调
fakeReadFileCallback("a.txt", function (err, data) {
  if (err) {
    console.error("  出错:", err.message);
    return;
  }
  console.log("  回调结果:", data);
});

// ---- 2. 回调地狱问题演示 ----
console.log("\\n===== 2. 回调地狱（层层嵌套）=====");
// 依次读取 3 个文件（有依赖关系：需要前一个的结果）
fakeReadFileCallback("file1", function (err, data1) {
  if (err) return console.error(err.message);
  fakeReadFileCallback("file2", function (err, data2) {
    if (err) return console.error(err.message);
    fakeReadFileCallback("file3", function (err, data3) {
      if (err) return console.error(err.message);
      // 三层嵌套才拿到所有数据
      console.log("  回调地狱结果:", data1 + " + " + data2 + " + " + data3);
    });
  });
});

// ---- 3. Promise 方式 ----
console.log("\\n===== 3. Promise 方式 =====");
// 把回调函数包装成 Promise
function fakeReadFilePromise(name) {
  return new Promise(function (resolve, reject) {
    fakeReadFileCallback(name, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// 链式调用，解决回调地狱
fakeReadFilePromise("fileA")
  .then(function (data1) {
    console.log("  第一个文件:", data1);
    return fakeReadFilePromise("fileB"); // 返回新 Promise
  })
  .then(function (data2) {
    console.log("  第二个文件:", data2);
    return fakeReadFilePromise("fileC");
  })
  .then(function (data3) {
    console.log("  第三个文件:", data3);
    console.log("  Promise 链式调用完成（无嵌套）");
  })
  .catch(function (err) {
    console.error("  Promise 链出错:", err.message);
  });

// ---- 4. async/await 方式（推荐）----
console.log("\\n===== 4. async/await 方式 =====");
// 用同步写法写异步代码
async function readFilesSequential() {
  try {
    var data1 = await fakeReadFilePromise("doc1");
    console.log("  读取 doc1:", data1);
    var data2 = await fakeReadFilePromise("doc2");
    console.log("  读取 doc2:", data2);
    var data3 = await fakeReadFilePromise("doc3");
    console.log("  读取 doc3:", data3);
    console.log("  async/await 串行完成");
    return [data1, data2, data3];
  } catch (err) {
    console.error("  async 出错:", err.message);
  }
}
readFilesSequential();

// ---- 5. Promise.all 并发执行 ----
console.log("\\n===== 5. Promise.all 并发 =====");
// 对比串行 vs 并发的耗时差异
async function compareSerialVsConcurrent() {
  var start1 = Date.now();
  // 串行：一个接一个（总耗时 = 3 * 10ms）
  var r1 = await fakeReadFilePromise("s1");
  var r2 = await fakeReadFilePromise("s2");
  var r3 = await fakeReadFilePromise("s3");
  var serialTime = Date.now() - start1;
  console.log("  串行结果:", [r1, r2, r3]);
  console.log("  串行耗时:", serialTime + "ms");

  var start2 = Date.now();
  // 并发：同时发起（总耗时 ≈ 10ms，不是 30ms）
  var results = await Promise.all([
    fakeReadFilePromise("c1"),
    fakeReadFilePromise("c2"),
    fakeReadFilePromise("c3"),
  ]);
  var concurrentTime = Date.now() - start2;
  console.log("  并发结果:", results);
  console.log("  并发耗时:", concurrentTime + "ms");
  console.log("  并发比串行快:", serialTime > concurrentTime);
}
compareSerialVsConcurrent();

// ---- 6. Promise.allSettled 容错 ----
console.log("\\n===== 6. Promise.allSettled 容错 =====");
// allSettled：不管成功失败，收集所有结果
Promise.allSettled([
  fakeReadFilePromise("ok1"),
  fakeReadFilePromise("error"), // 这个会失败
  fakeReadFilePromise("ok2"),
]).then(function (results) {
  console.log("  allSettled 结果:");
  results.forEach(function (r, i) {
    if (r.status === "fulfilled") {
      console.log("    任务 " + (i + 1) + ": 成功 →", r.value);
    } else {
      console.log("    任务 " + (i + 1) + ": 失败 →", r.reason.message);
    }
  });
  console.log("  （即使有失败，其他结果也保留）");
});

// ---- 7. Promise.all 快速失败 ----
console.log("\\n===== 7. Promise.all 快速失败 =====");
Promise.all([
  fakeReadFilePromise("ok1"),
  fakeReadFilePromise("error"), // 这个失败会导致整体失败
  fakeReadFilePromise("ok2"),
])
  .then(function (results) {
    console.log("  不会执行（因为有失败）");
  })
  .catch(function (err) {
    console.log("  Promise.all 失败:", err.message);
    console.log("  （一个失败，整体失败，其他结果丢失）");
  });

// ---- 8. Promise.race 超时控制 ----
console.log("\\n===== 8. Promise.race 超时控制 =====");
function withTimeout(promise, ms, msg) {
  var timeout = new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(msg || "操作超时"));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

// 正常完成
withTimeout(fakeReadFilePromise("fast"), 50, "50ms 超时")
  .then(function (r) { console.log("  未超时:", r); })
  .catch(function (e) { console.log("  ", e.message); });

// 超时
withTimeout(new Promise(function (r) { setTimeout(r, 200); }), 50, "50ms 超时")
  .then(function (r) { console.log("  不会执行"); })
  .catch(function (e) { console.log("  超时捕获:", e.message); });

// ---- 9. async 错误处理 ----
console.log("\\n===== 9. async 错误处理 =====");
async function riskyOperation(shouldFail) {
  if (shouldFail) {
    throw new Error("操作失败！");
  }
  return "操作成功";
}

async function testErrorHandling() {
  // 成功情况
  try {
    var result = await riskyOperation(false);
    console.log("  成功:", result);
  } catch (err) {
    console.log("  不应该到这里");
  }

  // 失败情况
  try {
    var result2 = await riskyOperation(true);
    console.log("  不会执行");
  } catch (err) {
    console.log("  捕获错误:", err.message);
  }
}
testErrorHandling();

// ---- 10. 重试机制 ----
console.log("\\n===== 10. 重试机制 retry =====");
// 模拟不稳定的操作（前几次失败，最后成功）
var attemptCount = 0;
function unstableOperation() {
  return new Promise(function (resolve, reject) {
    attemptCount++;
    console.log("  第 " + attemptCount + " 次尝试...");
    if (attemptCount < 3) {
      reject(new Error("第 " + attemptCount + " 次失败"));
    } else {
      resolve("第 " + attemptCount + " 次成功！");
    }
  });
}

// retry 函数：失败自动重试
async function retry(fn, times, delay) {
  var lastError;
  for (var i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.log("  第 " + (i + 1) + " 次失败: " + err.message);
      if (i < times - 1) {
        console.log("  等待 " + delay + "ms 后重试...");
        await new Promise(function (r) { setTimeout(r, delay); });
      }
    }
  }
  throw lastError;
}

// 测试重试
retry(unstableOperation, 5, 10)
  .then(function (r) { console.log("  重试最终结果:", r); })
  .catch(function (e) { console.log("  全部失败:", e.message); });

// ---- 11. 并发限制 ----
console.log("\\n===== 11. 并发限制 asyncPool =====");
// 限制同时最多 N 个并发任务
async function asyncPool(limit, items, iteratorFn) {
  var results = [];
  var executing = []; // 正在执行的 Promise 数组

  for (var i = 0; i < items.length; i++) {
    (async function (item) {
      var p = iteratorFn(item).then(function (r) {
        results.push(r);
        // 从 executing 中移除已完成的
        var idx = executing.indexOf(p);
        if (idx > -1) executing.splice(idx, 1);
      });
      executing.push(p);

      // 达到并发上限时，等一个完成
      await Promise.race(executing);
    })(items[i]);
  }

  // 等待剩余的全部完成
  await Promise.all(executing);
  return results;
}

// 测试并发限制：6 个任务，限制 2 个并发
var taskItems = [1, 2, 3, 4, 5, 6];
var activeCount = 0;
var maxActive = 0;

asyncPool(2, taskItems, function (item) {
  activeCount++;
  if (activeCount > maxActive) maxActive = activeCount;
  console.log("  开始任务 " + item + " (当前并发: " + activeCount + ")");
  return new Promise(function (resolve) {
    setTimeout(function () {
      activeCount--;
      console.log("  完成任务 " + item);
      resolve("结果" + item);
    }, 20);
  });
}).then(function (results) {
  console.log("  并发限制结果:", results);
  console.log("  最大并发数:", maxActive, "(限制为 2)");
});

// ---- 12. forEach 中 await 的陷阱 ----
console.log("\\n===== 12. forEach 中 await 的陷阱 =====");
console.log("  ❌ forEach 不会等待 async 回调:");
console.log("  [1, 2, 3].forEach(async (n) => { await delay(n); });");
console.log("  // forEach 立即返回，不会等待");
console.log("");
console.log("  ✅ 用 for...of 代替:");
console.log("  for (const n of [1, 2, 3]) { await delay(n); }");
console.log("  // 会等待每次 await 完成");
console.log("");
console.log("  ✅ 或用 Promise.all + map:");
console.log("  await Promise.all([1,2,3].map(n => delay(n)));");
console.log("  // 并发执行，等全部完成");

// 演示 for...of 正确等待
async function correctLoop() {
  var items = ["A", "B", "C"];
  var results = [];
  for (var i = 0; i < items.length; i++) {
    var r = await fakeReadFilePromise(items[i]);
    results.push(r);
  }
  console.log("  for 循环 + await 结果:", results);
}
correctLoop();

console.log("\\n===== 异步编程演示结束 =====");
console.log("关键要点:");
console.log("  1. async/await 是首选，代码最清晰");
console.log("  2. 不需要串行时用 Promise.all 并发");
console.log("  3. 需要容错用 Promise.allSettled");
console.log("  4. 超时用 Promise.race");
console.log("  5. forEach 中 await 无效，用 for...of");`,
  },

  // =========================================================
  // 第四章：Util 工具模块
  // =========================================================
  {
    id: "util",
    title: "Util 工具模块",
    icon: "🛠️",
    group: "异步编程",
    content: `## Util 工具模块

\`util\` 模块是 Node.js 内置的"工具箱"，提供了一系列实用函数来辅助开发和调试。它解决了：格式化输出、调试对象、回调与 Promise 转换、类型判断、废弃 API 标记等问题。虽然很多功能在现代 JS 中有了替代方案，但 \`util\` 仍是 Node.js 开发中不可或缺的工具。

### util 模块概述

\`util\` 模块的设计初衷是提供"内部使用的工具函数"，后来逐步开放给开发者。它的功能涵盖：

| 类别 | 主要函数 | 用途 |
| --- | --- | --- |
| 格式化 | \`format\`, \`inspect\`, \`styleText\` | 字符串/对象格式化输出 |
| 异步转换 | \`promisify\`, \`callbackify\` | 回调 ↔ Promise |
| 类型判断 | \`types.isXxx()\` | 精确判断类型 |
| 继承 | \`inherits\` | 原型链继承（已不推荐） |
| 废弃标记 | \`deprecate\` | 标记 API 废弃 |
| 比较 | \`isDeepStrictEqual\` | 深度严格相等 |
| 命令行 | \`parseArgs\` | 解析命令行参数 |
| 文本编码 | \`TextEncoder\`, \`TextDecoder\` | 文本编解码 |

### util.format：格式化字符串

\`util.format(format[, ...args])\` 类似 C 语言的 \`printf\`，用占位符格式化字符串：

\`\`\`javascript
const util = require("util");

util.format("姓名: %s, 年龄: %d", "张三", 20);
// "姓名: 张三, 年龄: 20"
\`\`\`

#### 占位符说明

| 占位符 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| \`%s\` | string | 字符串 | \`"hello"\` |
| \`%d\` | number | 数字（整数或浮点） | \`42\` / \`3.14\` |
| \`%i\` | integer | 整数（截断小数） | \`42\` |
| \`%f\` | float | 浮点数 | \`3.14\` |
| \`%j\` | JSON | JSON 字符串 | \`'{"a":1}'\` |
| \`%o\` | object | 对象（多行美化） | \`{ a: 1 }\` |
| \`%O\` | object | 对象（单行） | \`{ a: 1 }\` |
| \`%%\` | 字面量 | 输出 % | \`"%"\` |

\`\`\`javascript
util.format("%s 有 %d 个苹果，单价 %f 元", "张三", 3, 2.5);
// "张三有 3 个苹果，单价 2.5 元"

util.format("对象: %o", { name: "test", value: 123 });
// "对象: { name: 'test', value: 123 }"
\`\`\`

> \`console.log\` 内部就是用 \`util.format\` 格式化参数的！所以 \`console.log("%s", "hello")\` 等价于 \`console.log(util.format("%s", "hello"))\`。

### util.inspect：深度打印对象

\`util.inspect(object[, options])\` 把任意对象转为可读字符串，是调试的利器：

\`\`\`javascript
const util = require("util");

const obj = { a: { b: { c: { d: "深层嵌套" } } } };
console.log(util.inspect(obj, { depth: null, colors: true }));
\`\`\`

#### options 选项

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`depth\` | number | 2 | 嵌套深度（\`null\` 表示无限） |
| \`colors\` | boolean | false | 彩色输出 |
| \`showHidden\` | boolean | false | 显示不可枚举属性 |
| \`compact\` | boolean/number | 3 | 紧凑模式 |
| \`breakLength\` | number | 80 | 换行长度 |
| \`maxArrayLength\` | number | 100 | 数组最大显示元素数 |
| \`sorted\` | boolean/function | false | 属性排序 |
| \`getters\` | boolean/string | false | 是否展开 getter |

\`\`\`javascript
const obj = { name: "test", nested: { deep: { deeper: { value: "藏得很深" } } } };

// 默认深度 2，更深的会被折叠为 [Object]
util.inspect(obj);
// "{ name: 'test', nested: { deep: { deeper: [Object] } } }"

// depth: null 显示完整深度
util.inspect(obj, { depth: null });
// "{ name: 'test', nested: { deep: { deeper: { value: '藏得很深' } } } }"
\`\`\`

> \`console.dir\` 本质上就是 \`console.log(util.inspect(obj, options))\`。

### util.promisify：回调转 Promise ⭐

\`util.promisify\` 是 \`util\` 模块中**最常用**的函数。它把 error-first 回调风格的函数转换成返回 Promise 的函数，是衔接"回调时代"和"Promise 时代"的桥梁。

#### 基本用法

\`\`\`javascript
const util = require("util");
const fs = require("fs");

// 旧的回调风格
fs.readFile("file.txt", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 用 promisify 转成 Promise
const readFile = util.promisify(fs.readFile);

// 现在可以用 await 了
const data = await readFile("file.txt");
console.log(data);
\`\`\`

#### promisify 的原理

\`\`\`javascript
// promisify 的简化实现：
function promisify(original) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      original(...args, (err, ...values) => {
        if (err) reject(err);
        else resolve(values[0]); // 只取第一个结果
      });
    });
  };
}
\`\`\`

#### promisify 的要求

不是所有回调函数都能 promisify。被转换的函数必须满足：
1. 最后一个参数是回调函数
2. 回调遵循 error-first 约定（\`(err, result) => {}\`）

\`\`\`javascript
// ✅ 可以 promisify
function callbackStyle(arg, callback) {
  setTimeout(() => callback(null, "结果"), 100);
}
const promiseStyle = util.promisify(callbackStyle);

// ❌ 不能 promisify（回调不是 error-first）
function wrongStyle(arg, callback) {
  setTimeout(() => callback("结果"), 100); // 没有错误参数
}
\`\`\`

#### 自定义 promisify 行为

如果原函数的回调有多个参数，可以通过 \`util.promisify.custom\` 自定义：

\`\`\`javascript
// 原函数回调有多个参数
function multiArgs(arg, callback) {
  setTimeout(() => callback(null, "结果1", "结果2"), 100);
}

// 自定义 promisify 行为
multiArgs[util.promisify.custom] = function (arg) {
  return new Promise((resolve) => {
    multiArgs(arg, (err, a, b) => resolve([a, b]));
  });
};

const multiArgsAsync = util.promisify(multiArgs);
const [a, b] = await multiArgsAsync("test"); // ["结果1", "结果2"]
\`\`\`

> 现代 Node.js 推荐直接用 \`fs/promises\`、\`dns/promises\` 等内置 Promise API，\`util.promisify\` 主要用于转换第三方库或自定义的回调函数。

### util.callbackify：Promise 转回调

\`util.callbackify\` 是 \`promisify\` 的逆操作，把返回 Promise 的函数转成 error-first 回调风格：

\`\`\`javascript
const util = require("util");

async function asyncFn() {
  return "hello";
}

// 转成回调风格
const callbackFn = util.callbackify(asyncFn);

callbackFn((err, result) => {
  if (err) throw err;
  console.log(result); // "hello"
});
\`\`\`

> 这个函数用得很少，主要在需要与旧的回调风格代码兼容时使用。

### util.types：精确类型判断

\`util.types\` 提供了精确的类型判断函数，比 \`typeof\` 和 \`instanceof\` 更可靠：

\`\`\`javascript
const util = require("util");

util.types.isPromise(Promise.resolve()); // true
util.types.isMap(new Map());              // true
util.types.isDate(new Date());            // true
util.types.isRegExp(/abc/);              // true
\`\`\`

#### 常用方法

| 方法 | 判断类型 | 示例 |
| --- | --- | --- |
| \`isPromise(v)\` | Promise | \`Promise.resolve()\` |
| \`isMap(v)\` | Map | \`new Map()\` |
| \`isSet(v)\` | Set | \`new Set()\` |
| \`isDate(v)\` | Date | \`new Date()\` |
| \`isRegExp(v)\` | RegExp | \`/abc/\` |
| \`isArrayBuffer(v)\` | ArrayBuffer | \`new ArrayBuffer(8)\` |
| \`isTypedArray(v)\` | TypedArray | \`new Uint8Array()\` |
| \`isWeakMap(v)\` | WeakMap | \`new WeakMap()\` |
| \`isWeakSet(v)\` | WeakSet | \`new WeakSet()\` |
| \`isNativeError(v)\` | 原生 Error | \`new Error()\` |
| \`isBoxedPrimitive(v)\` | 装箱基本类型 | \`new Number(1)\` |
| \`isAsyncFunction(v)\` | async 函数 | \`async () => {}\` |
| \`isGeneratorFunction(v)\` | Generator 函数 | \`function*() {}\` |

#### 为什么需要 util.types？

\`typeof\` 对很多类型返回 \`"object"\`，无法区分：

\`\`\`javascript
typeof new Map();      // "object"
typeof new Date();     // "object"
typeof new Promise(()=>{}); // "object"
typeof [];             // "object"（不是 "array"！）

// util.types 可以精确判断
util.types.isMap(new Map());      // true
util.types.isDate(new Date());    // true
util.types.isPromise(Promise.resolve()); // true
\`\`\`

### util.inherits：继承（已不推荐）

\`util.inherits(constructor, superConstructor)\` 实现原型链继承：

\`\`\`javascript
const util = require("util");
const EventEmitter = require("events");

function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, EventEmitter);

// 现在可以用 ES6 class 代替：
class MyEmitter extends EventEmitter {}
\`\`\`

> ⚠️ \`util.inherits\` 已**废弃**。现代代码应该用 ES6 \`class extends\` 语法代替。

### util.deprecate：标记废弃

\`util.deprecate(fn, message)\` 包装一个函数，调用时打印废弃警告：

\`\`\`javascript
const oldFn = util.deprecate(() => {
  return "旧 API";
}, "oldFn() 已废弃，请使用 newFn()");

oldFn(); // 第一次调用会打印 DeprecationWarning
\`\`\`

> 用于库的版本升级：旧 API 不会立即删除，而是标记废弃，给用户迁移时间。

### util.isDeepStrictEqual：深度严格相等

\`util.isDeepStrictEqual(a, b)\` 递归比较两个值是否深度相等（使用严格相等 \`===\`）：

\`\`\`javascript
util.isDeepStrictEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] }); // true
util.isDeepStrictEqual({ a: 1 }, { a: "1" }); // false（严格相等）
util.isDeepStrictEqual([1, 2], [1, 2]); // true
\`\`\`

#### vs \`==\` / \`===\` / \`JSON.stringify\`

| 方法 | \`{a:1}\` vs \`{a:1}\` | \`{a:1}\` vs \`{a:"1"}\` | 顺序不同 |
| --- | --- | --- | --- |
| \`==\` / \`===\` | false（引用不同） | false | - |
| \`JSON.stringify\` | true | true（都变字符串） | false（顺序敏感） |
| \`isDeepStrictEqual\` | true | false | true |

### util.styleText：彩色输出（Node 21+）

\`util.styleText(format, text)\` 给终端文本添加样式（Node.js 20.12+ / 21+）：

\`\`\`javascript
const util = require("util");

console.log(util.styleText("red", "红色文字"));
console.log(util.styleText("green", "绿色文字"));
console.log(util.styleText(["bold", "blue"], "蓝色加粗"));
console.log(util.styleText("bgYellow", "黄色背景"));
\`\`\`

#### 支持的样式

| 样式 | 说明 |
| --- | --- |
| \`red\` / \`green\` / \`blue\` / \`yellow\` / \`magenta\` / \`cyan\` | 前景色 |
| \`bgRed\` / \`bgGreen\` / ... | 背景色 |
| \`bold\` | 加粗 |
| \`dim\` | 暗淡 |
| \`italic\` | 斜体 |
| \`underline\` | 下划线 |
| \`strikethrough\` | 删除线 |

> 老版本可以用 \`chalk\` 等第三方库实现同样功能。\`util.styleText\` 是内置替代方案。

### util.parseArgs：命令行参数解析（Node 18.3+）

\`util.parseArgs\` 是 Node.js 内置的命令行参数解析器：

\`\`\`javascript
const util = require("util");

const { values, positionals } = util.parseArgs({
  options: {
    port: { type: "string", short: "p", default: "3000" },
    debug: { type: "boolean", short: "d" },
    output: { type: "string", short: "o" },
  },
  allowPositionals: true,
});

// node app.js --port 8080 -d -o out.txt file1.js file2.js
// values: { port: "8080", debug: true, output: "out.txt" }
// positionals: ["file1.js", "file2.js"]
\`\`\`

> 以前需要 \`commander\` 或 \`yargs\` 等第三方库，现在内置 \`util.parseArgs\` 可以处理简单场景。

### util.TextEncoder / util.TextDecoder

虽然 \`TextEncoder\` / \`TextDecoder\` 是全局可用的，但它们也可以从 \`util\` 模块导入：

\`\`\`javascript
const { TextEncoder, TextDecoder } = require("util");

// 字符串 → Uint8Array（UTF-8 编码）
const encoder = new TextEncoder();
const bytes = encoder.encode("你好"); // Uint8Array(6) [228, 189, 160, 229, 165, 189]

// Uint8Array → 字符串（UTF-8 解码）
const decoder = new TextDecoder();
const text = decoder.decode(bytes); // "你好"
\`\`\`

### util.MIMEType（Node 19+）

\`util.MIMEType\` 用于解析和操作 MIME 类型：

\`\`\`javascript
const { MIMEType } = require("util");

const mime = new MIMEType("text/html; charset=utf-8");
console.log(mime.type);     // "text"
console.log(mime.subtype);  // "html"
console.log(mime.essence);  // "text/html"
console.log(mime.params.get("charset")); // "utf-8"
\`\`\`

### 常见陷阱

1. **\`promisify\` 需要 error-first 回调**：不是所有回调函数都能转换
2. **\`inspect\` 默认深度 2**：深层对象会被折叠为 \`[Object]\`，用 \`depth: null\` 展开
3. **\`format\` 多余的参数**：\`util.format("%s", "a", "b")\` 会输出 \`"a b"\`（多余参数用空格拼接）
4. **\`util.types\` vs \`typeof\`**：\`typeof\` 对 Map、Date 等都返回 \`"object"\`，需要 \`util.types\` 精确判断
5. **\`isDeepStrictEqual\` 是严格的**：\`1\` 和 \`"1"\` 不相等
6. **\`styleText\` 需要新版本**：Node 20.12 以下不支持，要做特性检测

下面这段代码演示了 util 模块的所有核心功能。`,
    code: `// ============================================================
// 第四章代码演示：Util 工具模块全面实战
// ============================================================
var util = require("util");

// ---- 1. util.format：格式化字符串 ----
console.log("===== 1. util.format 格式化 =====");
// 类似 printf 的格式化，支持各种占位符
console.log("  %s: %d, 价格: %f 元", "苹果", 5, 3.14);
console.log("  整数截断: %i (3.99 → 3)", 3.99);
console.log("  JSON: %j", { name: "张三", age: 20 });
console.log("  对象 %o:", { a: 1, b: { c: 2 } });

// util.format 返回格式化后的字符串
var formatted = util.format("姓名: %s, 年龄: %d", "李四", 25);
console.log("  format 返回值:", formatted);

// 多余的参数会用空格拼接
var extra = util.format("%s", "a", "b", "c");
console.log("  多余参数:", extra, "(a b c)");

// ---- 2. util.inspect：深度打印对象 ----
console.log("\\n===== 2. util.inspect 调试 =====");
var complexObj = {
  name: "node",
  version: "20.10.0",
  nested: {
    deep: {
      deeper: {
        deepest: "藏得很深的值",
      },
    },
  },
  arr: [1, 2, 3, { x: "y" }],
  func: function (a, b) { return a + b; },
};

// 默认深度 2，更深的会被折叠
console.log("  默认深度 (2):");
console.log("  " + util.inspect(complexObj).replace(/\\n/g, "\\n  "));

// depth: null 显示完整深度
console.log("\\n  完整深度 (null):");
console.log("  " + util.inspect(complexObj, { depth: null }).replace(/\\n/g, "\\n  "));

// showHidden: 显示不可枚举属性
var objWithHidden = {};
Object.defineProperty(objWithHidden, "hidden", {
  value: "我是不可枚举的",
  enumerable: false,
});
console.log("\\n  showHidden: false →", util.inspect(objWithHidden));
console.log("  showHidden: true  →", util.inspect(objWithHidden, { showHidden: true }));

// maxArrayLength: 限制数组显示元素数
var bigArr = Array.from({ length: 10 }, function (_, i) { return i; });
console.log("\\n  maxArrayLength: 5 →", util.inspect(bigArr, { maxArrayLength: 5 }));

// ---- 3. util.promisify：回调转 Promise ⭐ ----
console.log("\\n===== 3. util.promisify 回调转 Promise =====");
// 模拟一个 error-first 回调风格的函数
function delayGreet(name, callback) {
  setTimeout(function () {
    if (name === "error") {
      callback(new Error("名字不合法: " + name), null);
    } else {
      callback(null, "你好, " + name + "!");
    }
  }, 10);
}

// 用 promisify 转成返回 Promise 的函数
var delayGreetAsync = util.promisify(delayGreet);

// 现在可以用 await 了
(async function () {
  try {
    // 正常调用
    var msg1 = await delayGreetAsync("张三");
    console.log("  promisify 成功:", msg1);

    // 错误会被 catch 捕获
    var msg2 = await delayGreetAsync("error");
    console.log("  不会执行:", msg2);
  } catch (err) {
    console.log("  promisify 错误捕获:", err.message);
  }
})();

// ---- 4. promisify 实际应用：包装 setTimeout ----
console.log("\\n===== 4. promisify 实际应用 =====");
// 把 setTimeout 包装成 Promise
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

(async function () {
  console.log("  开始等待...");
  var start = Date.now();
  await sleep(30);
  console.log("  等待了 " + (Date.now() - start) + "ms");
})();

// ---- 5. util.callbackify：Promise 转回调 ----
console.log("\\n===== 5. util.callbackify Promise 转回调 =====");
// 定义一个 async 函数（返回 Promise）
async function asyncAdd(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("参数必须是数字");
  }
  return a + b;
}

// 用 callbackify 转成回调风格
var callbackAdd = util.callbackify(asyncAdd);

// 使用回调风格
callbackAdd(3, 5, function (err, result) {
  if (err) {
    console.log("  callbackify 错误:", err.message);
  } else {
    console.log("  callbackify 成功: 3 + 5 =", result);
  }
});

callbackAdd("a", 5, function (err, result) {
  if (err) {
    console.log("  callbackify 错误捕获:", err.message);
  }
});

// ---- 6. util.types：精确类型判断 ----
console.log("\\n===== 6. util.types 类型判断 =====");
// typeof 对很多类型都返回 "object"，util.types 可以精确判断
console.log("  typeof 判断:");
console.log("    typeof new Map()     :", typeof new Map());      // object
console.log("    typeof new Date()    :", typeof new Date());     // object
console.log("    typeof Promise.resolve():", typeof Promise.resolve()); // object
console.log("    typeof []            :", typeof []);             // object

console.log("\\n  util.types 精确判断:");
console.log("    isPromise(Promise.resolve()):", util.types.isPromise(Promise.resolve()));
console.log("    isMap(new Map())           :", util.types.isMap(new Map()));
console.log("    isSet(new Set())           :", util.types.isSet(new Set()));
console.log("    isDate(new Date())         :", util.types.isDate(new Date()));
console.log("    isRegExp(/abc/)            :", util.types.isRegExp(/abc/));
console.log("    isArrayBuffer              :", util.types.isArrayBuffer(new ArrayBuffer(8)));
console.log("    isTypedArray               :", util.types.isTypedArray(new Uint8Array()));
console.log("    isWeakMap(new WeakMap())   :", util.types.isWeakMap(new WeakMap()));
console.log("    isNativeError(new Error()) :", util.types.isNativeError(new Error()));

// 判断函数类型
console.log("\\n  函数类型判断:");
console.log("    isAsyncFunction       :", util.types.isAsyncFunction(async function () {}));
console.log("    isGeneratorFunction  :", util.types.isGeneratorFunction(function* () {}));
console.log("    isArrowFunction (无此方法, 用 typeof):", typeof function () {});

// ---- 7. util.isDeepStrictEqual：深度严格相等 ----
console.log("\\n===== 7. isDeepStrictEqual 深度比较 =====");
// 递归比较两个值是否深度相等（严格相等 ===）
console.log("  {a:[1,2,3]} vs {a:[1,2,3]}:", util.isDeepStrictEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] }));
console.log("  {a:1} vs {a:'1'}         :", util.isDeepStrictEqual({ a: 1 }, { a: "1" }), "(严格相等: 1 !== '1')");
console.log("  [1,2] vs [1,2]           :", util.isDeepStrictEqual([1, 2], [1, 2]));
console.log("  [1,2] vs [2,1]           :", util.isDeepStrictEqual([1, 2], [2, 1]), "(顺序不同)");
console.log("  null vs undefined         :", util.isDeepStrictEqual(null, undefined));
console.log("  null vs null              :", util.isDeepStrictEqual(null, null));

// 对比 == 和 ===
console.log("\\n  对比不同比较方式:");
var a = { x: 1 };
var b = { x: 1 };
console.log("    a == b      :", a == b, "(引用不同)");
console.log("    a === b     :", a === b, "(引用不同)");
console.log("    deepStrict  :", util.isDeepStrictEqual(a, b), "(值相同)");

// ---- 8. util.deprecate：标记废弃 ----
console.log("\\n===== 8. util.deprecate 废弃标记 =====");
// 包装一个旧函数，调用时会打印废弃警告
function oldApi() {
  return "旧 API 的返回值";
}
var deprecatedApi = util.deprecate(oldApi, "oldApi() 已废弃，请使用 newApi()");

// 调用废弃函数（第一次会打印 DeprecationWarning）
var result = deprecatedApi();
console.log("  废弃函数返回值:", result);
console.log("  （上方可能有 DeprecationWarning 警告）");

// ---- 9. util.styleText：彩色输出（Node 20.12+）----
console.log("\\n===== 9. util.styleText 彩色输出 =====");
if (util.styleText) {
  // Node 20.12+ 支持
  console.log("  " + util.styleText("red", "红色文字"));
  console.log("  " + util.styleText("green", "绿色文字"));
  console.log("  " + util.styleText("blue", "蓝色文字"));
  console.log("  " + util.styleText("yellow", "黄色文字"));
  console.log("  " + util.styleText("magenta", "洋红色文字"));
  console.log("  " + util.styleText("cyan", "青色文字"));
  console.log("  " + util.styleText("bold", "加粗文字"));
  console.log("  " + util.styleText("underline", "下划线文字"));
  console.log("  " + util.styleText("dim", "暗淡文字"));
  console.log("  " + util.styleText(["bold", "red"], "红色加粗（组合样式）"));
  console.log("  " + util.styleText("bgYellow", "黄色背景"));
} else {
  console.log("  当前 Node 版本不支持 util.styleText (需要 20.12+)");
  console.log("  可以用 chalk 等第三方库代替");
}

// ---- 10. util.parseArgs：命令行参数解析（Node 18.3+）----
console.log("\\n===== 10. util.parseArgs 命令行解析 =====");
if (util.parseArgs) {
  // 模拟命令行参数
  var mockArgv = ["--port", "8080", "-d", "--output", "result.txt", "file1.js", "file2.js"];

  var parsed = util.parseArgs({
    options: {
      port: { type: "string", short: "p", default: "3000" },
      debug: { type: "boolean", short: "d" },
      output: { type: "string", short: "o" },
    },
    args: mockArgv,
    allowPositionals: true,
  });

  console.log("  模拟参数:", mockArgv.join(" "));
  console.log("  解析结果:");
  console.log("    values   :", JSON.stringify(parsed.values));
  console.log("    positionals:", JSON.stringify(parsed.positionals));
} else {
  console.log("  当前 Node 版本不支持 util.parseArgs (需要 18.3+)");
}

// ---- 11. TextEncoder / TextDecoder ----
console.log("\\n===== 11. TextEncoder / TextDecoder =====");
// 字符串 → Uint8Array（UTF-8 编码）
var encoder = new TextEncoder();
var bytes = encoder.encode("你好");
console.log("  编码 '你好':", bytes);
console.log("  字节长度:", bytes.length, "(每个中文 3 字节)");

// Uint8Array → 字符串（UTF-8 解码）
var decoder = new TextDecoder();
var text = decoder.decode(bytes);
console.log("  解码回字符串:", text);
console.log("  往返一致:", text === "你好");

// 解码 Buffer（Buffer 是 Uint8Array 的子类）
var buf = Buffer.from("Hello 世界", "utf8");
console.log("  Buffer 解码:", decoder.decode(buf));

// ---- 12. util.format 实战：日志格式化 ----
console.log("\\n===== 12. 实战：日志格式化 =====");
function log(level, message, data) {
  var timestamp = new Date().toISOString();
  var levelStr = level.toUpperCase().padEnd(5);
  var dataStr = data ? " " + util.inspect(data, { depth: 2, compact: true }) : "";
  console.log("  [" + timestamp + "] " + levelStr + " " + message + dataStr);
}

log("info", "服务器启动", { port: 3000, host: "localhost" });
log("warn", "内存使用偏高", { used: "80%", threshold: "75%" });
log("error", "数据库连接失败", { code: "ECONNREFUSED", host: "db.local" });
log("debug", "收到请求", { method: "GET", path: "/api/users" });

// ---- 13. util.inspect 自定义 inspect ----
console.log("\\n===== 13. 自定义 inspect 方法 =====");
// 对象可以定义 [util.inspect.custom] 方法来自定义 inspect 输出
function CustomObject(name, value) {
  this.name = name;
  this.value = value;
}
CustomObject.prototype[util.inspect.custom] = function (depth, options) {
  return "CustomObject(" + options.stylize(this.name, "string") + " = " + options.stylize(this.value, "number") + ")";
};

var custom = new CustomObject("count", 42);
console.log("  自定义 inspect:", custom);
console.log("  默认 inspect:", util.inspect(custom));

console.log("\\n===== Util 模块演示结束 =====");
console.log("关键要点:");
console.log("  1. promisify 是最常用函数（回调转 Promise）");
console.log("  2. inspect 用于调试（depth: null 展开完整深度）");
console.log("  3. types 比 typeof 更精确");
console.log("  4. isDeepStrictEqual 用于深度比较");
console.log("  5. styleText 需要新版本 Node (20.12+)");`,
  },

  // =========================================================
  // 第五章：错误处理
  // =========================================================
  {
    id: "errors",
    title: "错误处理",
    icon: "❗",
    group: "异步编程",
    content: `## 错误处理

错误处理是软件开发中**最容易被忽视**却又**最重要**的部分。一个健壮的 Node.js 应用必须能优雅地处理各种错误——用户输入错误、网络故障、文件不存在、权限不足等等。本章将全面讲解 Node.js 的错误处理机制。

### 错误处理的重要性

#### 不处理错误的后果

\`\`\`javascript
// ❌ 不处理错误：一个未捕获的异常可能导致整个服务崩溃
app.get("/api/users/:id", (req, res) => {
  const user = db.findUser(req.params.id); // 如果出错呢？
  res.json(user); // 如果 user 是 undefined 呢？
});
// 访问 /api/users/不存在 → TypeError → 进程崩溃 → 所有用户断开
\`\`\`

#### 错误处理的三个层次

\`\`\`
  ┌─────────────────────────────────────────────┐
  │  第一层：局部错误处理（try/catch, .catch()）   │ ← 最先处理
  ├─────────────────────────────────────────────┤
  │  第二层：全局错误中间件 / 错误事件              │ ← 兜底处理
  ├─────────────────────────────────────────────┤
  │  第三层：进程级兜底（uncaughtException）        │ ← 最后防线
  └─────────────────────────────────────────────┘
\`\`\`

### Error 对象详解

所有 JavaScript 错误都继承自 \`Error\` 对象：

\`\`\`javascript
const err = new Error("出错了");
console.log(err.name);    // "Error"（错误类型名）
console.log(err.message); // "出错了"（错误描述）
console.log(err.stack);   // "Error: 出错了\\n    at ..."（调用栈）
\`\`\`

#### Error 的属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| \`name\` | string | 错误类型名（如 \`"TypeError"\`） |
| \`message\` | string | 错误描述信息 |
| \`stack\` | string | 调用栈（非标准但广泛支持） |
| \`cause\` | any | 原始错误（ES2022，错误链） |
| \`code\` | string | 错误码（Node.js 扩展，如 \`"ENOENT"\`） |

#### 创建 Error

\`\`\`javascript
// 基本创建
const err1 = new Error("简单错误");

// 带选项（Node.js 支持）
const err2 = new Error("错误信息", { cause: originalError });

// 抛出错误
throw new Error("出错了");
throw new TypeError("类型错误");
throw new RangeError("范围错误");
\`\`\`

### 内置错误类型

JavaScript 有 7 种内置错误类型，都继承自 \`Error\`：

| 错误类型 | 触发场景 | 示例 |
| --- | --- | --- |
| \`Error\` | 通用错误 | \`throw new Error("...")\` |
| \`TypeError\` | 类型不匹配 | \`undefined.foo\` |
| \`RangeError\` | 值超出范围 | \`new Array(-1)\` / 递归太深 |
| \`ReferenceError\` | 引用未定义变量 | \`console.log(x)\`（x 未定义） |
| \`SyntaxError\` | 语法错误 | \`JSON.parse("{invalid}")\` |
| \`EvalError\` | eval 相关（很少见） | \`eval()\` 错误 |
| \`URIError\` | URI 编解码错误 | \`decodeURIComponent("%")\` |

#### TypeError

最常见的错误，当值的类型不是预期类型时抛出：

\`\`\`javascript
undefined.foo;        // TypeError: Cannot read properties of undefined
null.toString();      // TypeError: Cannot read properties of null
(42).toUpperCase();   // TypeError: 42.toUpperCase is not a function
"x".push("y");        // TypeError: "x".push is not a function
\`\`\`

#### RangeError

值不在有效范围内时抛出：

\`\`\`javascript
new Array(-1);           // RangeError: Invalid array length
new Array(Infinity);     // RangeError: Invalid array length
function recurse() { recurse(); } recurse(); // RangeError: Maximum call stack
\`\`\`

#### ReferenceError

访问不存在的变量时抛出：

\`\`\`javascript
console.log(undefinedVar); // ReferenceError: undefinedVar is not defined
\`\`\`

#### SyntaxError

代码语法错误或 JSON 解析失败：

\`\`\`javascript
JSON.parse("{ invalid }");   // SyntaxError: Unexpected token
eval("var x = ;");           // SyntaxError: Unexpected token ;
\`\`\`

> \`SyntaxError\` 在代码**解析阶段**就会抛出（而不是运行时），所以语法错误的代码根本无法运行。但 \`JSON.parse\` 是运行时解析字符串，所以它的 \`SyntaxError\` 可以被 try/catch 捕获。

### Node.js 系统错误

Node.js 在系统调用失败时会抛出带有 \`code\` 属性的错误。这些 \`code\` 遵循 POSIX 错误码标准：

| 错误码 | 含义 | 触发场景 |
| --- | --- | --- |
| \`ENOENT\` | No such file or directory | 文件/目录不存在 |
| \`EACCES\` | Permission denied | 权限不足 |
| \`EEXIST\` | File exists | 文件已存在（创建时） |
| \`EADDRINUSE\` | Address already in use | 端口被占用 |
| \`ECONNREFUSED\` | Connection refused | 目标拒绝连接 |
| \`ECONNRESET\` | Connection reset by peer | 连接被重置 |
| \`ETIMEDOUT\` | Operation timed out | 操作超时 |
| \`ENOTDIR\` | Not a directory | 期望目录但不是 |
| \`EISDIR\` | Is a directory | 期望文件但 是目录 |
| \`EMFILE\` | Too many open files | 文件描述符耗尽 |

\`\`\`javascript
const fs = require("fs");

try {
  fs.readFileSync("/nonexistent/file.txt");
} catch (err) {
  console.log(err.code);    // "ENOENT"
  console.log(err.errno);   // -2
  console.log(err.syscall); // "open"
  console.log(err.path);    // "/nonexistent/file.txt"
  console.log(err.message); // "ENOENT: no such file or directory, open ..."
}
\`\`\`

#### 根据 code 做不同处理

\`\`\`javascript
try {
  fs.readFileSync(configPath);
} catch (err) {
  switch (err.code) {
    case "ENOENT":
      console.log("配置文件不存在，使用默认配置");
      break;
    case "EACCES":
      console.log("没有权限读取配置文件");
      break;
    default:
      console.log("读取配置失败:", err.message);
  }
}
\`\`\`

### 同步错误处理：try/catch

同步代码的错误用 \`try/catch/finally\` 捕获：

\`\`\`javascript
try {
  // 可能出错的代码
  const data = JSON.parse(input);
  console.log(data);
} catch (err) {
  // 捕获错误
  console.error("解析失败:", err.message);
} finally {
  // 无论成功失败都执行（可选）
  console.log("清理资源");
}
\`\`\`

#### try/catch 的局限

\`try/catch\` **只能捕获同步错误**，不能捕获异步回调中的错误：

\`\`\`javascript
// ❌ try/catch 捕获不到异步回调的错误
try {
  setTimeout(() => {
    throw new Error("异步错误"); // 这个错误不会被下面的 catch 捕获！
  }, 100);
} catch (err) {
  console.log("捕获不到:", err.message);
}

// ❌ try/catch 捕获不到 Promise 的错误
try {
  Promise.reject(new Error("Promise 错误"));
} catch (err) {
  console.log("捕获不到:", err.message);
}
\`\`\`

> 异步错误需要用回调、\`.catch()\` 或 \`async/await + try/catch\` 来处理。

### 异步错误处理

#### 回调 error-first

\`\`\`javascript
function divide(a, b, callback) {
  if (b === 0) {
    callback(new Error("除数不能为 0"), null);
  } else {
    callback(null, a / b);
  }
}

divide(10, 0, (err, result) => {
  if (err) {
    console.error("错误:", err.message);
    return;
  }
  console.log("结果:", result);
});
\`\`\`

#### Promise .catch()

\`\`\`javascript
fetchData()
  .then((data) => {
    return processData(data);
  })
  .then((result) => {
    console.log("成功:", result);
  })
  .catch((err) => {
    // 捕获链中任何一步的错误
    console.error("失败:", err.message);
  });
\`\`\`

#### async/await try/catch

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (err) {
    // 捕获 await 的错误
    console.error("请求失败:", err.message);
    return null;
  }
}
\`\`\`

> \`async/await + try/catch\` 是最推荐的异步错误处理方式，写法最清晰。

### 全局错误捕获

#### process.on('uncaughtException')

当同步代码或异步回调中的异常没有被捕获时，触发此事件：

\`\`\`javascript
process.on("uncaughtException", (err, origin) => {
  console.error("未捕获异常:", err.message);
  console.error("来源:", origin); // "uncaughtException" 或 "unhandledRejection"
  // 记录日志后必须退出！
  process.exit(1);
});
\`\`\`

#### 为什么 uncaughtException 后应该退出？

\`uncaughtException\` 触发后，应用可能处于**不一致状态**：
- 文件可能写了一半
- 数据库事务可能未提交
- 内存可能泄漏
- 内部状态可能损坏

正确做法：**记录日志 → 优雅关闭 → 退出 → 由进程管理器重启**。

\`\`\`javascript
process.on("uncaughtException", async (err) => {
  console.error("致命错误:", err.stack);
  // 1. 记录日志到文件/日志服务
  await logger.fatal(err);
  // 2. 通知运维
  await notifyOps(err);
  // 3. 优雅关闭（停止接收新请求，等旧请求完成）
  server.close(() => {
    process.exit(1);
  });
  // 4. 超时强制退出（防止卡死）
  setTimeout(() => process.exit(1), 10000).unref();
});
\`\`\`

> ⚠️ **绝对不要**在 \`uncaughtException\` 后继续正常运行！这是 Node.js 官方的强烈建议。

#### process.on('unhandledRejection')

当 Promise 被 reject 但没有 \`.catch()\` 时触发：

\`\`\`javascript
process.on("unhandledRejection", (reason, promise) => {
  console.error("未处理的 Promise 拒绝:", reason);
  console.error("Promise:", promise);
  // Node.js v15+ 默认会退出进程
});
\`\`\`

> 从 Node.js v15 起，未处理的 Promise 拒绝默认会导致进程退出（\`--unhandled-rejections=throw\`）。你应该总是用 \`.catch()\` 处理 Promise 错误。

### 自定义错误类

继承 \`Error\` 创建业务错误类，方便区分错误类型和携带额外信息：

\`\`\`javascript
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = "VALIDATION_ERROR";
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(\`\${resource} 不存在\`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.code = "NOT_FOUND";
  }
}

class DatabaseError extends Error {
  constructor(message, query) {
    super(message);
    this.name = "DatabaseError";
    this.query = query;
    this.code = "DATABASE_ERROR";
  }
}
\`\`\`

#### 使用自定义错误

\`\`\`javascript
function getUser(id) {
  if (!id) throw new ValidationError("id", "用户 ID 不能为空");
  const user = db.find(id);
  if (!user) throw new NotFoundError("用户");
  return user;
}

try {
  getUser(null);
} catch (err) {
  if (err instanceof ValidationError) {
    console.log("校验错误:", err.field, err.message);
  } else if (err instanceof NotFoundError) {
    console.log("未找到:", err.resource);
  } else {
    console.log("其他错误:", err.message);
  }
}
\`\`\`

#### 自定义错误的最佳实践

1. **总是调用 \`super(message)\`**：确保 \`message\` 和 \`stack\` 正确设置
2. **设置 \`this.name\`**：方便识别错误类型
3. **设置 \`this.code\`**：方便程序化判断
4. **添加业务属性**：如 \`field\`、\`resource\`、\`statusCode\` 等
5. **不需要覆盖 \`stack\`**：\`super()\` 会自动设置

### 错误的 cause 链（ES2022）

ES2022 引入了 \`cause\` 属性，可以在新错误中保留原始错误，形成错误链：

\`\`\`javascript
try {
  JSON.parse(invalidJson);
} catch (err) {
  // 用 cause 保留原始错误
  throw new Error("配置文件解析失败", { cause: err });
}

// 外层可以追溯到原始错误
try {
  loadConfig();
} catch (err) {
  console.log(err.message);      // "配置文件解析失败"
  console.log(err.cause.message); // "Unexpected token ..."
  console.log(err.cause.name);    // "SyntaxError"
}
\`\`\`

#### 错误链的应用场景

\`\`\`javascript
async function getUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } catch (err) {
    // 包装错误，添加上下文，但保留原始错误
    throw new Error(\`获取用户 \${userId} 数据失败\`, { cause: err });
  }
}

try {
  await getUserData(123);
} catch (err) {
  console.log(err.message);       // "获取用户 123 数据失败"
  console.log(err.cause.message);  // "HTTP 404" 或 "fetch failed"
}
\`\`\`

> 错误链让你在每层添加上下文信息，同时不丢失底层的错误细节。

### 错误处理最佳实践

#### 1. 区分操作错误 vs 程序员错误

| 类型 | 说明 | 处理方式 | 示例 |
| --- | --- | --- | --- |
| **操作错误** | 运行时可以预见的错误 | 优雅处理 | 文件不存在、网络超时 |
| **程序员错误** | 代码 bug | 修复代码 | 读 undefined 属性、参数类型错 |

> 操作错误应该被处理并恢复；程序员错误应该让进程崩溃并重启（修复后就不会再发生）。

#### 2. 总是处理 Promise 错误

\`\`\`javascript
// ❌ 危险：未处理的 rejection
promise.then((data) => console.log(data));
// 如果 reject 了 → unhandledRejection → 进程可能崩溃

// ✅ 总是加 .catch()
promise
  .then((data) => console.log(data))
  .catch((err) => console.error(err));

// ✅ 或用 async/await + try/catch
try {
  const data = await promise;
  console.log(data);
} catch (err) {
  console.error(err);
}
\`\`\`

#### 3. 错误信息要有上下文

\`\`\`javascript
// ❌ 错误信息太简略
throw new Error("失败");

// ✅ 错误信息有上下文
throw new Error(\`用户 \${userId} 的订单 \${orderId} 创建失败: \${reason}\`);
\`\`\`

#### 4. 不要吞掉错误

\`\`\`javascript
// ❌ 吞掉错误（什么都不做）
try { riskyOperation(); } catch (e) {}

// ❌ 只打印不处理
try { riskyOperation(); } catch (e) { console.log(e); }

// ✅ 记录并处理
try {
  riskyOperation();
} catch (err) {
  logger.error("操作失败", err);
  // 返回默认值、重试、或向上抛出
  return defaultValue;
}
\`\`\`

#### 5. 集中错误处理

在 Web 框架中使用错误处理中间件：

\`\`\`javascript
// Express 错误处理中间件（必须注册在最后）
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message, field: err.field });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  } else {
    logger.error(err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
\`\`\`

### 常见陷阱

1. **try/catch 捕获不了异步错误**：回调、Promise 的错误需要用对应的方式处理
2. **uncaughtException 后继续运行**：应用状态可能已损坏，应该退出
3. **吞掉错误**：\`catch (e) {}\` 是最糟糕的做法
4. **错误信息不够**：\`throw new Error("error")\` 无法定位问题
5. **忘记 .catch()**：导致 unhandledRejection
6. **混淆错误类型**：操作错误和程序员错误的处理方式不同

下面这段代码演示了各种错误的抛出、捕获和处理。`,
    code: `// ============================================================
// 第五章代码演示：错误处理全面实战
// ============================================================

// ---- 1. 内置错误类型 ----
console.log("===== 1. 内置错误类型 =====");

// Error：通用错误
try {
  throw new Error("这是一个通用错误");
} catch (err) {
  console.log("  Error:");
  console.log("    name   :", err.name);     // "Error"
  console.log("    message:", err.message); // "这是一个通用错误"
}

// TypeError：类型错误
try {
  var obj = undefined;
  obj.property; // 访问 undefined 的属性
} catch (err) {
  console.log("  TypeError:", err.name, "-", err.message.slice(0, 40));
}

// RangeError：范围错误
try {
  new Array(-1); // 无效的数组长度
} catch (err) {
  console.log("  RangeError:", err.name, "-", err.message.slice(0, 30));
}

// ReferenceError：引用错误
try {
  // 使用 eval 来模拟运行时引用错误（直接写未定义变量会被语法分析阶段捕获）
  eval("undefinedVariable123");
} catch (err) {
  console.log("  ReferenceError:", err.name, "-", err.message.slice(0, 40));
}

// SyntaxError：语法错误（JSON 解析）
try {
  JSON.parse("{ invalid json }");
} catch (err) {
  console.log("  SyntaxError:", err.name, "-", err.message.slice(0, 35));
}

// URIError：URI 编解码错误
try {
  decodeURIComponent("%"); // 不完整的 URI 编码
} catch (err) {
  console.log("  URIError:", err.name, "-", err.message.slice(0, 30));
}

// ---- 2. Error 对象的属性 ----
console.log("\\n===== 2. Error 对象属性 =====");

// 创建一个带 options 的 Error（ES2022 支持 cause 选项）
var dbErr = new Error("数据库查询失败", {
  cause: new Error("连接超时：10000ms 未响应"),
});

// name：错误名称，通常是构造函数的名字
console.log("  name    :", dbErr.name); // "Error"

// message：人类可读的错误描述
console.log("  message :", dbErr.message); // "数据库查询失败"

// stack：调用堆栈字符串，第一行是 "Error: message"，后面是调用栈
// 这里只取前 3 行，避免输出太长
console.log("  stack   (前 3 行):");
console.log("    " + dbErr.stack.split("\\n").slice(0, 3).join("\\n    "));

// cause：错误原因（ES2022 新增），用于建立错误链
console.log("  cause   :", dbErr.cause.message); // "连接超时：10000ms 未响应"

// code：自定义错误码（Node.js 系统错误的标准属性）
dbErr.code = "EDB_TIMEOUT";
console.log("  code    :", dbErr.code); // "EDB_TIMEOUT"

// 可以给 Error 任意添加自定义属性
dbErr.timestamp = Date.now();
dbErr.context = { sql: "SELECT * FROM users", retries: 3 };
console.log("  自定义属性 timestamp:", dbErr.timestamp);
console.log("  自定义属性 context  :", dbErr.context);

// ---- 3. Node.js 系统错误（带 code 属性） ----
console.log("\\n===== 3. Node.js 系统错误 =====");

// Node.js 的系统错误通常带有 code 属性，如 ENOENT、EACCES、ECONNREFUSED 等
// 这些 code 比错误信息更稳定，适合用于程序判断
const fs = require("fs");

// ENOENT：文件不存在
try {
  fs.readFileSync("/this/path/does/not/exist/file.txt");
} catch (err) {
  console.log("  错误码 code :", err.code); // "ENOENT"
  console.log("  系统调用    :", err.syscall); // "open"
  console.log("  路径 path  :", err.path);
  console.log("  错误信息    :", err.message.slice(0, 50));
}

// 常见 Node.js 错误码表（部分）：
// | code          | 含义                       |
// |---------------|----------------------------|
// | ENOENT        | 文件/目录不存在            |
// | EACCES        | 权限不足                   |
// | EEXIST        | 文件已存在                 |
// | EISDIR        | 操作目标是目录             |
// | ENOTDIR       | 操作目标是文件             |
// | ECONNREFUSED  | 连接被拒绝                 |
// | ECONNRESET    | 连接被重置                 |
// | ETIMEDOUT     | 连接超时                   |
// | ERR_INVALID_ARG_TYPE | 参数类型错误       |

// ---- 4. 同步错误处理：try/catch ----
console.log("\\n===== 4. 同步错误处理 try/catch =====");

// try/catch 只能捕获同步代码中的错误
function parseConfig(jsonStr) {
  try {
    var config = JSON.parse(jsonStr);
    if (!config.port) {
      throw new Error("配置缺少 port 字段");
    }
    if (config.port < 0 || config.port > 65535) {
      throw new RangeError("port 必须在 0-65535 之间，得到: " + config.port);
    }
    return config;
  } catch (err) {
    // 可以根据错误类型做不同处理
    if (err instanceof SyntaxError) {
      console.log("  [配置解析] JSON 语法错误:", err.message);
      return { port: 3000 }; // 返回默认配置
    } else if (err instanceof RangeError) {
      console.log("  [配置解析] 范围错误:", err.message);
      return { port: 3000 };
    } else {
      console.log("  [配置解析] 其他错误:", err.message);
      return { port: 3000 };
    }
  } finally {
    // finally 块无论是否出错都会执行
    console.log("  [配置解析] 解析流程结束");
  }
}

console.log("  解析合法 JSON:", parseConfig('{"port":8080}'));
console.log("  解析非法 JSON:", parseConfig('not a json'));
console.log("  解析缺字段  :", parseConfig('{"host":"localhost"}'));
console.log("  解析越界端口:", parseConfig('{"port":99999}'));

// ---- 5. 异步错误处理 ----
console.log("\\n===== 5. 异步错误处理 =====");

// (a) 回调风格：error-first callback（Node.js 约定）
// 约定：回调函数的第一个参数永远是 error，如果没有错误则为 null
function readFileCallback(filename, callback) {
  // 模拟异步读取
  setTimeout(function () {
    if (!filename) {
      callback(new Error("文件名不能为空"));
    } else {
      callback(null, "文件[" + filename + "]的内容");
    }
  }, 10);
}

readFileCallback("data.txt", function (err, data) {
  if (err) {
    console.log("  (a) 回调风格 - 出错:", err.message);
  } else {
    console.log("  (a) 回调风格 - 成功:", data);
  }
});

readFileCallback("", function (err, data) {
  if (err) {
    console.log("  (a) 回调风格 - 出错:", err.message);
  } else {
    console.log("  (a) 回调风格 - 成功:", data);
  }
});

// (b) Promise 风格：用 .catch() 捕获错误
function readFilePromise(filename) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (!filename) {
        reject(new Error("Promise: 文件名不能为空"));
      } else {
        resolve("Promise 读取[" + filename + "]成功");
      }
    }, 10);
  });
}

readFilePromise("config.json")
  .then(function (data) {
    console.log("  (b) Promise - 成功:", data);
  })
  .catch(function (err) {
    console.log("  (b) Promise - 出错:", err.message);
  });

// (c) async/await 风格：用 try/catch 捕获 Promise 错误
// 这是现代 Node.js 推荐的写法
async function readConfig(filename) {
  try {
    var data = await readFilePromise(filename);
    console.log("  (c) async/await - 成功:", data);
  } catch (err) {
    console.log("  (c) async/await - 出错:", err.message);
  }
}

// 故意传空文件名触发错误
readConfig("");
readConfig("settings.json");

// ---- 6. 全局错误捕获 ----
console.log("\\n===== 6. 全局错误捕获 =====");

// process.on('uncaughtException')：捕获未被 try/catch 捕获的同步异常
// 重要：这是最后一道防线，触发后应用状态可能已损坏，生产环境应记录日志后退出
process.on("uncaughtException", function (err) {
  console.log("  [uncaughtException] 捕获到未处理异常:", err.message);
});

// process.on('unhandledRejection')：捕获未被 .catch() 处理的 Promise rejection
process.on("unhandledRejection", function (reason) {
  console.log("  [unhandledRejection] 捕获到未处理的 Promise 拒绝:", reason.message);
});

// 触发 uncaughtException（下一轮事件循环执行，避免影响当前流程）
// 注意：在沙箱环境中我们用 process.emit 来模拟触发，而不是真的 throw，
// 因为真的 throw 会导致宿主进程崩溃。真实应用中，未被 try/catch 捕获的
// 同步异常会自动触发 'uncaughtException' 事件。
setImmediate(function () {
  process.emit("uncaughtException", new Error("故意抛出的未捕获异常"));
});

// 触发 unhandledRejection
// 注意：沙箱中的 process.on('unhandledRejection') 是模拟的，无法真正拦截
// 宿主进程的 Promise 拒绝事件。这里手动 emit 一下，让上面的监听器收到事件，
// 同时给 Promise 接一个空 catch，避免宿主进程因 "未处理的 rejection" 崩溃。
var demoReason = new Error("故意拒绝的未处理 Promise");
process.emit("unhandledRejection", demoReason);
Promise.reject(demoReason).catch(function () {});

console.log("  已注册全局错误处理器，等待异步触发...");

// ---- 7. 自定义错误类 ----
console.log("\\n===== 7. 自定义错误类 =====");

// 自定义错误类的标准写法：继承 Error，调用 super，设置 name
// 这样可以用 instanceof 精确判断错误类型，比靠 message 字符串判断更可靠

// (1) 校验错误：用于参数校验失败
class ValidationError extends Error {
  constructor(message, field) {
    super(message); // 调用父类构造函数
    this.name = "ValidationError"; // 覆盖默认的 "Error"
    this.field = field; // 自定义属性：哪个字段出错
    this.code = "VALIDATION_FAILED";
    // 保持堆栈正确（V8 引擎推荐）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

// (2) 未找到错误：用于资源不存在
class NotFoundError extends Error {
  constructor(resource, id) {
    super(resource + " 不存在: " + id);
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
    this.code = "NOT_FOUND";
  }
}

// (3) 数据库错误：用于数据库操作失败
class DatabaseError extends Error {
  constructor(message, query) {
    super(message);
    this.name = "DatabaseError";
    this.query = query;
    this.code = "DB_ERROR";
    this.timestamp = new Date().toISOString();
  }
}

// 演示自定义错误的抛出与捕获
function findUser(id) {
  if (id < 0) {
    throw new ValidationError("用户 ID 不能为负数", "id");
  }
  if (id > 1000) {
    throw new NotFoundError("用户", id);
  }
  return { id: id, name: "用户" + id };
}

// 测试各种自定义错误
[42, -1, 9999].forEach(function (id) {
  try {
    var user = findUser(id);
    console.log("  查找用户 " + id + ":", user.name);
  } catch (err) {
    // 用 instanceof 精确判断错误类型
    if (err instanceof ValidationError) {
      console.log("  查找用户 " + id + " - 校验失败:", err.message, "(字段:" + err.field + ")");
    } else if (err instanceof NotFoundError) {
      console.log("  查找用户 " + id + " - 未找到:", err.message);
    } else {
      console.log("  查找用户 " + id + " - 未知错误:", err.message);
    }
  }
});

// ---- 8. 错误的 cause 链（ES2022） ----
console.log("\\n===== 8. 错误的 cause 链 =====");

// ES2022 新增：new Error(message, { cause }) 可以记录原始错误
// 这样在重新抛出错误时，不会丢失底层错误信息
// 场景：底层错误 → 中层封装 → 上层抛出，形成错误链

async function fetchFromDatabase() {
  // 模拟底层错误：数据库连接失败
  throw new Error("ECONNREFUSED: 数据库连接被拒绝");
}

async function getUserProfile(userId) {
  try {
    return await fetchFromDatabase();
  } catch (err) {
    // 用 cause 包装底层错误，保留原始错误信息
    throw new Error("获取用户 " + userId + " 失败", { cause: err });
  }
}

// 在最顶层捕获，可以看到完整的错误链
(async function () {
  try {
    await getUserProfile(123);
  } catch (err) {
    console.log("  顶层错误:", err.message);
    console.log("  原始原因:", err.cause.message);

    // 遍历完整的错误链
    console.log("  完整错误链:");
    var current = err;
    var depth = 0;
    while (current) {
      console.log("    " + depth + ":", current.message);
      current = current.cause;
      depth++;
    }
  }
})();

// ---- 9. EventEmitter 的 error 事件 ----
console.log("\\n===== 9. EventEmitter error 事件 =====");

const { EventEmitter } = require("events");

// 重要规则：EventEmitter 触发 'error' 事件时，如果没有监听器，
// Node.js 会抛出未捕获异常，导致进程崩溃！
// 所以使用 EventEmitter 时，一定要注册 'error' 监听器

var emitter = new EventEmitter();

// 注册 error 事件监听器（必须）
emitter.on("error", function (err) {
  console.log("  [emitter error] 捕获到事件错误:", err.message);
});

// 正常事件
emitter.on("data", function (data) {
  console.log("  [emitter data] 收到数据:", data);
});

emitter.emit("data", "hello");
emitter.emit("error", new Error("处理数据时出错"));

// ---- 10. 错误处理最佳实践总结 ----
console.log("\\n===== 10. 错误处理最佳实践 =====");
console.log("  1. 同步代码用 try/catch");
console.log("  2. Promise 用 .catch()，async/await 用 try/catch");
console.log("  3. 回调用 error-first 约定：callback(err, data)");
console.log("  4. 自定义错误类继承 Error，设置 name 和 code");
console.log("  5. 用 instanceof 判断错误类型，不要靠 message 字符串");
console.log("  6. 重新抛出错误时用 cause 保留原始错误链");
console.log("  7. 注册 uncaughtException 和 unhandledRejection 作为兜底");
console.log("  8. EventEmitter 必须监听 error 事件");
console.log("  9. 不要吞掉错误（catch (e) {} 是反模式）");
console.log("  10. 区分操作错误（可恢复）和程序员错误（应修复）");
console.log("\\n===== 错误处理章节演示结束 =====");`,
  },
];