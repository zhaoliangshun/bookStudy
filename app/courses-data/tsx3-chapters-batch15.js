// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第十五批章节
// -------------------------------------------------------------
// 覆盖：第十一部分 测试（4 章）
// 包含 4 个章节：ch70 ~ ch73
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 测试代码本身也算 demo，章节内至少 1 个 React 组件 + 1 个测试
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - Jest 29.x + @testing-library/react 14.x
//   - React 18（createRoot、act 已稳定）
//   - Playwright 1.40+
//   - TypeScript 5.x strict 模式
// =============================================================

const chapters = [
  // ============================================================
  // ch70: Jest + RTL 基础
  // ============================================================
  {
    id: "tsx3-ch70",
    group: "第十一部分 测试",
    icon: "🧪",
    title: "ch70 Jest + RTL 基础",
    content: `# ch70 Jest + RTL 基础

## 为什么讲这个

写完组件不代表就完事了。**没有测试的代码等于没有信心**——你重构时不知道有没有破坏旧逻辑，新人改一行代码也心里没底。React 社区的测试黄金组合是 **Jest + React Testing Library（RTL）**：Jest 提供测试运行器与断言，RTL 提供面向用户的渲染与查询 API。这一章先把环境搭好，把核心 API 用熟。

## 1. 安装依赖

\`\`\`bash
# Jest 29 + RTL 14 + 类型
npm install -D jest @types/jest \\
  @testing-library/react @testing-library/jest-dom \\
  @testing-library/user-event \\
  ts-jest @types/node
\`\`\`

各包的职责：

| 包 | 作用 |
| --- | --- |
| \`jest\` | 测试运行器，提供 \`test\`、\`expect\`、\`describe\` |
| \`@types/jest\` | Jest 的 TS 类型 |
| \`@testing-library/react\` | React 组件渲染与查询 |
| \`@testing-library/jest-dom\` | 扩展 \`expect\`，支持 \`toBeInTheDocument\` 等 DOM 断言 |
| \`@testing-library/user-event\` | 模拟真实用户交互（点击、输入） |
| \`ts-jest\` | 让 Jest 直接运行 \`.ts/.tsx\` |

## 2. 配置 jest.config.js

\`\`\`js
// jest.config.js
module.exports = {
  // 用 ts-jest 预设，让 Jest 能直接跑 TS 文件
  preset: "ts-jest",

  // 测试环境：jsdom 提供虚拟 DOM，让 React 能渲染
  testEnvironment: "jsdom",

  // 测试文件匹配规则：xx.test.ts / xx.test.tsx / xx.spec.ts
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],

  // 模块路径别名（与 tsconfig.json 的 paths 同步）
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // 每个测试文件运行前加载的设置文件
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // 转换 TS/TSX 文件
  transform: {
    "^.+\\\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
};
\`\`\`

\`jest.setup.ts\` 里加载 jest-dom 的扩展匹配器：

\`\`\`ts
// jest.setup.ts
// 引入后 expect 才能识别 toBeInTheDocument / toHaveTextContent 等
import "@testing-library/jest-dom";
\`\`\`

## 3. tsconfig.test.json：测试专用 TS 配置

\`\`\`json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    // jest 的全局变量在测试文件里可用
    "types": ["jest", "node", "@testing-library/jest-dom"]
  },
  "include": ["src", "__tests__", "jest.setup.ts"]
}
\`\`\`

> **避坑**：如果不把 \`@testing-library/jest-dom\` 加到 \`types\`，\`toBeInTheDocument\` 会报"类型不存在"。

## 4. 写第一个测试：render + screen

\`\`\`tsx
// __tests__/Hello.test.tsx
import { render, screen } from "@testing-library/react";

// 一个最简单的组件
function Hello({ name }: { name: string }) {
  return <div>你好，{name}</div>;
}

// test() 是 Jest 的全局函数：第一个参数是描述，第二个是测试体
test("渲染时显示问候语", () => {
  // render：把组件挂到 jsdom 文档上
  render(<Hello name="小明" />);

  // screen.getByText：从渲染结果里找文本
  // 找不到会立即抛错（同步查询的特点）
  const el = screen.getByText("你好，小明");

  // jest-dom 扩展的断言：判断元素是否在文档中
  expect(el).toBeInTheDocument();
});
\`\`\`

运行测试：

\`\`\`bash
npx jest Hello.test.tsx
\`\`\`

## 5. getByRole vs getByTestId：哪个更靠谱

RTL 推荐用 **优先级最高的 \`getByRole\`**，它查询的是 ARIA 角色（accessible name）。

\`\`\`tsx
// 被测组件
function LoginForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form onSubmit={onSubmit}>
      {/* input 默认有 role="textbox"，button 默认有 role="button" */}
      <input type="text" placeholder="用户名" aria-label="用户名" />
      <input type="password" placeholder="密码" aria-label="密码" />
      <button type="submit">登录</button>
    </form>
  );
}

test("用 getByRole 找到登录按钮", () => {
  render(<LoginForm onSubmit={() => {}} />);

  // getByRole("button", { name: "登录" })
  // name 是 accessible name：button 的文本内容会自动成为它的 accessible name
  const btn = screen.getByRole("button", { name: "登录" });
  expect(btn).toBeInTheDocument();

  // 也能用 aria-label 查找输入框
  const userInput = screen.getByRole("textbox", { name: "用户名" });
  expect(userInput).toBeInTheDocument();
});
\`\`\`

**为什么推荐 \`getByRole\`**：

- 强制你写出对屏幕阅读器友好的组件（accessibility 顺便做了）
- 重构改 className 不影响测试
- 测试失败时报错信息更可读（"找到了 3 个 button"）

**什么时候用 \`getByTestId\`**：

- 文本动态、且没有合适 role 时（如列表项里非交互的动态文本）
- 用法：\`<div data-testid="price">¥99</div>\` → \`screen.getByTestId("price")\`

\`\`\`tsx
// 仅在没有更好查询方式时才用 testid
function OrderRow({ price }: { price: number }) {
  return <tr><td data-testid="price">¥{price}</td></tr>;
}

test("价格显示正确", () => {
  render(<OrderRow price={99} />);
  expect(screen.getByTestId("price")).toHaveTextContent("¥99");
});
\`\`\`

## 6. accessible name 是什么

\`accessible name\` 是屏幕阅读器读给用户听的名字。计算规则大致是：

1. \`aria-labelledby\` 指向的元素文本（最高优先级）
2. \`aria-label\` 属性的值
3. 元素自身的内容（如 button 的文本、img 的 alt）
4. 关联 label 的 input（\`<label>用户名 <input/></label>\`）

\`\`\`tsx
// 三种写法的 accessible name 都是 "保存"
<button>保存</button>
<button aria-label="保存"><Icon /></button>
<span id="lbl">保存</span><button aria-labelledby="lbl"><Icon /></button>

// 测试时统一这样查：
screen.getByRole("button", { name: "保存" });
\`\`\`

## 7. screen vs container：为什么用 screen

\`\`\`tsx
// ❌ 老写法：从 container 查询
const { container } = render(<Hello name="小明" />);
container.querySelector(".title"); // 不推荐

// ✅ 新写法：直接用 screen 全局对象
render(<Hello name="小明" />);
screen.getByText("你好，小明"); // 推荐
\`\`\`

\`screen\` 是全局单例，引用的是当前文档。用它写测试更简洁，且能让 RTL 给出更准确的报错信息。

## 8. 查询 API 一览

RTL 的查询分**同步**和**异步**两种：

| 类型 | API | 行为 |
| --- | --- | --- |
| 同步 | \`getByXxx\` | 找不到立即抛错，找到多个也抛错 |
| 同步 | \`queryByXxx\` | 找不到返回 \`null\`，用于断言"不存在" |
| 异步 | \`findByXxx\` | 找不到等（默认 1s），超时抛错，用于异步渲染 |

\`\`\`tsx
test("同步与异步查询对比", async () => {
  render(<SomeComponent />);

  // 同步：元素一定已经渲染好
  expect(screen.getByText("立即显示")).toBeInTheDocument();

  // 断言"不存在"：必须用 query，否则 getBy 会抛错
  expect(screen.queryByText("不存在")).not.toBeInTheDocument();

  // 异步：等待元素出现（默认 1000ms）
  expect(await screen.findByText("1 秒后出现")).toBeInTheDocument();
});
\`\`\`

## 小结

- Jest + RTL + ts-jest + jest-dom 是 React TS 项目的测试标配组合。
- \`jest.config.js\` 用 \`ts-jest\` 预设 + jsdom 环境 + \`setupFilesAfterEnv\`。
- 查询优先级：\`getByRole\` > \`getByLabelText\` > \`getByPlaceholderText\` > \`getByText\` > \`getByTestId\`。
- 同步用 \`getBy\`（断言"不存在"用 \`queryBy\`），异步用 \`findBy\`。
- \`screen\` 比 \`container.querySelector\` 更地道。

## 避坑清单

- ❌ 忘记 \`setupFilesAfterEnv\` 加载 jest-dom（\`toBeInTheDocument\` 报错）
- ❌ 用 \`getByText\` 断言"元素不存在"（应该用 \`queryByText\`，getByText 会直接抛错）
- ❌ 用 \`container.querySelector\` 替代 RTL 查询（应该用 \`screen.getByRole\`）
- ❌ tsconfig.test.json 不加 \`@testing-library/jest-dom\` 到 \`types\`（断言方法报类型错误）
- ❌ 给所有元素都贴 \`data-testid\`（应该优先用 role/label/text）

下一章我们写真实的组件测试：交互、异步、props、快照。`
  },

  // ============================================================
  // ch71: 组件测试实战
  // ============================================================
  {
    id: "tsx3-ch71",
    group: "第十一部分 测试",
    icon: "🎯",
    title: "ch71 组件测试实战",
    content: `# ch71 组件测试实战

## 为什么讲这个

上一章搭好了环境、记住了 API。但真正写组件测试时，你会遇到一堆真实问题：**怎么模拟用户点击？怎么测异步加载？waitFor 和 findBy 啥时候用哪个？快照到底该不该写？** 这一章用 4 个典型场景讲透。

## 1. 测试交互：点击与输入

\`\`\`tsx
// src/Counter.tsx —— 一个计数器组件
import { useState } from "react";

// props 允许传入初始值和步长
interface CounterProps {
  initial?: number;
  step?: number;
}

export function Counter({ initial = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div>
      {/* 当前值显示，role="status" 让屏幕阅读器读出来 */}
      <output role="status" aria-live="polite">
        {count}
      </output>
      <button onClick={() => setCount(c => c + step)}>+{step}</button>
      <button onClick={() => setCount(c => c - step)}>-{step}</button>
    </div>
  );
}
\`\`\`

\`\`\`tsx
// __tests__/Counter.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "../src/Counter";

// describe：把相关测试分组，便于阅读和共享 setup
describe("Counter 组件", () => {
  // userEvent.setup() 返回一个模拟真实用户的对象
  // 注意：v14 必须 await 每次交互（更贴近真实事件循环）
  const user = userEvent.setup();

  test("点击 + 按钮数值增加", async () => {
    render(<Counter initial={0} step={1} />);

    // 找到 +1 按钮
    const plusBtn = screen.getByRole("button", { name: "+1" });

    // 模拟点击：返回 Promise，必须 await
    await user.click(plusBtn);

    // 断言 output 内容变成 1
    expect(screen.getByRole("status")).toHaveTextContent("1");
  });

  test("连续点击多次，数值正确累加", async () => {
    render(<Counter initial={10} step={5} />);

    const plusBtn = screen.getByRole("button", { name: "+5" });
    await user.click(plusBtn);
    await user.click(plusBtn);
    await user.click(plusBtn);

    // 10 + 5*3 = 25
    expect(screen.getByRole("status")).toHaveTextContent("25");
  });
});
\`\`\`

> **避坑**：用 \`userEvent\` 而非 \`fireEvent\`。\`userEvent\` 模拟真实事件流（focus → keydown → keypress → input → keyup），更接近用户行为；\`fireEvent\` 是底层 API，只触发你指定的事件。

## 2. 测试输入框：受控组件

\`\`\`tsx
// src/SearchBox.tsx —— 受控输入框 + 防抖提交
import { useState, useEffect } from "react";

interface SearchBoxProps {
  onSearch: (keyword: string) => void;
  debounceMs?: number;
}

export function SearchBox({ onSearch, debounceMs = 300 }: SearchBoxProps) {
  const [value, setValue] = useState("");

  // 防抖：用户停止输入 debounceMs 后才回调
  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  return (
    <input
      type="text"
      aria-label="搜索"
      placeholder="输入关键字"
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}
\`\`\`

\`\`\`tsx
// __tests__/SearchBox.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "../src/SearchBox";

test("输入文字后触发 onSearch（含防抖）", async () => {
  // jest.fn() 创建一个 mock 函数，能记录被调用次数和参数
  const onSearch = jest.fn();
  const user = userEvent.setup();

  render(<SearchBox onSearch={onSearch} debounceMs={300} />);

  const input = screen.getByRole("textbox", { name: "搜索" });

  // 模拟逐字符输入：会触发多次 onChange
  await user.type(input, "hello");

  // 立即检查：onSearch 应该只被调用过一次（防抖还没结束）
  // 注意：type 过程中每次 onChange 都会重置定时器
  expect(onSearch).toHaveBeenCalledTimes(1); // 第一次 value="" 也会触发一次

  // 用 fake timer 加速时间
  jest.advanceTimersByTime(300);

  // 最终一次调用参数应该是 "hello"
  expect(onSearch).toHaveBeenLastCalledWith("hello");
});
\`\`\`

## 3. 测试异步渲染：waitFor vs findBy

异步组件的测试有两种等待方式，选择规则：

- **只等一个元素出现** → 用 \`findBy\`（更简洁）
- **等多个条件、或断言"不存在"** → 用 \`waitFor\`

\`\`\`tsx
// src/UserProfile.tsx —— 异步加载用户信息
import { useEffect, useState } from "react";

interface User { id: number; name: string; }
interface UserProfileProps { fetchUser: () => Promise<User>; }

export function UserProfile({ fetchUser }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser().then(setUser).catch(() => setError("加载失败"));
  }, [fetchUser]);

  // 三种状态：加载中、成功、失败
  if (error) return <div role="alert">{error}</div>;
  if (!user) return <div role="status">加载中...</div>;
  return <div role="heading">{user.name}</div>;
}
\`\`\`

\`\`\`tsx
// __tests__/UserProfile.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { UserProfile } from "../src/UserProfile";

test("加载成功后显示用户名", async () => {
  // mock 异步函数，返回一个 resolved Promise
  const fetchUser = jest.fn().mockResolvedValue({ id: 1, name: "Alice" });

  render(<UserProfile fetchUser={fetchUser} />);

  // 初始状态：显示加载中
  expect(screen.getByRole("status")).toHaveTextContent("加载中...");

  // findBy：等待 heading 出现（默认 1s 超时）
  const heading = await screen.findByRole("heading");
  expect(heading).toHaveTextContent("Alice");
});

test("加载失败时显示错误信息", async () => {
  const fetchUser = jest.fn().mockRejectedValue(new Error("network"));

  render(<UserProfile fetchUser={fetchUser} />);

  // waitFor：等到 alert 角色出现
  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("加载失败");
  });
});

test("加载成功后不再显示加载中", async () => {
  const fetchUser = jest.fn().mockResolvedValue({ id: 1, name: "Alice" });

  render(<UserProfile fetchUser={fetchUser} />);

  // 等 heading 出现
  await screen.findByRole("heading");

  // 再断言加载中已消失：用 queryBy（不抛错）
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
\`\`\`

> **findBy vs getBy**：\`getBy\` 是同步的，元素没立刻渲染就抛错；\`findBy\` 是 \`getBy\` 的异步版本，等元素出现。**异步渲染必用 \`findBy\` 或 \`waitFor\`**。

## 4. 测试 props 与回调

\`\`\`tsx
// src/TodoItem.tsx —— 一个待办项
interface TodoItemProps {
  text: string;
  done: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function TodoItem({ text, done, onToggle, onDelete }: TodoItemProps) {
  return (
    <li>
      {/* checkbox 的 role 是 "checkbox"，accessible name 来自关联 label */}
      <label>
        <input type="checkbox" checked={done} onChange={onToggle} />
        {text}
      </label>
      <button onClick={onDelete}>删除</button>
    </li>
  );
}
\`\`\`

\`\`\`tsx
// __tests__/TodoItem.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../src/TodoItem";

describe("TodoItem", () => {
  test("未完成状态显示正确", () => {
    render(<TodoItem text="学测试" done={false} onToggle={() => {}} onDelete={() => {}} />);

    const checkbox = screen.getByRole("checkbox");
    // jest-dom 扩展：断言 checkbox 未选中
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("学测试")).toBeInTheDocument();
  });

  test("点击 checkbox 触发 onToggle 回调", async () => {
    // mock 回调
    const onToggle = jest.fn();
    const user = userEvent.setup();

    render(<TodoItem text="学测试" done={false} onToggle={onToggle} onDelete={() => {}} />);

    await user.click(screen.getByRole("checkbox"));

    // 断言回调被调用 1 次
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test("点击删除按钮触发 onDelete 回调", async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();

    render(<TodoItem text="学测试" done={false} onToggle={() => {}} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "删除" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("传入不同 props 渲染不同状态", () => {
    const { rerender } = render(
      <TodoItem text="A" done={false} onToggle={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    // rerender：用新 props 重新渲染同一组件实例
    rerender(<TodoItem text="A" done={true} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
\`\`\`

## 5. Snapshot 测试：取舍

快照测试把组件的渲染输出存成字符串，下次再渲染时对比字符串是否变化。

\`\`\`tsx
import { render } from "@testing-library/react";
import { Counter } from "../src/Counter";

test("Counter 快照", () => {
  const { container } = render(<Counter initial={0} step={1} />);

  // 第一次运行：把 container.innerHTML 存为快照
  // 之后每次运行：对比快照是否一致，不一致就报错
  expect(container).toMatchSnapshot();
});
\`\`\`

**快照的优点**：

- 写起来快，一行代码"包住"整个组件
- 防止无意中改了渲染输出

**快照的缺点**：

- 一改样式/文案就报错，**真假阳性比很差**
- 容易养成"看快照失败就按 u 更新"的坏习惯
- 不能验证行为，只能验证"长得一样"

**实践建议**：

- ✅ 适合纯展示组件（没有交互、没有状态）
- ✅ 适合稳定的库组件（设计系统）
- ❌ 不适合业务组件（文案/样式经常变）
- ❌ 不能用快照替代交互测试

\`\`\`tsx
// 一个更适合快照的例子：静态卡片
function ProfileCard({ name, title }: { name: string; title: string }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{title}</p>
    </div>
  );
}

test("ProfileCard 快照", () => {
  const { container } = render(<ProfileCard name="Alice" title="Engineer" />);
  expect(container).toMatchSnapshot();
});
\`\`\`

## 小结

- 模拟交互用 \`userEvent\`，不要用底层 \`fireEvent\`。
- 异步渲染等待元素用 \`findBy\`；等待多个条件用 \`waitFor\`。
- 测试 props 与回调时，用 \`jest.fn()\` 创建 mock 函数，断言被调用次数和参数。
- \`rerender\` 可以用新 props 重新渲染同一组件实例。
- 快照测试适合纯展示组件，不适合业务组件，**不能替代交互测试**。

## 避坑清单

- ❌ 用 \`fireEvent\` 模拟点击（应该用 \`userEvent\`，更接近真实事件流）
- ❌ 异步测试用 \`getBy\` 等元素（应该用 \`findBy\` 或 \`waitFor\`）
- ❌ 用 \`getBy\` 断言"元素消失"（应该用 \`queryBy\`）
- ❌ 快照失败就无脑按 \`u\` 更新（应该先看 diff 判断是否符合预期）
- ❌ 用快照测试覆盖所有组件（应该针对稳定组件用，业务组件用交互测试）
- ❌ 测试里直接调 \`setInterval\` 等真实定时器（应该用 \`jest.useFakeTimers\`，下一章讲）

下一章我们讲 Hook 测试与各种 mock 技巧。`
  },

  // ============================================================
  // ch72: Hook 测试与 mock
  // ============================================================
  {
    id: "tsx3-ch72",
    group: "第十一部分 测试",
    icon: "🪝",
    title: "ch72 Hook 测试与 mock",
    content: `# ch72 Hook 测试与 mock

## 为什么讲这个

自定义 Hook 是 React 复用逻辑的核心手段。但 Hook 不能直接调用，必须挂在一个组件里——这给测试带来麻烦。同时真实项目里 Hook 经常调 \`fetch\`、定时器、第三方模块，**不 mock 就没法测**。这一章把 \`renderHook\`、\`act\`、\`jest.mock\`、fake timer、spy 全讲一遍。

## 1. renderHook：测试自定义 Hook 的官方姿势

\`\`\`tsx
// src/useCounter.ts —— 一个计数器 Hook
import { useState, useCallback } from "react";

export function useCounter(initial: number = 0) {
  const [count, setCount] = useState(initial);

  // useCallback：稳定 increment/decrement 引用
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initial), [initial]);

  return { count, increment, decrement, reset };
}
\`\`\`

\`\`\`tsx
// __tests__/useCounter.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "../src/useCounter";

test("初始值正确", () => {
  // renderHook：在虚拟组件里调用 Hook，返回 result
  // result.current 永远是 Hook 最新一次返回值
  const { result } = renderHook(() => useCounter(10));

  expect(result.current.count).toBe(10);
});

test("increment 后值 +1", () => {
  const { result } = renderHook(() => useCounter(0));

  // act：所有会触发状态更新的操作都要包在 act 里
  // 否则 React 会报警告"state update not wrapped in act"
  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});

test("rerender 重新调用 Hook（用新初始值）", () => {
  const { result, rerender } = renderHook(({ initial }) => useCounter(initial), {
    initialProps: { initial: 0 },
  });

  expect(result.current.count).toBe(0);

  // rerender：用新 props 重新渲染
  rerender({ initial: 100 });

  // 注意：useState 的初始值只在首次挂载生效，rerender 不会重置
  expect(result.current.count).toBe(0);

  // reset 用的是新 initial（因为 reset 的 useCallback 依赖 initial）
  act(() => result.current.reset());
  expect(result.current.count).toBe(100);
});
\`\`\`

> **act 是什么**：React 的测试模式要求所有状态更新都包在 \`act()\` 里。这样 React 能批量同步处理更新，断言前状态已经稳定。\`userEvent\`、\`fireEvent\` 内部已经包了 act；但你直接调 \`result.current.increment()\` 这种纯函数时需要手动包。

## 2. 测试带 useEffect 的 Hook

\`\`\`tsx
// src/useWindowSize.ts —— 监听窗口大小
import { useEffect, useState } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () => setSize({ width: innerWidth, height: innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return size;
}
\`\`\`

\`\`\`tsx
// __tests__/useWindowSize.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useWindowSize } from "../src/useWindowSize";

test("监听 resize 事件", () => {
  const { result } = renderHook(() => useWindowSize());

  expect(result.current).toEqual({ width: 1024, height: 768 });

  // 模拟 window 尺寸变化
  act(() => {
    // jsdom 允许直接改 innerWidth/innerHeight
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 400, writable: true });
    window.dispatchEvent(new Event("resize"));
  });

  expect(result.current).toEqual({ width: 500, height: 400 });
});

test("卸载时移除监听器", () => {
  const removeSpy = jest.spyOn(window, "removeEventListener");
  const { unmount } = renderHook(() => useWindowSize());

  unmount();

  // 断言 removeEventListener 被调用过
  expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  removeSpy.mockRestore();
});
\`\`\`

## 3. mock fetch：用 msw 拦截网络请求

[MSW](https://mswjs.io/)（Mock Service Worker）是目前最优雅的网络 mock 方案：在 Service Worker 层拦截请求，**测试代码和生产代码都不用改**。

\`\`\`bash
npm install -D msw
\`\`\`

\`\`\`tsx
// src/useUser.ts —— 加载用户数据的 Hook
import { useEffect, useState } from "react";

interface User { id: number; name: string; }

export function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(\`/api/users/\${userId}\`)
      .then(res => {
        if (!res.ok) throw new Error("请求失败");
        return res.json() as Promise<User>;
      })
      .then(data => { if (!cancelled) { setUser(data); setError(null); } })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading, error };
}
\`\`\`

\`\`\`tsx
// __tests__/useUser.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { useUser } from "../src/useUser";

// 用 msw 启动一个拦截服务器
const server = setupServer(
  // 拦截 GET /api/users/1，返回模拟数据
  http.get("/api/users/1", () => {
    return HttpResponse.json({ id: 1, name: "Alice" });
  }),
  // 拦截 GET /api/users/2，返回 500
  http.get("/api/users/2", () => {
    return new HttpResponse(null, { status: 500 });
  })
);

// 所有测试开始前启动 server
beforeAll(() => server.listen());
// 每个测试后重置 handler（防止测试间互相污染）
afterEach(() => server.resetHandlers());
// 所有测试结束后关闭 server
afterAll(() => server.close());

test("成功加载用户", async () => {
  const { result } = renderHook(() => useUser(1));

  // 初始状态：loading=true
  expect(result.current.loading).toBe(true);

  // 等待 loading 变 false
  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.user).toEqual({ id: 1, name: "Alice" });
  expect(result.current.error).toBeNull();
});

test("请求失败时设置 error", async () => {
  const { result } = renderHook(() => useUser(2));

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.user).toBeNull();
  expect(result.current.error).toBe("请求失败");
});
\`\`\`

> **避坑**：\`beforeAll\`/\`afterEach\`/\`afterAll\` 是 Jest 全局钩子，分别在"所有测试前""每个测试后""所有测试后"运行。

## 4. mock 模块：jest.mock

有时候你不想要 msw 那么重的方案，只想 mock 整个模块：

\`\`\`tsx
// src/api.ts —— 一个 API 模块
export const api = {
  async getUser(id: number) {
    const res = await fetch(\`/api/users/\${id}\`);
    return res.json();
  },
};
\`\`\`

\`\`\`tsx
// __tests__/componentWithApi.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "../src/api";

// jest.mock：把整个模块替换成 mock
// 第一个参数是模块路径，第二个是工厂函数返回替代品
jest.mock("../src/api", () => ({
  api: {
    // mockResolvedValue：让 getUser 返回一个 resolved Promise
    getUser: jest.fn().mockResolvedValue({ id: 1, name: "Mock Alice" }),
  },
}));

// 注意：jest.mock 会提升到文件顶部，所以上面即使写在 import 后也有效
// 但需要在测试里 require/api 引用前定义 mock

function UserCard({ id }: { id: number }) {
  // 假设组件内部用了 api.getUser
  return <UserCardInner id={id} />;
}

import { useEffect, useState } from "react";
function UserCardInner({ id }: { id: number }) {
  const [name, setName] = useState("加载中");
  useEffect(() => {
    api.getUser(id).then((u: { name: string }) => setName(u.name));
  }, [id]);
  return <div>{name}</div>;
}

test("用 jest.mock 替换 api 模块", async () => {
  render(<UserCard id={1} />);

  // 等 mock 数据渲染出来
  await waitFor(() => {
    expect(screen.getByText("Mock Alice")).toBeInTheDocument();
  });
});
\`\`\`

## 5. 计时器 mock：jest.useFakeTimers

测试带 setTimeout/setInterval 的代码时，真实等待浪费时间。用 fake timers 让时间可控：

\`\`\`tsx
// src/useDebouncedValue.ts —— 防抖 Hook
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
\`\`\`

\`\`\`tsx
// __tests__/useDebouncedValue.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "../src/useDebouncedValue";

beforeEach(() => {
  // 每个测试前：启用 fake timers
  jest.useFakeTimers();
});

afterEach(() => {
  // 每个测试后：恢复真实 timers（防止污染其他测试）
  jest.useRealTimers();
});

test("防抖：在 delay 内值不更新", () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebouncedValue(value, 300),
    { initialProps: { value: "a" } }
  );

  // 重新渲染：传入新值
  rerender({ value: "b" });

  // 立即检查：result 还是旧值 "a"
  expect(result.current).toBe("a");

  // 推进时间 200ms（还没到 300ms）
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(result.current).toBe("a"); // 仍然是旧值

  // 再推进 100ms，总共 300ms，触发 setTimeout 回调
  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current).toBe("b"); // 终于更新了
});
\`\`\`

**fake timers 常用 API**：

| API | 作用 |
| --- | --- |
| \`jest.useFakeTimers()\` | 启用假时间，\`setTimeout\` 等被替换 |
| \`jest.useRealTimers()\` | 恢复真实时间 |
| \`jest.advanceTimersByTime(ms)\` | 推进指定毫秒 |
| \`jest.runAllTimers()\` | 跑完所有待执行的 timer |
| \`jest.runOnlyPendingTimers()\` | 只跑当前队列里的 timer |

> **避坑**：\`jest.advanceTimersByTime\` 必须包在 \`act\` 里，否则 React 状态更新不会同步。

## 6. spy：监听函数调用

\`jest.spyOn\` 不替换函数实现，只是"窃听"它的调用情况：

\`\`\`tsx
// src/utils.ts
export const utils = {
  log(message: string) {
    console.log(message);
  },
};
\`\`\`

\`\`\`tsx
// __tests__/spy.test.ts
import { utils } from "../src/utils";

test("spy 监听 log 调用", () => {
  // spy：不改变原函数行为，只是记录调用
  const spy = jest.spyOn(utils, "log");

  utils.log("hello");
  utils.log("world");

  // 断言被调用 2 次
  expect(spy).toHaveBeenCalledTimes(2);
  // 断言第一次调用参数是 "hello"
  expect(spy).toHaveBeenNthCalledWith(1, "hello");
  // 断言第二次调用参数是 "world"
  expect(spy).toHaveBeenNthCalledWith(2, "world");

  // mockRestore：恢复原始实现，移除 spy
  spy.mockRestore();
});

test("spy + mockImplementation 替换实现", () => {
  const spy = jest.spyOn(utils, "log").mockImplementation(() => {
    // 替换成空实现，避免污染测试输出
  });

  utils.log("hello"); // 这次不会真的 console.log
  expect(spy).toHaveBeenCalled();

  spy.mockRestore();
});
\`\`\`

**\`jest.fn()\` vs \`jest.spyOn()\`**：

- \`jest.fn()\`：创建一个全新的 mock 函数，**没有原始实现**
- \`jest.spyOn(obj, method)\`：在已有方法上"挂监听"，**默认保留原始实现**

## 7. 组合实战：测一个真实 Hook

\`\`\`tsx
// src/usePolling.ts —— 轮询 Hook
import { useEffect, useRef, useState } from "react";

interface Options<T> {
  fetcher: () => Promise<T>;
  interval: number;
  enabled?: boolean;
}

export function usePolling<T>({ fetcher, interval, enabled = true }: Options<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const d = await fetcherRef.current();
        if (!cancelled) { setData(d); setError(null); }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };

    tick(); // 立即触发一次
    const id = setInterval(tick, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [enabled, interval]);

  return { data, error };
}
\`\`\`

\`\`\`tsx
// __tests__/usePolling.test.tsx
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePolling } from "../src/usePolling";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("轮询：每 interval 调用 fetcher", async () => {
  const fetcher = jest.fn().mockResolvedValue("data");
  const { result } = renderHook(() =>
    usePolling({ fetcher, interval: 1000 })
  );

  // 首次立即调用一次（tick()）
  // 注意：fake timer 下 Promise 不会自动 resolve，需要 await
  await waitFor(() => expect(result.current.data).toBe("data"));
  expect(fetcher).toHaveBeenCalledTimes(1);

  // 推进 1000ms：触发第二次
  await act(async () => {
    jest.advanceTimersByTime(1000);
    // 等 Promise 微任务完成
    await Promise.resolve();
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
\`\`\`

## 小结

- 测试 Hook 用 \`renderHook\`，所有状态更新包在 \`act\` 里。
- \`rerender\` 用新 props 重渲染，\`unmount\` 测试卸载逻辑。
- mock 网络优先用 \`msw\`（不改代码），简单场景用 \`jest.mock\` 整体替换模块。
- fake timers 让 \`setTimeout/setInterval\` 可控，\`advanceTimersByTime\` 必须包 \`act\`。
- \`jest.fn()\` 创建全新 mock，\`jest.spyOn()\` 在已有方法上窃听（默认保留原实现）。

## 避坑清单

- ❌ 直接调 \`result.current.increment()\` 不包 \`act\`（应该 \`act(() => result.current.increment())\`）
- ❌ fake timers 测异步 fetch 不 \`await Promise.resolve()\`（微任务没跑完状态未更新）
- ❌ 在 \`jest.mock\` 工厂里引用外部变量（提升机制导致变量未定义，应使用 \`jest.requireActual\` 或在工厂内构造）
- ❌ \`afterEach\` 忘了 \`mockRestore\` / \`mockReset\`（spy 残留污染下一个测试）
- ❌ 用 \`jest.useFakeTimers\` 后不 \`jest.useRealTimers\` 恢复（其他测试真实定时器失效）

下一章我们看 E2E 测试工具 Playwright。`
  },

  // ============================================================
  // ch73: E2E 测试 Playwright
  // ============================================================
  {
    id: "tsx3-ch73",
    group: "第十一部分 测试",
    icon: "🎭",
    title: "ch73 E2E 测试 Playwright",
    content: `# ch73 E2E 测试 Playwright

## 为什么讲这个

单元测试和组件测试都在 jsdom 里跑，**它们不知道真实浏览器会发生什么**：跨页面跳转、真实网络延迟、不同浏览器兼容性。E2E（端到端）测试用真实浏览器跑完整流程，是上线前的最后一道保险。Playwright 是微软出的新一代 E2E 工具，**比 Cypress 更快、跨浏览器、自动等待**，是 2024 年后的事实标准。

## 1. 安装与初始化

\`\`\`bash
# 安装 playwright 与测试运行器
npm install -D @playwright/test

# 安装浏览器二进制（chromium / firefox / webkit）
npx playwright install

# 初始化配置文件和示例测试
npx playwright init
\`\`\`

\`npx playwright init\` 会生成 \`playwright.config.ts\` 和一个 \`tests/\` 目录的示例。

## 2. playwright.config.ts：核心配置

\`\`\`ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // 测试目录：所有 *.spec.ts 都会被收集
  testDir: "./tests",

  // 是否开启并行（默认开启）
  fullyParallel: true,

  // 失败时是否禁止重试（CI 推荐 2 次）
  retries: process.env.CI ? 2 : 0,

  // 并发 worker 数
  workers: process.env.CI ? 1 : undefined,

  // 报告器：HTML 报告便于本地查看
  reporter: [["html", { open: "never" }]],

  // 全局配置：所有测试都用这个 baseURL
  use: {
    baseURL: "http://localhost:5173",
    // 失败时截图
    trace: "on-first-retry",
    // 每个测试超时 30s
    timeout: 30000,
  },

  // 启动项目：在测试前自动启动 dev server
  // 这样 CI 里不用单独启动
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },

  // 测试覆盖的浏览器/设备
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 15"] } },
  ],
});
\`\`\`

\`\`webServer\` 是个杀手级特性：**测试运行前自动 \`npm run dev\`，等 url 可访问后开始测试**，结束后自动关掉。CI 直接跑 \`npx playwright test\` 即可。

## 3. 写第一个 E2E 测试

\`\`\`ts
// tests/home.spec.ts
import { test, expect } from "@playwright/test";

// test.describe：分组，类似 describe
test.describe("首页", () => {

  // beforeAll：所有测试前跑一次
  test.beforeEach(async ({ page }) => {
    // page 是 Playwright 的核心对象，代表一个浏览器 tab
    await page.goto("/");
  });

  test("标题显示正确", async ({ page }) => {
    // page.title()：获取页面标题
    const title = await page.title();
    expect(title).toContain("My App");
  });

  test("导航栏存在", async ({ page }) => {
    // getByRole：和 RTL 一样的语义化查询
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });

  test("点击登录跳转到登录页", async ({ page }) => {
    // 点击导航栏里的"登录"链接
    await page.getByRole("link", { name: "登录" }).click();

    // expect(url) 自动等待 URL 变化
    await expect(page).toHaveURL(/\\/login/);
  });
});
\`\`\`

## 4. locator：Playwright 的查询核心

\`locator\` 是 Playwright 的查询对象，**惰性、自动重试**：

\`\`\`ts
import { test, expect } from "@playwright/test";

test("locator 各种查询方式", async ({ page }) => {
  await page.goto("/");

  // 1. 语义化（推荐）
  const button = page.getByRole("button", { name: "提交" });
  const heading = page.getByRole("heading", { level: 1 });
  const input = page.getByLabel("用户名");

  // 2. 文本查询
  const welcome = page.getByText("欢迎");
  const exact = page.getByText("欢迎", { exact: true }); // 精确匹配

  // 3. testid（兜底方案）
  const price = page.getByTestId("price");

  // 4. CSS / XPath（不推荐，脆弱）
  const el = page.locator(".btn-primary");
  const xpath = page.locator("xpath=//button[@type='submit']");

  // locator 可以链式调用，缩小范围
  const header = page.locator("header");
  const headerBtn = header.getByRole("button", { name: "搜索" });

  // first / last / nth：选择第几个
  const firstItem = page.getByRole("listitem").first();
  const thirdItem = page.getByRole("listitem").nth(2);

  // count：获取匹配数量
  const count = await page.getByRole("listitem").count();
  expect(count).toBe(5);
});
\`\`\`

## 5. auto-wait：Playwright 的核心魔法

Playwright 的所有动作（click/fill/select）**都会自动等待元素可交互**：

- 元素出现在 DOM 里
- 元素可见（不 \`display:none\`）
- 元素稳定（不在动画中）
- 元素可接收事件（不被遮挡）
- 元素启用（不 \`disabled\`）

\`\`\`ts
test("auto-wait 不用手写 sleep", async ({ page }) => {
  await page.goto("/");

  // ❌ Cypress 风格：手写 timeout
  // await page.waitForTimeout(1000);
  // await page.click("#btn");

  // ✅ Playwright 风格：click 自动等按钮可点击
  await page.getByRole("button", { name: "提交" }).click();

  // 断言也自动等待：toBeVisible 默认等 5s
  await expect(page.getByText("提交成功")).toBeVisible();
});
\`\`\`

**断言的自动等待**：\`expect(locator).toBeVisible()\` 会持续重试，直到断言通过或超时。这是 Playwright 比 Cypress 体验更好的关键。

## 6. 网络拦截：mock API 响应

E2E 测试不应该依赖真实后端。Playwright 可以拦截任意请求并返回 mock 数据：

\`\`\`ts
test("mock 登录 API", async ({ page }) => {
  // page.route：拦截匹配的请求
  await page.route("**/api/login", async (route) => {
    // route.fulfill：返回 mock 响应
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "fake-token", user: { name: "Alice" } }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("用户名").fill("alice");
  await page.getByLabel("密码").fill("password");
  await page.getByRole("button", { name: "登录" }).click();

  // 验证 mock 后的跳转
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("欢迎 Alice")).toBeVisible();
});

test("模拟 API 失败", async ({ page }) => {
  await page.route("**/api/login", async (route) => {
    await route.fulfill({
      status: 401,
      body: JSON.stringify({ message: "密码错误" }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("用户名").fill("alice");
  await page.getByLabel("密码").fill("wrong");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page.getByText("密码错误")).toBeVisible();
});
\`\`\`

也能用 \`route.abort()\` 模拟网络断开：

\`\`\`ts
test("断网时显示错误", async ({ page }) => {
  await page.route("**/api/**", (route) => route.abort("failed"));
  await page.goto("/dashboard");
  await expect(page.getByText("网络错误")).toBeVisible();
});
\`\`\`

## 7. Page Object 模式：组织复杂测试

测试一多，重复代码满天飞。**Page Object** 把每个页面的操作封装成类：

\`\`\`ts
// tests/pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  // 把关键 locator 存成属性，便于复用
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel("用户名");
    this.passwordInput = page.getByLabel("密码");
    this.submitButton = page.getByRole("button", { name: "登录" });
    this.errorMessage = page.getByRole("alert");
  }

  // 封装跳转
  async goto() {
    await this.page.goto("/login");
  }

  // 封装登录流程
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
\`\`\`

\`\`\`ts
// tests/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test("登录成功", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("alice", "password");

  await expect(page).toHaveURL("/dashboard");
});

test("密码错误显示提示", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("alice", "wrong");

  await expect(loginPage.errorMessage).toHaveText("密码错误");
});
\`\`\`

Page Object 的好处：UI 改了只需要改一处，所有测试自动跟进。

## 8. 录制：让 Playwright 帮你写测试

\`\`\`bash
# 启动录制：Playwright 打开浏览器，你操作，它生成代码
npx playwright codegen http://localhost:5173
\`\`\`

录制窗口会实时生成代码，可以直接复制到测试文件。**对新手特别友好**——你不需要记所有 API，先录制，再优化。

\`\`\`bash
# 录制时还可以指定设备
npx playwright codegen --device="iPhone 15" http://localhost:5173

# 录制时保存到指定文件
npx playwright codegen -o tests/recorded.spec.ts http://localhost:5173
\`\`\`

## 9. 调试失败的测试

\`\`\`bash
# UI 模式：打开可视化测试运行器，可以一步步看每个测试
npx playwright test --ui

# 调试模式：每个步骤暂停，配合 Playwright Inspector
npx playwright test --debug

# 只跑某个测试文件
npx playwright test tests/login.spec.ts

# 只跑名字匹配的测试
npx playwright test -g "登录成功"

# 查看上次失败的报告
npx playwright show-report
\`\`\`

失败时 Playwright 会自动截图、录屏、保存 trace。用 \`npx playwright show-trace trace.zip\` 可以打开 trace 查看器，**像调试器一样回放每一步**。

## 10. CI 集成

GitHub Actions 的最小配置：

\`\`\`yaml
# .github/workflows/e2e.yml
name: E2E
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      # 装浏览器
      - run: npx playwright install --with-deps
      # 跑测试
      - run: npx playwright test
      # 失败时上传报告
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report
\`\`\`

\`npx playwright install --with-deps\` 会同时安装浏览器二进制和系统依赖（apt 包），CI 上必须加 \`--with-deps\`。

## 小结

- Playwright 跨浏览器、自动等待、配置简洁，是 E2E 测试首选。
- \`playwright.config.ts\` 用 \`webServer\` 自动启动 dev server，CI 友好。
- \`locator\` 惰性、自动重试，优先用 \`getByRole\` / \`getByLabel\` / \`getByText\`。
- \`page.route\` 拦截网络请求，让 E2E 不依赖真实后端。
- Page Object 模式组织复杂测试，UI 变化时只改一处。
- \`npx playwright codegen\` 录制测试，\`--ui\` 可视化调试，\`--debug\` 配合 Inspector。

## 避坑清单

- ❌ 用 \`page.waitForTimeout\` 手写 sleep（应该用 \`expect(locator).toBeVisible()\` 自动等待）
- ❌ 用 CSS 选择器查询（应该用 \`getByRole\` 等语义化查询，更稳定）
- ❌ CI 上忘了 \`--with-deps\`（浏览器跑不起来，提示缺 libnss3 之类）
- ❌ 不 mock API 直接打真实后端（应该用 \`page.route\` 拦截）
- ❌ 复杂流程不用 Page Object（重复代码多，维护困难）
- ❌ 失败不查 trace 就重试（应该用 \`show-trace\` 看具体哪一步出问题）

至此第十一部分测试结束。整套书还剩工程化与进阶主题，我们继续。`
  },
];

export { chapters };
