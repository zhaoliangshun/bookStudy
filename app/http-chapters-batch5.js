// =============================================================
// HTTP 通信教程 —— 第五批章节
// -------------------------------------------------------------
// 实战与工具（20-24章）
//   第 20 章：用 Node.js 搭建 HTTP 服务器
//   第 21 章：HTTP 请求方式——fetch、axios、XMLHttpRequest
//   第 22 章：WebSocket 与 SSE——实时通信方案
//   第 23 章：HTTP 代理、网关与反向代理
//   第 24 章：HTTP 性能优化与最佳实践
// =============================================================

export const chapters = [
  // ============================================================
  // 第二十章：用 Node.js 搭建 HTTP 服务器
  // ============================================================
  {
    id: "http-20",
    group: "实战与工具",
    icon: "🖥️",
    title: "用 Node.js 搭建 HTTP 服务器",
    content: `## 一、为什么这一章重要

学完前面那么多理论，现在该动手了。Node.js 是用 JavaScript 写后端的最佳选择之一，它的 HTTP 模块设计简洁、事件驱动模型天然适合高并发 IO 场景。理解 Node.js 是如何处理一个 HTTP 请求的，能帮你打通从前端到后端的任督二脉——你写的每一个接口、每一个中间件、每一次路由匹配，背后都是这一章讲的机制。

工作中你会遇到这些问题：为什么要用 Express/Koa 而不是裸用 http 模块？中间件到底是怎么"洋葱"起来的？路由是按什么顺序匹配的？为什么有时候响应是乱码（编码问题）？为什么流式响应能省内存？这些问题的答案都藏在"HTTP 服务器是怎么工作的"这一根本问题里。

> 说明：本沙箱环境不暴露 \`http\` 模块，但提供了 \`url\`、\`crypto\`、\`buffer\`、\`querystring\`、\`zlib\` 等工具。所以本章的演示会**手工实现一个迷你 HTTP 服务器**：把请求字符串解析成结构化对象，把响应对象序列化成符合 HTTP 协议的字符串。这套机制和 Node.js 真实的 http 模块原理一致，只是把网络收发换成了字符串处理。

## 二、HTTP 请求与响应的文本格式

HTTP 是文本协议，一行一行地写。理解它的格式是写服务器的第一步。

### 2.1 请求报文结构

\`\`\`text
GET /api/users?limit=10&offset=0 HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0
Accept: application/json
Cookie: sid=abc123; theme=dark

<请求体，GET 通常为空>
\`\`\`

结构拆解：

1. **请求行**：\`方法 路径 HTTP版本\`，比如 \`GET /api/users HTTP/1.1\`
2. **请求头**：每行一个 \`键: 值\`，用空行（CRLF）结束
3. **请求体**：可选，POST/PUT/PATCH 才会有，长度由 \`Content-Length\` 决定

### 2.2 响应报文结构

\`\`\`text
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 27
X-Request-Id: req-001

{"id":1,"name":"alice"}
\`\`\`

结构拆解：

1. **状态行**：\`HTTP版本 状态码 状态描述\`，比如 \`HTTP/1.1 200 OK\`
2. **响应头**：每行一个 \`键: 值\`，用空行结束
3. **响应体**：实际数据，长度由 \`Content-Length\` 决定

**关键细节**：头部和正文之间必须用 \`\\r\\n\\r\\n\`（空行）分隔。漏掉这个空行，浏览器会把响应头当成正文解析，导致页面渲染错乱。

## 三、解析请求字符串

写服务器的第一步是把客户端发来的"一坨文本"解析成结构化对象。核心算法：

1. 用 \`\\r\\n\` 把整段文本拆成行
2. 第一行是请求行，按空格切成 \`method\`、\`url\`、\`version\`
3. 接下来的行直到空行之前都是请求头，按 \`:\` 切成键值对
4. 空行之后的所有内容是请求体

解析 URL 时要用 Node.js 的 \`url\` 模块把 \`pathname\` 和 \`query\` 分开，再用 \`querystring\` 把 query 字符串解析成对象。

## 四、路由（Routing）

路由就是"根据请求的方法和路径，调用对应的处理函数"。最朴素的路由是一个数组，每项是 \`{ method, path, handler }\`，收到请求时遍历数组，第一个匹配的就执行。

\`\`\`javascript
const routes = [
  { method: 'GET',  path: '/api/users', handler: listUsers },
  { method: 'POST', path: '/api/users', handler: createUser },
  { method: 'GET',  path: '/api/users/:id', handler: getUser }
];
\`\`\`

**路径参数**：\`/api/users/:id\` 这种带 \`:\` 的是动态参数，匹配 \`/api/users/123\` 时要把 \`123\` 提取到 \`req.params.id\`。实现方式是把路径模板转成正则。

**匹配优先级**：路由表是按声明顺序匹配的，所以静态路径要写在动态路径前面，否则 \`/api/users/me\` 会被 \`/api/users/:id\` 抢先匹配成 \`{ id: 'me' }\`。

## 五、中间件（Middleware）

中间件是 Express/Koa 的灵魂。它本质是"在路由处理前后插入的预处理函数"，可以做日志、CORS、鉴权、错误处理等通用逻辑。

### 5.1 中间件的签名

\`\`\`javascript
function middleware(req, res, next) {
  // 做一些事
  next();  // 调用下一个中间件
}
\`\`\`

关键在 \`next()\`：调用它表示"我处理完了，交给下一个"。不调用它，请求就停在这里——这是鉴权失败时常用的手段。

### 5.2 洋葱模型

Koa 用的是洋葱模型：中间件像洋葱一样一层套一层，请求进来时从外到内执行 \`next()\` 之前的部分，响应出去时从内到外执行 \`next()\` 之后的部分。

\`\`\`
请求 →  日志  →  鉴权  →  路由处理
响应 ←  日志  ←  鉴权  ←  路由处理
\`\`\`

这样的好处是每一层都能同时看到"请求前"和"响应后"两个时机。比如日志中间件可以记录请求开始时间和响应耗时，错误处理中间件可以用 \`try/catch\` 包住整个流程。

### 5.3 Express 的线性模型 vs Koa 的洋葱模型

Express 中间件是线性的，靠 \`next()\` 串联；Koa 用 \`async/await\` + \`await next()\` 实现洋葱。后者写起来更直观，错误处理更优雅，但理解成本略高。

## 六、请求体解析

POST/PUT 请求会带请求体，最常见的是 JSON 和表单（form-urlencoded）。

- **JSON**：\`Content-Type: application/json\`，body 是 JSON 字符串，用 \`JSON.parse\` 解析
- **表单**：\`Content-Type: application/x-www-form-urlencoded\`，body 是 \`a=1&b=2\` 格式，用 \`querystring.parse\` 解析
- **文件上传**：\`Content-Type: multipart/form-data\`，需要专门的解析器（如 multer）

**安全要点**：永远不要 \`JSON.parse\` 不可信的输入而不 try/catch——格式错误会直接让进程崩溃。

## 七、响应处理

### 7.1 设置状态码和头部

\`\`\`javascript
res.statusCode = 200;
res.setHeader('Content-Type', 'application/json');
\`\`\`

### 7.2 写响应体

响应体是字符串或 Buffer。如果是对象，要 \`JSON.stringify\`；如果是大文件，要用流式写入避免内存爆炸。

### 7.3 Content-Length 的作用

设置 \`Content-Length\` 后客户端能知道响应体什么时候结束，可以正常关闭连接。不设置的话，服务器要么用 \`Transfer-Encoding: chunked\` 分块传输，要么关闭连接表示结束。

## 八、流式响应

对于大文件或动态生成的内容，应该用流（Stream）而不是一次性 \`res.end(data)\`。流式响应的优点：

1. **内存友好**：不需要把整个文件读进内存，分块读取分块发送
2. **TTFB 更短**：客户端更早收到首字节，体验更好
3. **支持背压**：网络慢时反压到读取端，避免内存堆积

在沙箱里我们用 \`stream.Readable\` 模拟流式输出，分块写入响应体。

## 九、错误处理

服务器必须有统一的错误处理，否则一个未捕获的异常会让进程崩溃。常见做法：

1. 路由处理用 \`try/catch\` 包住，捕获后调用 \`next(err)\`
2. 注册一个错误处理中间件（参数是 4 个：\`(err, req, res, next)\`）
3. 根据错误类型返回合适的状态码：400 客户端错误、401 未认证、403 无权限、404 不存在、500 服务器错误

## 十、本章小结

写一个 HTTP 服务器，核心就四件事：**解析请求、匹配路由、调用处理函数、序列化响应**。Express/Koa 这些框架帮你做了上面所有的样板工作，让你专注业务逻辑。但理解底层原理，能让你在排查问题、做性能优化、写自定义中间件时游刃有余。

下面的代码演示了一个完整的迷你 HTTP 服务器：包含请求解析、路由匹配、路径参数、中间件链、JSON/表单 body 解析、错误处理、流式响应。它把"网络收发"替换成"字符串收发"，但内部机制和真实服务器完全一致。`,
    code: `// ============================================================
// 迷你 HTTP 服务器：用字符串模拟网络收发
// 沙箱约束：无 http 模块，但可用 url/querystring/buffer/stream/zlib 等
// ============================================================

const url = require('url');
const querystring = require('querystring');
const { Readable } = require('stream');

// ---------- 1. 模拟用户数据存储 ----------
const users = [
  { id: 1, name: 'alice', age: 28 },
  { id: 2, name: 'bob',   age: 32 }
];
let nextId = 3;

// ---------- 2. 请求解析：把 HTTP 文本解析成结构化对象 ----------
function parseRequest(rawText) {
  // 用 \\r\\n 切分，兼容 \\n
  const lines = rawText.split('\\r\\n');
  // 第一行：方法 路径 版本
  const [method, fullUrl, version] = lines[0].split(' ');
  // 用 url 模块拆出 pathname 和 query
  const parsedUrl = url.parse(fullUrl, true);
  // 收集请求头
  const headers = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') break; // 空行，头部结束
    const idx = line.indexOf(':');
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    headers[key] = val;
  }
  // 空行之后是请求体
  const body = lines.slice(i + 1).join('\\r\\n');
  return {
    method,
    url: fullUrl,
    path: parsedUrl.pathname,
    query: parsedUrl.query,
    version,
    headers,
    body,
    params: {} // 路由匹配时填充
  };
}

// ---------- 3. 响应序列化：把响应对象拼成 HTTP 文本 ----------
function serializeResponse(res) {
  const statusText = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 500: 'Internal Server Error'
  }[res.statusCode] || 'Unknown';
  // 状态行
  let text = 'HTTP/1.1 ' + res.statusCode + ' ' + statusText + '\\r\\n';
  // 响应头
  const headers = res.headers || {};
  // 如果没有显式给 Content-Length，根据 body 计算
  if (headers['Content-Length'] === undefined && res.body !== undefined) {
    const buf = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body);
    headers['Content-Length'] = buf.length;
  }
  for (const k in headers) {
    text += k + ': ' + headers[k] + '\\r\\n';
  }
  // 空行 + 响应体
  text += '\\r\\n';
  if (res.body !== undefined) {
    text += Buffer.isBuffer(res.body) ? res.body.toString() : res.body;
  }
  return text;
}

// ---------- 4. 路由表与路径参数匹配 ----------
const routes = [];

// 把 "/api/users/:id" 转成正则和参数名数组
function compilePath(pathTemplate) {
  const paramNames = [];
  // 把 :name 替换成捕获组 ([^/]+)
  const regexStr = pathTemplate.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  return { regex: new RegExp('^' + regexStr + '$'), paramNames };
}

function addRoute(method, pathTemplate, handler) {
  const compiled = compilePath(pathTemplate);
  routes.push({ method, pathTemplate, handler, ...compiled });
}

// 注册路由
addRoute('GET',    '/api/users',      (req, res) => {
  // 列出所有用户
  res.statusCode = 200;
  res.headers = { 'Content-Type': 'application/json; charset=utf-8' };
  res.body = JSON.stringify({ data: users, total: users.length });
});

addRoute('POST',   '/api/users',      (req, res) => {
  // 创建用户，请求体是 JSON
  try {
    const data = JSON.parse(req.body || '{}');
    if (!data.name) {
      res.statusCode = 400;
      res.headers = { 'Content-Type': 'application/json' };
      res.body = JSON.stringify({ error: 'name 字段必填' });
      return;
    }
    const user = { id: nextId++, name: data.name, age: data.age || 0 };
    users.push(user);
    res.statusCode = 201;
    res.headers = { 'Content-Type': 'application/json', 'Location': '/api/users/' + user.id };
    res.body = JSON.stringify(user);
  } catch (e) {
    res.statusCode = 400;
    res.headers = { 'Content-Type': 'application/json' };
    res.body = JSON.stringify({ error: 'JSON 格式错误' });
  }
});

addRoute('GET',    '/api/users/:id',  (req, res) => {
  // 路径参数 :id 已被填充到 req.params
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);
  if (!user) {
    res.statusCode = 404;
    res.headers = { 'Content-Type': 'application/json' };
    res.body = JSON.stringify({ error: '用户不存在' });
    return;
  }
  res.statusCode = 200;
  res.headers = { 'Content-Type': 'application/json; charset=utf-8' };
  res.body = JSON.stringify(user);
});

addRoute('GET',    '/health',         (req, res) => {
  res.statusCode = 200;
  res.headers = { 'Content-Type': 'application/json' };
  res.body = JSON.stringify({ status: 'ok', uptime: process.uptime() });
});

// ---------- 5. 中间件系统（洋葱模型简化版） ----------
const middlewares = [];

function use(mw) { middlewares.push(mw); }

// 日志中间件
use((req, res, next) => {
  req._startTime = Date.now();
  console.log('[日志] 收到请求: ' + req.method + ' ' + req.path);
  next();
});

// CORS 中间件
use((req, res, next) => {
  res.headers = res.headers || {};
  res.headers['Access-Control-Allow-Origin'] = '*';
  res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';
  next();
});

// 请求体解析中间件：根据 Content-Type 选择解析器
use((req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (req.body) {
    if (ct.includes('application/json')) {
      try { req.body = JSON.parse(req.body); } catch (e) { /* 留给路由处理 */ }
    } else if (ct.includes('urlencoded')) {
      req.body = querystring.parse(req.body);
    }
  }
  next();
});

// ---------- 6. 路由匹配 ----------
function matchRoute(req) {
  for (const route of routes) {
    if (route.method !== req.method) continue;
    const m = route.regex.exec(req.path);
    if (!m) continue;
    // 填充路径参数
    route.paramNames.forEach((name, idx) => {
      req.params[name] = decodeURIComponent(m[idx + 1]);
    });
    return route;
  }
  return null;
}

// ---------- 7. 请求处理主函数：组合中间件 + 路由 ----------
function handleRequest(rawText) {
  const req = parseRequest(rawText);
  const res = { statusCode: 200, headers: {}, body: '' };

  // 构建中间件链，最后一环是路由分发
  const dispatch = (idx) => {
    if (idx < middlewares.length) {
      middlewares[idx](req, res, () => dispatch(idx + 1));
    } else {
      // 中间件跑完，进入路由
      const route = matchRoute(req);
      if (route) {
        try {
          route.handler(req, res);
        } catch (err) {
          console.error('[错误] 路由处理异常: ' + err.message);
          res.statusCode = 500;
          res.headers = { 'Content-Type': 'application/json' };
          res.body = JSON.stringify({ error: '服务器内部错误' });
        }
      } else {
        res.statusCode = 404;
        res.headers = { 'Content-Type': 'application/json' };
        res.body = JSON.stringify({ error: '路由不存在: ' + req.method + ' ' + req.path });
      }
    }
  };
  dispatch(0);

  // 记录耗时
  const cost = Date.now() - req._startTime;
  console.log('[日志] 响应: ' + res.statusCode + ' 耗时 ' + cost + 'ms');
  return serializeResponse(res);
}

// ---------- 8. 流式响应演示：用 Readable 模拟分块输出 ----------
function streamResponse() {
  console.log('\\n=== 流式响应演示（分块发送大文本） ===');
  // 模拟一个大数据源
  const chunks = ['第一块数据\\n', '第二块数据\\n', '第三块数据\\n', '结束'];
  const readable = Readable.from(chunks);
  // 收集所有分块
  const parts = [];
  readable.on('data', (chunk) => {
    parts.push(chunk.toString());
    console.log('收到分块: ' + chunk.toString().trim());
  });
  readable.on('end', () => {
    const full = parts.join('');
    console.log('流结束，总长度: ' + full.length + ' 字节');
  });
}

// ---------- 9. 运行测试：模拟多个请求 ----------
console.log('========== 迷你 HTTP 服务器演示 ==========');

// 测试 1：列出用户
console.log('\\n--- 测试 1: GET /api/users ---');
const req1 = 'GET /api/users HTTP/1.1\\r\\nHost: localhost:3000\\r\\nAccept: application/json\\r\\n\\r\\n';
console.log(handleRequest(req1));

// 测试 2：创建用户
console.log('\\n--- 测试 2: POST /api/users ---');
const req2Body = JSON.stringify({ name: 'charlie', age: 25 });
const req2 = 'POST /api/users HTTP/1.1\\r\\nHost: localhost:3000\\r\\nContent-Type: application/json\\r\\nContent-Length: ' + Buffer.byteLength(req2Body) + '\\r\\n\\r\\n' + req2Body;
console.log(handleRequest(req2));

// 测试 3：获取单个用户
console.log('\\n--- 测试 3: GET /api/users/1 ---');
const req3 = 'GET /api/users/1 HTTP/1.1\\r\\nHost: localhost:3000\\r\\n\\r\\n';
console.log(handleRequest(req3));

// 测试 4：404 路由不存在
console.log('\\n--- 测试 4: DELETE /api/unknown ---');
const req4 = 'DELETE /api/unknown HTTP/1.1\\r\\nHost: localhost:3000\\r\\n\\r\\n';
console.log(handleRequest(req4));

// 测试 5：表单提交
console.log('\\n--- 测试 5: POST /api/users （表单格式） ---');
const formBody = 'name=dave&age=40';
const req5 = 'POST /api/users HTTP/1.1\\r\\nHost: localhost:3000\\r\\nContent-Type: application/x-www-form-urlencoded\\r\\nContent-Length: ' + formBody.length + '\\r\\n\\r\\n' + formBody;
console.log(handleRequest(req5));

// 测试 6：健康检查
console.log('\\n--- 测试 6: GET /health ---');
const req6 = 'GET /health HTTP/1.1\\r\\nHost: localhost:3000\\r\\n\\r\\n';
console.log(handleRequest(req6));

// 测试 7：流式响应
streamResponse();
`
  },

  // ============================================================
  // 第二十一章：HTTP 请求方式——fetch、axios、XMLHttpRequest
  // ============================================================
  {
    id: "http-21",
    group: "实战与工具",
    icon: "📡",
    title: "HTTP 请求方式——fetch、axios、XMLHttpRequest",
    content: `## 一、为什么这一章重要

前端发请求这件事，从早期的 XMLHttpRequest，到 jQuery 的 \`$.ajax\`，到现代的 fetch、axios，每一次演进都是为了解决上一代的痛点。理解这三代方案的设计差异，你才能在不同场景下做对选择：是要原生无依赖、还是要取消请求、要拦截器、还是要更好的错误处理。

工作中真正高频出现的问题都和这一章有关：为什么 fetch 不会因为 404 reject？axios 的拦截器怎么写？怎么取消一个已经发出的请求？怎么处理超时？怎么自动重试？上传进度怎么监听？这些都对应着不同 API 的特定能力。

> 沙箱没有浏览器和真实的 http 模块，所以本章会**用 Promise 手写一个 fetch 风格的请求库**，模拟底层收发，让你看清 fetch 的设计哲学。同时用同样的思路模拟 axios 的拦截器机制。

## 二、XMLHttpRequest：第一代方案

\`XMLHttpRequest\`（XHR）是 1999 年随 IE5 提出的老牌 API，它的设计带有浓重的"事件回调"风格。jQuery 的 \`$.ajax\` 就是它的封装。

### 2.1 XHR 的基本用法

\`\`\`javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users', true);  // true 表示异步
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {  // 4 = DONE
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    }
  }
};
xhr.send();
\`\`\`

\`readyState\` 五个值：0 未初始化、1 已 open、2 已收到响应头、3 正在接收响应体、4 完成。

### 2.2 XHR 的痛点

1. **回调地狱**：嵌套请求时代码层层缩进
2. **API 设计反人类**：事件 + 状态机混合，取消要用 \`abort()\`，超时要手动 setTimeout
3. **基于事件而非 Promise**：和现代 async/await 体系格格格不入
4. **流式支持差**：虽然可以监听 \`onprogress\`，但流式上传几乎没法用

XHR 至今还存在的唯一理由是**兼容性**——某些老项目、某些上传场景（带进度的文件上传）还得用它。

## 三、fetch：现代浏览器原生方案

fetch 是 2015 年随 ES6 推出的现代 API，基于 Promise 设计，是 W3C 标准。

### 3.1 基本用法

\`\`\`javascript
fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

用 async/await 写更清爽：

\`\`\`javascript
const res = await fetch('/api/users');
const data = await res.json();
\`\`\`

### 3.2 fetch 的关键设计点

**1. 不会因为 4xx/5xx 而 reject**

这是 fetch 最反直觉的设计：HTTP 状态码是 404 或 500 时，fetch 的 Promise **仍然 resolve**，只有网络错误才 reject。要判断业务是否成功，必须检查 \`res.ok\`：

\`\`\`javascript
const res = await fetch('/api/users');
if (!res.ok) {
  throw new Error('请求失败: ' + res.status);
}
\`\`\`

理由：HTTP 状态码是应用层语义，服务器"成功返回了一个 404 响应"本身在网络层是成功的。

**2. 响应是流**

\`res.body\` 是一个 ReadableStream，所以你只能消费一次。要重复读，必须 \`res.clone()\`：

\`\`\`javascript
const res1 = await fetch('/api/users');
const res2 = res1.clone();  // 克隆一份
const data1 = await res1.json();
const data2 = await res2.text();
\`\`\`

**3. 默认不带 Cookie**

fetch 默认不会发送 Cookie，要显式设置 \`credentials: 'include'\`。这和 XHR 默认带 Cookie 完全相反，是新手最容易踩的坑。

**4. 取消请求用 AbortController**

\`\`\`javascript
const controller = new AbortController();
fetch('/api/users', { signal: controller.signal });
controller.abort();  // 取消
\`\`\`

### 3.3 fetch 的优缺点

**优点**：原生、Promise、流式响应、跨域可控、体积小
**缺点**：不自动 JSON、不拦截器、超时要手动、错误处理啰嗦

## 四、axios：社区主流库

axios 是目前最流行的 HTTP 客户端库，浏览器和 Node.js 都能用。它弥补了 fetch 的所有痛点。

### 4.1 基本用法

\`\`\`javascript
import axios from 'axios';
const { data } = await axios.get('/api/users');
\`\`\`

### 4.2 axios 相比 fetch 的优势

**1. 自动 JSON 转换**：请求时自动 \`JSON.stringify\`，响应时自动 \`JSON.parse\`
**2. 拦截器**：请求/响应拦截，统一加 token、统一错误处理

\`\`\`javascript
axios.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer ' + getToken();
  return config;
});
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response.status === 401) {
      router.push('/login');
    }
    return Promise.reject(err);
  }
);
\`\`\`

**3. 4xx/5xx 自动 reject**：状态码非 2xx 时 Promise reject
**4. 超时内置**：\`timeout: 5000\` 直接生效
**5. 取消请求**：早期用 CancelToken，新版也支持 AbortController
**6. 转换器**：可以自定义请求/响应数据的转换函数

### 4.3 axios 的核心实现思路

axios 内部维护一个请求队列，请求发出前依次过请求拦截器（后注册的先执行），响应回来后依次过响应拦截器（先注册的先执行），形成"洋葱"结构。这就是为什么它叫"拦截器"——能在请求链路上插入任意逻辑。

## 五、超时处理

- **XHR**：\`xhr.timeout = 5000; xhr.ontimeout = ...\`
- **fetch**：用 \`Promise.race\` 配合 \`setTimeout\`，或用 \`AbortSignal.timeout(5000)\`
- **axios**：\`timeout: 5000\` 一行搞定

## 六、重试机制

网络不稳定时，重试能显著提高成功率。常见策略：

1. **固定重试**：失败后立即重试 N 次
2. **指数退避**：每次等待时间翻倍，避免雪崩：\`delay = base * 2^attempt\`
3. **抖动**：在指数退避基础上加随机量，避免多个客户端同步重试

## 七、对比与选型

| 特性 | XMLHttpRequest | fetch | axios |
|------|---------------|-------|-------|
| API 风格 | 回调 | Promise | Promise |
| 自动 JSON | 否 | 否 | 是 |
| 拦截器 | 否 | 否 | 是 |
| 4xx reject | 是 | 否 | 是 |
| 超时 | 内置 | 手动 | 内置 |
| 取消 | abort() | AbortController | AbortController/CancelToken |
| 流式响应 | 差 | 好 | 一般 |
| 体积 | 0（原生） | 0（原生） | ~12KB |

选型建议：新项目用 fetch + 自封装（极简）或直接用 axios（功能全）；老项目维持 XHR；Node.js 服务端推荐 axios 或 undici。

## 八、本章小结

三代 API 背后是同一套 HTTP 协议，差别只在"封装的便利程度"。理解了 Promise、拦截器、AbortController 这几个核心概念，你就掌握了现代 HTTP 客户端的全部精髓。下面的代码会手写一个迷你 fetch 和一个带拦截器的 axios 风格库，让你看清它们是怎么"包装"底层请求的。`,
    code: `// ============================================================
// 手写迷你 fetch 和 axios：理解现代 HTTP 客户端的设计
// 沙箱无 http 模块，用本地模拟的"传输层"演示
// ============================================================

const { URL } = require('url');
const querystring = require('querystring');

// ---------- 1. 模拟底层传输层 ----------
// 真实环境里这里是网络收发，这里用一个"路由表"模拟
const mockBackend = {
  '/api/users': {
    GET: () => ({ status: 200, body: JSON.stringify([{ id: 1, name: 'alice' }]), headers: { 'content-type': 'application/json' } }),
    POST: (body) => ({ status: 201, body: JSON.stringify({ id: 99, ...body }), headers: { 'content-type': 'application/json' } })
  },
  '/api/error': {
    GET: () => ({ status: 500, body: JSON.stringify({ error: '服务器内部错误' }), headers: {} })
  },
  '/api/notfound': {
    GET: () => ({ status: 404, body: 'Not Found', headers: {} })
  }
};

function mockTransport(method, urlStr, body, options) {
  // 模拟网络延迟
  const delay = options && options._delay || 10;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟取消
      if (options && options.signal && options.signal.aborted) {
        reject(new Error('请求被取消'));
        return;
      }
      // 模拟超时
      if (options && options._forceTimeout) {
        reject(new Error('网络超时'));
        return;
      }
      let parsed;
      try { parsed = new URL(urlStr); } catch (e) {
        reject(new Error('URL 格式错误: ' + urlStr));
        return;
      }
      const pathname = parsed.pathname;
      const route = mockBackend[pathname];
      if (!route) {
        resolve({ status: 404, body: 'Not Found', headers: {} });
        return;
      }
      const handler = route[method];
      if (!handler) {
        resolve({ status: 405, body: 'Method Not Allowed', headers: {} });
        return;
      }
      let parsedBody = null;
      if (body) {
        try { parsedBody = JSON.parse(body); } catch (e) { parsedBody = querystring.parse(body); }
      }
      const result = handler(parsedBody);
      resolve(result);
    }, delay);
  });
}

// ---------- 2. 手写 fetch（Promise 风格，不因 4xx/5xx reject） ----------
class FetchResponse {
  constructor(raw) {
    this.status = raw.status;
    this.ok = raw.status >= 200 && raw.status < 300;
    this.headers = raw.headers || {};
    this._body = raw.body;
  }
  // 文本形式
  async text() { return String(this._body); }
  // JSON 形式
  async json() { return JSON.parse(this._body); }
  // 克隆（流式响应只能消费一次，所以要克隆）
  clone() {
    return new FetchResponse({ status: this.status, body: this._body, headers: this.headers });
  }
}

function myFetch(urlStr, options) {
  options = options || {};
  const method = (options.method || 'GET').toUpperCase();
  let body = options.body;
  // 自动 JSON 序列化
  if (body && typeof body === 'object' && !(typeof body === 'string')) {
    body = JSON.stringify(body);
    options.headers = options.headers || {};
    options.headers['content-type'] = 'application/json';
  }
  // 返回 Promise：注意 4xx/5xx 也 resolve（fetch 的设计）
  return mockTransport(method, urlStr, body, options).then(raw => new FetchResponse(raw));
}

// ---------- 3. AbortController 模拟 ----------
class MyAbortController {
  constructor() {
    this.signal = { aborted: false, _listeners: [] };
  }
  abort() {
    this.signal.aborted = true;
    this.signal._listeners.forEach(fn => fn());
  }
}

// ---------- 4. 测试 fetch ----------
console.log('========== fetch 演示 ==========');

(async () => {
  // 测试 1：GET 请求
  console.log('\\n--- 测试 1: fetch GET /api/users ---');
  const res1 = await myFetch('http://localhost/api/users');
  console.log('status:', res1.status, 'ok:', res1.ok);
  const data1 = await res1.json();
  console.log('响应数据:', data1);

  // 测试 2：POST 请求
  console.log('\\n--- 测试 2: fetch POST /api/users ---');
  const res2 = await myFetch('http://localhost/api/users', {
    method: 'POST',
    body: { name: 'bob', age: 20 }
  });
  console.log('status:', res2.status);
  console.log('响应数据:', await res2.json());

  // 测试 3：404 不 reject
  console.log('\\n--- 测试 3: fetch GET /api/notfound （404 仍 resolve） ---');
  const res3 = await myFetch('http://localhost/api/notfound');
  console.log('status:', res3.status, 'ok:', res3.ok);
  console.log('注意：fetch 没有 reject，要手动检查 res.ok');

  // 测试 4：取消请求
  console.log('\\n--- 测试 4: 用 AbortController 取消请求 ---');
  const controller = new MyAbortController();
  const fetchPromise = myFetch('http://localhost/api/users', { signal: controller.signal, _delay: 100 });
  controller.abort();
  try {
    await fetchPromise;
  } catch (err) {
    console.log('已捕获取消错误:', err.message);
  }

  // 测试 5：超时模拟
  console.log('\\n--- 测试 5: fetch 超时 ---');
  try {
    await myFetch('http://localhost/api/users', { _forceTimeout: true });
  } catch (err) {
    console.log('已捕获超时错误:', err.message);
  }

  // 测试 6：克隆响应
  console.log('\\n--- 测试 6: clone 响应后可重复读 ---');
  const res6 = await myFetch('http://localhost/api/users');
  const res6b = res6.clone();
  console.log('第一次 json:', await res6.json());
  console.log('第二次 text:', await res6b.text());

  // 测试 axios
  console.log('\\n========== axios 演示 ==========');
  await testAxios();
})();

// ---------- 5. 手写 axios 风格库（带拦截器，4xx/5xx 自动 reject） ----------
function createAxios() {
  // 拦截器栈：请求拦截器（后注册先执行）、响应拦截器（先注册先执行）
  const requestInterceptors = [];
  const responseInterceptors = [];

  const instance = function (config) {
    // 复制一份配置，依次过请求拦截器
    let cfg = Object.assign({}, config);
    // 请求拦截器：后注册的先执行（栈结构）
    const reqChain = requestInterceptors.slice().reverse();
    for (const interceptor of reqChain) {
      cfg = interceptor.fulfilled(cfg) || cfg;
    }
    // 发起请求
    const method = (cfg.method || 'GET').toUpperCase();
    const url = cfg.url;
    let body = cfg.data;
    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
      cfg.headers = cfg.headers || {};
      cfg.headers['content-type'] = 'application/json';
    }
    // 超时控制
    const timeout = cfg.timeout || 0;
    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
      if (timeout > 0) {
        timer = setTimeout(() => reject(new Error('timeout of ' + timeout + 'ms exceeded')), timeout);
      }
    });
    const reqPromise = mockTransport(method, url, body, {}).then(raw => {
      // 响应拦截器
      let res = { status: raw.status, data: raw.body, headers: raw.headers, config: cfg };
      // 自动 JSON 解析
      if (raw.headers && raw.headers['content-type'] && raw.headers['content-type'].includes('application/json')) {
        try { res.data = JSON.parse(raw.body); } catch (e) {}
      }
      for (const interceptor of responseInterceptors) {
        res = interceptor.fulfilled(res) || res;
      }
      // 关键：4xx/5xx 直接 reject（和 fetch 不同）
      if (res.status >= 400) {
        const err = new Error('Request failed with status code ' + res.status);
        err.response = res;
        throw err;
      }
      return res;
    }, err => {
      // 错误也过拦截器
      for (const interceptor of responseInterceptors) {
        if (interceptor.rejected) err = interceptor.rejected(err) || err;
      }
      throw err;
    });
    // 用 Promise.race 实现超时
    if (timeout > 0) {
      return Promise.race([reqPromise, timeoutPromise]).finally(() => clearTimeout(timer));
    }
    return reqPromise;
  };

  // 快捷方法
  instance.get = (url, config) => instance(Object.assign({ method: 'GET', url }, config));
  instance.post = (url, data, config) => instance(Object.assign({ method: 'POST', url, data }, config));

  // 注册拦截器
  instance.interceptors = {
    request: {
      use: (fulfilled) => requestInterceptors.push({ fulfilled })
    },
    response: {
      use: (fulfilled, rejected) => responseInterceptors.push({ fulfilled, rejected })
    }
  };
  return instance;
}

// ---------- 6. 测试 axios ----------
async function testAxios() {
  const axios = createAxios();

  // 请求拦截器：自动加 token
  let tokenValue = 'test-token-abc';
  axios.interceptors.request.use(config => {
    config.headers = config.headers || {};
    config.headers.Authorization = 'Bearer ' + tokenValue;
    console.log('[请求拦截器] 已附加 Authorization 头');
    return config;
  });

  // 响应拦截器：401 跳登录
  axios.interceptors.response.use(
    res => { console.log('[响应拦截器] 收到 ' + res.status + ' 响应'); return res; },
    err => {
      console.log('[响应拦截器] 错误: ' + err.message);
      if (err.response && err.response.status === 401) {
        console.log('[响应拦截器] 检测到 401，应跳转登录页');
      }
      return Promise.reject(err);
    }
  );

  // 测试 1：GET
  console.log('\\n--- 测试 1: axios.get ---');
  const r1 = await axios.get('http://localhost/api/users');
  console.log('响应数据:', r1.data);

  // 测试 2：POST
  console.log('\\n--- 测试 2: axios.post ---');
  const r2 = await axios.post('http://localhost/api/users', { name: 'charlie' });
  console.log('响应数据:', r2.data);

  // 测试 3：500 错误会 reject
  console.log('\\n--- 测试 3: axios.get /api/error （500 自动 reject） ---');
  try {
    await axios.get('http://localhost/api/error');
  } catch (err) {
    console.log('已捕获错误:', err.message, '状态码:', err.response.status);
  }

  // 测试 4：超时
  console.log('\\n--- 测试 4: axios 超时 ---');
  try {
    await axios.get('http://localhost/api/users', { timeout: 1 });
  } catch (err) {
    console.log('已捕获超时:', err.message);
  }
}
`
  },

  // ============================================================
  // 第二十二章：WebSocket 与 SSE——实时通信方案
  // ============================================================
  {
    id: "http-22",
    group: "实战与工具",
    icon: "🔄",
    title: "WebSocket 与 SSE——实时通信方案",
    content: `## 一、为什么这一章重要

传统的 HTTP 是"请求-响应"模式——客户端不问，服务器就不答。但很多场景需要服务器主动推送：聊天消息、股票行情、在线协作、实时通知、日志流。这就催生了实时通信方案：轮询、长轮询、SSE、WebSocket。理解它们的差异和适用场景，是设计实时系统的第一步。

工作中遇到的问题都和这一章有关：为什么聊天室用 WebSocket 而不用 SSE？为什么股票行情用 SSE 更划算？WebSocket 怎么做心跳保活？SSE 断线了怎么自动重连？这些问题的答案都在"协议设计"里。

> 沙箱不能开真实网络，所以本章会**手工构造 WebSocket 帧和 SSE 数据流**，让你看清这两种协议的"字节级"格式。

## 二、为什么需要实时通信

HTTP 的"请求-响应"模型对实时场景很不友好：

1. **服务器无法主动推送**：客户端不发请求，服务器就推不了数据
2. **每次请求开销大**：要建 TCP 连接、发 HTTP 头，对低延迟场景是浪费
3. **状态维护困难**：HTTP 无状态，每次请求都要带身份信息

实时场景的需求：低延迟、双向、长连接、低开销。这就催生了几种方案。

## 三、轮询与长轮询

### 3.1 短轮询（Polling）

最朴素的方案：客户端每隔 N 秒发一次 HTTP 请求问"有新消息吗"。简单粗暴，但有几个问题：

- 大部分请求是"空轮询"（没新消息），浪费带宽和服务器资源
- 实时性取决于轮询间隔，间隔短了压力大，长了延迟高
- 每次请求都要带 HTTP 头，开销大

\`\`\`
客户端：有新消息吗？  服务器：没有
客户端：有新消息吗？  服务器：没有
客户端：有新消息吗？  服务器：有！给你
\`\`\`

适用场景：消息频率低、实时性要求不高、客户端数量少。

### 3.2 长轮询（Long Polling）

改进：客户端发请求，服务器**没有新消息时 hold 住连接**，直到有消息或超时才返回。客户端收到响应后立即发下一个请求。

\`\`\`
客户端：有新消息吗？  服务器：（hold 30 秒）... 有！给你
客户端：有新消息吗？  服务器：（hold 30 秒）... 超时，没有
客户端：有新消息吗？  ...
\`\`\`

优点：比短轮询省请求、实时性更好。
缺点：每个消息还是要建 HTTP 请求，开销仍然大；服务器 hold 连接占资源。

代表实现：早期的 Facebook Chat、微信网页版。

## 四、SSE（Server-Sent Events）

SSE 是 HTML5 标准，基于 HTTP 实现**服务器单向推送**。

### 4.1 SSE 的协议格式

SSE 用一个普通的 HTTP 请求，服务器响应 \`Content-Type: text/event-stream\`，然后用特定格式持续推送数据：

\`\`\`text
data: 第一条消息\\n\\n
data: 第二条消息\\n\\n
event: notice\\n
data: 这是一条通知\\n\\n
id: 100\\n
data: 带 id 的消息\\n\\n
\`\`\`

关键规则：

1. 每条消息以 \`\\n\\n\` 结束（两个换行表示一条消息结束）
2. \`data:\` 是数据字段，多个 \`data:\` 会被拼接
3. \`event:\` 指定事件类型，客户端可以按类型监听
4. \`id:\` 给消息编号，断线重连时客户端会带 \`Last-Event-ID\` 头，服务器可以续传
5. \`retry:\` 告诉客户端重连间隔（毫秒）

### 4.2 SSE 的特点

- **单向**：只能服务器→客户端，客户端要发消息得另开 HTTP 请求
- **基于 HTTP**：穿透防火墙、走 CDN、用 Nginx 都没问题
- **自动重连**：浏览器原生支持断线重连，并续传 \`Last-Event-ID\`
- **文本协议**：只能传 UTF-8 文本，不能传二进制
- **连接数限制**：HTTP/1.1 同源最多 6 个连接（HTTP/2 没这限制）

### 4.3 SSE 的客户端 API

\`\`\`javascript
const es = new EventSource('/api/stream');
es.onmessage = e => console.log(e.data);
es.addEventListener('notice', e => console.log('通知:', e.data));
es.onerror = e => console.log('出错，浏览器会自动重连');
\`\`\`

## 五、WebSocket

WebSocket 是 HTML5 标准的全双工通信协议，基于 TCP 但有自己的握手和帧格式。

### 5.1 协议升级握手

WebSocket 复用 HTTP 端口（80/443），但通过一个 HTTP 升级请求切换协议：

\`\`\`text
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
\`\`\`

服务器响应：

\`\`\`text
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

\`Sec-WebSocket-Accept\` 的计算方式：把客户端的 Key 拼上一个固定魔数 \`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\`，做 SHA-1，再 Base64。这个握手确保双方都理解 WebSocket 协议。

101 状态码表示协议切换成功，之后这条 TCP 连接就不再是 HTTP 了，而是 WebSocket。

### 5.2 帧格式

WebSocket 通信的最小单位是"帧"（frame）。帧格式（简化版）：

\`\`\`
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| payload len |    extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
\`\`\`

关键字段：

- **FIN**：1 表示这是消息的最后一个分片
- **opcode**：0x1 文本帧、0x2 二进制帧、0x8 关闭、0x9 ping、0xA pong
- **MASK**：客户端发往服务器的帧必须掩码，服务器发客户端的不掩码
- **payload len**：0-125 直接是长度；126 表示后 2 字节是长度；127 表示后 8 字节是长度
- **Masking-key**：32 位掩码密钥，用异或算法解码 payload

### 5.3 心跳保活

WebSocket 长连接可能因为中间设备（NAT、代理）超时而断开，所以需要心跳：

- **Ping/Pong 帧**：协议内置，一方发 Ping，另一方必须回 Pong
- 通常 30 秒发一次 Ping，超过 60 秒没收到 Pong 就认为连接断了

### 5.4 WebSocket 的特点

- **全双工**：服务器和客户端可以随时互发消息
- **二进制支持**：可以传图片、视频、文件
- **低开销**：握手后帧头只有 2-14 字节，远比 HTTP 头小
- **无同源限制**：默认不强制 CORS，但要自己处理鉴权
- **需要服务器支持**：Nginx、负载均衡都要专门配置 WebSocket 转发

## 六、三种方案对比

| 特性 | 短轮询 | 长轮询 | SSE | WebSocket |
|------|--------|--------|-----|-----------|
| 通信方向 | 单向 | 单向 | 单向（服务端→客户端） | 全双工 |
| 协议 | HTTP | HTTP | HTTP | WebSocket |
| 实时性 | 差（秒级） | 中（亚秒级） | 好（毫秒级） | 好（毫秒级） |
| 开销 | 大 | 中 | 小 | 最小 |
| 二进制 | 支持 | 支持 | 不支持 | 支持 |
| 自动重连 | 无 | 无 | 内置 | 需自己实现 |
| 复杂度 | 极低 | 低 | 低 | 中 |
| 连接数限制 | 无 | 无 | HTTP/1.1 限制 6 个 | 无 |

### 选型建议

- **消息推送、股票行情、日志流**：SSE（单向、自动重连、用 HTTP 基础设施）
- **聊天室、协作编辑、游戏**：WebSocket（全双工、低延迟）
- **低频通知、兼容性要求高**：长轮询
- **老旧系统、量很小**：短轮询

## 七、本章小结

实时通信的核心矛盾是"HTTP 是请求-响应的，但实时场景需要服务器主动推"。SSE 用 HTTP 长连接 + 文本流解决了单向推送；WebSocket 用协议升级 + 帧格式解决了全双工。两者各有适用场景，没有谁取代谁。下面的代码会手工构造 WebSocket 帧和 SSE 数据流，让你看清这两种协议的字节级实现。`,
    code: `// ============================================================
// 手写 WebSocket 帧编解码 + SSE 数据流
// 沙箱无 net/ws 模块，用 Buffer 手工构造协议帧
// ============================================================

const crypto = require('crypto');

// ============================================================
// 第一部分：WebSocket 握手与帧编解码
// ============================================================

// ---------- 1. 握手：计算 Sec-WebSocket-Accept ----------
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function computeAcceptKey(clientKey) {
  // 规则：clientKey + 魔数 -> SHA-1 -> Base64
  const sha1 = crypto.createHash('sha1');
  sha1.update(clientKey + WS_MAGIC);
  return sha1.digest('base64');
}

function simulateHandshake() {
  console.log('========== WebSocket 握手演示 ==========');
  // 客户端发的 Key（24 字符的 Base64）
  const clientKey = 'dGhlIHNhbXBsZSBub25jZQ==';
  console.log('客户端 Sec-WebSocket-Key:', clientKey);
  const acceptKey = computeAcceptKey(clientKey);
  console.log('服务器 Sec-WebSocket-Accept:', acceptKey);

  // 验证：标准 RFC 6455 给出的示例值
  const expected = 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=';
  console.log('与 RFC 标准值一致:', acceptKey === expected);

  // 构造完整的握手响应
  const response = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Accept: ' + acceptKey,
    '',
    ''
  ].join('\\r\\n');
  console.log('\\n握手响应:\\n' + response);
}

// ---------- 2. WebSocket 帧编码（服务器→客户端，不掩码） ----------
function encodeWsFrame(payload, opcode) {
  opcode = opcode === undefined ? 0x1 : opcode; // 默认文本帧
  const payloadBuf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
  const len = payloadBuf.length;
  let header;
  if (len < 126) {
    // 头部 2 字节：FIN+opcode + 长度
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode; // FIN=1
    header[1] = len;
  } else if (len < 65536) {
    // 头部 4 字节：FIN+opcode + 126 + 2 字节长度
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    // 头部 10 字节：FIN+opcode + 127 + 8 字节长度
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeUInt32BE(0, 2); // 高 32 位
    header.writeUInt32BE(len, 6); // 低 32 位
  }
  return Buffer.concat([header, payloadBuf]);
}

// ---------- 3. WebSocket 帧解码（客户端→服务器，需要掩码） ----------
function decodeWsFrame(buf) {
  if (buf.length < 2) return null;
  const b0 = buf[0];
  const b1 = buf[1];
  const fin = (b0 & 0x80) !== 0;
  const opcode = b0 & 0x0F;
  const masked = (b1 & 0x80) !== 0;
  let payloadLen = b1 & 0x7F;
  let offset = 2;
  // 扩展长度
  if (payloadLen === 126) {
    payloadLen = buf.readUInt16BE(offset);
    offset += 2;
  } else if (payloadLen === 127) {
    // 64 位长度，JS 只能处理 2^53，读高 32 位为 0 的情况
    const high = buf.readUInt32BE(offset);
    const low = buf.readUInt32BE(offset + 4);
    payloadLen = high * 0x100000000 + low;
    offset += 8;
  }
  // 掩码密钥
  let maskingKey = null;
  if (masked) {
    maskingKey = buf.slice(offset, offset + 4);
    offset += 4;
  }
  // 解析负载
  let payload = buf.slice(offset, offset + payloadLen);
  // 客户端发的帧要解掩码：每字节与 maskingKey[i % 4] 异或
  if (masked) {
    const unmasked = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) {
      unmasked[i] = payload[i] ^ maskingKey[i % 4];
    }
    payload = unmasked;
  }
  return { fin, opcode, masked, payloadLen, payload };
}

// ---------- 4. 客户端发送带掩码的帧 ----------
function encodeMaskedFrame(payload, opcode) {
  opcode = opcode === undefined ? 0x1 : opcode;
  const payloadBuf = Buffer.from(payload, 'utf8');
  const len = payloadBuf.length;
  // 客户端必须掩码，所以头部多 4 字节 masking-key
  const maskingKey = crypto.randomBytes(4);
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | len; // MASK=1
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 127;
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(len, 6);
  }
  // 对 payload 做掩码
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) {
    masked[i] = payloadBuf[i] ^ maskingKey[i % 4];
  }
  return Buffer.concat([header, maskingKey, masked]);
}

// ---------- 5. 心跳帧：Ping / Pong ----------
function makePingFrame() { return encodeWsFrame('', 0x9); }
function makePongFrame() { return encodeWsFrame('', 0xA); }
function makeCloseFrame() { return encodeWsFrame('', 0x8); }

// ---------- 6. 模拟一次 WebSocket 通信 ----------
function demoWebSocket() {
  console.log('\\n========== WebSocket 帧通信演示 ==========');

  // 场景 1：服务器发文本消息（不掩码）
  console.log('\\n--- 场景 1: 服务器发文本 "Hello WebSocket" ---');
  const serverFrame = encodeWsFrame('Hello WebSocket');
  console.log('帧字节（hex）:', serverFrame.toString('hex'));
  const decoded1 = decodeWsFrame(serverFrame);
  console.log('解码: opcode=' + decoded1.opcode + ' 文本="' + decoded1.payload.toString() + '"');

  // 场景 2：客户端发文本消息（带掩码）
  console.log('\\n--- 场景 2: 客户端发文本 "Hi Server" ---');
  const clientFrame = encodeMaskedFrame('Hi Server');
  console.log('帧字节（hex）:', clientFrame.toString('hex'));
  const decoded2 = decodeWsFrame(clientFrame);
  console.log('解码: opcode=' + decoded2.opcode + ' 掩码=' + decoded2.masked + ' 文本="' + decoded2.payload.toString() + '"');

  // 场景 3：长消息（触发 126 扩展长度）
  console.log('\\n--- 场景 3: 发送 200 字节长消息 ---');
  const longMsg = 'A'.repeat(200);
  const longFrame = encodeWsFrame(longMsg);
  console.log('帧总长度:', longFrame.length, '字节');
  const decoded3 = decodeWsFrame(longFrame);
  console.log('解码: payloadLen=' + decoded3.payloadLen + ' 实际长度=' + decoded3.payload.length);

  // 场景 4：心跳
  console.log('\\n--- 场景 4: 心跳 Ping/Pong ---');
  const ping = makePingFrame();
  console.log('Ping 帧 hex:', ping.toString('hex'));
  const pong = makePongFrame();
  console.log('Pong 帧 hex:', pong.toString('hex'));
  const decodedPing = decodeWsFrame(ping);
  console.log('解码 Ping: opcode=' + decodedPing.opcode + ' (0x9=Ping)');

  // 场景 5：关闭帧
  console.log('\\n--- 场景 5: 关闭帧 ---');
  const close = makeCloseFrame();
  const decodedClose = decodeWsFrame(close);
  console.log('关闭帧 opcode=' + decodedClose.opcode + ' (0x8=Close)');
}

// ============================================================
// 第二部分：SSE 数据流
// ============================================================

// ---------- 1. SSE 服务器：按格式生成事件流 ----------
class SSEStream {
  constructor() {
    this.chunks = [];
  }
  // 写一条普通消息
  write(data, options) {
    options = options || {};
    let msg = '';
    if (options.id !== undefined) msg += 'id: ' + options.id + '\\n';
    if (options.event) msg += 'event: ' + options.event + '\\n';
    if (options.retry !== undefined) msg += 'retry: ' + options.retry + '\\n';
    // data 字段：多行要拆成多个 data: 行
    const lines = String(data).split('\\n');
    lines.forEach(line => { msg += 'data: ' + line + '\\n'; });
    msg += '\\n'; // 一个空行表示消息结束
    this.chunks.push(msg);
    return msg;
  }
  // 注释行（保活用）
  writeComment(text) {
    const msg = ': ' + text + '\\n\\n';
    this.chunks.push(msg);
    return msg;
  }
  // 输出整个流
  toStream() { return this.chunks.join(''); }
}

// ---------- 2. SSE 客户端：解析事件流 ----------
class SSEClient {
  constructor() {
    this.listeners = { message: [] };
    this.lastEventId = null;
  }
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  // 解析一段 SSE 流文本
  parse(streamText) {
    // 用两个换行切分消息
    const messages = streamText.split('\\n\\n');
    for (const msg of messages) {
      if (!msg.trim()) continue;
      let event = 'message';
      let data = '';
      let id = null;
      let retry = null;
      const lines = msg.split('\\n');
      for (const line of lines) {
        if (line.startsWith(':')) continue; // 注释
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const field = line.slice(0, idx);
        let value = line.slice(idx + 1);
        if (value.startsWith(' ')) value = value.slice(1); // 去掉开头的空格
        if (field === 'event') event = value;
        else if (field === 'data') data = data ? data + '\\n' + value : value;
        else if (field === 'id') id = value;
        else if (field === 'retry') retry = parseInt(value, 10);
      }
      if (id) this.lastEventId = id;
      // 触发监听器
      const cbs = this.listeners[event] || [];
      cbs.forEach(cb => cb({ event, data, id, retry }));
    }
  }
}

// ---------- 3. SSE 演示 ----------
function demoSSE() {
  console.log('\\n========== SSE 服务端推送演示 ==========');

  // 服务端构造事件流
  const sse = new SSEStream();
  console.log('\\n--- 服务端构造事件流 ---');
  console.log('1. 推送普通消息:');
  sse.write('hello from server');
  console.log('2. 推送带 event 类型的消息:');
  sse.write('用户 alice 上线', { event: 'user-join', id: '100' });
  console.log('3. 推送多行数据:');
  sse.write('第一行\\n第二行\\n第三行', { id: '101' });
  console.log('4. 推送重连间隔:');
  sse.write('请 3 秒后重连', { retry: 3000 });
  console.log('5. 发送注释保活:');
  sse.writeComment('keepalive');

  const stream = sse.toStream();
  console.log('\\n--- 完整 SSE 流（按 RFC 格式） ---');
  console.log(stream);

  // 客户端解析
  console.log('--- 客户端解析事件流 ---');
  const client = new SSEClient();
  client.on('message', (e) => {
    console.log('[message] data="' + e.data + '" id=' + e.id);
  });
  client.on('user-join', (e) => {
    console.log('[user-join] data="' + e.data + '" id=' + e.id);
  });
  client.parse(stream);
  console.log('客户端记录的 Last-Event-ID:', client.lastEventId, '（断线重连时会带给服务器）');
}

// ---------- 4. 运行所有演示 ----------
simulateHandshake();
demoWebSocket();
demoSSE();
`
  },

  // ============================================================
  // 第二十三章：HTTP 代理、网关与反向代理
  // ============================================================
  {
    id: "http-23",
    group: "实战与工具",
    icon: "🔀",
    title: "HTTP 代理、网关与反向代理",
    content: `## 一、为什么这一章重要

代理是后端架构的"承重墙"。一个生产系统几乎不可能没有代理——前端是 Nginx 反向代理，API 网关是 Kong/APISIX，Service Mesh 是 Envoy，CDN 是分布式的代理网络。理解代理能让你看懂架构图、写出正确的 Nginx 配置、设计出合理的负载均衡策略、排查出"为什么 502"这种经典问题。

工作中你会反复遇到：正向代理和反向代理到底有什么区别？为什么 Nginx 默认用轮询？加权轮询和 IP hash 各自适用什么场景？为什么有时候请求里多了一个 \`X-Forwarded-For\`？健康检查怎么做？这些都是代理的核心知识。

> 沙箱不能开真实代理服务器，所以本章会**用代码模拟一个负载均衡器**，演示轮询、加权轮询、IP hash 三种算法的实际效果。

## 二、代理的本质

代理就是"中间人"——在客户端和服务端之间插入一个节点，由它转发请求和响应。

\`\`\`
[ 客户端 ] --请求--> [ 代理 ] --请求--> [ 服务端 ]
[ 客户端 ] <--响应-- [ 代理 ] <--响应-- [ 服务端 ]
\`\`\`

这个中间节点能做：

- **转发**：把请求转给后端
- **路由**：按 URL/Host 分发到不同后端
- **负载均衡**：按策略分发到多台后端
- **缓存**：缓存响应，下次直接返回
- **改写**：修改请求头/响应头
- **TLS 终止**：在代理处解密 HTTPS，后端用 HTTP
- **鉴权**：统一做认证、限流、WAF
- **协议转换**：HTTP 转 FastCGI、HTTP 转 gRPC

## 三、正向代理（Forward Proxy）

**正向代理代理的是客户端**。客户端知道自己想访问谁，但不能直接访问，于是让代理帮自己访问。

经典场景：

- 公司上网行为管理（Squid）：员工流量必须经过代理审计
- 翻墙 / VPN：通过境外代理访问被墙站点
- 爬虫代理池：用大量代理 IP 绕过封锁
- 缓存加速：校园网出口缓存热点资源

特征：**客户端要主动配置代理地址**。浏览器填"代理 IP:端口"，程序设 \`HTTP_PROXY\` 环境变量。客户端请求里 \`Host\` 是真实目标，不是代理。

\`\`\`
[ 客户端 ] --"我要访问 example.com"--> [ 正向代理 ] --代为访问--> [ example.com ]
\`\`\`

## 四、反向代理（Reverse Proxy）

**反向代理代理的是服务端**。客户端根本不知道真实服务器的存在，它以为代理就是服务器，代理背后转发给真正的后端。

经典场景：

- **负载均衡**：Nginx 把请求分发到多台 Tomcat
- **SSL 卸载**：Nginx 处理 HTTPS，后端用 HTTP
- **静态资源**：Nginx 直接服务静态文件，动态请求转后端
- **灰度发布**：按比例把流量分到新旧版本
- **API 网关**：统一入口，做鉴权、限流、监控

特征：**客户端无感知**。客户端访问的就是代理地址，根本不知道后端有几台机器。

\`\`\`
[ 客户端 ] --"访问 nginx.com"--> [ 反向代理 ] --分发--> [ 后端1 / 后端2 / 后端3 ]
\`\`\`

## 五、四层代理 vs 七层代理

按 OSI 分层，代理分两类：

### 5.1 四层代理（传输层）

工作在 TCP/UDP 层，只看 IP 和端口，不解析 HTTP 内容。代表：LVS、HAProxy 的 TCP 模式、Nginx Stream。

优点：性能极高（不解析协议，直接转发字节流）；协议无关（MySQL、Redis 都能代理）。
缺点：无法基于 HTTP 内容做路由（按 URL、Header 分流做不到）。

### 5.2 七层代理（应用层）

工作在 HTTP 层，能解析请求方法、URL、Header、Body。代表：Nginx、HAProxy 的 HTTP 模式、Kong。

优点：能基于 HTTP 内容做路由、改写、缓存、限流。
缺点：性能比四层低（要解析协议）；只支持 HTTP/HTTPS。

实际架构常组合使用：最外层 LVS（四层）做高并发分发，里层 Nginx（七层）做业务路由。

## 六、负载均衡算法

### 6.1 轮询（Round Robin）

按顺序把请求分给每台后端，循环往复。最简单也最常用。

\`\`\`
请求1 -> 后端A
请求2 -> 后端B
请求3 -> 后端C
请求4 -> 后端A
...
\`\`\`

适用：后端机器配置相同、处理能力相近。

### 6.2 加权轮询（Weighted Round Robin）

给每台后端一个权重，按权重比例分发。权重高的分到更多请求。

\`\`\`
A 权重=5, B 权重=3, C 权重=2
请求: A A A A A B B B C C A A A A A B B B C C ...
\`\`\`

适用：后端机器配置不同，强机器多干活。Nginx 默认就是这个算法的平滑版本。

### 6.3 IP 哈希（IP Hash）

对客户端 IP 做哈希，固定映射到某台后端。同一 IP 始终落到同一台机器。

适用：需要会话保持（Session 黏滞）的场景，避免 session 跨机器丢失。

缺点：后端机器增减时，哈希分布会大量重映射；可能哈希不均（某些 IP 流量大）。

### 6.4 最少连接数（Least Connections）

把请求分给当前连接数最少的那台后端。

适用：请求处理时间差异大（有的快有的慢），轮询会导致某些机器堆积。

### 6.5 一致性哈希（Consistent Hashing）

把后端和请求都映射到一个哈希环上，请求落到环上顺时针最近的节点。后端增减只影响相邻区间。

适用：分布式缓存（Redis Cluster、Memcached），减少节点变更时的缓存失效。

## 七、Nginx 反向代理配置示例

\`\`\`nginx
upstream backend {
  server 192.168.1.10:8080 weight=3;
  server 192.168.1.11:8080 weight=2;
  server 192.168.1.12:8080 weight=1;
  # 备用机器，主机都挂了才启用
  server 192.168.1.13:8080 backup;
  # 长连接缓存
  keepalive 32;
}

server {
  listen 443 ssl;
  server_name api.example.com;

  ssl_certificate     /etc/nginx/cert.pem;
  ssl_certificate_key /etc/nginx/key.pem;

  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    # WebSocket 支持
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
\`\`\`

**关键配置说明**：

- \`proxy_set_header X-Real-IP\`：把客户端真实 IP 传给后端，否则后端只能看到 Nginx 的 IP
- \`X-Forwarded-For\`：代理链路，每过一层代理追加一个 IP
- \`keepalive 32\`：到后端的长连接池，避免每次请求都建 TCP
- \`proxy_http_version 1.1\` + \`Upgrade\` 头：WebSocket 必需

## 八、健康检查

负载均衡器必须知道哪些后端可用，否则会把请求转发到挂掉的机器。两种方式：

1. **被动健康检查**：Nginx 默认方式。转发失败就标记为宕机，停止分发；过一段时间再试。
   - \`max_fails=3\`：失败 3 次标记宕机
   - \`fail_timeout=30s\`：标记后 30 秒内不再分发
   
2. **主动健康检查**：定期向后端发健康探测请求（如 GET /health）。Nginx 开源版不支持，需要 Plus 或第三方模块（如 nginx_upstream_check_module）。

## 九、API 网关

API 网关是反向代理的"增强版"，除了转发还提供：

- **统一鉴权**：所有 API 都经过网关做 JWT 校验
- **限流熔断**：保护后端不被打垮
- **协议转换**：HTTP 转 gRPC、SOAP 转 REST
- **API 聚合**：一个客户端请求，网关聚合多个后端
- **灰度发布**：按用户、按比例路由
- **监控告警**：统一上报指标

代表实现：Kong、APISIX、Zuul、Spring Cloud Gateway。

## 十、本章小结

代理的本质是"中间人"，正向代理代理客户端、反向代理代理服务端，区别就在"代理对象是谁"。负载均衡是反向代理的核心能力，轮询、加权、IP hash 各有适用场景。Nginx 是生产环境最常用的反向代理，理解它的配置项就是理解代理的工作方式。下面的代码会模拟一个完整的负载均衡器，让你看到三种算法的实际效果。`,
    code: `// ============================================================
// 负载均衡器模拟：轮询、加权轮询、IP 哈希、最少连接
// 沙箱无 http/net 模块，用纯 JS 模拟分发逻辑
// ============================================================

const crypto = require('crypto');

// ---------- 1. 模拟后端服务器 ----------
class BackendServer {
  constructor(name, weight) {
    this.name = name;
    this.weight = weight || 1;
    this.alive = true;        // 是否健康
    this.connections = 0;     // 当前活跃连接数
    this.totalRequests = 0;   // 累计处理请求数
  }
  // 处理请求
  handle(clientIp) {
    if (!this.alive) return false;
    this.connections++;
    this.totalRequests++;
    // 模拟处理耗时
    const cost = Math.floor(Math.random() * 50) + 10;
    // 处理完释放连接
    setTimeout(() => this.connections--, cost);
    return { server: this.name, clientIp, cost };
  }
}

// ---------- 2. 负载均衡器基类 ----------
class LoadBalancer {
  constructor(servers) {
    this.servers = servers;
  }
  // 选一台后端（子类实现）
  pick(clientIp) { throw new Error('子类必须实现 pick'); }
  // 转发请求
  forward(clientIp) {
    const aliveServers = this.servers.filter(s => s.alive);
    if (aliveServers.length === 0) return null;
    const server = this.pick(clientIp);
    if (!server) return null;
    return server.handle(clientIp);
  }
  // 标记某台后端宕机
  markDown(name) {
    const s = this.servers.find(s => s.name === name);
    if (s) s.alive = false;
  }
  // 标记某台后端恢复
  markUp(name) {
    const s = this.servers.find(s => s.name === name);
    if (s) s.alive = true;
  }
  // 统计各后端处理量
  stats() {
    return this.servers.map(s => ({
      name: s.name,
      weight: s.weight,
      alive: s.alive,
      total: s.totalRequests,
      current: s.connections
    }));
  }
}

// ---------- 3. 轮询算法 ----------
class RoundRobinBalancer extends LoadBalancer {
  constructor(servers) {
    super(servers);
    this.index = 0;
  }
  pick() {
    const alive = this.servers.filter(s => s.alive);
    if (alive.length === 0) return null;
    // 在存活的机器里轮询
    const server = alive[this.index % alive.length];
    this.index++;
    return server;
  }
}

// ---------- 4. 加权轮询算法（平滑版本，类似 Nginx） ----------
class WeightedRoundRobinBalancer extends LoadBalancer {
  constructor(servers) {
    super(servers);
    // 每台机器维护当前权重和有效权重
    this.states = servers.map(s => ({
      server: s,
      currentWeight: 0,
      effectiveWeight: s.weight
    }));
  }
  pick() {
    const alive = this.states.filter(st => st.server.alive);
    if (alive.length === 0) return null;
    // 算法：
    // 1. 每台 currentWeight += effectiveWeight
    // 2. 选 currentWeight 最大的
    // 3. 选中的 currentWeight -= totalWeight（让其他机器下次更有机会）
    let total = 0;
    let best = null;
    for (const st of alive) {
      st.currentWeight += st.effectiveWeight;
      total += st.effectiveWeight;
      if (!best || st.currentWeight > best.currentWeight) {
        best = st;
      }
    }
    best.currentWeight -= total;
    return best.server;
  }
}

// ---------- 5. IP 哈希算法 ----------
class IpHashBalancer extends LoadBalancer {
  pick(clientIp) {
    const alive = this.servers.filter(s => s.alive);
    if (alive.length === 0) return null;
    // 对客户端 IP 做 md5，取模映射到后端
    const hash = crypto.createHash('md5').update(clientIp).digest();
    // 取前 4 字节作为整数
    const num = hash.readUInt32BE(0);
    return alive[num % alive.length];
  }
}

// ---------- 6. 最少连接数算法 ----------
class LeastConnectionsBalancer extends LoadBalancer {
  pick() {
    const alive = this.servers.filter(s => s.alive);
    if (alive.length === 0) return null;
    // 选当前连接数最少的
    let best = alive[0];
    for (const s of alive) {
      if (s.connections < best.connections) best = s;
    }
    return best;
  }
}

// ---------- 7. 工具：生成随机客户端 IP ----------
function randomIp() {
  return [10, 20, 30, 40].map(() => Math.floor(Math.random() * 256)).join('.');
}

// ---------- 8. 演示轮询 ----------
function demoRoundRobin() {
  console.log('========== 轮询算法演示 ==========');
  const servers = [
    new BackendServer('A'),
    new BackendServer('B'),
    new BackendServer('C')
  ];
  const lb = new RoundRobinBalancer(servers);
  // 模拟 9 个请求
  for (let i = 0; i < 9; i++) {
    const r = lb.forward('10.0.0.1');
    console.log('请求 ' + (i + 1) + ' -> ' + r.server);
  }
  console.log('统计:', lb.stats().map(s => s.name + '=' + s.total).join(', '));
  console.log('结论: 每台机器分到 3 个，绝对均匀');
}

// ---------- 9. 演示加权轮询 ----------
function demoWeighted() {
  console.log('\\n========== 加权轮询算法演示 ==========');
  const servers = [
    new BackendServer('A', 5),  // 配置强，权重 5
    new BackendServer('B', 3),  // 中等，权重 3
    new BackendServer('C', 2)   // 弱，权重 2
  ];
  const lb = new WeightedRoundRobinBalancer(servers);
  // 模拟 10 个请求
  const seq = [];
  for (let i = 0; i < 10; i++) {
    const r = lb.forward('10.0.0.1');
    seq.push(r.server);
  }
  console.log('10 次请求分发顺序:', seq.join(' '));
  console.log('统计:', lb.stats().map(s => s.name + '(w=' + s.weight + ')=' + s.total).join(', '));
  console.log('结论: A:B:C = 5:3:2，且分布平滑不集中');
}

// ---------- 10. 演示 IP 哈希 ----------
function demoIpHash() {
  console.log('\\n========== IP 哈希算法演示 ==========');
  const servers = [
    new BackendServer('A'),
    new BackendServer('B'),
    new BackendServer('C')
  ];
  const lb = new IpHashBalancer(servers);
  // 同一 IP 多次请求，应始终落到同一台
  const ip = '10.0.0.42';
  const results = [];
  for (let i = 0; i < 5; i++) {
    const r = lb.forward(ip);
    results.push(r.server);
  }
  console.log('IP ' + ip + ' 的 5 次请求都落到:', results.join(' '));
  // 不同 IP 可能落到不同机器
  console.log('\\n模拟 30 个不同 IP 的分发:');
  for (let i = 0; i < 30; i++) {
    lb.forward(randomIp());
  }
  console.log('统计:', lb.stats().map(s => s.name + '=' + s.total).join(', '));
  console.log('结论: 同一 IP 始终落到同一机器（会话保持）');
}

// ---------- 11. 演示健康检查 + 故障转移 ----------
function demoFailover() {
  console.log('\\n========== 健康检查与故障转移演示 ==========');
  const servers = [
    new BackendServer('A'),
    new BackendServer('B'),
    new BackendServer('C')
  ];
  const lb = new RoundRobinBalancer(servers);
  // 正常情况下分发 6 个请求
  console.log('--- 正常情况: 6 个请求 ---');
  for (let i = 0; i < 6; i++) {
    const r = lb.forward('10.0.0.1');
    console.log('请求 ' + (i + 1) + ' -> ' + r.server);
  }
  // B 宕机
  console.log('\\n--- B 机器宕机 ---');
  lb.markDown('B');
  console.log('存活状态:', lb.stats().map(s => s.name + '=' + (s.alive ? 'alive' : 'down')).join(', '));
  // 再分发 6 个请求，应该只在 A、C 之间轮询
  console.log('再分发 6 个请求:');
  for (let i = 0; i < 6; i++) {
    const r = lb.forward('10.0.0.1');
    console.log('请求 ' + (i + 7) + ' -> ' + (r ? r.server : '无可用后端!'));
  }
  // B 恢复
  console.log('\\n--- B 恢复 ---');
  lb.markUp('B');
  console.log('再分发 3 个请求:');
  for (let i = 0; i < 3; i++) {
    const r = lb.forward('10.0.0.1');
    console.log('请求 ' + (i + 13) + ' -> ' + r.server);
  }
  console.log('\\n统计:', lb.stats().map(s => s.name + '=' + s.total).join(', '));
}

// ---------- 12. 演示最少连接 ----------
function demoLeastConnections() {
  console.log('\\n========== 最少连接数算法演示 ==========');
  const servers = [
    new BackendServer('A'),
    new BackendServer('B'),
    new BackendServer('C')
  ];
  const lb = new LeastConnectionsBalancer(servers);
  // 模拟 6 个请求，由于处理耗时不同，连接数会变化
  console.log('分发 6 个请求（处理耗时不一）:');
  for (let i = 0; i < 6; i++) {
    const r = lb.forward('10.0.0.1');
    console.log('请求 ' + (i + 1) + ' -> ' + r.server + ' (耗时 ' + r.cost + 'ms)');
  }
  // 等一会儿让连接释放
  setTimeout(() => {
    console.log('\\n所有请求处理完成后的统计:');
    console.log(lb.stats().map(s => s.name + ': 累计=' + s.total + ' 当前连接=' + s.current).join('\\n'));
  }, 200);
}

// ---------- 13. 运行所有演示 ----------
demoRoundRobin();
demoWeighted();
demoIpHash();
demoFailover();
demoLeastConnections();
`
  },

  // ============================================================
  // 第二十四章：HTTP 性能优化与最佳实践
  // ============================================================
  {
    id: "http-24",
    group: "实战与工具",
    icon: "🏆",
    title: "HTTP 性能优化与最佳实践",
    content: `## 一、为什么这一章重要

性能是 HTTP 工程的"综合考试"。一个 HTTP 请求从客户端发出到响应回来，要经过 DNS、TCP、TLS、HTTP、CDN、负载均衡、应用、数据库等多个环节，每个环节都可能成为瓶颈。理解这些环节的优化手段，你才能从"接口慢了不知道怎么查"升级到"一眼定位瓶颈在哪、怎么优化"。

工作中遇到的所有性能问题都和这一章有关：为什么首页加载要 5 秒？为什么接口 P99 抖动？为什么 200KB 的页面变 50KB 还慢？为什么开了 gzip 还要开 brotli？为什么 HTTP/2 比 HTTP/1.1 快？HTTP/3 又快在哪？这些问题的答案都在本章。

> 沙箱提供 \`zlib\`、\`crypto\`、\`buffer\` 等模块，所以本章会**写一个 HTTP 性能检查清单评估器**，演示压缩、缓存、连接复用等关键优化点的判断逻辑。

## 二、性能优化的全局视角

一个 HTTP 请求的耗时拆解：

\`\`\`
总耗时 = DNS 解析 + TCP 握手 + TLS 握手 + 请求传输 + 服务器处理 + 响应传输 + 浏览器渲染
\`\`\`

优化思路按环节拆：

| 环节 | 优化手段 |
|------|----------|
| DNS | DNS 预解析、DNS over HTTPS、TTL 设置 |
| TCP | 连接复用（keep-alive）、HTTP/2 多路复用 |
| TLS | TLS 1.3、Session Resumption、OCSP Stapling |
| 传输 | 压缩、分块、流式响应 |
| 服务器 | 缓存、连接池、异步化 |
| 客户端 | 浏览器缓存、预加载、懒加载 |

## 三、连接复用与 keep-alive

### 3.1 HTTP/1.0 的痛点

HTTP/1.0 默认每个请求都建一个 TCP 连接，请求完就关。建一次 TCP 要 3 次握手，HTTPS 还要 TLS 4 次握手，开销巨大。一个页面有 50 个资源就要建 50 次连接。

### 3.2 HTTP/1.1 的 keep-alive

HTTP/1.1 默认开启 \`Connection: keep-alive\`，一个 TCP 连接可以发多个请求，直到超时或主动关闭。

\`\`\`
Connection: keep-alive
Keep-Alive: timeout=60, max=1000
\`\`\`

效果：第二个请求省掉了 TCP+TLS 握手，延迟直接降一半。

### 3.3 HTTP/1.1 的瓶颈：队头阻塞

虽然 keep-alive 复用了连接，但 HTTP/1.1 是"请求-响应"串行的——一个请求没响应完，下一个请求就得等。这就是**队头阻塞（Head-of-Line Blocking）**。

浏览器为了缓解，会对同一域名开 6 个并发连接，但本质还是治标不治本。

### 3.4 HTTP/2 的多路复用

HTTP/2 在一个 TCP 连接上可以并发多个请求，每个请求是一个"流"（Stream），帧可以交错传输。彻底解决了 HTTP 层的队头阻塞。

\`\`\`
HTTP/1.1: 连接1: 请求A -> 响应A -> 请求B -> 响应B
HTTP/2:   连接1: [流A帧1][流B帧1][流A帧2][流B帧2]...
\`\`\`

### 3.5 HTTP/3 的 QUIC

HTTP/2 还是有 TCP 层的队头阻塞——一个 TCP 包丢了，所有流都得等重传。HTTP/3 用基于 UDP 的 QUIC 协议，每个流独立，一个流丢包不影响其他流。

## 四、压缩

### 4.1 为什么压缩重要

文本资源（HTML、CSS、JS、JSON）通常有 70% 的冗余，压缩后体积能降到原来的 20%-30%。一个 200KB 的 JS 压缩后 50KB，传输时间直接降 75%。

### 4.2 常见压缩算法

| 算法 | 压缩率 | 速度 | 浏览器支持 |
|------|--------|------|-----------|
| gzip | 中 | 快 | 全部 |
| deflate | 中 | 快 | 全部 |
| brotli | 高 | 中 | 现代浏览器 |

### 4.3 内容协商

客户端在请求头里声明支持的压缩算法：

\`\`\`
Accept-Encoding: gzip, deflate, br
\`\`\`

服务器按优先级选一个压缩，并在响应头声明：

\`\`\`
Content-Encoding: gzip
\`\`\`

### 4.4 何时不要压缩

- 已经压缩过的格式（PNG、JPEG、MP4）：再压缩不仅不缩小，还浪费 CPU
- 小于 1KB 的资源：压缩头开销大于收益
- SSE 流式响应：流式压缩有缓冲延迟

## 五、缓存

缓存是性能优化的"皇冠"，命中率高的缓存能让响应时间从秒级降到毫秒级。

### 5.1 强缓存

浏览器直接用本地缓存，不发请求。两个 header 控制：

- \`Cache-Control: max-age=3600\`：1 小时内有效（HTTP/1.1，优先级高）
- \`Expires: Wed, 08 Jul 2026 00:00:00 GMT\`：绝对过期时间（HTTP/1.0）

\`\`\`
Cache-Control: max-age=31536000, immutable
\`\`\`

\`immutable\` 表示资源永不变化，浏览器连"刷新"都不发请求。配合文件指纹（如 \`app.a3b8c9.js\`）使用。

### 5.2 协商缓存

强缓存过期后，浏览器发请求问服务器"还能用吗"，服务器返回 304 表示"继续用"。

- \`Last-Modified\` / \`If-Modified-Since\`：基于修改时间
- \`ETag\` / \`If-None-Match\`：基于内容哈希，更精确

\`\`\`
请求: If-None-Match: "abc123"
响应: 304 Not Modified
      ETag: "abc123"
\`\`\`

### 5.3 缓存层级

1. **浏览器缓存**：用户机器上
2. **CDN 缓存**：离用户最近的边缘节点
3. **反向代理缓存**：Nginx proxy_cache
4. **应用缓存**：Redis / 内存
5. **数据库缓存**：MySQL query cache（已废弃）

越靠近用户的缓存命中率越高、效果越好。

### 5.4 缓存策略

- **HTML**：协商缓存（\`no-cache\`），保证用户能看到最新版本
- **JS/CSS/图片**：强缓存 + 文件指纹（\`max-age=31536000, immutable\`）
- **API 响应**：按业务定，用户信息 \`no-cache\`，公共数据 \`max-age=60\`

## 六、CDN 与边缘计算

### 6.1 CDN 的本质

CDN（Content Delivery Network）是把静态资源缓存到全球各地的边缘节点，用户就近访问。本质是"分布式代理缓存"。

工作流程：

1. 用户请求 \`cdn.example.com/app.js\`
2. DNS 解析时返回离用户最近的 CDN 节点 IP
3. CDN 节点检查本地缓存
4. 命中：直接返回；未命中：回源（向源站请求）并缓存

### 6.2 CDN 的关键能力

- **就近访问**：物理距离短，延迟低
- **负载分流**：把流量分散到多个节点，源站压力小
- **缓存加速**：命中率 95%+，回源请求极少
- **DDoS 防护**：流量先过 CDN，源站被保护
- **边缘计算**：在 CDN 节点跑 JS（Cloudflare Workers、阿里 CDN Edge Routine）

### 6.3 CDN 缓存刷新

资源更新后要刷新 CDN 缓存：

- **URL 改名**：最稳，新 URL 立即生效，老 URL 自然过期
- **主动刷新**：调 CDN API 删除缓存，几分钟生效
- **版本号参数**：\`app.js?v=2\`，但要小心某些代理不缓存带参数的 URL

## 七、资源优化

### 7.1 体积优化

- **Minify**：去掉空格、注释、缩短变量名。UglifyJS、Terser、cssnano
- **Tree Shaking**：去掉未使用的代码（ES Module 静态分析）
- **Code Splitting**：按路由拆包，按需加载
- **图片优化**：WebP 代替 JPEG/PNG，SVG 代替图标字体

### 7.2 数量优化

- **合并请求**：HTTP/1.1 时代有效（精灵图、CSS 合并）；HTTP/2 时代反而有害（缓存粒度变粗）
- **HTTP/2 Server Push**：服务器主动推送资源（但已被 Chrome 弃用）
- **预加载**：\`<link rel="preload">\` 提前加载关键资源
- **预连接**：\`<link rel="preconnect">\` 提前建立连接

### 7.3 加载顺序

- **Critical CSS**：首屏样式内联，非首屏异步加载
- **JS 异步化**：\`defer\` / \`async\`，避免阻塞渲染
- **图片懒加载**：\`loading="lazy"\`，视口外图片不加载

## 八、TLS 优化

### 8.1 TLS 1.3

TLS 1.3 把握手从 2-RTT 减到 1-RTT，支持 0-RTT 恢复（已连接过的服务器，恢复连接时 0 RTT）。

### 8.2 Session Resumption

复用之前的 TLS 会话，跳过完整握手。两种方式：

- **Session ID**：服务器返回 ID，客户端下次带上
- **Session Ticket**：服务器返回加密的会话票据，客户端下次带上

### 8.3 OCSP Stapling

证书验证时，浏览器要查证书是否被吊销（OCSP）。服务器把 OCSP 响应"装订"在握手时返回，省掉浏览器额外请求。

## 九、HTTP/2 与 HTTP/3

### 9.1 HTTP/2 的关键特性

- **多路复用**：一个连接并发多个请求
- **头部压缩**：HPACK 算法，重复头部只传一次
- **Server Push**：主动推送（已弃用）
- **二进制分帧**：文本协议变二进制，解析更快

### 9.2 HTTP/3 的关键特性

- **基于 QUIC（UDP）**：彻底告别 TCP 队头阻塞
- **0-RTT 连接**：已连接过的服务器恢复时零延迟
- **连接迁移**：切换网络（Wi-Fi 转 4G）不断连
- **内置加密**：TLS 1.3 强制集成，没有明文 HTTP/3

## 十、性能监控指标

衡量 HTTP 性能的关键指标：

- **TTFB**（Time To First Byte）：首字节时间，服务器响应速度
- **FCP**（First Contentful Paint）：首次内容绘制
- **LCP**（Largest Contentful Paint）：最大内容绘制（核心 Web Vitals）
- **CLS**（Cumulative Layout Shift）：累计布局偏移
- **FID / INP**：首次输入延迟 / 交互延迟

### 性能预算

设置性能预算（如 LCP < 2.5s，JS 包 < 200KB），CI 里自动检查，超了就报警。

## 十一、本章小结

HTTP 性能优化是一个系统工程：连接层（keep-alive、HTTP/2/3）、传输层（压缩、流式）、缓存层（强缓存、协商缓存、CDN）、资源层（minify、tree shaking、code splitting）、安全层（TLS 1.3、OCSP）。没有银弹，要根据瓶颈环节对症下药。下面的代码是一个**HTTP 性能检查清单评估器**，输入一个请求/响应配置，自动评估各优化项是否达标。`,
    code: `// ============================================================
// HTTP 性能检查清单评估器
// 演示压缩、缓存、连接复用、HTTP 版本等优化点的判断
// ============================================================

const zlib = require('zlib');
const crypto = require('crypto');

// ---------- 1. 压缩效果演示 ----------
function demoCompression() {
  console.log('========== 压缩效果演示 ==========');
  // 模拟一段 HTML 内容
  const html = '<!DOCTYPE html><html><head><title>测试</title></head><body>' +
    '<h1>Hello</h1>'.repeat(100) +
    '<p>这是一段比较长的文本内容，会被压缩算法识别出冗余并大幅缩减体积。</p>'.repeat(50) +
    '</body></html>';
  const original = Buffer.from(html, 'utf8');
  console.log('原始大小:', original.length, '字节');

  // gzip 压缩
  const gzipped = zlib.gzipSync(original);
  console.log('gzip 压缩后:', gzipped.length, '字节, 压缩率:', ((1 - gzipped.length / original.length) * 100).toFixed(1) + '%');

  // deflate 压缩
  const deflated = zlib.deflateSync(original);
  console.log('deflate 压缩后:', deflated.length, '字节, 压缩率:', ((1 - deflated.length / original.length) * 100).toFixed(1) + '%');

  // brotli 压缩（Node.js 11+ 支持）
  if (zlib.brotliCompressSync) {
    const brotlied = zlib.brotliCompressSync(original);
    console.log('brotli 压缩后:', brotlied.length, '字节, 压缩率:', ((1 - brotlied.length / original.length) * 100).toFixed(1) + '%');
  }

  // 已经压缩的数据再压缩效果差
  console.log('\\n--- 已压缩数据再压缩（无意义） ---');
  const randomData = crypto.randomBytes(1000);  // 随机数据无法压缩
  const randomGz = zlib.gzipSync(randomData);
  console.log('随机数据原大小:', randomData.length, 'gzip 后:', randomGz.length, '(反而变大!)');
}

// ---------- 2. ETag 生成演示（协商缓存） ----------
function generateETag(content) {
  // 用内容的 sha1 哈希生成 ETag
  const hash = crypto.createHash('sha1');
  hash.update(content);
  return '"' + hash.digest('hex').slice(0, 16) + '"';
}

function demoCache() {
  console.log('\\n========== 缓存策略演示 ==========');
  const content1 = '<html><body>版本1</body></html>';
  const content2 = '<html><body>版本1</body></html>';  // 内容相同
  const content3 = '<html><body>版本2</body></html>';  // 内容不同

  const etag1 = generateETag(content1);
  const etag2 = generateETag(content2);
  const etag3 = generateETag(content3);
  console.log('content1 ETag:', etag1);
  console.log('content2 ETag:', etag2, '(与1相同:', etag1 === etag2, ')');
  console.log('content3 ETag:', etag3, '(与1相同:', etag1 === etag3, ')');

  // 模拟协商缓存
  console.log('\\n--- 协商缓存模拟 ---');
  const ifNoneMatch = etag1;  // 客户端发来的 If-None-Match
  const serverEtag = generateETag(content1);  // 服务器当前资源的 ETag
  if (ifNoneMatch === serverEtag) {
    console.log('ETag 一致，返回 304 Not Modified（继续用本地缓存）');
  } else {
    console.log('ETag 不一致，返回 200 + 新内容');
  }
}

// ---------- 3. 性能检查清单评估器 ----------
class PerformanceChecker {
  constructor() {
    this.checks = [];
  }
  // 注册一个检查项
  add(name, fn) {
    this.checks.push({ name, fn });
  }
  // 评估一个响应配置
  evaluate(config) {
    console.log('\\n========== 性能检查清单 ==========');
    console.log('评估目标:', config.url);
    console.log('----------------------------------------');
    let pass = 0;
    let warn = 0;
    let fail = 0;
    const results = [];
    for (const check of this.checks) {
      const result = check.fn(config);
      const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
      console.log(icon + ' [' + check.name + '] ' + result.message);
      results.push({ name: check.name, ...result });
      if (result.status === 'pass') pass++;
      else if (result.status === 'warn') warn++;
      else fail++;
    }
    console.log('----------------------------------------');
    console.log('通过: ' + pass + '  警告: ' + warn + '  失败: ' + fail);
    const score = Math.round((pass / this.checks.length) * 100);
    console.log('性能评分: ' + score + '/100');
    if (score >= 80) console.log('评级: 优秀 🏆');
    else if (score >= 60) console.log('评级: 良好 👍');
    else console.log('评级: 待改进 ⚠');
    return { score, pass, warn, fail, results };
  }
}

// ---------- 4. 注册检查规则 ----------
const checker = new PerformanceChecker();

// 检查 1：是否启用了压缩
checker.add('压缩 (Content-Encoding)', (config) => {
  const ce = config.headers && config.headers['content-encoding'];
  if (ce === 'br') return { status: 'pass', message: '使用 brotli 压缩，压缩率最高' };
  if (ce === 'gzip') return { status: 'pass', message: '使用 gzip 压缩' };
  if (ce === 'deflate') return { status: 'warn', message: '使用 deflate，建议升级为 gzip 或 brotli' };
  return { status: 'fail', message: '未启用压缩，文本资源应启用 gzip 或 brotli' };
});

// 检查 2：是否设置了强缓存
checker.add('强缓存 (Cache-Control)', (config) => {
  const cc = config.headers && config.headers['cache-control'];
  if (!cc) return { status: 'fail', message: '未设置 Cache-Control，每次请求都会回源' };
  if (cc.includes('no-store')) return { status: 'warn', message: '设置了 no-store，确认是否真的不能缓存' };
  const m = cc.match(/max-age=(\\d+)/);
  if (!m) return { status: 'warn', message: 'Cache-Control 没有 max-age' };
  const age = parseInt(m[1], 10);
  if (age >= 86400) return { status: 'pass', message: 'max-age=' + age + ' (>=1天)，长期缓存' };
  if (age >= 3600) return { status: 'pass', message: 'max-age=' + age + ' (>=1小时)，中期缓存' };
  return { status: 'warn', message: 'max-age=' + age + ' 过短，建议增大或加文件指纹' };
});

// 检查 3：是否设置了 ETag（协商缓存）
checker.add('协商缓存 (ETag)', (config) => {
  const etag = config.headers && config.headers['etag'];
  if (etag) return { status: 'pass', message: '设置了 ETag: ' + etag };
  return { status: 'warn', message: '未设置 ETag，强缓存过期后无法走 304' };
});

// 检查 4：是否使用 HTTP/2 或更高
checker.add('HTTP 版本', (config) => {
  const v = config.version || '1.1';
  if (v === '3' || v === 'h3') return { status: 'pass', message: '使用 HTTP/3 (QUIC)，无队头阻塞' };
  if (v === '2' || v === 'h2') return { status: 'pass', message: '使用 HTTP/2，多路复用' };
  if (v === '1.1') return { status: 'warn', message: '使用 HTTP/1.1，建议升级到 HTTP/2' };
  return { status: 'fail', message: '使用 HTTP/1.0，严重过时' };
});

// 检查 5：是否启用了 keep-alive
checker.add('连接复用 (Keep-Alive)', (config) => {
  const conn = config.headers && (config.headers['connection'] || '').toLowerCase();
  if (conn === 'keep-alive' || conn === '') return { status: 'pass', message: '连接复用已启用' };
  if (conn === 'close') return { status: 'fail', message: '设置了 Connection: close，每次请求都建连接' };
  return { status: 'warn', message: '未明确设置，依赖默认行为' };
});

// 检查 6：响应体大小
checker.add('响应体大小', (config) => {
  const size = config.size || 0;
  if (size === 0) return { status: 'warn', message: '响应体为空' };
  if (size < 14 * 1024) return { status: 'pass', message: size + ' 字节，体积合适 (<14KB)' };
  if (size < 100 * 1024) return { status: 'warn', message: size + ' 字节，可考虑拆分或压缩' };
  return { status: 'fail', message: size + ' 字节过大 (>100KB)，应拆包或懒加载' };
});

// 检查 7：是否设置了 TLS 版本（HTTPS 场景）
checker.add('TLS 安全', (config) => {
  if (!config.tls) return { status: 'warn', message: '未使用 HTTPS' };
  if (config.tls === '1.3') return { status: 'pass', message: 'TLS 1.3，1-RTT 握手，性能最佳' };
  if (config.tls === '1.2') return { status: 'pass', message: 'TLS 1.2，可升级到 1.3 进一步提速' };
  return { status: 'fail', message: 'TLS 版本过旧 (' + config.tls + ')，应升级到 1.2+' };
});

// 检查 8：是否设置了 Content-Type
checker.add('Content-Type', (config) => {
  const ct = config.headers && config.headers['content-type'];
  if (!ct) return { status: 'fail', message: '未设置 Content-Type，浏览器无法正确解析' };
  if (ct.includes('charset=utf-8') || ct.startsWith('image/') || ct.startsWith('video/')) {
    return { status: 'pass', message: 'Content-Type: ' + ct };
  }
  return { status: 'warn', message: 'Content-Type 未声明字符集: ' + ct };
});

// 检查 9：TTFB 评估
checker.add('TTFB 首字节时间', (config) => {
  const ttfb = config.ttfb || 0;
  if (ttfb === 0) return { status: 'warn', message: '未提供 TTFB 数据' };
  if (ttfb < 100) return { status: 'pass', message: ttfb + 'ms，优秀 (<100ms)' };
  if (ttfb < 400) return { status: 'pass', message: ttfb + 'ms，良好 (<400ms)' };
  if (ttfb < 1000) return { status: 'warn', message: ttfb + 'ms，偏慢 (>400ms)' };
  return { status: 'fail', message: ttfb + 'ms，过慢 (>1s)，需优化服务器' };
});

// 检查 10：是否使用了 CDN
checker.add('CDN 加速', (config) => {
  if (config.cdn) return { status: 'pass', message: '使用 CDN，就近访问 (' + config.cdn + ')' };
  return { status: 'warn', message: '未使用 CDN，静态资源建议上 CDN' };
});

// ---------- 5. 评估多个场景 ----------
function demoEvaluation() {
  console.log('\\n========== 性能评估演示 ==========');

  // 场景 1：优秀的配置
  console.log('\\n>>> 场景 1: 优化良好的响应 <<<');
  checker.evaluate({
    url: 'https://cdn.example.com/static/app.a3b8c9.js',
    version: '2',
    tls: '1.3',
    cdn: 'Cloudflare',
    ttfb: 80,
    size: 45000,
    headers: {
      'content-encoding': 'br',
      'cache-control': 'public, max-age=31536000, immutable',
      'etag': '"a3b8c9d4e5f6a7b8"',
      'content-type': 'application/javascript; charset=utf-8'
    }
  });

  // 场景 2：配置糟糕
  console.log('\\n>>> 场景 2: 未优化的响应 <<<');
  checker.evaluate({
    url: 'http://example.com/api/data',
    version: '1.1',
    ttfb: 1500,
    size: 200000,
    headers: {
      'connection': 'close',
      'content-type': 'application/json'
    }
  });

  // 场景 3：中等水平
  console.log('\\n>>> 场景 3: 部分优化的响应 <<<');
  checker.evaluate({
    url: 'https://example.com/img/photo.jpg',
    version: '1.1',
    tls: '1.2',
    ttfb: 300,
    size: 80000,
    headers: {
      'content-encoding': 'gzip',
      'cache-control': 'max-age=3600',
      'content-type': 'image/jpeg'
    }
  });
}

// ---------- 6. 连接复用效果量化 ----------
function demoConnectionReuse() {
  console.log('\\n========== 连接复用效果量化 ==========');
  // 模拟 10 个请求的耗时
  const requestCount = 10;
  const rtt = 50;  // 往返时延 ms
  const serverTime = 20;  // 服务器处理时间

  // HTTP/1.0：每个请求都建 TCP
  const http10Time = requestCount * (rtt * 1.5 + serverTime);
  console.log('HTTP/1.0 (每请求建连): ' + http10Time + 'ms');

  // HTTP/1.1 keep-alive：第一个请求建连，后续复用
  const http11Time = rtt * 1.5 + requestCount * (rtt + serverTime);
  console.log('HTTP/1.1 (keep-alive): ' + http11Time + 'ms, 节省 ' + ((1 - http11Time / http10Time) * 100).toFixed(0) + '%');

  // HTTP/2 多路复用：理论上并发
  const http2Time = rtt * 1.5 + (rtt + serverTime);
  console.log('HTTP/2 (多路复用): ' + http2Time + 'ms, 节省 ' + ((1 - http2Time / http10Time) * 100).toFixed(0) + '%');

  // HTTPS 还要加 TLS 握手
  const tlsRtt = 50;
  console.log('\\n--- HTTPS 场景 (加 TLS) ---');
  const https10Time = requestCount * (rtt * 1.5 + tlsRtt * 2 + serverTime);
  const https11Time = rtt * 1.5 + tlsRtt * 2 + requestCount * (rtt + serverTime);
  console.log('HTTPS/1.0: ' + https10Time + 'ms');
  console.log('HTTPS/1.1: ' + https11Time + 'ms, 节省 ' + ((1 - https11Time / https10Time) * 100).toFixed(0) + '%');

  // TLS 1.3 的 0-RTT
  console.log('TLS 1.3 + 0-RTT 恢复: ' + (requestCount * (rtt + serverTime)) + 'ms (无需握手)');
}

// ---------- 7. 运行所有演示 ----------
demoCompression();
demoCache();
demoEvaluation();
demoConnectionReuse();
`
  }
];
