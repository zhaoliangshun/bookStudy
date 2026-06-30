// =============================================================
// Node.js 交互式教程 —— 第一批章节（快速入门组，共 5 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Node.js 简介与环境搭建
  // =========================================================
  {
    id: "node-intro",
    icon: "📘",
    group: "快速入门",
    title: "Node.js 简介与环境搭建",
    content: `## Node.js 是什么？

Node.js 是一个**基于 Chrome V8 JavaScript 引擎**构建的开源、跨平台 JavaScript 运行时环境。它让 JavaScript 能够脱离浏览器，在服务器端运行。2009 年由 Ryan Dahl 创建，其核心思想是：**用事件驱动、非阻塞 I/O 模型构建高性能的网络应用**。

### V8 引擎 + libuv：Node.js 的双引擎架构

Node.js 的底层由两个核心组件驱动：

**V8 引擎**（Google 开发，C++ 编写）：
- 负责将 JavaScript 代码编译为机器码并执行
- 使用 JIT（即时编译）技术，性能远超传统解释器
- 提供垃圾回收（GC）、内存管理等运行时能力
- Google 持续投入优化，Node.js 可以免费"搭便车"

**libuv 库**（Ryan Dahl 为 Node.js 专门开发）：
- 跨平台的异步 I/O 库，封装了操作系统的底层差异
- 在 Linux 上使用 epoll，macOS 上使用 kqueue，Windows 上使用 IOCP
- 提供线程池（默认 4 个线程），处理无法异步的操作（如文件 I/O、DNS 查询、加密计算）
- 实现事件循环（Event Loop），是 Node.js 异步能力的核心引擎

### 事件驱动、非阻塞 I/O 的深层原理

这是理解 Node.js 的关键。传统服务器（如 Apache）为每个请求创建一个线程，当并发数上万时，线程上下文切换的性能开销会急剧增大。

Node.js 采用不同的策略：

1. **主线程（JavaScript 执行线程）是单线程的**——所有 JavaScript 代码在同一个线程中执行
2. **遇到 I/O 操作时，主线程不等待**——而是把任务交给 libuv 线程池或操作系统异步机制
3. **I/O 完成后，通过回调通知主线程**——事件循环在合适的时机取出回调并执行

\`\`\`
// 伪代码示例：Node.js 处理并发请求的方式
// 请求 1：读取文件 → 交给 libuv → 主线程继续处理其他请求
// 请求 2：查询数据库 → 交给 libuv → 主线程继续处理其他请求
// 请求 3：进行 HTTP 调用 → 交给操作系统 → 主线程继续处理其他请求
// ... 当任何一个 I/O 完成时，回调加入事件队列，等待主线程执行
\`\`\`

这意味着：**JavaScript 代码始终在单线程中执行，但 I/O 操作是真正并行的**。这就是 Node.js 能用少量资源处理大量并发连接的原因。

### 事件循环（Event Loop）的 6 个阶段

事件循环是 Node.js 异步能力的核心，分为 6 个主要阶段：

| 阶段 | 说明 | 典型任务 |
| --- | --- | --- |
| **timers** | 执行到期的定时器回调 | setTimeout、setInterval |
| **pending callbacks** | 执行延迟到下一轮的 I/O 回调 | TCP 错误回调 |
| **idle/prepare** | 内部使用 | libuv 内部处理 |
| **poll** | 获取新的 I/O 事件 | 文件读取、网络数据到达 |
| **check** | 执行 setImmediate 回调 | setImmediate 注册的回调 |
| **close callbacks** | 关闭事件回调 | socket 的 close 事件 |

每个阶段切换时，事件循环会先清空两个微任务队列：
- **nextTick 队列**（优先级最高）
- **Promise 微任务队列**

### 适用场景

✅ **非常适合的场景**：
- **API 服务 / RESTful 后端**：Netflix、PayPal、LinkedIn 都在用 Node.js 处理 API 请求
- **实时应用**：聊天系统、在线协作编辑、游戏服务器（WebSocket 长连接）
- **命令行工具**：Webpack、Babel、ESLint、TypeScript 编译器都是 Node.js 工具
- **服务端渲染（SSR）**：Next.js、Nuxt.js 等框架在服务端渲染 React/Vue 组件
- **微服务**：轻量、启动快，适合微服务架构
- **BFF（Backend for Frontend）**：前端团队用同一门语言写后端，聚合多个微服务 API

❌ **不太适合的场景**：
- **CPU 密集型任务**：图像处理、视频编码、科学计算——主线程会被阻塞，影响所有请求
- **高频交易系统**：对 GC 停顿极度敏感，需要 C++/Rust 级别的时间控制
- **大型单体应用**：类型系统不如 Java/C# 成熟，更适合拆分成小服务

### LTS 版本策略

Node.js 采用**双轨发版策略**：

| 版本类型 | 发布频率 | 支持周期 | 适用场景 |
| --- | --- | --- | --- |
| **Current** | 每 6 个月 | 最新特性 | 尝鲜和开发 |
| **LTS** | 每年（偶数版本） | 30 个月 | 生产环境 |

**重要版本里程碑**：
- v14 (2020)：顶层 await 实验性支持、ESM 改进
- v16 (2021)：Apple Silicon 支持、Timers Promises API
- v18 (2022)：内置 fetch()、Test Runner、Web Streams API
- v20 (2023)：权限模型、稳定版 Test Runner、V8 11.3
- v22 (2024)：内置 WebSocket 客户端、V8 12.4、require() ESM 模块

**生产环境务必使用 LTS 版本**。

### 版本管理工具

#### nvm（Node Version Manager）—— 最推荐

\`\`\`bash
# 安装 nvm（macOS / Linux）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 安装最新 LTS
nvm install --lts

# 安装指定版本
nvm install 20.10.0

# 切换版本
nvm use 20

# 查看已安装版本
nvm ls

# 设置默认版本
nvm alias default 20
\`\`\`

#### volta —— 新一代工具，更快更安全

\`\`\`bash
# 安装 volta
curl https://get.volta.sh | bash

# 安装 Node.js
volta install node@20

# 项目级别锁定版本（写入 package.json）
volta pin node@20
\`\`\`

#### 安装验证

\`\`\`bash
node --version    # 查看 Node.js 版本
npm --version     # 查看 npm 版本
node -e "console.log('Hello, Node.js!')"  # 快速测试
\`\`\``,
    code: `// ============================================================
// 第一章代码演示：Node.js 运行时信息全景
// ============================================================
// 本章演示通过 process 和 os 模块获取 Node.js 运行时的各种底层信息

const os = require("os");

// ---- 1. 版本信息 ----
console.log("========== 版本信息 ==========");
// process.version：完整的 Node.js 版本字符串
console.log("Node.js 版本:", process.version);
// process.versions：包含各组件版本的对象
console.log("V8 引擎版本:", process.versions.v8);
console.log("libuv 版本:", process.versions.uv);
console.log("OpenSSL 版本:", process.versions.openssl);
// 以 JSON 格式展示完整版本信息
console.log("完整版本信息:");
console.log(JSON.stringify(process.versions, null, 2));

// ---- 2. 系统平台信息 ----
console.log("\\n========== 系统平台 ==========");
// process.platform：操作系统平台标识
// 可能的值：'darwin'(macOS)、'win32'(Windows)、'linux'(Linux)
console.log("操作系统平台:", process.platform);
// process.arch：CPU 架构
// 可能的值：'x64'、'arm64'、'ia32'、'arm'
console.log("CPU 架构:", process.arch);
// process.pid：当前进程 ID
console.log("进程 PID:", process.pid);
// process.ppid：父进程 ID
console.log("父进程 PPID:", process.ppid);

// ---- 3. 内存使用详情 ----
console.log("\\n========== 内存使用情况 ==========");
// process.memoryUsage()：返回 Node.js 进程的内存使用详情
const mem = process.memoryUsage();
// rss（Resident Set Size）：进程实际占用的物理内存
console.log("rss（常驻内存）:", (mem.rss / 1024 / 1024).toFixed(2), "MB");
// heapTotal：V8 堆的总量（已申请的堆空间）
console.log("heapTotal（堆总量）:", (mem.heapTotal / 1024 / 1024).toFixed(2), "MB");
// heapUsed：V8 堆中实际已使用的部分
console.log("heapUsed（堆已用）:", (mem.heapUsed / 1024 / 1024).toFixed(2), "MB");
// external：V8 管理的 C++ 对象（如 Buffer）占用的内存
console.log("external（外部内存）:", (mem.external / 1024 / 1024).toFixed(2), "MB");
// arrayBuffers：ArrayBuffer 和 SharedArrayBuffer 占用的内存
console.log("arrayBuffers:", ((mem.arrayBuffers || 0) / 1024 / 1024).toFixed(2), "MB");

// ---- 4. CPU 信息 ----
console.log("\\n========== CPU 信息 ==========");
// os.cpus()：返回 CPU 核心信息数组
const cpus = os.cpus();
console.log("CPU 逻辑核心数:", cpus.length);
console.log("CPU 型号:", cpus[0].model.trim());
console.log("CPU 频率:", cpus[0].speed, "MHz");

// 以表格展示各核心的时间统计
console.log("\\n各核心 CPU 时间统计（毫秒）:");
const cpuTable = cpus.map(function (cpu, i) {
  var t = cpu.times;
  var total = t.user + t.nice + t.sys + t.idle + t.irq;
  return {
    核心: "CPU" + i,
    用户态: t.user,
    系统态: t.sys,
    空闲: t.idle,
    使用率: ((1 - t.idle / total) * 100).toFixed(1) + "%",
  };
});
console.table(cpuTable);

// ---- 5. 系统内存信息 ----
console.log("\\n========== 系统内存 ==========");
// os.totalmem()：系统总内存（字节）
var totalMem = os.totalmem();
// os.freemem()：系统可用内存（字节）
var freeMem = os.freemem();
var usedMem = totalMem - freeMem;

function formatBytes(bytes) {
  var gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return gb.toFixed(2) + " GB";
  return (bytes / 1024 / 1024).toFixed(0) + " MB";
}

console.log("总内存:", formatBytes(totalMem));
console.log("已用  :", formatBytes(usedMem));
console.log("可用  :", formatBytes(freeMem));
console.log("使用率:", ((usedMem / totalMem) * 100).toFixed(1) + "%");

// ---- 6. 系统运行时间与负载 ----
console.log("\\n========== 系统运行时间 ==========");
// os.uptime()：系统从启动到现在的秒数
var uptime = os.uptime();
var days = Math.floor(uptime / 86400);
var hours = Math.floor((uptime % 86400) / 3600);
var mins = Math.floor((uptime % 3600) / 60);
console.log("系统已运行:", days + "天 " + hours + "小时 " + mins + "分钟");

// os.loadavg()：系统负载平均值（1分钟/5分钟/15分钟）
// Windows 上始终返回 [0, 0, 0]
var loadavg = os.loadavg();
console.log("\\n系统负载平均值:");
console.log("  1分钟  :", loadavg[0].toFixed(2));
console.log("  5分钟  :", loadavg[1].toFixed(2));
console.log("  15分钟:", loadavg[2].toFixed(2));
console.log("  负载/CPU比:", (loadavg[0] / cpus.length).toFixed(2), "(>1 表示过载)");

// ---- 7. 网络接口信息 ----
console.log("\\n========== 网络接口 ==========");
var nets = os.networkInterfaces();
console.log("网络接口数量:", Object.keys(nets).length);
// 遍历所有网络接口，提取关键信息
var netList = [];
for (var name in nets) {
  var interfaces = nets[name];
  for (var j = 0; j < interfaces.length; j++) {
    var net = interfaces[j];
    netList.push({
      接口: name,
      地址族: net.family,
      IP地址: net.address,
      内部接口: net.internal ? "是" : "否",
    });
  }
}
console.table(netList);

// ---- 8. 用户信息 ----
console.log("\\n========== 用户信息 ==========");
var user = os.userInfo();
console.log("用户名:", user.username);
console.log("主目录:", user.homedir);
console.log("Shell:", user.shell || "(无)");
console.log("临时目录:", os.tmpdir());

// ---- 9. process 其他属性 ----
console.log("\\n========== process 其他属性 ==========");
console.log("运行时长:", process.uptime().toFixed(4), "秒");
console.log("当前工作目录:", process.cwd());
console.log("__dirname:", __dirname);
console.log("__filename:", __filename);
console.log("argv:", process.argv);

// ---- 10. nextTick 微任务演示 ----
console.log("\\n========== nextTick 任务优先级 ==========");
console.log("1. 同步代码开始");

process.nextTick(function () {
  console.log("3. process.nextTick 回调（优先级最高）");
});

Promise.resolve().then(function () {
  console.log("4. Promise.then 回调");
});

console.log("2. 同步代码结束");
// 输出顺序：1 → 2 → 3 → 4

// ---- 11. 进程退出事件 ----
console.log("\\n========== 退出事件 ==========");
process.on("exit", function (code) {
  console.log("\\n[exit] 进程退出，退出码:", code);
  console.log("[exit] 此处只能执行同步操作");
});
console.log("已注册 exit 事件监听器，程序结束后自动触发");`,
  },

  // =========================================================
  // 第二章：第一个 Node.js 应用
  // =========================================================
  {
    id: "node-hello-world",
    icon: "🚀",
    group: "快速入门",
    title: "第一个 Node.js 应用",
    content: `## 从零开始创建 Node.js 项目

### 1. 初始化项目：npm init

每个 Node.js 项目的起点是 \`package.json\` 文件。它记录了项目的元数据、依赖和脚本：

\`\`\`bash
# 创建项目目录
mkdir my-first-app
cd my-first-app

# 初始化 package.json（交互式回答）
npm init

# 或者使用 -y 跳过所有问题，使用默认值
npm init -y
\`\`\`

初始化后得到的 \`package.json\` 基本结构：

\`\`\`json
{
  "name": "my-first-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
\`\`\`

### 2. 运行脚本

有几种方式执行 Node.js 代码：

\`\`\`bash
# 方式一：直接执行文件
node index.js

# 方式二：使用 npm scripts（在 package.json 中定义）
# "scripts": { "start": "node index.js" }
npm start

# 方式三：使用 -e 执行单行代码
node -e "console.log('Hello')"

# 方式四：REPL 交互式环境
node
# > 1 + 2
# 3
\`\`\`

### 3. console 对象——不仅仅是 log

\`console\` 是 Node.js 的全局对象，提供了丰富的输出方法。它底层封装了 \`process.stdout\` 和 \`process.stderr\`。

#### 基础输出方法

| 方法 | 输出流 | 说明 |
| --- | --- | --- |
| \`console.log(...args)\` | stdout | 普通日志输出（最常用） |
| \`console.info(...args)\` | stdout | 信息级别输出（与 log 行为一致） |
| \`console.warn(...args)\` | stderr | 警告信息 |
| \`console.error(...args)\` | stderr | 错误信息 |
| \`console.debug(...args)\` | stdout | 调试信息（默认不显示，需 --inspect） |

#### 格式化输出

\`console.log\` 支持类似 C 语言 printf 的格式化占位符：

| 占位符 | 说明 |
| --- | --- |
| \`%s\` | 字符串 |
| \`%d\` 或 \`%i\` | 整数 |
| \`%f\` | 浮点数 |
| \`%j\` | JSON 格式 |
| \`%o\` | 对象（可展开） |
| \`%O\` | 对象（紧凑） |
| \`%%\` | 百分号本身 |

\`\`\`javascript
console.log("用户 %s 的年龄是 %d 岁", "小明", 20);
// 输出：用户 小明 的年龄是 20 岁
\`\`\`

#### 表格展示：console.table

对于数组或对象，\`console.table\` 以表格形式展示数据，非常直观：

\`\`\`javascript
const users = [
  { name: "小明", age: 20, score: 92 },
  { name: "小红", age: 22, score: 88 },
];
console.table(users);
\`\`\`

#### 计时器：console.time / console.timeEnd

测量代码执行时间：

\`\`\`javascript
console.time("运算耗时");
// 执行一些耗时操作
for (let i = 0; i < 1000000; i++) {}
console.timeEnd("运算耗时");
// 输出：运算耗时: 2.345ms
\`\`\`

#### 分组输出：console.group / console.groupEnd

将相关输出组织在一起，形成缩进层次：

\`\`\`javascript
console.group("用户信息");
console.log("姓名: 小明");
console.group("详细信息");
console.log("年龄: 20");
console.log("城市: 北京");
console.groupEnd();
console.groupEnd();
\`\`\`

#### 调用栈追踪：console.trace

输出当前位置的调用栈，常用于调试：

\`\`\`javascript
function a() { b(); }
function b() { c(); }
function c() { console.trace("追踪调用栈"); }
a();
\`\`\`

#### 断言：console.assert

当条件为 false 时输出错误信息：

\`\`\`javascript
console.assert(1 === 2, "1 不等于 2？这不可能！");
// 输出：Assertion failed: 1 不等于 2？这不可能！
\`\`\`

#### 计数器：console.count / console.countReset

统计某个标签被调用的次数：

\`\`\`javascript
console.count("循环");  // 循环: 1
console.count("循环");  // 循环: 2
console.countReset("循环");  // 重置
console.count("循环");  // 循环: 1
\`\`\`

### 4. __dirname 与 __filename

这两个是 CommonJS 模块中自动注入的变量：

| 变量 | 含义 | 示例 |
| --- | --- | --- |
| \`__dirname\` | 当前文件所在**目录**的绝对路径 | \`/home/user/project/src\` |
| \`__filename\` | 当前文件的绝对路径 | \`/home/user/project/src/app.js\` |

### 5. __dirname 与 process.cwd() 的区别

这是一个常见的混淆点：

| 方法 | 含义 | 何时变化 |
| --- | --- | --- |
| \`__dirname\` | 当前脚本文件所在目录 | **不会变**——文件在哪就是哪 |
| \`process.cwd()\` | 当前工作目录 | **会变**——取决于你从哪个目录执行 \`node\` |

\`\`\`javascript
// 假设你在 /home/user 目录下执行 node /home/user/project/app.js
// __dirname  → /home/user/project  （文件所在目录）
// process.cwd() → /home/user  （执行命令时所在的目录）
\`\`\`

### 6. process.exit

控制进程退出：

\`\`\`javascript
// 正常退出（退出码 0）
process.exit(0);

// 异常退出（退出码 1，表示错误）
process.exit(1);

// 不传参数等同于 process.exit(0)
process.exit();
\`\`\`

退出码约定：
- \`0\`：正常退出
- \`1\`：一般性错误
- \`2\`：使用方式错误（如参数错误）
- \`128 + 信号值\`：被信号终止

### 7. process.argv

\`process.argv\` 是一个包含命令行参数的数组：

\`\`\`javascript
// 执行 node app.js --name=test --port=3000
// process.argv[0] = '/usr/local/bin/node'  （node 可执行文件路径）
// process.argv[1] = '/path/to/app.js'       （脚本文件路径）
// process.argv[2] = '--name=test'           （用户参数）
// process.argv[3] = '--port=3000'           （用户参数）
\`\`\`

### 8. process.env

\`process.env\` 包含所有环境变量，常用于配置管理：

\`\`\`javascript
// 读取环境变量
const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 3000;
\`\`\``,
    code: `// ============================================================
// 第二章代码演示：第一个 Node.js 应用
// 展示 console 的各种方法、路径信息、命令行参数
// ============================================================

// ---- 1. console 基础输出方法 ----
console.log("========== 1. console 基础输出 ==========");
console.log("这是一条普通日志（log，输出到 stdout）");
console.info("这是一条信息（info，与 log 行为一致）");
console.warn("这是一条警告（warn，输出到 stderr）");
console.error("这是一条错误（error，输出到 stderr）");

// ---- 2. console 格式化输出 ----
console.log("\\n========== 2. 格式化输出 ==========");
// 使用占位符格式化输出
var name = "小明";
var age = 20;
var score = 95.5;
console.log("用户 %s 的年龄是 %d 岁，成绩是 %f 分", name, age, score);
// 使用 %j 输出 JSON 格式
var obj = { name: "小明", age: 20, hobbies: ["编程", "阅读"] };
console.log("对象 JSON: %j", obj);
// 使用 %o 输出可展开的对象
console.log("对象详情: %o", obj);

// ---- 3. console.table 表格展示 ----
console.log("\\n========== 3. console.table 表格展示 ==========");
// 展示数组对象
var students = [
  { 姓名: "小明", 年龄: 20, 成绩: 92, 城市: "北京" },
  { 姓名: "小红", 年龄: 22, 成绩: 88, 城市: "上海" },
  { 姓名: "小刚", 年龄: 19, 成绩: 95, 城市: "广州" },
  { 姓名: "小美", 年龄: 21, 成绩: 85, 城市: "深圳" },
];
console.log("学生成绩表:");
console.table(students);

// 展示单个对象（键值对表格）
console.log("\\n单条学生信息:");
console.table(students[0]);

// ---- 4. console.time / timeEnd 计时 ----
console.log("\\n========== 4. 计时功能 ==========");
// 测量一段代码的执行时间
console.time("循环耗时");
var sum = 0;
for (var i = 0; i < 1000000; i++) {
  sum += i;
}
console.timeEnd("循环耗时");
console.log("循环求和结果:", sum);

// 同时运行多个计时器
console.time("操作A");
console.time("操作B");
// 操作 A 模拟短时间
for (var j = 0; j < 500000; j++) { sum += j; }
console.timeEnd("操作A");
// 操作 B 模拟稍长时间
for (var k = 0; k < 1000000; k++) { sum += k; }
console.timeEnd("操作B");

// ---- 5. console.group 分组输出 ----
console.log("\\n========== 5. 分组输出 ==========");
console.group("用户信息模块");
console.log("模块加载完成");
console.group("用户列表");
console.log("用户 1: 小明");
console.log("用户 2: 小红");
console.groupEnd();
console.log("用户总数: 2");
console.groupEnd();

// ---- 6. console.trace 调用栈追踪 ----
console.log("\\n========== 6. 调用栈追踪 ==========");
function level3() {
  console.trace("当前调用栈:");
}
function level2() {
  level3();
}
function level1() {
  level2();
}
level1();

// ---- 7. console.assert 断言 ----
console.log("\\n========== 7. 断言 ==========");
console.assert(1 === 1, "这条不会显示（条件为 true）");
console.assert(1 === 2, "断言失败：1 不等于 2");
console.log("断言不会阻止代码继续执行");

// ---- 8. console.count 计数器 ----
console.log("\\n========== 8. 计数器 ==========");
console.count("请求");
console.count("请求");
console.count("请求");
console.log("请求计数器重置");
if (typeof console.countReset === "function") {
  console.countReset("请求");
}
console.count("请求");

// ---- 9. __dirname 与 __filename ----
console.log("\\n========== 9. 路径信息 ==========");
console.log("__dirname :", __dirname);
console.log("__filename:", __filename);

// ---- 10. process.cwd() 与 __dirname 的区别 ----
console.log("\\n========== 10. cwd() vs __dirname ==========");
console.log("__dirname     :", __dirname);
console.log("process.cwd() :", process.cwd());
console.log("说明：__dirname 是脚本所在目录，不会变");
console.log("      process.cwd() 是执行命令时的目录，可以通过 cd 改变");

// ---- 11. process.argv 命令行参数 ----
console.log("\\n========== 11. 命令行参数 ==========");
console.log("argv 数组长度:", process.argv.length);
console.log("argv[0] (node 路径):", process.argv[0]);
console.log("argv[1] (脚本路径):", process.argv[1]);
// 如果有额外参数，模拟解析
if (process.argv.length > 2) {
  console.log("额外参数:");
  for (var i = 2; i < process.argv.length; i++) {
    console.log("  argv[" + i + "]:", process.argv[i]);
  }
} else {
  console.log("（没有额外命令行参数）");
}

// 模拟命令行参数解析工具
console.log("\\n模拟参数解析:");
var args = process.argv.slice(2);
var config = {};
for (var i = 0; i < args.length; i++) {
  var arg = args[i];
  if (arg.startsWith("--")) {
    var parts = arg.slice(2).split("=");
    config[parts[0]] = parts[1] || true;
  }
}
console.log("解析结果:", JSON.stringify(config, null, 2));

// ---- 12. process.env 环境变量 ----
console.log("\\n========== 12. 环境变量 ==========");
console.log("NODE_ENV:", process.env.NODE_ENV || "(未设置，默认 development)");
console.log("HOME:", process.env.HOME || process.env.USERPROFILE || "(未知)");
console.log("PATH(前80字符):", (process.env.PATH || "").slice(0, 80) + "...");

// ---- 13. process.exit 退出码 ----
console.log("\\n========== 13. 退出码信息 ==========");
console.log("正常退出码: 0");
console.log("一般错误  : 1");
console.log("使用错误  : 2");
console.log("当前进程 PID:", process.pid);
// 注意：不会真的调用 process.exit()，否则演示会中断

// ---- 14. 综合示例：创建一个简单的命令行工具 ----
console.log("\\n========== 14. 综合示例 ==========");
console.log("假设这是一个命令行工具 cli-tool");
console.log("用法: node cli-tool.js --name=<名称> --verbose");
console.log("");

// 模拟解析参数
var simulatedArgs = ["--name=my-project", "--verbose", "--port=3000"];
var cliConfig = { verbose: false, port: 3000 };
for (var i = 0; i < simulatedArgs.length; i++) {
  var arg = simulatedArgs[i];
  if (arg === "--verbose") {
    cliConfig.verbose = true;
  } else if (arg.startsWith("--")) {
    var parts = arg.slice(2).split("=");
    cliConfig[parts[0]] = parts[1] || true;
  }
}

console.log("解析到的配置:");
console.table(cliConfig);

console.log("\\n项目名称:", cliConfig["name"] || "未指定");
console.log("端口号:", cliConfig.port);
console.log("详细模式:", cliConfig.verbose ? "开启" : "关闭");

// 进程退出事件
process.on("exit", function (code) {
  console.log("\\n[exit] 程序执行完毕，退出码:", code);
});`,
  },

  // =========================================================
  // 第三章：CommonJS 模块系统
  // =========================================================
  {
    id: "node-commonjs",
    icon: "📦",
    group: "快速入门",
    title: "CommonJS 模块系统",
    content: `## 为什么需要模块系统？

在没有模块系统的时代，所有 JavaScript 代码共享一个全局作用域。如果两个文件都定义了 \`var name\`，后加载的会覆盖先加载的，导致难以调试的 bug。

**模块系统的核心目标**：
1. **隔离作用域**：每个模块有自己的独立作用域，互不污染
2. **复用代码**：把功能封装成模块，在多个项目中复用
3. **依赖管理**：明确声明依赖关系，按需加载
4. **封装实现**：只暴露必要的 API，隐藏内部细节

## CommonJS 规范

Node.js 默认使用 CommonJS 模块规范。**每个 .js 文件就是一个独立的模块**，文件内的变量和函数默认是私有的。

### 三大核心 API

| API | 作用 | 说明 |
| --- | --- | --- |
| \`require(modulePath)\` | 导入模块 | 返回模块导出的对象（即 module.exports） |
| \`module.exports\` | 导出模块 | **真正决定导出内容**的对象，require 返回的就是它 |
| \`exports\` | 导出的快捷方式 | 初始时指向 module.exports，本质是引用 |

### require 的工作原理（五步详解）

当你调用 \`require('./math')\` 时，Node.js 内部经历以下步骤：

#### 步骤 1：路径解析（Resolution）

根据参数形式确定模块的绝对路径：

| 参数形式 | 分类 | 解析方式 |
| --- | --- | --- |
| \`require('fs')\` | 核心模块 | 直接返回内置模块，速度最快 |
| \`require('./utils')\` | 相对路径文件 | 以当前文件所在目录为起点拼接 |
| \`require('lodash')\` | 第三方包 | 从当前目录逐级向上查找 node_modules |

**核心模块优先级最高**。即使 node_modules 里有叫 fs 的文件夹，\`require('fs')\` 返回的仍是内置模块。

**node_modules 查找算法**：从当前文件目录开始，逐级向上查找 node_modules，直到根目录。例如在 \`/home/user/project/src/app.js\` 中 \`require('lodash')\`：

\`\`\`
① /home/user/project/src/node_modules/lodash/
② /home/user/project/node_modules/lodash/
③ /home/user/node_modules/lodash/
④ /home/node_modules/lodash/
⑤ /node_modules/lodash/
\`\`\`

#### 步骤 2：文件定位（File Location）

找到目标后，按顺序尝试扩展名补全：
1. 精确匹配文件名
2. .js（JavaScript 文件）
3. .json（JSON 文件，自动 JSON.parse）
4. .node（C++ 编译的二进制模块）

如果是目录，则查找 package.json 的 main 字段，或默认 index.js。

#### 步骤 3：包装（Wrapping）

Node.js 读取文件后，**不会直接执行**，而是将代码包裹在模块包装器函数中：

\`\`\`javascript
// 你的原始代码
function add(a, b) { return a + b; }
module.exports = { add };

// Node.js 实际执行的代码
(function(exports, require, module, __filename, __dirname) {
  function add(a, b) { return a + b; }
  module.exports = { add };
});
\`\`\`

这个包装器函数创建了新的作用域，实现了模块隔离。

#### 步骤 4：编译执行

根据扩展名使用不同编译器：
- .js → V8 编译执行
- .json → JSON.parse 后赋值给 module.exports
- .node → dlopen 加载 C++ 二进制模块

#### 步骤 5：缓存（Caching）

模块**第一次被加载时**会执行完整流程，执行后把 module.exports 缓存到 \`require.cache\` 中。之后再 require 同一个模块，直接返回缓存，**不会再次执行**。

\`\`\`javascript
// 第一次 require → 执行模块代码，缓存结果
const config1 = require('./config');
// 第二次 require → 命中缓存，直接返回
const config2 = require('./config');
console.log(config1 === config2); // true（同一个对象）
\`\`\`

### module.exports vs exports 陷阱

这是 CommonJS 最常见的陷阱。理解它需要明白 JavaScript 的**引用传递**：

\`\`\`javascript
// Node.js 内部初始化时：
// module.exports = {};  // 创建空对象
// exports = module.exports;  // exports 指向同一个对象
\`\`\`

**四种场景分析**：

\`\`\`javascript
// ✅ 场景 1：给 exports 添加属性（正确）
exports.add = function(a, b) { return a + b; };
exports.PI = 3.14;
// module.exports 和 exports 指向同一个对象，对象内容变了

// ✅ 场景 2：给 module.exports 赋新值（正确）
module.exports = function Calculator() { /* ... */ };
// module.exports 指向新对象，exports 还指向旧对象（没关系）

// ❌ 场景 3：给 exports 赋新值（错误！）
exports = { add: function(a, b) { return a + b; } };
// exports 指向了新对象，但 module.exports 还是旧空对象 {}
// require 返回的是 module.exports，所以拿到的是空对象！

// ✅ 场景 4：混合使用（正确）
module.exports = function main() { /* ... */ };
module.exports.version = '1.0.0';
\`\`\`

**终极口诀**：最终导出的是 \`module.exports\`。导出多个值用 \`exports.xxx\`，导出单个值用 \`module.exports = xxx\`。

### 模块缓存机制

缓存键是模块的**绝对路径**。利用缓存可以实现：
- **单例模式**：整个应用只有一个实例
- **热更新**：删除缓存后重新 require

\`\`\`javascript
// 热更新实现
function reloadModule(moduleName) {
  const modulePath = require.resolve(moduleName);
  delete require.cache[modulePath];
  return require(moduleName);
}
\`\`\`

### 循环依赖

当 A require B，B 又 require A 时，Node.js 返回当前已导出的部分（可能不完整）。因为模块加载时立即创建缓存条目（空 exports），然后执行代码。如果 B 又 require A，Node.js 发现 A 在缓存中但 loaded=false，直接返回不完整的 exports。

**三个实战建议**：
1. 尽量避免循环依赖，提取共享代码到第三个模块
2. 把关键导出放在模块顶部，确保另一方 require 时能拿到
3. 把 require 放在函数内部，延迟加载

### require.cache 与 require.resolve

\`\`\`javascript
// require.cache：查看所有已缓存模块
console.log(Object.keys(require.cache));

// require.resolve：只解析路径，不执行模块
const path = require.resolve('fs');
console.log(path); // 内置模块 fs 的路径

// 检查模块是否存在
try {
  require.resolve('some-module');
} catch (e) {
  console.log('模块不存在:', e.code); // MODULE_NOT_FOUND
}
\`\`\``,
    code: `// ============================================================
// 第三章代码演示：CommonJS 模块系统核心机制
// 在沙箱中用一个文件模拟 CommonJS 的完整机制
// ============================================================

// ---- 1. 基础模块导出与导入 ----
console.log("========== 1. 基础模块：数学工具 =====");

// 模拟 math.js 模块
// 真实写法：单独文件 math.js 中 module.exports = { add, ... }
var mathModule = {
  add: function (a, b) { return a + b; },
  subtract: function (a, b) { return a - b; },
  multiply: function (a, b) { return a * b; },
  divide: function (a, b) { return b !== 0 ? a / b : "除数不能为 0"; },
  PI: 3.14159265,
  E: 2.71828182,
};

// 模拟 require('./math') 的返回值
var math = mathModule;

console.log("add(3, 7) =", math.add(3, 7));
console.log("subtract(20, 8) =", math.subtract(20, 8));
console.log("multiply(6, 7) =", math.multiply(6, 7));
console.log("divide(10, 3) =", math.divide(10, 3));
console.log("PI =", math.PI);
console.log("圆面积(r=5):", (math.PI * 5 * 5).toFixed(2));

// ---- 2. 闭包实现私有状态 ----
console.log("\\n========== 2. 私有状态：计数器模块 =====");

// 模拟 counter.js 模块
// 利用闭包实现私有变量，外部无法直接访问 count
function createCounterModule() {
  var count = 0; // 模块级私有变量，外部无法访问

  return {
    increment: function () { count++; return count; },
    decrement: function () { count--; return count; },
    getValue: function () { return count; },
    reset: function () { count = 0; },
  };
}

var counter = createCounterModule();
console.log("初始值:", counter.getValue());
counter.increment(); counter.increment(); counter.increment();
console.log("加 3 次后:", counter.getValue());
counter.decrement();
console.log("减 1 次后:", counter.getValue());
counter.reset();
console.log("重置后:", counter.getValue());

// ---- 3. 导出构造函数 ----
console.log("\\n========== 3. 导出构造函数：Person 模块 =====");

// 模拟 person.js 中 module.exports = Person
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

var p1 = new Person("小明", 20);
var p2 = new Person("小红", 22);
console.log(p1.greet());
console.log(p2.greet());
p1.birthday().birthday();
console.log("过两次生日后:", p1.greet());
console.log("p1 instanceof Person:", p1 instanceof Person);

// ---- 4. exports vs module.exports 陷阱 ----
console.log("\\n========== 4. exports 陷阱演示 =====");

// 场景 1：给 exports 添加属性 ✅
console.log("--- 场景 1：给 exports 添加属性 ---");
var modExp1 = {};
var exp1 = modExp1;
exp1.add = function (a, b) { return a + b; };
exp1.PI = 3.14;
console.log("module.exports 有 add:", typeof modExp1.add); // function
console.log("module.exports 有 PI:", modExp1.PI); // 3.14
console.log("结果：✅ 正确");

// 场景 2：给 module.exports 赋新值 ✅
console.log("\\n--- 场景 2：给 module.exports 赋新值 ---");
var modExp2 = {};
var exp2 = modExp2;
modExp2 = function greet(name) { return "Hello, " + name + "!"; };
console.log("module.exports 是函数:", typeof modExp2); // function
console.log("exports 还是旧对象:", typeof exp2); // object
console.log("结果：✅ 正确，require 返回 greet 函数");

// 场景 3：给 exports 赋新值 ❌
console.log("\\n--- 场景 3：给 exports 赋新值（常见错误）---");
var modExp3 = {};
var exp3 = modExp3;
exp3 = { multiply: function (a, b) { return a * b; } };
console.log("exports 有 multiply:", typeof exp3.multiply); // function
console.log("module.exports 有 multiply:", typeof modExp3.multiply); // undefined
console.log("module.exports 是空对象:", JSON.stringify(modExp3)); // {}
console.log("结果：❌ 错误！require 返回 {}，导出全部丢失！");

// 场景 4：导出函数并附带属性 ✅
console.log("\\n--- 场景 4：混合使用（常见模式）---");
var myModule = {};
var exp4 = myModule;
exp4.helper = function () { return "辅助方法"; };
myModule = function main() { return "主功能"; };
myModule.helper = exp4.helper;
myModule.version = "1.0.0";
console.log("main():", myModule());
console.log("main.helper():", myModule.helper());
console.log("main.version:", myModule.version);
console.log("结果：✅ 正确，类似 express 的导出方式");

// ---- 5. require.cache 缓存与单例 ----
console.log("\\n========== 5. 缓存与单例模式 =====");

var fakeCache = {};
var loadCount = 0;

function loadDatabaseModule() {
  loadCount++;
  console.log("  [数据库模块被加载！第 " + loadCount + " 次初始化]");
  return {
    connectionId: Math.floor(Math.random() * 10000),
    loadedAt: new Date().toISOString(),
    query: function (sql) { return "执行: " + sql; },
  };
}

function fakeRequire(modulePath) {
  if (fakeCache[modulePath]) {
    console.log("  [命中缓存，直接返回]");
    return fakeCache[modulePath];
  }
  var mod = loadDatabaseModule();
  fakeCache[modulePath] = mod;
  return mod;
}

console.log("第一次 require('./database'):");
var db1 = fakeRequire("./database");
console.log("  connectionId:", db1.connectionId);

console.log("第二次 require('./database'):");
var db2 = fakeRequire("./database");
console.log("  connectionId:", db2.connectionId);

console.log("第三次 require('./database'):");
var db3 = fakeRequire("./database");
console.log("  connectionId:", db3.connectionId);

console.log("\\n模块实际初始化次数:", loadCount, "（只有第一次真正初始化）");
console.log("三次返回同一个对象:", db1 === db2 && db2 === db3);
console.log("这就是单例模式——所有 require 方共享同一个实例");

// 删除缓存，强制重新加载
console.log("\\n删除缓存后重新加载:");
delete fakeCache["./database"];
var db4 = fakeRequire("./database");
console.log("  connectionId:", db4.connectionId, "（新的连接 ID）");
console.log("db1 === db4:", db1 === db4, "（旧引用不受影响）");

// ---- 6. require.resolve 路径解析 ----
console.log("\\n========== 6. require.resolve 路径解析 =====");

var path = require("path");
var fs = require("fs");

// 模拟路径解析
function simulateResolve(requirePath) {
  if (!requirePath.startsWith("./") && !requirePath.startsWith("../") && !requirePath.startsWith("/")) {
    return "[内置模块] " + requirePath;
  }
  if (requirePath.startsWith("./") || requirePath.startsWith("../")) {
    return path.resolve(__dirname, requirePath);
  }
  return requirePath;
}

console.log("require('fs')        →", simulateResolve("fs"));
console.log("require('path')      →", simulateResolve("path"));
console.log("require('./utils')   →", simulateResolve("./utils"));
console.log("require('../config') →", simulateResolve("../config"));

console.log("\\n真实的 require.resolve:");
console.log("require.resolve('path') →", require.resolve("path"));
console.log("require.resolve('fs')   →", require.resolve("fs"));

// 找不到模块时抛出错误
try {
  require.resolve("nonexistent-module-xyz");
} catch (e) {
  console.log("require.resolve('不存在的模块') →", e.code);
}

// ---- 7. 循环依赖模拟 ----
console.log("\\n========== 7. 循环依赖模拟 =====");

function simulateCircleDependency() {
  var cache = {};

  function createModule(filename, factory) {
    var mod = { exports: {}, loaded: false, filename: filename };
    cache[filename] = mod;

    var requireFn = function (dep) {
      if (cache[dep] && !cache[dep].loaded) {
        console.log("  [" + dep + " 还在加载中，返回不完整导出]");
        return cache[dep].exports;
      }
      if (!cache[dep]) {
        return {};
      }
      return cache[dep].exports;
    };

    factory(mod.exports, requireFn, mod);
    mod.loaded = true;
    return mod;
  }

  // 先把 b.js 放入缓存（模拟 Node.js 在 require 时立即创建模块对象）
  var bModule = { exports: {}, loaded: false, filename: "b.js" };
  cache["b.js"] = bModule;

  var modA = createModule("a.js", function (exports, require) {
    console.log("a.js 开始执行");
    exports.done = false;
    console.log("a.js 触发 b.js 的加载...");

    // 模拟 b.js 的执行
    (function (exp, req) {
      console.log("b.js 开始执行");
      exp.done = false;
      var a = req("a.js"); // 循环依赖！拿到不完整的 a
      console.log("b.js 中 a.done =", a.done, "（a 还不完整！）");
      exp.done = true;
      console.log("b.js 执行完毕");
    })(bModule.exports, require);
    bModule.loaded = true;

    var b = require("b.js");
    console.log("a.js 中 b.done =", b.done);
    exports.done = true;
    console.log("a.js 执行完毕");
  });

  console.log("\\nA 模块最终导出:", JSON.stringify(modA.exports));
  console.log("B 模块最终导出:", JSON.stringify(bModule.exports));
  console.log("核心结论：b 拿到 a 时 a 还不完整，而 a 拿到 b 时 b 已完整");
}

simulateCircleDependency();

// ---- 8. node_modules 逐级查找算法 ----
console.log("\\n========== 8. node_modules 查找算法 =====");

function simulateNodeModulesLookup(startDir, moduleName) {
  var parts = startDir.split("/");
  var searchPaths = [];
  for (var i = parts.length; i >= 1; i--) {
    searchPaths.push(parts.slice(0, i).join("/") + "/node_modules/" + moduleName);
  }
  searchPaths.push("/node_modules/" + moduleName);
  return searchPaths;
}

var lookupPaths = simulateNodeModulesLookup("/home/user/project/src/utils", "lodash");
lookupPaths.forEach(function (p, i) {
  console.log("  " + (i + 1) + ". " + p);
});
console.log("Node.js 按顺序查找，找到即停止");

// ---- 9. 模块设计最佳实践 ----
console.log("\\n========== 9. 模块设计最佳实践 =====");

// ❌ 反模式：导出实例（共享状态）
function SharedLogger() {
  this.logs = [];
}
SharedLogger.prototype.log = function (msg) { this.logs.push(msg); };
SharedLogger.prototype.getLogs = function () { return this.logs; };
var shared = new SharedLogger();

// ✅ 正确：导出工厂函数
function createLogger() {
  var logs = [];
  return {
    log: function (msg) { logs.push(msg); },
    getLogs: function () { return logs; },
  };
}

console.log("--- 反模式：导出共享实例 ---");
shared.log("A 记录的日志");
shared.log("B 记录的日志");
console.log("所有调用方共享日志:", shared.getLogs());

console.log("\\n--- 推荐：导出工厂函数 ---");
var loggerA = createLogger();
var loggerB = createLogger();
loggerA.log("A 的日志");
loggerB.log("B 的日志");
console.log("loggerA 日志:", loggerA.getLogs());
console.log("loggerB 日志:", loggerB.getLogs());
console.log("两个实例独立:", loggerA !== loggerB);

console.log("\\n===== CommonJS 模块系统演示完成 =====");`,
  },

  // =========================================================
  // 第四章：ESM 模块系统
  // =========================================================
  {
    id: "node-esm",
    icon: "⚡",
    group: "快速入门",
    title: "ESM 模块系统",
    content: `## ES Modules 简介

ES Modules（ESM）是 ECMAScript 官方标准化的模块系统，从 ES2015（ES6）开始成为 JavaScript 语言标准的一部分。与 CommonJS 不同，ESM 是**静态的**——模块的导入导出在编译时就能确定，这使得打包工具可以进行 tree-shaking（移除未使用的代码）。

### 启用 ESM 的三种方式

在 Node.js 中启用 ESM：

1. **package.json 中设置 \`"type": "module"\`**（推荐，整个包都使用 ESM）
2. 使用 **.mjs** 扩展名（无论 package.json 怎么设置，.mjs 永远是 ESM）
3. 使用 **.cjs** 扩展名强制 CommonJS（在 type: "module" 的包中仍可用）

### ESM 导出语法

\`\`\`javascript
// ===== 命名导出（边定义边导出）=====
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }

// ===== 导出列表（统一导出）=====
const version = '1.0.0';
const name = 'my-lib';
export { version, name };

// ===== 重命名导出 =====
export { version as libVersion, name as libName };

// ===== 默认导出（每个模块只能有一个）=====
export default function main() { /* ... */ }
// 或
export default class App { /* ... */ }

// ===== 重新导出（从其他模块转发）=====
export { default as App } from './App.js';
export * from './utils.js';
\`\`\`

### ESM 导入语法

\`\`\`javascript
// 1. 命名导入
import { PI, add } from './math.js';

// 2. 默认导入
import Calculator from './math.js';

// 3. 混合导入
import Calculator, { PI, add } from './math.js';

// 4. 命名空间导入（全量导入）
import * as math from './math.js';
console.log(math.PI, math.add(1, 2));

// 5. 仅执行副作用（不导入任何内容）
import './init.js';

// 6. 动态导入（返回 Promise，可在任何地方使用）
const module = await import('./math.js');
\`\`\`

### ESM vs CommonJS 对比

| 特性 | CommonJS (CJS) | ES Modules (ESM) |
| --- | --- | --- |
| **语法** | \`require()\` / \`module.exports\` | \`import\` / \`export\` |
| **加载时机** | 运行时，可在条件/循环中调用 | 编译时静态分析，import 必须在顶层 |
| **加载方式** | 同步阻塞 | 异步加载 |
| **this 指向** | 指向 module.exports（初始 {}） | undefined |
| **顶层 await** | 不支持 | 支持 |
| **__dirname / __filename** | 直接可用 | 需要 import.meta.url 转换 |
| **扩展名** | 可省略（.js/.json/.node） | 必须写完整 |
| **循环依赖** | 返回不完整对象 | 活绑定（变量引用，实时更新） |
| **tree-shaking** | 不支持 | 支持（打包时可移除未使用代码） |
| **JSON 导入** | require('./data.json') | 需要 import assertion |

### ESM 的"活绑定"机制

这是 ESM 与 CJS 最重要的区别之一。ESM 的导入是**活绑定**——导入的变量是导出的**引用**，当导出值改变时，导入方也会看到新值：

\`\`\`javascript
// counter.mjs
export let count = 0;
export function increment() { count++; }

// app.mjs
import { count, increment } from './counter.mjs';
console.log(count); // 0
increment();
console.log(count); // 1（活绑定，看到了变化！）
\`\`\`

而在 CommonJS 中，require 拿到的是值的**副本**：

\`\`\`javascript
// counter.js
let count = 0;
module.exports = {
  get count() { return count; },  // 需要用 getter 才能实现类似效果
  increment() { count++; }
};
\`\`\`

### import.meta —— ESM 中的元数据

ESM 中没有 \`__dirname\` 和 \`__filename\`，用 \`import.meta\` 代替：

\`\`\`javascript
// import.meta.url 是当前模块的 URL（file:// 协议）
console.log(import.meta.url);
// 输出: file:///home/user/project/app.mjs

// 替代 __dirname 和 __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
\`\`\`

### 动态 import()

ESM 支持动态导入，返回 Promise。这在按需加载、条件加载等场景中非常有用：

\`\`\`javascript
// 条件加载
if (condition) {
  const module = await import('./special-module.js');
  module.doSomething();
}

// 按需加载（懒加载）
button.addEventListener('click', async () => {
  const { default: Chart } = await import('./chart.js');
  new Chart().render();
});

// 错误处理
try {
  const module = await import('./might-not-exist.js');
} catch (err) {
  console.log('模块加载失败:', err.message);
}
\`\`\`

### ESM 与 CommonJS 互操作

| 场景 | 是否支持 | 说明 |
| --- | --- | --- |
| ESM 中导入 CJS（默认导入） | ✅ | \`import cjs from './mod.cjs'\` → 拿到 module.exports |
| ESM 中导入 CJS（命名导入） | ✅ | \`import { method } from './mod.cjs'\` → 自动解构 |
| CJS 中导入 ESM（动态 import） | ✅ | \`const esm = await import('./mod.mjs')\` |
| CJS 中 require ESM | ❌ | 不能用 require 加载 ESM 模块 |

### package.json 中的 "type" 字段

\`\`\`json
{
  "type": "module"   // 整个包下 .js 文件默认使用 ESM
}
\`\`\`

设置后：
- .js 文件 → 默认 ESM
- .cjs 文件 → 强制 CommonJS
- .mjs 文件 → 强制 ESM

不设置 \`"type"\` 或设置为 \`"commonjs"\` 时：
- .js 文件 → 默认 CommonJS
- .mjs 文件 → 强制 ESM
- .cjs 文件 → 强制 CommonJS

### 顶层 await

ESM 模块支持在模块顶层直接使用 await（不需要 async 函数包裹）：

\`\`\`javascript
// config.mjs
import fs from 'fs/promises';
const configData = await fs.readFile('./config.json', 'utf8');
export const config = JSON.parse(configData);
\`\`\`

这大大简化了需要在模块初始化时进行异步操作的场景。但注意：**导入顶层 await 模块的模块，会等待它完成后再执行**。`,
    code: `// ============================================================
// 第四章代码演示：ESM 模块系统概念
// 在 CommonJS 沙箱中用 require 模拟 ESM 的核心概念
// ============================================================

// ---- 1. 模拟 ESM 命名导出与导入 ----
console.log("========== 1. 模拟 ESM 命名导出 =====");

// 模拟 math.mjs 中的 ESM 导出
// 真实 ESM: export const PI = 3.14159;
//           export function add(a, b) { return a + b; }
var mathModule = {
  PI: 3.14159,
  E: 2.71828,
  add: function (a, b) { return a + b; },
  subtract: function (a, b) { return a - b; },
  multiply: function (a, b) { return a * b; },
  divide: function (a, b) { return b !== 0 ? a / b : "错误"; },
};

// 模拟 ESM 命名导入
// 真实 ESM: import { PI, add, multiply } from './math.mjs';
var PI_esm = mathModule.PI;
var add_esm = mathModule.add;
var multiply_esm = mathModule.multiply;

console.log("PI =", PI_esm);
console.log("add(3, 7) =", add_esm(3, 7));
console.log("multiply(6, 7) =", multiply_esm(6, 7));

// ---- 2. 模拟 ESM 默认导出 ----
console.log("\\n========== 2. 模拟 ESM 默认导出 =====");

// 模拟 calculator.mjs 中的默认导出
// 真实 ESM: export default class Calculator { ... }
Calculator = function () {
  this.result = 0;
};
Calculator.prototype.add = function (n) { this.result += n; return this; };
Calculator.prototype.subtract = function (n) { this.result -= n; return this; };
Calculator.prototype.getValue = function () { return this.result; };
Calculator.prototype.reset = function () { this.result = 0; return this; };

// 模拟 ESM 默认导入
// 真实 ESM: import Calculator from './calculator.mjs';
var calc = new Calculator();
calc.add(10).add(5).subtract(3);
console.log("Calculator 计算结果:", calc.getValue());

// ---- 3. 模拟 ESM 命名空间导入 ----
console.log("\\n========== 3. 模拟 ESM 命名空间导入 =====");

// 模拟 utils.mjs 导出多个值
// 真实 ESM: export const version = '1.0.0';
//           export function formatDate(d) { ... }
//           export function capitalize(s) { ... }
var utilsModule = {
  version: "1.0.0",
  formatDate: function (date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  },
  capitalize: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  truncate: function (str, len) {
    return str.length > len ? str.slice(0, len) + "..." : str;
  },
};

// 模拟 ESM 命名空间导入
// 真实 ESM: import * as utils from './utils.mjs';
var utils = utilsModule;

console.log("版本:", utils.version);
console.log("格式化日期:", utils.formatDate(new Date()));
console.log("首字母大写:", utils.capitalize("hello"));
console.log("截断文本:", utils.truncate("这是一段很长的文本内容", 8));

// ---- 4. 模拟 ESM 活绑定（Live Binding） ----
console.log("\\n========== 4. 模拟 ESM 活绑定 =====");

// ESM 的活绑定：导入的变量是导出的引用
// 当导出值改变时，导入方也会看到新值
// 在 CommonJS 中，我们需要用 getter 来模拟

var counterState = { count: 0 };
var counterModule = {
  // 使用 getter 模拟活绑定
  get count() { return counterState.count; },
  increment: function () { counterState.count++; },
  decrement: function () { counterState.count--; },
  reset: function () { counterState.count = 0; },
};

// 模拟 ESM 导入
// 真实 ESM: import { count, increment } from './counter.mjs';
var count_accessor = counterModule.count;
console.log("初始 count:", count_accessor); // 0
counterModule.increment();
counterModule.increment();
console.log("两次 increment 后 count:", counterModule.count); // 2
console.log("这就是活绑定——导入方看到的是实时值");

// 对比 CommonJS 的值拷贝
var cjsCopy = counterModule.count; // 2（此时的值拷贝）
counterModule.increment();
console.log("CJS 值拷贝:", cjsCopy, "（还是 2，没有更新）");
console.log("ESM 活绑定:", counterModule.count, "（3，实时更新）");

// ---- 5. 模拟动态 import() ----
console.log("\\n========== 5. 模拟动态 import() =====");

// 动态 import() 返回 Promise，可以在任何地方使用
// 真实 ESM: const module = await import('./math.mjs');

function dynamicImport(moduleName) {
  return new Promise(function (resolve) {
    // 模拟异步加载模块
    var modules = {
      "./math.mjs": mathModule,
      "./utils.mjs": utilsModule,
      "./counter.mjs": counterModule,
    };
    // 模拟短暂延迟
    setTimeout(function () {
      resolve(modules[moduleName] || null);
    }, 50);
  });
}

console.log("开始动态导入...");
dynamicImport("./math.mjs").then(function (mod) {
  console.log("动态导入成功！");
  console.log("  PI =", mod.PI);
  console.log("  add(10, 20) =", mod.add(10, 20));
});

// 模拟条件加载
console.log("\\n条件加载示例:");
var featureEnabled = true;
if (featureEnabled) {
  dynamicImport("./utils.mjs").then(function (mod) {
    console.log("  条件加载 utils.mjs 成功");
    console.log("  version:", mod.version);
  });
}

// 模拟错误处理
console.log("\\n错误处理示例:");
dynamicImport("./not-exist.mjs").then(function (mod) {
  if (mod === null) {
    console.log("  模块不存在，使用降级方案");
  }
});

// ---- 6. import.meta 模拟 ----
console.log("\\n========== 6. import.meta 模拟 =====");

var path = require("path");

// 在 ESM 中，import.meta.url 是当前模块的 file:// URL
// 在 CommonJS 中，我们使用 __filename 和 __dirname
console.log("CommonJS __filename:", __filename);
console.log("CommonJS __dirname:", __dirname);

// 模拟 ESM 的方式获取 __dirname
function simulateImportMetaUrl(filePath) {
  return "file://" + filePath;
}

function simulateFileURLToPath(url) {
  return url.replace("file://", "");
}

var metaUrl = simulateImportMetaUrl(__filename);
console.log("ESM import.meta.url:", metaUrl);
console.log("ESM __filename:", simulateFileURLToPath(metaUrl));

// ---- 7. ESM 重导出模拟 ----
console.log("\\n========== 7. 模拟 ESM 重导出 =====");

// 模拟一个聚合模块，把多个模块的导出聚合在一起
// 真实 ESM:
//   export { PI, add } from './math.mjs';
//   export { formatDate } from './utils.mjs';
//   export { default as Calculator } from './calculator.mjs';

var aggregateModule = {
  // 从 math 模块转发的导出
  PI: mathModule.PI,
  add: mathModule.add,
  // 从 utils 模块转发的导出
  formatDate: utilsModule.formatDate,
  // 默认导出
  Calculator: Calculator,
};

console.log("聚合模块导出:");
console.log("  PI:", aggregateModule.PI);
console.log("  add(1, 2):", aggregateModule.add(1, 2));
console.log("  formatDate:", aggregateModule.formatDate(new Date()));

// ---- 8. ESM 与 CJS 互操作模拟 ----
console.log("\\n========== 8. ESM 与 CJS 互操作 =====");

// 模拟 CJS 模块
// module.exports = { name: 'cjs-module', version: '1.0.0' };
var cjsModule = { name: "cjs-module", version: "1.0.0" };

// 模拟 ESM 中导入 CJS 模块
// ESM 默认导入：import cjs from './mod.cjs' → 拿到 module.exports
var cjsDefault = cjsModule;
console.log("ESM 默认导入 CJS:", cjsDefault.name);

// ESM 命名导入 CJS：import { name, version } from './mod.cjs'
// Node.js 会自动解构 module.exports
var cjsName = cjsModule.name;
var cjsVersion = cjsModule.version;
console.log("ESM 命名导入 CJS:", cjsName, cjsVersion);

// 模拟 CJS 中动态导入 ESM
// 这是 CJS 中使用 ESM 的唯一方式
console.log("\\nCJS 中动态导入 ESM:");
dynamicImport("./math.mjs").then(function (esmMod) {
  console.log("  CJS 成功导入 ESM 模块");
  console.log("  PI =", esmMod.PI);
});

// ---- 9. package.json type 字段模拟 ----
console.log("\\n========== 9. package.json type 字段 =====");

var fs = require("fs");
var path = require("path");

// 读取当前项目的 package.json 查看 type 字段
var pkgPath = path.join(process.cwd(), "package.json");
try {
  var pkgContent = fs.readFileSync(pkgPath, "utf8");
  var pkg = JSON.parse(pkgContent);
  var type = pkg.type || "commonjs（默认）";
  console.log("package.json type 字段:", type);
  console.log("当前模块系统:", type === "module" ? "ESM" : "CommonJS（默认）");
} catch (e) {
  console.log("无法读取 package.json:", e.message);
  console.log("默认模块系统: CommonJS");
}

// 解释 .mjs / .cjs 扩展名
console.log("\\n.mjs 扩展名：始终是 ESM（无论 package.json type 设置）");
console.log(".cjs 扩展名：始终是 CommonJS（无论 package.json type 设置）");

// ---- 10. 模块系统总结对比 ----
console.log("\\n========== 10. ESM vs CommonJS 总结 =====");

var comparison = [
  { 特性: "语法", CommonJS: "require / module.exports", ESM: "import / export" },
  { 特性: "加载时机", CommonJS: "运行时", ESM: "编译时静态分析" },
  { 特性: "加载方式", CommonJS: "同步阻塞", ESM: "异步加载" },
  { 特性: "this 指向", CommonJS: "module.exports", ESM: "undefined" },
  { 特性: "顶层 await", CommonJS: "不支持", ESM: "支持" },
  { 特性: "扩展名", CommonJS: "可省略", ESM: "必须写完整" },
  { 特性: "循环依赖", CommonJS: "返回不完整对象", ESM: "活绑定（引用）" },
  { 特性: "tree-shaking", CommonJS: "不支持", ESM: "支持" },
];
console.table(comparison);

console.log("\\n===== ESM 模块系统演示完成 =====");`,
  },

  // =========================================================
  // 第五章：package.json 详解
  // =========================================================
  {
    id: "node-package-json",
    icon: "📋",
    group: "快速入门",
    title: "package.json 详解",
    content: `## package.json 是什么？

\`package.json\` 是每个 Node.js 项目的**核心配置文件**。它位于项目根目录，包含了项目的元数据、依赖关系、脚本命令等信息。npm（Node Package Manager）依赖它来管理项目的依赖和运行脚本。

一个最小的 package.json 只需要 \`name\` 和 \`version\` 两个字段。

### 核心字段详解

#### name（必填）
包名，发布到 npm 注册表时的唯一标识。规则：
- 必须小写
- 只能包含连字符（-）和下划线（_）
- 长度不超过 214 个字符
- 不能以点（.）或下划线（_）开头

\`\`\`json
{ "name": "my-awesome-project" }
\`\`\`

#### version（必填）
遵循**语义化版本号（SemVer）**规范：\`主版本号.次版本号.修订号\`

| 版本号位置 | 含义 | 何时递增 |
| --- | --- | --- |
| 主版本号（Major） | 不兼容的 API 修改 | 1.0.0 → 2.0.0 |
| 次版本号（Minor） | 向下兼容的功能新增 | 1.0.0 → 1.1.0 |
| 修订号（Patch） | 向下兼容的问题修正 | 1.0.0 → 1.0.1 |

预发布版本可以加后缀：\`1.0.0-alpha.1\`、\`2.0.0-beta.3\`、\`3.0.0-rc.1\`

#### description
包的简短描述，显示在 npm 搜索结果中。

#### main
包的入口文件。当别人 \`require('my-package')\` 时，加载的文件。

\`\`\`json
{ "main": "dist/index.js" }
\`\`\`

默认值为 \`index.js\`，不设置时 Node.js 会尝试加载根目录的 index.js。

#### scripts
定义可以通过 npm run 执行的脚本命令。这是最重要的字段之一：

\`\`\`json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production",
    "test": "jest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
\`\`\`

**内置脚本名**（不需要 npm run 前缀，直接用 npm test 等）：
- \`npm start\` → 执行 scripts.start
- \`npm test\` → 执行 scripts.test
- \`npm restart\` → 执行 scripts.restart
- \`npm stop\` → 执行 scripts.stop

#### dependencies
项目运行时需要的依赖（生产依赖）：

\`\`\`json
{
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "~4.17.21",
    "axios": "1.6.0"
  }
}
\`\`\`

版本号前的符号含义：
- \`^\`：兼容主版本（^4.18.2 = >=4.18.2 <5.0.0）
- \`~\`：兼容次版本（~4.17.21 = >=4.17.21 <4.18.0）
- \`*\`：任意版本
- 无符号：精确版本

#### devDependencies
仅在开发时需要的依赖（测试框架、构建工具、代码检查等）：

\`\`\`json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
\`\`\`

\`npm install --production\` 不会安装 devDependencies。

#### peerDependencies
对等依赖——告诉使用者"你需要安装以下依赖"。常用于插件开发：

\`\`\`json
{
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
\`\`\`

npm 7+ 会自动安装 peerDependencies，遇到冲突会报错终止。

#### engines
指定项目需要的 Node.js 和 npm 版本：

\`\`\`json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
\`\`\`

#### private
设为 true 时，防止意外发布到 npm 注册表：

\`\`\`json
{ "private": true }
\`\`\`

#### exports（Node.js 12.7+）
比 main 更强大的模块封装，精确控制包的哪些部分可被访问：

\`\`\`json
{
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
    "./package.json": "./package.json"
  }
}
\`\`\`

一旦定义 exports，外部就不能 \`require('my-package/dist/internal.js')\`——只有 exports 中声明的路径才能被访问。

**条件导出**（同一个包在 ESM 和 CJS 中加载不同文件）：

\`\`\`json
{
  "exports": {
    ".": {
      "import": "./esm/index.mjs",
      "require": "./cjs/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
\`\`\`

#### files
指定发布到 npm 时包含的文件（白名单模式）：

\`\`\`json
{
  "files": ["dist/", "README.md", "LICENSE"]
}
\`\`\`

#### type
指定模块系统："module" 表示 ESM，"commonjs" 表示 CommonJS。

#### workspaces
Monorepo 支持，定义工作区：

\`\`\`json
{
  "workspaces": ["packages/*"]
}
\`\`\`

### 语义化版本号（SemVer）深入

\`\`\`
版本号格式：主版本号.次版本号.修订号[-预发布标签]

1.0.0     → 正式发布
1.0.1     → 修复 bug（修订号递增）
1.1.0     → 新增功能（次版本号递增）
2.0.0     → 不兼容的 API 变更（主版本号递增）
1.0.0-alpha.1  → 内部测试版
1.0.0-beta.1   → 公开测试版
1.0.0-rc.1     → 发布候选版
\`\`\`

### package-lock.json 的作用

\`package-lock.json\` 是 npm 自动生成的锁文件，它**精确记录**了安装的每个包的版本和依赖树。它的作用是：

1. **确保一致性**：团队成员或 CI/CD 环境安装的依赖版本完全一致
2. **加速安装**：npm 可以跳过依赖解析，直接从 lock 文件读取版本
3. **安全性**：锁定版本，防止依赖更新的恶意代码被引入

**重要规则**：package-lock.json **必须提交到 Git 仓库**。

### npm install 的工作原理

\`\`\`
npm install 的执行流程：

1. 读取 package.json，获取依赖列表
2. 检查 node_modules 和 package-lock.json
3. 如果 lock 文件存在，按 lock 文件安装（精确版本）
4. 如果 lock 文件不存在，解析版本范围，生成依赖树
5. 下载依赖包到 node_modules
6. 生成/更新 package-lock.json
7. 执行依赖的 postinstall 脚本（如果有）
\`\`\`

### 其他重要字段

| 字段 | 说明 |
| --- | --- |
| \`license\` | 开源许可证（MIT、ISC、Apache-2.0 等） |
| \`author\` | 作者信息 |
| \`contributors\` | 贡献者列表 |
| \`keywords\` | 关键词数组，用于 npm 搜索 |
| \`repository\` | 代码仓库地址 |
| \`bugs\` | 问题追踪地址 |
| \`homepage\` | 项目主页 |
| \`browserslist\` | 目标浏览器配置（给 Babel 等工具使用） |
| \`sideEffects\` | 是否包含副作用（给 Webpack tree-shaking 使用） |
| \`overrides\` | 覆盖嵌套依赖的版本（npm 8.3+） |`,
    code: `// ============================================================
// 第五章代码演示：package.json 详解
// 用 fs 读取和解析 package.json，展示各字段含义
// ============================================================

var fs = require("fs");
var path = require("path");
var os = require("os");

// ---- 1. 读取项目的 package.json ----
console.log("========== 1. 读取 package.json ==========");

var pkgPath = path.join(process.cwd(), "package.json");
var pkg = null;

try {
  var pkgContent = fs.readFileSync(pkgPath, "utf8");
  pkg = JSON.parse(pkgContent);
  console.log("package.json 读取成功！");
  console.log("文件路径:", pkgPath);
} catch (e) {
  // 如果项目中没有 package.json，创建一个模拟的用于演示
  console.log("项目中没有 package.json，使用模拟数据演示");
  console.log("实际路径:", pkgPath);
  pkg = {
    name: "my-awesome-project",
    version: "1.0.0",
    description: "一个演示项目",
    main: "dist/index.js",
    type: "commonjs",
    private: true,
    scripts: {
      start: "node index.js",
      dev: "nodemon index.js",
      build: "webpack --mode production",
      test: "jest --coverage",
      lint: "eslint src/",
    },
    dependencies: {
      express: "^4.18.2",
      lodash: "~4.17.21",
      axios: "1.6.0",
    },
    devDependencies: {
      jest: "^29.0.0",
      eslint: "^8.0.0",
      typescript: "^5.0.0",
    },
    keywords: ["nodejs", "demo", "tutorial"],
    author: "开发者",
    license: "MIT",
    engines: {
      node: ">=18.0.0",
      npm: ">=9.0.0",
    },
  };
}

// ---- 2. 基本信息字段 ----
console.log("\\n========== 2. 基本信息 ==========");
console.log("名称 (name)       :", pkg.name || "(未设置)");
console.log("版本 (version)    :", pkg.version || "(未设置)");
console.log("描述 (description):", pkg.description || "(未设置)");
console.log("许可证 (license)  :", pkg.license || "(未设置)");
console.log("作者 (author)     :", typeof pkg.author === "object" ? pkg.author.name : (pkg.author || "(未设置)"));
console.log("私有 (private)    :", pkg.private ? "是（防止意外发布）" : "否");

// ---- 3. 入口文件 ----
console.log("\\n========== 3. 入口文件 ==========");
console.log("main 字段:", pkg.main || "index.js（默认）");
console.log("说明：别人 require('" + (pkg.name || "my-package") + "') 时会加载这个文件");

// ---- 4. 模块系统类型 ----
console.log("\\n========== 4. 模块系统 ==========");
var type = pkg.type || "commonjs（默认）";
console.log("type 字段:", type);
if (type === "module") {
  console.log("本项目使用 ESM 模块系统");
  console.log("  .js 文件 → ESM");
  console.log("  .cjs 文件 → 强制 CommonJS");
  console.log("  .mjs 文件 → 强制 ESM");
} else {
  console.log("本项目使用 CommonJS 模块系统");
  console.log("  .js 文件 → CommonJS");
  console.log("  .mjs 文件 → 强制 ESM");
  console.log("  .cjs 文件 → 强制 CommonJS");
}

// ---- 5. scripts 脚本命令 ----
console.log("\\n========== 5. scripts 脚本命令 ==========");
if (pkg.scripts && Object.keys(pkg.scripts).length > 0) {
  console.log("可用的 npm scripts:");
  console.table(
    Object.keys(pkg.scripts).map(function (key) {
      return { 命令: "npm run " + key, 执行的脚本: pkg.scripts[key] };
    })
  );
  console.log("\\n内置快捷命令（不需要 npm run 前缀）:");
  console.log("  npm start  →", pkg.scripts.start || "(未设置)");
  console.log("  npm test   →", pkg.scripts.test || "(未设置)");
} else {
  console.log("（没有定义 scripts）");
}

// ---- 6. 依赖解析 ----
console.log("\\n========== 6. 依赖列表 ==========");

// 生产依赖
console.log("--- 生产依赖 (dependencies) ---");
if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
  var depList = Object.keys(pkg.dependencies).map(function (name) {
    var version = pkg.dependencies[name];
    var rangeType = "精确版本";
    if (version.startsWith("^")) rangeType = "兼容主版本 (^)";
    else if (version.startsWith("~")) rangeType = "兼容次版本 (~)";
    else if (version === "*") rangeType = "任意版本";
    return { 包名: name, 版本范围: version, 版本策略: rangeType };
  });
  console.table(depList);
} else {
  console.log("（没有生产依赖）");
}

// 开发依赖
console.log("\\n--- 开发依赖 (devDependencies) ---");
if (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0) {
  var devDepList = Object.keys(pkg.devDependencies).map(function (name) {
    return { 包名: name, 版本范围: pkg.devDependencies[name] };
  });
  console.table(devDepList);
  console.log("提示：npm install --production 不会安装这些依赖");
} else {
  console.log("（没有开发依赖）");
}

// ---- 7. engines 字段 ----
console.log("\\n========== 7. 运行环境要求 ==========");
if (pkg.engines) {
  console.log("Node.js 最低版本:", pkg.engines.node || "未指定");
  console.log("npm 最低版本:", pkg.engines.npm || "未指定");
} else {
  console.log("（未设置 engines 字段）");
}

// ---- 8. 关键词与其他元数据 ----
console.log("\\n========== 8. 其他元数据 ==========");
if (pkg.keywords) {
  console.log("关键词:", pkg.keywords.join(", "));
}
if (pkg.repository) {
  var repo = typeof pkg.repository === "object" ? pkg.repository.url : pkg.repository;
  console.log("代码仓库:", repo);
}
if (pkg.bugs) {
  var bugs = typeof pkg.bugs === "object" ? pkg.bugs.url : pkg.bugs;
  console.log("问题追踪:", bugs);
}
if (pkg.homepage) {
  console.log("项目主页:", pkg.homepage);
}

// ---- 9. 语义化版本号解析 ----
console.log("\\n========== 9. 语义化版本号 (SemVer) 解析 =====");

function parseSemVer(version) {
  // 去掉前缀符号 ^ ~ = > < >= <=
  var clean = version.replace(/^[\\^~=> <]+/, "");
  var parts = clean.split(".");
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
    raw: version,
  };
}

// 解析当前项目的版本号
var currentVer = parseSemVer(pkg.version || "1.0.0");
console.log("当前版本:", pkg.version);
console.log("  主版本号 (Major):", currentVer.major);
console.log("  次版本号 (Minor):", currentVer.minor);
console.log("  修订号 (Patch):", currentVer.patch);

// 版本升级演示
console.log("\\n版本升级规则:");
console.log("  修复 bug    : " + currentVer.major + "." + currentVer.minor + "." + (currentVer.patch + 1));
console.log("  新增功能    : " + currentVer.major + "." + (currentVer.minor + 1) + ".0");
console.log("  不兼容变更  : " + (currentVer.major + 1) + ".0.0");

// ---- 10. 版本范围符号解析 ----
console.log("\\n========== 10. 版本范围符号 ==========");

var versionExamples = [
  { 符号: "^4.18.2", 含义: ">=4.18.2 且 <5.0.0", 说明: "兼容主版本，允许次版本和修订号更新" },
  { 符号: "~4.17.21", 含义: ">=4.17.21 且 <4.18.0", 说明: "兼容次版本，只允许修订号更新" },
  { 符号: "4.18.2", 含义: "=4.18.2", 说明: "精确版本，不允许任何更新" },
  { 符号: "*", 含义: "任意版本", 说明: "不推荐，版本不可控" },
  { 符号: ">=4.0.0", 含义: ">=4.0.0", 说明: "大于等于指定版本" },
  { 符号: "4.x", 含义: ">=4.0.0 且 <5.0.0", 说明: "与 ^4.0.0 相同" },
];
console.table(versionExamples);

// ---- 11. package-lock.json 说明 ----
console.log("\\n========== 11. package-lock.json =====");

var lockPath = path.join(process.cwd(), "package-lock.json");
var lockExists = fs.existsSync(lockPath);
console.log("package-lock.json 存在:", lockExists ? "是" : "否");
console.log("作用:");
console.log("  1. 锁定精确版本，确保团队依赖一致");
console.log("  2. 加速 npm install（跳过依赖解析）");
console.log("  3. 防止恶意依赖版本更新被引入");
console.log("重要：package-lock.json 必须提交到 Git 仓库");

// ---- 12. npm install 工作流程 ----
console.log("\\n========== 12. npm install 工作流程 =====");

var steps = [
  "1. 读取 package.json 获取依赖列表",
  "2. 检查 node_modules 是否存在",
  "3. 如果 package-lock.json 存在，按锁文件安装（精确版本）",
  "4. 如果锁文件不存在，解析版本范围，生成依赖树",
  "5. 下载依赖包到 node_modules 目录",
  "6. 生成 / 更新 package-lock.json",
  "7. 执行依赖的 postinstall 脚本（如果有）",
];
steps.forEach(function (step) {
  console.log("  " + step);
});

// ---- 13. 创建项目配置报告 ----
console.log("\\n========== 13. 项目配置报告 =====");

var report = {
  项目名称: pkg.name || "未设置",
  版本号: pkg.version || "未设置",
  入口文件: pkg.main || "index.js",
  模块系统: pkg.type || "commonjs",
  私有项目: pkg.private ? "是" : "否",
  生产依赖数: pkg.dependencies ? Object.keys(pkg.dependencies).length : 0,
  开发依赖数: pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0,
  脚本命令数: pkg.scripts ? Object.keys(pkg.scripts).length : 0,
  许可证: pkg.license || "未设置",
};

console.log("===== 项目配置摘要 =====");
for (var key in report) {
  console.log("  " + key + "：".padEnd(14) + report[key]);
}

// ---- 14. exports 字段说明 ----
console.log("\\n========== 14. exports 字段 =====");
if (pkg.exports) {
  console.log("exports 字段已设置:");
  console.log(JSON.stringify(pkg.exports, null, 2));
} else {
  console.log("exports 字段未设置（使用 main 字段作为入口）");
}
console.log("\\nexports 的优势:");
console.log("  - 精确控制包的哪些部分可被外部访问");
console.log("  - 支持条件导出（ESM/CJS 加载不同文件）");
console.log("  - 防止外部代码绕过 API 直接访问内部实现");
console.log("  - 一旦定义，只有 exports 中声明的路径才能被访问");

console.log("\\n===== package.json 详解演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["快速入门"];