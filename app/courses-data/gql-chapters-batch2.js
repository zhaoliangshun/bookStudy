// =============================================================
// GraphQL 交互式教程 - 第 2 批章节（核心）
// =============================================================

export const chapters = [
  {
    id: "gql-resolvers",
    group: "核心",
    icon: "⚙️",
    title: "Resolver 解析器深入",
    content: `# Resolver 解析器深入

## 什么是 Resolver？

Resolver（解析器）是 GraphQL 服务端的核心执行单元。当客户端发送一个查询后，GraphQL 引擎会解析该查询，然后对查询中的每个字段调用对应的 resolver 函数来获取数据。可以把 resolver 理解为"每个字段的数据获取函数"——GraphQL 的类型系统定义了数据的形状，而 resolver 则定义了数据从哪里来、怎么来。

在 GraphQL 中，每个字段都可以有自己的 resolver。如果某个字段没有显式定义 resolver，GraphQL 会使用默认解析器尝试从父对象中读取同名属性。这种设计使得 resolver 可以非常灵活：你可以从数据库、REST API、缓存、文件系统甚至其他微服务中获取数据。

## Resolver 函数签名

每个 resolver 函数都接收四个参数，了解这四个参数是深入掌握 GraphQL 服务端开发的关键。这四个参数是：parent、args、context、info。

- **parent**（也叫 root 或 source）：父级字段的返回值。对于顶层查询字段，这个值是传给 rootValue 的值（通常为 undefined 或空对象）。对于嵌套字段，这个值是父字段 resolver 返回的结果。
- **args**：客户端查询时传入的参数。是一个包含了所有参数的键值对对象，参数名作为键，参数值作为值。
- **context**：一个在所有 resolver 之间共享的可变对象。每个请求都有自己的 context 实例。通常用于存放认证信息、数据库连接、数据加载器实例等。
- **info**：包含当前字段的 AST 信息和执行上下文。包括字段名、路径、返回类型、父类型、schema 元数据等。通常用于高级场景，如日志记录、权限检查、缓存策略等。

来看一个基础的 resolver 示例：

\`\`\`graphql
# 定义一个简单的 User 类型
type User {
  id: ID!
  name: String!
  email: String
}
\`\`\`\`\`\`

对应这个类型的 resolver 可以写成：

\`\`\`javascript
const resolvers = {
  User: {
    // parent 是数据库查询返回的 user 对象
    id: (parent, args, context, info) => {
      // parent 可能是 { id: 1, name: "张三", email: "zhangsan@example.com" }
      return parent.id;
    },
    name: (parent, args, context, info) => {
      return parent.name;
    },
    email: (parent, args, context, info) => {
      // 可以在这里做权限检查
      if (context.currentUser && context.currentUser.isAdmin) {
        return parent.email;
      }
      return null; // 普通用户看不到 email
    }
  }
};
\`\`\`\`\`\`

## 解析器链（Resolver Chain）

GraphQL 执行查询时是一个递归的过程。当 GraphQL 引擎解析一个查询时，它会自顶向下地遍历查询的每个字段，并为每个字段依次调用对应的 resolver。这种执行模型被称为"解析器链"。

示例：假设客户端发送了如下查询：

\`\`\`graphql
query {
  user(id: 1) {
    name
    posts {
      title
      comments {
        content
      }
    }
  }
}
\`\`\`\`\`\`

执行顺序如下：

1. 首先执行 Query.user 的 resolver，传入 parent = rootValue, args = { id: 1 }
2. user resolver 返回一个 User 对象，比如 { id: 1, name: "张三" }
3. 然后执行 User.name 的 resolver，parent 是步骤 2 返回的 User 对象
4. 接着执行 User.posts 的 resolver，parent 同样是步骤 2 返回的 User 对象
5. posts resolver 返回一个 Post 数组，比如 [{ id: 1, title: "文章1" }, { id: 2, title: "文章2" }]
6. 对每个 Post 元素，执行 Post.title 的 resolver
7. 对每个 Post 元素，执行 Post.comments 的 resolver
8. comments resolver 返回 Comment 数组
9. 对每个 Comment 元素，执行 Comment.content 的 resolver

这就是解析器链：每个字段的 resolver 都接收父字段的返回值作为 parent 参数，然后返回自己的结果，这个结果又会成为子字段 resolver 的 parent。

## 字段级解析器 vs 类型级解析器

在 GraphQL 中，有两种组织 resolver 的方式：

### 字段级解析器

为每个字段单独定义 resolver 函数。这种方式最灵活，可以对每个字段做定制化的处理。

\`\`\`javascript
const resolvers = {
  Query: {
    user: (parent, args) => { /* ... */ },
    users: (parent, args) => { /* ... */ },
    post: (parent, args) => { /* ... */ }
  },
  User: {
    fullName: (parent) => parent.firstName + " " + parent.lastName,
    age: (parent) => { /* 计算年龄 */ },
    posts: (parent, args) => { /* 查询文章 */ }
  }
};
\`\`\`\`\`\`

### 类型级解析器

如果你使用的是某些 GraphQL 服务端实现（如 Apollo Server），你可以将整个类型的 resolver 定义为一个对象返回。这种方式更简洁，适合简单的场景。

## 默认解析器

GraphQL 有一个内置的"默认解析器"。当你没有为某个字段显式定义 resolver 时，GraphQL 引擎会尝试从 parent 对象中读取与字段名相同的属性。这意味着如果你从数据库查询返回的对象已经包含了所有需要的字段，你通常不需要为这些简单字段写 resolver。

\`\`\`javascript
// 源数据
const userFromDB = { id: 1, name: "张三", email: "zhangsan@example.com" };
\`\`\`\`\`\`

如果 User 类型的三个字段 id、name、email 都没有显式定义 resolver，GraphQL 会自动从 userFromDB 对象中读取同名属性。只有当字段名与数据源属性名不一致，或者需要计算/转换时，才需要定义 resolver。

\`\`\`javascript
const resolvers = {
  User: {
    // 不需要为 id、name、email 写 resolver，默认解析器会处理
    // 但 fullName 需要自定义，因为源数据中没有这个字段
    fullName: (parent) => parent.firstName + " " + parent.lastName
  }
};
\`\`\`\`\`\`

## 异步解析器（Promise）

绝大多数真实场景中，resolver 都需要访问数据库、调用外部 API 或执行 I/O 操作，这些操作都是异步的。GraphQL 完全支持异步 resolver——只要你的 resolver 返回一个 Promise，GraphQL 引擎会自动等待 Promise 解析完成后再继续执行。

\`\`\`javascript
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      // 异步从数据库查询用户
      const user = await context.db.findUserById(args.id);
      return user;
    },
    posts: async (parent, args, context) => {
      // 异步从 REST API 获取文章列表
      const response = await fetch("https://api.example.com/posts");
      const posts = await response.json();
      return posts;
    }
  },
  User: {
    posts: async (parent, args, context) => {
      // parent 是上面 Query.user 返回的 user 对象
      const posts = await context.db.findPostsByUserId(parent.id);
      return posts;
    }
  }
};
\`\`\`\`\`\`

重要的一点：GraphQL 会并行执行同一层级的异步 resolver。例如，如果你查询了 user 的 name、email 和 posts，这三个字段的 resolver 会同时执行，而不是串行等待。这大大提升了查询性能。

## Resolver 中的错误处理

在 resolver 中处理错误有两种方式：

### 抛出错误

最简单的方式是直接抛出错误。GraphQL 会捕获这个错误，并将其作为 errors 数组的一部分返回给客户端。响应的 data 字段中，出错的字段会被设为 null。

\`\`\`javascript
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const user = await context.db.findUserById(args.id);
      if (!user) {
        throw new Error("用户不存在");
      }
      return user;
    }
  }
};
\`\`\`\`\`\`

### 返回包含错误的结果

更好的方式是使用 GraphQLError 或在结果中附加错误信息。这样你可以提供更丰富的错误上下文。

\`\`\`javascript
import { GraphQLError } from "graphql";

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const user = await context.db.findUserById(args.id);
      if (!user) {
        throw new GraphQLError("用户不存在", {
          extensions: {
            code: "USER_NOT_FOUND",
            userId: args.id
          }
        });
      }
      return user;
    }
  }
};
\`\`\`\`\`\`

## N+1 问题

N+1 问题是 GraphQL 开发中最常见的性能陷阱。当一个查询返回 N 个对象，而每个对象又需要触发一个额外的查询来获取关联数据时，就会产生 N+1 次数据库查询。

例如，查询所有用户及其文章：

\`\`\`graphql
query {
  users {
    name
    posts {
      title
    }
  }
}
\`\`\`\`\`\`

如果 users 查询返回了 100 个用户，User.posts 的 resolver 会对每个用户分别执行一次数据库查询，总共就是 1 + 100 = 101 次查询！

解决方案是使用 DataLoader（数据加载器）。DataLoader 是 Facebook 开源的一个工具，它可以将多次独立的数据库查询合并为一次批量查询。

\`\`\`javascript
import DataLoader from "dataloader";

// 创建批量加载函数
const batchGetPostsByUserIds = async (userIds) => {
  // 一次性查询所有用户的所有文章
  const posts = await db.findPostsByUserIds(userIds);
  // 将文章按 userId 分组返回
  return userIds.map(id => posts.filter(p => p.userId === id));
};

// 创建 DataLoader 实例
const postsLoader = new DataLoader(batchGetPostsByUserIds);

const resolvers = {
  Query: {
    users: async (parent, args, context) => {
      return await context.db.findAllUsers();
    }
  },
  User: {
    posts: (parent, args, context) => {
      // 使用 DataLoader 而不是直接查询数据库
      return context.loaders.postsLoader.load(parent.id);
    }
  }
};
\`\`\`\`\`\`

DataLoader 还有缓存功能：在同一个请求中，如果多次加载同一个 key，DataLoader 只会执行一次查询，后续请求会返回缓存的结果。

## Context 上下文对象

context 是每个 GraphQL 请求独有的共享对象，在所有 resolver 之间传递。它通常用于存放：

- 认证信息（当前用户、token）
- 数据库连接或 ORM 实例
- DataLoader 实例
- 请求级别的缓存
- 日志记录器

\`\`\`javascript
// 服务端创建 context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // 从请求头中解析 token
    const token = req.headers.authorization || "";
    // 验证 token 并获取用户信息
    const currentUser = await getUserFromToken(token);
    return {
      currentUser,
      db: databaseConnection,
      loaders: {
        postsLoader: new DataLoader(batchGetPostsByUserIds),
        commentsLoader: new DataLoader(batchGetCommentsByPostIds)
      }
    };
  }
});
\`\`\`\`\`\`

## Info 参数（AST 信息）

info 参数提供了当前字段的详细元信息，包括 AST（抽象语法树）节点。通过 info 可以获取：

- 字段名：info.fieldName
- 返回类型：info.returnType
- 父类型：info.parentType
- 字段的子选择集：info.fieldNodes[0].selectionSet
- 路径：info.path

info 参数在高级场景中非常有用，例如：

**查询优化**：通过检查子选择集，只查询数据库中被请求的字段，而不是查询所有字段。

\`\`\`javascript
const resolvers = {
  Query: {
    users: async (parent, args, context, info) => {
      // 根据 info 获取客户端实际请求的字段
      const requestedFields = getRequestedFields(info);
      // 只查询数据库中被请求的字段
      return await context.db.findUsers({ select: requestedFields });
    }
  }
};
\`\`\`\`\`\`

**权限检查**：根据字段路径判断用户是否有权限访问。

\`\`\`javascript
const resolvers = {
  User: {
    email: (parent, args, context, info) => {
      if (!context.currentUser || context.currentUser.role !== "admin") {
        throw new GraphQLError("无权访问 email 字段", {
          extensions: { code: "FORBIDDEN", field: info.fieldName }
        });
      }
      return parent.email;
    }
  }
};
\`\`\`\`\`\`

## Resolver 组织结构

随着项目规模增长，resolver 数量也会快速增长。良好的组织结构至关重要。以下是推荐的几种方式：

### 按类型拆分文件

\`\`\`
resolvers/
  ├── index.js          # 合并所有 resolver
  ├── Query.js          # 所有 Query 字段的 resolver
  ├── Mutation.js       # 所有 Mutation 字段的 resolver
  ├── User.js           # User 类型字段的 resolver
  ├── Post.js           # Post 类型字段的 resolver
  └── Comment.js        # Comment 类型字段的 resolver
\`\`\`\`\`\`

### 使用 lodash 的 merge 合并

\`\`\`javascript
import { merge } from "lodash";
import Query from "./Query";
import Mutation from "./Mutation";
import User from "./User";
import Post from "./Post";

export default merge({}, Query, Mutation, User, Post);
\`\`\`\`\`\`

### 按功能模块拆分

\`\`\`
modules/
  ├── user/
  │   ├── user.graphql
  │   ├── user.resolvers.js
  │   └── user.model.js
  ├── post/
  │   ├── post.graphql
  │   ├── post.resolvers.js
  │   └── post.model.js
  └── comment/
      ├── comment.graphql
      ├── comment.resolvers.js
      └── comment.model.js
\`\`\`\`\`\`

## Resolver 测试

Resolver 作为纯函数（或返回 Promise 的函数），非常适合单元测试。

\`\`\`javascript
// 测试 Query.user resolver
describe("Query.user", () => {
  it("应该根据 id 返回用户", async () => {
    const mockContext = {
      db: {
        findUserById: jest.fn().mockResolvedValue({ id: 1, name: "张三" })
      }
    };
    const result = await resolvers.Query.user(
      null,               // parent
      { id: 1 },         // args
      mockContext,        // context
      {}                 // info
    );
    expect(result).toEqual({ id: 1, name: "张三" });
    expect(mockContext.db.findUserById).toHaveBeenCalledWith(1);
  });

  it("用户不存在时应抛出错误", async () => {
    const mockContext = {
      db: {
        findUserById: jest.fn().mockResolvedValue(null)
      }
    };
    await expect(
      resolvers.Query.user(null, { id: 999 }, mockContext, {})
    ).rejects.toThrow("用户不存在");
  });
});
\`\`\`\`\`\`

## Resolver 最佳实践

1. **保持 resolver 简洁**：每个 resolver 只做一件事。复杂逻辑抽取到独立的 service 或 model 层。
2. **使用 DataLoader 避免 N+1**：对于任何关联查询，优先使用 DataLoader 进行批量处理。
3. **合理使用 context**：不要将 context 当作全局变量滥用。只放入请求级别需要的共享数据。
4. **async/await 优于 Promise.then**：提高代码可读性。
5. **错误信息清晰**：抛出有意义的错误信息，包含足够的上下文以便调试。
6. **性能监控**：在 resolver 中添加日志或使用 APM 工具监控执行时间。
7. **避免过度获取**：利用 info 参数只查询客户端实际需要的字段。
8. **测试覆盖**：为每个 resolver 编写单元测试，确保边界情况被覆盖。

## Resolver 中间件模式

在实际项目中，你可能会希望在多个 resolver 中执行相同的逻辑，比如日志记录、性能监控、权限检查等。这时可以使用"resolver 中间件"模式。

### 什么是 Resolver 中间件？

Resolver 中间件是一个函数，它接收原始的 resolver 函数，返回一个新的 resolver 函数。新的 resolver 函数可以在调用原始 resolver 之前或之后执行额外的逻辑。

\`\`\`javascript
// 日志中间件
function withLogging(resolver) {
  return async function(parent, args, context, info) {
    const startTime = Date.now();
    console.log("[Resolver] 开始执行:", info.fieldName);
    try {
      const result = await resolver(parent, args, context, info);
      const duration = Date.now() - startTime;
      console.log("[Resolver] 执行完成:", info.fieldName, "耗时:", duration, "ms");
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("[Resolver] 执行失败:", info.fieldName, "耗时:", duration, "ms", "错误:", error.message);
      throw error;
    }
  };
}

// 权限检查中间件
function withAuth(resolver, requiredRole) {
  return function(parent, args, context, info) {
    if (!context.currentUser) {
      throw new Error("未登录，请先登录");
    }
    if (requiredRole && context.currentUser.role !== requiredRole) {
      throw new Error("权限不足，需要 " + requiredRole + " 角色");
    }
    return resolver(parent, args, context, info);
  };
}

// 使用中间件
const resolvers = {
  Query: {
    user: withLogging(withAuth(
      async (parent, args, context) => {
        return await context.db.findUserById(args.id);
      },
      "ADMIN"
    ))
  }
};
\`\`\`\`\`\`

### 中间件链

你可以将多个中间件组合成一个链，每个中间件依次处理请求。

\`\`\`javascript
// 组合多个中间件
function composeMiddlewares(...middlewares) {
  return function(resolver) {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      resolver
    );
  };
}

const enhancedResolver = composeMiddlewares(
  withLogging,
  (r) => withAuth(r, "ADMIN"),
  withTiming
)(originalResolver);
\`\`\`\`\`\`

## Resolver 中的 Null 处理

GraphQL 的类型系统对 null 有明确的语义。理解 null 在 resolver 中的行为非常重要。

### 字段级别的 Null

当一个字段的 resolver 返回 null 时，有两种情况：
- 如果字段类型是非空（Non-Null，如 \`String!\`），null 会向上传播到父级字段
- 如果字段类型是可空（如 \`String\`），null 就是该字段的合法值

\`\`\`graphql
type User {
  id: ID!       # 不能为 null
  name: String!  # 不能为 null，如果 resolver 返回 null，user 字段本身也会变为 null
  email: String  # 可以为 null
}
\`\`\`\`\`\`

### Null 传播规则

当非空字段返回 null 时，错误会沿着响应树向上传播，直到遇到一个可空的父字段。这是 GraphQL 的"null 传播"规则。

\`\`\`javascript
const resolvers = {
  User: {
    name: (parent) => {
      // 如果 name 为 null 或 undefined
      // 由于 User.name 是 String!，整个 user 对象在响应中会变为 null
      return parent.name || null;
    },
    email: (parent) => {
      // email 是 String（可空），返回 null 是合法的
      // 只有 email 字段为 null，不影响 user 的其他字段
      return parent.email || null;
    }
  }
};
\`\`\`\`\`\`

### 列表中的 Null

当 resolver 返回一个列表时，列表中的某个元素可以是 null（如果元素类型是可空的）。但如果元素类型是非空的，null 元素会导致整个列表变为 null。

\`\`\`graphql
type Query {
  users: [User!]!   # 列表本身不能为 null，列表元素也不能为 null
  posts: [Post]      # 列表可以为 null，列表元素也可以为 null
}
\`\`\`\`\`\`

## Resolver 返回类型详解

每个 resolver 可以返回不同类型的数据，GraphQL 引擎会根据类型定义进行相应的处理。

### 返回标量值

标量类型（Int、Float、String、Boolean、ID）的 resolver 返回对应的 JavaScript 原始值。

\`\`\`javascript
const resolvers = {
  User: {
    id: (parent) => parent.id,           // 返回字符串
    age: (parent) => parent.age,         // 返回数字
    isActive: (parent) => parent.active, // 返回布尔值
    name: (parent) => parent.name        // 返回字符串
  }
};
\`\`\`\`\`\`

### 返回对象

对象类型字段的 resolver 返回一个 JavaScript 对象。这个对象会作为子字段 resolver 的 parent 参数。

\`\`\`javascript
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      // 返回一个对象，该对象会传给 User 类型的字段 resolver
      return {
        id: args.id,
        name: "张三",
        email: "zhangsan@example.com"
      };
    }
  }
};
\`\`\`\`\`\`

### 返回列表

列表字段的 resolver 返回一个数组。GraphQL 引擎会遍历数组中的每个元素，对每个元素执行子字段的 resolver。

\`\`\`javascript
const resolvers = {
  Query: {
    users: () => {
      return [
        { id: "1", name: "张三" },
        { id: "2", name: "李四" },
        { id: "3", name: "王五" }
      ];
    }
  }
};
\`\`\`\`\`\`

### 返回 Promise

几乎所有的 resolver 都可以返回 Promise。GraphQL 引擎会等待所有 Promise 解析完成后再组装响应。

\`\`\`javascript
const resolvers = {
  Query: {
    user: (parent, args) => {
      // 返回 Promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ id: args.id, name: "张三" });
        }, 100);
      });
    }
  }
};
\`\`\`\`\`\`

## Resolver 性能优化技巧

### 1. 避免串行等待

GraphQL 默认会并行执行同一层级的 resolver。但如果你在 resolver 中使用了 await，要确保不会不必要地阻塞并行执行。

\`\`\`javascript
// 不好的做法：串行执行
const resolvers = {
  Query: {
    dashboard: async (parent, args, context) => {
      const users = await context.db.getUsers();
      const posts = await context.db.getPosts();
      const stats = await context.db.getStats();
      return { users, posts, stats };
    }
  }
};

// 好的做法：并行执行
const resolvers = {
  Query: {
    dashboard: async (parent, args, context) => {
      const [users, posts, stats] = await Promise.all([
        context.db.getUsers(),
        context.db.getPosts(),
        context.db.getStats()
      ]);
      return { users, posts, stats };
    }
  }
};
\`\`\`\`\`\`

### 2. 结果缓存

对于不经常变化的数据，可以在 resolver 中添加缓存层。

\`\`\`javascript
const resolvers = {
  Query: {
    popularPosts: async (parent, args, context) => {
      const cacheKey = "popular_posts";
      const cached = await context.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      const posts = await context.db.getPopularPosts();
      await context.cache.set(cacheKey, posts, { ttl: 300 }); // 缓存 5 分钟
      return posts;
    }
  }
};
\`\`\`\`\`\`

### 3. 减少不必要的字段查询

利用 info 参数，只查询客户端实际请求的字段。

\`\`\`javascript
const resolvers = {
  Query: {
    users: async (parent, args, context, info) => {
      const requestedFields = extractFields(info);
      const dbQuery = {};
      if (requestedFields.includes("posts")) {
        dbQuery.include = { posts: true };
      }
      if (requestedFields.includes("comments")) {
        dbQuery.include = Object.assign(dbQuery.include || {}, { comments: true });
      }
      return await context.db.users.findMany(dbQuery);
    }
  }
};
\`\`\`\`\`\`

## Resolver 测试模式进阶

除了基本的单元测试，resolver 测试还应该覆盖以下场景：

### 集成测试

使用真实的 schema 来执行查询，测试整个 resolver 链。

\`\`\`javascript
import { graphql } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({ typeDefs, resolvers });

describe("集成测试", () => {
  it("应该正确执行完整的查询链", async () => {
    const query = \`
      query {
        user(id: "1") {
          name
          posts {
            title
          }
        }
      }
    \`;
    const result = await graphql({
      schema,
      source: query,
      contextValue: { db: mockDatabase }
    });
    expect(result.errors).toBeUndefined();
    expect(result.data.user.name).toBe("张三");
  });
});
\`\`\`\`\`\`

### 错误场景测试

确保边界情况和错误场景都被覆盖。

\`\`\`javascript
describe("错误场景", () => {
  it("数据库连接失败时应返回友好错误", async () => {
    const mockContext = {
      db: {
        findUserById: jest.fn().mockRejectedValue(new Error("数据库连接超时"))
      }
    };
    await expect(
      resolvers.Query.user(null, { id: "1" }, mockContext, {})
    ).rejects.toThrow("数据库连接超时");
  });

  it("传入无效 ID 时应返回适当错误", async () => {
    const result = await resolvers.Query.user(null, { id: "" }, {}, {});
    expect(result).toBeNull();
  });

  it("并发请求时 DataLoader 应正确批量处理", async () => {
    const mockBatchFn = jest.fn().mockResolvedValue(["post1", "post2"]);
    const loader = new DataLoader(mockBatchFn);
    const [r1, r2] = await Promise.all([
      loader.load("user1"),
      loader.load("user2")
    ]);
    expect(mockBatchFn).toHaveBeenCalledTimes(1);
    expect(mockBatchFn).toHaveBeenCalledWith(["user1", "user2"]);
  });
});
\`\`\`\`\`\`

## 小结

Resolver 是 GraphQL 服务端的核心。理解 resolver 的四个参数（parent、args、context、info）是掌握 GraphQL 后端开发的基础。解析器链的执行模型决定了数据如何从根字段逐层向下传递。默认解析器简化了简单字段的处理，而 DataLoader 解决了 N+1 性能问题。Context 提供了请求级别的数据共享，info 参数则为高级优化提供了可能。中间件模式让横切关注点的处理更加优雅，null 处理规则确保了类型安全，性能优化技巧则保证了服务的高效运行。良好的 resolver 组织结构和测试策略是大型项目成功的关键。`,
    code: `# === Schema ===
type Query {
  user(id: ID!): User
  users: [User!]!
  post(id: ID!): Post
  posts(limit: Int, offset: Int): [Post!]!
  searchUsers(keyword: String!): [User!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String, email: String): User!
  deleteUser(id: ID!): Boolean!
}

type User {
  id: ID!
  name: String!
  email: String
  age: Int
  posts: [Post!]!
  commentCount: Int!
  fullName: String!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  likeCount: Int!
  publishedAt: String!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: String!
}

# === Resolvers ===
const users = [
  { id: "1", name: "张三", email: "zhangsan@example.com", age: 28, createdAt: "2024-01-15" },
  { id: "2", name: "李四", email: "lisi@example.com", age: 35, createdAt: "2024-03-20" },
  { id: "3", name: "王五", email: "wangwu@example.com", age: 22, createdAt: "2024-06-10" }
];

const posts = [
  { id: "101", title: "GraphQL 入门指南", content: "GraphQL 是一个强大的查询语言...", userId: "1", likeCount: 42, publishedAt: "2024-02-01" },
  { id: "102", title: "Resolver 深入理解", content: "解析器是 GraphQL 的核心概念...", userId: "1", likeCount: 28, publishedAt: "2024-04-15" },
  { id: "103", title: "React 与 GraphQL 集成", content: "使用 Apollo Client 可以轻松集成...", userId: "2", likeCount: 15, publishedAt: "2024-05-20" },
  { id: "104", title: "GraphQL 性能优化", content: "通过 DataLoader 解决 N+1 问题...", userId: "3", likeCount: 36, publishedAt: "2024-06-01" }
];

const comments = [
  { id: "c1", content: "讲解得非常清晰！", userId: "2", postId: "101", createdAt: "2024-02-05" },
  { id: "c2", content: "期待更多内容", userId: "3", postId: "101", createdAt: "2024-02-06" },
  { id: "c3", content: "Resolvers 部分讲得很好", userId: "1", postId: "102", createdAt: "2024-04-16" },
  { id: "c4", content: "Apollo Client 确实好用", userId: "1", postId: "103", createdAt: "2024-05-21" },
  { id: "c5", content: "DataLoader 是关键", userId: "2", postId: "104", createdAt: "2024-06-02" },
  { id: "c6", content: "性能优化建议很实用", userId: "3", postId: "104", createdAt: "2024-06-03" }
];

const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
      const user = users.find(function(u) { return u.id === args.id; });
      if (!user) {
        throw new Error("用户不存在: " + args.id);
      }
      return user;
    },
    users: (parent, args, context, info) => {
      return users;
    },
    post: (parent, args, context, info) => {
      const post = posts.find(function(p) { return p.id === args.id; });
      if (!post) {
        throw new Error("文章不存在: " + args.id);
      }
      return post;
    },
    posts: (parent, args, context, info) => {
      let result = posts.slice();
      if (args.limit) {
        result = result.slice(args.offset || 0, (args.offset || 0) + args.limit);
      }
      return result;
    },
    searchUsers: (parent, args, context, info) => {
      const keyword = args.keyword.toLowerCase();
      return users.filter(function(u) {
        return u.name.toLowerCase().indexOf(keyword) !== -1 ||
               u.email.toLowerCase().indexOf(keyword) !== -1;
      });
    }
  },
  Mutation: {
    createUser: (parent, args, context, info) => {
      const newUser = {
        id: String(users.length + 1),
        name: args.name,
        email: args.email,
        age: null,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      return newUser;
    },
    updateUser: (parent, args, context, info) => {
      const user = users.find(function(u) { return u.id === args.id; });
      if (!user) {
        throw new Error("用户不存在: " + args.id);
      }
      if (args.name !== undefined) user.name = args.name;
      if (args.email !== undefined) user.email = args.email;
      return user;
    },
    deleteUser: (parent, args, context, info) => {
      const index = users.findIndex(function(u) { return u.id === args.id; });
      if (index === -1) return false;
      users.splice(index, 1);
      return true;
    }
  },
  User: {
    fullName: (parent, args, context, info) => {
      return parent.name + " (ID: " + parent.id + ")";
    },
    posts: (parent, args, context, info) => {
      return posts.filter(function(p) { return p.userId === parent.id; });
    },
    commentCount: (parent, args, context, info) => {
      const userPosts = posts.filter(function(p) { return p.userId === parent.id; });
      const postIds = userPosts.map(function(p) { return p.id; });
      const count = comments.filter(function(c) { return postIds.indexOf(c.postId) !== -1; }).length;
      return count;
    }
  },
  Post: {
    author: (parent, args, context, info) => {
      return users.find(function(u) { return u.id === parent.userId; });
    },
    comments: (parent, args, context, info) => {
      return comments.filter(function(c) { return c.postId === parent.id; });
    }
  },
  Comment: {
    author: (parent, args, context, info) => {
      return users.find(function(u) { return u.id === parent.userId; });
    },
    post: (parent, args, context, info) => {
      return posts.find(function(p) { return p.id === parent.postId; });
    }
  }
};

# === Query ===
# 查询单个用户及其文章和评论
query {
  user(id: "1") {
    id
    name
    email
    age
    fullName
    createdAt
    commentCount
    posts {
      id
      title
      likeCount
      comments {
        content
        author {
          name
        }
      }
    }
  }
}`,
  },
  {
    id: "gql-fragments",
    group: "核心",
    icon: "🧩",
    title: "片段 Fragments",
    content: `# 片段 Fragments

## 什么是 Fragment？

Fragment（片段）是 GraphQL 中一个非常强大的特性，它允许你将一组字段定义为一个可复用的单元。当一个查询需要在多处使用相同的字段集合时，fragment 可以让你避免重复定义，保持查询的简洁和可维护性。

Fragment 本质上是一段可复用的字段选择集。你可以把 fragment 理解为"字段选择集的模板"——定义一次，到处使用。

## Fragment 的基本语法

Fragment 使用 \`fragment\` 关键字定义，需要指定一个名称和它适用的类型。基本语法如下：

\`\`\`graphql
fragment FragmentName on TypeName {
  field1
  field2
  field3
  nestedField {
    subField1
    subField2
  }
}
\`\`\`\`\`\`

使用 fragment 时，通过 \`...\` 展开语法（Fragment Spread）将其应用到查询中：

\`\`\`graphql
query {
  user(id: 1) {
    ...FragmentName
  }
}
\`\`\`\`\`\`

## Fragment 的简单示例

假设我们有一个 User 类型，包含 id、name、email、avatar、bio 等字段。在多个查询中，我们都需要获取用户的 id、name 和 avatar 这三个字段。如果不使用 fragment，每次都要重复写这三个字段：

\`\`\`graphql
query GetUser {
  user(id: 1) {
    id
    name
    avatar
    email    # 这个查询额外需要 email
  }
}

query ListUsers {
  users {
    id
    name
    avatar
    bio      # 这个查询额外需要 bio
  }
}
\`\`\`\`\`\`

使用 fragment 优化后：

\`\`\`graphql
fragment UserProfile on User {
  id
  name
  avatar
}

query GetUser {
  user(id: 1) {
    ...UserProfile
    email
  }
}

query ListUsers {
  users {
    ...UserProfile
    bio
  }
}
\`\`\`\`\`\`

这样，当 UserProfile 的基础字段需要变更时（比如新增一个 nickname 字段），只需修改 fragment 定义即可，所有使用该 fragment 的查询都会自动更新。

## 命名片段（Named Fragment）

命名片段是最常用的 fragment 形式。它有一个明确的名称，可以在查询中多次引用。

\`\`\`graphql
# 定义命名片段
fragment PostSummary on Post {
  id
  title
  excerpt
  publishedAt
  author {
    name
  }
}

# 在查询中使用
query GetHomePage {
  featuredPosts: posts(featured: true) {
    ...PostSummary
  }
  recentPosts: posts(limit: 5) {
    ...PostSummary
  }
}
\`\`\`\`\`\`

在上面的例子中，PostSummary 片段被使用了两次——一次用于 featuredPosts，一次用于 recentPosts。这避免了重复书写相同的字段集合。

## 内联片段（Inline Fragment）

内联片段没有名称，直接在查询中定义。它主要用于两种场景：

### 1. 处理联合类型（Union Type）和接口（Interface）

当查询返回联合类型或接口类型时，你需要使用内联片段来根据具体类型获取不同的字段。

\`\`\`graphql
query SearchContent {
  search(term: "GraphQL") {
    ... on Article {
      title
      body
      readTime
    }
    ... on Video {
      title
      duration
      thumbnailUrl
    }
    ... on Podcast {
      title
      audioUrl
      episodeNumber
    }
  }
}
\`\`\`\`\`\`

### 2. 条件性地获取字段

即使类型是确定的，内联片段也可以用于条件性地请求字段，这在某些前端框架中非常有用。

\`\`\`graphql
query GetUser {
  user(id: 1) {
    name
    ... on User {
      # 当用户是管理员时，额外获取这些字段
      permissions
      lastLoginIp
    }
  }
}
\`\`\`\`\`\`

## Fragment 组合（Fragment Composition）

Fragment 可以嵌套使用——一个 fragment 可以引用另一个 fragment。这使得你可以构建层级化的字段集合。

\`\`\`graphql
# 基础 fragment
fragment AuthorInfo on User {
  id
  name
  avatar
}

# 组合 fragment
fragment PostDetail on Post {
  id
  title
  content
  publishedAt
  author {
    ...AuthorInfo
  }
  comments {
    id
    content
    author {
      ...AuthorInfo
    }
  }
}
\`\`\`\`\`\`

可以看到，PostDetail fragment 既引用了 AuthorInfo，又在自己的字段中包含了评论作者的信息。通过组合，你可以构建出非常复杂的字段树，同时保持代码的模块化。

## Fragment 与类型条件

Fragment 必须与某个类型绑定。当你在 fragment 中定义了字段，这些字段必须是该类型 schema 中确实存在的字段。如果你尝试在 fragment 中引用一个类型不存在的字段，GraphQL 验证阶段就会报错。

\`\`\`graphql
# 正确：Admin 类型确实有 permissions 字段
fragment AdminDetail on Admin {
  id
  name
  permissions
}

# 错误：User 类型没有 permissions 字段（假设如此）
fragment UserDetail on User {
  id
  name
  permissions  # 验证错误！
}
\`\`\`\`\`\`

## Fragment 复用场景

Fragment 的复用场景非常广泛：

### 1. 跨查询复用

同一个 fragment 可以在多个不同的查询、变更或订阅中使用。

### 2. 跨组件复用（前端）

在使用 React、Vue 等前端框架时，fragment 通常与组件一一对应。每个组件声明自己需要的数据片段，父组件将子组件的 fragment 组合起来形成一个完整的查询。

### 3. 条件性字段选择

通过将可选字段放在 fragment 中，你可以根据业务逻辑决定是否展开某个 fragment。

## Fragment 与 Component 配合（Relay 式）

Relay（Facebook 出品的 GraphQL 客户端）推广了一种"Fragment Container"模式：每个 UI 组件声明自己需要的数据片段，父组件通过组合子组件的 fragment 来构建完整的查询。

\`\`\`javascript
// UserAvatar 组件
function UserAvatar({ user }) {
  return <img src={user.avatar} alt={user.name} />;
}

// 组件的 fragment 声明
UserAvatar.fragment = graphql\`
  fragment UserAvatar_user on User {
    avatar
    name
  }
\`;

// UserProfile 组件
function UserProfile({ user }) {
  return (
    <div>
      <UserAvatar user={user} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

// 父组件组合子组件的 fragment
UserProfile.fragment = graphql\`
  fragment UserProfile_user on User {
    id
    name
    bio
    ...UserAvatar_user
  }
\`;
\`\`\`\`\`\`

这种方式的好处是：
- 每个组件只关心自己需要的数据
- 数据依赖与组件紧密关联
- 修改组件时，数据需求也随之更新
- 避免数据过量获取和不足获取

## Fragment 减少重复查询

在大规模应用中，不同页面和组件可能需要相同类型的数据。如果不使用 fragment，重复的字段定义会导致：

1. **代码冗余**：同样的字段写很多遍
2. **维护困难**：修改字段需要改很多地方
3. **不一致风险**：不同地方的字段选择可能不一致，导致缓存问题

使用 fragment 可以完全避免这些问题：

\`\`\`graphql
# 定义核心 fragment
fragment CoreUserFields on User {
  id
  name
  email
  avatar
}

# 不同场景的 fragment 基于核心 fragment 扩展
fragment UserListItem on User {
  ...CoreUserFields
  lastActiveAt
}

fragment UserProfile on User {
  ...CoreUserFields
  bio
  website
  followerCount
  followingCount
}

fragment UserSettings on User {
  ...CoreUserFields
  emailVerified
  notificationPreferences
  privacySettings
}
\`\`\`\`\`\`

## Fragment 的高级用法

### 带参数的 Fragment（实验性）

虽然标准 GraphQL 规范不支持 fragment 参数，但某些客户端（如 Relay）支持 \`@argumentDefinitions\` 指令：

\`\`\`graphql
fragment UserPosts on User @argumentDefinitions(
  first: { type: "Int", defaultValue: 10 }
) {
  posts(first: $first) {
    edges {
      node {
        id
        title
      }
    }
  }
}
\`\`\`\`\`\`

### Fragment 与指令配合

你可以在使用 fragment 时配合 \`@include\` 和 \`@skip\` 指令来条件性地展开 fragment：

\`\`\`graphql
query GetUser($includeBio: Boolean!) {
  user(id: 1) {
    ...CoreUserFields
    ...UserBio @include(if: $includeBio)
  }
}
\`\`\`\`\`\`

## Fragment 最佳实践

1. **以组件为单位定义 fragment**：每个 UI 组件应有自己的 fragment 声明，描述该组件需要的数据。这是 Relay 推崇的模式，也适用于 Apollo Client。

2. **使用描述性命名**：fragment 名称应清晰表达其用途。推荐格式：\`ComponentName_propName\`，如 \`UserAvatar_user\`、\`PostCard_post\`。

3. **避免过深的 fragment 嵌套**：虽然 fragment 可以嵌套，但过深的嵌套会降低可读性。一般建议不超过 3 层嵌套。

4. **将通用字段提取为 fragment**：如果多个查询都需要同一组字段，将其提取为 fragment。

5. **fragment 与类型严格对应**：确保 fragment 中引用的所有字段都是该类型实际存在的字段。

6. **使用内联 fragment 处理联合类型**：在处理 union 或 interface 类型时，使用内联 fragment 来区分不同具体类型。

7. **避免 fragment 过于庞大**：如果一个 fragment 包含了几十个字段，考虑拆分为更小的 fragment 然后组合使用。

8. **在 GraphQL 文档中管理 fragment**：将 fragment 定义放在独立文件中，与查询和变更分开管理。

## Fragment 匹配与类型条件深入

Fragment 的类型匹配是 GraphQL 验证的重要组成部分。理解 fragment 如何与类型系统交互，可以帮你避免常见的错误。

### Fragment 与接口

当 fragment 定义在接口类型上时，它可以被任何实现了该接口的具体类型使用。这是 fragment 复用最强大的场景之一。

\`\`\`graphql
# 定义接口
interface Node {
  id: ID!
  createdAt: String!
}

# 定义接口上的 fragment
fragment NodeFields on Node {
  id
  createdAt
}

# User 实现了 Node 接口
type User implements Node {
  id: ID!
  createdAt: String!
  name: String!
  email: String!
}

# Post 实现了 Node 接口
type Post implements Node {
  id: ID!
  createdAt: String!
  title: String!
  content: String!
}

# 同一个 fragment 可以用于 User 和 Post
query {
  user(id: "1") {
    ...NodeFields
    name
  }
  post(id: "101") {
    ...NodeFields
    title
  }
}
\`\`\`\`\`\`

### Fragment 与联合类型

当处理联合类型（Union）时，你需要使用内联 fragment 来根据运行时类型获取特定的字段。这是联合类型的核心用法。

\`\`\`graphql
# 定义联合类型
union SearchResult = User | Post | Comment

# 查询时使用内联 fragment 区分类型
query Search($term: String!) {
  search(term: $term) {
    ... on User {
      id
      name
      avatar
    }
    ... on Post {
      id
      title
      excerpt
      author {
        name
      }
    }
    ... on Comment {
      id
      content
      post {
        title
      }
    }
  }
}
\`\`\`\`\`\`

### Fragment 的 __typename 元字段

在某些场景下，你需要知道返回对象的实际类型。GraphQL 提供了 \`__typename\` 元字段，它可以与 fragment 配合使用。

\`\`\`graphql
query Search($term: String!) {
  search(term: $term) {
    __typename
    ... on User {
      id
      name
    }
    ... on Post {
      id
      title
    }
  }
}
\`\`\`\`\`\`

## Apollo Client 中的 Fragment 使用

Apollo Client 是 React 生态中最流行的 GraphQL 客户端。它对 fragment 有很好的支持。

### 在组件中定义 Fragment

\`\`\`javascript
import { gql } from "@apollo/client";

// 文章的评论组件
function PostComments({ post }) {
  return (
    <div>
      {post.comments.map(comment => (
        <div key={comment.id}>
          <strong>{comment.author.name}</strong>: {comment.content}
        </div>
      ))}
    </div>
  );
}

PostComments.fragments = {
  post: gql\`
    fragment PostComments_post on Post {
      comments {
        id
        content
        author {
          name
        }
      }
    }
  \`
};
\`\`\`\`\`\`

### 使用 useFragment Hook

Apollo Client 3.7+ 引入了 \`useFragment\` hook，它是使用 fragment 的推荐方式。

\`\`\`javascript
import { useFragment } from "@apollo/client";

function PostCard({ post }) {
  // 使用 useFragment 从缓存中获取 fragment 数据
  const { data } = useFragment({
    fragment: POST_CARD_FRAGMENT,
    from: post
  });

  const { title, excerpt, author } = data;

  return (
    <div className="post-card">
      <h3>{title}</h3>
      <p>{excerpt}</p>
      <span>作者: {author.name}</span>
    </div>
  );
}

const POST_CARD_FRAGMENT = gql\`
  fragment PostCard_post on Post {
    id
    title
    excerpt
    author {
      name
      avatar
    }
  }
\`;
\`\`\`\`\`\`

### Fragment 与缓存规范化

Apollo Client 使用 \`__typename\` 和 \`id\` 来规范化缓存。Fragment 数据会被自动合并到缓存中。

\`\`\`javascript
// 定义 fragment 时包含 id 字段
const USER_FRAGMENT = gql\`
  fragment UserProfile_user on User {
    id
    name
    email
    avatar
  }
\`;

// 不同的查询可以使用相同的 fragment，数据会自动共享
const QUERY_1 = gql\`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserProfile_user
    }
  }
  \${USER_FRAGMENT}
\`;

const QUERY_2 = gql\`
  query ListUsers {
    users {
      ...UserProfile_user
    }
  }
  \${USER_FRAGMENT}
\`;
\`\`\`\`\`\`

## Fragment 驱动开发（Fragment-Driven Development）

Fragment 驱动开发是一种以数据需求为导向的开发模式。核心思想是：每个 UI 组件声明自己所需的数据 fragment，然后由上层组件或路由组件将这些 fragment 组合成完整的查询。

### 工作流程

1. **定义组件的数据需求**：每个组件通过 fragment 声明自己需要哪些字段
2. **组合 fragment**：父组件将子组件的 fragment 组合在一起
3. **生成查询**：在顶层生成完整的查询，获取所有需要的数据
4. **传递数据**：将查询结果按照组件树分发

### 优势

- **关注点分离**：每个组件只关心自己的数据需求
- **类型安全**：fragment 的类型由 schema 保证
- **自动更新**：修改组件时，数据需求自动更新
- **避免过度获取**：只获取实际渲染需要的数据

## Fragment 性能考量

### Fragment 与查询大小

Fragment 虽然让代码更模块化，但要注意不要过度使用。每个展开的 fragment 最终都会被展开为完整的字段列表，查询大小不会因为使用 fragment 而减少。

### Fragment 与网络请求

Fragment 本身不产生额外的网络请求。它只是查询字符串的组织方式。真正的性能优化在于：
- 合理选择字段，避免获取不需要的数据
- 使用 \`@include\`/\`@skip\` 条件性地包含字段
- 利用缓存减少重复请求

### Fragment 的编译时优化

某些 GraphQL 工具（如 Relay）会在编译时对 fragment 进行优化处理，包括：
- 去除未使用的 fragment
- 合并重复的字段选择
- 生成类型安全的代码

## Fragment 常见问题与解决方案

### 问题 1：Fragment 类型不匹配

\`\`\`graphql
# 错误：fragment 在 User 上，但尝试在 Post 上使用
fragment UserFields on User {
  id
  name
}

query {
  post(id: "1") {
    ...UserFields  # 错误！Post 不是 User 类型
  }
}
\`\`\`\`\`\`

**解决方案**：确保 fragment 的类型与使用位置的类型匹配，或使用接口/联合类型来提高灵活性。

### 问题 2：Fragment 循环引用

\`\`\`graphql
# 错误：fragment A 引用 fragment B，fragment B 又引用 fragment A
fragment A on User {
  ...B
}
fragment B on User {
  ...A
}
\`\`\`\`\`\`

**解决方案**：避免 fragment 之间的循环引用，使用扁平化的 fragment 结构。

### 问题 3：Fragment 字段重复

当多个 fragment 包含相同的字段时，GraphQL 会自动去重，但最好在定义 fragment 时注意避免过多的重复。

\`\`\`graphql
# 虽然可以工作，但不够优雅
fragment A on User {
  id
  name
  email
}
fragment B on User {
  id
  name
  avatar
}

# 更好的做法：提取公共字段
fragment CoreUser on User {
  id
  name
}
fragment A on User {
  ...CoreUser
  email
}
fragment B on User {
  ...CoreUser
  avatar
}
\`\`\`\`\`\`

## 小结

Fragment 是 GraphQL 提供的一个优雅的复用机制。它解决了字段选择集重复定义的问题，让查询更加模块化和可维护。命名 fragment 适合跨查询复用，内联 fragment 适合处理联合类型和接口。Fragment 与组件配合（Relay 风格）是现代前端 GraphQL 开发的最佳实践之一。通过 Apollo Client 的 useFragment hook 和缓存规范化，fragment 在前端应用中发挥着越来越重要的作用。Fragment 驱动开发让数据需求与 UI 组件紧密绑定，提升了开发效率和代码可维护性。合理使用 fragment 可以大幅减少代码冗余，降低维护成本，并确保数据一致性。`,
    code: `# === Schema ===
type Query {
  user(id: ID!): User
  users: [User!]!
  post(id: ID!): Post
  posts(featured: Boolean, limit: Int): [Post!]!
  search(term: String!): [SearchResult!]!
}

type Mutation {
  createPost(title: String!, content: String!, authorId: ID!): Post!
  updatePost(id: ID!, title: String, content: String): Post!
}

type User {
  id: ID!
  name: String!
  email: String!
  avatar: String!
  bio: String
  website: String
  followerCount: Int!
  followingCount: Int!
  posts: [Post!]!
  role: UserRole!
  lastActiveAt: String!
  createdAt: String!
}

enum UserRole {
  ADMIN
  EDITOR
  READER
}

type Post {
  id: ID!
  title: String!
  content: String!
  excerpt: String!
  author: User!
  tags: [String!]!
  commentCount: Int!
  likeCount: Int!
  featured: Boolean!
  publishedAt: String!
  updatedAt: String!
  comments: [Comment!]!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  createdAt: String!
}

union SearchResult = User | Post

# === Resolvers ===
const users = [
  { id: "1", name: "张三", email: "zhangsan@example.com", avatar: "/avatars/1.png", bio: "全栈开发者", website: "https://zhangsan.dev", followerCount: 256, followingCount: 128, role: "ADMIN", lastActiveAt: "2024-06-15T10:30:00Z", createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", name: "李四", email: "lisi@example.com", avatar: "/avatars/2.png", bio: "前端工程师", website: "https://lisi.dev", followerCount: 512, followingCount: 64, role: "EDITOR", lastActiveAt: "2024-06-15T09:00:00Z", createdAt: "2024-01-15T00:00:00Z" },
  { id: "3", name: "王五", email: "wangwu@example.com", avatar: "/avatars/3.png", bio: "后端工程师", website: null, followerCount: 128, followingCount: 256, role: "READER", lastActiveAt: "2024-06-14T18:00:00Z", createdAt: "2024-02-01T00:00:00Z" }
];

const posts = [
  { id: "101", title: "GraphQL Fragment 深入理解", content: "Fragment 是 GraphQL 中非常强大的特性...", excerpt: "Fragment 让你复用字段选择集", authorId: "1", tags: ["GraphQL", "Fragment"], commentCount: 5, likeCount: 42, featured: true, publishedAt: "2024-05-01T00:00:00Z", updatedAt: "2024-05-10T00:00:00Z" },
  { id: "102", title: "React 与 GraphQL 最佳实践", content: "使用 React 和 GraphQL 构建现代应用...", excerpt: "React + GraphQL 现代开发模式", authorId: "2", tags: ["React", "GraphQL"], commentCount: 3, likeCount: 28, featured: false, publishedAt: "2024-05-15T00:00:00Z", updatedAt: "2024-05-20T00:00:00Z" },
  { id: "103", title: "GraphQL 性能优化指南", content: "如何优化 GraphQL 服务的性能...", excerpt: "让你的 GraphQL 服务飞起来", authorId: "1", tags: ["GraphQL", "Performance"], commentCount: 8, likeCount: 56, featured: true, publishedAt: "2024-06-01T00:00:00Z", updatedAt: "2024-06-05T00:00:00Z" },
  { id: "104", title: "Node.js 后端开发入门", content: "从零开始学习 Node.js 后端开发...", excerpt: "Node.js 入门教程", authorId: "3", tags: ["Node.js", "Backend"], commentCount: 12, likeCount: 35, featured: false, publishedAt: "2024-06-10T00:00:00Z", updatedAt: "2024-06-12T00:00:00Z" }
];

const comments = [
  { id: "c1", content: "Fragment 的部分讲得很清晰", authorId: "2", postId: "101", createdAt: "2024-05-02T00:00:00Z" },
  { id: "c2", content: "期待更多 GraphQL 内容", authorId: "3", postId: "101", createdAt: "2024-05-03T00:00:00Z" },
  { id: "c3", content: "React + GraphQL 确实好用", authorId: "1", postId: "102", createdAt: "2024-05-16T00:00:00Z" },
  { id: "c4", content: "性能优化建议很实用", authorId: "2", postId: "103", createdAt: "2024-06-02T00:00:00Z" },
  { id: "c5", content: "Node.js 学习路线清晰", authorId: "1", postId: "104", createdAt: "2024-06-11T00:00:00Z" }
];

const resolvers = {
  Query: {
    user: (parent, args) => {
      return users.find(function(u) { return u.id === args.id; }) || null;
    },
    users: () => users,
    post: (parent, args) => {
      return posts.find(function(p) { return p.id === args.id; }) || null;
    },
    posts: (parent, args) => {
      let result = posts.slice();
      if (args.featured !== undefined) {
        result = result.filter(function(p) { return p.featured === args.featured; });
      }
      if (args.limit) {
        result = result.slice(0, args.limit);
      }
      return result;
    },
    search: (parent, args) => {
      const term = args.term.toLowerCase();
      const matchedUsers = users.filter(function(u) {
        return u.name.toLowerCase().indexOf(term) !== -1 ||
               u.bio.toLowerCase().indexOf(term) !== -1;
      }).map(function(u) { return Object.assign({}, u, { __typename: "User" }); });
      const matchedPosts = posts.filter(function(p) {
        return p.title.toLowerCase().indexOf(term) !== -1 ||
               p.content.toLowerCase().indexOf(term) !== -1;
      }).map(function(p) { return Object.assign({}, p, { __typename: "Post" }); });
      return matchedUsers.concat(matchedPosts);
    }
  },
  Mutation: {
    createPost: (parent, args) => {
      const newPost = {
        id: String(posts.length + 101),
        title: args.title,
        content: args.content,
        excerpt: args.content.substring(0, 50) + "...",
        authorId: args.authorId,
        tags: [],
        commentCount: 0,
        likeCount: 0,
        featured: false,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      posts.push(newPost);
      return newPost;
    },
    updatePost: (parent, args) => {
      const post = posts.find(function(p) { return p.id === args.id; });
      if (!post) throw new Error("文章不存在: " + args.id);
      if (args.title !== undefined) post.title = args.title;
      if (args.content !== undefined) {
        post.content = args.content;
        post.excerpt = args.content.substring(0, 50) + "...";
      }
      post.updatedAt = new Date().toISOString();
      return post;
    }
  },
  User: {
    posts: (parent) => {
      return posts.filter(function(p) { return p.authorId === parent.id; });
    }
  },
  Post: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; });
    },
    comments: (parent) => {
      return comments.filter(function(c) { return c.postId === parent.id; });
    }
  },
  Comment: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; });
    }
  },
  SearchResult: {
    __resolveType: function(obj) {
      if (obj.__typename === "User") return "User";
      if (obj.__typename === "Post") return "Post";
      return null;
    }
  }
};

# === Query ===
# Fragment 示例：使用命名片段和内联片段
fragment UserProfile on User {
  id
  name
  email
  avatar
  bio
  website
  followerCount
  followingCount
}

fragment PostCard on Post {
  id
  title
  excerpt
  likeCount
  commentCount
  featured
  publishedAt
  author {
    name
    avatar
  }
  tags
}

query {
  user(id: "1") {
    ...UserProfile
    role
    lastActiveAt
    posts {
      ...PostCard
    }
  }
  featuredPosts: posts(featured: true) {
    ...PostCard
  }
  recentPosts: posts(limit: 3) {
    ...PostCard
  }
  search(term: "GraphQL") {
    ... on User {
      id
      name
      avatar
      bio
    }
    ... on Post {
      id
      title
      excerpt
      author {
        name
      }
    }
  }
}`,
  },
  {
    id: "gql-variables",
    group: "核心",
    icon: "📥",
    title: "变量与指令",
    content: `# 变量与指令

## 为什么需要变量？

在 REST API 中，我们通常通过 URL 查询参数或请求体来传递动态值。在 GraphQL 中，查询字符串是静态的——你不能直接在查询字符串中拼接动态值。GraphQL 的解决方案是**变量（Variables）**。

变量让你可以将动态值从查询字符串中分离出来，作为单独的参数传递给 GraphQL 服务端。这样做的好处是：
- 查询字符串保持不变，可以缓存和复用
- 变量的值由客户端在运行时提供
- 避免字符串拼接带来的安全风险（如注入攻击）
- 变量有类型系统保障，减少运行时错误

## 变量定义语法

变量在查询中使用 \`$\` 前缀声明，格式为 \`$variableName: Type\`。变量定义放在查询名称后面的括号中。

\`\`\`graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}
\`\`\`\`\`\`

在发送请求时，变量值通过单独的 \`variables\` 字段传递：

\`\`\`json
{
  "query": "query GetUser($userId: ID!) { user(id: $userId) { name email } }",
  "variables": {
    "userId": "1"
  }
}
\`\`\`\`\`\`

## 变量类型

GraphQL 变量支持所有标量类型和输入类型：

### 标量类型变量

- \`Int\`：整数
- \`Float\`：浮点数
- \`String\`：字符串
- \`Boolean\`：布尔值
- \`ID\`：唯一标识符

\`\`\`graphql
query SearchProducts(
  $keyword: String!,
  $minPrice: Float,
  $maxPrice: Float,
  $inStock: Boolean,
  $categoryId: ID
) {
  searchProducts(
    keyword: $keyword,
    minPrice: $minPrice,
    maxPrice: $maxPrice,
    inStock: $inStock,
    categoryId: $categoryId
  ) {
    id
    name
    price
  }
}
\`\`\`\`\`\`

### 输入类型变量

对于复杂的结构化输入，可以使用 input 类型：

\`\`\`graphql
input CreateUserInput {
  name: String!
  email: String!
  age: Int
  role: UserRole
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
  }
}
\`\`\`\`\`\`

## 必填变量与默认值

### 必填变量（Required Variables）

在类型后面加上 \`!\` 表示该变量是必填的。如果客户端没有提供该变量，GraphQL 会返回验证错误。

\`\`\`graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
  }
}
\`\`\`\`\`\`

### 默认值（Default Values）

你可以在变量定义时提供默认值。如果客户端没有传该变量，就使用默认值。

\`\`\`graphql
query ListPosts(
  $limit: Int = 10,
  $offset: Int = 0,
  $orderBy: String = "createdAt"
) {
  posts(limit: $limit, offset: $offset, orderBy: $orderBy) {
    id
    title
  }
}
\`\`\`\`\`\`

当客户端不传 \`limit\` 时，默认返回 10 条；不传 \`offset\` 时，默认从第 0 条开始；不传 \`orderBy\` 时，默认按创建时间排序。

带有默认值的变量可以省略 \`!\`。因为如果客户端不传，有默认值兜底，不会出错。

### 默认值 + 必填的组合

\`\`\`graphql
query ListPosts($limit: Int! = 10) {
  posts(limit: $limit) {
    id
    title
  }
}
\`\`\`\`\`\`

这里 \`$limit\` 是必填的（\`!\`），但同时有默认值 10。这意味着客户端可以传值，也可以不传（不传就用 10）。但传的值必须是 Int 类型，不能是 null。

## 变量的传递

变量可以传递给字段参数，也可以传递给指令。变量在查询中的使用位置包括：

1. **字段参数**：\`user(id: $userId)\`
2. **指令参数**：\`@include(if: $condition)\`
3. **嵌套字段参数**：\`posts(limit: $limit)\`
4. **input 对象字段**：作为 input 类型的一部分

## @include 指令

\`@include\` 是 GraphQL 内置的核心指令之一。它用于条件性地包含某个字段或 fragment。当条件为 \`true\` 时，该字段会被包含在查询结果中；为 \`false\` 时，该字段会被跳过。

\`\`\`graphql
query GetUser($includeEmail: Boolean!) {
  user(id: 1) {
    id
    name
    email @include(if: $includeEmail)
  }
}
\`\`\`\`\`\`

当 \`$includeEmail\` 为 \`true\` 时，返回结果包含 email；为 \`false\` 时，不包含 email。

\`\`\`graphql
# 与 fragment 配合使用
query GetUser($includeBio: Boolean!) {
  user(id: 1) {
    id
    name
    ...UserBio @include(if: $includeBio)
  }
}

fragment UserBio on User {
  bio
  website
  location
}
\`\`\`\`\`\`

## @skip 指令

\`@skip\` 是 \`@include\` 的反向指令。当条件为 \`true\` 时，该字段会被跳过；为 \`false\` 时，该字段会被包含。

\`\`\`graphql
query GetUser($skipEmail: Boolean!) {
  user(id: 1) {
    id
    name
    email @skip(if: $skipEmail)
  }
}
\`\`\`\`\`\`

\`@include(if: $cond)\` 和 \`@skip(if: !$cond)\` 是等价的。选择使用哪个取决于你的业务逻辑——哪个读起来更自然就用哪个。

\`\`\`graphql
# 使用 @include：当需要显示时传入 true
query UserProfile($showPrivateInfo: Boolean!) {
  user(id: 1) {
    name
    privateInfo @include(if: $showPrivateInfo) {
      phone
      address
    }
  }
}

# 使用 @skip：当需要隐藏时传入 true
query UserProfile($hidePrivateInfo: Boolean!) {
  user(id: 1) {
    name
    privateInfo @skip(if: $hidePrivateInfo) {
      phone
      address
    }
  }
}
\`\`\`\`\`\`

## @include 和 @skip 的优先级

当同一个字段上同时使用了 \`@include\` 和 \`@skip\` 时，两个条件都必须是"包含"才会被包含。换句话说：
- 如果 \`@skip\` 为 true，字段一定被跳过（无论 \`@include\` 的值）
- 如果 \`@skip\` 为 false 且 \`@include\` 为 true，字段被包含
- 如果 \`@include\` 为 false，字段被跳过（无论 \`@skip\` 的值）

## @deprecated 指令

\`@deprecated\` 是用于 schema 定义中的指令，而不是查询中的指令。它用于标记某个字段或枚举值已被废弃，并建议使用替代方案。

\`\`\`graphql
type User {
  id: ID!
  name: String!

  # 标记废弃的字段
  fullName: String @deprecated(reason: "请使用 firstName 和 lastName 代替")

  # 不提供 reason 也可以
  oldAvatar: String @deprecated

  firstName: String!
  lastName: String!
}
\`\`\`\`\`\`

在 GraphQL IDE（如 GraphiQL）中，被标记为 \`@deprecated\` 的字段会显示为删除线样式，提示开发者该字段即将被移除。

## 自定义指令

除了内置指令，GraphQL 允许你定义自定义指令。自定义指令需要在 schema 中声明，并在服务端实现其逻辑。

### 自定义指令的声明

\`\`\`graphql
# 定义一个 @upper 指令，将字符串字段转为大写
directive @upper on FIELD_DEFINITION

# 定义一个 @auth 指令，用于权限检查
directive @auth(requires: Role = ADMIN) on FIELD_DEFINITION

# 定义一个 @dateFormat 指令，格式化日期
directive @dateFormat(format: String = "YYYY-MM-DD") on FIELD_DEFINITION
\`\`\`\`\`\`

### 自定义指令的使用位置

指令可以应用于不同的位置，由 \`on\` 关键字指定：

- \`FIELD_DEFINITION\`：字段定义
- \`OBJECT\`：对象类型定义
- \`INTERFACE\`：接口定义
- \`UNION\`：联合类型定义
- \`ENUM\`：枚举定义
- \`ENUM_VALUE\`：枚举值
- \`INPUT_OBJECT\`：输入对象类型
- \`INPUT_FIELD_DEFINITION\`：输入字段定义
- \`SCALAR\`：标量类型
- \`ARGUMENT_DEFINITION\`：参数定义
- \`SCHEMA\`：整个 schema

### 实现自定义指令

在 Apollo Server 中，你可以通过 schema 转换来实现自定义指令：

\`\`\`javascript
const { mapSchema, getDirectives, MapperKind } = require("@graphql-tools/utils");

function upperDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      const directives = getDirectives(schema, fieldConfig);
      const upperDirective = directives["upper"];
      if (upperDirective) {
        const originalResolve = fieldConfig.resolve;
        fieldConfig.resolve = async function (parent, args, context, info) {
          const result = await originalResolve.call(this, parent, args, context, info);
          if (typeof result === "string") {
            return result.toUpperCase();
          }
          return result;
        };
      }
      return fieldConfig;
    }
  });
}
\`\`\`\`\`\`

## 变量与查询参数的区别

在 GraphQL 中，"变量"和"查询参数"是两个不同的概念：

- **变量（Variable）**：以 \`$\` 开头，在查询定义中声明，通过 variables 对象传递。变量是 GraphQL 层面的概念。
- **查询参数（Argument）**：是字段调用时传入的实际值，如 \`user(id: 1)\` 中的 \`id: 1\`。参数可以是字面量，也可以是变量引用。

\`\`\`graphql
# $userId 是变量，id 是参数名
query GetUser($userId: ID!) {
  user(id: $userId) {  # 这里 $userId 作为参数值传入
    name
  }
}
\`\`\`\`\`\`

## 变量安全（防注入）

使用变量天然具有防注入的能力。因为变量值不会与查询字符串拼接，而是独立的 JSON 数据。GraphQL 引擎会先解析查询字符串（构建 AST），然后再将变量值代入。这意味着变量值永远不会被当作查询语法的一部分来解析。

\`\`\`javascript
// 不安全的做法（不要这样做）
const query = \`
  query {
    user(id: "\${userId}") {
      name
    }
  }
\`;
// 如果 userId 是 "1" OR 1=1"，查询字符串就被污染了

// 安全的做法（使用变量）
const query = \`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      name
    }
  }
\`;
// 变量值 { userId: "1\" OR 1=1" } 会被安全地作为字符串处理
\`\`\`\`\`\`

## 变量与分页

分页是变量最常用的场景之一。通过变量动态控制分页参数，可以轻松实现各种分页模式。

### 基于偏移量的分页

\`\`\`graphql
query ListPosts($limit: Int!, $offset: Int!) {
  posts(limit: $limit, offset: $offset) {
    id
    title
    publishedAt
  }
}
\`\`\`\`\`\`

### 基于游标的分页（Cursor-based Pagination）

\`\`\`graphql
query ListPosts($first: Int, $after: String, $last: Int, $before: String) {
  posts(first: $first, after: $after, last: $last, before: $before) {
    edges {
      cursor
      node {
        id
        title
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
\`\`\`\`\`\`

### 搜索与过滤

\`\`\`graphql
query SearchPosts(
  $keyword: String!,
  $tags: [String!],
  $sortBy: String = "publishedAt",
  $sortOrder: String = "DESC",
  $limit: Int = 20
) {
  searchPosts(
    keyword: $keyword,
    tags: $tags,
    sortBy: $sortBy,
    sortOrder: $sortOrder,
    limit: $limit
  ) {
    id
    title
    tags
    publishedAt
    author {
      name
    }
  }
}
\`\`\`\`\`\`

## 变量使用的最佳实践

1. **始终使用变量传递动态值**：不要将动态值拼接到查询字符串中。这既是为了安全，也便于查询缓存。

2. **为变量提供合理的默认值**：这可以减少客户端需要传递的参数数量，提高 API 的易用性。

3. **使用描述性的变量名**：变量名应该清晰表达其用途，如 \`$userId\` 而不是 \`$id\`，\`$includeBio\` 而不是 \`$flag\`。

4. **合理使用必填标记**：对于业务逻辑必需的参数，使用 \`!\` 标记为必填。对于可选参数，提供默认值。

5. **利用 \`@include\`/\`@skip\` 减少数据量**：根据客户端需求，条件性地包含或跳过字段，减少不必要的数据传输。

6. **变量和查询名称同时使用**：为查询命名（operation name）有助于调试和日志记录，变量名则让查询更灵活。

7. **使用 input 类型处理复杂参数**：当 mutation 需要多个参数时，将其封装为 input 类型，使 API 更清晰。

8. **注意变量类型与 schema 参数类型一致**：变量类型必须与对应参数的 schema 定义类型兼容，否则会触发验证错误。

## 变量与操作名称

为查询、变更和订阅命名不仅是最佳实践，也是 GraphQL 规范推荐的做法。操作名称与变量配合使用，可以极大提升代码的可维护性和可调试性。

### 操作名称的作用

- **调试**：在 GraphQL 开发工具中可以看到操作名称，方便定位问题
- **日志记录**：在服务端日志中记录操作名称，便于追踪和监控
- **缓存**：某些客户端根据操作名称进行缓存
- **文档化**：操作名称本身就是 API 文档的一部分

\`\`\`graphql
# 命名操作：操作名称 + 变量定义
query GetUserProfile($userId: ID!, $includeEmail: Boolean = true) {
  user(id: $userId) {
    id
    name
    email @include(if: $includeEmail)
    avatar
  }
}

# 命名变更
mutation CreateNewPost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    publishedAt
  }
}

# 命名订阅
subscription OnPostCreated($authorId: ID!) {
  postCreated(authorId: $authorId) {
    id
    title
    author {
      name
    }
  }
}
\`\`\`\`\`\`

## 变量与复杂查询场景

### 多级嵌套变量

变量不仅可以在顶层查询中使用，还可以在嵌套字段中使用。当嵌套字段需要参数时，变量可以传递到任意层级。

\`\`\`graphql
query GetUserWithFilteredPosts(
  $userId: ID!,
  $postLimit: Int = 5,
  $commentLimit: Int = 3,
  $minLikes: Int = 0
) {
  user(id: $userId) {
    name
    posts(limit: $postLimit) {
      title
      likeCount @include(if: $minLikes > 0)
      comments(limit: $commentLimit) {
        content
        author {
          name
        }
      }
    }
  }
}
\`\`\`\`\`\`

### 变量与列表操作

列表类型变量可以传递多个值，这在需要多选过滤的场景中非常有用。

\`\`\`graphql
query FilterPosts(
  $tags: [String!] = ["GraphQL"],
  $authorIds: [ID!],
  $dateRange: DateRangeInput
) {
  posts(
    tags: $tags,
    authorIds: $authorIds,
    dateRange: $dateRange
  ) {
    id
    title
    tags
    publishedAt
    author {
      id
      name
    }
  }
}
\`\`\`\`\`\`

## 变量与缓存策略

### 查询缓存键

在 Apollo Client 中，查询结果会根据查询字符串和变量值进行缓存。相同查询 + 相同变量 = 缓存命中。

\`\`\`javascript
// 这两个请求会使用相同的缓存
const { data: data1 } = useQuery(GET_USER, {
  variables: { userId: "1" }
});
const { data: data2 } = useQuery(GET_USER, {
  variables: { userId: "1" }
});
// data2 直接从缓存返回，不会发起网络请求

// 不同变量值会触发新的请求
const { data: data3 } = useQuery(GET_USER, {
  variables: { userId: "2" }
});
// data3 会发起新的网络请求
\`\`\`\`\`\`

### 缓存策略配置

你可以通过 \`fetchPolicy\` 控制缓存行为：

\`\`\`javascript
// 不同缓存策略
const { data } = useQuery(GET_USER, {
  variables: { userId: "1" },
  fetchPolicy: "cache-first"  // 默认：先查缓存，没有则请求
});

const { data: freshData } = useQuery(GET_USER, {
  variables: { userId: "1" },
  fetchPolicy: "network-only"  // 始终请求网络，忽略缓存
});

const { data: cachedData } = useQuery(GET_USER, {
  variables: { userId: "1" },
  fetchPolicy: "cache-only"  // 只从缓存获取，不发起网络请求
});
\`\`\`\`\`\`

## 自定义指令深入

自定义指令是 GraphQL 的高级特性，可以让你扩展 schema 的语义。虽然标准 GraphQL 只包含 @include、@skip 和 @deprecated 三个指令，但你可以定义自己的指令来实现业务逻辑。

### 指令的 SDL 定义

\`\`\`graphql
# 指令可以应用于多个位置
directive @auth(
  requires: Role = ADMIN
) on FIELD_DEFINITION | OBJECT

# 带参数的指令
directive @cost(
  complexity: Int!
  multipliers: [String!]
) on FIELD_DEFINITION

# 仅用于参数验证的指令
directive @constraint(
  minLength: Int
  maxLength: Int
  pattern: String
) on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
\`\`\`\`\`\`

### 指令在 Schema 中的使用

\`\`\`graphql
type Query {
  # 使用 @cost 指令标记查询复杂度
  users: [User!]! @cost(complexity: 10)
  user(id: ID!): User @cost(complexity: 1)

  # 使用 @auth 指令标记需要管理员权限
  adminDashboard: DashboardData @auth(requires: ADMIN)
}

type Mutation {
  # 使用 @constraint 指令验证参数
  createUser(
    name: String! @constraint(minLength: 2, maxLength: 50),
    email: String! @constraint(pattern: "^[^@]+@[^@]+\\.[^@]+$")
  ): User!
}
\`\`\`\`\`\`

### 指令执行顺序

当多个指令同时使用时，指令的执行顺序可能会影响结果。GraphQL 规范没有定义指令的执行顺序，但在实际实现中，通常按照它们在 schema 中出现的顺序执行。

## 变量的故障排查

### 常见错误 1：变量类型不匹配

\`\`\`graphql
# schema 定义：user(id: ID!)
query GetUser($userId: Int!) {  # 错误：ID 和 Int 不兼容
  user(id: $userId) {
    name
  }
}
# 错误信息：Variable "$userId" of type "Int!" used in position expecting type "ID!"
\`\`\`\`\`\`

### 常见错误 2：必填变量未提供

\`\`\`graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
  }
}
# 如果 variables 为 {}，报错：
# Variable "$userId" of required type "ID!" was not provided
\`\`\`\`\`\`

### 常见错误 3：变量未使用

\`\`\`graphql
query GetUser($userId: ID!, $unused: String) {
  user(id: $userId) {
    name
  }
}
# 警告：Variable "$unused" is never used in operation "GetUser"
\`\`\`\`\`\`

### 常见错误 4：非空变量传入 null

\`\`\`graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
  }
}
# 如果 variables 为 { "userId": null }，报错：
# Variable "$userId" of non-null type "ID!" must not be null
\`\`\`\`\`\`

## 小结

变量是 GraphQL 查询动态化的关键机制。它允许你将查询字符串与运行时数据分离，既提升了安全性（防止注入），也便于查询缓存。\`@include\` 和 \`@skip\` 指令提供了条件性字段选择的能力，\`@deprecated\` 指令则帮助 API 演进。自定义指令为 schema 提供了强大的元编程能力。操作名称让查询更具可读性和可调试性，而缓存策略则让变量在性能优化中发挥关键作用。在实际开发中，合理使用变量和指令可以让你的 GraphQL API 更加灵活、安全和易用。`,
    code: `# === Schema ===
type Query {
  user(id: ID!): User
  users(role: UserRole, limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(
    limit: Int = 10,
    offset: Int = 0,
    sortBy: String = "publishedAt",
    sortOrder: String = "DESC",
    tag: String
  ): PostConnection!
  searchPosts(
    keyword: String!,
    tags: [String!],
    minLikes: Int,
    maxLikes: Int
  ): [Post!]!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
}

input CreatePostInput {
  title: String!
  content: String!
  authorId: ID!
  tags: [String!]
  featured: Boolean
}

input UpdatePostInput {
  title: String
  content: String
  tags: [String!]
  featured: Boolean
}

type User {
  id: ID!
  name: String!
  email: String!
  avatar: String!
  bio: String
  role: UserRole!
  totalPosts: Int! @deprecated(reason: "请使用 postCount 代替")
  postCount: Int!
  createdAt: String!
  lastLoginAt: String
  settings: UserSettings
}

type UserSettings {
  theme: String!
  language: String!
  notifications: Boolean!
}

enum UserRole {
  ADMIN
  EDITOR
  READER
}

type Post {
  id: ID!
  title: String!
  content: String!
  excerpt: String!
  author: User!
  tags: [String!]!
  likeCount: Int!
  commentCount: Int!
  featured: Boolean!
  publishedAt: String!
  updatedAt: String!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

directive @upper on FIELD_DEFINITION
directive @auth(requires: UserRole = ADMIN) on FIELD_DEFINITION

# === Resolvers ===
const users = [
  { id: "1", name: "张三", email: "zhangsan@example.com", avatar: "/avatars/1.png", bio: "全栈开发者", role: "ADMIN", postCount: 15, createdAt: "2024-01-01", lastLoginAt: "2024-06-15", settings: { theme: "dark", language: "zh-CN", notifications: true } },
  { id: "2", name: "李四", email: "lisi@example.com", avatar: "/avatars/2.png", bio: "前端工程师", role: "EDITOR", postCount: 8, createdAt: "2024-02-15", lastLoginAt: "2024-06-14", settings: { theme: "light", language: "en-US", notifications: false } },
  { id: "3", name: "王五", email: "wangwu@example.com", avatar: "/avatars/3.png", bio: "后端工程师", role: "READER", postCount: 3, createdAt: "2024-03-20", lastLoginAt: "2024-06-10", settings: { theme: "dark", language: "zh-CN", notifications: true } }
];

const posts = [
  { id: "101", title: "GraphQL 变量与指令", content: "变量是 GraphQL 查询动态化的关键...", excerpt: "掌握 GraphQL 变量与指令", authorId: "1", tags: ["GraphQL", "Variables"], likeCount: 42, commentCount: 5, featured: true, publishedAt: "2024-05-01", updatedAt: "2024-05-10" },
  { id: "102", title: "React 18 新特性", content: "React 18 带来了许多令人兴奋的新特性...", excerpt: "React 18 新特性一览", authorId: "2", tags: ["React", "Frontend"], likeCount: 28, commentCount: 3, featured: false, publishedAt: "2024-05-15", updatedAt: "2024-05-20" },
  { id: "103", title: "Node.js 性能优化", content: "提高 Node.js 应用性能的 10 个技巧...", excerpt: "Node.js 性能优化指南", authorId: "3", tags: ["Node.js", "Performance"], likeCount: 56, commentCount: 8, featured: true, publishedAt: "2024-06-01", updatedAt: "2024-06-05" },
  { id: "104", title: "GraphQL 安全最佳实践", content: "保护你的 GraphQL API 免受攻击...", excerpt: "GraphQL 安全指南", authorId: "1", tags: ["GraphQL", "Security"], likeCount: 35, commentCount: 6, featured: false, publishedAt: "2024-06-10", updatedAt: "2024-06-12" },
  { id: "105", title: "TypeScript 高级类型", content: "深入理解 TypeScript 的类型系统...", excerpt: "TypeScript 高级类型教程", authorId: "2", tags: ["TypeScript", "Frontend"], likeCount: 19, commentCount: 2, featured: false, publishedAt: "2024-06-15", updatedAt: "2024-06-16" },
  { id: "106", title: "Docker 容器化部署", content: "使用 Docker 部署你的应用...", excerpt: "Docker 部署实践", authorId: "3", tags: ["Docker", "DevOps"], likeCount: 44, commentCount: 7, featured: true, publishedAt: "2024-06-20", updatedAt: "2024-06-22" }
];

const resolvers = {
  Query: {
    user: (parent, args) => {
      return users.find(function(u) { return u.id === args.id; }) || null;
    },
    users: (parent, args) => {
      let result = users.slice();
      if (args.role) {
        result = result.filter(function(u) { return u.role === args.role; });
      }
      if (args.offset) {
        result = result.slice(args.offset);
      }
      if (args.limit) {
        result = result.slice(0, args.limit);
      }
      return result;
    },
    post: (parent, args) => {
      return posts.find(function(p) { return p.id === args.id; }) || null;
    },
    posts: (parent, args) => {
      let result = posts.slice();
      if (args.tag) {
        result = result.filter(function(p) { return p.tags.indexOf(args.tag) !== -1; });
      }
      var sortField = args.sortBy || "publishedAt";
      var sortOrder = args.sortOrder || "DESC";
      result.sort(function(a, b) {
        var aVal = a[sortField];
        var bVal = b[sortField];
        if (typeof aVal === "string") {
          return sortOrder === "ASC" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === "ASC" ? aVal - bVal : bVal - aVal;
      });
      var totalCount = result.length;
      var offset = args.offset || 0;
      var limit = args.limit || 10;
      var paged = result.slice(offset, offset + limit);
      var edges = paged.map(function(p, idx) {
        return { cursor: "cursor_" + (offset + idx), node: p };
      });
      return {
        edges: edges,
        pageInfo: {
          hasNextPage: offset + limit < totalCount,
          hasPreviousPage: offset > 0,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        },
        totalCount: totalCount
      };
    },
    searchPosts: (parent, args) => {
      let result = posts.slice();
      var keyword = args.keyword.toLowerCase();
      result = result.filter(function(p) {
        return p.title.toLowerCase().indexOf(keyword) !== -1 ||
               p.content.toLowerCase().indexOf(keyword) !== -1;
      });
      if (args.tags && args.tags.length > 0) {
        result = result.filter(function(p) {
          return args.tags.some(function(t) { return p.tags.indexOf(t) !== -1; });
        });
      }
      if (args.minLikes !== undefined) {
        result = result.filter(function(p) { return p.likeCount >= args.minLikes; });
      }
      if (args.maxLikes !== undefined) {
        result = result.filter(function(p) { return p.likeCount <= args.maxLikes; });
      }
      return result;
    }
  },
  Mutation: {
    createPost: (parent, args) => {
      var input = args.input;
      var newPost = {
        id: String(posts.length + 101),
        title: input.title,
        content: input.content,
        excerpt: input.content.substring(0, 50) + "...",
        authorId: input.authorId,
        tags: input.tags || [],
        likeCount: 0,
        commentCount: 0,
        featured: input.featured || false,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      posts.push(newPost);
      return newPost;
    },
    updatePost: (parent, args) => {
      var post = posts.find(function(p) { return p.id === args.id; });
      if (!post) throw new Error("文章不存在: " + args.id);
      var input = args.input;
      if (input.title !== undefined) post.title = input.title;
      if (input.content !== undefined) {
        post.content = input.content;
        post.excerpt = input.content.substring(0, 50) + "...";
      }
      if (input.tags !== undefined) post.tags = input.tags;
      if (input.featured !== undefined) post.featured = input.featured;
      post.updatedAt = new Date().toISOString();
      return post;
    }
  },
  User: {
    totalPosts: (parent) => parent.postCount,
    postCount: (parent) => parent.postCount
  },
  Post: {
    author: (parent) => {
      return users.find(function(u) { return u.id === parent.authorId; });
    }
  }
};

# === Query ===
# 变量示例：使用 @include/@skip 和多种变量类型
query SearchPosts(
  $keyword: String! = "GraphQL",
  $tags: [String!],
  $minLikes: Int,
  $maxLikes: Int,
  $includeAuthor: Boolean! = true,
  $skipExcerpt: Boolean! = false
) {
  searchPosts(
    keyword: $keyword,
    tags: $tags,
    minLikes: $minLikes,
    maxLikes: $maxLikes
  ) {
    id
    title
    excerpt @skip(if: $skipExcerpt)
    likeCount
    commentCount
    featured
    tags
    publishedAt
    author @include(if: $includeAuthor) {
      id
      name
      avatar
      role
    }
  }
}`,
  },
  {
    id: "gql-validation",
    group: "核心",
    icon: "✅",
    title: "验证与错误处理",
    content: `# 验证与错误处理

## GraphQL 的类型安全验证

GraphQL 最大的优势之一是其强大的类型系统。在查询执行之前，GraphQL 引擎会对查询进行严格验证，确保查询在语法和语义上都是正确的。这种验证是 GraphQL 内置的，不需要开发者做任何额外配置。

### 验证发生在什么时候？

验证发生在查询解析之后、执行之前。当客户端发送一个查询时，GraphQL 引擎的处理流程是：

1. **解析（Parse）**：将查询字符串解析为 AST（抽象语法树）
2. **验证（Validate）**：对 AST 进行静态验证
3. **执行（Execute）**：执行查询并返回结果

如果验证失败，查询不会被执行，客户端会收到包含验证错误的响应。

## 内置验证规则

GraphQL 规范定义了一系列内置验证规则，确保查询的有效性。以下是主要的验证规则：

### 1. 类型检查

每个字段和参数都必须与 schema 中定义的类型匹配。如果类型不匹配，查询会报错。

\`\`\`graphql
# Schema 定义
type Query {
  user(id: ID!): User
}

# 错误：id 参数期望 ID 类型，但传入了 Int
query {
  user(id: 123) {
    name
  }
}
# 错误信息：Expected type ID!, found 123
\`\`\`\`\`\`

### 2. 字段存在性检查

查询中引用的每个字段都必须在 schema 中存在。如果字段不存在，会返回错误。

\`\`\`graphql
# 错误：User 类型中没有 nonExistentField 字段
query {
  user(id: "1") {
    name
    nonExistentField
  }
}
# 错误信息：Cannot query field "nonExistentField" on type "User"
\`\`\`\`\`\`

### 3. 参数匹配检查

传递给字段的参数必须与 schema 中定义的参数名称、类型和必填性匹配。

\`\`\`graphql
# Schema: user(id: ID!): User

# 错误：缺少必填参数 id
query {
  user {
    name
  }
}
# 错误信息：Field "user" argument "id" of type "ID!" is required
\`\`\`\`\`\`

### 4. Fragment 验证

Fragment 的类型必须与使用位置匹配。Fragment 中的字段必须在目标类型上存在。

\`\`\`graphql
fragment UserFields on User {
  id
  name
  title  # 错误：User 类型没有 title 字段
}

query {
  user(id: "1") {
    ...UserFields
  }
}
# 错误信息：Cannot query field "title" on type "User"
\`\`\`\`\`\`

### 5. 变量验证

变量类型必须与使用位置的参数类型兼容。必填变量必须被提供。

\`\`\`graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
  }
}

# 如果客户端不传 variables，错误信息：
# Variable "$userId" of required type "ID!" was not provided
\`\`\`\`\`\`

### 6. 唯一性检查

操作名称和变量名称在同一个文档中必须唯一。

\`\`\`graphql
# 错误：重复的变量名
query GetUser($id: ID!, $id: String!) {
  user(id: $id) {
    name
  }
}
\`\`\`\`\`\`

### 7. 操作名称检查

如果一个查询文档包含多个操作，每个操作必须有名称。

\`\`\`graphql
# 错误：多个匿名操作
query {
  user(id: "1") { name }
}
query {
  post(id: "1") { title }
}
# 错误信息：This anonymous operation must be the only defined operation
\`\`\`\`\`\`

## 自定义验证规则

除了内置验证，GraphQL 允许你添加自定义验证规则。这在需要业务级别的验证时非常有用，比如限制查询深度、限制查询复杂度、禁止某些字段等。

### 限制查询深度

防止恶意客户端发送深度嵌套的查询（可能导致性能问题或 DoS 攻击）。

\`\`\`javascript
const { validate, parse, specifiedRules } = require("graphql");
const { createComplexityRule } = require("graphql-validation-complexity");

// 限制查询深度不超过 5
function depthLimitRule(maxDepth) {
  return function(context) {
    return {
      Field(node) {
        const depth = computeDepth(node);
        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(
              "查询深度超过限制（最大 " + maxDepth + " 层）",
              { nodes: node }
            )
          );
        }
      }
    };
  };
}

function computeDepth(node) {
  let depth = 0;
  let current = node;
  while (current) {
    depth++;
    current = current.parent;
  }
  return depth;
}
\`\`\`\`\`\`

### 限制查询复杂度

通过给每个字段分配权重，计算查询的总复杂度，并设置上限。

\`\`\`javascript
// 复杂度计算：每个字段 1 分，连接字段 10 分
function complexityLimitRule(maxComplexity) {
  return function(context) {
    let totalComplexity = 0;

    return {
      Field(node) {
        const fieldName = node.name.value;
        // 连接字段通常返回列表，给它更高的权重
        if (fieldName.endsWith("s") || fieldName === "edges" || fieldName === "nodes") {
          totalComplexity += 10;
        } else {
          totalComplexity += 1;
        }

        if (totalComplexity > maxComplexity) {
          context.reportError(
            new GraphQLError(
              "查询复杂度超过限制（最大 " + maxComplexity + "）",
              { nodes: node }
            )
          );
        }
      }
    };
  };
}
\`\`\`\`\`\`

## 自定义验证标量

GraphQL 提供了五种内置标量（Int、Float、String、Boolean、ID），但你可以定义自定义标量类型来实现更精细的验证。

### 常见的自定义标量

\`\`\`graphql
# Email 标量
scalar Email

# URL 标量
scalar URL

# 日期时间标量
scalar DateTime

# JSON 标量
scalar JSON

# 正整数标量
scalar PositiveInt
\`\`\`\`\`\`

### 实现自定义标量

\`\`\`javascript
const { GraphQLScalarType, Kind } = require("graphql");

const EmailScalar = new GraphQLScalarType({
  name: "Email",
  description: "Email 地址标量类型",
  // 从客户端接收值时的处理
  serialize(value) {
    // 验证值是否是有效的 email
    if (typeof value !== "string" || !value.includes("@")) {
      throw new TypeError("Email 格式无效");
    }
    return value.toLowerCase().trim();
  },
  // 解析字面量值（直接写在查询中的值）
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError("Email 必须是字符串类型");
    }
    if (!ast.value.includes("@")) {
      throw new TypeError("Email 格式无效: " + ast.value);
    }
    return ast.value.toLowerCase().trim();
  },
  // 解析变量值
  parseValue(value) {
    if (typeof value !== "string" || !value.includes("@")) {
      throw new TypeError("Email 格式无效");
    }
    return value.toLowerCase().trim();
  }
});
\`\`\`\`\`\`

## 错误格式（Errors 数组）

GraphQL 的错误响应遵循一个标准格式。无论查询成功还是失败，HTTP 状态码都是 200（除非是 GraphQL 服务本身的问题）。错误信息放在 \`errors\` 数组中，成功的数据放在 \`data\` 字段中。

### 标准错误响应格式

\`\`\`json
{
  "errors": [
    {
      "message": "用户不存在",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["user"],
      "extensions": {
        "code": "USER_NOT_FOUND",
        "userId": "999"
      }
    }
  ],
  "data": null
}
\`\`\`\`\`\`

### 错误字段说明

- **message**：人类可读的错误描述。这是必需的字段。
- **locations**：错误在查询字符串中的位置（行号和列号）。帮助定位问题。
- **path**：错误在响应数据中的路径。例如 \`["user", "posts", 0, "title"]\` 表示在 user.posts[0].title 字段上出错。
- **extensions**：扩展信息，可以包含错误码、分类、时间戳等自定义数据。

## 部分成功（Data + Errors）

GraphQL 的一个重要特性是**部分成功**。一个查询中，某些字段可能成功返回数据，而另一些字段可能失败。在这种情况下，响应中同时包含 \`data\` 和 \`errors\`。

\`\`\`json
{
  "data": {
    "user": {
      "id": "1",
      "name": "张三",
      "email": null,
      "posts": [
        {
          "id": "101",
          "title": "GraphQL 入门",
          "author": null
        }
      ]
    }
  },
  "errors": [
    {
      "message": "无权访问 email 字段",
      "locations": [{ "line": 4, "column": 5 }],
      "path": ["user", "email"],
      "extensions": { "code": "FORBIDDEN" }
    },
    {
      "message": "作者信息加载失败",
      "locations": [{ "line": 8, "column": 7 }],
      "path": ["user", "posts", 0, "author"],
      "extensions": { "code": "INTERNAL_ERROR" }
    }
  ]
}
\`\`\`\`\`\`

在上面的响应中：
- \`user.id\` 和 \`user.name\` 成功返回
- \`user.email\` 失败（权限不足），值为 null
- \`user.posts[0].id\` 和 \`user.posts[0].title\` 成功返回
- \`user.posts[0].author\` 失败（内部错误），值为 null

这种设计让客户端可以优雅地处理部分失败，而不是因为一个字段出错就丢失所有数据。

## GraphQLError 类型

GraphQL 提供了 \`GraphQLError\` 类来创建结构化的错误对象。相比普通的 \`Error\`，\`GraphQLError\` 支持更多的元数据。

### 创建 GraphQLError

\`\`\`javascript
import { GraphQLError } from "graphql";

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const user = await context.db.findUserById(args.id);
      if (!user) {
        throw new GraphQLError("用户不存在", {
          extensions: {
            code: "USER_NOT_FOUND",
            userId: args.id,
            timestamp: new Date().toISOString(),
            http: { status: 404 }
          }
        });
      }
      return user;
    }
  }
};
\`\`\`\`\`\`

### GraphQLError 的配置选项

\`\`\`javascript
new GraphQLError(message, {
  nodes: [...],          // 相关的 AST 节点
  source: ...,           // 源代码
  positions: [...],      // 位置信息
  path: [...],           // 路径
  originalError: ...,    // 原始错误对象
  extensions: {          // 扩展信息
    code: "CUSTOM_CODE",
    ...additionalData
  }
});
\`\`\`\`\`\`

## 错误扩展（Extensions）

\`extensions\` 字段是 GraphQL 错误中用于携带额外元数据的扩展机制。你可以在这里放置任何自定义数据。

### 常用的扩展字段

\`\`\`javascript
const extensions = {
  code: "USER_NOT_FOUND",        // 错误码，方便客户端分类处理
  status: 404,                   // HTTP 状态码（用于 REST 集成）
  timestamp: "2024-06-15T10:30:00Z",  // 错误发生时间
  requestId: "req_abc123",       // 请求 ID，便于追踪
  userId: "999",                 // 相关业务数据
  field: "email",                // 出错的字段名
  severity: "ERROR",             // 严重级别：ERROR, WARN, INFO
  retryable: false,              // 是否可重试
  documentationUrl: "https://api.example.com/docs/errors/USER_NOT_FOUND"
};
\`\`\`\`\`\`

## 错误码设计

为你的 API 定义一套清晰的错误码体系，可以帮助客户端更好地处理错误。

### 推荐的错误码命名规范

\`\`\`
AUTH_*      认证相关：AUTH_NOT_AUTHENTICATED, AUTH_TOKEN_EXPIRED, AUTH_FORBIDDEN
USER_*      用户相关：USER_NOT_FOUND, USER_EMAIL_EXISTS, USER_INVALID_INPUT
POST_*      文章相关：POST_NOT_FOUND, POST_PERMISSION_DENIED
VALIDATION_* 验证相关：VALIDATION_ERROR, VALIDATION_REQUIRED_FIELD
INTERNAL_*  内部错误：INTERNAL_ERROR, INTERNAL_DATABASE_ERROR
RATE_*      限流相关：RATE_LIMIT_EXCEEDED, RATE_QUOTA_EXCEEDED
\`\`\`\`\`\`

### 统一的错误处理函数

\`\`\`javascript
function createError(code, message, options = {}) {
  return new GraphQLError(message, {
    extensions: {
      code,
      timestamp: new Date().toISOString(),
      ...options
    }
  });
}

// 使用
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      if (!context.currentUser) {
        throw createError("AUTH_NOT_AUTHENTICATED", "请先登录");
      }
      const user = await context.db.findUserById(args.id);
      if (!user) {
        throw createError("USER_NOT_FOUND", "用户不存在", { userId: args.id });
      }
      return user;
    }
  }
};
\`\`\`\`\`\`

## 用户友好错误

安全最佳实践要求不要将内部错误直接暴露给客户端。你需要在服务端对错误进行过滤和转换。

### 错误过滤函数

\`\`\`javascript
function formatError(formattedError, error) {
  // 记录原始错误到日志
  console.error("[GraphQL Error]", {
    message: error.message,
    stack: error.stack,
    path: error.path,
    timestamp: new Date().toISOString()
  });

  // 如果是 GraphQLError（我们自己抛出的），保留原始信息
  if (error instanceof GraphQLError) {
    return formattedError;
  }

  // 如果是未知错误（如数据库异常），隐藏内部细节
  return {
    message: "服务器内部错误，请稍后重试",
    extensions: {
      code: "INTERNAL_ERROR"
    }
  };
}

// 在 Apollo Server 中使用
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError
});
\`\`\`\`\`\`

## 服务端错误日志

在生产环境中，完善的错误日志是排查问题的关键。你需要记录足够的上下文信息，同时避免泄露敏感数据。

### 日志记录最佳实践

\`\`\`javascript
function logGraphQLError(error, context) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    // 错误路径
    path: error.path ? error.path.join(".") : "unknown",
    // 请求信息
    requestId: context.requestId,
    userId: context.currentUser ? context.currentUser.id : "anonymous",
    // 查询信息（注意：不要记录完整查询，可能包含敏感数据）
    operationName: context.operationName || "anonymous",
    // 错误类型
    errorType: error instanceof GraphQLError ? "GraphQLError" : "UnknownError",
    // 扩展信息
    extensions: error.extensions || {},
    // 堆栈信息（仅开发环境）
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined
  };

  // 写入日志系统
  logger.error("GraphQL 请求错误", logEntry);
}
\`\`\`\`\`\`

## 错误处理最佳实践

### 1. 分层错误处理

将错误处理分为三层：
- **Resolver 层**：捕获业务逻辑错误，抛出 GraphQLError
- **服务层**：统一格式化和过滤错误
- **客户端层**：解析错误码，展示用户友好信息

### 2. 使用错误码而非错误消息

客户端应该根据错误码做逻辑判断，而不是解析错误消息文字。错误消息可能随时变化（如国际化），但错误码应该保持稳定。

\`\`\`javascript
// 客户端处理
if (error.extensions.code === "AUTH_TOKEN_EXPIRED") {
  // 刷新 token
  await refreshToken();
  // 重试请求
  return retryQuery();
}
\`\`\`\`\`\`

### 3. 永远不要暴露敏感信息

不要在错误消息中包含数据库连接字符串、堆栈跟踪（生产环境）、用户密码、API 密钥等敏感信息。

### 4. 记录错误但不过度记录

记录所有错误到日志，但避免记录重复的、可预期的错误（如验证错误）。为错误设置不同的严重级别。

### 5. 提供足够的上下文

错误响应中应该包含足够的信息让客户端和开发者能够定位问题：path、locations、extensions.code。

### 6. 使用 Apollo Server 的插件机制

\`\`\`javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        return {
          async didEncounterErrors({ errors, request }) {
            // 记录所有错误
            for (const error of errors) {
              logGraphQLError(error, request.context);
            }
          }
        };
      }
    }
  ]
});
\`\`\`\`\`\`

### 7. 设置查询超时

防止长时间运行的查询占用资源。

\`\`\`javascript
const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new GraphQLError("查询超时", {
          extensions: { code: "QUERY_TIMEOUT" }
        })), 5000)
      );
      const query = context.db.findUserById(args.id);
      return Promise.race([query, timeout]);
    }
  }
};
\`\`\`\`\`\`

## 小结

GraphQL 的验证系统是类型安全的第一道防线。内置验证规则在查询执行前就能发现大部分问题，包括类型不匹配、字段不存在、参数缺失等。自定义验证规则可以进一步限制查询深度和复杂度，防止滥用。自定义标量提供了数据级别的验证能力。

错误处理方面，GraphQL 的 errors 数组格式提供了结构化的错误信息，包括 message、locations、path 和 extensions。部分成功（data + errors 同时返回）是 GraphQL 的一个独特优势，让客户端可以优雅地处理部分失败。通过 GraphQLError 和 extensions 字段，你可以构建丰富的错误信息体系。在生产环境中，错误过滤和日志记录是保障服务稳定性和安全性的关键环节。`,
    code: `# === Schema ===
scalar Email
scalar DateTime
scalar PositiveInt

type Query {
  user(id: ID!): User
  users(limit: PositiveInt = 10, offset: Int = 0): [User!]!
  post(id: ID!): Post
  posts(limit: Int = 10, offset: Int = 0): PostConnection!
}

type Mutation {
  createUser(email: Email!, name: String!, role: UserRole!): CreateUserPayload!
  updateUser(id: ID!, email: Email, name: String, role: UserRole): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

type User {
  id: ID!
  name: String!
  email: Email!
  role: UserRole!
  bio: String
  posts: [Post!]!
  postCount: Int!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  likeCount: Int!
  commentCount: Int!
  publishedAt: DateTime!
  tags: [String!]!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

enum UserRole {
  ADMIN
  EDITOR
  READER
}

type CreateUserPayload {
  user: User
  errors: [UserError!]
}

type UpdateUserPayload {
  user: User
  errors: [UserError!]
}

type DeleteUserPayload {
  success: Boolean!
  errors: [UserError!]
}

type UserError {
  message: String!
  code: String!
  field: String
}

# === Resolvers ===
const users = [
  { id: "1", name: "张三", email: "zhangsan@example.com", role: "ADMIN", bio: "全栈开发者", isActive: true, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-06-15T10:30:00Z" },
  { id: "2", name: "李四", email: "lisi@example.com", role: "EDITOR", bio: "前端工程师", isActive: true, createdAt: "2024-02-15T00:00:00Z", updatedAt: "2024-06-14T09:00:00Z" },
  { id: "3", name: "王五", email: "wangwu@example.com", role: "READER", bio: "后端工程师", isActive: false, createdAt: "2024-03-20T00:00:00Z", updatedAt: "2024-06-10T18:00:00Z" }
];

const posts = [
  { id: "101", title: "GraphQL 验证与错误处理", content: "深入理解 GraphQL 的验证机制...", authorId: "1", likeCount: 42, commentCount: 5, publishedAt: "2024-05-01T00:00:00Z", tags: ["GraphQL", "Validation"] },
  { id: "102", title: "错误处理最佳实践", content: "构建健壮的 GraphQL 错误处理体系...", authorId: "1", likeCount: 28, commentCount: 3, publishedAt: "2024-05-15T00:00:00Z", tags: ["GraphQL", "Error Handling"] },
  { id: "103", title: "自定义标量类型", content: "GraphQL 自定义标量的实现与使用...", authorId: "2", likeCount: 15, commentCount: 2, publishedAt: "2024-06-01T00:00:00Z", tags: ["GraphQL", "Scalars"] },
  { id: "104", title: "GraphQL 安全指南", content: "保护你的 GraphQL API 免受攻击...", authorId: "2", likeCount: 36, commentCount: 8, publishedAt: "2024-06-10T00:00:00Z", tags: ["GraphQL", "Security"] },
  { id: "105", title: "验证规则深入", content: "自定义 GraphQL 验证规则...", authorId: "3", likeCount: 20, commentCount: 4, publishedAt: "2024-06-15T00:00:00Z", tags: ["GraphQL", "Validation"] }
];

function validateEmail(email) {
  if (typeof email !== "string" || email.indexOf("@") === -1) {
    return { valid: false, message: "Email 格式无效，必须包含 @" };
  }
  var parts = email.split("@");
  if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
    return { valid: false, message: "Email 格式无效" };
  }
  return { valid: true };
}

function createUserError(message, code, field) {
  return { message: message, code: code, field: field || null };
}

function findUserById(id) {
  var user = users.find(function(u) { return u.id === id; });
  if (!user) {
    throw new Error("USER_NOT_FOUND: 用户不存在，ID: " + id);
  }
  return user;
}

function getUserPostCount(userId) {
  return posts.filter(function(p) { return p.authorId === userId; }).length;
}

function getUserPosts(userId) {
  return posts.filter(function(p) { return p.authorId === userId; });
}

const resolvers = {
  Query: {
    user: (parent, args) => {
      if (!args.id) {
        throw new Error("VALIDATION_ERROR: id 参数是必填的");
      }
      return findUserById(args.id);
    },
    users: (parent, args) => {
      var limit = args.limit || 10;
      var offset = args.offset || 0;
      if (limit < 1) {
        throw new Error("VALIDATION_ERROR: limit 必须是正整数");
      }
      if (offset < 0) {
        throw new Error("VALIDATION_ERROR: offset 不能为负数");
      }
      return users.slice(offset, offset + limit);
    },
    post: (parent, args) => {
      var post = posts.find(function(p) { return p.id === args.id; });
      if (!post) {
        throw new Error("POST_NOT_FOUND: 文章不存在，ID: " + args.id);
      }
      return post;
    },
    posts: (parent, args) => {
      var limit = args.limit || 10;
      var offset = args.offset || 0;
      var result = posts.slice();
      var totalCount = result.length;
      var paged = result.slice(offset, offset + limit);
      var edges = paged.map(function(p, idx) {
        return { cursor: "cursor_" + (offset + idx), node: p };
      });
      return {
        edges: edges,
        pageInfo: {
          hasNextPage: offset + limit < totalCount,
          hasPreviousPage: offset > 0,
          startCursor: edges.length > 0 ? edges[0].cursor : null,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
        },
        totalCount: totalCount
      };
    }
  },
  Mutation: {
    createUser: (parent, args) => {
      var errors = [];
      var emailResult = validateEmail(args.email);
      if (!emailResult.valid) {
        errors.push(createUserError(emailResult.message, "VALIDATION_INVALID_EMAIL", "email"));
      }
      if (!args.name || args.name.trim().length === 0) {
        errors.push(createUserError("用户名不能为空", "VALIDATION_REQUIRED_FIELD", "name"));
      }
      if (args.name && args.name.trim().length < 2) {
        errors.push(createUserError("用户名至少需要 2 个字符", "VALIDATION_MIN_LENGTH", "name"));
      }
      var emailExists = users.some(function(u) { return u.email === args.email; });
      if (emailExists) {
        errors.push(createUserError("该邮箱已被注册", "USER_EMAIL_EXISTS", "email"));
      }
      if (errors.length > 0) {
        return { user: null, errors: errors };
      }
      var newUser = {
        id: String(users.length + 1),
        name: args.name.trim(),
        email: args.email.toLowerCase().trim(),
        role: args.role,
        bio: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      return { user: newUser, errors: [] };
    },
    updateUser: (parent, args) => {
      var errors = [];
      var user = users.find(function(u) { return u.id === args.id; });
      if (!user) {
        errors.push(createUserError("用户不存在", "USER_NOT_FOUND", "id"));
        return { user: null, errors: errors };
      }
      if (args.email !== undefined) {
        var emailResult = validateEmail(args.email);
        if (!emailResult.valid) {
          errors.push(createUserError(emailResult.message, "VALIDATION_INVALID_EMAIL", "email"));
        }
        var emailExists = users.some(function(u) { return u.email === args.email && u.id !== args.id; });
        if (emailExists) {
          errors.push(createUserError("该邮箱已被其他用户使用", "USER_EMAIL_EXISTS", "email"));
        }
      }
      if (args.name !== undefined && args.name.trim().length === 0) {
        errors.push(createUserError("用户名不能为空", "VALIDATION_REQUIRED_FIELD", "name"));
      }
      if (errors.length > 0) {
        return { user: null, errors: errors };
      }
      if (args.email !== undefined) user.email = args.email.toLowerCase().trim();
      if (args.name !== undefined) user.name = args.name.trim();
      if (args.role !== undefined) user.role = args.role;
      user.updatedAt = new Date().toISOString();
      return { user: user, errors: [] };
    },
    deleteUser: (parent, args) => {
      var errors = [];
      var index = users.findIndex(function(u) { return u.id === args.id; });
      if (index === -1) {
        errors.push(createUserError("用户不存在", "USER_NOT_FOUND", "id"));
        return { success: false, errors: errors };
      }
      var userPosts = getUserPosts(args.id);
      if (userPosts.length > 0) {
        errors.push(createUserError("该用户还有 " + userPosts.length + " 篇文章，无法删除", "USER_HAS_POSTS", "id"));
        return { success: false, errors: errors };
      }
      users.splice(index, 1);
      return { success: true, errors: [] };
    }
  },
  User: {
    posts: (parent) => {
      return getUserPosts(parent.id);
    },
    postCount: (parent) => {
      return getUserPostCount(parent.id);
    }
  },
  Post: {
    author: (parent) => {
      return findUserById(parent.authorId);
    }
  }
};

# === Query ===
# 验证示例：正确的查询和可能触发验证错误的场景
query {
  # 正确查询：获取用户信息
  user(id: "1") {
    id
    name
    email
    role
    bio
    isActive
    createdAt
    updatedAt
    postCount
    posts {
      id
      title
      likeCount
      commentCount
      publishedAt
      tags
      author {
        id
        name
      }
    }
  }
  # 用户列表（带分页）
  users(limit: 5, offset: 0) {
    id
    name
    role
    postCount
  }
  # 文章列表（带分页）
  posts(limit: 3, offset: 0) {
    edges {
      cursor
      node {
        id
        title
        likeCount
        author {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}`,
  },
];