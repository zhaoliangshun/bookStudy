// =============================================================
// TypeScript 全解 · Batch 10：React 实战（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 在 React 项目中的实战类型技巧：
//   1. 组件 Props 类型      tsbook-react-props
//   2. Hooks 类型           tsbook-react-hooks
//   3. 事件类型             tsbook-react-event
//   4. Context 与 Reducer   tsbook-react-context
//   5. ref 与 forwardRef    tsbook-react-ref
// 章节归属 group：React 实战
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：React 组件 Props 类型
  // ===========================================================
  {
    id: "tsbook-react-props",
    title: "React 组件 Props 类型",
    icon: "🧩",
    group: "React 实战",
    content: `# 🧩 React 组件 Props 类型

React + TypeScript 的核心战场就是 **Props 类型**。写好 Props 类型，组件的契约就清晰了——调用方有提示，写错了有红线。

## 一、函数组件的两种写法

\`\`\`tsx
// 写法 1：直接标 Props 类型（推荐，最简洁）
type ButtonProps = {
  label: string;
  onClick: () => void;
};
function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

// 写法 2：用 React.FC 类型
const Button: React.FC<ButtonProps> = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
\`\`\`

两种写法运行时完全等价，**社区主流推荐写法 1**——直接标 props 参数。原因下一节讲。

## 二、\`React.FC\` 的陷阱：默认不包含 children

\`React.FC\`（早期叫 \`React.SFC\`）是 React 官方提供的函数组件类型。**React 18 之后，\`FC\` 不再隐式包含 \`children\`**——这是最大的坑：

\`\`\`tsx
const Card: React.FC<{ title: string }> = ({ title, children }) => {
  // ❌ React 18+：children 类型未声明，报错
  return <div><h1>{title}</h1>{children}</div>;
};
\`\`\`

如果需要 \`children\`，要么显式加到 Props 里，要么用 \`PropsWithChildren\`：

\`\`\`tsx
// 方式 A：手动加 children
type CardProps = { title: string; children: React.ReactNode };
const Card: React.FC<CardProps> = ({ title, children }) => { /* ... */ };

// 方式 B：用 PropsWithChildren 工具类型
const Card: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return <div><h1>{title}</h1>{children}</div>;
};
\`\`\`

> ⭐ 这就是社区推荐"直接标 props"的原因——少绕一层 \`FC\`，类型更直观。

## 三、\`React.ReactNode\` vs \`React.ReactElement\`

| 类型 | 含义 | 能放什么 |
|------|------|---------|
| \`ReactNode\` | 任何可渲染的内容 | string、number、boolean、null、undefined、ReactElement、数组 |
| \`ReactElement\` | 严格的一个 JSX 元素 | 只有 \`<div />\` 这种，不能是字符串/数字 |
| \`ReactNode[]\` | 多个节点 | 数组 |

通常用 \`ReactNode\` 最宽松；如果你只想接受"一个元素"（比如 \`<Icon />\`），用 \`ReactElement\` 更安全。

## 四、泛型组件：让 Props 类型可参数化

普通组件的 Props 类型是固定的。但像 \`List\`、\`Table\`、\`Select\` 这种**容器组件**，需要根据子项类型推导——这时就要写**泛型组件**：

\`\`\`tsx
// 泛型组件：<T,> 里的逗号是为了让 TS 知道这是泛型不是 JSX
function List<T>(props: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <ul>{props.items.map((item, i) => <li key={i}>{props.render(item)}</li>)}</ul>;
}

// 使用：T 自动推导为 { id: number; name: string }
<List items={[{ id: 1, name: "Tom" }]} render={(item) => <span>{item.name}</span>} />;
//                                       ↑ 这里的 item 类型自动推导
\`\`\`

**关键点**：函数声明 \`function List<T>\` 写泛型很简单，但**箭头函数写泛型组件需要加 \`<T,>\`**（加逗号），否则 TS 把 \`<T>\` 当成 JSX 标签解析：

\`\`\`tsx
// ❌ 报错：TS 以为 <T> 是 JSX 标签
const List = <T>(props: ListProps<T>) => { /* ... */ };

// ✅ 加逗号告诉 TS 这是泛型
const List = <T,>(props: ListProps<T>) => { /* ... */ };

// ✅ 或用 extends 约束（更明确）
const List = <T extends unknown>(props: ListProps<T>) => { /* ... */ };
\`\`\`

## 五、\`React.ComponentProps\`：提取组件的 Props 类型

想从一个已存在的组件反查它的 Props 类型，用 \`React.ComponentProps\`：

\`\`\`tsx
import { Button } from "antd";

// 反查 antd Button 的 Props 类型
type AntdButtonProps = React.ComponentProps<typeof Button>;
// 等价于手动看源码抄类型

// 然后基于它扩展
type MyButtonProps = AntdButtonProps & {
  loading?: boolean;
};
\`\`\`

| 工具类型 | 用途 |
|---------|------|
| \`ComponentProps<typeof Comp>\` | 拿到组件的 Props（含 children） |
| \`ComponentPropsWithoutRef<'button'>\` | 拿到原生 HTML 元素的属性（去掉 ref） |
| \`ComponentPropsWithRef<typeof Comp>\` | 拿到含 ref 的 Props |

\`\`\`tsx
// 继承原生 button 属性，扩展自定义字段
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "danger";
};
\`\`\`

## 六、可选 vs 必填 vs 默认值

\`\`\`tsx
type Props = {
  title: string;          // 必填
  size?: "sm" | "md";     // 可选（undefined 也合法）
  count?: number;         // 可选
};

// 默认值用解构语法（不进 Props 类型）
function Button({ title, size = "md", count = 0 }: Props) {
  // size 此时类型是 "sm" | "md"（不含 undefined，因为有默认值）
}
\`\`\`

## 七、一句话总结

- **直接标 props 参数**，不要套 \`React.FC\`。
- 需要 \`children\` 用 \`React.PropsWithChildren\` 或 \`React.ReactNode\`。
- 泛型组件用 \`function\` 声明最省事，箭头函数记得加 \`<T,>\`。
- 复用类型用 \`React.ComponentProps<typeof Comp>\`。

> *下一章，Hooks 的类型——useState、useRef 那些坑。*`,
    code: `// 🧩 React 组件 Props 类型 Demo
// 注意：本文件演示 TS 类型注解，不实际渲染（不需要 import React）
// 真实项目在 .tsx 文件里写，文件顶部可以 import React from "react"

// ============================================================
// 1️⃣ 函数组件：直接标 Props 类型（社区推荐写法）
// ============================================================

// 定义 Props 类型（type 别名更简洁，interface 也可以）
type ButtonProps = {
  label: string;                                  // 必填：按钮文字
  color?: "blue" | "red" | "gray";                // 可选：颜色，三选一
  onClick: (e: React.MouseEvent) => void;         // 必填：点击回调
  children?: React.ReactNode;                     // 可选：子节点
};

// 直接给 props 参数标类型，不套 React.FC
function Button(props: ButtonProps): React.ReactElement {
  const { label, color = "blue", onClick, children } = props;   // 解构 + 默认值
  return { type: "button", props: { label, color, onClick, children } } as any;
}

// 使用方：完整类型检查
const btn1: ButtonProps = {
  label: "提交",                                   // 必填
  color: "blue",                                  // 限定值
  onClick: (e) => console.log("clicked", e),      // 回调签名匹配
};
console.log("--- 1️⃣ 函数组件 ---");
console.log("Button props:", btn1);

// ============================================================
// 2️⃣ React.FC 与 PropsWithChildren：children 的处理
// ============================================================

// React.FC 类型：props 参数自动有类型提示
// ⚠️ React 18+ 的 FC 不再隐式包含 children，要手动加
type CardProps = {
  title: string;                                  // 标题
};

// 用 PropsWithChildren 给 Props 加上 children 字段
type CardPropsWithChildren = React.PropsWithChildren<CardProps>;
// 展开后等价于：{ title: string; children?: React.ReactNode }

const Card: React.FC<CardPropsWithChildren> = (props) => {
  // 这里 props 类型自动推导为 CardPropsWithChildren
  return { type: "card", props } as any;
};

console.log("--- 2️⃣ React.FC + PropsWithChildren ---");
const card = Card({ title: "标题", children: "内容" });
console.log("Card:", card);

// ============================================================
// 3️⃣ ReactNode vs ReactElement：children 类型选择
// ============================================================

// ReactNode：最宽松，包含 string/number/null/ReactElement 等
type ContainerProps = {
  children: React.ReactNode;                      // 接受任何可渲染内容
};

// ReactElement：严格，只接受一个 JSX 元素
type WrapperProps = {
  child: React.ReactElement;                       // 只能是 <div/> 这种
};

// 演示各种 ReactNode 合法值
const validNodes: React.ReactNode[] = [
  "字符串",                                        // 字符串是合法 ReactNode
  42,                                              // 数字也合法
  null,                                            // null 不渲染
  false,                                           // boolean 不渲染
  undefined,                                       // undefined 不渲染
  { type: "span", props: {} } as any,              // ReactElement 也合法
];

console.log("--- 3️⃣ ReactNode vs ReactElement ---");
console.log("合法的 ReactNode 数量:", validNodes.length);

// ============================================================
// 4️⃣ 泛型组件：让 Props 类型随使用方推导
// ============================================================

// 泛型函数组件：用 function 声明最直接
type ListProps<T> = {
  items: T[];                                      // 子项数组，类型由 T 决定
  render: (item: T, index: number) => React.ReactNode;  // 渲染函数
  keyExtractor?: (item: T) => string;              // 可选 key 提取器
};

function List<T>(props: ListProps<T>): React.ReactElement {
  const { items, render, keyExtractor } = props;
  return { type: "ul", props: { items, render, keyExtractor } } as any;
}

// 使用方：T 自动推导为 { id: number; name: string }
const users = [{ id: 1, name: "Tom" }, { id: 2, name: "Jerry" }];

const userList = List({
  items: users,                                    // T 推导为 { id: number; name: string }
  render: (item) => ({ type: "li", props: { text: item.name } } as any),  // item 类型自动推导
  keyExtractor: (item) => String(item.id),         // item.id 有类型提示
});

console.log("--- 4️⃣ 泛型组件 ---");
console.log("userList:", userList);

// 箭头函数写法：必须加 <T,> 防止被当成 JSX
const Grid = <T,>(props: ListProps<T>): React.ReactElement => {
  return { type: "grid", props } as any;
};

// 用 Grid 渲染数字列表
const numbers = [1, 2, 3];
const numberGrid = Grid({
  items: numbers,                                  // T 推导为 number
  render: (n) => ({ type: "cell", props: { value: n } } as any),
});

console.log("numberGrid:", numberGrid);

// ============================================================
// 5️⃣ React.ComponentProps：反查组件的 Props 类型
// ============================================================

// 假设这是一个第三方组件
type ThirdPartyButtonProps = {
  text: string;
  size: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
};
const ThirdPartyButton = (props: ThirdPartyButtonProps): React.ReactElement => {
  return { type: "third-button", props } as any;
};

// 用 ComponentProps 反查它的 Props 类型
type ExtractedProps = React.ComponentProps<typeof ThirdPartyButton>;
// ExtractedProps 等价于 ThirdPartyButtonProps

// 基于它扩展自己的 Props
type MyButtonProps = ExtractedProps & {
  loading?: boolean;                               // 加自定义字段
  theme?: "light" | "dark";                        // 主题
};

console.log("--- 5️⃣ ComponentProps ---");
const myBtn: MyButtonProps = {
  text: "保存",                                    // 来自 ThirdPartyButtonProps
  size: "md",                                      // 来自 ThirdPartyButtonProps
  loading: true,                                   // 自己扩展的
  theme: "dark",                                   // 自己扩展的
};
console.log("MyButton props:", myBtn);

// ============================================================
// 6️⃣ ComponentPropsWithoutRef：继承原生元素属性
// ============================================================

// 拿到原生 button 元素的所有属性（onClick、disabled、type 等），去掉 ref
type NativeButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "danger";                  // 扩展自定义属性
};

// 演示：原生属性 + 自定义属性都可用
const nativeBtn: NativeButtonProps = {
  type: "submit",                                  // 原生属性
  disabled: false,                                 // 原生属性
  variant: "primary",                              // 自定义属性
  onClick: () => console.log("native click"),      // 原生回调
};

console.log("--- 6️⃣ ComponentPropsWithoutRef ---");
console.log("NativeButton props:", nativeBtn);

// ============================================================
// 7️⃣ 可选 / 必填 / 默认值：解构语法
// ============================================================

type ModalProps = {
  title: string;                                   // 必填
  visible: boolean;                                // 必填
  size?: "sm" | "md" | "lg";                       // 可选
  onClose?: () => void;                            // 可选回调
  children?: React.ReactNode;                      // 可选子节点
};

function Modal(props: ModalProps): React.ReactElement {
  // 解构时给默认值：size 默认 "md"，onClose 默认空函数
  const { title, visible, size = "md", onClose = () => {}, children } = props;
  // 注意：size 类型现在是 "sm" | "md" | "lg"（不含 undefined，因为有默认值）
  return { type: "modal", props: { title, visible, size, onClose, children } } as any;
}

console.log("--- 7️⃣ 可选 / 必填 / 默认值 ---");
const modal = Modal({
  title: "确认删除",                                // 必填
  visible: true,                                   // 必填
  // size 不传，用默认值 "md"
});
console.log("Modal（size 用默认）:", modal);

// ============================================================
// 8️⃣ React.ReactNode 在数组场景
// ============================================================

// 渲染列表：children 可以是 ReactNode 数组
type ListGroupProps = {
  items: React.ReactNode[];                        // 子节点数组
  header?: React.ReactNode;                        // 头部
};

function ListGroup(props: ListGroupProps): React.ReactElement {
  return { type: "list-group", props } as any;
}

console.log("--- 8️⃣ ReactNode 数组 ---");
const group = ListGroup({
  items: [
    "第一项",                                      // 字符串节点
    { type: "span", props: { text: "第二项" } } as any,  // 元素节点
    null,                                          // 空节点
  ],
  header: "我的列表",
});
console.log("ListGroup:", group);
`,
  },

  // ===========================================================
  // 第 2 章：React Hooks 类型
  // ===========================================================
  {
    id: "tsbook-react-hooks",
    title: "React Hooks 类型",
    icon: "🪝",
    group: "React 实战",
    content: `# 🪝 React Hooks 类型

Hooks 是 React 函数组件的灵魂。给 Hooks 加上类型注解，能让状态、副作用、引用都有完整的安全网。本章覆盖 5 个最常用 Hook 的类型写法。

## 一、\`useState<T>\`：状态泛型

\`\`\`tsx
// 1. 类型能从初始值推导（最常见）
const [count, setCount] = useState(0);           // count: number
const [name, setName] = useState("Tom");         // name: string

// 2. 初始值是 null/undefined 时，必须显式标泛型
const [user, setUser] = useState<User | null>(null);   // ❌ 不标泛型会推导成 null

// 3. 复杂类型 / 联合类型：显式标
const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

// 4. 惰性初始化：初始值是函数
const [data, setData] = useState(() => loadExpensiveInitial());  // 类型从函数返回推导
\`\`\`

**最大坑**：初始值是 \`null\` 时不标泛型，\`user\` 会被推导成 \`null\` 类型——后续 \`setUser({...})\` 全部报错。**遇到 \`null\` 初始值就显式标 \`useState<T | null>(null)\`**。

## 二、\`useEffect\`：副作用，几乎不用标类型

\`useEffect\` 的回调签名是 \`EffectCallback\`，返回值是 \`void | Destructor\`（清理函数）。**99% 场景不需要手动标类型**：

\`\`\`tsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);          // 返回清理函数
}, []);                                     // 依赖数组
\`\`\`

需要标的特例：在 \`useEffect\` 里读 DOM 元素时，元素类型由 \`useRef\` 决定（见下一章）。

## 三、\`useRef<T>\`：可变 vs 不可变，两种用法

\`useRef\` 有**两种完全不同的用途**，类型注解也不同：

### 用法 1：访问 DOM 元素（不可变 ref）

\`\`\`tsx
const inputRef = useRef<HTMLInputElement>(null);   // 类型是 RefObject<HTMLInputElement | null>
// 后续 inputRef.current.focus()
\`\`\`

初始值必须是 \`null\`，泛型是元素类型。访问 \`current\` 时要判空。

### 用法 2：保存可变值（可变 ref，类似实例变量）

\`\`\`tsx
const timerRef = useRef<number | null>(null);      // 保存定时器 ID
timerRef.current = setInterval(...);               // 可以赋值
\`\`\`

初始值给一个具体值（可以是 \`null\`），泛型标你想保存的类型。**注意 \`current\` 是可变的**——这种 ref 不会触发重渲染。

> **区别**：DOM ref 的 \`current\` 由 React 设置（只读）；可变 ref 的 \`current\` 由你自己写（可写）。

## 四、\`useMemo<T>\`：缓存计算结果

\`\`\`tsx
// 类型通常从工厂函数返回值推导
const sorted = useMemo(() => items.sort(), [items]);

// 显式标泛型：返回值类型复杂时
const result = useMemo<{ total: number; items: Item[] }>(() => {
  return { total: items.length, items };
}, [items]);
\`\`\`

**陷阱**：\`useMemo\` 的依赖数组**不会被类型检查**——少写依赖 TS 不会报错。这是 React 设计上的妥协，需要靠 \`eslint-plugin-react-hooks\` 兜底。

## 五、\`useCallback\`：缓存函数引用

\`\`\`tsx
// 类型从回调函数推导
const handleClick = useCallback((e: React.MouseEvent) => {
  console.log(e.clientX);
}, []);

// 回调签名通常需要显式标事件类型
const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
}, []);
\`\`\`

\`useCallback\` 和 \`useMemo\` 的区别：
- \`useMemo\` 缓存**值**（任意返回值）
- \`useCallback\` 缓存**函数**，等价于 \`useMemo(() => fn, deps)\`

## 六、\`useReducer\`：复杂状态机

\`\`\`tsx
type State = { count: number };
type Action = { type: "inc" } | { type: "dec" } | { type: "set"; value: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    case "set": return { count: action.value };
  }
};

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: "set", value: 5 });     // ✅ 类型安全
dispatch({ type: "set" });                // ❌ 缺 value
dispatch({ type: "unknown" });            // ❌ 不在联合类型里
\`\`\`

\`useReducer\` 的类型推导链：reducer 的 \`Action\` 类型 → \`dispatch\` 的参数类型。所以**只要 reducer 标好类型，dispatch 自动有类型保护**——这是 React + TS 最香的组合之一。

## 七、自定义 Hook 的类型

\`\`\`tsx
// 自定义 Hook 就是个函数，正常标返回类型即可
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  return [on, toggle];
}

const [visible, toggleVisible] = useToggle();   // visible: boolean, toggleVisible: () => void
\`\`\`

返回数组时要标元组类型 \`[A, B]\`，否则 TS 会推导成联合类型数组。

## 八、一句话总结

- \`useState(null)\` 必须标泛型，否则推导成 \`null\`。
- \`useRef\` 两种用法：DOM ref（只读）和可变 ref（可写），类型不同。
- \`useReducer\` + 联合类型 \`Action\` 是状态机的最佳实践。
- 自定义 Hook 返回数组要标元组类型。

> *下一章，事件类型——ChangeEvent、MouseEvent 怎么找。*`,
    code: `// 🪝 React Hooks 类型 Demo
// 本文件演示 Hooks 的类型注解写法，不实际渲染

// 声明 React 命名空间类型（真实环境 import React from "react" 自带）
declare namespace React {
  interface MouseEvent<T = Element> { clientX: number; clientY: number; }
  interface ChangeEvent<T = Element> { target: { value: string; }; }
  interface KeyboardEvent<T = Element> { key: string; keyCode: number; }
  type ReactElement = { type: string; props: any };
}

// 声明 Hooks（真实环境从 react 包导入）
declare function useState<T>(initial: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
declare function useState<T>(initial: T | undefined): [T | undefined, (v: T) => void];
declare function useEffect(cb: () => void | (() => void), deps?: any[]): void;
declare function useRef<T>(initial: T): { current: T };
declare function useRef<T>(initial: T | null): { current: T | null };
declare function useMemo<T>(factory: () => T, deps: any[]): T;
declare function useCallback<T extends (...args: any[]) => any>(cb: T, deps: any[]): T;
declare function useReducer<S, A>(reducer: (s: S, a: A) => S, initial: S): [S, (a: A) => void];

// ============================================================
// 1️⃣ useState：状态泛型与各种写法
// ============================================================

console.log("--- 1️⃣ useState ---");

// 1.1 类型从初始值推导（最常见）
const [count, setCount] = useState(0);                       // count: number
console.log("count 类型:", typeof count, "值:", count);
setCount(5);                                                  // ✅ 接受 number
setCount(prev => prev + 1);                                   // ✅ 函数式更新

// 1.2 初始值是 null：必须显式标泛型
interface User {
  id: number;
  name: string;
}
const [user, setUser] = useState<User | null>(null);          // 显式标 User | null
console.log("user 初始:", user);
setUser({ id: 1, name: "Tom" });                              // ✅ 可以赋 User
// setUser({ id: 1 });                                        // ❌ 缺 name

// 1.3 联合类型状态：显式标
const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
console.log("status:", status);
setStatus("loading");                                         // ✅
// setStatus("done");                                         // ❌ 不在联合里

// 1.4 惰性初始化：初始值是函数
const [cache, setCache] = useState(() => {
  // 复杂初始化逻辑（只执行一次）
  return { data: [], timestamp: Date.now() };
});
console.log("cache:", cache);

// ============================================================
// 2️⃣ useEffect：副作用，几乎不用标类型
// ============================================================

console.log("--- 2️⃣ useEffect ---");

// 2.1 基础用法：副作用 + 清理函数
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);    // 启动定时器
  return () => clearInterval(id);                              // 返回清理函数
}, []);                                                        // 空依赖：只在 mount 时跑

// 2.2 依赖驱动
useEffect(() => {
  console.log("count 变了:", count);
}, [count]);                                                   // 依赖 count

// 2.3 异步副作用：在内部定义 async 函数
useEffect(() => {
  let cancelled = false;                                       // 取消标志
  const fetchData = async () => {
    // await fetch("/api/data");
    if (!cancelled) {
      console.log("数据加载完成");
    }
  };
  fetchData();
  return () => { cancelled = true; };                          // 清理时置标志
}, []);

// ============================================================
// 3️⃣ useRef：DOM ref vs 可变 ref
// ============================================================

console.log("--- 3️⃣ useRef ---");

// 3.1 DOM ref：访问 DOM 元素（current 由 React 设置，只读语义）
const inputRef = useRef<HTMLInputElement>(null);               // 初始 null，泛型是元素类型
// 真实场景：<input ref={inputRef} />
console.log("inputRef.current（mount 前是 null）:", inputRef.current);
// 使用时必须判空
if (inputRef.current) {
  inputRef.current.focus();                                    // 类型安全
}

// 3.2 可变 ref：保存可变值（current 可写，类似实例变量）
const timerRef = useRef<number | null>(null);                  // 保存定时器 ID
timerRef.current = setInterval(() => {}, 1000);                // 可以赋值
console.log("timerRef.current:", timerRef.current);
if (timerRef.current !== null) {
  clearInterval(timerRef.current);                             // 清理时判空
  timerRef.current = null;                                     // 重置
}

// 3.3 用 useRef 保存"上一次的值"
const prevCountRef = useRef<number>(0);                        // 保存上一次的 count
prevCountRef.current = count;                                  // 每次渲染后更新
console.log("prevCountRef:", prevCountRef.current);

// ============================================================
// 4️⃣ useMemo：缓存计算结果
// ============================================================

console.log("--- 4️⃣ useMemo ---");

// 4.1 类型从工厂函数推导
const items = [3, 1, 4, 1, 5, 9, 2, 6];
const sorted = useMemo(() => {
  return [...items].sort((a, b) => a - b);                     // 返回 number[]
}, [items]);                                                   // 依赖 items
console.log("sorted:", sorted);

// 4.2 复杂返回类型：显式标泛型
interface Stats {
  total: number;
  average: number;
  max: number;
}
const stats = useMemo<Stats>(() => {
  const total = items.reduce((a, b) => a + b, 0);
  return {
    total,                                                     // 总和
    average: total / items.length,                             // 平均值
    max: Math.max(...items),                                   // 最大值
  };
}, [items]);
console.log("stats:", stats);

// 4.3 缓存对象引用（避免不必要的子组件重渲染）
const config = useMemo(() => ({
  headers: { "Content-Type": "application/json" },             // HTTP 头
  timeout: 5000,                                               // 超时
}), []);                                                       // 空依赖：只创建一次
console.log("config 引用稳定:", config);

// ============================================================
// 5️⃣ useCallback：缓存函数引用
// ============================================================

console.log("--- 5️⃣ useCallback ---");

// 5.1 回调签名通常需要显式标事件类型
const handleClick = useCallback((e: React.MouseEvent) => {
  console.log("点击坐标:", e.clientX, e.clientY);              // 鼠标事件
}, []);                                                        // 空依赖：函数引用稳定

const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  console.log("输入值:", e.target.value);                      // 输入框变化
}, []);

// 5.2 依赖驱动：函数随依赖变化
const [query, setQuery] = useState("");
const handleSearch = useCallback((q: string) => {
  console.log("搜索:", q);
}, [query]);                                                   // 依赖 query

// 5.3 useCallback 等价于 useMemo(() => fn, deps)
const fn1 = useCallback(() => console.log("hi"), []);
const fn2 = useMemo(() => () => console.log("hi"), []);        // 完全等价

console.log("handleClick 引用稳定:", typeof handleClick === "function");

// ============================================================
// 6️⃣ useReducer：复杂状态机（Action 联合类型）
// ============================================================

console.log("--- 6️⃣ useReducer ---");

// 6.1 定义 State 和 Action 联合类型
interface CounterState {
  count: number;                                               // 当前值
  history: number[];                                           // 历史记录
}

type CounterAction =
  | { type: "inc" }                                            // 自增
  | { type: "dec" }                                            // 自减
  | { type: "set"; value: number }                             // 设置值
  | { type: "reset" };                                         // 重置

// 6.2 reducer 函数：标好 State 和 Action 类型
const counterReducer = (
  state: CounterState,
  action: CounterAction
): CounterState => {
  switch (action.type) {
    case "inc":
      return { count: state.count + 1, history: [...state.history, state.count] };
    case "dec":
      return { count: state.count - 1, history: [...state.history, state.count] };
    case "set":
      return { count: action.value, history: [...state.history, state.count] };
    case "reset":
      return { count: 0, history: [] };
  }
};

// 6.3 useReducer 自动从 reducer 推导 State 和 Action 类型
const [counterState, dispatch] = useReducer(counterReducer, { count: 0, history: [] });

// dispatch 有完整类型保护
dispatch({ type: "inc" });                                     // ✅
dispatch({ type: "set", value: 10 });                          // ✅
dispatch({ type: "reset" });                                   // ✅
// dispatch({ type: "set" });                                  // ❌ 缺 value
// dispatch({ type: "unknown" });                              // ❌ 不在联合里

console.log("counterState:", counterState);

// ============================================================
// 7️⃣ 自定义 Hook：返回元组类型
// ============================================================

console.log("--- 7️⃣ 自定义 Hook ---");

// 7.1 useToggle：返回 [boolean, () => void] 元组
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [on, setOn] = useState<boolean>(initial);              // 状态
  const toggle = useCallback(() => {
    setOn(prev => !prev);                                      // 切换
  }, []);                                                      // 空依赖
  return [on, toggle];                                         // 返回元组
}

const [visible, toggleVisible] = useToggle(false);             // visible: boolean
console.log("visible 初始:", visible);
toggleVisible();                                               // 切换为 true
console.log("visible 类型:", typeof visible);

// 7.2 usePrevious：保存上一次的值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);                // 可变 ref 保存旧值
  useEffect(() => {
    ref.current = value;                                       // 渲染后更新
  }, [value]);                                                 // 依赖 value
  return ref.current;                                          // 返回旧值
}

const prev = usePrevious(count);                               // prev: number | undefined
console.log("usePrevious 返回:", prev);
`,
  },

  // ===========================================================
  // 第 3 章：React 事件类型
  // ===========================================================
  {
    id: "tsbook-react-event",
    title: "React 事件类型",
    icon: "⚡",
    group: "React 实战",
    content: `# ⚡ React 事件类型

React 用自己的**合成事件**（SyntheticEvent）包裹原生事件，统一了浏览器差异。给事件处理器标对类型，是 React + TS 的基本功。

## 一、事件类型怎么找：从 JSX 推导

**最实用的技巧**：在 JSX 里写 \`onChange={(e) => }\`，把光标停在 \`e\` 上，IDE 会告诉你它是什么类型。这就是事件类型的来源——**由 JSX 属性签名决定**。

\`\`\`tsx
<input onChange={(e) => { /* e 是 ChangeEvent<HTMLInputElement> */ }} />
<button onClick={(e) => { /* e 是 MouseEvent<HTMLButtonElement> */ }} />
<form onSubmit={(e) => { /* e 是 FormEvent<HTMLFormElement> */ }} />
\`\`\`

不用死记，让 IDE 帮你推导。但理解每种事件的用途能少走弯路。

## 二、常用事件类型速查

| 事件类型 | 触发场景 | 关键属性 |
|---------|---------|---------|
| \`ChangeEvent<T>\` | input/select/textarea 值变化 | \`e.target.value\` |
| \`MouseEvent<T>\` | 鼠标点击/悬停 | \`e.clientX\`、\`e.clientY\` |
| \`KeyboardEvent<T>\` | 键盘按键 | \`e.key\`、\`e.keyCode\` |
| \`FormEvent<T>\` | 表单提交 | \`e.preventDefault()\` |
| \`FocusEvent<T>\` | 焦点变化 | \`e.target\`、\`e.relatedTarget\` |
| \`SyntheticEvent\` | 所有事件的基类 | \`e.target\`、\`e.currentTarget\` |

**泛型参数 \`T\`** 是事件目标的元素类型，比如 \`ChangeEvent<HTMLInputElement>\` 表示"输入框的值变化事件"。

## 三、\`ChangeEvent\`：表单输入

\`\`\`tsx
const [value, setValue] = useState("");

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);           // value 是 string
};

<input value={value} onChange={handleChange} />
\`\`\`

不同表单元素的 \`value\` 类型不同：
- \`HTMLInputElement\`：文本框，\`value: string\`
- \`HTMLSelectElement\`：下拉框，\`value: string\`
- \`HTMLTextAreaElement\`：文本域，\`value: string\`
- \`HTMLInputElement\`（checkbox）：\`checked: boolean\`

\`\`\`tsx
const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.checked);     // 复选框用 checked
};
\`\`\`

## 四、\`MouseEvent\`：鼠标事件

\`\`\`tsx
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.clientX, e.clientY);  // 相对视口的坐标
  console.log(e.target);              // 触发事件的元素
  console.log(e.currentTarget);       // 绑定事件的元素
};

<button onClick={handleClick}>点我</button>
\`\`\`

**\`e.target\` vs \`e.currentTarget\`**：
- \`target\`：实际触发事件的元素（可能是子元素，事件冒泡）
- \`currentTarget\`：绑定事件处理器的元素（就是你写 \`onClick\` 的那个）

## 五、\`KeyboardEvent\`：键盘事件

\`\`\`tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {            // 用 e.key 最直观
    submit();
  }
  if (e.key === "Escape") {
    cancel();
  }
};

<input onKeyDown={handleKeyDown} />
\`\`\`

**\`e.key\` vs \`e.keyCode\`**：
- \`e.key\`：字符串，如 \`"Enter"\`、\`"Escape"\`、\`"a"\`（推荐，直观）
- \`e.keyCode\`：数字，如 \`13\`（已废弃，不推荐）

## 六、\`FormEvent\`：表单提交

\`\`\`tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();                 // 阻止默认提交（刷新页面）
  // 用 FormData 收集表单数据
  const formData = new FormData(e.currentTarget);
  console.log(formData.get("username"));
};

<form onSubmit={handleSubmit}>
  <input name="username" />
  <button type="submit">提交</button>
</form>
\`\`\`

\`e.preventDefault()\` 是 React 表单的标配——否则点击提交按钮会触发浏览器默认行为（刷新页面）。

## 七、事件处理器作为 Props

\`\`\`tsx
type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  // 事件作为 Props
};

function Input({ value, onChange }: InputProps) {
  return <input value={value} onChange={onChange} />;
}
\`\`\`

**复用类型技巧**：用 \`React.ComponentProps\` 反查原生元素的事件类型：

\`\`\`tsx
// 直接拿到 input 的 onChange 类型
type InputOnChange = React.ComponentProps<"input">["onChange"];
// 等价于 (e: ChangeEvent<HTMLInputElement>) => void
\`\`\`

## 八、事件冒泡与阻止

\`\`\`tsx
const handleOuterClick = (e: React.MouseEvent) => {
  console.log("外层被点");
};

const handleInnerClick = (e: React.MouseEvent) => {
  e.stopPropagation();                // 阻止冒泡到外层
  console.log("内层被点");
};

<div onClick={handleOuterClick}>
  <button onClick={handleInnerClick}>内层</button>
</div>
\`\`\`

常用方法：
- \`e.preventDefault()\`：阻止默认行为（如表单提交、链接跳转）
- \`e.stopPropagation()\`：阻止事件冒泡

## 九、一句话总结

- 事件类型不用死记——**写 JSX 让 IDE 推导**。
- 表单用 \`ChangeEvent<T>\`，鼠标用 \`MouseEvent<T>\`，键盘用 \`KeyboardEvent<T>\`，提交用 \`FormEvent<T>\`。
- \`e.target\` 是触发元素，\`e.currentTarget\` 是绑定元素。
- \`e.preventDefault()\` 阻止默认行为，\`e.stopPropagation()\` 阻止冒泡。

> *下一章，Context 与 Reducer——全局状态怎么标类型。*`,
    code: `// ⚡ React 事件类型 Demo
// 本文件演示事件处理器的类型注解写法

// 声明 React 命名空间（真实环境 import React from "react" 自带）
declare namespace React {
  // 合成事件基类
  interface SyntheticEvent<T = Element> {
    target: EventTarget;
    currentTarget: T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  // ChangeEvent：表单值变化
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: { value: string; checked?: boolean; name?: string };
  }
  // MouseEvent：鼠标事件
  interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    clientX: number;
    clientY: number;
    button: number;
  }
  // KeyboardEvent：键盘事件
  interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    key: string;
    keyCode: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
  }
  // FormEvent：表单提交
  interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  // 元素类型
  interface HTMLInputElement extends Element { value: string; checked: boolean; }
  interface HTMLButtonElement extends Element {}
  interface HTMLFormElement extends Element {}
  interface HTMLSelectElement extends Element { value: string; }
  interface HTMLDivElement extends Element {}
  interface Element {}
  interface EventTarget {}
  type ReactElement = { type: string; props: any };
  interface FormData {
    get(name: string): string | null;
    append(name: string, value: string): void;
  }
}

// ============================================================
// 1️⃣ ChangeEvent：表单输入事件
// ============================================================

console.log("--- 1️⃣ ChangeEvent ---");

// 1.1 文本输入框
type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Input(props: InputProps): React.ReactElement {
  return { type: "input", props } as any;                     // 模拟返回元素
}

const [text, setText] = (() => {
  let v = "";
  return [() => v, (nv: string) => { v = nv; }] as const;
})();

const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setText(e.target.value);                                    // value 是 string
  console.log("  输入:", e.target.value);
};

// 模拟事件触发
const fakeEvent = { target: { value: "hello" } } as any;
handleTextChange(fakeEvent);
console.log("当前文本:", text());

// 1.2 复选框：用 checked
const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log("  复选框:", e.target.checked);                // 复选框用 checked
};
handleCheckChange({ target: { value: "", checked: true } } as any);

// 1.3 下拉框：用 HTMLSelectElement
const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  console.log("  选中:", e.target.value);
};
handleSelectChange({ target: { value: "apple" } } as any);

// ============================================================
// 2️⃣ MouseEvent：鼠标事件
// ============================================================

console.log("--- 2️⃣ MouseEvent ---");

// 2.1 按钮点击
const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log("  点击坐标:", e.clientX, e.clientY);           // 相对视口
  console.log("  按键:", e.button);                           // 0=左键，1=中键，2=右键
};

handleButtonClick({ clientX: 100, clientY: 200, button: 0, target: {}, currentTarget: {} } as any);

// 2.2 区分 target 和 currentTarget
const handleDivClick = (e: React.MouseEvent<HTMLDivElement>) => {
  // target：实际触发事件的元素（可能是子元素，事件冒泡）
  console.log("  target:", typeof e.target);
  // currentTarget：绑定事件处理器的元素（就是写 onClick 的那个）
  console.log("  currentTarget:", typeof e.currentTarget);
};

handleDivClick({ target: {}, currentTarget: {}, clientX: 0, clientY: 0 } as any);

// 2.3 鼠标事件作为 Props
type ButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
};

function MyButton({ onClick, children }: ButtonProps): React.ReactElement {
  return { type: "button", props: { onClick, children } } as any;
}

// ============================================================
// 3️⃣ KeyboardEvent：键盘事件
// ============================================================

console.log("--- 3️⃣ KeyboardEvent ---");

// 3.1 用 e.key 判断按键（推荐，直观）
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    console.log("  按下 Enter，提交表单");
  } else if (e.key === "Escape") {
    console.log("  按下 Esc，取消编辑");
  } else if (e.key === "Tab") {
    console.log("  按下 Tab，切换焦点");
  }

  // 组合键判断
  if (e.ctrlKey && e.key === "s") {
    console.log("  Ctrl+S，保存");
  }
};

// 模拟 Enter 键
handleKeyDown({ key: "Enter", keyCode: 13, ctrlKey: false, target: {}, currentTarget: {} } as any);
// 模拟 Ctrl+S
handleKeyDown({ key: "s", keyCode: 83, ctrlKey: true, target: {}, currentTarget: {} } as any);

// 3.2 e.key vs e.keyCode 对比
console.log("  e.key（推荐）：字符串，如 'Enter'、'Escape'");
console.log("  e.keyCode（已废弃）：数字，如 13、27");

// ============================================================
// 4️⃣ FormEvent：表单提交
// ============================================================

console.log("--- 4️⃣ FormEvent ---");

// 4.1 表单提交：阻止默认行为 + 收集数据
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();                                         // 阻止页面刷新
  console.log("  阻止默认提交");

  // 用 FormData 收集表单数据
  const formData: React.FormData = {
    get: (name: string) => {
      const map: Record<string, string> = { username: "Tom", password: "123456" };
      return map[name] || null;
    },
    append: () => {},
  } as any;

  console.log("  username:", formData.get("username"));
  console.log("  password:", formData.get("password"));
};

// 模拟表单提交
handleSubmit({ preventDefault: () => {}, target: {}, currentTarget: {} } as any);

// 4.2 表单组件 Props
type FormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
};

function Form({ onSubmit, children }: FormProps): React.ReactElement {
  return { type: "form", props: { onSubmit, children } } as any;
}

// ============================================================
// 5️⃣ 事件冒泡与阻止
// ============================================================

console.log("--- 5️⃣ 事件冒泡与阻止 ---");

// 5.1 阻止冒泡：stopPropagation
const handleOuterClick = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log("  外层被点（如果没阻止冒泡）");
};

const handleInnerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();                                        // 阻止冒泡到外层
  console.log("  内层被点（已阻止冒泡）");
};

// 模拟点击内层
handleInnerClick({ stopPropagation: () => console.log("  [调用 stopPropagation]"), target: {}, currentTarget: {}, clientX: 0, clientY: 0 } as any);

// 5.2 阻止默认行为：preventDefault
const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();                                         // 阻止链接跳转
  console.log("  链接点击已拦截，做 SPA 路由跳转");
};

declare interface HTMLAnchorElement {}
handleLinkClick({ preventDefault: () => console.log("  [调用 preventDefault]"), target: {}, currentTarget: {}, clientX: 0, clientY: 0 } as any);

// ============================================================
// 6️⃣ 复用类型：ComponentProps 反查事件类型
// ============================================================

console.log("--- 6️⃣ ComponentProps 反查事件类型 ---");

// 直接拿到 input 的 onChange 类型签名
type InputOnChange = React.ComponentProps<"input">["onChange"];
// 等价于 (e: ChangeEvent<HTMLInputElement>) => void

// 直接拿到 button 的 onClick 类型签名
type ButtonOnClick = React.ComponentProps<"button">["onClick"];
// 等价于 (e: MouseEvent<HTMLButtonElement>) => void

// 在自定义组件里复用
type MyInputProps = {
  value: string;
  onChange: InputOnChange;                                    // 复用原生 onChange 类型
};

console.log("ComponentProps<typeof 'input'>['onChange'] =", "ChangeEvent<HTMLInputElement> => void");

// ============================================================
// 7️⃣ 焦点事件：FocusEvent
// ============================================================

console.log("--- 7️⃣ FocusEvent ---");

// declare 已经在 React 命名空间外，这里补充声明
interface FocusEvent<T = Element> extends React.SyntheticEvent<T> {
  relatedTarget: EventTarget | null;                          // 上一个/下一个焦点元素
}

const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
  console.log("  获得焦点");
};

const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
  console.log("  失去焦点");
};

handleFocus({ target: {}, currentTarget: {}, relatedTarget: null } as any);
handleBlur({ target: {}, currentTarget: {}, relatedTarget: null } as any);

// ============================================================
// 8️⃣ 综合示例：登录表单
// ============================================================

console.log("--- 8️⃣ 综合示例：登录表单 ---");

type LoginFormProps = {
  onSubmit: (username: string, password: string) => void;
};

function LoginForm(props: LoginFormProps): React.ReactElement {
  // 内部状态（模拟）
  let username = "";
  let password = "";

  // 输入框事件
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    username = e.target.value;                                // 实时更新
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    password = e.target.value;
  };

  // 表单提交事件
  const handleSubmitInner = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();                                       // 阻止默认提交
    props.onSubmit(username, password);                       // 调用父组件回调
  };

  return { type: "form", props: { handleSubmitInner, handleUsernameChange, handlePasswordChange } } as any;
}

const loginForm = LoginForm({
  onSubmit: (u, p) => console.log("  提交：", u, "/", p),
});

console.log("  LoginForm 已构造，事件处理器类型完整");
`,
  },

  // ===========================================================
  // 第 4 章：Context 与 Reducer 类型
  // ===========================================================
  {
    id: "tsbook-react-context",
    title: "Context 与 Reducer 类型",
    icon: "🌐",
    group: "React 实战",
    content: `# 🌐 Context 与 Reducer 类型

Context 是 React 跨组件传值的标准方案；\`useReducer\` 是管理复杂状态的利器。两者结合能优雅地实现全局状态管理。本章讲清楚类型怎么标——尤其是 **Context 默认值 \`undefined\` 的处理**这个经典坑。

## 一、\`createContext\` 的类型

\`\`\`tsx
type Theme = "light" | "dark";
const ThemeContext = createContext<Theme>("light");   // 标泛型 + 给默认值
\`\`\`

\`createContext<T>(defaultValue)\` 的泛型 \`T\` 决定 Context 值的类型。默认值必须满足 \`T\`——这是基础场景。

## 二、经典坑：默认值 \`undefined\`

很多场景下 Context 的真实值由 Provider 在运行时提供，**创建时根本没有合理的默认值**。常见错误写法：

\`\`\`tsx
// ❌ 坑 1：默认值给一个"假"的初始值
const UserContext = createContext<User>({ id: 0, name: "" });   // 假数据
// 后续 useContext 拿到假数据，没报错但逻辑错乱

// ❌ 坑 2：标 undefined 但默认值给对象
const UserContext = createContext<User | undefined>(undefined);
// 类型上允许 undefined，但调用方很容易忘了判空
\`\`\`

**推荐写法：默认值 \`undefined\` + 自定义 Hook 强制判空**：

\`\`\`tsx
type User = { id: number; name: string };

// 1. 创建 Context：类型 User | undefined，默认值 undefined
const UserContext = createContext<User | undefined>(undefined);

// 2. Provider 组件：保证一定有值
function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({ id: 1, name: "Tom" });
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// 3. 自定义 Hook：消费时强制判空，没在 Provider 内直接报错
function useUser(): User {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error("useUser 必须在 <UserProvider> 内使用");
  }
  return ctx;
}

// 使用方
function Profile() {
  const user = useUser();          // 类型是 User（不是 User | undefined）
  return <div>{user.name}</div>;   // ✅ 直接用，不用判空
}
\`\`\`

**这套模式的优势**：
1. 创建时不用编造假默认值
2. 消费方拿到的类型是 \`User\`（已收窄），不用每次判空
3. 漏用 Provider 时有明确报错，而不是静默拿到假数据

## 三、\`useReducer\` 配合 Context：全局状态机

\`useReducer\` + Context 是 React 官方推荐的轻量状态管理方案。类型写法：

\`\`\`tsx
// 1. 定义 State 和 Action 联合类型
type State = { user: User | null; loading: boolean };
type Action =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; loading: boolean };

// 2. reducer 函数：标好 State 和 Action
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN": return { ...state, user: action.user, loading: false };
    case "LOGOUT": return { ...state, user: null };
    case "SET_LOADING": return { ...state, loading: action.loading };
  }
}

// 3. Context 暴露 [state, dispatch] 元组
type AuthContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;        // dispatch 的标准类型
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: false });
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 <AuthProvider> 内使用");
  return ctx;
}
\`\`\`

\`React.Dispatch<Action>\` 是 React 给 \`dispatch\` 函数的标准类型——等价于 \`(action: Action) => void\`。

## 四、Provider Props 的标准写法

\`\`\`tsx
type ProviderProps = {
  children: React.ReactNode;            // 必须有 children
  initialUser?: User;                   // 可选初始值
};

function UserProvider({ children, initialUser }: ProviderProps) {
  // ...
}
\`\`\`

\`children\` 是 Provider 的标配——别忘了加，否则外部包不住子组件。

## 五、多个 Context 的组合

\`\`\`tsx
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
\`\`\`

多个 Provider 嵌套是常态。**顺序无所谓**（Context 之间独立），但通常把更"基础"的（如 Theme）放外层，更"业务"的（如 User）放内层。

## 六、Context 性能优化提示

Context 值变化会让**所有消费方重渲染**——即使消费方只用了值的一部分。优化思路：

1. **拆分 Context**：把频繁变化的（如 \`user\`）和不频繁的（如 \`theme\`）拆开。
2. **用 \`useMemo\` 包 value**：避免每次 Provider 重渲染时 value 引用变化。

\`\`\`tsx
const value = useMemo(() => ({ state, dispatch }), [state]);
<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
\`\`\`

## 七、一句话总结

- Context 默认值 \`undefined\` + 自定义 Hook 强制判空，是社区最佳实践。
- \`useReducer\` + Context 是轻量状态管理方案，\`Action\` 用联合类型保证类型安全。
- \`dispatch\` 用 \`React.Dispatch<Action>\` 标类型。
- Provider 必须有 \`children\`，value 用 \`useMemo\` 包避免不必要重渲染。

> *下一章，ref 与 forwardRef——把 DOM 句柄交给父组件。*`,
    code: `// 🌐 Context 与 Reducer 类型 Demo
// 本文件演示 Context + useReducer 的类型写法

// 声明 React 命名空间（真实环境 import React from "react" 自带）
declare namespace React {
  interface ReactElement { type: string; props: any; }
  interface ReactNode {}
  type Dispatch<A> = (action: A) => void;                     // dispatch 标准类型
  type Reducer<S, A> = (state: S, action: A) => S;            // reducer 标准类型
  type ProviderProps<T> = { value: T; children?: ReactNode };
}

// 声明 Hooks（真实环境从 react 包导入）
declare function useState<T>(initial: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];
declare function useReducer<S, A>(reducer: React.Reducer<S, A>, initial: S): [S, React.Dispatch<A>];
declare function useContext<T>(ctx: { defaultValue: T }): T;
declare function useMemo<T>(factory: () => T, deps: any[]): T;

// 声明 createContext（真实环境从 react 包导入）
declare function createContext<T>(defaultValue: T): {
  defaultValue: T;
  Provider: (props: React.ProviderProps<T>) => React.ReactElement;
};

// ============================================================
// 1️⃣ 基础 Context：theme 主题
// ============================================================

console.log("--- 1️⃣ 基础 Context ---");

// 1.1 定义值类型
type Theme = "light" | "dark";

// 1.2 创建 Context：标泛型 + 给默认值
const ThemeContext = createContext<Theme>("light");           // 默认 "light"
console.log("ThemeContext 默认值:", ThemeContext.defaultValue);

// 1.3 消费 Context
function useTheme(): Theme {
  return useContext(ThemeContext);                            // 返回 Theme
}

const currentTheme = useTheme();
console.log("当前主题:", currentTheme);

// ============================================================
// 2️⃣ 经典坑：默认值 undefined 的处理
// ============================================================

console.log("--- 2️⃣ 默认值 undefined 模式 ---");

// 2.1 定义 User 类型
interface User {
  id: number;
  name: string;
  email: string;
}

// 2.2 创建 Context：类型 User | undefined，默认值 undefined
const UserContext = createContext<User | undefined>(undefined);
console.log("UserContext 默认值:", UserContext.defaultValue);

// 2.3 自定义 Hook：消费时强制判空
function useUser(): User {
  const ctx = useContext(UserContext);                        // ctx: User | undefined
  if (ctx === undefined) {
    throw new Error("useUser 必须在 <UserProvider> 内使用");  // 没在 Provider 内直接报错
  }
  return ctx;                                                  // 返回 User（已收窄）
}

// 2.4 模拟 Provider 内消费
// 真实场景：<UserProvider><Profile /></UserProvider>
function Profile(): React.ReactElement {
  const user = useUser();                                      // 类型是 User，不用判空
  return { type: "div", props: { text: user.name } } as any;   // ✅ 直接用
}

// 模拟有 Provider 的情况
const fakeUserContext = createContext<User | undefined>(undefined);
// useUser 内部会从 useContext 拿到值
console.log("Profile 组件定义完成，useUser 强制判空");

// ============================================================
// 3️⃣ useReducer + Context：登录状态机
// ============================================================

console.log("--- 3️⃣ useReducer + Context ---");

// 3.1 定义 State
interface AuthState {
  user: User | null;                                           // 当前用户，未登录为 null
  loading: boolean;                                            // 加载中标志
  error: string | null;                                        // 错误信息
}

// 3.2 定义 Action 联合类型（关键：每个 action 自带所需字段）
type AuthAction =
  | { type: "LOGIN_START" }                                    // 开始登录
  | { type: "LOGIN_SUCCESS"; user: User }                      // 登录成功
  | { type: "LOGIN_FAILURE"; error: string }                   // 登录失败
  | { type: "LOGOUT" };                                        // 登出

// 3.3 reducer 函数：标好 State 和 Action
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };         // 开始加载，清空错误
    case "LOGIN_SUCCESS":
      return { user: action.user, loading: false, error: null };  // 登录成功
    case "LOGIN_FAILURE":
      return { ...state, loading: false, error: action.error };  // 登录失败
    case "LOGOUT":
      return { user: null, loading: false, error: null };      // 登出重置
  }
}

// 3.4 Context 暴露 [state, dispatch] 元组
type AuthContextValue = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;                       // dispatch 标准类型
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 3.5 Provider 组件：用 useReducer 初始化
function AuthProvider(): { state: AuthState; dispatch: React.Dispatch<AuthAction> } {
  const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
  };
  const [state, dispatch] = useReducer(authReducer, initialState);
  return { state, dispatch };
}

// 3.6 自定义 Hook：强制判空
function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);                        // ctx: AuthContextValue | undefined
  if (ctx === undefined) {
    throw new Error("useAuth 必须在 <AuthProvider> 内使用");
  }
  return ctx;                                                  // 返回 AuthContextValue
}

// ============================================================
// 4️⃣ 模拟 dispatch 调用：类型安全
// ============================================================

console.log("--- 4️⃣ dispatch 类型安全 ---");

// 模拟 reducer 调用，验证类型
const initState: AuthState = { user: null, loading: false, error: null };

// dispatch 各种 action：类型完全安全
let state = initState;
state = authReducer(state, { type: "LOGIN_START" });          // ✅
console.log("LOGIN_START:", state);

state = authReducer(state, {
  type: "LOGIN_SUCCESS",
  user: { id: 1, name: "Tom", email: "tom@test.com" },        // 必须带 user
});
console.log("LOGIN_SUCCESS:", state);

state = authReducer(state, { type: "LOGOUT" });               // ✅
console.log("LOGOUT:", state);

// ❌ 这些会报错（注释掉演示）：
// authReducer(state, { type: "LOGIN_SUCCESS" });             // 缺 user
// authReducer(state, { type: "LOGIN_FAILURE" });             // 缺 error
// authReducer(state, { type: "UNKNOWN" });                   // 不在联合里

console.log("dispatch 类型保护生效：少字段、错 type 都会编译报错");

// ============================================================
// 5️⃣ Provider Props 的标准写法
// ============================================================

console.log("--- 5️⃣ Provider Props ---");

type UserProviderProps = {
  children: React.ReactNode;                                  // 必须有 children
  initialUser?: User;                                         // 可选初始用户
};

function UserProvider(props: UserProviderProps): { user: User | null; setUser: (u: User | null) => void } {
  // 用 initialUser 作为初始值（没传则 null）
  const [user, setUser] = useState<User | null>(props.initialUser ?? null);
  return { user, setUser };
}

// 演示：传入 initialUser
const provider1 = UserProvider({
  children: {} as React.ReactNode,
  initialUser: { id: 1, name: "Tom", email: "tom@test.com" },
});
console.log("UserProvider（带初始值）:", provider1);

// 演示：不传 initialUser
const provider2 = UserProvider({
  children: {} as React.ReactNode,
});
console.log("UserProvider（无初始值）:", provider2);

// ============================================================
// 6️⃣ value 用 useMemo 包：避免不必要重渲染
// ============================================================

console.log("--- 6️⃣ useMemo 优化 value ---");

// 真实场景：
//   const value = useMemo(() => ({ state, dispatch }), [state]);
//   <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
//
// 不用 useMemo 的话，每次 Provider 重渲染，value 都是新对象引用，
// 所有消费方都会重渲染——即使 state 没变。

const stateForMemo: AuthState = { user: null, loading: false, error: null };
const dispatchForMemo: React.Dispatch<AuthAction> = (a: AuthAction) => {
  console.log("  dispatch:", a.type);
};

// 用 useMemo 包 value：state 不变时 value 引用稳定
const value = useMemo<AuthContextValue>(() => {
  return { state: stateForMemo, dispatch: dispatchForMemo };   // 包成对象
}, [stateForMemo, dispatchForMemo]);                           // 依赖

console.log("useMemo value 引用稳定:", value === value);        // 同一次渲染引用相同

// ============================================================
// 7️⃣ 多个 Context 嵌套
// ============================================================

console.log("--- 7️⃣ 多个 Context 嵌套 ---");

// 真实场景：
//   <ThemeProvider>
//     <AuthProvider>
//       <UserProvider>
//         <App />
//       </UserProvider>
//     </AuthProvider>
//   </ThemeProvider>
//
// 顺序无所谓（Context 之间独立），但通常：
// - 基础设施（Theme、I18n）放外层
// - 业务状态（Auth、User）放内层

console.log("ThemeProvider > AuthProvider > UserProvider 嵌套结构");
console.log("每个 Context 独立，消费方按需 useContext");

// ============================================================
// 8️⃣ 综合示例：useAuth 的使用
// ============================================================

console.log("--- 8️⃣ 综合示例：useAuth ---");

// 模拟一个使用 useAuth 的组件
function LoginPage(): React.ReactElement {
  // 真实场景：const { state, dispatch } = useAuth();
  const { state, dispatch } = {
    state: { user: null, loading: false, error: null } as AuthState,
    dispatch: ((a: AuthAction) => {
      console.log("  dispatch:", a.type);
    }) as React.Dispatch<AuthAction>,
  };

  const handleLogin = () => {
    dispatch({ type: "LOGIN_START" });                        // 开始登录
    // 模拟异步登录
    setTimeout(() => {
      dispatch({
        type: "LOGIN_SUCCESS",
        user: { id: 1, name: "Tom", email: "tom@test.com" },
      });
    }, 100);
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });                             // 登出
  };

  console.log("  当前状态:", state);

  return { type: "div", props: { handleLogin, handleLogout } } as any;
}

LoginPage();
`,
  },

  // ===========================================================
  // 第 5 章：ref 与 forwardRef 类型
  // ===========================================================
  {
    id: "tsbook-react-ref",
    title: "ref 与 forwardRef 类型",
    icon: "🎯",
    group: "React 实战",
    content: `# 🎯 ref 与 forwardRef 类型

\`ref\` 是 React 的"逃生舱"——直接操作 DOM 或保存可变值。\`forwardRef\` 让父组件能拿到子组件的 DOM 句柄；\`useImperativeHandle\` 则能控制暴露哪些方法。三者类型怎么标，是本章重点。

## 一、\`useRef\` 的两种用法回顾

\`\`\`tsx
// 用法 1：DOM ref（只读，由 React 设置 current）
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
// 后续 inputRef.current?.focus()

// 用法 2：可变 ref（可写，自己保存值）
const timerRef = useRef<number | null>(null);
timerRef.current = setInterval(...);
\`\`\`

DOM ref 的泛型是元素类型（\`HTMLInputElement\`、\`HTMLDivElement\` 等），可变 ref 的泛型是你要保存的值类型。

## 二、\`forwardRef\`：把 ref 透传给子组件

默认情况下，函数组件**不能接收 \`ref\` props**——因为 \`ref\` 是 React 的保留字。要让父组件能传 \`ref\` 拿到子组件的 DOM，必须用 \`forwardRef\` 包裹：

\`\`\`tsx
const MyInput = forwardRef<HTMLInputElement, MyInputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);

// 父组件
const inputRef = useRef<HTMLInputElement>(null);
<MyInput ref={inputRef} placeholder="输入" />
\`\`\`

### forwardRef 的泛型顺序：\`<RefType, PropsType>\`

**这是最容易搞错的点**——\`forwardRef\` 的泛型顺序是 **先 ref 类型，再 props 类型**：

\`\`\`tsx
forwardRef<RefType, PropsType>(...)
//         ↑          ↑
//         ref 的类型  props 的类型
\`\`\`

记法：**"ref 在前，props 在后"**——因为函数签名是 \`(props, ref) => ...\`，但泛型顺序相反（这确实是反直觉的设计）。

### RefType 怎么确定

- 透传给原生 DOM：\`HTMLInputElement\`、\`HTMLButtonElement\` 等
- 不透传 DOM，只暴露方法：自定义接口类型（见下一节）

## 三、\`useImperativeHandle\`：暴露自定义方法

\`forwardRef\` 默认把整个 DOM 元素交给父组件。但很多时候你想**只暴露几个方法**，而不是整个 DOM——这时用 \`useImperativeHandle\`：

\`\`\`tsx
// 1. 定义暴露给父组件的接口
interface InputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const MyInput = forwardRef<InputHandle, MyInputProps>((props, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);

  // 2. useImperativeHandle：定义暴露哪些方法
  useImperativeHandle(ref, () => ({
    focus: () => internalRef.current?.focus(),
    clear: () => {
      if (internalRef.current) internalRef.current.value = "";
    },
    getValue: () => internalRef.current?.value ?? "",
  }));

  return <input ref={internalRef} />;
});

// 父组件
const inputRef = useRef<InputHandle>(null);
<MyInput ref={inputRef} />
<button onClick={() => inputRef.current?.focus()}>聚焦</button>
<button onClick={() => inputRef.current?.clear()}>清空</button>
\`\`\`

**关键点**：
1. \`forwardRef\` 的泛型 \`RefType\` 是 \`InputHandle\`（接口类型），不是 \`HTMLInputElement\`
2. \`useImperativeHandle\` 的第二个参数返回一个对象，必须满足 \`InputHandle\` 接口
3. 父组件的 \`ref\` 类型也是 \`InputHandle\`

## 四、\`useImperativeHandle\` 的依赖数组

\`\`\`tsx
useImperativeHandle(ref, () => ({
  focus: () => internalRef.current?.focus(),
}), []);                              // 依赖数组
\`\`\`

依赖数组的含义和 \`useEffect\` 一样——依赖变化时重新创建暴露的对象。**通常传 \`[]\`**（暴露的方法只依赖 internalRef，不需要重新创建）。

## 五、ref 回调函数

除了传 \`ref\` 对象，还可以传**回调函数**：

\`\`\`tsx
const handleRef = (node: HTMLInputElement | null) => {
  if (node) {
    node.focus();              // 挂载时
  }
};

<input ref={handleRef} />
\`\`\`

回调签名是 \`(node: T | null) => void\`——挂载时 \`node\` 是元素，卸载时是 \`null\`。

## 六、\`RefObject\` vs \`MutableRefObject\`

\`\`\`ts
// RefObject：current 是只读的（DOM ref 的类型）
interface RefObject<T> {
  readonly current: T | null;
}

// MutableRefObject：current 可写（可变 ref 的类型）
interface MutableRefObject<T> {
  current: T;
}
\`\`\`

\`useRef<HTMLInputElement>(null)\` 返回 \`RefObject<HTMLInputElement>\`（current 只读）；
\`useRef<number>(0)\` 返回 \`MutableRefObject<number>\`（current 可写）。

**判定规则**：初始值是 \`null\` → \`RefObject\`；初始值是具体值 → \`MutableRefObject\`。

## 七、综合示例：可控制的高级输入框

\`\`\`tsx
interface FancyInputHandle {
  focus: () => void;
  setValue: (v: string) => void;
  getValue: () => string;
  selectAll: () => void;
}

type FancyInputProps = {
  defaultValue?: string;
  placeholder?: string;
};

const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>(
  ({ defaultValue = "", placeholder }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      setValue: (v) => {
        if (inputRef.current) inputRef.current.value = v;
      },
      getValue: () => inputRef.current?.value ?? "",
      selectAll: () => inputRef.current?.select(),
    }), []);

    return <input ref={inputRef} defaultValue={defaultValue} placeholder={placeholder} />;
  }
);

// 父组件用法
function App() {
  const ref = useRef<FancyInputHandle>(null);
  return (
    <>
      <FancyInput ref={ref} placeholder="邮箱" />
      <button onClick={() => ref.current?.focus()}>聚焦</button>
      <button onClick={() => ref.current?.setValue("test@example.com")}>填入</button>
      <button onClick={() => ref.current?.selectAll()}>全选</button>
    </>
  );
}
\`\`\`

## 八、一句话总结

- \`forwardRef<RefType, PropsType>\`：**泛型顺序是 ref 在前，props 在后**。
- \`useImperativeHandle\` 让你只暴露自定义方法，不暴露整个 DOM。
- \`RefType\` 是 \`HTMLInputElement\`（透传 DOM）或自定义接口（暴露方法）。
- \`useRef(null)\` 返回 \`RefObject\`（只读），\`useRef(value)\` 返回 \`MutableRefObject\`（可写）。

> *至此，TypeScript 全解教程的 React 实战部分完成！*`,
    code: `// 🎯 ref 与 forwardRef 类型 Demo
// 本文件演示 ref、forwardRef、useImperativeHandle 的类型写法

// 声明 React 命名空间（真实环境 import React from "react" 自带）
declare namespace React {
  interface ReactElement { type: string; props: any; }
  interface ReactNode {}
  interface HTMLInputElement {
    value: string;
    focus(): void;
    select(): void;
  }
  interface HTMLDivElement {}
  // RefObject：current 只读（DOM ref）
  interface RefObject<T> { readonly current: T | null; }
  // MutableRefObject：current 可写（可变 ref）
  interface MutableRefObject<T> { current: T; }
  type Ref<T> = RefObject<T> | ((instance: T | null) => void) | null;
  // forwardRef 工厂函数类型
  function forwardRef<T, P = {}>(
    render: (props: P, ref: Ref<T>) => ReactElement
  ): (props: P & { ref?: Ref<T> }) => ReactElement;
}

// 声明 Hooks（真实环境从 react 包导入）
declare function useRef<T>(initial: T): React.MutableRefObject<T>;
declare function useRef<T>(initial: T | null): React.RefObject<T>;
declare function useImperativeHandle<T>(
  ref: React.Ref<T>,
  init: () => T,
  deps?: any[]
): void;
declare function useState<T>(initial: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];

// ============================================================
// 1️⃣ useRef 的两种用法
// ============================================================

console.log("--- 1️⃣ useRef 两种用法 ---");

// 1.1 DOM ref：访问 DOM 元素（current 由 React 设置，只读语义）
const inputRef = useRef<HTMLInputElement>(null);              // RefObject<HTMLInputElement>
console.log("DOM ref.current（mount 前）:", inputRef.current);
// 使用时必须判空
if (inputRef.current) {
  inputRef.current.focus();                                   // ✅ 类型安全
  inputRef.current.value = "hello";
}

// 1.2 可变 ref：保存可变值（current 可写，类似实例变量）
const timerRef = useRef<number | null>(null);                 // MutableRefObject<number | null>
timerRef.current = 123;                                       // ✅ 可写
console.log("可变 ref.current:", timerRef.current);
timerRef.current = null;                                      // ✅ 可重置

// 1.3 用 useRef 保存"上一次的值"
const prevValueRef = useRef<string>("");                      // 保存上一次的值
prevValueRef.current = "current";                             // 渲染后更新
console.log("prevValueRef.current:", prevValueRef.current);

// ============================================================
// 2️⃣ forwardRef：把 ref 透传给子组件
// ============================================================

console.log("--- 2️⃣ forwardRef 基础 ---");

// 2.1 定义 Props 类型
type MyInputProps = {
  placeholder?: string;                                        // 可选占位符
  defaultValue?: string;                                       // 可选默认值
};

// 2.2 forwardRef：泛型顺序 <RefType, PropsType>（ref 在前，props 在后）
const MyInput = React.forwardRef<HTMLInputElement, MyInputProps>(
  (props, ref) => {
    // props 类型自动推导为 MyInputProps
    // ref 类型自动推导为 Ref<HTMLInputElement>
    return { type: "input", props: { ...props, ref } } as any;
  }
);

// 2.3 父组件使用
const parentRef = useRef<HTMLInputElement>(null);             // 父组件创建 ref
const inputElement = MyInput({
  ref: parentRef,                                              // 传 ref 给子组件
  placeholder: "请输入",                                       // 传 props
  defaultValue: "",
});
console.log("MyInput 元素:", inputElement);

// ============================================================
// 3️⃣ useImperativeHandle：暴露自定义方法
// ============================================================

console.log("--- 3️⃣ useImperativeHandle ---");

// 3.1 定义暴露给父组件的接口
interface InputHandle {
  focus: () => void;                                          // 聚焦
  clear: () => void;                                          // 清空
  getValue: () => string;                                     // 获取值
  setValue: (v: string) => void;                              // 设置值
}

// 3.2 forwardRef：RefType 是 InputHandle（不是 HTMLInputElement）
const FancyInput = React.forwardRef<InputHandle, MyInputProps>(
  (props, ref) => {
    // 内部 ref：实际的 DOM 元素，不暴露给父组件
    const internalRef = useRef<HTMLInputElement>(null);

    // useImperativeHandle：定义暴露哪些方法
    useImperativeHandle(ref, () => ({
      focus: () => {
        internalRef.current?.focus();                         // 调用 DOM focus
      },
      clear: () => {
        if (internalRef.current) {
          internalRef.current.value = "";                     // 清空 input
        }
      },
      getValue: () => {
        return internalRef.current?.value ?? "";              // 返回当前值
      },
      setValue: (v: string) => {
        if (internalRef.current) {
          internalRef.current.value = v;                      // 设置值
        }
      },
    }), []);                                                   // 依赖数组：空，只创建一次

    return { type: "input", props: { ...props, ref: internalRef } } as any;
  }
);

// 3.3 父组件用法
const fancyRef = useRef<InputHandle>(null);                   // ref 类型是 InputHandle
const fancyElement = FancyInput({
  ref: fancyRef,                                               // 传 ref
  placeholder: "邮箱",
});

console.log("FancyInput 元素:", fancyElement);

// 3.4 通过 ref 调用暴露的方法
fancyRef.current?.focus();                                    // ✅ 调用 focus
fancyRef.current?.setValue("test@example.com");               // ✅ 调用 setValue
const value = fancyRef.current?.getValue();                   // ✅ 调用 getValue
console.log("通过 ref.getValue() 拿到:", value);
fancyRef.current?.clear();                                    // ✅ 调用 clear

// ============================================================
// 4️⃣ RefObject vs MutableRefObject
// ============================================================

console.log("--- 4️⃣ RefObject vs MutableRefObject ---");

// 4.1 RefObject：current 只读（DOM ref）
const domRef = useRef<HTMLDivElement>(null);                  // RefObject<HTMLDivElement>
// domRef.current = {} as any;                                // ❌ current 是只读
console.log("domRef 是 RefObject，current 只读:", domRef.current);

// 4.2 MutableRefObject：current 可写（可变 ref）
const mutableRef = useRef<number>(0);                         // MutableRefObject<number>
mutableRef.current = 1;                                       // ✅ 可写
mutableRef.current = 2;                                       // ✅ 可多次写
console.log("mutableRef 是 MutableRefObject，current:", mutableRef.current);

// 4.3 判定规则
console.log("判定规则：");
console.log("  useRef<T>(null)        → RefObject<T>（current 只读）");
console.log("  useRef<T>(具体值)      → MutableRefObject<T>（current 可写）");

// ============================================================
// 5️⃣ ref 回调函数
// ============================================================

console.log("--- 5️⃣ ref 回调函数 ---");

// 回调签名：(node: T | null) => void
const handleRef = (node: HTMLInputElement | null): void => {
  if (node) {
    // 挂载时：node 是元素
    console.log("  input 挂载，立即聚焦");
    node.focus();
  } else {
    // 卸载时：node 是 null
    console.log("  input 卸载");
  }
};

// 模拟挂载/卸载
handleRef({ value: "", focus: () => console.log("  [focus 调用]"), select: () => {} } as any);
handleRef(null);

// 在 JSX 里：<input ref={handleRef} />
console.log("回调 ref 适合需要测量尺寸、注册监听器的场景");

// ============================================================
// 6️⃣ 综合示例：可控制的高级输入框
// ============================================================

console.log("--- 6️⃣ 综合示例：FancyInput 完整版 ---");

// 6.1 完整接口：4 个方法
interface FancyInputHandle {
  focus: () => void;                                          // 聚焦
  setValue: (v: string) => void;                              // 设置值
  getValue: () => string;                                     // 获取值
  selectAll: () => void;                                      // 全选
}

// 6.2 Props 类型
type FancyInputProps = {
  defaultValue?: string;                                       // 可选默认值
  placeholder?: string;                                        // 可选占位符
  onChange?: (value: string) => void;                          // 可选变化回调
};

// 6.3 forwardRef + useImperativeHandle 组合
const FancyInputFull = React.forwardRef<FancyInputHandle, FancyInputProps>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);          // 内部 DOM ref

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),                 // 暴露 focus
      setValue: (v: string) => {
        if (inputRef.current) {
          inputRef.current.value = v;                         // 暴露 setValue
          props.onChange?.(v);                                 // 触发回调
        }
      },
      getValue: () => inputRef.current?.value ?? "",          // 暴露 getValue
      selectAll: () => inputRef.current?.select(),            // 暴露 selectAll
    }), []);                                                   // 依赖空数组

    return { type: "input", props: { ...props, ref: inputRef } } as any;
  }
);

// 6.4 父组件用法
function App(): React.ReactElement {
  const ref = useRef<FancyInputHandle>(null);                // ref 类型是 FancyInputHandle

  // 事件处理：通过 ref.current 调用暴露的方法
  const handleFocusClick = () => ref.current?.focus();        // 聚焦按钮
  const handleFillClick = () => ref.current?.setValue("test@example.com");  // 填入按钮
  const handleSelectClick = () => ref.current?.selectAll();   // 全选按钮
  const handleGetValueClick = () => {
    const v = ref.current?.getValue();                        // 获取值
    console.log("  当前值:", v);
  };

  return {
    type: "div",
    props: {
      children: [
        { type: "FancyInput", props: { ref, placeholder: "邮箱" } },
        { type: "button", props: { onClick: handleFocusClick, label: "聚焦" } },
        { type: "button", props: { onClick: handleFillClick, label: "填入" } },
        { type: "button", props: { onClick: handleSelectClick, label: "全选" } },
        { type: "button", props: { onClick: handleGetValueClick, label: "获取值" } },
      ],
    },
  } as any;
}

const app = App();
console.log("App 组件构造完成，包含 FancyInput 和 4 个控制按钮");

// ============================================================
// 7️⃣ forwardRef 泛型顺序的记忆口诀
// ============================================================

console.log("--- 7️⃣ forwardRef 泛型顺序 ---");

// 口诀：ref 在前，props 在后
// forwardRef<RefType, PropsType>(...)
//            ↑          ↑
//            ref 的类型  props 的类型
//
// 反直觉原因：函数签名是 (props, ref) => ...
// 但泛型顺序是 <RefType, PropsType>，与参数顺序相反
//
// 记忆方法：把 ref 想成"主语"（forwardRef 的核心就是转发 ref），
// 所以 ref 类型放第一个

console.log("forwardRef<RefType, PropsType>");
console.log("         ↑          ↑");
console.log("       ref 类型    props 类型");
console.log("口诀：ref 在前，props 在后");

// ============================================================
// 8️⃣ 常见错误对比
// ============================================================

console.log("--- 8️⃣ 常见错误对比 ---");

// ❌ 错误 1：泛型顺序写反
// const Wrong1 = React.forwardRef<MyInputProps, HTMLInputElement>(...);  // props 和 ref 颠倒

// ✅ 正确：ref 在前
// const Right1 = React.forwardRef<HTMLInputElement, MyInputProps>(...);

console.log("错误 1：泛型顺序写反（props 和 ref 颠倒）→ 类型对不上");

// ❌ 错误 2：useImperativeHandle 返回的对象不满足接口
// useImperativeHandle(ref, () => ({
//   focus: () => {},         // 只暴露 focus
//   // 缺 clear、getValue、setValue
// }));                        // ❌ 不满足 InputHandle 接口

// ✅ 正确：返回完整接口
// useImperativeHandle(ref, () => ({
//   focus: () => {},
//   clear: () => {},
//   getValue: () => "",
//   setValue: (v) => {},
// }));

console.log("错误 2：useImperativeHandle 返回不完整 → 编译报错");

// ❌ 错误 3：父组件 ref 类型标错
// const ref = useRef<HTMLInputElement>(null);         // ❌ 应该是 InputHandle
// <FancyInput ref={ref} />

// ✅ 正确：ref 类型与 forwardRef 的 RefType 一致
// const ref = useRef<InputHandle>(null);              // ✅
// <FancyInput ref={ref} />

console.log("错误 3：父组件 ref 类型标错 → 调用方法时类型对不上");
`,
  },
];
