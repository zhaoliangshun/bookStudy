// =============================================================
// Node.js 交互式教程 —— 第五批章节（构建 API 组，共 8 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：路由设计
  // =========================================================
  {
    id: "node-router",
    group: "构建 API",
    icon: "🧭",
    title: "路由设计",
    content: `## 路由设计

路由是 Web API 的核心骨架，它决定了客户端请求如何映射到具体的处理函数。一个好的路由设计不仅让 API 结构清晰，还直接影响代码的可维护性和扩展性。

### 路由匹配原理

路由的本质是**路径 + HTTP 方法**的组合匹配。当一个请求到达时，路由系统需要回答两个问题：

1. 这个请求的 URL 路径匹配哪个路由规则？
2. 这个请求的 HTTP 方法（GET/POST/PUT/DELETE）匹配哪个处理函数？

**基本匹配流程**：

\`\`\`
请求: GET /api/users/123
  │
  ├─ 1. 提取路径: /api/users/123
  ├─ 2. 提取方法: GET
  ├─ 3. 遍历路由表，匹配路径模式
  ├─ 4. 提取路径参数: { id: "123" }
  ├─ 5. 解析查询参数: ?page=1&limit=10
  └─ 6. 调用对应的处理函数
\`\`\`

### 路径参数提取

路径参数是 URL 路径中的动态部分，通常用 \`:paramName\` 或 \`{paramName}\` 表示。例如：

| 路由模式 | 匹配 URL | 提取的参数 |
| --- | --- | --- |
| \`/users/:id\` | \`/users/42\` | \`{ id: "42" }\` |
| \`/users/:userId/posts/:postId\` | \`/users/42/posts/8\` | \`{ userId: "42", postId: "8" }\` |
| \`/files/:category/*\` | \`/files/image/2024/photo.jpg\` | \`{ category: "image", "*": "2024/photo.jpg" }\` |

**路径参数 vs 查询参数**：

| 特性 | 路径参数 | 查询参数 |
| --- | --- | --- |
| 位置 | URL 路径中 | \`?\` 之后 |
| 用途 | 标识资源 | 过滤、排序、分页 |
| 是否必填 | 通常必填 | 通常可选 |
| 示例 | \`/users/123\` | \`/users?page=1&limit=10\` |

### RESTful 路由设计

RESTful API 遵循资源导向的设计原则，使用标准的 HTTP 方法来操作资源：

| HTTP 方法 | 路径 | 操作 | 说明 |
| --- | --- | --- | --- |
| \`GET\` | \`/users\` | 列表 | 获取用户列表 |
| \`GET\` | \`/users/:id\` | 详情 | 获取单个用户 |
| \`POST\` | \`/users\` | 创建 | 创建新用户 |
| \`PUT\` | \`/users/:id\` | 完整更新 | 替换整个用户资源 |
| \`PATCH\` | \`/users/:id\` | 部分更新 | 更新用户的部分字段 |
| \`DELETE\` | \`/users/:id\` | 删除 | 删除用户 |

**RESTful 设计原则**：

1. **资源用名词复数**：\`/users\` 而非 \`/getUsers\` 或 \`/user\`
2. **层级关系用路径表示**：\`/users/:id/posts\` 表示用户的帖子
3. **动作用 HTTP 方法表示**：不要用 \`/users/create\`，用 \`POST /users\`
4. **过滤、排序、分页用查询参数**：\`/users?page=1&limit=10&sort=name\`

### 路由分组

当 API 规模变大时，按功能模块对路由进行分组是非常必要的。常见的分组方式：

- **按资源分组**：用户模块、订单模块、商品模块
- **按版本分组**：v1、v2
- **按功能分组**：公开 API、管理后台 API

\`\`\`javascript
// 路由分组示例
const router = new Router();

// 用户模块路由组
router.group('/users', (userRouter) => {
  userRouter.get('/', listUsers);
  userRouter.get('/:id', getUser);
  userRouter.post('/', createUser);
});

// 订单模块路由组
router.group('/orders', (orderRouter) => {
  orderRouter.get('/', listOrders);
  orderRouter.post('/', createOrder);
});
\`\`\`

### 404 处理

当请求的 URL 无法匹配任何路由规则时，应该返回 404 响应。404 处理应该作为路由表的"兜底"规则，放在所有路由定义之后：

\`\`\`javascript
// 所有路由定义之后
router.use((req, res) => {
  res.statusCode = 404;
  res.end(JSON.stringify({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  }));
});
\`\`\`

### 路由优先级

路由匹配通常按照**定义顺序**进行，先定义先匹配。因此需要注意：

1. **静态路由优先于动态路由**：\`/users/me\` 应该在 \`/users/:id\` 之前定义
2. **具体路由优先于通配路由**：\`/api/users\` 应该在 \`/api/*\` 之前定义
3. **404 路由放在最后**：确保所有路由都尝试匹配后再返回 404

下面这段代码实现了一个完整的路由匹配器，支持路径参数、不同 HTTP 方法、路由分组和 404 处理。`,
    code: `// ============================================================
// 第一章代码演示：路由匹配器实现
// ============================================================
const url = require("url");

// ---- 模拟请求对象 ----
function createRequest(method, path, body) {
  return {
    method: method.toUpperCase(),
    path: path,
    body: body || null,
    params: {},
    query: {},
    headers: { "content-type": "application/json" },
  };
}

// ---- 模拟响应对象 ----
function createResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    json: function (data) {
      this.body = JSON.stringify(data);
      this.headers["content-type"] = "application/json";
      return this;
    },
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    end: function (data) {
      if (data) this.body = data;
      return this;
    },
  };
}

// ---- 1. 路由匹配器实现 ----
console.log("===== 1. 路由匹配器实现 =====");

class Router {
  constructor() {
    // 路由表：存储所有注册的路由
    this.routes = [];
    // 全局中间件
    this.middlewares = [];
    // 路由前缀
    this.prefix = "";
  }

  // 注册路由（支持多种 HTTP 方法）
  register(method, pattern, handler) {
    // 将路径参数占位符 :param 转换为正则表达式捕获组
    const paramNames = [];
    const regexPattern = pattern
      .replace(/\\/:([^/]+)/g, function (_, name) {
        paramNames.push(name);
        return "/([^/]+)";
      })
      .replace(/\\*/g, "(.*)");

    const regex = new RegExp("^" + regexPattern + "$");
    this.routes.push({
      method: method.toUpperCase(),
      pattern: pattern,
      regex: regex,
      paramNames: paramNames,
      handler: handler,
    });
    return this;
  }

  // 便捷方法
  get(pattern, handler) { return this.register("GET", pattern, handler); }
  post(pattern, handler) { return this.register("POST", pattern, handler); }
  put(pattern, handler) { return this.register("PUT", pattern, handler); }
  patch(pattern, handler) { return this.register("PATCH", pattern, handler); }
  delete(pattern, handler) { return this.register("DELETE", pattern, handler); }

  // 路由分组
  group(prefix, callback) {
    const subRouter = new Router();
    subRouter.prefix = this.prefix + prefix;
    callback(subRouter);
    // 将子路由合并到当前路由表
    subRouter.routes.forEach(function (route) {
      this.routes.push({
        method: route.method,
        pattern: subRouter.prefix + route.pattern,
        regex: new RegExp("^" + subRouter.prefix.replace(/\\//g, "\\\\/") +
          route.regex.source.slice(1)),
        paramNames: route.paramNames,
        handler: route.handler,
      });
    }.bind(this));
    return this;
  }

  // 添加全局中间件
  use(handler) {
    this.middlewares.push(handler);
    return this;
  }

  // 处理请求
  handle(req, res) {
    // 解析查询参数
    const parsedUrl = url.parse(req.path, true);
    req.query = parsedUrl.query;
    const pathname = parsedUrl.pathname;

    // 匹配路由
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const match = pathname.match(route.regex);

      if (match && req.method === route.method) {
        // 提取路径参数
        req.params = {};
        for (let j = 0; j < route.paramNames.length; j++) {
          req.params[route.paramNames[j]] = match[j + 1];
        }
        // 执行处理函数
        route.handler(req, res);
        return;
      }
    }

    // 404 处理
    res.status(404).json({
      error: "Not Found",
      message: "路径 " + pathname + " 未找到匹配的路由",
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // 列出所有注册的路由
  listRoutes() {
    console.log("\\n已注册的路由列表:");
    this.routes.forEach(function (route, index) {
      console.log("  " + (index + 1) + ". [" + route.method + "] " + route.pattern);
    });
    console.log("共 " + this.routes.length + " 条路由");
  }
}

// ---- 2. 创建路由并注册 ----
console.log("\\n===== 2. 注册路由 =====");

const router = new Router();

// 注册用户相关路由
router.get("/users", function (req, res) {
  res.json({
    data: [
      { id: 1, name: "张三", email: "zhangsan@example.com" },
      { id: 2, name: "李四", email: "lisi@example.com" },
    ],
    total: 2,
    page: parseInt(req.query.page) || 1,
  });
});

router.get("/users/:id", function (req, res) {
  res.json({
    data: { id: parseInt(req.params.id), name: "张三", email: "zhangsan@example.com" },
  });
});

router.post("/users", function (req, res) {
  res.status(201).json({
    message: "用户创建成功",
    data: { id: 3, name: req.body ? req.body.name : "新用户" },
  });
});

router.put("/users/:id", function (req, res) {
  res.json({
    message: "用户更新成功",
    data: { id: parseInt(req.params.id), name: "更新后的名字" },
  });
});

router.delete("/users/:id", function (req, res) {
  res.json({
    message: "用户 ID " + req.params.id + " 已删除",
  });
});

// 注册产品相关路由
router.get("/products", function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  res.json({
    data: [
      { id: 1, name: "商品A", price: 99.9 },
      { id: 2, name: "商品B", price: 199.9 },
    ],
    page: page,
    limit: limit,
  });
});

// 路由分组演示
router.group("/admin", function (adminRouter) {
  adminRouter.get("/dashboard", function (req, res) {
    res.json({ stats: { users: 100, orders: 500, revenue: 50000 } });
  });
  adminRouter.get("/users", function (req, res) {
    res.json({ data: [], message: "管理后台用户列表" });
  });
});

// 显示路由表
router.listRoutes();

// ---- 3. 测试路由匹配 ----
console.log("\\n===== 3. 测试路由匹配 =====");

function testRoute(method, path, body) {
  const req = createRequest(method, path, body);
  const res = createResponse();
  router.handle(req, res);

  console.log("\\n--- " + method + " " + path + " ---");
  console.log("状态码: " + res.statusCode);
  if (req.params && Object.keys(req.params).length > 0) {
    console.log("路径参数: " + JSON.stringify(req.params));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("查询参数: " + JSON.stringify(req.query));
  }
  if (res.body) {
    const bodyStr = res.body.length > 200
      ? res.body.slice(0, 200) + "..."
      : res.body;
    console.log("响应体: " + bodyStr);
  }
}

// 测试各种路由场景
testRoute("GET", "/users");
testRoute("GET", "/users/42");
testRoute("GET", "/users?page=2&limit=20");
testRoute("POST", "/users", { name: "王五", email: "wangwu@example.com" });
testRoute("PUT", "/users/42");
testRoute("DELETE", "/users/42");
testRoute("GET", "/products?page=1&limit=5");
testRoute("GET", "/admin/dashboard");
testRoute("GET", "/admin/users");

// 404 测试
testRoute("GET", "/nonexistent");
testRoute("POST", "/users/42"); // 没有注册 POST /users/:id

// ---- 4. 路径参数提取详解 ----
console.log("\\n===== 4. 路径参数提取详解 =====");

// 注册嵌套路径参数路由
const detailRouter = new Router();
detailRouter.get("/posts/:postId/comments/:commentId", function (req, res) {
  res.json({
    postId: req.params.postId,
    commentId: req.params.commentId,
    message: "获取评论详情",
  });
});

console.log("测试嵌套路径参数:");
const req1 = createRequest("GET", "/posts/100/comments/5");
const res1 = createResponse();
detailRouter.handle(req1, res1);
console.log("请求: GET /posts/100/comments/5");
console.log("响应: " + res1.body);
console.log("提取的参数: " + JSON.stringify(req1.params));

// ---- 5. RESTful 路由设计总结 ----
console.log("\\n===== 5. RESTful 路由设计最佳实践 =====");

const restfulExamples = [
  { method: "GET", path: "/resources", desc: "获取资源列表" },
  { method: "GET", path: "/resources/:id", desc: "获取单个资源" },
  { method: "POST", path: "/resources", desc: "创建新资源" },
  { method: "PUT", path: "/resources/:id", desc: "完整更新资源" },
  { method: "PATCH", path: "/resources/:id", desc: "部分更新资源" },
  { method: "DELETE", path: "/resources/:id", desc: "删除资源" },
  { method: "GET", path: "/resources/:id/sub", desc: "获取子资源列表" },
];

console.log("标准 RESTful API 设计:");
restfulExamples.forEach(function (r) {
  console.log("  " + r.method.padEnd(7) + " " + r.path.padEnd(25) + " → " + r.desc);
});

console.log("\\n===== 路由设计演示完成 =====");`,
  },

  // =========================================================
  // 第二章：中间件模式
  // =========================================================
  {
    id: "node-middleware",
    group: "构建 API",
    icon: "🔗",
    title: "中间件模式",
    content: `## 中间件模式

中间件是 Node.js Web 框架（如 Express、Koa）的核心设计模式。它允许你将请求处理流程拆分为一系列可组合、可复用的函数，每个函数都可以访问请求对象、响应对象以及流程中的下一个中间件。

### 中间件概念

中间件本质上是一个函数，它接收请求上下文并决定是继续传递还是终止请求。中间件可以执行以下操作：

- 执行任何代码
- 修改请求和响应对象
- 调用下一个中间件
- 终止请求-响应循环
- 捕获并处理错误

**基本中间件签名**：

\`\`\`javascript
// Express 风格中间件
function middleware(req, res, next) {
  // 1. 处理请求前逻辑
  console.log(\`\${req.method} \${req.path}\`);

  // 2. 调用下一个中间件
  next();

  // 3. 处理响应后逻辑（洋葱模型的下半部分）
  console.log(\`响应状态码: \${res.statusCode}\`);
}
\`\`\`

### 洋葱模型

中间件的执行顺序遵循**洋葱模型**：请求从外向内穿过每一层中间件，到达核心处理函数后再从内向外穿过每一层返回。每一层中间件可以在请求进入时和响应离开时执行代码。

\`\`\`
请求 →  [中间件1] → [中间件2] → [中间件3] → [核心处理]
       ↓                                    ↓
响应 ←  [中间件1] ← [中间件2] ← [中间件3] ← [核心处理]
\`\`\`

\`\`\`javascript
// 洋葱模型示例
app.use(async (ctx, next) => {
  console.log('1. 进入中间件1');
  await next();
  console.log('6. 离开中间件1');
});

app.use(async (ctx, next) => {
  console.log('2. 进入中间件2');
  await next();
  console.log('5. 离开中间件2');
});

app.use(async (ctx, next) => {
  console.log('3. 进入中间件3');
  await next();
  console.log('4. 离开中间件3');
});

// 输出顺序：1 → 2 → 3 → 4 → 5 → 6
\`\`\`

### next 函数

\`next\` 函数是中间件模式的关键。调用 \`next()\` 会将控制权传递给下一个中间件。如果不在中间件中调用 \`next()\`，请求处理流程就会终止。

**next 的几种用法**：

| 用法 | 说明 |
| --- | --- |
| \`next()\` | 传递给下一个中间件 |
| \`next(err)\` | 传递错误给错误处理中间件 |
| \`next('route')\` | 跳过当前路由的剩余中间件（Express 特有） |
| 不调用 \`next()\` | 终止请求处理流程 |

### 中间件顺序

中间件的注册顺序决定了执行顺序，这一点非常重要：

1. **错误处理中间件应该最后注册**：它需要捕获前面所有中间件的错误
2. **日志中间件应该最先注册**：记录所有请求
3. **认证中间件应该在业务逻辑之前**：保护需要认证的路由
4. **静态文件中间件通常靠前**：避免不必要的处理

### 常见中间件类型

| 中间件类型 | 功能 | 位置 |
| --- | --- | --- |
| **Logger** | 记录请求日志（方法、路径、耗时） | 最前面 |
| **CORS** | 处理跨域请求 | 靠前 |
| **Body Parser** | 解析请求体（JSON、表单等） | 认证之前 |
| **Auth** | 身份认证和授权 | 业务逻辑之前 |
| **Validator** | 请求参数验证 | 业务逻辑之前 |
| **Error Handler** | 统一错误处理 | 最后面 |

### Express vs Koa 中间件对比

| 特性 | Express | Koa |
| --- | --- | --- |
| 中间件签名 | \`(req, res, next)\` | \`(ctx, next)\` |
| 异步处理 | 回调风格 | async/await |
| 洋葱模型 | 部分支持 | 完整支持 |
| 响应发送 | \`res.send()\` | \`ctx.body = ...\` |
| 错误处理 | \`(err, req, res, next)\` | \`try-catch\` 或错误中间件 |

下面这段代码实现了完整的中间件管道，支持洋葱模型执行和错误处理中间件。`,
    code: `// ============================================================
// 第二章代码演示：中间件管道实现
// ============================================================

// ---- 模拟请求上下文 ----
function createContext(method, path, body) {
  return {
    req: {
      method: method,
      path: path,
      body: body || null,
      params: {},
      query: {},
      headers: {},
      startTime: Date.now(),
    },
    res: {
      statusCode: 200,
      body: null,
      headers: {},
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.body = JSON.stringify(data);
        this.headers["content-type"] = "application/json";
        return this;
      },
      end: function (data) {
        this.body = data;
        return this;
      },
    },
    state: {}, // 中间件之间共享状态
    throw: function (statusCode, message) {
      const err = new Error(message);
      err.statusCode = statusCode;
      throw err;
    },
  };
}

// ---- 1. 中间件管道实现（洋葱模型）----
console.log("===== 1. 中间件管道实现 =====");

class MiddlewarePipeline {
  constructor() {
    // 普通中间件栈
    this.middlewares = [];
    // 错误处理中间件栈
    this.errorMiddlewares = [];
  }

  // 注册普通中间件
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  // 注册错误处理中间件
  catch(fn) {
    this.errorMiddlewares.push(fn);
    return this;
  }

  // 组合中间件（洋葱模型核心）
  compose(middlewares, ctx) {
    let index = -1;

    const dispatch = function (i) {
      // 防止多次调用 next
      if (i <= index) {
        return Promise.reject(new Error("next() 被多次调用"));
      }
      index = i;

      if (i >= middlewares.length) {
        return Promise.resolve();
      }

      const fn = middlewares[i];
      try {
        return Promise.resolve(fn(ctx, function next() {
          return dispatch(i + 1);
        }));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return dispatch(0);
  }

  // 执行管道
  async execute(ctx) {
    try {
      // 执行普通中间件链
      await this.compose(this.middlewares, ctx);
      return ctx;
    } catch (err) {
      // 使用错误中间件链处理错误
      ctx.error = err;
      ctx.res.statusCode = err.statusCode || 500;

      // 构建带错误信息的上下文
      const errorCtx = Object.assign({}, ctx, {
        error: err,
        message: err.message,
        statusCode: err.statusCode || 500,
      });

      // 执行错误中间件
      for (let i = 0; i < this.errorMiddlewares.length; i++) {
        try {
          await this.errorMiddlewares[i](errorCtx, err);
        } catch (e) {
          console.error("错误处理中间件自身出错:", e.message);
        }
      }

      return ctx;
    }
  }
}

// ---- 2. 创建中间件管道并注册中间件 ----
console.log("\\n===== 2. 注册中间件 =====");

const app = new MiddlewarePipeline();

// 中间件 1：Logger —— 记录请求信息
app.use(async function logger(ctx, next) {
  const start = Date.now();
  console.log("  [Logger 进入] " + ctx.req.method + " " + ctx.req.path);

  await next(); // 进入下一层

  const duration = Date.now() - start;
  console.log("  [Logger 离开] " + ctx.req.method + " " + ctx.req.path +
    " → " + ctx.res.statusCode + " (" + duration + "ms)");
});

// 中间件 2：CORS —— 处理跨域（模拟）
app.use(async function cors(ctx, next) {
  console.log("  [CORS 进入] 设置跨域头");
  ctx.res.headers["Access-Control-Allow-Origin"] = "*";
  ctx.res.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE";
  ctx.res.headers["Access-Control-Allow-Headers"] = "Content-Type";

  await next();

  console.log("  [CORS 离开]");
});

// 中间件 3：Body Parser —— 解析请求体
app.use(async function bodyParser(ctx, next) {
  console.log("  [BodyParser 进入] 解析请求体");
  if (ctx.req.body) {
    try {
      ctx.req.body = typeof ctx.req.body === "string"
        ? JSON.parse(ctx.req.body)
        : ctx.req.body;
    } catch (e) {
      ctx.throw(400, "请求体 JSON 格式无效");
    }
  }
  await next();
  console.log("  [BodyParser 离开]");
});

// 中间件 4：认证中间件
app.use(async function auth(ctx, next) {
  console.log("  [Auth 进入] 检查认证");
  const token = ctx.req.headers.authorization;
  if (!token) {
    ctx.state.user = null;
    console.log("  [Auth] 未提供认证令牌，以匿名用户继续");
  } else {
    ctx.state.user = { id: 1, name: "认证用户", role: "user" };
    console.log("  [Auth] 用户已认证: " + ctx.state.user.name);
  }
  await next();
  console.log("  [Auth 离开]");
});

// 中间件 5：核心业务处理
app.use(async function businessHandler(ctx, next) {
  console.log("  [Business 进入] 执行业务逻辑");

  // 模拟业务逻辑
  if (ctx.req.path === "/api/users" && ctx.req.method === "GET") {
    ctx.res.json({
      data: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ],
      user: ctx.state.user,
    });
  } else if (ctx.req.path === "/api/error") {
    ctx.throw(500, "模拟业务错误");
  } else if (ctx.req.path === "/api/notfound") {
    ctx.throw(404, "资源未找到");
  } else {
    ctx.res.json({ message: "请求已处理", path: ctx.req.path });
  }

  await next();
  console.log("  [Business 离开]");
});

// ---- 3. 注册错误处理中间件 ----
console.log("\\n===== 3. 注册错误处理中间件 =====");

// 错误处理中间件 1：日志记录
app.catch(async function errorLogger(ctx, err) {
  console.log("  [ErrorLogger] 记录错误: " + err.message);
});

// 错误处理中间件 2：统一错误响应格式
app.catch(async function errorResponder(ctx, err) {
  const statusCode = err.statusCode || 500;
  ctx.res.status(statusCode).json({
    error: {
      message: err.message,
      code: statusCode,
      timestamp: new Date().toISOString(),
    },
  });
  console.log("  [ErrorResponder] 返回错误响应: " + statusCode);
});

// ---- 4. 测试中间件管道 ----
console.log("\\n===== 4. 测试中间件管道 =====");

async function testRequest(label, method, path, body, headers) {
  console.log("\\n--- " + label + " ---");
  const ctx = createContext(method, path, body);
  if (headers) {
    Object.assign(ctx.req.headers, headers);
  }
  await app.execute(ctx);
  if (ctx.res.body) {
    const bodyStr = ctx.res.body.length > 300
      ? ctx.res.body.slice(0, 300) + "..."
      : ctx.res.body;
    console.log("  最终响应: " + bodyStr);
  }
  console.log("  状态码: " + ctx.res.statusCode);
  console.log("  state: " + JSON.stringify(ctx.state));
}

// 测试正常请求
testRequest("正常 GET 请求", "GET", "/api/users", null);

// 测试带认证的请求
testRequest("带认证令牌的请求", "GET", "/api/users", null, {
  authorization: "Bearer token123",
});

// 测试 POST 请求（带请求体）
testRequest("POST 请求（带 JSON 体）", "POST", "/api/data",
  JSON.stringify({ name: "test", value: 42 }));

// 测试错误场景
testRequest("业务错误", "GET", "/api/error", null);

// 测试 404
testRequest("资源未找到", "GET", "/api/notfound", null);

// 测试无效 JSON
testRequest("无效 JSON 请求体", "POST", "/api/data", "{invalid json}");

// ---- 5. 洋葱模型执行顺序演示 ----
console.log("\\n===== 5. 洋葱模型执行顺序 =====");

const onionApp = new MiddlewarePipeline();

onionApp.use(async function layer1(ctx, next) {
  console.log("  1. 进入 第1层");
  await next();
  console.log("  8. 离开 第1层");
});

onionApp.use(async function layer2(ctx, next) {
  console.log("  2. 进入 第2层");
  await next();
  console.log("  7. 离开 第2层");
});

onionApp.use(async function layer3(ctx, next) {
  console.log("  3. 进入 第3层");
  await next();
  console.log("  6. 离开 第3层");
});

onionApp.use(async function core(ctx, next) {
  console.log("  4. 进入 核心处理");
  ctx.res.json({ message: "核心处理完成" });
  await next();
  console.log("  5. 离开 核心处理");
});

console.log("\\n洋葱模型执行顺序:");
const onionCtx = createContext("GET", "/test");
onionApp.execute(onionCtx);

console.log("\\n执行顺序: 1→2→3→4→5→6→7→8 (层层进入，层层返回)");

// ---- 6. Express vs Koa 中间件对比 ----
console.log("\\n===== 6. Express vs Koa 中间件对比 =====");

console.log("| 特性           | Express              | Koa                  |");
console.log("|----------------|----------------------|----------------------|");
console.log("| 中间件签名     | (req, res, next)     | (ctx, next)          |");
console.log("| 异步处理       | 回调风格             | async/await          |");
console.log("| 洋葱模型       | 部分支持             | 完整支持             |");
console.log("| 错误处理       | (err,req,res,next)   | try-catch            |");
console.log("| 响应发送       | res.send()/res.json()| ctx.body = ...       |");

console.log("\\n===== 中间件模式演示完成 =====");`,
  },

  // =========================================================
  // 第三章：请求参数解析
  // =========================================================
  {
    id: "node-request-parse",
    group: "构建 API",
    icon: "📥",
    title: "请求参数解析",
    content: `## 请求参数解析

请求参数解析是 API 开发中最基础也最频繁的操作。客户端可以通过多种方式向服务端传递参数：URL 路径参数、查询参数、请求头以及请求体。正确解析和验证这些参数是构建健壮 API 的第一步。

### 参数来源分类

| 参数来源 | 位置 | 示例 | 典型用途 |
| --- | --- | --- | --- |
| **路径参数** | URL 路径中 | \`/users/:id\` → \`id: 123\` | 资源标识 |
| **查询参数** | URL \`?\` 之后 | \`?page=1&limit=10\` | 过滤、排序、分页 |
| **请求体** | HTTP Body | \`{"name": "张三"}\` | 创建/更新数据 |
| **请求头** | HTTP Headers | \`Authorization: Bearer ...\` | 认证、内容协商 |

### 查询参数解析（Query String）

查询参数是通过 URL 中的 \`?\` 传递的键值对，多个参数之间用 \`&\` 分隔。

**Node.js 内置解析方式**：

\`\`\`javascript
const url = require('url');

// 完整 URL 解析
const parsed = url.parse('/users?page=1&limit=10&sort=name', true);
console.log(parsed.query); // { page: '1', limit: '10', sort: 'name' }

// URLSearchParams 方式（推荐）
const params = new URLSearchParams('page=1&limit=10&sort=name');
params.get('page');  // '1'
params.has('sort');  // true
params.getAll('tag'); // 获取同名参数的所有值
\`\`\`

**查询参数的类型转换**：

查询参数的值始终是字符串，需要手动转换：

\`\`\`javascript
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 10, 100);
const isActive = req.query.active === 'true';
const date = req.query.date ? new Date(req.query.date) : null;
\`\`\`

### 请求体解析

请求体可以通过多种格式发送，最常见的是 JSON 和 URL 编码格式。

**JSON 格式（application/json）**：

\`\`\`javascript
// Content-Type: application/json
// Body: {"name": "张三", "age": 30}

function parseJsonBody(body) {
  try {
    return JSON.parse(body);
  } catch (err) {
    throw new Error('无效的 JSON 格式');
  }
}
\`\`\`

**URL 编码格式（application/x-www-form-urlencoded）**：

\`\`\`javascript
const querystring = require('querystring');

// Content-Type: application/x-www-form-urlencoded
// Body: name=%E5%BC%A0%E4%B8%89&age=30

function parseUrlEncodedBody(body) {
  return querystring.parse(body);
}
// 结果: { name: '张三', age: '30' }
\`\`\`

**multipart/form-data 格式**：

用于文件上传，格式更复杂，需要使用专门的解析器。数据由 boundary 分隔符分隔，每个部分可以包含文件和普通字段。

### Content-Type 判断

在解析请求体之前，必须先检查 Content-Type 请求头，以确定使用哪种解析方式：

| Content-Type | 解析方式 | 说明 |
| --- | --- | --- |
| \`application/json\` | \`JSON.parse()\` | JSON 数据 |
| \`application/x-www-form-urlencoded\` | \`querystring.parse()\` | 表单数据 |
| \`multipart/form-data\` | 特殊解析器 | 文件上传 |
| \`text/plain\` | 直接读取 | 纯文本 |
| \`application/xml\` | XML 解析器 | XML 数据 |

### 请求头读取

请求头包含大量元信息，对 API 开发至关重要：

| 请求头 | 说明 | 示例 |
| --- | --- | --- |
| \`Content-Type\` | 请求体的媒体类型 | \`application/json\` |
| \`Authorization\` | 认证凭据 | \`Bearer eyJhbG...\` |
| \`Accept\` | 客户端期望的响应格式 | \`application/json\` |
| \`User-Agent\` | 客户端标识 | \`Mozilla/5.0 ...\` |
| \`Accept-Language\` | 期望的语言 | \`zh-CN,zh;q=0.9\` |
| \`X-Request-ID\` | 请求追踪 ID | \`550e8400-e29b-...\` |
| \`X-Forwarded-For\` | 原始客户端 IP | \`192.168.1.1\` |

### 参数验证基础

解析参数后，验证是必不可少的步骤：

1. **必填字段检查**：确保关键参数存在
2. **类型检查**：确保参数是期望的类型
3. **格式检查**：如邮箱格式、手机号格式
4. **范围检查**：如数值范围、字符串长度
5. **业务规则检查**：如唯一性、关联性

下面这段代码实现了完整的请求参数解析器，支持 JSON 和 URL 编码的请求体解析。`,
    code: `// ============================================================
// 第三章代码演示：请求参数解析器实现
// ============================================================
const url = require("url");
const querystring = require("querystring");

// ---- 1. 查询参数解析 ----
console.log("===== 1. 查询参数解析 =====");

// 方式 1：使用 url.parse
const parsed1 = url.parse("/users?page=1&limit=10&sort=name&active=true&tags=a&tags=b", true);
console.log("url.parse 解析结果:");
console.log(JSON.stringify(parsed1.query, null, 2));

// 方式 2：使用 URLSearchParams
const urlStr = "https://example.com/api/users?page=2&limit=20&sort=name&active=true";
const searchParams = new URLSearchParams(urlStr.split("?")[1] || "");
console.log("\\nURLSearchParams 解析:");
console.log("  page: " + searchParams.get("page"));
console.log("  limit: " + searchParams.get("limit"));
console.log("  sort: " + searchParams.get("sort"));
console.log("  active: " + searchParams.get("active"));
console.log("  has('sort'): " + searchParams.has("sort"));
console.log("  has('nonexist'): " + searchParams.has("nonexist"));

// 遍历所有参数
console.log("\\n遍历所有查询参数:");
searchParams.forEach(function (value, key) {
  console.log("  " + key + " = " + value);
});

// ---- 2. 查询参数类型转换 ----
console.log("\\n===== 2. 查询参数类型转换 =====");

// 查询参数的值始终是字符串，需要手动转换
function parseQueryParams(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};

  params.forEach(function (value, key) {
    // 尝试转换为数字
    if (/^\\d+$/.test(value)) {
      result[key] = parseInt(value);
    }
    // 尝试转换为布尔值
    else if (value === "true" || value === "false") {
      result[key] = value === "true";
    }
    // 尝试转换为日期
    else if (/^\\d{4}-\\d{2}-\\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        result[key] = date;
      } else {
        result[key] = value;
      }
    }
    // 保持为字符串
    else {
      result[key] = value;
    }
  });

  return result;
}

const testQuery = "page=3&limit=50&active=true&sort=name&date=2024-01-15&name=test";
const parsedQuery = parseQueryParams(testQuery);
console.log("原始查询串: " + testQuery);
console.log("解析并转换后:");
console.log(JSON.stringify(parsedQuery, null, 2));
console.log("  page 类型: " + typeof parsedQuery.page);
console.log("  active 类型: " + typeof parsedQuery.active);
console.log("  date 类型: " + (parsedQuery.date instanceof Date ? "Date" : typeof parsedQuery.date));

// ---- 3. JSON 请求体解析 ----
console.log("\\n===== 3. JSON 请求体解析 =====");

function parseJsonBody(body) {
  if (!body) return null;
  if (typeof body === "object") return body;

  try {
    const parsed = JSON.parse(body);
    return parsed;
  } catch (err) {
    throw new Error("请求体 JSON 格式无效: " + err.message);
  }
}

// 测试有效 JSON
const jsonBody1 = '{"name":"张三","age":30,"email":"zhangsan@example.com","hobbies":["阅读","编程"]}';
try {
  const result = parseJsonBody(jsonBody1);
  console.log("有效 JSON 解析:");
  console.log(JSON.stringify(result, null, 2));
  console.log("  name 类型: " + typeof result.name);
  console.log("  age 类型: " + typeof result.age);
  console.log("  hobbies 类型: " + Array.isArray(result.hobbies));
} catch (err) {
  console.log("解析错误: " + err.message);
}

// 测试无效 JSON
const jsonBody2 = '{name: 张三, age: 30}'; // 无效的 JSON
try {
  parseJsonBody(jsonBody2);
} catch (err) {
  console.log("\\n无效 JSON 解析:");
  console.log("  错误: " + err.message);
}

// 测试已解析的对象
const jsonBody3 = { name: "李四", age: 25 };
try {
  const result = parseJsonBody(jsonBody3);
  console.log("\\n已解析对象:");
  console.log(JSON.stringify(result));
} catch (err) {
  console.log("错误: " + err.message);
}

// ---- 4. URL 编码请求体解析 ----
console.log("\\n===== 4. URL 编码请求体解析 =====");

function parseUrlEncodedBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;

  const parsed = querystring.parse(body);
  // 类型转换
  const result = {};
  for (const key in parsed) {
    const value = parsed[key];
    if (/^\\d+$/.test(value)) {
      result[key] = parseInt(value);
    } else if (value === "true" || value === "false") {
      result[key] = value === "true";
    } else {
      result[key] = value;
    }
  }
  return result;
}

// 测试 URL 编码数据
const urlEncodedBody = "name=%E5%BC%A0%E4%B8%89&age=30&city=%E5%8C%97%E4%BA%AC&active=true";
const urlEncodedResult = parseUrlEncodedBody(urlEncodedBody);
console.log("原始 URL 编码数据: " + urlEncodedBody);
console.log("解析结果:");
console.log(JSON.stringify(urlEncodedResult, null, 2));
console.log("  age 类型: " + typeof urlEncodedResult.age);

// 测试空数据和已解析对象
console.log("\\n空数据: " + JSON.stringify(parseUrlEncodedBody(null)));
console.log("已解析对象: " + JSON.stringify(parseUrlEncodedBody({ a: 1 })));

// ---- 5. 统一的请求参数解析器 ----
console.log("\\n===== 5. 统一请求参数解析器 =====");

class RequestParser {
  constructor() {
    // 支持的 Content-Type 与解析器映射
    this.parsers = {
      "application/json": this.parseJson,
      "application/x-www-form-urlencoded": this.parseUrlEncoded,
      "text/plain": this.parseText,
    };
  }

  // 解析 JSON
  parseJson(body) {
    try {
      return JSON.parse(body);
    } catch (err) {
      throw new Error("JSON 解析失败: " + err.message);
    }
  }

  // 解析 URL 编码
  parseUrlEncoded(body) {
    const parsed = querystring.parse(body);
    const result = {};
    for (const key in parsed) {
      result[key] = this.autoConvertType(parsed[key]);
    }
    return result;
  }

  // 解析纯文本
  parseText(body) {
    return { text: body };
  }

  // 自动类型转换
  autoConvertType(value) {
    if (/^\\d+$/.test(value)) return parseInt(value);
    if (/^\\d+\\.\\d+$/.test(value)) return parseFloat(value);
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null;
    return value;
  }

  // 根据 Content-Type 解析请求体
  parse(body, contentType) {
    if (!body) return {};

    // 如果已经是对象，直接返回
    if (typeof body === "object" && !Buffer.isBuffer(body)) {
      return body;
    }

    // 提取 Content-Type（去除 charset 等参数）
    const cleanType = (contentType || "application/json").split(";")[0].trim();

    const parser = this.parsers[cleanType];
    if (!parser) {
      throw new Error("不支持的 Content-Type: " + cleanType);
    }

    return parser.call(this, body);
  }

  // 解析查询参数
  parseQuery(queryString) {
    const parsed = new URLSearchParams(queryString);
    const result = {};
    parsed.forEach(function (value, key) {
      result[key] = this.autoConvertType(value);
    }.bind(this));
    return result;
  }

  // 完整解析请求
  parseRequest(req) {
    const result = {
      query: {},
      body: {},
      params: {},
      headers: req.headers || {},
      method: req.method,
      path: req.path,
    };

    // 解析查询参数
    if (req.query) {
      result.query = typeof req.query === "string"
        ? this.parseQuery(req.query)
        : req.query;
    }

    // 解析请求体
    if (req.body) {
      const contentType = req.headers["content-type"] || "application/json";
      result.body = this.parse(req.body, contentType);
    }

    // 路径参数
    if (req.params) {
      result.params = req.params;
    }

    return result;
  }
}

// ---- 6. 测试统一解析器 ----
console.log("\\n===== 6. 测试统一解析器 =====");

const parser = new RequestParser();

// 测试 1：JSON 请求
const testReq1 = {
  method: "POST",
  path: "/api/users",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: '{"name":"张三","age":30,"email":"test@example.com"}',
  query: "page=1&limit=10",
};
console.log("--- JSON 请求 ---");
console.log(JSON.stringify(parser.parseRequest(testReq1), null, 2));

// 测试 2：URL 编码请求
const testReq2 = {
  method: "POST",
  path: "/api/login",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: "username=admin&password=123456&remember=true",
  query: "",
};
console.log("\\n--- URL 编码请求 ---");
console.log(JSON.stringify(parser.parseRequest(testReq2), null, 2));

// 测试 3：GET 请求（只有查询参数，没有请求体）
const testReq3 = {
  method: "GET",
  path: "/api/users",
  headers: {},
  body: null,
  query: "page=1&limit=20&sort=name&active=true",
};
console.log("\\n--- GET 请求（仅查询参数）---");
console.log(JSON.stringify(parser.parseRequest(testReq3), null, 2));

// 测试 4：纯文本请求
const testReq4 = {
  method: "POST",
  path: "/api/log",
  headers: { "content-type": "text/plain" },
  body: "这是一条纯文本日志消息",
  query: "",
};
console.log("\\n--- 纯文本请求 ---");
console.log(JSON.stringify(parser.parseRequest(testReq4), null, 2));

// ---- 7. 请求头读取演示 ----
console.log("\\n===== 7. 请求头读取演示 =====");

const sampleHeaders = {
  "content-type": "application/json",
  "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accept": "application/json, text/plain",
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "x-request-id": "550e8400-e29b-41d4-a716-446655440000",
  "x-forwarded-for": "192.168.1.100",
  "cache-control": "no-cache",
};

console.log("请求头信息:");
console.log("  Content-Type: " + sampleHeaders["content-type"]);
console.log("  Authorization: " + sampleHeaders["authorization"].slice(0, 30) + "...");
console.log("  Accept: " + sampleHeaders["accept"]);
console.log("  User-Agent: " + sampleHeaders["user-agent"].slice(0, 50) + "...");
console.log("  Accept-Language: " + sampleHeaders["accept-language"]);
console.log("  X-Request-ID: " + sampleHeaders["x-request-id"]);
console.log("  X-Forwarded-For: " + sampleHeaders["x-forwarded-for"]);

// 提取 Bearer Token
const authHeader = sampleHeaders["authorization"];
if (authHeader && authHeader.startsWith("Bearer ")) {
  const token = authHeader.slice(7);
  console.log("\\n提取的 Bearer Token: " + token.slice(0, 30) + "...");
}

// Content-Type 解析
const contentType = sampleHeaders["content-type"];
const mediaType = contentType.split(";")[0].trim();
console.log("媒体类型: " + mediaType);

console.log("\\n===== 请求参数解析演示完成 =====");`,
  },

  // =========================================================
  // 第四章：请求验证
  // =========================================================
  {
    id: "node-validation",
    group: "构建 API",
    icon: "✅",
    title: "请求验证",
    content: `## 请求验证

请求验证是 API 安全的第一道防线。永远不要信任客户端传来的数据——这是 Web 开发中最重要的安全原则之一。一个完善的验证系统可以防止无效数据进入业务逻辑，避免安全漏洞和数据污染。

### 验证的重要性

没有验证的 API 面临的风险：

| 风险 | 说明 | 示例 |
| --- | --- | --- |
| **数据污染** | 无效数据写入数据库 | 空字符串代替必填字段 |
| **安全漏洞** | 恶意输入导致注入攻击 | SQL 注入、XSS 攻击 |
| **类型错误** | 期望数字却收到字符串 | \`"abc"\` 代替期望的年龄 |
| **业务逻辑错误** | 无效数据导致错误计算 | 负数的库存数量 |
| **用户体验差** | 模糊的错误信息 | 500 错误而非具体的验证提示 |

### 常见验证规则

| 规则 | 说明 | 示例 |
| --- | --- | --- |
| \`required\` | 字段必填，不能为 undefined/null/空字符串 | \`name: required\` |
| \`type\` | 类型检查（string/number/boolean/array/object） | \`age: type.number\` |
| \`min\` | 最小值/最小长度 | \`age: min(1)\` |
| \`max\` | 最大值/最大长度 | \`name: max(50)\` |
| \`regex\` | 正则表达式匹配 | \`email: regex(emailPattern)\` |
| \`enum\` | 枚举值，值必须在指定列表中 | \`status: enum(['active','inactive'])\` |
| \`custom\` | 自定义验证函数 | \`custom((v) => complexCheck(v))\` |
| \`email\` | 邮箱格式验证 | \`email: email()\` |
| \`url\` | URL 格式验证 | \`website: url()\` |
| \`length\` | 精确长度 | \`code: length(6)\` |

### 自定义验证函数

当内置规则不够用时，自定义验证函数可以处理复杂的业务逻辑：

\`\`\`javascript
// 自定义验证：检查用户名是否唯一
const uniqueUsername = async (value) => {
  const exists = await db.users.findOne({ username: value });
  if (exists) throw new Error('用户名已被使用');
  return true;
};

// 自定义验证：密码强度检查
const strongPassword = (value) => {
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*]/.test(value);
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    throw new Error('密码必须包含大小写字母、数字和特殊字符');
  }
  return true;
};
\`\`\`

### 错误消息格式化

好的错误消息应该清晰、具体、有帮助：

| 风格 | 示例 | 评价 |
| --- | --- | --- |
| 差 | \`"Invalid input"\` | 太模糊，用户不知道哪里错了 |
| 一般 | \`"name is required"\` | 稍好，但缺少上下文 |
| 好 | \`"姓名 是必填字段"\` | 清晰，包含字段名和规则 |
| 最佳 | \`"姓名 不能为空，请填写您的姓名"\` | 清晰且有指导性 |

### 条件验证

某些字段的验证依赖于其他字段的值：

\`\`\`javascript
// 当 type 为 'company' 时，companyName 必填
const schema = {
  type: { required: true, enum: ['individual', 'company'] },
  companyName: {
    required: (data) => data.type === 'company',
    message: '企业用户必须填写公司名称'
  },
};
\`\`\`

### 批量验证

一次请求可能包含多个需要验证的字段。批量验证应该收集所有错误，而不是在第一个错误处就停止：

\`\`\`javascript
// ✅ 好的做法：收集所有错误
const errors = [];
for (const [field, rules] of Object.entries(schema)) {
  for (const rule of rules) {
    try {
      await rule.validate(data[field]);
    } catch (err) {
      errors.push({ field, message: err.message });
    }
  }
}
// 返回所有错误让用户一次性修正
\`\`\`

### Joi / Zod 概念对照

Joi 和 Zod 是 Node.js 生态中最流行的验证库：

| 特性 | Joi | Zod |
| --- | --- | --- |
| 类型推断 | 有限 | 完整的 TypeScript 类型推断 |
| 验证方式 | 链式调用 | 链式调用 |
| 错误消息 | 可自定义 | 可自定义 |
| 异步验证 | 支持 | 支持 |
| 转换/强制类型 | 支持 | 支持 |
| 包大小 | 较大 | 较小 |

下面这段代码实现了一个完整的请求验证器，支持链式规则定义和自定义错误消息。`,
    code: `// ============================================================
// 第四章代码演示：请求验证器实现
// ============================================================

// ---- 1. 验证规则定义 ----
console.log("===== 1. 验证规则定义 =====");

// 验证规则基类
class ValidationRule {
  constructor(name, validator, message) {
    this.name = name;
    this.validator = validator;
    this.message = message || "验证失败";
  }

  validate(value, fieldName) {
    const result = this.validator(value);
    if (result === false) {
      return this.message.replace("{field}", fieldName);
    }
    if (typeof result === "string") {
      return result;
    }
    return null; // 验证通过
  }
}

// 预定义验证规则
const rules = {
  // 必填
  required: function (message) {
    return new ValidationRule("required", function (value) {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }, message || "{field} 是必填字段");
  },

  // 类型检查
  type: function (expectedType, message) {
    return new ValidationRule("type", function (value) {
      if (value === undefined || value === null) return true; // 由 required 处理
      const actualType = Array.isArray(value) ? "array" : typeof value;
      return actualType === expectedType;
    }, message || "{field} 必须是 " + expectedType + " 类型");
  },

  // 最小值
  min: function (minValue, message) {
    return new ValidationRule("min", function (value) {
      if (value === undefined || value === null) return true;
      if (typeof value === "string") return value.length >= minValue;
      if (typeof value === "number") return value >= minValue;
      return false;
    }, message || "{field} 不能小于 " + minValue);
  },

  // 最大值
  max: function (maxValue, message) {
    return new ValidationRule("max", function (value) {
      if (value === undefined || value === null) return true;
      if (typeof value === "string") return value.length <= maxValue;
      if (typeof value === "number") return value <= maxValue;
      return false;
    }, message || "{field} 不能大于 " + maxValue);
  },

  // 正则匹配
  regex: function (pattern, message) {
    return new ValidationRule("regex", function (value) {
      if (value === undefined || value === null) return true;
      return pattern.test(String(value));
    }, message || "{field} 格式不正确");
  },

  // 枚举值
  enum: function (allowedValues, message) {
    return new ValidationRule("enum", function (value) {
      if (value === undefined || value === null) return true;
      return allowedValues.includes(value);
    }, message || "{field} 必须是以下值之一: " + allowedValues.join(", "));
  },

  // 邮箱
  email: function (message) {
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return new ValidationRule("email", function (value) {
      if (value === undefined || value === null) return true;
      return emailPattern.test(String(value));
    }, message || "{field} 不是有效的邮箱地址");
  },

  // 自定义验证
  custom: function (fn, message) {
    return new ValidationRule("custom", function (value) {
      try {
        return fn(value);
      } catch (e) {
        return e.message;
      }
    }, message || "{field} 自定义验证失败");
  },
};

// ---- 2. 字段验证器 ----
console.log("\\n===== 2. 字段验证器 =====");

class FieldValidator {
  constructor(fieldName) {
    this.fieldName = fieldName;
    this.ruleList = [];
    this.isOptional = false;
  }

  // 链式添加规则
  addRule(rule) {
    this.ruleList.push(rule);
    return this;
  }

  // 设置为可选字段
  optional() {
    this.isOptional = true;
    return this;
  }

  // 验证单个字段
  validate(value) {
    // 可选字段且值为空时跳过验证
    if (this.isOptional && (value === undefined || value === null)) {
      return [];
    }

    const errors = [];
    for (let i = 0; i < this.ruleList.length; i++) {
      const rule = this.ruleList[i];
      const error = rule.validate(value, this.fieldName);
      if (error) {
        errors.push({
          field: this.fieldName,
          rule: rule.name,
          message: error,
        });
      }
    }
    return errors;
  }
}

// ---- 3. 验证器（Schema Validator）----
console.log("\\n===== 3. Schema 验证器 =====");

class Validator {
  constructor() {
    this.fields = {};
  }

  // 定义字段验证规则
  field(name, fieldValidator) {
    this.fields[name] = fieldValidator;
    return this;
  }

  // 批量验证
  validate(data) {
    const allErrors = [];

    for (const fieldName in this.fields) {
      const fieldValidator = this.fields[fieldName];
      const value = data[fieldName];
      const errors = fieldValidator.validate(value);
      allErrors.push.apply(allErrors, errors);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      errorCount: allErrors.length,
    };
  }

  // 断言验证（失败时抛出错误）
  assert(data) {
    const result = this.validate(data);
    if (!result.valid) {
      const messages = result.errors.map(function (e) {
        return e.message;
      });
      const err = new Error("验证失败:\\n  " + messages.join("\\n  "));
      err.validationErrors = result.errors;
      throw err;
    }
    return data;
  }
}

// ---- 4. 创建验证规则快捷方法 ----
function createFieldValidator(fieldName) {
  return new FieldValidator(fieldName);
}

// ---- 5. 测试验证器 ----
console.log("\\n===== 5. 测试验证器 =====");

// 创建用户注册验证 Schema
const userSchema = new Validator();

userSchema
  .field("username", createFieldValidator("用户名")
    .addRule(rules.required("用户名 不能为空"))
    .addRule(rules.min(3, "用户名 长度不能少于3个字符"))
    .addRule(rules.max(20, "用户名 长度不能超过20个字符"))
    .addRule(rules.regex(/^[a-zA-Z0-9_]+$/, "用户名 只能包含字母、数字和下划线"))
  )
  .field("email", createFieldValidator("邮箱")
    .addRule(rules.required("邮箱 不能为空"))
    .addRule(rules.email("邮箱 格式不正确"))
  )
  .field("age", createFieldValidator("年龄")
    .addRule(rules.required("年龄 不能为空"))
    .addRule(rules.type("number", "年龄 必须是数字"))
    .addRule(rules.min(1, "年龄 不能小于1"))
    .addRule(rules.max(150, "年龄 不能大于150"))
  )
  .field("role", createFieldValidator("角色")
    .addRule(rules.required("角色 不能为空"))
    .addRule(rules.enum(["admin", "user", "moderator"], "角色 必须是 admin/user/moderator 之一"))
  )
  .field("bio", createFieldValidator("个人简介")
    .optional()
    .addRule(rules.max(200, "个人简介 不能超过200个字符"))
  );

// 测试 1：有效数据
console.log("--- 测试 1：有效数据 ---");
const validData = {
  username: "john_doe",
  email: "john@example.com",
  age: 25,
  role: "user",
  bio: "热爱编程的开发者",
};
const result1 = userSchema.validate(validData);
console.log("验证结果: " + (result1.valid ? "✓ 通过" : "✗ 失败"));
console.log("错误数: " + result1.errorCount);

// 测试 2：无效数据（多个错误）
console.log("\\n--- 测试 2：无效数据（多个错误）---");
const invalidData = {
  username: "ab",          // 太短
  email: "not-an-email",   // 格式错误
  age: -5,                 // 小于最小值
  role: "superadmin",      // 不在枚举中
};
const result2 = userSchema.validate(invalidData);
console.log("验证结果: " + (result2.valid ? "✓ 通过" : "✗ 失败"));
console.log("错误数: " + result2.errorCount);
result2.errors.forEach(function (err) {
  console.log("  ✗ [" + err.rule + "] " + err.message);
});

// 测试 3：缺少必填字段
console.log("\\n--- 测试 3：缺少必填字段 ---");
const missingData = {
  username: "test",
  // 缺少 email
  age: 30,
  // 缺少 role
};
const result3 = userSchema.validate(missingData);
console.log("验证结果: " + (result3.valid ? "✓ 通过" : "✗ 失败"));
result3.errors.forEach(function (err) {
  console.log("  ✗ " + err.message);
});

// 测试 4：可选字段
console.log("\\n--- 测试 4：可选字段 ---");
const minimalData = {
  username: "jane_doe",
  email: "jane@example.com",
  age: 28,
  role: "admin",
  // bio 不提供（可选）
};
const result4 = userSchema.validate(minimalData);
console.log("验证结果: " + (result4.valid ? "✓ 通过" : "✗ 失败"));

// 测试 5：assert 模式
console.log("\\n--- 测试 5：assert 模式 ---");
try {
  userSchema.assert({
    username: "x",  // 太短
    email: "bad",
    age: 999,       // 太大
    role: "guest",  // 不在枚举中
  });
} catch (err) {
  console.log("assert 抛出错误:");
  console.log(err.message);
}

// ---- 6. 自定义验证函数 ----
console.log("\\n===== 6. 自定义验证函数 =====");

// 密码强度验证
const passwordSchema = new Validator();
passwordSchema
  .field("password", createFieldValidator("密码")
    .addRule(rules.required("密码 不能为空"))
    .addRule(rules.min(8, "密码 长度至少8位"))
    .addRule(rules.custom(function (value) {
      if (!/[A-Z]/.test(value)) return "密码 必须包含至少一个大写字母";
      if (!/[a-z]/.test(value)) return "密码 必须包含至少一个小写字母";
      if (!/[0-9]/.test(value)) return "密码 必须包含至少一个数字";
      if (!/[!@#$%^&*]/.test(value)) return "密码 必须包含至少一个特殊字符(!@#$%^&*)";
      return true;
    }))
  );

const testPasswords = [
  "short",           // 太短
  "onlylowercase",   // 缺少大写和数字
  "NoSpecialChar1",  // 缺少特殊字符
  "Str0ng!Pass",     // 有效
];

testPasswords.forEach(function (pw) {
  const result = passwordSchema.validate({ password: pw });
  const status = result.valid ? "✓" : "✗";
  console.log(status + " 密码 '" + pw + "': " +
    (result.valid ? "通过" : result.errors[0].message));
});

// ---- 7. 条件验证 ----
console.log("\\n===== 7. 条件验证 =====");

// 当用户类型为企业时，公司名称必填
const conditionalSchema = new Validator();
conditionalSchema
  .field("type", createFieldValidator("用户类型")
    .addRule(rules.required("用户类型 不能为空"))
    .addRule(rules.enum(["individual", "company"], "用户类型 必须是 individual 或 company"))
  )
  .field("companyName", createFieldValidator("公司名称")
    .addRule(rules.custom(function (value, data) {
      // 这里需要访问 data 上下文，简化处理
      return true;
    }))
  );

// 手动条件验证
function validateWithCondition(data) {
  const errors = [];

  // 验证基础字段
  const baseResult = conditionalSchema.validate(data);
  errors.push.apply(errors, baseResult.errors);

  // 条件验证：如果 type 是 company，则 companyName 必填
  if (data.type === "company") {
    if (!data.companyName || data.companyName.trim() === "") {
      errors.push({
        field: "公司名称",
        rule: "conditional",
        message: "企业用户必须填写公司名称",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    errorCount: errors.length,
  };
}

console.log("个人用户（无公司名称）:");
const indResult = validateWithCondition({ type: "individual", companyName: "" });
console.log("  验证: " + (indResult.valid ? "✓ 通过" : "✗ 失败"));

console.log("企业用户（无公司名称）:");
const compResult = validateWithCondition({ type: "company", companyName: "" });
console.log("  验证: " + (compResult.valid ? "✓ 通过" : "✗ 失败"));
if (!compResult.valid) {
  console.log("  ✗ " + compResult.errors[0].message);
}

console.log("企业用户（有公司名称）:");
const compValidResult = validateWithCondition({ type: "company", companyName: "科技有限公司" });
console.log("  验证: " + (compValidResult.valid ? "✓ 通过" : "✗ 失败"));

// ---- 8. 验证最佳实践总结 ----
console.log("\\n===== 8. 验证最佳实践总结 =====");

console.log("1. 永远不要信任客户端传来的数据");
console.log("2. 在业务逻辑之前进行验证（验证中间件）");
console.log("3. 收集所有验证错误，一次性返回（而非逐个返回）");
console.log("4. 错误消息应该清晰、具体、有帮助");
console.log("5. 区分必填验证和格式验证");
console.log("6. 使用白名单而非黑名单（枚举允许的值）");
console.log("7. 对敏感操作（如删除）进行二次验证");
console.log("8. 数据库层面也要有约束（作为最后防线）");

console.log("\\n===== 请求验证演示完成 =====");`,
  },

  // =========================================================
  // 第五章：CORS 跨域
  // =========================================================
  {
    id: "node-cors",
    group: "构建 API",
    icon: "🌍",
    title: "CORS 跨域",
    content: `## CORS 跨域资源共享

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器实施的安全机制，用于控制不同源（Origin）之间的 HTTP 请求。理解 CORS 对于开发前后端分离的 Web 应用至关重要。

### 同源策略

同源策略是浏览器最核心的安全机制。两个 URL 被视为同源，当且仅当它们的**协议、域名和端口**完全相同。

| URL 1 | URL 2 | 是否同源 | 原因 |
| --- | --- | --- | --- |
| \`http://example.com\` | \`http://example.com/api\` | ✅ 是 | 协议、域名、端口相同 |
| \`http://example.com\` | \`https://example.com\` | ❌ 否 | 协议不同 |
| \`http://example.com\` | \`http://api.example.com\` | ❌ 否 | 域名不同 |
| \`http://example.com:3000\` | \`http://example.com:8080\` | ❌ 否 | 端口不同 |

同源策略限制了：
- 跨域的 AJAX/Fetch 请求
- 跨域的 DOM 访问（iframe）
- 跨域的 Cookie、LocalStorage 读取
- 跨域的 WebSocket 连接

### CORS 机制

CORS 通过一系列 HTTP 响应头来告诉浏览器，允许哪些跨域请求。服务端需要设置以下响应头：

**核心 CORS 响应头**：

| 响应头 | 说明 | 示例 |
| --- | --- | --- |
| \`Access-Control-Allow-Origin\` | 允许的源 | \`https://example.com\` 或 \`*\` |
| \`Access-Control-Allow-Methods\` | 允许的 HTTP 方法 | \`GET, POST, PUT, DELETE\` |
| \`Access-Control-Allow-Headers\` | 允许的请求头 | \`Content-Type, Authorization\` |
| \`Access-Control-Allow-Credentials\` | 是否允许携带凭证 | \`true\` |
| \`Access-Control-Max-Age\` | 预检请求缓存时间（秒） | \`86400\`（24小时） |
| \`Access-Control-Expose-Headers\` | 允许客户端读取的响应头 | \`X-Total-Count, X-Request-ID\` |

### 简单请求 vs 预检请求

浏览器将跨域请求分为两类：

**简单请求**（不触发预检）：

必须同时满足以下所有条件：
- 方法：\`GET\`、\`HEAD\`、\`POST\` 之一
- 仅使用以下请求头：\`Accept\`、\`Accept-Language\`、\`Content-Language\`、\`Content-Type\`
- \`Content-Type\` 仅限于：\`text/plain\`、\`multipart/form-data\`、\`application/x-www-form-urlencoded\`
- 没有使用 \`ReadableStream\`

**预检请求**（Preflight Request）：

不满足简单请求条件的请求，浏览器会先发送一个 \`OPTIONS\` 请求来"询问"服务端是否允许实际请求。预检请求头包含：

| 请求头 | 说明 |
| --- | --- |
| \`Origin\` | 请求来源 |
| \`Access-Control-Request-Method\` | 实际请求使用的 HTTP 方法 |
| \`Access-Control-Request-Headers\` | 实际请求携带的自定义请求头 |

### 预检请求流程

\`\`\`
客户端                          服务端
  │                               │
  │── OPTIONS /api/users ────────→│ 预检请求
  │   Origin: https://app.com     │
  │   Access-Control-Request-     │
  │     Method: POST              │
  │   Access-Control-Request-     │
  │     Headers: Authorization    │
  │                               │
  │←── 200 OK ────────────────────│ 预检响应
  │   Access-Control-Allow-Origin:│
  │     https://app.com           │
  │   Access-Control-Allow-Methods│
  │     : POST                    │
  │   Access-Control-Allow-Headers│
  │     : Authorization           │
  │                               │
  │── POST /api/users ───────────→│ 实际请求
  │   Origin: https://app.com     │
  │   Authorization: Bearer ...   │
  │                               │
  │←── 200 OK ────────────────────│ 实际响应
\`\`\`

### Credentials 模式

默认情况下，跨域请求不会携带 Cookie 和 HTTP 认证信息。如果需要携带凭证：

**客户端设置**：
\`\`\`javascript
fetch('https://api.example.com/data', {
  credentials: 'include',  // 或 'same-origin'
});
\`\`\`

**服务端设置**：
\`\`\`
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://specific-app.com  // 不能是 *
\`\`\`

**重要限制**：当 \`credentials: 'include'\` 时，\`Access-Control-Allow-Origin\` 不能是 \`*\`，必须指定具体的源。

### CORS 中间件最佳实践

1. **使用 Origin 白名单**：不要简单地返回 \`*\`，而是检查请求的 Origin 是否在允许列表中
2. **动态设置 Allow-Origin**：根据请求的 Origin 动态设置，而非固定值
3. **合理设置 Max-Age**：减少预检请求次数，建议 86400 秒（24小时）
4. **只暴露必要的响应头**：通过 Expose-Headers 控制
5. **处理 OPTIONS 请求**：正确响应预检请求，通常返回 204 或 200

下面这段代码实现了一个完整的 CORS 中间件，支持 Origin 白名单、预检请求处理和凭证。`,
    code: `// ============================================================
// 第五章代码演示：CORS 中间件实现
// ============================================================

// ---- 模拟请求对象 ----
function createRequest(method, path, headers) {
  return {
    method: method.toUpperCase(),
    path: path,
    headers: headers || {},
  };
}

// ---- 模拟响应对象 ----
function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader: function (name, value) {
      this.headers[name] = value;
    },
    getHeader: function (name) {
      return this.headers[name];
    },
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.body = JSON.stringify(data);
      this.setHeader("Content-Type", "application/json");
      return this;
    },
    end: function (data) {
      if (data) this.body = String(data);
      return this;
    },
  };
}

// ---- 1. CORS 中间件实现 ----
console.log("===== 1. CORS 中间件实现 =====");

class CorsMiddleware {
  constructor(options) {
    // Origin 白名单（支持字符串、正则、函数）
    this.origin = options.origin || "*";
    // 允许的 HTTP 方法
    this.methods = options.methods || "GET,HEAD,PUT,PATCH,POST,DELETE";
    // 允许的请求头
    this.allowedHeaders = options.allowedHeaders || "Content-Type,Authorization";
    // 暴露的响应头
    this.exposedHeaders = options.exposedHeaders || "";
    // 是否允许凭证
    this.credentials = options.credentials || false;
    // 预检请求缓存时间（秒）
    this.maxAge = options.maxAge || 86400;
    // 预检请求响应状态码
    this.preflightContinue = options.preflightContinue || false;
    // 预检请求成功状态码
    this.optionsSuccessStatus = options.optionsSuccessStatus || 204;
  }

  // 检查 Origin 是否允许
  isOriginAllowed(origin) {
    if (this.origin === "*") return true;

    // 字符串精确匹配
    if (typeof this.origin === "string") {
      return this.origin === origin;
    }

    // 数组匹配
    if (Array.isArray(this.origin)) {
      return this.origin.indexOf(origin) !== -1;
    }

    // 正则匹配
    if (this.origin instanceof RegExp) {
      return this.origin.test(origin);
    }

    // 函数匹配
    if (typeof this.origin === "function") {
      return this.origin(origin);
    }

    return false;
  }

  // 设置 CORS 响应头
  setCorsHeaders(req, res) {
    const origin = req.headers["origin"] || "";

    // 设置 Allow-Origin
    if (this.origin === "*" && !this.credentials) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (this.isOriginAllowed(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      // Vary 头告诉缓存根据 Origin 区分响应
      res.setHeader("Vary", "Origin");
    }

    // 设置凭证
    if (this.credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // 设置暴露的响应头
    if (this.exposedHeaders) {
      res.setHeader("Access-Control-Expose-Headers", this.exposedHeaders);
    }
  }

  // 处理预检请求
  handlePreflight(req, res) {
    // 设置 Allow-Methods
    res.setHeader("Access-Control-Allow-Methods", this.methods);

    // 设置 Allow-Headers
    const requestHeaders = req.headers["access-control-request-headers"];
    if (requestHeaders) {
      res.setHeader("Access-Control-Allow-Headers", requestHeaders);
    } else {
      res.setHeader("Access-Control-Allow-Headers", this.allowedHeaders);
    }

    // 设置缓存时间
    if (this.maxAge) {
      res.setHeader("Access-Control-Max-Age", String(this.maxAge));
    }

    // 设置跨域头
    this.setCorsHeaders(req, res);

    // 返回预检响应
    if (!this.preflightContinue) {
      res.status(this.optionsSuccessStatus).end();
      return true;
    }
    return false;
  }

  // 中间件处理函数
  handle(req, res, next) {
    // 设置 CORS 响应头
    this.setCorsHeaders(req, res);

    // 处理预检请求
    if (req.method === "OPTIONS") {
      const handled = this.handlePreflight(req, res);
      if (handled) return;
    }

    // 继续处理实际请求
    if (next) next();
  }
}

// ---- 2. 创建 CORS 中间件实例 ----
console.log("\\n===== 2. 创建 CORS 中间件实例 =====");

// 实例 1：宽松配置（允许所有源）
const looseCors = new CorsMiddleware({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  maxAge: 86400,
});

console.log("宽松 CORS 配置:");
console.log("  origin: *");
console.log("  methods: GET,POST,PUT,DELETE");
console.log("  credentials: false");

// 实例 2：严格配置（白名单 + 凭证）
const strictCors = new CorsMiddleware({
  origin: ["https://myapp.com", "https://admin.myapp.com"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization,X-Request-ID",
  credentials: true,
  maxAge: 3600,
  exposedHeaders: "X-Total-Count,X-Request-ID",
});

console.log("\\n严格 CORS 配置:");
console.log('  origin: ["https://myapp.com", "https://admin.myapp.com"]');
console.log("  credentials: true");
console.log("  exposedHeaders: X-Total-Count, X-Request-ID");

// 实例 3：正则匹配
const regexCors = new CorsMiddleware({
  origin: /^https:\\/\\/(.*\\.)?myapp\\.com$/,
  methods: "GET,POST",
  credentials: false,
});

console.log("\\n正则 CORS 配置:");
console.log("  origin: /^https:\\\\/\\\\/(.*\\\\.)?myapp\\\\.com$/");

// ---- 3. 测试 Origin 检查 ----
console.log("\\n===== 3. 测试 Origin 检查 =====");

function testOrigin(cors, origin) {
  const allowed = cors.isOriginAllowed(origin);
  console.log('  Origin "' + origin + '": ' + (allowed ? '✓ 允许' : '✗ 拒绝'));
}

console.log("--- 宽松 CORS (*) ---");
testOrigin(looseCors, "https://evil.com");
testOrigin(looseCors, "https://myapp.com");
testOrigin(looseCors, "http://localhost:3000");

console.log("\\n--- 严格 CORS (白名单) ---");
testOrigin(strictCors, "https://myapp.com");
testOrigin(strictCors, "https://admin.myapp.com");
testOrigin(strictCors, "https://evil.com");
testOrigin(strictCors, "http://localhost:3000");

console.log("\\n--- 正则 CORS ---");
testOrigin(regexCors, "https://myapp.com");
testOrigin(regexCors, "https://api.myapp.com");
testOrigin(regexCors, "https://evil.com");
testOrigin(regexCors, "http://myapp.com"); // 协议不匹配

// ---- 4. 测试简单请求 ----
console.log("\\n===== 4. 测试简单请求 =====");

function testSimpleRequest(label, cors, origin) {
  console.log("\\n--- " + label + " ---");
  const req = createRequest("GET", "/api/data", {
    origin: origin,
  });
  const res = createResponse();
  cors.handle(req, res);

  console.log("请求: GET /api/data");
  console.log("Origin: " + origin);
  console.log("响应状态码: " + res.statusCode);
  console.log("响应头:");
  for (const key in res.headers) {
    console.log("  " + key + ": " + res.headers[key]);
  }
}

testSimpleRequest("宽松 CORS 处理正常请求", looseCors, "https://myapp.com");
testSimpleRequest("严格 CORS 处理白名单请求", strictCors, "https://myapp.com");
testSimpleRequest("严格 CORS 处理非白名单请求", strictCors, "https://evil.com");

// ---- 5. 测试预检请求 ----
console.log("\\n===== 5. 测试预检请求（OPTIONS）====");

function testPreflight(label, cors, origin, requestMethod, requestHeaders) {
  console.log("\\n--- " + label + " ---");
  const req = createRequest("OPTIONS", "/api/users", {
    origin: origin,
    "access-control-request-method": requestMethod,
    "access-control-request-headers": requestHeaders,
  });
  const res = createResponse();
  cors.handle(req, res);

  console.log("请求: OPTIONS /api/users");
  console.log("Origin: " + origin);
  console.log("请求方法: " + requestMethod);
  console.log("请求头: " + requestHeaders);
  console.log("响应状态码: " + res.statusCode);
  console.log("响应头:");
  for (const key in res.headers) {
    console.log("  " + key + ": " + res.headers[key]);
  }
}

testPreflight("预检请求（宽松 CORS）", looseCors, "https://myapp.com",
  "POST", "Content-Type,Authorization");

testPreflight("预检请求（严格 CORS + 白名单）", strictCors, "https://myapp.com",
  "DELETE", "Authorization,X-Request-ID");

testPreflight("预检请求（严格 CORS + 非白名单）", strictCors, "https://evil.com",
  "POST", "Content-Type");

// ---- 6. Credentials 模式演示 ----
console.log("\\n===== 6. Credentials 模式演示 =====");

// 带凭证的 CORS 配置
const credCors = new CorsMiddleware({
  origin: "https://myapp.com",
  credentials: true,
  methods: "GET,POST",
});

console.log("带凭证的 CORS 配置:");
console.log("  origin: https://myapp.com (不能是 *)");
console.log("  credentials: true");

const credReq = createRequest("GET", "/api/me", {
  origin: "https://myapp.com",
  cookie: "session=abc123",
});
const credRes = createResponse();
credCors.handle(credReq, credRes);

console.log("\\n响应头:");
for (const key in credRes.headers) {
  console.log("  " + key + ": " + credRes.headers[key]);
}
console.log("\\n注意: credentials=true 时 Allow-Origin 不能是 *");

// ---- 7. CORS 错误场景 ----
console.log("\\n===== 7. CORS 常见错误场景 =====");

console.log("1. CORS 头缺失 → 浏览器阻止请求");
console.log("   → 确保服务端正确设置了 CORS 响应头");

console.log("\\n2. credentials=true 但 Allow-Origin=*");
console.log("   → 浏览器拒绝，必须指定具体 Origin");

console.log("\\n3. 预检请求失败 → 实际请求不会发送");
console.log("   → 确保 OPTIONS 请求返回正确的 CORS 头");

console.log("\\n4. Allow-Headers 不完整 → 自定义头被阻止");
console.log("   → 确保 Allow-Headers 包含所有自定义请求头");

console.log("\\n5. 通配符 * 与 credentials 冲突");
console.log("   → 当需要携带 Cookie 时，必须指定具体 Origin");

// ---- 8. CORS 最佳实践总结 ----
console.log("\\n===== 8. CORS 最佳实践总结 =====");

console.log("1. 生产环境使用 Origin 白名单，不要使用 *");
console.log("2. 合理设置 Access-Control-Max-Age 减少预检请求");
console.log("3. 设置 Vary: Origin 响应头确保 CDN 正确缓存");
console.log("4. 只暴露必要的响应头（Access-Control-Expose-Headers）");
console.log("5. 正确处理 OPTIONS 预检请求（返回 204）");
console.log("6. 谨慎使用 credentials 模式（需要具体 Origin）");
console.log("7. 开发环境可以使用宽松的 CORS 配置");
console.log("8. 在反向代理层（Nginx）也可以配置 CORS");

console.log("\\n===== CORS 跨域演示完成 =====");`,
  },

  // =========================================================
  // 第六章：统一错误处理
  // =========================================================
  {
    id: "node-error-handler",
    group: "构建 API",
    icon: "⚠️",
    title: "统一错误处理",
    content: `## 统一错误处理

在 API 开发中，错误处理的一致性和可预测性至关重要。客户端需要知道每个错误的具体含义和状态码，开发者需要能够快速定位和修复问题。统一错误处理系统可以让 API 的行为更加规范和专业。

### 自定义错误类（AppError）

创建自定义错误类可以让你在错误对象中携带更多上下文信息，如 HTTP 状态码、业务错误码、是否可预期的操作错误等。

**AppError 的设计要点**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| \`message\` | string | 人类可读的错误描述 |
| \`statusCode\` | number | HTTP 状态码 |
| \`code\` | string | 业务错误码（机器可读） |
| \`isOperational\` | boolean | 是否为可预期的操作错误 |
| \`details\` | any | 额外的错误详情 |
| \`cause\` | Error | 原始错误（错误链） |

### 错误码与 HTTP 状态码映射

| 错误类型 | HTTP 状态码 | 业务错误码 | 说明 |
| --- | --- | --- | --- |
| 资源未找到 | 404 | \`NOT_FOUND\` | 请求的资源不存在 |
| 验证失败 | 400 | \`VALIDATION_ERROR\` | 请求参数验证失败 |
| 未认证 | 401 | \`UNAUTHORIZED\` | 缺少或无效的认证信息 |
| 无权限 | 403 | \`FORBIDDEN\` | 已认证但无权访问 |
| 冲突 | 409 | \`CONFLICT\` | 资源冲突（如重复创建） |
| 请求过多 | 429 | \`TOO_MANY_REQUESTS\` | 触发限流 |
| 内部错误 | 500 | \`INTERNAL_ERROR\` | 服务器内部错误 |
| 服务不可用 | 503 | \`SERVICE_UNAVAILABLE\` | 服务暂时不可用 |

### 统一错误响应格式

API 应该返回格式一致的错误响应，让客户端能够统一处理：

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "statusCode": 400,
    "details": [
      { "field": "email", "message": "邮箱格式不正确" },
      { "field": "age", "message": "年龄不能小于1" }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}
\`\`\`

### 操作错误 vs 编程错误

| 类型 | 操作错误（Operational） | 编程错误（Programmer） |
| --- | --- | --- |
| 定义 | 可预期的运行时问题 | 代码中的 bug |
| 示例 | 用户输入无效、文件不存在 | 读取 undefined 属性、类型错误 |
| 处理方式 | 返回友好的错误信息 | 立即崩溃，重启进程 |
| 标记 | \`isOperational = true\` | \`isOperational = false\` |
| 日志级别 | warn | error / fatal |

区分这两类错误是错误处理策略的核心。操作错误是可以安全处理的，应该返回给客户端；编程错误表示代码有 bug，最好的做法是立即崩溃，让进程管理器（如 PM2）重启。

### 错误日志

良好的错误日志是排查问题的关键：

| 日志信息 | 说明 |
| --- | --- |
| 时间戳 | 错误发生的时间 |
| 错误级别 | error / warn / info |
| 错误消息 | 人类可读的描述 |
| 堆栈跟踪 | 完整调用栈 |
| 请求上下文 | URL、方法、请求体、用户 ID |
| 错误码 | 业务错误码 |

### 开发 vs 生产环境

| 方面 | 开发环境 | 生产环境 |
| --- | --- | --- |
| 错误详情 | 完整堆栈跟踪 | 简化的错误消息 |
| 敏感信息 | 可包含调试信息 | 必须过滤掉 |
| 日志输出 | 控制台 | 文件 + 日志聚合 |
| 错误响应 | 详细 | 简洁、安全 |

下面这段代码实现了自定义错误类和统一错误处理中间件。`,
    code: `// ============================================================
// 第六章代码演示：统一错误处理实现
// ============================================================

// ---- 1. 自定义错误类体系 ----
console.log("===== 1. 自定义错误类体系 =====");

// 基础应用错误
class AppError extends Error {
  constructor(message, statusCode, code, isOperational) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.code = code || "INTERNAL_ERROR";
    this.isOperational = isOperational !== undefined ? isOperational : true;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 资源未找到
class NotFoundError extends AppError {
  constructor(message) {
    super(message || "请求的资源不存在", 404, "NOT_FOUND");
  }
}

// 400 验证错误
class ValidationError extends AppError {
  constructor(message, details) {
    super(message || "请求参数验证失败", 400, "VALIDATION_ERROR");
    this.details = details || [];
  }
}

// 401 未认证
class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || "请先登录", 401, "UNAUTHORIZED");
  }
}

// 403 无权限
class ForbiddenError extends AppError {
  constructor(message) {
    super(message || "无权访问该资源", 403, "FORBIDDEN");
  }
}

// 409 冲突
class ConflictError extends AppError {
  constructor(message) {
    super(message || "资源冲突", 409, "CONFLICT");
  }
}

// 429 请求过多
class TooManyRequestsError extends AppError {
  constructor(message, retryAfter) {
    super(message || "请求过于频繁，请稍后再试", 429, "TOO_MANY_REQUESTS");
    this.retryAfter = retryAfter || 60;
  }
}

// 500 内部错误
class InternalError extends AppError {
  constructor(message, cause) {
    super(message || "服务器内部错误", 500, "INTERNAL_ERROR", false);
    this.cause = cause || null;
  }
}

// 演示各种错误类型
const errors = [
  new NotFoundError("用户 ID 999 不存在"),
  new ValidationError("输入数据无效", [
    { field: "email", message: "邮箱格式不正确" },
    { field: "age", message: "年龄必须在1-150之间" },
  ]),
  new UnauthorizedError("访问令牌已过期"),
  new ForbiddenError("只有管理员可以执行此操作"),
  new ConflictError("该用户名已被使用"),
  new TooManyRequestsError("请求频率超限", 30),
  new InternalError("数据库连接失败"),
];

errors.forEach(function (err) {
  console.log("\\n" + err.name + ":");
  console.log("  statusCode: " + err.statusCode);
  console.log("  code: " + err.code);
  console.log("  message: " + err.message);
  console.log("  isOperational: " + err.isOperational);
  if (err.details) {
    console.log("  details: " + JSON.stringify(err.details));
  }
  if (err.retryAfter) {
    console.log("  retryAfter: " + err.retryAfter + "s");
  }
});

// ---- 2. 错误码与状态码映射 ----
console.log("\\n===== 2. 错误码与状态码映射 =====");

const ERROR_CODE_MAP = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,
};

console.log("错误码 → HTTP 状态码映射表:");
for (const code in ERROR_CODE_MAP) {
  console.log("  " + code.padEnd(25) + " → " + ERROR_CODE_MAP[code]);
}

// ---- 3. 统一错误响应格式 ----
console.log("\\n===== 3. 统一错误响应格式 =====");

function formatErrorResponse(err, requestId) {
  const response = {
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "服务器内部错误",
      statusCode: err.statusCode || 500,
      timestamp: err.timestamp || new Date().toISOString(),
    },
  };

  // 添加请求追踪 ID
  if (requestId) {
    response.error.requestId = requestId;
  }

  // 添加详情（如验证错误详情）
  if (err.details) {
    response.error.details = err.details;
  }

  // 添加重试信息
  if (err.retryAfter) {
    response.error.retryAfter = err.retryAfter;
  }

  return response;
}

// 测试错误响应格式化
const testError = new ValidationError("输入验证失败", [
  { field: "username", message: "用户名不能为空" },
  { field: "password", message: "密码长度至少8位" },
]);
const errorResponse = formatErrorResponse(testError, "req_abc123xyz");
console.log(JSON.stringify(errorResponse, null, 2));

// ---- 4. 统一错误处理中间件 ----
console.log("\\n===== 4. 统一错误处理中间件 =====");

class ErrorHandler {
  constructor(options) {
    this.options = Object.assign({
      // 是否为开发环境
      isDevelopment: false,
      // 是否包含堆栈信息
      includeStack: false,
      // 日志函数
      logger: console,
    }, options);
  }

  // 处理错误
  handle(err, req, res) {
    // 确保错误是 AppError 实例
    if (!(err instanceof AppError)) {
      // 将未知错误包装为 InternalError
      const wrappedErr = new InternalError(
        this.options.isDevelopment ? err.message : "服务器内部错误",
        err
      );
      wrappedErr.stack = err.stack;
      err = wrappedErr;
    }

    // 记录日志
    this.logError(err, req);

    // 构建错误响应
    const response = this.buildErrorResponse(err, req);

    // 设置状态码和响应
    res.statusCode = err.statusCode || 500;
    res.headers = res.headers || {};
    res.headers["Content-Type"] = "application/json";
    res.body = JSON.stringify(response);

    return res;
  }

  // 构建错误响应
  buildErrorResponse(err, req) {
    const response = {
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        timestamp: err.timestamp || new Date().toISOString(),
      },
    };

    // 添加请求追踪 ID
    if (req && req.headers && req.headers["x-request-id"]) {
      response.error.requestId = req.headers["x-request-id"];
    }

    // 验证错误详情
    if (err.details && err.details.length > 0) {
      response.error.details = err.details;
    }

    // 开发环境：添加堆栈信息
    if (this.options.isDevelopment && this.options.includeStack && err.stack) {
      response.error.stack = err.stack.split("\\n").map(function (s) {
        return s.trim();
      });
    }

    // 原始错误信息（仅开发环境）
    if (this.options.isDevelopment && err.cause) {
      response.error.cause = {
        message: err.cause.message,
        name: err.cause.name,
      };
    }

    return response;
  }

  // 记录错误日志
  logError(err, req) {
    const logData = {
      level: err.isOperational ? "warn" : "error",
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      timestamp: err.timestamp,
      isOperational: err.isOperational,
    };

    if (req) {
      logData.method = req.method;
      logData.path = req.path;
    }

    if (this.options.isDevelopment && err.stack) {
      logData.stack = err.stack.split("\\n").slice(0, 5).map(function (s) {
        return s.trim();
      });
    }

    const logger = this.options.logger || console;
    if (err.isOperational) {
      logger.warn("[操作错误] " + JSON.stringify(logData));
    } else {
      logger.error("[编程错误] " + JSON.stringify(logData));
    }
  }
}

// ---- 5. 测试错误处理中间件 ----
console.log("\\n===== 5. 测试错误处理中间件 =====");

// 模拟请求
function createMockRequest(method, path) {
  return {
    method: method,
    path: path,
    headers: { "x-request-id": "req_test_001" },
  };
}

// 模拟响应
function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
  };
}

// 生产环境错误处理器
const productionHandler = new ErrorHandler({
  isDevelopment: false,
  includeStack: false,
});

// 开发环境错误处理器
const developmentHandler = new ErrorHandler({
  isDevelopment: true,
  includeStack: true,
});

// 测试场景
function testErrorHandler(label, handler, err) {
  console.log("\\n--- " + label + " ---");
  const req = createMockRequest("GET", "/api/users/999");
  const res = createMockResponse();
  handler.handle(err, req, res);
  console.log("状态码: " + res.statusCode);
  if (res.body) {
    const body = JSON.parse(res.body);
    console.log(JSON.stringify(body, null, 2));
  }
}

// 操作错误
const opError = new NotFoundError("用户 ID 999 不存在");
testErrorHandler("生产环境 - 操作错误", productionHandler, opError);
testErrorHandler("开发环境 - 操作错误", developmentHandler, opError);

// 验证错误
const valError = new ValidationError("输入验证失败", [
  { field: "email", message: "无效的邮箱格式" },
]);
testErrorHandler("生产环境 - 验证错误", productionHandler, valError);

// 未知错误（编程错误）
const unknownError = new TypeError("Cannot read property 'name' of undefined");
testErrorHandler("生产环境 - 未知错误（隐藏详情）", productionHandler, unknownError);
testErrorHandler("开发环境 - 未知错误（显示详情）", developmentHandler, unknownError);

// ---- 6. 全局错误捕获模拟 ----
console.log("\\n===== 6. 全局错误捕获 =====");

// 模拟全局错误捕获处理器
class GlobalErrorCatcher {
  constructor(handler) {
    this.handler = handler;
    this.uncaughtCount = 0;
    this.rejectionCount = 0;
  }

  // 处理未捕获的异常
  handleUncaughtException(err) {
    this.uncaughtCount++;
    const req = { method: "UNKNOWN", path: "UNKNOWN", headers: {} };
    const res = { statusCode: 500, headers: {}, body: null };
    this.handler.handle(err, req, res);
    console.log("\\n[致命] 未捕获的异常（第 " + this.uncaughtCount + " 次）");
    console.log("[建议] 记录错误日志后优雅退出进程");
  }

  // 处理未处理的 Promise 拒绝
  handleUnhandledRejection(reason) {
    this.rejectionCount++;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    const req = { method: "UNKNOWN", path: "UNKNOWN", headers: {} };
    const res = { statusCode: 500, headers: {}, body: null };
    this.handler.handle(err, req, res);
    console.log("\\n[严重] 未处理的 Promise 拒绝（第 " + this.rejectionCount + " 次）");
    console.log("[建议] 记录错误日志后优雅退出进程");
  }
}

const globalCatcher = new GlobalErrorCatcher(productionHandler);

// 模拟触发全局错误捕获
console.log("模拟 uncaughtException 处理:");
globalCatcher.handleUncaughtException(
  new Error("模拟的未捕获异常")
);

console.log("\\n模拟 unhandledRejection 处理:");
globalCatcher.handleUnhandledRejection(
  new Error("模拟的未处理 Promise 拒绝")
);

// ---- 7. 开发 vs 生产环境对比 ----
console.log("\\n===== 7. 开发 vs 生产环境对比 =====");

console.log("| 方面         | 开发环境           | 生产环境           |");
console.log("|--------------|--------------------|--------------------|");
console.log("| 错误详情     | 完整堆栈跟踪       | 简短错误消息       |");
console.log("| 敏感信息     | 可包含调试信息     | 必须过滤           |");
console.log("| 堆栈跟踪     | 返回给客户端       | 不返回给客户端     |");
console.log("| 错误原因     | 显示原始错误       | 隐藏原始错误       |");
console.log("| 日志级别     | 控制台输出         | 文件 + 日志聚合    |");
console.log("| 错误频率     | 可容忍             | 必须告警           |");

// ---- 8. 错误处理最佳实践 ----
console.log("\\n===== 8. 错误处理最佳实践 =====");

console.log("1. 创建自定义错误类体系，按类型分类错误");
console.log("2. 区分操作错误（可处理）和编程错误（应崩溃）");
console.log("3. 使用统一的错误响应格式（code + message + statusCode）");
console.log("4. 为每个请求分配追踪 ID，方便问题排查");
console.log("5. 生产环境不暴露堆栈跟踪和内部错误详情");
console.log("6. 记录完整的错误日志（时间、上下文、堆栈）");
console.log("7. 使用 uncaughtException 和 unhandledRejection 作为最后防线");
console.log("8. 操作错误使用 warn 级别，编程错误使用 error 级别");
console.log("9. 为错误设置合理的 HTTP 状态码");
console.log("10. 实现优雅退出机制，确保资源被正确释放");

console.log("\\n===== 统一错误处理演示完成 =====");`,
  },

  // =========================================================
  // 第七章：文件上传
  // =========================================================
  {
    id: "node-file-upload",
    group: "构建 API",
    icon: "📤",
    title: "文件上传",
    content: `## 文件上传

文件上传是 Web 应用中常见的功能，从用户头像到文档管理都离不开它。虽然 Node.js 没有内置的 HTTP 服务器模块，但我们可以深入理解文件上传的底层原理，包括 multipart/form-data 格式解析、文件存储和校验。

### 文件上传流程

一个完整的文件上传流程包括以下步骤：

\`\`\`
客户端                          服务端
  │                               │
  │── POST /upload ──────────────→│ 1. 接收请求
  │   Content-Type:               │
  │   multipart/form-data;        │ 2. 解析 boundary
  │   boundary=----WebKit...      │
  │                               │ 3. 按 boundary 分隔数据
  │   ------WebKit...             │
  │   Content-Disposition: ...    │ 4. 解析每个 part
  │   Content-Type: image/png     │    - 普通字段
  │                               │    - 文件内容
  │   <二进制文件数据>            │
  │   ------WebKit...             │ 5. 校验文件
  │   Content-Disposition: ...    │    - 大小检查
  │                               │    - 类型检查
  │   name=张三                   │
  │   ------WebKit...--           │ 6. 保存文件
  │                               │
  │←── 200 OK ────────────────────│ 7. 返回结果
  │   {"fileId": "abc123"}        │
\`\`\`

### multipart/form-data 格式

当上传文件时，请求的 Content-Type 为 \`multipart/form-data\`，数据通过一个**boundary**（边界分隔符）将不同部分分隔开。

**格式结构**：

\`\`\`
--boundary\\r\\n
Content-Disposition: form-data; name="field1"\\r\\n
\\r\\n
value1\\r\\n
--boundary\\r\\n
Content-Disposition: form-data; name="file"; filename="photo.png"\\r\\n
Content-Type: image/png\\r\\n
\\r\\n
<二进制文件内容>\\r\\n
--boundary--\\r\\n
\`\`\`

**关键组成部分**：

| 部分 | 说明 |
| --- | --- |
| \`boundary\` | 分隔符，从 Content-Type 头中提取 |
| \`Content-Disposition\` | 描述部分的元信息（name、filename） |
| \`Content-Type\` | 文件的 MIME 类型 |
| 空行 \`\\r\\n\\r\\n\` | 分隔头部和内容 |
| 文件内容 | 二进制数据 |

### 文件大小限制

限制上传文件大小是重要的安全措施：

| 层面 | 限制方式 | 说明 |
| --- | --- | --- |
| 应用层 | 检查 Content-Length | 在接收完整文件前先检查 |
| 解析层 | 限制解析的 Buffer 大小 | 防止内存溢出 |
| 存储层 | 检查最终文件大小 | 最后一道防线 |

**推荐的文件大小限制**：

| 文件类型 | 建议限制 | 说明 |
| --- | --- | --- |
| 头像 | 5MB | 小图片，只需展示小尺寸 |
| 文档 | 50MB | PDF、Word 等 |
| 视频 | 500MB | 大文件建议用分片上传 |
| 批量上传 | 100MB | 总大小限制 |

### MIME 类型校验

不要仅依赖文件扩展名，应该检查文件的 MIME 类型和文件内容（魔数）：

| 文件类型 | 扩展名 | MIME 类型 | 魔数（文件头字节） |
| --- | --- | --- | --- |
| PNG | \`.png\` | \`image/png\` | \`89 50 4E 47\` |
| JPEG | \`.jpg\` | \`image/jpeg\` | \`FF D8 FF\` |
| GIF | \`.gif\` | \`image/gif\` | \`47 49 46 38\` |
| PDF | \`.pdf\` | \`application/pdf\` | \`25 50 44 46\` |
| ZIP | \`.zip\` | \`application/zip\` | \`50 4B 03 04\` |

**白名单 vs 黑名单**：

- ✅ **白名单（推荐）**：只允许特定类型的文件
- ❌ **黑名单**：禁止特定类型（容易遗漏危险类型）

### 文件存储策略

| 策略 | 说明 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 本地文件系统 | 存储在服务器磁盘 | 简单、快速 | 不易扩展 |
| 云存储（S3/OSS） | 存储在云端 | 可扩展、高可用 | 成本高、有延迟 |
| 数据库 | 存储在数据库 | 事务性、备份 | 性能差、成本高 |
| CDN | 边缘节点分发 | 快速访问 | 仅适合静态文件 |

### 文件命名防冲突

使用以下策略避免文件名冲突：

\`\`\`javascript
const crypto = require('crypto');
const path = require('path');

// 策略 1：时间戳 + 随机数
const name1 = Date.now() + '_' + Math.random().toString(36).slice(2);

// 策略 2：内容哈希（推荐）
const name2 = crypto.createHash('md5')
  .update(fileBuffer)
  .digest('hex');

// 策略 3：UUID
const name3 = crypto.randomUUID();

// 保留原始扩展名
const ext = path.extname(originalName);
const finalName = name3 + ext;
\`\`\`

下面这段代码使用 Buffer 和 fs 模拟文件上传处理流程，包括 multipart 数据解析、文件保存和校验。`,
    code: `// ============================================================
// 第七章代码演示：文件上传处理模拟
// ============================================================
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const os = require("os");

// ---- 1. multipart/form-data 格式理解 ----
console.log("===== 1. multipart/form-data 格式 =====");

// multipart 数据由 boundary 分隔
const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

// 模拟构建 multipart 数据
function buildMultipartData(fields, files) {
  const parts = [];
  const crlf = "\\r\\n";

  // 添加普通字段
  for (const name in fields) {
    parts.push("--" + boundary);
    parts.push("Content-Disposition: form-data; name=\\"" + name + "\\"");
    parts.push("");
    parts.push(fields[name]);
  }

  // 添加文件
  for (const file of files) {
    parts.push("--" + boundary);
    parts.push(
      "Content-Disposition: form-data; name=\\"" + file.fieldName + "\\"; filename=\\"" + file.originalName + "\\""
    );
    parts.push("Content-Type: " + file.mimeType);
    parts.push("");
    // 文件内容（二进制）
    parts.push(file.content);
  }

  // 结束标记
  parts.push("--" + boundary + "--");
  parts.push("");

  return Buffer.from(parts.join(crlf));
}

// 模拟文件内容
const imageContent = Buffer.from(
  "\\x89PNG\\r\\n\\x1a\\n" + "模拟的PNG图片二进制数据".repeat(10),
  "utf8"
);

const testFields = { username: "张三", description: "我的头像" };
const testFiles = [
  {
    fieldName: "avatar",
    originalName: "photo.png",
    mimeType: "image/png",
    content: imageContent,
  },
];

const multipartData = buildMultipartData(testFields, testFiles);
console.log("构建的 multipart 数据大小: " + (multipartData.length / 1024).toFixed(2) + " KB");
console.log("\\n数据预览（前 500 字节）:");
console.log(multipartData.toString("utf8", 0, 500));

// ---- 2. multipart 数据解析器 ----
console.log("\\n===== 2. multipart 数据解析器 =====");

class MultipartParser {
  constructor(boundary, options) {
    this.boundary = boundary;
    this.options = Object.assign({
      maxFileSize: 10 * 1024 * 1024, // 10MB 单文件限制
      maxTotalSize: 50 * 1024 * 1024, // 50MB 总大小限制
      maxFields: 100,                 // 最大字段数
      maxFiles: 10,                   // 最大文件数
    }, options);
  }

  // 解析 multipart 数据
  parse(buffer) {
    // 检查总大小
    if (buffer.length > this.options.maxTotalSize) {
      throw new Error("上传数据总大小超过限制 (" +
        (this.options.maxTotalSize / 1024 / 1024) + "MB)");
    }

    const result = {
      fields: {},
      files: [],
    };

    const boundaryBuffer = Buffer.from("--" + this.boundary);
    const endBoundary = Buffer.from("--" + this.boundary + "--");
    const crlf = Buffer.from("\\r\\n");
    const doubleCrlf = Buffer.from("\\r\\n\\r\\n");

    // 查找所有 boundary 位置
    let pos = 0;
    const parts = [];

    while (pos < buffer.length) {
      const boundaryPos = buffer.indexOf(boundaryBuffer, pos);
      if (boundaryPos === -1) break;

      const nextPos = boundaryPos + boundaryBuffer.length;

      // 检查是否是结束标记
      if (buffer.slice(nextPos, nextPos + 2).toString() === "--") {
        break;
      }

      // 跳过 boundary 后的 \\r\\n
      const contentStart = nextPos + 2;
      const nextBoundary = buffer.indexOf(boundaryBuffer, contentStart);

      const partEnd = nextBoundary !== -1
        ? nextBoundary - 2  // 减去前面的 \\r\\n
        : buffer.length;

      if (contentStart < partEnd) {
        parts.push(buffer.slice(contentStart, partEnd));
      }

      pos = nextPos;
    }

    // 解析每个 part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const headerEnd = part.indexOf(doubleCrlf);

      if (headerEnd === -1) continue;

      const headerStr = part.slice(0, headerEnd).toString("utf8");
      const content = part.slice(headerEnd + doubleCrlf.length);

      // 解析头部
      const headers = this.parseHeaders(headerStr);
      const disposition = headers["content-disposition"] || "";

      // 检查是否是文件
      const filenameMatch = disposition.match(/filename="([^"]*)"/);

      if (filenameMatch) {
        // 文件部分
        if (result.files.length >= this.options.maxFiles) {
          throw new Error("文件数量超过限制 (" + this.options.maxFiles + ")");
        }
        if (content.length > this.options.maxFileSize) {
          throw new Error("文件大小超过限制 (" +
            (this.options.maxFileSize / 1024 / 1024) + "MB)");
        }

        const nameMatch = disposition.match(/name="([^"]*)"/);
        result.files.push({
          fieldName: nameMatch ? nameMatch[1] : "file",
          originalName: filenameMatch[1],
          mimeType: headers["content-type"] || "application/octet-stream",
          size: content.length,
          buffer: content,
        });
      } else {
        // 普通字段
        if (Object.keys(result.fields).length >= this.options.maxFields) {
          throw new Error("字段数量超过限制 (" + this.options.maxFields + ")");
        }
        const nameMatch = disposition.match(/name="([^"]*)"/);
        if (nameMatch) {
          result.fields[nameMatch[1]] = content.toString("utf8");
        }
      }
    }

    return result;
  }

  // 解析 part 头部
  parseHeaders(headerStr) {
    const headers = {};
    const lines = headerStr.split("\\r\\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim().toLowerCase();
        const value = line.slice(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
    return headers;
  }
}

// ---- 3. 测试 multipart 解析 ----
console.log("\\n===== 3. 测试 multipart 解析 =====");

const parser = new MultipartParser(boundary, {
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 50 * 1024 * 1024,
});

try {
  const parsed = parser.parse(multipartData);

  console.log("解析结果:");
  console.log("\\n普通字段:");
  for (const key in parsed.fields) {
    console.log("  " + key + ": " + parsed.fields[key]);
  }

  console.log("\\n文件:");
  parsed.files.forEach(function (file, index) {
    console.log("  文件 " + (index + 1) + ":");
    console.log("    字段名: " + file.fieldName);
    console.log("    原始文件名: " + file.originalName);
    console.log("    MIME类型: " + file.mimeType);
    console.log("    大小: " + (file.size / 1024).toFixed(2) + " KB");
    console.log("    内容前20字节: " + file.buffer.toString("hex", 0, 20));
  });
} catch (err) {
  console.log("解析错误: " + err.message);
}

// ---- 4. 文件校验器 ----
console.log("\\n===== 4. 文件校验器 =====");

class FileValidator {
  constructor() {
    // 允许的 MIME 类型白名单
    this.allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/zip",
    ];

    // 魔数映射（文件头字节 → MIME 类型）
    this.magicNumbers = {
      "89504e47": "image/png",
      "ffd8ff": "image/jpeg",
      "47494638": "image/gif",
      "25504446": "application/pdf",
      "504b0304": "application/zip",
      "52617221": "application/x-rar-compressed",
    };
  }

  // 校验文件
  validate(file) {
    const errors = [];

    // 检查 MIME 类型
    if (!this.allowedMimeTypes.includes(file.mimeType)) {
      errors.push("不支持的文件类型: " + file.mimeType);
    }

    // 检查魔数（文件头字节）
    const magic = this.detectMagicNumber(file.buffer);
    if (magic && magic !== file.mimeType) {
      errors.push(
        "文件类型不匹配: 声明为 " + file.mimeType +
        "，实际检测为 " + magic
      );
    }

    // 检查文件大小
    if (file.size === 0) {
      errors.push("文件为空");
    }

    // 检查文件名安全性
    if (file.originalName.includes("..") || file.originalName.includes("/")) {
      errors.push("文件名包含不安全字符");
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  // 通过魔数检测文件类型
  detectMagicNumber(buffer) {
    if (buffer.length < 4) return null;
    const hex = buffer.toString("hex", 0, 4);

    for (const magic in this.magicNumbers) {
      if (hex.startsWith(magic)) {
        return this.magicNumbers[magic];
      }
    }

    // 检查 JPEG（魔数只有 3 字节）
    if (hex.startsWith("ffd8ff")) {
      return "image/jpeg";
    }

    return null;
  }
}

const validator = new FileValidator();

// 测试文件校验
console.log("--- 校验 PNG 文件 ---");
const pngFile = {
  fieldName: "avatar",
  originalName: "photo.png",
  mimeType: "image/png",
  size: imageContent.length,
  buffer: imageContent,
};
const pngResult = validator.validate(pngFile);
console.log("校验结果: " + (pngResult.valid ? "✓ 通过" : "✗ 失败"));
if (!pngResult.valid) {
  pngResult.errors.forEach(function (e) { console.log("  ✗ " + e); });
}

console.log("\\n--- 校验伪造的文件类型 ---");
const fakeFile = {
  fieldName: "file",
  originalName: "virus.exe",
  mimeType: "image/png",  // 声称是 PNG
  size: 100,
  buffer: Buffer.from("This is actually an executable file, not a PNG"),
};
const fakeResult = validator.validate(fakeFile);
console.log("校验结果: " + (fakeResult.valid ? "✓ 通过" : "✗ 失败"));
fakeResult.errors.forEach(function (e) { console.log("  ✗ " + e); });

console.log("\\n--- 校验危险文件名 ---");
const dangerousFile = {
  fieldName: "file",
  originalName: "../../../etc/passwd",
  mimeType: "text/plain",
  size: 100,
  buffer: Buffer.from("test"),
};
const dangerResult = validator.validate(dangerousFile);
console.log("校验结果: " + (dangerResult.valid ? "✓ 通过" : "✗ 失败"));
dangerResult.errors.forEach(function (e) { console.log("  ✗ " + e); });

// ---- 5. 文件存储处理 ----
console.log("\\n===== 5. 文件存储处理 =====");

class FileStorage {
  constructor(uploadDir) {
    this.uploadDir = uploadDir || path.join(os.tmpdir(), "uploads");
    this.ensureDir();
  }

  // 确保上传目录存在
  ensureDir() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (err) {
      console.log("创建上传目录失败: " + err.message);
    }
  }

  // 生成安全的文件名
  generateSafeName(originalName) {
    const ext = path.extname(originalName);
    // 使用时间戳 + 随机数 + 哈希 确保唯一性
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString("hex");
    const hash = crypto.createHash("md5")
      .update(timestamp + random + originalName)
      .digest("hex")
      .slice(0, 12);
    return hash + "_" + timestamp + ext;
  }

  // 保存文件
  save(file) {
    const safeName = this.generateSafeName(file.originalName);
    const filePath = path.join(this.uploadDir, safeName);

    try {
      fs.writeFileSync(filePath, file.buffer);
      const stats = fs.statSync(filePath);

      return {
        success: true,
        originalName: file.originalName,
        savedName: safeName,
        path: filePath,
        size: stats.size,
        mimeType: file.mimeType,
      };
    } catch (err) {
      return {
        success: false,
        error: "文件保存失败: " + err.message,
      };
    }
  }

  // 删除文件
  delete(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
      return { success: false, error: "文件不存在" };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// 测试文件存储
const storage = new FileStorage(path.join(os.tmpdir(), "node-upload-demo"));

console.log("上传目录: " + storage.uploadDir);

// 保存文件
const saveResult = storage.save({
  originalName: "test-photo.png",
  mimeType: "image/png",
  buffer: imageContent,
});

console.log("\\n保存结果:");
console.log(JSON.stringify(saveResult, null, 2));

// 清理测试文件
if (saveResult.success) {
  storage.delete(saveResult.path);
  console.log("\\n测试文件已清理");
}

// ---- 6. 完整上传流程模拟 ----
console.log("\\n===== 6. 完整上传流程模拟 =====");

async function simulateUpload(fields, files) {
  console.log("开始模拟文件上传...");

  try {
    // 步骤 1：构建 multipart 数据
    console.log("1. 构建 multipart 数据...");
    const data = buildMultipartData(fields, files);

    // 步骤 2：解析数据
    console.log("2. 解析 multipart 数据...");
    const parser = new MultipartParser(boundary);
    const parsed = parser.parse(data);

    // 步骤 3：校验文件
    console.log("3. 校验文件...");
    const validator = new FileValidator();
    const validationErrors = [];

    for (const file of parsed.files) {
      const result = validator.validate(file);
      if (!result.valid) {
        validationErrors.push({
          file: file.originalName,
          errors: result.errors,
        });
      }
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        message: "文件校验失败",
        errors: validationErrors,
      };
    }

    // 步骤 4：保存文件
    console.log("4. 保存文件...");
    const savedFiles = [];
    for (const file of parsed.files) {
      const saveResult = storage.save(file);
      if (saveResult.success) {
        savedFiles.push(saveResult);
      }
    }

    // 步骤 5：返回结果
    console.log("5. 返回结果");
    return {
      success: true,
      message: "上传成功",
      fields: parsed.fields,
      files: savedFiles,
    };
  } catch (err) {
    return {
      success: false,
      message: "上传失败: " + err.message,
    };
  }
}

// 执行模拟上传
simulateUpload(
  { username: "张三", description: "我的头像照片" },
  [
    {
      fieldName: "avatar",
      originalName: "profile.png",
      mimeType: "image/png",
      content: imageContent,
    },
  ]
).then(function (result) {
  console.log("\\n上传结果:");
  console.log(JSON.stringify(result, null, 2));

  // 清理
  if (result.files) {
    result.files.forEach(function (f) {
      storage.delete(f.path);
    });
  }
});

// ---- 7. 文件上传安全要点 ----
console.log("\\n===== 7. 文件上传安全要点 =====");

console.log("1. 限制文件大小（服务端验证，不依赖客户端）");
console.log("2. 使用 MIME 类型白名单，而非黑名单");
console.log("3. 检查文件魔数（文件头字节），防止类型伪造");
console.log("4. 生成安全的文件名（不要使用用户提供的文件名）");
console.log("5. 将上传文件存储在 Web 根目录之外");
console.log("6. 限制上传频率（防止 DoS 攻击）");
console.log("7. 扫描病毒（集成 ClamAV 等工具）");
console.log("8. 设置适当的文件权限（如 0644）");
console.log("9. 验证文件名中不包含路径遍历字符（如 ../）");
console.log("10. 对图片文件进行重新编码（清除恶意代码）");

console.log("\\n===== 文件上传演示完成 =====");`,
  },

  // =========================================================
  // 第八章：API 版本管理
  // =========================================================
  {
    id: "node-api-version",
    group: "构建 API",
    icon: "📌",
    title: "API 版本管理",
    content: `## API 版本管理

随着业务的发展，API 不可避免地需要变更。一个良好的版本管理策略可以让你在不破坏现有客户端的情况下迭代 API，同时给客户端足够的时间迁移。

### 版本策略

常见的 API 版本管理有三种策略：

| 策略 | 方式 | 示例 | 优点 | 缺点 |
| --- | --- | --- | --- | --- |
| **URL 路径** | 版本号在 URL 中 | \`/v1/users\`、\`/v2/users\` | 最直观，易于调试 | URL 不够"干净" |
| **请求头** | 自定义请求头 | \`Accept-Version: v1\` | URL 干净 | 不易调试，缓存复杂 |
| **查询参数** | URL 查询参数 | \`/users?version=1\` | 简单灵活 | 污染查询参数，缓存复杂 |

**推荐使用 URL 路径版本**：这是最广泛使用的方式，简单直观，对缓存友好，易于在网关层路由。

### 语义化版本

遵循语义化版本规范（SemVer）来管理 API 版本：

\`\`\`
v1.2.3
│ │ │
│ │ └─ 补丁版本（Patch）：向后兼容的 bug 修复
│ └─── 次版本（Minor）：向后兼容的新功能
└───── 主版本（Major）：不兼容的 API 变更
\`\`\`

**API 版本管理中的应用**：

| 变更类型 | 版本变化 | 示例 |
| --- | --- | --- |
| 修复 bug、性能优化 | 补丁版本 | v1.0.0 → v1.0.1 |
| 新增可选字段、新增端点 | 次版本 | v1.0.0 → v1.1.0 |
| 删除字段、修改响应结构 | 主版本 | v1.x.x → v2.0.0 |

### 向后兼容

保持向后兼容是 API 版本管理中最重要的事情。以下变更是向后兼容的：

| 变更 | 兼容性 | 说明 |
| --- | --- | --- |
| 新增 API 端点 | ✅ 兼容 | 客户端不知道新端点，不影响 |
| 新增可选请求参数 | ✅ 兼容 | 旧客户端不传也不影响 |
| 新增响应字段 | ✅ 兼容 | 健壮的客户端应忽略未知字段 |
| 放宽验证规则 | ✅ 兼容 | 原来能通过的现在也能通过 |
| 修改字段含义 | ❌ 不兼容 | 需要新版本 |
| 删除字段 | ❌ 不兼容 | 可能破坏客户端 |
| 修改字段类型 | ❌ 不兼容 | 一定破坏客户端 |
| 收紧验证规则 | ❌ 不兼容 | 原来能通过的现在可能失败 |

### 路由版本分组

通过版本路由器实现版本分组管理：

\`\`\`javascript
const router = new VersionRouter();

// v1 版本路由
router.version('v1', (v1) => {
  v1.get('/users', v1ListUsers);
  v1.get('/users/:id', v1GetUser);
});

// v2 版本路由（新增功能）
router.version('v2', (v2) => {
  v2.get('/users', v2ListUsers);    // 增强的列表接口
  v2.get('/users/:id', v2GetUser);  // 增加的响应字段
  v2.post('/users', v2CreateUser);  // v2 新增创建功能
});
\`\`\`

### 废弃 API 处理

当 API 需要废弃时，应该遵循以下流程：

1. **标记废弃**：在响应头中添加 \`Deprecated: true\` 或 \`Sunset: <date>\`
2. **通知客户端**：通过文档、邮件、响应头告知迁移计划
3. **灰度下线**：逐步减少流量，观察错误率
4. **完全移除**：确认无流量后删除旧版本代码

### 版本迁移策略

| 策略 | 说明 | 适用场景 |
| --- | --- | --- |
| 并行运行 | 同时维护多个版本 | 大规模 API，客户端众多 |
| 适配层 | 在旧版本和新版本之间加转换层 | 希望快速迁移 |
| 强制升级 | 设定截止日期，到期后关闭旧版本 | 内部 API 或客户端可控 |
| 渐进废弃 | 逐步减少旧版本功能，引导迁移 | 对外 API 的最佳实践 |

下面这段代码实现了一个支持多版本的路由系统，根据版本号匹配不同处理器。`,
    code: `// ============================================================
// 第八章代码演示：API 版本管理系统
// ============================================================
const url = require("url");

// ---- 模拟请求与响应 ----
function createRequest(method, path, headers) {
  return {
    method: method.toUpperCase(),
    path: path,
    headers: headers || {},
    params: {},
    query: {},
    body: null,
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.body = JSON.stringify(data);
      this.headers["content-type"] = "application/json";
      return this;
    },
    setHeader: function (name, value) {
      this.headers[name] = value;
    },
    end: function (data) {
      if (data) this.body = String(data);
      return this;
    },
  };
}

// ---- 1. 版本路由器实现 ----
console.log("===== 1. 版本路由器实现 =====");

class VersionRouter {
  constructor() {
    // 版本路由映射: { v1: Router, v2: Router }
    this.versions = {};
    // 默认版本
    this.defaultVersion = "v1";
    // 版本提取策略
    this.versionStrategy = "path"; // 'path' | 'header' | 'query'
    // 废弃版本列表
    this.deprecatedVersions = {};
  }

  // 注册一个版本的路由组
  version(versionName, callback) {
    const router = new Router();
    callback(router);
    this.versions[versionName] = router;
    return this;
  }

  // 设置默认版本
  setDefaultVersion(version) {
    this.defaultVersion = version;
    return this;
  }

  // 设置版本提取策略
  setVersionStrategy(strategy) {
    this.versionStrategy = strategy;
    return this;
  }

  // 标记版本为废弃
  deprecateVersion(version, sunsetDate, message) {
    this.deprecatedVersions[version] = {
      sunset: sunsetDate,
      message: message || "该 API 版本已废弃，请升级到最新版本",
    };
    return this;
  }

  // 从请求中提取版本号
  extractVersion(req) {
    switch (this.versionStrategy) {
      case "path":
        // 从 URL 路径提取: /v1/users/123 → v1
        const pathMatch = req.path.match(/^\\/(v\\d+)\\//);
        return pathMatch ? pathMatch[1] : this.defaultVersion;

      case "header":
        // 从请求头提取: Accept-Version: v1
        return req.headers["accept-version"] || this.defaultVersion;

      case "query":
        // 从查询参数提取: ?version=v1
        const parsedUrl = url.parse(req.path, true);
        return parsedUrl.query.version || this.defaultVersion;

      default:
        return this.defaultVersion;
    }
  }

  // 处理请求
  handle(req, res) {
    // 提取版本号
    const version = this.extractVersion(req);

    // 检查版本是否存在
    const router = this.versions[version];
    if (!router) {
      res.status(400).json({
        error: {
          code: "UNSUPPORTED_VERSION",
          message: "不支持的 API 版本: " + version,
          supportedVersions: Object.keys(this.versions),
        },
      });
      return;
    }

    // 检查是否为废弃版本
    if (this.deprecatedVersions[version]) {
      const depInfo = this.deprecatedVersions[version];
      res.setHeader("Deprecated", "true");
      res.setHeader("Sunset", depInfo.sunset);
      res.setHeader("Warning", '299 - "' + depInfo.message + '"');
    }

    // 如果版本策略是路径模式，需要去掉路径中的版本前缀
    if (this.versionStrategy === "path") {
      const originalPath = req.path;
      req.path = req.path.replace(/^\\/v\\d+/, "") || "/";
      req._originalPath = originalPath;
      req._apiVersion = version;
    }

    // 将请求交给对应版本的路由器处理
    router.handle(req, res);
  }

  // 列出所有版本及路由
  listVersions() {
    console.log("\\n已注册的 API 版本:");
    for (const version in this.versions) {
      const isDeprecated = !!this.deprecatedVersions[version];
      const depLabel = isDeprecated ? " [已废弃]" : "";
      console.log("  " + version + depLabel);
      console.log("    路由数: " + this.versions[version].routes.length);
    }
  }
}

// ---- 2. 基础路由类（复用第一章的路由器）----
class Router {
  constructor() {
    this.routes = [];
  }

  register(method, pattern, handler) {
    const paramNames = [];
    const regexPattern = pattern
      .replace(/\\/:([^/]+)/g, function (_, name) {
        paramNames.push(name);
        return "/([^/]+)";
      })
      .replace(/\\*/g, "(.*)");

    this.routes.push({
      method: method.toUpperCase(),
      pattern: pattern,
      regex: new RegExp("^" + regexPattern + "$"),
      paramNames: paramNames,
      handler: handler,
    });
    return this;
  }

  get(pattern, handler) { return this.register("GET", pattern, handler); }
  post(pattern, handler) { return this.register("POST", pattern, handler); }
  put(pattern, handler) { return this.register("PUT", pattern, handler); }
  delete(pattern, handler) { return this.register("DELETE", pattern, handler); }

  handle(req, res) {
    const parsedUrl = url.parse(req.path, true);
    req.query = parsedUrl.query;
    const pathname = parsedUrl.pathname;

    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const match = pathname.match(route.regex);

      if (match && req.method === route.method) {
        req.params = {};
        for (let j = 0; j < route.paramNames.length; j++) {
          req.params[route.paramNames[j]] = match[j + 1];
        }
        route.handler(req, res);
        return;
      }
    }

    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "路径 " + pathname + " 未找到匹配的路由",
        version: req._apiVersion,
      },
    });
  }
}

// ---- 3. 创建版本路由系统 ----
console.log("\\n===== 3. 创建版本路由系统 =====");

const apiRouter = new VersionRouter();

// 设置版本提取策略为 URL 路径模式
apiRouter.setVersionStrategy("path");
apiRouter.setDefaultVersion("v1");

// v1 版本：基础用户 API
apiRouter.version("v1", function (v1) {
  v1.get("/users", function (req, res) {
    res.json({
      version: "v1",
      data: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ],
      total: 2,
      // v1 没有分页信息
    });
  });

  v1.get("/users/:id", function (req, res) {
    res.json({
      version: "v1",
      data: {
        id: parseInt(req.params.id),
        name: "张三",
        // v1 只有基本字段
      },
    });
  });

  v1.get("/products", function (req, res) {
    res.json({
      version: "v1",
      data: [
        { id: 1, name: "商品A", price: 99.9 },
      ],
    });
  });
});

// v2 版本：增强的用户 API（新增字段、分页）
apiRouter.version("v2", function (v2) {
  v2.get("/users", function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    res.json({
      version: "v2",
      data: [
        { id: 1, name: "张三", email: "zhangsan@example.com", avatar: "https://cdn.example.com/avatars/1.jpg", createdAt: "2024-01-01" },
        { id: 2, name: "李四", email: "lisi@example.com", avatar: "https://cdn.example.com/avatars/2.jpg", createdAt: "2024-01-02" },
      ],
      pagination: {
        page: page,
        limit: limit,
        total: 100,
        totalPages: 10,
      },
      // v2 增加了 email、avatar、createdAt 字段和分页信息
    });
  });

  v2.get("/users/:id", function (req, res) {
    res.json({
      version: "v2",
      data: {
        id: parseInt(req.params.id),
        name: "张三",
        email: "zhangsan@example.com",
        avatar: "https://cdn.example.com/avatars/1.jpg",
        createdAt: "2024-01-01",
        updatedAt: "2024-06-15",
        // v2 增加了更多字段
      },
    });
  });

  // v2 新增的端点
  v2.post("/users", function (req, res) {
    res.status(201).json({
      version: "v2",
      message: "用户创建成功（v2 版本）",
      data: { id: 3, name: "新用户" },
    });
  });

  v2.get("/products", function (req, res) {
    res.json({
      version: "v2",
      data: [
        { id: 1, name: "商品A", price: 99.9, category: "电子产品", stock: 50, rating: 4.5 },
      ],
    });
  });
});

// v3 版本：最新版本（结构变更）
apiRouter.version("v3", function (v3) {
  v3.get("/users", function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    res.json({
      apiVersion: "3.0",  // v3 使用新的版本声明格式
      items: [             // v3 将 data 改为 items
        { id: 1, profile: { name: "张三", email: "zhangsan@example.com" }, meta: { createdAt: "2024-01-01" } },
        { id: 2, profile: { name: "李四", email: "lisi@example.com" }, meta: { createdAt: "2024-01-02" } },
      ],
      pagination: { page: page, limit: limit, total: 100 },
      _links: {            // v3 增加了 HATEOAS 链接
        self: "/v3/users?page=" + page,
        next: "/v3/users?page=" + (page + 1),
      },
    });
  });
});

// 标记 v1 为废弃版本
apiRouter.deprecateVersion("v1", "2025-12-31", "v1 版本将于 2025-12-31 停止服务，请迁移到 v2 或 v3");

// 列出所有版本
apiRouter.listVersions();

// ---- 4. 测试版本路由 ----
console.log("\\n===== 4. 测试版本路由 =====");

function testVersionRoute(label, method, path) {
  console.log("\\n--- " + label + " ---");
  const req = createRequest(method, path);
  const res = createResponse();
  apiRouter.handle(req, res);

  console.log("请求: " + method + " " + path);
  if (req._apiVersion) {
    console.log("提取的版本: " + req._apiVersion);
  }
  console.log("状态码: " + res.statusCode);

  // 显示废弃警告
  if (res.headers["Deprecated"]) {
    console.log("⚠ 废弃警告: " + res.headers["Warning"]);
  }

  if (res.body) {
    const bodyStr = res.body.length > 500
      ? res.body.slice(0, 500) + "..."
      : res.body;
    console.log("响应: " + bodyStr);
  }
}

// 测试不同版本
testVersionRoute("v1 - 获取用户列表", "GET", "/v1/users");
testVersionRoute("v1 - 获取单个用户", "GET", "/v1/users/5");
testVersionRoute("v1 - 产品列表", "GET", "/v1/products");

testVersionRoute("v2 - 获取用户列表", "GET", "/v2/users");
testVersionRoute("v2 - 获取单个用户", "GET", "/v2/users/5");
testVersionRoute("v2 - 创建用户", "POST", "/v2/users");
testVersionRoute("v2 - 产品列表", "GET", "/v2/products");

testVersionRoute("v3 - 获取用户列表", "GET", "/v3/users");

// 不存在的版本
testVersionRoute("不支持的版本", "GET", "/v999/users");

// ---- 5. 版本策略对比演示 ----
console.log("\\n===== 5. 版本策略对比 =====");

// 策略 1：URL 路径
const pathRouter = new VersionRouter();
pathRouter.setVersionStrategy("path");
pathRouter.version("v1", function (v1) {
  v1.get("/test", function (req, res) {
    res.json({ strategy: "path", version: req._apiVersion });
  });
});

// 策略 2：请求头
const headerRouter = new VersionRouter();
headerRouter.setVersionStrategy("header");
headerRouter.version("v1", function (v1) {
  v1.get("/test", function (req, res) {
    res.json({ strategy: "header", version: "v1" });
  });
});

// 策略 3：查询参数
const queryRouter = new VersionRouter();
queryRouter.setVersionStrategy("query");
queryRouter.version("v1", function (v1) {
  v1.get("/test", function (req, res) {
    res.json({ strategy: "query", version: "v1" });
  });
});

console.log("策略 1 - URL 路径模式:");
console.log("  请求: GET /v1/test");
console.log("  优点: 直观、易于调试、缓存友好");
console.log('  缺点: URL 不够"干净"');

console.log("\\n策略 2 - 请求头模式:");
console.log("  请求: GET /test, Header: Accept-Version: v1");
console.log("  优点: URL 干净");
console.log("  缺点: 不易调试，缓存需要 Vary 头");

console.log("\\n策略 3 - 查询参数模式:");
console.log("  请求: GET /test?version=v1");
console.log("  优点: 简单灵活");
console.log("  缺点: 污染查询参数，缓存复杂");

// 测试请求头策略
console.log("\\n--- 请求头策略测试 ---");
const headerReq = createRequest("GET", "/test", {
  "accept-version": "v1",
});
const headerRes = createResponse();
headerRouter.handle(headerReq, headerRes);
console.log("请求: GET /test");
console.log("请求头: Accept-Version: v1");
console.log("响应: " + headerRes.body);

// 测试查询参数策略
console.log("\\n--- 查询参数策略测试 ---");
const queryReq = createRequest("GET", "/test?version=v1");
const queryRes = createResponse();
queryRouter.handle(queryReq, queryRes);
console.log("请求: GET /test?version=v1");
console.log("响应: " + queryRes.body);

// ---- 6. 废弃版本处理演示 ----
console.log("\\n===== 6. 废弃版本处理演示 =====");

console.log("废弃版本处理流程:");
console.log("1. 标记废弃: 在响应中添加 Deprecated 和 Sunset 头");
console.log("2. 通知客户端: 通过 Warning 头告知迁移信息");
console.log("3. 监控流量: 观察还有多少客户端使用旧版本");
console.log("4. 灰度下线: 逐步减少旧版本流量");
console.log("5. 完全移除: 确认无流量后删除旧版本代码");

// 废弃版本信息
console.log("\\n当前废弃版本:");
for (const version in apiRouter.deprecatedVersions) {
  const depInfo = apiRouter.deprecatedVersions[version];
  console.log("  " + version + ":");
  console.log("    停止日期: " + depInfo.sunset);
  console.log("    迁移提示: " + depInfo.message);
}

// ---- 7. 向后兼容检查清单 ----
console.log("\\n===== 7. 向后兼容检查清单 =====");

const compatChecks = [
  { change: "新增 API 端点", compatible: true, desc: "旧客户端不会调用新端点，无影响" },
  { change: "新增可选请求参数", compatible: true, desc: "旧客户端不传此参数，使用默认值" },
  { change: "新增响应字段", compatible: true, desc: "健壮的客户端忽略未知字段" },
  { change: "放宽验证规则", compatible: true, desc: "原来能通过的请求现在也能通过" },
  { change: "修改字段含义", compatible: false, desc: "例如 price 从美元改为人民币" },
  { change: "删除字段", compatible: false, desc: "依赖该字段的客户端会出错" },
  { change: "修改字段类型", compatible: false, desc: "例如 age 从 number 改为 string" },
  { change: "收紧验证规则", compatible: false, desc: "原来能通过的请求现在可能失败" },
  { change: "修改响应结构", compatible: false, desc: "例如从 data 改为 items" },
  { change: "修改错误码含义", compatible: false, desc: "客户端依赖错误码做判断" },
];

console.log("兼容性检查表:");
compatChecks.forEach(function (check) {
  const icon = check.compatible ? "✅" : "❌";
  console.log("  " + icon + " " + check.change);
  console.log("     " + check.desc);
});

// ---- 8. API 版本管理最佳实践 ----
console.log("\\n===== 8. API 版本管理最佳实践 =====");

console.log("1. 推荐使用 URL 路径版本策略（v1、v2）");
console.log("2. 遵循语义化版本规范（SemVer）");
console.log("3. 尽量保持向后兼容，避免破坏性变更");
console.log("4. 新增字段而非修改字段，新增端点而非修改端点");
console.log("5. 废弃版本要有明确的停止日期（Sunset）");
console.log("6. 在响应头中提示废弃信息（Deprecated/Warning）");
console.log("7. 提供清晰的迁移指南和文档");
console.log("8. 同时维护的版本不要超过 3 个");
console.log("9. 为每个版本编写独立的测试用例");
console.log("10. 使用网关层（如 Nginx/Kong）也可以做版本路由");

console.log("\\n===== API 版本管理演示完成 =====");`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ["基础入门", "核心模块", "异步编程", "进阶实战", "工程化", "基础补充", "构建 API"];