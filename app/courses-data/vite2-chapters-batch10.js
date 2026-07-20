// =============================================================
// Vite 大全集（终极版）—— 第10批章节
// 第十四部分 实战项目 + 结尾（共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   vite2-ch62 : 第六十二章 组件库开发实战
//   vite2-ch63 : 第六十三章 Admin 后台实战
//   vite2-ch64 : 第六十四章 PWA 应用实战
//   vite2-ch65 : 第六十五章 结语与进阶方向
// =============================================================

export const chapters = [
  // =========================================================
  // 第六十二章：组件库开发实战
  // =========================================================
  {
    id: "vite2-ch62",
    group: "第十四部分 实战项目",
    icon: "🧩",
    title: "第六十二章 组件库开发实战",
    content: `## 本章概述

把前面学到的 Library Mode、TypeScript、插件系统、构建优化等知识串起来，**从零做一个可发布的组件库**。学完这一章你能写出一个类似 Ant Design / Mantine 的小型 UI 库并发布到 npm。

### 组件库 vs 应用的区别

| 维度 | 应用 | 组件库 |
|------|------|--------|
| 构建模式 | 应用模式（build）| Library Mode（build.lib）|
| 产物 | HTML + JS + CSS | JS（ES/CJS/UMD）+ CSS + d.ts |
| 依赖处理 | 全部打进 bundle | react 等 external 掉 |
| 入口 | index.html | src/index.ts |
| 使用者 | 浏览器直接访问 | 别的项目 \`import\` 使用 |

---

## 1. 项目搭建

\`\`\`bash
npm create vite@latest my-ui-lib -- --template react-ts
cd my-ui-lib
npm i -D vite-plugin-dts @changesets/cli
\`\`\`

目录结构：

\`\`\`
my-ui-lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.css
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   └── ...
│   │   └── Modal/
│   │       └── ...
│   ├── theme/
│   │   └── tokens.css    # CSS 变量主题
│   └── index.ts          # 库入口（聚合导出）
├── vite.config.ts
├── tsconfig.json
└── package.json
\`\`\`

---

## 2. Library Mode 配置

\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyUILib',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => \`my-ui-lib.\${format}.js\`
    },
    rollupOptions: {
      // 第三方依赖 external 掉，由使用者提供
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: 'my-ui-lib.[ext]'
      }
    },
    cssCodeSplit: false
  }
})
\`\`\`

---

## 3. 基础组件设计

### Button 组件

\`\`\`tsx
// src/components/Button/Button.tsx
import { forwardRef } from 'react'
import './Button.css'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'default' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'medium', loading, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={\`my-btn my-btn--\${variant} my-btn--\${size}\`}
        disabled={loading || rest.disabled}
        {...rest}
      >
        {loading && <span className="my-btn__spinner" />}
        {children}
      </button>
    )
  }
)
\`\`\`

\`\`\`css
/* src/components/Button/Button.css */
.my-btn {
  border: 1px solid var(--my-border-color, #d9d9d9);
  background: var(--my-bg-color, #fff);
  color: var(--my-text-color, #333);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.my-btn--primary { background: var(--my-primary, #1677ff); color: #fff; border-color: transparent; }
.my-btn--danger  { background: var(--my-danger, #ff4d4f); color: #fff; border-color: transparent; }
.my-btn--small  { padding: 4px 12px; font-size: 12px; }
.my-btn--medium { padding: 6px 16px; font-size: 14px; }
.my-btn--large  { padding: 8px 24px; font-size: 16px; }
.my-btn__spinner { display: inline-block; width: 14px; height: 14px; margin-right: 6px;
  border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%;
  animation: my-spin 0.6s linear infinite; }
@keyframes my-spin { to { transform: rotate(360deg); } }
\`\`\`

### Input / Modal 组件

类似 Button，关键词：受控/非受控、forwardRef、CSS 变量、a11y。Modal 还要处理 Portal 挂载、ESC 关闭、点击遮罩关闭、滚动锁。

---

## 4. CSS 变量主题

\`\`\`css
/* src/theme/tokens.css */
:root {
  --my-primary: #1677ff;
  --my-danger: #ff4d4f;
  --my-success: #52c41a;
  --my-warning: #faad14;
  --my-text-color: #333;
  --my-border-color: #d9d9d9;
  --my-bg-color: #fff;
  --my-radius: 6px;
}
\`\`\`

使用者覆盖主题：

\`\`\`css
/* 使用者项目 */
:root {
  --my-primary: #722ed1;  /* 改成紫色主题 */
}
\`\`\`

**为什么用 CSS 变量**：编译时主题（Sass 变量）需要重新构建；CSS 变量运行时改，甚至能根据 \`data-theme\` 切换深色模式。

---

## 5. TypeScript 类型导出

入口文件聚合所有组件：

\`\`\`ts
// src/index.ts
export { Button } from './components/Button'
export type { ButtonProps } from './components/Button'
export { Input } from './components/Input'
export type { InputProps } from './components/Input'
export { Modal } from './components/Modal'
export type { ModalProps } from './components/Modal'
import './theme/tokens.css'
\`\`\`

\`vite-plugin-dts\` 会在 \`dist/\` 下生成对应的 \`.d.ts\`，使用者 IDE 里有完整类型提示。

---

## 6. Storybook 集成

\`\`\`bash
npx storybook@latest init
\`\`\`

Storybook 自动识别 Vite 项目，配置写入 \`.storybook/main.ts\`：

\`\`\`ts
import type { StorybookConfig } from '@storybook/react-vite'
const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials']
}
export default config
\`\`\`

写 stories：

\`\`\`tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'default', 'danger'] }
  }
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary', children: '提交' } }
export const Loading: Story = { args: { loading: true, children: '加载中' } }
\`\`\`

\`\`\`bash
npm run storybook   # 本地调试组件
npm run build-storybook  # 构建静态文档站
\`\`\`

---

## 7. npm 发布流程

### package.json 关键字段

\`\`\`json
{
  "name": "my-ui-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/my-ui-lib.cjs.js",
  "module": "./dist/my-ui-lib.es.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/my-ui-lib.es.js",
      "require": "./dist/my-ui-lib.cjs.js"
    },
    "./dist/my-ui-lib.css": "./dist/my-ui-lib.css"
  }
}
\`\`\`

**关键字段说明**：
- \`sideEffects\`：标记 CSS 是有副作用的，防止 tree-shaking 把样式干掉
- \`peerDependencies\`：避免使用者项目装两份 React
- \`exports\`：现代包的入口映射，比 \`main\`/\`module\` 更标准

### 发布步骤

\`\`\`bash
npm run build          # 构建产物到 dist/
npm publish --access public  # 首次发布（scoped 包默认 private）
\`\`\`

---

## 8. 版本管理：Changesets

\`\`\`bash
npx changeset init
\`\*\*

每次改完代码：

\`\`\`bash
npx changeset         # 交互：选要发布的包、类型（patch/minor/major）、写说明
npx changeset version # 根据 .changeset 记录更新版本号、生成 CHANGELOG.md
npx changeset publish # 构建 + 发布 + 打 git tag
\`\`\`

package.json 加脚本：

\`\`\`json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "npm run build && changeset publish"
  }
}
\`\`\`

| Changeset 类型 | 语义化版本 | 含义 |
|---------------|-----------|------|
| patch | 1.0.0 → 1.0.1 | bug 修复，向后兼容 |
| minor | 1.0.0 → 1.1.0 | 新功能，向后兼容 |
| major | 1.0.0 → 2.0.0 | 破坏性变更 |

---

## 9. 完整发布流程清单

1. 改代码 → \`npx changeset\` 记录变更
2. \`npm run build\` 本地验证构建产物
3. \`npm run storybook\` 验证组件演示
4. \`npx changeset version\` 升版本号 + 更新 CHANGELOG
5. 提交 PR，CI 跑测试
6. 合并后 \`npm run release\` 发布
7. GitHub Release 写 release notes

---

## 下一章

组件库是从「**输出代码**」的角度做实战。下一章换个角度，做**消费侧的实战**——用 Vite 搭一个 Admin 后台系统，串起路由、状态管理、UI 框架、权限、Mock、构建部署的完整链路。`,
    code: `// 演示：模拟组件库的构建产物结构和发布流程
console.log("🧩 组件库构建发布模拟");
console.log("=====================================");

// 1. 模拟 Library Mode 配置
const libConfig = {
  entry: "src/index.ts",
  formats: ["es", "cjs", "umd"],
  external: ["react", "react-dom"]
};
console.log("📦 Library Mode 配置:");
console.log("   入口:", libConfig.entry);
console.log("   输出格式:", libConfig.formats.join(", "));
console.log("   external:", libConfig.external.join(", "));

// 2. 模拟组件清单
const components = [
  { name: "Button", props: ["variant", "size", "loading"] },
  { name: "Input",  props: ["value", "onChange", "placeholder"] },
  { name: "Modal",  props: ["open", "onClose", "title"] }
];
console.log("\\n📚 组件清单:");
components.forEach(c => {
  console.log(\`   ├── \${c.name.padEnd(8)} props: \${c.props.join(", ")}\`);
});

// 3. 模拟构建产物
console.log("\\n📁 构建产物 dist/:");
const distFiles = [
  { name: "my-ui-lib.es.js",    desc: "ES 模块（给现代打包器）" },
  { name: "my-ui-lib.cjs.js",   desc: "CommonJS（给 Node/ssr）" },
  { name: "my-ui-lib.umd.js",   desc: "UMD（给 <script> 标签）" },
  { name: "my-ui-lib.css",      desc: "样式文件" },
  { name: "index.d.ts",         desc: "TypeScript 类型声明" }
];
distFiles.forEach(f => {
  console.log(\`   ├── \${f.name.padEnd(22)} ← \${f.desc}\`);
});

// 4. 模拟 Changesets 版本管理
console.log("\\n🔄 Changesets 版本流程:");
const changeset = { type: "minor", summary: "feat: 新增 Modal 组件" };
const currentVersion = "1.2.0";
const [maj, min] = currentVersion.split(".").map(Number);
const newVersion = changeset.type === "patch" ? \`\${maj}.\${min}.\${Number(currentVersion.split(".")[2]) + 1}\`
  : changeset.type === "minor" ? \`\${maj}.\${min + 1}.0\`
  : \`\${maj + 1}.0.0\`;
console.log(\`   当前版本: \${currentVersion}\`);
console.log(\`   变更类型: \${changeset.type} → \${changeset.summary}\`);
console.log(\`   新版本号: \${newVersion}\`);

console.log("\\n💡 使用者：import { Button } from 'my-ui-lib';");
console.log("💡 CSS 主题覆盖：:root { --my-primary: #722ed1; }");`,
  },

  // =========================================================
  // 第六十三章：Admin 后台实战
  // =========================================================
  {
    id: "vite2-ch63",
    group: "第十四部分 实战项目",
    icon: "📊",
    title: "第六十三章 Admin 后台实战",
    content: `## 本章概述

后台管理系统是前端最常见的产品形态。这一章用 Vite + React + TypeScript 搭一个完整的 Admin 后台，覆盖**路由 / 状态 / UI / 权限 / Mock / 构建**全链路，看完能直接照搬套用。

### 技术选型

| 层级 | 选型 | 理由 |
|------|------|------|
| 构建 | Vite | 启动快、HMR 灵敏 |
| 框架 | React 18 + TS | 团队熟悉、生态成熟 |
| 路由 | react-router v6 | 标准、嵌套路由支持好 |
| 状态 | zustand | 轻量，不用 boilerplate |
| UI | Ant Design 5 | 组件全、文档完善 |
| 请求 | axios + react-query | 缓存、重试、loading 一站搞定 |
| Mock | vite-plugin-mock | 开发期 mock，零成本切换 |

---

## 1. 项目搭建

\`\`\`bash
npm create vite@latest admin-app -- --template react-ts
cd admin-app
npm i antd @ant-design/icons react-router-dom zustand axios @tanstack/react-query
npm i -D vite-plugin-mock @types/mockjs mockjs
\`\`\`

---

## 2. 路由配置

\`\`\`tsx
// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'

const Login = lazy(() => import('@/pages/Login'))
const Layout = lazy(() => import('@/layouts/BasicLayout'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const UserList = lazy(() => import('@/pages/user/List'))

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'user/list', element: <UserList /> }
    ]
  }
])
\`\`\`

入口：

\`\`\`tsx
// src/main.tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={zhCN}>
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ConfigProvider>
)
\`\`\`

---

## 3. 状态管理（zustand）

\`\`\`ts
// src/store/user.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  token: string | null
  userInfo: { name: string; roles: string[] } | null
  setToken: (t: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      setToken: (t) => set({ token: t }),
      logout: () => set({ token: null, userInfo: null })
    }),
    { name: 'admin-user' } // localStorage key
  )
)
\`\`\`

**为什么选 zustand**：API 极简，没有 reducer/action/types 那一套；TS 友好；中大型项目也撑得住。Redux Toolkit 也可以，重项目+团队熟就选它。

---

## 4. UI 框架集成（Ant Design）

\`\`\`tsx
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePluginForAntd } from 'vite-plugin-antd'

export default defineConfig({
  plugins: [react(), vitePluginForAntd({ disableTypescript: false })],
  resolve: { alias: { '@': resolve(__dirname, 'src') } }
})
\`\`\`

主题色切换（ConfigProvider）：

\`\`\`tsx
<ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
  <App />
</ConfigProvider>
\`\`\`

---

## 5. 权限管理

### 路由守卫

\`\`\`tsx
// src/layouts/BasicLayout.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/user'

export default function BasicLayout() {
  const { pathname } = useLocation()
  const token = useUserStore((s) => s.token)
  if (!token) return <Navigate to="/login" state={{ from: pathname }} replace />
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider><Menu /></Sider>
      <Layout>
        <Header />
        <Content><Outlet /></Content>
      </Layout>
    </Layout>
  )
}
\`\`\`

### 按钮级权限

\`\`\`tsx
// src/components/Auth.tsx
export function Auth({ perm, children }: { perm: string; children: React.ReactNode }) {
  const roles = useUserStore((s) => s.userInfo?.roles || [])
  if (!roles.includes(perm)) return null
  return <>{children}</>
}

// 使用：
<Auth perm="user:delete"><Button danger>删除</Button></Auth>
\`\`\`

---

## 6. 表格 / 表单封装

### 表格封装（带分页 + 查询）

\`\`\`tsx
// src/components/ProTable.tsx
import { Table, Form, Input, Button } from 'antd'

export function ProTable({ columns, query, fetch }) {
  const { data, isLoading } = useQuery({
    queryKey: ['table', query],
    queryFn: () => fetch(query)
  })
  return (
    <>
      <Form layout="inline" onValuesChange={(v) => query.set(v)}>
        <Form.Item name="keyword"><Input placeholder="搜索" /></Form.Item>
      </Form>
      <Table columns={columns} dataSource={data?.list} loading={isLoading}
        pagination={{ total: data?.total, current: query.page }} />
    </>
  )
}
\`\`\`

### 表单封装

用 Antd 的 \`Form\` + \`Form.Item\`，再封一层 schema 驱动：

\`\`\`tsx
const schema = [
  { name: 'username', label: '用户名', rules: [{ required: true }] },
  { name: 'email', label: '邮箱', type: 'email' }
]
\`\`\`

---

## 7. Mock 数据

\`\`\`ts
// mock/user.ts
export default [
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }) => {
      const list = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1, name: \`用户\${i}\`, email: \`u\${i}@x.com\`
      }))
      return { code: 0, data: { list, total: 100 } }
    }
  }
]
\`\`\`

\`\`\`ts
// vite.config.ts
import { viteMockServe } from 'vite-plugin-mock'
export default defineConfig({
  plugins: [react(), viteMockServe({ mockPath: 'mock', enable: true })]
})
\`\`\`

**优势**：开发期用 mock 不依赖后端；上线时把 \`enable\` 关掉即可，零代码改动。

---

## 8. 环境变量

\`\`\`bash
# .env.development
VITE_API_BASE=/api
VITE_USE_MOCK=true

# .env.production
VITE_API_BASE=https://api.example.com
VITE_USE_MOCK=false
\`\`\`

代码里读：

\`\`\`ts
const baseURL = import.meta.env.VITE_API_BASE
const useMock = import.meta.env.VITE_USE_MOCK === 'true'
\`\`\`

axios 实例：

\`\`\`ts
// src/api/request.ts
import axios from 'axios'
import { useUserStore } from '@/store/user'

export const request = axios.create({ baseURL: import.meta.env.VITE_API_BASE, timeout: 10000 })

request.interceptors.request.use((config) => {
  const token = useUserStore.getState().token
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) useUserStore.getState().logout()
    return Promise.reject(err)
  }
)
\`\`\`

---

## 9. 构建部署

\`\`\`ts
// vite.config.ts 构建优化
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom', 'react-router-dom'],
        antd: ['antd', '@ant-design/icons']
      }
    }
  },
  chunkSizeWarningLimit: 1500
}
\`\`\`

\`\`\`bash
npm run build      # 输出 dist/
npm run preview    # 本地预览
\`\`\`

部署时把 \`dist/\` 丢到 Nginx / Vercel / Docker，详见第五十九到六十一章。

---

## 10. 常见问题速查

| 问题 | 原因 | 解决 |
|------|------|------|
| 路由刷新 404 | 服务器没配 SPA fallback | Nginx 加 \`try_files $uri /index.html\` |
| antd 体积大 | 全量引入 | 用 \`babel-plugin-import\` 按需 |
| 懒加载首屏白屏 | 没用 Suspense | 加 \`<Suspense fallback={<Spin />}\` |
| mock 上线残留 | enable 没关 | 用环境变量控制 |

---

## 下一章

后台是「**桌面网页**」的实战。下一章换一个新场景——**PWA 应用实战**，让你的 Vite 应用变成可安装、可离线、可推送通知的「伪原生」App。`,
    code: `// 演示：模拟 Admin 后台的路由 + 状态 + 权限流程
console.log("📊 Admin 后台核心流程模拟");
console.log("=====================================");

// 1. 模拟路由表
const routes = [
  { path: "/login",      element: "Login",       auth: false },
  { path: "/",           element: "BasicLayout", auth: true,  children: [
    { path: "/dashboard",  element: "Dashboard",  auth: true },
    { path: "/user/list",   element: "UserList",   auth: true, perm: "user:view" },
    { path: "/user/edit",   element: "UserEdit",   auth: true, perm: "user:edit" }
  ]}
];
console.log("🛣️ 路由表:");
routes.forEach(r => {
  console.log(\`   \${r.path.padEnd(15)} → \${r.element}\${r.auth ? " [需登录]" : ""}\`);
  (r.children || []).forEach(c => {
    console.log(\`      └── \${c.path.padEnd(12)} → \${c.element}\${c.perm ? " [需 " + c.perm + "]" : ""}\`);
  });
});

// 2. 模拟 zustand 用户 store
const userStore = {
  state: { token: null, roles: [] },
  setToken(t) { this.state.token = t; },
  setRoles(r) { this.state.roles = r; },
  logout() { this.state.token = null; this.state.roles = []; }
};

// 3. 模拟路由守卫
function guard(targetPath) {
  console.log("\\n🔍 路由守卫拦截:", targetPath);
  if (!userStore.state.token) {
    console.log("   ❌ 未登录 → 跳转 /login");
    return false;
  }
  // 找到目标路由的 perm
  const allRoutes = routes.flatMap(r => [r, ...(r.children || [])]);
  const target = allRoutes.find(r => r.path === targetPath);
  if (target?.perm && !userStore.state.roles.includes(target.perm)) {
    console.log(\`   ❌ 无权限 (\${target.perm}) → 跳转 403\`);
    return false;
  }
  console.log("   ✅ 通过");
  return true;
}

// 4. 模拟完整登录流程
console.log("\\n=== 场景 1：未登录访问 /user/list ===");
guard("/user/list");

console.log("\\n=== 场景 2：登录后访问 ===");
userStore.setToken("fake-token-abc");
userStore.setRoles(["user:view"]);
guard("/dashboard");
guard("/user/list");
guard("/user/edit");  // 没 user:edit 权限

console.log("\\n=== 场景 3：登出 ===");
userStore.logout();
guard("/dashboard");

console.log("\\n💡 zustand + react-router + 自定义 Auth 组件 = 完整权限体系");`,
  },

  // =========================================================
  // 第六十四章：PWA 应用实战
  // =========================================================
  {
    id: "vite2-ch64",
    group: "第十四部分 实战项目",
    icon: "📱",
    title: "第六十四章 PWA 应用实战",
    content: `## 本章概述

**PWA（Progressive Web App）** 是用 Web 技术做出的「接近原生体验」的应用——可安装到桌面、可离线使用、能收推送通知。Vite 通过 \`vite-plugin-pwa\` 让你**几乎零成本**把普通 Web 应用升级为 PWA。

### PWA 三大特性

| 特性 | 原理 | 体验 |
|------|------|------|
| 可安装 | manifest.json + Service Worker | 桌面图标，独立窗口打开 |
| 可离线 | Service Worker 缓存 | 断网也能访问已缓存页面 |
| 可推送 | Push API + Notification API | 服务器推送消息到通知中心 |

---

## 1. 安装 vite-plugin-pwa

\`\`\`bash
npm i -D vite-plugin-pwa
\`\`\`

最简配置：

\`\`\`ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: '我的 PWA 应用',
        short_name: '我的PWA',
        description: '一个用 Vite 做的 PWA 示例',
        theme_color: '#1677ff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
\`\`\`

构建后 Vite 自动注入：

\`\`\`html
<!-- index.html 中自动追加 -->
<link rel="manifest" href="/manifest.webmanifest">
<script type="module">
  import { registerSW } from 'virtual:pwa-register'
  registerSW({ onNeedRefresh: () => {/* 提示用户刷新 */} })
</script>
\`\`\`

---

## 2. Service Worker 注册

### 自动注册（推荐）

\`registerType: 'autoUpdate'\` 时插件自动注册 SW，新版本会自动激活。

### 手动注册（提示用户刷新）

\`\`\`ts
// src/main.ts
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // 新版本可用，弹个 toast 让用户点击刷新
    if (confirm('发现新版本，是否刷新？')) updateSW()
  },
  onOfflineReady() {
    console.log('应用已可离线使用')
  }
})
\`\`\`

| registerType | 行为 | 适用场景 |
|--------------|------|---------|
| \`autoUpdate\` | 自动刷新 | 内容更新频繁，用户无感知 |
| \`prompt\` | 提示用户 | 重大变更，要用户确认 |

---

## 3. manifest.json 字段速查

| 字段 | 作用 | 示例 |
|------|------|------|
| \`name\` | 完整名称 | 我的 PWA 应用 |
| \`short_name\` | 桌面图标下显示 | 我的PWA |
| \`theme_color\` | 状态栏颜色 | #1677ff |
| \`background_color\` | 启动屏背景 | #ffffff |
| \`display\` | 显示模式 | standalone |
| \`start_url\` | 启动 URL | / |
| \`icons\` | 图标集合 | 192/512/maskable |
| \`orientation\` | 屏幕方向 | portrait |

### display 模式

\`\`\`
fullscreen    完全隐藏浏览器 UI（沉浸式）
standalone    独立窗口，看起来像原生 App（最常用）
minimal-ui    有少量浏览器控件
browser       普通浏览器标签页
\`\`\`

---

## 4. 缓存策略

### Precaching（预缓存）

构建产物（JS/CSS/HTML/图标）会被预缓存，用户离线时仍能打开应用：

\`\`\`ts
VitePWA({
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,  // 3MB 以下才缓存
    runtimeCaching: [/* 见下文 */]
  }
})
\`\`\`

### Runtime Caching（运行时缓存）

对接口、图片等动态资源，按策略缓存：

\`\`\`ts
VitePWA({
  workbox: {
    runtimeCaching: [
      {
        // 接口：NetworkFirst，先尝试网络，失败用缓存
        urlPattern: /^https:\\/\\/api\\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 }
        }
      },
      {
        // 图片：CacheFirst，优先用缓存
        urlPattern: /\\.(?:png|jpg|jpeg|webp|svg)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }
        }
      },
      {
        // 字体：StaleWhileRevalidate，先用旧的，后台更新
        urlPattern: /\\.(?:woff2?|ttf)$/,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'font-cache' }
      }
    ]
  }
})
\`\`\`

### 策略对照表

| 策略 | 含义 | 适用场景 |
|------|------|---------|
| \`NetworkFirst\` | 优先网络，失败回退缓存 | 接口数据（要求新） |
| \`CacheFirst\` | 优先缓存，永不更新 | 不变的图片/字体 |
| \`StaleWhileRevalidate\` | 立即返回缓存，后台更新 | 字体、非关键资源 |
| \`NetworkOnly\` | 只用网络 | 实时数据 |
| \`CacheOnly\` | 只用缓存 | 离线包 |

---

## 5. 离线支持

PWA 离线分两种：

### 5.1 应用壳离线（默认就有）

预缓存的 HTML/JS/CSS 让应用「**白屏也能打开**」。

### 5.2 离线 fallback 页

\`\`\`ts
VitePWA({
  workbox: {
    navigateFallback: '/offline.html',  // 离线时跳转此页
    navigateFallbackDenylist: [/^\\/api\\//]  // 接口不 fallback
  }
})
\`\`\`

写一个 \`public/offline.html\`：

\`\`\`html
<!DOCTYPE html>
<html><body>
  <h1>😵 你现在离线了</h1>
  <p>请检查网络后重试。</p>
</body></html>
\`\`\`

---

## 6. 推送通知

### 6.1 申请权限 + 订阅

\`\`\`ts
// src/notification.ts
async function subscribePush() {
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  })
  // 把 sub 发给后端保存
  await fetch('/api/push/subscribe', {
    method: 'POST', body: JSON.stringify(sub),
    headers: { 'Content-Type': 'application/json' }
  })
}
\`\`\`

### 6.2 本地通知

\`\`\`ts
function showLocalNotification(title: string, body: string) {
  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, {
      body, icon: '/pwa-192x192.png', badge: '/badge.png',
      tag: 'default'
    })
  })
}
\`\`\`

### 6.3 服务端推送（Web Push）

服务端用 \`web-push\` 库，调 \`pushManager\` 给用户发推送。完整流程较复杂，需 VAPID 密钥对，详见 \`web-push\` 文档。

---

## 7. 安装到桌面

### 桌面 Chrome / Edge

地址栏右侧出现「安装」图标，点击即装到桌面。

### iOS Safari

\`\`\`
分享按钮 → 添加到主屏幕
\`\`\`

代码里监听 \`beforeinstallprompt\` 自定义按钮：

\`\`\`ts
let deferredPrompt: any
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  // 显示自己的「安装 App」按钮
})

document.getElementById('install-btn')!.addEventListener('click', async () => {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  console.log('用户', outcome === 'accepted' ? '已安装' : '取消')
  deferredPrompt = null
})
\`\`\`

---

## 8. iOS 兼容性坑

iOS 的 PWA 支持比 Android 差很多，常见坑：

| 问题 | 原因 | 解决 |
|------|------|------|
| 加到主屏后无图 | iOS 不读 manifest icons | HTML 加 \`<link rel="apple-touch-icon" href="/ios-180.png">\` |
| 状态栏颜色不对 | iOS 不读 theme_color | \`<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\` |
| 推送通知 | iOS 16.4+ 才支持，且必须先安装 | 检测 \`'PushManager' in window\` |
| 缓存策略 | iOS Safari 偶尔不更新 | 配合版本号 query string |
| 启动屏闪 | iOS 不支持 splash_screen | 用 \`apple-touch-startup-image\` |

\`\`\`html
<!-- index.html 必加的 iOS meta -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="我的PWA">
<link rel="apple-touch-icon" href="/ios-180.png">
\`\`\`

---

## 9. PWA 检测工具

### 9.1 Chrome DevTools

\`F12 → Application → Manifest / Service Workers / Cache Storage\`：能看到注册状态、缓存列表、推送订阅。

### 9.2 Lighthouse

\`F12 → Lighthouse → 跑 PWA 审计\`，会给出 PWA 合规度评分和改进建议。

### 9.3 PWA Builder

[https://www.pwabuilder.com/](https://www.pwabuilder.com/) ：上传 URL，生成可打包成原生 App（Android APK / Windows MSIX）的方案。

### 合规清单（满足才能装桌面）

- ✅ HTTPS（localhost 例外）
- ✅ 注册了 Service Worker
- ✅ 有 manifest.json 且含 name + icons（192/512）
- ✅ \`display\` 是 standalone / fullscreen / minimal-ui
- ✅ 有 \`start_url\`

---

## 下一章

到此你已完成三大实战：组件库（**输出**）、Admin 后台（**桌面消费**）、PWA（**移动/桌面兼顾**）。
最后一章是结语，回顾全书 65 章学到了什么，以及继续深入 Vite 的方向和资源。`,
    code: `// 演示：模拟 PWA 的 Service Worker 缓存策略
console.log("📱 PWA Service Worker 缓存策略模拟");
console.log("=====================================");

// 模拟三个缓存
const caches = {
  "precache": [],
  "api-cache": [],
  "image-cache": []
};

// 模拟 SW 的 fetch 拦截
function swFetch(url, strategy) {
  console.log(\`\\n📥 SW 拦截请求: \${url}\`);
  console.log(\`   策略: \${strategy}\`);

  const cacheName = url.match(/\\.(png|jpg|svg)$/) ? "image-cache"
    : url.startsWith("https://api.") ? "api-cache"
    : "precache";

  const cached = caches[cacheName].find(c => c.url === url);

  switch (strategy) {
    case "CacheFirst":
      if (cached) {
        console.log("   ✅ 命中缓存，直接返回");
        return cached.content;
      }
      console.log("   🌐 缓存未命中，请求网络并存入缓存");
      caches[cacheName].push({ url, content: "<网络内容>", ts: Date.now() });
      return "<网络内容>";

    case "NetworkFirst":
      console.log("   🌐 优先请求网络...");
      if (Math.random() > 0.7) {
        console.log("   ❌ 网络失败，回退缓存");
        return cached?.content || "<离线空响应>";
      }
      console.log("   ✅ 网络成功，更新缓存");
      if (cached) { cached.ts = Date.now(); cached.content = "<新内容>"; }
      return "<新内容>";

    case "StaleWhileRevalidate":
      if (cached) {
        console.log("   ✅ 立即返回旧缓存，后台更新");
        return cached.content;
      }
      console.log("   🌐 缓存未命中，请求网络");
      return "<网络内容>";
  }
}

// 演示三种策略
console.log("=== 1. CacheFirst（图片）===");
swFetch("https://cdn.example.com/logo.png", "CacheFirst");
swFetch("https://cdn.example.com/logo.png", "CacheFirst");  // 第二次命中缓存

console.log("\\n=== 2. NetworkFirst（接口）===");
swFetch("https://api.example.com/users", "NetworkFirst");

console.log("\\n=== 3. StaleWhileRevalidate（字体）===");
swFetch("https://cdn.example.com/font.woff2", "StaleWhileRevalidate");

// 模拟离线场景
console.log("\\n=== 4. 离线场景模拟 ===");
console.log("🔴 网络已断开");
const offlineResult = swFetch("https://api.example.com/users", "NetworkFirst");
console.log(\`   返回: \${offlineResult}\`);

console.log("\\n=====================================");
console.log("📁 当前缓存状态:");
Object.entries(caches).forEach(([name, items]) => {
  console.log(\`   \${name}: \${items.length} 条\`);
  items.forEach(item => console.log(\`      ├── \${item.url}\`));
});

console.log("\\n💡 vite-plugin-pwa + workbox = 零成本 PWA");`,
  },

  // =========================================================
  // 第六十五章：结语与进阶方向
  // =========================================================
  {
    id: "vite2-ch65",
    group: "结尾",
    icon: "🎓",
    title: "第六十五章 结语与进阶方向",
    content: `## 全书回顾

恭喜你读完了 65 章！这一章是总结和展望，帮你把整本书串起来，并规划下一步的学习方向。

### 65 章学了什么

| 部分 | 章节 | 核心知识点 |
|------|------|-----------|
| 第一部分 入门基础 | 1-7 | 创建项目、dev/build/preview、配置文件、原生 ESM |
| 第二部分 核心概念 | 8-13 | 依赖预构建、HMR、CSS、JSON、Glob 导入 |
| 第三部分 配置详解 | 14-19 | resolve/server/build/css 全套配置 |
| 第四部分 静态资源 | 20-23 | 图片、字体、public、资源内联 |
| 第五部分 环境与变量 | 24-26 | .env、import.meta.env、模式切换 |
| 第六部分 服务器配置 | 27-31 | proxy、CORS、HTTPS、HMR、middleware |
| 第七部分 构建优化 | 32-37 | 分包、tree-shaking、压缩、sourcemap、chunk |
| 第八部分 插件系统 | 38-43 | 插件钩子、写一个插件、虚拟模块 |
| 第九部分 框架集成 | 44-47 | React/Vue/Svelte/Lit 集成 |
| 第十部分 工程化 | 48-52 | ESLint、Prettier、TS、测试、CI/CD |
| 第十一部分 SSR/SSG | 53-54 | SSR 原理、SSG 静态生成 |
| 第十二部分 高级特性 | 55-58 | Library Mode、Environment API、WASM、MPA |
| 第十三部分 部署 | 59-61 | Nginx、Vercel/Netlify、Docker |
| 第十四部分 实战项目 | 62-64 | 组件库、Admin、PWA |

### 三句话总结全书

1. **Vite 快的根基**是浏览器原生 ESM + esbuild 预构建，dev 不打包，按需编译
2. **Vite 强的根基**是 Rollup 生态 + 灵活的插件系统，build 阶段做所有优化
3. **Vite 的未来**是 Environment API 让它从「前端构建工具」升级为「全栈构建框架」

---

## Vite 生态

Vite 不只是一个工具，它是一**整个生态的基石**。下面这些主流框架都基于 Vite 构建：

| 框架 | 定位 | 基于 Vite 做了什么 |
|------|------|-------------------|
| **Nuxt 3** | Vue 全栈框架 | SSR、文件路由、自动导入 |
| **SvelteKit** | Svelte 全栈框架 | SSR、文件路由、适配器 |
| **Astro** | 内容站点（博客/文档）| Island 架构、多框架共存 |
| **Remix** | React 全栈框架 | Vite 2.7+ 起官方支持 |
| **Solid Start** | Solid 全栈框架 | SSR、文件路由 |
| **Qwik City** | Qwik 全栈框架 | Resumability + SSR |
| **VitePress** | 文档站点 | Markdown 驱动 |
| **Nuxt Content / Vite + vite-ssg** | SSG | 静态生成 |

学会 Vite，你就有了**学习这一整套框架的基础**——它们的配置、插件、构建优化都建立在 Vite 之上。

---

## 进阶方向

### 方向 1：插件开发

深入读 \`vite\` 源码的 \`packages/vite/src/node/plugin.ts\`，理解每个钩子的执行时机。然后尝试：

- 写一个自动生成路由的插件（参考 \`vite-plugin-pages\`）
- 写一个虚拟模块插件（参考 \`vite-plugin-virtual\`）
- 写一个 SVG 转 React 组件插件（参考 \`vite-plugin-svgr\`）

### 方向 2：构建优化

- 分析产物：\`vite-bundle-visualizer\` / \`rollup-plugin-visualizer\`
- 调分包策略：\`manualChunks\` 精细化
- 用 \`vite-plugin-imagemin\` 压缩图片
- 探索 \`vite-plugin-chunk-split\` 自动分包
- 学习 Rspack / Turbopack，对比不同打包器的取舍

### 方向 3：SSR / Edge

- 用 Vite + Express 自手写一个 SSR
- 学习 Nuxt 3 / SvelteKit 的 SSR 实现
- 部署到 Cloudflare Workers / Vercel Edge
- 研究 Environment API + RSC（React 19）

### 方向 4：跨端

- Capacitor + Vite 做移动 App
- Tauri + Vite 做桌面 App
- Electron + Vite（\`electron-vite\`）

### 方向 5：性能监控

- 接入 \`web-vitals\` 监控 LCP/CLS/INP
- 用 Sentry / 自建上报错误
- Lighthouse CI 自动跑性能回归

---

## 学习资源

### 官方

| 资源 | 链接 |
|------|------|
| Vite 官方文档 | https://vitejs.dev/ |
| Vite 中文文档 | https://cn.vitejs.dev/ |
| Vite GitHub | https://github.com/vitejs/vite |
| Vite Releases | https://github.com/vitejs/vite/releases |
| Vite 团队博客 | https://vitejs.dev/blog/ |

### 源码阅读顺序

1. \`packages/vite/src/node/index.ts\` —— 入口
2. \`packages/vite/src/node/server/index.ts\` —— dev server
3. \`packages/vite/src/node/server/pluginContainer.ts\` —— 插件容器
4. \`packages/vite/src/node/server/transformRequest.ts\` —— 按需编译
5. \`packages/vite/src/node/build.ts\` —— build 流程
6. \`packages/vite/src/node/plugins/\` —— 内置插件

### 社区

- Discord：Vite 官方频道（活跃，作者也在）
- GitHub Discussions：提问题、看设计讨论
- awesome-vite：插件/模板精选列表
- VueConf / React Conf 上 Vite 相关演讲

---

## 常见问题（FAQ）

**Q1：Vite 生产构建比 Webpack 慢吗？**
A：基本相当。两者都基于打包器（Rollup vs webpack 自家），差异在 5% 以内。Vite dev 阶段碾压 Webpack。

**Q2：什么时候不该用 Vite？**
A：① 严重依赖 Webpack 特有 loader（少见）；② 老项目迁移成本太高；③ 团队对 Webpack 极度熟悉、Vite 没收益。除此之外都推荐 Vite。

**Q3：Vite 6 的 Environment API 我必须用吗？**
A：不需要。普通项目 Vite 6 完全向后兼容。只有写多环境插件、做 RSC 等高级场景才需要直接接触。

**Q4：Vite 适合大型企业项目吗？**
A：适合。阿里、字节、Google 等公司都有大规模 Vite 项目在跑。注意配置好分包、缓存、CI。

**Q5：什么时候用 Rollup / esbuild / SWC 直接替代 Vite？**
A：Vite 已经把它们组合好了，没必要直接用。除非你写底层工具链，否则用 Vite 即可。

---

## 致谢

感谢你一路读到这里。

Vite 的诞生离不开 Evan You（尤雨溪）和所有贡献者的开源贡献，也离不开 Vue / React / Svelte 等社区的支持。写这本书的过程也是一遍重新学习的过程——Vite 的设计哲学（**简单、可组合、按需**）值得每个工程师品味。

如果这本书对你有帮助，欢迎分享给身边的开发者。如果有错误或建议，欢迎在仓库提 issue。

\`\`\`
"在 simplicity 和 power 之间找到平衡，是工程的艺术。"
                                          —— Evan You
\`\`\`

祝你写代码愉快，构建飞快。🚀`,
    code: `// 演示：回顾全书 65 章的核心知识点
console.log("🎓 Vite 大全集（终极版）回顾");
console.log("=====================================");

const bookSummary = [
  { part: "第一部分 入门基础",      chapters: "1-7",   key: "创建项目 / dev/build/preview / 原生 ESM" },
  { part: "第二部分 核心概念",      chapters: "8-13",  key: "预构建 / HMR / CSS / JSON / Glob" },
  { part: "第三部分 配置详解",      chapters: "14-19", key: "resolve / server / build / css" },
  { part: "第四部分 静态资源",      chapters: "20-23", key: "图片 / 字体 / public / 内联" },
  { part: "第五部分 环境与变量",    chapters: "24-26", key: ".env / import.meta.env / 模式" },
  { part: "第六部分 服务器配置",    chapters: "27-31", key: "proxy / CORS / HTTPS / middleware" },
  { part: "第七部分 构建优化",      chapters: "32-37", key: "分包 / tree-shaking / 压缩 / sourcemap" },
  { part: "第八部分 插件系统",      chapters: "38-43", key: "钩子 / 写插件 / 虚拟模块" },
  { part: "第九部分 框架集成",      chapters: "44-47", key: "React / Vue / Svelte / Lit" },
  { part: "第十部分 工程化",        chapters: "48-52", key: "ESLint / Prettier / TS / 测试 / CI" },
  { part: "第十一部分 SSR/SSG",     chapters: "53-54", key: "SSR 原理 / 静态生成" },
  { part: "第十二部分 高级特性",    chapters: "55-58", key: "Library Mode / Environment API / WASM / MPA" },
  { part: "第十三部分 部署",        chapters: "59-61", key: "Nginx / Vercel / Docker" },
  { part: "第十四部分 实战项目",    chapters: "62-64", key: "组件库 / Admin / PWA" },
  { part: "结尾",                  chapters: "65",    key: "回顾与进阶方向" }
];

console.log("📚 65 章覆盖的核心知识：\\n");
bookSummary.forEach((s, i) => {
  console.log(\`\${String(i + 1).padStart(2)}. \${s.part.padEnd(20)} 第\${s.chapters.padEnd(5)}章  \${s.key}\`);
});

console.log("\\n🎯 三句话总结全书：");
console.log("1. dev 快的根基：浏览器原生 ESM + esbuild 预构建");
console.log("2. build 强的根基：Rollup + 灵活的插件系统");
console.log("3. 未来方向：Environment API 升级为全栈构建框架");

console.log("\\n🚀 进阶方向：");
const directions = [
  "插件开发（写一个自动路由 / 虚拟模块插件）",
  "构建优化（bundle 分析 / 分包 / 压缩）",
  "SSR / Edge（Nuxt / SvelteKit / Cloudflare）",
  "跨端（Capacitor / Tauri / electron-vite）",
  "性能监控（web-vitals / Lighthouse CI）"
];
directions.forEach(d => console.log("   • " + d));

console.log("\\n📖 推荐资源：");
console.log("   • 官方文档：https://vitejs.dev/");
console.log("   • 源码：https://github.com/vitejs/vite");
console.log("   • 中文文档：https://cn.vitejs.dev/");

console.log("\\n🎓 恭喜你读完了 Vite 大全集！");
console.log("   祝你写代码愉快，构建飞快。🚀");`,
  },
];
