// =============================================================
// Next.js 16 交互式教程 —— 第二批章节（数据与交互篇，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. nextjs-fetching         — 数据获取：fetch 缓存与并发
//   2. nextjs-mutating         — 数据变更与 Server Actions
//   3. nextjs-loading          — 加载状态与流式渲染
//   4. nextjs-error            — 错误处理与恢复策略
//   5. nextjs-route-handlers   — Route Handlers：构建 API
//
// 基于版本：Next.js 16.2.9 + React 19.2.4
// 注意：Next.js 16 包含破坏性变更，API 与旧版本不同
//   - params 是 Promise，必须 await
//   - cookies() / headers() 是异步函数，必须 await
//   - fetch 默认不缓存
//   - use cache 指令 + cacheLife 函数用于显式缓存
//   - error.js 使用 unstable_retry（v16.2.0 新增）
//   - revalidateTag 第二参数 cacheLife（Next.js 16）
//   - updateTag 新 API（read-your-writes 一致性）
//   - refresh 从 next/cache 导入
//   - useActionState（替代旧 useFormState）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：数据获取：fetch 缓存与并发
  // =========================================================
  {
    id: "nextjs-fetching",
    group: "数据与交互",
    icon: "📥",
    title: "数据获取：fetch 缓存与并发",
    content: `
# 数据获取：fetch 缓存与并发

在 Next.js 16 中，**数据获取（Data Fetching）** 是构建应用最核心的能力之一。与传统的 Pages Router 不同，App Router 允许你直接在 **Server Component（服务端组件）** 中使用 \`async/await\` 获取数据，而无需依赖 \`getServerSideProps\`、\`getStaticProps\` 等特殊函数。本章将系统讲解 Next.js 16 中的取数模型：从基础的 \`fetch\` 用法，到缓存策略、并发优化、流式渲染，再到客户端取数方案。

## 一、Server Component 中取数

### 1.1 基础：async/await

在 App Router 中，任何 **Server Component** 都可以是一个异步函数。你只需要把组件声明为 \`async function\`，然后在里面 \`await\` 任何异步操作即可：

\`\`\`tsx filename="app/blog/page.tsx"
// Server Component 默认就是服务端组件，无需 'use server'
export default async function Page() {
  // 直接使用原生 fetch API
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

由于 Server Component 运行在服务器上，数据库凭证、API Key 等敏感信息不会被打包到客户端 bundle 中，所以你也可以直接使用 ORM 或数据库客户端：

\`\`\`tsx filename="app/blog/page.tsx"
import { db, posts } from '@/lib/db'

export default async function Page() {
  // 直接查询数据库，凭证留在服务端
  const allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

### 1.2 fetch 的默认缓存行为（Next.js 16 重大变更）

⚠️ **重要变更**：在 Next.js 16 中，\`fetch\` 请求**默认不再被缓存**，会阻止页面渲染直到请求完成。这与早期版本（Next.js 13/14 默认 \`force-cache\`）完全不同。

| 行为 | Next.js 13/14 | Next.js 16 |
| --- | --- | --- |
| 默认缓存策略 | \`force-cache\`（缓存） | 不缓存（每次请求都重新获取） |
| 渲染阻塞 | 缓存命中时不阻塞 | 默认阻塞页面渲染 |
| 显式缓存方式 | \`cache: 'force-cache'\` | \`use cache\` 指令 + \`cacheLife\` |
| 流式取数 | 需手动配置 | 配合 \`<Suspense>\` 自动流式 |

如果你想把某个取数结果缓存起来，需要使用 **\`use cache\` 指令** 配合 **\`cacheLife\`** 函数：

\`\`\`tsx filename="app/blog/page.tsx"
import { cacheLife } from 'next/cache'

// 把取数逻辑提取成独立函数，并使用 'use cache' 指令
async function getPosts() {
  'use cache'
  cacheLife('hours') // 缓存生命周期：小时级别

  const res = await fetch('https://api.vercel.app/blog')
  return res.json()
}

export default async function Page() {
  const posts = await getPosts() // 命中缓存则秒开
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

### 1.3 请求记忆化（Request Memoization）

Next.js 会自动对 **同一次请求内** 的相同 \`fetch\` 调用进行 **记忆化（Memoization）**：在同一个 React 渲染树中，如果两个组件都调用了 \`fetch('https://api.example.com/user')\`，实际只会发出一次网络请求，第二个调用直接复用第一个的结果。这意味着你可以在需要的组件中就近取数，而不必担心重复请求，也无需手动通过 props 层层下传。

> ⚠️ 注意：记忆化只在 **同一次请求** 内生效，不同请求之间不共享。\`React.cache\` 也是同样的作用域。

## 二、串行 vs 并行取数

### 2.1 串行取数（瀑布流问题）

如果你在一个组件里依次 \`await\` 多个请求，它们会 **串行执行**，形成 **请求瀑布流（Waterfall）**——前一个不完成，后一个不会开始。这是性能杀手：

\`\`\`tsx filename="app/artist/[username]/page.tsx" highlight={5,6}
import { getArtist, getAlbums } from '@/app/lib/data'

export default async function Page({ params }) {
  const { username } = await params
  // ❌ 串行：getAlbums 必须等 getArtist 完成
  const artist = await getArtist(username)
  const albums = await getAlbums(username)
  return <div>{artist.name}</div>
}
\`\`\`

如果 \`getArtist\` 耗时 300ms，\`getAlbums\` 耗时 500ms，串行总耗时就是 800ms。

### 2.2 并行取数（Promise.all）

正确做法是 **同时启动所有请求**，然后用 \`Promise.all\` 等待它们全部完成。关键技巧：**调用 fetch 时不立即 await**，先把 Promise 存起来，最后统一 await：

\`\`\`tsx filename="app/artist/[username]/page.tsx" highlight={14,15,17}
import Albums from './albums'

async function getArtist(username: string) {
  const res = await fetch(\`https://api.example.com/artist/\${username}\`)
  return res.json()
}

async function getAlbums(username: string) {
  const res = await fetch(\`https://api.example.com/artist/\${username}/albums\`)
  return res.json()
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // ✅ 并行：同时发起两个请求
  const artistData = getArtist(username)
  const albumsData = getAlbums(username)

  // 等待全部完成
  const [artist, albums] = await Promise.all([artistData, albumsData])

  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums} />
    </>
  )
}
\`\`\`

同样的请求，并行执行总耗时只有 max(300ms, 500ms) = 500ms，比串行快 37%。

> 💡 **进阶提示**：如果某个请求可能失败，使用 \`Promise.allSettled\` 而非 \`Promise.all\`。后者任一失败即全部失败，前者允许部分成功。

### 2.3 Demo：串行 vs 并行对比

下面这个 demo 完整对比两种方式的耗时差异：

\`\`\`tsx filename="app/demo/fetch-compare/page.tsx"
// 模拟两个慢请求
async function fetchProfile(userId: string): Promise<{ name: string }> {
  await new Promise((r) => setTimeout(r, 500)) // 模拟 500ms 网络延迟
  return { name: '张三' }
}

async function fetchOrders(userId: string): Promise<{ count: number }> {
  await new Promise((r) => setTimeout(r, 700)) // 模拟 700ms 网络延迟
  return { count: 42 }
}

// 串行版本：500 + 700 = 1200ms
export default async function Page() {
  const startSerial = Date.now()
  const profile = await fetchProfile('u1')   // 等 500ms
  const orders = await fetchOrders('u1')     // 再等 700ms
  const serialTime = Date.now() - startSerial

  return (
    <div>
      <h1>串行取数耗时：{serialTime}ms</h1>
      <p>用户：{profile.name}，订单数：{orders.count}</p>
      <p>提示：并行版本可降到 700ms</p>
    </div>
  )
}
\`\`\`

## 三、流式取数（Streaming）

### 3.1 为什么需要流式

当 Server Component 在等数据时，**整个路由都会被阻塞**，用户看到的只有白屏。流式渲染（Streaming）允许服务器把页面拆成多个 **chunk（分块）**，逐步发送给浏览器。先渲染好的部分立即显示，慢的部分等数据到了再补上。

Next.js 提供两种流式方案：
1. **\`loading.js\` 文件**：整页级别流式
2. **\`<Suspense>\` 边界**：组件级别流式（更细粒度）

### 3.2 用 \`use\` API 流式取数

React 19 提供了 \`use\` API，可以在 Client Component 中读取一个 Promise。配合 Server Component 启动 fetch、\`<Suspense>\` 包装，能实现真正的流式取数：

\`\`\`tsx filename="app/blog/page.tsx"
import Posts from '@/app/ui/posts'
import { Suspense } from 'react'

// Server Component：启动 fetch 但不 await
export default function Page() {
  // 不 await！把 Promise 直接传下去
  const posts = getPosts()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Posts posts={posts} />
    </Suspense>
  )
}

async function getPosts() {
  const res = await fetch('https://api.vercel.app/blog')
  return res.json()
}
\`\`\`

\`\`\`tsx filename="app/ui/posts.tsx"
'use client'
import { use } from 'react'

// Client Component：用 use 读取 Promise
export default function Posts({
  posts,
}: {
  posts: Promise