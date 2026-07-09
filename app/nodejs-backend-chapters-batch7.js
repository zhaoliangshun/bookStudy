export const chapters = [
  {
    id: "nb-restful",
    group: "第五部分：项目实战",
    icon: "📐",
    title: "RESTful API设计规范",
    content: `# RESTful API设计规范

REST（Representational State Transfer）是一种API设计风格，已经成为现代Web API的事实标准。好的RESTful API应该是**直观、一致、可预测**的，让开发者看URL和HTTP方法就知道该接口是做什么的。

---

## 一、REST核心原则

### 1. 资源为中心

REST的核心是**资源（Resource）**——系统中的一切事物都可以抽象为资源：
- 用户是资源：\`/users\`
- 文章是资源：\`/posts\`
- 评论是资源：\`/comments\`

每个资源用**URL（统一资源定位符）**来标识，URL中应该使用**名词**，而不是动词！

❌ 错误：\`/getUsers\`、\`/createPost\`、\`/deleteComment\`
✅ 正确：\`GET /users\`、\`POST /posts\`、\`DELETE /comments/:id\`

---

## 二、HTTP方法语义

HTTP方法（动词）用来表示对资源的操作，这是REST的精髓！

| HTTP方法 | 语义 | 幂等 | 安全 | 示例 |
|---------|------|------|------|------|
| **GET** | 获取资源 | ✅ | ✅ | GET /users（获取用户列表） |
| **POST** | 创建资源 | ❌ | ❌ | POST /users（创建新用户） |
| **PUT** | 完整更新资源（替换） | ✅ | ❌ | PUT /users/1（完整更新用户1） |
| **PATCH** | 部分更新资源 | ❌ | ❌ | PATCH /users/1（只更新用户1的某个字段） |
| **DELETE** | 删除资源 | ✅ | ❌ | DELETE /users/1（删除用户1） |

**幂等性**：执行一次和执行N次效果相同。比如PUT更新同一个资源多次，结果是一样的；但POST创建资源会创建多次。

**安全性**：不会改变资源状态。GET只是读取，不会修改任何数据。

---

## 三、HTTP状态码使用规范

用对状态码，客户端不用解析响应体就知道请求结果！

### 2xx 成功

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| **200 OK** | 请求成功 | GET获取成功、PUT更新成功 |
| **201 Created** | 创建成功 | POST创建资源成功（推荐，响应头带Location） |
| **204 No Content** | 成功但无返回内容 | DELETE删除成功 |

### 3xx 重定向

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| **301 Moved Permanently** | 永久重定向 | 资源永久迁移 |
| **302 Found** | 临时重定向 | 临时跳转 |

### 4xx 客户端错误

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| **400 Bad Request** | 请求参数错误 | 参数校验失败、格式错误 |
| **401 Unauthorized** | 未认证 | 没登录、token无效 |
| **403 Forbidden** | 已认证但无权限 | 普通用户想访问管理员接口 |
| **404 Not Found** | 资源不存在 | 请求的ID不存在 |
| **409 Conflict** | 资源冲突 | 用户名已存在、并发冲突 |
| **422 Unprocessable Entity** | 参数验证失败 | 格式对但语义不对（如邮箱格式错误） |
| **429 Too Many Requests** | 请求过多 | 限流触发 |

### 5xx 服务器错误

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| **500 Internal Server Error** | 服务器内部错误 | 代码bug、未捕获异常 |
| **502 Bad Gateway** | 网关错误 | 反向代理收到无效响应 |
| **503 Service Unavailable** | 服务不可用 | 服务器维护、过载 |

---

## 四、URL命名规范

### 1. 基本规则

- 使用**小写字母**和**连字符**（kebab-case），不要用驼峰或下划线
  - ✅ \`/user-profiles\`
  - ❌ \`/userProfiles\`、\`/user_profiles\`
- 使用**名词复数**表示资源集合
  - ✅ \`/users\`、\`/posts\`、\`/comments\`
- 层级关系表示嵌套资源
  - ✅ \`/posts/1/comments\`（文章1的所有评论）
  - ✅ \`/users/1/posts\`（用户1的所有文章）

### 2. 特殊操作（非CRUD）

对于登录、搜索等不属于标准CRUD的操作，可以用动词：

\`\`\`
POST /auth/login      # 登录
POST /auth/logout     # 登出
POST /auth/register   # 注册
GET  /search?q=keyword # 搜索
POST /posts/1/publish  # 发布文章
POST /posts/1/like     # 点赞
\`\`\`

### 3. Query参数规范

- 分页：\`?page=1&pageSize=20\`
- 排序：\`?sort=-createdAt\`（-表示降序）
- 过滤：\`?status=published&author=张三\`
- 字段选择：\`?fields=id,title,createdAt\`
- 关键词搜索：\`?q=关键词\`

---

## 五、分页、排序、过滤

### 分页设计

好的分页响应应该包含**元数据**，方便前端实现分页器：

\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

### 排序设计

支持多字段排序：
- \`?sort=createdAt\`：按创建时间升序
- \`?sort=-createdAt\`：按创建时间降序
- \`?sort=-createdAt,title\`：先按创建时间降序，再按标题升序

### 过滤设计

- 精确匹配：\`?status=active\`
- 范围查询：\`?price[gte]=100&price[lte]=500\`
- 多值匹配：\`?tag=javascript&tag=nodejs\`（IN查询）

---

## 六、API版本控制

API总会迭代，版本控制让你可以升级API而不破坏旧版本客户端。

### 常见方案

1. **URL路径版本化**（最常用、最直观）
   \`\`\`
   /api/v1/users
   /api/v2/users
   \`\`\`

2. **请求头版本化**
   \`\`\`
   Accept: application/vnd.myapp.v1+json
   \`\`\`

3. **Query参数版本化**
   \`\`\`
   /api/users?version=1
   \`\`\`

推荐用第一种，简单直接。

---

## 七、统一响应格式

保持响应格式一致，前端可以统一处理。

### 成功响应

\`\`\`json
{
  "success": true,
  "data": { ... 或 [...] },
  "message": "操作成功"
}
\`\`\`

列表接口额外加分页信息：

\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": { ... },
  "message": "获取成功"
}
\`\`\`

### 错误响应

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

错误码设计：\`模块_错误类型\`，比如\`USER_NOT_FOUND\`、\`AUTH_TOKEN_EXPIRED\`。
`,
    code: `// ============================================
// RESTful API设计规范完整演示
// 运行前请安装依赖: npm install express
// ============================================

const express = require('express');
const app = express();
const PORT = 3000;

// ========== 中间件 ==========
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(\`[\${new Date().toLocaleTimeString()}] \${req.method} \${req.originalUrl}\`);
  next();
});

// ========== 模拟数据库 ==========
let posts = [
  { id: 1, title: 'RESTful API设计指南', content: 'REST是一种API设计风格...', author: '张三', status: 'published', likes: 10, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Express入门教程', content: 'Express是Node.js最流行的框架...', author: '李四', status: 'published', likes: 25, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
  { id: 3, title: 'Jest测试入门', content: '测试是保证代码质量的关键...', author: '张三', status: 'draft', likes: 5, createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' },
];
let nextId = 4;

// ========== 统一响应工具函数 ==========

/**
 * 成功响应
 * @param {Object} res - Express response对象
 * @param {*} data - 返回的数据
 * @param {string} message - 提示消息
 * @param {number} statusCode - HTTP状态码，默认200
 */
function success(res, data = null, message = '操作成功', statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

/**
 * 分页成功响应
 */
function paginatedSuccess(res, data, pagination, message = '获取成功') {
  res.json({
    success: true,
    data,
    pagination,
    message
  });
}

/**
 * 错误响应
 * @param {string} code - 错误码
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP状态码
 * @param {Array} details - 详细错误信息
 */
function error(res, code, message, statusCode = 400, details = null) {
  const errorBody = {
    success: false,
    error: { code, message }
  };
  if (details) {
    errorBody.error.details = details;
  }
  res.status(statusCode).json(errorBody);
}

// ========== RESTful API 路由 ==========

// ---------- 1. GET /api/v1/posts - 获取文章列表（支持分页、排序、过滤）----------
app.get('/api/v1/posts', (req, res) => {
  try {
    // 解析查询参数
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100); // 最大100条，防止恶意请求
    const sortField = req.query.sort ? req.query.sort.replace(/^-/, '') : 'createdAt';
    const sortOrder = req.query.sort && req.query.sort.startsWith('-') ? -1 : 1;
    const status = req.query.status;
    const author = req.query.author;
    const keyword = req.query.q;
    const fields = req.query.fields ? req.query.fields.split(',') : null;

    // 过滤
    let result = [...posts];
    if (status) {
      result = result.filter(p => p.status === status);
    }
    if (author) {
      result = result.filter(p => p.author.includes(author));
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw)
      );
    }

    // 排序
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });

    // 分页
    const total = result.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = result.slice(startIndex, endIndex);

    // 字段选择
    let finalData = paginatedData;
    if (fields) {
      finalData = paginatedData.map(item => {
        const selected = {};
        fields.forEach(f => { if (item[f] !== undefined) selected[f] = item[f]; });
        return selected;
      });
    }

    // 返回分页响应
    paginatedSuccess(res, finalData, {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (err) {
    error(res, 'INTERNAL_ERROR', '服务器内部错误', 500);
  }
});

// ---------- 2. GET /api/v1/posts/:id - 获取单篇文章 ----------
app.get('/api/v1/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return error(res, 'POST_NOT_FOUND', \`ID为\${id}的文章不存在\`, 404);
  }
  
  success(res, post, '获取成功');
});

// ---------- 3. POST /api/v1/posts - 创建新文章 ----------
app.post('/api/v1/posts', (req, res) => {
  const { title, content, author, status } = req.body;
  
  // 参数校验
  const errors = [];
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: '标题不能为空' });
  }
  if (title && title.length > 200) {
    errors.push({ field: 'title', message: '标题不能超过200个字符' });
  }
  if (!content || typeof content !== 'string') {
    errors.push({ field: 'content', message: '内容不能为空' });
  }
  if (status && !['draft', 'published'].includes(status)) {
    errors.push({ field: 'status', message: 'status只能是draft或published' });
  }
  
  if (errors.length > 0) {
    return error(res, 'VALIDATION_ERROR', '参数验证失败', 422, errors);
  }
  
  const newPost = {
    id: nextId++,
    title: title.trim(),
    content,
    author: author || '匿名',
    status: status || 'draft',
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  posts.push(newPost);
  
  // 201 Created：创建成功，Location头指向新资源URL
  res.location(\`/api/v1/posts/\${newPost.id}\`);
  success(res, newPost, '创建成功', 201);
});

// ---------- 4. PUT /api/v1/posts/:id - 完整更新文章 ----------
app.put('/api/v1/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return error(res, 'POST_NOT_FOUND', \`ID为\${id}的文章不存在\`, 404);
  }
  
  const { title, content, author, status } = req.body;
  
  // PUT要求提供完整的资源字段
  const errors = [];
  if (!title) errors.push({ field: 'title', message: '标题不能为空（PUT需要完整资源）' });
  if (!content) errors.push({ field: 'content', message: '内容不能为空（PUT需要完整资源）' });
  if (status && !['draft', 'published'].includes(status)) {
    errors.push({ field: 'status', message: 'status只能是draft或published' });
  }
  
  if (errors.length > 0) {
    return error(res, 'VALIDATION_ERROR', '参数验证失败', 422, errors);
  }
  
  // 完整替换
  const updatedPost = {
    ...post,
    title,
    content,
    author: author || post.author,
    status: status || post.status,
    updatedAt: new Date().toISOString()
  };
  
  const index = posts.findIndex(p => p.id === id);
  posts[index] = updatedPost;
  
  success(res, updatedPost, '更新成功');
});

// ---------- 5. PATCH /api/v1/posts/:id - 部分更新文章 ----------
app.patch('/api/v1/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return error(res, 'POST_NOT_FOUND', \`ID为\${id}的文章不存在\`, 404);
  }
  
  const allowedFields = ['title', 'content', 'author', 'status'];
  const updates = {};
  const errors = [];
  
  // 只更新提供的字段
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'status' && !['draft', 'published'].includes(req.body[field])) {
        errors.push({ field: 'status', message: 'status只能是draft或published' });
      } else if (field === 'title' && req.body[field].length > 200) {
        errors.push({ field: 'title', message: '标题不能超过200个字符' });
      } else {
        updates[field] = req.body[field];
      }
    }
  }
  
  if (errors.length > 0) {
    return error(res, 'VALIDATION_ERROR', '参数验证失败', 422, errors);
  }
  
  const updatedPost = {
    ...post,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  const index = posts.findIndex(p => p.id === id);
  posts[index] = updatedPost;
  
  success(res, updatedPost, '更新成功');
});

// ---------- 6. DELETE /api/v1/posts/:id - 删除文章 ----------
app.delete('/api/v1/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = posts.findIndex(p => p.id === id);
  
  if (index === -1) {
    return error(res, 'POST_NOT_FOUND', \`ID为\${id}的文章不存在\`, 404);
  }
  
  posts.splice(index, 1);
  
  // 204 No Content：删除成功，无返回内容
  res.status(204).send();
});

// ---------- 7. 嵌套资源：GET /api/v1/posts/:id/comments - 获取某文章的评论 ----------
app.get('/api/v1/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId);
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    return error(res, 'POST_NOT_FOUND', \`ID为\${postId}的文章不存在\`, 404);
  }
  
  // 模拟评论数据
  const comments = [
    { id: 1, postId, content: '写得很好！', author: '读者A', createdAt: '2024-01-04T00:00:00Z' },
    { id: 2, postId, content: '学到了，感谢分享', author: '读者B', createdAt: '2024-01-05T00:00:00Z' },
  ];
  
  success(res, comments);
});

// ---------- 8. 特殊操作：POST /api/v1/posts/:id/like - 点赞 ----------
app.post('/api/v1/posts/:id/like', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  
  if (!post) {
    return error(res, 'POST_NOT_FOUND', \`ID为\${id}的文章不存在\`, 404);
  }
  
  post.likes++;
  post.updatedAt = new Date().toISOString();
  
  success(res, { likes: post.likes }, '点赞成功');
});

// ========== API信息/根路由 ==========
app.get('/api/v1', (req, res) => {
  success(res, {
    name: 'RESTful API 演示',
    version: 'v1',
    endpoints: {
      'GET    /api/v1/posts': '获取文章列表（支持分页、排序、过滤、搜索）',
      'GET    /api/v1/posts/:id': '获取单篇文章',
      'POST   /api/v1/posts': '创建新文章',
      'PUT    /api/v1/posts/:id': '完整更新文章',
      'PATCH  /api/v1/posts/:id': '部分更新文章',
      'DELETE /api/v1/posts/:id': '删除文章',
      'GET    /api/v1/posts/:postId/comments': '获取文章评论',
      'POST   /api/v1/posts/:id/like': '点赞文章'
    },
    queryParameters: {
      page: '页码，默认1',
      pageSize: '每页条数，默认10，最大100',
      sort: '排序字段，-前缀表示降序，如：-createdAt',
      status: '按状态过滤：draft/published',
      author: '按作者过滤',
      q: '关键词搜索',
      fields: '选择返回字段，逗号分隔'
    }
  }, 'API根路径');
});

// ========== 404处理 ==========
app.use((req, res) => {
  error(res, 'NOT_FOUND', \`\${req.method} \${req.originalUrl} 不存在\`, 404);
});

// ========== 错误处理中间件 ==========
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  error(res, 'INTERNAL_ERROR', '服务器内部错误', 500);
});

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  📐 RESTful API 演示服务器已启动');
  console.log('  📡 http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
  console.log('📚 RESTful设计要点回顾：');
  console.log('   1. URL用名词复数：/posts 而不是 /getPosts');
  console.log('   2. HTTP方法表语义：GET查/POST建/PUT全改/PATCH改/DELETE删');
  console.log('   3. 用对状态码：200成功/201创建/204删除/400参数错/401未认证/403无权限/404不存在/500服务器错');
  console.log('   4. 响应格式统一：{ success, data, message }');
  console.log('   5. 列表支持分页、排序、过滤');
  console.log('   6. API要版本化：/api/v1/...');
  console.log('');
  console.log('🧪 测试示例：');
  console.log('   # 获取所有已发布文章，第1页，每页2条，按创建时间倒序');
  console.log('   curl "http://localhost:' + PORT + '/api/v1/posts?status=published&page=1&pageSize=2&sort=-createdAt"');
  console.log('');
  console.log('   # 创建文章');
  console.log('   curl -X POST -H "Content-Type: application/json" -d \\'{"title":"测试","content":"内容"}\\' http://localhost:' + PORT + '/api/v1/posts');
  console.log('');
  console.log('   # 点赞文章');
  console.log('   curl -X POST http://localhost:' + PORT + '/api/v1/posts/1/like');
});
`
  },
  {
    id: "nb-test",
    group: "第五部分：项目实战",
    icon: "🧪",
    title: "Jest测试与Supertest接口测试",
    content: `# Jest测试与Supertest接口测试

测试是保证代码质量的关键手段。没有测试的代码就像在钢丝上走路——不知道什么时候就摔了。Node.js生态中最流行的测试方案就是**Jest + Supertest**组合。

---

## 一、为什么要写测试？

1. **保证代码质量**：手动测试很难覆盖所有场景
2. **放心重构**：有测试保护，改代码不慌
3. **活文档**：测试用例就是最好的使用示例
4. **减少Bug**：修改代码时测试会第一时间告诉你哪里坏了
5. **提升设计**：难测试的代码往往设计也有问题

测试金字塔：
- **单元测试**（最多）：测试单个函数/模块，快
- **集成测试**（中间）：测试模块间协作、API接口
- **端到端测试**（最少）：模拟真实用户操作，慢

---

## 二、Jest快速入门

Jest是Facebook出品的测试框架，零配置、功能全面、速度快。

### 安装

\`\`\`bash
npm install --save-dev jest
\`\`\`

package.json加脚本：
\`\`\`json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
\`\`\`

### 基本概念

Jest会自动找这些文件：
- \`__tests__\`文件夹下的\`.js\`文件
- 文件名带\`.test.js\`或\`.spec.js\`后缀

### 编写第一个测试

\`\`\`javascript
// math.js
function add(a, b) {
  return a + b;
}
module.exports = { add };

// math.test.js
const { add } = require('./math');

// describe：测试套件（分组）
describe('数学函数测试', () => {
  // test/it：测试用例
  test('add(1, 2) 应该等于 3', () => {
    // expect：断言
    expect(add(1, 2)).toBe(3);
  });
  
  it('add(0, 0) 应该等于 0', () => {
    expect(add(0, 0)).toBe(0);
  });
});
\`\`\`

---

## 三、常用匹配器（Matchers）

### 相等性

\`\`\`javascript
// 精确相等（===）
expect(2 + 2).toBe(4);
expect(user.name).toBe('张三');

// 深度相等（比较对象/数组内容）
expect({a: 1}).toEqual({a: 1});
expect([1, 2, 3]).toEqual([1, 2, 3]);

// 不相等
expect(2 + 2).not.toBe(5);
\`\`\`

### 真假值

\`\`\`javascript
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(value).toBeDefined(); // 不是undefined
expect(true).toBeTruthy();   // 真值
expect(false).toBeFalsy();   // 假值
\`\`\`

### 数字

\`\`\`javascript
expect(5).toBeGreaterThan(3);       // > 3
expect(5).toBeGreaterThanOrEqual(5); // >= 5
expect(5).toBeLessThan(10);         // < 10
expect(0.1 + 0.2).toBeCloseTo(0.3); // 浮点数比较
\`\`\`

### 字符串

\`\`\`javascript
expect('hello world').toMatch(/hello/); // 正则匹配
expect('hello world').toContain('world'); // 包含子串
\`\`\`

### 数组和可迭代对象

\`\`\`javascript
expect([1, 2, 3]).toContain(2);
expect([{id:1}, {id:2}]).toContainEqual({id:2}); // 深度包含
expect(arr).toHaveLength(3);
\`\`\`

### 异常

\`\`\`javascript
function throwError() {
  throw new Error('出错了');
}

expect(() => throwError()).toThrow();
expect(() => throwError()).toThrow('出错了');
expect(() => throwError()).toThrow(/出错/);
\`\`\`

---

## 四、测试的准备与清理

\`\`\`javascript
beforeAll(() => {
  // 所有测试用例执行前运行一次（如：连接数据库）
});

afterAll(() => {
  // 所有测试用例执行后运行一次（如：断开数据库连接）
});

beforeEach(() => {
  // 每个测试用例执行前都运行（如：重置测试数据）
});

afterEach(() => {
  // 每个测试用例执行后都运行（如：清理mock）
});
\`\`\`

---

## 五、Mock函数

测试时我们经常需要"模拟"函数，避免依赖真实的外部服务（数据库、API等）。

\`\`\`javascript
// 创建一个mock函数
const mockFn = jest.fn();
mockFn('hello');
mockFn('world');

// 断言mock被调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('hello');
expect(mockFn).toHaveBeenNthCalledWith(1, 'hello');
expect(mockFn).toHaveBeenNthCalledWith(2, 'world');

// mock返回值
const getUser = jest.fn().mockReturnValue({ id: 1, name: '张三' });
expect(getUser()).toEqual({ id: 1, name: '张三' });

// mock模块
jest.mock('./db', () => ({
  query: jest.fn().mockResolvedValue([{ id: 1 }])
}));
\`\`\`

---

## 六、Supertest接口测试

单元测试测单个函数，**接口集成测试**则是真实启动HTTP服务器，发送真实的HTTP请求，验证整个链路是否正常。

Supertest是专门用来测试Node.js HTTP服务器的库。

### 安装

\`\`\`bash
npm install --save-dev supertest
\`\`\`

### 基本用法

\`\`\`javascript
const request = require('supertest');
const app = require('./app'); // 你的Express app

describe('GET /api/users', () => {
  it('应该返回用户列表', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
\`\`\`

### 发送各种请求

\`\`\`javascript
// POST发送JSON
const res = await request(app)
  .post('/api/posts')
  .send({ title: '测试', content: '内容' })
  .set('Authorization', 'Bearer token123') // 设置请求头
  .expect(201);

// PUT更新
await request(app)
  .put('/api/posts/1')
  .send({ title: '更新后的标题' })
  .expect(200);

// DELETE删除
await request(app)
  .delete('/api/posts/1')
  .expect(204);
\`\`\`

---

## 七、测试覆盖率

测试覆盖率告诉你代码被测试覆盖了多少。

运行：\`npm run test:coverage\`

会生成四个指标：
- **Statement Coverage**：语句覆盖率
- **Branch Coverage**：分支覆盖率（if/else等）
- **Function Coverage**：函数覆盖率
- **Line Coverage**：行覆盖率

不要盲目追求100%覆盖率，核心业务逻辑覆盖率高就行。配置Jest覆盖率阈值：

\`\`\`javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  }
};
\`\`\`

---

## 八、测试最佳实践

1. **测试行为，不是实现**：测输入输出，不测内部变量
2. **每个测试独立**：测试之间不互相依赖，不共享状态
3. **描述清晰**：测试名应该是"当X时，应该Y"这样的句子
4. **AAA模式**：Arrange（准备数据）→ Act（执行）→ Assert（断言）
5. **不要测试框架本身**：Express、数据库这些不需要你测
6. **测边界条件**：空值、0、最大值、异常输入
7. **快速**：单元测试应该毫秒级完成，慢的话没人愿意跑
`,
    code: `// ============================================
// Jest + Supertest 完整测试演示
// 运行步骤：
// 1. npm init -y
// 2. npm install express
// 3. npm install --save-dev jest supertest
// 4. 将本文件保存为 app.js
// 5. 创建 __tests__/api.test.js（见下方测试代码）
// 6. package.json 添加: "scripts": { "test": "jest" }
// 7. npm test
// ============================================

const express = require('express');
const app = express();

app.use(express.json());

// ========== 模拟数据库 ==========
let posts = [
  { id: 1, title: '第一篇文章', content: '内容1', author: '张三' },
  { id: 2, title: '第二篇文章', content: '内容2', author: '李四' },
];
let nextId = 3;

// ========== 辅助函数：简单验证 ==========
function validatePost(data) {
  const errors = [];
  if (!data.title || data.title.trim().length === 0) {
    errors.push('标题不能为空');
  }
  if (!data.content) {
    errors.push('内容不能为空');
  }
  return errors;
}

// ========== API路由（和上一章一致） ==========

app.get('/api/posts', (req, res) => {
  res.json({ success: true, data: posts });
});

app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ success: false, error: '文章不存在' });
  }
  res.json({ success: true, data: post });
});

app.post('/api/posts', (req, res) => {
  const errors = validatePost(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  const newPost = {
    id: nextId++,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author || '匿名'
  };
  posts.push(newPost);
  res.status(201).json({ success: true, data: newPost });
});

app.put('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: '文章不存在' });
  }
  const errors = validatePost(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  posts[index] = { ...posts[index], ...req.body, id };
  res.json({ success: true, data: posts[index] });
});

app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: '文章不存在' });
  }
  posts.splice(index, 1);
  res.status(204).send();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 导出app，供supertest测试使用
// 注意：这里不直接listen，由测试或启动文件决定
module.exports = app;

// 如果直接运行这个文件（node app.js），则启动服务器
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('服务器运行在 http://localhost:' + PORT);
    console.log('运行 npm test 来执行测试');
  });
}

/* ============================================
   下面是测试代码，请保存为 __tests__/api.test.js
   ============================================

const request = require('supertest');
const app = require('../app');

// 每个测试前重置数据
beforeEach(() => {
  // 重置posts数组到初始状态
  const { posts: postsRef } = require('../app'); // 注意：实际项目中应该用独立的db模块
});

describe('🧪 博客API测试', () => {
  
  describe('GET /health', () => {
    it('应该返回健康状态', async () => {
      const res = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.timestamp).toBe('number');
    });
  });

  describe('GET /api/posts', () => {
    it('应该返回文章列表，状态码200', async () => {
      const res = await request(app)
        .get('/api/posts')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('每篇文章应该有id、title、content、author字段', async () => {
      const res = await request(app).get('/api/posts');
      const post = res.body.data[0];
      
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('author');
    });
  });

  describe('GET /api/posts/:id', () => {
    it('应该返回指定ID的文章', async () => {
      const res = await request(app)
        .get('/api/posts/1')
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.title).toBe('第一篇文章');
    });

    it('ID不存在时应该返回404', async () => {
      const res = await request(app)
        .get('/api/posts/9999')
        .expect(404);
      
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/posts', () => {
    it('应该能创建新文章，返回201', async () => {
      const newPost = {
        title: '测试文章',
        content: '这是测试内容',
        author: '测试作者'
      };
      
      const res = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(newPost.title);
      expect(res.body.data.content).toBe(newPost.content);
      expect(res.body.data.id).toBeDefined();
    });

    it('创建时不传author应该默认匿名', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: '测试', content: '内容' })
        .expect(201);
      
      expect(res.body.data.author).toBe('匿名');
    });

    it('标题为空时应该返回400错误', async () => {
      await request(app)
        .post('/api/posts')
        .send({ title: '', content: '内容' })
        .expect(400);
    });

    it('内容为空时应该返回400错误', async () => {
      await request(app)
        .post('/api/posts')
        .send({ title: '标题' })
        .expect(400);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('应该能更新文章', async () => {
      const res = await request(app)
        .put('/api/posts/1')
        .send({ title: '更新后的标题', content: '更新后的内容' })
        .expect(200);
      
      expect(res.body.data.title).toBe('更新后的标题');
    });

    it('更新不存在的文章应该返回404', async () => {
      await request(app)
        .put('/api/posts/9999')
        .send({ title: '标题', content: '内容' })
        .expect(404);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('应该能删除文章，返回204', async () => {
      await request(app)
        .delete('/api/posts/2')
        .expect(204);
      
      // 删除后再查应该404
      await request(app)
        .get('/api/posts/2')
        .expect(404);
    });

    it('删除不存在的文章应该返回404', async () => {
      await request(app)
        .delete('/api/posts/9999')
        .expect(404);
    });
  });
});

============================================ */

// ========== 单元测试示例（独立的工具函数） ==========

// 假设我们有一个工具函数模块 utils.js
const utils = {
  // 分页计算
  paginate(total, page, pageSize) {
    page = Math.max(1, parseInt(page) || 1);
    pageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10));
    const totalPages = Math.ceil(total / pageSize);
    return {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      offset: (page - 1) * pageSize
    };
  },
  
  // 简单的参数校验
  validateEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  },
  
  // 生成响应
  formatResponse(data, message = 'success') {
    return { success: true, data, message };
  },
  
  formatError(code, message) {
    return { success: false, error: { code, message } };
  }
};

// 如果在测试环境，导出这些工具函数供测试
if (process.env.NODE_ENV === 'test') {
  module.exports.utils = utils;
}

/* ============================================
   工具函数单元测试，请保存为 __tests__/utils.test.js
   ============================================

const { utils } = require('../app');

describe('🔧 工具函数单元测试', () => {
  
  describe('paginate 分页函数', () => {
    it('应该正确计算分页信息', () => {
      const result = utils.paginate(100, 2, 10);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);
      expect(result.offset).toBe(10);
    });

    it('第一页应该没有上一页', () => {
      const result = utils.paginate(100, 1, 10);
      expect(result.hasPrev).toBe(false);
      expect(result.hasNext).toBe(true);
    });

    it('最后一页应该没有下一页', () => {
      const result = utils.paginate(100, 10, 10);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });

    it('page参数非法时应该默认为1', () => {
      expect(utils.paginate(10, 0, 10).page).toBe(1);
      expect(utils.paginate(10, -1, 10).page).toBe(1);
      expect(utils.paginate(10, 'abc', 10).page).toBe(1);
    });

    it('pageSize最大不能超过100', () => {
      expect(utils.paginate(1000, 1, 200).pageSize).toBe(100);
    });
  });

  describe('validateEmail 邮箱验证', () => {
    it('正确的邮箱应该返回true', () => {
      expect(utils.validateEmail('test@example.com')).toBe(true);
      expect(utils.validateEmail('user.name+tag@domain.co')).toBe(true);
    });

    it('错误的邮箱应该返回false', () => {
      expect(utils.validateEmail('notanemail')).toBe(false);
      expect(utils.validateEmail('missing@domain')).toBe(false);
      expect(utils.validateEmail('@nodomain.com')).toBe(false);
      expect(utils.validateEmail('')).toBe(false);
      expect(utils.validateEmail(null)).toBe(false);
      expect(utils.validateEmail(undefined)).toBe(false);
      expect(utils.validateEmail(123)).toBe(false);
    });
  });

  describe('formatResponse 格式化成功响应', () => {
    it('应该返回正确格式', () => {
      const data = { id: 1 };
      const result = utils.formatResponse(data, '成功');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBe('成功');
    });

    it('message默认值应该是success', () => {
      const result = utils.formatResponse({});
      expect(result.message).toBe('success');
    });
  });

  describe('formatError 格式化错误响应', () => {
    it('应该返回正确格式', () => {
      const result = utils.formatError('NOT_FOUND', '资源不存在');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.message).toBe('资源不存在');
    });
  });
});

============================================ */

// 启动提示
if (require.main === module) {
  console.log('');
  console.log('📋 测试命令：');
  console.log('   npm test           # 运行所有测试');
  console.log('   npm test -- --watch # 监听模式');
  console.log('   npm test -- --coverage # 查看覆盖率');
}
`
  },
  {
    id: "nb-blog-project",
    group: "第五部分：项目实战",
    icon: "📰",
    title: "完整博客API项目实战",
    content: `# 完整博客API项目实战

前面我们学习了Express、中间件、RESTful规范、测试等知识，现在是时候把它们整合起来，做一个**完整的、结构清晰的、可用于生产环境**的博客API项目了！

---

## 一、项目目录结构

好的项目结构让代码易于维护和扩展。我们采用**MVC分层架构**：

\`\`\`
blog-api/
├── package.json
├── app.js                 # 应用入口
├── config/                # 配置
│   └── index.js           # 配置文件（环境变量）
├── models/                # 数据层（Model）
│   ├── User.js            # 用户模型
│   ├── Post.js            # 文章模型
│   └── Comment.js         # 评论模型
├── controllers/           # 控制层（Controller）
│   ├── authController.js  # 认证相关
│   ├── postController.js  # 文章相关
│   └── commentController.js # 评论相关
├── routes/                # 路由层（Routes）
│   ├── index.js           # 路由入口
│   ├── auth.js            # 认证路由
│   ├── posts.js           # 文章路由
│   └── comments.js        # 评论路由
├── middlewares/           # 中间件
│   ├── auth.js            # 认证中间件
│   ├── errorHandler.js    # 错误处理
│   └── validate.js        # 参数校验
├── utils/                 # 工具函数
│   ├── response.js        # 统一响应
│   └── jwt.js             # JWT工具
└── __tests__/             # 测试
    └── api.test.js
\`\`\`

### MVC分层的好处

- **Model（模型）**：负责数据存取、业务逻辑
- **View（视图）**：API项目里就是JSON响应
- **Controller（控制器）**：处理请求，调用Model，返回响应
- **Routes**：只负责URL到Controller的映射，不写业务逻辑

每一层各司其职，修改某一层不影响其他层。

---

## 二、功能清单

我们的博客API包含以下功能：

### 用户系统
- 用户注册（密码加密存储）
- 用户登录（返回JWT）
- 获取当前用户信息

### 文章系统
- 文章CRUD
- 文章列表（分页、排序、过滤、搜索）
- 只有作者本人能编辑/删除文章

### 评论系统
- 对文章发表评论
- 获取文章的评论列表
- 删除评论（作者或评论者本人）

---

## 三、技术栈选型

- **Web框架**：Express
- **密码加密**：bcryptjs
- **身份认证**：jsonwebtoken (JWT)
- **参数校验**：我们自己写简单的（也可以用Joi/Zod）
- **数据库**：内存数组模拟（实际项目用MongoDB/MySQL）
- **测试**：Jest + Supertest
- **环境变量**：dotenv

---

## 四、核心中间件

### 1. 统一响应格式

用工具函数保证所有接口格式一致：
- 成功：\`{ success: true, data, message }\`
- 失败：\`{ success: false, error: { code, message } }\`

### 2. 认证中间件

从Authorization头取出JWT，验证后把用户信息挂到req.user上。

### 3. 错误处理中间件

统一捕获异步错误，用try/catch包装，或者用高阶函数。

### 4. 参数校验中间件

复用校验逻辑，每个路由可以定义自己的校验规则。

---

## 五、项目约定

1. **路由只做映射**：不写业务逻辑，只调用controller
2. **Controller处理请求**：获取参数、调用service/model、返回响应
3. **Model处理数据**：所有数据操作在Model层
4. **异步处理**：所有async函数都要catch错误
5. **状态码**：严格遵循RESTful规范（200/201/204/400/401/403/404/500）
6. **密码**：永远不返回密码字段
7. **分页**：所有列表接口支持page、pageSize参数

---

## 六、JWT认证流程

1. 用户注册/登录，服务器验证账号密码
2. 验证通过，服务器生成JWT（包含用户ID等信息）返回给客户端
3. 客户端后续请求在Authorization头带上：\`Bearer <token>\`
4. 服务器的auth中间件验证token，有效才放行
5. token中不要存敏感信息（密码等），因为它只是Base64编码，不是加密
6. 设置合理的过期时间（如7天）

---

## 七、扩展建议

这个项目结构是生产级项目的起点，你可以在此基础上添加：

1. **真实数据库**：用Mongoose(MongoDB)或Sequelize(MySQL)替换内存数组
2. **输入校验**：用Joi或Zod做更强大的参数校验
3. **日志系统**：用winston或pino记录日志
4. **限流**：用express-rate-limit防止暴力攻击
5. **文件上传**：用multer处理图片上传
6. **配置管理**：用dotenv管理不同环境配置
7. **API文档**：用Swagger/OpenAPI自动生成文档
8. **Docker**：容器化部署
`,
    code: `// ============================================
// 完整博客API项目实战
// 运行方式：将以下代码按文件结构分别保存，然后运行 node app.js
// 这是一个可直接运行的单文件整合版本，展示完整项目结构
// 安装依赖: npm install express bcryptjs jsonwebtoken
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ========== 配置 ==========
const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: '7d',
  port: process.env.PORT || 3000
};

// ========== 工具函数 ==========
const utils = {
  success(res, data, message = '操作成功', code = 200) {
    res.status(code).json({ success: true, data, message });
  },
  created(res, data, message = '创建成功') {
    this.success(res, data, message, 201);
  },
  noContent(res) {
    res.status(204).send();
  },
  error(res, code, message, statusCode = 400, details = null) {
    const body = { success: false, error: { code, message } };
    if (details) body.error.details = details;
    res.status(statusCode).json(body);
  },
  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  },
  asyncHandler(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  }
};

// ========== 模拟数据库（内存存储） ==========
const db = {
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', password: '$2a$10$example', bio: '管理员', createdAt: new Date().toISOString() }
  ],
  posts: [
    { id: 1, title: '欢迎来到博客', content: '这是第一篇文章', authorId: 1, status: 'published', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  comments: [
    { id: 1, postId: 1, authorId: 1, content: '评论功能已开启！', createdAt: new Date().toISOString() }
  ],
  nextUserId: 2,
  nextPostId: 2,
  nextCommentId: 2
};

// 初始化：给admin设置默认密码 (密码是 "admin123")
db.users[0].password = bcrypt.hashSync('admin123', 10);

// ========== 中间件 ==========
const middlewares = {
  auth: utils.asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return utils.error(res, 'UNAUTHORIZED', '请先登录', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = db.users.find(u => u.id === decoded.id);
      if (!user) {
        return utils.error(res, 'UNAUTHORIZED', '用户不存在', 401);
      }
      req.user = { id: user.id, username: user.username, email: user.email };
      next();
    } catch (err) {
      return utils.error(res, 'INVALID_TOKEN', '登录已过期或无效', 401);
    }
  }),
  
  notFound: (req, res) => {
    utils.error(res, 'NOT_FOUND', \`\${req.method} \${req.path} 不存在\`, 404);
  },
  
  errorHandler: (err, req, res, next) => {
    console.error('错误:', err);
    utils.error(res, 'INTERNAL_ERROR', process.env.NODE_ENV === 'production' ? '服务器错误' : err.message, 500);
  }
};

// ========== 控制器 ==========
const controllers = {
  auth: {
    register: utils.asyncHandler(async (req, res) => {
      const { username, email, password, bio } = req.body;
      const errors = [];
      if (!username || username.length < 2) errors.push({ field: 'username', message: '用户名至少2个字符' });
      if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.push({ field: 'email', message: '邮箱格式不正确' });
      if (!password || password.length < 6) errors.push({ field: 'password', message: '密码至少6个字符' });
      if (errors.length > 0) return utils.error(res, 'VALIDATION_ERROR', '参数验证失败', 400, errors);
      
      if (db.users.find(u => u.email === email)) {
        return utils.error(res, 'EMAIL_EXISTS', '该邮箱已被注册', 409);
      }
      if (db.users.find(u => u.username === username)) {
        return utils.error(res, 'USERNAME_EXISTS', '该用户名已被使用', 409);
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: db.nextUserId++,
        username,
        email,
        password: hashedPassword,
        bio: bio || '',
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      
      const token = utils.generateToken(user.id);
      const userResponse = { id: user.id, username: user.username, email: user.email, bio: user.bio };
      utils.created(res, { user: userResponse, token }, '注册成功');
    }),
    
    login: utils.asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return utils.error(res, 'MISSING_FIELDS', '邮箱和密码必填', 400);
      }
      
      const user = db.users.find(u => u.email === email);
      if (!user) {
        return utils.error(res, 'INVALID_CREDENTIALS', '邮箱或密码错误', 401);
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return utils.error(res, 'INVALID_CREDENTIALS', '邮箱或密码错误', 401);
      }
      
      const token = utils.generateToken(user.id);
      const userResponse = { id: user.id, username: user.username, email: user.email, bio: user.bio };
      utils.success(res, { user: userResponse, token }, '登录成功');
    }),
    
    me: utils.asyncHandler(async (req, res) => {
      const user = db.users.find(u => u.id === req.user.id);
      if (!user) {
        return utils.error(res, 'NOT_FOUND', '用户不存在', 404);
      }
      const userResponse = { id: user.id, username: user.username, email: user.email, bio: user.bio, createdAt: user.createdAt };
      utils.success(res, userResponse);
    })
  },
  
  posts: {
    list: utils.asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100);
      const status = req.query.status;
      const authorId = req.query.authorId;
      const keyword = req.query.q;
      
      let result = [...db.posts];
      if (status) result = result.filter(p => p.status === status);
      if (authorId) result = result.filter(p => p.authorId === parseInt(authorId));
      if (keyword) {
        const kw = keyword.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw));
      }
      
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const total = result.length;
      const totalPages = Math.ceil(total / pageSize);
      const paginated = result.slice((page - 1) * pageSize, page * pageSize);
      
      const postsWithAuthor = paginated.map(post => {
        const author = db.users.find(u => u.id === post.authorId);
        return { ...post, author: author ? { id: author.id, username: author.username } : null, password: undefined };
      });
      
      res.json({
        success: true,
        data: postsWithAuthor,
        pagination: { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
      });
    }),
    
    get: utils.asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      const post = db.posts.find(p => p.id === id);
      if (!post) return utils.error(res, 'NOT_FOUND', '文章不存在', 404);
      const author = db.users.find(u => u.id === post.authorId);
      const comments = db.comments.filter(c => c.postId === id).map(c => {
        const cAuthor = db.users.find(u => u.id === c.authorId);
        return { ...c, author: cAuthor ? { id: cAuthor.id, username: cAuthor.username } : null };
      });
      utils.success(res, { ...post, author: author ? { id: author.id, username: author.username } : null, comments });
    }),
    
    create: utils.asyncHandler(async (req, res) => {
      const { title, content, status } = req.body;
      const errors = [];
      if (!title || title.trim().length === 0) errors.push({ field: 'title', message: '标题不能为空' });
      if (!content) errors.push({ field: 'content', message: '内容不能为空' });
      if (status && !['draft', 'published'].includes(status)) errors.push({ field: 'status', message: 'status只能是draft或published' });
      if (errors.length > 0) return utils.error(res, 'VALIDATION_ERROR', '参数验证失败', 400, errors);
      
      const post = {
        id: db.nextPostId++,
        title: title.trim(),
        content,
        authorId: req.user.id,
        status: status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.posts.push(post);
      utils.created(res, post);
    }),
    
    update: utils.asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      const post = db.posts.find(p => p.id === id);
      if (!post) return utils.error(res, 'NOT_FOUND', '文章不存在', 404);
      if (post.authorId !== req.user.id) return utils.error(res, 'FORBIDDEN', '只能编辑自己的文章', 403);
      
      const { title, content, status } = req.body;
      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;
      if (status !== undefined) {
        if (!['draft', 'published'].includes(status)) {
          return utils.error(res, 'VALIDATION_ERROR', 'status只能是draft或published', 400);
        }
        post.status = status;
      }
      post.updatedAt = new Date().toISOString();
      
      utils.success(res, post);
    }),
    
    delete: utils.asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      const index = db.posts.findIndex(p => p.id === id);
      if (index === -1) return utils.error(res, 'NOT_FOUND', '文章不存在', 404);
      if (db.posts[index].authorId !== req.user.id) return utils.error(res, 'FORBIDDEN', '只能删除自己的文章', 403);
      
      db.posts.splice(index, 1);
      db.comments = db.comments.filter(c => c.postId !== id);
      utils.noContent(res);
    })
  },
  
  comments: {
    listByPost: utils.asyncHandler(async (req, res) => {
      const postId = parseInt(req.params.postId);
      const post = db.posts.find(p => p.id === postId);
      if (!post) return utils.error(res, 'NOT_FOUND', '文章不存在', 404);
      
      const comments = db.comments
        .filter(c => c.postId === postId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(c => {
          const author = db.users.find(u => u.id === c.authorId);
          return { ...c, author: author ? { id: author.id, username: author.username } : null };
        });
      
      utils.success(res, comments);
    }),
    
    create: utils.asyncHandler(async (req, res) => {
      const postId = parseInt(req.params.postId);
      const post = db.posts.find(p => p.id === postId);
      if (!post) return utils.error(res, 'NOT_FOUND', '文章不存在', 404);
      
      const { content } = req.body;
      if (!content || content.trim().length === 0) {
        return utils.error(res, 'VALIDATION_ERROR', '评论内容不能为空', 400);
      }
      
      const comment = {
        id: db.nextCommentId++,
        postId,
        authorId: req.user.id,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };
      db.comments.push(comment);
      utils.created(res, comment);
    }),
    
    delete: utils.asyncHandler(async (req, res) => {
      const id = parseInt(req.params.id);
      const comment = db.comments.find(c => c.id === id);
      if (!comment) return utils.error(res, 'NOT_FOUND', '评论不存在', 404);
      
      const post = db.posts.find(p => p.id === comment.postId);
      if (comment.authorId !== req.user.id && (!post || post.authorId !== req.user.id)) {
        return utils.error(res, 'FORBIDDEN', '只能删除自己的评论或自己文章下的评论', 403);
      }
      
      const index = db.comments.findIndex(c => c.id === id);
      db.comments.splice(index, 1);
      utils.noContent(res);
    })
  }
};

// ========== 路由 ==========

// 公开路由（不需要登录）
app.get('/', (req, res) => {
  res.json({
    name: '博客API',
    version: '1.0.0',
    defaultCredentials: { email: 'admin@example.com', password: 'admin123' },
    endpoints: {
      'POST   /api/auth/register': '注册',
      'POST   /api/auth/login': '登录',
      'GET    /api/auth/me': '获取当前用户信息（需要登录）',
      'GET    /api/posts': '文章列表',
      'GET    /api/posts/:id': '文章详情',
      'POST   /api/posts': '创建文章（需要登录）',
      'PUT    /api/posts/:id': '更新文章（作者本人）',
      'DELETE /api/posts/:id': '删除文章（作者本人）',
      'GET    /api/posts/:postId/comments': '文章评论列表',
      'POST   /api/posts/:postId/comments': '发表评论（需要登录）',
      'DELETE /api/comments/:id': '删除评论（评论者或文章作者）'
    }
  });
});

app.post('/api/auth/register', controllers.auth.register);
app.post('/api/auth/login', controllers.auth.login);
app.get('/api/posts', controllers.posts.list);
app.get('/api/posts/:id', controllers.posts.get);
app.get('/api/posts/:postId/comments', controllers.comments.listByPost);

// 需要认证的路由
app.get('/api/auth/me', middlewares.auth, controllers.auth.me);
app.post('/api/posts', middlewares.auth, controllers.posts.create);
app.put('/api/posts/:id', middlewares.auth, controllers.posts.update);
app.delete('/api/posts/:id', middlewares.auth, controllers.posts.delete);
app.post('/api/posts/:postId/comments', middlewares.auth, controllers.comments.create);
app.delete('/api/comments/:id', middlewares.auth, controllers.comments.delete);

// 错误处理
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// ========== 启动服务器 ==========
if (require.main === module) {
  app.listen(config.port, () => {
    console.log('========================================');
    console.log('  📰 博客API服务器已启动！');
    console.log('  📡 http://localhost:' + config.port);
    console.log('========================================');
    console.log('');
    console.log('👤 默认管理员账号：');
    console.log('   邮箱: admin@example.com');
    console.log('   密码: admin123');
    console.log('');
    console.log('🧪 测试流程：');
    console.log('   1. POST /api/auth/login 登录获取token');
    console.log('   2. 其他请求头加 Authorization: Bearer <token>');
    console.log('');
    console.log('📁 项目结构（生产环境建议按文件拆分）：');
    console.log('   config/       - 配置');
    console.log('   models/       - 数据模型');
    console.log('   controllers/  - 控制器');
    console.log('   routes/       - 路由');
    console.log('   middlewares/  - 中间件');
    console.log('   utils/        - 工具函数');
    console.log('   __tests__/    - 测试');
  });
}

module.exports = app;
`
  }
];
