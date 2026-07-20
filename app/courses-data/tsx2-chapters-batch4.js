// =============================================================
// TypeScript + React 从入门到精通大全 —— 第四批章节
// -------------------------------------------------------------
// 覆盖：第四部分 Props 与组件组合
// 包含 5 个章节：ch16 ~ ch20
//
// 主题：Props 基础/高级类型、组件组合模式、forwardRef、ErrorBoundary
// 运行环境：React 18（沙箱注入 react / react-dom）
// =============================================================

const chapters = [
  // ============================================================
  // 第十六章：Props 基础
  // ============================================================
  {
    id: "tsx2-ch16",
    group: "第四部分 Props 与组件组合",
    icon: "📦",
    title: "第十六章 Props 基础",
    content: `# 第十六章 Props 基础

Props（properties 的缩写）是 React 组件的"输入参数"，也是父子组件通信的唯一渠道。本章从最基础的 props 传参与解构开始，覆盖默认值、可选、\`children\`、props drilling 等核心概念。

## 16.1 传 props

\`\`\`tsx
// 子组件：定义 props 类型
function Welcome({ name, age }: { name: string; age: number }) {
  return <p>你好，{name}，你 {age} 岁了</p>;
}

// 父组件：传 props
function App() {
  return <Welcome name="张三" age={30} />;
}
\`\`\`

**JSX 里字符串可以直接写**（\`name="张三"\`），**其他类型用 \`{}\`**（\`age={30}\`）。

## 16.2 解构 vs 整体接收

\`\`\`tsx
// 解构（推荐）
function Button1({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick}>{label}</button>;
}

// 整体接收
function Button2(props: { label: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
\`\`\`

**解构更简洁**，但如果你想把整个 props 透传给子组件，**用 spread**：

\`\`\`tsx
function Group({ title, ...rest }: { title: string; [key: string]: any }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      <Child {...rest} />
    </fieldset>
  );
}
\`\`\`

## 16.3 默认值

### 16.3.1 解构默认值

\`\`\`tsx
function Greeting({ name = "陌生人", age = 18 }: { name?: string; age?: number }) {
  return <p>你好，{name}，{age}岁</p>;
}

<Greeting />                    // "你好，陌生人，18岁"
<Greeting name="张三" />        // "你好，张三，18岁"
<Greeting name="李四" age={25} /> // "你好，李四，25岁"
\`\`\`

### 16.3.2 defaultProps（不推荐）

React 18 之前可以用 \`defaultProps\` 静态属性，**现在不推荐**——解构默认值更直接。

## 16.4 可选 props

用 \`?\` 标记可选字段。**TS 会自动把可选字段类型加上 \`undefined\`**。

\`\`\`tsx
function Avatar({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  // size 类型是 number | undefined，但有默认值，所以是 number
  return <img src={src} alt={alt} width={size} height={size} />;
}

<Avatar src="/x.png" alt="头像" />     // size 用默认 40
<Avatar src="/x.png" alt="头像" size={80} />
\`\`\`

## 16.5 children prop

\`children\` 是 React 特殊的 prop：组件标签**之间的内容**会自动作为 children 传入。

### 16.5.1 基本用法

\`\`\`tsx
// React 18+ 类型：ReactNode（更宽松的版本）
import { ReactNode } from "react";

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
      {children}
    </div>
  );
}

// 使用
<Card>
  <h1>标题</h1>
  <p>内容</p>
</Card>
\`\`\`

### 16.5.2 children 的类型

- \`ReactNode\`：任何可渲染内容（推荐）
- \`JSX.Element\`：只能是单个 JSX 元素
- \`string\`：只能是字符串
- 自定义：函数、数组等

\`\`\`tsx
// 限制 children 是函数（render props 模式）
function DataLoader({ children }: { children: (data: any) => ReactNode }) {
  const data = { name: "张三" };
  return <div>{children(data)}</div>;
}

<DataLoader>
  {(data) => <p>你好，{data.name}</p>}
</DataLoader>
\`\`\`

## 16.6 props drilling 问题

**Props drilling** 指"props 一层一层往下传"。

\`\`\`tsx
function App() {
  const user = { name: "张三" };
  return <Page user={user} />;       // 第一层
}

function Page({ user }: { user: User }) {
  return <Header user={user} />;      // 第二层
}

function Header({ user }: { user: User }) {
  return <UserInfo user={user} />;    // 第三层
}

function UserInfo({ user }: { user: User }) {
  return <p>{user.name}</p>;          // 终于用上了
}
\`\`\`

中间两层 \`Page\` 和 \`Header\` 根本不需要 \`user\`，但被强行加上了 prop。这就是 **props drilling**。

### 解决方案

1. **Context**：跨层级共享数据（第九部分会详讲）
2. **组件组合**：把子组件作为 prop 传，避开中间层
3. **状态管理库**：Zustand、Redux 等

## 16.7 透传 props（Spread）

\`\`\`tsx
// 子组件把所有未知 props 透传给内部 input
function TextField({ label, ...rest }: { label: string; [key: string]: any }) {
  return (
    <div>
      <label>{label}</label>
      <input {...rest} />
    </div>
  );
}

<TextField
  label="姓名"
  type="text"
  placeholder="请输入姓名"
  maxLength={20}
  onChange={(e) => console.log(e.target.value)}
/>
\`\`\`

**注意**：用 \`[key: string]: any\` 太宽，更安全的方式是用 \`ComponentProps\`（第十七章会讲）。

## 16.8 保留字 prop

React 保留了一些 prop 名，**不能用作自定义 prop**：

- \`key\`：列表 key
- \`ref\`：ref 引用（除非用 forwardRef）
- \`children\`：特殊含义
- \`dangerouslySetInnerHTML\`：HTML 注入

## 16.9 综合 Demo：完整表单组件

\`\`\`tsx
// 第十六章综合 demo：完整表单组件
// 演示：props、children、默认值、透传

import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

// 1. 基础 Card
function Card({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ background: "#f5f5f5", padding: 12, fontWeight: 600 }}>
        {title}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
      {footer && (
        <div style={{ background: "#fafafa", padding: 12, borderTop: "1px solid #eee" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// 2. 通用 TextField
function TextField({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
        {label}
      </label>
      <input
        {...inputProps}
        style={{
          width: "100%",
          padding: 8,
          border: \`1px solid \${error ? "red" : "#ddd"}\`,
          borderRadius: 4,
        }}
      />
      {error && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

// 3. 按钮组件
function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const colors = {
    primary: "#007bff",
    secondary: "#6c757d",
    danger: "#dc3545",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: colors[variant],
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// 4. 表单（用 children 组合）
function LoginForm() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("提交");
  }

  return (
    <Card
      title="登录"
      footer={
        <div style={{ textAlign: "right" }}>
          <Button variant="secondary" onClick={() => console.log("取消")}>取消</Button>
          <span style={{ marginLeft: 8 }} />
          <Button variant="primary" type="submit">登录</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <TextField
          label="用户名"
          name="username"
          placeholder="请输入用户名"
          required
        />
        <TextField
          label="密码"
          name="password"
          type="password"
          placeholder="请输入密码"
          error=""
        />
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" type="submit">登录</Button>
        </div>
      </form>
    </Card>
  );
}

// 5. 用组件组合避免 props drilling
function Sidebar({ children }: { children: ReactNode }) {
  return <aside style={{ width: 200, background: "#f8f9fa", padding: 16 }}>{children}</aside>;
}

function Layout({ sidebar, content }: { sidebar: ReactNode; content: ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar>{sidebar}</Sidebar>
      <main style={{ flex: 1, padding: 16 }}>{content}</main>
    </div>
  );
}

// 6. 父组件决定 sidebar 内容，无需通过中间层传递
function Dashboard() {
  const user = { name: "张三" };

  return (
    <Layout
      sidebar={
        <>
          <h3>菜单</h3>
          <p>欢迎，{user.name}</p>
        </>
      }
      content={
        <>
          <h1>主页</h1>
          <LoginForm />
        </>
      }
    />
  );
}

// 7. 渲染
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Dashboard />);
  console.log("Dashboard 已挂载");
}

// 8. 演示 props 透传
function Input({ ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} />;
}

// 9. 模拟一个错误状态展示
function ErrorState({ message }: { message?: string }) {
  // message 可选，不传时显示默认
  return <div style={{ color: "red" }}>{message ?? "出现错误"}</div>;
}

console.log("默认错误：", "出现错误");
console.log("自定义错误：", "网络异常");
\`\`\`

## 小结

- Props 是父子组件通信的唯一方式，**数据流单向**（父→子）。
- 解构比 \`props.xxx\` 简洁，但透传时需要 spread \`{...rest}\`。
- 默认值用解构默认值（\`{ name = "陌生人" }\`），比 \`defaultProps\` 直观。
- 可选 props 用 \`?\`，TS 自动加 \`undefined\`。
- \`children\` 是特殊 prop，用 \`ReactNode\` 类型最灵活。
- **Props drilling** 严重时考虑 Context、组件组合或状态管理库。
- 透传 props 配合 \`React.InputHTMLAttributes<HTMLInputElement>\` 等内置类型最安全。
- \`key\` / \`ref\` / \`children\` / \`dangerouslySetInnerHTML\` 是 React 保留 prop 名。
`,
  },

  // ============================================================
  // 第十七章：Props 高级类型
  // ============================================================
  {
    id: "tsx2-ch17",
    group: "第四部分 Props 与组件组合",
    icon: "🏗️",
    title: "第十七章 Props 高级类型",
    content: `# 第十七章 Props 高级类型

真实业务里，组件的 props 经常需要表达"互斥"、"条件"、"多态"等复杂关系。**这一章我们学习让 TS 在编译期帮你检查"props 组合是否合法"的高级模式**。

## 17.1 联合 props：互斥字段

最常见的复杂情况是"几个字段互斥——只能传其中一个"。

### 17.1.1 简单联合

\`\`\`tsx
// 按钮要么是普通按钮，要么是链接
type ButtonProps =
  | { onClick: () => void; href?: never }
  | { href: string; onClick?: never };

function Button(props: ButtonProps) {
  if (props.href) {
    return <a href={props.href}>链接</a>;
  }
  return <button onClick={props.onClick}>按钮</button>;
}

<Button onClick={() => {}} />     // ✓
<Button href="/home" />          // ✓
<Button onClick={() => {}} href="/x" />  // ❌ 互斥
\`\`\`

### 17.1.2 判别联合（更清晰）

\`\`\`tsx
// 用 variant 字段区分
type ButtonProps =
  | { variant: "button"; onClick: () => void }
  | { variant: "link"; href: string }
  | { variant: "submit" };

function Button(props: ButtonProps) {
  switch (props.variant) {
    case "button":
      return <button onClick={props.onClick}>按钮</button>;
    case "link":
      return <a href={props.href}>链接</a>;
    case "submit":
      return <button type="submit">提交</button>;
  }
}

<Button variant="button" onClick={() => {}} />  // ✓
<Button variant="link" href="/x" />              // ✓
<Button variant="button" href="/x" />             // ❌ href 不能和 variant=button 共存
\`\`\`

**判别联合更易读**——只需看 variant 就知道其他字段是什么。

## 17.2 条件 props

"满足某个条件时，才允许传某个 prop"。

\`\`\`tsx
// 当 disabled=true 时不能传 onClick
type ButtonProps = {
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
};

// 进阶：精确条件
type StrictButtonProps =
  | { disabled: true; onClick?: never }
  | { disabled?: false; onClick: () => void };

function StrictButton(props: StrictButtonProps) {
  if (props.disabled) {
    return <button disabled>不可点</button>;
  }
  return <button onClick={props.onClick}>可点</button>;
}
\`\`\`

## 17.3 泛型组件

### 17.3.1 基础泛型

\`\`\`tsx
// 泛型 List 组件：items 类型由调用方决定
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>(props: ListProps<T>) {
  return (
    <ul>
      {props.items.map((item, i) => (
        <li key={props.keyExtractor(item)}>
          {props.renderItem(item, i)}
        </li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={[{ id: 1, name: "A" }]}
  keyExtractor={(u) => String(u.id)}
  renderItem={(u) => u.name}
/>
\`\`\`

### 17.3.2 泛型函数组件的写法

\`\`\`tsx
// 写法 1：箭头函数
const List2 = <T,>(props: ListProps<T>) => { /* ... */ };
// 注意 <T,> 的逗号，避免和 JSX 语法冲突

// 写法 2：function 声明
function List3<T>(props: ListProps<T>) { /* ... */ }
\`\`\`

**推荐写法 2**，更清晰，调试时函数有名字。

## 17.4 omit / pick 模式

复用现有类型的一部分：

\`\`\`tsx
// HTML 原生 button 属性
type ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// 我们组件的 props = 原生属性 - 不需要的 + 自定义的
type MyButtonProps = Omit<ButtonBaseProps, "type"> & {
  variant: "primary" | "secondary";
};

function MyButton({ variant, children, ...rest }: MyButtonProps) {
  return (
    <button {...rest} className={\`btn btn-\${variant}\`}>
      {children}
    </button>
  );
}
\`\`\`

## 17.5 ComponentProps：从其他组件继承 props

\`\`\`tsx
// 继承某个组件的 props
type InputProps = React.ComponentProps<"input">;
// 等价于 React.InputHTMLAttributes<HTMLInputElement>

type DivProps = React.ComponentProps<"div">;

// 继承自定义组件
type CardProps = React.ComponentProps<typeof Card>;
\`\`\`

## 17.6 Polymorphic Components（多态组件）

"同一个组件，根据 \`as\` prop 渲染成不同标签"。

\`\`\`tsx
// 多态 Text 组件：可以渲染为 span、p、h1、div 等
type TextProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children">;

function Text<T extends React.ElementType = "span">({
  as,
  children,
  ...rest
}: TextProps<T>) {
  // 用 createElement 而不是 JSX，因为 JSX 写不出动态 tag
  const Component = (as || "span") as React.ElementType;
  return React.createElement(Component, rest, children);
}

// 使用
<Text>默认 span</Text>
<Text as="h1">大标题</Text>
<Text as="p" className="text-gray">段落</Text>
<Text as="a" href="/x">链接</Text>
\`\`\`

这是 UI 库（Chakra UI、Mantine）的核心技术。

## 17.7 复杂的 prop 校验：Refined

\`\`\`tsx
// 用判别联合 + never 实现"必填二选一"
type Either<A, B> =
  | (A & { [K in keyof B]?: never })
  | (B & { [K in keyof A]?: never });

type ButtonProps = Either<
  { onClick: () => void },
  { href: string }
>;

function Btn(props: ButtonProps) {
  if ("href" in props) {
    return <a href={props.href}>链接</a>;
  }
  return <button onClick={props.onClick}>按钮</button>;
}
\`\`\`

## 17.8 常见 props 类型工具

| 类型 | 来源 | 用途 |
| --- | --- | --- |
| \`React.HTMLAttributes<HTMLDivElement>\` | React | div 元素的属性 |
| \`React.ButtonHTMLAttributes<HTMLButtonElement>\` | React | button 属性 |
| \`React.InputHTMLAttributes<HTMLInputElement>\` | React | input 属性 |
| \`React.ComponentProps<"tag">\` | React | 同上（更通用） |
| \`React.ComponentProps<typeof Comp>\` | React | 自定义组件的属性 |
| \`React.RefAttributes<HTMLDivElement>\` | React | 带 ref 的属性 |
| \`React.CSSProperties\` | React | style 对象 |

## 17.9 综合 Demo：多态卡片

\`\`\`tsx
// 第十七章综合 demo：多态卡片
// 演示：联合 props、泛型组件、ComponentProps、Polymorphic

import { ReactNode, ElementType, ComponentPropsWithoutRef } from "react";
import { createRoot } from "react-dom/client";

// 1. 联合 props：Badge 变体
type BadgeProps =
  | { variant: "dot"; color?: "red" | "green" | "blue" }
  | { variant: "number"; count: number }
  | { variant: "text"; text: string };

function Badge(props: BadgeProps) {
  switch (props.variant) {
    case "dot":
      return <span style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: props.color || "red",
      }} />;
    case "number":
      return <span style={{
        background: "red",
        color: "white",
        borderRadius: 10,
        padding: "0 6px",
        fontSize: 12,
      }}>{props.count}</span>;
    case "text":
      return <span style={{
        background: "#eee",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 12,
      }}>{props.text}</span>;
  }
}

console.log("Badge 演示");
const b1: BadgeProps = { variant: "dot", color: "green" };
const b2: BadgeProps = { variant: "number", count: 5 };
const b3: BadgeProps = { variant: "text", text: "新" };
console.log("三种变体合法：", b1, b2, b3);

// 2. 泛型 List
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

function List<T>({ items, renderItem, keyExtractor, emptyMessage = "暂无数据" }: ListProps<T>) {
  if (items.length === 0) {
    return <p style={{ color: "#999" }}>{emptyMessage}</p>;
  }
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 3. 多态 Text 组件
type TextProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

function Text<T extends ElementType = "span">({
  as,
  children,
  ...rest
}: TextProps<T>) {
  const Component = (as || "span") as ElementType;
  return React.createElement(Component, rest, children);
}

// 4. 基于原生 button 的封装
type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  icon: ReactNode;
  type?: "button" | "submit";
};

function IconButton({ icon, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 12px",
        border: "1px solid #ddd",
        borderRadius: 4,
        background: "white",
        cursor: "pointer",
        ...(rest.style || {}),
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// 5. 继承某个组件的 props
function BaseCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 16,
    }}>
      {children}
    </div>
  );
}

// 复用 BaseCard 的所有 props
type ExtendedCardProps = React.ComponentProps<typeof BaseCard> & {
  shadow?: boolean;
};

function ExtendedCard({ shadow, ...rest }: ExtendedCardProps) {
  return (
    <div style={{
      boxShadow: shadow ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
    }}>
      <BaseCard {...rest} />
    </div>
  );
}

// 6. 互斥字段的工具
type Either<A, B> =
  | (A & { [K in keyof B]?: never })
  | (B & { [K in keyof A]?: never });

type ActionButtonProps = Either<
  { onClick: () => void },
  { href: string }
>;

function ActionButton(props: ActionButtonProps) {
  if ("href" in props) {
    return <a href={props.href}>操作</a>;
  }
  return <button onClick={props.onClick}>操作</button>;
}

// 7. 应用
function App() {
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>高级 props 演示</h1>

      <h2>1. Badge 变体</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge variant="dot" color="green" />
        <Badge variant="number" count={3} />
        <Badge variant="text" text="NEW" />
      </div>

      <h2>2. 泛型 List</h2>
      <List
        items={[{ id: 1, name: "张三" }, { id: 2, name: "李四" }]}
        renderItem={(u: { id: number; name: string }) => u.name}
        keyExtractor={(u) => String(u.id)}
      />

      <h2>3. 多态 Text</h2>
      <Text>默认 span</Text>
      <br />
      <Text as="h2" style={{ color: "blue" }}>用 h2 渲染</Text>
      <br />
      <Text as="a" href="/home">链接文本</Text>

      <h2>4. IconButton</h2>
      <IconButton icon="🔍" onClick={() => console.log("搜索")}>
        搜索
      </IconButton>

      <h2>5. ActionButton（二选一）</h2>
      <ActionButton onClick={() => console.log("点")} />
      <span style={{ marginLeft: 8 }} />
      <ActionButton href="/x" />
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("高级 props 演示已挂载");
}
\`\`\`

## 小结

- 联合 props 用判别字段（如 \`variant\`）让 TS 推断精确属性。
- 条件 props 用 \`{ disabled: true; onClick?: never }\` 实现"互斥"。
- **泛型组件** \`<T,>\` 让组件复用时仍保持类型安全。
- \`React.ComponentProps<"tag">\` 复用原生元素属性，\`ComponentProps<typeof Comp>\` 复用其他组件。
- \`Omit<原生, "type">\` 配合 \`&\` 自定义属性是最常见的封装模式。
- **Polymorphic 组件**用 \`as\` prop + \`createElement\` 实现"同 API 不同标签"。
- 互斥字段的工具类型 \`Either<A, B>\` 让"二选一"在编译期强制。
- 复杂 props 设计的核心思路：**先想清楚"什么字段在什么情况下必填/互斥"**。
`,
  },

  // ============================================================
  // 第十八章：组件组合模式
  // ============================================================
  {
    id: "tsx2-ch18",
    group: "第四部分 Props 与组件组合",
    icon: "🧱",
    title: "第十八章 组件组合模式",
    content: `# 第十八章 组件组合模式

React 的核心思想是**组合（composition）而非继承**。本章我们学习五种最重要的组件组合模式：children 组合、slot 模式、render props、HOC、function as child。每种模式都有适用场景和取舍。

## 18.1 children 组合

最简单最常用的模式。

\`\`\`tsx
function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h1>标题</h1>
  <p>内容</p>
</Card>
\`\`\`

**适用**：单一内容区。

## 18.2 slot 模式（命名 slot）

需要多个内容区域时，用"具名 prop"代替 children：

\`\`\`tsx
// Modal 有 header、body、footer 三个 slot
interface ModalProps {
  header?: ReactNode;
  children: ReactNode;     // body
  footer?: ReactNode;
}

function Modal({ header, children, footer }: ModalProps) {
  return (
    <div className="modal">
      {header && <div className="modal-header">{header}</div>}
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  );
}

<Modal
  header={<h2>标题</h2>}
  footer={<Button>确定</Button>}
>
  <p>这是内容</p>
</Modal>
\`\`\`

**适用**：UI 有多个独立区域（如 Modal、Layout、Card）。

## 18.3 render props

把"如何渲染"作为函数 prop 传入。

\`\`\`tsx
// 鼠标位置追踪器
interface MouseTrackerProps {
  render: (pos: { x: number; y: number }) => ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  // 真实项目里会监听 mousemove
  const pos = { x: 100, y: 200 };
  return <div>{render(pos)}</div>;
}

<MouseTracker render={({ x, y }) => (
  <p>鼠标：{x}, {y}</p>
)} />
\`\`\`

**适用**：组件提供"数据"或"行为"，把"如何展示"交给调用方。

## 18.4 function as child

render props 的变体——用 children 传函数：

\`\`\`tsx
interface MouseProps {
  children: (pos: { x: number; y: number }) => ReactNode;
}

function Mouse({ children }: MouseProps) {
  const pos = { x: 100, y: 200 };
  return <div>{children(pos)}</div>;
}

<Mouse>
  {({ x, y }) => <p>鼠标：{x}, {y}</p>}
</Mouse>
\`\`\`

**适用**：和 render props 一样，但 children 让用法更像"内容"。**React Router、Formik、Apollo** 等库都用这个模式。

## 18.5 HOC（Higher-Order Component）

HOC 是"接收组件，返回新组件"的函数：

\`\`\`tsx
// withLoading：给任意组件加 loading 态
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoading(props: P & { isLoading?: boolean }) {
    const { isLoading, ...rest } = props;
    if (isLoading) {
      return <p>加载中...</p>;
    }
    return <Component {...(rest as P)} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading isLoading={true} users={users} />
\`\`\`

**注意**：HOC 模式在 Hooks 出现后**逐渐被替代**——用自定义 Hook 写更直接。**新项目优先用 Hook**，但维护老项目时会遇到 HOC。

### 18.5.1 HOC 的常见问题

1. **Props 冲突**：HOC 加的 prop 不能和原组件 prop 同名
2. **Ref 丢失**：HOC 返回的组件 ref 不会透传（要用 forwardRef）
3. **静态方法丢失**：原组件上的 static 方法在 HOC 包装后会丢
4. **调试困难**：组件树里多一层

## 18.6 Hook 替代 HOC

\`\`\`tsx
// 用自定义 Hook 实现"加载态"
function useLoading() {
  const [loading, setLoading] = useState(false);
  // ... 加载逻辑
  return { loading, setLoading };
}

function UserList({ users }: { users: User[] }) {
  const { loading } = useLoading();
  if (loading) return <p>加载中...</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

**优势**：没有 HOC 的 props 冲突、ref 丢失问题，逻辑更内聚。

## 18.7 受控组件 vs 非受控组件

这不是"组合模式"但与组件设计密切相关。

\`\`\`tsx
// 受控：值由父组件管理
function ControlledInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

// 非受控：自己管理内部状态
function UncontrolledInput({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
\`\`\`

**实践**：表单库通常两种都支持。

## 18.8 Provider 模式

用 Context 把数据"广播"给后代：

\`\`\`tsx
import { createContext, useContext } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  // 不需要通过 props 层层传递
  const theme = useContext(ThemeContext);
  return <div>当前主题：{theme}</div>;
}
\`\`\`

**适用**：跨多层共享全局数据（主题、用户、设置等）。

## 18.9 模式选择指南

| 模式 | 适用 | 缺点 |
| --- | --- | --- |
| children | 单一内容 | 不够灵活 |
| slot | 多区域 UI | 命名繁琐 |
| render props | 数据 + 自定义渲染 | 函数嵌套深 |
| function as child | 同 render props | 同上 |
| HOC | 跨组件复用逻辑 | 包装地狱、ref 丢失 |
| Hook | 复用状态逻辑 | 不能用在 class 组件 |
| Provider | 跨层级共享 | 性能需要优化 |

## 18.10 综合 Demo：组合式 Modal 库

\`\`\`tsx
// 第十八章综合 demo：完整的组合式 Modal
// 演示：slot、render props、function as child、HOC、Provider

import { ReactNode, createContext, useContext, useState } from "react";
import { createRoot } from "react-dom/client";

// 1. slot 模式：Modal
interface ModalProps {
  header?: ReactNode;
  children: ReactNode;     // body
  footer?: ReactNode;
  onClose?: () => void;
}

function Modal({ header, children, footer, onClose }: ModalProps) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "white",
        borderRadius: 8,
        minWidth: 400,
        maxWidth: 600,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}>
        {header && (
          <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
            {header}
          </div>
        )}
        <div style={{ padding: 16 }}>{children}</div>
        {footer && (
          <div style={{ padding: 16, borderTop: "1px solid #eee", textAlign: "right" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// 2. function as child：Toggle
interface ToggleProps {
  defaultOn?: boolean;
  children: (state: { on: boolean; toggle: () => void }) => ReactNode;
}

function Toggle({ defaultOn = false, children }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return <>{children({ on, toggle: () => setOn(!on) })}</>;
}

// 3. render props：List
interface ListProps<T> {
  items: T[];
  render: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, render, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{render(item, i)}</li>
      ))}
    </ul>
    );
}

// 4. HOC 模式：withLogger
interface WithLoggerProps {
  label?: string;
}

function withLogger<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & WithLoggerProps> {
  return function WithLogger({ label, ...props }: P & WithLoggerProps) {
    console.log(\`[\${label || "Component"}] render\`);
    return <Component {...(props as P)} />;
  };
}

function PlainButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick}>{children}</button>;
}

const LoggedButton = withLogger(PlainButton);

// 5. Provider 模式：ThemeContext
const ThemeContext = createContext<"light" | "dark">("light");
const useTheme = () => useContext(ThemeContext);

function ThemedButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  const theme = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        border: "none",
        borderRadius: 4,
        background: theme === "dark" ? "#333" : "#007bff",
        color: "white",
      }}
    >
      {children}
    </button>
  );
}

// 6. 应用
function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
        <h1>组件组合模式演示</h1>

        <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
          切换主题（当前：{theme}）
        </button>

        <h2>1. Slot 模式：Modal</h2>
        <button onClick={() => setModalOpen(true)}>打开 Modal</button>
        {modalOpen && (
          <Modal
            header={<h3>确认操作</h3>}
            footer={
              <>
                <button onClick={() => setModalOpen(false)}>取消</button>
                <span style={{ marginLeft: 8 }} />
                <ThemedButton onClick={() => setModalOpen(false)}>确定</ThemedButton>
              </>
            }
            onClose={() => setModalOpen(false)}
          >
            <p>你确定要执行这个操作吗？</p>
          </Modal>
        )}

        <h2>2. Function as Child：Toggle</h2>
        <Toggle defaultOn={false}>
          {({ on, toggle }) => (
            <div>
              <p>状态：{on ? "开" : "关"}</p>
              <button onClick={toggle}>切换</button>
            </div>
          )}
        </Toggle>

        <h2>3. Render Props：List</h2>
        <List
          items={["苹果", "香蕉", "橙子"]}
          render={(item, i) => \`\${i + 1}. \${item}\`}
          keyExtractor={(item) => item}
        />

        <h2>4. HOC：withLogger</h2>
        <LoggedButton
          label="MyButton"
          onClick={() => console.log("clicked")}
        >
          点我（控制台会输出日志）
        </LoggedButton>

        <h2>5. Provider + Hook：useTheme</h2>
        <ThemedButton onClick={() => console.log("themed click")}>
          主题按钮
        </ThemedButton>
      </div>
    </ThemeContext.Provider>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("组合模式演示已挂载");
}
\`\`\`

## 小结

- **children 组合**适合单一内容区，最简单。
- **slot 模式**用具名 prop 表达多区域 UI（Modal、Layout）。
- **render props** 把"如何渲染"作为函数 prop。
- **function as child** 是 render props 的变体，用 children 传函数。
- **HOC** 包装组件复用逻辑，但有 props 冲突、ref 丢失等副作用。
- **Hook 是 HOC 的现代替代**：用 useXxx 共享逻辑，没有包装问题。
- **Provider + Context** 解决跨层级共享数据。
- 模式选择：根据"数据流方向"和"复用粒度"选最直观的方案。
- **新项目优先用 Hook + Context**；老项目可能遇到 HOC，需要能读懂。
`,
  },

  // ============================================================
  // 第十九章：转发 Ref (forwardRef)
  // ============================================================
  {
    id: "tsx2-ch19",
    group: "第四部分 Props 与组件组合",
    icon: "➡️",
    title: "第十九章 转发 Ref (forwardRef)",
    content: `# 第十九章 转发 Ref (forwardRef)

\`ref\` 让父组件直接访问子组件的 DOM 节点或实例。但**函数组件默认没有 ref**——因为它没有实例。本章我们学习 useRef、forwardRef、useImperativeHandle，让函数组件也能正确转发 ref。

## 19.1 useRef 基础

\`useRef\` 返回一个**跨渲染保持不变**的对象，\`\`\`{ current: T }\`\`\`。

\`\`\`tsx
import { useRef } from "react";

function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    // current 可能为 null（初始渲染还没挂载）
    inputRef.current?.focus();
  }

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦</button>
    </>
  );
}
\`\`\`

\`useRef\` 两大用途：
1. **访问 DOM 节点**（最常见）
2. **保存任意可变值**（不触发重渲染）

### 19.1.1 useRef vs useState

| 特性 | useState | useRef |
| --- | --- | --- |
| 改值触发重渲染 | ✓ | ✗ |
| 跨渲染保持值 | ✓ | ✓ |
| 用途 | UI 状态 | DOM 引用、可变值 |

## 19.2 函数组件默认没有 ref

\`\`\`tsx
function MyInput() {
  return <input />;
}

function App() {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <MyInput ref={ref} />  // ❌ 函数组件不能直接接收 ref
      <input ref={ref} />     // ✓ 原生标签可以
    </>
  );
}
\`\`\`

原因：函数组件没有"实例"，ref 没有可指向的对象。**React 提供了 \`forwardRef\` 解决**。

## 19.3 forwardRef：转发 ref

\`\`\`tsx
import { forwardRef, ForwardedRef } from "react";

// forwardRef 把 ref 从父组件转发到内部的 DOM 节点
const MyInput = forwardRef<HTMLInputElement, { placeholder?: string }>(
  (props, ref) => {
    return <input ref={ref} placeholder={props.placeholder} />;
  }
);

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <MyInput ref={inputRef} placeholder="请输入" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
    </>
  );
}
\`\`\`

**\`forwardRef\` 签名**：

\`\`\`tsx
forwardRef<RefType, PropsType>((props, ref) => JSX)
\`\`\`

## 19.4 useImperativeHandle：自定义暴露的 ref API

\`useImperativeHandle\` 让你**自定义 ref 暴露的 API**，而不是把整个 DOM 节点暴露出去。

\`\`\`tsx
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// 定义 ref 暴露的形状
interface CustomInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const CustomInput = forwardRef<CustomInputHandle, { placeholder?: string }>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");

    // 自定义 ref API
    useImperativeHandle(ref, () => ({
      focus() {
        inputRef.current?.focus();
      },
      clear() {
        setValue("");
      },
      getValue() {
        return value;
      },
    }));

    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={props.placeholder}
      />
    );
  }
);

function App() {
  const ref = useRef<CustomInputHandle>(null);

  return (
    <>
      <CustomInput ref={ref} placeholder="请输入" />
      <button onClick={() => ref.current?.focus()}>聚焦</button>
      <button onClick={() => ref.current?.clear()}>清空</button>
      <button onClick={() => console.log("值：", ref.current?.getValue())}>
        读值
      </button>
    </>
  );
}
\`\`\`

**优势**：父组件只能访问你暴露的 API，无法直接操控 DOM——**更好的封装性**。

## 19.5 透传多个 ref

如果需要把 ref 透传给多个子元素，**用 callback ref**：

\`\`\`tsx
const MultiInput = forwardRef<HTMLInputElement, {}>((props, ref) => {
  // 接收 forwarded ref（只能有一个）
  return <input ref={ref} />;
});

// 多 ref 用 callback
function App() {
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={refA} />
      <input ref={refB} />
    </>
  );
}
\`\`\`

## 19.6 callback ref

\`ref\` 可以是一个函数，在节点挂载/卸载时调用：

\`\`\`tsx
function App() {
  // ref 是个函数
  const setRef = (node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      console.log("已挂载", node);
    }
  };

  return <input ref={setRef} />;
}
\`\`\`

**注意**：callback ref 在每次渲染都会创建新函数，可能导致重复调用。**用 useCallback 缓存**：

\`\`\`tsx
const setRef = useCallback((node: HTMLInputElement | null) => {
  if (node) node.focus();
}, []);
\`\`\`

## 19.7 forwardRef 在第三方库中的常见用法

- **Ant Design**：\`Input\` / \`Select\` / \`Form\` 等都支持 ref
- **Material UI**：\`TextField\`、\`Button\` 等
- **React Hook Form**：\`register\` 用 ref 访问 input

设计组件库时，**给 input/form 类组件加 forwardRef 是基础**。

## 19.8 综合 Demo：可复用的 Input 组件

\`\`\`tsx
// 第十九章综合 demo：可复用 Input 组件
// 演示：useRef、forwardRef、useImperativeHandle

import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";

// 1. 基础 forwardRef
const TextField = forwardRef<HTMLInputElement, {
  label: string;
  placeholder?: string;
  defaultValue?: string;
}>((props, ref) => {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", marginBottom: 4 }}>{props.label}</label>
      <input
        ref={ref}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        style={{
          width: "100%",
          padding: 8,
          border: "1px solid #ddd",
          borderRadius: 4,
        }}
      />
    </div>
  );
});

// 2. 自定义 handle：受控 + 暴露命令式 API
interface SearchInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
  setValue: (v: string) => void;
}

const SearchInput = forwardRef<SearchInputHandle, {
  placeholder?: string;
  onChange?: (v: string) => void;
}>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      setValue("");
      props.onChange?.("");
    },
    getValue() {
      return value;
    },
    setValue(v: string) {
      setValue(v);
      props.onChange?.(v);
    },
  }));

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => {
        setValue(e.target.value);
        props.onChange?.(e.target.value);
      }}
      placeholder={props.placeholder}
      style={{
        width: "100%",
        padding: 8,
        border: "1px solid #ddd",
        borderRadius: 4,
      }}
    />
  );
});

// 3. 综合 demo
function App() {
  const textFieldRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<SearchInputHandle>(null);

  const handleFocusText = useCallback(() => {
    textFieldRef.current?.focus();
  }, []);

  const handleSearchFocus = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const handleSearchClear = useCallback(() => {
    searchRef.current?.clear();
  }, []);

  const handleLogValue = useCallback(() => {
    console.log("搜索框当前值：", searchRef.current?.getValue());
  }, []);

  const handleSetValue = useCallback(() => {
    searchRef.current?.setValue("预设值");
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h1>forwardRef 演示</h1>

      <h2>1. 基础 forwardRef</h2>
      <TextField ref={textFieldRef} label="姓名" placeholder="请输入姓名" />
      <button onClick={handleFocusText}>聚焦到姓名输入框</button>

      <h2>2. useImperativeHandle（自定义 API）</h2>
      <SearchInput
        ref={searchRef}
        placeholder="搜索..."
        onChange={v => console.log("搜索：", v)}
      />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={handleSearchFocus}>聚焦</button>
        <button onClick={handleSearchClear}>清空</button>
        <button onClick={handleLogValue}>读值</button>
        <button onClick={handleSetValue}>设值</button>
      </div>

      <h2>3. callback ref</h2>
      <CallbackRefDemo />
    </div>
  );
}

// 4. callback ref 演示
function CallbackRefDemo() {
  // 普通的 ref prop 是函数
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      console.log("节点挂载：", node);
      node.style.border = "2px solid green";
    } else {
      console.log("节点卸载");
    }
  }, []);

  const [show, setShow] = useState(true);

  return (
    <div>
      <button onClick={() => setShow(s => !s)}>{show ? "隐藏" : "显示"}</button>
      {show && (
        <div ref={setRef} style={{ padding: 16, margin: 8, border: "1px solid #ddd" }}>
          这是一个 callback ref 演示节点
        </div>
      )}
    </div>
  );
}

// 5. 渲染
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("forwardRef 演示已挂载");
}
\`\`\`

## 小结

- \`useRef\` 返回跨渲染不变的对象，**修改不触发重渲染**。
- 函数组件默认没有 ref，因为没有实例。
- \`forwardRef<RefType, PropsType>\` 把父组件的 ref 转发到子组件内部的 DOM。
- \`useImperativeHandle\` 自定义 ref 暴露的 API（更好的封装性）。
- callback ref 是函数形式的 ref，挂载/卸载时自动调用。
- 设计可复用 UI 组件时，**加 forwardRef 是基础**。
- 多个 ref 用 callback ref；callback ref 要用 \`useCallback\` 避免重复调用。
`,
  },

  // ============================================================
  // 第二十章：错误边界 ErrorBoundary
  // ============================================================
  {
    id: "tsx2-ch20",
    group: "第四部分 Props 与组件组合",
    icon: "🛡️",
    title: "第二十章 错误边界 ErrorBoundary",
    content: `# 第二十章 错误边界 ErrorBoundary

React 组件树里如果某个组件抛错，**整个应用就会崩掉**——React 16 引入了"错误边界"（Error Boundary）来解决这个痛点。本章我们学习错误边界的实现、用法、限制，以及如何 reset 错误状态。

## 20.1 为什么需要 ErrorBoundary

\`\`\`tsx
// 假设某个组件运行时抛错
function BuggyComponent() {
  throw new Error("Boom!");
}

// 在 React 16 之前，这会"白屏"，整个应用崩了
// 错误边界：捕获子树里的错误，显示降级 UI
\`\`\`

**错误边界的作用**：

1. 捕获子组件渲染、生命周期、构造函数中的错误
2. 阻止错误冒泡到整个应用
3. 显示降级 UI（fallback）
4. **可以记录错误到监控服务**（Sentry 等）

## 20.2 错误边界是 class 组件

**错误边界必须用 class 组件实现**（React 至今没有提供函数版本）。

\`\`\`tsx
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  // 静态方法：render 前触发，返回新 state
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // 生命周期：捕获错误后调用
  componentDidCatch(error: Error, info: ErrorInfo) {
    // 上报错误到监控
    console.error("ErrorBoundary caught:", error, info);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
\`\`\`

**两个关键方法**：

- \`getDerivedStateFromError(error)\`：抛错时返回新 state
- \`componentDidCatch(error, info)\`：抛错时触发（用于上报）

## 20.3 基本用法

\`\`\`tsx
// 用错误边界包裹可能出错的组件
function App() {
  return (
    <ErrorBoundary fallback={<p>出错了，请刷新页面</p>}>
      <BuggyComponent />
    </ErrorBoundary>
  );
}
\`\`\`

## 20.4 错误边界能捕获什么

错误边界**能捕获**：

- 子组件渲染时抛错
- 子组件生命周期方法抛错
- 子组件构造函数抛错

错误边界**不能捕获**：

- 事件处理函数里的错误（用 try/catch）
- 异步代码（setTimeout、Promise）
- 服务端渲染
- 错误边界自己抛出的错误

### 20.4.1 事件处理怎么办

\`\`\`tsx
// ❌ 错误边界捕获不到
function Button() {
  function handleClick() {
    throw new Error("Boom!");
  }
  return <button onClick={handleClick}>点</button>;
}

// ✓ 手动 try/catch
function SafeButton() {
  function handleClick() {
    try {
      throw new Error("Boom!");
    } catch (e) {
      console.error("Caught:", e);
    }
  }
  return <button onClick={handleClick}>点</button>;
}
\`\`\`

## 20.5 多层错误边界

大型应用应该**多层错误边界**嵌套：

\`\`\`tsx
function App() {
  return (
    // 顶层：兜底
    <ErrorBoundary fallback={<PageError />}>
      <Layout>
        <Sidebar>
          {/* 局部边界：sidebar 出错不影响主内容 */}
          <ErrorBoundary fallback={<SidebarError />}>
            <SidebarContent />
          </ErrorBoundary>
        </Sidebar>
        <Main>
          {/* 局部边界：每个 widget 独立 */}
          <ErrorBoundary fallback={<WidgetError />}>
            <WidgetA />
          </ErrorBoundary>
          <ErrorBoundary fallback={<WidgetError />}>
            <WidgetB />
          </ErrorBoundary>
        </Main>
      </Layout>
    </ErrorBoundary>
  );
}
\`\`\`

## 20.6 Reset 错误状态

错误边界捕错后，要提供"重试"按钮让用户恢复：

\`\`\`tsx
class ResettableErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
    this.props.onError?.(error, info);
  }

  // 重置方法
  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 让 fallback 能拿到 reset 方法
      if (React.isValidElement(this.props.fallback)) {
        return React.cloneElement(this.props.fallback, { reset: this.reset });
      }
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 用法
<ResettableErrorBoundary
  fallback={({ reset }) => (
    <div>
      <p>出错了</p>
      <button onClick={reset}>重试</button>
    </div>
  )}
>
  <BuggyComponent />
</ResettableErrorBoundary>
\`\`\`

## 20.7 错误边界的最佳实践

### 20.7.1 不要滥用

\`\`\`tsx
// ❌ 每个组件都包错误边界（过度）
<ErrorBoundary>
  <Button />
</ErrorBoundary>

// ✓ 关键边界才包
<ErrorBoundary>
  <MainFeature />
</ErrorBoundary>
\`\`\`

### 20.7.2 Fallback UI 要有信息

\`\`\`tsx
// ❌ 太简单
fallback={<p>出错了</p>}

// ✓ 提供上下文
fallback={
  <div>
    <h3>这里出错了</h3>
    <p>请稍后重试或联系管理员</p>
    <button onClick={reload}>刷新页面</button>
  </div>
}
\`\`\`

### 20.7.3 上报错误

\`\`\`tsx
componentDidCatch(error, info) {
  // 上报到 Sentry
  Sentry.captureException(error, { extra: info });
  // 上报到日志
  logger.error("UI Error:", error, info);
}
\`\`\`

## 20.8 替代方案：react-error-boundary

社区有现成的 \`react-error-boundary\` 库，封装了上述所有功能：

\`\`\`tsx
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div>
      <p>出错：{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback} onError={console.error}>
  <BuggyComponent />
</ErrorBoundary>
\`\`\`

**新项目推荐用这个库**，而不是自己手写。

## 20.9 函数组件 + Hook 替代？

React 团队讨论过"用 Hook 实现错误边界"，但截至 React 18 仍**只有 class 组件**。原因：\`<Suspense>\` 正在演化为通用错误处理机制，可能未来会替代 ErrorBoundary。

## 20.10 综合 Demo：多层错误边界

\`\`\`tsx
// 第二十章综合 demo：多层错误边界
// 演示：ErrorBoundary 实现、多层嵌套、错误上报、reset

import { Component, ErrorInfo, ReactNode, isValidElement, cloneElement, useState, ReactElement } from "react";
import { createRoot } from "react-dom/client";

// 1. 通用 ErrorBoundary
interface ErrorBoundaryProps {
  fallback: ReactNode | ((props: { error: Error | null; reset: () => void }) => ReactNode);
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 上报到"监控服务"（这里用 console 模拟）
    console.error("[ErrorBoundary]", error.message, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      if (isValidElement(fallback)) {
        return cloneElement(fallback as ReactElement, { reset: this.reset });
      }
      return fallback;
    }
    return this.props.children;
  }
}

// 2. 模拟可能出错的组件
function WidgetA({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("WidgetA 加载失败");
  }
  return (
    <div style={{ padding: 16, background: "#e8f5e9", borderRadius: 8 }}>
      <h3>Widget A（正常）</h3>
      <p>这是正常工作的组件</p>
    </div>
  );
}

function WidgetB({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("WidgetB 数据解析失败");
  }
  return (
    <div style={{ padding: 16, background: "#e3f2fd", borderRadius: 8 }}>
      <h3>Widget B（正常）</h3>
      <p>另一个正常组件</p>
    </div>
  );
}

// 3. 通用 Fallback UI
function ErrorFallback({ error, reset, title }: {
  error: Error | null;
  reset?: () => void;
  title?: string;
}) {
  return (
    <div style={{
      padding: 16,
      background: "#ffebee",
      border: "1px solid #f44336",
      borderRadius: 8,
      color: "#c62828",
    }}>
      <h3>⚠️ {title || "出错了"}</h3>
      <p>{error?.message || "未知错误"}</p>
      {reset && <button onClick={reset} style={{ marginTop: 8 }}>重试</button>}
    </div>
  );
}

// 4. 主应用
function App() {
  const [aBroken, setABroken] = useState(false);
  const [bBroken, setBBroken] = useState(false);

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>错误边界演示</h1>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setABroken(b => !b)}>
          {aBroken ? "恢复 Widget A" : "破坏 Widget A"}
        </button>
        <button onClick={() => setBBroken(b => !b)} style={{ marginLeft: 8 }}>
          {bBroken ? "恢复 Widget B" : "破坏 Widget B"}
        </button>
      </div>

      <h2>1. 独立错误边界</h2>
      <p>每个 Widget 独立边界，互不影响</p>
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <ErrorFallback error={error} reset={reset} title="Widget A 出错" />
        )}
        onError={(e) => console.log("Widget A 错误上报：", e.message)}
      >
        <WidgetA shouldThrow={aBroken} />
      </ErrorBoundary>

      <ErrorBoundary
        fallback={({ error, reset }) => (
          <ErrorFallback error={error} reset={reset} title="Widget B 出错" />
        )}
        onError={(e) => console.log("Widget B 错误上报：", e.message)}
      >
        <WidgetB shouldThrow={bBroken} />
      </ErrorBoundary>

      <h2>2. 共享错误边界</h2>
      <p>一个边界包多个组件，任意一个出错整片降级</p>
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <ErrorFallback error={error} reset={reset} title="整个区域出错" />
        )}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <WidgetA shouldThrow={aBroken} />
          <WidgetB shouldThrow={bBroken} />
        </div>
      </ErrorBoundary>
    </div>
  );
}

// 5. 渲染
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log("ErrorBoundary 演示已挂载");
}

// 6. 模拟错误上报
function simulateErrorReport(error: Error) {
  console.log("[模拟 Sentry] 上报错误：", error.message);
}
simulateErrorReport(new Error("test error"));
\`\`\`

## 小结

- 错误边界捕获子组件**渲染、生命周期、构造函数**中的错误，防止整页崩溃。
- 错误边界**必须是 class 组件**，使用 \`getDerivedStateFromError\` 和 \`componentDidCatch\`。
- \`getDerivedStateFromError\` 返回新 state（用于显示 fallback）。
- \`componentDidCatch\` 用于错误上报（Sentry、日志服务等）。
- **不能捕获**事件处理（用 try/catch）、异步代码、SSR 错误。
- 大型应用应该**多层嵌套**：顶层兜底、局部隔离。
- Fallback UI 应提供 reset 按钮让用户重试。
- 实战推荐用 \`react-error-boundary\` 库而不是手写。
- 错误边界是"防御编程"的一部分：哪怕代码再稳，也要给关键区域加边界。
`
  },
];

export { chapters };
