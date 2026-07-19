export const chapters = [
  {
    id: "tsrx-generic-components",
    group: "类型高级篇",
    icon: "🧬",
    title: "泛型组件与类型推断",
    content: `## 泛型组件与类型推断

泛型（Generics）是 TypeScript 最强大的特性之一，它允许我们编写**可重用、类型安全**的组件。在 React 中，泛型组件能够根据传入的 props 自动推断类型，提供极致的类型体验。像 Ant Design、Radix UI、MUI 等主流组件库都深度使用泛型组件。

### 泛型函数组件基础写法

在 React 中定义泛型函数组件时，箭头函数有一个特殊的语法坑——**泛型参数后的逗号**。这是因为 JSX 解析器会把 `<T>` 误认为是 JSX 标签的开始，所以需要加逗号来消除歧义：

```tsx
// 泛型箭头函数组件 - 注意 <T,> 后面的逗号！
// 这个逗号是必需的，告诉 TypeScript 这是泛型参数而非 JSX
const ListComponent = <T,>(props: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}) => {
  return (
    <div className="list">
      {props.items.map((item, index) => (
        <div key={index} className="list-item">
          {props.renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

// 使用时自动推断 T 的类型
const UserList = () => {
  return (
    <ListComponent
      items={[
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 },
      ]}
      renderItem={(user) => (
        <span>{user.name} - {user.age}岁</span>
      )}
    />
  );
};
```

### extends 约束与默认泛型参数

泛型不是"什么都能传"，我们可以用 `extends` 来**约束泛型的类型范围**，还可以指定默认类型：

```tsx
interface DataListProps<T extends object = Record<string, unknown>> {
  data: T[];
  keyField: keyof T;
  renderItem: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
}

function mergeObjects<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

const DataList = <T extends object = Record<string, unknown>>(
  props: DataListProps<T>
) => {
  const { data, keyField, renderItem, onItemClick } = props;
  return (
    <div className="data-list">
      {data.map((item) => (
        <div
          key={String(item[keyField])}
          onClick={() => onItemClick?.(item)}
          className="data-item"
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};
```

### 通用 Table 组件与 Columns 配置

表格是后台系统最常见的组件，一个类型安全的通用 Table 组件能大大提升开发体验：

```tsx
interface Column<T> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  render?: (value: T[keyof T] | undefined, record: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  columns: Column<T>[];
  dataSource: T[];
  loading?: boolean;
  rowKey: keyof T | ((record: T) => string | number);
  onRowClick?: (record: T, index: number) => void;
}

function Table<T extends object>({ columns, dataSource, loading, rowKey, onRowClick }: TableProps<T>) {
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === "function") return rowKey(record);
    return String(record[rowKey]);
  };

  if (loading) return <div className="table-loading">加载中...</div>;

  return (
    <table className="custom-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)} style={{ width: col.width, textAlign: col.align }}>
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataSource.map((record, index) => (
          <tr key={getRowKey(record, index)} onClick={() => onRowClick?.(record, index)}>
            {columns.map((col) => {
              const value = col.dataIndex ? record[col.dataIndex] : undefined;
              return (
                <td key={String(col.key)} style={{ textAlign: col.align }}>
                  {col.render ? col.render(value, record, index) : String(value ?? "")}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### as 多态组件（Polymorphic Component）

多态组件是泛型组件的高级应用——组件可以根据 `as` prop 改变渲染的标签或组件，并**自动推导对应 props 类型**。这是 Radix UI、Mantine 等库的核心模式：

```tsx
import { ComponentPropsWithRef, ElementType, ReactNode } from "react";

type PolymorphicRef<TElement extends ElementType> = ComponentPropsWithRef<TElement>["ref"];

type PolymorphicComponentProps<TElement extends ElementType, TProps = object> = TProps & {
  as?: TElement;
  children?: ReactNode;
  ref?: PolymorphicRef<TElement>;
} & Omit<ComponentPropsWithRef<TElement>, keyof TProps | "as">;

interface TextProps {
  size?: "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "bold";
  color?: "primary" | "secondary" | "danger";
}

const Text = <TElement extends ElementType = "span">(
  props: PolymorphicComponentProps<TElement, TextProps>
) => {
  const { as, size = "md", weight = "normal", color, children, ...rest } = props;
  const Component = as || "span";
  const classes = ["text", `text-${size}`, `text-weight-${weight}`, color ? `text-${color}` : ""]
    .filter(Boolean).join(" ");
  return <Component className={classes} {...rest}>{children}</Component>;
};
```

### 通用 Select 组件

Select 组件也可以用泛型实现，让选项类型安全：

```tsx
interface Option<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string | number> {
  options: Option<T>[];
  value?: T;
  onChange?: (value: T, option: Option<T>) => void;
  placeholder?: string;
}

function Select<T extends string | number = string>({
  options, value, onChange, placeholder = "请选择",
}: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const selectedValue = e.target.value as T;
        const option = options.find((o) => String(o.value) === String(selectedValue));
        if (option && onChange) onChange(selectedValue, option);
      }}
      className="custom-select"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

泛型组件的核心价值在于**类型推导的自动化**——使用组件时不需要手动标注类型，TS 能根据传入的数据自动推导出所有相关类型。`,
  },
  {
    id: "tsrx-children-types",
    group: "类型高级篇",
    icon: "👶",
    title: "Children类型深度",
    content: `## Children类型深度

`children` 是 React 中最特殊的 prop——它允许组件接收嵌套的 JSX 内容。但很多开发者对 `children` 的类型理解不够深入，导致类型不安全或滥用。本节将系统梳理 React 中 children 的各种类型和高级用法。

### ReactNode vs ReactElement vs JSX.Element

这三个类型是最容易混淆的，它们的范围从宽到窄：

```tsx
import { ReactNode, ReactElement } from "react";

// 1. ReactNode：最宽泛的类型，表示所有可以渲染的内容
// 包括：ReactElement | string | number | boolean | null | undefined | ReactNode[] | ReactPortal
const Container = ({ children }: { children: ReactNode }) => {
  return <div className="container">{children}</div>;
};

// 这些都是合法的 ReactNode
<Container>
  纯文本
  {123}
  {null}
  <span>JSX元素</span>
  {[<div key="1">A</div>, <div key="2">B</div>]}
</Container>;

// 2. ReactElement：表示"JSX 元素对象"，有 type/props/key
// ReactElement 只接受 JSX 元素，不接受字符串/数字等
const ElementOnly = ({ children }: { children: ReactElement }) => {
  console.log("元素的 props:", children.props);
  return <div>{children}</div>;
};

// 3. JSX.Element：ReactElement<any, any> 的别名
// 日常写 JSX 时，TS 自动推导的返回类型就是 JSX.Element
const MyComponent = (): JSX.Element => <div>Hello</div>;
```

### React.FC 隐式 children 问题

很多人习惯用 `React.FC` 标注函数组件，但它有一个隐式 children 的"坑"：

```tsx
// React.FC 会自动给 props 添加 children?: ReactNode
// 如果你不需要 children，可能意外传入 children 而不报错
const Card: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      {/* 你忘记渲染 children 了，但传了 children 也不会报错！ */}
    </div>
  );
};

// 这里传了 children，但 Card 没渲染，TS 也不报错
<Card title="标题">
  <p>这段内容不会渲染</p>
</Card>;

// ✅ 推荐：直接声明 props 类型，更精确
interface GoodCardProps {
  title: string;
  children?: ReactNode; // 需要 children 就明确声明
  footer?: ReactNode;
}

const GoodCard = ({ title, children, footer }: GoodCardProps) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children && <div className="card-body">{children}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
```

### Children as Function（Render Props 模式）

`children` 不一定是要渲染的内容，它可以是一个**函数**！这就是 Render Props 模式，用于共享状态逻辑：

```tsx
import { useState, ReactNode } from "react";

interface ToggleProps {
  children: (props: {
    isOn: boolean;
    toggle: () => void;
    turnOn: () => void;
    turnOff: () => void;
  }) => ReactNode;
  initialOn?: boolean;
}

const Toggle = ({ children, initialOn = false }: ToggleProps) => {
  const [isOn, setIsOn] = useState(initialOn);
  const toggle = () => setIsOn((prev) => !prev);
  const turnOn = () => setIsOn(true);
  const turnOff = () => setIsOn(false);
  return <>{children({ isOn, toggle, turnOn, turnOff })}</>;
};

// 使用：children 是一个函数
const App = () => {
  return (
    <Toggle initialOn={false}>
      {({ isOn, toggle, turnOn, turnOff }) => (
        <div>
          <p>开关状态: {isOn ? "开" : "关"}</p>
          <button onClick={toggle}>切换</button>
          <button onClick={turnOn}>打开</button>
          <button onClick={turnOff}>关闭</button>
        </div>
      )}
    </Toggle>
  );
};
```

### React.Children API 与 cloneElement

React 提供了 `React.Children` 工具集来操作 children，还有 `React.cloneElement` 可以给子元素注入 props：

```tsx
import { Children, cloneElement, isValidElement, ReactNode, useState } from "react";

// ChildWrapper：给每个子元素注入 className
const ChildWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="wrapper">
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        return cloneElement(child, {
          className: `${child.props.className || ""} wrapper-child`,
          "data-index": index,
        });
      })}
    </div>
  );
};

// Tabs 复合组件：父组件管理状态，通过 cloneElement 注入 props
interface TabPaneProps {
  tab: string;
  tabKey: string;
  children?: ReactNode;
  isActive?: boolean;
}

const TabPane = ({ children, isActive }: TabPaneProps) => {
  if (!isActive) return null;
  return <div className="tab-pane">{children}</div>;
};

const Tabs = ({ defaultActiveKey, children }: { defaultActiveKey?: string; children: ReactNode }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || "");
  return (
    <div className="tabs">
      <div className="tab-content">
        {Children.map(children, (child) => {
          if (!isValidElement<TabPaneProps>(child)) return child;
          return cloneElement(child, { isActive: child.props.tabKey === activeKey });
        })}
      </div>
    </div>
  );
};
```

### 递归渲染 Children（Tree 组件）

递归组件常用于树形结构（菜单、目录树、评论嵌套），关键是让组件渲染自己：

```tsx
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
}

const TreeItem = ({ node, level }: TreeItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-item">
      <div className="tree-node" style={{ paddingLeft: `${level * 20}px` }}
           onClick={() => hasChildren && setExpanded(!expanded)}>
        {hasChildren && <span>{expanded ? "▼" : "▶"}</span>}
        <span>{node.label}</span>
      </div>
      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree = ({ data }: { data: TreeNode[] }) => {
  return (
    <div className="tree">
      {data.map((node) => <TreeItem key={node.id} node={node} level={0} />)}
    </div>
  );
};
```

掌握 children 的类型和操作方式，是写出灵活、可组合组件的关键。`,
  },
  {
    id: "tsrx-html-props",
    group: "类型高级篇",
    icon: "🏷️",
    title: "原生HTML属性与组件Props结合",
    content: `## 原生HTML属性与组件Props结合

我们封装自定义组件时，经常需要"继承"原生 HTML 元素的属性——比如自定义 Button 要支持 onClick、disabled、type、aria-* 等所有原生 button 属性。手动一个个声明既麻烦又容易遗漏。TypeScript 和 React 提供了工具类型来优雅地解决这个问题。

### ComponentProps 提取原生元素 Props

`React.ComponentProps<"tag">` 可以提取任意 HTML 标签的所有 props 类型：

```tsx
import { ComponentProps, useState } from "react";

// 自定义 Input 组件，扩展原生 input
interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
}

const Input = ({ label, error, helpText, leftIcon, className, id, ...rest }: InputProps) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={["input-wrapper", error ? "has-error" : ""].filter(Boolean).join(" ")}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <div className="input-field-container">
        {leftIcon && <span className="input-icon">{leftIcon}</span>}
        <input
          id={inputId}
          className={["custom-input", leftIcon ? "has-left-icon" : "", className].filter(Boolean).join(" ")}
          {...rest}
        />
      </div>
      {error && <p className="input-error-text">{error}</p>}
      {helpText && !error && <p className="input-help-text">{helpText}</p>}
    </div>
  );
};

// 使用：原生属性都有完整类型提示！
<Input
  label="用户名"
  type="text"
  placeholder="请输入用户名"
  maxLength={20}
  autoComplete="username"
  onChange={(e) => console.log(e.target.value)}
/>;
```

### ComponentPropsWithRef vs ComponentPropsWithoutRef

这两个类型的区别在于**是否包含 ref 类型**：

```tsx
import { ComponentPropsWithRef, ComponentPropsWithoutRef, forwardRef } from "react";

// 普通组件（不转发 ref），用 WithoutRef
type MyButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger";
};

const MyButton = ({ variant = "primary", className, children, ...rest }: MyButtonProps) => {
  return (
    <button className={["btn", `btn-${variant}`, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  );
};

// forwardRef 转发 ref 时，配合 ComponentPropsWithRef
interface FancyButtonProps extends ComponentPropsWithRef<"button"> {
  loading?: boolean;
}

const FancyButton = forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ loading, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={["fancy-btn", loading ? "loading" : "", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {loading && <span className="spinner" />}
        {children}
      </button>
    );
  }
);
FancyButton.displayName = "FancyButton";
```

### CSSProperties 类型与事件类型

```tsx
import { CSSProperties, ComponentProps } from "react";

// CSSProperties：style 对象的类型安全
const buttonStyle: CSSProperties = {
  backgroundColor: "#1677ff",
  color: "white",
  padding: "8px 16px",
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

// 事件类型推导
type ButtonClickHandler = ComponentProps<"button">["onClick"];
// (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void | undefined

type InputChangeHandler = ComponentProps<"input">["onChange"];
// (event: React.ChangeEvent<HTMLInputElement>) => void | undefined

const EventDemo = () => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget, e.clientX, e.clientY);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") console.log("回车提交");
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      console.log("保存");
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input onChange={handleInputChange} onKeyDown={handleKeyDown} />
      <button type="submit" onClick={handleClick}>提交</button>
    </form>
  );
};
```

### Omit 排除不需要的原生属性与 Rest 透传

```tsx
import { Omit } from "utility-types";

interface SelectOption {
  value: string;
  label: string;
}

// 继承 select 原生属性，但覆盖 onChange 的类型，排除 children
interface CustomSelectProps
  extends Omit<ComponentProps<"select">, "value" | "onChange" | "children"> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string, option: SelectOption) => void;
}

const CustomSelect = ({ options, value, onChange, className, ...rest }: CustomSelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        const option = options.find((o) => o.value === val);
        if (option) onChange?.(val, option);
      }}
      className={["custom-select", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};

// 使用：onChange 第一个参数就是 string
<CustomSelect
  options={[{ value: "1", label: "选项1" }, { value: "2", label: "选项2" }]}
  value="1"
  onChange={(val) => console.log(val)}
/>;
```

掌握 ComponentProps 和相关类型，能让你的自定义组件完美融入原生 HTML 的类型系统。`,
  },
  {
    id: "tsrx-utility-types",
    group: "类型高级篇",
    icon: "🔧",
    title: "TypeScript工具类型在React中的应用",
    content: `## TypeScript工具类型在React中的应用

TypeScript 内置了一系列工具类型（Utility Types），它们是基于泛型实现的类型转换函数。在 React 开发中，这些工具类型能解决 80% 的类型转换问题——从表单的 Partial 类型，到组件 props 的 Omit/Pick，再到 hook 返回值的 ReturnType 推导，无处不在。

### Partial、Required、Pick、Omit

这四个是最常用的工具类型，用于对象类型的"增删改查"：

```tsx
import { Partial, Required, Pick, Omit, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  avatar?: string;
  role: "admin" | "user";
}

// Partial<T>：所有字段变可选，表单编辑场景
interface UserFormProps {
  initialValues?: Partial<User>;
  onSubmit: (values: Partial<User>) => void;
}

const UserForm = ({ initialValues = {}, onSubmit }: UserFormProps) => {
  const [form, setForm] = useState<Partial<User>>(initialValues);
  const handleChange = (field: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <input placeholder="姓名" value={form.name || ""} onChange={handleChange("name")} />
      <input placeholder="邮箱" value={form.email || ""} onChange={handleChange("email")} />
      <button type="submit">保存</button>
    </form>
  );
};

// Pick<T, K>：挑选部分字段
type UserBasicInfo = Pick<User, "id" | "name" | "avatar">;

// Omit<T, K>：排除部分字段
type CreateUserInput = Omit<User, "id" | "createdAt">;
```

### Record 映射类型

`Record<K, V>` 用于创建"键为 K 类型、值为 V 类型"的对象映射，在状态机、映射表中极其常用：

```tsx
import { Record } from "react";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// Record 确保每个状态都有对应的配置，漏掉一个 TS 就报错
const statusConfig: Record<OrderStatus, { label: string; color: string; canCancel: boolean }> = {
  pending: { label: "待付款", color: "#faad14", canCancel: true },
  paid: { label: "已付款", color: "#1677ff", canCancel: true },
  shipped: { label: "已发货", color: "#722ed1", canCancel: false },
  delivered: { label: "已送达", color: "#52c41a", canCancel: false },
  cancelled: { label: "已取消", color: "#ff4d4f", canCancel: false },
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  return <span style={{ color: config.color }}>{config.label}</span>;
};
```

### ReturnType、Parameters、Awaited

这三个工具类型用于**从已有函数推导类型**：

```tsx
import { ReturnType, Parameters, Awaited, useState, useEffect } from "react";

// ReturnType<typeof fn>：推导 Hook 返回值类型
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
}

type CounterState = ReturnType<typeof useCounter>;
// { count: number; increment: () => void; ... }

// Parameters<typeof fn>：推导函数参数类型
async function fetchUser(userId: number, options?: { includePosts?: boolean }) {
  const res = await fetch(`/api/users/${userId}`);
  return res.json();
}

type FetchUserParams = Parameters<typeof fetchUser>;
// [userId: number, options?: { includePosts?: boolean }]

// Awaited<T>：解包 Promise 类型
type UserData = Awaited<ReturnType<typeof fetchUser>>;

function useUser(userId: number) {
  const [user, setUser] = useState<UserData | null>(null);
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  return { user };
}
```

### Exclude、Extract、NonNullable

这三个工具类型用于联合类型的过滤：

```tsx
import { Exclude, Extract, NonNullable } from "react";

type Role = "admin" | "editor" | "viewer" | "guest";

// Exclude<Union, ExcludedMembers>：从联合类型中排除某些成员
type NonAdminRoles = Exclude<Role, "admin">; // "editor" | "viewer" | "guest"
type WriteRoles = Exclude<Role, "viewer" | "guest">; // "admin" | "editor"

// Extract<Union, ExtractedMembers>：从联合类型中提取某些成员
type AdminOnly = Extract<Role, "admin">; // "admin"
type ReadWriteRoles = Extract<Role, "admin" | "editor">; // "admin" | "editor"

// NonNullable<T>：排除 null 和 undefined
type MaybeValue = string | number | null | undefined;
type ValidValue = NonNullable<MaybeValue>; // string | number

// 实际应用：结合 filter 过滤空值
const items = [1, null, 2, undefined, 3, "hello"];
const validItems = items.filter(
  (item): item is NonNullable<typeof item> => item != null
);
// validItems 类型为 (string | number)[]

// 条件类型（Conditional Types）基础：T extends U ? X : Y
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<123>; // false

// 实战：提取组件 Props 中函数类型的 key
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

interface Props {
  name: string;
  age: number;
  onClick: () => void;
  onChange: (val: string) => void;
}

type PropEvents = FunctionKeys<Props>; // "onClick" | "onChange"
```

### 自定义工具类型

```tsx
// Optional：把指定字段变成可选
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// DeepPartial：递归把所有嵌套字段变成可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Settings {
  theme: { mode: "light" | "dark"; primaryColor: string };
  notifications: { email: boolean; push: boolean };
}

type PartialSettings = DeepPartial<Settings>;
// theme?: { mode?: ...; primaryColor?: ... }

// ValueOf：获取对象值的类型
type ValueOf<T> = T[keyof T];

const COLORS = { primary: "#1677ff", success: "#52c41a" } as const;
type Color = ValueOf<typeof COLORS>; // "#1677ff" | "#52c41a"
```

工具类型是 TypeScript 类型编程的基础，熟练掌握能让你写 TSX 事半功倍。`,
  },
  {
    id: "tsrx-discriminated-unions",
    group: "类型高级篇",
    icon: "🔀",
    title: "可辨识联合类型",
    content: `## 可辨识联合类型

可辨识联合（Discriminated Unions），也叫标签联合（Tagged Unions），是 TypeScript 中**最强大的类型模式之一**。它通过一个公共的"辨识字段"（discriminant）来自动收窄类型。在 React 中，reducer、异步状态、组件变体等场景都能看到它的身影。

### 基础：用 type 字段区分联合变体

核心思想：联合类型的每个成员都有一个**相同的字段（通常叫 type/kind/status），使用不同的字面量类型**：

```tsx
type Notification =
  | { type: "success"; message: string; duration?: number }
  | { type: "error"; message: string; errorCode?: number; onRetry?: () => void }
  | { type: "warning"; message: string; onConfirm?: () => void }
  | { type: "info"; message: string };

// 穷尽性检查辅助函数
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

const Toast = ({ notification }: { notification: Notification }) => {
  switch (notification.type) {
    case "success":
      return <div className="toast-success">✅ {notification.message}</div>;
    case "error":
      return (
        <div className="toast-error">
          ❌ {notification.message}
          {notification.onRetry && <button onClick={notification.onRetry}>重试</button>}
        </div>
      );
    case "warning":
      return <div className="toast-warning">⚠️ {notification.message}</div>;
    case "info":
      return <div className="toast-info">ℹ️ {notification.message}</div>;
    default:
      return assertNever(notification);
  }
};
```

### 异步请求四态（Idle/Loading/Success/Error）

这是 React 中最常用的可辨识联合模式，严格区分 data 和 error 的存在性：

```tsx
type AsyncData<T, E = Error> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: E };

interface AsyncContentProps<T> {
  asyncData: AsyncData<T>;
  renderIdle?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderSuccess: (data: T) => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
}

function AsyncContent<T>({
  asyncData,
  renderIdle = () => null,
  renderLoading = () => <div>加载中...</div>,
  renderSuccess,
  renderError = (err) => <div>加载失败: {err.message}</div>,
}: AsyncContentProps<T>) {
  switch (asyncData.status) {
    case "idle": return <>{renderIdle()}</>;
    case "loading": return <>{renderLoading()}</>;
    case "success": return <>{renderSuccess(asyncData.data)}</>;
    case "error": return <>{renderError(asyncData.error)}</>;
    default: return assertNever(asyncData);
  }
}
```

### Reducer Action 标准模式

React 的 useReducer 天然适合配合可辨识联合使用：

```tsx
import { useReducer } from "react";

interface CounterState {
  count: number;
  step: number;
}

const initialState: CounterState = { count: 0, step: 1 };

type CounterAction =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "SET_STEP"; payload: number }
  | { type: "RESET" }
  | { type: "ADD"; payload: number };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + state.step };
    case "DECREMENT":
      return { ...state, count: state.count - state.step };
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "RESET":
      return { ...state, count: 0 };
    case "ADD":
      return { ...state, count: state.count + action.payload };
    default:
      return assertNever(action);
  }
}

const Counter = () => {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  return (
    <div>
      <p>计数: {state.count} (步长: {state.step})</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <button onClick={() => dispatch({ type: "ADD", payload: 10 })}>+10</button>
      <button onClick={() => dispatch({ type: "RESET" })}>重置</button>
    </div>
  );
};
```

### Alert 组件变体：不同 props

可辨识联合让组件 props 根据 variant "动态变化"：

```tsx
type AlertProps =
  | { variant: "success" | "info"; message: string; closable?: boolean }
  | { variant: "error"; message: string; closable?: boolean; error: Error; onRetry?: () => void }
  | { variant: "confirm"; title: string; message: string; onConfirm: () => void; onCancel: () => void };

const Alert = (props: AlertProps) => {
  switch (props.variant) {
    case "success":
      return <div className="alert-success">✅ {props.message}</div>;
    case "info":
      return <div className="alert-info">ℹ️ {props.message}</div>;
    case "error":
      return (
        <div className="alert-error">
          ❌ {props.message}
          {props.onRetry && <button onClick={props.onRetry}>重试</button>}
        </div>
      );
    case "confirm":
      return (
        <div className="alert-confirm">
          <h4>{props.title}</h4>
          <p>{props.message}</p>
          <button onClick={props.onCancel}>取消</button>
          <button onClick={props.onConfirm}>确定</button>
        </div>
      );
    default:
      return assertNever(props);
  }
};
```

可辨识联合让"不可能的状态"不可能出现——成功状态一定有 data，错误状态一定有 error。`,
  },
  {
    id: "tsrx-type-narrowing",
    group: "类型高级篇",
    icon: "🔍",
    title: "类型收窄与类型守卫",
    content: `## 类型收窄与类型守卫

TypeScript 的类型系统是"流动"的——它会随着代码逻辑不断**收窄（narrowing）**类型范围。类型守卫（Type Guards）是那些让 TS 相信"在这个位置，类型更具体"的表达式。掌握类型收窄，你才能写出既类型安全又符合运行时逻辑的代码。

### typeof、instanceof、in 操作符收窄

```tsx
// typeof 收窄基本类型
function formatValue(value: string | number | boolean | null) {
  if (value === null) return "—";
  if (typeof value === "string") return value.trim().toUpperCase();
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "boolean") return value ? "是" : "否";
  return assertNever(value);
}

// instanceof 收窄类实例
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log("错误:", error.message);
    return error.message;
  }
  if (error instanceof Response) {
    return `HTTP ${error.status}`;
  }
  return String(error);
}

// in 操作符收窄
type Fish = { swim: () => void; name: string };
type Bird = { fly: () => void; name: string };

function move(animal: Fish | Bird) {
  if ("swim" in animal) return animal.swim();
  return animal.fly();
}
```

### 真值收窄与可选链、空值合并

```tsx
// ===/!== 字面量收窄
function handleResponse(
  response:
    | { status: 200; data: unknown }
    | { status: 401; redirectTo: string }
    | { status: 500; error: string; traceId: string }
) {
  if (response.status === 200) return { data: response.data };
  if (response.status === 401) return { redirect: response.redirectTo };
  if (response.status === 500) return { error: response.error, traceId: response.traceId };
}

// 可选链 ?. 和空值合并 ??
interface User {
  name: string;
  address?: { street?: { name?: string } };
}

function getStreetName(user: User | null | undefined) {
  const streetName = user?.address?.street?.name;
  return streetName ?? "未知街道";
}

// ?? vs || 的关键区别
const count = 0;
const r1 = count || 10; // 10（0 是 falsy）
const r2 = count ?? 10; // 0（0 不是 null/undefined）
```

### 自定义类型守卫（is 关键字）

返回 `value is Type` 的函数就是自定义类型守卫：

```tsx
// 判断是否是字符串数组
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

// 判断 API 错误格式
interface ApiError {
  code: number;
  message: string;
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" && value !== null &&
    "code" in value && "message" in value &&
    typeof (value as ApiError).code === "number"
  );
}

// 过滤数组 null/undefined，保留类型
function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const arr = [1, null, 2, undefined, 3];
const filtered = arr.filter(notEmpty); // number[] ✅

// React 场景：过滤 children 中的有效元素
const safeChildren = React.Children.toArray(children).filter(
  (child): child is React.ReactElement => React.isValidElement(child)
);
```

### satisfies 运算符与非空断言

```tsx
// satisfies：检查值是否满足类型，但保留字面量类型（TS 4.9+）
// 普通标注会丢失字面量信息
const c1: Record<string, "primary" | "secondary"> = { main: "primary" };
// c1.main 类型是 "primary" | "secondary"（丢失字面量）

// satisfies 保留字面量类型，同时做类型检查
const c2 = { main: "primary", sub: "secondary" } satisfies Record<string, "primary" | "secondary">;
// c2.main 类型是 "primary"（保留！）
// 如果写了 wrong: "danger" 会报错

// asserts 断言函数
function assertIsDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value === null || value === undefined) throw new Error(msg || "值不应为空");
}

const MyInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const focus = () => {
    assertIsDefined(inputRef.current);
    inputRef.current.focus(); // 类型已收窄为 HTMLInputElement
  };
  return <input ref={inputRef} />;
};

// ! 非空断言（谨慎使用）：告诉 TS "我确定不是 null/undefined"
// 只有 100% 确定时才用，优先用 ?. 和显式检查
useEffect(() => {
  inputRef.current!.focus(); // mount 后 ref 一定存在
}, []);
```

类型收窄是 TypeScript 的日常基本功——尽量让 TS 自动推导，而不是手动断言。`,
  },
  {
    id: "tsrx-forwardref-types",
    group: "类型高级篇",
    icon: "📡",
    title: "forwardRef与useImperativeHandle类型",
    content: `## forwardRef与useImperativeHandle类型

Ref 是 React 中访问 DOM 节点或组件实例的方式。`forwardRef` 让组件能把 ref 转发给内部子元素，`useImperativeHandle` 则让组件自定义暴露给父组件的命令式 API。

### forwardRef 基础：转发到原生 DOM

`forwardRef<T, P>` 接受两个泛型参数：**T 是 ref 的类型，P 是组件 props 的类型**：

```tsx
import { forwardRef, useRef, useEffect } from "react";

// forwardRef<RefType, PropsType>
const CustomInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={["custom-input", className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);
CustomInput.displayName = "CustomInput";

const Form = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <form>
      <CustomInput ref={inputRef} placeholder="用户名" />
      <button type="submit">提交</button>
    </form>
  );
};
```

### Ref 类型：RefObject / MutableRefObject / Ref

```tsx
import { useRef, MutableRefObject, RefObject, Ref } from "react";

// 1. RefObject<T>：useRef(null) 返回，current 只读
const domRef = useRef<HTMLDivElement>(null);
// RefObject<HTMLDivElement>，current: HTMLDivElement | null

// 2. MutableRefObject<T>：useRef(initialValue) 有初始值
const countRef = useRef(0);
// MutableRefObject<number>，current: number（可变）

// 3. Ref<T> = RefObject<T> | MutableRefObject<T> | ((instance: T | null) => void) | null
// forwardRef 接收的 ref 参数就是 Ref<T>，因为可以传对象或回调
```

### useImperativeHandle 暴露自定义 API

`useImperativeHandle` 允许组件自定义暴露给父组件的 ref 值：

```tsx
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

// 定义暴露给父组件的 API 类型
interface SearchInputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  selectAll: () => void;
  getValue: () => string;
}

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  ({ placeholder = "搜索...", onSearch }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => { setValue(""); onSearch?.(""); },
      selectAll: () => inputRef.current?.select(),
      getValue: () => value,
    }), [value, onSearch]);

    return (
      <div className="search-input">
        <span>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// 父组件使用
const SearchPage = () => {
  const searchRef = useRef<SearchInputHandle>(null);
  return (
    <div>
      <SearchInput ref={searchRef} onSearch={(val) => console.log(val)} />
      <button onClick={() => searchRef.current?.focus()}>聚焦</button>
      <button onClick={() => searchRef.current?.clear()}>清空</button>
    </div>
  );
};
```

### mergeRefs 工具函数：同时支持多个 ref

```tsx
import { useCallback, forwardRef, useRef, useEffect } from "react";

type RefCallback<T> = (instance: T | null) => void;

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): RefCallback<T> {
  return (instance: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = instance;
      }
    });
  };
}

// 组件内部 ref + forwardRef 外部 ref 同时使用
const AutoFocusInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, externalRef) => {
    const internalRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      internalRef.current?.focus();
    }, []);

    const mergedRef = useCallback(
      mergeRefs(internalRef, externalRef),
      [externalRef]
    );

    return (
      <input
        ref={mergedRef}
        className={["auto-focus-input", className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  }
);
AutoFocusInput.displayName = "AutoFocusInput";
```

注意：避免过度使用 useImperativeHandle——声明式 props 优先，命令式 ref 作为逃生舱口。`,
  },
  {
    id: "tsrx-hoc-types",
    group: "类型高级篇",
    icon: "🎭",
    title: "高阶组件HOC类型",
    content: `## 高阶组件HOC类型

高阶组件（Higher-Order Component，HOC）是 React 中**复用组件逻辑**的经典模式。它是一个函数，接收一个组件作为参数，返回一个增强后的新组件。虽然自定义 Hook 更流行，但 HOC 在权限控制、日志埋点等横切关注点场景中依然常见。

### HOC 基础类型签名

HOC 的本质是 `组件 → 组件` 的函数：

```tsx
import { ComponentType } from "react";

// 最简单的 HOC：给组件包裹一层容器
function withBorder<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  const WithBorder = (props: P) => {
    return (
      <div style={{ border: "2px solid #1677ff", padding: 16, borderRadius: 8 }}>
        <Component {...props} />
      </div>
    );
  };
  WithBorder.displayName = `withBorder(${Component.displayName || Component.name || "Component"})`;
  return WithBorder;
}

const Hello = ({ name }: { name: string }) => <h1>你好，{name}</h1>;
const HelloWithBorder = withBorder(Hello);
```

### Props 注入 HOC（withUser）

最常见的 HOC 是**注入额外 props**——比如 withUser 注入当前用户信息：

```tsx
import { createContext, useContext, ComponentType } from "react";

interface User {
  id: number;
  name: string;
  role: "admin" | "user";
}

const UserContext = createContext<User | null>(null);

interface WithUserProps {
  user: User;
  isAdmin: boolean;
}

// 返回的组件不需要（也不能）传入被注入的 props，用 Omit 移除
function withUser<P extends WithUserProps>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof WithUserProps>> {
  const WithUser = (props: Omit<P, keyof WithUserProps>) => {
    const user = useContext(UserContext);
    if (!user) return <div>加载中...</div>;
    return (
      <Component
        {...(props as P)}
        user={user}
        isAdmin={user.role === "admin"}
      />
    );
  };
  WithUser.displayName = `withUser(${Component.displayName || Component.name})`;
  return WithUser;
}

// 使用
interface UserProfileProps {
  user: User;
  isAdmin: boolean; // 由 HOC 注入
  showEmail?: boolean;
}

const UserProfile = ({ user, isAdmin, showEmail }: UserProfileProps) => {
  return (
    <div>
      <h3>{user.name}</h3>
      {isAdmin && <span className="admin-badge">管理员</span>}
    </div>
  );
};

const UserProfileWithUser = withUser(UserProfile);
// 使用时只需要传 showEmail，不需要传 user/isAdmin
<UserProfileWithUser showEmail />;
```

### withAuth 权限守卫 HOC

```tsx
import { useRouter } from "next/router";
import { useEffect, useContext } from "react";

interface WithAuthOptions {
  requiredRole?: "admin" | "user";
  redirectTo?: string;
}

function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { requiredRole, redirectTo = "/login" } = options;

  const WithAuth = (props: P) => {
    const user = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push(redirectTo);
        return;
      }
      if (requiredRole && user.role !== requiredRole) {
        router.push("/403");
      }
    }, [user, router]);

    if (!user) return null;
    if (requiredRole && user.role !== requiredRole) return null;

    return <Component {...props} />;
  };

  WithAuth.displayName = `withAuth(${Component.displayName || Component.name})`;
  return WithAuth;
}

// 使用：仅管理员可访问
const AdminPanel = () => <div>管理面板</div>;
export default withAuth(AdminPanel, { requiredRole: "admin" });
```

### withLogger 与 HOC vs Hook 对比

```tsx
import { useEffect, ComponentType } from "react";

// withLogger：Props 变化日志（调试用）
function withLogger<P extends object>(Component: ComponentType<P>, debugName?: string) {
  const name = debugName || Component.displayName || Component.name || "Component";

  const WithLogger = (props: P) => {
    useEffect(() => {
      console.log(`[${name}] 挂载`);
      return () => console.log(`[${name}] 卸载`);
    }, []);
    useEffect(() => {
      console.log(`[${name}] 更新:`, props);
    });
    return <Component {...props} />;
  };

  WithLogger.displayName = `withLogger(${name})`;
  return WithLogger;
}

// HOC 组合（compose）
function compose<T>(...fns: Array<(arg: T) => T>) {
  return (arg: T) => fns.reduceRight((result, fn) => fn(result), arg);
}

const enhance = compose<ComponentType<any>>(withAuth, withLogger, withBorder);
// const Enhanced = enhance(MyComponent);

// HOC vs Hook：
// HOC 优点：渲染劫持（权限/重定向）、类组件兼容、props 自动注入
// HOC 缺点：类型复杂、嵌套地狱、ref 问题、props 来源不透明
// Hook 优点：类型简单、逻辑灵活、无嵌套、props 来源清晰
// 趋势：Hook 首选，HOC 用于渲染劫持等特殊场景
```

HOC 的类型标注虽复杂，但核心模式就是"注入 Props + Omit 移除"。`,
  },
  {
    id: "tsrx-declare-modules",
    group: "类型高级篇",
    icon: "📜",
    title: "模块声明与类型扩展",
    content: `## 模块声明与类型扩展

当使用第三方库、CSS Modules、图片资源、或者扩展全局对象时，TypeScript 需要知道这些非 JS/TS 模块的类型。`declare module`、`declare global` 和 `.d.ts` 声明文件就是干这个的。

### declare module 扩展第三方库类型

模块补充（Module Augmentation）可以给已有库添加类型：

```tsx
// 文件：types/augmentations.d.ts

// 扩展 axios 添加自定义配置项
import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    showLoading?: boolean;
    showError?: boolean;
    skipErrorHandler?: boolean;
  }
}

// 扩展 Next.js NextPage 添加布局配置
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

declare module "next" {
  type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
    auth?: { required?: boolean; role?: "admin" | "user" };
  };
}

// 之后使用有类型提示
// axios.get("/api/xxx", { showLoading: true });
```

### CSS Modules 与静态资源类型声明

在 Vite/Webpack 项目中导入 CSS Modules、SVG、图片需要类型声明：

```tsx
// 文件：types/assets.d.ts

// CSS Modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 图片
declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }

// SVG 作为 React 组件（SVGR）
declare module "*.svg" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Markdown
declare module "*.md" { const content: string; export default content; }
declare module "*.mdx" {
  import type { ComponentType } from "react";
  const MDXComponent: ComponentType;
  export default MDXComponent;
}

// 之后导入就有类型
import styles from "./Button.module.css";
import Logo from "./logo.svg";
```

### declare global 扩展全局类型

```tsx
// 文件：types/global.d.ts
// 注意：必须在模块文件中（有 import/export），否则写 export {}

export {};

declare global {
  // 扩展 Window
  interface Window {
    __APP_VERSION__: string;
    __INITIAL_STATE__?: Record<string, unknown>;
    gtag?: (...args: any[]) => void;
  }

  // 环境变量类型提示
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_API_URL: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }

  // 全局类型（不需要 import）
  type ID = string | number;

  interface ApiResponse<T = unknown> {
    code: number;
    data: T;
    message: string;
    success: boolean;
  }

  interface PaginatedResponse<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
}

// 使用
console.log(process.env.NEXT_PUBLIC_API_URL);
window.__APP_VERSION__ = "1.0.0";
const res: ApiResponse<User> = await fetch("/api/user").then(r => r.json());
```

### .d.ts 文件配置

```tsx
// tsconfig.json 关键配置
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",
      "./src/types"
    ],
    "types": ["node", "react", "vite/client"],
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"]
}

// 推荐类型文件目录：
// src/types/
//   global.d.ts        - 全局类型
//   assets.d.ts        - 静态资源
//   augmentations.d.ts - 第三方库扩展
//   api.d.ts           - API 类型

// 给没有类型的库写声明
declare module "untyped-library"; // 所有导入都是 any
// 或写详细声明
declare module "some-old-lib" {
  export function doSomething(input: string): number;
  export const VERSION: string;
}

// 三斜线指令（.d.ts 中引用）
/// <reference types="node" />
/// <reference types="vite/client" />
```

类型声明是 TS 项目的"基础设施"，配置好后整个项目的类型安全性会大幅提升。`,
  },
  {
    id: "tsrx-ts-patterns",
    group: "类型高级篇",
    icon: "🧩",
    title: "React+TS常见类型模式",
    content: `## React+TS常见类型模式

在实际 React + TypeScript 项目中，有一些反复出现的类型模式——受控与非受控组件、API 响应包装、递归类型、默认值处理等。掌握这些"套路"，写 TSX 时行云流水。

### 组件 Props 默认值与可选值

设计组件 Props 时的最佳实践：

```tsx
interface ButtonProps {
  children: React.ReactNode; // 必选
  variant?: "primary" | "secondary" | "danger" | "ghost"; // 可选
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

// 默认值用解构赋值
const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <button
      className={["btn", `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(" ")}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
};

// as const 推导字面量类型
const SIZE_MAP = { sm: "小", md: "中", lg: "大" } as const;
type Size = keyof typeof SIZE_MAP; // "sm" | "md" | "lg"
type SizeLabel = typeof SIZE_MAP[Size]; // "小" | "中" | "大"
```

### 受控 + 非受控组件统一模式

类似 Radix UI，组件同时支持受控（value+onChange）和非受控（defaultValue）模式：

```tsx
import { useState, useCallback, useEffect } from "react";

interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

// 通用受控/非受控状态 Hook
function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateOptions<T>) {
  const [internalValue, setInternalValue] = useState(defaultValue as T);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const nextValue = typeof next === "function" ? (next as (prev: T) => T)(currentValue) : next;
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }, [isControlled, currentValue, onChange]);

  return [currentValue, setValue] as const;
}

// 应用到 Input 组件
interface ControllableInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const ControllableInput = ({ value, defaultValue, onChange, placeholder }: ControllableInputProps) => {
  const [val, setVal] = useControllableState({ value, defaultValue: defaultValue ?? "", onChange });

  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      placeholder={placeholder}
    />
  );
};

// 使用：非受控
<ControllableInput defaultValue="hello" onChange={(v) => console.log(v)} />
// 使用：受控
const [val, setVal] = useState("");
<ControllableInput value={val} onChange={setVal} />;
```

### API 响应类型泛型包装

```tsx
// 统一 API 响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface PageParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 通用 API 请求 Hook
async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

// 用户相关 API
interface User {
  id: number;
  name: string;
  email: string;
}

const userApi = {
  getList: (params: PageParams) =>
    request<PaginatedData<User>>(`/api/users?page=${params.page || 1}`),
  getById: (id: number) =>
    request<User>(`/api/users/${id}`),
  create: (data: Omit<User, "id">) =>
    request<User>("/api/users", { method: "POST", body: JSON.stringify(data) }),
};
```

### 递归 TreeNode 类型与 Props 兼容模式

```tsx
// 递归 TreeNode 类型
type TreeNode<T = Record<string, unknown>> = {
  id: string;
  label: string;
  children?: TreeNode<T>[];
} & T;

// 递归 Tree 组件
interface TreeProps<T> {
  data: TreeNode<T>[];
  renderNode?: (node: TreeNode<T>, level: number) => React.ReactNode;
  onNodeClick?: (node: TreeNode<T>) => void;
}

function Tree<T>({ data, renderNode, onNodeClick }: TreeProps<T>) {
  const renderTree = (nodes: TreeNode<T>[], level: number): React.ReactNode => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div onClick={() => onNodeClick?.(node)} style={{ paddingLeft: level * 20 }}>
          {renderNode ? renderNode(node, level) : node.label}
        </div>
        {node.children && renderTree(node.children, level + 1)}
      </div>
    ));
  };
  return <div className="tree">{renderTree(data, 0)}</div>;
}

// Props 版本兼容（旧 props deprecated 但仍支持）
interface NewButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  onPress?: () => void; // 新 API
  /** @deprecated 请使用 onPress */
  onClick?: () => void; // 旧 API，仍支持
}

const CompatibleButton = ({ variant, size, onPress, onClick }: NewButtonProps) => {
  const handleClick = onPress || onClick; // 新旧都支持
  return <button className={`btn-${variant}`} onClick={handleClick}>按钮</button>;
};
```

这些模式覆盖了 React + TS 项目中 90% 的常见场景，熟练掌握能极大提升开发效率。`,
  },
];