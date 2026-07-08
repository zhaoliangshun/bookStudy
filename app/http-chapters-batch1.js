// =============================================================
// HTTP 通信教程 —— 第一批章节
// -------------------------------------------------------------
// HTTP 基础（1-4章）
//   第 1 章：HTTP 是什么？——协议简介与发展历史
//   第 2 章：HTTP 报文结构——请求与响应详解
//   第 3 章：HTTP 方法——GET/POST/PUT/DELETE/PATCH 等
//   第 4 章：HTTP 状态码——从 1xx 到 5xx
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：HTTP 是什么？——协议简介与发展历史
  // ============================================================
  {
    id: "http-01",
    group: "HTTP 基础",
    icon: "🌐",
    title: "HTTP 是什么？——协议简介与发展历史",
    content: `## 一、HTTP 是什么？

**HTTP**（HyperText Transfer Protocol，超文本传输协议）是互联网上使用最广泛的应用层协议。每次你打开浏览器输入网址、每次手机 App 从服务器拉取数据、每次前端调用后端 API，背后几乎都是 HTTP 在工作。

简单来说，HTTP 定义了**客户端（浏览器/App）和服务器之间如何交换数据**。它规定了一组规则：客户端该怎么发请求、服务器该怎么回响应、数据该用什么格式、出错时该返回什么代码。

### 1.1 请求-响应模型

HTTP 采用经典的**请求-响应（Request-Response）模型**：

\`\`\`
┌─────────┐   HTTP 请求（Request）   ┌─────────┐
│  客户端  │ ──────────────────────▶ │  服务器  │
│ 浏览器   │ ◀────────────────────── │ Web服务  │
│  App    │   HTTP 响应（Response）  │ API服务  │
└─────────┘                          └─────────┘
\`\`\`

这个模型有几个关键特点：

1. **客户端发起，服务器响应**：服务器不会主动给客户端推消息（HTTP/1.x 时代），所有通信都由客户端发起请求开始。服务器只是被动地等待请求、处理请求、返回响应。
2. **一问一答**：一次请求对应一次响应，不会出现"问一个问题得到三个回答"的情况。
3. **无方向限制**：虽然通常是浏览器→服务器，但服务器之间也可以互发 HTTP 请求（微服务架构中常见）。

### 1.2 HTTP 在网络栈中的位置

HTTP 是**应用层协议**，它自己不管数据怎么在网络中传输，而是把这件事交给传输层：

\`\`\`
应用层：    HTTP / HTTPS / WebSocket
              ↓（HTTP/1、HTTP/2 基于 TCP）
传输层：    TCP（可靠传输）/ UDP（HTTP/3 基于 QUIC）
网络层：    IP（寻址和路由）
链路层：    以太网 / Wi-Fi / 4G/5G
\`\`\`

- **HTTP/1.x 和 HTTP/2** 基于 **TCP**：需要先三次握手建立连接，保证数据可靠有序到达。
- **HTTP/3** 基于 **QUIC**（而 QUIC 基于 **UDP**）：避免队头阻塞，连接建立更快。
- HTTP 默认端口 **80**，HTTPS 默认端口 **443**。

---

## 二、HTTP 发展历史

HTTP 不是一天设计出来的，它经历了 30 多年的演进。理解每个版本解决了什么问题，才能真正理解 HTTP 为什么是现在这个样子。

### 2.1 HTTP/0.9（1991 年）——万物起源

1991 年，Tim Berners-Lee 在 CERN（欧洲核子研究中心）发明万维网时提出了最原始的 HTTP。它极其简单：

- **只有 GET 方法**：只能获取资源，不能提交数据。
- **没有请求头**：请求只有一行 \`GET /index.html\`。
- **没有状态码**：响应直接返回 HTML 内容，没有状态行、没有响应头。
- **没有 Content-Type**：默认只能传 HTML，不能传图片、JSON。

一个完整的 HTTP/0.9 请求和响应：

\`\`\`text
请求：  GET /index.html

响应：  <html>...HTML 内容...</html>
        （服务器关闭连接表示结束）
\`\`\`

### 2.2 HTTP/1.0（1996 年，RFC 1945）——走向实用

HTTP/0.9 太简陋了，于是 1996 年发布了 HTTP/1.0，主要改进：

- **引入请求头和响应头**：可以传 Content-Type、User-Agent 等元信息。
- **引入状态码**：响应有了状态行 \`HTTP/1.0 200 OK\`。
- **支持多种数据类型**：通过 Content-Type 可以传图片、视频、JSON（MIME 机制）。
- **新增方法**：POST、HEAD。
- **默认短连接**：每次请求都新建 TCP 连接，响应完毕就断开。

问题：每次请求都要重新 TCP 三次握手，性能浪费严重。一个网页有 20 张图片，就要建 20 次 TCP 连接。

### 2.3 HTTP/1.1（1997 年，RFC 2616）——统治至今

HTTP/1.1 是使用最广泛的版本，也是面试重点。核心改进：

1. **持久连接（Keep-Alive）**：TCP 连接默认不关闭，多个请求可以复用同一个连接。这解决了 HTTP/1.0 的最大性能痛点。
2. **管道化（Pipelining）**：客户端可以连续发送多个请求，不用等上一个响应。但服务器仍需按序响应，实际收益有限。
3. **Host 头部强制要求**：支持一台服务器通过虚拟主机托管多个域名（\`Host: www.example.com\`）。
4. **分块传输编码（Chunked Transfer Encoding）**：服务器可以在不知道总长度时分块发送数据（流式响应）。
5. **缓存控制**：引入 Cache-Control、ETag、If-None-Match 等机制。
6. **新增方法**：OPTIONS、PUT、DELETE、TRACE、CONNECT。
7. **范围请求**：支持 Range 请求头，可以断点续传（\`Range: bytes=0-1023\`）。

HTTP/1.1 的主要问题是**队头阻塞（Head-of-Line Blocking）**：虽然连接可以复用，但同一连接上的请求必须按序响应。如果第一个请求很慢，后面的请求都要排队等。

### 2.4 HTTP/2（2015 年，RFC 7540）——性能飞跃

Google 提出的 SPDY 协议催生了 HTTP/2，主要解决 HTTP/1.1 的性能问题：

1. **二进制分帧（Binary Framing）**：不再用文本格式，改为二进制帧。传输更高效、解析更可靠。
2. **多路复用（Multiplexing）**：一个 TCP 连接上可以并行传输多个请求/响应，彻底解决 HTTP 层的队头阻塞。
3. **头部压缩（HPACK）**：HTTP/1.1 每次请求都重复发送大量头部（Cookie、User-Agent），HTTP/2 用 HPACK 算法压缩头部，大幅减少冗余。
4. **服务器推送（Server Push）**：服务器可以主动把资源推给客户端（比如客户端请求 HTML 时，服务器顺便推送 CSS、JS）。
5. **流优先级**：可以给不同的请求设置优先级，重要资源先传。

注意：HTTP/2 解决了 HTTP 层的队头阻塞，但**没有解决 TCP 层的队头阻塞**——TCP 包丢失时，整个连接都要等待重传。

### 2.5 HTTP/3（2022 年，RFC 9114）——告别 TCP

HTTP/3 把传输层从 TCP 换成了 **QUIC**（基于 UDP）：

1. **无 TCP 队头阻塞**：QUIC 在 UDP 上自己实现可靠传输，一个流丢包不影响其他流。
2. **更快的连接建立**：QUIC 把传输层握手和 TLS 握手合并，1-RTT 甚至 0-RTT 就能建立连接（TCP + TLS 通常需要 3 个 RTT）。
3. **连接迁移**：手机从 Wi-Fi 切到 4G 时，TCP 连接会断开重建，而 QUIC 用 Connection ID 标识连接，IP 变了连接不断。
4. **内置加密**：QUIC 强制 TLS 1.3，没有不加密的 HTTP/3。

\`\`\`
版本    年份    传输层    核心改进
0.9     1991    TCP      最简原型，只有 GET
1.0     1996    TCP      头部、状态码、多类型
1.1     1997    TCP      持久连接、Host、缓存、分块
2.0     2015    TCP      二进制、多路复用、头部压缩
3.0     2022    QUIC     无队头阻塞、0-RTT、连接迁移
\`\`\`

---

## 三、HTTP 的核心特性

### 3.1 无状态（Stateless）

HTTP 协议本身是**无状态**的——服务器不会记住"这个客户端之前来过吗"、"上次请求做了什么"。每个请求都是独立的，服务器处理完就忘了。

这带来了一个现实问题：用户登录后，浏览下一个页面时服务器怎么知道他登录了？解决方案是 **Cookie + Session**：服务器在响应里塞一个 Cookie，客户端下次请求带上这个 Cookie，服务器就能识别用户。后来又有了 **JWT（JSON Web Token）** 把状态编码在 Token 里。

### 3.2 文本协议（HTTP/1.x）

HTTP/1.x 是纯文本协议——请求和响应都是可读的 ASCII 文本。好处是**易调试**（用 telnet/curl 就能手动发请求）、**易理解**。坏处是**解析慢、体积大**。HTTP/2 改为二进制格式解决了这个问题。

### 3.3 可扩展（Extensible）

HTTP 通过**头部（Headers）**实现极强的扩展性。任何人都可以自定义头部（加个 \`X-My-Header: xxx\`），不需要修改协议本身。常见扩展机制：

- **Content-Type**：协商数据格式（JSON、XML、表单、图片）。
- **Authorization**：扩展认证方式（Basic、Bearer、JWT）。
- **Accept**：内容协商，客户端告诉服务器"我能接受什么格式"。
- **Cache-Control**：灵活的缓存策略。

### 3.4 应用层、基于 TCP/UDP

HTTP 不关心数据怎么在网络中传输，只定义了"客户端和服务器交换什么数据"。这使得 HTTP 可以跑在任何可靠的传输层上（TCP、QUIC），也可以通过中间件做各种代理、缓存、负载均衡。

---

## 四、一个 HTTP 请求的完整旅程

当你在浏览器输入 \`http://www.example.com\` 并回车：

1. **DNS 解析**：把域名解析成 IP 地址（如 93.184.216.34）。
2. **建立 TCP 连接**：与服务器 IP 的 80 端口进行三次握手。
3. **发送 HTTP 请求**：浏览器构造请求报文发送给服务器。
4. **服务器处理**：服务器接收请求、路由、执行业务逻辑。
5. **返回 HTTP 响应**：服务器构造响应报文返回。
6. **浏览器渲染**：解析 HTML、加载 CSS/JS/图片、渲染页面。
7. **关闭/复用连接**：根据 Keep-Alive 决定。

这只是一个最简化的描述，实际过程远比这复杂（HTTPS 还有 TLS 握手、有重定向、有缓存判断等）。后面章节会逐步展开每个环节。

---

下面运行一个 demo，模拟不同 HTTP 版本的特性差异，直观感受 30 年的演进。`,
    code: `// ============================================
// 第一章 Demo：模拟 HTTP 各版本的特性差异
// --------------------------------------------
// 本 demo 不使用 http 模块（沙箱不可用），
// 而是用纯 JavaScript 对象模拟各版本行为，
// 直观展示 HTTP/0.9 → 3.0 的演进。
// ============================================

const assert = require('assert');

// --------------------------------------------
// 1. 定义各版本的特性描述
// --------------------------------------------
const httpVersions = {
  '0.9': {
    year: 1991,
    transport: 'TCP',
    methods: ['GET'],
    hasHeaders: false,        // 没有头部
    hasStatusCodes: false,    // 没有状态码
    connection: 'short',      // 短连接，每次请求新建 TCP
    multiplexing: false,      // 无多路复用
    headerCompression: false, // 无头部压缩
    features: ['只有 GET 方法', '响应直接是 HTML，无状态行无头部', '一个请求一个 TCP 连接']
  },
  '1.0': {
    year: 1996,
    transport: 'TCP',
    methods: ['GET', 'POST', 'HEAD'],
    hasHeaders: true,
    hasStatusCodes: true,
    connection: 'short',      // 默认短连接（可通过 Connection: keep-alive 复用）
    multiplexing: false,
    headerCompression: false,
    features: ['引入请求头和响应头', '引入状态码', '支持多种 Content-Type', '默认短连接']
  },
  '1.1': {
    year: 1997,
    transport: 'TCP',
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'],
    hasHeaders: true,
    hasStatusCodes: true,
    connection: 'keep-alive', // 默认持久连接
    multiplexing: false,      // 有管道化但服务器仍需按序响应
    headerCompression: false,
    features: ['持久连接 Keep-Alive', 'Host 头部强制', '分块传输编码', '缓存控制', '范围请求']
  },
  '2.0': {
    year: 2015,
    transport: 'TCP',
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'],
    hasHeaders: true,
    hasStatusCodes: true,
    connection: 'keep-alive',
    multiplexing: true,       // 多路复用，一个连接并行多个请求
    headerCompression: true,  // HPACK 压缩
    features: ['二进制分帧', '多路复用', 'HPACK 头部压缩', '服务器推送', '流优先级']
  },
  '3.0': {
    year: 2022,
    transport: 'QUIC (UDP)',  // 基于 QUIC，底层是 UDP
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'],
    hasHeaders: true,
    hasStatusCodes: true,
    connection: 'keep-alive',
    multiplexing: true,
    headerCompression: true,  // QPACK 压缩
    features: ['基于 QUIC (UDP)', '无 TCP 队头阻塞', '0-RTT 连接建立', '连接迁移', '强制 TLS 1.3']
  }
};

// --------------------------------------------
// 2. 打印各版本概览表
// --------------------------------------------
console.log('=== HTTP 版本演进概览 ===');
console.log('');
console.log('版本    年份    传输层         方法数  多路复用  头部压缩');
console.log('------------------------------------------------------');
Object.keys(httpVersions).forEach(function (ver) {
  var v = httpVersions[ver];
  console.log(
    ver.padEnd(7) + ' ' +
    String(v.year).padEnd(7) + ' ' +
    v.transport.padEnd(14) + ' ' +
    String(v.methods.length).padEnd(7) + ' ' +
    String(v.multiplexing).padEnd(8) + ' ' +
    String(v.headerCompression)
  );
});

// --------------------------------------------
// 3. 模拟同一任务在不同版本下的行为
// --------------------------------------------
// 任务：从同一服务器获取 3 个资源（index.html、style.css、app.js）
// 看看不同版本需要几次 TCP 连接、能否并行
console.log('');
console.log('=== 模拟：获取 3 个资源在各版本下的行为 ===');
console.log('');

var resources = ['index.html', 'style.css', 'app.js'];

Object.keys(httpVersions).forEach(function (ver) {
  var v = httpVersions[ver];
  console.log('--- HTTP/' + ver + ' ---');

  // 计算需要建立的 TCP 连接数
  var tcpConnections;
  if (v.connection === 'short') {
    // 短连接：每个资源都要新建 TCP 连接
    tcpConnections = resources.length;
  } else {
    // 持久连接：复用一个 TCP 连接
    tcpConnections = 1;
  }

  // 计算请求是否可以并行
  var parallel = v.multiplexing;
  var requestMode;
  if (parallel) {
    requestMode = '并行发送（多路复用）';
  } else if (ver === '1.1') {
    requestMode = '串行发送（管道化存在但服务器按序响应）';
  } else {
    requestMode = '串行发送（一个一个来）';
  }

  console.log('  TCP 连接数: ' + tcpConnections + ' 次');
  console.log('  请求方式:   ' + requestMode);

  // 模拟请求过程
  if (parallel) {
    console.log('  时间线: [req1, req2, req3] 同时发出 → [resp1, resp2, resp3] 几乎同时返回');
  } else {
    console.log('  时间线: req1 → resp1 → req2 → resp2 → req3 → resp3（串行）');
  }

  // 列出该版本的特性
  console.log('  特性:');
  v.features.forEach(function (f) {
    console.log('    • ' + f);
  });
  console.log('');
});

// --------------------------------------------
// 4. 模拟 HTTP/1.1 队头阻塞 vs HTTP/2 多路复用
// --------------------------------------------
console.log('=== 队头阻塞对比模拟 ===');
console.log('');

// 模拟 HTTP/1.1：同一连接上请求必须按序响应
function simulateHttp1() {
  var requests = [
    { name: '请求A（慢，需要 500ms）', time: 500 },
    { name: '请求B（快，需要 50ms）', time: 50 },
    { name: '请求C（快，需要 50ms）', time: 50 }
  ];
  var totalTime = 0;
  console.log('HTTP/1.1 持久连接（队头阻塞）:');
  requests.forEach(function (req) {
    totalTime += req.time;
    console.log('  ' + req.name + ' → 在 ' + totalTime + 'ms 时完成');
  });
  console.log('  总耗时: ' + totalTime + 'ms');
  console.log('  问题: 请求B和C明明很快，却被A堵在后面');
  return totalTime;
}

// 模拟 HTTP/2：多路复用，请求可以并行响应
function simulateHttp2() {
  var requests = [
    { name: '请求A（慢，需要 500ms）', time: 500 },
    { name: '请求B（快，需要 50ms）', time: 50 },
    { name: '请求C（快，需要 50ms）', time: 50 }
  ];
  // 并行发送，总耗时取决于最慢的那个
  var maxTime = Math.max.apply(null, requests.map(function (r) { return r.time; }));
  console.log('HTTP/2 多路复用:');
  requests.forEach(function (req) {
    console.log('  ' + req.name + ' → 在 ' + req.time + 'ms 时完成');
  });
  console.log('  总耗时: ' + maxTime + 'ms（取最慢请求）');
  console.log('  优势: B 和 C 不用等 A，各自完成后立即返回');
  return maxTime;
}

var t1 = simulateHttp1();
console.log('');
var t2 = simulateHttp2();
console.log('');
console.log('性能提升: ' + t1 + 'ms → ' + t2 + 'ms，快了 ' + Math.round((1 - t2 / t1) * 100) + '%');
console.log('');

// --------------------------------------------
// 5. 验证：HTTP/0.9 的极简性
// --------------------------------------------
console.log('=== HTTP/0.9 极简请求模拟 ===');
console.log('');

// HTTP/0.9 请求只有一行，响应只有 HTML
var v09Request = 'GET /index.html';
var v09Response = '<html><body><h1>Hello World</h1></body></html>';

console.log('请求报文（完整）:');
console.log('  ' + v09Request);
console.log('  （没有请求头，没有 Host，就这一行）');
console.log('');
console.log('响应报文（完整）:');
console.log('  ' + v09Response);
console.log('  （没有状态行 HTTP/0.9 200 OK，没有 Content-Type，直接是 HTML）');
console.log('');

// 对比 HTTP/1.1 的等价请求
console.log('对比 HTTP/1.1 的等价请求:');
var v11Request = [
  'GET /index.html HTTP/1.1',
  'Host: www.example.com',
  'User-Agent: Mozilla/5.0',
  'Accept: text/html',
  'Connection: keep-alive',
  ''
].join('\\r\\n');
console.log(v11Request);
console.log('（多了状态行版本号、多个请求头、Host 是强制的）');
console.log('');

// --------------------------------------------
// 6. 总结
// --------------------------------------------
console.log('=== 总结 ===');
console.log('• HTTP/0.9：极简原型，只能 GET HTML');
console.log('• HTTP/1.0：加入头部、状态码，支持多类型数据');
console.log('• HTTP/1.1：持久连接、Host、缓存，统治至今');
console.log('• HTTP/2.0：二进制、多路复用、头部压缩，性能飞跃');
console.log('• HTTP/3.0：基于 QUIC，告别 TCP 队头阻塞，0-RTT');
console.log('');
console.log('💡 思考：为什么 HTTP/2 已经有了多路复用，还会出现 HTTP/3？');
console.log('   提示：HTTP/2 解决了 HTTP 层的队头阻塞，但 TCP 层的呢？');
`
  },

  // ============================================================
  // 第二章：HTTP 报文结构——请求与响应详解
  // ============================================================
  {
    id: "http-02",
    group: "HTTP 基础",
    icon: "📄",
    title: "HTTP 报文结构——请求与响应详解",
    content: `## 一、HTTP 报文的整体结构

HTTP 报文是 HTTP 通信的基本单位，分为**请求报文**（客户端→服务器）和**响应报文**（服务器→客户端）。两者的结构非常相似，都由三部分组成：

\`\`\`
HTTP 报文 = 起始行（start line）
          + 头部字段（headers）
          + 空行（CRLF）
          + 可选的消息体（body）
\`\`\`

关键细节：**头部和消息体之间必须有一个空行（即一个 CRLF）**。这个空行是 HTTP 解析的重要标志——它告诉解析器"头部结束了，后面是 body"。漏掉这个空行会导致解析失败。

\`\`\`
请求报文                          响应报文
┌──────────────────────┐         ┌──────────────────────┐
│ 请求行 (Request Line) │         │ 状态行 (Status Line)  │
├──────────────────────┤         ├──────────────────────┤
│ 请求头1: 值1          │         │ 响应头1: 值1          │
│ 请求头2: 值2          │         │ 响应头2: 值2          │
│ ...                  │         │ ...                  │
├──────────────────────┤         ├──────────────────────┤
│ （空行 CRLF）         │         │ （空行 CRLF）         │
├──────────────────────┤         ├──────────────────────┤
│ 请求体 (Body)         │         │ 响应体 (Body)         │
└──────────────────────┘         └──────────────────────┘
\`\`\`

---

## 二、HTTP 请求报文详解

### 2.1 请求行（Request Line）

请求行是请求报文的第一行，格式：

\`\`\`
方法  请求URI  HTTP版本
GET   /api/users?id=1  HTTP/1.1
\`\`\`

三个部分用空格分隔：

1. **方法（Method）**：\`GET\`、\`POST\`、\`PUT\`、\`DELETE\` 等，表示对资源的操作意图。
2. **请求 URI**：资源的路径和查询参数，如 \`/api/users?id=1\`。注意这里是不含协议和域名的路径部分（完整 URL 在代理场景下才会出现）。
3. **HTTP 版本**：\`HTTP/1.0\`、\`HTTP/1.1\`、\`HTTP/2.0\`。

### 2.2 请求头（Request Headers）

请求头是 \`名字: 值\` 形式的键值对，每行一个，提供请求的元信息。常见的请求头：

| 头部 | 作用 | 示例 |
|------|------|------|
| \`Host\` | 目标主机名（HTTP/1.1 强制） | \`Host: api.example.com\` |
| \`User-Agent\` | 客户端标识 | \`User-Agent: Mozilla/5.0\` |
| \`Accept\` | 期望的响应类型 | \`Accept: application/json\` |
| \`Content-Type\` | 请求体的数据类型 | \`Content-Type: application/json\` |
| \`Content-Length\` | 请求体的字节长度 | \`Content-Length: 128\` |
| \`Authorization\` | 认证凭证 | \`Authorization: Bearer token123\` |
| \`Cookie\` | 携带的 Cookie | \`Cookie: sessionId=abc123\` |
| \`Connection\` | 连接控制 | \`Connection: keep-alive\` |
| \`Accept-Encoding\` | 可接受的压缩编码 | \`Accept-Encoding: gzip, br\` |
| \`Referer\` | 来源页面 | \`Referer: https://example.com/\` |

### 2.3 请求体（Body）

请求体是可选的，通常 \`GET\`、\`HEAD\`、\`DELETE\` 请求没有 body，而 \`POST\`、\`PUT\`、\`PATCH\` 请求带有 body。常见的 body 格式：

- **表单格式**：\`Content-Type: application/x-www-form-urlencoded\`，body 是 \`name=alice&age=25\`。
- **JSON 格式**：\`Content-Type: application/json\`，body 是 \`{"name":"alice","age":25}\`。
- **文件上传**：\`Content-Type: multipart/form-data\`，body 是分段的二进制数据。

### 2.4 完整的请求报文示例

\`\`\`http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 42
Authorization: Bearer eyJhbGciOi...
User-Agent: Mozilla/5.0

{"name":"alice","age":25,"role":"admin"}
\`\`\`

---

## 三、HTTP 响应报文详解

### 3.1 状态行（Status Line）

状态行是响应报文的第一行，格式：

\`\`\`
HTTP版本  状态码  原因短语
HTTP/1.1  200     OK
\`\`\`

1. **HTTP 版本**：\`HTTP/1.1\`。
2. **状态码（Status Code）**：三位数字，如 \`200\`、\`404\`、\`500\`，表示请求的结果。
3. **原因短语（Reason Phrase）**：状态码的文字描述，如 \`OK\`、\`Not Found\`，仅供人看，程序应基于状态码判断。

### 3.2 响应头（Response Headers）

常见的响应头：

| 头部 | 作用 | 示例 |
|------|------|------|
| \`Content-Type\` | 响应体的数据类型 | \`Content-Type: text/html; charset=utf-8\` |
| \`Content-Length\` | 响应体的字节长度 | \`Content-Length: 2048\` |
| \`Set-Cookie\` | 设置 Cookie | \`Set-Cookie: sid=abc; Path=/; HttpOnly\` |
| \`Cache-Control\` | 缓存策略 | \`Cache-Control: max-age=3600\` |
| \`Location\` | 重定向目标 URL | \`Location: https://example.com/new\` |
| \`Server\` | 服务器软件标识 | \`Server: nginx/1.21\` |
| \`Access-Control-Allow-Origin\` | CORS 跨域 | \`Access-Control-Allow-Origin: *\` |
| \`Transfer-Encoding\` | 传输编码 | \`Transfer-Encoding: chunked\` |

### 3.3 响应体（Body）

响应体是服务器返回的数据，可以是 HTML 页面、JSON 数据、图片、文件等。由 \`Content-Type\` 指明格式。

### 3.4 完整的响应报文示例

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 38
Server: nginx/1.21
Cache-Control: no-cache

{"id":1,"name":"alice","role":"admin"}
\`\`\`

---

## 四、关键概念深入

### 4.1 空行（CRLF）的重要性

HTTP 报文中，头部和 body 之间的空行是一个 **CRLF**（即 \`\\r\\n\`）。解析器通过找到第一个空行来区分头部和 body：

\`\`\`
GET / HTTP/1.1\\r\\n      ← 请求行
Host: example.com\\r\\n    ← 头部
User-Agent: x\\r\\n        ← 头部
\\r\\n                     ← 空行（标志着头部结束）
body 内容...              ← 消息体
\`\`\`

如果漏掉空行，服务器会认为后面的 body 也是头部的一部分，导致解析错误。

### 4.2 Content-Length 与分块传输

服务器返回 body 时，客户端需要知道 body 什么时候结束。有两种方式：

1. **Content-Length**：明确告诉客户端 body 有多少字节。最简单的方式，但要求服务器在发送前就知道完整长度。
2. **Transfer-Encoding: chunked**：分块传输。服务器不知道总长度时（比如流式生成数据），把 body 分成多个块，每块前面标明长度，最后用一个 0 长度的块表示结束。

### 4.3 头部的分类

HTTP/1.1 把头部分为四类：

1. **通用头部（General）**：请求和响应都可以用，如 \`Cache-Control\`、\`Connection\`、\`Date\`。
2. **请求头部（Request）**：只用于请求，如 \`Host\`、\`User-Agent\`、\`Accept\`、\`Authorization\`。
3. **响应头部（Response）**：只用于响应，如 \`Server\`、\`Set-Cookie\`、\`Location\`。
4. **实体头部（Entity）**：描述 body 信息，如 \`Content-Type\`、\`Content-Length\`、\`Content-Encoding\`。

---

## 五、实战：用 curl 观察原始报文

用 \`curl -v\` 可以看到 HTTP 通信的原始报文：

\`\`\`bash
# -v 显示详细信息，--http1.1 强制使用 HTTP/1.1
curl -v --http1.1 http://example.com

# 输出中：
# > 开头的是请求报文（客户端发出）
# < 开头的是响应报文（服务器返回）
\`\`\`

理解报文结构是排查一切 HTTP 问题的基础——CORS 报错看响应头有没有 \`Access-Control-Allow-Origin\`、大文件下载看 \`Content-Length\` 和 \`Range\`、认证失败看 \`Authorization\` 和 \`WWW-Authenticate\`。

---

下面运行一个 demo，手动解析原始 HTTP 报文字符串，拆解出请求行、头部、消息体。`,
    code: `// ============================================
// 第二章 Demo：手动解析 HTTP 报文
// --------------------------------------------
// 不使用 http 模块，用 Buffer 和字符串操作
// 手动解析原始 HTTP 请求和响应报文。
// 这能帮助你理解 HTTP 报文的真实结构。
// ============================================

const assert = require('assert');
const querystring = require('querystring');

// CRLF = 回车 + 换行，HTTP 规范用 \\r\\n 作为行分隔符
const CRLF = '\\r\\n';

// --------------------------------------------
// 1. 构造一条原始的 HTTP 请求报文
// --------------------------------------------
var requestBody = '{"name":"alice","age":25,"role":"admin"}';
const rawRequest = [
  'POST /api/users?source=web HTTP/1.1',
  'Host: api.example.com',
  'Content-Type: application/json',
  'Content-Length: ' + Buffer.byteLength(requestBody),
  'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9',
  'User-Agent: Mozilla/5.0 (Macintosh)',
  'Accept: application/json',
  'Connection: keep-alive',
  '',   // 空行，标志着头部结束
  requestBody  // 请求体
].join(CRLF);

console.log('=== 原始 HTTP 请求报文 ===');
console.log(rawRequest);
console.log('');

// --------------------------------------------
// 2. 解析 HTTP 请求报文
// --------------------------------------------
function parseHttpRequest(raw) {
  // 第一步：找到空行（头部和 body 的分界）
  // 空行是连续的两个 CRLF（\\r\\n\\r\\n）
  var separator = CRLF + CRLF;
  var headerEnd = raw.indexOf(separator);

  var headerSection, body;
  if (headerEnd === -1) {
    // 没有空行，说明没有 body
    headerSection = raw;
    body = '';
  } else {
    headerSection = raw.substring(0, headerEnd);
    body = raw.substring(headerEnd + separator.length);
  }

  // 第二步：按 CRLF 拆分头部
  var headerLines = headerSection.split(CRLF);

  // 第三步：解析请求行（第一行）
  // 格式：方法 URI HTTP版本
  var requestLine = headerLines[0];
  var requestParts = requestLine.split(' ');
  var method = requestParts[0];
  var requestTarget = requestParts[1];
  var httpVersion = requestParts[2];

  // 进一步解析 URI：路径和查询参数
  var path, query;
  var queryIndex = requestTarget.indexOf('?');
  if (queryIndex === -1) {
    path = requestTarget;
    query = '';
  } else {
    path = requestTarget.substring(0, queryIndex);
    query = requestTarget.substring(queryIndex + 1);
  }

  // 用 querystring 模块解析查询参数
  var queryParams = querystring.parse(query);

  // 第四步：解析头部字段（从第二行开始）
  var headers = {};
  for (var i = 1; i < headerLines.length; i++) {
    var line = headerLines[i];
    var colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    var key = line.substring(0, colonIndex).trim();
    var value = line.substring(colonIndex + 1).trim();
    headers[key] = value;
  }

  return {
    method: method,
    path: path,
    query: query,
    queryParams: queryParams,
    httpVersion: httpVersion,
    headers: headers,
    body: body
  };
}

var parsed = parseHttpRequest(rawRequest);

console.log('=== 解析结果 ===');
console.log('方法:       ' + parsed.method);
console.log('路径:       ' + parsed.path);
console.log('查询字符串: ' + parsed.query);
console.log('查询参数:   ' + JSON.stringify(parsed.queryParams));
console.log('HTTP版本:   ' + parsed.httpVersion);
console.log('头部字段:');
Object.keys(parsed.headers).forEach(function (key) {
  console.log('  ' + key + ': ' + parsed.headers[key]);
});
console.log('请求体:     ' + parsed.body);
console.log('');

// --------------------------------------------
// 3. 构造并解析一条 HTTP 响应报文
// --------------------------------------------
var responseBody = '{"id":1,"name":"alice","role":"admin"}';
var rawResponse = [
  'HTTP/1.1 200 OK',
  'Content-Type: application/json; charset=utf-8',
  'Content-Length: ' + Buffer.byteLength(responseBody),
  'Server: nginx/1.21.6',
  'Cache-Control: no-cache',
  'Set-Cookie: sessionId=abc123; Path=/; HttpOnly',
  '',  // 空行
  responseBody
].join(CRLF);

console.log('=== 原始 HTTP 响应报文 ===');
console.log(rawResponse);
console.log('');

function parseHttpResponse(raw) {
  var separator = CRLF + CRLF;
  var headerEnd = raw.indexOf(separator);
  var headerSection, body;
  if (headerEnd === -1) {
    headerSection = raw;
    body = '';
  } else {
    headerSection = raw.substring(0, headerEnd);
    body = raw.substring(headerEnd + separator.length);
  }

  var headerLines = headerSection.split(CRLF);

  // 状态行格式：HTTP版本 状态码 原因短语
  var statusLine = headerLines[0];
  var statusParts = statusLine.split(' ');
  var httpVersion = statusParts[0];
  var statusCode = parseInt(statusParts[1], 10);
  // 原因短语可能包含空格（如 "Not Found"），所以取剩余部分
  var reasonPhrase = statusParts.slice(2).join(' ');

  var headers = {};
  for (var i = 1; i < headerLines.length; i++) {
    var line = headerLines[i];
    var colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    var key = line.substring(0, colonIndex).trim();
    var value = line.substring(colonIndex + 1).trim();
    headers[key] = value;
  }

  return {
    httpVersion: httpVersion,
    statusCode: statusCode,
    reasonPhrase: reasonPhrase,
    headers: headers,
    body: body
  };
}

var parsedResp = parseHttpResponse(rawResponse);
console.log('=== 响应解析结果 ===');
console.log('HTTP版本:   ' + parsedResp.httpVersion);
console.log('状态码:     ' + parsedResp.statusCode);
console.log('原因短语:   ' + parsedResp.reasonPhrase);
console.log('头部字段:');
Object.keys(parsedResp.headers).forEach(function (key) {
  console.log('  ' + key + ': ' + parsedResp.headers[key]);
});
console.log('响应体:     ' + parsedResp.body);
console.log('');

// --------------------------------------------
// 4. 用 Buffer 处理报文（演示二进制视角）
// --------------------------------------------
console.log('=== 用 Buffer 查看报文的字节 ===');
console.log('');

var buf = Buffer.from(rawRequest);
console.log('报文总字节数: ' + buf.length);
console.log('前 50 字节的十六进制: ' + buf.slice(0, 50).toString('hex'));
console.log('');

// 找到空行（\\r\\n\\r\\n = 0x0d 0x0a 0x0d 0x0a）的位置
var bodyStart = buf.indexOf(Buffer.from([0x0d, 0x0a, 0x0d, 0x0a]));
console.log('空行（头部结束位置）的字节偏移: ' + bodyStart);
console.log('头部字节数: ' + (bodyStart + 4));
console.log('Body 字节数: ' + (buf.length - bodyStart - 4));

// 验证 Content-Length 是否匹配
var declaredLength = parseInt(parsed.headers['Content-Length'], 10);
var actualBodyLength = Buffer.byteLength(parsed.body);
console.log('');
console.log('Content-Length 声明: ' + declaredLength);
console.log('Body 实际字节数:    ' + actualBodyLength);
assert.strictEqual(declaredLength, actualBodyLength, 'Content-Length 应与 body 实际字节数一致');
console.log('✓ Content-Length 与 body 长度匹配');
console.log('');

// --------------------------------------------
// 5. 构造一个 HTTP 请求报文（反向操作）
// --------------------------------------------
console.log('=== 构造 HTTP 请求报文 ===');
console.log('');

function buildHttpRequest(options) {
  // 构造请求行
  var target = options.path;
  if (options.query) {
    target += '?' + querystring.stringify(options.query);
  }
  var requestLine = options.method + ' ' + target + ' ' + (options.version || 'HTTP/1.1');

  // 构造头部
  var headerLines = [requestLine];
  Object.keys(options.headers || {}).forEach(function (key) {
    headerLines.push(key + ': ' + options.headers[key]);
  });

  // 头部 + 空行 + body
  var result = headerLines.join(CRLF) + CRLF + CRLF;
  if (options.body) {
    result += options.body;
  }
  return result;
}

var built = buildHttpRequest({
  method: 'GET',
  path: '/api/posts',
  query: { page: '1', size: '10', tag: 'javascript' },
  version: 'HTTP/1.1',
  headers: {
    'Host': 'blog.example.com',
    'Accept': 'application/json',
    'User-Agent': 'MyDemo/1.0'
  }
});

console.log(built);

// 验证：把构造的报文再解析一遍，确认能还原
var reparsed = parseHttpRequest(built);
assert.strictEqual(reparsed.method, 'GET');
assert.strictEqual(reparsed.path, '/api/posts');
assert.strictEqual(reparsed.queryParams.page, '1');
assert.strictEqual(reparsed.queryParams.tag, 'javascript');
assert.strictEqual(reparsed.headers.Host, 'blog.example.com');
console.log('✓ 构造的报文经解析后完全还原');
console.log('');
console.log('💡 理解报文结构后，你就能用任何语言构造/解析 HTTP 报文，');
console.log('   这也是 curl、Postman、浏览器底层在做的事情。');
`
  },

  // ============================================================
  // 第三章：HTTP 方法——GET/POST/PUT/DELETE/PATCH 等
  // ============================================================
  {
    id: "http-03",
    group: "HTTP 基础",
    icon: "📝",
    title: "HTTP 方法——GET/POST/PUT/DELETE/PATCH 等",
    content: `## 一、HTTP 方法是什么？

HTTP 方法（也叫"动词"）定义了对资源的**操作意图**。请求行的第一个字段就是方法：

\`\`\`
GET /api/users/1 HTTP/1.1
^^^
方法，表示"获取"这个资源
\`\`\`

方法名是**大小写敏感**的，必须大写。HTTP/1.1 定义了 8 种方法，HTTP/2 和 HTTP/3 沿用了这些方法。

### 所有 HTTP 方法一览

| 方法 | 描述 | 有 Body？ | 幂等 | 安全 |
|------|------|-----------|------|------|
| \`GET\` | 获取资源 | 通常无 | 是 | 是 |
| \`POST\` | 创建资源/提交数据 | 有 | 否 | 否 |
| \`PUT\` | 替换资源（整体更新） | 有 | 是 | 否 |
| \`PATCH\` | 部分更新资源 | 有 | 否* | 否 |
| \`DELETE\` | 删除资源 | 通常无 | 是 | 否 |
| \`HEAD\` | 只获取响应头（不要 body） | 无 | 是 | 是 |
| \`OPTIONS\` | 查询服务器支持的方法 | 无 | 是 | 是 |
| \`TRACE\` | 回显请求（调试用） | 无 | 是 | 是 |
| \`CONNECT\` | 建立隧道（HTTPS 代理） | 无 | 否 | 否 |

> *PATCH 在 RFC 5789 中允许用幂等的方式实现，但语义上不保证幂等。

---

## 二、常用方法详解

### 2.1 GET——获取资源

最常用的方法。语义是"请把这个资源给我"。特点：

- **应该是安全的**：GET 不应该产生副作用，不应该修改服务器上的任何数据。一个 GET 请求执行 100 次，服务器状态应该和执行 0 次一样。
- **应该是幂等的**：多次执行结果相同。
- **不应该有 body**：虽然技术上可以发 body，但很多服务器和代理会忽略 GET 的 body。参数应该放在 URL 查询字符串里。
- **可缓存**：GET 请求的响应可以被浏览器/CDN 缓存。
- **URL 长度有限制**：浏览器对 URL 长度有限制（约 2KB-8KB），不要在 GET 里塞大量数据。

\`\`\`http
GET /api/users?page=1&size=10 HTTP/1.1
Host: api.example.com
\`\`\`

### 2.2 POST——创建资源/提交数据

语义是"把这些数据提交给服务器处理"。特点：

- **不安全**：会修改服务器状态（创建新资源、触发操作）。
- **不幂等**：提交两次可能创建两个资源。
- **有 body**：数据放在请求体里，用 \`Content-Type\` 声明格式。
- **不可缓存**：默认不缓存。

\`\`\`http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name":"alice","age":25}
\`\`\`

POST 的用途远不止"创建资源"——提交表单、上传文件、触发操作（发邮件、发消息）都用 POST。它是最通用的"提交数据"方法。

### 2.3 PUT——替换资源

语义是"用我提供的数据**替换**这个资源"。如果资源不存在就创建，存在就整体覆盖。特点：

- **幂等**：无论执行多少次，结果都是"资源变成我提供的那个样子"。
- **有 body**：包含资源的完整新数据。
- **客户端指定 URI**：\`PUT /api/users/1\` 明确指定要操作的是哪个资源。

\`\`\`http
PUT /api/users/1 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"name":"alice","age":26,"role":"admin"}
\`\`\`

PUT 和 POST 的关键区别：**PUT 是幂等的，POST 不是**。同一个 POST 请求发两次会创建两个资源，但同一个 PUT 请求发两次结果只有一个资源（后一次覆盖前一次）。

### 2.4 PATCH——部分更新

语义是"只更新资源的**部分字段**"。与 PUT 的区别：PUT 是整体替换，PATCH 是打补丁。特点：

- **不保证幂等**：语义上 PATCH 可以是非幂等的（比如 PATCH 增加 age 字段 +1，执行两次和一次结果不同）。
- **有 body**：只包含要修改的字段。
- **有多种格式**：JSON Patch（RFC 6902）、Merge Patch（RFC 7396）等。

\`\`\`http
PATCH /api/users/1 HTTP/1.1
Host: api.example.com
Content-Type: application/json

{"age":26}
\`\`\`

### 2.5 DELETE——删除资源

语义是"删除这个资源"。特点：

- **幂等**：删除一个已经删除的资源，结果还是"不存在"。
- **通常无 body**：URI 已经指明了要删什么。

\`\`\`http
DELETE /api/users/1 HTTP/1.1
Host: api.example.com
\`\`\`

### 2.6 HEAD——只取头

和 GET 一样，但服务器**只返回响应头，不返回 body**。用途：

- 检查资源是否存在（看状态码 200/404）。
- 检查资源的大小（看 \`Content-Length\`）而不下载整个文件。
- 检查资源的修改时间（看 \`Last-Modified\`）。

\`\`\`http
HEAD /api/users/1 HTTP/1.1
Host: api.example.com
\`\`\`

### 2.7 OPTIONS——查询支持的方法

询问服务器"这个资源支持哪些方法"。服务器返回 \`Allow\` 头部列出支持的方法。**CORS 预检请求**就用的 OPTIONS：

\`\`\`http
OPTIONS /api/users HTTP/1.1
Host: api.example.com
Origin: https://frontend.com
Access-Control-Request-Method: POST
\`\`\`

### 2.8 TRACE——回显请求

让服务器把收到的请求原样返回，用于调试。出于安全考虑（会暴露敏感头部），大多数服务器禁用 TRACE。

### 2.9 CONNECT——建立隧道

用于 HTTPS 代理。客户端 \`CONNECT api.example.com:443\`，代理建立到目标服务器的 TCP 隧道，之后客户端在隧道里直接做 TLS 握手，代理看不到加密内容。

---

## 三、幂等性与安全性

这是 HTTP 方法最核心的两个概念，面试必考。

### 3.1 安全（Safe）

**安全方法**是指不修改服务器状态的方法。GET、HEAD、OPTIONS、TRACE 是安全的。这里的"安全"不是指"安全性/认证"，而是指"对服务器状态无害"。

为什么要区分安全方法？因为**爬虫、预加载、缓存**可以安全地调用安全方法——它们知道不会产生副作用。如果你把"删除用户"做成 GET 掓求，爬虫一爬就把用户删光了，这就是为什么"删改操作不能用 GET"。

### 3.2 幂等（Idempotent）

**幂等方法**是指执行一次和执行多次效果相同的方法。GET、PUT、DELETE、HEAD、OPTIONS 是幂等的。

\`\`\`
执行 1 次 PUT /users/1 {name:"alice"}
执行 5 次 PUT /users/1 {name:"alice"}
→ 结果相同：用户 1 的名字是 alice

执行 1 次 POST /users {name:"alice"} → 创建用户 A
执行 5 次 POST /users {name:"alice"} → 创建用户 A, B, C, D, E
→ 结果不同：POST 不幂等
\`\`\`

幂等性的实际意义在于**网络重试**：如果请求超时了，幂等方法可以安全地重试（再发一次不会出问题），而非幂等方法不能盲目重试（可能导致重复创建）。

### 3.3 方法选择指南

| 需求 | 推荐方法 | 理由 |
|------|----------|------|
| 查询列表/详情 | GET | 安全、可缓存 |
| 创建新资源 | POST | 非幂等，符合"创建"语义 |
| 整体替换资源 | PUT | 幂等，客户端指定 URI |
| 部分更新字段 | PATCH | 只传变更的字段 |
| 删除资源 | DELETE | 幂等 |
| 检查资源元信息 | HEAD | 不下载 body |
| CORS 预检 | OPTIONS | 标准做法 |

---

## 四、常见误区

1. **"GET 不能有 body"**：技术上可以，但不推荐，很多服务器/代理会丢弃。
2. **"PUT 和 POST 没区别"**：区别在幂等性和 URI 归属。\`POST /users\`（集合）vs \`PUT /users/1\`（具体资源）。
3. **"DELETE 一定要成功返回 200"**：也可以返回 204（无内容）或 202（已接受，异步删除）。
4. **"PATCH 一定不幂等"**：取决于实现。\`{"name":"alice"}\` 这种是幂等的，\`{"age":+1}\` 这种不是。

---

下面运行一个 demo，用模拟路由演示各方法的语义和幂等性。`,
    code: `// ============================================
// 第三章 Demo：HTTP 方法模拟路由与幂等性演示
// --------------------------------------------
// 不使用 http 模块，用一个内存"资源存储"模拟
// RESTful API，演示各 HTTP 方法的语义差异。
// ============================================

const assert = require('assert');

// --------------------------------------------
// 1. 模拟资源存储（类似数据库）
// --------------------------------------------
// 用对象存储用户资源，key 是 id
function createStore() {
  var store = {};
  var nextId = 1;
  return {
    // 生成自增 ID
    nextId: function () { return nextId++; },
    // 获取单个
    get: function (id) { return store[id] ? Object.assign({}, store[id]) : null; },
    // 获取全部
    getAll: function () {
      return Object.keys(store).map(function (id) {
        return Object.assign({}, store[id]);
      });
    },
    // 创建（不检查是否已存在）
    insert: function (id, data) {
      store[id] = Object.assign({ id: id }, data);
      return Object.assign({}, store[id]);
    },
    // 整体替换
    replace: function (id, data) {
      store[id] = Object.assign({ id: id }, data);
      return Object.assign({}, store[id]);
    },
    // 部分更新
    patch: function (id, partial) {
      if (!store[id]) return null;
      Object.keys(partial).forEach(function (key) {
        store[id][key] = partial[key];
      });
      return Object.assign({}, store[id]);
    },
    // 删除
    remove: function (id) {
      var existed = !!store[id];
      delete store[id];
      return existed;
    },
    exists: function (id) { return !!store[id]; },
    count: function () { return Object.keys(store).length; }
  };
}

// --------------------------------------------
// 2. 模拟 HTTP 路由器
// --------------------------------------------
// 每个方法对应一个处理函数，返回 {statusCode, headers, body}
function createRouter(store) {
  var routes = {};

  // 注册路由处理器
  function on(method, handler) {
    routes[method] = handler;
  }

  // 处理请求
  function handle(request) {
    var method = request.method;
    var path = request.path;       // 如 /api/users 或 /api/users/1
    var body = request.body || '';  // 请求体（字符串）
    var handler = routes[method];

    if (!handler) {
      return { statusCode: 405, reason: 'Method Not Allowed', body: '不支持的方法' };
    }

    // 解析路径，提取资源 id
    // /api/users     → 集合操作
    // /api/users/1   → 单个资源操作
    var match = path.match(/^\\/api\\/users(?:\\/(\\d+))?$/);
    if (!match) {
      return { statusCode: 404, reason: 'Not Found', body: '路径不存在' };
    }
    var resourceId = match[1] ? parseInt(match[1], 10) : null;

    // 解析 body（如果是 JSON 字符串）
    var parsedBody = {};
    if (body) {
      try { parsedBody = JSON.parse(body); } catch (e) { parsedBody = {}; }
    }

    return handler(resourceId, parsedBody, store);
  }

  return { on: on, handle: handle };
}

// --------------------------------------------
// 3. 定义各方法的处理器
// --------------------------------------------
function createHandlers() {
  var store = createStore();
  var router = createRouter(store);

  // GET：获取资源（安全 + 幂等）
  router.on('GET', function (id, _, s) {
    if (id === null) {
      // GET /api/users → 获取列表
      var list = s.getAll();
      return { statusCode: 200, reason: 'OK', body: list };
    } else {
      // GET /api/users/1 → 获取单个
      var user = s.get(id);
      if (!user) return { statusCode: 404, reason: 'Not Found', body: '用户不存在' };
      return { statusCode: 200, reason: 'OK', body: user };
    }
  });

  // POST：创建资源（不幂等）
  router.on('POST', function (id, data, s) {
    if (id !== null) {
      return { statusCode: 405, reason: 'Method Not Allowed', body: 'POST 应该发到集合 /api/users' };
    }
    var newId = s.nextId();
    var created = s.insert(newId, data);
    return { statusCode: 201, reason: 'Created', body: created };
  });

  // PUT：替换资源（幂等）
  router.on('PUT', function (id, data, s) {
    if (id === null) {
      return { statusCode: 400, reason: 'Bad Request', body: 'PUT 需要指定资源 id' };
    }
    var existed = s.exists(id);
    s.replace(id, data);
    return { statusCode: existed ? 200 : 201, reason: existed ? 'OK' : 'Created', body: s.get(id) };
  });

  // PATCH：部分更新（不保证幂等）
  router.on('PATCH', function (id, data, s) {
    if (id === null) {
      return { statusCode: 400, reason: 'Bad Request', body: 'PATCH 需要指定资源 id' };
    }
    if (!s.exists(id)) {
      return { statusCode: 404, reason: 'Not Found', body: '用户不存在' };
    }
    var updated = s.patch(id, data);
    return { statusCode: 200, reason: 'OK', body: updated };
  });

  // DELETE：删除资源（幂等）
  router.on('DELETE', function (id, _, s) {
    if (id === null) {
      return { statusCode: 400, reason: 'Bad Request', body: 'DELETE 需要指定资源 id' };
    }
    var existed = s.remove(id);
    return { statusCode: existed ? 204 : 404, reason: existed ? 'No Content' : 'Not Found', body: existed ? '' : '用户不存在' };
  });

  // HEAD：只返回头，不返回 body
  router.on('HEAD', function (id, _, s) {
    if (id === null) {
      return { statusCode: 200, reason: 'OK', body: '', headers: { 'X-Total-Count': String(s.count()) } };
    }
    var exists = s.exists(id);
    return { statusCode: exists ? 200 : 404, reason: exists ? 'OK' : 'Not Found', body: '' };
  });

  // OPTIONS：返回支持的方法
  router.on('OPTIONS', function () {
    return {
      statusCode: 204,
      reason: 'No Content',
      body: '',
      headers: { 'Allow': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS' }
    };
  });

  return { router: router, store: store };
}

// --------------------------------------------
// 4. 演示各方法的使用
// --------------------------------------------
var api = createHandlers();
var router = api.router;
var store = api.store;

// 辅助函数：发送请求并打印结果
function send(method, path, body) {
  var req = { method: method, path: path, body: body ? JSON.stringify(body) : '' };
  var res = router.handle(req);
  console.log('  → ' + method + ' ' + path + (body ? ' ' + JSON.stringify(body) : ''));
  console.log('  ← ' + res.statusCode + ' ' + res.reason + (res.body ? ' ' + JSON.stringify(res.body) : ''));
  return res;
}

console.log('=== 1. POST 创建资源（不幂等）===');
console.log('连续 POST 两次，看是否创建两个资源:');
console.log('');
send('POST', '/api/users', { name: 'alice', age: 25 });
send('POST', '/api/users', { name: 'alice', age: 25 });
console.log('');
console.log('  结果：创建了两个 name=alice 的用户（id 不同）');
console.log('  说明：POST 不幂等，同样的请求发两次会创建两个资源');
console.log('  当前用户数: ' + store.count());
console.log('');

console.log('=== 2. PUT 替换资源（幂等）===');
console.log('对 id=1 连续 PUT 两次，看结果是否相同:');
console.log('');
send('PUT', '/api/users/1', { name: 'alice', age: 30, role: 'admin' });
send('PUT', '/api/users/1', { name: 'alice', age: 30, role: 'admin' });
console.log('');
console.log('  结果：id=1 的用户只有一份，数据是最后 PUT 的内容');
console.log('  说明：PUT 是幂等的，执行多次和一次效果相同');
console.log('  当前用户数: ' + store.count());
console.log('');

console.log('=== 3. PATCH 部分更新 ===');
console.log('只修改 age 字段，不影响其他字段:');
console.log('');
send('PATCH', '/api/users/1', { age: 31 });
console.log('');
console.log('  结果：id=1 的用户 age 变了，name 和 role 保持不变');
console.log('  对比 PUT：PUT 会整体替换，没传的字段会丢失');
console.log('');

// 演示 PUT 和 PATCH 的区别
console.log('=== 4. PUT vs PATCH 的区别 ===');
console.log('');
console.log('  当前 id=1 的完整数据:');
console.log('  ' + JSON.stringify(store.get(1)));
console.log('');
console.log('  用 PUT 只传 age（整体替换，其他字段会丢失）:');
send('PUT', '/api/users/1', { age: 99 });
console.log('  注意：name 和 role 没了！PUT 是整体替换');
console.log('');
console.log('  用 PATCH 只传 age（部分更新，其他字段保留）:');
// 先恢复数据
store.replace(1, { name: 'alice', age: 31, role: 'admin' });
send('PATCH', '/api/users/1', { age: 99 });
console.log('  注意：name 和 role 保留了！PATCH 只改指定的字段');
console.log('');

console.log('=== 5. DELETE 删除资源（幂等）===');
console.log('连续 DELETE 两次，看结果:');
console.log('');
send('DELETE', '/api/users/1');
send('DELETE', '/api/users/1');
console.log('');
console.log('  第一次：204（删除成功）');
console.log('  第二次：404（已经没了，但结果还是"不存在"）');
console.log('  说明：DELETE 是幂等的——删一次和删十次，最终状态都是"不存在"');
console.log('');

console.log('=== 6. GET 获取资源（安全 + 幂等）===');
console.log('');
send('GET', '/api/users');
send('GET', '/api/users/2');
console.log('');
console.log('  说明：GET 不修改任何数据，执行多少次结果都一样');
console.log('');

console.log('=== 7. HEAD 只获取头信息 ===');
console.log('');
send('HEAD', '/api/users');
send('HEAD', '/api/users/2');
console.log('');
console.log('  说明：HEAD 和 GET 类似，但不返回 body');
console.log('  可以用 HEAD 检查资源是否存在，而不用下载整个内容');
console.log('');

console.log('=== 8. OPTIONS 查询支持的方法 ===');
console.log('');
send('OPTIONS', '/api/users');
console.log('');
console.log('  说明：OPTIONS 返回 Allow 头，列出资源支持的方法');
console.log('  CORS 预检请求就是用 OPTIONS 发的');
console.log('');

// --------------------------------------------
// 5. 幂等性验证测试
// --------------------------------------------
console.log('=== 9. 幂等性自动验证 ===');
console.log('');

function testIdempotent(method, path, body, label) {
  // 重置存储
  var fresh = createHandlers();
  var r = fresh.router;
  var s = fresh.store;

  // 先准备数据
  if (method !== 'POST') {
    s.insert(1, { name: 'test', age: 20 });
  }

  // 执行第一次
  var req = { method: method, path: path, body: body ? JSON.stringify(body) : '' };
  var res1 = r.handle(req);
  var state1 = JSON.stringify(s.getAll());

  // 执行第二次
  var res2 = r.handle(req);
  var state2 = JSON.stringify(s.getAll());

  var idempotent = (state1 === state2);
  console.log('  ' + label + ':');
  console.log('    第一次执行后状态: ' + state1);
  console.log('    第二次执行后状态: ' + state2);
  console.log('    幂等: ' + (idempotent ? '✓ 是' : '✗ 否'));
  console.log('');
  return idempotent;
}

testIdempotent('GET', '/api/users/1', null, 'GET');
testIdempotent('PUT', '/api/users/1', { name: 'updated', age: 25 }, 'PUT');
testIdempotent('DELETE', '/api/users/1', null, 'DELETE');
testIdempotent('POST', '/api/users', { name: 'new', age: 30 }, 'POST');

console.log('=== 总结 ===');
console.log('• 安全方法（不修改状态）：GET, HEAD, OPTIONS');
console.log('• 幂等方法（多次执行结果相同）：GET, PUT, DELETE, HEAD, OPTIONS');
console.log('• 非幂等方法：POST（每次创建新资源）, PATCH（取决于实现）');
console.log('• 幂等性的意义：网络超时后可以安全重试幂等方法');
`
  },

  // ============================================================
  // 第四章：HTTP 状态码——从 1xx 到 5xx
  // ============================================================
  {
    id: "http-04",
    group: "HTTP 基础",
    icon: "🔢",
    title: "HTTP 状态码——从 1xx 到 5xx",
    content: `## 一、状态码是什么？

HTTP 响应的状态行包含一个**三位数字**的状态码，它告诉客户端"请求的处理结果如何"：

\`\`\`
HTTP/1.1 200 OK
         ^^^ ^^
         |   └── 原因短语（给人看的描述）
         └────── 状态码（给程序判断的）
\`\`\`

状态码是 HTTP 通信中最重要的信息之一。前端根据状态码决定是渲染数据还是提示错误，客户端库根据状态码决定是否重试，监控系统根据状态码统计成功率。

### 状态码的分类

状态码的第一位数字表示类别：

| 范围 | 类别 | 含义 |
|------|------|------|
| \`1xx\` | 信息响应（Informational） | 请求已接收，继续处理 |
| \`2xx\` | 成功（Successful） | 请求已成功处理 |
| \`3xx\` | 重定向（Redirection） | 需要进一步操作才能完成 |
| \`4xx\` | 客户端错误（Client Error） | 请求有误，客户端的问题 |
| \`5xx\` | 服务器错误（Server Error） | 服务器处理失败 |

记忆口诀：**1 信息、2 成功、3 跳转、4 你错了、5 我错了**。

---

## 二、1xx 信息响应

1xx 状态码比较少见，表示"请求已收到，继续处理"。

### 100 Continue

客户端发送大 body 前，先用 \`Expect: 100-continue\` 头部询问服务器"你愿意接收吗？"。服务器如果愿意，返回 \`100 Continue\`，客户端再发 body。如果不愿意（比如 body 太大），返回 \`417 Expectation Failed\`。

### 101 Switching Protocols

客户端用 \`Upgrade\` 头部请求切换协议，服务器同意后返回 \`101\`。最典型的场景是 **WebSocket 握手**：HTTP 升级为 WebSocket 协议。

\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
\`\`\`

---

## 三、2xx 成功

### 200 OK

最常见。请求成功，响应体包含结果数据。GET 返回资源，POST 返回创建的资源，PUT 返回更新后的资源。

### 201 Created

请求成功且**创建了新资源**。通常用于 POST 请求成功创建资源后。响应应该包含 \`Location\` 头部指向新资源的 URL。

\`\`\`http
HTTP/1.1 201 Created
Location: /api/users/42
Content-Type: application/json

{"id":42,"name":"alice"}
\`\`\`

### 202 Accepted

请求已接受处理，但**处理还没完成**（异步处理）。比如提交一个视频转码任务，服务器返回 202 表示"收到，正在转，回头来查结果"。

### 204 No Content

请求成功但**没有内容返回**。响应没有 body。常用于 DELETE 请求成功、PUT 请求成功后不返回更新内容。

### 206 Partial Content

服务器成功处理了**范围请求**（\`Range\` 头部）。用于断点续传、视频拖拽播放。响应包含 \`Content-Range\` 头部说明返回的范围。

\`\`\`http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/2048
Content-Length: 1024

（前 1024 字节的数据）
\`\`\`

---

## 四、3xx 重定向

3xx 表示资源"搬家了"或需要额外操作。

### 301 Moved Permanently

资源**永久**搬到了新地址。浏览器会缓存这个跳转，下次直接访问新地址。SEO 场景下把 \`http\` 跳转到 \`https\`、把旧域名跳转到新域名就用 301。

\`\`\`http
HTTP/1.1 301 Moved Permanently
Location: https://www.example.com/new-page
\`\`\`

### 302 Found

资源**临时**搬到了新地址。浏览器不缓存，每次都先访问旧地址。注意：302 的方法可能被改为 GET（虽然规范说不应该，但浏览器都这么干）。

### 303 See Other

用 GET 方法去另一个 URL 获取结果。常用于 POST 表单提交后重定向到结果页面（PRG 模式：Post-Redirect-Get）。

### 304 Not Modified

**协商缓存命中**。客户端发送 \`If-Modified-Since\` 或 \`If-None-Match\`，服务器检查资源没变，返回 304（不返回 body），客户端用本地缓存的版本。

\`\`\`http
# 请求
GET /style.css HTTP/1.1
If-None-Match: "abc123"

# 响应（资源没变，用缓存）
HTTP/1.1 304 Not Modified
ETag: "abc123"
（无 body）
\`\`\`

### 307 Temporary Redirect

临时重定向，**不改变请求方法**（302 可能改）。如果原来用 POST，重定向后还是 POST。

### 308 Permanent Redirect

永久重定向，**不改变请求方法**。301 的方法保持版本。

### 重定向方法行为对比

| 状态码 | 类型 | 方法是否改变 |
|--------|------|--------------|
| 301 | 永久 | 可能改为 GET（浏览器行为） |
| 302 | 临时 | 可能改为 GET（浏览器行为） |
| 303 | 临时 | 强制改为 GET |
| 307 | 临时 | 保持原方法 |
| 308 | 永久 | 保持原方法 |

---

## 五、4xx 客户端错误

4xx 表示**客户端的请求有问题**——语法错误、未授权、资源不存在等。

### 400 Bad Request

请求语法错误，服务器无法理解。比如 JSON 格式错误、缺少必填参数、参数类型不对。

### 401 Unauthorized

**未认证**——没有登录或 token 无效。响应应包含 \`WWW-Authenticate\` 头部说明认证方式。

\`\`\`http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
\`\`\`

### 403 Forbidden

**已认证但无权限**。服务器知道你是谁，但你没有权限访问这个资源。比如普通用户访问管理员接口。

### 404 Not Found

资源不存在。最熟悉的错误码。注意：有时服务器为了安全，对"无权限"的资源也返回 404（不告诉你它存在）。

### 405 Method Not Allowed

方法不允许。资源存在但不支持这个方法。比如对只读资源发 DELETE。响应应包含 \`Allow\` 头部列出支持的方法。

### 409 Conflict

冲突。请求与服务器当前状态冲突，比如创建用户时用户名已存在。

### 410 Gone

资源**永久**消失了（和 404 的区别：410 表示"我知道它以前在，现在永远没了"）。常用于 API 弃用的端点。

### 422 Unprocessable Entity

请求格式正确但**语义有误**。比如 JSON 格式没问题，但 \`age\` 字段是负数。常用于 API 参数校验失败。

### 429 Too Many Requests

**限流**。请求太频繁，超过速率限制。响应应包含 \`Retry-After\` 头部告诉客户端多久后重试。

\`\`\`http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

请求过于频繁，请 60 秒后重试
\`\`\`

---

## 六、5xx 服务器错误

5xx 表示**服务器在处理请求时出了问题**。

### 500 Internal Server Error

服务器内部错误。最笼统的服务器错误，通常是代码抛出了未捕获的异常。对用户来说"服务器炸了"。

### 501 Not Implemented

服务器不支持请求的功能。比如服务器不支持 \`PUT\` 方法。

### 502 Bad Gateway

**网关/代理从上游服务器收到无效响应**。Nginx 反向代理时，后端服务挂了或返回了无法理解的内容，Nginx 就返回 502。

### 503 Service Unavailable

服务暂时不可用。通常是服务器过载或正在维护。响应应包含 \`Retry-After\` 头部。

### 504 Gateway Timeout

**网关/代理等待上游服务器超时**。Nginx 反向代理时，后端服务在规定时间内没返回，Nginx 返回 504。和 502 的区别：502 是后端返回了错误响应，504 是后端压根没响应。

### 502 vs 504 的区别

\`\`\`
客户端 ──▶ Nginx(网关) ──▶ 后端服务

502：后端返回了，但返回的内容无效（比如后端崩了，进程没了）
504：后端在超时时间内没返回任何东西（比如后端处理太慢卡住了）
\`\`\`

---

## 七、状态码选择实践

### 7.1 RESTful API 的状态码选择

| 操作 | 成功 | 资源不存在 | 参数错误 | 未授权 |
|------|------|-----------|----------|--------|
| GET 列表 | 200 | — | 400 | 401 |
| GET 详情 | 200 | 404 | — | 401 |
| POST 创建 | 201 | — | 400/422 | 401 |
| PUT 更新 | 200 | 404 | 400 | 401 |
| PATCH 更新 | 200 | 404 | 400/422 | 401 |
| DELETE | 204 | 404 | — | 401 |

### 7.2 常见误区

1. **"所有错误都返回 200，body 里用 code 字段表示错误"**：这是很多国内 API 的做法，技术上可行但不符合 HTTP 语义。正确做法是用 HTTP 状态码。
2. **"401 和 403 没区别"**：401 是"没登录"（你是谁？），403 是"登录了但没权限"（你不能进）。
3. **"500 是万能错误码"**：500 只用于服务器内部错误。参数错误应该 400/422，限流应该 429。
4. **"删除成功返回 200"**：更规范的做法是返回 204（No Content），表示成功但无内容返回。

### 7.3 状态码的扩展

除了标准状态码，有些服务自定义了状态码（如 Cloudflare 的 520-530）。但自定义状态码不被广泛理解，应谨慎使用。如果需要更细的错误分类，建议在响应 body 里用 \`error.code\` 字段补充。

---

下面运行一个 demo，实现一个状态码查询工具。`,
    code: `// ============================================
// 第四章 Demo：HTTP 状态码查询工具
// --------------------------------------------
// 构建一个状态码数据库，支持：
//   1. 按状态码查询详情
//   2. 按类别（1xx-5xx）筛选
//   3. 搜索（按关键词）
//   4. 模拟 API 响应生成
// ============================================

const assert = require('assert');

// --------------------------------------------
// 1. 状态码数据库
// --------------------------------------------
const statusCodes = {
  // === 1xx 信息响应 ===
  100: { code: 100, name: 'Continue', category: '1xx', desc: '服务器已收到请求头，客户端应继续发送请求体' },
  101: { code: 101, name: 'Switching Protocols', category: '1xx', desc: '服务器同意切换协议（如 HTTP 升级为 WebSocket）' },

  // === 2xx 成功 ===
  200: { code: 200, name: 'OK', category: '2xx', desc: '请求成功。最常见的成功状态码' },
  201: { code: 201, name: 'Created', category: '2xx', desc: '请求成功并创建了新资源。通常用于 POST，响应应含 Location 头' },
  202: { code: 202, name: 'Accepted', category: '2xx', desc: '请求已接受，但处理尚未完成（异步任务）' },
  204: { code: 204, name: 'No Content', category: '2xx', desc: '请求成功但无内容返回。常用于 DELETE、PUT 成功后' },
  206: { code: 206, name: 'Partial Content', category: '2xx', desc: '服务器返回了部分内容（范围请求/断点续传）' },

  // === 3xx 重定向 ===
  301: { code: 301, name: 'Moved Permanently', category: '3xx', desc: '资源永久移动到新地址。浏览器会缓存此跳转' },
  302: { code: 302, name: 'Found', category: '3xx', desc: '资源临时移动到新地址。浏览器不缓存' },
  303: { code: 303, name: 'See Other', category: '3xx', desc: '用 GET 方法访问另一个 URL（PRG 模式）' },
  304: { code: 304, name: 'Not Modified', category: '3xx', desc: '协商缓存命中，资源未修改，客户端用缓存版本' },
  307: { code: 307, name: 'Temporary Redirect', category: '3xx', desc: '临时重定向，保持原请求方法不变' },
  308: { code: 308, name: 'Permanent Redirect', category: '3xx', desc: '永久重定向，保持原请求方法不变' },

  // === 4xx 客户端错误 ===
  400: { code: 400, name: 'Bad Request', category: '4xx', desc: '请求语法错误，服务器无法理解（如 JSON 格式错误）' },
  401: { code: 401, name: 'Unauthorized', category: '4xx', desc: '未认证。需要登录或提供有效凭证' },
  403: { code: 403, name: 'Forbidden', category: '4xx', desc: '已认证但无权限访问该资源' },
  404: { code: 404, name: 'Not Found', category: '4xx', desc: '请求的资源不存在' },
  405: { code: 405, name: 'Method Not Allowed', category: '4xx', desc: '请求方法不被允许。响应应含 Allow 头' },
  409: { code: 409, name: 'Conflict', category: '4xx', desc: '请求与服务器当前状态冲突（如用户名已存在）' },
  410: { code: 410, name: 'Gone', category: '4xx', desc: '资源已永久消失（比 404 更明确）' },
  422: { code: 422, name: 'Unprocessable Entity', category: '4xx', desc: '请求格式正确但语义有误（如参数校验失败）' },
  429: { code: 429, name: 'Too Many Requests', category: '4xx', desc: '请求过于频繁，触发限流。响应应含 Retry-After' },

  // === 5xx 服务器错误 ===
  500: { code: 500, name: 'Internal Server Error', category: '5xx', desc: '服务器内部错误。通常是未捕获的异常' },
  501: { code: 501, name: 'Not Implemented', category: '5xx', desc: '服务器不支持请求的功能' },
  502: { code: 502, name: 'Bad Gateway', category: '5xx', desc: '网关从上游收到无效响应（后端服务挂了）' },
  503: { code: 503, name: 'Service Unavailable', category: '5xx', desc: '服务暂时不可用（过载或维护中）' },
  504: { code: 504, name: 'Gateway Timeout', category: '5xx', desc: '网关等待上游服务器超时（后端响应太慢）' }
};

// 类别描述
const categoryInfo = {
  '1xx': { name: '信息响应', desc: '请求已接收，继续处理', color: '🔵' },
  '2xx': { name: '成功', desc: '请求已成功处理', color: '🟢' },
  '3xx': { name: '重定向', desc: '需要进一步操作才能完成', color: '🟡' },
  '4xx': { name: '客户端错误', desc: '请求有误，是客户端的问题', color: '🟠' },
  '5xx': { name: '服务器错误', desc: '服务器处理失败', color: '🔴' }
};

// --------------------------------------------
// 2. 查询函数
// --------------------------------------------

// 按状态码查询
function lookup(code) {
  var info = statusCodes[code];
  if (!info) {
    return { code: code, name: 'Unknown', category: '?', desc: '未知状态码（非标准或扩展状态码）' };
  }
  return info;
}

// 按类别筛选
function findByCategory(category) {
  return Object.keys(statusCodes)
    .filter(function (code) { return statusCodes[code].category === category; })
    .map(function (code) { return statusCodes[code]; });
}

// 按关键词搜索
function search(keyword) {
  var kw = keyword.toLowerCase();
  return Object.keys(statusCodes)
    .filter(function (code) {
      var info = statusCodes[code];
      return info.name.toLowerCase().indexOf(kw) !== -1 ||
             info.desc.toLowerCase().indexOf(kw) !== -1 ||
             String(info.code).indexOf(kw) !== -1;
    })
    .map(function (code) { return statusCodes[code]; });
}

// --------------------------------------------
// 3. 演示：按状态码查询
// --------------------------------------------
console.log('=== 1. 按状态码查询详情 ===');
console.log('');

[200, 404, 502, 304, 429].forEach(function (code) {
  var info = lookup(code);
  var cat = categoryInfo[info.category];
  console.log(cat.color + ' ' + info.code + ' ' + info.name + ' [' + cat.name + ']');
  console.log('   ' + info.desc);
  console.log('');
});

// --------------------------------------------
// 4. 演示：按类别筛选
// --------------------------------------------
console.log('=== 2. 按类别浏览状态码 ===');
console.log('');

Object.keys(categoryInfo).forEach(function (cat) {
  var info = categoryInfo[cat];
  var codes = findByCategory(cat);
  console.log(info.color + ' ' + cat + ' ' + info.name + '（' + info.desc + '）');
  codes.forEach(function (c) {
    console.log('   ' + c.code + ' ' + c.name);
  });
  console.log('');
});

// --------------------------------------------
// 5. 演示：关键词搜索
// --------------------------------------------
console.log('=== 3. 关键词搜索 ===');
console.log('');

var results1 = search('redirect');
console.log('搜索 "redirect":');
results1.forEach(function (c) { console.log('  ' + c.code + ' ' + c.name); });
console.log('');

var results2 = search('gateway');
console.log('搜索 "gateway":');
results2.forEach(function (c) { console.log('  ' + c.code + ' ' + c.name); });
console.log('');

var results3 = search('缓存');
// 中文搜索也支持（desc 字段是中文）
console.log('搜索 "缓存":');
results3.forEach(function (c) { console.log('  ' + c.code + ' ' + c.name + ' — ' + c.desc); });
console.log('');

// --------------------------------------------
// 6. 模拟 API 响应生成器
// --------------------------------------------
console.log('=== 4. 模拟 API 响应生成 ===');
console.log('');

// 根据不同场景生成合适的 HTTP 响应
function generateResponse(scenario) {
  var responses = {
    'create_success': {
      statusCode: 201,
      reasonPhrase: 'Created',
      headers: { 'Content-Type': 'application/json', 'Location': '/api/users/42' },
      body: '{"id":42,"name":"alice"}'
    },
    'not_found': {
      statusCode: 404,
      reasonPhrase: 'Not Found',
      headers: { 'Content-Type': 'application/json' },
      body: '{"error":"用户不存在"}'
    },
    'unauthorized': {
      statusCode: 401,
      reasonPhrase: 'Unauthorized',
      headers: { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer realm="api"' },
      body: '{"error":"未提供有效的认证凭证"}'
    },
    'forbidden': {
      statusCode: 403,
      reasonPhrase: 'Forbidden',
      headers: { 'Content-Type': 'application/json' },
      body: '{"error":"权限不足，无法访问此资源"}'
    },
    'validation_error': {
      statusCode: 422,
      reasonPhrase: 'Unprocessable Entity',
      headers: { 'Content-Type': 'application/json' },
      body: '{"error":"参数校验失败","details":["age 必须大于 0"]}'
    },
    'rate_limited': {
      statusCode: 429,
      reasonPhrase: 'Too Many Requests',
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      body: '{"error":"请求过于频繁，请 60 秒后重试"}'
    },
    'server_error': {
      statusCode: 500,
      reasonPhrase: 'Internal Server Error',
      headers: { 'Content-Type': 'application/json' },
      body: '{"error":"服务器内部错误，请稍后重试"}'
    },
    'bad_gateway': {
      statusCode: 502,
      reasonPhrase: 'Bad Gateway',
      headers: { 'Content-Type': 'application/json' },
      body: '{"error":"上游服务不可用"}'
    },
    'gateway_timeout': {
      statusCode: 504,
      reasonPhrase: 'Gateway Timeout',
      headers: { 'Content-Type': 'application/json' },
      body: '{"error":"上游服务响应超时"}'
    }
  };

  return responses[scenario] || responses['server_error'];
}

// 打印模拟响应
var scenarios = ['create_success', 'not_found', 'unauthorized', 'forbidden', 'validation_error', 'rate_limited', 'server_error', 'bad_gateway', 'gateway_timeout'];

scenarios.forEach(function (scenario) {
  var resp = generateResponse(scenario);
  var cat = categoryInfo[String(resp.statusCode)[0] + 'xx'];
  console.log(cat.color + ' 场景: ' + scenario);
  console.log('  状态行: HTTP/1.1 ' + resp.statusCode + ' ' + resp.reasonPhrase);
  Object.keys(resp.headers).forEach(function (key) {
    console.log('  ' + key + ': ' + resp.headers[key]);
  });
  console.log('  Body: ' + resp.body);
  console.log('');
});

// --------------------------------------------
// 7. 状态码分类统计
// --------------------------------------------
console.log('=== 5. 状态码分类统计 ===');
console.log('');

var stats = { '1xx': 0, '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
Object.keys(statusCodes).forEach(function (code) {
  var cat = statusCodes[code].category;
  stats[cat]++;
});

console.log('本数据库共收录 ' + Object.keys(statusCodes).length + ' 个状态码:');
Object.keys(stats).forEach(function (cat) {
  var info = categoryInfo[cat];
  var bar = '';
  for (var i = 0; i < stats[cat]; i++) { bar += '█'; }
  console.log('  ' + info.color + ' ' + cat + ' ' + info.name + ': ' + bar + ' ' + stats[cat] + ' 个');
});
console.log('');

// --------------------------------------------
// 8. 401 vs 403 的区别（常见面试题）
// --------------------------------------------
console.log('=== 6. 401 vs 403 区别演示 ===');
console.log('');

var authScenarios = [
  {
    name: '未登录访问',
    token: null,
    expected: 401,
    reason: '没有提供认证凭证，不知道你是谁'
  },
  {
    name: 'token 过期',
    token: 'expired_token',
    expected: 401,
    reason: '凭证无效，需要重新登录'
  },
  {
    name: '普通用户访问管理员接口',
    token: 'valid_user_token',
    role: 'user',
    requiredRole: 'admin',
    expected: 403,
    reason: '知道你是谁，但你没有权限'
  },
  {
    name: '管理员访问',
    token: 'valid_admin_token',
    role: 'admin',
    requiredRole: 'admin',
    expected: 200,
    reason: '认证通过且有权限'
  }
];

authScenarios.forEach(function (s) {
  console.log('场景: ' + s.name);
  console.log('  → 预期状态码: ' + s.expected + ' ' + lookup(s.expected).name);
  console.log('  → 原因: ' + s.reason);
  console.log('');
});

console.log('记忆口诀:');
console.log('  401 Unauthorized = "你是谁？" → 需要登录');
console.log('  403 Forbidden    = "你不能进" → 已登录但无权限');
console.log('');

// --------------------------------------------
// 9. 502 vs 504 的区别（运维必知）
// --------------------------------------------
console.log('=== 7. 502 vs 504 区别演示 ===');
console.log('');

console.log('架构: 客户端 → Nginx(网关) → 后端服务');
console.log('');
console.log('502 Bad Gateway:');
console.log('  后端服务进程崩溃/重启，Nginx 连不上或收到无效响应');
console.log('  常见原因: 后端 OOM、进程被杀、配置错误');
console.log('');
console.log('504 Gateway Timeout:');
console.log('  后端服务在运行，但处理太慢，Nginx 等不及了');
console.log('  常见原因: 数据库慢查询、死循环、下游依赖超时');
console.log('');
console.log('排查思路:');
console.log('  收到 502 → 检查后端服务是否存活（ps/日志）');
console.log('  收到 504 → 检查后端为什么慢（慢查询/资源/CPU）');
console.log('');

// --------------------------------------------
// 10. 验证测试
// --------------------------------------------
console.log('=== 8. 自动验证测试 ===');
console.log('');

// 验证查询功能
assert.strictEqual(lookup(200).name, 'OK');
assert.strictEqual(lookup(404).category, '4xx');
assert.strictEqual(lookup(999).name, 'Unknown');
console.log('✓ lookup() 查询功能正常');

// 验证类别筛选
assert.strictEqual(findByCategory('2xx').length, 5);
assert.strictEqual(findByCategory('5xx').length, 5);
console.log('✓ findByCategory() 筛选功能正常');

// 验证搜索功能
assert(search('redirect').length >= 2);   // 307 Temporary Redirect, 308 Permanent Redirect
assert(search('gateway').length >= 2);     // 502 Bad Gateway, 504 Gateway Timeout
assert(search('重定向').length >= 2);      // 中文搜索：307, 308 的描述含"重定向"
console.log('✓ search() 搜索功能正常');

// 验证状态码分类
Object.keys(statusCodes).forEach(function (code) {
  var info = statusCodes[code];
  var expectedCategory = String(code)[0] + 'xx';
  assert.strictEqual(info.category, expectedCategory, '状态码 ' + code + ' 的类别应为 ' + expectedCategory);
});
console.log('✓ 所有状态码的类别标注正确');

console.log('');
console.log('=== 总结 ===');
console.log('• 1xx 信息：请求已收到，继续处理');
console.log('• 2xx 成功：请求处理成功（200/201/204/206）');
console.log('• 3xx 重定向：资源搬家了（301/302/304/307/308）');
console.log('• 4xx 客户端错误：你发错了（400/401/403/404/429）');
console.log('• 5xx 服务器错误：我挂了（500/502/503/504）');
console.log('');
console.log('💡 面试高频：401 vs 403、502 vs 504、301 vs 302、幂等性');
`
  }
];
