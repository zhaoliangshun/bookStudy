// =============================================================
// FastAPI 全栈实战 - 第 6 批章节（Next.js 前端集成 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ff-next-setup:    Next.js 项目结构与初始化
//   ff-api-client:    API 客户端封装（fetch + 拦截器）
//   ff-auth-frontend: 认证页面（登录、注册、Token 管理）
//   ff-kanban-ui:     看板 UI（拖拽、列、卡片）
//   ff-realtime:      实时同步（WebSocket 集成）
//
// 注意：本批代码以 TypeScript/TSX 为主，运行环境是浏览器/Node.js，
//       无法通过 /api/run-py 直接运行。代码以教学展示为主。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 28 章：Next.js 项目结构与初始化
  // ============================================================
  {
    id: "ff-next-setup",
    group: "Next.js 前端集成",
    icon: "⚛️",
    title: "Next.js 项目结构与初始化",
    content: `# Next.js 项目结构与初始化

## 一、为什么选 Next.js

### 1.1 Next.js vs Create React App

| 维度 | Create React App (CRA) | Next.js |
|------|------------------------|---------|
| 渲染方式 | 纯客户端渲染 (CSR) | SSR + SSG + CSR 都支持 |
| SEO | 差（首屏空白） | 好（服务端渲染 HTML） |
| 首屏速度 | 慢（要等 JS 加载） | 快（HTML 直出） |
| 路由 | react-router | 文件系统路由（App Router） |
| API 路由 | 无 | 内置 API Routes |
| 部署 | 静态服务器 | Vercel / 自建 Node |

**我们选 Next.js 的核心理由**：

1. **App Router 文件路由**：不用写 \`<Route>\`，建文件夹就是建路由
2. **Server Components**：组件可以在服务端渲染，减少客户端 JS 体积
3. **API Routes**：前端项目里可以放 BFF（Backend for Frontend）层
4. **生态成熟**：Vercel 出品，文档完善，社区活跃

### 1.2 项目目标

我们要做一个看板应用的前端：

- 登录/注册页
- 看板列表页
- 看板详情页（拖拽卡片、跨列移动）
- 实时多人协作（WebSocket）
- 个人设置页

## 二、项目初始化

### 2.1 创建项目

\`\`\`bash
# 用 create-next-app 脚手架创建项目
# --typescript 使用 TypeScript
# --app 使用 App Router
# --tailwind 使用 Tailwind CSS
# --no-src-dir 不用 src 目录（文件直接在根目录）
npx create-next-app@latest taskboard-frontend

# 进入项目目录
cd taskboard-frontend

# 启动开发服务器
npm run dev
# 默认地址: http://localhost:3000
\`\`\`

### 2.2 安装额外依赖

\`\`\`bash
# 拖拽库：用于看板卡片拖拽
npm install @dnd-kit/core @dnd-kit/sortable

# 状态管理：用于全局状态（用户信息、看板数据）
npm install zustand

# 表单库：用于登录/注册表单
npm install react-hook-form

# HTTP 客户端：虽然有 fetch，但 axios 拦截器更方便
# 这里我们用原生 fetch 演示，不用 axios
# npm install axios

# 日期处理：用于显示卡片创建时间
npm install date-fns

# 图标库
npm install lucide-react
\`\`\`

## 三、目录结构设计

\`\`\`txt
taskboard-frontend/
├── app/                        # App Router 路由目录
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页（重定向到 /login 或 /boards）
│   ├── globals.css             # 全局样式
│   ├── (auth)/                 # 路由组：认证相关页面（共享布局）
│   │   ├── layout.tsx          # 认证页布局（居中卡片样式）
│   │   ├── login/page.tsx      # 登录页
│   │   └── register/page.tsx   # 注册页
│   ├── boards/                 # 看板相关页面
│   │   ├── page.tsx            # 看板列表页
│   │   └── [boardId]/          # 看板详情页（动态路由）
│   │       └── page.tsx
│   └── settings/               # 设置页
│       └── page.tsx
├── components/                 # 通用组件
│   ├── ui/                     # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── kanban/                 # 看板专用组件
│   │   ├── Board.tsx           # 看板容器
│   │   ├── Column.tsx          # 列
│   │   ├── Card.tsx            # 卡片
│   │   └── CardModal.tsx       # 卡片编辑弹窗
│   └── layout/                 # 布局组件
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/                        # 工具库
│   ├── api.ts                  # API 客户端
│   ├── auth.ts                 # 认证工具
│   └── utils.ts                # 通用工具
├── stores/                     # 状态管理
│   ├── auth-store.ts           # 用户认证状态
│   └── board-store.ts          # 看板状态
├── types/                      # TypeScript 类型
│   └── index.ts
├── hooks/                      # 自定义 Hooks
│   ├── useAuth.ts
│   └── useWebSocket.ts
├── public/                     # 静态资源
├── next.config.js              # Next.js 配置
├── tailwind.config.ts          # Tailwind 配置
├── tsconfig.json               # TypeScript 配置
└── package.json
\`\`\`

### 3.1 目录设计原则

| 原则 | 说明 |
|------|------|
| 按功能分组 | components/kanban 放看板组件，components/ui 放基础组件 |
| 路由组 | \`(auth)\` 括号包起来表示路由组，不影响 URL 但共享布局 |
| 关注点分离 | 组件、工具、状态、类型各有专门目录 |
| 路径别名 | 用 \`@/components\` 代替 \`../../components\` |

## 四、配置路径别名

修改 \`tsconfig.json\`，添加 \`@/*\` 别名：

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
\`\`\`

这样在代码里就能写：

\`\`\`typescript
// 以前：要算相对层级
import { Button } from "../../../components/ui/Button";

// 现在：用 @ 别名，永远从根目录开始
import { Button } from "@/components/ui/Button";
\`\`\`

## 五、Demo 1：根布局 layout.tsx

\`\`\`tsx
// app/layout.tsx
// 根布局：所有页面共享的外层结构
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 用 Google Fonts 的 Inter 字体
const inter = Inter({ subsets: ["latin"] });

// 网页元数据（SEO 用）
export const metadata: Metadata = {
  title: "TaskBoard - 任务看板",
  description: "FastAPI + Next.js 全栈实战项目",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
\`\`\`

### 5.1 关键点

- \`layout.tsx\` 是**服务端组件**（默认），不会被打包到客户端 JS
- \`metadata\` 用于 SEO，Next.js 会自动生成 \`<title>\` 和 \`<meta>\` 标签
- \`children\` 是子页面/子布局的内容
- 一个应用可以有**多层布局**（根布局 → 路由组布局 → 页面）

## 六、Demo 2：首页（重定向）

\`\`\`tsx
// app/page.tsx
// 首页：根据登录状态重定向
import { redirect } from "next/navigation";

export default function Home() {
  // 服务端组件里直接重定向
  // 客户端组件用 useRouter().push()
  redirect("/boards");
}
\`\`\`

\`\`\`tsx
// app/(auth)/layout.tsx
// 认证页布局：居中显示一个卡片
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        {children}
      </div>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// app/(auth)/login/page.tsx
// 登录页（占位，下一章详细实现）
"use client";  // 客户端组件（用了 hooks 和事件）

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 下一章实现登录逻辑
    console.log("登录:", username, password);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          登录
        </button>
      </form>
    </div>
  );
}
\`\`\`

## 七、Demo 3：看板列表页（占位）

\`\`\`tsx
// app/boards/page.tsx
// 看板列表页
"use client";

import Link from "next/link";

export default function BoardsPage() {
  // 模拟数据，后面会从 API 拉取
  const boards = [
    { id: 1, title: "工作看板" },
    { id: 2, title: "学习计划" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">我的看板</h1>
      <div className="grid grid-cols-3 gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={\`/boards/\${board.id}\`}
            className="p-4 border rounded hover:shadow transition"
          >
            <h2 className="font-medium">{board.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
\`\`\`

## 八、Demo 4：环境变量配置

新建 \`.env.local\` 文件：

\`\`\`bash
# .env.local（不会被 git 提交）
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket 地址
NEXT_PUBLIC_WS_URL=ws://localhost:8000
\`\`\`

\`\`\`typescript
// lib/config.ts
// 读取环境变量
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000",
};
\`\`\`

### 8.1 NEXT_PUBLIC_ 前缀的作用

- **带前缀**：客户端 JS 能访问（通过 \`process.env.NEXT_PUBLIC_xxx\`）
- **不带前缀**：只能在服务端组件 / API Routes 访问（客户端拿不到）

API 地址要给客户端 fetch 用，所以必须带 \`NEXT_PUBLIC_\`。

## 九、Demo 5：next.config.js 配置

\`\`\`javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开发时反代 API 请求（可选，避免跨域）
  // 把 /api/* 的请求转发到 FastAPI
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
\`\`\`

### 9.1 rewrites 反代的好处

配置反代后，前端代码可以写：

\`\`\`typescript
// 不用反代：要写完整地址，还要配 CORS
fetch("http://localhost:8000/users");

// 用反代：写相对路径，浏览器认为是同源
fetch("/api/users");
\`\`\`

**好处**：

- 不用配置 CORS（同源请求）
- 切换环境只改 \`next.config.js\`，前端代码不变
- 生产环境可以反代到内网地址（不暴露后端）

## 十、Demo 6：TypeScript 类型定义

\`\`\`typescript
// types/index.ts
// 全局共享的 TypeScript 类型

// 用户
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

// 看板
export interface Board {
  id: number;
  title: string;
  description: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

// 列
export interface Column {
  id: number;
  board_id: number;
  title: string;
  position: number;
  wip_limit: number | null;
  cards: Card[];  // 列表查询时带卡片
}

// 卡片
export interface Card {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  priority: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// 登录响应
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// 分页响应
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 统一错误响应
export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path: string;
}
\`\`\`

## 十一、本章小结

| 概念 | 一句话 |
|------|-------|
| Next.js App Router | 文件系统路由，建文件夹就是建路由 |
| 路由组 | \`(group)\` 不影响 URL，但能共享布局 |
| 服务端组件 | 默认，不打包到客户端，SEO 友好 |
| 客户端组件 | \`"use client"\` 声明，能用 hooks 和事件 |
| 路径别名 | \`@/*\` 代替 \`../../\` |
| 环境变量 | \`NEXT_PUBLIC_\` 前缀让客户端可见 |
| rewrites 反代 | 避免 CORS，前端写相对路径 |
| TypeScript 类型 | 集中定义在 \`types/\` 目录 |

下一章我们封装 API 客户端——前端调后端的统一入口。`
  },

  // ============================================================
  // 第 29 章：API 客户端封装
  // ============================================================
  {
    id: "ff-api-client",
    group: "Next.js 前端集成",
    icon: "🌐",
    title: "API 客户端封装",
    content: `# API 客户端封装

## 一、为什么不直接用 fetch

### 1.1 裸用 fetch 的问题

\`\`\`typescript
// 裸用 fetch：每次请求都要写一堆重复代码
const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/users", {
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${token}\`,  // 每次都要手动加
  },
});

if (response.status === 401) {
  // token 过期，每次都要处理
  localStorage.removeItem("token");
  window.location.href = "/login";
  return;
}

if (!response.ok) {
  const error = await response.json();
  // 错误处理重复
  throw new Error(error.message);
}

const data = await response.json();
\`\`\`

问题：

| 问题 | 说明 |
|------|------|
| 重复 | 每个请求都要写 token、错误处理、JSON 解析 |
| 难维护 | 改 API 地址要全局搜索替换 |
| 无类型 | 返回 any，没有 TypeScript 提示 |
| 无拦截 | 不能在请求前/响应后统一处理 |

### 1.2 封装的好处

\`\`\`typescript
// 封装后：一行调用
const users = await api.get<User[]>("/users");
// 自动带 token、自动错误处理、自动类型推断
\`\`\`

## 二、API 客户端设计

### 2.1 核心功能

| 功能 | 说明 |
|------|------|
| baseURL | 统一配置后端地址 |
| 请求拦截 | 自动加 Authorization header |
| 响应拦截 | 401 自动跳登录、错误统一处理 |
| 类型安全 | 泛型支持返回类型 |
| 超时 | 防止请求卡死 |
| 重试 | 网络错误自动重试（可选） |

### 2.2 架构

\`\`\`
前端组件
   │
   ▼
api.get<T>(url)  ←─── 类型推断
   │
   ▼
request(method, url, data)
   │
   ├── 请求拦截：加 token
   │
   ▼
fetch(baseURL + url, options)
   │
   ▼
response
   │
   ├── 响应拦截：401 跳登录、错误抛异常
   │
   ▼
返回 data（类型为 T）
\`\`\`

## 三、Demo 1：基础 API 客户端

\`\`\`typescript
// lib/api.ts
// API 客户端：封装 fetch，统一处理 token、错误、类型

// 后端地址（从环境变量读）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Token 管理（下一章详细实现，这里先简化）
function getToken(): string | null {
  if (typeof window === "undefined") return null;  // SSR 时没有 localStorage
  return localStorage.getItem("access_token");
}

function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
}

// 自定义错误类
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public detail?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 核心请求函数
async function request<T>(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  // 1. 构造完整 URL
  const fullUrl = url.startsWith("http") ? url : \`\${API_BASE_URL}\${url}\`;

  // 2. 构造请求配置
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // 3. 自动加 token
  const token = getToken();
  if (token) {
    headers["Authorization"] = \`Bearer \${token}\`;
  }

  // 4. 发起请求
  const response = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  // 5. 处理响应
  if (response.status === 401) {
    // token 失效，清除并跳登录
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "UNAUTHORIZED", "登录已过期，请重新登录");
  }

  if (response.status === 204) {
    // No Content，没有响应体
    return undefined as T;
  }

  // 解析 JSON
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 错误响应
    throw new ApiError(
      response.status,
      result.code || "UNKNOWN",
      result.message || "请求失败",
      result
    );
  }

  return result as T;
}

// 导出便捷方法
export const api = {
  get: <T>(url: string, options?: RequestInit) =>
    request<T>("GET", url, undefined, options),

  post: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>("POST", url, data, options),

  put: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>("PUT", url, data, options),

  patch: <T>(url: string, data?: any, options?: RequestInit) =>
    request<T>("PATCH", url, data, options),

  delete: <T>(url: string, options?: RequestInit) =>
    request<T>("DELETE", url, undefined, options),
};
\`\`\`

### 3.1 关键设计点

**1. 泛型 \`<T>\` 让返回值有类型**：

\`\`\`typescript
// 调用时指定返回类型
const user = await api.get<User>("/users/1");
// user 的类型是 User，IDE 有自动补全
console.log(user.username);  // ✓ 有提示
console.log(user.foo);        // ✗ 类型错误
\`\`\`

**2. SSR 安全**：

\`\`\`typescript
// 检查 typeof window，避免服务端组件调用时报错
function getToken(): string | null {
  if (typeof window === "undefined") return null;  // SSR 时返回 null
  return localStorage.getItem("access_token");
}
\`\`\`

Next.js 的服务端组件也会执行代码，但服务端没有 \`localStorage\`，必须检查。

**3. 401 自动跳转**：

\`\`\`typescript
if (response.status === 401) {
  clearToken();
  window.location.href = "/login";
}
\`\`\`

token 过期不用每个页面单独处理，统一在 API 客户端里跳转。

## 四、Demo 2：业务 API 模块

把不同业务的 API 调用分文件组织，方便管理。

\`\`\`typescript
// lib/api/auth.ts
// 认证相关 API
import { api } from "./api";
import type { User, LoginResponse } from "@/types";

export const authApi = {
  // 登录
  login: (username: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { username, password }),

  // 注册
  register: (username: string, email: string, password: string) =>
    api.post<User>("/auth/register", { username, email, password }),

  // 获取当前用户信息
  getMe: () =>
    api.get<User>("/auth/me"),
};
\`\`\`

\`\`\`typescript
// lib/api/boards.ts
// 看板相关 API
import { api } from "./api";
import type { Board, PageResponse } from "@/types";

export const boardApi = {
  // 获取看板列表
  list: (page = 1, pageSize = 20) =>
    api.get<PageResponse<Board>>(\`/boards?page=\${page}&page_size=\${pageSize}\`),

  // 获取单个看板详情
  get: (id: number) =>
    api.get<Board>(\`/boards/\${id}\`),

  // 创建看板
  create: (title: string, description?: string) =>
    api.post<Board>("/boards", { title, description }),

  // 更新看板
  update: (id: number, data: Partial<Pick<Board, "title" | "description">>) =>
    api.patch<Board>(\`/boards/\${id}\`, data),

  // 删除看板
  delete: (id: number) =>
    api.delete<void>(\`/boards/\${id}\`),
};
\`\`\`

\`\`\`typescript
// lib/api/cards.ts
// 卡片相关 API
import { api } from "./api";
import type { Card } from "@/types";

export const cardApi = {
  // 创建卡片
  create: (data: {
    column_id: number;
    title: string;
    description?: string;
    priority?: number;
  }) => api.post<Card>("/cards", data),

  // 更新卡片
  update: (id: number, data: Partial<{
    title: string;
    description: string;
    priority: number;
  }>) => api.patch<Card>(\`/cards/\${id}\`, data),

  // 移动卡片（跨列）
  move: (cardId: number, toColumnId: number, position: number) =>
    api.patch<{ ok: boolean }>(\`/cards/\${cardId}/move\`, {
      to_column_id: toColumnId,
      position,
    }),

  // 删除卡片
  delete: (id: number) =>
    api.delete<void>(\`/cards/\${id}\`),
};
\`\`\`

\`\`\`typescript
// lib/api/index.ts
// 统一导出
export { api, ApiError } from "./api";
export { authApi } from "./auth";
export { boardApi } from "./boards";
export { cardApi } from "./cards";
\`\`\`

## 五、Demo 3：组件里使用 API

\`\`\`tsx
// app/boards/page.tsx
// 看板列表页：拉取看板列表
"use client";

import { useEffect, useState } from "react";
import { boardApi } from "@/lib/api";
import type { Board } from "@/types";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 异步函数放在 useEffect 里
    const loadBoards = async () => {
      try {
        setLoading(true);
        const data = await boardApi.list();
        setBoards(data.items);
      } catch (err: any) {
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);  // 空数组表示只在挂载时执行一次

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">我的看板</h1>
      <div className="grid grid-cols-3 gap-4">
        {boards.map((board) => (
          <div key={board.id} className="p-4 border rounded">
            <h2 className="font-medium">{board.title}</h2>
            {board.description && (
              <p className="text-sm text-gray-500 mt-1">{board.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### 5.1 加载状态处理

实际项目里要处理三种状态：

\`\`\`tsx
const [loading, setLoading] = useState(true);   // 加载中
const [error, setError] = useState(null);       // 错误
const [data, setData] = useState(null);         // 数据

if (loading) return <Loading />;     // 显示 loading
if (error) return <ErrorView />;     // 显示错误
return <DataView data={data} />;     // 显示数据
\`\`\`

## 六、Demo 4：自定义 Hook 封装请求

把"加载-错误-数据"的三态逻辑封装成 Hook，避免每个组件都写一遍。

\`\`\`typescript
// hooks/useApi.ts
// 通用的 API 请求 Hook
import { useState, useEffect, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
\`\`\`

使用：

\`\`\`tsx
// 组件里用 Hook，代码简洁很多
import { useApi } from "@/hooks/useApi";
import { boardApi } from "@/lib/api";

export default function BoardsPage() {
  const { data: boards, loading, error, refetch } = useApi(
    () => boardApi.list(),
    []
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>刷新</button>
      {boards?.items.map((board) => (
        <div key={board.id}>{board.title}</div>
      ))}
    </div>
  );
}
\`\`\`

## 七、Demo 5：文件上传 API

文件上传不能直接 \`JSON.stringify\`，要用 \`FormData\`。

\`\`\`typescript
// lib/api/upload.ts
// 文件上传专用
import { api } from "./api";

export const uploadApi = {
  // 上传头像
  uploadAvatar: (userId: number, file: File) => {
    // FormData 不能 JSON.stringify，要单独处理
    const formData = new FormData();
    formData.append("file", file);

    // 注意：FormData 请求不要手动设 Content-Type
    // 浏览器会自动设为 multipart/form-data; boundary=...
    return fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/users/\${userId}/avatar\`, {
      method: "POST",
      headers: {
        // 不要设 Content-Type！让浏览器自动设
        Authorization: \`Bearer \${localStorage.getItem("access_token")}\`,
      },
      body: formData,
    }).then((r) => r.json());
  },
};
\`\`\`

\`\`\`tsx
// 组件里使用
"use client";

import { uploadApi } from "@/lib/api/upload";

export function AvatarUpload({ userId }: { userId: number }) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    // 校验文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert("文件不能超过 5MB");
      return;
    }

    try {
      const result = await uploadApi.uploadAvatar(userId, file);
      alert("上传成功");
      console.log(result);
    } catch (err) {
      alert("上传失败");
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
    />
  );
}
\`\`\`

### 7.1 FormData 的坑

\`\`\`typescript
// ❌ 错误：手动设 Content-Type
const formData = new FormData();
formData.append("file", file);

fetch(url, {
  headers: {
    "Content-Type": "multipart/form-data",  // ❌ 错！
  },
  body: formData,
});

// 问题：浏览器需要自动加 boundary 参数
// 手动设会覆盖，导致后端无法解析边界
\`\`\`

\`\`\`typescript
// ✅ 正确：不设 Content-Type，让浏览器自动加
fetch(url, {
  headers: {
    // 只设 Authorization，不设 Content-Type
    Authorization: \`Bearer \${token}\`,
  },
  body: formData,
  // 浏览器会自动设 Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
});
\`\`\`

## 八、Demo 6：错误处理统一化

\`\`\`tsx
// components/ErrorBoundary.tsx
// 错误边界组件
"use client";

import { Component, ReactNode } from "react";
import { ApiError } from "@/lib/api";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      // 根据错误类型显示不同 UI
      if (this.state.error instanceof ApiError) {
        return (
          <div className="p-4 bg-red-50 text-red-700 rounded">
            <h2>请求错误</h2>
            <p>状态码: {this.state.error.status}</p>
            <p>错误码: {this.state.error.code}</p>
            <p>消息: {this.state.error.message}</p>
          </div>
        );
      }

      return (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          <h2>出错了</h2>
          <p>{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| API 客户端 | 封装 fetch，统一处理 token、错误、类型 |
| 泛型 \`<T>\` | 让返回值有 TypeScript 类型 |
| 请求拦截 | 自动加 Authorization header |
| 响应拦截 | 401 跳登录、错误抛异常 |
| SSR 安全 | 检查 \`typeof window\` |
| 业务分模块 | auth/boards/cards 各一个文件 |
| 自定义 Hook | 封装"加载-错误-数据"三态 |
| FormData | 文件上传，不要手动设 Content-Type |
| ErrorBoundary | 捕获组件错误，显示友好 UI |

下一章我们做登录注册页面，把认证流程跑通。`
  },

  // ============================================================
  // 第 30 章：认证页面
  // ============================================================
  {
    id: "ff-auth-frontend",
    group: "Next.js 前端集成",
    icon: "🔐",
    title: "认证页面（登录、注册、Token 管理）",
    content: `# 认证页面（登录、注册、Token 管理）

## 一、前端认证流程

### 1.1 完整流程

\`\`\`
1. 用户填表单（用户名 + 密码）
2. 前端 POST /auth/login
3. 后端验证，返回 access_token
4. 前端把 token 存到 localStorage / cookie
5. 后续请求自动带 Authorization: Bearer <token>
6. token 过期 → 后端返 401 → 前端清 token + 跳登录
\`\`\`

### 1.2 Token 存哪里

| 存储方式 | 优点 | 缺点 | 推荐 |
|---------|------|------|------|
| localStorage | 简单，永不过期 | XSS 攻击可读取 | 学习用 ✓ |
| sessionStorage | 关闭标签就清 | 同上，且不持久 | ✗ |
| Cookie (httpOnly) | JS 读不到，防 XSS | 配置复杂，要配 CSRF | 生产推荐 |
| 内存（useState） | 最安全 | 刷新就丢 | 配合 refresh token |

**教学项目用 localStorage**，简单直接。生产环境建议用 httpOnly Cookie。

### 1.3 状态管理选型

| 库 | 学习成本 | 适用 |
|----|---------|------|
| Context API | 低 | 小项目 |
| Zustand | 低 | 中项目 ✓ |
| Redux Toolkit | 高 | 大项目 |
| Jotai/Recoil | 中 | 原子状态 |

我们用 **Zustand**：API 简洁、性能好、TypeScript 友好。

## 二、Demo 1：Zustand 认证 Store

\`\`\`typescript
// stores/auth-store.ts
// 认证状态管理
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  // 状态
  token: string | null;
  user: User | null;

  // 操作
  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;

  // 计算属性
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  // persist 中间件：自动同步到 localStorage
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => get().token !== null,
    }),
    {
      name: "auth-storage",  // localStorage key
      // 只持久化 token，不持久化 user（每次启动重新拉）
      partialize: (state) => ({ token: state.token }),
    }
  )
);
\`\`\`

### 2.1 Zustand 核心概念

\`\`\`typescript
// 1. create 创建 store
const useAuthStore = create<State>()((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
}));

// 2. 组件里用 hook 订阅
function Counter() {
  const count = useAuthStore((state) => state.count);  // 选择器
  const increment = useAuthStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
\`\`\`

**为什么用选择器**：只订阅需要的字段，避免无关字段变化时重渲染。

\`\`\`typescript
// ❌ 不好：订阅整个 store，任何字段变化都会重渲染
const store = useAuthStore();

// ✅ 好：只订阅需要的字段
const token = useAuthStore((s) => s.token);
const user = useAuthStore((s) => s.user);
\`\`\`

### 2.2 persist 中间件

\`\`\`typescript
persist(
  (set, get) => ({ ... }),
  {
    name: "auth-storage",  // localStorage 的 key
    partialize: (state) => ({ token: state.token }),  // 只持久化 token
  }
)
\`\`\`

效果：

- \`set\` 时自动写入 \`localStorage["auth-storage"]\`
- 页面刷新时自动从 localStorage 恢复
- \`partialize\` 控制只存部分字段（user 每次启动从 API 拉，避免脏数据）

## 三、Demo 2：API 客户端集成 Store

修改 \`lib/api.ts\`，从 store 读 token：

\`\`\`typescript
// lib/api.ts
import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  // 从 Zustand store 读
  // 注意：getState() 是非响应式读取，适合在事件处理器/拦截器里用
  return useAuthStore.getState().token;
}

function clearAuth() {
  useAuthStore.getState().logout();
}

async function request<T>(...): Promise<T> {
  // ... 前面的代码不变 ...

  if (response.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "UNAUTHORIZED", "登录已过期");
  }

  // ...
}
\`\`\`

## 四、Demo 3：登录页

\`\`\`tsx
// app/(auth)/login/page.tsx
// 登录页
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. 调登录接口
      const { access_token } = await authApi.login(username, password);

      // 2. 先存 token（后续请求要带）
      // 用 setAuth 先存 token，user 稍后拉
      useAuthStore.setState({ token: access_token });

      // 3. 拉用户信息
      const user = await authApi.getMe();

      // 4. 完整存入 store
      setAuth(access_token, user);

      // 5. 跳转到看板页
      router.push("/boards");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("登录失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">登录</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        还没账号？{" "}
        <Link href="/register" className="text-blue-500 hover:underline">
          注册
        </Link>
      </p>
    </div>
  );
}
\`\`\`

### 4.1 登录流程详解

\`\`\`
1. 用户填表单，点登录
2. 前端 POST /auth/login，body: { username, password }
3. 后端验证密码，返回 { access_token, token_type }
4. 前端把 token 临时存入 store（用 setState 直接设，不调 setAuth）
5. 前端调 /auth/me 拉用户信息（这时请求会自动带 token）
6. 把 user 也存入 store（调 setAuth）
7. 跳转到 /boards
\`\`\`

**为什么要分两步**：

- 登录接口只返回 token，不返回 user 详情
- 拉用户信息要带 token，所以先存 token
- 拉到 user 后再一起存，避免页面闪现"已登录但没头像"

## 五、Demo 4：注册页

\`\`\`tsx
// app/(auth)/register/page.tsx
// 注册页
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (form.username.length < 3) {
      newErrors.username = "用户名至少 3 个字符";
    }
    if (form.username.length > 20) {
      newErrors.username = "用户名最多 20 个字符";
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      newErrors.email = "邮箱格式不正确";
    }
    if (form.password.length < 6) {
      newErrors.password = "密码至少 6 个字符";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "两次密码不一致";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // 调注册接口
      await authApi.register(form.username, form.email, form.password);

      // 注册成功，跳转登录页
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        // 后端返回的错误（如用户名已存在）
        if (err.code === "USERNAME_EXISTS") {
          setErrors({ username: err.message });
        } else {
          setErrors({ _: err.message });
        }
      } else {
        setErrors({ _: "注册失败，请重试" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">注册</h1>

      {errors._ && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {errors._}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">确认密码</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        已有账号？{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
\`\`\`

## 六、Demo 5：路由守卫

未登录用户访问 \`/boards\` 应该跳转到 \`/login\`。需要路由守卫。

### 6.1 客户端守卫

\`\`\`typescript
// hooks/useRequireAuth.ts
// 路由守卫 Hook
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // 没 token 跳登录
    if (!token) {
      router.replace("/login");
      return;
    }

    // 有 token 但没 user 信息（刷新页面后），拉一下
    if (token && !user) {
      // 这里可以调 authApi.getMe() 拉用户信息
      // 简化：直接跳登录让用户重新登
      // 实际项目：try { const me = await authApi.getMe(); useAuthStore.setState({ user: me }); } catch { logout(); }
    }
  }, [token, user, router]);

  return { token, user };
}
\`\`\`

\`\`\`tsx
// app/boards/page.tsx
// 在需要登录的页面用守卫
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function BoardsPage() {
  const { user } = useRequireAuth();

  // 未登录会自动跳转，这里 user 为 null 时不会渲染内容
  if (!user) return <div>跳转中...</div>;

  return (
    <div>
      <h1>欢迎，{user.username}</h1>
      {/* 看板内容 */}
    </div>
  );
}
\`\`\`

### 6.2 中间件守卫（更优雅）

Next.js 支持 \`middleware.ts\`，在请求到达页面前拦截：

\`\`\`typescript
// middleware.ts
// 放在项目根目录
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 从 cookie 读 token（中间件不能读 localStorage）
  // 所以前端要把 token 同步到 cookie
  const token = request.cookies.get("access_token")?.value;

  // 受保护的路径
  const protectedPaths = ["/boards", "/settings"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !token) {
    // 跳登录，带 redirect 参数
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录用户访问登录页，跳到看板
  if (request.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/boards", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/boards/:path*", "/settings/:path*", "/login"],
};
\`\`\`

要让中间件能读 token，需要把 token 同步到 cookie：

\`\`\`typescript
// stores/auth-store.ts
// 修改 persist 配置，同时写 localStorage 和 cookie
persist(
  (set, get) => ({ ... }),
  {
    name: "auth-storage",
    partialize: (state) => ({ token: state.token }),
    // 自定义存储：同时写 localStorage 和 cookie
    storage: {
      getItem: (name) => {
        if (typeof window === "undefined") return null;
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
      },
      setItem: (name, value) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(name, JSON.stringify(value));
        // 同步到 cookie（让中间件能读）
        const token = value?.state?.token;
        if (token) {
          document.cookie = \`access_token=\${token}; path=/; max-age=86400\`;
        } else {
          document.cookie = "access_token=; path=/; max-age=0";
        }
      },
      removeItem: (name) => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(name);
        document.cookie = "access_token=; path=/; max-age=0";
      },
    },
  }
)
\`\`\`

## 七、Demo 6：退出登录

\`\`\`tsx
// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();  // 清 store + localStorage + cookie
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-red-500"
    >
      退出登录
    </button>
  );
}
\`\`\`

## 八、本章小结

| 概念 | 一句话 |
|------|-------|
| Token 存储 | localStorage（学习）/ httpOnly Cookie（生产） |
| Zustand | 轻量状态管理，API 简洁 |
| persist 中间件 | 自动同步到 localStorage |
| 选择器 | \`useStore((s) => s.field)\` 避免无关重渲染 |
| 登录流程 | 调登录接口 → 存 token → 拉 user → 跳转 |
| 路由守卫 | 客户端 Hook 或中间件 |
| middleware.ts | 在请求到达页面前拦截，能读 cookie |
| Token 同步 | localStorage + cookie 双写 |

下一章我们做看板 UI——拖拽卡片、跨列移动。`
  },

  // ============================================================
  // 第 31 章：看板 UI
  // ============================================================
  {
    id: "ff-kanban-ui",
    group: "Next.js 前端集成",
    icon: "📋",
    title: "看板 UI（拖拽、列、卡片）",
    content: `# 看板 UI（拖拽、列、卡片）

## 一、看板 UI 设计

### 1.1 长什么样

\`\`\`
┌─────────────────────────────────────────────────┐
│  看板标题：工作看板                    [+ 新建列] │
├──────────┬──────────┬──────────┬───────────────┤
│ 待办 (3)  │ 进行中(2) │ 已完成(5) │               │
├──────────┼──────────┼──────────┤               │
│ □ 任务 A  │ □ 任务 D  │ □ 任务 G  │               │
│ □ 任务 B  │ □ 任务 E  │ □ 任务 H  │               │
│ □ 任务 C  │          │ □ 任务 I  │               │
│          │          │ □ 任务 J  │               │
│          │          │ □ 任务 K  │               │
├──────────┼──────────┼──────────┤               │
│ [+ 新卡片]│ [+ 新卡片]│ [+ 新卡片]│               │
└──────────┴──────────┴──────────┴───────────────┘
\`\`\`

### 1.2 核心交互

| 交互 | 说明 |
|------|------|
| 拖拽卡片 | 同列内排序、跨列移动 |
| 新建卡片 | 点击列底部"+"按钮 |
| 编辑卡片 | 点卡片打开弹窗 |
| 删除卡片 | 卡片右键菜单或弹窗里的删除按钮 |
| 新建列 | 看板右上角"+ 新建列" |
| 列标题编辑 | 双击列标题 |
| WIP 限制 | 列标题显示"3/5"，超过红色警告 |

### 1.3 拖拽库选型

| 库 | 评价 |
|----|------|
| react-beautiful-dnd | 老牌，但已停止维护 |
| @dnd-kit/core | 现代，活跃维护，推荐 ✓ |
| react-dnd | 灵活但复杂 |
| 原生 HTML5 Drag API | 兼容性差，移动端不支持 |

我们用 **@dnd-kit**：现代、轻量、支持移动端、TypeScript 友好。

## 二、Demo 1：安装与基础概念

\`\`\`bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
\`\`\`

### 2.1 核心概念

| 概念 | 说明 |
|------|------|
| \`DndContext\` | 拖拽根容器，包裹所有可拖拽元素 |
| \`useDraggable\` | 让元素可拖拽 |
| \`useDroppable\` | 让元素可放置（drop target） |
| \`useSortable\` | 组合 draggable + droppable，用于排序 |
| \`SortableContext\` | 排序上下文，管理一组可排序元素 |
| \`DragOverlay\` | 拖拽时的"幽灵"预览 |

### 2.2 最简拖拽示例

\`\`\`tsx
// components/Demo.tsx
"use client";

import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

// 可拖拽元素
function DraggableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? { transform: \`translate(\${transform.x}px, \${transform.y}px)\` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 bg-white border rounded cursor-move"
    >
      拖拽我 ({id})
    </div>
  );
}

// 可放置区域
function DroppableArea({ id }: { id: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={\`p-4 border-2 border-dashed rounded min-h-[100px] \${
        isOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }\`}
    >
      {isOver ? "放这里！" : "拖东西进来"}
    </div>
  );
}

export default function Demo() {
  return (
    <DndContext onDragEnd={(e) => console.log("拖到", e.over?.id)}>
      <div className="space-y-4 p-4">
        <DraggableItem id="item-1" />
        <DroppableArea id="area-1" />
      </div>
    </DndContext>
  );
}
\`\`\`

## 三、Demo 2：看板组件结构

\`\`\`txt
<Board>                          ← 看板容器
  <DndContext>                   ← 拖拽根
    <Column>                     ← 列
      <SortableContext>          ← 列内排序上下文
        <Card>                   ← 卡片（可拖拽）
        <Card>
        <Card>
      </SortableContext>
      <AddCardButton>            ← 新建卡片按钮
    </Column>
    <Column>...</Column>
    <AddColumnButton>
  </DndContext>
  <DragOverlay>                  ← 拖拽预览
    <CardPreview>
  </DragOverlay>
</Board>
\`\`\`

## 四、Demo 3：看板主组件

\`\`\`tsx
// components/kanban/Board.tsx
"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import { boardApi, cardApi } from "@/lib/api";
import type { Board as BoardType, Column, Card as CardType } from "@/types";
import { Column as ColumnComponent } from "./Column";
import { Card as CardComponent } from "./Card";

interface Props {
  boardId: number;
}

export function Board({ boardId }: Props) {
  const [board, setBoard] = useState<BoardType | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);

  // 拖拽传感器：鼠标按住 250ms 才触发拖拽（避免误触）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // 加载看板数据
  useEffect(() => {
    const load = async () => {
      try {
        const data = await boardApi.get(boardId);
        setBoard(data);
        setColumns(data.columns || []);
      } catch (err) {
        console.error("加载看板失败:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [boardId]);

  // 拖拽开始：记录被拖的卡片
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCard(active.id as number);
    setActiveCard(card);
  };

  // 拖拽过程中：跨列移动时实时更新 UI（乐观更新）
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number | string;

    // 找到 active 和 over 所在的列
    const activeColumn = findColumnByCardId(activeId);
    const overColumn = overId.toString().startsWith("column-")
      ? columns.find((c) => \`column-\${c.id}\` === overId)
      : findColumnByCardId(overId as number);

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;  // 同列不处理

    // 跨列移动：把卡片从原列移到目标列（UI 层面）
    setColumns((prev) => {
      const next = prev.map((col) => {
        if (col.id === activeColumn.id) {
          // 原列：移除卡片
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          // 目标列：添加卡片（位置先放最后，dragEnd 时再调整）
          const card = activeColumn.cards.find((c) => c.id === activeId);
          if (card) {
            return { ...col, cards: [...col.cards, card] };
          }
        }
        return col;
      });
      return next;
    });
  };

  // 拖拽结束：调用后端 API 持久化
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number | string;

    // 找到目标列和位置
    const overColumn = overId.toString().startsWith("column-")
      ? columns.find((c) => \`column-\${c.id}\` === overId)
      : findColumnByCardId(overId as number);

    if (!overColumn) return;

    // 计算新位置（简化：放最后）
    const newPosition = overColumn.cards.length;

    try {
      // 调后端 API
      await cardApi.move(activeId, overColumn.id, newPosition);
      // 成功：不用做啥，UI 已经更新
    } catch (err) {
      // 失败：回滚 UI（重新加载数据）
      console.error("移动卡片失败:", err);
      const data = await boardApi.get(boardId);
      setColumns(data.columns || []);
    }
  };

  // 工具函数：根据卡片 ID 找卡片
  const findCard = (cardId: number): CardType | null => {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  // 工具函数：根据卡片 ID 找所在列
  const findColumnByCardId = (cardId: number): Column | undefined => {
    return columns.find((col) => col.cards.some((c) => c.id === cardId));
  };

  if (loading) return <div>加载中...</div>;
  if (!board) return <div>看板不存在</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{board.title}</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto">
          {columns.map((column) => (
            <ColumnComponent
              key={column.id}
              column={column}
              onAddCard={(title) => handleAddCard(column.id, title)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <CardComponent card={activeCard} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function handleAddCard(columnId: number, title: string) {
    // 简化：实际要调 API 创建
    console.log("新建卡片", columnId, title);
  }
}
\`\`\`

## 五、Demo 4：列组件

\`\`\`tsx
// components/kanban/Column.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import type { Column as ColumnType } from "@/types";
import { Card } from "./Card";

interface Props {
  column: ColumnType;
  onAddCard: (title: string) => void;
}

export function Column({ column, onAddCard }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  // 让整列可放置（拖到列空白处也能放下）
  const { setNodeRef, isOver } = useDroppable({
    id: \`column-\${column.id}\`,
  });

  // 卡片 ID 列表，用于 SortableContext
  const cardIds = column.cards.map((c) => c.id);

  return (
    <div
      ref={setNodeRef}
      className={\`flex-shrink-0 w-72 bg-gray-100 rounded p-3 \${
        isOver ? "ring-2 ring-blue-400" : ""
      }\`}
    >
      {/* 列标题 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">
          {column.title}
          <span className="ml-1 text-sm text-gray-500">
            ({column.cards.length}
            {column.wip_limit && \`/\${column.wip_limit}\`})
          </span>
        </h2>
      </div>

      {/* WIP 限制警告 */}
      {column.wip_limit && column.cards.length > column.wip_limit && (
        <div className="mb-2 text-xs text-red-500 bg-red-50 p-1 rounded">
          超过 WIP 限制！
        </div>
      )}

      {/* 卡片列表 */}
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {column.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {/* 新建卡片 */}
      {isAdding ? (
        <div className="mt-2">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="输入卡片标题..."
            className="w-full p-2 border rounded text-sm"
            autoFocus
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => {
                if (newCardTitle.trim()) {
                  onAddCard(newCardTitle.trim());
                  setNewCardTitle("");
                }
                setIsAdding(false);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              添加
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-gray-500 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 w-full text-left text-sm text-gray-500 hover:bg-gray-200 p-2 rounded"
        >
          + 添加卡片
        </button>
      )}
    </div>
  );
}
\`\`\`

## 六、Demo 5：卡片组件

\`\`\`tsx
// components/kanban/Card.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/types";

interface Props {
  card: CardType;
  isOverlay?: boolean;  // 是否是拖拽预览
}

export function Card({ card, isOverlay = false }: Props) {
  // useSortable 组合了 useDraggable + useDroppable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  // 拖拽时的样式
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 优先级颜色
  const priorityColors = ["gray", "yellow", "red"];
  const priorityLabels = ["低", "中", "高"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={\`bg-white p-3 rounded shadow-sm border cursor-move hover:shadow-md transition \${
        isOverlay ? "shadow-lg rotate-2" : ""
      }\`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-sm">{card.title}</h3>
        {card.priority > 0 && (
          <span
            className={\`text-xs px-1 rounded bg-\${priorityColors[card.priority]}-100 text-\${priorityColors[card.priority]}-700\`}
          >
            {priorityLabels[card.priority]}
          </span>
        )}
      </div>

      {card.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span>#{card.id}</span>
        {card.due_date && (
          <span>📅 {new Date(card.due_date).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
\`\`\`

### 6.1 useSortable 的关键属性

\`\`\`typescript
const {
  attributes,    // 传给元素的 ARIA 属性（无障碍）
  listeners,     // 拖拽事件监听器（onPointerDown 等）
  setNodeRef,    // 元素 ref，dnd-kit 用来定位
  transform,     // 拖拽时的位移 { x, y }
  transition,    // 动画过渡
  isDragging,    // 是否正在拖拽
} = useSortable({ id: card.id });
\`\`\`

\`\`\`typescript
// transform 要转成 CSS 的 transform 字符串
const style = {
  transform: CSS.Transform.toString(transform),
  // 例如 transform: "translate3d(100px, 50px, 0)"
};
\`\`\`

## 七、Demo 6：卡片编辑弹窗

\`\`\`tsx
// components/kanban/CardModal.tsx
"use client";

import { useState, useEffect } from "react";
import { cardApi } from "@/lib/api";
import type { Card } from "@/types";

interface Props {
  card: Card;
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: number) => void;
}

export function CardModal({ card, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await cardApi.update(card.id, {
        title,
        description,
        priority,
      });
      onUpdate(updated);
      onClose();
    } catch (err) {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定删除这张卡片？")) return;
    try {
      await cardApi.delete(card.id);
      onDelete(card.id);
      onClose();
    } catch (err) {
      alert("删除失败");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">编辑卡片</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            >
              <option value={0}>低</option>
              <option value={1}>中</option>
              <option value={2}>高</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded"
          >
            删除
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-500"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

## 八、Demo 7：乐观更新

拖拽时先更新 UI，再调 API。如果 API 失败，回滚。

\`\`\`typescript
// 乐观更新模式
const handleMoveCard = async (cardId: number, toColumnId: number) => {
  // 1. 先保存旧状态（用于回滚）
  const oldColumns = [...columns];

  // 2. 立刻更新 UI（用户感觉"瞬间响应"）
  setColumns(updateColumns(columns, cardId, toColumnId));

  try {
    // 3. 调 API
    await cardApi.move(cardId, toColumnId, 0);
    // 成功：什么都不用做
  } catch (err) {
    // 4. 失败：回滚 UI
    setColumns(oldColumns);
    alert("移动失败，请重试");
  }
};
\`\`\`

### 8.1 乐观更新 vs 悲观更新

| 方式 | 流程 | 用户体验 |
|------|------|---------|
| 悲观更新 | 调 API → 等响应 → 更新 UI | 慢，要等 |
| 乐观更新 | 更新 UI → 调 API → 失败回滚 | 快，瞬间响应 |

**乐观更新适合**：操作大概率成功的场景（如移动卡片）。
**悲观更新适合**：操作可能失败的场景（如支付）。

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| @dnd-kit | 现代拖拽库，支持移动端 |
| DndContext | 拖拽根容器 |
| useSortable | 让元素可拖拽可排序 |
| SortableContext | 管理一组可排序元素 |
| DragOverlay | 拖拽时的预览 |
| 乐观更新 | 先更新 UI，失败再回滚 |
| WIP 限制 | 列卡片数超过限制显示警告 |
| 弹窗编辑 | 点击卡片打开编辑弹窗 |

下一章我们接入 WebSocket，实现多人实时协作。`
  },

  // ============================================================
  // 第 32 章：实时同步（WebSocket 集成）
  // ============================================================
  {
    id: "ff-realtime",
    group: "Next.js 前端集成",
    icon: "⚡",
    title: "实时同步（WebSocket 集成）",
    content: `# 实时同步（WebSocket 集成）

## 一、为什么要实时同步

### 1.1 没有实时同步的问题

A 和 B 同时看一个看板：

\`\`\`
A 拖动卡片 → 调 API → 数据库更新
                          │
B 的页面还是旧的 ←────── B 不知道有变化
\`\`\`

B 必须手动刷新才能看到 A 的操作。**体验极差。**

### 1.2 实时同步的效果

\`\`\`
A 拖动卡片 → 调 API → 数据库更新
                          │
                          ▼
                    WebSocket 广播
                          │
              ┌───────────┼───────────┐
              ▼                       ▼
        A 的页面收到           B 的页面收到
        （自己操作，可忽略）   （更新 UI）
\`\`\`

B 不用刷新，立刻看到 A 的操作。

## 二、WebSocket Hook 封装

### 2.1 设计思路

\`\`\`typescript
const { ws, isConnected, lastMessage, sendMessage } = useWebSocket(
  \`/ws/board/\${boardId}\`,
  token
);
\`\`\`

- **自动连接**：Hook 挂载时连接
- **自动重连**：断开后定时重连
- **自动关闭**：Hook 卸载时关闭
- **消息分发**：收到消息通知组件
- **带 token**：连接时带认证

### 2.2 实现

\`\`\`typescript
// hooks/useWebSocket.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;  // 重连间隔，默认 3000ms
  maxReconnectAttempts?: number;  // 最大重连次数，默认 5
}

export function useWebSocket(
  url: string | null,  // null 时不连接
  token: string | null,
  options: UseWebSocketOptions = {}
) {
  const {
    onMessage,
    onOpen,
    onClose,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // 用 ref 存回调，避免 effect 依赖变化导致重连
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
  });

  // 连接函数
  const connect = useCallback(() => {
    if (!url || !token) return;

    // 关闭旧连接
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 构造带 token 的 URL
    const wsUrl = \`\${url}?token=\${encodeURIComponent(token)}\`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] 已连接");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;  // 重置重连计数
      onOpenRef.current?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessageRef.current?.(data);
      } catch (err) {
        console.error("[WS] 消息解析失败:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] 已断开");
      setIsConnected(false);
      wsRef.current = null;
      onCloseRef.current?.();

      // 自动重连
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        console.log(
          \`[WS] \${reconnectInterval}ms 后重连 (尝试 \${reconnectAttemptsRef.current + 1}/\${maxReconnectAttempts})\`
        );
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, reconnectInterval);
      } else {
        console.log("[WS] 达到最大重连次数，停止重连");
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] 错误:", err);
    };
  }, [url, token, reconnectInterval, maxReconnectAttempts]);

  // 挂载时连接
  useEffect(() => {
    connect();

    // 卸载时关闭
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  // 发送消息
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    console.warn("[WS] 未连接，无法发送");
    return false;
  }, []);

  // 手动重连
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  return {
    ws: wsRef.current,
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
  };
}
\`\`\`

### 2.3 关键设计点

**1. 用 ref 存回调**：

\`\`\`typescript
// ❌ 问题：onMessage 变化会导致 effect 重新执行，重连 WebSocket
useEffect(() => {
  // ...
}, [url, token, onMessage]);  // onMessage 是函数，每次渲染都变

// ✅ 好：用 ref 存，effect 不依赖它
const onMessageRef = useRef(onMessage);
useEffect(() => {
  onMessageRef.current = onMessage;  // 每次渲染更新 ref
});

useEffect(() => {
  // 用 onMessageRef.current 调用
  ws.onmessage = (e) => onMessageRef.current?.(JSON.parse(e.data));
}, [url, token]);  // 只依赖 url 和 token
\`\`\`

**2. 自动重连**：

\`\`\`typescript
ws.onclose = () => {
  if (reconnectAttemptsRef.current < maxReconnectAttempts) {
    setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connect();
    }, reconnectInterval);
  }
};
\`\`\`

断开后等 3 秒重连，最多重试 5 次。

**3. 卸载时清理**：

\`\`\`typescript
useEffect(() => {
  connect();
  return () => {
    clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
  };
}, [connect]);
\`\`\`

组件卸载时关闭连接，避免内存泄漏。

## 三、Demo 1：看板页面集成 WebSocket

\`\`\`tsx
// app/boards/[boardId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Board } from "@/components/kanban/Board";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuthStore } from "@/stores/auth-store";
import { config } from "@/lib/config";

export default function BoardPage() {
  const params = useParams();
  const boardId = Number(params.boardId);
  const token = useAuthStore((s) => s.token);

  const [onlineCount, setOnlineCount] = useState(1);

  // 连接 WebSocket
  const wsUrl = \`\${config.wsUrl}/ws/board/\${boardId}\`;
  const { isConnected, sendMessage } = useWebSocket(wsUrl, token, {
    onMessage: (data) => {
      // 收到 WebSocket 消息
      console.log("收到消息:", data);

      switch (data.type) {
        case "user_joined":
        case "user_left":
          setOnlineCount(data.online_count);
          break;

        case "card_moved":
          // 别人移动了卡片，更新 UI
          // 这里要触发 Board 组件重新加载或局部更新
          console.log("卡片移动:", data);
          break;

        case "card_created":
          // 别人新建了卡片
          console.log("新卡片:", data);
          break;

        case "card_deleted":
          // 别人删除了卡片
          console.log("卡片删除:", data);
          break;
      }
    },
  });

  return (
    <div>
      {/* 在线人数指示器 */}
      <div className="fixed top-4 right-4 flex items-center gap-2 px-3 py-1 bg-white rounded shadow">
        <div className={\`w-2 h-2 rounded-full \${
          isConnected ? "bg-green-500" : "bg-red-500"
        }\`} />
        <span className="text-sm">
          {isConnected ? \`在线 \${onlineCount} 人\` : "连接中..."}
        </span>
      </div>

      <Board
        boardId={boardId}
        onCardMove={(cardId, toColumnId, position) => {
          // 本地操作后，广播给其他人
          sendMessage({
            type: "card_moved",
            card_id: cardId,
            to_column_id: toColumnId,
            position,
          });
        }}
      />
    </div>
  );
}
\`\`\`

## 四、Demo 2：消息类型定义

\`\`\`typescript
// types/ws.ts
// WebSocket 消息类型

// 基础消息
interface BaseMessage {
  type: string;
  timestamp?: string;
}

// 用户加入
interface UserJoinedMessage extends BaseMessage {
  type: "user_joined";
  online_count: number;
}

// 用户离开
interface UserLeftMessage extends BaseMessage {
  type: "user_left";
  online_count: number;
}

// 卡片移动
interface CardMovedMessage extends BaseMessage {
  type: "card_moved";
  card_id: number;
  from_column?: number;
  to_column: number;
  position: number;
}

// 卡片创建
interface CardCreatedMessage extends BaseMessage {
  type: "card_created";
  card: {
    id: number;
    column_id: number;
    title: string;
    position: number;
  };
}

// 卡片删除
interface CardDeletedMessage extends BaseMessage {
  type: "card_deleted";
  card_id: number;
}

// 卡片更新
interface CardUpdatedMessage extends BaseMessage {
  type: "card_updated";
  card_id: number;
  changes: Record<string, any>;
}

// 联合类型
type WsMessage =
  | UserJoinedMessage
  | UserLeftMessage
  | CardMovedMessage
  | CardCreatedMessage
  | CardDeletedMessage
  | CardUpdatedMessage;
\`\`\`

## 五、Demo 3：实时更新看板

\`\`\`tsx
// components/kanban/Board.tsx（增强版）
"use client";

import { useState, useEffect, useCallback } from "react";
import { boardApi, cardApi } from "@/lib/api";
import type { Board, Column, Card } from "@/types";

interface Props {
  boardId: number;
  wsMessage: any | null;  // WebSocket 收到的消息
}

export function Board({ boardId, wsMessage }: Props) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [board, setBoard] = useState<Board | null>(null);

  // 加载看板
  const loadBoard = useCallback(async () => {
    const data = await boardApi.get(boardId);
    setBoard(data);
    setColumns(data.columns || []);
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // 处理 WebSocket 消息
  useEffect(() => {
    if (!wsMessage) return;

    switch (wsMessage.type) {
      case "card_moved":
        // 别人移动了卡片，更新本地 UI
        handleRemoteCardMove(wsMessage);
        break;

      case "card_created":
        // 别人新建了卡片，加到本地
        handleRemoteCardCreate(wsMessage);
        break;

      case "card_deleted":
        // 别人删除了卡片，从本地移除
        handleRemoteCardDelete(wsMessage);
        break;

      case "card_updated":
        // 别人更新了卡片
        handleRemoteCardUpdate(wsMessage);
        break;
    }
  }, [wsMessage]);

  // 远程卡片移动
  const handleRemoteCardMove = (msg: any) => {
    setColumns((prev) => {
      const next = [...prev];
      // 找到卡片，移到新位置
      let movedCard: Card | null = null;
      for (const col of next) {
        const idx = col.cards.findIndex((c) => c.id === msg.card_id);
        if (idx >= 0) {
          movedCard = col.cards[idx];
          col.cards.splice(idx, 1);
          break;
        }
      }
      if (movedCard) {
        const targetCol = next.find((c) => c.id === msg.to_column);
        if (targetCol) {
          // 插入到指定位置
          movedCard.column_id = msg.to_column;
          targetCol.cards.splice(msg.position, 0, movedCard);
        }
      }
      return next;
    });
  };

  // 远程卡片创建
  const handleRemoteCardCreate = (msg: any) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === msg.card.column_id) {
          // 避免重复添加（自己创建的已经有了）
          if (!col.cards.find((c) => c.id === msg.card.id)) {
            return {
              ...col,
              cards: [...col.cards, msg.card],
            };
          }
        }
        return col;
      })
    );
  };

  // 远程卡片删除
  const handleRemoteCardDelete = (msg: any) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== msg.card_id),
      }))
    );
  };

  // 远程卡片更新
  const handleRemoteCardUpdate = (msg: any) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) =>
          c.id === msg.card_id ? { ...c, ...msg.changes } : c
        ),
      }))
    );
  };

  // 本地操作：移动卡片
  const handleLocalCardMove = async (cardId: number, toColumnId: number, position: number) => {
    // 1. 乐观更新 UI
    handleRemoteCardMove({
      type: "card_moved",
      card_id: cardId,
      to_column: toColumnId,
      position,
    });

    // 2. 调 API 持久化
    try {
      await cardApi.move(cardId, toColumnId, position);
      // 3. WebSocket 广播由后端处理（后端调 broadcast_to_board）
    } catch (err) {
      // 失败：重新加载
      await loadBoard();
      alert("移动失败，请重试");
    }
  };

  return (
    <div>
      {board && <h1>{board.title}</h1>}
      {/* 渲染列和卡片 */}
    </div>
  );
}
\`\`\`

### 5.1 关键点：避免循环更新

\`\`\`typescript
// 问题：A 操作 → 广播 → A 也收到 → A 又操作 → 又广播 → 死循环
// 解决：广播消息带 source 标记，自己操作的不处理

if (msg.source === "self") return;  // 自己的操作，忽略
\`\`\`

后端实现：

\`\`\`python
# 后端广播时，给发送者单独发一个 source="self" 的消息
# 给其他人发 source="other"
\`\`\`

或者前端用 cardId 判断：如果移动的卡片是自己刚操作的，就忽略。

## 六、Demo 4：在线用户列表

\`\`\`tsx
// components/OnlineUsers.tsx
"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

interface OnlineUser {
  id: number;
  username: string;
  avatar?: string;
}

export function OnlineUsers({ boardId, token }: { boardId: number; token: string }) {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  const { isConnected } = useWebSocket(
    \`ws://localhost:8000/ws/board/\${boardId}\`,
    token,
    {
      onMessage: (data) => {
        if (data.type === "online_users") {
          setUsers(data.users);
        }
        if (data.type === "user_joined") {
          // 重新拉在线列表
        }
      },
    }
  );

  return (
    <div className="flex items-center -space-x-2">
      {users.slice(0, 5).map((user) => (
        <div
          key={user.id}
          className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs"
          title={user.username}
        >
          {user.username[0].toUpperCase()}
        </div>
      ))}
      {users.length > 5 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
          +{users.length - 5}
        </div>
      )}
    </div>
  );
}
\`\`\`

## 七、Demo 5：连接状态指示器

\`\`\`tsx
// components/ConnectionStatus.tsx
"use client";

export function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow text-sm">
      <div className="relative">
        <div
          className={\`w-2 h-2 rounded-full \${
            isConnected ? "bg-green-500" : "bg-red-500"
          }\`}
        />
        {isConnected && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
        )}
      </div>
      <span className={isConnected ? "text-green-700" : "text-red-700"}>
        {isConnected ? "已连接" : "连接断开"}
      </span>
    </div>
  );
}
\`\`\`

\`\`\`css
/* animate-ping 是 Tailwind 内置的脉冲动画 */
/* 也可以自定义 */
@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
\`\`\`

## 八、Demo 6：断线重连提示

\`\`\`tsx
// components/ReconnectToast.tsx
"use client";

import { useState, useEffect } from "react";

export function ReconnectToast({ isConnected }: { isConnected: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setShow(true);
    } else {
      // 连接恢复后，延迟 1 秒隐藏
      const timer = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!show) return null;

  return (
    <div className={\`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg \${
      isConnected
        ? "bg-green-500 text-white"
        : "bg-yellow-500 text-white"
    }\`}>
      {isConnected ? "✓ 连接已恢复" : "⚠ 连接断开，正在重连..."}
    </div>
  );
}
\`\`\`

## 九、本章小结

| 概念 | 一句话 |
|------|-------|
| WebSocket Hook | 封装连接、重连、消息分发 |
| 自动重连 | 断开后定时重连，最多 N 次 |
| ref 存回调 | 避免函数依赖变化导致重连 |
| 消息类型 | 用 TypeScript 联合类型定义 |
| 乐观更新 | 先更新 UI，再调 API |
| 避免循环 | 自己操作的消息不处理 |
| 在线用户 | 头像列表显示 |
| 连接指示器 | 绿点/红点 + 脉冲动画 |
| 断线提示 | Toast 提示重连状态 |

至此 Next.js 前端部分完成。下一章进入测试与部署，把项目跑起来！`
  },
];
