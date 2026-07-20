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
// 本 demo 用纯 TypeScript 演示 Props 类型系统的核心概念
// React 组件示例见上方 Markdown 讲解，可直接复制到项目中使用

// ============================================================
// 1. type 别名 + 字面量联合（最常用的 Props 定义方式）
// ============================================================
type UserRole = "admin" | "editor" | "viewer";

type UserCardProps = {
  name: string;              // 必填
  role: UserRole;            // 必填，只能是三个值之一
  avatar?: string;           // 可选
  online?: boolean;          // 可选
  onAction?: (role: UserRole) => void;  // 可选回调
};

// ============================================================
// 2. Record 做配置映射——类型安全的查表
// ============================================================
// Record<UserRole, {...}> 保证每个 role 都有对应配置，漏写会报错
const roleConfig: Record<UserRole, {
  label: string;
  color: string;
  permissions: string[];
}> = {
  admin:  { label: "管理员", color: "#ef4444", permissions: ["read", "write", "delete", "manage"] },
  editor: { label: "编辑",   color: "#3b82f6", permissions: ["read", "write"] },
  viewer: { label: "访客",   color: "#6b7280", permissions: ["read"] },
};

// ============================================================
// 3. 模拟 React.ComponentProps 继承原生属性
// ============================================================
// React.ComponentProps<"button"> 会提取 <button> 的所有原生属性
// 这里用 NativeButtonProps 模拟，FancyButtonProps 通过 & 扩展
type NativeButtonProps = {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

// 交叉类型 & —— 等价于 React.ComponentProps<"button"> & { variant?: ... }
type FancyButtonProps = NativeButtonProps & {
  variant?: "primary" | "ghost";
};

// ============================================================
// 4. 模拟组件渲染（纯逻辑，不依赖 React/DOM）
// ============================================================
// TypeScript 类型在运行时会被擦除（类型擦除），
// 所以运行时无法直接检查 props 类型。
// 但我们可以写校验函数模拟 "传错 Props 会怎样"
function renderUserCard(props: UserCardProps): string {
  const cfg = roleConfig[props.role];
  const avatarDisplay = props.avatar
    ? \`[img \${props.avatar.slice(0, 20)}...]\`
    : \`[\${props.name[0].toUpperCase()}]\`;
  const onlineMark = props.online ? " 🟢在线" : " ⚪离线";
  const hasCallback = props.onAction ? "✅ 可操作" : "⛔ 无回调";

  return [
    "┌──────────────────────────────────┐",
    \`│ \${avatarDisplay}  \${props.name}\${onlineMark}\`,
    \`│ 角色: \${cfg.label} (颜色: \${cfg.color})\`,
    \`│ 权限: \${cfg.permissions.join(", ")}\`,
    \`│ 回调: \${hasCallback}\`,
    "└──────────────────────────────────┘",
  ].join("\\n");
}

function renderFancyButton(props: FancyButtonProps): string {
  const variant = props.variant ?? "primary";
  const type = props.type ?? "button";
  const disabled = props.disabled ? " [已禁用]" : "";
  return \`[FancyButton] variant=\${variant} type=\${type}\${disabled}\`;
}

// ============================================================
// 5. 运行演示
// ============================================================
console.log("=== Props 类型定义全解 Demo ===\\n");

// --- 5.1 正确用法 ---
console.log("--- ✅ 正确用法 ---\\n");

// 完整 Props
console.log(renderUserCard({
  name: "张三",
  role: "admin",
  online: true,
  onAction: (r) => console.log(\`  → 回调被调用，角色: \${r}\`),
}));
console.log();

// 可选 Props 省略
console.log(renderUserCard({ name: "李四", role: "editor", avatar: "https://example.com/a.jpg" }));
console.log();

// 最少 Props（只传必填）
console.log(renderUserCard({ name: "王五", role: "viewer" }));
console.log();

// --- 5.2 ComponentProps 继承演示 ---
console.log("--- 🔄 ComponentProps 继承原生属性 ---\\n");

console.log(renderFancyButton({
  variant: "primary",
  type: "submit",
  onClick: () => {},
  className: "btn-save",
}));
console.log();

// 只传扩展属性，原生属性全部走默认值
console.log(renderFancyButton({ variant: "ghost", disabled: true }));
console.log();

// --- 5.3 Record 查表演示 ---
console.log("--- 📋 各角色权限一览 ---\\n");
(Object.keys(roleConfig) as UserRole[]).forEach((role) => {
  const cfg = roleConfig[role];
  console.log(\`  \${role.padEnd(8)} \${cfg.label.padEnd(4)} → \${cfg.permissions.join(", ")}\`);
});
console.log();

// --- 5.4 类型安全演示 ---
// TypeScript 编译期会拦截以下错误，这里用 as 模拟绕过编译检查
// 在实际 React 项目中，这些错误会在 IDE 里直接标红
console.log("--- 🛡️ TypeScript 编译期保护（正常会被拦截）---\\n");

// 模拟 1: 传了无效的 role 值
const badProps1 = { name: "测试", role: "superadmin" } as unknown as UserCardProps;
try {
  console.log("尝试用 role='superadmin' 渲染...");
  console.log(renderUserCard(badProps1));
} catch (e) {
  console.log(\`❌ 运行时报错: \${(e as Error).message}\`);
  console.log("💡 TypeScript 会在编译期就拦截这个错误：\\n   Type '\\"superadmin\\"' is not assignable to type 'UserRole'.");
}
console.log();

// 模拟 2: 缺少必填 name
const badProps2 = { role: "admin" } as unknown as UserCardProps;
try {
  console.log("尝试省略必填 name...");
  console.log(renderUserCard(badProps2));
} catch (e) {
  console.log(\`❌ 运行时报错: \${(e as Error).message}\`);
  console.log("💡 TypeScript 会报错：\\n   Property 'name' is missing in type '{ role: \\"admin\\"; }'.");
}
console.log();

console.log("=== Demo 结束 ===");
console.log("\\n💡 以上类型定义可直接复制到 React 组件中使用，");
console.log("   只需把 renderUserCard 替换成 JSX return 即可。")`,
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
// 💡 提示：children 是 React 最特殊的 Prop——它不需要显式传递，写在标签之间即可
//   本 Demo 演示 ReactNode / ReactElement / Render Props / 多插槽 等核心概念
import { useState } from "react";

// === 1. 类型定义：Section 组件的 Props ===
// 💡 提示：React.ReactNode 是 children 的默认推荐类型，覆盖 99% 场景
//   - 包含：string | number | ReactElement | ReactNode[] | null | undefined | boolean
//   - 等价于"任何能被 React 渲染的东西"
type SectionProps = {
  title: string;
  collapsible?: boolean;
  children: React.ReactNode;  // 主内容插槽：最宽泛的可渲染类型
  action?: React.ReactNode;   // 具名插槽：右侧操作区，也是 ReactNode
};

// === 2. Section 组件：支持折叠 + 操作插槽（多插槽模式）===
function Section({ title, collapsible, children, action }: SectionProps) {
  // 💡 提示：useState(!collapsible) —— 初始展开状态由 collapsible 反向决定
  //   - collapsible 为 true（可折叠）→ 初始 open=false（默认折叠）
  //   - collapsible 为 undefined/false → 初始 open=true（始终展开）
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
        {/* 具名插槽 action：通过 && 短路渲染，未传时不渲染 */}
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>
      {/* children 渲染：open 为 true 时才渲染主内容 */}
      {open && <div style={{ padding: 16 }}>{children}</div>}
    </section>
  );
}

// === 3. DataList 组件：函数 children（Render Props 模式）===
// 💡 提示：Render Props 模式
//   - 把 children 声明为「函数」而非普通 ReactNode
//   - 组件内部调用该函数，并把数据（item, index）作为参数传给子组件
//   - 调用方在 JSX 中写 { (item, index) => <...> } 实现按需渲染
//   - 优势：父组件可以把"渲染逻辑"下放给子组件，子组件负责"数据获取"
type DataListProps<T> = {
  items: T[];
  // children 是一个函数：接收 item 和 index，返回 ReactNode
  // 💡 提示：函数签名必须写清参数和返回值，否则调用方拿到的 item 会是 any
  children: (item: T, index: number) => React.ReactNode;
};

function DataList<T>({ items, children }: DataListProps<T>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* 遍历 items，对每一项调用 children 函数——这就是 Render Props 的核心 */}
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

// === 4. 数据源 ===
const users = [
  { id: 1, name: "张三", role: "管理员" },
  { id: 2, name: "李四", role: "编辑" },
  { id: 3, name: "王五", role: "访客" },
];

// === 5. 主 Demo 组件（组合多个 Section + DataList）===
export default function Demo() {
  return (
    <div style={{ padding: 16, maxWidth: 500 }}>
      {/* 5.1 普通用法：children 是 JSX 元素 + 具名插槽 action */}
      <Section title="用户列表" action={
        <button style={{
          padding: "4px 10px", fontSize: 12, borderRadius: 4,
          border: "1px solid #d1d5db", background: "#fff", cursor: "pointer",
        }}>刷新</button>
      }>
        {/* Render Props：children 是函数，参数由 DataList 内部传入 */}
        <DataList items={users}>
          {(user, index) => (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>#{index + 1} {user.name}</span>
              <span style={{ color: "#6b7280", fontSize: 12 }}>{user.role}</span>
            </div>
          )}
        </DataList>
      </Section>

      {/* 5.2 可折叠：collapsible=true，点击标题切换 open 状态 */}
      <Section title="可折叠区域（点击标题切换）" collapsible>
        <p style={{ margin: 0, color: "#6b7280" }}>
          这个区域可以折叠/展开，点击上方标题即可。
        </p>
      </Section>

      {/* 5.3 children 为纯字符串：ReactNode 兼容 string */}
      <Section title="纯文字 children">
        这里直接放文字也可以，因为 children 类型是 ReactNode。
      </Section>
    </div>
  );
}

// === 6. 运行时演示：children 类型与结构 ===
// 💡 提示：下面的代码在模块加载时立即执行，演示 children 的各种类型与 React.Children.map 行为
console.log("========== Children 与组件组合 Demo 开始 ==========");

// --- 6.1 ReactNode 的各种可能类型 ---
// 💡 提示：ReactNode 是最宽泛的可渲染类型，包含以下所有类型
console.log("\\n--- 6.1 ReactNode 的各种可能类型 ---");
// 模拟一个 React 元素（真实环境中是 React.createElement 的返回值）
function mockElement(type: string, props: Record<string, unknown> = {}): React.ReactElement {
  return { type, props, key: null } as unknown as React.ReactElement;
}

const childSamples: { label: string; value: React.ReactNode }[] = [
  { label: "string",         value: "Hello" },
  { label: "number",         value: 42 },
  { label: "ReactElement",   value: mockElement("div", { children: "div 内容" }) },
  { label: "array",          value: ["a", "b", "c"] },
  { label: "null",           value: null },
  { label: "undefined",      value: undefined },
  { label: "boolean(true)",  value: true },
  { label: "boolean(false)", value: false },
];
childSamples.forEach((s) => {
  // 💡 提示：null / undefined / boolean 在 React 渲染时不会产生 DOM 节点
  //   - string / number → 文本节点
  //   - ReactElement → 对应 DOM 元素
  //   - array → 多个节点（会被展开）
  const valStr = s.value === undefined ? "undefined" : JSON.stringify(s.value);
  console.log("  " + s.label.padEnd(18) + "| typeof=" + typeof s.value + " | value=" + valStr);
});

// --- 6.2 ReactNode vs ReactElement 区别 ---
console.log("\\n--- 6.2 ReactNode vs ReactElement 区别 ---");
// 💡 提示：ReactElement 是 ReactNode 的子集
//   - ReactElement：仅指 React.createElement() 返回的对象（即 JSX 元素）
//     结构为 { type, props, key, ... }，是 JSX 编译后的普通 JS 对象
//   - ReactNode：ReactElement + string + number + array + null + undefined + boolean
//   - 选择建议：99% 场景用 ReactNode；需要限制"必须单个 JSX 元素"时用 ReactElement
//   - JSX.Element 是 ReactElement 的旧称，现在基本不用了
console.log("  ReactElement ⊂ ReactNode");
console.log("  ReactNode  = ReactElement | string | number | ReactNode[] | null | undefined | boolean");
console.log("  ReactElement = { type, props, key }  // JSX 编译后的对象");
// 演示 ReactElement 的结构
const sampleElement = mockElement("button", { onClick: "() => {}", children: "点击" });
console.log("  示例 ReactElement 结构: " + JSON.stringify(sampleElement));

// --- 6.3 模拟 React.Children.map 的行为 ---
console.log("\\n--- 6.3 React.Children.map 行为模拟 ---");
// 💡 提示：React.Children.map 是处理 children 的安全工具
//   - 自动展开嵌套数组（flatten）——普通 .map 做不到
//   - 跳过 null / undefined / boolean（不调用回调）
//   - 对 string / number / element 逐个调用回调
//   - 返回值也会被自动 flatten
function childrenMap(
  children: React.ReactNode,
  fn: (child: React.ReactNode, index: number) => React.ReactNode
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let index = 0;
  const visit = (child: React.ReactNode) => {
    if (child == null || typeof child === "boolean") {
      // null / undefined / boolean → 跳过，不调用 fn
      return;
    }
    if (Array.isArray(child)) {
      // 数组 → 递归展开（这是 React.Children.map 的关键特性）
      child.forEach(visit);
      return;
    }
    // string / number / element → 调用 fn
    result.push(fn(child, index++));
  };
  visit(children);
  return result;
}

// 测试 1: 混合类型 children（含嵌套数组）
console.log("  [测试 1] 混合类型 children:");
const mixedChildren: React.ReactNode = ["文本", 42, null, mockElement("span"), undefined, true, ["嵌套", "数组"]];
const mapped1 = childrenMap(mixedChildren, (child, i) => {
  const desc = typeof child === "object" ? "element" : String(child);
  console.log("    fn(" + i + "): " + desc);
  return child;
});
console.log("    结果数量: " + mapped1.length + "（null/undefined/boolean 被跳过）");

// 测试 2: 单个元素 children
console.log("  [测试 2] 单个元素 children:");
const singleChild = mockElement("div");
const mapped2 = childrenMap(singleChild, (child, i) => {
  const desc = typeof child === "object" ? "element" : String(child);
  console.log("    fn(" + i + "): " + desc);
  return child;
});
console.log("    结果数量: " + mapped2.length);

// 测试 3: 空值 children
console.log("  [测试 3] null children:");
const mapped3 = childrenMap(null, (child, i) => {
  console.log("    fn(" + i + "): 不应执行");
  return child;
});
console.log("    结果数量: " + mapped3.length + "（null 时回调不执行）");

// --- 6.4 组件组合效果演示 ---
console.log("\\n--- 6.4 组件组合效果演示 ---");
// 💡 提示：通过 children 嵌套，可以把多个组件组合成复杂的 UI
//   - Section 包裹 DataList，DataList 包裹每条记录
//   - 这种"俄罗斯套娃"式的组合是 React 的核心思想（composition）
function describeSection(title: string, childrenContent: string): string {
  return "[Section: " + title + "] 包含 -> " + childrenContent;
}
function describeDataList(items: string[]): string {
  return items.map((item, i) => "[#" + (i + 1) + " " + item + "]").join(" ");
}
const composition = describeSection("用户列表", describeDataList(["张三", "李四", "王五"]));
console.log("  组合效果: " + composition);
console.log("  解读: Section(外层容器) 嵌套 DataList(列表渲染) 嵌套 单项 UI");

// --- 6.5 Render Props vs 普通 children 对比 ---
console.log("\\n--- 6.5 Render Props vs 普通 children ---");
// 💡 提示：Render Props 让组件"反向"把数据传给父组件
//   - 普通 children：父 → 子 单向传值（静态内容）
//   - Render Props：子 → 父 把数据传出去（通过调用函数），父组件决定如何渲染
console.log("  普通 children: <Card>{<p>静态内容</p>}</Card>      父 -> 子");
console.log("  Render Props:  <List>{(item) => <p>{item}</p>}</List>  子 -> 父(传 item)");

console.log("\\n========== Children 与组件组合 Demo 结束 ==========");`,
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

// === 1. 模拟事件对象辅助函数（沙箱无真实 DOM，用纯对象演示事件处理逻辑） ===
// 💡 提示：浏览器中 React 会把原生 DOM 事件包装成 SyntheticEvent；
// 这里用普通对象"模拟"事件结构，让我们能直接调用 handler 观察效果。

// 模拟 ChangeEvent<HTMLInputElement>：input/textarea/select 值变化时触发
// target 类型是 HTMLInputElement，关键属性 target.value 是 string
function mockChangeEvent(value: string): React.ChangeEvent<HTMLInputElement> {
  return {
    type: "change",
    target: { value } as HTMLInputElement,
    currentTarget: { value } as HTMLInputElement,
    preventDefault() { console.log("  [mock] preventDefault() 被调用"); },
    stopPropagation() {},
    nativeEvent: {} as Event,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    bubbles: false,
    cancelable: false,
    timeStamp: Date.now(),
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

// 模拟 KeyboardEvent<HTMLInputElement>：按键按下/抬起时触发
// 关键属性：key（按键名）、ctrlKey/shiftKey/altKey（修饰键状态）
function mockKeyboardEvent(
  key: string,
  mods: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}
): React.KeyboardEvent<HTMLInputElement> {
  return {
    type: "keydown",
    key,
    keyCode: 0,
    ctrlKey: !!mods.ctrlKey,
    shiftKey: !!mods.shiftKey,
    altKey: !!mods.altKey,
    target: {} as HTMLInputElement,
    currentTarget: {} as HTMLInputElement,
    preventDefault() { console.log("  [mock] preventDefault() 被调用 —— 阻止默认行为"); },
    stopPropagation() {},
    nativeEvent: {} as Event,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    bubbles: false,
    cancelable: true,
    timeStamp: Date.now(),
  } as unknown as React.KeyboardEvent<HTMLInputElement>;
}

// 模拟 MouseEvent<HTMLDivElement>：点击/右键/移动时触发
// 关键属性：clientX/clientY（视口坐标）、nativeEvent.offsetX/offsetY（相对目标坐标）
function mockMouseEvent(clientX: number, clientY: number): React.MouseEvent<HTMLDivElement> {
  return {
    type: "click",
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    nativeEvent: { offsetX: clientX, offsetY: clientY } as MouseEvent,
    target: {} as HTMLDivElement,
    currentTarget: {} as HTMLDivElement,
    preventDefault() { console.log("  [mock] preventDefault() 被调用 —— 阻止默认行为（如右键菜单）"); },
    stopPropagation() {},
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    bubbles: true,
    cancelable: true,
    timeStamp: Date.now(),
  } as unknown as React.MouseEvent<HTMLDivElement>;
}

// 模拟 FormEvent<HTMLFormElement>：表单 submit 时触发
// 关键：currentTarget 指向表单本身；preventDefault() 阻止页面刷新
function mockFormEvent(): React.FormEvent<HTMLFormElement> {
  return {
    type: "submit",
    target: {} as HTMLFormElement,
    currentTarget: {} as HTMLFormElement,
    preventDefault() { console.log("  [mock] preventDefault() 被调用 —— 阻止表单默认提交刷新页面"); },
    stopPropagation() {},
    nativeEvent: {} as Event,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    bubbles: true,
    cancelable: true,
    timeStamp: Date.now(),
  } as unknown as React.FormEvent<HTMLFormElement>;
}

// 模拟 DragEvent<HTMLDivElement>：拖拽放下时触发
// 关键：dataTransfer.files 是拖入的文件列表（类 FileList）
function mockDragEvent(fileNames: string[]): React.DragEvent<HTMLDivElement> {
  const files = fileNames.map((name) => ({ name, size: 1024 })) as File[];
  return {
    type: "drop",
    dataTransfer: { files } as unknown as DataTransfer,
    target: {} as HTMLDivElement,
    currentTarget: {} as HTMLDivElement,
    preventDefault() { console.log("  [mock] preventDefault() 被调用 —— 允许 drop 事件触发"); },
    stopPropagation() {},
    nativeEvent: {} as Event,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    bubbles: true,
    cancelable: true,
    timeStamp: Date.now(),
  } as unknown as React.DragEvent<HTMLDivElement>;
}

// === 2. 搜索框组件（演示 ChangeEvent + KeyboardEvent） ===
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  // 💡 提示：useState<string>("") 让 query 永远是 string，setText 也只接受 string
  const [query, setQuery] = useState("");

  // ChangeEvent<HTMLInputElement>：当 <input> 的 value 变化时触发
  // - target 类型是 HTMLInputElement，所以 e.target.value 是 string
  // - 每次按键都会触发（不是失去焦点时）
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[ChangeEvent] e.target.value =", e.target.value);
    setQuery(e.target.value);
  };

  // KeyboardEvent<HTMLInputElement>：当 <input> 获得焦点且按键时触发
  // - e.key：按键名（如 "Enter"/"Escape"/"a"），推荐使用
  // - e.ctrlKey / e.shiftKey / e.altKey：修饰键是否按下（boolean）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("[KeyboardEvent] e.key =", e.key, "| e.ctrlKey =", e.ctrlKey);
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
    if (e.key === "Escape") {
      setQuery("");
    }
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();  // 阻止浏览器默认行为
      console.log("  -> 触发 Ctrl+K 快捷键");
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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

// === 3. 点击区域组件（演示 MouseEvent） ===
// 💡 提示：MouseEvent 是最常见的事件类型之一，涵盖 click / contextmenu / mousedown 等
type Coords = { x: number; y: number };

function ClickArea() {
  const [pos, setPos] = useState<Coords | null>(null);

  // MouseEvent<HTMLDivElement>：鼠标点击 div 时触发
  // - clientX / clientY：相对于浏览器视口的坐标
  // - nativeEvent.offsetX / offsetY：相对于事件目标元素的坐标
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("[MouseEvent] clientX =", e.clientX, "| clientY =", e.clientY);
    setPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    console.log("  -> 更新 pos 状态:", { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  // 同样是 MouseEvent，但绑定到 onContextMenu（右键菜单事件）
  // - preventDefault() 阻止浏览器默认右键菜单弹出
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("[MouseEvent] 右键点击坐标:", e.clientX, e.clientY);
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ width: 300, height: 200, background: "#f3f4f6", position: "relative" }}
    >
      {pos && <span style={{ position: "absolute", left: pos.x, top: pos.y }}>📍</span>}
    </div>
  );
}

// === 4. 登录表单组件（演示 FormEvent） ===
function LoginForm() {
  // FormEvent<HTMLFormElement>：表单 submit 时触发
  // - e.currentTarget 类型是 HTMLFormElement（表单本身）
  // - e.preventDefault() 必须调用，否则页面会刷新
  // 💡 提示：e.currentTarget 与 e.target 不同——
  //   currentTarget 是绑定事件的元素（表单），target 是实际触发的元素（可能是按钮）
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[FormEvent] 表单提交触发，已阻止默认刷新");
    // 真实环境可用 new FormData(e.currentTarget) 获取字段值
    console.log("  -> currentTarget 是否存在:", !!e.currentTarget);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input name="username" placeholder="用户名" style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} />
      <input name="password" type="password" placeholder="密码" style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }} />
      <button type="submit" style={{ padding: 8, borderRadius: 6, border: "none", background: "#10b981", color: "#fff", cursor: "pointer" }}>
        登录
      </button>
    </form>
  );
}

// === 5. 拖放区域组件（演示 DragEvent） ===
function DropZone() {
  const [files, setFiles] = useState<string[]>([]);

  // DragEvent<HTMLDivElement>：文件拖入并放下时触发
  // - e.dataTransfer.files：拖入的 File 列表（类数组，需 Array.from 转换）
  // - 必须 preventDefault() 否则浏览器会打开文件
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("[DragEvent] drop 触发，files 数量 =", e.dataTransfer.files.length);
    const fileNames = Array.from(e.dataTransfer.files).map((f) => f.name);
    console.log("  -> 文件列表:", fileNames);
    setFiles((prev) => [...prev, ...fileNames]);
  };

  // onDragOver 也必须 preventDefault，否则 onDrop 不会触发
  // 💡 提示：这是 HTML5 拖放 API 的规定——dragover 不 preventDefault，drop 就不触发
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

// === 6. 主 Demo 组件（保持原有结构，整合所有演示组件） ===
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
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>点击区域（MouseEvent）：</div>
        <ClickArea />
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>登录表单（FormEvent）：</div>
        <LoginForm />
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>拖放测试（DragEvent）：</div>
        <DropZone />
      </div>
    </div>
  );
}

// === 7. 运行时演示：直接调用 mock 事件，观察事件对象结构与 handler 行为 ===
// 💡 提示：下面的代码在模块加载时立即执行，无需真实 DOM 即可看到事件处理全过程。

console.log("========== 事件处理 Demo 开始 ==========");

// --- 演示 1：ChangeEvent —— 模拟用户在 input 中输入 ---
console.log("\\n--- 1. ChangeEvent 演示 ---");
const changeEv = mockChangeEvent("hello typescript");
console.log("事件对象结构:");
console.log("  type:", changeEv.type);
console.log("  target.value:", changeEv.target.value);
// 💡 提示：这就是 React 给 onChange handler 传入的对象形态

// --- 演示 2：KeyboardEvent —— 模拟按键 ---
console.log("\\n--- 2. KeyboardEvent 演示 ---");
const enterEv = mockKeyboardEvent("Enter");
console.log("Enter 键事件:");
console.log("  key:", enterEv.key);
console.log("  ctrlKey:", enterEv.ctrlKey);

const ctrlKEv = mockKeyboardEvent("k", { ctrlKey: true });
console.log("Ctrl+K 事件:");
console.log("  key:", ctrlKEv.key);
console.log("  ctrlKey:", ctrlKEv.ctrlKey);
// 模拟 handler 内部逻辑
if (ctrlKEv.ctrlKey && ctrlKEv.key === "k") {
  ctrlKEv.preventDefault();
  console.log("  -> 快捷键 handler 已执行");
}

// --- 演示 3：MouseEvent —— 模拟点击 ---
console.log("\\n--- 3. MouseEvent 演示 ---");
const mouseEv = mockMouseEvent(120, 80);
console.log("点击事件:");
console.log("  clientX:", mouseEv.clientX);
console.log("  clientY:", mouseEv.clientY);
console.log("  offsetX:", mouseEv.nativeEvent.offsetX);
console.log("  offsetY:", mouseEv.nativeEvent.offsetY);
mouseEv.preventDefault();

// --- 演示 4：FormEvent —— 模拟表单提交 ---
console.log("\\n--- 4. FormEvent 演示 ---");
const formEv = mockFormEvent();
console.log("表单提交事件:");
console.log("  type:", formEv.type);
console.log("  currentTarget 存在:", !!formEv.currentTarget);
formEv.preventDefault();  // 演示阻止默认提交

// --- 演示 5：DragEvent —— 模拟文件拖放 ---
console.log("\\n--- 5. DragEvent 演示 ---");
const dragEv = mockDragEvent(["report.pdf", "image.png"]);
console.log("拖放事件:");
console.log("  files 数量:", dragEv.dataTransfer.files.length);
console.log("  文件列表:", Array.from(dragEv.dataTransfer.files).map((f) => f.name));
dragEv.preventDefault();

console.log("\\n========== 事件处理 Demo 结束 ==========");`,
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
  // useState<Todo[]>([]) —— Todo[] 指定状态为 Todo 对象数组
  // 💡 提示：若不写泛型，useState([]) 会推断成 never[]，之后 setTodos 任何元素都报错
  const [todos, setTodos] = useState<Todo[]>([]);

  // useState("") —— 初始值是字符串，自动推断为 string
  // 💡 提示：基本类型（string/number/boolean）无需手写泛型，TS 已推断得足够精确
  const [input, setInput] = useState("");

  // useState<"all" | "active" | "done">("all") —— 联合字面量类型限定可选值
  // 💡 提示：若不写泛型，useState("all") 推断成 string，setFilter("anything") 都不报错
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const addTodo = () => {
    if (!input.trim()) return;
    // setTodos(prev => prev+1) —— prev 是最新值，避免闭包陷阱
    // 💡 提示：连续调用 setTodos(todos+1) 三次只会 +1，因为闭包里的 todos 是同一个旧值
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
  // useState<Status>("idle") —— Status 是联合字面量类型 "idle"|"loading"|"success"|"error"
  // 💡 提示：若不写泛型，useState("idle") 推断成 string，setStatus("anything") 都不报错
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

// === 5. 运行时演示：闭包陷阱 & Lazy Init ===
// 沙箱中 useState 被 mock 成 [value, noop]，这里用模拟实现演示真实行为
console.log("=== useState 行为模拟演示 ===\\n");

// 模拟 React 的 useState：支持函数式更新与 lazy init
function makeUseState() {
  let state: unknown;
  let inited = false;
  function useState<T>(initial: T | (() => T)): [T, (u: T | ((p: T) => T)) => void] {
    if (!inited) {
      // lazy init：只在首次渲染时执行 initial
      state = typeof initial === "function" ? (initial as () => T)() : initial;
      inited = true;
    }
    const setter = (u: T | ((p: T) => T)) => {
      // 函数式更新：typeof u === "function" 时基于最新 state 计算
      state = typeof u === "function" ? (u as (p: T) => T)(state as T) : u;
    };
    return [state as T, setter];
  }
  return useState;
}

// ---- 5.1 Lazy Init 只执行一次 ----
console.log("--- 5.1 Lazy Init 执行时机 ---");
let lazyCallCount = 0;
const expensiveInit = (): number[] => {
  lazyCallCount++;
  console.log("  > expensiveInit() 第 " + lazyCallCount + " 次执行");
  return [1, 2, 3];
};

const useStateA = makeUseState();
// useState(() => expensiveInit()) —— 函数只在首次渲染时执行一次
// 💡 提示：若写成 useState(expensiveInit())，每次渲染都会执行 expensiveInit()
const [dataA] = useStateA<number[]>(expensiveInit); // 首次：执行
const [dataA2] = useStateA<number[]>(expensiveInit); // 模拟第二次渲染：不再执行
console.log("  结果: data=" + JSON.stringify(dataA) + ", 二次渲染 data=" + JSON.stringify(dataA2) + ", 执行次数=" + lazyCallCount + "\\n");

// ---- 5.2 闭包陷阱：setCount(count+1) vs setCount(prev=>prev+1) ----
console.log("--- 5.2 闭包陷阱演示 ---");

// ❌ 错误写法：setCount(count + 1) —— count 是闭包里的旧值
console.log("  [错误] 连续 3 次 setCount(count + 1):");
{
  const useStateB = makeUseState();
  const [count, setCount] = useStateB(0); // 渲染时 count = 0 被闭包捕获
  console.log("    渲染时 count = " + count);
  setCount(count + 1); // 传入值 1（闭包里 count 仍是 0）
  setCount(count + 1); // 传入值 1
  setCount(count + 1); // 传入值 1
  const [final] = useStateB(0); // 读取最新 state（已 inited，不会重置）
  console.log("    期望 3，实际为 " + final + "（三次都被覆盖成 0+1=1）");
}

// ✅ 正确写法：setCount(prev => prev + 1) —— prev 始终是最新值
console.log("  [正确] 连续 3 次 setCount(prev => prev + 1):");
{
  const useStateC = makeUseState();
  const [count0, setCount] = useStateC(0);
  console.log("    渲染时 count = " + count0);
  setCount((prev: number) => prev + 1); // 0 -> 1
  setCount((prev: number) => prev + 1); // 1 -> 2
  setCount((prev: number) => prev + 1); // 2 -> 3
  const [final] = useStateC(0); // 读取最新 state
  console.log("    期望 3，实际为 " + final + "（函数式更新基于最新值）\\n");
}

// ---- 5.3 状态变化全过程 ----
console.log("--- 5.3 状态变化全过程 ---");
{
  const useStateD = makeUseState();
  const [count, setCount] = useStateD(0);
  console.log("  初始: count = " + count);
  setCount((prev: number) => prev + 1);
  setCount((prev: number) => prev + 5);
  setCount(100);
  const [final] = useStateD(0);
  console.log("  经过 +1, +5, =100 后: count = " + final);
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
// 💡 提示：useRef<T>(initial) 接收一个泛型参数 T，返回 { current: T } 对象
//   - current 可读可写，但修改 current 不会触发组件重渲染
//   - 这与 useState 截然不同：state 变化会触发重渲染，ref 变化不会
// 沙箱说明：沙箱中的 useRef mock 实现就是 () => ({ current: initial })，
//   所以 ref.current 的读写行为与真实 React 一致
import { useState, useEffect, useRef } from "react";

// === 1. 用法 1：DOM 引用 ===
// 💡 提示：useRef<HTMLInputElement>(null) 类型拆解：
//   - 泛型参数 <HTMLInputElement> 表示 current 将存放一个 input DOM 元素
//   - 初始值 null 表示挂载前 current 为 null（DOM 还未渲染）
//   - 挂载后 React 会自动把真实 DOM 节点赋值给 inputRef.current
function AutoFocusInput() {
  // 用法 1: DOM 引用——获取 input 元素，命令式调用 focus/select 等
  const inputRef = useRef<HTMLInputElement>(null);
  // 用法 2: 可变值容器——记录渲染次数（修改不触发重渲染，仅作日志/缓存）
  // 对比：ref.current 修改不触发重渲染，state 修改会触发
  const renderCountRef = useRef(0);

  // 💡 提示：下面这行直接修改 ref.current，不会让组件重渲染
  //   - 同步代码每次渲染都会执行一次，但不会因此额外触发渲染
  renderCountRef.current++;
  // 沙箱演示：读取 ref.current 总是拿到最新值（不像 state 是渲染快照）
  console.log("[AutoFocusInput] 渲染次数 ref.current =", renderCountRef.current);

  useEffect(() => {
    // 此时 React 已把 DOM 节点赋给 inputRef.current
    // 用 ?. 是因为类型是 HTMLInputElement | null
    inputRef.current?.focus();
    console.log("[AutoFocusInput] 已聚焦 input，DOM ref.current =", inputRef.current);
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

// === 2. 用法 3：定时器/资源句柄（setTimeout）===
// 💡 提示：useRef<ReturnType<typeof setTimeout> | null>(null) 类型拆解：
//   - typeof setTimeout      → 取 setTimeout 函数本身的类型
//   - ReturnType<typeof setTimeout> → 取该函数的"返回值类型"
//     · 浏览器环境：等价于 number（定时器 ID 是数字）
//     · Node/TS 环境：等价于 NodeJS.Timeout 对象
//   - | null → 联合 null，因为初始为 null，清除后也置为 null
//   - 用 ref 存定时器 ID 的好处：跨渲染保留句柄，且不触发重渲染
function DebouncedSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  // 用法 3: 定时器/资源句柄——保存 setTimeout 返回的 ID，便于之后 clearTimeout
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // state 修改 → 触发重渲染（输入框 value 会更新到 UI）
    setValue(newValue);
    console.log("[DebouncedSearch] state value 已更新 =", newValue, "（会触发重渲染）");

    // ref 修改 → 不触发重渲染（只是保存句柄）
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      console.log("[DebouncedSearch] 清除上一次定时器 timerRef.current =", timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 500);
    console.log("[DebouncedSearch] 设置新定时器 timerRef.current =", timerRef.current, "（不触发重渲染）");
  };

  useEffect(() => {
    return () => {
      // 💡 提示：组件卸载时一定要清理定时器，避免内存泄漏与"已卸载组件 setState"警告
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

// === 3. 用法 3：定时器/资源句柄（setInterval）===
// 💡 提示：ReturnType<typeof setInterval> 与 setTimeout 同理：
//   - 浏览器环境：等价于 number
//   - Node/TS 环境：等价于 NodeJS.Timeout
//   - 用 ReturnType<typeof setInterval> 比直接写 number 更类型安全、跨环境通用
function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  // 用法 3: 定时器/资源句柄——保存 setInterval 的 ID
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    // 把定时器 ID 存到 ref，stop() 时需要它来 clearInterval
    timerRef.current = setInterval(() => {
      // 💡 提示：这里调用 setSeconds 触发重渲染；如果只是 timerRef.current++ 则 UI 不会更新
      //   - 这是 ref vs state 最直观的区别：要让 UI 变化必须用 state
      setSeconds((s) => s + 1);
    }, 1000);
    console.log("[Stopwatch] 启动定时器 timerRef.current =", timerRef.current);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      console.log("[Stopwatch] 清除定时器 timerRef.current =", timerRef.current);
      // 清除后置为 null，避免悬空句柄
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
      // 组件卸载时清理定时器，防止泄漏
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

// === 4. 行为对比演示：ref vs state ===
// 💡 提示：在 Demo 中通过 console.log 演示 ref.current 与 state 的行为差异
//   - ref.current 修改后：组件不会重渲染，但 ref.current 立即变为新值
//   - state 修改后：组件会重渲染，下一次渲染中 state 才是新值（当前渲染仍是旧值）
export default function Demo() {
  const [searchResult, setSearchResult] = useState("");
  // 用法 2: 可变值容器——记录"ref.current 被修改的次数"，仅用于 console 演示
  const refMutationsRef = useRef(0);
  // 用法 2: 可变值容器——保存上一次的 searchResult，便于对比新旧值
  const prevSearchRef = useRef<string | null>(null);

  // 模拟"修改 ref.current 后组件不重渲染"的对比：
  //   下面这行修改 ref.current，但它本身不会触发 Demo 重渲染
  //   只有当 state（searchResult）变化时，Demo 才会重渲染
  refMutationsRef.current++;
  console.log("[Demo] ref.current 修改后 =", refMutationsRef.current, "（此修改不触发重渲染）");
  console.log("[Demo] 当前 state searchResult =", JSON.stringify(searchResult), "（渲染快照值）");
  // 对比 ref 与 state：ref.current 总是最新值，state 在本次渲染中是快照
  if (prevSearchRef.current !== searchResult) {
    console.log("[Demo] 检测到 searchResult 变化：", prevSearchRef.current, "→", searchResult);
    // 把最新值同步到 ref，便于下次渲染时对比
    prevSearchRef.current = searchResult;
  }

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
