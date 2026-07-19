// =============================================================
// TypeScript + React 教程 —— 第十六批章节（测试与工程化 + 结尾，共 7 章）
// -------------------------------------------------------------
// 覆盖：单元测试 / 组件测试 / E2E / 项目结构 / TypeScript 配置 / 部署 / 结语
// 章节 ID：tsx2-ch76 ~ tsx2-ch82
// 分组：第十六部分 测试与工程化 + 结尾
// =============================================================

const chapters = [
  // =========================================================
  // 第七十六章 单元测试与 React Testing Library
  // =========================================================
  {
    id: "tsx2-ch76",
    group: "第十六部分 测试与工程化",
    icon: "🧪",
    title: "第七十六章 单元测试与 React Testing Library",
    content: `# 第七十六章 单元测试与 React Testing Library

测试是工程化的基石。本章讲清 Vitest + React Testing Library (RTL) 的核心 API，以及"为什么 RTL 推荐用 getByRole 而不是 getByTestId"。

---

## 一、测试金字塔

\`\`\`
         /\\
        /  \\         E2E 测试（Playwright）
       /    \\        - 慢、贵、真实
      /------\\
     /        \\      集成测试（RTL）
    /          \\     - 测组件交互
   /------------\\
  /              \\   单元测试（Vitest）
 /                \\  - 测纯函数、工具
/------------------\\
\`\`\`

**建议比例**：单元 70% + 集成 20% + E2E 10%。

---

## 二、Vitest 基础

\`\`\`bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
\`\`\`

\`\`\`ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",     // 浏览器环境
    globals: true,            // 全局 describe/it/expect
    setupFiles: "./test/setup.ts",
  },
});
\`\`\`

\`\`\`ts
// test/setup.ts
import "@testing-library/jest-dom";
\`\`\`

---

## 三、第一个测试

\`\`\`tsx
// src/utils/sum.ts
export function sum(a: number, b: number) {
  return a + b;
}
\`\`\`

\`\`\`ts
// src/utils/sum.test.ts
import { describe, it, expect } from "vitest";
import { sum } from "./sum";

describe("sum", () => {
  it("两个正数相加", () => {
    expect(sum(1, 2)).toBe(3);
  });
  it("负数相加", () => {
    expect(sum(-1, 1)).toBe(0);
  });
});
\`\`\`

---

## 四、React Testing Library 核心 API

### 1. render + screen

\`\`\`tsx
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

it("渲染标题", () => {
  render(<MyComponent title="hello" />);
  // screen：全局可访问渲染树
  expect(screen.getByText("hello")).toBeInTheDocument();
});
\`\`\`

### 2. 查询方式（按优先级）

RTL 的核心理念：**测试要像用户一样找元素**。优先级从高到低：

| 优先级 | API | 适用 |
| --- | --- | --- |
| 1 | \`getByRole\` | 按钮、链接、表单字段 |
| 2 | \`getByLabelText\` | 表单字段 |
| 3 | \`getByPlaceholderText\` | 有 placeholder 的 input |
| 4 | \`getByText\` | 段落、div |
| 5 | \`getByTestId\` | 实在找不到时用（兜底） |

\`\`\`tsx
// 示例：登录表单
function LoginForm() {
  return (
    <form>
      <label>
        邮箱 <input type="email" placeholder="you@example.com" />
      </label>
      <button type="submit">登录</button>
    </form>
  );
}

it("查询元素", () => {
  render(<LoginForm />);
  // ✅ 最佳：getByRole（按钮的 role 是 "button"）
  screen.getByRole("button", { name: /登录/ });

  // ✅ 次选：getByLabelText
  screen.getByLabelText(/邮箱/);

  // ⚠️ 不推荐：getByTestId（除非实在没其他办法）
  // <input data-testid="email" />
  // screen.getByTestId("email");
});
\`\`\`

### 3. 触发事件

\`\`\`tsx
import { fireEvent } from "@testing-library/react";

// fireEvent：低层 API
it("fireEvent click", () => {
  render(<button onClick={() => alert("hi")}>点我</button>);
  fireEvent.click(screen.getByText("点我"));
});
\`\`\`

**推荐 userEvent**：模拟真实用户操作（更接近浏览器行为）。

\`\`\`tsx
import userEvent from "@testing-library/user-event";

it("userEvent 触发", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText(/邮箱/), "a@b.com");
  await user.click(screen.getByRole("button", { name: /登录/ }));
});
\`\`\`

### 4. 等待异步

\`\`\`tsx
import { waitFor, findByText } from "@testing-library/react";

// 方式 1：findBy（异步查询）
it("异步显示", async () => {
  render(<AsyncComponent />);
  // findBy* 默认等待 1000ms
  expect(await screen.findByText("加载完成")).toBeInTheDocument();
});

// 方式 2：waitFor
it("等待条件", async () => {
  render(<AsyncComponent />);
  await waitFor(() => {
    expect(screen.getByText("加载完成")).toBeInTheDocument();
  });
});
\`\`\`

---

## 五、完整测试示例

\`\`\`tsx
// Counter.tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>当前：<span data-testid="count">{count}</span></p>
      <button onClick={() => setCount((c) => c + 1)}>加 1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}

// Counter.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("初始为 0", () => {
    render(<Counter />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("点击 +1 增加", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("加 1"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("点击重置归零", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByText("加 1"));
    await user.click(screen.getByText("加 1"));
    await user.click(screen.getByText("重置"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
\`\`\`

---

## 六、jest-dom 匹配器

\`\`\`tsx
expect(el).toBeInTheDocument();
expect(el).toHaveTextContent("hello");
expect(el).toHaveAttribute("data-x", "1");
expect(el).toHaveClass("active");
expect(el).toBeDisabled();
expect(el).toBeVisible();
expect(el).toHaveStyle({ color: "red" });
expect(input).toHaveValue("foo");
\`\`\`

---

## 七、Query 变体

\`\`\`tsx
// getBy：找不到抛错（断言存在用）
screen.getByText("...")

// queryBy：找不到返回 null（断言不存在用）
expect(screen.queryByText("loading")).not.toBeInTheDocument();

// findBy：异步 + 找不到抛错
await screen.findByText("...")

// getAllBy / queryAllBy / findAllBy：返回数组
screen.getAllByRole("button")   // 多个按钮
\`\`\`

---

## 八、覆盖率

\`\`\`bash
npx vitest run --coverage
\`\`\`

\`\`\`
----------|---------|----------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|----------|---------|---------|
All files |   85.7  |    75.0  |   90.0  |   85.7  |
 Counter  |  100.0  |   100.0  |  100.0  |  100.0  |
----------|---------|----------|---------|---------|
\`\`\`

**目标**：核心业务逻辑覆盖率 80%+，UI 层不强求。

---

## 小结

1. **Vitest + RTL** 是 React 测试的事实标准
2. **查询优先级**：getByRole > getByLabelText > getByText > getByTestId
3. **userEvent** 模拟真实用户，**fireEvent** 是底层 API
4. **findBy / waitFor** 处理异步 UI
5. **getBy / queryBy / findBy** 区别：同步、断言不存在、异步
6. **jest-dom** 提供可读性强的匹配器
7. 测试要像用户一样找元素，不要绑定到实现细节

---

## 九、query 优先级示例

\`\`\`tsx
function SignupForm() {
  return (
    <form>
      <fieldset>
        <legend>注册</legend>
        <label>
          邮箱
          <input type="email" name="email" placeholder="you@example.com" aria-describedby="email-help" />
        </label>
        <p id="email-help">不会公开你的邮箱</p>
        <label>
          密码
          <input type="password" name="password" />
        </label>
        <button type="submit">创建账号</button>
      </fieldset>
    </form>
  );
}

it("query 优先级示例", () => {
  render(<SignupForm />);
  // ✅ 优先级 1：getByRole（按钮的 implicit role 是 button）
  screen.getByRole("button", { name: "创建账号" });

  // ✅ 优先级 2：getByLabelText（关联 label 文本）
  screen.getByLabelText("邮箱");
  screen.getByLabelText("密码");

  // ✅ 优先级 3：getByPlaceholderText
  screen.getByPlaceholderText("you@example.com");

  // ✅ 优先级 4：getByText
  screen.getByText("不会公开你的邮箱");

  // ⚠️ 兜底：getByDisplayValue（输入框当前值）
  // <input value="abc" /> → getByDisplayValue("abc")
});
\`\`\`

---

## 十、userEvent vs fireEvent

\`\`\`tsx
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";

// fireEvent：底层、立即触发
fireEvent.change(input, { target: { value: "abc" } });
// ⚠️ 不会触发 onKeyDown、不会 focus、不会 blur

// userEvent：模拟真实用户，逐步触发
const user = userEvent.setup();
await user.type(input, "abc");
// ✅ 顺序触发：focus → keydown → keypress → input → change → keyup
// 接近真实输入行为
\`\`\`

**userEvent API**：

\`\`\`tsx
await user.click(element);                 // 单击
await user.dblClick(element);              // 双击
await user.tripleClick(element);           // 三连击（选中文本）
await user.type(input, "Hello");           // 输入
await user.clear(input);                   // 清空
await user.selectOptions(select, ["a"]);   // select 选项
await user.upload(input, file);            // 上传文件
await user.hover(element);                 // hover
await user.tab();                          // Tab 键
await user.keyboard("{Enter}");            // 按键
await user.paste("text");                  // 粘贴
\`\`\`

---

## 十一、调试技巧

\`\`\`tsx
import { screen } from "@testing-library/react";

// 调试 1：debug 打印整个 DOM
it("debug", () => {
  render(<MyComponent />);
  screen.debug();              // 打印 body
  screen.debug(screen.getByRole("button"));   // 打印子节点
});

// 调试 2：logRoles 看所有可访问角色
import { logRoles } from "@testing-library/react";
it("log roles", () => {
  const { container } = render(<MyComponent />);
  logRoles(container);         // 打印所有 role + accessible name
});

// 调试 3：getByTestId 临时定位
it("找问题", () => {
  render(<MyComponent />);
  // 临时加 data-testid 找元素
  expect(screen.getByTestId("some-id")).toBeInTheDocument();
});
\`\`\`

---

## 十二、测试组织最佳实践

\`\`\`ts
// tests/Button.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/shared/components/Button";

// describe 块：按功能/场景分组
describe("Button", () => {
  // beforeEach：每个 it 前清状态
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("显示 children", () => {...});
    it("应用 variant class", () => {...});
  });

  describe("交互", () => {
    it("点击触发 onClick", () => {...});
    it("disabled 时不触发 onClick", () => {...});
  });

  describe("可访问性", () => {
    it("有正确的 role", () => {...});
    it("disabled 时 aria-disabled=true", () => {...});
  });
});
\`\`\`

---

## 十三、跑测试命令

\`\`\`bash
# 跑所有测试
npx vitest run

# 监听模式
npx vitest

# 单文件
npx vitest run Button.test.tsx

# 名字匹配
npx vitest run -t "点击触发"

# 覆盖率
npx vitest run --coverage

# UI 模式
npx vitest --ui
\`\`\`
`,
  },

  // =========================================================
  // 第七十七章 组件测试模式
  // =========================================================
  {
    id: "tsx2-ch77",
    group: "第十六部分 测试与工程化",
    icon: "🔍",
    title: "第七十七章 组件测试模式",
    content: `# 第七十七章 组件测试模式

单元测试是基础，但真实项目里大部分测试是"组件级"。本章覆盖：测 props、测事件、测异步、mock fetch、snapshot、custom hook 测试。

---

## 一、测试 props

\`\`\`tsx
// UserCard.tsx
import { useState } from "react";

type UserCardProps = {
  name: string;
  email: string;
  role: "admin" | "user";
  onDelete?: (id: string) => void;
};

export function UserCard({ name, email, role, onDelete }: UserCardProps) {
  const [editing, setEditing] = useState(false);
  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h3>{name}</h3>
      <p>{email}</p>
      <span style={{ color: role === "admin" ? "red" : "gray" }}>{role}</span>
      {onDelete && <button onClick={() => onDelete(name)}>删除</button>}
      <button onClick={() => setEditing((e) => !e)}>{editing ? "保存" : "编辑"}</button>
      {editing && <input defaultValue={name} />}
    </div>
  );
}

// UserCard.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("渲染 props", () => {
    render(<UserCard name="张三" email="a@b.com" role="admin" />);
    expect(screen.getByText("张三")).toBeInTheDocument();
    expect(screen.getByText("a@b.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("没传 onDelete 时不显示删除按钮", () => {
    render(<UserCard name="张三" email="a@b.com" role="user" />);
    expect(screen.queryByText("删除")).not.toBeInTheDocument();
  });

  it("点击编辑切换 input", async () => {
    const user = userEvent.setup();
    render(<UserCard name="张三" email="a@b.com" role="user" />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(screen.getByText("编辑"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
\`\`\`

---

## 二、测试事件回调

\`\`\`tsx
it("删除时调用 onDelete", async () => {
  const onDelete = vi.fn();      // Vitest 的 mock 函数
  const user = userEvent.setup();
  render(<UserCard name="张三" email="a@b.com" role="user" onDelete={onDelete} />);
  await user.click(screen.getByText("删除"));
  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(onDelete).toHaveBeenCalledWith("张三");
});
\`\`\`

---

## 三、测试异步（loading / success / error）

\`\`\`tsx
// UserList.tsx
import { useEffect, useState } from "react";

type User = { id: number; name: string };

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>加载中...</p>;
  if (error) return <p>出错：{error}</p>;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

\`\`\`tsx
// UserList.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { UserList } from "./UserList";

// mock fetch
beforeEach(() => {
  global.fetch = vi.fn();
});

it("加载后显示用户", async () => {
  (global.fetch as any).mockResolvedValueOnce({
    json: async () => [{ id: 1, name: "张三" }, { id: 2, name: "李四" }],
  });
  render(<UserList />);
  expect(screen.getByText("加载中...")).toBeInTheDocument();
  expect(await screen.findByText("张三")).toBeInTheDocument();
  expect(screen.getByText("李四")).toBeInTheDocument();
});

it("fetch 失败显示错误", async () => {
  (global.fetch as any).mockRejectedValueOnce(new Error("网络挂了"));
  render(<UserList />);
  expect(await screen.findByText(/网络挂了/)).toBeInTheDocument();
});
\`\`\`

---

## 四、Mock fetch 进阶

\`\`\`tsx
// MSW（Mock Service Worker）：更现代的方式
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/users", () =>
    HttpResponse.json([{ id: 1, name: "张三" }])
  ),
  http.get("/api/error", () =>
    HttpResponse.json({ message: "fail" }, { status: 500 })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("MSW 方式 mock", async () => {
  render(<UserList />);
  expect(await screen.findByText("张三")).toBeInTheDocument();
});
\`\`\`

---

## 五、Snapshot 测试

\`\`\`tsx
import { render } from "@testing-library/react";

it("快照测试", () => {
  const { container } = render(<UserCard name="张三" email="a@b.com" role="user" />);
  expect(container).toMatchSnapshot();
  // 第一次跑：生成 __snapshots__/UserCard.test.tsx.snap
  // 后续跑：对比快照
});
\`\`\`

**注意**：
- snapshot 容易"过拟合"——UI 任何改动都会让快照失效
- 推荐用 **inline snapshot**（小片段）+ **显式断言**（关键属性）
- 不要给整个大型组件做 snapshot

---

## 六、测试自定义 Hook

\`\`\`tsx
// useCounter.ts
import { useState } from "react";

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  return { count, inc: () => setCount((c) => c + 1), reset: () => setCount(initial) };
}
\`\`\`

\`\`\`tsx
// useCounter.test.ts
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

it("useCounter", () => {
  const { result } = renderHook(() => useCounter(10));

  expect(result.current.count).toBe(10);

  act(() => result.current.inc());
  expect(result.current.count).toBe(11);

  act(() => result.current.reset());
  expect(result.current.count).toBe(10);
});
\`\`\`

---

## 七、测试 Context Provider

\`\`\`tsx
// ThemeProvider.tsx
import { createContext, useContext, useState, ReactNode } from "react";
const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null);
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState("light");
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === "light" ? "dark" : "light") }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext)!;
\`\`\`

\`\`\`tsx
// 方法 1：写一个 renderWithProviders
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";

const renderWithProviders = (ui: React.ReactNode, options?: RenderOptions) =>
  render(<ThemeProvider>{ui}</ThemeProvider>, options);

// 测试
it("使用主题", () => {
  renderWithProviders(<ThemedButton />);
  expect(screen.getByRole("button")).toHaveStyle({ background: "white" });
});
\`\`\`

---

## 八、测试表单

\`\`\`tsx
function SignupForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!/^\\S+@\\S+$/.test(email)) setErrors("邮箱无效");
      else setErrors(null);
    }}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">提交</button>
      {errors && <span role="alert">{errors}</span>}
    </form>
  );
}

it("提交无效邮箱显示错误", async () => {
  const user = userEvent.setup();
  render(<SignupForm />);
  await user.type(screen.getByRole("textbox"), "abc");
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("alert")).toHaveTextContent("邮箱无效");
});
\`\`\`

---

## 九、覆盖率原则

| 代码类型 | 推荐覆盖率 |
| --- | --- |
| 工具函数 | 100% |
| 自定义 Hook | 90%+ |
| 业务组件（核心流程） | 80%+ |
| 纯展示组件 | 50%（不强制） |
| UI 库封装 | 不测（库已测过） |

**避免**：为了覆盖率写无意义测试。

---

## 小结

1. **测 props**：验证组件根据 props 渲染正确内容
2. **测事件**：用 \`vi.fn()\` 验证回调被调用
3. **测异步**：mock fetch 或用 MSW，\`findBy\` / \`waitFor\`
4. **snapshot** 只对稳定的小组件用，避免过拟合
5. **renderHook** 测试自定义 hook
6. **renderWithProviders** 包装需要 Context 的组件
7. 测试要覆盖**用户行为**，不要绑定到实现细节（CSS 类名、内部 state 名）

---

## 十、测试 React Router 组件

\`\`\`tsx
// UserPage.tsx
import { useParams, useNavigate } from "react-router-dom";

function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <div>
      <h2>用户 #{id}</h2>
      <button onClick={() => navigate("/")}>返回首页</button>
    </div>
  );
}

// UserPage.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { UserPage } from "./UserPage";

function renderWithRouter(initialPath: string) {
  // 内存路由：用于测试，不污染真实 URL
  const router = createMemoryRouter(
    [{ path: "/users/:id", element: <UserPage /> }, { path: "/", element: <div>首页</div> }],
    { initialEntries: [initialPath] }
  );
  return render(<RouterProvider router={router} />);
}

it("显示 URL 中的 id", () => {
  renderWithRouter("/users/42");
  expect(screen.getByText("用户 #42")).toBeInTheDocument();
});

it("点击返回跳到首页", async () => {
  const user = userEvent.setup();
  renderWithRouter("/users/42");
  await user.click(screen.getByText("返回首页"));
  expect(screen.getByText("首页")).toBeInTheDocument();
});
\`\`\`

---

## 十一、测试 useEffect 副作用

\`\`\`tsx
// useDocumentTitle.ts
import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}

function Page() {
  useDocumentTitle("个人中心");
  return <h1>个人中心</h1>;
}

it("useDocumentTitle 设置 title", () => {
  render(<Page />);
  expect(document.title).toBe("个人中心");
});
\`\`\`

---

## 十二、测试受控 vs 非受控组件

\`\`\`tsx
// 受控
function Controlled() {
  const [v, setV] = useState("");
  return <input value={v} onChange={(e) => setV(e.target.value)} />;
}

it("受控 input", async () => {
  const user = userEvent.setup();
  render(<Controlled />);
  const input = screen.getByRole("textbox");
  await user.type(input, "abc");
  expect(input).toHaveValue("abc");
});

// 非受控
function Uncontrolled() {
  const ref = useRef<HTMLInputElement>(null);
  return <input ref={ref} defaultValue="" />;
}

it("非受控 input", async () => {
  const user = userEvent.setup();
  render(<Uncontrolled />);
  const input = screen.getByRole("textbox");
  await user.type(input, "xyz");
  // 通过 ref 读真实 DOM
  // 这里 input 没有 value prop，所以 input.value 总是最近一次输入
  expect(input).toHaveValue("xyz");
});
\`\`\`

---

## 十三、Mock 第三方库

\`\`\`ts
// __mocks__/react-router-dom.ts
import { vi } from "vitest";
export const useNavigate = vi.fn(() => vi.fn());
export const useParams = vi.fn(() => ({ id: "1" }));
\`\`\`

或在测试里临时 mock：

\`\`\`ts
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: () => ({ id: "1" }),
}));

it("测试", async () => {
  const navigate = vi.mocked(useNavigate);
  // ...
  expect(navigate).toHaveBeenCalledWith("/home");
});
\`\`\`

---

## 十四、常见测试反模式

### ❌ 反模式 1：测试实现细节

\`\`\`ts
// ❌ 测内部 state
expect(wrapper.state("count")).toBe(1);

// ❌ 测类名
expect(el).toHaveClass("MuiButton-root");

// ❌ 测方法名
expect(component.fetchData).toBeDefined();

// ✅ 测用户能观察到的行为
expect(screen.getByText("1")).toBeInTheDocument();
\`\`\`

### ❌ 反模式 2：脆弱的 snapshot

\`\`\`ts
// ❌ 整个组件 snapshot
expect(container).toMatchSnapshot();
// 任何样式、属性改动都会让快照失效

// ✅ 只对稳定的小部分用
expect(screen.getByRole("button")).toHaveAccessibleName("提交");
\`\`\`

### ❌ 反模式 3：过度 mock

\`\`\`ts
// ❌ mock 了所有东西，测的其实是 mock
vi.mock("./api");
vi.mock("./utils");
vi.mock("./hooks");
// 测出来过了，但代码可能根本跑不通

// ✅ 尽量用真实组件，只 mock 边界
\`\`\`
`,
  },

  // =========================================================
  // 第七十八章 E2E 测试 (Playwright)
  // =========================================================
  {
    id: "tsx2-ch78",
    group: "第十六部分 测试与工程化",
    icon: "🎬",
    title: "第七十八章 E2E 测试 (Playwright)",
    content: `# 第七十八章 E2E 测试 (Playwright)

E2E（End-to-End）测试启动真实浏览器，跑完整流程。Playwright 是当前最优秀的 E2E 工具：跨浏览器、自动等待、强大定位器。

---

## 一、为什么需要 E2E

单元和组件测试只验证"代码逻辑对"。E2E 验证"用户从打开浏览器到完成目标"的整条链路。

\`\`\`
单元测试：login() 函数返回 true
组件测试：点击登录按钮调 login()
E2E 测试：打开页面 → 输入账号密码 → 看到跳转 → 看到用户名显示
\`\`\`

E2E 慢（几秒-几十秒）、脆（UI 改了就挂），所以**只覆盖核心路径**。

---

## 二、Playwright 安装

\`\`\`bash
npm init playwright@latest
# 选择：TypeScript、tests 目录、GitHub Actions
npx playwright install        # 下载浏览器
\`\`\`

\`\`\`ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,             // CI 用 headless
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
\`\`\`

---

## 三、第一个 E2E 测试

\`\`\`ts
// e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test("用户能登录", async ({ page }) => {
  await page.goto("/login");

  // 填写表单（Playwright 自动等待元素可交互）
  await page.getByLabel("邮箱").fill("admin@example.com");
  await page.getByLabel("密码").fill("123456");
  await page.getByRole("button", { name: "登录" }).click();

  // 验证跳转
  await expect(page).toHaveURL("/dashboard");
  // 验证页面内容
  await expect(page.getByText("欢迎，admin")).toBeVisible();
});
\`\`\`

---

## 四、定位器（Locators）

\`\`\`ts
// 推荐：按角色、文本、label
page.getByRole("button", { name: "提交" })
page.getByLabel("邮箱")
page.getByText("忘记密码？")
page.getByPlaceholder("搜索...")
page.getByAltText("头像")

// 按测试 ID
page.getByTestId("submit-btn")

// CSS / XPath（不推荐）
page.locator("button.primary")
\`\`\`

---

## 五、断言

\`\`\`ts
// 可见性
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// 内容
await expect(locator).toHaveText("hello");
await expect(locator).toContainText("hello");

// 属性
await expect(locator).toHaveAttribute("href", "/about");
await expect(locator).toHaveClass("active");

// 数量
await expect(locator).toHaveCount(3);

// 状态
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toHaveValue("abc");

// URL
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle("My App");
\`\`\`

---

## 六、Page Object Model（POM）

把页面交互封装成类，避免重复：

\`\`\`ts
// e2e/pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(public page: Page) {
    this.emailInput = page.getByLabel("邮箱");
    this.passwordInput = page.getByLabel("密码");
    this.submitButton = page.getByRole("button", { name: "登录" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() { await this.page.goto("/login"); }
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// 用法
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test("登录失败", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("wrong@user.com", "badpass");
  await expect(loginPage.errorMessage).toContainText("账号或密码错误");
});
\`\`\`

---

## 七、Fixture：复用上下文

\`\`\`ts
// e2e/fixtures.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

// 测试里直接用
test("...", async ({ loginPage }) => {
  await loginPage.goto();
  // ...
});
\`\`\`

---

## 八、网络拦截

\`\`\`ts
// 拦截 API 返回假数据
test("列表展示", async ({ page }) => {
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: 1, name: "张三" }]),
    });
  });
  await page.goto("/users");
  await expect(page.getByText("张三")).toBeVisible();
});

// 等待请求
test("提交时调用 API", async ({ page }) => {
  const requestPromise = page.waitForRequest("**/api/login");
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("a@b.com");
  await page.getByLabel("密码").fill("123");
  await page.getByRole("button", { name: "登录" }).click();
  const req = await requestPromise;
  expect(req.method()).toBe("POST");
});
\`\`\`

---

## 九、Visual Regression（视觉回归）

\`\`\`bash
npm install -D @playwright/test
npx playwright test --update-snapshots
\`\`\`

\`\`\`ts
test("首页视觉回归", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home.png", { maxDiffPixelRatio: 0.05 });
});
\`\`\`

---

## 十、什么时候用 E2E

| 场景 | 用 E2E |
| --- | --- |
| 登录注册 | ✅ 必加 |
| 支付流程 | ✅ 必加 |
| 表单提交 | ✅ 核心字段 |
| 页面布局 | ❌ 单元/视觉测试 |
| 复杂业务逻辑 | ❌ 单元测试 |
| 第三方集成 | ✅ 冒烟测试 |

**比例建议**：5-10 个核心 E2E 跑通主流程。

---

## 十一、调试技巧

\`\`\`bash
# UI 模式：可视化每一步
npx playwright test --ui

# debug 模式：断点
npx playwright test --debug

# 单文件
npx playwright test login.spec.ts

# 看 trace（重试时录制）
npx playwright show-trace trace.zip

# headed 模式（看浏览器）
npx playwright test --headed
\`\`\`

---

## 十二、可被 E2E 测试的"目标组件"示例

E2E 测试本身在 Node 环境跑，但**被测目标**是 React 组件。这里给一个典型的待测组件，看 E2E 怎么对它发起真实操作。

\`\`\`tsx
import { useState } from "react";

// 一个简单登录页组件：E2E 会操作邮箱、密码、登录按钮
type LoginPageProps = {
  onLogin?: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await onLogin?.(email, password);
    if (r && !r.ok) setError(r.message ?? "登录失败");
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ padding: 24, maxWidth: 320 }}>
      <h2 style={{ marginTop: 0 }}>登录</h2>
      {/* 用 htmlFor 关联 label，Playwright 的 getByLabel 才能找到 */}
      <label style={{ display: "block", marginBottom: 12 }}>
        <span>邮箱</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        <span>密码</span>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>
      <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
        {loading ? "登录中..." : "登录"}
      </button>
      {/* role="alert" 让 E2E 用 getByRole('alert') 拿到错误提示 */}
      {error && <div role="alert" style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}

export default function App() {
  return <LoginPage onLogin={async (email, password) => email === "admin@x.com" && password === "123" ? { ok: true } : { ok: false, message: "账号或密码错误" }} />;
}
\`\`\`

E2E 视角（前面示例）的代码会这样找元素：
- \`page.getByLabel("邮箱")\` 找到 input
- \`page.getByRole("button", { name: /登录/ })\` 找到按钮
- \`page.getByRole("alert")\` 找到错误提示

**要点**：
- 用 \`<label htmlFor>\` 关联表单元素（getByLabel 才能定位）
- 错误信息用 \`role="alert"\`（屏幕阅读器 + E2E 都能识别）
- 加载态用 \`disabled\` 防止重复提交

---

## 小结

1. **E2E 验证完整流程**，慢但必要
2. **Playwright** 跨浏览器、自动等待、定位器强大
3. **Page Object Model** 抽离页面交互，避免重复
4. **Fixture** 复用上下文
5. **网络拦截** mock 后端、控制请求
6. **Visual regression** 截图对比防 UI 退化
7. **核心路径 5-10 个 E2E** + **单元/组件测试** 才是健康组合
`,
  },

  // =========================================================
  // 第七十九章 项目结构与代码组织
  // =========================================================
  {
    id: "tsx2-ch79",
    group: "第十六部分 测试与工程化",
    icon: "📁",
    title: "第七十九章 项目结构与代码组织",
    content: `# 第七十九章 项目结构与代码组织

项目结构决定了团队协作的"摩擦系数"。本章讲清主流组织方式：feature folders、atomic design、barrel exports、绝对路径、分层架构。

---

## 一、按类型 vs 按功能

\`\`\`
// ❌ 按类型分（小项目还行，大项目难找）
src/
  components/
    Button.tsx
    UserCard.tsx
  hooks/
    useUser.ts
    useAuth.ts
  pages/
    Home.tsx
    Profile.tsx
  utils/
    formatDate.ts

// ✅ 按功能分（推荐中大型项目）
src/
  features/
    user/
      components/
      hooks/
      api.ts
      types.ts
      index.ts
    auth/
      components/
      hooks/
  shared/         // 跨功能复用
    components/
    hooks/
    utils/
  pages/          // 路由层
\`\`\`

**核心原则**：**按"功能变化频率"组织**，不按"代码类型"。

---

## 二、Feature Folder 模式

\`\`\`
src/
  app/                       // 应用入口、全局配置
    App.tsx
    routes.tsx
    providers.tsx
  features/
    todos/                   // 单一功能模块
      api/
        todosApi.ts
      components/
        TodoList.tsx
        TodoItem.tsx
      hooks/
        useTodos.ts
      types/
        index.ts
      utils/
        sortTodos.ts
      store.ts
      index.ts               // barrel export
    auth/
      ...
  shared/                    // 跨功能复用
    components/
      Button/
        Button.tsx
        Button.test.tsx
        index.ts
    hooks/
    utils/
  pages/                     // 路由页面（薄）
    HomePage.tsx
    TodosPage.tsx
\`\`\`

**优点**：
- 删除功能时删一个文件夹
- 团队各做各的功能不冲突
- 跨功能依赖明显（如果 features/user 引了 features/auth 的内部文件，要警觉）

---

## 三、Atomic Design（原子设计）

把组件分成 5 个层级：

\`\`\`
src/components/
  atoms/         // 原子：Button、Input、Icon
    Button/
    Input/
  molecules/     // 分子：SearchBar（Input + Button）
  organisms/     // 组织：UserCard
  templates/     // 模板：带布局的页面骨架
  pages/         // 页面：用模板 + 数据
\`\`\`

**适用**：组件库项目、设计系统。普通业务项目不太用。

---

## 四、Barrel Exports（桶导出）

每个文件夹放一个 \`index.ts\`，对外暴露公共 API。

\`\`\`ts
// features/todos/index.ts
export { TodoList } from "./components/TodoList";
export { useTodos } from "./hooks/useTodos";
export type { Todo } from "./types";

// 外部使用
import { TodoList, useTodos } from "@/features/todos";
// 不用关心内部组织
\`\`\`

**优点**：
- 简化 import 路径
- 可以重构内部结构而不破坏外部

**缺点**：
- 大量 barrel 会拖慢构建（不过 Vite 优化过，影响小）
- 容易暴露不该暴露的内部

---

## 五、绝对路径：tsconfig paths

\`\`\`ts
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/shared/components/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
\`\`\`

\`\`\`ts
// 之前
import { Button } from "../../../shared/components/Button";

// 之后
import { Button } from "@/shared/components/Button";
\`\`\`

**Vite 配置**（tsconfig 改了之后 Vite 也要配）：

\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
\`\`\`

---

## 六、分层架构

\`\`\`
src/
  app/                // 应用层：router、providers、layout
  pages/              // 页面：路由对应的组件（薄）
  features/           // 功能层：业务逻辑
  shared/             // 共享层：UI 组件、工具、hooks
  entities/           // 实体层：数据模型（可选）
\`\`\`

**依赖规则**（自上而下）：

- \`app\` → 可以依赖所有
- \`pages\` → 依赖 features、shared
- \`features\` → 依赖 shared、entities
- \`shared\` → 不依赖其他业务模块
- \`entities\` → 不依赖 features

**检查工具**：[dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 可视化依赖。

---

## 七、单文件多组件 vs 多文件

\`\`\`tsx
// 小组件：单文件多组件
// Card.tsx
export function Card({ children }: { children: ReactNode }) {
  return <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>{children}</div>;
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div style={{ fontWeight: 600, marginBottom: 8 }}>{children}</div>;
}

// 强相关的小组件可以这样
\`\`\`

**决策**：
- < 50 行、强相关：单文件
- > 50 行、会被外部复用：拆文件

---

## 八、TypeScript 类型组织

\`\`\`
src/features/user/
  types/
    index.ts          // 公共类型
    api.ts            // API 请求/响应类型
  components/
  hooks/
\`\`\`

\`\`\`ts
// features/user/types/index.ts
export type User = { id: number; name: string; email: string };
export type UserRole = "admin" | "user";

// features/user/types/api.ts
import type { User } from "./index";
export type GetUserResponse = User;
export type ListUsersResponse = User[];
\`\`\`

---

## 九、命名约定

| 类型 | 命名 | 例 |
| --- | --- | --- |
| 组件 | PascalCase | \`UserCard.tsx\` |
| Hook | camelCase，use 前缀 | \`useUser.ts\` |
| 工具函数 | camelCase | \`formatDate.ts\` |
| 类型文件 | \`types/\` 目录 | \`types/index.ts\` |
| 常量 | UPPER_SNAKE | \`MAX_PAGE_SIZE\` |
| Context | PascalCase + Context | \`AuthContext.tsx\` |

---

## 十、迷你示例项目结构

\`\`\`
my-app/
  src/
    app/
      App.tsx
      routes.tsx
      providers.tsx
    pages/
      HomePage.tsx
      UserPage.tsx
    features/
      user/
        components/
          UserCard.tsx
        hooks/
          useUser.ts
        api.ts
        types.ts
        index.ts
    shared/
      components/
        Button/
          Button.tsx
          index.ts
      hooks/
        useDebounce.ts
      utils/
        format.ts
    main.tsx
\`\`\`

---

## 小结

1. **按功能（feature）组织**比按类型（type）更利于团队协作
2. **Barrel exports**：每个模块一个 \`index.ts\`
3. **绝对路径**：tsconfig + Vite alias，少写 \`../../../\`
4. **分层**：app → pages → features → shared，依赖单向
5. **命名一致**：组件 PascalCase，hook use 前缀
6. **小项目**：可按类型；中大型：必须按功能
`,
  },

  // =========================================================
  // 第八十章 TypeScript 工程配置
  // =========================================================
  {
    id: "tsx2-ch80",
    group: "第十六部分 测试与工程化",
    icon: "⚙️",
    title: "第八十章 TypeScript 工程配置",
    content: `# 第八十章 TypeScript 工程配置

\`tsconfig.json\` 是 TypeScript 项目的"控制面板"。本章讲清核心选项、Vite 构建配置、类型声明文件。

---

## 一、tsconfig.json 结构

\`\`\`ts
// tsconfig.json
{
  "compilerOptions": {
    /* 目标与模块 */
    "target": "ES2020",                  // 编译目标
    "module": "ESNext",                  // 模块系统
    "moduleResolution": "Bundler",       // 解析策略（Vite/Webpack）
    "lib": ["ES2020", "DOM", "DOM.Iterable"],

    /* JSX */
    "jsx": "react-jsx",                  // 不需要 import React
    // 或 "jsx": "react"（需 import React）

    /* 严格模式 */
    "strict": true,                      // 总开关，等于下面全开
    "noImplicitAny": true,               // 隐式 any 报错
    "strictNullChecks": true,            // null/undefined 严格
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* 额外严格 */
    "noUnusedLocals": true,              // 未用变量报错
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,    // arr[i] 类型是 T | undefined
    "exactOptionalPropertyTypes": true,  // { x?: T } 不能传 { x: undefined }

    /* 互操作 */
    "esModuleInterop": true,             // 允许 import x from "y"
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,             // 每个文件单独编译（Babel/esbuild 需要）
    "skipLibCheck": true,                // 跳过 .d.ts 检查

    /* 路径 */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

---

## 二、Vite + React + TS 完整配置

\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
\`\`\`

---

## 三、严格模式详解

\`\`\`ts
// 1. noUncheckedIndexedAccess：访问数组/对象的元素返回 T | undefined
const arr = [1, 2, 3];
const x = arr[0];          // x: number | undefined（不是 number）
// 必须：if (x !== undefined) { ... }

// 2. exactOptionalPropertyTypes
type Config = { debug?: boolean };
const c1: Config = {};                       // ✅
const c2: Config = { debug: undefined };     // ❌ 报错
const c3: Config = { debug: true };          // ✅

// 3. noImplicitReturns
function f(x: number) {
  if (x > 0) return x;   // ❌ 报错：有些路径没 return
}
\`\`\`

---

## 四、声明文件 .d.ts

### 1. 环境变量类型

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;        // 你的环境变量
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
\`\`\`

### 2. 第三方库无类型

\`\`\`ts
// src/types/foo.d.ts
declare module "foo" {
  export function bar(x: number): string;
  export const VERSION: string;
}

// 也支持 export default
declare module "baz" {
  const x: { name: string };
  export default x;
}
\`\`\`

### 3. 扩展已有类型

\`\`\`ts
// 给 Window 加自定义属性
declare global {
  interface Window {
    MY_GLOBAL: { apiKey: string };
  }
}

// 自动需要 export {} 让它成为模块
export {};
\`\`\`

### 4. 给第三方模块加类型

\`\`\`ts
// 给 lodash 扩展
declare module "lodash" {
  interface LoDashStatic {
    myUtil<T>(arr: T[]): T;
  }
}
\`\`\`

---

## 五、tsconfig 组合：多环境

\`\`\`json
// tsconfig.json（基础）
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
\`\`\`

\`\`\`json
// tsconfig.build.json（构建用）
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "exclude": ["**/*.test.ts", "**/*.test.tsx"]
}
\`\`\`

\`\`\`bash
# tsc --noEmit
# 仅检查类型，不生成文件
tsc --noEmit

# 实际构建用 vite（不走 tsc）
vite build
\`\`\`

---

## 六、ESLint + TypeScript

\`\`\`bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react
\`\`\`

\`\`\`ts
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react/prop-types": "off",
  },
  settings: { react: { version: "detect" } },
};
\`\`\`

---

## 七、类型推导最佳实践

\`\`\`ts
// 1. 让 TS 推导，别显式标注
const [count, setCount] = useState(0);          // 推导为 number
const [user, setUser] = useState<User | null>(null);  // 需要标注（默认 null）

// 2. 用类型工具避免重复
type Partial<T> = { [P in keyof T]?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// 3. 用 satisfies 校验形状但不丢失字面量类型
const config = {
  api: "/api",
  timeout: 5000,
} satisfies Record<string, string | number>;
// config.api 类型仍是字符串字面量 "/api"（不是 string）

// 4. 用 const 断言保留字面量
const arr = [1, 2, 3] as const;     // readonly [1, 2, 3]
\`\`\`

---

## 八、常见错误与解决

| 报错 | 原因 | 解决 |
| --- | --- | --- |
| \`Object is possibly 'undefined'\` | 没开 strictNullChecks | 开 strict 或加 \`if (x)\` |
| \`Property 'x' does not exist\` | 类型不匹配 | 加类型 / 用类型断言 |
| \`Cannot find module 'foo'\` | 没装 / 路径错 | 装包 / 检查 paths |
| \`Type 'X' is not assignable to type 'Y'\` | 类型不兼容 | 用 \`as\` / 改类型 |
| \`JSX element implicitly has type 'any'\` | 没装 @types/react | \`npm i -D @types/react\` |

---

## 九、tsc 常用命令

\`\`\`bash
# 仅检查（CI 必加）
tsc --noEmit

# 监听模式
tsc --noEmit --watch

# 指定配置
tsc -p tsconfig.build.json

# 显示编译耗时
tsc --noEmit --extendedDiagnostics

# 生成声明文件
tsc --declaration --emitDeclarationOnly --outDir dist/types
\`\`\`

---

## 十、综合 tsconfig 实战模板

下面给一个 2025 年新项目最常用的 tsconfig + Vite + React 完整配置示例（实际可拷贝）。

\`\`\`ts
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

\`\`\`ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: true,
  },
});
\`\`\`

对应的 React 入口（让上面的 \`@/\` 路径真正生效）：

\`\`\`tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";        // 用 @ 别名

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// src/App.tsx
import { Button } from "@/shared/components/Button";
import { HomePage } from "@/pages/HomePage";

export function App() {
  return (
    <div>
      <h1>My App</h1>
      <Button>点击</Button>
      <HomePage />
    </div>
  );
}
\`\`\`

**这套配置能让你**：
- \`tsc --noEmit\` 在 CI 跑类型检查
- \`vite build\` 转译 + 打包
- \`@/...\` 绝对路径清爽 import
- 严格模式 + noUnusedLocals 把烂代码堵在编译期

---

## 小结

1. **tsconfig.json** = 项目的 TypeScript 行为定义
2. **strict: true** 是基础，开了再说
3. **paths** 配置绝对路径，配合 Vite alias
4. **.d.ts** 用于环境变量、无类型库、全局扩展
5. **tsc --noEmit** 在 CI 中跑类型检查
6. **Vite 走 esbuild 转译**，tsc 只负责类型检查
7. **类型推导 > 显式标注**，能省就省
8. **satisfies** 保留字面量类型同时校验形状
`,
  },

  // =========================================================
  // 第八十一章 部署与 CI/CD
  // =========================================================
  {
    id: "tsx2-ch81",
    group: "第十六部分 测试与工程化",
    icon: "🚀",
    title: "第八十一章 部署与 CI/CD",
    content: `# 第八十一章 部署与 CI/CD

代码写完只是开始。本章覆盖：Vite 构建、环境变量、Docker 基础、GitHub Actions、部署平台、性能预算。

---

## 一、Vite 生产构建

\`\`\`bash
npm run build
# 输出到 dist/
\`\`\`

\`\`\`json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
\`\`\`

**构建产物**：
- \`dist/index.html\`
- \`dist/assets/index-abc123.js\`
- \`dist/assets/index-def456.css\`

文件名带 hash 便于 CDN 缓存。

---

## 二、环境变量

\`\`\`bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=MyApp
\`\`\`

\`\`\`ts
// 使用
const apiUrl = import.meta.env.VITE_API_URL;  // "https://api.example.com"
const appName = import.meta.env.VITE_APP_NAME;
\`\`\`

**多环境**：

\`\`\`bash
.env                # 所有环境
.env.development     # 开发
.env.production      # 生产
.env.local           # 本地（不入 git）
\`\`\`

**Vite 规则**：
- 只有 \`VITE_\` 开头的变量才会被注入到 \`import.meta.env\`
- 客户端可见——别放密钥！

---

## 三、性能预算（Performance Budget）

\`\`\`ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 大依赖拆 chunk
          react: ["react", "react-dom"],
          editor: ["monaco-editor", "monaco-editor-webpack-plugin"],
        },
      },
    },
  },
});

// 预算：main bundle < 200KB gzip
\`\`\`

**监控**：Lighthouse、Web Vitals（LCP、FID、CLS）。

---

## 四、Docker 基础

\`\`\`dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

\`\`\`nginx
# nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 静态资源缓存
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
\`\`\`

\`\`\`bash
docker build -t myapp .
docker run -p 8080:80 myapp
\`\`\`

---

## 五、GitHub Actions CI

\`\`\`yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check    # tsc --noEmit
      - run: npm test
      - run: npm run build
      - name: 上传构建产物
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
\`\`\`

**自动部署到 Vercel**（推荐方式）：

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \$\{{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \$\{{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \$\{{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

---

## 六、部署平台对比

| 平台 | 特点 | 适合 |
| --- | --- | --- |
| **Vercel** | Next.js 御用，零配置 | React/Vue 静态站 |
| **Netlify** | 表单、Functions 完善 | 静态站 + Serverless |
| **Cloudflare Pages** | 全球 CDN、便宜 | 高流量项目 |
| **AWS S3 + CloudFront** | 灵活、贵 | 企业级 |
| **自建 Nginx** | 完全可控 | 内部系统 |

---

## 七、CDN 与缓存策略

\`\`\`
# 资源类型与缓存时间
/assets/*.js      → immutable, 1 year
/assets/*.css     → immutable, 1 year
index.html        → no-cache（确保新版本生效）
/api/*            → no-cache
\`\`\`

\`\`\`nginx
# nginx 配置
location = /index.html {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
location ~* \\.(js|css)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
\`\`\`

---

## 八、监控与错误追踪

\`\`\`ts
// Sentry 接入示例
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/123",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
  environment: import.meta.env.MODE,
});
\`\`\`

\`\`\`ts
// 错误边界（class 写法）
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: info });
  }
  render() {
    if (this.state.hasError) return <h1>出错了</h1>;
    return this.props.children;
  }
}
\`\`\`

\`\`\`tsx
// 实际在 App.tsx 包裹根组件
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/123",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
  environment: import.meta.env.MODE,
});

function App() {
  return (
    // Sentry 自己的边界，比 class 写法多带：重置、报告按钮、面包屑
    <Sentry.ErrorBoundary fallback={<h1>出错了，请刷新</h1>} showDialog>
      <Router />
    </Sentry.ErrorBoundary>
  );
}

export default App;
\`\`\`

\`\`\`tsx
// useEffect 主动上报业务错误
import * as Sentry from "@sentry/react";

function PaymentPage() {
  const pay = async () => {
    try {
      await fetch("/api/pay", { method: "POST" });
    } catch (err) {
      // 主动上报：自定义上下文（tags 可索引、extra 是详情）
      Sentry.captureException(err, {
        tags: { module: "payment" },
        extra: { amount: 99, currency: "CNY" },
      });
    }
  };

  return <button onClick={pay}>支付</button>;
}
\`\`\`

\`\`\`tsx
// 性能监控：Web Vitals 上报
import { onLCP, onFID, onCLS } from "web-vitals";

function reportMetric(metric: { name: string; value: number }) {
  // 发送到自己的后端
  navigator.sendBeacon("/api/perf", JSON.stringify(metric));
}

// 在 main.tsx 注册一次
onLCP(reportMetric);
onFID(reportMetric);
onCLS(reportMetric);
\`\`\`

---

## 九、完整部署 checklist

- [ ] 环境变量在部署平台配置
- [ ] SPA fallback 配好
- [ ] 静态资源 immutable 缓存
- [ ] 错误监控接入（Sentry）
- [ ] CI 跑 lint + type-check + test + build
- [ ] Lighthouse 分数 > 90
- [ ] 首屏 < 200KB gzip
- [ ] 关键页面 LCP < 2.5s
- [ ] 自定义域名 + HTTPS
- [ ] SEO（meta 标签、sitemap）

---

## 小结

1. **Vite build** 输出 \`dist/\`，文件名带 hash
2. **环境变量**用 \`VITE_\` 前缀，部署平台配置
3. **Docker 多阶段构建**：先 build、再用 nginx 托管
4. **GitHub Actions** 自动跑 test + build + deploy
5. **缓存策略**：HTML no-cache，资源 immutable 1 year
6. **监控**：Sentry 捕获异常，Lighthouse 评估性能
7. **部署选型**：小项目 Vercel/Netlify，企业级自建
`,
  },

  // =========================================================
  // 第八十二章 结语与进阶方向
  // =========================================================
  {
    id: "tsx2-ch82",
    group: "结尾",
    icon: "🏁",
    title: "第八十二章 结语与进阶方向",
    content: `# 第八十二章 结语与进阶方向

恭喜你读到了最后一章。本章回顾整本书的脉络，并为你指出继续前进的方向。

---

## 一、你学到了什么

让我们回顾 82 章覆盖的核心能力：

| 部分 | 章节 | 核心能力 |
| --- | --- | --- |
| TypeScript 基础 | ch01-ch05 | 类型注解、字面量联合、any/unknown/never |
| TypeScript 进阶 | ch06-ch10 | 泛型、条件类型、infer、映射类型 |
| React 组件基础 | ch11-ch15 | JSX、组件、Props、Children |
| Props 组合 | ch16-ch20 | 继承、透传、ref-forwarding |
| 事件与受控 | ch21-ch25 | onChange、受控组件 |
| useState 深入 | ch26-ch30 | 状态更新、不可变、key |
| useEffect 深入 | ch31-ch35 | 副作用、清理、依赖 |
| useRef/Memo/Callback | ch36-ch40 | 引用、缓存、性能 |
| useReducer/Context/Hook | ch41-ch45 | 复杂状态、自定义 Hook |
| 高级 Hooks | ch46-ch50 | useId、useTransition、useSyncExternalStore |
| 性能优化 | ch51-ch55 | 懒加载、虚拟列表、Profiler |
| 数据请求 | ch56-ch60 | fetch、React Query、SWR |
| 表单与校验 | ch61-ch65 | useForm、Zod、RHF |
| 路由与状态 | ch66-ch70 | React Router、Zustand、Redux |
| 样式与 UI | ch71-ch75 | CSS Modules、Tailwind、Headless |
| 测试与工程化 | ch76-ch82 | Vitest、Playwright、CI/CD、TypeScript |

---

## 二、你现在能做什么

✅ 独立用 TypeScript 写 React 应用
✅ 选型状态管理（Context / Zustand / Redux）
✅ 处理复杂表单（Zod + RHF）
✅ 写单元测试、E2E 测试
✅ 搭建 CI/CD
✅ 部署到云平台
✅ 排查性能问题

---

## 三、进阶方向

### 1. Next.js / Remix（框架）

\`\`\`bash
npx create-next-app@latest my-app
# 路由、SSR、API Routes、Image 优化、SEO 全都有
\`\`\`

为什么学：
- 内置路由（文件式）
- SSR / SSG / ISR 渲染模式
- Server Components（React 新形态）
- API Routes（自带后端）
- 部署到 Vercel 零配置

### 2. React Server Components（RSC）

\`\`\`tsx
// 服务端组件（默认）
async function UserList() {
  const users = await db.query("SELECT * FROM users");  // 服务端直接查 DB
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// 客户端组件（需 "use client"）
"use client";
import { useState } from "react";
function Counter() { ... }
\`\`\`

意义：服务端组件零 JS、零 hydration、数据不出服务端。

### 3. tRPC

\`\`\`ts
// 端到端类型安全
const user = await trpc.user.byId.query(1);   // 客户端
// ↑ type User = { id: number; name: string } 自动从后端推
\`\`\`

无需写 API 类型、无需生成代码。

### 4. GraphQL

\`\`\`tsx
import { gql, useQuery } from "@apollo/client";

const GET_USERS = gql\`
  query { users { id name } }
\`;

function UserList() {
  const { data } = useQuery(GET_USERS);
  return <ul>{data.users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

按需取字段，不多取。

### 5. Web Components

\`\`\`js
class MyCounter extends HTMLElement {
  connectedCallback() { /* ... */ }
}
customElements.define("my-counter", MyCounter);
\`\`\`

跨框架可用的原生组件方案。

---

## 四、推荐学习资源

### 官方文档（必读）
- [react.dev](https://react.dev) — React 新官方文档
- [typescriptlang.org](https://www.typescriptlang.org)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)

### 视频
- Jack Herrington — YouTube 高质量 React/TS 实战
- Theo — 现代前端工程化
- Web Dev Simplified — 入门

### 书籍
- 《深入浅出 React 与 Redux》
- 《Programming TypeScript》
- 《React 设计模式与最佳实践》

### 实战
- 自己做一个项目：博客、SaaS Dashboard、工具站
- 读源码：React、Zustand、TanStack Query
- 参与开源：从修 typo 开始

---

## 五、给初学者的建议

1. **不要追求完美主义** — 先写出来，再优化
2. **读官方文档** — 比任何教程都新、都准
3. **项目驱动** — 边做边学，比纯看视频快 10 倍
4. **TypeScript 别逃避** — 写两周痛苦，后面全是收益
5. **学会调试** — console.log 永远有效；DevTools 一定要会用
6. **别追新热点** — 基础扎实比追新框架重要
7. **找社区** — 遇到问题先搜、再问
8. **记录笔记** — 写过的坑记下来，下次不再踩

---

## 六、给中级的建议

1. **深入原理** — React 调和、Fiber、Reconciliation
2. **性能优化** — 真实场景下：10000 列表、动画
3. **架构能力** — 拆分模块、设计 API、组织大型项目
4. **工程化** — Monorepo、CI/CD、监控、错误追踪
5. **服务端** — 至少懂 Node.js 基础，能做全栈
6. **英语** — 一手资料都是英文的

---

## 七、给高级的建议

1. **设计系统** — 主导一个 UI 组件库
2. **框架原理** — 读 React 源码、TS 编译器
3. **团队建设** — Code Review、技术分享、规范
4. **技术选型** — 为团队选技术栈，写 RFC
5. **影响力** — 写博客、做开源、分享

---

## 八、最后的话

技术学习是**终身旅程**。今天学的 React 18，明天可能就是 19；今天用 Zustand，明天可能换了 Jotai。唯一不变的是**学习能力**和**解决问题的方法**。

愿你：
- 写代码时感到快乐
- 解决问题时感到兴奋
- 面对新技术时感到好奇
- 帮助他人时感到满足

\`\`\`tsx
// 送给你的最后一段代码
function Life() {
  const [skills, setSkills] = useState<string[]>(["TypeScript", "React"]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const timer = setInterval(() => setYear((y) => y + 1), 365 * 24 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const learn = (newSkill: string) => setSkills((s) => [...s, newSkill]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>🚀 编程之旅</h1>
      <p>当前年份：{year}</p>
      <p>已掌握：{skills.join("、")}</p>
      <button onClick={() => learn(prompt("学什么？") ?? "")}>
        学习新技能
      </button>
    </div>
  );
}
\`\`\`

---

## 小结

1. **回顾**：你已掌握 TypeScript + React 18 的 95% 日常开发能力
2. **进阶方向**：Next.js、React Server Components、tRPC、GraphQL
3. **学习心法**：项目驱动 > 纯看视频；读官方文档 > 二手资料
4. **终身学习**：技术不断迭代，但学习能力不变
5. **保持好奇**：写代码时快乐、解决问题时兴奋、帮助他人时满足

---

**感谢你读完了这本书**。

江湖路远，代码为伴。后会有期！

— 完 —
`,
  },
];

export { chapters };
