// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第二批章节
// -------------------------------------------------------------
// 覆盖：第一部分 TypeScript 类型基础 下半
// 包含 5 个章节：ch06 ~ ch10
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
  // ch06: 函数类型完整解
  // ============================================================
  {
    id: "tsx3-ch06",
    group: "第一部分 TypeScript 类型基础",
    icon: "🔧",
    title: "ch06 函数类型完整解",
    content: `# ch06 函数类型完整解

## 为什么讲这个

React 组件本身就是函数，事件处理是函数，Hooks 是函数，回调也是函数。函数类型如果没吃透，你写出来的 props 类型会到处报错，事件处理器永远不知道该传什么参数。这一章把函数类型一次讲完——从声明、参数、重载，到 \`this\` 与箭头函数的差异。

## 1. 函数类型的两种声明方式

\`\`\`ts
// 写法 1：函数声明
function add(a: number, b: number): number {
  return a + b; // 返回 number，与签名一致
}

// 写法 2：函数表达式 + 类型注解
const add2: (a: number, b: number) => number = (a, b) => {
  return a + b; // 这里 a、b 不必再注解，因为左边已经声明
};

// 写法 3：用 type 起别名，便于复用
type BinaryOp = (a: number, b: number) => number;
const add3: BinaryOp = (a, b) => a + b;
const mul: BinaryOp = (a, b) => a * b;
\`\`\`

**关键差异**：函数声明有"提升"，可以在定义前调用；函数表达式不会提升。React 里两种都行，组件一般用声明式（更直观）。

## 2. 可选参数与默认参数

\`\`\`ts
// 可选参数：用 ? 标记，必须放在必填参数后面
function greet(name: string, greeting?: string): string {
  // greeting 可能是 undefined，需要兜底
  return \`\${greeting ?? "Hello"}, \${name}!\`;
}

greet("Alice");              // ✅ Hello, Alice!
greet("Alice", "Hi");        // ✅ Hi, Alice!

// 默认参数：直接在签名里给默认值
function greet2(name: string, greeting: string = "Hello"): string {
  return \`\${greeting}, \${name}!\`; // greeting 一定是 string，不会是 undefined
}

greet2("Bob");               // Hello, Bob!
greet2("Bob", "Hey");        // Hey, Bob!
\`\`\`

> **区别**：可选参数的内部类型是 \`string | undefined\`；默认参数的类型就是 \`string\`，因为总有值。能用默认参数就用默认参数，更安全。

## 3. 剩余参数 rest

\`\`\`ts
// 剩余参数：把多个参数收成一个数组
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);       // 6
sum(1, 2, 3, 4, 5); // 15

// React 场景：组合 className
function classNames(...names: (string | false | null | undefined)[]): string {
  // 过滤掉 false / null / undefined，再拼接
  return names.filter(Boolean).join(" ");
}

classNames("btn", "btn-primary", false && "disabled"); // "btn btn-primary"
\`\`\`

剩余参数的类型必须是数组（\`T[]\`）。在 React 里写 \`classNames\` 这种工具函数时特别常用。

## 4. 函数重载：同一个函数多种签名

JS 函数经常"参数类型不同，行为不同"。TS 用**重载**描述这种场景：

\`\`\`ts
// 重载签名：定义对外暴露的多种调用形态
function format(input: number): string;
function format(input: Date): string;
function format(input: string): string;

// 实现签名：对外不可见，必须兼容所有重载
function format(input: number | Date | string): string {
  if (typeof input === "number") {
    return input.toFixed(2); // 数字保留两位小数
  }
  if (input instanceof Date) {
    return input.toISOString(); // 日期转 ISO
  }
  return input.toUpperCase(); // 字符串转大写
}

format(3.14159);   // "3.14"
format(new Date()); // ISO 字符串
format("hello");    // "HELLO"
// format(true);    // ❌ 报错：没有匹配的重载
\`\`\`

**关键点**：调用方看到的是重载签名，实现签名对外不可见。实现必须能处理所有重载情况。

## 5. this 类型：method 风格

普通函数的 \`this\` 在 strict 模式下默认是 \`unknown\`，需要手动指定：

\`\`\`ts
// 第一个参数 this 是"语法位置"，不占实际参数
function getAge(this: { age: number }) {
  return this.age; // this 被收窄为 { age: number }
}

const obj = { age: 18, getAge };
obj.getAge(); // 18

// getAge(); // ❌ 报错：必须通过对象调用，保证 this 正确
\`\`\`

这种写法在 React 里**很少直接用**，因为 React 函数组件和 Hook 都不依赖 \`this\`。但读第三方库源码时会遇到。

## 6. 箭头函数 vs function：this 的核心差异

\`\`\`ts
const obj = {
  name: "Alice",
  // 普通函数：this 由"调用方式"决定
  greet() {
    return this.name; // 通过 obj.greet() 调用时 this 是 obj
  },
  // 箭头函数：this 由"定义位置"决定，继承外层
  greetArrow: () => {
    // this 不是 obj，而是外层作用域（通常是 window / undefined）
    // return this.name; // ❌ 报错或拿到错误值
    return "Hello";
  },
};
\`\`\`

**React 里的应用**：

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);

  // ✅ 箭头函数：自动绑定外层作用域，能直接拿到 setCount
  const handleClick = () => {
    setCount(c => c + 1);
  };

  // 也能用普通函数，但作为事件处理器要小心 this
  // 在 React 函数组件里没有 this 问题，因为不依赖 this

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

**总结**：React 函数组件里箭头函数和普通函数都能用，但箭头函数更省心（不用 bind）。

## 7. React 场景：事件处理器的函数类型

\`\`\`tsx
import { useState } from "react";

function SearchInput() {
  const [query, setQuery] = useState("");

  // React 事件类型：React.ChangeEvent<HTMLInputElement>
  // 这是 React 自定义的合成事件，不是原生 DOM 事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // e.target 是 input 元素，有 value 属性
  };

  // 表单提交：React.FormEvent<HTMLFormElement>
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认提交行为
    console.log("搜索：", query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={handleChange} placeholder="输入关键字" />
      <button type="submit">搜索</button>
    </form>
  );
}
\`\`\`

**关键**：\`React.ChangeEvent<T>\` 里的 \`T\` 是触发事件的元素类型——\`<input>\` 用 \`HTMLInputElement\`，\`<select>\` 用 \`HTMLSelectElement\`，别填错。

## 8. React 场景：自定义 Hook 的函数类型

\`\`\`tsx
import { useState, useEffect } from "react";

// 自定义 Hook：返回值类型可以靠推断，但公共 Hook 推荐显式标注
function useToggle(initial: boolean = false): [boolean, () => void] {
  // 返回元组：[当前值, 切换函数]
  const [value, setValue] = useState<boolean>(initial);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}

// 使用
function Switch() {
  const [on, toggle] = useToggle(false);
  return (
    <button onClick={toggle}>
      {on ? "开" : "关"}
    </button>
  );
}
\`\`\`

返回元组的好处：调用方解构出的名字可以随便取，不会被字段名束缚。

## 小结

- 函数类型有两种写法：声明式和表达式，复用场景用 \`type\` 起别名。
- 可选参数用 \`?\`，默认参数直接赋值，能用默认参数就别用可选。
- 剩余参数类型必须是数组，React 里 \`classNames\` 这种工具很常用。
- 函数重载：定义多个签名 + 一个实现，处理"参数不同行为不同"。
- 箭头函数不绑定 \`this\`，React 事件处理器用它最省心。
- 自定义 Hook 返回元组比返回对象更灵活。

## 避坑清单

- ❌ 可选参数放在必填参数前面（语法错误，必须放后面）
- ❌ 重载的实现签名对外暴露（应该用重载签名调用，实现签名不可见）
- ❌ 在 .tsx 里用箭头函数写 \`<T>\` 泛型（被识别为 JSX，要写成 \`<T,>\`）
- ❌ 事件类型乱填 \`React.MouseEvent\`（input 用 ChangeEvent，按钮才用 MouseEvent）
- ❌ Hook 不显式标注返回类型，结果推断成 \`any[]\`（公共 Hook 应该显式标）

下一章我们看"字面量类型与联合类型"——React 状态机的核心。`
  },

  // ============================================================
  // ch07: 字面量类型与联合类型
  // ============================================================
  {
    id: "tsx3-ch07",
    group: "第一部分 TypeScript 类型基础",
    icon: "🔀",
    title: "ch07 字面量类型与联合类型",
    content: `# ch07 字面量类型与联合类型

## 为什么讲这个

很多业务场景下，变量的取值范围是**有限可枚举**的：状态只有 \`idle | loading | success | error\`，方向只有 \`up | down | left | right\`，主题只有 \`light | dark\`。这种场景用 \`string\` 描述太宽，用 \`enum\` 又重——**字面量类型 + 联合类型**是最合适的工具。

## 1. 字符串字面量类型

\`\`\`ts
// 把变量限定为某个具体字符串
let direction: "up" = "up";
// direction = "down"; // ❌ 报错：只能赋 "up"

// 更常用：联合多个字面量
type Direction = "up" | "down" | "left" | "right";

function move(dir: Direction): string {
  return \`向\${dir}移动\`;
}

move("up");    // ✅
move("left");  // ✅
// move("north"); // ❌ 报错：不是联合里的成员
\`\`\`

**关键理解**：\`"up"\` 既是值也是类型。当它作为类型时，表示"这个位置只能是字符串 \`up\`"。

## 2. 数字字面量类型

\`\`\`ts
// 骰子点数只能是 1~6
type Dice = 1 | 2 | 3 | 4 | 5 | 6;

function roll(): Dice {
  // Math.floor(Math.random() * 6) + 1 返回 number，需要断言为 Dice
  return (Math.floor(Math.random() * 6) + 1) as Dice;
}

const point = roll(); // 类型是 Dice
\`\`\`

数字字面量类型比字符串少见，主要用在协议字段、版本号、固定码表等场景。

## 3. 布尔字面量类型

\`\`\`ts
// boolean 实际上是 true | false 的别名
type Bool = true | false;

// 单独的 true / false 也能作为类型
let alwaysTrue: true = true;
// alwaysTrue = false; // ❌ 报错

// 应用场景：描述"恒为真"的标志位
interface SuccessResponse {
  success: true;   // 这个字段永远是 true
  data: unknown;
}

interface ErrorResponse {
  success: false;  // 这个字段永远是 false
  error: Error;
}
\`\`\`

这种写法是后面"判别联合"的基础——用 \`success: true\` 或 \`success: false\` 当 tag。

## 4. 联合类型基础：|

\`\`\`ts
// 联合类型：变量可以是多种类型之一
type ID = string | number;

function findUser(id: ID) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // 这里 id 收窄为 string
  } else {
    console.log(id.toFixed(0));    // 这里 id 收窄为 number
  }
}

findUser("abc123");
findUser(100);
\`\`\`

**联合的精髓**：访问联合类型的成员时，只能访问**所有类型共有的属性**。要访问独有属性，必须先收窄（用 \`typeof\`、\`in\`、\`instanceof\`）。

## 5. null / undefined 联合

\`\`\`ts
// "可能没有值"用 null 联合
type User = { name: string } | null;

function getName(user: User): string {
  if (user === null) {
    return "匿名"; // 处理 null 分支
  }
  return user.name; // 这里 user 收窄为 { name: string }
}

// 简写：用 ? 修饰的字段，内部就是 T | undefined
interface Form {
  email?: string; // 等价于 email: string | undefined
}
\`\`\`

React 里 \`useState<T | null>(null)\` 是非常常见的模式——初始值是 \`null\`，加载完后是 \`T\`。

## 6. 字面量联合在 React 状态中的应用

\`\`\`tsx
import { useState } from "react";

// 把所有可能的状态枚举出来
type Status = "idle" | "loading" | "success" | "error";

function DataLoader() {
  const [status, setStatus] = useState<Status>("idle");

  const startFetch = () => {
    setStatus("loading"); // ✅ 只能赋这 4 个值之一
    fetch("/api/data")
      .then(res => {
        if (!res.ok) throw new Error("失败");
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  // 渲染时根据字面量做条件分支
  return (
    <div>
      {status === "idle" && <button onClick={startFetch}>加载</button>}
      {status === "loading" && <span>加载中...</span>}
      {status === "success" && <span>✅ 成功</span>}
      {status === "error" && <span>❌ 失败</span>}
    </div>
  );
}
\`\`\`

**好处**：\`setStatus\` 的参数被限定为 4 个字符串之一，传错立即报错；渲染分支用 \`===\` 比较字面量，TS 会帮你检查拼写。

## 7. 字面量联合 vs 枚举：怎么选

\`\`\`ts
// 写法 1：字面量联合
type Status1 = "idle" | "loading" | "success" | "error";
const s1: Status1 = "loading";

// 写法 2：字符串枚举
enum Status2 {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
}
const s2: Status2 = Status2.Loading;
\`\`\`

| 对比项 | 字面量联合 | 枚举 |
| --- | --- | --- |
| 编译产物 | 无（类型被擦除） | 真实对象 |
| 调用方式 | 直接写字符串 | \`Status.Loading\` |
| 摇树优化 | 友好 | 一般 |
| 可读性 | 简洁 | 更显式 |
| 跨文件复用 | 需 export type | 需 export enum |

**React 项目主流**：字面量联合 + const 对象。原因：编译产物小、对 tree-shaking 友好。

## 8. React 场景：组件 variant 用字面量联合

\`\`\`tsx
// variant 用字面量联合，IDE 有自动补全
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  variant?: ButtonVariant; // 可选，默认 primary
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
}: ButtonProps) {
  // variant 收窄为具体的字面量，可以做映射
  const variantClass: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    ghost: "btn-ghost",
  };

  const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  return (
    <button
      className={\`btn \${variantClass[variant]} \${sizeClass[size]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 使用：
// <Button variant="danger" size="sm">删除</Button>
// <Button variant="primary">保存</Button>
\`\`\`

**亮点**：\`variantClass\` 是 \`Record<ButtonVariant, string>\`，新增一个 variant 时如果有遗漏，TS 立刻报错。这是"穷尽检查"的雏形，下一章会展开。

## 小结

- 字面量类型把变量限定为具体值，字符串字面量最常见。
- 联合类型 \`A | B\` 表示"非此即彼"，访问成员属性需要先收窄。
- \`null\` / \`undefined\` 联合用于描述"可能没有值"。
- React 状态、组件 variant 推荐用字面量联合，比 enum 更轻量。
- 联合类型 + \`Record<...\` 映射可以实现编译期穷尽检查。

## 避坑清单

- ❌ 用 \`string\` 描述有限取值（应该用字面量联合）
- ❌ 联合类型直接访问非共有属性（应该先 typeof / in 收窄）
- ❌ 字面量联合没 export（跨文件复用需要导出 type）
- ❌ 把枚举值写错大小写（\`"Loading"\` 不等于 \`"loading"\`）

下一章我们看"交叉类型与类型收窄"——把多个类型合起来的艺术。`
  },

  // ============================================================
  // ch08: 交叉类型与类型收窄
  // ============================================================
  {
    id: "tsx3-ch08",
    group: "第一部分 TypeScript 类型基础",
    icon: "🧬",
    title: "ch08 交叉类型与类型收窄",
    content: `# ch08 交叉类型与类型收窄

## 为什么讲这个

联合类型解决"或"的问题，交叉类型解决"且"的问题——一个对象**同时满足多个类型**。配合类型收窄（narrowing），你能写出又安全又灵活的业务代码。React 里 HOC、组合 props、判别联合都离不开这两个工具。

## 1. 交叉类型 &：把多个类型合并

\`\`\`ts
// 两个独立的能力
type HasName = { name: string };
type HasAge = { age: number };

// 交叉：同时具备 name 和 age
type Person = HasName & HasAge;

const alice: Person = {
  name: "Alice",
  age: 18,
};

// 等价于直接写：
// type Person = { name: string; age: number }
\`\`\`

**核心语义**：\`A & B\` 表示"既是 A 又是 B"，必须同时满足两个类型的所有字段。

## 2. 交叉类型的实际用途：组合能力

\`\`\`ts
// 把多个"能力接口"组合成一个完整对象
type Loggable = { log: (msg: string) => void };
type Serializable = { serialize: () => string };
type Resetable = { reset: () => void };

// 一个完整的"服务"对象需要同时具备这三种能力
type Service = Loggable & Serializable & Resetable;

function createService(): Service {
  return {
    log(msg) { console.log("[Service]", msg); },
    serialize() { return JSON.stringify({ ts: Date.now() }); },
    reset() { console.log("reset"); },
  };
}
\`\`\`

这种模式在 React 高阶组件（HOC）和工具函数里非常常见——把多个 props 类型叠加。

## 3. 交叉类型的陷阱：字段冲突

\`\`\`ts
// 两个类型对同一字段定义了不同类型
type A = { value: string };
type B = { value: number };

type C = A & B;
// C 的 value 类型是 string & number，即 never
// 意思是这个字段不可能存在合法值

const c: C = { value: "" };
// ❌ 报错：number 不能赋给 never
\`\`\`

**避坑**：交叉类型叠加时，同名字段类型必须能合并（要么相同、要么是子类型），否则会被推成 \`never\`。

## 4. 类型收窄：typeof

TS 在条件分支里会自动收窄类型：

\`\`\`ts
function handle(input: string | number) {
  // 进入 if 之前，input 是 string | number
  if (typeof input === "string") {
    console.log(input.toUpperCase()); // 这里收窄为 string
  } else {
    console.log(input.toFixed(2));    // 这里收窄为 number
  }
}
\`\`\`

\`typeof\` 能识别的类型：\`string\`、\`number\`、\`boolean\`、\`symbol\`、\`bigint\`、\`undefined\`、\`function\`、\`object\`。注意 \`null\` 的 typeof 也是 \`"object"\`，要单独判 \`=== null\`。

## 5. 类型收窄：in 操作符

判断对象是否有某个属性，TS 会按"有 / 没有"分别收窄：

\`\`\`ts
type Dog = { bark: () => void };
type Cat = { meow: () => void };

function speak(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark(); // 这里收窄为 Dog
  } else {
    animal.meow(); // 这里收窄为 Cat
  }
}
\`\`\`

\`in\` 适合区分"字段不同的对象类型"。但前提是字段名不一样——如果两个类型都有 \`name\`，\`in\` 就分不开。

## 6. 类型收窄：instanceof

判断对象是不是某个类的实例：

\`\`\`ts
function handleError(err: Error | string) {
  if (err instanceof Error) {
    console.log(err.message, err.stack); // 收窄为 Error
  } else {
    console.log(err.toUpperCase());      // 收窄为 string
  }
}
\`\`\`

\`instanceof\` 只能用于 \`class\` 实例，对 \`interface\` / \`type\` 描述的纯对象无效。

## 7. 判别联合 discriminated union

这是 React 里**最重要的类型模式之一**。用一个公共字段（叫 \`tag\` 或 \`type\`）当"判别器"，TS 能根据这个字段直接收窄：

\`\`\`ts
// 所有变体都有 status 字段，但字面量不同
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: Error };

function render(state: RequestState): string {
  // 用 switch 比较 status，TS 自动收窄每个分支
  switch (state.status) {
    case "idle":
      return "请点击加载";       // state 是 { status: "idle" }
    case "loading":
      return "加载中...";        // state 是 { status: "loading" }
    case "success":
      return state.data;         // state.data 可访问
    case "error":
      return state.error.message; // state.error 可访问
  }
}
\`\`\`

**关键**：判别字段必须是**字面量类型**（\`"idle"\` 而不是 \`string\`），否则 TS 没法收窄。

## 8. React 场景：用判别联合管理异步状态

\`\`\`tsx
import { useState, useEffect } from "react";

// 用判别联合描述异步请求的全部状态
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

// 泛型组件：根据 status 渲染不同 UI
function AsyncView<T>({ state }: { state: AsyncState<T> }) {
  switch (state.status) {
    case "idle":
      return <div>暂无数据</div>;
    case "loading":
      return <div>加载中...</div>;
    case "success":
      // 这里 state.data 类型是 T，可以安全渲染
      return <div>{String(state.data)}</div>;
    case "error":
      return <div style={{ color: "red" }}>{state.error.message}</div>;
  }
}

function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<AsyncState<{ name: string }>>({
    status: "idle",
  });

  useEffect(() => {
    setState({ status: "loading" });
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setState({ status: "success", data }))
      .catch(err => setState({ status: "error", error: err }));
  }, [userId]);

  return <AsyncView state={state} />;
}
\`\`\`

**好处**：\`switch\` 里每个分支的类型都被精确收窄，访问 \`state.data\` 不会报错，也避免了"loading 时访问 data 为 undefined"的运行时坑。

## 9. 穷尽检查：用 never 兜底

判别联合配合 \`never\` 可以实现编译期穷尽检查——新增一个状态但忘了处理时，TS 立刻报错：

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // 把 shape 赋给 never，如果还有没处理的分支，TS 报错
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 如果以后给 Shape 加 | { kind: "rectangle"; w: number; h: number }
// area 函数会立刻报错：rectangle 不能赋给 never
\`\`\`

这是大型项目里**最实用的防御性编程模式**，新增分支时强制你处理。

## 小结

- 交叉类型 \`A & B\` 表示"同时是 A 和 B"，用于组合多个类型。
- 同名字段类型冲突会被推成 \`never\`，避免使用。
- 类型收窄三种方式：\`typeof\`、\`in\`、\`instanceof\`。
- 判别联合用字面量字段当 tag，配合 switch 实现精确收窄。
- \`never\` 兜底实现穷尽检查，新增分支时编译期报错。

## 避坑清单

- ❌ 用 \`string\` 当判别字段（必须是字面量类型才能收窄）
- ❌ 交叉类型同名字段类型不同（会被推成 \`never\`）
- ❌ 用 \`typeof\` 判 \`null\`（typeof null 是 "object"，要 === null）
- ❌ switch 里漏掉分支又没 default（应该用 never 兜底穷尽检查）

下一章我们看"类型断言与类型守卫"——告诉 TS "我知道得比你多"。`
  },

  // ============================================================
  // ch09: 类型断言与类型守卫
  // ============================================================
  {
    id: "tsx3-ch09",
    group: "第一部分 TypeScript 类型基础",
    icon: "🎯",
    title: "ch09 类型断言与类型守卫",
    content: `# ch09 类型断言与类型守卫

## 为什么讲这个

类型推断不可能 100% 准确——DOM 查询、JSON.parse、第三方库返回值，TS 经常拿到的类型是 \`unknown\` 或 \`any\`。这时你要"告诉 TS 真实类型"，工具就是**断言**和**类型守卫**。断言是"我说了算"，守卫是"我证明给你看"，两者各有风险。

## 1. as 断言：告诉 TS 一个更具体的类型

\`\`\`ts
// DOM 查询返回 HTMLElement | null，但我们知道它就是 input
const input = document.querySelector("#myInput") as HTMLInputElement;
input.value = "hello"; // 直接用，不必再判空

// 等价写法：尖括号语法（.tsx 里不能用，会和 JSX 冲突）
// const input = <HTMLInputElement>document.querySelector("#myInput");
\`\`\`

**风险**：如果元素实际不是 \`input\`，运行时 \`input.value\` 会是 \`undefined\`，但 TS 不会拦你。所以 \`as\` 是"你向 TS 担保类型对"，TS 不再检查。

## 2. as 断言的合法范围

\`as\` 不是想断什么就断什么，只能断成"相关类型"：

\`\`\`ts
let s: string = "hello";
let n: number = s as number; // ❌ 报错：string 和 number 不相关
let n2: number = s as unknown as number; // ✅ 双重断言能绕过，但极不推荐
\`\`\`

正确用法是断言成子类型或父类型：

\`\`\`ts
// 父 → 子：常见，比如 Event → MouseEvent
const e: Event = new MouseEvent("click");
const mouseEvent = e as MouseEvent;

// 子 → 父：几乎不需要
const s: string = "hi" as string | number;
\`\`\`

## 3. 非空断言 !：告诉 TS "这里不是 null"

\`\`\`ts
// querySelector 可能返回 null，但你知道它存在
const el = document.querySelector("#app")!;
// ! 告诉 TS：跳过 null 检查，el 一定是 HTMLElement
el.innerHTML = "hello";

// React 里的典型场景：useRef 初始 null，但渲染后一定有值
function Input() {
  const ref = useRef<HTMLInputElement>(null);

  const focus = () => {
    // 直接 ref.current.focus() 会报错，因为可能是 null
    ref.current!.focus(); // ! 断言当前一定有值
  };

  return <input ref={ref} />;
}
\`\`\`

**避坑**：\`!\` 用多了等于关掉了空值检查。只在"调用时机保证有值"的场景用（比如 ref 在 useEffect 后访问）。

## 4. const 断言：让对象"完全只读"

普通 \`as const\` 把字面量类型固定下来：

\`\`\`ts
// 没有 as const：类型是 { role: string }，role 可以是任意字符串
const config = { role: "admin" };
// config.role = "user"; // ✅ 类型允许

// 有 as const：role 类型变成 "admin"，不可改
const config2 = { role: "admin" } as const;
// config2.role = "user"; // ❌ 报错："admin" 不能赋给 "user"
\`\`\`

数组 \`as const\` 会变成元组：

\`\`\`ts
// 没断言：string[]
const arr = ["a", "b", "c"];

// 断言后：readonly ["a", "b", "c"]
const arr2 = ["a", "b", "c"] as const;
arr2[0]; // 类型是 "a"，不是 string
\`\`\`

**典型应用**：替代 enum 的"常量对象 + 联合类型"模式：

\`\`\`ts
const Role = {
  Admin: "ADMIN",
  Editor: "EDITOR",
  Viewer: "VIEWER",
} as const;

// 自动推导出联合类型 "ADMIN" | "EDITOR" | "VIEWER"
type Role = typeof Role[keyof typeof Role];

function canEdit(role: Role): boolean {
  return role === Role.Admin || role === Role.Editor;
}
\`\`\`

## 5. 类型谓词 is：自定义类型守卫函数

普通函数返回 boolean，TS 不会根据返回值收窄参数类型。用 \`is\` 关键字声明返回类型，可以让 TS 收窄：

\`\`\`ts
// 普通函数：返回 boolean，但 input 不会被收窄
function isString(input: unknown): boolean {
  return typeof input === "string";
}

function handle(input: unknown) {
  if (isString(input)) {
    // ❌ input 还是 unknown，不能调 toUpperCase
  }
}

// 用 is 声明：告诉 TS "如果函数返回 true，input 就是 string"
function isStringTyped(input: unknown): input is string {
  return typeof input === "string";
}

function handle2(input: unknown) {
  if (isStringTyped(input)) {
    console.log(input.toUpperCase()); // ✅ input 收窄为 string
  }
}
\`\`\`

**关键**：\`input is string\` 是"类型谓词"，TS 会信任你的实现。

## 6. 类型守卫函数的实战：过滤数组

\`\`\`ts
// 一个常见的坑：filter 不能自动收窄类型
const arr: (string | null)[] = ["a", null, "b", null];

// 这样写后 strings 类型还是 (string | null)[]
const strings = arr.filter(x => x !== null);

// 用类型谓词，能让 filter 后的类型精确收窄
const strings2 = arr.filter((x): x is string => x !== null);
// strings2 类型是 string[]
\`\`\`

React 里非常常见——比如过滤 \`children\` 里的 \`null\`：

\`\`\`tsx
// 自定义类型守卫：判断 child 是有效的 React 节点
function isValidChild(child: React.ReactNode): child is React.ReactNode {
  return child !== null && child !== false && child !== undefined;
}

function List({ children }: { children: React.ReactNode }) {
  // 过滤掉 null / false / undefined，且类型收窄
  const items = React.Children.toArray(children).filter(isValidChild);
  return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}
\`\`\`

## 7. React 场景：自定义类型守卫解析 API 响应

\`\`\`tsx
import { useState, useEffect } from "react";

// 后端返回的 user 数据
interface User {
  id: number;
  name: string;
  email: string;
}

// 类型守卫：判断 unknown 是不是合法的 User
function isUser(data: unknown): data is User {
  // 必须是对象
  if (typeof data !== "object" || data === null) return false;
  const u = data as Record<string, unknown>;
  // 逐字段检查
  return (
    typeof u.id === "number" &&
    typeof u.name === "string" &&
    typeof u.email === "string"
  );
}

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        // 用类型守卫验证后端返回
        if (isUser(data)) {
          setUser(data); // data 收窄为 User，可以安全 setState
        } else {
          console.error("后端返回结构不对", data);
        }
      });
  }, [userId]);

  // user 是 User | null，渲染时要判空
  if (user === null) return <div>加载中...</div>;
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

**核心价值**：网络数据天然是 \`unknown\`，用类型守卫在边界处验证，让 TS 帮你拦下"后端字段变了"的问题。

## 8. 断言 vs 类型守卫：什么时候用哪个

| 对比项 | as / ! 断言 | 类型守卫 is |
| --- | --- | --- |
| 信任程度 | 你向 TS 担保 | 运行时验证后告诉 TS |
| 运行时检查 | 无 | 有 |
| 安全性 | 低（可能运行时崩） | 高 |
| 代码量 | 少 | 多 |
| 适用场景 | 你 100% 确定类型 | 边界数据、第三方返回 |

**口诀**：能用类型守卫就用类型守卫，断言是最后手段。

## 小结

- \`as\` 断言告诉 TS 一个更具体的类型，但运行时不验证，有风险。
- \`!\` 非空断言跳过 null 检查，只在"调用时机保证有值"时用。
- \`as const\` 让字面量类型固定，替代 enum 的常用工具。
- 类型谓词 \`x is T\` 让自定义函数变成类型守卫，TS 会按返回值收窄。
- 边界数据（fetch、JSON.parse）用类型守卫验证，比断言更安全。

## 避坑清单

- ❌ 用 \`as\` 断言 \`unknown\` 为复杂类型且不做运行时检查（应该用类型守卫）
- ❌ 滥用 \`!\` 跳过 null 检查（应该显式判空或用类型守卫）
- ❌ 在 .tsx 里用 \`<T>x\` 断言语法（会和 JSX 冲突，要用 \`as T\`）
- ❌ 双重断言 \`as unknown as T\` 绕过类型检查（应该重新审视类型设计）

下一章我们看 \`unknown / never / void / any\`——四个"特殊类型"的真正用途。`
  },

  // ============================================================
  // ch10: unknown / never / void / any
  // ============================================================
  {
    id: "tsx3-ch10",
    group: "第一部分 TypeScript 类型基础",
    icon: "🌀",
    title: "ch10 unknown / never / void / any",
    content: `# ch10 unknown / never / void / any

## 为什么讲这个

TypeScript 里有四个"特殊类型"经常被混淆：\`unknown\`、\`never\`、\`void\`、\`any\`。它们看起来都"不表示具体值"，但语义截然不同——\`unknown\` 是"我不知道但安全"，\`never\` 是"不可能发生"，\`void\` 是"我不关心返回值"，\`any\` 是"放弃检查"。这一章把它们彻底分清。

## 1. any：放弃类型检查

\`\`\`ts
// any 类型可以赋任何值，也可以被赋给任何类型
let anything: any = 1;
anything = "hello";   // ✅
anything = true;      // ✅
anything = { a: 1 };  // ✅

// any 会"污染"周围代码
const num: number = anything; // ✅ 编译通过，但运行时 num 可能是 string
console.log(num.toFixed(2));  // 运行时崩：num 是 "hello"，没有 toFixed
\`\`\`

**结论**：\`any\` 是"逃逸舱"，用一次就放弃一处类型安全。**真实项目里应该尽量避免 \`any\`**，用 \`unknown\` 替代。

## 2. unknown：类型安全的 any

\`unknown\` 也接受任何值，但**不能直接使用**，必须先收窄：

\`\`\`ts
let value: unknown = "hello";

// 不能直接访问属性
// value.toUpperCase(); // ❌ 报错：value 是 unknown

// 必须先用 typeof / instanceof / 类型守卫收窄
if (typeof value === "string") {
  console.log(value.toUpperCase()); // ✅ 这里收窄为 string
}

// 也不能直接赋给具体类型
let s: string = value; // ❌ 报错
let s2: string = value as string;  // ✅ 断言后才行（但你担保了类型）
\`\`\`

**和 any 的核心区别**：\`unknown\` 强制你"先证明类型再用"，\`any\` 是"用就用了"。

## 3. unknown 的典型用途

\`\`\`ts
// 1. JSON.parse 返回 unknown，强制你验证
const data: unknown = JSON.parse('{"a":1}');
// data.a; // ❌ 不能直接访问
if (typeof data === "object" && data !== null && "a" in data) {
  console.log((data as { a: number }).a); // 收窄后访问
}

// 2. fetch 的 res.json() 返回 unknown
async function getUser(): Promise<unknown> {
  const res = await fetch("/api/user");
  return res.json(); // Promise<unknown> 在新版 TS 里更安全
}

// 3. 工具函数接收任意输入，先收窄再处理
function logValue(value: unknown) {
  if (typeof value === "string") {
    console.log("string:", value);
  } else if (typeof value === "number") {
    console.log("number:", value.toFixed(2));
  } else {
    console.log("other:", String(value));
  }
}
\`\`\`

**建议**：项目里遇到"不确定的类型"，一律用 \`unknown\`，不用 \`any\`。

## 4. never：不可能发生的类型

\`never\` 表示"这个值永远不会出现"。两种典型场景：

\`\`\`ts
// 场景 1：函数永远不返回（抛错或死循环）
function fail(msg: string): never {
  throw new Error(msg); // 抛错后函数不会正常返回
}

function infiniteLoop(): never {
  while (true) {} // 死循环，也不返回
}

// 场景 2：联合类型被穷尽后剩下的部分
type Shape = "circle" | "square";

function area(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI;
    case "square":
      return 1;
    default:
      // 走到这里说明 shape 不是 circle 也不是 square
      // 在 TS 看来这是不可能的，shape 类型是 never
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
\`\`\`

## 5. never 与 switch default：穷尽检查

这是 \`never\` 最实用的用途。看一个完整例子：

\`\`\`ts
type Theme = "light" | "dark" | "system";

function getThemeColor(theme: Theme): string {
  switch (theme) {
    case "light":
      return "#ffffff";
    case "dark":
      return "#000000";
    case "system":
      return "match-media";
    default:
      // 把 theme 赋给 never 实现穷尽检查
      const _exhaustive: never = theme;
      return _exhaustive;
  }
}

// 如果以后给 Theme 加 | "high-contrast"
// 但忘了在 switch 里处理，TS 会立即报错：
// "high-contrast" 不能赋给 never
\`\`\`

**好处**：新增枚举值时，所有 switch 都会被强制处理，避免遗漏。

## 6. void：不关心返回值

\`void\` 用于函数返回类型，表示"调用方不应该用返回值"：

\`\`\`ts
// 函数没有 return，返回类型是 void
function log(msg: string): void {
  console.log(msg);
}

// void 类型的返回值不能被使用
const result = log("hello"); // result 类型是 void
// result.toUpperCase(); // ❌ 报错

// void 在回调类型里很常见
function forEach<T>(arr: T[], cb: (item: T) => void) {
  for (const item of arr) {
    cb(item); // 调用方不关心 cb 返回什么
  }
}

forEach([1, 2, 3], x => {
  console.log(x);
  return x * 2; // 即使返回了值也无所谓，被当 void
});
\`\`\`

## 7. void 在 React 回调中的意义

React 的事件处理器、副作用清理函数都是 \`void\`：

\`\`\`tsx
import { useEffect, useState } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // useEffect 的清理函数返回类型是 void | (() => void)
    // 这里返回清理函数，TS 接受
    return () => clearInterval(id);
  }, []);

  // 事件处理器：React.MouseEventHandler 返回 void
  // 这意味着 React 不关心你的 onClick 返回什么
  const handleClick = (): void => {
    console.log("clicked at", seconds);
    // 即使 return 一个值，React 也不看
  };

  return <button onClick={handleClick}>已过 {seconds} 秒</button>;
}
\`\`\`

**理解要点**：\`void\` 表示"调用方不关心返回值"，但实现方可以返回任意值（会被忽略）。

## 8. 四个类型的对比表

\`\`\`ts
// any：完全放弃检查
let a: any = 1;
a.foo(); // ✅ 编译通过，运行时崩

// unknown：类型安全的 any
let u: unknown = 1;
// u.foo(); // ❌ 报错：必须先收窄

// never：不可能发生
let n: never;
// n = 1; // ❌ 报错：never 不能赋任何值

// void：不关心返回值
function f(): void {}
const r = f(); // r 类型是 void
\`\`\`

| 类型 | 接受赋值 | 被赋值给其他类型 | 直接使用属性 | 主要用途 |
| --- | --- | --- | --- | --- |
| \`any\` | ✅ 任意 | ✅ 任意 | ✅ | 临时逃逸（少用） |
| \`unknown\` | ✅ 任意 | ❌ 需收窄 | ❌ | 边界数据 |
| \`never\` | ❌ 无 | ✅ 任意（不会发生） | — | 穷尽检查、永不返回 |
| \`void\` | ❌ 仅 undefined | ❌ 仅 void/undefined | — | 函数返回值 |

## 9. React 场景：用 unknown + 类型守卫替代 any

\`\`\`tsx
import { useState, useEffect } from "react";

// ❌ 反面教材：用 any 接收后端数据
function BadComponent() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUser(data)); // data 是 any，user 也是 any
  }, []);
  // user.foo.bar.baz; // 编译通过，运行时崩
}

// ✅ 正面教材：用 unknown + 类型守卫
interface User {
  id: number;
  name: string;
}

function isUser(data: unknown): data is User {
  if (typeof data !== "object" || data === null) return false;
  const u = data as Record<string, unknown>;
  return typeof u.id === "number" && typeof u.name === "string";
}

function GoodComponent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then((data: unknown) => {
        // 在边界处用类型守卫验证
        if (isUser(data)) {
          setUser(data); // 收窄为 User，类型安全
        } else {
          console.error("数据格式错误");
        }
      });
  }, []);

  if (user === null) return <div>加载中...</div>;
  return <div>{user.name}（ID: {user.id}）</div>;
}
\`\`\`

**这种模式是大型 React 项目的基本规范**：所有外部数据进 \`unknown\`，用类型守卫收窄后再用，杜绝 \`any\` 污染整个组件树。

## 10. never 在 React 里的实战：状态机穷尽

\`\`\`tsx
// 用判别联合 + never 实现穷尽检查的状态机
type ModalState =
  | { type: "closed" }
  | { type: "opening" }
  | { type: "open" }
  | { type: "closing" };

function Modal({ state }: { state: ModalState }) {
  let label: string;
  switch (state.type) {
    case "closed":
      label = "已关闭";
      break;
    case "opening":
      label = "正在打开";
      break;
    case "open":
      label = "已打开";
      break;
    case "closing":
      label = "正在关闭";
      break;
    default:
      // 穷尽检查：新增状态忘了处理会报错
      const _exhaustive: never = state;
      label = _exhaustive;
  }

  return <div>弹窗状态：{label}</div>;
}
\`\`\`

## 小结

- \`any\` 放弃检查，应该尽量避免；\`unknown\` 是类型安全的替代品。
- \`unknown\` 必须先收窄（typeof / 类型守卫）才能使用，是边界数据的标配。
- \`never\` 表示"不可能发生"，用于穷尽检查和永不返回的函数。
- \`void\` 表示"调用方不关心返回值"，是 React 回调和 effect 清理的返回类型。
- 大型项目规范：外部数据 \`unknown\` + 类型守卫，杜绝 \`any\` 污染。

## 避坑清单

- ❌ 用 \`any\` 接收 fetch / JSON.parse 结果（应该用 \`unknown\` + 守卫）
- ❌ switch 没用 \`never\` 兜底（新增分支会悄悄漏处理）
- ❌ 把 \`void\` 当 \`undefined\` 用（语义不同，void 是"不关心"）
- ❌ 给 \`never\` 类型变量赋值（语法上就不可能）
- ❌ 在公共 API 签名里用 \`any\`（会污染所有调用方）

第一部分到这里就结束了——你已经掌握了 TypeScript 类型系统的全部基础。下一章我们进入第二部分：泛型、条件类型、工具类型。`
  },
];

export { chapters };
