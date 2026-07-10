// =============================================================
// GraphQL 交互式教程 - 第 3 批章节（进阶）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. gql-relations    — 关联数据与 N+1 问题
//   2. gql-subscription  — 订阅 Subscription
//   3. gql-pagination   — 分页与游标
//   4. gql-file-upload  — 文件上传与批量操作
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为"进阶"）
//   content : Markdown 格式的详细讲解
//   code    : 三段式 GraphQL 代码（Schema / Resolvers / Query）
//
// code 字段格式（三段式）：
//   # === Schema ===
//   type Query { ... }
//   # === Resolvers ===
//   const resolvers = { Query: { ... } };
//   # === Query ===
//   query { ... }
//
// 约束：
//   - 不使用 require/import，数据用字面量
//   - 不使用模板字符串 ${}
//   - 不使用单独的反引号
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：关联数据与 N+1 问题
  // =========================================================
  {
    id: "gql-relations",
    group: "进阶",
    icon: "🔗",
    title: "关联数据与 N+1 问题",
    content: `## 关联数据与 N+1 问题

在现实世界的应用中，数据从来都不是孤立存在的。用户拥有文章，文章包含评论，评论属于某个用户——这些对象之间的关联关系构成了 GraphQL 最强大的能力之一，也是最具挑战性的部分。本章将深入探讨 GraphQL 中如何处理关联数据，以及随之而来的 N+1 查询问题。

### 对象关联的基本概念

在关系型数据库中，数据通过外键（Foreign Key）建立关联。在面向对象的世界里，这种关联表现为对象之间的引用。GraphQL 的类型系统天然支持这种关联：你可以在一个类型中定义字段，其类型是另一个自定义类型。

考虑一个典型的博客系统：

- **User（用户）**：拥有多篇文章，发表多条评论
- **Post（文章）**：属于一个作者，拥有多条评论
- **Comment（评论）**：属于一个作者，隶属于一篇文章

这三种实体之间的关系是：

- User 与 Post：**一对多**（一个用户有多篇文章）
- User 与 Comment：**一对多**（一个用户有多条评论）
- Post 与 Comment：**一对多**（一篇文章有多条评论）

### 一对一关联

一对一关联是最简单的关联类型。它表示一个实体恰好与另一个实体相关联。在数据库层面，通常在任意一方表中添加外键即可。

**典型场景：**

- 用户与用户资料（Profile）：每个用户有一个资料详情
- 订单与发票（Invoice）：每个订单对应一张发票
- 员工与工位（Desk）：每个员工分配一个工位

**GraphQL Schema 定义：**

\`\`\`graphql
type User {
  id: ID!
  name: String!
  profile: Profile
}

type Profile {
  id: ID!
  bio: String
  avatar: String
  userId: ID!
  user: User
}
\`\`\`

注意这里出现了**双向关联**：User 引用 Profile，Profile 也引用 User。这在 GraphQL 中是完全合法的，但需要解析器正确处理。

**一对一关联的解析器：**

当你查询一个用户并希望同时获取其 profile 时，GraphQL 引擎会调用 User 类型的 \`profile\` 字段解析器。这个解析器负责根据当前用户的 ID 去查找对应的 Profile 数据。

解析器接收三个参数：

- **parent**（也叫 root）：父级字段的返回值，在这里就是当前 User 对象
- **args**：查询参数（如果有的话）
- **context**：全局上下文，通常包含数据库连接、认证信息等

典型的一对一关联解析器写法：

\`\`\`javascript
// User.profile 解析器
profile(parent, args, context) {
  // parent 是当前 User 对象 { id: "1", name: "Alice" }
  // 根据 parent.id 查找对应的 Profile
  return context.db.profiles.find(p => p.userId === parent.id);
}
\`\`\`

### 一对多关联

一对多关联表示一个实体拥有多个关联实体。这是最常见的关系类型。

**GraphQL Schema 定义：**

\`\`\`graphql
type User {
  id: ID!
  name: String!
  posts: [Post!]!      # 一个用户有多篇文章
  comments: [Comment!]!  # 一个用户有多条评论
}

type Post {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  author: User!         # 文章属于一个作者
  comments: [Comment!]!  # 文章有多条评论
}
\`\`\`

**解析器中的一对多查询：**

当解析 User.posts 字段时，你需要根据 parent.id 去查找所有 authorId 等于该 ID 的文章：

\`\`\`javascript
// User.posts 解析器
posts(parent, args, context) {
  return context.db.posts.filter(post => post.authorId === parent.id);
}
\`\`\`

这看起来很简单，但问题在于：如果一次查询返回了 100 个用户，并且每个用户都需要查询其 posts，那么上面的解析器会被调用 100 次，每次都执行一次数据库查询——这就是 N+1 问题的雏形。

### 多对多关联

多对多关联更加复杂。它表示两个实体之间可以互相拥有多个关联。典型的例子是：

- 文章与标签（Tag）：一篇文章可以有多个标签，一个标签下有多篇文章
- 学生与课程（Course）：一个学生选修多门课程，一门课程有多个学生
- 用户与群组（Group）：一个用户加入多个群组，一个群组有多个用户

在数据库层面，多对多关系通常通过**中间表（关联表/Junction Table）**来实现。中间表存储两边的外键，形成关联。

**GraphQL Schema 定义：**

\`\`\`graphql
type Post {
  id: ID!
  title: String!
  tags: [Tag!]!    # 多对多：文章有多个标签
}

type Tag {
  id: ID!
  name: String!
  posts: [Post!]!  # 多对多：标签下有多个文章
}
\`\`\`

**多对多解析器：**

解析 Post.tags 时，需要先查中间表找到该文章关联的标签 ID，再去查标签表：

\`\`\`javascript
// Post.tags 解析器
tags(parent, args, context) {
  // 1. 查中间表，找到该文章关联的所有标签 ID
  const tagIds = context.db.postTags
    .filter(pt => pt.postId === parent.id)
    .map(pt => pt.tagId);
  // 2. 根据标签 ID 数组查找标签
  return context.db.tags.filter(tag => tagIds.includes(tag.id));
}
\`\`\`

### 嵌套查询解析流程

理解 GraphQL 如何执行嵌套查询是掌握关联数据的关键。让我们通过一个具体的查询来追踪执行流程。

假设有以下查询：

\`\`\`graphql
query {
  users {
    id
    name
    posts {
      id
      title
      comments {
        id
        content
        author {
          id
          name
        }
      }
    }
  }
}
\`\`\`

**执行流程（自顶向下、逐层解析）：**

**第 1 层：Query.users**

GraphQL 引擎首先调用根 Query 类型的 \`users\` 解析器。这个解析器返回一个用户数组，比如 3 个用户。

**第 2 层：User.id 和 User.name**

对于每个用户，引擎调用 User 类型的 \`id\` 和 \`name\` 字段解析器。这些是标量字段，通常就是简单的属性访问（parent.id, parent.name）。

**第 3 层：User.posts**

对于每个用户，引擎调用 User 类型的 \`posts\` 解析器。这个解析器需要根据当前用户 ID 去查找属于他的文章。

**第 4 层：Post.id 和 Post.title**

对于每篇文章，引擎解析标量字段 id 和 title。

**第 5 层：Post.comments**

对于每篇文章，引擎调用 Post 类型的 \`comments\` 解析器，查找该文章下的评论。

**第 6 层：Comment.id 和 Comment.content**

对于每条评论，解析标量字段。

**第 7 层：Comment.author**

对于每条评论，调用 Comment 类型的 \`author\` 解析器，查找评论的作者。

**第 8 层：User.id 和 User.name**

对于每个评论作者，解析标量字段。

这就是完整的解析器链（Resolver Chain）。每一层都可以独立定义解析逻辑，GraphQL 引擎负责将它们串联起来。

### 理解 parent 参数的传递

解析器链中的关键概念是 **parent 参数**。每个解析器的 parent 参数都是上一级解析器的返回值。理解这个数据流至关重要：

\`\`\`
Query.users 返回: [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }]
  ↓ parent 传给 User.posts
  User.posts("1") 返回: [{ id: "101", title: "Post A", authorId: "1" }]
    ↓ parent 传给 Post.comments
    Post.comments("101") 返回: [{ id: "c1", content: "Nice!", authorId: "2" }]
      ↓ parent 传给 Comment.author
      Comment.author("c1") 返回: { id: "2", name: "Bob" }
\`\`\`

这个链条让每一层解析器都能拿到正确的上下文信息，从而正确查询关联数据。

### N+1 问题详解

**N+1 问题**是 GraphQL 开发中最重要的性能问题之一，它的名字来源于查询次数的模式：1 次根查询 + N 次关联查询。

**问题的产生：**

假设你有一个查询，获取 10 个用户及其文章：

\`\`\`graphql
query {
  users {
    name
    posts {
      title
    }
  }
}
\`\`\`

如果解析器是这样写的：

\`\`\`javascript
// User.posts 解析器（有问题的写法）
posts(parent, args, context) {
  // 每次调用都执行一次数据库查询
  return db.query("SELECT * FROM posts WHERE author_id = ?", [parent.id]);
}
\`\`\`

执行过程将是：

1. 第 1 次查询：获取所有用户 → \`SELECT * FROM users\`
2. 第 2 次查询：获取用户 1 的文章 → \`SELECT * FROM posts WHERE author_id = 1\`
3. 第 3 次查询：获取用户 2 的文章 → \`SELECT * FROM posts WHERE author_id = 2\`
4. ...
5. 第 11 次查询：获取用户 10 的文章 → \`SELECT * FROM posts WHERE author_id = 10\`

总共 **1 + 10 = 11** 次查询。如果有 100 个用户，就是 101 次查询。如果有 1000 个用户，就是 1001 次查询——这就是 N+1 问题。

**N+1 问题的本质：**

N+1 问题的根本原因在于：**解析器是逐个调用的，每个解析器独立执行数据库查询，无法利用批量查询的优势**。在传统的 REST API 中，我们通常可以写一个 JOIN 查询一次性获取所有数据。但在 GraphQL 的逐层解析模式下，每个关联字段的解析器被单独调用，每次调用都可能触发一次数据库查询。

**N+1 问题的危害：**

- **数据库压力**：大量查询同时发送到数据库，消耗连接池资源
- **延迟增加**：每次查询都有网络往返时间（RTT），总延迟 = (N+1) × RTT
- **吞吐量下降**：数据库连接被大量占用，影响其他请求
- **雪崩效应**：在高并发场景下，N+1 问题可能导致数据库崩溃

**更复杂的 N+1 场景：**

如果查询有多层嵌套，N+1 问题会呈指数级放大：

\`\`\`graphql
query {
  users {               # 1 次查询，返回 10 个用户
    posts {             # 10 次查询（每个用户查一次）
      comments {        # 每篇文章查一次评论
        author {        # 每条评论查一次作者
          name
        }
      }
    }
  }
}
\`\`\`

假设每个用户有 5 篇文章，每篇文章有 3 条评论：
- users: 1 次
- posts: 10 次
- comments: 10 × 5 = 50 次
- author: 50 × 3 = 150 次
- **总计：211 次查询**，但可以在 1 次 JOIN 查询中完成！

### DataLoader 模式

**DataLoader 是什么？**

DataLoader 是 Facebook 开源的一个 JavaScript 库，专门用于解决 GraphQL 中的 N+1 问题。它的核心思想是：**将多个独立的数据库查询合并为一次批量查询**。

DataLoader 不是 GraphQL 规范的一部分，但它是 GraphQL 生态中事实上的标准解决方案。

**DataLoader 的核心机制：**

1. **批量（Batching）**：在同一个事件循环 tick 内收集所有需要加载的 key，然后一次性发送批量查询
2. **缓存（Caching）**：在同一个请求的生命周期内，对已加载的数据进行缓存，避免重复查询

**DataLoader 的工作原理：**

DataLoader 使用 \`process.nextTick()\`（或类似的机制）来收集批量请求。当你调用 \`loader.load(key)\` 时：

1. DataLoader 不会立即执行查询，而是将 key 加入队列
2. 在同一个事件循环 tick 结束时，DataLoader 收集所有排队的 key
3. 将这些 key 去重后，一次性发送批量查询
4. 将查询结果按 key 分发回各个调用者

这个过程可以用如下图示来理解：

\`\`\`
事件循环 tick 开始
  ├── load("1")  → 加入队列
  ├── load("2")  → 加入队列
  ├── load("3")  → 加入队列
  ├── load("1")  → 已存在（去重），复用
  └── tick 结束  → 批量查询(["1","2","3"]) → 分发结果
\`\`\`

**DataLoader 的基本用法：**

\`\`\`javascript
const DataLoader = require('dataloader');

// 创建一个 DataLoader 实例
// batchLoadFn 是批量加载函数，接收一个 key 数组，返回 Promise
const userLoader = new DataLoader(async (userIds) => {
  // userIds = ["1", "2", "3", ...]
  // 一次性查询所有用户
  const users = await db.query(
    "SELECT * FROM users WHERE id IN (?)",
    [userIds]
  );
  // 必须按 userIds 的顺序返回结果
  return userIds.map(id => users.find(u => u.id === id));
});

// 使用 loader
const user1 = await userLoader.load("1");  // 加入队列
const user2 = await userLoader.load("2");  // 加入队列
const user3 = await userLoader.load("3");  // 加入队列
// 最终只执行一次数据库查询
\`\`\`

**关键点：结果顺序必须匹配**

DataLoader 要求批量加载函数返回的结果数组**必须与输入的 key 数组顺序一致**。如果某个 key 没有对应的数据，对应位置应返回 \`null\` 或 \`undefined\`。这个顺序匹配是 DataLoader 正确分发结果的基础。

**DataLoader 的缓存机制：**

DataLoader 默认在每个实例中维护一个内存缓存（使用 Map）。当同一个 key 被多次加载时，只会查询一次：

\`\`\`javascript
const user = await userLoader.load("1");   // 查询数据库
const sameUser = await userLoader.load("1"); // 命中缓存，不查询
console.log(user === sameUser); // true
\`\`\`

缓存的生命周期是 DataLoader 实例的生命周期。通常的做法是**在每个请求中创建一个新的 DataLoader 实例**，这样缓存不会跨请求污染。

**DataLoader 的缓存清除：**

有时你需要手动清除缓存，比如在同一个请求中数据被修改了：

\`\`\`javascript
// 清除单个 key 的缓存
userLoader.clear("1");

// 清除所有缓存
userLoader.clearAll();

// 用新值更新缓存
userLoader.prime("1", { id: "1", name: "Updated Name" });
\`\`\`

### 在 Context 中注入 DataLoader

在 GraphQL 服务端，标准的做法是在每个请求的 context 中注入一组 DataLoader 实例。这样所有解析器都可以使用这些 loader，而不会跨请求污染。

**创建 loader 工厂函数：**

\`\`\`javascript
// loaders.js
function createLoaders() {
  return {
    userLoader: new DataLoader(batchGetUsers),
    postLoader: new DataLoader(batchGetPosts),
    commentLoader: new DataLoader(batchGetComments),
  };
}
\`\`\`

**在 context 中注入：**

\`\`\`javascript
// server.js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    loaders: createLoaders(),  // 每个请求创建新的 loader 实例
  }),
});
\`\`\`

**在解析器中使用：**

\`\`\`javascript
// resolvers.js
const resolvers = {
  User: {
    posts(parent, args, context) {
      // 使用 DataLoader 替代直接的数据库查询
      return context.loaders.postLoader.load(parent.id);
    },
  },
  Post: {
    author(parent, args, context) {
      return context.loaders.userLoader.load(parent.authorId);
    },
  },
};
\`\`\`

**DataLoader 的完整示例：**

下面是一个包含多个 DataLoader 的完整实现思路：

\`\`\`javascript
// 为 posts 创建 loader
const postLoader = new DataLoader(async (authorIds) => {
  // 一次查询所有作者的文章
  const posts = await db.query(
    "SELECT * FROM posts WHERE author_id IN (?)",
    [authorIds]
  );
  // 按 authorId 分组
  return authorIds.map(id =>
    posts.filter(p => p.authorId === id)
  );
});

// 在 User.posts 解析器中使用
posts: (parent, args, context) => {
  return context.loaders.postLoader.load(parent.id);
}
\`\`\`

注意这个 loader 的返回不是单个对象，而是数组——因为一个作者可能有多篇文章。DataLoader 对返回类型没有限制，你可以返回任何类型。

### 关联数据的解析器链

在 GraphQL 中，解析器链是多层嵌套查询的执行基础。每个类型都可以定义自己的字段解析器，形成一条解析器链。

**解析器链的完整示例：**

考虑以下 Schema 和对应的解析器：

\`\`\`graphql
type Query {
  posts: [Post]
}

type Post {
  id: ID!
  title: String!
  author: User
  comments: [Comment]
  relatedPosts: [Post]    # 关联文章
}

type User {
  id: ID!
  name: String!
  totalPosts: Int         # 计算字段
}

type Comment {
  id: ID!
  content: String!
  author: User
  createdAt: String
}
\`\`\`

**解析器实现的关键点：**

\`\`\`javascript
const resolvers = {
  Query: {
    posts: (parent, args, context) => {
      return context.loaders.allPostsLoader.load("all");
    },
  },
  Post: {
    // 标量字段默认解析（可省略）
    id: (parent) => parent.id,
    title: (parent) => parent.title,

    // 关联字段：使用 DataLoader 批量加载
    author: (parent, args, context) => {
      return context.loaders.userLoader.load(parent.authorId);
    },
    comments: (parent, args, context) => {
      return context.loaders.commentLoader.load(parent.id);
    },

    // 自引用关联：查找同一作者的其他文章
    relatedPosts: (parent, args, context) => {
      return context.loaders.authorPostsLoader.load(parent.authorId)
        .then(posts => posts.filter(p => p.id !== parent.id));
    },
  },
  User: {
    // 计算字段：不存储在数据库中，通过计算得出
    totalPosts: (parent, args, context) => {
      return context.loaders.authorPostsLoader.load(parent.id)
        .then(posts => posts.length);
    },
  },
  Comment: {
    author: (parent, args, context) => {
      return context.loaders.userLoader.load(parent.authorId);
    },
  },
};
\`\`\`

**解析器链的执行顺序：**

当执行一个嵌套查询时，GraphQL 的执行策略是**广度优先**还是**深度优先**取决于具体的实现。大多数 GraphQL 引擎（包括 graphql-js）默认使用**深度优先**的执行策略。但无论哪种策略，解析器链的概念是一致的：每个字段的解析器接收父级解析器的返回值作为 parent 参数。

### 循环引用处理

循环引用（Circular Reference）是关联数据中一个棘手的问题。当类型 A 引用类型 B，而类型 B 又引用类型 A 时，就形成了循环引用。

**循环引用的场景：**

\`\`\`graphql
type User {
  id: ID!
  name: String!
  friends: [User!]!    # 用户的朋友也是用户
}

type Post {
  id: ID!
  title: String!
  author: User!         # 文章的作者是用户
}

type User {
  posts: [Post!]!       # 用户的文章
}
\`\`\`

这里的循环引用有两层含义：

1. **类型级别的循环**：User → Post → User（通过 author 字段）
2. **自引用**：User → User（通过 friends 字段）

**GraphQL 对待循环引用的态度：**

GraphQL 允许循环引用，因为用户查询时通常不会请求无限深度的嵌套。查询的深度由客户端决定，服务端只需要正确解析请求的字段即可。

**潜在问题：**

理论上，一个恶意客户端可以构造无限深度的查询：

\`\`\`graphql
query {
  user(id: "1") {
    friends {
      friends {
        friends {
          friends {
            friends {
              # ... 无限嵌套
            }
          }
        }
      }
    }
  }
}
\`\`\`

这种查询可以导致服务端资源耗尽，形成 DoS 攻击。

**解决方案：**

**1. 查询深度限制：**

\`\`\`javascript
// 使用 graphql-depth-limit 限制查询深度
const depthLimit = require('graphql-depth-limit');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)],  // 最多 5 层嵌套
});
\`\`\`

**2. 查询复杂度分析：**

限制查询的复杂度分数，而不是简单的深度：

\`\`\`javascript
// 使用 graphql-query-complexity
const { createComplexityRule } = require('graphql-query-complexity');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    createComplexityRule({
      maximumComplexity: 1000,
    }),
  ],
});
\`\`\`

**3. 超时机制：**

为每个查询设置超时时间，超过时间自动终止。

**4. 查询成本分析：**

在解析器执行前估算查询成本，拒绝成本过高的查询。

### 关联数据最佳实践

**1. 始终使用 DataLoader**

每个涉及关联数据加载的解析器都应该使用 DataLoader。这是解决 N+1 问题的标准方案。

**2. 为每个请求创建新的 DataLoader 实例**

避免缓存跨请求污染。在 context 中为每个请求创建新的 loader 实例。

**3. 使用 DataLoader 的 prime 方法进行预填充**

如果你在解析器链的上层已经获取了某些数据，可以用 prime 方法预填充 loader，避免下游重复查询。

**4. 注意字段级别的权限控制**

关联字段的解析器是进行权限控制的好位置。例如，用户的 email 字段可能只对本人和管理员可见：

\`\`\`javascript
email: (parent, args, context) => {
  if (context.currentUser.id === parent.id || context.currentUser.isAdmin) {
    return parent.email;
  }
  return null;
},
\`\`\`

**5. 避免过深的嵌套查询**

虽然 GraphQL 支持任意深度的嵌套，但过深的嵌套会导致性能问题。建议：

- 限制查询深度（如 5 层）
- 限制查询复杂度
- 为关联字段设置分页

**6. 使用分页处理关联字段**

对于一对多或多对多的关联字段，应该使用分页来限制返回数量：

\`\`\`graphql
type User {
  id: ID!
  posts(first: Int, after: String): PostConnection!
}
\`\`\`

**7. 合理设计 Schema 避免不必要的关联**

不要为了"完整性"而添加不必要的关联字段。每个关联字段都会增加解析器链的复杂度。

**8. 监控和日志**

记录每个解析器的执行时间，识别性能瓶颈。许多 GraphQL 工具（如 Apollo Studio）提供了逐字段的性能追踪。

**9. 考虑数据去重**

在复杂的查询中，同一数据可能被多次请求。DataLoader 的缓存机制可以解决单个请求内的去重，但跨请求的去重需要更高级的缓存策略（如 Redis 缓存）。

**10. 虚拟字段与计算字段**

并非所有字段都需要存储在数据库中。虚拟字段（如 fullName、totalPosts）可以在解析器中计算得出，减少数据冗余。

### 总结

关联数据是 GraphQL 最强大的特性之一，它让客户端可以用一个查询获取所有需要的数据。但这也是性能问题的根源。掌握 DataLoader 模式、理解解析器链、正确处理循环引用，是构建高性能 GraphQL 服务的关键技能。

记住这些核心原则：

- **N+1 问题是关联数据的天然副产品**，需要通过 DataLoader 解决
- **DataLoader 的批量 + 缓存**是事实上的标准解决方案
- **每个请求一个 DataLoader 实例**，避免跨请求污染
- **解析器链是 GraphQL 的执行基础**，理解 parent 参数是关键
- **循环引用需要防护措施**，如深度限制和复杂度分析
`,
    code: `# === Schema ===
# 定义博客系统的关联数据模型
type Query {
  # 获取所有用户
  users: [User!]!
  # 获取所有文章
  posts: [Post!]!
  # 获取单个用户
  user(id: ID!): User
  # 获取单个文章
  post(id: ID!): Post
}

# 用户类型
type User {
  id: ID!
  name: String!
  email: String!
  # 一对多关联：用户拥有多篇文章
  posts: [Post!]!
  # 一对多关联：用户拥有多条评论
  comments: [Comment!]!
  # 自引用：用户的朋友
  friends: [User!]!
  # 计算字段：文章总数
  totalPosts: Int!
  # 计算字段：评论总数
  totalComments: Int!
}

# 文章类型
type Post {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  # 多对一关联：文章属于一个作者
  author: User!
  # 一对多关联：文章有多条评论
  comments: [Comment!]!
  # 多对多关联：文章的标签
  tags: [Tag!]!
  # 计算字段：评论数量
  commentCount: Int!
}

# 评论类型
type Comment {
  id: ID!
  content: String!
  authorId: ID!
  postId: ID!
  # 多对一关联：评论属于一个作者
  author: User!
  # 多对一关联：评论属于一篇文章
  post: Post!
}

# 标签类型
type Tag {
  id: ID!
  name: String!
  # 多对多关联：标签下的文章
  posts: [Post!]!
}

# === Resolvers ===
// 模拟数据 - 不使用数据库，数据用字面量
const users = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
  { id: "3", name: "Charlie", email: "charlie@example.com" },
];

const posts = [
  { id: "101", title: "GraphQL 入门", content: "GraphQL 是一种查询语言...", authorId: "1" },
  { id: "102", title: "DataLoader 详解", content: "DataLoader 解决 N+1 问题...", authorId: "1" },
  { id: "103", title: "Node.js 性能优化", content: "优化 Node.js 应用...", authorId: "2" },
  { id: "104", title: "React 最佳实践", content: "React 开发的注意事项...", authorId: "2" },
  { id: "105", title: "TypeScript 入门", content: "TypeScript 基础教程...", authorId: "3" },
];

const comments = [
  { id: "c1", content: "写得很清晰！", authorId: "2", postId: "101" },
  { id: "c2", content: "学到了新东西", authorId: "3", postId: "101" },
  { id: "c3", content: "DataLoader 真的很重要", authorId: "1", postId: "102" },
  { id: "c4", content: "性能优化的好文章", authorId: "3", postId: "103" },
  { id: "c5", content: "React 的内容很实用", authorId: "1", postId: "104" },
];

const tags = [
  { id: "t1", name: "GraphQL" },
  { id: "t2", name: "Node.js" },
  { id: "t3", name: "React" },
  { id: "t4", name: "TypeScript" },
  { id: "t5", name: "性能优化" },
];

// 中间表 - 文章与标签的多对多关联
const postTags = [
  { postId: "101", tagId: "t1" },
  { postId: "102", tagId: "t1" },
  { postId: "102", tagId: "t2" },
  { postId: "103", tagId: "t2" },
  { postId: "103", tagId: "t5" },
  { postId: "104", tagId: "t3" },
  { postId: "105", tagId: "t4" },
];

// 模拟 DataLoader 的批量加载函数
// 在实际项目中，这些函数会一次查询数据库，返回所有需要的数据
// 这里用内存数据模拟批量加载的行为
function batchLoadUsers(userIds) {
  const result = userIds.map(function(id) {
    return users.find(function(u) { return u.id === id; }) || null;
  });
  return result;
}

function batchLoadPosts(authorIds) {
  const result = authorIds.map(function(authorId) {
    return posts.filter(function(p) { return p.authorId === authorId; });
  });
  return result;
}

function batchLoadComments(postIds) {
  const result = postIds.map(function(postId) {
    return comments.filter(function(c) { return c.postId === postId; });
  });
  return result;
}

function batchLoadTags(postIds) {
  const result = postIds.map(function(postId) {
    const tagIds = postTags
      .filter(function(pt) { return pt.postId === postId; })
      .map(function(pt) { return pt.tagId; });
    return tags.filter(function(t) { return tagIds.includes(t.id); });
  });
  return result;
}

// 解析器
const resolvers = {
  Query: {
    // 获取所有用户
    users: function() {
      return users;
    },
    // 获取所有文章
    posts: function() {
      return posts;
    },
    // 获取单个用户
    user: function(parent, args) {
      return users.find(function(u) { return u.id === args.id; }) || null;
    },
    // 获取单个文章
    post: function(parent, args) {
      return posts.find(function(p) { return p.id === args.id; }) || null;
    },
  },
  User: {
    // 一对多：用户的所有文章
    posts: function(parent) {
      return posts.filter(function(p) { return p.authorId === parent.id; });
    },
    // 一对多：用户的所有评论
    comments: function(parent) {
      return comments.filter(function(c) { return c.authorId === parent.id; });
    },
    // 自引用：用户的朋友（简化处理，返回所有其他用户）
    friends: function(parent) {
      return users.filter(function(u) { return u.id !== parent.id; });
    },
    // 计算字段：文章总数
    totalPosts: function(parent) {
      return posts.filter(function(p) { return p.authorId === parent.id; }).length;
    },
    // 计算字段：评论总数
    totalComments: function(parent) {
      return comments.filter(function(c) { return c.authorId === parent.id; }).length;
    },
  },
  Post: {
    // 多对一：文章的作者
    author: function(parent) {
      return users.find(function(u) { return u.id === parent.authorId; }) || null;
    },
    // 一对多：文章的评论
    comments: function(parent) {
      return comments.filter(function(c) { return c.postId === parent.id; });
    },
    // 多对多：文章的标签
    tags: function(parent) {
      const tagIds = postTags
        .filter(function(pt) { return pt.postId === parent.id; })
        .map(function(pt) { return pt.tagId; });
      return tags.filter(function(t) { return tagIds.includes(t.id); });
    },
    // 计算字段：评论数量
    commentCount: function(parent) {
      return comments.filter(function(c) { return c.postId === parent.id; }).length;
    },
  },
  Comment: {
    // 评论的作者
    author: function(parent) {
      return users.find(function(u) { return u.id === parent.authorId; }) || null;
    },
    // 评论所属的文章
    post: function(parent) {
      return posts.find(function(p) { return p.id === parent.postId; }) || null;
    },
  },
  Tag: {
    // 标签下的文章
    posts: function(parent) {
      const postIds = postTags
        .filter(function(pt) { return pt.tagId === parent.id; })
        .map(function(pt) { return pt.postId; });
      return posts.filter(function(p) { return postIds.includes(p.id); });
    },
  },
};

# === Query ===
# 查询所有用户及其文章、标签，演示关联数据解析与 N+1 问题
query GetUsersWithRelations {
  users {
    id
    name
    email
    posts {
      id
      title
      tags {
        id
        name
      }
      commentCount
    }
    totalPosts
    totalComments
  }
}
`,
  },

  // =========================================================
  // 第二章：订阅 Subscription
  // =========================================================
  {
    id: "gql-subscription",
    group: "进阶",
    icon: "📡",
    title: "订阅 Subscription",
    content: `## 订阅 Subscription

GraphQL 的 Subscription（订阅）是三大操作类型（Query、Mutation、Subscription）中最特殊的一个。如果说 Query 是"拉取"数据，Mutation 是"修改"数据，那么 Subscription 就是"推送"数据——它让服务端能够主动向客户端推送实时更新。

### Subscription 是什么？

Subscription 是 GraphQL 中用于实现**实时数据推送**的机制。当服务端发生特定事件时（如新消息到达、数据被修改、状态变更），订阅了该事件的客户端会实时收到通知。

**Subscription 的本质：**

Subscription 不是普通的 HTTP 请求-响应模式。它需要一个**持久化的连接**（通常是 WebSocket），服务端通过这个连接持续向客户端推送数据。从技术角度看，Subscription 是一个**响应式数据流**（Reactive Stream），客户端订阅一个流，服务端持续向这个流中推送数据。

**与 Query 和 Mutation 的对比：**

| 操作类型 | 数据流向 | 连接方式 | 触发方式 | 适用场景 |
| --- | --- | --- | --- | --- |
| Query | 客户端拉取 | HTTP POST | 客户端主动请求 | 获取初始数据 |
| Mutation | 客户端推送 | HTTP POST | 客户端主动触发 | 修改数据 |
| Subscription | 服务端推送 | WebSocket | 服务端事件触发 | 实时更新 |

### Subscription 的 Schema 定义

Subscription 在 Schema 中是一个根类型，和 Query、Mutation 并列：

\`\`\`graphql
type Subscription {
  # 订阅新消息
  messageAdded(roomId: ID!): Message
  # 订阅帖子更新
  postUpdated: Post
  # 订阅用户在线状态
  userOnline: User
  # 订阅通知
  notificationReceived(userId: ID!): Notification
}
\`\`\`

**Schema 定义要点：**

- Subscription 类型在 Schema 中作为根类型定义
- 每个字段代表一个可以订阅的事件
- 字段可以带参数（如 roomId），用于过滤特定的事件
- 返回类型是客户端将收到的数据格式
- 通常返回类型是单个对象，表示"当事件发生时，推送这个对象"

### Pub/Sub 模式

Subscription 的底层实现通常基于**发布/订阅模式**（Publish/Subscribe Pattern，简称 Pub/Sub）。

**Pub/Sub 模式的核心概念：**

1. **Publisher（发布者）**：产生事件的一方，负责发布消息
2. **Subscriber（订阅者）**：接收事件的一方，负责处理消息
3. **Channel/Topic（频道/主题）**：事件的分组标识，发布者向特定频道发布，订阅者订阅特定频道
4. **Broker（消息代理）**：管理频道和订阅关系的中介

**Pub/Sub 的工作流程：**

\`\`\`
1. Subscriber A 订阅 Channel "NEW_MESSAGE"
2. Subscriber B 订阅 Channel "NEW_MESSAGE"
3. Publisher 向 Channel "NEW_MESSAGE" 发布一条消息
4. Broker 将消息推送给 Subscriber A 和 Subscriber B
\`\`\`

**GraphQL Subscription 中的 Pub/Sub：**

在 GraphQL 中，Pub/Sub 的工作方式如下：

1. **Mutation 作为发布者**：当某个 Mutation 执行时（如创建新消息），它发布一个事件
2. **Subscription 作为订阅者**：客户端通过 Subscription 订阅该事件
3. **GraphQL 引擎作为 Broker**：管理事件的分发

**Apollo Server 中的 PubSub：**

Apollo Server 提供了内置的 \`PubSub\` 类：

\`\`\`javascript
const { PubSub } = require('apollo-server');
const pubsub = new PubSub();
\`\`\`

**发布事件：**

\`\`\`javascript
// 在 Mutation 解析器中发布事件
const resolvers = {
  Mutation: {
    addMessage: async (parent, { content }, context) => {
      const message = await createMessage(content);
      // 发布事件到 MESSAGE_ADDED 频道
      pubsub.publish('MESSAGE_ADDED', { messageAdded: message });
      return message;
    },
  },
};
\`\`\`

**订阅事件：**

\`\`\`javascript
const resolvers = {
  Subscription: {
    messageAdded: {
      // subscribe 函数返回一个 AsyncIterator
      subscribe: () => pubsub.asyncIterator(['MESSAGE_ADDED']),
    },
  },
};
\`\`\`

### 事件驱动更新

**事件驱动架构（Event-Driven Architecture）** 是 Subscription 的设计哲学。在这种架构中，系统的各个组件通过事件进行通信，而不是直接调用。

**事件驱动更新的优势：**

1. **解耦**：Mutation 不需要知道哪些 Subscription 在监听，Subscription 也不需要知道哪些 Mutation 会触发事件
2. **扩展性**：可以随时添加新的 Subscription，而不需要修改 Mutation 代码
3. **实时性**：事件产生后立即推送，无需客户端轮询
4. **灵活性**：同一个事件可以被多个 Subscription 订阅

**事件命名的最佳实践：**

为事件使用一致的命名规范很重要。推荐的命名规范：

- 使用大写字母和下划线，如 \`MESSAGE_ADDED\`、\`USER_ONLINE\`
- 使用过去式或被动语态，表示事件已经发生
- 保持事件名称的语义清晰

常见的事件命名模式：

\`\`\`
MESSAGE_ADDED     → 新消息已添加
MESSAGE_UPDATED   → 消息已更新
MESSAGE_DELETED   → 消息已删除
USER_ONLINE       → 用户上线
USER_OFFLINE      → 用户下线
POST_PUBLISHED    → 文章已发布
NOTIFICATION_RECEIVED → 通知已收到
\`\`\`

### Subscription 解析器

Subscription 的解析器与 Query 和 Mutation 的解析器不同。它返回的不是一个值，而是一个**包含 subscribe 函数的对象**。

**Subscription 解析器的结构：**

\`\`\`javascript
const resolvers = {
  Subscription: {
    messageAdded: {
      // subscribe 函数是必需的
      subscribe: (parent, args, context, info) => {
        return pubsub.asyncIterator(['MESSAGE_ADDED']);
      },
      // resolve 函数是可选的（用于数据转换）
      resolve: (payload, args, context, info) => {
        // payload 是 pubsub.publish 传递的数据
        return payload.messageAdded;
      },
    },
  },
};
\`\`\`

**subscribe 函数：**

- 接收与普通解析器相同的参数（parent, args, context, info）
- 必须返回一个 **AsyncIterator**（异步迭代器）
- AsyncIterator 是数据流的抽象，表示一个可以异步逐个获取数据的序列

**resolve 函数（可选）：**

- 用于对推送的数据进行转换或过滤
- 接收 payload 参数（pubsub.publish 传递的数据）
- 如果省略，默认返回 payload 本身

### subscribe 函数详解

subscribe 函数是 Subscription 的核心。它决定了客户端如何接收实时数据。

**subscribe 函数签名：**

\`\`\`javascript
subscribe: (parent, args, context, info) => AsyncIterator
\`\`\`

**subscribe 函数的职责：**

1. 根据 args 参数决定订阅哪个事件
2. 返回一个 AsyncIterator，客户端将从这个迭代器中获取数据
3. 可以使用 context 中的认证信息进行权限控制

**subscribe 函数的典型实现：**

\`\`\`javascript
subscribe: (parent, args, context) => {
  // 1. 权限检查
  if (!context.currentUser) {
    throw new Error('未认证');
  }

  // 2. 根据参数决定频道
  const channel = 'MESSAGE_ADDED_ROOM_' + args.roomId;

  // 3. 返回 AsyncIterator
  return pubsub.asyncIterator([channel]);
}
\`\`\`

### AsyncIterator 详解

AsyncIterator 是 JavaScript ES2018 引入的异步迭代协议。它是实现 GraphQL Subscription 数据流的基础。

**AsyncIterator 的基本概念：**

- AsyncIterator 是一个对象，提供 \`next()\` 方法
- \`next()\` 方法返回一个 Promise，该 Promise resolve 为一个 \`{ value, done }\` 对象
- 当 \`done\` 为 \`true\` 时，表示迭代结束
- 当 \`done\` 为 \`false\` 时，\`value\` 是本次迭代的值

**AsyncIterator 的基本用法：**

\`\`\`javascript
const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      async next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { done: true };
      },
    };
  },
};

// 使用 for-await-of 消费
(async () => {
  for await (const value of asyncIterable) {
    console.log(value); // 0, 1, 2
  }
})();
\`\`\`

**PubSub.asyncIterator 的实现原理：**

\`\`\`javascript
// PubSub.asyncIterator 的简化实现
class PubSub {
  constructor() {
    this.subscribers = {};
  }

  publish(channel, payload) {
    const subs = this.subscribers[channel] || [];
    subs.forEach(sub => sub(payload));
  }

  asyncIterator(channels) {
    const pullQueue = [];  // 等待数据的消费者
    const pushQueue = [];  // 等待消费的数据

    // 为每个频道注册监听器
    channels.forEach(channel => {
      if (!this.subscribers[channel]) {
        this.subscribers[channel] = [];
      }
      this.subscribers[channel].push(payload => {
        if (pullQueue.length > 0) {
          pullQueue.shift()({ value: payload, done: false });
        } else {
          pushQueue.push(payload);
        }
      });
    });

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      next() {
        return new Promise(resolve => {
          if (pushQueue.length > 0) {
            resolve({ value: pushQueue.shift(), done: false });
          } else {
            pullQueue.push(resolve);
          }
        });
      },
      return() {
        // 清理资源
        return Promise.resolve({ done: true });
      },
    };
  }
}
\`\`\`

### withFilter 过滤

\`withFilter\` 是 Apollo Server 提供的一个工具函数，用于对 Subscription 的事件进行过滤。

**为什么需要过滤？**

不是所有订阅者都需要接收所有事件。例如：

- 聊天室 A 的新消息不应该推送给聊天室 B 的用户
- 只有帖子的作者才需要接收帖子更新的通知
- 用户只接收自己的通知

**withFilter 的用法：**

\`\`\`javascript
const { withFilter } = require('apollo-server');

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        // 第一个参数：返回 AsyncIterator
        () => pubsub.asyncIterator(['MESSAGE_ADDED']),
        // 第二个参数：过滤函数
        (payload, variables, context) => {
          // payload: pubsub.publish 传递的数据
          // variables: 客户端订阅时的参数
          // context: GraphQL 上下文
          return payload.messageAdded.roomId === variables.roomId;
        },
      ),
    },
  },
};
\`\`\`

**withFilter 的工作原理：**

1. 从 AsyncIterator 中获取每个事件
2. 调用过滤函数，传入 payload、variables、context
3. 如果过滤函数返回 true，将事件推送给客户端
4. 如果返回 false，跳过该事件，继续等待下一个

**withFilter 的过滤函数参数：**

- **payload**：pubsub.publish 时传递的数据对象
- **variables**：客户端订阅时传递的参数（如 roomId）
- **context**：GraphQL 上下文，包含认证信息等

### Subscription 权限控制

Subscription 的权限控制比 Query 和 Mutation 更复杂，因为它涉及持久连接。

**权限控制的层次：**

**1. 连接级别的权限控制：**

在 WebSocket 连接建立时验证身份：

\`\`\`javascript
// Apollo Server 的 WebSocket 连接配置
const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      // connectionParams 包含客户端发送的认证信息
      const token = connectionParams.authToken;
      if (!token) {
        throw new Error('缺少认证 token');
      }
      // 验证 token，返回的数据会合并到 context 中
      const user = verifyToken(token);
      return { currentUser: user };
    },
  },
});
\`\`\`

**2. 订阅级别的权限控制：**

在 subscribe 函数中进行权限检查：

\`\`\`javascript
subscribe: (parent, args, context) => {
  // 检查用户是否有权限订阅该事件
  if (!context.currentUser) {
    throw new Error('未认证，无法订阅');
  }

  // 检查用户是否有权限订阅特定房间
  if (!isRoomMember(context.currentUser.id, args.roomId)) {
    throw new Error('你不是该房间的成员');
  }

  return pubsub.asyncIterator(['MESSAGE_ADDED_' + args.roomId]);
},
\`\`\`

**3. 事件级别的权限控制：**

使用 withFilter 在事件推送时进行过滤：

\`\`\`javascript
subscribe: withFilter(
  () => pubsub.asyncIterator(['MESSAGE_ADDED']),
  (payload, variables, context) => {
    // 只推送给有权限查看的用户
    return payload.messageAdded.roomId === variables.roomId
      && isRoomMember(context.currentUser.id, variables.roomId);
  },
),
\`\`\`

### WebSocket 传输

GraphQL Subscription 在传输层通常使用 WebSocket 协议。

**为什么需要 WebSocket？**

- HTTP 是请求-响应模式，服务端无法主动推送
- WebSocket 提供全双工通信，服务端可以随时推送数据
- WebSocket 连接是持久的，避免了频繁建立连接的开销

**WebSocket 与 GraphQL 的协议：**

Apollo 定义了一套基于 WebSocket 的 GraphQL 通信协议，包含以下消息类型：

| 消息类型 | 方向 | 说明 |
| --- | --- | --- |
| \`connection_init\` | 客户端 → 服务端 | 初始化连接 |
| \`connection_ack\` | 服务端 → 客户端 | 确认连接 |
| \`start\` | 客户端 → 服务端 | 开始订阅 |
| \`data\` | 服务端 → 客户端 | 推送数据 |
| \`stop\` | 客户端 → 服务端 | 停止订阅 |
| \`connection_terminate\` | 客户端 → 服务端 | 关闭连接 |
| \`connection_error\` | 服务端 → 客户端 | 连接错误 |

**WebSocket 连接的生命周期：**

\`\`\`
1. 客户端发起 WebSocket 连接
2. 客户端发送 connection_init 消息（携带认证信息）
3. 服务端验证后发送 connection_ack
4. 客户端发送 start 消息，开始订阅
5. 服务端有事件时发送 data 消息
6. 客户端发送 stop 消息，停止订阅
7. 客户端发送 connection_terminate，关闭连接
\`\`\`

**客户端配置（以 Apollo Client 为例）：**

\`\`\`javascript
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem('token'),
    },
  },
});

const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
});
\`\`\`

### 实时更新场景

Subscription 在以下场景中特别有用：

**1. 聊天应用：**

实时接收新消息是最典型的 Subscription 场景。用户发送消息后，房间内的所有其他用户立即收到通知。

\`\`\`graphql
subscription OnMessageAdded($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    id
    content
    sender {
      id
      name
    }
    createdAt
  }
}
\`\`\`

**2. 通知系统：**

用户收到新通知时，服务端实时推送。这包括点赞、评论、关注、系统通知等。

\`\`\`graphql
subscription OnNotification {
  notificationReceived {
    id
    type
    message
    createdAt
    read
  }
}
\`\`\`

**3. 实时仪表板：**

监控数据、统计数据的实时更新。如网站访问量、服务器 CPU 使用率、订单量等。

\`\`\`graphql
subscription OnDashboardUpdate {
  dashboardUpdated {
    totalVisitors
    activeUsers
    ordersToday
    revenue
  }
}
\`\`\`

**4. 协作编辑：**

多人同时编辑文档时，实时同步其他用户的修改。

\`\`\`graphql
subscription OnDocumentUpdated($docId: ID!) {
  documentUpdated(docId: $docId) {
    content
    lastModifiedBy {
      id
      name
    }
    version
  }
}
\`\`\`

**5. 实时位置追踪：**

外卖、打车等场景中，实时追踪骑手或司机的位置。

\`\`\`graphql
subscription OnLocationUpdated($orderId: ID!) {
  locationUpdated(orderId: $orderId) {
    latitude
    longitude
    updatedAt
  }
}
\`\`\`

### Subscription 与 Polling 对比

在 GraphQL 中，实现实时数据更新有两种主要方式：Subscription 和 Polling（轮询）。

**Polling（轮询）：**

轮询是客户端定期发送 Query 请求来获取最新数据的方式。

\`\`\`javascript
// 客户端轮询示例
setInterval(async () => {
  const { data } = await client.query({
    query: GET_NEW_MESSAGES,
    variables: { roomId: '123' },
  });
  updateUI(data);
}, 3000); // 每 3 秒查询一次
\`\`\`

**Polling 的优缺点：**

优点：
- 实现简单，不需要 WebSocket
- 兼容性好，所有 HTTP 客户端都支持
- 不需要额外的服务端基础设施

缺点：
- 延迟高：数据更新后最多需要等待一个轮询周期才能获取
- 资源浪费：即使没有新数据，也要发送请求
- 服务端压力：大量客户端频繁请求，消耗服务端资源
- 不适合高频更新场景

**Subscription 的优缺点：**

优点：
- 实时性高：事件发生后立即推送
- 节省资源：没有数据时不发送请求
- 服务端压力小：只有事件发生时才有通信
- 适合高频更新场景

缺点：
- 实现复杂：需要 WebSocket 基础设施
- 连接管理：需要处理断线重连、心跳等
- 扩展性：水平扩展时需要处理 Pub/Sub 的跨节点通信
- 调试困难：实时数据流不如请求-响应直观

**如何选择？**

| 场景 | 推荐方式 | 原因 |
| --- | --- | --- |
| 聊天应用 | Subscription | 需要实时性 |
| 通知系统 | Subscription | 事件驱动，无需轮询 |
| 实时仪表板 | Subscription | 数据频繁变化 |
| 简单数据刷新 | Polling | 实现简单，够用 |
| 低频更新（如每天一次） | Query（手动刷新） | 不需要实时 |
| 需要离线支持 | Polling | Subscription 需要持久连接 |

### 总结

Subscription 是 GraphQL 实现实时数据推送的核心机制。它基于 Pub/Sub 模式和 WebSocket 传输，让服务端能够主动推送数据给客户端。掌握 Subscription 的关键点包括：

- **理解 Pub/Sub 模式**：发布者、订阅者、频道的关系
- **掌握 subscribe 函数**：返回 AsyncIterator 是核心
- **使用 withFilter 进行过滤**：确保数据只推送给正确的客户端
- **做好权限控制**：连接级别、订阅级别、事件级别三层防护
- **选择合适的场景**：Subscription 适合实时性要求高的场景，不是所有场景都需要
`,
    code: `# === Schema ===
# 定义聊天系统的 Subscription 类型
type Query {
  # 获取聊天室消息列表
  messages(roomId: ID!): [Message!]!
  # 获取所有聊天室
  rooms: [Room!]!
}

type Mutation {
  # 发送消息
  sendMessage(roomId: ID!, content: String!, senderId: ID!): Message!
  # 用户加入房间
  joinRoom(roomId: ID!, userId: ID!): Room!
  # 用户离开房间
  leaveRoom(roomId: ID!, userId: ID!): Room!
}

type Subscription {
  # 订阅新消息
  messageAdded(roomId: ID!): Message!
  # 订阅用户加入房间
  userJoined(roomId: ID!): User!
  # 订阅用户离开房间
  userLeft(roomId: ID!): User!
  # 订阅通知
  notificationReceived: Notification!
}

# 消息类型
type Message {
  id: ID!
  content: String!
  sender: User!
  roomId: ID!
  createdAt: String!
}

# 聊天室类型
type Room {
  id: ID!
  name: String!
  members: [User!]!
  messages: [Message!]!
}

# 用户类型
type User {
  id: ID!
  name: String!
}

# 通知类型
type Notification {
  id: ID!
  type: String!
  message: String!
  createdAt: String!
}

# === Resolvers ===
// 模拟数据存储
var messages = [
  { id: "m1", content: "大家好！", senderId: "1", roomId: "r1", createdAt: "2024-01-01T10:00:00Z" },
  { id: "m2", content: "欢迎！", senderId: "2", roomId: "r1", createdAt: "2024-01-01T10:01:00Z" },
  { id: "m3", content: "有人在吗？", senderId: "3", roomId: "r1", createdAt: "2024-01-01T10:02:00Z" },
];

var users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

var rooms = [
  { id: "r1", name: "技术讨论组", memberIds: ["1", "2", "3"] },
  { id: "r2", name: "产品交流群", memberIds: ["1", "2"] },
];

// 简化的 PubSub 实现（模拟，不依赖外部库）
// 在实际项目中，会使用 Apollo Server 的 PubSub 或 Redis PubSub
var SimplePubSub = function() {
  var channels = {};

  return {
    // 发布事件到指定频道
    publish: function(channel, payload) {
      var subs = channels[channel] || [];
      subs.forEach(function(sub) {
        try {
          sub(payload);
        } catch (e) {
          // 忽略订阅者错误
        }
      });
    },

    // 创建一个 AsyncIterator 用于订阅
    asyncIterator: function(channelNames) {
      var listeners = [];
      var pullQueue = [];
      var pushQueue = [];

      channelNames.forEach(function(channel) {
        if (!channels[channel]) {
          channels[channel] = [];
        }
        var listener = function(payload) {
          if (pullQueue.length > 0) {
            var resolve = pullQueue.shift();
            resolve({ value: payload, done: false });
          } else {
            pushQueue.push(payload);
          }
        };
        listeners.push({ channel: channel, fn: listener });
        channels[channel].push(listener);
      });

      var iterator = {};
      iterator[Symbol.asyncIterator] = function() {
        return this;
      };
      iterator.next = function() {
        return new Promise(function(resolve) {
          if (pushQueue.length > 0) {
            var payload = pushQueue.shift();
            resolve({ value: payload, done: false });
          } else {
            pullQueue.push(resolve);
          }
        });
      };
      iterator.return = function() {
        // 清理监听器
        listeners.forEach(function(listener) {
          var subs = channels[listener.channel] || [];
          var idx = subs.indexOf(listener.fn);
          if (idx >= 0) {
            subs.splice(idx, 1);
          }
        });
        return Promise.resolve({ done: true });
      };

      return iterator;
    },
  };
};

var pubsub = new SimplePubSub();

// 模拟 withFilter 的功能
function withFilter(asyncIteratorFn, filterFn) {
  return {
    subscribe: function(parent, args, context) {
      var iterator = asyncIteratorFn(parent, args, context);
      var originalNext = iterator.next;
      var filteredIterator = Object.create(iterator);
      filteredIterator.next = function() {
        return originalNext.call(iterator).then(function(result) {
          if (result.done) {
            return result;
          }
          // 用过滤函数检查
          if (filterFn(result.value, args, context)) {
            return result;
          }
          // 不通过过滤，继续等待下一个
          return filteredIterator.next();
        });
      };
      return filteredIterator;
    },
  };
}

// 消息计数器
var messageCounter = 4;

// 解析器
var resolvers = {
  Query: {
    messages: function(parent, args) {
      return messages.filter(function(m) { return m.roomId === args.roomId; });
    },
    rooms: function() {
      return rooms;
    },
  },

  Mutation: {
    sendMessage: function(parent, args) {
      var newMessage = {
        id: "m" + messageCounter,
        content: args.content,
        senderId: args.senderId,
        roomId: args.roomId,
        createdAt: new Date().toISOString(),
      };
      messageCounter++;
      messages.push(newMessage);

      // 发布消息事件到对应房间的频道
      pubsub.publish("MESSAGE_ADDED_" + args.roomId, {
        messageAdded: newMessage,
      });

      return newMessage;
    },

    joinRoom: function(parent, args) {
      var room = rooms.find(function(r) { return r.id === args.roomId; });
      if (room && room.memberIds.indexOf(args.userId) === -1) {
        room.memberIds.push(args.userId);
      }
      var user = users.find(function(u) { return u.id === args.userId; });

      // 发布用户加入事件
      pubsub.publish("USER_JOINED_" + args.roomId, {
        userJoined: user,
      });

      return room;
    },

    leaveRoom: function(parent, args) {
      var room = rooms.find(function(r) { return r.id === args.roomId; });
      if (room) {
        var idx = room.memberIds.indexOf(args.userId);
        if (idx >= 0) {
          room.memberIds.splice(idx, 1);
        }
      }
      var user = users.find(function(u) { return u.id === args.userId; });

      // 发布用户离开事件
      pubsub.publish("USER_LEFT_" + args.roomId, {
        userLeft: user,
      });

      return room;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: function(parent, args) {
        return pubsub.asyncIterator(["MESSAGE_ADDED_" + args.roomId]);
      },
    },

    userJoined: {
      subscribe: function(parent, args) {
        return pubsub.asyncIterator(["USER_JOINED_" + args.roomId]);
      },
    },

    userLeft: {
      subscribe: function(parent, args) {
        return pubsub.asyncIterator(["USER_LEFT_" + args.roomId]);
      },
    },

    notificationReceived: {
      subscribe: function(parent, args) {
        return pubsub.asyncIterator(["NOTIFICATION"]);
      },
    },
  },

  Message: {
    sender: function(parent) {
      return users.find(function(u) { return u.id === parent.senderId; }) || null;
    },
  },

  Room: {
    members: function(parent) {
      var memberIds = parent.memberIds || [];
      return memberIds.map(function(id) {
        return users.find(function(u) { return u.id === id; });
      }).filter(Boolean);
    },
    messages: function(parent) {
      return messages.filter(function(m) { return m.roomId === parent.id; });
    },
  },
};

# === Query ===
# 查询聊天室 r1 的消息列表与所有房间信息
query GetChatRooms {
  messages(roomId: "r1") {
    id
    content
    sender {
      id
      name
    }
    roomId
    createdAt
  }
  rooms {
    id
    name
    members {
      id
      name
    }
  }
}
`,
  },

  // =========================================================
  // 第三章：分页与游标
  // =========================================================
  {
    id: "gql-pagination",
    group: "进阶",
    icon: "📄",
    title: "分页与游标",
    content: `## 分页与游标

当数据量很大时，一次性返回所有数据既浪费带宽又影响性能。分页（Pagination）是解决这个问题的关键技术。GraphQL 中的分页比 REST API 更加灵活和强大，尤其是 Relay 风格的游标分页（Cursor-based Pagination），已经成为 GraphQL 社区的事实标准。

### 为什么需要分页？

考虑一个简单的场景：一个博客系统有 10000 篇文章。如果客户端查询所有文章：

\`\`\`graphql
query {
  posts {
    id
    title
    content
  }
}
\`\`\`

这个查询会导致：
- 服务端从数据库加载 10000 条记录
- 通过网络传输 10000 条数据
- 客户端渲染 10000 条数据

这显然是不可接受的。分页可以将数据分割成小块，按需加载。

### 分页的两种基本模式

GraphQL 中有两种主要的分页模式：

**1. Offset-based（基于偏移量）分页：**

这是最传统的分页方式，使用 \`limit\` 和 \`offset\`（或 \`skip\`）参数。

\`\`\`graphql
type Query {
  posts(limit: Int!, offset: Int!): [Post!]!
}
\`\`\`

查询示例：

\`\`\`graphql
query {
  posts(limit: 10, offset: 0) {  # 第 1 页
    id
    title
  }
}

query {
  posts(limit: 10, offset: 10) { # 第 2 页
    id
    title
  }
}
\`\`\`

**Offset-based 分页的优缺点：**

优点：
- 实现简单，SQL 原生支持（LIMIT/OFFSET）
- 可以跳转到任意页
- 容易计算总页数

缺点：
- **插入/删除问题**：在分页过程中，如果数据被插入或删除，会导致数据重复或遗漏
- 性能问题：大偏移量时，数据库需要扫描并跳过前面的所有行
- 不支持实时数据的分页

**2. Cursor-based（基于游标）分页：**

使用游标（Cursor）来标记位置，每次请求下一页时传入上一页最后一条数据的游标。

\`\`\`graphql
type Query {
  posts(first: Int!, after: String): PostConnection!
}
\`\`\`

**Cursor-based 分页的优缺点：**

优点：
- 不受插入/删除影响：游标指向具体记录，数据变更不会导致重复或遗漏
- 性能稳定：不需要扫描跳过的行，始终使用索引查找
- 适合实时数据：游标基于数据本身，不受数据变化影响

缺点：
- 实现复杂：需要定义游标编码方案
- 不支持跳页：只能顺序翻页
- 难以计算总页数（虽然有 totalCount 字段可以解决）

### Relay 式分页（Connection 模式）

Relay 是 Facebook 开源的一个 GraphQL 客户端框架。它定义了一套分页规范，即 **Connection 模式**，已经成为 GraphQL 社区的分页标准。

**Connection 模式的核心概念：**

- **Connection（连接）**：一个包含分页信息的包装类型
- **Edge（边）**：连接中的一条数据，包含节点和游标
- **Node（节点）**：实际的数据对象
- **PageInfo（分页信息）**：包含分页状态信息

**Connection 模式的类型定义：**

\`\`\`graphql
# 连接类型
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

# 边类型
type PostEdge {
  node: Post!
  cursor: String!
}

# 分页信息
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
\`\`\`

**为什么使用 Connection 模式？**

1. **标准化**：统一的接口让客户端可以通用地处理分页
2. **游标灵活性**：cursor 可以是任意字符串，服务端可以自由选择编码方式
3. **元数据丰富**：PageInfo 提供了足够的分页判断信息
4. **扩展性**：可以在 Edge 上添加额外字段（如关联度、排序权重等）

### Connection 规范详解

**Connection 的参数：**

标准 Connection 支持以下参数组合：

| 参数组合 | 含义 | 方向 |
| --- | --- | --- |
| \`first: N\` | 获取前 N 条 | 正向 |
| \`first: N, after: cursor\` | 从 cursor 之后获取 N 条 | 正向翻页 |
| \`last: N\` | 获取后 N 条 | 反向 |
| \`last: N, before: cursor\` | 从 cursor 之前获取 N 条 | 反向翻页 |

**PageInfo 字段详解：**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| \`hasNextPage\` | Boolean! | 是否有下一页（正向） |
| \`hasPreviousPage\` | Boolean! | 是否有上一页（反向） |
| \`startCursor\` | String | 当前页第一条数据的游标 |
| \`endCursor\` | String | 当前页最后一条数据的游标 |

**算法：如何判断 hasNextPage / hasPreviousPage**

判断 hasNextPage 的标准做法是：**多请求一条数据**。如果请求 first: 10，实际查询 11 条数据：
- 如果返回了 11 条，说明有下一页（hasNextPage = true），只返回前 10 条
- 如果返回了 10 条或更少，说明没有下一页（hasNextPage = false）

同样的逻辑适用于 hasPreviousPage（使用 last 参数时）。

**Edge 的作用：**

Edge 包装了 Node 和 cursor。之所以要引入 Edge 这一层，是为了：

1. **游标与数据分离**：cursor 不属于 Node 的属性，它是分页系统的元数据
2. **扩展性**：可以在 Edge 上添加 Relation 相关字段，如推荐权重、匹配度等
3. **标准化**：统一的接口让 Relay 等客户端可以自动处理分页

### first/after/before/last 参数

这四个参数是 Connection 分页的核心控制参数。

**正向分页（Forward Pagination）：**

使用 \`first\` 和 \`after\` 进行正向翻页：

\`\`\`graphql
# 获取第一页（前 10 条）
query {
  posts(first: 10) {
    edges {
      node { id, title }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# 获取下一页（从 endCursor 之后取 10 条）
query {
  posts(first: 10, after: "cursor_10") {
    edges {
      node { id, title }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
\`\`\`

**反向分页（Backward Pagination）：**

使用 \`last\` 和 \`before\` 进行反向翻页：

\`\`\`graphql
# 获取最后 10 条
query {
  posts(last: 10) {
    edges {
      node { id, title }
      cursor
    }
    pageInfo {
      hasPreviousPage
      startCursor
    }
  }
}

# 获取上一页（从 startCursor 之前取 10 条）
query {
  posts(last: 10, before: "cursor_90") {
    edges {
      node { id, title }
      cursor
    }
    pageInfo {
      hasPreviousPage
      startCursor
    }
  }
}
\`\`\`

**参数组合规则：**

- \`first\` 和 \`last\` 不能同时使用
- \`after\` 只能与 \`first\` 配合使用
- \`before\` 只能与 \`last\` 配合使用
- 如果同时传入，服务端应该返回错误

### hasNextPage 与 hasPreviousPage

这两个字段是客户端判断是否还有更多数据的关键。

**hasNextPage 的使用场景：**

客户端根据 hasNextPage 决定是否显示"加载更多"按钮：

\`\`\`javascript
function loadMore() {
  if (pageInfo.hasNextPage) {
    fetchMore({
      variables: {
        first: 10,
        after: pageInfo.endCursor,
      },
    });
  }
}
\`\`\`

**hasPreviousPage 的使用场景：**

主要用于反向分页，如聊天记录中向上滚动加载历史消息：

\`\`\`javascript
function loadOlder() {
  if (pageInfo.hasPreviousPage) {
    fetchMore({
      variables: {
        last: 10,
        before: pageInfo.startCursor,
      },
    });
  }
}
\`\`\`

### totalCount

totalCount 不是 Connection 规范的必需字段，但它是非常实用的扩展字段。

**totalCount 的用途：**

- 显示总记录数（如"共 100 条结果"）
- 计算总页数
- 显示分页导航（如第 1/10 页）

**totalCount 的实现考量：**

计算 totalCount 可能是一个昂贵的操作，特别是在大表上。一些优化策略：

1. **缓存 totalCount**：在短时间内缓存计数结果
2. **估算**：对于非常大的数据集，使用近似计数
3. **条件计算**：只在客户端显式请求 totalCount 时才计算
4. **异步计算**：先返回分页数据，异步计算 totalCount

### 游标编码

游标（Cursor）的编码方式直接影响分页的性能和安全性。

**游标的设计原则：**

1. **不透明性**：客户端不应该解析游标的内容，游标对客户端应该是不透明的字符串
2. **唯一性**：每个游标对应唯一的数据记录
3. **稳定性**：同一记录的游标应该保持不变
4. **可排序**：游标应该支持排序比较

**游标的编码方式：**

**1. 基于 ID 的游标（简单但不够安全）：**

\`\`\`javascript
// 游标就是记录的 ID
const cursor = record.id;
\`\`\`

优点：简单直接
缺点：暴露了内部 ID，客户端可能猜测和构造游标

**2. Base64 编码的游标（推荐）：**

\`\`\`javascript
// 将 ID 或时间戳进行 Base64 编码
const cursor = Buffer.from("post:" + record.id).toString("base64");
// 解码时
const decoded = Buffer.from(cursor, "base64").toString("utf8");
const id = decoded.split(":")[1];
\`\`\`

优点：对客户端不透明，可以包含更多信息
缺点：编码后的字符串较长

**3. 基于时间戳的游标：**

\`\`\`javascript
// 对于按时间排序的数据，使用时间戳作为游标
const cursor = Buffer.from(
  JSON.stringify({ id: record.id, createdAt: record.createdAt })
).toString("base64");
\`\`\`

**4. 复合游标（支持排序）：**

\`\`\`javascript
// 组合排序字段和 ID
const cursor = Buffer.from(
  JSON.stringify({
    sortField: record.updatedAt,
    id: record.id,  // 作为 tiebreaker
  })
).toString("base64");
\`\`\`

### 分页与排序

分页和排序是紧密相关的。排序方式决定了游标的编码方式和分页的逻辑。

**按创建时间排序的分页：**

\`\`\`graphql
type Query {
  posts(
    first: Int
    after: String
    orderBy: PostOrderBy = CREATED_AT_DESC
  ): PostConnection!
}

enum PostOrderBy {
  CREATED_AT_ASC
  CREATED_AT_DESC
  TITLE_ASC
  TITLE_DESC
}
\`\`\`

**排序与游标的关系：**

当排序方式变化时，游标也需要相应调整。如果游标基于 ID，而排序方式改为按标题排序，那么基于 ID 的游标就不再有效。

**处理排序变化：**

1. 在游标中编码排序字段的值
2. 当排序方式变化时，客户端应该重新从第一页开始加载
3. 服务端在排序变化时返回空的 after（从第一页开始）

### 分页安全性

分页也可能成为安全问题的来源。

**1. 限制分页大小：**

防止客户端请求过大的一页数据：

\`\`\`javascript
const MAX_PAGE_SIZE = 100;

function validatePagination(args) {
  if (args.first && args.first > MAX_PAGE_SIZE) {
    throw new Error('first 不能超过 ' + MAX_PAGE_SIZE);
  }
  if (args.last && args.last > MAX_PAGE_SIZE) {
    throw new Error('last 不能超过 ' + MAX_PAGE_SIZE);
  }
}
\`\`\`

**2. 防止深度分页攻击：**

攻击者可能通过大量分页请求来消耗服务端资源。可以限制总偏移量：

\`\`\`javascript
const MAX_TOTAL_OFFSET = 1000;

// 在游标中编码已跳过的数量，或使用其他方式限制
\`\`\`

**3. 游标验证：**

验证游标是否合法，防止客户端构造恶意游标：

\`\`\`javascript
function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 2 || parts[0] !== "post") {
      throw new Error("无效的游标格式");
    }
    return parts[1];
  } catch (e) {
    throw new Error("游标解码失败");
  }
}
\`\`\`

### Limit-Offset 简化版

对于不需要复杂分页功能的场景，可以使用简化的 limit-offset 模式。

**简化版 Schema：**

\`\`\`graphql
type Query {
  posts(limit: Int = 10, offset: Int = 0): PostPage!
}

type PostPage {
  items: [Post!]!
  total: Int!
  hasMore: Boolean!
}
\`\`\`

**简化版 vs Connection 模式的选择：**

| 场景 | 推荐模式 |
| --- | --- |
| 后台管理系统 | Limit-Offset（需要跳页功能） |
| 移动端列表 | Connection（滚动加载） |
| 实时数据流 | Connection（游标稳定） |
| 简单 CRUD 应用 | Limit-Offset（实现简单） |
| 需要与 Relay 集成 | Connection（Relay 要求） |
| 数据频繁变化 | Connection（避免数据重复） |

### 分页的前端实现模式

**无限滚动（Infinite Scroll）：**

在移动端和社交媒体中常见的加载模式：

\`\`\`javascript
const [posts, setPosts] = useState([]);
const [endCursor, setEndCursor] = useState(null);
const [hasNextPage, setHasNextPage] = useState(false);

function loadMore() {
  const { data } = await client.query({
    query: GET_POSTS,
    variables: {
      first: 10,
      after: endCursor,
    },
  });
  setPosts([...posts, ...data.posts.edges.map(e => e.node)]);
  setEndCursor(data.posts.pageInfo.endCursor);
  setHasNextPage(data.posts.pageInfo.hasNextPage);
}
\`\`\`

**传统分页栏：**

适用于需要跳页的管理后台：

\`\`\`javascript
function PaginationBar({ total, limit, offset, onPageChange }) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      <button onClick={() => onPageChange(1)}>首页</button>
      <button onClick={() => onPageChange(currentPage - 1)}>上一页</button>
      <span>第 {currentPage} / {totalPages} 页</span>
      <button onClick={() => onPageChange(currentPage + 1)}>下一页</button>
      <button onClick={() => onPageChange(totalPages)}>末页</button>
    </div>
  );
}
\`\`\`

### 分页的边界情况与陷阱

实现分页时，有一些容易忽略的边界情况需要特别注意。

**1. 空结果集处理：**

当查询结果为空时，Connection 应该返回空 edges 数组和正确的 PageInfo：

\`\`\`javascript
// 空结果示例
{
  edges: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  totalCount: 0,
}
\`\`\`

**2. 重复游标问题：**

如果多条记录具有相同的排序值（如 created_at 相同），游标需要引入 tiebreaker（如 ID）来确保唯一性：

\`\`\`javascript
// 游标中包含排序字段和 ID 作为 tiebreaker
const cursor = Buffer.from(
  JSON.stringify({ createdAt: record.createdAt, id: record.id })
).toString("base64");
\`\`\`

**3. 并发修改问题：**

在分页过程中，数据可能被其他用户修改。例如：
- 正在浏览第 2 页时，第 1 页的某条数据被删除
- 游标指向的数据在获取下一页之前被修改了排序字段

Cursor-based 分页天然更好地处理了这些问题，因为游标指向具体记录，排序字段变化不会导致数据遗漏。

**4. 第一次请求的处理：**

当客户端第一次请求数据时，没有 cursor。此时 after 和 before 参数为 null。服务端需要正确处理这种情况：
- 不带 after 参数时，从第一条数据开始
- 不带 before 参数时，返回最后 N 条数据

\`\`\`javascript
function firstPage() {
  return fetchMore({
    variables: {
      first: 10,
      after: null,  // 第一次请求，无游标
    },
  });
}
\`\`\`

### 分页性能优化

**1. 数据库索引优化：**

Cursor-based 分页的性能高度依赖数据库索引。确保游标字段上有合适的索引：

\`\`\`sql
-- 为游标查询创建复合索引
CREATE INDEX idx_posts_created_at_id ON posts(created_at DESC, id DESC);
\`\`\`

**2. 避免 COUNT(*) 查询：**

totalCount 字段可能导致昂贵的 COUNT 查询。对于大表，可以：
- 使用估算值（如 PostgreSQL 的 EXPLAIN 估算）
- 缓存 totalCount
- 只在客户端显式请求 totalCount 时才计算

**3. 批量预加载：**

如果客户端需要多次分页请求，可以在服务端实现批量预加载策略，一次性加载更多数据并缓存在内存中。

**4. 使用 DataLoader 批量加载关联数据：**

在分页中使用 DataLoader 避免 N+1 问题。即使数据是分页返回的，关联数据（如每篇文章的作者）也应该通过 DataLoader 批量加载。

### 分页与 GraphQL 缓存

分页对 GraphQL 客户端缓存有重要影响。

**Apollo Client 的缓存策略：**

Apollo Client 使用 \`fetchMore\` 函数来处理分页，它可以与缓存集成：

\`\`\`javascript
const { data, fetchMore } = useQuery(GET_POSTS, {
  variables: { first: 10 },
});

// 加载更多数据并合并到缓存
function loadMore() {
  fetchMore({
    variables: {
      first: 10,
      after: data.posts.pageInfo.endCursor,
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev;
      return {
        posts: {
          ...fetchMoreResult.posts,
          edges: [
            ...prev.posts.edges,
            ...fetchMoreResult.posts.edges,
          ],
        },
      };
    },
  });
}
\`\`\`

**Relay 的缓存策略：**

Relay 使用全局 ID 和 Connection 规范来实现自动缓存。每个节点通过其全局 ID 被缓存，Connection 的变更通过 edges 的添加/删除来更新。

### 总结

分页是 GraphQL 中处理大数据集的核心技术。Cursor-based 分页（特别是 Relay Connection 规范）是推荐的做法，它解决了 Offset-based 分页在数据变更时的可靠性问题。关键要点：

- **Connection 模式是标准**：使用 edges/node/pageInfo 结构
- **游标应该不透明**：使用 Base64 编码，客户端不应解析
- **多查一条判断是否有下一页**：hasNextPage 的标准实现方式
- **限制分页大小**：防止客户端滥用
- **根据场景选择模式**：Connection 适合实时数据，Limit-Offset 适合需要跳页的场景
- **注意边界情况**：空结果、重复排序值、并发修改都需要妥善处理
- **性能优化**：确保数据库索引、避免不必要的 COUNT 查询
`,
    code: `# === Schema ===
# 定义分页系统 - Relay Connection 风格
type Query {
  # 获取文章列表（Connection 分页）
  posts(
    first: Int
    after: String
    last: Int
    before: String
    orderBy: PostOrderBy = CREATED_AT_DESC
  ): PostConnection!
  # 获取用户列表（简化版分页）
  users(limit: Int = 10, offset: Int = 0): UserPage!
}

# 排序枚举
enum PostOrderBy {
  CREATED_AT_ASC
  CREATED_AT_DESC
  TITLE_ASC
  TITLE_DESC
}

# Connection 类型
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

# Edge 类型
type PostEdge {
  node: Post!
  cursor: String!
}

# PageInfo 分页信息
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# 文章类型
type Post {
  id: ID!
  title: String!
  content: String!
  createdAt: String!
  authorId: ID!
}

# 简化版分页
type UserPage {
  items: [User!]!
  total: Int!
  hasMore: Boolean!
}

# 用户类型
type User {
  id: ID!
  name: String!
}

# === Resolvers ===
// 模拟数据 - 20 篇文章
var allPosts = [];
for (var i = 1; i <= 20; i++) {
  allPosts.push({
    id: String(i),
    title: "文章标题 " + i,
    content: "这是第 " + i + " 篇文章的内容。这里包含丰富的正文内容，用于演示 GraphQL 分页功能。",
    createdAt: "2024-01-" + (i < 10 ? "0" + i : i) + "T10:00:00Z",
    authorId: String((i % 3) + 1),
  });
}

// 游标编码函数
function encodeCursor(id) {
  // 将 "post:{id}" 进行 Base64 编码
  var raw = "post:" + id;
  return btoa(raw);
}

// 游标解码函数
function decodeCursor(cursor) {
  try {
    var decoded = atob(cursor);
    var parts = decoded.split(":");
    if (parts.length !== 2 || parts[0] !== "post") {
      return null;
    }
    return parts[1];
  } catch (e) {
    return null;
  }
}

// 排序函数
function sortPosts(posts, orderBy) {
  var sorted = posts.slice();
  switch (orderBy) {
    case "CREATED_AT_ASC":
      sorted.sort(function(a, b) { return a.createdAt.localeCompare(b.createdAt); });
      break;
    case "CREATED_AT_DESC":
      sorted.sort(function(a, b) { return b.createdAt.localeCompare(a.createdAt); });
      break;
    case "TITLE_ASC":
      sorted.sort(function(a, b) { return a.title.localeCompare(b.title); });
      break;
    case "TITLE_DESC":
      sorted.sort(function(a, b) { return b.title.localeCompare(a.title); });
      break;
    default:
      break;
  }
  return sorted;
}

// 构建 Connection 响应
function buildConnection(allItems, first, after, last, before) {
  var items = allItems.slice();

  // 应用 after 过滤
  if (after) {
    var afterId = decodeCursor(after);
    if (afterId) {
      var afterIndex = -1;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === afterId) {
          afterIndex = i;
          break;
        }
      }
      if (afterIndex >= 0) {
        items = items.slice(afterIndex + 1);
      }
    }
  }

  // 应用 before 过滤
  if (before) {
    var beforeId = decodeCursor(before);
    if (beforeId) {
      var beforeIndex = -1;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === beforeId) {
          beforeIndex = i;
          break;
        }
      }
      if (beforeIndex >= 0) {
        items = items.slice(0, beforeIndex);
      }
    }
  }

  var hasNextPage = false;
  var hasPreviousPage = false;
  var edges = [];

  // 正向分页
  if (first !== undefined) {
    var limit = Math.min(first, 100); // 限制最大 100
    hasNextPage = items.length > limit;
    var sliced = items.slice(0, limit);
    edges = sliced.map(function(item) {
      return { node: item, cursor: encodeCursor(item.id) };
    });
    hasPreviousPage = !!after;
  }

  // 反向分页
  if (last !== undefined) {
    var limit = Math.min(last, 100);
    hasPreviousPage = items.length > limit;
    var sliced = items.slice(-limit);
    edges = sliced.map(function(item) {
      return { node: item, cursor: encodeCursor(item.id) };
    });
    hasNextPage = !!before;
  }

  var startCursor = edges.length > 0 ? edges[0].cursor : null;
  var endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  return {
    edges: edges,
    pageInfo: {
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
      startCursor: startCursor,
      endCursor: endCursor,
    },
    totalCount: allItems.length,
  };
}

// 用户数据
var allUsers = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "David" },
  { id: "5", name: "Eve" },
  { id: "6", name: "Frank" },
  { id: "7", name: "Grace" },
  { id: "8", name: "Henry" },
  { id: "9", name: "Ivy" },
  { id: "10", name: "Jack" },
  { id: "11", name: "Kate" },
  { id: "12", name: "Leo" },
];

// 解析器
var resolvers = {
  Query: {
    posts: function(parent, args) {
      var sortedPosts = sortPosts(allPosts, args.orderBy || "CREATED_AT_DESC");
      return buildConnection(
        sortedPosts,
        args.first,
        args.after,
        args.last,
        args.before
      );
    },
    users: function(parent, args) {
      var limit = Math.min(args.limit || 10, 50);
      var offset = args.offset || 0;
      var sliced = allUsers.slice(offset, offset + limit);
      return {
        items: sliced,
        total: allUsers.length,
        hasMore: offset + limit < allUsers.length,
      };
    },
  },
};

# === Query ===
# 演示 Relay 风格游标分页与简化版分页
query GetPaginatedPosts {
  posts(first: 5, orderBy: CREATED_AT_DESC) {
    edges {
      node {
        id
        title
        content
        createdAt
        authorId
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
  users(limit: 3, offset: 0) {
    items {
      id
      name
    }
    total
    hasMore
  }
}
`,
  },

  // =========================================================
  // 第四章：文件上传与批量操作
  // =========================================================
  {
    id: "gql-file-upload",
    group: "进阶",
    icon: "📤",
    title: "文件上传与批量操作",
    content: `## 文件上传与批量操作

GraphQL 虽然以处理结构化数据著称，但它同样支持文件上传。GraphQL 文件上传规范（GraphQL Multipart Request Specification）定义了一套标准的方式，让客户端可以通过 GraphQL Mutation 上传文件。此外，批量操作（Batch Mutation）也是 GraphQL 实战中的重要课题，本章将详细讲解这两个主题。

### GraphQL 文件上传规范

GraphQL 文件上传规范（graphql-multipart-request-spec）定义了一种将文件嵌入到 GraphQL 请求中的标准方式。

**为什么需要专门的规范？**

GraphQL 的标准请求格式是 JSON。但 JSON 无法直接表示二进制文件数据。虽然可以将文件进行 Base64 编码后放入 JSON 中，但 Base64 编码会使数据体积膨胀约 33%，对于大文件来说是不可接受的。

**规范的解决方案：**

使用 \`multipart/form-data\` 格式发送请求，将 GraphQL 操作和文件数据混合在一个请求中。具体做法是：

1. 请求的 Content-Type 设置为 \`multipart/form-data\`
2. 请求体中包含一个 \`operations\` 字段，包含标准的 GraphQL 请求 JSON
3. 请求体中包含一个 \`map\` 字段，将文件映射到 GraphQL 变量
4. 请求体中的文件字段包含实际的二进制文件数据

**请求格式详解：**

一个典型的文件上传请求包含以下字段：

\`\`\`
POST /graphql
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="operations"

{
  "query": "mutation ($file: Upload!) { uploadFile(file: $file) { id url } }",
  "variables": { "file": null }
}
------FormBoundary
Content-Disposition: form-data; name="map"

{ "0": ["variables.file"] }
------FormBoundary
Content-Disposition: form-data; name="0"; filename="photo.jpg"
Content-Type: image/jpeg

<binary file data>
------FormBoundary--
\`\`\`

**字段说明：**

- **operations**：标准的 GraphQL 请求 JSON，包含 query、variables、operationName
- **map**：JSON 对象，将文件索引映射到变量路径。格式为 \`{ "文件索引": ["变量路径"] }\`
- **文件字段**：以数字索引命名的表单字段，包含实际的二进制文件数据

**map 字段的映射规则：**

\`map\` 字段是一个 JSON 对象，key 是文件在表单中的索引（字符串），value 是一个数组，包含该文件在 operations 中的变量路径。

\`\`\`json
{
  "0": ["variables.file"],
  "1": ["variables.images.0", "variables.images.1"]
}
\`\`\`

这个映射表示：
- 文件索引 0 映射到 \`variables.file\`
- 文件索引 1 映射到 \`variables.images[0]\` 和 \`variables.images[1]\`（同一个文件可以映射到多个位置）

### multipart/form-data 传输

multipart/form-data 是 HTTP 协议中用于上传文件的标准编码方式。

**multipart/form-data 的结构：**

\`\`\`
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="field1"

value1
------WebKitFormBoundary
Content-Disposition: form-data; name="field2"; filename="file.txt"
Content-Type: text/plain

file content here
------WebKitFormBoundary--
\`\`\`

**关键概念：**

- **boundary**：分隔符，用于分隔不同的表单字段。必须在 Content-Type 头中声明，且在整个请求体中不能出现在字段内容中
- **Content-Disposition**：描述字段的元数据，包括 name（字段名）和可选的 filename（文件名）
- **Content-Type**：每个文件字段可以有自己的 Content-Type

**服务端处理 multipart/form-data：**

在 Node.js 中，可以使用 \`graphql-upload\` 包来处理 multipart 请求：

\`\`\`javascript
const { graphqlUploadExpress } = require('graphql-upload');

// 在 Express 中间件中启用文件上传
app.use('/graphql', graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
\`\`\`

### Upload Scalar

\`Upload\` 是 GraphQL 文件上传规范定义的一个特殊标量类型，用于表示上传的文件。

**Upload 类型的定义：**

\`\`\`graphql
scalar Upload
\`\`\`

**Upload 类型的使用：**

\`\`\`graphql
type Mutation {
  # 上传单个文件
  uploadAvatar(file: Upload!): User!
  # 上传多个文件
  uploadPhotos(files: [Upload!]!): [Photo!]!
  # 上传文件并附带元数据
  uploadDocument(file: Upload!, title: String!, tags: [String!]!): Document!
}
\`\`\`

**Upload 标量在解析器中的值：**

当文件上传到服务端时，Upload 标量在解析器中会被解析为一个包含以下属性的对象：

\`\`\`javascript
{
  filename: "photo.jpg",           // 原始文件名
  mimetype: "image/jpeg",          // MIME 类型
  encoding: "7bit",                // 编码方式
  createReadStream: () => ReadStream, // 创建可读流的函数
}
\`\`\`

**解析器中的文件处理：**

\`\`\`javascript
const resolvers = {
  Mutation: {
    uploadAvatar: async (parent, { file }) => {
      const { createReadStream, filename, mimetype } = await file;

      // 创建文件读取流
      const stream = createReadStream();

      // 保存到本地文件系统
      const path = './uploads/' + Date.now() + '-' + filename;
      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(path);
        stream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      return { avatarUrl: '/uploads/' + path };
    },
  },
};
\`\`\`

**文件处理的核心模式：**

1. 从 file 参数中提取 createReadStream
2. 创建可读流
3. 将流写入目标位置（本地文件系统、云存储、数据库等）
4. 返回文件信息（URL、ID 等）

### 文件大小限制

限制文件大小是文件上传安全的重要一环。

**为什么要限制文件大小？**

- 防止恶意用户上传超大文件耗尽服务器存储
- 防止内存溢出（如果文件被加载到内存中）
- 控制带宽成本
- 符合业务需求（头像不需要 100MB）

**在 graphql-upload 中设置限制：**

\`\`\`javascript
app.use('/graphql', graphqlUploadExpress({
  maxFileSize: 5 * 1024 * 1024,  // 5MB
  maxFiles: 5,                     // 最多 5 个文件
}));
\`\`\`

**在解析器中验证文件大小：**

\`\`\`javascript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const resolvers = {
  Mutation: {
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename } = await file;

      // 读取文件流并检查大小
      let size = 0;
      const stream = createReadStream();

      stream.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_SIZE) {
          stream.destroy();
          throw new Error('文件大小超过限制');
        }
      });

      // ... 处理文件
    },
  },
};
\`\`\`

### 批量 Mutation

批量 Mutation 允许在一次请求中执行多个 Mutation 操作。

**GraphQL 支持两种批量 Mutation 方式：**

**1. 并行执行多个顶层 Mutation：**

\`\`\`graphql
mutation {
  createUser1: createUser(name: "Alice", email: "alice@test.com") {
    id
    name
  }
  createUser2: createUser(name: "Bob", email: "bob@test.com") {
    id
    name
  }
}
\`\`\`

注意：GraphQL 规范要求 Mutation 的顶层字段**按顺序执行**（串行），而 Query 的顶层字段可以并行执行。这是为了保证 Mutation 的副作用顺序。

**2. 批量 Mutation 输入类型：**

设计专门的 Mutation 来接收批量输入：

\`\`\`graphql
type Mutation {
  # 批量创建用户
  batchCreateUsers(input: [CreateUserInput!]!): BatchCreateUsersPayload!
}

input CreateUserInput {
  name: String!
  email: String!
}

type BatchCreateUsersPayload {
  users: [User!]!
  errors: [BatchError!]!
  successCount: Int!
  failureCount: Int!
}
\`\`\`

### 批量操作的事务性

批量操作中的事务性是一个重要的话题。当批量操作中的一部分成功、一部分失败时，如何处理？

**事务处理的策略：**

**1. 全有或全无（All-or-Nothing）：**

整个批量操作作为一个事务，如果任何一条失败，全部回滚：

\`\`\`javascript
async function batchCreateUsers(inputs) {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const results = [];
    for (const input of inputs) {
      const user = await connection.query('INSERT INTO users ...', [input]);
      results.push(user);
    }
    await connection.commit();
    return { users: results, successCount: results.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
\`\`\`

**2. 部分成功（Partial Success）：**

每条记录独立处理，成功和失败的信息一起返回：

\`\`\`javascript
async function batchCreateUsers(inputs) {
  const results = [];
  const errors = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < inputs.length; i++) {
    try {
      const user = await createUser(inputs[i]);
      results.push(user);
      successCount++;
    } catch (error) {
      errors.push({
        index: i,
        message: error.message,
        input: inputs[i],
      });
      failureCount++;
    }
  }

  return { users: results, errors, successCount, failureCount };
}
\`\`\`

**选择策略的考量：**

- 如果操作之间有依赖关系，使用全有或全无
- 如果操作之间独立，可以使用部分成功（用户体验更好）
- 考虑业务语义：批量创建用户可能允许部分成功，但批量转账应该是全有或全无

### Mutation 的 Input 类型设计

良好的 Input 类型设计是 Mutation 可维护性的关键。

**为什么使用 Input 类型？**

GraphQL 规范推荐使用 Input 类型作为 Mutation 的参数，而不是逐个传递标量参数。

**不使用 Input 类型的问题：**

\`\`\`graphql
# 不推荐：参数过多
type Mutation {
  createUser(
    name: String!
    email: String!
    age: Int
    bio: String
    avatar: String
    phone: String
    address: String
  ): User!
}
\`\`\`

**使用 Input 类型的好处：**

\`\`\`graphql
# 推荐：使用 Input 类型
type Mutation {
  createUser(input: CreateUserInput!): User!
}

input CreateUserInput {
  name: String!
  email: String!
  age: Int
  bio: String
  avatar: String
  phone: String
  address: String
}
\`\`\`

**Input 类型的优势：**

1. **可读性**：参数组织清晰，不会出现长长的参数列表
2. **可复用**：同一个 Input 类型可以在多个 Mutation 中使用
3. **可扩展**：添加新字段不需要修改 Mutation 签名
4. **客户端友好**：客户端可以定义变量对象，方便管理
5. **自文档化**：Input 类型本身就是 API 文档

**Input 类型设计原则：**

- **单一职责**：每个 Input 类型对应一个明确的业务操作
- **必填字段标注**：使用 \`!\` 标注必填字段
- **提供默认值**：为可选字段提供合理的默认值
- **嵌套 Input**：对于复杂的数据结构，使用嵌套 Input 类型
- **命名规范**：以操作名 + Input 结尾，如 \`CreateUserInput\`、\`UpdateUserInput\`

### 复杂 Mutation 实战

下面通过一个复杂的实际场景来展示 Mutation 的设计。

**场景：创建订单**

一个订单包含：用户信息、收货地址、多个商品条目、优惠券、支付方式。

**Schema 设计：**

\`\`\`graphql
type Mutation {
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
}

input CreateOrderInput {
  userId: ID!
  shippingAddress: AddressInput!
  items: [OrderItemInput!]!
  couponCode: String
  paymentMethod: PaymentMethod!
  notes: String
}

input AddressInput {
  recipientName: String!
  phone: String!
  province: String!
  city: String!
  district: String!
  detail: String!
  zipCode: String
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
  variantId: ID
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  ALIPAY
  WECHAT_PAY
}

type CreateOrderPayload {
  order: Order!
  paymentUrl: String
  estimatedDelivery: String
}
\`\`\`

**解析器实现要点：**

\`\`\`javascript
const resolvers = {
  Mutation: {
    createOrder: async (parent, { input }, context) => {
      // 1. 验证用户身份
      const user = await context.loaders.userLoader.load(input.userId);
      if (!user) throw new Error('用户不存在');

      // 2. 验证商品库存
      for (const item of input.items) {
        const product = await context.loaders.productLoader.load(item.productId);
        if (product.stock < item.quantity) {
          throw new Error('商品 ' + product.name + ' 库存不足');
        }
      }

      // 3. 计算订单金额
      const totalAmount = await calculateTotal(input.items, input.couponCode);

      // 4. 创建订单
      const order = await db.orders.create({
        userId: input.userId,
        shippingAddress: input.shippingAddress,
        items: input.items,
        totalAmount,
        status: 'PENDING',
      });

      // 5. 扣减库存
      await deductStock(input.items);

      // 6. 生成支付链接
      const paymentUrl = await createPayment(order.id, totalAmount, input.paymentMethod);

      return {
        order,
        paymentUrl,
        estimatedDelivery: calculateDeliveryDate(),
      };
    },
  },
};
\`\`\`

### 操作名与幂等性

**操作名（Operation Name）：**

在 GraphQL 中，每个操作可以有一个名称。操作名对于日志、调试和幂等性控制都很有用。

\`\`\`graphql
mutation CreateNewUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
\`\`\`

**幂等性（Idempotency）：**

幂等性是指同一个操作执行多次，结果与执行一次相同。在分布式系统中，幂等性是保证数据一致性的关键。

**Mutation 幂等性的实现方式：**

**1. 幂等键（Idempotency Key）：**

客户端为每个 Mutation 生成一个唯一的幂等键，服务端使用该键防止重复执行：

\`\`\`graphql
type Mutation {
  createPayment(input: CreatePaymentInput!, idempotencyKey: String!): Payment!
}
\`\`\`

\`\`\`javascript
const resolvers = {
  Mutation: {
    createPayment: async (parent, { input, idempotencyKey }) => {
      // 检查是否已经处理过该幂等键
      const existing = await db.payments.findOne({
        idempotencyKey: idempotencyKey,
      });
      if (existing) {
        return existing; // 返回已有结果
      }

      // 执行支付操作
      const payment = await processPayment(input);

      // 存储幂等键
      await db.payments.update(payment.id, {
        idempotencyKey: idempotencyKey,
      });

      return payment;
    },
  },
};
\`\`\`

**2. 使用确定性 ID：**

让客户端生成记录的唯一 ID，服务端使用 UPSERT 语义：

\`\`\`graphql
input CreateUserInput {
  id: ID!  # 客户端生成的唯一 ID
  name: String!
  email: String!
}
\`\`\`

**3. 条件 Mutation：**

使用条件判断来避免重复操作：

\`\`\`javascript
// 如果订单已经支付，不再重复支付
if (order.status === 'PAID') {
  return order;
}
\`\`\`

### 文件上传的安全考虑

**1. 文件类型验证：**

不要信任客户端提供的 MIME 类型，使用文件内容检测：

\`\`\`javascript
const fileType = require('file-type');

async function validateFileType(stream) {
  const type = await fileType.fromStream(stream);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(type?.mime)) {
    throw new Error('不支持的文件类型');
  }
  return type;
}
\`\`\`

**2. 文件名安全：**

防止路径遍历攻击和特殊字符：

\`\`\`javascript
const path = require('path');
const sanitize = require('sanitize-filename');

function getSafeFilename(originalName) {
  // 清理文件名
  const sanitized = sanitize(originalName);
  // 添加时间戳避免冲突
  return Date.now() + '-' + sanitized;
}
\`\`\`

**3. 病毒扫描：**

对于用户上传的文件，应该进行病毒扫描（特别是允许上传可执行文件时）。

**4. 存储配额：**

为每个用户设置存储配额，防止滥用：

\`\`\`javascript
async function checkStorageQuota(userId, fileSize) {
  const currentUsage = await db.storage.getUsage(userId);
  const quota = await db.storage.getQuota(userId);
  if (currentUsage + fileSize > quota) {
    throw new Error('存储空间不足');
  }
}
\`\`\`

### 总结

文件上传和批量操作是 GraphQL 在实战中经常遇到的需求。关键要点：

- **使用 multipart/form-data 上传文件**，遵循 graphql-multipart-request-spec 规范
- **Upload 标量**是文件上传的核心，解析器中获取文件流进行处理
- **限制文件大小和类型**，防止恶意上传
- **批量 Mutation 可以串行执行**，注意事务性处理
- **Input 类型是 Mutation 的最佳实践**，提高可维护性
- **幂等性设计**是分布式系统中 Mutation 安全性的保障
`,
    code: `# === Schema ===
# 文件上传与批量操作的 Schema
type Query {
  # 获取所有文件记录
  files: [FileInfo!]!
  # 获取单个文件
  file(id: ID!): FileInfo
}

type Mutation {
  # 上传单个文件
  uploadFile(file: Upload!): FileInfo!
  # 上传多个文件
  uploadFiles(files: [Upload!]!): [FileInfo!]!
  # 批量创建用户
  batchCreateUsers(input: BatchCreateUsersInput!): BatchCreateUsersPayload!
  # 创建订单（复杂 Mutation）
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
}

# Upload 标量
scalar Upload

# 文件信息
type FileInfo {
  id: ID!
  filename: String!
  mimetype: String!
  size: Int!
  url: String!
  uploadedAt: String!
}

# 批量创建用户
input BatchCreateUsersInput {
  users: [CreateUserInput!]!
  # 幂等键，防止重复提交
  idempotencyKey: String
}

input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

type BatchCreateUsersPayload {
  users: [User!]!
  errors: [BatchError!]!
  successCount: Int!
  failureCount: Int!
}

type BatchError {
  index: Int!
  message: String!
}

# 创建订单
input CreateOrderInput {
  userId: ID!
  items: [OrderItemInput!]!
  shippingAddress: AddressInput!
  paymentMethod: PaymentMethod!
  couponCode: String
  notes: String
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
}

input AddressInput {
  recipientName: String!
  phone: String!
  city: String!
  detail: String!
}

enum PaymentMethod {
  CREDIT_CARD
  ALIPAY
  WECHAT_PAY
}

type CreateOrderPayload {
  order: Order!
  paymentUrl: String
  estimatedDelivery: String
}

type Order {
  id: ID!
  userId: ID!
  items: [OrderItem!]!
  totalAmount: Float!
  status: String!
  createdAt: String!
}

type OrderItem {
  productId: ID!
  productName: String!
  quantity: Int!
  unitPrice: Float!
  subtotal: Float!
}

type User {
  id: ID!
  name: String!
  email: String!
  age: Int
}

# === Resolvers ===
// 模拟文件存储
var fileStore = [];
var fileIdCounter = 1;

// 模拟用户存储
var userStore = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 28 },
  { id: "2", name: "Bob", email: "bob@example.com", age: 32 },
];
var userIdCounter = 3;

// 模拟订单存储
var orderStore = [];
var orderIdCounter = 1;

// 模拟产品数据
var products = [
  { id: "p1", name: "GraphQL 实战指南", price: 59.99, stock: 100 },
  { id: "p2", name: "React 高级编程", price: 79.99, stock: 50 },
  { id: "p3", name: "Node.js 深入浅出", price: 69.99, stock: 80 },
];

// 模拟 Upload 文件对象
function createMockFile(filename, mimetype, content) {
  return {
    filename: filename,
    mimetype: mimetype,
    encoding: "7bit",
    size: content.length,
    content: content,
    createReadStream: function() {
      // 模拟返回一个可读流
      var content = this.content;
      var sent = false;
      return {
        on: function(event, callback) {
          if (event === "data" && !sent) {
            callback(Buffer.from(content, "utf-8"));
            sent = true;
          }
          if (event === "end") {
            setTimeout(callback, 0);
          }
          return this;
        },
        pipe: function(writeStream) {
          writeStream.write(Buffer.from(content, "utf-8"));
          writeStream.end();
          return writeStream;
        },
        destroy: function() {},
      };
    },
  };
}

// 幂等键存储
var idempotencyStore = {};

// 解析器
var resolvers = {
  Query: {
    files: function() {
      return fileStore;
    },
    file: function(parent, args) {
      return fileStore.find(function(f) { return f.id === args.id; }) || null;
    },
  },

  Mutation: {
    // 上传单个文件
    uploadFile: function(parent, args) {
      var file = args.file;
      // 模拟文件大小限制检查（5MB）
      var maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("文件大小超过限制，最大允许 5MB");
      }

      var newFile = {
        id: "f" + fileIdCounter,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: "/uploads/" + file.filename,
        uploadedAt: new Date().toISOString(),
      };
      fileIdCounter++;
      fileStore.push(newFile);
      return newFile;
    },

    // 上传多个文件
    uploadFiles: function(parent, args) {
      var files = args.files || [];
      var results = [];
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var newFile = {
          id: "f" + fileIdCounter,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: "/uploads/" + file.filename,
          uploadedAt: new Date().toISOString(),
        };
        fileIdCounter++;
        fileStore.push(newFile);
        results.push(newFile);
      }
      return results;
    },

    // 批量创建用户
    batchCreateUsers: function(parent, args) {
      var input = args.input;
      var users = input.users || [];
      var idempotencyKey = input.idempotencyKey;

      // 幂等性检查
      if (idempotencyKey && idempotencyStore[idempotencyKey]) {
        return idempotencyStore[idempotencyKey];
      }

      var results = [];
      var errors = [];
      var successCount = 0;
      var failureCount = 0;

      for (var i = 0; i < users.length; i++) {
        try {
          // 验证数据
          if (!users[i].name || users[i].name.trim() === "") {
            throw new Error("用户名不能为空");
          }
          if (!users[i].email || users[i].email.indexOf("@") === -1) {
            throw new Error("邮箱格式不正确");
          }

          var newUser = {
            id: String(userIdCounter),
            name: users[i].name,
            email: users[i].email,
            age: users[i].age || null,
          };
          userIdCounter++;
          userStore.push(newUser);
          results.push(newUser);
          successCount++;
        } catch (e) {
          errors.push({
            index: i,
            message: e.message,
          });
          failureCount++;
        }
      }

      var payload = {
        users: results,
        errors: errors,
        successCount: successCount,
        failureCount: failureCount,
      };

      // 存储幂等键结果
      if (idempotencyKey) {
        idempotencyStore[idempotencyKey] = payload;
      }

      return payload;
    },

    // 创建订单（复杂 Mutation）
    createOrder: function(parent, args) {
      var input = args.input;

      // 验证用户
      var user = userStore.find(function(u) { return u.id === input.userId; });
      if (!user) {
        throw new Error("用户不存在");
      }

      // 验证商品和计算金额
      var orderItems = [];
      var totalAmount = 0;

      for (var i = 0; i < input.items.length; i++) {
        var item = input.items[i];
        var product = products.find(function(p) { return p.id === item.productId; });
        if (!product) {
          throw new Error("商品 " + item.productId + " 不存在");
        }
        if (product.stock < item.quantity) {
          throw new Error("商品 " + product.name + " 库存不足");
        }

        var subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: Math.round(subtotal * 100) / 100,
        });

        // 扣减库存
        product.stock -= item.quantity;
      }

      // 应用优惠券
      if (input.couponCode === "SAVE10") {
        totalAmount = totalAmount * 0.9;
      }

      totalAmount = Math.round(totalAmount * 100) / 100;

      // 创建订单
      var newOrder = {
        id: "ord" + orderIdCounter,
        userId: input.userId,
        items: orderItems,
        totalAmount: totalAmount,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      orderIdCounter++;
      orderStore.push(newOrder);

      return {
        order: newOrder,
        paymentUrl: "/pay/" + newOrder.id + "?amount=" + totalAmount,
        estimatedDelivery: "预计 3-5 个工作日送达",
      };
    },
  },
};

# === Query ===
# 查询文件存储记录（初始为空，演示查询结构）
query GetFiles {
  files {
    id
    filename
    mimetype
    size
    url
    uploadedAt
  }
  file(id: "1") {
    id
    filename
    mimetype
    size
    url
    uploadedAt
  }
}
`,
  },
];