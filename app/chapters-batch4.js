// =============================================================
// Node.js 交互式教程 —— 第四批章节（核心模块组，共 8 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：EventEmitter 事件系统
  // =========================================================
  {
    id: "node-eventemitter",
    group: "核心模块",
    icon: "🎧",
    title: "EventEmitter 事件系统",
    content: `## EventEmitter 事件系统

EventEmitter 是 Node.js **事件驱动架构**的基石。几乎所有 Node.js 核心模块都继承自 EventEmitter——HTTP 服务器、Stream 流、Process 进程、net 模块等。理解 EventEmitter 的工作原理，是深入掌握 Node.js 架构的关键。

### 什么是事件驱动？

事件驱动编程（Event-driven Programming）是一种编程范式：程序的执行流程由**事件**来决定，而不是由代码的顺序来决定。当某个事件发生时，注册的监听器（回调函数）被调用。

\`\`\`
传统同步编程：
  第1步 → 第2步 → 第3步 → 第4步（必须按顺序执行）

事件驱动编程：
  注册事件A监听器 → 注册事件B监听器
  当事件A触发 → 执行监听器A
  当事件B触发 → 执行监听器B
  （事件触发顺序不确定，由外部因素决定）
\`\`\`

### EventEmitter 核心 API

EventEmitter 位于 \`events\` 模块，提供了以下核心方法：

#### on(eventName, listener) / addListener(eventName, listener)
注册事件监听器。每次事件触发时，监听器都会执行。监听器按注册顺序同步调用。

#### once(eventName, listener)
注册**一次性**监听器。事件触发后自动移除，只执行一次。

#### emit(eventName, [...args])
触发事件，按注册顺序同步调用所有监听器。返回 \`true\` 表示有监听器，\`false\` 表示没有。

#### off(eventName, listener) / removeListener(eventName, listener)
移除指定的事件监听器。需要传入同一个函数引用。

#### removeAllListeners([eventName])
移除指定事件的所有监听器。若不传参数，移除所有事件的所有监听器。

### 事件命名约定

Node.js 中事件名通常使用 **camelCase** 命名。不要使用大写字母，因为事件名区分大小写：
- ✅ \`'data'\`, \`'end'\`, \`'connection'\`, \`'request'\`
- ❌ \`'DATA'\`, \`'End'\`, \`'Connection'\`

### maxListeners 警告

默认情况下，如果为同一个事件注册超过 10 个监听器，EventEmitter 会打印警告：

\`\`\`text
(node:12345) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
11 data listeners added. Use emitter.setMaxListeners() to increase limit
\`\`\`

这是为了防止内存泄漏——通常有过多监听器意味着代码设计有问题。可以通过 \`emitter.setMaxListeners(n)\` 调整上限，或设为 \`0\` 表示无限。

### error 事件特殊处理

**error 事件是 EventEmitter 中最特殊的**：如果触发 \`'error'\` 事件但没有监听器，Node.js 会**抛出错误并终止进程**。这是 Node.js 中处理错误的核心模式。

\`\`\`javascript
const EventEmitter = require("events");  // 导入模块 events；require 返回 module.exports
const emitter = new EventEmitter();  // 创建实例 emitter

// 如果没有监听 error 事件，emit 会抛出异常！
emitter.emit("error", new Error("致命错误")); // 进程崩溃！

// 正确做法：始终监听 error 事件
emitter.on("error", (err) => {
  console.error("捕获到错误:", err.message);  // 打印错误到 stderr
});
\`\`\`

### 自定义 EventEmitter

创建自定义 EventEmitter 有两种方式：
1. 直接实例化 EventEmitter
2. 继承 EventEmitter（推荐）：通过 ES6 的 \`extends\` 继承

### 事件驱动架构实践

事件驱动架构的优势：
- **解耦**：组件之间不直接依赖，通过事件通信
- **可扩展**：可以随时添加新的监听器而不影响现有代码
- **异步友好**：天然适合异步编程模型

下面这段代码演示了 EventEmitter 的完整使用模式。`,
    code: `// ============================================================
// 第一章代码演示：EventEmitter 事件系统
// ============================================================

const EventEmitter = require("events");

// ---- 1. EventEmitter 基本使用 ----
console.log("===== 1. EventEmitter 基本使用 =====");
const emitter = new EventEmitter();

// 注册事件监听器
emitter.on("greet", function (name) {
  console.log("  你好,", name + "!");
});

// 注册多个监听器（按注册顺序执行）
emitter.on("greet", function (name) {
  console.log("  欢迎回来,", name + "!");
});

// 触发事件
emitter.emit("greet", "小明");

// 检查是否有监听器
console.log("  greet 事件监听器数量:", emitter.listenerCount("greet"));

// ---- 2. once：一次性监听器 ----
console.log("\\n===== 2. once：一次性监听器 =====");
emitter.once("login", function (user) {
  console.log("  " + user + " 首次登录，发送欢迎邮件");
});

// 第一次触发：监听器执行
emitter.emit("login", "张三");
// 第二次触发：监听器已移除，不会执行
emitter.emit("login", "张三");
console.log("  login 事件监听器数量:", emitter.listenerCount("login"));

// ---- 3. off：移除监听器 ----
console.log("\\n===== 3. off：移除监听器 =====");
function onData(data) {
  console.log("  收到数据:", data);
}

emitter.on("data", onData);
emitter.emit("data", "第1条数据");

// 移除指定监听器
emitter.off("data", onData);
emitter.emit("data", "第2条数据"); // 不会输出
console.log("  data 事件监听器数量:", emitter.listenerCount("data"));

// ---- 4. removeAllListeners：移除所有监听器 ----
console.log("\\n===== 4. removeAllListeners =====");
emitter.on("event1", function () {});
emitter.on("event1", function () {});
emitter.on("event2", function () {});

console.log("  移除前 event1 监听器数:", emitter.listenerCount("event1"));
console.log("  移除前 event2 监听器数:", emitter.listenerCount("event2"));

// 移除 event1 的所有监听器
emitter.removeAllListeners("event1");
console.log("  移除后 event1 监听器数:", emitter.listenerCount("event1"));
console.log("  event2 监听器数（未移除）:", emitter.listenerCount("event2"));

// ---- 5. error 事件特殊处理 ----
console.log("\\n===== 5. error 事件特殊处理 =====");
const errorEmitter = new EventEmitter();

// 始终监听 error 事件，防止进程崩溃
errorEmitter.on("error", function (err) {
  console.log("  [捕获到错误]", err.message);
});

errorEmitter.emit("error", new Error("模拟的错误"));

// ---- 6. maxListeners 警告 ----
console.log("\\n===== 6. maxListeners 警告 =====");
const maxEmitter = new EventEmitter();
maxEmitter.setMaxListeners(15); // 调整上限为 15

// 注册 11 个监听器，不会触发警告
for (let i = 1; i <= 11; i++) {
  maxEmitter.on("test", function () {});
}
console.log("  注册了 11 个监听器，当前上限:", maxEmitter.getMaxListeners());
console.log("  无警告！因为已调高上限");

// ---- 7. 自定义 EventEmitter 类（继承） ----
console.log("\\n===== 7. 自定义 EventEmitter 类 =====");

// 创建一个任务管理器，继承 EventEmitter
class TaskManager extends EventEmitter {
  constructor() {
    super();
    this.tasks = [];
  }

  // 添加任务
  addTask(task) {
    this.tasks.push(task);
    // 任务添加时触发事件
    this.emit("taskAdded", task);
  }

  // 执行所有任务
  runAll() {
    if (this.tasks.length === 0) {
      this.emit("empty");
      return;
    }

    console.log("  开始执行 " + this.tasks.length + " 个任务...");
    this.tasks.forEach(function (task, index) {
      // 任务开始执行
      this.emit("taskStart", task, index);
      // 模拟任务执行
      this.emit("taskComplete", task, index);
    }.bind(this));

    this.tasks = [];
    this.emit("done");
  }
}

const manager = new TaskManager();

// 监听各种事件
manager.on("taskAdded", function (task) {
  console.log("  [任务添加] " + task);
});

manager.on("taskStart", function (task, index) {
  console.log("  [开始执行] 第" + (index + 1) + "个任务: " + task);
});

manager.on("taskComplete", function (task, index) {
  console.log("  [任务完成] " + task);
});

manager.on("empty", function () {
  console.log("  [提示] 没有待执行的任务");
});

manager.on("done", function () {
  console.log("  [全部完成] 所有任务执行完毕");
});

// 添加并执行任务
manager.addTask("文件压缩");
manager.addTask("数据备份");
manager.addTask("日志清理");
manager.runAll();

// 再次执行（无任务）
manager.runAll();

// ---- 8. listeners 和 eventNames ----
console.log("\\n===== 8. 事件信息查询 =====");
const infoEmitter = new EventEmitter();
infoEmitter.on("connect", function () {});
infoEmitter.on("connect", function () {});
infoEmitter.on("close", function () {});

console.log("  所有事件名:", infoEmitter.eventNames());
console.log("  connect 监听器列表:", infoEmitter.listeners("connect"));
console.log("  connect 监听器数量:", infoEmitter.listenerCount("connect"));
console.log("  close 监听器数量:", infoEmitter.listenerCount("close"));

console.log("\\n✅ EventEmitter 事件系统演示完成！");`,
  },

  // =========================================================
  // 第二章：HTTP 协议基础
  // =========================================================
  {
    id: "node-http-basics",
    group: "核心模块",
    icon: "🌐",
    title: "HTTP 协议基础",
    content: `## HTTP 协议基础

HTTP（HyperText Transfer Protocol）是 Web 的基石，也是 Node.js 后端开发的核心协议。深入理解 HTTP 的请求/响应结构、方法、状态码和头部，是构建可靠 Web 服务的前提。

### HTTP 请求结构

一个 HTTP 请求由三部分组成：

\`\`\`http
POST /api/users HTTP/1.1          ← 请求行（方法 + 路径 + 协议版本）
Host: example.com                  ← 请求头
Content-Type: application/json
Authorization: Bearer token123
                                    ← 空行（分隔头部和体）
{"name": "张三", "age": 25}        ← 请求体
\`\`\`

**请求行**包含：
- **方法（Method）**：定义对资源的操作意图
- **路径（Path）**：目标资源的 URL 路径
- **协议版本**：HTTP/1.0、HTTP/1.1、HTTP/2.0

### HTTP 方法详解

| 方法 | 语义 | 幂等性 | 请求体 | 典型用途 |
| --- | --- | --- | --- | --- |
| GET | 获取资源 | 是 | 无 | 查询、读取 |
| POST | 创建资源 | 否 | 有 | 新增、提交 |
| PUT | 完整替换资源 | 是 | 有 | 更新、替换 |
| PATCH | 部分更新资源 | 否 | 有 | 局部修改 |
| DELETE | 删除资源 | 是 | 可有 | 删除 |
| HEAD | 获取头部（无体） | 是 | 无 | 检查资源 |
| OPTIONS | 查询支持的方法 | 是 | 无 | CORS 预检 |

**幂等性**：多次执行相同请求，结果是否一致。GET 幂等，POST 不幂等。

### HTTP 状态码

状态码分为 5 类：

**1xx 信息**：请求已接收，继续处理
- 100 Continue：客户端应继续发送请求体

**2xx 成功**：请求成功处理
- 200 OK：请求成功
- 201 Created：资源创建成功（POST）
- 204 No Content：成功但无返回内容（DELETE）

**3xx 重定向**：需要进一步操作
- 301 Moved Permanently：永久重定向
- 302 Found：临时重定向
- 304 Not Modified：资源未修改（缓存）

**4xx 客户端错误**：请求有误
- 400 Bad Request：请求格式错误
- 401 Unauthorized：未认证
- 403 Forbidden：无权限
- 404 Not Found：资源不存在
- 405 Method Not Allowed：方法不允许
- 429 Too Many Requests：请求过多

**5xx 服务端错误**：服务器异常
- 500 Internal Server Error：服务器内部错误
- 502 Bad Gateway：网关错误
- 503 Service Unavailable：服务不可用

### HTTP 响应结构

\`\`\`http
HTTP/1.1 200 OK                   ← 状态行（协议版本 + 状态码 + 描述）
Content-Type: application/json     ← 响应头
Content-Length: 45
Cache-Control: no-cache
                                    ← 空行
{"id": 1, "name": "张三"}          ← 响应体
\`\`\`

### Content-Type 详解

Content-Type 告诉客户端响应体的数据格式：

| Content-Type | 说明 |
| --- | --- |
| application/json | JSON 数据 |
| text/html; charset=utf-8 | HTML 页面 |
| text/plain | 纯文本 |
| application/x-www-form-urlencoded | 表单提交 |
| multipart/form-data | 文件上传 |
| application/octet-stream | 二进制数据 |

### Cookie 机制

Cookie 是服务器存储在客户端的小型数据（通常 4KB 以内），用于会话管理、个性化设置和追踪。

\`\`\`javascript
// 设置 Cookie（响应头）
Set-Cookie: sessionId=abc123; HttpOnly; Secure; Max-Age=3600

// 发送 Cookie（请求头）
Cookie: sessionId=abc123; theme=dark
\`\`\`

Cookie 属性：
- **HttpOnly**：禁止 JavaScript 访问，防止 XSS
- **Secure**：仅 HTTPS 传输
- **Max-Age**：有效期（秒）
- **SameSite**：跨站请求控制（Strict/Lax/None）

### CORS 跨域概念

CORS（Cross-Origin Resource Sharing）是浏览器安全策略。当页面请求不同源的资源时，浏览器会阻止响应。

\`\`\`javascript
// 服务端设置 CORS 头允许跨域
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
\`\`\`

下面这段代码在不依赖 http 模块的情况下，演示 HTTP 请求的解析和响应的构建。`,
    code: `// ============================================================
// 第二章代码演示：HTTP 协议基础（不依赖 http 模块）
// ============================================================

// ---- 1. HTTP 请求解析 ----
console.log("===== 1. HTTP 请求解析 =====");

// 模拟一个原始 HTTP 请求
const rawRequest = \`POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: application/json
Authorization: Bearer token123
Content-Length: 45
Cookie: sessionId=abc123; theme=dark

{"name": "张三", "age": 25, "email": "zhangsan@example.com"}\`;

// 解析 HTTP 请求
function parseHttpRequest(raw) {
  // 分割头部和体（空行分隔）
  const parts = raw.split("\\n\\n");
  const headerSection = parts[0];
  const body = parts.slice(1).join("\\n\\n");

  // 解析请求行和头部
  const lines = headerSection.split("\\n");
  const requestLine = lines[0].split(" ");

  const request = {
    method: requestLine[0],           // HTTP 方法
    path: requestLine[1],             // 请求路径
    protocol: requestLine[2],         // 协议版本
    headers: {},                      // 请求头
    body: body.trim(),                // 请求体
  };

  // 解析请求头
  for (let i = 1; i < lines.length; i++) {
    const colonIndex = lines[i].indexOf(":");
    if (colonIndex > 0) {
      const key = lines[i].substring(0, colonIndex).trim();
      const value = lines[i].substring(colonIndex + 1).trim();
      request.headers[key.toLowerCase()] = value;
    }
  }

  return request;
}

const parsed = parseHttpRequest(rawRequest);
console.log("  方法:", parsed.method);
console.log("  路径:", parsed.path);
console.log("  协议:", parsed.protocol);
console.log("  Content-Type:", parsed.headers["content-type"]);
console.log("  Authorization:", parsed.headers["authorization"]);
console.log("  请求体:", parsed.body);

// ---- 2. URL 路径和查询参数解析 ----
console.log("\\n===== 2. URL 和查询参数解析 =====");

// 使用 URL 类解析（Node.js 全局可用）
const url1 = new URL("https://example.com/api/users?page=1&limit=10&sort=name");
console.log("  完整 URL:", url1.href);
console.log("  路径:", url1.pathname);
console.log("  查询字符串:", url1.search);

// 使用 URLSearchParams 解析查询参数
const params = new URLSearchParams(url1.search);
console.log("  page 参数:", params.get("page"));
console.log("  limit 参数:", params.get("limit"));
console.log("  sort 参数:", params.get("sort"));

// 遍历所有参数
console.log("  所有参数:");
params.forEach(function (value, key) {
  console.log("    " + key + " = " + value);
});

// ---- 3. HTTP 响应构建 ----
console.log("\\n===== 3. HTTP 响应构建 =====");

// 构建 HTTP 响应函数
function buildHttpResponse(statusCode, body, extraHeaders) {
  // 状态码和描述映射
  const statusMessages = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  };

  const statusMessage = statusMessages[statusCode] || "Unknown";
  const bodyStr = typeof body === "object" ? JSON.stringify(body) : String(body);

  // 默认响应头
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(bodyStr, "utf-8"),
    "Cache-Control": "no-cache",
    "X-Powered-By": "Node.js Tutorial",
    ...extraHeaders,
  };

  // 构建状态行
  const statusLine = "HTTP/1.1 " + statusCode + " " + statusMessage;

  // 构建响应头
  const headerLines = [];
  for (const key in headers) {
    headerLines.push(key + ": " + headers[key]);
  }

  // 拼接完整响应
  const response = statusLine + "\\n" + headerLines.join("\\n") + "\\n\\n" + bodyStr;

  return response;
}

// 200 成功响应
const successRes = buildHttpResponse(200, {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
});
console.log("  200 响应:\\n" + successRes);
console.log("  ---");

// 404 错误响应
const notFoundRes = buildHttpResponse(404, {
  error: "Not Found",
  message: "资源不存在",
});
console.log("  404 响应:\\n" + notFoundRes);
console.log("  ---");

// 201 创建响应（带自定义头）
const createdRes = buildHttpResponse(201, {
  id: 2,
  name: "新用户",
}, {
  "Location": "/api/users/2",
  "Set-Cookie": "sessionId=xyz789; HttpOnly; Max-Age=3600",
});
console.log("  201 响应:\\n" + createdRes);

// ---- 4. Content-Type 和数据格式转换 ----
console.log("\\n===== 4. Content-Type 和数据格式转换 =====");

// 根据 Content-Type 解析请求体
function parseBody(contentType, rawBody) {
  if (contentType.includes("application/json")) {
    // JSON 格式
    return JSON.parse(rawBody);
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    // 表单编码格式
    const params = new URLSearchParams(rawBody);
    const result = {};
    params.forEach(function (value, key) {
      result[key] = value;
    });
    return result;
  } else {
    // 纯文本
    return rawBody;
  }
}

// 测试 JSON 解析
const jsonBody = parseBody("application/json", '{"name":"张三","age":25}');
console.log("  JSON 解析结果:", JSON.stringify(jsonBody));

// 测试表单编码解析
const formBody = parseBody(
  "application/x-www-form-urlencoded",
  "username=zhangsan&password=123456&remember=true"
);
console.log("  表单解析结果:", JSON.stringify(formBody));

// ---- 5. Cookie 解析 ----
console.log("\\n===== 5. Cookie 解析 =====");

// 解析 Cookie 字符串
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach(function (pair) {
    const parts = pair.trim().split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
  });

  return cookies;
}

const cookieStr = "sessionId=abc123; theme=dark; lang=zh-CN";
const cookies = parseCookies(cookieStr);
console.log("  解析的 Cookie:", JSON.stringify(cookies));
console.log("  sessionId:", cookies.sessionId);
console.log("  theme:", cookies.theme);

// ---- 6. CORS 头部构建 ----
console.log("\\n===== 6. CORS 头部构建 =====");

function buildCorsHeaders(origin, methods, allowedHeaders) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": methods || "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": allowedHeaders || "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // 预检请求缓存 24 小时
  };
}

const corsHeaders = buildCorsHeaders("https://myapp.com", "GET, POST, PUT", "Content-Type, Authorization");
console.log("  CORS 响应头:", JSON.stringify(corsHeaders, null, 2));

console.log("\\n✅ HTTP 协议基础演示完成！");`,
  },

  // =========================================================
  // 第三章：HTTP 模块进阶
  // =========================================================
  {
    id: "node-http-advanced",
    group: "核心模块",
    icon: "📡",
    title: "HTTP 模块进阶",
    content: `## HTTP 模块进阶

在实际项目中，HTTP 服务不仅要处理基本的请求和响应，还需要处理复杂的请求体解析、流式传输、缓存控制、内容协商等高级特性。本章深入这些进阶话题。

### 请求体解析

HTTP 请求体通过流的方式传输，服务端需要监听 \`data\` 事件收集数据块，在 \`end\` 事件中完成解析。常见格式：

#### JSON 解析
\`\`\`javascript
// 客户端发送：Content-Type: application/json
// {"name": "张三", "age": 25}
// 收集 Buffer 块，拼接后 JSON.parse()
\`\`\`

#### form-urlencoded 解析
\`\`\`javascript
// 客户端发送：Content-Type: application/x-www-form-urlencoded
// name=张三&age=25&hobby=编程
// 使用 URLSearchParams 或 querystring 模块解析
\`\`\`

#### multipart/form-data 解析
\`\`\`javascript
// 客户端发送：Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
// 用于文件上传，需要解析 boundary 分隔符
// 包含文件二进制数据和普通表单字段
\`\`\`

### 响应流式传输

大文件或大数据不应该一次性加载到内存再发送，应该使用**流式传输**（Streaming），边读边发：

\`\`\`javascript
// ❌ 错误做法：全部读入内存
const data = fs.readFileSync("bigfile.mp4"); // 可能 1GB+
res.end(data); // 内存爆炸！

// ✅ 正确做法：流式传输
fs.createReadStream("bigfile.mp4").pipe(res);  // 创建可读流（分块读取大文件）
// 内存占用极低，恒定在 64KB 左右
\`\`\`

### Keep-Alive 持久连接

HTTP/1.1 默认开启 Keep-Alive，允许在同一个 TCP 连接上发送多个请求/响应，避免频繁建立和关闭连接的开销。

\`\`\`javascript
// 响应头中设置 Keep-Alive
Connection: keep-alive
Keep-Alive: timeout=5, max=1000
// timeout=5：空闲 5 秒后关闭连接
// max=1000：此连接最多处理 1000 个请求
\`\`\`

### 分块传输编码

当响应体大小未知时（如实时生成的数据），可以使用分块传输编码（Transfer-Encoding: chunked）：

\`\`\`http
HTTP/1.1 200 OK
Transfer-Encoding: chunked

7\\r\\n           ← 十六进制表示当前块的大小（7 字节）
Mozilla\\r\\n      ← 块数据
9\\r\\n           ← 下一块大小（9 字节）
Developer\\r\\n    ← 块数据
0\\r\\n           ← 0 表示传输结束
\\r\\n
\`\`\`

### 缓存控制头

缓存是 Web 性能优化的核心手段。HTTP 提供了多层次的缓存控制：

#### 强缓存（Cache-Control / Expires）
\`\`\`javascript
Cache-Control: max-age=3600        // 缓存 1 小时
Cache-Control: no-cache            // 每次验证后再使用
Cache-Control: no-store            // 不缓存任何内容
Cache-Control: public, max-age=86400  // 公共缓存 1 天
\`\`\`

#### 协商缓存（ETag / Last-Modified）
\`\`\`javascript
// 首次请求：服务器返回 ETag
ETag: "abc123"

// 后续请求：客户端发送 If-None-Match
If-None-Match: "abc123"

// 资源未修改 → 304 Not Modified
// 资源已修改 → 200 + 新内容 + 新 ETag
\`\`\`

### 内容协商

同一 URL 可以返回不同格式的内容，取决于客户端的 Accept 头：

\`\`\`javascript
// 客户端请求
Accept: application/json          // 优先 JSON
Accept-Language: zh-CN, en;q=0.9  // 优先中文

// 服务端根据 Accept 头选择返回格式
// Accept: application/json → 返回 JSON
// Accept: text/html → 返回 HTML
\`\`\`

下面这段代码使用流和 Buffer 演示 HTTP 请求体解析和响应构建的进阶实践。`,
    code: `// ============================================================
// 第三章代码演示：HTTP 模块进阶（流和 Buffer 模拟）
// ============================================================

const { Transform } = require("stream");

// ---- 1. 请求体解析（JSON） ----
console.log("===== 1. 请求体解析（JSON） =====");

// 模拟接收到的 JSON 请求体数据块
const jsonChunks = [
  Buffer.from('{"name":"张'),
  Buffer.from('三","age":2'),
  Buffer.from('5,"email":"z'),
  Buffer.from('hangsan@example.com"}'),
];

// 收集缓冲区并解析
function parseJsonBody(chunks) {
  // 拼接所有 Buffer 块
  const total = Buffer.concat(chunks);
  const bodyStr = total.toString("utf-8");
  console.log("  接收到的原始数据:", bodyStr);
  // 解析 JSON
  const body = JSON.parse(bodyStr);
  return body;
}

const jsonResult = parseJsonBody(jsonChunks);
console.log("  解析结果:", JSON.stringify(jsonResult, null, 2));

// ---- 2. 请求体解析（form-urlencoded） ----
console.log("\\n===== 2. 请求体解析（form-urlencoded） =====");

const formChunks = [
  Buffer.from("username=zhangsan&"),
  Buffer.from("password=123456&"),
  Buffer.from("remember=true"),
];

function parseFormBody(chunks) {
  const total = Buffer.concat(chunks);
  const bodyStr = total.toString("utf-8");
  console.log("  接收到的原始数据:", bodyStr);

  const params = new URLSearchParams(bodyStr);
  const result = {};
  params.forEach(function (value, key) {
    result[key] = value;
  });
  return result;
}

const formResult = parseFormBody(formChunks);
console.log("  解析结果:", JSON.stringify(formResult, null, 2));

// ---- 3. 请求体解析（multipart/form-data 模拟） ----
console.log("\\n===== 3. multipart/form-data 解析模拟 =====");

const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
const multipartBody = Buffer.from(
  "--" + boundary + "\\r\\n" +
  'Content-Disposition: form-data; name="username"\\r\\n\\r\\n' +
  "zhangsan\\r\\n" +
  "--" + boundary + "\\r\\n" +
  'Content-Disposition: form-data; name="file"; filename="test.txt"\\r\\n' +
  "Content-Type: text/plain\\r\\n\\r\\n" +
  "Hello World!\\r\\n" +
  "--" + boundary + "--\\r\\n"
);

// 简易 multipart 解析器
function parseMultipart(buffer, boundary) {
  const boundaryBuffer = Buffer.from("--" + boundary);
  const result = { fields: {}, files: [] };

  // 按 boundary 分割
  const parts = [];
  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;

  while (start < buffer.length) {
    let end = buffer.indexOf(boundaryBuffer, start);
    if (end === -1) end = buffer.length;

    // 跳过 \\r\\n
    let pos = start;
    while (pos < end && (buffer[pos] === 13 || buffer[pos] === 10)) pos++;

    const partData = buffer.slice(pos, end - 2); // 去掉尾部 \\r\\n
    if (partData.length > 0) {
      parts.push(partData);
    }

    start = end + boundaryBuffer.length;
  }

  // 解析每个部分
  parts.forEach(function (part) {
    const headerEnd = part.indexOf(Buffer.from("\\r\\n\\r\\n"));
    if (headerEnd === -1) return;

    const headerStr = part.slice(0, headerEnd).toString("utf-8");
    const bodyData = part.slice(headerEnd + 4);

    // 提取 name 属性
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : "unknown";

    // 提取 filename 属性（判断是否为文件）
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      result.files.push({
        fieldName: name,
        fileName: filenameMatch[1],
        data: bodyData,
        size: bodyData.length,
      });
    } else {
      result.fields[name] = bodyData.toString("utf-8");
    }
  });

  return result;
}

const multipartResult = parseMultipart(multipartBody, boundary);
console.log("  表单字段:", JSON.stringify(multipartResult.fields));
console.log("  上传文件:", multipartResult.files.length, "个");
multipartResult.files.forEach(function (file) {
  console.log("    文件名:", file.fileName);
  console.log("    大小:", file.size, "字节");
  console.log("    内容:", file.data.toString("utf-8"));
});

// ---- 4. 分块传输编码（Transfer-Encoding: chunked） ----
console.log("\\n===== 4. 分块传输编码（chunked） =====");

// 模拟构建 chunked 响应
function buildChunkedResponse(chunks) {
  const newline = Buffer.from("\\r\\n");
  const buffers = [];

  chunks.forEach(function (chunk) {
    const chunkBuffer = Buffer.from(chunk, "utf-8");
    // 块大小（十六进制）
    buffers.push(Buffer.from(chunkBuffer.length.toString(16), "utf-8"));
    buffers.push(newline);
    // 块数据
    buffers.push(chunkBuffer);
    buffers.push(newline);
  });

  // 结束块
  buffers.push(Buffer.from("0", "utf-8"));
  buffers.push(newline);
  buffers.push(newline);

  return Buffer.concat(buffers);
}

const chunks = ["第一块数据", "第二块数据", "第三块数据"];
const chunkedResponse = buildChunkedResponse(chunks);
console.log("  Chunked 响应原始数据（十六进制）:");
console.log("  " + chunkedResponse.toString("hex"));

// 解析 chunked 响应
function parseChunkedResponse(response) {
  const result = [];
  let pos = 0;

  while (pos < response.length) {
    // 查找块大小行结束
    let lineEnd = response.indexOf(Buffer.from("\\r\\n"), pos);
    const sizeHex = response.slice(pos, lineEnd).toString("utf-8");
    const chunkSize = parseInt(sizeHex, 16);

    if (chunkSize === 0) {
      // 结束块
      break;
    }

    pos = lineEnd + 2; // 跳过 \\r\\n
    const chunkData = response.slice(pos, pos + chunkSize);
    result.push(chunkData.toString("utf-8"));

    pos = pos + chunkSize + 2; // 跳过数据和 \\r\\n
  }

  return result;
}

const parsedChunks = parseChunkedResponse(chunkedResponse);
console.log("  解析出的块:", parsedChunks);

// ---- 5. 缓存控制头构建 ----
console.log("\\n===== 5. 缓存控制头构建 =====");

const crypto = require("crypto");

// 模拟资源内容
const resourceContent = "这是需要缓存的资源内容";

// 生成 ETag（内容哈希）
function generateETag(content) {
  const hash = crypto.createHash("md5").update(content).digest("hex");
  return '"' + hash + '"';
}

// 生成 Last-Modified
function generateLastModified() {
  return new Date().toUTCString();
}

// 构建缓存相关响应头
function buildCacheHeaders(content, cacheType) {
  const headers = {};
  const etag = generateETag(content);

  switch (cacheType) {
    case "strong":
      // 强缓存：1 小时内直接使用缓存
      headers["Cache-Control"] = "public, max-age=3600";
      break;
    case "negotiate":
      // 协商缓存：每次验证
      headers["Cache-Control"] = "no-cache";
      headers["ETag"] = etag;
      headers["Last-Modified"] = generateLastModified();
      break;
    case "no-store":
      // 不缓存
      headers["Cache-Control"] = "no-store";
      break;
  }

  return headers;
}

console.log("  强缓存策略:", JSON.stringify(buildCacheHeaders(resourceContent, "strong")));
console.log("  协商缓存策略:", JSON.stringify(buildCacheHeaders(resourceContent, "negotiate")));
console.log("  不缓存策略:", JSON.stringify(buildCacheHeaders(resourceContent, "no-store")));

// 模拟 ETag 协商缓存验证
function checkETagMatch(clientETag, serverContent) {
  const serverETag = generateETag(serverContent);
  console.log("  客户端 ETag:", clientETag);
  console.log("  服务端 ETag:", serverETag);
  if (clientETag === serverETag) {
    return { status: 304, message: "Not Modified - 使用缓存" };
  } else {
    return { status: 200, message: "OK - 返回新内容", etag: serverETag };
  }
}

const etagForContent = generateETag(resourceContent);
console.log("\\n  协商缓存验证:");
console.log("  ETag 匹配时:", JSON.stringify(checkETagMatch(etagForContent, resourceContent)));
console.log("  ETag 不匹配时:", JSON.stringify(checkETagMatch('"old-etag"', resourceContent + "修改后")));

// ---- 6. 内容协商 ----
console.log("\\n===== 6. 内容协商（Accept 头解析） =====");

// 解析 Accept 头
function parseAccept(acceptHeader) {
  const types = acceptHeader.split(",").map(function (part) {
    const parts = part.trim().split(";");
    const mimeType = parts[0].trim();
    let quality = 1.0;

    if (parts.length > 1) {
      const qMatch = parts[1].trim().match(/^q=([\\d.]+)/);
      if (qMatch) {
        quality = parseFloat(qMatch[1]);
      }
    }

    return { mimeType: mimeType, quality: quality };
  });

  // 按 quality 降序排序
  types.sort(function (a, b) { return b.quality - a.quality; });
  return types;
}

// 服务端支持的内容类型
const supportedTypes = ["application/json", "text/html", "text/plain"];

// 内容协商函数
function negotiateContent(acceptHeader) {
  const clientTypes = parseAccept(acceptHeader);
  console.log("  客户端偏好:");
  clientTypes.forEach(function (t) {
    console.log("    " + t.mimeType + " (q=" + t.quality + ")");
  });

  // 找到第一个匹配的支持类型
  for (let i = 0; i < clientTypes.length; i++) {
    if (supportedTypes.indexOf(clientTypes[i].mimeType) !== -1) {
      return clientTypes[i].mimeType;
    }
  }

  // 默认返回 JSON
  return "application/json";
}

const accept1 = "text/html, application/json;q=0.9, */*;q=0.8";
console.log("  请求 Accept: " + accept1);
console.log("  协商结果: " + negotiateContent(accept1));

const accept2 = "application/xml, application/json;q=0.9";
console.log("\\n  请求 Accept: " + accept2);
console.log("  协商结果: " + negotiateContent(accept2));

// ---- 7. 流式响应构建模拟 ----
console.log("\\n===== 7. 流式响应构建 =====");

// 使用 Transform 流模拟流式响应处理
const upperTransform = new Transform({
  transform(chunk, encoding, callback) {
    // 将数据转为大写（模拟处理）
    const upper = chunk.toString().toUpperCase();
    callback(null, Buffer.from(upper));
  },
});

// 监听流事件
let streamOutput = "";
upperTransform.on("data", function (chunk) {
  streamOutput += chunk.toString();
  console.log("  收到数据块:", chunk.toString());
});

upperTransform.on("end", function () {
  console.log("  流处理完成，最终结果:", streamOutput);
});

// 写入数据
upperTransform.write(Buffer.from("hello "));
upperTransform.write(Buffer.from("world "));
upperTransform.write(Buffer.from("stream!"));
upperTransform.end();

console.log("\\n✅ HTTP 模块进阶演示完成！");`,
  },

  // =========================================================
  // 第四章：Stream 流基础
  // =========================================================
  {
    id: "node-stream-basics",
    group: "核心模块",
    icon: "🌊",
    title: "Stream 流基础",
    content: `## Stream 流基础

Stream 是 Node.js 最强大的抽象之一。它允许你以**流式**的方式处理数据，而不是一次性加载全部数据到内存。无论是读取文件、处理 HTTP 请求、还是压缩数据，流都是高效处理大数据的基础。

### 为什么需要流？

考虑这样一个场景：你需要读取一个 2GB 的日志文件并进行分析。

\`\`\`javascript
// ❌ 不使用流：将整个文件加载到内存
const data = fs.readFileSync("huge.log"); // 2GB 内存占用！
// 在内存受限的服务器上会直接崩溃

// ✅ 使用流：每次只读取一小块数据
const stream = fs.createReadStream("huge.log");  // 文件操作结果 stream
stream.on("data", (chunk) => {
  // 每次只处理 64KB，内存占用恒定为 64KB
  processChunk(chunk);
});
\`\`\`

### 四种流类型

Node.js 的流分为四种类型：

| 类型 | 说明 | 典型例子 |
| --- | --- | --- |
| **Readable** | 可读流，数据来源 | fs.createReadStream(), process.stdin |
| **Writable** | 可写流，数据目的地 | fs.createWriteStream(), process.stdout |
| **Duplex** | 双向流，可读可写 | net.Socket, TLS socket |
| **Transform** | 转换流，读写中间处理 | zlib.createGzip(), crypto 加密流 |

### pipe 管道

\`pipe()\` 是流的核心方法，它连接一个可读流和一个可写流，自动处理背压和数据传输：

\`\`\`javascript
// pipe 将可读流和可写流连接起来
readable.pipe(writable);

// 可以链式连接多个流
fs.createReadStream("input.txt")  // 创建可读流（分块读取大文件）
  .pipe(zlib.createGzip())    // 压缩
  .pipe(fs.createWriteStream("output.txt.gz"));  // 写入
\`\`\`

### 流的关键事件

可读流事件：
- **data**：有数据可读时触发（流动模式）
- **end**：数据读取完毕时触发
- **error**：读取过程中发生错误
- **close**：流关闭时触发

可写流事件：
- **drain**：缓冲区排空，可以继续写入
- **finish**：end() 被调用且所有数据写入完成
- **error**：写入过程中发生错误
- **close**：流关闭时触发

### 背压机制

背压（Backpressure）是流的核心特性之一。当可写流的消费速度跟不上可读流的产生速度时，流会自动降低读取速度，防止内存溢出。

\`\`\`javascript
// pipe 自动处理背压
// 当 writable 的缓冲区满时，pipe 会自动暂停 readable
// 当 writable 排空时（drain 事件），pipe 会自动恢复 readable
readable.pipe(writable);
\`\`\`

### 流模式 vs 暂停模式

可读流有两种模式：

**流动模式（Flowing Mode）**：数据自动从底层读取并通过事件推送。
- 通过 \`data\` 事件进入
- 通过 \`pipe()\` 进入
- 通过 \`resume()\` 进入

**暂停模式（Paused Mode）**：必须显式调用 \`read()\` 方法读取数据。
- 默认模式
- 通过 \`pause()\` 从流动模式切换
- 通过 \`unpipe()\` 从 pipe 中移除

\`\`\`javascript
// 流动模式：监听 data 事件
readable.on("data", (chunk) => { ... });

// 暂停模式：手动 read()
readable.on("readable", () => {
  let chunk;
  while ((chunk = readable.read()) !== null) {  // while 循环
    console.log(chunk);  // 打印日志到 stdout
  }
});
\`\`\`

下面这段代码演示了流的创建、pipe 管道和事件处理。`,
    code: `// ============================================================
// 第四章代码演示：Stream 流基础
// ============================================================

const { Readable, Writable } = require("stream");

// ---- 1. 创建自定义 Readable 流 ----
console.log("===== 1. 自定义 Readable 流 =====");

// 创建一个产生数据的可读流
class NumberReadable extends Readable {
  constructor(options) {
    super(options);
    this.current = 0;
    this.max = 5;
  }

  // _read 是 Readable 的核心方法，流内部会调用它来获取数据
  _read(size) {
    if (this.current >= this.max) {
      // 数据生成完毕，推送 null 表示结束
      this.push(null);
      return;
    }

    this.current++;
    const data = "数据块-" + this.current;
    console.log("  [Readable._read] 推送:", data);
    // push 数据到内部缓冲区
    this.push(Buffer.from(data, "utf-8"));
  }
}

const numberStream = new NumberReadable();

// 监听 data 事件（流动模式）
numberStream.on("data", function (chunk) {
  console.log("  [data 事件] 收到:", chunk.toString());
});

numberStream.on("end", function () {
  console.log("  [end 事件] 数据读取完毕");
});

// ---- 2. 创建自定义 Writable 流 ----
console.log("\\n===== 2. 自定义 Writable 流 =====");

// 创建一个写入数据的可写流
class LoggerWritable extends Writable {
  constructor(options) {
    super(options);
    this.writtenCount = 0;
  }

  // _write 是 Writable 的核心方法，每次写入数据时调用
  _write(chunk, encoding, callback) {
    this.writtenCount++;
    console.log("  [Writable._write] 写入第" + this.writtenCount + "块:", chunk.toString());
    // 调用 callback 表示写入完成，允许继续接收下一块数据
    callback();
  }

  // 所有数据写入完成后调用
  _final(callback) {
    console.log("  [Writable._final] 共写入 " + this.writtenCount + " 块数据");
    callback();
  }
}

// ---- 3. pipe 管道连接 ----
console.log("\\n===== 3. pipe 管道连接 =====");

const source = new NumberReadable({ highWaterMark: 16 });
const destination = new LoggerWritable({ highWaterMark: 16 });

// pipe 连接可读流和可写流
source.pipe(destination);

destination.on("finish", function () {
  console.log("  [finish 事件] 所有数据已写入完成");
});

// ---- 4. 流事件完整演示 ----
console.log("\\n===== 4. 流事件完整演示 =====");

// 创建一个事件演示流
const eventStream = new Readable({
  read() {
    // 用 setTimeout 延迟推送，方便观察事件顺序
    const self = this;
    setTimeout(function () {
      self.push(Buffer.from("hello", "utf-8"));
      setTimeout(function () {
        self.push(Buffer.from(" ", "utf-8"));
        setTimeout(function () {
          self.push(Buffer.from("world", "utf-8"));
          self.push(null); // 结束
        }, 10);
      }, 10);
    }, 10);
  },
});

// 可读流事件
eventStream.on("data", function (chunk) {
  console.log("  [data] " + chunk.toString());
});

eventStream.on("end", function () {
  console.log("  [end] 读取结束");
});

eventStream.on("close", function () {
  console.log("  [close] 流已关闭");
});

eventStream.on("error", function (err) {
  console.log("  [error] " + err.message);
});

// ---- 5. 背压机制演示 ----
console.log("\\n===== 5. 背压机制演示 =====");

// 快速生产者
const fastProducer = new Readable({
  read() {
    // 快速推送数据（比消费速度快）
    this.push(Buffer.from("快速数据块", "utf-8"));
  },
});

// 慢速消费者
let slowCount = 0;
const slowConsumer = new Writable({
  write(chunk, encoding, callback) {
    slowCount++;
    if (slowCount <= 3) {
      // 前 3 块正常消费
      console.log("  [消费者] 处理第" + slowCount + "块:", chunk.toString());
      callback();
    } else {
      // 第 4 块开始减速
      console.log("  [消费者] 处理第" + slowCount + "块（慢速）:", chunk.toString());
      setTimeout(function () {
        callback();
      }, 50);
      // 停止消费，防止更多数据涌入
      if (slowCount >= 4) {
        fastProducer.push(null); // 停止生产
      }
    }
  },
});

fastProducer.pipe(slowConsumer);

slowConsumer.on("finish", function () {
  console.log("  [背压演示] 共消费 " + slowCount + " 块数据");
});

// ---- 6. 流动模式 vs 暂停模式 ----
console.log("\\n===== 6. 流动模式 vs 暂停模式 =====");

// 暂停模式演示
const pausedStream = new Readable({
  read() {
    this.push(Buffer.from("暂停模式数据", "utf-8"));
    this.push(null);
  },
});

// 暂停模式：使用 readable 事件 + read()
pausedStream.on("readable", function () {
  console.log("  [readable 事件] 有数据可读");
  let chunk;
  while ((chunk = pausedStream.read()) !== null) {
    console.log("  [read()] 读取到:", chunk.toString());
  }
});

pausedStream.on("end", function () {
  console.log("  [end] 暂停模式读取结束");
});

// ---- 7. 流错误处理 ----
console.log("\\n===== 7. 流错误处理 =====");

const errorStream = new Readable({
  read() {
    // 模拟错误
    this.destroy(new Error("读取过程中发生错误"));
  },
});

errorStream.on("error", function (err) {
  console.log("  [错误捕获] " + err.message);
});

errorStream.resume(); // 启动流

console.log("\\n✅ Stream 流基础演示完成！");`,
  },

  // =========================================================
  // 第五章：Stream 流进阶
  // =========================================================
  {
    id: "node-stream-advanced",
    group: "核心模块",
    icon: "🌪️",
    title: "Stream 流进阶",
    content: `## Stream 流进阶

掌握了流的基础概念后，本章深入探讨 Transform 流、自定义流类、流错误处理、pipeline 管道函数以及流与文件操作的高级实践。

### Transform 流详解

Transform 流是 Duplex 流的特例，它的输出由输入经过某种转换而来。它同时实现了 Readable 和 Writable 的接口。

\`\`\`javascript
const { Transform } = require("stream");  // 导入模块 stream；require 返回 module.exports

const upperCaseTransform = new Transform({  // 创建实例 upperCaseTransform
  transform(chunk, encoding, callback) {
    // chunk：输入的数据块
    // encoding：编码格式
    // callback：转换完成后调用
    const upper = chunk.toString().toUpperCase();  // 定义常量 upper
    callback(null, upper); // 第一个参数是错误，第二个是转换后的数据
  },

  flush(callback) {
    // 流结束时调用，可以推送剩余数据
    callback();
  },
});
\`\`\`

### pipeline 管道函数

Node.js 10+ 提供了 \`stream.pipeline\` 和 \`util.promisify\` 的组合，可以优雅地处理流管道及其错误：

\`\`\`javascript
const { pipeline } = require("stream");  // 导入模块 stream；require 返回 module.exports
const util = require("util");  // 导入模块 util；require 返回 module.exports
const pipelineAsync = util.promisify(pipeline);  // 定义常量 pipelineAsync

// 使用 pipeline 自动处理错误和清理
try {  // 开启 try 块捕获异常
  await pipelineAsync(  // 等待 Promise 完成后再继续
    fs.createReadStream("input.txt"),  // 创建可读流（分块读取大文件）
    zlib.createGzip(),  // 创建 Gzip 压缩流
    fs.createWriteStream("output.txt.gz")  // 创建可写流（分块写入大文件）
  );
  console.log("管道处理完成");  // 打印日志到 stdout
} catch (err) {
  console.error("管道处理失败:", err);  // 打印错误到 stderr
}
\`\`\`

#### pipeline 与 pipe 的区别

| 特性 | pipe() | pipeline() |
| --- | --- | --- |
| 错误传播 | 不自动传播 | 自动传播到回调 |
| 流的清理 | 需手动处理 | 错误时自动销毁所有流 |
| 回调通知 | 无 | 完成时回调 |
| Promise 支持 | 无 | 可 promisify |

### 流与文件操作

流是处理大文件的最佳方式：

\`\`\`javascript
// 文件复制：流式 vs 同步
// 同步方式（内存占用大）
const data = fs.readFileSync("large.iso");  // 文件操作结果 data
fs.writeFileSync("copy.iso", data);  // 同步写入文件

// 流式方式（内存占用恒定）
fs.createReadStream("large.iso").pipe(fs.createWriteStream("copy.iso"));  // 创建可读流（分块读取大文件）
\`\`\`

### 流的错误处理最佳实践

1. **始终监听 error 事件**：未捕获的流错误会抛出异常
2. **使用 pipeline 替代 pipe**：自动处理错误传播
3. **destroy() 清理资源**：出错时销毁流

\`\`\`javascript
// ❌ 不推荐：手动 pipe + 手动错误处理
readable.pipe(transform).pipe(writable);
readable.on("error", handleError);
transform.on("error", handleError);
writable.on("error", handleError);

// ✅ 推荐：pipeline 自动处理
pipeline(readable, transform, writable, (err) => {
  if (err) handleError(err);  // 条件判断
});
\`\`\`

### 自定义 Transform 流实践

常见的 Transform 流应用场景：
- **数据转换**：JSON 行解析、CSV 到 JSON
- **数据过滤**：只保留符合条件的行
- **数据聚合**：计算统计数据
- **加解密**：流式加密/解密

下面这段代码演示了自定义 Transform 流和 pipeline 的高级用法。`,
    code: `// ============================================================
// 第五章代码演示：Stream 流进阶
// ============================================================

const { Transform, Readable, pipeline } = require("stream");
const util = require("util");
const pipelineAsync = util.promisify(pipeline);

// ---- 1. 大写转换 Transform 流 ----
console.log("===== 1. 大写转换 Transform 流 =====");

const upperTransform = new Transform({
  transform(chunk, encoding, callback) {
    // 将数据转为大写
    const upper = chunk.toString().toUpperCase();
    callback(null, Buffer.from(upper));
  },
  flush(callback) {
    // 流结束时调用，可以推送额外数据
    console.log("  [flush] 大写转换流结束");
    callback();
  },
});

// 测试大写转换
const wordsSource = new Readable({
  read() {
    this.push("hello ");
    this.push("world ");
    this.push("from ");
    this.push("stream");
    this.push(null);
  },
});

let upperResult = "";
wordsSource
  .pipe(upperTransform)
  .on("data", function (chunk) {
    upperResult += chunk.toString();
  })
  .on("end", function () {
    console.log("  转换结果:", upperResult);
  });

// ---- 2. JSON 行解析 Transform 流 ----
console.log("\\n===== 2. JSON 行解析 Transform 流 =====");

class JsonLineParser extends Transform {
  constructor(options) {
    super({ ...options, readableObjectMode: true });
    // 缓冲区：用于存储不完整的行
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();

    // 按换行符分割
    const lines = this.buffer.split("\\n");
    // 最后一行可能不完整，保留在缓冲区
    this.buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          this.push(obj); // 推送解析后的对象
        } catch (err) {
          console.log("  [警告] JSON 解析失败:", line);
        }
      }
    }

    callback();
  }

  _flush(callback) {
    // 处理缓冲区中剩余的数据
    if (this.buffer.trim()) {
      try {
        const obj = JSON.parse(this.buffer);
        this.push(obj);
      } catch (err) {
        console.log("  [警告] 最后一行 JSON 解析失败:", this.buffer);
      }
    }
    callback();
  }
}

// 模拟 JSON 行数据
const jsonLines = [
  '{"type":"info","message":"服务启动"}\\n',
  '{"type":"error","message":"连接失败"}\\n',
  '{"type":"info","message":"重试中"}\\n',
];

const jsonSource = new Readable({
  read() {
    if (jsonLines.length > 0) {
      this.push(jsonLines.shift());
    } else {
      this.push(null);
    }
  },
});

const parser = new JsonLineParser();
const parsedResults = [];

jsonSource
  .pipe(parser)
  .on("data", function (obj) {
    parsedResults.push(obj);
  })
  .on("end", function () {
    console.log("  解析结果:");
    parsedResults.forEach(function (r) {
      console.log("    [" + r.type + "] " + r.message);
    });
  });

// ---- 3. 数据过滤 Transform 流 ----
console.log("\\n===== 3. 数据过滤 Transform 流 =====");

// 只保留包含关键词的行
class FilterTransform extends Transform {
  constructor(keyword, options) {
    super(options);
    this.keyword = keyword;
    this.filteredCount = 0;
    this.totalCount = 0;
  }

  _transform(chunk, encoding, callback) {
    this.totalCount++;
    const str = chunk.toString();
    if (str.indexOf(this.keyword) !== -1) {
      this.filteredCount++;
      // 包含关键词，推送到下游
      callback(null, chunk);
    } else {
      // 不包含关键词，跳过（不推送）
      callback();
    }
  }

  _flush(callback) {
    console.log("  过滤统计: " + this.filteredCount + "/" + this.totalCount + " 条通过");
    callback();
  }
}

// 日志数据
const logs = [
  "[ERROR] 数据库连接超时",
  "[INFO] 请求处理完成",
  "[ERROR] 磁盘空间不足",
  "[INFO] 用户登录成功",
  "[WARN] 内存使用率 85%",
  "[ERROR] 服务不可用",
];

const logSource = new Readable({
  read() {
    if (logs.length > 0) {
      this.push(logs.shift() + "\\n");
    } else {
      this.push(null);
    }
  },
});

const errorFilter = new FilterTransform("ERROR");

let errorLogs = "";
logSource
  .pipe(errorFilter)
  .on("data", function (chunk) {
    errorLogs += chunk.toString();
  })
  .on("end", function () {
    console.log("  过滤后的错误日志:\\n" + errorLogs.trim());
  });

// ---- 4. pipeline 管道函数 ----
console.log("\\n===== 4. pipeline 管道函数 =====");

// 创建一个完成的管道流
function createPipelineDemo() {
  return new Promise(function (resolve, reject) {
    const source = new Readable({
      read() {
        this.push("第一行\\n");
        this.push("第二行\\n");
        this.push("第三行\\n");
        this.push(null);
      },
    });

    // 行号添加 Transform
    const addLineNumber = new Transform({
      transform(chunk, encoding, callback) {
        const lines = chunk.toString().split("\\n").filter(Boolean);
        const numbered = lines
          .map(function (line, i) { return "  " + (i + 1) + ". " + line; })
          .join("\\n") + "\\n";
        callback(null, Buffer.from(numbered));
      },
    });

    // 收集结果
    let result = "";
    const collector = new Transform({
      transform(chunk, encoding, callback) {
        result += chunk.toString();
        callback(null, chunk);
      },
      flush(callback) {
        resolve(result);
        callback();
      },
    });

    // 使用 pipeline 连接
    pipeline(source, addLineNumber, collector, function (err) {
      if (err) {
        console.log("  pipeline 错误:", err.message);
        reject(err);
      }
    });
  });
}

createPipelineDemo().then(function (result) {
  console.log("  pipeline 处理结果:\\n" + result.trim());
});

// ---- 5. 流错误处理 ----
console.log("\\n===== 5. 流错误处理 =====");

const errorReadable = new Readable({
  read() {
    process.nextTick(function () {
      this.destroy(new Error("模拟读取错误"));
    }.bind(this));
  },
});

const errorTransform = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk);
  },
});

// 使用 pipeline 自动处理错误传播
pipeline(errorReadable, errorTransform, function (err) {
  if (err) {
    console.log("  [pipeline 捕获] 流处理错误:", err.message);
    console.log("  pipeline 自动清理了所有流");
  }
});

console.log("\\n✅ Stream 流进阶演示完成！");`,
  },

  // =========================================================
  // 第六章：加密与哈希
  // =========================================================
  {
    id: "node-crypto",
    group: "核心模块",
    icon: "🔐",
    title: "加密与哈希",
    content: `## 加密与哈希

\`crypto\` 模块是 Node.js 安全编程的核心，提供了加密、解密、哈希、签名、随机数生成等功能。深入理解这些概念，是构建安全应用的基础。

### 哈希算法

哈希（Hash）是将任意长度的数据映射为固定长度的摘要（Digest）。哈希是**单向**的，无法从摘要反推原始数据。

\`\`\`javascript
const crypto = require("crypto");  // 导入模块 crypto；require 返回 module.exports

// 创建哈希
const hash = crypto.createHash("sha256");  // 定义常量 hash
hash.update("Hello World");  // 更新哈希内容
const digest = hash.digest("hex"); // 输出十六进制字符串
// 结果：a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
\`\`\`

#### 常用哈希算法

| 算法 | 输出长度 | 安全性 | 使用场景 |
| --- | --- | --- | --- |
| MD5 | 128 bit | 不安全（已破解） | 仅用于校验和，不可用于安全 |
| SHA-1 | 160 bit | 不安全 | 已弃用 |
| SHA-256 | 256 bit | 安全 | 数字签名、区块链 |
| SHA-512 | 512 bit | 安全 | 高安全场景 |

#### 哈希的典型用途

- **密码存储**：不存明文密码，存哈希值
- **数据完整性校验**：验证文件是否被篡改
- **唯一标识**：生成内容的唯一 ID

### HMAC 消息认证码

HMAC（Hash-based Message Authentication Code）结合了哈希算法和密钥，不仅验证数据完整性，还验证发送者的身份。

\`\`\`javascript
const hmac = crypto.createHmac("sha256", "secret-key");  // 定义常量 hmac
hmac.update("important data");
const signature = hmac.digest("hex");  // 定义常量 signature
\`\`\`

### 对称加密（AES）

对称加密使用相同的密钥进行加密和解密，适合大量数据的加密。

\`\`\`javascript
// AES-256-CBC 加密
const algorithm = "aes-256-cbc";  // 定义常量 algorithm
const key = crypto.randomBytes(32);  // 256 位密钥
const iv = crypto.randomBytes(16);   // 初始化向量

// 加密
const cipher = crypto.createCipheriv(algorithm, key, iv);  // 定义常量 cipher
let encrypted = cipher.update("敏感数据", "utf8", "hex");  // 定义变量 encrypted（可变）
encrypted += cipher.final("hex");

// 解密
const decipher = crypto.createDecipheriv(algorithm, key, iv);  // 定义常量 decipher
let decrypted = decipher.update(encrypted, "hex", "utf8");  // 定义变量 decrypted（可变）
decrypted += decipher.final("utf8");
\`\`\`

### 密码哈希（PBKDF2）

密码不能直接哈希存储，因为哈希速度快，容易被暴力破解。应该使用 **PBKDF2**（Password-Based Key Derivation Function 2）或 **bcrypt**/**scrypt** 进行密码哈希。

\`\`\`javascript
// PBKDF2 通过多次迭代增加计算成本
crypto.pbkdf2("password", "salt", 100000, 64, "sha512", (err, derivedKey) => {  // PBKDF2 派生密钥
  console.log(derivedKey.toString("hex"));  // 打印日志到 stdout
});
\`\`\`

#### 为什么需要加盐（Salt）

- **防止彩虹表攻击**：相同的密码加不同的盐，哈希值不同
- **防止批量破解**：每个密码需要单独破解
- 盐应该随机生成，每个密码不同

### 随机数生成

Node.js 提供了密码学安全的随机数生成：

\`\`\`javascript
// 随机字节
const randomBytes = crypto.randomBytes(32); // 32 字节

// 随机 UUID（v4）
const uuid = crypto.randomUUID();  // 定义常量 uuid
// 结果类似：550e8400-e29b-41d4-a716-446655440000
\`\`\`

#### Math.random() vs crypto.randomBytes()

| 特性 | Math.random() | crypto.randomBytes() |
| --- | --- | --- |
| 安全性 | 不安全，可预测 | 密码学安全 |
| 使用场景 | 游戏、动画 | 密钥、Token、密码 |
| 原理 | 伪随机数生成器 | 系统熵源 |

### 编码格式

crypto 模块支持多种输出编码：

- **hex**：十六进制字符串（最常用）
- **base64**：Base64 编码（URL 和传输友好）
- **latin1**：单字节编码
- **buffer**：原始 Buffer 对象

下面这段代码演示了所有核心加密操作。`,
    code: `// ============================================================
// 第六章代码演示：加密与哈希
// ============================================================

const crypto = require("crypto");

// ---- 1. 哈希算法演示 ----
console.log("===== 1. 哈希算法 =====");

const data = "Hello, Node.js 加密世界!";

// MD5（不安全，仅用于校验）
const md5Hash = crypto.createHash("md5").update(data).digest("hex");
console.log("  MD5:    " + md5Hash);

// SHA-256
const sha256Hash = crypto.createHash("sha256").update(data).digest("hex");
console.log("  SHA-256:" + sha256Hash);

// SHA-512
const sha512Hash = crypto.createHash("sha512").update(data).digest("hex");
console.log("  SHA-512:" + sha512Hash);

// 分批 update 等同于一次性 update
const hash1 = crypto.createHash("sha256").update("Hello ").update("World").digest("hex");
const hash2 = crypto.createHash("sha256").update("Hello World").digest("hex");
console.log("  分批 update 验证: " + (hash1 === hash2 ? "结果一致 ✓" : "结果不同 ✗"));

// ---- 2. 文件校验和模拟 ----
console.log("\\n===== 2. 文件校验和 =====");

const fileContent = "这是重要的文件内容，需要验证完整性";
const checksum = crypto.createHash("sha256").update(fileContent).digest("hex");

console.log("  原始内容:", fileContent);
console.log("  校验和:   " + checksum);

// 验证文件是否被篡改
const tamperedContent = "这是重要的文件内容，需要验证完整性（已篡改）";
const tamperedChecksum = crypto.createHash("sha256").update(tamperedContent).digest("hex");

console.log("  篡改校验和:" + tamperedChecksum);
console.log("  完整性验证: " + (checksum === tamperedChecksum ? "通过 ✓" : "失败 - 文件已被篡改 ✗"));

// ---- 3. HMAC 消息认证码 ----
console.log("\\n===== 3. HMAC 消息认证码 =====");

const secretKey = "my-secret-key-2024";
const message = "转账 1000 元到账户 8888";

// 生成 HMAC 签名
const hmac = crypto.createHmac("sha256", secretKey);
hmac.update(message);
const signature = hmac.digest("hex");
console.log("  消息:", message);
console.log("  HMAC 签名:", signature);

// 验证 HMAC（接收方用相同密钥重新计算）
const verifyHmac = crypto.createHmac("sha256", secretKey);
verifyHmac.update(message);
const verifySignature = verifyHmac.digest("hex");
console.log("  HMAC 验证: " + (signature === verifySignature ? "签名有效 ✓" : "签名无效 ✗"));

// 用错误密钥验证
const wrongKeyHmac = crypto.createHmac("sha256", "wrong-key");
wrongKeyHmac.update(message);
const wrongSignature = wrongKeyHmac.digest("hex");
console.log("  错误密钥验证: " + (signature === wrongSignature ? "签名有效 ✓" : "签名无效 ✗"));

// ---- 4. AES 对称加密 ----
console.log("\\n===== 4. AES 对称加密 =====");

const algorithm = "aes-256-cbc";
// 生成 256 位（32 字节）密钥和 128 位（16 字节）IV
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const plaintext = "这是需要加密的敏感数据";

// 加密
function encrypt(text, key, iv) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// 解密
function decrypt(encrypted, key, iv) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const encrypted = encrypt(plaintext, key, iv);
const decrypted = decrypt(encrypted, key, iv);

console.log("  原始数据:", plaintext);
console.log("  加密后:  ", encrypted);
console.log("  解密后:  ", decrypted);
console.log("  验证:     " + (plaintext === decrypted ? "加密解密成功 ✓" : "失败 ✗"));

// ---- 5. 密码哈希（PBKDF2） ----
console.log("\\n===== 5. 密码哈希（PBKDF2） =====");

const password = "user-password-123";
const salt = crypto.randomBytes(16).toString("hex");

// PBKDF2 同步版本
const iterations = 100000;
const keyLength = 64;
const digest = "sha512";

const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);
const hashedPassword = derivedKey.toString("hex");

console.log("  原始密码:", password);
console.log("  盐值:    ", salt);
console.log("  迭代次数:", iterations);
console.log("  哈希结果:", hashedPassword);

// 验证密码
function verifyPassword(inputPassword, storedHash, salt) {
  const key = crypto.pbkdf2Sync(inputPassword, salt, iterations, keyLength, digest);
  const inputHash = key.toString("hex");
  return inputHash === storedHash;
}

console.log("  正确密码验证:", verifyPassword(password, hashedPassword, salt) ? "通过 ✓" : "失败 ✗");
console.log("  错误密码验证:", verifyPassword("wrong-password", hashedPassword, salt) ? "通过 ✓" : "失败 ✗");

// ---- 6. 随机数生成 ----
console.log("\\n===== 6. 随机数生成 =====");

// 随机字节
const randomBytes = crypto.randomBytes(16);
console.log("  随机字节(hex):", randomBytes.toString("hex"));
console.log("  随机字节(base64):", randomBytes.toString("base64"));

// 随机 UUID
const uuid1 = crypto.randomUUID();
const uuid2 = crypto.randomUUID();
console.log("  UUID v4 (1):", uuid1);
console.log("  UUID v4 (2):", uuid2);

// crypto.randomInt
const randomInt = crypto.randomInt(1, 100);
console.log("  随机整数(1-100):", randomInt);

// ---- 7. 编码格式对比 ----
console.log("\\n===== 7. 编码格式对比 =====");

const testData = "Hello 编码世界";
const testBuffer = Buffer.from(testData, "utf-8");

console.log("  原始数据:", testData);
console.log("  hex:     ", testBuffer.toString("hex"));
console.log("  base64:  ", testBuffer.toString("base64"));
console.log("  base64url:", testBuffer.toString("base64url"));

// 解码验证
const fromHex = Buffer.from(testBuffer.toString("hex"), "hex").toString("utf-8");
const fromBase64 = Buffer.from(testBuffer.toString("base64"), "base64").toString("utf-8");
console.log("  从 hex 解码:   ", fromHex);
console.log("  从 base64 解码:", fromBase64);

console.log("\\n✅ 加密与哈希演示完成！");`,
  },

  // =========================================================
  // 第七章：子进程基础
  // =========================================================
  {
    id: "node-child-process",
    group: "核心模块",
    icon: "👶",
    title: "子进程基础",
    content: `## 子进程基础

Node.js 的 \`child_process\` 模块允许你在 Node.js 程序中**执行外部命令和脚本**，创建子进程来处理 CPU 密集型任务或调用系统命令。这是 Node.js 突破单线程限制的重要方式之一。

### 为什么需要子进程？

单线程模型处理 I/O 很高效，但面临以下场景时力不从心：
- 执行系统命令（如 \`ls\`、\`git\`、\`ffmpeg\`）
- 运行其他语言的脚本（Python、Shell）
- CPU 密集型计算（需要多进程并行）
- 进程隔离（防止崩溃影响主进程）

### exec 与 execSync

\`exec\` 执行 shell 命令，将整个输出缓冲在内存中，适用于**输出量小**的命令。

\`\`\`javascript
const { exec } = require("child_process");  // 导入模块 child_process；require 返回 module.exports

// 异步执行
exec("ls -la", (err, stdout, stderr) => {  // 执行 shell 命令（带回调）
  if (err) {  // 条件判断
    console.error("执行失败:", err);  // 打印错误到 stderr
    return;
  }
  console.log("输出:", stdout);  // 打印日志到 stdout
});

// 同步执行
const { execSync } = require("child_process");  // 导入模块 child_process；require 返回 module.exports
const result = execSync("ls -la").toString();  // 定义常量 result
console.log(result);  // 打印日志到 stdout
\`\`\`

#### exec 的特点
- 默认调用 shell（/bin/sh），可以使用 shell 语法
- 输出缓冲在内存中，**不适合大数据量输出**
- 有 maxBuffer 限制（默认 1MB），超出会终止进程

### spawn 与 spawnSync

\`spawn\` 以流的方式处理子进程的输出，适合**输出量大或长时间运行**的命令。

\`\`\`javascript
const { spawn } = require("child_process");  // 导入模块 child_process；require 返回 module.exports

const child = spawn("ls", ["-la", "/tmp"]);  // 定义常量 child

child.stdout.on("data", (data) => {
  console.log("stdout:", data.toString());  // 打印日志到 stdout
});

child.stderr.on("data", (data) => {
  console.error("stderr:", data.toString());  // 打印错误到 stderr
});

child.on("close", (code) => {
  console.log("子进程退出，码:", code);  // 打印日志到 stdout
});
\`\`\`

### exec vs spawn 对比

| 特性 | exec | spawn |
| --- | --- | --- |
| 输入方式 | 命令字符串 | 命令 + 参数数组 |
| 输出方式 | 缓冲后一次性返回 | 流式返回 |
| Shell | 默认使用 shell | 默认不使用 shell |
| 最大输出 | 受 maxBuffer 限制 | 无限制（流式） |
| 适用场景 | 短命令，小输出 | 长命令，大输出 |

### 环境变量传递

子进程默认继承父进程的环境变量，但也可以传递自定义环境变量：

\`\`\`javascript
execSync("echo $MY_VAR", {  // 同步执行 shell 命令
  env: { ...process.env, MY_VAR: "hello" },
});
\`\`\`

### 超时处理

\`\`\`javascript
// 设置 5 秒超时
execSync("sleep 10", { timeout: 5000 }); // 5 秒后抛出异常
\`\`\`

### 错误处理

子进程的错误分为三类：
1. **命令不存在**：抛出 ENOENT 错误
2. **命令执行返回非 0**：error.code 非 0
3. **超时**：抛出 ETIMEDOUT 错误

下面这段代码在不依赖 child_process 模块的沙箱环境中，用 events 和流模拟子进程的核心概念。`,
    code: `// ============================================================
// 第七章代码演示：子进程基础（沙箱模拟）
// ============================================================

const { EventEmitter } = require("events");

// ---- 1. 模拟 exec 函数 ----
console.log("===== 1. 模拟 exec（缓冲输出） =====");

// 模拟 exec：执行命令，缓冲全部输出后回调
function mockExec(command, callback) {
  const startTime = Date.now();

  // 模拟命令执行
  const result = runCommand(command);

  if (result.error) {
    const err = new Error("命令执行失败: " + result.error.message);
    err.code = result.error.code;
    err.stderr = result.stderr;
    callback(err, "", result.stderr);
  } else {
    callback(null, result.stdout, result.stderr);
  }

  console.log("  执行耗时: " + (Date.now() - startTime) + "ms");
}

// 模拟命令执行器
function runCommand(command) {
  // 模拟各种系统命令
  const parts = command.trim().split(/\\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd) {
    case "ls":
      return {
        stdout: "file1.txt\\nfile2.txt\\nsrc/\\npackage.json\\n",
        stderr: "",
      };
    case "echo":
      return {
        stdout: args.join(" ") + "\\n",
        stderr: "",
      };
    case "nonexistent":
      return {
        error: { message: "command not found: nonexistent", code: 127 },
        stdout: "",
        stderr: "sh: nonexistent: command not found",
      };
    case "cat":
      if (args[0] === "missing.txt") {
        return {
          error: { message: "No such file", code: 1 },
          stdout: "",
          stderr: "cat: missing.txt: No such file or directory",
        };
      }
      return {
        stdout: "这是文件内容\\n",
        stderr: "",
      };
    default:
      return {
        stdout: "命令执行成功\\n",
        stderr: "",
      };
  }
}

// 测试 exec 模拟
mockExec("ls -la", function (err, stdout, stderr) {
  if (err) {
    console.log("  错误:", err.message);
  } else {
    console.log("  标准输出:\\n" + stdout.trim());
  }
});

mockExec("echo Hello World", function (err, stdout) {
  if (err) {
    console.log("  错误:", err.message);
  } else {
    console.log("  echo 输出:", stdout.trim());
  }
});

// 错误命令
mockExec("nonexistent", function (err, stdout, stderr) {
  if (err) {
    console.log("  命令错误: " + err.message + " (code: " + err.code + ")");
    console.log("  stderr:", stderr.trim());
  }
});

// ---- 2. execSync 模拟 ----
console.log("\\n===== 2. 模拟 execSync（同步执行） =====");

function mockExecSync(command, options) {
  const timeout = (options && options.timeout) || 0;

  // 模拟超时
  if (timeout > 0 && command.indexOf("sleep") !== -1) {
    throw new Error("ETIMEDOUT: 命令执行超时 (" + timeout + "ms)");
  }

  const result = runCommand(command);

  if (result.error) {
    throw new Error("命令 '" + command + "' 失败: " + result.error.message);
  }

  return result.stdout;
}

// 同步执行
try {
  const output = mockExecSync("ls -la");
  console.log("  同步执行结果:\\n" + output.trim());
} catch (err) {
  console.log("  同步执行错误:", err.message);
}

// 超时错误
try {
  mockExecSync("sleep 10", { timeout: 5000 });
} catch (err) {
  console.log("  超时错误:", err.message);
}

// ---- 3. 模拟 spawn（流式输出） ----
console.log("\\n===== 3. 模拟 spawn（流式输出） =====");

// 模拟 spawn 返回的子进程对象
class MockChildProcess extends EventEmitter {
  constructor() {
    super();
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.pid = Math.floor(Math.random() * 10000) + 1000;
  }

  // 模拟启动进程
  start(command, args) {
    const self = this;

    // 模拟输出数据
    const chunks = [
      { type: "stdout", data: "正在处理...\\n" },
      { type: "stdout", data: "进度: 25%\\n" },
      { type: "stdout", data: "进度: 50%\\n" },
      { type: "stderr", data: "警告: 磁盘空间不足\\n" },
      { type: "stdout", data: "进度: 75%\\n" },
      { type: "stdout", data: "进度: 100%\\n" },
      { type: "stdout", data: "处理完成!\\n" },
    ];

    let index = 0;
    function emitNext() {
      if (index < chunks.length) {
        const chunk = chunks[index];
        if (chunk.type === "stdout") {
          self.stdout.emit("data", Buffer.from(chunk.data));
        } else {
          self.stderr.emit("data", Buffer.from(chunk.data));
        }
        index++;
        setTimeout(emitNext, 10);
      } else {
        // 进程结束
        self.emit("close", 0);
      }
    }

    setTimeout(emitNext, 10);
  }
}

// 模拟 spawn 函数
function mockSpawn(command, args) {
  const child = new MockChildProcess();
  console.log("  启动子进程 (PID: " + child.pid + "): " + command + " " + (args || []).join(" "));
  child.start(command, args);
  return child;
}

// 使用 spawn 模拟
const child = mockSpawn("ffmpeg", ["-i", "input.mp4", "output.avi"]);

child.stdout.on("data", function (data) {
  console.log("  [stdout] " + data.toString().trim());
});

child.stderr.on("data", function (data) {
  console.log("  [stderr] " + data.toString().trim());
});

child.on("close", function (code) {
  console.log("  子进程退出，退出码: " + code);
});

// ---- 4. 环境变量传递 ----
console.log("\\n===== 4. 环境变量传递 =====");

// 模拟环境变量传递
function runWithEnv(command, env) {
  console.log("  命令:", command);
  console.log("  环境变量:", JSON.stringify(env));
  // 在真实环境中，子进程会继承这些环境变量
  return "结果: 环境变量 MY_VAR=" + (env.MY_VAR || "未设置");
}

const result = runWithEnv("node script.js", {
  NODE_ENV: "production",
  MY_VAR: "hello-world",
  DEBUG: "true",
});
console.log("  " + result);

// ---- 5. 错误处理分类 ----
console.log("\\n===== 5. 错误处理分类 =====");

function handleExecError(err) {
  if (err.code === "ENOENT" || err.code === 127) {
    console.log("  [命令不存在] " + err.message);
  } else if (err.code === "ETIMEDOUT") {
    console.log("  [超时错误] " + err.message);
  } else if (err.killed) {
    console.log("  [进程被终止] 信号: " + err.signal);
  } else {
    console.log("  [执行错误] code=" + err.code + ", " + err.message);
  }
}

// 模拟各种错误
handleExecError({ code: 127, message: "command not found: xyz" });
handleExecError({ code: "ETIMEDOUT", message: "ETIMEDOUT: 命令执行超时" });
handleExecError({ code: 1, message: "Command failed: cat missing.txt" });
handleExecError({ killed: true, signal: "SIGTERM", message: "进程被终止" });

console.log("\\n✅ 子进程基础演示完成！");`,
  },

  // =========================================================
  // 第八章：子进程通信
  // =========================================================
  {
    id: "node-child-advanced",
    group: "核心模块",
    icon: "🔗",
    title: "子进程通信",
    content: `## 子进程通信

在实际项目中，多进程不只是简单的"执行命令"，还需要进程之间进行**双向通信**。Node.js 的 \`fork()\` 方法提供了父子进程间通过 IPC（Inter-Process Communication）通道进行消息传递的能力。

### fork 子进程

\`fork()\` 是 \`spawn()\` 的特例，专门用于创建 Node.js 子进程。它自动建立 IPC 通信通道，允许父子进程之间通过 \`send()\` 和 \`'message'\` 事件进行通信。

\`\`\`javascript
// 父进程
const { fork } = require("child_process");  // 导入模块 child_process；require 返回 module.exports
const child = fork("./worker.js");  // 定义常量 child

child.on("message", (msg) => {
  console.log("父进程收到:", msg);  // 打印日志到 stdout
});

child.send({ task: "compute", data: [1, 2, 3] });

// worker.js（子进程）
process.on("message", (msg) => {  // 注册进程级事件监听
  console.log("子进程收到:", msg);  // 打印日志到 stdout
  // 处理任务...
  process.send({ result: "完成" });
});
\`\`\`

### IPC 通信机制

IPC（Inter-Process Communication）是操作系统提供的进程间通信机制。Node.js 的 fork 基于操作系统的管道或 socket 实现。

#### 通信流程

\`\`\`
父进程                    子进程
  |                         |
  |--- send({task}) ------->|  (通过 IPC 通道)
  |                         |
  |                         |  处理任务...
  |                         |
  |<--- send({result}) -----|  (通过 IPC 通道)
  |                         |
\`\`\`

### 进程池模式

进程池（Process Pool）是生产环境中的常见模式：预先创建一组工作进程，任务来了分配给空闲进程，避免频繁创建和销毁进程的开销。

\`\`\`javascript
class ProcessPool {  // 定义类 ProcessPool
  constructor(size, workerPath) {  // 构造函数
    this.pool = [];
    for (let i = 0; i < size; i++) {  // for 循环
      this.pool.push({
        worker: fork(workerPath),
        busy: false,
      });
    }
  }

  // 获取空闲进程
  acquire() {
    return this.pool.find(w => !w.busy);  // 返回值
  }

  // 释放进程
  release(worker) {
    const w = this.pool.find(w => w.worker === worker);  // 定义常量 w
    if (w) w.busy = false;  // 条件判断
  }
}
\`\`\`

### 子进程生命周期管理

#### 优雅关闭
\`\`\`javascript
// 通知子进程关闭
child.send({ type: "shutdown" });

// 给子进程 5 秒时间清理
setTimeout(() => {  // 延时回调（宏任务，timers 阶段执行）
  if (!child.killed) {  // 条件判断
    child.kill("SIGKILL"); // 强制终止
  }
}, 5000);
\`\`\`

#### 异常重启
\`\`\`javascript
child.on("exit", (code, signal) => {
  if (code !== 0 && signal !== "SIGTERM") {  // 条件判断
    console.log("子进程异常退出，重启中...");  // 打印日志到 stdout
    // 重启子进程
    child = fork("./worker.js");
  }
});
\`\`\`

### 通信模式

#### 请求-响应模式
父进程发送请求，子进程处理后返回响应。

#### 事件广播模式
父进程向所有子进程广播事件。

#### 任务分发模式
父进程将任务分配给空闲的子进程（负载均衡）。

下面这段代码在不依赖 child_process 模块的沙箱环境中，用 setTimeout 和 EventEmitter 模拟 fork 和 IPC 通信。`,
    code: `// ============================================================
// 第八章代码演示：子进程通信（沙箱模拟 fork 和 IPC）
// ============================================================

const { EventEmitter } = require("events");

// ---- 1. 模拟 fork 和 IPC 通信 ----
console.log("===== 1. 模拟 fork 和 IPC 通信 =====");

// 模拟子进程类
class MockChildProcess extends EventEmitter {
  constructor(scriptName) {
    super();
    this.pid = Math.floor(Math.random() * 90000) + 10000;
    this.scriptName = scriptName;
    this.connected = true;
    this.killed = false;
  }

  // 父进程向子进程发送消息
  send(message) {
    if (!this.connected) {
      throw new Error("IPC 通道已关闭");
    }
    console.log("  [父进程 → 子进程(" + this.pid + ")] 发送: " + JSON.stringify(message));

    // 模拟子进程处理消息
    const self = this;
    const response = workerHandler(message, self.scriptName);

    if (response) {
      setTimeout(function () {
        if (self.connected) {
          // 触发父进程的 message 事件
          self.emit("message", response);
        }
      }, 10);
    }
  }

  // 断开连接
  disconnect() {
    this.connected = false;
    console.log("  [子进程(" + this.pid + ")] IPC 通道已断开");
  }

  // 终止进程
  kill(signal) {
    this.killed = true;
    this.connected = false;
    console.log("  [子进程(" + this.pid + ")] 被终止 (信号: " + (signal || "SIGTERM") + ")");
    this.emit("exit", null, signal || "SIGTERM");
  }
}

// 模拟 fork 函数
function mockFork(scriptName) {
  const child = new MockChildProcess(scriptName);
  console.log("  [fork] 创建子进程: " + scriptName + " (PID: " + child.pid + ")");
  return child;
}

// 子进程任务处理函数（模拟 worker.js 的逻辑）
function workerHandler(message, scriptName) {
  console.log("  [子进程(" + scriptName + ") 收到] " + JSON.stringify(message));

  switch (message.type) {
    case "compute":
      return {
        id: message.id,
        type: "result",
        data: message.data.map(function (n) { return n * n; }),
      };

    case "echo":
      return {
        id: message.id,
        type: "echo",
        data: message.data,
      };

    case "status":
      return {
        type: "status",
        pid: Math.floor(Math.random() * 90000) + 10000,
        uptime: Math.floor(Math.random() * 3600),
        memory: Math.floor(Math.random() * 500) + 100,
      };

    case "shutdown":
      console.log("  [子进程(" + scriptName + ")] 收到关闭信号，正在清理...");
      return {
        type: "shutdown_ack",
        message: "子进程正在关闭",
      };

    default:
      return {
        type: "unknown",
        message: "未知任务类型: " + message.type,
      };
  }
}

// 使用 fork 创建子进程
const worker = mockFork("worker.js");

// 父进程监听子进程消息
worker.on("message", function (msg) {
  console.log("  [父进程收到] 来自子进程(" + worker.pid + "): " + JSON.stringify(msg));
});

// 发送计算任务
worker.send({ id: 1, type: "compute", data: [1, 2, 3, 4, 5] });

// 发送状态查询
worker.send({ id: 2, type: "status" });

// ---- 2. 请求-响应通信模式 ----
console.log("\\n===== 2. 请求-响应通信模式 =====");

// 封装请求-响应
function sendRequest(child, request) {
  return new Promise(function (resolve) {
    const id = Date.now();

    function onMessage(msg) {
      if (msg.id === id) {
        child.removeListener("message", onMessage);
        resolve(msg);
      }
    }

    child.on("message", onMessage);
    child.send({ id: id, ...request });
  });
}

const worker2 = mockFork("compute-worker.js");

sendRequest(worker2, { type: "compute", data: [10, 20, 30] }).then(function (result) {
  console.log("  [请求-响应] 计算结果: " + JSON.stringify(result.data));
});

sendRequest(worker2, { type: "echo", data: "Hello IPC" }).then(function (result) {
  console.log("  [请求-响应] Echo 结果: " + JSON.stringify(result.data));
});

// ---- 3. 进程池模式 ----
console.log("\\n===== 3. 进程池模式 =====");

class ProcessPool {
  constructor(size, scriptName) {
    this.pool = [];
    this.taskQueue = [];
    console.log("  创建进程池，大小: " + size);

    for (let i = 0; i < size; i++) {
      const worker = mockFork(scriptName);
      this.pool.push({
        worker: worker,
        busy: false,
        id: worker.pid,
      });
    }
  }

  // 获取空闲进程
  getAvailable() {
    const available = this.pool.filter(function (w) { return !w.busy; });
    return available.length > 0 ? available[0] : null;
  }

  // 执行任务
  execute(task) {
    const self = this;
    return new Promise(function (resolve) {
      const available = self.getAvailable();

      if (available) {
        available.busy = true;
        console.log("  [进程池] 分配任务到进程 " + available.id);

        const msgHandler = function (msg) {
          available.worker.removeListener("message", msgHandler);
          available.busy = false;
          resolve(msg);

          // 处理队列中等待的任务
          if (self.taskQueue.length > 0) {
            const next = self.taskQueue.shift();
            self.execute(next.task).then(next.resolve);
          }
        };

        available.worker.on("message", msgHandler);
        available.worker.send(task);
      } else {
        // 无空闲进程，加入队列
        console.log("  [进程池] 无空闲进程，任务排队等待...");
        self.taskQueue.push({ task: task, resolve: resolve });
      }
    });
  }

  // 关闭所有进程
  shutdown() {
    console.log("  [进程池] 关闭所有进程...");
    this.pool.forEach(function (w) {
      w.worker.kill("SIGTERM");
    });
  }
}

// 创建进程池
const pool = new ProcessPool(2, "pool-worker.js");

// 提交多个任务
console.log("  提交任务...");
pool.execute({ type: "compute", data: [1, 2, 3] }).then(function (r) {
  console.log("  任务1 完成: " + JSON.stringify(r.data));
});
pool.execute({ type: "compute", data: [4, 5, 6] }).then(function (r) {
  console.log("  任务2 完成: " + JSON.stringify(r.data));
});
pool.execute({ type: "compute", data: [7, 8, 9] }).then(function (r) {
  console.log("  任务3 完成: " + JSON.stringify(r.data));
});

// ---- 4. 优雅关闭子进程 ----
console.log("\\n===== 4. 优雅关闭子进程 =====");

const worker3 = mockFork("service-worker.js");

// 监听关闭确认
worker3.on("message", function (msg) {
  if (msg.type === "shutdown_ack") {
    console.log("  [父进程] 收到子进程关闭确认: " + msg.message);
  }
});

// 发送关闭信号
console.log("  [父进程] 发送关闭信号...");
worker3.send({ type: "shutdown" });

// 给子进程时间清理，然后强制终止
// 模拟：如果子进程在 50ms 内未退出，则强制终止
setTimeout(function () {
  if (!worker3.killed) {
    console.log("  [父进程] 子进程未及时退出，强制终止");
    worker3.kill("SIGKILL");
  }
}, 50);

// 监听退出
worker3.on("exit", function (code, signal) {
  console.log("  [父进程] 子进程已退出 (code: " + (code || "null") + ", signal: " + signal + ")");
});

// ---- 5. 事件广播模式 ----
console.log("\\n===== 5. 事件广播模式 =====");

// 创建多个子进程
const workers = [
  mockFork("worker-a.js"),
  mockFork("worker-b.js"),
  mockFork("worker-c.js"),
];

// 向所有子进程广播消息
function broadcast(workers, message) {
  console.log("  [广播] 向所有子进程发送: " + JSON.stringify(message));
  workers.forEach(function (w) {
    w.send(message);
  });
}

// 每个子进程监听消息
workers.forEach(function (w) {
  w.on("message", function (msg) {
    console.log("  [广播响应] 子进程(" + w.pid + "): " + JSON.stringify(msg));
  });
});

// 广播配置更新
broadcast(workers, { type: "config_update", config: { logLevel: "debug" } });

// 广播健康检查
setTimeout(function () {
  broadcast(workers, { type: "health_check" });
}, 20);

console.log("\\n✅ 子进程通信演示完成！");`,
  },
];