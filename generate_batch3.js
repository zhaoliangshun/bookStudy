// =============================================================
// 完整文件生成器：ts3-chapters-batch3.js
// 运行此脚本生成最终文件
// =============================================================
const fs = require('fs');
const path = require('path');

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ============ 第一章内容 ============
const c1 = `# Express/Koa 框架类型安全

在现代 Node.js 后端开发中，Express 和 Koa 无疑是最流行、应用最广泛的两个 Web 框架。它们以简洁的中间件模型、灵活的路由系统和庞大的生态系统，支撑了无数 Node.js 后端应用。然而，这两个框架原生都是为 JavaScript 设计的，在纯 JavaScript 环境下使用时，\`req\`（请求对象）、\`res\`（响应对象）、\`next\`（下一个中间件函数）等核心对象的类型非常宽泛，甚至默认就是 \`any\`。这意味着你可以随意访问不存在的属性、传递错误类型的参数，而在代码运行之前不会有任何警告。

TypeScript 的出现彻底改变了这一局面。通过 TypeScript 强大的类型系统，结合 \`@types/express\`、\`@types/koa\` 等类型定义包，以及 Zod、Valibot 等运行时验证库，我们可以构建出从请求进入到响应返回的完整类型安全链路。类型安全不仅能在编译阶段捕获大量低级错误（如参数名拼写错误、参数类型不匹配、响应格式不一致），还能提供优秀的 IDE 智能提示，大幅提升开发效率和代码可维护性。

## 一、类型安全的请求与响应对象

在原生 Express 中，\`Request\` 和 \`Response\` 对象的设计非常灵活，但这种灵活性是以牺牲类型安全为代价的。\`req.params\`（路由参数）、\`req.query\`（查询字符串）、\`req.body\`（请求体）在类型定义中默认都是 \`any\` 类型，你可以写 \`req.params.userIdd\`（多打了一个 d）而不会得到任何编译错误，直到运行时才发现这个参数永远是 undefined。同样，\`res.json()\` 方法接受 \`any\` 类型的参数，你可以返回任意结构的数据，而不需要符合任何约定。

TypeScript 的泛型机制为解决这个问题提供了优雅的方案。在 \`@types/express\` 中，\`Request\` 接口接受四个泛型参数：\`Request<ParamsDictionary, ResBody, ReqBody, ReqQuery, Locals>\`。这意味着你可以为每个路由精确定义：路由参数的类型、响应体的类型、请求体的类型、查询字符串的类型。例如，一个获取用户信息的路由可以这样定义：

\`\`\`typescript
interface UserParams { userId: string }
interface UserResponse { id: number; name: string; email: string }
app.get('/users/:userId', (
  req: Request<UserParams, UserResponse>,
  res: Response<UserResponse>
) => {
  const userId = req.params.userId;
  res.json({ id: 1, name: 'Alice', email: 'alice@example.com' });
});
\`\`\`

这种精确的类型标注带来的好处是显而易见的：当你在处理函数中错误地访问 \`req.params.id\` 而不是 \`req.params.userId\` 时，TypeScript 会立即在编辑器中标红；当你返回的 JSON 缺少 \`email\` 字段时，类型检查也会失败。这些编译时的错误检查能够避免大量因粗心大意而导致的线上 bug。

Koa 的情况略有不同。Koa 的 Context 对象封装了 request 和 response，通过 \`@types/koa\` 提供的类型定义，同样可以为 ctx.params、ctx.request.body、ctx.response.body 等添加类型约束。Koa 的中间件模型（洋葱模型）与 Express 的线性中间件模型在类型处理上有些差异，但核心思想是一致的——通过泛型参数为每个路由定制精确的请求和响应类型。

## 二、中间件的类型安全与属性堆叠

中间件是 Express 和 Koa 的灵魂所在。从日志记录、身份验证、错误处理，到 CORS 配置、请求体解析、静态文件服务，几乎所有的横切关注点都通过中间件实现。然而，中间件给类型系统带来了一个独特的挑战：中间件可以修改 \`req\`（或 ctx）对象，向其上添加自定义属性。例如，认证中间件验证 token 后，会将用户信息挂载到 \`req.user\` 上；日志中间件可能会添加 \`req.requestId\`。问题是，原生的 Request 类型上并不存在这些自定义属性，直接访问会导致类型错误。

解决这个问题的标准方案是 TypeScript 的**声明合并**特性。通过在全局命名空间中扩展 Express 的 Request 接口，我们可以告诉 TypeScript 这些自定义属性的存在。这种方式虽然有效，但它将所有中间件可能添加的属性都集中到一个全局接口上，存在两个问题：一是所有请求都被认为可能有这些属性（即使没有经过对应中间件），类型上无法区分"已认证请求"和"未认证请求"；二是随着项目增长，这个接口会变得越来越臃肿。

更高级的模式是使用**类型安全的中间件组合**，通过泛型来追踪中间件对请求类型的修改。我们可以定义一个 Middleware 类型，它接受一个输入请求类型，返回一个扩展后的输出请求类型。多个中间件串联时，类型会自动"堆叠"——每个中间件添加的属性都在类型层面被追踪。错误处理中间件也有特殊的类型签名，在 Express 中必须有四个参数，TypeScript 可以帮助我们确保签名正确。

## 三、路由参数与查询字符串的验证与类型转换

路由参数和查询字符串是 Web 后端最常见的数据输入来源，但它们天生都是字符串类型。URL 路径中的 \`/users/123\` 里的 \`123\` 是字符串 \`"123"\` 而不是数字 \`123\`；查询字符串 \`?active=true&page=1\` 中的 \`true\` 和 \`1\` 也都是字符串。手动将这些字符串转换为正确的类型不仅繁琐，而且容易出错，还需要处理无效输入。

传统的做法是在每个路由处理函数中手动做类型转换和验证，但这样既重复又容易遗漏。更优雅的方案是结合 Zod、Valibot 等 TypeScript-first 的模式验证库，实现"Schema 即类型"的端到端类型安全。Zod 允许你用简洁的 API 定义数据模式，然后自动从 Schema 中推断出 TypeScript 类型。关键的是，Zod 的 Schema 在运行时真实存在，可以对输入数据进行实际验证。\`z.coerce.number()\` 会尝试将字符串转换为数字，如果转换失败则验证不通过，完美解决了路由参数从字符串到目标类型的转换问题。

对于请求体验证（POST/PUT 请求的 JSON body），Zod 同样表现出色。你可以定义复杂的嵌套 Schema，包括必填/可选字段、字符串长度限制、数字范围、枚举值、邮箱格式等。验证失败时，Zod 会返回详细的错误信息。这种"Schema as Single Source of Truth"的模式非常强大——类型定义和运行时验证共享同一个源，不存在类型定义与实际验证逻辑不一致的风险。

## 四、类型安全的路由注册与处理函数

将上述概念整合起来，我们可以构建一个完全类型安全的路由注册系统。理想情况下，当我们注册一个路由时，TypeScript 应该能够：从路径字符串中自动提取路由参数名（利用模板字面量类型）；结合 Zod Schema 确定请求体和查询参数的类型；确保处理函数接收正确类型的参数；确保处理函数返回符合约定的响应类型。一些现代框架（如 Hono、Elysia、Fastify）已经内置了这种级别的类型安全。即使用 Express 这样相对传统的框架，我们也可以通过封装辅助函数来获得相当程度的类型安全。

## 五、类型安全的错误处理

错误处理是后端开发中至关重要但经常被忽视的环节。构建类型安全的错误处理体系需要：定义自定义错误类层次结构（基础 AppError 和派生的 NotFoundError、UnauthorizedError、ValidationError 等）；类型安全的错误处理中间件，通过 instanceof 窄化错误类型；统一的错误响应格式，确保所有错误响应遵循相同的结构。自定义错误类应该携带 HTTP 状态码、业务错误码和错误消息，以便错误处理中间件能够自动生成正确的 HTTP 响应。

## 六、实践要点

在实际项目中实现类型安全的 Express/Koa 开发，还需要注意：不要滥用 any；善用类型推断（不需要手动标注所有类型）；区分 DTO 类型和领域模型类型；正确处理异步错误（Express 不会自动捕获异步处理函数中的异常，需要 try/catch 或 asyncHandler 包装）。

在本章的代码示例中，我们构建了一个模拟的类型安全 Web 框架原型，实现类型化中间件系统、Zod 风格验证 Schema、类型安全路由器和错误处理机制，通过模拟请求演示完整的类型安全数据流。`;

// ============ 第二章内容 ============
const c2 = `# 数据库层类型安全

数据库是绝大多数后端应用的核心状态存储，从用户信息、业务数据到日志记录，几乎所有持久化数据都通过数据库层进行读写。在传统的 JavaScript 后端开发中，数据库操作是类型安全的重灾区：手写 SQL 时表名字段名容易拼写错误、查询结果的类型是 any、数据从数据库到业务层再到 API 的传递过程中类型信息不断丢失、迁移脚本与实际数据模型不一致等问题屡见不鲜。这些问题轻则导致开发效率低下，重则引发生产事故。TypeScript 结合现代 ORM 和查询构建器工具，让我们能够构建从数据库到 API 端到端的类型安全。

## 一、ORM 类型系统的工作原理

现代 TypeScript ORM（Prisma、Drizzle ORM、MikroORM、TypeORM）都拥有复杂而精密的类型系统。ORM 类型系统的核心是**模型到类型的双向映射**。开发者定义数据模型（Prisma 通过 .prisma 文件，Drizzle 通过 TS 代码，TypeORM 通过装饰器），工具从模型定义生成 TypeScript 类型，确保所有数据库操作都经过类型检查。这种映射不仅仅是简单的"表对应接口，字段对应属性"，还需要处理 nullable 约束、默认值、自增主键（插入时不应由用户提供）、关系映射（一对多、多对多）、级联操作类型等。

以 Prisma 为例，它为每个模型生成多种类型：完整模型类型、创建输入类型（不含自增/默认值字段）、更新输入类型（所有字段可选）、查询条件类型、包含/选择类型（控制关联数据加载）。最精妙的是 include/select 的类型推断——当你查询时 \`include: { posts: true }\`，返回类型自动包含 posts 数组；当 \`select: { id: true, name: true }\` 时，返回类型只包含 id 和 name。这依赖 TypeScript 的条件类型、映射类型和泛型。Drizzle ORM 完全用 TypeScript 定义 Schema，不需要额外代码生成，修改 Schema 时类型立即更新。

## 二、类型安全的查询构建器

查询构建器是以编程方式构造 SQL 查询的接口，类型安全的查询构建器在编译时确保表名、字段名真实存在，字段比较类型兼容，排序分组字段有效。实现的关键技术包括：Branded Types 标记合法表名/字段名；泛型约束确保 select/where/orderBy 方法只接受已定义字段；类型状态模式追踪查询构建器状态确保方法调用顺序正确。Kysely 是专为 TypeScript 设计的类型安全 SQL 查询构建器，能推断联表查询结果类型。

## 三、行到对象的类型映射

数据库驱动返回的行默认类型是 any，且数据库类型与 JavaScript 类型不是一一对应的：VARCHAR→string、INTEGER→number（但 BigInt 需特殊处理）、TIMESTAMP→Date 或 string、BOOLEAN→boolean、JSON→任意对象。NULL 值映射为 null 或 undefined 取决于业务约定。类型安全的行映射应该包含运行时类型检查和转换，而非简单的 as 断言。使用 ORM 时映射自动完成，但理解原理很重要，例如 Prisma 的 Decimal 类型不直接返回 number 是因为精度问题。

## 四、数据库迁移的类型安全

迁移管理数据库 Schema 变更，类型安全的迁移确保：迁移脚本中表名/列名与当前模型一致；添加非空字段时考虑默认值或数据填充；回滚操作正确撤销变更。Prisma Migrate 通过对比 Schema 和数据库自动生成迁移文件；Drizzle 的 drizzle-kit 从 TS Schema 直接生成 SQL。手工编写迁移 SQL 容易出错，类型安全的迁移工具能减少生产事故。

## 五、SQL 模板字面量类型

TypeScript 模板字面量类型为 SQL 查询提供新的类型安全思路。通过带类型的 SQL 模板标签函数，写接近原生 SQL 时获得类型检查：Slonik、PgTyped 等库能解析 SQL 语句提取表名字段名与元数据比对。这需要在类型层面解析 SQL 结构，是 TS 类型编程高阶应用。

## 六、类型安全的 Repository 模式

Repository 模式将数据访问封装在专门类中，通过泛型定义通用 CRUD 接口：\`Repository<TEntity, TInsert, TUpdate>\`。基类实现 create、findById、findMany、update、delete、count，具体 Repository 添加业务查询方法（findByEmail、findPublishedPosts）。方法返回精确的 Promise 类型（如 \`Promise<User | null>\` 而非 \`Promise<any>\`），查询条件用 keyof 约束。

## 七、分页类型

分页输入参数（page、pageSize、sort、order）需要类型约束：sort 应为 \`keyof TEntity\` 防止传入不存在字段；分页结果（data、total、page、pageSize、totalPages、hasNext/hasPrev）结构明确，方便前端渲染。偏移量分页和游标分页各有场景，游标分页大数据量性能更好但实现更复杂。

## 八、事务类型

事务确保多个操作原子性（全部成功或全部回滚）。类型安全事务确保：事务中操作使用同一连接、隔离级别类型明确、推荐回调式 API（如 \`$transaction(async tx => {...})\`）自动处理提交回滚，类型确保回调内只能用事务客户端。

本章代码示例构建内存数据库模拟，实现类型安全 Repository、查询、分页和事务，清晰展示核心概念和类型编程技巧。`;

// ============ 第三章内容 ============
const c3 = `# 认证与授权类型

认证和授权是后端应用安全体系的两大基石。认证回答"你是谁"——验证用户身份；授权回答"你能做什么"——控制资源访问权限。在 TypeScript 中，通过精心设计的类型系统，可以将安全规则编码到类型层面，让类型检查器在编译阶段捕获安全漏洞和逻辑错误。

## 一、品牌类型（Branded Types）保护安全敏感值

后端处理大量安全敏感值：明文密码、密码哈希、访问令牌、刷新令牌、API 密钥、会话 ID、验证码等。虽然运行时都是字符串，但业务含义和安全要求截然不同。TypeScript 结构化类型系统让两个 string 完全兼容，无法区分。品牌类型通过附加唯一标记解决此问题：

\`\`\`typescript
type Brand<T, B> = T & { readonly __brand: B };
type PlainPassword = Brand<string, 'PlainPassword'>;
type AccessToken = Brand<string, 'AccessToken'>;
\`\`\`

定义后这些类型互不兼容，防止安全敏感值意外混用。品牌属性纯为编译时标记，运行时不存在。品牌类型还可实现"能力标记"模式：AuthenticatedRequest 包含非可选 user 属性，类型系统强制必须经过认证中间件才能访问受保护路由。

## 二、密码处理的类型安全

密码永远不应明文存储，必须使用慢速哈希算法（bcrypt、Argon2、PBKDF2）。类型系统通过区分 PlainPassword 和 HashedPassword 防止明文入数据库或重复哈希；密码验证必须用常量时间比较（crypto.timingSafeEqual）防时序攻击，应封装在正确实现的验证函数中；密码复杂度策略也可通过品牌类型在运行时验证。

## 三、JWT 令牌的类型安全

JWT 是流行的无状态认证机制。类型安全 JWT 需要：区分 Access Token 和 Refresh Token 载荷类型（Access 包含用户 ID/角色/权限/iat/exp，Refresh 更少信息用于续签）；签发验证函数类型安全（sign 返回品牌类型，verify 返回对应 Payload 类型）；注意永远不在 Payload 存敏感信息（Base64 非加密）、使用强密钥、设置合理过期时间。

## 四、会话管理类型

会话认证需要：明确 Session 数据结构（不存过多数据）；类型化 SessionStore 接口（get/set/destroy/touch）；Cookie 属性（httpOnly、secure、sameSite）明确定义防止误配。分布式 Session 存储在 Redis 时要求数据可序列化，类型系统检查不可序列化值。

## 五、RBAC（基于角色的访问控制）类型

RBAC 是最广泛的授权模型：权限赋予角色，用户通过角色获得权限。使用字符串字面量联合定义 Role，模板字面量类型自动生成 Permission（\`\${Resource}:\${Action}\`）避免拼写错误；角色-权限映射用 Record 类型确保合法权限；权限检查函数参数类型确保只能检查已定义权限。复杂场景可用 ABAC，但 RBAC 覆盖大多数需求。

## 六、类型安全的认证中间件

认证中间件是 API 保护门户：区分 AuthenticatedRequest（非可选 user）和 GuestRequest，受保护路由强制认证；Token 提取验证过程各错误情况对应明确错误类型；requirePermission 高阶函数返回中间件检查权限，参数类型约束为合法 Permission。

## 七、API 密钥认证类型

API 密钥用于服务间通信和第三方集成：用品牌类型保护防混淆；存储哈希值而非明文；每个密钥关联 scopes（与 RBAC 权限一致）；支持过期时间、速率限制；验证时不仅检查存在性还检查权限范围。

## 八、OAuth 2.0 与第三方登录类型

OAuth 2.0 第三方登录需要：定义授权流程各阶段参数类型；令牌响应类型；不同 Provider 用户信息类型用可辨识联合区分特有字段。

本章代码示例构建完整类型安全认证授权系统：品牌类型保护、crypto 密码哈希验证、JWT 签发验证、RBAC 权限矩阵、API 密钥认证，完全使用 Node.js 内置模块。`;

// ============ 第四章内容 ============
const c4 = `# 事件驱动与流处理

Node.js 的核心设计哲学之一是事件驱动和非阻塞 I/O，事件（Event）和流（Stream）是这一哲学的具体体现。在 TypeScript 中，我们可以为事件系统和流处理添加精确类型约束，构建类型安全的事件驱动架构和流式数据处理管道。本章深入探讨类型安全 EventEmitter、类型化事件映射、Pub/Sub 模式、Node.js Stream 类型、消息队列类型、事件溯源（Event Sourcing）以及 CQRS 类型。

## 一、类型化 EventEmitter

Node.js 内置 EventEmitter 是事件驱动基础，但原生无类型——事件名字符串，监听器参数 any。TypeScript 支持通过事件映射类型（Event Map）为 EventEmitter 添加类型参数：将事件名映射到监听器函数签名。\`on\` 方法根据事件名推断监听器参数类型；\`emit\` 检查参数是否匹配。关键实现是 \`keyof\` 操作符和泛型约束：事件名参数约束为 \`K extends keyof TEvents\`，监听器类型为 \`TEvents[K]\`，参数通过 \`Parameters<TEvents[K]>\` 获取。

## 二、类型安全的事件映射设计

设计好的事件映射包括：统一事件命名约定（如 'resource:action'）；事件载荷统一结构（所有事件携带 timestamp、eventId）；事件版本化（用于事件溯源）。可定义基础事件类型 \`DomainEvent<TType, TPayload>\`，所有业务事件继承，可编写通用日志/持久化等事件处理逻辑。可辨识联合类型将所有事件联合，处理时通过 event.type 窄化类型获得对应载荷提示。

## 三、发布/订阅模式（Pub/Sub）

Pub/Sub 比 EventEmitter 更进一步：发布者订阅者通过消息通道解耦，分布式系统由 Redis/RabbitMQ/Kafka 实现。类型安全 Pub/Sub 定义频道名称到消息类型映射：publish 确保消息符合频道类型；subscribe 确保处理函数接收正确类型。通过泛型和映射类型构建类型安全消息总线，微服务架构中保持跨服务消息类型一致。

## 四、Node.js 流的类型

Node.js Stream 分四种：Readable、Writable、Duplex、Transform。@types/node 提供泛型类型参数：Readable 指定产出类型，Writable 指定写入类型。实际流管道中数据类型经常变化（文件流 Buffer→解码 string→JSON.parse 对象），类型安全管道确保上游输出匹配下游输入，自定义 TypedTransform 在类型层追踪数据类型变化。还需正确处理背压（write 返回 false 等待 drain）。

## 五、消息队列与任务队列类型

消息队列异步处理耗时任务、解耦依赖：定义消息类型映射（不同队列处理不同消息类型）；消息处理器类型；消息元数据（优先级、延迟、重试、死信队列）。任务队列定义 Job 和 JobResult 类型，确保处理器接收正确参数返回正确结果；进度/完成/失败事件也有类型定义。

## 六、事件溯源模式

事件溯源不存对象当前状态，而存状态变更事件序列，通过重放重建任意时间点状态。类型安全事件溯源包括：聚合根类型；领域事件可辨识联合；EventStore 接口（追加/查询事件）；聚合状态重建类型。命令到达时聚合根验证当前状态，产生事件追加到存储并更新状态。关键类型安全：命令只能在正确状态产生正确事件；apply 函数类型安全更新状态。

## 七、CQRS 类型

CQRS 将写操作（命令）和读操作（查询）分离：命令改变状态不返回值，查询返回值不改变状态。类型安全 CQRS 定义：Command 和 Query 类型（描述操作意图/查询请求的数据对象）；CommandHandler/QueryHandler 接收特定类型返回正确结果；通过类型映射建立命令/查询到处理器的映射，总线 dispatch 根据类型推断处理器参数和返回类型。

本章代码示例构建完整类型安全事件驱动系统：TypedEventEmitter、Pub/Sub 总线、类型化流管道、事件溯源简化实现（聚合根、命令、事件、处理器）。`;

// ============ 第五章内容 ============
const c5 = `# CLI 工具开发

命令行界面（CLI）工具是开发者日常工作中不可或缺的一部分——从 npm、git、docker 到脚手架工具、构建工具、部署脚本，CLI 贯穿整个开发生命周期。使用 TypeScript 开发 CLI 工具，可以获得参数解析类型安全、命令结构类型约束、配置加载类型验证、插件系统类型安全扩展。本章探讨类型安全 CLI 参数解析、命令/子命令类型、选项类型、类型化配置加载、插件系统类型、进度报告类型等核心话题。

## 一、命令行参数类型

CLI 参数包括位置参数（positional arguments）和选项（options/flags）。process.argv 是字符串数组，需要手动解析。类型安全解析不仅正确解析，还在类型层面转换为正确类型。位置参数有顺序、名称、类型、是否必填；选项分布尔标志（--verbose）、字符串选项（--output dist）、数字选项（--port 3000）、数组选项（多次 --include）。通过选项配置对象描述结构，TypeScript 推断解析后参数类型——port 配置为 number 类型则结果 port 是 number 而非 string。

## 二、命令与子命令类型

现代 CLI 采用命令-子命令树状结构（git commit/push、docker build、npm install）。类型安全命令系统定义命令名、描述、选项配置、参数配置、处理函数、子命令列表。用 Builder Pattern 和 Method Chaining 实现，链式调用返回 this，通过泛型累积选项参数类型，最终处理函数获得完整类型信息。

## 三、选项类型与验证

选项类型定义包含多维度：类型（string/number/boolean/array）、短选项名（-p 对应 --port）、默认值、描述、是否必填、验证函数、选项互斥/依赖关系。运行时验证检查必填选项、值类型、枚举范围、路径存在；类型层面区分必填选项（一定存在）和可选（可能 undefined）。枚举类型选项用联合类型约束（log-level: 'debug'|'info'|'warn'|'error'）。

## 四、类型安全的配置文件加载

CLI 支持配置文件设置默认选项（.eslintrc.json、tsconfig.json）。类型安全配置加载：定义配置 TS 接口/Schema；支持 JSON/YAML/TOML/JS 多种格式；Zod 验证确保用户配置符合 Schema 并推断类型；配置合并（命令行 > 环境变量 > 配置文件）每层保持类型正确。

## 五、插件系统类型

可扩展 CLI 支持插件扩展功能（Vue CLI、Webpack CLI）。类型安全插件系统定义：Plugin 接口（注册命令、添加选项、扩展命令）；PluginContext 类型（与主程序交互 API）；生命周期钩子类型。插件可以添加新命令选项，可用声明合并或类型注册模式让插件扩展主程序类型定义。常见模式是"插件作为函数"——插件是接收类型化上下文的函数，在上下文注册命令选项，上下文 API 类型决定插件能力。

## 六、进度报告与交互式 CLI

CLI 不仅输入输出，还需进度条、彩色输出、交互式提示（选择、确认、输入）等交互元素，都可有类型安全 API：进度条更新接受 0-100 或已完成/总数元组；不同交互提示返回不同类型（确认→boolean、输入→string、选择→所选选项字面量类型）；彩色输出（chalk 风格）约束有效颜色名。

## 七、帮助信息与文档生成

CLI 应自动生成 --help，类型安全帮助生成从类型定义自动生成而非手动维护：命令描述、选项描述、参数描述都是类型定义一部分；添加新命令选项帮助自动更新。可用装饰器/reflect-metadata 附加描述信息运行时反射生成，也可在选项配置中包含 description 字段确保每个选项都有描述。

## 八、错误处理与用户体验

CLI 错误处理与 Web 后端不同：错误应友好输出（带颜色、建议、错误码）；退出码遵循 Unix 惯例（0成功、1一般错误、2误用）；支持 --verbose 输出详细堆栈；Ctrl+C 优雅退出清理资源。类型系统可定义 CliError 类包含退出码，统一错误处理输出。

本章代码示例构建类型安全 CLI 框架原型：类型化命令注册、选项解析（string/number/boolean/array）、子命令嵌套、自动帮助生成、配置加载验证、插件系统支持、进度报告和彩色输出，通过模拟参数数组演示各种功能的类型安全实现。`;

// ============ 第一章代码 ============
const code1 = `console.log("========== 1. Schema 验证系统 ==========\\n");

type Schema<T> = { parse(input: unknown): T; safeParse(input: unknown): { success: true; data: T } | { success: false; error: string } };

function string(): Schema<string> {
  return {
    parse(input) { if (typeof input !== 'string') throw new Error(\`期望string实际\${typeof input}\`); return input; },
    safeParse(input) { try { return {success:true,data:this.parse(input)}; } catch(e:any){return{success:false,error:e.message};} }
  };
}
function number(opts?:{coerce?:boolean;min?:number;max?:number}): Schema<number> {
  return {
    parse(input) {
      let v:any = input;
      if(opts?.coerce&&typeof input==='string'){v=Number(input);if(isNaN(v))throw new Error(\`无法转数字\${input}\`);}
      if(typeof v!=='number')throw new Error(\`期望number实际\${typeof v}\`);
      if(opts?.min!==undefined&&v<opts.min)throw new Error(\`最小值\${opts.min}\`);
      if(opts?.max!==undefined&&v>opts.max)throw new Error(\`最大值\${opts.max}\`);
      return v;
    },
    safeParse(input) { try{return{success:true,data:this.parse(input)};}catch(e:any){return{success:false,error:e.message};} }
  };
}
function object<T extends Record<string,Schema<any>>>(shape:T): Schema<{[K in keyof T]:T[K]extends Schema<infer U>?U:never}> {
  return {
    parse(input) {
      if(typeof input!=='object'||input===null||Array.isArray(input))throw new Error('期望object');
      const r:any={};
      for(const k of Object.keys(shape)){try{r[k]=shape[k].parse((input as any)[k]);}catch(e:any){throw new Error(\`字段\${k}:\${e.message}\`);}}
      return r;
    },
    safeParse(input) { try{return{success:true,data:this.parse(input)};}catch(e:any){return{success:false,error:e.message};} }
  };
}

class HttpError extends Error { constructor(public status:number,public code:string,m:string){super(m);this.name='HttpError';} }
class NotFoundError extends HttpError{constructor(r:string){super(404,'NOT_FOUND',\`\${r}未找到\`);}}
class UnauthorizedError extends HttpError{constructor(m='未授权'){super(401,'UNAUTHORIZED',m);}}
class ValidationError extends HttpError{constructor(d:string){super(400,'VALIDATION_ERROR',\`验证失败:\${d}\`);}}

console.log("✓ Schema系统与错误类已定义");

const UserParamsSchema = object({userId:number({coerce:true,min:1})});
const CreateUserSchema = object({name:string(),email:string(),age:number({min:0,max:150})});

let r:any = UserParamsSchema.safeParse({userId:"42"});
console.log(\`userId="42"(coerce):\${r.success?'✓->'+r.data.userId:'✗'+r.error}\`);
r = UserParamsSchema.safeParse({userId:"abc"});
console.log(\`userId="abc":\${r.success?'✗应失败':'✓拒绝:'+r.error}\`);
r = CreateUserSchema.safeParse({name:"Alice",email:"a@b.com",age:25});
console.log(\`有效用户:\${r.success?'✓'+r.data.name:'✗'+r.error}\`);

console.log("\\n========== 2. 类型化路由器 ==========\\n");
const {EventEmitter} = require('events');

interface Req{method:string;path:string;params:Record<string,any>;query:Record<string,any>;body:any;headers:Record<string,string>;[k:string]:any}
interface Res{statusCode:number;body:any;headers:Record<string,string>;status(c:number):Res;json(d:any):Res}
function mkRes():Res{return{statusCode:200,body:null,headers:{},status(c){this.statusCode=c;return this;},json(d){this.body=d;return this;}};}
type Mw = (req:Req,res:Res,next:(err?:any)=>void)=>void;

class Router extends EventEmitter {
  private routes:any[]=[]; private globalMws:Mw[]=[];
  use(mw:Mw){this.globalMws.push(mw);return this;}
  private parse(p:string){const n:string[]=[];const re=new RegExp('^'+p.replace(/:([\\w]+)/g,(_,x)=>{n.push(x);return'([^/]+)'})+'$');return{re,names:n};}
  get(p:string,h:(req:Req,res:Res)=>void,mws?:Mw[]){const{re,names}=this.parse(p);this.routes.push({method:'GET',re,names,h,mws:mws||[]});return this;}
  post(p:string,h:(req:Req,res:Res)=>void,mws?:Mw[]){const{re,names}=this.parse(p);this.routes.push({method:'POST',re,names,h,mws:mws||[]});return this;}
  async handle(method:string,path:string,body?:any,query?:any,headers?:any):Promise<Res>{
    const res=mkRes(); const req:Req={method,path,params:{},query:query||{},body:body??null,headers:headers||{}};
    const route=this.routes.find(r=>r.method===method&&r.re.test(path));
    if(!route){res.status(404).json({code:'NOT_FOUND',msg:'路由不存在'});return res;}
    const m=path.match(route.re); if(m)route.names.forEach((n:string,i:number)=>req.params[n]=m[i+1]);
    try{
      for(const mw of[...this.globalMws,...route.mws]){
        await new Promise<void>((res,rej)=>{let called=false;const next=(e?:any)=>{called=true;if(e)rej(e);else res();};
          try{const x=mw(req,res,next);if(x instanceof Promise)x.then(()=>{if(!called)res();}).catch(rej);else if(!called)res();}catch(e){rej(e);}
        });
      }
      route.h(req,res);
    }catch(err:any){
      if(err instanceof HttpError)res.status(err.status).json({code:err.code,msg:err.message});
      else res.status(500).json({code:'ERROR',msg:err.message});
    }
    return res;
  }
}

const router = new Router();
router.use((req,res,next)=>{console.log(\`[请求]\${req.method} \${req.path}\`);next();});
router.use((req,res,next)=>{const a=req.headers['authorization'];if(a&&a.startsWith('Bearer ')){if(a.slice(7)==='ok'){req.user={id:1,name:'Admin',roles:['admin']};next();}else next(new UnauthorizedError('无效令牌'));}else{req.user=null;next();}});
router.get('/users/:userId',(req,res)=>{const p=UserParamsSchema.safeParse(req.params);if(!p.success)throw new ValidationError(p.error);if(p.data.userId===1)res.json({id:1,name:'Alice',email:'a@b.com'});else throw new NotFoundError('用户');});
router.post('/users',(req,res)=>{const p=CreateUserSchema.safeParse(req.body);if(!p.success)throw new ValidationError(p.error);res.status(201).json({id:2,...p.data});});

console.log("✓ 路由器已配置\\n");
async function run(){
  const tests=[
   ['有效用户','GET','/users/1',null,{authorization:'Bearer ok'}],
   ['用户不存在','GET','/users/999',null,{authorization:'Bearer ok'}],
    ['无效userId','GET','/users/abc',null,{authorization:'Bearer ok'}],
    ['创建用户成功','POST','/users',{name:'Bob',email:'b@b.com',age:30},{authorization:'Bearer ok'}],
    ['验证失败','POST','/users',{name:'Bob',email:123},{authorization:'Bearer ok'}],
    ['无令牌','GET','/users/1'],
    ['无效令牌','GET','/users/1',null,{authorization:'Bearer bad'}],
  ];
  for(const[desc,m,p,b,h]of tests){
    console.log(\`测试:\${desc}\`);
    const res=await router.handle(m as string,p as string,b,undefined,h as any);
    console.log(\`  ->\${res.statusCode} \${JSON.stringify(res.body).slice(0,80)}\\n\`);
  }
  console.log("========== 测试完成 ==========");
}
run().catch(console.error);`;

// ============ 第二章代码 ============
const code2 = `console.log("========== 1. Schema类型定义 ==========\\n");
type ColType='string'|'number'|'boolean'|'date';
type ColDef={type:ColType;nullable?:boolean;primary?:boolean;unique?:boolean;default?:()=>any};
type Schema=Record<string,ColDef>;
type SchemaType<S extends Schema>={[K in keyof S]:S[K]['type']extends'string'?string:S[K]['type']extends'number'?number:S[K]['type']extends'boolean'?boolean:Date};
type AutoFields<S extends Schema>={[K in keyof S]:S[K]extends{primary:true}?K:S[K]extends{default:()=>any}?K:never}[keyof S];
type InsType<T,S extends Schema>=Omit<T,AutoFields<S>>;
type UpdType<T>=Partial<Omit<T,'id'>>;
interface PageP<T>{page?:number;pageSize?:number;sort?:keyof T&string;order?:'asc'|'desc'}
interface PageR<T>{data:T[];total:number;page:number;pageSize:number;totalPages:number}

const UserSch={
  id:{type:'number'as const,primary:true,default:()=>Date.now()+Math.floor(Math.random()*1000)},
  name:{type:'string'as const},email:{type:'string'as const,unique:true},
  age:{type:'number'as const,nullable:true},isActive:{type:'boolean'as const,default:()=>true},
  createdAt:{type:'date'as const,default:()=>new Date()},
}satisfies Schema;
const PostSch={
  id:{type:'number'as const,primary:true,default:()=>Date.now()+Math.floor(Math.random()*1000)},
  title:{type:'string'as const},content:{type:'string'as const},authorId:{type:'number'as const},
  published:{type:'boolean'as const,default:()=>false},createdAt:{type:'date'as const,default:()=>new Date()},
}satisfies Schema;
type User=SchemaType<typeof UserSch>; type Post=SchemaType<typeof PostSch>;
console.log("✓ Schema定义: User字段["+Object.keys(UserSch).join(',')+"]");

console.log("\\n========== 2. 内存数据库 ==========\\n");
class DB{
  private t=new Map<string,Map<any,any>>(); private tx:Map<string,Map<any,any>>|null=null;
  table(n:string){if(!this.t.has(n))this.t.set(n,new Map());}
  private a(n:string){if(this.tx){if(!this.tx.has(n))this.tx.set(n,new Map(this.t.get(n)||new Map()));return this.tx.get(n)!;}return this.t.get(n)!;}
  insert(n:string,row:any,sch:Schema){const t=this.a(n);const r={...row};for(const[k,c]of Object.entries(sch)){if(c.default&&!(k in r))r[k]=c.default();if(c.primary&&c.default&&r[k]===undefined)r[k]=c.default();}t.set(r.id,r);return r;}
  byId(n:string,id:any){return this.a(n).get(id)||null;}
  all(n:string,p?:(r:any)=>boolean){const x=Array.from(this.a(n).values());return p?x.filter(p):x;}
  one(n:string,p:(r:any)=>boolean){return this.all(n,p)[0]||null;}
  upd(n:string,id:any,u:any){const t=this.a(n);const r=t.get(id);if(!r)return null;const x={...r,...u};t.set(id,x);return x;}
  del(n:string,id:any){return this.a(n).delete(id);}
  count(n:string,p?:(r:any)=>boolean){return this.all(n,p).length;}
  async trans<T>(fn:(db:DB)=>Promise<T>):Promise<T>{this.tx=new Map();try{const r=await fn(this);for(const[n,t]of this.tx)this.t.set(n,t);this.tx=null;return r;}catch(e){this.tx=null;throw e;}}
}
console.log("✓ 内存数据库已创建");

console.log("\\n========== 3. Repository模式 ==========\\n");
class Repo<T extends Record<string,any>,TI,TU>{
  constructor(protected db:DB,protected tbl:string,protected sch:Schema){db.table(tbl);}
  create(d:TI):T{return this.db.insert(this.tbl,d,this.sch);}
  findById(id:number):T|null{return this.db.byId(this.tbl,id);}
  findMany(f?:Partial<T>):T[]{if(!f)return this.db.all(this.tbl);return this.db.all(this.tbl,r=>Object.entries(f).every(([k,v])=>r[k]===v));}
  findOne(f:Partial<T>):T|null{return this.db.one(this.tbl,r=>Object.entries(f).every(([k,v])=>r[k]===v));}
  update(id:number,d:TU):T|null{return this.db.upd(this.tbl,id,d);}
  delete(id:number):boolean{return this.db.del(this.tbl,id);}
  page(p:PageP<T>&{f?:Partial<T>}):PageR<T>{
    const pg=p.page||1,ps=p.pageSize||10,sort=p.sort||'id'as any,ord=p.order||'asc';
    let d=this.findMany(p.f);
    d.sort((a,b)=>{if(a[sort]<b[sort])return ord==='asc'?-1:1;if(a[sort]>b[sort])return ord==='asc'?1:-1;return 0;});
    return{data:d.slice((pg-1)*ps,pg*ps),total:d.length,page:pg,pageSize:ps,totalPages:Math.ceil(d.length/ps)};
  }
}
class UserRepo extends Repo<User,InsType<User,typeof UserSch>,UpdType<User>>{
  constructor(db:DB){super(db,'users',UserSch);}
  byEmail(e:string){return this.findOne({email:e}as any);}
  active(){return this.findMany({isActive:true}as any);}
}
class PostRepo extends Repo<Post,InsType<Post,typeof PostSch>,UpdType<Post>>{
  constructor(db:DB){super(db,'posts',PostSch);}
  byAuthor(aid:number){return this.findMany({authorId:aid}as any);}
  published(){return this.findMany({published:true}as any);}
  publish(id:number){return this.update(id,{published:true}as any);}
}
class UoW{readonly users:UserRepo;readonly posts:PostRepo;constructor(public db:DB){this.users=new UserRepo(db);this.posts=new PostRepo(db);}
async tx<T>(fn:(u:UoW)=>Promise<T>){return this.db.trans(async()=>fn(this));}}
console.log("✓ Repository与UnitOfWork已创建");

console.log("\\n========== 4. 数据操作演示 ==========\\n");
async function run(){
  const uow=new UoW(new DB());
  const u1=uow.users.create({name:'张三',email:'z@e.com',age:28});
  const u2=uow.users.create({name:'李四',email:'l@e.com',age:32});
  const u3=uow.users.create({name:'王五',email:'w@e.com'});
  console.log(\`创建3用户:张三(\${u1.id}),李四(\${u2.id}),王五(\${u3.id})\`);
  uow.posts.create({title:'TS入门',content:'TS基础...',authorId:u1.id});
  uow.posts.create({title:'Node实践',content:'后端...',authorId:u1.id});
  uow.posts.create({title:'DB设计',content:'数据库...',authorId:u2.id});
  console.log("创建3文章");
  const f=uow.users.findById(u1.id);console.log(\`\\n查找:\${f?.name}<\${f?.email}>, 张三文章数:\${uow.posts.byAuthor(u1.id).length}\`);
  uow.posts.publish(uow.posts.byAuthor(u1.id)[0].id);console.log(\`已发布:\${uow.posts.published().length}篇\`);
  for(let i=4;i<=15;i++)uow.users.create({name:'用户'+i,email:'u'+i+'@e.com',age:20+i});
  const pg1=uow.users.page({page:1,pageSize:5,sort:'name',order:'asc'});
  console.log(\`\\n分页:共\${pg1.total}条,\${pg1.totalPages}页,第1页:\`);pg1.data.forEach(u=>console.log(' -'+u.name));
  console.log("\\n---事务测试---");
  const before=uow.users.count();
  try{await uow.tx(async tx=>{tx.users.create({name:'tx',email:'tx@e.com',age:25});tx.posts.create({title:'txp',content:'c',authorId:u1.id});console.log("事务创建数据,即将回滚");throw new Error("业务错误");});}catch(e:any){console.log('回滚:'+e.message);}
  console.log(\`回滚后用户数:\${uow.users.count()}（应=\${before}）\`);
  await uow.tx(async tx=>{tx.users.create({name:'ok',email:'ok@e.com',age:40});console.log("事务提交成功");});
  console.log(\`最终用户数:\${uow.users.count()}\`);
  console.log("\\n==========测试完成==========");
}
run().catch(console.error);`;

// ============ 第三章代码 ============
const code3 = `console.log("==========1.Branded Types==========\\n");
type Brand<T,B>=T&{readonly __brand:B};
type UId=Brand<number,'UserId'>;type PPwd=Brand<string,'PlainPwd'>;type HPwd=Brand<string,'HashedPwd'>;
type ATok=Brand<string,'ATok'>;type RTok=Brand<string,'RTok'>;type AK=Brand<string,'ApiKey'>;
const uid=(n:number)=>n as UId;const pp=(s:string)=>s as PPwd;const hp=(s:string)=>s as HPwd;
const at=(s:string)=>s as ATok;const rt=(s:string)=>s as RTok;const ak=(s:string)=>s as AK;

type Role='admin'|'editor'|'viewer';type Res='user'|'post'|'comment';type Act='create'|'read'|'update'|'delete';
type Perm=\`\${Res}:\${Act}\`;
const rp:Record<Role,Perm[]>={
  admin:['user:create','user:read','user:update','user:delete','post:create','post:read','post:update','post:delete','comment:create','comment:read','comment:update','comment:delete'],
  editor:['post:create','post:read','post:update','post:delete','comment:create','comment:read','comment:update','comment:delete','user:read'],
  viewer:['post:read','comment:read','user:read']
};
interface User{id:UId;un:string;email:string;ph:HPwd;roles:Role[];act:boolean;ca:Date}
interface Payload{sub:UId;un:string;roles:Role[];iat:number;exp:number;type:'access'|'refresh'}
interface AKInfo{key:AK;uid:UId;name:string;scopes:Perm[];ca:Date;lu?:Date}
console.log(\`✓类型定义:admin权限数\${rp.admin.length},editor\${rp.editor.length},viewer\${rp.viewer.length}\`);

console.log("\\n==========2.密码哈希==========\\n");
const crypto=require('crypto');
class PwdSvc{
  private static I=10000,K=64,D='sha512';
  static hash(p:PPwd):HPwd{const s=crypto.randomBytes(16).toString('hex');const h=crypto.pbkdf2Sync(p,s,this.I,this.K,this.D).toString('hex');return hp(s+':'+this.I+':'+h);}
  static verify(p:PPwd,h:HPwd):boolean{const ps=h.split(':');if(ps.length!==3)return false;const[s,i,hh]=ps;const c=crypto.pbkdf2Sync(p,s,+i,this.K,this.D).toString('hex');return crypto.timingSafeEqual(Buffer.from(hh,'hex'),Buffer.from(c,'hex'));}
}
const tp=pp('MySecret123!');const th=PwdSvc.hash(tp);
console.log(\`哈希长度:\${th.length}\`);
console.log(\`正确密码:\${PwdSvc.verify(tp,th)?'✓':'✗'}\`);
console.log(\`错误密码:\${!PwdSvc.verify(pp('wrong'),th)?'✓正确拒绝':'✗'}\`);

console.log("\\n==========3.JWT服务==========\\n");
class JwtSvc{
  private static SK='demo-secret';static AE=15*60;static RE=7*24*60*60;
  private static e(d:any){return Buffer.from(typeof d==='string'?d:JSON.stringify(d)).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,'');}
  private static d(s:string){return Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4),'base64');}
  private static sig(data:string){return crypto.createHmac('sha256',this.SK).update(data).digest('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,'');}
  static signA(u:Pick<User,'id'|'un'|'roles'>):ATok{const n=Math.floor(Date.now()/1000);const p:Payload={sub:u.id,un:u.un,roles:u.roles,iat:n,exp:n+this.AE,type:'access'};const h=this.e({alg:'HS256',typ:'JWT'}),pp=this.e(p);return at(h+'.'+pp+'.'+this.sig(h+'.'+pp));}
  static signR(u:Pick<User,'id'|'un'|'roles'>):RTok{const n=Math.floor(Date.now()/1000);const p:Payload={sub:u.id,un:u.un,roles:u.roles,iat:n,exp:n+this.RE,type:'refresh'};const h=this.e({alg:'HS256',typ:'JWT'}),pp=this.e(p);return rt(h+'.'+pp+'.'+this.sig(h+'.'+pp));}
  static verify(t:ATok|RTok):Payload{const ps=t.split('.');if(ps.length!==3)throw new Error('无效格式');const[h,p,s]=ps;if(s!==this.sig(h+'.'+p))throw new Error('签名无效');const pl:Payload=JSON.parse(this.d(p).toString());if(pl.exp<Math.floor(Date.now()/1000))throw new Error('过期');return pl;}
}
console.log("✓JwtService已创建");

console.log("\\n==========4.权限与AuthService==========\\n");
class PermSvc{
  static perms(roles:Role[]):Perm[]{const s=new Set<Perm>();roles.forEach(r=>rp[r].forEach(p=>s.add(p)));return Array.from(s);}
  static has(roles:Role[],p:Perm):boolean{return roles.some(r=>rp[r].includes(p));}
}
class AuthSvc{
  private us=new Map<UId,User>();private ks=new Map<AK,AKInfo>();private uc=0;
  reg(un:string,email:string,p:PPwd,roles:Role[]=['viewer']):User{if(Array.from(this.us.values()).find(u=>u.email===email))throw new Error('邮箱已存在');const id=uid(++this.uc);const u:User={id,un,email,ph:PwdSvc.hash(p),roles,act:true,ca:new Date()};this.us.set(id,u);return u;}
  login(email:string,p:PPwd):{a:ATok;r:RTok;u:Omit<User,'ph'>}{const u=Array.from(this.us.values()).find(x=>x.email===email);if(!u)throw new Error('用户不存在');if(!u.act)throw new Error('账户禁用');if(!PwdSvc.verify(p,u.ph))throw new Error('密码错');const{ph,...safe}=u;return{a:JwtSvc.signA(u),r:JwtSvc.signR(u),u:safe};}
  verify(t:ATok):{uid:UId;perms:Perm[]}{const p=JwtSvc.verify(t);if(p.type!=='access')throw new Error('需要access');const u=this.us.get(p.sub);if(!u||!u.act)throw new Error('用户不存在');return{uid:p.sub,perms:PermSvc.perms(p.roles)};}
  check(a:{perms:Perm[]},p:Perm):boolean{return a.perms.includes(p);}
  mkAK(uid:UId,name:string,scopes:Perm[]):AKInfo{const k=ak('ak_'+crypto.randomBytes(24).toString('hex'));const info:AKInfo={key:k,uid,name,scopes,ca:new Date()};this.ks.set(k,info);return info;}
  vAK(k:AK,need?:Perm):AKInfo{const i=this.ks.get(k);if(!i)throw new Error('无效Key');i.lu=new Date();if(need&&!i.scopes.includes(need))throw new Error('缺权限:'+need);return i;}
}
const auth=new AuthSvc();
const adm=auth.reg('admin','a@e.com',pp('a123'),['admin']);
const ed=auth.reg('ed','e@e.com',pp('e123'),['editor']);
const vw=auth.reg('vw','v@e.com',pp('v123'),['viewer']);
console.log(\`注册:admin(\${adm.id}),editor(\${ed.id}),viewer(\${vw.id})\`);

console.log("\\n---权限测试---");
const al=auth.login('a@e.com',pp('a123'));const aa=auth.verify(al.a);
console.log(\`admin权限数:\${aa.perms.length},可删用户:\${auth.check(aa,'user:delete')?'✓':'✗'},可建文章:\${auth.check(aa,'post:create')?'✓':'✗'}\`);
const el=auth.login('e@e.com',pp('e123'));const ea=auth.verify(el.a);
console.log(\`editor权限数:\${ea.perms.length},可删用户:\${!auth.check(ea,'user:delete')?'✓正确拒绝':'✗'},可编文章:\${auth.check(ea,'post:update')?'✓':'✗'}\`);
const vl=auth.login('v@e.com',pp('v123'));const va=auth.verify(vl.a);
console.log(\`viewer权限数:\${va.perms.length},可建文章:\${!auth.check(va,'post:create')?'✓正确拒绝':'✗'},可读文章:\${auth.check(va,'post:read')?'✓':'✗'}\`);

console.log("\\n---API Key测试---");
const ki=auth.mkAK(adm.id,'CI工具',['post:read','post:create']);console.log('Key:'+ki.key.slice(0,25)+'...');
const vk=auth.vAK(ki.key,'post:read');console.log(\`验证成功,uid=\${vk.uid}\`);
try{auth.vAK(ki.key,'user:delete');}catch(e:any){console.log('权限不足正确拒绝:'+e.message);}
console.log("\\n---错误处理---");
try{auth.login('a@e.com',pp('wrong'));}catch(e:any){console.log('错误密码:'+e.message);}
try{auth.verify(at('bad.token.here'));}catch(e:any){console.log('无效token:'+e.message);}
console.log("\\n==========测试完成==========");`;

// ============ 第四章代码 ============
const code4 = `console.log("==========1.TypedEventEmitter==========\\n");
const{EventEmitter}=require('events');
interface SysEvents{
  'server:start':(port:number,env:string)=>void;
  'user:reg':(u:{id:number;name:string;email:string})=>void;
  'error':(e:Error,ctx?:string)=>void;
}
class TypedEE<TEvts extends Record<string,(...a:any[])=>void>>{
  private e=new EventEmitter();
  on<K extends keyof TEvts>(ev:K,l:TEvts[K]){this.e.on(ev as string,l as any);return this;}
  emit<K extends keyof TEvts>(ev:K,...a:Parameters<TEvts[K]>){return this.e.emit(ev as string,...a);}
}
const app=new TypedEE<SysEvents>();
app.on('server:start',(p,e)=>console.log(\`服务器启动端口\${p}环境\${e}\`));
app.on('user:reg',u=>console.log(\`新用户\${u.name}<\${u.email}>\`));
app.on('error',(e,c)=>console.log(\`[错误]\${c?'('+c+')':''}\${e.message}\`));
app.emit('server:start',3000,'dev');
app.emit('user:reg',{id:1,name:'Alice',email:'a@b.com'});
app.emit('error',new Error('DB连接失败'),'db');
console.log("✓ TypedEventEmitter完成");

console.log("\\n==========2.Pub/Sub消息总线==========\\n");
interface ChMap{
  'order:created':{oid:string;uid:number;amt:number;items:string[]};
  'order:paid':{oid:string;pid:string;paidAt:Date};
  'notify:email':{to:string;subj:string;body:string};
  'log:access':{method:string;path:string;status:number;ms:number};
}
type Hdl<T>=(m:T)=>void|Promise<void>;
class Bus<TCh extends Record<string,any>>{
  private subs=new Map<keyof TCh,Set<Hdl<any>>>();
  sub<K extends keyof TCh>(ch:K,h:Hdl<TCh[K]>):()=>void{if(!this.subs.has(ch))this.subs.set(ch,new Set());this.subs.get(ch)!.add(h);return()=>this.subs.get(ch)?.delete(h);}
  async pub<K extends keyof TCh>(ch:K,m:TCh[K]){const hs=this.subs.get(ch);if(!hs)return;for(const h of hs){try{await h(m);}catch(e:any){console.log(\`处理错误\${String(ch)}:\${e.message}\`);}}}
}
const bus=new Bus<ChMap>();
bus.sub('order:created',o=>{console.log(\`[订单]新订单\${o.oid}金额¥\${o.amt}商品:\${o.items.join(',')}\`);});
bus.sub('order:paid',p=>{console.log(\`[通知]订单\${p.oid}已支付\`);bus.pub('notify:email',{to:'c@e.com',subj:'支付确认',body:\`订单\${p.oid}已支付\`});});
bus.sub('notify:email',e=>console.log(\`[邮件]发送给\${e.to}:\${e.subj}\`));
bus.sub('log:access',l=>console.log(\`[日志]\${l.method}\${l.path}->\${l.status}(\${l.ms}ms)\`));

console.log("发布消息:\\n");
bus.pub('order:created',{oid:'ORD-1',uid:1,amt:299,items:['TS教程','Node指南']});
bus.pub('order:paid',{oid:'ORD-1',pid:'PAY-1',paidAt:new Date()});
bus.pub('log:access',{method:'GET',path:'/api/u/1',status:200,ms:45});
console.log("✓ Pub/Sub完成");

console.log("\\n==========3.流处理(简化)==========\\n");
// 模拟类型化流管道:JSON解析->验证->聚合
const data=[
  JSON.stringify({id:1,name:'A',val:10}),
  JSON.stringify({id:2,name:'B',val:20}),
  JSON.stringify({id:3,name:'C',val:30}),
].join('\\n');
const lines=data.split('\\n').filter(l=>l.trim());
const results:any[]=[];let total=0,valid=0;
for(const line of lines){try{const o=JSON.parse(line);if(typeof o.id==='number'&&typeof o.name==='string'){results.push(o);valid++;total+=o.val||0;}else{console.log('跳过无效:'+line);}}catch(e){console.log('解析失败:'+line);}}
console.log(\`流处理结果:\${results.length}个有效对象,总和=\${total}\`);
results.forEach(r=>console.log(' -'+r.name+':val='+r.val));
console.log("✓ 流处理演示完成");

console.log("\\n==========4.事件溯源==========\\n");
type OE=
|{type:'order_created';oid:string;uid:number;items:{pid:string;qty:number;price:number}[];ts:Date}
|{type:'order_paid';oid:string;pid:string;amt:number;ts:Date}
|{type:'order_shipped';oid:string;tn:string;ts:Date}
|{type:'order_cancelled';oid:string;reason:string;ts:Date};
type OC=
|{type:'create_order';oid:string;uid:number;items:{pid:string;qty:number;price:number}[]}
|{type:'pay_order';oid:string;pid:string}
|{type:'ship_order';oid:string;tn:string}
|{type:'cancel_order';oid:string;reason:string};
interface OS{oid:string;uid:number;items:any[];total:number;status:'pending'|'paid'|'shipped'|'cancelled';ca:Date;paidAt?:Date;shAt?:Date;}
class EStore{
  private evts=new Map<string,OE[]>();
  append(sid:string,e:OE){if(!this.evts.has(sid))this.evts.set(sid,[]);this.evts.get(sid)!.push(e);}
  get(sid:string){return this.evts.get(sid)||[];}
  state(sid:string):OS|null{const es=this.get(sid);if(!es.length)return null;let s:OS|null=null;for(const e of es){switch(e.type){case'order_created':s={oid:e.oid,uid:e.uid,items:e.items,total:e.items.reduce((x,i)=>x+i.price*i.qty,0),status:'pending',ca:e.ts};break;case'order_paid':if(s){s.status='paid';s.paidAt=e.ts;}break;case'order_shipped':if(s){s.status='shipped';s.shAt=e.ts;}break;case'order_cancelled':if(s)s.status='cancelled';break;}}return s;}
}
class OA{constructor(private es:EStore){}exec(cmd:OC):OE[]{const s=this.es.state(cmd.oid);const evts:OE[]=[];const now=new Date();switch(cmd.type){case'create_order':if(s)throw new Error('订单已存在');evts.push({type:'order_created',oid:cmd.oid,uid:cmd.uid,items:cmd.items,ts:now});break;case'pay_order':if(!s)throw new Error('订单不存在');if(s.status!=='pending')throw new Error(\`无法支付状态\${s.status}\`);evts.push({type:'order_paid',oid:cmd.oid,pid:cmd.pid,amt:s.total,ts:now});break;case'ship_order':if(!s)throw new Error('订单不存在');if(s.status!=='paid')throw new Error(\`无法发货状态\${s.status}\`);evts.push({type:'order_shipped',oid:cmd.oid,tn:cmd.tn,ts:now});break;case'cancel_order':if(!s)throw new Error('订单不存在');if(s.status==='shipped')throw new Error('已发货无法取消');evts.push({type:'order_cancelled',oid:cmd.oid,reason:cmd.reason,ts:now});break;}for(const e of evts)this.es.append(cmd.oid,e);return evts;}}
class CBus{private hs=new Map<string,(c:any)=>any>();reg(t:string,h:(c:any)=>any){this.hs.set(t,h);}dispatch(c:OC){const h=this.hs.get(c.type);if(!h)throw new Error('无处理器:'+c.type);return h(c);}}

const es=new EStore();const oa=new OA(es);const cb=new CBus();
(['create_order','pay_order','ship_order','cancel_order']as const).forEach(t=>cb.reg(t,(c:any)=>oa.exec(c)));

console.log("订单生命周期:\\n");
cb.dispatch({type:'create_order',oid:'O-EV-1',uid:1001,items:[{pid:'P1',qty:2,price:50},{pid:'P2',qty:1,price:150}]});
let st=es.state('O-EV-1');console.log(\`1.创建:状态=\${st?.status},总额=¥\${st?.total}\`);
cb.dispatch({type:'pay_order',oid:'O-EV-1',pid:'PAY-1'});st=es.state('O-EV-1');console.log(\`2.支付:状态=\${st?.status}\`);
cb.dispatch({type:'ship_order',oid:'O-EV-1',tn:'SF123'});st=es.state('O-EV-1');console.log(\`3.发货:状态=\${st?.status},单号=\${st?.oid}\`);
console.log("\\n事件历史:");es.get('O-EV-1').forEach((e,i)=>console.log(\` \${i+1}.\${e.type}@\${e.ts.toISOString()}\`));
try{cb.dispatch({type:'ship_order',oid:'O-EV-2',tn:'X'});}catch(e:any){console.log(\`\\n正确拒绝非法操作:\${e.message}\`);}
console.log("\\n==========测试完成==========");`;

// ============ 第五章代码 ============
const code5 = `console.log("==========1.CLI选项类型与解析器==========\\n");
type OType='string'|'number'|'boolean'|'array';
interface OCfg<T=any>{type:OType;alias?:string;default?:T;desc?:string;required?:boolean;choices?:T[]}
interface ACfg{name:string;type:'string'|'number';desc?:string;required?:boolean}
interface Parsed{cmd:string[];opts:Record<string,any>;args:string[]}

function parseArgs(raw:string[],optDefs:Record<string,OCfg>):Parsed{
  const res:Parsed={cmd:[],opts:{},args:[]};
  for(const[n,d]of Object.entries(optDefs)){if(d.default!==undefined)res.opts[n]=d.default;else if(d.type==='boolean')res.opts[n]=false;else if(d.type==='array')res.opts[n]=[];}
  let i=0,dd=false;
  while(i<raw.length){const a=raw[i];
    if(a==='--'){dd=true;i++;continue;}
    if(dd){res.args.push(a);i++;continue;}
    if(a.startsWith('--')){
      const eq=a.indexOf('=');let n:string,v:string|undefined;
      if(eq!==-1){n=a.slice(2,eq);v=a.slice(eq+1);}else{n=a.slice(2);}
      const d=optDefs[n];if(!d)throw new Error(\`未知选项--\${n}\`);
      if(d.type==='boolean'){res.opts[n]=v!=='false';}
      else{if(v===undefined){i++;if(i>=raw.length)throw new Error(\`--\${n}需要值\`);v=raw[i];}
        if(d.type==='number'){const nm=Number(v);if(isNaN(nm))throw new Error(\`--\${n}需要数字\`);res.opts[n]=nm;}
        else if(d.type==='array'){if(!Array.isArray(res.opts[n]))res.opts[n]=[];res.opts[n].push(v);}
        else{if(d.choices&&!d.choices.includes(v))throw new Error(\`--\${n}必须是:\${d.choices.join(',')}\`);res.opts[n]=v;}
      }
    }else if(a.startsWith('-')&&a.length>1){
      const sn=a.slice(1);let ln:string,ld:OCfg|undefined;
      for(const[nm,df]of Object.entries(optDefs)){if(df.alias===sn[0]){ln=nm;ld=df;break;}}
      if(!ln||!ld)throw new Error(\`未知短选项-\${sn[0]}\`);
      if(ld.type==='boolean'){for(const ch of sn){let f=false;for(const[nm,df]of Object.entries(optDefs)){if(df.alias===ch){res.opts[nm]=true;f=true;break;}}if(!f)throw new Error(\`未知短选项-\${ch}\`);}}
      else{let v:string;if(sn.length>1)v=sn.slice(1);else{i++;if(i>=raw.length)throw new Error('需要值');v=raw[i];}
        res.opts[ln]=ld.type==='number'?Number(v):v;}
    }else{res.args.push(a);}
    i++;
  }
  return res;
}

// 测试解析器
const gOpts={help:{type:'boolean'as const,alias:'h',desc:'帮助',default:false},version:{type:'boolean'as const,alias:'v',desc:'版本',default:false},verbose:{type:'boolean'as const,alias:'V',desc:'详细输出',default:false}};
console.log("解析测试:");
let p=parseArgs(['-hV','--port','3000','build','--output','dist'],{...gOpts,port:{type:'number'as const,alias:'p',desc:'端口',default:3000},output:{type:'string'as const,alias:'o',desc:'输出目录'}});
console.log(\`  短选项组合: help=\${p.opts.help},verbose=\${p.opts.verbose},port=\${p.opts.port}\`);
console.log(\`  子命令和参数: args=[\${p.args.join(',')}],output=\${p.opts.output}\`);
try{parseArgs(['--port','abc'],{port:{type:'number'as const}});}catch(e:any){console.log(\`  类型验证:\${e.message}\`);}
try{parseArgs(['--unknown','x'],gOpts);}catch(e:any){console.log(\`  未知选项:\${e.message}\`);}
console.log("✓ 解析器测试完成");

console.log("\\n==========2.CLI应用框架==========\\n");
const colors={reset:'\\x1b[0m',red:'\\x1b[31m',green:'\\x1b[32m',yellow:'\\x1b[33m',cyan:'\\x1b[36m',bright:'\\x1b[1m',dim:'\\x1b[2m'};
function c(color:string,t:string){return colors[color as keyof typeof colors]+t+colors.reset;}

interface Cmd<TOpts=any,TArgs=any>{name:string;desc?:string;opts?:Record<string,OCfg>;args?:ACfg[];action?:(p:{opts:TOpts;args:TArgs;config:any})=>void|Promise<void>;subs?:Cmd[];aliases?:string[]}

class CliApp{
  private cmds=new Map<string,Cmd>();private plugins:((cli:CliApp)=>void)[]=[];private config:Record<string,any>={};
  constructor(public name:string,public version:string){}
  command<TOpts extends Record<string,OCfg>>(cmd:Cmd<TOpts>){this.cmds.set(cmd.name,cmd);if(cmd.aliases)cmd.aliases.forEach(a=>this.cmds.set(a,cmd));return this;}
  use(p:(cli:CliApp)=>void){p(this);this.plugins.push(p);return this;}
  loadConfig(cfg:Record<string,any>){this.config={...this.config,...cfg};return this;}
  private findCmd(args:string[]):{cmd:Cmd;rest:string[];path:string[]}|null{let cur:Cmd|undefined;let path:string[]=[];let i=0;for(const a of args){const cmds=i===0?this.cmds:cur?.subs;if(cmds){const f=Array.from(cmds.values?.(cur ? [cur] : this.cmds.values())).find(c=>c.name===a||c.aliases?.includes(a));if(f){cur=f;path.push(f.name);i++;}else break;}else break;}if(!cur)return null;return{cmd:cur,rest:args.slice(i),path};}
  private *[Symbol.iterator](){yield* this.cmds.values();}
  private values(){return new Set(this.cmds.values());}

  help(cmd?:Cmd,path:string[]=[]):string{
    const L:string[]=[];if(!cmd){
      L.push(c('bright',\`\\n\${this.name}v\${this.version}\`));L.push('');L.push(c('cyan','用法:'));
      L.push(\`  \${this.name}<命令>[选项]\`);L.push('');L.push(c('cyan','命令:'));
      for(const x of new Set(this.cmds.values()))L.push(\`  \${c('green',x.name.padEnd(12))}\${x.desc||''}\`);
    }else{
      const full=[this.name,...path].join(' ');L.push(c('bright',\`\\n\${cmd.desc||cmd.name}\`));L.push('');L.push(c('cyan','用法:'));
      L.push(\`  \${full}[选项]\`);
      if(cmd.subs?.length){L.push('');L.push(c('cyan','子命令:'));cmd.subs.forEach(s=>L.push(\`  \${c('green',s.name.padEnd(12))}\${s.desc||''}\`));}
    }
    return L.join('\\n');
  }

  async run(rawArgs:string[]){
    const gOpts={help:{type:'boolean'as const,alias:'h',desc:'帮助',default:false},version:{type:'boolean'as const,alias:'v',desc:'版本',default:false}};
    let pre=parseArgs(rawArgs,gOpts);
    if(pre.opts.version){console.log(\`\${this.name}v\${this.version}\`);return;}
    const found=this.findCmd(pre.args);
    const allOpts={...gOpts,...(found?.cmd.opts||{})};
    const parsed=parseArgs(rawArgs,allOpts);
    const cmdFound=this.findCmd(parsed.args);
    if(parsed.opts.help||!cmdFound){console.log(this.help(cmdFound?.cmd,cmdFound?.path||[]));return;}
    const{cmd,rest,path}=cmdFound;
    if(cmd.action){
      const cmdParsed=parseArgs(rest,cmd.opts||{});
      await cmd.action({opts:cmdParsed.opts,args:cmdParsed.args,config:this.config});
    }else{console.log(this.help(cmd,path));}
  }
}

console.log("✓ CliApp框架已创建");

console.log("\\n==========3.构建示例CLI并测试==========\\n");
const cli=new CliApp('mycli','1.0.0');
cli.loadConfig({output:'./dist',logLevel:'info'});

cli.command({name:'build',desc:'构建项目',opts:{output:{type:'string'as const,alias:'o',desc:'输出目录',default:'./dist'},watch:{type:'boolean'as const,alias:'w',desc:'监听模式',default:false},minify:{type:'boolean'as const,alias:'m',desc:'压缩',default:false}},action:({opts,args,config})=>{console.log(c('green','执行构建:'));console.log(\`  输出目录:\${opts.output}\`);console.log(\`  监听模式:\${opts.watch?'是':'否'}\`);console.log(\`  压缩:\${opts.minify?'是':'否'}\`);if(args.length)console.log(\`  目标:\${args.join(',')}\`);}});

cli.command({name:'serve',desc:'启动开发服务器',opts:{port:{type:'number'as const,alias:'p',desc:'端口',default:3000},host:{type:'string'as const,desc:'主机',default:'localhost'}},action:({opts})=>{console.log(c('green',\`启动服务器\${opts.host}:\${opts.port}\`));}});

// 插件示例
cli.use(c=>{c.command({name:'deploy',desc:'部署应用',opts:{env:{type:'string'as const,desc:'环境',choices:['dev','staging','prod'],default:'dev'}},action:({opts})=>{console.log(c('yellow',\`部署到环境:\${opts.env}\`));}});});

console.log("---测试help---");
await cli.run(['--help']);
console.log("\\n---测试build命令---");
await cli.run(['build','--output','./build','-m','src/app.ts']);
console.log("\\n---测试serve命令---");
await cli.run(['serve','-p','8080','--host','0.0.0.0']);
console.log("\\n---测试插件deploy命令---");
await cli.run(['deploy','--env','prod']);
console.log("\\n---测试version---");
await cli.run(['--version']);

console.log("\\n==========测试完成==========");`;

// ============ 写入文件 ============
const OUTPUT = path.join(__dirname, 'app/ts3-chapters-batch3.js');

const chapters = [
  { id: "ts3-node-express-types", title: "Express/Koa 框架类型安全", icon: "🚂", group: "Node.js 后端开发", content: c1, code: code1 },
  { id: "ts3-node-database-types", title: "数据库层类型安全", icon: "🗄️", group: "Node.js 后端开发", content: c2, code: code2 },
  { id: "ts3-node-auth-security", title: "认证与授权类型", icon: "🔐", group: "Node.js 后端开发", content: c3, code: code3 },
  { id: "ts3-node-events-streams", title: "事件驱动与流处理", icon: "🌊", group: "Node.js 后端开发", content: c4, code: code4 },
  { id: "ts3-node-cli-tooling", title: "CLI 工具开发", icon: "🛠️", group: "Node.js 后端开发", content: c5, code: code5 },
];

let output = `// =============================================================
// TypeScript Node.js 后端开发（第三册）—— 第三批章节
// 由生成器脚本创建
// =============================================================

export const chapters = [
`;

for (let i = 0; i < chapters.length; i++) {
  const ch = chapters[i];
  output += `  {
    id: ${JSON.stringify(ch.id)},
    title: ${JSON.stringify(ch.title)},
    icon: ${JSON.stringify(ch.icon)},
    group: ${JSON.stringify(ch.group)},
    content: \`${esc(ch.content)}\`,
    code: \`${esc(ch.code)}\`,
  }`;
  if (i < chapters.length - 1) output += ',';
  output += '\n';
}
output += '];\n';

fs.writeFileSync(OUTPUT, output, 'utf-8');

// 验证语法
const { execSync } = require('child_process');
try {
  fs.writeFileSync('/tmp/test_gen.mjs', output);
  execSync('node --check /tmp/test_gen.mjs', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('✓ ESM语法验证通过!');
  console.log('文件路径:', OUTPUT);
  console.log('文件大小:', (output.length / 1024).toFixed(1), 'KB');

  // 统计中文字符
  for (const ch of chapters) {
    const chinese = (ch.content.match(/[\u4e00-\u9fff]/g) || []).length;
    const pass = chinese >= 3000 ? '✓' : '✗';
    console.log(\`  \${pass} \${ch.id}: 中文字符 \${chinese}\`);
  }
} catch (e: any) {
  console.log('✗ 语法错误:', e.stderr?.split('\n')[0] || e.message);
  const match = (e.stderr || '').match(/:(\d+):/);
  if (match) {
    const line = parseInt(match[1]);
    const outLines = output.split('\n');
    console.log('\n错误附近:');
    for (let l = Math.max(0, line - 3); l <= Math.min(outLines.length - 1, line + 2); l++) {
      console.log(\`\${l+1 === line ? '>>>' : '   '} \${l+1}: \${outLines[l]}\`);
    }
  }
}
