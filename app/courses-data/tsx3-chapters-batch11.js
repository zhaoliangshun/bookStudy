// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十一批章节
// -------------------------------------------------------------
// 覆盖：第七部分 数据请求
// 包含 6 个章节：ch51 ~ ch56
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 所有 demo 都贴近真实业务场景，能直接迁移到项目
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch51: fetch 与类型设计
  // ============================================================
  {
    id: "tsx3-ch51",
    group: "第七部分 数据请求",
    icon: "🌐",
    title: "ch51 fetch 与类型设计",
    content: `# ch51 fetch 与类型设计

## 为什么从 fetch 讲起

\`fetch\` 是浏览器原生提供的请求 API，不需要任何依赖。它比 axios 更轻量，比 XMLHttpRequest 更现代，是 React 18 + Next.js 时代推荐的数据请求方式。但 \`fetch\` 的类型设计有几个坑——\`Response.json()\` 默认返回 \`any\`，必须自己标注类型；请求错误不会自动 throw，需要手动判断 \`ok\`。这一章把 fetch 的类型设计一次讲透。

## 1. fetch 的基本用法与类型

\`\`\`ts
// fetch 的签名（简化版）：
// function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
//   - input：URL 字符串或 Request 对象
//   - init：可选配置（method、headers、body 等）
//   - 返回 Promise<Response>，注意 Response 不是 JSON，是流式响应对象

// 最简单的 GET 请求
const res = await fetch("/api/users");
// res 是 Response 对象，不能直接用，需要 .json() / .text() / .blob()

const data = await res.json();
// ⚠️ 坑：data 默认是 any 类型！TS 没法知道服务端返回什么
console.log(data);
\`\`\`

**第一个坑**：\`res.json()\` 返回 \`Promise<any>\`，TS 完全帮不上忙。你需要手动给类型。

## 2. 给 JSON 响应标注类型

\`\`\`ts
// 定义服务端返回的数据类型
interface User {
  id: number;
  name: string;
  email: string;
}

// 用泛型断言：告诉 TS res.json() 返回的是 User
const res = await fetch("/api/users/1");
const user = (await res.json()) as User;
//    ^^^ 类型是 User，不再是 any

console.log(user.name); // ✅ 有类型提示
\`\`\`

但 \`as User\` 是"强转"，TS 不会检查实际数据是否真的符合 \`User\`。**更安全的做法是用运行时校验**（第 4 节会讲）。

## 3. 封装类型安全的 fetch

每次都写 \`as User\` 太啰嗦。封装一个泛型函数：

\`\`\`ts
// 泛型请求函数：T 是返回数据的类型
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  // 必须手动判断 res.ok，fetch 不会因 4xx/5xx 自动 throw
  if (!res.ok) {
    // 把错误信息抛出去，调用方能 catch 到
    throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  }
  // 用 as T 断言：调用方负责提供正确的类型
  return (await res.json()) as T;
}

// 使用：传入类型参数 <User>，返回值就是 User
const user = await fetchJSON<User>("/api/users/1");
console.log(user.name); // ✅ 类型安全
\`\`\`

这个封装看起来简单，但解决了三个痛点：
1. \`res.json()\` 的 \`any\` 被泛型 \`T\` 替代。
2. \`res.ok\` 判断被内置，调用方不用每次都写。
3. 错误被统一 \`throw\`，外层可以用 \`try/catch\` 或 \`Promise.catch\` 处理。

## 4. 加上运行时校验（更安全）

\`as T\` 只是"假设"，服务端返回的数据可能不符合类型。用 Zod 做运行时校验：

\`\`\`ts
import { z } from "zod";

// 定义 schema：既是运行时校验器，也能推出类型
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// 从 schema 推导出类型，避免重复定义
type User = z.infer<typeof UserSchema>;

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const raw = await res.json(); // any
  // 用 schema 校验：不符合会 throw，符合则返回带类型的数据
  return UserSchema.parse(raw);
}

const user = await fetchUser(1);
console.log(user.email); // ✅ 既是类型安全，也是运行时安全
\`\`\`

**生产环境强烈推荐这种写法**——服务端字段改名、加字段、删字段时，你的代码会立刻报错，而不是静默返回 \`undefined\`。

## 5. AbortController 取消请求

长请求组件卸载后还在跑，会造成"内存泄漏 + 状态更新已卸载组件"的警告。用 \`AbortController\` 取消：

\`\`\`tsx
import { useEffect, useState } from "react";

// 一个会自动取消的请求 Hook
function useUser(id: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 每次请求都创建一个 controller
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        // 把 controller.signal 传给 fetch
        const res = await fetch(\`/api/users/\${id}\`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        setUser((await res.json()) as User);
      } catch (e) {
        // 被取消的请求会 throw AbortError，这里要忽略
        if (e instanceof Error && e.name === "AbortError") {
          return; // 静默退出
        }
        throw e;
      } finally {
        setLoading(false);
      }
    })();

    // 组件卸载或 id 变化时，取消正在进行的请求
    return () => controller.abort();
  }, [id]);

  return { user, loading };
}

// 组件卸载时，正在进行的 fetch 会被取消，不会 setState 已卸载的组件
\`\`\`

**关键点**：
- \`controller.signal\` 必须传给 \`fetch\`，\`fetch\` 才能取消。
- 取消时 \`fetch\` 会 \`throw\` 一个 \`name === "AbortError"\` 的错误，必须 catch 并忽略。
- Cleanup 函数返回 \`controller.abort()\`，组件卸载时自动触发。

## 6. POST / PUT / DELETE 请求

\`\`\`ts
// POST：提交数据
async function createUser(data: Omit<User, "id">): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // 必须声明，否则服务端拿不到 body
    },
    // body 必须是字符串，用 JSON.stringify 序列化
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return (await res.json()) as User;
}

// PUT：更新数据
async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return (await res.json()) as User;
}

// DELETE：删除
async function deleteUser(id: number): Promise<void> {
  const res = await fetch(\`/api/users/\${id}\`, { method: "DELETE" });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  // 没有返回体，直接 return
}
\`\`\`

## 7. React 组件 demo：用户列表

\`\`\`tsx
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

// 用户列表组件：演示 fetch + 类型设计 + 加载/错误状态
function UserList() {
  // 三态：数据、加载中、错误
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users", { signal: controller.signal });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        setUsers((await res.json()) as User[]);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "未知错误");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // 三态渲染
  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了：{error}</div>;

  return (
    <ul>
      {users.map(u => (
        <li key={u.id}>{u.name} ({u.email})</li>
      ))}
    </ul>
  );
}
\`\`\`

## 小结

- \`fetch\` 是浏览器原生 API，但 \`res.json()\` 默认返回 \`any\`，必须手动给类型。
- 封装泛型 \`fetchJSON<T>\` 解决重复 \`as\` 问题，内置 \`res.ok\` 判断和 \`throw\`。
- 生产环境用 Zod 做运行时校验，避免服务端数据结构变化导致静默 bug。
- 用 \`AbortController\` 取消请求，防止组件卸载后还在 setState。

## 避坑清单

- ❌ 直接用 \`res.json()\` 不给类型（默认 \`any\`，等于没类型）
- ❌ 忘记判断 \`res.ok\`（4xx/5xx 不会自动 throw，会当成功处理）
- ❌ \`as T\` 后不校验真实数据（应该用 Zod 等做运行时校验）
- ❌ 组件卸载不取消请求（应该用 \`AbortController\` + cleanup）

下一章我们看 axios——它比 fetch 多了拦截器、超时、自动 JSON 转换等能力，是中后台项目的常客。`
  },

  // ============================================================
  // ch52: axios 封装与拦截器
  // ============================================================
  {
    id: "tsx3-ch52",
    group: "第七部分 数据请求",
    icon: "📡",
    title: "ch52 axios 封装与拦截器",
    content: `# ch52 axios 封装与拦截器

## 为什么还要学 axios

\`fetch\` 够用了，为什么还要 axios？因为 axios 自带四个 fetch 缺的能力：

1. **拦截器**：所有请求自动加 token，所有响应自动统一错误处理。
2. **超时控制**：\`timeout: 5000\` 一行搞定，fetch 要用 AbortController 手写。
3. **自动 JSON 转换**：响应自动 \`JSON.parse\`，请求自动 \`JSON.stringify\`。
4. **错误自动 throw**：4xx/5xx 直接进 catch，不用手动判断 \`ok\`。

中后台项目几乎都用 axios，因为它能把"重复的样板代码"抽到拦截器里。

## 1. 安装与基础用法

\`\`\`bash
npm install axios
\`\`\`

\`\`\`ts
import axios from "axios";

// 基础 GET
const res = await axios.get("/api/users/1");
// res.data 已经是反序列化后的对象（axios 自动 JSON.parse）
console.log(res.data.name);

// 注意：axios 把响应包在 AxiosResponse 里，真实数据在 .data
// res 的类型是 AxiosResponse<any>，res.data 是 any
\`\`\`

**axios 的类型默认也是 \`any\`**，需要用泛型给类型：

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
}

// 传入 <User> 泛型，res.data 就是 User 类型
const res = await axios.get<User>("/api/users/1");
console.log(res.data.name); // ✅ 有类型
\`\`\`

## 2. 创建 axios 实例

不要直接用全局 \`axios\`，应该创建实例，配置 baseURL、超时等：

\`\`\`ts
import axios, { AxiosInstance } from "axios";

// 创建实例：所有请求都基于这个配置
const http: AxiosInstance = axios.create({
  baseURL: "https://api.example.com", // 所有路径前面都加这个
  timeout: 10000,                     // 10 秒超时
  headers: {
    "Content-Type": "application/json",
  },
});

// 使用：路径可以是相对路径，会自动拼上 baseURL
const res = await http.get<User>("/users/1");
// 实际请求 URL：https://api.example.com/users/1
\`\`\`

**为什么用实例**：项目里可能有多个后端（业务 API + 文件服务），每个实例配不同 baseURL，互不干扰。

## 3. 请求拦截器：自动注入 token

\`\`\`ts
// 请求拦截器：每个请求发出前都会经过这里
http.interceptors.request.use(
  (config) => {
    // 从 localStorage 取 token
    const token = localStorage.getItem("token");
    if (token) {
      // 注入到 Authorization 头
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config; // 必须 return，否则请求不发出去
  },
  (error) => {
    // 请求发送失败时（如网络断了）会进这里
    return Promise.reject(error);
  }
);
\`\`\`

这样所有用 \`http\` 发的请求都会自动带 token，业务代码完全不用关心鉴权。

## 4. 响应拦截器：统一错误处理

\`\`\`ts
import { AxiosError } from "axios";

// 响应拦截器：每个响应回来都会经过这里
http.interceptors.response.use(
  (response) => {
    // 2xx 状态码进这里
    // 可以在这里统一处理业务码，比如后端返回 { code: 0, data: ... }
    return response;
  },
  (error: AxiosError<{ message: string }>) => {
    // 非 2xx 状态码进这里
    // AxiosError 的 response 里有详细信息
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未授权：清 token 跳登录
          localStorage.removeItem("token");
          window.location.href = "/login";
          break;
        case 403:
          alert("无权限访问");
          break;
        case 500:
          alert("服务器异常：" + (data?.message ?? "未知"));
          break;
      }
    } else if (error.code === "ECONNABORTED") {
      // 超时
      alert("请求超时");
    } else {
      // 网络错误
      alert("网络异常");
    }
    // 继续抛出，让调用方也能 catch
    return Promise.reject(error);
  }
);
\`\`\`

**关键点**：
- 拦截器里 \`return Promise.reject(error)\` 让错误继续传递，业务层还能 \`catch\`。
- 用 \`AxiosError<T>\` 给错误加类型，\`error.response.data\` 就有类型了。

## 5. 响应数据泛型：剥掉外层包装

后端常返回 \`{ code: 0, message: "ok", data: T }\` 这种结构。每次取 \`res.data.data\` 太丑，封装一下：

\`\`\`ts
// 后端统一响应结构
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 封装一个"剥皮"函数：自动取 data 字段
async function request<T>(config: Parameters<AxiosInstance["request"]>[0]): Promise<T> {
  // 注意：这里泛型要传给 axios 的第二个类型参数
  // axios.get<T, ApiResponse<T>>(...) 的第一个 T 是 data 类型，第二个是 response 类型
  const res = await http.request<ApiResponse<T>>(config);
  // 检查业务码
  if (res.data.code !== 0) {
    throw new Error(res.data.message);
  }
  return res.data.data; // 直接返回剥皮后的数据
}

// 使用：返回值就是 User，不用再 .data.data
const user = await request<User>({ url: "/users/1", method: "GET" });
console.log(user.name); // ✅ 类型是 User
\`\`\`

## 6. POST / PUT / DELETE

\`\`\`ts
// POST：第二个参数就是 body，axios 自动序列化
const newUser = await request<User>({
  url: "/users",
  method: "POST",
  data: { name: "Alice", email: "a@x.com" },
});

// PUT
const updated = await request<User>({
  url: "/users/1",
  method: "PUT",
  data: { name: "Bob" },
});

// DELETE
await request<void>({ url: "/users/1", method: "DELETE" });
\`\`\`

## 7. React 组件 demo：带拦截器的登录页

\`\`\`tsx
import { useState } from "react";

// 登录请求的入参和返回
interface LoginPayload {
  username: string;
  password: string;
}
interface LoginResult {
  token: string;
  user: { id: number; name: string };
}

function LoginPage() {
  const [form, setForm] = useState<LoginPayload>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 调用 request 函数，拦截器会自动处理后续请求的 token
      const result = await request<LoginResult>({
        url: "/auth/login",
        method: "POST",
        data: form,
      });
      // 存 token，请求拦截器会自动取
      localStorage.setItem("token", result.token);
      alert(\`欢迎 \${result.user.name}\`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        placeholder="用户名"
      />
      <input
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        placeholder="密码"
      />
      <button type="submit" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
\`\`\`

## 小结

- axios 比 fetch 多了拦截器、超时、自动 JSON 转换、4xx/5xx 自动 throw。
- 用 \`axios.create\` 创建实例，配置 baseURL、timeout、headers。
- 请求拦截器自动注入 token，响应拦截器统一处理 401/403/500 等错误。
- 封装 \`request<T>\` 函数剥掉 \`{ code, data }\` 外层包装，让业务代码更干净。

## 避坑清单

- ❌ 直接用全局 \`axios\` 而不创建实例（应该用 \`axios.create\` 隔离配置）
- ❌ 拦截器里 \`return error\` 而不是 \`Promise.reject(error)\`（错误会被吞掉）
- ❌ 不给 axios 泛型，\`res.data\` 就是 \`any\`（应该传 \`<User>\`）
- ❌ 业务码错误不 throw（应该在拦截器或封装函数里检查 \`code\`）

下一章我们看 SWR——Vercel 出的数据请求库，自带缓存、重新验证、乐观更新，比手写 fetch 简洁太多。`
  },

  // ============================================================
  // ch53: SWR 实战
  // ============================================================
  {
    id: "tsx3-ch53",
    group: "第七部分 数据请求",
    icon: "🔄",
    title: "ch53 SWR 实战",
    content: `# ch53 SWR 实战

## 为什么用 SWR

上一章我们手写 \`useEffect + fetch + useState\` 的请求模式，每次都要写一堆样板：loading、error、AbortController、cleanup。SWR（Stale-While-Revalidate）把这些都封装好了，还附带：

1. **自动缓存**：相同 key 的请求只发一次，组件多处复用。
2. **自动重新验证**：窗口聚焦、网络恢复时自动刷新。
3. **mutate 乐观更新**：UI 先更新，请求成功后确认，失败回滚。
4. **错误重试**：内置 retry，不用手写。

SWR 是 Vercel 出品，和 Next.js 同源，是轻量级数据请求库的首选。

## 1. 安装与基础用法

\`\`\`bash
npm install swr
\`\`\`

\`\`\`tsx
import useSWR from "swr";

interface User {
  id: number;
  name: string;
  email: string;
}

// fetcher 函数：SWR 把 key 传给 fetcher，返回 Promise
const fetcher = async (url: string): Promise<User> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
};

function UserProfile({ id }: { id: number }) {
  // useSWR<返回类型, 错误类型>(key, fetcher, options)
  // key 是字符串（或数组），相同 key 共享缓存
  const { data, error, isLoading } = useSWR<User>(
    \`/api/users/\${id}\`,
    fetcher
  );

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>出错了：{error.message}</div>;
  // 此处 data 一定存在（非 undefined），TS 会窄化
  return <div>{data.name} - {data.email}</div>;
}
\`\`\`

**对比手写 \`useEffect\`**：
- 不用 \`useState\` 三态。
- 不用 \`AbortController\`（SWR 内置取消）。
- 不用 cleanup。
- 自动缓存：同一个 \`/api/users/1\` 多处使用只发一次请求。

## 2. key 设计：字符串 vs 数组

key 不只是字符串，可以是数组，常用于带参数的请求：

\`\`\`ts
// 字符串 key
useSWR("/api/users", fetcher);

// 数组 key：可以带任意参数，参数变化会重新请求
useSWR(["/api/users", { page: 1, limit: 10 }], fetcher);
// fetcher 收到的是 ["api/users", { page: 1, limit: 10 }] 整个数组

// fetcher 要适配数组 key
const fetcher = async ([url, params]: [string, { page: number; limit: number }]) => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(\`\${url}?\${query}\`);
  return res.json();
};
\`\`\`

**数组 key 的好处**：参数变化时 SWR 自动浅比较，不同则重新请求，比手拼字符串更安全。

## 3. 全局配置：SWRConfig

把 fetcher、超时等配置提到全局，业务代码更干净：

\`\`\`tsx
import { SWRConfig } from "swr";

// 全局 fetcher
const globalFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
};

function App() {
  return (
    <SWRConfig
      value={{
        fetcher: globalFetcher,
        revalidateOnFocus: false,   // 失焦不重新验证
        dedupingInterval: 2000,     // 2 秒内相同 key 去重
        errorRetryCount: 3,         // 错误重试 3 次
      }}
    >
      <UserProfile id={1} />
      <UserList />
    </SWRConfig>
  );
}

// 业务组件里可以不传 fetcher，用全局的
function UserList() {
  const { data } = useSWR<User[]>("/api/users");
  // 不用写 fetcher，从 SWRConfig 继承
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

## 4. mutate：手动重新验证

数据更新后要刷新缓存，用 \`mutate\`：

\`\`\`tsx
import useSWR, { useSWRConfig } from "swr";

function UserList() {
  const { data, mutate } = useSWR<User[]>("/api/users");

  async function handleRefresh() {
    // 不传参数：重新请求一次，刷新缓存
    await mutate();
  }

  // 全局 mutate：在组件外也能用
  const { mutate: globalMutate } = useSWRConfig();
  async function refreshFromElsewhere() {
    await globalMutate("/api/users");
  }

  return (
    <div>
      <button onClick={handleRefresh}>刷新</button>
      <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
    </div>
  );
}
\`\`\`

## 5. 乐观更新：先改 UI 再请求

用户点"删除"后，UI 应该立刻消失，而不是等请求回来。乐观更新：

\`\`\`tsx
function UserList() {
  const { data, mutate } = useSWR<User[]>("/api/users");

  async function handleDelete(id: number) {
    // 1. 乐观更新：先改缓存，UI 立刻刷新
    //    第二个参数是更新函数，返回新数据
    //    第三个参数 false 表示"不重新请求"，用本地数据
    const previous = data;
    mutate(
      (current) => current?.filter(u => u.id !== id),
      { revalidate: false }
    );

    try {
      // 2. 真正发请求
      await fetch(\`/api/users/\${id}\`, { method: "DELETE" });
      // 3. 成功：什么都不用做，缓存已经是新的
    } catch (e) {
      // 4. 失败：回滚到之前的数据
      mutate(previous, { revalidate: false });
      alert("删除失败");
    }
  }

  return (
    <ul>
      {data?.map(u => (
        <li key={u.id}>
          {u.name}
          <button onClick={() => handleDelete(u.id)}>删除</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

**关键点**：\`mutate\` 的第二个参数 \`{ revalidate: false }\` 表示"用我给的数据，别重新请求"。请求失败时回滚到 \`previous\`。

## 6. 错误重试与条件请求

\`\`\`tsx
function User({ id }: { id: number | null }) {
  // 条件请求：id 为 null 时不请求
  // key 传 null 表示"不请求"
  const { data } = useSWR<User>(
    id ? \`/api/users/\${id}\` : null,
    fetcher,
    {
      // 错误重试 5 次，默认是无限重试
      errorRetryCount: 5,
      // 自定义重试间隔：第 n 次重试等待 n * 1000 ms
      errorRetryInterval: (count) => count * 1000,
      // 5 秒后数据标记为 stale，下次访问会重新验证
      dedupingInterval: 5000,
    }
  );
  return <div>{data?.name ?? "未加载"}</div>;
}
\`\`\`

**条件请求的常见场景**：
- 用户没登录时 key 传 \`null\`，不请求。
- 表单还没填完时 key 传 \`null\`，不提交。

## 7. SSR 配合：fallback 数据

Next.js SSR 场景下，首屏数据要服务端取好，传给 SWR 当 fallback：

\`\`\`tsx
import { SWRConfig } from "swr";

// Next.js 服务端组件（伪代码）
export async function getServerSideProps() {
  const user = await fetchUserFromDB(1);
  return {
    props: {
      fallback: {
        "/api/users/1": user, // 服务端取的数据
      },
    },
  };
}

// 客户端组件
function Page({ fallback }: { fallback: Record<string, unknown> }) {
  return (
    <SWRConfig value={{ fallback }}>
      <UserProfile id={1} />
      {/* UserProfile 第一次渲染时直接用 fallback 数据，不会闪 loading */}
    </SWRConfig>
  );
}
\`\`\`

## 小结

- SWR 自带缓存、去重、重试、自动重新验证，比手写 \`useEffect\` 简洁太多。
- key 可以是字符串或数组，数组 key 更适合带参数的请求。
- 用 \`SWRConfig\` 提全局 fetcher 和配置，业务代码更干净。
- \`mutate\` 手动刷新缓存，配合 \`{ revalidate: false }\` 实现乐观更新。
- SSR 场景用 \`fallback\` 传首屏数据，避免首屏 loading。

## 避坑清单

- ❌ 不给 \`useSWR<T>\` 泛型（data 默认 \`any\`）
- ❌ 用字符串拼参数当 key（应该用数组 key，自动浅比较）
- ❌ 乐观更新不回滚（请求失败要 \`mutate(previous)\` 恢复）
- ❌ 不用 \`fallback\` 导致首屏 loading 闪烁（SSR 数据应该传 fallback）

下一章我们看 TanStack Query——比 SWR 功能更全，适合复杂业务场景。`
  },

  // ============================================================
  // ch54: TanStack Query 全解
  // ============================================================
  {
    id: "tsx3-ch54",
    group: "第七部分 数据请求",
    icon: "⚡",
    title: "ch54 TanStack Query 全解",
    content: `# ch54 TanStack Query 全解

## 为什么还要学 TanStack Query

SWR 够轻量，但如果你需要：
- 复杂的 mutation 管理（创建、更新、删除后自动刷新相关查询）
- 精细的缓存时间控制（staleTime、gcTime）
- select 转换、分页、无限滚动
- DevTools 调试

那 TanStack Query（原名 React Query）更合适。它是企业级 React 应用的"数据请求状态管理库"，比 SWR 功能更全。

## 1. 安装与基础配置

\`\`\`bash
npm install @tanstack/react-query
\`\`\`

\`\`\`tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 创建 client：所有查询的默认配置在这里
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,  // 1 分钟内不重新请求
      gcTime: 5 * 60 * 1000, // 缓存垃圾回收时间 5 分钟（旧版叫 cacheTime）
      retry: 3,               // 失败重试 3 次
      refetchOnWindowFocus: false, // 窗口聚焦不刷新
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );
}
\`\`\`

## 2. useQuery：查询

\`\`\`tsx
import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  name: string;
  email: string;
}

// fetcher：接收 queryKey，返回 Promise
const fetchUser = async (id: number): Promise<User> => {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
};

function UserProfile({ id }: { id: number }) {
  // useQuery({ queryKey, queryFn, ...options })
  // queryKey 必须是数组！这是和 SWR 的最大区别
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["users", id],     // key 是数组，可以包含任意可序列化值
    queryFn: () => fetchUser(id), // 注意：queryFn 不接收 key，自己拿 id
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>出错了：{error.message}</div>;
  return (
    <div>
      {data?.name}
      {isFetching && <span>（后台刷新中...）</span>}
    </div>
  );
}
\`\`\`

**isLoading vs isFetching**：
- \`isLoading\`：第一次加载，还没有缓存数据。
- \`isFetching\`：任何请求中（包括后台刷新）。
- 有缓存数据时后台刷新，\`isLoading\` 是 \`false\`，\`isFetching\` 是 \`true\`。

## 3. queryKey 设计：缓存的灵魂

\`queryKey\` 决定了缓存复用，设计得好能避免重复请求：

\`\`\`ts
// 单层数组：简单查询
useQuery({ queryKey: ["users"], queryFn: fetchUsers });

// 多层：带参数的查询
useQuery({
  queryKey: ["users", "list", { page: 1, limit: 10 }],
  queryFn: () => fetchUsers({ page: 1, limit: 10 }),
});

// 嵌套：详情页
useQuery({
  queryKey: ["users", "detail", id],
  queryFn: () => fetchUser(id),
});

// invalidateQueries 时可以批量失效：
// queryClient.invalidateQueries({ queryKey: ["users"] })
// 会失效所有以 "users" 开头的查询
\`\`\`

**设计原则**：把"层级"放进 key，方便批量失效。比如所有 user 相关查询都以 \`["users", ...]\` 开头。

## 4. staleTime vs gcTime

\`\`\`tsx
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  // staleTime：数据"新鲜"的时间。新鲜期内不会重新请求
  staleTime: 60 * 1000, // 1 分钟内多次访问直接用缓存
  // gcTime：缓存"垃圾回收"的时间。组件卸载后多久删除缓存
  gcTime: 5 * 60 * 1000, // 5 分钟后没组件用就清掉
});

// 区别：
// - staleTime 影响"是否重新请求"（数据可能过期）
// - gcTime 影响"缓存是否存在"（数据可能没了）
\`\`\`

**典型配置**：
- 实时数据（股票、消息）：\`staleTime: 0\`，每次都重新请求。
- 用户信息：\`staleTime: 5 * 60 * 1000\`，5 分钟内不重新请求。
- 几乎不变的数据（配置、字典）：\`staleTime: Infinity\`，永远不重新请求。

## 5. useMutation：变更

\`\`\`tsx
import { useMutation } from "@tanstack/react-query";

// 创建用户的 mutation
const createUser = async (data: Omit<User, "id">): Promise<User> => {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("创建失败");
  return res.json();
};

function CreateUserForm() {
  // useMutation 返回 mutate 函数和状态
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      console.log("创建成功", data);
    },
    onError: (error) => {
      console.error("创建失败", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mutate 触发请求
    mutation.mutate({ name: "Alice", email: "a@x.com" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "创建中..." : "创建用户"}
      </button>
      {mutation.isError && <div>失败：{mutation.error.message}</div>}
    </form>
  );
}
\`\`\`

**注意**：mutation 没有 \`isLoading\`，叫 \`isPending\`（v5 改名了）。

## 6. invalidateQueries：变更后刷新查询

创建用户后要刷新用户列表，这是最经典的场景：

\`\`\`tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // 成功后失效 ["users"] 开头的所有查询
      // 失效后会自动重新请求（如果组件还在用这个查询）
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // ... 表单 JSX
}
\`\`\`

**和 SWR 的区别**：TanStack Query 有 \`queryClient\` 全局管理，能精准失效某一类查询；SWR 要手动调 \`mutate\`。

## 7. 乐观更新

\`\`\`tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function UpdateUser({ user }: { user: User }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newName: string) =>
      fetch(\`/api/users/\${user.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      }).then(res => res.json()),
    // onMutate：请求发出前，先改缓存（乐观更新）
    onMutate: async (newName: string) => {
      // 1. 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: ["users", user.id] });
      // 2. 保存之前的数据，用于回滚
      const previous = queryClient.getQueryData<User>(["users", user.id]);
      // 3. 乐观更新缓存
      queryClient.setQueryData<User>(["users", user.id], {
        ...user,
        name: newName,
      });
      // 4. 返回 context，onError 能拿到
      return { previous };
    },
    // onError：请求失败，回滚
    onError: (_err, _newName, context) => {
      queryClient.setQueryData(["users", user.id], context?.previous);
    },
    // onSettled：不管成功失败，都重新请求一次确认
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users", user.id] });
    },
  });

  return (
    <button onClick={() => mutation.mutate("新名字")}>
      {mutation.isPending ? "更新中..." : "更新"}
    </button>
  );
}
\`\`\`

四步走：取消查询 → 保存旧值 → 乐观更新 → 失败回滚。

## 8. select：转换数据

不想每次都从大对象里取小字段，用 \`select\`：

\`\`\`tsx
interface UserListResponse {
  data: User[];
  total: number;
  page: number;
}

// fetchUsers 返回完整响应：{ data: User[]; total: number; page: number }
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  // select：从原始数据里挑出需要的部分
  // 好处：缓存里存的是完整数据，组件只拿需要的
  select: (response) => response.data.map(u => u.name),
});

// data 类型是 string[]（select 的返回值）
console.log(data); // ["Alice", "Bob"]
\`\`\`

## 9. React 组件 demo：用户管理面板

\`\`\`tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User { id: number; name: string; email: string; }

function UserPanel() {
  const queryClient = useQueryClient();

  // 查询用户列表
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const res = await fetch("/api/users");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(\`/api/users/\${id}\`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) return <div>加载中...</div>;

  return (
    <ul>
      {users?.map(u => (
        <li key={u.id}>
          {u.name} ({u.email})
          <button
            onClick={() => deleteMutation.mutate(u.id)}
            disabled={deleteMutation.isPending}
          >
            删除
          </button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

## 小结

- TanStack Query 适合复杂业务：mutation 管理、精细缓存控制、DevTools 调试。
- \`queryKey\` 是数组，按层级设计方便批量 \`invalidateQueries\`。
- \`staleTime\` 控制新鲜度（是否重新请求），\`gcTime\` 控制缓存清理时机。
- mutation 配合 \`invalidateQueries\` 实现"变更后自动刷新"。
- 乐观更新四步：取消查询 → 保存旧值 → 改缓存 → 失败回滚。

## 避坑清单

- ❌ mutation 用 \`isLoading\`（v5 改名 \`isPending\`）
- ❌ queryKey 不分层级（应该按 \`["users", "detail", id]\` 设计方便失效）
- ❌ 不用 \`select\` 让组件直接拿大对象（应该用 select 转换）
- ❌ 乐观更新不调 \`cancelQueries\`（后台查询回来会覆盖乐观值）

下一章我们看错误处理与重试——fetch / axios / SWR / React Query 都涉及，统一讲透。`
  },

  // ============================================================
  // ch55: 错误处理与重试
  // ============================================================
  {
    id: "tsx3-ch55",
    group: "第七部分 数据请求",
    icon: "🚨",
    title: "ch55 错误处理与重试",
    content: `# ch55 错误处理与重试

## 为什么单独讲错误处理

数据请求失败的代码量往往和成功路径一样多——网络抖动、服务端 500、用户 token 过期、字段校验失败。如果错误处理写得糙，用户会看到莫名其妙的白屏或 "undefined is not a function"。这一章把 React 应用里的错误处理和重试讲透。

## 1. try/catch 的正确姿势

\`\`\`ts
// ❌ 反例：catch 后吞掉错误
async function fetchUser(id: number) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    return await res.json();
  } catch {
    return null; // 错误被吞了，调用方不知道是 null 还是没数据
  }
}

// ✅ 正例：区分"没数据"和"出错"
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) {
    // 把 HTTP 状态码和消息一起抛出
    throw new HttpError(res.status, await res.text());
  }
  return res.json();
}

// 自定义错误类，方便上层判断
class HttpError extends Error {
  constructor(public status: number, public body: string) {
    super(\`HTTP \${status}: \${body}\`);
    this.name = "HttpError";
  }
}
\`\`\`

**关键点**：错误要有"类型"和"上下文"，不要 \`catch (e) { return null }\` 一把梭。

## 2. 区分错误类型

\`\`\`ts
import { AxiosError } from "axios";

async function handleRequest() {
  try {
    await api.get("/users");
  } catch (e) {
    // 用 instanceof 区分错误类型
    if (e instanceof AxiosError) {
      // axios 错误：有 response、code 等字段
      if (e.response?.status === 401) {
        redirectToLogin();
      } else if (e.code === "ECONNABORTED") {
        alert("请求超时");
      } else {
        alert(\`网络错误：\${e.message}\`);
      }
    } else if (e instanceof HttpError) {
      // 自定义 HTTP 错误
      alert(\`服务端错误：\${e.status}\`);
    } else if (e instanceof TypeError) {
      // fetch 的网络错误（DNS 解析失败等）是 TypeError
      alert("网络连接失败");
    } else {
      // 兜底
      alert("未知错误");
    }
  }
}
\`\`\`

## 3. React 错误边界：捕获组件渲染错误

\`try/catch\` 只能捕获同步和 await 的错误，组件渲染时的错误（如 \`data.map\` 时 data 是 undefined）抓不到。React 提供 ErrorBoundary：

\`\`\`tsx
import { Component, ReactNode } from "react";

// ErrorBoundary 必须是 class 组件（React 18 仍未支持函数式）
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null };

  // 静态方法：捕获渲染错误，返回新的 state
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // 实例方法：用于副作用（上报错误日志）
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("组件错误：", error, info);
    // 可以发到 Sentry 等监控平台
  }

  render() {
    if (this.state.hasError) {
      // 降级 UI
      return (
        <div style={{ padding: 20, color: "red" }}>
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 使用：包裹任何可能出错的组件
function App() {
  return (
    <ErrorBoundary>
      <UserList />
    </ErrorBoundary>
  );
}
\`\`\`

**重要限制**：ErrorBoundary **捕获不了**：
- 事件处理函数里的错误（要用 try/catch）。
- 异步代码里的错误（\`setTimeout\`、\`fetch\` 的回调里）。
- 服务端渲染时的错误。

它只捕获**组件渲染阶段**和**生命周期**里的错误。

## 4. React Query 的错误边界配合

React Query 默认不把错误抛给 ErrorBoundary。要让它配合，用 \`throwOnError\`：

\`\`\`tsx
import { useQuery } from "@tanstack/react-query";

function UserList() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    // throwOnError: true 时，错误会 throw 出去
    // 被 ErrorBoundary 捕获，显示降级 UI
    throwOnError: true,
  });

  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

function App() {
  return (
    <ErrorBoundary>
      <UserList />
    </ErrorBoundary>
  );
}
\`\`\`

也可以按错误类型决定是否 throw：

\`\`\`tsx
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  // 只对 401 throw，其他错误自己处理
  throwOnError: (error) => error instanceof HttpError && error.status === 401,
});
\`\`\`

## 5. 重试策略

网络请求失败时自动重试能提升可用性。但要避免"无限重试打死服务端"：

\`\`\`ts
// 手写重试：带指数退避
async function fetchWithRetry(
  url: string,
  options: RequestInit & { retries?: number } = {}
): Promise<Response> {
  const { retries = 3, ...init } = options;
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      // 4xx 不重试（客户端错误，重试也是错）
      if (res.status >= 400 && res.status < 500) {
        throw new HttpError(res.status, await res.text());
      }
      // 5xx 重试
      lastError = new HttpError(res.status, await res.text());
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
    // 指数退避：1s, 2s, 4s
    if (i < retries) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
}
\`\`\`

**重试原则**：
- 只重试 5xx 和网络错误，不重试 4xx。
- 指数退避：每次等待时间翻倍，避免雪崩。
- 限制最大重试次数（3-5 次）。

## 6. SWR / React Query 的内置重试

\`\`\`tsx
// SWR 重试
useSWR("/api/users", fetcher, {
  // 默认重试 4 次，可以改
  errorRetryCount: 3,
  // 自定义重试间隔
  errorRetryInterval: (count) => Math.min(1000 * count, 5000),
  // 不重试 404
  shouldRetryOnError: (err) => {
    if (err instanceof HttpError && err.status === 404) return false;
    return true;
  },
});

// React Query 重试
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  retry: 3, // 数字：重试次数
  // 或函数：根据错误决定重试几次
  retry: (failureCount, error) => {
    if (error instanceof HttpError && error.status === 404) return false;
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
\`\`\`

## 7. 用户提示与降级 UI

错误处理最终要落到"用户看到什么"。三种常见模式：

\`\`\`tsx
// 模式 1：内联提示（适合表单、单组件）
function UserCard({ id }: { id: number }) {
  const { data, error, isLoading } = useSWR(\`/api/users/\${id}\`, fetcher);
  if (isLoading) return <Skeleton />;
  if (error) return <div style={{ color: "red" }}>用户信息加载失败</div>;
  return <div>{data?.name}</div>;
}

// 模式 2：toast 全局提示（适合 mutation）
function DeleteButton({ id }: { id: number }) {
  return (
    <button
      onClick={async () => {
        try {
          await fetch(\`/api/users/\${id}\`, { method: "DELETE" });
          toast.success("删除成功");
        } catch {
          toast.error("删除失败，请重试");
        }
      }}
    >
      删除
    </button>
  );
}

// 模式 3：整页降级 UI（适合页面级错误，配合 ErrorBoundary）
function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>😵 页面崩溃了</h2>
      <p style={{ color: "#999" }}>{error.message}</p>
      <button onClick={resetErrorBoundary}>重新加载</button>
    </div>
  );
}
\`\`\`

## 8. React 组件 demo：完整的错误处理流程

\`\`\`tsx
import { Component, ReactNode } from "react";

// 错误边界
class SafeBoundary extends Component<
  { children: ReactNode; fallback: (error: Error, retry: () => void) => ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, () =>
        this.setState({ error: null })
      );
    }
    return this.props.children;
  }
}

// 业务组件
function UserPage({ id }: { id: number }) {
  // 这里可以是任意会 throw 的逻辑
  if (!id) throw new Error("缺少用户 ID");

  return (
    <SafeBoundary
      fallback={(err, retry) => (
        <div>
          <p>加载用户失败：{err.message}</p>
          <button onClick={retry}>重试</button>
        </div>
      )}
    >
      <div>用户 #{id} 的页面</div>
    </SafeBoundary>
  );
}
\`\`\`

## 小结

- 错误要有类型和上下文（自定义 Error 子类），不要 \`catch { return null }\`。
- ErrorBoundary 捕获**渲染阶段**错误，但捕获不了事件回调和异步代码。
- React Query 用 \`throwOnError\` 把错误抛给 ErrorBoundary。
- 重试要遵循：只重试 5xx 和网络错误、指数退避、限制次数。
- 用户提示分三种：内联（单组件）、toast（mutation）、整页降级（页面级）。

## 避坑清单

- ❌ \`catch { return null }\` 吞掉错误（应该 throw 带上下文的 Error）
- ❌ ErrorBoundary 捕获事件回调里的错误（捕不到，要 try/catch）
- ❌ 4xx 也重试（客户端错误重试无用，应该只重试 5xx 和网络错误）
- ❌ 重试用固定间隔（应该用指数退避，避免雪崩）

下一章我们看 WebSocket——实时通信的场景下，前述 HTTP 模式都不适用。`
  },

  // ============================================================
  // ch56: WebSocket 与实时数据
  // ============================================================
  {
    id: "tsx3-ch56",
    group: "第七部分 数据请求",
    icon: "🔌",
    title: "ch56 WebSocket 与实时数据",
    content: `# ch56 WebSocket 与实时数据

## 为什么需要 WebSocket

前面所有章节都是 HTTP 模式：客户端发请求，服务端返回响应。但聊天、实时股价、协同编辑这类场景需要**服务端主动推送**——客户端没发请求，服务端也能塞数据过来。这时 HTTP 就不够用了，要用 WebSocket。

WebSocket 的特点：
- **全双工**：客户端和服务端都能随时发消息。
- **长连接**：一次握手后保持连接，不用每次重建。
- **低延迟**：相比轮询，没有 HTTP 头开销。

## 1. WebSocket API 基础

\`\`\`ts
// 创建连接
const ws = new WebSocket("ws://localhost:8080");
// 或加密连接 wss://
// const ws = new WebSocket("wss://example.com/socket");

// 四个事件回调
ws.onopen = () => {
  console.log("连接已建立");
  // 发送消息：必须等 onopen 之后才能发
  ws.send(JSON.stringify({ type: "hello", payload: "world" }));
};

ws.onmessage = (event) => {
  // event.data 是收到的消息，可能是 string 或 Blob
  const msg = JSON.parse(event.data as string);
  console.log("收到消息：", msg);
};

ws.onerror = (event) => {
  console.error("连接错误：", event);
};

ws.onclose = (event) => {
  console.log(\`连接关闭：code=\${event.code}, reason=\${event.reason}\`);
};

// 主动关闭
// ws.close(1000, "用户退出");
\`\`\`

**事件顺序**：\`onopen\` → 多次 \`onmessage\` → \`onclose\`。出错时 \`onerror\` 在 \`onclose\` 之前。

## 2. 消息类型联合设计

WebSocket 消息通常是多种类型混在一起，用**标签联合类型**让 TS 帮你区分：

\`\`\`ts
// 定义所有可能的消息类型
type ServerMessage =
  | { type: "chat"; id: string; user: string; text: string; ts: number }
  | { type: "presence"; online: number }
  | { type: "error"; code: number; message: string };

// 客户端发的消息
type ClientMessage =
  | { type: "chat"; text: string }
  | { type: "ping" };

// 类型守卫：判断消息类型
function handleMessage(msg: ServerMessage) {
  switch (msg.type) {
    case "chat":
      // 此处 TS 知道 msg 有 id、user、text、ts 字段
      console.log(\`[\${msg.user}] \${msg.text}\`);
      break;
    case "presence":
      // 此处 msg 有 online 字段
      console.log(\`在线：\${msg.online} 人\`);
      break;
    case "error":
      console.error(\`错误 \${msg.code}：\${msg.message}\`);
      break;
  }
}

// 收到消息后先解析再处理
ws.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data) as ServerMessage;
    handleMessage(msg);
  } catch (e) {
    console.error("消息解析失败", e);
  }
};
\`\`\`

**关键点**：\`type\` 字段是"判别标签"，TS 会根据它窄化类型。这是处理混合消息最安全的方式。

## 3. 封装 useWebSocket Hook

裸用 WebSocket 在 React 里很啰嗦，封装成 Hook：

\`\`\`tsx
import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebSocketOptions {
  onMessage?: (msg: ServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;        // 是否自动重连
  reconnectInterval?: number; // 重连间隔
}

interface UseWebSocketResult {
  send: (msg: ClientMessage) => void;
  isConnected: boolean;
  lastMessage: ServerMessage | null;
}

function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketResult {
  const {
    onMessage,
    onOpen,
    onClose,
    reconnect = true,
    reconnectInterval = 3000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  // 用 ref 存回调，避免 useEffect 重新执行
  const callbacksRef = useRef({ onMessage, onOpen, onClose });
  callbacksRef.current = { onMessage, onOpen, onClose };

  // 重连计时器
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  // 发送消息
  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("WebSocket 未连接，消息已丢弃");
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCancelled) return;
        setIsConnected(true);
        callbacksRef.current.onOpen?.();
      };

      ws.onmessage = (event) => {
        if (isCancelled) return;
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          setLastMessage(msg);
          callbacksRef.current.onMessage?.(msg);
        } catch (e) {
          console.error("消息解析失败", e);
        }
      };

      ws.onclose = () => {
        if (isCancelled) return;
        setIsConnected(false);
        callbacksRef.current.onClose?.();
        // 自动重连
        if (reconnect) {
          reconnectTimer.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket 错误", e);
      };
    }

    connect();

    // 清理：取消订阅、关闭连接、清掉重连计时器
    return () => {
      isCancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [url, reconnect, reconnectInterval]);

  return { send, isConnected, lastMessage };
}
\`\`\`

**几个细节**：
- 回调用 \`useRef\` 存，避免每次重渲染都重连。
- \`isCancelled\` 防止组件卸载后还在 setState。
- 重连计时器在 cleanup 里要清掉，避免内存泄漏。

## 4. 断线重连策略

裸的 \`setTimeout(connect, 3000)\` 太简单，生产环境要更健壮：

\`\`\`tsx
function useWebSocketWithBackoff(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCount.current = 0; // 重置重试计数
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (isCancelled) return;

        // 指数退避：1s, 2s, 4s, 8s... 最多 30s
        const delay = Math.min(1000 * 2 ** retryCount.current, 30000);
        retryCount.current += 1;
        timer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      wsRef.current?.close();
    };
  }, [url]);

  return { isConnected, ws: wsRef };
}
\`\`\`

## 5. 心跳保活

很多代理（Nginx、CDN）会自动断开空闲连接，需要客户端定期发心跳：

\`\`\`ts
function useHeartbeat(ws: WebSocket | null, interval = 30000) {
  useEffect(() => {
    if (!ws) return;

    const timer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // 发一个 ping 消息
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [ws, interval]);
}
\`\`\`

服务端收到 \`ping\` 后回 \`pong\`，长时间没收到 \`pong\` 就主动重连。

## 6. React 组件 demo：实时聊天室

\`\`\`tsx
import { useState } from "react";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  ts: number;
}

function ChatRoom({ room }: { room: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  // 用前面封装的 Hook
  const { send, isConnected } = useWebSocket(\`ws://localhost:8080/\${room}\`, {
    onMessage: (msg) => {
      // 只处理 chat 类型的消息
      if (msg.type === "chat") {
        setMessages(prev => [...prev, {
          id: msg.id,
          user: msg.user,
          text: msg.text,
          ts: msg.ts,
        }]);
      }
    },
  });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    // 发送 chat 消息
    send({ type: "chat", text: input });
    setInput("");
  }

  return (
    <div>
      <div>
        状态：
        <span style={{ color: isConnected ? "green" : "red" }}>
          {isConnected ? "已连接" : "断开中"}
        </span>
      </div>

      <ul style={{ height: 300, overflow: "auto", border: "1px solid #ccc" }}>
        {messages.map(m => (
          <li key={m.id}>
            <strong>{m.user}</strong>: {m.text}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSend}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入消息"
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected || !input.trim()}>
          发送
        </button>
      </form>
    </div>
  );
}
\`\`\`

## 7. WebSocket vs SSE vs 轮询

| 方式 | 双向 | 协议 | 复杂度 | 适用场景 |
| --- | --- | --- | --- | --- |
| 轮询 | 单向（HTTP） | HTTP | 低 | 数据更新频率低（>30s） |
| SSE | 单向（服务端推） | HTTP | 中 | 通知、推送、直播弹幕 |
| WebSocket | 双向 | WS | 高 | 聊天、协同编辑、游戏 |

**选型建议**：
- 只需要服务端推（如通知），用 SSE 更简单。
- 需要双向交互（如聊天），用 WebSocket。
- 数据更新很慢（如配置），用轮询就够了。

## 小结

- WebSocket 适合需要服务端主动推送的场景（聊天、协同、实时数据）。
- 用**标签联合类型**设计消息类型，TS 能根据 \`type\` 字段窄化。
- 封装 \`useWebSocket\` Hook 处理连接、消息、清理，业务代码更干净。
- 断线重连用**指数退避**，避免雪崩；心跳保活防止代理断开空闲连接。
- 选型上：单向推送用 SSE，双向交互用 WebSocket，慢更新用轮询。

## 避坑清单

- ❌ 不处理组件卸载（应该 cleanup 关闭连接、清掉重连计时器）
- ❌ 消息没类型设计（应该用标签联合 + switch 窄化）
- ❌ 重连用固定间隔（应该用指数退避）
- ❌ 不发心跳（应该定期 ping，避免代理断开空闲连接）
- ❌ 单向推送场景用 WebSocket（应该用 SSE 更简单）

至此第七部分数据请求完结。从最基础的 \`fetch\` 到 axios、SWR、TanStack Query、错误处理、WebSocket，你应该能应对 React 应用里几乎所有数据请求场景。下一部分我们进入状态管理——Context、Zustand、Redux Toolkit、Jotai。`
  },
];

export { chapters };
