export const chapters = [
  {
    id: "n2-error-design",
    title: "错误处理体系设计",
    icon: "⚠️",
    group: "第四部分 工程化与架构设计",
    content: `## 错误处理体系设计

错误处理是 Node.js 应用程序中最容易被忽视但又至关重要的一环。一个健壮的错误处理体系不仅能帮助开发者快速定位问题，还能在生产环境中保证系统的稳定性和可观测性。很多初学者甚至有一定经验的开发者，往往只关注"正常路径"的代码，而对错误处理敷衍了事——要么随意吞掉错误，要么抛出后不做任何处理，最终导致线上问题频发却难以排查。

### 一、JavaScript Error 对象详解

在深入错误处理体系之前，我们必须彻底理解原生 Error 对象的结构。Error 是 JavaScript 的内置对象，当运行时错误发生时，系统会抛出 Error 对象的实例。一个标准的 Error 对象包含以下几个关键属性：

#### 1.1 name 属性

\`name\` 属性表示错误的类型名称。原生的错误类型包括：
- **Error**：通用错误类型，所有其他错误类型的基类
- **SyntaxError**：语法错误，通常在代码解析阶段抛出
- **ReferenceError**：引用错误，访问未定义的变量时抛出
- **TypeError**：类型错误，对非预期类型的值执行操作时抛出
- **RangeError**：范围错误，值不在允许的范围内（如递归过深）
- **URIError**：URI 处理函数使用不当时抛出
- **EvalError**：eval() 函数使用错误（已废弃）

#### 1.2 message 属性

\`message\` 是人类可读的错误描述信息，应该清晰地说明"发生了什么问题"。好的错误信息应该包含足够的上下文，而不是简单的"出错了"。例如，"用户 12345 不存在"比"找不到用户"要好得多，因为它包含了具体的用户ID。

#### 1.3 stack 属性

\`stack\` 属性是错误发生时的调用堆栈跟踪，这是调试错误时最有价值的信息。堆栈跟踪从错误发生的位置开始，向上追溯每一层函数调用，包含文件名、行号和列号。需要注意的是，stack 属性的格式在不同 JavaScript 引擎中可能略有不同（V8、SpiderMonkey、JavaScriptCore），但核心信息是一致的。

#### 1.4 cause 属性（ES2022）

ES2022 引入了 \`cause\` 属性，这是一个非常重要的改进。它允许我们在创建错误时指定导致该错误的原始错误，从而形成错误链（error chain）。这在多层架构中尤为重要——当底层错误向上传递时，我们可以在每一层添加上下文信息，同时保留原始错误的完整信息。

### 二、自定义错误类型

在实际项目中，仅仅使用原生的 Error 类型是远远不够的。我们需要根据业务场景定义自己的错误类型，这样可以在错误处理时精确地区分不同类型的错误，采取不同的处理策略。

自定义错误类型的标准做法是继承 Error 类：

\`\`\`javascript
class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational !== false;
    Error.captureStackTrace(this, this.constructor);
  }
}
\`\`\`

这里有几个关键点需要注意：
1. 调用父类构造函数时传递 options，ES2022 的 Error 构造函数支持第二个参数来设置 cause
2. 将 name 设置为构造函数名，而不是硬编码，这样子类也能正确显示
3. 使用 \`Error.captureStackTrace\` 来捕获正确的堆栈信息，排除自定义错误类本身的构造函数调用
4. 添加业务相关的属性，如 statusCode（HTTP状态码）、isOperational（是否是可预期的操作错误）

常见的自定义错误类型包括：
- **NotFoundError**：资源不存在，对应 404
- **ValidationError**：输入验证失败，对应 400
- **UnauthorizedError**：未认证，对应 401
- **ForbiddenError**：无权限，对应 403
- **ConflictError**：资源冲突，对应 409
- **TooManyRequestsError**：请求过多，对应 429
- **InternalError**：内部服务器错误，对应 500

### 三、错误分类：操作错误 vs 编程错误

Node.js 官方文档将错误分为两大类，理解这个分类至关重要：

#### 3.1 操作错误（Operational Errors）

操作错误是指**程序本身没有bug**，但在运行时遇到了无法避免的问题。这些错误是正常运行的一部分，是可以预期的，程序应该能够妥善处理。例如：
- 网络请求失败（连接超时、DNS解析失败）
- 文件系统操作失败（文件不存在、权限不足）
- 数据库连接失败
- 用户输入无效
- 内存不足
- 第三方服务返回错误

对于操作错误，我们应该：
- 捕获并记录详细日志
- 向用户返回友好的错误信息
- 根据错误类型决定是否重试
- 不应该导致进程退出

#### 3.2 编程错误（Programmer Errors）

编程错误是指**程序本身有bug**，是开发者的错误。这些错误是不应该发生的，一旦发生就意味着程序逻辑有问题。例如：
- 调用不存在的函数
- 访问 undefined 的属性
- 传入错误类型的参数
- 忘记处理Promise rejection
- 数组越界访问
- 未捕获的异常

对于编程错误，我们不应该试图"优雅处理"并继续运行，因为程序的状态已经不可预测了。正确的做法是：
- 记录错误并立即崩溃
- 让进程管理器（如 PM2、systemd）自动重启
- 在开发阶段就通过测试和代码审查发现这些问题

这就是为什么很多 Node.js 最佳实践强调：**对于未捕获的异常，应该记录日志后退出进程**。试图在发生编程错误后继续运行，可能会导致更严重的问题（如数据损坏）。

### 四、错误日志记录的最佳实践

错误日志是排查线上问题的唯一线索，糟糕的日志等于没有日志。以下是错误日志的最佳实践：

#### 4.1 记录完整的错误信息

仅仅记录 \`error.message\` 是远远不够的，必须记录完整的错误堆栈（error.stack）。同时，应该记录：
- 错误发生的时间戳
- 错误类型（name）
- 错误消息（message）
- 错误堆栈（stack）
- 错误原因链（cause chain）
- 相关的上下文信息（用户ID、请求ID、参数等）
- 进程ID、主机名等环境信息

#### 4.2 使用结构化日志

不要只记录纯文本字符串，应该使用 JSON 格式的结构化日志。结构化日志的好处是可以被日志系统（如 ELK、Loki）轻松解析、索引和检索。例如，你可以快速搜索"过去1小时内所有 statusCode=500 的错误"，或者按 requestId 追踪单个请求的完整链路。

#### 4.3 不要在循环中记录错误

如果错误在一个高频循环中发生，不要每次都记录日志，否则会瞬间产生大量日志，撑爆磁盘。应该采用采样或聚合的方式。

#### 4.4 区分日志级别

错误日志应该使用 error 级别，而不是 info 或 warn。同时，严重的错误（如进程崩溃）应该触发告警。

### 五、绝对不要吞掉错误

"吞掉错误"是 Node.js 开发中最常见也是最危险的反模式。以下是几种典型的错误吞掉方式：

\`\`\`javascript
// 反模式1：空的 catch 块
try {
  riskyOperation();
} catch (e) {
  // 什么都不做！
}

// 反模式2：只打个日志，不做任何处理
somePromise.then(result => {
  // ...
}).catch(err => {
  console.log('出错了'); // 甚至没记录 err 对象！
});

// 反模式3：在回调中忽略错误
fs.readFile('file.txt', (err, data) => {
  // 不检查 err！
  console.log(data);
});
\`\`\`

吞掉错误的后果是灾难性的：程序在出错后继续运行，但状态可能已经不一致，问题被隐藏起来直到引发更大的故障。等到你发现问题时，现场早就消失了，根本无法排查。

#### 5.1 unhandledRejection

当 Promise 被 reject 但没有 catch 处理时，会触发 \`unhandledRejection\` 事件。在 Node.js 未来的版本中，未处理的 Promise rejection 会直接导致进程退出。

\`\`\`javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise Rejection:', reason);
  // 记录日志后退出，和 uncaughtException 一样处理
  process.exit(1);
});
\`\`\`

#### 5.2 uncaughtException

当同步代码抛出异常但没有被任何 try/catch 捕获时，会触发 \`uncaughtException\` 事件。这是进程崩溃前的最后机会。

\`\`\`javascript
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 注意：此时不能安全地继续运行，应该记录日志后退出
  // 先尝试清理资源，然后退出
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
\`\`\`

**重要**：uncaughtException 事件处理函数中不应该继续执行正常的业务逻辑，因为此时程序的状态已经不可预测。正确的做法是记录完必要的日志后，给进程一点时间完成正在进行的操作（如写入日志），然后退出。

### 六、关于 domain 模块

\`domain\` 模块曾经被设计用来处理异步操作中的错误捕获，但它已经被**正式废弃**了。Domain 模块存在根本性的设计缺陷：
- 它无法捕获所有场景下的错误
- 会导致内存泄漏
- 错误捕获后资源清理不彻底
- API 设计复杂且容易被误用

Node.js 核心团队已经明确表示不会修复 domain 的问题，新代码绝对不应该使用 domain。正确的错误处理方式是：
- 使用 try/catch 处理同步错误
- 正确处理 Promise 的 rejection
- 在 EventEmitter 上监听 error 事件
- 使用 async/await 时正确使用 try/catch

### 七、多层架构中的错误传递

在多层架构（Controller层 → Service层 → Repository层 → 数据库）中，错误应该如何传递是一个需要仔细设计的问题。

#### 7.1 错误包装（Error Wrapping）

当底层抛出错误时，上层不应该直接把底层错误抛出去，因为底层错误可能包含实现细节（如数据库的SQL错误信息），不应该暴露给上层调用者（更不应该暴露给终端用户）。正确的做法是**捕获底层错误，包装成上层能理解的错误，同时通过 cause 保留原始错误**。

\`\`\`javascript
// Repository 层
async function findUserById(id) {
  try {
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  } catch (err) {
    throw new AppError('查询用户失败', {
      cause: err,
      statusCode: 500
    });
  }
}

// Service 层
async function getUser(id) {
  try {
    const user = await findUserById(id);
    if (!user) {
      throw new NotFoundError(\`用户 \${id} 不存在\`);
    }
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err; // 已经是业务错误，直接重新抛出
    }
    throw new AppError('获取用户信息失败', { cause: err });
  }
}
\`\`\`

#### 7.2 早期抛出，后期捕获

错误应该在**最早发现问题的地方抛出**（越具体越好），而在**最上层统一捕获处理**（如框架的错误处理中间件）。这样的好处是：
- 底层代码不需要关心错误如何展示给用户，只需要如实报告问题
- 错误处理逻辑集中，不会散落在各个地方
- 可以在捕获点统一处理日志记录、告警、用户响应等

#### 7.3 错误处理中间件模式

在 Web 框架（如 Express、Koa）中，错误处理中间件是集中处理错误的最佳位置。错误处理中间件有四个参数 \`(err, req, res, next)\`，当调用 \`next(err)\` 时，请求会跳过所有普通中间件，直接进入错误处理中间件。

错误处理中间件的职责包括：
1. 记录错误日志（包含请求ID、用户信息等上下文）
2. 根据错误类型设置合适的 HTTP 状态码
3. 向客户端返回标准化的错误响应
4. 对于5xx错误，触发告警
5. 不要向客户端暴露堆栈信息和内部细节

总结来说，错误处理不是简单的 try/catch，而是一个体系：自定义错误类型、错误分类、日志规范、错误传递策略、全局兜底处理，缺一不可。一个设计良好的错误处理体系，能让你在半夜收到告警时快速定位问题，而不是手足无措。
`,
    code: `const util = require('util');

class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational !== false;
    this.code = options.code || 'INTERNAL_ERROR';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
  }
}

class ValidationError extends AppError {
  constructor(message = '参数验证失败', details) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR' });
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未授权访问') {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED' });
  }
}

class DatabaseError extends AppError {
  constructor(message, cause) {
    super(message, { statusCode: 500, code: 'DATABASE_ERROR', cause });
  }
}

function simulateDbQuery(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId === '0') {
        reject(new Error('连接超时: ETIMEDOUT'));
      } else if (userId === '1') {
        resolve(null);
      } else {
        resolve({ id: userId, name: '张三', email: 'YA9RfmB0@dTdpwNO.TAM' });
      }
    }, 100);
  });
}

async function findUserById(userId) {
  console.log('[Repository] 查询用户:', userId);
  try {
    const user = await simulateDbQuery(userId);
    if (!user) {
      throw new NotFoundError(\`用户 \${userId} 不存在\`);
    }
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new DatabaseError('数据库查询失败', err);
  }
}

async function getUserService(userId) {
  console.log('[Service] 获取用户信息');
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('用户ID必须是非空字符串');
  }
  try {
    const user = await findUserById(userId);
    return { ...user, role: 'user' };
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('获取用户服务异常', { cause: err });
  }
}

function errorHandlerMiddleware(err, ctx = {}) {
  console.log('\\n========== 错误处理中间件 ==========');
  console.log('请求ID:', ctx.requestId || 'N/A');
  console.log('错误类型:', err.name);
  console.log('错误码:', err.code);
  console.log('状态码:', err.statusCode);
  console.log('错误消息:', err.message);
  
  if (err.details) {
    console.log('错误详情:', err.details);
  }
  
  console.log('\\n--- 错误堆栈 ---');
  console.log(err.stack);
  
  if (err.cause) {
    console.log('\\n--- 错误原因链 ---');
    let current = err.cause;
    let depth = 1;
    while (current) {
      console.log(\`Caused by [\${depth}]: \${current.name}: \${current.message}\`);
      if (current.stack) {
        console.log(current.stack.split('\\n').slice(0, 3).join('\\n'));
      }
      current = current.cause;
      depth++;
    }
  }
  
  const response = {
    success: false,
    error: {
      code: err.code,
      message: err.isOperational ? err.message : '服务器内部错误'
    },
    requestId: ctx.requestId
  };
  
  console.log('\\n--- 客户端响应 ---');
  console.log(JSON.stringify(response, null, 2));
  console.log('====================================\\n');
  
  return response;
}

async function runTestCase(description, userId) {
  console.log(\`\\n>>> 测试场景: \${description}\`);
  const ctx = { requestId: \`req-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\` };
  
  try {
    const user = await getUserService(userId);
    console.log('成功获取用户:', user);
    return user;
  } catch (err) {
    return errorHandlerMiddleware(err, ctx);
  }
}

async function main() {
  console.log('=== Node.js 错误处理体系演示 ===\\n');
  
  await runTestCase('1. 正常查询 - 用户存在', '123');
  
  await runTestCase('2. 验证错误 - 用户ID无效', '');
  
  await runTestCase('3. 业务错误 - 用户不存在', '1');
  
  await runTestCase('4. 系统错误 - 数据库超时(带cause链)', '0');
  
  console.log('\\n--- 查看Error对象属性 ---');
  const err = new ValidationError('邮箱格式不正确', { field: 'email' });
  console.log('name:', err.name);
  console.log('message:', err.message);
  console.log('code:', err.code);
  console.log('statusCode:', err.statusCode);
  console.log('isOperational:', err.isOperational);
  console.log('stack存在:', !!err.stack);
}

main();
`
  },
  {
    id: "n2-logging",
    title: "日志系统设计与实现",
    icon: "📝",
    group: "第四部分 工程化与架构设计",
    content: `## 日志系统设计与实现

日志是应用程序的"黑匣子"，是排查线上问题、分析系统行为、监控运行状态的最重要手段。很多开发者对日志的理解停留在"用 console.log 打印一下"，但在生产环境中，一个设计糟糕的日志系统不仅无法帮助排查问题，反而可能成为灾难——日志太多导致磁盘爆满、关键信息被淹没、无法检索追踪、敏感信息泄露等等。本章我们将深入探讨如何设计和实现一个专业的 Node.js 日志系统。

### 一、日志级别

日志级别是日志系统的基础，它定义了日志的重要程度，允许我们在不同环境下控制输出的详细程度。使用级别的核心目的是：**在开发环境输出足够详细的信息便于调试，在生产环境只输出重要信息减少噪音**。

标准的日志级别（从低到高）通常包括：

#### 1.1 DEBUG（调试）

最详细的信息级别，用于开发调试阶段。DEBUG 级别日志通常包含变量值、执行流程、函数入参出参等细节信息。这些信息在开发时非常有用，但在生产环境中默认应该关闭，否则会产生海量日志影响性能。例如："用户ID=123，查询数据库，SQL=SELECT * FROM users WHERE id=123，耗时=15ms"。

#### 1.2 INFO（信息）

记录应用程序正常运行的关键事件，用于了解系统的运行状态。INFO 级别应该是生产环境的默认级别。它记录的是"正常发生的事情"，而不是错误。例如："服务启动成功，监听端口3000"、"用户登录成功，userId=123"、"订单创建成功，orderId=456"。

#### 1.3 WARN（警告）

表示出现了异常情况但不影响系统继续运行，或者表示潜在的问题。WARN 日志需要引起关注但不需要立即处理。例如："内存使用率超过80%"、"数据库查询耗时超过1s"、"调用第三方API重试第2次"。

#### 1.4 ERROR（错误）

表示发生了错误，某个功能无法正常完成，但应用程序本身还能继续运行。ERROR 日志需要立即关注并排查。例如："数据库连接失败，正在重试"、"用户支付失败"、"API调用返回500错误"。

#### 1.5 FATAL（致命）

表示发生了严重错误，可能导致应用程序无法继续运行。FATAL 日志出现后通常需要立即介入，甚至可能需要人工重启服务。例如："无法连接到数据库，重试5次后放弃"、"端口被占用，服务无法启动"。

级别的使用规则是：**设置一个输出级别后，只有大于等于该级别的日志才会输出**。例如设置为 INFO 级别，则 DEBUG 级别的日志不会被输出；设置为 WARN 级别，则 DEBUG 和 INFO 都不会输出。

### 二、结构化日志 vs 文本日志

#### 2.1 文本日志的问题

很多初学者习惯打印纯文本日志：

\`\`\`javascript
console.log(\`[\${new Date().toISOString()}] 用户登录成功，用户ID是\${userId}，IP地址是\${ip}\`);
\`\`\`

这种方式在开发时看起来没问题，但在生产环境中有致命缺陷：
- **难以检索**：你想找"所有登录失败的日志"，只能用 grep 搜索字符串，正则表达式复杂且容易遗漏
- **难以解析**：不同开发者打日志的格式不一致，无法用程序自动提取字段
- **难以统计**：想统计"过去1小时有多少用户登录成功"，只能逐行解析，效率极低
- **上下文关联困难**：无法通过 requestId 快速关联同一个请求的所有日志

#### 2.2 结构化日志的优势

结构化日志是指将日志输出为**机器可解析的格式**（通常是 JSON），每个字段都有明确的键名：

\`\`\`json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "info",
  "message": "用户登录成功",
  "userId": "123",
  "ip": "192.168.1.100",
  "requestId": "abc-123-def",
  "service": "user-service",
  "duration": 45
}
\`\`\`

结构化日志的好处是显而易见的：
- **快速检索**：在日志系统中可以直接按字段搜索，如 \`level:error AND userId:123\`
- **聚合分析**：可以轻松统计错误率、P99响应时间、接口调用量等指标
- **可视化**：日志系统（如Grafana Loki、ELK）可以基于字段生成图表
- **链路追踪**：通过 requestId 可以串联整个请求链路的所有日志
- **告警配置**：可以基于字段配置告警规则，如"5分钟内error日志超过10条则告警"

### 三、日志轮转（Log Rotation）

如果应用程序持续写日志到同一个文件，日志文件会越来越大，最终撑爆磁盘。日志轮转就是解决这个问题的机制：

#### 3.1 轮转策略

常见的轮转策略有：
- **按大小轮转**：当文件达到指定大小（如100MB）时，将当前文件重命名，创建新文件继续写
- **按时间轮转**：每天（或每小时）创建一个新的日志文件
- **按大小+时间**：组合两种策略，比如每天一个文件，但如果当天文件太大也会分割

#### 3.2 日志保留

轮转产生的旧日志文件不能无限保留，需要配置保留策略：
- 保留最近N天的日志（如保留30天）
- 保留最近N个文件（如保留最近10个文件）
- 按日志级别保留（如ERROR日志保留更久，DEBUG日志保留更短）

#### 3.3 压缩

旧的日志文件应该压缩存储（gzip），可以大幅减少磁盘占用。

在 Node.js 中，生产环境通常不建议自己写日志到文件，而是将日志输出到 stdout/stderr，由容器运行时（Docker）或进程管理器（PM2）来处理日志收集和轮转。这样做的好处是应用和日志管理解耦，符合"十二要素应用"的原则。

### 四、敏感信息脱敏

日志中经常会包含敏感信息，如果直接明文记录，可能导致数据泄露风险：

#### 4.1 需要脱敏的信息

- 密码、密钥、Token
- 身份证号、手机号、邮箱
- 银行卡号、支付密码
- 个人隐私数据（住址、姓名等，视业务而定）
- Authorization 请求头

#### 4.2 脱敏策略

- **完全掩码**：密码等信息直接替换为 \`******\`
- **部分掩码**：手机号显示为 \`138****1234\`，邮箱显示为 \`z***@example.com\`
- **哈希处理**：如果需要对比，可以记录哈希值而不是原值
- **白名单/黑名单**：配置哪些字段不应该出现在日志中

**关键原则**：永远不要假设"这个地方不会有敏感信息"，应该在日志输出层统一做脱敏处理，而不是依赖每个开发者的自觉。

### 五、console 的局限性

console 模块是 Node.js 内置的，但它不适合直接在生产环境中使用：

1. **没有日志级别**：console.log/error/warn 只是输出到 stdout/stderr，无法按级别过滤
2. **没有结构化输出**：只能输出字符串或通过 util.inspect 格式化对象，不是标准 JSON
3. **没有上下文**：无法自动携带 requestId 等上下文信息
4. **性能问题**：console 是同步的（在 TTY 下），高频调用会阻塞事件循环
5. **没有输出目标配置**：无法方便地同时输出到控制台、文件、远程日志服务

当然，这并不是说 console 不能用——在开发环境、写小脚本时 console 完全够用，但在生产级别的应用中，应该使用专业的日志库（如 Winston、Pino），或者自己实现一个满足需求的 logger。

### 六、日志中的上下文：requestId / traceId

在分布式系统中，一个用户请求可能会经过多个服务、多个中间件、多个异步操作。如果日志中没有统一的标识符，你根本无法把同一个请求的所有日志串联起来。

#### 6.1 requestId 的作用

当你排查"为什么这个用户支付失败"时，你拿到用户提供的 requestId，就可以在日志系统中搜索，看到这个请求从进入网关、到各个服务处理、再到数据库查询的完整流程，每一步花了多长时间、在哪一步出错。

#### 6.2 如何传递 requestId

- 从请求进入时生成（或从上游请求头中获取）
- 存储在 AsyncLocalStorage 中（Node.js 14+ 支持），这样在整个异步调用链中都能获取到
- 调用下游服务时，通过请求头继续传递下去
- 每条日志自动带上这个 requestId

AsyncLocalStorage 是实现"日志上下文自动传递"的关键技术，它类似于其他语言中的 ThreadLocal，但能正确工作在 Node.js 的异步模型中。

### 七、实现一个合格的 Logger

一个生产级别的 Logger 至少应该具备以下功能：
1. 支持多个日志级别，且能动态设置
2. 输出结构化的 JSON 日志
3. 包含时间戳、服务名、主机名等基础信息
4. 支持添加上下文信息（如 requestId）
5. 支持格式化（开发环境美化输出，生产环境JSON输出）
6. 支持多个输出目标（transport）
7. 支持敏感信息脱敏
8. 错误日志自动记录堆栈信息

理解了这些原理，你不仅能更好地使用 Winston、Pino 等流行的日志库，也能在需要的时候自己实现一个轻量但够用的日志系统。记住：日志不是给人"看"的，首先是给机器"分析"的，其次才是给人排查问题用的。好的日志应该让你在收到告警后，5分钟内就能定位到问题的大致原因，而不是在几万行日志里大海捞针。
`,
    code: `const util = require('util');

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.service = options.service || 'app';
    this.defaultMeta = options.defaultMeta || {};
    this.format = options.format || 'json';
    this.transports = options.transports || [{ write: (msg) => console.log(msg) }];
    this.sensitiveKeys = options.sensitiveKeys || ['password', 'token', 'secret', 'authorization', 'cardNumber'];
  }

  setLevel(level) {
    this.level = level;
  }

  child(meta) {
    const childLogger = Object.create(Object.getPrototypeOf(this));
    Object.assign(childLogger, this);
    childLogger.defaultMeta = { ...this.defaultMeta, ...meta };
    return childLogger;
  }

  maskSensitive(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.maskSensitive(item));
    
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        masked[key] = typeof value === 'string' ? '******' : '******';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskSensitive(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  formatMessage(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      pid: process.pid,
      ...this.defaultMeta,
      ...meta
    };

    if (logEntry.error instanceof Error) {
      logEntry.error = {
        name: logEntry.error.name,
        message: logEntry.error.message,
        stack: logEntry.error.stack
      };
    }

    return this.maskSensitive(logEntry);
  }

  formatForConsole(entry) {
    const colors = {
      debug: '\\x1b[36m',
      info: '\\x1b[32m',
      warn: '\\x1b[33m',
      error: '\\x1b[31m',
      fatal: '\\x1b[35m'
    };
    const reset = '\\x1b[0m';
    const levelColor = colors[entry.level] || '';
    
    const ts = entry.timestamp.split('T')[1].split('.')[0];
    let output = \`\${ts} \${levelColor}[\${entry.level.toUpperCase()}]\${reset} \${entry.message}\`;
    
    const extra = { ...entry };
    delete extra.timestamp;
    delete extra.level;
    delete extra.message;
    delete extra.service;
    delete extra.pid;
    
    if (Object.keys(extra).length > 0) {
      output += '\\n' + util.inspect(extra, { colors: true, depth: null, compact: false });
    }
    
    if (entry.error && entry.error.stack) {
      output += '\\n' + entry.error.stack;
    }
    
    return output;
  }

  log(level, message, meta) {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.level]) return;
    
    const entry = this.formatMessage(level, message, meta);
    
    for (const transport of this.transports) {
      if (this.format === 'console' && transport === this.transports[0]) {
        transport.write(this.formatForConsole(entry));
      } else {
        transport.write(JSON.stringify(entry));
      }
    }
  }

  debug(message, meta) { this.log('debug', message, meta); }
  info(message, meta) { this.log('info', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  error(message, meta) { this.log('error', message, meta); }
  fatal(message, meta) { this.log('fatal', message, meta); }
}

function simulateRequest(logger, requestId, user) {
  const requestLogger = logger.child({ requestId, userId: user.id });
  
  requestLogger.info('收到请求', { path: '/api/login', method: 'POST' });
  requestLogger.debug('请求参数', { body: { username: user.name, password: 'secret123' } });
  
  requestLogger.debug('验证用户密码');
  if (user.id === '1') {
    requestLogger.warn('密码错误，重试第1次', { attempts: 1 });
    const err = new Error('密码不正确');
    requestLogger.error('登录失败', { error: err, ip: '192.168.1.100' });
    return;
  }
  
  requestLogger.info('登录成功', { ip: '192.168.1.100', userAgent: 'Mozilla/5.0' });
  requestLogger.debug('生成Token', { token: 'eyJhbGciOiJIUzI1NiIs...' });
}

function main() {
  console.log('=== 结构化日志系统演示 ===\\n');
  
  const devLogger = new Logger({
    level: 'debug',
    service: 'user-service',
    format: 'console',
    defaultMeta: { hostname: 'localhost' },
    sensitiveKeys: ['password', 'token', 'secret']
  });
  
  console.log('--- 1. 开发环境（美化输出，带DEBUG级别）---');
  simulateRequest(devLogger, 'req-001', { id: '2', name: '张三' });
  
  console.log('\\n--- 2. 演示错误场景 ---');
  simulateRequest(devLogger, 'req-002', { id: '1', name: '李四' });
  
  console.log('\\n--- 3. 生产环境（JSON结构化输出）---');
  const prodLogger = new Logger({
    level: 'info',
    service: 'user-service',
    format: 'json'
  });
  
  const logs = [];
  prodLogger.transports = [{ write: (msg) => logs.push(msg) }];
  
  simulateRequest(prodLogger, 'req-003', { id: '3', name: '王五' });
  
  logs.forEach((log, i) => {
    console.log(\`日志[\${i + 1}]:\`, log);
  });
  
  console.log('\\n--- 4. 演示级别过滤 ---');
  const warnLogger = new Logger({ level: 'warn', format: 'console' });
  console.log('当前级别: warn (只有warn/error/fatal会输出)');
  warnLogger.debug('这条debug不会显示');
  warnLogger.info('这条info不会显示');
  warnLogger.warn('这条warn会显示 - 内存使用率85%');
  warnLogger.error('这条error会显示 - 数据库连接失败');
  
  console.log('\\n--- 5. 敏感信息脱敏验证 ---');
  prodLogger.info('用户提交数据', {
    username: 'test',
    password: 'my-password-123',
    token: 'secret-token',
    profile: {
      email: 'GX6D5@YdtBG0s.4rQ',
      cardNumber: '6222021234567890'
    }
  });
  console.log('脱敏后的日志:', logs[logs.length - 1]);
}

main();
`
  },
  {
    id: "n2-config",
    title: "配置管理最佳实践",
    icon: "⚙️",
    group: "第四部分 工程化与架构设计",
    content: `## 配置管理最佳实践

配置管理是工程化中一个"看起来简单，但做对不容易"的话题。很多项目初期图方便，把配置硬编码在代码里，等到部署到多个环境、需要管理密钥、配置需要动态调整时才发现问题重重。配置管理的目标是：**让应用在不同环境中运行，不需要修改代码，只需要改变配置；敏感信息安全存储；配置缺失时快速失败而不是悄悄使用错误的默认值**。

### 一、为什么绝对不能硬编码配置

硬编码配置是初学者最容易犯的错误：

\`\`\`javascript
// 反模式
const dbHost = 'localhost';
const dbPort = 3306;
const dbPassword = 'my-secret-password';
const apiKey = 'sk-1234567890abcdef';
\`\`\`

硬编码配置的问题非常严重：
1. **敏感信息泄露**：数据库密码、API Key 直接提交到代码仓库，所有能看到代码的人都能看到密钥。即使是私有仓库，也存在风险。
2. **环境切换困难**：开发环境、测试环境、生产环境的数据库地址肯定不一样，每次换环境都要改代码，改完还要记得改回来，非常容易出错。
3. **无法动态调整**：比如想临时调整日志级别、限流阈值，如果硬编码了，就需要重新部署。
4. **配置分散**：配置散落在代码的各个文件中，无法统一管理，想知道有哪些配置需要设置都难。

**原则：代码和配置严格分离**。代码是不变的（同一个版本的代码在所有环境都一样），配置是因环境而异的。这是"十二要素应用"（The Twelve-Factor App）的第三条原则。

### 二、配置来源的优先级

配置可能来自多个来源，它们之间应该有明确的优先级，高优先级的来源会覆盖低优先级的来源。标准的优先级从高到低是：

#### 2.1 命令行参数

优先级最高。启动应用时通过命令行传递的参数，例如：

\`\`\`bash
node server.js --port=8080 --db-host=10.0.0.1
\`\`\`

命令行参数适合临时覆盖配置，或者在容器环境中传递配置。

#### 2.2 环境变量

优先级第二。环境变量是操作系统级别的变量，应用在启动时读取。例如：

\`\`\`bash
export NODE_ENV=production
export DB_HOST=10.0.0.1
export DB_PASSWORD=xxx
node server.js
\`\`\`

环境变量是"十二要素应用"推荐的配置方式，它的优点是：
- 不容易意外提交到代码仓库
- 在容器、PaaS平台（如Heroku、K8s）中是标准做法
- 不需要额外的配置文件
- 语言无关，任何语言都能读取

#### 2.3 配置文件

优先级第三。配置文件适合放非敏感的、环境差异不大但比较复杂的配置（因为环境变量只适合放简单的键值对）。配置文件通常按环境区分，如 \`.env.development\`、\`.env.production\`、\`config/production.json\` 等。

注意：**包含敏感信息的配置文件绝对不能提交到 Git**，应该在 \`.gitignore\` 中排除，只提供一个 \`.env.example\` 示例文件。

#### 2.4 默认值

优先级最低。在代码中为配置提供合理的默认值，当以上来源都没有配置时使用。默认值应该适合开发环境，这样新开发者 clone 代码后不需要做任何配置就能直接运行。

优先级的意义在于：有了默认值，开发体验好；配置文件提供基础配置；环境变量可以覆盖配置文件，适应不同部署环境；命令行参数可以临时调整。

### 三、dotenv 的原理

dotenv 是 Node.js 生态中最流行的配置管理库之一，它的原理非常简单：

1. 读取项目根目录下的 \`.env\` 文件
2. 解析文件中的 \`KEY=VALUE\` 格式
3. 将解析出的键值对加载到 \`process.env\` 中
4. 如果已经存在同名的环境变量，默认不会覆盖（即尊重已有的环境变量）

\`.env\` 文件的格式很简单：

\`\`\`
# 这是注释
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
# 包含空格的值可以用引号包裹
DB_NAME="my_app"
\`\`\`

dotenv 本身不做配置验证，也不支持多环境切换，它只是负责把 \`.env\` 文件加载到环境变量中。多环境通常的做法是：不同环境使用不同的 \`.env.{env}\` 文件，根据 \`NODE_ENV\` 决定加载哪个文件。

需要强调的是：dotenv 只应该在开发环境中使用，生产环境应该直接使用真实的环境变量，而不是依赖 \`.env\` 文件。

### 四、多环境配置

典型的应用至少会有三个环境：

#### 4.1 Development（开发环境）

本地开发时使用的环境。特点：
- 开启调试模式、详细日志
- 使用本地数据库
- 开启开发工具（热重载等）
- 可以使用模拟的第三方服务
- 默认值应该开箱即用

#### 4.2 Staging（预发布/测试环境）

部署到服务器上，和生产环境配置几乎一致，但连接测试数据库、使用测试第三方账号。用于发布前的验证，发现生产环境可能遇到的问题。

#### 4.3 Production（生产环境）

真实用户使用的环境。特点：
- 关闭调试模式，日志级别设为 info 或 warn
- 性能优化开启
- 使用真实的数据库和第三方服务
- 密钥等敏感配置严格管控
- 配置错误应该导致启动失败（快速失败）

多环境配置的常见做法：
1. 通用配置放在一起，环境特定配置单独存放
2. 通过 \`NODE_ENV\` 环境变量判断当前环境
3. 敏感配置从环境变量读取，不放在配置文件中
4. 提供 \`.env.example\` 文件说明需要哪些环境变量

### 五、配置验证的重要性

很多人忽略配置验证，启动时直接使用 \`process.env.XXX\`，如果配置缺失，要么拿到 \`undefined\` 导致奇怪的运行时错误，要么使用默认值连接到错误的资源。

**配置验证的原则：启动时检查，早失败，快失败（Fail Fast）**。如果缺少必须的配置（比如生产环境没有设置数据库密码），应用应该在启动时就立即报错退出，而不是运行到需要连接数据库时才发现问题，或者更糟——使用了默认的开发密码连接到了生产数据库。

配置验证应该检查：
- 所有必填配置是否存在
- 配置值的类型是否正确（端口应该是数字）
- 配置值的格式是否正确（URL、邮箱格式）
- 配置值是否在允许的范围内（日志级别必须是debug/info/warn/error/fatal）

### 六、敏感配置（密钥）管理

密钥（数据库密码、API Key、JWT Secret等）是最高安全级别的配置，管理不当会导致严重的安全事故：

1. **绝对不要提交到代码仓库**：Git历史是永久的，即使你后来删除了密钥，只要之前提交过，就能从历史中找到。
2. **不要放在配置文件中提交**：\`.env\` 文件必须加入 \`.gitignore\`，只提交 \`.env.example\` 示例文件。
3. **生产环境通过环境变量注入**：Docker/K8s中通过Secret注入，不要打包在镜像里。
4. **不要在日志中打印**：日志系统会收集所有日志，确保日志中不会输出密钥。
5. **定期轮换**：密钥应该定期更换，万一泄露了影响可控。
6. **使用专门的密钥管理服务**：大型系统可以使用 Vault、AWS Secrets Manager、KMS 等专业服务管理密钥。

### 七、配置热重载的注意事项

有些配置希望不重启服务就能生效（比如日志级别、功能开关），这就是配置热重载。但热重载是有成本和风险的，需要注意：

1. **不是所有配置都适合热重载**：监听端口、数据库连接池大小等配置不适合热重载，修改它们需要重新初始化资源。
2. **原子性**：配置更新应该是原子的，要么全部更新成功，要么完全不更新，不能出现部分更新的中间状态。
3. **通知机制**：配置更新后，相关的模块需要得到通知，重新读取配置。
4. **变更日志**：配置的变更应该被记录，谁在什么时候改了什么配置，便于回滚和审计。
5. **一致性**：如果是多实例部署，要确保所有实例的配置同时更新。

### 八、配置对象应该是不可变的

配置加载完成后，应该被冻结（Object.freeze），不允许运行时修改。这可以避免：
- 代码中意外修改配置，导致难以排查的问题
- 配置被篡改的安全风险
- 不同模块拿到的配置不一致

总结一下配置管理的最佳实践：代码和配置分离；使用环境变量存储配置，尤其是敏感配置；按优先级覆盖配置；启动时验证配置；配置冻结防止修改；缺少必要配置时快速失败。一个好的配置管理体系应该让开发者在不同环境部署应用时感到安心，而不是担心哪里的配置没配对导致事故。
`,
    code: `const Joi = {
  string: () => ({
    required: () => ({ type: 'string', required: true }),
    default: (val) => ({ type: 'string', default: val }),
    valid: (...values) => ({ type: 'string', enum: values }),
    regex: () => ({ type: 'string' })
  }),
  number: () => ({
    required: () => ({ type: 'number', required: true }),
    default: (val) => ({ type: 'number', default: val }),
    min: () => ({ type: 'number' }),
    max: () => ({ type: 'number' })
  }),
  boolean: () => ({
    default: (val) => ({ type: 'boolean', default: val })
  })
};

function validate(config, schema) {
  const errors = [];
  const validated = {};
  
  for (const [key, rule] of Object.entries(schema)) {
    let value = config[key];
    
    if (value === undefined) {
      if (rule.required) {
        errors.push(\`缺少必填配置: \${key}\`);
        continue;
      }
      if (rule.default !== undefined) {
        value = rule.default;
      }
    }
    
    if (value !== undefined) {
      if (rule.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(\`配置 \${key} 必须是数字，当前值: \${value}\`);
          continue;
        }
        value = num;
      }
      
      if (rule.type === 'boolean') {
        if (typeof value === 'string') {
          value = value.toLowerCase() === 'true' || value === '1';
        }
      }
      
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(\`配置 \${key} 的值必须是 [\${rule.enum.join(', ')}] 之一，当前值: \${value}\`);
        continue;
      }
    }
    
    validated[key] = value;
  }
  
  if (errors.length > 0) {
    throw new Error('配置验证失败:\\n  ' + errors.join('\\n  '));
  }
  
  return Object.freeze(validated);
}

function deepFreeze(obj) {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

class ConfigManager {
  constructor() {
    this.config = {};
    this.schema = null;
  }

  addDefault(defaults) {
    this.config = { ...defaults, ...this.config };
    return this;
  }

  addConfigFile(config) {
    this.config = { ...this.config, ...config };
    return this;
  }

  addEnv(env, prefix = '') {
    const envConfig = {};
    for (const [key, value] of Object.entries(env)) {
      if (prefix && !key.startsWith(prefix)) continue;
      const configKey = prefix 
        ? key.slice(prefix.length).toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase())
        : key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      envConfig[configKey] = value;
    }
    this.config = { ...this.config, ...envConfig };
    return this;
  }

  addCliArgs(args) {
    const cliConfig = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const eqIndex = arg.indexOf('=');
        if (eqIndex !== -1) {
          const key = arg.slice(2, eqIndex).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          cliConfig[key] = arg.slice(eqIndex + 1);
        } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          cliConfig[key] = args[i + 1];
          i++;
        }
      }
    }
    this.config = { ...this.config, ...cliConfig };
    return this;
  }

  setSchema(schema) {
    this.schema = schema;
    return this;
  }

  load() {
    if (!this.schema) {
      return deepFreeze({ ...this.config });
    }
    this.config = validate(this.config, this.schema);
    return deepFreeze({ ...this.config });
  }
}

const configSchema = {
  nodeEnv: Joi.string().valid('development', 'staging', 'production').default('development'),
  port: Joi.number().default(3000),
  dbHost: Joi.string().default('localhost'),
  dbPort: Joi.number().default(3306),
  dbName: Joi.string().required(),
  dbUser: Joi.string().default('root'),
  dbPassword: Joi.string().required(),
  logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  enableCache: Joi.boolean().default(true),
  jwtSecret: Joi.string().required()
};

const defaultConfig = {
  port: 3000,
  dbHost: 'localhost',
  dbPort: 3306,
  logLevel: 'debug',
  enableCache: false
};

function loadConfig(env, cliArgs) {
  const envConfigFile = {
    development: { dbName: 'myapp_dev', logLevel: 'debug' },
    staging: { dbName: 'myapp_staging', logLevel: 'info', enableCache: true },
    production: { dbName: 'myapp_prod', logLevel: 'warn', enableCache: true }
  };
  
  const nodeEnv = env.NODE_ENV || 'development';
  
  const manager = new ConfigManager();
  manager.addDefault(defaultConfig);
  manager.addConfigFile(envConfigFile[nodeEnv] || {});
  manager.addEnv(env);
  if (cliArgs) {
    manager.addCliArgs(cliArgs);
  }
  manager.setSchema(configSchema);
  
  return manager.load();
}

function main() {
  console.log('=== 配置管理最佳实践演示 ===\\n');
  
  console.log('--- 1. 开发环境配置（默认值 + .env.development）---');
  try {
    const devEnv = {
      NODE_ENV: 'development',
      DB_PASSWORD: 'dev-password',
      JWT_SECRET: 'dev-secret-key'
    };
    const devConfig = loadConfig(devEnv);
    console.log('开发环境配置:');
    console.log(JSON.stringify(devConfig, null, 2));
    console.log('配置已冻结:', Object.isFrozen(devConfig));
    
    try {
      devConfig.port = 9999;
      console.log('尝试修改配置成功（不应该发生）');
    } catch (e) {
      console.log('尝试修改配置失败（预期行为，配置不可变）');
    }
  } catch (e) {
    console.error('开发环境加载失败:', e.message);
  }
  
  console.log('\\n--- 2. 环境变量覆盖配置文件 ---');
  const envWithOverride = {
    NODE_ENV: 'production',
    DB_HOST: '10.0.0.5',
    DB_PORT: '3307',
    DB_PASSWORD: 'prod-secure-password',
    JWT_SECRET: 'prod-jwt-secret-very-long',
    LOG_LEVEL: 'error'
  };
  try {
    const prodConfig = loadConfig(envWithOverride);
    console.log('生产环境配置（环境变量覆盖了文件配置）:');
    console.log(\`  dbHost: \${prodConfig.dbHost} (来自环境变量)\`);
    console.log(\`  dbPort: \${prodConfig.dbPort} (来自环境变量)\`);
    console.log(\`  logLevel: \${prodConfig.logLevel} (来自环境变量)\`);
    console.log(\`  dbName: \${prodConfig.dbName} (来自配置文件)\`);
  } catch (e) {
    console.error('加载失败:', e.message);
  }
  
  console.log('\\n--- 3. 命令行参数最高优先级 ---');
  const envWithCli = {
    NODE_ENV: 'development',
    DB_PASSWORD: 'dev-password',
    JWT_SECRET: 'dev-secret'
  };
  const cliArgs = ['--port=8080', '--db-host=127.0.0.1', '--log-level=debug'];
  const cliConfig = loadConfig(envWithCli, cliArgs);
  console.log(\`命令行指定 --port=8080 -> port: \${cliConfig.port}\`);
  console.log(\`命令行指定 --db-host=127.0.0.1 -> dbHost: \${cliConfig.dbHost}\`);
  
  console.log('\\n--- 4. 配置验证 - 缺少必填配置时快速失败 ---');
  try {
    const badEnv = {
      NODE_ENV: 'production'
    };
    loadConfig(badEnv);
    console.log('不应该走到这里');
  } catch (e) {
    console.log('启动时验证失败（正确行为）:');
    console.log(e.message);
  }
  
  console.log('\\n--- 5. 配置验证 - 类型错误检测 ---');
  try {
    const badTypeEnv = {
      NODE_ENV: 'development',
      DB_PASSWORD: 'pass',
      JWT_SECRET: 'secret',
      PORT: 'not-a-number'
    };
    loadConfig(badTypeEnv);
  } catch (e) {
    console.log('类型验证失败:', e.message);
  }
}

main();
`
  },
  {
    id: "n2-middleware",
    title: "中间件模式与洋葱模型",
    icon: "🧅",
    group: "第四部分 工程化与架构设计",
    content: `## 中间件模式与洋葱模型

中间件（Middleware）是 Node.js 后端开发中最重要的设计模式之一，Express、Koa、Redux 等框架的核心机制都是中间件。理解中间件模式，不仅能让你更好地使用这些框架，还能在自己的代码中应用这种优雅的扩展方式。

### 一、中间件模式的本质：函数组合

中间件模式的本质是**函数组合（Function Composition）**——把多个独立的函数（中间件）组合成一个函数链，请求依次经过每个中间件处理。

为什么需要这种模式？想象一下一个HTTP请求的处理流程：
1. 记录请求日志
2. 解析请求体
3. 处理跨域CORS
4. 验证用户身份
5. 检查权限
6. 业务逻辑处理
7. 记录响应时间
8. 错误处理

如果不用中间件，这些逻辑会全堆在一个巨大的处理函数里，代码耦合在一起，无法复用，难以维护。而用中间件模式，每个功能都是一个独立的、可插拔的中间件函数，可以按需组合、复用、甚至发布为第三方包。

每个中间件是一个函数，它接收两个东西：
1. **上下文对象（context）**：包含请求、响应、状态等信息，中间件可以读取和修改
2. **next 函数**：调用它会把控制权交给下一个中间件

### 二、Koa 洋葱模型的原理

Koa 框架最著名的就是它的"洋葱模型"。理解洋葱模型是理解中间件执行顺序的关键。

想象一下洋葱的结构：一层层的，从外到内，再从内到外。请求处理也是类似的：
1. 请求从最外层中间件进入，执行 \`next()\` 之前的代码（请求前处理）
2. 进入下一层中间件，执行它的 \`next()\` 之前的代码
3. ...直到最内层中间件（真正的业务处理）
4. 最内层处理完后，控制权返回上一层，执行 \`next()\` 之后的代码（响应后处理）
5. ...依次返回，直到最外层中间件，执行完 \`next()\` 之后的代码，整个请求结束

用代码来表示就是：

\`\`\`javascript
async function middleware1(ctx, next) {
  console.log('1 - 进入');
  await next();
  console.log('1 - 退出');
}

async function middleware2(ctx, next) {
  console.log('2 - 进入');
  await next();
  console.log('2 - 退出');
}

async function middleware3(ctx, next) {
  console.log('3 - 业务处理');
  ctx.body = 'Hello';
}

// 执行顺序是：
// 1 - 进入
// 2 - 进入
// 3 - 业务处理
// 2 - 退出
// 1 - 退出
\`\`\`

这种"先进后出"的执行顺序是不是很眼熟？对，这就是**栈**的特性。\`next()\` 之前的代码按顺序执行（从外到内），\`next()\` 之后的代码逆序执行（从内到外）。

洋葱模型最巧妙的地方在于：一个中间件既能在请求到达业务逻辑之前"做些什么"（如验证、日志），也能在响应返回给用户之前"做些什么"（如添加响应头、记录耗时、统一错误处理）。这是 Express 的中间件模型做不到的——Express 的中间件是线性的，next() 之后的代码不会等内层完成就执行（准确说是 Express 不支持 async/await 的正确串联，需要靠回调）。

### 三、中间件的常见用途

中间件的应用场景非常广泛，几乎所有横切关注点（cross-cutting concerns）都适合用中间件实现：

#### 3.1 日志中间件

在 \`next()\` 之前记录请求开始时间、方法、路径；在 \`next()\` 之后计算耗时，记录状态码和响应时间。这是最经典的洋葱模型应用。

#### 3.2 认证中间件

在 \`next()\` 之前检查请求是否带有有效的 token，如果没有直接抛出错误或返回401，不调用 \`next()\` 就会截断请求链。

#### 3.3 错误处理中间件

错误处理中间件通常放在最外层。它用 try/catch 包裹 await next()，如果内层中间件抛出错误，它能捕获到并统一处理——返回友好的错误信息、记录错误日志等。这比在每个中间件里单独处理错误优雅得多。

#### 3.4 限流中间件

在 \`next()\` 之前检查请求频率，如果超过限制直接返回429。

#### 3.5 CORS 中间件

在 \`next()\` 之前处理 OPTIONS 预检请求，在 \`next()\` 之后给响应添加 CORS 相关的头。

#### 3.6 请求体解析中间件

在 \`next()\` 之前解析请求体（JSON、form-data），把解析结果挂在 ctx 上供后面的中间件使用。

#### 3.7 响应格式化中间件

在 \`next()\` 之后统一格式化响应格式，比如包装成 \`{ code: 0, data: ..., message: 'success' }\` 的统一结构。

### 四、compose 函数的实现

compose 函数是中间件模式的核心，它的作用是把一个中间件数组组合成一个大的函数。这是 Koa 源码中最经典的部分，核心代码只有十几行，但非常精妙。

我们来理解 compose 的实现原理：

1. 接收一个中间件数组
2. 返回一个函数，这个函数接收 context 和一个最终的 next（可选）
3. 定义一个 dispatch 函数，按索引分发中间件
4. dispatch(0) 从第一个中间件开始执行
5. 每个中间件的 next 参数是一个函数，调用它会执行 dispatch(i + 1)，也就是下一个中间件
6. 如果中间件没有调用 next()，后面的中间件就不会执行
7. 如果多次调用 next()，应该抛出错误（防止混乱）
8. 支持 async 中间件，所以要包裹 Promise

compose 的核心是**递归 + 闭包**。dispatch(i) 返回一个 Promise，执行第i个中间件，把 dispatch(i+1) 作为 next 传给它。中间件调用 next() 时，实际上就是调用 dispatch(i+1)，从而执行下一个中间件。等下一个中间件的 Promise resolve 之后，再继续执行当前中间件 next() 后面的代码。这就是洋葱模型能工作的原因！

### 五、中间件模式的优势

1. **单一职责**：每个中间件只做一件事，代码简洁好维护
2. **可插拔**：需要什么功能就加什么中间件，不需要就移除，非常灵活
3. **可复用**：通用的中间件（如日志、CORS）可以在不同项目中复用，甚至发布为npm包
4. **可组合**：中间件的顺序决定了执行顺序，调整顺序就能改变行为
5. **声明式**：通过中间件列表就能清晰地看到请求经过了哪些处理

需要注意的是：
- **中间件顺序很重要**：认证中间件必须在业务处理中间件之前；错误处理中间件必须在最前面才能捕获后面的错误
- **不要忘记 await next()**：如果是 async 中间件，必须 await next()，否则 next() 后面的代码不会等待内层完成就执行
- **不要阻塞事件循环**：中间件应该尽量轻量，不要在中间件里做CPU密集型操作

理解了中间件模式和洋葱模型，你就掌握了 Node.js Web 框架的灵魂。这种模式不仅限于 Web 开发，在任何需要**可扩展的处理流程**的场景下都能应用——比如构建工具的插件系统、消息处理管道、RPC拦截器等等。这就是为什么说"设计模式是比具体框架更持久的知识"——框架会变，但经典的模式永远有用。
`,
    code: `function compose(middleware) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middleware must be composed of functions!');
    }
  }

  return function (context, next) {
    let index = -1;
    
    return dispatch(0);
    
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      
      let fn = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

class App {
  constructor() {
    this.middleware = [];
    this.context = { state: {} };
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  async handleRequest(request) {
    const ctx = {
      ...this.context,
      request,
      response: { status: 200, body: null, headers: {} },
      state: { startTime: Date.now() }
    };
    
    const fn = compose(this.middleware);
    
    try {
      await fn(ctx);
    } catch (err) {
      ctx.response.status = err.statusCode || 500;
      ctx.response.body = {
        error: err.message,
        success: false
      };
    }
    
    return ctx.response;
  }
}

function createLogger() {
  return async function logger(ctx, next) {
    const { method, url } = ctx.request;
    console.log(\`[请求进入] \${method} \${url}\`);
    
    await next();
    
    const duration = Date.now() - ctx.state.startTime;
    console.log(\`[请求完成] \${method} \${url} - \${ctx.response.status} - \${duration}ms\`);
  };
}

function createErrorHandler() {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      console.error(\`[错误捕获] \${err.name}: \${err.message}\`);
      console.error(err.stack);
      throw err;
    }
  };
}

function createAuth(validTokens) {
  return async function auth(ctx, next) {
    const token = ctx.request.headers && ctx.request.headers.authorization;
    
    if (ctx.request.url === '/login' || ctx.request.url === '/public') {
      console.log('[认证] 公开路径，跳过认证');
      ctx.state.user = { id: 'guest', name: '访客' };
      return next();
    }
    
    if (!token || !validTokens.includes(token)) {
      const err = new Error('未授权：无效的Token');
      err.statusCode = 401;
      throw err;
    }
    
    ctx.state.user = { id: '123', name: '张三', token };
    console.log('[认证] 用户认证通过:', ctx.state.user.name);
    await next();
    console.log('[认证] 响应后清理工作');
  };
}

function createResponseTime() {
  return async function responseTime(ctx, next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers['X-Response-Time'] = \`\${ms}ms\`;
  };
}

function businessHandler(ctx) {
  console.log('[业务逻辑] 处理请求:', ctx.request.url);
  
  if (ctx.request.url === '/api/data') {
    ctx.response.body = {
      success: true,
      data: {
        user: ctx.state.user,
        items: [1, 2, 3]
      }
    };
  } else if (ctx.request.url === '/api/error') {
    throw new Error('业务处理出错：数据库连接失败');
  } else if (ctx.request.url === '/admin') {
    if (ctx.state.user.id !== 'admin') {
      const err = new Error('无权限访问');
      err.statusCode = 403;
      throw err;
    }
    ctx.response.body = { admin: true };
  } else {
    ctx.response.body = { message: 'Hello World' };
  }
}

async function main() {
  console.log('=== Koa 洋葱模型与中间件演示 ===\\n');
  
  const app = new App();
  
  app.use(createErrorHandler());
  app.use(createResponseTime());
  app.use(createLogger());
  app.use(createAuth(['valid-token-123', 'admin-token']));
  
  console.log('--- 中间件列表 ---');
  console.log('1. errorHandler (错误处理)');
  console.log('2. responseTime (响应时间)');
  console.log('3. logger (日志记录)');
  console.log('4. auth (认证鉴权)');
  console.log('5. businessHandler (业务逻辑)\\n');
  
  console.log('=== 场景1: 公开路径，无需认证 ===');
  let response = await app.handleRequest({
    method: 'GET',
    url: '/public',
    headers: {}
  });
  console.log('响应:', JSON.stringify(response, null, 2), '\\n');
  
  console.log('=== 场景2: 认证路径，Token有效 ===');
  response = await app.handleRequest({
    method: 'GET',
    url: '/api/data',
    headers: { authorization: 'valid-token-123' }
  });
  console.log('响应:', JSON.stringify(response, null, 2), '\\n');
  
  console.log('=== 场景3: 认证路径，Token无效 ===');
  response = await app.handleRequest({
    method: 'POST',
    url: '/api/data',
    headers: { authorization: 'invalid-token' }
  });
  console.log('响应:', JSON.stringify(response, null, 2), '\\n');
  
  console.log('=== 场景4: 业务逻辑抛出错误 ===');
  response = await app.handleRequest({
    method: 'GET',
    url: '/api/error',
    headers: { authorization: 'valid-token-123' }
  });
  console.log('响应:', JSON.stringify(response, null, 2), '\\n');
  
  console.log('=== 场景5: 洋葱模型执行顺序演示 ===');
  const order = [];
  const demoApp = new App();
  demoApp.use(async (ctx, next) => {
    order.push('A-1');
    await next();
    order.push('A-2');
  });
  demoApp.use(async (ctx, next) => {
    order.push('B-1');
    await next();
    order.push('B-2');
  });
  demoApp.use(async (ctx, next) => {
    order.push('C-1');
    ctx.response.body = 'done';
    order.push('C-2');
  });
  
  await demoApp.handleRequest({ method: 'GET', url: '/' });
  console.log('中间件执行顺序:');
  order.forEach((step, i) => console.log(\`  \${i + 1}. \${step}\`));
  console.log('\\n洋葱模型顺序: A-1 → B-1 → C-1 → C-2 → B-2 → A-2');
}

main();
`
  },
  {
    id: "n2-di",
    title: "依赖注入与控制反转",
    icon: "💉",
    group: "第四部分 工程化与架构设计",
    content: `## 依赖注入与控制反转

依赖注入（Dependency Injection，DI）和控制反转（Inversion of Control，IoC）是大型后端应用中最核心的架构设计原则之一。NestJS、Angular、Spring 等框架的"魔法"背后，本质上就是一个完善的 DI 容器。理解 DI/IoC 不仅能让你更好地使用这些框架，更重要的是能帮你写出松耦合、易测试、易维护的代码。

### 一、从紧耦合的问题说起

我们先来看不使用 DI 时典型的紧耦合代码是什么样的：

\`\`\`javascript
class UserService {
  constructor() {
    this.database = new MySQLDatabase();
    this.logger = new FileLogger();
    this.cache = new RedisCache();
  }
  
  async getUser(id) {
    this.logger.log('查询用户: ' + id);
    let user = await this.cache.get(id);
    if (!user) {
      user = await this.database.query('SELECT * FROM users WHERE id = ?', [id]);
      await this.cache.set(id, user);
    }
    return user;
  }
}
\`\`\`

这段代码看起来很"正常"，但有非常严重的设计问题：

1. **难以替换依赖**：UserService 硬编码依赖了 MySQLDatabase，如果想切换到 PostgreSQL，必须修改 UserService 的代码。
2. **难以单元测试**：想测试 UserService？必须真的启动一个 MySQL 实例、一个 Redis 实例、一个日志文件，因为构造函数里直接 new 了真实实现。你没法轻易替换成内存版本的 Mock 对象。
3. **难以共享实例**：多个服务如果都 new 自己的数据库实例，会导致创建多余的连接池。
4. **初始化顺序耦合**：依赖必须按特定顺序创建，如果依赖之间也有依赖，初始化代码会变得很复杂。

这就是**控制正转**——UserService 自己控制它依赖的对象的创建和生命周期。而我们要做的是**控制反转**——把"创建依赖"的控制权交出去，从外部把依赖"注入"进来。

### 二、什么是控制反转（IoC）

控制反转是一个设计原则，意思是：**对象不应该自己创建它所依赖的对象，而是由外部容器负责创建和提供**。

"控制"指的是什么？指的是**获取依赖对象的控制权**。传统编程中，对象自己 new 依赖，控制权在对象自己手里；IoC 把这个控制权拿走了，交给了外部的容器。

IoC 是一个比较宽泛的概念，依赖注入（DI）是实现 IoC 最常见的方式。其他实现 IoC 的方式还有服务定位器（Service Locator）、模板方法模式、工厂模式等。

### 三、什么是依赖注入（DI）

依赖注入就是：**对象的依赖不是自己创建的，而是通过构造函数、属性或者方法参数从外部"注入"进来的**。

把上面的例子改写成依赖注入的方式：

\`\`\`javascript
class UserService {
  constructor(database, logger, cache) {
    this.database = database;
    this.logger = logger;
    this.cache = cache;
  }
  
  async getUser(id) {
    this.logger.log('查询用户: ' + id);
    // ... 业务逻辑不变
  }
}
\`\`\`

注意区别：
- UserService 不再自己 new MySQLDatabase 了
- 构造函数接收 database、logger、cache 作为参数
- UserService 不知道也不关心这些依赖具体是什么实现——只要它们有对应的方法（query、log、get、set）就行

这看起来只是小改动，但带来的好处是巨大的：
1. **松耦合**：UserService 只依赖接口（方法签名），不依赖具体实现。可以轻松把 MySQLDatabase 换成 PostgresDatabase，只要都有 query 方法。
2. **易测试**：单元测试时可以传入 Mock 对象——比如一个内存版的 MockDatabase、MockCache，不需要启动真实服务，测试又快又稳定。
3. **可配置**：开发环境用 SQLite，测试环境用内存数据库，生产环境用 MySQL——只是创建时传入不同的实现而已。
4. **复用实例**：DI 容器可以管理单例，多个服务共享同一个数据库连接池。

### 四、依赖注入的三种方式

依赖注入有三种常见的方式：

#### 4.1 构造函数注入

依赖通过构造函数参数传入，这是**最推荐**的注入方式：

\`\`\`javascript
constructor(database, logger) {
  this.database = database;
  this.logger = logger;
}
\`\`\`

优点：
- 依赖明确：一看构造函数就知道这个类依赖什么
- 依赖不可变：构造后不能修改依赖，更安全
- 保证初始化：对象创建时依赖就已经准备好了，不会出现没注入就调用方法的情况
- 便于测试：创建实例时直接传入 mock 即可

缺点：
- 参数过多时构造函数参数列表会很长（但这往往是类做了太多事的信号，应该拆分）

#### 4.2 属性注入（Setter注入）

通过 setter 方法或属性直接设置依赖：

\`\`\`javascript
setDatabase(database) {
  this.database = database;
}
// 或者
userService.database = database;
\`\`\`

优点：
- 灵活，可以在对象创建后再设置依赖
- 可以有默认值，可选依赖适合用这种方式

缺点：
- 依赖不明确，无法一眼看出哪些是必需依赖
- 对象可能在依赖未设置时就被调用，导致运行时错误
- 依赖可变，可能在运行时被意外替换

#### 4.3 方法注入

依赖作为方法参数传入，只在某个方法执行时需要：

\`\`\`javascript
async getUser(id, logger) {
  logger.log('...');
}
\`\`\`

适合那种只在单个方法中使用，而且不同调用可能传入不同实现的依赖。

三种方式中，**构造函数注入是首选**，只有在特殊情况下才考虑其他方式。

### 五、DI 容器的作用

当只有两三个类的时候，手动注入依赖很简单：

\`\`\`javascript
const logger = new Logger();
const db = new Database(logger);
const cache = new Cache(logger);
const userService = new UserService(db, logger, cache);
\`\`\`

但当项目变大，有几十上百个服务，依赖关系复杂时，手动维护这些初始化代码会变成噩梦——你必须自己处理初始化顺序、循环依赖、单例管理。这时候就需要**DI 容器**（也叫 IoC 容器）来帮我们管理这一切。

DI 容器的核心职责：
1. **服务注册**：告诉容器"当需要 X 时，用哪个实现来创建"
2. **服务解析**：当请求一个服务时，容器自动创建它以及它的所有依赖
3. **生命周期管理**：管理服务是单例（只创建一次）还是瞬态（每次请求都创建新实例）
4. **依赖图构建**：递归解析依赖关系，正确顺序初始化

### 六、Service Locator 模式 vs DI

服务定位器（Service Locator）是另一种实现 IoC 的方式：对象不自己创建依赖，而是从一个全局的 locator 中"找"依赖：

\`\`\`javascript
class UserService {
  constructor(locator) {
    this.database = locator.get('Database');
    this.logger = locator.get('Logger');
  }
}
\`\`\`

Service Locator 和 DI 看起来很像，但有一个本质区别：**依赖是隐藏的**。你看构造函数只知道它依赖一个 locator，但不知道它具体需要 Database 和 Logger。这导致：
- 无法一眼看出类的依赖
- 编译时/启动时无法检查依赖是否存在
- 单元测试时还是需要配置 locator，把需要的 mock 都注册进去

相比之下，构造函数注入的依赖是**显式的**。所以大多数现代框架（NestJS、Angular、Spring）都选择 DI 而不是 Service Locator。

### 七、装饰器与反射：NestJS DI 的原理

像 NestJS、InversifyJS 这样的 DI 框架为什么写起来这么"魔法"？只要加个 @Injectable() 装饰器，依赖就自动注入了？它们的原理是：

1. **装饰器（Decorator）** 给类添加元数据，标记这个类可以被容器管理
2. **反射（Reflect Metadata）** 用来在运行时读取类型信息——TypeScript 编译时可以通过 emitDecoratorMetadata 把构造函数参数类型保存下来
3. 容器在解析服务时，通过反射读取构造函数需要什么类型的参数，然后递归解析这些依赖，最后实例化

因为 TypeScript 的类型系统是编译时的，运行时会擦除，所以需要 Reflect Metadata 来在运行时保留类型信息。这也是为什么 NestJS 需要在 tsconfig 里开启 emitDecoratorMetadata 和 experimentalDecorators。

不过，即使不使用装饰器和TypeScript，我们也可以实现一个功能完整的DI容器——核心原理是一样的。理解了DI的本质，你就不会觉得那些框架的"魔法"神秘了。

总结：依赖注入的核心思想是**不要自己找依赖，让依赖送上门来**。这种反转带来的是松耦合、可测试、可维护的代码结构。它不是什么复杂的黑魔法，而是一个简单但极其强大的设计原则——一旦你习惯了这种思维方式，你写出来的代码质量会有质的提升。
`,
    code: `class DIContainer {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
  }

  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      lifecycle: options.lifecycle || 'singleton',
      dependencies: options.dependencies || []
    });
    return this;
  }

  registerClass(name, classDef, options = {}) {
    const deps = options.dependencies || this.extractDependencies(classDef);
    return this.register(name, (container) => {
      const resolvedDeps = deps.map(dep => container.get(dep));
      return new classDef(...resolvedDeps);
    }, options);
  }

  extractDependencies(classDef) {
    if (classDef.$dependencies) {
      return classDef.$dependencies;
    }
    const paramStr = classDef.toString().match(/constructor\\s*\\(([^)]*)\\)/);
    if (!paramStr || !paramStr[1].trim()) {
      return [];
    }
    return paramStr[1].split(',').map(p => p.trim().split('=')[0].trim());
  }

  get(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(\`服务 '\${name}' 未注册\`);
    }

    if (service.lifecycle === 'singleton' && this.instances.has(name)) {
      return this.instances.get(name);
    }

    const instance = service.factory(this);
    
    if (service.lifecycle === 'singleton') {
      this.instances.set(name, instance);
    }

    return instance;
  }

  has(name) {
    return this.services.has(name);
  }
}

class Logger {
  constructor() {
    this.logs = [];
  }
  info(message) {
    const entry = \`[INFO] \${new Date().toISOString()} \${message}\`;
    this.logs.push(entry);
    console.log(entry);
  }
  error(message) {
    const entry = \`[ERROR] \${new Date().toISOString()} \${message}\`;
    this.logs.push(entry);
    console.error(entry);
  }
}

class Config {
  constructor() {
    this.values = {
      dbHost: 'localhost',
      dbPort: 3306,
      cacheTTL: 3600
    };
  }
  get(key) {
    return this.values[key];
  }
}

class Database {
  constructor(logger, config) {
    this.logger = logger;
    this.config = config;
    this.connected = false;
    this.data = new Map();
    this.data.set('1', { id: '1', name: '张三', email: 'YA9RfmB0@dTdpwNO.TAM' });
    this.data.set('2', { id: '2', name: '李四', email: 'Rawe@YP2HStY.ERM' });
    this.logger.info(\`数据库初始化，主机: \${config.get('dbHost')}:\${config.get('dbPort')}\`);
  }
  
  connect() {
    this.connected = true;
    this.logger.info('数据库连接成功');
  }
  
  async query(id) {
    if (!this.connected) this.connect();
    this.logger.info(\`查询数据库，用户ID: \${id}\`);
    return this.data.get(id) || null;
  }
}
Database.$dependencies = ['logger', 'config'];

class Cache {
  constructor(logger, config) {
    this.logger = logger;
    this.ttl = config.get('cacheTTL');
    this.store = new Map();
    this.logger.info('缓存服务初始化');
  }
  
  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expire) {
      this.store.delete(key);
      return null;
    }
    this.logger.info(\`缓存命中: \${key}\`);
    return entry.value;
  }
  
  async set(key, value) {
    this.store.set(key, { value, expire: Date.now() + this.ttl * 1000 });
    this.logger.info(\`缓存写入: \${key}\`);
  }
}
Cache.$dependencies = ['logger', 'config'];

class UserService {
  constructor(database, cache, logger) {
    this.database = database;
    this.cache = cache;
    this.logger = logger;
    this.logger.info('UserService 初始化完成');
  }
  
  async getUser(id) {
    this.logger.info(\`UserService.getUser 被调用，id=\${id}\`);
    
    let user = await this.cache.get(\`user:\${id}\`);
    if (user) {
      return { ...user, fromCache: true };
    }
    
    user = await this.database.query(id);
    if (user) {
      await this.cache.set(\`user:\${id}\`, user);
    }
    
    return user ? { ...user, fromCache: false } : null;
  }
  
  async createUser(id, name, email) {
    this.logger.info(\`创建用户: \${name}\`);
    const user = { id, name, email };
    await this.cache.set(\`user:\${id}\`, user);
    return user;
  }
}
UserService.$dependencies = ['database', 'cache', 'logger'];

class AuthService {
  constructor(userService, logger) {
    this.userService = userService;
    this.logger = logger;
    this.logger.info('AuthService 初始化完成');
  }
  
  async login(userId) {
    this.logger.info(\`用户尝试登录: \${userId}\`);
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return { token: \`token-\${userId}-\${Date.now()}\`, user };
  }
}
AuthService.$dependencies = ['userService', 'logger'];

function demoWithoutDI() {
  console.log('--- 1. 不使用DI的问题：紧耦合 ---');
  console.log('问题：UserService自己new Database，无法替换，难以测试');
  console.log('代码示例:');
  console.log('  constructor() {');
  console.log('    this.db = new MySQLDatabase();  // 硬编码依赖');
  console.log('    this.cache = new RedisCache();');
  console.log('  }\\n');
}

function demoWithDI() {
  console.log('--- 2. 使用DI容器注册和解析服务 ---');
  const container = new DIContainer();
  
  container.registerClass('config', Config, { lifecycle: 'singleton' });
  container.registerClass('logger', Logger, { lifecycle: 'singleton' });
  container.registerClass('database', Database, { lifecycle: 'singleton' });
  container.registerClass('cache', Cache, { lifecycle: 'singleton' });
  container.registerClass('userService', UserService, { lifecycle: 'singleton' });
  container.registerClass('authService', AuthService, { lifecycle: 'singleton' });
  
  console.log('注册服务完成');
  console.log('已注册服务:', [...container.services.keys()]);
  
  console.log('\\n--- 3. 首次获取userService，自动解析所有依赖 ---');
  const userService = container.get('userService');
  console.log('userService类型:', userService.constructor.name);
  console.log('database是同一个实例:', userService.database === container.get('database'));
  
  console.log('\\n--- 4. 单例验证：多次get返回同一个实例 ---');
  const userService2 = container.get('userService');
  console.log('两次获取userService是同一个对象:', userService === userService2);
  
  console.log('\\n--- 5. 瞬态生命周期演示 ---');
  container.register('transientDemo', () => ({ created: Date.now() }), { lifecycle: 'transient' });
  const t1 = container.get('transientDemo');
  setTimeout(() => {
    const t2 = container.get('transientDemo');
    console.log('瞬态服务每次创建新实例:', t1.created !== t2.created, '(时间戳不同)');
  }, 10);
  
  return { container, userService };
}

async function demoBusinessLogic(container, userService) {
  console.log('\\n--- 6. 业务逻辑演示：服务调用 ---');
  let user = await userService.getUser('1');
  console.log('第一次查询用户（从数据库）:', user.name, '来自缓存:', user.fromCache);
  
  user = await userService.getUser('1');
  console.log('第二次查询用户（从缓存）:', user.name, '来自缓存:', user.fromCache);
  
  const authService = container.get('authService');
  const loginResult = await authService.login('2');
  console.log('登录成功，token:', loginResult.token.substring(0, 20) + '...');
  
  console.log('\\n--- 7. 可测试性演示：轻松替换Mock依赖 ---');
  const mockLogger = { info: () => {}, error: console.error };
  const mockDb = { query: async (id) => ({ id, name: 'Mock用户', email: 'mock@test.com' }) };
  const mockCache = { get: async () => null, set: async () => {} };
  
  const testUserService = new UserService(mockDb, mockCache, mockLogger);
  const mockUser = await testUserService.getUser('999');
  console.log('使用Mock对象测试，返回Mock用户:', mockUser.name);
  console.log('（不需要真实数据库，测试快速稳定）');
}

async function main() {
  console.log('=== 依赖注入与DI容器演示 ===\\n');
  
  demoWithoutDI();
  const { container, userService } = demoWithDI();
  await demoBusinessLogic(container, userService);
}

main();
`
  },
  {
    id: "n2-plugin-system",
    title: "插件系统设计",
    icon: "🧩",
    group: "第四部分 工程化与架构设计",
    content: `## 插件系统设计

插件化架构是实现"开闭原则"（对扩展开放，对修改关闭）的终极武器。无论是Webpack、Vite、Babel、ESLint、VS Code还是Vue、React的生态，它们成功的关键之一就是强大的插件系统——核心系统只提供最小的功能集，所有额外功能都通过插件扩展。设计一个好的插件系统，能让你的框架/工具拥有无限的扩展性，社区甚至不需要修改核心代码就能添加各种功能。

### 一、为什么需要插件化架构

如果没有插件系统，当用户需要新功能时会发生什么？
1. 给核心库提Issue，等作者开发
2. 或者Fork代码自己改，但这样就和主线分叉了，难以升级
3. 或者核心库什么功能都往里加，最终变成一个臃肿的"巨无霸"

插件化架构解决了这个问题：
- **核心精简**：核心只保留最基础的机制，不包含具体业务功能
- **灵活扩展**：用户可以按需安装插件，需要什么功能加什么
- **生态繁荣**：第三方开发者可以开发插件，形成生态
- **易于维护**：核心和插件分离，可以独立发布、独立升级
- **可定制**：不同用户可以用同一核心搭配不同插件，满足不同需求

### 二、插件机制的核心：钩子（Hooks）系统

插件系统的核心机制是**钩子（Hooks）**，也叫事件、生命周期点。核心系统在执行流程的关键位置暴露钩子，插件可以"注册"到这些钩子上，在特定时机执行自己的逻辑。

这和事件模式很像，但插件系统的钩子通常更强大，有不同的执行方式：

#### 2.1 同步钩子（SyncHook）

最基础的钩子类型，插件按照注册顺序同步执行，不关心返回值。适合在某个生命周期点"通知"插件做事情，比如"编译开始"、"构建结束"。

\`\`\`javascript
hooks.beforeCompile.call();
// 插件的回调都同步执行完后才继续
\`\`\`

#### 2.2 异步串行钩子（AsyncSeriesHook）

插件是异步函数，一个接一个执行，前一个执行完才执行下一个。适合有先后依赖的异步操作，比如"文件转换"——每个插件依次处理文件内容。

\`\`\`javascript
await hooks.beforeCompile.promise();
\`\`\`

#### 2.3 异步并行钩子（AsyncParallelHook）

多个插件的异步操作并行执行，全部完成后才继续。适合互相独立的异步任务，比如"加载配置"、"初始化插件"。

\`\`\`javascript
await Promise.all(hooks.initialize.taps.map(tap => tap.fn()));
\`\`\`

#### 2.4 瀑布钩子（WaterfallHook）

瀑布钩子的特殊之处在于：**前一个插件的返回值会作为参数传给下一个插件**，像瀑布一样层层传递。这是最有用的钩子类型之一，常用于"数据转换"场景——每个插件都有机会修改数据。

比如Webpack编译模块时，就是用瀑布钩子：源文件经过一个又一个loader（本质就是插件）转换，每个loader接收上一个的输出，处理后传给下一个。

\`\`\`javascript
let result = initialValue;
for (const tap of taps) {
  result = await tap.fn(result);
}
// result是经过所有插件处理后的最终结果
\`\`\`

#### 2.5 熔断钩子（BailHook）

熔断钩子的特点是：**只要有一个插件返回非undefined的值，就停止执行后续插件**。这种钩子适合"授权检查"、"内容拦截"这类场景——只要有一个插件"处理"了这个任务，后面的插件就不用执行了。

比如HTTP请求的路由处理就是典型的熔断钩子：第一个匹配到路由的处理器处理请求，后面的路由不再执行。

### 三、tapable 库的原理

Webpack 的插件系统是基于 tapable 这个库的，它是 Webpack 团队维护的核心包。tapable 提供了上面说的各种钩子类型的实现，它的核心思想是：

1. 核心定义钩子，给钩子起名字，指定参数列表
2. 插件通过 \`tap\`/\'tapAsync\'/\'tapPromise\' 方法注册到钩子上
3. 核心在合适的时机通过 \`call\`/\'callAsync\'/\'promise\' 方法触发钩子

tapable 的精妙之处在于它会根据钩子类型和注册的插件动态编译出执行函数（用new Function），避免在循环里做各种判断，性能极高。

不过我们自己实现一个简化版的钩子系统并不复杂，核心就是管理回调函数和控制执行流程。

### 四、如何设计插件 API

设计一个好的插件API是一门艺术，太简单了不够灵活，太复杂了插件开发者上手难。几个关键原则：

#### 4.1 明确的生命周期

插件需要知道"在什么时候做什么事"，所以核心必须定义清晰的生命周期钩子，并且在文档中明确每个钩子的：
- 触发时机
- 接收的参数
- 可以做什么（能修改哪些东西）
- 是否异步

一个构建工具的典型生命周期可能是：
- initialize：初始化阶段，可以注册新的命令
- beforeReadConfig：读取配置之前，可以修改配置文件路径
- afterReadConfig：配置读取后，可以修改配置
- beforeBuild：构建开始前
- beforeTransform：文件转换前
- transform：转换文件内容（瀑布钩子）
- afterTransform：转换后
- afterBuild：构建完成
- beforeEmit：输出文件前
- afterEmit：输出文件后
- done：全部完成

#### 4.2 给插件足够的上下文

插件回调接收的上下文（context）决定了插件能做多少事。上下文应该包含：
- 核心提供的工具方法（日志、文件操作等）
- 当前的状态（配置、编译结果等）
- 可以修改的对象（注意，是直接共享对象引用还是传副本需要考虑清楚）

但也不要什么都暴露给插件，插件只应该接触到它需要的东西，否则插件会依赖内部实现细节，未来重构核心时就会破坏插件兼容性。

#### 4.3 插件有名字，方便调试和排序

每个插件应该有名字，这样在调试时可以知道哪个插件注册了哪个钩子。同时，支持指定插件的执行顺序（enforce: 'pre'/'post'）或明确的前置/后置依赖。

### 五、插件的生命周期管理

一个插件的生命周期通常是：
1. **注册**：插件被加载，调用 apply 方法（或install方法）
2. **钩入**：在 apply 方法中，插件把自己的回调注册到各个钩子上
3. **执行**：核心流程运行到钩子点时，插件的回调被执行
4. **清理**：程序结束时，插件有机会做清理工作（关闭连接、释放资源）

插件通常是一个类或者一个有apply/install方法的对象。比如Webpack插件要求是一个有apply方法的类，Vue插件要求是一个有install方法的对象或函数。

### 六、同步 vs 异步：注意性能

钩子设计中一个重要的考虑是同步还是异步：
- 同步钩子简单直接，性能好
- 异步钩子更灵活，但会增加复杂度

如果钩子上的插件都是同步操作（比如简单的数据处理），就用同步钩子，不要强行异步。需要IO操作（文件读写、网络请求）时才用异步钩子。

### 七、插件系统的典型架构

一个完整的插件化系统通常包含这几个部分：
1. **核心（Core）**：定义钩子、管理插件、执行主流程
2. **钩子（Hooks）**：定义生命周期点，管理回调注册和触发
3. **插件接口（Plugin API）**：规范插件的形式和上下文
4. **插件加载器**：负责发现、加载、初始化插件（从文件系统、配置文件或代码注册）
5. **内置插件**：核心功能也可以作为插件实现，这样整个系统更一致

理解了插件系统的设计原理，你不仅能更好地理解和使用Webpack、Babel、Vite这些工具的插件机制，还能在自己的项目中需要扩展能力时，设计出优雅的插件系统——而不是写一堆if/else来硬编码各种功能。记住：好的架构不是一开始就想到所有需求，而是提供机制让新需求可以通过扩展实现，而不是修改核心。
`,
    code: `class SyncHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
  }

  tap(name, fn) {
    this.taps.push({ name, fn, type: 'sync' });
  }

  call(...args) {
    for (const tap of this.taps) {
      tap.fn(...args);
    }
  }
}

class SyncWaterfallHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
  }

  tap(name, fn) {
    this.taps.push({ name, fn, type: 'sync' });
  }

  call(initialValue, ...args) {
    let result = initialValue;
    for (const tap of this.taps) {
      result = tap.fn(result, ...args);
    }
    return result;
  }
}

class SyncBailHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
  }

  tap(name, fn) {
    this.taps.push({ name, fn, type: 'sync' });
  }

  call(...args) {
    for (const tap of this.taps) {
      const result = tap.fn(...args);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  }
}

class AsyncSeriesHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
  }

  tapPromise(name, fn) {
    this.taps.push({ name, fn, type: 'promise' });
  }

  tap(name, fn) {
    this.taps.push({ name, fn, type: 'sync' });
  }

  async promise(...args) {
    for (const tap of this.taps) {
      if (tap.type === 'promise') {
        await tap.fn(...args);
      } else {
        tap.fn(...args);
      }
    }
  }
}

class AsyncParallelHook {
  constructor(args = []) {
    this.args = args;
    this.taps = [];
  }

  tapPromise(name, fn) {
    this.taps.push({ name, fn, type: 'promise' });
  }

  async promise(...args) {
    const promises = this.taps.map(tap => tap.fn(...args));
    await Promise.all(promises);
  }
}

class PluginManager {
  constructor() {
    this.plugins = [];
    this.hooks = {
      initialize: new SyncHook(['context']),
      beforeBuild: new AsyncSeriesHook(['config']),
      transform: new SyncWaterfallHook(['code']),
      afterTransform: new AsyncParallelHook(['result']),
      emitFile: new SyncBailHook(['filename', 'content']),
      afterEmit: new SyncHook(['files']),
      done: new SyncHook(['stats'])
    };
    this.logger = { info: console.log, warn: console.warn, error: console.error };
  }

  use(plugin, options = {}) {
    if (typeof plugin === 'function') {
      plugin = { apply: plugin, name: plugin.name || 'anonymous' };
    }
    if (!plugin.name) {
      plugin.name = plugin.constructor.name || 'unnamed-plugin';
    }
    
    this.plugins.push({ plugin, options });
    return this;
  }

  async initialize() {
    this.logger.info('初始化插件管理器...');
    
    for (const { plugin, options } of this.plugins) {
      this.logger.info(\`加载插件: \${plugin.name}\`);
      plugin.apply(this, options);
    }
    
    const context = { logger: this.logger, hooks: this.hooks };
    this.hooks.initialize.call(context);
  }

  async build(entryCode) {
    const config = { minify: false, sourcemap: true };
    let files = [];
    const startTime = Date.now();
    
    await this.hooks.beforeBuild.promise(config);
    
    this.logger.info('开始构建...');
    
    let code = entryCode;
    code = this.hooks.transform.call(code);
    
    await this.hooks.afterTransform.promise({ code });
    
    const filename = 'output.js';
    const bailResult = this.hooks.emitFile.call(filename, code);
    if (bailResult !== false) {
      files.push({ name: filename, content: code });
    }
    
    this.hooks.afterEmit.call(files);
    
    const stats = {
      time: Date.now() - startTime,
      files: files.length,
      plugins: this.plugins.length
    };
    this.hooks.done.call(stats);
    
    return { code, files, stats };
  }
}

const BannerPlugin = {
  name: 'BannerPlugin',
  apply(compiler, options = {}) {
    const banner = options.banner || '/** Built with custom build tool */\\n';
    compiler.hooks.transform.tap('BannerPlugin', (code) => {
      return banner + code;
    });
  }
};

const MinifyPlugin = {
  name: 'MinifyPlugin',
  apply(compiler) {
    compiler.hooks.beforeBuild.tap('MinifyPlugin', (config) => {
      config.minify = true;
    });
    
    compiler.hooks.transform.tap('MinifyPlugin', (code) => {
      return code
        .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
        .replace(/\\/\\/.*$/gm, '')
        .replace(/\\n/g, '')
        .replace(/\\s+/g, ' ')
        .trim();
    });
  }
};

const LoggerPlugin = {
  name: 'LoggerPlugin',
  apply(compiler) {
    compiler.hooks.initialize.tap('LoggerPlugin', (ctx) => {
      ctx.logger.info('[LoggerPlugin] 构建已初始化');
    });
    
    compiler.hooks.afterEmit.tap('LoggerPlugin', (files) => {
      console.log(\`[LoggerPlugin] 已输出 \${files.length} 个文件\`);
    });
    
    compiler.hooks.done.tap('LoggerPlugin', (stats) => {
      console.log(\`[LoggerPlugin] 构建完成，耗时 \${stats.time}ms\`);
    });
  }
};

const AnalyzePlugin = {
  name: 'AnalyzePlugin',
  apply(compiler) {
    compiler.hooks.transform.tap('AnalyzePlugin', (code) => {
      const lines = code.split('\\n').length;
      const chars = code.length;
      console.log(\`[AnalyzePlugin] 代码统计: \${lines} 行, \${chars} 字符\`);
      return code;
    });
  }
};

const BlockingPlugin = {
  name: 'BlockingPlugin',
  apply(compiler, options) {
    compiler.hooks.emitFile.tap('BlockingPlugin', (filename) => {
      if (options.blockFiles && options.blockFiles.includes(filename)) {
        console.log(\`[BlockingPlugin] 阻止输出文件: \${filename}\`);
        return false;
      }
    });
  }
};

const AsyncPlugin = {
  name: 'AsyncPlugin',
  apply(compiler) {
    compiler.hooks.afterTransform.tapPromise('AsyncPlugin', async (result) => {
      console.log('[AsyncPlugin] 执行异步操作（如生成sourcemap）...');
      await new Promise(resolve => setTimeout(resolve, 100));
      result.sourcemap = '/* fake sourcemap */';
      console.log('[AsyncPlugin] 异步操作完成');
    });
  }
};

async function main() {
  console.log('=== 插件系统设计演示 ===\\n');
  
  console.log('--- 演示1: 基础插件系统（Banner + Logger）---');
  const pm1 = new PluginManager();
  pm1.use(LoggerPlugin);
  pm1.use(BannerPlugin, { banner: '/** My Awesome App v1.0.0 */\\n' });
  await pm1.initialize();
  let result = await pm1.build('function hello() {\\n  console.log("Hello World");\\n}');
  console.log('\\n构建结果:');
  console.log(result.code);
  
  console.log('--- 演示2: 瀑布钩子 - 多个插件依次转换代码（Banner + Analyze + Minify）---');
  const pm2 = new PluginManager();
  pm2.use(BannerPlugin, { banner: '/** Production Build */\\n' });
  pm2.use(AnalyzePlugin);
  pm2.use(MinifyPlugin);
  pm2.use(LoggerPlugin);
  await pm2.initialize();
  result = await pm2.build('function add(a, b) {\\n  // 相加函数\\n  return a + b;\\n}\\n\\nconsole.log(add(1, 2));');
  console.log('\\n压缩后的代码:');
  console.log(result.code);
  
  console.log('\\n--- 演示3: 熔断钩子 - BlockingPlugin阻止文件输出 ---');
  const pm3 = new PluginManager();
  pm3.use(new (class {
    constructor() { this.name = 'SimplePlugin'; }
    apply(pm) {
      pm.hooks.transform.tap('SimplePlugin', code => code);
    }
  })());
  pm3.use(BlockingPlugin, { blockFiles: ['output.js'] });
  await pm3.initialize();
  result = await pm3.build('var x = 1;');
  console.log('输出文件数（应该为0）:', result.files.length);
  
  console.log('\\n--- 演示4: 异步并行钩子 ---');
  const pm4 = new PluginManager();
  pm4.use(AsyncPlugin);
  pm4.use(AsyncPlugin);
  pm4.use(LoggerPlugin);
  await pm4.initialize();
  await pm4.build('var test = 1;');
  
  console.log('\\n--- 演示5: 所有钩子执行顺序 ---');
  const pm5 = new PluginManager();
  const orders = [];
  const OrderPlugin = {
    name: 'OrderPlugin',
    apply(pm) {
      pm.hooks.initialize.tap('OrderPlugin', () => orders.push('initialize'));
      pm.hooks.beforeBuild.tap('OrderPlugin', async () => {
        orders.push('beforeBuild');
      });
      pm.hooks.transform.tap('OrderPlugin', (code) => {
        orders.push('transform');
        return code;
      });
      pm.hooks.afterTransform.tapPromise('OrderPlugin', async () => {
        orders.push('afterTransform');
      });
      pm.hooks.emitFile.tap('OrderPlugin', () => {
        orders.push('emitFile');
      });
      pm.hooks.afterEmit.tap('OrderPlugin', () => orders.push('afterEmit'));
      pm.hooks.done.tap('OrderPlugin', () => orders.push('done'));
    }
  };
  pm5.use(OrderPlugin);
  await pm5.initialize();
  await pm5.build('var a = 1;');
  console.log('钩子执行顺序:');
  orders.forEach((step, i) => console.log(\`  \${i + 1}. \${step}\`));
}

main();
`
  },
  {
    id: "n2-process-model",
    title: "进程与并发模型理解",
    icon: "🔀",
    group: "第四部分 工程化与架构设计",
    content: `## 进程与并发模型理解

"Node.js是单线程的"——这句话你一定听过无数次，但它只说对了一半。很多人对Node.js的并发模型存在误解：要么以为"单线程"就是什么都只能串行，性能差；要么以为"异步非阻塞"就是万能的，写什么都快。理解Node.js的进程和线程模型，是写出高性能Node.js应用、正确使用cluster和worker_threads的基础。

### 一、Node.js单线程的真相

首先，我们必须澄清一个常见误解：**Node.js不是单线程的，你的Node.js应用进程里有多个线程**。

"单线程"指的是：**你的JavaScript代码运行在一个单一线程上（主线程/事件循环线程）**。但Node.js本身是由C++编写的，底层的libuv库维护着一个**线程池**（默认大小是4，可以通过UV_THREADPOOL_SIZE环境变量调整），用来处理那些无法在主线程异步执行的操作。

#### 1.1 事件循环线程（主线程）

- 执行你的JavaScript代码
- 处理事件循环（timer、poll、check等阶段）
- 执行回调函数
- 所有的JS代码都在这个线程上运行，包括你的应用代码、npm包的代码
- **如果这个线程被阻塞了，整个应用就卡住了，什么都做不了**

#### 1.2 libuv线程池（工作线程池）

- 由libuv管理，默认4个线程
- 用来执行某些"阻塞"的系统调用，避免阻塞主线程
- 哪些操作会用到线程池？
  - 文件系统I/O（fs模块的所有操作）：因为操作系统没有提供完美的异步文件IOAPI（即使有，不同平台差异也大）
  - DNS查找：dns.lookup()
  - 一些加密操作：crypto模块的某些CPU密集型函数（如pbkdf2、randomBytes等）
- 注意：网络I/O**不使用**线程池！网络操作是由操作系统内核提供的异步机制（epoll/kqueue/IOCP）处理的，真正的"零线程"异步

#### 1.3 V8的其他线程

V8引擎本身还有一些后台线程，比如垃圾回收（GC）线程、JIT编译线程等，这些是引擎自己管理的，你不需要关心。

所以准确地说：**JS代码单线程执行，底层有线程池处理阻塞操作，网络IO由内核异步处理**。

### 二、为什么CPU密集型任务会阻塞事件循环

理解了上面的模型，你就明白为什么CPU密集型任务是Node.js的"天敌"了。

因为你的JavaScript代码运行在唯一的主线程上。如果你写了一个需要执行几百毫秒甚至几秒的JS代码（比如大循环计算、复杂的加密解密、大数据处理），那么在这段代码执行期间：
- 事件循环被阻塞了
- 所有新的请求都无法处理
- 所有回调都无法执行
- 定时器不会触发
- 整个服务器"卡"住了，对外表现为无响应

举个例子：你的服务器有一个接口计算斐波那契数列，如果有人请求fib(45)，这个计算可能需要几秒，在这几秒内，其他用户的请求（甚至是静态文件请求）都会排队等待，整个服务完全无响应。这就是事件循环阻塞。

**关键区分**：
- **I/O密集型**：Node.js的强项，因为异步I/O不会阻塞主线程，等待I/O的时候事件循环可以处理其他事情
- **CPU密集型**：Node.js的弱项，因为CPU密集型计算会占满主线程，阻塞事件循环

那怎么办？Node.js提供了两种方案：**多进程（cluster/child_process）** 和 **工作线程（worker_threads）**。

### 三、集群模式（cluster）原理

cluster模块是Node.js原生提供的用来利用多核CPU的方案。它的原理非常简单：

1. **主进程（Master/Primary）**：
   - 不执行业务代码
   - 负责fork出多个工作进程（Worker）
   - 数量通常等于CPU核心数（require('os').cpus().length）
   - 管理工作进程的生命周期，如果工作进程挂了就重启它

2. **工作进程（Worker）**：
   - 每个工作进程都是一个**独立的Node.js进程**
   - 每个工作进程都运行自己的事件循环
   - 每个工作进程都有自己独立的内存空间
   - 它们都可以监听同一个端口（cluster模块内部做了处理）
   - 实际处理请求的是工作进程

这就是为什么多进程可以利用多核CPU——每个进程可以运行在一个CPU核心上，多个进程就可以同时利用多个核心，真正实现并行处理。如果你的服务器是8核的，用cluster启动8个工作进程，理论上CPU密集型任务的吞吐量可以提升8倍。

当请求进来时，cluster模块内部会用**轮询（round-robin）**算法（除了Windows平台）把请求分发给不同的工作进程，实现负载均衡。

### 四、进程间通信（IPC）

因为每个工作进程都是独立的进程，有独立的内存空间，所以它们之间不能直接共享变量。如果需要通信，必须通过**IPC通道**（Inter-Process Communication）。

Node.js的child_process.fork()和cluster.fork()创建的子进程，自动建立了IPC通道，可以通过send()方法发送消息，通过on('message')事件接收消息。IPC通道在底层是用libuv的管道实现的，可以传递JSON序列化的数据，甚至可以传递Server对象和Socket对象（这就是为什么多个工作进程可以共享同一个端口——主进程监听端口，把socket句柄通过IPC发送给工作进程）。

但要注意：
- 消息传递是有开销的（需要序列化/反序列化）
- 不要频繁传递大消息
- 进程间通信比线程间通信（共享内存）慢得多

### 五、child_process的四种方式

Node.js提供了四种创建子进程的方式，它们各有用途：

#### 5.1 exec

\`child_process.exec(command[, options], callback)\`
- 启动一个shell执行命令
- 缓存命令的输出，最后一次性传给回调
- 适合执行简单的命令，获取输出
- 不适合输出很大的情况（有最大缓存限制，默认200KB）
- 示例：exec('ls -la', (err, stdout, stderr) => {})

#### 5.2 execFile

\`child_process.execFile(file[, args][, options], callback)\`
- 直接执行可执行文件，不启动shell（更安全，没有shell注入风险）
- 同样缓存输出
- 比exec稍快，因为不启动shell
- 示例：execFile('node', ['--version'], callback)

#### 5.3 spawn

\`child_process.spawn(command[, args][, options])\`
- 最通用的方式，流式输出（stdout/stderr是流）
- 没有缓存大小限制，适合输出大的情况
- 适合长时间运行的进程
- 示例：spawn('ffmpeg', ['-i', 'input.mp4', 'output.mp4'])

#### 5.4 fork

\`child_process.fork(modulePath[, args][, options])\`
- 专门用来创建新的Node.js子进程
- 自动建立IPC通信通道
- 每个fork出来的进程是独立的V8实例，至少需要30ms启动时间，内存开销约10MB+
- 就是cluster模块底层使用的方式
- 适合把CPU密集型任务放到子进程执行，避免阻塞主进程

### 六、工作线程（worker_threads）

Node.js 10.5开始引入了worker_threads模块，并在12.x版本稳定。它是比多进程更轻量的方案：

- **线程**：Worker运行在同一个进程里，共享内存（通过SharedArrayBuffer）
- **开销小**：创建一个Worker比fork一个进程开销小得多，内存占用也更少
- **通信高效**：可以通过postMessage传递消息，也可以通过SharedArrayBuffer共享内存（比IPC快得多）
- **适合场景**：CPU密集型计算（如图像处理、大数据计算、复杂加密），需要频繁和主线程通信的场景

那Worker和Cluster怎么选？
- **Worker（工作线程）**：适合单个进程内处理CPU密集型任务，线程间通信快，共享内存
- **Cluster（集群）**：适合Web服务器这类需要充分利用多核、进程间隔离更好的场景，一个进程崩溃不影响其他进程

注意：Worker_threads里的代码也是运行在独立的V8实例和独立的事件循环里，所以Worker里的阻塞不会影响主线程。但Worker之间不能共享JS对象（因为每个V8实例有自己的堆），只能通过消息传递或SharedArrayBuffer共享内存。

### 七、实践建议

1. **Web服务器用cluster模式**：利用多核，进程隔离，一个崩溃自动重启
2. **CPU密集计算用worker_threads**：比fork子进程轻量，通信更快
3. **不要用太多Worker**：Worker不是免费的，太多Worker反而会因为CPU上下文切换降低性能
4. **不要阻塞事件循环**：这是Node.js编程的第一原则！任何JS代码执行超过100ms都应该警惕
5. **分片处理**：对于大计算任务，考虑用setImmediate把任务分成小片，每片让出事件循环
6. **监控事件循环延迟**：生产环境应该监控event loop lag，一旦发现阻塞立即排查

总结一下：Node.js的JavaScript在单线程运行，但底层有线程池和内核异步IO；CPU密集任务会阻塞主线程；用cluster利用多核做多进程Web服务，用worker_threads处理CPU密集计算，用child_process执行外部命令。理解了这个模型，你就能解释为什么Node.js在I/O密集场景下性能惊人，但在CPU密集场景下需要额外处理——这不是Node.js的"缺点"，而是它的设计选择：为高并发I/O场景优化。
`,
    code: `function fibonacciSync(n) {
  if (n <= 1) return n;
  return fibonacciSync(n - 1) + fibonacciSync(n - 2);
}

function calculatePrimesSync(limit) {
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(i);
  }
  return primes;
}

function measureEventLoopLag(durationMs, callback) {
  let lag = 0;
  let maxLag = 0;
  let iterations = 0;
  const start = Date.now();
  let lastCheck = start;
  
  const interval = setInterval(() => {
    const now = Date.now();
    const delta = now - lastCheck;
    if (delta > 20) {
      lag += delta;
      if (delta > maxLag) maxLag = delta;
    }
    iterations++;
    lastCheck = now;
    
    if (now - start >= durationMs) {
      clearInterval(interval);
      callback({ totalLag: lag, maxLag, iterations });
    }
  }, 10);
  
  return interval;
}

async function simulateAsyncRequest(name) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(\`\${name} 完成\`);
    }, 100);
  });
}

async function blockingDemo() {
  console.log('=== 场景1: CPU密集计算阻塞事件循环 ===\\n');
  
  console.log('--- 正常情况下的并发 ---');
  const normalStart = Date.now();
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(simulateAsyncRequest(\`请求\${i}\`));
  }
  const results = await Promise.all(promises);
  results.forEach(r => console.log(r));
  console.log(\`5个并发异步请求总耗时: \${Date.now() - normalStart}ms (约100ms，因为并行)\\n\`);
  
  console.log('--- 有CPU阻塞任务时 ---');
  const blockedStart = Date.now();
  const promises2 = [];
  for (let i = 1; i <= 5; i++) {
    promises2.push(simulateAsyncRequest(\`请求\${i}\`));
  }
  
  console.log('开始CPU密集计算: fibonacci(42)');
  const fibStart = Date.now();
  const fibResult = fibonacciSync(42);
  console.log(\`fibonacci(42) = \${fibResult}, 计算耗时: \${Date.now() - fibStart}ms\`);
  
  const results2 = await Promise.all(promises2);
  console.log(\`所有请求完成，总耗时: \${Date.now() - blockedStart}ms\`);
  console.log('（注意：所有请求都被阻塞到计算结束后才完成！）\\n');
}

async function eventLoopLagDemo() {
  console.log('=== 场景2: 事件循环延迟（Event Loop Lag）监控 ===\\n');
  
  console.log('--- 无阻塞时的事件循环延迟 ---');
  await new Promise(resolve => {
    measureEventLoopLag(500, (stats) => {
      console.log(\`500ms内最大延迟: \${stats.maxLag}ms (应该很小)\`);
      resolve();
    });
  });
  
  console.log('\\n--- 有阻塞时的事件循环延迟 ---');
  const lagPromise = new Promise(resolve => {
    measureEventLoopLag(500, (stats) => {
      console.log(\`500ms内总阻塞时间: \${stats.totalLag}ms\`);
      console.log(\`最大单次延迟: \${stats.maxLag}ms\`);
      resolve();
    });
  });
  
  await new Promise(r => setTimeout(r, 50));
  console.log('执行阻塞计算...');
  calculatePrimesSync(50000);
  
  await lagPromise;
}

function chunkedProcessing(items, processItem, chunkSize = 1000) {
  return new Promise((resolve) => {
    let index = 0;
    const results = [];
    
    function processChunk() {
      const end = Math.min(index + chunkSize, items.length);
      for (; index < end; index++) {
        results.push(processItem(items[index], index));
      }
      
      if (index < items.length) {
        setImmediate(processChunk);
      } else {
        resolve(results);
      }
    }
    
    processChunk();
  });
}

async function nonBlockingDemo() {
  console.log('\\n=== 场景3: 用setImmediate分片处理避免阻塞 ===\\n');
  
  const numbers = Array.from({ length: 20000 }, (_, i) => i);
  
  console.log('--- 直接同步处理（会阻塞）---');
  const syncStart = Date.now();
  measureEventLoopLag(200, (stats) => {
    console.log(\`  处理期间最大事件循环延迟: \${stats.maxLag}ms\`);
  });
  await new Promise(r => setTimeout(r, 10));
  const primesSync = numbers.filter(n => {
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return n > 1;
  });
  console.log(\`  同步处理完成，耗时: \${Date.now() - syncStart}ms, 素数数量: \${primesSync.length}\`);
  
  await new Promise(r => setTimeout(r, 100));
  
  console.log('\\n--- setImmediate分片处理（不阻塞）---');
  const asyncStart = Date.now();
  let maxChunkLag = 0;
  
  const lagMonitor = new Promise(resolve => {
    measureEventLoopLag(300, (stats) => {
      maxChunkLag = stats.maxLag;
      resolve();
    });
  });
  
  await new Promise(r => setTimeout(r, 10));
  const primesAsync = await chunkedProcessing(numbers, n => {
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return null;
    return n > 1 ? n : null;
  }, 2000);
  
  const primesAsyncFiltered = primesAsync.filter(x => x !== null);
  await lagMonitor;
  
  console.log(\`  分片处理完成，耗时: \${Date.now() - asyncStart}ms, 素数数量: \${primesAsyncFiltered.length}\`);
  console.log(\`  处理期间最大事件循环延迟: \${maxChunkLag}ms (应该很小)\`);
  console.log('  （分片处理时事件循环可以响应其他请求，不会"卡"住）');
}

function explainProcessModel() {
  console.log('\\n=== 场景4: 进程与并发模型原理讲解 ===\\n');
  
  console.log('Node.js进程结构（概念模型）:');
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│                    Node.js 进程                         │');
  console.log('│  ┌───────────────────────────────────────────────────┐  │');
  console.log('│  │           主线程 (事件循环线程)                    │  │');
  console.log('│  │  ┌─────────┐  ┌─────────┐  ┌──────────────────┐  │  │');
  console.log('│  │  │  JS代码 │  │  事件   │  │  V8 GC/JIT线程   │  │  │');
  console.log('│  │  │ (你的   │→│  循环   │→│  (引擎内部线程)   │  │  │');
  console.log('│  │  │  业务)  │  │         │  └──────────────────┘  │  │');
  console.log('│  │  └─────────┘  └────┬────┘                        │  │');
  console.log('│  └────────────────────┼────────────────────────────┘  │');
  console.log('│                       │                               │');
  console.log('│  ┌────────────────────┴────────────────────────────┐  │');
  console.log('│  │              libuv 线程池 (默认4线程)            │  │');
  console.log('│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                │  │');
  console.log('│  │  │ fs  │ │dns  │ │crypto│ │ ... │                │  │');
  console.log('│  │  │ I/O │ │lookup│ │密集  │ │     │                │  │');
  console.log('│  │  └─────┘ └─────┘ └─────┘ └─────┘                │  │');
  console.log('│  └──────────────────────────────────────────────────┘  │');
  console.log('│                                                         │');
  console.log('│  网络I/O → 操作系统内核 (epoll/kqueue/IOCP) 不占线程   │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('');
  
  console.log('Cluster多进程模型（Web服务器常用）:');
  console.log('');
  console.log('         ┌─────────────┐');
  console.log('         │ 主进程(Master)│ ← 负责fork、管理worker');
  console.log('         └──┬────┬────┬┘');
  console.log('            │    │    │  (IPC通信)');
  console.log('     ┌──────┘    │    └──────┐');
  console.log('     ▼           ▼           ▼');
  console.log('┌────────┐  ┌────────┐  ┌────────┐');
  console.log('│Worker 1│  │Worker 2│  │Worker N│ ← N通常等于CPU核心数');
  console.log('│(独立V8)│  │(独立V8)│  │(独立V8)│   每个worker有自己的事件循环');
  console.log('│处理请求│  │处理请求│  │处理请求│   共享同一个端口');
  console.log('└────────┘  └────────┘  └────────┘');
  console.log('');
  
  console.log('worker_threads vs cluster:');
  console.log('  - cluster: 多进程，隔离好，稳定性高，适合Web服务器');
  console.log('  - worker_threads: 同进程多线程，轻量，共享内存，适合CPU密集计算');
}

async function main() {
  console.log('=== Node.js 进程与并发模型演示 ===\\n');
  console.log('注意：本示例在单线程中模拟演示阻塞与非阻塞效果\\n');
  
  await blockingDemo();
  await eventLoopLagDemo();
  await nonBlockingDemo();
  explainProcessModel();
}

main();
`
  },
  {
    id: "n2-graceful-shutdown",
    title: "优雅退出与启动流程",
    icon: "🔌",
    group: "第四部分 工程化与架构设计",
    content: `## 优雅退出与启动流程

很多开发者只关心应用"怎么启动"，却忽略了"怎么停止"。在生产环境中，应用的停止和启动一样重要：部署更新、服务器重启、扩缩容、异常恢复——这些场景都会导致进程退出。如果退出处理不好，会导致用户请求被中断、数据丢失、资源泄漏、文件损坏等问题。本章我们讨论如何实现Node.js应用的优雅启动和优雅退出。

### 一、为什么需要优雅退出

什么是"优雅退出（Graceful Shutdown）"？就是当进程收到退出信号时，不是立即死掉，而是先做好"善后工作"再退出。

如果不做优雅退出，直接kill进程会发生什么？
1. **正在处理的请求被中断**：用户可能看到502错误，或者支付请求处理到一半中断导致状态不一致
2. **数据库连接未断开**：数据库端连接突然断开，可能导致事务回滚、连接池中出现僵尸连接
3. **缓冲区数据丢失**：写入文件或网络流的数据还在内存缓冲区，没来得及flush
4. **日志丢失**：内存中的日志还没写入磁盘或发送到日志服务
5. **消息队列消息丢失**：已经从队列取出但还没处理完的消息会丢失，导致消息没有ack也没有重新入队
6. **锁未释放**：分布式锁、文件锁没有释放，导致其他进程长时间获取不到锁
7. **临时文件未清理**：程序运行中创建的临时文件没有删除，积累在磁盘上

想象一下这个场景：用户正在支付，你的进程收到SIGTERM信号直接退出，用户的钱扣了，但订单状态没更新——这就是优雅退出没做好导致的严重生产事故。

### 二、进程信号（Signals）

POSIX信号是操作系统用来通知进程发生了某个事件的机制。Node.js程序可以监听这些信号，在收到信号时执行处理逻辑。和优雅退出相关的信号主要有两个：

#### 2.1 SIGINT（中断信号）

SIGINT 是当用户按下 Ctrl+C 时由终端发送给进程的信号。这通常是开发时手动停止服务的方式。虽然是"手动"停止，但我们也应该在收到SIGINT时执行优雅退出流程，因为开发环境中也可能有正在处理的请求、打开的文件句柄需要清理。

#### 2.2 SIGTERM（终止信号）

SIGTERM 是请求进程终止的信号。这是生产环境中最常见的退出信号：
- Kubernetes（K8s）在滚动更新、缩容时会先发送SIGTERM给Pod，等待一段时间（默认30秒）后才发送SIGKILL强制杀死
- Docker stop 命令默认发送SIGTERM，等待10秒后发送SIGKILL
- PM2、systemd等进程管理器在停止服务时都会先发送SIGTERM

**SIGKILL**（信号9）是无法被捕获、阻塞或忽略的，它会立即强制杀死进程。我们无法对SIGKILL做任何处理，所以必须在SIGTERM到来时就完成清理工作。

#### 2.3 如何监听信号

在Node.js中，通过process.on()监听信号：

\`\`\`javascript
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，开始优雅退出');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号(Ctrl+C)，开始优雅退出');
  gracefulShutdown('SIGINT');
});
\`\`\`

注意：在Windows平台上信号的支持有限，SIGINT可以工作，但SIGTERM的行为可能不同。

### 三、退出前的清理工作

优雅退出流程应该做哪些事情？这取决于你的应用有什么资源需要清理，典型的清理步骤包括：

#### 3.1 停止接受新请求

第一步应该是让服务器停止接受新连接，这样负载均衡器（如Nginx、K8s Service）会发现这个实例不健康，把流量切走，不再发送新请求过来。在Node.js的http.Server中，调用server.close()会停止接受新连接，但会等待已有连接完成处理。

这个阶段有个术语叫"drain"——让正在处理的请求慢慢"流完"，就像水池停止进水后，让剩余的水流干。

#### 3.2 等待现有请求处理完成

给正在处理的请求一定的时间完成处理。这个时间不应该太长（通常10-30秒），因为K8s等编排工具的默认terminationGracePeriodSeconds就是30秒。超时还没完成的请求，只能被迫中断——但这比直接杀掉进程好得多，因为大部分请求应该能在几秒内完成。

#### 3.3 关闭数据库连接

数据库连接、Redis连接、消息队列连接都应该优雅关闭。对于数据库来说，优雅关闭通常是：等待正在进行的事务提交或回滚，然后关闭连接。如果使用连接池，要先关闭连接池，确保所有连接都被正常释放。

为什么这很重要？如果不关闭数据库连接直接退出，数据库端会检测到连接断开，可能会回滚未提交的事务，而且会产生大量"连接异常断开"的日志。

#### 3.4 刷新日志缓冲区

如果你的日志系统有内存缓冲区（比如批量发送到远程日志服务），退出前必须把缓冲区里的日志flush出去，否则最后几分钟的日志可能丢失——而这恰恰是排查退出原因最关键的日志。

#### 3.5 取消订阅、释放锁

如果你订阅了消息队列（如RabbitMQ、Kafka），应该先取消订阅，确保正在处理的消息处理完并ack，然后断开连接。如果你持有分布式锁（如Redis锁），应该主动释放锁，否则锁要等到超时才会自动释放，期间其他实例无法获取锁。

#### 3.6 清理临时文件

程序运行过程中创建的临时文件（如上传的文件、临时缓存）应该清理掉。

### 四、超时强制退出

优雅退出是有时间限制的，不能无限期等下去。如果某些请求卡住了（比如死锁、慢SQL、客户端断开但连接没关），我们不能永远等下去——编排系统在宽限期过后会发SIGKILL强制杀死进程，到那个时候任何清理都做不了。

所以优雅退出必须设置一个超时计时器：
1. 收到SIGTERM，开始优雅退出流程
2. 设置一个超时（比如10秒）
3. 在超时时间内尽量完成清理工作
4. 如果超时时间到了还没完成，记录错误日志，调用process.exit(1)强制退出

"超时退出"是很重要的设计——完美是优秀的敌人，我们要尽力在有限时间内完成最重要的清理，但也要做好最坏的准备。

### 五、启动流程的健康检查

"优雅启动"和"优雅退出"是同样重要的。应用不应该在还没准备好的时候就开始接收流量。一个健壮的启动流程应该：

#### 5.1 启动顺序

正确的启动顺序应该是：
1. 加载并验证配置（配置不对就不要启动，快速失败）
2. 初始化日志系统（这样后续错误才能被记录）
3. 连接数据库、Redis等依赖
4. 初始化各个服务/组件
5. 运行数据库迁移（如果需要）
6. 预热缓存
7. 启动HTTP服务器，开始监听端口

不要在启动HTTP服务器之后才去连接数据库，否则会出现"服务已经在接收请求了，但数据库还没连好"的情况，导致请求失败。

#### 5.2 readiness（就绪）和 liveness（存活）探针

在K8s等容器环境中，有两种健康检查探针：
- **Liveness Probe（存活探针）**：检查应用是否还活着。如果liveness失败，K8s会重启容器。这用来检测死锁、进程挂住等问题。
- **Readiness Probe（就绪探针）**：检查应用是否准备好接收流量。如果readiness失败，K8s会把这个Pod从Service的端点列表中移除，不再给它发流量，但不会重启它。

应用应该在启动完成、所有依赖都就绪后，才让readiness探针返回成功。如果启动过程中数据库连不上，readiness应该失败，K8s不会把流量切过来，也不会重启（给你时间等数据库恢复）。

典型的做法是用一个变量 \`isReady\`，启动完成后设为true，/health/ready 接口检查这个变量；/health/live 接口简单返回200表示进程还活着。

### 六、process.on('exit') 的注意事项

process对象上有一个exit事件，在进程即将退出时触发。很多人以为可以在exit事件里做清理工作，但这里有一个非常重要的限制：**exit事件的处理函数中只能执行同步操作**。

为什么？因为exit事件触发时，事件循环已经停止了，任何异步操作（setTimeout、Promise、文件IO、网络IO）都不会再执行。所以如果你在exit处理函数里写：

\`\`\`javascript
process.on('exit', () => {
  // 这行能执行
  console.log('进程退出');
  // 下面这些不会执行！
  setTimeout(() => console.log('异步'), 100);
  fs.writeFileSync('/tmp/log.txt', 'exit'); // 这个是同步的，可以
  server.close(); // 异步，不会执行
});
\`\`\`

异步的清理工作应该在SIGTERM/SIGINT的处理函数里做，而不是在exit事件里。exit事件只适合做一些非常简单的同步收尾工作，比如同步写入一条退出日志。

### 七、防止多次处理

在实际运行中，信号可能会被发送多次（比如用户等不及又按了一次Ctrl+C，或者编排系统发了SIGTERM又发SIGINT）。所以我们需要一个标志位，确保优雅退出流程只执行一次：

\`\`\`javascript
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log('已经在退出中，强制退出');
    process.exit(1);
    return;
  }
  isShuttingDown = true;
  // ... 执行清理
}
\`\`\`

如果用户第二次按Ctrl+C，说明等不及了，应该立即强制退出。

### 八、总结：优雅退出检查清单

一个完整的优雅退出流程应该考虑：

1. 监听SIGTERM和SIGINT信号
2. 使用标志位防止重复处理
3. 停止接受新请求/连接
4. 给正在处理的请求设定超时时间
5. 关闭数据库/缓存/消息队列连接
6. flush日志
7. 释放锁、清理临时资源
8. 设置强制退出的超时计时器
9. 清理完成后调用process.exit(0)正常退出
10. 未捕获异常时也要尝试记录日志再退出

启动流程也同样重要：配置验证→初始化日志→连接依赖→初始化服务→启动服务器→标记ready。先准备好，再接客。

记住：生产环境中，进程的退出不是"异常情况"，而是常态。每天都有服务在更新、扩缩容、机器重启。优雅退出不是"锦上添花"，而是生产级应用的必备能力。用户不应该在你发版的时候感知到任何异常，这就是优雅启动和优雅退出的意义。
`,
    code: `const EventEmitter = require('events');

class GracefulApplication extends EventEmitter {
  constructor(options = {}) {
    super();
    this.shutdownTimeout = options.shutdownTimeout || 10000;
    this.isShuttingDown = false;
    this.isReady = false;
    this.startTime = null;
    this.activeRequests = 0;
    this.server = null;
    this.resources = [];
    this.logs = [];
    
    this.log = this.log.bind(this);
  }

  log(message) {
    const entry = \`[\${new Date().toISOString()}] \${message}\`;
    this.logs.push(entry);
    console.log(entry);
  }

  addResource(name, cleanupFn) {
    this.resources.push({ name, cleanup: cleanupFn });
    this.log(\`注册资源: \${name}\`);
  }

  async simulateStartup() {
    this.log('=== 启动流程开始 ===');
    
    this.log('1/6 验证配置...');
    await this.sleep(200);
    this.log('   配置验证通过');
    
    this.log('2/6 初始化日志系统...');
    await this.sleep(100);
    
    this.log('3/6 连接数据库...');
    await this.sleep(300);
    this.addResource('database', async () => {
      this.log('   关闭数据库连接...');
      await this.sleep(200);
      this.log('   数据库连接已关闭');
    });
    
    this.log('4/6 连接Redis...');
    await this.sleep(200);
    this.addResource('redis', async () => {
      this.log('   断开Redis连接...');
      await this.sleep(100);
      this.log('   Redis已断开');
    });
    
    this.log('5/6 初始化服务...');
    await this.sleep(200);
    
    this.log('6/6 启动HTTP服务器...');
    await this.sleep(100);
    this.server = { listening: true };
    
    this.isReady = true;
    this.startTime = Date.now();
    this.emit('ready');
    this.log(\`=== 应用启动成功，耗时 \${Date.now() - this.startTime}ms ===\\n\`);
  }

  simulateRequest(name, duration = 500) {
    if (!this.isReady || this.isShuttingDown) {
      this.log(\`[请求] \${name} 被拒绝 - 服务不可用\`);
      return Promise.resolve();
    }
    
    this.activeRequests++;
    this.log(\`[请求] \${name} 开始处理 (活跃请求: \${this.activeRequests})\`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.activeRequests--;
        this.log(\`[请求] \${name} 处理完成 (活跃请求: \${this.activeRequests})\`);
        resolve();
      }, duration);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async gracefulShutdown(signal) {
    if (this.isShuttingDown) {
      this.log(\`\\n!!! 再次收到 \${signal} 信号，立即强制退出 !!!\`);
      this.forceExit(1);
      return;
    }
    
    this.isShuttingDown = true;
    this.log(\`\\n=== 收到 \${signal} 信号，开始优雅退出 ===\`);
    
    let exitCode = 0;
    const forceExitTimer = setTimeout(() => {
      this.log(\`!!! 优雅退出超时 (\${this.shutdownTimeout}ms)，强制退出 !!!\`);
      this.forceExit(1);
    }, this.shutdownTimeout);
    forceExitTimer.unref();
    
    try {
      this.log('1/5 停止接收新请求...');
      this.isReady = false;
      if (this.server) {
        this.server.listening = false;
      }
      this.log('   已停止接受新连接');
      
      this.log(\`2/5 等待活跃请求完成 (当前: \${this.activeRequests}个)...\`);
      let waitCount = 0;
      while (this.activeRequests > 0 && waitCount < 50) {
        await this.sleep(100);
        waitCount++;
      }
      if (this.activeRequests > 0) {
        this.log(\`   警告: 还有 \${this.activeRequests} 个请求未完成\`);
      } else {
        this.log('   所有请求处理完成');
      }
      
      this.log('3/5 清理资源...');
      for (const resource of [...this.resources].reverse()) {
        try {
          await resource.cleanup();
        } catch (e) {
          this.log(\`   清理 \${resource.name} 出错: \${e.message}\`);
          exitCode = 1;
        }
      }
      this.log('   所有资源清理完成');
      
      this.log('4/5 刷新日志缓冲区...');
      await this.sleep(50);
      this.log('   日志已刷新');
      
      this.log('5/5 完成清理');
      
    } catch (err) {
      this.log(\`退出过程出错: \${err.message}\`);
      exitCode = 1;
    }
    
    clearTimeout(forceExitTimer);
    this.log(\`=== 优雅退出完成，exitCode=\${exitCode} ===\`);
    this.log('（实际场景中此处会调用 process.exit(exitCode)）');
  }

  forceExit(code) {
    this.log(\`进程强制退出，code=\${code}\`);
  }

  getHealthStatus() {
    return {
      isReady: this.isReady,
      isShuttingDown: this.isShuttingDown,
      activeRequests: this.activeRequests,
      uptime: this.startTime ? Date.now() - this.startTime : 0
    };
  }
}

function setupSignalHandlers(app) {
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      app.gracefulShutdown(signal);
    });
  });
}

async function simulateNormalShutdown() {
  console.log('\\n========== 场景1: 正常优雅退出 ==========\\n');
  
  const app = new GracefulApplication({ shutdownTimeout: 5000 });
  await app.simulateStartup();
  
  console.log('--- 健康检查（就绪状态）---');
  console.log(JSON.stringify(app.getHealthStatus(), null, 2));
  
  const req1 = app.simulateRequest('GET /api/users', 300);
  const req2 = app.simulateRequest('POST /api/orders', 400);
  
  await app.sleep(50);
  
  await app.gracefulShutdown('SIGTERM');
  
  await Promise.all([req1, req2]);
  console.log('');
}

async function simulateShutdownWithActiveRequests() {
  console.log('\\n========== 场景2: 退出时有正在处理的请求 ==========\\n');
  
  const app = new GracefulApplication({ shutdownTimeout: 5000 });
  await app.simulateStartup();
  
  app.simulateRequest('慢查询请求', 2000);
  app.simulateRequest('上传文件', 1500);
  
  await app.sleep(100);
  
  await app.gracefulShutdown('SIGTERM');
  console.log('');
}

async function simulateDoubleSignal() {
  console.log('\\n========== 场景3: 重复信号触发强制退出 ==========\\n');
  
  const app = new GracefulApplication({ shutdownTimeout: 5000 });
  await app.simulateStartup();
  
  app.simulateRequest('卡住的请求', 30000);
  
  await app.sleep(100);
  
  app.gracefulShutdown('SIGINT');
  await app.sleep(200);
  console.log('（用户等不及，再次按Ctrl+C）');
  await app.gracefulShutdown('SIGINT');
  console.log('');
}

function explainProcessSignals() {
  console.log('\\n========== 进程信号说明 ==========\\n');
  console.log('SIGINT  - Ctrl+C触发，终端中断信号');
  console.log('SIGTERM - 终止信号（Docker stop、K8s滚动更新发送此信号）');
  console.log('SIGKILL - 无法捕获，强制杀死进程（SIGTERM超时后系统发送）');
  console.log('');
  console.log('========== 健康检查端点 ==========\\n');
  console.log('/health/live  - 存活探针：进程是否在运行（简单返回200）');
  console.log('/health/ready - 就绪探针：应用是否准备好接收流量');
  console.log('');
  console.log('========== process.on(\\'exit\\') 的限制 ==========\\n');
  console.log('exit事件中只能执行同步操作！');
  console.log('异步操作（Promise/setTimeout/异步IO）都不会被执行');
  console.log('所以异步清理必须在SIGTERM/SIGINT处理函数中完成');
}

async function main() {
  console.log('=== Node.js 优雅退出与启动流程演示 ===\\n');
  console.log('（本示例不实际监听进程信号，用函数调用来模拟）\\n');
  
  await simulateNormalShutdown();
  await simulateShutdownWithActiveRequests();
  await simulateDoubleSignal();
  explainProcessSignals();
}

main();
`
  }
];


