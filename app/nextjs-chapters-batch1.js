// =============================================================
// Next.js 16 教程 - 第 1 批章节（基础入门篇 5 章）
// -------------------------------------------------------------
// 覆盖 Next.js 16 的核心入门内容：全景概览、安装与项目结构、
// 路由基础与布局导航、Server/Client 组件、动态路由与路由组。
// 所有内容基于 Next.js 16.2.9 + React 19.2.4 的实际 API 编写，
// 重点突出 Next.js 16 的破坏性变更（Turbopack 默认、params 为
// Promise、middleware 弃用为 proxy、React Compiler 等）。
// =============================================================

export const chapters = [
  {
    id: "nextjs-overview",
    group: "基础入门",
    icon: "🚀",
    title: "Next.js 16 全景概览",
    content: `

# Next.js 16 全景概览

## 一、Next.js 是什么

Next.js 是由 Vercel 团队维护、基于 React 的全栈 Web 框架。它把 React 从「一个只负责视图的库」升级为「一个可以独立交付完整 Web 应用的工程化方案」，开箱即用地解决了路由、渲染、数据获取、构建优化、部署等方方面面的问题。

如果说原生 React 像是把一堆积木交给你，让你自己想办法搭房子；那么 Next.js 更像是直接给你一套带结构图、带施工规范、带精装的「装配式建筑系统」，你只需要在关键位置填上业务代码。

### 1.1 核心理念

Next.js 的设计围绕几个关键理念：

1. **文件系统即路由** —— 文件夹和文件的结构，就是 URL 的结构，无需手写路由表。
2. **服务端优先** —— 组件默认在服务器渲染（React Server Components），按需把交互部分下放到客户端。
3. **零配置开箱即用** —— TypeScript、代码分割、预取、构建优化都默认开启，不需要手动调 Webpack。
4. **混合渲染** —— 同一个应用可以同时拥有静态生成（SSG）、服务端渲染（SSR）、客户端渲染（CSR）和流式渲染。
5. **流式响应** —— 服务器可以分块把页面内容推送到浏览器，先显示骨架再填充数据，提升首屏体验。

### 1.2 App Router vs Pages Router

Next.js 历史上有两套路由体系：早期的 **Pages Router**（\`pages/\` 目录）和 Next.js 13 引入、在 16 中彻底成为主推方向的 **App Router**（\`app/\` 目录）。两者在 Next.js 16 中依然共存，但官方推荐新项目一律使用 App Router。

| 维度 | Pages Router（\`pages/\`） | App Router（\`app/\`） |
|------|--------------------------|------------------------|
| 路由定义 | 文件即路由（\`pages/about.js\` → \`/about\`） | 文件夹定义段，\`page.js\` 才是路由 |
| 默认组件 | 全部是客户端组件 | 默认是 Server Component |
| 布局机制 | \`_app.js\` 全局 + 自定义 Layout 组件 | \`layout.js\` 文件约定，嵌套保留状态 |
| 数据获取 | \`getServerSideProps\` / \`getStaticProps\` | 组件内直接 \`await fetch\`，async Server Component |
| React 版本 | 使用 \`package.json\` 里的 React | 内置 React 19.2 稳定版 |
| 新特性支持 | 不再获得新特性 | 所有新特性主战场（RSC、Streaming、Suspense） |
| 维护状态 | 维护模式，向后兼容 | 主推方向，文档默认 |

> 在 Next.js 16 的官方文档里，所有入门示例都默认使用 App Router，Pages Router 仅作为「兼容选项」存在。本教程全部围绕 App Router 展开。

## 二、Next.js 16 的重大变化

Next.js 16 是一个包含若干破坏性变更的版本，迁移和上手时必须特别留意。下面这几条是入门阶段最需要记住的。

### 2.1 Turbopack 成为默认打包器

从 Next.js 16 起，**Turbopack 取代 Webpack 成为默认打包器**，开发服务器和构建都默认使用它。这意味着：

- 启动 \`next dev\` 不再需要加 \`--turbopack\` 标志，它就是 Turbopack。
- 如果出于历史原因仍要用 Webpack，需要显式加 \`--webpack\`：\`next dev --webpack\` 或 \`next build --webpack\`。
- Turbopack 基于 Rust（SWC），本地启动速度、热更新（HMR）速度比 Webpack 快一个数量级，尤其在中大型项目上体感非常明显。

\`\`\`json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
\`\`\`

注意：早期教程里常见的 \`next dev --turbopack\` 写法在 16 中已经过时，那个标志会被忽略。

### 2.2 异步请求 API（Async Request APIs）

这是 Next.js 15 引入、在 16 中成为强制要求的变更：**\`params\`、\`searchParams\`、\`cookies()\`、\`headers()\`、\`draftMode()\` 等请求相关 API 全部变成了 Promise**，必须 \`await\` 才能拿到值。

\`\`\`jsx filename="app/blog/[slug]/page.js"
// ✅ Next.js 16 正确写法：params 是 Promise，必须 await
export default async function Page({ params }) {
  const { slug } = await params
  return <h1>文章：{slug}</h1>
}

// ❌ 旧写法（Next.js 14 及之前），16 中已不再支持
// export default function Page({ params }) {
//   return <h1>{params.slug}</h1>
// }
\`\`\`

这一点会在第 5 章「动态路由」中反复强调，因为它是最容易让从旧版迁移过来的同学踩坑的地方。

### 2.3 React 19.2 与 React Compiler

Next.js 16 内置 React 19.2 稳定版，并默认启用了若干 React 19 能力，例如：

- **Actions**：表单与异步操作的标准化处理。
- **\`use()\` API**：在组件中读取 Promise / Context。
- **React Compiler**（可选）：通过 \`create-next-app\` 时勾选 React Compiler，可以让编译器自动优化 memoization，减少手写 \`useMemo\` / \`useCallback\` 的负担。
- **\`cacheComponents\` 配置**：开启后，Next.js 会自动对可缓存的组件做更细粒度的缓存优化，进一步减少重复渲染。

### 2.4 middleware 改名为 proxy（弃用，非强制）

Next.js 16 把 \`middleware.ts\` **改名为 \`proxy.ts\`**（推荐用法），它运行在服务器端的 Node.js 运行时（不再是 edge runtime），更准确地表达它的语义：它在「请求被路由到页面之前」做拦截、重写、重定向，本质上是一个请求代理层。文件约定、签名基本一致，目录顶级文件由 \`middleware.ts\` 变为 \`proxy.ts\`。

> 注意：\`middleware.ts\` **仍然可用但已被弃用**，启动时会出现 \`The "middleware" file convention is deprecated. Please use "proxy" instead.\` 的警告。如果同时存在 \`middleware.ts\` 和 \`proxy.ts\`，构建会直接报错，必须只保留 \`proxy.ts\`。新项目建议直接用 \`proxy.ts\`。

### 2.5 构建不再自动跑 lint

从 Next.js 16 起，\`next build\` **不再自动运行 linter**。你需要自己在 \`package.json\` 里配 \`lint\` 脚本，通过 CI 或 git hook 来跑。这避免了构建被 lint 警告卡住，也让 lint 与构建解耦。

\`\`\`json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
\`\`\`

## 三、与同类方案对比

### 3.1 Next.js vs Vite vs CRA

| 维度 | Next.js 16 | Vite（纯 CSR） | CRA（已停止维护） |
|------|-----------|----------------|------------------|
| 定位 | 全栈 React 框架 | 前端构建工具 | 脚手架（仅生成项目） |
| 路由 | 内置文件系统路由 | 需自己配 react-router | 需自己配 react-router |
| SSR/SSG | 内置混合渲染 | 需额外方案（如 Vike） | 不支持 |
| Server Components | 默认支持 | 不支持 | 不支持 |
| 数据获取 | RSC 内 async/await | 客户端 fetch | 客户端 fetch |
| 打包器 | Turbopack（默认）/ Webpack | esbuild + Rollup | Webpack |
| 部署 | Vercel / Node / 静态导出 | 静态资源 | 静态资源 |
| 适合场景 | 全栈应用、SEO 站点、内容站 | 后台管理、纯前端 SPA | 不推荐新项目使用 |

### 3.2 什么时候选 Next.js

- 需要良好 SEO：电商、内容站、博客、营销页。
- 首屏性能敏感：服务端渲染 + 流式输出能显著改善 FCP / LCP。
- 全栈一体化：API Routes、数据库访问、认证都希望在一个项目里完成。
- 想用上 React 最新特性：Server Components、Actions、Suspense 流式渲染。
- 团队希望减少基建决策成本：路由、构建、优化都有官方答案。

### 3.3 什么时候可能不必用 Next.js

- 纯内部后台管理系统，无 SEO 需求，且团队对 Vite + react-router 更熟悉。
- 极度轻量的单页工具页（如一个计算器、一个可视化 Demo）。
- 已有微前端基建、Next.js 的 SSR 反而增加运维复杂度的场景。

## 四、本教程的学习路径

本批 5 章属于「基础入门篇」，目标是让你从 0 走到能独立写出一个带路由、布局、动态页面的 Next.js 16 应用：

1. **第 1 章（本章）**：建立对 Next.js 16 全貌的认知，理解破坏性变更。
2. **第 2 章**：用 \`create-next-app\` 创建项目，看清目录结构、理解 Turbopack 默认行为。
3. **第 3 章**：掌握 App Router 的文件约定、布局嵌套、Link 导航与滚动行为。
4. **第 4 章**：深入 Server / Client 组件模型，学会正确划界、交错组合。
5. **第 5 章**：玩转动态路由段、catch-all、路由组，并熟记 \`params\` 是 Promise 这一 16 关键变更。

学完这 5 章后，你会拥有阅读后续进阶章节（数据获取、缓存、部署、性能优化）的全部前置知识。
`
  },
  {
    id: "nextjs-install",
    group: "基础入门",
    icon: "📦",
    title: "安装与项目结构详解",
    content: `

# 安装与项目结构详解

## 一、环境要求

在动手之前，先确认开发环境满足 Next.js 16 的最低要求：

| 项目 | 最低版本 | 备注 |
|------|---------|------|
| Node.js | 20.9+ | 推荐使用 LTS 版本 |
| 操作系统 | macOS / Windows（含 WSL）/ Linux | 全平台支持 |
| 浏览器 | Chrome 111+ / Edge 111+ / Firefox 111+ / Safari 16.4+ | 现代浏览器零配置 |

可以用 \`node -v\` 检查本机 Node 版本，低于 20.9 的话请先升级。

## 二、用 create-next-app 创建项目

\`create-next-app\`（简称 CNA）是官方脚手架，一条命令就能生成一个配置完整、可直接运行的项目。

### 2.1 快速开始

\`\`\`bash filename="Terminal"
# 使用 npx（npm 用户）
npx create-next-app@latest my-app --yes
cd my-app
npm run dev

# 使用 pnpm（推荐，更快）
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev
\`\`\`

\`--yes\` 表示跳过交互式提问，全部使用默认推荐配置。默认配置会启用：

- **TypeScript**
- **Tailwind CSS**
- **ESLint**
- **App Router**
- **Turbopack**
- 导入别名 \`@/*\`
- 自动生成 \`AGENTS.md\`（以及指向它的 \`CLAUDE.md\`），用于指导 AI 编程助手写出符合最新规范的代码

### 2.2 自定义配置

不加 \`--yes\` 时，CNA 会依次问你这些问题：

\`\`\`txt filename="Terminal"
What is your project named? my-app
Would you like to use TypeScript? No / Yes
Which linter would you like to use? ESLint / Biome / None
Would you like to use React Compiler? No / Yes
Would you like to use Tailwind CSS? No / Yes
Would you like your code inside a src/ directory? No / Yes
Would you like to use App Router? (recommended) No / Yes
Would you like to customize the import alias (@/* by default)? No / Yes
Would you like to include AGENTS.md to guide coding agents? No / Yes
\`\`\`

几个值得留意的选项：

- **React Compiler**：开启后编译器自动做 memoization，能减少手写 \`useMemo\` / \`useCallback\`，但属于可选优化。
- **src/ 目录**：开启后应用代码会放在 \`src/app\` 而不是 \`app\`，便于把代码与配置文件分开。
- **Biome**：比 ESLint 更快的 linter + formatter，Next.js 16 也提供一等支持。

## 三、项目结构详解

### 3.1 顶层目录与文件

一个刚创建好的 Next.js 16 项目大致长这样：

\`\`\`txt filename="目录树"
my-app/
├── app/                      # App Router 根目录
│   ├── favicon.ico           # 站点图标
│   ├── globals.css           # 全局样式
│   ├── layout.js             # 根布局（必需）
│   ├── page.js               # 首页 /
│   └── ...
├── public/                   # 静态资源目录
│   └── next.svg
├── node_modules/
├── .next/                    # 构建产物（dev/build 都写这里）
├── .gitignore
├── AGENTS.md                 # AI 助手行为指引
├── CLAUDE.md                 # 指向 AGENTS.md
├── eslint.config.mjs         # ESLint 配置
├── next.config.ts            # Next.js 配置（默认用 TS）
├── next-env.d.ts             # Next.js 的 TS 类型声明（不进版本库）
├── package.json
├── pnpm-lock.yaml            # 或 package-lock.json
├── tsconfig.json             # TypeScript 配置
└── README.md
\`\`\`

### 3.2 顶层目录与文件说明表

| 路径 | 作用 |
|------|------|
| \`app/\` | App Router 的根，路由、布局、页面都在这里 |
| \`public/\` | 静态资源，按根路径 \`/\` 直接访问，如 \`/next.svg\` |
| \`src/\`（可选） | 应用代码目录，开启后 \`app\` 放在 \`src/app\` |
| \`next.config.ts\` | Next.js 配置文件，支持 TS 写法 |
| \`package.json\` | 依赖与脚本 |
| \`tsconfig.json\` | TS 配置，含路径别名 \`@/*\` |
| \`eslint.config.mjs\` | ESLint 扁平化配置 |
| \`proxy.ts\` | Next.js 16 请求代理（原 middleware） |
| \`instrumentation.ts\` | OpenTelemetry / 监控钩子 |
| \`.env\` / \`.env.local\` / \`.env.production\` / \`.env.development\` | 环境变量（不进版本库） |
| \`next-env.d.ts\` | Next.js 的 TS 声明，不要手改 |
| \`.next/\` | 构建产物，dev 与 build 都会写入 |

### 3.3 app/ 内部的特殊文件约定

\`app/\` 目录里的文件名是有约定的，文件名决定它的作用：

| 文件 | 作用 |
|------|------|
| \`page.js\` | 页面，让路由对外可访问 |
| \`layout.js\` | 布局，包裹子路由，导航时保留状态 |
| \`template.js\` | 与 layout 类似，但每次导航都重新挂载 |
| \`loading.js\` | 加载骨架，自动包 Suspense |
| \`error.js\` | 错误边界，捕获子树错误 |
| \`global-error.js\` | 替换根布局的全局错误边界 |
| \`not-found.js\` | 404 UI |
| \`route.js\` | API 端点（替代 Pages Router 的 API Routes） |
| \`default.js\` | 并行路由的回退 UI |

> 关键规则：**只有当某个文件夹里存在 \`page.js\` 或 \`route.js\` 时，这个路由才对外可访问**。否则它只是用来组织代码的普通文件夹，里面的工具文件不会暴露成路由。

## 四、package.json 与脚本

\`\`\`json filename="package.json"
{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  },
  "dependencies": {
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9"
  }
}
\`\`\`

四个核心脚本：

| 脚本 | 作用 |
|------|------|
| \`npm run dev\` | 启动开发服务器（默认 Turbopack，监听 3000 端口） |
| \`npm run build\` | 生产构建，输出到 \`.next/\` |
| \`npm run start\` | 以生产模式启动构建好的应用 |
| \`npm run lint\` | 运行 ESLint（16 中构建不再自动跑 lint） |

> 注意：\`next dev\` 默认就是 Turbopack，**不需要也不支持** \`--turbopack\` 标志。要退回 Webpack 用 \`next dev --webpack\`。

## 五、TypeScript 与路径别名

\`tsconfig.json\` 里默认会配好路径别名，让你用 \`@/\` 指代项目根（或 \`src/\`）：

\`\`\`json filename="tsconfig.json"
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
\`\`\`

有了它之后，可以这样写导入：

\`\`\`js filename="对比"
// 不用别名：层级深时容易数错
import { Button } from '../../../components/button'

// 用别名：清爽稳定
import { Button } from '@/components/button'
\`\`\`

Next.js 16 还内置了一个 TS 插件，提供路由相关的类型提示与自动补全。在 VS Code 里通过命令面板（\`⌘/Ctrl + Shift + P\`）搜索「TypeScript: Select TypeScript Version」并选「Use Workspace Version」即可启用。

## 六、首次启动开发服务器

\`\`\`bash filename="Terminal"
pnpm dev
# 或 npm run dev
\`\`\`

启动后会看到类似输出：

\`\`\`txt
  ▲ Next.js 16.2.9 (Turbopack)
  - Local:   http://localhost:3000
  - Network: http://192.168.1.5:3000

  Starting...
  ✓ Ready in 1.2s
\`\`\`

注意第一行的 **(Turbopack)** ——它告诉你当前用的就是 Turbopack。打开 \`http://localhost:3000\` 就能看到默认首页。修改 \`app/page.js\` 并保存，浏览器会瞬时热更新。

## 七、.next/dev 输出目录说明

\`.next/\` 是 Next.js 的构建输出目录，**dev 与 build 都会写这里**，但内容不同：

| 子目录 | 含义 |
|--------|------|
| \`.next/cache/\` | Turbopack / 构建缓存，删除后首次构建会变慢 |
| \`.next/server/\` | 服务端运行的产物（SSR、RSC payload） |
| \`.next/static/\` | 静态资源（JS chunk、CSS），通过 \`/_next/static/\` 访问 |
| \`.next/types/\` | 自动生成的路由类型（\`PageProps\`、\`LayoutProps\` 等） |

> Next.js 16 会基于你的路由结构自动生成全局类型助手 \`PageProps<'/route'>\` 和 \`LayoutProps<'/route'>\`，它们在 \`next dev\`、\`next build\` 或 \`next typegen\` 时生成，无需手写 import。

## 八、手动安装（可选）

如果不想用 CNA，也可以手动从零搭一个：

\`\`\`bash filename="Terminal"
pnpm i next@latest react@latest react-dom@latest
\`\`\`

然后手动创建 \`app/layout.js\` 和 \`app/page.js\`：

\`\`\`jsx filename="app/layout.js"
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

\`\`\`jsx filename="app/page.js"
export default function Page() {
  return <h1>Hello, Next.js 16!</h1>
}
\`\`\`

> 如果忘了创建根布局，\`next dev\` 启动时会自动补一个。但生产环境推荐显式写出 \`app/layout.js\`，并把 \`<html>\` / \`<body>\` 写在里面。

\`\`\`jsx filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
\`\`\`

运行 \`pnpm dev\` 就能访问 \`http://localhost:3000\` 看到结果。

## 九、小结

- 用 \`create-next-app\` 一条命令生成完整项目，默认开启 TS / Tailwind / ESLint / App Router / Turbopack。
- Next.js 16 中 Turbopack 是默认打包器，无需 \`--turbopack\` 标志。
- 顶层 \`app/\` 是路由根，\`public/\` 是静态资源，\`next.config.ts\` 是配置入口。
- \`app/\` 内部靠文件名约定区分作用：\`page\` / \`layout\` / \`loading\` / \`error\` / \`route\` 等。
- \`next build\` 不再自动跑 lint，需要自己加 \`lint\` 脚本。
- \`.next/\` 同时承载 dev 与 build 产物，里面的 \`types/\` 子目录自动生成路由类型助手。

下一章我们会正式进入 App Router 的世界，写第一个页面、第一个布局，并用 \`<Link>\` 在它们之间导航。
`
  },
  {
    id: "nextjs-routing",
    group: "基础入门",
    icon: "🛣️",
    title: "路由基础：布局与页面导航",
    content: `

# 路由基础：布局与页面导航

## 一、App Router 的核心约定

App Router 是 Next.js 16 的主推路由方案。它用「文件夹定义路由段、特殊文件定义 UI」的方式组织应用：

- **文件夹** = URL 段。嵌套文件夹产生嵌套路由。
- **特殊文件**（\`page.js\`、\`layout.js\`、\`loading.js\` …）= 该段的 UI 与行为。
- **只有存在 \`page.js\` 或 \`route.js\` 的文件夹才是公开路由**，否则文件夹只是组织代码用的。

| 路径 | URL | 说明 |
|------|-----|------|
| \`app/layout.tsx\` | — | 根布局，包裹所有路由 |
| \`app/page.tsx\` | \`/\` | 首页 |
| \`app/blog/page.tsx\` | \`/blog\` | 博客列表页 |
| \`app/blog/layout.tsx\` | — | 仅包裹 \`/blog\` 及其子路由 |
| \`app/blog/authors/page.tsx\` | \`/blog/authors\` | 作者页 |

## 二、创建一个页面

在 \`app/\` 下放一个 \`page.js\`，默认导出一个 React 组件，就完成了一个页面：

\`\`\`jsx filename="app/page.js"
// 默认就是 Server Component，可以直接 async 获取数据
export default function Page() {
  return <h1>Hello, Next.js 16!</h1>
}
\`\`\`

## 三、根布局（Root Layout）

\`app/layout.js\` 是**唯一必需**的特殊文件，叫根布局。它必须包含 \`<html>\` 和 \`<body>\` 标签，并接收一个 \`children\` prop——这就是当前路由渲染出来的内容。

\`\`\`jsx filename="app/layout.js"
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
\`\`\`

> 根布局包裹整个应用，**导航时不会重新渲染、不会丢失状态**。适合放全局 Header / Footer / 主题 Provider。

## 四、嵌套布局

在任何子文件夹里加 \`layout.js\`，都会形成一层嵌套布局，自动包裹该段及其子段。这是一个「多级嵌套布局」的完整 demo：

\`\`\`txt filename="目录结构"
app/
├── layout.js              # 根布局（必需）
├── page.js                # /
└── dashboard/
    ├── layout.js          # dashboard 布局
    ├── page.js            # /dashboard
    └── settings/
        ├── layout.js      # settings 布局
        └── page.js        # /dashboard/settings
\`\`\`

\`\`\`jsx filename="app/layout.js"
// 根布局：放全站 Header
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">全站导航</header>
        {children}
      </body>
    </html>
  )
}
\`\`\`

\`\`\`jsx filename="app/dashboard/layout.js"
// dashboard 布局：放侧边栏
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <aside>侧边栏：概览 / 设置</aside>
      <section>{children}</section>
    </div>
  )
}
\`\`\`

\`\`\`jsx filename="app/dashboard/settings/layout.js"
// settings 布局：放设置页 tab
export default function SettingsLayout({ children }) {
  return (
    <div className="settings">
      <nav>账号 / 安全 / 通知</nav>
      <div>{children}</div>
    </div>
  )
}
\`\`\`

访问 \`/dashboard/settings\` 时，渲染层级是：

\`\`\`
RootLayout → DashboardLayout → SettingsLayout → page
\`\`\`

每一层布局在跨同级页面导航时都会**保持挂载、不重新渲染**，状态得以保留。

## 五、layout vs template

\`template.js\` 和 \`layout.js\` 几乎一样，唯一区别是：**\`template\` 每次导航都会重新挂载**，状态不保留。当你希望「每次进入都重新初始化」时用 template。

\`\`\`jsx filename="app/dashboard/template.js"
export default function DashboardTemplate({ children }) {
  // 每次进入 /dashboard/* 都会重新挂载
  return <div>{children}</div>
}
\`\`\`

组件渲染顺序：\`layout → template → error → loading → page\`。

## 六、用 <Link> 在页面间导航

\`<Link>\` 是 \`next/link\` 导出的内置组件，扩展自 HTML \`<a>\` 标签，提供**预取（prefetch）**与**客户端导航（client-side transition）**。它是 Next.js 中页面间导航的首选方式。

\`\`\`jsx filename="app/page.js"
import Link from 'next/link'

export default function Page() {
  return (
    <nav>
      <Link href="/dashboard">进入控制台</Link>
      <Link href="/blog">博客</Link>
    </nav>
  )
}
\`\`\`

> 不要用原生 \`<a>\` 做站内跳转——它会触发整页刷新，丢失状态、重置滚动。站内跳转一律用 \`<Link>\`。

### 6.1 常用 props

| Prop | 类型 | 默认 | 作用 |
|------|------|------|------|
| \`href\` | string \| object | 必填 | 目标路径或 URL 对象 |
| \`replace\` | boolean | false | 用 history.replaceState 替换当前记录 |
| \`scroll\` | boolean | true | 导航后是否滚动到顶部 |
| \`prefetch\` | boolean \| null | null（auto） | 是否预取目标路由 |
| \`onNavigate\` | function | — | 客户端导航时触发，可调用 \`e.preventDefault()\` 阻止 |
| \`transitionTypes\` | string[] | — | 16.2+ 新增，配合 \`<ViewTransition>\` 做动画 |

### 6.2 用对象形式带 query

\`\`\`jsx filename="app/page.js"
import Link from 'next/link'

export default function Page() {
  return (
    <Link
      href={{
        pathname: '/about',
        query: { name: 'test' },
      }}
    >
      关于?name=test
    </Link>
  )
}
\`\`\`

## 七、导航栏 active 状态（Demo）

\`<Link>\` 本身不知道自己是否「当前路由」。要判断 active，需要用 \`usePathname()\` 钩子——它只能在 Client Component 里用，所以要加 \`'use client'\`。

\`\`\`jsx filename="app/components/nav-links.js"
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '博客' },
  { href: '/about', label: '关于' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="nav">
      {links.map((link) => {
        // 完全匹配，或当前路径以该链接开头（处理子路由）
        const isActive =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={isActive ? 'nav-link active' : 'nav-link'}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
\`\`\`

然后在根布局里使用它：

\`\`\`jsx filename="app/layout.js"
import NavLinks from '@/app/components/nav-links'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <NavLinks />
        <main>{children}</main>
      </body>
    </html>
  )
}
\`\`\`

## 八、编程式导航（Demo）

需要按钮、表单提交后跳转、或条件跳转时，用 \`useRouter()\`：

\`\`\`jsx filename="app/components/login-form.js"
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // 登录成功后跳转到 dashboard
    // 第二个参数可控制是否滚动：{ scroll: false }
    router.push('/dashboard')
  }

  function handleReplace() {
    // replace：替换当前历史记录，用户按「返回」回不到登录页
    router.replace('/dashboard')
  }

  function handleBack() {
    router.back()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="用户名"
      />
      <button type="submit">登录</button>
      <button type="button" onClick={handleBack}>返回</button>
    </form>
  )
}
\`\`\`

\`useRouter\` 必须在 Client Component 中使用。常用方法：

| 方法 | 作用 |
|------|------|
| \`router.push(href, options?)\` | 推入一条新历史记录并导航 |
| \`router.replace(href, options?)\` | 替换当前历史记录 |
| \`router.back()\` | 等价于浏览器「后退」 |
| \`router.forward()\` | 等价于浏览器「前进」 |
| \`router.refresh()\` | 刷新当前路由（重新请求 RSC payload） |

## 九、预取（Prefetch）行为

\`<Link>\` 进入视口时会自动预取目标路由，让点击几乎瞬时。Next.js 16 的预取策略按路由类型区分：

| 路由类型 | \`prefetch\` 默认（auto/null） | \`prefetch={true}\` | \`prefetch={false}\` |
|---------|------------------------------|--------------------|---------------------|
| 静态路由 | 预取完整路由 + 数据 | 预取完整路由 + 数据 | 不预取（点击时才取） |
| 动态路由 | 跳过，或预取到最近的 \`loading.js\` | 预取完整路由 | 不预取 |

预取**只在生产环境生效**，开发环境不会预取（避免干扰调试）。

### 9.1 关闭预取

大列表里成百上千个 \`<Link>\` 同时预取会浪费带宽，可以关掉：

\`\`\`jsx filename="app/blog/post-list.js"
import Link from 'next/link'

export default function PostList({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {/* 列表场景关闭预取，避免一次性拉取太多 */}
          <Link href={\`/blog/\${post.slug}\`} prefetch={false}>
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

### 9.2 仅 hover 时预取（折中方案）

想省资源但又不牺牲太多体验，可以只在鼠标悬停时开启预取：

\`\`\`jsx filename="app/components/hover-prefetch-link.js"
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HoverPrefetchLink({ href, children }) {
  const [active, setActive] = useState(false)
  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
    >
      {children}
    </Link>
  )
}
\`\`\`

## 十、滚动行为与 data-scroll-behavior

Next.js 中 \`<Link>\` 的默认滚动行为是**保持滚动位置**（类似浏览器的前进/后退）。如果目标页面在视口内不可见，才会滚到第一个 Page 元素顶部。

\`\`\`jsx filename="app/page.js"
import Link from 'next/link'

export default function Page() {
  return (
    <>
      {/* 默认行为：滚到页面顶部 */}
      <Link href="/dashboard">Dashboard</Link>

      {/* 显式关闭滚动，保持当前滚动位置 */}
      <Link href="/#hash" scroll={false}>
        不滚动
      </Link>
    </>
  )
}
\`\`\`

### 10.1 滚动到指定 id

\`<Link>\` 渲染成 \`<a>\`，所以可以直接带 hash：

\`\`\`jsx
<Link href="/dashboard#settings">设置</Link>
// 输出：<a href="/dashboard#settings">设置</a>
\`\`\`

### 10.2 sticky header 的滚动偏移

如果布局里有 sticky/fixed 的 Header，跳转后内容可能被遮挡。Next.js 会自动跳过 sticky / fixed 元素，找到真正的滚动目标。可以用 CSS 给滚动容器加偏移：

\`\`\`css filename="app/globals.css"
html {
  /* 与 sticky header 高度对齐 */
  scroll-padding-top: 64px;
}
\`\`\`

也可以给单个目标元素加 \`scroll-margin-top\`。

### 10.3 通过 CSS 控制滚动行为

Next.js 的 \`<Link>\` 组件本身不提供精细的滚动行为控制，但可以结合 CSS 实现：

| CSS 属性 | 作用 |
| --- | --- |
| \`scroll-behavior: smooth\` | 平滑滚动到目标位置 |
| \`scroll-padding-top: 80px\` | 滚动时预留顶部偏移（固定导航栏场景） |
| \`scroll-snap-type\` | 滚动捕捉行为 |

\`\`\`css
/* 全局平滑滚动 */
html { scroll-behavior: smooth; }

/* 有固定导航栏时，滚动目标预留空间 */
html { scroll-padding-top: 80px; }
\`\`\`

\`\`\`jsx
// Link 默认会滚动到目标，可通过 scroll={false} 禁用
<Link href="/dashboard#settings" scroll={false}>
  设置
</Link>
\`\`\`

> 注意：\`<Link>\` 的 \`scroll\` prop 只能控制是否滚动（true/false），无法控制滚动方式。精细控制需依赖 CSS。

## 十一、小结

- 文件夹定义路由段，\`page.js\` 让段对外可访问，\`layout.js\` 嵌套包裹且保留状态。
- 根布局必需，必须含 \`<html>\` / \`<body>\`；\`template.js\` 每次导航都重新挂载。
- 站内导航用 \`<Link>\`，不要用 \`<a>\`；\`useRouter\` 用于编程式导航。
- 预取默认开启且按路由类型分级；大列表用 \`prefetch={false}\` 或 hover 预取。
- 滚动行为：默认保持位置，\`scroll={false}\` 关闭，\`data-scroll-behavior\` 做精细控制。
- active 状态靠 \`usePathname()\` 判断（注意要 \`'use client'\`）。

下一章我们会深入 Server / Client 组件模型，看看这些布局和页面背后的渲染机制。
`
  },
  {
    id: "nextjs-rsc",
    group: "基础入门",
    icon: "⚛️",
    title: "Server 与 Client 组件深度解析",
    content: `

# Server 与 Client 组件深度解析

## 一、为什么要有两套组件

传统 React SPA 把所有组件都在浏览器里跑，导致首屏要下载并执行大量 JS，体验差、SEO 弱。React 19 的 **React Server Components（RSC）** 把组件拆成两类：

- **Server Component**：在服务器上运行，能直接访问数据库、文件系统、密钥，输出的是序列化数据，**不携带任何 JS 到客户端**。
- **Client Component**：在浏览器里运行，能使用 state、事件、浏览器 API，会被打包进客户端 bundle。

在 Next.js 16 的 App Router 里，**所有组件默认都是 Server Component**，只有需要交互或浏览器能力时，才显式声明为 Client Component。这个默认值的反转，是 App Router 与 Pages Router 最本质的区别之一。

## 二、何时用哪种组件

| 场景 | 用哪种 |
|------|--------|
| 读取数据库 / 调用内部 API / 读文件 | Server Component |
| 使用密钥、Token、私有环境变量 | Server Component |
| 需要减少客户端 JS 体积 | Server Component |
| 需要 \`onClick\` / \`onChange\` 等事件 | Client Component |
| 用 \`useState\` / \`useReducer\` / \`useEffect\` | Client Component |
| 访问 \`window\` / \`localStorage\` / \`navigator\` | Client Component |
| 使用 React Context（\`createContext\`） | Client Component |
| 使用第三方依赖了浏览器 API 的组件 | Client Component（或包装） |

## 三、RSC 的工作原理

### 3.1 RSC Payload

Server Component 渲染时，并不会产出 HTML，而是产出一个叫 **RSC Payload** 的紧凑二进制数据，包含：

- Server Component 的渲染结果
- Client Component 的占位符与对应 JS 文件引用
- 从 Server Component 传给 Client Component 的 props

### 3.2 首次加载

1. 服务器生成 **HTML**（快速可见的非交互预览）+ **RSC Payload**。
2. 浏览器先渲染 HTML，看到内容。
3. 加载 JS，**hydrate** Client Component，让页面可交互。
4. React 用 RSC Payload 把 Server / Client 两棵树 reconcile 起来。

### 3.3 后续导航

- 预取并缓存 **RSC Payload**，做到瞬时导航。
- Client Component 完全在客户端渲染，**不再需要服务端 HTML**。

## 四、'use client' 指令与模块图边界

在文件**第一行**（任何 import 之前）写 \`'use client'\`，就把这个文件标记为 Client Component。它会创建一个**客户端模块图的边界**：

\`\`\`jsx filename="app/ui/counter.js"
'use client' // ← 边界：从这开始进入客户端模块图

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>当前计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
\`\`\`

> **关键理解**：一旦文件被标为 \`'use client'\`，**它 import 的所有模块也都进入客户端 bundle**。所以你不需要给每个子组件都加指令，但也要小心别让一个 Client Component 拖进大量依赖。

对应的 \`'use server'\` 指令标记「可从客户端调用的服务端函数」（Server Actions），入门阶段先记住它的存在即可。

## 五、Demo 1：Counter 客户端组件

最常见的交互场景。Server Component 获取数据，传给 Client Component 处理交互：

\`\`\`jsx filename="app/page.js"
// 默认是 Server Component，可以 async
import Counter from '@/app/ui/counter'
import { getInitialLikes } from '@/lib/data'

export default async function Page() {
  const initial = await getInitialLikes()
  return (
    <article>
      <h1>欢迎</h1>
      {/* 把服务端取到的数据作为 props 传给客户端组件 */}
      <Counter initial={initial} />
    </article>
  )
}
\`\`\`

\`\`\`jsx filename="app/ui/counter.js"
'use client'

import { useState } from 'react'

export default function Counter({ initial }) {
  const [count, setCount] = useState(initial)
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      点赞 {count}
    </button>
  )
}
\`\`\`

## 六、组件交错：children slot 模式

不能在 Server Component 里直接 import 一个 Client Component、又反过来在 Client Component 里 import Server Component——那会破坏边界。但你可以**把 Server Component 作为 children 传给 Client Component**，这是 RSC 最强大的组合模式。

### 6.1 Demo 2：Modal + Cart 交错

需求：\`<Modal>\` 需要 \`useState\` 控制显隐，是 Client Component；\`<Cart>\` 需要在服务端读取购物车数据，是 Server Component。如何让 Cart 显示在 Modal 里？

\`\`\`jsx filename="app/ui/modal.js"
'use client'

import { useState } from 'react'

export default function Modal({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>打开购物车</button>
      {open && (
        <div className="modal">
          <button onClick={() => setOpen(false)}>关闭</button>
          {/* children 由父级 Server Component 渲染好后传入 */}
          {children}
        </div>
      )}
    </>
  )
}
\`\`\`

\`\`\`jsx filename="app/ui/cart.js"
// Server Component：直接读数据库 / API
import { getCartItems } from '@/lib/data'

export default async function Cart() {
  const items = await getCartItems()
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name} × {item.qty}</li>
      ))}
    </ul>
  )
}
\`\`\`

\`\`\`jsx filename="app/page.js"
// 父级 Server Component：把 <Cart /> 当作 children 传给 <Modal>
import Modal from '@/app/ui/modal'
import Cart from '@/app/ui/cart'

export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  )
}
\`\`\`

原理：\`<Cart />\` 在服务端先渲染成 RSC Payload，再作为 \`children\` 注入到 \`<Modal>\` 里。\`<Modal>\` 拿到的是已经渲染好的结果，不需要把 \`<Cart>\` 拉进客户端 bundle。这种「slot 模式」是绕开边界限制的标准做法。

## 七、Demo 3：ThemeProvider（Context Provider 模式）

React Context 在 Server Component 中**不支持**（因为服务端没有跨请求的「共享状态」概念）。要用 Context，必须套一层 Client Component 当 Provider：

\`\`\`jsx filename="app/theme-provider.js"
'use client'

import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
\`\`\`

然后在根布局里包裹 \`{children}\`：

\`\`\`jsx filename="app/layout.js"
import ThemeProvider from '@/app/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
\`\`\`

> Provider 要尽可能**深地**包在树里——只包 \`{children}\` 而不是整个 \`<html>\`，能让 Next.js 更好地优化静态部分。

## 八、Demo 4：包装第三方 Carousel

第三方组件 \`<Carousel />\` 内部用了 \`useState\`，但没有标 \`'use client'\`。直接在 Server Component 里用会报错。解决办法：写一层 Client Component 包装。

\`\`\`jsx filename="app/carousel.js"
'use client'

// 直接 re-export，把它「拉进」客户端模块图
export { Carousel as default } from 'acme-carousel'
\`\`\`

\`\`\`jsx filename="app/page.js"
import Carousel from '@/app/carousel'

export default function Page() {
  return (
    <div>
      <h1>图集</h1>
      <Carousel />
    </div>
  )
}
\`\`\`

> **给库作者的建议**：如果库里某个入口依赖了客户端能力，直接在那个入口文件顶部加 \`'use client'\`，使用者就不用再写包装层。

## 九、server-only / client-only 包

有些代码绝对不能跨环境运行：比如包含 \`API_KEY\` 的 \`lib/data.js\` 不能进客户端 bundle；用了 \`window\` 的 hook 不能在服务端跑。Next.js 提供 \`server-only\` / \`client-only\` 两个标记包（**安装是可选的**，Next.js 内部已经处理了它们的导入）。

\`\`\`js filename="lib/data.js"
import 'server-only' // 一旦被 Client Component 引入，编译期就报错

export async function getData() {
  const res = await fetch('https://api.example.com/data', {
    headers: { authorization: process.env.API_KEY },
  })
  return res.json()
}
\`\`\`

\`\`\`js filename="app/ui/use-window-size.js"
import 'client-only' // 防止在 Server Component 里误用
import { useEffect, useState } from 'react'

export function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useEffect(() => {
    setSize([window.innerWidth, window.innerHeight])
  }, [])
  return size
}
\`\`\`

\`\`\`bash filename="安装（可选）"
pnpm add server-only client-only
\`\`\`

## 十、Props 可序列化要求

从 Server Component 传给 Client Component 的 props 必须是**可序列化**的。允许的类型包括：基本类型、Plain Object、Array、Date、Map、Set、RegExp、Promise、Symbol 等。**不能传函数、Class 实例、React 元素以外的复杂对象**。

\`\`\`jsx filename="app/page.js"
import LikeButton from '@/app/ui/like-button'

export default async function Page() {
  const post = await getPost()
  return (
    <>
      {/* ✅ 数字、字符串、数组、对象都行 */}
      <LikeButton likes={post.likes} title={post.title} tags={post.tags} />

      {/* ❌ 不能传函数 */}
      {/* <LikeButton onClick={(e) => console.log(e)} /> */}
    </>
  )
}
\`\`\`

如果确实需要把「回调」从客户端传回服务端，请使用 Server Actions（\`'use server'\`）。

## 十一、减少客户端 bundle 的技巧

1. **默认 Server Component**：能放服务端的就放服务端，不要无脑加 \`'use client'\`。
2. **最小化边界**：只在真正交互的最小组件上加 \`'use client'\`，而不是整个页面 / 整个布局。
3. **children slot 模式**：让 Client Component 包裹 Server Component，而不是反过来。
4. **下沉 Provider**：Provider 尽量包在树深处。
5. **动态导入重依赖**：用 \`next/dynamic\` 按需加载图表、编辑器等大组件。
6. **\`@next/bundle-analyzer\`**：可视化检查 client bundle，找出意外被拉进来的依赖。

### 11.1 一个 Layout 里只把交互部分标 client

\`\`\`jsx filename="app/layout.js"
// Search 是 Client Component，Logo 是 Server Component
// Layout 本身是 Server Component
import Search from '@/app/ui/search'
import Logo from '@/app/ui/logo'

export default function Layout({ children }) {
  return (
    <>
      <nav>
        <Logo />
        <Search />
      </nav>
      <main>{children}</main>
    </>
  )
}
\`\`\`

这样只有 \`<Search>\`（及其依赖）会进客户端 bundle，\`<Logo>\` 和布局壳子完全留在服务端。

## 十二、小结

- App Router 中组件**默认是 Server Component**，需要交互才加 \`'use client'\`。
- Server Component 输出 RSC Payload，不含 JS；Client Component 进客户端 bundle。
- \`'use client'\` 定义**模块图边界**，其后所有 import 都进客户端。
- Server → Client 用 props 传可序列化数据；Client 包 Server 用 children slot 模式。
- Context 必须放在 Client Component Provider 里，并在 layout 里深包一层。
- 第三方无指令组件用一层 Client 包装；敏感代码用 \`server-only\` / \`client-only\` 防止误用。
- 减少 bundle 的核心：默认服务端、最小边界、children slot、下沉 Provider。

掌握 RSC 模型后，下一章我们处理动态路由——以及 Next.js 16 中 \`params\` 是 Promise 这个最容易踩坑的变更。
`
  },
  {
    id: "nextjs-dynamic-routes",
    group: "基础入门",
    icon: "🎯",
    title: "动态路由与路由组",
    content: `

# 动态路由与路由组

## 一、为什么需要动态路由

如果每个页面都手写一个 \`page.js\`，博客有 1000 篇文章就要 1000 个文件，电商有几万个 SKU 就完全没法维护。**动态路由**让你用一个模板文件匹配无数个 URL，参数从 URL 中读取。

## 二、动态段的几种形式

把文件夹名用方括号包起来，就成了动态段。Next.js 提供三种形式：

| 形式 | 写法 | 示例路径 | 匹配的 URL |
|------|------|---------|-----------|
| 单段动态 | \`[slug]\` | \`app/blog/[slug]/page.js\` | \`/blog/a\`、\`/blog/b\` |
| catch-all | \`[...slug]\` | \`app/shop/[...slug]/page.js\` | \`/shop/a\`、\`/shop/a/b\`、\`/shop/a/b/c\` |
| optional catch-all | \`[[...slug]]\` | \`app/docs/[[...slug]]/page.js\` | \`/docs\`、\`/docs/a\`、\`/docs/a/b\` |

### 2.1 单段动态 \`[slug]\`

\`\`\`txt filename="示例"
app/blog/[slug]/page.js
  /blog/hello-world   → params = { slug: 'hello-world' }
  /blog/nextjs-16     → params = { slug: 'nextjs-16' }
\`\`\`

### 2.2 catch-all \`[...slug]\`

匹配「至少一段」的任意层级，\`params.slug\` 是数组：

\`\`\`txt filename="示例"
app/shop/[...slug]/page.js
  /shop/clothes            → params = { slug: ['clothes'] }
  /shop/clothes/shirts     → params = { slug: ['clothes', 'shirts'] }
  /shop/clothes/shirts/red → params = { slug: ['clothes', 'shirts', 'red'] }
\`\`\`

### 2.3 optional catch-all \`[[...slug]]\`

在 catch-all 基础上**额外匹配「零段」**（即不带参数的路径）：

\`\`\`txt filename="示例"
app/docs/[[...slug]]/page.js
  /docs                → params = { slug: undefined }
  /docs/getting-started → params = { slug: ['getting-started'] }
  /docs/api/use         → params = { slug: ['api', 'use'] }
\`\`\`

> 文档站常用 optional catch-all：一个文件同时承担 \`/docs\` 首页和 \`/docs/xxx/yyy\` 详情页。

## 三、Next.js 16 关键变更：params 是 Promise

这是从旧版迁移最容易踩的坑。**Next.js 16 中 \`params\` 是一个 Promise，必须 \`await\` 才能拿到值**。Next.js 14 及更早版本里 \`params\` 是同步对象；15 引入 Promise 但保留同步兼容；16 中彻底转为异步。

\`\`\`jsx filename="app/blog/[slug]/page.js"
// ✅ Next.js 16 正确写法
export default async function Page({ params }) {
  const { slug } = await params
  return <h1>文章：{slug}</h1>
}

// ❌ 旧写法，16 中会拿到 Promise 对象而不是 { slug }
// export default function Page({ params }) {
//   return <h1>{params.slug}</h1>
// }
\`\`\`

\`searchParams\` 同样是 Promise：

\`\`\`jsx filename="app/page.js"
export default async function Page({ searchParams }) {
  const { page = '1' } = await searchParams
  return <p>当前页：{page}</p>
}
\`\`\`

> 使用 \`searchParams\` 会让页面进入**动态渲染**（因为必须等请求来才能读 query string）。

## 四、TypeScript：PageProps 类型助手

Next.js 16 会根据你的路由结构自动生成全局类型助手 \`PageProps<'/route'>\` 和 \`LayoutProps<'/route'>\`，**无需 import**，在 \`next dev\` / \`next build\` / \`next typegen\` 时生成。

\`\`\`tsx filename="app/blog/[slug]/page.tsx"
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>文章：{slug}</h1>
}
\`\`\`

\`\`\`tsx filename="app/dashboard/layout.tsx"
export default function Layout(props: LayoutProps<'/dashboard'>) {
  return <section>{props.children}</section>
}
\`\`\`

不同形式动态段的 \`params\` 类型：

| 路由 | params 类型 |
|------|------------|
| \`app/blog/[slug]/page.js\` | \`{ slug: string }\` |
| \`app/shop/[...slug]/page.js\` | \`{ slug: string[] }\` |
| \`app/shop/[[...slug]]/page.js\` | \`{ slug?: string[] }\` |
| \`app/[categoryId]/[itemId]/page.js\` | \`{ categoryId: string, itemId: string }\` |

> 静态路由的 \`params\` 解析为 \`{}\`。

## 五、Demo 1：博客 [slug] 页面（await params）

一个完整的博客详情页，包含数据获取、404 处理、元信息生成：

\`\`\`jsx filename="app/blog/[slug]/page.js"
import { notFound } from 'next/navigation'

// 模拟数据库
async function getPost(slug) {
  const posts = {
    'hello-world': { title: 'Hello World', content: '第一篇...' },
    'nextjs-16':   { title: 'Next.js 16 新特性', content: '...' },
  }
  return posts[slug] || null
}

// 生成元信息（注意 params 也是 Promise）
export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  return post ? { title: post.title } : { title: '未找到' }
}

export default async function BlogPostPage({ params }) {
  // ✅ Next.js 16：必须 await
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound() // 触发 not-found.js

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
\`\`\`

## 六、Demo 2：电商 [...slug] catch-all

电商分类页要兼容任意层级：\`/shop/clothes\`、\`/shop/clothes/shirts\`、\`/shop/clothes/shirts/red\`。

\`\`\`jsx filename="app/shop/[...slug]/page.js"
export default async function Page({ params }) {
  // params.slug 是数组，如 ['clothes', 'shirts', 'red']
  const { slug } = await params
  const path = slug.join('/')

  // 根据 path 查询对应分类或商品
  const data = await fetchCategoryOrProduct(path)

  if (data.type === 'product') {
    return <ProductDetail product={data} />
  }
  return <CategoryList category={data} />
}

async function fetchCategoryOrProduct(path) {
  // ...省略实现
  return { type: 'product', name: path }
}

function ProductDetail({ product }) {
  return <h1>商品：{product.name}</h1>
}

function CategoryList({ category }) {
  return <h1>分类：{category.name}</h1>
}
\`\`\`

## 七、generateStaticParams：构建时预生成

动态路由默认是「请求时渲染」。如果想**在构建时就预生成**所有（或部分）页面，用 \`generateStaticParams\`。

\`\`\`jsx filename="app/blog/[slug]/page.js"
// 构建时执行，返回所有需要预生成的 params
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then((r) => r.json())
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Page({ params }) {
  const { slug } = await params
  // ...
}
\`\`\`

\`generateStaticParams\` 内部用 \`fetch\` 时会自动去重，避免对同一数据多次请求，加快构建。

> 还可以给动态 Route Handler 预生成 API 响应，把 GET 接口也静态化。

## 八、Client Component 中读 params

在 Client Component 里读 \`params\`，用 React 19 的 \`use()\` 解包 Promise，或用 \`useParams()\` 钩子。

\`\`\`jsx filename="app/blog/[slug]/page.js"
'use client'
import { use } from 'react'

export default function BlogPostPage({ params }) {
  // use() 解包 Promise
  const { slug } = use(params)
  return <p>slug 是：{slug}</p>
}
\`\`\`

\`\`\`jsx filename="app/ui/show-slug.js"
'use client'
import { useParams } from 'next/navigation'

export default function ShowSlug() {
  // 任意位置都能拿，不依赖 props
  const { slug } = useParams()
  return <span>当前 slug：{slug}</span>
}
\`\`\`

## 九、路由组（Route Groups）

### 9.1 约定

把文件夹名用**圆括号**包起来 \`(folderName)\`，就成了路由组。它**仅用于组织代码，不影响 URL**：

\`\`\`txt filename="示例"
app/(marketing)/page.js   → URL 是 /       （不是 /marketing）
app/(shop)/cart/page.js   → URL 是 /cart   （不是 /shop/cart）
\`\`\`

### 9.2 用途

- **按团队 / 功能分区**：marketing、shop、admin 各自一组。
- **同一 URL 层级下用不同布局**：\`(marketing)\` 和 \`(shop)\` 各有自己的 layout。
- **创建多个根布局**：删掉顶层 \`layout.js\`，在每个组里放一个 layout（含 \`<html>\` / \`<body>\`）。

### 9.3 注意事项

- 不同路由组里的路由**不能解析到同一个 URL**，否则报错。比如 \`(marketing)/about/page.js\` 和 \`(shop)/about/page.js\` 都解析成 \`/about\` 会冲突。
- 在不同根布局组之间导航会触发**整页刷新**（因为是不同的 \`<html>\` 文档）。
- 用多个根布局时，首页 \`/\` 必须落在其中一个组里，例如 \`app/(marketing)/page.js\`。

## 十、Demo 3：用路由组组织 marketing / (app) 结构

一个典型站点：营销页（首页、关于、定价）和产品页（控制台、设置）需要完全不同的布局和导航。

\`\`\`txt filename="目录结构"
app/
├── (marketing)/
│   ├── layout.js       # 营销布局：顶部导航 + 大 banner
│   ├── page.js         # /
│   ├── about/page.js   # /about
│   └── pricing/page.js # /pricing
├── (app)/
│   ├── layout.js       # 应用布局：侧边栏 + 顶栏
│   ├── dashboard/page.js  # /dashboard
│   └── settings/page.js   # /settings
└── layout.js           # 顶层根布局（可选，若多根布局则删掉）
\`\`\`

\`\`\`jsx filename="app/(marketing)/layout.js"
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing">
      <header>产品 | 定价 | 关于</header>
      {children}
      <footer>版权所有</footer>
    </div>
  )
}
\`\`\`

\`\`\`jsx filename="app/(app)/layout.js"
export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <aside>控制台 / 设置 / 退出</aside>
      <main>{children}</main>
    </div>
  )
}
\`\`\`

\`\`\`jsx filename="app/(marketing)/page.js"
export default function Home() {
  return <h1>首页：欢迎来到我们的产品</h1>
}
\`\`\`

\`\`\`jsx filename="app/(app)/dashboard/page.js"
export default function Dashboard() {
  return <h1>控制台：今日数据概览</h1>
}
\`\`\`

URL 与文件夹名「\`(marketing)\`」「\`(app)\`」无关，访问路径就是 \`/\`、\`/about\`、\`/pricing\`、\`/dashboard\`、\`/settings\`。两套布局互不干扰，但 URL 是干净的。

## 十一、完整示例：博客动态路由 + 路由组

把动态路由和路由组结合：博客后台用 \`/(admin)\` 分组，前台用 \`/(site)\` 分组。

\`\`\`txt filename="结构"
app/
├── (site)/
│   ├── layout.js
│   ├── page.js                 # /
│   └── blog/[slug]/page.js     # /blog/:slug
└── (admin)/
    ├── layout.js
    └── posts/[id]/page.js      # /posts/:id
\`\`\`

\`\`\`jsx filename="app/(site)/blog/[slug]/page.js"
export default async function Page({ params }) {
  const { slug } = await params
  return <h1>前台文章：{slug}</h1>
}
\`\`\`

\`\`\`jsx filename="app/(admin)/posts/[id]/page.js"
export default async function Page({ params }) {
  const { id } = await params
  return <h1>后台编辑文章 #{id}</h1>
}
\`\`\`

两套布局、两套 URL、零冲突。

## 十二、Cache Components 与 params（进阶预告）

当你开启 Next.js 16 的 Cache Components 时，params 的处理会更细：

- **没有 \`generateStaticParams\`**：params 是运行时数据，必须用 \`<Suspense>\` 包裹访问位置（或用 \`loading.js\` 做页面级 fallback）。
- **有 \`generateStaticParams\`**：构建时用样本 params 验证并预生成；运行时首次请求未列出的 params 会按需渲染并落盘。

这部分属于进阶内容，会在缓存章节展开。入门阶段只要记住：**先 \`await params\`，再做事**。

## 十三、小结

- 三种动态段：\`[slug]\` 单段、\`[...slug]\` catch-all、\`[[...slug]]\` optional catch-all。
- **Next.js 16 中 \`params\` 与 \`searchParams\` 都是 Promise，必须 \`await\`**，这是 16 最重要的破坏性变更之一。
- 用 \`generateStaticParams\` 在构建时预生成动态路由；用 \`generateMetadata\` 生成动态元信息（params 同样要 await）。
- TypeScript 用 \`PageProps<'/route'>\` / \`LayoutProps<'/route'>\` 全局类型助手，无需 import。
- Client Component 读 params 用 \`use(params)\` 或 \`useParams()\`。
- 路由组 \`(folder)\` 仅用于组织代码、不影响 URL，可用来按团队分区或创建多套布局。
- 路由组之间不能解析到同一 URL；不同根布局组之间导航会整页刷新。

至此，基础入门篇 5 章全部完成。你已经掌握了 Next.js 16 的全貌、项目结构、路由与布局、Server/Client 组件模型、动态路由与路由组——具备了进入进阶篇（数据获取、缓存、部署、性能优化）的全部前置知识。
`
  }
];
