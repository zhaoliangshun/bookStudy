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