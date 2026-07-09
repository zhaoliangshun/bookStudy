export const chapters = [
  {
    id: "nb-error-log",
    group: "第四部分：工程化与安全",
    icon: "📝",
    title: "错误处理与日志系统winston",
    content: `# 错误处理与日志系统winston

在生产环境中，错误处理和日志记录是必不可少的。一个健壮的后端系统必须能够优雅地处理各种错误，并留下完整的日志记录，方便问题排查和系统监控。

---

## 一、为什么需要完善的错误处理？

在开发过程中，我们经常遇到：
- 用户传了错误的参数，导致程序崩溃
- 数据库连接失败，服务挂掉
- 代码有bug，访问某个接口直接返回500
- 第三方API调用超时...

如果没有完善的错误处理：
1. **服务直接崩溃**：一个未捕获的异常可能导致整个Node.js进程退出
2. **用户体验差**：用户看到一堆难懂的技术错误信息，甚至白屏
3. **难以排查问题**：不知道什么时候、什么原因、哪个用户触发了错误
4. **安全风险**：错误堆栈信息可能泄露敏感数据（数据库密码、文件路径等）

---

## 二、Express错误处理机制

### 1. 错误类型

在Express应用中，错误主要分为两类：

#### 同步错误
在路由处理函数或中间件中直接抛出的同步错误，Express会自动捕获并传递给错误处理中间件。

\`\`\`javascript
app.get('/sync-error', (req, res) => {
  throw new Error('这是一个同步错误');
  // Express会自动捕获这个错误，传给错误处理中间件
});
\`\`\`

#### 异步错误
在异步操作（回调、Promise、async/await）中发生的错误，必须手动传递给\`next()\`函数，否则Express无法捕获。

\`\`\`javascript
app.get('/async-error', async (req, res, next) => {
  try {
    await someAsyncOperation();
  } catch (err) {
    next(err);  // 必须手动调用next(err)传递错误
  }
});
\`\`\`

### 2. 错误处理中间件

Express的错误处理中间件是一个特殊的中间件，它有**四个参数**：\`(err, req, res, next)\`。必须放在所有路由和其他中间件之后。

\`\`\`javascript
// 错误处理中间件 - 四个参数不能少！
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});
\`\`\`

### 3. 404处理中间件

当没有任何路由匹配请求时，我们需要返回404。404中间件放在所有路由之后、错误处理中间件之前。

\`\`\`javascript
// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: \`路由 \${req.method} \${req.path} 不存在\`
  });
});

// 然后才是错误处理中间件
app.use(errorHandler);
\`\`\`

---

## 三、自定义错误类

为了更好地区分不同类型的错误（如参数错误、权限错误、资源不存在等），我们可以创建自定义错误类。

\`\`\`javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;  // 标记为可预期的操作错误

    Error.captureStackTrace(this, this.constructor);
  }
}

// 使用示例
app.get('/users/:id', (req, res, next) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return next(new AppError('用户不存在', 404));
  }
  res.json({ code: 200, data: user });
});
\`\`\`

---

## 四、为什么需要日志系统？

console.log在开发时够用了，但生产环境远远不够：
- console.log只输出到控制台，重启服务日志就没了
- 无法区分日志级别（普通信息、警告、错误）
- 无法按日期/大小分割日志文件
- 没有结构化信息（时间、请求ID、用户信息等）
- 难以检索和分析

这时候就需要专业的日志库——**winston**是Node.js生态中最流行的日志库。

---

## 五、winston日志库详解

### 1. winston核心概念

- **Logger**：日志记录器实例
- **Transport**：日志输出目标（控制台、文件、远程服务等）
- **Level**：日志级别，优先级从低到高：error、warn、info、http、verbose、debug、silly
- **Format**：日志格式化（时间戳、JSON、颜色、自定义格式等）

### 2. 日志级别

| 级别 | 优先级 | 用途 |
|------|--------|------|
| error | 0 | 错误，需要立即处理 |
| warn | 1 | 警告，但不影响运行 |
| info | 2 | 普通信息，记录正常运行状态 |
| http | 3 | HTTP请求日志 |
| verbose | 4 | 详细信息 |
| debug | 5 | 调试信息，开发时用 |
| silly | 6 | 最详细的日志 |

设置日志级别后，只会记录该级别及以上（数字更小）的日志。比如设置级别为\`info\`，则error、warn、info会被记录，http、debug等不会。

### 3. 按级别/文件分割日志

生产环境中，我们通常会把不同级别的日志输出到不同文件：
- error.log：只记录错误日志
- combined.log：记录所有级别的日志
- 按日期分割：每天生成一个新文件（需要winston-daily-rotate-file）

---

## 六、请求日志中间件：morgan

morgan是一个HTTP请求日志中间件，可以自动记录所有请求的信息：方法、路径、状态码、响应时间、IP等。结合winston使用效果更佳。

---

## 七、实战Demo

本章的代码示例包含：
1. 自定义AppError错误类
2. 全局错误处理中间件
3. 404处理中间件
4. winston日志配置（控制台输出、文件输出、按级别分割）
5. 不同级别的日志演示
6. morgan请求日志集成
7. 异步错误捕获包装器
`,
    code: `// ============================================
// 错误处理与日志系统winston 完整Demo
// 需要安装的依赖：
// npm install express winston morgan
// ============================================

const express = require('express');
const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ============================================
// 第一部分：配置winston日志系统
// ============================================

// 确保logs目录存在
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  // 添加时间戳
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  // 错误时记录堆栈信息
  winston.format.errors({ stack: true }),
  // 支持自定义元数据
  winston.format.splat(),
  // 自定义输出格式
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = \`[\${timestamp}] [\${level.toUpperCase()}]: \${message}\`;
    // 如果有堆栈信息（错误时），附加到日志
    if (stack) {
      log += \`\\n\${stack}\`;
    }
    // 如果有其他元数据，也记录下来
    if (Object.keys(meta).length > 0) {
      log += \`\\n\${JSON.stringify(meta, null, 2)}\`;
    }
    return log;
  })
);

// 控制台输出格式（带颜色）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = \`[\${timestamp}] \${level}: \${message}\`;
    if (stack) {
      log += \`\\n\${stack}\`;
    }
    return log;
  })
);

// 创建logger实例
const logger = winston.createLogger({
  // 只记录info及以上级别（生产环境建议用info）
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  // 默认元数据，会附加到每条日志
  defaultMeta: { service: 'nodejs-backend-demo' },
  transports: [
    // 1. 错误日志单独输出到error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',  // 只记录error级别
      maxsize: 5242880,  // 单文件最大5MB，超过后自动创建新文件
      maxFiles: 5,  // 最多保留5个文件
    }),
    // 2. 所有日志输出到combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 10,
    })
  ],
  // 异常和Promise拒绝捕获
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// 开发环境同时输出到控制台（带颜色）
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// 演示：不同级别的日志输出
logger.error('这是一条error日志 - 程序出错了');
logger.warn('这是一条warn日志 - 警告信息');
logger.info('这是一条info日志 - 普通信息');
logger.http('这是一条http日志 - HTTP请求');
logger.verbose('这是一条verbose日志 - 详细信息');
logger.debug('这是一条debug日志 - 调试信息');
logger.silly('这是一条silly日志 - 最详细的日志');
logger.info('带元数据的日志 %s', '可以传参数', { userId: 123, action: 'login' });

// ============================================
// 第二部分：自定义错误类
// ============================================

class AppError extends Error {
  /**
   * 自定义应用错误类
   * @param {string} message - 错误消息
   * @param {number} statusCode - HTTP状态码
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // 4xx是客户端错误(fail)，5xx是服务器错误(error)
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = true;  // 标记为可预期的操作错误

    // 捕获错误堆栈，排除构造函数本身
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// 第三部分：异步错误捕获包装器
// ============================================

/**
 * 包装异步路由处理函数，自动捕获异常并传给next
 * 避免在每个async函数里写try-catch
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// ============================================
// 第四部分：Express中间件配置
// ============================================

app.use(express.json());

// 配置morgan请求日志，结合winston
// morgan的输出流直接写入winston
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// 请求ID中间件：给每个请求分配唯一ID，方便追踪
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  req.requestTime = new Date().toISOString();
  logger.debug(\`收到请求 [\${req.requestId}]: \${req.method} \${req.path}\`);
  next();
});

// ============================================
// 第五部分：路由定义
// ============================================

// 首页
app.get('/', (req, res) => {
  logger.info('访问首页', { requestId: req.requestId });
  res.json({
    code: 200,
    message: '错误处理与日志系统Demo',
    endpoints: [
      'GET / - 首页',
      'GET /users/:id - 获取用户（可能触发404）',
      'GET /sync-error - 同步错误演示',
      'GET /async-error - 异步错误演示',
      'GET /error/:type - 触发不同类型错误'
    ]
  });
});

// 模拟用户数据
const users = [
  { id: '1', name: '张三', email: 'YA9RfmB0@dTdpwNO.TAM' },
  { id: '2', name: '李四', email: 'Rawe@YP2H53v.pJe' }
];

// 获取用户 - 演示404错误
app.get('/users/:id', catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  logger.info(\`查询用户: \${userId}\`, { requestId: req.requestId });

  // 模拟异步数据库查询
  await new Promise(resolve => setTimeout(resolve, 100));

  const user = users.find(u => u.id === userId);
  if (!user) {
    // 返回自定义404错误
    return next(new AppError(\`ID为\${userId}的用户不存在\`, 404));
  }

  res.json({
    code: 200,
    data: user,
    requestId: req.requestId
  });
}));

// 同步错误演示
app.get('/sync-error', (req, res) => {
  logger.info('触发同步错误');
  // 在同步代码中直接抛出错误，Express会自动捕获
  throw new AppError('这是一个故意触发的同步错误', 400);
});

// 异步错误演示 - 使用catchAsync包装
app.get('/async-error', catchAsync(async (req, res, next) => {
  logger.info('触发异步错误');
  // 模拟异步操作失败
  await new Promise((_, reject) => {
    setTimeout(() => reject(new Error('数据库连接超时')), 500);
  });
}));

// 触发不同类型的错误
app.get('/error/:type', (req, res, next) => {
  const type = req.params.type;
  logger.warn(\`触发错误类型: \${type}\`);

  switch (type) {
    case '400':
      return next(new AppError('请求参数错误', 400));
    case '401':
      return next(new AppError('未授权，请先登录', 401));
    case '403':
      return next(new AppError('权限不足，禁止访问', 403));
    case '404':
      return next(new AppError('资源不存在', 404));
    case '500':
      return next(new AppError('服务器内部错误', 500));
    default:
      return next(new AppError('未知错误', 500));
  }
});

// 故意写一个会导致ReferenceError的路由（未定义变量）
app.get('/bug', () => {
  // 这里故意访问未定义的变量
  // eslint-disable-next-line no-undef
  console.log(undefinedVariable);
});

// ============================================
// 第六部分：404处理中间件
// ============================================
// 放在所有路由之后，如果能走到这里，说明没有匹配的路由
app.use((req, res, next) => {
  logger.warn(\`404 Not Found: \${req.method} \${req.originalUrl}\`, {
    ip: req.ip,
    requestId: req.requestId
  });
  next(new AppError(\`找不到路由 \${req.method} \${req.originalUrl}\`, 404));
});

// ============================================
// 第七部分：全局错误处理中间件
// ============================================
// 四个参数必须都写，Express才知道这是错误处理中间件
app.use((err, req, res, next) => {
  // 默认值
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 记录错误日志
  const logMeta = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    statusCode: err.statusCode
  };

  if (err.isOperational) {
    // 可预期的操作错误，warn级别
    logger.warn(\`操作错误: \${err.message}\`, logMeta);
  } else {
    // 未预期的程序错误，error级别，记录堆栈
    logger.error(\`未处理异常: \${err.message}\`, {
      ...logMeta,
      stack: err.stack
    });
  }

  // 开发环境：返回详细错误信息（包括堆栈）
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
      requestId: req.requestId
    });
  }

  // 生产环境：只返回安全的错误信息，不泄露堆栈
  // 如果是可预期的操作错误，返回给用户
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      status: err.status,
      message: err.message,
      requestId: req.requestId
    });
  }

  // 程序未知错误：不泄露详情，只返回通用错误
  return res.status(500).json({
    code: 500,
    status: 'error',
    message: '服务器出了点小问题，请稍后再试',
    requestId: req.requestId
  });
});

// ============================================
// 第八部分：启动服务器
// ============================================

// 优雅退出处理
const server = app.listen(PORT, () => {
  logger.info(\`🚀 服务器运行在 http://localhost:\${PORT}\`);
  logger.info('📝 日志文件保存在 logs/ 目录');
  logger.info('');
  logger.info('可以测试以下路由：');
  logger.info('  GET /users/1 - 正常请求');
  logger.info('  GET /users/999 - 404错误');
  logger.info('  GET /sync-error - 同步错误');
  logger.info('  GET /async-error - 异步错误');
  logger.info('  GET /error/401 - 401未授权');
  logger.info('  GET /error/500 - 500服务器错误');
});

// 处理未捕获的Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise Rejection:', reason);
  logger.error('Promise:', promise);
  // 优雅关闭服务器
  server.close(() => {
    process.exit(1);
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  server.close(() => {
    process.exit(1);
  });
});

// 导出logger供其他模块使用
module.exports = { logger, AppError, catchAsync };
`
  },
  {
    id: "nb-auth",
    group: "第四部分：工程化与安全",
    icon: "🔐",
    title: "身份认证JWT/Session",
    content: `# 身份认证JWT/Session

身份认证是后端系统的核心功能之一——你需要知道"谁在请求"，并控制"他能做什么"。本章我们将学习两种主流的认证方案：Session-Cookie和JWT，并实现完整的登录注册流程。

---

## 一、什么是身份认证？

身份认证（Authentication）解决的是**"你是谁"**的问题，授权（Authorization）解决的是**"你能做什么"**的问题。

常见的认证场景：
- 用户注册、登录
- 未登录用户不能访问某些页面
- 普通用户和管理员有不同权限
- API接口需要验证调用者身份

---

## 二、两种主流认证方案对比

### 方案一：Session-Cookie（传统方案）

#### 工作流程：
1. 用户登录，服务器验证账号密码
2. 服务器创建一个session对象，保存用户信息，存入内存/数据库/Redis
3. 服务器给session生成一个唯一ID（sessionId）
4. 服务器通过Set-Cookie响应头把sessionId返回给浏览器
5. 浏览器后续请求自动带上这个Cookie
6. 服务器根据sessionId找到对应的session，就知道用户是谁了

#### 优点：
- session保存在服务器端，可以随时注销（让session失效）
- 安全性相对高，token不在网络中反复传输

#### 缺点：
- 服务器需要存储session，分布式系统需要session共享（Redis）
- 对移动端不友好（移动端对Cookie支持不好）
- CSRF攻击风险

### 方案二：JWT（JSON Web Token，现代方案）

#### 工作流程：
1. 用户登录，服务器验证账号密码
2. 服务器把用户信息（不包含密码）用密钥签名，生成一个JWT token
3. 服务器把token返回给客户端（前端可以存在localStorage、sessionStorage或Cookie）
4. 客户端后续请求在Authorization header里带上这个token
5. 服务器验证token签名是否合法，合法就信任其中的用户信息
6. **服务器不需要存储token**！验证通过即可

#### JWT的结构：
JWT由三部分组成，用点（.）连接：**Header.Payload.Signature**

1. **Header（头部）**：token类型和签名算法，Base64编码
   \`\`\`json
   { "alg": "HS256", "typ": "JWT" }
   \`\`\`

2. **Payload（负载）**：用户数据和声明，Base64编码（注意：这不是加密！只是编码，任何人都能解码）
   \`\`\`json
   { "userId": "123", "name": "张三", "exp": 1700000000 }
   \`\`\`

3. **Signature（签名）**：用密钥对前两部分签名，防止篡改
   \`\`\`
   HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
   \`\`\`

#### 优点：
- **无状态**：服务器不需要存储session，天然支持分布式/微服务
- 跨域友好：适合前后端分离、移动端、第三方API调用
- 性能好：不需要查数据库/session存储

#### 缺点：
- token一旦签发，在过期前无法作废（除非额外做黑名单机制）
- payload是Base64编码，不是加密，**不能存放敏感信息**（密码、信用卡号等）
- token比sessionId大，会增加请求带宽

---

## 三、密码安全：bcryptjs哈希

**绝对不能明文存储密码！** 即使是公司内部人员也不能看用户密码。

我们需要对密码进行**哈希**处理：
- 哈希是单向的：无法从哈希值反推出原密码
- 同一密码每次哈希结果不同（加了盐salt）
- 可以验证：输入密码重新哈希，和数据库里的比对

bcrypt是专门为密码哈希设计的算法，慢哈希且自带盐值：

\`\`\`javascript
const bcrypt = require('bcryptjs');

// 注册时：哈希密码
const saltRounds = 12;  // 计算轮数，越大越慢越安全，推荐10-12
const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

// 登录时：比对密码
const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
\`\`\`

---

## 四、jsonwebtoken库使用

\`\`\`javascript
const jwt = require('jsonwebtoken');

// 签发token
const token = jwt.sign(
  { userId: user.id, email: user.email },  // payload
  process.env.JWT_SECRET,  // 密钥，必须保密！
  { expiresIn: '7d' }  // 过期时间：7天
);

// 验证token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded就是payload: { userId: '...', email: '...', iat: ..., exp: ... }
  console.log('用户ID:', decoded.userId);
} catch (err) {
  // token无效或过期
  res.status(401).json({ message: 'token无效' });
}
\`\`\`

---

## 五、认证中间件保护路由

写一个auth中间件，放到需要认证的路由前面，自动验证token并把用户信息挂载到req上：

\`\`\`javascript
const authMiddleware = (req, res, next) => {
  // 从Authorization header获取token："Bearer <token>"
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ message: '请先登录' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // 挂载用户信息到请求对象
    next();
  } catch (err) {
    return res.status(401).json({ message: 'token无效或已过期' });
  }
};

// 使用：给需要登录的路由加上中间件
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
\`\`\`

---

## 六、完整登录注册流程

### 注册流程：
1. 用户提交用户名、邮箱、密码
2. 验证输入格式（邮箱格式、密码长度等）
3. 检查邮箱是否已注册
4. bcrypt哈希密码
5. 用户信息存入数据库（密码存哈希后的值）
6. 签发JWT token返回
7. 返回用户信息和token

### 登录流程：
1. 用户提交邮箱和密码
2. 根据邮箱查找用户
3. 用户不存在：返回"邮箱或密码错误"（不要明确说哪个错，防止枚举用户）
4. bcrypt.compare比对密码
5. 密码不匹配：返回"邮箱或密码错误"
6. 签发JWT token
7. 返回用户信息和token

---

## 七、安全注意事项

1. **JWT密钥必须足够复杂**，不要硬编码在代码里，用环境变量
2. **Payload不要放敏感信息**（密码），因为Base64只是编码不是加密
3. **使用HTTPS**：防止token在传输中被窃取
4. **设置合理的过期时间**：比如access token 15分钟-2小时，配合refresh token
5. **密码哈希轮数不要太低**：10-12轮比较合适
6. **登录错误信息模糊化**：不要区分"用户不存在"和"密码错误"
7. **考虑token刷新机制**：access token过期后用refresh token刷新

---

## 八、实战Demo

本章代码Demo实现了：
1. bcryptjs密码哈希与验证
2. jsonwebtoken签发与验证
3. 用户注册接口
4. 用户登录接口
5. auth认证中间件
6. 受保护的路由示例（获取个人信息）
7. 模拟用户数据存储
`,
    code: `// ============================================
// 身份认证JWT/Session 完整Demo
// 需要安装的依赖：
// npm install express bcryptjs jsonwebtoken dotenv
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const app = express();
const PORT = 3001;

// ============================================
// 第一部分：环境配置
// ============================================

// 加载.env文件中的环境变量
// 实际项目中不要把.env提交到Git！这里为了演示直接设置
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production-make-it-very-long-and-random';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || 12;

app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next();
});

// ============================================
// 第二部分：模拟数据库
// ============================================
// 实际项目中这里应该是MongoDB/MySQL/PostgreSQL
// 为了Demo演示，我们用数组存数据（重启服务数据会丢失）

const users = [];

// ============================================
// 第三部分：工具函数
// ============================================

/**
 * 签发JWT token
 * @param {string} userId - 用户ID
 * @returns {string} JWT token
 */
const signToken = (userId) => {
  return jwt.sign(
    { id: userId },  // payload：只存用户ID，不要存密码等敏感信息
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * 创建并发送token响应
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // Cookie选项
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,  // 防止XSS攻击，JS无法读取cookie
    secure: process.env.NODE_ENV === 'production',  // 生产环境只在HTTPS传输
    sameSite: 'strict'  // 防止CSRF
  };

  // 可以选择把token放在cookie里，比localStorage更安全
  res.cookie('jwt', token, cookieOptions);

  // 返回响应（移除密码字段）
  const userResponse = { ...user };
  delete userResponse.password;

  res.status(statusCode).json({
    code: statusCode,
    status: 'success',
    token,
    data: {
      user: userResponse
    }
  });
};

// ============================================
// 第四部分：认证中间件
// ============================================

/**
 * 认证保护中间件：验证token，保护需要登录的路由
 */
const protect = async (req, res, next) => {
  try {
    // 1. 获取token
    let token;
    // 优先从Authorization header获取：Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // 也可以从cookie获取
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: '您尚未登录，请先登录获取访问权限'
      });
    }

    // 2. 验证token签名和有效期
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded: { id: 'xxx', iat: 1234567890, exp: 1234567890 }
    console.log('Token解码内容:', decoded);

    // 3. 检查用户是否还存在（可能用户已被删除）
    const currentUser = users.find(u => u.id === decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: '此token对应的用户已不存在'
      });
    }

    // 4. （可选）检查用户是否在token签发后修改了密码
    // 比如用户改了密码，旧token应该失效
    // if (currentUser.passwordChangedAt && decoded.iat < currentUser.passwordChangedAt.getTime() / 1000) {
    //   return next(new AppError('用户最近修改了密码，请重新登录', 401));
    // }

    // 5. 把用户信息挂载到req对象，后续路由可以使用
    req.user = currentUser;
    next();
  } catch (err) {
    // token验证失败
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: '无效的token，请重新登录'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: 'token已过期，请重新登录'
      });
    }
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: '认证失败'
    });
  }
};

/**
 * 权限限制中间件：限制只有某些角色可以访问
 * 使用：restrictTo('admin', 'moderator')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        status: 'fail',
        message: '您没有权限执行此操作'
      });
    }
    next();
  };
};

// ============================================
// 第五部分：认证路由
// ============================================

// 首页
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '身份认证JWT Demo',
    endpoints: [
      'POST /api/auth/register - 用户注册',
      'POST /api/auth/login - 用户登录',
      'GET /api/auth/profile - 获取个人信息（需要登录）',
      'GET /api/auth/admin - 管理员专用接口（需要admin角色）',
      'GET /api/users - 用户列表（公开接口）'
    ]
  });
});

/**
 * @route POST /api/auth/register
 * @desc 用户注册
 * @body { name, email, password, passwordConfirm }
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // 1. 验证必填字段
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        code: 400,
        status: 'fail',
        message: '请填写所有必填字段'
      });
    }

    // 2. 验证密码确认
    if (password !== passwordConfirm) {
      return res.status(400).json({
        code: 400,
        status: 'fail',
        message: '两次输入的密码不一致'
      });
    }

    // 3. 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        status: 'fail',
        message: '密码长度至少6位'
      });
    }

    // 4. 验证邮箱格式
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        status: 'fail',
        message: '请输入有效的邮箱地址'
      });
    }

    // 5. 检查邮箱是否已注册
    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        status: 'fail',
        message: '该邮箱已被注册'
      });
    }

    // 6. 哈希密码
    // bcrypt.hash是异步操作，salt rounds是计算轮数，12是比较安全的值
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('密码哈希完成');

    // 7. 创建新用户
    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',  // 默认普通用户角色
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    console.log('新用户注册:', { id: newUser.id, email: newUser.email, name: newUser.name });

    // 8. 签发token并返回
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: '注册失败，请稍后重试'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc 用户登录
 * @body { email, password }
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 检查邮箱和密码是否提供
    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        status: 'fail',
        message: '请提供邮箱和密码'
      });
    }

    // 2. 查找用户（注意：要把password也查出来，因为需要比对）
    const user = users.find(u => u.email === email.toLowerCase());

    // 3. 验证用户存在 + 密码正确
    // 注意：即使用户不存在也返回相同的错误信息，防止攻击者枚举邮箱
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        code: 401,
        status: 'fail',
        message: '邮箱或密码错误'
      });
    }

    // 4. 登录成功，签发token
    console.log('用户登录成功:', { id: user.id, email: user.email });
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: '登录失败，请稍后重试'
    });
  }
});

/**
 * @route GET /api/auth/profile
 * @desc 获取当前用户信息（需要登录）
 */
app.get('/api/auth/profile', protect, (req, res) => {
  // 能走到这里说明已经通过protect中间件认证，req.user就是当前用户
  const userResponse = { ...req.user };
  delete userResponse.password;  // 永远不要返回密码给前端

  res.json({
    code: 200,
    status: 'success',
    data: {
      user: userResponse
    }
  });
});

/**
 * @route GET /api/auth/admin
 * @desc 管理员专用接口
 */
app.get('/api/auth/admin', protect, restrictTo('admin'), (req, res) => {
  res.json({
    code: 200,
    status: 'success',
    message: '管理员面板数据',
    data: {
      totalUsers: users.length,
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
    }
  });
});

/**
 * @route GET /api/auth/logout
 * @desc 退出登录（JWT无状态，前端删除token即可；cookie方式需要清除cookie）
 */
app.get('/api/auth/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.json({
    code: 200,
    status: 'success',
    message: '已退出登录'
  });
});

// 公开接口：用户列表（不需要登录）
app.get('/api/users', (req, res) => {
  const publicUsers = users.map(u => ({
    id: u.id,
    name: u.name
  }));
  res.json({
    code: 200,
    results: publicUsers.length,
    data: { users: publicUsers }
  });
});

// ============================================
// 第六部分：初始化一个测试管理员账号
// ============================================

const initTestData = async () => {
  // 创建一个测试管理员
  const adminPassword = await bcrypt.hash('admin123', 12);
  users.push({
    id: 'admin001',
    name: '管理员',
    email: '09Ith@ZULt.gHc',
    password: adminPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  // 创建一个测试普通用户
  const userPassword = await bcrypt.hash('123456', 12);
  users.push({
    id: 'user001',
    name: '测试用户',
    email: 'yDIk@qdzW.a9x',
    password: userPassword,
    role: 'user',
    createdAt: new Date().toISOString()
  });

  console.log('');
  console.log('========================================');
  console.log('  🔐 身份认证Demo已准备就绪');
  console.log('========================================');
  console.log('');
  console.log('📋 预置测试账号：');
  console.log('  管理员：09Ith@ZULt.gHc / admin123');
  console.log('  普通用户：yDIk@qdzW.a9x / 123456');
  console.log('');
  console.log('🧪 测试步骤：');
  console.log('  1. 先注册一个新账号 POST /api/auth/register');
  console.log('  2. 或者直接用上面的测试账号登录 POST /api/auth/login');
  console.log('  3. 复制返回的token');
  console.log('  4. 在需要登录的接口请求头加 Authorization: Bearer <你的token>');
  console.log('  5. 试试 GET /api/auth/profile 获取个人信息');
  console.log('  6. 用管理员账号登录试试 GET /api/auth/admin');
  console.log('');
};

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, async () => {
  await initTestData();
  console.log(\`🚀 服务器运行在 http://localhost:\${PORT}\`);
});

// 导出中间件供其他模块使用
module.exports = { protect, restrictTo, signToken };
`
  },
  {
    id: "nb-validation",
    group: "第四部分：工程化与安全",
    icon: "🛡️",
    title: "输入验证zod/joi与安全防护",
    content: `# 输入验证zod/joi与安全防护

永远不要相信用户的输入！这是后端安全的第一准则。用户可能会误操作，也可能是恶意攻击者。本章我们学习如何验证输入数据，以及防范常见的Web攻击：XSS、NoSQL注入、参数污染等。

---

## 一、为什么必须做输入验证？

**前端验证是为了用户体验，后端验证才是安全防线。** 前端验证可以绕过（直接发HTTP请求、用Postman、修改JS），所以后端必须做验证！

没有验证的风险：
- 数据库被注入攻击，数据泄露或被篡改
- 用户提交恶意脚本，其他用户访问时执行（XSS）
- 数据格式混乱，导致程序崩溃
- 参数被篡改，越权访问他人数据
- 垃圾数据塞满数据库

---

## 二、数据验证库：zod vs joi

手写验证逻辑又麻烦又容易漏，用验证库：
- 声明式定义Schema
- 自动验证类型、格式、范围
- 自动生成友好的错误信息
- 类型安全（zod对TypeScript支持极好）

### joi（经典老牌）
\`\`\`javascript
const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
  age: Joi.number().integer().min(18).max(120)
});

const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ message: error.details[0].message });
}
\`\`\`

### zod（现代新星，TypeScript优先）
\`\`\`javascript
const { z } = require('zod');

const userSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(30),
  age: z.number().int().min(18).max(120).optional()
});

const result = userSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
// result.data 是验证后的数据，TypeScript能自动推断类型
\`\`\`

zod相比joi的优势：
- 天然TypeScript支持，类型推断非常强
- API更简洁现代
- 体积更小
- 支持组合、转换、细化校验等高级功能

本章我们主要用zod来演示。

---

## 三、常见Web攻击与防护

### 1. XSS攻击（跨站脚本攻击）

**攻击原理**：用户在输入框提交恶意JavaScript代码，服务器没处理就存入数据库。其他用户浏览页面时，这段JS代码被执行，可以：
- 窃取Cookie（劫持登录态）
- 伪造用户操作
- 跳转到钓鱼网站
- 篡改页面内容

**XSS类型**：
- **存储型XSS**：恶意代码存到数据库，所有访问者都受害（最危险）
- **反射型XSS**：恶意代码在URL参数中，服务端"反射"回页面
- **DOM型XSS**：前端JS直接处理用户输入导致，不经过服务器

**防护措施**：
1. **对用户输入进行HTML转义**：\`<\`转成\`&lt;\`，\`>\`转成\`&gt;\`，\`"\`转成\`&quot;\`等
2. **设置合适的HTTP头**：
   - \`Content-Security-Policy\`：限制脚本来源
   - \`X-XSS-Protection\`：开启浏览器XSS防护
3. **Cookie设置HttpOnly**：JS无法读取Cookie，防止Cookie窃取
4. **使用模板引擎自动转义**：React、Vue默认都会转义
5. **不要用\`innerHTML\`、\`document.write()\`等危险API**，用\`textContent\`

\`\`\`javascript
// HTML转义函数
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
\`\`\`

### 2. NoSQL注入攻击（MongoDB）

**攻击原理**：SQL注入是传入恶意SQL片段，NoSQL注入（MongoDB）是传入恶意MongoDB操作符。

比如登录接口：
\`\`\`javascript
// 危险写法：直接把用户输入传入查询
const user = await User.findOne({
  username: req.body.username,
  password: req.body.password
});
\`\`\`

如果攻击者传：
\`\`\`json
{
  "username": { "\$gt": "" },
  "password": { "\$gt": "" }
}
\`\`\`
因为\`\$gt: ""\`匹配所有非空值，这样就能绕过登录！

**防护措施**：
1. **用验证库验证数据类型**：username和password必须是字符串，拒绝对象类型
2. **使用ORM/ODM的参数化查询**：Mongoose会安全处理
3. **不要直接把req.body整个传入查询**：只取需要的字段，明确指定类型
4. **安装mongo-sanitize**：清除输入中的\`\$\`和\`.\`开头的键（MongoDB操作符）

\`\`\`javascript
const sanitize = require('mongo-sanitize');

// 清理用户输入
const cleanUsername = sanitize(req.body.username);
const cleanPassword = sanitize(req.body.password);
\`\`\`

### 3. HTTP参数污染（HPP）

**攻击原理**：HTTP协议允许同名参数出现多次，比如：
\`\`\`
GET /search?q=apple&q=tomato
\`\`\`
Express的req.query.q可能是数组\`['apple', 'tomato']\`，如果后端期望字符串，可能出错甚至被利用。

**防护措施**：
- 使用hpp中间件，自动选择第一个参数或配置白名单
- 明确验证参数类型，期望字符串就不要接受数组

\`\`\`javascript
const hpp = require('hpp');
app.use(hpp());  // 自动处理参数污染
// 或者白名单：某些参数确实需要数组
app.use(hpp({ whitelist: ['tags', 'categories'] }));
\`\`\`

### 4. 其他常见安全问题

| 攻击类型 | 防护方式 |
|---------|---------|
| CSRF（跨站请求伪造） | SameSite Cookie、CSRF Token |
| 暴力破解密码 | 登录限流、验证码、bcrypt慢哈希 |
| 敏感数据泄露 | HTTPS、密码哈希、不返回多余字段 |
| SQL注入 | 参数化查询、ORM、输入验证 |
| 目录遍历 | 路径验证、不要直接用用户输入拼接文件路径 |

---

## 四、安全头设置：helmet

helmet是一个Express中间件，自动设置多个安全相关的HTTP响应头：
- \`X-DNS-Prefetch-Control\`
- \`X-Frame-Options\`：防止点击劫持
- \`X-Powered-By\`：移除X-Powered-By头（不暴露用的Express）
- \`Strict-Transport-Security\`：强制HTTPS
- \`X-Download-Options\`
- \`X-Content-Type-Options\`：防止MIME嗅探
- \`Content-Security-Policy\`：内容安全策略
- ...等

\`\`\`javascript
const helmet = require('helmet');
app.use(helmet());  // 一行搞定！
\`\`\`

---

## 五、CORS跨域配置

如果前后端分离部署（不同域名/端口），浏览器会有跨域限制。用cors中间件配置：
\`\`\`javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://yourfrontend.com', 'http://localhost:3000'],  // 允许的源
  credentials: true,  // 允许携带Cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
\`\`\`
生产环境不要用\`origin: '*'\`，要明确指定允许的域名。

---

## 六、输入验证最佳实践

1. **验证层和业务逻辑分离**：写可复用的验证中间件
2. **尽早验证**：请求刚进来就验证，不要等执行到业务逻辑才发现参数不对
3. **白名单而非黑名单**：只允许已知合法的输入，而不是试图过滤非法输入
4. **验证所有输入**：req.body、req.query、req.params、req.headers都要验证
5. **类型转换后再验证**：比如URL参数都是字符串，数字需要先转换
6. **清晰的错误信息**：告诉用户哪个字段错了、为什么错
7. **净化输出**：存入数据库前和返回给前端前都做相应处理

---

## 七、实战Demo

本章代码Demo实现了：
1. zod数据验证Schema定义
2. 通用验证中间件工厂
3. 用户注册、登录、发帖的参数验证
4. XSS防护：HTML转义
5. NoSQL注入防护：输入清理
6. 参数污染防护
7. helmet安全头配置
8. CORS跨域配置
9. 各种攻击的演示和防护
`,
    code: `// ============================================
// 输入验证zod/joi与安全防护 完整Demo
// 需要安装的依赖：
// npm install express zod cors helmet
// ============================================

const express = require('express');
const { z, ZodError } = require('zod');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = 3002;

// ============================================
// 第一部分：安全中间件配置
// ============================================

// helmet：设置安全HTTP头，放在最前面
app.use(helmet());

// CORS跨域配置（生产环境要配置具体的origin，不要用*）
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend.com']  // 生产环境指定具体域名
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,  // 允许携带cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));  // 限制请求体大小，防止大请求攻击

// 简单的请求日志
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`);
  next();
});

// ============================================
// 第二部分：工具函数
// ============================================

/**
 * XSS防护：HTML转义
 * 把特殊字符转义成HTML实体，防止恶意脚本执行
 */
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * 递归净化对象中的所有字符串值（XSS防护）
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return escapeHtml(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // NoSQL注入防护：拒绝以$或.开头的键（MongoDB操作符）
      if (key.startsWith('$') || key.includes('.')) {
        console.warn('检测到潜在的NoSQL注入，已移除键:', key);
        continue;
      }
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
};

/**
 * zod验证中间件工厂
 * @param {z.ZodSchema} schema - zod验证schema
 * @param {'body' | 'query' | 'params'} source - 验证来源
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // 验证并清理数据
      const result = schema.parse(req[source]);
      // XSS净化：转义所有字符串
      req[source] = sanitizeObject(result);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // 格式化zod错误信息
        const errors = err.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }));
        return res.status(400).json({
          code: 400,
          status: 'fail',
          message: '输入数据验证失败',
          errors
        });
      }
      next(err);
    }
  };
};

// ============================================
// 第三部分：定义zod验证Schema
// ============================================

// 用户注册Schema
const registerSchema = z.object({
  name: z
    .string({ required_error: '姓名是必填项' })
    .trim()
    .min(2, '姓名至少2个字符')
    .max(50, '姓名最多50个字符')
    .regex(/^[\\u4e00-\\u9fa5a-zA-Z\\s]+$/, '姓名只能包含中文、英文和空格'),

  email: z
    .string({ required_error: '邮箱是必填项' })
    .trim()
    .email('请输入有效的邮箱地址')
    .toLowerCase(),

  password: z
    .string({ required_error: '密码是必填项' })
    .min(6, '密码至少6位')
    .max(30, '密码最多30位')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),

  passwordConfirm: z.string({ required_error: '请确认密码' }),

  age: z
    .number({ invalid_type_error: '年龄必须是数字' })
    .int('年龄必须是整数')
    .min(14, '年龄至少14岁')
    .max(120, '年龄不能超过120岁')
    .optional(),

  website: z
    .string()
    .trim()
    .url('请输入有效的URL（以http://或https://开头）')
    .optional()
    .or(z.literal(''))
}).refine(data => data.password === data.passwordConfirm, {
  message: '两次输入的密码不一致',
  path: ['passwordConfirm']
});

// 用户登录Schema
const loginSchema = z.object({
  email: z
    .string({ required_error: '邮箱是必填项' })
    .trim()
    .email('请输入有效的邮箱地址'),
  password: z
    .string({ required_error: '密码是必填项' })
    .min(1, '密码不能为空')
});

// 帖子Schema
const postSchema = z.object({
  title: z
    .string({ required_error: '标题是必填项' })
    .trim()
    .min(5, '标题至少5个字符')
    .max(200, '标题最多200个字符'),

  content: z
    .string({ required_error: '内容是必填项' })
    .trim()
    .min(10, '内容至少10个字符')
    .max(50000, '内容最多50000个字符'),

  tags: z
    .array(z.string().trim().min(1).max(20))
    .max(5, '最多5个标签')
    .optional(),

  category: z
    .enum(['tech', 'life', 'news', 'other'], {
      errorMap: () => ({ message: '分类必须是: tech, life, news, other' })
    }),

  isPublic: z.boolean().default(true)
});

// 分页查询参数Schema
const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val))
    .refine(val => val > 0, '页码必须大于0'),

  limit: z
    .string()
    .optional()
    .default('10')
    .transform(val => parseInt(val))
    .refine(val => val >= 1 && val <= 100, '每页数量必须在1-100之间'),

  category: z
    .enum(['tech', 'life', 'news', 'other'])
    .optional(),

  keyword: z
    .string()
    .trim()
    .max(50)
    .optional()
});

// URL参数ID验证
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, '无效的ID格式')  // MongoDB ObjectId格式
});

// ============================================
// 第四部分：模拟数据库
// ============================================

const users = [];
const posts = [];

// ============================================
// 第五部分：路由定义
// ============================================

// 首页
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '输入验证与安全防护Demo',
    security: {
      helmet: '✅ 安全头已配置',
      cors: '✅ 跨域已配置',
      xssProtection: '✅ XSS防护已启用',
      noSqlInjection: '✅ NoSQL注入防护已启用',
      inputValidation: '✅ zod输入验证已启用'
    },
    endpoints: [
      'POST /api/register - 用户注册（带验证）',
      'POST /api/login - 用户登录（带验证）',
      'POST /api/posts - 创建帖子（带验证+XSS演示）',
      'GET /api/posts - 获取帖子列表（分页+查询参数验证）',
      'GET /api/posts/:id - 获取单个帖子',
      'GET /api/xss-demo - XSS攻击演示',
      'POST /api/nosql-injection-demo - NoSQL注入演示'
    ]
  });
});

// 用户注册 - 应用验证中间件
app.post('/api/register', validate(registerSchema), (req, res) => {
  const { name, email, password, age, website } = req.body;

  // 检查邮箱是否已存在
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      code: 400,
      status: 'fail',
      message: '该邮箱已被注册'
    });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: '***[哈希后的密码]***',  // 实际用bcrypt
    age,
    website,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  console.log('新用户注册成功:', { id: newUser.id, email: newUser.email });

  res.status(201).json({
    code: 201,
    status: 'success',
    message: '注册成功',
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    }
  });
});

// 用户登录
app.post('/api/login', validate(loginSchema), (req, res) => {
  const { email, password } = req.body;

  // 模拟验证
  const user = users.find(u => u.email === email);
  if (!user) {
    // 注意：不要明确说"用户不存在"，防止枚举用户
    return res.status(401).json({
      code: 401,
      status: 'fail',
      message: '邮箱或密码错误'
    });
  }

  res.json({
    code: 200,
    status: 'success',
    message: '登录成功',
    data: {
      token: '***[JWT Token]***',
      user: { id: user.id, name: user.name, email: user.email }
    }
  });
});

// 创建帖子
app.post('/api/posts', validate(postSchema), (req, res) => {
  const { title, content, tags, category, isPublic } = req.body;

  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    tags,
    category,
    isPublic,
    author: 'demo-user',
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  console.log('新帖子创建:', { id: newPost.id, title: newPost.title });

  res.status(201).json({
    code: 201,
    status: 'success',
    data: { post: newPost }
  });
});

// 获取帖子列表 - 验证query参数
app.get('/api/posts', validate(paginationSchema, 'query'), (req, res) => {
  const { page, limit, category, keyword } = req.query;

  let filteredPosts = [...posts];

  // 分类筛选
  if (category) {
    filteredPosts = filteredPosts.filter(p => p.category === category);
  }

  // 关键词搜索
  if (keyword) {
    const kw = keyword.toLowerCase();
    filteredPosts = filteredPosts.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.content.toLowerCase().includes(kw)
    );
  }

  // 分页
  const startIndex = (page - 1) * limit;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);

  res.json({
    code: 200,
    status: 'success',
    results: paginatedPosts.length,
    pagination: {
      page,
      limit,
      total: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / limit)
    },
    data: { posts: paginatedPosts }
  });
});

// 获取单个帖子 - 验证URL参数
app.get('/api/posts/:id', validate(idParamSchema, 'params'), (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({
      code: 404,
      status: 'fail',
      message: '帖子不存在'
    });
  }
  res.json({ code: 200, status: 'success', data: { post } });
});

// ============================================
// 第六部分：安全演示接口
// ============================================

/**
 * XSS攻击演示
 * 尝试提交恶意脚本，看看转义效果
 */
app.post('/api/xss-demo', (req, res) => {
  const userInput = req.body.content || '';
  console.log('收到的原始输入:', userInput);

  // 未转义（危险！直接存入数据库会导致XSS）
  const unsafeOutput = userInput;

  // 转义后（安全）
  const safeOutput = escapeHtml(userInput);
  const safeObject = sanitizeObject(req.body);

  res.json({
    code: 200,
    message: 'XSS防护演示',
    warning: '如果前端用innerHTML渲染unsafeOutput，会执行恶意脚本！',
    comparison: {
      originalInput: userInput,
      unsafeOutput: unsafeOutput,
      safeOutput: safeOutput,
      entireSanitizedBody: safeObject
    },
    hint: '试试输入: <script>alert("XSS!")</script> 看看转义效果'
  });
});

/**
 * NoSQL注入演示
 * 演示如何检测和防止MongoDB注入
 */
app.post('/api/nosql-injection-demo', (req, res) => {
  const maliciousInput = req.body;
  console.log('收到的请求体:', maliciousInput);

  // 检测可能的注入尝试
  const hasInjection = JSON.stringify(maliciousInput).includes('$') ||
    Object.keys(maliciousInput).some(k => k.startsWith('$') || k.includes('.'));

  // 净化输入
  const sanitized = sanitizeObject(maliciousInput);

  res.json({
    code: 200,
    message: 'NoSQL注入防护演示',
    possibleAttackDetected: hasInjection,
    explanation: hasInjection
      ? '检测到MongoDB操作符（$或.开头的键），可能是注入攻击！'
      : '未检测到明显注入特征',
    originalInput: maliciousInput,
    sanitizedInput: sanitized,
    hint: '试试提交: { "email": { "$gt": "" }, "password": { "$gt": "" } }'
  });
});

// 参数污染演示
app.get('/api/hpp-demo', (req, res) => {
  res.json({
    code: 200,
    message: '参数污染演示',
    hint: '试试访问: /api/hpp-demo?name=张三&name=李四',
    receivedQuery: req.query,
    explanation: 'Express默认会把同名参数变成数组。HPP中间件可以自动处理这个问题，只保留第一个或配置白名单。'
  });
});

// ============================================
// 第七部分：全局错误处理
// ============================================

app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? '服务器错误' 
      : err.message
  });
});

// ============================================
// 启动服务器
// ============================================

// 创建一些示例帖子
posts.push({
  id: '1',
  title: '欢迎来到安全开发教程',
  content: '这是第一篇帖子，演示输入验证和安全防护。所有用户输入都经过严格验证和XSS转义。',
  tags: ['安全', 'Node.js'],
  category: 'tech',
  isPublic: true,
  author: 'system',
  createdAt: new Date().toISOString()
});

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('  🛡️  输入验证与安全防护Demo已启动');
  console.log('========================================');
  console.log('');
  console.log(\`🚀 服务器运行在 http://localhost:\${PORT}\`);
  console.log('');
  console.log('🔒 已启用的安全防护：');
  console.log('   ✅ helmet - 安全HTTP头');
  console.log('   ✅ CORS - 跨域配置');
  console.log('   ✅ zod - 输入数据验证');
  console.log('   ✅ XSS防护 - HTML转义');
  console.log('   ✅ NoSQL注入防护 - 操作符清理');
  console.log('   ✅ 请求体大小限制 - 10kb');
  console.log('');
  console.log('🧪 推荐测试：');
  console.log('');
  console.log('1. 测试验证失败：');
  console.log('   POST /api/register 故意传错误格式的数据，看错误提示');
  console.log('   例如：邮箱格式错、密码太短、两次密码不一致等');
  console.log('');
  console.log('2. 测试XSS防护：');
  console.log('   POST /api/xss-demo { "content": "<script>alert(\'XSS\')</script>" }');
  console.log('');
  console.log('3. 测试NoSQL注入：');
  console.log('   POST /api/nosql-injection-demo');
  console.log('   body: { "email": { "$gt": "" }, "password": { "$gt": "" } }');
  console.log('');
  console.log('4. 测试参数污染：');
  console.log('   GET /api/hpp-demo?name=张三&name=李四');
  console.log('');
  console.log('5. 正常流程：');
  console.log('   先注册，再创建帖子，查看列表');
  console.log('');
});
`
  }
];
