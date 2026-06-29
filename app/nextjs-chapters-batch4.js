export const chapters = [
  {
    id: "nextjs-caching",
    group: "性能与缓存",
    icon: "🗄️",
    title: "缓存机制全景解析",
    content: `

# 缓存机制全景解析

缓存是 Next.js 性能优化的核心。Next.js 16 引入了 **Cache Components**（缓存组件）模型，把过去分散在 \`fetch\`、路由段配置、实验性 PPR 里的缓存能力统一成一套基于 \`'use cache'\` 指令的体系。本章先讲清楚 Next.js 16 启用 Cache Components 之后的四层缓存模型，再给出可直接运行的 demo，最后强调与 Next.js 15 的破坏性差异。

## 一、为什么 Next.js 16 重新设计了缓存

Next.js 15 之前的缓存系统有四个相互独立、配置分散的层（Request Memoization、Data Cache、Full Route Cache、Router Cache），开发者经常被 \`fetch\` 默认缓存、\`revalidate\` 路由段配置、\`dynamic = 'force-static'\` 这些"隐式行为"绕晕。Next.js 16 的 Cache Components 模型做了三件事：

1. **默认不缓存**：所有数据获取默认是动态的，不再有"fetch 默认 force-cache"这种隐式行为。
2. **显式缓存**：用 \`'use cache'\` 指令显式声明"我要缓存这个函数 / 组件 / 路由"，配合 \`cacheLife\` 控制时长。
3. **PPR 默认开启**：启用 \`cacheComponents: true\` 后，Partial Prerendering 自动启用，\`experimental.ppr\` 已被移除。

> ⚠️ **Next.js 16 破坏性变更**：\`experimental.ppr\` 配置项和 \`experimental_ppr\` 路由段配置都已被移除。要启用 PPR，必须设置 \`cacheComponents: true\`。

## 二、启用 Cache Components

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

// Next.js 16：启用 Cache Components（同时自动启用 PPR）
const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
\`\`\`

启用后才能使用以下 API：

- \`'use cache'\` 指令（数据层 / UI 层 / 文件层）
- \`cacheLife(profile)\` 函数：控制缓存时长
- \`cacheTag(tag)\` 函数：给缓存打标签，便于按需失效

> 注意：如果之前用过 \`experimental.useCache\` 或 \`experimental.dynamicIO\`，必须迁移到顶层的 \`cacheComponents\` 配置。

## 三、四层缓存全景对照

Cache Components 启用后，缓存仍然可以理解成"四层"，但每层的行为都与旧版有差异。下表是 Next.js 16 的实际语义：

| 缓存层 | 作用域 | 生命周期 | 失效方式 | Next.js 16 关键变化 |
| --- | --- | --- | --- | --- |
| **Request Memoization** | 单次请求 | 请求结束即销毁 | 请求结束自动失效 | 行为不变，但仍只对 \`fetch\` 起作用 |
| **Data Cache（'use cache'）** | 跨请求、跨用户 | 由 \`cacheLife\` 控制 | \`revalidateTag\` / \`updateTag\` / \`revalidatePath\` / 时间到期 | 由 \`'use cache'\` 显式声明，不再是 fetch 默认行为 |
| **Full Route Cache** | 跨请求 | 与最外层 \`cacheLife\` 一致 | 同上 | 默认不再"全静态"，路由是否缓存取决于是否使用 \`'use cache'\` |
| **Router Cache（Client Cache）** | 浏览器端单标签页 | \`stale\` 时长（最低 30s） | \`refresh\` / 标签页关闭 / 时间到期 | \`stale\` 由 \`cacheLife\` 控制，最低 30 秒强制下限 |

理解要点：

1. **Request Memoization** 是 React Server Components 内置的去重机制，同一个请求里多次调用 \`fetch(url)\` 只会真正执行一次。它在 Next.js 16 没变化，但只在 \`fetch\` 上生效，普通异步函数的去重要靠 \`'use cache'\`。
2. **Data Cache** 在 Next.js 16 是显式的：你必须用 \`'use cache'\` 标记一个函数或组件，它的返回值才会被缓存。缓存键由参数 + 闭包变量自动生成。
3. **Full Route Cache** 不再是默认行为。只有当 \`layout.tsx\` 和 \`page.tsx\` 同时使用 \`'use cache'\` 时，整条路由才会被预渲染并缓存。
4. **Router Cache** 由 \`cacheLife\` 的 \`stale\` 字段控制，但客户端导航有 30 秒的最低下限，避免预取链接在用户点击前就过期。

## 四、'use cache' 的三个层级

\`'use cache'\` 可以加在三个层级，覆盖粒度从细到粗：

\`\`\`tsx filename="app/lib/data.ts"
import { cacheLife, cacheTag } from 'next/cache'

// 1. 数据层：缓存单个异步函数的返回值
//    适合 DB 查询、第三方 API 调用
export async function getUsers() {
  'use cache'
  cacheLife('hours') // 1 小时后台 revalidate，1 天 expire
  cacheTag('users')  // 打标签，便于按需失效
  return db.query('SELECT * FROM users')
}
\`\`\`

\`\`\`tsx filename="app/components/UserList.tsx"
import { cacheLife } from 'next/cache'
import { getUsers } from '@/lib/data'

// 2. UI 层：缓存整个组件的渲染输出
//    组件的 props 会自动成为缓存键的一部分
export async function UserList({ limit = 10 }: { limit?: number }) {
  'use cache'
  cacheLife('hours')

  const users = await getUsers()
  return (
    <ul>
      {users.slice(0, limit).map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
\`\`\`

\`\`\`tsx filename="app/page.tsx"
import { cacheLife } from 'next/cache'

// 3. 路由层：在 page 或 layout 顶部加 'use cache'
//    要让整条路由预渲染，layout 和 page 必须都加
export default async function Page() {
  'use cache'
  cacheLife('days')

  const res = await fetch('https://api.example.com/dashboard')
  const data = await res.json()
  return <main>{data.title}</main>
}
\`\`\`

> **关键约束**：\`'use cache'\` 内部不能直接调用 \`cookies()\`、\`headers()\`、\`searchParams\`。需要这些值时，在外层读取后作为参数传进来。

## 五、cacheLife 预设 profile

\`cacheLife\` 接受预设 profile 或自定义对象。预设 profile 是 Next.js 内置的"缓存时长套餐"：

| Profile | 用途 | \`stale\`（客户端） | \`revalidate\`（服务端） | \`expire\`（强制过期） |
| --- | --- | --- | --- | --- |
| \`default\` | 标准内容（不调用 cacheLife 时） | 5 分钟 | 15 分钟 | 永不 |
| \`seconds\` | 实时数据（股票、比分） | 30 秒 | 1 秒 | 1 分钟 |
| \`minutes\` | 频繁更新（社交、新闻） | 5 分钟 | 1 分钟 | 1 小时 |
| \`hours\` | 每日多次更新（库存、天气） | 5 分钟 | 1 小时 | 1 天 |
| \`days\` | 每日更新（博客、文章） | 5 分钟 | 1 天 | 1 周 |
| \`weeks\` | 每周更新（播客、周刊） | 5 分钟 | 1 周 | 30 天 |
| \`max\` | 极少变化（法律页、归档） | 5 分钟 | 30 天 | 1 年 |

三个字段的含义：

- \`stale\`：客户端路由缓存能用多久——这段时间内浏览器不会向服务器检查更新。
- \`revalidate\`：服务端多久在后台重新生成一次——请求到达时若已过期，先返回旧内容，再在后台刷新。
- \`expire\`：完全过期时间——超过这个时间没有流量，下次请求会阻塞等待新内容生成。

> ⚠️ **重要**：使用 \`seconds\` profile、\`revalidate: 0\` 或 \`expire\` 小于 5 分钟的缓存会被自动排除出预渲染，变成"动态洞"（dynamic hole），需要用 \`<Suspense>\` 包裹。

## 六、Demo：四层缓存行为演示

下面这个 demo 用日志揭示缓存命中行为。启动后访问多次，观察控制台输出。

\`\`\`tsx filename="app/cache-demo/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import { Suspense } from 'react'

// 数据层缓存：1 分钟 revalidate，1 小时 expire
async function getServerTime() {
  'use cache'
  cacheLife('minutes')
  cacheTag('server-time')

  // 这个 console.log 只会在缓存未命中时执行
  // 同一请求里多次调用 getServerTime() 只会执行一次（Request Memoization）
  // 跨请求时若 cacheLife 未到期，也不会执行（Data Cache）
  console.log('[cache miss] 真正执行了 fetch 时间')
  const now = await fetch('https://worldtimeapi.org/api/ip').then((r) => r.json())
  return now.datetime as string
}

export default async function Page() {
  // 同一请求里调用两次：第二次会命中 Request Memoization
  const t1 = await getServerTime()
  const t2 = await getServerTime()

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">缓存层演示</h1>
      <p>第一次调用：{t1}</p>
      <p>第二次调用：{t2}</p>
      <p className="text-sm text-gray-500 mt-4">
        刷新页面观察：1 分钟内 t1 / t2 都不变（Data Cache 命中）；
        同一请求里只打印一次 [cache miss]（Request Memoization）。
      </p>
    </main>
  )
}
\`\`\`

## 七、Demo：缓存键与参数化

\`'use cache'\` 函数的参数会自动成为缓存键的一部分。这意味着不同入参产生独立的缓存条目，可以做"个性化缓存"。

\`\`\`tsx filename="app/users/[id]/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'

// 缓存键包含 userId，每个用户一份独立缓存
async function getUserProfile(userId: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(\`user-\${userId}\`) // 按用户 ID 打标签，便于按需失效

  console.log(\`[cache miss] 查询用户 \${userId}\`)
  const res = await fetch(\`https://api.example.com/users/\${userId}\`)
  return res.json()
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUserProfile(id)
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
\`\`\`

> 闭包变量也会自动成为缓存键。如果你在 \`'use cache'\` 函数里引用了外层的变量，Next.js 会把它当作隐式参数序列化进缓存键。

## 八、Demo：运行时数据 + 缓存数据混合

实际页面往往需要混合"缓存的静态内容"和"按请求变化的动态内容"。Cache Components 模型下，动态部分必须用 \`<Suspense>\` 包裹。

\`\`\`tsx filename="app/dashboard/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

// 缓存层：所有用户看到同一份统计数据
async function Stats() {
  'use cache'
  cacheLife('hours')
  cacheTag('stats')

  const stats = await fetch('https://api.example.com/stats').then((r) => r.json())
  return (
    <section>
      <h2>站点统计（每小时刷新）</h2>
      <p>总访问量：{stats.totalViews}</p>
    </section>
  )
}

// 动态层：依赖 cookie，必须用 Suspense 包裹
async function UserGreeting() {
  const cookieStore = await cookies()
  const name = cookieStore.get('username')?.value || '匿名'
  return <p>你好，{name}！</p>
}

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">仪表盘</h1>

      {/* 缓存：构建时进入静态壳 */}
      <Stats />

      {/* 动态：请求时流式注入 */}
      <Suspense fallback={<p>加载中...</p>}>
        <UserGreeting />
      </Suspense>
    </main>
  )
}
\`\`\`

## 九、与 Next.js 15 的破坏性差异速查

| 维度 | Next.js 15 | Next.js 16 |
| --- | --- | --- |
| 默认 fetch 行为 | 默认 \`force-cache\` | 默认不缓存 |
| 启用 PPR | \`experimental.ppr: true\` | \`cacheComponents: true\`（PPR 自动启用） |
| 缓存控制 | \`export const revalidate = N\` | \`'use cache'\` + \`cacheLife('hours')\` |
| 强制动态 | \`export const dynamic = 'force-dynamic'\` | 不再需要，默认就是动态 |
| 强制静态 | \`export const dynamic = 'force-static'\` | 用 \`'use cache'\` + \`cacheLife('max')\` |
| fetch 缓存控制 | \`export const fetchCache = 'force-cache'\` | 不再需要，\`'use cache'\` 内 fetch 自动缓存 |
| \`revalidateTag\` 签名 | \`revalidateTag('posts')\` | \`revalidateTag('posts', 'max')\` 第二参数必填 |

## 十、调试与排错

打开详细缓存日志：

\`\`\`bash filename="终端"
# 开发环境
NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev

# 生产环境
NEXT_PRIVATE_DEBUG_CACHE=1 npm run start
\`\`\`

常见错误：

1. **构建超时（50 秒）**：\`'use cache'\` 函数内部访问了 \`cookies()\` 或 \`params\` Promise。把运行时数据移到外层，把值作为参数传入。
2. **Uncached data was accessed outside of \`<Suspense>\`**：异步组件没有用 \`'use cache'\` 标记，也没有用 \`<Suspense>\` 包裹。二选一。
3. **Nested short-lived cache error**：外层 \`'use cache'\` 没有显式 \`cacheLife\`，但内部嵌套了 \`seconds\` profile 的短缓存。给外层加 \`cacheLife('default')\` 或更长 profile。

## 小结

Next.js 16 的缓存模型从"隐式默认"转向"显式声明"——\`'use cache'\` 是入口，\`cacheLife\` 是时长，\`cacheTag\` 是标签，\`updateTag\` / \`revalidateTag\` / \`revalidatePath\` 是按需失效，\`refresh\` 是刷新客户端路由。理解了四层缓存的作用域和生命周期，就能精准控制每一段内容的"新鲜度"与"性能"平衡。下一章我们会深入重新验证机制。
`,
  },
  {
    id: "nextjs-revalidating",
    group: "性能与缓存",
    icon: "🔄",
    title: "重新验证：ISR 与按需更新",
    content: `

# 重新验证：ISR 与按需更新

缓存让响应变快，但内容会变旧。"重新验证（revalidation）"就是更新缓存数据的机制。Next.js 16 提供两种策略：

- **基于时间**：用 \`cacheLife\` 设置多久自动刷新一次。
- **按需触发**：在数据变更时用 \`revalidateTag\` / \`updateTag\` / \`revalidatePath\` 主动失效。

本章重点讲 Next.js 16 的几个破坏性变化：\`revalidateTag\` 必须传第二个参数、\`updateTag\` 是新出现的"读己写"API、\`refresh\` 是刷新客户端路由的新 API。同时给出博客 ISR、按需更新、即时刷新的完整 demo。

## 一、cacheLife：时间驱动的重新验证

\`cacheLife\` 必须在 \`'use cache'\` 作用域内调用。它接受预设 profile 字符串或自定义对象。

\`\`\`tsx filename="app/lib/data.ts"
import { cacheLife, cacheTag } from 'next/cache'

// 预设 profile：1 小时 revalidate，1 天 expire
export async function getProducts() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  return db.query('SELECT * FROM products')
}

// 自定义对象：精细控制三个时间字段
export async function getRealtimePrice(symbol: string) {
  'use cache'
  cacheLife({
    stale: 0,        // 客户端立即检查
    revalidate: 30,  // 30 秒后台刷新
    expire: 300,     // 5 分钟强制过期
  })
  return fetch(\`https://api.example.com/price/\${symbol}\`).then((r) => r.json())
}
\`\`\`

时间字段含义回顾：

- \`stale\`：客户端路由缓存时长。客户端在这段时间内不会向服务器检查更新。最低 30 秒。
- \`revalidate\`：服务端在后台多久重新生成一次。请求到达时若已过期，先返回旧内容，再在后台刷新。
- \`expire\`：完全过期时间。超过这个时间，下次请求会**阻塞**等待新内容生成。

> **stale-while-revalidate 语义**：当 \`revalidate\` 时间已过但 \`expire\` 时间未到，请求会立即返回旧缓存（stale），同时在后台重新生成（revalidate）。这就是经典的 SWR 行为，由 Next.js 自动处理。

## 二、ISR（增量静态再生）

ISR 是 \`cacheLife\` + \`generateStaticParams\` 的组合：构建时预生成一批页面，运行时按 \`revalidate\` 周期后台刷新。

\`\`\`tsx filename="app/blog/[slug]/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'

interface Post {
  id: string
  title: string
  content: string
}

// 1. 构建时预生成已知的博客 slug
export async function generateStaticParams() {
  const posts: Post[] = await fetch('https://api.vercel.app/blog').then((r) =>
    r.json()
  )
  return posts.map((post) => ({ slug: String(post.id) }))
}

// 2. 整页缓存：1 天 revalidate，1 周 expire
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 在 page 顶部加 'use cache'，整页进入 ISR
  'use cache'
  cacheLife('days')
  cacheTag(\`post-\${slug}\`)

  const post: Post = await fetch(
    \`https://api.vercel.app/blog/\${slug}\`
  ).then((r) => r.json())

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
\`\`\`

ISR 的运行流程：

1. **构建时**：执行 \`generateStaticParams\`，为每个返回的 slug 预渲染页面并写入静态存储。
2. **首次访问已预渲染页**：直接返回静态 HTML，毫秒级响应。
3. **超过 revalidate 时间后的访问**：先返回旧页面（STALE），后台生成新版本，生成完毕后替换。
4. **访问未预渲染的 slug**：按 \`dynamicParams\` 默认值 \`true\`，会按需生成新页面（fallback 行为）。
5. **响应头**：可通过 \`x-nextjs-cache\` 观察状态——\`HIT\` / \`STALE\` / \`MISS\` / \`REVALIDATED\`。

## 三、按需重新验证：revalidateTag

\`revalidateTag\` 用于按标签失效缓存。**Next.js 16 破坏性变更**：第二个参数现在是必填的，单参数形式已废弃并产生 TypeScript 错误。

\`\`\`ts filename="lib/revalidate.ts"
import { revalidateTag } from 'next/cache'

// ❌ Next.js 15：单参数（已废弃）
// revalidateTag('posts')

// ✅ Next.js 16：第二参数指定 revalidate 行为
// 'max' 表示最长 stale 窗口：用户看到旧内容，后台刷新
revalidateTag('posts', 'max')

// 也可以传自定义对象，用于需要立即过期的 webhook 场景
revalidateTag('posts', { expire: 0 })
\`\`\`

第二个参数的可选值：

- \`'max'\`（推荐）：标记为 stale，下次访问时旧内容立刻返回，新内容后台生成。
- 任意 \`cacheLife\` profile 名（如 \`'days'\` / \`'hours'\`）：自定义重新验证窗口。
- \`{ expire: 0 }\`：立即过期，下次请求阻塞等待新内容。适用于 webhook 等外部系统要求即时失效的场景。

> **使用范围**：\`revalidateTag\` 可以在 Server Action 和 Route Handler 中调用，不能在 Client Component 或 Proxy 中调用。

### Demo：博客发布后按需更新

\`\`\`tsx filename="app/blog/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'

// 列表页：缓存 1 天，打 'posts' 标签
async function PostList() {
  'use cache'
  cacheLife('days')
  cacheTag('posts')

  const posts = await fetch('https://api.example.com/posts').then((r) => r.json())
  return (
    <ul>
      {posts.map((p: any) => (
        <li key={p.id}>
          <Link href={\`/blog/\${p.id}\`}>{p.title}</Link>
        </li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <main>
      <h1>博客</h1>
      <PostList />
    </main>
  )
}
\`\`\`

\`\`\`tsx filename="app/admin/publish/route.ts"
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

// CMS webhook 调用这个路由，按需失效 'posts' 缓存
export async function POST(request: NextRequest) {
  const body = await request.json()
  const secret = request.headers.get('x-webhook-secret')

  if (secret !== process.env.WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  // ✅ 'max' 让列表页"旧内容立即返回，新内容后台生成"
  revalidateTag('posts', 'max')

  // 如果有具体文章缓存，也可以一并失效
  if (body.postId) {
    revalidateTag(\`post-\${body.postId}\`, 'max')
  }

  return Response.json({ revalidated: true, now: Date.now() })
}
\`\`\`

## 四、updateTag：读己写即时刷新

\`updateTag\` 是 Next.js 16 新增的 API，专门解决"读己写"（read-your-own-writes）问题：用户提交表单后，应**立即**看到自己刚提交的内容，而不是旧缓存。

**与 \`revalidateTag\` 的关键差异**：

| 维度 | \`updateTag\` | \`revalidateTag\` |
| --- | --- | --- |
| 使用范围 | **只能在 Server Action 中** | Server Action + Route Handler |
| 行为 | 立即过期，下次请求阻塞等待新内容 | stale-while-revalidate，先返回旧内容 |
| 适用场景 | 用户提交后立即看到自己的更新 | 后台刷新，可容忍轻微延迟 |

### Demo：发布评论立即显示

\`\`\`tsx filename="app/posts/[id]/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import { Suspense } from 'react'
import { createComment } from '@/app/actions'

// 评论列表缓存：缓存 1 天，按 post-id 打标签
async function Comments({ postId }: { postId: string }) {
  'use cache'
  cacheLife('days')
  cacheTag(\`comments-\${postId}\`)

  const comments = await fetch(
    \`https://api.example.com/posts/\${postId}/comments\`
  ).then((r) => r.json())

  return (
    <ul>
      {comments.map((c: any) => (
        <li key={c.id}>{c.body}</li>
      ))}
    </ul>
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <main>
      <h1>文章 {id}</h1>
      <Suspense fallback={<p>加载评论...</p>}>
        <Comments postId={id} />
      </Suspense>

      <form action={createComment}>
        <input type="hidden" name="postId" value={id} />
        <textarea name="body" required />
        <button type="submit">发表评论</button>
      </form>
    </main>
  )
}
\`\`\`

\`\`\`ts filename="app/actions.ts"
'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export async function createComment(formData: FormData) {
  const postId = formData.get('postId') as string
  const body = formData.get('body') as string

  // 写入数据库
  await db.comment.create({ data: { postId, body } })

  // ✅ updateTag：立即过期，下次请求会重新查询数据库
  // 这样用户 redirect 回详情页时看到的就是新评论，而不是旧缓存
  updateTag(\`comments-\${postId}\`)

  redirect(\`/posts/\${postId}\`)
}
\`\`\`

> ⚠️ 注意：\`updateTag\` 在 Route Handler 中调用会直接抛错。如果要在 webhook 里做"立即失效"，请用 \`revalidateTag(tag, { expire: 0 })\`。

## 五、refresh：刷新客户端路由

\`refresh\` 是 Next.js 16 新增的 Server Action API，用于强制刷新**客户端路由缓存**。它会清空当前客户端缓存的所有 RSC payload，让下次导航重新向服务器请求。

\`\`\`ts filename="app/actions.ts"
'use server'

import { refresh, updateTag } from 'next/cache'
import { db } from '@/lib/db'

// 场景：用户在设置页修改了主题色，需要刷新当前页面所有缓存
export async function updateTheme(formData: FormData) {
  const theme = formData.get('theme') as string
  await db.user.update({ where: { id: currentUserId }, data: { theme } })

  // 1. 让服务端缓存失效
  updateTag('user-settings')

  // 2. 让客户端路由缓存也失效，下次导航重新获取
  refresh()
}
\`\`\`

\`refresh\` 的几个特点：

- **只能在 Server Action 中调用**，在 Route Handler 中调用会抛错。
- 调用后会清空**整个客户端路由缓存**，不仅是当前路由。
- 不会重渲染当前页面——它只影响后续导航。要重渲染当前页，配合 \`router.refresh()\`（客户端）或 \`redirect\`。

## 六、revalidatePath：按路径失效

\`revalidatePath\` 失效指定路径下的所有缓存数据。优先级低于按 tag 失效（更精准）。

\`\`\`ts filename="app/actions.ts"
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function updateProfile(userId: string) {
  await db.user.update(...)

  // 失效 /profile 和 /profile/[id] 两个路径的缓存
  revalidatePath('/profile')
  revalidatePath(\`/profile/\${userId}\`)

  // 失效整个 layout 下所有页面
  revalidatePath('/blog', 'layout')
}
\`\`\`

> 官方建议：能用 tag 失效就用 tag，\`revalidatePath\` 容易过度失效。

## 七、Demo：完整的 ISR + 按需更新流程

下面是一个新闻站点场景：首页列表用 ISR 每小时刷新，详情页用 \`cacheTag\` 标签按需更新，编辑后用 \`updateTag\` 即时显示。

\`\`\`tsx filename="app/news/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'

// 首页：ISR 1 小时刷新
async function NewsList() {
  'use cache'
  cacheLife('hours')
  cacheTag('news-list')

  const news = await fetch('https://api.example.com/news').then((r) => r.json())
  return (
    <ul>
      {news.map((n: any) => (
        <li key={n.id}>
          <Link href={\`/news/\${n.id}\`}>{n.title}</Link>
        </li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <main>
      <h1>新闻</h1>
      <NewsList />
    </main>
  )
}
\`\`\`

\`\`\`tsx filename="app/news/[id]/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  'use cache'
  cacheLife('days')
  cacheTag(\`news-\${id}\`)

  const item = await fetch(\`https://api.example.com/news/\${id}\`).then((r) =>
    r.json()
  )

  return (
    <article>
      <h1>{item.title}</h1>
      <p>{item.body}</p>
    </article>
  )
}
\`\`\`

\`\`\`ts filename="app/editor/actions.ts"
'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

// 编辑后保存：读己写场景，立即看到更新
export async function saveNews(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string

  await db.news.update({ where: { id }, data: { title, body } })

  // 失效当前文章 + 列表
  updateTag(\`news-\${id}\`)
  updateTag('news-list')

  redirect(\`/news/\${id}\`)
}
\`\`\`

\`\`\`ts filename="app/api/webhook/route.ts"
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

// 第三方 CMS 推送 webhook：用 revalidateTag（不能在 Route Handler 用 updateTag）
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature')
  if (signature !== process.env.WEBHOOK_SIGNATURE) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { newsId } = await request.json()
  // 'max' 让用户看到旧内容，后台刷新
  revalidateTag(\`news-\${newsId}\`, 'max')
  revalidateTag('news-list', 'max')

  return Response.json({ ok: true })
}
\`\`\`

## 八、API 速查表

| API | 调用位置 | 行为 | 典型场景 |
| --- | --- | --- | --- |
| \`cacheLife(profile)\` | \`'use cache'\` 内部 | 设置时长 | 控制缓存有效期 |
| \`cacheTag(tag)\` | \`'use cache'\` 内部 | 打标签 | 准备失效目标 |
| \`revalidateTag(tag, 'max')\` | Server Action / Route Handler | stale-while-revalidate | webhook、CMS 推送 |
| \`revalidateTag(tag, { expire: 0 })\` | 同上 | 立即过期 | 需要即时失效的外部触发 |
| \`updateTag(tag)\` | **仅 Server Action** | 立即过期 + 阻塞重新生成 | 用户提交后立即看到更新 |
| \`revalidatePath(path)\` | Server Action / Route Handler | 按路径失效 | 整页失效 |
| \`refresh()\` | **仅 Server Action** | 清空客户端路由缓存 | 强制下次导航重新请求 |

## 小结

Next.js 16 把重新验证 API 重新设计得更明确了：\`revalidateTag\` 用于"可容忍轻微延迟"的场景，必须传第二参数；\`updateTag\` 用于"读己写"场景，只能在 Server Action 中用；\`refresh\` 是客户端路由缓存刷新的新工具。配合 \`cacheLife\` 的时间驱动和 \`cacheTag\` 的标签化失效，可以精准控制每段内容的新鲜度。下一章我们看 Cache Components 与 PPR 的关系。
`,
  },
  {
    id: "nextjs-cache-components",
    group: "性能与缓存",
    icon: "⚡",
    title: "Cache Components 与 PPR",
    content: `

# Cache Components 与 PPR

Cache Components 是 Next.js 16 最重要的架构变化。它把"什么应该被缓存"从路由段配置层面下移到组件 / 函数层面，让缓存粒度更细、更可控。同时它把 Partial Prerendering（PPR）从实验性功能变成了默认行为，让一条路由里可以同时存在"预渲染的静态壳"和"流式注入的动态内容"。

## 一、Next.js 16 重大变更：cacheComponents 取代 PPR

> ⚠️ **破坏性变更**：\`experimental.ppr\` 配置项已被移除。如果你之前用 \`experimental.ppr: true\`，必须迁移到 \`cacheComponents: true\`。

| Next.js 15 | Next.js 16 |
| --- | --- |
| \`experimental: { ppr: 'incremental' }\` | \`cacheComponents: true\` |
| \`experimental_ppr: true\`（路由段配置） | 已移除，自动跟随全局配置 |
| \`experimental.useCache\` | \`'use cache'\`（稳定版） |
| \`experimental.dynamicIO\` | 已合并到 \`cacheComponents\` |

\`cacheComponents\` 是一个**统一开关**，开启后同时激活：

1. \`'use cache'\` 指令
2. \`cacheLife\` / \`cacheTag\` 函数
3. Partial Prerendering 默认行为
4. React \`<Activity>\` 组件保持导航状态

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
\`\`\`

## 二、Cache Components 的工作原理

启用后，Next.js 在构建时对每条路由的组件树做"分类渲染"：

- **静态部分**：没有访问运行时 API 的代码、纯计算、同步 I/O——直接进入静态壳（HTML + RSC payload）。
- **缓存部分**：标了 \`'use cache'\` 的函数 / 组件——构建时执行一次，结果进入静态壳。运行时按 \`cacheLife\` 后台刷新。
- **动态部分**：访问 \`cookies()\` / \`headers()\` / \`searchParams\` / \`connection()\` 的组件——必须用 \`<Suspense>\` 包裹，运行时流式注入。

最终页面是"静态壳 + 动态洞"的混合体：

\`\`\`text
┌─────────────────────────────────┐
│  <header> 静态导航（构建时生成）  │  ← 静态
├─────────────────────────────────┤
│  <BlogPosts> 缓存的列表         │  ← 'use cache'（构建时 + 周期性刷新）
├─────────────────────────────────┤
│  <Suspense fallback="加载中">   │  ← 动态洞（请求时流式注入）
│    <UserPreferences />          │
│  </Suspense>                    │
└─────────────────────────────────┘
\`\`\`

这种渲染方式就叫 **Partial Prerendering（PPR）**，在 Next.js 16 是 Cache Components 启用后的默认行为。

## 三、'use cache' 指令的写法

\`'use cache'\` 可以加在三个位置：

### 1. 文件级（影响所有导出）

\`\`\`tsx filename="app/lib/data.ts"
// 文件顶部加 'use cache'：所有导出的异步函数都会被缓存
'use cache'

import { cacheLife } from 'next/cache'

export async function getUsers() {
  cacheLife('hours')
  return db.query('SELECT * FROM users')
}

export async function getPosts() {
  cacheLife('days')
  return db.query('SELECT * FROM posts')
}
\`\`\`

> 注意：文件级 \`'use cache'\` 要求所有导出函数都是 async。

### 2. 组件级

\`\`\`tsx filename="app/components/CachedHeader.tsx"
import { cacheLife } from 'next/cache'

export async function CachedHeader({ title }: { title: string }) {
  'use cache'
  cacheLife('days')

  // title 是 props，会自动成为缓存键
  return <header><h1>{title}</h1></header>
}
\`\`\`

### 3. 函数级

\`\`\`tsx filename="app/lib/api.ts"
import { cacheLife, cacheTag } from 'next/cache'

export async function fetchUserProfile(userId: string) {
  'use cache'
  cacheLife('hours')
  cacheTag(\`user-\${userId}\`)

  const res = await fetch(\`/api/users/\${userId}\`)
  return res.json()
}
\`\`\`

## 四、cacheLife profiles 详解

\`cacheLife\` 的预设 profile 在 Next.js 16 完整列表：

| Profile | \`stale\` | \`revalidate\` | \`expire\` | 推荐场景 |
| --- | --- | --- | --- | --- |
| \`default\` | 5 分钟 | 15 分钟 | 永不 | 不调用 cacheLife 时的兜底 |
| \`seconds\` | 30 秒 | 1 秒 | 1 分钟 | 实时数据 |
| \`minutes\` | 5 分钟 | 1 分钟 | 1 小时 | 频繁更新 |
| \`hours\` | 5 分钟 | 1 小时 | 1 天 | 每日多次更新 |
| \`days\` | 5 分钟 | 1 天 | 1 周 | 每日更新 |
| \`weeks\` | 5 分钟 | 1 周 | 30 天 | 每周更新 |
| \`max\` | 5 分钟 | 30 天 | 1 年 | 极少变化 |

### 自定义 profile

可以在 \`next.config.ts\` 中定义项目级 profile：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // 项目级自定义 profile
    editorial: {
      stale: 600,      // 10 分钟
      revalidate: 3600, // 1 小时
      expire: 86400,    // 1 天
    },
    // 也可以覆盖默认 profile
    days: {
      stale: 3600,      // 1 小时
      revalidate: 900,  // 15 分钟
      expire: 86400,    // 1 天
    },
  },
}

export default nextConfig
\`\`\`

使用：

\`\`\`tsx filename="app/editorial/page.tsx"
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('editorial') // 用自定义 profile
  // ...
}
\`\`\`

### 内联 profile

单次使用时可直接传对象：

\`\`\`tsx filename="app/api/offer/route.ts"
import { cacheLife } from 'next/cache'

async function getLimitedOffer() {
  'use cache'
  cacheLife({
    stale: 60,      // 1 分钟
    revalidate: 300, // 5 分钟
    expire: 3600,    // 1 小时
  })
  return getDb().offer.findFirst(...)
}
\`\`\`

## 五、cacheTag：缓存标签

\`cacheTag\` 给缓存打标签，便于按需失效。一个缓存可以有多个标签。

\`\`\`tsx filename="app/lib/data.ts"
import { cacheLife, cacheTag } from 'next/cache'

export async function getPost(slug: string) {
  'use cache'
  cacheLife('days')
  // 多标签：可以按 post-{slug} 单独失效，也可以按 posts 批量失效
  cacheTag('posts')
  cacheTag(\`post-\${slug}\`)

  return db.post.findUnique({ where: { slug } })
}
\`\`\`

## 六、动态函数：使路由变动态

下面这些 API 一旦在某个组件中被调用，会让该组件变成"动态洞"，必须用 \`<Suspense>\` 包裹：

- \`cookies()\`：读取请求 cookie
- \`headers()\`：读取请求头
- \`searchParams\`：URL 查询参数
- \`params\`：动态路由参数（除非用 \`generateStaticParams\` 提供了样本）
- \`connection()\`：显式声明等待请求连接（用于 \`Math.random()\` / \`Date.now()\` / \`crypto.randomUUID()\`）

### Demo：动态 + 静态混合页面

\`\`\`tsx filename="app/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { Suspense } from 'react'

// 缓存：进入静态壳
async function ProductList() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')

  const products = await fetch('https://api.example.com/products').then((r) =>
    r.json()
  )
  return (
    <ul>
      {products.map((p: any) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}

// 动态：读取 cookie
async function WelcomeMessage() {
  const cookieStore = await cookies()
  const name = cookieStore.get('username')?.value || '访客'
  return <p>欢迎回来，{name}！</p>
}

// 动态：每次生成不同 UUID
async function RequestId() {
  await connection() // 显式声明：我需要请求级数据
  const uuid = crypto.randomUUID()
  return <p>请求 ID：{uuid}</p>
}

export default function Page() {
  return (
    <main>
      <h1>商城首页</h1>

      {/* 静态：构建时进入静态壳 */}
      <ProductList />

      {/* 动态：流式注入 */}
      <Suspense fallback={<p>加载欢迎信息...</p>}>
        <WelcomeMessage />
      </Suspense>

      <Suspense fallback={<p>生成请求 ID...</p>}>
        <RequestId />
      </Suspense>
    </main>
  )
}
\`\`\`

## 七、从 PPR 迁移到 Cache Components

如果你在 Next.js 15 用过 \`experimental.ppr\`，迁移步骤：

### 1. 改配置

\`\`\`ts filename="next.config.ts"
// Before
const nextConfig = {
  experimental: { ppr: 'incremental' },
}

// After
const nextConfig = {
  cacheComponents: true,
}
\`\`\`

### 2. 移除路由段配置

\`\`\`tsx filename="app/page.tsx"
// Before
export const dynamic = 'force-dynamic'  // 不再需要
export const revalidate = 3600           // 改用 cacheLife
export const fetchCache = 'force-cache'  // 不再需要
export const experimental_ppr = true     // 已移除

// After
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours')
  // ...
}
\`\`\`

### 3. 处理运行时 API

之前用 \`force-static\` 强行静态化的页面，如果在 Cache Components 下报错"Uncached data was accessed outside of \`<Suspense>\`"，要么把运行时数据移出，要么用 \`<Suspense>\` 包裹：

\`\`\`tsx filename="app/page.tsx"
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<p>加载中...</p>}>
      <UserGreeting />
    </Suspense>
  )
}

async function UserGreeting() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'light'
  return <p>当前主题：{theme}</p>
}
\`\`\`

## 八、Demo：缓存组件 + 嵌套 cacheLife

嵌套 \`'use cache'\` 时，外层如果没有显式 \`cacheLife\`，会取内层最短的周期。建议外层显式设置避免意外。

\`\`\`tsx filename="app/dashboard/page.tsx"
import { cacheLife } from 'next/cache'
import { Suspense } from 'react'

// 内层：5 分钟刷新
async function RealtimeWidget() {
  'use cache'
  cacheLife('minutes')
  return <div>实时数据：{Math.floor(Date.now() / 60000)}</div>
}

// 外层：1 小时刷新
// ✅ 显式声明 cacheLife，避免被内层 minutes 拉低
export default async function Page() {
  'use cache'
  cacheLife('hours')

  return (
    <main>
      <h1>仪表盘</h1>
      {/* 内层有自己的 cacheLife，外层独立缓存 */}
      <RealtimeWidget />
    </main>
  )
}
\`\`\`

## 九、Demo：传递运行时值给缓存函数

\`'use cache'\` 内部不能调用 \`cookies()\`，但可以把 cookie 值作为参数传入。

\`\`\`tsx filename="app/profile/page.tsx"
import { cacheLife, cacheTag } from 'next/cache'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

// 缓存函数：sessionId 作为参数自动成为缓存键
async function CachedProfile({ sessionId }: { sessionId: string }) {
  'use cache'
  cacheLife('minutes')
  cacheTag(\`profile-\${sessionId}\`)

  const data = await fetch(\`https://api.example.com/me?session=\${sessionId}\`).then(
    (r) => r.json()
  )
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  )
}

// 动态包装：在外层读取 cookie
async function ProfileContent() {
  const session = (await cookies()).get('session')?.value || ''
  return <CachedProfile sessionId={session} />
}

export default function Page() {
  return (
    <Suspense fallback={<p>加载资料...</p>}>
      <ProfileContent />
    </Suspense>
  )
}
\`\`\`

## 十、UI 状态保持：React \<Activity\>

Cache Components 启用后，Next.js 用 React 19 的 \`<Activity>\` 组件保持导航状态——离开一个路由时不会卸载组件，而是切换到 \`"hidden"\` 模式。这意味着：

- 表单输入、滚动位置、\`useState\` 在导航后保留
- \`useEffect\` 在隐藏时清理，再次显示时重新执行
- 最近访问的几个路由都会被保留

如果你的代码依赖"卸载即重置"，需要显式重置逻辑：

\`\`\`tsx filename="app/components/SearchBox.tsx"
'use client'

import { useLayoutEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function SearchBox() {
  const [query, setQuery] = useState('')
  const pathname = usePathname()

  // 路径变化时清空（替代"卸载即重置"行为）
  useLayoutEffect(() => {
    setQuery('')
  }, [pathname])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
\`\`\`

## 小结

Cache Components 是 Next.js 16 的"统一缓存入口"——\`cacheComponents: true\` 一行配置同时启用 \`'use cache'\`、\`cacheLife\`、\`cacheTag\` 和 PPR。理解三个关键点就掌握了核心：\`'use cache'\` 标记缓存边界，\`cacheLife\` 控制时长，运行时 API 必须用 \`<Suspense>\` 包裹。从 Next.js 15 迁移时，记得移除所有路由段配置（\`dynamic\` / \`revalidate\` / \`fetchCache\` / \`experimental_ppr\`）。
`,
  },
  {
    id: "nextjs-images-fonts",
    group: "性能与缓存",
    icon: "🖼️",
    title: "图片与字体优化",
    content: `

# 图片与字体优化

Next.js 内置了 \`next/image\` 和 \`next/font\` 两个核心优化模块，自动处理图片格式转换、尺寸适配、字体自托管等性能问题。本章重点讲 Next.js 16 在图片配置上的破坏性变更，以及 \`next/font\` 的本地 / Google 字体用法。

## 一、next/image 组件基础

\`next/image\` 是 HTML \`<img>\` 的增强版，提供四个核心能力：

1. **尺寸优化**：自动按设备宽度生成多种尺寸，转 WebP / AVIF
2. **视觉稳定**：通过 \`width\` / \`height\` 预占位，避免 CLS（Cumulative Layout Shift）
3. **懒加载**：进入视口才加载，可配 \`priority\` 优先加载首屏图
4. **占位符**：\`placeholder="blur"\` 在加载前显示模糊预览

\`\`\`tsx filename="app/page.tsx"
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/profile.png"
      alt="用户头像"
      width={500}
      height={500}
      priority      // 首屏图片优先加载
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."  // 远程图片需要手动提供
    />
  )
}
\`\`\`

## 二、本地图片：静态导入

把图片放在 \`public\` 目录或直接 \`import\`，Next.js 会自动检测宽高、生成 \`blurDataURL\`：

\`\`\`tsx filename="app/page.tsx"
import Image from 'next/image'
import ProfileImage from './profile.png'

export default function Page() {
  return (
    // 静态导入：width / height / blurDataURL 自动提供
    <Image
      src={ProfileImage}
      alt="头像"
      placeholder="blur"  // 可选：加载前显示模糊预览
    />
  )
}
\`\`\`

动态导入场景（如博客文章按文件名加载图片），可以在 Server Component 中用 \`import()\`：

\`\`\`tsx filename="app/blog/[slug]/page.tsx"
import Image from 'next/image'

async function PostImage({
  imageFilename,
  alt,
}: {
  imageFilename: string
  alt: string
}) {
  // 动态 import：路径必须有静态前缀，避免任意文件访问
  const { default: image } = await import(
    \`../content/blog/images/\${imageFilename}\`
  )
  // image 包含 width / height / blurDataURL
  return <Image src={image} alt={alt} />
}
\`\`\`

## 三、远程图片：remotePatterns 配置

远程图片必须显式声明允许的来源，防止恶意用户用你的服务器优化任意图片。

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/my-bucket/**',
        search: '',  // Next.js 16：必须显式声明，空字符串表示不允许 query
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
        search: '/v=\\d+/',  // 用正则约束 query
      },
    ],
  },
}

export default nextConfig
\`\`\`

远程图片使用时必须手动提供 \`width\` / \`height\`（或用 \`fill\`）：

\`\`\`tsx filename="app/page.tsx"
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="https://s3.amazonaws.com/my-bucket/profile.png"
      alt="远程图片"
      width={500}
      height={500}
    />
  )
}
\`\`\`

## 四、Next.js 16 图片配置破坏性变更

> ⚠️ 重点：Next.js 16 在图片配置上有几个重要变更，升级时务必检查。

### 1. \`qualities\` 必填

\`\`\`ts filename="next.config.ts"
// Next.js 16：qualities 默认是 [75]，必须显式声明允许的质量值
const nextConfig = {
  images: {
    qualities: [50, 60, 75, 90],  // 允许的质量值列表
  },
}
\`\`\`

> 原因：避免恶意用户通过 \`?quality=100\` 请求未受限的高质量图片消耗服务器资源。如果质量不在列表中，返回 400。

### 2. \`minimumCacheTTL\` 默认 4 小时

\`\`\`ts filename="next.config.ts"
const nextConfig = {
  images: {
    // 默认 14400 秒（4 小时）
    minimumCacheTTL: 14400,
  },
}
\`\`\`

### 3. \`imageSizes\` 默认值变更

\`\`\`ts filename="next.config.ts"
const nextConfig = {
  images: {
    // Next.js 16 默认：移除了 16，新增 32
    // 完整默认值：[32, 48, 64, 96, 128, 256, 384]
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
}
\`\`\`

### 4. \`localPatterns.search\` 新增

\`\`\`ts filename="next.config.ts"
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/assets/images/**',
        search: '',  // Next.js 16 新增：限制本地图片的 query string
      },
    ],
  },
}
\`\`\`

### 5. \`dangerouslyAllowLocalIP\`

允许从本地 IP 加载图片（仅开发环境用，生产不推荐）。

### 6. \`maximumRedirects\` 默认 3

远程图片被重定向时的最大跳转次数。

\`\`\`ts filename="next.config.ts"
const nextConfig = {
  images: {
    maximumRedirects: 3,
  },
}
\`\`\`

### 7. \`formats\` 默认 WebP

\`\`\`ts filename="next.config.ts"
const nextConfig = {
  images: {
    // 默认 ['image/webp']，可开启 AVIF
    formats: ['image/avif', 'image/webp'],
  },
}
\`\`\`

> AVIF 比 WebP 压缩率再低 20%，但首次编码慢 50%。建议启用 AVIF + WebP 双格式。

## 五、Demo：响应式图片

\`\`\`tsx filename="app/page.tsx"
import Image from 'next/image'

export default function Page() {
  return (
    <div className="relative w-full h-96">
      {/* fill：图片填充父容器，父容器需 position: relative */}
      <Image
        src="/hero.jpg"
        alt="横幅"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        className="object-cover"
      />
    </div>
  )
}
\`\`\`

\`sizes\` 属性很重要：它告诉浏览器在不同视口下图片实际显示宽度，让浏览器从 \`srcset\` 里选合适的尺寸下载。不写 \`sizes\` 时浏览器会下最大尺寸。

## 六、Demo：远程图片完整配置

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 允许的远程图片源
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/photos/**',
        search: '',
      },
    ],
    // 允许的质量值
    qualities: [50, 75, 90],
    // 缓存 TTL
    minimumCacheTTL: 86400, // 1 天
    // 启用 AVIF
    formats: ['image/avif', 'image/webp'],
    // 远程重定向上限
    maximumRedirects: 3,
    // 本地路径限制
    localPatterns: [
      {
        pathname: '/static/**',
        search: '',
      },
    ],
  },
}

export default nextConfig
\`\`\`

## 七、next/font：字体优化

\`next/font\` 自动把字体文件自托管到你的域名下，避免向 Google 发请求，提升隐私和性能。它内置支持两种来源：

- \`next/font/google\`：自动下载 Google Fonts 并自托管
- \`next/font/local\`：使用本地字体文件

### Google 字体

\`\`\`tsx filename="app/layout.tsx"
import { Geist, Geist_Mono } from 'next/font/google'

// 变量字体（推荐）：性能最好
const geist = Geist({
  subsets: ['latin'],  // 必填：指定子集，避免下载全部字符
  variable: '--font-geist',  // 暴露为 CSS 变量
  display: 'swap',  // FOUT 友好：字体加载前用回退字体
})

// 等宽字体
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className={\`\${geist.variable} \${geistMono.variable}\`}>
      <body>{children}</body>
    </html>
  )
}
\`\`\`

非变量字体必须指定 \`weight\`：

\`\`\`tsx filename="app/layout.tsx"
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '400',  // 非变量字体必填
  subsets: ['latin'],
})
\`\`\`

### 本地字体

\`\`\`tsx filename="app/layout.tsx"
import localFont from 'next/font/local'

// 单文件
const myFont = localFont({
  src: './fonts/my-font.woff2',
  variable: '--font-my',
  display: 'swap',
})

// 多字重：src 是数组
const roboto = localFont({
  src: [
    {
      path: './fonts/Roboto-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Roboto-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/Roboto-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-roboto',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className={myFont.variable}>
      <body>{children}</body>
    </html>
  )
}
\`\`\`

## 八、字体预加载与 FOUT

\`next/font\` 自动通过 \`<link rel="preload">\` 预加载字体，并通过 \`font-display\` 控制 FOUT（Flash of Unstyled Text）行为：

- \`display: 'swap'\`（推荐）：先用回退字体渲染，加载完成后切换——避免长时间空白
- \`display: 'optional'\`：如果字体没在 100ms 内加载，本次访问不显示，下次访问才用——避免布局抖动
- \`display: 'block'\`：先用不可见文字占位，加载后显示——FOIT（Flash of Invisible Text）

\`next/font\` 默认 \`display: 'swap'\`，对中文站点尤其重要（中文字体文件大）。

## 九、Demo：CSS 变量 + Tailwind 集成

把字体暴露为 CSS 变量后，可以在 Tailwind 配置里直接用：

\`\`\`tsx filename="app/layout.tsx"
import { Geist } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className={geist.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
\`\`\`

\`\`\`ts filename="tailwind.config.ts"
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // 用 CSS 变量：Tailwind 类名 font-sans 会用 var(--font-sans)
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
\`\`\`

## 十、Demo：完整字体方案

下面是一个博客站点的完整字体方案——标题用 Google 字体，正文用本地字体，代码用等宽字体。

\`\`\`tsx filename="app/layout.tsx"
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

// 标题：Google Inter（变量字体）
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// 正文：本地 Noto Sans CJK（中文字体太大，用本地托管）
const notoSans = localFont({
  src: './fonts/NotoSansSC-Regular.woff2',
  variable: '--font-body',
  display: 'swap',
})

// 代码：本地 JetBrains Mono
const jetbrains = localFont({
  src: [
    { path: './fonts/JetBrainsMono-Regular.woff2', weight: '400' },
    { path: './fonts/JetBrainsMono-Bold.woff2', weight: '700' },
  ],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="zh"
      className={\`\${inter.variable} \${notoSans.variable} \${jetbrains.variable}\`}
    >
      <body className="font-body">
        <div className="font-mono text-sm">{/* 代码块 */}</div>
        {children}
      </body>
    </html>
  )
}
\`\`\`

\`\`\`css filename="app/globals.css"
/* 全局 CSS 引用 CSS 变量 */
body {
  font-family: var(--font-body), system-ui, sans-serif;
}

h1, h2, h3 {
  font-family: var(--font-heading), system-ui, sans-serif;
}

pre, code {
  font-family: var(--font-mono), monospace;
}
\`\`\`

## 小结

\`next/image\` + \`next/font\` 是 Next.js 内置的两个性能利器。Next.js 16 在图片配置上的核心变更：\`qualities\` 必填、\`minimumCacheTTL\` 默认 4 小时、\`imageSizes\` 默认值调整、\`localPatterns.search\` 新增。字体方面 \`next/font\` 自动处理预加载、子集、自托管，配合 \`variable\` + Tailwind CSS 变量是最优雅的集成方式。下一章我们看 CSS 与样式方案。
`,
  },
  {
    id: "nextjs-css",
    group: "性能与缓存",
    icon: "🎨",
    title: "CSS 与样式方案",
    content: `

# CSS 与样式方案

Next.js 内置支持多种 CSS 方案：Tailwind CSS、CSS Modules、全局 CSS、Sass、CSS-in-JS。本章重点讲 Next.js 16 + Turbopack 默认环境下的配置差异，特别是 **Turbopack 不支持 Sass 的 \`~\` 前缀**这一破坏性变更，以及 \`resolveAlias\` 的替代方案。

## 一、Tailwind CSS（推荐）

Tailwind CSS v4 是 Next.js 16 推荐的样式方案。配置步骤：

### 1. 安装依赖

\`\`\`bash filename="终端"
# 用 npm
npm install -D tailwindcss @tailwindcss/postcss

# 用 pnpm
pnpm add -D tailwindcss @tailwindcss/postcss

# 用 yarn
yarn add -D tailwindcss @tailwindcss/postcss
\`\`\`

### 2. 配置 PostCSS

\`\`\`js filename="postcss.config.mjs"
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
\`\`\`

### 3. 全局 CSS 引入 Tailwind

\`\`\`css filename="app/globals.css"
@import 'tailwindcss';
\`\`\`

### 4. 根布局引入全局 CSS

\`\`\`tsx filename="app/layout.tsx"
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

### 5. 在组件中使用

\`\`\`tsx filename="app/page.tsx"
export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-blue-600">
        欢迎使用 Next.js 16
      </h1>
      <p className="text-gray-700 mt-4">
        Tailwind v4 + Turbopack 默认集成
      </p>
    </main>
  )
}
\`\`\`

> **Tailwind v4 vs v3**：v4 用 \`@import 'tailwindcss'\` 替代了 v3 的 \`@tailwind base/components/utilities\` 三条指令，配置文件从 \`tailwind.config.js\` 改为可选的 CSS 内 \`@theme\` 块。

## 二、CSS Modules

CSS Modules 通过生成唯一类名实现局部作用域，避免命名冲突。文件名必须是 \`*.module.css\`。

\`\`\`css filename="app/blog/blog.module.css"
.blog {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.title {
  font-size: 2rem;
  color: #1a1a1a;
}

.posts li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
\`\`\`

\`\`\`tsx filename="app/blog/page.tsx"
import styles from './blog.module.css'

export default function Page() {
  const posts = [
    { id: 1, title: '第一篇' },
    { id: 2, title: '第二篇' },
  ]
  return (
    <main className={styles.blog}>
      <h1 className={styles.title}>博客</h1>
      <ul className={styles.posts}>
        {posts.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </main>
  )
}
\`\`\`

CSS Modules 也支持 Sass（\`*.module.scss\`），需要先安装 \`sass\` 包。

## 三、全局 CSS

全局 CSS 影响所有路由，通常在根布局引入一次。Next.js 16 在开发模式下用 Fast Refresh 即时更新，生产构建会自动 chunk 化。

\`\`\`css filename="app/global.css"
body {
  padding: 20px 20px 60px;
  max-width: 680px;
  margin: 0 auto;
  font-family: system-ui, sans-serif;
}

a {
  color: #0070f3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
\`\`\`

\`\`\`tsx filename="app/layout.tsx"
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

> 官方建议：全局 CSS 仅用于"真正全局"的样式（如 Tailwind base、reset、字体声明），组件级样式用 Tailwind 或 CSS Modules。

## 四、Sass：Next.js 16 破坏性变更

> ⚠️ **Turbopack 不支持 \`~\` 前缀**：Next.js 16 默认用 Turbopack，而 Turbopack 不支持 Webpack 时代 Sass 的 \`~\` 前缀导入语法。

### 安装

\`\`\`bash filename="终端"
npm install -D sass
\`\`\`

### Sass 的两种语法

- \`.scss\`：SCSS 语法（CSS 超集，推荐）
- \`.sass\`：缩进语法（不用大括号和分号）

### Webpack 时代的 ~ 前缀（已废弃）

\`\`\`scss filename="styles/globals.scss"
// ❌ Webpack + sass-loader 时代的写法，Turbopack 不支持
@import '~bootstrap/dist/css/bootstrap.min.css';
\`\`\`

### Turbopack 时代的正确写法

\`\`\`scss filename="styles/globals.scss"
// ✅ Turbopack：直接写包名
@import 'bootstrap/dist/css/bootstrap.min.css';
\`\`\`

### 用 resolveAlias 兼容旧代码

如果第三方 Sass 文件里用了 \`~\` 前缀，无法直接改源码，可以用 \`turbopack.resolveAlias\` 把 \`~\` 映射掉：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // 把 ~ 前缀去掉：~foo/bar 解析为 foo/bar
      '~*': '*',
    },
  },
}

export default nextConfig
\`\`\`

### Sass 配置选项

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  sassOptions: {
    // 全局注入变量，所有 .scss 文件都能用
    additionalData: \`@use "@/styles/variables" as *;\`,
    // 指定 Sass 实现（推荐 sass-embedded，性能更好）
    implementation: 'sass-embedded',
  },
}

export default nextConfig
\`\`\`

> 注意：\`sassOptions.functions\`（自定义 Sass 函数）只在 Webpack 模式下可用，Turbopack 不支持，因为它的 Rust 架构无法直接执行 JS 函数。

### Sass 变量导出

\`\`\`scss filename="app/variables.module.scss"
$primary-color: #64ff00;

:export {
  primaryColor: $primary-color;
}
\`\`\`

\`\`\`tsx filename="app/page.tsx"
import variables from './variables.module.scss'

export default function Page() {
  return <h1 style={{ color: variables.primaryColor }}>Hello, Next.js!</h1>
}
\`\`\`

## 五、CSS-in-JS 限制

Next.js 16 App Router 对 CSS-in-JS 有严格限制——**传统的运行时 CSS-in-JS（如 styled-components v5、emotion 的运行时模式）不能直接用于 Server Components**，因为 Server Components 不支持 React Context，而运行时 CSS-in-JS 普遍依赖 Context。

可选方案：

1. **styled-components v6+**：通过 \`useServerInsertedHTML\` 支持 RSC，需要配置 registry
2. **Panda CSS / Vanilla Extract / Linaria**：零运行时 CSS-in-JS，编译时生成 CSS，与 RSC 完全兼容
3. **CSS Modules + Tailwind**：最稳妥的方案

### styled-components 配置

\`\`\`tsx filename="app/registry.tsx"
'use client'

import { useServerInsertedHTML } from 'next/navigation'
import React, { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

export function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet}>
      {children}
    </StyleSheetManager>
  )
}
\`\`\`

\`\`\`tsx filename="app/layout.tsx"
import { StyledComponentsRegistry } from './registry'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  )
}
\`\`\`

## 六、CSS 变量主题

CSS 变量是 Next.js 推荐的主题方案——零运行时、跨服务端 / 客户端可用。

\`\`\`css filename="app/globals.css"
:root {
  /* 默认（亮色）主题 */
  --background: #ffffff;
  --foreground: #171717;
  --primary: #0070f3;
  --primary-hover: #005bb5;
  --border: #eaeaea;
}

[data-theme='dark'] {
  /* 暗色主题 */
  --background: #0a0a0a;
  --foreground: #ededed;
  --primary: #3291ff;
  --primary-hover: #0070f3;
  --border: #222222;
}

body {
  background: var(--background);
  color: var(--foreground);
  transition: background 0.2s, color 0.2s;
}
\`\`\`

\`\`\`tsx filename="app/components/ThemeProvider.tsx"
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // 首次加载从 localStorage 读取
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
\`\`\`

\`\`\`tsx filename="app/components/ThemeToggle.tsx"
'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="px-3 py-1 border rounded"
      style={{ borderColor: 'var(--border)' }}
    >
      {theme === 'light' ? '🌙 切换暗色' : '☀️ 切换亮色'}
    </button>
  )
}
\`\`\`

## 七、Demo：CSS Modules 组件

\`\`\`css filename="app/components/Card.module.css"
.card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 16px;
  background: var(--background);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.title {
  margin: 0 0 8px;
  font-size: 1.25rem;
  color: var(--foreground);
}

.body {
  margin: 0;
  color: var(--foreground);
  opacity: 0.8;
}
\`\`\`

\`\`\`tsx filename="app/components/Card.tsx"
import styles from './Card.module.css'

interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="app/page.tsx"
import { Card } from '@/components/Card'

export default function Page() {
  return (
    <main className="p-8 grid grid-cols-2 gap-4">
      <Card title="特性一">
        <p>App Router + RSC</p>
      </Card>
      <Card title="特性二">
        <p>Turbopack 默认</p>
      </Card>
    </main>
  )
}
\`\`\`

## 八、Demo：全局样式 + CSS 变量

\`\`\`css filename="app/globals.css"
@import 'tailwindcss';

:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #0070f3;
  --space: 1rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans), system-ui, sans-serif;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space);
}
\`\`\`

\`\`\`tsx filename="app/layout.tsx"
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
\`\`\`

## 九、Demo：Tailwind + CSS Modules 混用

实际项目里 Tailwind 处理大部分样式，CSS Modules 处理复杂组件：

\`\`\`css filename="app/components/Newsletter.module.css"
.form {
  display: grid;
  gap: 0.5rem;
  max-width: 400px;
}

.input {
  composes: inputBase;
  padding: 0.75rem 1rem;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  font-size: 1rem;
}

.input:focus {
  outline: 2px solid var(--color-primary);
  border-color: transparent;
}

.button {
  composes: inputBase;
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.button:hover {
  filter: brightness(1.1);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
\`\`\`

\`\`\`tsx filename="app/components/Newsletter.tsx"
'use client'

import { useState } from 'react'
import styles from './Newsletter.module.css'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
    setStatus('done')
  }

  return (
    <section className="my-8 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-2">订阅周刊</h2>
      <form onSubmit={submit} className={styles.form}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="your@email.com"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={styles.button}
        >
          {status === 'loading' ? '订阅中...' : '订阅'}
        </button>
      </form>
    </section>
  )
}
\`\`\`

## 十、Demo：Sass + resolveAlias 兼容 ~ 前缀

如果项目里有不可改的第三方 Sass 文件用了 \`~\` 前缀：

\`\`\`scss filename="vendor/old-library/styles.scss"
// 第三方代码，不可改
@import '~bulma/bulma';
\`\`\`

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // 把 ~bulma/bulma 解析为 bulma/bulma
      '~*': '*',
    },
  },
  sassOptions: {
    additionalData: \`@use "@/styles/abstracts" as *;\`,
    implementation: 'sass-embedded',
  },
}

export default nextConfig
\`\`\`

\`\`\`tsx filename="app/page.tsx"
// 引入第三方 Sass 文件
import 'vendor/old-library/styles.scss'

export default function Page() {
  return <div className="button is-primary">Bulma 按钮</div>
}
\`\`\`

## 十一、productionBrowserSourceMaps

生产环境是否生成浏览器端 sourcemap，默认 \`false\`。开启会让生产 bundle 暴露源码，仅在调试场景用。

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
}

export default nextConfig
\`\`\`

## 十二、CSS 开发 vs 生产差异

| 维度 | 开发模式 | 生产模式 |
| --- | --- | --- |
| 更新方式 | Fast Refresh 即时热更新 | 构建时 chunk 化 |
| CSS 加载 | 需要 JS 启用 | 纯 CSS 可用（禁 JS 也能渲染） |
| CSS 顺序 | 可能与生产不同 | 严格按 import 顺序合并 |
| 验证方式 | \`next dev\` | 必须用 \`next build\` 验证 |

> 重要建议：CSS 顺序问题在开发模式可能复现不出，发布前一定要跑 \`next build\` 验证。开 \`sort-imports\` ESLint 规则会破坏 CSS 顺序，建议关闭。

## 小结

Next.js 16 默认 Turbopack 环境下，CSS 方案的选择很清晰：**Tailwind v4 + CSS Modules 是首选组合**，全局 CSS 仅用于 reset / 字体 / 主题变量，Sass 需要 \`next.config.ts\` 配置并注意 \`~\` 前缀不再支持。CSS-in-JS 受 Server Components 限制，要么用零运行时方案（Panda / Vanilla Extract），要么用 \`styled-components\` v6+ 的 registry 模式。掌握这些方案后，90% 以上的样式需求都能优雅解决。
`,
  },
];
