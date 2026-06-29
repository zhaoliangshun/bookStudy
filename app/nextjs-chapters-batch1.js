// =============================================================
// Next.js 16 教程 - 第 1 批章节（基础入门篇 5 章）
// -------------------------------------------------------------
// 覆盖 Next.js 16 的核心入门内容：全景概览、安装与项目结构、
// 路由基础与布局导航、Server/Client 组件、动态路由与路由组。
// 所有内容基于 Next.js 16.2.9 + React 19.2.4 的实际 API 编写，
// 重点突出 Next.js 16 的破坏性变更（Turbopack 默认、params 为
// Promise、middleware 改为 proxy、React Compiler 等）。
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
| React 版本 | 使用 \`package.json\` 里的 React | 内置 React canary（含 React 19 全部稳定特性） |
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

Next.js 16 内置 React 19.2（App Router 使用 React canary，已包含 React 19 全部稳定特性），并默认启用了若干 React 19 能力，例如：

- **Actions**：表单与异步操作的标准化处理。
- **\`use()\` API**：在组件中读取 Promise / Context。
- **React Compiler**（可选）：通过 \`create-next-app\` 时勾选 React Compiler，可以让编译器自动优化 memoization，减少手写 \`useMemo\` / \`useCallback\` 的负担。
- **\`cacheComponents\` 配置**：开启后，Next.js 会自动对可缓存的组件做更细粒度的缓存优化，进一步减少重复渲染。

### 2.4 middleware 改名为 proxy

Next.js 16 把运行在请求边缘的 \`middleware.ts\` **重命名为 \`proxy.ts\`**，更准确地表达它的语义：它在「请求被路由到页面之前」做拦截、重写、重定向，本质上是一个请求代理层。文件约定、签名基本一致，但目录顶级文件变成了 \`proxy.ts\`。

### 2.5 构建不再自动跑 lint

从 Next.js 16 起，\`next build\` **不再自动运行 linter**。你需要自己在 \`package.json\` 里配 \`lint\` 脚本，通过 CI 或