// =============================================================
// TypeScript + React 教程 —— 第十四批章节（路由与状态管理，共 5 章）
// -------------------------------------------------------------
// 覆盖：React Router 基础 / 进阶 / 全局状态思想 / Zustand / Redux Toolkit
// 沙箱支持 react 18、react-dom 18；其他库（react-router、zustand、redux）通过"概念演示 + 手写实现"方式呈现。
// 章节 ID：tsx2-ch66 ~ tsx2-ch70
// 分组：第十四部分 路由与状态管理
// =============================================================

const chapters = [
  // =========================================================
  // 第六十六章 React Router 基础
  // =========================================================
  {
    id: "tsx2-ch66",
    group: "第十四部分 路由与状态管理",
    icon: "🛣️",
    title: "第六十六章 React Router 基础",
    content: `# 第六十六章 React Router 基础

单页应用（SPA）靠前端路由在 URL 变化时不刷新整页、只切换组件视图。React Router 是 React 生态的路由事实标准。本章从零实现一个迷你路由，帮你看清核心抽象。

---

## 一、什么是前端路由

传统多页应用：每次跳转都向服务器请求新 HTML。SPA：用 \`history.pushState\` 或 \`hashchange\` 改 URL，前端根据 URL 决定渲染哪个组件。

\`\`\`tsx
// 最小 SPA 路由原理
window.addEventListener("popstate", () => {
  console.log("URL 变了：", location.pathname);
  render(location.pathname);
});

function navigate(to: string) {
  history.pushState({}, "", to);   // 改 URL 不刷新
  render(to);
}
\`\`\`

---

## 二、迷你 React Router

\`\`\`tsx
import { useState, useEffect, useContext, createContext, ReactNode } from "react";

// ========== 路由上下文 ==========
type RouterCtx = {
  pathname: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
  search: URLSearchParams;
};
const RouterContext = createContext<RouterCtx | null>(null);

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter 必须在 <Router> 内使用");
  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}
export function useParams<K extends string = string>(): Record<K, string> {
  return useRouter().params as Record<K, string>;
}
export function useSearchParams(): [URLSearchParams, (next: Record<string, string>) => void] {
  const { search, navigate, pathname } = useRouter();
  const setSearch = (next: Record<string, string>) => {
    const sp = new URLSearchParams(next).toString();
    navigate(\`\${pathname}?\${sp}\`);
  };
  return [search, setSearch];
}

// ========== 路由表匹配 ==========
type Route = { path: string; element: ReactNode; children?: Route[] };

function matchRoute(routes: Route[], pathname: string): { route: Route; params: Record<string, string> } | null {
  for (const r of routes) {
    // 简化：只支持 :param 和 静态段
    const keys: string[] = [];
    const regex = new RegExp("^" + r.path.replace(/:([\\w]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$");
    const m = pathname.match(regex);
    if (m) {
      const params: Record<string, string> = {};
      keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route: r, params };
    }
  }
  return null;
}

// ========== Router 根组件 ==========
export function Router({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [search, setSearchState] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    // 监听浏览器前进后退
    const onPop = () => {
      setPathname(window.location.pathname);
      setSearchState(new URLSearchParams(window.location.search));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to: string) => {
    // 支持 ?query
    const [path, query] = to.split("?");
    if (path !== pathname) history.pushState({}, "", to);
    setPathname(path);
    setSearchState(new URLSearchParams(query || ""));
  };

  // 拦截所有 <a> 跳转（SPA 内不刷新整页）
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !a.href.startsWith(window.location.origin)) return;
      if (a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      navigate(a.pathname + a.search);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate, params: {}, search }}>
      {children}
    </RouterContext.Provider>
  );
}

// ========== Routes / Route ==========
export function Routes({ routes, fallback }: { routes: Route[]; fallback?: ReactNode }) {
  const { pathname } = useRouter();
  const m = matchRoute(routes, pathname);
  if (!m) return <>{fallback ?? <div>404</div>}</>;
  // 把 params 注入 context（简化：实际需要重写一个带 params 的 provider）
  return <div data-pathname={pathname}>{m.route.element}</div>;
}

export function Route(_: Route) { return null; }   // 仅作类型占位

// ========== Link / NavLink ==========
export function Link({ to, children, style }: { to: string; children: ReactNode; style?: React.CSSProperties }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); navigate(to); }}
      style={{ color: "#2563eb", textDecoration: "none", cursor: "pointer", ...style }}
    >
      {children}
    </a>
  );
}

export function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const { pathname } = useRouter();
  const active = pathname === to;
  return (
    <Link to={to} style={{
      padding: "6px 12px",
      borderRadius: 4,
      background: active ? "#dbeafe" : "transparent",
      color: active ? "#1d4ed8" : "#374151",
      fontWeight: active ? 600 : 400,
      marginRight: 8,
    }}>
      {children}
    </Link>
  );
}

// ========== Demo ==========
function Home()    { return <h2>首页</h2>; }
function About()   { return <h2>关于我们</h2>; }
function User()    { const { id } = useParams(); return <h2>用户 #{id}</h2>; }

export default function App() {
  return (
    <Router>
      <nav style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
        <NavLink to="/">首页</NavLink>
        <NavLink to="/about">关于</NavLink>
        <NavLink to="/user/42">用户 42</NavLink>
      </nav>
      <div style={{ padding: 16 }}>
        <Routes
          routes={[
            { path: "/",       element: <Home /> },
            { path: "/about",  element: <About /> },
            { path: "/user/:id", element: <User /> },
          ]}
        />
      </div>
    </Router>
  );
}
\`\`\`

---

## 三、BrowserRouter vs HashRouter

| 路由 | URL 形式 | 后端要求 | 推荐场景 |
| --- | --- | --- | --- |
| BrowserRouter | \`/user/42\` | 需要 nginx 配 fallback | 生产环境 |
| HashRouter | \`/#/user/42\` | 不需要 | 静态文件部署 |
| MemoryRouter | 不改 URL | - | React Native / 测试 |

\`\`\`tsx
// BrowserRouter（推荐）：用 history.pushState
import { BrowserRouter } from "react-router-dom";
<BrowserRouter><App /></BrowserRouter>

// HashRouter：用 window.location.hash
import { HashRouter } from "react-router-dom";
<HashRouter><App /></HashRouter>
\`\`\`

---

## 四、Link 与 NavLink

\`\`\`tsx
// Link：代替 <a>，不刷新整页
<Link to="/about">关于</Link>

// NavLink：当前路径匹配时自动加 active class / style
<NavLink
  to="/messages"
  className={({ isActive }) => isActive ? "active" : ""}
  style={({ isActive }) => ({ color: isActive ? "red" : "black" })}
>
  消息
</NavLink>
\`\`\`

---

## 五、useNavigate：命令式跳转

\`\`\`tsx
import { useNavigate } from "react-router-dom";

function LoginSuccess() {
  const navigate = useNavigate();
  const onLogin = async () => {
    await login();
    navigate("/dashboard");              // 跳到 dashboard
    navigate("/dashboard", { replace: true }); // 替换历史栈（不能后退）
    navigate(-1);                          // 后退
  };
  return <button onClick={onLogin}>登录</button>;
}
\`\`\`

---

## 六、useParams：动态段

\`\`\`tsx
// 路由 /user/:id
function UserPage() {
  const { id } = useParams<{ id: string }>();    // { id: "42" }
  return <div>用户 {id}</div>;
}
\`\`\`

---

## 七、useSearchParams：URL 查询参数

\`\`\`tsx
import { useSearchParams } from "react-router-dom";

function ProductList() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") ?? 1);
  const keyword = params.get("q") ?? "";

  return (
    <div>
      <input value={keyword} onChange={(e) => setParams({ q: e.target.value, page: "1" })} />
      <button onClick={() => setParams({ page: String(page + 1) })}>下一页</button>
      <p>当前第 {page} 页</p>
    </div>
  );
}
\`\`\`

---

## 八、redirect 与 navigate 的区别

\`\`\`tsx
// Navigate：渲染时跳转（常用于"已登录就跳走"）
import { Navigate } from "react-router-dom";
function ProtectedPage() {
  const isLogin = false;
  if (!isLogin) return <Navigate to="/login" replace />;
  return <div>受保护内容</div>;
}

// navigate：事件中跳转
const navigate = useNavigate();
button.onClick = () => navigate("/home");
\`\`\`

---

## 小结

1. **前端路由核心** = \`history.pushState\` + 监听 \`popstate\` + 路径匹配渲染
2. **BrowserRouter** 用 history API（URL 干净），**HashRouter** 用 \`#\`（兼容性好）
3. **Routes + Route**：声明式路由表，path 支持 \`:param\` 动态段
4. **Link** 替代 \`a\` 避免整页刷新；**NavLink** 自带 active 高亮
5. **useNavigate**：命令式跳转，支持 \`replace\` 和 \`navigate(-1)\`
6. **useParams** 取动态段；**useSearchParams** 取/设查询参数
7. **Navigate 组件**：渲染期跳转，常用于鉴权失败
`,
  },

  // =========================================================
  // 第六十七章 React Router 进阶
  // =========================================================
  {
    id: "tsx2-ch67",
    group: "第十四部分 路由与状态管理",
    icon: "🗺️",
    title: "第六十七章 React Router 进阶",
    content: `# 第六十七章 React Router 进阶

基础路由只能满足"平铺页面"。真实应用里：用户列表 → 用户详情（嵌套）、登录前要鉴权（保护路由）、大路由要分包（懒加载）、URL 输错要 404。本章覆盖这些进阶模式。

---

## 一、嵌套路由（Nested Routes）

场景：\`/users\` 显示用户列表，\`/users/42\` 显示某个用户的详情（列表保留在左侧）。

\`\`\`tsx
import { useState, useContext, createContext, useEffect, ReactNode } from "react";

// 上一章的 Router / Routes 复用，这里只演示嵌套结构

// 路由表（嵌套）
const routes = [
  {
    path: "/users",
    element: <UsersLayout />,           // 父布局：左侧列表
    children: [
      { path: "",        element: <UserList /> },       // /users
      { path: ":id",     element: <UserDetail /> },     // /users/42
    ],
  },
];

// ========== Outlet：子路由出口 ==========
// 上一章的 RouterContext 加一个 outlet
const RouterContext = createContext<any>(null);
const OutletContext = createContext<any>(null);

export function useOutlet() {
  // 简化：实际用内部 state 管理当前激活的子路由
  return useContext(OutletContext);
}

// 父布局：渲染左侧 + Outlet
function UsersLayout() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: 16 }}>
      <aside>
        <h4>用户列表</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {[1, 2, 3].map((id) => (
            <li key={id}><a href={\`/users/\${id}\`}>用户 {id}</a></li>
          ))}
        </ul>
      </aside>
      <main>
        <Outlet />     {/* 子路由渲染在这里 */}
      </main>
    </div>
  );
}

// 简化版 Outlet：从内部 children 找到匹配项
function Outlet() {
  // 真实实现：routes 树形匹配，命中 children 后渲染
  // 这里示意用 props 注入
  return <div>Outlet 渲染区</div>;
}

function UserList() { return <h3>请选择用户</h3>; }
function UserDetail() {
  // 真实 useParams() 这里
  return <h3>用户详情</h3>;
}
\`\`\`

**真实 React Router 写法**：
\`\`\`tsx
<Routes>
  <Route path="/users" element={<UsersLayout />}>
    <Route index element={<UserList />} />
    <Route path=":id" element={<UserDetail />} />
  </Route>
</Routes>

function UsersLayout() {
  return (
    <div>
      <nav>...</nav>
      <Outlet />   {/* 子路由出口 */}
    </div>
  );
}
\`\`\`

---

## 二、useOutletContext：父子通信

\`\`\`tsx
// 父路由通过 outletContext 传值给子路由
function Dashboard() {
  const user = { name: "张三", role: "admin" };
  return (
    <div>
      <h2>仪表盘</h2>
      <Outlet context={{ user }} />    {/* 注入 context */}
    </div>
  );
}

// 子路由用 useOutletContext 拿
import { useOutletContext } from "react-router-dom";

function ProfileTab() {
  const { user } = useOutletContext<{ user: { name: string; role: string } }>();
  return <p>用户：{user.name}，角色：{user.role}</p>;
}
\`\`\`

---

## 三、保护路由（Protected Routes）

未登录不能访问 \`/dashboard\`。

\`\`\`tsx
import { Navigate, useLocation } from "react-router-dom";

function RequireAuth({ children }: { children: ReactNode }) {
  const isLogin = useAuth();                              // 自定义 hook
  const location = useLocation();
  if (!isLogin) {
    // 记住用户原本想去哪，登录后跳回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// 用法
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={
    <RequireAuth><Dashboard /></RequireAuth>
  } />
</Routes>

// 登录页：登录成功后跳回 from
function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname ?? "/";
  const onLogin = () => { setLogin(); navigate(from, { replace: true }); };
  return <button onClick={onLogin}>登录</button>;
}
\`\`\`

---

## 四、懒加载路由（Lazy Routes）

大应用里把所有页面打包成一个 bundle，首屏会很大。用 \`React.lazy\` + \`Suspense\` 拆分。

\`\`\`tsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// 懒加载组件
const Home     = lazy(() => import("./pages/Home"));
const About    = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

**打包结果**：每个 lazy 组件单独一个 chunk，按需加载。

---

## 五、404 处理

\`\`\`tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="*" element={<NotFound />} />   {/* 兜底 */}
</Routes>

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>404</h1>
      <p>页面不存在</p>
      <Link to="/">回首页</Link>
    </div>
  );
}
\`\`\`

---

## 六、路由分组：layout 模式

把多个路由共享一个 layout：

\`\`\`tsx
const MainLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

<Routes>
  <Route element={<MainLayout />}>
    <Route path="/"        element={<Home />} />
    <Route path="/about"   element={<About />} />
    <Route path="/products" element={<Products />} />
  </Route>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminHome />} />
    <Route path="users"  element={<AdminUsers />} />
  </Route>
</Routes>
\`\`\`

---

## 七、loader / action（v6.4+ 数据路由）

\`\`\`tsx
// v6.4+ 用 loader 在路由层预取数据
import { createBrowserRouter, RouterProvider, useLoaderData } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/users",
    element: <UsersPage />,
    loader: async () => {
      const r = await fetch("/api/users");
      return r.json();
    },
  },
]);

function UsersPage() {
  const users = useLoaderData() as Array<{ id: number; name: string }>;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

<RouterProvider router={router} />
\`\`\`

**优势**：进入路由前数据就 ready，配合 Suspense 体验丝滑。

---

## 八、迷你 demo：综合应用

\`\`\`tsx
import { useState } from "react";

function MiniRouter() {
  const [path, setPath] = useState(window.location.pathname);
  const navigate = (to: string) => { history.pushState({}, "", to); setPath(to); };
  window.onpopstate = () => setPath(window.location.pathname);

  // 模拟鉴权
  const isLogin = localStorage.getItem("login") === "1";

  if (path === "/dashboard" && !isLogin) {
    return <button onClick={() => { localStorage.setItem("login", "1"); navigate("/dashboard"); }}>请先登录（点击登录）</button>;
  }

  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["/", "/about", "/dashboard"].map((p) => (
          <a key={p} href={p} onClick={(e) => { e.preventDefault(); navigate(p); }} style={{ padding: "4px 8px", background: path === p ? "#dbeafe" : "transparent" }}>
            {p}
          </a>
        ))}
      </nav>
      {path === "/" && <h2>首页</h2>}
      {path === "/about" && <h2>关于</h2>}
      {path === "/dashboard" && <h2>仪表盘（已登录）</h2>}
      {path === "/unknown" && <h2>404</h2>}
      {path !== "/" && path !== "/about" && path !== "/dashboard" && (
        <button onClick={() => navigate("/")}>回首页</button>
      )}
    </div>
  );
}

export default function App() { return <MiniRouter />; }
\`\`\`

---

## 小结

1. **嵌套路由**：用 \`<Outlet />\` 在父布局里给子路由占位
2. **useOutletContext**：父子通信的官方推荐方式（替代 prop drilling）
3. **RequireAuth 包装组件**：未登录跳 \`/login\`，登录后跳回 \`from\`
4. **React.lazy + Suspense**：每个路由拆 chunk，首屏更快
5. **404**：用 \`path="*"\` 兜底
6. **layout 模式**：用 \`<Route element={<Layout />}>\` 包裹共享布局
7. **数据路由 v6.4+**：loader 在路由层预取，useLoaderData 拿数据
`,
  },

  // =========================================================
  // 第六十八章 全局状态管理思想
  // =========================================================
  {
    id: "tsx2-ch68",
    group: "第十四部分 路由与状态管理",
    icon: "🌍",
    title: "第六十八章 全局状态管理思想",
    content: `# 第六十八章 全局状态管理思想

什么时候该用全局状态？用 Context 还是 Redux/Zustand？服务端状态和客户端状态有什么区别？本章从思想出发讲清状态管理的本质，帮你避免"为了用 Redux 而用 Redux"。

---

## 一、什么时候需要全局状态

**默认**：状态应该**就近**。能用 \`useState\` 就用 \`useState\`，能在父组件就放父组件，能用 props 传就别提升。

只有以下情况才考虑全局：
1. 多个**不相关**的组件需要读同一份数据（避免 prop drilling）
2. 多个组件需要**互相触发**对方的更新
3. 状态需要在**路由切换间**保持

\`\`\`tsx
// ❌ 不需要全局：单个组件自己的状态
function Modal() {
  const [open, setOpen] = useState(false);
  return <>...</>;
}

// ❌ 不需要全局：父子/兄弟组件，能提升就提升
function Parent() {
  const [value, setValue] = useState("");
  return (
    <>
      <Input value={value} onChange={setValue} />
      <Display value={value} />
    </>
  );
}

// ✅ 需要全局：用户信息（Header、Sidebar、ProfilePage 都要读）
// ✅ 需要全局：主题（深色/浅色，所有组件都要响应）
// ✅ 需要全局：购物车（任意页面加购，购物车图标要更新）
\`\`\`

---

## 二、Context：够用就好

\`useContext\` 是 React 内置的"轻量全局状态"方案。

\`\`\`tsx
import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme 必须在 ThemeProvider 内使用");
  return ctx;
}

function Header() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>当前：{theme}</button>;
}

function Page() {
  const { theme } = useTheme();
  return <div style={{ background: theme === "dark" ? "#1f2937" : "#fff", color: theme === "dark" ? "#fff" : "#000", padding: 16, minHeight: 200 }}>内容</div>;
}

export default function App() {
  return (
    <ThemeProvider>
      <Header />
      <Page />
    </ThemeProvider>
  );
}
\`\`\`

**Context 的局限**：
- 高频更新会导致**所有订阅者 re-render**（没有 selector 机制）
- 复杂业务逻辑时，Context 里会塞满 reducer
- 调试不便（没 devtools 时间旅行）

---

## 三、Redux / Zustand 解决什么

Context 解决"取数"问题，但没解决"性能"和"工程化"。

| 能力 | Context | Redux Toolkit | Zustand |
| --- | --- | --- | --- |
| 取数 | ✓ | ✓ | ✓ |
| 订阅粒度（避免无关 re-render） | ✗ | ✓ | ✓ |
| DevTools 时间旅行 | ✗ | ✓ | ✓ (中间件) |
| 中间件（持久化、异步） | 自己写 | 官方支持 | 官方支持 |
| 体积 | 0 | ~10KB | ~1KB |
| 心智负担 | 低 | 中 | 低 |
| 适合规模 | 小 | 大 | 中-大 |

---

## 四、提升状态 vs 全局状态

\`\`\`tsx
// 场景：父组件 A 用 B 和 C，B 和 C 都需要 theme
// 选项 1：提升到 A
function A() {
  const [theme, setTheme] = useState("light");
  return <><B theme={theme} setTheme={setTheme} /><C theme={theme} /></>;
}
// 优点：简单直接
// 缺点：每多一个用 theme 的组件都要改 A

// 选项 2：Context
const ThemeContext = createContext(...);
function A() {
  return <ThemeProvider><B /><C /></ThemeProvider>;
}
// 优点：新增组件零改动
// 缺点：性能稍差（context 变了所有订阅者 re-render）

// 选项 3：Zustand
const useTheme = create((set) => ({
  theme: "light",
  setTheme: (t) => set({ theme: t }),
}));
function B() {
  const theme = useTheme((s) => s.theme);    // 只订阅 theme
  return <div>{theme}</div>;
}
\`\`\`

**经验法则**：
- < 3 层组件、共享数据少 → 提升
- 多层、跨路由、状态中等 → Context
- 状态大、性能要求高、复杂异步 → Zustand / Redux

---

## 五、客户端状态 vs 服务端状态

| 类型 | 例子 | 谁来管 |
| --- | --- | --- |
| **客户端状态** | 主题、UI 开关、表单输入 | useState / Context / Zustand |
| **服务端状态** | 用户列表、文章、订单 | React Query / SWR / RTK Query |

**关键洞察**：服务端状态是"远端数据库的缓存"，**不应当**用 useState + useEffect 管。

\`\`\`tsx
// ❌ 自己管服务端状态：难写且坑多
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  // 问题：缓存、刷新、失败重试、并发请求——全要自己写
}

// ✅ 用 React Query/SWR
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,    // 5 分钟内不重新请求
  });
}
\`\`\`

**React Query 等解决**：
- 缓存（key 复用）
- 自动重试、刷新
- 乐观更新
- 无限滚动、预取

---

## 六、状态分层架构

\`\`\`
┌──────────────────────────────────┐
│ URL（路由参数、search params）    │  ← 状态 1：URL 是状态的"分享入口"
├──────────────────────────────────┤
│ 服务端缓存（React Query）        │  ← 状态 2：远端数据
├──────────────────────────────────┤
│ 全局客户端状态（Zustand）        │  ← 状态 3：跨页面共享
├──────────────────────────────────┤
│ 局部状态（useState）             │  ← 状态 4：组件私有
└──────────────────────────────────┘
\`\`\`

**黄金法则**：
- 状态能放 URL 就放 URL（可分享、可书签）
- 服务端数据用 React Query / SWR
- 跨页面的纯客户端状态用 Zustand
- 组件私有用 useState

---

## 七、性能：Context 引起的"全量 re-render"

\`\`\`tsx
// 父 Context value 是新对象时，所有消费者重渲染
function BadProvider({ children }) {
  const [count, setCount] = useState(0);
  // value 是新对象 → 每次渲染都是新引用 → 所有 useContext 消费者 re-render
  return <MyContext.Provider value={{ count, setCount }}>{children}</MyContext.Provider>;
}

// 解决 1：拆分 Context（按更新频率）
const CountContext = createContext(0);
const SetCountContext = createContext(() => {});

// 解决 2：useMemo 缓存 value
const value = useMemo(() => ({ count, setCount }), [count]);

// 解决 3：换 Zustand（自带 selector，订阅粒度细）
\`\`\`

---

## 八、决策流程图

\`\`\`
状态是组件私有的吗？
  ├─ 是 → useState
  └─ 否 → 状态来自 URL？
       ├─ 是 → useSearchParams / useParams
       └─ 否 → 状态来自服务端？
            ├─ 是 → React Query / SWR
            └─ 否 → 跨多少层？
                 ├─ < 3 层 → 提升
                 └─ 多层/跨页 → Context / Zustand / Redux
                       ├─ 简单、< 5 个值 → Context
                       ├─ 复杂、需要 DevTools → Redux Toolkit
                       └─ 想轻量、高性能 → Zustand
\`\`\`

---

## 小结

1. **默认就近**：能用 useState/useReducer 就不用全局
2. **Context** 适合：低频更新、配置类数据（主题、用户信息）
3. **Zustand/Redux** 适合：高频更新、复杂业务、需要 DevTools
4. **服务端状态 ≠ 客户端状态**：前者用 React Query/SWR
5. **URL 是状态**：可分享的优先放 URL
6. **Context 性能陷阱**：value 是新对象会引起全量 re-render
7. **分层管理**：URL > 服务端缓存 > 全局客户端 > 局部

---

## 九、Context 性能陷阱详解

\`useContext\` 最大的坑：**value 是新对象导致全量 re-render**。

\`\`\`tsx
// 经典陷阱
function BadProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({ name: "张三", age: 18 });
  // 每次 re-render 都创建新对象 → 所有 useContext 消费者都 re-render
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

function ExpensiveChild() {
  // 即使只用 user.name，但因为 value 变了，整个组件 re-render
  const { user } = useContext(UserContext);
  console.log("ExpensiveChild re-render");   // 每次 Provider re-render 都打印
  return <div>{user.name}</div>;
}
\`\`\`

### 解法 1：拆分 Context

\`\`\`tsx
const UserValueContext = createContext({ name: "张三" });
const UserDispatchContext = createContext((u: User) => {});

// 消费者按需订阅
function NameOnly() {
  const user = useContext(UserValueContext);   // 只在 name 变时 re-render
  return <div>{user.name}</div>;
}
function AgeOnly() {
  const user = useContext(UserValueContext);
  return <div>{user.age}</div>;                // 即使 name 变也不该 re-render，但会
}
\`\`\`

### 解法 2：useMemo 缓存 value

\`\`\`tsx
function GoodProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({ name: "张三", age: 18 });
  // 把 value 用 useMemo 包住，依赖不变就引用不变
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
\`\`\`

### 解法 3：换 Zustand

\`\`\`tsx
// Zustand 自带 selector，组件只订阅关心的字段
import { create } from "zustand";
const useUser = create<{ user: User; setUser: (u: User) => void }>((set) => ({
  user: { name: "张三", age: 18 },
  setUser: (user) => set({ user }),
}));

function NameOnly() {
  // 只订阅 name，其他字段变了不会 re-render
  const name = useUser((s) => s.user.name);
  return <div>{name}</div>;
}
\`\`\`

---

## 十、Redux 的不可替代场景

虽然 Context + Zustand 覆盖了 90% 场景，但 Redux 在以下情况仍有优势：

1. **超大型项目**：数百个开发者协作，Redux 的"严格规范"避免混乱
2. **复杂时间旅行调试**：Redux DevTools 是业界最强
3. **可重放状态**：能序列化 store 到本地，便于复现 bug
4. **多端同构**：一套 reducer 在 web、native、SSR 通用
5. **生态丰富**：RTK Query、redux-observable、reselect 等周边齐全

如果只是写写小项目，Zustand 已经完全够用；中大型项目再考虑 Redux Toolkit。

---

## 十一、迁移路径

\`\`\`
阶段 1：useState 局部状态
        ↓ 多个组件共享
阶段 2：Context + useReducer
        ↓ 高频更新 / 复杂业务
阶段 3：Zustand（最简 + 高效）
        ↓ 超大型项目 / 需要 DevTools
阶段 4：Redux Toolkit
        ↓ 数据请求复杂
阶段 5：RTK Query 或 React Query
\`\`\`

**不要跳级**：从 useState 直接到 Redux 会增加学习成本；用 Zustand 过渡更平滑。

---

## 十二、实战：用户偏好中心

把"主题 + 语言 + 通知设置"三种全局偏好合并管理。

\`\`\`tsx
import { useState } from "react";

type Theme = "light" | "dark";
type Lang = "zh" | "en";

// 1. 单 Context + useReducer（中等规模）
type PrefsState = { theme: Theme; lang: Lang; notify: boolean };
type PrefsAction =
  | { type: "setTheme"; theme: Theme }
  | { type: "setLang"; lang: Lang }
  | { type: "toggleNotify" };

function reducer(s: PrefsState, a: PrefsAction): PrefsState {
  switch (a.type) {
    case "setTheme":     return { ...s, theme: a.theme };
    case "setLang":      return { ...s, lang: a.lang };
    case "toggleNotify": return { ...s, notify: !s.notify };
  }
}

// 假设这是从 Zustand 实现
const usePrefs = (() => {
  const listeners = new Set<() => void>();
  let state: PrefsState = { theme: "light", lang: "zh", notify: true };
  const setState = (partial: Partial<PrefsState>) => {
    state = { ...state, ...partial };
    listeners.forEach((cb) => cb());
  };
  return (selector: (s: PrefsState) => any) => {
    const [, force] = useState(0);
    useState(() => {
      const cb = () => force((n) => n + 1);
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    });
    return selector(state);
  };
})();

function PreferencesPanel() {
  const theme = usePrefs((s) => s.theme);
  const lang = usePrefs((s) => s.lang);
  const notify = usePrefs((s) => s.notify);

  return (
    <div style={{ padding: 16, maxWidth: 320, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>偏好设置</h3>
      <label style={{ display: "block", marginBottom: 8 }}>
        主题：
        <select value={theme} onChange={(e) => setState({ theme: e.target.value as Theme })}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        语言：
        <select value={lang} onChange={(e) => setState({ lang: e.target.value as Lang })}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
      <label style={{ display: "block" }}>
        <input type="checkbox" checked={notify} onChange={() => setState({ notify: !notify })} />
        开启消息通知
      </label>
    </div>
  );
}

export default function App() { return <PreferencesPanel />; }
\`\`\`

这种"中等规模 + 高频更新"的场景，用 Context + useReducer 或 Zustand 都合适；如果将来加 undo/redo，再迁到 Redux。
`,
  },

  // =========================================================
  // 第六十九章 Zustand 实战
  // =========================================================
  {
    id: "tsx2-ch69",
    group: "第十四部分 路由与状态管理",
    icon: "🐻",
    title: "第六十九章 Zustand 实战",
    content: `# 第六十九章 Zustand 实战

Zustand 是当前最受欢迎的轻量级状态管理库（~1KB）。它用 **selector** 实现精确订阅，避免 Context 那种"全量 re-render"。本章用迷你实现 + 真实 API 两手抓，让你既懂原理又会用。

---

## 一、Zustand 核心思想

\`\`\`tsx
// 一句话：用 selector 让组件只订阅自己关心的字段
const bears = useBearStore((s) => s.bears);     // 只在 bears 变时 re-render
const increase = useBearStore((s) => s.increase); // 函数引用稳定，不引起 re-render
\`\`\`

---

## 二、迷你 Zustand 实现

\`\`\`tsx
import { useState, useEffect, useRef } from "react";

type StateCreator<T> = (set: (partial: Partial<T> | ((s: T) => Partial<T>)) => void, get: () => T) => T;

// ========== 核心 create ==========
export function create<T>(creator: StateCreator<T>) {
  // 内部 state
  let state: T;
  const listeners = new Set<() => void>();

  // setState：支持 partial 和 updater
  const setState = (partial: Partial<T> | ((s: T) => Partial<T>)) => {
    const next = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...next };
    listeners.forEach((cb) => cb());     // 通知订阅者
  };

  // getState：取当前 state
  const getState = () => state;

  // 初始化
  state = creator(setState, getState);

  // useStore hook：组件订阅
  const useStore = <U>(selector: (s: T) => U = (s) => s as unknown as U): U => {
    // 缓存上次 selector 结果
    const lastSel = useRef(selector(state));
    const [, force] = useState(0);

    useEffect(() => {
      // 订阅：state 变化时检查 selector 结果是否变
      const cb = () => {
        const next = selector(state);
        if (!Object.is(next, lastSel.current)) {
          lastSel.current = next;
          force((n) => n + 1);
        }
      };
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    }, [selector]);

    return selector(state);
  };

  // 暴露 API
  return Object.assign(useStore, { setState, getState });
}

// ========== 测试 ==========
const useCounter = create<{ count: number; inc: () => void; dec: () => void }>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),
}));

function Counter() {
  const count = useCounter((s) => s.count);          // 只订阅 count
  const inc = useCounter((s) => s.inc);              // 函数引用稳定
  return (
    <div style={{ padding: 16 }}>
      <p>Count: {count}</p>
      <button onClick={inc} style={{ padding: "4px 12px" }}>+1</button>
    </div>
  );
}

export default function App() { return <Counter />; }
\`\`\`

---

## 三、真实 Zustand 写法

### 1. 基本 store

\`\`\`tsx
import { create } from "zustand";

type BearState = {
  bears: number;
  increase: (by: number) => void;
  removeAll: () => void;
};

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
  removeAll: () => set({ bears: 0 }),
}));

function BearCounter() {
  const bears = useBearStore((s) => s.bears);              // selector
  return <h1>{bears} around here...</h1>;
}

function Controls() {
  const increase = useBearStore((s) => s.increase);       // 函数引用稳定
  return <button onClick={() => increase(1)}>Add bear</button>;
}
\`\`\`

### 2. 多 slice 组合

\`\`\`tsx
// 拆成多个 slice 合并
type BearSlice = { bears: number; addBear: () => void };
type FishSlice = { fishes: number; addFish: () => void };

const createBearSlice: StateCreator<BearSlice & FishSlice, [], [], BearSlice> = (set) => ({
  bears: 0,
  addBear: () => set((s) => ({ bears: s.bears + 1 })),
});

const createFishSlice: StateCreator<BearSlice & FishSlice, [], [], FishSlice> = (set) => ({
  fishes: 0,
  addFish: () => set((s) => ({ fishes: s.fishes + 1 })),
});

const useStore = create<BearSlice & FishSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}));

// 用法
const bears = useStore((s) => s.bears);
\`\`\`

### 3. 异步 actions

\`\`\`tsx
type UserState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (id: number) => Promise<void>;
};

const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const r = await fetch(\`/api/users/\${id}\`);
      const user = await r.json();
      set({ user, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
\`\`\`

---

## 四、持久化（persist middleware）

状态自动写入 localStorage，刷新后恢复。

\`\`\`tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create(
  persist<{ count: number; inc: () => void }>(
    (set) => ({
      count: 0,
      inc: () => set((s) => ({ count: s.count + 1 })),
    }),
    {
      name: "my-store",                                  // localStorage key
      storage: createJSONStorage(() => localStorage),    // 默认就是 localStorage
      partialize: (s) => ({ count: s.count }),           // 只持久化 count
    }
  )
);
\`\`\`

---

## 五、DevTools 中间件

\`\`\`tsx
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools<MyState>(
    (set) => ({ /* ... */ }),
    { name: "MyStore" }                                 // 在 Redux DevTools 里显示的名字
  )
);
\`\`\`

---

## 六、TypeScript 高级类型

\`\`\`tsx
// useShallow：对象/数组浅比较
import { useShallow } from "zustand/react/shallow";

const { name, age } = useStore(useShallow((s) => ({ name: s.name, age: s.age })));
// 不用 useShallow 会每次返回新对象，触发 re-render

// slice 模式类型
type Store = BearSlice & FishSlice;
const useStore = create<Store>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}));
\`\`\`

---

## 七、常见场景

### 1. 购物车

\`\`\`tsx
type CartItem = { id: number; name: string; price: number; qty: number };
type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: number) => void;
  total: () => number;
};

const useCart = create<CartState>((set, get) => ({
  items: [],
  add: (item) => set((s) => {
    const exist = s.items.find((i) => i.id === item.id);
    return {
      items: exist
        ? s.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...s.items, { ...item, qty: 1 }],
    };
  }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));
\`\`\`

### 2. 主题切换（深色模式）

\`\`\`tsx
type ThemeState = { mode: "light" | "dark"; toggle: () => void };
const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",
      toggle: () => set((s) => ({ mode: s.mode === "light" ? "dark" : "light" })),
    }),
    { name: "theme" }
  )
);
\`\`\`

---

## 八、与 React Router 配合

\`\`\`tsx
// 用 selector 拿路由信息
import { useLocation } from "react-router-dom";

const useUIStore = create<{ sidebarOpen: boolean; toggle: () => void }>((set) => ({
  sidebarOpen: true,
  toggle: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

function Layout() {
  const open = useUIStore((s) => s.sidebarOpen);
  const toggle = useUIStore((s) => s.toggle);
  return (
    <div>
      <button onClick={toggle}>{open ? "收起" : "展开"}</button>
      {open && <Sidebar />}
    </div>
  );
}
\`\`\`

---

## 小结

1. **Zustand 核心** = \`create\` + selector + 内部订阅模型
2. **selector 优势**：只订阅关心的字段，组件精确 re-render
3. **setState** 支持 partial \`set({a:1})\` 和 updater \`set((s) => ({a: s.a+1}))\`
4. **persist middleware**：自动 localStorage 持久化
5. **devtools middleware**：接 Redux DevTools
6. **slice 模式**：用 \`StateCreator\` 把大 store 拆成多个小文件
7. **useShallow**：对象/数组 selector 必备，避免引用变化导致的 re-render
8. **TypeScript 友好**：泛型 create 让 store 类型完全推导
`,
  },

  // =========================================================
  // 第七十章 Redux Toolkit 实战
  // =========================================================
  {
    id: "tsx2-ch70",
    group: "第十四部分 路由与状态管理",
    icon: "🗄️",
    title: "第七十章 Redux Toolkit 实战",
    content: `# 第七十章 Redux Toolkit 实战

Redux 是 React 生态最经典的状态管理库，长期被视为"样板代码多"；Redux Toolkit（RTK）大幅简化了它。本章用迷你实现 + 真实 RTK API，让你理解 createSlice、configureStore、RTK Query 的精妙。

---

## 一、为什么用 Redux Toolkit

经典 Redux 三件套：action、reducer、store，写一次计数器要 30 行。RTK 把这些封装成 \`createSlice\` + \`configureStore\`，样板代码降到最低。

\`\`\`tsx
// 经典 Redux 计数器（30+ 行）
const INCREMENT = "INCREMENT";
const increment = () => ({ type: INCREMENT });
function counter(state = 0, action) {
  switch (action.type) {
    case INCREMENT: return state + 1;
    default: return state;
  }
}
const store = createStore(counter);

// RTK 计数器（10 行）
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },   // 直接"改"state（Immer）
  },
});
\`\`\`

---

## 二、迷你 Redux 实现

\`\`\`tsx
import { useState, useEffect, useRef } from "react";

// ========== createSlice ==========
type Reducer<S, A> = (state: S, action: A) => S;

function createSlice<S, A extends { type: string }>(config: {
  name: string;
  initialState: S;
  reducers: Record<string, Reducer<S, A>>;
}) {
  // 聚合 reducer
  const reducer: Reducer<S, A> = (state = config.initialState, action) => {
    const fn = config.reducers[action.type];
    return fn ? fn(state, action) : state;
  };
  // action creators
  const actions: any = {};
  for (const k in config.reducers) {
    actions[k] = (payload?: any) => ({ type: \`\${config.name}/\${k}\`, payload });
  }
  return { name: config.name, reducer, actions };
}

// ========== createStore + Provider ==========
function createStore<S, A>(reducer: Reducer<S, A>) {
  let state: S;
  const listeners = new Set<() => void>();
  const dispatch = (a: A) => { state = reducer(state, a); listeners.forEach((cb) => cb()); };
  const getState = () => state;
  const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
  state = reducer(undefined as any, { type: "@@INIT" } as A);
  return { dispatch, getState, subscribe };
}

const StoreContext = createContext<any>(null);

function Provider({ store, children }: any) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

// ========== useSelector / useDispatch ==========
function useDispatch<A>() {
  return useContext(StoreContext).dispatch as (a: A) => void;
}
function useSelector<S, T>(selector: (s: S) => T): T {
  const store = useContext(StoreContext);
  const last = useRef(selector(store.getState()));
  const [, force] = useState(0);
  useEffect(() => store.subscribe(() => {
    const next = selector(store.getState());
    if (next !== last.current) { last.current = next; force((n) => n + 1); }
  }), [store, selector]);
  return selector(store.getState());
}
\`\`\`

---

## 三、真实 RTK 写法

### 1. 计数器完整示例

\`\`\`tsx
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector, useDispatch, Provider } from "react-redux";

// ========== slice ==========
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0, history: [] as number[] },
  reducers: {
    increment: (state) => { state.value += 1; },                       // Immer 让"改"安全
    decrement: (state) => { state.value -= 1; },
    incrementBy: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
      state.history = [];
    },
  },
});

export const { increment, decrement, incrementBy, reset } = counterSlice.actions;

// ========== store ==========
const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

// ========== 组件 ==========
function Counter() {
  const value = useSelector((s: any) => s.counter.value);
  const dispatch = useDispatch();
  return (
    <div style={{ padding: 16 }}>
      <h2>{value}</h2>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(incrementBy(5))}>+5</button>
      <button onClick={() => dispatch(reset())}>重置</button>
    </div>
  );
}

export default function App() {
  return <Provider store={store}><Counter /></Provider>;
}
\`\`\`

### 2. Immer 集成

\`createSlice\` 默认用 Immer，可以"直接改"state：

\`\`\`tsx
reducers: {
  // ✅ Immer 让"改"实际是返回新 state
  addItem: (state, action: PayloadAction<Item>) => {
    state.items.push(action.payload);   // 看似改，实际产生新数组
  },
  // 也支持返回新 state
  reset: (state) => ({ ...state, value: 0 }),
}
\`\`\`

---

## 四、createSlice 类型推导

\`\`\`tsx
const slice = createSlice({
  name: "todos",
  initialState: [] as Todo[],
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.push({ id: Date.now(), text: action.payload, done: false });
    },
    toggle: (state, action: PayloadAction<number>) => {
      const t = state.find((t) => t.id === action.payload);
      if (t) t.done = !t.done;
    },
  },
});

// types
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// 自定义 hook（推荐）
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector as <T>(s: (state: RootState) => T) => T;
\`\`\`

---

## 五、configureStore 中间件

\`\`\`tsx
import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefault) => getDefault().concat(logger),    // 自定义中间件
  devTools: process.env.NODE_ENV !== "production",            // DevTools 默认开
});
\`\`\`

---

## 六、RTK Query 入门

RTK 自带数据请求方案（类似 React Query），开箱即用。

\`\`\`tsx
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 1. 定义 API
const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
    }),
    getUser: builder.query<User, number>({
      query: (id) => \`/users/\${id}\`,
    }),
    addUser: builder.mutation<User, Omit<User, "id">>({
      query: (body) => ({ url: "/users", method: "POST", body }),
    }),
  }),
});

export const { useGetUsersQuery, useGetUserQuery, useAddUserMutation } = api;

// 2. 接入 store
const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (gdm) => gdm().concat(api.middleware),
});

// 3. 用法
function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  if (isLoading) return <p>加载中</p>;
  if (error) return <p>出错</p>;
  return <ul>{users?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

**RTK Query 提供**：缓存、加载态、轮询、乐观更新、自动 refetch 等。

---

## 七、createAsyncThunk：异步 action

\`\`\`tsx
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk("user/fetch", async (id: number) => {
  const r = await fetch(\`/api/users/\${id}\`);
  return r.json() as Promise<User>;
});

const slice = createSlice({
  name: "user",
  initialState: { data: null as User | null, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUser.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message ?? "出错"; });
  },
});
\`\`\`

---

## 八、Redux vs Zustand vs Context

| 维度 | Context | Zustand | Redux Toolkit |
| --- | --- | --- | --- |
| 体积 | 0 | 1KB | 10KB+ |
| 心智 | 低 | 低 | 中 |
| DevTools | ✗ | 需中间件 | ✓ 内置 |
| 异步 | 自己写 | 直接 async | createAsyncThunk / RTK Query |
| 团队规范 | 弱 | 弱 | 强 |
| 学习曲线 | 平 | 平 | 较陡 |
| 适合项目 | 小 | 中-大 | 大 |

---

## 九、最佳实践

\`\`\`tsx
// 1. 一个特性一个 slice
features/
  todos/
    todosSlice.ts        // createSlice
    TodosPage.tsx

// 2. selector 单独导出
export const selectTodos = (s: RootState) => s.todos.items;
export const selectCompletedCount = (s: RootState) =>
  s.todos.items.filter((t) => t.done).length;

// 3. 类型化的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// 4. 不要在 reducer 里发请求
// 5. 用 RTK Query 管服务端状态，slice 管纯客户端状态
\`\`\`

---

## 小结

1. **createSlice** = action creators + reducer + action types 三合一
2. **Immer 集成**：直接"改"state，实际不可变更新
3. **configureStore** 默认带 thunk、DevTools、序列化检查
4. **useSelector** 带精确订阅，避免无关 re-render
5. **PayloadAction\<T\>** 让 action payload 类型安全
6. **RTK Query** = Redux 生态的数据请求方案，零额外配置
7. **createAsyncThunk** 处理复杂异步流程
8. **大型项目**推荐 RTK + slice 模式 + RTK Query
`,
  },
];

export { chapters };
