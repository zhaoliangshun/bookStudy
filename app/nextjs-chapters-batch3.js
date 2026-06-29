export const chapters = [
  {
    id: "nextjs-parallel",
    group: "高级路由",
    icon: "🔀",
    title: "平行路由：多 slot 布局",
    content: `

# 平行路由：多 slot 布局

平行路由（Parallel Routes）允许你在同一个布局内**同时或按条件渲染多个页面**。它非常适合仪表盘、社交信息流这类需要在同一屏内并列展示多块内容的场景。和普通路由不同，平行路由通过命名"插槽"来组织，每个插槽都是独立可导航的子路由。

## 一、@slot 命名约定

平行路由通过 \`@folder\` 约定定义**命名插槽（slot）**。例如下面的目录结构定义了两个插槽 \`@analytics\` 和 \`@team\`：

\`\`\`text filename="目录结构"
app/
├─ layout.tsx          # 共享父布局，接收所有 slot 作为 props
├─ page.tsx            # 默认 children 插槽
├─ @analytics/         # 命名插槽：分析模块
│  ├─ page.tsx
│  └─ default.tsx      # 兜底渲染（重要！）
└─ @team/              # 命名插槽：团队模块
   ├─ page.tsx
   └─ default.tsx
\`\`\`

插槽会作为 props 传给共享的父级 layout。注意三点：

1. **插槽不是路由段**，不会影响 URL 结构。访问 \`/@analytics/views\` 时，URL 实际是 \`/views\`。
2. \`children\` 是一个**隐式插槽**，对应 \`app/page.tsx\`，不需要单独建 \`@children\` 文件夹。
3. 同一层级的所有插槽共享渲染模式——如果其中一个插槽是动态渲染，该层所有插槽都必须动态渲染。

## 二、layout 接收 slot props

父布局把每个插槽当作普通 React 节点来渲染：

\`\`\`tsx filename="app/layout.tsx"
// 父级 layout 会收到 children、analytics、team 三个 React 节点
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 左侧主内容，对应 app/page.tsx */}
      <main className="col-span-2">{children}</main>
      {/* 右上：团队插槽 */}
      <aside>{team}</aside>
      {/* 右下：分析插槽 */}
      <aside>{analytics}</aside>
    </div>
  )
}
\`\`\`

## 三、⚠️ Next.js 16 破坏性变更：每个 slot 必须有 default.js

这是从老版本升级最容易踩的坑。在 Next.js 16 中，**所有命名插槽都必须提供 \`default.js\`**，否则在硬导航（刷新页面）时无法恢复插槽的活跃状态，构建/运行会直接报错，要求你显式定义 \`default.js\` 才能继续。

\`default.js\` 在以下场景被渲染：
- 全量刷新（浏览器刷新）时，插槽无法从 URL 推断出当前子页面
- 客户端导航到一个插槽不匹配的路由时，需要保留其他插槽的当前状态

如果希望保留旧版"返回 404"的行为，可以这样写：

\`\`\`tsx filename="app/@team/default.tsx"
import { notFound } from 'next/navigation'

// 兜底组件：硬导航无法匹配该 slot 时调用
// 调用 notFound() 触发 404 页面
export default function Default() {
  notFound()
}
\`\`\`

如果希望插槽"什么也不显示"，返回 \`null\`：

\`\`\`tsx filename="app/@auth/default.tsx"
// 模态框插槽的兜底：未激活时不渲染任何内容
export default function Default() {
  return null
}
\`\`\`

> \`children\` 是隐式插槽，同样需要 \`default.js\`。如果根 layout 下的 \`children\` 没有 \`default.js\`，Next.js 无法恢复父页面的活跃状态时会返回 404。

## 四、Demo：仪表盘多 slot 布局

下面构建一个仪表盘，同时展示 \`@analytics\`、\`@team\`、\`@revenue\` 三个插槽。

\`\`\`tsx filename="app/dashboard/layout.tsx"
import Link from 'next/link'

// 仪表盘布局：同时渲染三个 slot + 主内容
export default function DashboardLayout({
  children,
  analytics,
  team,
  revenue,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
  revenue: React.ReactNode
}) {
  return (
    <div className="p-6 space-y-4">
      {/* 顶部子导航：切换 slot 内的子页面 */}
      <nav className="flex gap-4 border-b pb-2">
        <Link href="/dashboard">概览</Link>
        <Link href="/dashboard/analytics/page-views">Page Views</Link>
        <Link href="/dashboard/team/members">Members</Link>
        <Link href="/dashboard/revenue/monthly">Revenue</Link>
      </nav>

      <div className="grid grid-cols-2 gap-4">
        {/* 主内容区 */}
        <section className="border p-4">{children}</section>
        {/* 分析插槽：独立导航、独立状态 */}
        <section className="border p-4">{analytics}</section>
        {/* 团队插槽 */}
        <section className="border p-4">{team}</section>
        {/* 营收插槽 */}
        <section className="border p-4">{revenue}</section>
      </div>
    </div>
  )
}
\`\`\`

每个插槽都需要 \`default.js\` 兜底：

\`\`\`tsx filename="app/dashboard/@analytics/default.tsx"
// 分析插槽兜底：硬导航时显示占位
export default function Default() {
  return <div className="text-gray-400">分析数据加载中...</div>
}
\`\`\`

\`\`\`tsx filename="app/dashboard/@analytics/page.tsx"
// 分析插槽默认页
export default function Page() {
  return <div>分析概览：今日 PV 12,847，UV 3,210</div>
}
\`\`\`

## 五、软导航 vs 硬导航的行为差异

这是理解平行路由的关键：

- **软导航（客户端导航）**：Next.js 会做"部分渲染"，只更新当前插槽的子页面，**保持其他插槽的活跃子页面不变**，即使它们和当前 URL 已经不匹配。
- **硬导航（整页刷新）**：Next.js 无法恢复插槽的活跃状态，会为未匹配的插槽渲染 \`default.js\`；如果 \`default.js\` 不存在，Next.js 16 会报错。

> 这种 404/报错行为是有意为之，避免你在一个本不该渲染平行路由的页面意外渲染它。

## 六、Demo：用 useSelectedLayoutSegment 读取 slot 活跃段

\`useSelectedLayoutSegment\` 和 \`useSelectedLayoutSegments\` 接受 \`parallelRoutesKey\`，可以读取某个插槽当前活跃的路由段：

\`\`\`tsx filename="app/dashboard/@analytics/layout.tsx"
'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

// 在插槽内再建一个 layout，给该插槽提供独立标签导航
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 传入 'analytics' 表示读取 @analytics 插槽的活跃段
  const segment = useSelectedLayoutSegment('analytics')

  return (
    <div>
      <nav className="flex gap-2 text-sm">
        <Link
          href="/dashboard/analytics/page-views"
          className={segment === 'page-views' ? 'font-bold' : ''}
        >
          页面浏览
        </Link>
        <Link
          href="/dashboard/analytics/visitors"
          className={segment === 'visitors' ? 'font-bold' : ''}
        >
          访客
        </Link>
      </nav>
      <div className="mt-2">{children}</div>
    </div>
  )
}
\`\`\`

## 七、Demo：模态框 slot（结合拦截路由的预告）

平行路由最常见的实战模式是**和拦截路由配合做模态框**。先看一个最简结构：

\`\`\`text filename="目录结构"
app/
├─ layout.tsx            # 渲染 @auth 插槽
├─ page.tsx              # 首页，含"打开登录"按钮
├─ @auth/
│  ├─ default.tsx        # 兜底：返回 null
│  ├─ (.)login/page.tsx  # 拦截 /login，渲染模态框
│  └─ page.tsx           # 其他路由返回 null，关闭模态框
└─ login/page.tsx        # 真正的 /login 页面（刷新时落到这里）
\`\`\`

\`\`\`tsx filename="app/layout.tsx"
import Link from 'next/link'

export default function Layout({
  auth,
  children,
}: {
  auth: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <>
      <nav>
        <Link href="/login">打开登录弹窗</Link>
      </nav>
      {/* auth 插槽：未激活时 default.js 返回 null，什么也不显示 */}
      <div>{auth}</div>
      <div>{children}</div>
    </>
  )
}
\`\`\`

\`\`\`tsx filename="app/@auth/default.tsx"
// 重要：硬导航未匹配时返回 null，保证模态框不显示
export default function Default() {
  return null
}
\`\`\`

详细的模态框交互会在"拦截路由"一章展开，这里只需记住：**模态框插槽的 \`default.js\` 必须返回 \`null\`**，否则刷新页面会看到一片空白模态。

## 八、Demo：条件路由（按角色渲染不同插槽）

平行路由还能按条件渲染，例如根据用户角色在 \`/admin\` 和 \`/user\` 之间切换：

\`\`\`tsx filename="app/dashboard/layout.tsx"
import { checkUserRole } from '@/lib/auth'

export default function Layout({
  user,
  admin,
}: {
  user: React.ReactNode
  admin: React.ReactNode
}) {
  const role = checkUserRole()
  // 管理员渲染 admin 插槽，普通用户渲染 user 插槽
  return role === 'admin' ? admin : user
}
\`\`\`

## 九、独立 loading 和 error 状态

平行路由可以**独立流式传输**，因此每个插槽都能定义自己的 \`loading.tsx\` 和 \`error.tsx\`，互不阻塞。慢的插槽显示骨架屏，快的插槽先呈现，整体首屏体验更好。

## 小结

- 平行路由用 \`@folder\` 定义命名插槽，插槽作为 props 传给父 layout
- \`children\` 是隐式插槽，对应 \`app/page.tsx\`
- **Next.js 16 必须为每个命名插槽提供 \`default.js\`**，硬导航时用它兜底，否则报错
- 软导航保留各插槽状态，硬导航重置为 \`default.js\`
- 实战场景：仪表盘多模块、条件路由、模态框（配合拦截路由）
`
  },
  {
    id: "nextjs-intercepting",
    group: "高级路由",
    icon: "🪝",
    title: "拦截路由与模态框",
    content: `

# 拦截路由与模态框

拦截路由（Intercepting Routes）允许你**在当前布局内加载应用另一处的路由**，同时伪装浏览器 URL。最经典的场景是 Instagram/Twitter 的图片放大：点击信息流里的图片，URL 变成 \`/photo/123\`，但页面不跳转，而是在当前 feed 上叠加一个模态框；而当你刷新这个 URL 或从分享链接进入时，则渲染完整的图片详情页。

## 一、拦截约定：(.)、(..)、(..)(..)、(...)

拦截路由用类似相对路径的约定定义，但**基于路由段而不是文件系统**：

| 约定 | 含义 |
| --- | --- |
| \`(.)\` | 匹配**同级**的段 |
| \`(..)\` | 匹配**上一级**的段 |
| \`(..)(..)\` | 匹配**上两级**的段 |
| \`(...)\` | 匹配从 **根 \`app\` 目录**开始的段 |

> ⚠️ 关键：\`(..)\` 基于**路由段**，不基于文件系统。**\`@slot\` 文件夹不算段**，所以从 \`@modal\` 内拦截同级 \`photo\`，要用 \`(..)photo\` 而不是 \`(.)photo\`。

例如，从 \`feed\` 段拦截 \`photo\` 段：

\`\`\`text filename="目录结构"
app/
├─ feed/
│  └─ (..)photo/[id]/page.tsx   # 拦截 /photo/[id]，渲染模态框
└─ photo/[id]/page.tsx          # 真正的 /photo/[id] 详情页
\`\`\`

## 二、拦截路由的工作原理

拦截路由的核心是区分两种导航：

1. **软导航（客户端点击 Link）**：Next.js 拦截目标路由，URL 更新为目标路径，但**渲染被拦截的版本**（模态框），保留当前页面上下文。
2. **硬导航（刷新 / 直接访问分享链接）**：拦截不生效，渲染**真正的目标路由**（完整详情页）。

这种设计带来三个好处：
- 模态框内容可通过 URL **分享**
- 刷新页面**保留上下文**，而不是关闭模态框
- 后退导航**关闭模态框**，而不是跳到上一个路由
- 前进导航**重新打开模态框**

## 三、Demo：图片放大模态框（完整流程）

下面实现一个 Twitter 风格的图片放大：信息流点击图片弹模态框，刷新时进入完整图片页。

\`\`\`text filename="目录结构"
app/
├─ layout.tsx
├─ feed/
│  ├─ page.tsx                  # 信息流，列出图片
│  └─ @modal/
│     ├─ default.tsx            # 兜底 null
│     └─ (..)photo/[id]/page.tsx # 拦截 /photo/[id]
├─ photo/[id]/page.tsx          # 真正的详情页
└─ @modal/[...catchAll]/page.tsx # catch-all：其他路由关闭模态
\`\`\`

\`\`\`tsx filename="app/feed/page.tsx"
import Link from 'next/link'

// 信息流页面：列出可点击的图片
export default function FeedPage() {
  const photos = [
    { id: '1', url: '/images/cat.jpg' },
    { id: '2', url: '/images/dog.jpg' },
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p) => (
        // 点击触发软导航：URL 变成 /photo/1，但被 @modal/(..)photo 拦截
        <Link key={p.id} href={\`/photo/\${p.id}\`}>
          <img src={p.url} alt="" className="w-full rounded" />
        </Link>
      ))}
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="app/layout.tsx"
// 父布局渲染 @modal 插槽
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {/* @modal 插槽：未激活时 default.js 返回 null */}
      {modal}
      {children}
    </>
  )
}
\`\`\`

\`\`\`tsx filename="app/feed/@modal/default.tsx"
// 兜底：模态未激活时不渲染
export default function Default() {
  return null
}
\`\`\`

\`\`\`tsx filename="app/feed/@modal/(..)photo/[id]/page.tsx"
import { Modal } from '@/components/modal'
import { getPhoto } from '@/lib/photos'

// 拦截版：渲染在模态框里
// 注意 params 在 Next.js 16 是 Promise，必须 await
export default async function InterceptedPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} className="max-w-full" />
      <h2 className="text-lg mt-2">{photo.title}</h2>
    </Modal>
  )
}
\`\`\`

\`\`\`tsx filename="app/photo/[id]/page.tsx"
import { getPhoto } from '@/lib/photos'

// 真正的详情页：硬导航 / 刷新 / 分享链接进入时渲染
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <article className="max-w-2xl mx-auto p-4">
      <img src={photo.url} alt={photo.title} />
      <h1 className="text-2xl">{photo.title}</h1>
      <p className="text-gray-600">{photo.description}</p>
    </article>
  )
}
\`\`\`

\`\`\`tsx filename="app/feed/@modal/[...catchAll]/page.tsx"
// catch-all：导航到非 /photo/* 路由时，让 @modal 插槽返回 null，关闭模态框
export default function CatchAll() {
  return null
}
\`\`\`

## 四、Modal 组件：用 router.back() 关闭

\`\`\`tsx filename="components/modal.tsx"
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // 按 Esc 关闭模态框
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => router.back()}
    >
      <div
        className="bg-white p-4 rounded max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部关闭按钮 */}
        <button onClick={() => router.back()} className="float-right">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
\`\`\`

## 五、为什么需要 catch-all？

平行路由的软导航行为有个"陷阱"：客户端导航到一个**不再匹配插槽**的路由时，**插槽会保持可见**。所以从 \`/photo/1\` 导航回 \`/\` 时，\`@modal\` 插槽不会自动消失。

解决方案是用一个 \`[...catchAll]/page.tsx\` 返回 \`null\`，让插槽匹配到它，从而"关闭"模态框。

## 六、Demo：登录拦截弹窗

另一个常见场景：导航栏点"登录"弹模态框，但 \`/login\` 也是独立页面。

\`\`\`text filename="目录结构"
app/
├─ layout.tsx
├─ page.tsx
├─ login/page.tsx               # 真正的登录页（刷新进入）
└─ @auth/
   ├─ default.tsx
   ├─ (.)login/page.tsx          # 拦截同级 /login
   └─ [...catchAll]/page.tsx
\`\`\`

\`\`\`tsx filename="app/@auth/(.)login/page.tsx"
import { Modal } from '@/components/modal'
import { LoginForm } from '@/components/login-form'

// 拦截版：在模态框内渲染登录表单
// 分离 Modal 外壳和内容，让 LoginForm 可以是 Server Component
export default function Page() {
  return (
    <Modal>
      <LoginForm />
    </Modal>
  )
}
\`\`\`

\`\`\`tsx filename="app/login/page.tsx"
import { LoginForm } from '@/components/login-form'

// 真正的登录页：刷新 / 分享链接进入时渲染
export default function Page() {
  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-2xl mb-4">登录</h1>
      <LoginForm />
    </main>
  )
}
\`\`\`

\`\`\`tsx filename="app/@auth/default.tsx"
export default function Default() {
  return null
}
\`\`\`

\`\`\`tsx filename="app/@auth/[...catchAll]/page.tsx"
// 导航到其他路由时关闭登录模态
export default function CatchAll() {
  return null
}
\`\`\`

## 七、软导航 vs 硬导航对照表

| 操作 | URL 变化 | 渲染内容 |
| --- | --- | --- |
| 在 feed 点击图片（软导航） | \`/feed\` → \`/photo/1\` | 拦截版模态框 + feed 背景 |
| 在 \`/photo/1\` 按 F5（硬导航） | 不变 | 完整详情页 |
| 从分享链接打开 \`/photo/1\` | 不变 | 完整详情页 |
| 模态框打开时点浏览器后退 | \`/photo/1\` → \`/feed\` | 关闭模态框，回到 feed |
| 模态框打开时点浏览器前进 | \`/feed\` → \`/photo/1\` | 重新打开模态框 |

## 八、完整模态框流程清单

实现一个"既可弹模态、又有独立页"的功能，需要这 5 个文件：

1. **真实路由页**：\`app/photo/[id]/page.tsx\` —— 硬导航时渲染
2. **插槽兜底**：\`app/@modal/default.tsx\` —— 返回 \`null\`
3. **拦截版页**：\`app/@modal/(..)photo/[id]/page.tsx\` —— 软导航时渲染
4. **catch-all**：\`app/@modal/[...catchAll]/page.tsx\` —— 返回 \`null\`，关闭模态
5. **Modal 组件**：用 \`router.back()\` 关闭

## 小结

- 拦截约定 \`(.)\`、\`(..)\`、\`(..)(..)\`、\`(...)\` 基于**路由段**，\`@slot\` 不算段
- 软导航渲染拦截版（模态框），硬导航渲染真实路由（完整页）
- 配合平行路由 \`@modal\` + \`default.js\` + \`[...catchAll]\` 才能完整开关模态框
- 模态框用 \`router.back()\` 关闭，支持浏览器前进/后退
`
  },
  {
    id: "nextjs-metadata",
    group: "高级路由",
    icon: "🏷️",
    title: "元数据与 SEO 全解",
    content: `

# 元数据与 SEO 全解

Next.js 的 Metadata API 让你为应用定义元数据以改善 SEO 和社交分享。它包含三种方式：静态 \`metadata\` 对象、动态 \`generateMetadata\` 函数、以及特殊文件约定（favicon、OG 图、robots.txt、sitemap.xml）。所有元数据会被自动注入到 \`<head>\` 中。

> ⚠️ \`metadata\` 对象和 \`generateMetadata\` 函数**只在 Server Components 中支持**。不能在同一路由段同时导出两者。

## 一、静态 metadata 对象

在 \`layout.tsx\` 或 \`page.tsx\` 中导出一个 \`Metadata\` 对象：

\`\`\`tsx filename="app/blog/layout.tsx"
import type { Metadata } from 'next'

// 静态元数据：构建时就确定，不依赖请求
export const metadata: Metadata = {
  title: '我的博客',
  description: '分享前端与全栈实践',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
\`\`\`

## 二、title 模板：default / template / absolute

\`title.template\` 给**子路由**的 title 加前缀/后缀，\`title.default\` 给未定义 title 的子路由兜底：

\`\`\`tsx filename="app/layout.tsx"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    // 模板：子路由的 title 会被套用 %s | Acme
    template: '%s | Acme',
    // 默认值：子路由没定义 title 时用
    default: 'Acme',
  },
}
\`\`\`

\`\`\`tsx filename="app/about/page.tsx"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于我们',
}
// 输出：<title>关于我们 | Acme</title>
\`\`\`

\`\`\`tsx filename="app/about/contact/page.tsx"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    // absolute：忽略父级的 template
    absolute: '联系我们 - 直购热线',
  },
}
// 输出：<title>联系我们 - 直购热线</title>
\`\`\`

> \`title.template\` 只作用于子路由段，且必须搭配 \`title.default\`；在 \`page.tsx\` 里定义 \`template\` 无效（页面是终止段）。

## 三、⚠️ generateMetadata：Next.js 16 params 是 Promise

\`generateMetadata\` 用于依赖动态数据的元数据。**Next.js 16 的破坏性变更：\`params\` 和 \`searchParams\` 都是 Promise**，必须 \`await\`：

\`\`\`tsx filename="app/products/[id]/page.tsx"
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  // Next.js 16：params 是 Promise
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // 必须先 await params 才能拿到 id
  const { id } = await params
  const product = await fetch(\`https://api.example.com/products/\${id}\`).then(
    (res) => res.json()
  )

  // 继承而非替换父级的 og.images
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [\`/og/products/\${id}.png\`, ...previousImages],
    },
  }
}

export default function Page({ params, searchParams }: Props) {
  // 页面组件同样要 await params
  return <div>产品详情</div>
}
\`\`\`

> \`fetch\` 在 \`generateMetadata\` 内会被自动 memoize，跨 \`generateMetadata\`、\`generateStaticParams\`、Layout、Page 共享同一份请求。React \`cache\` 可用于非 fetch 场景。

## 四、Demo：静态 + 动态 metadata 组合

\`\`\`tsx filename="app/layout.tsx"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://acme.com'),
  title: {
    default: 'Acme - 首页',
    template: '%s | Acme',
  },
  description: 'Acme 是一家做酷东西的公司',
  openGraph: {
    title: 'Acme',
    description: '做酷东西的公司',
    url: 'https://acme.com',
    siteName: 'Acme',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@acme',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

\`\`\`tsx filename="app/blog/[slug]/page.tsx"
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await fetch(\`https://api.acme.com/posts/\${slug}\`).then((r) =>
    r.json()
  )

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const post = await fetch(\`https://api.acme.com/posts/\${slug}\`).then((r) =>
    r.json()
  )
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
\`\`\`

## 五、viewport（独立配置，不在 metadata 里）

> ⚠️ Next.js 14 起 \`viewport\`、\`themeColor\`、\`colorScheme\` 从 \`metadata\` 迁出，改用 \`generateViewport\` / \`viewport\` 导出：

\`\`\`tsx filename="app/layout.tsx"
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}
\`\`\`

## 六、Demo：sitemap.ts（generateSitemaps，Next.js 16 id 是 Promise）

\`sitemap.ts\` 是特殊的 Route Handler，默认会被缓存。返回 \`MetadataRoute.Sitemap\` 数组：

\`\`\`tsx filename="app/sitemap.ts"
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://acme.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://acme.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
\`\`\`

站点地图很大时用 \`generateSitemaps\` 拆分。**Next.js 16：\`id\` 现在是 Promise<string>**：

\`\`\`tsx filename="app/product/sitemap.ts"
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://acme.com'

// 返回所有 sitemap 的 id 列表
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
}

// Next.js 16：id 是 Promise<string>，必须 await
export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id
  // Google 限制每个 sitemap 最多 5 万条 URL
  const start = Number(id) * 50000
  const end = start + 50000
  const products = await getProductsInRange(start, end)

  return products.map((p) => ({
    url: \`\${BASE_URL}/product/\${p.id}\`,
    lastModified: p.updatedAt,
  }))
}
\`\`\`

生成的 sitemap 在 \`/product/sitemap/1.xml\` 可访问。

## 七、Demo：robots.ts

\`\`\`tsx filename="app/robots.ts"
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: '/private/',
      },
      {
        userAgent: ['Applebot', 'Bingbot'],
        disallow: ['/'],
      },
    ],
    sitemap: 'https://acme.com/sitemap.xml',
  }
}
\`\`\`

## 八、Demo：opengraph-image.tsx 动态生成 OG 图

> ⚠️ Next.js 16：\`opengraph-image.tsx\` 的 \`params\` 也是 Promise。

\`\`\`tsx filename="app/blog/[slug]/opengraph-image.tsx"
import { ImageResponse } from 'next/og'
import { getPost } from '@/lib/data'

// 图片元数据导出
export const alt = '关于 Acme'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Next.js 16：params 是 Promise
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 40,
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.8 }}>Acme Blog</div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>{post.title}</div>
      </div>
    ),
    { ...size }
  )
}
\`\`\`

Next.js 会自动注入对应的 \`og:image\`、\`og:image:width\`、\`og:image:height\`、\`og:image:type\` 标签。也支持静态文件：把 \`opengraph-image.jpg\` 放进路由段目录即可。

## 九、icons、manifest、JSON-LD

icons 推荐用文件约定（\`icon.png\`、\`apple-icon.jpg\` 放进目录），也可用 metadata 配置：

\`\`\`tsx filename="app/layout.tsx"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: 'https://acme.com/manifest.json',
}
\`\`\`

JSON-LD 结构化数据直接在组件里渲染 \`<script type="application/ld+json">\`：

\`\`\`tsx filename="app/blog/[slug]/page.tsx"
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
\`\`\`

## 十、metadataBase：相对 URL 的基准

URL 类型的字段（og:image、alternates.canonical 等）需要绝对 URL。在根 layout 设置 \`metadataBase\` 后，子路由可以用相对路径：

\`\`\`tsx filename="app/layout.tsx"
export const metadata = {
  metadataBase: new URL('https://acme.com'),
  alternates: { canonical: '/' },
  openGraph: { images: '/og-image.png' },
}
// 输出：<link rel="canonical" href="https://acme.com" />
//       <meta property="og:image" content="https://acme.com/og-image.png" />
\`\`\`

## 十一、流式 metadata

对动态渲染页面，Next.js 会**单独流式传输 metadata**：先发送初始 UI，\`generateMetadata\` resolve 后再注入 \`<head>\`。这能降低 TTFB、改善 LCP。

但**HTML-limited 爬虫**（如 facebookexternalhit）无法执行 JS，metadata 仍会阻塞渲染并放在 \`<head>\`。可用 \`htmlLimitedBots\` 配置覆盖检测规则。

## 小结

- 静态用 \`metadata\` 对象，动态用 \`generateMetadata\`，二者只能选一
- **Next.js 16：\`params\` / \`searchParams\` / sitemap \`id\` / OG 图 \`params\` 都是 Promise，必须 await**
- \`title.template\` 作用于子段，需搭配 \`default\`
- \`viewport\` / \`themeColor\` 用独立导出，不在 \`metadata\` 里
- 文件约定：\`sitemap.ts\`、\`robots.ts\`、\`opengraph-image.tsx\`、\`icon.png\`
- JSON-LD 直接渲染 \`<script type="application/ld+json">\`
`
  },
  {
    id: "nextjs-proxy",
    group: "高级路由",
    icon: "🛡️",
    title: "Proxy 中间件（middleware 已弃用）",
    content: `

# Proxy 中间件（middleware 已弃用）

## 一、⚠️ Next.js 16 重大变更：middleware → proxy

这是 Next.js 16 最重要的破坏性变更之一。从 v16 起：

1. **\`middleware.ts\` 文件约定被弃用并重命名为 \`proxy.ts\`**。功能本身不变，但文件名和导出函数名都要改。
2. **Proxy 默认使用 Node.js 运行时**。不再是 Edge Runtime，且 \`runtime\` 配置项在 Proxy 文件中**不可用**——设置它会抛错。
3. 官方提供 codemod 一键迁移：\`npx @next/codemod@canary middleware-to-proxy .\`

为什么改名？官方解释："middleware" 容易和 Express.js 的中间件混淆，导致误用。而"proxy"更准确地反映了它"运行在应用前面的网络边界、在请求到达应用前处理"的本质。官方也建议：**除非别无选择，否则不要依赖 Proxy**，未来会提供更好的 API 替代。

\`\`\`diff filename="迁移示例"
// middleware.ts → proxy.ts
- export function middleware() {
+ export function proxy() {
\`\`\`

## 二、proxy.ts 文件约定与位置

在项目根目录（或 \`src\` 下，与 \`pages\` / \`app\` 同级）创建 \`proxy.ts\` 或 \`proxy.js\`。**每个项目只支持一个 \`proxy.ts\`**，但可以把逻辑拆到多个模块再 import 进来。

\`\`\`tsx filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 可以是 default export 或 named export "proxy"
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
\`\`\`

## 三、Node.js 运行时（重要变更）

Proxy 默认跑在 **Node.js 运行时**，意味着：

- ✅ 可以使用 Node.js 完整 API（fs、crypto、Buffer 等）
- ✅ 可以 import 大部分 npm 包
- ❌ **不能**设置 \`runtime\` 配置项（设置会报错）
- ❌ 不再像 Edge 那样部署到 CDN 边缘（虽然部分平台仍可优化部署）

## 四、matcher：精确控制触发路径

不加 \`matcher\`，Proxy 会对**每个请求**执行，包括静态文件（\`_next/static\`）、图片优化（\`_next/image\`）、\`public/\` 资源——这会让认证逻辑误伤 CSS/JS。务必用 matcher 限定：

\`\`\`ts filename="proxy.ts"
export const config = {
  // 单个路径
  // matcher: '/about',

  // 多个路径
  // matcher: ['/about', '/contact'],

  // 通配
  matcher: ['/about/:path*', '/dashboard/:path*'],
}
\`\`\`

**负向匹配**（用正则排除特定路径）是最常用模式：

\`\`\`ts filename="proxy.ts"
export const config = {
  matcher: [
    // 排除 api、静态文件、图片优化、favicon/sitemap/robots
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
\`\`\`

> ⚠️ 即使 matcher 排除了 \`_next/data\`，Proxy 仍会对 \`_next/data/*\` 路由执行。这是**有意为之**，防止你保护了页面却忘了保护对应的数据路由。

matcher 还支持条件对象（\`has\` / \`missing\`）：

\`\`\`ts filename="proxy.ts"
export const config = {
  matcher: [
    {
      source: '/api/:path*',
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer Token' },
        { type: 'query', key: 'userId', value: '123' },
      ],
      missing: [{ type: 'cookie', key: 'session', value: 'active' }],
    },
  ],
}
\`\`\`

## 五、执行顺序

请求处理链如下（Proxy 在第 3 步）：

1. \`headers\`（next.config.js）
2. \`redirects\`（next.config.js）
3. **Proxy**（rewrites、redirects 等）
4. \`beforeFiles\` rewrites（next.config.js）
5. 文件系统路由（\`public/\`、\`_next/static/\`、\`pages/\`、\`app/\`）
6. \`afterFiles\` rewrites（next.config.js）
7. 动态路由（\`/blog/[slug]\`）
8. \`fallback\` rewrites（next.config.js）

> ⚠️ Server Actions 不是独立路由，它们是 POST 到使用它们的路由。所以 matcher 排除某路径时，**该路径上的 Server Action 调用也会被跳过**。重构或改 matcher 可能悄悄移除 Proxy 保护——务必在每个 Server Action 内部再次校验权限。

## 六、Demo：认证守卫

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // 从 cookie 读取 session token
  const token = request.cookies.get('session-token')?.value

  // 受保护路径前缀
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard')

  if (isProtected && !token) {
    // 无 token：重定向到登录页，并带上回跳地址
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 通过：把用户信息写入请求头，下游组件可读
  const requestHeaders = new Headers(request.headers)
  if (token) requestHeaders.set('x-user-token', token)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
\`\`\`

## 七、Demo：基于角色重定向

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const role = request.cookies.get('role')?.value ?? 'guest'

  // 管理员访问 /admin 重写到管理面板
  if (request.nextUrl.pathname === '/admin' && role === 'admin') {
    return NextResponse.rewrite(new URL('/admin/panel', request.url))
  }

  // 普通用户访问 /admin 重定向到无权限页
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/forbidden', request.url))
  }
}

export const config = {
  matcher: '/admin/:path*',
}
\`\`\`

## 八、Demo：地理重写（基于请求头）

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Vercel 等平台会注入地理头
  const country = request.headers.get('x-vercel-ip-country') ?? 'CN'

  // 中国用户访问 /pricing 重写到人民币定价页
  if (request.nextUrl.pathname === '/pricing' && country === 'CN') {
    return NextResponse.rewrite(new URL('/pricing-cn', request.url))
  }

  // 美国用户重写到美元定价页
  if (request.nextUrl.pathname === '/pricing' && country === 'US') {
    return NextResponse.rewrite(new URL('/pricing-us', request.url))
  }
}

export const config = {
  matcher: '/pricing',
}
\`\`\`

## 九、Demo：i18n 路由（自动加语言前缀）

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { NextRequest } from 'next/server'

const locales = ['en-US', 'zh-CN', 'ja-JP']
const defaultLocale = 'en-US'

// 根据 Accept-Language 头匹配最佳语言
function getLocale(request: NextRequest): string {
  const headers: Record<string, string> = {}
  request.headers.forEach((v, k) => (headers[k] = v))
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 已有语言前缀则放行
  const hasLocale = locales.some(
    (l) => pathname.startsWith(\`/\${l}/\`) || pathname === \`/\${l}\`
  )
  if (hasLocale) return

  // 无前缀：重定向到带语言前缀的 URL
  const locale = getLocale(request)
  request.nextUrl.pathname = \`/\${locale}\${pathname}\`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // 排除内部路径
  matcher: ['/((?!_next).*)'],
}
\`\`\`

## 十、修改请求头与响应头

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // 克隆请求头并加自定义头
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello-from-proxy', 'world')

  // NextResponse.next 把请求头透传给下游
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // 设置响应头（客户端可见）
  response.headers.set('x-response-time', String(Date.now()))
  return response
}
\`\`\`

> 注意区分：\`NextResponse.next({ request: { headers } })\` 是给下游组件用的请求头；\`NextResponse.next({ headers })\` 是给客户端的响应头。别写错。

## 十一、Cookie 操作

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // 读取请求 cookie
  const all = request.cookies.getAll()
  const token = request.cookies.get('session')?.value

  // 在响应上设置 cookie
  const response = NextResponse.next()
  response.cookies.set({
    name: 'visited',
    value: '1',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
\`\`\`

## 十二、直接返回响应（绕过路由）

\`\`\`ts filename="proxy.ts"
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // 直接返回 JSON，不进入任何路由
  if (!request.headers.get('authorization')) {
    return Response.json(
      { success: false, message: '认证失败' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: '/api/:path*',
}
\`\`\`

## 十三、waitUntil：后台异步任务

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

export function proxy(req: NextRequest, event: NextFetchEvent) {
  // 延长 Proxy 生命周期，后台埋点不阻塞响应
  event.waitUntil(
    fetch('https://analytics.example.com', {
      method: 'POST',
      body: JSON.stringify({ pathname: req.nextUrl.pathname }),
    })
  )
  return NextResponse.next()
}
\`\`\`

## 十四、高级配置：skipProxyUrlNormalize 与 skipTrailingSlashRedirect

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const config: NextConfig = {
  // 关闭 URL 归一化，让 proxy 看到原始 URL（如 /_next/data/build-id/hello.json）
  skipProxyUrlNormalize: true,
  // 关闭 Next.js 自动处理斜杠结尾，自己在 proxy 里控制
  skipTrailingSlashRedirect: true,
}

export default config
\`\`\`

## 小结

- **Next.js 16：middleware 改名 proxy，默认 Node.js 运行时，不能设 runtime**
- 用 codemod 迁移：\`npx @next/codemod@canary middleware-to-proxy .\`
- 必须配 \`matcher\`，否则会拦截静态资源；负向匹配排除 \`_next\`、metadata 文件
- Server Action 会被同一 matcher 覆盖，**权限务必在 Server Action 内部再校验一次**
- 实战：认证守卫、角色重定向、地理重写、i18n、CORS、请求头改写、后台埋点
`
  },
  {
    id: "nextjs-i18n",
    group: "高级路由",
    icon: "🌍",
    title: "国际化与主题切换",
    content: `

# 国际化与主题切换

国际化（i18n）让网站适配不同语言和地区。Next.js App Router 推荐用**路由式 i18n**（\`[lang]\` 动态段），配合 Proxy 做语言检测和重定向。本章还会讲暗黑模式主题切换——它和 i18n 一样都涉及"避免 hydration mismatch"。

## 一、路由式 i18n：[lang] 动态段

把所有特殊文件嵌套在 \`app/[lang]\` 下，路由器会动态处理不同语言，并把 \`lang\` 参数传给每个 layout 和 page。

\`\`\`text filename="目录结构"
app/
└─ [lang]/
   ├─ layout.tsx       # 根布局，<html lang> 用 params.lang
   ├─ page.tsx         # 首页
   └─ about/page.tsx
\`\`\`

> ⚠️ **Next.js 16：\`params\` 是 Promise**，必须 await：

\`\`\`tsx filename="app/[lang]/page.tsx"
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from './dictionaries'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  // params 是 Promise，必须 await
  const { lang } = await params

  // 类型守卫：lang 不是受支持语言则 404
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  return <button>{dict.products.cart}</button> // "加入购物车" 或 "Add to Cart"
}
\`\`\`

> \`PageProps<'/[lang]'>\` 和 \`LayoutProps<'/[lang]'>\` 是 Next.js 全局 TypeScript 助手，给路由参数提供强类型。

## 二、消息文件组织（字典）

每种语言一个 JSON 字典，键映射到本地化字符串：

\`\`\`json filename="app/[lang]/dictionaries/zh.json"
{
  "products": {
    "cart": "加入购物车",
    "checkout": "结账"
  },
  "nav": {
    "home": "首页",
    "about": "关于"
  }
}
\`\`\`

\`\`\`json filename="app/[lang]/dictionaries/en.json"
{
  "products": {
    "cart": "Add to Cart",
    "checkout": "Checkout"
  },
  "nav": {
    "home": "Home",
    "about": "About"
  }
}
\`\`\`

\`\`\`ts filename="app/[lang]/dictionaries.ts"
import 'server-only'

// 每种语言对应一个动态 import，按需加载
const dictionaries = {
  zh: () => import('./dictionaries/zh.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

// 类型守卫：把 string 收窄成 Locale
export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
\`\`\`

因为 App Router 默认是 Server Component，字典文件**只在服务端运行**，不会进入客户端 bundle。

## 三、Demo：[lang] 段 + 字典完整示例

\`\`\`tsx filename="app/[lang]/layout.tsx"
import { notFound } from 'next/navigation'
import { hasLocale } from './dictionaries'

// 静态预渲染支持的语言
export async function generateStaticParams() {
  return [{ lang: 'zh' }, { lang: 'en' }]
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
\`\`\`

\`\`\`tsx filename="app/[lang]/page.tsx"
import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from './dictionaries'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  return (
    <main>
      <h1>{dict.nav.home}</h1>
      <button>{dict.products.cart}</button>
    </main>
  )
}
\`\`\`

## 四、语言检测：Accept-Language + Proxy

推荐用浏览器语言偏好检测。在 Proxy 里读 \`Accept-Language\` 头，匹配最佳语言后重定向：

\`\`\`ts filename="proxy.ts"
import { NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { NextRequest } from 'next/server'

const locales = ['zh', 'en']
const defaultLocale = 'zh'

function getLocale(request: NextRequest): string {
  const headers: Record<string, string> = {}
  request.headers.forEach((v, k) => (headers[k] = v))
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = locales.some(
    (l) => pathname.startsWith(\`/\${l}/\`) || pathname === \`/\${l}\`
  )
  if (hasLocale) return

  const locale = getLocale(request)
  request.nextUrl.pathname = \`/\${locale}\${pathname}\`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next).*)'],
}
\`\`\`

## 五、Demo：基于 Cookie 的语言切换

Accept-Language 是默认推断，但用户应能主动切换。把用户选择写进 cookie，Proxy 优先读 cookie：

\`\`\`tsx filename="app/[lang]/components/language-switcher.tsx"
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(false)

  async function switchTo(lang: 'zh' | 'en') {
    setPending(true)
    // 通过 Server Action 设置 cookie（见下）
    await setLocaleCookie(lang)
    // 替换当前路径里的 lang 段
    const segments = pathname.split('/')
    segments[1] = lang
    router.push(segments.join('/') || '/')
    router.refresh()
    setPending(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchTo('zh')}
        disabled={pending}
        className="px-2 py-1 border"
      >
        中文
      </button>
      <button
        onClick={() => switchTo('en')}
        disabled={pending}
        className="px-2 py-1 border"
      >
        English
      </button>
    </div>
  )
}
\`\`\`

\`\`\`ts filename="app/[lang]/actions.ts"
'use server'

import { cookies } from 'next/headers'

// Server Action：把语言偏好写进 cookie，有效期一年
export async function setLocaleCookie(locale: string) {
  const store = await cookies()
  store.set('preferred-locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}
\`\`\`

\`\`\`ts filename="proxy.ts" 片段
// Proxy 优先读 cookie，没有再 fallback 到 Accept-Language
export function proxy(request: NextRequest) {
  const cookieLocale = request.cookies.get('preferred-locale')?.value
  // ... 若 cookieLocale 在 locales 中，优先用它
}
\`\`\`

## 六、暗黑模式：避免 hydration mismatch

暗黑模式的最大坑是 **hydration mismatch**：服务端不知道用户主题偏好，渲染的是浅色；客户端读到 localStorage / prefers-color-scheme 是深色，React 报警告并闪烁。

解决思路：**在 \`<head>\` 注入一段阻塞式脚本，在 React hydrate 前就给 \`<html>\` 加上 \`dark\` class**。这正是 \`next-themes\` 的做法。

## 七、Demo：next-themes ThemeProvider

\`\`\`bash filename="安装"
npm install next-themes
\`\`\`

\`\`\`tsx filename="components/theme-provider.tsx"
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
\`\`\`

\`\`\`tsx filename="app/[lang]/layout.tsx"
import { ThemeProvider } from '@/components/theme-provider'

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        {/* attribute="class"：通过 class 控制；enableSystem：跟随系统偏好 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
\`\`\`

> \`suppressHydrationWarning\` 必须加在 \`<html>\` 上，因为 next-themes 会修改 \`<html>\` 的 class，服务端和客户端必然不一致。

\`\`\`tsx filename="components/theme-toggle.tsx"
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // 避免 hydration mismatch：mounted 前不渲染按钮内容
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <button className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 border rounded"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
\`\`\`

## 八、Demo：CSS 变量主题切换

不用 next-themes 也能做主题切换，关键是**用 CSS 变量定义颜色**，主题切换只改变量值：

\`\`\`css filename="app/globals.css"
/* 浅色主题（默认） */
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --accent: #3b82f6;
  --card-bg: #f5f5f5;
}

/* 暗色主题：html.dark 时覆盖变量 */
html.dark {
  --bg: #0a0a0a;
  --fg: #f5f5f5;
  --accent: #60a5fa;
  --card-bg: #1a1a1a;
}

/* 组件引用变量，主题切换时自动响应 */
body {
  background: var(--bg);
  color: var(--fg);
  transition: background 0.2s, color 0.2s;
}

.card {
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 0.5rem;
}

.button {
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
\`\`\`

\`\`\`tsx filename="components/theme-toggle-css.tsx"
'use client'

import { useEffect, useState } from 'react'

export function ThemeToggleCss() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // 初次挂载：读 localStorage，给 <html> 加 class
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    const initial = saved ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <button onClick={toggle} className="button">
      {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
    </button>
  )
}
\`\`\`

> 注意：手动实现时 \`useState\` 初值是 \`'light'\`（和服务端一致），在 \`useEffect\` 里再读真实偏好并更新——这样首次渲染服务端/客户端一致，避免 hydration mismatch。

## 九、完整的 i18n + 主题布局

\`\`\`tsx filename="app/[lang]/layout.tsx"
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageSwitcher } from './components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { getDictionary, hasLocale } from './dictionaries'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return [{ lang: 'zh' }, { lang: 'en' }]
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="flex justify-between p-4 border-b">
            <nav>{dict.nav.home}</nav>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          <main className="p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
\`\`\`

## 小结

- 路由式 i18n：所有文件嵌套在 \`app/[lang]\` 下
- **Next.js 16：\`params\` 是 Promise，\`generateStaticParams\` 静态预渲染多语言**
- 字典文件只在服务端运行，不进客户端 bundle
- 语言检测：Proxy 读 Accept-Language + cookie，重定向到带前缀的 URL
- 暗黑模式防 hydration mismatch：next-themes 在 \`<head>\` 注入阻塞脚本；\`<html>\` 加 \`suppressHydrationWarning\`
- CSS 变量主题：变量定义颜色，主题切换只改变量值，组件透明响应
`
  },
];
