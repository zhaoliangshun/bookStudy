// =============================================================
// GraphQL 交互式教程 - 第 1 批章节（基础）
// 本批包含 4 章：GraphQL 简介、Schema 类型系统、Query 查询、Mutation 变更
// 每章 content 详细讲解 + code 三段式（Schema/Resolvers/Query）
// =============================================================

export const chapters = [
  {
    id: "gql-intro",
    group: "基础",
    icon: "⚡",
    title: "GraphQL 简介",
    content: `# GraphQL 简介

## 什么是 GraphQL？

GraphQL 是一种用于 API 的查询语言和运行时环境，由 Facebook 于 2012 年内部开发，2015 年正式开源。它的核心思想是：**客户端可以精确地请求它需要的数据，而不是依赖服务端预先定义好的固定数据结构**。

GraphQL 这个名字本身就暗示了它的本质——"Graph"（图）代表了数据之间的关联关系，"QL"（Query Language）代表它是一种查询语言。与传统的 REST API 不同，GraphQL 将数据建模为一个图（Graph），客户端可以通过一次请求获取多种相关联的数据。

### 核心哲学

GraphQL 的设计哲学可以概括为以下三点：

1. **按需获取（Ask for what you need）**：客户端声明它需要哪些字段，服务端只返回这些字段，不多不少。
2. **一次请求获取多种资源（Get many resources in a single request）**：不再需要像 REST 那样发起多次请求来获取相关联的数据。
3. **强类型系统（Type system）**：GraphQL 使用类型系统来描述数据，这使得 API 具有自文档化的特性。

### GraphQL 的工作原理

GraphQL 的工作流程可以概括为以下几个步骤：

1. **定义 Schema**：服务端使用 Schema Definition Language（SDL）定义数据类型和操作。
2. **编写解析器**：为 Schema 中的每个字段编写解析器函数（Resolver），告诉 GraphQL 如何获取数据。
3. **客户端发送查询**：客户端发送 GraphQL 查询文档，声明需要哪些字段。
4. **服务端解析并执行**：GraphQL 引擎解析查询，验证其是否符合 Schema，然后调用对应的 Resolver 函数。
5. **返回精确结果**：服务端返回与查询结构完全匹配的 JSON 数据。

### 一个简单的例子

下面是一个最简单的 GraphQL 示例：

\`\`\`graphql
# 查询语句
query {
  hello
}
\`\`\`

对应的 Schema 定义：

\`\`\`graphql
type Query {
  hello: String
}
\`\`\`

返回结果：

\`\`\`json
{
  "data": {
    "hello": "Hello GraphQL!"
  }
}
\`\`\`

这个例子虽然简单，但展示了 GraphQL 的三个核心要素：**Schema 定义**、**查询语句**和**解析器函数**。

---

## GraphQL vs REST：全面对比

### REST 的痛点

REST（Representational State Transfer）是过去十年中最流行的 API 设计风格。但随着现代应用（特别是移动端和单页应用）的复杂性增加，REST 暴露出了一些明显的局限性。

#### 问题一：Over-fetching（过度获取）

在 REST 中，一个端点通常返回固定的数据结构。客户端可能只需要其中一小部分字段，但不得不接收全部数据。

\`\`\`
// REST API 端点：GET /api/users/1
// 客户端只需要 name 和 email，但接口返回了所有字段
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "age": 28,
  "address": "123 Main St",
  "phone": "555-0123",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "avatar": "https://...",
  "bio": "Software developer...",
  "followers": 1234,
  "following": 567
}
\`\`\`

这种过度获取会浪费带宽，特别是在移动网络环境下，影响应用性能。

#### 问题二：Under-fetching（获取不足）

反过来，一个 REST 端点可能不返回所有需要的数据，导致客户端需要发起多次请求。

\`\`\`
// 获取用户信息：GET /api/users/1
// 获取用户文章：GET /api/users/1/posts
// 获取每篇文章的评论：GET /api/posts/1/comments
// 获取每篇文章的作者详情：GET /api/users/2
\`\`\`

这就是著名的 N+1 问题——获取一个列表，然后为列表中的每一项再发起一次请求。

#### 问题三：版本管理困难

REST API 的版本管理通常通过 URL 前缀来实现：

\`\`\`
GET /api/v1/users/1
GET /api/v2/users/1
\`\`\`

随着 API 演进，管理多个版本变得越来越复杂。

#### 问题四：文档维护困难

REST API 的文档通常需要手动维护（如 Swagger/OpenAPI 注解），容易出现文档与实现不一致的情况。

### GraphQL 的解决方案

针对以上问题，GraphQL 提供了优雅的解决方案：

| 问题 | REST 方案 | GraphQL 方案 |
|------|----------|-------------|
| Over-fetching | 无法避免，客户端被动接收 | 客户端精确指定字段，只返回需要的数据 |
| Under-fetching | 多次请求，N+1 问题 | 单次请求获取所有关联数据 |
| 版本管理 | URL 版本号 | 通过 @deprecated 标记废弃字段，渐进式演进 |
| 文档 | 手动维护 | Schema 自文档化，内省系统自动生成文档 |

### 实际对比示例

假设我们需要在一个页面上展示：用户的基本信息、用户最近的文章列表、以及每篇文章的评论数。

#### REST 方式

需要至少 3 次请求：

\`\`\`http
# 请求 1：获取用户信息
GET /api/users/1
# 响应 1
{ "id": 1, "name": "Alice", "email": "...", "age": 28, ... }

# 请求 2：获取用户文章
GET /api/users/1/posts
# 响应 2
[{"id": 1, "title": "Post 1", "content": "..."}, {"id": 2, "title": "Post 2", "content": "..."}]

# 请求 3：获取每篇文章的评论数
GET /api/posts/1/comments?count=true
GET /api/posts/2/comments?count=true
\`\`\`

#### GraphQL 方式

只需要 1 次请求：

\`\`\`graphql
query {
  user(id: "1") {
    name
    email
    posts {
      title
      commentCount
    }
  }
}
\`\`\`

这就是 GraphQL 的核心价值——**让客户端拥有数据获取的控制权**。

---

## GraphQL 核心概念

### Schema（模式）

Schema 是 GraphQL 的核心，它定义了 API 的类型系统。Schema 使用 SDL（Schema Definition Language）编写，描述了：

- 有哪些数据类型
- 每种类型有哪些字段
- 字段的类型是什么
- 字段之间的关联关系
- 可以进行哪些操作（查询、变更、订阅）

\`\`\`graphql
# Schema 定义示例
type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!
}
\`\`\`

### Type（类型）

GraphQL 中的一切皆类型。类型定义了数据的结构。GraphQL 的类型系统包括：

- **Scalar 类型**：String、Int、Float、Boolean、ID
- **Object 类型**：自定义的对象类型，如 User、Post
- **Enum 类型**：枚举类型
- **Interface 类型**：接口类型
- **Union 类型**：联合类型
- **Input 类型**：输入类型，用于 Mutation 参数

### Query（查询）

Query 是 GraphQL 中用于读取数据的操作类型。它类似于 REST 中的 GET 请求。

\`\`\`graphql
# 基本的查询
query {
  users {
    id
    name
    email
  }
}

# 带参数的查询
query {
  user(id: "1") {
    name
    posts {
      title
    }
  }
}
\`\`\`

### Mutation（变更）

Mutation 是用于修改数据的操作类型。它类似于 REST 中的 POST/PUT/PATCH/DELETE 请求。

\`\`\`graphql
mutation {
  createUser(input: { name: "Bob", email: "bob@example.com" }) {
    id
    name
    email
  }
}
\`\`\`

### Subscription（订阅）

Subscription 是用于实时数据推送的操作类型。它基于 WebSocket，允许服务端主动向客户端推送数据。

\`\`\`graphql
subscription {
  userCreated {
    id
    name
  }
}
\`\`\`

### Resolver（解析器）

Resolver 是用于实际获取数据的函数。每个字段都可以有一个对应的 Resolver 函数，告诉 GraphQL 引擎如何获取该字段的值。

\`\`\`javascript
// 解析器示例
const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
      return db.users.find(user => user.id === args.id);
    }
  },
  User: {
    posts: (parent, args, context, info) => {
      return db.posts.filter(post => post.authorId === parent.id);
    }
  }
};
\`\`\`

Resolver 函数接收四个参数：
- **parent**：父字段的解析结果
- **args**：字段参数
- **context**：上下文对象，所有 Resolver 共享
- **info**：查询的 AST 信息

---

## GraphQL 请求流程

### 完整的请求生命周期

1. **客户端构造查询**：客户端编写 GraphQL 查询文档
2. **发送 HTTP 请求**：通常通过 POST 请求发送到单一端点
3. **服务端解析查询**：GraphQL 引擎将查询字符串解析为 AST（抽象语法树）
4. **验证查询**：根据 Schema 验证查询是否合法（字段是否存在、类型是否匹配）
5. **执行查询**：从根类型开始，递归调用每个字段的 Resolver
6. **组装响应**：将 Resolver 返回的数据按查询结构组装成 JSON
7. **返回响应**：将 JSON 响应返回给客户端

### 请求格式

GraphQL 的 HTTP 请求通常使用 POST 方法，Content-Type 为 application/json：

\`\`\`json
{
  "query": "query { user(id: \\"1\\") { name email } }",
  "variables": {},
  "operationName": ""
}
\`\`\`

### 错误处理

GraphQL 的一个独特设计是：**即使部分字段解析失败，成功的部分仍然会返回**。错误信息放在 errors 数组中，与 data 并列。

\`\`\`json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": null
    }
  },
  "errors": [
    {
      "message": "Cannot resolve email field",
      "path": ["user", "email"]
    }
  ]
}
\`\`\`

---

## GraphQL 的核心优势

### 1. 按需获取（Precise Data Fetching）

客户端可以精确指定需要哪些字段，服务端只返回这些字段。这在移动端应用中尤为重要，因为移动网络带宽有限，减少数据传输量可以直接提升用户体验。

### 2. 强类型系统（Strongly Typed）

GraphQL 的类型系统提供了编译时和运行时的类型安全保证。开发者可以借助工具（如 GraphQL Code Generator）自动生成类型定义，减少运行时错误。

### 3. 自文档化（Self-Documenting）

由于 Schema 本身就是对 API 的完整描述，开发者可以通过内省（Introspection）查询自动生成 API 文档。GraphiQL 和 GraphQL Playground 等工具就是基于内省查询实现的。

### 4. 单一端点（Single Endpoint）

所有操作都通过同一个端点（通常是 /graphql）进行，简化了客户端的网络配置和管理。

### 5. 版本无关演进（Versionless Evolution）

通过添加新字段和 @deprecated 标记废弃字段，GraphQL API 可以在不引入版本号的情况下渐进式演进。

### 6. 强大的开发者工具

GraphQL 的生态提供了丰富的工具支持：
- **GraphiQL**：交互式 IDE，用于探索和测试 GraphQL API
- **Apollo DevTools**：浏览器扩展，提供查询监控和缓存管理
- **GraphQL Code Generator**：根据 Schema 自动生成 TypeScript 类型
- **GraphQL Inspector**：Schema 差异对比工具

---

## GraphQL 简史

### 起源（2012 年）

2012 年，Facebook 面临一个重大挑战：随着移动端用户的快速增长，传统的 REST API 无法满足移动端应用的需求。Facebook 的工程师 Lee Byron、Dan Schafer 和 Nick Schrock 开始开发一种新的数据查询方案。

核心问题：Facebook 的 News Feed 功能需要从多个微服务获取数据，REST 方式的多次请求在移动网络下性能很差。

### 开源（2015 年）

2015 年 7 月，Facebook 在 React.js Conf 大会上正式发布了 GraphQL 的规范草案和 JavaScript 参考实现（graphql-js）。

### 发展里程碑

- **2015 年**：GraphQL 正式开源，graphql-js 发布
- **2016 年**：Apollo 发布了 Apollo Client 和 Apollo Server，降低了 GraphQL 的使用门槛
- **2017 年**：GitHub 发布了 GraphQL API v4，成为 GraphQL 最大的公开案例
- **2018 年**：GraphQL Foundation 成立，由 Linux Foundation 托管
- **2019 年**：GraphQL Spec 2019 年更新，加入了更多特性
- **2020 年**：Hasura 等 GraphQL 引擎快速发展
- **2021-2024 年**：GraphQL 在企业级应用中广泛采用，Shopify、Shopify、Twitter、Airbnb 等公司都在使用

---

## GraphQL 生态系统

### 服务端

| 工具 | 语言 | 特点 |
|------|------|------|
| Apollo Server | JavaScript/TypeScript | 最流行的 GraphQL 服务端框架 |
| GraphQL Yoga | JavaScript/TypeScript | 基于 Express，功能完整 |
| GraphQL.js | JavaScript | 官方参考实现 |
| Graphene | Python | Python 生态的 GraphQL 框架 |
| Hot Chocolate | .NET | .NET 生态的 GraphQL 框架 |
| Absinthe | Elixir | Elixir 生态的 GraphQL 框架 |
| Hasura | 任意 | 自动从数据库生成 GraphQL API |
| PostGraphile | 任意 | 从 PostgreSQL 自动生成 GraphQL API |

### 客户端

| 工具 | 语言 | 特点 |
|------|------|------|
| Apollo Client | JavaScript/TypeScript | 最流行的 GraphQL 客户端 |
| Relay | JavaScript | Facebook 官方客户端，适合大型应用 |
| urql | JavaScript | 轻量级 GraphQL 客户端 |
| graphql-request | JavaScript | 极简的 GraphQL 客户端 |

### 工具链

- **GraphQL Code Generator**：根据 Schema 和查询自动生成 TypeScript 类型和 Hooks
- **GraphQL Inspector**：检测 Schema 变更中的破坏性变化
- **GraphQL ESLint Plugin**：GraphQL 操作的 ESLint 规则
- **GraphQL Config**：统一的 GraphQL 项目配置

---

## 适用场景

### 适合使用 GraphQL 的场景

1. **复杂的数据需求**：页面需要从多个数据源获取数据
2. **移动端应用**：需要精确控制数据传输量
3. **多客户端**：Web、iOS、Android 等多个客户端有不同的数据需求
4. **快速迭代**：产品需求频繁变化，需要灵活的数据获取能力
5. **微服务架构**：GraphQL 可以作为 BFF（Backend for Frontend）层，聚合多个微服务的数据

### 不太适合的场景

1. **简单的 CRUD 应用**：数据模型简单，REST 足够
2. **文件上传**：GraphQL 规范对文件上传的支持有限（虽有 multipart request spec）
3. **极高性能要求的场景**：GraphQL 的查询解析和执行有一定开销
4. **流式数据传输**：大量数据流式传输，gRPC 可能更合适
5. **已有完善的 REST API**：迁移成本高，ROI 不明确

---

## GraphQL over HTTP 规范

### 端点

GraphQL 服务通常暴露在单一端点，最常见的是 \`/graphql\`。

### HTTP 方法

- **GET**：用于简单的查询，查询内容放在 URL 参数中
- **POST**：最常用的方式，查询内容放在请求体中

### 请求格式

POST 请求的 Content-Type 通常为 \`application/json\`，请求体格式：

\`\`\`json
{
  "query": "query GetUser($id: ID!) { user(id: $id) { name } }",
  "variables": { "id": "1" },
  "operationName": "GetUser",
  "extensions": {}
}
\`\`\`

字段说明：
- **query**（必填）：GraphQL 查询字符串
- **variables**（可选）：查询变量，JSON 对象
- **operationName**（可选）：操作名，用于标识执行哪个操作
- **extensions**（可选）：扩展字段，用于传递额外的协议信息

### 响应格式

无论成功与否，HTTP 状态码通常都是 200。错误信息通过 errors 字段返回：

\`\`\`json
{
  "data": { ... },
  "errors": [
    {
      "message": "错误描述",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user", "name"],
      "extensions": {
        "code": "INTERNAL_ERROR"
      }
    }
  ],
  "extensions": {}
}
\`\`\`

---

## GraphQL 与其他 API 技术的对比

### GraphQL vs gRPC

gRPC 是 Google 开发的高性能 RPC 框架，使用 Protocol Buffers 作为接口定义语言和消息格式。

| 特性 | GraphQL | gRPC |
|------|---------|------|
| 数据格式 | JSON | Protocol Buffers（二进制） |
| 接口定义 | SDL（Schema Definition Language） | .proto 文件 |
| 查询灵活性 | 极高，客户端自定义 | 固定，由服务端定义 |
| 性能 | 中等 | 极高 |
| 浏览器支持 | 优秀 | 有限（需要 gRPC-Web） |
| 流式传输 | 通过 Subscription | 原生支持双向流 |
| 适用场景 | Web/移动端 API | 微服务间通信 |

gRPC 更适合微服务之间的高性能通信，而 GraphQL 更适合面向客户端的 API。

### GraphQL vs SOAP

SOAP 是较老的 Web 服务协议，使用 XML 格式。

| 特性 | GraphQL | SOAP |
|------|---------|------|
| 数据格式 | JSON | XML |
| 接口定义 | SDL | WSDL |
| 复杂度 | 较低 | 较高 |
| 工具链 | 现代化 | 传统 |
| 适用场景 | 现代 API 开发 | 企业遗留系统 |

### 选择指南

- **选择 GraphQL**：Web/移动端应用、需要灵活数据获取、多客户端、快速迭代
- **选择 REST**：简单 CRUD、需要 HTTP 缓存、公开 API、资源导向
- **选择 gRPC**：微服务间通信、高性能要求、需要流式传输
- **选择 SOAP**：企业遗留系统、需要 WS-Security 等高级协议特性

---

## GraphQL 的常见误解

### 误解一：GraphQL 是数据库技术

**事实**：GraphQL 与数据库无关。它是 API 层的技术，可以连接任何数据源——关系型数据库、NoSQL 数据库、REST API、甚至是其他 GraphQL 服务。

### 误解二：GraphQL 只能和 React 一起使用

**事实**：GraphQL 是语言无关的规范。你可以在任何前端框架（Vue、Angular、Svelte）或任何后端语言（Python、Java、Go、Rust）中使用 GraphQL。

### 误解三：GraphQL 完全替代了 REST

**事实**：GraphQL 和 REST 可以共存。许多组织采用混合架构——面向客户端的 API 使用 GraphQL，内部服务间通信使用 REST 或 gRPC。

### 误解四：GraphQL 比 REST 更安全

**事实**：GraphQL 的灵活性也带来了新的安全挑战。查询深度限制、复杂度分析、速率限制等安全措施在 GraphQL 中尤为重要。

### 误解五：GraphQL 查询会自动优化

**事实**：GraphQL 不会自动优化查询。N+1 问题是 GraphQL 中常见的性能陷阱，需要使用 DataLoader 等工具来解决。

---

## GraphQL 查询语言深入

### 查询文档结构

一个完整的 GraphQL 查询文档可以包含多个操作：

\`\`\`graphql
# 查询文档可以包含多个操作定义
query GetUser {
  user(id: "1") {
    name
  }
}

query GetPosts {
  posts {
    title
  }
}

# 但一次请求只能执行一个操作
# 通过 operationName 参数指定
\`\`\`

### 内联片段（Inline Fragment）

内联片段用于在查询中根据类型条件选择字段：

\`\`\`graphql
query {
  search(term: "GraphQL") {
    __typename
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
  }
}
\`\`\`

### 命名片段（Named Fragment）

命名片段可以复用选择集：

\`\`\`graphql
fragment UserFields on User {
  id
  name
  email
  createdAt
}

query {
  user1: user(id: "1") {
    ...UserFields
  }
  user2: user(id: "2") {
    ...UserFields
  }
}
\`\`\`

### 指令（Directives）

GraphQL 支持两种内置指令：

- **@include(if: Boolean)**：条件包含字段
- **@skip(if: Boolean)**：条件跳过字段

\`\`\`graphql
query GetUser($includeEmail: Boolean!, $skipPosts: Boolean!) {
  user(id: "1") {
    name
    email @include(if: $includeEmail)
    posts @skip(if: $skipPosts) {
      title
    }
  }
}
\`\`\`

### 元字段（Meta Fields）

GraphQL 提供了几个特殊的元字段：

- \`__typename\`：返回对象的类型名称
- \`__schema\`：查询整个 Schema
- \`__type\`：查询特定类型的信息

## 学习建议

学习 GraphQL 的推荐路径：

1. **理解核心概念**：先理解 Schema、Query、Mutation、Resolver 这些基本概念
2. **动手实践**：搭建一个简单的 GraphQL 服务，尝试编写查询和变更
3. **深入学习类型系统**：掌握各种类型和类型修饰符的用法
4. **学习高级特性**：Fragment、Directive、Subscription、DataLoader 等
5. **了解生态工具**：学习 Apollo Client/Server、GraphQL Code Generator 等工具

记住：GraphQL 只是一个规范，它不绑定任何特定语言或数据库。你可以用任何语言实现 GraphQL 服务，连接任何数据源。`,
    code: `# === Schema ===
# 基础 Schema 定义 - GraphQL 简介演示
# 包含 Query 类型、User 类型、Post 类型

type Query {
  """
  返回一个简单的问候语
  """
  hello: String!

  """
  根据 ID 查询用户
  """
  user(id: ID!): User

  """
  获取所有用户列表
  """
  users: [User!]!

  """
  获取所有文章列表
  """
  posts: [Post!]!

  """
  获取系统信息
  """
  systemInfo: SystemInfo!
}

"""
用户类型 - 包含个人基本信息和关联文章
"""
type User {
  id: ID!
  name: String!
  email: String
  age: Int
  bio: String
  avatar: String
  posts: [Post!]!
  followerCount: Int
  followingCount: Int
  createdAt: String!
}

"""
文章类型 - 博客文章的数据结构
"""
type Post {
  id: ID!
  title: String!
  content: String
  author: User!
  authorId: ID!
  likes: Int
  published: Boolean!
  tags: [String!]!
  createdAt: String!
}

"""
系统信息类型
"""
type SystemInfo {
  version: String!
  name: String!
  uptime: Float!
  description: String!
}

# === Resolvers ===
// 演示数据 - 使用字面量定义，不依赖外部数据源
const users = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 28, bio: "Full-stack developer from San Francisco", avatar: "https://avatar.example.com/alice.png", createdAt: "2023-01-15T08:00:00Z" },
  { id: "2", name: "Bob", email: "bob@example.com", age: 32, bio: "Backend engineer and GraphQL enthusiast", avatar: "https://avatar.example.com/bob.png", createdAt: "2023-03-20T10:30:00Z" },
  { id: "3", name: "Charlie", email: "charlie@example.com", age: 25, bio: "Frontend developer learning GraphQL", avatar: "https://avatar.example.com/charlie.png", createdAt: "2023-06-10T14:00:00Z" }
];

const posts = [
  { id: "1", title: "Introduction to GraphQL", content: "GraphQL is a query language for APIs...", authorId: "1", likes: 42, published: true, tags: ["graphql", "api", "tutorial"], createdAt: "2024-01-10T09:00:00Z" },
  { id: "2", title: "Advanced Schema Design", content: "Learn how to design effective GraphQL schemas...", authorId: "1", likes: 28, published: true, tags: ["graphql", "schema", "advanced"], createdAt: "2024-02-15T11:00:00Z" },
  { id: "3", title: "GraphQL vs REST", content: "A comprehensive comparison...", authorId: "2", likes: 67, published: true, tags: ["graphql", "rest", "comparison"], createdAt: "2024-03-01T08:30:00Z" },
  { id: "4", title: "Building a GraphQL Server", content: "Step by step guide to building your first GraphQL server...", authorId: "2", likes: 15, published: false, tags: ["graphql", "server", "tutorial"], createdAt: "2024-04-20T16:00:00Z" }
];

const resolvers = {
  Query: {
    hello: () => "Hello GraphQL! Welcome to the interactive tutorial!",
    user: (_, args) => {
      const { id } = args;
      const user = users.find(function(u) { return u.id === id; });
      return user || null;
    },
    users: () => users,
    posts: () => posts,
    systemInfo: () => {
      const startTime = new Date("2024-01-01").getTime();
      const uptimeHours = (Date.now() - startTime) / (1000 * 60 * 60);
      return {
        version: "1.0.0",
        name: "GraphQL Interactive Tutorial",
        uptime: parseFloat(uptimeHours.toFixed(2)),
        description: "An interactive GraphQL learning platform"
      };
    }
  },
  User: {
    posts: (parent) => {
      const userId = parent.id;
      return posts.filter(function(p) { return p.authorId === userId; });
    },
    followerCount: (parent) => {
      const counts = { "1": 1240, "2": 890, "3": 345 };
      return counts[parent.id] || 0;
    },
    followingCount: (parent) => {
      const counts = { "1": 567, "2": 432, "3": 210 };
      return counts[parent.id] || 0;
    }
  },
  Post: {
    author: (parent) => {
      const authorId = parent.authorId;
      return users.find(function(u) { return u.id === authorId; }) || null;
    }
  }
};

# === Query ===
# 综合查询 - 演示 GraphQL 的按需获取能力
# 同时查询用户信息、文章列表、系统信息

query IntroDemo {
  hello
  systemInfo {
    name
    version
    description
    uptime
  }
  user(id: "1") {
    name
    email
    age
    bio
    followerCount
    followingCount
    posts {
      title
      likes
      published
      tags
      createdAt
    }
  }
  posts {
    title
    author {
      name
      email
    }
    likes
    tags
  }
}
`,
  },

  {
    id: "gql-schema",
    group: "基础",
    icon: "🏗️",
    title: "Schema 类型系统",
    content: `# Schema 类型系统

## 概述

GraphQL 的类型系统是整个 GraphQL 规范的核心。它定义了 API 中所有数据的结构、关系和操作方式。类型系统不仅仅是文档，它是 GraphQL 的"契约"——客户端和服务端之间的约定。

### 为什么类型系统如此重要？

1. **数据契约**：类型系统定义了客户端可以请求什么数据、以什么格式
2. **编译时验证**：工具可以在编译时检查查询是否合法
3. **自文档化**：类型系统本身就可以生成完整的 API 文档
4. **IDE 支持**：基于类型系统提供自动补全、错误提示等
5. **代码生成**：可以自动生成 TypeScript 类型、React Hooks 等

---

## Scalar 类型（标量类型）

GraphQL 内置了 5 种标量类型，它们是最基本的类型，表示"叶子"值——不能再包含子字段。

### 内置标量类型

| 类型 | 描述 | 示例 |
|------|------|------|
| **String** | UTF-8 字符序列 | \`"Hello GraphQL"\` |
| **Int** | 有符号 32 位整数 | \`42\`, \`-10\` |
| **Float** | 有符号双精度浮点数 | \`3.14\`, \`-0.5\` |
| **Boolean** | 布尔值 | \`true\`, \`false\` |
| **ID** | 唯一标识符，序列化为 String | \`"1"\`, \`"abc-123"\` |

### ID 类型的特殊之处

ID 类型在 GraphQL 中有特殊语义：
- 它表示一个**唯一标识符**
- 它总是序列化为**字符串**（即使传入的是数字）
- 它**不应该是人类可读的**（虽然实践中经常是）
- 它用于**缓存和重新获取**对象

\`\`\`graphql
type User {
  id: ID!
  name: String!
}

# 查询时可以传入数字或字符串
query {
  user(id: 1) { name }  # 1 会被序列化为 "1"
  user(id: "abc-123") { name }
}
\`\`\`

### 自定义 Scalar 类型

除了内置的 5 种标量类型，你还可以定义自定义标量类型。自定义标量需要实现序列化和反序列化逻辑。

\`\`\`graphql
# 自定义标量定义
scalar DateTime
scalar JSON
scalar Email
scalar URL
scalar Upload
\`\`\`

自定义标量的常见用途：

| 自定义 Scalar | 用途 | 序列化格式 |
|--------------|------|-----------|
| DateTime | 日期时间 | ISO 8601 字符串 |
| JSON | 任意 JSON 对象 | 序列化的 JSON 字符串 |
| Email | 邮箱地址 | 验证后的邮箱字符串 |
| URL | 网址 | 验证后的 URL 字符串 |
| UUID | UUID 标识符 | UUID 格式字符串 |
| Decimal | 精确小数 | 字符串表示的小数 |

\`\`\`javascript
// 自定义 DateTime Scalar 的实现示例（Apollo Server）
import { GraphQLScalarType, Kind } from 'graphql';

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 格式的日期时间',
  // 从客户端接收值时的处理
  parseValue(value) {
    return new Date(value);
  },
  // 从查询变量接收值时的处理
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
  // 向客户端返回值时的序列化
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
});
\`\`\`

---

## Object 类型（对象类型）

Object 类型是 GraphQL 中最常见的类型，它由一组命名字段组成，每个字段有自己的类型。

### 基本定义

\`\`\`graphql
type User {
  id: ID!
  name: String!
  email: String
  age: Int
  avatar: String
}
\`\`\`

### 字段描述

GraphQL 支持为每个字段添加描述信息，使用三引号字符串：

\`\`\`graphql
type User {
  """
  用户的唯一标识符，全局唯一
  """
  id: ID!

  """
  用户的显示名称
  """
  name: String!

  """
  用户邮箱地址，用于登录和通知
  """
  email: String

  """
  用户年龄，可选字段
  """
  age: Int
}
\`\`\`

### 字段参数

GraphQL 中的字段可以接受参数，这使得字段更加灵活和强大：

\`\`\`graphql
type User {
  id: ID!
  name: String!

  """
  获取用户文章，支持分页
  """
  posts(
    limit: Int = 10
    offset: Int = 0
    sortBy: String = "createdAt"
  ): [Post!]!

  """
  获取指定尺寸的头像
  """
  avatar(size: Int = 100): String
}
\`\`\`

参数的默认值使得客户端可以选择性地传递参数，简化了常见场景的查询。

---

## 类型修饰符（Type Modifiers）

GraphQL 的类型修饰符用于改变字段的"可空性"和"数量"。

### NonNull（!）

叹号 \`!\` 表示该字段**不能为 null**。这意味着 Resolver 必须返回一个非 null 的值，否则 GraphQL 会返回错误。

\`\`\`graphql
type User {
  id: ID!       # id 必须存在，不能为 null
  name: String!  # name 必须存在，不能为 null
  email: String  # email 可以为 null
}
\`\`\`

**NonNull 的传播规则**：当一个字段标记为 NonNull，但其 Resolver 返回 null 时，错误会向上传播到第一个允许为 null 的父字段。

### List（[]）

方括号 \`[]\` 表示该字段是一个**数组**。

\`\`\`graphql
type User {
  tags: [String]      # 可以为 null 的数组，元素可以为 null
  posts: [Post!]      # 可以为 null 的数组，元素不能为 null
  emails: [String!]!  # 不能为 null 的数组，元素不能为 null
}
\`\`\`

### 组合使用

| 声明 | 数组本身 | 数组元素 |
|------|---------|---------|
| \`[String]\` | 可为 null | 可为 null |
| \`[String!]\` | 可为 null | 不可为 null |
| \`[String]!\` | 不可为 null | 可为 null |
| \`[String!]!\` | 不可为 null | 不可为 null |

\`\`\`json
// [String] 可能的返回值
null          // 整个数组为 null
[]            // 空数组
["a", null]   // 包含 null 元素

// [String!] 可能的返回值
null          // 整个数组为 null
[]            // 空数组
["a", "b"]    // 所有元素必须非 null

// [String]! 可能的返回值
[]            // 空数组
["a", null]   // 包含 null 元素
// null 不允许

// [String!]! 可能的返回值
[]            // 空数组
["a", "b"]    // 所有元素必须非 null
// null 不允许
// [null] 不允许
\`\`\`

---

## Enum 类型（枚举类型）

Enum 类型用于定义一组固定的值，字段只能取这些值中的一个。

### 定义

\`\`\`graphql
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  DELETED
}

enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
  READER
}

enum SortOrder {
  ASC
  DESC
}
\`\`\`

### 使用

\`\`\`graphql
type Post {
  id: ID!
  title: String!
  status: PostStatus!
}

type Query {
  posts(status: PostStatus): [Post!]!
  users(role: UserRole, sortOrder: SortOrder = DESC): [User!]!
}
\`\`\`

### Enum 的内部表示

在 GraphQL 内部，Enum 值被序列化为字符串（不带引号）。在 Resolver 中，Enum 值以字符串形式传入。

---

## Input 类型（输入类型）

Input 类型用于 Mutation 的参数，它允许传递复杂的嵌套对象。

### 为什么需要 Input 类型？

在 Mutation 中，我们经常需要传递多个参数。如果参数过多，可以使用 Input 类型将它们组织在一起。

### 定义

\`\`\`graphql
input CreateUserInput {
  name: String!
  email: String!
  age: Int
  bio: String
  role: UserRole = READER
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
  bio: String
}

input PostFilter {
  status: PostStatus
  authorId: ID
  tag: String
  search: String
}

input PaginationInput {
  limit: Int = 10
  offset: Int = 0
}
\`\`\`

### Input 类型的特点

1. **只能包含标量、Enum 和其他 Input 类型**，不能包含 Object 类型
2. **字段可以有默认值**
3. **不能使用 Interface 或 Union**
4. **不能有参数**

### 使用示例

\`\`\`graphql
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

type Query {
  posts(filter: PostFilter, pagination: PaginationInput): [Post!]!
}
\`\`\`

---

## Interface 类型（接口类型）

Interface 类型定义了一组公共字段，其他类型可以实现这个接口。

### 定义

\`\`\`graphql
interface Node {
  id: ID!
  createdAt: String!
  updatedAt: String!
}

interface Searchable {
  searchScore: Float!
}

type User implements Node & Searchable {
  id: ID!
  name: String!
  email: String
  createdAt: String!
  updatedAt: String!
  searchScore: Float!
}

type Post implements Node & Searchable {
  id: ID!
  title: String!
  content: String
  createdAt: String!
  updatedAt: String!
  searchScore: Float!
}
\`\`\`

### 查询 Interface 类型

当查询 Interface 类型时，使用内联片段（Inline Fragment）来指定具体类型的字段：

\`\`\`graphql
query {
  search(term: "GraphQL") {
    searchScore
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
  }
}
\`\`\`

### Interface 的 Resolver

Interface 需要一个特殊的 \`__resolveType\` 函数来确定具体类型：

\`\`\`javascript
const resolvers = {
  Searchable: {
    __resolveType(obj) {
      if (obj.name !== undefined) {
        return 'User';
      }
      if (obj.title !== undefined) {
        return 'Post';
      }
      return null;
    }
  }
};
\`\`\`

---

## Union 类型（联合类型）

Union 类型表示一个字段可以返回多种类型中的一种，但这些类型之间不需要共享字段。

### 定义

\`\`\`graphql
union SearchResult = User | Post | Comment

type Query {
  search(term: String!): [SearchResult!]!
}
\`\`\`

### Interface vs Union

| 特性 | Interface | Union |
|------|-----------|-------|
| 共享字段 | 有公共字段 | 不需要公共字段 |
| 类型关系 | "是一个"关系 | "或者是"关系 |
| 字段继承 | 实现类型必须包含接口字段 | 没有公共字段要求 |
| 典型场景 | Node 模式、分页连接 | 搜索结果、动态内容 |

### 查询 Union 类型

Union 类型也只能通过内联片段来查询：

\`\`\`graphql
query {
  search(term: "GraphQL") {
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
    ... on Comment {
      text
      author {
        name
      }
    }
  }
}
\`\`\`

---

## Schema 定义

Schema 定义了 GraphQL 服务的入口点——根类型。

### 根类型

\`\`\`graphql
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
\`\`\`

### 默认约定

大多数 GraphQL 服务遵循以下约定：
- 根查询类型命名为 **Query**
- 根变更类型命名为 **Mutation**
- 根订阅类型命名为 **Subscription**

如果遵循这个约定，可以省略 schema 声明。

### 完整的 Schema 示例

\`\`\`graphql
schema {
  query: Query
  mutation: Mutation
}

type Query {
  user(id: ID!): User
  users: [User!]!
  posts: [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!
}
\`\`\`

---

## 类型关系

GraphQL 的类型系统支持多种类型关系：

### 一对一关系

\`\`\`graphql
type User {
  id: ID!
  profile: Profile  # 每个用户有一个 Profile
}

type Profile {
  id: ID!
  bio: String
  user: User!  # 每个 Profile 属于一个 User
}
\`\`\`

### 一对多关系

\`\`\`graphql
type User {
  id: ID!
  posts: [Post!]!  # 一个用户有多篇文章
}

type Post {
  id: ID!
  author: User!  # 一篇文章只有一个作者
}
\`\`\`

### 多对多关系

\`\`\`graphql
type Post {
  id: ID!
  tags: [Tag!]!  # 一篇文章可以有多个标签
}

type Tag {
  id: ID!
  posts: [Post!]!  # 一个标签可以对应多篇文章
}
\`\`\`

### 自引用关系

\`\`\`graphql
type Category {
  id: ID!
  name: String!
  parent: Category    # 父分类
  children: [Category!]!  # 子分类
}

type Comment {
  id: ID!
  text: String!
  parent: Comment     # 父评论
  replies: [Comment!]!  # 回复
}
\`\`\`

---

## 自文档化

GraphQL 类型系统的一个重要特性是**自文档化**。通过内省（Introspection）系统，客户端可以查询 Schema 本身的信息。

### 内省查询

\`\`\`graphql
# 查询所有类型
query {
  __schema {
    types {
      name
      kind
      description
    }
  }
}

# 查询某个类型的字段
query {
  __type(name: "User") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
\`\`\`

### 内省系统

GraphQL 内建了以双下划线开头的内省类型：
- \`__schema\`：查询整个 Schema
- \`__type\`：查询某个类型
- \`__typename\`：获取对象的类型名（每个对象都有的元字段）

---

## 类型系统对比 JSON Schema

| 特性 | GraphQL 类型系统 | JSON Schema |
|------|-----------------|-------------|
| 主要用途 | API 查询语言 | 数据验证 |
| 类型定义 | SDL 语法 | JSON 格式 |
| 运行时 | 编译时类型检查 | 运行时验证 |
| 文档生成 | 原生支持 | 需要额外工具 |
| 代码生成 | 原生支持 | 需要额外工具 |
| 学习曲线 | 中等 | 较低 |

---

## 类型系统最佳实践

### 1. 使用 NonNull 提高可靠性

对于业务必需的字段，使用 \`!\` 标记为 NonNull，这样可以在 Resolver 返回 null 时立即发现错误。

### 2. 为所有类型和字段添加描述

描述信息会被内省系统暴露，成为自动生成的文档的一部分。

### 3. 使用 Enum 替代魔法字符串

对于状态、角色等固定值，使用 Enum 类型而不是 String。

### 4. 使用 Input 类型组织复杂参数

当 Mutation 有超过 3 个参数时，考虑使用 Input 类型。

### 5. 合理使用 Interface 和 Union

当多种类型共享字段时使用 Interface；当多种类型没有公共字段时使用 Union。

### 6. 避免深层嵌套

类型嵌套过深会导致查询语句冗长，建议控制在 3-4 层以内。

### 7. 类型命名规范

- 类型名使用 PascalCase：\`User\`, \`PostComment\`
- 字段名使用 camelCase：\`firstName\`, \`createdAt\`
- Enum 值使用 UPPER_SNAKE_CASE：\`DRAFT\`, \`IN_PROGRESS\`

### 8. 分页设计

对于列表字段，总是提供分页参数，避免返回过多数据：

\`\`\`graphql
type Query {
  users(
    first: Int = 10
    after: String
    last: Int
    before: String
  ): [User!]!
}
\`\`\``,
    code: `# === Schema ===
# 完整的类型系统演示
# 包含 Scalar、Object、Enum、Interface、Union、Input 类型

scalar DateTime
scalar JSON

type Query {
  """
  获取所有用户
  """
  users: [User!]!

  """
  根据 ID 获取单个用户
  """
  user(id: ID!): User

  """
  获取所有博客文章
  """
  posts: [Post!]!

  """
  获取所有评论
  """
  comments: [Comment!]!

  """
  搜索多种类型
  """
  search(term: String!): [SearchResult!]!

  """
  获取所有节点（Node 接口模式）
  """
  nodes: [Node!]!

  """
  获取文章统计
  """
  postStats: PostStats!
}

type Mutation {
  """
  创建新用户
  """
  createUser(input: CreateUserInput!): User!

  """
  更新用户信息
  """
  updateUser(id: ID!, input: UpdateUserInput!): User!

  """
  删除用户
  """
  deleteUser(id: ID!): Boolean!

  """
  创建文章
  """
  createPost(input: CreatePostInput!): Post!
}

"""
Node 接口 - 所有实体类型的基础接口
"""
interface Node {
  id: ID!
  createdAt: String!
}

"""
SearchResult 联合 - 搜索可以返回多种类型
"""
union SearchResult = User | Post | Comment

"""
用户类型 - 实现了 Node 接口
"""
type User implements Node {
  id: ID!
  name: String!
  email: String
  age: Int
  bio: String
  role: UserRole!
  status: AccountStatus!
  tags: [String!]!
  metadata: JSON
  posts: [Post!]!
  comments: [Comment!]!
  createdAt: String!
  updatedAt: String!
}

"""
文章类型 - 实现了 Node 接口
"""
type Post implements Node {
  id: ID!
  title: String!
  content: String
  excerpt: String
  status: PostStatus!
  author: User!
  authorId: ID!
  tags: [String!]!
  likes: Int!
  viewCount: Int!
  comments: [Comment!]!
  createdAt: String!
  updatedAt: String!
  publishedAt: String
}

"""
评论类型
"""
type Comment {
  id: ID!
  text: String!
  author: User!
  authorId: ID!
  post: Post!
  postId: ID!
  createdAt: String!
}

"""
文章统计类型
"""
type PostStats {
  totalPosts: Int!
  publishedPosts: Int!
  draftPosts: Int!
  archivedPosts: Int!
  totalLikes: Int!
  totalViews: Int!
  averageLikesPerPost: Float!
  mostPopularTag: String
  postsByStatus: [StatusCount!]!
}

type StatusCount {
  status: PostStatus!
  count: Int!
}

enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
  READER
}

enum AccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

input CreateUserInput {
  name: String!
  email: String!
  age: Int
  bio: String
  role: UserRole = READER
  tags: [String!] = []
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
  bio: String
  role: UserRole
  status: AccountStatus
}

input CreatePostInput {
  title: String!
  content: String
  authorId: ID!
  status: PostStatus = DRAFT
  tags: [String!] = []
}

# === Resolvers ===
// 演示数据
const users = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 28, bio: "Full-stack developer", role: "ADMIN", status: "ACTIVE", tags: ["javascript", "graphql", "react"], metadata: { theme: "dark", language: "zh-CN" }, createdAt: "2023-01-15T08:00:00Z", updatedAt: "2024-06-01T10:00:00Z" },
  { id: "2", name: "Bob", email: "bob@example.com", age: 32, bio: "Backend engineer", role: "EDITOR", status: "ACTIVE", tags: ["python", "graphql", "docker"], metadata: { theme: "light", language: "en-US" }, createdAt: "2023-03-20T10:30:00Z", updatedAt: "2024-05-15T14:00:00Z" },
  { id: "3", name: "Charlie", email: "charlie@example.com", age: 25, bio: "Frontend developer", role: "AUTHOR", status: "ACTIVE", tags: ["vue", "typescript", "css"], metadata: { theme: "dark", language: "zh-CN" }, createdAt: "2023-06-10T14:00:00Z", updatedAt: "2024-04-20T09:00:00Z" },
  { id: "4", name: "Diana", email: "diana@example.com", age: 35, bio: "DevOps specialist", role: "READER", status: "INACTIVE", tags: ["kubernetes", "aws", "terraform"], metadata: null, createdAt: "2023-09-05T16:00:00Z", updatedAt: "2024-03-10T11:00:00Z" }
];

const posts = [
  { id: "1", title: "Introduction to GraphQL", content: "GraphQL is a query language for APIs that provides a complete and understandable description of the data in your API.", excerpt: "Learn the basics of GraphQL", status: "PUBLISHED", authorId: "1", tags: ["graphql", "api", "tutorial"], likes: 42, viewCount: 1520, createdAt: "2024-01-10T09:00:00Z", updatedAt: "2024-06-01T10:00:00Z", publishedAt: "2024-01-10T09:00:00Z" },
  { id: "2", title: "Advanced Schema Design", content: "Learn how to design effective and scalable GraphQL schemas with best practices.", excerpt: "Master schema design patterns", status: "PUBLISHED", authorId: "1", tags: ["graphql", "schema", "advanced"], likes: 28, viewCount: 980, createdAt: "2024-02-15T11:00:00Z", updatedAt: "2024-05-20T15:00:00Z", publishedAt: "2024-02-15T11:00:00Z" },
  { id: "3", title: "GraphQL vs REST Comparison", content: "A comprehensive comparison between GraphQL and REST API architectures.", excerpt: "REST vs GraphQL deep dive", status: "PUBLISHED", authorId: "2", tags: ["graphql", "rest", "comparison"], likes: 67, viewCount: 2340, createdAt: "2024-03-01T08:30:00Z", updatedAt: "2024-05-10T12:00:00Z", publishedAt: "2024-03-01T08:30:00Z" },
  { id: "4", title: "Building Your First GraphQL Server", content: "A step-by-step guide to building a production-ready GraphQL server.", excerpt: "Hands-on server tutorial", status: "DRAFT", authorId: "2", tags: ["graphql", "server", "tutorial"], likes: 15, viewCount: 450, createdAt: "2024-04-20T16:00:00Z", updatedAt: "2024-04-25T09:00:00Z", publishedAt: null },
  { id: "5", title: "GraphQL Security Best Practices", content: "How to secure your GraphQL API against common vulnerabilities.", excerpt: "API security guide", status: "ARCHIVED", authorId: "3", tags: ["graphql", "security", "best-practices"], likes: 33, viewCount: 1120, createdAt: "2024-05-01T07:00:00Z", updatedAt: "2024-05-05T10:00:00Z", publishedAt: "2024-05-01T07:00:00Z" }
];

const comments = [
  { id: "1", text: "Great introduction to GraphQL!", authorId: "2", postId: "1", createdAt: "2024-01-11T10:00:00Z" },
  { id: "2", text: "Very helpful, thanks for sharing!", authorId: "3", postId: "1", createdAt: "2024-01-12T14:00:00Z" },
  { id: "3", text: "I learned a lot about schema design.", authorId: "3", postId: "2", createdAt: "2024-02-20T09:00:00Z" },
  { id: "4", text: "Great comparison between REST and GraphQL.", authorId: "1", postId: "3", createdAt: "2024-03-05T11:00:00Z" },
  { id: "5", text: "Looking forward to the next part!", authorId: "4", postId: "4", createdAt: "2024-04-22T08:00:00Z" }
];

const resolvers = {
  Query: {
    users: () => users,
    user: (_, args) => {
      const { id } = args;
      return users.find(function(u) { return u.id === id; }) || null;
    },
    posts: () => posts,
    comments: () => comments,
    search: (_, args) => {
      const term = args.term.toLowerCase();
      const results = [];
      users.forEach(function(u) {
        if (u.name.toLowerCase().indexOf(term) !== -1 || u.bio.toLowerCase().indexOf(term) !== -1) {
          results.push(u);
        }
      });
      posts.forEach(function(p) {
        if (p.title.toLowerCase().indexOf(term) !== -1 || p.content.toLowerCase().indexOf(term) !== -1) {
          results.push(p);
        }
      });
      comments.forEach(function(c) {
        if (c.text.toLowerCase().indexOf(term) !== -1) {
          results.push(c);
        }
      });
      return results;
    },
    nodes: () => {
      return users.concat(posts);
    },
    postStats: () => {
      const publishedPosts = posts.filter(function(p) { return p.status === "PUBLISHED"; });
      const draftPosts = posts.filter(function(p) { return p.status === "DRAFT"; });
      const archivedPosts = posts.filter(function(p) { return p.status === "ARCHIVED"; });
      const totalLikes = posts.reduce(function(sum, p) { return sum + p.likes; }, 0);
      const totalViews = posts.reduce(function(sum, p) { return sum + p.viewCount; }, 0);
      const avgLikes = posts.length > 0 ? totalLikes / posts.length : 0;

      const tagCounts = {};
      posts.forEach(function(p) {
        p.tags.forEach(function(t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      let mostPopularTag = null;
      let maxCount = 0;
      Object.keys(tagCounts).forEach(function(tag) {
        if (tagCounts[tag] > maxCount) {
          maxCount = tagCounts[tag];
          mostPopularTag = tag;
        }
      });

      return {
        totalPosts: posts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        archivedPosts: archivedPosts.length,
        totalLikes: totalLikes,
        totalViews: totalViews,
        averageLikesPerPost: parseFloat(avgLikes.toFixed(2)),
        mostPopularTag: mostPopularTag,
        postsByStatus: [
          { status: "PUBLISHED", count: publishedPosts.length },
          { status: "DRAFT", count: draftPosts.length },
          { status: "ARCHIVED", count: archivedPosts.length }
        ]
      };
    }
  },
  Mutation: {
    createUser: (_, args) => {
      const input = args.input;
      const newUser = {
        id: String(users.length + 1),
        name: input.name,
        email: input.email,
        age: input.age || null,
        bio: input.bio || null,
        role: input.role || "READER",
        status: "ACTIVE",
        tags: input.tags || [],
        metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      return newUser;
    },
    updateUser: (_, args) => {
      const { id, input } = args;
      const user = users.find(function(u) { return u.id === id; });
      if (!user) return null;
      if (input.name !== undefined) user.name = input.name;
      if (input.email !== undefined) user.email = input.email;
      if (input.age !== undefined) user.age = input.age;
      if (input.bio !== undefined) user.bio = input.bio;
      if (input.role !== undefined) user.role = input.role;
      if (input.status !== undefined) user.status = input.status;
      user.updatedAt = new Date().toISOString();
      return user;
    },
    deleteUser: (_, args) => {
      const { id } = args;
      const index = users.findIndex(function(u) { return u.id === id; });
      if (index === -1) return false;
      users.splice(index, 1);
      return true;
    },
    createPost: (_, args) => {
      const input = args.input;
      const newPost = {
        id: String(posts.length + 1),
        title: input.title,
        content: input.content || null,
        excerpt: input.content ? input.content.substring(0, 100) + "..." : null,
        status: input.status || "DRAFT",
        authorId: input.authorId,
        tags: input.tags || [],
        likes: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: input.status === "PUBLISHED" ? new Date().toISOString() : null
      };
      posts.push(newPost);
      return newPost;
    }
  },
  User: {
    posts: (parent) => {
      return posts.filter(function(p) { return p.authorId === parent.id; });
    },
    comments: (parent) => {
      return comments.filter(function(c) { return c.authorId === parent.id; });
    }
  },
  Post: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; }) || null;
    },
    comments: (parent) => {
      return comments.filter(function(c) { return c.postId === parent.id; });
    }
  },
  Comment: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; }) || null;
    },
    post: (parent) => {
      return posts.find(function(p) { return p.id === parent.postId; }) || null;
    }
  },
  Node: {
    __resolveType: (obj) => {
      if (obj.name !== undefined) return "User";
      if (obj.title !== undefined) return "Post";
      return null;
    }
  },
  SearchResult: {
    __resolveType: (obj) => {
      if (obj.name !== undefined) return "User";
      if (obj.title !== undefined) return "Post";
      if (obj.text !== undefined) return "Comment";
      return null;
    }
  }
};

# === Query ===
# 综合查询 - 演示类型系统的各种特性
# 包括 Interface、Union、Enum、Input 类型的使用

query TypeSystemDemo {
  # 基本查询
  users {
    id
    name
    email
    role
    status
    tags
    posts {
      title
      status
      likes
    }
  }

  # 搜索联合类型
  search(term: "GraphQL") {
    __typename
    ... on User {
      name
      email
      bio
    }
    ... on Post {
      title
      excerpt
      status
      likes
    }
    ... on Comment {
      text
      createdAt
    }
  }

  # 文章统计
  postStats {
    totalPosts
    publishedPosts
    draftPosts
    archivedPosts
    totalLikes
    totalViews
    averageLikesPerPost
    mostPopularTag
    postsByStatus {
      status
      count
    }
  }

  # Node 接口模式
  nodes {
    __typename
    id
    createdAt
    ... on User {
      name
      role
    }
    ... on Post {
      title
      status
    }
  }
}
`,
  },

  {
    id: "gql-query",
    group: "基础",
    icon: "🔍",
    title: "Query 查询",
    content: `# Query 查询

## 概述

Query 是 GraphQL 中用于**读取数据**的操作类型。它是 GraphQL 最核心的功能之一，也是日常开发中最常用的操作。Query 的核心优势在于：**客户端可以精确地声明需要哪些数据，服务端只返回这些数据**。

## 基本查询语法

### 最简单的查询

GraphQL 查询的基本语法非常简单：

\`\`\`graphql
{
  users {
    id
    name
    email
  }
}
\`\`\`

这就是一个"简写"查询。当不需要传递变量或指定操作名时，可以省略 \`query\` 关键字。

### 完整的查询语法

推荐使用完整的查询语法，它包含操作类型、操作名和变量声明：

\`\`\`graphql
query GetUsers {
  users {
    id
    name
    email
  }
}
\`\`\`

---

## 字段选择（Field Selection）

### 基本字段选择

字段选择是 GraphQL 查询的核心。客户端在查询中声明需要哪些字段，服务端只返回这些字段：

\`\`\`graphql
query {
  user(id: "1") {
    name       # 只获取 name
    email      # 只获取 email
    # 不请求 age，所以不会返回 age
  }
}
\`\`\`

### 嵌套字段选择

GraphQL 的一个重要特性是可以在一次查询中获取嵌套的关联数据：

\`\`\`graphql
query {
  user(id: "1") {
    name
    posts {       # 嵌套查询 - 获取用户的文章
      title
      content
      tags
    }
  }
}
\`\`\`

### 标量字段 vs 对象字段

- **标量字段**：String、Int、Float、Boolean、ID——叶子节点，不能再包含子字段
- **对象字段**：自定义类型——可以继续选择子字段

\`\`\`graphql
query {
  user(id: "1") {
    name        # 标量字段 - 叶子节点
    email       # 标量字段 - 叶子节点
    posts {     # 对象字段 - 可以继续选择
      title     # 标量字段
      author {  # 对象字段 - 再次嵌套
        name    # 标量字段
      }
    }
  }
}
\`\`\`

---

## 字段别名（Field Aliases）

### 为什么需要别名？

当需要在同一个查询中多次请求同一个字段但使用不同的参数时，别名就派上了用场。别名允许你为字段的结果重命名。

### 基本用法

\`\`\`graphql
query {
  alice: user(id: "1") {
    name
    email
  }
  bob: user(id: "2") {
    name
    email
  }
}
\`\`\`

响应结果：

\`\`\`json
{
  "data": {
    "alice": {
      "name": "Alice",
      "email": "alice@example.com"
    },
    "bob": {
      "name": "Bob",
      "email": "bob@example.com"
    }
  }
}
\`\`\`

### 嵌套字段的别名

别名也可以用于嵌套字段：

\`\`\`graphql
query {
  user(id: "1") {
    fullName: name
    emailAddress: email
    recentPosts: posts(limit: 5) {
      title
    }
    olderPosts: posts(limit: 5, offset: 5) {
      title
    }
  }
}
\`\`\`

---

## 操作名（Operation Name）

### 什么是操作名？

操作名是查询的可选标识符，用于调试和日志记录。它本身不影响查询的执行结果。

### 为什么需要操作名？

1. **调试**：在开发工具中，操作名可以帮助快速定位问题
2. **日志**：服务端日志记录操作名，便于监控和分析
3. **多操作文档**：当一个请求文档包含多个操作时，通过 operationName 参数指定执行哪个

### 使用示例

\`\`\`graphql
# 定义操作名
query GetActiveUsers {
  users {
    name
    email
  }
}

# 在 HTTP 请求中指定操作名
# POST /graphql
# {
#   "query": "query GetActiveUsers { users { name email } }",
#   "operationName": "GetActiveUsers"
# }
\`\`\`

---

## 查询变量（Variables）

### 为什么需要变量？

在 GraphQL 中，查询是静态的字符串。如果不使用变量，每次查询不同的参数都需要重新构造查询字符串，这既不优雅也不安全。

变量解决了这个问题：
1. **参数化查询**：查询字符串不变，只改变变量值
2. **安全性**：避免字符串拼接，防止注入攻击
3. **缓存**：相同的查询结构可以被缓存，只改变变量

### 变量声明

\`\`\`graphql
# 变量声明使用 $variableName: Type 语法
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}
\`\`\`

### 变量传递

在 HTTP 请求中，变量通过 variables 字段传递：

\`\`\`json
{
  "query": "query GetUser($userId: ID!) { user(id: $userId) { name email } }",
  "variables": {
    "userId": "1"
  }
}
\`\`\`

### 多个变量

\`\`\`graphql
query GetPosts($status: PostStatus, $limit: Int = 10, $offset: Int = 0) {
  posts(status: $status, limit: $limit, offset: $offset) {
    title
    content
  }
}
\`\`\`

---

## 变量类型

### 变量类型必须匹配

GraphQL 的变量类型必须与 Schema 中定义的字段参数类型**兼容**。兼容意味着：
- 如果字段参数是 \`String!\`，变量可以是 \`String!\` 或 \`String\`
- 如果字段参数是 \`String\`，变量可以是 \`String!\` 或 \`String\`

### 变量类型修饰符

\`\`\`graphql
query Example(
  $id: ID!              # 必填的 ID
  $name: String         # 可选的 String
  $tags: [String!]      # 可选的字符串数组
  $limit: Int = 10      # 带默认值的 Int
  $status: PostStatus   # Enum 类型
  $filter: PostFilter   # Input 类型
) {
  # ...
}
\`\`\`

### 默认值

变量可以设置默认值，如果客户端不传递该变量，则使用默认值：

\`\`\`graphql
query GetPosts(
  $limit: Int = 10
  $offset: Int = 0
  $sortBy: String = "createdAt"
) {
  posts(limit: $limit, offset: $offset, sortBy: $sortBy) {
    title
  }
}
\`\`\`

---

## Required 变量

### 使用 NonNull

当变量标记为 NonNull（加 \`!\`）时，该变量是**必填的**。如果客户端不传递该变量，GraphQL 会返回验证错误，不会执行查询。

\`\`\`graphql
# id 是必填的，不传递会报错
query GetUser($id: ID!) {
  user(id: $id) {
    name
  }
}
\`\`\`

### 最佳实践

- 对于**必须的查询参数**（如 ID），使用 NonNull 变量
- 对于**可选的筛选参数**，使用可空变量并提供默认值
- 对于**分页参数**，使用可空变量并提供合理的默认值

---

## 查询文档最佳实践

### 1. 使用操作名

始终为查询添加操作名，方便调试和日志分析。

### 2. 使用变量而非字符串拼接

**不好**：
\`\`\`javascript
const query = \`
  query {
    user(id: "\${userId}") {
      name
    }
  }
\`;
\`\`\`

**好**：
\`\`\`graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
  }
}
\`\`\`

### 3. 精确选择字段

只请求需要的字段，不要请求多余的数据。这不仅可以减少网络传输，还能避免不必要的数据库查询。

### 4. 合理使用别名

当需要多次请求同一个字段时，使用别名来区分结果。

### 5. 使用 Fragment 复用选择集

Fragment 可以将重复的字段选择集提取出来，提高可维护性：

\`\`\`graphql
fragment UserInfo on User {
  id
  name
  email
}

query {
  alice: user(id: "1") {
    ...UserInfo
  }
  bob: user(id: "2") {
    ...UserInfo
  }
}
\`\`\`

### 6. 分页查询

对于列表查询，始终使用分页，避免一次性返回过多数据：

\`\`\`graphql
query GetUsers($first: Int = 10, $after: String) {
  users(first: $first, after: $after) {
    id
    name
  }
}
\`\`\`

---

## 查询与 GET/POST

### GET 请求

对于简单的查询，可以使用 GET 请求，查询参数放在 URL 中：

\`\`\`
GET /graphql?query={users{name}}&variables={}&operationName=
\`\`\`

GET 请求的优缺点：
- **优点**：可以被浏览器缓存、可以被 CDN 缓存
- **缺点**：URL 长度有限制，不适合复杂查询

### POST 请求

对于大多数查询，推荐使用 POST 请求：

\`\`\`json
POST /graphql
Content-Type: application/json

{
  "query": "query GetUsers { users { name } }",
  "variables": {},
  "operationName": "GetUsers"
}
\`\`\`

### 何时使用 GET？

- 查询简单且可以被缓存
- 查询不包含敏感信息
- 查询结果可以被 CDN 缓存

### 何时使用 POST？

- 查询包含复杂变量
- 查询包含敏感信息
- 查询字符串较长

---

## 查询深度限制

### 为什么需要深度限制？

GraphQL 的灵活性也带来了风险——恶意客户端可以构造深度嵌套的查询，导致服务端性能问题：

\`\`\`graphql
# 恶意查询 - 深度嵌套
query {
  user(id: "1") {
    posts {
      author {
        posts {
          author {
            posts {
              author {
                # ... 可以无限嵌套
              }
            }
          }
        }
      }
    }
  }
}
\`\`\`

### 深度限制策略

大多数 GraphQL 服务端框架都支持查询深度限制：

\`\`\`javascript
// graphql-depth-limit 示例
import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(5)] // 限制最大深度为 5
});
\`\`\`

---

## 查询复杂度分析

### 为什么需要复杂度分析？

除了深度限制外，还需要考虑查询的**复杂度**——即查询执行所消耗的资源。一个查询可能深度不大，但请求了大量数据。

### 复杂度计算

\`\`\`graphql
# 简单查询 - 复杂度较低
query {
  user(id: "1") {
    name
    email
  }
}

# 复杂查询 - 复杂度较高
query {
  users {
    posts {
      comments {
        author {
          posts {
            title
          }
        }
      }
    }
  }
}
\`\`\`

### 复杂度限制

\`\`\`javascript
// graphql-query-complexity 示例
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const rule = createComplexityLimitRule(1000, {
  onCost: (cost) => {
    console.log('Query cost:', cost);
  }
});
\`\`\`

---

## 查询性能优化

### 1. 避免 N+1 问题

使用 DataLoader 批量获取数据，避免在嵌套 Resolver 中逐个查询：

\`\`\`javascript
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids) => {
  const users = await db.users.findByIds(ids);
  return ids.map(id => users.find(u => u.id === id));
});
\`\`\`

### 2. 字段级别的缓存

对不经常变化的字段使用缓存策略，减少不必要的计算。

### 3. 查询持久化

将常用查询在服务端持久化，客户端只传递查询 ID 而不是完整的查询字符串。

### 4. 自动持久化查询（APQ）

Apollo 的自动持久化查询可以让客户端发送查询的哈希值，服务端缓存查询字符串，减少网络传输。

---

## 查询响应格式

### 标准响应

GraphQL 的标准响应格式始终是 JSON，包含 data 和 errors 两个字段：

\`\`\`json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
\`\`\`

### 部分成功

GraphQL 的独特设计：即使部分 Resolver 执行失败，成功的部分也会返回：

\`\`\`json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": null
    }
  },
  "errors": [
    {
      "message": "Failed to fetch email",
      "path": ["user", "email"],
      "extensions": {
        "code": "INTERNAL_ERROR"
      }
    }
  ]
}
\`\`\`

### 批量查询

一些 GraphQL 实现支持批量查询，在一个 HTTP 请求中发送多个查询：

\`\`\`json
[
  {
    "query": "query { user(id: \\"1\\") { name } }"
  },
  {
    "query": "query { posts { title } }"
  }
]
\`\`\`

---

## 总结

Query 是 GraphQL 中使用最频繁的操作类型。掌握 Query 的核心要点：

1. **精确字段选择**：只请求需要的字段
2. **合理使用变量**：参数化查询，避免字符串拼接
3. **使用别名**：区分相同字段的不同参数请求
4. **添加操作名**：便于调试和监控
5. **分页查询**：始终为列表字段提供分页
6. **安全防护**：设置深度限制和复杂度限制`,
    code: `# === Schema ===
# Query 查询演示 - 完整的查询类型定义
# 包含分页、筛选、排序、搜索等查询能力

type Query {
  """
  获取用户列表，支持分页和排序
  """
  users(
    limit: Int = 10
    offset: Int = 0
    sortBy: String = "createdAt"
    sortOrder: SortOrder = DESC
    role: UserRole
    status: AccountStatus
    search: String
  ): [User!]!

  """
  根据 ID 获取单个用户
  """
  user(id: ID!): User

  """
  获取文章列表，支持多种筛选
  """
  posts(
    limit: Int = 10
    offset: Int = 0
    status: PostStatus
    tag: String
    authorId: ID
    search: String
    sortBy: String = "createdAt"
    sortOrder: SortOrder = DESC
  ): [Post!]!

  """
  根据 ID 获取单篇文章
  """
  post(id: ID!): Post

  """
  获取文章总数统计
  """
  postCount: Int!

  """
  获取所有标签及其对应的文章数
  """
  tags: [TagCount!]!

  """
  获取热门文章
  """
  popularPosts(limit: Int = 5): [Post!]!

  """
  获取最新文章
  """
  recentPosts(limit: Int = 5): [Post!]!

  """
  搜索文章
  """
  searchPosts(term: String!, limit: Int = 10): [Post!]!

  """
  获取所有评论
  """
  comments(
    postId: ID
    authorId: ID
    limit: Int = 20
    offset: Int = 0
  ): [Comment!]!
}

type User {
  id: ID!
  name: String!
  email: String
  age: Int
  bio: String
  role: UserRole!
  status: AccountStatus!
  posts(
    limit: Int = 5
    offset: Int = 0
    status: PostStatus
  ): [Post!]!
  postCount: Int!
  comments(limit: Int = 10): [Comment!]!
  createdAt: String!
  updatedAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String
  excerpt: String
  status: PostStatus!
  tags: [String!]!
  likes: Int!
  viewCount: Int!
  author: User!
  authorId: ID!
  comments(
    limit: Int = 10
    offset: Int = 0
  ): [Comment!]!
  commentCount: Int!
  createdAt: String!
  updatedAt: String!
  publishedAt: String
}

type Comment {
  id: ID!
  text: String!
  author: User!
  authorId: ID!
  post: Post!
  postId: ID!
  createdAt: String!
}

type TagCount {
  tag: String!
  count: Int!
}

enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
  READER
}

enum AccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum SortOrder {
  ASC
  DESC
}

# === Resolvers ===
// 演示数据集 - 包含用户、文章、评论
const users = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 28, bio: "Full-stack developer and GraphQL enthusiast", role: "ADMIN", status: "ACTIVE", createdAt: "2023-01-15T08:00:00Z", updatedAt: "2024-06-01T10:00:00Z" },
  { id: "2", name: "Bob", email: "bob@example.com", age: 32, bio: "Backend engineer specializing in API design", role: "EDITOR", status: "ACTIVE", createdAt: "2023-03-20T10:30:00Z", updatedAt: "2024-05-15T14:00:00Z" },
  { id: "3", name: "Charlie", email: "charlie@example.com", age: 25, bio: "Frontend developer exploring GraphQL", role: "AUTHOR", status: "ACTIVE", createdAt: "2023-06-10T14:00:00Z", updatedAt: "2024-04-20T09:00:00Z" },
  { id: "4", name: "Diana", email: "diana@example.com", age: 35, bio: "DevOps engineer and cloud architect", role: "AUTHOR", status: "INACTIVE", createdAt: "2023-09-05T16:00:00Z", updatedAt: "2024-03-10T11:00:00Z" },
  { id: "5", name: "Eve", email: "eve@example.com", age: 29, bio: "Data scientist learning GraphQL for API integration", role: "READER", status: "ACTIVE", createdAt: "2023-11-20T09:00:00Z", updatedAt: "2024-02-28T15:00:00Z" }
];

const posts = [
  { id: "1", title: "Introduction to GraphQL", content: "GraphQL is a query language for APIs that gives clients the power to ask for exactly what they need.", excerpt: "Learn the basics of GraphQL", status: "PUBLISHED", authorId: "1", tags: ["graphql", "api", "tutorial"], likes: 42, viewCount: 1520, createdAt: "2024-01-10T09:00:00Z", updatedAt: "2024-06-01T10:00:00Z", publishedAt: "2024-01-10T09:00:00Z" },
  { id: "2", title: "Advanced Schema Design Patterns", content: "Learn how to design effective and scalable GraphQL schemas with proven patterns.", excerpt: "Master schema design", status: "PUBLISHED", authorId: "1", tags: ["graphql", "schema", "advanced"], likes: 28, viewCount: 980, createdAt: "2024-02-15T11:00:00Z", updatedAt: "2024-05-20T15:00:00Z", publishedAt: "2024-02-15T11:00:00Z" },
  { id: "3", title: "GraphQL vs REST: A Comprehensive Comparison", content: "A deep dive into the differences between GraphQL and REST API architectures.", excerpt: "REST vs GraphQL deep dive", status: "PUBLISHED", authorId: "2", tags: ["graphql", "rest", "comparison"], likes: 67, viewCount: 2340, createdAt: "2024-03-01T08:30:00Z", updatedAt: "2024-05-10T12:00:00Z", publishedAt: "2024-03-01T08:30:00Z" },
  { id: "4", title: "Building Your First GraphQL Server", content: "A step-by-step guide to building a production-ready GraphQL server from scratch.", excerpt: "Hands-on server tutorial", status: "DRAFT", authorId: "2", tags: ["graphql", "server", "tutorial"], likes: 15, viewCount: 450, createdAt: "2024-04-20T16:00:00Z", updatedAt: "2024-04-25T09:00:00Z", publishedAt: null },
  { id: "5", title: "GraphQL Security Best Practices", content: "How to secure your GraphQL API against common vulnerabilities and attacks.", excerpt: "API security guide", status: "PUBLISHED", authorId: "3", tags: ["graphql", "security", "best-practices"], likes: 33, viewCount: 1120, createdAt: "2024-05-01T07:00:00Z", updatedAt: "2024-05-05T10:00:00Z", publishedAt: "2024-05-01T07:00:00Z" },
  { id: "6", title: "Performance Optimization in GraphQL", content: "Techniques and strategies for optimizing your GraphQL API performance.", excerpt: "Optimize your GraphQL API", status: "PUBLISHED", authorId: "3", tags: ["graphql", "performance", "optimization"], likes: 21, viewCount: 780, createdAt: "2024-05-15T14:00:00Z", updatedAt: "2024-05-18T09:00:00Z", publishedAt: "2024-05-15T14:00:00Z" },
  { id: "7", title: "GraphQL Federation for Microservices", content: "How to use GraphQL Federation to unify microservices into a single graph.", excerpt: "Federation guide", status: "DRAFT", authorId: "1", tags: ["graphql", "federation", "microservices"], likes: 8, viewCount: 320, createdAt: "2024-06-01T10:00:00Z", updatedAt: "2024-06-05T16:00:00Z", publishedAt: null },
  { id: "8", title: "Testing GraphQL APIs", content: "Best practices and tools for testing your GraphQL API endpoints.", excerpt: "API testing guide", status: "ARCHIVED", authorId: "4", tags: ["graphql", "testing", "tools"], likes: 12, viewCount: 560, createdAt: "2024-02-01T08:00:00Z", updatedAt: "2024-02-10T11:00:00Z", publishedAt: "2024-02-01T08:00:00Z" }
];

const comments = [
  { id: "1", text: "Great introduction to GraphQL! Very helpful for beginners.", authorId: "2", postId: "1", createdAt: "2024-01-11T10:00:00Z" },
  { id: "2", text: "I learned so much from this article. Thanks for sharing!", authorId: "3", postId: "1", createdAt: "2024-01-12T14:00:00Z" },
  { id: "3", text: "The schema design patterns are really useful.", authorId: "3", postId: "2", createdAt: "2024-02-20T09:00:00Z" },
  { id: "4", text: "Excellent comparison between REST and GraphQL.", authorId: "1", postId: "3", createdAt: "2024-03-05T11:00:00Z" },
  { id: "5", text: "Can't wait to try building my own GraphQL server!", authorId: "4", postId: "4", createdAt: "2024-04-22T08:00:00Z" },
  { id: "6", text: "The security tips are essential for production apps.", authorId: "5", postId: "5", createdAt: "2024-05-03T15:00:00Z" },
  { id: "7", text: "Performance optimization made easy with these tips.", authorId: "2", postId: "6", createdAt: "2024-05-17T12:00:00Z" },
  { id: "8", text: "I've been using GraphQL for a year and still learned new things.", authorId: "4", postId: "2", createdAt: "2024-03-10T16:00:00Z" },
  { id: "9", text: "Looking forward to the federation deep dive!", authorId: "5", postId: "7", createdAt: "2024-06-03T09:00:00Z" },
  { id: "10", text: "Testing is often overlooked, great article.", authorId: "1", postId: "8", createdAt: "2024-02-05T13:00:00Z" }
];

// 排序辅助函数
function sortByField(arr, field, order) {
  return arr.slice().sort(function(a, b) {
    var aVal = a[field];
    var bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (aVal < bVal) return order === "ASC" ? -1 : 1;
    if (aVal > bVal) return order === "ASC" ? 1 : -1;
    return 0;
  });
}

const resolvers = {
  Query: {
    users: (_, args) => {
      var result = users.slice();
      var limit = args.limit || 10;
      var offset = args.offset || 0;
      var sortBy = args.sortBy || "createdAt";
      var sortOrder = args.sortOrder || "DESC";
      var role = args.role;
      var status = args.status;
      var search = args.search;

      if (role) {
        result = result.filter(function(u) { return u.role === role; });
      }
      if (status) {
        result = result.filter(function(u) { return u.status === status; });
      }
      if (search) {
        var s = search.toLowerCase();
        result = result.filter(function(u) {
          return u.name.toLowerCase().indexOf(s) !== -1 ||
                 u.email.toLowerCase().indexOf(s) !== -1 ||
                 u.bio.toLowerCase().indexOf(s) !== -1;
        });
      }

      result = sortByField(result, sortBy, sortOrder);
      return result.slice(offset, offset + limit);
    },
    user: (_, args) => {
      return users.find(function(u) { return u.id === args.id; }) || null;
    },
    posts: (_, args) => {
      var result = posts.slice();
      var limit = args.limit || 10;
      var offset = args.offset || 0;
      var status = args.status;
      var tag = args.tag;
      var authorId = args.authorId;
      var search = args.search;
      var sortBy = args.sortBy || "createdAt";
      var sortOrder = args.sortOrder || "DESC";

      if (status) {
        result = result.filter(function(p) { return p.status === status; });
      }
      if (tag) {
        result = result.filter(function(p) { return p.tags.indexOf(tag) !== -1; });
      }
      if (authorId) {
        result = result.filter(function(p) { return p.authorId === authorId; });
      }
      if (search) {
        var s = search.toLowerCase();
        result = result.filter(function(p) {
          return p.title.toLowerCase().indexOf(s) !== -1 ||
                 p.content.toLowerCase().indexOf(s) !== -1;
        });
      }

      result = sortByField(result, sortBy, sortOrder);
      return result.slice(offset, offset + limit);
    },
    post: (_, args) => {
      return posts.find(function(p) { return p.id === args.id; }) || null;
    },
    postCount: () => posts.length,
    tags: () => {
      var tagCounts = {};
      posts.forEach(function(p) {
        p.tags.forEach(function(t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      return Object.keys(tagCounts).map(function(tag) {
        return { tag: tag, count: tagCounts[tag] };
      }).sort(function(a, b) { return b.count - a.count; });
    },
    popularPosts: (_, args) => {
      var limit = args.limit || 5;
      return posts.slice().sort(function(a, b) { return b.likes - a.likes; }).slice(0, limit);
    },
    recentPosts: (_, args) => {
      var limit = args.limit || 5;
      return posts.slice().sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }).slice(0, limit);
    },
    searchPosts: (_, args) => {
      var term = args.term.toLowerCase();
      var limit = args.limit || 10;
      return posts.filter(function(p) {
        return p.title.toLowerCase().indexOf(term) !== -1 ||
               p.content.toLowerCase().indexOf(term) !== -1 ||
               p.tags.some(function(t) { return t.toLowerCase().indexOf(term) !== -1; });
      }).slice(0, limit);
    },
    comments: (_, args) => {
      var result = comments.slice();
      var limit = args.limit || 20;
      var offset = args.offset || 0;
      if (args.postId) {
        result = result.filter(function(c) { return c.postId === args.postId; });
      }
      if (args.authorId) {
        result = result.filter(function(c) { return c.authorId === args.authorId; });
      }
      return result.slice(offset, offset + limit);
    }
  },
  User: {
    posts: (parent, args) => {
      var result = posts.filter(function(p) { return p.authorId === parent.id; });
      var limit = args.limit || 5;
      var offset = args.offset || 0;
      if (args.status) {
        result = result.filter(function(p) { return p.status === args.status; });
      }
      return result.slice(offset, offset + limit);
    },
    postCount: (parent) => {
      return posts.filter(function(p) { return p.authorId === parent.id; }).length;
    },
    comments: (parent, args) => {
      var result = comments.filter(function(c) { return c.authorId === parent.id; });
      var limit = args.limit || 10;
      return result.slice(0, limit);
    }
  },
  Post: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; }) || null;
    },
    comments: (parent, args) => {
      var result = comments.filter(function(c) { return c.postId === parent.id; });
      var limit = args.limit || 10;
      var offset = args.offset || 0;
      return result.slice(offset, offset + limit);
    },
    commentCount: (parent) => {
      return comments.filter(function(c) { return c.postId === parent.id; }).length;
    }
  },
  Comment: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; }) || null;
    },
    post: (parent) => {
      return posts.find(function(p) { return p.id === parent.postId; }) || null;
    }
  }
};

# === Query ===
# 综合查询演示 - 展示别名、变量、分页、筛选、嵌套查询等特性

query QueryDemo {
  # 使用别名同时获取多个用户
  adminUser: user(id: "1") {
    name
    email
    role
    postCount
    posts(limit: 3) {
      title
      status
      likes
    }
  }

  editorUser: user(id: "2") {
    name
    email
    role
    postCount
    recentPosts: posts(limit: 2, status: PUBLISHED) {
      title
      likes
      viewCount
    }
  }

  # 文章列表查询（带筛选）
  publishedPosts: posts(status: PUBLISHED, limit: 5, sortBy: "likes") {
    title
    excerpt
    likes
    viewCount
    author {
      name
    }
    tags
    commentCount
  }

  # 搜索文章
  searchResults: searchPosts(term: "GraphQL", limit: 3) {
    title
    likes
    status
    tags
  }

  # 标签统计
  tags {
    tag
    count
  }

  # 热门文章
  popularPosts(limit: 3) {
    title
    likes
    viewCount
    author {
      name
    }
  }

  # 最新文章
  recentPosts(limit: 3) {
    title
    createdAt
    status
  }

  # 文章总数
  postCount

  # 评论查询
  comments(limit: 5) {
    text
    author {
      name
    }
    post {
      title
    }
    createdAt
  }
}
`,
  },

  {
    id: "gql-mutation",
    group: "基础",
    icon: "✏️",
    title: "Mutation 变更",
    content: `# Mutation 变更

## 概述

Mutation 是 GraphQL 中用于**修改数据**的操作类型。它类似于 REST 中的 POST、PUT、PATCH 和 DELETE 请求。Mutation 的核心特点是：**在修改数据的同时，可以请求返回修改后的数据**。

## Mutation 基本语法

### 最简单的 Mutation

\`\`\`graphql
mutation {
  createUser(input: { name: "Frank", email: "frank@example.com" }) {
    id
    name
    email
  }
}
\`\`\`

### 带操作名的 Mutation

\`\`\`graphql
mutation CreateNewUser {
  createUser(input: { name: "Frank", email: "frank@example.com" }) {
    id
    name
    email
  }
}
\`\`\`

### 带变量的 Mutation

\`\`\`graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}
\`\`\`

---

## Mutation vs Query 的区别

虽然 Mutation 和 Query 在语法上很相似，但它们在语义和执行方式上有重要区别：

| 特性 | Query | Mutation |
|------|-------|----------|
| 目的 | 读取数据 | 修改数据 |
| 副作用 | 无副作用 | 有副作用（修改数据） |
| 执行顺序 | 并行执行 | 串行执行（按顺序） |
| HTTP 方法 | GET 或 POST | 仅 POST |
| 缓存 | 可以被缓存 | 不能被缓存 |
| 幂等性 | 天然幂等 | 取决于具体实现 |

### 执行顺序的重要性

GraphQL 规范要求 Mutation 中的**顶层字段必须按顺序串行执行**。这意味着：

\`\`\`graphql
mutation {
  first: createUser(input: { name: "A" }) { id }
  second: createUser(input: { name: "B" }) { id }
}
\`\`\`

上面的两个 Mutation 会按顺序执行——先创建用户 A，再创建用户 B。这确保了数据的一致性。

而 Query 中的字段是**并行执行**的，因为读取操作之间没有依赖关系。

---

## 输入参数

### 基本参数

Mutation 可以接受简单的参数：

\`\`\`graphql
type Mutation {
  deleteUser(id: ID!): Boolean!
  updateUserEmail(id: ID!, email: String!): User!
}
\`\`\`

### 使用 Input 类型

当 Mutation 有多个参数时，推荐使用 Input 类型：

\`\`\`graphql
input CreateUserInput {
  name: String!
  email: String!
  age: Int
  bio: String
  role: UserRole = READER
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
\`\`\`

**Input 类型的优势**：
1. 参数组织更清晰
2. 更容易在客户端复用
3. Schema 中只有一个参数，更简洁
4. Input 类型可以在多个 Mutation 中复用

### 嵌套 Input 类型

Input 类型可以嵌套，处理复杂的数据结构：

\`\`\`graphql
input AddressInput {
  street: String!
  city: String!
  state: String!
  zipCode: String!
  country: String = "CN"
}

input CreateUserInput {
  name: String!
  email: String!
  address: AddressInput
  tags: [String!]
}
\`\`\`

---

## 返回类型

### 返回修改后的对象

Mutation 的最佳实践是**返回修改后的对象**，这样客户端可以立即获取最新的数据状态：

\`\`\`graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    updatedAt
  }
}
\`\`\`

### 返回嵌套数据

Mutation 的返回类型可以包含嵌套对象，允许客户端在一次请求中获取相关联的数据：

\`\`\`graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    content
    author {
      id
      name
      email
    }
    tags
    createdAt
  }
}
\`\`\`

### 返回布尔值

对于删除操作，通常返回布尔值表示是否成功：

\`\`\`graphql
type Mutation {
  deleteUser(id: ID!): Boolean!
  deletePost(id: ID!): Boolean!
}
\`\`\`

---

## 变更后重新获取数据

### 问题

Mutation 会修改服务端数据，导致客户端缓存过时。如何确保客户端数据与服务端保持一致？

### 方案一：返回变更后的数据

最简单的方式是让 Mutation 返回足够的数据，客户端用返回的数据更新缓存：

\`\`\`graphql
mutation UpdateProfile($input: UpdateUserInput!) {
  updateProfile(input: $input) {
    id
    name
    email
    bio
    updatedAt
  }
}
\`\`\`

### 方案二：重新查询

在 Mutation 完成后，主动重新查询受影响的数据：

\`\`\`graphql
# 先执行 Mutation
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}

# 再执行 Query
query GetPosts {
  posts {
    id
    title
    author {
      name
    }
  }
}
\`\`\`

### 方案三：缓存更新（Apollo Client）

Apollo Client 提供了自动缓存更新机制：

\`\`\`javascript
const [createPost] = useMutation(CREATE_POST, {
  update(cache, { data: { createPost } }) {
    const existingPosts = cache.readQuery({ query: GET_POSTS });
    cache.writeQuery({
      query: GET_POSTS,
      data: {
        posts: [...existingPosts.posts, createPost],
      },
    });
  },
});
\`\`\`

---

## 批量变更

### 批量创建

\`\`\`graphql
type Mutation {
  createUsers(input: [CreateUserInput!]!): [User!]!
}
\`\`\`

### 批量删除

\`\`\`graphql
type Mutation {
  deleteUsers(ids: [ID!]!): Int!  # 返回删除的数量
}
\`\`\`

### 批量更新

\`\`\`graphql
input BulkUpdateUserInput {
  id: ID!
  input: UpdateUserInput!
}

type Mutation {
  bulkUpdateUsers(inputs: [BulkUpdateUserInput!]!): [User!]!
}
\`\`\`

---

## Mutation 设计原则

### 1. 使用动词命名

Mutation 应该以动词开头，清晰表达其行为：

\`\`\`graphql
# 好的命名
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  publishPost(id: ID!): Post!
  archivePost(id: ID!): Post!
}

# 不好的命名
type Mutation {
  userCreate(input: CreateUserInput!): User!
  userUpdate(id: ID!, input: UpdateUserInput!): User!
}
\`\`\`

### 2. 返回变更后的对象

Mutation 应该返回变更后的对象，而不是简单的成功/失败状态：

\`\`\`graphql
# 好的设计 - 返回变更后的对象
type Mutation {
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

# 不好的设计 - 只返回布尔值
type Mutation {
  updateUser(id: ID!, input: UpdateUserInput!): Boolean!
}
\`\`\`

### 3. 使用 Input 类型

当 Mutation 有 2 个以上的参数时，使用 Input 类型：

\`\`\`graphql
# 好的设计
type Mutation {
  createUser(input: CreateUserInput!): User!
}

# 不好的设计
type Mutation {
  createUser(
    name: String!
    email: String!
    age: Int
    bio: String
    role: UserRole
  ): User!
}
\`\`\`

### 4. 语义化命名

Mutation 的命名应该语义化，反映业务操作而非 CRUD：

\`\`\`graphql
# 好的命名
type Mutation {
  publishPost(id: ID!): Post!
  archivePost(id: ID!): Post!
  likePost(id: ID!): Post!
  followUser(id: ID!): User!
}

# 不好的命名
type Mutation {
  updatePostStatus(id: ID!, status: PostStatus!): Post!
  incrementPostLikes(id: ID!): Post!
}
\`\`\`

### 5. 细粒度 vs 粗粒度

\`\`\`graphql
# 细粒度（推荐用于简单场景）
type Mutation {
  updateUserName(id: ID!, name: String!): User!
  updateUserEmail(id: ID!, email: String!): User!
}

# 粗粒度（推荐用于复杂场景，如表单提交）
type Mutation {
  updateUser(id: ID!, input: UpdateUserInput!): User!
}
\`\`\`

---

## 乐观更新（Optimistic Update）

### 概念

乐观更新（Optimistic Update）是一种 UI 优化策略：在 Mutation 发送到服务端之前，先假设操作会成功，立即更新 UI。当服务端响应返回后，确认结果或回滚。

### 优点

1. **即时响应**：用户感觉操作立即生效，无需等待
2. **更好的用户体验**：特别是在网络较慢的情况下

### 实现示例（Apollo Client）

\`\`\`javascript
const [likePost] = useMutation(LIKE_POST, {
  optimisticResponse: {
    __typename: 'Mutation',
    likePost: {
      __typename: 'Post',
      id: postId,
      likes: post.likes + 1,
    },
  },
  update(cache, { data: { likePost } }) {
    // 用服务端返回的真实数据更新缓存
    cache.writeQuery({
      query: GET_POST,
      variables: { id: postId },
      data: { post: likePost },
    });
  },
});
\`\`\`

---

## 错误处理

### GraphQL 的错误处理

GraphQL 的 Mutation 支持两种错误处理模式：

#### 模式一：GraphQL 错误

将错误放在 errors 数组中，这是一个协议级别的错误：

\`\`\`json
{
  "data": null,
  "errors": [
    {
      "message": "Email already exists",
      "path": ["createUser"],
      "extensions": {
        "code": "EMAIL_ALREADY_EXISTS"
      }
    }
  ]
}
\`\`\`

#### 模式二：应用层错误

将错误作为 data 的一部分返回，这是一种更灵活的错误处理方式：

\`\`\`graphql
type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
}

type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UserError {
  field: String!
  message: String!
}
\`\`\`

\`\`\`json
{
  "data": {
    "createUser": {
      "user": null,
      "errors": [
        {
          "field": "email",
          "message": "Email already exists"
        }
      ]
    }
  }
}
\`\`\`

### 应用层错误的优势

1. **类型安全**：错误结构在 Schema 中定义，客户端可以类型安全地处理
2. **部分成功**：可以返回部分成功的数据
3. **更丰富的错误信息**：可以携带字段级别的错误信息

---

## 事务性

### 问题

Mutation 可能需要执行多个操作，如果其中某个操作失败，如何处理？

### 方案一：全部成功或全部失败

在 Resolver 中使用数据库事务：

\`\`\`javascript
const resolvers = {
  Mutation: {
    transferFunds: async (_, { from, to, amount }, { db }) => {
      const transaction = await db.transaction();
      try {
        await transaction.debit(from, amount);
        await transaction.credit(to, amount);
        await transaction.commit();
        return { success: true };
      } catch (error) {
        await transaction.rollback();
        return { success: false, error: error.message };
      }
    }
  }
};
\`\`\`

### 方案二：补偿操作

如果无法使用事务，可以在 Resolver 中实现补偿逻辑：

\`\`\`javascript
const resolvers = {
  Mutation: {
    createUserWithProfile: async (_, { input }, { db }) => {
      const user = await db.users.create(input.user);
      try {
        const profile = await db.profiles.create({
          ...input.profile,
          userId: user.id
        });
        return { user, profile };
      } catch (error) {
        // 补偿操作：删除已创建的用户
        await db.users.delete(user.id);
        throw new Error('Failed to create profile: ' + error.message);
      }
    }
  }
};
\`\`\`

---

## 常见 Mutation 模式

### 创建操作

\`\`\`graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    status
    createdAt
  }
}
\`\`\`

### 更新操作

\`\`\`graphql
mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
  updatePost(id: $id, input: $input) {
    id
    title
    content
    updatedAt
  }
}
\`\`\`

### 删除操作

\`\`\`graphql
mutation DeletePost($id: ID!) {
  deletePost(id: $id)
}
\`\`\`

### 嵌套创建

\`\`\`graphql
mutation CreatePostWithTags($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    tags
    author {
      id
      name
    }
  }
}
\`\`\`

---

## Mutation 最佳实践总结

1. **使用动词命名**：createXxx、updateXxx、deleteXxx、publishXxx
2. **返回变更后的对象**：让客户端可以立即获取最新数据
3. **使用 Input 类型**：组织复杂参数，提高可维护性
4. **使用变量**：避免在查询字符串中硬编码数据
5. **考虑应用层错误**：对于复杂场景，使用 Payload 模式返回错误
6. **注意执行顺序**：Mutation 是串行执行的，利用这个特性处理依赖关系
7. **实现乐观更新**：提升用户体验
8. **考虑事务性**：确保数据一致性`,
    code: `# === Schema ===
# Mutation 变更演示 - 完整的 CRUD 操作
# 包含创建、更新、删除、批量操作和错误处理

type Query {
  """
  获取所有用户
  """
  users: [User!]!

  """
  获取单个用户
  """
  user(id: ID!): User

  """
  获取所有文章
  """
  posts: [Post!]!

  """
  获取单篇文章
  """
  post(id: ID!): Post

  """
  获取所有评论
  """
  comments: [Comment!]!
}

type Mutation {
  """
  创建用户
  """
  createUser(input: CreateUserInput!): CreateUserPayload!

  """
  更新用户信息
  """
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!

  """
  删除用户
  """
  deleteUser(id: ID!): DeleteUserPayload!

  """
  创建文章
  """
  createPost(input: CreatePostInput!): CreatePostPayload!

  """
  更新文章
  """
  updatePost(id: ID!, input: UpdatePostInput!): UpdatePostPayload!

  """
  删除文章
  """
  deletePost(id: ID!): DeletePostPayload!

  """
  发布文章
  """
  publishPost(id: ID!): PublishPostPayload!

  """
  归档文章
  """
  archivePost(id: ID!): ArchivePostPayload!

  """
  点赞文章
  """
  likePost(id: ID!): LikePostPayload!

  """
  创建评论
  """
  createComment(input: CreateCommentInput!): CreateCommentPayload!

  """
  删除评论
  """
  deleteComment(id: ID!): DeleteCommentPayload!
}

type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  bio: String
  role: UserRole!
  status: AccountStatus!
  posts: [Post!]!
  postCount: Int!
  comments: [Comment!]!
  createdAt: String!
  updatedAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String
  excerpt: String
  status: PostStatus!
  tags: [String!]!
  likes: Int!
  viewCount: Int!
  author: User!
  authorId: ID!
  comments: [Comment!]!
  commentCount: Int!
  createdAt: String!
  updatedAt: String!
  publishedAt: String
}

type Comment {
  id: ID!
  text: String!
  author: User!
  authorId: ID!
  post: Post!
  postId: ID!
  createdAt: String!
}

"""
用户创建操作的返回负载
"""
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

"""
用户更新操作的返回负载
"""
type UpdateUserPayload {
  user: User
  errors: [UserError!]!
}

"""
用户删除操作的返回负载
"""
type DeleteUserPayload {
  success: Boolean!
  deletedId: ID
  errors: [UserError!]!
}

"""
文章创建操作的返回负载
"""
type CreatePostPayload {
  post: Post
  errors: [PostError!]!
}

"""
文章更新操作的返回负载
"""
type UpdatePostPayload {
  post: Post
  errors: [PostError!]!
}

"""
文章删除操作的返回负载
"""
type DeletePostPayload {
  success: Boolean!
  deletedId: ID
  errors: [PostError!]!
}

"""
文章发布操作的返回负载
"""
type PublishPostPayload {
  post: Post
  errors: [PostError!]!
}

"""
文章归档操作的返回负载
"""
type ArchivePostPayload {
  post: Post
  errors: [PostError!]!
}

"""
文章点赞操作的返回负载
"""
type LikePostPayload {
  post: Post
  errors: [PostError!]!
}

"""
评论创建操作的返回负载
"""
type CreateCommentPayload {
  comment: Comment
  errors: [CommentError!]!
}

"""
评论删除操作的返回负载
"""
type DeleteCommentPayload {
  success: Boolean!
  deletedId: ID
  errors: [CommentError!]!
}

"""
用户错误类型
"""
type UserError {
  field: String!
  message: String!
}

"""
文章错误类型
"""
type PostError {
  field: String!
  message: String!
}

"""
评论错误类型
"""
type CommentError {
  field: String!
  message: String!
}

enum UserRole {
  ADMIN
  EDITOR
  AUTHOR
  READER
}

enum AccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

input CreateUserInput {
  name: String!
  email: String!
  age: Int
  bio: String
  role: UserRole = READER
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
  bio: String
  role: UserRole
  status: AccountStatus
}

input CreatePostInput {
  title: String!
  content: String
  authorId: ID!
  tags: [String!] = []
  status: PostStatus = DRAFT
}

input UpdatePostInput {
  title: String
  content: String
  tags: [String!]
  status: PostStatus
}

input CreateCommentInput {
  text: String!
  authorId: ID!
  postId: ID!
}

# === Resolvers ===
// 演示数据 - 可变的数据集用于 Mutation 操作
var users = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 28, bio: "Full-stack developer", role: "ADMIN", status: "ACTIVE", createdAt: "2023-01-15T08:00:00Z", updatedAt: "2024-06-01T10:00:00Z" },
  { id: "2", name: "Bob", email: "bob@example.com", age: 32, bio: "Backend engineer", role: "EDITOR", status: "ACTIVE", createdAt: "2023-03-20T10:30:00Z", updatedAt: "2024-05-15T14:00:00Z" },
  { id: "3", name: "Charlie", email: "charlie@example.com", age: 25, bio: "Frontend developer", role: "AUTHOR", status: "ACTIVE", createdAt: "2023-06-10T14:00:00Z", updatedAt: "2024-04-20T09:00:00Z" },
  { id: "4", name: "Diana", email: "diana@example.com", age: 35, bio: "DevOps engineer", role: "AUTHOR", status: "INACTIVE", createdAt: "2023-09-05T16:00:00Z", updatedAt: "2024-03-10T11:00:00Z" },
  { id: "5", name: "Eve", email: "eve@example.com", age: 29, bio: "Data scientist", role: "READER", status: "ACTIVE", createdAt: "2023-11-20T09:00:00Z", updatedAt: "2024-02-28T15:00:00Z" }
];

var posts = [
  { id: "1", title: "Introduction to GraphQL", content: "GraphQL is a query language for APIs.", excerpt: "Learn GraphQL basics", status: "PUBLISHED", authorId: "1", tags: ["graphql", "api"], likes: 42, viewCount: 1520, createdAt: "2024-01-10T09:00:00Z", updatedAt: "2024-06-01T10:00:00Z", publishedAt: "2024-01-10T09:00:00Z" },
  { id: "2", title: "Advanced Schema Design", content: "Learn advanced schema design patterns.", excerpt: "Master schema design", status: "PUBLISHED", authorId: "1", tags: ["graphql", "schema"], likes: 28, viewCount: 980, createdAt: "2024-02-15T11:00:00Z", updatedAt: "2024-05-20T15:00:00Z", publishedAt: "2024-02-15T11:00:00Z" },
  { id: "3", title: "GraphQL vs REST", content: "A comprehensive comparison.", excerpt: "REST vs GraphQL", status: "DRAFT", authorId: "2", tags: ["graphql", "rest"], likes: 15, viewCount: 450, createdAt: "2024-03-01T08:30:00Z", updatedAt: "2024-05-10T12:00:00Z", publishedAt: null },
  { id: "4", title: "Building a GraphQL Server", content: "Step by step server guide.", excerpt: "Build your server", status: "ARCHIVED", authorId: "2", tags: ["graphql", "server"], likes: 33, viewCount: 1120, createdAt: "2024-04-01T07:00:00Z", updatedAt: "2024-04-05T10:00:00Z", publishedAt: "2024-04-01T07:00:00Z" }
];

var comments = [
  { id: "1", text: "Great introduction!", authorId: "2", postId: "1", createdAt: "2024-01-11T10:00:00Z" },
  { id: "2", text: "Very helpful article.", authorId: "3", postId: "1", createdAt: "2024-01-12T14:00:00Z" },
  { id: "3", text: "I learned a lot about schema design.", authorId: "3", postId: "2", createdAt: "2024-02-20T09:00:00Z" }
];

// 工具函数：生成新 ID
var nextUserId = 6;
var nextPostId = 5;
var nextCommentId = 4;

function generateId(prefix, counter) {
  return String(counter);
}

// 工具函数：验证邮箱格式
function isValidEmail(email) {
  return email.indexOf("@") !== -1 && email.indexOf(".") !== -1;
}

// 工具函数：获取当前时间
function now() {
  return new Date().toISOString();
}

const resolvers = {
  Query: {
    users: () => users,
    user: (_, args) => users.find(function(u) { return u.id === args.id; }) || null,
    posts: () => posts,
    post: (_, args) => posts.find(function(p) { return p.id === args.id; }) || null,
    comments: () => comments
  },
  Mutation: {
    createUser: (_, args) => {
      var input = args.input;
      var errors = [];

      // 验证必填字段
      if (!input.name || input.name.trim() === "") {
        errors.push({ field: "name", message: "用户名不能为空" });
      }

      // 验证邮箱格式
      if (!input.email || !isValidEmail(input.email)) {
        errors.push({ field: "email", message: "邮箱格式不正确" });
      }

      // 验证邮箱唯一性
      var emailExists = users.some(function(u) { return u.email === input.email; });
      if (emailExists) {
        errors.push({ field: "email", message: "该邮箱已被注册" });
      }

      // 验证年龄
      if (input.age !== undefined && input.age !== null) {
        if (input.age < 0 || input.age > 150) {
          errors.push({ field: "age", message: "年龄必须在 0-150 之间" });
        }
      }

      if (errors.length > 0) {
        return { user: null, errors: errors };
      }

      var newUser = {
        id: generateId("user", nextUserId),
        name: input.name.trim(),
        email: input.email.trim(),
        age: input.age || null,
        bio: input.bio || null,
        role: input.role || "READER",
        status: "ACTIVE",
        createdAt: now(),
        updatedAt: now()
      };
      nextUserId = nextUserId + 1;
      users.push(newUser);
      return { user: newUser, errors: [] };
    },

    updateUser: (_, args) => {
      var id = args.id;
      var input = args.input;
      var errors = [];
      var user = users.find(function(u) { return u.id === id; });

      if (!user) {
        errors.push({ field: "id", message: "用户不存在" });
        return { user: null, errors: errors };
      }

      // 验证邮箱
      if (input.email !== undefined) {
        if (!isValidEmail(input.email)) {
          errors.push({ field: "email", message: "邮箱格式不正确" });
        } else {
          var emailExists = users.some(function(u) { return u.email === input.email && u.id !== id; });
          if (emailExists) {
            errors.push({ field: "email", message: "该邮箱已被其他用户使用" });
          }
        }
      }

      // 验证年龄
      if (input.age !== undefined && input.age !== null) {
        if (input.age < 0 || input.age > 150) {
          errors.push({ field: "age", message: "年龄必须在 0-150 之间" });
        }
      }

      if (errors.length > 0) {
        return { user: null, errors: errors };
      }

      if (input.name !== undefined) user.name = input.name.trim();
      if (input.email !== undefined) user.email = input.email.trim();
      if (input.age !== undefined) user.age = input.age;
      if (input.bio !== undefined) user.bio = input.bio;
      if (input.role !== undefined) user.role = input.role;
      if (input.status !== undefined) user.status = input.status;
      user.updatedAt = now();

      return { user: user, errors: [] };
    },

    deleteUser: (_, args) => {
      var id = args.id;
      var errors = [];
      var index = users.findIndex(function(u) { return u.id === id; });

      if (index === -1) {
        errors.push({ field: "id", message: "用户不存在" });
        return { success: false, deletedId: null, errors: errors };
      }

      // 检查是否有文章
      var userPosts = posts.filter(function(p) { return p.authorId === id; });
      if (userPosts.length > 0) {
        errors.push({ field: "id", message: "该用户还有 " + userPosts.length + " 篇文章，请先删除文章" });
        return { success: false, deletedId: null, errors: errors };
      }

      users.splice(index, 1);
      // 同时删除该用户的评论
      comments = comments.filter(function(c) { return c.authorId !== id; });
      return { success: true, deletedId: id, errors: [] };
    },

    createPost: (_, args) => {
      var input = args.input;
      var errors = [];

      if (!input.title || input.title.trim() === "") {
        errors.push({ field: "title", message: "文章标题不能为空" });
      }

      var author = users.find(function(u) { return u.id === input.authorId; });
      if (!author) {
        errors.push({ field: "authorId", message: "作者不存在" });
      }

      if (errors.length > 0) {
        return { post: null, errors: errors };
      }

      var status = input.status || "DRAFT";
      var newPost = {
        id: generateId("post", nextPostId),
        title: input.title.trim(),
        content: input.content || null,
        excerpt: input.content ? input.content.substring(0, 100) + "..." : null,
        status: status,
        authorId: input.authorId,
        tags: input.tags || [],
        likes: 0,
        viewCount: 0,
        createdAt: now(),
        updatedAt: now(),
        publishedAt: status === "PUBLISHED" ? now() : null
      };
      nextPostId = nextPostId + 1;
      posts.push(newPost);
      return { post: newPost, errors: [] };
    },

    updatePost: (_, args) => {
      var id = args.id;
      var input = args.input;
      var errors = [];
      var post = posts.find(function(p) { return p.id === id; });

      if (!post) {
        errors.push({ field: "id", message: "文章不存在" });
        return { post: null, errors: errors };
      }

      if (input.title !== undefined && input.title.trim() === "") {
        errors.push({ field: "title", message: "文章标题不能为空" });
      }

      if (errors.length > 0) {
        return { post: null, errors: errors };
      }

      if (input.title !== undefined) post.title = input.title.trim();
      if (input.content !== undefined) {
        post.content = input.content;
        post.excerpt = input.content ? input.content.substring(0, 100) + "..." : null;
      }
      if (input.tags !== undefined) post.tags = input.tags;
      if (input.status !== undefined) {
        post.status = input.status;
        if (input.status === "PUBLISHED" && !post.publishedAt) {
          post.publishedAt = now();
        }
      }
      post.updatedAt = now();

      return { post: post, errors: [] };
    },

    deletePost: (_, args) => {
      var id = args.id;
      var errors = [];
      var index = posts.findIndex(function(p) { return p.id === id; });

      if (index === -1) {
        errors.push({ field: "id", message: "文章不存在" });
        return { success: false, deletedId: null, errors: errors };
      }

      posts.splice(index, 1);
      // 同时删除该文章下的评论
      comments = comments.filter(function(c) { return c.postId !== id; });
      return { success: true, deletedId: id, errors: [] };
    },

    publishPost: (_, args) => {
      var id = args.id;
      var errors = [];
      var post = posts.find(function(p) { return p.id === id; });

      if (!post) {
        errors.push({ field: "id", message: "文章不存在" });
        return { post: null, errors: errors };
      }

      if (post.status === "PUBLISHED") {
        errors.push({ field: "id", message: "文章已经发布过了" });
        return { post: null, errors: errors };
      }

      post.status = "PUBLISHED";
      post.publishedAt = now();
      post.updatedAt = now();
      return { post: post, errors: [] };
    },

    archivePost: (_, args) => {
      var id = args.id;
      var errors = [];
      var post = posts.find(function(p) { return p.id === id; });

      if (!post) {
        errors.push({ field: "id", message: "文章不存在" });
        return { post: null, errors: errors };
      }

      if (post.status === "ARCHIVED") {
        errors.push({ field: "id", message: "文章已经归档过了" });
        return { post: null, errors: errors };
      }

      post.status = "ARCHIVED";
      post.updatedAt = now();
      return { post: post, errors: [] };
    },

    likePost: (_, args) => {
      var id = args.id;
      var errors = [];
      var post = posts.find(function(p) { return p.id === id; });

      if (!post) {
        errors.push({ field: "id", message: "文章不存在" });
        return { post: null, errors: errors };
      }

      post.likes = post.likes + 1;
      return { post: post, errors: [] };
    },

    createComment: (_, args) => {
      var input = args.input;
      var errors = [];

      if (!input.text || input.text.trim() === "") {
        errors.push({ field: "text", message: "评论内容不能为空" });
      }

      var author = users.find(function(u) { return u.id === input.authorId; });
      if (!author) {
        errors.push({ field: "authorId", message: "评论作者不存在" });
      }

      var targetPost = posts.find(function(p) { return p.id === input.postId; });
      if (!targetPost) {
        errors.push({ field: "postId", message: "目标文章不存在" });
      }

      if (errors.length > 0) {
        return { comment: null, errors: errors };
      }

      var newComment = {
        id: generateId("comment", nextCommentId),
        text: input.text.trim(),
        authorId: input.authorId,
        postId: input.postId,
        createdAt: now()
      };
      nextCommentId = nextCommentId + 1;
      comments.push(newComment);
      return { comment: newComment, errors: [] };
    },

    deleteComment: (_, args) => {
      var id = args.id;
      var errors = [];
      var index = comments.findIndex(function(c) { return c.id === id; });

      if (index === -1) {
        errors.push({ field: "id", message: "评论不存在" });
        return { success: false, deletedId: null, errors: errors };
      }

      comments.splice(index, 1);
      return { success: true, deletedId: id, errors: [] };
    }
  },
  User: {
    posts: (parent) => posts.filter(function(p) { return p.authorId === parent.id; }),
    postCount: (parent) => posts.filter(function(p) { return p.authorId === parent.id; }).length,
    comments: (parent) => comments.filter(function(c) { return c.authorId === parent.id; })
  },
  Post: {
    author: (parent) => users.find(function(u) { return u.id === parent.authorId; }) || null,
    comments: (parent) => comments.filter(function(c) { return c.postId === parent.id; }),
    commentCount: (parent) => comments.filter(function(c) { return c.postId === parent.id; }).length
  },
  Comment: {
    author: (parent) => users.find(function(u) { return u.id === parent.authorId; }) || null,
    post: (parent) => posts.find(function(p) { return p.id === parent.postId; }) || null
  }
};

# === Query ===
# Mutation 综合演示 - 展示创建、更新、发布、点赞、删除等操作
# 注意：Mutation 是串行执行的，以下操作按顺序执行

mutation MutationDemo {
  # 1. 创建新用户
  createUser: createUser(input: {
    name: "Frank",
    email: "frank@example.com",
    age: 30,
    bio: "New GraphQL developer",
    role: AUTHOR
  }) {
    user {
      id
      name
      email
      age
      bio
      role
      createdAt
    }
    errors {
      field
      message
    }
  }

  # 2. 更新用户信息
  updateUser: updateUser(id: "1", input: {
    bio: "Senior full-stack developer and GraphQL expert"
  }) {
    user {
      id
      name
      bio
      updatedAt
    }
    errors {
      field
      message
    }
  }

  # 3. 尝试创建重复邮箱的用户（验证错误处理）
  duplicateUser: createUser(input: {
    name: "Duplicate",
    email: "alice@example.com"
  }) {
    user {
      id
    }
    errors {
      field
      message
    }
  }

  # 4. 创建新文章
  createPost: createPost(input: {
    title: "Exploring GraphQL Mutations",
    content: "In this article, we will explore how to effectively use GraphQL mutations for data modification.",
    authorId: "1",
    tags: ["graphql", "mutation", "tutorial"],
    status: PUBLISHED
  }) {
    post {
      id
      title
      status
      tags
      author {
        name
      }
      createdAt
    }
    errors {
      field
      message
    }
  }

  # 5. 发布草稿文章
  publishPost: publishPost(id: "3") {
    post {
      id
      title
      status
      publishedAt
    }
    errors {
      field
      message
    }
  }

  # 6. 点赞文章
  likePost: likePost(id: "1") {
    post {
      id
      title
      likes
    }
    errors {
      field
      message
    }
  }

  # 7. 创建评论
  createComment: createComment(input: {
    text: "This is a very comprehensive mutation tutorial!",
    authorId: "2",
    postId: "1"
  }) {
    comment {
      id
      text
      author {
        name
      }
      post {
        title
      }
      createdAt
    }
    errors {
      field
      message
    }
  }

  # 8. 归档文章
  archivePost: archivePost(id: "4") {
    post {
      id
      title
      status
    }
    errors {
      field
      message
    }
  }
}
`,
  },
];