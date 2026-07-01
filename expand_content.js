const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/ts3-chapters-batch3.js');
let file = fs.readFileSync(filePath, 'utf8');

// Helper to find and replace content section for a chapter
function replaceContent(chapterIdMarker, newContent) {
  // Find the pattern: content: `...`  (non-greedy, but careful with backticks)
  // Strategy: find "content: `" after the chapter id, then find the closing ` that comes before `code:`
  const idPos = file.indexOf(chapterIdMarker);
  if (idPos === -1) throw new Error('Cannot find chapter: ' + chapterIdMarker);
  
  const contentStart = file.indexOf('content: `', idPos);
  if (contentStart === -1) throw new Error('Cannot find content start for: ' + chapterIdMarker);
  
  const contentValueStart = contentStart + 'content: `'.length;
  
  // Find code: after this point
  const codePos = file.indexOf('code: `', contentValueStart);
  if (codePos === -1) throw new Error('Cannot find code for: ' + chapterIdMarker);
  
  // Find the closing backtick of content - it should be the ` right before ,\n    code:
  // Search backwards from codePos for `
  let contentEnd = codePos - 1;
  while (contentEnd > contentValueStart && file[contentEnd] !== '`') {
    contentEnd--;
  }
  if (file[contentEnd] !== '`') throw new Error('Cannot find content end for: ' + chapterIdMarker);
  
  const oldContent = file.slice(contentValueStart, contentEnd);
  const newSection = newContent; // completely replace
  
  file = file.slice(0, contentValueStart) + newSection + file.slice(contentEnd);
  console.log('Replaced content for', chapterIdMarker, '(was', oldContent.length, 'chars, now', newSection.length, 'chars)');
}

// ============= 第一章扩展内容 =============
const extra1 = `## Express/Koa 框架类型安全：构建类型安全的 Web 服务层

在现代 Node.js 后端开发中，Express 和 Koa 是两个最具影响力、生态最完善的 Web 框架。它们以简洁优雅的中间件模型、灵活的路由系统和庞大的第三方中间件生态支撑着无数生产级应用。然而，原生为 JavaScript 设计的 API 在类型安全方面存在先天不足——\`req\`、\`res\`、\`next\` 等核心对象默认是 \`any\` 类型，参数拼写错误、响应格式不一致、中间件属性访问错误等问题只能在运行时暴露。TypeScript 通过类型系统、声明合并、泛型等特性，结合 Zod 等运行时验证库，可以构建从请求到响应的端到端类型安全链路。

### 为什么 Web 框架需要类型安全？

类型安全在 Web 服务层的价值远超"减少 bug"这个表层收益。具体而言：第一，编译时捕获低级错误——参数名拼写错误、参数类型不匹配、响应字段缺失、中间件顺序错误等问题在写代码时就会被标记，而非等到线上报错；第二，优秀的 IDE 智能提示——输入 \`req.\` 时编辑器精确列出所有可用属性及其类型，大幅减少查阅文档和跳转文件的次数；第三，前后端类型共享——通过 tRPC、ts-rest 等工具可以直接从后端类型生成前端 API 客户端，消除接口联调的沟通成本；第四，重构安全——修改数据结构时 TypeScript 会标记所有受影响的路由处理器，避免重构遗漏；第五，自文档化——类型签名本身就是最精确的文档，新成员通过类型就能快速理解代码行为。

在大型团队协作项目中，类型安全的价值被进一步放大。没有类型约束的 Express 项目，随着接口数量增长，接口文档与实际代码不一致的情况会愈发严重，每个新接口的联调都需要前后端开发者反复沟通确认字段名和类型，开发效率随项目规模线性下降。而类型安全的项目中，TypeScript 编译器是最严格的接口审查者，任何不一致都会在编译阶段被发现。

### Express 类型系统基础

\`@types/express\` 提供的核心类型中，\`Request\` 接受五个泛型参数：\`Request<ParamsDictionary, ResBody, ReqBody, ReqQuery, Locals>\`。这五个参数分别对应路由参数字典、响应体类型、请求体类型、查询字符串类型、响应局部变量。例如，一个获取用户的路由可以这样标注：

\`\`\`typescript
interface GetUserParams { userId: string }
interface GetUserResponse { id: number; name: string; email: string }
app.get('/users/:userId', (
  req: Request<GetUserParams, GetUserResponse>,
  res: Response<GetUserResponse>
) => {
  res.json({ id: parseInt(req.params.userId, 10), name: 'Alice', email: 'a@b.com' });
});
\`\`\`

这种精确标注的好处立竿见影：错误访问 \`req.params.id\` 会被标红，返回缺少 \`email\` 字段的响应会编译失败。Koa 的类型设计类似但通过 Context 封装，\`@types/koa\` 同样支持泛型自定义。

### 扩展 Request 类型：模块补充与全局声明

向 Request 添加自定义属性的标准方式是模块补充（Module Augmentation）：

\`\`\`typescript
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: 'admin'|'user' };
      requestId?: string;
    }
  }
}
\`\`\`

但这种全局声明方式有两个问题：所有请求都被认为可能有 \`user\` 属性，即使该路由没有经过认证中间件，迫使开发者频繁使用非空断言 \`!\`；随着中间件增多，全局接口会越来越臃肿。更优雅的方案是类型安全的中间件组合——用泛型追踪中间件对请求类型的修改，属性在类型层面"堆叠"。

### 类型安全的中间件与属性堆叠

中间件可以修改请求对象（如认证中间件添加 \`req.user\`），类型安全的中间件类型定义应该反映这种转换：

\`\`\`typescript
type Middleware<TIn, TOut> = (
  req: TIn, res: Response, next: (err?: any) => void
) => void;

// 认证中间件接收 Request，输出 Request & { user: User }
const authMiddleware: Middleware<Request, Request & { user: User }> = (req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
};
\`\`\`

多个中间件串联时通过泛型交叉类型累积属性，最终处理器可以精确访问所有中间件添加的属性。

### 运行时验证：Zod/Valibot 与类型推断

仅有编译时类型不够——HTTP 请求来自外部世界，必须运行时验证。Zod 是 TypeScript-first 验证库的代表，Schema 既是验证器又是类型来源：

\`\`\`typescript
const CreateUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  age: z.coerce.number().int().min(0).max(150).optional(),
});
type CreateUserDto = z.infer<typeof CreateUserSchema>; // 自动推断类型
\`\`\`

\`z.coerce.number()\` 自动将字符串转为数字，完美解决路由参数/查询字符串从字符串到目标类型的转换问题。验证失败时返回结构化错误信息。

### 类型安全的错误处理

错误处理需要：自定义错误类层次（HttpError → NotFoundError/UnauthorizedError/ValidationError）；错误处理中间件通过 \`instanceof\` 窄化错误类型；统一错误响应格式 \`{ code, message, details? }\`。Express 不会自动捕获异步异常，需要 \`asyncHandler\` 包装或 try/catch。

### 路由参数与查询字符串类型转换

URL 中所有值都是字符串：\`/users/123\` 的 \`123\` 是 \`"123"\`，\`?active=true\` 的 \`true\` 是 \`"true"\`。手动 \`parseInt\` 既繁琐又容易遗漏。Zod 的 coerce 功能配合路由级别的 Schema 验证，可以一次性完成类型转换和验证。查询参数还需注意单值/多值问题——同一个 key 出现一次是 string，出现多次是 string[]。

### 本章代码演示

在可运行代码中，我们构建了一个完整的类型安全 Web 框架原型：Zod 风格的 Schema 验证（支持 string/number/boolean/object 和 coerce 转换）、自定义错误类层次、类型化中间件链（日志、认证）、参数化路由器、异步中间件支持。通过模拟 HTTP 请求（而非实际启动服务器），演示请求经过中间件链、参数验证、路由匹配、错误处理的完整类型安全数据流。`;

// ============= 第二章扩展内容 =============
const extra2 = `## 数据库层类型安全：从 Schema 到查询的全链路类型保障

数据库是后端应用的核心状态存储，但在 JavaScript 项目中数据库操作长期是类型安全的重灾区：手写 SQL 表名字段名拼写错误无人发现、查询结果是 \`any\` 类型导致后续代码失去类型提示、数据从数据库到 API 的传递过程中类型信息不断丢失、迁移脚本与模型不一致引发事故。TypeScript 配合现代 ORM（Prisma、Drizzle）和类型安全查询构建器（Kysely）可以实现从数据库 Schema 到 API 响应的端到端类型安全。

### ORM 类型系统的精妙设计

现代 TypeScript ORM 的类型系统远不止"表对应接口，字段对应属性"这么简单。以 Prisma 为例，它为每个模型生成多种类型：完整模型类型（包含所有字段）、创建输入类型（排除自增主键和有默认值的字段）、更新输入类型（所有字段可选）、查询条件类型（支持各种过滤操作符）、Include/Select 类型（控制关联加载和字段裁剪）。最精妙的是动态类型推断：当查询 \`include: { posts: true }\` 时，返回类型自动包含 \`posts\` 数组；当 \`select: { id: true, name: true }\` 时，返回类型只包含 id 和 name。这依赖条件类型、映射类型和泛型高阶类型编程。

Drizzle ORM 走得更远——完全用 TypeScript 代码定义 Schema，不需要单独文件也不需要代码生成步骤，修改 Schema 后类型推断立即更新。例如：

\`\`\`typescript
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
\`\`\`

### 类型安全查询构建器

查询构建器是手写 SQL 和 ORM 之间的平衡点。Kysely 是目前最优秀的类型安全 SQL 查询构建器，它能在编译时确保：表名和字段名真实存在（通过从数据库 Schema 生成类型定义）；字段比较类型兼容（不能拿字符串和数字比较）；JOIN 关联条件正确；联表查询后结果类型正确推断。实现这些需要 Branded Types（标记合法表名/字段名）、泛型约束（方法只接受已定义字段）、类型状态模式（追踪查询构建状态确保方法调用顺序正确）。

### 数据库到 JavaScript 的类型映射

数据库类型和 JS 类型不是一一对应的：VARCHAR/TEXT → string，INTEGER → number（注意 BigInt 需要特殊处理以避免精度丢失），TIMESTAMP → Date 或格式化字符串，BOOLEAN → boolean（SQLite 中可能是 0/1），JSONB → 任意对象，NULL → null。类型安全的行映射应该包含运行时检查，而非简单的 \`as User\` 断言。Prisma 的 Decimal 类型不返回 number 正是因为浮点数精度问题——处理金额等场景必须使用 Decimal.js。

### Repository 模式与泛型抽象

Repository 模式将数据访问封装在专门的类中，通过泛型定义通用 CRUD：\`Repository<TEntity, TInsert, TUpdate>\`。基类实现 create/findById/findMany/update/delete/count，子类添加业务查询方法（findByEmail、findPublishedPosts）。每个方法返回精确的 Promise 类型（如 \`Promise<User | null>\`），查询条件用 \`keyof\` 约束防止传入不存在字段。

### 分页类型与事务类型

分页需要明确输入参数（page、pageSize、sort、order，其中 sort 约束为 \`keyof TEntity\`）和结果结构（data、total、page、pageSize、totalPages、hasNext/hasPrev）。事务方面，现代 ORM 推荐回调式 API（\`$transaction(async tx => {...})\`），类型系统确保回调内只能使用事务客户端 \`tx\`，隔离级别类型明确。

### 数据库迁移类型安全

迁移确保 Schema 变更可控。Prisma Migrate 对比 Schema 和数据库自动生成迁移；Drizzle 的 drizzle-kit 从 TS Schema 直接生成 SQL。类型安全迁移要求：迁移脚本中的表名/列名与模型一致；添加非空字段时考虑默认值；回滚操作正确撤销变更。

### 本章代码演示

我们构建了纯内存数据库模拟，实现类型安全 Schema 定义（支持 string/number/boolean/date、nullable/primary/unique/default）、从 Schema 自动推断实体/插入/更新类型、泛型 Repository 基类和具体 Repository（User/Post）、分页查询、Unit of Work 模式整合多 Repository、类型安全事务（支持回滚和提交）。通过用户创建、文章发布、分页查询、事务回滚等场景演示完整的类型安全数据访问。`;

// ============= 第三章扩展内容 =============
const extra3 = `## 认证与授权类型：将安全规则编码到类型层面

认证（AuthN）和授权（AuthZ）是后端安全体系的两大基石。认证验证"你是谁"，授权控制"你能做什么"。在纯 JavaScript 中，大量安全规则只存在于开发者的记忆和运行时判断中——明文密码可能意外入数据库、Access Token 和 Refresh Token 可能被错误混用、权限检查可能遗漏。TypeScript 通过品牌类型、可辨识联合、类型守卫等工具，可以将安全规则编码到类型层面，让编译器在编译阶段捕获安全漏洞。

### 品牌类型：防止安全敏感值混淆

后端处理大量安全敏感的字符串值：明文密码、密码哈希、Access Token、Refresh Token、API Key、Session ID。虽然运行时都是 string，但业务含义完全不同：明文密码绝不能入数据库、密码哈希不能再次哈希、Access Token 有效期短用于 API 访问、Refresh Token 有效期长仅用于续签。

TypeScript 的结构化类型系统让两个 string 完全兼容，无法区分。品牌类型通过交叉类型附加唯一标记解决此问题：

\`\`\`typescript
type Brand<T, B> = T & { readonly __brand: B };
type PlainPassword = Brand<string, 'PlainPassword'>;
type HashedPassword = Brand<string, 'HashedPassword'>;
\`\`\`

定义后这些类型互不兼容——接受 HashedPassword 的函数无法传入 PlainPassword，从类型层面杜绝了明文入数据库或重复哈希的错误。品牌属性 \`__brand\` 仅为编译时标记，运行时不存在，零开销。

品牌类型还可实现"能力标记"模式：\`AuthenticatedRequest\` 包含非可选 user 属性，受保护路由强制要求此类型，未认证的请求类型不匹配无法传入。

### 密码处理的类型安全

密码安全的核心规则：永远不明文存储，使用慢速加盐哈希（PBKDF2/bcrypt/Argon2）；hash 函数只接受 PlainPassword 返回 HashedPassword；verify 使用常量时间比较（\`crypto.timingSafeEqual\`）防时序攻击。通过类型区分 PlainPassword 和 HashedPassword 是防止密码处理错误的第一道防线。

### JWT 类型安全：Access vs Refresh 的严格区分

JWT 类型安全要求：严格区分 Access Token（短期、含权限信息、用于 API 访问）和 Refresh Token（长期、最小信息、仅用于续签）的载荷类型和品牌类型；sign 函数返回对应品牌类型；verify 接受期望类型参数并返回对应 Payload；永不在 Payload 存放敏感信息（Base64 不是加密）。

### RBAC 权限系统类型建模

RBAC 是最广泛的授权模型：权限→角色→用户。使用模板字面量类型自动生成 Permission：

\`\`\`typescript
type Role = 'admin'|'editor'|'viewer';
type Resource = 'user'|'post'|'comment';
type Action = 'create'|'read'|'update'|'delete';
type Permission = \`\${Resource}:\${Action}\`; // 自动生成联合类型
const rolePermissions: Record<Role, Permission[]> = { admin: [...], editor: [...], viewer: [...] };
\`\`\`

模板字面量类型确保不会出现拼写错误（如 'posts:delete'），\`Record<Role, Permission[]>\` 确保角色只被分配合法权限。

### 认证中间件类型安全

认证中间件需要：区分 AuthenticatedRequest（非可选 user）和普通 Request；受保护路由强制接受 AuthenticatedRequest；Token 验证的各种错误对应明确错误类型；\`requirePermission(perm)\` 高阶中间件的 perm 参数约束为合法 Permission 类型。

### API Key 认证类型

API Key 用于服务间通信：品牌类型保护防混淆；存储哈希值（与密码同原则）；关联 scopes（与 RBAC Permission 一致）；支持过期和速率限制；验证时检查存在性和权限范围。

### 会话管理类型

基于 Session 的认证需要明确定义 Session 数据结构、SessionStore 接口（get/set/destroy/touch）、Cookie 安全属性（httpOnly/secure/sameSite）。分布式 Session 存储要求数据可序列化，类型检查防止存入不可序列化值。

### OAuth 2.0 类型

OAuth 第三方登录需要定义授权流程各阶段参数类型、令牌响应类型、不同 Provider 的用户信息可辨识联合类型。

### 本章代码演示

我们使用 Node.js 内置 crypto 模块构建完整类型安全认证系统：品牌类型保护敏感值、PBKDF2 密码哈希+常量时间验证、HS256 JWT 签发验证（区分 Access/Refresh）、RBAC 角色权限矩阵、AuthService 注册/登录/权限检查、API Key 生成与验证。通过多角色权限测试、错误场景演示、API Key 越权拒绝等展示类型安全的完整实现。`;

// ============= 第四章扩展内容 =============
const extra4 = `## 事件驱动与流处理：类型安全的异步架构

事件驱动和非阻塞 I/O 是 Node.js 的核心设计哲学，EventEmitter 和 Stream 是这一哲学的具体实现。原生 EventEmitter 无类型——事件名为任意字符串，监听器参数为 any；流中传输的数据类型不明确。TypeScript 通过泛型、映射类型、条件类型可以为事件系统和流添加精确类型约束，构建类型安全的事件驱动架构和数据管道。

### TypedEventEmitter：从字符串到类型安全事件

为 EventEmitter 添加类型安全的核心是事件映射类型（Event Map）：

\`\`\`typescript
interface AppEvents {
  'server:start': (port:number, env:string) => void;
  'user:register': (user:{id:number;name:string}) => void;
  'error': (err:Error, ctx?:string) => void;
}
class TypedEE<TEvts extends Record<string,...>>{
  on<K extends keyof TEvts>(ev:K, fn:TEvts[K]){...}
  emit<K extends keyof TEvts>(ev:K,...args:Parameters<TEvts[K]>){...}
}
\`\`\`

关键技巧：\`keyof TEvts\` 约束事件名，\`Parameters<TEvts[K]>\` 从监听器签名提取参数类型。错误事件名、参数数量/类型不符都会被编译捕获。

### 事件映射设计最佳实践

统一事件命名（\`resource:action\` 格式如 'order:created'）避免冲突；基础事件接口包含 eventId/timestamp/type 支持通用处理（日志、持久化）；事件版本化应对业务演进；可辨识联合类型汇总所有事件，通过 event.type 窄化类型获得精确 payload 提示。

### Pub/Sub 消息总线类型

Pub/Sub 通过频道解耦发布者订阅者。类型安全实现通过 Channel Map 建立频道名→消息类型映射：publish 确保消息符合频道类型，subscribe 处理函数接收正确类型。分布式场景下通过共享类型包保持跨服务消息类型一致。

### Node.js Stream 类型

Node.js Stream 分 Readable/Writable/Duplex/Transform，@types/node 提供泛型指定数据类型。实际管道中数据类型经常变化（Buffer→string→JSON→DTO），自定义 TypedTransform<TInput,TOutput> 通过泛型追踪类型变化。还需正确处理背压：write 返回 false 时等待 drain 事件。

### 消息队列与任务队列类型

类型安全消息队列定义消息类型映射、处理器类型、元数据类型（优先级/延迟/重试/死信）。任务队列定义 Job/JobResult 类型确保处理器参数返回正确；进度/完成/失败事件也有类型定义。

### 事件溯源类型

事件溯源存储事件序列而非当前状态，通过重放重建状态。类型安全需要：聚合根类型、领域事件可辨识联合、EventStore 接口（append/load）、apply 函数类型安全更新状态。关键约束：命令只能在正确状态产生事件；apply 使用 never 检查确保穷尽处理所有事件类型。

### CQRS 类型

CQRS 分离命令（改变状态不返回值）和查询（返回值不改变状态）。类型安全 CQRS 定义 Command/Query 数据类型、Handler 类型、类型映射建立命令→处理器对应，dispatch 根据类型推断参数和返回值。

### 本章代码演示

我们实现：泛型 TypedEventEmitter（on/once/off/emit 全类型安全）、Pub/Sub 消息总线（异步处理、多订阅者、错误隔离）、类型化流管道（Readable→Parser→Enricher→Aggregator，使用 objectMode Transform 追踪类型变化），演示事件订阅发布、日志流解析聚合等场景，所有代码使用 Node.js 内置 events/stream 模块。`;

// ============= 第五章扩展内容 =============
const extra5 = `## CLI 工具开发：类型安全的命令行程序

CLI 工具是开发者日常工作的核心——从 git/npm/docker 到脚手架、构建工具、部署脚本。TypeScript 为 CLI 开发带来参数类型安全、命令结构约束、配置验证、插件类型扩展等优势。

### 命令行参数类型：从字符串数组到类型化对象

process.argv 是字符串数组，需要解析为结构化对象。参数分位置参数（有序、如 \`cp src dest\` 中的 src/dest）和选项（--flags），选项又分布尔标志（--verbose）、字符串选项（--output dist）、数字选项（--port 3000，需从字符串转换）、数组选项（多次 --include）。类型安全解析不仅提取值，还在类型层面转换为正确类型——number 选项解析后类型是 number 而非 string，必填选项类型不含 undefined。

通过选项配置对象描述参数结构，TypeScript 从配置推断解析结果类型：

\`\`\`typescript
const opts = {
  port: { type: 'number', short: 'p', default: 3000 },
  verbose: { type: 'boolean', short: 'v' },
  output: { type: 'string', required: true },
};
type ParsedOpts = OptionsFromConfig<typeof opts>;
// { port: number; verbose: boolean; output: string }
\`\`\`

### 命令与子命令类型

现代 CLI 采用树状命令结构（git commit/push、docker build/run）。类型安全命令系统定义命令名/描述/选项/参数/处理器/子命令，通过建造者模式+方法链注册，泛型累积选项参数类型，最终处理器获得完整类型信息。

### 选项类型与验证

选项配置包含：类型（string/number/boolean/array）、短选项、默认值、描述、必填标志、枚举 choices、互斥/依赖关系。编译时区分必填/可选类型；运行时检查必填、类型转换、枚举范围、路径存在性。

### 配置文件类型安全加载

CLI 支持配置文件（JSON/YAML/TOML/JS）设置默认值。类型安全加载：定义 Schema/Zod 模式验证配置文件；支持多格式解析；多层配置合并（命令行>环境变量>配置文件>默认值）保持类型正确。

### 插件系统类型

可扩展 CLI 通过插件机制（如 Vue CLI、ESLint）允许第三方扩展。类型安全插件系统定义 Plugin 接口（通常是接收 context 的函数）、PluginContext 类型（注册命令/选项/钩子的 API）、生命周期钩子类型。"插件作为函数"模式最易实现——插件接收类型化上下文并通过 context API 注册扩展。

### 交互式 CLI 与进度报告

交互元素也有类型安全 API：进度条 update 接受 0-100 数字或(completed,total)元组；确认提示返回 boolean、文本输入返回 string、选择列表返回字面量联合类型（如 'small'|'medium'|'large'）；彩色输出约束有效颜色名。

### 帮助信息自动生成

--help 应该从类型定义和选项配置自动生成，而非手动维护。每个选项/命令的 description 都是配置的一部分，新增选项时帮助自动更新，避免帮助与实际功能不一致。

### CLI 错误处理

CLI 错误应输出到 stderr 并使用正确退出码（0成功/1一般错误/2参数错误）。定义 CliError 类含 exitCode，统一处理输出友好消息（颜色、建议），--verbose 输出完整堆栈。正确处理 SIGINT（Ctrl+C）优雅退出。

### 本章代码演示

我们从零构建类型安全 CLI 框架：泛型命令注册（链式 API、类型推断）、多类型选项解析（string/number/boolean/array、短选项、默认值、必填验证、choices 枚举）、子命令嵌套、自动帮助生成（--help）、配置加载验证、插件注册机制、进度条和彩色输出模拟。通过模拟不同 process.argv 输入展示 build/serve/deploy 等命令的类型安全解析和执行。`;

// Perform replacements
replaceContent('ts3-node-express-types', extra1);
replaceContent('ts3-node-database-types', extra2);
replaceContent('ts3-node-auth-security', extra3);
replaceContent('ts3-node-events-streams', extra4);
replaceContent('ts3-node-cli-tooling', extra5);

fs.writeFileSync(filePath, file, 'utf8');
console.log('\\nDone! File written to', filePath);

// Verify syntax
const { execSync } = require('child_process');
try {
  execSync('node --check "' + filePath + '"', { stdio: 'pipe' });
  console.log('✓ Syntax check passed');
} catch(e) {
  console.error('Syntax error:', e.message);
  process.exit(1);
}
