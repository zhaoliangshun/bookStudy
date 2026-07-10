// =============================================================
// AI 编程方法教程 —— 第六批章节（进阶实战组，共 5 章）
// =============================================================

export const chapters = [
  // ============================================================
  // 第 26 章：AI辅助全栈开发：前后端一站式
  // ============================================================
  {
    id: "ai-fullstack",
    icon: "🏗️",
    group: "进阶实战",
    title: "AI辅助全栈开发：前后端一站式",
    content: `
# AI辅助全栈开发：前后端一站式

## 引言：全栈开发的新纪元

全栈开发历来是程序员能力模型中的"圣杯"——能够同时驾驭前端和后端，意味着你可以独立完成一个完整的应用。但全栈开发也意味着更多的学习曲线、更广的知识面、更多的上下文切换。AI的出现正在改变这一切。

试想一下：你只需要用自然语言描述一个应用的想法，AI就能帮你生成前端界面、后端API、数据库Schema，甚至部署配置文件。这不是科幻，而是正在发生的现实。本章将带你深入探索如何用AI实现真正的一站式全栈开发。

全栈开发的核心挑战不是单点技术难度，而是不同技术栈之间的协调。前端的状态管理、后端的API设计、数据库的Schema——这些看似独立的部分，必须在一个完整的系统中协同工作。AI能够在这些层面之间建立桥梁，让全栈开发从"分别建造每座桥"变成"描述目的地，AI帮你规划路线"。

## 一、AI全栈开发的核心原理

### 1.1 从"单点生成"到"系统生成"的跃迁

早期的AI编程工具主要专注于代码补全——在单个文件中完成一个函数或一个类。这是"单点生成"模式，类似于给你一块砖头的形状说明。而全栈开发需要的是"系统生成"——AI需要理解应用的整体架构，包括数据流、组件关系、API契约等。

\`\`\`
单点生成：函数 → 组件 → 模块
系统生成：架构 → 数据流 → 组件树 → 路由 → API → 数据库
\`\`\`

系统生成的关键在于AI需要维护一个"心智模型"——对整个应用的结构有持续的理解。这要求AI能够：
- 追踪前后端之间的数据契约
- 理解组件之间的依赖关系
- 保持数据库Schema和API接口的一致性
- 管理多个文件之间的引用关系

### 1.2 全栈AI提示词的核心要素

全栈开发提示词与单点代码生成的提示词有本质区别。你需要描述的是一个"系统"，而非一个"函数"。

**要素一：应用架构描述**

你需要告诉AI应用的整体架构。这不是要求你画出完整的架构图，而是用自然语言描述关键的技术决策。

\`\`\`
应用架构描述示例：
- 前端：React 18 + TypeScript + Tailwind CSS
- 后端：Next.js API Routes（或Express/Fastify）
- 数据库：PostgreSQL（通过Prisma ORM）
- 认证：NextAuth.js（JWT + OAuth）
- 状态管理：React Query（服务端状态）+ Zustand（客户端状态）
- 部署：Vercel + Railway（数据库）
\`\`\`

**要素二：功能模块清单**

将应用的功能拆解为清晰的模块列表，每个模块包括其核心功能。

\`\`\`
功能模块清单：
1. 用户认证模块
   - 邮箱注册和登录
   - GitHub OAuth登录
   - 密码重置流程
   - 邮箱验证
   
2. 内容管理模块
   - 文章的创建、编辑、删除
   - Markdown编辑器
   - 草稿和发布状态管理
   - 标签和分类管理
   
3. 评论系统模块
   - 嵌套评论（支持回复）
   - 评论审核
   - 点赞功能
   - 实时通知
\`\`\`

**要素三：数据模型描述**

描述核心数据实体及其关系。这是连接前端和后端的关键桥梁。

\`\`\`
数据模型描述：
- User：id, name, email, password, avatar, role, createdAt
- Post：id, title, slug, content, excerpt, status, authorId, createdAt, updatedAt
- Comment：id, content, postId, authorId, parentId, createdAt
- Tag：id, name, slug
- PostTag：postId, tagId（多对多关系）
\`\`\`

**要素四：路由和页面结构**

描述应用的路由结构和每个页面的核心功能。

\`\`\`
路由结构：
/ → 首页（文章列表）
/posts/[slug] → 文章详情页
/create → 创建文章（需要登录）
/edit/[id] → 编辑文章（需要登录，作者本人）
/profile → 个人主页
/settings → 设置页面
/api/auth/* → 认证API
/api/posts/* → 文章API
/api/comments/* → 评论API
\`\`\`

### 1.3 全栈提示词的"洋葱模型"

为了高效地进行全栈AI开发，我提出了"洋葱模型"——从外到内逐层描述，从内到外逐层验证。

\`\`\`
洋葱模型（从外到内描述）：
第一层：技术栈选型和部署目标
第二层：路由结构和页面布局
第三层：组件树和数据流
第四层：API接口和数据模型
第五层（核心）：业务逻辑和状态管理
\`\`\`

**为什么从外到内描述？**

因为外层定义的是"约束条件"，内层定义的是"实现细节"。AI需要先理解约束，才能在约束内实现。就像一个建筑师需要先知道地基大小才能设计房间布局。

**为什么从内到外验证？**

因为核心业务逻辑是最容易出错的。先验证核心逻辑（数据模型、API行为），再验证外层展示（UI渲染、路由跳转），效率最高。

## 二、实战：生成一个完整博客应用

### 2.1 第一阶段：项目初始化

让我们通过一个完整的博客应用案例，展示如何用AI进行全栈开发。我们将使用Next.js作为全栈框架。

**第一步：项目结构生成**

首先，让AI生成项目的完整文件结构。

\`\`\`
提示词：
请为Next.js博客应用生成完整的项目文件结构，包括：
- 前端页面（首页、文章详情、创建文章、用户设置）
- API路由（认证、文章CRUD、评论）
- 数据库Schema（Prisma）
- 共享类型定义
- 中间件和工具函数
- 配置文件

输出格式：文件树结构，每个文件标注其用途。
\`\`\`

AI会生成类似这样的结构：

\`\`\`
blogsite/
├── prisma/
│   ├── schema.prisma          # 数据库Schema定义
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   ├── posts/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx   # 文章详情页
│   │   │   └── create/
│   │   │       └── page.tsx   # 创建文章页
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── posts/
│   │   │   │   ├── route.ts        # GET（列表）/ POST（创建）
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET/PUT/DELETE
│   │   │   └── comments/
│   │   │       └── route.ts
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                # 通用UI组件
│   │   ├── posts/             # 文章相关组件
│   │   ├── comments/          # 评论相关组件
│   │   └── layout/            # 布局组件
│   ├── lib/
│   │   ├── prisma.ts          # Prisma客户端
│   │   ├── auth.ts            # 认证工具函数
│   │   ├── validation.ts      # 数据验证
│   │   └── utils.ts           # 通用工具函数
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   └── useComments.ts
│   ├── types/
│   │   └── index.ts           # 共享类型定义
│   └── middleware.ts          # Next.js中间件
├── .env                       # 环境变量
├── .env.example               # 环境变量示例
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── next.config.ts
\`\`\`

### 2.2 第二阶段：数据库Schema生成

**提示词：**

\`\`\`
请为博客应用生成Prisma Schema，包括以下实体：
1. User（用户）：id, name, email, password(hashed), image, bio, role(USER/ADMIN), createdAt, updatedAt
2. Post（文章）：id, title, slug, content, excerpt, coverImage, published(boolean), authorId, createdAt, updatedAt
3. Comment（评论）：id, content, postId, authorId, parentId(自引用，支持嵌套回复), createdAt, updatedAt
4. Tag（标签）：id, name, slug
5. PostTag（文章-标签关联表）

要求：
- 使用PostgreSQL
- 建立正确的关联关系（一对多、多对多、自引用）
- 添加索引（在slug、authorId、postId等字段）
- 使用UUID作为主键
- 添加createdAt和updatedAt的默认值
\`\`\`

AI会生成类似这样的Prisma Schema：

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  image     String?
  bio       String?
  role      Role      @default(USER)
  posts     Post[]
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Post {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  coverImage  String?
  published   Boolean   @default(false)
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  comments    Comment[]
  tags        PostTag[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([authorId])
  @@index([published])
  @@index([createdAt])
}

model Comment {
  id        String    @id @default(uuid())
  content   String
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([postId])
  @@index([authorId])
  @@index([parentId])
}

model Tag {
  id    String    @id @default(uuid())
  name  String    @unique
  slug  String    @unique
  posts PostTag[]
}

model PostTag {
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String

  @@id([postId, tagId])
}

enum Role {
  USER
  ADMIN
}
\`\`\`

### 2.3 第三阶段：API路由生成

有了数据库Schema，接下来生成API路由。我们将使用Next.js的App Router。

**提示词：**

\`\`\`
请为博客应用生成以下API路由的完整实现：

1. POST /api/auth/register - 用户注册
2. POST /api/auth/login - 用户登录（返回JWT或Session）
3. GET /api/posts - 文章列表（支持分页、搜索、标签筛选）
4. POST /api/posts - 创建文章（需要认证）
5. GET /api/posts/[id] - 文章详情
6. PUT /api/posts/[id] - 更新文章（需要认证，作者本人）
7. DELETE /api/posts/[id] - 删除文章（需要认证，作者本人或管理员）
8. GET /api/comments?postId=xxx - 获取文章评论
9. POST /api/comments - 创建评论（需要认证）

要求：
- 使用bcrypt进行密码哈希
- 使用NextAuth.js或JWT进行认证
- 使用Zod进行请求验证
- 统一的错误处理
- 合理的HTTP状态码
- 使用Next.js 14的App Router route handler格式
\`\`\`

### 2.4 第四阶段：前端组件生成

**提示词：**

\`\`\`
请为博客应用生成以下前端组件：

1. PostCard - 文章卡片组件（用于列表展示）
2. PostEditor - 文章编辑器（Markdown支持）
3. CommentSection - 评论区域（支持嵌套回复）
4. AuthForm - 登录/注册表单组件
5. SearchBar - 搜索栏（带防抖）
6. TagFilter - 标签筛选器
7. Pagination - 分页组件
8. UserAvatar - 用户头像（带下拉菜单）

要求：
- 使用React 18 + TypeScript
- 使用Tailwind CSS进行样式设计
- 支持加载状态和错误状态
- 支持无障碍访问（ARIA标签）
- 响应式设计
- 使用React Server Components（RSC）适当分离服务端和客户端组件
\`\`\`

### 2.5 关键的"全栈协同"技巧

在全栈AI开发中，最关键的技巧是确保前后端的一致性。以下是一些实战技巧：

**技巧一：共享类型定义**

在前端和后端之间共享TypeScript类型定义，确保API契约的一致性。

\`\`\`typescript
// types/index.ts —— 前后端共享的类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  author: User;
  authorId: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
}
\`\`\`

**技巧二：API契约先行**

在生成任何代码之前，先让AI生成API契约文档。这就像建筑中的蓝图——在开始施工之前，所有人都应该对最终结果有共识。

\`\`\`
提示词：请为我的博客应用生成完整的API文档，包括每个端点的请求格式、响应格式、错误码和示例。
\`\`\`

**技巧三：数据流追踪**

让AI帮你追踪数据在前端和后端之间的完整流动路径。

\`\`\`
提示词：请描述用户发布一篇文章时，数据从浏览器到数据库再返回的完整流程，包括每一步的数据格式变化。
\`\`\`

AI会生成这样的数据流追踪：

\`\`\`
1. 用户填写表单 → 前端状态：{ title: string, content: string, tags: string[] }
2. 前端验证 → Zod schema验证 → 通过或返回错误
3. 发起POST请求 → fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) })
4. Next.js中间件 → 验证JWT token → 解析出userId
5. API Route Handler → Zod再次验证 → 生成slug → Prisma.create()
6. Prisma → SQL INSERT → 数据库存储
7. 返回Post对象 → JSON序列化 → HTTP响应
8. 前端接收 → React Query缓存更新 → UI重新渲染 → 跳转到文章详情页
\`\`\`

## 三、AI全栈开发的高级模式

### 3.1 端到端类型安全

端到端类型安全（End-to-End Type Safety）是现代全栈开发的重要趋势。它意味着从数据库到API再到前端UI，类型信息在整个数据流中保持一致。

使用AI实现端到端类型安全的关键步骤：

1. **从Prisma Schema生成类型**：Prisma自动生成类型定义
2. **API响应类型化**：确保每个API都返回明确的类型
3. **前端使用推断类型**：利用tRPC或类似工具实现类型共享

**tRPC + AI的协作模式：**

\`\`\`typescript
// server/router.ts —— tRPC路由定义
export const postRouter = router({
  list: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      search: z.string().optional(),
      tag: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.post.findMany({
        where: { /* ... */ },
        include: { author: true, tags: { include: { tag: true } } },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      });
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          slug: generateSlug(input.title),
          authorId: ctx.user.id,
          tags: {
            create: input.tags?.map(tagId => ({ tagId })) || [],
          },
        },
      });
    }),
});
\`\`\`

### 3.2 实时功能与AI

实时功能（如通知、评论推送、在线状态）是全栈开发中的高级话题。AI可以帮助你设计实时架构。

**实时功能的技术选型：**

| 场景 | 推荐方案 | 复杂度 | 适用规模 |
|------|---------|--------|---------|
| 简单通知 | Server-Sent Events (SSE) | 低 | 小到中 |
| 双向通信 | WebSocket (Socket.io) | 中 | 中到大 |
| 协作编辑 | CRDT (Yjs + WebSocket) | 高 | 中到大 |
| 实时数据库 | Supabase Realtime | 低 | 小到中 |
| 大规模推送 | Redis Pub/Sub + SSE | 中 | 大 |

**AI辅助实时功能设计提示词：**

\`\`\`
提示词：请为我的博客应用设计实时评论通知系统。要求：
1. 用户A发表评论后，文章作者B应收到实时通知
2. 通知应显示在导航栏的通知图标上
3. 支持未读计数
4. 点击通知跳转到对应评论

请提供完整的架构设计，包括前端组件、后端API和WebSocket事件设计。
\`\`\`

### 3.3 Monorepo管理与AI

随着项目规模增长，你可能需要将前端和后端拆分为独立的包，但仍在同一个仓库中管理。这就是Monorepo模式。

**AI辅助Monorepo结构设计：**

\`\`\`
提示词：请为我的全栈博客应用设计Turborepo monorepo结构，包括：
- apps/web（Next.js前端）
- apps/api（Express API服务器）
- packages/shared（共享类型和工具函数）
- packages/ui（共享UI组件库）
- packages/database（Prisma客户端和Schema）
- packages/config（ESLint、TypeScript、Tailwind配置）

输出完整的目录结构和每个包的职责说明。
\`\`\`

### 3.4 部署配置生成

**AI辅助部署配置：**

\`\`\`
提示词：我的博客应用使用以下技术栈：
- Next.js 14（前端 + API Routes）
- PostgreSQL（数据库）
- Prisma（ORM）
- NextAuth.js（认证）
- Cloudinary（图片存储）
- Resend（邮件发送）

请生成：
1. Vercel部署配置（vercel.json）
2. Railway数据库部署配置
3. GitHub Actions CI/CD配置
4. Docker Compose（本地开发环境）
5. .env.example（完整的环境变量列表）
\`\`\`

## 四、全栈开发的常见陷阱与AI防治

### 4.1 陷阱一：前后端数据不一致

**问题表现：** 前端期望的字段名和后端返回的字段名不匹配，导致数据显示异常。

**AI防治方案：**
- 在生成代码前，先让AI生成共享类型定义
- 使用Zod schema同时用于前后端验证
- 让AI生成API响应的Mock数据用于前端开发

**提示词示例：**

\`\`\`
提示词：请为我的博客应用生成一套Mock数据（JSON格式），
包含3个用户、5篇文章、10条评论。确保Mock数据与Prisma Schema的类型完全一致。
\`\`\`

### 4.2 陷阱二：认证状态丢失

**问题表现：** 前端显示已登录，但API请求失败，因为认证token没有正确传递。

**AI防治方案：**
- 让AI生成统一的API客户端（封装fetch/axios），自动附加认证头
- 让AI生成认证中间件测试用例

\`\`\`typescript
// 统一的API客户端 —— 由AI生成
const apiClient = {
  async fetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      // 自动处理认证过期
      clearAuthToken();
      window.location.href = '/login';
      throw new Error('认证已过期，请重新登录');
    }
    
    return response.json();
  },
  
  get<T>(url: string) {
    return this.fetch<T>(url);
  },
  
  post<T>(url: string, data: unknown) {
    return this.fetch<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put<T>(url: string, data: unknown) {
    return this.fetch<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete<T>(url: string) {
    return this.fetch<T>(url, { method: 'DELETE' });
  },
};
\`\`\`

### 4.3 陷阱三：N+1查询问题

**问题表现：** 获取文章列表时，每篇文章又单独查询作者信息，导致数据库查询次数爆炸。

**AI防治方案：**
- 让AI检查Prisma查询中的include语句
- 使用select而非include来精确控制返回字段
- 利用Prisma的批量查询优化

**提示词示例：**

\`\`\`
提示词：请检查以下API端点是否存在N+1查询问题，并给出优化方案：
- GET /api/posts（文章列表，包含作者信息、标签、评论数）
- GET /api/posts/[id]（文章详情，包含完整评论树）
\`\`\`

### 4.4 陷阱四：环境变量泄露

**问题表现：** 数据库连接字符串、API密钥等敏感信息被提交到前端代码中。

**AI防治方案：**
- 让AI生成.env.example文件，明确标注哪些变量是公开的、哪些是私密的
- 使用NEXT_PUBLIC_前缀区分公开和私有环境变量
- 让AI生成安全审查checklist

### 4.5 陷阱五：过度工程化

**问题表现：** 为简单的博客应用设计了微服务架构、消息队列、事件溯源等复杂模式。

**AI防治方案：**
- 在提示词中明确项目规模和预期用户量
- 让AI提供"方案A（简单）"和"方案B（完整）"两种选择
- 遵循"渐进式增强"原则

## 五、"全栈提示词"技术

### 5.1 全栈提示词模板

以下是我经过大量实践总结的"全栈提示词"模板：

\`\`\`
【项目概述】
项目名称：{名称}
项目类型：{Web应用/移动端后台/API服务/管理后台}
目标用户：{用户画像}
核心功能：{3-5个核心功能描述}

【技术栈】
前端：{前端框架和版本}
后端：{后端框架和版本}
数据库：{数据库类型和ORM}
认证：{认证方案}
UI库：{UI组件库和CSS方案}
部署：{部署平台}

【数据模型】
{列出核心实体、字段和关系}

【功能详细说明】
1. {功能1名称}
   - {功能描述}
   - {用户流程}
   - {API端点}
   - {前端组件}

2. {功能2名称}
   - {功能描述}
   - {用户流程}
   - {API端点}
   - {前端组件}

【非功能需求】
- 性能：{页面加载时间、API响应时间}
- 安全：{认证要求、数据加密要求}
- 扩展性：{预期用户量、数据量}
- 可访问性：{WCAG级别要求}

【输出要求】
请生成以下内容：
1. 完整的项目文件结构
2. 数据库Schema
3. 所有API路由的实现
4. 核心前端组件
5. 共享类型定义
6. 配置文件
7. 部署脚本
\`\`\`

### 5.2 迭代式全栈开发流程

全栈开发不是一蹴而就的。推荐的迭代流程：

**第一轮：骨架生成**
- 生成项目结构、数据库Schema、基础路由
- 目标是"能跑起来"

**第二轮：核心功能**
- 实现认证、CRUD操作
- 目标是"核心功能可用"

**第三轮：完善体验**
- 添加加载状态、错误处理、表单验证
- 目标是"用户体验好"

**第四轮：优化和部署**
- 性能优化、SEO、部署配置
- 目标是"生产环境可用"

每一轮都使用AI进行代码生成，但每一轮的提示词重点不同：

\`\`\`
第一轮提示词重点：项目结构、技术选型、基础配置
第二轮提示词重点：业务逻辑、数据流、API实现
第三轮提示词重点：UI细节、状态管理、错误处理
第四轮提示词重点：性能、安全、部署
\`\`\`

## 六、案例研究：三个全栈AI开发实战

### 6.1 案例一：任务管理应用

**需求：** 一个类似Trello的任务管理看板应用。

**AI生成的内容：**
- 项目结构（Next.js + Prisma + PostgreSQL）
- 看板、列表、卡片的数据模型
- 拖拽排序的API
- 实时协作（WebSocket）
- 用户邀请和权限管理

**关键经验：**
- 拖拽排序的状态管理是难点，需要AI生成乐观更新逻辑
- 实时协作需要仔细设计WebSocket事件

### 6.2 案例二：电商后台管理系统

**需求：** 商品管理、订单管理、用户管理的后台系统。

**AI生成的内容：**
- 复杂的CRUD表单
- 数据表格（排序、筛选、分页）
- 图表（销售额统计、用户增长）
- RBAC权限管理
- 批量操作

**关键经验：**
- 表格组件的复用是关键，让AI生成可配置的通用表格组件
- 权限管理需要在前端和后端同时实施

### 6.3 案例三：SaaS订阅管理平台

**需求：** 多租户的SaaS平台，支持订阅管理和使用量计费。

**AI生成的内容：**
- 多租户数据隔离
- Stripe支付集成
- 使用量追踪和计费
- 团队管理
- 审计日志

**关键经验：**
- 多租户数据隔离是最复杂的设计决策，需要AI提供多种方案对比
- 支付集成需要特别注意错误处理和安全

## 七、全栈AI开发的最佳实践清单

### 7.1 开发前

- [ ] 用自然语言描述完整的应用功能
- [ ] 让AI生成数据模型并反复确认
- [ ] 让AI生成API契约文档
- [ ] 确定技术栈和部署方案
- [ ] 让AI生成项目文件结构

### 7.2 开发中

- [ ] 每个功能模块单独生成，保持提示词聚焦
- [ ] 使用共享类型定义保持前后端一致
- [ ] 让AI生成错误处理逻辑
- [ ] 让AI生成加载状态和空状态
- [ ] 定期让AI审查代码的一致性

### 7.3 开发后

- [ ] 让AI生成测试用例
- [ ] 让AI生成部署配置
- [ ] 让AI生成README文档
- [ ] 让AI进行安全审查
- [ ] 让AI进行性能优化建议

## 总结

AI辅助全栈开发正在从根本上改变我们构建应用的方式。它不再是"AI帮你写几行代码"，而是"AI帮你构建整个应用"。这种转变要求我们掌握新的技能——全栈提示词工程、系统级思维、以及AI协作能力。

全栈AI开发的核心不是让AI替代你思考，而是让AI帮你处理那些重复性的、机械性的工作，让你能够专注于真正重要的事情——理解用户需求、设计优秀的用户体验、做出正确的技术决策。

记住：最好的全栈开发者不是最会写代码的人，而是最懂得如何描述需求、如何分解问题、如何验证结果的人。AI让这些"软技能"变成了生产力。

全栈开发的下一个十年，将属于那些善于与AI协作的人。你准备好了吗？
    `,
    code: `
// =============================================================
// 全栈项目生成器
// 根据项目描述，生成完整的项目结构（前端、后端、数据库）
// =============================================================

class FullStackProjectGenerator {
  constructor() {
    // 技术栈模板
    this.techStacks = {
      'nextjs-postgres': {
        name: 'Next.js + PostgreSQL',
        frontend: 'Next.js 14 + React 18 + TypeScript + Tailwind CSS',
        backend: 'Next.js API Routes',
        database: 'PostgreSQL + Prisma ORM',
        auth: 'NextAuth.js',
        deployment: 'Vercel',
        fileStructure: this.generateNextJSStructure,
      },
      'mern': {
        name: 'MERN Stack',
        frontend: 'React 18 + TypeScript + Vite + Tailwind CSS',
        backend: 'Express.js + TypeScript',
        database: 'MongoDB + Mongoose',
        auth: 'JWT + bcrypt',
        deployment: 'Railway + Vercel',
        fileStructure: this.generateMERNStructure,
      },
      'django-react': {
        name: 'Django + React',
        frontend: 'React 18 + TypeScript + Vite',
        backend: 'Django + Django REST Framework',
        database: 'PostgreSQL',
        auth: 'Django Session + JWT',
        deployment: 'AWS + Vercel',
        fileStructure: this.generateDjangoReactStructure,
      },
    };
  }

  // 数据模型推断
  inferDataModel(features) {
    const models = [];
    const relationships = [];

    const featurePatterns = [
      {
        keywords: ['用户', 'user', '登录', 'login', '注册', 'register', '认证', 'auth'],
        model: {
          name: 'User',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'email', type: 'String', unique: true },
            { name: 'password', type: 'String', hashed: true },
            { name: 'name', type: 'String' },
            { name: 'role', type: 'Enum', values: ['USER', 'ADMIN'] },
            { name: 'createdAt', type: 'DateTime' },
            { name: 'updatedAt', type: 'DateTime' },
          ],
        },
      },
      {
        keywords: ['文章', 'post', '博客', 'blog', '内容', 'content'],
        model: {
          name: 'Post',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'title', type: 'String' },
            { name: 'slug', type: 'String', unique: true },
            { name: 'content', type: 'Text' },
            { name: 'published', type: 'Boolean', default: false },
            { name: 'authorId', type: 'UUID', foreignKey: true },
            { name: 'createdAt', type: 'DateTime' },
            { name: 'updatedAt', type: 'DateTime' },
          ],
        },
        relationships: [{ from: 'Post', to: 'User', type: 'belongsTo', field: 'authorId' }],
      },
      {
        keywords: ['评论', 'comment', '回复', 'reply'],
        model: {
          name: 'Comment',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'content', type: 'Text' },
            { name: 'postId', type: 'UUID', foreignKey: true },
            { name: 'authorId', type: 'UUID', foreignKey: true },
            { name: 'parentId', type: 'UUID', nullable: true, foreignKey: true },
            { name: 'createdAt', type: 'DateTime' },
            { name: 'updatedAt', type: 'DateTime' },
          ],
        },
        relationships: [
          { from: 'Comment', to: 'Post', type: 'belongsTo', field: 'postId' },
          { from: 'Comment', to: 'User', type: 'belongsTo', field: 'authorId' },
          { from: 'Comment', to: 'Comment', type: 'selfReference', field: 'parentId' },
        ],
      },
      {
        keywords: ['标签', 'tag', '分类', 'category'],
        model: {
          name: 'Tag',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'name', type: 'String', unique: true },
            { name: 'slug', type: 'String', unique: true },
          ],
        },
      },
      {
        keywords: ['商品', 'product', '产品', 'item'],
        model: {
          name: 'Product',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'name', type: 'String' },
            { name: 'description', type: 'Text' },
            { name: 'price', type: 'Decimal' },
            { name: 'stock', type: 'Int' },
            { name: 'images', type: 'String[]' },
            { name: 'sellerId', type: 'UUID', foreignKey: true },
            { name: 'createdAt', type: 'DateTime' },
            { name: 'updatedAt', type: 'DateTime' },
          ],
        },
        relationships: [{ from: 'Product', to: 'User', type: 'belongsTo', field: 'sellerId' }],
      },
      {
        keywords: ['订单', 'order', '购买', 'purchase'],
        model: {
          name: 'Order',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'status', type: 'Enum', values: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
            { name: 'totalAmount', type: 'Decimal' },
            { name: 'userId', type: 'UUID', foreignKey: true },
            { name: 'createdAt', type: 'DateTime' },
            { name: 'updatedAt', type: 'DateTime' },
          ],
        },
        relationships: [{ from: 'Order', to: 'User', type: 'belongsTo', field: 'userId' }],
      },
      {
        keywords: ['支付', 'payment', 'stripe'],
        model: {
          name: 'Payment',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'orderId', type: 'UUID', foreignKey: true },
            { name: 'amount', type: 'Decimal' },
            { name: 'currency', type: 'String', default: 'CNY' },
            { name: 'status', type: 'Enum', values: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
            { name: 'provider', type: 'String' },
            { name: 'createdAt', type: 'DateTime' },
          ],
        },
        relationships: [{ from: 'Payment', to: 'Order', type: 'belongsTo', field: 'orderId' }],
      },
      {
        keywords: ['通知', 'notification', '消息', 'message'],
        model: {
          name: 'Notification',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'type', type: 'String' },
            { name: 'content', type: 'Text' },
            { name: 'read', type: 'Boolean', default: false },
            { name: 'userId', type: 'UUID', foreignKey: true },
            { name: 'createdAt', type: 'DateTime' },
          ],
        },
        relationships: [{ from: 'Notification', to: 'User', type: 'belongsTo', field: 'userId' }],
      },
      {
        keywords: ['文件', 'file', '上传', 'upload', '图片', 'image'],
        model: {
          name: 'File',
          fields: [
            { name: 'id', type: 'UUID', primary: true },
            { name: 'filename', type: 'String' },
            { name: 'url', type: 'String' },
            { name: 'size', type: 'Int' },
            { name: 'mimeType', type: 'String' },
            { name: 'uploaderId', type: 'UUID', foreignKey: true },
            { name: 'createdAt', type: 'DateTime' },
          ],
        },
        relationships: [{ from: 'File', to: 'User', type: 'belongsTo', field: 'uploaderId' }],
      },
    ];

    for (const feature of features) {
      const featureLower = feature.toLowerCase();
      for (const pattern of featurePatterns) {
        for (const keyword of pattern.keywords) {
          if (featureLower.includes(keyword.toLowerCase())) {
            const existingModel = models.find(m => m.name === pattern.model.name);
            if (!existingModel) {
              models.push(pattern.model);
            }
            if (pattern.relationships) {
              for (const rel of pattern.relationships) {
                const exists = relationships.find(
                  r => r.from === rel.from && r.to === rel.to && r.field === rel.field
                );
                if (!exists) {
                  relationships.push(rel);
                }
              }
            }
            break;
          }
        }
      }
    }

    return { models, relationships };
  }

  // 推断API端点
  inferAPIEndpoints(models) {
    const endpoints = [];

    for (const model of models) {
      const name = model.name;
      const nameLower = name.toLowerCase();
      const namePlural = nameLower.endsWith('s') ? nameLower : nameLower + 's';

      endpoints.push({
        method: 'GET',
        path: \`/api/\${namePlural}\`,
        description: \`获取\${name}列表\`,
        auth: name === 'User' ? 'admin' : 'optional',
        query: ['page', 'pageSize', 'search', 'sort'],
      });

      endpoints.push({
        method: 'GET',
        path: \`/api/\${namePlural}/:id\`,
        description: \`获取\${name}详情\`,
        auth: 'optional',
      });

      endpoints.push({
        method: 'POST',
        path: \`/api/\${namePlural}\`,
        description: \`创建\${name}\`,
        auth: 'required',
      });

      endpoints.push({
        method: 'PUT',
        path: \`/api/\${namePlural}/:id\`,
        description: \`更新\${name}\`,
        auth: 'required',
      });

      endpoints.push({
        method: 'DELETE',
        path: \`/api/\${namePlural}/:id\`,
        description: \`删除\${name}\`,
        auth: 'required',
      });
    }

    return endpoints;
  }

  // 推断前端页面
  inferPages(features, models) {
    const pages = [
      { path: '/', component: 'HomePage', description: '首页' },
      { path: '/login', component: 'LoginPage', description: '登录页', auth: 'public' },
      { path: '/register', component: 'RegisterPage', description: '注册页', auth: 'public' },
    ];

    for (const model of models) {
      const name = model.name;
      const nameLower = name.toLowerCase();
      const namePlural = nameLower.endsWith('s') ? nameLower : nameLower + 's';

      pages.push({
        path: \`/\${namePlural}\`,
        component: \`\${name}ListPage\`,
        description: \`\${name}列表页\`,
        auth: 'optional',
      });

      pages.push({
        path: \`/\${namePlural}/:id\`,
        component: \`\${name}DetailPage\`,
        description: \`\${name}详情页\`,
        auth: 'optional',
      });

      pages.push({
        path: \`/\${namePlural}/create\`,
        component: \`Create\${name}Page\`,
        description: \`创建\${name}页\`,
        auth: 'required',
      });

      pages.push({
        path: \`/\${namePlural}/:id/edit\`,
        component: \`Edit\${name}Page\`,
        description: \`编辑\${name}页\`,
        auth: 'required',
      });
    }

    pages.push({ path: '/profile', component: 'ProfilePage', description: '个人主页', auth: 'required' });
    pages.push({ path: '/settings', component: 'SettingsPage', description: '设置页', auth: 'required' });

    return pages;
  }

  // 生成Prisma Schema
  generatePrismaSchema(models, relationships) {
    let schema = 'generator client {\\n';
    schema += '  provider = "prisma-client-js"\\n';
    schema += '}\\n\\n';
    schema += 'datasource db {\\n';
    schema += '  provider = "postgresql"\\n';
    schema += '  url      = env("DATABASE_URL")\\n';
    schema += '}\\n\\n';

    for (const model of models) {
      schema += \`model \${model.name} {\\n\`;

      for (const field of model.fields) {
        let fieldDef = \`  \${field.name} \${field.type}\`;

        if (field.primary) {
          fieldDef += ' @id @default(uuid())';
        }
        if (field.unique) {
          fieldDef += ' @unique';
        }
        if (field.default !== undefined) {
          if (typeof field.default === 'string') {
            fieldDef += \` @default("\${field.default}")\`;
          } else {
            fieldDef += \` @default(\${field.default})\`;
          }
        }
        if (field.hashed) {
          fieldDef += ' // 哈希存储';
        }
        if (field.nullable) {
          fieldDef += '?';
        }

        schema += fieldDef + '\\n';
      }

      // 添加关系字段
      for (const rel of relationships) {
        if (rel.from === model.name) {
          if (rel.type === 'belongsTo') {
            const targetModel = models.find(m => m.name === rel.to);
            if (targetModel) {
              const relationName = rel.to === rel.from ? \`\${rel.to}Relation\` : undefined;
              schema += \`  \${rel.to.toLowerCase()} \${rel.to} @relation(fields: [\${rel.field}], references: [id]\`;
              if (relationName) schema += \`, name: "\${relationName}"\`;
              schema += ')\\n';
            }
          } else if (rel.type === 'hasMany') {
            schema += \`  \${rel.field} \${rel.to}[]\\n\`;
          }
        }
      }

      // 添加反向关系
      const reverseRelations = relationships.filter(r => r.to === model.name);
      for (const rel of reverseRelations) {
        if (rel.type === 'belongsTo') {
          const fromModel = models.find(m => m.name === rel.from);
          if (fromModel) {
            const pluralName = rel.from.toLowerCase() + 's';
            schema += \`  \${pluralName} \${rel.from}[]\\n\`;
          }
        }
      }

      schema += '}\\n\\n';
    }

    return schema;
  }

  // 生成Next.js项目结构
  generateNextJSStructure(features, models, pages, endpoints) {
    const structure = {
      directories: [
        'prisma/',
        'prisma/migrations/',
        'src/',
        'src/app/',
        'src/app/api/',
        'src/app/api/auth/',
        'src/components/',
        'src/components/ui/',
        'src/components/layout/',
        'src/lib/',
        'src/hooks/',
        'src/types/',
        'public/',
        'public/images/',
      ],
      files: [
        {
          path: 'prisma/schema.prisma',
          description: '数据库Schema定义',
        },
        {
          path: '.env.example',
          description: '环境变量示例文件',
          content: '# Database\\nDATABASE_URL="postgresql://user:password@localhost:5432/dbname"\\n\\n# Auth\\nNEXTAUTH_SECRET="your-secret-here"\\nNEXTAUTH_URL="http://localhost:3000"\\n\\n# OAuth\\nGITHUB_ID=""\\nGITHUB_SECRET=""\\n\\n# Storage\\nCLOUDINARY_CLOUD_NAME=""\\nCLOUDINARY_API_KEY=""\\nCLOUDINARY_API_SECRET=""',
        },
        {
          path: 'src/types/index.ts',
          description: '共享类型定义',
        },
        {
          path: 'src/lib/prisma.ts',
          description: 'Prisma客户端单例',
          content: 'import { PrismaClient } from "@prisma/client";\\n\\nconst globalForPrisma = globalThis as unknown as { prisma: PrismaClient };\\n\\nexport const prisma = globalForPrisma.prisma || new PrismaClient();\\n\\nif (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;',
        },
        {
          path: 'src/lib/auth.ts',
          description: '认证工具函数',
        },
        {
          path: 'src/lib/validation.ts',
          description: 'Zod验证Schema',
        },
        {
          path: 'src/lib/utils.ts',
          description: '通用工具函数',
        },
        {
          path: 'src/middleware.ts',
          description: 'Next.js中间件（认证保护）',
        },
        {
          path: 'src/app/layout.tsx',
          description: '根布局组件',
        },
        {
          path: 'src/app/page.tsx',
          description: '首页',
        },
        {
          path: 'src/components/ui/Button.tsx',
          description: '通用按钮组件',
        },
        {
          path: 'src/components/ui/Input.tsx',
          description: '通用输入框组件',
        },
        {
          path: 'src/components/ui/Modal.tsx',
          description: '通用模态框组件',
        },
        {
          path: 'src/components/ui/Loading.tsx',
          description: '加载状态组件',
        },
        {
          path: 'src/components/ui/ErrorBoundary.tsx',
          description: '错误边界组件',
        },
        {
          path: 'src/components/layout/Navbar.tsx',
          description: '导航栏组件',
        },
        {
          path: 'src/components/layout/Footer.tsx',
          description: '页脚组件',
        },
        {
          path: 'src/components/layout/Sidebar.tsx',
          description: '侧边栏组件',
        },
        {
          path: 'src/hooks/useAuth.ts',
          description: '认证状态Hook',
        },
        {
          path: 'src/hooks/useDebounce.ts',
          description: '防抖Hook',
        },
        {
          path: 'package.json',
          description: '项目依赖配置',
        },
        {
          path: 'next.config.ts',
          description: 'Next.js配置',
        },
        {
          path: 'tailwind.config.ts',
          description: 'Tailwind CSS配置',
        },
        {
          path: 'tsconfig.json',
          description: 'TypeScript配置',
        },
        {
          path: 'vercel.json',
          description: 'Vercel部署配置',
        },
      ],
    };

    // 添加API路由文件
    for (const endpoint of endpoints) {
      let dirPath = endpoint.path
        .replace('/api/', '')
        .replace(':id', '[id]')
        .replace(/\\//g, '/');
      
      const parts = dirPath.split('/');
      parts.pop(); // 移除路由文件名
      
      const routeDir = 'src/app/api/' + parts.join('/');
      if (routeDir && !structure.directories.includes(routeDir + '/')) {
        structure.directories.push(routeDir + '/');
      }

      structure.files.push({
        path: \`src/app/api/\${dirPath}/route.ts\`,
        description: \`\${endpoint.method} \${endpoint.path} - \${endpoint.description}\`,
      });
    }

    // 添加页面文件
    for (const page of pages) {
      if (page.path === '/') continue;
      if (page.path === '/login' || page.path === '/register') continue;

      let pagePath = page.path.replace(':id', '[id]');
      structure.files.push({
        path: \`src/app\${pagePath}/page.tsx\`,
        description: \`\${page.component} - \${page.description}\`,
      });
    }

    return structure;
  }

  generateMERNStructure(features, models, pages, endpoints) {
    return {
      directories: [
        'client/',
        'client/src/',
        'client/src/components/',
        'client/src/pages/',
        'client/src/hooks/',
        'client/src/services/',
        'client/src/types/',
        'client/public/',
        'server/',
        'server/src/',
        'server/src/routes/',
        'server/src/controllers/',
        'server/src/models/',
        'server/src/middleware/',
        'server/src/config/',
        'server/src/utils/',
      ],
      files: [],
    };
  }

  generateDjangoReactStructure(features, models, pages, endpoints) {
    return {
      directories: [
        'frontend/',
        'frontend/src/',
        'backend/',
        'backend/apps/',
        'backend/config/',
        'backend/requirements/',
      ],
      files: [],
    };
  }

  // 推断需要的组件
  inferComponents(models, features) {
    const components = [
      { name: 'Layout', type: 'layout', description: '应用布局' },
      { name: 'Navbar', type: 'layout', description: '导航栏' },
      { name: 'Footer', type: 'layout', description: '页脚' },
      { name: 'Button', type: 'ui', description: '通用按钮' },
      { name: 'Input', type: 'ui', description: '输入框' },
      { name: 'Select', type: 'ui', description: '下拉选择' },
      { name: 'Modal', type: 'ui', description: '模态框' },
      { name: 'Loading', type: 'ui', description: '加载状态' },
      { name: 'ErrorBoundary', type: 'ui', description: '错误边界' },
      { name: 'Pagination', type: 'ui', description: '分页组件' },
      { name: 'SearchBar', type: 'ui', description: '搜索栏' },
      { name: 'FormField', type: 'form', description: '表单字段' },
      { name: 'AuthForm', type: 'auth', description: '认证表单' },
    ];

    for (const model of models) {
      const name = model.name;
      components.push({
        name: \`\${name}Card\`,
        type: 'card',
        description: \`\${name}卡片组件\`,
      });
      components.push({
        name: \`\${name}Form\`,
        type: 'form',
        description: \`\${name}表单组件\`,
      });
      components.push({
        name: \`\${name}Table\`,
        type: 'table',
        description: \`\${name}表格组件\`,
      });
    }

    return components;
  }

  // 主生成方法
  generate(projectDescription) {
    console.log('========================================');
    console.log('  🏗️  全栈项目生成器');
    console.log('========================================\\n');

    // 解析项目描述
    const features = projectDescription.features || [];
    const techStack = projectDescription.techStack || 'nextjs-postgres';
    const projectName = projectDescription.name || 'my-fullstack-app';

    console.log(\`📁 项目名称：\${projectName}\`);
    console.log(\`🔧 技术栈：\${techStack}\`);

    const stack = this.techStacks[techStack];
    if (!stack) {
      console.log('❌ 不支持的技术栈！');
      console.log(\`支持的技术栈：\${Object.keys(this.techStacks).join(', ')}\`);
      return null;
    }

    console.log(\`   前端：\${stack.frontend}\`);
    console.log(\`   后端：\${stack.backend}\`);
    console.log(\`   数据库：\${stack.database}\`);
    console.log(\`   认证：\${stack.auth}\`);
    console.log(\`   部署：\${stack.deployment}\`);
    console.log('');

    // 推断数据模型
    console.log('📊 分析功能需求，推断数据模型...\\n');
    const { models, relationships } = this.inferDataModel(features);

    console.log('数据模型：');
    for (const model of models) {
      console.log(\`  📦 \${model.name}（\${model.fields.length} 个字段）\`);
      for (const field of model.fields) {
        const rel = relationships.find(r => r.from === model.name && r.field === field.name);
        const relInfo = rel ? \` → \${rel.to}\` : '';
        console.log(\`     - \${field.name}: \${field.type}\${relInfo}\`);
      }
    }
    console.log('');

    // 关系图
    console.log('数据关系：');
    for (const rel of relationships) {
      console.log(\`  🔗 \${rel.from} --\${rel.type}--> \${rel.to}\`);
    }
    console.log('');

    // 推断API端点
    console.log('🔌 推断API端点...\\n');
    const endpoints = this.inferAPIEndpoints(models);

    console.log('API端点：');
    const methodIcons = { GET: '📖', POST: '✏️', PUT: '🔄', DELETE: '🗑️' };
    for (const endpoint of endpoints) {
      const icon = methodIcons[endpoint.method] || '📌';
      const authBadge = endpoint.auth === 'required' ? ' 🔒' : endpoint.auth === 'admin' ? ' 👑' : '';
      console.log(\`  \${icon} \${endpoint.method.padEnd(6)} \${endpoint.path.padEnd(30)} \${endpoint.description}\${authBadge}\`);
    }
    console.log('');

    // 推断前端页面
    console.log('📄 推断前端页面...\\n');
    const pages = this.inferPages(features, models);

    console.log('前端页面：');
    for (const page of pages) {
      const authBadge = page.auth === 'required' ? ' 🔒' : page.auth === 'public' ? ' 🌐' : '';
      console.log(\`  🏠 \${page.path.padEnd(25)} \${page.component.padEnd(25)} \${page.description}\${authBadge}\`);
    }
    console.log('');

    // 推断组件
    console.log('🧩 推断前端组件...\\n');
    const components = this.inferComponents(models, features);

    const componentTypes = {};
    for (const comp of components) {
      if (!componentTypes[comp.type]) componentTypes[comp.type] = [];
      componentTypes[comp.type].push(comp);
    }

    for (const [type, comps] of Object.entries(componentTypes)) {
      console.log(\`  \${type.toUpperCase()} 组件：\`);
      for (const comp of comps) {
        console.log(\`    - \${comp.name}: \${comp.description}\`);
      }
    }
    console.log('');

    // 生成项目结构
    console.log('📂 生成项目文件结构...\\n');
    const structure = this.generateNextJSStructure(features, models, pages, endpoints);

    console.log('目录结构：');
    // 构建目录树
    const dirTree = this.buildDirectoryTree(structure.directories, structure.files);
    this.printDirectoryTree(dirTree, '');

    console.log('\\n');

    // 生成Prisma Schema
    console.log('🗄️  生成数据库Schema...\\n');
    const prismaSchema = this.generatePrismaSchema(models, relationships);
    console.log(prismaSchema);

    // 开发建议
    console.log('\\n========================================');
    console.log('  💡 开发建议');
    console.log('========================================\\n');

    const tips = this.generateDevTips(models, features, techStack);
    for (const tip of tips) {
      console.log(\`  \${tip.step}. \${tip.title}\`);
      console.log(\`     \${tip.description}\`);
      console.log('');
    }

    // 统计
    console.log('========================================');
    console.log('  📊 项目统计');
    console.log('========================================\\n');
    console.log(\`  数据模型：\${models.length} 个\`);
    console.log(\`  数据关系：\${relationships.length} 个\`);
    console.log(\`  API端点：\${endpoints.length} 个\`);
    console.log(\`  前端页面：\${pages.length} 个\`);
    console.log(\`  前端组件：\${components.length} 个\`);
    console.log(\`  目录数：\${structure.directories.length} 个\`);
    console.log(\`  文件数：\${structure.files.length} 个\`);
    console.log('');

    return {
      models,
      relationships,
      endpoints,
      pages,
      components,
      structure,
      prismaSchema,
    };
  }

  buildDirectoryTree(directories, files) {
    const tree = {};

    for (const dir of directories) {
      const parts = dir.replace(/\\/$/, '').split('/');
      let current = tree;
      for (const part of parts) {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }

    for (const file of files) {
      const parts = file.path.split('/');
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          if (!current._files) current._files = [];
          current._files.push({ name: part, description: file.description });
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }
    }

    return tree;
  }

  printDirectoryTree(tree, prefix) {
    const entries = Object.entries(tree).filter(([key]) => !key.startsWith('_'));

    // 排序：目录优先，文件在后
    const dirs = entries.filter(([_, v]) => typeof v === 'object' && !Array.isArray(v));
    const files = tree._files || [];

    const sortedDirs = dirs.sort(([a], [b]) => a.localeCompare(b));
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

    const total = sortedDirs.length + sortedFiles.length;
    let count = 0;

    for (const [name, subTree] of sortedDirs) {
      count++;
      const isLast = count === total;
      const connector = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';

      console.log(\`\${prefix}\${connector}📁 \${name}/\`);
      this.printDirectoryTree(subTree, prefix + nextPrefix);
    }

    for (const file of sortedFiles) {
      count++;
      const isLast = count === total;
      const connector = isLast ? '└── ' : '├── ';
      const desc = file.description ? \`  ← \${file.description}\` : '';

      console.log(\`\${prefix}\${connector}📄 \${file.name}\${desc}\`);
    }
  }

  generateDevTips(models, features, techStack) {
    const tips = [
      {
        step: 1,
        title: '初始化项目',
        description: \`使用 \${techStack === 'nextjs-postgres' ? 'create-next-app' : 'Vite/Vue CLI'} 创建项目，安装依赖\`,
      },
      {
        step: 2,
        title: '配置数据库',
        description: '设置DATABASE_URL环境变量，运行prisma db push创建数据库表',
      },
      {
        step: 3,
        title: '实现认证',
        description: '先实现用户注册和登录功能，这是后续所有功能的基础',
      },
      {
        step: 4,
        title: '逐个实现数据模型',
        description: \`按照依赖关系顺序实现：\${models.map(m => m.name).join(' → ')}\`,
      },
      {
        step: 5,
        title: '实现API端点',
        description: '从简单到复杂，先实现GET列表，再实现CRUD',
      },
      {
        step: 6,
        title: '实现前端页面',
        description: '从静态页面开始，逐步添加交互和数据获取',
      },
      {
        step: 7,
        title: '添加错误处理',
        description: '为每个API和组件添加错误状态和加载状态',
      },
      {
        step: 8,
        title: '添加表单验证',
        description: '使用Zod在前端和后端统一验证逻辑',
      },
      {
        step: 9,
        title: 'SEO优化',
        description: '添加meta标签、Open Graph、结构化数据',
      },
      {
        step: 10,
        title: '部署',
        description: '推送到GitHub，配置CI/CD，部署到生产环境',
      },
    ];

    return tips;
  }
}

// =============================================================
// 演示运行
// =============================================================

const generator = new FullStackProjectGenerator();

console.log('\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🏗️  案例一：博客应用                      ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

const blogProject = generator.generate({
  name: 'my-blog',
  techStack: 'nextjs-postgres',
  features: [
    '用户注册和登录',
    '用户个人资料',
    '文章发布和管理',
    'Markdown编辑器',
    '文章评论',
    '标签系统',
    '搜索功能',
    '文章点赞',
    '邮箱通知',
  ],
});

console.log('\\n\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🛒  案例二：电商平台                      ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

const ecommerceProject = generator.generate({
  name: 'ecommerce-platform',
  techStack: 'nextjs-postgres',
  features: [
    '用户注册和登录',
    '商品浏览和搜索',
    '购物车',
    '订单管理',
    '在线支付',
    '商品评价',
    '商家入驻',
    '库存管理',
  ],
});

console.log('\\n\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  📝  案例三：任务管理应用                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

const taskProject = generator.generate({
  name: 'task-manager',
  techStack: 'mern',
  features: [
    '用户认证',
    '看板视图',
    '任务创建和分配',
    '标签和优先级',
    '评论和协作',
    '文件附件',
    '通知提醒',
    '搜索和筛选',
  ],
});

console.log('\\n\\n✅ 全栈项目生成完成！');
console.log('💡 提示：以上生成的项目结构可以作为AI提示词的输入，');
console.log('   让AI帮你逐个生成每个文件的具体实现代码。');
    `,
  },

  // ============================================================
  // 第 27 章：AI辅助API设计与集成
  // ============================================================
  {
    id: "ai-api-design",
    icon: "🔌",
    group: "进阶实战",
    title: "AI辅助API设计与集成",
    content: `
# AI辅助API设计与集成

## 引言：API设计的艺术与科学

API设计是软件工程中最具挑战性的工作之一。一个好的API设计需要平衡多种因素：性能、可扩展性、易用性、安全性、向后兼容性等。更复杂的是，API一旦发布，就很难更改——因为你的用户（前端开发者、第三方开发者）已经依赖它了。

AI正在改变API设计的方式。它不仅可以帮助你生成API代码，更重要的是，它可以帮助你做出更好的设计决策。AI可以分析你的数据模型，推荐最合适的API设计模式；可以自动生成OpenAPI规范文档；可以帮你发现潜在的安全漏洞和性能问题。

本章将深入探讨如何利用AI进行API设计，从RESTful API到GraphQL，从设计原则到具体实现，从错误处理到安全防护。

## 一、API设计的基本原则

### 1.1 好的API设计的特征

在让AI帮你设计API之前，你需要理解什么样的API设计是好的。以下是评估API设计质量的关键维度：

**一致性**

API应该在整个系统中保持一致。相同的操作应该使用相同的模式，相似的端点应该有相似的响应格式。

\`\`\`
好的设计：GET /users（获取用户列表）→ GET /posts（获取文章列表）
          GET /users/:id（获取单个用户）→ GET /posts/:id（获取单篇文章）
          POST /users（创建用户）→ POST /posts（创建文章）

不好的设计：GET /users → GET /getAllPosts（不一致的命名）
            POST /users → PUT /createPost（不一致的HTTP方法）
\`\`\`

**可预测性**

API的使用者应该能够根据已有的API模式推断出新的API端点。

\`\`\`
如果 /users 支持 ?page=1&pageSize=10 分页参数，
那么 /posts 也应该支持相同的分页参数。
\`\`\`

**自描述性**

API应该尽可能自描述。响应中包含足够的元数据，HTTP状态码准确反映结果。

\`\`\`json
// 好的响应格式
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15
  }
}

// 不够好的响应格式
{
  "items": [ ... ],
  "count": 150
}
\`\`\`

**错误处理**

错误响应应该清晰、有用、可操作。

\`\`\`json
// 好的错误响应
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "邮箱格式不正确",
    "details": [
      {
        "field": "email",
        "message": "请提供有效的邮箱地址",
        "value": "notanemail"
      }
    ]
  }
}

// 不够好的错误响应
{
  "error": "错误的请求"
}
\`\`\`

### 1.2 RESTful API设计原则

RESTful API是目前最流行的API设计风格。以下是关键原则：

**资源导向**

将API设计为资源的集合，而不是操作。

\`\`\`
资源导向设计：
GET    /users          → 获取用户列表
GET    /users/:id      → 获取单个用户
POST   /users          → 创建用户
PUT    /users/:id      → 更新用户
DELETE /users/:id      → 删除用户

操作导向设计（不推荐）：
GET    /getUsers
POST   /createUser
POST   /updateUser
POST   /deleteUser
\`\`\`

**正确的HTTP方法**

| HTTP方法 | 含义 | 幂等性 | 安全性 |
|----------|------|--------|--------|
| GET | 获取资源 | 是 | 是 |
| POST | 创建资源 | 否 | 否 |
| PUT | 完整更新资源 | 是 | 否 |
| PATCH | 部分更新资源 | 否 | 否 |
| DELETE | 删除资源 | 是 | 否 |
| HEAD | 获取响应头 | 是 | 是 |
| OPTIONS | 获取支持的方法 | 是 | 是 |

**合理的状态码**

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 OK | 成功 | GET、PUT、PATCH成功 |
| 201 Created | 已创建 | POST创建资源成功 |
| 204 No Content | 无内容 | DELETE成功 |
| 400 Bad Request | 请求错误 | 参数验证失败 |
| 401 Unauthorized | 未认证 | 缺少或无效的token |
| 403 Forbidden | 禁止访问 | 权限不足 |
| 404 Not Found | 未找到 | 资源不存在 |
| 409 Conflict | 冲突 | 资源已存在 |
| 422 Unprocessable Entity | 无法处理 | 语义错误 |
| 429 Too Many Requests | 请求过多 | 限流 |
| 500 Internal Server Error | 服务器错误 | 未预期的错误 |

### 1.3 让AI评估你的API设计

你可以让AI评估你的API设计，并提供改进建议。

\`\`\`
提示词：以下是博客应用的API设计，请评估其质量，指出问题并提供改进建议：

GET /api/v1/posts
POST /api/v1/posts
GET /api/v1/posts/:id
PUT /api/v1/posts/:id
DELETE /api/v1/posts/:id
GET /api/v1/posts/:id/comments
POST /api/v1/posts/:id/comments
GET /api/v1/users
POST /api/v1/users
GET /api/v1/users/:id
POST /api/v1/auth/login
POST /api/v1/auth/register
\`\`\`

## 二、AI辅助RESTful API生成

### 2.1 从资源描述生成API

AI最强大的能力之一是从资源描述自动生成完整的API设计。

**提示词模板：**

\`\`\`
请为以下资源设计RESTful API：

资源：{资源名称}
字段：
- {字段名}: {类型} - {描述}
- {字段名}: {类型} - {描述}

关系：
- 属于 {关联资源}
- 拥有多个 {关联资源}

操作需求：
- 列表查询（支持分页、搜索、排序）
- 单个查询
- 创建
- 更新
- 删除
- {其他特殊操作}

请提供：
1. 完整的端点列表（HTTP方法 + URL + 描述）
2. 每个端点的请求参数（Query、Body、Path）
3. 每个端点的响应格式（成功和错误）
4. 认证和授权要求
5. 分页和搜索参数规范
\`\`\`

### 2.2 API版本管理

API版本管理是一个重要的设计决策。以下是常见的版本管理策略：

**策略一：URL路径版本**

\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

优点：最直观，易于理解
缺点：URL变化，需要路由重写

**策略二：请求头版本**

\`\`\`
GET /api/users
Accept: application/vnd.myapp.v1+json
\`\`\`

优点：URL保持不变
缺点：不够直观，调试困难

**策略三：查询参数版本**

\`\`\`
/api/users?version=1
\`\`\`

优点：简单
缺点：容易被忽略，缓存问题

**AI推荐：** 对于公开API，推荐URL路径版本管理；对于内部API，推荐请求头版本管理。

### 2.3 分页设计

分页是API设计中最常见的需求之一。以下是几种分页策略：

**基于偏移量的分页（Offset-based）**

\`\`\`
GET /api/posts?page=1&pageSize=10
\`\`\`

优点：简单，支持跳转到任意页
缺点：数据变化时可能重复或遗漏

**基于游标的分页（Cursor-based）**

\`\`\`
GET /api/posts?cursor=eyJpZCI6IjEyMyJ9&limit=10
\`\`\`

优点：数据一致性高，性能好
缺点：不支持跳页，实现复杂

**键集分页（Keyset Pagination）**

\`\`\`
GET /api/posts?after=2024-01-01T00:00:00Z&limit=10
\`\`\`

## 三、AI辅助GraphQL API设计

### 3.1 GraphQL简介

GraphQL是Facebook开发的API查询语言。与RESTful API不同，GraphQL允许客户端精确指定需要的数据，避免过度获取（over-fetching）和不足获取（under-fetching）。

**GraphQL vs RESTful**

| 维度 | RESTful | GraphQL |
|------|---------|---------|
| 端点数量 | 多个端点 | 单一端点 |
| 数据获取 | 服务器决定返回什么 | 客户端决定获取什么 |
| 版本管理 | 需要版本策略 | 通过添加字段演进 |
| 缓存 | HTTP缓存天然支持 | 需要额外处理 |
| 学习曲线 | 低 | 中到高 |
| 性能 | 可能N+1查询 | 通过DataLoader批处理 |
| 文件上传 | 简单 | 需要额外处理 |
| 工具生态 | 成熟 | 快速发展中 |

### 3.2 用AI生成GraphQL Schema

\`\`\`
提示词：请为博客应用生成GraphQL Schema，包括：

类型：
- User（用户）
- Post（文章）
- Comment（评论）
- Tag（标签）

查询：
- 文章列表（支持分页、搜索、标签筛选）
- 文章详情
- 用户信息
- 热门文章

变更：
- 创建文章
- 更新文章
- 删除文章
- 创建评论
- 用户注册
- 用户登录

要求：
- 使用SDL（Schema Definition Language）格式
- 包含分页类型（Connection模式）
- 包含输入类型
- 包含认证指令
- 合理的字段描述
\`\`\`

AI会生成类似这样的Schema：

\`\`\`graphql
type Query {
  posts(
    first: Int
    after: String
    search: String
    tag: String
    status: PostStatus
  ): PostConnection!
  
  post(slug: String!): Post
  
  user(id: ID!): User
  
  me: User
  
  popularPosts(limit: Int = 10): [Post!]!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  
  createComment(input: CreateCommentInput!): Comment!
  deleteComment(id: ID!): Boolean!
  
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
}

type User {
  id: ID!
  name: String!
  email: String!
  avatar: String
  bio: String
  role: UserRole!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  slug: String!
  content: String!
  excerpt: String
  coverImage: String
  status: PostStatus!
  author: User!
  tags: [Tag!]!
  comments: [Comment!]!
  commentCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  parent: Comment
  replies: [Comment!]!
  createdAt: DateTime!
}

type Tag {
  id: ID!
  name: String!
  slug: String!
  postCount: Int!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type AuthPayload {
  token: String!
  user: User!
}

enum UserRole {
  USER
  ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

input CreatePostInput {
  title: String!
  content: String!
  excerpt: String
  coverImage: String
  tags: [String!]
}

input UpdatePostInput {
  title: String
  content: String
  excerpt: String
  coverImage: String
  tags: [String!]
  status: PostStatus
}

input CreateCommentInput {
  content: String!
  postId: ID!
  parentId: ID
}

input RegisterInput {
  name: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

scalar DateTime
\`\`\`

## 四、OpenAPI/Swagger规范生成

### 4.1 OpenAPI规范的重要性

OpenAPI（原Swagger）规范是描述RESTful API的行业标准。它的重要性体现在：

1. **自动生成文档**：从OpenAPI规范自动生成交互式API文档
2. **代码生成**：从OpenAPI规范自动生成客户端SDK
3. **API测试**：基于OpenAPI规范自动生成测试用例
4. **API网关配置**：导入OpenAPI规范配置API网关
5. **团队协作**：作为前后端团队的契约

### 4.2 用AI生成OpenAPI规范

**提示词：**

\`\`\`
请为博客应用生成OpenAPI 3.0规范，包括以下端点：

资源：
1. 用户（User）：注册、登录、获取信息、更新信息
2. 文章（Post）：CRUD、列表（分页+搜索）、发布/取消发布
3. 评论（Comment）：创建、列表、删除
4. 标签（Tag）：列表

要求：
- 完整的请求/响应Schema
- 认证方式（Bearer Token）
- 错误响应格式
- 分页参数规范
- 示例数据
- 标签分组
\`\`\`

### 4.3 API文档自动化

有了OpenAPI规范，你可以通过AI自动生成API文档。

\`\`\`
提示词：请根据以下OpenAPI规范，生成面向开发者的API文档。文档应包括：
1. API概述
2. 认证说明
3. 每个端点的详细说明
4. 请求示例（curl、JavaScript、Python）
5. 响应示例
6. 错误码说明
7. 速率限制说明
8. 常见问题
\`\`\`

## 五、API安全最佳实践

### 5.1 认证与授权

**认证方式对比：**

| 方式 | 适用场景 | 安全性 | 复杂度 |
|------|---------|--------|--------|
| API Key | 服务间通信 | 中 | 低 |
| JWT | 无状态API | 中高 | 中 |
| OAuth 2.0 | 第三方授权 | 高 | 高 |
| Session Cookie | Web应用 | 中 | 低 |
| HMAC签名 | 高安全场景 | 很高 | 很高 |

**JWT最佳实践：**

\`\`\`javascript
// 由AI生成的JWT工具函数
const jwt = require('jsonwebtoken');

class JWTService {
  constructor(secret, options = {}) {
    this.secret = secret;
    this.accessTokenExpiry = options.accessTokenExpiry || '15m';
    this.refreshTokenExpiry = options.refreshTokenExpiry || '7d';
  }

  // 生成访问令牌
  generateAccessToken(payload) {
    return jwt.sign(
      { ...payload, type: 'access' },
      this.secret,
      { expiresIn: this.accessTokenExpiry }
    );
  }

  // 生成刷新令牌
  generateRefreshToken(payload) {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      this.secret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }

  // 验证令牌
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      return { valid: true, decoded };
    } catch (error) {
      return {
        valid: false,
        error: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      };
    }
  }

  // 生成令牌对
  generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  }
}
\`\`\`

### 5.2 输入验证

**常见的安全漏洞和AI防护：**

\`\`\`
提示词：请检查以下API端点是否存在安全漏洞，并提供修复方案：
1. 是否有SQL注入风险？
2. 是否有XSS风险？
3. 是否有CSRF风险？
4. 是否有IDOR（不安全的直接对象引用）风险？
5. 是否有速率限制？
6. 敏感数据是否在响应中暴露？
\`\`\`

### 5.3 速率限制

速率限制是保护API免受滥用的重要机制。

**速率限制策略：**

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| 固定窗口 | 在固定时间段内限制请求数 | 简单场景 |
| 滑动窗口 | 平滑的速率限制 | 中等精度 |
| 令牌桶 | 允许突发流量 | 高并发API |
| 漏桶 | 平滑输出速率 | 稳定速率场景 |
| 并发限制 | 限制同时进行的请求数 | 资源密集型操作 |

### 5.4 CORS配置

\`\`\`javascript
// AI生成的CORS安全配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://myapp.com', 'https://admin.myapp.com']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24小时
};
\`\`\`

## 六、API测试策略

### 6.1 测试金字塔

API测试应该遵循测试金字塔：

\`\`\`
       /\\\\
      /  集成测试\\\\
     /──────────────\\\\
    /    单元测试       \\\\
   /──────────────────────\\\\
\`\`\`

- **单元测试**：测试单个函数或方法的逻辑
- **集成测试**：测试API端点与数据库、外部服务的交互
- **端到端测试**：测试完整的用户流程

### 6.2 用AI生成API测试

\`\`\`
提示词：请为以下API端点生成完整的测试用例（使用Jest + Supertest）：

POST /api/auth/register
POST /api/auth/login
GET /api/posts
POST /api/posts
GET /api/posts/:id
PUT /api/posts/:id
DELETE /api/posts/:id

测试用例应覆盖：
1. 正常请求（Happy Path）
2. 参数验证错误
3. 认证失败
4. 权限不足
5. 资源不存在
6. 边界条件
\`\`\`

## 七、第三方API集成

### 7.1 集成模式

**直接集成**

\`\`\`javascript
// 直接调用第三方API
const response = await fetch('https://api.stripe.com/v1/charges', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.STRIPE_SECRET_KEY}\`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({ amount: 1000, currency: 'usd' }),
});
\`\`\`

**适配器模式**

\`\`\`javascript
// 支付服务适配器
class PaymentAdapter {
  constructor(provider) {
    this.provider = provider;
  }

  async charge(amount, currency, source) {
    switch (this.provider) {
      case 'stripe':
        return this.stripeCharge(amount, currency, source);
      case 'paypal':
        return this.paypalCharge(amount, currency, source);
      default:
        throw new Error(\`Unknown payment provider: \${this.provider}\`);
    }
  }
}
\`\`\`

**断路器模式**

当第三方服务不可用时，使用断路器防止级联故障。

\`\`\`javascript
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastFailureTime = null;
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await this.fn(...args);
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }
}
\`\`\`

### 7.2 常见第三方API集成

| 服务 | API类型 | 用途 |
|------|---------|------|
| Stripe | REST | 支付处理 |
| SendGrid/Resend | REST | 邮件发送 |
| Cloudinary | REST | 图片/视频管理 |
| Twilio | REST | 短信/电话 |
| Auth0/Clerk | REST | 认证服务 |
| Algolia | REST | 全文搜索 |
| Mapbox | REST | 地图服务 |
| OpenAI | REST | AI服务 |

## 八、常见API设计错误

### 8.1 错误一：将所有操作放在GET/POST中

\`\`\`
错误：GET /api/deleteUser?id=123

正确：DELETE /api/users/123
\`\`\`

### 8.2 错误二：在URL中暴露敏感信息

\`\`\`
错误：GET /api/users?apiKey=sk-xxx&password=123456

正确：将敏感信息放在请求头或请求体中
\`\`\`

### 8.3 错误三：返回过大的响应

\`\`\`
错误：GET /api/posts 返回所有文章的完整内容

正确：使用分页和字段选择
GET /api/posts?page=1&pageSize=10&fields=id,title,excerpt
\`\`\`

### 8.4 错误四：不恰当的状态码

\`\`\`
错误：验证失败时返回 500 Internal Server Error

正确：返回 400 Bad Request 或 422 Unprocessable Entity
\`\`\`

### 8.5 错误五：忽略API版本管理

\`\`\`
错误：直接修改API行为，导致现有客户端崩溃

正确：使用版本管理，逐步废弃旧版本
\`\`\`

## 九、API设计决策框架

### 9.1 何时选择RESTful API

- 你需要简单的CRUD操作
- 你的客户端多样化（Web、移动端、第三方）
- 你需要利用HTTP缓存
- 你的团队熟悉RESTful设计
- 你需要良好的工具支持

### 9.2 何时选择GraphQL

- 前端需要灵活的数据获取
- 你有复杂的嵌套数据关系
- 你需要减少网络请求次数
- 你的前端团队需要快速迭代
- 你需要强类型系统

### 9.3 何时选择gRPC

- 你需要高性能的服务间通信
- 你需要双向流
- 你使用微服务架构
- 你需要强类型契约
- 你的环境是内部网络

### 9.4 何时选择WebSocket

- 你需要实时双向通信
- 你需要推送通知
- 你需要协作功能
- 你需要低延迟

## 总结

API设计是连接前后端的桥梁，一个好的API设计可以大大提升开发效率和用户体验。AI可以帮助你加速API设计的过程，但最终的设计决策仍然需要你的判断。

关键要点：
1. 保持一致性：使用统一的命名、格式和错误处理
2. 优先考虑安全性：认证、授权、输入验证、速率限制
3. 设计良好的错误处理：让客户端能够理解和处理错误
4. 文档化：使用OpenAPI规范，让API自描述
5. 版本管理：从一开始就规划版本策略
6. 测试充分：覆盖正常路径和异常路径

记住：API是产品的一部分，而不是技术细节。像对待用户界面一样对待你的API设计。
    `,
    code: `
// =============================================================
// API设计工具
// 根据资源描述，生成RESTful API端点定义和请求/响应Schema
// =============================================================

class APIDesigner {
  constructor() {
    this.httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    this.statusCodes = {
      200: 'OK - 请求成功',
      201: 'Created - 资源已创建',
      204: 'No Content - 请求成功，无返回内容',
      400: 'Bad Request - 请求参数错误',
      401: 'Unauthorized - 未认证',
      403: 'Forbidden - 权限不足',
      404: 'Not Found - 资源不存在',
      409: 'Conflict - 资源冲突',
      422: 'Unprocessable Entity - 语义错误',
      429: 'Too Many Requests - 请求过多',
      500: 'Internal Server Error - 服务器错误',
    };

    this.typeMapping = {
      'String': { type: 'string', example: '示例文本' },
      'Int': { type: 'integer', example: 42 },
      'Float': { type: 'number', example: 3.14 },
      'Decimal': { type: 'number', example: 99.99 },
      'Boolean': { type: 'boolean', example: true },
      'DateTime': { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
      'Date': { type: 'string', format: 'date', example: '2024-01-01' },
      'UUID': { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
      'Email': { type: 'string', format: 'email', example: 'user@example.com' },
      'URL': { type: 'string', format: 'uri', example: 'https://example.com' },
      'Text': { type: 'string', example: '长文本内容...' },
      'JSON': { type: 'object', example: {} },
      'Bytes': { type: 'string', format: 'byte', example: 'base64encoded...' },
    };
  }

  // 推断资源名称的复数形式
  pluralize(name) {
    if (name.endsWith('s')) return name;
    if (name.endsWith('y')) return name.slice(0, -1) + 'ies';
    if (name.endsWith('ch') || name.endsWith('sh') || name.endsWith('x')) return name + 'es';
    return name + 's';
  }

  // 生成OpenAPI字段Schema
  generateFieldSchema(field) {
    const typeInfo = this.typeMapping[field.type] || { type: 'string', example: 'unknown' };
    const schema = {
      type: typeInfo.type,
      description: field.description || \`\${field.name} 字段\`,
      example: typeInfo.example,
    };

    if (typeInfo.format) {
      schema.format = typeInfo.format;
    }

    if (field.required !== undefined && !field.required) {
      schema.nullable = true;
    }

    if (field.enum) {
      schema.enum = field.enum;
    }

    if (field.min !== undefined) schema.minimum = field.min;
    if (field.max !== undefined) schema.maximum = field.max;
    if (field.minLength !== undefined) schema.minLength = field.minLength;
    if (field.maxLength !== undefined) schema.maxLength = field.maxLength;

    return schema;
  }

  // 生成请求体Schema
  generateRequestBodySchema(fields, purpose) {
    const properties = {};
    const required = [];

    for (const field of fields) {
      if (field.readOnly && purpose === 'create') continue;
      if (field.writeOnly && purpose === 'response') continue;
      if (field.autoGenerated) continue;

      if (purpose === 'create') {
        if (field.required !== false) {
          required.push(field.name);
        }
      }

      properties[field.name] = this.generateFieldSchema(field);
    }

    return {
      type: 'object',
      required,
      properties,
    };
  }

  // 生成响应Schema
  generateResponseSchema(resourceName, fields) {
    const properties = {};
    for (const field of fields) {
      if (field.writeOnly) continue;
      properties[field.name] = this.generateFieldSchema(field);
    }

    return {
      type: 'object',
      properties,
    };
  }

  // 设计API端点
  designAPI(resource) {
    const { name, fields, operations, auth } = resource;
    const pluralName = this.pluralize(name.toLowerCase());
    const endpoints = [];

    // 列表端点
    if (operations.includes('list')) {
      const queryParams = [];

      // 分页参数
      queryParams.push({
        name: 'page',
        in: 'query',
        description: '页码',
        schema: { type: 'integer', default: 1, minimum: 1 },
      });
      queryParams.push({
        name: 'pageSize',
        in: 'query',
        description: '每页数量',
        schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
      });

      // 搜索和排序参数
      if (operations.includes('search')) {
        queryParams.push({
          name: 'search',
          in: 'query',
          description: '搜索关键词',
          schema: { type: 'string' },
        });
      }
      if (operations.includes('sort')) {
        const sortFields = fields.filter(f => f.sortable !== false).map(f => f.name);
        queryParams.push({
          name: 'sortBy',
          in: 'query',
          description: \`排序字段（\${sortFields.join(', ')}）\`,
          schema: { type: 'string', enum: sortFields, default: 'createdAt' },
        });
        queryParams.push({
          name: 'sortOrder',
          in: 'query',
          description: '排序方向',
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        });
      }

      endpoints.push({
        id: \`list-\${name.toLowerCase()}s\`,
        method: 'GET',
        path: \`/\${pluralName}\`,
        summary: \`获取\${name}列表\`,
        description: \`获取\${name}的分页列表，支持搜索和排序\`,
        tags: [name],
        security: auth?.list ? [{ bearerAuth: [] }] : [],
        parameters: queryParams,
        responses: {
          200: {
            description: '成功返回列表',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: this.generateResponseSchema(name, fields),
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        pageSize: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 150 },
                        totalPages: { type: 'integer', example: 15 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: '未认证', content: this.generateErrorContent() },
        },
      });
    }

    // 单个获取端点
    if (operations.includes('get')) {
      const idField = fields.find(f => f.primary) || { name: 'id', type: 'UUID' };

      endpoints.push({
        id: \`get-\${name.toLowerCase()}\`,
        method: 'GET',
        path: \`/\${pluralName}/:id\`,
        summary: \`获取\${name}详情\`,
        description: \`根据ID获取\${name}的详细信息\`,
        tags: [name],
        security: auth?.get ? [{ bearerAuth: [] }] : [],
        parameters: [
          {
            name: idField.name,
            in: 'path',
            required: true,
            description: \`\${name}的\${idField.name}\`,
            schema: this.generateFieldSchema(idField),
          },
        ],
        responses: {
          200: {
            description: '成功返回详情',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: this.generateResponseSchema(name, fields),
                  },
                },
              },
            },
          },
          404: { description: '资源不存在', content: this.generateErrorContent() },
        },
      });
    }

    // 创建端点
    if (operations.includes('create')) {
      endpoints.push({
        id: \`create-\${name.toLowerCase()}\`,
        method: 'POST',
        path: \`/\${pluralName}\`,
        summary: \`创建\${name}\`,
        description: \`创建一个新的\${name}\`,
        tags: [name],
        security: auth?.create ? [{ bearerAuth: [] }] : [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: this.generateRequestBodySchema(fields, 'create'),
            },
          },
        },
        responses: {
          201: {
            description: '创建成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: this.generateResponseSchema(name, fields),
                  },
                },
              },
            },
          },
          400: { description: '请求参数错误', content: this.generateErrorContent() },
          409: { description: '资源冲突', content: this.generateErrorContent() },
        },
      });
    }

    // 更新端点
    if (operations.includes('update')) {
      const updateFields = fields.filter(f => !f.autoGenerated);

      endpoints.push({
        id: \`update-\${name.toLowerCase()}\`,
        method: 'PUT',
        path: \`/\${pluralName}/:id\`,
        summary: \`更新\${name}\`,
        description: \`完整更新\${name}的所有字段\`,
        tags: [name],
        security: auth?.update ? [{ bearerAuth: [] }] : [],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: \`\${name}的ID\`,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: this.generateRequestBodySchema(fields, 'update'),
            },
          },
        },
        responses: {
          200: {
            description: '更新成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: this.generateResponseSchema(name, fields),
                  },
                },
              },
            },
          },
          404: { description: '资源不存在', content: this.generateErrorContent() },
        },
      });
    }

    // 删除端点
    if (operations.includes('delete')) {
      endpoints.push({
        id: \`delete-\${name.toLowerCase()}\`,
        method: 'DELETE',
        path: \`/\${pluralName}/:id\`,
        summary: \`删除\${name}\`,
        description: \`删除指定的\${name}\`,
        tags: [name],
        security: auth?.delete ? [{ bearerAuth: [] }] : [],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: \`\${name}的ID\`,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          204: { description: '删除成功' },
          404: { description: '资源不存在', content: this.generateErrorContent() },
        },
      });
    }

    return endpoints;
  }

  generateErrorContent() {
    return {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'ERROR_CODE' },
                message: { type: 'string', example: '错误描述' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  // 生成Node.js Express路由代码
  generateExpressRouter(resource, endpoints) {
    const { name } = resource;
    const nameLower = name.toLowerCase();
    const pluralName = this.pluralize(nameLower);

    let code = \`const express = require('express');\\n\`;
    code += \`const router = express.Router();\\n\`;
    code += \`const { authenticate, authorize } = require('../middleware/auth');\\n\`;
    code += \`const { validate } = require('../middleware/validation');\\n\`;
    code += \`const { \${nameLower}Controller } = require('../controllers/\${nameLower}');\\n\`;
    code += \`\\n\`;

    for (const endpoint of endpoints) {
      const hasAuth = endpoint.security && endpoint.security.length > 0;
      const middlewares = [];

      if (hasAuth) {
        middlewares.push('authenticate');
      }

      if (endpoint.requestBody) {
        middlewares.push(\`validate('\${endpoint.id}')\`);
      }

      const middlewareStr = middlewares.length > 0 ? ', ' + middlewares.join(', ') : '';

      if (endpoint.id.startsWith('list-')) {
        code += \`router.get('/', \${middlewareStr}, \${nameLower}Controller.list);\\n\`;
      } else if (endpoint.id.startsWith('get-')) {
        code += \`router.get('/:id', \${middlewareStr}, \${nameLower}Controller.getById);\\n\`;
      } else if (endpoint.id.startsWith('create-')) {
        code += \`router.post('/', \${middlewareStr}, \${nameLower}Controller.create);\\n\`;
      } else if (endpoint.id.startsWith('update-')) {
        code += \`router.put('/:id', \${middlewareStr}, \${nameLower}Controller.update);\\n\`;
      } else if (endpoint.id.startsWith('delete-')) {
        code += \`router.delete('/:id', \${middlewareStr}, \${nameLower}Controller.delete);\\n\`;
      }
    }

    code += \`\\nmodule.exports = router;\\n\`;
    return code;
  }

  // 生成API文档
  generateAPIDocumentation(resources, endpoints) {
    let doc = '';

    doc += '========================================\\n';
    doc += '  API 文档\\n';
    doc += '========================================\\n\\n';

    doc += '基础URL：https://api.example.com/v1\\n';
    doc += '认证方式：Bearer Token\\n';
    doc += '内容类型：application/json\\n\\n';

    doc += '---\\n\\n';
    doc += '## 通用响应格式\\n\\n';
    doc += '### 成功响应\\n\\n';
    doc += '\`\`\`json\\n{\\n  "success": true,\\n  "data": { ... },\\n  "meta": {\\n    "page": 1,\\n    "pageSize": 10,\\n    "total": 150,\\n    "totalPages": 15\\n  }\\n}\\n\`\`\`\\n\\n';
    doc += '### 错误响应\\n\\n';
    doc += '\`\`\`json\\n{\\n  "success": false,\\n  "error": {\\n    "code": "VALIDATION_ERROR",\\n    "message": "请求参数验证失败",\\n    "details": [...]\\n  }\\n}\\n\`\`\`\\n\\n';

    doc += '---\\n\\n';
    doc += '## 状态码说明\\n\\n';
    for (const [code, desc] of Object.entries(this.statusCodes)) {
      doc += \`- **\${code}**: \${desc}\\n\`;
    }

    doc += '\\n---\\n\\n';

    // 按资源分组
    for (const resource of resources) {
      doc += \`## \${resource.name} 资源\\n\\n\`;
      doc += \`基础路径：/\${this.pluralize(resource.name.toLowerCase())}\\n\\n\`;

      const resourceEndpoints = endpoints.filter(
        e => e.tags && e.tags.includes(resource.name)
      );

      for (const endpoint of resourceEndpoints) {
        doc += \`### \${endpoint.method} \${endpoint.path}\\n\\n\`;
        doc += \`\${endpoint.description}\\n\\n\`;

        if (endpoint.security && endpoint.security.length > 0) {
          doc += '🔒 需要认证\\n\\n';
        }

        if (endpoint.parameters && endpoint.parameters.length > 0) {
          doc += '**参数：**\\n\\n';
          doc += '| 参数名 | 位置 | 类型 | 必填 | 描述 |\\n';
          doc += '|--------|------|------|------|------|\\n';
          for (const param of endpoint.parameters) {
            doc += \`| \${param.name} | \${param.in} | \${param.schema?.type || 'string'} | \${param.required ? '是' : '否'} | \${param.description} |\\n\`;
          }
          doc += '\\n';
        }

        if (endpoint.requestBody) {
          doc += '**请求体：**\\n\\n';
          doc += '\`\`\`json\\n';
          const schema = endpoint.requestBody.content['application/json'].schema;
          doc += this.formatSchemaExample(schema, 0);
          doc += '\`\`\`\\n\\n';
        }

        doc += '**响应：**\\n\\n';
        for (const [statusCode, response] of Object.entries(endpoint.responses)) {
          const statusDesc = this.statusCodes[statusCode] || '';
          doc += \`- **\${statusCode}** \${statusDesc}\\n\`;
        }
        doc += '\\n';

        // curl示例
        doc += '**curl示例：**\\n\\n';
        doc += '\`\`\`bash\\n';
        doc += this.generateCurlExample(endpoint);
        doc += '\`\`\`\\n\\n';

        doc += '---\\n\\n';
      }
    }

    return doc;
  }

  formatSchemaExample(schema, indent) {
    const spaces = '  '.repeat(indent);
    if (schema.type === 'object' && schema.properties) {
      let result = '{\\n';
      const keys = Object.keys(schema.properties);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const prop = schema.properties[key];
        const comma = i < keys.length - 1 ? ',' : '';
        if (prop.type === 'object') {
          result += \`\${spaces}  "\${key}": \${this.formatSchemaExample(prop, indent + 1)}\${comma}\\n\`;
        } else if (prop.type === 'array') {
          result += \`\${spaces}  "\${key}": [...],\${comma}\\n\`;
        } else {
          const example = prop.example !== undefined ? JSON.stringify(prop.example) : '""';
          result += \`\${spaces}  "\${key}": \${example}\${comma}\\n\`;
        }
      }
      result += \`\${spaces}}\`;
      return result;
    }
    return '{}';
  }

  generateCurlExample(endpoint) {
    const url = \`https://api.example.com/v1\${endpoint.path.replace(':id', '550e8400-e29b-41d4-a716-446655440000')}\`;
    let curl = \`curl -X \${endpoint.method} "\${url}"\`;

    if (endpoint.security && endpoint.security.length > 0) {
      curl += \` \\\\\\n  -H "Authorization: Bearer YOUR_TOKEN_HERE"\`;
    }

    curl += \` \\\\\\n  -H "Content-Type: application/json"\`;

    if (endpoint.requestBody) {
      curl += \` \\\\\\n  -d '\${JSON.stringify(this.generateExampleBody(endpoint.requestBody.content['application/json'].schema), null, 2)}'\`;
    }

    return curl;
  }

  generateExampleBody(schema) {
    if (schema.type === 'object' && schema.properties) {
      const body = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.example !== undefined) {
          body[key] = prop.example;
        } else if (prop.type === 'string') {
          body[key] = '示例文本';
        } else if (prop.type === 'integer') {
          body[key] = 0;
        } else if (prop.type === 'number') {
          body[key] = 0.0;
        } else if (prop.type === 'boolean') {
          body[key] = false;
        }
      }
      return body;
    }
    return {};
  }

  // 主设计方法
  design(resources) {
    console.log('========================================');
    console.log('  🔌 API 设计工具');
    console.log('========================================\\n');

    const allEndpoints = [];

    for (const resource of resources) {
      console.log(\`📦 设计资源：\${resource.name}\`);
      console.log(\`   字段数：\${resource.fields.length}\`);
      console.log(\`   操作：\${resource.operations.join(', ')}\`);

      const endpoints = this.designAPI(resource);
      allEndpoints.push(...endpoints);

      console.log(\`   生成端点：\${endpoints.length} 个\\n\`);

      // 打印端点列表
      const methodIcons = {
        GET: '📖',
        POST: '✏️',
        PUT: '🔄',
        PATCH: '🔧',
        DELETE: '🗑️',
      };

      for (const endpoint of endpoints) {
        const icon = methodIcons[endpoint.method] || '📌';
        const authIcon = endpoint.security?.length > 0 ? ' 🔒' : '';
        console.log(\`     \${icon} \${endpoint.method.padEnd(6)} \${endpoint.path.padEnd(30)} \${endpoint.summary}\${authIcon}\`);
      }
      console.log('');

      // 生成Express路由代码
      const routerCode = this.generateExpressRouter(resource, endpoints);
      console.log(\`   📝 Express路由代码：\`);
      console.log(\`   \${'-'.repeat(50)}\`);
      const routerLines = routerCode.split('\\n');
      for (const line of routerLines) {
        console.log(\`   \${line}\`);
      }
      console.log(\`   \${'-'.repeat(50)}\\n\`);
    }

    console.log(\`\\n========================================\`);
    console.log(\`  📊 统计信息\`);
    console.log(\`========================================\`);
    console.log(\`  资源数：\${resources.length}\`);
    console.log(\`  总端点数：\${allEndpoints.length}\`);
    console.log('');

    const byMethod = {};
    for (const endpoint of allEndpoints) {
      byMethod[endpoint.method] = (byMethod[endpoint.method] || 0) + 1;
    }
    for (const [method, count] of Object.entries(byMethod)) {
      console.log(\`  \${method}: \${count} 个端点\`);
    }

    const authEndpoints = allEndpoints.filter(e => e.security?.length > 0).length;
    console.log(\`  需要认证的端点：\${authEndpoints} 个\`);
    console.log(\`  公开端点：\${allEndpoints.length - authEndpoints} 个\`);
    console.log('');

    // 生成简化版API文档
    console.log('========================================');
    console.log('  📄 API 文档预览');
    console.log('========================================\\n');
    const doc = this.generateAPIDocumentation(resources, allEndpoints);
    console.log(doc);

    return {
      resources,
      endpoints: allEndpoints,
      documentation: doc,
    };
  }
}

// =============================================================
// 演示运行
// =============================================================

const designer = new APIDesigner();

console.log('\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🔌 案例：博客应用API设计                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

const blogResources = [
  {
    name: 'User',
    fields: [
      { name: 'id', type: 'UUID', primary: true, autoGenerated: true, readOnly: true },
      { name: 'name', type: 'String', required: true, minLength: 2, maxLength: 50 },
      { name: 'email', type: 'Email', required: true },
      { name: 'password', type: 'String', writeOnly: true, required: true, minLength: 8 },
      { name: 'avatar', type: 'URL', required: false },
      { name: 'bio', type: 'Text', required: false, maxLength: 500 },
      { name: 'role', type: 'String', enum: ['USER', 'ADMIN'], readOnly: true },
      { name: 'createdAt', type: 'DateTime', autoGenerated: true, readOnly: true },
      { name: 'updatedAt', type: 'DateTime', autoGenerated: true, readOnly: true },
    ],
    operations: ['list', 'get', 'update', 'delete'],
    auth: {
      list: true,
      get: true,
      update: true,
      delete: true,
    },
  },
  {
    name: 'Post',
    fields: [
      { name: 'id', type: 'UUID', primary: true, autoGenerated: true, readOnly: true },
      { name: 'title', type: 'String', required: true, minLength: 1, maxLength: 200 },
      { name: 'slug', type: 'String', autoGenerated: true, readOnly: true },
      { name: 'content', type: 'Text', required: true },
      { name: 'excerpt', type: 'Text', required: false, maxLength: 500 },
      { name: 'coverImage', type: 'URL', required: false },
      { name: 'published', type: 'Boolean', required: false },
      { name: 'authorId', type: 'UUID', readOnly: true },
      { name: 'createdAt', type: 'DateTime', autoGenerated: true, readOnly: true, sortable: true },
      { name: 'updatedAt', type: 'DateTime', autoGenerated: true, readOnly: true },
    ],
    operations: ['list', 'get', 'create', 'update', 'delete', 'search', 'sort'],
    auth: {
      list: false,
      get: false,
      create: true,
      update: true,
      delete: true,
    },
  },
  {
    name: 'Comment',
    fields: [
      { name: 'id', type: 'UUID', primary: true, autoGenerated: true, readOnly: true },
      { name: 'content', type: 'Text', required: true, minLength: 1, maxLength: 2000 },
      { name: 'postId', type: 'UUID', required: true },
      { name: 'authorId', type: 'UUID', readOnly: true },
      { name: 'parentId', type: 'UUID', required: false },
      { name: 'createdAt', type: 'DateTime', autoGenerated: true, readOnly: true },
      { name: 'updatedAt', type: 'DateTime', autoGenerated: true, readOnly: true },
    ],
    operations: ['list', 'create', 'delete'],
    auth: {
      list: false,
      create: true,
      delete: true,
    },
  },
  {
    name: 'Tag',
    fields: [
      { name: 'id', type: 'UUID', primary: true, autoGenerated: true, readOnly: true },
      { name: 'name', type: 'String', required: true, minLength: 1, maxLength: 50 },
      { name: 'slug', type: 'String', autoGenerated: true, readOnly: true },
    ],
    operations: ['list', 'create'],
    auth: {
      list: false,
      create: true,
    },
  },
];

const result = designer.design(blogResources);

console.log('\\n\\n✅ API设计完成！');
console.log('💡 提示：以上生成的API设计可以直接用于：');
console.log('   1. 作为OpenAPI规范的输入');
console.log('   2. 生成Express/Fastify路由代码');
console.log('   3. 生成前端API客户端');
console.log('   4. 生成API文档');
    `,
  },

  // ============================================================
  // 第 28 章：AI辅助数据库设计与优化
  // ============================================================
  {
    id: "ai-database",
    icon: "🗄️",
    group: "进阶实战",
    title: "AI辅助数据库设计与优化",
    content: `
# AI辅助数据库设计与优化

## 引言：数据库——应用的基石

数据库是大多数应用的核心基础设施。一个设计良好的数据库可以让应用运行得又快又稳，而一个设计糟糕的数据库则可能成为整个系统的瓶颈。数据库设计涉及多个维度：Schema设计、索引优化、查询优化、数据迁移、备份恢复等。

AI在数据库领域有着独特的优势。它可以根据自然语言描述生成Schema，可以分析SQL查询并给出优化建议，可以自动生成数据库迁移脚本。更重要的是，AI可以帮助你避免新手常犯的错误。

本章将带你深入探索如何利用AI进行数据库设计、优化和维护。

## 一、数据库设计基础

### 1.1 关系型数据库 vs NoSQL

在开始数据库设计之前，你需要选择合适的数据库类型。AI可以帮助你做出这个决策。

| 维度 | 关系型数据库 | NoSQL |
|------|-------------|-------|
| 数据结构 | 固定Schema，表结构 | 灵活Schema，文档/键值/图 |
| 关系处理 | JOIN操作，天然支持 | 通常需要应用层处理 |
| 事务支持 | ACID事务 | 通常最终一致性 |
| 扩展方式 | 垂直扩展为主 | 水平扩展为主 |
| 查询能力 | SQL，功能强大 | 各种查询语言 |
| 成熟度 | 40+年历史 | 10-20年历史 |
| 代表产品 | PostgreSQL, MySQL | MongoDB, Redis, Cassandra |

**AI辅助决策提示词：**

\`\`\`
提示词：我的应用有以下特点：
- 数据之间有复杂的关联关系（用户-文章-评论-标签）
- 需要事务支持（订单支付需要原子性操作）
- 数据结构相对固定
- 需要复杂的查询和报表
- 用户量中等（10万-100万）

应该选择关系型数据库还是NoSQL？请给出推荐和理由。
\`\`\`

### 1.2 数据库范式化

范式化是关系型数据库设计的核心概念。

**第一范式（1NF）：** 每个字段都是原子的，不可再分。

\`\`\`sql
-- 违反1NF：tags字段包含多个值
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  tags VARCHAR(500) -- "javascript,react,nodejs"
);

-- 符合1NF：拆分为关联表
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200)
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id),
  tag_name VARCHAR(50),
  PRIMARY KEY (post_id, tag_name)
);
\`\`\`

**第二范式（2NF）：** 非主键字段完全依赖于主键（消除部分依赖）。

\`\`\`sql
-- 违反2NF：course_name只依赖于course_id，不依赖于整个(student_id, course_id)主键
CREATE TABLE enrollments (
  student_id UUID,
  course_id UUID,
  course_name VARCHAR(200),  -- 部分依赖
  grade INT,
  PRIMARY KEY (student_id, course_id)
);

-- 符合2NF：拆分
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  name VARCHAR(200)
);

CREATE TABLE enrollments (
  student_id UUID,
  course_id UUID REFERENCES courses(id),
  grade INT,
  PRIMARY KEY (student_id, course_id)
);
\`\`\`

**第三范式（3NF）：** 非主键字段不依赖于其他非主键字段（消除传递依赖）。

\`\`\`sql
-- 违反3NF：total_price = quantity * unit_price，传递依赖
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  product_id UUID,
  quantity INT,
  unit_price DECIMAL,
  total_price DECIMAL  -- 可以从quantity和unit_price计算
);

-- 符合3NF：去掉计算字段
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  product_id UUID,
  quantity INT,
  unit_price DECIMAL
);
\`\`\`

### 1.3 反范式化：何时打破范式

范式化不是绝对的。在某些场景下，适度的反范式化可以提升性能：

- **高频读取、低频写入**：如果某些数据几乎不变化但频繁被读取，可以在多个表中冗余存储
- **报表和聚合**：如果某些查询需要大量JOIN，可以创建汇总表
- **特定查询优化**：如果某个查询是性能瓶颈，可以考虑反范式化

**AI辅助决策：**

\`\`\`
提示词：我的博客应用每天有100万次文章阅读，但只有100次新文章发布。文章详情页需要显示作者名称、头像、文章标签、评论数。每次查询需要JOIN 4张表。请分析是否应该反范式化，以及如何反范式化。
\`\`\`

## 二、AI辅助Schema生成

### 2.1 从需求生成Schema

AI最强大的能力是根据自然语言需求描述生成数据库Schema。

**提示词模板：**

\`\`\`
请为以下业务需求设计数据库Schema：

业务描述：
{详细的业务需求描述}

实体列表：
1. {实体1}：{字段列表}
2. {实体2}：{字段列表}

关系：
- {实体1} 和 {实体2}：{关系类型}
- {实体1} 和 {实体3}：{关系类型}

约束：
- 使用 {数据库类型}（PostgreSQL/MySQL）
- 所有表使用UUID主键
- 添加created_at和updated_at时间戳
- 软删除（使用deleted_at字段）
- 添加合适的索引

请生成完整的CREATE TABLE语句。
\`\`\`

### 2.2 字段类型选择指南

AI可以帮助你选择正确的字段类型：

| 数据 | PostgreSQL | MySQL | 说明 |
|------|-----------|-------|------|
| 短文本 | VARCHAR(n) | VARCHAR(n) | n为最大字符数 |
| 长文本 | TEXT | TEXT/LONGTEXT | 无长度限制 |
| 整数 | INTEGER | INT | -21亿到21亿 |
| 大整数 | BIGINT | BIGINT | 更大范围 |
| 小数 | DECIMAL(p,s) | DECIMAL(p,s) | 精确小数 |
| 布尔值 | BOOLEAN | TINYINT(1) | true/false |
| 日期时间 | TIMESTAMP | DATETIME | 带时区用TIMESTAMPTZ |
| JSON | JSONB | JSON | JSONB支持索引 |
| 二进制 | BYTEA | BLOB | 文件/图片 |
| UUID | UUID | CHAR(36) | 全局唯一标识 |

### 2.3 索引设计原则

索引是数据库性能优化的核心。AI可以帮助你设计合适的索引。

**索引类型：**

| 索引类型 | 用途 | 适用场景 |
|---------|------|---------|
| B-Tree | 默认索引 | 等值查询、范围查询、排序 |
| Hash | 等值查询 | 只用于=查询 |
| GIN | 全文搜索、数组 | PostgreSQL的JSONB、数组 |
| GiST | 几何数据、全文搜索 | 地理空间数据 |
| BRIN | 块范围索引 | 非常大的表，自然排序 |

**AI索引设计提示词：**

\`\`\`
提示词：以下是博客应用的数据库Schema。请分析常见的查询场景，并推荐应该添加哪些索引。

查询场景：
1. 按发布时间倒序获取文章列表（首页）
2. 按slug获取单篇文章
3. 按作者ID获取文章列表
4. 按标签筛选文章
5. 全文搜索文章标题和内容
6. 获取用户的评论列表
7. 按文章ID获取评论列表

请为每个查询场景推荐索引，并说明理由。
\`\`\`

## 三、查询优化

### 3.1 常见查询优化技巧

**技巧一：只查询需要的字段**

\`\`\`sql
-- 不好：SELECT * 获取所有字段
SELECT * FROM posts WHERE published = true;

-- 好的：只获取需要的字段
SELECT id, title, slug, excerpt, created_at
FROM posts
WHERE published = true;
\`\`\`

**技巧二：使用EXPLAIN分析查询**

\`\`\`sql
EXPLAIN ANALYZE
SELECT p.*, u.name as author_name
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.published = true
ORDER BY p.created_at DESC
LIMIT 10;
\`\`\`

**技巧三：避免N+1查询**

\`\`\`sql
-- 不好：N+1查询
-- 先获取文章列表
SELECT * FROM posts LIMIT 10;
-- 然后对每篇文章查询作者
SELECT * FROM users WHERE id = ?;  -- 执行10次

-- 好的：使用JOIN一次获取
SELECT p.*, u.name as author_name
FROM posts p
JOIN users u ON p.author_id = u.id
LIMIT 10;
\`\`\`

**技巧四：使用批量操作**

\`\`\`sql
-- 不好：逐条插入
INSERT INTO posts (title, content) VALUES ('Title 1', 'Content 1');
INSERT INTO posts (title, content) VALUES ('Title 2', 'Content 2');

-- 好的：批量插入
INSERT INTO posts (title, content) VALUES
  ('Title 1', 'Content 1'),
  ('Title 2', 'Content 2');
\`\`\`

### 3.2 让AI优化你的查询

\`\`\`
提示词：以下是获取博客首页数据的SQL查询，请分析并优化：

SELECT p.*,
       u.name, u.avatar,
       COUNT(DISTINCT c.id) as comment_count,
       COUNT(DISTINCT l.id) as like_count,
       GROUP_CONCAT(DISTINCT t.name) as tags
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.published = true
  AND p.deleted_at IS NULL
GROUP BY p.id, u.name, u.avatar
ORDER BY p.created_at DESC
LIMIT 10;
\`\`\`

### 3.3 查询优化模式

**延迟关联（Deferred Join）**

\`\`\`sql
-- 对于大偏移量的分页，使用延迟关联
SELECT p.*, u.name
FROM posts p
JOIN users u ON p.author_id = u.id
JOIN (
  SELECT id FROM posts
  WHERE published = true
  ORDER BY created_at DESC
  LIMIT 10 OFFSET 1000
) AS post_ids ON p.id = post_ids.id;
\`\`\`

**覆盖索引（Covering Index）**

\`\`\`sql
-- 创建覆盖索引，避免回表查询
CREATE INDEX idx_posts_list ON posts(published, created_at DESC, id, title, slug, excerpt);
\`\`\`

## 四、数据库迁移

### 4.1 迁移策略

数据库迁移是数据库管理中的重要环节。AI可以帮助你生成和管理迁移脚本。

**迁移类型：**

| 迁移类型 | 描述 | 风险 |
|---------|------|------|
| 添加表 | 创建新表 | 低 |
| 添加列 | 添加新列（带默认值） | 低至中 |
| 修改列类型 | 修改列的数据类型 | 高 |
| 删除列 | 删除列 | 高（先标记废弃） |
| 添加索引 | 创建索引 | 中（可能锁表） |
| 重命名列 | 重命名列 | 中 |

### 4.2 安全的迁移实践

\`\`\`sql
-- 安全的迁移步骤（以添加NOT NULL列为例）

-- 步骤1：添加允许NULL的列
ALTER TABLE posts ADD COLUMN view_count INTEGER;

-- 步骤2：填充默认值（分批更新）
UPDATE posts SET view_count = 0 WHERE view_count IS NULL;

-- 步骤3：添加NOT NULL约束
ALTER TABLE posts ALTER COLUMN view_count SET NOT NULL;

-- 步骤4：添加默认值
ALTER TABLE posts ALTER COLUMN view_count SET DEFAULT 0;
\`\`\`

### 4.3 AI生成迁移脚本

\`\`\`
提示词：我需要将博客应用的数据库从当前Schema迁移到新Schema。变更如下：
1. 在posts表中添加view_count字段（INTEGER，默认0，NOT NULL）
2. 在posts表中添加reading_time字段（INTEGER，默认0）
3. 创建tags表（id, name, slug）
4. 创建post_tags关联表（post_id, tag_id）
5. 在users表中添加last_login_at字段（TIMESTAMP，可为NULL）
6. 删除posts表中不再使用的legacy_content字段

请生成安全的迁移脚本，包括回滚方案。
\`\`\`

## 五、ERD（实体关系图）生成

ERD是理解数据库结构的可视化工具。AI可以从描述中生成ERD。

**提示词：**

\`\`\`
请为以下实体关系生成ERD描述（使用Mermaid格式）：

实体：
1. User：id, name, email, password, avatar, role, createdAt
2. Post：id, title, slug, content, published, authorId, createdAt
3. Comment：id, content, postId, authorId, parentId, createdAt
4. Tag：id, name, slug
5. Like：id, postId, userId, createdAt

关系：
- User 1:N Post（作者关系）
- User 1:N Comment（评论作者）
- Post 1:N Comment
- Comment 1:N Comment（自引用，嵌套回复）
- Post N:M Tag（通过PostTag关联表）
- User N:M Post（通过Like，点赞关系）
\`\`\`

## 六、数据建模模式

### 6.1 常见建模模式

**模式一：树形结构（邻接表）**

\`\`\`sql
-- 邻接表模式：适合简单的树形结构
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 查询某个分类的所有子分类
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 as level
  FROM categories
  WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, name;
\`\`\`

**模式二：物化路径**

\`\`\`sql
-- 物化路径模式：适合频繁查询祖先/后代
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  path VARCHAR(500), -- 如 "/1/5/12/"
  created_at TIMESTAMP DEFAULT NOW()
);

-- 查询某个分类的所有后代
SELECT * FROM categories WHERE path LIKE '/1/5/%';
\`\`\`

**模式三：嵌套集**

\`\`\`sql
-- 嵌套集模式：适合频繁查询但很少修改的树形结构
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  lft INTEGER,
  rgt INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 查询某个节点的所有后代
SELECT * FROM categories
WHERE lft BETWEEN 5 AND 20
ORDER BY lft;
\`\`\`

### 6.2 多租户数据隔离

| 模式 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| 独立数据库 | 每个租户一个数据库 | 最强隔离 | 成本高，管理复杂 |
| 独立Schema | 每个租户一个Schema | 较好隔离 | 跨租户查询困难 |
| 共享表+tenant_id | 所有租户共享表 | 简单，成本低 | 隔离性最弱 |
| 混合模式 | 关键数据独立，其他共享 | 灵活 | 实现复杂 |

### 6.3 软删除 vs 硬删除

\`\`\`sql
-- 软删除模式
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  deleted_at TIMESTAMP,  -- NULL表示未删除
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 查询时过滤已删除记录
SELECT * FROM posts WHERE deleted_at IS NULL;

-- 创建部分索引（只索引未删除的记录）
CREATE INDEX idx_posts_active ON posts(created_at DESC) WHERE deleted_at IS NULL;
\`\`\`

## 七、性能调优

### 7.1 数据库配置优化

**PostgreSQL关键配置：**

| 参数 | 建议值 | 说明 |
|------|--------|------|
| shared_buffers | 25% RAM | 共享缓冲区 |
| effective_cache_size | 75% RAM | 操作系统缓存 |
| work_mem | 64MB | 排序/哈希操作内存 |
| maintenance_work_mem | 512MB | 维护操作内存 |
| max_connections | 根据应用需求 | 最大连接数 |
| random_page_cost | 1.1（SSD） | 随机页访问成本 |

### 7.2 连接池

使用连接池避免频繁创建和销毁数据库连接。

\`\`\`javascript
// Prisma连接池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 连接池配置
  connection: {
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
    },
  },
});
\`\`\`

### 7.3 读写分离

\`\`\`javascript
// 读写分离配置
const db = {
  read: new PrismaClient({
    datasources: { db: { url: process.env.READ_REPLICA_URL } },
  }),
  write: new PrismaClient({
    datasources: { db: { url: process.env.PRIMARY_URL } },
  }),
};

// 读操作使用只读副本
async function getPosts() {
  return db.read.post.findMany();
}

// 写操作使用主库
async function createPost(data) {
  return db.write.post.create({ data });
}
\`\`\`

## 八、备份与恢复策略

### 8.1 备份策略

| 策略 | 频率 | 恢复时间 | 存储成本 |
|------|------|---------|---------|
| 全量备份 | 每天/每周 | 中 | 高 |
| 增量备份 | 每小时 | 长（需要回溯） | 低 |
| 差异备份 | 每天 | 中 | 中 |
| WAL归档 | 持续 | 短（PITR） | 中 |
| 快照备份 | 每天 | 短 | 中 |

### 8.2 备份自动化

\`\`\`bash
#!/bin/bash
# PostgreSQL备份脚本
BACKUP_DIR="/backups/postgres"
DB_NAME="myapp"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份
pg_dump -Fc \${DB_NAME} > \${BACKUP_DIR}/\${DB_NAME}_\${TIMESTAMP}.dump

# 保留最近7天的备份
find \${BACKUP_DIR} -name "\${DB_NAME}_*.dump" -mtime +7 -delete

echo "Backup completed: \${DB_NAME}_\${TIMESTAMP}.dump"
\`\`\`

## 九、常见数据库设计错误

### 9.1 错误一：缺少索引

在查询频繁的字段上忘记添加索引，导致全表扫描。

### 9.2 错误二：过度索引

为每个字段都添加索引，导致写入性能下降和存储空间浪费。

### 9.3 错误三：使用错误的字段类型

例如用VARCHAR存储日期、用TEXT存储UUID等。

### 9.4 错误四：忽略数据库约束

不添加外键约束、唯一约束、检查约束，依赖应用层保证数据一致性。

### 9.5 错误五：没有备份策略

在灾难发生时才发现没有可用的备份。

## 总结

数据库是应用的基石。一个好的数据库设计能让应用运行得又快又稳，而一个糟糕的设计则可能成为整个系统的瓶颈。AI可以帮助你加速数据库设计的过程，但你需要理解数据库的基本原理，才能做出正确的判断。

关键要点：
1. 选择合适的数据库类型（关系型 vs NoSQL）
2. 合理使用范式化和反范式化
3. 为查询模式设计合适的索引
4. 使用EXPLAIN分析和优化查询
5. 制定安全的迁移策略
6. 建立备份和恢复计划
7. 监控数据库性能，及时调整配置

记住：数据库设计是"先苦后甜"的工作——在设计阶段多花时间，在生产环境中就能少出问题。
    `,
    code: `
// =============================================================
// 数据库Schema生成器
// 根据实体描述和关系，生成SQL CREATE TABLE语句
// =============================================================

class DatabaseSchemaGenerator {
  constructor() {
    this.typeMapping = {
      'String': { sql: 'VARCHAR(255)', pg: 'VARCHAR(255)', mysql: 'VARCHAR(255)' },
      'Text': { sql: 'TEXT', pg: 'TEXT', mysql: 'LONGTEXT' },
      'Int': { sql: 'INTEGER', pg: 'INTEGER', mysql: 'INT' },
      'BigInt': { sql: 'BIGINT', pg: 'BIGINT', mysql: 'BIGINT' },
      'Float': { sql: 'FLOAT', pg: 'FLOAT', mysql: 'FLOAT' },
      'Decimal': { sql: 'DECIMAL(10,2)', pg: 'DECIMAL(10,2)', mysql: 'DECIMAL(10,2)' },
      'Boolean': { sql: 'BOOLEAN', pg: 'BOOLEAN', mysql: 'TINYINT(1)' },
      'DateTime': { sql: 'TIMESTAMP', pg: 'TIMESTAMP', mysql: 'DATETIME' },
      'Date': { sql: 'DATE', pg: 'DATE', mysql: 'DATE' },
      'UUID': { sql: 'UUID', pg: 'UUID', mysql: 'CHAR(36)' },
      'JSON': { sql: 'JSONB', pg: 'JSONB', mysql: 'JSON' },
      'Bytes': { sql: 'BYTEA', pg: 'BYTEA', mysql: 'BLOB' },
      'Email': { sql: 'VARCHAR(255)', pg: 'VARCHAR(255)', mysql: 'VARCHAR(255)' },
      'URL': { sql: 'VARCHAR(2048)', pg: 'VARCHAR(2048)', mysql: 'VARCHAR(2048)' },
    };

    this.indexRecommendations = {
      'primaryKey': '自动为主键创建唯一索引',
      'foreignKey': '建议为外键创建索引以加速JOIN操作',
      'uniqueField': 'UNIQUE约束自动创建索引',
      'sortField': '用于排序的字段建议创建索引',
      'filterField': '用于WHERE条件的字段建议创建索引',
      'searchField': '用于全文搜索的字段建议创建GIN索引',
    };
  }

  // 获取SQL类型
  getSQLType(type, dialect = 'pg') {
    const mapping = this.typeMapping[type];
    if (!mapping) return 'VARCHAR(255)';
    return mapping[dialect] || mapping.sql;
  }

  // 生成CREATE TABLE语句
  generateCreateTable(entity, relationships, dialect = 'pg') {
    const { name, fields } = entity;
    const tableName = this.toSnakeCase(name);
    let sql = \`CREATE TABLE \${tableName} (\\n\`;

    const columnDefs = [];
    const constraints = [];
    const indexes = [];

    for (const field of fields) {
      const colName = this.toSnakeCase(field.name);
      let colDef = \`  \${colName} \${this.getSQLType(field.type, dialect)}\`;

      // 主键
      if (field.primary) {
        if (field.type === 'UUID') {
          if (dialect === 'pg') {
            colDef = \`  \${colName} UUID PRIMARY KEY DEFAULT gen_random_uuid()\`;
          } else if (dialect === 'mysql') {
            colDef = \`  \${colName} CHAR(36) PRIMARY KEY DEFAULT (UUID())\`;
          }
        }
      }

      // NOT NULL
      if (field.required !== false && !field.primary) {
        colDef += ' NOT NULL';
      }

      // DEFAULT
      if (field.default !== undefined) {
        if (typeof field.default === 'string') {
          if (field.default === 'NOW()') {
            colDef += \` DEFAULT \${dialect === 'mysql' ? 'CURRENT_TIMESTAMP' : 'NOW()'}\`;
          } else {
            colDef += \` DEFAULT '\${field.default}'\`;
          }
        } else if (typeof field.default === 'boolean') {
          colDef += \` DEFAULT \${field.default ? (dialect === 'mysql' ? '1' : 'TRUE') : (dialect === 'mysql' ? '0' : 'FALSE')}\`;
        } else {
          colDef += \` DEFAULT \${field.default}\`;
        }
      }

      columnDefs.push(colDef);

      // UNIQUE约束
      if (field.unique) {
        constraints.push(\`  CONSTRAINT uq_\${tableName}_\${colName} UNIQUE (\${colName})\`);
      }

      // 索引建议
      if (field.foreignKey) {
        indexes.push(\`CREATE INDEX idx_\${tableName}_\${colName} ON \${tableName}(\${colName});\`);
      }
    }

    // 添加外键约束
    for (const rel of relationships) {
      if (rel.from === name && rel.type === 'belongsTo') {
        const fkCol = this.toSnakeCase(rel.field);
        const refTable = this.toSnakeCase(rel.to);
        constraints.push(\`  CONSTRAINT fk_\${tableName}_\${fkCol} FOREIGN KEY (\${fkCol}) REFERENCES \${refTable}(id) ON DELETE CASCADE\`);
      }
    }

    // 组合列定义
    sql += columnDefs.join(',\\n');

    // 添加约束
    if (constraints.length > 0) {
      sql += ',\\n' + constraints.join(',\\n');
    }

    sql += '\\n);';

    // 添加索引
    if (indexes.length > 0) {
      sql += '\\n\\n' + indexes.join('\\n');
    }

    return sql;
  }

  // 分析并推荐索引
  analyzeIndexes(entity, queries) {
    const recommendations = [];
    const fields = entity.fields;

    for (const query of queries) {
      for (const field of fields) {
        if (query.includes(field.name.toLowerCase()) && !field.primary) {
          const existing = recommendations.find(r => r.field === field.name);
          if (!existing) {
            recommendations.push({
              field: field.name,
              reason: \`查询中使用了 \${field.name} 作为过滤条件\`,
              indexType: 'B-Tree',
              priority: 'HIGH',
            });
          }
        }
      }

      if (query.includes('order') || query.includes('排序')) {
        for (const field of fields) {
          if (field.sortable || field.name.toLowerCase().includes('created') || field.name.toLowerCase().includes('updated')) {
            const existing = recommendations.find(r => r.field === field.name);
            if (!existing) {
              recommendations.push({
                field: field.name,
                reason: '排序操作需要索引支持',
                indexType: 'B-Tree',
                priority: 'MEDIUM',
              });
            }
          }
        }
      }
    }

    return recommendations;
  }

  // 生成ERD文本描述
  generateERDDescription(entities, relationships) {
    let erd = '实体关系图（ERD）：\\n\\n';

    for (const entity of entities) {
      erd += \`[ \${entity.name} ]\\n\`;
      for (const field of entity.fields) {
        const pk = field.primary ? ' PK' : '';
        const fk = field.foreignKey ? ' FK' : '';
        const marker = pk || fk || '';
        erd += \`│ \${field.name.padEnd(20)} \${field.type.padEnd(12)} \${marker} │\\n\`;
      }
      erd += '\\n';
    }

    erd += '关系：\\n';
    for (const rel of relationships) {
      if (rel.type === 'belongsTo') {
        erd += \`  \${rel.from} ──────▶ \${rel.to} (N:1)\\n\`;
      } else if (rel.type === 'selfReference') {
        erd += \`  \${rel.from} ◀──▶ \${rel.from} (自引用)\\n\`;
      }
    }

    return erd;
  }

  toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  // 主生成方法
  generate(description) {
    const { entities, relationships, queries, dialect } = description;
    const db = dialect || 'pg';

    console.log('========================================');
    console.log('  🗄️  数据库Schema生成器');
    console.log('========================================\\n');
    console.log(\`数据库类型：\${db === 'pg' ? 'PostgreSQL' : 'MySQL'}\`);
    console.log(\`实体数量：\${entities.length}\`);
    console.log('');

    for (const entity of entities) {
      console.log(\`📦 生成表：\${entity.name}\`);
      const createSQL = this.generateCreateTable(entity, relationships, db);
      console.log(createSQL);
      console.log('');

      if (queries) {
        const entityQueries = queries.filter(q => q.entity === entity.name);
        if (entityQueries.length > 0) {
          const indexes = this.analyzeIndexes(entity, entityQueries.map(q => q.description));
          if (indexes.length > 0) {
            console.log(\`  📊 索引推荐：\`);
            for (const idx of indexes) {
              console.log(\`    - \${idx.field}: \${idx.reason} (\${idx.priority})\`);
            }
            console.log('');
          }
        }
      }
    }

    // 生成ERD
    console.log('========================================');
    console.log('  📊 实体关系图');
    console.log('========================================\\n');
    const erd = this.generateERDDescription(entities, relationships);
    console.log(erd);

    console.log('✅ 数据库Schema生成完成！');
    return { entities, relationships };
  }
}

// =============================================================
// 演示运行
// =============================================================

const schemaGen = new DatabaseSchemaGenerator();

console.log('\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🗄️  案例：博客应用数据库Schema生成        ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

const blogSchema = schemaGen.generate({
  dialect: 'pg',
  entities: [
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'UUID', primary: true },
        { name: 'email', type: 'Email', required: true, unique: true },
        { name: 'name', type: 'String', required: true },
        { name: 'password', type: 'String', required: true },
        { name: 'avatar', type: 'URL' },
        { name: 'bio', type: 'Text' },
        { name: 'role', type: 'String', default: 'USER' },
        { name: 'createdAt', type: 'DateTime', default: 'NOW()' },
        { name: 'updatedAt', type: 'DateTime', default: 'NOW()' },
      ],
    },
    {
      name: 'Post',
      fields: [
        { name: 'id', type: 'UUID', primary: true },
        { name: 'title', type: 'String', required: true },
        { name: 'slug', type: 'String', required: true, unique: true },
        { name: 'content', type: 'Text', required: true },
        { name: 'excerpt', type: 'Text' },
        { name: 'published', type: 'Boolean', default: false },
        { name: 'viewCount', type: 'Int', default: 0 },
        { name: 'authorId', type: 'UUID', required: true, foreignKey: true },
        { name: 'createdAt', type: 'DateTime', default: 'NOW()' },
        { name: 'updatedAt', type: 'DateTime', default: 'NOW()' },
      ],
    },
    {
      name: 'Comment',
      fields: [
        { name: 'id', type: 'UUID', primary: true },
        { name: 'content', type: 'Text', required: true },
        { name: 'postId', type: 'UUID', required: true, foreignKey: true },
        { name: 'authorId', type: 'UUID', required: true, foreignKey: true },
        { name: 'parentId', type: 'UUID', foreignKey: true },
        { name: 'createdAt', type: 'DateTime', default: 'NOW()' },
      ],
    },
    {
      name: 'Tag',
      fields: [
        { name: 'id', type: 'UUID', primary: true },
        { name: 'name', type: 'String', required: true, unique: true },
        { name: 'slug', type: 'String', required: true, unique: true },
      ],
    },
    {
      name: 'PostTag',
      fields: [
        { name: 'postId', type: 'UUID', required: true, foreignKey: true },
        { name: 'tagId', type: 'UUID', required: true, foreignKey: true },
      ],
    },
  ],
  relationships: [
    { from: 'Post', to: 'User', type: 'belongsTo', field: 'authorId' },
    { from: 'Comment', to: 'Post', type: 'belongsTo', field: 'postId' },
    { from: 'Comment', to: 'User', type: 'belongsTo', field: 'authorId' },
    { from: 'Comment', to: 'Comment', type: 'selfReference', field: 'parentId' },
    { from: 'PostTag', to: 'Post', type: 'belongsTo', field: 'postId' },
    { from: 'PostTag', to: 'Tag', type: 'belongsTo', field: 'tagId' },
  ],
  queries: [
    { entity: 'Post', description: '按发布时间倒序获取文章列表' },
    { entity: 'Post', description: '按slug获取单篇文章' },
    { entity: 'Post', description: '按作者ID获取文章列表' },
    { entity: 'Comment', description: '按文章ID获取评论列表' },
  ],
});

console.log('\\n\\n✅ 数据库Schema生成完成！');
console.log('💡 提示：生成的SQL语句可以直接在数据库中执行，');
console.log('   也可以作为Prisma/Drizzle等其他ORM的参考。');
    `,
  },

  // ============================================================
  // 第 29 章：AI辅助架构设计：从单体到微服务
  // ============================================================
  {
    id: "ai-architecture",
    icon: "🏛️",
    group: "进阶实战",
    title: "AI辅助架构设计：从单体到微服务",
    content: `
# AI辅助架构设计：从单体到微服务

## 引言：架构——软件的灵魂

如果说代码是软件的肉体，那么架构就是软件的灵魂。一个好的架构可以让系统在数年甚至数十年间持续演进，而一个糟糕的架构则可能让系统在几个月内就变得难以维护。

架构设计一直是软件工程中最具挑战性的领域之一。它需要深厚的经验、广阔的技术视野、以及对业务需求的深刻理解。AI的出现为架构设计带来了新的可能性——它可以帮助你分析系统需求，推荐合适的架构模式，甚至生成架构决策记录。

但AI不是架构师。它可以提供建议、分析方案、生成文档，但最终的架构决策仍然需要你来做出。本章将探讨如何将AI作为架构设计的得力助手。

## 一、架构设计的基本原则

### 1.1 架构的核心关注点

| 维度 | 描述 | 关键问题 |
|------|------|---------|
| 可扩展性 | 系统处理增长的能力 | 能否支持10倍用户量？ |
| 可维护性 | 代码易于理解和修改 | 新成员多久能上手？ |
| 可靠性 | 系统在面对故障时的表现 | 单点故障在哪里？ |
| 性能 | 系统的响应时间和吞吐量 | 最慢的操作是什么？ |
| 安全性 | 系统抵御攻击的能力 | 攻击面有多大？ |
| 成本 | 开发和运维的经济成本 | 每月花费多少？ |

### 1.2 架构权衡

| 权衡 | 方案A | 方案B |
|------|-------|-------|
| 一致性 vs 可用性 | 强一致性（CP） | 最终一致性（AP） |
| 性能 vs 可维护性 | 高性能（复杂优化） | 可维护（简单代码） |
| 开发速度 vs 代码质量 | 快速迭代（技术债） | 高质量（慢开发） |
| 单体 vs 微服务 | 简单部署（单体） | 独立扩展（微服务） |
| 同步 vs 异步 | 简单逻辑（同步） | 解耦（异步） |

## 二、单体架构 vs 微服务架构

### 2.1 单体架构

**优点：** 开发简单、调试方便、部署简单、事务简单、测试简单
**缺点：** 扩展困难、技术锁定、部署风险、团队协作、认知负担

### 2.2 微服务架构

**优点：** 独立部署、独立扩展、技术多样性、团队自治、故障隔离
**缺点：** 分布式复杂性、运维成本、数据一致性、调试困难、集成测试

### 2.3 迁移策略：Strangler Fig模式

Strangler Fig（绞杀榕）模式是单体到微服务迁移的推荐策略：

\`\`\`
第一阶段：识别边界 → 分析单体应用，识别服务边界
第二阶段：建立路由 → 在单体前放置API网关
第三阶段：逐个迁移 → 选择风险最低的模块开始迁移
第四阶段：完全替换 → 下线旧单体应用
\`\`\`

## 三、事件驱动架构

### 3.1 核心概念

事件驱动架构（EDA）是一种基于事件的异步通信模式。核心概念包括：

- **事件生产者**：发布事件的服务
- **事件消费者**：订阅和处理事件的服务
- **事件总线**：传输事件的基础设施（Kafka、RabbitMQ）
- **事件**：系统中发生的事实

### 3.2 事件设计原则

事件命名规范：\`{领域}.{实体}.{动作}\`

\`\`\`json
{
  "eventId": "uuid",
  "eventType": "order.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "order-service",
  "version": "1.0",
  "payload": {
    "orderId": "uuid",
    "userId": "uuid",
    "totalAmount": 99.99,
    "items": [...]
  }
}
\`\`\`

## 四、CQRS和事件溯源

### 4.1 CQRS（命令查询职责分离）

CQRS将读操作和写操作分离到不同的模型中。

\`\`\`
传统模式：Client → Service → Database（读写同一个数据库）
CQRS模式：Client → Command Service → Write Database
          Client → Query Service → Read Database（优化过的视图）
\`\`\`

**CQRS的优势：** 读写可以独立优化、读模型可以针对查询优化、可以独立扩展读写服务
**CQRS的挑战：** 数据同步延迟、实现复杂度增加、最终一致性

### 4.2 事件溯源（Event Sourcing）

事件溯源不存储当前状态，而是存储所有状态变更的事件序列。

\`\`\`
传统模式：{ orderId: 123, status: "PAID", amount: 100 }
事件溯源：
1. OrderCreated { orderId: 123, items: [...] }
2. OrderPaid { orderId: 123, amount: 100 }
3. OrderShipped { orderId: 123, trackingId: "xxx" }
\`\`\`

**优势：** 完整审计日志、可重建任意时间点状态、时间旅行调试
**挑战：** 存储量大、查询复杂、快照管理、事件Schema演化

## 五、服务边界识别

### 5.1 领域驱动设计（DDD）

**限界上下文（Bounded Context）：** 一个明确的业务领域边界，术语和规则一致
**聚合（Aggregate）：** 一组相关对象的集合，由聚合根管理
**领域事件（Domain Event）：** 领域中发生的重要事实

### 5.2 用AI识别服务边界

\`\`\`
提示词：以下是电商系统的功能清单，请使用DDD方法识别限界上下文和服务边界：

功能：用户注册/登录、商品浏览/搜索、购物车、订单管理、在线支付、库存管理、物流跟踪、评价评分、优惠券/促销、消息通知、客服工单、数据统计

请为每个限界上下文定义核心聚合、主要领域事件和集成方式。
\`\`\`

## 六、通信模式

### 6.1 同步 vs 异步

| 维度 | 同步通信 | 异步通信 |
|------|---------|---------|
| 协议 | HTTP/REST, gRPC | 消息队列, 事件总线 |
| 耦合度 | 高（等待响应） | 低（发布-订阅） |
| 延迟 | 低 | 高（异步处理） |
| 可靠性 | 低（依赖服务可用） | 高（消息持久化） |
| 适用场景 | 查询、实时操作 | 通知、异步处理 |

### 6.2 API网关

API网关是微服务架构的入口，提供路由、认证、限流、聚合等功能。

| 功能 | 描述 |
|------|------|
| 路由 | 将请求路由到正确的服务 |
| 认证 | 统一认证和授权 |
| 限流 | 防止服务过载 |
| 聚合 | 将多个服务的响应聚合 |
| 转换 | 协议转换（HTTP到gRPC） |

## 七、架构决策记录（ADR）

### 7.1 ADR模板

\`\`\`markdown
# ADR-001：选择PostgreSQL作为主数据库

## 状态
已采纳

## 背景
我们需要为博客应用选择主数据库。数据关联性强，需要事务支持。

## 选项
1. PostgreSQL：功能最丰富的关系型数据库
2. MySQL：最流行的开源数据库
3. MongoDB：灵活的文档数据库

## 决策
选择PostgreSQL，因为对JSONB的支持、内置全文搜索、丰富的数据类型。

## 影响
- 需要团队学习PostgreSQL特性
- 可以利用PostgreSQL的高级功能
\`\`\`

## 八、常见架构错误

### 8.1 错误一：过早优化

在系统还没有验证需求时，就设计了复杂的分布式架构。

### 8.2 错误二：过度拆分

将本来紧密关联的功能拆分到不同服务，导致分布式事务问题。

### 8.3 错误三：忽略数据一致性

在微服务架构中引入分布式事务，但没有妥善处理失败场景。

### 8.4 错误四：没有监控和可观测性

微服务架构中服务数量增加，但缺乏统一的监控和追踪。

### 8.5 错误五：技术驱动的架构决策

选择某项技术不是因为业务需要，而是因为"它很酷"。

## 总结

架构设计是软件工程中最具挑战性的领域。AI可以帮助你分析需求、推荐方案、生成文档，但最终的架构决策需要你的判断。

关键要点：
1. 从单体开始，根据实际需要演进
2. 使用DDD识别服务边界
3. 选择合适的通信模式（同步/异步）
4. 记录架构决策（ADR）
5. 优先考虑可维护性和简单性
6. 建立完善的监控和可观测性

记住：好的架构是演化出来的，而不是设计出来的。
    `,
    code: `
// =============================================================
// 架构模式推荐器
// 根据系统需求（规模、团队、延迟等）推荐合适的架构模式
// =============================================================

class ArchitectureRecommender {
  constructor() {
    this.patterns = {
      'monolith': {
        name: '单体架构',
        description: '所有功能在一个应用中，单一部署单元',
        suitableFor: { teamSize: 'small', userScale: 'small', complexity: 'low', dataConsistency: 'strong' },
        pros: ['开发简单', '部署简单', '调试方便', '事务简单'],
        cons: ['扩展困难', '技术锁定', '部署风险高'],
        stack: {
          backend: 'Node.js/Express 或 Django',
          database: 'PostgreSQL 或 MySQL',
          frontend: 'React/Vue + SSR',
          deployment: '单服务器 或 VPS',
        },
      },
      'modular-monolith': {
        name: '模块化单体',
        description: '单体应用但内部按模块组织，为未来拆分做准备',
        suitableFor: { teamSize: 'medium', userScale: 'medium', complexity: 'medium', dataConsistency: 'strong' },
        pros: ['模块清晰', '可逐步拆分', '事务简单', '部署仍简单'],
        cons: ['模块边界易模糊', '仍共享数据库'],
        stack: {
          backend: 'Next.js 或 Spring Boot',
          database: 'PostgreSQL（多Schema）',
          frontend: 'React SPA + SSR',
          deployment: 'Docker + 单服务器',
        },
      },
      'microservices': {
        name: '微服务架构',
        description: '独立部署的小型服务，通过API或消息通信',
        suitableFor: { teamSize: 'large', userScale: 'large', complexity: 'high', dataConsistency: 'eventual' },
        pros: ['独立部署', '独立扩展', '技术多样性', '故障隔离'],
        cons: ['分布式复杂性', '运维成本高', '调试困难'],
        stack: {
          backend: 'Go/Node.js + gRPC',
          database: '每个服务独立数据库',
          frontend: 'React SPA + BFF',
          deployment: 'Kubernetes + Istio',
          messaging: 'Kafka/RabbitMQ',
        },
      },
      'event-driven': {
        name: '事件驱动架构',
        description: '服务通过事件进行异步通信，松耦合',
        suitableFor: { teamSize: 'medium', userScale: 'large', complexity: 'high', dataConsistency: 'eventual' },
        pros: ['松耦合', '可扩展', '弹性', '审计友好'],
        cons: ['调试困难', '事件Schema管理', '最终一致性'],
        stack: {
          backend: 'Node.js/Go',
          database: 'PostgreSQL + MongoDB',
          frontend: 'React SPA',
          deployment: 'Kubernetes',
          messaging: 'Kafka + Schema Registry',
        },
      },
      'serverless': {
        name: '无服务器架构',
        description: '使用云函数处理请求，按需付费',
        suitableFor: { teamSize: 'small', userScale: 'variable', complexity: 'low', dataConsistency: 'strong' },
        pros: ['零运维', '按需付费', '自动扩展', '快速开发'],
        cons: ['冷启动延迟', '供应商锁定', '调试困难'],
        stack: {
          backend: 'AWS Lambda/Cloudflare Workers',
          database: 'DynamoDB/Supabase',
          frontend: 'React SPA + CDN',
          deployment: 'Serverless Framework',
        },
      },
      'cqrs-es': {
        name: 'CQRS + 事件溯源',
        description: '读写分离，事件驱动状态变更',
        suitableFor: { teamSize: 'medium', userScale: 'large', complexity: 'high', dataConsistency: 'eventual' },
        pros: ['读写独立优化', '完整审计', '时间旅行', '高扩展性'],
        cons: ['实现复杂', '存储量大', '学习曲线陡'],
        stack: {
          backend: 'Kotlin/Java + Axon Framework',
          database: 'PostgreSQL + MongoDB',
          frontend: 'React SPA + GraphQL',
          deployment: 'Kubernetes',
          messaging: 'Kafka + EventStoreDB',
        },
      },
    };
  }

  evaluatePattern(pattern, requirements) {
    let score = 0;
    const details = [];

    const teamSizeMap = { small: 1, medium: 2, large: 3 };
    const teamDiff = Math.abs((teamSizeMap[requirements.teamSize] || 2) - (teamSizeMap[pattern.suitableFor.teamSize] || 2));
    if (teamDiff === 0) { score += 30; details.push('团队规模：完美匹配'); }
    else if (teamDiff === 1) { score += 15; details.push('团队规模：可接受'); }
    else { score += 0; details.push('团队规模：不匹配'); }

    const userScaleMap = { small: 1, medium: 2, large: 3, variable: 2 };
    const userDiff = Math.abs((userScaleMap[requirements.userScale] || 2) - (userScaleMap[pattern.suitableFor.userScale] || 2));
    if (userDiff === 0) { score += 25; details.push('用户规模：完美匹配'); }
    else if (userDiff === 1) { score += 12; details.push('用户规模：可接受'); }
    else { score += 0; details.push('用户规模：不匹配'); }

    const complexityMap = { low: 1, medium: 2, high: 3 };
    const complexityDiff = Math.abs((complexityMap[requirements.complexity] || 2) - (complexityMap[pattern.suitableFor.complexity] || 2));
    if (complexityDiff === 0) { score += 20; details.push('业务复杂度：完美匹配'); }
    else if (complexityDiff === 1) { score += 10; details.push('业务复杂度：可接受'); }
    else { score += 0; details.push('业务复杂度：不匹配'); }

    if (requirements.dataConsistency === pattern.suitableFor.dataConsistency) {
      score += 15; details.push('数据一致性：完美匹配');
    } else if (requirements.dataConsistency === 'strong' && pattern.suitableFor.dataConsistency === 'eventual') {
      score += 0; details.push('数据一致性：不匹配');
    } else {
      score += 8; details.push('数据一致性：可接受');
    }

    if (requirements.lowLatency && pattern.name === 'serverless') {
      score -= 10; details.push('延迟要求：Serverless冷启动可能有影响');
    } else if (requirements.lowLatency) {
      score += 10; details.push('延迟要求：可满足');
    }

    if (requirements.budget === 'low' && ['monolith', 'modular-monolith', 'serverless'].includes(pattern.name)) {
      score += 10; details.push('预算：成本友好');
    }

    return { score, details };
  }

  recommend(requirements) {
    console.log('========================================');
    console.log('  🏛️  架构模式推荐器');
    console.log('========================================\\n');

    console.log('需求分析：');
    console.log(\`  团队规模：\${requirements.teamSize === 'small' ? '小（1-10人）' : requirements.teamSize === 'medium' ? '中（10-30人）' : '大（30+人）'}\`);
    console.log(\`  用户规模：\${requirements.userScale === 'small' ? '小（<10万）' : requirements.userScale === 'medium' ? '中（10万-100万）' : '大（100万+）'}\`);
    console.log(\`  业务复杂度：\${requirements.complexity === 'low' ? '低' : requirements.complexity === 'medium' ? '中' : '高'}\`);
    console.log(\`  数据一致性：\${requirements.dataConsistency === 'strong' ? '强一致性' : '最终一致性'}\`);
    console.log(\`  低延迟要求：\${requirements.lowLatency ? '是' : '否'}\`);
    console.log(\`  预算：\${requirements.budget === 'low' ? '低' : requirements.budget === 'medium' ? '中' : '高'}\`);
    console.log('');

    const evaluations = [];
    for (const [key, pattern] of Object.entries(this.patterns)) {
      const evaluation = this.evaluatePattern(pattern, requirements);
      evaluations.push({ key, pattern, ...evaluation });
    }

    evaluations.sort((a, b) => b.score - a.score);

    console.log('========================================');
    console.log('  📊 评估结果');
    console.log('========================================\\n');

    for (const evaluation of evaluations) {
      const bar = '█'.repeat(Math.floor(evaluation.score / 5));
      console.log(\`\${evaluation.pattern.name} [\${evaluation.score}分] \${bar}\`);
      for (const detail of evaluation.details) {
        console.log(\`  \${detail}\`);
      }
      console.log('');
    }

    const best = evaluations[0];
    console.log('========================================');
    console.log('  🎯 推荐方案');
    console.log('========================================\\n');

    console.log(\`🏆 最佳推荐：\${best.pattern.name}\`);
    console.log(\`   描述：\${best.pattern.description}\`);
    console.log(\`   匹配度：\${best.score}分\`);
    console.log('   优点：');
    for (const pro of best.pattern.pros) {
      console.log(\`   ✅ \${pro}\`);
    }
    console.log('   需要注意：');
    for (const con of best.pattern.cons) {
      console.log(\`   ⚠️  \${con}\`);
    }
    console.log('   推荐技术栈：');
    for (const [key, value] of Object.entries(best.pattern.stack)) {
      console.log(\`   📦 \${key}: \${value}\`);
    }
    console.log('');

    return { best, evaluations };
  }
}

// =============================================================
// 演示运行
// =============================================================

const recommender = new ArchitectureRecommender();

console.log('\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🏛️  案例一：初创公司博客应用              ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

recommender.recommend({
  teamSize: 'small',
  userScale: 'small',
  complexity: 'low',
  dataConsistency: 'strong',
  lowLatency: true,
  budget: 'low',
});

console.log('\\n\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🏛️  案例二：中型电商平台                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

recommender.recommend({
  teamSize: 'medium',
  userScale: 'medium',
  complexity: 'medium',
  dataConsistency: 'strong',
  lowLatency: true,
  budget: 'medium',
});

console.log('\\n\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  🏛️  案例三：大型社交平台                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

recommender.recommend({
  teamSize: 'large',
  userScale: 'large',
  complexity: 'high',
  dataConsistency: 'eventual',
  lowLatency: false,
  budget: 'high',
});

console.log('\\n\\n✅ 架构推荐完成！');
console.log('💡 提示：架构选择应该基于实际需求，从简单开始，根据实际需要演进。');
    `,
  },

  // ============================================================
  // 第 30 章：AI辅助性能优化：定位瓶颈
  // ============================================================
  {
    id: "ai-performance",
    icon: "⚡",
    group: "进阶实战",
    title: "AI辅助性能优化：定位瓶颈",
    content: `
# AI辅助性能优化：定位瓶颈

## 引言：性能即用户体验

性能是用户体验的核心组成部分。研究表明，页面加载时间每增加1秒，转化率就会下降7%。对于移动端，53%的用户会放弃加载时间超过3秒的页面。性能优化不是锦上添花，而是产品成功的关键因素。

但性能优化也是最容易走入误区的工作。开发者经常在没有度量数据的情况下盲目优化，或者优化了错误的地方。正如Donald Knuth所说："过早优化是万恶之源。"正确的做法是：度量、定位瓶颈、优化、再度量。

AI在性能优化中扮演着越来越重要的角色。它可以分析性能数据，识别瓶颈，推荐优化方案，甚至自动生成优化代码。本章将带你深入探索如何利用AI进行系统性的性能优化。

## 一、性能优化的方法论

### 1.1 性能优化的黄金法则

\`\`\`
1. 不要猜测——度量！
2. 不要优化没有瓶颈的地方
3. 优化后一定要验证效果
4. 80%的性能问题来自20%的代码
5. 性能优化是迭代过程
\`\`\`

### 1.2 性能指标

**前端性能指标（Core Web Vitals）：**

| 指标 | 含义 | 目标值 |
|------|------|--------|
| LCP（Largest Contentful Paint） | 最大内容绘制 | < 2.5秒 |
| FID（First Input Delay） | 首次输入延迟 | < 100毫秒 |
| CLS（Cumulative Layout Shift） | 累积布局偏移 | < 0.1 |
| TTFB（Time to First Byte） | 首字节时间 | < 800毫秒 |
| FCP（First Contentful Paint） | 首次内容绘制 | < 1.8秒 |

**后端性能指标：**

| 指标 | 含义 | 目标值 |
|------|------|--------|
| 响应时间（P50） | 50%请求的响应时间 | < 200毫秒 |
| 响应时间（P95） | 95%请求的响应时间 | < 500毫秒 |
| 响应时间（P99） | 99%请求的响应时间 | < 1秒 |
| 吞吐量 | 每秒处理的请求数 | 根据需求 |
| 错误率 | 请求失败的比例 | < 0.1% |
| CPU使用率 | CPU使用率 | < 70% |
| 内存使用率 | 内存使用率 | < 80% |

## 二、前端性能优化

### 2.1 资源加载优化

**代码分割（Code Splitting）**

\`\`\`javascript
const HomePage = React.lazy(() => import('./pages/Home'));
const PostPage = React.lazy(() => import('./pages/Post'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:slug" element={<PostPage />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

**图片优化**

\`\`\`html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" loading="lazy" width="1200" height="600">
</picture>
\`\`\`

**字体优化：** 使用font-display: swap防止FOIT，使用woff2格式，预加载关键字体。

### 2.2 渲染性能优化

**避免不必要的重渲染**

\`\`\`javascript
const PostCard = React.memo(function PostCard({ post }) {
  return <div><h2>{post.title}</h2><p>{post.excerpt}</p></div>;
});

function PostList({ posts, filter }) {
  const filteredPosts = useMemo(() => {
    return posts.filter(post => post.title.includes(filter));
  }, [posts, filter]);
  return <div>{filteredPosts.map(post => <PostCard key={post.id} post={post} />)}</div>;
}
\`\`\`

**虚拟列表：** 使用react-window处理大量数据，只渲染可见区域。

### 2.3 网络请求优化

**HTTP版本对比：**

| 版本 | 特性 | 性能提升 |
|------|------|---------|
| HTTP/1.1 | 每个连接一个请求 | 基准 |
| HTTP/2 | 多路复用、头部压缩 | 50-70%提升 |
| HTTP/3 | QUIC协议、0-RTT | 额外15-30%提升 |

**缓存策略：**
- 静态资源（JS/CSS/图片）：public, max-age=31536000, immutable
- HTML页面：public, max-age=0, must-revalidate
- API响应：private, max-age=60
- 用户数据：private, no-cache

**预加载和预连接：**

\`\`\`html
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
<link rel="preload" href="/fonts/myfont.woff2" as="font" crossorigin>
<link rel="prefetch" href="/posts/next-page">
\`\`\`

## 三、后端性能优化

### 3.1 数据库查询优化

**N+1查询优化**

\`\`\`javascript
// 不好：N+1查询
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// 好的：使用include
const posts = await prisma.post.findMany({
  include: { author: true },
});

// 更好的：使用select精确控制
const posts = await prisma.post.findMany({
  select: {
    id: true, title: true,
    author: { select: { id: true, name: true, avatar: true } },
  },
});
\`\`\`

### 3.2 缓存策略

**缓存层级：**

| 层级 | 技术 | 访问延迟 | 适用场景 |
|------|------|---------|---------|
| 应用内存 | Map/Object | 微秒级 | 热点数据 |
| Redis | 内存缓存 | 毫秒级 | 会话、计数 |
| CDN | 边缘缓存 | 10-50ms | 静态资源 |
| 数据库缓存 | PostgreSQL Buffer | 微秒级 | 查询结果 |
| HTTP缓存 | ETag/Last-Modified | 毫秒级 | API响应 |

**Cache-Aside模式：**

\`\`\`javascript
async function getPost(postId) {
  const cached = await redis.get(\`post:\${postId}\`);
  if (cached) return JSON.parse(cached);

  const post = await prisma.post.findUnique({ where: { id: postId }, include: { author: true } });
  if (post) await redis.set(\`post:\${postId}\`, JSON.stringify(post), 'EX', 300);
  return post;
}

async function updatePost(postId, data) {
  const post = await prisma.post.update({ where: { id: postId }, data });
  await redis.del(\`post:\${postId}\`);
  return post;
}
\`\`\`

### 3.3 异步处理

\`\`\`javascript
class OrderService {
  async createOrder(orderData) {
    const order = await prisma.order.create({ data: orderData });
    await messageQueue.publish('order.created', { orderId: order.id, userId: orderData.userId });
    return order;
  }
}

messageQueue.subscribe('order.created', async (event) => {
  await emailService.sendOrderConfirmation(event.userId, event.orderId);
  await inventoryService.deductStock(event.orderId);
});
\`\`\`

## 四、内存泄漏检测

### 4.1 常见内存泄漏场景

**未清理的定时器：**

\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => { fetchLatestData(); }, 5000);
  return () => clearInterval(timer);
}, []);
\`\`\`

**未清理的事件监听器：**

\`\`\`javascript
useEffect(() => {
  const handleScroll = () => { /* ... */ };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
\`\`\`

**闭包引用：** 函数持有大对象的引用，即使不再需要也无法释放。

### 4.2 用AI检测内存泄漏

\`\`\`
提示词：请分析以下React组件是否存在内存泄漏风险。检查：未清理的定时器、事件监听器、订阅、闭包持有大对象引用、useEffect依赖数组是否正确。
\`\`\`

## 五、CDN和边缘计算

### 5.1 CDN缓存策略

| 内容类型 | 缓存时间 | 更新策略 |
|---------|---------|---------|
| 静态资源（JS/CSS） | 1年 | 文件名哈希 |
| 图片 | 1月 | 版本号或哈希 |
| 字体 | 1年 | 文件名哈希 |
| HTML | 不缓存 | 每次验证 |
| API响应 | 根据数据变化频率 | 缓存失效 |

### 5.2 边缘计算场景

| 场景 | 描述 |
|------|------|
| A/B测试 | 在边缘修改请求/响应 |
| 认证 | 在边缘验证JWT Token |
| 地理定位 | 根据用户位置返回不同内容 |
| 图片优化 | 在边缘转换和压缩图片 |
| API聚合 | 在边缘聚合多个API响应 |

## 六、性能监控

### 6.1 前端监控

\`\`\`javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    } else if (entry.entryType === 'first-input') {
      console.log('FID:', entry.processingStart - entry.startTime);
    } else if (entry.entryType === 'layout-shift') {
      console.log('CLS:', entry.value);
    }
  }
});
observer.observe({ type: 'largest-contentful-paint', buffered: true });
observer.observe({ type: 'first-input', buffered: true });
observer.observe({ type: 'layout-shift', buffered: true });
\`\`\`

### 6.2 告警设置

| 指标 | 告警阈值 | 严重程度 |
|------|---------|---------|
| P95响应时间 > 1秒 | 持续5分钟 | 警告 |
| P95响应时间 > 3秒 | 持续1分钟 | 严重 |
| 错误率 > 1% | 持续5分钟 | 警告 |
| 错误率 > 5% | 持续1分钟 | 严重 |
| CPU > 80% | 持续10分钟 | 警告 |
| 内存 > 85% | 持续10分钟 | 警告 |

## 七、性能优化检查清单

**前端优化检查清单：**
- [ ] 启用代码分割和懒加载
- [ ] 优化图片（格式、大小、懒加载）
- [ ] 启用资源压缩（Gzip/Brotli）
- [ ] 配置合理的缓存策略
- [ ] 减少JavaScript包体积
- [ ] 优化关键渲染路径
- [ ] 使用CDN分发静态资源
- [ ] 启用HTTP/2或HTTP/3
- [ ] 优化字体加载
- [ ] 减少第三方脚本

**后端优化检查清单：**
- [ ] 添加数据库索引
- [ ] 优化慢查询
- [ ] 引入缓存（Redis）
- [ ] 使用连接池
- [ ] 异步处理耗时操作
- [ ] 启用Gzip压缩
- [ ] 优化API响应大小
- [ ] 实施速率限制
- [ ] 配置负载均衡
- [ ] 监控性能指标

## 八、常见性能错误

### 8.1 错误一：盲目优化

在没有度量数据的情况下进行优化，可能优化了不重要的地方。

### 8.2 错误二：过度缓存

缓存了太多数据，导致内存不足或缓存失效风暴。

### 8.3 错误三：忽略数据库查询

前端性能好但后端慢，通常是因为数据库查询没有优化。

### 8.4 错误四：不监控生产环境

只在开发环境测试性能，生产环境可能有不同的瓶颈。

### 8.5 错误五：一次性优化

性能优化是持续的过程，不是一次性的工作。

## 总结

性能优化是一门科学，也是一门艺术。它需要度量的数据、系统的分析、以及持续的迭代。AI可以帮助你加速这个过程，但你需要理解性能优化的基本原理。

关键要点：
1. 先度量，再优化
2. 找到真正的瓶颈，而不是猜测
3. 前端、后端、数据库都要优化
4. 使用缓存但不要过度
5. 建立性能监控和告警
6. 性能优化是持续的过程
7. 用户体验是第一位的

记住：最快的代码是不需要执行的代码。最好的优化是删除不必要的代码。
    `,
    code: `
// =============================================================
// 性能分析器模拟器
// 根据系统指标，识别潜在瓶颈并提供优化建议
// =============================================================

class PerformanceAnalyzer {
  constructor() {
    this.thresholds = {
      lcp: { good: 2500, warning: 4000, critical: 6000 },
      fid: { good: 100, warning: 300, critical: 500 },
      cls: { good: 0.1, warning: 0.25, critical: 0.5 },
      ttfb: { good: 800, warning: 1800, critical: 3000 },
      apiP50: { good: 200, warning: 500, critical: 1000 },
      apiP95: { good: 500, warning: 1000, critical: 2000 },
      apiP99: { good: 1000, warning: 3000, critical: 5000 },
      cpuUsage: { good: 60, warning: 80, critical: 95 },
      memoryUsage: { good: 70, warning: 85, critical: 95 },
      errorRate: { good: 0.5, warning: 2, critical: 5 },
    };

    this.bottleneckPatterns = [
      {
        name: '大图片未优化',
        condition: (metrics) => metrics.lcp > 3000 && metrics.hasImages,
        suggestions: [
          '使用WebP/AVIF格式替代JPEG/PNG',
          '为图片添加loading="lazy"属性',
          '使用响应式图片（srcset）',
          '实现图片CDN和自动压缩',
        ],
        severity: 'HIGH',
      },
      {
        name: 'JavaScript包体积过大',
        condition: (metrics) => metrics.bundleSize > 500,
        suggestions: [
          '实施代码分割（Code Splitting）',
          '使用Tree Shaking移除未使用代码',
          '动态导入非关键模块',
          '分析并移除大依赖包',
        ],
        severity: 'HIGH',
      },
      {
        name: '缺少数据库索引',
        condition: (metrics) => metrics.dbSlowQueries > 0 && metrics.apiP95 > 500,
        suggestions: [
          '为WHERE条件中频繁使用的列创建索引',
          '为JOIN关联列创建索引',
          '为ORDER BY列创建索引',
          '使用EXPLAIN ANALYZE分析慢查询',
        ],
        severity: 'HIGH',
      },
      {
        name: 'N+1查询问题',
        condition: (metrics) => metrics.dbQueryCount > 100 && metrics.apiP95 > 300,
        suggestions: [
          '使用JOIN替代多次单独查询',
          '使用Prisma的include或select',
          '使用DataLoader批量查询',
          '检查ORM生成的SQL是否包含循环查询',
        ],
        severity: 'MEDIUM',
      },
      {
        name: '缺少缓存层',
        condition: (metrics) => metrics.apiP95 > 200 && !metrics.hasCache,
        suggestions: [
          '为热点数据添加Redis缓存',
          '实现HTTP缓存头（ETag/Cache-Control）',
          '使用CDN缓存静态资源',
          '考虑应用层内存缓存',
        ],
        severity: 'MEDIUM',
      },
      {
        name: '未优化的渲染',
        condition: (metrics) => metrics.fid > 100 || metrics.cls > 0.1,
        suggestions: [
          '使用React.memo避免不必要的重渲染',
          '使用useMemo和useCallback优化计算',
          '实现虚拟列表处理大量数据',
          '使用CSS contain属性隔离布局',
        ],
        severity: 'MEDIUM',
      },
      {
        name: '首字节时间过长',
        condition: (metrics) => metrics.ttfb > 1000,
        suggestions: [
          '检查服务器端处理逻辑',
          '优化数据库查询速度',
          '使用CDN减少网络延迟',
          '考虑SSR/SSG预渲染',
        ],
        severity: 'HIGH',
      },
      {
        name: '内存泄漏风险',
        condition: (metrics) => metrics.memoryUsage > 80 && metrics.memoryTrend === 'increasing',
        suggestions: [
          '检查未清理的定时器和事件监听器',
          '检查闭包是否持有大对象引用',
          '使用Chrome DevTools堆快照分析',
          '检查第三方库是否存在已知内存泄漏',
        ],
        severity: 'CRITICAL',
      },
      {
        name: '高CPU使用率',
        condition: (metrics) => metrics.cpuUsage > 80,
        suggestions: [
          '检查是否有死循环或递归',
          '减少不必要的计算',
          '使用Web Worker处理CPU密集型任务',
          '考虑水平扩展',
        ],
        severity: 'HIGH',
      },
      {
        name: '高错误率',
        condition: (metrics) => metrics.errorRate > 2,
        suggestions: [
          '检查错误日志，定位高频错误',
          '添加更完善的错误处理',
          '实施断路器模式',
          '检查第三方服务可用性',
        ],
        severity: 'CRITICAL',
      },
      {
        name: '过多的第三方脚本',
        condition: (metrics) => metrics.thirdPartyScripts > 5,
        suggestions: [
          '延迟加载非关键第三方脚本',
          '使用异步加载（async/defer）',
          '评估并移除不必要的第三方脚本',
          '自托管关键脚本',
        ],
        severity: 'LOW',
      },
      {
        name: '未压缩的资源',
        condition: (metrics) => !metrics.hasCompression && metrics.bundleSize > 200,
        suggestions: [
          '启用Gzip或Brotli压缩',
          '压缩HTML、CSS和JavaScript',
          '配置Nginx/Apache的压缩设置',
        ],
        severity: 'MEDIUM',
      },
    ];
  }

  evaluateMetric(value, metricKey) {
    const threshold = this.thresholds[metricKey];
    if (!threshold) return { level: 'unknown', label: '未知' };
    if (value <= threshold.good) return { level: 'good', label: '✅ 良好' };
    else if (value <= threshold.warning) return { level: 'warning', label: '⚠️  警告' };
    else return { level: 'critical', label: '🔴 严重' };
  }

  identifyBottlenecks(metrics) {
    const bottlenecks = [];
    for (const pattern of this.bottleneckPatterns) {
      if (pattern.condition(metrics)) {
        bottlenecks.push({
          name: pattern.name,
          severity: pattern.severity,
          suggestions: pattern.suggestions,
        });
      }
    }
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    bottlenecks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return bottlenecks;
  }

  analyze(metrics) {
    console.log('========================================');
    console.log('  ⚡ 性能分析器');
    console.log('========================================\\n');

    const frontendMetrics = [
      { key: 'lcp', label: 'LCP (最大内容绘制)', unit: 'ms' },
      { key: 'fid', label: 'FID (首次输入延迟)', unit: 'ms' },
      { key: 'cls', label: 'CLS (累积布局偏移)', unit: '' },
      { key: 'ttfb', label: 'TTFB (首字节时间)', unit: 'ms' },
    ];

    const backendMetrics = [
      { key: 'apiP50', label: 'API P50 响应时间', unit: 'ms' },
      { key: 'apiP95', label: 'API P95 响应时间', unit: 'ms' },
      { key: 'apiP99', label: 'API P99 响应时间', unit: 'ms' },
      { key: 'cpuUsage', label: 'CPU 使用率', unit: '%' },
      { key: 'memoryUsage', label: '内存使用率', unit: '%' },
      { key: 'errorRate', label: '错误率', unit: '%' },
    ];

    console.log('📊 前端性能指标：');
    for (const m of frontendMetrics) {
      const value = metrics[m.key];
      const target = this.thresholds[m.key].good;
      const evaluation = this.evaluateMetric(value, m.key);
      console.log(\`  \${m.label}: \${value}\${m.unit} (目标: <\${target}\${m.unit}) \${evaluation.label}\`);
    }
    console.log('');

    console.log('📊 后端性能指标：');
    for (const m of backendMetrics) {
      const value = metrics[m.key];
      const target = this.thresholds[m.key].good;
      const evaluation = this.evaluateMetric(value, m.key);
      console.log(\`  \${m.label}: \${value}\${m.unit} (目标: <\${target}\${m.unit}) \${evaluation.label}\`);
    }
    console.log('');

    if (metrics.dbSlowQueries !== undefined) {
      console.log('📊 数据库指标：');
      console.log(\`  慢查询数量：\${metrics.dbSlowQueries}\`);
      console.log(\`  查询总数：\${metrics.dbQueryCount || 'N/A'}\`);
      console.log('');
    }

    if (metrics.bundleSize !== undefined) {
      console.log('📊 资源指标：');
      console.log(\`  JS包体积：\${metrics.bundleSize}KB\`);
      console.log(\`  第三方脚本：\${metrics.thirdPartyScripts || 0} 个\`);
      console.log(\`  压缩已启用：\${metrics.hasCompression ? '是' : '否'}\`);
      console.log(\`  缓存已启用：\${metrics.hasCache ? '是' : '否'}\`);
      console.log('');
    }

    console.log('========================================');
    console.log('  🔍 瓶颈分析');
    console.log('========================================\\n');

    const bottlenecks = this.identifyBottlenecks(metrics);

    if (bottlenecks.length === 0) {
      console.log('✅ 未发现明显的性能瓶颈！系统运行良好。');
    } else {
      const severityIcons = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' };
      for (const bottleneck of bottlenecks) {
        console.log(\`\${severityIcons[bottleneck.severity] || '⚪'} [\${bottleneck.severity}] \${bottleneck.name}\`);
        console.log('   建议：');
        for (const suggestion of bottleneck.suggestions) {
          console.log(\`   - \${suggestion}\`);
        }
        console.log('');
      }
    }

    const score = this.calculateOverallScore(metrics);
    const scoreBar = '█'.repeat(score / 5) + '░'.repeat(20 - score / 5);

    console.log('========================================');
    console.log('  📊 整体评分');
    console.log('========================================\\n');
    console.log(\`  性能得分：\${score}/100\`);
    console.log(\`  [\${scoreBar}]\`);
    console.log('');

    if (score >= 90) {
      console.log('  🏆 优秀！系统性能表现良好，继续保持。');
    } else if (score >= 70) {
      console.log('  👍 良好！有改进空间，按计划逐步优化。');
    } else if (score >= 50) {
      console.log('  ⚠️  需要关注！存在较明显的性能问题。');
    } else {
      console.log('  🔴 紧急！性能严重不足，需要立即采取行动。');
    }

    return { bottlenecks, score };
  }

  calculateOverallScore(metrics) {
    let score = 100;
    const penalties = [
      { key: 'lcp', threshold: this.thresholds.lcp.good, penalty: 10 },
      { key: 'fid', threshold: this.thresholds.fid.good, penalty: 5 },
      { key: 'cls', threshold: this.thresholds.cls.good, penalty: 5 },
      { key: 'ttfb', threshold: this.thresholds.ttfb.good, penalty: 10 },
      { key: 'apiP95', threshold: this.thresholds.apiP95.good, penalty: 15 },
      { key: 'apiP99', threshold: this.thresholds.apiP99.good, penalty: 10 },
      { key: 'cpuUsage', threshold: this.thresholds.cpuUsage.good, penalty: 10 },
      { key: 'memoryUsage', threshold: this.thresholds.memoryUsage.good, penalty: 10 },
      { key: 'errorRate', threshold: this.thresholds.errorRate.good, penalty: 15 },
    ];
    for (const penalty of penalties) {
      if (metrics[penalty.key] !== undefined) {
        const ratio = metrics[penalty.key] / penalty.threshold;
        if (ratio > 1) {
          score -= Math.min(penalty.penalty, Math.floor((ratio - 1) * penalty.penalty * 2));
        }
      }
    }
    if (metrics.dbSlowQueries > 5) score -= 10;
    if (metrics.dbSlowQueries > 20) score -= 10;
    if (metrics.bundleSize > 500) score -= 5;
    if (metrics.bundleSize > 1000) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  generateScenario(scenario) {
    const scenarios = {
      'good': {
        lcp: 1800, fid: 50, cls: 0.05, ttfb: 500,
        apiP50: 100, apiP95: 250, apiP99: 500,
        cpuUsage: 40, memoryUsage: 55, errorRate: 0.1,
        dbSlowQueries: 0, dbQueryCount: 10,
        bundleSize: 200, thirdPartyScripts: 2,
        hasCompression: true, hasCache: true, hasImages: true,
        memoryTrend: 'stable',
      },
      'medium': {
        lcp: 3500, fid: 150, cls: 0.15, ttfb: 1200,
        apiP50: 250, apiP95: 800, apiP99: 2000,
        cpuUsage: 65, memoryUsage: 72, errorRate: 0.8,
        dbSlowQueries: 8, dbQueryCount: 150,
        bundleSize: 600, thirdPartyScripts: 6,
        hasCompression: true, hasCache: false, hasImages: true,
        memoryTrend: 'stable',
      },
      'bad': {
        lcp: 5500, fid: 350, cls: 0.35, ttfb: 2500,
        apiP50: 500, apiP95: 2000, apiP99: 4500,
        cpuUsage: 88, memoryUsage: 90, errorRate: 3.5,
        dbSlowQueries: 25, dbQueryCount: 500,
        bundleSize: 1200, thirdPartyScripts: 10,
        hasCompression: false, hasCache: false, hasImages: true,
        memoryTrend: 'increasing',
      },
    };
    return scenarios[scenario] || scenarios.medium;
  }
}

// =============================================================
// 演示运行
// =============================================================

const analyzer = new PerformanceAnalyzer();

console.log('\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  ⚡ 案例一：性能良好的应用                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

analyzer.analyze(analyzer.generateScenario('good'));

console.log('\\n\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  ⚡ 案例二：性能一般的应用                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

analyzer.analyze(analyzer.generateScenario('medium'));

console.log('\\n\\n');
console.log('╔══════════════════════════════════════════╗');
console.log('║  ⚡ 案例三：性能糟糕的应用                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log('\\n');

analyzer.analyze(analyzer.generateScenario('bad'));

console.log('\\n\\n✅ 性能分析完成！');
console.log('💡 提示：性能优化是一个持续的过程，建议定期进行性能分析。');
    `,
  },
];