export const chapters = [
  {
    id: "tsx-fetch",
    group: "实战篇",
    icon: "🌐",
    title: "API 请求类型设计",
    content: `# API 请求类型设计

在前端开发中，"和后端打交道"几乎占据了一半的工作量。TypeScript 最强大的能力之一，就是把 API 请求的类型从"运行时才知道对不对"变成"写代码时编辑器就告诉你对不对"。

本章从最基础的 fetch 类型讲起，一步步构建出一个**生产级**的类型安全请求方案。

---

## 一、最朴素的 fetch：为什么需要类型？

先看不写任何类型时会发生什么：

\`\`\`tsx
async function getUser() {
  const res = await fetch("/api/user/1");
  const data = await res.json();
  // ❌ data 是 any！你完全不知道它有什么字段
  console.log(data.namme); // 拼错了 namme，编辑器不报错！
  return data;
}
\`\`\`

\`res.json()\` 返回的是 \`any\`，这意味着：

- 拼错字段名（\`name\` 写成 \`namme\`）不会有任何提示
- 字段类型不确定（\`age\` 到底是 number 还是 string？）
- 重构时找不到所有引用
- 后端改了字段，前端毫无感知，直到上线崩溃

**类型安全的核心目标**：让 API 返回的数据有明确的类型，拼错字段直接红线。

---

## 二、给 fetch 加上类型

### 1. 定义响应数据类型

第一步永远是：**先定义后端返回的数据结构**。

\`\`\`tsx
// 用户类型
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user" | "guest"; // 字面量联合，角色只能是这三个
};

// 用户列表响应
type UserListResponse = {
  data: User[];
  total: number;
  page: number;
};
\`\`\`

### 2. 手动断言（简单但有风险）

\`\`\`tsx
async function getUser(): Promise<User> {
  const res = await fetch("/api/user/1");
  const data = await res.json();
  return data as User; // ⚠️ 强制断言，运行时不会校验
}

const user = await getUser();
console.log(user.name); // ✅ 有类型提示了
console.log(user.namme); // ❌ 红线：Property 'namme' does not exist
\`\`\`

\`as User\` 解决了编辑器提示问题，但**运行时不会校验**——如果后端返回的字段不对，代码依然会"以为"它是对的。这是大多数项目的起点，够用但不完美。

---

## 三、泛型请求函数：apiRequest&lt;T&gt;

每次都写 \`fetch + json + as\` 太重复了。我们来封装一个**泛型请求函数**：

\`\`\`tsx
// 泛型：T 是"我希望返回的数据类型"
async function apiRequest<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  }

  return res.json() as Promise<T>;
}

// 使用时传入具体类型
const user = await apiRequest<User>("/api/user/1");
//     ^^^^^ 推断为 User

const list = await apiRequest<UserListResponse>("/api/users?page=1");
//     ^^^^ 推断为 UserListResponse
\`\`\`

**泛型 \`<T>\` 的作用**：调用时指定 \`T\` 是什么，函数内部就把返回值当作 \`T\` 处理。一次封装，处处复用，类型自动跟着走。

### 支持配置项的进阶版本

\`\`\`tsx
type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown; // unknown 比 any 更安全，使用前必须收窄
  headers?: Record<string, string>;
};

async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);
  }

  return res.json() as Promise<T>;
}

// POST 请求
const created = await apiRequest<User>("/api/users", {
  method: "POST",
  body: { name: "张三", email: "zs@example.com" }
});
\`\`\`

---

## 四、类型化的错误处理

真实项目里，错误绝不是一句 \`throw new Error\` 能概括的。我们需要**结构化的错误类型**。

### 1. 自定义 ApiError 类

\`\`\`tsx
class ApiError extends Error {
  code: number;        // HTTP 状态码或业务码
  details?: string;    // 额外细节

  constructor(message: string, code: number, details?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

// 在请求函数中抛出结构化错误
async function apiRequest<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message || "请求失败",
      res.status,
      body.details
    );
  }

  return res.json() as Promise<T>;
}
\`\`\`

### 2. 调用方精准捕获

\`\`\`tsx
try {
  const user = await apiRequest<User>("/api/user/1");
} catch (e) {
  // 用 instanceof 收窄类型
  if (e instanceof ApiError) {
    console.error(\`[\${e.code}] \${e.message}\`);
    if (e.code === 401) {
      // 跳转登录
    }
    if (e.code === 404) {
      // 用户不存在
    }
  } else if (e instanceof Error) {
    console.error("网络错误：", e.message);
  }
}
\`\`\`

\`instanceof\` 是处理自定义错误类的标准方式，能让编辑器知道 \`e\` 在分支里具体是什么类型。

---

## 五、判别联合：成功 vs 失败的响应

后端经常返回这样的结构：成功时 \`{ code: 0, data: ... }\`，失败时 \`{ code: 1, msg: "..." }\`。用**判别联合（Discriminated Union）**处理最优雅：

\`\`\`tsx
// 用 success 字段作为"判别式"
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function safeRequest<T>(url: string): Promise<Result<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { success: false, error: \`HTTP \${res.status}\` };
    }
    const data = await res.json() as T;
    return { success: true, data };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "未知错误"
    };
  }
}

// 使用：永远不会忘记处理失败！
const result = await safeRequest<User>("/api/user/1");

if (result.success) {
  // 在这个分支里，result.data 一定是 User
  console.log(result.data.name); // ✅
} else {
  // result.error 一定是 string
  console.log(result.error); // ✅
}
\`\`\`

**判别联合的威力**：检查 \`result.success\` 后，TypeScript 自动收窄类型——成功分支只能访问 \`data\`，失败分支只能访问 \`error\`，**不可能用错**。这比 \`try/catch\` 更强制、更安全。

---

## 六、完整的请求封装：loading / error / data

前端最经典的 UI 状态三元组：\`loading\`、\`error\`、\`data\`。我们来封装一个完整的请求 Hook 模式。

\`\`\`tsx
import { useState, useEffect } from "react";

type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function useRequest<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<RequestState<T>>({ status: "idle" });

  const run = async () => {
    setState({ status: "loading" });
    try {
      const data = await fetcher();
      setState({ status: "success", data });
    } catch (e) {
      setState({
        status: "error",
        error: e instanceof Error ? e.message : "未知错误"
      });
    }
  };

  useEffect(() => {
    run();
  }, []);

  return state;
}

// 使用
function UserList() {
  const state = useRequest(() => apiRequest<User[]>("/api/users"));

  if (state.status === "idle" || state.status === "loading") {
    return <div>加载中...</div>;
  }
  if (state.status === "error") {
    return <div>出错了：{state.error}</div>;
  }
  // 到这里 status 一定是 success，data 一定是 User[]
  return (
    <ul>
      {state.data.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
\`\`\`

把状态也做成判别联合，**渲染时不可能访问到不存在的字段**——这是 TypeScript 给 UI 的最强保障。

---

## 七、useEffect + useState 数据获取模式

最常见的数据获取写法，以及它的**坑**：

\`\`\`tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(\`/api/user/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data as User);
        setLoading(false);
      });
  }, [userId]); // ✅ 依赖 userId，userId 变化时重新请求

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>无数据</div>;
  return <div>{user.name}</div>;
}
\`\`\`

### 三个经典坑

1. **竞态条件**：userId 快速变化时，旧请求可能比新请求晚返回，覆盖了新数据
2. **内存泄漏**：组件卸载后请求才回来，调用 \`setState\` 会报警告
3. **没有清理**：网络请求不会自动取消

---

## 八、AbortController：取消请求

\`AbortController\` 是浏览器原生的请求取消 API，配合 \`fetch\` 使用能解决上面所有问题：

\`\`\`tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 每次请求创建新的 controller
    const controller = new AbortController();

    setLoading(true);
    fetch(\`/api/user/\${userId}\`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setUser(data as User);
        setLoading(false);
      })
      .catch(e => {
        // 2. 取消导致的错误要忽略
        if (e.name === "AbortError") return;
        console.error(e);
      });

    // 3. cleanup：userId 变化或组件卸载时，取消上一个请求
    return () => controller.abort();
  }, [userId]);

  // ...
}
\`\`\`

**关键点**：

- \`controller.signal\` 传给 fetch，请求就和这个 controller 绑定了
- cleanup 里调用 \`controller.abort()\`，未完成的请求会被取消
- 取消会触发 \`catch\`，错误名是 \`"AbortError"\`，需要忽略
- 这样**彻底解决竞态和内存泄漏**

---

## 九、把一切组合起来：生产级模式

最终的完整模式 = **泛型请求 + ApiError + 判别联合状态 + AbortController + 自动重试**。下方 Demo 把这些全部整合：模拟一个用户列表 API，带加载态、错误处理、取消、重试按钮，并且 30% 概率随机失败（方便观察错误处理）。

---

## 本章小结

✅ 先定义响应类型 \`type User = {...}\`，再用 \`as\` 断言或泛型传入
✅ 泛型请求函数 \`apiRequest<T>(url): Promise<T>\` 是复用的核心
✅ 自定义 \`ApiError\` 类 + \`instanceof\` 实现结构化错误处理
✅ 判别联合 \`Result<T>\` 让成功/失败分支不可能用错字段
✅ 状态也用判别联合 \`RequestState<T>\`，渲染时类型绝对安全
✅ \`useEffect\` 数据获取要处理竞态、内存泄漏
✅ \`AbortController\` 是取消请求的标准方案，记得在 cleanup 里调用 \`abort()\`

下一章讲表单与校验！`,
    code: `import React, { useState, useEffect, useRef, useCallback } from "react";

// === 1. 类型定义 ===
type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
};

// === 2. 判别联合 Result<T>：API 响应（成功 / 失败）===
// 💡 提示：判别联合（Discriminated Union）= 多个对象类型共享一个"判别式字段"
//   这里的判别式是 success（字面量类型 true / false）。
//
// 相比 "一个类型塞所有字段" 的写法（如 { data?: T; error?: string }），它的优势：
//   优势 1：状态与数据强绑定。success=true 必有 data，success=false 必有 error，
//           不可能出现 "success=true 却访问 error" 这种错位，TS 编译期就拦下。
//   优势 2：穷尽性检查。switch / if 分支处理时，TS 确保每种情况都被覆盖。
//   优势 3：重构友好。新增一种状态（如 "pending"）后，所有未处理分支立刻报错。
type ApiResponse<T> =
  | { success: true; data: T }          // 成功分支：data 类型由泛型 T 决定
  | { success: false; error: string };  // 失败分支：error 永远是 string

// 自定义错误类
class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

// === 3. 判别联合 RequestState<T>：请求状态机 ===
// 💡 提示：用 status 作为判别式，描述一个请求的完整生命周期：
//   idle（未开始）→ loading（请求中）→ success / error（终态）
//
// 类型收窄演示（这是判别联合最强大的能力）：
//   if (state.status === "success") {
//     // 在这个分支里，state 被收窄为 { status: "success"; data: T }
//     // 所以 state.data 自动可用，且类型就是 T，无需任何断言！
//     console.log(state.data);  // ✅ 类型为 T
//   }
//   if (state.status === "error") {
//     // 这里 state 被收窄为 { status: "error"; error: string }
//     console.log(state.error); // ✅ 类型为 string
//     // console.log(state.data); // ❌ 编译错误：error 分支根本没有 data 字段
//   }
//
// 💡 提示：泛型 <T> 表示"成功时返回的数据类型"。
//   传入 User[] 时，success 分支的 data 就是 User[]；传入 User 时，data 就是 User。
//   一份 RequestState 类型定义，可复用到任意数据类型的请求场景。
type RequestState<T> =
  | { status: "idle" }                  // 初始态：尚未发起请求
  | { status: "loading" }               // 进行态：请求已发出，等待响应
  | { status: "success"; data: T }      // 成功态：data 类型就是泛型 T
  | { status: "error"; error: string }; // 失败态：error 永远是 string

// === 4. 模拟 API（30% 概率失败，方便观察错误处理）===
// 💡 提示：AbortController 是浏览器原生 API，用于"手动取消一个进行中的请求"。
//   工作原理：
//     1. new AbortController() 创建一个控制器，它带有一个 signal 属性。
//     2. 把 controller.signal 传给 fetch / Promise，建立"取消通道"。
//     3. 调用 controller.abort() 后，signal.aborted 变为 true，
//        所有监听 "abort" 事件的回调都会被触发，fetch 会立即 reject。
//
// 取消请求的三个典型时机：
//   ① 组件卸载时（useEffect 的 cleanup）—— 避免对已卸载组件 setState 造成内存泄漏。
//   ② 发起新请求前取消旧请求 —— 解决"竞态"（旧请求晚返回会覆盖新数据）。
//   ③ 用户主动取消（如点击"取消"按钮）。
function mockFetchUsers(signal: AbortSignal): Promise<User[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (Math.random() < 0.3) {
        reject(new ApiError("服务器繁忙，请稍后重试", 500));
        return;
      }
      resolve([
        { id: 1, name: "张三", email: "zhangsan@example.com", role: "admin" },
        { id: 2, name: "李四", email: "lisi@example.com", role: "user" },
        { id: 3, name: "王五", email: "wangwu@example.com", role: "user" },
        { id: 4, name: "赵六", email: "zhaoliu@example.com", role: "guest" },
        { id: 5, name: "孙七", email: "sunqi@example.com", role: "user" }
      ]);
    }, 1200);

    // 监听 abort 事件：一旦外部调用 controller.abort()，就清理定时器并 reject。
    // 💡 提示：clearTimeout 非常关键，否则即使取消了，定时器仍会继续跑并 resolve，
    //   造成"取消后还收到数据"的怪异行为。
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new ApiError("请求已取消", 0)); // code=0 标记"主动取消"，便于上层过滤
    });
  });
}

// === 5. 泛型安全请求封装：返回判别联合 Result<T> ===
// 💡 提示：这个函数把"可能抛异常的 Promise<T>"转换成"绝不抛异常的 Result<T>"。
//   调用方拿到的一定是 { success: true, data } 或 { success: false, error }，
//   不需要 try/catch，靠判别联合的分支就能安全处理 —— 这比 throw 更可控。
//
// 泛型 <T> 的应用：
//   fetcher 返回 Promise<T>，成功时 data 的类型就是 T。
//   传入 () => mockFetchUsers(signal) 时，T 被自动推断为 User[]，
//   于是返回值 Promise<ApiResponse<T>> 也就成了 Promise<ApiResponse<User[]>>，
//   成功分支的 data 自然就是 User[]。
async function safeRequest<T>(
  fetcher: (signal: AbortSignal) => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await fetcher(new AbortController().signal);
    // 💡 提示：走到这里说明成功，返回 success 分支，data 的类型由泛型 T 决定
    return { success: true, data };
  } catch (e) {
    // 💡 提示：捕获所有异常，统一转成 failure 分支，绝不向上抛错
    if (e instanceof ApiError && e.code !== 0) {
      return { success: false, error: e.message };
    }
    return { success: false, error: e instanceof Error ? e.message : "未知错误" };
  }
}

// === 6. 自定义 Hook：useUsers（状态机 + AbortController）===
// 💡 提示：这个 Hook 内部维护一个 RequestState<User[]> 状态机，
//   状态流转：idle → loading → (success | error)。
//   每次 setState 都用对象字面量，TS 会根据 status 字段自动校验 payload 是否合法：
//     传 { status: "loading" } 时不能带 data；
//     传 { status: "success", data } 时 data 必须是 User[]。
function useUsers() {
  const [state, setState] = useState<RequestState<User[]>>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  // console.log 演示：每次渲染都打印当前状态，便于观察状态机流转
  console.log("[useUsers 渲染] 当前 status = " + state.status);

  const fetchData = useCallback(async () => {
    // ① 取消上一个进行中的请求（解决竞态）
    //    💡 提示：如果不取消，旧请求晚返回时会把新数据覆盖掉（经典竞态 bug）
    abortRef.current?.abort();
    console.log("[AbortController] 已取消上一个请求（如有）");

    // ② 新建一个 AbortController，用于本次请求的取消控制
    const controller = new AbortController();
    abortRef.current = controller;

    // ③ 状态机：idle/error → loading
    //    💡 提示：setState 传入 { status: "loading" }，TS 校验通过（loading 分支无额外字段）
    console.log("[状态机] idle/error -> loading");
    setState({ status: "loading" });

    try {
      // ④ 发起请求，把 controller.signal 传进去，随时可被 abort
      const users = await mockFetchUsers(controller.signal);

      // ⑤ 状态机：loading → success
      //    💡 提示：这里 setState 传入 { status: "success", data: users }，
      //    TS 会校验 data 字段的类型必须是 User[]（泛型 T 已绑定为 User[]）
      console.log("[状态机] loading -> success，获取到 " + users.length + " 位用户");
      console.log("[类型收窄] success 分支中，state.data 的类型被收窄为 User[]");
      setState({ status: "success", data: users });
    } catch (e) {
      // ⑥ 忽略"主动取消"产生的错误（code === 0）
      //    💡 提示：主动 abort 触发的 reject 不算"真正的错误"，不应展示给用户
      if (e instanceof ApiError && e.code === 0) {
        console.log("[AbortController] 检测到主动取消（code=0），已忽略该错误，不更新状态");
        return;
      }
      // ⑦ 状态机：loading → error
      //    用字符串拼接构造错误信息（避免使用模板字面量）
      const errorMsg = e instanceof ApiError
        ? "[" + e.code + "] " + e.message
        : "未知错误";
      console.log("[状态机] loading -> error，error = " + errorMsg);
      console.log("[类型收窄] error 分支中，state.error 的类型被收窄为 string");
      setState({ status: "error", error: errorMsg });
    }
  }, []);

  useEffect(() => {
    fetchData();
    // 💡 提示：cleanup 函数在组件卸载时执行，取消进行中的请求，
    //   避免组件卸载后还 setState 触发 React 警告：
    //   "Can't perform a React state update on an unmounted component"
    return () => {
      console.log("[AbortController] 组件卸载，取消进行中的请求");
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { state, retry: fetchData };
}

// ==============================
// 子组件：状态徽章
// ==============================
function Badge({ status }: { status: RequestState<User[]>["status"] }) {
  const config: Record<string, { text: string; bg: string; color: string }> = {
    idle: { text: "空闲", bg: "#e5e7eb", color: "#374151" },
    loading: { text: "加载中", bg: "#dbeafe", color: "#1d4ed8" },
    success: { text: "成功", bg: "#dcfce7", color: "#15803d" },
    error: { text: "失败", bg: "#fee2e2", color: "#b91c1c" }
  };
  const c = config[status];
  return (
    <span style={{
      padding: "2px 10px",
      borderRadius: 12,
      fontSize: 12,
      background: c.bg,
      color: c.color,
      fontWeight: 600
    }}>
      {c.text}
    </span>
  );
}

// ==============================
// 主组件
// ==============================
export default function Demo() {
  const { state, retry } = useUsers();

  const roleColor: Record<User["role"], string> = {
    admin: "#7c3aed",
    user: "#2563eb",
    guest: "#6b7280"
  };

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🌐 用户列表（类型安全请求）</h2>
        <Badge status={state.status} />
      </div>

      {/* 加载态 */}
      {state.status === "idle" || state.status === "loading" ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
          <div>正在请求 /api/users ...</div>
          <div style={{ marginTop: 12, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: "40%", background: "#3b82f6",
              animation: "loading 1s infinite"
            }} />
          </div>
        </div>
      ) : null}

      {/* 错误态：带重试 */}
      {state.status === "error" ? (
        <div style={{
          padding: 24, textAlign: "center",
          border: "1px solid #fecaca", borderRadius: 8, background: "#fef2f2"
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
          <div style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 4 }}>请求失败</div>
          <div style={{ color: "#991b1b", fontSize: 13, marginBottom: 16 }}>{state.error}</div>
          <button
            onClick={retry}
            style={{
              padding: "8px 20px", border: "none", borderRadius: 6,
              background: "#3b82f6", color: "white", cursor: "pointer", fontWeight: 600
            }}
          >
            🔄 重试
          </button>
        </div>
      ) : null}

      {/* 成功态：用户列表 */}
      {state.status === "success" ? (
        <div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            共获取到 {state.data.length} 位用户
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            {state.data.map((u, i) => (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderBottom: i < state.data.length - 1 ? "1px solid #f3f4f6" : "none",
                background: i % 2 === 0 ? "#fafafa" : "white"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: roleColor[u.role], color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14
                }}>
                  {u.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{u.email}</div>
                </div>
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: roleColor[u.role] + "22", color: roleColor[u.role]
                }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={retry}
            style={{
              marginTop: 16, padding: "6px 16px", border: "1px solid #d1d5db",
              borderRadius: 6, background: "white", cursor: "pointer", fontSize: 13
            }}
          >
            🔄 重新请求
          </button>
        </div>
      ) : null}
    </div>
  );
}
`,
  },

  {
    id: "tsx-form",
    group: "实战篇",
    icon: "📝",
    title: "表单与 Zod 校验",
    content: `# 表单与 Zod 校验

表单是前端最复杂的场景之一：用户输入永远不可信，必须校验。传统做法是手写一堆 \`if\`，而 **Zod** 把"校验规则"和"TypeScript 类型"合二为一，是当下最流行的方案。

本章讲解 Zod 的核心思想，并演示如何**手动模拟** Zod 的校验流程（即使项目没装 zod，也能用同样的类型思想）。

---

## 一、为什么需要 Zod？

### 传统校验的痛点

\`\`\`tsx
// 手写类型
type FormData = {
  name: string;
  age: number;
  email: string;
};

// 手写校验：和类型完全是两套东西，容易不同步！
function validate(data: FormData) {
  const errors: Record<string, string> = {};
  if (!data.name || data.name.length < 2) errors.name = "名字太短";
  if (data.age < 0) errors.age = "年龄不能为负";
  if (!data.email.includes("@")) errors.email = "邮箱格式错误";
  return errors;
}
\`\`\`

**问题**：\`FormData\` 类型和 \`validate\` 校验逻辑是**分离**的。改了类型忘记改校验、改了校验忘记改类型——典型的"双重维护"灾难。

### Zod 的核心思想：Single Source of Truth（单一数据源）

Zod 让你**只写一遍 schema**，同时得到：

1. **运行时校验器**（validate 函数）
2. **编译时类型**（TypeScript 类型）

\`\`\`tsx
import { z } from "zod";

// 只写一遍 schema
const schema = z.object({
  name: z.string().min(2, "名字至少 2 个字符"),
  age: z.number().min(0, "年龄不能为负"),
  email: z.string().email("邮箱格式错误")
});

// 类型自动从 schema 推导出来，永远和校验规则同步！
type FormData = z.infer<typeof schema>;
// 等价于 { name: string; age: number; email: string }
\`\`\`

**\`z.infer<typeof schema>\` 是 Zod 的灵魂**：类型从校验规则推导，再也不用维护两份。

---

## 二、Zod 基础 Schema

### 1. 基本类型

\`\`\`tsx
const s = z.string();        // string
const n = z.number();        // number
const b = z.boolean();       // boolean
const d = z.date();          // Date
const arr = z.array(z.string()); // string[]
\`\`\`

### 2. 对象 schema

\`\`\`tsx
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  role: z.enum(["admin", "user", "guest"]), // 字面量联合
  bio: z.string().optional(),        // 可选字段
  nickname: z.string().nullable(),   // 可为 null
  tags: z.array(z.string()).default([]) // 默认值
});
\`\`\`

---

## 三、校验规则详解

### 字符串规则

\`\`\`tsx
z.string().min(2)              // 最少 2 字符
z.string().max(20)            // 最多 20 字符
z.string().email()            // 邮箱格式
z.string().url()              // URL 格式
z.string().regex(/^\\d+$/)    // 正则：纯数字
z.string().min(6, "密码至少 6 位") // 自定义错误信息
\`\`\`

### 数字规则

\`\`\`tsx
z.number().min(0)       // >= 0
z.number().max(150)     // <= 150
z.number().int()        // 整数
z.number().positive()   // 正数
\`\`\`

### 自定义中文错误信息

每个规则都能传入第二个参数作为错误信息：

\`\`\`tsx
const schema = z.object({
  name: z.string().min(2, "用户名至少需要 2 个字符"),
  email: z.string().email("请输入正确的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位").max(20, "密码最多 20 位"),
  age: z.number().min(18, "必须年满 18 岁").max(120, "年龄不合法")
});
\`\`\`

---

## 四、z.infer：从 schema 得到类型

\`\`\`tsx
const schema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email()
});

// 关键魔法：z.infer
type FormValues = z.infer<typeof schema>;
// 推导为：{ name: string; age: number; email: string }

// optional / nullable 也会正确反映到类型
const schema2 = z.object({
  bio: z.string().optional(),       // bio?: string
  avatar: z.string().nullable()     // avatar: string | null
});
type FormValues2 = z.infer<typeof schema2>;
\`\`\`

\`z.infer<typeof X>\` 是 TypeScript 的"类型查询"语法——从一个**值**（schema）反向推导出**类型**。\`typeof X\` 先拿到值的类型，\`z.infer\` 再从 Zod 类型里提取出目标类型。

---

## 五、表单状态管理

### 1. 用 useState 管理整个表单

\`\`\`tsx
type FormValues = {
  name: string;
  email: string;
  password: string;
  age: number | ""; // 空输入用空字符串占位
};

const [values, setValues] = useState<FormValues>({
  name: "",
  email: "",
  password: "",
  age: ""
});

// 通用更新函数
function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
  setValues(prev => ({ ...prev, [key]: value }));
}
\`\`\`

\`K extends keyof FormValues\` 让 \`key\` 只能是合法字段名，\`value\` 类型自动和字段对应——**拼错字段名直接报错**。

### 2. 错误状态

\`\`\`tsx
const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
// errors 的结构：{ name?: string; email?: string; ... }
\`\`\`

\`Partial<Record<K, V>>\` 表示"每个字段可能有错误信息，也可能没有"，非常贴合表单场景。

---

## 六、handleSubmit 与校验流程

\`\`\`tsx
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  // 1. 用 schema 校验
  const result = schema.safeParse(values);

  if (!result.success) {
    // 2. 失败：把错误按字段名收集
    const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormValues;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message; // 中文错误信息
      }
    }
    setErrors(fieldErrors);
    return;
  }

  // 3. 成功：result.data 是通过校验的干净数据
  console.log("提交成功", result.data);
  setErrors({});
}
\`\`\`

\`safeParse\` 不会抛异常——返回 \`{ success: true, data }\` 或 \`{ success: false, error }\`，又是判别联合！用 \`parse\` 则失败时抛异常。

---

## 七、字段级错误展示

\`\`\`tsx
function Field({
  label, error, children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

// 使用
<Field label="用户名" error={errors.name}>
  <input
    value={values.name}
    onChange={e => update("name", e.target.value)}
  />
</Field>
\`\`\`

---

## 八、手动模拟 Zod（无依赖方案）

如果项目没装 zod，可以用**同样的类型思想**手写一个迷你校验器。核心是：

- 用一个**配置对象**描述每个字段的规则（这就是"schema"）
- 用 \`z.infer\` 的等价物：直接定义类型，让类型和规则配置保持对应
- 校验函数遍历规则，收集错误

下方 Demo 实现了一个完整的注册表单：用户名 / 邮箱 / 密码 / 年龄，带中文错误提示、实时校验、提交反馈，**完全不依赖 zod**，但体现了 Zod 的核心思想——"规则即类型"。

---

## 本章小结

✅ Zod 的核心价值：校验规则和类型**单一数据源**，不再双重维护
✅ \`z.object({...})\` 定义 schema，\`z.infer<typeof schema>\` 推导类型
✅ 校验规则：\`min/max/email/regex/enum/optional/nullable\`，每个都能配中文信息
✅ \`safeParse\` 返回判别联合，不抛异常更安全
✅ 表单状态用 \`useState<FormValues>\` + \`Partial<Record<K,string>>\` 管理错误
✅ 通用 \`update<K extends keyof>\` 让字段名和值类型强绑定
✅ 没装 zod 时也能手写校验器，复用同样的类型思想

下一章讲路由参数类型！`,
    code: `import React, { useState } from "react";

// === 1. 类型定义（相当于 z.infer<typeof schema> 的产物）===
// 💡 提示：在真实 Zod 项目里，先写 schema（z.object({...})），再用
//   type FormValues = z.infer<typeof schema>;
// 自动推导出类型——校验规则与类型"单一数据源"，永不脱节。
// z.infer<typeof schema> 的原理：typeof schema 先拿到 schema 值的类型，
// z.infer 再从中提取出目标对象类型，等价于手写下面的 FormValues。
type FormValues = {
  name: string;
  email: string;
  password: string;
  age: number | ""; // 空输入占位（input 为空时用空字符串，避免 NaN）
};

// === 2. 字段错误类型：Partial<Record<K, V>> ===
// 💡 提示：Partial<Record<keyof FormValues, string>> 结构拆解：
//   - Record<keyof FormValues, string>：每个字段名映射到 string
//       => { name: string; email: string; password: string; age: string }
//   - Partial<...>：所有字段变可选
//       => { name?: string; email?: string; password?: string; age?: string }
//   含义：每个字段"可能有错误信息，也可能没有"——贴合表单场景
//   （没出错的字段不在 errors 中，或值为 undefined）
type FieldErrors = Partial<Record<keyof FormValues, string>>;

// === 3. 手写校验规则配置（相当于 Zod 的 z.object({...}) schema）===
// 💡 提示：Zod 中 schema 长这样——规则和类型一体：
//   const schema = z.object({
//     name: z.string().min(2, "...").max(20, "..."),       // min/max 长度校验
//     email: z.string().email("..."),                      // email 格式校验
//     password: z.string().min(6, "...").max(20, "..."),   // 长度校验
//     age: z.number().min(18, "...").max(120, "...")       // 数值范围校验
//   });
// 这里用配置对象 Rule<T>[] 手写模拟，每个规则 = { validate, message }。
type Rule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

const rules: Record<keyof FormValues, Rule<FormValues[keyof FormValues]>[]> = {
  // name 字段：等价于 z.string().min(2).max(20)（长度校验）
  name: [
    { validate: v => (v as string).trim().length >= 2, message: "用户名至少需要 2 个字符" },
    { validate: v => (v as string).trim().length <= 20, message: "用户名最多 20 个字符" }
  ],
  // email 字段：等价于 z.string().email()（非空 + 正则格式校验）
  email: [
    { validate: v => (v as string).trim().length > 0, message: "邮箱不能为空" },
    { validate: v => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v as string), message: "请输入正确的邮箱地址" }
  ],
  // password 字段：等价于 z.string().min(6).max(20)，外加"必须含数字"
  password: [
    { validate: v => (v as string).length >= 6, message: "密码至少 6 位" },
    { validate: v => (v as string).length <= 20, message: "密码最多 20 位" },
    { validate: v => /[0-9]/.test(v as string), message: "密码必须包含至少一个数字" }
  ],
  // age 字段：等价于 z.number().min(18).max(120)（数值范围校验）
  age: [
    { validate: v => v !== "" && !isNaN(v as number), message: "年龄不能为空" },
    { validate: v => v === "" || (v as number) >= 18, message: "必须年满 18 岁" },
    { validate: v => v === "" || (v as number) <= 120, message: "年龄不合法" }
  ]
};

// === 4. 校验函数 ===
// 校验单个字段：遍历该字段的规则，遇到第一个失败就返回其错误信息
function validateField(key: keyof FormValues, value: FormValues[keyof FormValues]): string {
  for (const rule of rules[key]) {
    if (!rule.validate(value)) return rule.message;
  }
  return "";
}

// 校验全部：遍历所有字段，收集错误到 FieldErrors 对象（等价于 schema.safeParse）
function validateAll(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(rules) as (keyof FormValues)[]).forEach(key => {
    const msg = validateField(key, values[key]);
    if (msg) errors[key] = msg;
  });
  return errors;
}

// === 5. 校验流程演示（模块加载时跑一次，输出合法/非法输入的校验结果）===
(function demoValidationFlow() {
  console.log("=== 校验流程演示 ===");

  // 模拟"非法输入"：每个字段都不合规
  const badValues: FormValues = {
    name: "a", email: "not-an-email", password: "123", age: 10
  };
  console.log("校验前 errors：", {});
  const badErrors = validateAll(badValues);
  console.log("非法输入校验后 errors：", badErrors);

  // 模拟"合法输入"：每个字段都合规
  const goodValues: FormValues = {
    name: "张三", email: "zs@example.com", password: "abc123456", age: 25
  };
  const goodErrors = validateAll(goodValues);
  console.log("合法输入校验后 errors：", goodErrors);
  console.log("合法输入是否通过：", Object.keys(goodErrors).length === 0);
})();

// === 6. 通用 Field 组件 ===
function Field({
  label, error, children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#374151" }}>
        {label}
      </label>
      {children}
      {error ? (
        <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{error}</div>
      ) : null}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", boxSizing: "border-box",
  border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, outline: "none",
  transition: "border-color 0.2s"
};

// === 7. 主组件 ===
export default function Demo() {
  const [values, setValues] = useState<FormValues>({
    name: "", email: "", password: "", age: ""
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    name: false, email: false, password: false, age: false
  });
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  // === 7.1 通用更新函数 ===
  // 💡 提示：<K extends keyof FormValues> 泛型约束的作用：
  //   - K 只能是 "name" | "email" | "password" | "age" 之一（拼错字段名直接编译报错）
  //   - value 类型自动绑定到 FormValues[K]（传错值类型也会报错）
  //   例：update("name", 123) 报错，因为 FormValues["name"] 是 string 而非 number
  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues(prev => ({ ...prev, [key]: value }));
    // 输入时实时校验（仅在该字段被触碰过时显示错误）
    if (touched[key]) {
      const msg = validateField(key, value);
      setErrors(prev => ({ ...prev, [key]: msg || undefined }));
    }
  }

  function handleBlur(key: keyof FormValues) {
    setTouched(prev => ({ ...prev, [key]: true }));
    const msg = validateField(key, values[key]);
    setErrors(prev => ({ ...prev, [key]: msg || undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 输出校验前的 errors 快照
    console.log("提交前 errors：", errors);
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched({ name: true, email: true, password: true, age: true });
    // 输出校验后的 errors
    console.log("提交校验后 errors：", allErrors);
    if (Object.keys(allErrors).length === 0) {
      // 校验通过，输出表单提交数据
      console.log("✅ 表单提交数据：", values);
      setSubmitted({ ...values });
    } else {
      console.log("❌ 校验未通过，不提交");
      setSubmitted(null);
    }
  }

  const strength =
    values.password.length === 0 ? 0 :
    values.password.length < 6 ? 1 :
    /[0-9]/.test(values.password) && values.password.length >= 10 ? 3 : 2;

  return (
    <div style={{ maxWidth: 460, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>📝 注册表单（类型安全校验）</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
        手写校验器，复用 Zod"规则即类型"思想
      </p>

      <form onSubmit={handleSubmit} style={{
        padding: 24, background: "white", borderRadius: 10,
        border: "1px solid #e5e7eb"
      }}>
        <Field label="用户名" error={touched.name ? errors.name : undefined}>
          <input
            style={{ ...inputStyle, borderColor: touched.name && errors.name ? "#fca5a5" : "#d1d5db" }}
            value={values.name}
            onChange={e => update("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="2-20 个字符"
          />
        </Field>

        <Field label="邮箱" error={touched.email ? errors.email : undefined}>
          <input
            style={{ ...inputStyle, borderColor: touched.email && errors.email ? "#fca5a5" : "#d1d5db" }}
            value={values.email}
            onChange={e => update("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="example@domain.com"
          />
        </Field>

        <Field label="密码" error={touched.password ? errors.password : undefined}>
          <input
            type="password"
            style={{ ...inputStyle, borderColor: touched.password && errors.password ? "#fca5a5" : "#d1d5db" }}
            value={values.password}
            onChange={e => update("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder="至少 6 位，含数字"
          />
          {values.password.length > 0 ? (
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= strength
                    ? (strength === 1 ? "#ef4444" : strength === 2 ? "#f59e0b" : "#22c55e")
                    : "#e5e7eb"
                }} />
              ))}
            </div>
          ) : null}
        </Field>

        <Field label="年龄" error={touched.age ? errors.age : undefined}>
          <input
            type="number"
            style={{ ...inputStyle, borderColor: touched.age && errors.age ? "#fca5a5" : "#d1d5db" }}
            value={values.age}
            onChange={e => update("age", e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={() => handleBlur("age")}
            placeholder=">= 18"
          />
        </Field>

        <button
          type="submit"
          style={{
            width: "100%", padding: "12px 0", border: "none", borderRadius: 6,
            background: "#3b82f6", color: "white", fontSize: 15,
            fontWeight: 600, cursor: "pointer", marginTop: 4
          }}
        >
          注册
        </button>
      </form>

      {/* 提交结果 */}
      {submitted ? (
        <div style={{
          marginTop: 16, padding: 16, borderRadius: 8,
          background: "#f0fdf4", border: "1px solid #bbf7d0"
        }}>
          <div style={{ fontWeight: 600, color: "#15803d", marginBottom: 8 }}>
            ✅ 校验通过，准备提交
          </div>
          <pre style={{ margin: 0, fontSize: 12, color: "#166534", whiteSpace: "pre-wrap" }}>
{JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
`,
  },

  {
    id: "tsx-router-params",
    group: "实战篇",
    icon: "🧭",
    title: "路由参数类型",
    content: `# 路由参数类型

Next.js App Router 把路由参数和查询参数作为 props 传给页面组件。给它们正确的类型，是构建类型安全页面导航的基础。

本章覆盖 Server / Client 两种组件里参数的类型处理，以及分页、筛选等常见模式。

---

## 一、Next.js App Router 的参数从哪来？

App Router 里，一个页面文件 \`app/users/[id]/page.tsx\` 会收到两个特殊的 props：

- **\`params\`**：动态路由段，对应 \`[id]\`、\`[slug]\`
- **\`searchParams\`**：URL 查询字符串，对应 \`?q=xx&page=2\`

\`\`\`tsx
// app/users/[id]/page.tsx
// URL: /users/42?tab=posts&q=hello

export default function Page({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { tab?: string; q?: string };
}) {
  return (
    <div>
      <h1>用户 {params.id}</h1>
      <p>搜索：{searchParams.q}</p>
    </div>
  );
}
\`\`\`

**重点**：\`params.id\` 永远是 \`string\`！即使 URL 是 \`/users/42\`，\`42\` 也是字符串，需要手动转 number。

---

## 二、Server Component：Promise 包装的参数

在较新的 Next.js 版本里，\`params\` 和 \`searchParams\` 是 **Promise**，需要 \`await\`：

\`\`\`tsx
// app/users/[id]/page.tsx
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  // 必须 await
  const { id } = await params;
  const { tab, q } = await searchParams;

  // id 是 string，用数据库查询时要转成数字
  const user = await db.user.findUnique({ where: { id: Number(id) } });

  return (
    <div>
      <h1>用户 #{id}</h1>
      {q ? <p>搜索关键词：{q}</p> : null}
    </div>
  );
}
\`\`\`

### 为什么是 Promise？

因为参数可能来自动态生成（如 ISR、流式渲染），框架需要异步解析。把类型写成 \`Promise<{...}>\` 后，\`await\` 出来的就是干净的对象，类型自动收窄。

### 生成静态参数：generateStaticParams

\`\`\`tsx
// 为动态路由预生成静态页面
export async function generateStaticParams() {
  const users = await db.user.findMany();
  return users.map(u => ({ id: String(u.id) })); // 必须返回 string
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1>用户 {id}</h1>;
}
\`\`\`

\`generateStaticParams\` 的返回值类型必须和 \`params\` 的内部结构一致（都是 \`{ id: string }\`）。

---

## 三、Client Component：useSearchParams / useParams

在客户端组件（\`"use client"\`）里，用两个 Hook 获取参数：

\`\`\`tsx
"use client";

import { useSearchParams, useParams } from "next/navigation";

export default function UserClient() {
  const params = useParams<{ id: string }>();   // 路由参数
  const searchParams = useSearchParams();        // 查询参数

  const id = params.id;                          // string
  const tab = searchParams.get("tab");           // string | null
  const q = searchParams.get("q");               // string | null

  return (
    <div>
      <h1>用户 {id}</h1>
      <p>tab: {tab ?? "默认"}</p>
    </div>
  );
}
\`\`\`

**注意**：

- \`useParams<T>()\` 可以传泛型，让 \`params.id\` 有类型
- \`useSearchParams()\` 返回 \`URLSearchParams\`，\`get()\` 返回 \`string | null\`（找不到是 null，不是 undefined）
- \`useSearchParams\` 必须在 Client Component 里用，且组件要被 \`<Suspense>\` 包裹

---

## 四、类型安全的参数解析

URL 参数全是字符串，但业务上常常需要数字、布尔。直接 \`Number(searchParams.page)\` 不够安全——\`Number("abc")\` 得到 \`NaN\`。

### 一个类型安全的解析工具

\`\`\`tsx
// 解析数字参数：非法时返回默认值
function parseNumber(value: string | null, defaultValue: number): number {
  if (value === null) return defaultValue;
  const n = Number(value);
  return Number.isNaN(n) ? defaultValue : n;
}

// 解析布尔参数
function parseBoolean(value: string | null, defaultValue: boolean): boolean {
  if (value === null) return defaultValue;
  return value === "true" || value === "1";
}

// 使用
const page = parseNumber(searchParams.get("page"), 1);   // number
const size = parseNumber(searchParams.get("size"), 10);  // number
const active = parseBoolean(searchParams.get("active"), false); // boolean
\`\`\`

这样 \`page\` 一定是合法的 \`number\`，永远不会是 \`NaN\`，下游代码可以放心用。

---

## 五、分页参数模式

分页是搜索页最常见的场景，参数结构相对固定：

\`\`\`tsx
// 定义分页参数类型
type PaginationParams = {
  page: number;   // 当前页码，从 1 开始
  size: number;   // 每页条数
  total?: number; // 总数（响应里才有）
};

// 从 searchParams 解析分页参数
function parsePagination(searchParams: URLSearchParams): PaginationParams {
  return {
    page: Math.max(1, parseNumber(searchParams.get("page"), 1)),
    size: Math.min(100, Math.max(1, parseNumber(searchParams.get("size"), 10)))
  };
}

// 生成分页 URL（保留其他参数）
function buildPageUrl(
  searchParams: URLSearchParams,
  page: number
): string {
  const next = new URLSearchParams(searchParams);
  next.set("page", String(page));
  return "?" + next.toString();
}

// 使用
const pagination = parsePagination(searchParams);
// 上一页/下一页链接
<a href={buildPageUrl(searchParams, pagination.page - 1)}>上一页</a>
<a href={buildPageUrl(searchParams, pagination.page + 1)}>下一页</a>
\`\`\`

\`Math.max/min\` 做边界保护：页码至少为 1，每页最多 100 条，防止恶意构造 URL 拖垮服务。

---

## 六、筛选参数模式

筛选参数通常是"多选 + 单选"混合：

\`\`\`tsx
type FilterParams = {
  keyword: string;          // 搜索关键词
  category: string[];       // 多选分类
  minPrice: number | null;  // 价格区间
  maxPrice: number | null;
  sortBy: "newest" | "price" | "popular"; // 排序
};

// searchParams 里 category 可能是 "a" 或 "a,b,c"
function parseFilters(searchParams: URLSearchParams): FilterParams {
  const category = searchParams.get("category");
  return {
    keyword: searchParams.get("keyword") ?? "",
    category: category ? category.split(",") : [],
    minPrice: parseNumberOrNull(searchParams.get("minPrice")),
    maxPrice: parseNumberOrNull(searchParams.get("maxPrice")),
    sortBy: (searchParams.get("sortBy") as FilterParams["sortBy"]) ?? "newest"
  };
}
\`\`\`

\`sortBy\` 用字面量联合类型，非法值会回退到默认——既类型安全，又容错。

---

## 七、Demo 说明

下方 Demo 模拟一个搜索/筛选组件：用 \`useState\` 维护 URL 参数（模拟 \`useSearchParams\`），展示**类型安全的参数解析、分页、筛选、URL 同步**。因为是独立 Demo，不依赖真实路由，但所有类型模式都和真实 Next.js 完全一致。

---

## 本章小结

✅ App Router 页面通过 \`params\` / \`searchParams\` 接收路由与查询参数
✅ 新版本里它们是 \`Promise\`，Server Component 中要 \`await\`
✅ Client Component 用 \`useParams<T>()\` 和 \`useSearchParams()\`
✅ URL 参数永远是 \`string\`，需要类型安全的 \`parseNumber/parseBoolean\` 工具
✅ 分页参数用 \`Math.max/min\` 做边界保护
✅ 筛选用字面量联合类型约束排序选项，非法值回退默认
✅ \`generateStaticParams\` 返回值类型要和 \`params\` 结构对齐

下一章讲第三方库类型扩展！`,
    code: `import React, { useState, useMemo, useCallback } from "react";

// ============================================================
// === 1. 类型定义：模拟 Next.js App Router 的路由参数结构 ===
// ============================================================
// 💡 提示：在真实 Next.js 中，这些字段对应页面 searchParams 的解析结果
// 例如 Server Component：searchParams: Promise<{ keyword?: string; page?: string }>
// 例如 Client Component：const sp = useSearchParams();
type FilterParams = {
  keyword: string;
  category: string[];        // 多选：URL 中以逗号分隔存储
  sortBy: "newest" | "price" | "popular";  // 字面量联合，保证取值受限
  page: number;
  size: number;
};

// ============================================================
// === 2. 类型安全的参数解析工具函数 ===
// ============================================================
// 这些函数是 "URL 字符串" 与 "业务类型对象" 之间的桥梁
// 真实场景：从 useSearchParams() 返回的 URLSearchParams 中提取并校验

// 将 URL 参数解析为 number，失败时返回默认值（真实场景对应 useSearchParams）
// 例如：parseNumber(sp.get("page"), 1) —— sp 由 useSearchParams() 取得
function parseNumber(value: string | null, defaultValue: number): number {
  if (value === null) return defaultValue;   // 参数缺失走默认值
  const n = Number(value);                    // Number("abc") -> NaN
  return Number.isNaN(n) ? defaultValue : n;  // 拦截 NaN，避免污染下游
}

// 将逗号分隔的字符串解析为类型安全的数组
// 例如："电子,书籍" -> ["电子", "书籍"]；缺失或空串返回 []
// 💡 提示：URL 没有原生数组结构，多选一般用逗号拼接或重复 key 两种约定
function parseFilters(sp: URLSearchParams): FilterParams {
  const category = sp.get("category");
  const sortBy = sp.get("sortBy");
  return {
    keyword: sp.get("keyword") ?? "",                                // null -> "" 简化下游判断
    category: category ? category.split(",").filter(Boolean) : [],   // 过滤空串，避免 [""] 这种脏数据
    // 字面量联合收窄：非法值（如 sortBy=xxx）自动回退 "newest"，既类型安全又容错
    sortBy: sortBy === "price" || sortBy === "popular" ? sortBy : "newest",
    page: Math.max(1, parseNumber(sp.get("page"), 1)),  // 边界保护：页码至少为 1
    // size 双向夹紧 1~50：防止恶意构造 size=99999 拖垮前端渲染或后端查询
    size: Math.min(50, Math.max(1, parseNumber(sp.get("size"), 5)))
  };
}

// 把 FilterParams 序列化回 URLSearchParams（模拟路由同步）
// 真实场景：配合 useRouter() 使用
//   const router = useRouter();
//   router.replace("?" + serializeFilters(next).toString(), { scroll: false });
function serializeFilters(f: FilterParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.keyword) sp.set("keyword", f.keyword);                  // 空串不写入 URL，保持 URL 简洁
  if (f.category.length) sp.set("category", f.category.join(","));  // 数组 -> 逗号字符串
  sp.set("sortBy", f.sortBy);
  sp.set("page", String(f.page));
  sp.set("size", String(f.size));
  return sp;
}

// ============================================================
// === 3. 模拟数据：商品列表（供 Demo 过滤/分页使用） ===
// ============================================================
type Product = {
  id: number;
  name: string;
  category: "电子" | "书籍" | "服装";
  price: number;
  sales: number;
  createdAt: number;
};

const PRODUCTS: Product[] = [
  { id: 1, name: "无线耳机", category: "电子", price: 299, sales: 1200, createdAt: 3 },
  { id: 2, name: "TypeScript 实战", category: "书籍", price: 89, sales: 800, createdAt: 1 },
  { id: 3, name: "纯棉T恤", category: "服装", price: 59, sales: 2300, createdAt: 5 },
  { id: 4, name: "机械键盘", category: "电子", price: 599, sales: 600, createdAt: 4 },
  { id: 5, name: "React 进阶", category: "书籍", price: 109, sales: 1500, createdAt: 2 },
  { id: 6, name: "牛仔裤", category: "服装", price: 199, sales: 900, createdAt: 6 },
  { id: 7, name: "蓝牙音箱", category: "电子", price: 399, sales: 700, createdAt: 7 }
];

const CATEGORIES = ["电子", "书籍", "服装"] as const;
const SORT_OPTIONS: { value: FilterParams["sortBy"]; label: string }[] = [
  { value: "newest", label: "最新上架" },
  { value: "price", label: "价格升序" },
  { value: "popular", label: "销量优先" }
];

// ============================================================
// === 4. 解析演示：URLSearchParams 如何变身为强类型对象 ===
// ============================================================
// 💡 提示：用 IIFE 在模块加载时跑一次解析→序列化演示
// 真实项目里可放在 useEffect 内做调试输出，或直接看控制台
(function demoUrlParamsParsing() {
  // 模拟一组 URL 查询字符串（等价于 useSearchParams 读到的 URL）
  const demoUrl = "?page=2&categories=electronics,books&sort=price&minPrice=100";
  const sp = new URLSearchParams(demoUrl);

  console.log("[demoUrlParamsParsing] 原始 URL:", demoUrl);
  console.log("[demoUrlParamsParsing] sp.get('page'):", sp.get("page"), "(类型: string | null)");
  console.log("[demoUrlParamsParsing] sp.get('categories'):", sp.get("categories"));
  console.log("[demoUrlParamsParsing] sp.get('sort'):", sp.get("sort"));
  console.log("[demoUrlParamsParsing] sp.get('minPrice'):", sp.get("minPrice"));

  // 复用工具函数，把 URL 字符串解析成强类型对象
  const parsedFilters = {
    page: Math.max(1, parseNumber(sp.get("page"), 1)),        // 边界保护：页码至少为 1
    categories: (sp.get("categories") ?? "").split(",").filter(Boolean),  // 字符串 -> 字符串数组
    sort: sp.get("sort"),
    minPrice: parseNumber(sp.get("minPrice"), 0)
  };
  console.log("[demoUrlParamsParsing] 解析后对象:", parsedFilters);
  // 期望输出：{ page: 2, categories: ["electronics","books"], sort: "price", minPrice: 100 }
  // 注意 page/minPrice 已被类型收窄为 number，不再是 string

  // 演示序列化：把对象重新拼成 URL 字符串（对应 router.replace 的入参）
  const reSp = new URLSearchParams();
  reSp.set("page", String(parsedFilters.page));
  reSp.set("categories", parsedFilters.categories.join(","));
  if (parsedFilters.sort) reSp.set("sort", parsedFilters.sort);
  reSp.set("minPrice", String(parsedFilters.minPrice));
  console.log("[demoUrlParamsParsing] 序列化后 URL:", "?" + reSp.toString());

  // 演示更新过滤器后的 URL 变化：把 categories 改成单选 + page 改回 1
  const updated = {
    ...parsedFilters,
    categories: ["electronics"],
    page: 1
  };
  const updatedSp = new URLSearchParams();
  updatedSp.set("page", String(updated.page));
  updatedSp.set("categories", updated.categories.join(","));
  if (updated.sort) updatedSp.set("sort", updated.sort);
  updatedSp.set("minPrice", String(updated.minPrice));
  console.log("[demoUrlParamsParsing] 更新后 URL:", "?" + updatedSp.toString());
})();

// ============================================================
// === 5. 主组件：搜索 / 筛选 / 分页 ===
// ============================================================
export default function Demo() {
  // 用 URLSearchParams 模拟真实路由（初始带一些参数）
  // 💡 提示：真实项目应使用 useSearchParams() + useRouter()
  //   const searchParams = useSearchParams();
  //   const router = useRouter();
  //   setSp 对应 router.replace("?" + sp.toString())
  const [sp, setSp] = useState<URLSearchParams>(() => {
    const init = new URLSearchParams("?keyword=&sortBy=newest&page=1&size=5");
    return init;
  });

  // [sp] 表示只在 URL 参数变化时重新计算
  // 💡 提示：useMemo 缓存解析结果，避免每次渲染都跑一遍 parseFilters
  const filters = useMemo(() => parseFilters(sp), [sp]);

  // [filters] 依赖 filters：只有筛选条件变化才重新过滤/排序/分页
  // 注意 filters 是上面 useMemo 的返回值，本身已带缓存，所以这里也跟着复用缓存
  const result = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      if (filters.keyword && !p.name.includes(filters.keyword)) return false;
      if (filters.category.length && !filters.category.includes(p.category)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (filters.sortBy === "price") return a.price - b.price;
      if (filters.sortBy === "popular") return b.sales - a.sales;
      return a.createdAt - b.createdAt; // newest
    });

    const start = (filters.page - 1) * filters.size;
    return {
      items: list.slice(start, start + filters.size),
      total: list.length
    };
  }, [filters]);

  // 更新某个筛选字段（重置到第 1 页）
  // 💡 提示：<K extends keyof FilterParams> 泛型约束的作用：
  //   1) K 只能取 FilterParams 的 key（"keyword" | "category" | "sortBy" | "page" | "size"）
  //      写错 key 名（如 updateFilter("keywrod", ...)）会被 TS 拦截
  //   2) value: FilterParams[K] 让 value 类型随 key 联动：
  //      updateFilter("page", 1)  // OK，page 期望 number
  //      updateFilter("page", "1") // ❌ 报错，"1" 不是 number
  //      updateFilter("sortBy", "price") // OK
  //      updateFilter("sortBy", "xxx")   // ❌ 报错，不在字面量联合里
  //   3) 配合计算属性 [key]: value，能保证合并后的 next 仍是 FilterParams，不会丢类型
  // [filters] 依赖 filters：因为内部用 ...filters 合并旧值
  const updateFilter = useCallback(<K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
    const next: FilterParams = { ...filters, [key]: value, page: 1 };
    setSp(serializeFilters(next));
    console.log("[updateFilter]", key, "->", value, "新 URL:", "?" + serializeFilters(next).toString());
  }, [filters]);

  // [filters] 依赖 filters：setPage 只改 page 字段，但要保留其余筛选条件
  const setPage = useCallback((page: number) => {
    const next = { ...filters, page };
    setSp(serializeFilters(next));
    console.log("[setPage] 切换到第", page, "页，新 URL:", "?" + serializeFilters(next).toString());
  }, [filters]);

  // 总页数：Math.max(1, ...) 保证至少为 1，避免空列表时出现 "第 1/0 页"
  const totalPages = Math.max(1, Math.ceil(result.total / filters.size));

  return (
    <div style={{ maxWidth: 620, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>🧭 搜索与筛选（类型安全路由参数）</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
        模拟 useSearchParams + 类型化参数解析
      </p>

      {/* 当前 URL 预览 */}
      <div style={{
        padding: "8px 12px", marginBottom: 16, borderRadius: 6,
        background: "#1e293b", color: "#93c5fd", fontFamily: "monospace", fontSize: 12,
        overflowX: "auto", whiteSpace: "nowrap"
      }}>
        ?{sp.toString()}
      </div>

      {/* 筛选区 */}
      <div style={{
        padding: 16, marginBottom: 16, borderRadius: 8,
        border: "1px solid #e5e7eb", background: "#fafafa"
      }}>
        <input
          value={filters.keyword}
          onChange={e => updateFilter("keyword", e.target.value)}
          placeholder="搜索商品名..."
          style={{
            width: "100%", padding: "8px 12px", boxSizing: "border-box",
            border: "1px solid #d1d5db", borderRadius: 6, marginBottom: 12, fontSize: 14
          }}
        />

        {/* 多选分类 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => {
            const active = filters.category.includes(c);
            return (
              <button
                key={c}
                onClick={() => {
                  const next = active
                    ? filters.category.filter(x => x !== c)
                    : [...filters.category, c];
                  updateFilter("category", next);
                }}
                style={{
                  padding: "5px 12px", borderRadius: 16, fontSize: 12, cursor: "pointer",
                  border: active ? "1px solid #3b82f6" : "1px solid #d1d5db",
                  background: active ? "#3b82f6" : "white",
                  color: active ? "white" : "#374151"
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* 排序 */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateFilter("sortBy", opt.value)}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                border: filters.sortBy === opt.value ? "1px solid #8b5cf6" : "1px solid #d1d5db",
                background: filters.sortBy === opt.value ? "#8b5cf6" : "white",
                color: filters.sortBy === opt.value ? "white" : "#374151"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 结果列表 */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        {result.items.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#9ca3af" }}>
            没有匹配的商品
          </div>
        ) : (
          result.items.map((p, i) => (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              borderBottom: i < result.items.length - 1 ? "1px solid #f3f4f6" : "none"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: p.category === "电子" ? "#dbeafe" : p.category === "书籍" ? "#fef3c7" : "#fce7f3",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
              }}>
                {p.category === "电子" ? "📱" : p.category === "书籍" ? "📚" : "👕"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {p.category} · 销量 {p.sales}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: "#dc2626" }}>¥{p.price}</div>
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          共 {result.total} 条 · 第 {filters.page}/{totalPages} 页
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setPage(filters.page - 1)}
            disabled={filters.page <= 1}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
              border: "1px solid #d1d5db", background: "white",
              opacity: filters.page <= 1 ? 0.4 : 1
            }}
          >
            上一页
          </button>
          <button
            onClick={() => setPage(filters.page + 1)}
            disabled={filters.page >= totalPages}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
              border: "1px solid #d1d5db", background: "white",
              opacity: filters.page >= totalPages ? 0.4 : 1
            }}
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
`,
  },

  {
    id: "tsx-module-decl",
    group: "实战篇",
    icon: "📦",
    title: "第三方库类型扩展",
    content: `# 第三方库类型扩展

TypeScript 默认只认识 \`.ts/.tsx\` 文件。当你 \`import\` 一个没类型的包、一个 \`.svg\` 图片、一个 \`.module.css\` 样式时，编译器会报错——这时就需要**模块声明（Module Declaration）**。

本章讲解如何用 \`declare module\` 和 \`.d.ts\` 文件补全类型。

---

## 一、为什么需要模块声明？

### 场景 1：导入图片报错

\`\`\`tsx
import logo from "./logo.svg";
// ❌ Cannot find module './logo.svg' or its corresponding type declarations.
\`\`\`

TypeScript 不知道 \`.svg\` 是什么，因为它默认只处理 \`.ts/.tsx\`。

### 场景 2：导入没类型的第三方包

\`\`\`tsx
import oldLib from "some-old-lib";
// ❌ Could not find a declaration file for module 'some-old-lib'.
\`\`\`

有些老库没提供 \`.d.ts\`，也没装 \`@types/xxx\`。

### 场景 3：CSS Modules

\`\`\`tsx
import styles from "./Button.module.css";
// ❌ Cannot find module './Button.module.css'
styles.primary; // 也不知道 styles 有什么
\`\`\`

这些都需要我们手动"告诉"TypeScript：这些 import 是合法的，类型长这样。

---

## 二、declare module 基础语法

\`\`\`typescript
// 声明一个模块：告诉 TS 这个 import 存在
declare module "some-old-lib" {
  const oldLib: {
    doSomething: (x: number) => string;
    version: string;
  };
  export default oldLib;
}
\`\`\`

写完后：

\`\`\`tsx
import oldLib from "some-old-lib";
oldLib.doSomething(42); // ✅ 有类型了
oldLib.doSomething("42"); // ❌ 参数必须是 number
\`\`\`

### 通配符模块声明

\`\`\`typescript
// 用 * 匹配文件后缀
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}
\`\`\`

这样所有 \`.svg\` / \`.png\` 导入都返回 \`string\`（图片 URL）。

---

## 三、CSS Modules 声明

\`\`\`typescript
// global.d.ts
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
\`\`\`

使用：

\`\`\`tsx
import styles from "./Button.module.css";

styles.primary;    // ✅ string
styles["non-exist"]; // ✅ 也允许（索引签名）
\`\`\`

### 进阶：带自动补全的 CSS Modules

普通声明只能用索引签名，没有字段补全。如果想拼错类名就报错，需要借助构建工具（如 \`typed-css-modules\`）为每个 \`.module.css\` 生成对应的 \`.module.css.d.ts\`：

\`\`\`typescript
// 自动生成的 Button.module.css.d.ts
declare const classNames: {
  readonly primary: string;
  readonly large: string;
  readonly disabled: string;
};
export default classNames;
\`\`\`

这样 \`styles.primay\`（拼错）会直接红线。

---

## 四、图片导入声明

\`\`\`typescript
// global.d.ts
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}
\`\`\`

Next.js 项目里通常已经内置了这些声明（在 \`next-env.d.ts\`），但理解原理很重要。

---

## 五、.d.ts 文件与 Ambient Declarations

\`.d.ts\` 文件是**只包含类型、不包含实现**的声明文件。它们：

- 不产生任何运行时代码
- 全局自动生效（在 \`tsconfig\` 的 \`include\` 范围内）
- 用来描述已有的 JS 代码的类型

### 创建 global.d.ts

\`\`\`typescript
// src/types/global.d.ts
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
\`\`\`

确保 \`tsconfig.json\` 包含这个目录：

\`\`\`json
{
  "include": ["src", "src/types"]
}
\`\`\`

---

## 六、扩展已有类型：declare module "react"

有时候你想给已有库**追加**类型，比如给 React 组件加自定义属性：

\`\`\`typescript
// 扩展 React 的 HTML 属性，加一个自定义 data 属性
declare module "react" {
  interface HTMLAttributes<T> {
    // 自定义属性，让 data-hover 也有类型
    "data-hover"?: string;
  }
}
\`\`\`

使用：

\`\`\`tsx
<div data-hover="提示文字" /> // ✅ 不再报错
\`\`\`

**注意**：扩展已有模块时要小心，别覆盖原有定义，只做"增量"。

---

## 七、全局类型增强：Window 等

给 \`window\` 加自定义属性：

\`\`\`typescript
// global.d.ts
declare global {
  interface Window {
    // 假设有个第三方脚本往 window 上挂了 myAnalytics
    myAnalytics: (event: string, payload?: Record<string, unknown>) => void;
    __APP_VERSION__: string;
  }
}
\`\`\`

使用：

\`\`\`tsx
window.myAnalytics("click_button", { id: "submit" }); // ✅ 有类型
window.__APP_VERSION__; // ✅ string
\`\`\`

\`declare global\` 是在模块文件里声明全局类型的语法。注意：要让 \`declare global\` 生效，文件里至少要有一个 \`import\` 或 \`export\`（否则它被当作脚本而非模块）。

\`\`\`typescript
// global.d.ts
export {}; // ← 关键：让这个文件成为"模块"，declare global 才生效

declare global {
  interface Window {
    myAnalytics: (event: string) => void;
  }
}
\`\`\`

---

## 八、声明合并：扩展接口

TypeScript 的接口支持**声明合并**——同名接口会自动合并字段：

\`\`\`typescript
// 已有定义
interface User {
  id: number;
  name: string;
}

// 在别处再声明一次，字段会合并
interface User {
  email: string;
  avatar?: string;
}

// 现在 User 有 id, name, email, avatar
const u: User = { id: 1, name: "张三", email: "zs@example.com" };
\`\`\`

这就是为什么能用 \`declare module "react"\` 给已有接口加字段——本质是声明合并。

---

## 九、Demo 说明

下方 Demo 可视化展示了三类常见的模块声明：CSS Modules、SVG/PNG 图片导入、全局 Window 扩展。Demo 把这些 \`.d.ts\` 声明代码渲染出来，并演示声明前后类型的对比——让你直观看到"声明的作用"。

---

## 本章小结

✅ \`declare module "xxx"\` 声明无类型的第三方包
✅ \`declare module "*.svg"\` 通配符声明图片/资源导入
✅ \`declare module "*.module.css"\` 声明 CSS Modules
✅ \`.d.ts\` 文件只含类型不含实现，全局自动生效
✅ \`declare module "react" { interface ... }\` 扩展已有库类型
✅ \`declare global { interface Window {...} }\` 扩展全局类型，记得加 \`export {}\`
✅ 接口声明合并：同名 interface 自动合并字段
✅ Next.js 的 \`next-env.d.ts\` 已内置常见资源声明

下一章讲工具类型与实战技巧！`,
    code: `import React, { useState } from "react";

// ==============================
// 类型定义
// ==============================
type DeclKind = "css" | "image" | "global" | "react" | "merge";

type DeclExample = {
  kind: DeclKind;
  title: string;
  icon: string;
  before: string;
  after: string;
  fileName: string;
  code: string;
  tip: string;
};

// === 1. 声明的示例数据（5 类） ===
const DECLARATIONS: DeclExample[] = [
  {
    kind: "css",
    title: "CSS Modules 声明",
    icon: "🎨",
    fileName: "global.d.ts",
    // 💡 不写会怎样：import styles from './Button.module.css' 报错 'Cannot find module'
    before: "import styles from './Button.module.css';\\n// ❌ Cannot find module",
    after: "styles.primary;  // ✅ string（带补全）",
    code: [
      "// === 1. CSS Modules 类型声明 ===",
      "// 💡 提示：declare module '*.module.css' 让 TS 认识所有 .module.css 导入",
      "// 不写会怎样：import styles from './Button.module.css' 报错 'Cannot find module'",
      "// 作用：把 .module.css 的默认导出声明为 { readonly [key: string]: string }",
      "declare module '*.module.css' {",
      "  const classes: { readonly [key: string]: string };",
      "  export default classes;",
      "}",
      "",
      "// 同理声明 .module.scss（Sass）",
      "declare module '*.module.scss' {",
      "  const classes: { readonly [key: string]: string };",
      "  export default classes;",
      "}"
    ].join("\\n"),
    tip: "💡 CSS Modules 声明后 styles.primary 为 string，但类名拼错不会报错（索引签名）。"
  },
  {
    kind: "image",
    title: "图片导入声明",
    icon: "🖼️",
    fileName: "global.d.ts",
    // 💡 不写会怎样：import logo from './logo.svg' 报错 'Cannot find module'
    before: "import logo from './logo.svg';\\n// ❌ Cannot find module",
    after: "const src: string = logo;  // ✅",
    code: [
      "// === 2. 图片资源导入声明 ===",
      "// 💡 提示：declare module '*.svg' 让 TS 认识 .svg 导入，默认导出为 string（图片 URL）",
      "// 不写会怎样：import logo from './logo.svg' 报错 'Cannot find module'",
      "declare module '*.svg' {",
      "  const src: string;",
      "  export default src;",
      "}",
      "",
      "declare module '*.png' {",
      "  const src: string;",
      "  export default src;",
      "}",
      "",
      "declare module '*.jpg' {",
      "  const src: string;",
      "  export default src;",
      "}"
    ].join("\\n"),
    tip: "💡 Next.js 的 next-env.d.ts 已内置常见图片声明，理解原理很重要。"
  },
  {
    kind: "global",
    title: "全局 Window 扩展",
    icon: "🌍",
    fileName: "global.d.ts",
    // 💡 不写会怎样：window.myAnalytics 报错 'Property does not exist'
    before: "window.myAnalytics('click');\\n// ❌ Property 'myAnalytics' does not exist",
    after: "window.myAnalytics('click');  // ✅ 有类型",
    code: [
      "// === 3. export {} 让文件成为模块 ===",
      "// 💡 提示：export {} 的作用——让这个 .d.ts 文件成为'模块'而非'脚本'",
      "// 不写会怎样：declare global 不生效！脚本里不能写 declare global",
      "// 原理：TS 中只有'模块'文件（有 import/export）才能用 declare global 扩展全局类型",
      "export {}; // ← 关键：让文件成为模块，declare global 才生效",
      "",
      "// === 4. declare global 扩展全局类型 ===",
      "// 💡 提示：declare global { interface Window {...} } 给全局 Window 接口追加字段",
      "// 本质：声明合并——同名 interface Window 的字段会自动合并",
      "declare global {",
      "  interface Window {",
      "    myAnalytics: (event: string, payload?: Record<string, unknown>) => void;",
      "    __APP_VERSION__: string;",
      "  }",
      "}"
    ].join("\\n"),
    tip: "💡 declare global 必须在模块文件里（有 import/export），否则不生效。"
  },
  {
    kind: "react",
    title: "扩展已有库（react）",
    icon: "⚛️",
    fileName: "react-ext.d.ts",
    // 💡 不写会怎样：<div data-hover='x' /> 报错 'Property data-hover does not exist'
    before: "<div data-hover='hi' />\\n// ❌ Property 'data-hover' does not exist",
    after: "<div data-hover='hi' />  // ✅ 不再报错",
    code: [
      "// === 5. 扩展已有库：declare module 'react' ===",
      "// 💡 提示：declare module 'react' 不是新建模块，而是对已有 react 类型做'增量扩展'",
      "// 本质：声明合并——给 react 已有的 HTMLAttributes<T> 接口追加字段",
      "// 不写会怎样：<div data-hover='x' /> 报错 'Property data-hover does not exist'",
      "declare module 'react' {",
      "  interface HTMLAttributes<T> {",
      "    // 自定义属性，让 data-hover 也有类型",
      "    'data-hover'?: string;",
      "  }",
      "}",
      "",
      "// 注意：扩展已有模块要小心，只做'增量'，别覆盖原有定义"
    ].join("\\n"),
    tip: "💡 declare module '已存在的包' 是声明合并，不是覆盖。"
  },
  {
    kind: "merge",
    title: "接口声明合并",
    icon: "🔗",
    fileName: "merge.d.ts",
    // 💡 不写第二个 interface User，User 就只有 id/name，访问 u.email 报错
    before: "const u: User = { id: 1, name: 'zs', email: 'x' };\\n// ❌ Property 'email' does not exist",
    after: "const u: User = { id: 1, name: 'zs', email: 'x' };  // ✅ 字段已合并",
    code: [
      "// === 6. 声明合并：同名 interface 自动合并字段 ===",
      "// 💡 提示：TypeScript 的 interface 支持声明合并——同名 interface 字段会自动合并",
      "",
      "// 已有定义",
      "interface User {",
      "  id: number;",
      "  name: string;",
      "}",
      "",
      "// 在别处再声明一次，字段会合并（不是覆盖！）",
      "// 不写会怎样：User 只有 id/name，访问 u.email 报错 'Property does not exist'",
      "interface User {",
      "  email: string;",
      "  avatar?: string;",
      "}",
      "",
      "// 合并后 User 有：id, name, email, avatar"
    ].join("\\n"),
    tip: "💡 声明合并是 declare module 'react' 能扩展已有库的根本原因。"
  }
];

// === 2. console.log 演示声明效果 ===
// 模拟导入 svg、css module、调用 window.myAnalytics 的效果
console.log("=== 模块声明效果演示 ===");
console.log("1. 模拟 import logo from './logo.svg'，得到 string URL: '/static/logo.abc123.svg'");
console.log("2. 模拟 import styles from './Button.module.css'，得到对象: { primary: 'Button_primary__abc123' }");
console.log("3. 模拟 window.myAnalytics('click_button', { id: 'submit' })，上报事件");
console.log("4. 模拟 window.__APP_VERSION__，得到 '1.0.0'");
console.log("--- 声明前后类型对比（用字符串描述） ---");
console.log("[声明前] import styles from './Button.module.css'，类型: any（报错 Cannot find module）");
console.log("[声明后] import styles from './Button.module.css'，类型: { readonly [key: string]: string }");
console.log("[声明前] window.myAnalytics，类型: 报错 Property 'myAnalytics' does not exist");
console.log("[声明后] window.myAnalytics，类型: (event: string, payload?: Record<string, unknown>) => void");
console.log("[声明前] <div data-hover='x' />，类型: 报错 Property 'data-hover' does not exist");
console.log("[声明后] <div data-hover='x' />，类型: HTMLAttributes 含 'data-hover'?: string");
console.log("--- 声明的示例文件名和内容 ---");
DECLARATIONS.forEach(d => {
  console.log("文件: " + d.fileName + " | " + d.title);
  console.log(d.code);
});

// ==============================
// 代码块组件（带语法高亮配色）
// ==============================
function CodeBlock({ code, fileName }: { code: string; fileName: string }) {
  return (
    <div style={{
      borderRadius: 8, overflow: "hidden", border: "1px solid #1e293b"
    }}>
      <div style={{
        background: "#1e293b", color: "#94a3b8",
        padding: "6px 12px", fontSize: 11, fontFamily: "monospace"
      }}>
        {fileName}
      </div>
      <pre style={{
        margin: 0, padding: 14, background: "#0f172a", color: "#e2e8f0",
        fontSize: 12, lineHeight: 1.6, fontFamily: "monospace",
        overflowX: "auto"
      }}>
{code}
      </pre>
    </div>
  );
}

// ==============================
// 主组件
// ==============================
export default function Demo() {
  const [active, setActive] = useState<DeclKind>("css");
  const current = DECLARATIONS.find(d => d.kind === active) as DeclExample;

  const tabs: { kind: DeclKind; label: string; icon: string }[] = [
    { kind: "css", label: "CSS Modules", icon: "🎨" },
    { kind: "image", label: "图片导入", icon: "🖼️" },
    { kind: "global", label: "全局扩展", icon: "🌍" },
    { kind: "react", label: "扩展 React", icon: "⚛️" },
    { kind: "merge", label: "声明合并", icon: "🔗" }
  ];

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>📦 第三方库类型扩展</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
        用 declare module 补全 CSS / 图片 / 全局 / React 类型
      </p>

      {/* Tab 切换 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.kind}
            onClick={() => setActive(t.kind)}
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer",
              border: active === t.kind ? "1px solid #3b82f6" : "1px solid #d1d5db",
              background: active === t.kind ? "#3b82f6" : "white",
              color: active === t.kind ? "white" : "#374151",
              fontWeight: 600
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 声明前 vs 声明后 */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{
          flex: 1, padding: 12, borderRadius: 8,
          background: "#fef2f2", border: "1px solid #fecaca"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#b91c1c", marginBottom: 6 }}>
            ❌ 声明前
          </div>
          <pre style={{
            margin: 0, fontSize: 11, color: "#991b1b",
            fontFamily: "monospace", whiteSpace: "pre-wrap"
          }}>
{current.before}
          </pre>
        </div>
        <div style={{
          flex: 1, padding: 12, borderRadius: 8,
          background: "#f0fdf4", border: "1px solid #bbf7d0"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>
            ✅ 声明后
          </div>
          <pre style={{
            margin: 0, fontSize: 11, color: "#166534",
            fontFamily: "monospace", whiteSpace: "pre-wrap"
          }}>
{current.after}
          </pre>
        </div>
      </div>

      {/* 声明代码 */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#374151" }}>
        {current.icon} {current.title} —— 写在 {current.fileName}：
      </div>
      <CodeBlock code={current.code} fileName={current.fileName} />

      {/* 提示 */}
      <div style={{
        marginTop: 16, padding: 12, borderRadius: 8,
        background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: 12, color: "#1e40af"
      }}>
        💡 <b>关键点</b>：.d.ts 文件只含类型不含实现，放在 tsconfig 的 include 范围内即可全局生效。
        {current.kind === "global"
          ? " declare global 前必须加 export {} 让文件成为模块。"
          : null}
        {current.kind === "css"
          ? " 想要类名拼错报错，可用 typed-css-modules 为每个 CSS 生成 .d.ts。"
          : null}
        {current.kind === "react"
          ? " 扩展已有库本质是声明合并，只做增量别覆盖。"
          : null}
        {current.kind === "merge"
          ? " 同名 interface 字段自动合并，这是 declare module 能扩展已有库的根本原因。"
          : null}
      </div>
    </div>
  );
}
`,
  },

  {
    id: "tsx-utility-types",
    group: "实战篇",
    icon: "🛠️",
    title: "工具类型与实战技巧",
    content: `# 工具类型与实战技巧

TypeScript 内置了一批**工具类型（Utility Types）**，能从已有类型快速派生新类型。它们像"类型的函数"——接收类型参数，返回新类型。掌握它们，能让你的代码"以类型为参数"编程，复用度极高。

本章逐一讲解最常用的工具类型（共 15 个），每个都配 React 场景下的真实用法，并在最后用一个"配置驱动表单"Demo 把它们串起来。

---

## 一、Partial&lt;T&gt;：全部可选

把 T 的所有属性变成可选（加 \`?\`）。

\`\`\`tsx
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

type PartialUser = Partial<User>;
// 等价于：{ id?: number; name?: string; email?: string; age?: number }
\`\`\`

### 经典场景：更新补丁（Patch）

\`\`\`tsx
// PATCH 请求只更新部分字段——完美对应 Partial
async function updateUser(id: number, patch: Partial<User>) {
  // patch 里每个字段都是可选的，可以只传 name，也可以传多个
  const res = await fetch(\`/api/users/\${id}\`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
  return res.json();
}

updateUser(1, { name: "新名字" });               // ✅ 只改名字
updateUser(1, { name: "新名字", age: 20 });     // ✅ 改多个字段
updateUser(1, { unknown: 1 });                  // ❌ unknown 不是 User 的字段
\`\`\`

**实现原理**（TypeScript 内部大致等价于）：
\`\`\`tsx
type Partial<T> = { [K in keyof T]?: T[K] };
// 遍历 T 的每个 key K，给每个属性加 ?（可选标记）
\`\`\`

\`Partial\` 是"部分更新"场景的标准答案。

---

## 二、Required&lt;T&gt;：全部必填

和 Partial 相反，把所有可选属性变成必填（去掉 \`?\`）。

\`\`\`tsx
type Config = {
  host?: string;    // 可选
  port?: number;    // 可选
  debug?: boolean;  // 可选
};

type RequiredConfig = Required<Config>;
// 等价于：{ host: string; port: number; debug: boolean }（全部必填！）

// 在"必须填全"的场景强制要求
function init(config: RequiredConfig) {
  // config.host / config.port / config.debug 一定存在
}
\`\`\`

**React 场景**：当你从 props 或 context 拿到一个可能为 undefined 的配置，经过校验后断言为必填，\`Required\` 能精确表达"已校验"的类型。

---

## 三、Readonly&lt;T&gt;：全部只读

把 T 的所有属性变成只读（加 \`readonly\` 修饰符），赋值后不能再修改。

\`\`\`tsx
type User = { name: string; age: number };

type ReadonlyUser = Readonly<User>;
// 等价于：{ readonly name: string; readonly age: number }

const u: ReadonlyUser = { name: "张三", age: 25 };
u.name = "李四"; // ❌ 编译错误：Cannot assign to 'name' because it is a read-only property
\`\`\`

**React 场景**：React 的 state 和 props 本身就是不可变的（immutable），用 \`Readonly\` 或 \`readonly\` 修饰能在类型层面约束"不要直接修改 state"：

\`\`\`tsx
// props 默认就是只读的——不允许子组件修改
function UserCard({ user }: { readonly user: User }) {
  user.name = "xxx"; // ❌ 编译错误，防止误改 props
  return <div>{user.name}</div>;
}
\`\`\`

**实现原理**：
\`\`\`tsx
type Readonly<T> = { readonly [K in keyof T]: T[K] };
\`\`\`

---

## 四、Pick&lt;T, K&gt;：挑选部分字段

从 T 里挑出指定的字段 K。

\`\`\`tsx
type User = {
  id: number;
  name: string;
  email: string;
  password: string;  // 敏感字段
  age: number;
};

// 只挑公开信息——脱敏
type PublicUser = Pick<User, "id" | "name" | "email">;
// 等价于：{ id: number; name: string; email: string }（没有 password！）

// 返回给前端时去掉 password
function toPublic(u: User): PublicUser {
  return { id: u.id, name: u.name, email: u.email };
}
\`\`\`

**React 场景**：表单组件只接受实体的部分字段时，用 Pick 精确限定：

\`\`\`tsx
// 注册表单只需要 name/email/password，不需要 id/age
type RegisterForm = Pick<User, "name" | "email" | "password">;
\`\`\`

\`Pick\` 常用于"脱敏"和"子集选择"——从完整类型里挑出当前场景需要的字段。

---

## 五、Omit&lt;T, K&gt;：排除部分字段

和 Pick 相反，从 T 里**排除**字段 K。

\`\`\`tsx
type User = { id: number; name: string; email: string; password: string };

// 排除 password——更简洁的脱敏写法
type SafeUser = Omit<User, "password">;
// 等价于：{ id: number; name: string; email: string }

// 创建用户时还没有 id（id 由后端生成）
type CreateUserDTO = Omit<User, "id">;
// 等价于：{ name: string; email: string; password: string }
\`\`\`

**Pick vs Omit 怎么选？**
- 要的字段**少** → 用 \`Pick\`（列出需要的）
- 要的字段**多** → 用 \`Omit\`（列出不要的）
- \`Pick<User, "a" | "b">\` 等价于 \`Omit<User, "c" | "d">\`（互补）

**React 场景**：编辑表单通常排除 id/createdAt 等自动生成的字段：

\`\`\`tsx
type EditUserForm = Omit<User, "id" | "createdAt" | "updatedAt">;
\`\`\`

---

## 六、Record&lt;K, V&gt;：键值对映射

构造一个"键为 K、值为 V"的对象类型。

\`\`\`tsx
// 键是字符串，值是数字
type ScoreMap = Record<string, number>;
const scores: ScoreMap = { math: 90, english: 85 };

// 键是字面量联合，值是配置对象——强制完整性！
type Role = "admin" | "user" | "guest";
type RoleConfig = Record<Role, { label: string; color: string }>;

const roleConfig: RoleConfig = {
  admin: { label: "管理员", color: "#7c3aed" },
  user:  { label: "用户",   color: "#2563eb" },
  guest: { label: "访客",   color: "#6b7280" }
  // ⚠️ 少写 guest 会直接报错！必须三个角色都有配置
};
\`\`\`

\`Record<Role, V>\` 的威力：**漏写一个 key 会直接报错**，强制完整性。这是定义"配置映射表"的最佳工具类型。

**React 场景**：动态渲染 Tab、菜单项、权限表时，用 Record + 联合类型保证"每个状态都有对应的 UI"：

\`\`\`tsx
type Status = "idle" | "loading" | "success" | "error";

const statusConfig: Record<Status, { text: string; color: string }> = {
  idle:    { text: "空闲",   color: "#9ca3af" },
  loading: { text: "加载中", color: "#3b82f6" },
  success: { text: "成功",   color: "#22c55e" },
  error:   { text: "失败",   color: "#ef4444" },
  // 少写任何一个 status 都会编译报错！
};
\`\`\`

**实现原理**：
\`\`\`tsx
type Record<K extends keyof any, V> = { [P in K]: V };
// 遍历联合类型 K 的每个成员 P，值类型统一为 V
\`\`\`

---

## 七、ReturnType&lt;typeof fn&gt;：函数返回值类型

\`\`\`tsx
function fetchUser() {
  return { id: 1, name: "张三", email: "zs@example.com" };
}

type User = ReturnType<typeof fetchUser>;
// 等价于：{ id: number; name: string; email: string }
// 不用手写类型，函数改了返回值类型自动跟着变！
\`\`\`

\`typeof fetchUser\` 先拿到函数的类型，\`ReturnType\` 再提取返回值类型。**一处定义，处处同步**。

**React 场景**：自定义 Hook 的返回值类型，不用手写：

\`\`\`tsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const inc = () => setCount(c => c + 1);
  const dec = () => setCount(c => c - 1);
  return { count, inc, dec };
}

// 自动推导 Hook 的返回值类型
type CounterState = ReturnType<typeof useCounter>;
// { count: number; inc: () => void; dec: () => void }
\`\`\`

---

## 八、Parameters&lt;typeof fn&gt;：函数参数类型

\`\`\`tsx
function createUser(name: string, age: number, role: "admin" | "user") {
  return { name, age, role };
}

type CreateUserArgs = Parameters<typeof createUser>;
// 等价于：[string, number, "admin" | "user"] —— 元组类型！

const args: CreateUserArgs = ["张三", 20, "admin"]; // ✅
const bad: CreateUserArgs = ["张三", "20", "admin"]; // ❌ 第二个参数应该是 number
\`\`\`

返回的是**元组（Tuple）**，按参数顺序排列，可以用下标访问单个参数类型：

\`\`\`tsx
type FirstArg = CreateUserArgs[0];  // string
type SecondArg = CreateUserArgs[1]; // number
\`\`\`

**React 场景**：包装事件处理器时，复用原函数的参数类型：

\`\`\`tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) { ... }

// 提取参数类型，不用手动写 React.ChangeEvent<...>
type ChangeEvent = Parameters<typeof handleChange>[0];
\`\`\`

---

## 九、Exclude&lt;UnionType, ExcludedMembers&gt;：从联合类型中排除

从联合类型中排除掉指定的成员。

\`\`\`tsx
type Role = "admin" | "user" | "guest" | "banned";

// 排除被封禁的角色——普通用户能选的角色
type AssignableRole = Exclude<Role, "banned">;
// "admin" | "user" | "guest"

// 排除多个
type NonAdminRole = Exclude<Role, "admin" | "banned">;
// "user" | "guest"
\`\`\`

**React 场景**：从 props 的联合类型中排除某些不需要的变体：

\`\`\`tsx
type ButtonVariant = "primary" | "secondary" | "danger" | "link";
type NonLinkVariant = Exclude<ButtonVariant, "link">;
// "primary" | "secondary" | "danger"
\`\`\`

**实现原理**：
\`\`\`tsx
type Exclude<T, U> = T extends U ? never : T;
// 条件类型：T 的每个成员如果是 U 的子类型，就映射为 never（被排除），否则保留
\`\`\`

---

## 十、Extract&lt;UnionType, ExtractedMembers&gt;：从联合类型中提取

和 Exclude 相反，从联合类型中**提取**出指定的成员。

\`\`\`tsx
type AllEvents = "click" | "scroll" | "keydown" | "keyup" | "mousemove";

// 只提取键盘事件
type KeyboardEvent = Extract<AllEvents, \`key\${string}\`>;
// "keydown" | "keyup"

// 只提取鼠标事件
type MouseEvent = Extract<AllEvents, "click" | "mousemove" | "mousedown">;
// "click" | "mousemove"
\`\`\`

**React 场景**：从组件 props 的联合类型中提取特定变体：

\`\`\`tsx
type MessageProps =
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string; duration: number };

// 只提取图片类型的 props
type ImageProps = Extract<MessageProps, { type: "image" }>;
// { type: "image"; url: string; alt: string }
\`\`\`

---

## 十一、NonNullable&lt;T&gt;：排除 null 和 undefined

从 T 中排除 \`null\` 和 \`undefined\`。

\`\`\`tsx
type MaybeUser = User | null | undefined;

type ValidUser = NonNullable<MaybeUser>;
// User（去掉了 null 和 undefined）
\`\`\`

**React 场景**：经过条件判断/可选链后，TypeScript 有时不能自动收窄类型，\`NonNullable\` 可以手动收窄：

\`\`\`tsx
function Profile({ user }: { user: User | null }) {
  if (!user) return <div>加载中...</div>;
  // 经过 if 判断后，user 类型被自动收窄为 User
  // 但在更复杂的场景下（如 filter 后），可以用 NonNullable 断言：
  const validUsers = [user, null, user].filter(Boolean) as NonNullable<typeof user>[];
  return <div>{user.name}</div>;
}
\`\`\`

---

## 十二、Awaited&lt;T&gt;：解包 Promise 类型（TS 4.5+）

获取 Promise resolve 后的值类型，能递归解包嵌套 Promise。

\`\`\`tsx
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user");
  return res.json();
}

type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
// User（而不是 Promise<User>）

// 嵌套 Promise 也能解包
type Nested = Awaited<Promise<Promise<string>>>; // string
\`\`\`

**React 场景**：在自定义数据 Hook 中提取 API 返回值类型：

\`\`\`tsx
async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

// 不用手写 User[]，API 返回类型变了这里自动跟着变
type Users = Awaited<ReturnType<typeof getUsers>>; // User[]
\`\`\`

---

## 十三、ComponentProps：提取组件 Props

React 开发中最实用的类型技巧之一：

\`\`\`tsx
import type { ComponentProps } from "react";

// ✅ 提取原生 HTML 元素的 Props——注意是字符串 "button"，不是 typeof HTMLButtonElement！
type ButtonHTMLProps = ComponentProps<"button">;
// 等价于：React.ButtonHTMLAttributes<HTMLButtonElement>
// 包含 onClick、disabled、type、className、style 等所有原生 button 属性

// 包装原生 button：继承所有原生属性，不用手写一遍
function MyButton({ children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      {...rest}
      style={{ padding: "8px 16px", borderRadius: 6, ...rest.style }}
    >
      {children}
    </button>
  );
}

// <MyButton onClick={...} disabled={false} type="submit">  ✅ 全部原生属性可用

// 从自定义组件提取 Props
function Dialog(props: { title: string; open: boolean; onClose: () => void }) {
  return <div>{/* ... */}</div>;
}
type DialogProps = ComponentProps<typeof Dialog>;
// { title: string; open: boolean; onClose: () => void }
\`\`\`

**注意**：\`ComponentProps<"button">\` 传入的是字符串字面量（HTML 标签名），\`ComponentProps<typeof MyComponent>\` 传入的是 \`typeof\` 组件。**不要**写 \`ComponentProps<typeof HTMLButtonElement>\`——\`HTMLButtonElement\` 是 DOM 接口类型，不是 React 组件类型，会得到 never。

---

## 十四、组合使用：Partial&lt;Pick&lt;T, K&gt;&gt; 等嵌套

工具类型可以任意嵌套组合，精确表达复杂的类型意图：

\`\`\`tsx
type User = { id: number; name: string; email: string; age: number; role: string };

// 经典组合：只能更新 name 和 age，且都可选
type UserNameAgeUpdate = Partial<Pick<User, "name" | "age">>;
// { name?: string; age?: number }

function updateNameAge(id: number, patch: UserNameAgeUpdate) { ... }
updateNameAge(1, { name: "新名字" });       // ✅
updateNameAge(1, { email: "x@x.com" });     // ❌ email 不在允许范围
updateNameAge(1, { id: 2 });                // ❌ id 不可修改

// 另一个经典：创建用户时没有 id，但其他字段必填
type CreateUser = Omit<User, "id">;
// { name: string; email: string; age: number; role: string }（全部必填）

// 注册表单：只需要 name/email/password（从更大的 User 类型挑），且可选
type RegisterForm = Partial<Pick<User, "name" | "email">> & { password: string };
\`\`\`

**组合的核心思想**：从"大而全"的实体类型出发，用 Pick/Omit 选字段，用 Partial/Required 调整可选性，用 Record 做映射——类型即文档，类型即约束。

---

## 十五、as const 与 satisfies：不是工具类型，但必学

它们不是工具类型（语法关键字/操作符），但在 React + TS 开发中和工具类型同等重要。

### as const：字面量类型推断

默认情况下，\`const\` 数组/对象的类型会被**拓宽（widen）**：

\`\`\`tsx
const status = ["idle", "loading", "success"]; // 类型：string[]（拓宽了！）
const config = { mode: "dark" };               // 类型：{ mode: string }（拓宽了！）
\`\`\`

加 \`as const\` 后，类型变成**最窄的字面量**（readonly）：

\`\`\`tsx
const status = ["idle", "loading", "success"] as const;
// 类型：readonly ["idle", "loading", "success"]（精确到每个元素！）

const config = { mode: "dark" } as const;
// 类型：{ readonly mode: "dark" }（精确到值 "dark"！）

// 配合 typeof + [number] 拿到字面量联合类型
type Status = (typeof status)[number];
// "idle" | "loading" | "success"——不用手写联合，数组改了类型自动跟着变！
\`\`\`

\`as const\` 是"让常量保持精确字面量类型"的开关，常用于定义状态机、枚举替代品、配置常量表。

### satisfies 操作符（TS 4.9+）

\`satisfies\` 让一个值既**校验符合某类型**，又**保留精确字面量类型**：

\`\`\`tsx
type RouteConfig = Record<string, { path: string; auth: boolean }>;

// ❌ 直接标注类型：key 被拓宽为 string，routes.unknown 不报错
const routes1: RouteConfig = {
  home: { path: "/", auth: false },
  profile: { path: "/profile", auth: true }
};
routes1.unknown; // 不报错！因为 key 是 string（太宽了）

// ✅ 用 satisfies：校验符合 RouteConfig，同时保留精确 key
const routes2 = {
  home: { path: "/", auth: false },
  profile: { path: "/profile", auth: true }
} satisfies RouteConfig;

routes2.home.path;    // ✅ string（有类型提示）
routes2.profile.auth; // ✅ boolean
routes2.unknown;      // ❌ 报错！因为 key 被保留为 "home" | "profile"
\`\`\`

**对比三种写法**：
- \`const x: T = {...}\` → 校验且**拓宽**为 T（丢失精确信息）
- \`const x = {...}\` → 不校验，精确推断
- \`const x = {...} satisfies T\` → **校验且保留精确类型**（最推荐！）

\`satisfies\` 是定义配置表的最佳实践。

---

## 十六、Demo：配置驱动的表单构建器

下方 Demo 综合使用 \`Record\`、\`Pick\`、\`Partial\`、\`ReturnType\`、\`Parameters\`、\`Exclude\`、\`Awaited\`、\`as const\`、\`satisfies\` 等工具类型，构建一个**配置驱动的表单**：用一个配置对象定义字段（类型/标签/校验规则），表单组件根据配置自动渲染 + 校验，类型全程安全。

点击「▶ 运行」可以在控制台看到工具类型的运行时演示输出。

---

## 本章小结

✅ \`Partial<T>\`：全部可选 → PATCH 更新
✅ \`Required<T>\`：全部必填 → 校验后强保证
✅ \`Readonly<T>\`：全部只读 → 不可变数据/Props
✅ \`Pick<T, K>\` / \`Omit<T, K>\`：挑选/排除字段 → 脱敏、子集
✅ \`Record<K, V>\`：键值对映射 → 配置表，强制完整性
✅ \`ReturnType<typeof fn>\` / \`Parameters<typeof fn>\`：函数类型提取 → 自动同步
✅ \`Exclude<T, U>\` / \`Extract<T, U>\`：联合类型排除/提取 → 条件分支收窄
✅ \`NonNullable<T>\`：排除 null/undefined → 类型收窄
✅ \`Awaited<T>\`：解包 Promise → async 函数返回值
✅ \`ComponentProps<"button">\` / \`ComponentProps<typeof Comp>\`：提取 Props → 包装原生/自定义组件
✅ 组合：\`Partial<Pick<T, K>>\` 精确控制可更新字段
✅ \`as const\`：保留字面量类型，配合 \`typeof x[number]\` 拿联合
✅ \`satisfies\`：校验 + 保留精确类型，配置表最佳实践

实战篇完结！你已经掌握了 TypeScript + React 在真实项目里的核心模式。`,
    code: `// =============================================================
// 🛠️ 工具类型综合实战 Demo
// -------------------------------------------------------------
// 本文件分为两部分：
//   【第一部分】工具类型运行时演示 —— 用 console.log 输出每个工具类型
//              的实际效果，点击「▶ 运行」即可在控制台看到结果。
//              注意：TypeScript 类型在编译后会被擦除，这里我们通过
//              运行时代码（对象、数组、函数）来模拟/验证类型约束的效果。
//   【第二部分】配置驱动表单组件 —— 综合使用 Record/Pick/Partial/
//              ReturnType/satisfies/as const 的完整 React 组件。
//              这是真实项目中常见的模式，代码可在 React 项目中直接使用。
// =============================================================

import React, { useState, useMemo, useCallback } from "react";

// =============================================================
// 【第一部分】基础实体类型 —— 所有工具类型演示共用的基础类型
// =============================================================

// User 是我们贯穿全程的核心实体类型，模拟一个用户数据模型
type User = {
  id: number;           // 用户唯一 ID（由后端生成，前端不可修改）
  name: string;         // 用户名（必填，2-20字符）
  email: string;        // 邮箱（必填，需符合邮箱格式）
  age: number;          // 年龄（必填，0-120）
  role: "admin" | "user" | "guest";  // 角色（字面量联合类型，只能是三选一）
  password?: string;    // 密码（可选，某些场景下不返回）
};

// =============================================================
// 📦 工具类型演示 1：Partial<T> —— 全部属性变可选
// =============================================================
// 原理：{ [K in keyof T]?: T[K] } —— 遍历 T 的每个 key，加 ? 可选标记
// 用途：PATCH 更新（只改部分字段）、表单初始值（未填完时部分为空）
console.log("=== 1. Partial<T> 演示 ===");

// Partial<User> 等价于：{ id?: number; name?: string; email?: string; ... }
// 模拟 PATCH 请求——只更新 name 和 age，不用传全部字段
const userPatch: Partial<User> = {
  name: "新名字",
  age: 26,
  // ✅ 不需要传 id、email、role、password——它们都是可选的
};
console.log("PATCH 补丁（只更新部分字段）:", JSON.stringify(userPatch));
// 输出: {"name":"新名字","age":26}

// 模拟表单初始状态——还没填的时候所有字段都是空的
const emptyForm: Partial<User> = {};
console.log("空表单（所有字段可选）:", JSON.stringify(emptyForm));
// 输出: {}

// =============================================================
// 📦 工具类型演示 2：Required<T> —— 全部属性变必填
// =============================================================
// 原理：{ [K in keyof T]-?: T[K] } —— -? 表示去掉可选标记（变成必填）
// 用途：配置校验（确保所有配置项都填写了）、提交前的数据完整性检查
console.log("\\n=== 2. Required<T> 演示 ===");

// 定义一个"配置项可能缺失"的类型（模拟从外部传入的配置）
type AppConfig = {
  apiUrl?: string;     // API 地址（可选，可能有默认值）
  timeout?: number;    // 超时时间（可选）
  retryCount?: number; // 重试次数（可选）
};

// Required<AppConfig> 等价于：{ apiUrl: string; timeout: number; retryCount: number }
// 经过校验后，所有配置项都一定有值——用 Required 标记"已校验通过"
const validatedConfig: Required<AppConfig> = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retryCount: 3,
};
console.log("校验后的完整配置:", JSON.stringify(validatedConfig));
// 输出: {"apiUrl":"https://api.example.com","timeout":5000,"retryCount":3}

// =============================================================
// 📦 工具类型演示 3：Readonly<T> —— 全部属性只读
// =============================================================
// 原理：{ readonly [K in keyof T]: T[K] } —— 加 readonly 修饰符
// 用途：常量配置（不允许修改）、React Props（子组件不能修改父组件传的值）、
//       不可变数据（Redux/React state 更新模式）
console.log("\\n=== 3. Readonly<T> 演示 ===");

// Readonly<User> 等价于：{ readonly id: number; readonly name: string; ... }
// 模拟从后端获取的"冻结"用户数据——不允许前端直接修改
const frozenUser: Readonly<User> = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
  age: 25,
  role: "user",
};
console.log("只读用户数据:", JSON.stringify(frozenUser));
// frozenUser.name = "李四";  // ❌ 编译错误：Cannot assign to 'name' because it is read-only
// frozenUser.age = 30;       // ❌ 同上——Readonly 防止意外修改

// React 中正确的做法：创建新对象（不可变更新）
const updatedUser: User = { ...frozenUser, name: "李四", age: 26 };
console.log("不可变更新（创建新对象）:", JSON.stringify(updatedUser));
// 输出: {"id":1,"name":"李四","email":"zhangsan@example.com","age":26,"role":"user"}

// =============================================================
// 📦 工具类型演示 4：Pick<T, K> —— 挑选部分字段
// =============================================================
// 原理：{ [P in K]: T[P] } —— 只遍历 K 中指定的 key
// 用途：脱敏（去掉敏感字段如 password）、子集类型（表单只需要实体的部分字段）
console.log("\\n=== 4. Pick<T, K> 演示 ===");

// Pick<User, "id" | "name" | "email" | "role"> —— 只挑公开信息，排除 password 和 age
type PublicUser = Pick<User, "id" | "name" | "email" | "role">;
// 等价于：{ id: number; name: string; email: string; role: "admin"|"user"|"guest" }

// 模拟 API 返回给前端的公开用户信息（不含 password！）
const publicInfo: PublicUser = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
  role: "user",
  // ❌ 如果写 password: "123456" 会编译报错——Pick 里没有 password
};
console.log("公开用户信息（脱敏）:", JSON.stringify(publicInfo));
// 输出: {"id":1,"name":"张三","email":"zhangsan@example.com","role":"user"}

// 表单场景：注册表单只需要 name/email/password，不需要 id/age/role
type RegisterForm = Pick<User, "name" | "email" | "password">;
const registerData: RegisterForm = {
  name: "王五",
  email: "wangwu@example.com",
  password: "hashed_pw_xxx",
};
console.log("注册表单数据:", JSON.stringify(registerData));
// 输出: {"name":"王五","email":"wangwu@example.com","password":"hashed_pw_xxx"}

// =============================================================
// 📦 工具类型演示 5：Omit<T, K> —— 排除部分字段
// =============================================================
// 原理：Pick<T, Exclude<keyof T, K>> —— 从 T 的 key 中排除 K，然后 Pick
// 用途：与 Pick 互补，字段多的时候用 Omit 更简洁；创建实体时排除自动生成的字段
console.log("\\n=== 5. Omit<T, K> 演示 ===");

// Omit<User, "password"> —— 排除 password，等价于 Pick<User, "id"|"name"|"email"|"age"|"role">
type SafeUser = Omit<User, "password">;

// 创建用户时，id 由后端自增生成，前端不需要传——Omit 掉 id
type CreateUserDTO = Omit<User, "id">;
// 等价于：{ name: string; email: string; age: number; role: ...; password?: string }

const newUser: CreateUserDTO = {
  name: "赵六",
  email: "zhaoliu@example.com",
  age: 30,
  role: "admin",
  // id 不用传！如果写 id: 999 会编译报错
};
console.log("创建用户 DTO（无 id）:", JSON.stringify(newUser));
// 输出: {"name":"赵六","email":"zhaoliu@example.com","age":30,"role":"admin"}

// Pick vs Omit 选择指南：
//   要的字段少 → Pick（列出来的是需要的）
//   不要的字段少 → Omit（列出来的是排除的）
//   例如 User 有 6 个字段，只要 2 个 → Pick<User, "a"|"b">
//           User 有 6 个字段，只排除 1 个 → Omit<User, "id">

// =============================================================
// 📦 工具类型演示 6：Record<K, V> —— 键值对映射（强制完整性）
// =============================================================
// 原理：{ [P in K]: V } —— 遍历联合类型 K 的每个成员作为 key，值统一为 V
// 用途：配置映射表（每个状态/角色/类型都必须有对应的配置）、字典
console.log("\\n=== 6. Record<K, V> 演示 ===");

// 定义角色字面量联合类型
type Role = "admin" | "user" | "guest";

// Record<Role, { label: string; color: string }>
// 等价于：{ admin: {label,color}; user: {label,color}; guest: {label,color} }
// ⚠️ 如果少写任何一个角色的配置，TypeScript 会直接编译报错！
const roleConfig: Record<Role, { label: string; color: string }> = {
  admin: { label: "管理员", color: "#7c3aed" },
  user:  { label: "普通用户", color: "#2563eb" },
  guest: { label: "访客", color: "#6b7280" },
  // 如果注释掉 guest 这一行，编译会报错：Property 'guest' is missing
};
console.log("角色配置表（强制完整性）:", JSON.stringify(roleConfig, null, 2));

// 状态映射表——React 中常见的模式：每个状态对应一段 UI 配置
type LoadStatus = "idle" | "loading" | "success" | "error";
const statusMessage: Record<LoadStatus, string> = {
  idle:    "请点击按钮开始",
  loading: "数据加载中...",
  success: "加载成功！",
  error:   "加载失败，请重试",
};
console.log("状态消息映射:", JSON.stringify(statusMessage, null, 2));
// 任何一个 LoadStatus 值，都一定有对应的消息——不会出现"状态没处理"的 bug

// =============================================================
// 📦 工具类型演示 7：ReturnType<typeof fn> —— 提取函数返回值类型
// =============================================================
// 原理：infer 关键字推断函数返回类型——type ReturnType<F extends (...args: any) => any>
//       = F extends (...args: any) => infer R ? R : any
// 用途：从已有函数自动推导类型，不用手写；函数改了返回值，类型自动同步
console.log("\\n=== 7. ReturnType<typeof fn> 演示 ===");

// 定义一个创建空表单的工厂函数——返回表单初始值
// 注意：这里用 _demo 后缀，避免和下方表单组件中的同名函数冲突
function createEmptyFormDemo() {
  return { name: "", email: "", age: 0, role: "user" as const };
}

// ReturnType<typeof createEmptyFormDemo> 自动推导返回值类型
// 等价于：{ name: string; email: string; age: number; role: "user" }
type FormValuesDemo = ReturnType<typeof createEmptyFormDemo>;

const formDefaults: FormValuesDemo = createEmptyFormDemo();
console.log("表单初始值（从工厂函数推导类型）:", JSON.stringify(formDefaults));
// 输出: {"name":"","email":"","age":0,"role":"user"}
// ✅ 好处：如果以后 createEmptyFormDemo 加了字段（如 phone: ""），
//    FormValuesDemo 自动包含 phone，不用手动改类型定义！

// 模拟 async 函数的返回值类型提取
async function fetchUserById(id: number): Promise<{ id: number; name: string }> {
  // 真实代码会调用 fetch，这里直接返回模拟数据
  return { id, name: "用户" + id };
}
type FetchResult = ReturnType<typeof fetchUserById>;
// 注意：这里拿到的是 Promise<{ id: number; name: string }>，
// 需要 Awaited 才能拿到真正的 { id: number; name: string }（见演示 12）

// =============================================================
// 📦 工具类型演示 8：Parameters<typeof fn> —— 提取函数参数类型
// =============================================================
// 原理：infer 推断参数类型元组
// 用途：包装函数、事件处理、复用已有函数的参数类型定义
console.log("\\n=== 8. Parameters<typeof fn> 演示 ===");

// 注意：这里用 _demo 后缀，避免和下方表单组件中的 validateField 函数同名冲突
// （函数声明会被提升，同名函数会覆盖，导致 TDZ 错误）
function validateFieldDemo(
  fieldName: string,
  value: string,
  rules: { required?: boolean; min?: number; max?: number; pattern?: RegExp }
): string | null {
  if (rules.required && !value.trim()) return fieldName + "不能为空";
  if (rules.min && value.length < rules.min) return fieldName + "至少" + rules.min + "个字符";
  if (rules.max && value.length > rules.max) return fieldName + "最多" + rules.max + "个字符";
  return null;
}

// Parameters<typeof validateFieldDemo> 提取参数类型为元组：
// [string, string, { required?: boolean; min?: number; max?: number; pattern?: RegExp }]
type ValidateParams = Parameters<typeof validateFieldDemo>;

// 可以用下标访问单个参数的类型
type FieldNameType = ValidateParams[0];   // string
type RulesType = ValidateParams[2];       // { required?: boolean; ... }

const testParams: ValidateParams = [
  "姓名",
  "张三",
  { required: true, min: 2, max: 20 }
];
const errorMsg = validateFieldDemo(...testParams);
console.log("参数类型元组演示:", JSON.stringify(testParams), "→ 校验结果:", errorMsg || "✅ 通过");
// 输出: ["姓名","张三",{"required":true,"min":2,"max":20}] → 校验结果: null

// 便捷用法：提取事件处理函数的事件类型
type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
type ChangeEvent = Parameters<ChangeHandler>[0];
// ChangeEvent 就是 React.ChangeEvent<HTMLInputElement>——不用手动写一遍

// =============================================================
// 📦 工具类型演示 9：Exclude<T, U> —— 从联合类型中排除
// =============================================================
// 原理：T extends U ? never : T —— 如果 T 的成员是 U 的子类型，就映射为 never（删除）
// 用途：从联合类型中去掉某些成员，收窄类型范围
console.log("\\n=== 9. Exclude<T, U> 演示 ===");

type Permission = "read" | "write" | "delete" | "admin" | "banned";

// 排除被封禁的权限——正常用户的权限
type ActivePermission = Exclude<Permission, "banned">;
// "read" | "write" | "delete" | "admin"

// 排除管理员权限——普通用户的权限
type UserPermission = Exclude<Permission, "admin" | "banned">;
// "read" | "write" | "delete"

const userPerms: UserPermission[] = ["read", "write"];
console.log("普通用户权限（排除了 admin 和 banned）:", JSON.stringify(userPerms));
// 输出: ["read","write"]
// ❌ 如果写 "admin" 或 "banned" 会编译报错——它们被 Exclude 掉了

// React 场景：按钮变体中排除 link 类型（特殊处理）
type BtnVariant = "primary" | "secondary" | "danger" | "link";
type BtnVariantNoLink = Exclude<BtnVariant, "link">; // "primary"|"secondary"|"danger"

// =============================================================
// 📦 工具类型演示 10：Extract<T, U> —— 从联合类型中提取
// =============================================================
// 原理：T extends U ? T : never —— 与 Exclude 相反，只保留 U 中的成员
// 用途：从联合类型中挑选符合条件的成员，收窄类型
console.log("\\n=== 10. Extract<T, U> 演示 ===");

type AllEvents = "click" | "scroll" | "keydown" | "keyup" | "mousemove" | "mouseenter";

// 提取所有键盘事件（以 "key" 开头的）
type KeyboardEvents = Extract<AllEvents, \`key\${string}\`>;
// "keydown" | "keyup"——模板字面量类型匹配！

// 提取所有鼠标事件
type MouseEvents = Extract<AllEvents, \`mouse\${string}\` | "click">;
// "click" | "mousemove" | "mouseenter"

const keyboardHandlers: KeyboardEvents[] = ["keydown", "keyup"];
console.log("键盘事件列表:", JSON.stringify(keyboardHandlers));
// 输出: ["keydown","keyup"]

// 从判别联合类型中提取特定变体
type ApiResponse =
  | { status: "success"; data: { id: number; name: string } }
  | { status: "error"; message: string }
  | { status: "loading" };

type SuccessResponse = Extract<ApiResponse, { status: "success" }>;
// { status: "success"; data: { id: number; name: string } }
// 可以精确访问 .data 字段而不需要类型断言！

// =============================================================
// 📦 工具类型演示 11：NonNullable<T> —— 排除 null 和 undefined
// =============================================================
// 原理：T extends null | undefined ? never : T
// 用途：收窄可能为 null/undefined 的类型，filter 后数组元素类型断言
console.log("\\n=== 11. NonNullable<T> 演示 ===");

// 模拟一组可能包含 null 的用户列表（如搜索结果中未找到的项）
const usersOrNull: (User | null)[] = [
  { id: 1, name: "张三", email: "zs@example.com", age: 25, role: "user" },
  null,
  { id: 2, name: "李四", email: "ls@example.com", age: 30, role: "admin" },
  null,
  { id: 3, name: "王五", email: "ww@example.com", age: 28, role: "guest" },
];

// filter(Boolean) 过滤掉 null，但 TypeScript 不知道——类型仍然是 (User | null)[]
const filtered1 = usersOrNull.filter(Boolean);
console.log("filter(Boolean) 后类型（未收窄）—— 元素类型仍含 null:", typeof filtered1[1]);
// 运行时确实过滤了 null，但 TS 类型不知道

// 用 NonNullable 做类型断言（或类型守卫），告诉 TS 已经排除了 null
const validUsers = usersOrNull.filter((u): u is NonNullable<typeof u> => u !== null);
console.log("有效用户列表（NonNullable 收窄后）:");
validUsers.forEach(u => console.log("  -", u.name, "(" + u.role + ")"));
// 输出:
//   - 张三 (user)
//   - 李四 (admin)
//   - 王五 (guest)

// =============================================================
// 📦 工具类型演示 12：Awaited<T> —— 解包 Promise 类型（TS 4.5+）
// =============================================================
// 用途：获取 async 函数 resolve 后的值类型，递归解包嵌套 Promise
// 注意：这是类型层面的操作，运行时不改变任何行为
console.log("\\n=== 12. Awaited<T> 演示 ===");

// 模拟一个 async 函数
async function getUserList(): Promise<User[]> {
  // 真实代码会 await fetch(...)，这里直接返回模拟数据
  return [
    { id: 1, name: "张三", email: "zs@example.com", age: 25, role: "user" },
    { id: 2, name: "李四", email: "ls@example.com", age: 30, role: "admin" },
  ];
}

// ReturnType<typeof getUserList> 是 Promise<User[]>
// Awaited<...> 解包 Promise，得到 User[]
type UserList = Awaited<ReturnType<typeof getUserList>>;
// User[]——而不是 Promise<User[]>！

// 运行时调用（沙箱中 fetch 不可用，直接模拟输出）
console.log("Awaited 解包 Promise 类型 → 得到 User[]");
console.log("嵌套 Promise 解包: Awaited<Promise<Promise<string>>> = string");

// =============================================================
// 📦 工具类型演示 13：as const —— 字面量类型推断（最窄类型）
// =============================================================
// 原理：as const 将对象/数组的类型推断为最窄的只读字面量类型
// 用途：定义常量配置、枚举替代、配合 typeof x[number] 生成字面量联合类型
console.log("\\n=== 13. as const 演示 ===");

// ❌ 不用 as const：类型被拓宽（widen）
const STATUS_WITHOUT = ["idle", "loading", "success", "error"];
// 类型：string[]——太宽泛！可以 push 任何字符串
STATUS_WITHOUT.push("unknown"); // 不报错，但这不是我们想要的

// ✅ 用 as const：类型是 readonly 元组，每个元素都是精确字面量
const STATUS = ["idle", "loading", "success", "error"] as const;
// 类型：readonly ["idle", "loading", "success", "error"]
// STATUS.push("unknown");  // ❌ 编译错误：readonly 数组没有 push 方法！
// STATUS[0] = "xxx";      // ❌ 编译错误：元素是 readonly 的

// 最强大的用法：从 as const 数组派生字面量联合类型
type StatusType = (typeof STATUS)[number];
// "idle" | "loading" | "success" | "error"——不用手写联合类型！
// 如果以后在 STATUS 数组里加了 "cancelled"，StatusType 自动包含它

console.log("状态常量（as const 保留精确字面量）:", JSON.stringify(STATUS));
// 输出: ["idle","loading","success","error"]

// 对象也可以 as const
const API_ENDPOINTS = {
  users: "/api/users",
  posts: "/api/posts",
  comments: "/api/comments",
} as const;
// 类型：{ readonly users: "/api/users"; readonly posts: "/api/posts"; ... }
// API_ENDPOINTS.users = "/other";  // ❌ 不能修改

// 派生 API 路径联合类型
type ApiPath = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
// "/api/users" | "/api/posts" | "/api/comments"
console.log("API 端点配置:", JSON.stringify(API_ENDPOINTS));

// =============================================================
// 📦 工具类型演示 14：satisfies —— 校验 + 保留精确类型（TS 4.9+）
// =============================================================
// 原理：satisfies 是操作符不是类型，它校验值符合某类型，但不拓宽类型
// 对比：
//   const x: T = {...} → 校验且拓宽为 T（丢失精确信息）
//   const x = {...} satisfies T → 校验但保留精确类型（最佳方案！）
console.log("\\n=== 14. satisfies 演示 ===");

// 定义路由配置类型：每个路由有 path 和 auth（是否需要登录）
type RouteConfig = Record<string, { path: string; auth: boolean }>;

// ✅ 用 satisfies：校验符合 RouteConfig，同时保留精确 key 类型
const routes = {
  home:     { path: "/",         auth: false },
  profile:  { path: "/profile",  auth: true  },
  admin:    { path: "/admin",    auth: true  },
  login:    { path: "/login",    auth: false },
} satisfies RouteConfig;

// 因为保留了精确 key，TypeScript 知道 routes 只有这 4 个 key
// routes.unknown;  // ❌ 编译报错：Property 'unknown' does not exist
// 而如果写 const routes: RouteConfig = {...}，key 会被拓宽为 string，
// routes.unknown 不会报错——这就是 satisfies 的价值！

console.log("路由配置（satisfies 保留精确 key）:", JSON.stringify(routes, null, 2));
// home.path 的类型是 string（因为 RouteConfig 里定义了 path: string），
// 但 routes.home 的类型是精确的 { path: "/"; auth: false }，不是宽泛的 RouteConfig 值类型

// 表单字段类型用 as const + satisfies 组合（下方表单 Demo 就是这个模式）
const formFields = {
  name: {
    label: "姓名",
    type: "text" as const,    // as const 让 type 字段是字面量 "text" 而非 string
    placeholder: "请输入姓名",
    required: true,
    min: 2,
    max: 20,
  },
  email: {
    label: "邮箱",
    type: "email" as const,   // 字面量 "email"
    placeholder: "example@xx.com",
    required: true,
  },
  age: {
    label: "年龄",
    type: "number" as const,  // 字面量 "number"
    placeholder: "0-120",
    required: true,
    min: 0,
    max: 120,
  },
  role: {
    label: "角色",
    type: "select" as const,  // 字面量 "select"
    options: ["admin", "user", "guest"] as const,
    required: true,
  },
};
// as const 在 type 字段上——让 TypeScript 精确知道每个字段是哪种输入类型
// 这样在条件判断 cfg.type === "email" 时，TypeScript 能自动收窄类型

console.log("\\n表单字段配置数量:", Object.keys(formFields).length);
// 输出: 4

// =============================================================
// 【第二部分】配置驱动表单组件 —— 综合实战
// =============================================================
// 这个表单组件综合使用了以下工具类型/技巧：
//   - Record<K, V>          字段配置表，确保每个字段类型都有配置
//   - Pick<T, K>            从 User 中挑选可编辑字段（排除 id、password）
//   - Partial<T>            表单错误对象，每个字段可选（没有错误的字段为 undefined）
//   - ReturnType<typeof fn> 从工厂函数推导表单值类型
//   - as const              字段类型字面量精确推断
//   - satisfies             配置校验 + 保留精确 key 类型
//   - keyof                操作符获取类型的所有 key
//
// 工作原理：
//   1. 定义 FORM_CONFIG 配置对象（用 satisfies 校验 + 保留精确类型）
//   2. 根据配置自动渲染表单字段（input/select）
//   3. 根据配置的校验规则（required/min/max/pattern）实时校验
//   4. 提交时收集所有字段值，生成 Partial<Pick<...>> 补丁对象
// =============================================================

// --- 类型定义 ---

// 字段输入类型字面量联合——与 formFields 中 type 字段的 as const 值对应
type FieldType = "text" | "email" | "number" | "select";

// 单个字段的配置结构
type FieldConfig = {
  label: string;                          // 字段显示名称（中文标签）
  type: FieldType;                        // 输入框类型：text/email/number/select
  placeholder?: string;                   // 占位提示文本
  options?: readonly string[];            // select 类型的选项列表（readonly 来自 as const）
  min?: number;                           // 最小值（number 类型）或最小长度（text 类型）
  max?: number;                           // 最大值或最大长度
  required?: boolean;                     // 是否必填
};

// --- 核心工具类型组合 ---

// ① Pick：从 User 中挑选可编辑字段（排除 id 和 password——它们不由表单编辑）
type EditableUser = Pick<User, "name" | "email" | "age" | "role">;
// 等价于：{ name: string; email: string; age: number; role: "admin"|"user"|"guest" }

// ② Partial：表单错误对象——每个字段的错误信息都是可选的（没错误就没有这个 key）
//   Record：键是 EditableUser 的 key，值是错误消息字符串
type FormErrors = Partial<Record<keyof EditableUser, string>>;
// 等价于：{ name?: string; email?: string; age?: string; role?: string }

// ③ Partial<Pick<...>> 组合：提交补丁——只包含可编辑字段，且都是可选的
//    （实际提交时所有必填字段都已校验通过，但类型上仍然是可选的）
type UserPatch = Partial<EditableUser>;

// ④ ReturnType：从工厂函数自动推导表单值类型
//    好处：如果 createEmptyForm 加了字段，FormValues 自动包含
function createEmptyForm(): EditableUser {
  return { name: "", email: "", age: 0, role: "user" };
}
type FormValues = ReturnType<typeof createEmptyForm>;

// --- 表单配置（satisfies + as const 组合）---

// FORM_CONFIG 用 satisfies 校验符合 Record<string, FieldConfig>，
// 同时保留每个字段的精确 key 名称（"name" | "email" | "age" | "role"），
// type 字段用 as const 保留字面量类型（"text" 而非宽泛的 string），
// 这样 TypeScript 在条件分支中能自动收窄 cfg.type 的类型。
const FORM_CONFIG = {
  name: {
    label: "姓名",
    type: "text" as const,
    placeholder: "请输入姓名",
    required: true,
    min: 2,
    max: 20,
  },
  email: {
    label: "邮箱",
    type: "email" as const,
    placeholder: "example@xx.com",
    required: true,
  },
  age: {
    label: "年龄",
    type: "number" as const,
    placeholder: "0-120",
    required: true,
    min: 0,
    max: 120,
  },
  role: {
    label: "角色",
    type: "select" as const,
    options: ["admin", "user", "guest"] as const,
    required: true,
  },
} satisfies Record<string, FieldConfig>;

// --- 校验函数 ---

/**
 * 校验单个字段的值，返回错误消息字符串（空字符串表示校验通过）。
 * @param key   - 字段名（EditableUser 的 key 之一）
 * @param value - 字段当前值（string 来自 input，number 来自 age 转换）
 * @returns 错误消息，"" 表示无错误
 */
function validateField(key: keyof EditableUser, value: string | number): string {
  // 根据 key 从配置表中获取该字段的配置
  // FORM_CONFIG[key] 的类型是精确的（satisfies 保留了 key 信息），
  // TypeScript 能自动推断 cfg 的结构
  const cfg = FORM_CONFIG[key];
  const str = String(value).trim();

  // 必填校验
  if (cfg.required && str === "") return \`\${cfg.label}不能为空\`;

  // 邮箱格式校验（只有 email 类型才检查）
  // 因为 type 字段用了 as const，这里 TypeScript 知道 cfg.type === "email" 时
  // cfg 的类型被收窄为 email 配置（不过这里没有 email 专属字段，只是演示）
  if (cfg.type === "email" && str && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(str)) {
    return "邮箱格式不正确";
  }

  // 数字范围校验（number 类型）
  if (cfg.type === "number" && str) {
    const n = Number(str);
    if (Number.isNaN(n)) return \`\${cfg.label}必须是数字\`;
    if (cfg.min !== undefined && n < cfg.min) return \`\${cfg.label}不能小于 \${cfg.min}\`;
    if (cfg.max !== undefined && n > cfg.max) return \`\${cfg.label}不能大于 \${cfg.max}\`;
  }

  // 文本长度校验（text 类型）
  if (cfg.type === "text" && str) {
    if (cfg.min !== undefined && str.length < cfg.min) return \`\${cfg.label}至少 \${cfg.min} 个字符\`;
    if (cfg.max !== undefined && str.length > cfg.max) return \`\${cfg.label}最多 \${cfg.max} 个字符\`;
  }

  return ""; // 校验通过
}

// --- 测试校验函数（在控制台输出）---
// 辅助函数：美化校验结果输出——空字符串（通过）显示为 ✅，否则显示错误消息
function showValidateResult(key: keyof EditableUser, value: string | number, label: string) {
  const msg = validateField(key, value);
  console.log(label + ":", msg || "✅ 通过");
}

console.log("\\n=== 表单校验函数测试 ===");
showValidateResult("name", "", "空姓名");                          // 姓名不能为空
showValidateResult("name", "A", "姓名过短");                       // 姓名至少 2 个字符
showValidateResult("name", "张三", "合法姓名");                     // ✅ 通过
showValidateResult("email", "bad-email", "非法邮箱");              // 邮箱格式不正确
showValidateResult("email", "a@b.com", "合法邮箱");                // ✅ 通过
showValidateResult("age", "-1", "年龄负数");                       // 年龄不能小于 0
showValidateResult("age", "200", "年龄超限");                      // 年龄不能大于 120
showValidateResult("age", "25", "合法年龄");                       // ✅ 通过

// --- 配置驱动表单组件 ---

function ConfigForm() {
  // 表单值状态：初始值从工厂函数创建
  // FormValues 类型由 ReturnType<typeof createEmptyForm> 自动推导
  const [values, setValues] = useState<FormValues>(createEmptyForm());

  // 错误状态：Partial<Record<...>> 意味着每个字段可能有错误，也可能没有
  const [errors, setErrors] = useState<FormErrors>({});

  // 提交成功后生成的补丁对象（Partial<EditableUser>）
  const [patch, setPatch] = useState<UserPatch | null>(null);

  // 字段列表：从配置对象的 key 获取，自动保持和配置同步
  // as (keyof EditableUser)[] 是类型断言——因为 FORM_CONFIG 的 key 正好就是 EditableUser 的 key
  const fields = Object.keys(FORM_CONFIG) as (keyof EditableUser)[];

  // useCallback：字段更新函数，memoize 避免不必要的重渲染
  const update = useCallback((key: keyof EditableUser, value: string) => {
    // 根据字段类型转换值：age 转为 number，其余保持 string
    const next: FormValues = {
      ...values,
      [key]: key === "age" ? (value === "" ? 0 : Number(value)) : value,
    };
    setValues(next);

    // 实时校验：每次输入都检查该字段
    const msg = validateField(key, next[key]);
    // 更新错误对象：有错误就设置，没错误就设为 undefined（删除该 key）
    setErrors(prev => ({ ...prev, [key]: msg || undefined }));
  }, [values]);

  // 提交处理
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // 阻止表单默认提交行为

    // 全量校验：遍历所有字段，收集错误
    const allErrors: FormErrors = {};
    fields.forEach(key => {
      const msg = validateField(key, values[key]);
      if (msg) allErrors[key] = msg;
    });
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      // 校验通过：生成补丁对象（Partial<EditableUser>）
      // 这个补丁可以直接传给 PATCH API
      const submitPatch: UserPatch = { ...values };
      setPatch(submitPatch);
      console.log("✅ 表单提交成功，补丁数据:", JSON.stringify(submitPatch, null, 2));
    } else {
      setPatch(null);
      console.log("❌ 表单校验失败:", JSON.stringify(allErrors));
    }
  }

  // useMemo：计算表单是否有效（没有错误且必填字段非空）
  const isValid = useMemo(() => {
    return fields.every(key => !errors[key] &&
      (!FORM_CONFIG[key].required || String(values[key]).trim() !== ""));
  }, [errors, values, fields]);

  return (
    <div>
      <form onSubmit={handleSubmit} style={{
        padding: 20, background: "white", borderRadius: 10,
        border: "1px solid #e5e7eb"
      }}>
        {/* 根据 fields 数组动态渲染表单项——配置驱动！ */}
        {fields.map(key => {
          const cfg = FORM_CONFIG[key];
          const err = errors[key];
          return (
            <div key={key} style={{ marginBottom: 14 }}>
              {/* 字段标签 */}
              <label style={{
                display: "block", marginBottom: 5, fontWeight: 600, fontSize: 13, color: "#374151"
              }}>
                {cfg.label}
                {cfg.required ? <span style={{ color: "#dc2626" }}> *</span> : null}
              </label>

              {/* 根据字段类型渲染不同的输入控件 */}
              {cfg.type === "select" ? (
                // select 下拉框
                <select
                  value={values[key] as string}
                  onChange={e => update(key, e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px", boxSizing: "border-box",
                    border: \`1px solid \${err ? "#fca5a5" : "#d1d5db"}\`,
                    borderRadius: 6, fontSize: 14, outline: "none"
                  }}
                >
                  {/* cfg.options 来自 as const 配置，类型安全 */}
                  {(cfg.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                // input 输入框（text/email/number）
                <input
                  type={cfg.type}
                  value={values[key] as string | number}
                  onChange={e => update(key, e.target.value)}
                  placeholder={cfg.placeholder}
                  style={{
                    width: "100%", padding: "9px 12px", boxSizing: "border-box",
                    border: \`1px solid \${err ? "#fca5a5" : "#d1d5db"}\`,
                    borderRadius: 6, fontSize: 14, outline: "none"
                  }}
                />
              )}

              {/* 错误提示（红色文字）*/}
              {err ? (
                <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{err}</div>
              ) : null}
            </div>
          );
        })}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={!isValid}
          style={{
            width: "100%", padding: "11px 0", border: "none", borderRadius: 6,
            background: isValid ? "#3b82f6" : "#93c5fd",
            color: "white", fontSize: 15, fontWeight: 600,
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          提交（生成 Partial&lt;Pick&gt; 补丁）
        </button>
      </form>

      {/* 提交成功后显示补丁数据 */}
      {patch ? (
        <div style={{
          marginTop: 16, padding: 14, borderRadius: 8,
          background: "#f0fdf4", border: "1px solid #bbf7d0"
        }}>
          <div style={{ fontWeight: 600, color: "#15803d", marginBottom: 6, fontSize: 13 }}>
            ✅ UserPatch（Partial&lt;Pick&lt;User, "name"|"email"|"age"|"role"&gt;&gt;）
          </div>
          <pre style={{
            margin: 0, fontSize: 12, color: "#166534",
            fontFamily: "monospace", whiteSpace: "pre-wrap"
          }}>
{JSON.stringify(patch, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

// --- 主组件 ---

export default function Demo() {
  // useMemo：工具类型清单，不会改变所以不需要重新计算
  const usedTypes = useMemo(() => [
    { name: "Partial<T>", desc: "全部可选，表单错误/PATCH 补丁" },
    { name: "Required<T>", desc: "全部必填，配置校验" },
    { name: "Readonly<T>", desc: "全部只读，不可变数据" },
    { name: "Pick<T, K>", desc: "挑选字段，脱敏/子集" },
    { name: "Omit<T, K>", desc: "排除字段，创建 DTO" },
    { name: "Record<K, V>", desc: "键值映射，配置表强制完整" },
    { name: "ReturnType<F>", desc: "函数返回值类型自动推导" },
    { name: "Parameters<F>", desc: "函数参数类型元组" },
    { name: "Exclude<U, E>", desc: "联合类型排除" },
    { name: "Extract<U, M>", desc: "联合类型提取" },
    { name: "NonNullable<T>", desc: "排除 null/undefined" },
    { name: "Awaited<T>", desc: "解包 Promise 类型" },
    { name: "as const", desc: "保留字面量最窄类型" },
    { name: "satisfies", desc: "校验 + 保留精确类型" },
  ], []);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>🛠️ 配置驱动表单（工具类型实战）</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
        用 Partial / Pick / Omit / Record / ReturnType / Exclude / Awaited / as const / satisfies 构建
      </p>

      {/* 使用的工具类型清单标签 */}
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16
      }}>
        {usedTypes.map(t => (
          <span key={t.name} title={t.desc} style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 11,
            background: "#ede9fe", color: "#6d28d9", fontFamily: "monospace"
          }}>
            {t.name}
          </span>
        ))}
      </div>

      <ConfigForm />
    </div>
  );
}

// =============================================================
// 🎯 运行时总结（点击「▶ 运行」后在控制台查看）
// =============================================================
console.log("\\n" + "=".repeat(60));
console.log("📋 工具类型总结：");
console.log("  1. Partial<T>       → 全部可选 → PATCH 更新、表单错误");
console.log("  2. Required<T>      → 全部必填 → 配置校验、完整性保证");
console.log("  3. Readonly<T>      → 全部只读 → 不可变数据、Props保护");
console.log("  4. Pick<T, K>       → 挑选字段 → 脱敏、表单子集");
console.log("  5. Omit<T, K>       → 排除字段 → DTO、排除自动字段");
console.log("  6. Record<K, V>     → 键值映射 → 配置表（强制完整性）");
console.log("  7. ReturnType<F>    → 返回值类型 → 自动推导、Hook 返回值");
console.log("  8. Parameters<F>    → 参数元组 → 事件参数类型复用");
console.log("  9. Exclude<U, E>    → 联合排除 → 权限/变体收窄");
console.log(" 10. Extract<U, M>    → 联合提取 → 判别联合匹配");
console.log(" 11. NonNullable<T>   → 非空断言 → filter 后类型收窄");
console.log(" 12. Awaited<T>       → 解包Promise → async返回值类型");
console.log(" 13. as const         → 字面量类型 → 常量、枚举替代");
console.log(" 14. satisfies        → 校验+精确 → 配置表最佳实践");
console.log("=".repeat(60));
`,
  },

];
