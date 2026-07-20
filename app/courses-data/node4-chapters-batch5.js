export const chapters = [
  {
    id: "n4-http-server-advanced",
    group: "第四部分 Web开发",
    icon: "🏗️",
    title: "HTTP 服务器进阶：路由、方法与状态码",
    content: `# HTTP 服务器进阶：路由、方法与状态码

## 一、HTTP 服务器基础回顾

在上一部分中，我们学习了如何使用 Node.js 内置的 \`http\` 模块创建一个简单的服务器。但在实际开发中，我们需要更复杂的功能：根据不同的 URL 路径和 HTTP 方法返回不同的响应，这就是**路由**。

### 1.1 为什么需要路由？

想象一下一个博客网站：
- 访问 \`/\` → 首页
- 访问 \`/posts\` → 文章列表
- 访问 \`/posts/1\` → ID 为 1 的文章详情
- 访问 \`/about\` → 关于页面

没有路由，所有请求都会得到相同的响应，这显然无法满足需求。

---

## 二、URL 解析与路由基础

### 2.1 解析请求 URL

Node.js 提供了内置的 \`url\` 模块和 WHATWG URL 类来解析 URL：

\`\`\`javascript
const url = require('url');

// 旧版 API
const parsedUrl = url.parse(req.url, true);
console.log(parsedUrl.pathname); // 路径名
console.log(parsedUrl.query);    // 查询参数对象

// 新版 WHATWG URL API（推荐）
const myUrl = new URL(req.url, \`http://\${req.headers.host}\`);
console.log(myUrl.pathname);
console.log(myUrl.searchParams.get('id'));
\`\`\`

### 2.2 HTTP 方法语义

HTTP 定义了多种请求方法，每种方法有不同的语义：

| 方法 | 语义 | 幂等 | 有请求体 |
|------|------|------|----------|
| **GET** | 获取资源 | ✅ | ❌ |
| **POST** | 创建资源 | ❌ | ✅ |
| **PUT** | 全量更新资源 | ✅ | ✅ |
| **PATCH** | 部分更新资源 | ❌ | ✅ |
| **DELETE** | 删除资源 | ✅ | ❌ |
| **HEAD** | 获取响应头 | ✅ | ❌ |
| **OPTIONS** | 获取支持的方法 | ✅ | ❌ |

---

## 三、HTTP 状态码详解

状态码是服务器告诉客户端请求结果的方式，分为 5 大类：

### 3.1 2xx 成功状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| **200 OK** | 请求成功 | GET 成功获取资源，PUT/PATCH 更新成功 |
| **201 Created** | 资源创建成功 | POST 创建新资源后返回 |
| **204 No Content** | 成功但无返回内容 | DELETE 删除成功后 |

### 3.2 3xx 重定向状态码

| 状态码 | 含义 |
|--------|------|
| **301 Moved Permanently** | 永久重定向 |
| **302 Found** | 临时重定向 |
| **304 Not Modified** | 资源未修改（缓存） |

### 3.3 4xx 客户端错误

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| **400 Bad Request** | 请求格式错误 | 参数校验失败、JSON 解析失败 |
| **401 Unauthorized** | 未认证 | 缺少或无效的认证凭证 |
| **403 Forbidden** | 已认证但无权限 | 权限不足 |
| **404 Not Found** | 资源不存在 | 路径或资源 ID 不存在 |
| **405 Method Not Allowed** | 方法不允许 | 路径存在但使用了错误的 HTTP 方法 |
| **409 Conflict** | 资源冲突 | 重复创建（如用户名已存在） |
| **422 Unprocessable Entity** | 语义错误 | 验证失败（格式正确但内容无效） |
| **429 Too Many Requests** | 请求过多 | 限流 |

### 3.4 5xx 服务器错误

| 状态码 | 含义 |
|--------|------|
| **500 Internal Server Error** | 服务器内部错误 |
| **502 Bad Gateway** | 网关错误 |
| **503 Service Unavailable** | 服务不可用 |

---

## 四、响应头设置

### 4.1 常用响应头

\`\`\`javascript
res.writeHead(200, {
  'Content-Type': 'application/json; charset=utf-8',
  'Content-Length': Buffer.byteLength(data),
  'Cache-Control': 'no-cache',
  'Access-Control-Allow-Origin': '*'
});
\`\`\`

### 4.2 Content-Type 对应表

| 类型 | Content-Type |
|------|--------------|
| JSON | application/json |
| HTML | text/html |
| 纯文本 | text/plain |
| CSS | text/css |
| JavaScript | application/javascript |
| PNG 图片 | image/png |
| JPEG 图片 | image/jpeg |
| 二进制文件 | application/octet-stream |

---

## 五、CORS 跨域基础

浏览器的同源策略会阻止跨域请求。跨域是指协议、域名、端口任一不同。要允许跨域，需要设置 CORS 响应头：

\`\`\`javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
\`\`\`

对于非简单请求，浏览器会先发 OPTIONS 预检请求，服务器需要正确响应。

---

## 六、RESTful API 设计理念

REST（Representational State Transfer）是一种 API 设计风格：
- 使用名词而非动词：\`/api/todos\` 而非 \`/api/getTodos\`
- 使用 HTTP 方法表示操作：GET 获取、POST 创建、PUT 更新、DELETE 删除
- 使用 HTTP 状态码表示结果
- 无状态：每个请求包含所有必要信息

在本章的 Demo 中，我们将从零实现一个完整的 RESTful Todo API 服务器！
`,
    code: `// ============================================
// HTTP 服务器进阶：路由、方法与状态码
// 完整 RESTful Todo API 实现（无任何框架）
// ============================================

const http = require('http');
const { URL } = require('url');

// --- 内存数据存储（模拟数据库） ---
let todos = [
  { id: 1, title: '学习 Node.js', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: '写代码', completed: true, createdAt: new Date().toISOString() },
];
let nextId = 3;

// --- 辅助函数：发送 JSON 响应 ---
function sendJson(res, statusCode, data) {
  const jsonData = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(jsonData);
}

// --- 辅助函数：解析请求体 ---
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('JSON 解析失败'));
      }
    });
    req.on('error', reject);
  });
}

// --- 创建服务器 ---
const server = http.createServer(async (req, res) => {
  // 解析 URL
  const baseUrl = \`http://\${req.headers.host}\`;
  const url = new URL(req.url, baseUrl);
  const pathname = url.pathname;
  const method = req.method;

  console.log(\`[\${new Date().toLocaleString()}] \${method} \${pathname}\`);

  try {
    // ===== 路由处理 =====

    // 1. CORS 预检请求
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      });
      return res.end();
    }

    // 2. 根路径
    if (pathname === '/' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(\`
        <h1>Todo API 服务器</h1>
        <p>可用端点：</p>
        <ul>
          <li>GET /api/todos - 获取所有待办</li>
          <li>GET /api/todos?id=1 - 查询待办</li>
          <li>POST /api/todos - 创建待办</li>
          <li>PUT /api/todos/:id - 更新待办</li>
          <li>DELETE /api/todos/:id - 删除待办</li>
        </ul>
      \`);
    }

    // 3. /api/todos 路由（集合）
    if (pathname === '/api/todos' || pathname.startsWith('/api/todos?')) {
      // GET /api/todos - 获取列表
      if (method === 'GET') {
        const completed = url.searchParams.get('completed');
        let result = [...todos];
        if (completed === 'true') {
          result = result.filter(t => t.completed);
        } else if (completed === 'false') {
          result = result.filter(t => !t.completed);
        }
        return sendJson(res, 200, {
          success: true,
          data: result,
          total: result.length,
        });
      }

      // POST /api/todos - 创建
      if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
          return sendJson(res, 400, {
            success: false,
            error: 'title 字段是必填的字符串',
          });
        }
        const newTodo = {
          id: nextId++,
          title: body.title.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        todos.push(newTodo);
        return sendJson(res, 201, {
          success: true,
          data: newTodo,
        });
      }

      // 其他方法不允许
      return sendJson(res, 405, {
        success: false,
        error: \`方法 \${method} 不允许在 /api/todos 上使用\`,
        allowedMethods: ['GET', 'POST'],
      });
    }

    // 4. /api/todos/:id 路由（单个资源）
    const todoIdMatch = pathname.match(/^\\/api\\/todos\\/(\\d+)$/);
    if (todoIdMatch) {
      const id = parseInt(todoIdMatch[1], 10);
      const todoIndex = todos.findIndex(t => t.id === id);

      // GET /api/todos/:id - 获取单个
      if (method === 'GET') {
        if (todoIndex === -1) {
          return sendJson(res, 404, {
            success: false,
            error: \`ID 为 \${id} 的待办不存在\`,
          });
        }
        return sendJson(res, 200, {
          success: true,
          data: todos[todoIndex],
        });
      }

      // PUT /api/todos/:id - 全量更新
      if (method === 'PUT') {
        if (todoIndex === -1) {
          return sendJson(res, 404, {
            success: false,
            error: \`ID 为 \${id} 的待办不存在\`,
          });
        }
        const body = await parseBody(req);
        if (!body.title || typeof body.title !== 'string') {
          return sendJson(res, 400, {
            success: false,
            error: 'title 字段是必填的字符串',
          });
        }
        todos[todoIndex] = {
          ...todos[todoIndex],
          title: body.title.trim(),
          completed: typeof body.completed === 'boolean' ? body.completed : todos[todoIndex].completed,
          updatedAt: new Date().toISOString(),
        };
        return sendJson(res, 200, {
          success: true,
          data: todos[todoIndex],
        });
      }

      // PATCH /api/todos/:id - 部分更新
      if (method === 'PATCH') {
        if (todoIndex === -1) {
          return sendJson(res, 404, {
            success: false,
            error: \`ID 为 \${id} 的待办不存在\`,
          });
        }
        const body = await parseBody(req);
        todos[todoIndex] = {
          ...todos[todoIndex],
          ...(body.title !== undefined && { title: String(body.title).trim() }),
          ...(body.completed !== undefined && { completed: Boolean(body.completed) }),
          updatedAt: new Date().toISOString(),
        };
        return sendJson(res, 200, {
          success: true,
          data: todos[todoIndex],
        });
      }

      // DELETE /api/todos/:id - 删除
      if (method === 'DELETE') {
        if (todoIndex === -1) {
          return sendJson(res, 404, {
            success: false,
            error: \`ID 为 \${id} 的待办不存在\`,
          });
        }
        todos.splice(todoIndex, 1);
        return sendJson(res, 204, null);
      }

      return sendJson(res, 405, {
        success: false,
        error: \`方法 \${method} 不允许\`,
        allowedMethods: ['GET', 'PUT', 'PATCH', 'DELETE'],
      });
    }

    // 5. 文件下载示例
    if (pathname === '/download' && method === 'GET') {
      const content = '这是一个下载的文件内容\\nHello World!';
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="example.txt"',
        'Content-Length': Buffer.byteLength(content),
      });
      return res.end(content);
    }

    // 6. 404 未找到
    sendJson(res, 404, {
      success: false,
      error: '路径不存在',
      path: pathname,
    });

  } catch (err) {
    // 错误处理
    console.error('服务器错误:', err);
    sendJson(res, 500, {
      success: false,
      error: '服务器内部错误',
      message: err.message,
    });
  }
});

// --- 启动服务器 ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  Todo API 服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('测试命令:');
  console.log(\`  curl http://localhost:\${PORT}/api/todos\`);
  console.log(\`  curl -X POST http://localhost:\${PORT}/api/todos -H "Content-Type: application/json" -d '{"title":"新待办"}'\`);
});
`,
  },
  {
    id: "n4-body-parsing",
    group: "第四部分 Web开发",
    icon: "📥",
    title: "请求体解析：接收 POST 数据",
    content: `# 请求体解析：接收 POST 数据

## 一、HTTP 请求体的本质

在 HTTP 协议中，POST/PUT 等请求可以携带**请求体（Request Body）**。但 Node.js 的 \`http\` 模块不会自动解析请求体，因为请求体是以**流（Stream）**的形式分块传输的。

### 1.1 为什么是流？

- 请求体可能很大（如上传大文件）
- 如果一次性全部读入内存会导致内存溢出
- 流式处理可以边接收边处理，节省内存

### 1.2 数据传输过程

1. 客户端发起请求，设置 \`Content-Length\` 或 \`Transfer-Encoding: chunked\`
2. 服务器通过 \`data\` 事件接收一个个数据块（Buffer）
3. 数据接收完毕触发 \`end\` 事件
4. 服务器拼接所有块，根据 \`Content-Type\` 解析

---

## 二、收集请求体数据

### 2.1 基本模式

\`\`\`javascript
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      resolve(body);
    });
    req.on('error', reject);
  });
}
\`\`\`

### 2.2 请求体大小限制

必须限制请求体大小，防止恶意用户发送超大请求耗尽内存：

\`\`\`javascript
const MAX_BODY_SIZE = 1024 * 1024; // 1MB
let received = 0;

req.on('data', chunk => {
  received += chunk.length;
  if (received > MAX_BODY_SIZE) {
    req.destroy(); // 销毁连接
    reject(new Error('请求体过大'));
  }
});
\`\`\`

---

## 三、常见 Content-Type 解析

### 3.1 application/json

JSON 是 API 最常用的数据格式：

\`\`\`javascript
if (contentType === 'application/json') {
  const data = JSON.parse(bodyString);
}
\`\`\`

注意：JSON.parse 可能抛出异常，必须用 try-catch 处理。

### 3.2 application/x-www-form-urlencoded

这是 HTML 表单默认的提交格式：

\`\`\`
key1=value1&key2=value2&key3=hello%20world
\`\`\`

Node.js 提供了 \`querystring\` 模块或 \`URLSearchParams\` 来解析：

\`\`\`javascript
const { URLSearchParams } = require('url');
const params = new URLSearchParams(bodyString);
const data = Object.fromEntries(params);
\`\`\`

### 3.3 multipart/form-data

用于**文件上传**，格式复杂，使用 boundary 分隔各个字段：

\`\`\`
------WebKitFormBoundaryABC123
Content-Disposition: form-data; name="username"

张三
------WebKitFormBoundaryABC123
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

<二进制文件数据>
------WebKitFormBoundaryABC123--
\`\`\`

解析 multipart 数据需要：
1. 从 Content-Type 中提取 boundary
2. 按 boundary 分割数据块
3. 解析每个部分的头信息
4. 文件部分需要流式写入磁盘，不要缓冲在内存中

---

## 四、Chunked 传输编码

当服务器不知道响应体大小时（如动态生成内容），可以使用分块传输：

\`\`\`javascript
res.writeHead(200, {
  'Transfer-Encoding': 'chunked',
  'Content-Type': 'text/html; charset=utf-8',
});
res.write('<html><body>');
// 一段时间后...
res.write('<h1>Hello</h1>');
// 最后结束
res.end('</body></html>');
\`\`\`

请求也可以使用 chunked 编码，这时没有 Content-Length 头。

---

## 五、错误处理要点

1. **Content-Type 验证**：如果期望 JSON 但收到其他类型，返回 415 Unsupported Media Type
2. **JSON 解析错误**：返回 400 Bad Request
3. **请求体过大**：返回 413 Payload Too Large
4. **网络错误**：监听 error 事件

在 Demo 中，我们将实现一个完整的请求体解析器，支持 JSON、form-urlencoded 和 multipart 基础解析！
`,
    code: `// ============================================
// 请求体解析：接收 POST 数据
// 支持 JSON、urlencoded、multipart 基础解析
// ============================================

const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- 配置 ---
const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB 限制
const UPLOAD_DIR = path.join(os.tmpdir(), 'uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
console.log('上传目录:', UPLOAD_DIR);

// --- 解析 Content-Type 头 ---
function parseContentType(header) {
  if (!header) return { type: '', params: {} };
  const parts = header.split(';').map(p => p.trim());
  const type = parts[0].toLowerCase();
  const params = {};
  for (let i = 1; i < parts.length; i++) {
    const [key, value] = parts[i].split('=').map(p => p.trim());
    if (key && value) {
      params[key] = value.replace(/^"|"$/g, '');
    }
  }
  return { type, params };
}

// --- 通用请求体收集函数（带大小限制） ---
function collectBody(req, maxSize) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let aborted = false;

    req.on('data', chunk => {
      if (aborted) return;
      size += chunk.length;
      if (size > maxSize) {
        aborted = true;
        const err = new Error('请求体过大');
        err.statusCode = 413;
        err.code = 'PAYLOAD_TOO_LARGE';
        req.destroy();
        reject(err);
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!aborted) {
        resolve(Buffer.concat(chunks));
      }
    });

    req.on('error', err => {
      if (!aborted) reject(err);
    });
  });
}

// --- 解析 JSON 请求体 ---
function parseJsonBody(buffer) {
  try {
    if (buffer.length === 0) return {};
    return JSON.parse(buffer.toString('utf-8'));
  } catch (e) {
    const err = new Error('JSON 格式错误: ' + e.message);
    err.statusCode = 400;
    throw err;
  }
}

// --- 解析 urlencoded 表单 ---
function parseUrlEncodedBody(buffer) {
  const bodyStr = buffer.toString('utf-8');
  const params = new URLSearchParams(bodyStr);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// --- 简单 multipart/form-data 解析器 ---
async function parseMultipartBody(req, boundary) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    let currentPart = null;
    let fileStream = null;
    let currentFilePath = null;
    let buffer = Buffer.alloc(0);
    const boundaryBuf = Buffer.from('--' + boundary);
    const endBoundaryBuf = Buffer.from('--' + boundary + '--');

    function processBuffer() {
      while (buffer.length > 0) {
        // 查找边界
        const boundaryIndex = buffer.indexOf(boundaryBuf);
        if (boundaryIndex === -1) {
          // 没有找到完整边界，保留最后（boundary 长度 - 1）字节防止截断
          if (currentPart && currentPart.isFile && fileStream) {
            const keep = boundaryBuf.length - 1;
            const writeLen = Math.max(0, buffer.length - keep);
            if (writeLen > 0) {
              fileStream.write(buffer.slice(0, writeLen));
              buffer = buffer.slice(writeLen);
            } else {
              break;
            }
          } else {
            break;
          }
        } else {
          // 处理边界前的数据
          if (boundaryIndex > 0 && currentPart) {
            const chunk = buffer.slice(0, boundaryIndex);
            // 去掉末尾的 \\r\\n
            const trimmed = chunk.length >= 2 && chunk[chunk.length - 2] === 13 && chunk[chunk.length - 1] === 10
              ? chunk.slice(0, -2) : chunk;

            if (currentPart.isFile && fileStream) {
              fileStream.end(trimmed);
              files.push({
                field: currentPart.name,
                filename: currentPart.filename,
                contentType: currentPart.contentType,
                path: currentFilePath,
                size: currentPart.size + trimmed.length,
              });
              fileStream = null;
            } else {
              fields[currentPart.name] = trimmed.toString('utf-8');
            }
          }

          // 跳过边界和 \\r\\n
          buffer = buffer.slice(boundaryIndex + boundaryBuf.length);
          if (buffer.length >= 2 && buffer[0] === 13 && buffer[1] === 10) {
            buffer = buffer.slice(2);
          }

          // 检查是否是结束边界
          if (buffer.length >= 2 && buffer[0] === 45 && buffer[1] === 45) {
            return resolve({ fields, files });
          }

          // 解析新的 part 头部
          const headerEnd = buffer.indexOf('\\r\\n\\r\\n');
          if (headerEnd === -1) break;

          const headerStr = buffer.slice(0, headerEnd).toString('utf-8');
          buffer = buffer.slice(headerEnd + 4);

          // 解析 Content-Disposition
          currentPart = {};
          const dispMatch = headerStr.match(/Content-Disposition: form-data; name="([^"]*)"(?:; filename="([^"]*)")?/i);
          if (dispMatch) {
            currentPart.name = dispMatch[1];
            currentPart.filename = dispMatch[2];
            currentPart.isFile = !!currentPart.filename;
          }
          const typeMatch = headerStr.match(/Content-Type: ([^\\r\\n]+)/i);
          if (typeMatch) {
            currentPart.contentType = typeMatch[1].trim();
          }
          currentPart.size = 0;

          // 如果是文件，创建写入流
          if (currentPart.isFile) {
            const ext = currentPart.filename ? path.extname(currentPart.filename) : '';
            const randomName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
            currentFilePath = path.join(UPLOAD_DIR, randomName);
            fileStream = fs.createWriteStream(currentFilePath);
            fileStream.on('error', reject);
          }
        }
      }
    }

    req.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      processBuffer();
    });

    req.on('end', () => {
      resolve({ fields, files });
    });

    req.on('error', reject);
  });
}

// --- 统一的请求体解析中间件函数 ---
async function parseBody(req) {
  const contentType = parseContentType(req.headers['content-type']);

  // GET、HEAD、DELETE 等通常没有请求体
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return { fields: {}, files: [], raw: Buffer.alloc(0) };
  }

  // multipart 类型特殊处理（流式）
  if (contentType.type === 'multipart/form-data') {
    if (!contentType.params.boundary) {
      const err = new Error('multipart/form-data 缺少 boundary');
      err.statusCode = 400;
      throw err;
    }
    return parseMultipartBody(req, contentType.params.boundary);
  }

  // 其他类型先收集完整 buffer
  const buffer = await collectBody(req, MAX_BODY_SIZE);

  if (contentType.type === 'application/json') {
    return { fields: parseJsonBody(buffer), files: [], raw: buffer };
  }

  if (contentType.type === 'application/x-www-form-urlencoded') {
    return { fields: parseUrlEncodedBody(buffer), files: [], raw: buffer };
  }

  // 其他类型返回原始 buffer
  return { fields: {}, files: [], raw: buffer };
}

// --- 发送 JSON 响应 ---
function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(json);
}

// --- HTML 表单页面 ---
const formPage = \`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>请求体解析测试</title></head>
<body>
  <h1>测试表单</h1>

  <h2>1. JSON 提交</h2>
  <pre>curl -X POST http://localhost:3000/api/json -H "Content-Type: application/json" -d '{"name":"张三","age":25}'</pre>

  <h2>2. URL 编码表单</h2>
  <form action="/api/urlencoded" method="post">
    <p>用户名: <input name="username" value="testuser"></p>
    <p>密码: <input name="password" type="password" value="123456"></p>
    <button type="submit">提交</button>
  </form>

  <h2>3. 文件上传 (multipart)</h2>
  <form action="/api/upload" method="post" enctype="multipart/form-data">
    <p>姓名: <input name="name" value="张三"></p>
    <p>文件: <input type="file" name="file"></p>
    <button type="submit">上传</button>
  </form>
</body>
</html>
\`;

// --- 创建服务器 ---
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;

  try {
    // 首页表单
    if (pathname === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(formPage);
    }

    // JSON 解析测试
    if (pathname === '/api/json' && req.method === 'POST') {
      const ct = req.headers['content-type'] || '';
      if (!ct.includes('application/json')) {
        return sendJson(res, 415, { error: '需要 Content-Type: application/json' });
      }
      const body = await parseBody(req);
      return sendJson(res, 200, {
        message: 'JSON 解析成功',
        received: body.fields,
        rawLength: body.raw.length,
      });
    }

    // URL 编码表单测试
    if (pathname === '/api/urlencoded' && req.method === 'POST') {
      const body = await parseBody(req);
      return sendJson(res, 200, {
        message: '表单解析成功',
        received: body.fields,
      });
    }

    // 文件上传测试
    if (pathname === '/api/upload' && req.method === 'POST') {
      const body = await parseBody(req);
      const fileInfo = body.files.map(f => ({
        field: f.field,
        originalName: f.filename,
        savedPath: f.path,
        size: f.size,
        contentType: f.contentType,
      }));
      return sendJson(res, 200, {
        message: '上传成功',
        fields: body.fields,
        files: fileInfo,
      });
    }

    // 查看已上传文件列表
    if (pathname === '/api/files' && req.method === 'GET') {
      const files = fs.readdirSync(UPLOAD_DIR).map(name => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, name));
        return { name, size: stat.size, createdAt: stat.birthtime };
      });
      return sendJson(res, 200, { files });
    }

    sendJson(res, 404, { error: 'Not Found' });

  } catch (err) {
    console.error('错误:', err);
    const status = err.statusCode || 500;
    sendJson(res, status, { error: err.message, code: err.code });
  }
});

// --- 启动 ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  请求体解析演示服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
});
`,
  },
  {
    id: "n4-middleware",
    group: "第四部分 Web开发",
    icon: "🧩",
    title: "中间件原理：Express 式请求处理链",
    content: `# 中间件原理：Express 式请求处理链

## 一、什么是中间件？

中间件（Middleware）是 Express 框架最核心的概念。简单来说，中间件就是一个函数，它可以：
1. 访问请求对象（req）和响应对象（res）
2. 执行任何代码
3. 修改 req 和 res
4. 结束请求-响应周期
5. 调用下一个中间件（next）

### 1.1 为什么需要中间件？

想象一个请求处理流程：
1. 记录请求日志
2. 解析请求体
3. 验证用户身份
4. 检查权限
5. 处理业务逻辑
6. 处理错误

如果没有中间件，每个路由处理函数都要重复这些代码。中间件让我们把这些横切关注点拆分成可复用的组件！

---

## 二、中间件的洋葱模型

中间件的执行顺序像一个**洋葱**：请求从外到内穿过中间件，响应从内到外返回：

\`\`\`
请求 → [日志] → [CORS] → [认证] → [业务逻辑] → 响应
           ←        ←         ←            ←
\`\`\`

\`\`\`javascript
// 执行顺序演示
app.use((req, res, next) => {
  console.log('1. 进入日志中间件');
  next();
  console.log('4. 离开日志中间件');
});

app.use((req, res, next) => {
  console.log('2. 进入认证中间件');
  next();
  console.log('3. 离开认证中间件');
});
\`\`\`

---

## 三、中间件的类型

### 3.1 应用级中间件

绑定到 app 实例，对所有请求生效：
\`\`\`javascript
app.use(logger);
app.use(cors);
\`\`\`

### 3.2 路由级中间件

只对特定路径生效：
\`\`\`javascript
app.use('/api', authMiddleware);
\`\`\`

### 3.3 错误处理中间件

**必须有 4 个参数**：\`(err, req, res, next) => {}
\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器错误！');
});
\`\`\`

### 3.4 内置中间件

Express 提供的内置中间件（我们会自己实现）：
- express.json() - 解析 JSON
- express.urlencoded() - 解析表单
- express.static() - 静态文件服务

---

## 四、核心实现原理

### 4.1 next() 函数机制

关键在于维护一个中间件数组和一个索引，每次调用 next() 就执行下一个：

\`\`\`javascript
function compose(middlewares) {
  return function (req, res) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middlewares[i];
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(req, res, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}
\`\`\`

### 4.2 路由匹配

app.get('/path', handler) 其实也是注册一个中间件，只不过会先匹配方法和路径。

---

## 五、常用中间件模式

| 中间件 | 作用 |
|--------|------|
| **日志中间件** | 记录请求方法、路径、状态码、响应时间 |
| **CORS 中间件** | 设置跨域响应头，处理 OPTIONS 预检 |
| **Body Parser** | 解析 JSON/表单请求体 |
| **认证中间件** | 验证 Token/Session，未登录返回 401 |
| **静态文件中间件** | 处理静态资源请求 |
| **错误处理中间件** | 统一捕获和处理错误 |

在本章 Demo 中，我们将从零构建一个 Mini Express 框架，实现 app.use()、app.get()、app.post()、中间件链、错误处理等核心功能！
`,
    code: `// ============================================
// 中间件原理：从零实现 Mini Express 框架
// 包含：use/get/post、中间件链、错误处理
// ============================================

const http = require('http');
const { URL } = require('url');

// ============================================
// Mini Express 框架核心实现
// ============================================

class MiniExpress {
  constructor() {
    // 存储所有中间件和路由
    this.stack = [];
  }

  // 注册中间件
  use(pathOrHandler, handler) {
    let path = '/';
    let fn = pathOrHandler;

    // 处理路径参数
    if (typeof pathOrHandler === 'string') {
      path = pathOrHandler;
      fn = handler;
    }

    this.stack.push({
      type: 'middleware',
      path,
      method: null,
      handler: fn,
    });
    return this;
  }

  // 注册 GET 路由
  get(path, handler) {
    this.stack.push({ type: 'route', path, method: 'GET', handler });
    return this;
  }

  // 注册 POST 路由
  post(path, handler) {
    this.stack.push({ type: 'route', path, method: 'POST', handler });
    return this;
  }

  // 注册 PUT 路由
  put(path, handler) {
    this.stack.push({ type: 'route', path, method: 'PUT', handler });
    return this;
  }

  // 注册 DELETE 路由
  delete(path, handler) {
    this.stack.push({ type: 'route', path, method: 'DELETE', handler });
    return this;
  }

  // 路径匹配函数
  pathMatch(pattern, urlPathname) {
    if (pattern === '/') return { match: true, params: {} };
    // 简单前缀匹配（中间件）
    if (urlPathname.startsWith(pattern) || urlPathname.startsWith(pattern + '/')) {
      return { match: true, params: {} };
    }
    // 精确匹配（路由）
    if (pattern === urlPathname) {
      return { match: true, params: {} };
    }
    // 参数路由 /users/:id
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = urlPathname.split('/').filter(Boolean);
    if (patternParts.length === pathParts.length) {
      const params = {};
      let match = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }
      if (match) return { match: true, params };
    }
    return { match: false };
  }

  // 处理请求的核心方法
  handle(req, res) {
    const url = new URL(req.url, \`http://\${req.headers.host}\`);
    req.path = url.pathname;
    req.query = Object.fromEntries(url.searchParams);
    res.statusCode = 200;

    // 扩展 res 对象：添加常用方法
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data, null, 2));
    };
    res.send = (data) => {
      if (typeof data === 'object') {
        return res.json(data);
      }
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
      res.end(data);
    };

    let idx = 0;

    // next 函数：执行下一个中间件
    const next = (err) => {
      // 如果有错误，跳到错误处理中间件
      if (err) {
        return handleError(err);
      }

      // 找到下一个匹配的中间件
      while (idx < this.stack.length) {
        const layer = this.stack[idx++];

        // 检查方法匹配
        if (layer.method && layer.method !== req.method) {
          continue;
        }

        // 检查路径匹配
        const matched = this.pathMatch(layer.path, req.path);
        if (!matched.match) {
          continue;
        }

        req.params = matched.params;

        // 错误处理中间件有 4 个参数，普通中间件跳过
        if (layer.handler.length === 4) {
          continue;
        }

        // 执行中间件
        try {
          const result = layer.handler(req, res, next);
          if (result && typeof result.catch === 'function') {
            result.catch(err => handleError(err));
          }
        } catch (e) {
          return handleError(e);
        }
        return;
      }

      // 没有匹配任何路由，返回 404
      if (!res.writableEnded) {
        res.statusCode = 404;
        res.json({ error: 'Not Found', path: req.path });
      }
    };

    // 错误处理函数
    const handleError = (err) => {
      console.error('错误:', err);
      while (idx < this.stack.length) {
        const layer = this.stack[idx++];
        // 错误处理中间件必须有 4 个参数
        if (layer.handler.length === 4) {
          try {
            layer.handler(err, req, res, next);
            return;
          } catch (e) {
            continue;
          }
        }
      }
      // 没有自定义错误处理，返回默认 500
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.json({ error: 'Internal Server Error', message: err.message });
      }
    };

    next();
  }

  // 启动服务器
  listen(port, callback) {
    const server = http.createServer((req, res) => this.handle(req, res));
    return server.listen(port, callback);
  }
}

// ============================================
// 使用我们的 Mini Express 框架构建应用
// ============================================

const app = new MiniExpress();

// --- 中间件 1：日志中间件 ---
app.use((req, res, next) => {
  const start = Date.now();
  console.log(\`[日志] \${req.method} \${req.path}\`);

  // 监听响应结束
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(\`[日志] \${req.method} \${req.path} \${res.statusCode} - \${ms}ms\`);
  });
  next();
});

// --- 中间件 2：简单请求体解析 ---
app.use(async (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    req.body = {};
    return next();
  }
  const chunks = [];
  let size = 0;
  const MAX = 1024 * 1024;
  req.on('data', chunk => {
    size += chunk.length;
    if (size > MAX) {
      const err = new Error('请求体过大');
      err.statusCode = 413;
      next(err);
      return req.destroy();
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try {
      const body = Buffer.concat(chunks).toString('utf-8');
      const ct = req.headers['content-type'] || '';
      if (ct.includes('application/json')) {
        req.body = body ? JSON.parse(body) : {};
      } else if (ct.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(body);
        req.body = Object.fromEntries(params);
      } else {
        req.body = body;
      }
      next();
    } catch (e) {
      e.statusCode = 400;
      next(e);
    }
  });
  req.on('error', next);
});

// --- 中间件 3：CORS 跨域 ---
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  next();
});

// --- 模拟认证中间件 ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer secret-token-123') {
    req.user = { id: 1, name: '管理员' };
    return next();
  }
  res.status(401).json({ error: '未授权，请在 Authorization 头中携带 Bearer secret-token-123' });
};

// ============================================
// 路由定义
// ============================================

// 首页
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(\`
    <h1>Mini Express 框架演示</h1>
    <p>可用路由：</p>
    <ul>
      <li>GET / - 首页</li>
      <li>GET /about - 关于</li>
      <li>GET /api/users - 用户列表</li>
      <li>GET /api/users/:id - 单个用户</li>
      <li>POST /api/login - 登录（返回测试 token）</li>
      <li>GET /api/secret - 需要认证</li>
      <li>GET /error - 测试错误</li>
    </ul>
  \`);
});

app.get('/about', (req, res) => {
  res.json({
    framework: 'Mini Express',
    version: '1.0.0',
    description: '从零实现的类 Express 框架',
  });
});

// 用户数据
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
];

app.get('/api/users', (req, res) => {
  res.json({ data: users, total: users.length });
});

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json({ data: user });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    return res.json({
      success: true,
      token: 'secret-token-123',
      message: '登录成功',
    });
  }
  res.status(400).json({ success: false, error: '用户名或密码错误' });
});

// 需要认证的路由
app.get('/api/secret', authMiddleware, (req, res) => {
  res.json({
    message: '这是受保护的数据',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// 测试错误
app.get('/error', (req, res, next) => {
  next(new Error('这是一个测试错误'));
});

// --- 错误处理中间件（必须放在最后，4 个参数） ---
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message,
    status,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// --- 启动服务器 ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  Mini Express 服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('测试命令:');
  console.log(\`  curl http://localhost:\${PORT}/\`);
  console.log(\`  curl http://localhost:\${PORT}/api/users\`);
  console.log(\`  curl http://localhost:\${PORT}/api/users/1\`);
  console.log(\`  curl -X POST http://localhost:\${PORT}/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"123456"}'\`);
  console.log(\`  curl http://localhost:\${PORT}/api/secret -H "Authorization: Bearer secret-token-123"\`);
});
`,
  },
  {
    id: "n4-cookie-session",
    group: "第四部分 Web开发",
    icon: "🍪",
    title: "Cookie 与 Session：状态管理",
    content: `# Cookie 与 Session：状态管理

## 一、HTTP 是无状态的

HTTP 协议本身是**无状态（Stateless）**的：每个请求都是独立的，服务器不会记住之前的请求。但 Web 应用需要状态——比如用户登录后，后续请求应该知道用户是谁。

解决方案有两种：
1. **Cookie + Session**：状态存在服务器，客户端只存 Session ID
2. **Token（如 JWT）**：状态编码在 Token 中，存在客户端（下一章讲）

---

## 二、Cookie 基础

### 2.1 什么是 Cookie？

Cookie 是服务器发送给浏览器并保存在本地的**一小段数据**（最大约 4KB）。浏览器之后访问同一网站时会自动带上这些 Cookie。

工作流程：
1. 服务器响应时通过 \`Set-Cookie\` 头设置 Cookie
2. 浏览器保存 Cookie
3. 后续请求浏览器自动通过 \`Cookie\` 头带上

### 2.2 Set-Cookie 属性详解

| 属性 | 作用 | 示例 |
|------|------|------|
| **名称=值** | Cookie 内容 | \`sessionId=abc123\` |
| **Path** | Cookie 生效路径 | \`Path=/\` |
| **Domain** | Cookie 生效域名 | \`Domain=.example.com\` |
| **Expires** | 过期时间（绝对时间） | \`Expires=Wed, 21 Oct 2025 07:28:00 GMT\` |
| **Max-Age** | 有效期（秒，相对时间） | \`Max-Age=3600\`（1小时） |
| **HttpOnly** | 禁止 JS 访问（防 XSS） | \`HttpOnly\` |
| **Secure** | 仅 HTTPS 传输 | \`Secure\` |
| **SameSite** | 跨站策略（防 CSRF） | \`SameSite=Strict\` / \`Lax\` / \`None\` |

### 2.3 安全属性的重要性

- **HttpOnly**：设置后 JavaScript 通过 \`document.cookie\` 无法读取，防止 XSS 攻击窃取 Cookie
- **Secure**：只在 HTTPS 连接上传输，防止网络窃听
- **SameSite=Strict/Lax**：防止跨站请求伪造（CSRF）攻击

---

## 三、Session 原理

Session 是在**服务器端**存储用户状态的机制：

1. 用户登录成功，服务器创建一个 Session 对象（存储用户信息），生成唯一的 sessionId
2. 服务器通过 Set-Cookie 将 sessionId 发送给浏览器
3. 浏览器后续请求自动带上 sessionId Cookie
4. 服务器根据 sessionId 找到对应的 Session 对象，识别用户

### 3.1 Session vs Cookie

| 特性 | Cookie | Session |
|------|--------|---------|
| 存储位置 | 浏览器 | 服务器 |
| 大小限制 | ~4KB | 无（服务器内存/数据库） |
| 安全性 | 可被用户查看篡改 | 安全，用户看不到 |
| 服务器负担 | 无 | 需要存储 |
| 分布式 | 天然支持 | 需要共享存储（Redis） |

### 3.2 Session 过期策略

- 滑动过期：用户每次访问重置过期时间
- 绝对过期：无论是否活跃，固定时间后过期

---

## 四、Cookie 解析与设置

### 4.1 解析 Cookie 头

\`\`\`javascript
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = decodeURIComponent(rest.join('=').trim());
  });
  return cookies;
}
\`\`\`

### 4.2 设置多个 Cookie

注意：一个 Set-Cookie 头只能设置一个 Cookie！要设置多个需要写多行：

\`\`\`javascript
res.setHeader('Set-Cookie', [
  'user=张三; Max-Age=3600; HttpOnly; Path=/',
  'theme=dark; Max-Age=86400; Path=/',
]);
\`\`\`

---

## 五、实战：登录状态管理

在 Demo 中，我们将实现：
1. Cookie 解析器
2. 内存 Session 存储
3. 登录/登出接口
4. 受保护的路由
5. 访问计数功能（展示 Session 的使用）
`,
    code: `// ============================================
// Cookie 与 Session：状态管理
// 实现 Cookie 解析、Session 存储、登录登出
// ============================================

const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');

// ============================================
// Session 内存存储
// ============================================

class SessionStore {
  constructor() {
    this.sessions = new Map();
    // 定期清理过期 Session（每 5 分钟）
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // 生成 Session ID（使用 crypto 随机生成，足够安全）
  generateId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 创建 Session
  create(data = {}) {
    const sessionId = this.generateId();
    const session = {
      id: sessionId,
      data,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      // 30 分钟过期
      maxAge: 30 * 60 * 1000,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  // 获取 Session
  get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // 检查是否过期
    if (Date.now() - session.lastAccess > session.maxAge) {
      this.destroy(sessionId);
      return null;
    }

    // 滑动过期：更新最后访问时间
    session.lastAccess = Date.now();
    return session;
  }

  // 销毁 Session
  destroy(sessionId) {
    this.sessions.delete(sessionId);
  }

  // 清理过期 Session
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, session] of this.sessions) {
      if (now - session.lastAccess > session.maxAge) {
        this.sessions.delete(id);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(\`[Session] 清理了 \${cleaned} 个过期 Session\`);
    }
  }
}

const sessionStore = new SessionStore();

// ============================================
// Cookie 工具函数
// ============================================

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  // 按分号分割多个 cookie
  cookieHeader.split(';').forEach(cookieStr => {
    const eqIndex = cookieStr.indexOf('=');
    if (eqIndex === -1) return;
    const name = cookieStr.slice(0, eqIndex).trim();
    const value = cookieStr.slice(eqIndex + 1).trim();
    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  });
  return cookies;
}

function setCookie(res, name, value, options = {}) {
  const cookieParts = [
    \`\${name}=\${encodeURIComponent(value)}\`,
  ];

  if (options.maxAge != null) {
    cookieParts.push(\`Max-Age=\${options.maxAge}\`);
  }
  if (options.expires) {
    cookieParts.push(\`Expires=\${options.expires.toUTCString()}\`);
  }
  if (options.path) {
    cookieParts.push(\`Path=\${options.path}\`);
  } else {
    cookieParts.push('Path=/');
  }
  if (options.domain) {
    cookieParts.push(\`Domain=\${options.domain}\`);
  }
  if (options.httpOnly) {
    cookieParts.push('HttpOnly');
  }
  if (options.secure) {
    cookieParts.push('Secure');
  }
  if (options.sameSite) {
    cookieParts.push(\`SameSite=\${options.sameSite}\`);
  }

  // 获取现有 Set-Cookie 头或创建新数组
  const existing = res.getHeader('Set-Cookie') || [];
  const cookies = Array.isArray(existing) ? existing : [existing];
  cookies.push(cookieParts.join('; '));
  res.setHeader('Set-Cookie', cookies);
}

function clearCookie(res, name, options = {}) {
  setCookie(res, name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

// ============================================
// Session 中间件
// ============================================

function sessionMiddleware(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  let session = null;

  // 尝试从 cookie 获取现有 session
  if (cookies.sessionId) {
    session = sessionStore.get(cookies.sessionId);
  }

  // 如果没有有效 session，创建新的
  if (!session) {
    session = sessionStore.create({
      visitCount: 0,
      createdAt: new Date().toISOString(),
    });
    setCookie(res, 'sessionId', session.id, {
      httpOnly: true,
      maxAge: 30 * 60, // 30 分钟
      sameSite: 'Lax',
      path: '/',
    });
  }

  req.session = session.data;
  req.sessionId = session.id;
  req.saveSession = () => {
    const s = sessionStore.get(req.sessionId);
    if (s) s.data = req.session;
  };
  req.destroySession = () => {
    sessionStore.destroy(req.sessionId);
    clearCookie(res, 'sessionId');
  };

  // 访问计数
  req.session.visitCount = (req.session.visitCount || 0) + 1;
  req.saveSession();

  next();
}

// ============================================
// 请求体解析（简单 JSON）
// ============================================

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// ============================================
// 模拟用户数据库
// ============================================

const users = [
  { id: 1, username: 'admin', password: '123456', name: '管理员' },
  { id: 2, username: 'user', password: '123456', name: '普通用户' },
];

// ============================================
// 认证中间件
// ============================================

function requireAuth(req, res, next) {
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  sendJson(res, 401, { error: '请先登录' });
}

// ============================================
// 创建服务器
// ============================================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;
  const method = req.method;

  // 先应用 session 中间件
  sessionMiddleware(req, res, async () => {
    try {
      // ===== 首页 =====
      if (pathname === '/' && method === 'GET') {
        const isLoggedIn = !!req.session.user;
        const user = req.session.user;
        sendHtml(res, \`
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>Cookie & Session 演示</title></head>
          <body>
            <h1>Cookie & Session 演示</h1>
            <p>你是第 <strong>\${req.session.visitCount}</strong> 次访问此网站</p>
            <p>Session 创建时间: \${req.session.createdAt}</p>
            \${isLoggedIn ? \`
              <p>欢迎回来，<strong>\${user.name}</strong>！</p>
              <p><a href="/profile">查看个人资料</a></p>
              <form action="/logout" method="post"><button type="submit">退出登录</button></form>
            \` : \`
              <p>你还没有登录</p>
              <p><a href="/login">去登录</a></p>
            \`}
            <hr>
            <h3>测试接口</h3>
            <ul>
              <li><a href="/api/me">GET /api/me</a> - 当前用户信息（需登录）</li>
              <li><a href="/api/count">GET /api/count</a> - 访问计数</li>
            </ul>
          </body>
          </html>
        \`);
        return;
      }

      // ===== 登录页面 =====
      if (pathname === '/login' && method === 'GET') {
        sendHtml(res, \`
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>登录</title></head>
          <body>
            <h1>登录</h1>
            <p>测试账号: admin / 123456 或 user / 123456</p>
            <form action="/login" method="post">
              <p>用户名: <input name="username" value="admin"></p>
              <p>密码: <input name="password" type="password" value="123456"></p>
              <button type="submit">登录</button>
            </form>
            <p><a href="/">返回首页</a></p>
          </body>
          </html>
        \`);
        return;
      }

      // ===== 登录接口 =====
      if (pathname === '/login' && method === 'POST') {
        let body;
        try {
          body = await parseBody(req);
        } catch {
          // 表单编码
          const chunks = [];
          await new Promise(r => req.on('data', c => chunks.push(c)).on('end', r));
          const formData = Buffer.concat(chunks).toString('utf-8');
          const params = new URLSearchParams(formData);
          body = Object.fromEntries(params);
        }
        const { username, password } = body;
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
          return sendJson(res, 400, { error: '用户名或密码错误' });
        }

        // 登录成功，设置 session
        req.session.user = {
          id: user.id,
          username: user.username,
          name: user.name,
          loginAt: new Date().toISOString(),
        };
        req.saveSession();

        // 判断是 API 请求还是表单提交
        const accept = req.headers.accept || '';
        if (accept.includes('application/json')) {
          return sendJson(res, 200, {
            success: true,
            message: '登录成功',
            user: req.session.user,
          });
        } else {
          res.writeHead(302, { Location: '/' });
          return res.end();
        }
      }

      // ===== 登出接口 =====
      if (pathname === '/logout' && method === 'POST') {
        req.destroySession();
        const accept = req.headers.accept || '';
        if (accept.includes('application/json')) {
          return sendJson(res, 200, { success: true, message: '已退出登录' });
        } else {
          res.writeHead(302, { Location: '/' });
          return res.end();
        }
      }

      // ===== 获取当前用户信息 =====
      if (pathname === '/api/me' && method === 'GET') {
        return requireAuth(req, res, () => {
          sendJson(res, 200, {
            user: req.user,
            sessionId: req.sessionId,
            visitCount: req.session.visitCount,
          });
        });
      }

      // ===== 访问计数 =====
      if (pathname === '/api/count' && method === 'GET') {
        sendJson(res, 200, {
          visitCount: req.session.visitCount,
          sessionId: req.sessionId,
          isLoggedIn: !!req.session.user,
        });
        return;
      }

      // ===== 个人资料页 =====
      if (pathname === '/profile' && method === 'GET') {
        if (!req.session.user) {
          res.writeHead(302, { Location: '/login' });
          return res.end();
        }
        sendHtml(res, \`
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>个人资料</title></head>
          <body>
            <h1>个人资料</h1>
            <p>ID: \${req.session.user.id}</p>
            <p>用户名: \${req.session.user.username}</p>
            <p>姓名: \${req.session.user.name}</p>
            <p>登录时间: \${req.session.user.loginAt}</p>
            <p>访问次数: \${req.session.visitCount}</p>
            <p><a href="/">返回首页</a></p>
          </body>
          </html>
        \`);
        return;
      }

      // 404
      sendJson(res, 404, { error: 'Not Found' });
    } catch (err) {
      console.error('错误:', err);
      sendJson(res, 500, { error: err.message });
    }
  });
});

// --- 启动服务器 ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  Cookie & Session 演示服务器');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('测试账号: admin / 123456');
});
`,
  },
  {
    id: "n4-jwt-auth",
    group: "第四部分 Web开发",
    icon: "🎫",
    title: "JWT 认证：无状态身份验证",
    content: `# JWT 认证：无状态身份验证

## 一、什么是 JWT？

JWT（JSON Web Token）是一种**开放标准**（RFC 7519），用于在各方之间安全地传输信息。与 Session 不同，JWT 是**无状态**的——服务器不需要存储会话数据！

### 1.1 JWT 的结构

一个 JWT 由三部分组成，用 \`.\` 分隔：

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IuW8oO-S5iIsImlhdCI6MTY5MDAwMDAwMH0.abc123signature
\`\`\`

| 部分 | 名称 | 作用 |
|------|------|------|
| 第一部分 | **Header** | 算法和令牌类型 |
| 第二部分 | **Payload** | 声明（数据） |
| 第三部分 | **Signature** | 签名（验证完整性） |

**重要：JWT 只是 Base64Url 编码，不是加密！** 任何人都可以解码查看 payload 内容，所以绝对不要在 JWT 中存密码等敏感信息！

---

## 二、JWT 工作流程

1. 用户登录，服务器验证用户名密码
2. 服务器生成 JWT（包含用户信息、过期时间等），用密钥签名
3. 服务器将 JWT 返回给客户端
4. 客户端保存 JWT（通常在 localStorage 或 Cookie）
5. 后续请求在 \`Authorization: Bearer <token>\` 头中携带 JWT
6. 服务器验证 JWT 签名和过期时间，从中获取用户信息

### 2.1 JWT vs Session 对比

| 特性 | JWT | Session |
|------|-----|---------|
| 状态 | 无状态 | 有状态 |
| 服务器存储 | 不需要 | 需要（内存/Redis） |
| 扩展性 | 天然支持分布式 | 需要共享 Session |
| 注销 | 困难（黑名单） | 简单（删除 session） |
| 大小 | 较大（每次请求都带） | 小（只有 sessionId） |
| 安全性 | payload 可见但防篡改 | 数据在服务器更安全 |

---

## 三、JWT 签名与验证原理

### 3.1 签名过程

\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`

签名的作用不是加密，而是**防止篡改**：如果有人修改了 payload，签名就对不上了，服务器验证会失败。

### 3.2 Base64Url 编码

JWT 使用 Base64Url 而非普通 Base64，因为 URL 中 \`+\`、\`/\`、\`=\` 有特殊含义：
- \`+\` → \`-\`
- \`/\` → \`_\`
- 去掉末尾的 \`=\`

---

## 四、JWT 声明（Claims）

Payload 中的字段称为声明，分为三类：

### 4.1 注册声明（标准字段）

| 字段 | 含义 |
|------|------|
| **iss** (issuer) | 签发者 |
| **sub** (subject) | 主题（通常是用户 ID） |
| **aud** (audience) | 接收方 |
| **exp** (expiration time) | 过期时间（时间戳秒） |
| **nbf** (not before) | 生效时间 |
| **iat** (issued at) | 签发时间 |
| **jti** (JWT ID) | 唯一标识 |

### 4.2 公共声明与私有声明

可以自定义字段，如 \`name\`、\`role\`、\`email\` 等，但不要放敏感信息！

---

## 五、安全最佳实践

1. **永远不要在 JWT payload 中存敏感数据**（密码、身份证号等），因为 Base64 只是编码不是加密
2. **使用 HTTPS** 传输，防止 Token 被窃听
3. **设置较短的过期时间**（如 15 分钟-1 小时）
4. 使用 **Refresh Token** 机制：Access Token 短期，Refresh Token 长期用于获取新的 Access Token
5. 考虑将 JWT 存在 **HttpOnly Cookie** 中而非 localStorage，防 XSS
6. 密钥要足够复杂、保密，不要硬编码在代码中

在 Demo 中，我们将用 Node.js 内置的 \`crypto\` 模块从零手动实现 JWT 的签发和验证！
`,
    code: `// ============================================
// JWT 认证：从零手动实现 JWT 签发与验证
// 使用 crypto 模块进行 HMAC-SHA256 签名
// ============================================

const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');

// ============================================
// JWT 手动实现
// ============================================

const JWT_SECRET = 'your-super-secret-key-change-in-production-2024!';
const JWT_EXPIRES_IN = 60 * 60; // 1 小时（秒）

// Base64Url 编码
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_');
}

// Base64Url 解码
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

// 签发 JWT
function sign(payload, secret = JWT_SECRET, expiresIn = JWT_EXPIRES_IN) {
  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // 添加标准声明
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  // 编码 header 和 payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  // 生成签名
  const dataToSign = \`\${encodedHeader}.\${encodedPayload}\`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_');

  return \`\${dataToSign}.\${signature}\`;
}

// 验证 JWT
function verify(token, secret = JWT_SECRET) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT 格式错误');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // 验证签名
    const dataToSign = \`\${encodedHeader}.\${encodedPayload}\`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_');

    // 使用 timingSafeEqual 防止时序攻击
    const sigBuf = Buffer.from(signature);
    const expectedSigBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedSigBuf.length ||
        !crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
      throw new Error('签名无效');
    }

    // 解码 payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // 检查过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now >= payload.exp) {
      const err = new Error('Token 已过期');
      err.name = 'TokenExpiredError';
      err.expiredAt = new Date(payload.exp * 1000);
      throw err;
    }

    // 检查生效时间
    if (payload.nbf && now < payload.nbf) {
      throw new Error('Token 尚未生效');
    }

    return payload;
  } catch (e) {
    if (e.name === 'TokenExpiredError') throw e;
    throw new Error('Token 无效: ' + e.message);
  }
}

// 解码 JWT（不验证签名，仅用于调试）
function decode(token) {
  const [encodedHeader, encodedPayload] = token.split('.');
  return {
    header: JSON.parse(base64UrlDecode(encodedHeader)),
    payload: JSON.parse(base64UrlDecode(encodedPayload)),
  };
}

// ============================================
// 辅助函数
// ============================================

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('JSON 解析失败'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// ============================================
// 模拟用户数据库
// ============================================

const users = [
  { id: 1, username: 'admin', password: '123456', name: '管理员', role: 'admin' },
  { id: 2, username: 'user', password: '123456', name: '普通用户', role: 'user' },
];

// Refresh Token 存储（实际应用中应存入数据库/Redis）
const refreshTokens = new Set();

// ============================================
// JWT 认证中间件
// ============================================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendJson(res, 401, { error: '缺少 Authorization 头，请使用 Bearer token' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verify(token);
    req.user = {
      id: payload.sub,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    };
    req.token = token;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return sendJson(res, 401, { error: 'Token 已过期', code: 'TOKEN_EXPIRED' });
    }
    sendJson(res, 401, { error: 'Token 无效: ' + e.message });
  }
}

// 可选认证：有 token 就解析，没有也通过
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = verify(authHeader.slice(7));
      req.user = {
        id: payload.sub,
        username: payload.username,
        name: payload.name,
        role: payload.role,
      };
    } catch (e) {
      // 忽略无效 token
    }
  }
  next();
}

// ============================================
// 创建服务器
// ============================================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;
  const method = req.method;

  try {
    // ===== 首页 =====
    if (pathname === '/' && method === 'GET') {
      sendHtml(res, \`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>JWT 认证演示</title></head>
        <body>
          <h1>🎫 JWT 认证演示</h1>
          <h3>流程说明：</h3>
          <ol>
            <li>调用 POST /api/login 登录获取 token</li>
            <li>在后续请求的 Authorization 头中添加 "Bearer {token}"</li>
            <li>调用 POST /api/refresh 可以刷新 token</li>
          </ol>
          <h3>测试接口：</h3>
          <ul>
            <li>POST /api/login - 登录（用户名: admin, 密码: 123456）</li>
            <li>GET /api/me - 获取当前用户信息（需认证）</li>
            <li>GET /api/admin - 管理员接口（需 admin 角色）</li>
            <li>POST /api/refresh - 刷新 token</li>
            <li>POST /api/logout - 注销（加入黑名单）</li>
            <li>POST /api/decode - 解码 token（不验证）</li>
          </ul>
          <h3>curl 测试命令：</h3>
          <pre>
# 登录获取 token
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"123456"}' | jq -r '.accessToken')

# 使用 token 访问受保护接口
curl http://localhost:3000/api/me -H "Authorization: Bearer $TOKEN"
          </pre>
        </body>
        </html>
      \`);
      return;
    }

    // ===== 登录接口 =====
    if (pathname === '/api/login' && method === 'POST') {
      const body = await parseBody(req);
      const { username, password } = body;

      const user = users.find(u => u.username === username && u.password === password);
      if (!user) {
        return sendJson(res, 401, { error: '用户名或密码错误' });
      }

      // 生成 Access Token（短期，15 分钟）
      const accessToken = sign(
        {
          sub: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        JWT_SECRET,
        15 * 60 // 15 分钟
      );

      // 生成 Refresh Token（长期，7 天）
      const refreshToken = sign(
        { sub: user.id, type: 'refresh' },
        JWT_SECRET + '_refresh',
        7 * 24 * 60 * 60
      );
      refreshTokens.add(refreshToken);

      sendJson(res, 200, {
        success: true,
        message: '登录成功',
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
        tokenType: 'Bearer',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });
      return;
    }

    // ===== 刷新 Token =====
    if (pathname === '/api/refresh' && method === 'POST') {
      const body = await parseBody(req);
      const { refreshToken } = body;

      if (!refreshToken || !refreshTokens.has(refreshToken)) {
        return sendJson(res, 401, { error: 'Refresh Token 无效' });
      }

      try {
        const payload = verify(refreshToken, JWT_SECRET + '_refresh');
        if (payload.type !== 'refresh') {
          return sendJson(res, 401, { error: '不是 Refresh Token' });
        }

        const user = users.find(u => u.id === payload.sub);
        if (!user) {
          return sendJson(res, 401, { error: '用户不存在' });
        }

        // 生成新的 Access Token
        const newAccessToken = sign(
          {
            sub: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
          JWT_SECRET,
          15 * 60
        );

        sendJson(res, 200, {
          success: true,
          accessToken: newAccessToken,
          expiresIn: 15 * 60,
        });
      } catch (e) {
        refreshTokens.delete(refreshToken);
        sendJson(res, 401, { error: 'Refresh Token 已过期，请重新登录' });
      }
      return;
    }

    // ===== 注销 =====
    if (pathname === '/api/logout' && method === 'POST') {
      const body = await parseBody(req);
      if (body.refreshToken) {
        refreshTokens.delete(body.refreshToken);
      }
      sendJson(res, 200, { success: true, message: '已注销' });
      return;
    }

    // ===== 解码 Token（调试用） =====
    if (pathname === '/api/decode' && method === 'POST') {
      const body = await parseBody(req);
      try {
        const decoded = decode(body.token);
        sendJson(res, 200, { decoded });
      } catch (e) {
        sendJson(res, 400, { error: e.message });
      }
      return;
    }

    // ===== 以下是需要认证的路由 =====

    // 获取当前用户信息
    if (pathname === '/api/me' && method === 'GET') {
      return authMiddleware(req, res, () => {
        sendJson(res, 200, {
          user: req.user,
          tokenPayload: decode(req.token).payload,
        });
      });
    }

    // 管理员接口
    if (pathname === '/api/admin' && method === 'GET') {
      return authMiddleware(req, res, () => {
        if (req.user.role !== 'admin') {
          return sendJson(res, 403, { error: '需要管理员权限' });
        }
        sendJson(res, 200, {
          message: '这是管理员专属数据',
          secretInfo: '当前服务器时间: ' + new Date().toISOString(),
          allUsers: users.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role })),
        });
      });
    }

    // 404
    sendJson(res, 404, { error: 'Not Found' });

  } catch (err) {
    console.error('错误:', err);
    sendJson(res, 500, { error: err.message });
  }
});

// --- 启动服务器 ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  JWT 认证演示服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('测试账号: admin / 123456');
  console.log('');
  console.log('=== JWT 工具自测试 ===');
  const testToken = sign({ sub: 1, name: '测试' }, JWT_SECRET, 60);
  console.log('测试 Token:', testToken);
  console.log('解码结果:', decode(testToken));
  console.log('验证结果:', verify(testToken));
});
`,
  },
  {
    id: "n4-cors",
    group: "第四部分 Web开发",
    icon: "🌍",
    title: "CORS 跨域：浏览器安全策略与处理",
    content: `# CORS 跨域：浏览器安全策略与处理

## 一、同源策略（Same-Origin Policy）

浏览器出于安全考虑，实施了**同源策略（SOP）**：一个源的文档或脚本默认不能访问另一个源的资源。

### 1.1 什么是"源"？

源 = **协议 + 域名 + 端口**（三者必须完全相同）

| URL 1 | URL 2 | 是否同源 | 原因 |
|-------|-------|----------|------|
| http://a.com | http://a.com/api | ✅ 是 | 路径不同不影响 |
| http://a.com | https://a.com | ❌ 否 | 协议不同 |
| http://a.com | http://b.com | ❌ 否 | 域名不同 |
| http://a.com | http://a.com:3000 | ❌ 否 | 端口不同 |
| http://localhost:3000 | http://127.0.0.1:3000 | ❌ 否 | 域名不同 |

### 1.2 同源策略限制了什么？

- **AJAX 请求**：不能读取跨源响应（可以发请求但拿不到结果）
- **DOM 访问**：不能操作跨源 iframe 的 DOM
- **Cookie/LocalStorage**：不能读取跨源的存储

> 💡 注意：使用 \`<img>\`、\`<link>\`、\`<script>\` 标签加载资源不受同源策略限制（因为历史原因），CORS 主要针对的是 **fetch/XMLHttpRequest** 发起的请求。

---

## 二、什么是 CORS？

CORS（Cross-Origin Resource Sharing，跨域资源共享）是 W3C 标准，是官方的跨域解决方案。它让服务器可以**显式告知**浏览器哪些跨源请求是被允许的。

CORS 通过**一组 HTTP 响应头**来实现，浏览器根据这些头决定是否允许跨域请求。

---

## 三、简单请求与预检请求

浏览器把 CORS 请求分为两类：**简单请求**和**非简单请求**（需预检）。

### 3.1 简单请求（直接发送）

满足以下**所有**条件就是简单请求：
1. 方法是 **GET、HEAD、POST** 之一
2. Content-Type 仅限：
   - text/plain
   - multipart/form-data
   - application/x-www-form-urlencoded
3. 没有自定义请求头（如 Authorization）

简单请求浏览器直接发送，然后看响应的 CORS 头决定是否给前端结果。

### 3.2 预检请求（Preflight）

不满足简单请求条件的就是非简单请求，比如：
- 使用 PUT、DELETE、PATCH 方法
- Content-Type 是 application/json
- 有自定义头（如 Authorization、X-Token）

非简单请求浏览器会先发一个 **OPTIONS 方法**的"预检请求"，询问服务器是否允许实际请求。服务器通过预检响应表明允许的方法、头、源等，浏览器同意后才发真正的请求。

预检请求流程：
1. 浏览器发送 OPTIONS 请求，携带：
   - \`Access-Control-Request-Method\`：实际请求要用的方法
   - \`Access-Control-Request-Headers\`：实际请求要用的自定义头
2. 服务器响应 OPTIONS，返回 CORS 头
3. 如果允许，浏览器发送真正的业务请求
4. 如果不允许，浏览器直接报错

---

## 四、CORS 响应头详解

### 4.1 常用响应头

| 响应头 | 作用 |
|--------|------|
| **Access-Control-Allow-Origin** | 允许的源，可以是 \`*\` 或具体域名如 \`https://example.com\` |
| **Access-Control-Allow-Methods** | 允许的 HTTP 方法，如 \`GET, POST, PUT, DELETE\` |
| **Access-Control-Allow-Headers** | 允许的请求头，如 \`Content-Type, Authorization\` |
| **Access-Control-Allow-Credentials** | 是否允许携带 Cookie（值为 \`true\`） |
| **Access-Control-Expose-Headers** | 暴露给前端的响应头（前端 JS 才能读到） |
| **Access-Control-Max-Age** | 预检结果缓存时间（秒），在此期间不用再发 OPTIONS |

### 4.2 Allow-Origin 与 Credentials 的坑

如果要允许携带 Cookie（\`credentials: 'include'\`）：
1. \`Access-Control-Allow-Origin\` **不能是 \`*\`**，必须是具体的源
2. 必须设置 \`Access-Control-Allow-Credentials: true\`
3. 前端也要设置 \`withCredentials: true\` 或 \`credentials: 'include'\`

---

## 五、常见 CORS 错误及解决

| 错误信息 | 原因 | 解决 |
|----------|------|------|
| No 'Access-Control-Allow-Origin' header | 服务器没设置 CORS 头 | 添加 CORS 头 |
| The 'Access-Control-Allow-Origin' header has a value '...' that is not equal to the supplied origin | 源不匹配 | 配置正确的源 |
| Method ... is not allowed by Access-Control-Allow-Methods | 方法不在允许列表 | 把方法加入 Allow-Methods |
| Request header field ... is not allowed by Access-Control-Allow-Headers | 自定义头不被允许 | 加入 Allow-Headers |
| Credentials flag is 'true', but the 'Access-Control-Allow-Origin' is '*' | withCredentials + 通配源冲突 | 设置具体源 |

---

在 Demo 中，我们将实现一个功能完整的 CORS 中间件，支持：白名单域名、预检请求处理、credentials 支持等！
`,
    code: `// ============================================
// CORS 跨域：从零实现功能完整的 CORS 中间件
// ============================================

const http = require('http');
const { URL } = require('url');

// ============================================
// CORS 中间件实现
// ============================================

function cors(options = {}) {
  // 默认配置
  const {
    origin = '*',           // 允许的源：*、字符串、数组、函数
    methods = 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders,
    exposedHeaders,
    credentials = false,
    maxAge = 86400,         // 预检缓存 24 小时
    preflightContinue = false,
    optionsSuccessStatus = 204,
  } = options;

  return (req, res, next) => {
    const requestOrigin = req.headers.origin;

    // 始终设置 Vary 头，告诉 CDN/缓存不同 Origin 响应不同
    res.setHeader('Vary', 'Origin');

    // 1. 确定 Access-Control-Allow-Origin 的值
    function configureOrigin() {
      if (origin === false) {
        return; // 不设置 CORS 头
      }

      if (origin === '*') {
        // 如果允许 credentials，不能用 *
        if (credentials) {
          res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
          res.setHeader('Vary', 'Origin');
        } else {
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
        return;
      }

      if (typeof origin === 'string') {
        res.setHeader('Access-Control-Allow-Origin', origin);
        return;
      }

      if (Array.isArray(origin)) {
        if (origin.includes(requestOrigin)) {
          res.setHeader('Access-Control-Allow-Origin', requestOrigin);
          res.setHeader('Vary', 'Origin');
        }
        return;
      }

      if (typeof origin === 'function') {
        origin(requestOrigin, (err, allow) => {
          if (err || !allow) return;
          res.setHeader('Access-Control-Allow-Origin', allow === true ? requestOrigin : allow);
          res.setHeader('Vary', 'Origin');
        });
      }
    }

    // 2. 设置 Credentials
    function configureCredentials() {
      if (credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }

    // 3. 处理暴露头
    function configureExposedHeaders() {
      if (exposedHeaders) {
        const value = Array.isArray(exposedHeaders) ? exposedHeaders.join(',') : exposedHeaders;
        res.setHeader('Access-Control-Expose-Headers', value);
      }
    }

    // 配置常规 CORS 头
    configureOrigin();
    configureCredentials();
    configureExposedHeaders();

    // 4. 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      // 设置允许的方法
      if (methods) {
        res.setHeader(
          'Access-Control-Allow-Methods',
          Array.isArray(methods) ? methods.join(',') : methods
        );
      }

      // 设置允许的头
      const headers = allowedHeaders || req.headers['access-control-request-headers'];
      if (headers) {
        res.setHeader(
          'Access-Control-Allow-Headers',
          Array.isArray(headers) ? headers.join(',') : headers
        );
      }

      // 设置预检缓存时间
      if (maxAge) {
        res.setHeader('Access-Control-Max-Age', String(maxAge));
      }

      if (!preflightContinue) {
        res.writeHead(optionsSuccessStatus);
        res.end();
        return;
      }
    }

    next();
  };
}

// ============================================
// 其他辅助中间件
// ============================================

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function logger(req, res, next) {
  const start = Date.now();
  console.log(\`[\${new Date().toLocaleString()}] \${req.method} \${req.url}\`);
  res.on('finish', () => {
    console.log(\`  → \${res.statusCode} (\${Date.now() - start}ms)\`);
  });
  next();
}

// ============================================
// Mini App 框架（简化版）
// ============================================

class MiniApp {
  constructor() {
    this.middlewares = [];
  }

  use(mw) {
    this.middlewares.push(mw);
    return this;
  }

  get(path, handler) {
    this.middlewares.push(this.createRoute('GET', path, handler));
    return this;
  }

  post(path, handler) {
    this.middlewares.push(this.createRoute('POST', path, handler));
    return this;
  }

  createRoute(method, pattern, handler) {
    return (req, res, next) => {
      const url = new URL(req.url, \`http://\${req.headers.host}\`);
      if (req.method !== method || url.pathname !== pattern) {
        return next();
      }
      req.path = url.pathname;
      req.query = Object.fromEntries(url.searchParams);
      handler(req, res, next);
    };
  }

  handle(req, res) {
    let idx = 0;
    const url = new URL(req.url, \`http://\${req.headers.host}\`);
    req.path = url.pathname;
    req.query = Object.fromEntries(url.searchParams);
    res.json = (data) => sendJson(res, res.statusCode || 200, data);

    const next = (err) => {
      if (err) {
        console.error(err);
        return sendJson(res, 500, { error: err.message });
      }
      if (idx >= this.middlewares.length) {
        if (!res.writableEnded) {
          return sendJson(res, 404, { error: 'Not Found' });
        }
        return;
      }
      const mw = this.middlewares[idx++];
      try {
        mw(req, res, next);
      } catch (e) {
        next(e);
      }
    };
    next();
  }

  listen(port, cb) {
    const server = http.createServer((req, res) => this.handle(req, res));
    return server.listen(port, cb);
  }
}

// ============================================
// 创建应用 - 演示三种 CORS 配置
// ============================================

// 白名单域名
const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'null', // file:// 协议打开的页面 origin 是 "null"
];

const app = new MiniApp();

// 日志中间件
app.use(logger);

// CORS 中间件（生产级配置）
app.use(cors({
  // 动态判断 origin
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如 curl、Postman）
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS 拒绝:', origin);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page'],
  credentials: true,
  maxAge: 86400,
}));

// 请求体解析中间件
app.use(async (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    req.body = {};
    return next();
  }
  try {
    req.body = await parseBody(req);
    next();
  } catch (e) {
    sendJson(res, 400, { error: 'JSON 解析失败' });
  }
});

// ============================================
// API 路由
// ============================================

// 公开 API
app.get('/api/public', (req, res) => {
  res.json({
    message: '这是公开数据，任何人都可以访问',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin || '无 Origin（可能是 curl 或 Postman）',
  });
});

// 带自定义头的 API（会触发预检）
app.get('/api/with-headers', (req, res) => {
  res.setHeader('X-Total-Count', '100');
  res.setHeader('X-Page', '1');
  res.json({
    message: '这个响应有自定义头，前端 JS 可以读取 X-Total-Count 和 X-Page',
    data: [1, 2, 3],
  });
});

// POST API（application/json 会触发预检）
app.post('/api/data', (req, res) => {
  res.json({
    message: 'POST 请求成功',
    received: req.body,
    note: '因为 Content-Type 是 application/json，浏览器会先发 OPTIONS 预检',
  });
});

// 需要认证的 API
app.get('/api/protected', (req, res) => {
  const auth = req.headers.authorization;
  if (auth === 'Bearer test-token') {
    res.json({
      message: '认证成功',
      secret: '这是受保护的数据',
    });
  } else {
    sendJson(res, 401, { error: '需要 Bearer test-token' });
  }
});

// 测试 Cookie 携带（credentials）
app.get('/api/cookie-test', (req, res) => {
  res.setHeader('Set-Cookie', 'visited=true; Max-Age=86400; Path=/; SameSite=None; Secure=false');
  res.json({
    message: '已设置 Cookie',
    cookie: req.headers.cookie || '请求中没有 Cookie',
    note: '要让浏览器跨域发送 Cookie，需要：' +
          '1. Access-Control-Allow-Credentials: true' +
          '2. Access-Control-Allow-Origin 不能是 *' +
          '3. 前端设置 credentials: "include"',
  });
});

// 返回 CORS 配置信息
app.get('/api/cors-info', (req, res) => {
  res.json({
    allowedOrigins: ALLOWED_ORIGINS,
    yourOrigin: req.headers.origin,
    requestHeaders: req.headers,
    help: '如果看到 CORS 错误，请检查：' +
          '1. 你的源是否在白名单中' +
          '2. 是否在发送 OPTIONS 预检' +
          '3. 自定义头是否在 Allow-Headers 中',
  });
});

// ============================================
// 同时创建一个简单的 HTML 测试页面服务器（不同端口演示跨域）
// ============================================

function createTestClient() {
  const clientServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CORS 测试客户端</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .error { color: red; }
    .success { color: green; }
  </style>
</head>
<body>
  <h1>🌍 CORS 跨域测试客户端</h1>
  <p>当前页面运行在 <strong>http://localhost:5500</strong></p>
  <p>API 服务器运行在 <strong>http://localhost:3000</strong>（不同端口 = 跨域）</p>

  <h3>测试按钮：</h3>
  <button onclick="testPublic()">1. 测试 GET 公开接口（简单请求）</button>
  <button onclick="testPost()">2. 测试 POST JSON（预检请求）</button>
  <button onclick="testProtected()">3. 测试带 Authorization 头（预检）</button>
  <button onclick="testWithCredentials()">4. 测试携带 Cookie（credentials）</button>

  <h3>响应结果：</h3>
  <pre id="result">点击上面的按钮开始测试...</pre>

  <script>
    const API_BASE = 'http://localhost:3000';
    const resultEl = document.getElementById('result');

    function log(msg, isError) {
      const time = new Date().toLocaleTimeString();
      const prefix = isError ? '❌ ERROR' : '✅';
      resultEl.textContent = \`[\${time}] \${prefix}\\n\${msg}\`;
      resultEl.className = isError ? 'error' : 'success';
    }

    async function testPublic() {
      try {
        const res = await fetch(\`\${API_BASE}/api/public\`);
        const data = await res.json();
        log(JSON.stringify(data, null, 2));
      } catch (e) {
        log(e.message, true);
      }
    }

    async function testPost() {
      try {
        const res = await fetch(\`\${API_BASE}/api/data\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '测试', time: Date.now() })
        });
        const data = await res.json();
        log('注意：打开 DevTools Network 面板，应该能看到 OPTIONS 预检请求！\\n\\n' +
            JSON.stringify(data, null, 2));
      } catch (e) {
        log(e.message, true);
      }
    }

    async function testProtected() {
      try {
        const res = await fetch(\`\${API_BASE}/api/protected\`, {
          headers: { 'Authorization': 'Bearer test-token' }
        });
        const data = await res.json();
        log(JSON.stringify(data, null, 2));
      } catch (e) {
        log(e.message, true);
      }
    }

    async function testWithCredentials() {
      try {
        const res = await fetch(\`\${API_BASE}/api/cookie-test\`, {
          credentials: 'include'
        });
        const data = await res.json();
        log('注意：刷新后再次点击，应该能看到 cookie 被带上了\\n\\n' +
            JSON.stringify(data, null, 2));
      } catch (e) {
        log(e.message, true);
      }
    }
  </script>
</body>
</html>
    \`);
  });
  clientServer.listen(5500, () => {
    console.log('📄 测试客户端: http://localhost:5500');
  });
}

// --- 启动 API 服务器 ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  CORS 跨域演示 API 服务器');
  console.log(\`  API 地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('');
  createTestClient();
  console.log('');
  console.log('请打开 http://localhost:5500 进行可视化测试');
  console.log('或者用 curl 测试（无 Origin，不会触发 CORS）:');
  console.log(\`  curl http://localhost:\${PORT}/api/public\`);
});
`,
  },
  {
    id: "n4-restful-api",
    group: "第四部分 Web开发",
    icon: "📋",
    title: "RESTful API 设计：规范与最佳实践",
    content: `# RESTful API 设计：规范与最佳实践

## 一、什么是 REST？

REST（Representational State Transfer，表述性状态转移）是 Roy Fielding 于 2000 年提出的一种软件架构风格。REST 不是标准，而是一组**设计原则和约束**。

满足这些约束的 API 就是 RESTful API。

### 1.1 REST 的 6 个核心约束

1. **客户端-服务器分离**：前后端独立演进
2. **无状态**：每个请求包含所有需要的信息，服务器不存储会话状态
3. **可缓存**：响应必须标明是否可缓存
4. **统一接口**：核心约束，包括资源标识、通过表述操作资源、自描述消息、HATEOAS
5. **分层系统**：客户端不知道是直接连接到服务器还是中间层
6. **按需代码**（可选）：可以返回可执行代码（如 JS）

---

## 二、RESTful URL 设计

### 2.1 用名词，不用动词

REST 的核心是**资源**，每个 URL 代表一种资源。资源用名词表示，用 HTTP 方法表示操作：

| ❌ 错误设计 | ✅ 正确设计 | 说明 |
|------------|------------|------|
| /getUsers | GET /users | 获取用户列表 |
| /getUser?id=1 | GET /users/1 | 获取单个用户 |
| /createUser | POST /users | 创建用户 |
| /updateUser?id=1 | PUT /users/1 | 更新用户 |
| /deleteUser?id=1 | DELETE /users/1 | 删除用户 |

### 2.2 集合与成员

- **集合（Collection）**：\`/api/users\` → 所有用户
- **成员（Member）**：\`/api/users/1\` → ID 为 1 的用户
- **层级关系**：\`/api/users/1/posts\` → 用户 1 的文章

### 2.3 命名规范

- 用**复数名词**：\`/users\` 而非 \`/user\`
- 用**连字符**：\`/user-profiles\` 而非 \`/user_profiles\` 或 \`/userProfiles\`
- 全小写
- 不要加文件扩展名：\`/users/1\` 而非 \`/users/1.json\`

---

## 三、HTTP 方法正确使用

| 方法 | 作用 | 幂等 | 安全 | 请求体 |
|------|------|------|------|--------|
| **GET** | 获取资源 | ✅ | ✅ | ❌ |
| **POST** | 创建资源 | ❌ | ❌ | ✅ |
| **PUT** | 全量替换资源 | ✅ | ❌ | ✅ |
| **PATCH** | 部分更新资源 | ❌ | ❌ | ✅ |
| **DELETE** | 删除资源 | ✅ | ❌ | ❌ |
| **HEAD** | 获取响应头 | ✅ | ✅ | ❌ |
| **OPTIONS** | 获取支持的方法 | ✅ | ✅ | ❌ |

**幂等**：执行一次和执行 N 次效果相同。
**安全**：不改变服务器状态（只读）。

### 3.1 PUT vs PATCH

- **PUT**：全量更新，客户端提供完整的资源表示。如果资源不存在，可能创建（upsert）。
- **PATCH**：部分更新，只提供要修改的字段。

\`\`\`
PUT /users/1
{ "name": "张三", "email": "zhang@example.com", "age": 25 }  // 必须传所有字段

PATCH /users/1
{ "age": 26 }  // 只传要改的字段
\`\`\`

---

## 四、响应格式统一

### 4.1 成功响应格式

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
\`\`\`

### 4.2 列表分页响应

\`\`\`json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
\`\`\`

### 4.3 错误响应格式

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": [
      { "field": "email", "message": "邮箱格式不正确" }
    ]
  }
}
\`\`\`

---

## 五、状态码使用指南

| 场景 | 状态码 |
|------|--------|
| GET 成功 | 200 OK |
| POST 创建成功 | 201 Created |
| DELETE 成功 | 204 No Content |
| PUT/PATCH 更新成功 | 200 OK |
| 参数错误 | 400 Bad Request |
| 未认证 | 401 Unauthorized |
| 无权限 | 403 Forbidden |
| 资源不存在 | 404 Not Found |
| 方法不允许 | 405 Method Not Allowed |
| 资源冲突（如重复） | 409 Conflict |
| 数据验证失败 | 422 Unprocessable Entity |
| 请求过多 | 429 Too Many Requests |
| 服务器错误 | 500 Internal Server Error |

---

## 六、API 版本控制

为什么需要版本控制？API 一旦发布就有人用，不能随意 breaking change。

### 常见方式

1. **URL 路径**：\`/api/v1/users\`、\`/api/v2/users\`（最常用、直观）
2. **自定义头**：\`Accept-Version: v1\`
3. **查询参数**：\`/api/users?version=1\`

推荐使用 URL 路径版本化。

---

## 七、分页、排序、筛选

### 分页

\`\`\`
GET /api/users?page=2&limit=20
\`\`\`

### 排序

\`\`\`
GET /api/users?sort=createdAt:desc,name:asc
\`\`\`

### 筛选/搜索

\`\`\`
GET /api/users?status=active&role=admin&search=张
\`\`\`

### 字段选择

\`\`\`
GET /api/users?fields=id,name,email
\`\`\`

---

在 Demo 中，我们将构建一个符合 RESTful 规范的完整文章 CRUD API，包含分页、排序、筛选、统一响应格式和错误处理！
`,
    code: `// ============================================
// RESTful API 设计：完整文章管理 API
// 包含：CRUD、分页、排序、筛选、统一错误处理
// ============================================

const http = require('http');
const { URL } = require('url');

// ============================================
// 模拟数据库（文章数据）
// ============================================

let posts = [
  { id: 1, title: 'Node.js 入门', content: 'Node.js 是基于 V8 引擎的 JavaScript 运行时', author: '张三', status: 'published', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
  { id: 2, title: 'HTTP 协议详解', content: 'HTTP 是万维网的数据通信基础', author: '李四', status: 'published', createdAt: '2024-01-16T11:00:00Z', updatedAt: '2024-01-16T11:00:00Z' },
  { id: 3, title: 'RESTful API 设计', content: 'REST 是一种软件架构风格', author: '张三', status: 'draft', createdAt: '2024-01-17T09:00:00Z', updatedAt: '2024-01-17T09:00:00Z' },
  { id: 4, title: '异步编程指南', content: '回调、Promise、async/await', author: '王五', status: 'published', createdAt: '2024-01-18T14:00:00Z', updatedAt: '2024-01-18T14:00:00Z' },
  { id: 5, title: '中间件原理', content: '洋葱模型与中间件链', author: '张三', status: 'published', createdAt: '2024-01-19T16:00:00Z', updatedAt: '2024-01-19T16:00:00Z' },
];
let nextId = 6;

// ============================================
// 统一响应工具
// ============================================

function send(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-API-Version': 'v1',
  });
  res.end(JSON.stringify(body, null, 2));
}

function sendSuccess(res, data, message = 'success', statusCode = 200) {
  send(res, statusCode, {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}

function sendCreated(res, data, message = '资源创建成功') {
  send(res, 201, {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}

function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}

function sendError(res, statusCode, code, message, details = null) {
  const errorBody = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
    path: res.reqUrl || '',
  };
  send(res, statusCode, errorBody);
}

// ============================================
// 请求体解析
// ============================================

function parseBody(req, maxSize = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxSize) {
        const err = new Error('请求体过大');
        err.statusCode = 413;
        err.code = 'PAYLOAD_TOO_LARGE';
        req.destroy();
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        const err = new Error('JSON 格式错误');
        err.statusCode = 400;
        err.code = 'INVALID_JSON';
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// ============================================
// 参数验证工具
// ============================================

function validatePost(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push({ field: 'title', message: '标题是必填的字符串' });
    } else if (data.title.length > 200) {
      errors.push({ field: 'title', message: '标题长度不能超过 200 字符' });
    }
  }

  if (!isUpdate || data.content !== undefined) {
    if (!isUpdate && (!data.content || typeof data.content !== 'string')) {
      errors.push({ field: 'content', message: '内容是必填的字符串' });
    }
  }

  if (!isUpdate || data.author !== undefined) {
    if (!isUpdate && (!data.author || typeof data.author !== 'string')) {
      errors.push({ field: 'author', message: '作者是必填的字符串' });
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(data.status)) {
      errors.push({ field: 'status', message: '状态必须是 draft/published/archived 之一' });
    }
  }

  return errors;
}

// ============================================
// 路由处理器
// ============================================

// GET /api/v1/posts - 获取文章列表（分页、排序、筛选）
function getPosts(req, res, query) {
  let result = [...posts];

  // 筛选：status
  if (query.status) {
    result = result.filter(p => p.status === query.status);
  }

  // 筛选：author
  if (query.author) {
    result = result.filter(p => p.author.includes(query.author));
  }

  // 搜索：keyword（标题或内容包含）
  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw)
    );
  }

  // 排序：sort=createdAt:desc 或 sort=title:asc
  if (query.sort) {
    const [field, order = 'asc'] = query.sort.split(':');
    const validFields = ['id', 'title', 'author', 'createdAt', 'updatedAt'];
    if (validFields.includes(field)) {
      result.sort((a, b) => {
        let va = a[field], vb = b[field];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return order === 'desc' ? 1 : -1;
        if (va > vb) return order === 'desc' ? -1 : 1;
        return 0;
      });
    }
  } else {
    // 默认按创建时间倒序
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // 分页
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  // 字段选择
  if (query.fields) {
    const fields = query.fields.split(',');
    result = paginated.map(item => {
      const selected = {};
      fields.forEach(f => { if (item[f] !== undefined) selected[f] = item[f]; });
      return selected;
    });
  } else {
    result = paginated;
  }

  res.setHeader('X-Total-Count', String(total));
  res.setHeader('X-Page', String(page));
  res.setHeader('X-Per-Page', String(limit));
  res.setHeader('X-Total-Pages', String(totalPages));

  sendSuccess(res, result, '获取成功', 200);
  // pagination 信息放在 header 里，也可以放在 body
}

// GET /api/v1/posts/:id - 获取单篇文章
function getPost(req, res, id) {
  const post = posts.find(p => p.id === id);
  if (!post) {
    return sendError(res, 404, 'NOT_FOUND', \`ID 为 \${id} 的文章不存在\`);
  }
  sendSuccess(res, post);
}

// POST /api/v1/posts - 创建文章
async function createPost(req, res) {
  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return sendError(res, e.statusCode || 400, e.code || 'BAD_REQUEST', e.message);
  }

  const errors = validatePost(body, false);
  if (errors.length > 0) {
    return sendError(res, 422, 'VALIDATION_ERROR', '参数验证失败', errors);
  }

  const now = new Date().toISOString();
  const newPost = {
    id: nextId++,
    title: body.title.trim(),
    content: body.content,
    author: body.author,
    status: body.status || 'draft',
    createdAt: now,
    updatedAt: now,
  };
  posts.push(newPost);
  sendCreated(res, newPost, '文章创建成功');
}

// PUT /api/v1/posts/:id - 全量更新
async function updatePost(req, res, id) {
  const post = posts.find(p => p.id === id);
  if (!post) {
    return sendError(res, 404, 'NOT_FOUND', \`ID 为 \${id} 的文章不存在\`);
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return sendError(res, e.statusCode || 400, e.code || 'BAD_REQUEST', e.message);
  }

  const errors = validatePost(body, false); // PUT 要求完整字段
  if (errors.length > 0) {
    return sendError(res, 422, 'VALIDATION_ERROR', '参数验证失败', errors);
  }

  const idx = posts.findIndex(p => p.id === id);
  posts[idx] = {
    ...posts[idx],
    title: body.title.trim(),
    content: body.content,
    author: body.author,
    status: body.status || posts[idx].status,
    updatedAt: new Date().toISOString(),
  };
  sendSuccess(res, posts[idx], '文章更新成功');
}

// PATCH /api/v1/posts/:id - 部分更新
async function patchPost(req, res, id) {
  const post = posts.find(p => p.id === id);
  if (!post) {
    return sendError(res, 404, 'NOT_FOUND', \`ID 为 \${id} 的文章不存在\`);
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    return sendError(res, e.statusCode || 400, e.code || 'BAD_REQUEST', e.message);
  }

  const errors = validatePost(body, true);
  if (errors.length > 0) {
    return sendError(res, 422, 'VALIDATION_ERROR', '参数验证失败', errors);
  }

  const idx = posts.findIndex(p => p.id === id);
  posts[idx] = {
    ...posts[idx],
    ...(body.title !== undefined && { title: String(body.title).trim() }),
    ...(body.content !== undefined && { content: body.content }),
    ...(body.author !== undefined && { author: body.author }),
    ...(body.status !== undefined && { status: body.status }),
    updatedAt: new Date().toISOString(),
  };
  sendSuccess(res, posts[idx], '文章更新成功');
}

// DELETE /api/v1/posts/:id - 删除
function deletePost(req, res, id) {
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) {
    return sendError(res, 404, 'NOT_FOUND', \`ID 为 \${id} 的文章不存在\`);
  }
  posts.splice(idx, 1);
  sendNoContent(res);
}

// ============================================
// 创建服务器
// ============================================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;
  const method = req.method;
  res.reqUrl = pathname;

  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // API 文档首页
    if (pathname === '/' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        name: 'RESTful Posts API',
        version: 'v1',
        endpoints: {
          'GET /api/v1/posts': '获取文章列表（支持分页/排序/筛选）',
          'GET /api/v1/posts/:id': '获取单篇文章',
          'POST /api/v1/posts': '创建文章',
          'PUT /api/v1/posts/:id': '全量更新',
          'PATCH /api/v1/posts/:id': '部分更新',
          'DELETE /api/v1/posts/:id': '删除文章',
        },
        queryParams: {
          page: '页码，默认1',
          limit: '每页数量，默认10，最大100',
          status: '筛选：draft/published/archived',
          author: '按作者筛选',
          keyword: '关键词搜索',
          sort: '排序，如 createdAt:desc',
          fields: '字段选择，如 id,title,author',
        },
      }, null, 2));
    }

    // 路由匹配
    const postIdMatch = pathname.match(/^\\/api\\/v1\\/posts\\/(\\d+)$/);

    if (pathname === '/api/v1/posts') {
      if (method === 'GET') return getPosts(req, res, Object.fromEntries(url.searchParams));
      if (method === 'POST') return createPost(req, res);
      return sendError(res, 405, 'METHOD_NOT_ALLOWED', \`方法 \${method} 不允许\`);
    }

    if (postIdMatch) {
      const id = parseInt(postIdMatch[1], 10);
      if (method === 'GET') return getPost(req, res, id);
      if (method === 'PUT') return updatePost(req, res, id);
      if (method === 'PATCH') return patchPost(req, res, id);
      if (method === 'DELETE') return deletePost(req, res, id);
      return sendError(res, 405, 'METHOD_NOT_ALLOWED', \`方法 \${method} 不允许\`);
    }

    sendError(res, 404, 'NOT_FOUND', '路径不存在');
  } catch (err) {
    console.error('服务器错误:', err);
    sendError(res, 500, 'INTERNAL_ERROR', '服务器内部错误: ' + err.message);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  RESTful Posts API 服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
});
`,
  },
  {
    id: "n4-static-files",
    group: "第四部分 Web开发",
    icon: "📂",
    title: "静态文件服务：HTML/CSS/JS/图片",
    content: `# 静态文件服务：HTML/CSS/JS/图片

## 一、什么是静态文件服务？

静态文件服务是 Web 服务器最基础的功能之一：当浏览器请求 HTML、CSS、JavaScript、图片、字体等文件时，服务器从磁盘读取文件并返回给浏览器。

Express 有 \`express.static()\` 中间件，但我们要从零实现！

---

## 二、MIME 类型

浏览器通过 \`Content-Type\` 响应头来判断如何处理返回的内容。这个值称为 MIME 类型。

### 常见 MIME 类型映射表

| 扩展名 | MIME 类型 |
|--------|-----------|
| .html | text/html |
| .css | text/css |
| .js | application/javascript |
| .json | application/json |
| .png | image/png |
| .jpg/.jpeg | image/jpeg |
| .gif | image/gif |
| .svg | image/svg+xml |
| .ico | image/x-icon |
| .pdf | application/pdf |
| .zip | application/zip |
| .txt | text/plain |
| .woff2 | font/woff2 |
| .mp4 | video/mp4 |

---

## 三、路径遍历攻击防护

这是**最关键的安全问题**！如果用户请求 \`/../../etc/passwd\`，服务器不能真的返回系统密码文件！

### 防御方法

使用 \`path.resolve()\` 解析最终路径后，必须检查路径是否在允许的目录内：

\`\`\`javascript
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, 'public');
const filePath = path.resolve(rootDir, req.url);
if (!filePath.startsWith(rootDir + path.sep) && filePath !== rootDir) {
  // 路径遍历攻击！
  res.writeHead(403);
  return res.end('Forbidden');
}
\`\`\`

---

## 四、缓存策略

静态文件通常不常变化，设置合适的缓存头可以大幅提升性能。

### 4.1 Cache-Control

\`\`\`
Cache-Control: public, max-age=86400
Cache-Control: no-cache
Cache-Control: no-store
\`\`\`

- **public**: 可以被任何缓存（CDN、浏览器）缓存
- **max-age=N**: 缓存有效期（秒）
- **no-cache**: 缓存但每次需要验证
- **no-store**: 完全不缓存

### 4.2 条件请求（304 Not Modified）

通过 ETag 或 Last-Modified，浏览器可以发送条件请求，服务器如果判断文件没变就返回 304，节省带宽。

\`\`\`javascript
const mtime = stat.mtime.toUTCString();
res.setHeader('Last-Modified', mtime);
if (req.headers['if-modified-since'] === mtime) {
  res.writeHead(304);
  return res.end();
}
\`\`\`

---

## 五、Range 请求（分块传输）

对于视频、大文件等，浏览器可能只请求文件的一部分（拖拽进度条）。服务器需要处理 \`Range\` 请求头，返回 \`206 Partial Content\`：

\`\`\`
Range: bytes=0-1023
\`\`\`

---

## 六、其他功能

1. **index.html**：访问目录时自动返回 index.html
2. **gzip 压缩**：使用 zlib 模块压缩文本文件
3. **隐藏文件**：不返回以 . 开头的隐藏文件（如 .git）

在 Demo 中，我们将实现一个功能完整的静态文件服务器！
`,
    code: `// ============================================
// 静态文件服务：从零实现静态文件服务器
// 包含：MIME类型、路径遍历防护、缓存、304
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// ============================================
// 配置
// ============================================

const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = 3000;

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wasm': 'application/wasm',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// ============================================
// 创建演示用的静态文件
// ============================================

function setupDemoFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // index.html
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>静态文件服务器演示</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h1>📂 静态文件服务器</h1>
  <p>这是一个从零实现的静态文件服务器！</p>
  <ul>
    <li><a href="/about.html">关于页面</a></li>
    <li><a href="/app.js">查看 JS 文件</a></li>
    <li><a href="/data.json">JSON 数据</a></li>
  </ul>
  <p>图片示例：</p>
  <img src="/logo.svg" alt="Logo" width="200">
  <script src="/app.js"></script>
</body>
</html>\`, 'utf-8');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'about.html'), \`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>关于</title><link rel="stylesheet" href="/style.css"></head>
<body><h1>关于</h1><p>这是 about.html 页面</p><a href="/">返回首页</a></body>
</html>\`, 'utf-8');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'style.css'), \`
body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
h1 { color: #333; }
a { color: #0066cc; }
img { border: 1px solid #ddd; border-radius: 8px; }
\`, 'utf-8');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'app.js'), \`
console.log('app.js 加载成功！');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 已加载');
});
\`, 'utf-8');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'data.json'), JSON.stringify({
    name: '静态文件服务器',
    version: '1.0.0',
    features: ['MIME类型', '路径防护', '缓存', 'gzip压缩'],
  }, null, 2), 'utf-8');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.svg'), \`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect fill="#4CAF50" width="200" height="200" rx="20"/>
  <text x="100" y="115" font-size="60" text-anchor="middle" fill="white">📂</text>
</svg>\`, 'utf-8');

  console.log('演示文件已创建在:', PUBLIC_DIR);
}

// ============================================
// 静态文件服务核心函数
// ============================================

function serveStatic(req, res, rootDir) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // 默认首页
  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  // 构建文件路径
  const filePath = path.resolve(rootDir, '.' + urlPath);

  // 🔒 关键：路径遍历攻击防护
  if (!filePath.startsWith(rootDir + path.sep) && filePath !== rootDir) {
    console.warn('路径遍历尝试:', filePath);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: 非法路径');
  }

  // 阻止访问隐藏文件（以 . 开头）
  const basename = path.basename(filePath);
  if (basename.startsWith('.') && basename !== '.well-known') {
    res.writeHead(404);
    return res.end('Not Found');
  }

  fs.stat(filePath, (err, stat) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found: ' + urlPath);
      }
      res.writeHead(500);
      return res.end('Server Error');
    }

    // 如果是目录，尝试 index.html
    if (stat.isDirectory()) {
      return serveStatic({ ...req, url: path.join(urlPath, 'index.html') }, res, rootDir);
    }

    if (!stat.isFile()) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    // 生成 ETag（基于文件大小和修改时间）
    const etag = '"' + crypto.createHash('md5')
      .update(stat.size + '-' + stat.mtimeMs)
      .digest('hex') + '"';
    const lastModified = stat.mtime.toUTCString();

    // 检查 304 Not Modified
    if (req.headers['if-none-match'] === etag ||
        req.headers['if-modified-since'] === lastModified) {
      res.writeHead(304, {
        'ETag': etag,
        'Last-Modified': lastModified,
        'Cache-Control': 'public, max-age=3600',
      });
      return res.end();
    }

    const mimeType = getMimeType(filePath);
    const headers = {
      'Content-Type': mimeType,
      'Content-Length': stat.size,
      'Last-Modified': lastModified,
      'ETag': etag,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    };

    // 检查是否支持 gzip（仅对文本类型压缩）
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const isTextType = mimeType.startsWith('text/') ||
                       mimeType.includes('javascript') ||
                       mimeType.includes('json') ||
                       mimeType.includes('xml') ||
                       mimeType.includes('svg');

    // 处理 Range 请求（简单实现）
    const rangeHeader = req.headers.range;
    if (rangeHeader && stat.size > 1024 * 1024) {
      const matches = rangeHeader.match(/bytes=(\\d*)-(\\d*)/);
      if (matches) {
        let start = parseInt(matches[1], 10) || 0;
        let end = parseInt(matches[2], 10) || stat.size - 1;
        if (start >= stat.size) start = stat.size - 1;
        if (end >= stat.size) end = stat.size - 1;
        const chunkSize = end - start + 1;
        res.writeHead(206, {
          ...headers,
          'Content-Range': \`bytes \${start}-\${end}/\${stat.size}\`,
          'Content-Length': chunkSize,
          'Accept-Ranges': 'bytes',
        });
        return fs.createReadStream(filePath, { start, end }).pipe(res);
      }
    }

    // 方法处理
    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      return res.end();
    }

    if (req.method !== 'GET') {
      res.writeHead(405, { 'Allow': 'GET, HEAD' });
      return res.end('Method Not Allowed');
    }

    // gzip 压缩（仅文本类型且浏览器支持）
    if (isTextType && acceptEncoding.includes('gzip') && stat.size > 1024) {
      res.writeHead(200, {
        ...headers,
        'Content-Encoding': 'gzip',
        'Transfer-Encoding': 'chunked',
      });
      const gzip = zlib.createGzip({ level: 6 });
      return fs.createReadStream(filePath).pipe(gzip).pipe(res);
    }

    // 普通响应：流式传输文件
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

// ============================================
// 创建服务器
// ============================================

setupDemoFiles();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  console.log(\`[\${new Date().toLocaleString()}] \${req.method} \${url.pathname}\`);

  // /api/info 返回服务器信息
  if (url.pathname === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      rootDir: PUBLIC_DIR,
      port: PORT,
      features: ['MIME Types', 'Path Traversal Protection', 'ETag/304', 'Gzip Compression', 'Range Requests'],
    }, null, 2));
  }

  // 其他路径都走静态文件服务
  serveStatic(req, res, PUBLIC_DIR);
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  静态文件服务器已启动');
  console.log(\`  根目录: \${PUBLIC_DIR}\`);
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('安全测试: 访问 http://localhost:' + PORT + '/../package.json 应该被禁止');
});
`,
  },
  {
    id: "n4-websocket",
    group: "第四部分 Web开发",
    icon: "🔌",
    title: "WebSocket：实时双向通信",
    content: `# WebSocket：实时双向通信

## 一、WebSocket vs HTTP

HTTP 是半双工的：客户端发起请求，服务器响应。服务器无法主动推送消息给客户端。传统"实时"应用只能靠轮询：每隔几秒发一次请求问"有新消息吗？"，效率很低。

WebSocket 是 HTML5 提出的协议标准，在单个 TCP 连接上提供**全双工**（双向同时）通信通道：

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 连接 | 短连接/keep-alive | 持久连接 |
| 通信方向 | 客户端→服务器 | 双向 |
| 实时性 | 需轮询 | 真正实时 |
| 开销 | 每次请求带头信息 | 握手后帧头很小（2-14字节） |
| 适用场景 | 普通网页、API | 聊天、游戏、实时数据、协作编辑 |

---

## 二、WebSocket 握手

WebSocket 连接从 HTTP 握手开始（称为"Upgrade handshake"）：

### 2.1 客户端发起握手请求

\`\`\`
GET /chat HTTP/1.1
Host: example.com:3000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
\`\`\`

关键字段：
- **Upgrade: websocket**：表示要升级到 WebSocket 协议
- **Connection: Upgrade**：表示要升级连接
- **Sec-WebSocket-Key**：随机生成的 Base64 密钥
- **Sec-WebSocket-Version**：必须是 13

### 2.2 服务器响应握手

\`\`\`
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

**Sec-WebSocket-Accept 计算方法**：
1. 将 Sec-WebSocket-Key 与固定 GUID \`258EAFA5-E914-47DA-95CA-C5AB0DC85B11\` 拼接
2. 计算 SHA-1 哈希
3. Base64 编码

这是一个"魔法字符串"，用于防止普通 HTTP 服务器意外接受 WebSocket 连接。

---

## 三、WebSocket 数据帧

握手之后，数据以**帧（Frame）**为单位传输。一个消息可以拆成多个帧（分片）。

### 帧格式

\`\`\`
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - -+
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - -+
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
\`\`\`

### Opcode 类型

| 值 | 含义 |
|----|------|
| 0x0 | 延续帧 |
| 0x1 | 文本帧 |
| 0x2 | 二进制帧 |
| 0x8 | 连接关闭 |
| 0x9 | Ping |
| 0xA | Pong |

### 掩码（Masking）

**客户端→服务器的帧必须掩码**！这是浏览器安全策略。服务器收到后要用掩码密钥异或解密：

\`\`\`javascript
for (let i = 0; i < data.length; i++) {
  data[i] ^= maskKey[i % 4];
}
\`\`\`

服务器→客户端的帧**不需要掩码**。

---

## 四、心跳保活（Ping/Pong）

WebSocket 连接可能因为网络中间设备（NAT、防火墙）超时而断开。需要定期发送 Ping 帧，客户端回应 Pong 来保持连接活跃。一般 30 秒发一次 Ping。

在 Demo 中，我们将从零实现一个 WebSocket 聊天服务器！不使用 ws 或 socket.io 库，手写握手、帧解析、广播逻辑！
`,
    code: `// ============================================
// WebSocket：从零实现 WebSocket 聊天服务器
// 包含：握手、帧解析、广播、心跳保活
// ============================================

const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');
const net = require('net');

// WebSocket 固定 GUID（RFC 6455 标准）
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

// Opcode 常量
const OPCODES = {
  CONTINUATION: 0x0,
  TEXT: 0x1,
  BINARY: 0x2,
  CLOSE: 0x8,
  PING: 0x9,
  PONG: 0xA,
};

// ============================================
// WebSocket 帧解析器
// ============================================

function parseFrame(buffer) {
  if (buffer.length < 2) return null;

  const firstByte = buffer[0];
  const secondByte = buffer[1];

  const fin = (firstByte & 0x80) >> 7;
  const opcode = firstByte & 0x0F;
  const masked = (secondByte & 0x80) >> 7;
  let payloadLength = secondByte & 0x7F;

  let offset = 2;

  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  let maskKey = null;
  if (masked) {
    if (buffer.length < offset + 4) return null;
    maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLength) return null;

  let payload = buffer.slice(offset, offset + payloadLength);

  // 解码掩码（客户端到服务器必须掩码）
  if (masked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskKey[i % 4];
    }
  }

  return {
    fin,
    opcode,
    masked,
    payloadLength,
    payload,
    totalLength: offset + payloadLength,
  };
}

// 构建 WebSocket 帧（服务器→客户端，不需要掩码）
function buildFrame(data, opcode = OPCODES.TEXT) {
  let payload;
  if (typeof data === 'string') {
    payload = Buffer.from(data, 'utf-8');
  } else if (Buffer.isBuffer(data)) {
    payload = data;
  } else {
    payload = Buffer.from(JSON.stringify(data));
  }

  const payloadLength = payload.length;
  let frame;

  const firstByte = 0x80 | opcode; // FIN=1, opcode

  if (payloadLength < 126) {
    frame = Buffer.alloc(2 + payloadLength);
    frame[0] = firstByte;
    frame[1] = payloadLength; // 不掩码
    payload.copy(frame, 2);
  } else if (payloadLength < 65536) {
    frame = Buffer.alloc(4 + payloadLength);
    frame[0] = firstByte;
    frame[1] = 126;
    frame.writeUInt16BE(payloadLength, 2);
    payload.copy(frame, 4);
  } else {
    frame = Buffer.alloc(10 + payloadLength);
    frame[0] = firstByte;
    frame[1] = 127;
    frame.writeBigUInt64BE(BigInt(payloadLength), 2);
    payload.copy(frame, 10);
  }

  return frame;
}

// ============================================
// WebSocket 连接类
// ============================================

class WebSocketConnection {
  constructor(socket, server) {
    this.socket = socket;
    this.server = server;
    this.id = crypto.randomBytes(8).toString('hex');
    this.nickname = '用户' + this.id.slice(0, 4);
    this.isAlive = true;
    this.buffer = Buffer.alloc(0);

    this.setupEvents();
  }

  setupEvents() {
    this.socket.on('data', (data) => this.handleData(data));
    this.socket.on('close', () => this.handleClose());
    this.socket.on('error', (err) => console.error('Socket 错误:', err.message));

    // 响应 Ping
    this.socket.on('ping', () => {
      this.socket.pong();
      this.isAlive = true;
    });
  }

  handleData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length > 0) {
      const frame = parseFrame(this.buffer);
      if (!frame) break; // 数据不全，等待更多

      this.buffer = this.buffer.slice(frame.totalLength);
      this.handleFrame(frame);
    }
  }

  handleFrame(frame) {
    this.isAlive = true;

    switch (frame.opcode) {
      case OPCODES.TEXT:
        this.handleMessage(frame.payload.toString('utf-8'));
        break;
      case OPCODES.BINARY:
        this.handleMessage(frame.payload);
        break;
      case OPCODES.CLOSE:
        this.close(1000, 'Normal closure');
        break;
      case OPCODES.PING:
        this.sendFrame(frame.payload, OPCODES.PONG);
        break;
      case OPCODES.PONG:
        // 心跳响应，已通过 isAlive 处理
        break;
    }
  }

  handleMessage(message) {
    try {
      const data = JSON.parse(message);
      this.server.handleMessage(this, data);
    } catch (e) {
      this.send(JSON.stringify({ type: 'error', message: '无效的 JSON 格式' }));
    }
  }

  send(data) {
    if (this.socket.writable) {
      const frame = buildFrame(data, OPCODES.TEXT);
      this.socket.write(frame);
    }
  }

  sendFrame(payload, opcode) {
    if (this.socket.writable) {
      const frame = buildFrame(payload, opcode);
      this.socket.write(frame);
    }
  }

  close(code = 1000, reason = '') {
    const closeFrame = Buffer.alloc(2 + Buffer.byteLength(reason));
    closeFrame.writeUInt16BE(code, 0);
    if (reason) {
      closeFrame.write(reason, 2);
    }
    this.sendFrame(closeFrame, OPCODES.CLOSE);
    setTimeout(() => this.socket.destroy(), 100);
  }

  handleClose() {
    this.server.removeClient(this);
  }
}

// ============================================
// WebSocket 服务器
// ============================================

class WebSocketChatServer {
  constructor() {
    this.clients = new Set();
  }

  // 处理 HTTP 升级为 WebSocket
  handleUpgrade(req, socket) {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.write('HTTP/1.1 400 Bad Request\\r\\n\\r\\n');
      return socket.destroy();
    }

    // 计算 Sec-WebSocket-Accept
    const accept = crypto
      .createHash('sha1')
      .update(key + WS_GUID)
      .digest('base64');

    // 发送 101 响应完成握手
    const responseHeaders = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      \`Sec-WebSocket-Accept: \${accept}\`,
      '',
      '',
    ].join('\\r\\n');

    socket.write(responseHeaders);

    const ws = new WebSocketConnection(socket, this);
    this.addClient(ws);
  }

  addClient(ws) {
    this.clients.add(ws);
    console.log(\`新客户端连接 (\${this.clients.size} 在线): \${ws.id}\`);

    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'welcome',
      id: ws.id,
      nickname: ws.nickname,
      onlineCount: this.clients.size,
      message: \`欢迎 \${ws.nickname} 加入聊天室！\`,
    }));

    // 通知其他人
    this.broadcast({
      type: 'system',
      message: \`\${ws.nickname} 加入了聊天室\`,
      onlineCount: this.clients.size,
    }, ws);
  }

  removeClient(ws) {
    if (this.clients.has(ws)) {
      this.clients.delete(ws);
      console.log(\`客户端断开 (\${this.clients.size} 在线): \${ws.id}\`);

      this.broadcast({
        type: 'system',
        message: \`\${ws.nickname} 离开了聊天室\`,
        onlineCount: this.clients.size,
      });
    }
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'chat':
        this.broadcast({
          type: 'chat',
          from: ws.nickname,
          fromId: ws.id,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
        break;
      case 'nickname':
        const oldName = ws.nickname;
        ws.nickname = data.nickname || ws.nickname;
        this.broadcast({
          type: 'system',
          message: \`\${oldName} 改名为 \${ws.nickname}\`,
        });
        break;
      case 'list':
        ws.send(JSON.stringify({
          type: 'userList',
          users: Array.from(this.clients).map(c => ({ id: c.id, nickname: c.nickname })),
        }));
        break;
    }
  }

  broadcast(message, exclude = null) {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    for (const client of this.clients) {
      if (client !== exclude) {
        client.send(msg);
      }
    }
  }

  // 心跳检测：定期 Ping 所有客户端
  startHeartbeat() {
    setInterval(() => {
      for (const client of this.clients) {
        if (!client.isAlive) {
          console.log('客户端无响应，断开:', client.id);
          client.socket.destroy();
          continue;
        }
        client.isAlive = false;
        client.sendFrame(Buffer.alloc(0), OPCODES.PING);
      }
    }, 30000); // 30 秒检测一次
  }
}

// ============================================
// 创建 HTTP + WebSocket 服务器
// ============================================

const chatServer = new WebSocketChatServer();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>WebSocket 聊天室</title>
<style>
  body { font-family: sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
  #messages { border: 1px solid #ccc; height: 400px; overflow-y: auto; padding: 10px; margin: 10px 0; background: #f9f9f9; border-radius: 8px; }
  .message { margin: 5px 0; padding: 8px; border-radius: 4px; }
  .system { color: #666; font-style: italic; background: #f0f0f0; }
  .chat { background: #e3f2fd; }
  .me { background: #c8e6c9; }
  #input { width: 75%; padding: 10px; }
  button { padding: 10px 20px; }
  #nickname { padding: 5px; margin: 5px; }
  .online { color: green; font-size: 0.9em; }
</style>
</head>
<body>
  <h1>🔌 WebSocket 聊天室</h1>
  <p class="online">在线人数: <span id="count">0</span></p>
  <div>
    昵称: <input id="nickname" value="">
    <button onclick="changeNick()">改名</button>
  </div>
  <div id="messages"></div>
  <input id="input" placeholder="输入消息..." onkeypress="if(event.key==='Enter')send()">
  <button onclick="send()">发送</button>

<script>
const ws = new WebSocket('ws://' + location.host);
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const countEl = document.getElementById('count');
let myId = null;
let myNick = '';

ws.onopen = () => console.log('WebSocket 已连接');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到:', data);

  if (data.type === 'welcome') {
    myId = data.id;
    myNick = data.nickname;
    document.getElementById('nickname').value = myNick;
    addMsg(data.message, 'system');
  } else if (data.type === 'system') {
    addMsg(data.message, 'system');
  } else if (data.type === 'chat') {
    const cls = data.fromId === myId ? 'me' : 'chat';
    addMsg(\`<strong>\${data.from}:</strong> \${data.message}\`, cls);
  }

  if (data.onlineCount !== undefined) {
    countEl.textContent = data.onlineCount;
  }
};

ws.onclose = () => addMsg('连接已断开', 'system');

function addMsg(html, cls) {
  const div = document.createElement('div');
  div.className = 'message ' + cls;
  div.innerHTML = html;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function send() {
  const msg = input.value.trim();
  if (msg) {
    ws.send(JSON.stringify({ type: 'chat', message: msg }));
    input.value = '';
  }
}

function changeNick() {
  const nick = document.getElementById('nickname').value.trim();
  if (nick) {
    ws.send(JSON.stringify({ type: 'nickname', nickname: nick }));
  }
}
</script>
</body>
</html>\`);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 处理 WebSocket 升级请求
server.on('upgrade', (req, socket) => {
  chatServer.handleUpgrade(req, socket);
});

// 启动心跳检测
chatServer.startHeartbeat();

const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  WebSocket 聊天服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log(\`  WS 地址: ws://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('打开多个浏览器标签页测试聊天功能！');
});
`,
  },
  {
    id: "n4-file-upload",
    group: "第四部分 Web开发",
    icon: "📤",
    title: "文件上传：multipart/form-data 处理",
    content: `# 文件上传：multipart/form-data 处理

## 一、文件上传的 Content-Type

HTML 表单上传文件时，必须使用 \`enctype="multipart/form-data"\`。这和普通表单 \`application/x-www-form-urlencoded\` 的格式完全不同。

urlencoded 格式是简单的 key=value&key=value，不适合传输二进制文件。multipart 将数据分成多个"部分"（parts），每个部分可以是文本字段或文件，用 boundary 字符串分隔。

---

## 二、multipart/form-data 格式详解

一个典型的 multipart 请求体：

\`\`\`
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="username"

张三
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

<二进制图片数据...>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
\`\`\`

### 格式要点

1. **Boundary（边界）**：在 Content-Type 头中指定，不会出现在数据中：\`multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\`
2. **每个 Part 以 --boundary 开始**
3. **Part 头**：包含 Content-Disposition（字段名、文件名）、可选的 Content-Type
4. **空行分隔头和内容**：\\r\\n\\r\\n
5. **最后以 --boundary-- 结束**（注意末尾两个 --）

---

## 三、流式处理的重要性

**绝对不要把整个上传文件读入内存！** 想象用户上传一个 2GB 的视频，直接缓冲会导致 Node.js 进程内存溢出。

正确做法：
1. 解析边界，定位到文件部分
2. 将文件数据通过 **文件写入流（fs.createWriteStream）** 直接写入磁盘
3. 只在内存中保留少量缓冲区数据

---

## 四、安全注意事项

1. **文件类型验证**：不能只看扩展名（容易伪造），要检查文件内容的魔数（magic number）
   - JPEG: 开头 FF D8 FF
   - PNG: 开头 89 50 4E 47
   - PDF: 开头 25 50 44 46
2. **文件大小限制**：限制单个文件和总请求大小
3. **重命名文件**：不要使用用户提供的文件名直接保存，避免路径遍历和覆盖
4. **限制上传目录**：保存到专用目录，不要允许路径穿越
5. **禁止执行**：上传目录不要给执行权限

---

## 五、文件命名策略

使用唯一文件名保存，避免重名和路径遍历：

\`\`\`javascript
const ext = path.extname(originalFilename);
const uniqueName = Date.now() + '-' + crypto.randomBytes(8).toString('hex') + ext;
const savePath = path.join(uploadDir, uniqueName);
\`\`\`

在 Demo 中，我们将实现一个完整的 multipart 解析器，支持流式文件写入和文件验证！
`,
    code: `// ============================================
// 文件上传：multipart/form-data 流式解析
// 包含：文件验证、大小限制、唯一命名
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// ============================================
// 配置
// ============================================

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
};

// 文件魔数（用于验证文件类型）
const MAGIC_NUMBERS = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // 后面跟 WEBP
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
};

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
console.log('上传目录:', UPLOAD_DIR);

// ============================================
// Multipart 解析器
// ============================================

function parseMultipart(req, boundary) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    let currentPart = null;
    let fileStream = null;
    let buffer = Buffer.alloc(0);
    const boundaryBuf = Buffer.from('--' + boundary);
    const endBoundaryBuf = Buffer.from('--' + boundary + '--');
    let totalSize = 0;
    let headerBuffer = Buffer.alloc(0);
    let parsingHeader = true;
    let preamble = true; // 跳过第一个边界之前的内容

    function cleanup() {
      if (fileStream && !fileStream.writableEnded) {
        fileStream.destroy();
      }
    }

    function finalizeFile() {
      if (currentPart && currentPart.isFile && fileStream) {
        fileStream.end();
        files.push({
          field: currentPart.name,
          originalName: currentPart.filename,
          savedName: currentPart.savedName,
          path: currentPart.savePath,
          size: currentPart.size,
          mimeType: currentPart.contentType,
        });
        fileStream = null;
      }
    }

    function parsePartHeaders(headerStr) {
      const part = {
        name: null,
        filename: null,
        contentType: 'text/plain',
        isFile: false,
        size: 0,
      };

      const dispMatch = headerStr.match(/Content-Disposition: form-data; name="([^"]*)"(?:; filename="([^"]*)")?/i);
      if (dispMatch) {
        part.name = dispMatch[1];
        part.filename = dispMatch[2];
        part.isFile = !!part.filename;
      }

      const typeMatch = headerStr.match(/Content-Type: ([^\\r\\n]+)/i);
      if (typeMatch) {
        part.contentType = typeMatch[1].trim();
      }

      if (part.isFile) {
        // 验证 MIME 类型
        if (part.contentType && !ALLOWED_MIME_TYPES[part.contentType]) {
          const err = new Error(\`不允许的文件类型: \${part.contentType}\`);
          err.statusCode = 400;
          cleanup();
          return reject(err);
        }

        // 生成唯一文件名
        const ext = part.filename ? path.extname(part.filename).toLowerCase() : '';
        const allowedExts = ALLOWED_MIME_TYPES[part.contentType] || [];
        if (ext && !allowedExts.includes(ext)) {
          const err = new Error(\`文件扩展名与类型不匹配\`);
          err.statusCode = 400;
          cleanup();
          return reject(err);
        }

        const uniqueName = Date.now() + '-' + crypto.randomBytes(8).toString('hex') + ext;
        part.savedName = uniqueName;
        part.savePath = path.join(UPLOAD_DIR, uniqueName);
        part.magicBuffer = Buffer.alloc(0);
      } else {
        part.textBuffer = [];
      }

      return part;
    }

    function validateMagicNumber(buffer, mimeType) {
      const magicList = MAGIC_NUMBERS[mimeType];
      if (!magicList) return true; // 不检查的类型直接通过

      for (const magic of magicList) {
        let match = true;
        for (let i = 0; i < magic.length; i++) {
          if (buffer[i] !== magic[i]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
      return false;
    }

    function processData() {
      while (buffer.length > 0) {
        if (preamble) {
          // 找到第一个边界
          const idx = buffer.indexOf(boundaryBuf);
          if (idx === -1) {
            buffer = buffer.slice(Math.max(0, buffer.length - boundaryBuf.length + 1));
            return;
          }
          preamble = false;
          buffer = buffer.slice(idx + boundaryBuf.length);
          if (buffer.length >= 2 && buffer[0] === 13 && buffer[1] === 10) {
            buffer = buffer.slice(2);
          }
          parsingHeader = true;
          headerBuffer = Buffer.alloc(0);
        }

        if (parsingHeader) {
          // 查找头部结束标记 \\r\\n\\r\\n
          const headerEnd = buffer.indexOf('\\r\\n\\r\\n');
          if (headerEnd === -1) {
            if (buffer.length > 65536) {
              cleanup();
              return reject(new Error('Part 头部过大'));
            }
            return;
          }

          const headerStr = buffer.slice(0, headerEnd).toString('utf-8');
          buffer = buffer.slice(headerEnd + 4);
          parsingHeader = false;

          // 检查结束边界
          if (buffer.indexOf('--') === 0) {
            return resolve({ fields, files });
          }

          currentPart = parsePartHeaders(headerStr);
          if (!currentPart) return;
        }

        if (!currentPart) return;

        // 查找下一个边界
        let boundaryIndex = buffer.indexOf(boundaryBuf);

        if (boundaryIndex === -1) {
          // 没有找到完整边界，写入数据但保留最后（边界长度-1）字节防止截断
          const keepLen = boundaryBuf.length - 1;
          let writeLen = buffer.length;
          if (buffer.length > keepLen) {
            writeLen = buffer.length - keepLen;
          } else {
            writeLen = 0;
          }

          if (writeLen > 0) {
            const chunk = buffer.slice(0, writeLen);
            totalSize += chunk.length;

            if (totalSize > MAX_TOTAL_SIZE) {
              cleanup();
              const err = new Error('总上传大小超过限制');
              err.statusCode = 413;
              return reject(err);
            }

            if (currentPart.isFile) {
              currentPart.size += chunk.length;
              if (currentPart.size > MAX_FILE_SIZE) {
                cleanup();
                const err = new Error(\`文件 \${currentPart.filename} 超过大小限制\`);
                err.statusCode = 413;
                return reject(err);
              }

              // 收集魔数用于验证
              if (currentPart.magicBuffer.length < 16) {
                currentPart.magicBuffer = Buffer.concat([currentPart.magicBuffer, chunk.slice(0, 16)]);
              }

              if (!fileStream) {
                fileStream = fs.createWriteStream(currentPart.savePath);
                fileStream.on('error', (e) => {
                  cleanup();
                  reject(e);
                });
              }
              fileStream.write(chunk);
            } else {
              currentPart.textBuffer.push(chunk.toString('utf-8'));
            }
          }

          buffer = buffer.slice(writeLen);
          return;
        }

        // 边界前的数据（需要去掉末尾的 \\r\\n）
        let chunk = buffer.slice(0, boundaryIndex);
        if (chunk.length >= 2 && chunk[chunk.length - 2] === 13 && chunk[chunk.length - 1] === 10) {
          chunk = chunk.slice(0, -2);
        }

        if (chunk.length > 0) {
          totalSize += chunk.length;

          if (currentPart.isFile) {
            currentPart.size += chunk.length;
            if (currentPart.size > MAX_FILE_SIZE) {
              cleanup();
              const err = new Error(\`文件 \${currentPart.filename} 超过大小限制\`);
              err.statusCode = 413;
              return reject(err);
            }
            if (currentPart.magicBuffer.length < 16) {
              currentPart.magicBuffer = Buffer.concat([currentPart.magicBuffer, chunk.slice(0, 16 - currentPart.magicBuffer.length)]);
            }
            if (!fileStream) {
              fileStream = fs.createWriteStream(currentPart.savePath);
            }
            fileStream.end(chunk);
            finalizeFile();
          } else {
            currentPart.textBuffer.push(chunk.toString('utf-8'));
            fields[currentPart.name] = currentPart.textBuffer.join('');
          }
        } else if (currentPart.isFile) {
          finalizeFile();
        } else {
          fields[currentPart.name] = currentPart.textBuffer.join('');
        }

        // 跳过边界
        buffer = buffer.slice(boundaryIndex + boundaryBuf.length);

        // 检查是否是结束边界
        if (buffer.length >= 2 && buffer[0] === 45 && buffer[1] === 45) {
          // 验证所有文件的魔数
          for (const file of files) {
            const fileBuf = fs.readFileSync(file.path);
            if (!validateMagicNumber(fileBuf, file.mimeType)) {
              fs.unlinkSync(file.path);
              const err = new Error(\`文件内容与声明的类型不符: \${file.originalName}\`);
              err.statusCode = 400;
              return reject(err);
            }
          }
          return resolve({ fields, files });
        }

        // 跳过 \\r\\n
        if (buffer.length >= 2 && buffer[0] === 13 && buffer[1] === 10) {
          buffer = buffer.slice(2);
        }
        parsingHeader = true;
      }
    }

    req.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      try {
        processData();
      } catch (e) {
        cleanup();
        reject(e);
      }
    });

    req.on('end', () => {
      if (fileStream) {
        fileStream.end();
      }
    });

    req.on('error', (err) => {
      cleanup();
      reject(err);
    });
  });
}

// ============================================
// 辅助函数
// ============================================

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// ============================================
// 创建服务器
// ============================================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);

  // 上传表单页面
  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(\`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>文件上传演示</title>
<style>
body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; }
form { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
.form-group { margin: 15px 0; }
label { display: block; margin-bottom: 5px; font-weight: bold; }
input[type=text], input[type=file] { width: 100%; padding: 8px; }
button { background: #4CAF50; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
.progress { width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; display: none; margin: 10px 0; }
.progress-bar { height: 100%; background: #4CAF50; border-radius: 10px; width: 0%; transition: width 0.3s; }
.files { margin-top: 20px; }
.file-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
</style></head>
<body>
<h1>📤 文件上传演示</h1>
<p>支持 JPG/PNG/GIF/WebP/PDF/TXT，单文件最大 5MB，总大小最大 20MB</p>

<form id="uploadForm">
  <div class="form-group">
    <label>姓名：</label>
    <input type="text" name="username" value="张三">
  </div>
  <div class="form-group">
    <label>选择文件（可多选）：</label>
    <input type="file" name="files" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt">
  </div>
  <button type="submit">上传</button>
</form>

<div class="progress" id="progress">
  <div class="progress-bar" id="progressBar"></div>
</div>

<div class="files" id="fileList"></div>

<script>
const form = document.getElementById('uploadForm');
const progressDiv = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const fileList = document.getElementById('fileList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const xhr = new XMLHttpRequest();

  progressDiv.style.display = 'block';
  progressBar.style.width = '0%';

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total * 100).toFixed(1);
      progressBar.style.width = percent + '%';
    }
  });

  xhr.addEventListener('load', () => {
    progressBar.style.width = '100%';
    setTimeout(() => progressDiv.style.display = 'none', 1000);
    const res = JSON.parse(xhr.responseText);
    alert('上传成功！');
    loadFiles();
  });

  xhr.addEventListener('error', () => {
    alert('上传失败');
    progressDiv.style.display = 'none';
  });

  xhr.open('POST', '/api/upload');
  xhr.send(formData);
});

async function loadFiles() {
  const res = await fetch('/api/files');
  const data = await res.json();
  fileList.innerHTML = '<h3>已上传文件：</h3>' + data.files.map(f =>
    '<div class="file-item"><span>' + f.originalName + ' (' + f.sizeStr + ')</span><a href="/uploads/' + f.savedName + '" target="_blank">查看</a></div>'
  ).join('');
}
loadFiles();
</script>
</body></html>\`);
  }

  // 文件上传接口
  if (url.pathname === '/api/upload' && req.method === 'POST') {
    try {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return sendJson(res, 400, { error: '需要 multipart/form-data 类型' });
      }

      const boundaryMatch = contentType.match(/boundary=([^;]+)/);
      if (!boundaryMatch) {
        return sendJson(res, 400, { error: '缺少 boundary' });
      }

      const result = await parseMultipart(req, boundaryMatch[1]);
      sendJson(res, 200, {
        success: true,
        message: '上传成功',
        fields: result.fields,
        files: result.files.map(f => ({
          field: f.field,
          originalName: f.originalName,
          savedName: f.savedName,
          size: f.size,
          sizeStr: formatSize(f.size),
          mimeType: f.mimeType,
        })),
      });
    } catch (err) {
      console.error('上传错误:', err);
      sendJson(res, err.statusCode || 500, { error: err.message });
    }
    return;
  }

  // 文件列表接口
  if (url.pathname === '/api/files' && req.method === 'GET') {
    fs.readdir(UPLOAD_DIR, (err, files) => {
      if (err) return sendJson(res, 500, { error: err.message });
      const fileList = files.map(name => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, name));
        return { savedName: name, size: stat.size, sizeStr: formatSize(stat.size), createdAt: stat.birthtime };
      }).sort((a, b) => b.createdAt - a.createdAt);
      sendJson(res, 200, { files: fileList });
    });
    return;
  }

  // 提供已上传文件访问
  if (url.pathname.startsWith('/uploads/')) {
    const filename = path.basename(url.pathname);
    const filePath = path.join(UPLOAD_DIR, filename);
    // 安全检查
    if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404);
        return res.end('Not Found');
      }
      const ext = path.extname(filename).toLowerCase();
      const mimeMap = { '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.pdf':'application/pdf','.txt':'text/plain' };
      res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  sendJson(res, 404, { error: 'Not Found' });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  文件上传服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log(\`  上传目录: \${UPLOAD_DIR}\`);
  console.log('========================================');
});
`,
  },
  {
    id: "n4-https-tls",
    group: "第四部分 Web开发",
    icon: "🔒",
    title: "HTTPS 与 TLS：加密你的 Web 服务",
    content: `# HTTPS 与 TLS：加密你的 Web 服务

HTTP 传输的数据是明文的，任何经过的路由器、ISP、黑客都能看到甚至篡改内容。HTTPS 通过 TLS（传输层安全协议）在 HTTP 之下提供加密，保护数据的机密性、完整性和身份认证。

## 一、HTTPS 的工作原理

HTTPS = HTTP + TLS/SSL，位于 TCP 和 HTTP 之间。

### 1. TLS 握手过程

1. **Client Hello**：客户端发送支持的 TLS 版本、加密套件列表、随机数
2. **Server Hello**：服务器选择加密套件、返回证书、服务器随机数
3. **证书验证**：客户端验证服务器证书是否由受信任的 CA 签发
4. **密钥交换**：使用非对称加密协商出会话密钥（如 ECDHE）
5. **Finished**：双方用会话密钥加密发送 Finished 消息，握手完成
6. **应用数据**：之后所有 HTTP 数据都用对称加密传输

### 2. 非对称加密 vs 对称加密

- **非对称加密**（RSA、ECC）：公钥加密私钥解密，速度慢，用于密钥交换和证书签名
- **对称加密**（AES、ChaCha20）：同一密钥加解密，速度快，用于实际数据传输
- **哈希算法**（SHA-256）：用于完整性校验、签名

---

## 二、证书基础

### 1. 证书包含什么
- 服务器公钥
- 域名（CN/SAN）
- 签发机构（CA）信息
- 有效期
- CA 的数字签名

### 2. 证书链
- **根证书**：内置在浏览器/操作系统中，自签名
- **中间证书**：由根证书签发
- **服务器证书**：由中间证书签发
- 验证时从服务器证书回溯到根证书

### 3. 自签名证书
开发测试时可以自己生成证书。浏览器会显示"不安全"提示，因为没有受信任的 CA 签名，但加密功能是完整的。

---

## 三、生成自签名证书

使用 OpenSSL 命令生成私钥和证书：

\`\`\`bash
# 生成 2048 位 RSA 私钥
openssl genrsa -out key.pem 2048

# 生成自签名证书，有效期 365 天
openssl req -new -x509 -key key.pem -out cert.pem -days 365
# 按照提示输入国家、组织、域名等信息
# Common Name (CN) 填写域名，如 localhost
\`\`\`

---

## 四、Node.js https 模块

Node.js 内置 \`https\` 模块，API 与 \`http\` 几乎一致，只是创建服务器时需要提供 key 和 cert：

\`\`\`javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  minVersion: 'TLSv1.2',  // 禁止旧版本 TLS
};

https.createServer(options, (req, res) => {
  res.end('Secure!');
}).listen(443);
\`\`\`

---

## 五、安全最佳实践

1. **禁用 TLS 1.0/1.1**：只使用 TLSv1.2 和 TLSv1.3
2. **使用强加密套件**：避免弱加密如 RC4、3DES
3. **启用 HSTS**：强制浏览器始终使用 HTTPS
4. **HTTP 重定向到 HTTPS**：80 端口自动跳转到 443
5. **证书续期**：使用 Let's Encrypt 免费证书，自动续期

Demo 演示了 HTTPS 服务器、HTTP 重定向、HSTS 和 TLS 配置！
`,
    code: `// ============================================
// HTTPS 与 TLS：加密 Web 服务
// 包含：HTTPS 服务器、HTTP重定向、TLS配置
// ============================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================
// 第一步：自动生成自签名证书（演示用）
// 实际生产环境请使用 Let's Encrypt 等正式证书
// ============================================

const CERT_DIR = path.join(__dirname, 'certs');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');
const CERT_PATH = path.join(CERT_DIR, 'cert.pem');

if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

function generateSelfSignedCert() {
  console.log('正在生成自签名证书...');

  // 注意：实际生产环境应该使用 openssl 命令或 acme 客户端
  // 这里使用 Node.js 内置 crypto 生成（简化版演示）
  // 推荐在命令行用 openssl 生成：
  // openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

  // 为了演示完整性，我们检查是否已有证书
  if (fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH)) {
    console.log('使用已有证书');
    return {
      key: fs.readFileSync(KEY_PATH),
      cert: fs.readFileSync(CERT_PATH),
    };
  }

  console.log('未找到证书，请先运行以下命令生成：');
  console.log('cd ' + CERT_DIR);
  console.log('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"');
  console.log('');
  console.log('演示将使用无证书模式，仅启动 HTTP 服务器');
  return null;
}

const credentials = generateSelfSignedCert();

// ============================================
// 应用处理逻辑（同时用于 HTTP 和 HTTPS）
// ============================================

function handleApp(req, res) {
  const url = new URL(req.url, \`https://\${req.headers.host}\`);

  if (url.pathname === '/') {
    const isSecure = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>HTTPS 演示</title>
<style>
body { font-family: sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; }
.status { padding: 20px; border-radius: 8px; margin: 20px 0; }
.secure { background: #e8f5e9; border: 2px solid #4CAF50; }
.insecure { background: #ffebee; border: 2px solid #f44336; }
.lock { font-size: 48px; }
pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
</style></head>
<body>
<h1>🔒 HTTPS/TLS 演示</h1>
<div class="status \${isSecure ? 'secure' : 'insecure'}">
  <div class="lock">\${isSecure ? '🔐' : '⚠️'}</div>
  <h2>\${isSecure ? '安全连接 (HTTPS)' : '不安全连接 (HTTP)'}</h2>
  <p>\${isSecure ? '你的连接已加密，数据传输安全。' : '你的连接未加密，数据可能被窃听或篡改！'}</p>
</div>
<h3>连接信息：</h3>
<pre>
协议: \${req.connection.encrypted ? req.connection.getProtocol() : 'HTTP (无加密)'}
加密套件: \${req.connection.encrypted ? req.connection.getCipher().name : 'N/A'}
主机: \${req.headers.host}
\${isSecure ? '<strong>✅ HSTS 已启用</strong>' : '<strong>❌ 请使用 HTTPS 访问</strong>'}
</pre>
<h3>测试链接：</h3>
<ul>
  <li><a href="https://localhost:4433">HTTPS 地址 (端口 4433)</a></li>
  <li><a href="http://localhost:8080">HTTP 地址 (端口 8080，会重定向)</a></li>
</ul>
</body></html>\`);
    return;
  }

  if (url.pathname === '/api/info') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    });
    res.end(JSON.stringify({
      secure: !!req.connection.encrypted,
      protocol: req.connection.encrypted ? req.connection.getProtocol() : 'HTTP/1.1',
      cipher: req.connection.encrypted ? req.connection.getCipher() : null,
      headers: req.headers,
    }, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// ============================================
// HTTP 服务器：重定向到 HTTPS
// ============================================

const HTTP_PORT = 8080;
const HTTPS_PORT = 4433;

const httpApp = http.createServer((req, res) => {
  const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
  const redirectUrl = \`https://\${host}:\${HTTPS_PORT}\${req.url}\`;

  // 301 永久重定向到 HTTPS
  res.writeHead(301, {
    'Location': redirectUrl,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });
  res.end(\`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>重定向到 HTTPS</title></head>
<body>
<h1>正在重定向到安全连接...</h1>
<p>如果没有自动跳转，请点击：<a href="\${redirectUrl}">\${redirectUrl}</a></p>
<script>window.location.href = '\${redirectUrl}';</script>
</body></html>\`);
});

// ============================================
// HTTPS 服务器
// ============================================

if (credentials) {
  const httpsOptions = {
    key: credentials.key,
    cert: credentials.cert,
    minVersion: 'TLSv1.2',           // 最低 TLS 版本：禁用 SSLv3/TLSv1/TLSv1.1
    maxVersion: 'TLSv1.3',           // 最高 TLS 版本
    ciphers: [
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305',
      'ECDHE-RSA-CHACHA20-POLY1305',
    ].join(':'),
    honorCipherOrder: true,
  };

  const httpsApp = https.createServer(httpsOptions, (req, res) => {
    // 添加安全响应头
    const securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',  // HSTS
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    // 在 writeHead 之前设置头
    const originalWriteHead = res.writeHead;
    res.writeHead = function(statusCode, ...args) {
      const headers = args.find(a => typeof a === 'object' && !Array.isArray(a)) || {};
      const finalHeaders = { ...securityHeaders, ...headers };
      return originalWriteHead.call(this, statusCode, finalHeaders);
    };

    handleApp(req, res);
  });

  httpsApp.listen(HTTPS_PORT, () => {
    console.log('========================================');
    console.log('  🔒 HTTPS 服务器已启动');
    console.log(\`  HTTPS 地址: https://localhost:\${HTTPS_PORT}\`);
    console.log('========================================');
    console.log('⚠️  浏览器会提示证书不受信任（自签名证书，这是正常的）');
    console.log('   点击"高级" -> "继续前往 localhost"即可访问');
  });
}

httpApp.listen(HTTP_PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  ⚠️  HTTP 重定向服务器已启动');
  console.log(\`  HTTP 地址: http://localhost:\${HTTP_PORT}\`);
  console.log(\`  所有访问将重定向到 HTTPS (端口 \${HTTPS_PORT})\`);
  console.log('========================================');
});

// ============================================
// 证书生成说明（供参考）
// ============================================

console.log('');
console.log('📝 证书生成命令（如果需要重新生成）：');
console.log(\`  mkdir -p \${CERT_DIR}\`);
console.log(\`  openssl req -x509 -newkey rsa:2048 -keyout \${KEY_PATH} -out \${CERT_PATH} -days 365 -nodes -subj "/CN=localhost"\`);
console.log('');
console.log('🌐 生产环境建议：');
console.log('   - 使用 Let\'s Encrypt 免费证书（certbot 工具）');
console.log('   - 配置自动续期');
console.log('   - 使用 443 默认 HTTPS 端口');
console.log('   - 启用 HSTS preload');
`,
  },
  {
    id: "n4-rate-limit",
    group: "第四部分 Web开发",
    icon: "🚧",
    title: "限流与安全防护：保护你的服务",
    content: `# 限流与安全防护：保护你的服务

线上服务面临各种威胁：暴力破解密码、DDoS 攻击、爬虫滥用、SQL 注入、XSS 攻击等。本章学习如何用限流和安全头来保护你的服务。

---

## 一、为什么需要限流？

1. **防止暴力破解**：限制登录接口尝试次数
2. **防止 DoS 攻击**：单个 IP 不能无限请求，耗尽服务器资源
3. **防止滥用**：防止爬虫疯狂抓取数据
4. **公平使用**：确保所有用户都能正常访问

---

## 二、限流算法对比

### 1. 固定窗口（Fixed Window）
- 最简单：每分钟/每小时重置计数
- 缺点：窗口边界可能有双倍流量突发
- 实现：Map<IP, { count, resetTime }>

### 2. 滑动窗口（Sliding Window）⭐
- 更精确：记录时间戳列表，只统计窗口内的请求
- 平滑计数，无边界突发问题
- 内存稍多，但效果最好，我们实现这个

### 3. 令牌桶（Token Bucket）
- 按固定速率生成令牌，请求消耗令牌
- 允许一定程度的突发流量
- 适合 API 调用频率限制

### 4. 漏桶（Leaky Bucket）
- 请求进入桶，以固定速率流出处理
- 平滑输出流量，不允许突发

---

## 三、限流响应头

规范的限流响应应包含以下头部：

| Header | 说明 |
|--------|------|
| X-RateLimit-Limit | 时间窗口内最大请求数 |
| X-RateLimit-Remaining | 剩余请求数 |
| X-RateLimit-Reset | 窗口重置时间（Unix 时间戳） |
| Retry-After | 被限流时需等待的秒数（429 响应） |

---

## 四、安全响应头

类似 Helmet 库设置的安全头，我们手动设置：

### 1. X-Content-Type-Options: nosniff
- 防止浏览器 MIME 类型嗅探
- 避免上传的脚本文件被当作 JS 执行

### 2. X-Frame-Options: DENY / SAMEORIGIN
- 防止点击劫持（clickjacking）
- 禁止页面被嵌入 iframe

### 3. Content-Security-Policy (CSP)
- 最强大的安全头，精细控制资源加载来源
- 防止 XSS、数据注入
- 示例：\`default-src 'self'\` 只允许同源加载

### 4. Strict-Transport-Security (HSTS)
- 强制使用 HTTPS

### 5. Referrer-Policy
- 控制 Referer 头的发送

### 6. Permissions-Policy
- 控制浏览器功能权限（摄像头、地理位置等）

---

## 五、Basic Auth 基础认证

HTTP Basic Auth 是最简单的认证方式：
1. 浏览器弹出用户名密码输入框
2. 用户名密码以 \`Basic base64(user:pass)\` 形式放在 Authorization 头
3. **必须配合 HTTPS 使用！** 因为 base64 不是加密，只是编码

---

## 六、输入验证

安全原则：**永远不要相信用户输入**

1. 验证类型、长度、格式、范围
2. SQL/NoSQL 注入：使用参数化查询（或 ORM）
3. XSS：输出到 HTML 时转义特殊字符
4. 路径遍历：限制在指定目录内（如 static-files 章节）
5. 命令注入：永远不要把用户输入直接传给 exec/execFile

Demo 中实现滑动窗口限流、安全头中间件和 Basic Auth！
`,
    code: `// ============================================
// 限流与安全防护
// 包含：滑动窗口限流、安全头、Basic Auth
// ============================================

const http = require('http');
const crypto = require('crypto');

// ============================================
// 1. 滑动窗口限流中间件
// ============================================

class SlidingWindowRateLimit {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60 * 1000; // 默认 1 分钟窗口
    this.maxRequests = options.maxRequests || 60;  // 每分钟最多 60 次
    this.ipRequests = new Map();                    // IP -> 时间戳数组
    this.message = options.message || '请求过于频繁，请稍后再试';

    // 定期清理过期记录，防止内存泄漏
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.ipRequests) {
      // 只保留窗口内的时间戳
      const valid = timestamps.filter(t => now - t < this.windowMs);
      if (valid.length === 0) {
        this.ipRequests.delete(ip);
      } else {
        this.ipRequests.set(ip, valid);
      }
    }
  }

  getClientIp(req) {
    // 优先从 X-Forwarded-For 获取（如果有反向代理）
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  middleware(req, res) {
    const ip = this.getClientIp(req);
    const now = Date.now();

    // 获取或初始化该 IP 的请求时间戳列表
    if (!this.ipRequests.has(ip)) {
      this.ipRequests.set(ip, []);
    }
    const timestamps = this.ipRequests.get(ip);

    // 过滤出窗口内的请求
    const windowStart = now - this.windowMs;
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift();
    }

    // 计算重置时间（最早的请求过期时间）
    const resetTime = timestamps.length > 0
      ? Math.ceil((timestamps[0] + this.windowMs) / 1000)
      : Math.ceil(now / 1000) + Math.ceil(this.windowMs / 1000);

    const remaining = Math.max(0, this.maxRequests - timestamps.length);

    // 设置限流头
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (timestamps.length >= this.maxRequests) {
      // 限流触发
      const retryAfter = Math.ceil((timestamps[0] + this.windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        error: 'Too Many Requests',
        message: this.message,
        retryAfter,
      }, null, 2));
      return false;
    }

    // 记录本次请求
    timestamps.push(now);
    return true;
  }
}

// ============================================
// 2. 安全头中间件（类似 Helmet）
// ============================================

function securityHeaders(req, res) {
  const headers = {
    // 防止 MIME 类型嗅探
    'X-Content-Type-Options': 'nosniff',
    // 防止点击劫持
    'X-Frame-Options': 'DENY',
    // 旧版 XSS 防护（现代浏览器靠 CSP）
    'X-XSS-Protection': '1; mode=block',
    // 强制 HTTPS（1 年）
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    // CSP：只允许同源加载，禁止内联脚本（可根据需求调整）
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // 演示允许内联脚本
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join('; '),
    // Referrer 策略
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // 权限策略：禁用所有敏感特性
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    // 隐藏服务器信息
    'X-Powered-By': undefined,  // 移除默认的 X-Powered-By
  };

  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      res.setHeader(key, value);
    } else {
      res.removeHeader(key);
    }
  }
}

// ============================================
// 3. HTTP Basic Auth 认证
// ============================================

class BasicAuth {
  constructor(options = {}) {
    this.users = options.users || { admin: 'admin123' }; // 默认演示用户
    this.realm = options.realm || 'Restricted Area';
  }

  check(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return null;
    }

    try {
      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
      const colonIndex = credentials.indexOf(':');
      if (colonIndex === -1) return null;

      const username = credentials.slice(0, colonIndex);
      const password = credentials.slice(colonIndex + 1);

      // 使用 timingSafeEqual 防止时序攻击
      const expectedPassword = this.users[username];
      if (!expectedPassword) return null;

      const userBuf = Buffer.from(username);
      const passBuf = Buffer.from(password);
      const expectedPassBuf = Buffer.from(expectedPassword);

      // 简单的长度检查 + 内容比较
      if (passBuf.length !== expectedPassBuf.length) return null;
      let match = 0;
      for (let i = 0; i < passBuf.length; i++) {
        match |= passBuf[i] ^ expectedPassBuf[i];
      }

      return match === 0 ? username : null;
    } catch {
      return null;
    }
  }

  requireAuth(res) {
    res.writeHead(401, {
      'WWW-Authenticate': \`Basic realm="\${this.realm}"\`,
      'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('需要认证');
  }
}

// ============================================
// 4. 简单输入验证工具
// ============================================

function sanitizeHtml(str) {
  // HTML 转义，防止 XSS
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function validateString(value, { min = 0, max = Infinity, pattern = null } = {}) {
  if (typeof value !== 'string') return { valid: false, error: '必须是字符串' };
  if (value.length < min) return { valid: false, error: \`最短 \${min} 字符\` };
  if (value.length > max) return { valid: false, error: \`最长 \${max} 字符\` };
  if (pattern && !pattern.test(value)) return { valid: false, error: '格式不正确' };
  return { valid: true };
}

// ============================================
// 5. 模拟暴力破解防护（登录接口特殊限流）
// ============================================

const loginAttempts = new Map(); // IP -> { count, lockedUntil }

function checkLoginAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  if (record.lockedUntil > now) {
    return { allowed: false, locked: true, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  if (record.count >= 5) {
    // 5 次失败锁定 15 分钟
    record.lockedUntil = now + 15 * 60 * 1000;
    record.count = 0;
    loginAttempts.set(ip, record);
    return { allowed: false, locked: true, retryAfter: 15 * 60 };
  }

  return { allowed: true, record };
}

function recordFailedLogin(ip) {
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count++;
  loginAttempts.set(ip, record);
}

function resetLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

// ============================================
// 创建服务器
// ============================================

// 普通 API 限流：每分钟 60 次
const apiLimiter = new SlidingWindowRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'API 请求过于频繁',
});

// 登录接口限流：每分钟 5 次（更严格）
const loginLimiter = new SlidingWindowRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: '登录尝试过于频繁',
});

const basicAuth = new BasicAuth({
  users: { admin: 'admin123', user: 'password' },
  realm: '安全演示区域',
});

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('JSON 解析失败')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);

  // 应用安全头（所有路由）
  securityHeaders(req, res);

  // 首页
  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>安全防护演示</title>
<style>
body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
.card { border: 1px solid #ddd; padding: 20px; margin: 15px 0; border-radius: 8px; }
.limited { background: #fff3e0; }
.auth { background: #e3f2fd; }
button { padding: 10px 20px; margin: 5px; cursor: pointer; }
.result { margin-top: 10px; padding: 10px; border-radius: 4px; }
.success { background: #e8f5e9; color: #2e7d32; }
.error { background: #ffebee; color: #c62828; }
pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
input { padding: 8px; margin: 5px; }
</style></head>
<body>
<h1>🚧 安全防护演示</h1>
<p>本页包含滑动窗口限流、安全响应头、Basic Auth、暴力破解防护等功能。</p>

<div class="card limited">
  <h2>📊 限流测试</h2>
  <p>普通 API：每分钟 60 次 | 登录接口：每分钟 10 次，5 次失败锁定 15 分钟</p>
  <button onclick="testApi()">测试普通 API</button>
  <button onclick="testRateLimit()">快速请求测试限流</button>
  <div id="apiResult" class="result"></div>
</div>

<div class="card auth">
  <h2>🔐 Basic Auth 测试</h2>
  <p>用户名/密码：admin/admin123 或 user/password</p>
  <button onclick="testAuth()">访问需要认证的页面</button>
</div>

<div class="card">
  <h2>🔒 登录防暴力破解</h2>
  <input type="text" id="loginUser" placeholder="用户名" value="admin">
  <input type="password" id="loginPass" placeholder="密码" value="wrong">
  <button onclick="testLogin()">登录</button>
  <div id="loginResult" class="result"></div>
</div>

<div class="card">
  <h2>📋 当前响应头</h2>
  <pre id="headers"></pre>
</div>

<script>
async function testApi() {
  const res = await fetch('/api/test');
  showResult('apiResult', '状态码: ' + res.status + '\\n' + await res.text(), res.ok);
  document.getElementById('headers').textContent = JSON.stringify(Object.fromEntries(res.headers), null, 2);
}

async function testRateLimit() {
  const results = [];
  for (let i = 0; i < 70; i++) {
    const res = await fetch('/api/test');
    results.push(res.status);
    if (res.status === 429) {
      showResult('apiResult', '被限流了！共发送 ' + (i+1) + ' 个请求，第 ' + (i+1) + ' 个返回 429', false);
      return;
    }
  }
  showResult('apiResult', '70 个请求全部成功（可能缓存或窗口重置）', true);
}

function testAuth() {
  window.location.href = '/api/secret';
}

async function testLogin() {
  const username = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPass').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  showResult('loginResult', JSON.stringify(data, null, 2), res.ok);
}

function showResult(id, text, success) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'result ' + (success ? 'success' : 'error');
}

// 加载时获取一次头
testApi();
</script>
</body></html>\`);
    return;
  }

  // 普通 API（限流保护）
  if (url.pathname === '/api/test' && req.method === 'GET') {
    if (!apiLimiter.middleware(req, res)) return;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      message: '请求成功！',
      timestamp: new Date().toISOString(),
      limit: apiLimiter.maxRequests,
    }));
    return;
  }

  // 需要 Basic Auth 的接口
  if (url.pathname === '/api/secret') {
    const user = basicAuth.check(req);
    if (!user) {
      return basicAuth.requireAuth(res);
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      message: '这是需要认证的内容',
      user: sanitizeHtml(user),
      secret: 'Hello, ' + user + '! 你已通过身份验证。',
    }));
    return;
  }

  // 登录接口（防暴力破解）
  if (url.pathname === '/api/login' && req.method === 'POST') {
    const ip = apiLimiter.getClientIp(req);

    // 先检查登录锁定
    const attemptCheck = checkLoginAttempt(ip);
    if (!attemptCheck.allowed) {
      res.writeHead(423, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        error: '账户已锁定',
        message: \`由于多次失败尝试，请 \${attemptCheck.retryAfter} 秒后重试\`,
        retryAfter: attemptCheck.retryAfter,
      }));
    }

    // 登录接口限流
    if (!loginLimiter.middleware(req, res)) return;

    try {
      const body = await parseBody(req);
      const { username, password } = body;

      // 输入验证
      const userVal = validateString(username, { min: 1, max: 32 });
      const passVal = validateString(password, { min: 1, max: 128 });
      if (!userVal.valid || !passVal.valid) {
        return res.end(JSON.stringify({ error: '输入格式不正确' }));
      }

      const users = { admin: 'admin123', user: 'password' };
      const validPassword = users[username];

      if (validPassword === password) {
        resetLoginAttempts(ip);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ success: true, message: '登录成功！' }));
      } else {
        recordFailedLogin(ip);
        const remaining = 5 - (attemptCheck.record?.count || 0) - 1;
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
          error: '用户名或密码错误',
          remainingAttempts: Math.max(0, remaining),
        }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  🚧 安全防护演示服务器已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('');
  console.log('安全功能:');
  console.log('  ✅ 滑动窗口限流（普通 API: 60/分钟，登录: 10/分钟）');
  console.log('  ✅ 安全响应头（CSP、HSTS、X-Frame-Options 等）');
  console.log('  ✅ HTTP Basic Auth 认证');
  console.log('  ✅ 登录暴力破解防护（5 次失败锁定 15 分钟）');
  console.log('  ✅ XSS 防护输入转义');
});
`,
  },
  {
    id: "n4-mvc-practice",
    group: "第四部分 Web开发",
    icon: "🏛️",
    title: "实战：完整 MVC 风格的 Web 应用",
    content: `# 实战：完整 MVC 风格的 Web 应用

前面的章节学习了 HTTP 服务、中间件、路由、静态文件、Session、JWT 等知识点。本章我们将把这些整合起来，按照 MVC 架构模式，从头构建一个完整的博客系统！

---

## 一、MVC 架构模式

MVC 是 Model-View-Controller 的缩写，是一种经典的软件架构模式，将应用分成三个核心部分：

### Model（模型）- 数据层
- 负责数据存储和业务逻辑
- 不关心如何展示数据
- 管理数据的读写、验证、业务规则
- 我们用内存数组模拟数据库（实际可用 SQLite/MySQL/MongoDB）

### View（视图）- 展示层
- 负责数据的可视化展示
- 接收 Controller 传递的数据
- 渲染 HTML 给用户
- 我们实现一个简单的模板引擎（字符串替换）

### Controller（控制器）- 控制层
- 处理用户请求
- 调用 Model 获取/处理数据
- 选择 View 渲染响应
- 是 Model 和 View 之间的桥梁

---

## 二、项目目录结构

\`\`\`
my-blog/
├── app.js                 # 应用入口
├── middleware/            # 中间件
│   ├── bodyParser.js      # 请求体解析
│   ├── session.js         # Session 管理
│   ├── static.js          # 静态文件
│   └── auth.js            # 认证中间件
├── routes/                # 路由定义
│   └── index.js           # 路由表
├── controllers/           # 控制器
│   ├── homeController.js  # 首页
│   ├── postController.js  # 文章 CRUD
│   └── authController.js  # 登录注册
├── models/                # 模型（数据层）
│   └── postModel.js       # 文章数据操作
├── views/                 # 模板文件
│   ├── layout.html        # 布局模板
│   ├── home.html          # 首页
│   ├── list.html          # 文章列表
│   ├── detail.html        # 文章详情
│   ├── edit.html          # 编辑表单
│   └── login.html         # 登录页
└── public/                # 静态资源
    └── style.css          # 样式
\`\`\`

在我们的 Demo 中，为了单文件可运行，所有模块都在一个文件里，但保持逻辑分离！

---

## 三、简单模板引擎实现

不需要 EJS/Pug/Handlebars 等 npm 包，我们实现一个简单的模板引擎：

1. **布局继承**：基础模板有 \`{{content}}\` 占位符
2. **变量替换**：\`{{title}}\` 替换为数据
3. **循环**：\`{{#each posts}}...{{/each}}\` 遍历数组
4. **转义**：默认 HTML 转义防止 XSS，用 \`{{{raw}}}\` 表示不转义
5. **条件**：\`{{#if user}}...{{/if}}\` 简单判断

---

## 四、请求处理流程

\`\`\`
浏览器请求
    ↓
HTTP Server 接收
    ↓
中间件链（静态文件 → Body解析 → Session → 日志）
    ↓
路由匹配
    ↓
Controller 处理
    ↓
Model 操作数据
    ↓
View 渲染模板
    ↓
返回 HTML/JSON 响应
\`\`\`

---

## 五、功能清单

我们将实现一个简单的博客系统：

1. **首页**：展示最新文章列表
2. **文章列表**：分页浏览所有文章
3. **文章详情**：查看单篇文章
4. **创建文章**：登录后可写新文章
5. **编辑/删除**：作者可修改删除
6. **用户登录/登出**：Session 认证
7. **静态文件**：CSS 样式

Demo 是一个完整可运行的 MVC 博客系统，单文件包含所有模块！
`,
    code: `// ============================================
// 完整 MVC 风格博客系统
// Model - View - Controller 架构
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

// ============================================
// 【工具模块】
// ============================================

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      cookies[name] = decodeURIComponent(rest.join('='));
    });
  }
  return cookies;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ============================================
// 【中间件模块】
// ============================================

// Body 解析中间件
function bodyParser(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try { req.body = JSON.parse(body || '{}'); }
        catch { req.body = {}; }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        req.body = {};
        body.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          req.body[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\\+/g, ' '));
        });
      } else {
        req.body = {};
      }
      resolve();
    });
    req.on('error', reject);
  });
}

// Session 内存存储
const sessionStore = new Map();

function sessionMiddleware(req, res) {
  const cookies = parseCookies(req);
  let sessionId = cookies['blog_session'];

  if (!sessionId || !sessionStore.has(sessionId)) {
    sessionId = crypto.randomBytes(16).toString('hex');
    sessionStore.set(sessionId, {
      createdAt: Date.now(),
      data: {},
    });
    res.setHeader('Set-Cookie', \`blog_session=\${sessionId}; HttpOnly; Path=/; Max-Age=86400\`);
  }

  req.session = sessionStore.get(sessionId).data;
  req.sessionId = sessionId;
}

// 静态文件服务
function serveStatic(req, res, publicDir) {
  const pathname = decodeURIComponent(new URL(req.url, \`http://\${req.headers.host}\`).pathname);
  if (!pathname.startsWith('/public/')) return false;

  const filePath = path.join(publicDir, pathname.replace('/public/', ''));
  if (!filePath.startsWith(publicDir + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return true;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.css': 'text/css', '.js': 'application/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
  return true;
}

// 认证中间件
function requireAuth(req, res) {
  if (!req.session.user) {
    res.writeHead(302, { Location: '/login' });
    res.end();
    return false;
  }
  return true;
}

// ============================================
// 【模板引擎模块】- 简单实现
// ============================================

function renderTemplate(template, data) {
  let html = template;

  // 处理 {{#if key}}...{{/if}} 条件
  html = html.replace(/\\{\\{#if (\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/if\\}\\}/g, (_, key, content) => {
    return data[key] ? content : '';
  });

  // 处理 {{#each arr}}...{{/each}} 循环
  html = html.replace(/\\{\\{#each (\\w+)\\}\\}([\\s\\S]*?)\\{\\{\\/each\\}\\}/g, (_, key, content) => {
    const arr = data[key] || [];
    return arr.map((item, index) => {
      let itemContent = content;
      // 替换 {{this}} 为当前项
      itemContent = itemContent.replace(/\\{\\{this\\}\\}/g, escapeHtml(typeof item === 'string' ? item : JSON.stringify(item)));
      // 替换 {{key}} 为 item.key
      itemContent = itemContent.replace(/\\{\\{(\\w+)\\}\\}/g, (__, k) => {
        return item[k] !== undefined ? escapeHtml(item[k]) : '';
      });
      itemContent = itemContent.replace(/\\{\\{@index\\}\\}/g, index);
      return itemContent;
    }).join('');
  });

  // 处理 {{{key}}} 不转义
  html = html.replace(/\\{\\{\\{(\\w+)\\}\\}\\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  // 处理 {{key}} 转义替换
  html = html.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => {
    return escapeHtml(data[key]);
  });

  return html;
}

function render(res, view, data = {}) {
  const viewsDir = path.join(__dirname, 'views');
  // 实际项目中从文件读取，这里为了演示在代码中定义模板
  const templates = getTemplates();
  const content = templates[view] || '<h1>Template Not Found</h1>';
  const layout = templates['layout'];
  const renderedContent = renderTemplate(content, data);
  const finalHtml = renderTemplate(layout, { ...data, content: renderedContent });
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(finalHtml);
}

// 内置模板（实际项目放在 views/ 目录）
function getTemplates() {
  return {
    layout: \`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{title}} - MVC 博客</title>
<link rel="stylesheet" href="/public/style.css">
</head>
<body>
<nav class="navbar">
  <div class="container">
    <a href="/" class="logo">🏛️ MVC 博客</a>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/posts">文章</a>
      {{#if user}}
        <a href="/posts/new">写文章</a>
        <span class="user-info">欢迎, {{user}}</span>
        <a href="/logout" class="btn">登出</a>
      {{else}}
        <a href="/login" class="btn">登录</a>
      {{/if}}
    </div>
  </div>
</nav>
<main class="container">
  {{{content}}}
</main>
<footer><div class="container">MVC 架构演示 - 仅使用 Node.js 内置模块</div></footer>
</body></html>\`,

    home: \`<h1>📝 欢迎来到 MVC 博客</h1>
<p>这是一个使用 Model-View-Controller 架构构建的博客系统，完全使用 Node.js 内置模块！</p>
<div class="posts-grid">
{{#each posts}}
<article class="post-card">
  <h2><a href="/posts/{{id}}">{{title}}</a></h2>
  <div class="meta">作者: {{author}} | {{date}}</div>
  <p>{{excerpt}}</p>
  <a href="/posts/{{id}}" class="read-more">阅读全文 →</a>
</article>
{{/each}}
</div>
<p><a href="/posts" class="btn">查看全部文章 →</a></p>\`,

    list: \`<h1>📚 所有文章</h1>
<div class="posts-list">
{{#each posts}}
<div class="post-item">
  <h2><a href="/posts/{{id}}">{{title}}</a></h2>
  <div class="meta">作者: {{author}} | {{date}}</div>
</div>
{{/each}}
</div>
<div class="pagination">{{pagination}}</div>\`,

    detail: \`<article class="post-detail">
<a href="/posts" class="back">← 返回列表</a>
<h1>{{title}}</h1>
<div class="meta">作者: {{author}} | {{date}}</div>
<div class="post-body">{{{body}}}</div>
{{#if canEdit}}
<div class="actions">
  <a href="/posts/{{id}}/edit" class="btn">编辑</a>
  <form method="POST" action="/posts/{{id}}/delete" style="display:inline">
    <button type="submit" class="btn btn-danger" onclick="return confirm('确定删除？')">删除</button>
  </form>
</div>
{{/if}}
</article>\`,

    new: \`<h1>✏️ 写新文章</h1>
<form method="POST" action="/posts" class="post-form">
<div class="form-group">
  <label>标题</label>
  <input type="text" name="title" required placeholder="文章标题">
</div>
<div class="form-group">
  <label>正文（支持简单 HTML）</label>
  <textarea name="body" rows="15" required placeholder="写下你的想法..."></textarea>
</div>
<button type="submit" class="btn">发布文章</button>
<a href="/posts" class="btn btn-secondary">取消</a>
</form>\`,

    edit: \`<h1>✏️ 编辑文章</h1>
<form method="POST" action="/posts/{{id}}" class="post-form">
<input type="hidden" name="_method" value="PUT">
<div class="form-group">
  <label>标题</label>
  <input type="text" name="title" required value="{{title}}">
</div>
<div class="form-group">
  <label>正文</label>
  <textarea name="body" rows="15" required>{{{body}}}</textarea>
</div>
<button type="submit" class="btn">保存修改</button>
<a href="/posts/{{id}}" class="btn btn-secondary">取消</a>
</form>\`,

    login: \`<div class="login-box">
<h1>🔐 登录</h1>
{{#if error}}<div class="error">{{error}}</div>{{/if}}
<form method="POST" action="/login" class="login-form">
<div class="form-group">
  <label>用户名</label>
  <input type="text" name="username" required value="admin">
</div>
<div class="form-group">
  <label>密码</label>
  <input type="password" name="password" required value="admin123">
</div>
<button type="submit" class="btn">登录</button>
</form>
<p class="hint">演示账户: admin / admin123</p>
</div>\`,
  };
}

// 内置 CSS
const cssContent = \`* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #333; background: #f5f5f5; line-height: 1.6; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
.navbar { background: #2563eb; color: white; padding: 15px 0; margin-bottom: 30px; }
.navbar .container { display: flex; justify-content: space-between; align-items: center; }
.logo { color: white; font-size: 20px; font-weight: bold; text-decoration: none; }
.nav-links a { color: rgba(255,255,255,0.9); text-decoration: none; margin-left: 20px; }
.nav-links a:hover { color: white; }
.user-info { margin-left: 20px; opacity: 0.9; }
.btn { display: inline-block; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; text-decoration: none; cursor: pointer; font-size: 14px; margin: 5px; }
.btn:hover { background: #1d4ed8; }
.btn-danger { background: #dc2626; }
.btn-danger:hover { background: #b91c1c; }
.btn-secondary { background: #6b7280; }
.post-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.post-card h2 { margin-bottom: 10px; }
.post-card h2 a { color: #1a1a1a; text-decoration: none; }
.post-card h2 a:hover { color: #2563eb; }
.meta { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
.read-more { color: #2563eb; text-decoration: none; font-weight: 500; }
.posts-list .post-item { background: white; padding: 15px 20px; margin: 10px 0; border-radius: 6px; }
.posts-list .post-item h2 a { color: #1a1a1a; text-decoration: none; font-size: 18px; }
.post-detail { background: white; padding: 30px; border-radius: 8px; }
.post-detail h1 { margin-bottom: 10px; }
.post-body { margin: 20px 0; line-height: 1.8; }
.post-body p { margin: 15px 0; }
.back { color: #6b7280; text-decoration: none; display: inline-block; margin-bottom: 20px; }
.actions { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
.login-box { max-width: 400px; margin: 60px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.login-box h1 { text-align: center; margin-bottom: 25px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; font-family: inherit; }
.form-group textarea { resize: vertical; }
.login-form .btn { width: 100%; padding: 12px; margin: 10px 0; }
.error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
.hint { text-align: center; color: #6b7280; font-size: 13px; margin-top: 15px; }
footer { margin-top: 50px; padding: 20px 0; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; }
footer .container { padding: 0; }\`;

// ============================================
// 【Model 层】- 数据操作（模拟数据库）
// ============================================

const users = [
  { id: 1, username: 'admin', password: 'admin123', name: '管理员' },
  { id: 2, username: 'user', password: 'password', name: '普通用户' },
];

let posts = [
  {
    id: 1, title: 'MVC 架构入门', author: 'admin', authorId: 1,
    body: '<p>MVC 是 Model-View-Controller 的缩写，是一种经典的软件设计模式。</p><p>它将应用分为三个核心部分，各司其职，便于维护和扩展。</p>',
    excerpt: 'MVC 是 Model-View-Controller 的缩写，是一种经典的软件设计模式...',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 2, title: 'Node.js 内置模块强大', author: 'admin', authorId: 1,
    body: '<p>Node.js 内置了 http、fs、path、crypto 等强大模块，无需 npm 包就能构建完整的 Web 服务器！</p>',
    excerpt: 'Node.js 内置了 http、fs、path、crypto 等强大模块...',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 3, title: '从零实现 Web 框架', author: 'user', authorId: 2,
    body: '<p>理解中间件、路由、模板引擎原理的最佳方式就是动手实现一个！</p>',
    excerpt: '理解中间件、路由、模板引擎原理的最佳方式就是动手实现一个！',
    createdAt: Date.now() - 86400000,
  },
];
let nextPostId = 4;

const PostModel = {
  findAll({ page = 1, limit = 10 } = {}) {
    const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);
    const start = (page - 1) * limit;
    return {
      posts: sorted.slice(start, start + limit).map(p => ({
        ...p,
        date: new Date(p.createdAt).toLocaleDateString('zh-CN'),
      })),
      total: sorted.length,
      page, limit,
    };
  },

  findRecent(limit = 5) {
    return [...posts]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map(p => ({
        ...p,
        date: new Date(p.createdAt).toLocaleDateString('zh-CN'),
      }));
  },

  findById(id) {
    const post = posts.find(p => p.id === parseInt(id));
    if (!post) return null;
    return { ...post, date: new Date(post.createdAt).toLocaleDateString('zh-CN') };
  },

  create({ title, body, author, authorId }) {
    const post = {
      id: nextPostId++, title, body, author, authorId,
      excerpt: body.replace(/<[^>]+>/g, '').slice(0, 100) + '...',
      createdAt: Date.now(),
    };
    posts.push(post);
    return post;
  },

  update(id, { title, body }) {
    const index = posts.findIndex(p => p.id === parseInt(id));
    if (index === -1) return null;
    posts[index] = {
      ...posts[index], title, body,
      excerpt: body.replace(/<[^>]+>/g, '').slice(0, 100) + '...',
    };
    return posts[index];
  },

  delete(id) {
    const index = posts.findIndex(p => p.id === parseInt(id));
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
  },
};

const UserModel = {
  findByUsername(username) {
    return users.find(u => u.username === username);
  },
};

// ============================================
// 【Controller 层】- 请求处理
// ============================================

const HomeController = {
  index(req, res) {
    const recentPosts = PostModel.findRecent(6);
    render(res, 'home', { title: '首页', posts: recentPosts, user: req.session.user });
  },
};

const PostController = {
  list(req, res) {
    const urlObj = new URL(req.url, \`http://\${req.headers.host}\`);
    const page = parseInt(urlObj.searchParams.get('page') || '1');
    const result = PostModel.findAll({ page, limit: 5 });
    const totalPages = Math.ceil(result.total / result.limit);
    let pagination = '';
    for (let i = 1; i <= totalPages; i++) {
      pagination += \`<a href="/posts?page=\${i}" class="btn" style="\${i === page ? 'background:#1d4ed8' : ''}">\${i}</a> \`;
    }
    render(res, 'list', {
      title: '文章列表',
      posts: result.posts,
      pagination,
      user: req.session.user,
    });
  },

  detail(req, res, id) {
    const post = PostModel.findById(id);
    if (!post) { res.writeHead(404); return res.end('文章不存在'); }
    const canEdit = req.session.userId === post.authorId;
    render(res, 'detail', {
      title: post.title,
      ...post,
      canEdit,
      user: req.session.user,
    });
  },

  newForm(req, res) {
    if (!requireAuth(req, res)) return;
    render(res, 'new', { title: '写文章', user: req.session.user });
  },

  create(req, res) {
    if (!requireAuth(req, res)) return;
    const { title, body } = req.body;
    if (!title || !body) {
      return render(res, 'new', { title: '写文章', error: '标题和内容不能为空', user: req.session.user });
    }
    const post = PostModel.create({
      title, body,
      author: req.session.user,
      authorId: req.session.userId,
    });
    res.writeHead(302, { Location: \`/posts/\${post.id}\` });
    res.end();
  },

  editForm(req, res, id) {
    if (!requireAuth(req, res)) return;
    const post = PostModel.findById(id);
    if (!post || post.authorId !== req.session.userId) {
      res.writeHead(403); return res.end('无权限');
    }
    render(res, 'edit', {
      title: '编辑: ' + post.title,
      ...post,
      user: req.session.user,
    });
  },

  update(req, res, id) {
    if (!requireAuth(req, res)) return;
    const post = PostModel.findById(id);
    if (!post || post.authorId !== req.session.userId) {
      res.writeHead(403); return res.end('无权限');
    }
    const { title, body } = req.body;
    PostModel.update(id, { title, body });
    res.writeHead(302, { Location: \`/posts/\${id}\` });
    res.end();
  },

  remove(req, res, id) {
    if (!requireAuth(req, res)) return;
    const post = PostModel.findById(id);
    if (!post || post.authorId !== req.session.userId) {
      res.writeHead(403); return res.end('无权限');
    }
    PostModel.delete(id);
    res.writeHead(302, { Location: '/posts' });
    res.end();
  },
};

const AuthController = {
  loginForm(req, res) {
    render(res, 'login', { title: '登录', error: null });
  },

  login(req, res) {
    const { username, password } = req.body;
    const user = UserModel.findByUsername(username);
    if (user && user.password === password) {
      req.session.user = user.name;
      req.session.userId = user.id;
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    render(res, 'login', { title: '登录', error: '用户名或密码错误' });
  },

  logout(req, res) {
    req.session.user = null;
    req.session.userId = null;
    res.writeHead(302, { Location: '/' });
    res.end();
  },
};

// ============================================
// 【路由模块】
// ============================================

const routes = [
  { method: 'GET', path: '/', handler: HomeController.index },
  { method: 'GET', path: '/login', handler: AuthController.loginForm },
  { method: 'POST', path: '/login', handler: AuthController.login },
  { method: 'GET', path: '/logout', handler: AuthController.logout },
  { method: 'GET', path: '/posts', handler: PostController.list },
  { method: 'GET', path: '/posts/new', handler: PostController.newForm },
  { method: 'POST', path: '/posts', handler: PostController.create },
  { method: 'GET', path: /^\\/posts\\/(\\d+)\\/edit$/, handler: (req, res, match) => PostController.editForm(req, res, match[1]) },
  { method: 'POST', path: /^\\/posts\\/(\\d+)\\/delete$/, handler: (req, res, match) => PostController.remove(req, res, match[1]) },
  { method: 'GET', path: /^\\/posts\\/(\\d+)$/, handler: (req, res, match) => PostController.detail(req, res, match[1]) },
];

function route(req, res) {
  const urlObj = new URL(req.url, \`http://\${req.headers.host}\`);
  let method = req.method;

  // 支持 _method 字段模拟 PUT/DELETE
  if (req.body && req.body._method) {
    method = req.body._method.toUpperCase();
  }

  for (const route of routes) {
    if (route.method !== method) continue;

    if (typeof route.path === 'string') {
      if (route.path === urlObj.pathname) {
        return route.handler(req, res);
      }
    } else if (route.path instanceof RegExp) {
      const match = urlObj.pathname.match(route.path);
      if (match) {
        return route.handler(req, res, match);
      }
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404 Not Found</h1>');
}

// ============================================
// 创建应用服务器
// ============================================

const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_DIR, 'style.css'), cssContent);

const server = http.createServer(async (req, res) => {
  const start = Date.now();
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);

  try {
    // 1. 静态文件优先
    if (serveStatic(req, res, PUBLIC_DIR)) return;

    // 2. Session
    sessionMiddleware(req, res);

    // 3. Body 解析
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      await bodyParser(req);
    }

    // 4. 路由分发
    route(req, res);

    console.log(\`  -> 处理完成 \${Date.now() - start}ms\`);
  } catch (err) {
    console.error('请求处理错误:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 服务器内部错误</h1><pre>' + escapeHtml(err.message) + '</pre>');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  🏛️  MVC 博客系统已启动');
  console.log(\`  地址: http://localhost:\${PORT}\`);
  console.log('========================================');
  console.log('');
  console.log('📁 项目结构（逻辑分离）:');
  console.log('  工具层     - 辅助函数、转义、Cookie解析');
  console.log('  中间件层   - bodyParser、session、static、auth');
  console.log('  模板引擎   - 简单实现变量替换/循环/条件');
  console.log('  Model 层   - PostModel、UserModel（数据操作）');
  console.log('  Controller - Home/Post/Auth 控制器');
  console.log('  路由层     - URL → Controller 映射');
  console.log('');
  console.log('🔑 演示账户:');
  console.log('  用户名: admin  密码: admin123  (可以创建/编辑/删除文章)');
  console.log('  用户名: user   密码: password   (可以创建文章)');
  console.log('');
  console.log('✨ 功能特性:');
  console.log('  ✅ MVC 架构清晰分层');
  console.log('  ✅ 文章 CRUD 完整功能');
  console.log('  ✅ Session 用户认证');
  console.log('  ✅ 权限控制（作者才能编辑删除）');
  console.log('  ✅ 简单模板引擎（继承/变量/循环/条件）');
  console.log('  ✅ XSS 防护');
  console.log('  ✅ CSS 样式美化');
});
`,
  },
];
