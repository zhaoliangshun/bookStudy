export const chapters = [
  {
    id: "nb-route-design",
    group: "第二部分：Express框架核心",
    icon: "🛣️",
    title: "Express路由深入与模块化",
    content: `# Express路由深入与模块化

当项目越来越大，把所有路由都写在一个app.js文件里会变得难以维护。这一章我们深入学习Express的路由系统，掌握模块化路由、路由拆分、参数验证、链式路由等高级技巧，写出结构清晰、易于维护的代码。

---

## 一、为什么需要路由模块化？

想象一下，如果一个电商系统有：
- 用户模块：注册、登录、个人信息、收货地址...
- 商品模块：商品列表、详情、分类、搜索...
- 订单模块：创建订单、支付、取消、退款...
- 购物车模块：添加、删除、修改数量...

把这些上百个路由全写在app.js里，文件会有几千行，找一个路由都要翻半天，更别说多人协作开发了。

**解决方案**：用\`express.Router()\`把路由按模块拆分，每个模块独立文件，最后挂载到app上。

---

## 二、express.Router()基础

\`express.Router()\`创建一个路由实例，它就像一个迷你的app对象，可以在上面定义路由、使用中间件，但它本身不监听端口，需要挂载到app上。

### 基本用法

\`\`\`javascript
const express = require('express');
const app = express();

// 创建一个路由实例
const userRouter = express.Router();

// 在router上定义路由（跟在app上定义一样）
userRouter.get('/profile', (req, res) => {
  res.json({ name: '张三', email: 'YA9RfmB0@dTdpwNO.TAM' });
});

userRouter.post('/login', (req, res) => {
  res.json({ message: '登录成功' });
});

// 把router挂载到/users路径前缀
// 访问 /users/profile → 匹配上面的/profile路由
app.use('/users', userRouter);
\`\`\`

关键点：
- router上的路径是**相对路径**，挂载时的前缀会自动加上
- router上也可以用\`use()\`注册中间件，只对该router的路由生效

---

## 三、路由拆分到不同文件

这是实际项目中最常用的方式，按模块拆分到独立文件：

### 项目结构推荐

\`\`\`
project/
├── app.js              # 入口文件
├── routes/             # 路由目录
│   ├── index.js        # 路由汇总
│   ├── users.js        # 用户模块路由
│   ├── products.js     # 商品模块路由
│   └── orders.js       # 订单模块路由
├── controllers/        # 控制器（后面章节讲）
├── middleware/         # 中间件
└── package.json
\`\`\`

### 示例：routes/users.js

\`\`\`javascript
const express = require('express');
const router = express.Router();

// GET /users
router.get('/', (req, res) => {
  res.json([{ id: 1, name: '张三' }]);
});

// GET /users/:id
router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: '张三' });
});

// POST /users
router.post('/', (req, res) => {
  res.status(201).json({ message: '创建成功' });
});

module.exports = router; // 导出router
\`\`\`

### app.js中挂载

\`\`\`javascript
const express = require('express');
const app = express();

// 引入路由模块
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// 挂载路由
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
\`\`\`

这样每个模块独立维护，代码结构清晰多了！

---

## 四、路由参数验证

用户输入的数据永远不可信，必须验证！路由参数（req.params、req.query、req.body）都要验证。

### 1. 手动验证（简单场景）

\`\`\`javascript
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  // 验证id是否是有效数字
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: '无效的用户ID' });
  }
  
  res.json({ id, name: '张三' });
});
\`\`\`

### 2. 使用验证库（推荐）

对于复杂验证，推荐用\`joi\`或\`express-validator\`：

\`\`\`bash
npm install joi
\`\`\`

\`\`\`javascript
const Joi = require('joi');

// 定义验证schema
const userSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{6,20}$/).required()
});

// 验证中间件
function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: '参数验证失败',
      details: error.details.map(d => d.message)
    });
  }
  next();
}

// 使用中间件
router.post('/', validateUser, (req, res) => {
  // 到这里req.body已经是合法的了
  res.status(201).json({ message: '创建成功', data: req.body });
});
\`\`\`

---

## 五、链式路由（app.route() / router.route()）

同一个路径可能需要处理多种HTTP方法（GET查、POST增、PUT改、DELETE删），用\`route()\`可以链式写在一起，避免重复写路径：

\`\`\`javascript
// 不使用链式（重复写/users/:id）
router.get('/users/:id', (req, res) => { /* ... */ });
router.put('/users/:id', (req, res) => { /* ... */ });
router.delete('/users/:id', (req, res) => { /* ... */ });

// 使用链式：路径只写一次！
router.route('/users/:id')
  .get((req, res) => {
    res.json({ message: '获取用户' });
  })
  .put((req, res) => {
    res.json({ message: '更新用户' });
  })
  .delete((req, res) => {
    res.json({ message: '删除用户' });
  });
\`\`\`

\`app.route()\`同理，在app上也能用。

---

## 六、路由前缀

挂载router时指定的第一个参数就是路由前缀，该router下的所有路由都会自动加上这个前缀：

\`\`\`javascript
// routes/admin.js
const router = express.Router();

// 实际路径是 /admin/dashboard，因为挂载时前缀是/admin
router.get('/dashboard', (req, res) => {
  res.send('管理后台首页');
});

// 实际路径是 /admin/users
router.get('/users', (req, res) => {
  res.send('用户管理');
});

// app.js
app.use('/admin', adminRouter); // 前缀是/admin
\`\`\`

还可以嵌套前缀：
\`\`\`javascript
// api/v1/users
app.use('/api/v1', v1Router);
// v1Router内部再use('/users', userRouter)
\`\`\`

---

## 七、子路由嵌套

Router可以嵌套使用，适合复杂的层级结构，比如RESTful的嵌套资源：

比如：\`/users/:userId/posts/:postId/comments\`

\`\`\`javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const postRouter = require('./posts'); // 帖子路由

// /users/:userId/posts/*  → 交给postRouter处理
// mergeParams: true很重要！让子路由能访问父路由的params
router.use('/:userId/posts', postRouter);

// GET /users
router.get('/', (req, res) => res.send('用户列表'));

module.exports = router;
\`\`\`

\`\`\`javascript
// routes/posts.js
const express = require('express');
// 注意：{ mergeParams: true } 必须加，否则拿不到父路由的userId！
const router = express.Router({ mergeParams: true });

// GET /users/:userId/posts
router.get('/', (req, res) => {
  // 可以拿到父路由的userId！
  res.json({ userId: req.params.userId, posts: [] });
});

// GET /users/:userId/posts/:postId
router.get('/:postId', (req, res) => {
  res.json({
    userId: req.params.userId,  // 来自父路由
    postId: req.params.postId   // 来自当前路由
  });
});

module.exports = router;
\`\`\`

⚠️ 重要：子路由一定要加\`{ mergeParams: true }\`，否则无法访问父路由的参数！

---

## 八、路由高级技巧

### 1. 路由参数正则约束

可以限制参数的格式，比如id必须是数字：

\`\`\`javascript
// 只有id是数字时才匹配这个路由
// 比如 /users/123 匹配，/users/abc 不匹配
router.get('/users/:id(\\\\d+)', (req, res) => {
  res.send(\`用户ID: \${req.params.id}\`);
});
\`\`\`

### 2. 多中间件路由

一个路由可以传多个中间件，按顺序执行：

\`\`\`javascript
// 先打日志，再验证登录，再验证权限，最后处理业务
router.get('/admin/dashboard',
  logRequest,        // 1. 记录日志
  requireLogin,      // 2. 检查是否登录
  requireAdmin,      // 3. 检查是否是管理员
  (req, res) => {    // 4. 业务处理
    res.send('管理后台');
  }
);
\`\`\`

### 3. all()匹配所有HTTP方法

\`router.all()\`可以匹配所有HTTP方法（GET/POST/PUT/DELETE...）：

\`\`\`javascript
// 不管什么方法访问/health都返回200
router.all('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
\`\`\`

---

## 九、路由设计最佳实践

1. **按功能模块拆分**：用户、商品、订单各一个文件
2. **统一API前缀**：比如都加\`/api\`前缀
3. **RESTful风格**：用HTTP方法表示操作，路径用名词
   - GET /api/users → 获取用户列表
   - GET /api/users/:id → 获取单个用户
   - POST /api/users → 创建用户
   - PUT /api/users/:id → 更新用户
   - DELETE /api/users/:id → 删除用户
4. **版本化API**：\`/api/v1\`, \`/api/v2\`
5. **控制器分离**：路由只做映射，业务逻辑放controllers目录
6. **统一错误处理**：用try-catch或错误处理中间件
7. **参数验证**：所有外部输入都要验证

掌握了这些，你就能写出结构清晰、易于维护的企业级Express路由了！
`,
    code: `// ============================================
// Express 路由模块化完整示例
// 演示：Router拆分、路由前缀、子路由嵌套、链式路由、参数验证
// 运行前请确保已安装express和joi: npm install express joi
// ============================================

const express = require('express');
const Joi = require('joi');
const app = express();
const PORT = 3000;

// ========== 中间件 ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(\`[\${new Date().toLocaleTimeString()}] \${req.method} \${req.path}\`);
  next();
});

// ========== 1. 参数验证中间件演示 ==========

// 用户数据验证Schema
const userSchema = Joi.object({
  name: Joi.string().min(2).max(30).required().messages({
    'string.min': '姓名至少2个字符',
    'string.max': '姓名最多30个字符',
    'any.required': '姓名必填'
  }),
  email: Joi.string().email().required().messages({
    'string.email': '邮箱格式不正确',
    'any.required': '邮箱必填'
  }),
  age: Joi.number().integer().min(18).max(120).messages({
    'number.min': '年龄必须满18岁',
    'number.max': '年龄不能超过120岁'
  })
});

// 通用验证中间件工厂函数
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: error.details.map(d => d.message)
      });
    }
    // 验证后的数据（可能有类型转换）替换req.body
    req.body = value;
    next();
  };
}

// 模拟认证中间件
function authRequired(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }
  req.user = { id: 1, name: '演示用户', role: 'user' };
  next();
}

// 管理员权限中间件
function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }
  next();
}

// ========== 2. 用户模块路由 (模拟routes/users.js) ==========
function createUserRouter() {
  const router = express.Router();
  
  // 模拟数据库
  let users = [
    { id: 1, name: '张三', email: 'YA9RfmB0@dTdpwNO.TAM', age: 25 },
    { id: 2, name: '李四', email: 'Rawe@YP2H57H.vHY', age: 30 }
  ];
  let nextId = 3;

  // router.param()：拦截参数，做统一处理
  // 当路由中出现:userId参数时，自动执行这个回调
  router.param('userId', (req, res, next, userId) => {
    const id = parseInt(userId, 10);
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    // 把找到的user挂到req上，后面的处理函数直接用
    req.foundUser = user;
    next();
  });

  // GET /api/users - 获取用户列表（支持分页和搜索）
  router.get('/', (req, res) => {
    let result = [...users];
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const keyword = req.query.keyword;

    // 搜索
    if (keyword) {
      result = result.filter(u => 
        u.name.includes(keyword) || u.email.includes(keyword)
      );
    }

    // 分页
    const total = result.length;
    const start = (page - 1) * pageSize;
    const data = result.slice(start, start + pageSize);

    res.json({
      success: true,
      data,
      pagination: { page, pageSize, total }
    });
  });

  // 链式路由：同一个路径的不同HTTP方法写在一起
  router.route('/:userId')
    // GET /api/users/:userId - 获取单个用户
    .get((req, res) => {
      // router.param已经把用户挂在req.foundUser上了
      res.json({ success: true, data: req.foundUser });
    })
    // PUT /api/users/:userId - 更新用户（需要验证）
    .put(validate(userSchema), (req, res) => {
      const index = users.findIndex(u => u.id === req.foundUser.id);
      users[index] = { ...users[index], ...req.body };
      res.json({ success: true, data: users[index] });
    })
    // DELETE /api/users/:userId - 删除用户
    .delete((req, res) => {
      users = users.filter(u => u.id !== req.foundUser.id);
      res.json({ success: true, message: '删除成功' });
    });

  // POST /api/users - 创建用户（需要验证参数）
  router.post('/', validate(userSchema), (req, res) => {
    const newUser = {
      id: nextId++,
      ...req.body
    };
    users.push(newUser);
    res.status(201).json({ success: true, data: newUser });
  });

  return router;
}

// ========== 3. 子路由嵌套演示：文章路由 ==========
function createPostRouter() {
  // ⚠️ 重要：mergeParams: true 才能访问父路由的参数
  const router = express.Router({ mergeParams: true });
  
  let posts = [
    { id: 1, userId: 1, title: '第一篇文章', content: 'Hello World' },
    { id: 2, userId: 1, title: '第二篇文章', content: 'Express路由' }
  ];
  let nextId = 3;

  // GET /api/users/:userId/posts - 获取某用户的文章
  router.get('/', (req, res) => {
    // 可以拿到父路由的userId！
    const userPosts = posts.filter(p => p.userId === parseInt(req.params.userId));
    res.json({
      success: true,
      userId: parseInt(req.params.userId), // 父路由参数
      data: userPosts
    });
  });

  // POST /api/users/:userId/posts - 为某用户创建文章
  router.post('/', (req, res) => {
    const newPost = {
      id: nextId++,
      userId: parseInt(req.params.userId),
      title: req.body.title,
      content: req.body.content
    };
    posts.push(newPost);
    res.status(201).json({ success: true, data: newPost });
  });

  // GET /api/users/:userId/posts/:postId - 获取某用户的某篇文章
  router.get('/:postId', (req, res) => {
    const post = posts.find(p => 
      p.id === parseInt(req.params.postId) && 
      p.userId === parseInt(req.params.userId)
    );
    if (!post) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }
    res.json({
      success: true,
      data: post,
      parentParams: req.params // 看看能拿到哪些参数
    });
  });

  return router;
}

// ========== 4. 管理员路由 ==========
function createAdminRouter() {
  const router = express.Router();

  // 这个router下的所有路由都需要登录且是管理员
  router.use(authRequired);
  router.use(adminRequired);

  router.get('/dashboard', (req, res) => {
    res.json({
      success: true,
      message: '欢迎来到管理后台',
      user: req.user
    });
  });

  router.get('/stats', (req, res) => {
    res.json({
      success: true,
      stats: {
        totalUsers: 100,
        totalPosts: 500,
        totalOrders: 200
      }
    });
  });

  return router;
}

// ========== 组装路由 ==========

const userRouter = createUserRouter();
const postRouter = createPostRouter();

// 子路由嵌套：/api/users/:userId/posts/* → postRouter处理
userRouter.use('/:userId/posts', postRouter);

// 挂载到app，统一/api前缀
app.use('/api/users', userRouter);
app.use('/api/admin', createAdminRouter());

// ========== 首页和健康检查 ==========
app.get('/', (req, res) => {
  res.send(\`
    <h1>🛣️ Express 路由模块化演示</h1>
    <h2>用户模块：/api/users</h2>
    <ul>
      <li><code>GET /api/users</code> - 用户列表（支持?keyword=&page=&pageSize=）</li>
      <li><code>GET /api/users/1</code> - 单个用户</li>
      <li><code>POST /api/users</code> - 创建用户（需name,email,age）</li>
      <li><code>PUT /api/users/1</code> - 更新用户</li>
      <li><code>DELETE /api/users/1</code> - 删除用户</li>
    </ul>
    <h2>子路由嵌套：/api/users/:userId/posts</h2>
    <ul>
      <li><code>GET /api/users/1/posts</code> - 某用户的文章列表</li>
      <li><code>GET /api/users/1/posts/1</code> - 某用户的某篇文章</li>
      <li><code>POST /api/users/1/posts</code> - 创建文章</li>
    </ul>
    <h2>管理员路由（需要认证头）</h2>
    <ul>
      <li><code>GET /api/admin/dashboard</code></li>
      <li><code>GET /api/admin/stats</code></li>
    </ul>
    <p>💡 提示：测试管理员接口需要在请求头加 Authorization: Bearer xxx</p>
  \`);
});

// all()匹配所有HTTP方法
app.all('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    method: req.method // 不管什么方法都能访问
  });
});

// ========== 404和错误处理 ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: \`路由不存在: \${req.method} \${req.path}\`
  });
});

app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({ success: false, message: err.message });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  🛣️  Express路由模块化演示服务器启动');
  console.log('  📡  http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
  console.log('📋 项目结构（代码中模拟）：');
  console.log('  ├── app.js');
  console.log('  └── routes/');
  console.log('      ├── users.js      → /api/users');
  console.log('      ├── posts.js      → 子路由嵌套到users');
  console.log('      └── admin.js      → /api/admin');
  console.log('');
  console.log('🧪 测试命令：');
  console.log('  curl http://localhost:' + PORT + '/api/users');
  console.log('  curl http://localhost:' + PORT + '/api/users/1');
  console.log('  curl http://localhost:' + PORT + '/api/users/1/posts');
  console.log('  curl -X POST http://localhost:' + PORT + '/api/users \\\\');
  console.log('    -H "Content-Type: application/json" \\\\');
  console.log('    -d \'{"name":"王五","email":"d@o.Tzd","age":28}\'');
  console.log('  curl -H "Authorization: Bearer token" http://localhost:' + PORT + '/api/admin/dashboard');
});
`
  },
  {
    id: "nb-req-res",
    group: "第二部分：Express框架核心",
    icon: "📬",
    title: "Request和Response对象详解",
    content: `# Request和Response对象详解

每次HTTP请求，Express都会创建两个对象：\`req\`（Request）代表请求，\`res\`（Response）代表响应。理解这两个对象的所有API，是熟练使用Express的基础。这一章我们详细拆解它们的属性和方法。

---

## 一、Request对象（req）详解

\`req\`对象代表HTTP请求，包含了请求的所有信息：URL、请求头、请求体、查询参数、Cookie等等。

### 1. 请求URL相关属性

| 属性 | 说明 | 示例（访问http://localhost:3000/users/1?foo=bar） |
|------|------|--------------------------------------------------|
| \`req.url\` | 原始URL路径+查询字符串 | \`/users/1?foo=bar\` |
| \`req.originalUrl\` | 跟url类似，在路由挂载时保留原始路径 | \`/users/1?foo=bar\` |
| \`req.path\` | URL路径部分（不含查询字符串） | \`/users/1\` |
| \`req.baseUrl\` | 路由挂载的前缀 | 如果router挂在/users，那这里是\`/users\` |
| \`req.hostname\` | 主机名（不含端口） | \`localhost\` |
| \`req.protocol\` | 协议（http/https） | \`http\` |
| \`req.secure\` | 是否是HTTPS（布尔值） | \`false\` |
| \`req.subdomains\` | 子域名数组 | 对于\`api.example.com\`是\`['api']\` |
| \`req.ip\` | 客户端IP地址 | \`::1\`或\`127.0.0.1\` |
| \`req.ips\` | 代理链上的IP数组（需要trust proxy） | |

获取完整URL的方法：
\`\`\`javascript
const fullUrl = \`\${req.protocol}://\${req.get('host')}\${req.originalUrl}\`;
\`\`\`

### 2. 请求参数

#### req.params - 路径参数
\`\`\`javascript
// 路由: /users/:id/posts/:postId
// 访问: /users/123/posts/456
app.get('/users/:id/posts/:postId', (req, res) => {
  console.log(req.params);
  // { id: '123', postId: '456' }
  // 注意：所有值都是字符串！需要数字要自己转
});
\`\`\`

#### req.query - 查询参数（?后面的）
\`\`\`javascript
// 访问: /search?q=node&page=2&tags=js&tags=express
app.get('/search', (req, res) => {
  console.log(req.query);
  // { q: 'node', page: '2', tags: ['js', 'express'] }
  // 同名参数会变成数组
});
\`\`\`

⚠️ 注意：\`req.params\`和\`req.query\`的值默认都是字符串！数字需要\`parseInt()\`转换。

#### req.body - 请求体
需要中间件解析（express.json()或express.urlencoded()）：
\`\`\`javascript
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析表单

app.post('/users', (req, res) => {
  console.log(req.body); // 解析好的JavaScript对象
});
\`\`\`

### 3. 请求头相关

\`\`\`javascript
// 获取单个请求头（不区分大小写）
req.get('Content-Type'); // 'application/json'
req.get('content-type'); // 一样的结果
req.get('User-Agent'); // 浏览器UA
req.get('Authorization'); // 'Bearer xxx'
req.get('Referer'); // 来源页
req.get('Cookie'); // 原始Cookie字符串

// 所有请求头对象
console.log(req.headers);
// {
//   'content-type': 'application/json',
//   'user-agent': 'Mozilla/5.0...',
//   'authorization': 'Bearer xxx',
//   ...
// }

// 内容类型快捷方式
req.is('json');       // 如果Content-Type是JSON返回true
req.is('html');       // 判断是否是html
req.is('multipart/form-data'); // 文件上传
\`\`\`

### 4. Cookie相关

需要\`cookie-parser\`中间件：
\`\`\`bash
npm install cookie-parser
\`\`\`

\`\`\`javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // 解析Cookie到req.cookies

app.get('/', (req, res) => {
  console.log(req.cookies); // { sessionId: 'xxx', theme: 'dark' }
  console.log(req.signedCookies); // 签名的Cookie（防篡改）
});
\`\`\`

### 5. 其他常用属性

| 属性/方法 | 说明 |
|-----------|------|
| \`req.method\` | HTTP方法（GET/POST/PUT/DELETE等） |
| \`req.route\` | 当前匹配的路由对象 |
| \`req.originalUrl\` | 原始URL（在路由内部不会变） |
| \`req.app\` | 指向express app实例 |
| \`req.res\` | 指向对应的res对象（一般不用） |
| \`req.xhr\` | 是否是AJAX请求（X-Requested-With头） |
| \`req.accepts(type)\` | 检查客户端Accept类型 |
| \`req.acceptsCharsets\` | 接受的字符集 |
| \`req.acceptsLanguages\` | 接受的语言 |
| \`req.get(field)\` | 获取请求头 |
| \`req.is(type)\` | 判断Content-Type |

### 6. 自定义属性

中间件可以给req挂载自定义属性，后续路由使用，这是非常常见的模式：
\`\`\`javascript
// 认证中间件：把用户信息挂到req上
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    req.user = { id: 1, name: '张三', role: 'admin' };
  }
  next();
});

// 后续路由可以直接用req.user
app.get('/profile', (req, res) => {
  res.json(req.user);
});
\`\`\`

---

## 二、Response对象（res）详解

\`res\`对象用于发送HTTP响应，Express提供了非常丰富的响应方法。

### 1. 发送响应的核心方法

#### res.send([body])
发送各种类型的响应，自动设置Content-Type：
\`\`\`javascript
res.send('Hello World'); // text/html
res.send({ message: 'Hello' }); // 自动转JSON，Content-Type: application/json
res.send('<h1>Hello</h1>'); // text/html
res.send(Buffer.from('Hello')); // application/octet-stream
res.status(404).send('Not Found'); // 可以链式调用设置状态码
\`\`\`

#### res.json([body])
发送JSON响应（最常用！）：
\`\`\`javascript
res.json({ name: '张三', age: 25 });
res.json(null);
res.json({ success: true, data: [...] });
res.status(201).json({ message: '创建成功' }); // 201状态码+JSON
\`\`\`

#### res.sendFile(path, [options], [callback])
发送文件：
\`\`\`javascript
// 发送文件（必须用绝对路径！）
res.sendFile('/path/to/file.pdf', (err) => {
  if (err) {
    res.status(404).send('文件不存在');
  }
});

// 带选项
res.sendFile('avatar.jpg', {
  root: './uploads', // 根目录
  headers: { 'X-Custom': 'value' },
  dotfiles: 'deny'
});
\`\`\`

### 2. 设置状态码

#### res.status(code)
设置HTTP状态码，支持链式调用：
\`\`\`javascript
res.status(200).json({ data: [...] }); // 200 OK（默认）
res.status(201).json({ message: '创建成功' }); // 201 Created
res.status(204).send(); // 204 No Content（无响应体）
res.status(400).json({ error: '参数错误' }); // 400 Bad Request
res.status(401).json({ error: '未登录' }); // 401 Unauthorized
res.status(403).json({ error: '无权限' }); // 403 Forbidden
res.status(404).json({ error: '不存在' }); // 404 Not Found
res.status(500).json({ error: '服务器错误' }); // 500 Internal Server Error
\`\`\`

#### res.sendStatus(code)
发送状态码和对应的消息文本：
\`\`\`javascript
res.sendStatus(200); // 等价于 res.status(200).send('OK')
res.sendStatus(404); // 等价于 res.status(404).send('Not Found')
res.sendStatus(500); // 等价于 res.status(500).send('Internal Server Error')
\`\`\`

### 3. 设置响应头

#### res.set(field, [value]) / res.header()
设置响应头（set和header是别名）：
\`\`\`javascript
// 设置单个响应头
res.set('Content-Type', 'text/plain; charset=utf-8');
res.set('X-Powered-By', 'MyApp');

// 设置多个响应头（传对象）
res.set({
  'X-Custom-Header': 'value',
  'Cache-Control': 'no-cache',
  'Access-Control-Allow-Origin': '*'
});
\`\`\`

#### res.type(type)
快速设置Content-Type：
\`\`\`javascript
res.type('html'); // Content-Type: text/html
res.type('json'); // Content-Type: application/json
res.type('text/plain');
res.type('png'); // image/png
res.type('.html'); // 也可以用扩展名
\`\`\`

#### res.append(field, value)
追加响应头（不是覆盖）：
\`\`\`javascript
res.append('Link', '<http://api.com/page/2>; rel="next"');
res.append('Link', '<http://api.com/page/3>; rel="last"');
// 结果：Link: <http://api.com/page/2>; rel="next", <http://api.com/page/3>; rel="last"
\`\`\`

### 4. Cookie操作

#### res.cookie(name, value, [options])
设置Cookie：
\`\`\`javascript
// 简单Cookie
res.cookie('theme', 'dark');

// 带选项的Cookie
res.cookie('sessionId', 'abc123', {
  httpOnly: true, // 前端JS不能读取（防XSS）
  secure: process.env.NODE_ENV === 'production', // 只在HTTPS传输
  maxAge: 24 * 60 * 60 * 1000, // 24小时后过期（毫秒）
  expires: new Date(Date.now() + 900000), // 也可以用expires
  sameSite: 'strict', // 防CSRF
  path: '/', // 路径
  domain: '.example.com' // 域名
});

// 签名Cookie（需要cookieParser加secret）
// app.use(cookieParser('my-secret'));
res.cookie('userId', '123', { signed: true });
\`\`\`

#### res.clearCookie(name, [options])
清除Cookie：
\`\`\`javascript
res.clearCookie('sessionId');
res.clearCookie('theme', { path: '/' }); // 要跟设置时的选项一致
\`\`\`

### 5. 重定向

#### res.redirect([status,] path)
重定向（默认302 Found）：
\`\`\`javascript
res.redirect('/login'); // 302临时重定向到/login
res.redirect(301, '/new-url'); // 301永久重定向
res.redirect(302, 'https://google.com'); // 可以重定向到外部URL
res.redirect('../posts'); // 相对路径
res.redirect('back'); // 重定向回Referer（即来源页）
\`\`\`

常用重定向状态码：
- 301：永久重定向（搜索引擎会更新索引）
- 302：临时重定向（默认）
- 307：临时重定向（保持请求方法和body不变）
- 308：永久重定向（保持请求方法和body不变）

### 6. 下载文件

#### res.download(path, [filename], [callback])
提示浏览器下载文件：
\`\`\`javascript
// 最简单：下载文件，使用原文件名
res.download('/path/to/report.pdf');

// 指定下载后的文件名
res.download('/path/to/report.pdf', '年度报告.pdf');

// 回调处理错误
res.download('/path/to/file.pdf', 'file.pdf', (err) => {
  if (err) {
    // 文件不存在等错误
    if (!res.headersSent) {
      res.status(404).send('文件不存在');
    }
  } else {
    console.log('文件下载成功');
  }
});
\`\`\`

\`res.download()\` vs \`res.sendFile()\`：
- sendFile：浏览器如果能识别该类型（如图片、PDF），会直接显示
- download：设置Content-Disposition为attachment，提示浏览器下载

#### res.attachment([filename])
只设置Content-Disposition头，不发送文件：
\`\`\`javascript
res.attachment('report.pdf');
// 接下来你需要自己发送文件内容
res.sendFile('/path/to/report.pdf');
\`\`\`

### 7. 其他响应方法

| 方法 | 说明 |
|------|------|
| \`res.end([data])\` | 结束响应（跟原生http一样，不常用） |
| \`res.render(view, [locals], [callback])\` | 渲染模板引擎 |
| \`res.links(links)\` | 设置Link响应头 |
| \`res.location(path)\` | 设置Location响应头（不发送状态码） |
| \`res.vary(field)\` | 设置Vary响应头 |
| \`res.format(object)\` | 根据Accept内容协商，返回不同格式 |

#### res.format() - 内容协商
根据客户端Accept头返回不同格式，非常RESTful：
\`\`\`javascript
res.format({
  'text/html': () => res.send('<h1>Hello World</h1>'),
  'application/json': () => res.json({ message: 'Hello World' }),
  'text/plain': () => res.send('Hello World')
});
// 如果客户端Accept是application/json，返回JSON
// 如果Accept是text/html，返回HTML
\`\`\`

### 8. 响应头快捷属性

\`\`\`javascript
res.headersSent // 布尔值，响应头是否已经发送（检查是否能再设头）
res.locals // 用于在渲染模板时传递变量（局部变量）
\`\`\`

---

## 三、req/res实战注意事项

### 1. 响应只能发一次！
一旦调用了send/json/sendFile/redirect/end等，响应就发送了，不能再发：
\`\`\`javascript
app.get('/', (req, res) => {
  res.send('第一次响应');
  // 下面的代码会报错：Can't set headers after they are sent
  res.json({ message: '第二次响应' }); // ❌ 错误！
});
\`\`\`

所以要注意条件判断后return：
\`\`\`javascript
if (!user) {
  return res.status(404).json({ error: '用户不存在' }); // return！
}
// 后面不用写else，return了就不会继续执行
res.json({ data: user });
\`\`\`

### 2. res是流式的
Express的响应是基于流的，可以分段发送：
\`\`\`javascript
res.write('Hello ');
res.write('World');
res.end(); // 必须调用end结束
// 一般不用这种方式，直接res.send更方便
\`\`\`

### 3. 常见响应状态码速查

| 状态码 | 含义 | 常见使用场景 |
|--------|------|-------------|
| 200 | OK | 请求成功（默认） |
| 201 | Created | 创建成功（POST） |
| 204 | No Content | 删除成功，无返回内容 |
| 400 | Bad Request | 参数错误 |
| 401 | Unauthorized | 未登录/认证失败 |
| 403 | Forbidden | 已登录但无权限 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 验证失败 |
| 429 | Too Many Requests | 请求限流 |
| 500 | Internal Server Error | 服务器错误 |

---

这一章内容很多，都是实际开发中天天要用到的API。多写代码多练习，自然就记住了！
`,
    code: `// ============================================
// Request 和 Response 对象完整演示
// 运行前请安装依赖：npm install express cookie-parser
// ============================================

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// ========== 中间件配置 ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('my-secret-key-for-signing-cookies'));

// 简单的访问计数（仅演示用，生产用数据库）
let visitCount = 0;

// ========== 首页导航 ==========
app.get('/', (req, res) => {
  const protocol = req.protocol;
  const host = req.get('host');
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>📬 req/res 对象演示</title></head>
    <body style="font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1>📬 Request & Response 对象演示</h1>
      
      <h2>🔍 Request 对象相关接口</h2>
      <ul>
        <li><a href="/demo/req-info">/demo/req-info</a> - 查看所有请求信息</li>
        <li><a href="/demo/req-params/123?name=张三&age=25">/demo/req-params/123?name=张三&age=25</a> - params和query演示</li>
        <li><a href="/demo/req-headers">/demo/req-headers</a> - 请求头演示</li>
        <li><a href="/demo/req-cookies">/demo/req-cookies</a> - Cookie演示</li>
      </ul>
      
      <h3>测试POST请求（用curl或Postman）</h3>
      <pre>curl -X POST http://\${host}/demo/req-body \\
  -H "Content-Type: application/json" \\
  -d '{"name":"李四","email":"Rawe@YP2H57H.vHY"}'</pre>
      
      <h2>📤 Response 对象相关接口</h2>
      <ul>
        <li><a href="/demo/res-text">/demo/res-text</a> - 发送文本</li>
        <li><a href="/demo/res-html">/demo/res-html</a> - 发送HTML</li>
        <li><a href="/demo/res-json">/demo/res-json</a> - 发送JSON</li>
        <li><a href="/demo/res-status">/demo/res-status</a> - 各种状态码</li>
        <li><a href="/demo/res-headers">/demo/res-headers</a> - 自定义响应头</li>
        <li><a href="/demo/set-cookie">/demo/set-cookie</a> - 设置Cookie</li>
        <li><a href="/demo/clear-cookie">/demo/clear-cookie</a> - 清除Cookie</li>
        <li><a href="/demo/redirect-google">/demo/redirect-google</a> - 重定向到Google</li>
        <li><a href="/demo/redirect-back">/demo/redirect-back</a> - 返回上一页</li>
        <li><a href="/demo/download">/demo/download</a> - 文件下载</li>
        <li><a href="/demo/content-negotiation">/demo/content-negotiation</a> - 内容协商（Accept头）</li>
      </ul>
      
      <p>💡 访问次数: <strong>\${++visitCount}</strong></p>
    </body>
    </html>
  \`);
});

// ========== 1. Request对象演示 ==========

// 1.1 查看请求信息
app.get('/demo/req-info', (req, res) => {
  res.json({
    message: 'Request对象信息',
    requestInfo: {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      path: req.path,
      baseUrl: req.baseUrl,
      protocol: req.protocol,
      secure: req.secure,
      hostname: req.hostname,
      ip: req.ip,
      ips: req.ips,
      subdomains: req.subdomains,
      xhr: req.xhr,
      fullUrl: \`\${req.protocol}://\${req.get('host')}\${req.originalUrl}\`
    }
  });
});

// 1.2 params和query演示
app.get('/demo/req-params/:userId', (req, res) => {
  res.json({
    message: '路径参数和查询参数演示',
    params: req.params,
    query: req.query,
    tips: '注意：params和query的值都是字符串类型，数字需要parseInt转换',
    example: {
      'req.params.userId': req.params.userId,
      'typeof req.params.userId': typeof req.params.userId,
      'parseInt转换后': parseInt(req.params.userId, 10)
    }
  });
});

// 1.3 请求头演示
app.get('/demo/req-headers', (req, res) => {
  res.json({
    message: '请求头演示',
    headers: req.headers,
    shortcuts: {
      'content-type': req.get('content-type'),
      'user-agent': req.get('user-agent'),
      'accept': req.get('accept'),
      'accept-language': req.get('accept-language'),
      'referer': req.get('referer'),
      'authorization': req.get('authorization')
    },
    isJson: req.is('json'),
    isHtml: req.is('html'),
    acceptsJson: req.accepts('json'),
    acceptsHtml: req.accepts('html')
  });
});

// 1.4 Cookie读取演示
app.get('/demo/req-cookies', (req, res) => {
  res.json({
    message: 'Cookie读取演示（先访问/demo/set-cookie设置Cookie）',
    cookies: req.cookies,
    signedCookies: req.signedCookies
  });
});

// 1.5 req.body演示
app.post('/demo/req-body', (req, res) => {
  res.json({
    message: '请求体演示',
    body: req.body,
    contentType: req.get('content-type')
  });
});

// ========== 2. Response对象演示 ==========

// 2.1 发送文本
app.get('/demo/res-text', (req, res) => {
  res.type('text/plain; charset=utf-8');
  res.send('这是纯文本响应！Express会自动设置Content-Type: text/plain');
});

// 2.2 发送HTML
app.get('/demo/res-html', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>HTML响应</title></head>
    <body style="font-family: system-ui; text-align: center; padding: 50px;">
      <h1>🎨 这是HTML响应</h1>
      <p>res.send()会自动识别HTML字符串并设置Content-Type: text/html</p>
      <p><a href="/">← 返回首页</a></p>
    </body>
    </html>
  \`);
});

// 2.3 发送JSON
app.get('/demo/res-json', (req, res) => {
  res.json({
    message: '这是JSON响应',
    timestamp: new Date().toISOString(),
    data: {
      name: 'Express',
      version: '4.x',
      awesome: true,
      features: ['路由', '中间件', '模板引擎']
    },
    tips: 'res.json()会自动设置Content-Type: application/json并序列化对象'
  });
});

// 2.4 各种状态码演示
app.get('/demo/res-status', (req, res, next) => {
  const code = parseInt(req.query.code) || 200;
  
  const statusMessages = {
    200: '200 OK - 请求成功',
    201: '201 Created - 资源创建成功',
    204: '204 No Content - 成功但无内容返回',
    400: '400 Bad Request - 请求参数错误',
    401: '401 Unauthorized - 未登录认证',
    403: '403 Forbidden - 已登录但无权限',
    404: '404 Not Found - 资源不存在',
    500: '500 Internal Server Error - 服务器内部错误'
  };
  
  if (code === 204) {
    return res.sendStatus(204);
  }
  
  res.status(code).json({
    statusCode: code,
    message: statusMessages[code] || '未知状态码',
    tips: '用?code=xxx来测试不同状态码，例如：?code=404'
  });
});

// 2.5 自定义响应头
app.get('/demo/res-headers', (req, res) => {
  // 设置单个响应头
  res.set('X-Powered-By', 'Express Demo App');
  res.set('X-Hello', 'Hello from Custom Header!');
  
  // 批量设置
  res.set({
    'X-Custom-Header': '自定义值',
    'X-Request-Id': Date.now().toString(36),
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Frame-Options': 'DENY'
  });
  
  // 追加Link头
  res.links({
    next: 'http://example.com?page=2',
    last: 'http://example.com?page=10'
  });
  
  res.json({
    message: '已设置自定义响应头，请查看Response Headers',
    headersSent: res.headersSent
  });
});

// 2.6 设置Cookie
app.get('/demo/set-cookie', (req, res) => {
  // 简单Cookie（浏览器JS可访问）
  res.cookie('theme', 'dark', {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    path: '/'
  });
  
  res.cookie('visitCount', visitCount, {
    maxAge: 24 * 60 * 60 * 1000
  });
  
  // HttpOnly Cookie（JS不能读取，更安全）
  res.cookie('sessionId', 'sess_' + Date.now(), {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  // 签名Cookie（防篡改）
  res.cookie('signed_user', 'demo_user', {
    signed: true,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.type('text/html; charset=utf-8');
  res.send(\`
    <h1>✅ Cookie已设置！</h1>
    <p>已设置以下Cookie：</p>
    <ul>
      <li><code>theme=dark</code> - 普通Cookie</li>
      <li><code>visitCount</code> - 访问计数</li>
      <li><code>sessionId</code> - HttpOnly Cookie（JS不可见）</li>
      <li><code>signed_user</code> - 签名Cookie（防篡改）</li>
    </ul>
    <p><a href="/demo/req-cookies">查看Cookie内容 →</a></p>
    <p><a href="/">← 返回首页</a></p>
  \`);
});

// 2.7 清除Cookie
app.get('/demo/clear-cookie', (req, res) => {
  res.clearCookie('theme');
  res.clearCookie('visitCount');
  res.clearCookie('sessionId');
  res.clearCookie('signed_user');
  
  res.send(\`
    <h1>🗑️ Cookie已清除！</h1>
    <p><a href="/demo/req-cookies">验证Cookie已清除 →</a></p>
    <p><a href="/">← 返回首页</a></p>
  \`);
});

// 2.8 重定向
app.get('/demo/redirect-google', (req, res) => {
  res.redirect('https://www.google.com');
});

app.get('/demo/redirect-back', (req, res) => {
  res.redirect('back');
});

// 2.9 文件下载
app.get('/demo/download', (req, res) => {
  // 创建一个临时文本文件用于演示下载
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  const filePath = path.join(tempDir, 'demo-file.txt');
  const content = \`这是一个演示下载的文本文件
创建时间: \${new Date().toLocaleString('zh-CN')}
访问IP: \${req.ip}
请求路径: \${req.path}

Express文件下载演示 - res.download()方法
\`;
  
  fs.writeFileSync(filePath, content, 'utf-8');
  
  // res.download会设置Content-Disposition为attachment，触发浏览器下载
  res.download(filePath, 'express-demo.txt', (err) => {
    if (err) {
      console.error('下载错误:', err);
      if (!res.headersSent) {
        res.status(500).send('下载失败');
      }
    }
    // 下载后可以删除临时文件（可选）
    setTimeout(() => {
      try { fs.unlinkSync(filePath); } catch(e) {}
    }, 1000);
  });
});

// 2.10 内容协商
app.get('/demo/content-negotiation', (req, res) => {
  // 根据Accept头返回不同格式
  res.format({
    'text/html': () => {
      res.send(\`
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>内容协商</title></head>
        <body style="font-family: system-ui; max-width: 600px; margin: 50px auto;">
          <h1>📄 HTML格式响应</h1>
          <p>你的请求头Accept包含text/html，所以返回HTML页面</p>
          <p>试试在curl中设置不同的Accept头：</p>
          <pre>curl -H "Accept: application/json" http://localhost:\${PORT}/demo/content-negotiation</pre>
          <p><a href="/">← 返回首页</a></p>
        </body>
        </html>
      \`);
    },
    
    'application/json': () => {
      res.json({
        format: 'json',
        message: '这是JSON格式响应',
        timestamp: new Date().toISOString(),
        tip: '你请求的Accept头是application/json'
      });
    },
    
    'text/plain': () => {
      res.type('text/plain; charset=utf-8');
      res.send('这是纯文本格式响应\\n你的Accept头偏好text/plain');
    },
    
    default: () => {
      res.status(406).send('Not Acceptable');
    }
  });
});

// ========== 3. 综合演示：一个完整的API响应 ==========

// 用户数据
let users = [
  { id: 1, name: '张三', email: 'YA9RfmB0@dTdpwNO.TAM', age: 25 },
  { id: 2, name: '李四', email: 'Rawe@YP2H57H.vHY', age: 30 }
];

// 演示良好的API设计
app.get('/api/users', (req, res) => {
  // 设置自定义响应头
  res.set('X-Total-Count', users.length);
  res.set('X-API-Version', 'v1');
  
  // 分页参数处理
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const start = (page - 1) * pageSize;
  const data = users.slice(start, start + pageSize);
  
  // 返回标准格式的JSON
  res.json({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: users.length,
      totalPages: Math.ceil(users.length / pageSize)
    }
  });
});

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  // 参数验证
  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: '无效的用户ID'
    });
  }
  
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// ========== 404和错误处理 ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  📬  Request/Response 对象演示服务器');
  console.log('  📡  http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
  console.log('📖 req对象常用属性：');
  console.log('  req.params    - 路径参数');
  console.log('  req.query     - 查询参数');
  console.log('  req.body      - 请求体');
  console.log('  req.headers   - 请求头');
  console.log('  req.cookies   - Cookie');
  console.log('  req.method    - 请求方法');
  console.log('  req.path      - 请求路径');
  console.log('  req.ip        - 客户端IP');
  console.log('');
  console.log('📤 res对象常用方法：');
  console.log('  res.send()    - 发送响应');
  console.log('  res.json()    - 发送JSON');
  console.log('  res.status()  - 设置状态码');
  console.log('  res.set()     - 设置响应头');
  console.log('  res.cookie()  - 设置Cookie');
  console.log('  res.redirect()- 重定向');
  console.log('  res.download()- 下载文件');
  console.log('  res.sendFile()- 发送文件');
});
`
  }
];
