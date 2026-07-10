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
  posts: Promise<{ id: string; title: string }[]>
}) {
  // use() 会暂停组件直到 Promise resolve
  const allPosts = use(posts)

  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

工作流程：
1. Server Component 启动 \`getPosts()\`，**不 await**，直接把 Promise 传给 \`<Posts>\`
2. \`<Suspense>\` 立即渲染 fallback（"Loading..."），同时把静态壳发给浏览器
3. 当 Promise resolve 时，React 把 \`<Posts>\` 的 HTML 流式追加到页面
4. 浏览器无需等 JS 加载完毕就能看到内容

### 3.3 Demo：Suspense 流式渲染

下面这个例子展示如何让多个慢组件独立流式：

\`\`\`tsx filename="app/dashboard/page.tsx"
import { Suspense } from 'react'

// 模拟慢组件：3 秒后返回数据
async function Revenue() {
  await new Promise((r) => setTimeout(r, 3000))
  return <div>本月收入：¥128,000</div>
}

async function Orders() {
  await new Promise((r) => setTimeout(r, 1000))
  return <div>今日订单：238 单</div>
}

export default function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>
      {/* 静态部分立即显示 */}
      <p>欢迎回来，张三</p>

      {/* 订单 1 秒后流式出现 */}
      <Suspense fallback={<p>加载订单中...</p>}>
        <Orders />
      </Suspense>

      {/* 收入 3 秒后流式出现，不阻塞订单 */}
      <Suspense fallback={<p>加载收入中...</p>}>
        <Revenue />
      </Suspense>
    </div>
  )
}
\`\`\`

用户看到的效果：
- 0ms：标题 + 欢迎语 + 两个"加载中"
- 1000ms：订单数据出现
- 3000ms：收入数据出现

## 四、客户端取数

虽然 Server Component 取数是首选，但有些场景必须在客户端取数（如依赖浏览器 API、需要用户交互触发等）。Next.js 推荐两种方案：

### 4.1 React \`use\` API

如上节所示，\`use\` 配合 \`<Suspense>\` 是官方推荐的客户端取数方式。它天然支持流式，无需额外库。

### 4.2 SWR / React Query

社区库 SWR、React Query 提供了更完整的客户端取数体验（缓存、重试、轮询、乐观更新等）：

\`\`\`tsx filename="app/blog/page.tsx"
'use client'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

export default function BlogPage() {
  const { data, error, isLoading } = useSWR(
    'https://api.vercel.app/blog',
    fetcher
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
\`\`\`

### 4.3 Server vs Client 取数对比

| 维度 | Server Component 取数 | Client Component 取数 |
| --- | --- | --- |
| 运行位置 | 服务器 | 浏览器 |
| 首屏速度 | 快（HTML 直出） | 慢（需先加载 JS） |
| SEO | 友好 | 不友好 |
| 凭证安全 | 安全（不暴露） | 需谨慎 |
| 依赖浏览器 API | 不行 | 可以 |
| 推荐场景 | 默认首选 | 交互触发、轮询等 |

## 五、取数函数封装（React.cache）

当多个组件需要同一份数据时，可以用 \`React.cache\` 封装取数函数，避免重复请求。它会在 **同一次请求** 内缓存结果：

\`\`\`tsx filename="app/lib/user.ts"
import { cache } from 'react'

// 用 cache 包裹：同一次请求内多次调用只执行一次
export const getUser = cache(async () => {
  const res = await fetch('https://api.example.com/user')
  return res.json()
})
\`\`\`

然后在任何 Server Component 中直接调用：

\`\`\`tsx filename="app/dashboard/page.tsx"
import { getUser } from '@/lib/user'

export default async function DashboardPage() {
  // 多次调用也只会发一次请求
  const user = await getUser()
  return <h1>Dashboard for {user.name}</h1>
}
\`\`\`

\`React.cache\` 的作用域是 **单次请求**，每个请求都有独立的缓存作用域，请求之间不共享，因此是安全的。

## 小结

本章核心要点：
1. **Server Component 默认就是 async**，直接 \`await fetch\` 即可
2. **Next.js 16 默认不缓存 fetch**，需要 \`use cache\` + \`cacheLife\` 显式缓存
3. **避免瀑布流**：用 \`Promise.all\` 并行取数
4. **流式渲染**：\`loading.js\` 整页流式，\`<Suspense>\` 细粒度流式
5. **\`use\` API** 让 Client Component 也能流式读取 Server 启动的 Promise
6. **\`React.cache\`** 解决单请求内重复取数问题

> 下一章我们将学习如何用 **Server Actions** 修改数据，并配合 \`revalidatePath\`、\`revalidateTag\`、\`updateTag\` 等新 API 实现数据更新与即时刷新。
`
  },

  // =========================================================
  // 第二章：数据变更与 Server Actions
  // =========================================================
  {
    id: "nextjs-mutating",
    group: "数据与交互",
    icon: "✏️",
    title: "数据变更与 Server Actions",
    content: `
# 数据变更与 Server Actions

在传统 React SPA 中，数据变更（Mutation）通常这样实现：客户端发请求 → 等响应 → 手动更新本地状态 → 重新取数。这种方式需要手写大量样板代码，还要处理乐观更新、错误回滚、缓存失效等问题。**Next.js 16 的 Server Actions（服务端动作）** 把这一切简化为：在服务端写一个 async 函数，前端直接调用，框架自动处理数据回流与 UI 更新。

## 一、什么是 Server Actions

**Server Function（服务端函数）** 是运行在服务器上的异步函数，可以通过网络请求从客户端调用。当它被用于表单提交或数据变更场景时，称为 **Server Action**。

Server Actions 的核心优势：
- **单次往返**：一次 POST 请求即可返回更新后的 UI 和数据
- **渐进增强**：即使 JS 未加载，表单也能提交（Server Component 中）
- **类型安全**：客户端调用时有完整 TS 类型推导
- **自动缓存失效**：配合 \`revalidatePath\`、\`revalidateTag\` 等 API

> ⚠️ **安全警告**：Server Functions 通过 POST 请求可达，**不仅仅** 通过你的 UI 调用。务必在每个 Server Function 内部验证身份和权限。

## 二、定义 Server Actions

### 2.1 方式一：单独文件（'use server' 顶部指令）

在文件顶部写 \`'use server'\`，该文件所有导出的 async 函数都成为 Server Action。这是 **推荐做法**，便于复用：

\`\`\`ts filename="app/lib/actions.ts"
'use server' // 整个文件的导出都是 Server Actions

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// 创建文章
export async function createPost(formData: FormData) {
  // 1. 鉴权：每个 Action 都必须自己验证
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // 2. 提取表单数据
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // 3. 写入数据库
  await db.post.create({ data: { title, content, authorId: session.user.id } })

  // 4. 失效缓存，让下次取数拿到新数据
  revalidatePath('/posts')
}

// 删除文章
export async function deletePost(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  // 删除前要校验资源归属
  await db.post.delete({ where: { id, authorId: session.user.id } })
  revalidatePath('/posts')
}
\`\`\`

### 2.2 方式二：内联（函数体 'use server'）

在 Server Component 内部直接定义，函数体第一行写 \`'use server'\`：

\`\`\`tsx filename="app/page.tsx"
export default function Page() {
  // 内联 Server Action
  async function createPost(formData: FormData) {
    'use server'
    const title = formData.get('title')
    // 写库...
  }

  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">提交</button>
    </form>
  )
}
\`\`\`

> 💡 **注意**：Client Component 中 **不能** 定义 Server Action，只能从 \`'use server'\` 文件导入。

### 2.3 在 Client Component 中调用

从 \`'use server'\` 文件导入后即可在 Client Component 中使用：

\`\`\`tsx filename="app/ui/button.tsx"
'use client'
import { createPost } from '@/app/actions'

export function Button() {
  return <button formAction={createPost}>创建</button>
}
\`\`\`

## 三、表单与 Server Actions

### 3.1 form 的 action 属性

React 扩展了原生 \`<form>\`，允许把 Server Action 直接传给 \`action\` 属性。提交时框架会自动调用该函数，并把 \`FormData\` 作为参数传入：

\`\`\`tsx filename="app/ui/form.tsx"
import { createPost } from '@/app/actions'

export function Form() {
  return (
    <form action={createPost}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <button type="submit">创建文章</button>
    </form>
  )
}
\`\`\`

### 3.2 Demo：点赞按钮（事件处理器调用）

Server Action 不限于表单，也能在事件处理器中调用：

\`\`\`tsx filename="app/like-button.tsx"
'use client'
import { incrementLike } from './actions'
import { useState } from 'react'

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)

  return (
    <>
      <p>总点赞数：{likes}</p>
      <button
        onClick={async () => {
          // 直接 await Server Action 的返回值
          const updatedLikes = await incrementLike()
          setLikes(updatedLikes)
        }}
      >
        点赞
      </button>
    </>
  )
}
\`\`\`

\`\`\`ts filename="app/like-button/actions.ts"
'use server'
import { revalidatePath } from 'next/cache'

export async function incrementLike() {
  // 假设从数据库或 KV 中读取并 +1
  const newCount = await db.like.increment()
  revalidatePath('/')
  return newCount
}
\`\`\`

## 四、表单状态 Hooks

### 4.1 useFormStatus（子组件感知表单状态）

\`useFormStatus\` 用于表单 **内部子组件** 感知当前表单是否正在提交。它只能在 \`<form>\` 内部的子组件中使用：

\`\`\`tsx filename="app/ui/submit-button.tsx"
'use client'
import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  )
}
\`\`\`

### 4.2 useActionState（Next.js 16 推荐用法）

⚠️ **重要**：Next.js 16 中 \`useFormState\` 已被 \`useActionState\` 取代。它返回 \`[state, action, pending]\` 三元组，能同时拿到上一次 Action 的返回值、包装后的 action、pending 状态：

\`\`\`tsx filename="app/ui/form.tsx"
'use client'
import { useActionState } from 'react'
import { createPost } from '@/app/actions'

const initialState = { message: '' }

export function Form() {
  // useActionState：state 是 Action 的返回值
  const [state, formAction, pending] = useActionState(createPost, initialState)

  return (
    <form action={formAction}>
      <label>标题</label>
      <input type="text" name="title" required />

      <label>正文</label>
      <textarea name="content" required />

      {/* 显示服务端返回的错误信息 */}
      {state?.message && (
        <p aria-live="polite" style={{ color: 'red' }}>{state.message}</p>
      )}

      <button disabled={pending}>
        {pending ? '提交中...' : '创建文章'}
      </button>
    </form>
  )
}
\`\`\`

对应的 Server Action 需要 \`(prevState, formData)\` 签名：

\`\`\`ts filename="app/actions.ts"
'use server'

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string

  if (title.length < 3) {
    // 返回错误信息，会进入 useActionState 的 state
    return { message: '标题至少 3 个字符' }
  }

  // 写库...
  return { message: '创建成功' }
}
\`\`\`

### 4.3 useActionState vs useFormStatus 对比

| Hook | 作用 | 使用位置 | 返回值 |
| --- | --- | --- | --- |
| \`useActionState\` | 获取 Action 返回值 + pending | 表单组件本身 | \`[state, action, pending]\` |
| \`useFormStatus\` | 感知表单是否提交中 | 表单内部子组件 | \`{ pending, data, method, action }\` |

## 五、缓存失效 API（Next.js 16 新特性）

### 5.1 revalidatePath

让指定路径的缓存失效，下次访问重新渲染：

\`\`\`ts
import { revalidatePath } from 'next/cache'

revalidatePath('/posts')          // 失效 /posts 路由
revalidatePath('/posts/[slug]', 'page') // 失效动态路由所有 page
revalidatePath('/', 'layout')     // 失效整个布局树
\`\`\`

### 5.2 revalidateTag（Next.js 16 第二参数）

⚠️ **Next.js 16 重要变更**：\`revalidateTag\` 现在需要 **第二个参数 \`cacheLife\`**，用于指定重新验证后的缓存生命周期：

\`\`\`ts filename="app/lib/actions.ts"
'use server'
import { revalidateTag } from 'next/cache'

export async function updateProduct(formData: FormData) {
  // 写库...
  // Next.js 16：必须传第二个 cacheLife 参数
  revalidateTag('products', 'hours') // 失效后重新缓存，生命周期 hours
}
\`\`\`

### 5.3 updateTag（Next.js 16 新 API：read-your-writes）

⚠️ **Next.js 16 全新 API**：\`updateTag\` 解决了 \`revalidateTag\` 的"读旧数据"问题。

传统 \`revalidateTag\` 的痛点：失效缓存后，下次取数可能命中 **其他节点的旧缓存** 或 **正在进行中的请求**，导致用户刚提交的数据"看不到"（read-your-writes 不一致）。\`updateTag\` 保证 **当前用户** 立即看到自己的修改：

\`\`\`ts filename="app/lib/actions.ts"
'use server'
import { updateTag } from 'next/cache'

export async function addComment(formData: FormData) {
  const content = formData.get('content') as string
  await db.comment.create({ data: { content } })

  // updateTag：当前用户立即看到新评论（read-your-writes 一致性）
  // revalidateTag 可能会让用户看到旧数据几秒钟
  updateTag('comments')
}
\`\`\`

\`revalidateTag\` vs \`updateTag\` 对比：

| API | 一致性 | 适用场景 | Next.js 版本 |
| --- | --- | --- | --- |
| \`revalidateTag\` | 最终一致（可能短暂读旧） | 不敏感的批量失效 | 13+（16 改签名） |
| \`updateTag\` | read-your-writes（当前用户立即看到） | 用户自己提交的内容 | 16 新增 |

### 5.4 refresh（Next.js 16 新 API）

⚠️ **Next.js 16 新 API**：\`refresh\` 从 \`next/cache\` 导入，用于刷新客户端 Router 缓存，让 UI 反映最新状态。**它不会重新验证 tagged 数据**：

\`\`\`ts filename="app/lib/actions.ts"
'use server'
import { refresh } from 'next/cache'

export async function updatePost(formData: FormData) {
  // 写库...
  // 刷新客户端 Router，重新渲染当前页
  refresh()

  // 如果还需要失效 tagged 缓存，必须额外调用
  // updateTag('posts') 或 revalidateTag('posts', 'hours')
}
\`\`\`

### 5.5 redirect（变更后跳转）

变更后往往需要跳转，用 \`redirect\`：

\`\`\`ts filename="app/lib/actions.ts"
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  // 写库...
  revalidatePath('/posts')
  redirect('/posts') // 注意：redirect 会抛出异常，后面的代码不会执行
}
\`\`\`

## 六、Demo：带 revalidate 的增删改

下面是一个完整的 CRUD 示例：

\`\`\`ts filename="app/lib/actions.ts"
'use server'
import { revalidatePath, revalidateTag, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

// 创建
export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string
  if (!title) return { error: '标题不能为空' }

  await db.post.create({ data: { title } })
  // 失效列表页缓存
  revalidatePath('/posts')
  // 失效 tagged 数据（Next.js 16 需第二参数）
  revalidateTag('posts', 'hours')
  redirect('/posts')
}

// 更新
export async function updatePost(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  await db.post.update({ where: { id }, data: { title } })

  // 用户自己改的，立即看到（read-your-writes）
  updateTag('posts')
  revalidatePath('/posts')
}

// 删除
export async function deletePost(formData: FormData) {
  const id = formData.get('id') as string
  await db.post.delete({ where: { id } })
  revalidatePath('/posts')
  revalidateTag('posts', 'hours')
}
\`\`\`

\`\`\`tsx filename="app/posts/page.tsx"
import { deletePost } from '@/lib/actions'

export default async function PostsPage() {
  const posts = await getPosts()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {post.title}
          {/* 删除按钮：用 form + formAction */}
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit">删除</button>
          </form>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

## 七、Demo：updateTag 即时刷新评论

\`\`\`tsx filename="app/comments/page.tsx"
import { addComment } from '@/lib/actions'
import { Suspense } from 'react'

export default function CommentsPage() {
  return (
    <div>
      <h1>评论</h1>
      {/* 评论列表：用 tagged fetch 取数 */}
      <Suspense fallback={<p>加载评论...</p>}>
        <CommentList />
      </Suspense>

      {/* 评论表单：提交后 updateTag 立即刷新 */}
      <form action={addComment}>
        <input name="content" placeholder="写下你的评论..." required />
        <button type="submit">发表</button>
      </form>
    </div>
  )
}

async function CommentList() {
  // 用 next.tag 标记，updateTag('comments') 可失效
  const res = await fetch('https://api.example.com/comments', {
    next: { tags: ['comments'] }
  })
  const comments = await res.json()
  return (
    <ul>
      {comments.map((c) => <li key={c.id}>{c.content}</li>)}
    </ul>
  )
}
\`\`\`

## 八、乐观更新（Optimistic Update）

乐观更新指 **先更新 UI，再等服务端确认**，给用户即时反馈。React 19 提供了 \`useOptimistic\` Hook：

\`\`\`tsx filename="app/ui/like-button-optimistic.tsx"
'use client'
import { useOptimistic } from 'react'
import { addLike } from '@/app/actions'

export default function LikeButton({ likes }: { likes: number }) {
  // useOptimistic：在服务端确认前先显示乐观值
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (state, _: void) => state + 1
  )

  return (
    <form action={async (formData) => {
      // 立即把 UI 上的数字 +1（乐观更新）
      addOptimisticLike()
      // 真正发请求到服务端
      await addLike(formData)
    }}>
      <button type="submit">点赞（{optimisticLikes}）</button>
    </form>
  )
}
\`\`\`

工作流程：
1. 用户点击 → \`addOptimisticLike()\` 立即把数字 +1
2. 服务端请求进行中（用户看到的是乐观值）
3. 服务端返回后，React 用真实值替换乐观值
4. 如果失败，乐观值自动回滚到真实值

## 小结

| API | 作用 | Next.js 16 变化 |
| --- | --- | --- |
| \`'use server'\` | 标记 Server Action | 无变化 |
| \`useFormStatus\` | 表单子组件感知 pending | 无变化 |
| \`useActionState\` | 表单状态管理 | 替代旧 \`useFormState\` |
| \`revalidatePath\` | 失效路径缓存 | 无变化 |
| \`revalidateTag\` | 失效 tagged 缓存 | **需第二参数 cacheLife** |
| \`updateTag\` | read-your-writes 失效 | **新增** |
| \`refresh\` | 刷新 Router 缓存 | **新增** |
| \`useOptimistic\` | 乐观更新 | React 19 新增 |

> 下一章我们深入 **加载状态与流式渲染**，学习如何用 \`loading.js\` 和 \`<Suspense>\` 打造丝滑的用户体验。
`
  },

  // =========================================================
  // 第三章：加载状态与流式渲染
  // =========================================================
  {
    id: "nextjs-loading",
    group: "数据与交互",
    icon: "⏳",
    title: "加载状态与流式渲染",
    content: `
# 加载状态与流式渲染

在传统 SSR 中，服务器必须 **完整生成 HTML** 后才能发送给浏览器。任何一个慢查询都会阻塞整页——用户只能盯着白屏等待。**流式渲染（Streaming）** 通过 **分块传输（chunked transfer encoding）** 把页面拆成多个 chunk，逐步发送：先渲染好的部分立即显示，慢的部分等数据到了再补上。Next.js 16 把流式渲染作为一等公民，本章系统讲解其原理与最佳实践。

## 一、流式渲染原理

### 1.1 传统 SSR vs 流式 SSR

| 维度 | 传统 SSR | 流式 SSR |
| --- | --- | --- |
| 响应方式 | 全部生成后一次性发送 | 边生成边发送 |
| TTFB | 等于最慢查询耗时 | 等于静态壳渲染耗时（通常 <50ms） |
| 用户体验 | 长时间白屏 | 立即看到骨架，内容逐步出现 |
| 错误影响 | 整页失败 | 单个 Suspense 边界失败不影响其他 |

### 1.2 三条流并行工作

Next.js 在浏览器请求页面时，实际上有三条"流"在协同工作：

1. **HTML 流**：React 服务端渲染器按 \`<Suspense>\` 边界拆分，静态部分先发，动态部分 resolve 后追加
2. **Component Payload 流**：序列化的组件树，用于客户端 hydration 和后续导航
3. **静态壳（Static Shell）**：所有 \`<Suspense>\` fallback 之外的部分，立即发送，让用户秒看到内容

### 1.3 工作机制

当 React 遇到一个 \`<Suspense>\` 边界：
1. 立即渲染 fallback（如骨架屏），连同静态壳一起发送
2. 边界内的异步组件开始取数（不阻塞其他部分）
3. 异步组件 resolve 后，React 把它的 HTML 流式追加到页面，并用 inline \`<script>\` 把 fallback DOM 替换为真实内容
4. 浏览器 **无需等 JS 加载完毕** 就能看到新内容

## 二、loading.js 文件约定

### 2.1 基本用法

在 \`app\` 目录的任何子文件夹中放一个 \`loading.js\`，Next.js 会自动用 \`<Suspense>\` 包裹同级的 \`page.js\`：

\`\`\`tsx filename="app/dashboard/loading.tsx"
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* 模拟标题 */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
      {/* 模拟正文行 */}
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="app/dashboard/page.tsx"
// 这个 page 取数慢，但 loading.js 会立即显示骨架
export default async function Page() {
  const data = await fetch('https://api.example.com/dashboard')
  const json = await data.json()
  return <Dashboard data={json} />
}
\`\`\`

### 2.2 组件层级关系

\`loading.js\` 在组件树中的位置：

\`\`\`
<layout>
  <Suspense fallback={<loading.js />}>
    <page.js />
    <nested layout>
      <nested page />
    </nested layout>
  </Suspense>
</layout>
\`\`\`

关键点：
- \`loading.js\` 嵌套在 \`layout.js\` **内部**
- 它包裹 \`page.js\` 及其 **所有子级**
- 它 **不包裹** 同级的 \`layout.js\`、\`error.js\`、\`template.js\`

### 2.3 loading.js 的局限

⚠️ **重要**：如果 \`layout.js\` 本身访问了 uncached 数据（如 \`cookies()\`、\`headers()\`、未缓存的 fetch），\`loading.js\` **不会** 显示 fallback——导航会阻塞直到 layout 渲染完成。

解决方案：
1. 把 uncached 取数从 \`layout.js\` 移到 \`page.js\`
2. 或者在 layout 中用 \`<Suspense>\` 单独包裹 uncached 部分

## 三、<Suspense> 细粒度流式

\`loading.js\` 是整页级别的 fallback，粒度太粗。\`<Suspense>\` 让你 **精确控制** 哪些部分流式：

### 3.1 Demo：多个 Suspense 边界并行流式

\`\`\`tsx filename="app/dashboard/page.tsx"
import { Suspense } from 'react'

// 模拟慢组件
async function Revenue() {
  await new Promise((r) => setTimeout(r, 3000))
  const res = await fetch('https://api.example.com/revenue')
  const data = await res.json()
  return <div>本月收入：¥{data.total}</div>
}

async function RecentOrders() {
  await new Promise((r) => setTimeout(r, 1000))
  const res = await fetch('https://api.example.com/orders')
  const data = await res.json()
  return <div>今日订单：{data.count} 单</div>
}

async function Recommendations() {
  await new Promise((r) => setTimeout(r, 5000))
  const res = await fetch('https://api.example.com/recommendations')
  const data = await res.json()
  return <div>为你推荐：{data.items.join('、')}</div>
}

export default function Dashboard() {
  return (
    <div>
      {/* 静态部分立即显示 */}
      <h1>仪表盘</h1>
      <p>欢迎回来，张三</p>

      <div className="grid grid-cols-2 gap-4">
        {/* 1 秒后流式出现 */}
        <Suspense fallback={<p>加载订单中...</p>}>
          <RecentOrders />
        </Suspense>

        {/* 3 秒后流式出现，不阻塞订单 */}
        <Suspense fallback={<p>加载收入中...</p>}>
          <Revenue />
        </Suspense>
      </div>

      {/* 5 秒后流式出现 */}
      <Suspense fallback={<p>加载推荐中...</p>}>
        <Recommendations />
      </Suspense>
    </div>
  )
}
\`\`\`

用户体验时间线：
- 0ms：标题、欢迎语、三个"加载中"
- 1000ms：订单出现
- 3000ms：收入出现
- 5000ms：推荐出现

### 3.2 Demo：嵌套 Suspense（渐进式细节）

嵌套 \`<Suspense>\` 可以实现"逐层揭示"的渐进式加载：

\`\`\`tsx filename="app/product/[id]/page.tsx"
import { Suspense } from 'react'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1>商品</h1>
      {/* 外层：商品详情先流式 */}
      <Suspense fallback={<p>加载商品详情...</p>}>
        <ProductDetails id={id} />
        {/* 内层：评论后流式 */}
        <Suspense fallback={<p>加载评论...</p>}>
          <Reviews productId={id} />
        </Suspense>
      </Suspense>
    </div>
  )
}

async function ProductDetails({ id }: { id: string }) {
  await new Promise((r) => setTimeout(r, 800))
  return <div>商品详情区域</div>
}

async function Reviews({ productId }: { productId: string }) {
  await new Promise((r) => setTimeout(r, 2000))
  return <div>评论区</div>
}
\`\`\`

时间线：
- 0ms：标题 + "加载商品详情..."
- 800ms：商品详情出现 + "加载评论..."（内层 fallback 接管）
- 2800ms：评论出现

### 3.3 推迟动态访问（Push dynamic down）

让静态壳尽量大的关键技巧：**把动态访问推迟到真正需要它的组件**。适用于 \`params\`、\`searchParams\`、\`cookies()\`、\`headers()\`：

\`\`\`tsx filename="app/dashboard/layout.tsx"
import { Suspense } from 'react'
import { cookies } from 'next/headers'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ✅ 不要 await！把 Promise 传下去
  const cookieStore = cookies()

  return (
    <div>
      <Nav>
        {/* 只有 UserMenu 会 suspend，其他部分是静态壳 */}
        <Suspense fallback={<p>加载用户...</p>}>
          <UserMenu cookiePromise={cookieStore} />
        </Suspense>
      </Nav>
      {children}
    </div>
  )
}

async function UserMenu({ cookiePromise }: { cookiePromise: Promise<any> }) {
  // 在子组件内部 await
  const store = await cookiePromise
  const user = store.get('user')
  return <div>你好，{user?.value}</div>
}
\`\`\`

如果改成 \`const store = await cookies()\`，**整个 layout 都会变成动态的**，\`{children}\` 也无法进入静态壳。

## 四、use() API 流式取数

### 4.1 基本模式

Server Component 启动 fetch 但不 await，把 Promise 传给 Client Component，Client 用 \`use()\` 读取：

\`\`\`tsx filename="app/dashboard/page.tsx"
import { Suspense } from 'react'
import { StatsChart } from './stats-chart'

async function getStats() {
  const res = await fetch('https://api.example.com/stats')
  return res.json()
}

export default function Dashboard() {
  // 启动 fetch 但不 await
  const statsPromise = getStats()

  return (
    <Suspense fallback={<p>加载图表...</p>}>
      <StatsChart dataPromise={statsPromise} />
    </Suspense>
  )
}
\`\`\`

\`\`\`tsx filename="app/dashboard/stats-chart.tsx"
'use client'
import { use } from 'react'

type Stats = { revenue: number; orders: number }

export function StatsChart({ dataPromise }: { dataPromise: Promise<Stats> }) {
  // use() 读取 Promise，未 resolve 时组件 suspend
  const stats = use(dataPromise)
  return (
    <div>
      <p>收入：¥{stats.revenue}</p>
      <p>订单：{stats.orders} 单</p>
    </div>
  )
}
\`\`\`

### 4.2 跨层共享 Promise

配合 Context，可以在组件树任意层级读取同一个 Promise：

\`\`\`tsx filename="app/layout.tsx"
import { getUser } from '@/lib/data'
import { UserProvider } from './user-provider'

export default function Layout({ children }: { children: React.ReactNode }) {
  // 启动 fetch 但不 await
  const userPromise = getUser()
  return <UserProvider userPromise={userPromise}>{children}</UserProvider>
}
\`\`\`

\`\`\`tsx filename="app/user-provider.tsx"
'use client'
import { createContext } from 'react'

export const UserContext = createContext<Promise<any> | null>(null)

export default function UserProvider({ children, userPromise }: {
  children: React.ReactNode
  userPromise: Promise<any>
}) {
  return <UserContext value={userPromise}>{children}</UserContext>
}
\`\`\`

任意深度的 Client Component 都能用 \`use(useContext(UserContext))\` 读取。

## 五、骨架屏最佳实践

### 5.1 Demo：可复用骨架组件

\`\`\`tsx filename="app/ui/skeleton.tsx"
// 通用骨架原子组件
export function Skeleton({ className }: { className?: string }) {
  return <div className={\`animate-pulse bg-gray-200 rounded \${className}\`} />
}

// 文章卡片骨架
export function PostCardSkeleton() {
  return (
    <div className="border p-4 rounded space-y-3">
      <Skeleton className="h-6 w-3/4" />      {/* 标题 */}
      <Skeleton className="h-4 w-full" />     {/* 正文行 1 */}
      <Skeleton className="h-4 w-full" />     {/* 正文行 2 */}
      <Skeleton className="h-4 w-1/2" />      {/* 正文行 3 */}
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-8 w-16" />     {/* 按钮 */}
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

// 文章列表骨架
export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="app/blog/page.tsx"
import { Suspense } from 'react'
import { PostListSkeleton } from '@/ui/skeleton'

export default function Page() {
  return (
    <Suspense fallback={<PostListSkeleton count={3} />}>
      <PostList />
    </Suspense>
  )
}
\`\`\`

### 5.2 避免 Layout Shift（CLS）

⚠️ **关键**：fallback 和真实内容 **尺寸必须匹配**，否则切换时会发生布局抖动（CLS 指标恶化）。

| 错误做法 | 正确做法 |
| --- | --- |
| fallback 是一行"Loading..."，真实内容是 500px 列表 | fallback 用相同高度的骨架 |
| fallback 无尺寸约束 | 用 \`min-height\` 预留空间 |
| 真实内容高度不固定 | 用 \`aspect-ratio\` 或固定比例 |

\`\`\`tsx filename="app/ui/safe-skeleton.tsx"
// ✅ 用 min-height 预留空间，避免 CLS
export function SafeSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: 400 }} className="animate-pulse bg-gray-100 rounded" />
      }
    >
      {children}
    </Suspense>
  )
}
\`\`\`

## 六、loading.js vs <Suspense> 对比

| 维度 | \`loading.js\` | \`<Suspense>\` |
| --- | --- | --- |
| 作用域 | 整个 page | 任意组件 |
| 配置方式 | 放一个文件 | 显式包裹组件 |
| 导航预取 | 预取为即时 fallback | 默认不预取 |
| 适用场景 | 没数据就什么都看不到的页面 | 大多数页面，细粒度控制 |
| 灵活性 | 低 | 高 |

**推荐策略**：优先用 \`<Suspense>\` 贴近动态访问点；\`loading.js\` 作为兜底，放在较高的路由段。

## 七、Web Vitals 影响

流式渲染直接影响以下指标：

| 指标 | 含义 | 流式如何改善 |
| --- | --- | --- |
| **TTFB** | 首字节时间 | 静态壳立即发送，不等慢查询 |
| **FCP** | 首次内容绘制 | 浏览器立即绘制静态壳 |
| **LCP** | 最大内容绘制 | LCP 元素保持在静态壳内 |
| **CLS** | 累计布局位移 | 骨架屏预留空间 |
| **INP** | 交互到下一帧 | 每个 Suspense 是独立 hydration 单元 |

LCP 优化要点：把 LCP 元素（主图、主标题）放在 \`<Suspense>\` **外面**，让它属于静态壳。

## 小结

1. **\`loading.js\`** 是整页级 fallback，简单但粒度粗
2. **\`<Suspense>\`** 是组件级 fallback，粒度细，推荐首选
3. **推迟动态访问**：\`cookies()\`、\`params\` 等 Promise 不要在顶层 await，传给子组件
4. **\`use()\` API** 让 Client Component 流式读取 Server 启动的 Promise
5. **骨架屏要匹配尺寸**，避免 CLS
6. **LCP 元素放静态壳**，\`<Suspense>\` 包裹次要内容

> 下一章学习 **错误处理**：如何在路由段中隔离错误，并提供优雅的恢复体验。
`
  },

  // =========================================================
  // 第四章：错误处理与恢复策略
  // =========================================================
  {
    id: "nextjs-error",
    group: "数据与交互",
    icon: "🛡️",
    title: "错误处理与恢复策略",
    content: `
# 错误处理与恢复策略

无论你多小心，错误总会发生：网络请求失败、数据库连接超时、第三方 API 返回 500、用户输入触发边界条件……关键不是消灭错误，而是 **优雅地处理错误**，让用户知道发生了什么、能做什么。Next.js 16 提供了完善的错误处理体系：从预期错误（Expected Errors）到未捕获异常（Uncaught Exceptions），从路由级隔离到全局兜底。

## 一、两类错误

### 1.1 预期错误（Expected Errors）

**预期错误** 是应用正常运行中可能发生的错误，例如：
- 表单验证失败
- API 返回 401/403/404
- 用户名已存在
- 文件大小超限

这些错误 **应该被显式处理并返回给客户端**，而不是抛出异常。处理方式是把它们建模为 **返回值**：

\`\`\`ts filename="app/actions.ts"
'use server'

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const res = await fetch('https://api.vercel.app/posts', {
    method: 'POST',
    body: { title, content },
  })

  // ✅ 不要 throw，而是 return 错误信息
  if (!res.ok) {
    return { message: '创建失败，请稍后重试' }
  }

  return { message: '创建成功' }
}
\`\`\`

### 1.2 未捕获异常（Uncaught Exceptions）

**未捕获异常** 是意外的错误，表示 bug 或不应发生的情况，例如：
- 数据库连接断开
- 代码逻辑错误（\`undefined.foo\`）
- 第三方服务超时

这些错误应该 **抛出异常**，由 **错误边界（Error Boundary）** 捕获并显示 fallback UI。

| 类型 | 处理方式 | UI 表现 |
| --- | --- | --- |
| 预期错误 | return 错误值 | 在表单旁显示错误信息 |
| 未捕获异常 | throw Error | 触发 error.js 显示 fallback UI |

## 二、error.js 文件约定

### 2.1 基本用法

在 \`app\` 目录的任何子文件夹中放一个 \`error.js\`，它会捕获同级及子级路由段中的未捕获异常：

\`\`\`tsx filename="app/dashboard/error.tsx"
'use client' // ⚠️ error.js 必须是 Client Component

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // 上报到错误监控服务（Sentry、Bugsnag 等）
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>出错了！</h2>
      <p>错误信息：{error.message}</p>
      <button onClick={() => unstable_retry()}>重试</button>
    </div>
  )
}
\`\`\`

### 2.2 ⚠️ error.js 必须是 Client Component

为什么？因为 React 的 Error Boundary 本质上是一个 class component，需要 \`getDerivedStateFromError\` 和 \`componentDidCatch\` 生命周期，这些只能在客户端运行。所以 \`error.js\` 文件 **必须** 以 \`'use client'\` 开头。

### 2.3 unstable_retry（Next.js 16.2.0 新增）

⚠️ **Next.js 16 重要变更**：错误恢复函数从 \`reset\` 改为 \`unstable_retry\`（v16.2.0 新增）。

\`unstable_retry()\` 会 **重新取数并重新渲染** 错误边界的子组件。如果成功，fallback UI 被替换为真实内容；如果再次失败，error 组件重新渲染。

\`\`\`tsx filename="app/dashboard/error.tsx"
'use client'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={() => unstable_retry()}>重试</button>
    </div>
  )
}
\`\`\`

> 💡 \`reset\` 仍然可用，但它 **只清除错误状态、不重新取数**。绝大多数场景应该用 \`unstable_retry\`。

### 2.4 error 对象的属性

\`error\` 对象有以下几个重要属性：

| 属性 | 说明 |
| --- | --- |
| \`error.message\` | 错误信息。**Client Component 抛出的错误** 显示原始 message；**Server Component 抛出的错误** 显示通用 message（防泄露） |
| \`error.digest\` | 自动生成的错误哈希，用于在服务端日志中匹配对应错误 |

⚠️ **生产环境安全**：Server Component 抛出的错误，在客户端只显示通用 message（如 "An error occurred"），避免泄露敏感信息。开发环境会显示完整 message 便于调试。

## 三、嵌套错误边界

### 3.1 错误会冒泡

错误会从抛出点 **向上冒泡**，直到遇到最近的 \`error.js\`。这让你可以 **在不同路由段放置不同粒度的 error.js**：

\`\`\`
app/
├── dashboard/
│   ├── error.tsx        # 捕获 dashboard 段错误
│   ├── analytics/
│   │   └── error.tsx    # 捕获 analytics 段错误（更细粒度）
│   └── page.tsx
├── error.tsx            # 捕获整个 app 错误（除 root layout）
└── layout.tsx
\`\`\`

### 3.2 Demo：按路由段隔离错误

\`\`\`tsx filename="app/dashboard/analytics/error.tsx"
'use client'

export default function AnalyticsError({ error, unstable_retry }) {
  return (
    <div className="border border-red-300 p-4 rounded">
      <h3>分析模块加载失败</h3>
      <p>不影响其他模块使用</p>
      <button onClick={() => unstable_retry()}>重试加载</button>
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="app/dashboard/page.tsx"
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>仪表盘</h1>
      {/* 这些模块正常 */}
      <RevenueSection />
      <OrdersSection />

      {/* 这个模块出错只会被 analytics/error.tsx 捕获，不影响其他 */}
      <AnalyticsSection />
    </div>
  )
}

async function AnalyticsSection() {
  // 模拟错误
  throw new Error('分析服务暂时不可用')
}
\`\`\`

效果：用户看到的是 "分析模块加载失败"，而 Revenue、Orders 部分正常显示。

### 3.3 error.js 与 layout.js 的关系

⚠️ **关键**：\`error.js\` **不包裹** 同级的 \`layout.js\`。它只包裹 \`page.js\` 及其子级。这意味着：

- 如果 \`layout.js\` 抛错，\`error.js\` 捕获不到
- 如果 \`layout.js\` 抛错，需要 **上一级** 的 \`error.js\` 或 \`global-error.js\` 来兜底

组件层级：

\`\`\`
<root layout>           ← global-error.js 兜底
  <error.js>            ← 捕获下面所有
    <Suspense fallback={loading.js}>
      <page.js />
      <nested layout>   ← 这层的 error.js 捕获
        <nested page />
      </nested layout>
    </Suspense>
  </error.js>
</root layout>
\`\`\`

## 四、global-error.js：根布局兜底

\`error.js\` 无法捕获 \`root layout\` 的错误。为此 Next.js 提供 \`global-error.js\`，它 **替换 root layout** 当激活时。

⚠️ **关键**：\`global-error.js\` 必须 **自己定义 \`<html>\` 和 \`<body>\` 标签**，因为它替换了 root layout：

\`\`\`tsx filename="app/global-error.tsx"
'use client' // 必须是 Client Component

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    // ⚠️ 必须自己写 html 和 body 标签
    <html>
      <body>
        <h2>系统出错了！</h2>
        <p>请稍后重试</p>
        <button onClick={() => unstable_retry()}>重试</button>
      </body>
    </html>
  )
}
\`\`\`

> 💡 \`global-error.js\` 不支持 \`metadata\` 导出，因为它替换了 root layout。如需 title，用 React \`<title>\` 组件。

## 五、not-found.js：404 页面

### 5.1 调用 notFound()

\`notFound()\` 函数触发 404，会渲染最近的 \`not-found.js\`：

\`\`\`tsx filename="app/blog/[slug]/page.tsx"
import { notFound } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  // 文章不存在 → 触发 404
  if (!post) {
    notFound()
  }

  return <article>{post.title}</article>
}
\`\`\`

### 5.2 自定义 not-found.js

\`\`\`tsx filename="app/blog/[slug]/not-found.tsx"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-gray-600">文章不存在</p>
      <Link href="/blog" className="text-blue-500 underline mt-4 inline-block">
        返回博客首页
      </Link>
    </div>
  )
}
\`\`\`

### 5.3 ⚠️ notFound 与流式的交互

⚠️ **重要**：一旦流式开始（即 Suspense fallback 渲染），HTTP 状态码已经发送（200 OK），无法再改成 404。Next.js 会在流式 HTML 中注入 \`<meta name="robots" content="noindex">\` 防止搜索引擎索引。

如果你需要 **真正的 404 状态码**，必须在 **任何 await 或 Suspense 之前** 调用 \`notFound()\`：

\`\`\`tsx filename="app/post/[slug]/page.tsx"
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // ✅ 快速存在性检查，在任何 Suspense 之前
  const exists = await checkSlugExists(slug)
  if (!exists) notFound() // 真 404

  return (
    <Suspense fallback={<p>加载文章...</p>}>
      <PostContent slug={slug} />
    </Suspense>
  )
}
\`\`\`

## 六、Server Component 中的错误处理

### 6.1 条件渲染错误信息

在 Server Component 中取数时，可以根据响应状态条件渲染：

\`\`\`tsx filename="app/page.tsx"
export default async function Page() {
  const res = await fetch('https://api.example.com/data')

  if (!res.ok) {
    // 直接渲染错误信息，不抛异常
    return <div>数据加载失败，请稍后重试</div>
  }

  const data = await res.json()
  return <div>{data.content}</div>
}
\`\`\`

### 6.2 抛出异常触发 error.js

如果是未预期错误，直接 throw，让 error.js 接管：

\`\`\`tsx filename="app/page.tsx"
export default async function Page() {
  const res = await fetch('https://api.example.com/data')

  if (!res.ok) {
    // 抛出异常，由 error.js 捕获
    throw new Error('Failed to fetch data')
  }

  const data = await res.json()
  return <div>{data.content}</div>
}
\`\`\`

## 七、自定义错误边界（unstable_catchError）

Next.js 16 提供 \`unstable_catchError\`，可以创建 **不依赖路由段** 的错误边界，包裹组件树任意部分：

\`\`\`tsx filename="app/custom-error-boundary.tsx"
'use client'
import { unstable_catchError as catchError, type ErrorInfo } from 'next/error'

function ErrorFallback(
  props: { title: string },
  { error, unstable_retry }: ErrorInfo
) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{error.message}</p>
      <button onClick={() => unstable_retry()}>重试</button>
    </div>
  )
}

// catchError 返回一个可复用的错误边界组件
export default catchError(ErrorFallback)
\`\`\`

\`\`\`tsx filename="app/some-component.tsx"
import ErrorBoundary from './custom-error-boundary'

export default function Component({ children }: { children: React.ReactNode }) {
  // 包裹任意部分，title 可自定义
  return (
    <ErrorBoundary title="仪表盘加载失败">
      {children}
    </ErrorBoundary>
  )
}
\`\`\`

## 八、Demo：完整错误处理流程

下面是一个综合 demo，展示预期错误、未捕获异常、404 三种场景：

\`\`\`tsx filename="app/posts/[id]/page.tsx"
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 场景 1：404（在任何 Suspense 之前调用）
  const exists = await checkPostExists(id)
  if (!exists) notFound()

  return (
    <article>
      <h1>{await getPostTitle(id)}</h1>

      {/* 场景 2：评论可能加载失败，用 Suspense 隔离 */}
      <Suspense fallback={<p>加载评论...</p>}>
        <Comments postId={id} />
      </Suspense>
    </article>
  )
}

async function Comments({ postId }: { postId: string }) {
  const res = await fetch(\`https://api.example.com/posts/\${postId}/comments\`)

  // 场景 3：预期错误 → 条件渲染
  if (!res.ok) {
    return <p>评论暂时无法加载</p>
  }

  // 场景 4：未捕获异常 → throw，由 error.js 接管
  const comments = await res.json()
  if (comments.length === 0) throw new Error('No comments parser error')

  return (
    <ul>
      {comments.map((c) => <li key={c.id}>{c.text}</li>)}
    </ul>
  )
}
\`\`\`

## 九、错误处理检查清单

| 场景 | 推荐做法 |
| --- | --- |
| 表单验证失败 | \`useActionState\` 返回错误对象 |
| API 401/403 | 重定向到登录页 |
| 资源不存在 | \`notFound()\` + \`not-found.js\` |
| 数据库连接失败 | throw，由 \`error.js\` 接管 |
| Root layout 出错 | \`global-error.js\` 兜底 |
| 组件级错误隔离 | \`unstable_catchError\` |
| 事件处理器错误 | try/catch + useState |

## 小结

1. **预期错误用返回值**，未捕获异常用 \`throw\`
2. **\`error.js\` 必须是 Client Component**，用 \`unstable_retry\` 恢复（Next.js 16.2.0 新）
3. **\`global-error.js\` 兜底 root layout**，必须自带 \`<html>\` \`<body>\`
4. **错误会冒泡**，可在不同路由段放不同 \`error.js\`
5. **\`notFound()\` 要早调用**，否则只能 soft 404
6. **\`unstable_catchError\`** 用于组件级错误边界，不依赖路由段

> 下一章学习 **Route Handlers**，构建自定义 API 端点。
`
  },

  // =========================================================
  // 第五章：Route Handlers：构建 API
  // =========================================================
  {
    id: "nextjs-route-handlers",
    group: "数据与交互",
    icon: "🔌",
    title: "Route Handlers：构建 API",
    content: `
# Route Handlers：构建 API

**Route Handlers** 让你在 Next.js 中构建自定义 API 端点。它们基于 Web 标准的 [Request](https://developer.mozilla.org/docs/Web/API/Request) 和 [Response](https://developer.mozilla.org/docs/Web/API/Response) API，是 Pages Router 中 API Routes 的替代品。无论是构建 REST API、接收 Webhook、流式响应、还是为前端提供 BFF（Backend for Frontend）层，Route Handlers 都是首选方案。

## 一、route.js 文件约定

### 1.1 基本约定

在 \`app\` 目录任意位置放一个 \`route.js\`（或 \`route.ts\`）文件，就创建了一个 Route Handler。每个文件导出对应 HTTP 方法名的函数：

\`\`\`ts filename="app/api/route.ts"
// 最简单的 GET 端点
export async function GET() {
  return Response.json({ message: 'Hello World' })
}
\`\`\`

### 1.2 支持的 HTTP 方法

支持 \`GET\`、\`POST\`、\`PUT\`、\`PATCH\`、\`DELETE\`、\`HEAD\`、\`OPTIONS\`。未定义的方法返回 \`405 Method Not Allowed\`：

\`\`\`ts filename="app/api/route.ts"
export async function GET(request: Request) {}
export async function HEAD(request: Request) {}
export async function POST(request: Request) {}
export async function PUT(request: Request) {}
export async function DELETE(request: Request) {}
export async function PATCH(request: Request) {}
// 如果未定义 OPTIONS，Next.js 自动实现并设置 Allow 头
export async function OPTIONS(request: Request) {}
\`\`\`

### 1.3 ⚠️ route.js vs page.js 冲突

⚠️ **重要**：\`route.js\` 和 \`page.js\` **不能在同一个路由段共存**。\`route.js\` 是最低级路由原语，会接管该路径的所有 HTTP 请求：

| page.js | route.js | 结果 |
| --- | --- | --- |
| \`app/page.js\` | \`app/route.js\` | ❌ 冲突 |
| \`app/page.js\` | \`app/api/route.js\` | ✅ 有效（不同路径） |
| \`app/[user]/page.js\` | \`app/api/route.js\` | ✅ 有效 |

### 1.4 不参与布局和导航

\`route.js\` **不参与** 客户端导航，也不会被 layout 包裹。它是纯粹的 HTTP 端点。

## 二、Request 与 Response

### 2.1 Request 对象

第一个参数是 \`NextRequest\`（继承自 Web \`Request\`），提供了额外便利方法：

\`\`\`ts filename="app/api/search/route.ts"
import { type NextRequest } from 'next/server'

export function GET(request: NextRequest) {
  // nextUrl 提供解析后的 URL 对象
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') // /api/search?query=hello → 'hello'
  const page = searchParams.get('page') || '1'

  return Response.json({ query, page })
}
\`\`\`

### 2.2 读取请求体

\`\`\`ts filename="app/api/items/route.ts"
// JSON 请求体
export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({ received: body })
}

// FormData 请求体
export async function PUT(request: Request) {
  const formData = await request.formData()
  const name = formData.get('name')
  const email = formData.get('email')
  return Response.json({ name, email })
}

// 纯文本
export async function PATCH(request: Request) {
  const text = await request.text()
  return new Response(\`Echo: \${text}\`)
}
\`\`\`

### 2.3 返回 Response

\`\`\`ts filename="app/api/route.ts"
// JSON
return Response.json({ data: 'value' })

// 自定义状态码
return new Response('Not Found', { status: 404 })

// 自定义头
return new Response('OK', {
  status: 200,
  headers: { 'X-Custom-Header': 'value' }
})

// 流式响应
return new Response(stream, {
  headers: { 'Content-Type': 'text/plain' }
})
\`\`\`

## 三、动态路由参数（Next.js 16：params 是 Promise）

⚠️ **Next.js 16 重大变更**：\`params\` 现在是 **Promise**，必须 \`await\`。这是从 v15 开始的破坏性变更：

\`\`\`ts filename="app/dashboard/[team]/route.ts"
// ✅ Next.js 16 写法：params 是 Promise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ team: string }> }
) {
  const { team } = await params // 必须 await
  return Response.json({ team })
}
\`\`\`

多段动态路由：

\`\`\`ts filename="app/shop/[tag]/[item]/route.ts"
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string; item: string }> }
) {
  const { tag, item } = await params
  return Response.json({ tag, item })
}
\`\`\`

Catch-all 路由：

\`\`\`ts filename="app/blog/[...slug]/route.ts"
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params // slug 是数组，如 ['2024', '01', 'hello']
  return Response.json({ path: slug.join('/') })
}
\`\`\`

| 路由 | URL | params |
| --- | --- | --- |
| \`app/dashboard/[team]/route.js\` | \`/dashboard/1\` | \`Promise<{ team: '1' }>\` |
| \`app/shop/[tag]/[item]/route.js\` | \`/shop/1/2\` | \`Promise<{ tag: '1', item: '2' }>\` |
| \`app/blog/[...slug]/route.js\` | \`/blog/1/2\` | \`Promise<{ slug: ['1', '2'] }>\` |

### RouteContext 类型助手

TypeScript 用户可用全局 \`RouteContext\` 助手获得强类型 params：

\`\`\`ts filename="app/users/[id]/route.ts"
import type { NextRequest } from 'next/server'

// RouteContext 是全局可用的，无需导入
export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
  return Response.json({ id })
}
\`\`\`

## 四、读取 cookies 和 headers（Next.js 16 异步）

⚠️ **Next.js 16 重大变更**：\`cookies()\` 和 \`headers()\` 现在是 **异步函数**，必须 \`await\`：

### 4.1 读取 cookies

\`\`\`ts filename="app/api/route.ts"
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // ✅ Next.js 16：必须 await
  const cookieStore = await cookies()

  const token = cookieStore.get('token')?.value
  return Response.json({ token })
}
\`\`\`

也可以直接从 \`NextRequest\` 读：

\`\`\`ts filename="app/api/route.ts"
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  return Response.json({ token })
}
\`\`\`

### 4.2 设置 / 删除 cookies

\`\`\`ts filename="app/api/route.ts"
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()

  // 设置
  cookieStore.set('session', 'abc123', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 天
  })

  // 删除
  cookieStore.delete('oldSession')

  return Response.json({ ok: true })
}
\`\`\`

或通过 \`Set-Cookie\` 响应头：

\`\`\`ts
return new Response('OK', {
  headers: { 'Set-Cookie': 'token=abc123; HttpOnly; Path=/' }
})
\`\`\`

### 4.3 读取 headers

\`\`\`ts filename="app/api/route.ts"
import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // ✅ Next.js 16：必须 await
  const headersList = await headers()

  const userAgent = headersList.get('user-agent')
  const referer = headersList.get('referer')
  const auth = headersList.get('authorization')

  return Response.json({ userAgent, referer, hasAuth: !!auth })
}
\`\`\`

> ⚠️ \`headers()\` 返回的是 **只读** 实例。要设置响应头，在 \`new Response()\` 中传 \`headers\`。

## 五、Demo：REST API CRUD

完整的文章 CRUD API：

\`\`\`ts filename="app/api/posts/route.ts"
import { headers } from 'next/headers'

// GET /api/posts — 列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
  })

  return Response.json({ data: posts, page, limit })
}

// POST /api/posts — 创建
export async function POST(request: Request) {
  // 鉴权
  const headersList = await headers()
  const auth = headersList.get('authorization')
  if (!auth) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 解析请求体
  const body = await request.json()
  const { title, content } = body

  if (!title || !content) {
    return Response.json(
      { error: 'title 和 content 必填' },
      { status: 400 }
    )
  }

  // 写库
  const post = await db.post.create({ data: { title, content } })

  return Response.json(post, { status: 201 })
}
\`\`\`

\`\`\`ts filename="app/api/posts/[id]/route.ts"
// GET /api/posts/:id — 详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // Next.js 16：await
  const post = await db.post.findUnique({ where: { id } })

  if (!post) {
    return new Response('Not Found', { status: 404 })
  }

  return Response.json(post)
}

// PUT /api/posts/:id — 更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const post = await db.post.update({
    where: { id },
    data: body,
  })

  return Response.json(post)
}

// DELETE /api/posts/:id — 删除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.post.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
\`\`\`

## 六、流式响应

### 6.1 Demo：流式文本

Route Handlers 支持用 Web Streams API 流式返回数据，非常适合 LLM 流式输出、大文件下载：

\`\`\`ts filename="app/api/stream/route.ts"
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // 每 200ms 发送一个 chunk
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(\`Chunk \${i + 1}\\n\`))
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
\`\`\`

用 \`curl -N http://localhost:3000/api/stream\` 可以看到 chunk 逐个到达。

### 6.2 用 async iterator 生成流

\`\`\`ts filename="app/api/route.ts"
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

const encoder = new TextEncoder()

async function* makeIterator() {
  yield encoder.encode('<p>第一段</p>')
  await new Promise((r) => setTimeout(r, 200))
  yield encoder.encode('<p>第二段</p>')
  await new Promise((r) => setTimeout(r, 200))
  yield encoder.encode('<p>第三段</p>')
}

export async function GET() {
  const iterator = makeIterator()
  const stream = iteratorToStream(iterator)
  return new Response(stream)
}
\`\`\`

### 6.3 流式文件下载

\`\`\`ts filename="app/api/download/route.ts"
import { open } from 'node:fs/promises'

export async function GET() {
  // 不把整个文件读入内存，直接流式返回
  const file = await open('/path/to/large-file.csv')
  return new Response(file.readableWebStream(), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="data.csv"',
    },
  })
}
\`\`\`

## 七、缓存与 Cache Components

### 7.1 默认不缓存

⚠️ **Next.js 16 重要变更**：Route Handlers **默认不缓存**（GET 也不例外）。这与早期版本（Next.js 13/14 默认缓存 GET）不同。

要缓存 GET 响应，用路由段配置：

\`\`\`ts filename="app/items/route.ts"
// 强制静态化，构建时缓存
export const dynamic = 'force-static'

export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: { 'API-Key': process.env.DATA_API_KEY! },
  })
  const data = await res.json()
  return Response.json({ data })
}
\`\`\`

### 7.2 revalidate 时间缓存

\`\`\`ts filename="app/posts/route.ts"
// 每 60 秒重新验证一次
export const revalidate = 60

export async function GET() {
  const data = await fetch('https://api.vercel.app/blog')
  const posts = await data.json()
  return Response.json(posts)
}
\`\`\`

### 7.3 use cache + cacheLife（Cache Components）

启用 Cache Components 后，可用 \`use cache\` + \`cacheLife\` 缓存 uncached 数据：

\`\`\`ts filename="app/api/products/route.ts"
import { cacheLife } from 'next/cache'

export async function GET() {
  // 调用缓存函数
  const products = await getProducts()
  return Response.json(products)
}

// ⚠️ use cache 不能直接在 Route Handler 体内使用
// 必须提取成独立函数
async function getProducts() {
  'use cache'
  cacheLife('hours') // 缓存小时级

  return await db.query('SELECT * FROM products')
}
\`\`\`

### 7.4 Request Memoization

同一请求内的多次相同 fetch 会被自动记忆化，不会重复发起：

\`\`\`ts filename="app/api/route.ts"
export async function GET(request: Request) {
  // 同一次请求内，两次相同 fetch 只发一次
  const [a, b] = await Promise.all([
    fetch('https://api.example.com/user'),
    fetch('https://api.example.com/user'),
  ])
  // a 和 b 是同一个响应的副本
  return Response.json({ ok: true })
}
\`\`\`

## 八、CORS 与 Webhook

### 8.1 设置 CORS 头

\`\`\`ts filename="app/api/route.ts"
export async function GET(request: Request) {
  return new Response('Hello', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
\`\`\`

### 8.2 接收 Webhook

\`\`\`ts filename="app/api/webhook/route.ts"
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    // 处理 webhook（如 GitHub push、Stripe payment 等）
    console.log('Received webhook:', payload.event)
    return new Response('Success', { status: 200 })
  } catch (error) {
    return new Response(\`Webhook error: \${error.message}\`, {
      status: 400,
    })
  }
}
\`\`\`

> 💡 与 Pages Router 不同，Route Handlers **不需要** \`bodyParser\` 配置。

## 九、非 UI 响应

Route Handlers 不只能返回 JSON，还能返回 XML、RSS、纯文本等：

\`\`\`ts filename="app/rss.xml/route.ts"
export async function GET() {
  const posts = await getAllPosts()

  const xml = \`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>我的博客</title>
  <link>https://example.com</link>
  <description>最新文章</description>
  \${posts.map((p) => \`
    <item>
      <title>\${p.title}</title>
      <link>https://example.com/posts/\${p.slug}</link>
    </item>
  \`).join('')}
</channel>
</rss>\`

  return new Response(xml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
\`\`\`

## 十、路由段配置

Route Handlers 支持与 page/layout 相同的路由段配置：

\`\`\`ts filename="app/items/route.ts"
export const dynamic = 'auto'           // 动态模式：auto/force-dynamic/force-static
export const dynamicParams = true       // 动态参数是否允许
export const revalidate = false         // 重新验证间隔
export const fetchCache = 'auto'        // fetch 缓存策略
export const runtime = 'nodejs'         // 运行时：nodejs/edge
export const preferredRegion = 'auto'   // 部署区域
\`\`\`

## 十一、Route Handlers vs Server Actions

| 维度 | Route Handlers | Server Actions |
| --- | --- | --- |
| 触发方式 | HTTP 请求 | 函数调用 |
| URL | 有明确 URL | 无明确 URL |
| 适用场景 | 公开 API、Webhook、第三方集成 | 应用内表单提交、数据变更 |
| 缓存 | 可缓存 | 不缓存 |
| 类型安全 | 需手动维护 | 自动推导 |
| HTTP 方法 | 全部支持 | 仅 POST |

**选择建议**：
- 对外提供 API（第三方调用、Webhook）→ Route Handlers
- 应用内部表单提交、按钮交互 → Server Actions

## 小结

1. **\`route.js\` 导出 HTTP 方法函数**，不能与 \`page.js\` 同级共存
2. **Next.js 16：\`params\` 是 Promise**，必须 \`await\`
3. **Next.js 16：\`cookies()\`、\`headers()\` 异步**，必须 \`await\`
4. **默认不缓存**，用 \`dynamic = 'force-static'\` 或 \`revalidate\` 缓存
5. **\`use cache\` 必须在独立函数中**，不能直接写在 Route Handler 体内
6. **流式响应**用 Web Streams API，适合 LLM、大文件
7. **CORS、Webhook、非 UI 响应** 都能用 Route Handlers 处理

> 至此，Next.js 16 数据与交互篇 5 章全部完成。下一步建议结合实战项目，把这些概念融会贯通。
`
  },
];
