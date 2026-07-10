// =============================================================
// Node.js 交互式教程 —— 第十四批章节（进阶干货·生产工程篇，共 7 章）
// =============================================================
// 本批聚焦"生产环境真正用得上"的工程能力：HTTP 客户端、文件系统高阶、
// CLI 工具、包管理深度、TypeScript 集成、配置管理、进程守护与部署。
// 每章都包含"踩坑点 / 干货要点 / 可运行示例"。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：HTTP 客户端实战
  // =========================================================
  {
    id: "node-http-client",
    group: "进阶干货",
    icon: "🌐",
    title: "HTTP 客户端实战",
    content: `## HTTP 客户端实战

Node.js 18+ 内置了 \`fetch()\`，但生产环境远不止"能发请求"这么简单。本章讲透 **超时、重试、并发控制、连接复用、错误分类** 这些容易被忽视的工程细节。

### 一、四种 HTTP 客户端对比

| 方案 | 来源 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| \`http\`/\`https\` 模块 | Node 内置 | 最底层，控制力最强 | 学习原理、特殊协议 |
| \`fetch()\` | Node 18+ 内置 | Web 标准，Promise 风格 | 简单请求、SSR |
| \`node-fetch\` | npm | fetch 的 polyfill | 老版本 Node |
| \`undici\` | Node 内置 | fetch 的底层，性能最高 | 高并发 API 网关 |

**干货**：Node 内置的 \`fetch()\` 实际是基于 \`undici\` 实现的，但 \`undici\` 的 \`Client\` + \`Pool\` + \`Agent\` 提供了更细粒度的连接池控制，比 fetch 性能高 20%-40%。

### 二、超时控制的三种姿势

#### 1. fetch + AbortController（推荐）

\`\`\`javascript
async function fetchWithTimeout(url, opts = {}, timeout = 5000) {  // 声明异步函数，内部可用 await
  const controller = new AbortController();  // 创建实例 controller
  const timer = setTimeout(() => controller.abort(), timeout);  // 定义常量 timer
  try {  // 开启 try 块捕获异常
    const res = await fetch(url, { ...opts, signal: controller.signal });  // 定义常量 res
    return await res.text();  // 返回值
  } catch (err) {
    if (err.name === "AbortError") throw new Error("请求超时");  // 条件判断
    throw err;  // 抛出异常
  } finally {
    clearTimeout(timer);  // 取消定时器
  }
}
\`\`\`

#### 2. http.request + setTimeout（老式）

\`\`\`javascript
const req = https.request(url, (res) => { /* ... */ });  // 定义常量 req
req.setTimeout(5000, () => req.destroy(new Error("超时")));
\`\`\`

**踩坑点**：
- \`req.setTimeout\` 只控制**连接超时**，不控制响应读取超时
- 真正的"整体超时"必须用 \`AbortController\`

### 三、重试策略：指数退避 + 抖动

简单重试会放大流量（雪崩），必须加**指数退避**和**抖动**：

\`\`\`javascript
async function fetchWithRetry(url, opts = {}, retries = 3) {  // 声明异步函数，内部可用 await
  for (let i = 0; i <= retries; i++) {  // for 循环
    try {  // 开启 try 块捕获异常
      const res = await fetch(url, opts);  // 定义常量 res
      if (res.status >= 500 && i < retries) throw new Error("5xx");  // 条件判断
      return res;  // 返回值
    } catch (err) {
      if (i === retries) throw err;  // 条件判断
      // 指数退避：1s, 2s, 4s
      const base = Math.pow(2, i) * 1000;  // 定义常量 base
      // 抖动：随机 0~500ms，避免同步重试
      const jitter = Math.random() * 500;  // 定义常量 jitter
      await new Promise(r => setTimeout(r, base + jitter));  // 等待 Promise 完成后再继续
    }
  }
}
\`\`\`

**干货要点**：
1. **只重试幂等方法**：GET / PUT / DELETE 可以重试；POST / PATCH 不要重试（可能创建多条数据）
2. **只重试网络错误和 5xx**：4xx 是客户端错误，重试无意义
3. **必须设置最大重试次数**：否则坏服务会无限重试
4. **必须加抖动**：否则所有客户端同时重试，再次压垮服务

### 四、并发控制：Promise 池

\`Promise.all\` 会同时发起所有请求，容易打爆下游。生产环境必须**限流**：

\`\`\`javascript
async function pMap(items, mapper, concurrency = 5) {  // 声明异步函数，内部可用 await
  const results = [];  // 定义数组 results
  const executing = new Set();  // 创建实例 executing
  for (const item of items) {  // for 循环
    const p = Promise.resolve().then(() => mapper(item));  // 定义常量 p
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= concurrency) {  // 条件判断
      await Promise.race(executing);  // 等待 Promise 完成后再继续
    }
  }
  return Promise.all(results);  // 返回值
}

// 使用：同时最多 5 个请求
await pMap(urls, url => fetch(url), 5);  // 等待 Promise 完成后再继续
\`\`\`

**推荐**：直接用 \`p-limit\` 库（5 行代码搞定），别重复造轮子。

### 五、连接复用：Keep-Alive

默认情况下，每个 \`fetch\` 都会建立新 TCP 连接（含 TLS 握手，耗时 100-300ms）。开启 Keep-Alive 后，连接会被复用：

\`\`\`javascript
import { Agent } from "undici";  // 从 undici 导入：{ Agent }
const agent = new Agent({  // 创建实例 agent
  keepAliveTimeout: 30000,  // 连接保活 30s
  keepAliveMaxTimeout: 60000, // 最大保活 60s
});
fetch(url, { dispatcher: agent });
\`\`\`

**性能对比**（1000 次请求）：
- 不开 Keep-Alive：~30s
- 开启 Keep-Alive：~8s（提升 4 倍）

### 六、错误分类清单

\`\`\`
错误类型           | 处理方式
------------------|----------
ECONNREFUSED      | 服务未启动，告警
ECONNRESET        | 连接被重置，重试
ETIMEDOUT         | 连接超时，重试
ENOTFOUND         | DNS 解析失败，不重试
4xx               | 客户端错误，不重试
5xx               | 服务端错误，重试
\`\`\`

### 七、HTTP/2 客户端

\`\`\`javascript
const http2 = require("http2");  // 导入模块 http2；require 返回 module.exports
const client = http2.connect("https://example.com");
const req = client.request({ ":path": "/" });  // 定义常量 req
req.on("response", (headers) => console.log(headers));  // 监听请求事件（如 data/end）
req.on("data", (chunk) => {});  // 监听请求事件（如 data/end）
req.on("end", () => client.destroy());  // 监听请求事件（如 data/end）
\`\`\`

HTTP/2 的多路复用让**单连接**就能并发多个请求，比 HTTP/1.1 的连接池更高效。

下面代码演示超时、重试、并发控制三大核心能力。`,
    code: `// ============================================================
// HTTP 客户端实战演示（沙箱兼容版）
// ------------------------------------------------------------
// 注：沙箱未开放 http / http2 模块，也未提供 fetch 全局。
// 本章用 mock fetch 模拟真实网络行为，演示超时/重试/并发/连接复用。
// 生产环境请用真实 fetch 或 http 模块（见 content 字段）。
// ============================================================

// ---- 0. mock fetch：模拟带延迟的网络请求 ----
function mockFetch(url, opts = {}) {
  // 模拟不同 URL 的响应延迟
  const delay = url.includes("delay/5") ? 5000 : url.includes("slow") ? 800 : 50;
  const signal = opts.signal;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve({ status: 200, text: () => Promise.resolve("mock response for " + url) });
    }, delay);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        const err = new Error("The operation was aborted");
        err.name = "AbortError";
        reject(err);
      });
    }
  });
}

// ---- 1. 超时控制（AbortController） ----
console.log("===== 1. 请求超时控制 =====");
async function fetchWithTimeout(url, opts = {}, timeout = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await mockFetch(url, { ...opts, signal: controller.signal });
    return { ok: true, status: res.status, text: await res.text() };
  } catch (err) {
    return { ok: false, error: err.name === "AbortError" ? "请求超时" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

// 慢请求（模拟 5s 延迟，设 2s 超时 → 必然超时）
fetchWithTimeout("https://httpbin.org/delay/5", {}, 2000).then(r => {
  console.log("  慢请求结果:", r.ok ? "成功" : "失败", "-", r.error || r.status);
});

// 快请求（正常完成）
fetchWithTimeout("https://api.example.com/fast", {}, 3000).then(r => {
  console.log("  快请求结果:", r.ok ? "成功" : "失败", "-", r.error || r.status);
});

// ---- 2. 指数退避重试 ----
console.log("\\n===== 2. 指数退避重试 =====");
let attemptCount = 0;
async function flakyOperation() {
  attemptCount++;
  console.log("  第", attemptCount, "次尝试...");
  if (attemptCount < 3) {
    throw new Error("模拟临时故障");
  }
  return "成功！";
}

async function retry(fn, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      const delay = Math.pow(2, i) * 200 + Math.random() * 100;
      console.log("  失败，等待", Math.round(delay), "ms 后重试");
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

retry(flakyOperation, 4).then(r => {
  console.log("  最终结果:", r);
});

// ---- 3. 并发控制（p-limit 简化版） ----
console.log("\\n===== 3. 并发控制 =====");
async function pMap(items, mapper, concurrency = 2) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => mapper(item));
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

const tasks = [1, 2, 3, 4, 5, 6].map(i => async () => {
  console.log("  开始任务", i, "（并发=2）");
  await new Promise(r => setTimeout(r, 100));
  return "task-" + i;
});

pMap(tasks, fn => fn(), 2).then(results => {
  console.log("  并发控制结果:", results);
});

// ---- 4. 错误分类演示 ----
console.log("\\n===== 4. 错误分类 =====");
function classifyError(err) {
  if (err.code === "ECONNREFUSED") return { type: "service_down", retry: false };
  if (err.code === "ECONNRESET") return { type: "conn_reset", retry: true };
  if (err.code === "ETIMEDOUT") return { type: "timeout", retry: true };
  if (err.code === "ENOTFOUND") return { type: "dns_fail", retry: false };
  return { type: "unknown", retry: false };
}

const fakeErrors = [
  { code: "ECONNREFUSED", message: "连接被拒绝" },
  { code: "ETIMEDOUT", message: "连接超时" },
  { code: "ENOTFOUND", message: "DNS 解析失败" },
];

fakeErrors.forEach(err => {
  const c = classifyError(err);
  console.log("  ", err.code, "->", c.type, c.retry ? "[可重试]" : "[不重试]");
});

// ---- 5. Keep-Alive 性能对比（模拟）----
console.log("\\n===== 5. Keep-Alive 性能对比（模拟）=====");
// 沙箱无 http 模块，模拟 Keep-Alive 的性能差异
// 真实环境: new http.Agent({ keepAlive: true }) 复用 TCP 连接
function simulateRequest(withKeepAlive) {
  // 不复用：每次 TCP 握手 + TLS ~150ms
  // 复用：仅数据传输 ~30ms
  const overhead = withKeepAlive ? 30 : 150;
  return new Promise(r => setTimeout(r, overhead));
}

(async () => {
  const start1 = Date.now();
  for (let i = 0; i < 5; i++) await simulateRequest(false);
  const t1 = Date.now() - start1;

  const start2 = Date.now();
  for (let i = 0; i < 5; i++) await simulateRequest(true);
  const t2 = Date.now() - start2;

  console.log("  不复用连接: " + t1 + "ms (5 次 × 150ms 握手)");
  console.log("  复用连接  : " + t2 + "ms (5 次 × 30ms 数据)");
  console.log("  提升      : " + ((1 - t2/t1) * 100).toFixed(1) + "%");
  console.log("  说明: 真实环境用 new http.Agent({ keepAlive: true })");
})();

// ---- 6. HTTP/2 客户端概念演示 ----
console.log("\\n===== 6. HTTP/2 客户端概念 =====");
// 沙箱无 http2 模块，演示其 API 模式
console.log("  HTTP/2 核心特性:");
console.log("    - 多路复用: 单连接并发多个请求");
console.log("    - 头部压缩: HPACK 算法");
console.log("    - 服务端推送: server push");
console.log("  生产用法:");
console.log("    const http2 = require('http2');");
console.log("    const client = http2.connect('https://example.com');");
console.log("    const req = client.request({ ':path': '/' });");
console.log("    req.on('response', headers => ...);");
console.log("    req.on('data', chunk => ...);");
console.log("    req.on('end', () => client.destroy());");

console.log("\\n===== HTTP 客户端实战要点 =====");
console.log("  1. 超时用 AbortController，不用 req.setTimeout");
console.log("  2. 重试要指数退避 + 抖动，只重试幂等和 5xx");
console.log("  3. 并发用 p-limit，不要 Promise.all 全开");
console.log("  4. 开启 Keep-Alive，性能提升 3-5 倍");
console.log("  5. 高并发场景考虑 HTTP/2 或 undici");`,
  },

  // =========================================================
  // 第二章：文件系统高阶
  // =========================================================
  {
    id: "node-fs-advanced-pro",
    group: "进阶干货",
    icon: "📁",
    title: "文件系统高阶",
    content: `## 文件系统高阶

基础 \`fs.readFile\` / \`fs.writeFile\` 大家都会，但生产环境要处理**大文件、原子写入、文件锁、权限、watch 误报**这些细节。

### 一、fs.promises vs fs.sync vs fs回调

| API 风格 | 示例 | 何时用 |
| --- | --- | --- |
| Promise | \`fs.promises.readFile\` | **生产首选**，配合 async/await |
| 回调 | \`fs.readFile(path, cb)\` | 兼容老代码 |
| 同步 | \`fs.readFileSync\` | **只在启动时**用，运行时禁用 |

**踩坑点**：\`fs.exists\` 已废弃，用 \`fs.access\` 或 \`fs.stat\` 替代。

### 二、流式读写大文件（避免 OOM）

读取 10GB 文件用 \`readFile\` 会直接 OOM。必须用 Stream：

\`\`\`javascript
const { createReadStream, createWriteStream } = require("fs");  // 导入模块 fs；require 返回 module.exports
const { pipeline } = require("stream/promises");  // 导入模块 stream/promises；require 返回 module.exports

await pipeline(  // 等待 Promise 完成后再继续
  createReadStream("big.log"),
  async function* (source) {  // transform
    for await (const chunk of source) {
      yield chunk.toString().toUpperCase();
    }
  },
  createWriteStream("big.upper.log")
);
\`\`\`

**为什么用 \`pipeline\` 而不是 \`src.pipe(dst)\`**：
- \`pipe\` 不会传播错误，dst 出错时 src 不会停
- \`pipe\` 不会自动销毁流，导致内存泄漏
- \`pipeline\` 自动处理背压（backpressure）

### 三、原子写入（防半截文件）

直接 \`writeFile\` 写大文件，进程中途崩溃会留下**半截文件**。原子写入方案：

\`\`\`javascript
const { writeFile, rename } = require("fs/promises");  // 导入模块 fs/promises；require 返回 module.exports
const { join } = require("path");  // 导入模块 path；require 返回 module.exports

async function atomicWrite(file, content) {  // 声明异步函数，内部可用 await
  const tmp = file + ".tmp." + process.pid;  // 定义常量 tmp
  await writeFile(tmp, content);  // 等待 Promise 完成后再继续
  await rename(tmp, file);  // rename 是原子的
}
\`\`\`

**原理**：先写临时文件，完整后用 \`rename\` 原子替换。Linux 上 \`rename\` 是原子操作。

### 四、文件锁（防并发写入冲突）

多个进程同时写一个文件会乱。用 \`proper-lockfile\` 或 \`fs.open\` + \`O_EXCL\`：

\`\`\`javascript
const { open } = require("fs/promises");  // 导入模块 fs/promises；require 返回 module.exports
const lockFile = "/tmp/app.lock";  // 定义常量 lockFile
try {  // 开启 try 块捕获异常
  const fd = await open(lockFile, "wx");  // O_EXCL：文件已存在则失败
  await fd.writeFile(String(process.pid));  // 等待 Promise 完成后再继续
  await fd.close();  // 等待 Promise 完成后再继续
  // 执行业务
} catch (err) {
  if (err.code === "EEXIST") console.log("已有进程在运行");  // 条件判断
}
\`\`\`

### 五、目录递归操作

\`\`\`javascript
// 递归创建（Node 10+）
await fs.mkdir("a/b/c/d", { recursive: true });  // 等待 Promise 完成后再继续

// 递归删除（Node 14+）
await fs.rm("dir", { recursive: true, force: true });  // 等待 Promise 完成后再继续

// 遍历目录
const { readdir } = require("fs/promises");  // 导入模块 fs/promises；require 返回 module.exports
async function walk(dir) {  // 声明异步函数，内部可用 await
  const entries = await readdir(dir, { withFileTypes: true });  // 定义常量 entries
  const files = [];  // 定义数组 files
  for (const e of entries) {  // for 循环
    const full = join(dir, e.name);  // 定义常量 full
    if (e.isDirectory()) files.push(...await walk(full));  // 条件判断
    else files.push(full);
  }
  return files;  // 返回值
}
\`\`\`

**注意**：\`fs.rmdir\` 在 Node 16+ 标记废弃，改用 \`fs.rm\`。

### 六、文件 watch 的"坑"

\`\`\`fs.watch\` 有三大坑：

1. **同一事件触发多次**：编辑器保存时会触发多次写入事件
2. **递归 watch 平台差异**：macOS 默认递归，Linux 需 \`{ recursive: true }\`
3. **inotify 数量限制**：Linux 上 watch 太多文件会报 \`ENOSPC\`

\`\`\`javascript
// 防抖处理
let timer;
fs.watch(file, () => {
  clearTimeout(timer);
  timer = setTimeout(() => console.log("真的变了"), 100);
});
\`\`\`

推荐用 \`chokidar\` 库，解决了所有平台差异和误报问题。

### 七、文件描述符（fd）管理

每个进程默认最多 1024 个 fd。漏掉 \`close\` 会导致 EMFILE 错误：

\`\`\`javascript
// ❌ 忘记 close
const fd = fs.openSync(file, "r");
// ... 异常退出，fd 泄漏

// ✅ 用 withFile 或 try/finally
const fh = await fs.promises.open(file, "r");
try {
  // 使用 fh
} finally {
  await fh.close();
}
\`\`\`

**查看进程 fd**：\`lsof -p <pid>\` 或 \`ls /proc/<pid>/fd/\`。

### 八、临时文件最佳实践

\`\`\`javascript
const { mkdtemp, writeFile } = require("fs/promises");
const { tmpdir } = require("os");
const { join } = require("path");

// mkdtemp 创建唯一目录，比手动拼时间戳安全
const dir = await mkdtemp(join(tmpdir(), "myapp-"));
const file = join(dir, "data.json");
await writeFile(file, JSON.stringify(data));

// 进程退出时清理
process.on("exit", () => {
  fs.rmSync(dir, { recursive: true, force: true });
});
\`\`\`

**为什么不直接写 \`/tmp\`**：多进程会撞名；权限混乱；进程崩了不清理。

### 九、性能要点

- **写入大文件**：用 \`createWriteStream\`，分块写入
- **读取大文件**：用 \`createReadStream\`，按行处理
- **批量小文件**：用 \`Promise.all\` 并发，但要控制并发数
- **stat 调用**：批量 stat 很慢，缓存结果

下面代码演示流式读写、原子写入、文件锁、目录遍历等高阶用法。`,
    code: `// ============================================================
// 文件系统高阶实战
// ============================================================
const fs = require("fs");  // 导入模块 fs；require 返回 module.exports
// 注：沙箱未开放 fs/promises 子模块，用 fs.promises 替代（功能等价）
const fsp = fs.promises;  // 文件操作结果 fsp
const { pipeline: pipelineCb } = require("stream");  // 导入模块 stream；require 返回 module.exports
const { promisify } = require("util");  // 导入模块 util；require 返回 module.exports
// 注：沙箱未开放 stream/promises 子模块，用 util.promisify 包装
const pipeline = promisify(pipelineCb);  // 定义常量 pipeline
const { createReadStream, createWriteStream } = require("fs");  // 导入模块 fs；require 返回 module.exports
const path = require("path");  // 导入模块 path；require 返回 module.exports
const os = require("os");  // 导入模块 os；require 返回 module.exports

// ---- 1. 流式读写大文件 ----
console.log("===== 1. 流式读写 =====");  // 打印日志到 stdout
async function streamDemo() {  // 声明异步函数，内部可用 await
  const src = path.join(os.tmpdir(), "src-" + process.pid + ".txt");  // 拼接路径 src
  const dst = path.join(os.tmpdir(), "dst-" + process.pid + ".txt");  // 拼接路径 dst
  // 写入 100KB 数据
  await fsp.writeFile(src, "A".repeat(100 * 1024));  // 等待 Promise 完成后再继续
  
  const start = Date.now();  // 定义常量 start
  await pipeline(  // 等待 Promise 完成后再继续
    createReadStream(src),
    async function* (source) {
      for await (const chunk of source) {
        yield chunk.toString().toLowerCase();
      }
    },
    createWriteStream(dst)
  );
  console.log("  流式处理完成，耗时:", Date.now() - start, "ms");  // 打印日志到 stdout
  
  const stat = await fsp.stat(dst);  // 定义常量 stat
  console.log("  输出文件大小:", stat.size, "字节");  // 打印日志到 stdout
  
  // 清理
  await fsp.unlink(src);  // 等待 Promise 完成后再继续
  await fsp.unlink(dst);  // 等待 Promise 完成后再继续
}
streamDemo();

// ---- 2. 原子写入 ----
console.log("\\n===== 2. 原子写入 =====");  // 打印日志到 stdout
async function atomicWrite(file, content) {  // 声明异步函数，内部可用 await
  const tmp = file + ".tmp." + process.pid + "." + Date.now();  // 定义常量 tmp
  await fsp.writeFile(tmp, content);  // 等待 Promise 完成后再继续
  await fsp.rename(tmp, file);  // 等待 Promise 完成后再继续
}

const targetFile = path.join(os.tmpdir(), "atomic-" + process.pid + ".json");  // 拼接路径 targetFile
atomicWrite(targetFile, JSON.stringify({ time: new Date().toISOString() }, null, 2))
  .then(async () => {  // 注册 Promise 成功回调
    const content = await fsp.readFile(targetFile, "utf8");  // 定义常量 content
    console.log("  原子写入成功:", content);  // 打印日志到 stdout
    await fsp.unlink(targetFile);  // 等待 Promise 完成后再继续
  });

// ---- 3. 文件锁 ----
console.log("\\n===== 3. 文件锁（O_EXCL） =====");  // 打印日志到 stdout
async function acquireLock(lockPath) {  // 声明异步函数，内部可用 await
  try {  // 开启 try 块捕获异常
    const fh = await fsp.open(lockPath, "wx");  // 定义常量 fh
    await fh.writeFile(String(process.pid));  // 等待 Promise 完成后再继续
    await fh.close();  // 等待 Promise 完成后再继续
    return true;  // 返回值
  } catch (err) {
    if (err.code === "EEXIST") return false;  // 条件判断
    throw err;  // 抛出异常
  }
}

const lockFile = path.join(os.tmpdir(), "myapp-" + process.pid + ".lock");  // 拼接路径 lockFile
(async () => {
  const got = await acquireLock(lockFile);  // 定义常量 got
  console.log("  第一次获取锁:", got);  // 打印日志到 stdout
  const got2 = await acquireLock(lockFile);  // 定义常量 got2
  console.log("  第二次获取锁（应失败）:", got2);  // 打印日志到 stdout
  await fsp.unlink(lockFile);  // 等待 Promise 完成后再继续
})();

// ---- 4. 目录递归操作 ----
console.log("\\n===== 4. 目录递归 =====");  // 打印日志到 stdout
async function walk(dir) {  // 声明异步函数，内部可用 await
  const entries = await fsp.readdir(dir, { withFileTypes: true });  // 定义常量 entries
  const files = [];  // 定义数组 files
  for (const e of entries) {  // for 循环
    const full = path.join(dir, e.name);  // 拼接路径 full
    if (e.isDirectory()) {  // 条件判断
      files.push(...await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;  // 返回值
}

const testDir = path.join(os.tmpdir(), "walk-test-" + process.pid);  // 拼接路径 testDir
(async () => {
  await fsp.mkdir(path.join(testDir, "a/b/c"), { recursive: true });  // 等待 Promise 完成后再继续
  await fsp.writeFile(path.join(testDir, "1.txt"), "1");  // 等待 Promise 完成后再继续
  await fsp.writeFile(path.join(testDir, "a/2.txt"), "2");  // 等待 Promise 完成后再继续
  await fsp.writeFile(path.join(testDir, "a/b/3.txt"), "3");  // 等待 Promise 完成后再继续
  
  const files = await walk(testDir);  // 定义常量 files
  console.log("  遍历到", files.length, "个文件:");  // 打印日志到 stdout
  files.forEach(f => console.log("   ", path.relative(testDir, f)));
  
  await fsp.rm(testDir, { recursive: true, force: true });  // 等待 Promise 完成后再继续
  console.log("  递归删除完成");  // 打印日志到 stdout
})();

// ---- 5. fs.watch 防抖 ----
console.log("\\n===== 5. fs.watch 防抖 =====");  // 打印日志到 stdout
const watchFile = path.join(os.tmpdir(), "watch-" + process.pid + ".txt");  // 拼接路径 watchFile
fsp.writeFile(watchFile, "init").then(() => {
  let timer;
  let changeCount = 0;  // 定义变量 changeCount（可变）
  const watcher = fs.watch(watchFile, () => {  // 文件操作结果 watcher
    changeCount++;
    clearTimeout(timer);  // 取消定时器
    timer = setTimeout(() => {
      console.log("  检测到真实变化（防抖后），原始事件数:", changeCount);  // 打印日志到 stdout
      watcher.close();
      fsp.unlink(watchFile).catch(() => {});
    }, 100);
  });
  
  // 模拟编辑器：快速多次保存
  setTimeout(async () => {  // 延时回调（宏任务，timers 阶段执行）
    for (let i = 0; i < 3; i++) {  // for 循环
      await fsp.writeFile(watchFile, "v" + i);  // 等待 Promise 完成后再继续
    }
  }, 50);
});

// ---- 6. 文件描述符管理 ----
console.log("\\n===== 6. 文件描述符管理 =====");  // 打印日志到 stdout
async function safeRead(file) {  // 声明异步函数，内部可用 await
  const fh = await fsp.open(file, "r");  // 定义常量 fh
  try {  // 开启 try 块捕获异常
    const buf = Buffer.alloc(100);  // 定义常量 buf
    const { bytesRead } = await fh.read(buf, 0, 100, 0);  // 解构赋值： bytesRead 
    return buf.slice(0, bytesRead).toString();  // 返回值
  } finally {
    await fh.close();  // 等待 Promise 完成后再继续
  }
}

(async () => {
  const f = path.join(os.tmpdir(), "fd-" + process.pid + ".txt");  // 拼接路径 f
  await fsp.writeFile(f, "Hello fd!");  // 等待 Promise 完成后再继续
  const content = await safeRead(f);  // 定义常量 content
  console.log("  安全读取:", content);  // 打印日志到 stdout
  await fsp.unlink(f);  // 等待 Promise 完成后再继续
})();

// ---- 7. 临时文件 ----
console.log("\\n===== 7. 临时目录最佳实践 =====");  // 打印日志到 stdout
(async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "demo-"));  // 定义常量 dir
  console.log("  临时目录:", dir);  // 打印日志到 stdout
  console.log("  目录名唯一:", /demo-[a-zA-Z0-9]{8}$/.test(dir));  // 打印日志到 stdout
  await fsp.rm(dir, { recursive: true, force: true });  // 等待 Promise 完成后再继续
  console.log("  清理完成");  // 打印日志到 stdout
})();

// ---- 8. stat 缓存 ----
console.log("\\n===== 8. stat 缓存优化 =====");  // 打印日志到 stdout
const statCache = new Map();  // 创建实例 statCache
async function cachedStat(file) {  // 声明异步函数，内部可用 await
  if (statCache.has(file)) {  // 条件判断
    return statCache.get(file);  // 返回值
  }
  const stat = await fsp.stat(file);  // 定义常量 stat
  statCache.set(file, stat);
  return stat;  // 返回值
}

(async () => {
  const f = path.join(os.tmpdir(), "cache-" + process.pid + ".txt");  // 拼接路径 f
  await fsp.writeFile(f, "x");  // 等待 Promise 完成后再继续
  
  const start = Date.now();  // 定义常量 start
  for (let i = 0; i < 1000; i++) await cachedStat(f);  // for 循环
  const cachedTime = Date.now() - start;  // 定义常量 cachedTime
  
  statCache.clear();
  const start2 = Date.now();  // 定义常量 start2
  for (let i = 0; i < 1000; i++) await fsp.stat(f);  // for 循环
  const noCacheTime = Date.now() - start2;  // 定义常量 noCacheTime
  
  console.log("  1000 次 stat（缓存）:", cachedTime, "ms");  // 打印日志到 stdout
  console.log("  1000 次 stat（无缓存）:", noCacheTime, "ms");  // 打印日志到 stdout
  console.log("  提升:", ((1 - cachedTime/noCacheTime) * 100).toFixed(1) + "%");  // 打印日志到 stdout
  await fsp.unlink(f);  // 等待 Promise 完成后再继续
})();

console.log("\\n===== 文件系统高阶要点 =====");  // 打印日志到 stdout
console.log("  1. 大文件用 stream + pipeline，不要 readFile");  // 打印日志到 stdout
console.log("  2. 写入用原子写：先 tmp 再 rename");  // 打印日志到 stdout
console.log("  3. 文件锁用 O_EXCL，防多进程冲突");  // 打印日志到 stdout
console.log("  4. fs.watch 要防抖，或直接用 chokidar");  // 打印日志到 stdout
console.log("  5. fd 必须用 try/finally close，避免 EMFILE");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第三章：命令行工具开发
  // =========================================================
  {
    id: "node-cli-tools",
    group: "进阶干货",
    icon: "💻",
    title: "命令行工具开发",
    content: `## 命令行工具开发

写一个靠谱的 CLI 工具要处理：参数解析、子命令、彩色输出、进度条、交互式 prompt、自动补全、退出码。本章讲透这些细节。

### 一、CLI 工具的四大基础库

| 库 | 作用 | 推荐度 |
| --- | --- | --- |
| \`commander\` | 参数解析 + 子命令 | ⭐⭐⭐⭐⭐ |
| \`inquirer\` | 交互式 prompt | ⭐⭐⭐⭐⭐ |
| \`chalk\` | 彩色输出 | ⭐⭐⭐⭐⭐ |
| \`ora\` | 加载动画 | ⭐⭐⭐⭐ |

**新选择**：\`citty\`（unJS 系，更快）和 \`clack\`（更现代的 prompt）。

### 二、参数解析：process.argv vs commander

#### 裸 process.argv

\`\`\`javascript
// node cli.js --name alice --age 20 file.txt
// argv = ['/usr/bin/node', '/path/cli.js', '--name', 'alice', '--age', '20', 'file.txt']
const argv = process.argv.slice(2);
\`\`\`

**痛点**：要自己处理 \`--name=value\` / \`--name value\` / \`-n value\` 三种写法、布尔参数、子命令、help。

#### commander 示例

\`\`\`javascript
const { Command } = require("commander");
const program = new Command();

program
  .name("mycli")
  .description("一个示例 CLI")
  .version("1.0.0");

program
  .command("build <src>")
  .option("-o, --output <path>", "输出目录", "dist")
  .option("-w, --watch", "监听模式")
  .action((src, opts) => {
    console.log("构建", src, "->", opts.output);
  });

program.parse();
\`\`\`

### 三、彩色输出：chalk 的秘密

\`\`\`javascript
const chalk = require("chalk");
console.log(chalk.red("错误"));
console.log(chalk.green("成功"));
console.log(chalk.yellow("警告"));
console.log(chalk.cyan("信息"));
console.log(chalk.bold.red("严重错误"));
\`\`\`

**干货**：chalk 会检测 \`process.stdout.isTTY\`，如果输出到管道（非终端），自动去掉颜色码。但有时候你想强制彩色（比如 \`| less -R\`），用 \`chalk.level = 1\`。

### 四、进度条：手动 vs 库

#### 手动实现（学习原理）

\`\`\`javascript
function progressBar(percent) {
  const width = 30;
  const filled = Math.round(width * percent);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  process.stdout.write("\\r" + bar + " " + (percent * 100).toFixed(1) + "%");
}
\`\`\`

**关键**：用 \`\\r\` 回到行首覆盖，不要用 \`\\n\` 换行。

#### 推荐：\`cli-progress\` 库

\`\`\`javascript
const cliProgress = require("cli-progress");
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(100, 0);
for (let i = 0; i < 100; i++) bar.update(i);
bar.stop();
\`\`\`

### 五、交互式 Prompt：inquirer

\`\`\`javascript
const inquirer = require("inquirer");

const answers = await inquirer.prompt([
  {
    type: "input",
    name: "name",
    message: "项目名?",
    default: "my-app",
  },
  {
    type: "list",
    name: "framework",
    message: "选框架?",
    choices: ["React", "Vue", "Svelte"],
  },
  {
    type: "confirm",
    name: "typescript",
    message: "用 TypeScript?",
    default: true,
  },
  {
    type: "password",
    name: "token",
    message: "输入 token:",
    mask: "*",
  },
]);
\`\`\`

**干货**：\`type: "checkbox"\` 多选，\`type: "editor"\` 调起 vim 编辑长文本。

### 六、退出码的约定

| 退出码 | 含义 |
| --- | --- |
| 0 | 成功 |
| 1 | 一般错误 |
| 2 | 命令行参数错误 |
| 124 | 超时（GNU \`timeout\` 约定） |
| 130 | Ctrl+C 中断 |

\`\`\`javascript
process.on("SIGINT", () => {
  console.log("\\n用户中断");
  process.exit(130);  // 不要用 0
});
\`\`\`

### 七、shebang 与 bin

CLI 工具入口必须加 shebang：

\`\`\`javascript
#!/usr/bin/env node
const { Command } = require("commander");
// ...
\`\`\`

\`package.json\` 配置：

\`\`\`json
{
  "bin": {
    "mycli": "./bin/cli.js"
  }
}
\`\`\`

\`npm install -g\` 后，命令 \`mycli\` 就可全局使用。

### 八、自动补全

#### Bash 补全

\`\`\`bash
# /etc/bash_completion.d/mycli
_mycli() {
  local cmds="build watch serve"
  COMPREPLY=($(compgen -W "$cmds" -- "\${COMP_WORDS[1]}"))
}
complete -F _mycli mycli
\`\`\`

#### commander 自动生成

\`\`\`bash
mycli --help   # 显示帮助
mycli completion > /etc/bash_completion.d/mycli
\`\`\`

### 九、调试技巧

#### 1. 打印 process.argv

\`\`\`javascript
console.error("argv:", process.argv);
\`\`\`

#### 2. 用 \`--inspect-brk\` 调试

\`\`\`bash
node --inspect-brk bin/cli.js build src
\`\`\`

#### 3. 用 \`DEBUG\` 环境变量

\`\`\`javascript
const debug = require("debug")("mycli:build");
debug("开始构建", src);
// DEBUG=mycli:* node cli.js
\`\`\`

### 十、性能优化

- **延迟加载**：commander 子命令的 \`action\` 里再 \`require\` 重的库，避免 \`--help\` 慢
- **流式输出**：大输出用 \`process.stdout.write\`，不要 \`console.log\`
- **避免 sync**：CLI 也别用 \`readFileSync\`，否则 IO 期间 CPU 空闲

下面代码演示一个完整的 CLI 工具框架。`,
    code: `// ============================================================
// CLI 工具开发演示
// ============================================================
// 模拟一个完整的 CLI 工具：参数解析、彩色输出、进度条、交互式

// ---- 1. 参数解析（手写版，演示原理） ----
console.log("===== 1. 参数解析 =====");  // 打印日志到 stdout
function parseArgs(argv) {  // 声明函数 parseArgs
  const args = { _: [], _flags: {} };  // 定义对象 args
  for (let i = 0; i < argv.length; i++) {  // for 循环
    const arg = argv[i];  // 定义常量 arg
    if (arg.startsWith("--")) {  // 条件判断
      const [key, val] = arg.slice(2).split("=");
      if (val !== undefined) {  // 条件判断
        args._flags[key] = val;
      } else if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        args._flags[key] = argv[++i];
      } else {
        args._flags[key] = true;
      }
    } else {
      args._.push(arg);
    }
  }
  return args;  // 返回值
}

const fakeArgv = ["build", "src", "--output=dist", "--watch", "--port", "3000"];  // 定义数组 fakeArgv
const parsed = parseArgs(fakeArgv);  // 定义常量 parsed
console.log("  输入:", fakeArgv.join(" "));  // 打印日志到 stdout
console.log("  位置参数:", parsed._);  // 打印日志到 stdout
console.log("  选项:", parsed._flags);  // 打印日志到 stdout

// ---- 2. 彩色输出（ANSI 转义码原理） ----
console.log("\\n===== 2. 彩色输出（ANSI 原理） =====");  // 打印日志到 stdout
const colors = {  // 定义对象 colors
  red: "\\x1b[31m",
  green: "\\x1b[32m",
  yellow: "\\x1b[33m",
  blue: "\\x1b[34m",
  magenta: "\\x1b[35m",
  cyan: "\\x1b[36m",
  reset: "\\x1b[0m",
  bold: "\\x1b[1m",
};

function colorize(text, color) {  // 声明函数 colorize
  return colors[color] + text + colors.reset;  // 返回值
}

console.log("  " + colorize("错误信息", "red"));  // 打印日志到 stdout
console.log("  " + colorize("成功信息", "green"));  // 打印日志到 stdout
console.log("  " + colorize("警告信息", "yellow"));  // 打印日志到 stdout
console.log("  " + colorize("信息提示", "cyan"));  // 打印日志到 stdout
console.log("  " + colorize("加粗红色", "bold") + " <- " + colors.bold + "实际是\\x1b[1m");  // 打印日志到 stdout

// 检测 TTY
console.log("  stdout.isTTY:", process.stdout.isTTY);  // 打印日志到 stdout
console.log("  → 管道输出时会自动去色（chalk 行为）");  // 打印日志到 stdout

// ---- 3. 进度条（手动实现） ----
console.log("\\n===== 3. 进度条 =====");  // 打印日志到 stdout
function progressBar(percent, label) {  // 声明函数 progressBar
  const width = 25;  // 定义常量 width
  const filled = Math.round(width * percent);  // 定义常量 filled
  const bar = "█".repeat(filled) + "░".repeat(width - filled);  // 定义常量 bar
  const pct = (percent * 100).toFixed(0).padStart(3) + "%";  // 定义常量 pct
  process.stdout.write("\\r  " + (label || "进度") + " [" + bar + "] " + pct);  // 直接写到 stdout（不加换行）
  if (percent >= 1) process.stdout.write("\\n");  // 条件判断
}

// 模拟一个耗时任务
let progress = 0;  // 定义变量 progress（可变）
const task = setInterval(() => {  // 定义常量 task
  progress += 0.1;
  progressBar(Math.min(progress, 1), "构建中");
  if (progress >= 1) {  // 条件判断
    clearInterval(task);  // 取消定时器
    console.log("  构建完成！");  // 打印日志到 stdout
  }
}, 80);

// ---- 4. 交互式 Prompt 模拟 ----
console.log("\\n===== 4. 交互式 Prompt 模拟 =====");  // 打印日志到 stdout
// 真实环境用 inquirer，这里模拟逻辑
const fakeAnswers = {  // 定义对象 fakeAnswers
  name: "my-app",
  framework: "React",
  typescript: true,
};

console.log("  ? 项目名? (my-app)");  // 打印日志到 stdout
console.log("  > " + fakeAnswers.name);  // 打印日志到 stdout
console.log("  ? 选框架? (Use arrow keys)");  // 打印日志到 stdout
console.log("  ❯ React");  // 打印日志到 stdout
console.log("    Vue");  // 打印日志到 stdout
console.log("    Svelte");  // 打印日志到 stdout
console.log("  > " + fakeAnswers.framework);  // 打印日志到 stdout
console.log("  ? 用 TypeScript? (Y/n)");  // 打印日志到 stdout
console.log("  > " + (fakeAnswers.typescript ? "Yes" : "No"));  // 打印日志到 stdout
console.log("  → 真实环境用 inquirer 库");  // 打印日志到 stdout

// ---- 5. 子命令路由 ----
console.log("\\n===== 5. 子命令路由 =====");  // 打印日志到 stdout
function createProgram() {  // 声明函数 createProgram
  const commands = {};  // 定义对象 commands
  return {  // 返回值
    command(name, desc, action) {
      commands[name] = { desc, action };
    },
    run(argv) {
      const [cmd, ...rest] = argv;
      if (!cmd || cmd === "--help") {  // 条件判断
        console.log("  可用命令:");  // 打印日志到 stdout
        for (const [name, c] of Object.entries(commands)) {  // for 循环
          console.log("    " + name.padEnd(10) + c.desc);  // 打印日志到 stdout
        }
        return;
      }
      if (!commands[cmd]) {  // 条件判断
        console.error("  未知命令:", cmd);  // 打印错误到 stderr
        process.exit(2);  // 2 = 参数错误
      }
      commands[cmd].action(rest);
    },
  };
}

const program = createProgram();  // 定义常量 program
program.command("build", "构建项目", (args) => {
  console.log("  执行 build，参数:", args);  // 打印日志到 stdout
});
program.command("serve", "启动服务", (args) => {
  console.log("  执行 serve，参数:", args);  // 打印日志到 stdout
});
program.command("deploy", "部署", (args) => {
  console.log("  执行 deploy，参数:", args);  // 打印日志到 stdout
});

console.log("  测试: mycli --help");  // 打印日志到 stdout
program.run(["--help"]);
console.log("  测试: mycli build src --output dist");  // 打印日志到 stdout
program.run(["build", "src", "--output", "dist"]);

// ---- 6. 退出码演示 ----
console.log("\\n===== 6. 退出码约定 =====");  // 打印日志到 stdout
console.log("  0   = 成功");  // 打印日志到 stdout
console.log("  1   = 一般错误");  // 打印日志到 stdout
console.log("  2   = 参数错误");  // 打印日志到 stdout
console.log("  124 = 超时");  // 打印日志到 stdout
console.log("  130 = Ctrl+C 中断");  // 打印日志到 stdout

// SIGINT 处理
process.on("SIGINT", () => {  // 注册进程级事件监听
  console.log("\\n  用户中断（Ctrl+C）");  // 打印日志到 stdout
  console.log("  清理资源...");  // 打印日志到 stdout
  process.exit(130);  // 退出进程（0 正常，非 0 异常）
});

// ---- 7. DEBUG 环境变量 ----
console.log("\\n===== 7. DEBUG 环境变量 =====");  // 打印日志到 stdout
function createDebug(namespace) {  // 声明函数 createDebug
  return function (...args) {  // 返回值
    if (process.env.DEBUG && process.env.DEBUG.includes(namespace)) {  // 条件判断
      console.log("  " + colorize(namespace, "magenta") + " " + args.join(" "));  // 打印日志到 stdout
    }
  };
}

const debug = createDebug("mycli:build");  // 定义常量 debug
debug("开始构建（仅 DEBUG=mycli:* 时显示）");
console.log("  → 运行: DEBUG=mycli:* node cli.js 可看到 debug 日志");  // 打印日志到 stdout

// ---- 8. shebang 与 bin 配置说明 ----
console.log("\\n===== 8. 发布 CLI 工具 =====");  // 打印日志到 stdout
console.log("  入口文件第一行: #!/usr/bin/env node");  // 打印日志到 stdout
console.log("  package.json: { \\"bin\\": { \\"mycli\\": \\"./bin/cli.js\\" } }");  // 打印日志到 stdout
console.log("  权限: chmod +x bin/cli.js");  // 打印日志到 stdout
console.log("  本地测试: npm link");  // 打印日志到 stdout
console.log("  发布: npm publish");  // 打印日志到 stdout
console.log("  全局安装: npm install -g mycli");  // 打印日志到 stdout

console.log("\\n===== CLI 工具开发要点 =====");  // 打印日志到 stdout
console.log("  1. commander 解析参数，inquirer 做交互");  // 打印日志到 stdout
console.log("  2. chalk 彩色输出会自动检测 TTY");  // 打印日志到 stdout
console.log("  3. 进度条用 \\r 回到行首覆盖");  // 打印日志到 stdout
console.log("  4. 退出码: 0/1/2/124/130 各有约定");  // 打印日志到 stdout
console.log("  5. DEBUG=ns:* 控制调试日志开关");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第四章：npm/pnpm 包管理深度
  // =========================================================
  {
    id: "node-package-managers",
    group: "进阶干货",
    icon: "📦",
    title: "npm/pnpm 包管理深度",
    content: `## npm/pnpm 包管理深度

包管理器是 Node 工程的基石。本章讲透 **package-lock、semver、peer deps、monorepo、缓存、pnpm 的硬链接魔法**。

### 一、三大包管理器对比

| 特性 | npm | yarn | pnpm |
| --- | --- | --- | --- |
| 安装速度 | 慢 | 中 | **最快** |
| 磁盘占用 | 大 | 大 | **最小（硬链接）** |
| 幽灵依赖 | 有 | 有 | **无** |
| monorepo | workspaces | workspaces | **workspaces（最强）** |
| lock 文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |

**干货**：pnpm 用**硬链接** + **符号链接**避免重复存储。100 个项目都用 lodash，磁盘上只存一份。

### 二、semver 语义化版本

\`package.json\` 的版本号格式：\`MAJOR.MINOR.PATCH\`

- **MAJOR**：不兼容的 API 变更（破坏性）
- **MINOR**：向后兼容的新功能
- **PATCH**：向后兼容的 bug 修复

#### 版本范围符号

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| \`^1.2.3\` | 兼容 1.x.x | >=1.2.3 <2.0.0 |
| \`~1.2.3\` | 兼容 1.2.x | >=1.2.3 <1.3.0 |
| \`1.2.3\` | 精确版本 | =1.2.3 |
| \`>=1.2.3\` | 大于等于 | >=1.2.3 |
| \`*\` 或 \`x\` | 任意版本 | >=0.0.0 |

**踩坑点**：\`^0.0.3\` 不是 >=0.0.3 <0.1.0，而是 **=0.0.3**！0.x.x 版本被认为不稳定，\`^\` 行为退化为精确匹配。

### 三、依赖类型

\`\`\`json
{
  "dependencies": {},         // 运行时依赖（生产也要）
  "devDependencies": {},      // 开发依赖（构建、测试）
  "peerDependencies": {},    // 宿主依赖（让宿主提供）
  "optionalDependencies": {},// 可选（安装失败不报错）
  "bundleDependencies": []   // 打包时一起发布
}
\`\`\`

#### peerDependencies 的真实含义

插件库（如 \`react-redux\`）依赖 \`react\`，但不应自己安装 react，而让应用提供：

\`\`\`json
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
\`\`\`

npm 7+ 会**自动安装** peer deps，但版本不匹配会报错（之前只是警告）。

### 四、幽灵依赖问题

**问题**：npm/yarn 把所有依赖**扁平化**到 \`node_modules\` 根目录，导致代码可以 \`require\` 没在 package.json 声明的包：

\`\`\`javascript
// package.json 只声明了 express
// 但 express 依赖了 body-parser
require("body-parser");  // 居然能 require 到！
\`\`\`

**危害**：
1. express 升级换了 body-parser 实现，你的代码突然挂
2. 误以为 body-parser 是"免费"的，删 express 后崩了

**pnpm 解决**：用符号链接，\`node_modules/.pnpm\` 下才是真实位置，根 \`node_modules\` 只暴露声明的包。

### 五、npm install 的过程

1. 计算 \`package.json\` 依赖树
2. 请求 npm registry，获取包元数据
3. 解析版本，下载 tarball 到缓存（\`~/.npm/_cacache\`）
4. 解压到 \`node_modules\`
5. 运行 \`postinstall\` 脚本
6. 写入 \`package-lock.json\`

**加速技巧**：
- 用国内镜像：\`npm config set registry https://registry.npmmirror.com\`
- 用 pnpm：硬链接复用缓存
- \`--prefer-offline\`：优先用缓存

### 六、npm scripts 详解

\`\`\`json
{
  "scripts": {
    "prestart": "echo before",     // start 前自动执行
    "start": "node server.js",
    "poststart": "echo after",     // start 后自动执行
    "build": "webpack",
    "test": "jest",
    "dev": "nodemon server.js"
  }
}
\`\`\`

#### 自定义脚本钩子

\`\`\`bash
npm run build      # 执行 prebuild → build → postbuild
\`\`\`

#### 并行执行多个脚本

\`\`\`bash
npm-run-all --parallel build:*
# 等价于同时跑 build:css, build:js, build:html
\`\`\`

### 七、npx 的作用

\`\`\`bash
# 1. 执行本地安装的命令（不用 ./node_modules/.bin/）
npx eslint .

# 2. 执行未安装的命令（临时下载）
npx create-react-app my-app

# 3. 指定版本
npx cowsay@1.5.0 "hello"

# 4. 用 GitHub 仓库
npx github:user/repo
\`\`\`

**注意**：npx 每次会下载（除非缓存命中）。生产用 \`npm install -g\` 更稳。

### 八、monorepo（pnpm workspaces）

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"
\`\`\`

\`\`\`bash
pnpm install              # 安装所有 workspace 依赖
pnpm --filter web add react   # 给 web 应用加 react
pnpm --filter shared build    # 构建 shared 包
pnpm -r build                  # 递归构建所有包
\`\`\`

**干货**：pnpm 的 \`--filter\` 支持依赖图，\`--filter web... build\` 会先构建 web 的所有依赖再构建 web。

### 九、缓存管理

\`\`\`bash
npm cache ls              # 查看缓存
npm cache clean --force   # 清空缓存
npm cache verify          # 校验缓存完整性

# 缓存位置
npm config get cache     # ~/.npm
pnpm store path          # ~/.pnpm-store
\`\`\`

### 十、发布包流程

\`\`\`bash
# 1. 注册账号
npm adduser

# 2. 登录
npm login

# 3. 检查要发布的文件
npm pack --dry-run

# 4. 发布
npm publish

# 5. 发布 scoped 包（默认私有，需 --access public）
npm publish --access public

# 6. 取消发布（72 小时内）
npm unpublish mypkg@1.0.0
\`\`\`

**踩坑点**：
- \`npm publish\` 会运行 \`prepublishOnly\` 脚本
- 发布前必须 \`npm pack\` 检查文件（避免发布 node_modules）
- 用 \`.npmignore\` 或 \`files\` 字段控制发布内容

下面代码演示 semver 解析、依赖树分析、package.json 操作。`,
    code: `// ============================================================
// npm/pnpm 包管理深度演示
// ============================================================
const fs = require("fs");  // 导入模块 fs；require 返回 module.exports
const path = require("path");  // 导入模块 path；require 返回 module.exports

// ---- 1. semver 版本解析（手写简化版） ----
console.log("===== 1. semver 版本解析 =====");  // 打印日志到 stdout
function parseVersion(v) {  // 声明函数 parseVersion
  const match = v.match(/^(\\d+)\\.(\\d+)\\.(\\d+)/);  // 定义常量 match
  if (!match) return null;  // 条件判断
  return {  // 返回值
    major: +match[1],
    minor: +match[2],
    patch: +match[3],
  };
}

function compareVersions(a, b) {  // 声明函数 compareVersions
  const va = parseVersion(a);  // 定义常量 va
  const vb = parseVersion(b);  // 定义常量 vb
  if (va.major !== vb.major) return va.major - vb.major;  // 条件判断
  if (va.minor !== vb.minor) return va.minor - vb.minor;  // 条件判断
  return va.patch - vb.patch;  // 返回值
}

function satisfiesRange(version, range) {  // 声明函数 satisfiesRange
  const v = parseVersion(version);  // 定义常量 v
  if (!v) return false;  // 条件判断
  
  // 处理 ^1.2.3
  if (range.startsWith("^")) {  // 条件判断
    const target = parseVersion(range.slice(1));  // 定义常量 target
    if (v.major !== target.major) return false;  // 条件判断
    if (v.major === 0) {  // 条件判断
      // 0.x 版本特殊处理
      if (v.minor !== target.minor) return false;  // 条件判断
      return v.patch >= target.patch;  // 返回值
    }
    if (v.minor < target.minor) return false;  // 条件判断
    if (v.minor === target.minor && v.patch < target.patch) return false;  // 条件判断
    return true;  // 返回值
  }
  // 处理 ~1.2.3
  if (range.startsWith("~")) {  // 条件判断
    const target = parseVersion(range.slice(1));  // 定义常量 target
    if (v.major !== target.major) return false;  // 条件判断
    if (v.minor !== target.minor) return false;  // 条件判断
    return v.patch >= target.patch;  // 返回值
  }
  // 精确匹配
  return version === range;  // 返回值
}

console.log("  ^1.2.3 满足 1.2.5?", satisfiesRange("1.2.5", "^1.2.3"));  // 打印日志到 stdout
console.log("  ^1.2.3 满足 1.3.0?", satisfiesRange("1.3.0", "^1.2.3"));  // 打印日志到 stdout
console.log("  ^1.2.3 满足 2.0.0?", satisfiesRange("2.0.0", "^1.2.3"));  // 打印日志到 stdout
console.log("  ^0.2.3 满足 0.2.5?", satisfiesRange("0.2.5", "^0.2.3"));  // 打印日志到 stdout
console.log("  ^0.2.3 满足 0.3.0?", satisfiesRange("0.3.0", "^0.2.3"), "(0.x 特殊)");  // 打印日志到 stdout
console.log("  ~1.2.3 满足 1.2.9?", satisfiesRange("1.2.9", "~1.2.3"));  // 打印日志到 stdout
console.log("  ~1.2.3 满足 1.3.0?", satisfiesRange("1.3.0", "~1.2.3"));  // 打印日志到 stdout

// ---- 2. 依赖类型对比 ----
console.log("\\n===== 2. 依赖类型 =====");  // 打印日志到 stdout
const depTypes = [  // 定义数组 depTypes
  { name: "dependencies", 用途: "运行时依赖", 例子: "express, lodash" },
  { name: "devDependencies", 用途: "开发依赖", 例子: "jest, webpack" },
  { name: "peerDependencies", 用途: "宿主依赖", 例子: "react 插件依赖 react" },
  { name: "optionalDependencies", 用途: "可选依赖", 例子: "fsevents (macOS 专用)" },
  { name: "bundleDependencies", 用途: "打包依赖", 例子: "发布时一起打包" },
];
depTypes.forEach(d => {
  console.log("  " + d.name.padEnd(22) + " | " + d.用途 + " | " + d.例子);  // 打印日志到 stdout
});

// ---- 3. package.json 操作 ----
console.log("\\n===== 3. package.json 操作 =====");  // 打印日志到 stdout
function readPackageJson(dir) {  // 声明函数 readPackageJson
  const file = path.join(dir, "package.json");  // 拼接路径 file
  if (!fs.existsSync(file)) return null;  // 条件判断
  return JSON.parse(fs.readFileSync(file, "utf8"));  // 返回值
}

// 读取当前项目的 package.json
const pkg = readPackageJson(process.cwd());  // 定义常量 pkg
if (pkg) {  // 条件判断
  console.log("  项目名:", pkg.name);  // 打印日志到 stdout
  console.log("  版本:", pkg.version);  // 打印日志到 stdout
  console.log("  main:", pkg.main || "(无)");  // 打印日志到 stdout
  console.log("  scripts 数量:", Object.keys(pkg.scripts || {}).length);  // 打印日志到 stdout
  console.log("  dependencies 数量:", Object.keys(pkg.dependencies || {}).length);  // 打印日志到 stdout
  console.log("  devDependencies 数量:", Object.keys(pkg.devDependencies || {}).length);  // 打印日志到 stdout
  
  // 列出 scripts
  console.log("\\n  可用 scripts:");  // 打印日志到 stdout
  Object.entries(pkg.scripts || {}).slice(0, 10).forEach(([k, v]) => {  // 获取对象 [key, value] 二维数组
    console.log("    " + k.padEnd(15) + " -> " + (v.length > 50 ? v.slice(0, 50) + "..." : v));  // 打印日志到 stdout
  });
}

// ---- 4. node_modules 结构分析 ----
console.log("\\n===== 4. node_modules 结构 =====");  // 打印日志到 stdout
function analyzeNodeModules(dir) {  // 声明函数 analyzeNodeModules
  const nmPath = path.join(dir, "node_modules");  // 拼接路径 nmPath
  if (!fs.existsSync(nmPath)) return null;  // 条件判断
  
  const stats = { topLevel: 0, scoped: 0 };  // 定义对象 stats
  const entries = fs.readdirSync(nmPath);  // 文件操作结果 entries
  for (const e of entries) {  // for 循环
    if (e.startsWith(".")) continue;  // 条件判断
    if (e.startsWith("@")) {  // 条件判断
      const scoped = path.join(nmPath, e);  // 拼接路径 scoped
      stats.scoped += fs.readdirSync(scoped).length;
    } else {
      stats.topLevel++;
    }
  }
  stats.total = stats.topLevel + stats.scoped;
  return stats;  // 返回值
}

const nmStats = analyzeNodeModules(process.cwd());  // 定义常量 nmStats
if (nmStats) {  // 条件判断
  console.log("  顶级包数:", nmStats.topLevel);  // 打印日志到 stdout
  console.log("  scoped 包数:", nmStats.scoped);  // 打印日志到 stdout
  console.log("  总包数:", nmStats.total);  // 打印日志到 stdout
}

// ---- 5. 幽灵依赖问题演示 ----
console.log("\\n===== 5. 幽灵依赖问题 =====");  // 打印日志到 stdout
console.log("  问题: 扁平化 node_modules 导致未声明的包也能 require");  // 打印日志到 stdout
console.log("  示例: package.json 只声明 express，但能 require body-parser");  // 打印日志到 stdout
console.log("  → npm/yarn 有此问题");  // 打印日志到 stdout
console.log("  → pnpm 用符号链接解决（只暴露声明的包）");  // 打印日志到 stdout

// 检测是否有幽灵依赖
if (pkg && pkg.dependencies) {  // 条件判断
  const declared = new Set(Object.keys(pkg.dependencies));  // 创建实例 declared
  const nmPath = path.join(process.cwd(), "node_modules");  // 拼接路径 nmPath
  if (fs.existsSync(nmPath)) {  // 条件判断
    const actual = fs.readdirSync(nmPath).filter(n => !n.startsWith(".") && !n.startsWith("@"));  // 文件操作结果 actual
    const ghosts = actual.filter(p => !declared.has(p) && !p.startsWith("."));  // 定义常量 ghosts
    console.log("  声明的依赖:", declared.size, "个");  // 打印日志到 stdout
    console.log("  node_modules 顶级包:", actual.length, "个");  // 打印日志到 stdout
    if (ghosts.length > 0) {  // 条件判断
      console.log("  可能的幽灵依赖（前5个）:", ghosts.slice(0, 5));  // 打印日志到 stdout
    }
  }
}

// ---- 6. npm 缓存分析 ----
console.log("\\n===== 6. npm 缓存 =====");  // 打印日志到 stdout
const os = require("os");  // 导入模块 os；require 返回 module.exports
const cachePath = path.join(os.homedir(), ".npm/_cacache");  // 拼接路径 cachePath
if (fs.existsSync(cachePath)) {  // 条件判断
  function getDirSize(dir) {  // 声明函数 getDirSize
    let size = 0;  // 定义变量 size（可变）
    const items = fs.readdirSync(dir);  // 文件操作结果 items
    for (const item of items) {  // for 循环
      const full = path.join(dir, item);  // 拼接路径 full
      const stat = fs.statSync(full);  // 文件操作结果 stat
      if (stat.isDirectory()) size += getDirSize(full);  // 条件判断
      else size += stat.size;
    }
    return size;  // 返回值
  }
  try {  // 开启 try 块捕获异常
    const size = getDirSize(cachePath);  // 定义常量 size
    console.log("  缓存路径:", cachePath);  // 打印日志到 stdout
    console.log("  缓存大小:", (size / 1024 / 1024).toFixed(1), "MB");  // 打印日志到 stdout
  } catch (e) {
    console.log("  缓存计算失败:", e.message);  // 打印日志到 stdout
  }
} else {
  console.log("  未找到 npm 缓存目录");  // 打印日志到 stdout
}

// ---- 7. pnpm 硬链接优势演示 ----
console.log("\\n===== 7. pnpm vs npm 磁盘占用 =====");  // 打印日志到 stdout
console.log("  场景: 100 个项目都用 lodash");  // 打印日志到 stdout
console.log("  npm : 100 份 lodash 副本 ≈ " + (100 * 1.5).toFixed(1) + "MB");  // 打印日志到 stdout
console.log("  pnpm: 1 份 lodash + 100 个硬链接 ≈ 1.5MB");  // 打印日志到 stdout
console.log("  → 硬链接（同 inode）不占额外磁盘空间");  // 打印日志到 stdout
console.log("  → 查看 inode: ls -i node_modules/lodash");  // 打印日志到 stdout

// ---- 8. 发布流程模拟 ----
console.log("\\n===== 8. 发布流程 =====");  // 打印日志到 stdout
const publishSteps = [  // 定义数组 publishSteps
  "1. npm pack --dry-run (检查要发布的文件)",
  "2. npm version patch/minor/major (升版本号)",
  "3. npm login (登录)",
  "4. npm publish (发布)",
  "5. npm unpublish pkg@ver (72小时内可撤)",
];
publishSteps.forEach(s => console.log("  " + s));

console.log("\\n===== 包管理深度要点 =====");  // 打印日志到 stdout
console.log("  1. ^0.x.x 特殊：等同于精确匹配");  // 打印日志到 stdout
console.log("  2. peerDependencies 让宿主提供依赖");  // 打印日志到 stdout
console.log("  3. pnpm 用硬链接省磁盘、防幽灵依赖");  // 打印日志到 stdout
console.log("  4. npm pack --dry-run 发布前必做");  // 打印日志到 stdout
console.log("  5. monorepo 用 pnpm workspaces 最稳");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第五章：TypeScript + Node 集成
  // =========================================================
  {
    id: "node-typescript-integration",
    group: "进阶干货",
    icon: "🔷",
    title: "TypeScript + Node 集成",
    content: `## TypeScript + Node 集成

TypeScript 不是"装上就能用"。本章讲透 **tsconfig 配置、模块系统选择、运行时方案、类型定义文件、装饰器** 这些实战细节。

### 一、三种运行 TS 的方式

| 方式 | 命令 | 适合场景 |
| --- | --- | --- |
| \`tsc\` 编译 + \`node\` 运行 | \`tsc && node dist/app.js\` | **生产部署** |
| \`ts-node\` | \`ts-node app.ts\` | 开发调试 |
| \`tsx\` | \`tsx app.ts\` | **新一代，更快** |

**干货**：\`tsx\` 用 esbuild 转译，比 ts-node 快 10 倍。Node 22.6+ 内置 \`--experimental-strip-types\` 可直接跑 .ts（实验性）。

### 二、tsconfig.json 关键配置

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",          // 编译目标
    "module": "NodeNext",        // 模块系统（关键！）
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,    // 允许 import fs from "fs"
    "strict": true,              // 开启所有严格检查
    "skipLibCheck": true,        // 跳过 .d.ts 检查（加速）
    "outDir": "./dist",          // 编译输出目录
    "rootDir": "./src",          // 源码目录
    "declaration": true,        // 生成 .d.ts（写库必备）
    "sourceMap": true,           // 生成 source map
    "resolveJsonModule": true,   // 允许 import json
    "experimentalDecorators": true,  // 装饰器
    "emitDecoratorMetadata": true    // 装饰器元数据
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

### 三、模块系统的关键选择：CommonJS vs ESM

| 特性 | CommonJS | ESM |
| --- | --- | --- |
| 语法 | \`require\` / \`module.exports\` | \`import\` / \`export\` |
| 加载 | 同步 | 异步 |
| 顶层 await | ❌ | ✅ |
| Tree-shaking | ❌ | ✅ |
| Node 支持 | 默认 | \`"type": "module"\` |

**NodeNext 的特殊规则**：
- \`module: "NodeNext"\` 时，\`.js\` 文件按 CommonJS，\`.mjs\` 按 ESM
- ESM 中 import 必须带扩展名：\`import "./a.js"\`（注意是 .js 不是 .ts）

### 四、tsconfig 的坑

#### 1. noEmit 与 noEmitOnError

\`\`\`json
{
  "noEmit": true,           // 不输出文件（只类型检查）
  "noEmitOnError": true     // 类型错误时不输出
}
\`\`\`

**陷阱**：\`noEmit: true\` 配合 \`tsc -w\` 不会生成文件！开发用 ts-node/tsx 跑，tsc 只做检查。

#### 2. strict 全家桶

\`strict: true\` 等于开启：
- \`noImplicitAny\`：禁止隐式 any
- \`strictNullChecks\`：null/undefined 必须显式处理
- \`strictFunctionTypes\`：函数参数双向检查变逆变
- \`strictBindCallApply\`：bind/call/apply 严格类型
- \`strictPropertyInitialization\`：类属性必须初始化

#### 3. paths 别名

\`\`\`json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["src/*"],
    "@utils/*": ["src/utils/*"]
  }
}
\`\`\`

\`\`\`typescript
import { foo } from "@/utils/foo";  // 解析为 src/utils/foo
\`\`\`

**坑**：tsc 编译后 paths 不转换，运行时找不到！需要 \`tsc-alias\` 或 \`tsconfig-paths\`。

### 五、类型定义文件（.d.ts）

#### 1. 第三方库的类型

- **@types/react**：DefinitelyTyped 社区维护
- **包自带类型**：\`package.json\` 的 \`"types": "./dist/index.d.ts"\`

\`\`\`bash
# 检查包是否有类型
npm view lodash types  # undefined → 需要 @types/lodash
npm view axios types   # ./index.d.ts → 自带
\`\`\`

#### 2. 自定义 .d.ts

\`\`\`typescript
// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DB_URL: string;
    API_KEY: string;
    NODE_ENV: "development" | "production";
  }
}

// 现在用 process.env.DB_URL 有类型提示
\`\`\`

#### 3. 模块声明

\`\`\`typescript
// 给 .txt 文件加类型
declare module "*.txt" {
  const content: string;
  export default content;
}

// 给无类型的库加 any
declare module "untyped-lib";
\`\`\`

### 六、装饰器实战

装饰器是**实验性**特性，需要 \`experimentalDecorators: true\`：

\`\`\`typescript
// 类装饰器
function Log(target: Function) {
  console.log("类被创建:", target.name);
}

@Log
class MyClass {}

// 方法装饰器
function Timer(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: any[]) {
    const start = Date.now();
    const result = original.apply(this, args);
    console.log(key, "耗时:", Date.now() - start, "ms");
    return result;
  };
}

class Service {
  @Timer
  slowMethod() {
    // ...
  }
}
\`\`\`

**注意**：装饰器标准（TC39）已落地，但和旧的 \`experimentalDecorators\` 语法不兼容。NestJS 等框架仍用旧装饰器。

### 七、运行时类型检查

TS 类型只在编译时存在，运行时消失。要运行时校验，用 **zod**：

\`\`\`typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});

// 解析（不通过抛异常）
const user = UserSchema.parse(JSON.parse(jsonStr));

// 安全解析
const result = UserSchema.safeParse(input);
if (!result.success) {
  console.log(result.error.issues);
}
\`\`\`

**干货**：\`zod-to-ts\` 可以从 zod schema 生成 TS 类型，实现"单源真相"：

\`\`\`typescript
type User = z.infer<typeof UserSchema>;  // 自动推导
\`\`\`

### 八、项目结构推荐

\`\`\`
project/
├── src/
│   ├── index.ts          # 入口
│   ├── utils/            # 工具
│   ├── modules/          # 业务模块
│   └── types/           # 类型定义
│       └── env.d.ts
├── tests/                # 测试（jest + ts-jest）
├── tsconfig.json
├── tsconfig.build.json   # 构建用（继承 base）
└── package.json
\`\`\`

\`\`\`json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "exclude": ["tests", "**/*.spec.ts"]
}
\`\`\`

### 九、常见错误排查

#### TS2307: Cannot find module

- 检查 \`moduleResolution\`：用 \`Node\` 或 \`NodeNext\`
- 检查 \`paths\` 配置
- 安装 \`@types/xxx\`

#### TS1479: The current file is a CommonJS module

- ESM 文件不能 import CommonJS（除非用 \`esModuleInterop\`）
- 检查 \`package.json\` 的 \`"type"\`

下面代码演示装饰器、类型推导、运行时校验。`,
    code: `// ============================================================
// TypeScript + Node 集成演示（用 JS 模拟 TS 特性）
// ============================================================

// ---- 1. tsconfig 关键配置展示 ----
console.log("===== 1. tsconfig 关键配置 =====");  // 打印日志到 stdout
const recommendedTsConfig = {  // 定义对象 recommendedTsConfig
  compilerOptions: {
    target: "ES2022",
    module: "NodeNext",
    moduleResolution: "NodeNext",
    esModuleInterop: true,
    strict: true,
    skipLibCheck: true,
    outDir: "./dist",
    rootDir: "./src",
    declaration: true,
    sourceMap: true,
    resolveJsonModule: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "dist"]
};

console.log("  推荐配置:");  // 打印日志到 stdout
console.log(JSON.stringify(recommendedTsConfig, null, 2).replace(/^/gm, "  "));  // 打印日志到 stdout

console.log("\\n  strict 全家桶包含:");  // 打印日志到 stdout
const strictOptions = [  // 定义数组 strictOptions
  "noImplicitAny (禁止隐式 any)",
  "strictNullChecks (null 必须显式)",
  "strictFunctionTypes (函数逆变)",
  "strictBindCallApply (bind/call/apply)",
  "strictPropertyInitialization (类属性初始化)",
  "alwaysStrict (输出 'use strict')",
  "noImplicitThis (this 必须有类型)"
];
strictOptions.forEach(s => console.log("    - " + s));

// ---- 2. 装饰器模拟 ----
console.log("\\n===== 2. 装饰器实战 =====");  // 打印日志到 stdout
// TS 装饰器在 JS 里用 Reflect.metadata 模拟
const metadataKey = "design:paramtypes";  // 定义常量 metadataKey

function LogClass(target) {  // 声明函数 LogClass
  console.log("  [类装饰器] 类被创建:", target.name);  // 打印日志到 stdout
  return target;  // 返回值
}

function Timer(target, key, desc) {  // 声明函数 Timer
  const original = desc.value;  // 定义常量 original
  desc.value = function (...args) {
    const start = Date.now();  // 定义常量 start
    const result = original.apply(this, args);  // 定义常量 result
    const elapsed = Date.now() - start;  // 定义常量 elapsed
    console.log("  [方法装饰器] " + key + " 耗时:", elapsed + "ms");  // 打印日志到 stdout
    return result;  // 返回值
  };
  return desc;  // 返回值
}

function Inject(dependency) {  // 声明函数 Inject
  return function (target, key, index) {  // 返回值
    console.log("  [参数装饰器] 注入", dependency, "到", key);  // 打印日志到 stdout
    target[key + "_deps"] = target[key + "_deps"] || [];
    target[key + "_deps"][index] = dependency;
  };
}

// TS 装饰器语法（仅展示，JS 中需手动应用）：
//   @LogClass
//   class UserService {
//     @Timer
//     getUser(id, @Inject("db") db) { ... }
//   }

// JS 中手动应用装饰器（等价效果）：
class UserService {  // 定义类 UserService
  getUser(id, db) {
    // 模拟耗时操作
    const start = Date.now();  // 定义常量 start
    while (Date.now() - start < 50) {}  // while 循环
    return { id, name: "user-" + id };  // 返回值
  }
}

// 1. 参数装饰器：标记依赖
Inject("db")(UserService.prototype, "getUser", 1);

// 2. 方法装饰器：包装方法
const desc = Object.getOwnPropertyDescriptor(UserService.prototype, "getUser");  // 定义常量 desc
Timer(UserService.prototype, "getUser", desc);
Object.defineProperty(UserService.prototype, "getUser", desc);

// 3. 类装饰器：日志
LogClass(UserService);

const service = new UserService();  // 创建实例 service
const user = service.getUser(1, "fake-db");  // 定义常量 user
console.log("  结果:", user);  // 打印日志到 stdout

// ---- 3. 类型推导模拟 ----
console.log("\\n===== 3. 类型推导（模拟） =====");  // 打印日志到 stdout
// TS 的 type inference：let x = 1 → x: number
function inferType(value) {  // 声明函数 inferType
  if (value === null) return "null";  // 条件判断
  if (value === undefined) return "undefined";  // 条件判断
  if (Array.isArray(value)) return "array";  // 条件判断
  return typeof value;  // 返回值
}

console.log("  let x = 1        →", inferType(1), "(number)");  // 打印日志到 stdout
console.log("  let s = 'hello'  →", inferType("hello"), "(string)");  // 打印日志到 stdout
console.log("  let arr = [1,2,3]→", inferType([1, 2, 3]), "(array)");  // 打印日志到 stdout
console.log("  let n = null     →", inferType(null), "(null)");  // 打印日志到 stdout
console.log("  let u = undefined→", inferType(undefined), "(undefined)");  // 打印日志到 stdout

// strictNullChecks 的效果
console.log("\\n  strictNullChecks: true 时:");  // 打印日志到 stdout
console.log("    let x: string = null  → 报错！");  // 打印日志到 stdout
console.log("    let x: string | null = null  → OK");  // 打印日志到 stdout
console.log("    function f(x: string) { x.length }  → 安全");  // 打印日志到 stdout
console.log("    function f(x: string | null) { x.length }  → 报错，需先判空");  // 打印日志到 stdout

// ---- 4. 运行时校验（zod 风格） ----
console.log("\\n===== 4. 运行时校验 =====");  // 打印日志到 stdout
class ZodLike {  // 定义类 ZodLike
  static object(shape) {
    return {  // 返回值
      parse(input) {
        const result = {};  // 定义对象 result
        const errors = [];  // 定义数组 errors
        for (const [key, validator] of Object.entries(shape)) {  // for 循环
          const value = input[key];  // 定义常量 value
          const err = validator(value);  // 定义常量 err
          if (err) errors.push({ path: key, message: err });  // 条件判断
          else result[key] = value;
        }
        if (errors.length) throw new Error("校验失败: " + JSON.stringify(errors));  // 条件判断
        return result;  // 返回值
      },
      safeParse(input) {
        try {  // 开启 try 块捕获异常
          return { success: true, data: this.parse(input) };  // 返回值
        } catch (e) {
          return { success: false, error: e.message };  // 返回值
        }
      }
    };
  }
  static string() {
    return (v) => typeof v === "string" ? null : "期望 string";  // 返回值
  }
  static number() {
    return (v) => typeof v === "number" && !isNaN(v) ? null : "期望 number";  // 返回值
  }
  static positiveInt() {
    return (v) => (Number.isInteger(v) && v > 0) ? null : "期望正整数";  // 返回值
  }
}

const UserSchema = ZodLike.object({  // 定义常量 UserSchema
  name: ZodLike.string(),
  age: ZodLike.positiveInt()
});

console.log("  Schema: { name: string, age: 正整数 }");  // 打印日志到 stdout

const good = UserSchema.safeParse({ name: "Alice", age: 20 });  // 定义常量 good
console.log("  合法输入:", good.success, good.data);  // 打印日志到 stdout

const bad = UserSchema.safeParse({ name: 123, age: -5 });  // 定义常量 bad
console.log("  非法输入:", bad.success, "->", bad.error);  // 打印日志到 stdout

// ---- 5. 模块系统对比 ----
console.log("\\n===== 5. 模块系统对比 =====");  // 打印日志到 stdout
const moduleSystems = [  // 定义数组 moduleSystems
  { name: "CommonJS", import: 'const fs = require("fs")', export: "module.exports = {}", topAwait: "❌" },
  { name: "ESM", import: 'import fs from "fs"', export: "export default {}", topAwait: "✅" },
  { name: "AMD", import: "define([...], fn)", export: "return {}", topAwait: "❌" }
];
moduleSystems.forEach(m => {
  console.log("  " + m.name.padEnd(12) + " | import: " + m.import);  // 打印日志到 stdout
  console.log("  ".padEnd(13) + " | export: " + m.export + " | 顶层 await: " + m.topAwait);  // 打印日志到 stdout
});

console.log("\\n  NodeNext 规则:");  // 打印日志到 stdout
console.log("    .js 文件 → CommonJS（默认）");  // 打印日志到 stdout
console.log("    package.json \\"type\\": \\"module\\" → ESM");  // 打印日志到 stdout
console.log("    .mjs 永远 ESM，.cjs 永远 CJS");  // 打印日志到 stdout
console.log("    ESM 中 import 必须带扩展名！");  // 打印日志到 stdout

// ---- 6. 类型定义文件 ----
console.log("\\n===== 6. 类型定义文件 (.d.ts) =====");  // 打印日志到 stdout
console.log("  - 第三方库类型：@types/lodash 或库自带 types 字段");  // 打印日志到 stdout
console.log("  - 自定义环境类型：");  // 打印日志到 stdout
console.log("    declare namespace NodeJS {");  // 打印日志到 stdout
console.log("      interface ProcessEnv {");  // 打印日志到 stdout
console.log("        DB_URL: string");  // 打印日志到 stdout
console.log("        NODE_ENV: 'development' | 'production'");  // 打印日志到 stdout
console.log("      }");  // 打印日志到 stdout
console.log("    }");  // 打印日志到 stdout
console.log("  - 模块声明：declare module '*.txt'");  // 打印日志到 stdout

// ---- 7. 运行方案对比 ----
console.log("\\n===== 7. 运行方案对比 =====");  // 打印日志到 stdout
const runTimes = [  // 定义数组 runTimes
  { name: "tsc + node", cmd: "tsc && node dist/app.js", speed: "慢", 用途: "生产部署" },
  { name: "ts-node", cmd: "ts-node app.ts", speed: "中", 用途: "开发调试" },
  { name: "tsx", cmd: "tsx app.ts", speed: "快10x", 用途: "开发推荐" },
  { name: "node --strip-types", cmd: "node app.ts", speed: "原生", 用途: "Node 22.6+ 实验" }
];
runTimes.forEach(r => {
  console.log("  " + r.name.padEnd(20) + " | " + r.cmd.padEnd(25) + " | " + r.speed.padEnd(8) + " | " + r.用途);  // 打印日志到 stdout
});

console.log("\\n===== TS + Node 集成要点 =====");  // 打印日志到 stdout
console.log("  1. module: NodeNext 是现代项目标配");  // 打印日志到 stdout
console.log("  2. strict: true 开启所有严格检查");  // 打印日志到 stdout
console.log("  3. paths 别名编译后要 tsc-alias 转换");  // 打印日志到 stdout
console.log("  4. 装饰器需要 experimentalDecorators");  // 打印日志到 stdout
console.log("  5. 运行时校验用 zod，类型用 z.infer 推导");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第六章：环境变量与配置管理
  // =========================================================
  {
    id: "node-config-management",
    group: "进阶干货",
    icon: "⚙️",
    title: "环境变量与配置管理",
    content: `## 环境变量与配置管理

配置管理是工程的"基础设施"。本章讲透 **.env 文件、12-Factor、配置层级、密钥管理、热重载** 这些生产级细节。

### 一、12-Factor App 的配置原则

> **配置应该和代码严格分离**。

"配置"指随环境变化的东西：
- 数据库连接串
- 第三方 API key
- 不同的域名（开发/测试/生产）
- 功能开关

**反例**：把数据库密码硬编码到代码里、提交到 git。一旦泄露，整个生产环境完蛋。

### 二、process.env 的真相

\`process.env\` 是一个**对象**，但有个坑：所有值都是**字符串**！

\`\`\`bash
# .env
PORT=3000
DEBUG=true
TIMEOUT=5000
\`\`\`

\`\`\`javascript
process.env.PORT     // "3000"（字符串！不是数字）
process.env.DEBUG    // "true"（字符串！不是布尔）
process.env.TIMEOUT  // "5000"（字符串）

if (process.env.DEBUG) { ... }  // ❌ "false" 也是 truthy！
\`\`\`

**正确做法**：

\`\`\`javascript
const port = parseInt(process.env.PORT, 10) || 3000;
const debug = process.env.DEBUG === "true";
const timeout = Number(process.env.TIMEOUT) || 5000;
\`\`\`

### 三、.env 文件管理

#### 1. dotenv 库

\`\`\`javascript
require("dotenv").config();
console.log(process.env.DB_URL);  // 从 .env 加载
\`\`\`

**原理**：dotenv 在进程启动时读取 .env 文件，把键值对写入 \`process.env\`。

#### 2. 多环境 .env 文件

\`\`\`
.env                # 默认（所有环境）
.env.local          # 本地覆盖（不提交）
.env.development    # 开发
.env.production     # 生产
.env.test           # 测试
\`\`\`

\`\`\`javascript
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: \`.env.\${env}\` });
dotenv.config({ path: ".env.local", override: true });
\`\`\`

#### 3. .gitignore 必须包含

\`\`\`
.env
.env.local
.env.*.local
\`\`\`

**踩坑点**：曾经有无数公司把 AWS key 提交到 GitHub，被自动扫描脚本盗用。

### 四、配置校验（必须做！）

启动时校验配置完整性，避免运行到一半才发现缺 key：

\`\`\`javascript
const required = ["DB_URL", "JWT_SECRET", "REDIS_URL"];
for (const key of required) {
  if (!process.env[key]) {
    console.error("缺少环境变量:", key);
    process.exit(1);
  }
}
\`\`\`

用 **envalid** 或 **zod** 更优雅：

\`\`\`javascript
import { envalid, str, num, bool } from "envalid";

const env = envalid.cleanEnv(process.env, {
  DB_URL: str(),
  PORT: num({ default: 3000 }),
  DEBUG: bool({ default: false }),
});
// 类型安全：env.PORT 是 number，env.DEBUG 是 boolean
\`\`\`

### 五、配置分层架构

**原则**：\`process.env\` → \`config\` 对象 → 业务代码

\`\`\`javascript
// config/index.js
const env = process.env.NODE_ENV || "development";

const defaults = {
  port: 3000,
  db: { url: "mongodb://localhost/dev" },
  redis: { url: "redis://localhost:6379" },
};

const envs = {
  development: { /* ... */ },
  production: {
    port: parseInt(process.env.PORT) || 80,
    db: { url: process.env.DB_URL },
    redis: { url: process.env.REDIS_URL },
  },
};

const config = Object.assign({}, defaults, envs[env]);
module.exports = config;
\`\`\`

业务代码只依赖 \`config\`，不直接读 \`process.env\`：

\`\`\`javascript
const config = require("./config");
app.listen(config.port);
// 不要：app.listen(process.env.PORT)
\`\`\`

### 六、密钥管理

#### 1. 本地：.env + dotenv

简单，适合个人开发。

#### 2. 团队：Vault / AWS Secrets Manager

\`\`\`javascript
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const client = new SecretsManagerClient({});

async function loadSecrets() {
  const response = await client.send(new GetSecretValueCommand({
    SecretId: "prod/myapp/db",
  }));
  return JSON.parse(response.SecretString);
}
\`\`\`

**优势**：密钥不落地磁盘，自动轮转，审计访问。

#### 3. K8s：Secret + 环境变量

\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DB_URL: <base64>
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        env:
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DB_URL
\`\`\`

### 七、配置热重载

某些场景需要**不重启进程**更新配置（如功能开关）：

#### 1. 文件 watch

\`\`\`javascript
const chokidar = require("chokidar");
let config = require("./config.json");
chokidar.watch("./config.json").on("change", () => {
  delete require.cache[require.resolve("./config.json")];
  config = require("./config.json");
  console.log("配置已热重载");
});
\`\`\`

#### 2. 远程配置中心

用 **Apollo** / **Nacos** / **etcd** 集中管理，客户端长轮询拉取更新：

\`\`\`javascript
const client = new ApolloClient({ /* ... */ });
client.on("change", (newConfig) => {
  config = newConfig;
});
\`\`\`

### 八、Docker 环境变量

#### 1. Dockerfile 用 ENV

\`\`\`dockerfile
FROM node:20
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "dist/app.js"]
\`\`\`

#### 2. docker run 传参

\`\`\`bash
docker run -e DB_URL=mongodb://... -e PORT=3000 myapp
docker run --env-file .env myapp
\`\`\`

#### 3. docker-compose.yml

\`\`\`yaml
services:
  app:
    image: myapp
    environment:
      - DB_URL=mongodb://db:27017
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
\`\`\`

### 九、敏感信息打印防护

\`\`\`javascript
// 防止日志泄露密钥
function safeLog(obj) {
  const masked = { ...obj };
  if (masked.password) masked.password = "***";
  if (masked.apiKey) masked.apiKey = masked.apiKey.slice(0, 4) + "***";
  if (masked.token) masked.token = "***";
  return masked;
}

console.log("请求:", safeLog(req.body));
\`\`\`

更彻底的方案：用 \`pino\` 的 redact 配置：

\`\`\`javascript
const pino = require("pino");
const logger = pino({
  redact: ["password", "apiKey", "*.token"],
});
\`\`\`

### 十、配置管理清单

- [ ] 所有配置通过 \`process.env\` 注入，不硬编码
- [ ] \`.env\` 文件加入 \`.gitignore\`
- [ ] 启动时校验必填配置
- [ ] 配置分环境：dev/staging/prod
- [ ] 密钥用 Secrets Manager，不放 .env
- [ ] 业务代码不直接读 \`process.env\`
- [ ] 日志输出前脱敏

下面代码演示配置加载、校验、分层、热重载。`,
    code: `// ============================================================
// 环境变量与配置管理演示
// ============================================================

// ---- 1. process.env 的坑 ----
console.log("===== 1. process.env 的坑 =====");  // 打印日志到 stdout
// 模拟从 .env 加载的环境变量
const fakeEnv = {  // 定义对象 fakeEnv
  PORT: "3000",
  DEBUG: "true",
  TIMEOUT: "5000",
  CACHE_SIZE: "0",
  RATIO: "0.85"
};

console.log("  原始值都是字符串:");  // 打印日志到 stdout
console.log("    PORT =", JSON.stringify(fakeEnv.PORT), "→ typeof:", typeof fakeEnv.PORT);  // 打印日志到 stdout
console.log("    DEBUG =", JSON.stringify(fakeEnv.DEBUG), "→ typeof:", typeof fakeEnv.DEBUG);  // 打印日志到 stdout

console.log("\\n  常见错误:");  // 打印日志到 stdout
console.log("    ❌ if (env.DEBUG) → 'false' 也是 truthy！");  // 打印日志到 stdout
console.log("    ❌ env.PORT + 1   → '30001' (字符串拼接)");  // 打印日志到 stdout
console.log("    ❌ env.CACHE_SIZE || 100 → '0' 是 truthy，不会用 100");  // 打印日志到 stdout

console.log("\\n  正确解析:");  // 打印日志到 stdout
function parseInt(v, def) { const n = Number(v); return Number.isFinite(n) ? n : def; }  // 声明函数 parseInt
function parseBool(v, def) {  // 声明函数 parseBool
  if (v === undefined) return def;  // 条件判断
  return v === "true" || v === "1" || v === "yes";  // 返回值
}
function parseFloat(v, def) { const n = Number(v); return Number.isFinite(n) ? n : def; }  // 声明函数 parseFloat

console.log("    PORT:", parseInt(fakeEnv.PORT, 3000), "(number)");  // 打印日志到 stdout
console.log("    DEBUG:", parseBool(fakeEnv.DEBUG, false), "(boolean)");  // 打印日志到 stdout
console.log("    TIMEOUT:", parseInt(fakeEnv.TIMEOUT, 5000), "(number)");  // 打印日志到 stdout
console.log("    CACHE_SIZE:", parseInt(fakeEnv.CACHE_SIZE, 100), "(number，0 不会被替换)");  // 打印日志到 stdout
console.log("    RATIO:", parseFloat(fakeEnv.RATIO, 0.5), "(float)");  // 打印日志到 stdout

// ---- 2. dotenv 原理模拟 ----
console.log("\\n===== 2. dotenv 原理 =====");  // 打印日志到 stdout
function parseDotenv(content) {  // 声明函数 parseDotenv
  const env = {};  // 定义对象 env
  const lines = content.split("\\n");  // 定义常量 lines
  for (const line of lines) {  // for 循环
    const trimmed = line.trim();  // 定义常量 trimmed
    if (!trimmed || trimmed.startsWith("#")) continue;  // 条件判断
    const eq = trimmed.indexOf("=");  // 定义常量 eq
    if (eq === -1) continue;  // 条件判断
    let key = trimmed.slice(0, eq).trim();  // 定义变量 key（可变）
    let value = trimmed.slice(eq + 1).trim();  // 定义变量 value（可变）
    // 处理引号
    if ((value.startsWith('"') && value.endsWith('"')) ||  // 条件判断
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // 支持 \${VAR} 引用（注意：代码字段是模板字符串，\${} 需转义）
    value = value.replace(/\\$\\{(\\w+)\\}/g, (_, ref) => env[ref] || process.env[ref] || "");
    env[key] = value;
  }
  return env;  // 返回值
}

const dotenvContent = \`# 应用配置  // 定义常量 dotenvContent
NODE_ENV=production
PORT=3000
DB_URL=mongodb://localhost/\\\${NODE_ENV}
API_KEY="abc123secret"
MULTILINE="line1\\nline2"\`;

const parsed = parseDotenv(dotenvContent);  // 定义常量 parsed
console.log("  解析 .env 内容:");  // 打印日志到 stdout
console.log("    " + JSON.stringify(parsed, null, 2).replace(/\\n/g, "\\n    "));  // 打印日志到 stdout

// ---- 3. 配置校验 ----
console.log("\\n===== 3. 启动时配置校验 =====");  // 打印日志到 stdout
function validateConfig(env, schema) {  // 声明函数 validateConfig
  const errors = [];  // 定义数组 errors
  const config = {};  // 定义对象 config
  for (const [key, rule] of Object.entries(schema)) {  // for 循环
    const value = env[key];  // 定义常量 value
    if (value === undefined || value === "") {  // 条件判断
      if (rule.required) errors.push(\`缺少必填: \${key}\`);  // 条件判断
      else config[key] = rule.default;
      continue;  // 跳过本次循环
    }
    // 类型转换
    let parsed;
    switch (rule.type) {  // switch 分支
      case "number": parsed = Number(value); break;  // case 分支
      case "boolean": parsed = value === "true"; break;  // case 分支
      case "url": parsed = value; break;  // case 分支
      default: parsed = value;  // 默认分支
    }
    if (rule.type === "number" && isNaN(parsed)) {  // 条件判断
      errors.push(\`\${key} 应为 number，得到: \${value}\`);
      continue;  // 跳过本次循环
    }
    if (rule.enum && !rule.enum.includes(parsed)) {  // 条件判断
      errors.push(\`\${key} 必须是 \${rule.enum.join("/")}, 得到: \${parsed}\`);
      continue;  // 跳过本次循环
    }
    config[key] = parsed;
  }
  return { config, errors };  // 返回值
}

const schema = {  // 定义对象 schema
  NODE_ENV: { type: "string", required: true, enum: ["development", "production", "test"] },
  PORT: { type: "number", default: 3000 },
  DB_URL: { type: "url", required: true },
  DEBUG: { type: "boolean", default: false }
};

// 合法配置
const good = validateConfig({ NODE_ENV: "production", PORT: "8080", DB_URL: "mongodb://x" }, schema);
console.log("  合法配置:");  // 打印日志到 stdout
console.log("    errors:", good.errors.length === 0 ? "无" : good.errors);  // 打印日志到 stdout
console.log("    config:", good.config);  // 打印日志到 stdout

// 非法配置
const bad = validateConfig({ PORT: "abc", DB_URL: "" }, schema);  // 定义常量 bad
console.log("  非法配置:");  // 打印日志到 stdout
console.log("    errors:", bad.errors);  // 打印日志到 stdout

// ---- 4. 配置分层 ----
console.log("\\n===== 4. 配置分层架构 =====");  // 打印日志到 stdout
const baseConfig = {  // 定义对象 baseConfig
  app: { name: "myapp", version: "1.0.0" },
  server: { port: 3000, timeout: 30000 },
  db: { url: "mongodb://localhost:27017", poolSize: 10 },
  redis: { url: "redis://localhost:6379", ttl: 3600 },
  log: { level: "info" }
};

const envConfigs = {  // 定义对象 envConfigs
  development: {
    server: { port: 3000 },
    db: { url: "mongodb://localhost:27017/dev" },
    log: { level: "debug" }
  },
  production: {
    server: { port: 80, timeout: 10000 },
    db: { url: process.env.DB_URL || "mongodb://prod:27017", poolSize: 50 },
    log: { level: "warn" }
  },
  test: {
    db: { url: "mongodb://localhost:27017/test" },
    log: { level: "error" }
  }
};

function deepMerge(target, source) {  // 声明函数 deepMerge
  const result = { ...target };  // 定义对象 result
  for (const key of Object.keys(source)) {  // for 循环
    if (typeof source[key] === "object" && !Array.isArray(source[key])) {  // 条件判断
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;  // 返回值
}

["development", "production", "test"].forEach(env => {
  const config = deepMerge(baseConfig, envConfigs[env]);  // 定义常量 config
  console.log("  [" + env + "] port=" + config.server.port + " db=" + config.db.url.slice(0, 30) + "... log=" + config.log.level);  // 打印日志到 stdout
});

// ---- 5. 敏感信息脱敏 ----
console.log("\\n===== 5. 日志脱敏 =====");  // 打印日志到 stdout
function mask(obj) {  // 声明函数 mask
  const result = { ...obj };  // 定义对象 result
  const sensitive = ["password", "apiKey", "token", "secret", "creditCard"];  // 定义数组 sensitive
  for (const key of Object.keys(result)) {  // for 循环
    if (sensitive.some(s => key.toLowerCase().includes(s))) {  // 条件判断
      const val = String(result[key]);  // 定义常量 val
      result[key] = val.length > 4 ? val.slice(0, 4) + "***" : "***";
    }
  }
  return result;  // 返回值
}

const request = {  // 定义对象 request
  username: "alice",
  password: "supersecret123",
  apiKey: "sk-abc123xyz",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  data: { foo: "bar" }
};

console.log("  原始:", request.password, request.apiKey);  // 打印日志到 stdout
console.log("  脱敏:", mask(request).password, mask(request).apiKey);  // 打印日志到 stdout

// ---- 6. 12-Factor 配置原则 ----
console.log("\\n===== 6. 12-Factor 配置清单 =====");  // 打印日志到 stdout
const checklist = [  // 定义数组 checklist
  "✓ 配置存环境变量，不硬编码",
  "✓ .env 加入 .gitignore",
  "✓ 启动时校验必填项",
  "✓ 分环境：dev/staging/prod",
  "✓ 密钥用 Secrets Manager",
  "✓ 业务代码读 config，不读 process.env",
  "✓ 日志输出前脱敏",
  "✓ Docker 用 -e 或 --env-file 注入"
];
checklist.forEach(c => console.log("  " + c));

// ---- 7. 热重载配置 ----
console.log("\\n===== 7. 配置热重载 =====");  // 打印日志到 stdout
const fs = require("fs");  // 导入模块 fs；require 返回 module.exports
const os = require("os");  // 导入模块 os；require 返回 module.exports
const path = require("path");  // 导入模块 path；require 返回 module.exports

const configFile = path.join(os.tmpdir(), "hot-config-" + process.pid + ".json");  // 拼接路径 configFile
fs.writeFileSync(configFile, JSON.stringify({ feature_x: false }));  // 同步写入文件

let hotConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));  // 定义变量 hotConfig（可变）
console.log("  初始配置:", hotConfig);  // 打印日志到 stdout

// 模拟配置变更
setTimeout(() => {  // 延时回调（宏任务，timers 阶段执行）
  fs.writeFileSync(configFile, JSON.stringify({ feature_x: true }));  // 同步写入文件
  // 真实环境用 chokidar 监听 change 事件
  hotConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));
  console.log("  热重载后:", hotConfig);  // 打印日志到 stdout
  fs.unlinkSync(configFile);
}, 100);

console.log("\\n===== 配置管理要点 =====");  // 打印日志到 stdout
console.log("  1. process.env 全是字符串，必须显式转换");  // 打印日志到 stdout
console.log("  2. .env 只放本地，密钥用 Secrets Manager");  // 打印日志到 stdout
console.log("  3. 启动校验 + 分层架构是标配");  // 打印日志到 stdout
console.log("  4. 业务读 config，不读 process.env");  // 打印日志到 stdout
console.log("  5. 日志输出前必脱敏");`,  // 打印日志到 stdout
  },

  // =========================================================
  // 第七章：进程守护与部署
  // =========================================================
  {
    id: "node-process-supervision",
    group: "进阶干货",
    icon: "🛡️",
    title: "进程守护与部署",
    content: `## 进程守护与部署

Node.js 进程崩溃后不会自动重启。本章讲透 **PM2、systemd、Docker、K8s、零停机部署、日志收集** 这些生产级方案。

### 一、为什么需要进程守护

Node.js 进程会因以下原因崩溃：
- **未捕获的异常**：\`throw\` 没被 try/catch
- **未处理的 Promise rejection**：Node 15+ 默认退出
- **内存泄漏**：堆溢出 OOM
- **事件循环空转**：CPU 100%
- **依赖服务挂掉**：数据库、Redis 连接断开

**守护进程要做**：崩溃后自动重启、日志持久化、负载均衡、零停机重启。

### 二、PM2：最流行的进程管理器

#### 1. 基本使用

\`\`\`bash
npm install -g pm2

# 启动
pm2 start app.js --name myapp

# 启动多实例（负载均衡）
pm2 start app.js -i 4       # 4 个实例
pm2 start app.js -i max     # CPU 核心数个实例

# 查看
pm2 list
pm2 logs
pm2 monit

# 重启（零停机）
pm2 reload all              # 逐个重启，无缝切换
pm2 restart all             # 全部立即重启（有停顿）

# 停止删除
pm2 stop myapp
pm2 delete myapp
\`\`\`

#### 2. ecosystem 配置文件

\`\`\`javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "myapp",
    script: "dist/app.js",
    instances: "max",         // CPU 核心数
    exec_mode: "cluster",    // 集群模式
    max_memory_restart: "1G", // 内存超 1G 重启
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    env_staging: {
      NODE_ENV: "staging",
      PORT: 3001
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    autorestart: true,
    watch: false,
    cron_restart: "0 3 * * *"  // 每天凌晨 3 点重启
  }]
};
\`\`\`

\`\`\`bash
pm2 start ecosystem.config.js --env staging
\`\`\`

#### 3. PM2 的核心机制

- **Cluster 模式**：用 Node \`cluster\` 模块 fork 多个 worker
- **零停机 reload**：逐个重启 worker，反向代理切换流量
- **日志切割**：\`pm2-logrotate\` 模块
- **开机自启**：\`pm2 startup\` + \`pm2 save\`

#### 4. PM2 的局限

- **不适合容器**：Docker 里通常一个进程，PM2 多了层浪费
- **集群通信弱**：worker 间状态同步要自己用 Redis
- **Windows 支持差**：生产环境不推荐 Windows

### 三、systemd：Linux 原生方案

\`\`\`ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Node.js App
After=network.target

[Service]
Type=simple
User=nodeuser
WorkingDirectory=/var/www/myapp
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/app.js
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
sudo systemctl start myapp
sudo systemctl enable myapp      # 开机自启
sudo systemctl status myapp
sudo journalctl -u myapp -f     # 查看日志
\`\`\`

**优势**：Linux 原生，无第三方依赖，性能开销低。
**劣势**：单进程，需自己处理多核（用 cluster）。

### 四、Docker 部署

#### 1. Dockerfile 最佳实践

\`\`\`dockerfile
# 多阶段构建：build 阶段用全量镜像
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# 运行阶段：用精简镜像
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
USER node                            # 非 root 运行
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/app.js"]
\`\`\`

**关键点**：
- 用 \`alpine\` 镜像（5MB vs 900MB）
- 多阶段构建，最终镜像不含 devDependencies
- \`npm ci\` 比 \`npm install\` 快且确定（用 lockfile）
- 非 root 用户运行（\`USER node\`）
- HEALTHCHECK 让 Docker 知道进程是否健康

#### 2. docker-compose.yml

\`\`\`yaml
version: "3.8"
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - DB_URL=mongodb://db:27017
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  db:
    image: mongo:7
    volumes: ["dbdata:/data/db"]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s

volumes:
  dbdata:
\`\`\`

#### 3. .dockerignore

\`\`\`
node_modules
npm-debug.log
.git
.env
dist
tests
*.md
\`\`\`

**关键**：不忽略 \`node_modules\` 会把本地依赖复制进镜像，巨大且污染。

### 五、K8s 部署

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:v1
        resources:
          requests: { memory: "128M", cpu: "100m" }
          limits: { memory: "512M", cpu: "500m" }
        livenessProbe:
          httpGet: { path: /health, port: 3000 }
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet: { path: /ready, port: 3000 }
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DB_URL
---
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

#### liveness vs readiness 区别

| 探针 | 作用 | 失败后果 |
| --- | --- | --- |
| **liveness** | 进程是否存活 | 重启容器 |
| **readiness** | 是否准备好接流量 | 从负载均衡摘除（不重启） |
| **startup** | 是否启动完成 | 阻止前两者检查（慢启动应用） |

**最佳实践**：
- liveness 检查 \`/health\`：进程不死
- readiness 检查 \`/ready\`：依赖是否就绪（DB、Redis 连通）
- 慢启动应用加 startupProbe

### 六、零停机部署

#### 1. 滚动更新（K8s 默认）

\`\`\`yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1          # 最多多 1 个
    maxUnavailable: 0    # 不允许减少（保证可用）
\`\`\`

#### 2. 蓝绿部署

\`\`\`
旧版本（蓝） ← 流量
新版本（绿） 部署完成 → 切流量 → 删除蓝
\`\`\`

#### 3. 金丝雀发布

\`\`\`
旧版本 90% ← 流量
新版本 10% ← 试探性流量
→ 逐步增加新版本比例 → 100% 切换
\`\`\`

### 七、优雅关闭（Graceful Shutdown）

收到 SIGTERM 后，进程要：
1. **停止接受新请求**：关闭 HTTP server
2. **处理完进行中的请求**：等待 \`server.close()\`
3. **清理资源**：关闭数据库连接、flush 日志
4. **退出**：\`process.exit(0)\`

\`\`\`javascript
process.on("SIGTERM", async () => {
  console.log("收到 SIGTERM，开始优雅关闭");
  server.close();           // 停止接受新连接
  await db.close();          // 关闭数据库
  await redis.quit();        // 关闭 Redis
  process.exit(0);
});

// 超时强制退出（K8s 默认 30s 后 SIGKILL）
setTimeout(() => process.exit(1), 25000).unref();
\`\`\`

**坑**：\`server.close()\` 只关闭监听，不处理中的请求不会断开。需要主动追踪连接数。

### 八、日志收集

#### 1. 输出到 stdout/stderr

\`\`\`javascript
console.log("info");    // stdout
console.error("error"); // stderr
\`\`\`

**12-Factor 原则**：日志输出到 stdout，文件由平台（Docker/K8s）收集。

#### 2. 容器日志查看

\`\`\`bash
docker logs -f myapp
kubectl logs -f pod/myapp-xxx
kubectl logs -f -l app=myapp --tail=100
\`\`\`

#### 3. 集中日志：ELK / Loki

\`\`\`
应用 → stdout → Fluentd/Filebeat → Elasticsearch/Loki → Kibana/Grafana
\`\`\`

推荐用 **pino** + **pino-pretty**（开发）+ **pino-transport**（生产）：

\`\`\`javascript
const pino = require("pino");
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined  // 生产输出 JSON 到 stdout
});
\`\`\`

### 九、监控告警

#### 1. Prometheus + Grafana

\`\`\`javascript
const { collectDefaultMetrics, register } = require("prom-client");
collectDefaultMetrics();

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
\`\`\`

#### 2. 自定义指标

\`\`\`javascript
const { Counter, Histogram } = require("prom-client");
const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"],
});
\`\`\`

### 十、部署检查清单

- [ ] 健康检查端点：\`/health\` + \`/ready\`
- [ ] 优雅关闭：处理 SIGTERM
- [ ] 日志输出到 stdout
- [ ] 非 root 用户运行
- [ ] 资源限制（memory/cpu）
- [ ] 配置从环境变量读取
- [ ] 镜像最小化（多阶段构建）
- [ ] 健康探针配置

下面代码演示优雅关闭、健康检查、PM2 配置。`,
    code: `// ============================================================
// 进程守护与部署演示（沙箱兼容版）
// ------------------------------------------------------------
// 注：沙箱未开放 http 模块，用 mock createServer 演示优雅关闭模式。
// 生产环境请用真实 require("http")（见 content 字段）。
// ============================================================
const http = {
  createServer(handler) {
    return {
      _closed: false,
      close(cb) {
        this._closed = true;
        if (cb) setImmediate(cb);
      },
      listen() { return this; },
    };
  },
};
const os = require("os");

// ---- 1. 健康检查端点 ----
console.log("===== 1. 健康检查端点 =====");
const healthState = {
  startTime: Date.now(),
  isReady: false,
  dbConnected: false,
  redisConnected: false
};

// 模拟依赖初始化
setTimeout(() => { healthState.dbConnected = true; }, 100);
setTimeout(() => { healthState.redisConnected = true; }, 200);
setTimeout(() => { healthState.isReady = true; }, 300);

function livenessCheck() {
  // 进程活着就返回 true
  return true;
}

function readinessCheck() {
  // 所有依赖就绪才能接流量
  return healthState.isReady && healthState.dbConnected && healthState.redisConnected;
}

// 模拟检查
console.log("  启动时:");
console.log("    liveness  =", livenessCheck(), "(进程存活)");
console.log("    readiness =", readinessCheck(), "(未就绪)");

setTimeout(() => {
  console.log("  300ms 后:");
  console.log("    liveness  =", livenessCheck());
  console.log("    readiness =", readinessCheck(), "(已就绪)");
}, 350);

// ---- 2. 优雅关闭 ----
console.log("\\n===== 2. 优雅关闭 =====");
let activeRequests = 0;
let isShuttingDown = false;

const server = http.createServer((req, res) => {
  if (isShuttingDown) {
    res.writeHead(503);
    res.end("Server shutting down");
    return;
  }
  activeRequests++;
  // 模拟处理请求
  setTimeout(() => {
    res.end("OK");
    activeRequests--;
  }, 50);
});

function gracefulShutdown(signal) {
  console.log("  收到", signal, "，开始优雅关闭");
  isShuttingDown = true;
  
  // 1. 停止接受新请求
  server.close(() => {
    console.log("  HTTP server 已关闭");
  });
  
  // 2. 等待进行中的请求
  const checkInterval = setInterval(() => {
    console.log("  剩余请求:", activeRequests);
    if (activeRequests === 0) {
      clearInterval(checkInterval);
      console.log("  所有请求处理完成");
      // 3. 清理资源（模拟）
      console.log("  关闭数据库连接...");
      console.log("  关闭 Redis 连接...");
      // 4. 退出
      console.log("  优雅关闭完成");
      // 实际场景：process.exit(0);
    }
  }, 50);
  
  // 超时强制退出
  setTimeout(() => {
    console.log("  ⚠️ 超时，强制退出");
    // process.exit(1);
  }, 5000).unref();
}

// 演示优雅关闭（用 setTimeout 代替信号）
setTimeout(() => {
  gracefulShutdown("SIGTERM（模拟）");
}, 600);

// ---- 3. PM2 ecosystem 配置 ----
console.log("\\n===== 3. PM2 ecosystem 配置 =====");
const pm2Config = {
  apps: [{
    name: "myapp",
    script: "dist/app.js",
    instances: "max",
    exec_mode: "cluster",
    max_memory_restart: "1G",
    env: { NODE_ENV: "production", PORT: 3000 },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    autorestart: true,
    cron_restart: "0 3 * * *"
  }]
};
console.log("  PM2 配置:");
console.log(JSON.stringify(pm2Config, null, 2).replace(/^/gm, "  "));

console.log("\\n  PM2 核心命令:");
const pm2Cmds = [
  ["pm2 start ecosystem.config.js", "启动应用"],
  ["pm2 list", "查看进程"],
  ["pm2 logs", "查看日志"],
  ["pm2 reload all", "零停机重启"],
  ["pm2 monit", "实时监控"],
  ["pm2 startup", "开机自启"],
  ["pm2 save", "保存进程列表"]
];
pm2Cmds.forEach(([cmd, desc]) => console.log("    " + cmd.padEnd(36) + desc));

// ---- 4. Docker 部署清单 ----
console.log("\\n===== 4. Docker 部署清单 =====");
const dockerChecklist = [
  "✓ 多阶段构建（builder + runtime）",
  "✓ 用 alpine 精简镜像（5MB vs 900MB）",
  "✓ npm ci 而非 npm install",
  "✓ .dockerignore 排除 node_modules",
  "✓ 非 root 用户（USER node）",
  "✓ HEALTHCHECK 健康检查",
  "✓ EXPOSE 端口",
  '✓ CMD ["node", "dist/app.js"]'
];
dockerChecklist.forEach(c => console.log("  " + c));

console.log("\\n  Dockerfile 示例:");
const dockerfile = \`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK CMD wget --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/app.js"]\`;
console.log(dockerfile.split("\\n").map(l => "    " + l).join("\\n"));

// ---- 5. K8s 探针对比 ----
console.log("\\n===== 5. K8s 探针对比 =====");
const probes = [
  { name: "livenessProbe", 作用: "进程是否存活", 失败: "重启容器", 检查: "/health" },
  { name: "readinessProbe", 作用: "是否接流量",   失败: "摘除负载均衡", 检查: "/ready" },
  { name: "startupProbe",   作用: "是否启动完成", 失败: "阻塞前两者", 检查: "/started" }
];
probes.forEach(p => {
  console.log("  " + p.name.padEnd(16) + " | " + p.作用 + " | 失败:" + p.失败 + " | 检查:" + p.检查);
});

// ---- 6. 部署策略对比 ----
console.log("\\n===== 6. 部署策略对比 =====");
const strategies = [
  { name: "滚动更新", 停机: "无", 回滚: "中", 复杂度: "低", 说明: "K8s 默认" },
  { name: "蓝绿部署", 停机: "无", 回滚: "快", 复杂度: "中", 说明: "双倍资源" },
  { name: "金丝雀", 停机: "无", 回滚: "快", 复杂度: "高", 说明: "逐步切流" },
  { name: "重建",   停机: "有", 回滚: "慢", 复杂度: "最低", 说明: "停机更新" }
];
strategies.forEach(s => {
  console.log("  " + s.name.padEnd(8) + " | 停机:" + s.停机.padEnd(3) + " | 回滚:" + s.回滚.padEnd(3) + " | " + s.说明);
});

// ---- 7. 资源限制 ----
console.log("\\n===== 7. 资源限制 =====");
console.log("  K8s resources:");
console.log("    requests: 内存/CPU 下限（调度依据）");
console.log("    limits:   内存/CPU 上限（硬限制）");
console.log("  示例:");
console.log("    requests: { memory: '128M', cpu: '100m' }");
console.log("    limits:   { memory: '512M', cpu: '500m' }");
console.log("  → cpu 100m = 0.1 核");
console.log("  → 内存超限 OOMKilled，CPU 超限 throttle");

// ---- 8. 监控指标 ----
console.log("\\n===== 8. Prometheus 指标 =====");
console.log("  /metrics 端点输出:");
const metrics = [
  "# HELP http_requests_total Total HTTP requests",
  "# TYPE http_requests_total counter",
  'http_requests_total{method="GET",path="/",status="200"} 1234',
  "# HELP process_resident_memory_bytes Resident memory size",
  "# TYPE process_resident_memory_bytes gauge",
  "process_resident_memory_bytes 45678912",
  "# HELP nodejs_eventloop_lag_seconds Event loop lag",
  "nodejs_eventloop_lag_seconds 0.002"
];
metrics.forEach(m => console.log("    " + m));

console.log("\\n===== 进程守护与部署要点 =====");
console.log("  1. PM2 适合裸机，Docker/K8s 用原生编排");
console.log("  2. /health + /ready 双端点必备");
console.log("  3. SIGTERM 优雅关闭，超时强制退出");
console.log("  4. 日志输出 stdout，由平台收集");
console.log("  5. 多阶段构建 + alpine + 非 root");`,
  }
];
