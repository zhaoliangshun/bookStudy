// =============================================================
// Node.js 交互式教程 —— 第九批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. node-rest-api    — REST API 设计
//   2. node-websocket   — WebSocket 实时通信
//   3. node-file-upload — 文件上传处理
//   4. node-auth        — 认证与授权
//   5. node-middleware  — 中间件模式
//   6. node-microservices — 微服务架构
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
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

  {
    id: 'node-rest-api',
    title: 'REST API 设计',
    icon: '🔗',
    group: '实战补充',
    content: `## REST API 设计全面指南

REST（Representational State Transfer，表述性状态转移）是 Roy Fielding 在 2000 年博士论文中提出的一种分布式系统架构风格。它不是协议，不是标准，而是一组**架构约束**和**设计原则**。遵循这些原则构建的 API 称为 RESTful API。

### REST 的六大架构约束

#### 1. 客户端-服务器（Client-Server）
关注点分离：客户端负责用户界面和用户体验，服务器负责数据存储和业务逻辑。同一套 API 可以服务 Web 端、移动端、桌面端。

#### 2. 无状态（Stateless）
**每个请求必须包含服务器理解该请求所需的所有信息**。服务器不存储任何客户端上下文（Session）。好处是可伸缩性、可靠性，代价是每个请求都需要携带认证信息。

#### 3. 缓存（Cacheable）
响应必须显式或隐式地标记自己是否可缓存。通过 Cache-Control、ETag、Last-Modified 等头实现。

#### 4. 统一接口（Uniform Interface）
REST 最核心的约束，包含四个子约束：资源标识（URI）、通过表述操作资源、自描述消息、HATEOAS。

#### 5. 分层系统（Layered System）
客户端不知道它连接的是最终服务器还是中间代理。负载均衡、缓存、网关可以透明介入。

#### 6. 按需代码（Code on Demand，可选）
服务器可以临时扩展客户端功能，发送可执行代码。

---

### HTTP 方法语义详解

| 方法 | 语义 | 幂等性 | 安全性 | 请求体 | 响应体 |
| --- | --- | --- | --- | --- | --- |
| **GET** | 获取资源 | 是 | 是 | 无 | 资源表述 |
| **POST** | 创建资源 | 否 | 否 | 资源数据 | 新资源表述 |
| **PUT** | 完整替换资源 | 是 | 否 | 完整资源数据 | 可选 |
| **PATCH** | 部分更新资源 | 否 | 否 | 变更字段 | 可选 |
| **DELETE** | 删除资源 | 是 | 否 | 无 | 可选 |
| **HEAD** | 获取响应头 | 是 | 是 | 无 | 无 |
| **OPTIONS** | 查询支持的方法 | 是 | 是 | 无 | Allow 头 |

**幂等性**：多次相同请求的效果与一次请求相同。GET、PUT、DELETE 是幂等的，POST 不是。
**安全性**：请求不改变服务器状态。只有 GET、HEAD、OPTIONS 是安全的。

常见误用：用 GET 删除资源（GET /api/users/1/delete）、用 POST 获取资源、所有操作都用 POST。正确做法是让 HTTP 方法表达操作意图。

**PUT vs PATCH 的区别**：PUT 要求客户端发送完整的资源表述，PATCH 只发送需要修改的字段。

---

### URL 设计规范

#### 1. 使用复数名词表示资源集合
GET /api/users 获取用户列表，GET /api/users/1 获取单个用户。避免使用动词。

#### 2. 资源层级关系通过 URL 路径表达
GET /api/users/1/orders 获取用户1的订单。层级不宜过深（一般不超过 3 层）。

#### 3. 过滤、排序、分页通过查询参数

GET /api/users?age=20                    // 过滤
GET /api/users?sort=-created_at          // 排序（-表示降序）
GET /api/users?page=2&limit=20           // 分页
GET /api/users?q=john                    // 搜索
GET /api/users?fields=name,email         // 字段选择

分页的两种风格：偏移分页简单直观但大数据量时性能差；游标分页性能稳定但不支持跳页。

---

### HTTP 状态码使用指南

**2xx 成功**：200 OK（GET/PUT/PATCH成功）、201 Created（POST成功，应返回Location头）、202 Accepted（异步处理）、204 No Content（DELETE成功）

**4xx 客户端错误**：400 Bad Request（参数校验失败）、401 Unauthorized（未认证）、403 Forbidden（无权限）、404 Not Found、405 Method Not Allowed、409 Conflict（并发冲突）、422 Unprocessable Entity（语义错误）、429 Too Many Requests（限流）

**5xx 服务器错误**：500 Internal Server Error、502 Bad Gateway、503 Service Unavailable、504 Gateway Timeout

---

### 统一的响应格式

成功响应：{ "success": true, "data": {...}, "meta": { "page": 2, "limit": 20, "total": 156 } }
错误响应：{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "参数校验失败", "details": [...] } }

---

### API 版本管理

三种方式：URL 路径版本（/api/v1/users，最常用）、请求头版本（Accept: version=2）、查询参数版本（?version=2）。大版本用 URL 路径，小版本用请求头。同时维护最近 2 个大版本，用 Deprecation 和 Sunset 头通知客户端。

---

### HATEOAS 概念

HATEOAS（Hypermedia As The Engine Of Application State）是 REST 中最容易被忽略的约束。服务器返回的响应中包含超链接，客户端通过这些链接发现接下来可以做什么操作。

---

### API 限流

常见策略：固定窗口（100 req/min）、滑动窗口（更平滑）、令牌桶（恒定速率补充）、漏桶（固定速率处理）。响应头返回 X-RateLimit-Limit、X-RateLimit-Remaining、X-RateLimit-Reset。

---

### API 安全

认证（你是谁？）vs 授权（你能做什么？）、CORS跨域头、始终使用HTTPS、输入校验、输出编码、SQL注入防护、速率限制、最小权限原则。

下面代码模拟完整的 REST API 路由系统，演示 URL 路由、CRUD 操作、分页过滤排序、版本管理等核心概念。`,
    code: `// ============================================================
// 第一章代码演示：REST API 路由系统模拟
// ============================================================
// 沙箱环境无法启动真正的 HTTP 服务器，因此用对象字面量来
// 模拟一个完整的 REST API 路由系统，演示核心设计模式。

const { EventEmitter } = require("events");

// 模拟数据存储
const usersDB = [
  { id: 1, name: "张三", email: "zhangsan@example.com", age: 28, role: "admin", createdAt: "2024-01-15" },
  { id: 2, name: "李四", email: "lisi@example.com", age: 22, role: "user", createdAt: "2024-02-20" },
  { id: 3, name: "王五", email: "wangwu@example.com", age: 35, role: "user", createdAt: "2024-03-10" },
  { id: 4, name: "赵六", email: "zhaoliu@example.com", age: 30, role: "admin", createdAt: "2024-03-15" },
  { id: 5, name: "孙七", email: "sunqi@example.com", age: 25, role: "user", createdAt: "2024-04-01" },
  { id: 6, name: "周八", email: "zhouba@example.com", age: 28, role: "user", createdAt: "2024-04-10" },
  { id: 7, name: "吴九", email: "wujiu@example.com", age: 32, role: "user", createdAt: "2024-04-15" },
  { id: 8, name: "郑十", email: "zhengshi@example.com", age: 27, role: "user", createdAt: "2024-05-01" },
];
let nextId = 9;

// ============================================================
// 演示 1：URL 路由解析
// ============================================================
console.log("===== 演示 1：URL 路由解析 =====");

function parseRoute(method, path) {
  const routes = [
    { pattern: /^\\/api\\/v1\\/users\$/,         methods: ["GET", "POST"] },
    { pattern: /^\\/api\\/v1\\/users\\/(\\d+)\$/, methods: ["GET", "PUT", "PATCH", "DELETE"] },
    { pattern: /^\\/api\\/v2\\/users\$/,         methods: ["GET"] },
  ];
  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match && route.methods.includes(method)) {
      return { matched: true, params: { id: match[1] ? parseInt(match[1]) : null } };
    }
  }
  return { matched: false, params: {} };
}

const testRoutes = [
  { method: "GET",    path: "/api/v1/users" },
  { method: "POST",   path: "/api/v1/users" },
  { method: "GET",    path: "/api/v1/users/3" },
  { method: "PUT",    path: "/api/v1/users/3" },
  { method: "DELETE", path: "/api/v1/users/3" },
  { method: "GET",    path: "/api/v2/users" },
  { method: "DELETE", path: "/api/v1/users" },
  { method: "GET",    path: "/api/v1/unknown" },
];
testRoutes.forEach(function (r) {
  var result = parseRoute(r.method, r.path);
  console.log("  " + r.method + " " + r.path + " -> " + (result.matched ? "匹配" : "不匹配"), result.params);
});

// ============================================================
// 演示 2：资源 CRUD 操作
// ============================================================
console.log("\\n===== 演示 2：资源 CRUD 操作 =====");

var api = {
  getUsers: function (params) {
    var result = usersDB.slice();
    if (params.role) result = result.filter(function (u) { return u.role === params.role; });
    if (params.age_gte) result = result.filter(function (u) { return u.age >= parseInt(params.age_gte); });
    if (params.age_lte) result = result.filter(function (u) { return u.age <= parseInt(params.age_lte); });
    if (params.q) {
      var q = params.q.toLowerCase();
      result = result.filter(function (u) {
        return u.name.toLowerCase().indexOf(q) !== -1 || u.email.toLowerCase().indexOf(q) !== -1;
      });
    }
    if (params.sort) {
      var fields = params.sort.split(",");
      result.sort(function (a, b) {
        for (var i = 0; i < fields.length; i++) {
          var desc = fields[i][0] === "-";
          var key = desc ? fields[i].slice(1) : fields[i];
          if (a[key] < b[key]) return desc ? 1 : -1;
          if (a[key] > b[key]) return desc ? -1 : 1;
        }
        return 0;
      });
    }
    var page = parseInt(params.page) || 1;
    var limit = parseInt(params.limit) || 10;
    var total = result.length;
    var totalPages = Math.ceil(total / limit);
    var start = (page - 1) * limit;
    var data = result.slice(start, start + limit);
    return { success: true, data: data, meta: { page: page, limit: limit, total: total, totalPages: totalPages } };
  },
  getUser: function (id) {
    var user = usersDB.find(function (u) { return u.id === id; });
    if (!user) return { success: false, error: { code: "NOT_FOUND", message: "用户不存在" } };
    return { success: true, data: user, _links: { self: "/api/v1/users/" + id, update: "/api/v1/users/" + id, delete: "/api/v1/users/" + id } };
  },
  createUser: function (data) {
    var errors = [];
    if (!data.name || data.name.trim().length === 0) errors.push({ field: "name", message: "用户名不能为空" });
    if (!data.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+\$/.test(data.email)) errors.push({ field: "email", message: "邮箱格式不正确" });
    if (data.age !== undefined && (data.age < 1 || data.age > 150)) errors.push({ field: "age", message: "年龄必须在1-150之间" });
    if (errors.length > 0) return { success: false, error: { code: "VALIDATION_ERROR", message: "参数校验失败", details: errors } };
    var newUser = { id: nextId++, name: data.name.trim(), email: data.email, age: data.age || null, role: data.role || "user", createdAt: new Date().toISOString().slice(0, 10) };
    usersDB.push(newUser);
    return { success: true, data: newUser, status: 201 };
  },
  patchUser: function (id, data) {
    var index = usersDB.findIndex(function (u) { return u.id === id; });
    if (index === -1) return { success: false, error: { code: "NOT_FOUND", message: "用户不存在" } };
    if (data.name !== undefined) usersDB[index].name = data.name;
    if (data.email !== undefined) usersDB[index].email = data.email;
    if (data.age !== undefined) usersDB[index].age = data.age;
    if (data.role !== undefined) usersDB[index].role = data.role;
    return { success: true, data: usersDB[index] };
  },
  deleteUser: function (id) {
    var index = usersDB.findIndex(function (u) { return u.id === id; });
    if (index === -1) return { success: false, error: { code: "NOT_FOUND", message: "用户不存在" } };
    usersDB.splice(index, 1);
    return { success: true, data: null, status: 204 };
  },
};

console.log("--- 创建用户 ---");
console.log(api.createUser({ name: "新用户", email: "new@example.com", age: 30 }));
console.log(api.createUser({ name: "", email: "bad", age: 999 }));

console.log("\\n--- 获取用户列表（分页+过滤）---");
var listResult = api.getUsers({ page: 1, limit: 3, sort: "-age", role: "user" });
console.log("meta:", listResult.meta);
console.log("data:", listResult.data.map(function (u) { return u.name + "(" + u.age + ")"; }));

console.log("\\n--- 获取单个用户 ---");
console.log(api.getUser(1));
console.log(api.getUser(999));

console.log("\\n--- 部分更新 ---");
console.log(api.patchUser(1, { age: 29 }));

console.log("\\n--- 删除 ---");
console.log(api.deleteUser(9));

// ============================================================
// 演示 3：HTTP 状态码使用
// ============================================================
console.log("\\n===== 演示 3：HTTP 状态码使用 =====");

function buildResponse(result) {
  var status = 200;
  if (result.status) {
    status = result.status;
  } else if (!result.success) {
    var code = result.error && result.error.code;
    if (code === "NOT_FOUND") status = 404;
    else if (code === "VALIDATION_ERROR") status = 422;
    else if (code === "UNAUTHORIZED") status = 401;
    else if (code === "FORBIDDEN") status = 403;
    else if (code === "CONFLICT") status = 409;
    else status = 400;
  }
  return { status: status, body: result };
}

var statusTests = [
  api.getUser(1),
  api.getUser(999),
  api.createUser({ name: "x", email: "bad", age: 999 }),
  { success: false, error: { code: "UNAUTHORIZED" } },
  { success: false, error: { code: "FORBIDDEN" } },
];
statusTests.forEach(function (r, i) {
  var resp = buildResponse(r);
  console.log("  测试" + (i + 1) + ": HTTP " + resp.status + " — " + (r.success ? "成功" : r.error.message));
});

// ============================================================
// 演示 4：API 版本管理
// ============================================================
console.log("\\n===== 演示 4：API 版本管理 =====");

var apiV1 = {
  getUser: function (id) {
    var u = usersDB.find(function (x) { return x.id === id; });
    return u ? { id: u.id, name: u.name, email: u.email } : null;
  },
};
var apiV2 = {
  getUser: function (id) {
    var u = usersDB.find(function (x) { return x.id === id; });
    if (!u) return null;
    return { id: u.id, fullName: u.name, emailAddress: u.email, age: u.age, role: u.role, createdAt: u.createdAt };
  },
};

console.log("v1 用户:", JSON.stringify(apiV1.getUser(1)));
console.log("v2 用户:", JSON.stringify(apiV2.getUser(1)));

// ============================================================
// 演示 5：HATEOAS 超媒体链接
// ============================================================
console.log("\\n===== 演示 5：HATEOAS 超媒体链接 =====");

function buildHATEOASLinks(user) {
  var links = { self: { href: "/api/v1/users/" + user.id, method: "GET" }, update: { href: "/api/v1/users/" + user.id, method: "PATCH" } };
  if (user.role === "admin") links.delete = { href: "/api/v1/users/" + user.id, method: "DELETE" };
  if (user.age >= 18) links.activate = { href: "/api/v1/users/" + user.id + "/activate", method: "POST" };
  return Object.assign({}, user, { _links: links });
}

var adminUser = usersDB.find(function (u) { return u.role === "admin"; });
var normalUser = usersDB.find(function (u) { return u.role === "user"; });
console.log("管理员链接:", JSON.stringify(buildHATEOASLinks(adminUser)._links, null, 2));
console.log("普通用户链接:", JSON.stringify(buildHATEOASLinks(normalUser)._links, null, 2));

// ============================================================
// 演示 6：API 限流模拟
// ============================================================
console.log("\\n===== 演示 6：API 限流模拟 =====");

function RateLimiter(maxRequests, windowMs) {
  this.maxRequests = maxRequests;
  this.windowMs = windowMs;
  this.counters = {};
}
RateLimiter.prototype.check = function (key) {
  var now = Date.now();
  if (!this.counters[key] || now > this.counters[key].resetTime) {
    this.counters[key] = { count: 1, resetTime: now + this.windowMs };
    return { allowed: true, remaining: this.maxRequests - 1 };
  }
  this.counters[key].count++;
  var remaining = this.maxRequests - this.counters[key].count;
  if (remaining < 0) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((this.counters[key].resetTime - now) / 1000) };
  }
  return { allowed: true, remaining: remaining };
};

var limiter = new RateLimiter(5, 60000);
console.log("模拟连续7次请求（限流: 5次/分钟）:");
for (var i = 0; i < 7; i++) {
  var r = limiter.check("client-ip-1");
  console.log("  请求" + (i + 1) + ": " + (r.allowed ? "✓ 通过" : "✗ 限流") + " 剩余" + r.remaining);
}

console.log("\\n不同客户端独立计数:");
console.log("客户端A:", limiter.check("client-a"));
console.log("客户端B:", limiter.check("client-b"));

// ============================================================
// 演示 7：CORS 头模拟
// ============================================================
console.log("\\n===== 演示 7：CORS 跨域头模拟 =====");

function buildCORSHeaders(origin) {
  var allowed = ["https://myapp.com", "https://admin.myapp.com"];
  var headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
  headers["Access-Control-Allow-Origin"] = allowed.indexOf(origin) !== -1 ? origin : "null";
  return headers;
}

console.log("来自 https://myapp.com:", buildCORSHeaders("https://myapp.com"));
console.log("来自 https://evil.com:", buildCORSHeaders("https://evil.com"));

console.log("\\n===== REST API 演示完成 =====");`,
  },
  {
    id: 'node-websocket',
    title: 'WebSocket 实时通信',
    icon: '🔌',
    group: '实战补充',
    content: `## WebSocket 实时通信深入解析

WebSocket 是 HTML5 引入的一种**全双工通信协议**，它在单个 TCP 连接上提供双向、低延迟、持久化的通信通道。与 HTTP 的"请求-响应"模式不同，WebSocket 连接建立后，服务器可以主动向客户端推送数据。

### WebSocket 协议基础

#### 握手机制（Opening Handshake）

WebSocket 连接始于一个 HTTP 升级请求。客户端发送带 Upgrade: websocket 和 Connection: Upgrade 头的请求，服务器返回 101 Switching Protocols。

Sec-WebSocket-Accept 的计算公式：
Base64(SHA1(Sec-WebSocket-Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))

魔术字符串是 RFC 6455 定义的，防止意外升级。

#### 数据帧（Frame）

握手完成后，数据通过帧传输。帧结构：FIN(1bit) + RSV(3bit) + Opcode(4bit) + MASK(1bit) + PayloadLen(7bit) + MaskingKey(可选4字节) + Payload。客户端发送的数据必须掩码处理（防缓存投毒），服务器发送的数据不能掩码。

#### 心跳机制（Ping/Pong）

Ping 帧（Opcode=9）检测连接存活，Pong 帧（Opcode=10）回复。通常服务器每 30 秒发送 Ping，客户端收到后自动回复 Pong。

---

### WebSocket vs HTTP 长轮询 vs SSE

| 特性 | WebSocket | HTTP 长轮询 | SSE |
| --- | --- | --- | --- |
| 通信方向 | 全双工（双向） | 半双工 | 单向（服务器→客户端） |
| 协议 | ws:// / wss:// | HTTP | HTTP |
| 连接模式 | 持久连接 | 每次请求-响应 | 持久连接 |
| 开销 | 帧头 2-10 字节 | 完整 HTTP 头 | HTTP 头 + 简单格式 |
| 自动重连 | 需手动实现 | 天然支持 | 内置 |
| 二进制数据 | 支持 | 需 Base64 | 仅文本 |

选择建议：需要双向通信用 WebSocket，只需服务器推送用 SSE，需要兼容远古浏览器用长轮询。

---

### WebSocket 连接管理

连接池模式：用 Map 管理 userId 到 WebSocket 的映射，另一个 Map 管理房间（roomName → Set<userId>）。加入房间、离开房间、向房间广播、向所有人广播。

心跳检测：定期发送 Ping，如果连续多次未收到 Pong 则断开连接。

自动重连：使用指数退避策略，延迟 = min(baseDelay * 2^retries, maxDelay)，加上随机抖动避免雷群效应。

---

### WebSocket 安全

1. 使用 WSS（WebSocket Secure），永远不要用明文 ws://
2. Origin 验证：握手时检查 Origin 头
3. 认证：Cookie（同源）或 Token（跨域，推荐）
4. 消息大小限制（maxPayload）
5. 速率限制（防止消息轰炸）

---

### Socket.IO 概念

Socket.IO 基于 WebSocket，提供自动重连、断线缓存、房间/命名空间、自动降级到长轮询、广播、ACK 确认机制等高级功能。

---

### 实时应用场景

聊天系统、协作编辑（需 OT/CRDT）、实时数据推送（股票/体育/IoT）、在线游戏、通知系统、实时监控。

下面代码用 events 模块模拟 WebSocket 的核心机制：握手、心跳、房间广播、重连等。`,
    code: `// ============================================================
// 第二章代码演示：WebSocket 核心机制模拟
// ============================================================
// 用 events 模块模拟 WebSocket 服务器和客户端的核心行为。

var EventEmitter = require("events").EventEmitter;
var crypto = require("crypto");

// ============================================================
// 演示 1：WebSocket 握手机制模拟
// ============================================================
console.log("===== 演示 1：WebSocket 握手机制 =====");

var clientKey = crypto.randomBytes(16).toString("base64");
console.log("客户端生成 Sec-WebSocket-Key:", clientKey);

var MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
var serverAccept = crypto.createHash("sha1").update(clientKey + MAGIC_STRING).digest("base64");
console.log("服务器计算 Sec-WebSocket-Accept:", serverAccept);

function verifyHandshake(key, accept) {
  var expected = crypto.createHash("sha1").update(key + MAGIC_STRING).digest("base64");
  return expected === accept;
}
console.log("握手验证:", verifyHandshake(clientKey, serverAccept) ? "✓ 通过" : "✗ 失败");

// ============================================================
// 演示 2：WebSocket 服务器模拟（房间+广播）
// ============================================================
console.log("\\n===== 演示 2：WebSocket 服务器连接管理 =====");

function MockWSServer() {
  EventEmitter.call(this);
  this.clients = new Map();
  this.nextId = 1;
}
MockWSServer.prototype = Object.create(EventEmitter.prototype);

MockWSServer.prototype.addClient = function (info) {
  var id = this.nextId++;
  var client = { id: id, name: (info && info.name) || "client-" + id, rooms: new Set(), connected: true };
  this.clients.set(id, client);
  this.emit("connection", client);
  console.log("  [连接] " + client.name + " 已连接 (ID: " + id + ")");
  return id;
};

MockWSServer.prototype.removeClient = function (id) {
  var client = this.clients.get(id);
  if (!client) return;
  client.connected = false;
  this.clients.delete(id);
  this.emit("disconnect", client);
  console.log("  [断开] " + client.name + " 已断开");
};

MockWSServer.prototype.joinRoom = function (clientId, room) {
  var client = this.clients.get(clientId);
  if (!client) return false;
  client.rooms.add(room);
  console.log("  [房间] " + client.name + " 加入房间 \\"" + room + "\\"");
  return true;
};

MockWSServer.prototype.getRoomClients = function (room) {
  var members = [];
  this.clients.forEach(function (client, id) {
    if (client.rooms.has(room)) members.push({ id: id, name: client.name });
  });
  return members;
};

MockWSServer.prototype.broadcastToRoom = function (room, message, excludeId) {
  var members = this.getRoomClients(room);
  console.log("  [广播→\\"" + room + "\\"] " + message + " (排除: " + (excludeId || "无") + ")");
  members.forEach(function (m) {
    if (m.id !== excludeId) console.log("    → 送达 " + m.name);
  });
  return members.length;
};

MockWSServer.prototype.broadcastAll = function (message) {
  console.log("  [全局广播] " + message);
  this.clients.forEach(function (client) { console.log("    → 送达 " + client.name); });
};

MockWSServer.prototype.getStats = function () {
  var clients = [];
  this.clients.forEach(function (c) { clients.push({ name: c.name, rooms: Array.from(c.rooms), connected: c.connected }); });
  return { totalClients: this.clients.size, clients: clients };
};

var wss = new MockWSServer();
var alice = wss.addClient({ name: "Alice" });
var bob = wss.addClient({ name: "Bob" });
var charlie = wss.addClient({ name: "Charlie" });
var dave = wss.addClient({ name: "Dave" });

wss.joinRoom(alice, "chat-room-1");
wss.joinRoom(bob, "chat-room-1");
wss.joinRoom(charlie, "chat-room-1");
wss.joinRoom(alice, "chat-room-2");
wss.joinRoom(dave, "chat-room-2");

console.log("\\n--- 房间成员 ---");
console.log("chat-room-1:", wss.getRoomClients("chat-room-1").map(function (c) { return c.name; }));
console.log("chat-room-2:", wss.getRoomClients("chat-room-2").map(function (c) { return c.name; }));

console.log("\\n--- 广播演示 ---");
wss.broadcastToRoom("chat-room-1", "大家好！我是 Alice", alice);
wss.broadcastToRoom("chat-room-2", "Dave 发了一条消息", dave);
wss.broadcastAll("系统通知：服务器将在 5 分钟后重启");

wss.removeClient(bob);
console.log("\\n--- 连接统计 ---");
console.table(wss.getStats().clients);

// ============================================================
// 演示 3：心跳检测机制
// ============================================================
console.log("\\n===== 演示 3：心跳检测（Ping/Pong）=====");

function HeartbeatManager(timeoutMs) {
  this.timeoutMs = timeoutMs || 3000;
  this.heartbeats = new Map();
  this.maxMissed = 3;
}
HeartbeatManager.prototype.register = function (clientId) {
  this.heartbeats.set(clientId, { lastPong: Date.now(), missed: 0 });
  console.log("  [心跳] 客户端 " + clientId + " 注册心跳检测");
};
HeartbeatManager.prototype.receivePong = function (clientId) {
  var hb = this.heartbeats.get(clientId);
  if (!hb) return;
  hb.lastPong = Date.now();
  hb.missed = 0;
  console.log("  [心跳] ← 收到客户端 " + clientId + " 的 Pong");
};
HeartbeatManager.prototype.checkTimeouts = function () {
  var now = Date.now();
  var disconnected = [];
  var self = this;
  this.heartbeats.forEach(function (hb, clientId) {
    if (now - hb.lastPong > self.timeoutMs) {
      hb.missed++;
      console.log("  [心跳] ⚠ 客户端 " + clientId + " 未响应，丢失: " + hb.missed);
      if (hb.missed >= self.maxMissed) {
        disconnected.push(clientId);
        console.log("  [心跳] ✗ 客户端 " + clientId + " 心跳超时，断开");
      }
    }
  });
  disconnected.forEach(function (id) { self.heartbeats.delete(id); });
  return disconnected;
};

var hb = new HeartbeatManager(3000);
hb.register(1); hb.register(2); hb.register(3);

console.log("\\n--- 第一轮 ---");
hb.receivePong(1); hb.receivePong(2);
hb.checkTimeouts();

console.log("\\n--- 第二轮 ---");
hb.receivePong(1);
hb.checkTimeouts();

console.log("\\n--- 第三轮 ---");
hb.receivePong(1);
var dc = hb.checkTimeouts();
console.log("断开的客户端:", dc);

// ============================================================
// 演示 4：自动重连（指数退避）
// ============================================================
console.log("\\n===== 演示 4：自动重连（指数退避）=====");

function ReconnectManager(maxRetries, baseDelay, maxDelay) {
  this.maxRetries = maxRetries || 5;
  this.baseDelay = baseDelay || 1000;
  this.maxDelay = maxDelay || 30000;
  this.retries = 0;
}
ReconnectManager.prototype.attempt = function () {
  this.retries++;
  if (this.retries > this.maxRetries) return { shouldRetry: false, message: "已达最大重试次数" };
  var delay = Math.min(this.baseDelay * Math.pow(2, this.retries), this.maxDelay);
  var jitter = Math.round(delay * (0.8 + Math.random() * 0.4));
  return { shouldRetry: true, delay: jitter, retryNumber: this.retries, message: "第 " + this.retries + " 次重连，等待 " + jitter + "ms" };
};
ReconnectManager.prototype.reset = function () { this.retries = 0; };

var rc = new ReconnectManager(5, 1000, 30000);
console.log("重连过程:");
for (var i = 0; i < 7; i++) {
  var result = rc.attempt();
  console.log("  " + (result.shouldRetry ? result.message : "✗ " + result.message));
}
rc.reset();
console.log("重置后:", rc.attempt().message);

// ============================================================
// 演示 5：Origin 验证与 Token 认证
// ============================================================
console.log("\\n===== 演示 5：Origin 验证与 Token 认证 =====");

var ALLOWED = ["https://myapp.com", "https://admin.myapp.com"];
function validateOrigin(origin) { return ALLOWED.indexOf(origin) !== -1; }
function validateToken(token) {
  if (!token) return { valid: false, reason: "缺少 Token" };
  if (token === "expired-token") return { valid: false, reason: "Token 已过期" };
  if (token.indexOf("valid-") === 0) return { valid: true, userId: token.split("-")[1] || "unknown" };
  return { valid: false, reason: "Token 无效" };
}

function handleConnection(origin, token) {
  if (!validateOrigin(origin)) return { allowed: false, code: 4001, reason: "Origin 不允许" };
  var auth = validateToken(token);
  if (!auth.valid) return { allowed: false, code: 4002, reason: auth.reason };
  return { allowed: true, userId: auth.userId };
}

var tests = [
  { origin: "https://myapp.com", token: "valid-user123" },
  { origin: "https://evil.com", token: "valid-user123" },
  { origin: "https://myapp.com", token: null },
  { origin: "https://myapp.com", token: "expired-token" },
  { origin: "https://admin.myapp.com", token: "valid-admin" },
];
tests.forEach(function (t) {
  var r = handleConnection(t.origin, t.token);
  console.log("  " + (r.allowed ? "✓" : "✗") + " " + t.origin + " | " + (r.allowed ? "用户:" + r.userId : "拒绝:" + r.reason));
});

console.log("\\n===== WebSocket 演示完成 =====");`,
  },
  {
    id: 'node-file-upload',
    title: '文件上传处理',
    icon: '📤',
    group: '实战补充',
    content: `## 文件上传处理完全指南

文件上传是 Web 开发中最常见也最容易出错的功能之一。处理不当会导致内存溢出、安全漏洞、性能问题。

### multipart/form-data 格式解析

当浏览器上传文件时，使用 multipart/form-data 编码类型。请求体由 boundary 分隔符分隔各字段。关键概念：boundary 分隔符、Content-Disposition（name 是字段名，filename 表示文件上传）、最后一个部分以 boundary-- 结尾。

### multer 概念

multer 是 Node.js 最流行的文件上传中间件，基于 busboy 构建。核心概念：
- **Storage**：DiskStorage（存磁盘）、MemoryStorage（存内存）、自定义（存云存储）
- **File Filter**：过滤函数，拒绝不符合要求的文件
- **Limits**：限制文件大小、数量

### 流式上传（防止内存溢出）

大文件上传必须使用流式处理：边接收边写入磁盘，内存中始终只保留一小块数据（如 64KB）。使用 stream.pipeline() 自动处理背压和错误。

### 文件大小限制

在多个层面设置限制（纵深防御）：应用层（multer limits）、反向代理（Nginx client_max_body_size）、负载均衡器、云存储。最外层限制最宽松，内层最严格。

### 文件类型校验（魔数检测）

**不要只依赖扩展名或 MIME 类型**——它们都可以被伪造。应检查文件的魔数（Magic Number）：

| 文件类型 | 魔数（十六进制） |
| --- | --- |
| PNG | 89 50 4E 47 0D 0A 1A 0A |
| JPEG | FF D8 FF |
| GIF | 47 49 46 38 |
| PDF | 25 50 44 46 |
| ZIP | 50 4B 03 04 |

### 文件存储策略

本地存储简单但无法水平扩展；云存储（S3/OSS/COS）无限扩展、高可用但需处理网络延迟；混合策略：小文件本地、大文件云存储。

### 文件命名规范

**永远不要使用用户提供的原始文件名**，防止安全风险（路径遍历）和冲突。推荐：UUID 命名、时间戳+随机数、内容哈希（相同内容去重）。

### 断点续传与分片上传

大文件上传：切割成小块（如 5MB），并发上传，失败可单独重试。断点续传：客户端询问服务器已接收的字节范围，从中断处继续。

### 图片处理（sharp 概念）

sharp 基于 libvips，比 ImageMagick 快 4-5 倍。支持缩略图生成、格式转换（PNG→WebP）、裁剪压缩等。

### 安全清单

限制文件大小、校验文件类型（魔数）、使用随机文件名、上传目录不可执行、病毒扫描、限制速率、使用 HTTPS。

下面代码模拟文件上传核心流程：multipart 解析、魔数检测、分片上传、流式处理等。`,
    code: `// ============================================================
// 第三章代码演示：文件上传处理模拟
// ============================================================
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var os = require("os");
var stream = require("stream");
var Readable = stream.Readable;
var Writable = stream.Writable;
var Transform = stream.Transform;

// ============================================================
// 演示 1：multipart/form-data 格式解析
// ============================================================
console.log("===== 演示 1：multipart/form-data 解析 =====");

var BOUNDARY = "----FormBoundary123";
var multipartBody = [
  "--" + BOUNDARY,
  'Content-Disposition: form-data; name="username"',
  "",
  "张三",
  "--" + BOUNDARY,
  'Content-Disposition: form-data; name="avatar"; filename="photo.jpg"',
  "Content-Type: image/jpeg",
  "",
  "[模拟的图片二进制数据...]",
  "--" + BOUNDARY,
  'Content-Disposition: form-data; name="description"',
  "",
  "这是一段描述文字",
  "--" + BOUNDARY + "--",
].join("\\r\\n");

console.log("原始 multipart 请求体:");
console.log(multipartBody);

function parseMultipart(body, boundary) {
  var result = { fields: {}, files: [] };
  var parts = body.split("--" + boundary);
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    if (part.trim() === "" || part.trim() === "--") continue;
    var headerEnd = part.indexOf("\\r\\n\\r\\n");
    if (headerEnd === -1) continue;
    var headerSection = part.slice(0, headerEnd);
    var content = part.slice(headerEnd + 4).replace(/\\r\\n\$/, "");
    var nameMatch = headerSection.match(/name="([^"]+)"/);
    var filenameMatch = headerSection.match(/filename="([^"]+)"/);
    if (!nameMatch) continue;
    var fieldName = nameMatch[1];
    if (filenameMatch) {
      var ctMatch = headerSection.match(/Content-Type: (.+)/);
      result.files.push({
        fieldname: fieldName, filename: filenameMatch[1],
        contentType: ctMatch ? ctMatch[1].trim() : "application/octet-stream",
        size: content.length, data: content.slice(0, 50) + "..."
      });
    } else {
      result.fields[fieldName] = content;
    }
  }
  return result;
}

var parsed = parseMultipart(multipartBody, BOUNDARY);
console.log("\\n解析结果 - 字段:");
console.table(parsed.fields);
console.log("解析结果 - 文件:");
console.table(parsed.files.map(function (f) {
  return { 字段名: f.fieldname, 文件名: f.filename, 类型: f.contentType, 大小: f.size + " 字节" };
}));

// ============================================================
// 演示 2：文件类型校验（魔数检测）
// ============================================================
console.log("\\n===== 演示 2：魔数检测 =====");

var MAGIC = {
  "image/png":  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  "image/jpeg": Buffer.from([0xFF, 0xD8, 0xFF]),
  "image/gif":  Buffer.from([0x47, 0x49, 0x46, 0x38]),
  "application/pdf": Buffer.from([0x25, 0x50, 0x44, 0x46]),
  "application/zip": Buffer.from([0x50, 0x4B, 0x03, 0x04]),
};

function detectFileType(buffer) {
  var keys = Object.keys(MAGIC);
  for (var i = 0; i < keys.length; i++) {
    var sig = MAGIC[keys[i]];
    if (buffer.length >= sig.length && buffer.slice(0, sig.length).equals(sig)) {
      return keys[i];
    }
  }
  return "application/octet-stream";
}

function validateFile(buffer, allowedTypes) {
  var detected = detectFileType(buffer);
  return { detectedType: detected, isAllowed: allowedTypes.indexOf(detected) !== -1 };
}

var testFiles = [
  { name: "photo.png",  header: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]) },
  { name: "photo.jpg",  header: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]) },
  { name: "doc.pdf",    header: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31]) },
  { name: "virus.exe",  header: Buffer.from([0x4D, 0x5A, 0x90, 0x00]) },
  { name: "fake.png",   header: Buffer.from([0x4D, 0x5A, 0x90, 0x00]) },
];

var allowedImageTypes = ["image/png", "image/jpeg", "image/gif"];
console.log("文件类型校验结果:");
testFiles.forEach(function (file) {
  var r = validateFile(file.header, allowedImageTypes);
  console.log("  " + file.name + " -> 检测到: " + r.detectedType + " " + (r.isAllowed ? "✓ 通过" : "✗ 拒绝"));
});
console.log("\\n⚠ fake.png 声称是 PNG，但魔数暴露了真实身份");

// ============================================================
// 演示 3：文件大小限制 + 流式写入
// ============================================================
console.log("\\n===== 演示 3：文件大小限制 + 流式写入 =====");

var tempDir = path.join(os.tmpdir(), "upload-demo-" + Date.now());
fs.mkdirSync(tempDir, { recursive: true });
var testFile = path.join(tempDir, "test-upload.txt");
fs.writeFileSync(testFile, "A".repeat(5000));

function LimitedWriteStream(filePath, maxSize) {
  Writable.call(this);
  this.filePath = filePath;
  this.maxSize = maxSize;
  this.bytesWritten = 0;
  this.exceeded = false;
  this.ws = fs.createWriteStream(filePath);
}
LimitedWriteStream.prototype = Object.create(Writable.prototype);
LimitedWriteStream.prototype._write = function (chunk, encoding, callback) {
  this.bytesWritten += chunk.length;
  if (this.bytesWritten > this.maxSize) {
    this.exceeded = true;
    this.ws.destroy();
    callback(new Error("文件大小超出限制: " + this.bytesWritten + " > " + this.maxSize + " 字节"));
    return;
  }
  this.ws.write(chunk, callback);
};
LimitedWriteStream.prototype._final = function (callback) {
  this.ws.end(callback);
};

var outPath1 = path.join(tempDir, "upload-ok.txt");
var ws1 = new LimitedWriteStream(outPath1, 10 * 1024);
fs.createReadStream(testFile).pipe(ws1);
ws1.on("finish", function () {
  var stats = fs.statSync(outPath1);
  console.log("  ✓ 上传成功(10KB限制): " + stats.size + " 字节");

  var outPath2 = path.join(tempDir, "upload-fail.txt");
  var ws2 = new LimitedWriteStream(outPath2, 3 * 1024);
  fs.createReadStream(testFile).pipe(ws2);
  ws2.on("error", function (err) {
    console.log("  ✗ " + err.message);
    console.log("  已写入: " + ws2.bytesWritten + " 字节（超出限制被拒绝）");
    try { fs.unlinkSync(testFile); fs.unlinkSync(outPath1); fs.rmdirSync(tempDir); } catch (e) {}
  });
});

// ============================================================
// 演示 4：分片上传模拟
// ============================================================
console.log("\\n===== 演示 4：分片上传模拟 =====");

var CHUNK_SIZE = 1024;
var totalSize = 5000;
var totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
var chunkStore = new Map();

console.log("文件大小: " + totalSize + "B, 分片大小: " + CHUNK_SIZE + "B, 总分片: " + totalChunks);

function uploadChunk(idx) {
  var start = idx * CHUNK_SIZE;
  var end = Math.min(start + CHUNK_SIZE, totalSize);
  var size = end - start;
  chunkStore.set(idx, "X".repeat(size));
  console.log("  上传分片 " + (idx + 1) + "/" + totalChunks + ": 字节 " + start + "-" + (end - 1) + " (" + size + "B)");
  return { index: idx, size: size, success: true };
}

console.log("开始并发上传分片:");
for (var i = 0; i < totalChunks; i++) uploadChunk(i);

console.log("\\n合并分片...");
var merged = "";
var totalUploaded = 0;
for (var i = 0; i < totalChunks; i++) {
  merged += chunkStore.get(i);
  totalUploaded += chunkStore.get(i).length;
}
console.log("合并完成: " + totalUploaded + "B, 完整性: " + (totalUploaded === totalSize ? "✓" : "✗"));

console.log("\\n--- 模拟分片失败重试 ---");
console.log("分片 3 上传失败，正在重试...");
chunkStore.delete(2);
var retry = uploadChunk(2);
console.log("重试结果: " + (retry.success ? "✓ 成功" : "✗ 失败"));

// ============================================================
// 演示 5：文件命名策略
// ============================================================
console.log("\\n===== 演示 5：文件命名策略 =====");

function uuidFilename(originalname) {
  var ext = path.extname(originalname).toLowerCase();
  return crypto.randomUUID() + ext;
}

function timestampFilename(originalname) {
  var ext = path.extname(originalname).toLowerCase();
  return Date.now() + "-" + crypto.randomBytes(6).toString("hex") + ext;
}

function hashFilename(buffer, originalname) {
  var ext = path.extname(originalname).toLowerCase();
  var hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  return hash + ext;
}

function sanitizeFilename(filename) {
  var sanitized = path.basename(filename);
  sanitized = sanitized.replace(/[\\x00-\\x1f\\x80-\\x9f]/g, "");
  if (sanitized.length > 255) {
    var ext = path.extname(sanitized);
    sanitized = sanitized.slice(0, 255 - ext.length) + ext;
  }
  return sanitized || "unnamed";
}

var testNames = ["My Photo.jpg", "简历.pdf", "../etc/passwd"];
console.log("原始文件名 → 安全命名:");
testNames.forEach(function (name) {
  var buf = Buffer.from(name);
  console.log("  原始: " + name);
  console.log("    UUID:  " + uuidFilename(name));
  console.log("    时间戳: " + timestampFilename(name));
  console.log("    哈希:  " + hashFilename(buf, name));
});

console.log("\\n路径遍历防护:");
var dangerous = ["../../etc/passwd", "../../../var/www/index.html", "normal-file.txt"];
dangerous.forEach(function (name) {
  console.log("  \\"" + name + "\\" -> \\"" + sanitizeFilename(name) + "\\"");
});

// ============================================================
// 演示 6：流式上传进度
// ============================================================
console.log("\\n===== 演示 6：流式上传进度 =====");

function UploadProgress(total) {
  Transform.call(this);
  this.total = total;
  this.processed = 0;
}
UploadProgress.prototype = Object.create(Transform.prototype);
UploadProgress.prototype._transform = function (chunk, encoding, callback) {
  this.processed += chunk.length;
  var pct = Math.round(this.processed / this.total * 100);
  if (pct % 25 === 0 && this.processed - chunk.length < this.total * 0.25) {
    console.log("  上传进度: " + pct + "% (" + this.processed + "/" + this.total + "B)");
  }
  this.push(chunk);
  callback();
};
UploadProgress.prototype._flush = function (callback) {
  console.log("  上传进度: 100% (" + this.processed + "/" + this.total + "B) - 完成");
  callback();
};

var data = "Hello Node.js! 模拟上传内容。".repeat(50);
var source = Readable.from([data]);
var progress = new UploadProgress(data.length);
var chunks = [];
var sink = new Writable({
  write: function (chunk, encoding, cb) { chunks.push(chunk); cb(); }
});

console.log("模拟流式上传（带进度）:");
source.pipe(progress).pipe(sink);
sink.on("finish", function () {
  var total = chunks.reduce(function (s, c) { return s + c.length; }, 0);
  console.log("总接收: " + total + "B, 完整性: " + (total === data.length ? "✓" : "✗"));
});

console.log("\\n===== 文件上传演示完成 =====");`,
  },
  {
    id: 'node-auth',
    title: '认证与授权',
    icon: '🔑',
    group: '实战补充',
    content: `## 认证与授权深度解析

认证（Authentication）和授权（Authorization）是 Web 安全的两个基石。认证是"你是谁？"，授权是"你能做什么？"。认证在前，授权在后。

### Session vs Token 认证

**Session 认证**：服务器存储 Session，返回 Session ID（Cookie）。优点：可随时撤销，成熟。缺点：有状态，水平扩展需共享 Session，不适合移动端。

**Token 认证（JWT）**：服务器签发 Token，客户端存储并每次请求携带。优点：无状态，跨域友好，适合微服务和移动端。缺点：无法撤销，体积大，有泄露风险。

### JWT（JSON Web Token）深入解析

JWT 由三部分组成，用点号分隔：Header.Payload.Signature。

**Header**：Base64Url 编码的 JSON，包含算法（alg）和类型（typ）。
**Payload**：Base64Url 编码的 JSON，包含声明（Claims）。标准声明：iss（签发者）、sub（主题）、exp（过期时间）、iat（签发时间）、nbf（生效时间）、jti（唯一ID）。
**Signature**：对前两部分的签名，防止篡改。

签名算法：HS256（对称密钥，单服务）、RS256（公钥/私钥，微服务）、ES256（椭圆曲线，更短更安全）。**永远不要用 none 算法**。

#### Access Token + Refresh Token 模式

Access Token 短有效期（15分钟-1小时），存内存中；Refresh Token 长有效期（7天-30天），存 HttpOnly Cookie 中。Access Token 过期后用 Refresh Token 换取新的，Refresh Token 过期后需重新登录。Refresh Token 应支持轮换（每次使用后签发新的，旧的失效）。

### OAuth 2.0 授权框架

OAuth 2.0 是授权框架，不是认证协议。四种授权流程：
1. **授权码模式**（最安全）：用户授权→获取授权码→后端用 code 换 token（需 client_secret）
2. **隐式模式**（已废弃）：Token 直接返回前端
3. **密码模式**（已废弃）：用户密码直接给应用
4. **客户端凭证模式**：服务间通信，无用户参与

### bcrypt 密码哈希

**永远不要明文存储密码**。bcrypt 自动加盐（每个密码盐值不同），计算慢（可调节 rounds），输出包含 salt。一般 10-12 rounds，每次验证约 100-300ms。

### RBAC（基于角色的访问控制）

三个核心概念：用户（User）、角色（Role，权限的集合）、权限（Permission，具体操作许可）。用户多对多角色，角色多对多权限。例如：admin 角色有 user:delete、settings:write 等权限，editor 角色有 post:write、post:publish 等权限。

### 安全最佳实践

1. 始终使用 HTTPS
2. 密码哈希存储（bcrypt/argon2）
3. 短有效期 Access Token（15分钟-1小时）
4. Refresh Token 轮换
5. 限制登录尝试（5次失败锁定15分钟）
6. Token 黑名单用于撤销
7. CSRF 防护
8. HttpOnly Cookie 存储敏感 Token

下面代码用 crypto 模块实现 JWT 签名验证、密码哈希、RBAC 权限检查等核心机制。`,
    code: `// ============================================================
// 第四章代码演示：认证与授权机制模拟
// ============================================================
var crypto = require("crypto");

// ============================================================
// 演示 1：JWT 签名与验证（从零实现）
// ============================================================
console.log("===== 演示 1：JWT 签名与验证 =====");

function base64UrlEncode(str) {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");
}
function base64UrlDecode(str) {
  var base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf8");
}

function createJWT(payload, secret, options) {
  options = options || {};
  var header = { alg: "HS256", typ: "JWT" };
  var now = Math.floor(Date.now() / 1000);
  var claims = Object.assign({}, payload, { iat: now, exp: now + (options.expiresIn || 3600) });
  if (options.issuer) claims.iss = options.issuer;
  if (options.subject) claims.sub = options.subject;

  var encodedHeader = base64UrlEncode(JSON.stringify(header));
  var encodedPayload = base64UrlEncode(JSON.stringify(claims));
  var signingInput = encodedHeader + "." + encodedPayload;
  var signature = crypto.createHmac("sha256", secret).update(signingInput).digest("base64")
    .replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");
  return signingInput + "." + signature;
}

function verifyJWT(token, secret, options) {
  options = options || {};
  var parts = token.split(".");
  if (parts.length !== 3) return { valid: false, error: "JWT 格式错误" };

  var signingInput = parts[0] + "." + parts[1];
  var expectedSig = crypto.createHmac("sha256", secret).update(signingInput).digest("base64")
    .replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");

  if (parts[2] !== expectedSig) return { valid: false, error: "签名验证失败，Token 可能被篡改" };

  var payload;
  try { payload = JSON.parse(base64UrlDecode(parts[1])); }
  catch (e) { return { valid: false, error: "Payload 解析失败" }; }

  var now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return { valid: false, error: "Token 已过期" };
  if (payload.nbf && now < payload.nbf) return { valid: false, error: "Token 尚未生效" };
  if (options.issuer && payload.iss !== options.issuer) return { valid: false, error: "签发者不匹配" };

  return { valid: true, payload: payload };
}

var SECRET = "my-super-secret-key-2024";
var token = createJWT({ userId: 42, name: "张三", role: "admin" }, SECRET, { expiresIn: 3600, issuer: "my-auth" });
console.log("JWT Token:", token);

var parts = token.split(".");
console.log("\\nHeader:", JSON.parse(base64UrlDecode(parts[0])));
console.log("Payload:", JSON.parse(base64UrlDecode(parts[1])));
console.log("Signature:", parts[2].slice(0, 20) + "...");

console.log("\\n验证结果:");
console.log("  正确密钥: " + (verifyJWT(token, SECRET).valid ? "✓ 通过" : "✗ 失败"));
console.log("  篡改后: " + (verifyJWT(token.replace("42", "99"), SECRET).valid ? "✓ 通过" : "✗ 签名失败"));
console.log("  错误密钥: " + (verifyJWT(token, "wrong-secret").valid ? "✓ 通过" : "✗ 签名失败"));

// ============================================================
// 演示 2：Token 过期与 Refresh Token
// ============================================================
console.log("\\n===== 演示 2：Token 过期与刷新 =====");

var shortToken = createJWT({ userId: 42 }, SECRET, { expiresIn: -1 });
var vr = verifyJWT(shortToken, SECRET);
console.log("已过期Token:", vr.valid ? "✓ 有效" : "✗ " + vr.error);

function TokenManager(secret) {
  this.secret = secret;
  this.refreshTokens = new Map();
}
TokenManager.prototype.login = function (user) {
  var accessToken = createJWT({ userId: user.id, name: user.name, role: user.role }, this.secret, { expiresIn: 900 });
  var refreshToken = crypto.randomBytes(32).toString("hex");
  this.refreshTokens.set(refreshToken, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 });
  return { accessToken: accessToken, refreshToken: refreshToken, expiresIn: 900, tokenType: "Bearer" };
};
TokenManager.prototype.refresh = function (refreshToken) {
  var stored = this.refreshTokens.get(refreshToken);
  if (!stored) return { success: false, error: "Refresh Token 无效" };
  if (Date.now() > stored.expiresAt) { this.refreshTokens.delete(refreshToken); return { success: false, error: "Refresh Token 已过期" }; }
  var newAccess = createJWT({ userId: stored.userId }, this.secret, { expiresIn: 900 });
  var newRefresh = crypto.randomBytes(32).toString("hex");
  this.refreshTokens.delete(refreshToken);
  this.refreshTokens.set(newRefresh, { userId: stored.userId, expiresAt: Date.now() + 7 * 24 * 3600 * 1000 });
  return { success: true, accessToken: newAccess, refreshToken: newRefresh, expiresIn: 900 };
};

var tm = new TokenManager(SECRET);
var loginResult = tm.login({ id: 42, name: "张三", role: "admin" });
console.log("\\n登录成功:");
console.log("  Access Token (前30):", loginResult.accessToken.slice(0, 30) + "...");
console.log("  Refresh Token (前20):", loginResult.refreshToken.slice(0, 20) + "...");

var refreshResult = tm.refresh(loginResult.refreshToken);
console.log("\\n刷新Token:", refreshResult.success ? "✓ 成功" : "✗ " + refreshResult.error);
if (refreshResult.success) {
  console.log("  旧RefreshToken已失效:", tm.refresh(loginResult.refreshToken).success ? "✗ 未失效（不安全）" : "✓ 已失效");
}

// ============================================================
// 演示 3：密码哈希与验证
// ============================================================
console.log("\\n===== 演示 3：密码哈希与验证 =====");

function hashPassword(password, rounds) {
  rounds = rounds || 100000;
  var salt = crypto.randomBytes(16).toString("hex");
  var hash = crypto.pbkdf2Sync(password, salt, rounds, 64, "sha512").toString("hex");
  return rounds + "\$" + salt + "\$" + hash;
}
function verifyPassword(password, stored) {
  var parts = stored.split("\$");
  if (parts.length !== 3) return false;
  var hash = crypto.pbkdf2Sync(password, parts[1], parseInt(parts[0]), 64, "sha512").toString("hex");
  return hash === parts[2];
}

var passwords = ["password123", "Admin@2024!", "password123"];
console.log("密码哈希:");
passwords.forEach(function (pwd, i) {
  var hashed = hashPassword(pwd);
  console.log("  密码" + (i + 1) + ": \\"" + pwd + "\\" -> " + hashed.slice(0, 30) + "...");
  console.log("    验证: " + (verifyPassword(pwd, hashed) ? "✓" : "✗"));
});

console.log("\\n相同密码产生不同哈希:");
console.log("  哈希1:", hashPassword("same").slice(0, 30) + "...");
console.log("  哈希2:", hashPassword("same").slice(0, 30) + "...");
console.log("  结论: 盐值随机，相同密码哈希不同，防彩虹表");

var stored = hashPassword("correct");
console.log("\\n错误密码: " + verifyPassword("wrong", stored));

// ============================================================
// 演示 4：RBAC 权限检查
// ============================================================
console.log("\\n===== 演示 4：RBAC 权限检查 =====");

var ROLES = {
  admin: { permissions: ["user:read","user:write","user:delete","post:read","post:write","post:delete","post:publish","settings:read","settings:write","audit:read"] },
  editor: { permissions: ["user:read","post:read","post:write","post:delete:own","post:publish"] },
  viewer: { permissions: ["user:read","post:read"] },
};

var users = [
  { id: 1, name: "超级管理员", role: "admin" },
  { id: 2, name: "内容编辑", role: "editor" },
  { id: 3, name: "普通访客", role: "viewer" },
];

function hasPermission(user, perm) {
  var role = ROLES[user.role];
  if (!role) return false;
  var perms = role.permissions;
  if (perms.indexOf(perm) !== -1) return true;
  var parts = perm.split(":");
  return perms.indexOf(parts[0] + ":*") !== -1;
}

function createGuard(perm) {
  return function (user) {
    var allowed = hasPermission(user, perm);
    return { allowed: allowed, user: user.name, role: user.role, required: perm,
      reason: allowed ? "允许" : "角色\\"" + user.role + "\\"无\\"" + perm + "\\"权限" };
  };
}

console.log("RBAC 权限矩阵:");
var testPerms = ["user:read","user:write","user:delete","post:write","post:delete","settings:write","audit:read"];
var header = "权限".padEnd(20);
users.forEach(function (u) { header += u.name.padEnd(14); });
console.log(header);
console.log("-".repeat(60));
testPerms.forEach(function (perm) {
  var row = ("  " + perm).padEnd(20);
  users.forEach(function (user) {
    row += (createGuard(perm)(user).allowed ? "✓" : "✗").padEnd(14);
  });
  console.log(row);
});

// ============================================================
// 演示 5：OAuth 2.0 授权码流程模拟
// ============================================================
console.log("\\n===== 演示 5：OAuth 2.0 授权码流程 =====");

function OAuthServer() {
  this.clients = new Map();
  this.authCodes = new Map();
  this.accessTokens = new Map();
}
OAuthServer.prototype.registerClient = function (clientId, secret, redirectUri) {
  this.clients.set(clientId, { secret: secret, redirectUri: redirectUri });
};
OAuthServer.prototype.authorize = function (clientId, redirectUri, userId) {
  var client = this.clients.get(clientId);
  if (!client) return { error: "invalid_client" };
  if (client.redirectUri !== redirectUri) return { error: "redirect_uri_mismatch" };
  var code = crypto.randomBytes(16).toString("hex");
  this.authCodes.set(code, { clientId: clientId, userId: userId, expiresAt: Date.now() + 600000 });
  console.log("  1. 用户授权 → 授权码: " + code.slice(0, 12) + "...");
  console.log("  2. 回调: " + redirectUri + "?code=" + code.slice(0, 12) + "...");
  return { code: code };
};
OAuthServer.prototype.exchangeCode = function (code, clientId, clientSecret) {
  var client = this.clients.get(clientId);
  if (!client || client.secret !== clientSecret) return { error: "invalid_client" };
  var authData = this.authCodes.get(code);
  if (!authData) return { error: "invalid_grant", description: "授权码无效" };
  if (authData.clientId !== clientId) return { error: "invalid_grant" };
  if (Date.now() > authData.expiresAt) { this.authCodes.delete(code); return { error: "invalid_grant", description: "授权码已过期" }; }
  var accessToken = crypto.randomBytes(32).toString("hex");
  this.accessTokens.set(accessToken, { userId: authData.userId, clientId: clientId, expiresAt: Date.now() + 3600000 });
  this.authCodes.delete(code);
  console.log("  3. 后端用授权码换取 Token");
  console.log("  4. 返回 Access Token: " + accessToken.slice(0, 12) + "...");
  return { access_token: accessToken, token_type: "Bearer", expires_in: 3600 };
};
OAuthServer.prototype.verifyToken = function (token) {
  var data = this.accessTokens.get(token);
  if (!data) return { valid: false, error: "Token 无效" };
  if (Date.now() > data.expiresAt) { this.accessTokens.delete(token); return { valid: false, error: "Token 已过期" }; }
  return { valid: true, userId: data.userId };
};

var oauth = new OAuthServer();
oauth.registerClient("app-123", "secret-abc", "https://myapp.com/callback");
console.log("OAuth 2.0 授权码流程:");
var authResult = oauth.authorize("app-123", "https://myapp.com/callback", "user-42");
if (authResult.code) {
  var tokenResult = oauth.exchangeCode(authResult.code, "app-123", "secret-abc");
  if (tokenResult.access_token) {
    console.log("  5. 验证Token: " + (oauth.verifyToken(tokenResult.access_token).valid ? "✓ 有效" : "✗ 无效"));
    console.log("\\n安全测试：重用授权码");
    var reuse = oauth.exchangeCode(authResult.code, "app-123", "secret-abc");
    console.log("  重用结果: " + (reuse.error ? "✗ " + reuse.error : "✓ 成功（不安全！）"));
  }
}

console.log("\\n===== 认证与授权演示完成 =====");`,
  },
  {
    id: 'node-middleware',
    title: '中间件模式',
    icon: '🔗',
    group: '实战补充',
    content: `## 中间件模式深度解析

中间件（Middleware）是 Node.js Web 框架（Express、Koa 等）中最核心的设计模式。它允许你将请求处理逻辑拆分成独立的、可组合的函数，每个函数专注于一个职责。

### 中间件的核心概念

中间件就是一个函数，接收请求上下文，可以选择：执行操作（日志、认证）、修改请求/响应对象、调用 next() 进入下一个中间件、终止请求-响应循环。

### 洋葱模型（Onion Model）

中间件按注册顺序执行，每个中间件可以在 next() 之前做前置处理，在 next() 之后做后置处理。形如剥洋葱：请求 → 中间件1前置 → 中间件2前置 → 核心业务 → 中间件2后置 → 中间件1后置 → 响应。如果某个中间件不调用 next()，后续中间件不会执行。

### Express vs Koa 中间件对比

| 特性 | Express | Koa |
| --- | --- | --- |
| 中间件签名 | (req, res, next) | (ctx, next) |
| next 返回值 | 无 | Promise |
| 错误处理 | 4参数 (err, req, res, next) | try/catch |
| 异步支持 | 手动调用 next(err) | 原生 async/await |
| 洋葱模型 | 支持但不完整 | 完整支持（Promise链） |

### 中间件执行顺序

典型的 Express 中间件顺序：1. 安全中间件（helmet、cors）2. 请求解析中间件（json、urlencoded）3. 日志中间件（morgan）4. 认证中间件（passport、jwt）5. 业务路由 6. 错误处理中间件（4参数，放最后）

### 错误处理中间件

Express 中错误处理中间件有4个参数：(err, req, res, next)。Koa 中用 try/catch 更直观。

### 常用中间件模式

1. **日志中间件**：记录请求方法、URL、状态码、耗时
2. **认证中间件**：验证 Token/Session，注入用户信息
3. **CORS 中间件**：设置跨域响应头，处理 OPTIONS 预检请求
4. **压缩中间件**：gzip/deflate 压缩响应体
5. **限流中间件**：基于 IP 或用户限制请求频率

### 中间件组合（compose）

compose 函数将多个中间件组合成一个函数，按顺序执行。Koa 的 koa-compose 是最经典的实现，核心是用 dispatch(i) 递归调用下一个中间件。

### 中间件与 AOP（面向切面编程）

中间件本质上是 AOP 的实现：将横切关注点（日志、认证、缓存）从业务逻辑中分离出来，通过"织入"的方式应用到多个请求处理中。

下面代码实现洋葱模型中间件系统、日志/认证/错误处理/限流中间件。`,
    code: `// ============================================================
// 第五章代码演示：中间件模式模拟
// ============================================================
// 实现洋葱模型中间件系统（compose），以及日志、认证、
// 错误处理、限流等常用中间件模式。

// ============================================================
// 演示 1：洋葱模型 compose 实现
// ============================================================
console.log("===== 演示 1：洋葱模型 compose =====");

function compose(middlewares) {
  return function (ctx) {
    var index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error("next() 被多次调用"));
      index = i;
      var fn = middlewares[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, function next() { return dispatch(i + 1); }));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

var middleware1 = function (ctx, next) {
  console.log("  [中间件1] 前置处理 - 请求开始");
  ctx.trace = ["1-start"];
  return next().then(function () {
    ctx.trace.push("1-end");
    console.log("  [中间件1] 后置处理 - 请求结束");
  });
};

var middleware2 = function (ctx, next) {
  console.log("    [中间件2] 前置处理 - 日志记录");
  ctx.trace.push("2-start");
  ctx.startTime = Date.now();
  return next().then(function () {
    var ms = Date.now() - ctx.startTime;
    ctx.trace.push("2-end");
    console.log("    [中间件2] 后置处理 - 耗时: " + ms + "ms");
  });
};

var middleware3 = function (ctx, next) {
  console.log("      [中间件3] 核心业务处理");
  ctx.trace.push("3-core");
  ctx.body = { status: "ok", message: "处理完成" };
  return next();
};

var app = compose([middleware1, middleware2, middleware3]);
var ctx = {};

app(ctx).then(function () {
  console.log("\\n执行轨迹: " + ctx.trace.join(" → "));
  console.log("响应体:", JSON.stringify(ctx.body));
  console.log("洋葱模型: 1-start → 2-start → 3-core → 2-end → 1-end");
});

// ============================================================
// 演示 2：日志中间件
// ============================================================
console.log("\\n===== 演示 2：日志中间件 =====");

function loggerMiddleware(ctx, next) {
  var start = Date.now();
  var method = ctx.method || "GET";
  var url = ctx.url || "/";
  console.log("  → " + method + " " + url + " - 请求开始");
  return next().then(function () {
    var ms = Date.now() - start;
    var status = ctx.status || 200;
    console.log("  ← " + method + " " + url + " - " + status + " - " + ms + "ms");
  });
}

var noop = function (ctx, next) { return next(); };
var logCtxs = [
  { method: "GET", url: "/api/users", status: 200 },
  { method: "POST", url: "/api/users", status: 201 },
  { method: "DELETE", url: "/api/users/5", status: 404 },
];
logCtxs.forEach(function (c) { compose([loggerMiddleware, noop])(c); });

// ============================================================
// 演示 3：认证中间件
// ============================================================
console.log("\\n===== 演示 3：认证中间件 =====");

function authMiddleware(ctx, next) {
  var token = ctx.headers && ctx.headers.authorization;
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: "未认证：缺少 Authorization 头" };
    return Promise.resolve();
  }
  if (token === "Bearer valid-token") {
    ctx.user = { id: 42, name: "张三", role: "admin" };
    console.log("  ✓ 认证通过: " + ctx.user.name + " (" + ctx.user.role + ")");
    return next();
  }
  ctx.status = 401;
  ctx.body = { error: "Token 无效" };
  return Promise.resolve();
}

var businessHandler = function (ctx, next) {
  ctx.body = { data: "敏感数据", accessedBy: ctx.user ? ctx.user.name : "unknown" };
  return next();
};

var app2 = compose([authMiddleware, businessHandler]);

console.log("--- 有效Token ---");
var authCtx1 = { headers: { authorization: "Bearer valid-token" } };
app2(authCtx1).then(function () {
  console.log("  状态: " + authCtx1.status + ", 用户: " + (authCtx1.user ? authCtx1.user.name : "无"));
});

console.log("--- 缺少Token ---");
var authCtx2 = { headers: {} };
app2(authCtx2).then(function () {
  console.log("  状态: " + authCtx2.status + ", 错误: " + authCtx2.body.error);
});

console.log("--- 无效Token ---");
var authCtx3 = { headers: { authorization: "Bearer invalid" } };
app2(authCtx3).then(function () {
  console.log("  状态: " + authCtx3.status + ", 错误: " + authCtx3.body.error);
});

// ============================================================
// 演示 4：错误处理中间件
// ============================================================
console.log("\\n===== 演示 4：错误处理中间件 =====");

function errorHandler(ctx, next) {
  return next().catch(function (err) {
    console.log("  [错误捕获] " + err.message);
    ctx.status = err.status || 500;
    ctx.body = { error: { code: err.code || "INTERNAL_ERROR", message: err.message } };
  });
}

function riskyMiddleware(ctx, next) {
  if (ctx.url === "/api/error") {
    var err = new Error("数据库连接失败");
    err.status = 503;
    err.code = "DB_CONNECTION_ERROR";
    return Promise.reject(err);
  }
  return next();
}

function normalHandler(ctx, next) { ctx.body = { success: true }; return next(); }

var app3 = compose([errorHandler, riskyMiddleware, normalHandler]);

console.log("--- 正常请求 ---");
var okCtx = { url: "/api/users" };
app3(okCtx).then(function () {
  console.log("  状态: " + (okCtx.status || 200) + ", 响应: " + JSON.stringify(okCtx.body));
});

console.log("--- 错误请求 ---");
var errCtx = { url: "/api/error" };
app3(errCtx).then(function () {
  console.log("  状态: " + errCtx.status + ", 响应: " + JSON.stringify(errCtx.body));
});

// ============================================================
// 演示 5：限流中间件
// ============================================================
console.log("\\n===== 演示 5：限流中间件 =====");

function createRateLimitMiddleware(maxRequests, windowMs) {
  var counters = {};
  return function rateLimitMiddleware(ctx, next) {
    var key = (ctx.headers && ctx.headers["x-forwarded-for"]) || ctx.ip || "unknown";
    var now = Date.now();
    if (!counters[key] || now > counters[key].resetTime) {
      counters[key] = { count: 1, resetTime: now + windowMs };
      return next();
    }
    counters[key].count++;
    if (counters[key].count > maxRequests) {
      ctx.status = 429;
      ctx.body = { error: "请求过于频繁", retryAfter: Math.ceil((counters[key].resetTime - now) / 1000) };
      console.log("  ✗ 限流: IP=" + key + " 超过" + maxRequests + "次限制");
      return Promise.resolve();
    }
    console.log("  ✓ 放行: IP=" + key + " 第" + counters[key].count + "次请求");
    return next();
  };
}

var rateLimit = createRateLimitMiddleware(3, 60000);
var app4 = compose([rateLimit, function (ctx, next) { ctx.body = { ok: true }; return next(); }]);

console.log("模拟同一IP连续5次请求（限流: 3次/分钟）:");
var ipCtx = { headers: { "x-forwarded-for": "192.168.1.100" } };
for (var i = 0; i < 5; i++) { app4(Object.assign({}, ipCtx)); }

// ============================================================
// 演示 6：中间件组合实战
// ============================================================
console.log("\\n===== 演示 6：中间件组合实战 =====");

var app5 = compose([
  loggerMiddleware,
  createRateLimitMiddleware(10, 60000),
  authMiddleware,
  function (ctx, next) {
    console.log("  [业务] 处理请求: " + ctx.url);
    ctx.body = { data: "处理结果", user: ctx.user ? ctx.user.name : "匿名" };
    return next();
  },
]);

console.log("--- 完整请求流程 ---");
var fullCtx = { method: "GET", url: "/api/data", headers: { authorization: "Bearer valid-token" } };
app5(fullCtx).then(function () {
  console.log("最终响应:", JSON.stringify(fullCtx.body));
});

// ============================================================
// 演示 7：条件中间件（跳过认证）
// ============================================================
console.log("\\n===== 演示 7：条件中间件 =====");

function unless(paths, middleware) {
  return function (ctx, next) {
    if (paths.indexOf(ctx.url) !== -1) {
      console.log("  [跳过] " + ctx.url + " 不需要认证");
      return next();
    }
    return middleware(ctx, next);
  };
}

var authUnlessPublic = unless(["/api/public", "/api/health"], authMiddleware);

var publicCtx = { url: "/api/public", headers: {} };
compose([authUnlessPublic, function (ctx, next) { ctx.body = "public data"; return next(); }])(publicCtx).then(function () {
  console.log("  状态: " + (publicCtx.status || 200) + ", 响应: " + publicCtx.body);
});

var privateCtx = { url: "/api/admin", headers: {} };
compose([authUnlessPublic, function (ctx, next) { ctx.body = "private data"; return next(); }])(privateCtx).then(function () {
  console.log("  状态: " + (privateCtx.status || 200) + ", 响应: " + JSON.stringify(privateCtx.body));
});

console.log("\\n===== 中间件演示完成 =====");`,
  },
  {
    id: 'node-microservices',
    title: '微服务架构',
    icon: '🏗️',
    group: '实战补充',
    content: `## 微服务架构深入解析

微服务架构是一种将单一应用程序划分为一组小型、自治服务的架构风格。每个服务围绕特定业务能力构建，独立部署、独立扩展。

### 单体 vs 微服务架构对比

| 维度 | 单体架构 | 微服务架构 |
| --- | --- | --- |
| 部署 | 整个应用一起部署 | 每个服务独立部署 |
| 扩展 | 整体扩展 | 按需扩展特定服务 |
| 技术栈 | 统一技术栈 | 每个服务可选不同技术栈 |
| 数据管理 | 单一数据库 | 每个服务有自己的数据库 |
| 故障隔离 | 一个模块崩溃可能拖垮整个应用 | 故障隔离在单个服务内 |
| 开发速度 | 初期快，后期慢 | 初期慢，后期快 |
| 调试 | 相对简单 | 分布式追踪复杂 |
| 运维复杂度 | 低 | 高（需要容器编排、监控等） |

### 微服务拆分原则

1. **按业务领域拆分**（DDD 限界上下文）：用户服务、订单服务、支付服务、商品服务
2. **按团队拆分**：每个团队负责一个或几个微服务
3. **单一职责**：一个服务只做一件事
4. **数据独立性**：每个服务有自己的数据库，不能直接访问其他服务的数据库

### 服务间通信

| 方式 | 协议 | 适用场景 | 特点 |
| --- | --- | --- | --- |
| HTTP REST | HTTP/JSON | 同步请求-响应 | 简单通用，但耦合度高 |
| gRPC | HTTP/2 + Protobuf | 高性能同步调用 | 强类型，二进制，效率高 |
| 消息队列 | AMQP/Kafka | 异步事件驱动 | 解耦，削峰，最终一致性 |

### 服务发现

在微服务架构中，服务实例动态变化（扩缩容、故障恢复），服务发现机制让服务能找到彼此：客户端发现（查询服务注册中心，如 Consul/Etcd）、服务端发现（通过负载均衡器，如 Nginx/K8s Service）。

### API 网关

API 网关是微服务架构的入口，统一处理：路由转发、认证授权、限流、日志、请求聚合、协议转换。常见网关：Kong、Nginx、Traefik、Spring Cloud Gateway。

### 熔断器（Circuit Breaker）

当某个服务不可用时，熔断器防止级联故障：关闭状态（正常请求）、打开状态（直接返回错误，快速失败）、半开状态（尝试少量请求探测服务是否恢复）。

### 分布式追踪

在微服务调用链中追踪一个请求的完整路径。通过 Trace ID（全局唯一）和 Span ID（每个服务段）串联。常用工具：Jaeger、Zipkin、OpenTelemetry。

### 微服务的挑战

1. **分布式事务**：用 Saga 模式或最终一致性代替 ACID 事务
2. **数据一致性**：事件驱动 + 补偿机制
3. **运维复杂度**：需要容器编排（K8s）、CI/CD、监控告警、日志聚合
4. **网络延迟**：服务间调用有网络开销
5. **调试困难**：需要分布式追踪和日志聚合

下面代码模拟微服务注册发现、服务间通信、熔断器、API 网关、分布式追踪。`,
    code: `// ============================================================
// 第六章代码演示：微服务架构模拟
// ============================================================
// 沙箱环境无法启动真正的微服务，因此用对象字面量模拟
// 服务注册发现、HTTP通信、熔断器、API网关、分布式追踪。

var EventEmitter = require("events").EventEmitter;
var crypto = require("crypto");

// ============================================================
// 演示 1：服务注册与发现
// ============================================================
console.log("===== 演示 1：服务注册与发现 =====");

function ServiceRegistry() {
  this.services = new Map();
  this.nextId = 1;
}

ServiceRegistry.prototype.register = function (name, host, port, metadata) {
  var id = this.nextId++;
  var instance = {
    id: id, name: name, host: host, port: port,
    status: "UP", metadata: metadata || {}, registeredAt: new Date().toISOString(),
  };
  if (!this.services.has(name)) this.services.set(name, []);
  this.services.get(name).push(instance);
  console.log("  [注册] " + name + " @ " + host + ":" + port + " (ID: " + id + ")");
  return id;
};

ServiceRegistry.prototype.discover = function (name) {
  var instances = this.services.get(name) || [];
  return instances.filter(function (i) { return i.status === "UP"; });
};

ServiceRegistry.prototype.heartbeat = function (name, id) {
  var instances = this.services.get(name);
  if (!instances) return false;
  var instance = instances.find(function (i) { return i.id === id; });
  if (!instance) return false;
  instance.lastHeartbeat = Date.now();
  return true;
};

ServiceRegistry.prototype.getStats = function () {
  var stats = [];
  this.services.forEach(function (instances, name) {
    stats.push({ 服务名: name, 实例数: instances.length, 在线: instances.filter(function (i) { return i.status === "UP"; }).length });
  });
  return stats;
};

var registry = new ServiceRegistry();
registry.register("user-service", "10.0.0.1", 3001, { version: "1.2.0" });
registry.register("user-service", "10.0.0.2", 3001, { version: "1.2.0" });
registry.register("order-service", "10.0.0.3", 3002, { version: "2.0.1" });
registry.register("order-service", "10.0.0.4", 3002, { version: "2.0.1" });
registry.register("payment-service", "10.0.0.5", 3003, { version: "1.0.0" });

console.log("\\n服务注册表:");
console.table(registry.getStats());

console.log("\\n发现 user-service:");
registry.discover("user-service").forEach(function (i) {
  console.log("  " + i.host + ":" + i.port + " v" + i.metadata.version);
});

console.log("\\n健康检查:");
registry.heartbeat("user-service", 1);
registry.heartbeat("user-service", 2);
console.log("  实例1心跳: " + (registry.discover("user-service")[0].lastHeartbeat ? "✓" : "✗"));
console.log("  实例2心跳: " + (registry.discover("user-service")[1].lastHeartbeat ? "✓" : "✗"));

// ============================================================
// 演示 2：服务间 HTTP 通信模拟
// ============================================================
console.log("\\n===== 演示 2：服务间 HTTP 通信 =====");

var microservices = {
  "user-service": {
    "GET /users/1": { id: 1, name: "张三", email: "zhangsan@example.com" },
    "GET /users/2": { id: 2, name: "李四", email: "lisi@example.com" },
  },
  "order-service": {
    "GET /orders/101": { id: 101, userId: 1, total: 299.00, status: "paid" },
    "GET /orders/102": { id: 102, userId: 1, total: 159.00, status: "shipped" },
    "GET /orders/103": { id: 103, userId: 2, total: 499.00, status: "pending" },
  },
  "payment-service": {
    "POST /payments": function (data) { return { paymentId: "pay-" + Date.now(), amount: data.amount, status: "success" }; },
  },
};

function serviceCall(serviceName, method, path, body) {
  var service = microservices[serviceName];
  if (!service) return { status: 503, error: "服务不可用: " + serviceName };
  var key = method + " " + path;
  var handler = service[key];
  if (!handler) return { status: 404, error: "端点不存在: " + key };
  var result = typeof handler === "function" ? handler(body) : handler;
  return { status: 200, data: result };
}

console.log("--- API 聚合：获取用户详情 + 订单列表 ---");

function aggregateUserOrders(userId) {
  console.log("  1. 调用 user-service...");
  var userResp = serviceCall("user-service", "GET", "/users/" + userId);
  if (userResp.status !== 200) return userResp;

  console.log("  2. 调用 order-service...");
  var orders = [];
  for (var i = 101; i <= 103; i++) {
    var orderResp = serviceCall("order-service", "GET", "/orders/" + i);
    if (orderResp.status === 200 && orderResp.data.userId === userId) {
      orders.push(orderResp.data);
    }
  }
  return { status: 200, data: { user: userResp.data, orders: orders, orderCount: orders.length } };
}

var result = aggregateUserOrders(1);
console.log("  聚合结果:", JSON.stringify(result.data, null, 2));

console.log("\\n--- 支付流程 ---");
var paymentResult = serviceCall("payment-service", "POST", "/payments", { amount: 299.00, orderId: 101 });
console.log("  支付结果:", JSON.stringify(paymentResult.data));

// ============================================================
// 演示 3：熔断器（Circuit Breaker）
// ============================================================
console.log("\\n===== 演示 3：熔断器 =====");

function CircuitBreaker(fn, options) {
  options = options || {};
  this.fn = fn;
  this.failureThreshold = options.failureThreshold || 3;
  this.timeout = options.timeout || 5000;
  this.state = "CLOSED";
  this.failureCount = 0;
  this.lastFailureTime = 0;
  this.successCount = 0;
  this.halfOpenMaxSuccess = options.halfOpenMaxSuccess || 2;
}

CircuitBreaker.prototype.call = function () {
  var self = this;
  var args = arguments;

  if (this.state === "OPEN") {
    if (Date.now() - this.lastFailureTime > this.timeout) {
      this.state = "HALF_OPEN";
      this.successCount = 0;
      console.log("    [熔断器] OPEN → HALF_OPEN，尝试探测...");
    } else {
      return Promise.reject(new Error("熔断器已打开，服务不可用"));
    }
  }

  return Promise.resolve()
    .then(function () { return self.fn.apply(null, args); })
    .then(function (result) {
      if (self.state === "HALF_OPEN") {
        self.successCount++;
        if (self.successCount >= self.halfOpenMaxSuccess) {
          self.state = "CLOSED";
          self.failureCount = 0;
          console.log("    [熔断器] HALF_OPEN → CLOSED，服务已恢复");
        }
      } else {
        self.failureCount = 0;
      }
      return result;
    })
    .catch(function (err) {
      self.failureCount++;
      self.lastFailureTime = Date.now();
      if (self.state === "HALF_OPEN" || self.failureCount >= self.failureThreshold) {
        self.state = "OPEN";
        console.log("    [熔断器] → OPEN，失败次数: " + self.failureCount);
      }
      throw err;
    });
};

var callCount = 0;
function unstableService() {
  callCount++;
  if (callCount <= 3) return Promise.reject(new Error("服务超时"));
  return Promise.resolve("服务正常响应 (第" + callCount + "次调用)");
}

var breaker = new CircuitBreaker(unstableService, { failureThreshold: 3, timeout: 1000, halfOpenMaxSuccess: 2 });

console.log("模拟不稳定的服务调用（熔断器保护）:");
function simulateCall(n) {
  if (n > 10) return;
  breaker.call().then(
    function (r) { console.log("  ✓ 第" + n + "次: " + r); },
    function (e) { console.log("  ✗ 第" + n + "次: " + e.message); }
  );
  setTimeout(function () { simulateCall(n + 1); }, 200);
}
simulateCall(1);

// ============================================================
// 演示 4：API 网关路由
// ============================================================
console.log("\\n===== 演示 4：API 网关路由 =====");

function APIGateway() {
  this.routes = [];
}

APIGateway.prototype.route = function (method, pathPattern, serviceName, pathTransform) {
  this.routes.push({
    method: method,
    pattern: new RegExp("^" + pathPattern.replace(/:([^/]+)/g, "([^/]+)") + "\$"),
    paramNames: (pathPattern.match(/:([^/]+)/g) || []).map(function (p) { return p.slice(1); }),
    serviceName: serviceName,
    pathTransform: pathTransform,
  });
};

APIGateway.prototype.handle = function (method, path, body) {
  console.log("  [网关] " + method + " " + path);
  for (var i = 0; i < this.routes.length; i++) {
    var route = this.routes[i];
    if (route.method !== method && route.method !== "ALL") continue;
    var match = path.match(route.pattern);
    if (!match) continue;

    var params = {};
    for (var j = 0; j < route.paramNames.length; j++) {
      params[route.paramNames[j]] = match[j + 1];
    }

    var servicePath = route.pathTransform ? route.pathTransform(params) : path.replace(/^\\/api/, "");
    console.log("    → 路由到: " + route.serviceName + " " + servicePath);

    var resp = serviceCall(route.serviceName, method, servicePath, body);
    resp.gateway = {
      routedTo: route.serviceName,
      timestamp: new Date().toISOString(),
      traceId: "trace-" + Math.random().toString(36).slice(2, 10),
    };
    return resp;
  }
  return { status: 404, error: "网关: 未找到匹配路由" };
};

var gateway = new APIGateway();
gateway.route("GET", "/api/users/:id", "user-service", function (p) { return "/users/" + p.id; });
gateway.route("GET", "/api/orders/:id", "order-service", function (p) { return "/orders/" + p.id; });
gateway.route("POST", "/api/payments", "payment-service", function () { return "/payments"; });

console.log("API 网关路由测试:");
var gwCalls = [
  { method: "GET", path: "/api/users/1" },
  { method: "GET", path: "/api/orders/101" },
  { method: "POST", path: "/api/payments", body: { amount: 199 } },
  { method: "GET", path: "/api/unknown" },
];
gwCalls.forEach(function (call) {
  var resp = gateway.handle(call.method, call.path, call.body);
  console.log("  响应: HTTP " + resp.status + (resp.data ? " - " + JSON.stringify(resp.data).slice(0, 60) : " - " + JSON.stringify(resp.error)));
  if (resp.gateway) console.log("    追踪ID: " + resp.gateway.traceId + " → " + resp.gateway.routedTo);
});

// ============================================================
// 演示 5：分布式追踪
// ============================================================
console.log("\\n===== 演示 5：分布式追踪 =====");

function TraceContext(traceId) {
  this.traceId = traceId || ("trace-" + Math.random().toString(36).slice(2, 10));
  this.spans = [];
  this.spanIdCounter = 0;
}

TraceContext.prototype.startSpan = function (serviceName, operation) {
  var spanId = this.spanIdCounter++;
  var span = {
    spanId: spanId, parentSpanId: spanId > 0 ? spanId - 1 : null,
    service: serviceName, operation: operation,
    startTime: Date.now(), endTime: null, duration: null,
  };
  this.spans.push(span);
  console.log("  [追踪:" + this.traceId + "] 开始 Span#" + spanId + " " + serviceName + ":" + operation);
  return span;
};

TraceContext.prototype.endSpan = function (span) {
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  console.log("  [追踪:" + this.traceId + "] 结束 Span#" + span.spanId + " " + span.service + ":" + span.operation + " (" + span.duration + "ms)");
};

TraceContext.prototype.getTrace = function () {
  return {
    traceId: this.traceId, totalSpans: this.spans.length,
    totalDuration: this.spans.reduce(function (s, sp) { return s + (sp.duration || 0); }, 0),
    spans: this.spans.map(function (sp) {
      return { id: sp.spanId, parent: sp.parentSpanId, service: sp.service, operation: sp.operation, duration: sp.duration + "ms" };
    }),
  };
};

var trace = new TraceContext();
console.log("模拟请求: GET /api/user-orders/1");

var span1 = trace.startSpan("api-gateway", "路由请求");
setTimeout(function () {
  trace.endSpan(span1);
  var span2 = trace.startSpan("user-service", "查询用户");
  setTimeout(function () {
    trace.endSpan(span2);
    var span3 = trace.startSpan("order-service", "查询订单");
    setTimeout(function () {
      trace.endSpan(span3);
      var span4 = trace.startSpan("payment-service", "查询支付状态");
      setTimeout(function () {
        trace.endSpan(span4);
        console.log("\\n完整追踪链路:");
        console.table(trace.getTrace().spans);
        console.log("总耗时: " + trace.getTrace().totalDuration + "ms");
      }, 50);
    }, 80);
  }, 60);
}, 30);

// ============================================================
// 演示 6：微服务架构总览
// ============================================================
console.log("\\n===== 演示 6：微服务架构总览 =====");

var architecture = {
  "API网关": { 职责: "路由、认证、限流、聚合", 技术: "Kong / Nginx / Traefik" },
  "服务注册中心": { 职责: "服务注册与发现、健康检查", 技术: "Consul / Etcd / Eureka" },
  "用户服务": { 职责: "用户CRUD、认证", 数据库: "PostgreSQL", 端口: 3001 },
  "订单服务": { 职责: "订单管理", 数据库: "MySQL", 端口: 3002 },
  "支付服务": { 职责: "支付处理", 数据库: "MongoDB", 端口: 3003 },
  "消息队列": { 职责: "异步通信、事件驱动", 技术: "RabbitMQ / Kafka" },
  "配置中心": { 职责: "集中配置管理", 技术: "Consul KV / Apollo" },
  "分布式追踪": { 职责: "请求链路追踪", 技术: "Jaeger / Zipkin" },
  "日志聚合": { 职责: "集中日志收集", 技术: "ELK / Loki" },
  "容器编排": { 职责: "部署、扩缩容、服务发现", 技术: "Kubernetes / Docker Swarm" },
};

console.log("微服务架构组件:");
console.table(Object.keys(architecture).map(function (key) {
  return { 组件: key, 职责: architecture[key].职责, 技术: architecture[key].技术 || architecture[key].数据库 || "-" };
}));

console.log("\\n===== 微服务架构演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ['基础入门', '核心模块', '异步编程', '进阶实战', '工程化', '实战补充'];
