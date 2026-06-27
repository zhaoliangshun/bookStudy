// =============================================================
// GraphQL 交互式教程 - 第 4 批章节（实战）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. gql-fullstack       — 前后端完整 CRUD 实战
//   2. gql-auth            — 认证与授权
//   3. gql-client          — 前端集成
//   4. gql-best-practices  — 最佳实践与性能优化
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为"实战"）
//   content : Markdown 格式的详细讲解（文字量 ≥ 600 行）
//   code    : 可运行的示例代码（≥ 80 行，三段式格式）
//
// code 字段格式（三段式）：
//   # === Schema ===
//   # === Resolvers ===
//   # === Query ===
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：前后端完整 CRUD 实战
  // =========================================================
  {
    id: "gql-fullstack",
    title: "前后端完整 CRUD 实战",
    icon: "🏠",
    group: "实战",
    content: `## 前后端完整 CRUD 实战

GraphQL 的真正威力在于它能够统一前后端的数据交互方式。本章将通过构建一个**完整的博客系统**来展示 GraphQL 如何贯穿前后端，实现从 Schema 定义到数据查询的完整链路。我们将实现 Post（文章）和 Comment（评论）两个核心资源，涵盖查询、新增、修改、删除等全部 CRUD 操作。

### 项目概述

我们要构建的博客系统包含以下功能：

1. **文章管理**：查看所有文章、查看单篇文章详情、创建新文章、编辑文章、删除文章
2. **评论管理**：查看文章的评论列表、为文章添加评论
3. **关联查询**：通过文章查询其所有评论，通过评论查询其所属文章

整个系统使用 GraphQL 作为唯一的 API 层，前端通过 GraphQL 查询获取数据，后端通过 Resolver 函数处理业务逻辑。

### Schema 设计：一切从类型定义开始

GraphQL 开发的第一步永远是**定义 Schema**。Schema 是前端和后端之间的契约——它告诉前端可以查询什么数据、可以执行什么操作。

#### 基础类型定义

在 GraphQL 中，类型（Type）是描述数据结构的核心方式。每个类型包含若干字段（Field），每个字段有明确的类型。

对于博客系统，我们需要定义两个核心类型：\`Post\`（文章）和 \`Comment\`（评论）。

\`\`\`graphql
type Post {
  id: ID!
  title: String!
  content: String!
  author: String!
  createdAt: String!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  postId: ID!
  content: String!
  author: String!
  createdAt: String!
}
\`\`\`

**类型设计要点**：

- \`ID!\` 表示非空 ID 类型，GraphQL 的 ID 类型会被序列化为字符串
- \`String!\` 表示非空字符串，带 \`!\` 的字段保证返回值不会为 null
- \`[Comment!]!\` 表示非空的 Comment 数组，且数组内元素也不为 null
- \`createdAt\` 使用字符串类型存储时间戳，便于前端展示

#### 关联关系设计

GraphQL 的一个核心优势是**关联查询**。在 REST 中，获取文章及其评论通常需要两次请求（\`GET /posts/1\` 和 \`GET /posts/1/comments\`），但在 GraphQL 中，一次查询即可完成。

\`Post\` 和 \`Comment\` 之间是一对多关系：
- 一篇文章可以有多个评论
- 每个评论属于一篇文章

通过 \`postId\` 字段建立关联，解析器通过 \`postId\` 查找对应的评论。

#### 输入类型（Input Type）

GraphQL 的 Mutation 操作需要接收参数。对于复杂的参数，建议使用**输入类型（Input Type）** 来组织参数，而不是一个个孤立的标量参数。

\`\`\`graphql
input PostInput {
  title: String!
  content: String!
  author: String!
}

input PostUpdateInput {
  title: String
  content: String
}

input CommentInput {
  postId: ID!
  content: String!
  author: String!
}
\`\`\`

**Input Type 设计原则**：

- 创建操作使用专门的 Input 类型，所有必填字段加 \`!\`
- 更新操作使用可选的 Input 类型，只传需要修改的字段（部分更新）
- Input 类型名称通常以 \`Input\` 结尾，语义清晰

#### Query 和 Mutation 定义

完成类型定义后，需要定义根操作类型——Query 和 Mutation。

\`\`\`graphql
type Query {
  posts: [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createPost(input: PostInput!): Post!
  updatePost(id: ID!, input: PostUpdateInput!): Post!
  deletePost(id: ID!): Boolean!
  createComment(input: CommentInput!): Comment!
  deleteComment(id: ID!): Boolean!
}
\`\`\`

**操作设计要点**：

- \`posts\` 查询返回所有文章列表，适合列表页
- \`post(id)\` 查询返回单篇文章，适合详情页。返回类型为 \`Post\`（不加 \`!\`），因为找不到时返回 null
- \`createPost\` 接收 \`PostInput\`，返回创建后的完整文章对象
- \`updatePost\` 接收 ID 和可选的更新字段，返回更新后的文章
- \`deletePost\` 返回 Boolean，表示删除是否成功
- \`createComment\` 和 \`deleteComment\` 同理

### 解析器实现

Schema 定义了"能做什么"，Resolvers 定义了"怎么做"。解析器是 GraphQL 服务器的核心——它负责为每个字段提供实际数据。

#### 数据存储层

在生产环境中，数据通常存储在数据库中。但在教程中，我们使用**内存数组**模拟数据存储，这样可以专注于 GraphQL 本身的概念。

数据存储的设计要点：
- 使用 JavaScript 数组存储数据
- 使用简单的自增 ID 生成器
- 数据在内存中，服务器重启后丢失（仅用于演示）

#### Query 解析器

Query 解析器负责处理查询请求，从数据源获取数据并返回。

**获取所有文章**：

\`\`\`javascript
posts: () => {
  // 返回所有文章，为每篇文章附加其评论
  return posts.map(post => ({
    ...post,
    comments: comments.filter(c => c.postId === post.id)
  }));
}
\`\`\`

**获取单篇文章**：

\`\`\`javascript
post: (_, { id }) => {
  const post = posts.find(p => p.id === id);
  if (!post) return null;
  return {
    ...post,
    comments: comments.filter(c => c.postId === post.id)
  };
}
\`\`\`

解析器函数签名 \`(parent, args, context, info)\`：
- \`parent\`：父级解析器的返回值（根查询时为 undefined）
- \`args\`：查询参数（如 \`id\`）
- \`context\`：请求上下文（如认证信息、数据库连接）
- \`info\`：查询的 AST 信息（通常很少使用）

#### Mutation 解析器

Mutation 解析器处理数据变更操作，是 GraphQL 中唯一会修改数据的地方。

**创建文章**：

\`\`\`javascript
createPost: (_, { input }) => {
  const newPost = {
    id: String(++nextId),  // 自增 ID
    ...input,               // 展开输入参数
    createdAt: new Date().toISOString(),
    comments: []
  };
  posts.push(newPost);      // 存入数组
  return newPost;           // 返回创建后的对象
}
\`\`\`

**更新文章（部分更新）**：

\`\`\`javascript
updatePost: (_, { id, input }) => {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('文章不存在');
  }
  // 合并更新：保留原有字段，只覆盖传入的字段
  posts[index] = { ...posts[index], ...input };
  return posts[index];
}
\`\`\`

**删除文章**：

\`\`\`javascript
deletePost: (_, { id }) => {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return false;
  posts.splice(index, 1);
  // 同时删除关联的评论（级联删除）
  comments = comments.filter(c => c.postId !== id);
  return true;
}
\`\`\`

### 关联查询解析器

GraphQL 的一个重要特性是每个字段都有自己的解析器。当查询 \`Post.comments\` 时，GraphQL 会调用 \`Post\` 类型的 \`comments\` 字段解析器。

\`\`\`javascript
Post: {
  comments: (parent) => {
    // parent 是当前 Post 对象
    return comments.filter(c => c.postId === parent.id);
  }
}
\`\`\`

这种设计的好处是：
- **按需加载**：只有当客户端请求 \`comments\` 字段时，才会执行评论查询
- **关注点分离**：每个类型的解析器只关心自己的字段
- **避免过度获取**：不需要评论时，不会执行额外的查询

### 错误处理

GraphQL 的错误处理分为两个层面：**字段级错误**和**操作级错误**。

#### 字段级错误

当某个字段解析失败时，GraphQL 不会让整个查询失败，而是在响应中为该字段返回 \`null\`，并在 \`errors\` 数组中记录错误信息。

\`\`\`json
{
  "data": {
    "post": {
      "title": "Hello World",
      "author": null
    }
  },
  "errors": [
    {
      "message": "无法获取作者信息",
      "path": ["post", "author"]
    }
  ]
}
\`\`\`

这种**部分成功**的设计让客户端可以优雅地处理错误，不会因为一个字段失败而丢失所有数据。

#### 操作级错误

对于 Mutation 操作，如果找不到资源或参数无效，应该抛出明确的错误。

\`\`\`javascript
if (!post) {
  throw new Error('找不到 ID 为 ' + id + ' 的文章');
}
\`\`\`

通过自定义错误类，可以附加更多错误信息：

\`\`\`javascript
class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.extensions = { code };
  }
}
throw new AppError('文章不存在', 'NOT_FOUND');
\`\`\`

### 查询演示

以下是一些常见的查询示例，展示 GraphQL 查询的灵活性。

#### 查询所有文章及其评论数

\`\`\`graphql
query {
  posts {
    id
    title
    author
    commentCount: comments {
      id
    }
  }
}
\`\`\`

这里使用了**别名**（\`commentCount\`），让字段名更语义化。

#### 查询单篇文章的完整信息

\`\`\`graphql
query GetPost($id: ID!) {
  post(id: $id) {
    title
    content
    author
    createdAt
    comments {
      author
      content
      createdAt
    }
  }
}
\`\`\`

#### 创建文章并立即获取详情

\`\`\`graphql
mutation {
  createPost(input: {
    title: "GraphQL 入门指南",
    content: "这是一篇关于 GraphQL 的详细介绍...",
    author: "张三"
  }) {
    id
    title
    createdAt
  }
}
\`\`\`

#### 更新文章的部分字段

\`\`\`graphql
mutation {
  updatePost(id: "1", input: {
    title: "GraphQL 进阶指南（更新版）"
  }) {
    id
    title
    content
  }
}
\`\`\`

### 前后端协作流程

在实际项目中，GraphQL 的前后端协作流程如下：

1. **后端定义 Schema**：使用 SDL（Schema Definition Language）定义类型和操作
2. **后端实现 Resolvers**：为每个字段编写数据获取逻辑
3. **前端编写查询**：根据 Schema 编写需要的 GraphQL 查询
4. **前端发送请求**：通过 HTTP POST 将查询发送到 GraphQL 端点
5. **后端处理请求**：解析查询、验证、执行 Resolvers、返回结果
6. **前端处理响应**：解析 JSON 响应，渲染 UI

### 输入验证

虽然 GraphQL 的类型系统提供了基本的类型校验，但业务层面的验证仍需要在 Resolver 中实现。

\`\`\`javascript
createPost: (_, { input }) => {
  // 标题长度验证
  if (input.title.length < 3) {
    throw new Error('标题至少需要 3 个字符');
  }
  if (input.title.length > 100) {
    throw new Error('标题不能超过 100 个字符');
  }
  // 内容验证
  if (input.content.length < 10) {
    throw new Error('内容至少需要 10 个字符');
  }
  // 作者名验证
  if (!input.author.trim()) {
    throw new Error('作者名不能为空');
  }
  // 创建文章...
}
\`\`\`

### 批量操作与事务

在 GraphQL 中，一个 Mutation 可以同时执行多个操作。但需要注意的是，GraphQL 规范中 Mutation 的顶级字段是**顺序执行**的，而 Query 的顶级字段是**并行执行**的。

\`\`\`graphql
mutation {
  first: createPost(input: { title: "第一篇文章", ... }) { id }
  second: createPost(input: { title: "第二篇文章", ... }) { id }
}
\`\`\`

上面的两个 Mutation 操作会按顺序执行——先创建第一篇文章，再创建第二篇。如果第一篇创建失败，第二篇仍然会执行（除非使用特定框架的事务支持）。

### GraphQL 与 REST 的对比

| 特性 | REST | GraphQL |
|------|------|---------|
| 数据获取 | 多个端点，每个端点返回固定结构 | 单一端点，客户端指定返回结构 |
| 关联查询 | 需要多次请求或手动拼接 | 一次请求获取关联数据 |
| 版本管理 | 通常通过 URL 版本化（/v1, /v2） | 通过 Schema 演进，无需版本化 |
| 字段选择 | 服务端决定返回哪些字段 | 客户端决定返回哪些字段 |
| 类型安全 | 需要额外工具（如 OpenAPI） | 内建类型系统 |
| 缓存 | HTTP 缓存天然支持 | 需要额外处理（如 Apollo Cache） |
| 学习曲线 | 较低，HTTP 基础即可 | 需要学习 SDL 和查询语法 |

### 实际项目中的扩展方向

当博客系统从 Demo 走向生产环境时，需要考虑以下扩展：

1. **数据库集成**：使用 MongoDB、PostgreSQL 等替换内存数组
2. **分页**：当文章数量增多时，需要实现基于游标或偏移量的分页
3. **搜索**：添加全文搜索功能（如 Elasticsearch 集成）
4. **文件上传**：实现文章封面图的上传功能
5. **实时更新**：通过 GraphQL Subscription 实现评论的实时推送
6. **权限控制**：只有文章作者才能编辑和删除自己的文章
7. **数据验证层**：使用专门的验证库（如 Joi、Zod）统一验证逻辑
8. **API 文档**：利用 GraphQL 的内省（Introspection）自动生成文档

### 实际开发中的常见问题与解决方案

#### 问题一：ID 类型处理

GraphQL 的 ID 类型在传输时会被序列化为字符串，但数据库中的 ID 可能是数字。在 Resolver 中需要做类型转换：

\`\`\`javascript
// 数据库返回的 ID 是数字
const post = db.posts.find(p => p.id === parseInt(args.id));
\`\`\`

一种更好的做法是始终在后端使用字符串 ID，避免类型转换的麻烦。

#### 问题二：循环引用

在类型系统中，如果 Post 引用 Comment，Comment 又引用 Post，就会形成循环引用。GraphQL 本身不会阻止这种设计，但需要注意：

\`\`\`graphql
type Post {
  comments: [Comment!]!
}

type Comment {
  post: Post!  # 反向引用
}
\`\`\`

这种设计是合理的，因为客户端可以选择不查询 Comment.post 字段，从而避免无限循环。但需要确保 Resolver 不会造成无限递归。

#### 问题三：空值处理

当查询返回 null 时，需要区分"字段不存在"和"字段值为 null"。GraphQL 的类型系统中的 \`!\` 标记可以帮助区分：

\`\`\`graphql
type Post {
  title: String!    # 保证非空
  subtitle: String  # 可能为 null
}
\`\`\`

#### 问题四：大量数据的性能

当数据量很大时，\`posts\` 查询返回所有数据会导致性能问题。解决方案包括：

\`\`\`graphql
type Query {
  posts(limit: Int = 10, offset: Int = 0): [Post!]!
}
\`\`\`

通过分页参数限制返回数量，避免一次性加载所有数据。

### 解析器设计模式

#### 模式一：瘦解析器（Thin Resolver）

将业务逻辑放在独立的 Service 层，Resolver 只负责调用 Service：

\`\`\`javascript
// Service 层
class PostService {
  static findAll() {
    return db.posts.find().sort({ createdAt: -1 });
  }

  static findById(id) {
    return db.posts.findOne({ id: parseInt(id) });
  }
}

// Resolver 层
const resolvers = {
  Query: {
    posts: () => PostService.findAll(),
    post: (_, { id }) => PostService.findById(id)
  }
};
\`\`\`

这种模式的好处是：
- Service 层可以独立测试
- Resolver 保持简洁，只做参数传递
- 业务逻辑可以在多个 Resolver 间复用

#### 模式二：组合解析器

使用高阶函数组合多个解析器逻辑：

\`\`\`javascript
// 日志记录包装器
function withLogging(resolver) {
  return async (parent, args, context, info) => {
    console.log('执行: ' + info.fieldName);
    const start = Date.now();
    const result = await resolver(parent, args, context, info);
    console.log('耗时: ' + (Date.now() - start) + 'ms');
    return result;
  };
}

// 错误处理包装器
function withErrorHandling(resolver) {
  return async (parent, args, context, info) => {
    try {
      return await resolver(parent, args, context, info);
    } catch (error) {
      console.error('Resolver 错误: ' + error.message);
      throw error;
    }
  };
}

// 组合使用
const resolvers = {
  Query: {
    posts: withLogging(withErrorHandling(() => PostService.findAll()))
  }
};
\`\`\`

### 数据一致性

在 Mutation 操作中，保持数据一致性非常重要。对于一个创建文章并添加标签的操作：

\`\`\`graphql
mutation {
  createPost(input: { title: "新文章", ... }) {
    id
  }
  addTag(postId: "new_id", tag: "GraphQL") {
    success
  }
}
\`\`\`

由于 Mutation 是顺序执行的，如果 \`addTag\` 失败，\`createPost\` 已经执行成功了。在关键业务场景中，需要考虑使用事务或其他补偿机制。

### 文件上传

GraphQL 本身不直接支持文件上传，但可以通过以下方式实现：

\`\`\`graphql
# 使用 multipart/form-data 和专门的 Upload 标量类型
type Mutation {
  uploadPostImage(postId: ID!, file: Upload!): Image!
}
\`\`\`

或者使用 GraphQL 处理元数据，文件上传使用传统的 REST 端点。

### 订阅（Subscription）简介

GraphQL 的订阅功能允许客户端实时接收数据更新。这对于博客系统的评论通知、文章发布通知等场景非常有用：

\`\`\`graphql
type Subscription {
  postCreated: Post!
  commentAdded(postId: ID!): Comment!
}
\`\`\`

订阅基于 WebSocket 协议，当服务端触发事件时，所有订阅了该事件的客户端都会收到推送。

### 本章小结

通过构建这个博客系统的 CRUD 功能，你掌握了：

- GraphQL 的 Schema 设计方法，包括类型定义、输入类型和操作定义
- Resolver 的编写模式，包括 Query 和 Mutation 解析器
- 关联查询的实现方式，通过类型级别的字段解析器
- 错误处理的最佳实践
- 前后端协作的完整流程
- 常见问题的解决方案（ID 类型、循环引用、空值处理、性能）
- 解析器设计模式（瘦解析器、组合解析器）
- 数据一致性和文件上传的考虑
- GraphQL 订阅（Subscription）的基础概念

> **提示**：本章的代码演示可以在浏览器中直接运行。代码中的 Resolver 函数模拟了真实的 GraphQL 执行引擎，你可以通过修改查询参数来探索不同的数据获取方式。建议在阅读完每个小节后，回到代码中实践对应的操作。

这些是使用 GraphQL 构建任何应用的基础。下一章，我们将深入探讨认证与授权，为博客系统添加用户管理功能。`,

    code: `# === Schema ===
# ------------------------------------------------------------
# 博客系统完整 Schema
# 包含 Post 和 Comment 两个核心类型的 CRUD 操作
# ------------------------------------------------------------

type Post {
  id: ID!
  title: String!
  content: String!
  author: String!
  createdAt: String!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  postId: ID!
  content: String!
  author: String!
  createdAt: String!
}

input PostInput {
  title: String!
  content: String!
  author: String!
}

input PostUpdateInput {
  title: String
  content: String
}

input CommentInput {
  postId: ID!
  content: String!
  author: String!
}

type Query {
  posts: [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createPost(input: PostInput!): Post!
  updatePost(id: ID!, input: PostUpdateInput!): Post!
  deletePost(id: ID!): Boolean!
  createComment(input: CommentInput!): Comment!
  deleteComment(id: ID!): Boolean!
}

# === Resolvers ===
// ------------------------------------------------------------
// 博客系统 Resolver 完整实现
// 使用内存数组模拟数据存储
// ------------------------------------------------------------

// 模拟数据存储
var posts = [
  {
    id: "1",
    title: "GraphQL 入门指南",
    content: "GraphQL 是一种用于 API 的查询语言，它允许客户端精确地指定需要的数据...",
    author: "张三",
    createdAt: "2025-01-15T08:00:00Z"
  },
  {
    id: "2",
    title: "REST vs GraphQL",
    content: "在构建现代 API 时，REST 和 GraphQL 是两种最流行的选择...",
    author: "李四",
    createdAt: "2025-02-20T10:30:00Z"
  },
  {
    id: "3",
    title: "GraphQL 最佳实践",
    content: "在生产环境中使用 GraphQL 时，有一些最佳实践值得遵循...",
    author: "张三",
    createdAt: "2025-03-10T14:00:00Z"
  }
];

var comments = [
  {
    id: "1",
    postId: "1",
    content: "这篇文章写得很清楚，感谢分享！",
    author: "王五",
    createdAt: "2025-01-16T09:00:00Z"
  },
  {
    id: "2",
    postId: "1",
    content: "希望能有更多关于 GraphQL 的深入教程",
    author: "赵六",
    createdAt: "2025-01-17T11:00:00Z"
  },
  {
    id: "3",
    postId: "2",
    content: "对比分析得很到位",
    author: "王五",
    createdAt: "2025-02-21T08:00:00Z"
  }
];

var nextId = 3;

// 辅助函数：格式化输出
function printResult(label, data) {
  console.log("\\n--- " + label + " ---");
  console.log(JSON.stringify(data, null, 2));
}

// Resolver 定义
var resolvers = {
  Query: {
    // 获取所有文章（附带评论）
    posts: function () {
      return posts.map(function (post) {
        var postComments = comments.filter(function (c) {
          return c.postId === post.id;
        });
        var result = {};
        var keys = Object.keys(post);
        for (var i = 0; i < keys.length; i++) {
          result[keys[i]] = post[keys[i]];
        }
        result.comments = postComments;
        return result;
      });
    },
    // 获取单篇文章
    post: function (_, args) {
      var post = posts.find(function (p) {
        return p.id === args.id;
      });
      if (!post) return null;
      var postComments = comments.filter(function (c) {
        return c.postId === post.id;
      });
      var result = {};
      var keys = Object.keys(post);
      for (var i = 0; i < keys.length; i++) {
        result[keys[i]] = post[keys[i]];
      }
      result.comments = postComments;
      return result;
    }
  },
  Mutation: {
    // 创建文章
    createPost: function (_, args) {
      var input = args.input;
      // 输入验证
      if (input.title.length < 3) {
        throw new Error("标题至少需要 3 个字符");
      }
      if (input.content.length < 10) {
        throw new Error("内容至少需要 10 个字符");
      }
      nextId++;
      var newPost = {
        id: String(nextId),
        title: input.title,
        content: input.content,
        author: input.author,
        createdAt: new Date().toISOString(),
        comments: []
      };
      posts.push(newPost);
      return newPost;
    },
    // 更新文章（部分更新）
    updatePost: function (_, args) {
      var index = posts.findIndex(function (p) {
        return p.id === args.id;
      });
      if (index === -1) {
        throw new Error("文章不存在，ID: " + args.id);
      }
      var input = args.input;
      if (input.title !== undefined) {
        posts[index].title = input.title;
      }
      if (input.content !== undefined) {
        posts[index].content = input.content;
      }
      var result = {};
      var keys = Object.keys(posts[index]);
      for (var i = 0; i < keys.length; i++) {
        result[keys[i]] = posts[index][keys[i]];
      }
      var postComments = comments.filter(function (c) {
        return c.postId === posts[index].id;
      });
      result.comments = postComments;
      return result;
    },
    // 删除文章（级联删除评论）
    deletePost: function (_, args) {
      var index = posts.findIndex(function (p) {
        return p.id === args.id;
      });
      if (index === -1) return false;
      posts.splice(index, 1);
      // 级联删除关联评论
      comments = comments.filter(function (c) {
        return c.postId !== args.id;
      });
      return true;
    },
    // 创建评论
    createComment: function (_, args) {
      var input = args.input;
      // 验证文章是否存在
      var postExists = posts.some(function (p) {
        return p.id === input.postId;
      });
      if (!postExists) {
        throw new Error("目标文章不存在，ID: " + input.postId);
      }
      if (input.content.length < 1) {
        throw new Error("评论内容不能为空");
      }
      nextId++;
      var newComment = {
        id: String(nextId),
        postId: input.postId,
        content: input.content,
        author: input.author,
        createdAt: new Date().toISOString()
      };
      comments.push(newComment);
      return newComment;
    },
    // 删除评论
    deleteComment: function (_, args) {
      var index = comments.findIndex(function (c) {
        return c.id === args.id;
      });
      if (index === -1) return false;
      comments.splice(index, 1);
      return true;
    }
  }
};

// ============================================================
// 模拟 GraphQL 执行引擎
// 演示执行查询和变更操作
// ============================================================

// 查询所有文章
printResult("查询所有文章", resolvers.Query.posts());

// 查询单篇文章
printResult("查询 ID 为 1 的文章", resolvers.Query.post(null, { id: "1" }));

// 查询不存在的文章
printResult("查询不存在的文章", resolvers.Query.post(null, { id: "999" }));

// 创建新文章
var newPost = resolvers.Mutation.createPost(null, {
  input: {
    title: "GraphQL 与 TypeScript 集成",
    content: "TypeScript 的类型系统与 GraphQL 的 Schema 天然契合，两者结合可以带来极佳的开发体验...",
    author: "张三"
  }
});
printResult("创建新文章", newPost);

// 更新文章
var updatedPost = resolvers.Mutation.updatePost(null, {
  id: "1",
  input: { title: "GraphQL 入门指南（2025 修订版）" }
});
printResult("更新文章标题", updatedPost);

// 创建评论
var newComment = resolvers.Mutation.createComment(null, {
  input: {
    postId: "1",
    content: "修订后的内容更加丰富了！",
    author: "李四"
  }
});
printResult("创建评论", newComment);

// 查看更新后的文章列表
printResult("更新后的文章列表（共 " + posts.length + " 篇）", resolvers.Query.posts());

// 删除评论
var deleteResult = resolvers.Mutation.deleteComment(null, { id: "1" });
printResult("删除评论结果", deleteResult);

// 删除文章
var deletePostResult = resolvers.Mutation.deletePost(null, { id: "2" });
printResult("删除文章结果", deletePostResult);

// 最终数据状态
printResult("最终文章列表（共 " + posts.length + " 篇）", posts);
printResult("最终评论列表（共 " + comments.length + " 条）", comments);

# === Query ===
# ------------------------------------------------------------
# 客户端 GraphQL 查询示例
# 展示前端如何使用这些查询和变更
# ------------------------------------------------------------

# 查询所有文章及其评论
query GetAllPosts {
  posts {
    id
    title
    author
    createdAt
    comments {
      id
      author
      content
    }
  }
}

# 查询单篇文章详情
query GetPost($id: ID!) {
  post(id: $id) {
    title
    content
    author
    createdAt
    comments {
      author
      content
      createdAt
    }
  }
}

# 创建新文章
mutation CreateNewPost {
  createPost(input: {
    title: "GraphQL 与 TypeScript 集成",
    content: "详细介绍 GraphQL 和 TypeScript 的集成方案...",
    author: "张三"
  }) {
    id
    title
    createdAt
  }
}

# 更新文章
mutation UpdatePostTitle {
  updatePost(id: "1", input: {
    title: "GraphQL 入门指南（修订版）"
  }) {
    id
    title
    content
  }
}

# 删除文章
mutation RemovePost {
  deletePost(id: "2")
}

# 创建评论
mutation AddComment {
  createComment(input: {
    postId: "1",
    content: "很有价值的教程！",
    author: "李四"
  }) {
    id
    content
    createdAt
  }
}

# 删除评论
mutation RemoveComment {
  deleteComment(id: "1")
}
`
  },

  // =========================================================
  // 第二章：认证与授权
  // =========================================================
  {
    id: "gql-auth",
    title: "认证与授权",
    icon: "🔐",
    group: "实战",
    content: `## 认证与授权

认证（Authentication）和授权（Authorization）是任何生产级 API 的核心组成部分。在 GraphQL 中，由于所有请求都通过单一端点，认证与授权的实现方式与 REST 有所不同，但核心概念是一致的。

### 认证 vs 授权

在深入具体实现之前，先明确这两个概念的区别：

- **认证（Authentication）**：验证"你是谁"。通过用户名/密码、Token、OAuth 等方式确认用户身份。
- **授权（Authorization）**：确认"你能做什么"。在认证通过后，检查用户是否有权限执行特定操作。

用一句话概括：**认证是门禁系统，授权是房间钥匙**。你先通过门禁（认证），然后根据你的角色拿到对应的钥匙（授权）。

### GraphQL 中的认证流程

GraphQL 的认证通常通过 HTTP 请求头传递 Token 来实现。整个流程如下：

\`\`\`
1. 客户端发送登录请求（用户名 + 密码）
2. 服务端验证凭据，生成 Token
3. 服务端返回 Token 给客户端
4. 客户端在后续请求的 Authorization 头中携带 Token
5. 服务端解析 Token，将用户信息注入 Context
6. Resolver 从 Context 中获取用户信息，执行权限检查
\`\`\`

### JWT Token 简介

JWT（JSON Web Token）是目前最流行的 Token 格式。它由三部分组成：

\`\`\`
Header.Payload.Signature
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxIn0.abc123...
\`\`\`

- **Header**：包含签名算法（如 HS256）
- **Payload**：包含用户信息（如 userId、role）
- **Signature**：对前两部分的签名，防止篡改

在教程中，我们使用简单的 Base64 编码来模拟 JWT（生产环境请使用 \`jsonwebtoken\` 库）。

### Context 传递用户信息

Context 是 GraphQL 执行过程中的共享对象，每个 Resolver 都可以访问它。这是传递认证信息的最佳方式。

在服务端，从 HTTP 请求中解析 Token 并注入 Context：

\`\`\`javascript
const context = ({ req }) => {
  // 从 Authorization 头获取 Token
  const token = req.headers.authorization || '';
  // 解析 Token 获取用户信息
  const user = token ? parseToken(token) : null;
  return { user };
};
\`\`\`

在 Resolver 中访问用户信息：

\`\`\`javascript
const resolvers = {
  Query: {
    me: (parent, args, context) => {
      // context.user 包含当前登录用户的信息
      if (!context.user) {
        throw new Error('请先登录');
      }
      return context.user;
    }
  }
};
\`\`\`

### 认证中间件模式

在 GraphQL 中实现认证的常见模式是创建一个"认证中间件"——一个高阶函数，包装需要认证的 Resolver。

\`\`\`javascript
// 认证包装器
function requireAuth(resolver) {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new Error('未认证：请先登录');
    }
    return resolver(parent, args, context, info);
  };
}

// 使用认证包装器
const resolvers = {
  Query: {
    me: requireAuth((parent, args, context) => {
      return context.user;
    })
  }
};
\`\`\`

这种模式的好处是：
- 代码复用：认证逻辑集中在一处
- 声明式：哪个 Resolver 需要认证一目了然
- 可组合：可以叠加多个包装器（认证 + 角色检查）

### 角色与权限模型

在博客系统中，我们需要区分不同角色的用户。常见的角色模型包括：

\`\`\`
admin  — 管理员：可以管理所有文章和评论
editor — 编辑：可以管理所有文章，但不能删除
user   — 普通用户：只能管理自己的文章和评论
\`\`\`

角色检查可以通过类似认证包装器的方式实现：

\`\`\`javascript
function requireRole(role) {
  return (resolver) => {
    return (parent, args, context, info) => {
      if (!context.user) {
        throw new Error('未认证');
      }
      if (context.user.role !== role && context.user.role !== 'admin') {
        throw new Error('权限不足：需要 ' + role + ' 角色');
      }
      return resolver(parent, args, context, info);
    };
  };
}
\`\`\`

### 字段级权限控制

GraphQL 的一个独特优势是可以实现**字段级别的权限控制**。不同的用户角色可以看到同一类型的不同字段。

\`\`\`javascript
const resolvers = {
  User: {
    email: (parent, args, context) => {
      // 只有管理员和用户本人可以看到邮箱
      if (context.user.role === 'admin' || context.user.id === parent.id) {
        return parent.email;
      }
      return null; // 其他用户看到 null
    },
    phoneNumber: (parent, args, context) => {
      // 只有管理员可以看到手机号
      if (context.user.role !== 'admin') {
        return null;
      }
      return parent.phoneNumber;
    }
  }
};
\`\`\`

这种设计非常灵活——同一个 User 类型，不同角色看到的字段不同，而不需要创建多个不同的类型或端点。

### 认证错误消息安全

在返回错误消息时，有一个重要的安全原则：**不要向未认证用户泄露系统内部信息**。

\`\`\`javascript
// 不好的做法：泄露了资源是否存在
if (!post) {
  throw new Error('文章不存在');  // 攻击者可以探测资源 ID
}

// 好的做法：只在认证通过后返回具体信息
if (!context.user) {
  throw new Error('请先登录');
}
if (!post) {
  throw new Error('资源未找到');  // 统一错误消息
}
\`\`\`

同样，对于"用户不存在"和"密码错误"，应该返回统一的消息：

\`\`\`javascript
// 不好的做法
if (!user) throw new Error('用户不存在');
if (password !== user.password) throw new Error('密码错误');

// 好的做法
if (!user || password !== user.password) {
  throw new Error('用户名或密码错误');  // 不区分具体原因
}
\`\`\`

### 登录 Mutation 实现

登录 Mutation 是认证流程的入口，它验证用户凭据并返回 Token。

\`\`\`graphql
type Mutation {
  login(username: String!, password: String!): LoginResult!
  register(username: String!, password: String!, email: String!): RegisterResult!
}

type LoginResult {
  token: String!
  user: User!
}

type RegisterResult {
  success: Boolean!
  message: String!
}
\`\`\`

登录 Resolver 的关键步骤：
1. 验证输入参数
2. 查找用户
3. 验证密码（生产环境使用 bcrypt 等哈希比较）
4. 生成 Token
5. 返回 Token 和用户信息

### 注册 Mutation 实现

注册 Mutation 需要额外的验证逻辑：

\`\`\`javascript
register: (_, { username, password, email }) => {
  // 检查用户名是否已存在
  if (users.find(u => u.username === username)) {
    throw new Error('用户名已被占用');
  }
  // 验证密码强度
  if (password.length < 6) {
    throw new Error('密码至少需要 6 个字符');
  }
  // 创建用户
  const newUser = {
    id: String(++userIdCounter),
    username,
    password, // 生产环境需哈希处理
    email,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  return { success: true, message: '注册成功' };
}
\`\`\`

### Mutation 级别认证

不同的 Mutation 操作需要不同的权限级别：

\`\`\`
操作              需要的权限
createPost        认证用户
updatePost        文章作者或管理员
deletePost        文章作者或管理员
createComment     认证用户
deleteComment     评论作者或管理员
\`\`\`

在 Resolver 中实现权限检查：

\`\`\`javascript
updatePost: (_, { id, input }, context) => {
  // 第一步：认证检查
  if (!context.user) {
    throw new Error('请先登录');
  }

  const post = posts.find(p => p.id === id);
  if (!post) {
    throw new Error('文章不存在');
  }

  // 第二步：授权检查
  if (context.user.role !== 'admin' && post.author !== context.user.username) {
    throw new Error('权限不足：只能编辑自己的文章');
  }

  // 第三步：执行业务逻辑
  Object.assign(post, input);
  return post;
}
\`\`\`

### 资源所有权验证

在博客系统中，资源所有权是一个核心概念。每个用户只能修改和删除自己创建的资源，管理员则拥有全部权限。

实现资源所有权检查的通用模式：

\`\`\`javascript
function checkOwnership(resource, context) {
  if (!context.user) {
    throw new Error('请先登录');
  }
  // 管理员可以管理所有资源
  if (context.user.role === 'admin') return true;
  // 检查资源所有者
  if (resource.author !== context.user.username) {
    throw new Error('权限不足：这不是你的资源');
  }
  return true;
}
\`\`\`

### 完整的认证流程图

\`\`\`
客户端                          服务端
  |                              |
  |--- POST /graphql ----------->|
  |   mutation { login(...) }    |
  |                              |--- 验证用户名密码
  |                              |--- 生成 Token
  |<-- { token: "xxx..." } -----|
  |                              |
  |--- POST /graphql ----------->|
  |   Authorization: Bearer xxx  |
  |   query { me { name } }      |
  |                              |--- 解析 Token
  |                              |--- 注入 Context
  |                              |--- 执行 Resolver
  |<-- { data: { me: ... } } ---|
  |                              |
\`\`\`

### 安全最佳实践

1. **Token 安全**：Token 应设置合理的过期时间（如 24 小时），使用 HTTPS 传输
2. **密码存储**：永远不要明文存储密码，使用 bcrypt/argon2 等哈希算法
3. **输入验证**：对所有用户输入进行验证和清理
4. **错误信息**：不要泄露系统内部信息，返回通用错误消息
5. **速率限制**：对登录接口实施速率限制，防止暴力破解
6. **Token 刷新**：实现 Refresh Token 机制，避免频繁重新登录
7. **HTTPS 强制**：生产环境必须使用 HTTPS，防止 Token 被中间人截获
8. **最小权限原则**：用户只获得完成其任务所需的最小权限

### 高级认证模式

#### 双 Token 模式（Access Token + Refresh Token）

在生产环境中，建议使用双 Token 模式：

- **Access Token**：短期有效（15-30 分钟），用于日常 API 调用
- **Refresh Token**：长期有效（7-30 天），用于获取新的 Access Token

\`\`\`javascript
// 登录时返回两个 Token
{
  "accessToken": "eyJhbG...（15 分钟有效）",
  "refreshToken": "eyJhbG...（7 天有效）"
}

// Access Token 过期后，使用 Refresh Token 刷新
mutation {
  refreshToken(token: "eyJhbG...") {
    accessToken
    expiresIn
  }
}
\`\`\`

这种模式的好处是：
- Access Token 泄露后影响范围有限（很快过期）
- 不需要频繁让用户重新登录
- Refresh Token 可以随时撤销

#### OAuth 2.0 集成

对于需要第三方登录的场景（如 GitHub、Google 登录），GraphQL 可以很好地与 OAuth 2.0 集成：

\`\`\`graphql
type Mutation {
  oauthLogin(provider: String!, code: String!): LoginResult!
}
\`\`\`

OAuth 流程：
1. 前端引导用户跳转到第三方授权页面
2. 用户授权后，第三方回调返回授权码
3. 前端将授权码发送给 GraphQL 的 oauthLogin Mutation
4. 后端用授权码换取 Access Token，获取用户信息
5. 后端创建或查找用户，返回自己的 JWT Token

#### API Key 认证

对于服务间调用（Server-to-Server），可以使用 API Key 认证：

\`\`\`javascript
// 在 Context 中检查 API Key
const context = ({ req }) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    const service = validateApiKey(apiKey);
    return { service }; // 服务身份
  }
  // 否则尝试用户 Token 认证
  const token = req.headers.authorization;
  return { user: token ? parseToken(token) : null };
};
\`\`\`

### 权限模型进阶

#### 基于资源的权限（RBAC → ABAC）

除了简单的角色检查，更复杂的系统需要**基于属性的访问控制（ABAC）**：

\`\`\`javascript
function canEditPost(user, post) {
  // 管理员可以编辑任何文章
  if (user.role === 'admin') return true;
  // 文章作者可以编辑自己的文章
  if (post.authorId === user.id) return true;
  // 编辑可以编辑同部门的文章
  if (user.role === 'editor' && user.department === post.department) return true;
  return false;
}
\`\`\`

#### 权限指令（GraphQL Directives）

一些 GraphQL 框架支持通过自定义指令实现声明式权限控制：

\`\`\`graphql
type Query {
  publicPosts: [Post!]!           # 公开访问
  myPosts: [Post!]! @auth         # 需要认证
  allUsers: [User!]! @auth(requires: ADMIN)  # 需要管理员权限
}

type Mutation {
  createPost(input: PostInput!): Post! @auth
  deletePost(id: ID!): Boolean! @auth(requires: [ADMIN, EDITOR])
}
\`\`\`

指令让权限规则更加清晰，直接在 Schema 中就能看到哪些操作需要什么权限。

#### 权限缓存

权限检查可能涉及数据库查询（如查询用户角色、资源所有权）。为了性能，可以缓存权限检查结果：

\`\`\`javascript
const permissionCache = new Map();

function checkPermission(userId, action, resourceId) {
  const key = userId + ':' + action + ':' + resourceId;
  // 检查缓存
  if (permissionCache.has(key)) {
    return permissionCache.get(key);
  }
  // 执行权限检查
  const result = performPermissionCheck(userId, action, resourceId);
  // 缓存结果（5 分钟过期）
  permissionCache.set(key, result);
  setTimeout(() => permissionCache.delete(key), 5 * 60 * 1000);
  return result;
}
\`\`\`

### 多租户认证

在 SaaS 应用中，需要支持多租户（Multi-Tenancy）。每个租户的用户数据隔离：

\`\`\`javascript
const context = ({ req }) => {
  const token = parseToken(req.headers.authorization);
  const tenantId = req.headers['x-tenant-id'];
  return {
    user: token,
    tenantId: tenantId
  };
};

// 在 Resolver 中根据租户过滤数据
const resolvers = {
  Query: {
    posts: (_, args, context) => {
      // 每个租户只看到自己的数据
      return db.posts.find({ tenantId: context.tenantId });
    }
  }
};
\`\`\`

### 本章小结

本章介绍了 GraphQL 中认证与授权的完整实现方案：

- 认证（Authentication）和授权（Authorization）的区别
- 基于 Token 的认证流程和 Context 传递机制
- 认证中间件模式，实现可复用的权限检查
- 角色与权限模型（admin/editor/user）
- 字段级别的权限控制
- 安全的错误消息处理
- 登录和注册 Mutation 的实现
- 资源所有权验证
- 双 Token 模式（Access Token + Refresh Token）
- OAuth 2.0 第三方登录集成
- API Key 服务间认证
- 基于属性的访问控制（ABAC）
- GraphQL 权限指令（Directives）
- 权限缓存优化
- 多租户认证架构

### 认证与授权常见面试题

了解了上面的内容，你应该能回答以下常见面试题：

**Q1: GraphQL 中如何实现认证？**
A: 通过 HTTP 请求头（通常是 Authorization 头）传递 Token，在 Context 中解析用户信息，Resolver 通过 Context 获取当前用户。

**Q2: 认证和授权有什么区别？**
A: 认证是验证"你是谁"（登录），授权是确认"你能做什么"（权限检查）。认证是前提，授权是后续。

**Q3: 如何防止未认证用户访问受保护的查询？**
A: 使用认证中间件模式，创建 requireAuth 包装器，在 Resolver 执行前检查 context.user。

**Q4: 字段级权限控制如何实现？**
A: 在类型级别的 Resolver 中，根据 context.user 的角色和身份决定返回什么数据。不同角色看到同一类型的不同字段。

**Q5: 为什么登录错误信息不应该区分"用户不存在"和"密码错误"？**
A: 出于安全考虑，区分这两种情况会帮助攻击者探测哪些用户名是有效的。统一返回"用户名或密码错误"可以防止用户名枚举攻击。

**Q6: JWT Token 的三部分分别是什么？**
A: Header（算法信息）、Payload（用户数据）、Signature（签名，防止篡改）。格式为 Header.Payload.Signature，使用 Base64 编码。

**Q7: 如何处理 Token 过期？**
A: 使用双 Token 模式——短期的 Access Token 用于日常请求，长期的 Refresh Token 用于获取新的 Access Token。当 Access Token 过期时，客户端使用 Refresh Token 静默刷新。

**Q8: 多租户系统中如何隔离数据？**
A: 在 Context 中传递 tenantId，在 Resolver 中根据 tenantId 过滤数据。确保每个租户只能访问自己的数据。

### 认证开发中的常见错误与排查

#### 错误一：Token 在 Context 中为 null

**现象**：所有需要认证的查询都返回"未认证"错误。

**排查步骤**：
1. 检查 HTTP 请求头是否包含 Authorization 字段
2. 检查 Token 格式是否为 "Bearer <token>"
3. 检查 Token 解析逻辑是否正确（Base64 解码、JSON 解析）
4. 检查 Token 是否已过期（exp 字段）
5. 检查 Context 创建函数是否正确调用了 parseToken

#### 错误二：权限检查过于严格

**现象**：即使是管理员也无法执行某些操作。

**排查步骤**：
1. 检查 role 字符串是否与预期一致（注意大小写）
2. 检查 requireRole 函数中 allowedRoles 数组是否包含正确的角色
3. 检查 checkOwnership 是否在管理员角色时正确短路返回 true
4. 添加日志输出 context.user 的实际内容

#### 错误三：密码明文泄露

**现象**：查询用户信息时密码字段意外暴露。

**解决方案**：
\`\`\`javascript
// 在返回用户对象时，始终排除密码字段
const resolvers = {
  Query: {
    users: () => {
      return users.map(({ password, ...user }) => user);
    }
  }
};
\`\`\`

#### 错误四：跨域请求中 Token 丢失

**现象**：前端请求 GraphQL 端点时 Token 没有被发送。

**解决方案**：
1. 确保 CORS 配置正确，允许 Authorization 头
2. 在前端 fetch 请求中明确设置 credentials: 'include'
3. 检查是否使用了正确的 CORS 中间件配置

#### 错误五：Token 刷新陷入死循环

**现象**：当 Access Token 过期后，客户端不断尝试刷新，但刷新也失败。

**解决方案**：
1. 设置最大重试次数（如 3 次）
2. 刷新失败后清除本地 Token，引导用户重新登录
3. 在 Apollo Client 的 Error Link 中区分 Token 过期错误和其他错误

> **安全提示**：在生产环境中，永远不要将 Token 存储在 localStorage 中（容易受到 XSS 攻击）。推荐使用 httpOnly 的 Cookie 存储 Token，或者使用 BFF（Backend For Frontend）模式在服务端管理 Token。

> **开发建议**：建议使用 Postman 或 Insomnia 等 API 工具来测试 GraphQL 的认证流程。设置好 Authorization 头后，可以方便地测试不同角色的查询权限。

> **Token 存储安全**：前端存储 Token 有三种常见方式：
> 1. **localStorage**：方便但易受 XSS 攻击
> 2. **sessionStorage**：页面关闭后自动清除，适合敏感操作
> 3. **httpOnly Cookie**：最安全，JavaScript 无法访问，但需要服务端配合
> 推荐使用 httpOnly Cookie + CSRF Token 的组合方案，兼顾安全性和易用性。

有了认证与授权的基础，下一章我们将学习如何在前端集成 GraphQL，构建完整的客户端应用。`,

    code: `# === Schema ===
# ------------------------------------------------------------
# 认证与授权系统 Schema
# 包含用户管理、登录注册和权限控制
# ------------------------------------------------------------

type User {
  id: ID!
  username: String!
  email: String!
  role: String!
  createdAt: String!
}

type LoginResult {
  token: String!
  user: User!
}

type RegisterResult {
  success: Boolean!
  message: String!
}

type Query {
  me: User
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  login(username: String!, password: String!): LoginResult!
  register(username: String!, password: String!, email: String!): RegisterResult!
  createPost(input: PostInput!): Post!
  updatePost(id: ID!, input: PostUpdateInput!): Post!
  deletePost(id: ID!): Boolean!
}

# === Resolvers ===
// ------------------------------------------------------------
// 认证与授权 Resolver 实现
// 包含 Token 生成、权限检查、角色管理
// ------------------------------------------------------------

// 模拟用户数据存储
var users = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    email: "admin@blog.com",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z"
  },
  {
    id: "2",
    username: "editor",
    password: "editor123",
    email: "editor@blog.com",
    role: "editor",
    createdAt: "2025-01-02T00:00:00Z"
  },
  {
    id: "3",
    username: "zhangsan",
    password: "pass123",
    email: "zhangsan@blog.com",
    role: "user",
    createdAt: "2025-01-03T00:00:00Z"
  }
];

var userIdCounter = 3;

// 模拟文章数据
var posts = [
  {
    id: "1",
    title: "GraphQL 入门",
    content: "GraphQL 基础知识...",
    author: "zhangsan",
    createdAt: "2025-01-15T08:00:00Z"
  },
  {
    id: "2",
    title: "REST vs GraphQL",
    content: "对比分析...",
    author: "editor",
    createdAt: "2025-02-20T10:30:00Z"
  }
];

var nextPostId = 2;

// 辅助函数：打印结果
function printResult(label, data) {
  console.log("\\n--- " + label + " ---");
  console.log(JSON.stringify(data, null, 2));
}

// 简单的 Token 生成（模拟 JWT）
// 生产环境请使用 jsonwebtoken 库
function generateToken(user) {
  var header = { alg: "HS256", typ: "JWT" };
  var payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  };
  var headerStr = Buffer.from(JSON.stringify(header)).toString("base64");
  var payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  var signature = "mock_signature_" + user.id;
  return headerStr + "." + payloadStr + "." + signature;
}

// 解析 Token
function parseToken(token) {
  try {
    if (!token) return null;
    // 去掉 "Bearer " 前缀
    var tokenStr = token.replace("Bearer ", "");
    var parts = tokenStr.split(".");
    if (parts.length !== 3) return null;
    var payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    // 检查是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      id: payload.userId,
      username: payload.username,
      role: payload.role
    };
  } catch (e) {
    return null;
  }
}

// 认证包装器：要求用户已登录
function requireAuth(resolver) {
  return function (parent, args, context) {
    if (!context.user) {
      throw new Error("未认证：请先登录后再操作");
    }
    return resolver(parent, args, context);
  };
}

// 角色检查包装器：要求特定角色
function requireRole(allowedRoles) {
  return function (resolver) {
    return function (parent, args, context) {
      if (!context.user) {
        throw new Error("未认证：请先登录");
      }
      if (allowedRoles.indexOf(context.user.role) === -1) {
        throw new Error("权限不足：需要以下角色之一 " + allowedRoles.join(", "));
      }
      return resolver(parent, args, context);
    };
  };
}

// 资源所有权检查
function checkOwnership(resource, context) {
  if (!context.user) {
    throw new Error("请先登录");
  }
  if (context.user.role === "admin") return true;
  if (resource.author !== context.user.username) {
    throw new Error("权限不足：只能操作自己的资源");
  }
  return true;
}

// Resolver 定义
var resolvers = {
  Query: {
    // 获取当前用户信息（需要认证）
    me: requireAuth(function (parent, args, context) {
      return context.user;
    }),
    // 获取所有用户（仅管理员）
    users: requireRole(["admin"])(function (parent, args, context) {
      return users.map(function (u) {
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt
        };
      });
    }),
    // 获取单个用户（仅管理员）
    user: requireRole(["admin"])(function (parent, args, context) {
      var user = users.find(function (u) { return u.id === args.id; });
      if (!user) return null;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
    })
  },
  Mutation: {
    // 登录
    login: function (parent, args) {
      var user = users.find(function (u) {
        return u.username === args.username;
      });
      // 统一错误消息，不区分"用户不存在"和"密码错误"
      if (!user || user.password !== args.password) {
        throw new Error("用户名或密码错误");
      }
      var token = generateToken(user);
      return {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      };
    },
    // 注册
    register: function (parent, args) {
      // 检查用户名是否已存在
      var exists = users.some(function (u) {
        return u.username === args.username;
      });
      if (exists) {
        throw new Error("用户名已被占用，请换一个");
      }
      // 验证密码长度
      if (args.password.length < 6) {
        throw new Error("密码至少需要 6 个字符");
      }
      // 验证邮箱格式
      if (args.email.indexOf("@") === -1) {
        throw new Error("请输入有效的邮箱地址");
      }
      userIdCounter++;
      var newUser = {
        id: String(userIdCounter),
        username: args.username,
        password: args.password,
        email: args.email,
        role: "user",
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      return { success: true, message: "注册成功！欢迎 " + args.username };
    },
    // 创建文章（需要认证）
    createPost: requireAuth(function (parent, args, context) {
      var input = args.input;
      nextPostId++;
      var newPost = {
        id: String(nextPostId),
        title: input.title,
        content: input.content,
        author: context.user.username,
        createdAt: new Date().toISOString()
      };
      posts.push(newPost);
      return newPost;
    }),
    // 更新文章（需要认证 + 所有权检查）
    updatePost: requireAuth(function (parent, args, context) {
      var post = posts.find(function (p) { return p.id === args.id; });
      if (!post) {
        throw new Error("文章不存在");
      }
      checkOwnership(post, context);
      var input = args.input;
      if (input.title !== undefined) post.title = input.title;
      if (input.content !== undefined) post.content = input.content;
      return post;
    }),
    // 删除文章（需要认证 + 所有权检查）
    deletePost: requireAuth(function (parent, args, context) {
      var index = posts.findIndex(function (p) { return p.id === args.id; });
      if (index === -1) return false;
      var post = posts[index];
      checkOwnership(post, context);
      posts.splice(index, 1);
      return true;
    })
  }
};

// ============================================================
// 演示：认证流程
// ============================================================

// 模拟未认证 Context
var anonymousContext = { user: null };

// 1. 测试登录
printResult("管理员登录", resolvers.Mutation.login(null, {
  username: "admin",
  password: "admin123"
}));

// 2. 测试错误密码
try {
  resolvers.Mutation.login(null, {
    username: "admin",
    password: "wrongpassword"
  });
} catch (e) {
  console.log("\\n--- 登录失败（错误密码） ---");
  console.log("错误: " + e.message);
}

// 3. 测试注册
printResult("注册新用户", resolvers.Mutation.register(null, {
  username: "newuser",
  password: "secure123",
  email: "newuser@blog.com"
}));

// 4. 模拟认证 Context
var loginResult = resolvers.Mutation.login(null, {
  username: "zhangsan",
  password: "pass123"
});
var user = parseToken("Bearer " + loginResult.token);
var authContext = { user: user };

printResult("当前登录用户", user);

// 5. 测试需要认证的操作
printResult("获取当前用户 (me)", resolvers.Query.me(null, null, authContext));

// 6. 测试未认证访问
try {
  resolvers.Query.me(null, null, anonymousContext);
} catch (e) {
  console.log("\\n--- 未认证访问 me ---");
  console.log("错误: " + e.message);
}

// 7. 测试创建文章（认证用户）
printResult("创建文章（认证用户）", resolvers.Mutation.createPost(null, {
  input: { title: "我的文章", content: "这是认证用户创建的文章内容...", author: "ignored" }
}, authContext));

// 8. 测试权限检查
try {
  resolvers.Query.users(null, null, authContext);
} catch (e) {
  console.log("\\n--- 普通用户尝试查看所有用户 ---");
  console.log("错误: " + e.message);
}

// 9. 管理员可以看到所有用户
var adminLogin = resolvers.Mutation.login(null, {
  username: "admin",
  password: "admin123"
});
var adminUser = parseToken("Bearer " + adminLogin.token);
var adminContext = { user: adminUser };

printResult("管理员查看所有用户", resolvers.Query.users(null, null, adminContext));

// 10. 最终数据状态
console.log("\\n--- 系统状态 ---");
console.log("用户总数: " + users.length);
console.log("文章总数: " + posts.length);

# === Query ===
# ------------------------------------------------------------
# 客户端认证相关查询
# ------------------------------------------------------------

# 登录
mutation Login {
  login(username: "zhangsan", password: "pass123") {
    token
    user {
      id
      username
      email
      role
    }
  }
}

# 注册
mutation Register {
  register(
    username: "newuser"
    password: "secure123"
    email: "newuser@blog.com"
  ) {
    success
    message
  }
}

# 获取当前用户（需要认证 Header）
query GetMe {
  me {
    id
    username
    email
    role
  }
}

# 管理员查看所有用户（需要管理员权限）
query GetAllUsers {
  users {
    id
    username
    email
    role
    createdAt
  }
}

# 创建文章（需要认证，自动使用当前用户作为作者）
mutation CreatePost {
  createPost(input: {
    title: "我的文章"
    content: "文章内容..."
  }) {
    id
    title
    author
    createdAt
  }
}
`
  },

  // =========================================================
  // 第三章：前端集成
  // =========================================================
  {
    id: "gql-client",
    title: "前端集成",
    icon: "🖥️",
    group: "实战",
    content: `## 前端集成

GraphQL 的强大不仅体现在后端，更体现在前端开发体验的巨大提升。本章将详细介绍如何在前端应用中集成 GraphQL，从最基础的 fetch 调用到高级的 Apollo Client 用法。

### 前端集成方案概览

在 JavaScript 前端（React/Vue/Angular 等）中集成 GraphQL 有以下几种方案：

| 方案 | 复杂度 | 功能 | 适用场景 |
|------|--------|------|----------|
| 原生 fetch | 低 | 基础查询 | 简单项目、原型开发 |
| Apollo Client | 中 | 完整功能 | 中大型项目 |
| urql | 中 | 轻量级 | 追求轻量的项目 |
| Relay | 高 | 企业级 | 大型 React 项目 |
| graphql-request | 低 | 轻量请求 | Node.js 脚本、简单前端 |

本章重点介绍两种方案：**原生 fetch**（适合理解原理）和 **Apollo Client**（适合生产项目）。

### 使用原生 fetch 调用 GraphQL

GraphQL 的查询本质上是一个 HTTP POST 请求，请求体包含 \`query\`、\`variables\` 和 \`operationName\` 三个字段。这使得任何能发送 HTTP 请求的工具都能调用 GraphQL API。

#### 基本结构

一个标准的 GraphQL HTTP 请求如下：

\`\`\`javascript
const response = await fetch('https://api.example.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 如有认证需求，添加 Authorization 头
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    query: \`
      query GetPosts {
        posts {
          id
          title
          author
        }
      }
    \`
  })
});

const result = await response.json();
console.log(result.data.posts);
\`\`\`

#### 带变量的查询

使用变量可以让查询更加灵活和可复用：

\`\`\`javascript
const query = \`
  query GetPost($postId: ID!) {
    post(id: $postId) {
      title
      content
      author
    }
  }
\`;

const variables = { postId: '1' };

const response = await fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables })
});
\`\`\`

#### 封装请求函数

为了避免重复代码，可以封装一个通用的 GraphQL 请求函数：

\`\`\`javascript
async function graphqlRequest(query, variables = {}) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

// 使用封装函数
const posts = await graphqlRequest(\`
  query {
    posts { id title author }
  }
\`);
\`\`\`

### Apollo Client 基础

Apollo Client 是 GraphQL 前端生态中最成熟的库。它提供了**声明式数据获取**、**智能缓存**、**状态管理**等能力。

#### 初始化 Apollo Client

\`\`\`javascript
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// 创建 Apollo Client 实例
const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache: new InMemoryCache(),
  // 认证配置
  headers: {
    authorization: 'Bearer ' + localStorage.getItem('token')
  }
});

// 在 React 应用中包裹 ApolloProvider
function App() {
  return (
    <ApolloProvider client={client}>
      <BlogList />
    </ApolloProvider>
  );
}
\`\`\`

#### useQuery Hook

\`useQuery\` 是 Apollo Client 最常用的 Hook，用于执行查询：

\`\`\`javascript
import { useQuery, gql } from '@apollo/client';

const GET_POSTS = gql\`
  query GetPosts {
    posts {
      id
      title
      author
      createdAt
    }
  }
\`;

function BlogList() {
  const { loading, error, data } = useQuery(GET_POSTS);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;

  return (
    <ul>
      {data.posts.map(post => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>作者：{post.author}</p>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

\`useQuery\` 返回的对象包含：
- \`loading\`：布尔值，表示查询是否正在执行
- \`error\`：如果查询出错，包含错误信息
- \`data\`：查询结果，在 loading 完成后可用
- \`refetch\`：重新执行查询的函数
- \`networkStatus\`：网络状态（用于判断是初始加载还是重新获取）

#### useMutation Hook

\`useMutation\` 用于执行变更操作：

\`\`\`javascript
import { useMutation, gql } from '@apollo/client';

const CREATE_POST = gql\`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
      id
      title
      author
    }
  }
\`;

function CreatePostForm() {
  const [createPost, { loading, error }] = useMutation(CREATE_POST);

  const handleSubmit = async (formData) => {
    try {
      const result = await createPost({
        variables: {
          input: {
            title: formData.title,
            content: formData.content,
            author: formData.author
          }
        }
      });
      console.log('创建成功：', result.data.createPost);
    } catch (err) {
      console.error('创建失败：', err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '创建文章'}
      </button>
    </form>
  );
}
\`\`\`

### 缓存管理

Apollo Client 内置了一个强大的规范化缓存（InMemoryCache），它会自动缓存查询结果，避免重复请求。

#### 缓存工作原理

Apollo 的缓存基于以下原则：
1. 每个从服务器返回的对象都按 \`__typename\` 和 \`id\` 进行规范化存储
2. 相同类型的查询会自动使用缓存
3. Mutation 执行后可以自动更新缓存

#### 手动更新缓存

当 Mutation 修改了数据后，需要手动更新缓存以反映最新状态：

\`\`\`javascript
const [createPost] = useMutation(CREATE_POST, {
  update(cache, { data: { createPost } }) {
    // 读取缓存中的 posts 查询
    const existingPosts = cache.readQuery({
      query: GET_POSTS
    });

    // 将新文章添加到缓存中
    cache.writeQuery({
      query: GET_POSTS,
      data: {
        posts: [...existingPosts.posts, createPost]
      }
    });
  }
});
\`\`\`

#### 缓存策略（Fetch Policy）

Apollo 提供了多种缓存策略：

\`\`\`javascript
const { data } = useQuery(GET_POSTS, {
  fetchPolicy: 'cache-first' // 默认：优先使用缓存
});

// 其他策略：
// 'cache-only'         — 只使用缓存，不发送网络请求
// 'network-only'       — 只发送网络请求，不使用缓存
// 'cache-and-network'  — 先返回缓存，同时发送网络请求更新
// 'no-cache'           — 不使用缓存，也不缓存结果
// 'standby'            — 类似于 cache-first，但查询不会随变量变化自动更新
\`\`\`

### 乐观更新（Optimistic Updates）

乐观更新是指在 Mutation 发送到服务器之前，就假设它会成功并立即更新 UI。如果服务器返回错误，再回滚 UI。

\`\`\`javascript
const [deletePost] = useMutation(DELETE_POST, {
  optimisticResponse: {
    deletePost: true  // 假设删除成功
  },
  update(cache, { data }) {
    // 从缓存中移除已删除的文章
    const existingPosts = cache.readQuery({ query: GET_POSTS });
    cache.writeQuery({
      query: GET_POSTS,
      data: {
        posts: existingPosts.posts.filter(p => p.id !== postId)
      }
    });
  }
});
\`\`\`

### 错误处理

GraphQL 的查询可能返回部分数据和部分错误。Apollo Client 提供了多种错误处理机制。

#### 基础错误处理

\`\`\`javascript
const { loading, error, data } = useQuery(GET_POSTS);

if (error) {
  // error.graphQLErrors — GraphQL 层面的错误
  // error.networkError  — 网络层面的错误
  if (error.networkError) {
    return <div>网络错误：请检查连接</div>;
  }
  return <div>查询错误：{error.message}</div>;
}
\`\`\`

#### 全局错误处理（Error Link）

使用 Apollo Link 实现全局错误处理：

\`\`\`javascript
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        '[GraphQL error]: Message: ' + message +
        ', Location: ' + JSON.stringify(locations) +
        ', Path: ' + path
      );
    });
  }
  if (networkError) {
    console.error('[Network error]: ' + networkError);
  }
});
\`\`\`

### 分页查询

GraphQL 中有两种主流的分页方式：**基于偏移量（Offset-based）**和**基于游标（Cursor-based）**。

#### 基于偏移量的分页

\`\`\`graphql
query {
  posts(limit: 10, offset: 0) {
    id
    title
  }
}
\`\`\`

#### 基于游标的分页（推荐）

\`\`\`graphql
query {
  posts(first: 10, after: "cursor123") {
    edges {
      node {
        id
        title
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
\`\`\`

Apollo 提供了 \`fetchMore\` 函数实现分页加载：

\`\`\`javascript
const { data, fetchMore } = useQuery(GET_POSTS, {
  variables: { first: 10 }
});

const loadMore = () => {
  fetchMore({
    variables: {
      after: data.posts.pageInfo.endCursor
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev;
      return {
        posts: {
          ...fetchMoreResult.posts,
          edges: [
            ...prev.posts.edges,
            ...fetchMoreResult.posts.edges
          ]
        }
      };
    }
  });
};
\`\`\`

### Fragment 与组件结合

Fragment 是 GraphQL 中复用字段集合的机制，与 React 组件天然契合。

\`\`\`javascript
// 定义 Fragment
const POST_FIELDS = gql\`
  fragment PostFields on Post {
    id
    title
    author
    createdAt
  }
\`;

// 在查询中使用 Fragment
const GET_POSTS = gql\`
  query GetPosts {
    posts {
      ...PostFields
    }
  }
  \${POST_FIELDS}
\`;

// 在组件中使用 Fragment 数据
function PostCard({ post }) {
  return (
    <div>
      <h3>{post.title}</h3>
      <p>作者：{post.author}</p>
      <p>创建时间：{post.createdAt}</p>
    </div>
  );
}
\`\`\`

### GraphQL Code Generator

GraphQL Code Generator 是一个工具，可以根据 Schema 和查询自动生成 TypeScript 类型定义和 React Hooks。

\`\`\`bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript
\`\`\`

配置完成后，它会根据你的 \`.graphql\` 文件生成类型安全的代码，大幅减少手写类型定义的工作量。

### 前端认证集成

在 Apollo Client 中集成认证，通常通过设置请求中间件（Link）来实现：

\`\`\`javascript
import { setContext } from '@apollo/client/link/context';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? 'Bearer ' + token : ''
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
\`\`\`

### 前端开发最佳实践

1. **查询与组件共置**：将 GraphQL 查询放在使用它的组件文件中
2. **使用 Fragment**：确保每个组件声明它需要的数据
3. **启用缓存**：充分利用 Apollo Client 的缓存能力
4. **乐观更新**：对常见的操作（如点赞、删除）使用乐观更新提升体验
5. **错误边界**：使用 React Error Boundary 捕获 GraphQL 错误
6. **类型安全**：使用 GraphQL Code Generator 生成类型
7. **分页策略**：优先使用基于游标的分页
8. **请求去重**：Apollo Client 会自动去重相同查询的并发请求

### 前端状态管理

#### Apollo Client 作为状态管理器

Apollo Client 不仅可以管理服务端数据，还可以管理本地状态。通过 \`@client\` 指令，可以在同一个查询中混合服务端数据和本地数据：

\`\`\`graphql
query GetPostsWithLocalState {
  posts {
    id
    title
  }
  isDarkMode @client
  selectedPostId @client
}
\`\`\`

通过 \`typePolicies\` 定义本地字段：

\`\`\`javascript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        isDarkMode: {
          read() {
            return localStorage.getItem('darkMode') === 'true';
          }
        }
      }
    }
  }
});
\`\`\`

#### 使用 Reactive Variables

Apollo Client 3 引入了 Reactive Variables，用于管理不来自 GraphQL 的本地状态：

\`\`\`javascript
import { makeVar } from '@apollo/client';

// 创建响应式变量
export const cartItemsVar = makeVar([]);
export const isLoggedInVar = makeVar(false);

// 读取和修改变量
const currentCart = cartItemsVar();  // 读取
cartItemsVar([...currentCart, newItem]);  // 修改

// 在查询中使用
const GET_CART = gql\`
  query GetCart {
    cartItems @client
  }
\`;

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        cartItems: {
          read() {
            return cartItemsVar();
          }
        }
      }
    }
  }
});
\`\`\`

### 订阅（Subscription）前端实现

Apollo Client 支持通过 WebSocket 接收实时数据更新：

\`\`\`javascript
import { WebSocketLink } from '@apollo/client/link/ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

// 创建 WebSocket 连接
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem('token')
    }
  }
});

// 根据操作类型选择 HTTP 或 WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// 在组件中使用订阅
const COMMENTS_SUBSCRIPTION = gql\`
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      content
      author
    }
  }
\`;

function PostDetail({ postId }) {
  const { data, subscribeToMore } = useQuery(GET_POST, {
    variables: { id: postId }
  });

  useEffect(() => {
    subscribeToMore({
      document: COMMENTS_SUBSCRIPTION,
      variables: { postId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          post: {
            ...prev.post,
            comments: [
              ...prev.post.comments,
              subscriptionData.data.commentAdded
            ]
          }
        };
      }
    });
  }, [postId]);
}
\`\`\`

### 与 Vue 和 Angular 集成

GraphQL 不限于 React。以下是其他框架的集成方案：

- **Vue**：使用 \`@vue/apollo-composable\` 或 \`vue-apollo\`，提供 \`useQuery\`、\`useMutation\` 等组合式 API
- **Angular**：使用 \`apollo-angular\`，以 Service 的方式注入 Apollo Client
- **Svelte**：使用 \`@apollo/client\` 配合 Svelte 的 store 机制

### 移动端集成

对于 React Native 和 Flutter 等移动端平台：
- **React Native**：直接使用 Apollo Client，与 React Web 的 API 完全一致
- **Flutter**：使用 \`graphql_flutter\` 包，提供类似 Apollo Client 的功能
- **iOS (Swift)**：使用 \`Apollo iOS\` 客户端
- **Android (Kotlin)**：使用 \`Apollo Kotlin\` 客户端

### 本章小结

本章介绍了前端集成 GraphQL 的完整方案：

- 使用原生 fetch 理解 GraphQL 的 HTTP 请求本质
- Apollo Client 的初始化、useQuery 和 useMutation 的使用
- 缓存管理策略和乐观更新
- 错误处理机制
- 分页查询的两种方式
- Fragment 与组件结合的模式
- 前端认证的集成方式
- 本地状态管理（Reactive Variables）
- 订阅（Subscription）的前端实现
- 跨框架和跨平台的集成方案

掌握了这些知识，你就可以构建一个完整的 GraphQL 前后端应用了。`,

    code: `# === Schema ===
# ------------------------------------------------------------
# 前端集成演示 Schema
# 用于展示前端如何调用 GraphQL API
# ------------------------------------------------------------

type Post {
  id: ID!
  title: String!
  content: String!
  author: String!
  createdAt: String!
}

type Query {
  posts(limit: Int, offset: Int): [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createPost(input: PostInput!): Post!
  deletePost(id: ID!): Boolean!
}

input PostInput {
  title: String!
  content: String!
  author: String!
}

# === Resolvers ===
// ------------------------------------------------------------
// 后端 Resolver 实现（模拟 GraphQL 服务端）
// ------------------------------------------------------------

var posts = [
  {
    id: "1",
    title: "GraphQL 前端集成指南",
    content: "学习如何在前端使用 GraphQL...",
    author: "张三",
    createdAt: "2025-06-01T08:00:00Z"
  },
  {
    id: "2",
    title: "Apollo Client 最佳实践",
    content: "在生产环境中使用 Apollo Client...",
    author: "李四",
    createdAt: "2025-06-05T10:30:00Z"
  },
  {
    id: "3",
    title: "GraphQL 与 React 深度集成",
    content: "将 GraphQL 与 React 组件结合...",
    author: "王五",
    createdAt: "2025-06-10T14:00:00Z"
  }
];

var nextId = 3;

function printResult(label, data) {
  console.log("\\n--- " + label + " ---");
  console.log(JSON.stringify(data, null, 2));
}

// 模拟服务端 Resolver
var resolvers = {
  Query: {
    posts: function (_, args) {
      var limit = args.limit || 10;
      var offset = args.offset || 0;
      return posts.slice(offset, offset + limit);
    },
    post: function (_, args) {
      return posts.find(function (p) { return p.id === args.id; }) || null;
    }
  },
  Mutation: {
    createPost: function (_, args) {
      nextId++;
      var newPost = {
        id: String(nextId),
        title: args.input.title,
        content: args.input.content,
        author: args.input.author,
        createdAt: new Date().toISOString()
      };
      posts.push(newPost);
      return newPost;
    },
    deletePost: function (_, args) {
      var index = posts.findIndex(function (p) { return p.id === args.id; });
      if (index === -1) return false;
      posts.splice(index, 1);
      return true;
    }
  }
};

// ============================================================
// 模拟前端调用 GraphQL API
// 演示使用 fetch 风格调用 GraphQL 端点
// ============================================================

// 模拟 GraphQL 请求函数（前端 fetch 封装）
function graphqlRequest(query, variables) {
  variables = variables || {};
  // 模拟 HTTP 请求处理
  console.log("\\n>>> 发送 GraphQL 请求 <<<");
  console.log("Query: " + query.trim().substring(0, 80) + "...");

  // 模拟认证 Token
  var token = "Bearer eyJhbGciOiJIUzI1NiJ9.mock_token";

  // 解析查询类型
  if (query.indexOf("mutation") !== -1) {
    // 处理 Mutation
    if (query.indexOf("createPost") !== -1) {
      return Promise.resolve({
        data: {
          createPost: resolvers.Mutation.createPost(null, variables)
        }
      });
    }
    if (query.indexOf("deletePost") !== -1) {
      return Promise.resolve({
        data: {
          deletePost: resolvers.Mutation.deletePost(null, variables)
        }
      });
    }
  } else {
    // 处理 Query
    if (query.indexOf("post(") !== -1 && query.indexOf("posts") === -1) {
      return Promise.resolve({
        data: {
          post: resolvers.Query.post(null, variables)
        }
      });
    }
    if (query.indexOf("posts") !== -1) {
      return Promise.resolve({
        data: {
          posts: resolvers.Query.posts(null, variables)
        }
      });
    }
  }
  return Promise.resolve({ data: null, errors: [{ message: "未知查询" }] });
}

// ----------------------------------------------------------
// 演示：前端查询操作
// ----------------------------------------------------------

// 1. 查询所有文章（模拟前端列表页）
graphqlRequest("query { posts { id title author createdAt } }")
  .then(function (result) {
    printResult("前端查询：所有文章", result.data.posts);
  });

// 2. 查询单篇文章（模拟前端详情页）
graphqlRequest("query GetPost($id: ID!) { post(id: $id) { title content author } }", {
  id: "2"
}).then(function (result) {
  printResult("前端查询：文章详情", result.data.post);
});

// 3. 创建文章（模拟前端表单提交）
graphqlRequest(
  "mutation CreatePost($input: PostInput!) { createPost(input: $input) { id title author } }",
  {
    input: {
      title: "前端提交的新文章",
      content: "这是通过前端表单提交的内容...",
      author: "前端用户"
    }
  }
).then(function (result) {
  printResult("前端 Mutation：创建文章", result.data.createPost);
});

// 4. 删除文章
graphqlRequest(
  "mutation DeletePost($id: ID!) { deletePost(id: $id) }",
  { id: "1" }
).then(function (result) {
  printResult("前端 Mutation：删除文章", result.data.deletePost);
});

// 5. 验证最终数据
setTimeout(function () {
  printResult("最终文章列表（前端视角）", resolvers.Query.posts(null, {}));
}, 100);

# === Query ===
# ------------------------------------------------------------
# 前端 GraphQL 查询示例
# 展示各类前端调用场景
# ------------------------------------------------------------

# 查询所有文章（列表页）
query GetPosts {
  posts {
    id
    title
    author
    createdAt
  }
}

# 查询单篇文章（详情页）
query GetPost($id: ID!) {
  post(id: $id) {
    title
    content
    author
    createdAt
  }
}

# 创建文章（表单提交）
mutation CreatePost($input: PostInput!) {
  createPost(input: $input) {
    id
    title
    author
    createdAt
  }
}

# 删除文章
mutation DeletePost($id: ID!) {
  deletePost(id: $id)
}

# 前端 JavaScript fetch 调用代码示例
// 使用 fetch 发送 GraphQL 请求
const query = \`
  query GetPosts {
    posts { id title author }
  }
\`;

const response = await fetch("/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  },
  body: JSON.stringify({ query: query })
});

const result = await response.json();
if (result.errors) {
  console.error("GraphQL 错误:", result.errors);
} else {
  console.log("查询结果:", result.data.posts);
}
`
  },

  // =========================================================
  // 第四章：最佳实践与性能优化
  // =========================================================
  {
    id: "gql-best-practices",
    title: "最佳实践与性能优化",
    icon: "🏆",
    group: "实战",
    content: `## 最佳实践与性能优化

在生产环境中使用 GraphQL 时，Schema 设计、性能优化和安全防护是决定项目成败的关键因素。本章将系统性地介绍 GraphQL 的最佳实践和优化策略，帮助你在生产环境中构建稳定、高效、安全的 GraphQL 服务。

### Schema 设计原则

#### 按需设计，不要过度嵌套

Schema 设计应该反映**客户端的需求**，而不是数据库的结构。一个常见的错误是把数据库的每个表都直接映射为 GraphQL 类型，导致 Schema 过于复杂且不实用。

**好的做法**：从客户端用例出发，设计 Schema。
\`\`\`graphql
# 从 UI 需求出发设计
type BlogSummary {
  id: ID!
  title: String!
  author: String!
  commentCount: Int!
}
\`\`\`

**不好的做法**：直接映射数据库结构。
\`\`\`graphql
# 暴露了不必要的内部字段
type BlogPost {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  status: String!
  version: Int!
  internalNotes: String!
}
\`\`\`

#### 字段命名规范

GraphQL 的命名约定使用 **camelCase**（驼峰命名），这是 JavaScript 和大多数前端框架的默认命名风格。

\`\`\`graphql
# 好的命名
type User {
  firstName: String!
  lastName: String!
  createdAt: String!
  isActive: Boolean!
}

# 不好的命名
type User {
  first_name: String!   # 蛇形命名
  LastName: String!     # 帕斯卡命名
  created_at: String!   # 蛇形命名
  IS_ACTIVE: Boolean!   # 全大写
}
\`\`\`

**命名规范总结**：
- 类型名：PascalCase（如 \`BlogPost\`、\`UserProfile\`）
- 字段名：camelCase（如 \`firstName\`、\`createdAt\`）
- 枚举值：UPPER_SNAKE_CASE（如 \`PUBLISHED\`、\`DRAFT\`）
- 查询名：camelCase，动词开头（如 \`getUser\`、\`searchPosts\`）
- Mutation 名：camelCase，动词开头（如 \`createPost\`、\`deleteComment\`）

#### 避免过度嵌套

GraphQL 允许任意深度的嵌套查询，但这可能导致严重的性能问题。

\`\`\`graphql
# 危险的深层嵌套查询
query {
  posts {
    comments {
      author {
        posts {
          comments {
            author {
              posts {  # 无限循环的开始
                title
              }
            }
          }
        }
      }
    }
  }
}
\`\`\`

这种查询会导致指数级的数据获取和 N+1 问题。需要通过**查询深度限制**来防止。

### 错误处理规范

GraphQL 的错误处理应该遵循以下原则：

#### 使用标准错误格式

\`\`\`json
{
  "errors": [
    {
      "message": "文章不存在",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["post"],
      "extensions": {
        "code": "NOT_FOUND",
        "timestamp": "2025-06-15T10:00:00Z"
      }
    }
  ]
}
\`\`\`

#### 自定义错误码

定义统一的错误码体系，方便客户端处理：

\`\`\`javascript
const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED'
};
\`\`\`

#### 错误处理中间件

创建统一的错误处理函数：

\`\`\`javascript
function formatError(error) {
  // 生产环境不暴露内部错误详情
  if (process.env.NODE_ENV === 'production') {
    return {
      message: '服务器内部错误',
      extensions: { code: 'INTERNAL_ERROR' }
    };
  }
  return error;
}
\`\`\`

### N+1 问题与 DataLoader

N+1 问题是 GraphQL 中最常见的性能陷阱。它发生在查询关联数据时，导致大量的数据库查询。

#### N+1 问题示例

假设查询所有文章及其作者：
\`\`\`graphql
query {
  posts {
    title
    author {
      name
    }
  }
}
\`\`\`

如果列表有 100 篇文章，没有优化的情况下：
1. 一次查询获取所有文章（1 次查询）
2. 每个文章的 author 字段触发一次查询（100 次查询）
3. 总计：101 次查询（N+1 问题）

#### DataLoader 解决方案

DataLoader 是 Facebook 开源的工具，它通过**批量处理**和**缓存**来解决 N+1 问题。

\`\`\`javascript
const DataLoader = require('dataloader');

// 创建 DataLoader 实例
const authorLoader = new DataLoader(async (authorIds) => {
  // 批量查询所有需要的作者
  const authors = await db.authors.find({
    id: { $in: authorIds }
  });
  // 按照输入顺序返回结果
  return authorIds.map(id =>
    authors.find(a => a.id === id)
  );
});

// 在 Resolver 中使用
const resolvers = {
  Post: {
    author: (post) => {
      // DataLoader 会自动批量处理
      return authorLoader.load(post.authorId);
    }
  }
};
\`\`\`

DataLoader 的核心机制：
1. **批量处理**：在一次事件循环 tick 内收集所有 \`load()\` 调用，合并为一次批量查询
2. **缓存**：同一个 key 在单次请求中只查询一次，后续请求直接返回缓存结果
3. **顺序保证**：返回结果的顺序与输入顺序一致

### 查询复杂度限制

恶意的或不当的查询可能导致服务器过载。需要对查询进行复杂度评估和限制。

#### 查询深度限制

限制查询的最大嵌套深度（如 5 层），防止深层嵌套查询。

\`\`\`javascript
function depthLimit(maxDepth) {
  return (validationContext) => ({
    Field(node) {
      const depth = computeDepth(node);
      if (depth > maxDepth) {
        validationContext.reportError(
          new GraphQLError(
            '查询深度超过限制：' + maxDepth,
            [node]
          )
        );
      }
    }
  });
}
\`\`\`

#### 查询复杂度计算

为每个字段定义复杂度权重，计算查询的总复杂度：

\`\`\`javascript
const complexityRule = createComplexityRule({
  maximumComplexity: 1000,
  defaultComplexity: 1,
  variables: {},
  onComplete: (complexity) => {
    console.log('查询复杂度:', complexity);
  }
});
\`\`\`

### 持久化查询（Persisted Queries）

持久化查询允许客户端只发送查询的哈希值，而不是完整的查询字符串。

**优势**：
- 减少网络传输量
- 防止任意查询攻击
- 服务端可以预编译查询，提升性能

\`\`\`javascript
// 客户端发送哈希而非完整查询
POST /graphql
{
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "abc123..."
    }
  }
}
\`\`\`

### 缓存策略

#### HTTP 缓存

GraphQL 使用 POST 请求，传统 HTTP 缓存不直接适用。但可以通过以下方式实现：

\`\`\`javascript
// 使用 GET 请求进行查询（可缓存的查询）
const response = await fetch('/graphql?query=' + encodeURIComponent(query));
\`\`\`

#### 应用层缓存

在 Resolver 层面实现缓存：

\`\`\`javascript
const cache = new Map();

const resolvers = {
  Query: {
    popularPosts: async () => {
      const cacheKey = 'popular_posts';
      // 检查缓存
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      // 缓存未命中，执行查询
      const posts = await db.posts.findPopular();
      // 设置缓存（5 分钟过期）
      cache.set(cacheKey, posts);
      setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
      return posts;
    }
  }
};
\`\`\`

#### CDN 缓存

对于不经常变化的数据（如配置信息、静态内容），可以利用 CDN 加速：

\`\`\`javascript
// 设置响应头，允许 CDN 缓存
res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
\`\`\`

### Batching 批量请求

批量请求允许在一次 HTTP 请求中发送多个 GraphQL 操作。

\`\`\`json
// 批量请求体
[
  { "query": "query { post(id: 1) { title } }" },
  { "query": "query { post(id: 2) { title } }" },
  { "query": "query { post(id: 3) { title } }" }
]

// 批量响应
[
  { "data": { "post": { "title": "第一篇文章" } } },
  { "data": { "post": { "title": "第二篇文章" } } },
  { "data": { "post": { "title": "第三篇文章" } } }
]
\`\`\`

### Schema 拼接与 Federation

#### Schema 拼接（Schema Stitching）

Schema 拼接是将多个 GraphQL Schema 合并为一个统一的 Schema，适用于微服务架构。

\`\`\`javascript
// 拼接两个子服务的 Schema
const gatewaySchema = stitchSchemas({
  subschemas: [
    { schema: userSchema, executor: userExecutor },
    { schema: postSchema, executor: postExecutor },
    { schema: commentSchema, executor: commentExecutor }
  ]
});
\`\`\`

#### Apollo Federation

Apollo Federation 是比 Schema 拼接更高级的微服务 GraphQL 方案，它允许各个服务独立部署并声明自己的类型。

\`\`\`graphql
# 用户服务
extend type Query {
  me: User
}

type User @key(fields: "id") {
  id: ID!
  username: String!
}

# 文章服务
extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post!]!
}

type Post @key(fields: "id") {
  id: ID!
  title: String!
  author: User!
}
\`\`\`

### 监控与日志

#### 关键监控指标

- **请求量**：每秒 GraphQL 请求数
- **响应时间**：P50、P95、P99 延迟
- **错误率**：请求失败率、字段错误率
- **查询复杂度**：平均查询复杂度、最大查询复杂度
- **Resolver 性能**：每个 Resolver 的执行时间
- **缓存命中率**：DataLoader 和查询缓存的命中率

#### 日志记录

\`\`\`javascript
const loggerPlugin = {
  requestDidStart(requestContext) {
    const start = Date.now();
    return {
      willSendResponse(requestContext) {
        const duration = Date.now() - start;
        console.log({
          operation: requestContext.operationName,
          duration: duration,
          errors: requestContext.errors?.length || 0
        });
      }
    };
  }
};
\`\`\`

### 安全防护

#### 查询白名单

只允许预先注册的查询，阻止任意查询执行。

\`\`\`javascript
const persistedQueries = {
  'abc123': 'query { posts { id title } }',
  'def456': 'query { post(id: $id) { title content } }'
};

// 只执行白名单中的查询
function validateQuery(hash) {
  if (!persistedQueries[hash]) {
    throw new Error('未注册的查询');
  }
  return persistedQueries[hash];
}
\`\`\`

#### 速率限制（Rate Limiting）

限制每个客户端在一定时间内的请求次数。

\`\`\`javascript
const rateLimiter = new Map();

function checkRateLimit(clientId, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimiter.get(clientId) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count++;
  rateLimiter.set(clientId, record);

  if (record.count > limit) {
    throw new Error('请求过于频繁，请稍后再试');
  }
}
\`\`\`

#### 请求大小限制

限制请求体的大小，防止大查询攻击。

\`\`\`javascript
app.use('/graphql', express.json({
  limit: '10kb'  // 限制请求体大小
}));
\`\`\`

#### 字段建议

通过禁用字段建议，防止攻击者通过错误消息探测 Schema 结构。

\`\`\`javascript
// 生产环境禁用字段建议
const server = new ApolloServer({
  schema,
  introspection: false,  // 禁用内省
  playground: false,     // 禁用 Playground
});
\`\`\`

### GraphQL 与 REST 共存

在现实项目中，GraphQL 和 REST 往往需要共存。以下是一些最佳实践：

1. **渐进式迁移**：从一个 REST 端点开始，逐步迁移到 GraphQL
2. **网关层统一**：在 API 网关层统一 GraphQL 和 REST 的路由
3. **GraphQL 包装 REST**：在 GraphQL Resolver 中调用 REST API
4. **共享认证**：GraphQL 和 REST 使用相同的认证机制
5. **独立部署**：GraphQL 和 REST 服务可以独立部署和扩展

### GraphQL 测试

#### 单元测试 Resolver

\`\`\`javascript
describe('Post Resolver', () => {
  it('应该返回所有文章', async () => {
    const result = await resolvers.Query.posts();
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('title');
  });

  it('创建文章时应验证输入', async () => {
    await expect(
      resolvers.Mutation.createPost(null, {
        input: { title: 'AB', content: '短', author: '作者' }
      })
    ).rejects.toThrow('标题至少需要 3 个字符');
  });
});
\`\`\`

#### 集成测试

使用 \`graphql-request\` 或直接 fetch 发送真实的 GraphQL 查询进行集成测试。

\`\`\`javascript
const { data } = await request('/graphql', \`
  query {
    posts { id title }
  }
\`);

expect(data.posts).toBeDefined();
expect(Array.isArray(data.posts)).toBe(true);
\`\`\`

### 性能优化清单

下面是生产环境 GraphQL 性能优化的完整清单：

| 优化项 | 优先级 | 影响 |
|--------|--------|------|
| DataLoader 解决 N+1 | 高 | 减少 90%+ 数据库查询 |
| 查询深度限制 | 高 | 防止恶意查询 |
| 查询复杂度限制 | 高 | 防止资源耗尽 |
| 持久化查询 | 中 | 减少网络传输，提升性能 |
| 缓存策略 | 中 | 减少重复查询 |
| 批量请求 | 中 | 减少 HTTP 请求数 |
| 字段级权限控制 | 中 | 提升安全性 |
| 监控与日志 | 中 | 可观测性 |
| 速率限制 | 中 | 防止滥用 |
| Schema 设计优化 | 长期 | 整体架构质量 |

### 生产环境部署注意事项

#### 健康检查端点

为 GraphQL 服务添加健康检查端点，方便负载均衡器和监控系统检测服务状态：

\`\`\`javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/ready', async (req, res) => {
  // 检查数据库连接等依赖
  const dbOk = await checkDatabaseConnection();
  res.json({ status: dbOk ? 'ready' : 'not ready' });
});
\`\`\`

#### 优雅关闭

在服务关闭时，确保正在处理的请求能够完成：

\`\`\`javascript
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，开始优雅关闭...');
  // 停止接收新请求
  server.close();
  // 等待现有请求完成
  await new Promise(resolve => setTimeout(resolve, 5000));
  // 关闭数据库连接
  await db.disconnect();
  process.exit(0);
});
\`\`\`

#### 环境配置管理

使用环境变量管理不同环境的配置：

\`\`\`javascript
const config = {
  port: process.env.PORT || 4000,
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
  tracing: process.env.NODE_ENV === 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
\`\`\`

### 版本管理与 Schema 演进

GraphQL 的 Schema 演进遵循"不破坏性变更"原则：

\`\`\`graphql
# 安全的变更（不破坏客户端）：
# 1. 添加新类型
# 2. 给现有类型添加新字段
# 3. 给 Mutation 添加新的输入字段（可选）
# 4. 添加新的 Query 或 Mutation

# 危险的变更（可能破坏客户端）：
# 1. 删除字段或类型
# 2. 修改字段类型
# 3. 修改字段名
# 4. 将可选字段改为必填
# 5. 删除枚举值
\`\`\`

对于需要废弃的字段，使用 \`@deprecated\` 指令：

\`\`\`graphql
type Post {
  id: ID!
  title: String!
  oldTitle: String! @deprecated(reason: "使用 title 字段替代")
}
\`\`\`

### GraphQL 服务选型

目前主流的 GraphQL 服务端框架：

| 框架 | 语言 | 特点 |
|------|------|------|
| Apollo Server | JavaScript/TypeScript | 最流行的 Node.js GraphQL 框架 |
| GraphQL Yoga | JavaScript/TypeScript | 基于 Express，开箱即用 |
| Hot Chocolate | .NET (C#) | .NET 生态最成熟的 GraphQL 框架 |
| Graphene | Python | Python 生态首选 |
| Absinthe | Elixir | 适合高并发场景 |
| gqlgen | Go | Go 语言代码生成方案 |
| Mercurius | JavaScript | Fastify 插件，性能优秀 |

### 本章小结

本章全面介绍了 GraphQL 在生产环境中的最佳实践：

- Schema 设计原则：按需设计、规范命名、避免过度嵌套
- 错误处理规范：统一的错误码和错误处理中间件
- N+1 问题的识别和 DataLoader 解决方案
- 查询复杂度限制和深度限制
- 持久化查询的原理和优势
- 多层次的缓存策略（HTTP 缓存、应用层缓存、CDN）
- 批量请求和 Schema 拼接/Federation
- 监控与日志系统
- 安全防护措施（白名单、速率限制、请求大小限制、字段建议）
- GraphQL 与 REST 的共存策略
- GraphQL 测试方法
- 生产部署注意事项（健康检查、优雅关闭、环境配置）
- Schema 版本管理与演进策略
- 主流 GraphQL 服务端框架选型

掌握了这些最佳实践，你就能在生产环境中构建稳定、高效、安全的 GraphQL 服务了。`,

    code: `# === Schema ===
# ------------------------------------------------------------
# 最佳实践演示 Schema
# 展示规范化的类型设计、分页、错误处理
# ------------------------------------------------------------

# 使用标准命名规范：类型 PascalCase，字段 camelCase
# 使用枚举定义状态，避免魔法字符串

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: String!
  status: PostStatus!
  createdAt: String!
  updatedAt: String!
}

type Query {
  posts(
    first: Int = 10
    after: String
    status: PostStatus
    search: String
  ): PostConnection!
  post(id: ID!): Post
}

type Mutation {
  createPost(input: PostInput!): Post!
  updatePost(id: ID!, input: PostUpdateInput!): Post!
  publishPost(id: ID!): Post!
  archivePost(id: ID!): Post!
}

input PostInput {
  title: String!
  content: String!
  author: String!
}

input PostUpdateInput {
  title: String
  content: String
}

# === Resolvers ===
// ------------------------------------------------------------
// 最佳实践 Resolver 实现
// 演示：分页、DataLoader 模式、错误处理、复杂度控制
// ------------------------------------------------------------

// 模拟数据
var posts = [
  { id: "1", title: "GraphQL 最佳实践", content: "在生产环境中使用 GraphQL 的最佳实践...", author: "张三", status: "PUBLISHED", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z" },
  { id: "2", title: "性能优化指南", content: "如何优化 GraphQL 服务的性能...", author: "李四", status: "PUBLISHED", createdAt: "2025-02-01T00:00:00Z", updatedAt: "2025-05-15T00:00:00Z" },
  { id: "3", title: "安全防护策略", content: "GraphQL API 的安全防护措施...", author: "王五", status: "DRAFT", createdAt: "2025-03-01T00:00:00Z", updatedAt: "2025-03-01T00:00:00Z" },
  { id: "4", title: "Schema 设计原则", content: "如何设计清晰、可扩展的 Schema...", author: "张三", status: "PUBLISHED", createdAt: "2025-04-01T00:00:00Z", updatedAt: "2025-04-15T00:00:00Z" },
  { id: "5", title: "Federation 入门", content: "Apollo Federation 的概念和实践...", author: "赵六", status: "ARCHIVED", createdAt: "2025-05-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z" }
];

function printResult(label, data) {
  console.log("\\n--- " + label + " ---");
  console.log(JSON.stringify(data, null, 2));
}

// 光标编码/解码（模拟 Base64 游标）
function encodeCursor(id) {
  return Buffer.from("cursor:" + id).toString("base64");
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  var decoded = Buffer.from(cursor, "base64").toString("utf8");
  return decoded.replace("cursor:", "");
}

// 查询深度限制检查
function checkDepthLimit(query, maxDepth) {
  maxDepth = maxDepth || 5;
  // 简化版：检查嵌套层数（真实实现需要解析 AST）
  var depth = (query.match(/\{/g) || []).length;
  if (depth > maxDepth) {
    throw new Error("查询深度超过限制：" + maxDepth + "（当前深度：" + depth + "）");
  }
}

// 统一错误处理
function formatError(message, code) {
  return {
    message: message,
    extensions: { code: code, timestamp: new Date().toISOString() }
  };
}

// 模拟 DataLoader 模式（批量查询）
function createBatchLoader(fetchFn) {
  var pendingKeys = [];
  var pendingResolvers = [];
  var scheduled = false;

  return {
    load: function (key) {
      return new Promise(function (resolve) {
        pendingKeys.push(key);
        pendingResolvers.push(resolve);
        if (!scheduled) {
          scheduled = true;
          // 在下一个 tick 执行批量查询
          setTimeout(function () {
            var keys = pendingKeys.slice();
            var resolvers = pendingResolvers.slice();
            pendingKeys = [];
            pendingResolvers = [];
            scheduled = false;
            var results = fetchFn(keys);
            for (var i = 0; i < resolvers.length; i++) {
              resolvers[i](results[i] || null);
            }
          }, 0);
        }
      });
    }
  };
}

// 使用 DataLoader 模式批量加载文章
var postLoader = createBatchLoader(function (ids) {
  console.log("  批量查询文章 ID: " + ids.join(", "));
  return ids.map(function (id) {
    return posts.find(function (p) { return p.id === id; }) || null;
  });
});

// 分页辅助函数
function paginatePosts(first, after, statusFilter, searchTerm) {
  var filtered = posts;

  // 状态过滤
  if (statusFilter) {
    filtered = filtered.filter(function (p) { return p.status === statusFilter; });
  }

  // 搜索过滤
  if (searchTerm) {
    var term = searchTerm.toLowerCase();
    filtered = filtered.filter(function (p) {
      return p.title.toLowerCase().indexOf(term) !== -1 ||
             p.content.toLowerCase().indexOf(term) !== -1;
    });
  }

  // 光标定位
  var startIndex = 0;
  if (after) {
    var afterId = decodeCursor(after);
    startIndex = filtered.findIndex(function (p) { return p.id === afterId; }) + 1;
  }

  var page = filtered.slice(startIndex, startIndex + first);
  var totalCount = filtered.length;

  return {
    edges: page.map(function (post) {
      return { node: post, cursor: encodeCursor(post.id) };
    }),
    pageInfo: {
      hasNextPage: startIndex + first < filtered.length,
      hasPreviousPage: startIndex > 0,
      startCursor: page.length > 0 ? encodeCursor(page[0].id) : null,
      endCursor: page.length > 0 ? encodeCursor(page[page.length - 1].id) : null,
      totalCount: totalCount
    }
  };
}

// Resolver 定义
var resolvers = {
  Query: {
    // 带分页、过滤、搜索的文章查询
    posts: function (_, args) {
      return paginatePosts(
        args.first || 10,
        args.after,
        args.status,
        args.search
      );
    },
    // 单篇文章查询
    post: function (_, args) {
      var post = posts.find(function (p) { return p.id === args.id; });
      if (!post) {
        var err = formatError("文章不存在", "NOT_FOUND");
        throw new Error(JSON.stringify(err));
      }
      return post;
    }
  },
  Mutation: {
    // 创建文章（带输入验证）
    createPost: function (_, args) {
      var input = args.input;
      // 输入验证
      if (!input.title || input.title.trim().length < 3) {
        throw new Error(JSON.stringify(formatError("标题至少需要 3 个字符", "VALIDATION_ERROR")));
      }
      if (!input.content || input.content.trim().length < 10) {
        throw new Error(JSON.stringify(formatError("内容至少需要 10 个字符", "VALIDATION_ERROR")));
      }
      var newId = String(posts.length + 1);
      var newPost = {
        id: newId,
        title: input.title.trim(),
        content: input.content.trim(),
        author: input.author,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      posts.push(newPost);
      return newPost;
    },
    // 更新文章
    updatePost: function (_, args) {
      var post = posts.find(function (p) { return p.id === args.id; });
      if (!post) {
        throw new Error(JSON.stringify(formatError("文章不存在", "NOT_FOUND")));
      }
      var input = args.input;
      if (input.title !== undefined) post.title = input.title.trim();
      if (input.content !== undefined) post.content = input.content.trim();
      post.updatedAt = new Date().toISOString();
      return post;
    },
    // 发布文章
    publishPost: function (_, args) {
      var post = posts.find(function (p) { return p.id === args.id; });
      if (!post) {
        throw new Error(JSON.stringify(formatError("文章不存在", "NOT_FOUND")));
      }
      if (post.status === "PUBLISHED") {
        throw new Error(JSON.stringify(formatError("文章已经是发布状态", "BAD_REQUEST")));
      }
      post.status = "PUBLISHED";
      post.updatedAt = new Date().toISOString();
      return post;
    },
    // 归档文章
    archivePost: function (_, args) {
      var post = posts.find(function (p) { return p.id === args.id; });
      if (!post) {
        throw new Error(JSON.stringify(formatError("文章不存在", "NOT_FOUND")));
      }
      post.status = "ARCHIVED";
      post.updatedAt = new Date().toISOString();
      return post;
    }
  }
};

// ============================================================
// 演示：最佳实践
// ============================================================

// 1. 分页查询（获取前 2 篇文章）
printResult("分页查询（前 2 篇）", resolvers.Query.posts(null, { first: 2 }));

// 2. 带光标的分页（获取第二页）
var firstPage = resolvers.Query.posts(null, { first: 2 });
if (firstPage.pageInfo.hasNextPage) {
  printResult("第二页", resolvers.Query.posts(null, {
    first: 2,
    after: firstPage.pageInfo.endCursor
  }));
}

// 3. 状态过滤（只查询已发布的文章）
printResult("已发布文章", resolvers.Query.posts(null, { status: "PUBLISHED" }));

// 4. 搜索功能
printResult("搜索包含 'GraphQL' 的文章", resolvers.Query.posts(null, { search: "GraphQL" }));

// 5. 演示 DataLoader 批量加载
console.log("\\n--- DataLoader 批量加载演示 ---");
postLoader.load("1").then(function (p) { console.log("  加载文章 1: " + p.title); });
postLoader.load("2").then(function (p) { console.log("  加载文章 2: " + p.title); });
postLoader.load("3").then(function (p) { console.log("  加载文章 3: " + p.title); });

// 6. 输入验证
try {
  resolvers.Mutation.createPost(null, {
    input: { title: "AB", content: "太短", author: "作者" }
  });
} catch (e) {
  console.log("\\n--- 输入验证 ---");
  console.log("验证错误: " + e.message);
}

// 7. 状态转换
var published = resolvers.Mutation.publishPost(null, { id: "3" });
printResult("发布文章", { id: published.id, status: published.status });

// 8. 总计数
printResult("分页信息（总数）", resolvers.Query.posts(null, { first: 2 }).pageInfo);

# === Query ===
# ------------------------------------------------------------
# 客户端最佳实践查询示例
# ------------------------------------------------------------

# 分页查询（带游标）
query GetFirstPage {
  posts(first: 10) {
    edges {
      node {
        id
        title
        author
        status
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
      totalCount
    }
  }
}

# 带过滤的分页查询
query GetPublishedPosts {
  posts(first: 5, status: PUBLISHED) {
    edges {
      node {
        id
        title
        author
        createdAt
      }
    }
    pageInfo {
      totalCount
    }
  }
}

# 搜索查询
query SearchPosts {
  posts(first: 10, search: "GraphQL") {
    edges {
      node {
        id
        title
        content
      }
    }
  }
}

# 创建文章（带验证）
mutation CreatePost {
  createPost(input: {
    title: "GraphQL 安全防护"
    content: "详细介绍 GraphQL 的安全防护策略和最佳实践..."
    author: "张三"
  }) {
    id
    title
    status
    createdAt
  }
}

# 发布文章（状态转换）
mutation PublishPost {
  publishPost(id: "1") {
    id
    status
    updatedAt
  }
}
`
  }
];