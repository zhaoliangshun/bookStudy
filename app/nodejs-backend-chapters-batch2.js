export const chapters = [
  {
    id: "nb-http-basic",
    group: "第一部分：基础篇",
    icon: "🌐",
    title: "原生HTTP模块：从零搭建Web服务器",
    content: `# 原生HTTP模块：从零搭建Web服务器

现在我们正式进入Web后端开发！Node.js内置了\`http\`模块，不需要任何框架就能创建Web服务器。理解原生HTTP模块的工作原理，能帮你更好地理解Express等框架背后做了什么。

---

## 一、HTTP协议基础回顾

在写代码之前，我们快速回顾一下HTTP的核心概念：

### 请求（Request）
客户端（浏览器）向服务器发送的消息，包含：
- **请求方法**：GET（获取）、POST（创建）、PUT（更新）、DELETE（删除）等
- **请求URL**：要访问的资源路径，如\`/api/users\`
- **请求头（Headers）**：元信息，如Content-Type、Authorization、Cookie
- **请求体（Body）**：发送的数据（POST/PUT时有）

### 响应（Response）
服务器返回给客户端的消息，包含：
- **状态码**：200（成功）、404（未找到）、500（服务器错误）、401（未授权）等
- **响应头**：Content-Type、Set-Cookie等
- **响应体**：返回的数据（HTML、JSON、文件等）

---

## 二、创建最简单的HTTP服务器

用Node.js的\`http\`模块创建一个服务器只需要几行代码：

\`\`\`javascript
const http = require('http');

// createServer接收一个回调函数，每次有请求进来都会执行这个回调
// req: request对象，包含请求的所有信息
// res: response对象，用于发送响应
const server = http.createServer((req, res) => {
  res.end('Hello World!');
});

// listen(端口号, 回调)：启动服务器监听指定端口
server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000/');
});
\`\`\`

运行后，浏览器访问http://localhost:3000就能看到Hello World了！

---

## 三、Request对象详解

\`req\`（IncomingMessage对象）包含了请求的所有信息：

| 属性/方法 | 说明 |
|-----------|------|
| \`req.method\` | 请求方法，如'GET'、'POST'（大写字符串） |
| \`req.url\` | 请求URL路径和查询字符串，如\`/api/users?id=1\` |
| \`req.headers\` | 请求头对象，键都是小写 |
| \`req.httpVersion\` | HTTP版本 |
| \`req.on('data', cb)\` | 监听请求体数据（因为是流） |
| \`req.on('end', cb)\` | 请求体接收完毕 |

### 获取请求体数据

HTTP请求体是**流式传输**的，不是一次性拿到的，需要监听data事件拼接：

\`\`\`javascript
let body = '';
req.on('data', chunk => {
  body += chunk.toString(); // chunk是Buffer，转成字符串
});
req.on('end', () => {
  // body现在是完整的请求体字符串，如果是JSON可以parse
  const data = JSON.parse(body);
});
\`\`\`

---

## 四、Response对象详解

\`res\`（ServerResponse对象）用于构造和发送响应：

| 方法/属性 | 说明 |
|-----------|------|
| \`res.writeHead(statusCode, headers)\` | 写入响应状态码和头 |
| \`res.setHeader(name, value)\` | 设置单个响应头 |
| \`res.statusCode = xxx\` | 单独设置状态码 |
| \`res.write(data)\` | 写入响应体（可以多次调用） |
| \`res.end(data?)\` | 结束响应，可选传入最后一块数据 |

### 发送JSON响应

\`\`\`javascript
res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
res.end(JSON.stringify({ message: '成功', data: [...] }));
\`\`\`

### 设置状态码

\`\`\`javascript
res.statusCode = 404;
res.end('Not Found');

// 或者链式设置
res.writeHead(500, { 'Content-Type': 'text/plain' });
res.end('Internal Server Error');
\`\`\`

---

## 五、处理不同的路由和方法

原生HTTP模块没有路由功能，需要自己判断\`req.url\`和\`req.method\`：

\`\`\`javascript
const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;

  // 简单路由匹配
  if (method === 'GET' && url === '/') {
    res.end('Home Page');
  } else if (method === 'GET' && url === '/about') {
    res.end('About Page');
  } else if (method === 'GET' && url.startsWith('/api/users')) {
    // 处理用户API
    handleUsers(req, res);
  } else {
    res.statusCode = 404;
    res.end('404 Not Found');
  }
});
\`\`\`

你可能已经发现了——手动处理路由很麻烦，特别是URL还带查询参数（\`?id=1\`）的时候。这就是为什么我们需要Express这样的框架，它帮我们封装了这些繁琐的工作。但理解底层原理非常重要！

---

## 六、URL模块解析URL

Node.js内置\`url\`模块，可以方便地解析URL：

\`\`\`javascript
const url = require('url');

const parsedUrl = url.parse(req.url, true);
// parsedUrl.pathname: 路径部分，如'/api/users'
// parsedUrl.query: 查询参数对象（第二个参数true时自动解析），如{ id: '1' }
\`\`\`

---

## 七、一个完整的原生API服务器

让我们写一个功能相对完整的REST API服务器，不依赖任何框架，实现用户CRUD（增删改查）：
`,
    code: `// ============================================
// 原生HTTP模块实现完整的REST API服务器
// 功能：用户的增删改查（CRUD）API
// ============================================

// 导入Node.js内置模块
const http = require('http');  // HTTP服务器核心模块
const url = require('url');    // URL解析模块

// 模拟数据库：用数组存数据（实际项目用MySQL/MongoDB）
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
];
let nextId = 4; // 自增ID

// 工具函数：发送JSON响应
function sendJson(res, statusCode, data) {
  // writeHead设置状态码和响应头
  // Content-Type告诉客户端返回的是JSON，用utf-8编码支持中文
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  // JSON.stringify把JS对象转成JSON字符串
  res.end(JSON.stringify(data, null, 2));
}

// 工具函数：解析请求体JSON
function parseBody(req) {
  // 返回Promise，因为请求体是异步接收的
  return new Promise((resolve, reject) => {
    let body = '';
    // data事件：接收到一块数据时触发
    req.on('data', chunk => {
      body += chunk.toString();
    });
    // end事件：数据接收完毕
    req.on('end', () => {
      try {
        // 如果body为空，返回空对象
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (err) {
        // JSON解析失败，reject错误
        reject(new Error('Invalid JSON'));
      }
    });
    // error事件：接收数据出错
    req.on('error', reject);
  });
}

// 创建HTTP服务器
// 注意：回调函数用async，因为我们要await parseBody
const server = http.createServer(async (req, res) => {
  // 解析URL，true表示自动解析query参数为对象
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;  // 路径：/api/users
  const method = req.method;            // 方法：GET, POST等
  const query = parsedUrl.query;        // 查询参数对象

  // 打印请求日志，方便调试
  console.log(\`[\${new Date().toISOString()}] \${method} \${pathname}\`);

  try {
    // ========== 路由分发 ==========

    // 1. 获取所有用户 GET /api/users
    // 2. 获取单个用户 GET /api/users/:id
    // 用正则匹配 /api/users 后面跟数字ID的情况
    const userMatch = pathname.match(/^\\/api\\/users\\/(\\d+)$/);

    if (pathname === '/api/users' && method === 'GET') {
      // 查询所有用户，支持简单的name搜索
      let result = users;
      if (query.name) {
        // 按名字模糊搜索
        result = users.filter(u => u.name.includes(query.name));
      }
      sendJson(res, 200, {
        success: true,
        count: result.length,
        data: result
      });

    } else if (userMatch && method === 'GET') {
      // 获取单个用户
      const id = parseInt(userMatch[1], 10);
      const user = users.find(u => u.id === id);
      if (!user) {
        sendJson(res, 404, { success: false, message: '用户不存在' });
        return;
      }
      sendJson(res, 200, { success: true, data: user });

    } else if (pathname === '/api/users' && method === 'POST') {
      // 创建新用户
      const body = await parseBody(req);
      // 简单验证
      if (!body.name || !body.email) {
        sendJson(res, 400, { success: false, message: 'name和email必填' });
        return;
      }
      const newUser = {
        id: nextId++,
        name: body.name,
        email: body.email,
        age: body.age || 0
      };
      users.push(newUser);
      sendJson(res, 201, { success: true, data: newUser });

    } else if (userMatch && method === 'PUT') {
      // 更新用户
      const id = parseInt(userMatch[1], 10);
      const body = await parseBody(req);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        sendJson(res, 404, { success: false, message: '用户不存在' });
        return;
      }
      users[index] = { ...users[index], ...body, id }; // id不能改
      sendJson(res, 200, { success: true, data: users[index] });

    } else if (userMatch && method === 'DELETE') {
      // 删除用户
      const id = parseInt(userMatch[1], 10);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        sendJson(res, 404, { success: false, message: '用户不存在' });
        return;
      }
      const deleted = users.splice(index, 1)[0];
      sendJson(res, 200, { success: true, data: deleted });

    } else if (pathname === '/' && method === 'GET') {
      // 首页
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(\`
        <h1>🎉 原生Node.js API服务器</h1>
        <p>可用接口：</p>
        <ul>
          <li>GET /api/users - 获取所有用户</li>
          <li>GET /api/users/:id - 获取单个用户</li>
          <li>POST /api/users - 创建用户</li>
          <li>PUT /api/users/:id - 更新用户</li>
          <li>DELETE /api/users/:id - 删除用户</li>
        </ul>
      \`);

    } else {
      // 404
      sendJson(res, 404, { success: false, message: '接口不存在' });
    }

  } catch (err) {
    // 统一错误处理
    console.error('服务器错误:', err);
    sendJson(res, 500, { success: false, message: err.message });
  }
});

// 启动服务器，监听3000端口
const PORT = 3000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  🚀 原生HTTP API服务器已启动！');
  console.log('  📡 地址: http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
  console.log('💡 你可以用curl或Postman测试以下接口：');
  console.log('   GET    http://localhost:' + PORT + '/api/users');
  console.log('   GET    http://localhost:' + PORT + '/api/users/1');
  console.log('   POST   http://localhost:' + PORT + '/api/users');
  console.log('   PUT    http://localhost:' + PORT + '/api/users/1');
  console.log('   DELETE http://localhost:' + PORT + '/api/users/1');
  console.log('');
  console.log('👉 这个服务器没有用任何框架，完全用Node.js内置模块！');
  console.log('   你感受到了吗？手动处理路由、解析请求体很繁琐，');
  console.log('   这就是为什么我们需要Express框架来简化开发。');
});

// 注意：在沙箱环境中服务器不会真正启动，
// 但代码结构和逻辑是完整的，你可以在本地运行。
console.log('');
console.log('📝 代码要点：');
console.log('   1. http.createServer()创建服务器');
console.log('   2. req包含请求信息，res用于发送响应');
console.log('   3. 请求体是流式的，需要监听data/end事件接收');
console.log('   4. 手动路由需要判断method和url');
console.log('   5. 发送JSON要设置Content-Type和用JSON.stringify');
`
  },
  {
    id: "nb-async-programming",
    group: "第一部分：基础篇",
    icon: "⏳",
    title: "异步编程：回调、Promise、async/await",
    content: `# 异步编程：回调、Promise、async/await

异步编程是Node.js最重要的特性之一，也是很多初学者的难点。理解异步编程是写好Node.js后端的关键——数据库操作、文件读写、网络请求全都是异步的。

---

## 一、为什么Node.js是异步的？

Node.js基于事件循环，采用非阻塞I/O模型。当你执行一个耗时的I/O操作（比如读文件、查数据库）时，Node.js不会傻等结果，而是继续处理其他事情，等I/O完成了再通过回调函数通知你。

同步（阻塞）vs 异步（非阻塞）：
- **同步**：你在餐厅点了菜，站在柜台前等着，什么也不做，直到菜做好——阻塞
- **异步**：你点了菜，拿个号，去找位置坐下玩手机，菜做好了叫号——非阻塞

---

## 二、第一阶段：回调函数（Callback）

回调是异步编程最基础的方式：把一个函数作为参数传给异步操作，操作完成后调用这个函数。

### Node.js回调约定

Node.js的回调有一个统一的约定：**错误优先**（error-first callback）
- 回调函数第一个参数是错误对象，如果成功则是null/undefined
- 第二个及以后的参数才是成功结果

\`\`\`javascript
const fs = require('fs');

// 异步读取文件
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    // 出错了
    console.error('读取失败:', err);
    return;
  }
  // 成功了
  console.log('文件内容:', data);
});
\`\`\`

### 回调地狱（Callback Hell）

当多个异步操作有依赖关系时，回调会层层嵌套，形成"回调地狱"或"金字塔厄运"：

\`\`\`javascript
fs.readFile('file1.txt', 'utf8', (err, data1) => {
  if (err) throw err;
  fs.readFile('file2.txt', 'utf8', (err, data2) => {
    if (err) throw err;
    fs.writeFile('result.txt', data1 + data2, (err) => {
      if (err) throw err;
      console.log('合并完成！');
      // 还能继续嵌套...
    });
  });
});
\`\`\`

回调地狱的问题：
1. 代码横向发展，难以阅读
2. 错误处理重复啰嗦
3. 不能直接return/throw
4. 调试困难

---

## 三、第二阶段：Promise

Promise是ES6引入的，专门用来解决回调地狱问题。它代表一个异步操作的最终结果。

### Promise的三种状态
- **pending（等待中）**：初始状态
- **fulfilled（已成功）**：操作成功完成
- **rejected（已失败）**：操作失败

状态一旦改变就不可逆。

### 基本用法

\`\`\`javascript
const fs = require('fs').promises; // Node 10+支持promises版本

fs.readFile('example.txt', 'utf8')
  .then(data => {
    console.log('成功:', data);
  })
  .catch(err => {
    console.error('失败:', err);
  });
\`\`\`

### 链式调用

.then()返回一个新的Promise，可以链式调用，解决回调地狱：

\`\`\`javascript
fs.readFile('file1.txt', 'utf8')
  .then(data1 => {
    return fs.readFile('file2.txt', 'utf8'); // 返回Promise
  })
  .then(data2 => {
    return fs.writeFile('result.txt', data2);
  })
  .then(() => {
    console.log('完成！');
  })
  .catch(err => {
    // 统一错误处理！任何一步出错都会到这里
    console.error('出错了:', err);
  });
\`\`\`

### Promise常用方法

| 方法 | 作用 |
|------|------|
| \`Promise.resolve(val)\` | 返回一个成功的Promise |
| \`Promise.reject(err)\` | 返回一个失败的Promise |
| \`Promise.all([p1,p2,p3])\` | 全部成功才成功，返回结果数组；任一失败就失败 |
| \`Promise.allSettled([p1,p2])\` | 等所有完成，无论成功失败，返回每个的状态 |
| \`Promise.race([p1,p2,p3])\` | 第一个settled的（不管成功失败）决定结果 |
| \`Promise.any([p1,p2,p3])\` | 第一个成功的就成功，全失败才失败 |

### 把回调风格函数转成Promise

Node.js的\`util.promisify\`可以把error-first回调风格的函数转成返回Promise的函数：

\`\`\`javascript
const util = require('util');
const fs = require('fs');
const readFileAsync = util.promisify(fs.readFile);

readFileAsync('example.txt', 'utf8')
  .then(data => console.log(data));
\`\`\`

---

## 四、第三阶段：async/await（最推荐）

async/await是ES2017引入的语法糖，让异步代码写起来像同步一样，是目前最推荐的写法。

### 基本用法
- 在函数前面加\`async\`，这个函数就会返回Promise
- 在async函数里，可以用\`await\`等待Promise完成
- \`await\`会"暂停"执行，等待Promise resolve，然后返回结果

\`\`\`javascript
const fs = require('fs').promises;

async function readAndMerge() {
  try {
    // await等待Promise完成，直接拿到结果
    const data1 = await fs.readFile('file1.txt', 'utf8');
    const data2 = await fs.readFile('file2.txt', 'utf8');
    await fs.writeFile('result.txt', data1 + data2);
    console.log('合并完成！');
    return 'done';
  } catch (err) {
    // try/catch捕获错误，和同步代码一样！
    console.error('出错了:', err);
    throw err; // 可以继续抛出
  }
}

readAndMerge();
\`\`\`

是不是像同步代码一样清晰？没有嵌套，错误处理用try/catch，这就是async/await的威力！

### async/await要点

1. **await只能在async函数里使用**（ES2022后顶层也可以用了）
2. **await后面跟Promise**，如果不是Promise会被包装成resolved Promise
3. **多个独立的异步操作不要串行await**，用Promise.all并行：

\`\`\`javascript
// ❌ 慢：串行，等第一个完了再读第二个，总耗时=time1+time2
const data1 = await fs.readFile('file1.txt');
const data2 = await fs.readFile('file2.txt');

// ✅ 快：并行，同时读两个，总耗时=max(time1,time2)
const [data1, data2] = await Promise.all([
  fs.readFile('file1.txt'),
  fs.readFile('file2.txt')
]);
\`\`\`

---

## 五、异步编程常见模式

### 1. 并发控制
Promise.all虽然好用，但如果并发数太多（比如同时发1000个请求），可能会压垮服务器。需要限制并发数。

### 2. 重试机制
异步操作可能失败（网络波动），需要自动重试几次。

### 3. 超时控制
给异步操作加超时时间，超过时间就放弃。

### 4. 异步迭代
处理大量数据时，可以用for await...of异步遍历。

---

让我们在代码示例中演示这些模式！
`,
    code: `// ============================================
// 异步编程综合演示：回调、Promise、async/await
// + 超时控制、重试机制、并发控制
// ============================================

// 导入需要的模块
const util = require('util');

// ---------- 0. 模拟异步函数 ----------
// 我们写一个模拟的异步API，随机成功/失败，模拟网络请求
function mockApiCall(name, delay, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail || Math.random() < 0.3) {
        reject(new Error(\`\${name} 失败了\`));
      } else {
        resolve(\`\${name} 成功，耗时\${delay}ms\`);
      }
    }, delay);
  });
}

// ---------- 1. Promise版本：带超时的API调用 ----------
function withTimeout(promise, ms) {
  // Promise.race：谁先完成就用谁的结果
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(\`超时(\${ms}ms)\`)), ms);
    })
  ]);
}

// ---------- 2. 重试机制 ----------
async function retry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      console.log(\`  尝试第\${i + 1}次...\`);
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < maxRetries) {
        console.log(\`  失败了，\${delayMs}ms后重试...\`);
        // 等待一段时间再重试
        await new Promise(r => setTimeout(r, delayMs));
        // 指数退避：每次重试等待时间翻倍（可选）
        delayMs *= 2;
      }
    }
  }
  throw lastError;
}

// ---------- 3. 并发控制：限制同时执行的Promise数量 ----------
async function asyncPool(promises, limit) {
  const results = [];
  const executing = new Set();
  
  for (const [index, promiseFactory] of promises.entries()) {
    // promiseFactory是返回Promise的函数
    const p = Promise.resolve().then(() => promiseFactory());
    results[index] = p;
    executing.add(p);
    
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    
    if (executing.size >= limit) {
      // 等最先完成的那个
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// ---------- 主函数，演示各种异步模式 ----------
async function main() {
  console.log('========================================');
  console.log('  ⏳ 异步编程模式综合演示');
  console.log('========================================');
  console.log('');

  // ---------- 演示1：Promise基本用法 ----------
  console.log('📌 演示1：Promise基本用法');
  mockApiCall('请求A', 500)
    .then(result => console.log('  then结果:', result))
    .catch(err => console.log('  catch错误:', err.message));
  await new Promise(r => setTimeout(r, 600));
  console.log('');

  // ---------- 演示2：async/await ----------
  console.log('📌 演示2：async/await');
  try {
    const result = await mockApiCall('请求B', 300);
    console.log('  await结果:', result);
  } catch (err) {
    console.log('  catch错误:', err.message);
  }
  console.log('');

  // ---------- 演示3：Promise.all 并行执行 ----------
  console.log('📌 演示3：Promise.all 并行执行');
  console.log('  同时发起3个请求...');
  const start1 = Date.now();
  try {
    const results = await Promise.all([
      mockApiCall('请求1', 200),
      mockApiCall('请求2', 300),
      mockApiCall('请求3', 400)
    ]);
    console.log('  全部成功，结果:', results);
    console.log('  总耗时:', Date.now() - start1, 'ms（应该接近400ms，不是900ms）');
  } catch (err) {
    console.log('  有一个失败了:', err.message);
  }
  console.log('');

  // ---------- 演示4：超时控制 ----------
  console.log('📌 演示4：超时控制');
  try {
    // 这个请求要1000ms，但设置500ms超时
    const result = await withTimeout(mockApiCall('慢速请求', 1000), 500);
    console.log('  结果:', result);
  } catch (err) {
    console.log('  预期内的超时错误:', err.message);
  }
  console.log('');

  // ---------- 演示5：重试机制 ----------
  console.log('📌 演示5：失败自动重试（最多3次，指数退避）');
  try {
    // 故意让它大概率失败，看重试效果
    const callWithPossibleFail = () => mockApiCall('不稳定接口', 200, Math.random() > 0.2);
    const result = await retry(callWithPossibleFail, 3, 300);
    console.log('  最终成功:', result);
  } catch (err) {
    console.log('  重试全部失败:', err.message);
  }
  console.log('');

  // ---------- 演示6：并发控制 ----------
  console.log('📌 演示6：并发控制（最多2个同时执行）');
  const tasks = [
    () => mockApiCall('任务1', 200),
    () => mockApiCall('任务2', 300),
    () => mockApiCall('任务3', 200),
    () => mockApiCall('任务4', 300),
    () => mockApiCall('任务5', 200),
  ];
  console.log('  共' + tasks.length + '个任务，最多同时2个...');
  const start2 = Date.now();
  try {
    const results = await asyncPool(tasks, 2);
    console.log('  全部完成，结果:', results);
    console.log('  总耗时:', Date.now() - start2, 'ms');
  } catch (err) {
    console.log('  错误:', err.message);
  }
  console.log('');

  // ---------- 演示7：顺序执行（队列）----------
  console.log('📌 演示7：顺序执行（一个接一个）');
  const sequentialTasks = [
    () => mockApiCall('第一步', 200),
    () => mockApiCall('第二步', 200),
    () => mockApiCall('第三步', 200),
  ];
  console.log('  按顺序执行...');
  const start3 = Date.now();
  for (const task of sequentialTasks) {
    const result = await task();
    console.log('   ', result);
  }
  console.log('  总耗时:', Date.now() - start3, 'ms（应该约600ms）');
  console.log('');

  console.log('🎉 异步编程演示完成！');
  console.log('');
  console.log('💡 要点总结：');
  console.log('   1. 优先使用async/await，代码最清晰');
  console.log('   2. 无依赖的异步操作用Promise.all并行，更快');
  console.log('   3. 错误用try/catch处理，和同步代码一样');
  console.log('   4. 网络请求等不稳定操作加重试机制');
  console.log('   5. 长时间操作用Promise.race加超时');
  console.log('   6. 大量并发请求要做并发数限制');
}

main().catch(console.error);
`
  }
];
