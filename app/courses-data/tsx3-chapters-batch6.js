// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第六批章节
// -------------------------------------------------------------
// 覆盖：第三部分 React + TS 工程基础 末尾 3 章 + 第四部分 事件与表单 开头 3 章
// 包含 6 个章节：ch24 ~ ch29
//
// 章节范围：
//   - ch24 默认 Props 与 displayName（第三部分末尾）
//   - ch25 forwardRef 与 ref 类型（第三部分末尾）
//   - ch26 Context 与 TS（第三部分末尾）
//   - ch27 React 事件类型大全（第四部分开头）
//   - ch28 表单与受控组件（第四部分开头）
//   - ch29 非受控组件与 useRef（第四部分开头）
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 所有 demo 都通过 /api/run-ts 沙箱可运行
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch24: 默认 Props 与 displayName
  // ============================================================
  {
    id: "tsx3-ch24",
    group: "第三部分 React + TS 工程基础",
    icon: "⚙️",
    title: "ch24 默认 Props 与 displayName",
    content: `# ch24 默认 Props 与 displayName

## 为什么讲这个

写组件时，"默认值"是个高频需求——按钮默认 size 是 middle，弹窗默认 visible 是 false，列表默认空数据。但如果默认值写不好，TS 类型就会出问题：要么 IDE 不提示，要么类型推断成 any，要么默认值被改坏。这一章把"默认 props"的所有写法和 \`displayName\` 在生产调试里的作用讲清楚。

## 1. 默认值的三种写法

### 写法 1：解构默认值（最推荐）

\`\`\`tsx
// Button.tsx
// 直接在参数解构里给默认值，TS 会自动推断 size 是 string
interface ButtonProps {
  label: string;
  size?: "small" | "middle" | "large"; // 可选
  disabled?: boolean;
}

// size = "middle" 是解构默认值：当父组件不传 size 时取 "middle"
function Button({ label, size = "middle", disabled = false }: ButtonProps) {
  // 这里 size 的类型是 "small" | "middle" | "large"（不会是 undefined）
  // 因为有默认值，TS 把 undefined 排除了
  const className = \`btn btn-\${size}\`;
  return (
    <button className={className} disabled={disabled}>
      {label}
    </button>
  );
}

// 父组件使用
function App() {
  return (
    <div>
      <Button label="保存" />                {/* size 默认 "middle" */}
      <Button label="取消" size="small" />  {/* 显式传 small */}
    </div>
  );
}
\`\`\`

**这种写法的优点**：
1. 类型安全：\`size\` 在组件内部不会是 \`undefined\`
2. 简洁：一行搞定
3. 父组件不传时自动 fallback

### 写法 2：defaultProps（已不推荐）

\`\`\`tsx
// 老写法：用 defaultProps 静态属性
interface ButtonProps {
  label: string;
  size?: "small" | "middle" | "large";
}

function Button({ label, size }: ButtonProps) {
  // 这里 size 类型是 "small" | "middle" | "large" | undefined
  // 需要手动处理 undefined
  const finalSize = size ?? "middle";
  return <button className={\`btn btn-\${finalSize}\`}>{label}</button>;
}

// ⚠️ React 18 已把函数组件的 defaultProps 标记为废弃
// 原因：函数组件 defaultProps 在类型推导上有 bug，且不支持 TS 自动收窄
Button.defaultProps = {
  size: "middle",
};
\`\`\`

**为什么不推荐**：React 18 之后函数组件的 \`defaultProps\` 不会触发 TS 的类型收窄，仍然认为 \`size\` 可能是 \`undefined\`，需要手动判空。**类组件还能用，函数组件别用了**。

### 写法 3：在组件内部用 ?? 兜底

\`\`\`tsx
interface ListProps {
  data?: string[];
  loading?: boolean;
}

function List({ data, loading }: ListProps) {
  // 用 ?? 兜底：data 是 undefined 时取空数组
  // 好处：不需要在 props 类型上加默认值
  const items = data ?? [];
  // loading 用 ?? 兜底（这里都返回布尔值，没有 falsy 坑）
  const isLoading = loading ?? false;

  if (isLoading) return <div>加载中...</div>;
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
\`\`\`

## 2. 默认值与可选 props 的关系

很多人混淆"默认值"和"可选 props"：

- **可选 props**：父组件可以不传，类型是 \`T | undefined\`
- **默认值**：当父组件不传时，组件内部用一个固定的值

两者搭配使用：可选 props + 解构默认值。

\`\`\`tsx
interface ModalProps {
  visible: boolean;       // 必传
  title?: string;         // 可选
  closeOnEsc?: boolean;   // 可选
  width?: number;         // 可选
}

function Modal({
  visible,
  title = "提示",          // 可选 + 默认值
  closeOnEsc = true,       // 可选 + 默认值
  width = 400,             // 可选 + 默认值
}: ModalProps) {
  // 这里 title / closeOnEsc / width 都不是 undefined
  // TS 自动收窄类型
  return (
    <div style={{ display: visible ? "block" : "none", width }}>
      <h2>{title}</h2>
      <p>按 ESC 关闭：{closeOnEsc ? "是" : "否"}</p>
    </div>
  );
}
\`\`\`

**关键点**：\`title\` 在 props 类型里是 \`string | undefined\`，但因为有默认值 \`"提示"\`，**在组件内部它的类型是 \`string\`**——TS 自动排除了 \`undefined\`。

## 3. 默认值是引用类型时的坑

\`\`\`tsx
// ❌ 错误写法：在解构里给引用类型默认值
interface ListProps {
  items?: string[];
}

function List({ items = [] }: ListProps) {
  // 这样写看起来没问题，但每次渲染都会新建一个空数组
  // 不影响功能，但有微小的性能开销
  return (
    <ul>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

// ✅ 推荐写法：把默认值提到模块顶层
const EMPTY_ARRAY: string[] = []; // 模块级常量，只创建一次

function List({ items = EMPTY_ARRAY }: ListProps) {
  // 复用同一个空数组引用，避免每次渲染都新建
  return (
    <ul>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
\`\`\`

**避坑**：默认值是对象/数组时，**提到模块顶层**比写在解构里更高效。

## 4. displayName 是什么

每个 React 组件都有一个 \`displayName\` 属性，用来在 React DevTools 里显示组件名。

\`\`\`tsx
// 函数组件的 displayName 默认是函数名
function Button() { return <button />; }
console.log(Button.displayName); // undefined，但 DevTools 显示 "Button"

// 显式设置
const MyButton = (() => {
  function Inner({ label }: { label: string }) {
    return <button>{label}</button>;
  }
  Inner.displayName = "MyButton"; // 设置后 DevTools 显示 "MyButton"
  return Inner;
})();
\`\`\`

## 5. 为什么需要 displayName

主要场景：**高阶组件（HOC）和匿名组件**。

\`\`\`tsx
// 一个高阶组件：包裹目标组件，加日志
function withLogger<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  function Wrapped(props: P) {
    console.log("props:", props);
    return <Component {...props} />;
  }

  // ❌ 不设置 displayName，DevTools 会显示 "Wrapped"
  // ✅ 设置 displayName，DevTools 显示 "withLogger(MyComponent)"
  Wrapped.displayName = \`withLogger(\${Component.displayName || Component.name})\`;
  return Wrapped;
}

// 使用
const LoggedButton = withLogger(Button);
// DevTools 里会显示 "withLogger(Button)"，调试时一眼能看出层级
\`\`\`

## 6. 生产环境调试的实战场景

线上 bug 复现时，React DevTools 的组件树长这样：

\`\`\`
App
└── Router
    └── Page
        └── withLogger(Button)   ← 有 displayName
            └── Button
\`\`\`

如果没有 \`displayName\`，匿名 HOC 会显示成 \`Wrapped\`、\`Anonymous\`，根本看不出是哪个 HOC 包了一层。**生产环境代码被压缩后函数名变成 \`a\`、\`b\`、\`c\`，displayName 是唯一能识别组件的标识**。

\`\`\`tsx
// 生产环境调试 Demo
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, { placeholder?: string }>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);
// forwardRef 返回的组件 displayName 默认是 "ForwardRef"
// 显式设置
Input.displayName = "MyInput";

// 然后在 DevTools 里能看到 "MyInput" 而不是 "ForwardRef(input)"
\`\`\`

## 7. TS 里 displayName 的类型

\`\`\`ts
// React.FunctionComponent 接口里有 displayName 字段
type MyComponent = React.FC<{ label: string }>;

// 显式声明（不常用，TS 会自动允许赋值）
const Button: MyComponent & { displayName?: string } = (props) => {
  return <button>{props.label}</button>;
};
Button.displayName = "MyButton";
\`\`\`

实战中不用这么麻烦，直接赋值就行，TS 会自动推导：

\`\`\`tsx
function Button(props: { label: string }) {
  return <button>{props.label}</button>;
}
Button.displayName = "MyButton"; // TS 自动允许
\`\`\`

## 8. 综合实战：带默认值的配置型组件

\`\`\`tsx
// 一个 Card 组件，演示默认值与 displayName 配合
interface CardProps {
  title: string;                    // 必传
  bordered?: boolean;               // 可选 + 默认值
  padding?: number;                 // 可选 + 默认值
  background?: string;              // 可选 + 默认值
  actions?: React.ReactNode[];      // 可选 + 默认值（引用类型提到顶层）
}

const EMPTY_ACTIONS: React.ReactNode[] = [];

function Card({
  title,
  bordered = true,
  padding = 12,
  background = "#fff",
  actions = EMPTY_ACTIONS,
}: CardProps) {
  // 这里所有可选 props 都被收窄到非 undefined 类型
  return (
    <div
      style={{
        border: bordered ? "1px solid #eee" : "none",
        padding,
        background,
      }}
    >
      <h3>{title}</h3>
      <div className="card-actions">
        {actions.map((action, i) => (
          <span key={i} style={{ marginRight: 8 }}>
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}

Card.displayName = "Card";

// 父组件使用
function App() {
  return (
    <Card
      title="用户信息"
      actions={[<button key="edit">编辑</button>, <button key="del">删除</button>]}
    />
  );
}
\`\`\`

## 小结

- 默认值优先用"解构默认值"写法，TS 会自动收窄类型。
- 函数组件不要再写 \`defaultProps\`，React 18 已废弃。
- 引用类型默认值提到模块顶层，避免每次渲染新建。
- \`displayName\` 用于 React DevTools 显示，HOC 和匿名组件必加。
- 生产环境压缩代码后，displayName 是调试的关键标识。

## 避坑清单

- ❌ 函数组件用 \`defaultProps\`（应该用解构默认值）
- ❌ 引用类型默认值写在解构里（应该提到模块顶层）
- ❌ HOC 不设 \`displayName\`（DevTools 会显示 Anonymous）
- ❌ 把必传 props 也加默认值（说明 props 设计有问题）

下一章我们看 forwardRef 与 ref 类型——这是 React 组件高级用法的关键。`
  },

  // ============================================================
  // ch25: forwardRef 与 ref 类型
  // ============================================================
  {
    id: "tsx3-ch25",
    group: "第三部分 React + TS 工程基础",
    icon: "🎯",
    title: "ch25 forwardRef 与 ref 类型",
    content: `# ch25 forwardRef 与 ref 类型

## 为什么讲这个

React 组件默认"看不到"自己内部的 DOM 节点——这是封装的好处。但有些场景需要父组件直接操作子组件的 DOM（聚焦、滚动、测量尺寸），这时就要用 \`ref\`。但 \`ref\` 的类型比 \`props\` 复杂得多：HTML 元素类型有一大堆（HTMLDivElement、HTMLInputElement、...），还有 \`useRef\` 与 \`forwardRef\` 的搭配。这一章把 ref 类型系统一次讲清楚。

## 1. useRef 的基础类型

\`useRef\` 有两种用途，对应两种类型：

\`\`\`tsx
import { useRef } from "react";

// 用途 1：访问 DOM 节点
// 类型参数写对应的 HTML 元素类型
const divRef = useRef<HTMLDivElement>(null);   // <div>
const inputRef = useRef<HTMLInputElement>(null); // <input>
const btnRef = useRef<HTMLButtonElement>(null);  // <button>

// 用途 2：保存可变值（不触发重渲染）
const countRef = useRef<number>(0); // 初始值 0
// 注意：这里初始值是 0，类型是 RefObject<number>
\`\`\`

**关键区别**：
- DOM ref：初始值是 \`null\`，类型是 \`RefObject<HTMLDivElement | null>\`
- 值 ref：初始值是具体值，类型是 \`MutableRefObject<T>\`

## 2. useRef 的三种初始值场景

\`\`\`tsx
import { useRef } from "react";

function Demo() {
  // 场景 1：null + 元素类型（DOM ref）
  const inputRef = useRef<HTMLInputElement>(null);
  // inputRef.current 类型：HTMLInputElement | null
  // 使用前必须判空

  // 场景 2：具体值（值 ref）
  const timerRef = useRef<number | null>(null);
  // timerRef.current 类型：number | null
  // 可以直接赋值：timerRef.current = 123

  // 场景 3：不传初始值（不推荐）
  const badRef = useRef<number>();
  // badRef.current 类型：number | undefined
  // 不推荐，类型推断会带 undefined 让代码变啰嗦

  return <input ref={inputRef} />;
}
\`\`\`

## 3. forwardRef 基础

子组件需要暴露自己的 DOM 给父组件时，用 \`forwardRef\`：

\`\`\`tsx
import { forwardRef, useRef } from "react";

// forwardRef<RefType, PropsType>
// RefType 是 ref 的类型（如 HTMLInputElement）
// PropsType 是 props 的类型
const FancyInput = forwardRef<HTMLInputElement, { placeholder?: string }>(
  (props, ref) => {
    // ref 是父组件传进来的，类型是 Ref<HTMLInputElement>
    return <input ref={ref} placeholder={props.placeholder} />;
  }
);

// 父组件使用
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    // 必须判空：ref.current 可能是 null
    inputRef.current?.focus();
  };

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="点下面按钮聚焦" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}
\`\`\`

## 4. forwardRef 的两个类型参数

\`\`\`ts
// forwardRef<T, P = {}>
//   T: ref 指向的元素类型
//   P: 组件 props 类型

// 示例 1：转发到 div
const Box = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  (props, ref) => <div ref={ref}>{props.children}</div>
);

// 示例 2：转发到 button
const Button = forwardRef<HTMLButtonElement, { label: string }>(
  (props, ref) => <button ref={ref}>{props.label}</button>
);

// 示例 3：不传 props 时 P 可以省略，默认 {}
const Div = forwardRef<HTMLDivElement>(
  (props, ref) => <div ref={ref} {...props} />
);
\`\`\`

## 5. HTML 元素类型全家族

React 的 JSX 内置元素都对应一个 \`HTML*Element\` 类型。常用清单：

\`\`\`ts
// 表单元素
HTMLInputElement       // <input>
HTMLTextAreaElement    // <textarea>
HTMLSelectElement      // <select>
HTMLButtonElement      // <button>
HTMLOptionElement      // <option>

// 容器元素
HTMLDivElement         // <div>
HTMLSpanElement        // <span>
HTMLParagraphElement   // <p>
HTMLHeadingElement     // <h1> ~ <h6>
HTMLSectionElement     // <section>

// 列表与表格
HTMLUListElement       // <ul>
HTMLOListElement       // <ol>
HTMLLIElement          // <li>
HTMLTableElement       // <table>
HTMLTableRowElement    // <tr>
HTMLTableCellElement   // <td> / <th>

// 媒体元素
HTMLImageElement       // <img>
HTMLVideoElement       // <video>
HTMLAudioElement       // <audio>
HTMLCanvasElement      // <canvas>

// 其他
HTMLAnchorElement      // <a>
HTMLFormElement        // <form>
HTMLLabelElement       // <label>
HTMLIFrameElement      // <iframe>
\`\`\`

## 6. HTMLElement 与 Element：父类型

\`\`\`ts
// HTMLElement 是所有 HTML 元素的父类型
const el: HTMLElement = document.createElement("div"); // ✅ div 是 HTMLElement
const el2: HTMLElement = document.createElement("input"); // ✅ input 也是 HTMLElement

// Element 是 HTMLElement 的父类型（包含 SVG、XML 元素等）
const el3: Element = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "svg"
);

// 用法：函数接受任意 HTML 元素时用 HTMLElement
function logElement(el: HTMLElement) {
  console.log(el.tagName, el.clientWidth);
}
\`\`\`

**实战建议**：能用具体类型（HTMLInputElement）就用具体的，只有"接受任意元素"时才用 HTMLElement。

## 7. ref 的判空

\`ref.current\` 类型默认带 \`| null\`，使用前必须判空：

\`\`\`tsx
import { useRef } from "react";

function Demo() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // ❌ 错误写法：不判空
    // inputRef.current.focus(); // 报错：可能是 null

    // ✅ 正确写法 1：可选链
    inputRef.current?.focus();

    // ✅ 正确写法 2：if 判空
    if (inputRef.current) {
      inputRef.current.focus();
      // 这里 inputRef.current 类型收窄为 HTMLInputElement
      console.log(inputRef.current.value); // 可以访问 .value
    }
  };

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>聚焦</button>
    </div>
  );
}
\`\`\`

## 8. 把 ref 暴露给父组件：useImperativeHandle

如果不想让父组件直接操作 DOM，只想暴露几个方法，用 \`useImperativeHandle\`：

\`\`\`tsx
import {
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";

// 定义 ref 暴露的方法类型
interface FancyInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const FancyInput = forwardRef<FancyInputHandle, { placeholder?: string }>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // useImperativeHandle：自定义暴露给父组件的 ref 内容
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
      getValue: () => inputRef.current?.value ?? "",
    }));

    return <input ref={inputRef} placeholder={props.placeholder} />;
  }
);

// 父组件使用：拿到的是 { focus, clear, getValue }，不是 DOM
function Parent() {
  const inputRef = useRef<FancyInputHandle>(null);

  const handleFocus = () => inputRef.current?.focus();
  const handleClear = () => inputRef.current?.clear();

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="输入点东西" />
      <button onClick={handleFocus}>聚焦</button>
      <button onClick={handleClear}>清空</button>
    </div>
  );
}
\`\`\`

## 9. 综合实战：可聚焦可重置的输入框组件

\`\`\`tsx
import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from "react";

interface FancyInputHandle {
  focus: () => void;
  reset: () => void;
  getValue: () => string;
}

interface FancyInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const FancyInput = forwardRef<FancyInputHandle, FancyInputProps>(
  ({ initialValue = "", placeholder, onChange }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(initialValue);

    // 暴露三个方法给父组件
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      reset: () => {
        setValue("");
        onChange?.("");
        inputRef.current?.focus();
      },
      getValue: () => value,
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(newValue);
    };

    return (
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
    );
  }
);

FancyInput.displayName = "FancyInput";

// 父组件
function App() {
  const inputRef = useRef<FancyInputHandle>(null);

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="试试" />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.reset()}>重置</button>
    </div>
  );
}
\`\`\`

## 小结

- \`useRef<HTMLDivElement>(null)\` 用于访问 DOM，使用前必须判空。
- \`forwardRef<T, P>\` 让子组件把 ref 暴露给父组件，T 是 ref 类型，P 是 props 类型。
- HTML 元素类型有一大堆（HTMLInputElement、HTMLTextAreaElement 等），优先用具体类型。
- \`useImperativeHandle\` 自定义 ref 暴露内容，比直接暴露 DOM 更安全。

## 避坑清单

- ❌ \`useRef\` 不传初始值（类型会带 undefined，应该传 \`null\`）
- ❌ 不判空直接用 \`ref.current\`（运行时可能是 null）
- ❌ 用 \`HTMLElement\` 代替具体类型（应该用 HTMLInputElement 等具体类型）
- ❌ 直接暴露 DOM 给父组件（应该用 \`useImperativeHandle\` 封装方法）

下一章我们看 Context 与 TS——全局状态在类型系统下怎么写。`
  },

  // ============================================================
  // ch26: Context 与 TS
  // ============================================================
  {
    id: "tsx3-ch26",
    group: "第三部分 React + TS 工程基础",
    icon: "🌐",
    title: "ch26 Context 与 TS",
    content: `# ch26 Context 与 TS

## 为什么讲这个

React Context 是跨组件传递数据的标准方案——主题、用户信息、国际化文案、路由状态都靠它。但 Context 配合 TS 有个经典痛点：**默认值怎么写**？写 \`null\` 又要到处判空，写 \`any\` 又失去类型保护。这一章把 Context 的类型写法、Provider 模式、避免 any 的技巧讲透。

## 1. createContext 的类型参数

\`createContext<T>\` 接受一个类型参数 T，描述 Context 里数据的类型：

\`\`\`tsx
import { createContext } from "react";

// 场景 1：Context 里是一个用户对象
interface User {
  id: number;
  name: string;
  email: string;
}
const UserContext = createContext<User | null>(null);
// 这里给 null 是因为初始时还没登录，user 是 null

// 场景 2：Context 里是一个主题对象
interface Theme {
  color: string;
  fontSize: number;
}
const ThemeContext = createContext<Theme>({
  color: "#333",
  fontSize: 14,
});
// 这里给具体值作为默认主题

// 场景 3：Context 里是一个函数
type Locale = "zh" | "en";
const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
} | null>(null);
\`\`\`

## 2. 默认值的两种写法

### 写法 1：给一个有意义的默认值（推荐用于"全局配置"类）

\`\`\`tsx
import { createContext, useContext } from "react";

interface Theme {
  primary: string;
  secondary: string;
}

// 给一个默认主题：父组件没包 Provider 时用这个
const ThemeContext = createContext<Theme>({
  primary: "#1890ff",
  secondary: "#52c41a",
});

function Button() {
  // useContext 自动推导出 Theme 类型
  const theme = useContext(ThemeContext);
  // theme 类型是 Theme，没有 null，不用判空
  return (
    <button style={{ background: theme.primary }}>
      按钮
    </button>
  );
}
\`\`\`

### 写法 2：给 null，强制父组件包 Provider（推荐用于"运行时数据"类）

\`\`\`tsx
import { createContext, useContext } from "react";

interface User {
  id: number;
  name: string;
}

// 默认值给 null：表示"必须有 Provider 提供真实数据"
const UserContext = createContext<User | null>(null);

function UserAvatar() {
  const user = useContext(UserContext);
  // user 类型是 User | null，必须判空
  if (user === null) {
    return <div>未登录</div>;
  }
  return <div>{user.name}</div>;
}
\`\`\`

**选哪种**？
- "全局配置"（主题、文案、默认值）→ 写法 1
- "运行时数据"（用户、购物车、权限）→ 写法 2

## 3. useContext 的类型推导

\`useContext\` 的返回类型由 \`createContext\` 的类型参数决定：

\`\`\`tsx
const ThemeContext = createContext<{ primary: string }>({ primary: "#000" });
const UserContext = createContext<{ name: string } | null>(null);

function Demo() {
  const theme = useContext(ThemeContext);
  // theme 类型：{ primary: string }

  const user = useContext(UserContext);
  // user 类型：{ name: string } | null
}
\`\`\`

不用手动写类型注解，TS 自动推导。

## 4. 避免判空：自定义 useContext Hook

写法 2 每次用都要判空，很烦。可以封装一个自定义 Hook，**没 Provider 时直接抛错**：

\`\`\`tsx
import { createContext, useContext } from "react";

interface User {
  id: number;
  name: string;
}

const UserContext = createContext<User | null>(null);

// 自定义 useUser：如果没 Provider，抛错
function useUser(): User {
  const user = useContext(UserContext);
  if (user === null) {
    throw new Error("useUser 必须在 UserProvider 内部使用");
  }
  return user; // 这里 TS 自动收窄为 User，没有 null
}

// 使用
function UserAvatar() {
  const user = useUser(); // 不用判空
  return <div>{user.name}</div>;
}
\`\`\`

**这种模式的优点**：
1. 调用方不用判空，代码简洁
2. 没用 Provider 时立即抛错，提前发现问题
3. React 官方也推荐这种写法

## 5. Provider 模式：完整的 Provider 组件

实战中 Context 通常配套一个 Provider 组件，封装状态逻辑：

\`\`\`tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface User {
  id: number;
  name: string;
}

interface UserContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

// Provider 组件：管理状态，把状态塞进 Context
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  const value: UserContextValue = { user, login, logout };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// 自定义 Hook
function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === null) {
    throw new Error("useUser 必须在 UserProvider 内部使用");
  }
  return ctx;
}

export { UserProvider, useUser };
\`\`\`

使用：

\`\`\`tsx
import { UserProvider, useUser } from "./UserContext";

function Header() {
  const { user, login, logout } = useUser();
  if (user === null) {
    return <button onClick={() => login({ id: 1, name: "Alice" })}>登录</button>;
  }
  return (
    <div>
      欢迎，{user.name}
      <button onClick={logout}>退出</button>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Header />
    </UserProvider>
  );
}
\`\`\`

## 6. 避免 any 的写法

### 反模式：用 any 当默认值

\`\`\`tsx
// ❌ 错误写法：默认值用 any
const UserContext = createContext<any>(null);

function UserAvatar() {
  const user = useContext(UserContext);
  // user 是 any，没有类型保护
  return <div>{user.name}</div>; // user.name 拼错了 TS 也不报错
}
\`\`\`

### 正确写法：用 unknown 或具体类型

\`\`\`tsx
// ✅ 正确：用具体类型 | null
const UserContext = createContext<User | null>(null);

// 或者用 unknown（如果想强制调用方判类型）
const DataContext = createContext<unknown>(null);
function Demo() {
  const data = useContext(DataContext);
  // data 是 unknown，必须先类型断言或类型守卫才能用
  if (typeof data === "string") {
    console.log(data.toUpperCase());
  }
}
\`\`\`

## 7. 多 Context 组合

\`\`\`tsx
import { ReactNode } from "react";

// 主题 Context
const ThemeContext = createContext<{ primary: string }>({ primary: "#1890ff" });
// 用户 Context
const UserContext = createContext<{ name: string } | null>(null);

function App() {
  return (
    // Context 可以嵌套
    <ThemeContext.Provider value={{ primary: "red" }}>
      <UserContext.Provider value={{ name: "Alice" }}>
        <Page />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

function Page() {
  return <Header />;
}

function Header() {
  // 子组件任意层级都能 useContext，不用层层 props
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  return (
    <header style={{ color: theme.primary }}>
      {user?.name ?? "未登录"}
    </header>
  );
}
\`\`\`

## 8. Context 性能优化提示

Context 值变化时，所有 useContext 的组件都会重渲染。优化方法：

\`\`\`tsx
import { useMemo, useState, ReactNode } from "react";

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState("light");

  // ❌ 错误写法：value 每次都是新对象，所有子组件都重渲染
  // return <UserContext.Provider value={{ user, theme, setUser, setTheme }}>

  // ✅ 正确写法：用 useMemo 缓存 value
  const value = useMemo(
    () => ({ user, theme, setUser, setTheme }),
    [user, theme]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
\`\`\`

## 9. 综合实战：主题切换 Context

\`\`\`tsx
import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  primary: string;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  // 用 useMemo 缓存 value，避免每次渲染都新建对象
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      primary: mode === "light" ? "#1890ff" : "#f5222d",
      toggle: () => setMode((m) => (m === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  }
  return ctx;
}

// 使用方
function Toolbar() {
  const { mode, primary, toggle } = useTheme();
  return (
    <div style={{ background: mode === "light" ? "#fff" : "#333" }}>
      <button style={{ color: primary }} onClick={toggle}>
        切换主题（当前 {mode}）
      </button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Toolbar />
    </ThemeProvider>
  );
}
\`\`\`

## 小结

- \`createContext<T>\` 的类型参数 T 决定 Context 数据类型。
- 默认值两种写法：全局配置给具体值，运行时数据给 null。
- 自定义 \`useUser\` Hook 配合判空抛错，避免到处判空。
- Provider 组件封装状态逻辑，是 Context 的标准模式。
- value 用 \`useMemo\` 缓存，避免不必要的重渲染。

## 避坑清单

- ❌ 默认值用 \`any\`（应该用 \`T | null\` 或 \`unknown\`）
- ❌ Provider 的 value 每次新建对象（应该用 \`useMemo\` 缓存）
- ❌ 用 Context 传高频变化的数据（应该用状态管理库如 Zustand）
- ❌ 自定义 useContext Hook 不判空（应该在 null 时抛错）

下一章我们看 React 事件类型大全——表单和交互的核心。`
  },

  // ============================================================
  // ch27: React 事件类型大全
  // ============================================================
  {
    id: "tsx3-ch27",
    group: "第四部分 事件与表单",
    icon: "🖱️",
    title: "ch27 React 事件类型大全",
    content: `# ch27 React 事件类型大全

## 为什么讲这个

React 的事件系统和原生 JS 不完全一样——它用了"合成事件"（SyntheticEvent）做浏览器兼容。在 TS 里写事件处理函数时，参数类型必须写对，否则要么 IDE 红线，要么 \`target.value\` 访问不到。这一章把 React 所有常用事件类型、事件冒泡、target vs currentTarget 一次讲透。

## 1. React.SyntheticEvent：所有事件的基类

React 所有事件都继承自 \`SyntheticEvent\`：

\`\`\`tsx
// SyntheticEvent 是 React 的事件基类
function handleClick(e: React.SyntheticEvent) {
  // e 上有这些通用属性
  console.log(e.type);          // 事件类型，如 "click"
  console.log(e.target);        // 触发事件的元素
  console.log(e.currentTarget); // 绑定事件监听的元素
  console.log(e.timeStamp);     // 时间戳
  e.preventDefault();           // 阻止默认行为
  e.stopPropagation();          // 阻止冒泡
}
\`\`\`

**注意**：\`React.SyntheticEvent\` 不能直接访问 \`e.target.value\`——因为 \`target\` 是 \`EventTarget\` 类型，没有 \`value\` 属性。需要用更具体的子类型。

## 2. 鼠标事件：MouseEvent

\`\`\`tsx
// React.MouseEvent<T> 是鼠标事件类型
// T 是绑定事件的元素类型
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  // 鼠标事件特有属性
  console.log(e.clientX, e.clientY); // 鼠标在视口的坐标
  console.log(e.pageX, e.pageY);     // 鼠标在文档的坐标
  console.log(e.button);             // 哪个鼠标按键，0=左键 1=中键 2=右键

  // e.currentTarget 类型收窄为 HTMLButtonElement
  console.log(e.currentTarget.textContent);
}

function App() {
  return <button onClick={handleClick}>点我</button>;
}
\`\`\`

## 3. 表单事件：ChangeEvent

输入框、选择框的变化用 \`ChangeEvent\`：

\`\`\`tsx
import { useState } from "react";

function Form() {
  const [value, setValue] = useState("");

  // ChangeEvent<T>：T 是表单元素类型
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target 类型收窄为 HTMLInputElement
    // 可以安全访问 .value
    setValue(e.target.value);
    console.log(e.target.name);     // input 的 name 属性
    console.log(e.target.type);     // input 的 type，如 "text" "email"
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      type="text"
      name="username"
    />
  );
}
\`\`\`

不同表单元素对应不同的 ChangeEvent：

\`\`\`tsx
// 文本框
const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value); // string
};

// 多行文本
const onTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  console.log(e.target.value); // string
};

// 下拉框
const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  console.log(e.target.value); // string
};
\`\`\`

## 4. 键盘事件：KeyboardEvent

\`\`\`tsx
import { useState } from "react";

function SearchInput() {
  const [value, setValue] = useState("");

  // KeyboardEvent<T>：T 是元素类型
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // e.key 是按下的键名（推荐用 key，不要用 keyCode）
    console.log(e.key); // "Enter" "Escape" "ArrowUp" 等

    // 按 Enter 提交
    if (e.key === "Enter") {
      console.log("提交搜索：", value);
    }

    // 按 Esc 清空
    if (e.key === "Escape") {
      setValue("");
    }
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="按 Enter 搜索，Esc 清空"
    />
  );
}
\`\`\`

## 5. 焦点事件：FocusEvent

\`\`\`tsx
// FocusEvent<T>：T 是元素类型
function Input() {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log("聚焦了", e.target.name);
    e.target.style.borderColor = "blue";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log("失焦了", e.target.name);
    e.target.style.borderColor = "";
  };

  return <input name="email" onFocus={handleFocus} onBlur={handleBlur} />;
}
\`\`\`

## 6. 表单提交事件：FormEvent

\`\`\`tsx
import { useState } from "react";

function LoginForm() {
  const [username, setUsername] = useState("");

  // FormEvent 是表单提交事件
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // ⚠️ 必须阻止默认行为，否则页面会刷新
    e.preventDefault();
    console.log("提交：", username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

**避坑**：表单提交不调用 \`preventDefault()\` 会触发页面刷新，导致 React 状态丢失。

## 7. 事件冒泡与 stopPropagation

\`\`\`tsx
function App() {
  // 外层 div 的点击事件
  const handleOuterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("外层 div 被点击");
  };

  // 内层 button 的点击事件
  const handleInnerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("内层 button 被点击");
    // 阻止冒泡：外层 div 的 onClick 不会被触发
    e.stopPropagation();
  };

  return (
    <div onClick={handleOuterClick} style={{ padding: 20, background: "#eee" }}>
      <button onClick={handleInnerClick}>点我</button>
      {/* 点击 button 只会打印"内层 button 被点击" */}
    </div>
  );
}
\`\`\`

## 8. target vs currentTarget

\`\`\`tsx
function List() {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    // e.target：触发事件的元素（可能是 li，可能是 ul）
    console.log("target:", (e.target as HTMLElement).tagName);

    // e.currentTarget：绑定事件监听的元素（一定是 ul）
    console.log("currentTarget:", e.currentTarget.tagName);
  };

  return (
    <ul onClick={handleClick}>
      <li>A</li>
      <li>B</li>
      <li>C</li>
    </ul>
  );
}

// 点击 li 时：
// target: LI（点击的那个 li）
// currentTarget: UL（绑监听的元素）
\`\`\`

**实战技巧**：事件委托——把子元素的事件统一在父元素处理：

\`\`\`tsx
function List({ items }: { items: string[] }) {
  const handleClick = (e: React.MouseEvent<HTMLUListElement>) => {
    // e.target 是被点击的元素，可能是 li 也可能是 ul 本身
    const target = e.target as HTMLElement;
    // 用 closest 找到最近的 li
    const li = target.closest("li");
    if (li) {
      console.log("点击了：", li.textContent);
    }
  };

  return (
    <ul onClick={handleClick}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
\`\`\`

## 9. 常用事件类型速查表

\`\`\`ts
// 鼠标类
React.MouseEvent<T>      // click / mousedown / mouseup / mousemove
React.DragEvent<T>       // drag / drop
React.WheelEvent<T>      // wheel

// 表单类
React.ChangeEvent<T>     // input / select / textarea 的 change
React.FormEvent<T>       // form 的 submit
React.InputEvent<T>      // onInput

// 键盘类
React.KeyboardEvent<T>   // keydown / keyup / keypress

// 焦点类
React.FocusEvent<T>      // focus / blur

// 剪贴板
React.ClipboardEvent<T>  // copy / paste / cut

// 触摸
React.TouchEvent<T>      // touchstart / touchmove / touchend

// 滚动
React.UIEvent<T>         // scroll（更通用的事件）
\`\`\`

## 10. 内联事件处理函数的类型

直接在 JSX 里写事件处理函数时，TS 会自动推断类型，不用手写：

\`\`\`tsx
function Button() {
  // ✅ 内联写法：e 类型自动推断为 React.MouseEvent<HTMLButtonElement>
  return (
    <button onClick={(e) => {
      console.log(e.currentTarget.textContent);
      e.stopPropagation();
    }}>
      点我
    </button>
  );
}

// 但抽成独立函数时必须显式标注类型
function Button2() {
  // ✅ 抽函数：必须显式标类型
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget);
  };
  return <button onClick={handleClick}>点我</button>;
}
\`\`\`

## 11. 综合实战：带键盘交互的搜索框

\`\`\`tsx
import { useState, useRef } from "react";

function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 多种事件类型组合
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(query);
    } else if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select(); // 聚焦时全选
  };

  return (
    <input
      ref={inputRef}
      value={query}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder="输入关键词，Enter 搜索"
    />
  );
}

// 使用
function App() {
  return <SearchBox onSearch={(q) => console.log("搜索:", q)} />;
}
\`\`\`

## 小结

- React 所有事件继承自 \`SyntheticEvent\`，子类有 \`MouseEvent\`、\`ChangeEvent\`、\`KeyboardEvent\` 等。
- 事件类型带泛型 \`<T>\`，T 是元素类型，用于收窄 \`currentTarget\`。
- \`target\` 是触发元素，\`currentTarget\` 是绑监听元素。
- 表单提交必须 \`preventDefault()\`，阻止冒泡用 \`stopPropagation()\`。
- 内联事件函数类型自动推断，抽成独立函数要显式标类型。

## 避坑清单

- ❌ 用 \`React.SyntheticEvent\` 然后强制断言访问 \`target.value\`（应该用 \`ChangeEvent<T>\`）
- ❌ 表单提交不调 \`preventDefault()\`（会刷新页面）
- ❌ 用 \`e.keyCode\`（已废弃，应该用 \`e.key\`）
- ❌ 内联函数和抽函数混用风格（团队统一）

下一章我们看表单与受控组件——把事件类型用起来。`
  },

  // ============================================================
  // ch28: 表单与受控组件
  // ============================================================
  {
    id: "tsx3-ch28",
    group: "第四部分 事件与表单",
    icon: "📝",
    title: "ch28 表单与受控组件",
    content: `# ch28 表单与受控组件

## 为什么讲这个

表单是前端最高频的业务场景——登录、注册、搜索、设置页全是表单。React 的"受控组件"模式让表单数据完全由 state 控制，TS 给表单加类型保护后，错传字段、拼错 name 都能在编译期被发现。这一章把各种表单元素的 TS 类型、checkbox 特殊处理、表单提交一次讲透。

## 1. 什么是受控组件

"受控组件"= 表单元素的值由 React state 控制。

\`\`\`tsx
import { useState } from "react";

function ControlledInput() {
  // state 控制 input 的值
  const [value, setValue] = useState("");

  // input 的 value 绑定 state，onChange 更新 state
  // 这样 input 的值永远等于 state，React 完全控制
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="输入点东西"
    />
  );
}

// 对比"非受控组件"：input 自己管自己的值，React 不介入
// <input defaultValue="" />
\`\`\`

**受控的好处**：
1. 数据和 UI 同步，不会有"界面显示 A 但 state 是 B"的问题
2. 可以在 onChange 里做校验、转换
3. 提交时直接读 state，不用读 DOM

## 2. 文本框的 TS 类型

\`\`\`tsx
import { useState } from "react";

function TextInput() {
  const [name, setName] = useState("");

  // ChangeEvent<HTMLInputElement> 是 onChange 的事件类型
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target 类型收窄为 HTMLInputElement，可以安全访问 .value
    setName(e.target.value);
  };

  return (
    <div>
      <label>
        姓名：
        <input value={name} onChange={handleChange} />
      </label>
      <p>当前值：{name}</p>
    </div>
  );
}
\`\`\`

## 3. textarea 的类型

\`\`\`tsx
function TextArea() {
  const [content, setContent] = useState("");

  // 注意：textarea 用 HTMLTextAreaElement，不是 HTMLInputElement
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      rows={5}
      placeholder="多行文本"
    />
  );
}
\`\`\`

## 4. select 的类型

\`\`\`tsx
import { useState } from "react";

// 用字面量联合类型约束可选值
type Role = "admin" | "editor" | "viewer";

function RoleSelect() {
  const [role, setRole] = useState<Role>("viewer");

  // select 用 HTMLSelectElement
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // e.target.value 是 string，需要断言为 Role
    setRole(e.target.value as Role);
  };

  return (
    <select value={role} onChange={handleChange}>
      <option value="admin">管理员</option>
      <option value="editor">编辑</option>
      <option value="viewer">访客</option>
    </select>
  );
}
\`\`\`

**避坑**：\`e.target.value\` 是 \`string\`，但 state 是 \`Role\` 联合类型，必须用 \`as Role\` 断言。如果不断言，TS 会报错。

## 5. checkbox 的特殊处理

checkbox 的 \`checked\` 是 boolean，\`value\` 是字符串，跟其他表单元素不一样：

\`\`\`tsx
import { useState } from "react";

function Checkbox() {
  const [agree, setAgree] = useState(false);

  // checkbox 也用 ChangeEvent<HTMLInputElement>
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ⚠️ checkbox 读 .checked，不是 .value
    setAgree(e.target.checked);
  };

  return (
    <label>
      <input
        type="checkbox"
        checked={agree}
        onChange={handleChange}
      />
      我同意用户协议
    </label>
  );
}
\`\`\`

**多选 checkbox**：用对象或 Set 管理多个选中状态：

\`\`\`tsx
import { useState } from "react";

const HOBBIES = ["读书", "运动", "音乐", "旅行"] as const;
type Hobby = typeof HOBBIES[number];

function HobbyCheckboxes() {
  // 用 Record 把每个 hobby 映射到 boolean
  const [hobbies, setHobbies] = useState<Record<Hobby, boolean>>({
    读书: false,
    运动: false,
    音乐: false,
    旅行: false,
  });

  // 高阶函数：返回每个 hobby 对应的 onChange 处理器
  const handleChange = (hobby: Hobby) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHobbies({
      ...hobbies,
      [hobby]: e.target.checked,
    });
  };

  return (
    <div>
      {HOBBIES.map((hobby) => (
        <label key={hobby}>
          <input
            type="checkbox"
            checked={hobbies[hobby]}
            onChange={handleChange(hobby)}
          />
          {hobby}
        </label>
      ))}
      <p>
        已选：
        {Object.entries(hobbies)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join("、")}
      </p>
    </div>
  );
}
\`\`\`

## 6. radio 的类型

radio 也是 \`ChangeEvent<HTMLInputElement>\`，读 \`value\`：

\`\`\`tsx
import { useState } from "react";

type Gender = "male" | "female" | "other";

function GenderRadio() {
  const [gender, setGender] = useState<Gender>("male");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value as Gender);
  };

  return (
    <div>
      {(["male", "female", "other"] as const).map((g) => (
        <label key={g}>
          <input
            type="radio"
            name="gender"
            value={g}
            checked={gender === g}
            onChange={handleChange}
          />
          {g}
        </label>
      ))}
    </div>
  );
}
\`\`\`

## 7. 完整的表单提交

\`\`\`tsx
import { useState } from "react";

// 表单数据类型
interface FormData {
  username: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  agree: boolean;
}

const initialValues: FormData = {
  username: "",
  email: "",
  role: "viewer",
  agree: false,
};

function SignupForm() {
  const [form, setForm] = useState<FormData>(initialValues);

  // 通用更新函数：用 keyof FormData 约束字段名
  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setForm({ ...form, [field]: value });
  };

  // 表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认提交
    console.log("提交：", form);
    // 这里可以调 API
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 文本框 */}
      <input
        value={form.username}
        onChange={(e) => updateField("username", e.target.value)}
        placeholder="用户名"
      />

      {/* 邮箱 */}
      <input
        type="email"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="邮箱"
      />

      {/* select */}
      <select
        value={form.role}
        onChange={(e) => updateField("role", e.target.value as FormData["role"])}
      >
        <option value="admin">管理员</option>
        <option value="editor">编辑</option>
        <option value="viewer">访客</option>
      </select>

      {/* checkbox */}
      <label>
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => updateField("agree", e.target.checked)}
        />
        同意协议
      </label>

      <button type="submit" disabled={!form.agree}>提交</button>
    </form>
  );
}
\`\`\`

## 8. 用泛型函数统一处理字段

\`\`\`tsx
// updateField 用了泛型 <K extends keyof FormData>
// K 是字段名，value 必须对应字段的类型
// 这样写：
updateField("username", "Alice");  // ✅ value 是 string
updateField("agree", true);         // ✅ value 是 boolean
updateField("role", "admin");       // ✅ value 是联合类型
// updateField("username", 123);    // ❌ 报错：number 不是 string
// updateField("xxx", "Alice");     // ❌ 报错：xxx 不是字段名
\`\`\`

**这种写法的好处**：错传字段名或值类型时，TS 编译期就报错，避免运行时 bug。

## 9. 多步表单的状态管理

\`\`\`tsx
import { useState } from "react";

interface Step1Data {
  name: string;
  age: number;
}
interface Step2Data {
  email: string;
  phone: string;
}

// 多步表单：每步独立 state
function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1Data>({ name: "", age: 0 });
  const [step2, setStep2] = useState<Step2Data>({ email: "", phone: "" });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...step1, ...step2 };
    console.log("最终提交：", finalData);
  };

  if (step === 1) {
    return (
      <form onSubmit={handleStep1Submit}>
        <input
          value={step1.name}
          onChange={(e) => setStep1({ ...step1, name: e.target.value })}
          placeholder="姓名"
        />
        <input
          type="number"
          value={step1.age}
          onChange={(e) => setStep1({ ...step1, age: Number(e.target.value) })}
          placeholder="年龄"
        />
        <button type="submit">下一步</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleFinalSubmit}>
      <input
        value={step2.email}
        onChange={(e) => setStep2({ ...step2, email: e.target.value })}
        placeholder="邮箱"
      />
      <input
        value={step2.phone}
        onChange={(e) => setStep2({ ...step2, phone: e.target.value })}
        placeholder="电话"
      />
      <button type="button" onClick={() => setStep(1)}>上一步</button>
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

## 小结

- 受控组件 = 表单值由 React state 控制，onChange 更新 state。
- 不同表单元素对应不同 ChangeEvent 类型：input/checkbox 用 \`HTMLInputElement\`，textarea 用 \`HTMLTextAreaElement\`，select 用 \`HTMLSelectElement\`。
- checkbox 读 \`e.target.checked\`（boolean），其他读 \`e.target.value\`（string）。
- 用泛型函数 \`updateField<K extends keyof FormData>\` 统一字段更新，TS 自动校验类型。
- 表单提交用 \`FormEvent\`，必须 \`preventDefault()\`。

## 避坑清单

- ❌ select/radio 不用 \`as\` 断言（string 不能直接赋给联合类型）
- ❌ checkbox 读 \`value\`（应该读 \`checked\`）
- ❌ 表单提交不调 \`preventDefault()\`（页面会刷新）
- ❌ 每个字段单独写 onChange 函数（应该用泛型 \`updateField\` 统一处理）

下一章我们看非受控组件与 useRef——另一种表单处理思路。`
  },

  // ============================================================
  // ch29: 非受控组件与 useRef
  // ============================================================
  {
    id: "tsx3-ch29",
    group: "第四部分 事件与表单",
    icon: "🔌",
    title: "ch29 非受控组件与 useRef",
    content: `# ch29 非受控组件与 useRef

## 为什么讲这个

受控组件虽好，但每次输入都触发 state 更新和重渲染，输入大段文本时可能卡顿。**非受控组件**让 DOM 自己管理值，React 只在需要时（提交、聚焦、重置）才读 DOM。这一章讲 \`useRef\` 在表单里的用法、\`ref.current\` 判空、focus/reset 实战。

## 1. 受控 vs 非受控对比

\`\`\`tsx
import { useState, useRef } from "react";

// 受控：值由 state 控制，每次输入都触发重渲染
function Controlled() {
  const [value, setValue] = useState("");
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 非受控：值由 DOM 自己管，React 用 ref 读取
function Uncontrolled() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // 需要时才通过 ref 读 DOM
    console.log(inputRef.current?.value);
  };

  return (
    <div>
      {/* defaultValue 设置初始值，之后由 DOM 管理 */}
      <input ref={inputRef} defaultValue="hello" />
      <button onClick={handleClick}>获取值</button>
    </div>
  );
}
\`\`\`

**选哪种**？
- 简单表单（登录、搜索）→ 受控
- 复杂表单（多字段、性能敏感）→ 非受控（或用 React Hook Form）
- 需要触发聚焦、滚动、测量尺寸 → 必须用 ref

## 2. useRef 在表单里的基础用法

\`\`\`tsx
import { useRef } from "react";

function Form() {
  // 给每个表单元素建一个 ref
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 通过 ref.current 读 DOM
    // ⚠️ 必须判空，ref.current 类型是 HTMLInputElement | null
    const data = {
      name: nameRef.current?.value ?? "",
      email: emailRef.current?.value ?? "",
      age: Number(ageRef.current?.value ?? 0),
    };
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} placeholder="姓名" />
      <input ref={emailRef} type="email" placeholder="邮箱" />
      <input ref={ageRef} type="number" placeholder="年龄" />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

## 3. ref.current 的判空

\`ref.current\` 类型默认带 \`| null\`，使用前必须判空：

\`\`\`tsx
import { useRef } from "react";

function Demo() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // ❌ 错误：不判空，TS 报错
    // inputRef.current.focus();
    // 报错：'inputRef.current' is possibly 'null'

    // ✅ 方式 1：可选链
    inputRef.current?.focus();
    // 注意：?.focus() 等价于 if (inputRef.current) inputRef.current.focus()

    // ✅ 方式 2：if 判空
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = "";
      // 在 if 块内，inputRef.current 类型收窄为 HTMLInputElement
    }

    // ✅ 方式 3：赋值给局部变量
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  };

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>操作</button>
    </div>
  );
}
\`\`\`

## 4. focus 与自动聚焦

经典场景：页面加载后自动聚焦输入框。

\`\`\`tsx
import { useRef, useEffect } from "react";

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 组件挂载后自动聚焦
    inputRef.current?.focus();
  }, []); // 空依赖数组：只在挂载时执行一次

  return <input ref={inputRef} placeholder="加载后自动聚焦" />;
}
\`\`\`

## 5. 重置表单

非受控表单的重置有两种方式：

\`\`\`tsx
import { useRef } from "react";

function ResetForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleReset = () => {
    // 方式 1：调用 form 的 reset 方法（DOM 原生）
    formRef.current?.reset();
    // reset() 会把所有表单元素恢复到 defaultValue
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("提交");
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input defaultValue="" placeholder="姓名" />
      <input defaultValue="" type="email" placeholder="邮箱" />
      <button type="submit">提交</button>
      <button type="button" onClick={handleReset}>重置</button>
    </form>
  );
}
\`\`\`

## 6. 单独清空某个 input

\`\`\`tsx
import { useRef } from "react";

function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    // 直接操作 DOM 清空 input
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus(); // 清空后自动聚焦
    }
  };

  return (
    <div>
      <input ref={inputRef} placeholder="搜索..." />
      <button onClick={handleClear}>清空</button>
    </div>
  );
}
\`\`\`

## 7. forwardRef 让自定义组件支持 ref

如果自定义的 Input 组件需要被父组件 ref，用 \`forwardRef\`：

\`\`\`tsx
import { forwardRef, useRef } from "react";

// 自定义 Input 组件，支持父组件传 ref
const FancyInput = forwardRef<HTMLInputElement, { placeholder?: string }>(
  (props, ref) => {
    return (
      <input
        ref={ref}
        placeholder={props.placeholder}
        style={{ border: "1px solid #ccc", padding: "8px" }}
      />
    );
  }
);

FancyInput.displayName = "FancyInput";

// 父组件
function Parent() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="试试聚焦" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}
\`\`\`

## 8. 综合实战：可聚焦可清空的搜索框

\`\`\`tsx
import { useRef, useEffect } from "react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  autoFocus?: boolean;
}

function SearchBox({ onSearch, autoFocus = false }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = inputRef.current?.value ?? "";
    onSearch(value);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        placeholder="输入关键词"
        style={{ padding: "8px", marginRight: "8px" }}
      />
      <button type="submit">搜索</button>
      <button type="button" onClick={handleClear}>清空</button>
    </form>
  );
}

// 使用：
// <SearchBox onSearch={(q) => console.log(q)} autoFocus />
\`\`\`

## 9. useRef 保存可变值（非表单场景）

\`useRef\` 不只能访问 DOM，还能保存可变值，**不触发重渲染**：

\`\`\`tsx
import { useRef, useState, useEffect } from "react";

function Timer() {
  const [count, setCount] = useState(0);
  // 用 ref 保存 timer id，不触发重渲染
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 启动定时器，把 id 存到 ref
    timerRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    // 清理：组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={handlePause}>暂停</button>
    </div>
  );
}
\`\`\`

**关键点**：\`timerRef.current\` 变化不会触发重渲染——这正是我们想要的，timer id 不需要显示在 UI 上。

## 10. 什么时候用非受控

\`\`\`tsx
// ✅ 适合非受控的场景
// 1. 表单字段多，性能敏感（每次输入都 setState 卡顿）
// 2. 只在提交时才需要数据，不实时校验
// 3. 需要触发 focus / scroll / 测量尺寸
// 4. 集成第三方非 React 库（如 jQuery 插件）

// ❌ 不适合非受控的场景
// 1. 需要实时校验（如密码强度）
// 2. 需要根据输入动态显示其他 UI
// 3. 需要把表单数据同步到其他地方
// 这些场景应该用受控组件或 React Hook Form
\`\`\`

## 小结

- 非受控组件用 \`useRef\` 访问 DOM，值由 DOM 管理。
- \`ref.current\` 默认带 \`| null\`，使用前必须判空（可选链或 if）。
- 自动聚焦、表单重置、单独清空 input 都用 ref。
- \`useRef\` 还能保存可变值（如 timer id），不触发重渲染。
- 复杂表单推荐用 React Hook Form，比手写 ref 更高效。

## 避坑清单

- ❌ 不判空直接用 \`ref.current\`（运行时可能是 null）
- ❌ 在渲染阶段读 \`ref.current.value\`（应该在事件处理函数里读）
- ❌ 用 \`useRef\` 保存需要触发重渲染的状态（应该用 \`useState\`）
- ❌ 受控和非受控混用（同一个 input 不能既 \`value\` 又 \`defaultValue\`）

至此第四部分"事件与表单"开头的 3 章讲完，下一批章节我们会进入 Hooks 全解。`
  },
];

export { chapters };
