// =============================================================
// Next.js 16 教程 —— 第五批章节（配置与部署篇，共 5 章）
// 基于 Next.js 16.2.9 + React 19.2.4
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：next.config 详解
  // =========================================================
  {
    id: "nextjs-config",
    group: "配置与部署",
    icon: "⚙️",
    title: "next.config 详解",
    content: `# next.config 详解

\`next.config\` 是 Next.js 项目的总控制台，几乎所有构建期、运行期的行为都可以通过它来调整。Next.js 16 在配置层面做了若干破坏性变更，本章会逐一拆解，让你在升级或新建项目时不再踩坑。

## 配置文件的三种形态

Next.js 支持以下几种配置文件名，按优先级从高到低：

1. \`next.config.ts\`（推荐，TypeScript 原生支持）
2. \`next.config.mjs\`（ESM 模块）
3. \`next.config.js\`（CommonJS 模块）

> 注意：\`.cjs\` 和 \`.cts\` 扩展名**不被支持**。

在 Next.js 16 中，\`create-next-app\` 默认生成 \`next.config.ts\`，享受类型提示与编译期校验：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 在这里填写所有配置项
}

export default nextConfig
\`\`\`

### 函数式配置

当需要根据构建阶段（开发/生产）返回不同配置时，可以导出一个函数。第一个参数 \`phase\` 表示当前阶段，可从 \`next/constants\` 导入：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'

export default (phase: string): NextConfig => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      // 仅开发环境生效的配置
      reactStrictMode: true,
    }
  }
  return {
    // 生产环境配置
    reactStrictMode: true,
    output: 'standalone',
  }
}
\`\`\`

## Turbopack 顶层配置（Next.js 16 破坏性变更）

**重要变更**：在 Next.js 13.0 ~ 15.2.x 中，Turbopack 配置位于 \`experimental.turbo\`；从 15.3.0 起迁移到顶层 \`turbopack\` 字段；**Next.js 16 正式移除 \`experimental.turbo\`**，旧写法会直接报错。

迁移命令（如仍在用旧写法）：

\`\`\`bash
npx @next/codemod@latest next-experimental-turbo-to-turbopack .
\`\`\`

新的顶层写法：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  turbopack: {
    // 应用根目录，默认自动检测（依据 lockfile）
    root: path.join(__dirname, '..'),
    // 模块别名，等价于 webpack 的 resolve.alias
    resolveAlias: {
      underscore: 'lodash',
      // 条件别名，目前仅支持 browser 条件
      mocha: { browser: 'mocha/browser-entry.js' },
    },
    // 自定义可解析扩展名（会覆盖默认列表，需包含默认项）
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    // 生成 debug ID，便于线上错误归因
    debugIds: true,
    // 自定义 loader 规则
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
\`\`\`

> Turbopack 内置 CSS / 现代 JS 编译，无需再配置 \`css-loader\`、\`postcss-loader\`、\`babel-loader\`。

## redirects：路径重定向

\`redirects\` 是一个异步函数，返回重定向规则数组。它在文件系统（页面与 public 静态文件）之前匹配。

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 永久重定向：308，浏览器/搜索引擎会永久缓存
      {
        source: '/old-blog/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
      // 临时重定向：307，不缓存，且保留原请求方法（不会把 POST 变 GET）
      {
        source: '/post/:slug(\\\\d{1,})', // 正则匹配，仅匹配数字
        destination: '/news/:slug',
        permanent: false,
      },
      // 基于 header 的条件重定向
      {
        source: '/:path((?!another-page$).*)',
        has: [{ type: 'header', key: 'x-redirect-me' }],
        destination: '/another-page',
        permanent: false,
      },
      // 基于 host 的条件重定向（多域名分流）
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'old.example.com' }],
        destination: 'https://new.example.com/:path*',
        permanent: true,
        basePath: false, // 外部跳转时不附加 basePath
      },
    ]
  },
}

export default nextConfig
\`\`\`

> 为什么用 307/308 而不是 301/302？传统 302 会让浏览器把 POST 改成 GET，而 307/308 会**保留原请求方法**，更安全。

## rewrites：路径代理（URL 透明转发）

与 \`redirects\` 不同，\`rewrites\` 不会改变浏览器地址栏，相当于反向代理。返回数组时在文件系统之后、动态路由之前匹配；返回对象则可细分为三段：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // 在 headers/redirects 之后、静态文件之前
      beforeFiles: [
        {
          source: '/some-page',
          destination: '/somewhere-else',
          has: [{ type: 'query', key: 'overrideMe' }],
        },
      ],
      // 在静态文件之后、动态路由之前
      afterFiles: [
        // 把 /api/legacy 透明代理到新接口
        { source: '/api/legacy/:path*', destination: '/api/v2/:path*' },
      ],
      // 所有路由都没命中时的兜底，常用于渐进式迁移
      fallback: [
        {
          source: '/:path*',
          destination: 'https://legacy-site.com/:path*',
        },
      ],
    }
  },
}

export default nextConfig
\`\`\`

## headers：自定义响应头

\`headers\` 用于给指定路径附加 HTTP 响应头，是配置安全头（CSP、HSTS、X-Frame-Options 等）的推荐位置：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)', // 匹配所有路径
        headers: [
          // 强制 HTTPS，2 年有效期，含子域名
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // 禁止被 iframe 嵌套，防点击劫持
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // 禁止 MIME 嗅探
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer 策略
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          // 权限策略：禁用摄像头/麦克风/定位
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          // CORS 跨域配置
          { key: 'Access-Control-Allow-Origin', value: 'https://trusted-site.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
\`\`\`

> 若多条规则匹配同一路径并设置同一 key，**后者覆盖前者**。

## basePath 与 assetPrefix

当应用部署在子路径下（如 \`https://example.com/docs\`）时使用 \`basePath\`：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/docs',
  // 静态资源走独立 CDN
  assetPrefix: 'https://cdn.example.com/next/',
  // URL 末尾统一加斜杠
  trailingSlash: true,
}

export default nextConfig
\`\`\`

配置后，所有 \`<Link>\`、\`next/router\`、\`next/image\` 都会自动加上 \`/docs\` 前缀。

## output：构建产物模式

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // standalone：生成最小化自包含产物，适合 Docker
  output: 'standalone',
  // export：纯静态导出，不支持服务端功能（ISR、API 路由、中间件等）
  // output: 'export',
}

export default nextConfig
\`\`\`

\`standalone\` 会在 \`.next/standalone\` 下生成一个独立可运行的 Node 服务，仅包含运行所需文件，体积比完整 \`node_modules\` 小很多。

## reactCompiler（Next.js 16 稳定）

React Compiler 在 Next.js 16 中**转为稳定**，开启后自动优化组件，无需再手写 \`useMemo\`/\`useCallback\`：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16 稳定配置项
  reactCompiler: true,
  // 生产环境始终开启严格模式，便于发现潜在副作用
  reactStrictMode: true,
}

export default nextConfig
\`\`\`

> 开启前需安装编译器：\`npm install babel-plugin-react-compiler\`。

## ESLint 配置移除说明（Next.js 16 破坏性变更）

**重要变更**：Next.js 16 **移除了 \`next lint\` 命令**及 \`eslint\` 配置项（\`next.config\` 里不再支持 \`eslint\` 字段）。改用 ESLint 9 的 **Flat Config**：

\`\`\`js filename="eslint.config.mjs"
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
\`\`\`

\`package.json\` 中的 lint 脚本改为直接调用 \`eslint\`：\`"lint": "eslint"\`。

## 其他常用项速查

| 配置项 | 作用 | 示例 |
| --- | --- | --- |
| \`pageExtensions\` | 被识别为页面的扩展名 | \`['tsx', 'ts']\` |
| \`poweredByHeader\` | 是否发送 X-Powered-By | \`false\`（建议关闭） |
| \`productionBrowserSourceMaps\` | 生产环境开启 source map | \`true\` |
| \`logging.fetches\` | 开发环境日志格式 | \`{ fetches: { fullUrl: true } }\` |
| \`images.remotePatterns\` | 允许优化的远程图片域名 | 见官方图片章节 |

至此，\`next.config\` 的核心配置项已经覆盖完毕。掌握这些，你就能驾驭 Next.js 16 的构建与运行行为。`,
  },

  // =========================================================
  // 第二章：环境变量与运行时
  // =========================================================
  {
    id: "nextjs-env",
    group: "配置与部署",
    icon: "🔐",
    title: "环境变量与运行时",
    content: `# 环境变量与运行时

环境变量是连接代码与部署环境的桥梁：密钥、数据库地址、功能开关都通过它注入。Next.js 16 在运行时模型上做了重要清理，本章会讲清楚"构建时"与"运行时"的边界，以及如何安全地处理敏感数据。

## NEXT_PUBLIC_ 前缀：构建时内联到客户端

只有以 \`NEXT_PUBLIC_\` 开头的环境变量会被**构建时内联**到发给浏览器的 JS 包里。其他变量只在 Node.js 服务端可见。

\`\`\`bash filename=".env"
# 服务端可见，浏览器拿不到
DB_HOST=localhost
DB_USER=myuser
DB_PASS=s3cret

# 构建时内联到客户端 bundle
NEXT_PUBLIC_ANALYTICS_ID=abcdefghijk
NEXT_PUBLIC_API_BASE=https://api.example.com
\`\`\`

> 一旦 \`next build\` 完成，\`NEXT_PUBLIC_\` 变量的值就被**冻结**到 bundle 里。后续即使修改环境变量也不会生效——这是单镜像多环境部署时最常见的坑。

## .env 文件加载顺序

Next.js 按以下顺序查找，命中即停止：

1. \`process.env\`（系统环境变量，优先级最高）
2. \`.env.\$(NODE_ENV).local\`（如 \`.env.production.local\`）
3. \`.env.local\`（**测试环境不会加载**，保证测试可复现）
4. \`.env.\$(NODE_ENV)\`（如 \`.env.production\`）
5. \`.env\`（默认兜底）

\`NODE_ENV\` 只允许 \`production\`、\`development\`、\`test\` 三种值。运行 \`next dev\` 时自动设为 \`development\`，其他命令为 \`production\`。

变量可引用其他变量，用 \`$\` 即可，需转义时写 \`\\$\`：

\`\`\`bash filename=".env"
TWITTER_USER=nextjs
TWITTER_URL=https://x.com/$TWITTER_USER
\`\`\`

> 若使用 \`/src\` 目录，\`.env\` 文件必须放在项目根目录（\`/src\` 的父级），不会被 \`/src\` 内的文件加载。

## server-only / client-only：编译期隔离

为防止敏感代码意外进入客户端 bundle，Next.js 官方提供两个"哨兵"包：

\`\`\`bash
npm install server-only client-only
\`\`\`

\`\`\`ts filename="lib/db.ts"
// 在任何只允许服务端执行的模块顶部导入
import 'server-only'

import { db } from './db-connection'

// 若该模块被 'use client' 组件引入，构建会直接报错
export async function getUser(id: string) {
  return db.user.findUnique({ where: { id } })
}
\`\`\`

\`\`\`ts filename="components/Analytics.tsx"
'use client'
// 只允许在客户端运行的模块
import 'client-only'

export function Analytics() {
  // 访问 window、localStorage 等
  return null
}
\`\`\`

## connection()：运行时读取环境变量

由于静态优化（SSG）的存在，直接在组件里读 \`process.env.XXX\` 可能被构建期求值并固化。要确保读到的是**请求时刻**的环境变量，需调用 \`connection()\` 触发动态渲染：

\`\`\`tsx filename="app/page.tsx"
import { connection } from 'next/server'

export default async function Page() {
  // 显式声明此组件依赖请求时上下文， opting into dynamic rendering
  await connection()
  // 此处读取的是运行时环境变量，而非构建时
  const featureFlag = process.env.FEATURE_FLAG
  const dbUrl = process.env.DATABASE_URL

  return (
    <main>
      <h1>当前环境: {process.env.NODE_ENV}</h1>
      <p>功能开关: {featureFlag}</p>
    </main>
  )
}
\`\`\`

> \`connection()\` 同时会让 \`cookies()\`、\`headers()\` 等 Request API 也走运行时路径。这对"一份 Docker 镜像跑多个环境"至关重要。

## taint API：阻止敏感数据泄露到客户端

即便你小心地用 \`server-only\`，也可能在序列化时把敏感字段（如用户密码哈希、邮箱）作为 prop 传给客户端组件。React 19 的 \`taintObjectMember\` / \`taintUniqueValue\` 会在这种"泄露"发生时抛错：

\`\`\`tsx filename="app/users/[id]/page.tsx"
import { unstable_taintObjectMember, unstable_taintUniqueValue } from 'react'

export default async function UserProfile({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id)

  // 标记单个字段：一旦它被传到客户端组件就报错
  unstable_taintObjectMember(user, user.passwordHash, '密码哈希禁止进入客户端')
  // 标记单个原始值
  unstable_taintUniqueValue(user.email, user, '邮箱禁止进入客户端')

  // user.name 是安全的，可以传给客户端组件
  return <ProfileCard name={user.name} />
}

function ProfileCard({ name }: { name: string }) {
  'use client'
  return <h1>欢迎，{name}</h1>
}
\`\`\`

> 该 API 仍为 \`unstable_\` 前缀，但已可在生产使用。它不是访问控制，而是"防呆"——避免你手滑把不该传的数据传出去。

## Edge vs Node.js 运行时

每个路由（页面、Route Handler、中间件）都可声明运行时：

\`\`\`ts filename="app/api/og/route.ts"
// Edge 运行时：冷启动极快，但 API 受限（无 fs、部分 Node 模块不可用）
export const runtime = 'edge'

export async function GET() {
  return new Response('Hello from Edge')
}
\`\`\`

\`\`\`ts filename="app/api/upload/route.ts"
// Node.js 运行时（默认）：支持完整 Node API
export const runtime = 'nodejs'
export const maxDuration = 60 // 秒，长任务

export async function POST(req: Request) {
  // 可以使用 fs、Buffer、sharp 等 Node 生态库
  const buf = Buffer.from(await req.arrayBuffer())
  return new Response('uploaded')
}
\`\`\`

| 维度 | Node.js 运行时 | Edge 运行时 |
| --- | --- | --- |
| 冷启动 | 较慢 | 极快 |
| API 范围 | 完整 Node | Web API 子集 |
| 适用场景 | 重计算、文件、数据库 | 鉴权、改写、轻量代理 |
| 最大执行时长 | 可配置（Vercel 上可达分钟级） | 通常秒级 |

## Next.js 16 移除 serverRuntimeConfig / publicRuntimeConfig（重要变更）

**破坏性变更**：Pages Router 时代的 \`serverRuntimeConfig\` 和 \`publicRuntimeConfig\` 在 Next.js 16 中**彻底移除**。旧代码：

\`\`\`js
// ❌ Next.js 16 不再支持
module.exports = {
  serverRuntimeConfig: {
    secret: process.env.SECRET,
  },
  publicRuntimeConfig: {
    apiBase: process.env.API_BASE,
  },
}
\`\`\`

迁移方案：
- 服务端配置 → 直接读 \`process.env.XXX\`（必要时配合 \`connection()\`）
- 客户端配置 → 用 \`NEXT_PUBLIC_\` 前缀，或通过 Route Handler 下发

\`\`\`tsx filename="app/api/config/route.ts"
// 让客户端在运行时获取配置（避免构建时固化）
import { connection } from 'next/server'

export async function GET() {
  await connection()
  return Response.json({
    apiBase: process.env.API_BASE,
    featureFlag: process.env.FEATURE_FLAG,
  })
}
\`\`\`

## 按运行时分支：一个完整示例

下面是一个综合示例，演示如何在不同运行时读取环境变量并安全地暴露给客户端：

\`\`\`tsx filename="app/dashboard/page.tsx"
import { connection } from 'next/server'
import { unstable_taintObjectMember } from 'react'
import { Dashboard } from './dashboard'
import type { User } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // 强制动态渲染

export default async function Page() {
  await connection() // 进入请求时上下文

  const user = await fetchCurrentUser()
  // 防止敏感字段外泄
  unstable_taintObjectMember(user, user.token, 'token 禁止进入客户端')

  // 只把安全字段通过 props 传给客户端组件
  return <Dashboard name={user.name} role={user.role} />
}

async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(\`\${process.env.API_BASE}/me\`, {
    headers: { Authorization: \`Bearer \${process.env.INTERNAL_TOKEN}\` },
    cache: 'no-store',
  })
  return res.json()
}
\`\`\`

掌握环境变量的"构建时 vs 运行时"边界，再配合 \`server-only\`、\`taint\`、\`connection()\` 三件套，你就能在 Next.js 16 里安全地处理任何敏感配置。`,
  },

  // =========================================================
  // 第三章：部署与自托管
  // =========================================================
  {
    id: "nextjs-deploying",
    group: "配置与部署",
    icon: "🚀",
    title: "部署与自托管",
    content: `# 部署与自托管

Next.js 应用的部署形态非常灵活：可以跑在 Node.js 服务器、Docker 容器、纯静态导出，也可以通过 Adapter 适配到各种边缘平台。本章聚焦最常用的几种方式，并给出可直接落地的配置。

## 部署方式总览

| 方式 | 功能支持 | 典型场景 |
| --- | --- | --- |
| Node.js server（\`next start\`） | 全部 | 自有服务器、VPS |
| Docker 容器 | 全部 | K8s、云容器服务 |
| Static export（\`output: 'export'\`） | 受限 | S3、Nginx、CDN |
| Adapter | 视平台 | Vercel、Bun、Cloudflare 等 |

## Vercel 部署（推荐零配置）

Vercel 是 Next.js 的官方平台，几乎零配置：

1. 把代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 控制台导入仓库
3. 框架自动识别为 Next.js，构建命令默认 \`next build\`，输出由平台接管
4. 在 \`Settings → Environment Variables\` 配置变量（区分 Production/Preview/Development）
5. 每次 push 自动构建预览，合并到主分支即上线

\`\`\`json filename="package.json"
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
\`\`\`

Vercel 自动启用 ISR、Edge Functions、图片优化、CDN，无需额外配置。

## output: standalone —— 最小化自包含产物

在 \`next.config.ts\` 开启 \`standalone\`，构建后会生成一个**自包含**的 Node 服务，仅打包运行所需依赖：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
}

export default nextConfig
\`\`\`

构建产物结构：

\`\`\`
.next/
├── standalone/        # 独立服务，含最小化 node_modules
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── static/            # 静态资源（需手动复制）
└── server/            # 服务端产物
\`\`\`

> \`standalone\` 不会自动包含 \`public/\` 和 \`.next/static\`，需手动复制到部署目录。

## Docker：多阶段构建（推荐 standalone）

下面是一份生产级 Dockerfile，基于 \`standalone\` 产物，镜像体积通常只有 100~200MB：

\`\`\`dockerfile filename="Dockerfile"
# ---- 阶段 1：deps ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- 阶段 2：builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 构建时变量通过 ARG 注入（仅 NEXT_PUBLIC_ 生效）
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
RUN npm run build

# ---- 阶段 3：runner（最终镜像） ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# 复制 standalone 产物
COPY --from=builder /app/.next/standalone ./
# 复制静态资源与 public（standalone 不会自动包含）
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
\`\`\`

构建与运行：

\`\`\`bash
docker build -t my-next-app --build-arg NEXT_PUBLIC_API_BASE=https://api.example.com .
docker run -p 3000:3000 -e DATABASE_URL=postgres://... my-next-app
\`\`\`

> 关键点：\`NEXT_PUBLIC_\` 变量在 \`build\` 阶段固化，运行时环境变量（如 \`DATABASE_URL\`）在 \`run\` 阶段注入——这正是 standalone 的价值所在。

## Nginx 反向代理

自托管时通常在前面挂一层 Nginx 做TLS 终止、压缩、限流：

\`\`\`nginx filename="nginx.conf"
upstream nextjs {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/ssl/example.com.pem;
    ssl_certificate_key /etc/ssl/example.com.key;

    # 静态资源走长缓存（_next/static 内容带 hash，可永久缓存）
    location /_next/static/ {
        proxy_pass http://nextjs;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 其余请求转发到 Node 服务
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## 健康检查与 pm2 守护

standalone 产物本身就是个 Node 服务，可用 pm2 守护：

\`\`\`js filename="ecosystem.config.cjs"
module.exports = {
  apps: [
    {
      name: 'next-app',
      script: '.next/standalone/server.js',
      cwd: '/app',
      instances: 'max', // 多实例负载均衡
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
\`\`\`

健康检查建议单独建一个 Route Handler，只做轻量探测：

\`\`\`ts filename="app/api/health/route.ts"
export const dynamic = 'force-dynamic'

export async function GET() {
  // 可在此探测数据库连通性
  return Response.json({ status: 'ok', ts: Date.now() })
}
\`\`\`

Nginx / 负载均衡器轮询 \`/api/health\` 即可。

## static export：纯静态导出

当应用不需要服务端能力时，可导出为纯静态文件，部署到任何静态服务器：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  // 静态导出通常需要 trailing slash，避免目录索引问题
  trailingSlash: true,
  // 图片优化需关闭（或用 unoptimizer）
  images: { unoptimized: true },
}

export default nextConfig
\`\`\`

**限制**：\`output: 'export'\` 不支持 ISR、API 路由、中间件、服务端 Action、图片优化、动态路由的动态段（必须 \`generateStaticParams\` 全量预生成）。它本质是一个 SPA/MPA 混合静态站。

## multi-zones：多应用聚合

当多个独立 Next.js 应用共享同一域名（不同路径）时，用 \`rewrites\` 把请求路由到对应应用：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: 'https://blog.example.com/blog',
      },
      {
        source: '/blog/:path*',
        destination: 'https://blog.example.com/blog/:path*',
      },
    ]
  },
}

export default nextConfig
\`\`\`

## process.env.NODE_ENV

\`process.env.NODE_ENV\` 由 Next.js 自动管理：
- \`next dev\` → \`development\`
- \`next build\` / \`next start\` → \`production\`

生产环境务必保证 \`NODE_ENV=production\`，否则 React 不会做生产优化，性能差异巨大。在 Docker 镜像里已通过 \`ENV NODE_ENV=production\` 固化。

部署的核心思路是：能上 Vercel 就上 Vercel；要自托管就 \`standalone + Docker\`；纯静态站用 \`export\`。理解这三条路径，就能覆盖绝大多数上线场景。`,
  },

  // =========================================================
  // 第四章：测试与调试
  // =========================================================
  {
    id: "nextjs-testing",
    group: "配置与部署",
    icon: "🧪",
    title: "测试与调试",
    content: `# 测试与调试

没有测试的代码是黑盒，没有调试手段的线上是黑洞。Next.js 16 在工具链上做了重要统一：ESLint 全面切到 Flat Config，\`next lint\` 命令移除；React Compiler 转为稳定。本章把单元测试、E2E、调试器、Lint 一次性讲透。

## 测试金字塔与选型

| 层级 | 工具 | 速度 | 覆盖场景 |
| --- | --- | --- | --- |
| 单元测试 | Vitest + Testing Library | 极快 | 纯函数、客户端组件 |
| 组件测试 | Vitest + jsdom | 快 | 同步组件 |
| E2E | Playwright | 慢 | 完整用户流程、异步 Server Components |

> 由于 \`async\` Server Components 是 React 生态新概念，Vitest 暂不支持，推荐用 Playwright 做端到端验证。

## Vitest：单元测试

安装依赖（TypeScript 项目）：

\`\`\`bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
\`\`\`

\`\`\`ts filename="vitest.config.mts"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
\`\`\`

\`\`\`ts filename="tests/setup.ts"
import '@testing-library/jest-dom/vitest'
\`\`\`

\`\`\`json filename="package.json"
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
\`\`\`

### 测试客户端组件

\`\`\`tsx filename="app/components/Counter.tsx"
'use client'
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p data-testid="count">当前: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  )
}
\`\`\`

\`\`\`tsx filename="tests/counter.test.tsx"
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from '../app/components/Counter'

describe('Counter', () => {
  it('点击按钮应让计数 +1', () => {
    render(<Counter />)
    expect(screen.getByTestId('count')).toHaveTextContent('当前: 0')
    fireEvent.click(screen.getByText('+1'))
    expect(screen.getByTestId('count')).toHaveTextContent('当前: 1')
  })
})
\`\`\`

## mock next/navigation

测试用到 \`useSearchParams\`、\`useRouter\` 的组件时需 mock：

\`\`\`ts filename="tests/setup.ts"
import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// mock next/navigation，避免在 jsdom 下报错
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams('foo=bar'),
  usePathname: () => '/test',
  redirect: vi.fn(),
}))
\`\`\`

## 测试 Server Actions

Server Action 是服务端函数，单元测试里可直接 import 调用，把数据库等依赖 mock 掉即可：

\`\`\`ts filename="app/actions/post.ts"
'use server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  if (!title) return { error: '标题不能为空' }
  await savePost(title)
  revalidatePath('/posts')
  return { success: true }
}

async function savePost(title: string) {
  // 实际写入数据库
}
\`\`\`

\`\`\`ts filename="tests/post.test.ts"
import { describe, it, expect, vi } from 'vitest'

// mock next/cache 的 revalidatePath，避免在测试环境报错
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createPost } from '../app/actions/post'

describe('createPost', () => {
  it('标题为空应返回错误', async () => {
    const fd = new FormData()
    const res = await createPost(fd)
    expect(res).toEqual({ error: '标题不能为空' })
  })

  it('合法标题应返回成功', async () => {
    const fd = new FormData()
    fd.append('title', '你好 Next.js')
    const res = await createPost(fd)
    expect(res).toEqual({ success: true })
  })
})
\`\`\`

## Playwright：端到端测试

\`\`\`bash
npm init playwright
\`\`\`

\`\`\`ts filename="playwright.config.ts"
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // 关键：让 Playwright 自动拉起生产服务并等待就绪
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
\`\`\`

\`\`\`ts filename="tests/e2e/navigation.spec.ts"
import { test, expect } from '@playwright/test'

test('从首页导航到关于页', async ({ page }) => {
  await page.goto('/')
  await page.click('text=关于')
  await expect(page).toHaveURL('/about')
  await expect(page.locator('h1')).toContainText('关于')
})
\`\`\`

> 推荐对生产构建（\`npm run build && npm run start\`）做 E2E，更贴近真实行为。\`webServer\` 配置会自动拉起服务。

## React Compiler（Next.js 16 稳定）

React Compiler 自动 memoize 组件，减少手写 \`useMemo\`/\`useCallback\`。Next.js 16 中 \`reactCompiler\` 转为稳定配置：

\`\`\`ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
}

export default nextConfig
\`\`\`

需要安装编译器：

\`\`\`bash
npm install babel-plugin-react-compiler
\`\`\`

开启后，下面的组件会自动优化，\`expensiveValue\` 只在 \`count\` 变化时重算：

\`\`\`tsx filename="app/components/List.tsx"
'use client'
// 无需手写 useMemo，编译器自动处理
export function List({ items, count }: { items: string[]; count: number }) {
  const expensiveValue = items.filter((i) => i.length > count).join(',')
  return <p>{expensiveValue}</p>
}
\`\`\`

> 开启后建议跑一遍 ESLint 的 \`react-compiler\` 规则，找出违反 Rules of React 的地方（如副作用写在渲染中）。

## ESLint Flat Config（Next.js 16 默认，next lint 已移除）

**破坏性变更**：Next.js 16 **移除 \`next lint\` 命令**，\`next.config\` 里也不再支持 \`eslint\` 字段。统一使用 ESLint 9 的 Flat Config：

\`\`\`js filename="eslint.config.mjs"
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
\`\`\`

\`package.json\` 脚本：

\`\`\`json filename="package.json"
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
\`\`\`

> 若想加 React Compiler 规则，安装 \`eslint-plugin-react-compiler\` 后在数组里追加即可。

## 调试技巧

### VSCode debugger

\`\`\`json filename=".vscode/launch.json"
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next: Node",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "console": "integratedTerminal"
    },
    {
      "name": "Next: Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "\${workspaceFolder}"
    }
  ]
}
\`\`\`

### Server Components 调试

Server Components 跑在 Node 端，\`console.log\` 会输出到**服务端终端**（不是浏览器控制台）。要区分：

- 浏览器 Console → 客户端组件的 log
- \`next dev\` 终端 → Server Components / Route Handlers / Server Actions 的 log

### React DevTools

安装 React DevTools 浏览器插件，可查看组件树、状态、Profiler。Next.js 16 配合 React 19，Profiler 会显示 Compiler 自动插入的 memo 节点。

测试与调试是工程的"安全网"。Vitest 守住单元逻辑，Playwright 守住用户流程，ESLint Flat Config 守住代码质量，React Compiler + DevTools 守住性能。四者协同，才能放心迭代。`,
  },

  // =========================================================
  // 第五章：React 19.2 新特性实战
  // =========================================================
  {
    id: "nextjs-react19",
    group: "配置与部署",
    icon: "🌟",
    title: "React 19.2 新特性实战",
    content: `# React 19.2 新特性实战

Next.js 16 内置 React 19.2，带来一批改变写法的新 API：View Transitions 让路由动画触手可及，\`useEffectEvent\` 把非响应式逻辑从 effect 里解放出来，\`use\` + Suspense 让流式渲染更自然，Actions 让表单回归语义化。本章用可运行的 demo 把这些特性串起来，并作为整套教程的收尾。

## View Transitions：原生路由动画

View Transitions API 让浏览器在两帧之间做平滑过渡。React 19.2 暴露 \`<ViewTransition>\` 组件，Next.js 16 的 App Router 可直接使用：

\`\`\`tsx filename="app/components/ProductGrid.tsx"
import { ViewTransition } from 'react'
import Link from 'next/link'

export function ProductGrid({ products }: { products: { id: string; name: string }[] }) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {/* name 属性让新旧两端的同 name 元素做形变动画 */}
          <ViewTransition name={\`product-\${p.id}\`}>
            <Link href={\`/products/\${p.id}\`}>
              <img src={\`/img/\${p.id}.jpg\`} alt={p.name} />
              <span>{p.name}</span>
            </Link>
          </ViewTransition>
        </li>
      ))}
    </ul>
  )
}
\`\`\`

\`\`\`tsx filename="app/products/[id]/page.tsx"
import { ViewTransition } from 'react'

export default async function Page({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)
  return (
    <main>
      {/* 与列表页同 name，浏览器自动做形变 */}
      <ViewTransition name={\`product-\${params.id}\`}>
        <img src={\`/img/\${params.id}.jpg\`} alt={product.name} />
      </ViewTransition>
      <h1>{product.name}</h1>
    </main>
  )
}
\`\`\`

> 浏览器需支持 View Transitions API（Chrome/Edge 已支持，Safari/Firefox 渐进支持）。不支持的浏览器会优雅降级为无动画。

## useEffectEvent：提取非响应式逻辑

\`useEffectEvent\` 让你把"不该成为依赖"的逻辑从 effect 里抽出来，避免 effect 频繁重建。它返回的函数永远是最新闭包，但**不会**触发 effect 重跑：

\`\`\`tsx filename="app/components/Timer.tsx"
'use client'
import { useEffect, useState, useEffectEvent } from 'react'

export function Timer({ onTick }: { onTick: (elapsed: number) => void }) {
  const [elapsed, setElapsed] = useState(0)

  // onTick 不放进 effect 依赖，但每次都能读到最新值
  const onTickEvent = useEffectEvent(onTick)

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        onTickEvent(next)
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, []) // 依赖数组里不需要 onTickEvent

  return <p>已运行 {elapsed} 秒</p>
}
\`\`\`

> 在 React 19.2 中 \`useEffectEvent\` 仍为实验性 API，需在配置里开启对应 flag，但已可用于生产验证。

## Activity：隐藏但保留状态

\`<Activity>\`（即原 \`<Offscreen>\`）以 \`display: none\` 隐藏子树，但**保留其 state 与 effect**。常用于 tab 切换、keep-alive 列表：

\`\`\`tsx filename="app/components/Tabs.tsx"
'use client'
import { useState, Activity } from 'react'
import { DraftEditor } from './DraftEditor'
import { Preview } from './Preview'

export function Tabs() {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  return (
    <div>
      <nav>
        <button onClick={() => setTab('edit')}>编辑</button>
        <button onClick={() => setTab('preview')}>预览</button>
      </nav>
      {/* 切到预览时，编辑器的草稿与光标位置都保留 */}
      <Activity mode={tab === 'edit' ? 'visible' : 'hidden'}>
        <DraftEditor />
      </Activity>
      <Activity mode={tab === 'preview' ? 'visible' : 'hidden'}>
        <Preview />
      </Activity>
    </div>
  )
}
\`\`\`

## use：读取 Promise 与 Context

\`use\` 可在渲染中读取 Promise 或 Context。与 \`await\` 不同，它能在条件分支与循环里调用，且配合 Suspense 实现流式：

\`\`\`tsx filename="app/page.tsx"
import { use, Suspense } from 'react'

async function fetchNews(): Promise<{ id: number; title: string }[]> {
  const res = await fetch('https://api.example.com/news', { cache: 'no-store' })
  return res.json()
}

const newsPromise = fetchNews()

function NewsList() {
  // use 会挂起组件，直到 Promise resolve，由外层 Suspense 接管
  const news = use(newsPromise)
  return (
    <ul>
      {news.map((n) => (
        <li key={n.id}>{n.title}</li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<p>加载新闻中…</p>}>
      <NewsList />
    </Suspense>
  )
}
\`\`\`

> 在 Server Components 里直接 \`await\`；在 Client Components 里用 \`use\` + Suspense 实现流式。

## Actions 与 useActionState：表单回归语义化

Server Actions 让表单无需手写 \`onSubmit\` + 防抖 + loading 状态。\`useActionState\` 把"待处理状态、返回结果、action 函数"打包：

\`\`\`tsx filename="app/components/SubscribeForm.tsx"
'use client'
import { useActionState } from 'react'

async function subscribe(prev: { error?: string; success?: boolean }, formData: FormData) {
  const email = formData.get('email') as string
  if (!email.includes('@')) return { error: '邮箱格式错误' }
  // 实际调用 Server Action 或 API
  await new Promise((r) => setTimeout(r, 500))
  return { success: true }
}

export function SubscribeForm() {
  // 第三个参数是初始 state
  const [state, formAction, isPending] = useActionState(subscribe, {})

  return (
    <form action={formAction}>
      <input name="email" type="email" placeholder="邮箱" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中…' : '订阅'}
      </button>
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state.success && <p style={{ color: 'green' }}>订阅成功！</p>}
    </form>
  )
}
\`\`\`

\`\`\`tsx filename="app/actions/subscribe.ts"
'use server'
import { revalidatePath } from 'next/cache'

export async function subscribeServer(formData: FormData) {
  const email = formData.get('email') as string
  await saveSubscriber(email)
  revalidatePath('/admin/subscribers')
}

async function saveSubscriber(email: string) {
  /* 写入数据库 */
}
\`\`\`

## useOptimistic：乐观更新

点赞、收藏这类操作，先在前端把状态"假装"更新，给用户即时反馈，待服务端确认后再修正：

\`\`\`tsx filename="app/components/LikeButton.tsx"
'use client'
import { useOptimistic, useTransition } from 'react'

type Like = { count: number; pending: boolean }

export function LikeButton({ initialCount }: { initialCount: number }) {
  const [optimistic, addOptimistic] = useOptimistic<Like, number>(
    { count: initialCount, pending: false },
    (state, delta) => ({ count: state.count + delta, pending: true })
  )
  const [isPending, startTransition] = useTransition()

  function like() {
    startTransition(async () => {
      // 立即在前端 +1，UI 瞬间响应
      addOptimistic(1)
      await fetch('/api/like', { method: 'POST' })
      // 服务端确认后，optimistic 会自动回退到真实 state
    })
  }

  return (
    <button onClick={like} disabled={optimistic.pending}>
      ❤️ {optimistic.count}
    </button>
  )
}
\`\`\`

## ref 作为 prop 传递（不再需要 forwardRef）

React 19 起，函数组件可直接接收 \`ref\` 作为普通 prop，\`forwardRef\` 不再必要：

\`\`\`tsx filename="app/components/FancyInput.tsx"
'use client'
// 直接把 ref 写进 props，无需 forwardRef 包裹
export function FancyInput({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="fancy">
      <input ref={ref} {...props} />
    </div>
  )
}

// 使用方
import { useRef } from 'react'
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <FancyInput ref={inputRef} placeholder="点我聚焦" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
    </>
  )
}
\`\`\`

> 旧的 \`forwardRef\` 仍可用，但新代码推荐直接传 ref。

## 文档元数据作为组件

React 19 允许在组件树任意位置渲染 \`<title>\`、\`<link>\`、\`<meta>\`，React 会自动 hoist 到 \`<head>\`。Next.js 16 的 App Router 原生支持：

\`\`\`tsx filename="app/products/[id]/page.tsx"
export default async function Page({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)
  return (
    <main>
      {/* 元数据像普通元素一样写在组件里，会被提升到 <head> */}
      <title>{product.name} - 我的商店</title>
      <meta name="description" content={product.description} />
      <link rel="canonical" href={\`https://example.com/products/\${params.id}\`} />
      <h1>{product.name}</h1>
    </main>
  )
}
\`\`\`

> 对于全局或动态性强的元数据，仍推荐用 \`generateMetadata\`；简单场景直接渲染标签更直观。

## 一处完整组合：流式产品页

把上面几个特性组合成一个真实页面——Suspense 流式加载、useActionState 表单、useOptimistic 点赞：

\`\`\`tsx filename="app/products/[id]/page.tsx"
import { Suspense } from 'react'
import { LikeButton } from '@/app/components/LikeButton'
import { SubscribeForm } from '@/app/components/SubscribeForm'

async function ProductDetail({ id }: { id: string }) {
  const product = await fetchProduct(id)
  return (
    <>
      <title>{product.name}</title>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <LikeButton initialCount={product.likes} />
    </>
  )
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main>
      <Suspense fallback={<p>加载商品中…</p>}>
        <ProductDetail id={params.id} />
      </Suspense>
      <hr />
      <SubscribeForm />
    </main>
  )
}

async function fetchProduct(id: string) {
  const res = await fetch(\`\${process.env.API_BASE}/products/\${id}\`, { cache: 'no-store' })
  return res.json()
}
\`\`\`

## 结语：Next.js 16 学习路线回顾

至此，本教程从入门到配置部署，已经走完 Next.js 16 的完整知识图谱。回顾五个批次的主线：

1. **基础与路由**：App Router 文件约定、布局嵌套、动态路由、加载与错误状态——理解"文件即路由"的心智模型。
2. **数据获取**：Server Components 取数、缓存与重验证（ISR）、流式渲染、Server Actions 写操作——把"组件即数据边界"内化为直觉。
3. **样式与交互**：CSS Modules、Tailwind、字体与图片优化、客户端组件与状态——让 UI 既能跑又好看。
4. **进阶能力**：中间件、缓存层、国际化、性能优化与监控——支撑真实业务规模。
5. **配置与部署**（本批次）：next.config、环境变量、自托管、测试调试、React 19.2 新特性——把工程闭环跑通。

Next.js 16 的几条主线破坏性变更务必牢记：**Turbopack 顶层配置**（\`experimental.turbo\` 已移除）、**React Compiler 转稳定**、**\`next lint\` 移除**改用 ESLint Flat Config、**\`serverRuntimeConfig\`/publicRuntimeConfig\` 移除**改用 \`process.env\` + \`connection()\`。它们都是升级时的"必考点"。

下一步建议：找一个真实需求（博客、后台、电商单品页）从零搭一遍，把每个特性在真实约束下用一次。文档读十遍，不如自己踩一坑。祝你在 Next.js 16 的路上越走越稳。`,
  },
];
