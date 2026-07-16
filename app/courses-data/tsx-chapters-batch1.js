// =============================================================
// TSX 教程 - 基础篇（5 章）
// -------------------------------------------------------------
// 覆盖：Props 类型 / Children / 事件处理 / useState / useRef
// 每章包含详细讲解 + 多个代码示例 + 可运行 demo
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：Props 类型定义全解
  // ===========================================================
  {
    id: "tsx-props",
    group: "基础篇",
    icon: "📦",
    title: "Props 类型定义全解",
    content: `# Props 类型定义全解

Props 是 React 组件的输入。TypeScript 让 Props 在编译期就得到校验——传错类型、漏传必填、多传字段都会报错。这一章覆盖日常开发 90% 的 Props 写法。

---

## 一、type 别名（推荐首选）

最简洁、最常用的方式。直接用 \`type\` 定义一个对象类型：

\`\`\`tsx
// 定义 Props 类型——约定组件能接收哪些属性
type ButtonProps = {
  label: string;        // 必填：字符串
  size?: "sm" | "md" | "lg";  // 可选 + 字面量联合（只能是这三个值）
  disabled?: boolean;   // 可选：布尔
  onClick?: () => void; // 可选：无参无返回值的函数
};

function Button({ label, size = "md", disabled, onClick }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={\`btn btn-\${size}\`}
    >
      {label}
    </button>
  );
}

// ✅ 正确用法
<Button label="保存" onClick={() => alert("已保存")} />
<Button label="提交" size="lg" disabled />

// ❌ 编译报错
<Button />                    // 缺少必填 label
<Button label="x" size="xl" /> // size 只能是 sm/md/lg
<Button label="x" onClick="not a function" /> // 类型不匹配
\`\`\`

**要点**：
- \`?\` 表示可选属性，不传时为 \`undefined\`
- 字面量联合 \`"sm" | "md" | "lg"\` 比纯 \`string\` 更安全，能防拼错
- 函数 prop 的类型要写清参数和返回值：\`(id: number) => void\`

---

## 二、interface 接口

\`interface\` 也能定义 Props，最大优势是支持 \`extends\` 继承和**声明合并**：

\`\`\`tsx
// 基础 Props
interface BaseInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

// 继承扩展——加上 disabled
interface DisabledInputProps extends BaseInputProps {
  disabled?: boolean;
}

function Input({ value, onChange, placeholder, disabled }: DisabledInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
\`\`\`

### type vs interface 怎么选？

| 场景 | 推荐 |
|------|------|
| 普通组件 Props | \`type\`（简洁） |
| 需要继承/扩展 | \`interface\`（extends 清晰） |
| 需要联合类型 (\`A | B\`) | \`type\`（interface 不支持联合） |
| 需要映射类型 (\`type X<T> = ...\`) | \`type\` |
| 第三方库扩展 | \`interface\`（声明合并） |

**实际项目建议**：团队统一一种即可，多数团队选 \`type\`。

---

## 三、继承原生 HTML 属性

组件包装原生标签时，希望能接收原生属性（className、style、onClick 等）。用 \`React.ComponentProps\` 提取：

\`\`\`tsx
// 方式一：ComponentProps<"button"> 提取 <button> 的所有属性
type FancyButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
};

function FancyButton({ variant = "primary", className, ...rest }: FancyButtonProps) {
  return (
    <button
      className={\`fancy-btn fancy-btn-\${variant} \${className ?? ""}\`}
      {...rest}  // 把其他原生属性透传给 <button>
    />
  );
}

// 可以传任意 <button> 原生属性
<FancyButton variant="primary" onClick={() => {}} type="submit" aria-label="保存" />
\`\`\`

\`\`\`tsx
// 方式二：ComponentPropsWithRef 保留 ref
type CardProps = React.ComponentPropsWithRef<"div"> & {
  title: string;
};
\`\`\`

**日常开发最常用**：\`React.ComponentProps<"标签名">\`，省去手写 className、style、onClick 等一堆属性。

---

## 四、索引签名（动态属性名）

当 Props 的 key 不确定时，用索引签名：

\`\`\`tsx
// 接收任意 data-* 属性
type IconProps = {
  name: string;
  [key: \`data-\${string}\`]: string;  // 只允许 data- 开头
};

function Icon({ name, ...dataAttrs }: IconProps) {
  return <span data-icon={name} {...dataAttrs} />;
}

<Icon name="home" data-testid="icon-home" data-size="large" />
\`\`\`

---

## 五、实战：用户卡片组件

综合运用 type + 联合 + 可选 + 继承：

\`\`\`tsx
type UserRole = "admin" | "editor" | "viewer";

type UserCardProps = {
  name: string;
  role: UserRole;
  avatar?: string;
  online?: boolean;
  onAction?: (role: UserRole) => void;
};

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  admin:  { label: "管理员", color: "#ef4444" },
  editor: { label: "编辑",   color: "#3b82f6" },
  viewer: { label: "访客",   color: "#6b7280" },
};

function UserCard({ name, role, avatar, online, onAction }: UserCardProps) {
  const cfg = roleConfig[role];
  return (
    <div className="user-card">
      <div className="avatar">
        {avatar ? <img src={avatar} alt={name} /> : <span>{name[0]}</span>}
        {online && <span className="dot" />}
      </div>
      <div>
        <div>{name}</div>
        <span style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      {onAction && <button onClick={() => onAction(role)}>操作</button>}
    </div>
  );
}
\`\`\`

**要点回顾**：
1. \`type\` 定义 Props 最常用
2. 字面量联合防止无效值
3. \`React.ComponentProps\` 继承原生属性
4. \`Record<K, V>\` 做配置映射，类型安全
5. 可选函数 prop 用 \`?:\` 标注`,

    code: `// Props 类型定义全解 - 可运行 Demo
import { useState } from "react";

// ---- 类型定义 ----
type UserRole = "admin" | "editor" | "viewer";

type UserCardProps = {
  name: string;
  role: UserRole;
  avatar?: string;
  online?: boolean;
  onAction?: (role: UserRole) => void;
};

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  admin:  { label: "管理员", color: "#ef4444" },
  editor: { label: "编辑",   color: "#3b82f6" },
  viewer: { label: "访客",   color: "#6b7280" },
};

// ---- 组件 ----
function UserCard({ name, role, avatar, online, onAction }: UserCardProps) {
  const cfg = roleConfig[role];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 8,
      border: "1px solid #e5e7eb", background: "#fff",
    }}>
      <div style={{ position: "relative", width: 40, height: 40 }}>
        {avatar ? (
          <img src={avatar} alt={name}
            style={{ width: 40, height: 40, borderRadius: "50%" }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#e0e7ff", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 600, color: "#4338ca",
          }}>
            {name[0]}
          </div>
        )}
        {online && (
          <span style={{
            position: "absolute", bottom: 0, right: 0,
            width: 10, height: 10, borderRadius: "50%",
            background: "#22c55e", border: "2px solid #fff",
          }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
        <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.label}</span>
      </div>
      {onAction && (
        <button
          onClick={() => onAction(role)}
          style={{
            padding: "4px 12px", fontSize: 12, borderRadius: 6,
            border: "1px solid #d1d5db", background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          操作
        </button>
      )}
    </div>
  );
}

// ---- 使用 ----
export default function Demo() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
      <UserCard name="张三" role="admin" online onAction={(r) => setLog(l => [...l, \`点击了 \${r}\`])} />
      <UserCard name="李四" role="editor" avatar="" onAction={(r) => setLog(l => [...l, \`点击了 \${r}\`])} />
      <UserCard name="王五" role="viewer" online />

      {log.length > 0 && (
        <div style={{ marginTop: 8, padding: 12, background: "#f3f4f6", borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>操作日志：</div>
          {log.map((line, i) => <div key={i} style={{ fontSize: 13 }}>{line}</div>)}
        </div>
      )}
    </div>
  );
}`,
  },

  // ===========================================================
  // 第 2 章：Children 与组件组合
  // ===========================================================
  {
    id: "tsx-children",
    group: "基础篇",
    icon: "👶",
    title: "Children 与组件组合",
    content: `# Children 与组件组合

\`children\` 是 React 最特殊的 Prop——它不需要显式传递，写在标签之间即可。TypeScript 下要正确标注它的类型。

---

## 一、React.ReactNode（推荐首选）

\`React.ReactNode\` 是最宽泛的可渲染类型，包含：string、number、JSX 元素、数组、null、undefined、boolean。

\`\`\`tsx
type CardProps = {
  title: string;
  children: React.ReactNode;  // 几乎所有场景都用这个
};

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// children 可以是任意可渲染内容
<Card title="用户信息">
  <p>姓名：张三</p>
  <p>年龄：25</p>
</Card>

<Card title="提示">操作成功！</Card>  {/* 纯字符串也行 */}

<Card title="列表">
  {users.map(u => <div key={u.id}>{u.name}</div>)}
</Card>  {/* 数组也行 */}
\`\`\`

**为什么不用 ReactNode 而用其他类型？** 当你想限制 children 的类型时（比如必须是单个元素、必须是函数等）。

---

## 二、React.ReactElement（单个 JSX 元素）

只接收**一个** React 元素，不接收字符串、数字、数组：

\`\`\`tsx
type TooltipProps = {
  content: string;
  children: React.ReactElement;  // 必须是单个 JSX 元素
};

function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="tooltip-wrapper">
      {children}
      <span className="tooltip-text">{content}</span>
    </span>
  );
}

// ✅ 正确
<Tooltip content="提示文字"><button>悬停我</button></Tooltip>

// ❌ 报错：字符串不是 ReactElement
<Tooltip content="提示">纯文字</Tooltip>

// ❌ 报错：多个元素需要包裹
<Tooltip content="提示"><span>a</span><span>b</span></Tooltip>
\`\`\`

---

## 三、函数 Children（Render Props）

当 children 是一个函数时，可以传参数给子组件：

\`\`\`tsx
type DataListProps<T> = {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;  // 函数签名
};

function DataList<T>({ items, children }: DataListProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{children(item, index)}</div>
      ))}
    </div>
  );
}

// 使用——children 是函数，接收 item 和 index
const users = [
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
];

<DataList items={users}>
  {(user, index) => (
    <div>
      #{index + 1} - {user.name}
    </div>
  )}
</DataList>
\`\`\`

**注意**：函数 children 的类型签名必须写清参数和返回值，否则调用方拿到的 item 是 \`any\`。

---

## 四、React.ReactNode vs React.ReactElement vs JSX.Element

| 类型 | 接收范围 | 何时用 |
|------|---------|--------|
| \`React.ReactNode\` | 字符串/数字/JSX/数组/null/undefined/布尔 | **99% 场景** |
| \`React.ReactElement\` | 单个 JSX 元素 | 限制必须传元素 |
| \`JSX.Element\` | 同 ReactElement（旧称） | 基本不用了 |

---

## 五、多个「插槽」

不只用 children，可以用具名 Props 做多个插槽：

\`\`\`tsx
type LayoutProps = {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;  // 主内容
};

function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <div className="layout">
      <header>{header}</header>
      <div className="layout-body">
        <aside>{sidebar}</aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

<Layout
  header={<h1>我的应用</h1>}
  sidebar={<nav>...菜单...</nav>}
>
  <p>主内容区域</p>
</Layout>
\`\`\`

---

## 六、可选 children

如果 children 不是必须的：

\`\`\`tsx
type BadgeProps = {
  count?: number;
  children?: React.ReactNode;  // 可选
};

function Badge({ count, children }: BadgeProps) {
  if (!count) return <>{children}</>;
  return (
    <span className="badge-wrapper">
      {children}
      <span className="badge-count">{count}</span>
    </span>
  );
}
\`\`\`

---

## 七、实战：可复用的 Section 组件

\`\`\`tsx
type SectionProps = {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;  // 右侧操作区插槽
};

function Section({ title, collapsible, children, action }: SectionProps) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <section className="section">
      <div className="section-header">
        <h3 onClick={() => collapsible && setOpen(!open)}>
          {collapsible && <span>{open ? "▼" : "▶"}</span>}
          {title}
        </h3>
        {action && <div className="section-action">{action}</div>}
      </div>
      {open && <div className="section-body">{children}</div>}
    </section>
  );
}
\`\`\`

**要点回顾**：
1. \`React.ReactNode\` 是 children 的默认选择
2. \`React.ReactElement\` 限制必须单个 JSX 元素
3. 函数 children 做 Render Props，类型签名要写清
4. 具名 Props 做多插槽布局`,

    code: `// Children 与组件组合 - 可运行 Demo
import { useState } from "react";

// ---- 类型定义 ----
type SectionProps = {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
};

// ---- Section 组件：支持折叠 + 操作插槽 ----
function Section({ title, collapsible, children, action }: SectionProps) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <section style={{
      border: "1px solid #e5e7eb", borderRadius: 8,
      overflow: "hidden", marginBottom: 12,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 16px",
        background: "#f9fafb", cursor: collapsible ? "pointer" : "default",
      }} onClick={() => collapsible && setOpen(!open)}>
        <h3 style={{ margin: 0, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
          {collapsible && <span style={{ fontSize: 12 }}>{open ? "▼" : "▶"}</span>}
          {title}
        </h3>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>
      {open && <div style={{ padding: 16 }}>{children}</div>}
    </section>
  );
}

// ---- DataList 组件：函数 children (Render Props) ----
type DataListProps<T> = {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
};

function DataList<T>({ items, children }: DataListProps<T>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, index) => (
        <div key={index} style={{
          padding: "8px 12px", background: "#f3f4f6", borderRadius: 6,
        }}>
          {children(item, index)}
        </div>
      ))}
    </div>
  );
}

// ---- 使用 ----
const users = [
  { id: 1, name: "张三", role: "管理员" },
  { id: 2, name: "李四", role: "编辑" },
  { id: 3, name: "王五", role: "访客" },
];

export default function Demo() {
  return (
    <div style={{ padding: 16, maxWidth: 500 }}>
      {/* 普通用法 */}
      <Section title="用户列表" action={
        <button style={{
          padding: "4px 10px", fontSize: 12, borderRadius: 4,
          border: "1px solid #d1d5db", background: "#fff", cursor: "pointer",
        }}>刷新</button>
      }>
        <DataList items={users}>
          {(user, index) => (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>#{index + 1} {user.name}</span>
              <span style={{ color: "#6b7280", fontSize: 12 }}>{user.role}</span>
            </div>
          )}
        </DataList>
      </Section>

      {/* 可折叠 */}
      <Section title="可折叠区域（点击标题切换）" collapsible>
        <p style={{ margin: 0, color: "#6b7280" }}>
          这个区域可以折叠/展开，点击上方标题即可。
        </p>
      </Section>

      {/* children 为纯字符串 */}
      <Section title="纯文字 children">
        这里直接放文字也可以，因为 children 类型是 ReactNode。
      </Section>
    </div>
  );
}`,
  },

  // ===========================================================
  // 第 3 章：事件处理类型
  // ===========================================================
  {
    id: "tsx-events",
    group: "基础篇",
    icon: "🎯",
    title: "事件处理类型",
    content: `# 事件处理类型

React 事件类型是 \`React.SyntheticEvent\` 的各种子类型。TypeScript 下，事件处理函数的参数必须标注正确类型，否则 \`e.target.value\` 等属性访问会报错。

---

## 一、常用事件类型速查表

| 事件场景 | 事件类型 | target 关键属性 |
|---------|---------|----------------|
| 点击按钮 | \`React.MouseEvent<HTMLButtonElement>\` | — |
| input 输入 | \`React.ChangeEvent<HTMLInputElement>\` | \`value\` |
| 表单提交 | \`React.FormEvent<HTMLFormElement>\` | — |
| 键盘按键 | \`React.KeyboardEvent<HTMLInputElement>\` | \`key\` |
| 拖拽 | \`React.DragEvent<HTMLDivElement>\` | \`dataTransfer\` |
| 滚轮 | \`React.WheelEvent<HTMLDivElement>\` | \`deltaY\` |

**记忆规律**：
- 大多数用 \`React.ChangeEvent<T>\`（表单值变化）
- 点击/提交用 \`React.MouseEvent<T>\` / \`React.FormEvent<T>\`
- \`T\` 是触发事件的 HTML 元素类型：\`HTMLInputElement\`、\`HTMLButtonElement\` 等

---

## 二、input / textarea / select

\`\`\`tsx
function Form() {
  const [text, setText] = useState("");

  // ChangeEvent<HTMLInputElement>：input 值变化事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);  // e.target.value 是 string
  };

  // textarea 用 HTMLTextAreaElement
  const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
  };

  // select 用 HTMLSelectElement
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
  };

  return (
    <>
      <input value={text} onChange={handleChange} />
      <textarea onChange={handleTextarea} />
      <select onChange={handleSelect}>
        <option value="a">A</option>
        <option value="b">B</option>
      </select>
    </>
  );
}
\`\`\`

**快捷写法**：如果不需要复用 handler，直接内联，TypeScript 会自动推断：

\`\`\`tsx
<input onChange={(e) => setText(e.target.value)} />
//                            ^? 自动推断为 string
\`\`\`

---

## 三、表单提交

\`\`\`tsx
function LoginForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // 阻止默认提交行为
    // 通过 FormData 获取所有字段值
    const formData = new FormData(e.currentTarget);
    console.log({
      username: formData.get("username"),
      password: formData.get("password"),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

**注意**：\`e.currentTarget\` 是表单元素本身（类型为 \`HTMLFormElement\`），\`e.target\` 在冒泡时可能不是表单。

---

## 四、键盘事件

\`\`\`tsx
function SearchInput() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("回车提交");
    }
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      console.log("Ctrl+K 快捷键");
    }
  };

  return <input onKeyDown={handleKeyDown} placeholder="按回车搜索" />;
}
\`\`\`

**常用按键**：\`e.key\`（推荐，如 "Enter"/"Escape"/"ArrowDown"）、\`e.ctrlKey\`、\`e.shiftKey\`、\`e.altKey\`。

---

## 五、鼠标事件

\`\`\`tsx
type Coords = { x: number; y: number };

function ClickArea() {
  const [pos, setPos] = useState<Coords | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // clientX/clientY：相对于视口的坐标
    // offsetX/offsetY：相对于事件目标的坐标
    setPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();  // 阻止默认右键菜单
    console.log("右键点击", e.clientX, e.clientY);
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ width: 300, height: 200, background: "#f3f4f6" }}
    >
      {pos && <span style={{ position: "absolute", left: pos.x, top: pos.y }}>📍</span>}
    </div>
  );
}
\`\`\`

---

## 六、拖拽事件

\`\`\`tsx
function DropZone() {
  const [files, setFiles] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // e.dataTransfer.files：拖入的文件列表
    const fileNames = Array.from(e.dataTransfer.files).map(f => f.name);
    setFiles(fileNames);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();  // 必须 preventDefault 才能 trigger drop
  };

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver}
      style={{ border: "2px dashed #d1d5db", padding: 24 }}
    >
      {files.length > 0 ? files.join(", ") : "拖放文件到此处"}
    </div>
  );
}
\`\`\`

---

## 七、事件类型工具：提取 handler 类型

不想手动写事件类型？用 \`React.ComponentProps\` 提取：

\`\`\`tsx
// 从 <input> 的 onChange 提取事件处理函数类型
type InputChangeHandler = React.ComponentProps<"input">["onChange"];
// 等价于 (e: React.ChangeEvent<HTMLInputElement>) => void

const handler: InputChangeHandler = (e) => {
  console.log(e.target.value);
};
\`\`\`

---

## 八、实战：带快捷键的搜索框

\`\`\`tsx
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch(query);
        if (e.key === "Escape") setQuery("");
      }}
      placeholder="输入搜索，回车确认，Esc 清除"
    />
  );
}
\`\`\`

**要点回顾**：
1. 事件类型格式：\`React.XxxEvent<HTMLElement>\`
2. 表单值变化用 \`ChangeEvent\`，提交用 \`FormEvent\`
3. 内联 handler 不用手写类型，自动推断
4. 需要复用 handler 时才显式标注类型`,

    code: `// 事件处理类型 - 可运行 Demo
import { useState } from "react";

// ---- 搜索框组件 ----
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && query.trim()) onSearch(query.trim());
          if (e.key === "Escape") setQuery("");
        }}
        placeholder="输入搜索，回车确认，Esc 清除"
        style={{
          flex: 1, padding: "8px 12px", borderRadius: 6,
          border: "1px solid #d1d5db", fontSize: 14, outline: "none",
        }}
      />
      <button
        onClick={() => query.trim() && onSearch(query.trim())}
        style={{
          padding: "8px 16px", borderRadius: 6, border: "none",
          background: "#3b82f6", color: "#fff", cursor: "pointer",
          fontSize: 14,
        }}
      >
        搜索
      </button>
    </div>
  );
}

// ---- 拖放区域组件 ----
function DropZone() {
  const [files, setFiles] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fileNames = Array.from(e.dataTransfer.files).map((f) => f.name);
    setFiles((prev) => [...prev, ...fileNames]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: "2px dashed #d1d5db", borderRadius: 8,
        padding: 24, textAlign: "center", color: "#6b7280",
        fontSize: 13, cursor: "pointer",
      }}
    >
      {files.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {files.map((f, i) => (
            <div key={i} style={{ color: "#374151" }}>📎 {f}</div>
          ))}
        </div>
      ) : (
        "拖放文件到此处（模拟）"
      )}
    </div>
  );
}

// ---- 使用 ----
export default function Demo() {
  const [results, setResults] = useState<string[]>([]);
  const allItems = ["React", "TypeScript", "Next.js", "Tailwind", "Node.js", "Python"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, maxWidth: 500 }}>
      <SearchBox onSearch={(q) => {
        const matched = allItems.filter((item) =>
          item.toLowerCase().includes(q.toLowerCase())
        );
        setResults(matched);
      }} />

      {results.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {results.map((r) => (
            <span key={r} style={{
              padding: "4px 12px", borderRadius: 16,
              background: "#dbeafe", color: "#1e40af", fontSize: 13,
            }}>
              {r}
            </span>
          ))}
        </div>
      )}

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>拖放测试：</div>
        <DropZone />
      </div>
    </div>
  );
}`,
  },

  // ===========================================================
  // 第 4 章：useState 类型安全
  // ===========================================================
  {
    id: "tsx-usestate",
    group: "基础篇",
    icon: "🔧",
    title: "useState 类型安全",
    content: `# useState 类型安全

\`useState\` 是最常用的 Hook。大多数情况 TypeScript 能自动推断类型，但某些场景需要手动指定泛型。

---

## 一、自动推断（大部分场景）

初始值是基本类型时，TypeScript 自动推断：

\`\`\`tsx
const [count, setCount] = useState(0);
//    count: number       setCount: (value: number | ((prev: number) => number)) => void

const [name, setName] = useState("张三");
//    name: string

const [isOpen, setIsOpen] = useState(false);
//    isOpen: boolean
\`\`\`

**不需要手动写泛型**——自动推断的类型已经足够精确。

---

## 二、需要手动指定泛型的场景

### 1. 初始值是 null / undefined

\`\`\`tsx
// ❌ 推断为 null，无法赋值其他类型
const [user, setUser] = useState(null);
//    user: null  ← 只能是 null，setUser("张三") 报错

// ✅ 用泛型指定联合类型
const [user, setUser] = useState<string | null>(null);
//    user: string | null

// ✅ 最常见：对象或 null
type User = { id: number; name: string };
const [currentUser, setCurrentUser] = useState<User | null>(null);

// 使用时需要判空
if (currentUser) {
  console.log(currentUser.name);  // OK，已收窄为 User
}
\`\`\`

### 2. 初始值是空数组

\`\`\`tsx
// ❌ 推断为 never[]，无法 push 任何东西
const [items, setItems] = useState([]);
//    items: never[]

// ✅ 指定元素类型
const [items, setItems] = useState<string[]>([]);
//    items: string[]

// ✅ 对象数组
type Todo = { id: number; text: string; done: boolean };
const [todos, setTodos] = useState<Todo[]>([]);
\`\`\`

### 3. 联合类型状态

\`\`\`tsx
// 状态机：idle | loading | success | error
type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");

// ✓ 只能赋这四个值
setStatus("loading");  // OK
setStatus("done");     // ❌ 报错
\`\`\`

---

## 三、对象状态更新

React 状态不可变，更新对象必须展开旧值：

\`\`\`tsx
type FormState = {
  username: string;
  email: string;
  age: number;
};

const [form, setForm] = useState<FormState>({
  username: "",
  email: "",
  age: 0,
});

// ✅ 展开旧值再覆盖
const updateField = (field: keyof FormState, value: string | number) => {
  setForm((prev) => ({ ...prev, [field]: value }));
};

// 函数式更新（推荐）——基于最新 state
setForm((prev) => ({ ...prev, username: "张三" }));

// 直接替换（不推荐，容易丢字段）
// setForm({ username: "张三" });  // ❌ 缺少 email 和 age
\`\`\`

**注意**：\`setForm({ ...prev, username: "x" })\` 中 \`prev\` 是 \`FormState\` 类型，TypeScript 会检查所有字段。

---

## 四、函数式更新（Lazy Update）

当新值依赖旧值时，**必须**用函数式更新：

\`\`\`tsx
const [count, setCount] = useState(0);

// ✅ 函数式——基于最新值
const increment = () => setCount((prev) => prev + 1);

// ❌ 直接更新——闭包陷阱，连续调用只 +1
const incrementBad = () => setCount(count + 1);
// 连续调用 3 次 incrementBad()，count 只 +1
\`\`\`

**函数参数的类型**：TypeScript 自动推断为当前 state 类型，不需要手动标注。

---

## 五、Lazy 初始化（性能优化）

初始值需要复杂计算时，用函数避免每次渲染都重新计算：

\`\`\`tsx
// ❌ 每次渲染都会执行 expensiveCalc()
const [data, setData] = useState(expensiveCalc());

// ✅ 只在首次渲染时执行
const [data, setData] = useState(() => expensiveCalc());

// 读取 localStorage 的场景
const [token, setToken] = useState<string | null>(() => {
  if (typeof window === "undefined") return null;  // SSR 安全
  return localStorage.getItem("token");
});
\`\`\`

**函数签名**：\`useState(() => T)\`，返回值类型 T 会被推断。

---

## 六、实战：Todo List

\`\`\`tsx
type Todo = {
  id: number;
  text: string;
  done: boolean;
};

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: input.trim(), done: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTodo()}
      />
      <button onClick={addTodo}>添加</button>
      {todos.map((todo) => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.done ? "line-through" : "" }}>
            {todo.text}
          </span>
          <button onClick={() => removeTodo(todo.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
\`\`\`

**要点回顾**：
1. 基本类型自动推断，无需泛型
2. null / 空数组 / 联合类型需要手动指定泛型
3. 对象更新用展开运算符 \`{ ...prev, field: value }\`
4. 依赖旧值时用函数式更新 \`setX(prev => ...)\`
5. 复杂初始值用 lazy init \`useState(() => calc())\``,

    code: `// useState 类型安全 - 可运行 Demo
import { useState } from "react";

// ---- 类型 ----
type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Status = "idle" | "loading" | "success" | "error";

// ---- TodoList 组件 ----
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: input.trim(), done: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 输入区 */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="输入待办事项..."
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 6,
            border: "1px solid #d1d5db", fontSize: 14, outline: "none",
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: "8px 16px", borderRadius: 6, border: "none",
            background: "#3b82f6", color: "#fff", cursor: "pointer",
          }}
        >
          添加
        </button>
      </div>

      {/* 过滤器 */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 10px", fontSize: 12, borderRadius: 4,
              border: filter === f ? "1px solid #3b82f6" : "1px solid #d1d5db",
              background: filter === f ? "#dbeafe" : "#fff",
              color: filter === f ? "#1e40af" : "#6b7280",
              cursor: "pointer",
            }}
          >
            {f === "all" ? "全部" : f === "active" ? "进行中" : "已完成"}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: 20 }}>
            暂无待办事项
          </div>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 12px", borderRadius: 6,
                background: todo.done ? "#f0fdf4" : "#f9fafb",
              }}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{
                flex: 1, fontSize: 14,
                textDecoration: todo.done ? "line-through" : "none",
                color: todo.done ? "#9ca3af" : "#374151",
              }}>
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                style={{
                  padding: "2px 8px", fontSize: 12, borderRadius: 4,
                  border: "none", background: "#ef4444", color: "#fff",
                  cursor: "pointer",
                }}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---- 状态机 Demo ----
function StatusDemo() {
  const [status, setStatus] = useState<Status>("idle");

  const simulate = async () => {
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("success");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const colors: Record<Status, string> = {
    idle: "#6b7280", loading: "#3b82f6", success: "#22c55e", error: "#ef4444",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{
        padding: "4px 12px", borderRadius: 16, fontSize: 12,
        background: colors[status] + "20", color: colors[status],
      }}>
        {status === "idle" ? "空闲" : status === "loading" ? "加载中..." : status === "success" ? "成功" : "错误"}
      </span>
      <button
        onClick={simulate}
        disabled={status === "loading"}
        style={{
          padding: "6px 12px", fontSize: 12, borderRadius: 4,
          border: "1px solid #d1d5db", background: "#fff",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? 0.5 : 1,
        }}
      >
        模拟请求
      </button>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ padding: 16, maxWidth: 500, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#374151" }}>Todo List</h3>
        <TodoList />
      </div>
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#374151" }}>状态机（联合类型）</h3>
        <StatusDemo />
      </div>
    </div>
  );
}`,
  },

  // ===========================================================
  // 第 5 章：useRef 类型
  // ===========================================================
  {
    id: "tsx-useref",
    group: "基础篇",
    icon: "📌",
    title: "useRef 三种用法",
    content: `# useRef 三种用法

\`useRef\` 有三种典型用法，每种类型的标注方式不同。掌握后能覆盖 95% 的 ref 使用场景。

---

## 一、用法 1：引用 DOM 元素

最常见用法——获取 DOM 元素，命令式操作（focus、scroll、measure 等）。

\`\`\`tsx
// 泛型指定为 HTMLInputElement
const inputRef = useRef<HTMLInputElement>(null);
//    inputRef.current: HTMLInputElement | null

function focusInput() {
  inputRef.current?.focus();  // ?. 因为可能为 null
  inputRef.current?.select(); // 全选文字
}

return <input ref={inputRef} type="text" />;
\`\`\`

### 常见 DOM 元素类型

| JSX 标签 | ref 类型 |
|---------|---------|
| \`<input>\` | \`HTMLInputElement\` |
| \`<textarea>\` | \`HTMLTextAreaElement\` |
| \`<select>\` | \`HTMLSelectElement\` |
| \`<div>\` | \`HTMLDivElement\` |
| \`<button>\` | \`HTMLButtonElement\` |
| \`<canvas>\` | \`HTMLCanvasElement\` |
| \`<video>\` | \`HTMLVideoElement\` |

**规律**：\`HTML + 标签名首字母大写 + Element\`。

### 传 ref 给子组件

需要配合 \`forwardRef\`（见第 9 章），这里先看基本用法：

\`\`\`tsx
const Modal = forwardRef<HTMLDivElement>((props, ref) => {
  return <div ref={ref} className="modal">{props.children}</div>;
});

const modalRef = useRef<HTMLDivElement>(null);
<Modal ref={modalRef} />
\`\`\`

---

## 二、用法 2：可变值容器（不触发重渲染）

\`useRef\` 的 current 可以存任意值，**修改不会触发重渲染**。适合存：
- 定时器 ID
- 上一次的值
- 「是否已初始化」标志

\`\`\`tsx
// 存定时器 ID
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//    ReturnType<typeof setInterval> 是 NodeJS.Timeout 或 number

const startTimer = () => {
  timerRef.current = setInterval(() => {
    console.log("tick");
  }, 1000);
};

const stopTimer = () => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
};

// 组件卸载时清理
useEffect(() => {
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, []);
\`\`\`

\`\`\`tsx
// 存上一次的值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;  // 返回的是更新前的值
}

const [count, setCount] = useState(0);
const prevCount = usePrevious(count);
// count: 5, prevCount: 4
\`\`\`

\`\`\`tsx
// 防止重复初始化
const initializedRef = useRef(false);

useEffect(() => {
  if (initializedRef.current) return;  // 已初始化则跳过
  initializedRef.current = true;
  // 初始化逻辑...
}, []);
\`\`\`

### useRef vs useState：什么时候用哪个？

| 特性 | useRef | useState |
|------|--------|---------|
| 修改触发重渲染？ | ❌ 不触发 | ✅ 触发 |
| 读取最新值 | \`ref.current\`（总是最新） | state 变量（渲染快照） |
| 适用场景 | DOM 引用、定时器、缓存 | 需要展示在 UI 上的数据 |

**原则**：如果值变化需要反映到 UI 上，用 \`useState\`；否则用 \`useRef\`。

---

## 三、用法 3：无初始值（undefined）

不给初始值时，\`current\` 初始为 \`undefined\`：

\`\`\`tsx
// 不传初始值
const ref = useRef<number>();
//    ref.current: number | undefined

// 之后再赋值
useEffect(() => {
  ref.current = 42;
}, []);
\`\`\`

**与 \`useRef<T>(null)\` 的区别**：
- \`useRef<number>(null)\` → current 类型是 \`number | null\`
- \`useRef<number>()\` → current 类型是 \`number | undefined\`

一般用 \`null\` 更统一。

---

## 四、实战：自动聚焦 + 输入计数

\`\`\`tsx
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCountRef = useRef(0);

  // 每次渲染 +1（不触发重渲染）
  renderCountRef.current++;

  useEffect(() => {
    // 挂载后自动聚焦
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <input ref={inputRef} placeholder="自动聚焦" />
      <p>本组件已渲染 {renderCountRef.current} 次</p>
    </div>
  );
}
\`\`\`

---

## 五、实战：防抖搜索

\`\`\`tsx
function DebouncedSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // 清除上一次的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器——500ms 后触发搜索
    timerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 500);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return <input value={value} onChange={handleChange} placeholder="防抖搜索" />;
}
\`\`\`

---

## 六、ref 回调函数

除了传 ref 对象，还可以传函数（挂载时调用，卸载时传 null）：

\`\`\`tsx
// 函数 ref——元素挂载时调用，卸载时传 null
const setElement = (el: HTMLDivElement | null) => {
  if (el) {
    // 可以在这里测量尺寸、添加事件监听等
    console.log("元素宽度:", el.clientWidth);
  }
};

return <div ref={setElement}>内容</div>;
\`\`\`

**回调 ref 的泛型**：\`(el: HTMLElementType | null) => void\`。

---

**要点回顾**：
1. DOM 引用：\`useRef<HTMLXxxElement>(null)\`，用 \`?.\` 访问
2. 可变值容器：\`useRef<T>(initialValue)\`，修改不触发重渲染
3. 无初始值：\`useRef<T>()\`，current 为 \`T | undefined\`
4. 定时器类型用 \`ReturnType<typeof setTimeout>\`
5. 需要 UI 更新用 \`useState\`，仅存值用 \`useRef\``,

    code: `// useRef 三种用法 - 可运行 Demo
import { useState, useEffect, useRef } from "react";

// ---- 自动聚焦输入框 ----
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCountRef = useRef(0);

  renderCountRef.current++;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        ref={inputRef}
        placeholder="页面加载后自动聚焦"
        style={{
          padding: "8px 12px", borderRadius: 6,
          border: "1px solid #d1d5db", fontSize: 14, outline: "none",
        }}
      />
      <span style={{ fontSize: 12, color: "#6b7280" }}>
        本组件已渲染 {renderCountRef.current} 次（ref 不触发重渲染）
      </span>
    </div>
  );
}

// ---- 防抖搜索 ----
function DebouncedSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <input
      value={value}
      onChange={handleChange}
      placeholder="输入后 500ms 触发搜索"
      style={{
        width: "100%", padding: "8px 12px", borderRadius: 6,
        border: "1px solid #d1d5db", fontSize: 14, outline: "none",
      }}
    />
  );
}

// ---- 计时器 Demo ----
function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return \`\${m.toString().padStart(2, "0")}:\${sec.toString().padStart(2, "0")}\`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 32, fontFamily: "monospace", fontWeight: 700, color: "#3b82f6" }}>
        {formatTime(seconds)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={start}
          disabled={running}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "none",
            background: running ? "#d1d5db" : "#22c55e", color: "#fff",
            cursor: running ? "not-allowed" : "pointer", fontSize: 13,
          }}
        >
          开始
        </button>
        <button
          onClick={stop}
          disabled={!running}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "none",
            background: !running ? "#d1d5db" : "#f59e0b", color: "#fff",
            cursor: !running ? "not-allowed" : "pointer", fontSize: 13,
          }}
        >
          停止
        </button>
        <button
          onClick={reset}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "1px solid #d1d5db",
            background: "#fff", cursor: "pointer", fontSize: 13,
          }}
        >
          重置
        </button>
      </div>
    </div>
  );
}

export default function Demo() {
  const [searchResult, setSearchResult] = useState("");

  return (
    <div style={{ padding: 16, maxWidth: 500, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#374151" }}>1. DOM 引用 + 渲染计数</h3>
        <AutoFocusInput />
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#374151" }}>2. 防抖搜索（ref 存定时器）</h3>
        <DebouncedSearch onSearch={(q) => setSearchResult(\`搜索: "\${q}"\`)} />
        {searchResult && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>{searchResult}</div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#374151" }}>3. 计时器（ref 存 interval ID）</h3>
        <Stopwatch />
      </div>
    </div>
  );
}`,
  },
];
