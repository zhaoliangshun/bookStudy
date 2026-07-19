// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十三批章节
// -------------------------------------------------------------
// 覆盖：第九部分 路由
// 包含 4 个章节：ch62 ~ ch65
//
// 章节范围：
//   - ch62 React Router v6 入门：BrowserRouter、Routes/Route、Link、
//          useParams、useNavigate、useLocation、loader/action（RR 6.4+ Data API）
//   - ch63 动态路由与嵌套：动态参数 :id、嵌套布局 Outlet、index 路由、
//          绝对路径与相对路径、NavLink 激活状态
//   - ch64 路由守卫与权限：受保护路由组件、auth context、重定向逻辑、
//          角色权限、路由元数据 meta
//   - ch65 Next.js App Router 对比：app 目录结构、server/client 组件、
//          layout/page、loading/error、与 RR v6 的差异
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 每章至少 1 个 React 组件 demo
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - React Router 6.4+（Data API 已稳定）
//   - Next.js 13.4+（App Router 已稳定）
//   - React 18、TypeScript 5.x（strict 默认开启）
// =============================================================

const chapters = [
  // ============================================================
  // ch62: React Router v6 入门
  // ============================================================
  {
    id: "tsx3-ch62",
    group: "第九部分 路由",
    icon: "🛣️",
    title: "ch62 React Router v6 入门",
    content: `# ch62 React Router v6 入门

## 为什么讲这个

React 本身只是视图库，它不知道"页面"是什么。当你的应用需要从首页跳到列表页、再跳到详情页时，必须引入路由库来管理 URL 与组件的映射。

React Router v6（简称 RR v6）是 React 生态最主流的路由方案。6.4 版本之后引入了 **Data API**（\`loader\` / \`action\`），让路由层不仅负责"显示哪个组件"，还能负责"取数据"和"提交数据"——思路向 Next.js 靠拢。

这一章我们先建立 RR v6 的最小可用骨架，把 \`BrowserRouter\`、\`Routes\`/\`Route\`、\`Link\`、\`useNavigate\`、\`useParams\`、\`useLocation\` 这些核心 API 一次摸清。

## 1. 安装与依赖

\`\`\`bash
# 安装 react-router-dom（浏览器端）
# 6.4+ 才有 Data API，建议直接装最新 6.x
npm install react-router-dom
\`\`\`

\`react-router\` 是核心包，\`react-router-dom\` 在它之上加了浏览器相关 API（\`BrowserRouter\`、\`Link\` 等）。**Web 项目装 \`react-router-dom\` 就够了**，它会自动带上核心包。

## 2. BrowserRouter：URL 与组件的桥梁

\`BrowserRouter\` 是路由的"外层容器"，它监听浏览器的 \`popstate\` 事件，把 URL 同步到 React 内部状态。

\`\`\`tsx
// main.tsx —— 应用入口
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// 把 <App /> 包在 <BrowserRouter> 里
// 之后 App 内部所有组件都能用路由 API
const root = createRoot(document.getElementById("root")!);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
\`\`\`

> **避坑**：\`BrowserRouter\` 必须包在"最外层"，否则内部组件调用 \`useNavigate\` 等钩子会报错 \`useRoutes() may be used only in the context of a <Router> component\`。

如果你部署到子路径（如 \`https://example.com/my-app/\`），用 \`basename\` 指定：

\`\`\`tsx
<BrowserRouter basename="/my-app">
  <App />
</BrowserRouter>
\`\`\`

## 3. Routes / Route：声明路由表

\`Routes\` 是路由表的容器，\`Route\` 是单条路由。\`path\` 匹配 URL，\`element\` 是命中后渲染的组件。

\`\`\`tsx
// App.tsx
import { Routes, Route } from "react-router-dom";

function Home() {
  return <div>首页</div>;
}
function About() {
  return <div>关于我们</div>;
}

function App() {
  return (
    // Routes 会遍历所有 Route，找到第一个匹配的渲染
    <Routes>
      {/* path="/" 匹配根路径 */}
      <Route path="/" element={<Home />} />
      {/* path="/about" 匹配 /about */}
      <Route path="/about" element={<About />} />
      {/* path="*" 匹配所有未命中的 URL —— 兜底 404 */}
      <Route path="*" element={<div>404 - 页面不存在</div>} />
    </Routes>
  );
}

export default App;
\`\`\`

**和 v5 的关键差异**：v6 用 \`element={<Component />}\`（传 JSX），v5 用 \`component={Component}\`（传组件类型）。v6 这样设计是为了能在路由上直接传 props，更灵活。

## 4. Link：声明式导航

不要用 \`<a href="/about">\` 跳转——它会触发整页刷新，丢失所有 React 状态。用 \`<Link>\` 走客户端路由，无刷新跳转：

\`\`\`tsx
import { Link } from "react-router-dom";

function Nav() {
  return (
    <nav>
      {/* to 是目标路径，渲染成 <a href="..."> 但点击不刷新 */}
      <Link to="/">首页</Link>
      {" | "}
      <Link to="/about">关于</Link>
    </nav>
  );
}
\`\`\`

\`Link\` 还支持状态传递，用于"带着数据跳转"：

\`\`\`tsx
<Link
  to="/detail"
  // state 不会出现在 URL，但目标页能通过 useLocation 拿到
  state={{ from: "nav", referrer: "homepage" }}
>
  查看详情
</Link>
\`\`\`

## 5. useNavigate：编程式导航

需要"点了按钮再跳"或"提交成功后跳转"时，用 \`useNavigate\`。

\`\`\`tsx
import { useNavigate } from "react-router-dom";

function LoginButton() {
  const navigate = useNavigate(); // 拿到导航函数

  const handleLogin = async () => {
    // await api.login(...)
    // 登录成功后跳到 /dashboard
    navigate("/dashboard");

    // 也可以替换历史记录（用户点后退回不到登录页）
    // navigate("/dashboard", { replace: true });

    // 还可以前进/后退：navigate(-1) 后退一步，navigate(1) 前进一步
  };

  return <button onClick={handleLogin}>登录</button>;
}
\`\`\`

> **避坑**：\`navigate\` 函数在组件每次渲染都会拿到新实例（参考稳定性），但调用结果一致。直接在事件处理器里用即可，不必 \`useCallback\`。

## 6. useParams：读取动态参数

URL 里的动态段（如 \`/users/123\` 的 \`123\`）通过 \`:id\` 声明，用 \`useParams\` 读取。

\`\`\`tsx
import { useParams } from "react-router-dom";

// 路由声明：<Route path="/users/:id" element={<UserDetail />} />
function UserDetail() {
  // useParams 返回对象 { id?: string }
  // 注意：参数值永远是 string，即使 URL 里是 123
  const { id } = useParams();

  // TS 不知道 id 一定存在（类型是 string | undefined）
  // 因为路由匹配成功 id 才会有值，但 TS 没法推断这个保证
  if (!id) {
    return <div>缺少用户 ID</div>;
  }

  return <div>用户 ID：{id}</div>;
}
\`\`\`

如果想让类型更安全，可以包一层 hook：

\`\`\`tsx
import { useParams } from "react-router-dom";

// 强制断言 id 存在的版本：适用于"路由肯定能匹配到 id"的场景
function useUserId(): string {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("路由配置错误：缺少 :id 参数");
  return id;
}

function UserDetail() {
  const id = useUserId(); // 这里 id 一定是 string
  return <div>用户 ID：{id}</div>;
}
\`\`\`

## 7. useLocation：拿到当前 URL 全部信息

\`useLocation\` 返回当前 URL 的完整对象，包括 \`pathname\`、\`search\`、\`hash\`、\`state\`。

\`\`\`tsx
import { useLocation } from "react-router-dom";

function DebugLocation() {
  const location = useLocation();
  // location 类型：{ pathname, search, hash, state, key }
  // pathname：路径部分 "/users/123"
  // search：查询字符串 "?tab=friends"
  // hash：锚点 "#section-2"
  // state：Link 传过来的状态对象
  return (
    <pre>
      {JSON.stringify(
        {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
        null,
        2
      )}
    </pre>
  );
}
\`\`\`

**典型用途**：解析 query 参数。RR v6 不再内置 \`useQuery\`（避免和 React Query 命名冲突），解析 \`?tab=friends\` 用 \`URLSearchParams\`：

\`\`\`tsx
import { useLocation } from "react-router-dom";

function useQueryParam(key: string): string | null {
  const location = useLocation();
  // URLSearchParams 是浏览器原生 API，解析 ?key=value
  const params = new URLSearchParams(location.search);
  return params.get(key);
}

function TabPage() {
  const tab = useQueryParam("tab"); // 拿到 "friends" 或 null
  return <div>当前 Tab：{tab ?? "默认"}</div>;
}
\`\`\`

## 8. loader / action：RR 6.4+ 的 Data API

6.4 引入的 Data API 让路由表承担"取数据"和"提交数据"职责。这需要把 \`BrowserRouter\` 换成 \`createBrowserRouter\` + \`RouterProvider\`。

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { createRoot } from "react-dom/client";

// 1. 定义 loader：路由进入前先取数据
//    返回值会通过 useLoaderData() 暴露给组件
async function userLoader({ params }: { params: { id?: string } }) {
  // params.id 来自路由 :id 段
  const res = await fetch(\`/api/users/\${params.id}\`);
  if (!res.ok) throw new Error("用户不存在");
  return res.json() as Promise<{ id: string; name: string }>;
}

function UserPage() {
  // useLoaderData 拿到 loader 返回的数据
  // 注意：TS 5.4+ 才能从 loader 返回类型自动推断，老版本需要手动泛型
  const user = useLoaderData() as { id: string; name: string };
  return <div>{user.name}（ID: {user.id}）</div>;
}

// 2. 用 createBrowserRouter 创建路由器（替代 <BrowserRouter>）
const router = createBrowserRouter([
  {
    path: "/users/:id",
    element: <UserPage />,
    loader: userLoader, // 进入这个路由前先执行
    errorElement: <div>出错了</div>, // 这个路由抛错时显示
  },
]);

// 3. 用 RouterProvider 渲染
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
\`\`\`

\`action\` 用来处理表单提交（POST 请求）：

\`\`\`tsx
import { createBrowserRouter, RouterProvider, Form, useActionData } from "react-router-dom";

// action 处理表单提交
async function loginAction({ request }: { request: Request }) {
  // request.formData() 拿到表单数据
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    // 返回的错误会通过 useActionData 暴露给表单组件
    return { error: "用户名或密码错误" };
  }
  return { user: await res.json() };
}

function LoginPage() {
  // 拿到 action 的返回值
  const data = useActionData() as { error?: string } | undefined;
  return (
    // <Form> 是 RR 提供的增强 form，提交时走 action 而不是整页刷新
    <Form method="post">
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">登录</button>
      {data?.error && <div style={{ color: "red" }}>{data.error}</div>}
    </Form>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, action: loginAction },
]);
\`\`\`

Data API 的好处：**数据获取和路由绑定**，组件渲染前数据就准备好了，避免了"先渲染骨架屏再 fetch"的瀑布问题。

## 9. 综合示例：一个最小博客路由

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  useLoaderData,
} from "react-router-dom";

// 类型：博客文章
interface Post {
  id: string;
  title: string;
  body: string;
}

// 列表 loader：取所有文章
async function postsLoader() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json() as Promise<Post[]>;
}

// 详情 loader：取单篇文章
async function postLoader({ params }: { params: { id: string } }) {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/posts/\${params.id}\`);
  return res.json() as Promise<Post>;
}

function PostList() {
  const posts = useLoaderData() as Post[];
  return (
    <ul>
      {posts.slice(0, 10).map(p => (
        <li key={p.id}>
          <Link to={\`/posts/\${p.id}\`}>{p.title}</Link>
        </li>
      ))}
    </ul>
  );
}

function PostDetail() {
  const post = useLoaderData() as Post;
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <Link to="/">← 返回列表</Link>
    </article>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <PostList />, loader: postsLoader },
  { path: "/posts/:id", element: <PostDetail />, loader: postLoader },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
\`\`\`

## 小结

- \`BrowserRouter\` 是路由容器，包在最外层；部署到子路径用 \`basename\`。
- \`Routes\`/\`Route\` 声明路由表，\`element\` 接收 JSX。
- 用 \`<Link>\` 跳转，避免 \`<a>\` 触发整页刷新；\`useNavigate\` 用于编程式导航。
- \`useParams\` 读动态参数（值永远是 \`string\`），\`useLocation\` 拿完整 URL 信息。
- RR 6.4+ 的 \`createBrowserRouter\` + \`loader\`/\`action\` 让路由承担数据职责。

## 避坑清单

- ❌ 在 \`BrowserRouter\` 外部调用 \`useNavigate\`（会报错找不到 Router context）
- ❌ 用 \`<a href>\` 替代 \`<Link>\`（会触发整页刷新，丢失状态）
- ❌ 直接断言 \`useParams()\` 的值一定存在（应先判空，避免路由配错时崩溃）
- ❌ 用 \`BrowserRouter\` 同时又想用 \`loader\`/\`action\`（Data API 必须用 \`createBrowserRouter\`）
- ❌ 部署到子路径忘记配 \`basename\`（导致所有路由 404）

下一章我们看"动态路由与嵌套"——真实应用里 URL 通常是多层嵌套的。`
  },

  // ============================================================
  // ch63: 动态路由与嵌套
  // ============================================================
  {
    id: "tsx3-ch63",
    group: "第九部分 路由",
    icon: "🪆",
    title: "ch63 动态路由与嵌套",
    content: `# ch63 动态路由与嵌套

## 为什么讲这个

真实应用的 URL 很少是扁平的。\`/users/123/posts/456\` 这种多层嵌套结构才是常态——它表达了"用户 123 的第 456 篇文章"这种层级关系。

React Router v6 用 **动态参数 \`:id\`** + **嵌套 \`Route\`** + **\`Outlet\`** + **\`index\` 路由** 来组织这种层级。这一章把这四个概念一次讲透，并对比绝对路径与相对路径的坑。

## 1. 动态参数 :id

动态参数用 \`:\` 前缀声明，匹配 URL 中对应位置的任意值：

\`\`\`tsx
import { Routes, Route, useParams } from "react-router-dom";

// 路由声明
<Routes>
  {/* :id 是动态段，匹配 /users/任意值 */}
  <Route path="/users/:id" element={<UserPage />} />
</Routes>;

function UserPage() {
  // useParams 拿到 { id: "123" }
  const { id } = useParams<{ id: string }>();
  // id 类型是 string | undefined，要判空
  if (!id) return <div>无效的 URL</div>;
  return <div>用户 ID：{id}</div>;
}
\`\`\`

**多个动态段也支持**：

\`\`\`tsx
<Route
  path="/users/:userId/posts/:postId"
  element={<UserPost />}
/>

function UserPost() {
  // 同时拿到 userId 和 postId
  const { userId, postId } = useParams<{
    userId: string;
    postId: string;
  }>();
  return <div>用户 {userId} 的文章 {postId}</div>;
}
\`\`\`

**可选段**用 \`?\` 后缀（RR 6.6+）：

\`\`\`tsx
// /users 和 /users/123 都能匹配
<Route path="/users/:id?" element={<Users />} />
\`\`\`

## 2. 嵌套布局 Outlet

当多个页面共享同一套布局（侧边栏、顶部导航）时，用嵌套 \`Route\` + \`<Outlet />\`：

\`\`\`tsx
import { Routes, Route, Outlet, Link } from "react-router-dom";

// 布局组件：渲染共享 UI，内部用 <Outlet /> 留给子路由
function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <aside>
        <nav>
          <Link to="/admin/users">用户管理</Link>
          {" | "}
          <Link to="/admin/settings">系统设置</Link>
        </nav>
      </aside>
      <main>
        {/* Outlet 是占位符，子路由的组件渲染在这里 */}
        <Outlet />
      </main>
    </div>
  );
}

function Users() {
  return <div>用户列表</div>;
}
function Settings() {
  return <div>系统设置</div>;
}

// 嵌套路由：父路由 element 渲染布局，子路由渲染到 Outlet
<Routes>
  <Route path="/admin" element={<AdminLayout />}>
    {/* 子路由 path 是相对的，自动拼成 /admin/users */}
    <Route path="users" element={<Users />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
\`\`\`

**关键点**：父路由的 \`element\` 里必须有 \`<Outlet />\`，否则子路由的内容无处渲染。

## 3. index 路由

访问 \`/admin\`（不拼子路径）时，父路由会匹配，但 \`<Outlet />\` 是空的。这时用 \`index\` 路由填这个"空位"：

\`\`\`tsx
<Route path="/admin" element={<AdminLayout />}>
  {/* index 路由：当 URL 恰好是父路径时渲染 */}
  <Route index element={<div>欢迎来到后台</div>} />
  <Route path="users" element={<Users />} />
  <Route path="settings" element={<Settings />} />
</Route>
\`\`\`

> \`index\` 路由**不能有 \`path\`**——它的"路径"就是父路径本身。

## 4. 绝对路径与相对路径

RR v6 子路由默认用**相对路径**（不带开头的 \`/\`）：

\`\`\`tsx
<Route path="/admin" element={<AdminLayout />}>
  {/* 相对路径：自动拼接成 /admin/users */}
  <Route path="users" element={<Users />} />
  {/* 等价于绝对路径写法 */}
  <Route path="/admin/users" element={<Users />} />
</Route>
\`\`\`

\`<Link>\` 的 \`to\` 也支持相对路径，会基于当前路由计算：

\`\`\`tsx
function AdminLayout() {
  return (
    <div>
      <Link to="users">用户</Link>
      {/* 当前 URL 是 /admin，点击后跳到 /admin/users */}
      <Link to="../">返回上级</Link>
      {/* .. 表示上一级，从 /admin/users 跳回 /admin */}
      <Outlet />
    </div>
  );
}
\`\`\`

**避坑**：相对路径基于"当前渲染的路由"，而不是 URL 字符串。在 \`AdminLayout\` 里写 \`to="users"\` 会基于 \`/admin\` 计算；如果在 \`Users\` 组件里写 \`to="users"\`，会基于 \`/admin/users\` 计算出 \`/admin/users/users\`（错误！）。

不确定时用绝对路径更安全：

\`\`\`tsx
<Link to="/admin/users">用户</Link>
\`\`\`

## 5. NavLink 激活状态

导航栏里"当前页"通常需要高亮。用 \`<NavLink>\` 替代 \`<Link>\`，它会自动加 \`active\` 类名：

\`\`\`tsx
import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <nav>
      {/* 当 URL 匹配 to 时，<a> 会带上 className="active" */}
      <NavLink to="/admin/users">用户</NavLink>
      {/* 自定义激活时的 className */}
      <NavLink
        to="/admin/settings"
        className={({ isActive }) =>
          isActive ? "nav-link nav-link-active" : "nav-link"
        }
      >
        设置
      </NavLink>
    </nav>
  );
}
\`\`\`

\`className\` 和 \`style\` 都支持函数形式，参数 \`{ isActive, isPending }\`：

- \`isActive\`：当前 URL 是否匹配
- \`isPending\`：过渡态（用了 \`loader\` 时，数据还在加载）

\`\`\`tsx
<NavLink
  to="/admin/users"
  style={({ isActive }) => ({
    color: isActive ? "red" : "black",
    fontWeight: isActive ? "bold" : "normal",
  })}
>
  用户
</NavLink>
\`\`\`

**\`end\` 属性**：默认 \`NavLink\` 的匹配是"前缀匹配"——\`to="/admin"\` 在 \`/admin/users\` 时也算激活。加 \`end\` 后只在完全匹配时激活：

\`\`\`tsx
<NavLink to="/admin" end>
  后台首页
</NavLink>
\`\`\`

## 6. 嵌套路由的类型安全参数

\`useParams\` 默认返回 \`Record<string, string | undefined>\`，类型很弱。我们可以为每条路由定义专用 hook：

\`\`\`tsx
import { useParams } from "react-router-dom";

// 为 /users/:userId/posts/:postId 定义专用 hook
interface UserPostParams {
  userId: string;
  postId: string;
}

function useUserPostParams(): UserPostParams {
  const { userId, postId } = useParams<UserPostParams>();
  // 路由匹配成功，这两个值一定存在
  // 但 TS 不知道，所以要运行时校验
  if (!userId || !postId) {
    throw new Error("路由配置错误：缺少 :userId 或 :postId");
  }
  return { userId, postId };
}

function UserPost() {
  const { userId, postId } = useUserPostParams();
  // 这里 userId 和 postId 都是 string，类型安全
  return <div>用户 {userId} 的文章 {postId}</div>;
}
\`\`\`

这种"专用 hook + 运行时校验"模式在大型项目里能避免大量 \`string | undefined\` 判空。

## 7. 嵌套 loader 与父路由数据共享

嵌套路由的 \`loader\` 各自独立执行，但可以通过 \`useRouteLoaderData\` 共享：

\`\`\`tsx
import {
  createBrowserRouter,
  RouterProvider,
  useRouteLoaderData,
  Outlet,
} from "react-router-dom";

// 父路由 loader：取用户信息
async function userLoader({ params }: { params: { userId?: string } }) {
  const res = await fetch(\`/api/users/\${params.userId}\`);
  return res.json() as Promise<{ id: string; name: string }>;
}

function UserLayout() {
  // 用 useRouteLoaderData 拿"指定路由 id"的数据
  // 这里 "user-root" 是父路由的 id（见下方路由配置）
  const user = useRouteLoaderData("user-root") as { id: string; name: string };
  return (
    <div>
      <h1>{user.name} 的空间</h1>
      <Outlet />
    </div>
  );
}

// 子路由能直接复用父路由的 loader 数据，不必重新 fetch
function UserPostList() {
  const user = useRouteLoaderData("user-root") as { id: string; name: string };
  return <div>展示 {user.name} 的所有文章</div>;
}

const router = createBrowserRouter([
  {
    id: "user-root", // 给路由起个 id，方便子组件引用
    path: "/users/:userId",
    element: <UserLayout />,
    loader: userLoader,
    children: [
      { index: true, element: <UserPostList /> },
      // 子路由不再需要自己的 user loader
    ],
  },
]);
\`\`\`

## 小结

- 动态参数用 \`:id\` 声明，\`useParams\` 读取（值是 \`string\`，要判空）。
- 嵌套 \`Route\` 配合 \`<Outlet />\` 实现共享布局，父路由必须放 \`Outlet\`。
- \`index\` 路由用于填充父路径的默认内容，不能有 \`path\`。
- 相对路径基于"当前渲染的路由"计算，不确定就用绝对路径。
- \`NavLink\` 自动加 \`active\` 类，\`end\` 控制是否完全匹配。

## 避坑清单

- ❌ 父路由 \`element\` 忘记写 \`<Outlet />\`（子路由不渲染，但不报错）
- ❌ \`index\` 路由写了 \`path\`（语法错误，\`index\` 不能有 \`path\`）
- ❌ 在深层组件里用相对路径 \`to="users"\`（会基于当前路由错误拼接）
- ❌ 用 \`<Link>\` 做"当前页高亮"（应该用 \`<NavLink>\`）
- ❌ \`NavLink\` 不加 \`end\` 导致前缀匹配误判激活（首页链接在所有子页都高亮）

下一章我们看"路由守卫与权限"——后台系统必备的登录校验。`
  },

  // ============================================================
  // ch64: 路由守卫与权限
  // ============================================================
  {
    id: "tsx3-ch64",
    group: "第九部分 路由",
    icon: "🔒",
    title: "ch64 路由守卫与权限",
    content: `# ch64 路由守卫与权限

## 为什么讲这个

后台管理系统 90% 都需要登录校验、角色权限控制。Vue Router 提供了 \`beforeEach\` 全局守卫，但 React Router v6 **没有等价 API**——它推崇"用组件包装实现守卫"。

这一章我们用 React Context + 包装组件，搭一套类型安全的路由守卫：未登录跳登录页、无权限跳 403、登录后回跳原页面、按角色细粒度控制。

## 1. Auth Context：先建立登录态

守卫的前提是"知道用户是否登录"。用 Context 把登录态全局暴露：

\`\`\`tsx
import { createContext, useContext, useState, ReactNode } from "react";

// 用户类型
interface User {
  id: string;
  name: string;
  roles: UserRole[]; // 一个用户可能有多个角色
}

// 角色用字面量联合类型，比 enum 更轻量
type UserRole = "admin" | "editor" | "viewer";

// Auth 上下文值类型
interface AuthContextValue {
  user: User | null; // null 表示未登录
  login: (user: User) => void;
  logout: () => void;
}

// createContext 默认值给 undefined，方便检测"忘了包 Provider"
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 hook：使用 auth context
function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return ctx;
}

export { AuthProvider, useAuth, type User, type UserRole };
\`\`\`

把 \`AuthProvider\` 包在 \`RouterProvider\` 外面（或里面都行，只要在守卫组件之前）：

\`\`\`tsx
import { AuthProvider } from "./auth";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
\`\`\`

## 2. ProtectedRoute：受保护路由组件

守卫的核心是"包装组件"——它检查登录态，决定渲染子组件还是跳转。

\`\`\`tsx
import { Navigate, useLocation, ReactNode } from "react-router-dom";
import { useAuth } from "./auth";

interface ProtectedRouteProps {
  children: ReactNode; // 被保护的内容
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // 未登录：重定向到 /login，并把当前路径记下来
  if (!user) {
    return (
      <Navigate
        to="/login"
        // state 传当前路径，登录后能跳回来
        state={{ from: location.pathname }}
        // replace 替换历史记录，避免用户点后退又回到受保护页
        replace
      />
    );
  }

  // 已登录：正常渲染子组件
  return <>{children}</>;
}
\`\`\`

在路由表里使用：

\`\`\`tsx
import { Routes, Route } from "react-router-dom";

function Dashboard() {
  return <div>仪表盘（需要登录）</div>;
}

<Routes>
  <Route path="/login" element={<LoginPage />} />
  {/* 用 ProtectedRoute 包裹需要登录的路由 */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
\`\`\`

## 3. 重定向逻辑：登录后回跳

登录页拿到 \`from\` 状态，登录成功后跳回去：

\`\`\`tsx
import { useNavigate, useLocation, Form, useActionData } from "react-router-dom";
import { useAuth } from "./auth";

interface LoginFormState {
  from?: string; // 来自 ProtectedRoute 传过来的 state
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const actionData = useActionData() as { user?: any; error?: string } | undefined;

  // 从 location.state 拿到登录前想去的路径
  const from = (location.state as LoginFormState | null)?.from ?? "/";

  // 如果 action 返回了 user，说明登录成功
  if (actionData?.user) {
    login(actionData.user);
    // 跳回原页面，replace 避免后退回到登录页
    navigate(from, { replace: true });
  }

  return (
    <Form method="post">
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">登录</button>
      {actionData?.error && <div style={{ color: "red" }}>{actionData.error}</div>}
    </Form>
  );
}
\`\`\`

> **避坑**：不要在渲染过程中直接 \`navigate\`，会触发警告。正确做法是放到 \`useEffect\` 里，或在事件回调中触发。上面例子用了"action 返回值变化触发重渲染，下次渲染时检查并跳转"的模式。

## 4. 角色权限：基于 RBAC 的细粒度控制

光"登录"还不够，还要"角色匹配"。扩展 \`ProtectedRoute\` 支持角色校验：

\`\`\`tsx
import { Navigate, useLocation, ReactNode } from "react-router-dom";
import { useAuth, UserRole } from "./auth";

interface ProtectedRouteProps {
  children: ReactNode;
  // allowedRoles 不传：只校验登录；传了：校验角色
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  // 第一道关：未登录 → 跳登录页
  if (!user) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  // 第二道关：登录了但角色不够 → 跳 403
  if (allowedRoles && !allowedRoles.some(r => user.roles.includes(r))) {
    return <Navigate to="/403" replace />;
  }

  // 都通过：渲染子组件
  return <>{children}</>;
}
\`\`\`

使用：

\`\`\`tsx
<Routes>
  {/* 普通登录就能访问 */}
  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />
  {/* 只有 admin 能访问 */}
  <Route
    path="/admin/users"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminUsers />
      </ProtectedRoute>
    }
  />
  {/* admin 或 editor 都能访问 */}
  <Route
    path="/posts/edit"
    element={
      <ProtectedRoute allowedRoles={["admin", "editor"]}>
        <EditPost />
      </ProtectedRoute>
    }
  />
</Routes>
\`\`\`

## 5. 路由元数据 meta：声明所需权限

每条路由都写 \`<ProtectedRoute allowedRoles={...}>\` 太啰嗦。更优雅的做法是把权限信息放进路由的 \`handle\` 字段（RR v6 提供的"自定义元数据"通道）：

\`\`\`tsx
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

// 路由元数据类型：声明这个路由需要什么权限
interface RouteMeta {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

// 读取当前路由元数据的 hook
function useRouteMeta(): RouteMeta | undefined {
  // matches 数组的最后一个就是当前匹配的路由
  // handle 字段是我们在路由表里配的对象
  const matches = useMatches() as Array<{ handle?: RouteMeta }>;
  const current = matches[matches.length - 1];
  return current?.handle;
}

// 用一个布局组件统一做权限校验
function AuthGuardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const meta = useRouteMeta();

  // 需要登录但未登录
  if (meta?.requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 需要特定角色但用户没有
  if (meta?.allowedRoles && user) {
    const hasRole = meta.allowedRoles.some(r => user.roles.includes(r));
    if (!hasRole) return <Navigate to="/403" replace />;
  }

  // 通过：渲染子路由
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <AuthGuardLayout />, // 根布局做权限校验
    children: [
      { path: "/", element: <Home />, handle: {} }, // 公开
      {
        path: "/profile",
        element: <Profile />,
        // 通过 handle 声明权限要求
        handle: { requireAuth: true } satisfies RouteMeta,
      },
      {
        path: "/admin",
        element: <Admin />,
        handle: {
          requireAuth: true,
          allowedRoles: ["admin"],
        } satisfies RouteMeta,
      },
    ],
  },
]);
\`\`\`

> \`handle\` 是 RR v6 给路由"挂自定义数据"的官方通道，配合 \`useMatches()\` 可以拿到。用 \`satisfies RouteMeta\` 既能获得类型检查，又不丢失字面量类型推断。

## 6. 综合示例：完整的受保护路由

\`\`\`tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  useMatches,
  Link,
} from "react-router-dom";

// === 类型定义 ===
type UserRole = "admin" | "editor" | "viewer";

interface User {
  id: string;
  name: string;
  roles: UserRole[];
}

interface AuthContextValue {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
}

interface RouteMeta {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

// === Auth Context ===
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <AuthContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

// === 路由守卫布局 ===
function useRouteMeta(): RouteMeta | undefined {
  const matches = useMatches() as Array<{ handle?: RouteMeta }>;
  return matches[matches.length - 1]?.handle;
}

function AuthGuardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const meta = useRouteMeta();

  if (meta?.requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (meta?.allowedRoles && user) {
    if (!meta.allowedRoles.some(r => user.roles.includes(r))) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
}

// === 页面组件 ===
function Home() {
  return <div>首页（公开）</div>;
}

function Profile() {
  const { user } = useAuth();
  return <div>用户资料：{user?.name}</div>;
}

function Admin() {
  return <div>仅 admin 可见</div>;
}

function Login() {
  const { login } = useAuth();
  return (
    <button
      onClick={() =>
        login({ id: "1", name: "Alice", roles: ["admin", "editor"] })
      }
    >
      模拟登录
    </button>
  );
}

function Forbidden() {
  return <div>403 - 无权访问</div>;
}

// === 路由表 ===
const router = createBrowserRouter([
  {
    element: <AuthGuardLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      {
        path: "/profile",
        element: <Profile />,
        handle: { requireAuth: true } satisfies RouteMeta,
      },
      {
        path: "/admin",
        element: <Admin />,
        handle: {
          requireAuth: true,
          allowedRoles: ["admin"],
        } satisfies RouteMeta,
      },
      { path: "/403", element: <Forbidden /> },
      { path: "*", element: <div>404</div> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
\`\`\`

## 小结

- RR v6 没有全局守卫，用"包装组件"或"布局组件 + Outlet"实现。
- 用 \`AuthContext\` 维护登录态，\`useAuth\` hook 暴露给组件。
- \`ProtectedRoute\` 校验登录和角色，未通过用 \`<Navigate>\` 重定向。
- 登录页用 \`location.state.from\` 实现"登录后回跳"。
- 用路由 \`handle\` 字段声明权限元数据，配合 \`useMatches()\` 读取。

## 避坑清单

- ❌ 在渲染过程中直接调用 \`navigate()\`（应放 \`useEffect\` 或事件回调）
- ❌ 重定向不用 \`replace\`（用户点后退又回到受保护页，再被重定向，死循环）
- ❌ 角色判断用 \`user.roles.includes(r)\` 不加 \`some\`（应该判断"任一角色匹配"）
- ❌ 把权限逻辑硬编码在每条 \`Route\` 上（应该抽 \`handle\` 元数据 + 统一布局）
- ❌ \`AuthContext\` 默认值给 \`null\` 而不是 \`undefined\`（无法区分"未提供 Provider"和"未登录"）

下一章我们对比 React Router 与 Next.js App Router——理解两套路由思路的差异。`
  },

  // ============================================================
  // ch65: Next.js App Router 对比
  // ============================================================
  {
    id: "tsx3-ch65",
    group: "第九部分 路由",
    icon: "🔀",
    title: "ch65 Next.js App Router 对比",
    content: `# ch65 Next.js App Router 对比

## 为什么讲这个

前两章我们用的 React Router v6 是"纯客户端路由"——所有组件都在浏览器里渲染，路由表用 JS 对象声明。

Next.js 13.4 之后稳定推出的 **App Router** 是完全不同的思路：**文件系统路由 + 服务端优先**。你写的组件默认在服务端渲染，需要交互的组件才显式声明为 client 组件。

如果你只在 Vite + RR 项目里待过，初见 App Router 会非常反直觉。这一章把两者的核心差异讲清，让你能在两套方案间快速切换。

## 1. app 目录结构：文件即路由

App Router 用文件夹和文件名表达路由——不再写路由表：

\`\`\`
app/
├── layout.tsx       # 根布局（必须存在）
├── page.tsx         # 首页（对应 /）
├── about/
│   └── page.tsx     # /about
├── users/
│   ├── page.tsx     # /users（列表）
│   └── [id]/
│       └── page.tsx # /users/123（动态参数）
└── posts/
    └── [slug]/
        └── page.tsx # /posts/hello-world
\`\`\`

**核心约定**：

- \`page.tsx\`：路由对应的页面组件（必须存在，否则该路径 404）
- \`layout.tsx\`：包裹子路由的布局（会嵌套渲染）
- \`loading.tsx\`：加载时的 UI
- \`error.tsx\`：报错时的 UI
- \`[id]\`：方括号表示动态参数（对应 RR 的 \`:id\`）
- \`[slug]\`：方括号里的名字是参数名，可任意取

## 2. layout 与 page：嵌套布局的另一种实现

RR v6 用 \`<Outlet />\` 表达"子路由渲染位置"；App Router 用 \`children\` prop：

\`\`\`tsx
// app/layout.tsx —— 根布局
import { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav>顶部导航（所有页面共享）</nav>
        {/* children 就是子路由的 page.tsx 渲染结果 */}
        {children}
      </body>
    </html>
  );
}
\`\`\`

\`\`\`tsx
// app/users/layout.tsx —— users 区块的布局
import { ReactNode } from "react";

export default function UsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex" }}>
      <aside>用户侧边栏</aside>
      <main>{children}</main>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// app/users/page.tsx —— /users 列表页
export default function UsersPage() {
  return <div>用户列表</div>;
}

// app/users/[id]/page.tsx —— /users/123 详情页
// params 是动态参数（Next.js 15+ 是 Promise，需 await）
export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 15 起需要 await
  return <div>用户 ID：{id}</div>;
}
\`\`\`

**对比 RR v6**：

| 概念 | RR v6 | App Router |
| --- | --- | --- |
| 路由声明 | JS 对象 \`<Route>\` | 文件夹 + 文件名 |
| 嵌套布局 | \`<Outlet />\` | \`children\` prop |
| 动态参数 | \`path="/users/:id"\` | 文件夹 \`[id]\` |
| 默认布局 | 父路由 \`element\` | \`layout.tsx\` |

## 3. Server Component vs Client Component

App Router 里组件默认是 **Server Component**（服务端组件）——它们在服务器上渲染，不会被打包到客户端 JS。

需要交互（\`useState\`、\`onClick\` 等）时，必须显式声明为 **Client Component**：

\`\`\`tsx
// app/components/Counter.tsx
"use client"; // ← 这行告诉 Next.js：这是客户端组件

import { useState } from "react";

export default function Counter() {
  // useState 只能在 client 组件里用
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      点击 {count} 次
    </button>
  );
}
\`\`\`

Server Component 可以直接 \`await\` 异步操作，无需 \`useEffect\`：

\`\`\`tsx
// app/users/page.tsx
// 没有 "use client"，默认是 Server Component
interface User {
  id: string;
  name: string;
}

export default async function UsersPage() {
  // 直接在组件里 await fetch —— 这是 Server Component 独有能力
  const res = await fetch("https://api.example.com/users");
  const users = (await res.json()) as User[];

  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

**对比 RR v6**：RR v6 里所有组件都在客户端运行，取数据要么用 \`useEffect\` + \`useState\`，要么用 \`loader\`。App Router 默认服务端渲染，对 SEO 和首屏速度都更友好。

**核心规则**：

- Server Component 不能用 \`useState\`、\`onClick\`、\`useEffect\` 等
- Client Component 可以用所有 React 特性
- Server Component 可以**导入并渲染** Client Component
- Client Component **不能直接导入** Server Component（但可以把 Server Component 作为 \`children\` 传入）

## 4. loading / error：内置的加载与错误边界

RR v6 需要自己写 \`Suspense\` 和 \`ErrorBoundary\`；App Router 用约定的文件名自动处理：

\`\`\`tsx
// app/users/loading.tsx
// 当 users 下的 page.tsx 还在 await 数据时，显示这个
export default function Loading() {
  return <div>加载中...</div>;
}
\`\`\`

\`\`\`tsx
// app/users/error.tsx
// "use client" 是必须的 —— error boundary 必须是客户端组件
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void; // 调用后会重试渲染
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>出错了：{error.message}</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// app/not-found.tsx —— 全局 404 页面
export default function NotFound() {
  return <div>页面不存在</div>;
}
\`\`\`

这套约定让"加载中""出错了""找不到页面"这些常见 UI 不需要任何配置就自动生效。

## 5. 导航：Link 与 useRouter

App Router 的 \`Link\` 来自 \`next/link\`（不是 \`react-router-dom\`）：

\`\`\`tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      {/* href 等价于 RR 的 to */}
      <Link href="/">首页</Link>
      <Link href="/users/123">用户 123</Link>
    </nav>
  );
}
\`\`\`

编程式导航用 \`useRouter\`（注意：客户端组件才能用）：

\`\`\`tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LoginButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogin = async () => {
    // await api.login(...)
    // 登录成功后跳转
    // router.push 不会触发整页刷新
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  return (
    <button onClick={handleLogin} disabled={isPending}>
      {isPending ? "跳转中..." : "登录"}
    </button>
  );
}
\`\`\`

> **避坑**：App Router 的 \`useRouter\` 来自 \`next/navigation\`，不是 \`next/router\`（那是老的 Pages Router 用的）。

## 6. 数据获取：直接 await vs loader

RR v6 用 \`loader\` 函数取数据；App Router 在 Server Component 里直接 \`await\`：

\`\`\`tsx
// RR v6 写法
async function userLoader({ params }: { params: { id: string } }) {
  const res = await fetch(\`/api/users/\${params.id}\`);
  return res.json();
}

function UserPage() {
  const user = useLoaderData();
  return <div>{user.name}</div>;
}

// App Router 写法
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 直接在组件里 fetch，服务端执行
  const res = await fetch(\`https://api.example.com/users/\${id}\`);
  const user = (await res.json()) as { name: string };
  return <div>{user.name}</div>;
}
\`\`\`

App Router 还有更高级的数据获取方案：

- **Server Actions**：在 Server Component 里直接定义 \`async function\`，前端表单提交时调用
- **缓存策略**：\`fetch\` 第二参可以配 \`cache: "no-store"\`（动态）、\`next: { revalidate: 60 }\`（ISR）

\`\`\`tsx
// 每 60 秒重新生成一次（ISR）
const res = await fetch("https://api.example.com/users", {
  next: { revalidate: 60 },
});
\`\`\`

## 7. 与 RR v6 的核心差异对照

| 维度 | React Router v6 | Next.js App Router |
| --- | --- | --- |
| 路由声明 | JS 对象（\`<Route>\`） | 文件系统（文件夹+文件名） |
| 渲染位置 | 全部客户端 | 默认服务端，需要交互才转 client |
| 数据获取 | \`loader\` 函数或 \`useEffect\` | Server Component 直接 \`await\` |
| 布局嵌套 | \`<Outlet />\` | \`children\` prop |
| 加载态 | \`Suspense\` 或手动 \`useState\` | \`loading.tsx\` 约定文件 |
| 错误边界 | \`ErrorBoundary\` 组件 | \`error.tsx\` 约定文件 |
| 动态参数 | \`/users/:id\` | 文件夹 \`[id]\` |
| 导航 | \`<Link to>\` / \`useNavigate\` | \`<Link href>\` / \`useRouter().push\` |
| 适用场景 | SPA、内网后台、强交互应用 | 内容站、SEO 敏感、SSR/SSG |

## 8. 怎么选

**用 RR v6**：

- 内部管理系统、不需要 SEO
- 已经用 Vite + React，不想换框架
- 极致交互体验（如在线编辑器、设计工具）
- 部署在静态 CDN 上，没有 Node 服务端

**用 Next.js App Router**：

- 需要 SEO（博客、电商、内容站）
- 想要服务端渲染加速首屏
- 需要 ISR（增量静态生成）
- 团队接受得了"约定大于配置"的思路

## 9. 综合示例：用 App Router 写一个用户列表页

\`\`\`tsx
// app/users/page.tsx
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
}

// Server Component：直接 await fetch
export default async function UsersPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = (await res.json()) as User[];

  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.slice(0, 10).map(u => (
          <li key={u.id}>
            <Link href={\`/users/\${u.id}\`}>
              {u.name}（{u.email}）
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// app/users/[id]/page.tsx
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
  const user = (await res.json()) as User;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>邮箱：{user.email}</p>
      <p>电话：{user.phone}</p>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// app/users/[id]/loading.tsx
export default function Loading() {
  return <div>加载用户信息中...</div>;
}
\`\`\`

\`\`\`tsx
// app/users/[id]/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>加载失败：{error.message}</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
\`\`\`

## 小结

- App Router 用**文件系统**表达路由，\`page.tsx\` 是页面、\`layout.tsx\` 是布局。
- 组件默认是 **Server Component**，需要交互才加 \`"use client"\`。
- Server Component 可以直接 \`await\` 取数据，无需 \`useEffect\`。
- \`loading.tsx\` / \`error.tsx\` / \`not-found.tsx\` 是约定文件，自动生效。
- RR v6 适合 SPA 和内网后台，App Router 适合 SEO 和 SSR 场景。

## 避坑清单

- ❌ 在 Server Component 里用 \`useState\`（必须加 \`"use client"\`）
- ❌ 用 \`next/router\` 的 \`useRouter\`（App Router 应该用 \`next/navigation\`）
- ❌ Client Component 直接 import Server Component（应该通过 \`children\` 传入）
- ❌ \`error.tsx\` 忘记加 \`"use client"\`（Error Boundary 必须是客户端组件）
- ❌ 在 \`page.tsx\` 里写非默认导出的组件（路由只认 \`default export\`）
- ❌ 动态参数不 \`await\`（Next.js 15+ 起 \`params\` 是 \`Promise\`）

到这里，第九部分路由就讲完了。下一部分我们看"样式方案"——CSS Modules、Tailwind、styled-components 怎么和 TS+React 配合。`
  },
];

export { chapters };
