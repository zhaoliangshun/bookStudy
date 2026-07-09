export const chapters = [
  {
    id: "nb-express-intro",
    group: "第二部分：Express框架核心",
    icon: "🚂",
    title: "Express框架快速入门",
    content: `# Express框架快速入门

现在我们来学习Express——Node.js最流行、最经典的Web框架。它基于Node.js原生http模块封装，提供了简洁优雅的API来处理路由、请求、响应、中间件等，让Web开发变得高效而愉快。

---

## 一、为什么用Express？

用原生http模块写服务器，你需要：
- 自己解析URL和query参数
- 自己解析请求体（JSON、表单等）
- 自己做路由匹配（还得支持URL参数如/users/:id）
- 自己处理各种Content-Type
- 自己组织错误处理
- ...大量重复劳动

Express帮你封装了这些通用功能，让你专注于业务逻辑：
- 简洁的路由定义（支持各种HTTP方法）
- 丰富的中间件生态
- 灵活的请求/响应处理
- 支持各种模板引擎
- 极其成熟，资料丰富

---

## 二、第一个Express应用

### 1. 初始化项目并安装

\`\`\`bash
mkdir my-express-app
cd my-express-app
npm init -y
npm install express
\`\`\`

### 2. Hello World

创建\`app.js\`：

\`\`\`javascript
const express = require('express');
const app = express();
const PORT = 3000;

// 定义一个GET路由
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

app.listen(PORT, () => {
  console.log(\`服务器运行在 http://localhost:\${PORT}\`);
});
\`\`\`

运行：\`node app.js\`，访问http://localhost:3000就能看到Hello Express！

---

## 三、Express核心概念

### 1. Application（app对象）

\`express()\`创建的app对象是Express应用的核心：
- \`app.get()\`, \`app.post()\`, \`app.put()\`, \`app.delete()\`：定义路由
- \`app.use()\`：注册中间件
- \`app.listen()\`：启动服务器
- \`app.set()\`/app.get()：设置/获取配置

### 2. Request对象（req）

代表HTTP请求，比原生req好用太多：

| 属性 | 说明 |
|------|------|
| \`req.params\` | URL路径参数（如\`/users/:id\`的id） |
| \`req.query\` | 查询参数（?后面的），自动解析成对象 |
| \`req.body\` | 请求体数据（需要中间件解析） |
| \`req.headers\` | 请求头 |
| \`req.cookies\` | Cookie（需要cookie-parser中间件） |
| \`req.path\` | 请求路径 |
| \`req.method\` | 请求方法 |
| \`req.url\` | 完整URL |

### 3. Response对象（res）

代表HTTP响应，提供了很多便捷方法：

| 方法 | 说明 |
|------|------|
| \`res.send(data)\` | 发送响应（自动设置Content-Type） |
| \`res.json(data)\` | 发送JSON响应 |
| \`res.status(code)\` | 设置状态码（链式调用） |
| \`res.sendFile(path)\` | 发送文件 |
| \`res.redirect(url)\` | 重定向 |
| \`res.render(view, data)\` | 渲染模板 |
| \`res.cookie(name, val, opts)\` | 设置Cookie |
| \`res.setHeader(name, val)\` | 设置响应头 |

---

## 四、路由基础

### 基本路由结构

\`app.METHOD(PATH, HANDLER)\`
- METHOD：HTTP方法（get, post, put, delete, patch...）
- PATH：路径
- HANDLER：处理函数(req, res)

\`\`\`javascript
// 首页
app.get('/', (req, res) => {
  res.send('首页');
});

// 关于页
app.get('/about', (req, res) => {
  res.send('关于我们');
});

// POST创建用户
app.post('/api/users', (req, res) => {
  res.json({ message: '创建用户成功' });
});

// 所有方法都匹配
app.all('/secret', (req, res) => {
  res.send('这会响应GET/POST/PUT/DELETE等所有方法');
});
\`\`\`

### 路由路径参数

\`\`\`javascript
// :id是路径参数，匹配 /users/1, /users/2等
app.get('/users/:id', (req, res) => {
  const userId = req.params.id; // "1", "2"...
  res.send(\`用户ID: \${userId}\`);
});

// 支持多个参数
app.get('/posts/:postId/comments/:commentId', (req, res) => {
  res.json(req.params); // { postId: '1', commentId: '2' }
});
\`\`\`

### 查询参数

\`\`\`javascript
// GET /search?keyword=node&page=1
app.get('/search', (req, res) => {
  const keyword = req.query.keyword; // 'node'
  const page = req.query.page;       // '1'
  res.json({ keyword, page });
});
\`\`\`

---

## 五、处理POST请求体

Express 4.16+内置了JSON和URL编码的请求体解析中间件，不需要body-parser了：

\`\`\`javascript
// 解析application/json格式的请求体
app.use(express.json());

// 解析application/x-www-form-urlencoded格式（表单提交）
app.use(express.urlencoded({ extended: true }));
\`\`\`

加了这两个中间件后，\`req.body\`就能拿到解析好的数据了！

---

## 六、开发利器：nodemon自动重启

每次改代码都要手动重启服务器？太麻烦了。用nodemon：

\`\`\`bash
npm install -D nodemon
\`\`\`

在package.json中加脚本：
\`\`\`json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
\`\`\`

然后\`npm run dev\`启动，修改代码保存后会自动重启！

---

让我们写一个完整的Express CRUD API来感受一下！
`,
    code: `// ============================================
// Express 快速入门：完整的CRUD API示例
// 运行前请确保已安装express: npm install express
// ============================================

// 引入express模块
const express = require('express');

// 创建Express应用实例
const app = express();
const PORT = 3000;

// ========== 中间件配置 ==========

// express.json() 解析JSON请求体
// 当请求头Content-Type是application/json时，自动解析req.body
app.use(express.json());

// express.urlencoded() 解析表单数据
// extended: true表示使用qs库解析，支持嵌套对象
app.use(express.urlencoded({ extended: true }));

// 自定义日志中间件：打印每个请求的信息
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString('zh-CN');
  console.log(\`[\${time}] \${req.method} \${req.path}\`);
  next(); // 必须调用next()才能继续到下一个中间件/路由
});

// ========== 模拟数据库 ==========
let posts = [
  { id: 1, title: '第一篇博客', content: '这是我的第一篇博客内容', author: '张三', createdAt: new Date().toISOString() },
  { id: 2, title: '学习Express', content: 'Express真好用', author: '李四', createdAt: new Date().toISOString() },
];
let nextId = 3;

// ========== 路由定义 ==========

// 1. 首页
app.get('/', (req, res) => {
  res.send(\`
    <h1>🎉 Express博客API</h1>
    <ul>
      <li>GET /api/posts - 获取所有文章</li>
      <li>GET /api/posts/:id - 获取单篇文章</li>
      <li>POST /api/posts - 创建文章（需title,content,author）</li>
      <li>PUT /api/posts/:id - 更新文章</li>
      <li>DELETE /api/posts/:id - 删除文章</li>
    </ul>
  \`);
});

// 2. 获取所有文章（支持搜索）
app.get('/api/posts', (req, res) => {
  let result = posts;
  
  // 如果有author查询参数，按作者过滤
  if (req.query.author) {
    result = result.filter(p => p.author.includes(req.query.author));
  }
  
  // 如果有keyword查询参数，搜索标题和内容
  if (req.query.keyword) {
    const kw = req.query.keyword.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(kw) || 
      p.content.toLowerCase().includes(kw)
    );
  }
  
  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 3. 获取单篇文章
app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: '文章不存在'
    });
  }
  
  res.json({
    success: true,
    data: post
  });
});

// 4. 创建新文章
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  
  // 简单验证
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'title和content必填'
    });
  }
  
  const newPost = {
    id: nextId++,
    title,
    content,
    author: author || '匿名',
    createdAt: new Date().toISOString()
  };
  
  posts.push(newPost);
  
  // 201状态码表示创建成功
  res.status(201).json({
    success: true,
    data: newPost
  });
});

// 5. 更新文章
app.put('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = posts.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '文章不存在'
    });
  }
  
  // 合并更新，id和createdAt不能改
  posts[index] = {
    ...posts[index],
    ...req.body,
    id,
    createdAt: posts[index].createdAt,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: posts[index]
  });
});

// 6. 删除文章
app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = posts.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '文章不存在'
    });
  }
  
  const deleted = posts.splice(index, 1)[0];
  
  res.json({
    success: true,
    data: deleted,
    message: '删除成功'
  });
});

// ========== 错误处理中间件 ==========
// 四个参数的中间件是错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

// ========== 404处理 ==========
// 放在所有路由最后，匹配没被处理的请求
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: \`路径 \${req.path} 不存在\`
  });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  🚂 Express博客API服务器已启动！');
  console.log('  📡 地址: http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
  console.log('💡 Express vs 原生http：');
  console.log('   1. 路由定义更简单：app.get/app.post自动匹配');
  console.log('   2. req.params/req.query/req.body自动解析');
  console.log('   3. res.json/res.send自动处理Content-Type');
  console.log('   4. 中间件机制让代码更模块化');
  console.log('   5. 错误处理统一方便');
  console.log('');
  console.log('📝 测试API：');
  console.log('   GET    http://localhost:' + PORT + '/api/posts');
  console.log('   POST   http://localhost:' + PORT + '/api/posts');
  console.log('   PUT    http://localhost:' + PORT + '/api/posts/1');
  console.log('   DELETE http://localhost:' + PORT + '/api/posts/1');
});
`
  },
  {
    id: "nb-middleware",
    group: "第二部分：Express框架核心",
    icon: "🔗",
    title: "中间件深入理解与实践",
    content: `# 中间件深入理解与实践

中间件（Middleware）是Express的灵魂，也是整个框架最重要的概念。理解了中间件，你就理解了Express的设计哲学。

---

## 一、什么是中间件？

简单说，**中间件就是在请求到达最终路由处理函数之前，依次执行的一系列函数**。

想象一下餐厅的流程：
1. 顾客进门 → 迎宾员接待
2. → 服务员引导入座
3. → 点菜员记录菜单
4. → 厨师做菜
5. → 服务员上菜
6. → 顾客用餐
7. → 收银员结账

每一个环节都是一个"中间件"，它们可以：
- 执行任何代码
- 修改请求(req)和响应(res)对象
- 结束请求-响应循环
- 调用下一个中间件（next()）

---

## 二、中间件的基本结构

一个中间件就是一个函数，接收三个参数（四个是错误处理）：

\`\`\`javascript
function myMiddleware(req, res, next) {
  // 在这里做一些事情
  console.log('请求来了:', req.path);
  
  // 必须调用next()才能进入下一个中间件/路由
  // 如果不调用next()，请求会被挂起，不会继续往下走
  next();
}
\`\`\`

通过\`app.use()\`注册中间件：
\`\`\`javascript
app.use(myMiddleware);
\`\`\`

---

## 三、中间件执行顺序

中间件按注册顺序**从上到下依次执行**，这非常重要！

\`\`\`javascript
app.use((req, res, next) => {
  console.log('中间件1');
  next(); // 继续
});

app.use((req, res, next) => {
  console.log('中间件2');
  next();
});

app.get('/', (req, res) => {
  console.log('路由处理');
  res.send('Hello');
});

// 访问/时控制台输出：
// 中间件1
// 中间件2
// 路由处理
\`\`\`

如果一个中间件不调用next()也不发送响应，请求就会卡住。

---

## 四、中间件的类型

### 1. 应用级中间件（app.use）

绑定到app实例，所有请求都经过：

\`\`\`javascript
// 所有请求都执行
app.use(express.json());

// 可以指定路径，只有匹配这个路径的请求才执行
app.use('/api', (req, res, next) => {
  console.log('API请求');
  next();
});
\`\`\`

### 2. 路由级中间件（router.use）

绑定到express.Router()实例，模块化路由时使用：

\`\`\`javascript
const userRouter = express.Router();

userRouter.use((req, res, next) => {
  console.log('用户模块请求');
  next();
});

userRouter.get('/profile', (req, res) => { /* ... */ });

app.use('/users', userRouter); // 挂载到/users路径
\`\`\`

### 3. 错误处理中间件

四个参数的函数，专门处理错误：

\`\`\`javascript
// 注意：必须写四个参数，Express才知道这是错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
\`\`\`

### 4. 内置中间件

Express自带的：
- \`express.json()\`：解析JSON请求体
- \`express.urlencoded()\`：解析表单数据
- \`express.static(path)\`：静态文件服务
- \`express.Router()\`：创建路由实例

### 5. 第三方中间件

社区开发的npm包：
- \`cors\`：跨域处理
- \`morgan\`：HTTP请求日志
- \`helmet\`：安全头
- \`cookie-parser\`：解析Cookie
- \`express-session\`：Session处理
- \`multer\`：文件上传
- \`compression\`：响应压缩

---

## 五、常用第三方中间件实战

### cors：解决跨域问题

前端和后端不同源（域名/端口/协议不同）时，浏览器会阻止请求，这就是跨域问题。用cors中间件一行解决：

\`\`\`bash
npm install cors
\`\`\`

\`\`\`javascript
const cors = require('cors');
app.use(cors()); // 允许所有跨域请求

// 或者更精细的配置
app.use(cors({
  origin: 'http://localhost:8080', // 只允许这个源
  credentials: true, // 允许携带Cookie
}));
\`\`\`

### morgan：请求日志

\`\`\`bash
npm install morgan
\`\`\`

\`\`\`javascript
const morgan = require('morgan');
app.use(morgan('dev')); // 'dev'是开发格式，彩色输出
// 日志格式：GET /api/users 200 12.345 ms - 234
\`\`\`

### helmet：安全防护

自动设置各种安全HTTP头：

\`\`\`bash
npm install helmet
\`\`\`

\`\`\`javascript
const helmet = require('helmet');
app.use(helmet());
\`\`\`

### compression：gzip压缩

压缩响应体，减少传输体积：

\`\`\`bash
npm install compression
\`\`\`

\`\`\`javascript
const compression = require('compression');
app.use(compression());
\`\`\`

---

## 六、中间件实战：认证中间件

让我们写一个实用的JWT认证中间件（后面章节会详细讲JWT）：

\`\`\`javascript
// authMiddleware.js
function authRequired(req, res, next) {
  // 从Authorization头获取token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }
  
  try {
    // 验证token（伪代码）
    const user = verifyToken(token);
    req.user = user; // 把用户信息挂到req上，后面的路由可以用
    next(); // 验证通过，继续
  } catch (err) {
    return res.status(403).json({ error: 'token无效' });
  }
}

// 使用：只有需要登录的路由才加这个中间件
app.get('/api/profile', authRequired, (req, res) => {
  res.json({ user: req.user }); // 可以直接用req.user
});
\`\`\`

---

## 七、中间件模式的威力

中间件模式让你可以把各种功能**拆分成独立、可复用、可组合**的模块：

- 需要日志？加morgan
- 需要跨域？加cors
- 需要安全头？加helmet
- 需要认证？加自己写的auth中间件
- 需要什么功能就加什么中间件，不需要的就不加

这就是"插件化"架构的魅力！
`,
    code: `// ============================================
// 中间件综合演示：各种常用中间件的使用
// 运行前需要安装依赖：npm install express cors morgan helmet compression
// ============================================

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();
const PORT = 3000;

// ========== 1. 内置中间件 ==========

// 解析JSON请求体
app.use(express.json());
// 解析表单
app.use(express.urlencoded({ extended: true }));
// 静态文件服务：public目录下的文件可以直接访问
// app.use(express.static('public'));

// ========== 2. 第三方中间件 ==========

// gzip压缩响应，要在其他中间件前面
app.use(compression());

// 安全头：设置各种安全相关的HTTP头
app.use(helmet());

// CORS跨域：允许前端从其他源访问
app.use(cors({
  origin: '*', // 开发时用*，生产环境要配置具体域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HTTP请求日志：dev格式，简洁彩色
app.use(morgan('dev'));

// ========== 3. 自定义中间件 ==========

// 请求时间记录中间件
app.use((req, res, next) => {
  req._startTime = Date.now();
  
  // res.on('finish')在响应发送完毕后触发
  res.on('finish', () => {
    const duration = Date.now() - req._startTime;
    console.log(\`  ⏱️  请求耗时: \${duration}ms\`);
  });
  
  next();
});

// 模拟的认证中间件：检查是否有x-api-key头
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  // 这里简化处理，实际应该查数据库验证
  const validKeys = ['my-secret-key-123', 'demo-key-456'];
  
  if (!apiKey || !validKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      message: '无效的API Key'
    });
  }
  
  // 可以把一些信息挂到req上，后续路由使用
  req.apiKey = apiKey;
  next();
}

// 简单的限流中间件（模拟）
const requestCounts = new Map(); // IP -> { count, resetTime }
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const windowMs = 60 * 1000; // 1分钟窗口
  const maxRequests = 100; // 最多100次请求
  
  const now = Date.now();
  let record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    // 新窗口
    record = { count: 0, resetTime: now + windowMs };
    requestCounts.set(ip, record);
  }
  
  record.count++;
  
  // 设置响应头，方便客户端知道
  res.set('X-RateLimit-Limit', maxRequests);
  res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
  
  if (record.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: '请求太频繁，请稍后再试'
    });
  }
  
  next();
}

// ========== 路由 ==========

// 公开路由，不需要认证
app.get('/', (req, res) => {
  res.json({
    message: '中间件演示API',
    endpoints: [
      'GET /public - 公开接口',
      'GET /protected - 需要API Key认证',
      'GET /api/time - 受限流保护的接口'
    ]
  });
});

app.get('/public', (req, res) => {
  res.json({ message: '这是公开接口，任何人都能访问' });
});

// 受保护路由：第二个参数是中间件！
// 只有apiKeyAuth通过（调用next()）才会执行后面的处理函数
app.get('/protected', apiKeyAuth, (req, res) => {
  res.json({
    message: '这是受保护的接口',
    yourApiKey: req.apiKey,
    note: '你看到了这个说明认证通过了'
  });
});

// 使用限流中间件
app.get('/api/time', rateLimit, (req, res) => {
  res.json({
    time: new Date().toISOString(),
    timestamp: Date.now()
  });
});

// ========== 错误处理中间件 ==========

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: \`\${req.method} \${req.path} 不存在\`
  });
});

// 错误处理：四个参数！(err, req, res, next)
app.use((err, req, res, next) => {
  console.error('💥 错误:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message
  });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  🔗 中间件演示服务器已启动');
  console.log('  📡 http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
  console.log('📋 已加载的中间件：');
  console.log('   1. compression - gzip压缩');
  console.log('   2. helmet - 安全头');
  console.log('   3. cors - 跨域处理');
  console.log('   4. morgan - 请求日志');
  console.log('   5. express.json() - JSON解析');
  console.log('   6. 自定义时间记录中间件');
  console.log('');
  console.log('🧪 测试：');
  console.log('   curl http://localhost:' + PORT + '/public');
  console.log('   curl -H "x-api-key: my-secret-key-123" http://localhost:' + PORT + '/protected');
  console.log('   快速刷新 /api/time 多次，观察限流效果');
});
`
  }
];
