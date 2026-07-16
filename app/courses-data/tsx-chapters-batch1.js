export const chapters = [
  {
    id: "tsx-props",
    group: "基础篇",
    icon: "📦",
    title: "Props 类型定义",
    content: `# Props 类型定义

在 React + TypeScript 中，给组件 Props 加类型是最常见也是最重要的事。这一章教你最常用的写法。

---

## 方式一：type 别名（推荐）

最常用、最简洁的方式：

\`\`\`tsx
// 定义 Props 类型
type GreetingProps = {
  name: string;
  age?: number;        // 可选属性（加 ?）
};

// 组件接收 props
function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h1>你好，{name}！</h1>
      {age && <p>年龄：{age}</p>}
    </div>
  );
}

// 使用
<Greeting name="张三" />
<Greeting name="李四" age={25} />
\`\`\`

---

## 方式二：interface 接口

interface 也很常用，支持继承（extends）：

\`\`\`tsx
interface UserCardProps {
  id: number;
  name: string;
  avatar?: string;
  role: "admin" | "user" | "guest";  // 联合类型，限定只能是这三个值
}

function UserCard({ id, name, avatar, role }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={avatar || "/default-avatar.png"} alt={name} />
      <h3>{name}</h3>
      <span className={\`role-\${role}\`}>{role}</span>
    </div>
  );
}

// role 只能传 "admin" | "user" | "guest"
<UserCard id={1} name="管理员" role="admin" />
\`\`\`

### type vs interface 怎么选？

| 场景 | 推荐 |
|------|------|
| 定义组件 Props | 都可以，团队统一即可 |
| 需要 extends 继承 | interface 更方便 |
| 需要联合类型 \| 或交叉类型 & | type |
| 定义对象/函数/数组/元组 | type |
| 类的 implements | interface |

**简单原则**：日常写 Props 用 \`type\` 就行，简洁直观。

---

## 默认值（defaultProps）

### 方式一：解构时给默认值（推荐）

\`\`\`tsx
type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  size?: "small" | "medium" | "large";
};

function Button({
  label,
  variant = "primary",   // 默认值
  disabled = false,
  size = "medium"
}: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// 不传 variant 就是 primary
<Button label="提交" />
<Button label="删除" variant="danger" size="large" />
\`\`\`

### 方式二：defaultProps（类组件用，函数组件不推荐）

现在函数组件直接用解构默认值即可，不用 defaultProps。

---

## 扩展原生 HTML 属性

如果你的组件是在原生元素基础上包装的（比如自定义 Button 包装 button），可以继承原生属性：

\`\`\`tsx
// 继承 button 原生所有属性（onClick, type, disabled, style 等）
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
};

function Button({ variant = "primary", loading, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}  // 把原生属性都透传下去
      className={\`btn btn-\${variant}\`}
      disabled={rest.disabled || loading}
    >
      {loading ? "加载中..." : children}
    </button>
  );
}

// 现在可以直接传 onClick, type, disabled, style 等原生属性了
<Button
  variant="primary"
  type="submit"
  onClick={() => console.log("clicked")}
  style={{ marginRight: 8 }}
>
  提交
</Button>
\`\`\`

常见的原生元素类型：
- \`React.InputHTMLAttributes<HTMLInputElement>\` — input
- \`React.ButtonHTMLAttributes<HTMLButtonElement>\` — button
- \`React.SelectHTMLAttributes<HTMLSelectElement>\` — select
- \`React.TextareaHTMLAttributes<HTMLTextAreaElement>\` — textarea
- \`React.AnchorHTMLAttributes<HTMLAnchorElement>\` — a 标签
- \`React.HTMLAttributes<HTMLDivElement>\` — div 等通用元素

---

## 子组件渲染函数（Render Props）

\`\`\`tsx
type DataListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

function DataList<T>({ data, renderItem }: DataListProps<T>) {
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用时 item 自动有类型推断
<DataList
  data={[
    { id: 1, name: "张三" },
    { id: 2, name: "李四" }
  ]}
  renderItem={(user) => <span>{user.name}</span>}  // user 自动推断为 {id, name}
/>
\`\`\`

---

## 常见 Props 类型速查

| 类型 | 写法 | 说明 |
|------|------|------|
| 字符串 | \`name: string\` | |
| 数字 | \`age: number\` | |
| 布尔 | \`disabled: boolean\` | |
| 数组 | \`list: string[]\` 或 \`list: Array<string>\` | |
| 对象 | \`user: { id: number; name: string }\` | |
| 可选 | \`age?: number\` | 加问号 |
| 联合 | \`size: "small" \\| "medium" \\| "large"\` | 限定几个值 |
| 函数 | \`onClick: () => void\` | 无参数无返回 |
| 带参函数 | \`onChange: (value: string) => void\` | 有参数 |
| 事件函数 | \`onClick: (e: React.MouseEvent) => void\` | 下一章详讲 |
| React 元素 | \`icon: React.ReactNode\` | 任何可渲染内容 |
| children | \`children: React.ReactNode\` | 下一章详讲 |

---

## 本章小结

✅ 组件 Props 用 \`type Props = { ... }\` 定义，函数参数后加类型标注
✅ 可选属性加 \`?\`，如 \`age?: number\`
✅ 解构时给默认值：\`({ size = "medium" }: Props)\`
✅ 包装原生组件时继承 \`React.XXXHTMLAttributes<HTMLXXXElement>\`
✅ 联合类型 \`"admin" | "user"\` 可以限定枚举值
✅ 泛型组件加 \`<T>\` 可以让 render props 自动推断类型

下一章讲 children 和组件组合！`,
    code: `import React from "react";

// ==============================
// 示例1：基础 Props
// ==============================
type UserCardProps = {
  name: string;
  age?: number;
  role: "admin" | "editor" | "user";
  avatar?: string;
};

function UserCard({ name, age, role, avatar }: UserCardProps) {
  const roleColors = {
    admin: "#ef4444",
    editor: "#f59e0b",
    user: "#3b82f6"
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      maxWidth: 350
    }}>
      <img
        src={avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + name}
        alt={name}
        style={{ width: 48, height: 48, borderRadius: "50%" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{name}</div>
        {age !== undefined && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>{age} 岁</div>
        )}
      </div>
      <span style={{
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        color: "white",
        background: roleColors[role]
      }}>
        {role}
      </span>
    </div>
  );
}

// ==============================
// 示例2：继承原生 button 属性
// ==============================
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

function Button({
  variant = "primary",
  loading = false,
  children,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const colors = {
    primary: "#3b82f6",
    secondary: "#6b7280",
    danger: "#ef4444"
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        border: "none",
        color: "white",
        fontSize: 14,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        background: colors[variant],
        ...style
      }}
    >
      {loading ? "⏳ 加载中..." : children}
    </button>
  );
}

// ==============================
// 示例3：泛型列表组件
// ==============================
type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyText?: string;
};

function List<T>({ items, renderItem, emptyText = "暂无数据" }: ListProps<T>) {
  if (items.length === 0) {
    return <div style={{ color: "#9ca3af", padding: 20, textAlign: "center" }}>{emptyText}</div>;
  }
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            padding: "10px 12px",
            borderBottom: index < items.length - 1 ? "1px solid #f3f4f6" : "none"
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// ==============================
// 导出演示组件
// ==============================
export default function PropsDemo() {
  const users = [
    { id: 1, name: "张三", role: "admin" as const, age: 28 },
    { id: 2, name: "李四", role: "editor" as const },
    { id: 3, name: "王五", role: "user" as const, age: 22 }
  ];

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>📦 Props 类型示例</h2>

      <h3 style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>1. UserCard 组件</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {users.map(u => (
          <UserCard key={u.id} name={u.name} age={u.age} role={u.role} />
        ))}
      </div>

      <h3 style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>2. Button 组件</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Button onClick={() => alert("主按钮")}>Primary</Button>
        <Button variant="secondary" onClick={() => alert("次按钮")}>Secondary</Button>
        <Button variant="danger" onClick={() => alert("危险按钮")}>Danger</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>

      <h3 style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>3. 泛型 List 组件</h3>
      <List
        items={users}
        renderItem={(user) => (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{user.name}</span>
            <span style={{ color: "#6b7280" }}>{user.role}</span>
          </div>
        )}
      />

      <div style={{ marginTop: 12 }}>
        <List items={[]} emptyText="🔍 没有搜索结果" />
      </div>
    </div>
  );
}
`,
  },

  {
    id: "tsx-children",
    group: "基础篇",
    icon: "👶",
    title: "Children 与组件组合",
    content: `# Children 与组件组合

children 是 React 组件中最常用的「特殊 Prop」，TypeScript 下有几种常见类型。

---

## children 的类型选择

### 1. React.ReactNode —— 最常用（推荐）

能接收任何可以渲染的内容：字符串、数字、JSX、数组、null、undefined、布尔值。

\`\`\`tsx
type CardProps = {
  title: string;
  children: React.ReactNode;  // 几乎所有情况都用这个
};

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// children 可以是任何可渲染内容
<Card title="用户信息">
  <p>姓名：张三</p>
  <p>年龄：25</p>
</Card>

<Card title="提示">
  操作成功！
</Card>
\`\`\`

### 2. React.ReactElement —— 只接收单个 JSX 元素

不接收字符串、数组等，必须是一个 React 元素：

\`\`\`tsx
type ModalProps = {
  trigger: React.ReactElement;  // 必须是一个元素（比如 button）
  children: React.ReactNode;
};

function Modal({ trigger, children }: ModalProps) {
  // ...
}
\`\`\`

### 3. 不接收 children

如果你的组件不需要 children，直接不写就行：

\`\`\`tsx
type AvatarProps = {
  src: string;
  size?: number;
};
// 没有 children 字段，使用时不能传子元素
function Avatar({ src, size = 48 }: AvatarProps) {
  return <img src={src} width={size} height={size} />;
}
\`\`\`

---

## 具名 children（Slots 模式）

除了默认的 \`children\`，还可以定义多个"插槽"（类似 Vue 的 slot）：

\`\`\`tsx
type LayoutProps = {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;  // 主内容区
  footer?: React.ReactNode;
};

function Layout({ header, sidebar, children, footer }: LayoutProps) {
  return (
    <div className="layout">
      <header>{header}</header>
      <div className="layout-body">
        <aside>{sidebar}</aside>
        <main>{children}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

// 使用
<Layout
  header={<h1>我的应用</h1>}
  sidebar={<nav>菜单...</nav>}
  footer={<p>© 2024</p>}
>
  <p>这里是主内容</p>
</Layout>
\`\`\`

---

## children 作为函数（Render Props）

children 也可以是一个函数，调用时传入参数：

\`\`\`tsx
type MouseTrackerProps = {
  children: (pos: { x: number; y: number }) => React.ReactNode;
};

function MouseTracker({ children }: MouseTrackerProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      style={{ height: 200, background: "#f0f0f0" }}
    >
      {children(pos)}
    </div>
  );
}

// 使用：children 是一个函数，接收 pos 参数
<MouseTracker>
  {({ x, y }) => (
    <div>鼠标位置：{x}, {y}</div>
  )}
</MouseTracker>
\`\`\`

---

## 渲染列表 + key 的类型安全

渲染列表时 TypeScript 能帮你捕获常见错误：

\`\`\`tsx
type Todo = {
  id: number;
  text: string;
  done: boolean;
};

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        // ✅ todo 自动有类型提示：todo.id, todo.text, todo.done
        <li key={todo.id}>
          <input type="checkbox" checked={todo.done} readOnly />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

---

## 条件渲染的类型安全

### 常见模式 1：与或渲染

\`\`\`tsx
type AlertProps = {
  message?: string;  // 可选
};

function Alert({ message }: AlertProps) {
  // ✅ message 为 undefined 时不渲染
  return message && <div className="alert">{message}</div>;
}
\`\`\`

### 常见模式 2：三元表达式

\`\`\`tsx
type UserGreetingProps = {
  user: { name: string } | null;
};

function UserGreeting({ user }: UserGreetingProps) {
  return (
    <div>
      {user ? (
        <span>欢迎回来，{user.name}</span>
      ) : (
        <button>请登录</button>
      )}
    </div>
  );
}
\`\`\`

### 常见模式 3：提前 return

\`\`\`tsx
function UserProfile({ user }: { user: User | null | undefined }) {
  // 提前处理 null/undefined 情况
  if (!user) {
    return <div>请先登录</div>;
  }

  // 后面 user 一定有值
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

---

## 本章小结

✅ \`children: React.ReactNode\` 是最常用的 children 类型
✅ 具名 children（Slots）：把多个区域作为 props 传入
✅ children 可以是函数（Render Props 模式）
✅ 列表渲染时 \`todos.map(todo => ...)\` 自动类型推断
✅ 条件渲染推荐用三元表达式或提前 return

下一章讲 useState、useRef 等 Hook 的类型！`,
    code: `import React, { useState } from "react";

// ==============================
// Card 组件 - children 基础用法
// ==============================
type CardProps = {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
};

function Card({ title, extra, children }: CardProps) {
  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 16
    }}>
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid #f3f4f6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 600,
        fontSize: 14,
        background: "#fafafa"
      }}>
        <span>{title}</span>
        {extra && <span>{extra}</span>}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

// ==============================
// Tabs 组件 - children 是函数模式
// ==============================
type TabsProps = {
  tabs: { key: string; label: string }[];
  children: (activeKey: string) => React.ReactNode;
};

function Tabs({ tabs, children }: TabsProps) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);

  return (
    <div>
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb" }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveKey(tab.key)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              borderBottom: activeKey === tab.key ? "2px solid #3b82f6" : "2px solid transparent",
              marginBottom: -2,
              color: activeKey === tab.key ? "#3b82f6" : "#6b7280",
              fontWeight: activeKey === tab.key ? 600 : 400
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "16px 0" }}>{children(activeKey)}</div>
    </div>
  );
}

// ==============================
// 演示
// ==============================
export default function ChildrenDemo() {
  const [todos] = useState([
    { id: 1, text: "学习 TypeScript", done: true },
    { id: 2, text: "写 React 组件", done: true },
    { id: 3, text: "做项目实战", done: false }
  ]);

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>👶 Children 与组件组合</h2>

      {/* Card 示例 */}
      <Card
        title="个人信息"
        extra={<button style={{ fontSize: 12, color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>编辑</button>}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src="https://api.dicebear.com/7.x/initials/svg?seed=React"
            alt="avatar"
            style={{ width: 48, height: 48, borderRadius: "50%" }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>React 开发者</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>react@example.com</div>
          </div>
        </div>
      </Card>

      <Card title="待办事项">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {todos.map(todo => (
            <li
              key={todo.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: todo.done ? "line-through" : "none",
                color: todo.done ? "#9ca3af" : "inherit"
              }}
            >
              <input type="checkbox" checked={todo.done} readOnly />
              {todo.text}
            </li>
          ))}
        </ul>
      </Card>

      {/* Tabs 示例：children 是函数 */}
      <Card title="Tabs 组件（Render Props）">
        <Tabs
          tabs={[
            { key: "overview", label: "概览" },
            { key: "settings", label: "设置" },
            { key: "billing", label: "账单" }
          ]}
        >
          {(activeKey) => (
            <div style={{ fontSize: 14 }}>
              {activeKey === "overview" && <p>📊 这里是概览页面内容</p>}
              {activeKey === "settings" && <p>⚙️ 这里是设置页面内容</p>}
              {activeKey === "billing" && <p>💳 这里是账单页面内容</p>}
            </div>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
`,
  },
];
