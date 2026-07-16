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

// ==============================
// 类型定义
// ==============================
type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
};

// 判别联合：API 响应
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// 自定义错误类
class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

// 请求状态：判别联合
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// ==============================
// 模拟 API（30% 概率失败，方便观察错误处理）
// ==============================
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

    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new ApiError("请求已取消", 0));
    });
  });
}

// 泛型安全请求封装
async function safeRequest<T>(fetcher: (signal: AbortSignal) => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await fetcher(new AbortController().signal);
    return { success: true, data };
  } catch (e) {
    if (e instanceof ApiError && e.code !== 0) {
      return { success: false, error: e.message };
    }
    return { success: false, error: e instanceof Error ? e.message : "未知错误" };
  }
}

// ==============================
// 自定义 Hook：useUsers
// ==============================
function useUsers() {
  const [state, setState] = useState<RequestState<User[]>>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // 取消上一个请求（解决竞态）
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading" });
    try {
      const users = await mockFetchUsers(controller.signal);
      setState({ status: "success", data: users });
    } catch (e) {
      // 忽略主动取消的错误
      if (e instanceof ApiError && e.code === 0) return;
      setState({
        status: "error",
        error: e instanceof ApiError ? \`[\${e.code}] \${e.message}\` : "未知错误"
      });
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
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

// ==============================
// 类型定义（相当于 z.infer 的产物）
// ==============================
type FormValues = {
  name: string;
  email: string;
  password: string;
  age: number | ""; // 空输入占位
};

// 字段错误：每个字段可能有错误，也可能没有
type FieldErrors = Partial<Record<keyof FormValues, string>>;

// ==============================
// 手写校验规则配置（相当于 zod schema）
// 每个字段配一组规则 + 中文错误信息
// ==============================
type Rule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

const rules: Record<keyof FormValues, Rule<FormValues[keyof FormValues]>[]> = {
  name: [
    { validate: v => (v as string).trim().length >= 2, message: "用户名至少需要 2 个字符" },
    { validate: v => (v as string).trim().length <= 20, message: "用户名最多 20 个字符" }
  ],
  email: [
    { validate: v => (v as string).trim().length > 0, message: "邮箱不能为空" },
    { validate: v => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v as string), message: "请输入正确的邮箱地址" }
  ],
  password: [
    { validate: v => (v as string).length >= 6, message: "密码至少 6 位" },
    { validate: v => (v as string).length <= 20, message: "密码最多 20 位" },
    { validate: v => /[0-9]/.test(v as string), message: "密码必须包含至少一个数字" }
  ],
  age: [
    { validate: v => v !== "" && !isNaN(v as number), message: "年龄不能为空" },
    { validate: v => v === "" || (v as number) >= 18, message: "必须年满 18 岁" },
    { validate: v => v === "" || (v as number) <= 120, message: "年龄不合法" }
  ]
};

// 校验单个字段
function validateField(key: keyof FormValues, value: FormValues[keyof FormValues]): string {
  for (const rule of rules[key]) {
    if (!rule.validate(value)) return rule.message;
  }
  return "";
}

// 校验全部
function validateAll(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(rules) as (keyof FormValues)[]).forEach(key => {
    const msg = validateField(key, values[key]);
    if (msg) errors[key] = msg;
  });
  return errors;
}

// ==============================
// 通用 Field 组件
// ==============================
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

// ==============================
// 主组件
// ==============================
export default function Demo() {
  const [values, setValues] = useState<FormValues>({
    name: "", email: "", password: "", age: ""
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    name: false, email: false, password: false, age: false
  });
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  // 通用更新：K extends keyof 让字段名和值类型强绑定
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
    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched({ name: true, email: true, password: true, age: true });
    if (Object.keys(allErrors).length === 0) {
      setSubmitted({ ...values });
    } else {
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

// ==============================
// 类型定义：模拟 Next.js 路由参数
// ==============================
type FilterParams = {
  keyword: string;
  category: string[];        // 多选
  sortBy: "newest" | "price" | "popular";
  page: number;
  size: number;
};

// 类型安全的解析工具
function parseNumber(value: string | null, defaultValue: number): number {
  if (value === null) return defaultValue;
  const n = Number(value);
  return Number.isNaN(n) ? defaultValue : n;
}

// 从 URLSearchParams 解析成强类型对象
function parseFilters(sp: URLSearchParams): FilterParams {
  const category = sp.get("category");
  const sortBy = sp.get("sortBy");
  return {
    keyword: sp.get("keyword") ?? "",
    category: category ? category.split(",").filter(Boolean) : [],
    sortBy: sortBy === "price" || sortBy === "popular" ? sortBy : "newest",
    page: Math.max(1, parseNumber(sp.get("page"), 1)),
    size: Math.min(50, Math.max(1, parseNumber(sp.get("size"), 5)))
  };
}

// 把 FilterParams 序列化回 URLSearchParams（模拟路由同步）
function serializeFilters(f: FilterParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.keyword) sp.set("keyword", f.keyword);
  if (f.category.length) sp.set("category", f.category.join(","));
  sp.set("sortBy", f.sortBy);
  sp.set("page", String(f.page));
  sp.set("size", String(f.size));
  return sp;
}

// ==============================
// 模拟数据
// ==============================
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

// ==============================
// 主组件
// ==============================
export default function Demo() {
  // 用 URLSearchParams 模拟真实路由（初始带一些参数）
  const [sp, setSp] = useState<URLSearchParams>(() => {
    const init = new URLSearchParams("?keyword=&sortBy=newest&page=1&size=5");
    return init;
  });

  const filters = useMemo(() => parseFilters(sp), [sp]);

  // 过滤 + 排序 + 分页
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
  const updateFilter = useCallback(<K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
    const next: FilterParams = { ...filters, [key]: value, page: 1 };
    setSp(serializeFilters(next));
  }, [filters]);

  const setPage = useCallback((page: number) => {
    const next = { ...filters, page };
    setSp(serializeFilters(next));
  }, [filters]);

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
type DeclKind = "css" | "image" | "global";

type DeclExample = {
  kind: DeclKind;
  title: string;
  icon: string;
  before: string;
  after: string;
  fileName: string;
  code: string;
};

// ==============================
// 三类声明的示例数据
// ==============================
const DECLARATIONS: DeclExample[] = [
  {
    kind: "css",
    title: "CSS Modules 声明",
    icon: "🎨",
    fileName: "global.d.ts",
    before: "import styles from './Button.module.css';\n// ❌ Cannot find module",
    after: "styles.primary;  // ✅ string（带补全）",
    code: [
      "declare module '*.module.css' {",
      "  const classes: { readonly [key: string]: string };",
      "  export default classes;",
      "}",
      "",
      "declare module '*.module.scss' {",
      "  const classes: { readonly [key: string]: string };",
      "  export default classes;",
      "}"
    ].join("\\n")
  },
  {
    kind: "image",
    title: "图片导入声明",
    icon: "🖼️",
    fileName: "global.d.ts",
    before: "import logo from './logo.svg';\n// ❌ Cannot find module",
    after: "const src: string = logo;  // ✅",
    code: [
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
    ].join("\\n")
  },
  {
    kind: "global",
    title: "全局 Window 扩展",
    icon: "🌍",
    fileName: "global.d.ts",
    before: "window.myAnalytics('click');\n// ❌ Property 'myAnalytics' does not exist",
    after: "window.myAnalytics('click');  // ✅ 有类型",
    code: [
      "export {}; // 关键：让文件成为模块",
      "",
      "declare global {",
      "  interface Window {",
      "    myAnalytics: (event: string, payload?: Record<string, unknown>) => void;",
      "    __APP_VERSION__: string;",
      "  }",
      "}"
    ].join("\\n")
  }
];

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
    { kind: "global", label: "全局扩展", icon: "🌍" }
  ];

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>📦 第三方库类型扩展</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
        用 declare module 补全 CSS / 图片 / 全局类型
      </p>

      {/* Tab 切换 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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

TypeScript 内置了一批**工具类型（Utility Types）**，能从已有类型快速派生新类型。掌握它们，能让你的代码"以类型为参数"编程，复用度极高。

本章逐一讲解最常用的工具类型，并在最后用一个"配置驱动表单"Demo 把它们串起来。

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
// PATCH 请求只更新部分字段
async function updateUser(id: number, patch: Partial<User>) {
  // patch 里每个字段都是可选的
  const res = await fetch(\`/api/users/\${id}\`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
  return res.json();
}

// 可以只传 name
updateUser(1, { name: "新名字" }); // ✅
// 也可以传多个
updateUser(1, { name: "新名字", age: 20 }); // ✅
updateUser(1, { unknown: 1 }); // ❌ 不是 User 的字段
\`\`\`

\`Partial\` 是"部分更新"场景的标准答案。

---

## 二、Required&lt;T&gt;：全部必填

和 Partial 相反，把所有可选属性变成必填。

\`\`\`tsx
type Config = {
  host?: string;
  port?: number;
  debug?: boolean;
};

type RequiredConfig = Required<Config>;
// 等价于：{ host: string; port: number; debug: boolean }

// 在某些"必须填全"的场景强制要求
function init(config: RequiredConfig) { ... }
\`\`\`

---

## 三、Pick&lt;T, K&gt;：挑选部分字段

从 T 里挑出指定的字段 K。

\`\`\`tsx
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;
};

// 只挑公开信息
type PublicUser = Pick<User, "id" | "name" | "email">;
// 等价于：{ id: number; name: string; email: string }

// 返回给前端时去掉 password
function toPublic(u: User): PublicUser {
  return { id: u.id, name: u.name, email: u.email };
}
\`\`\`

\`Pick\` 常用于"脱敏"——从完整类型里挑出安全可暴露的字段。

---

## 四、Omit&lt;T, K&gt;：排除部分字段

和 Pick 相反，从 T 里**排除**字段 K。

\`\`\`tsx
type User = { id: number; name: string; email: string; password: string; };

// 排除 password
type SafeUser = Omit<User, "password">;
// 等价于：{ id: number; name: string; email: string }

// 创建用户时还没有 id（id 由后端生成）
type CreateUserDTO = Omit<User, "id">;
// 等价于：{ name: string; email: string; password: string }
\`\`\`

\`Pick<User, "a" | "b">\` 等价于 \`Omit<User, "c" | "d">\`（互补）。字段少用 Pick，字段多用 Omit。

---

## 五、Record&lt;K, V&gt;：键值对映射

构造一个"键为 K、值为 V"的对象类型。

\`\`\`tsx
// 键是字符串，值是数字
type ScoreMap = Record<string, number>;
const scores: ScoreMap = { math: 90, english: 85 };

// 键是字面量联合，值是配置对象
type Role = "admin" | "user" | "guest";
type RoleConfig = Record<Role, { label: string; color: string }>;

const roleConfig: RoleConfig = {
  admin: { label: "管理员", color: "#7c3aed" },
  user: { label: "用户", color: "#2563eb" },
  guest: { label: "访客", color: "#6b7280" }
  // ⚠️ 少写一个 key 会报错！必须三个都写
};
\`\`\`

\`Record<Role, V>\` 的威力：**漏写一个角色的配置会直接报错**，强制完整性。

---

## 六、ReturnType&lt;typeof fn&gt;：函数返回值类型

\`\`\`tsx
function fetchUser() {
  return { id: 1, name: "张三", email: "zs@example.com" };
}

type User = ReturnType<typeof fetchUser>;
// 等价于：{ id: number; name: string; email: string }

// 不用手写类型，函数改了类型自动跟着变
\`\`\`

\`typeof fetchUser\` 先拿到函数的类型，\`ReturnType\` 再提取返回值类型。**一处定义，处处同步**。

---

## 七、Parameters&lt;typeof fn&gt;：函数参数类型

\`\`\`tsx
function createUser(name: string, age: number, role: string) { ... }

type CreateUserArgs = Parameters<typeof createUser>;
// 等价于：[string, number, string] —— 元组

const args: CreateUserArgs = ["张三", 20, "admin"];
\`\`\`

返回的是**元组**，按参数顺序排列。

---

## 八、ComponentProps：提取组件 Props

React 里最实用的类型技巧之一：

\`\`\`tsx
import { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof HTMLButtonElement>;
// 等价于：所有原生 button 的属性

// 从已有组件提取 Props
function MyButton(props: ComponentProps<"button">) {
  return <button {...props} className="my-btn" />;
}

// 从自定义组件提取
function Dialog(props: { title: string; open: boolean }) { ... }
type DialogProps = ComponentProps<typeof Dialog>;
// { title: string; open: boolean }
\`\`\`

包装原生元素时，\`ComponentProps<"button">\` 让你的组件**继承所有原生属性**（onClick、disabled、type...），不用手写一遍。

---

## 九、组合使用：Partial&lt;Pick&lt;T, K&gt;&gt;

工具类型可以嵌套组合：

\`\`\`tsx
type User = { id: number; name: string; email: string; age: number; role: string };

// 只能更新 name 和 age，且都可选
type UserUpdate = Partial<Pick<User, "name" | "age">>;
// { name?: string; age?: number }

function updateUser(id: number, patch: UserUpdate) { ... }
updateUser(1, { name: "新名字" }); // ✅
updateUser(1, { email: "x@x.com" }); // ❌ email 不在允许范围
updateUser(1, { id: 2 }); // ❌ id 不在允许范围
\`\`\`

\`Partial<Pick<User, "name" | "age">>\` 精确表达"只能改这两个字段，且可选"——类型即文档。

---

## 十、as const：字面量类型推断

默认情况下，\`const\` 数组/对象的类型会被拓宽：

\`\`\`tsx
const status = ["idle", "loading", "success"]; // string[]
const config = { mode: "dark" }; // { mode: string }
\`\`\`

加 \`as const\` 后，类型变成**最窄的字面量**：

\`\`\`tsx
const status = ["idle", "loading", "success"] as const;
// 类型：readonly ["idle", "loading", "success"]

const config = { mode: "dark" } as const;
// 类型：{ readonly mode: "dark" }

// 配合 typeof + number 拿到字面量联合
type Status = typeof status[number];
// "idle" | "loading" | "success"
\`\`\`

\`as const\` 是"让常量保持精确字面量类型"的开关，常用于定义状态机、枚举替代品。

---

## 十一、satisfies 操作符（TS 4.9+）

\` satisfies \` 让一个值既保留**精确字面量类型**，又**校验符合某类型**：

\`\`\`tsx
type RouteConfig = Record<string, { path: string; auth: boolean }>;

// 用 satisfies：校验符合 RouteConfig，同时保留精确 key
const routes = {
  home: { path: "/", auth: false },
  profile: { path: "/profile", auth: true }
} satisfies RouteConfig;

routes.home.path;   // ✅ string
routes.profile.auth; // ✅ boolean
routes.unknown;     // ❌ 不存在的 key 报错（因为保留精确类型）
\`\`\`

对比直接标注 \`const routes: RouteConfig = {...}\`：那样会拓宽 key 为 \`string\`，\`routes.unknown\` 不报错。**\`satisfies\` 兼顾校验和精确**，是定义配置表的最佳实践。

---

## 十二、Demo：配置驱动的表单构建器

下方 Demo 用 \`Record\`、\`Pick\`、\`Partial\`、\`ReturnType\` 构建一个**配置驱动的表单**：用一个配置对象定义字段（类型/标签/规则），表单组件根据配置自动渲染 + 校验。改配置即改表单，类型全程安全。

---

## 本章小结

✅ \`Partial<T>\`：全部可选，用于更新补丁
✅ \`Required<T>\`：全部必填
✅ \`Pick<T, K>\` / \`Omit<T, K>\`：挑选/排除字段，互为互补
✅ \`Record<K, V>\`：键值对映射，强制完整性
✅ \`ReturnType<typeof fn>\` / \`Parameters<typeof fn>\`：函数类型提取
✅ \`ComponentProps<typeof Comp>\`：提取组件 Props，包装原生元素必备
✅ 组合：\`Partial<Pick<T, K>>\` 精确控制可更新字段
✅ \`as const\`：保留字面量类型，配合 \`typeof x[number]\` 拿联合
✅ \`satisfies\`：校验 + 保留精确类型，配置表最佳实践

实战篇完结！你已经掌握了 TypeScript + React 在真实项目里的核心模式。`,
    code: `import React, { useState, useMemo } from "react";

// ==============================
// 实体类型
// ==============================
type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  role: "admin" | "user" | "guest";
};

// ==============================
// 工具类型实战1：Record 定义字段配置
// 表单里每个字段的配置：标签、类型、校验规则
// ==============================
type FieldType = "text" | "email" | "number" | "select";

type FieldConfig = {
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // select 用
  min?: number;
  max?: number;
  required?: boolean;
};

// 用 Record 强制每个字段都有配置（漏写会报错）
type FormConfig = Record<string, FieldConfig>;

// ==============================
// 工具类型实战2：Pick + Partial
// 只允许编辑 name / email / age / role（排除 id）
// ==============================
type EditableUser = Pick<User, "name" | "email" | "age" | "role">;
type UserPatch = Partial<EditableUser>;

// ==============================
// 工具类型实战3：ReturnType 从函数推导类型
// ==============================
function createEmptyForm(): EditableUser {
  return { name: "", email: "", age: 0, role: "user" };
}
type FormValues = ReturnType<typeof createEmptyForm>;

// ==============================
// 工具类型实战4：satisfies 校验配置 + 保留精确 key
// ==============================
const FORM_CONFIG = {
  name: {
    label: "姓名", type: "text" as const, placeholder: "请输入姓名",
    required: true, min: 2, max: 20
  },
  email: {
    label: "邮箱", type: "email" as const, placeholder: "example@xx.com",
    required: true
  },
  age: {
    label: "年龄", type: "number" as const, placeholder: "0-120",
    required: true, min: 0, max: 120
  },
  role: {
    label: "角色", type: "select" as const,
    options: ["admin", "user", "guest"], required: true
  }
} satisfies FormConfig;

// 校验单个字段
function validateField(key: keyof EditableUser, value: string | number): string {
  const cfg = FORM_CONFIG[key];
  const str = String(value).trim();
  if (cfg.required && str === "") return \`\${cfg.label}不能为空\`;
  if (cfg.type === "email" && str && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(str)) {
    return "邮箱格式不正确";
  }
  if (cfg.type === "number" && str) {
    const n = Number(str);
    if (Number.isNaN(n)) return \`\${cfg.label}必须是数字\`;
    if (cfg.min !== undefined && n < cfg.min) return \`\${cfg.label}不能小于 \${cfg.min}\`;
    if (cfg.max !== undefined && n > cfg.max) return \`\${cfg.label}不能大于 \${cfg.max}\`;
  }
  if (cfg.type === "text" && str) {
    if (cfg.min !== undefined && str.length < cfg.min) return \`\${cfg.label}至少 \${cfg.min} 字符\`;
    if (cfg.max !== undefined && str.length > cfg.max) return \`\${cfg.label}最多 \${cfg.max} 字符\`;
  }
  return "";
}

// ==============================
// 配置驱动的表单组件
// ==============================
function ConfigForm() {
  const [values, setValues] = useState<FormValues>(createEmptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof EditableUser, string>>>({});
  const [patch, setPatch] = useState<UserPatch | null>(null);

  const fields = Object.keys(FORM_CONFIG) as (keyof EditableUser)[];

  function update(key: keyof EditableUser, value: string) {
    const next: FormValues = {
      ...values,
      [key]: key === "age" ? (value === "" ? 0 : Number(value)) : value
    };
    setValues(next);
    const msg = validateField(key, next[key]);
    setErrors(prev => ({ ...prev, [key]: msg || undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allErrors: Partial<Record<keyof EditableUser, string>> = {};
    fields.forEach(key => {
      const msg = validateField(key, values[key]);
      if (msg) allErrors[key] = msg;
    });
    setErrors(allErrors);
    if (Object.keys(allErrors).length === 0) {
      // Partial<EditableUser>：只含可编辑字段，不含 id
      const submitPatch: UserPatch = { ...values };
      setPatch(submitPatch);
    } else {
      setPatch(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{
        padding: 20, background: "white", borderRadius: 10,
        border: "1px solid #e5e7eb"
      }}>
        {fields.map(key => {
          const cfg = FORM_CONFIG[key];
          const err = errors[key];
          return (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{
                display: "block", marginBottom: 5, fontWeight: 600, fontSize: 13, color: "#374151"
              }}>
                {cfg.label}
                {cfg.required ? <span style={{ color: "#dc2626" }}> *</span> : null}
              </label>
              {cfg.type === "select" ? (
                <select
                  value={values[key] as string}
                  onChange={e => update(key, e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px", boxSizing: "border-box",
                    border: \`1px solid \${err ? "#fca5a5" : "#d1d5db"}\`,
                    borderRadius: 6, fontSize: 14, outline: "none"
                  }}
                >
                  {(cfg.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
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
              {err ? (
                <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{err}</div>
              ) : null}
            </div>
          );
        })}
        <button
          type="submit"
          style={{
            width: "100%", padding: "11px 0", border: "none", borderRadius: 6,
            background: "#3b82f6", color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer"
          }}
        >
          提交（生成 Partial&lt;Pick&gt; 补丁）
        </button>
      </form>

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

// ==============================
// 主组件
// ==============================
export default function Demo() {
  const usedTypes = [
    { name: "Record<string, FieldConfig>", desc: "字段配置表，强制完整性" },
    { name: 'Pick<User, "name"|"email"|"age"|"role">', desc: "排除 id，挑可编辑字段" },
    { name: "Partial<EditableUser>", desc: "更新补丁，全部可选" },
    { name: "ReturnType<typeof createEmptyForm>", desc: "从函数推导表单值类型" },
    { name: "satisfies FormConfig", desc: "校验配置 + 保留精确 key" }
  ];

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 20, fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 4 }}>🛠️ 配置驱动表单（工具类型实战）</h2>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
        用 Record / Pick / Partial / ReturnType / satisfies 构建
      </p>

      {/* 使用的工具类型清单 */}
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
`,
  },

];
