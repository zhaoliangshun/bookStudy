// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第三批章节
// -------------------------------------------------------------
// 覆盖：第二部分 TypeScript 类型进阶 上半
// 包含 4 个章节：ch11 ~ ch14
//
// 章节范围：
//   - ch11 泛型基础与场景（泛型函数/接口/类、调用时推断、React 组件泛型）
//   - ch12 泛型约束与默认值（extends 约束、默认值、keyof、多类型参数、条件渲染组件）
//   - ch13 工具类型 Partial/Required/Pick/Omit（实现原理 + React 表单批量更新）
//   - ch14 工具类型 Record/Readonly/ReturnType/Parameters + Exclude/Extract
//
// 风格沿用第一批：
//   - 每章从"为什么讲这个"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 每章至少 1 个 React 组件 demo
//   - 语言简洁生动，章节末尾必带"避坑清单"
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch11: 泛型基础与场景
  // ============================================================
  {
    id: "tsx3-ch11",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🧬",
    title: "ch11 泛型基础与场景",
    content: `# ch11 泛型基础与场景

## 为什么讲泛型

写 React 时你一定遇到过这种纠结：一个 \`<List>\` 组件既能渲染用户列表，又能渲染商品列表。如果给每个类型都写一个组件，代码重复到怀疑人生；如果用 \`any\`，类型检查就形同虚设。

**泛型**就是为这种场景而生的——它是类型的"参数"。你把类型当成变量传进去，TS 在调用时根据实参推导出具体类型。一份代码，多种类型安全。

## 1. 从一个反例说起：不要写重复函数

假设要写一个"返回数组第一个元素"的函数：

\`\`\`ts
// 写法 A：只能处理 number
function firstNumber(arr: number[]): number | undefined {
  return arr[0]; // 直接取第 0 个
}

// 写法 B：只能处理 string
function firstString(arr: string[]): string | undefined {
  return arr[0]; // 逻辑完全相同
}

// 问题：再加 boolean、对象... 要写多少份？
\`\`\`

如果用 \`any\` 看似统一了，但**返回值类型丢失**：

\`\`\`ts
function firstAny(arr: any[]): any {
  return arr[0]; // 返回 any，后续 .toFixed() / .map() 都不会报错
}
const x = firstAny([1, 2, 3]); // x 是 any，类型检查失效
\`\`\`

\`any\` 等于放弃 TS。正确的解法是泛型。

## 2. 泛型函数：用 T 当类型占位符

\`\`\`ts
// 在函数名后加 <T>，声明一个类型变量
// T 是占位符，调用时由实参推断出具体类型
function first<T>(arr: T[]): T | undefined {
  return arr[0]; // 返回类型与数组元素类型一致
}

// 调用时不必显式指定 T，TS 根据实参 [1,2,3] 推断 T = number
const n = first([1, 2, 3]);        // n: number | undefined
const s = first(["a", "b"]);       // s: string | undefined
const u = first([{ id: 1 }]);      // u: { id: number } | undefined
\`\`\`

**关键点**：

- \`<T>\` 是类型变量声明，类似函数参数，但传的是"类型"。
- 调用时一般不用显式写 \`first<number>(...)\`，靠**类型推断**自动得出。
- 同一个函数可以处理多种类型，且**类型不丢失**。

## 3. 多个类型变量：T / U / K / V / R

泛型不限于一个 T，可以有多个：

\`\`\`ts
// K 是 key 类型，V 是 value 类型
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value]; // 返回元组 [K, V]
}

const p1 = pair("id", 1);          // [string, number]
const p2 = pair(0, "Alice");       // [number, string]
\`\`\`

**命名约定**（社区习惯，不是语法要求）：

| 名字 | 含义 | 示例 |
| --- | --- | --- |
| \`T\` | Type，第一个类型占位 | \`function id<T>(x: T): T\` |
| \`U\` | 第二个类型 | \`function pair<T, U>(a: T, b: U)\` |
| \`K\` | Key，用作键 | \`function get<K>(obj: {}, key: K)\` |
| \`V\` | Value，用作值 | \`Record<K, V>\` |
| \`R\` | Return，函数返回 | \`type Fn<R> = () => R\` |
| \`E\` | Element，数组元素 | \`function first<E>(arr: E[])\` |

## 4. 泛型接口

接口也能加泛型：

\`\`\`ts
// 定义一个"盒子"接口：里面装什么由 T 决定
interface Box<T> {
  value: T;          // 内部值类型
  isEmpty: () => boolean;
  unwrap: () => T;   // 取值方法返回 T
}

// 装数字的盒子
const numBox: Box<number> = {
  value: 42,
  isEmpty: () => false,
  unwrap: () => 42,
};

// 装字符串的盒子
const strBox: Box<string> = {
  value: "hello",
  isEmpty: () => false,
  unwrap: () => "hello",
};
\`\`\`

React 中最常见的泛型接口是 \`React.FC<P>\`——它接受一个 props 类型 \`P\`，返回组件类型。

## 5. 泛型类

类也可以泛型，常见于数据结构（栈、队列、链表）：

\`\`\`ts
// 一个泛型栈：push/pop 的元素类型由 T 决定
class Stack<T> {
  private items: T[] = []; // 内部数组也是 T[]

  push(item: T): void {
    this.items.push(item); // 入栈
  }

  pop(): T | undefined {
    return this.items.pop(); // 出栈，可能为空
  }

  size(): number {
    return this.items.length;
  }
}

// 数字栈
const nums = new Stack<number>();
nums.push(1);   // ✅
nums.push(2);
console.log(nums.pop()); // 2

// 字符串栈
const strs = new Stack<string>();
strs.push("a"); // ✅
// strs.push(1); // ❌ 报错：number 不能赋给 string
\`\`\`

## 6. 调用时的两种推断方式

\`\`\`ts
function identity<T>(x: T): T {
  return x;
}

// 方式 1：靠推断（推荐，能省则省）
const a = identity("hello"); // T 推断为 string

// 方式 2：显式指定（推断不出来或想覆盖时用）
const b = identity<string>("hello"); // 显式 T = string

// 实战场景：传一个空数组时，推断不出 T，必须显式
const c = identity<number[]>([]); // 显式 T = number[]
\`\`\`

**何时必须显式**：

- 实参是 \`[]\` / \`null\` / \`undefined\`（推断不出具体类型）。
- 想把 \`string\` 当成 \`string | number\` 用。
- 多个泛型变量但只传了一个。

## 7. React 场景：泛型列表组件

实战中最常见的泛型 React 组件就是"通用列表"。下面是一个完整可运行的 demo：

\`\`\`tsx
// 1. 泛型 List 组件：能渲染任意类型的数组
//    用 <T,> 是因为 .tsx 文件里 <T> 会被当成 JSX 标签
function List<T,>({ items, render }: {
  items: T[];                       // 数据数组，元素类型由 T 决定
  render: (item: T, index: number) => React.ReactNode; // 渲染函数
}) {
  return (
    <ul>
      {items.map((item, index) => (
        // 调用 render 把元素转成 JSX，key 必填避免警告
        <li key={index}>{render(item, index)}</li>
      ))}
    </ul>
  );
}

// 2. 用户类型
interface User { id: number; name: string; }

// 3. 用户列表渲染
const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

// 4. 商品类型
interface Product { sku: string; price: number; }

const products: Product[] = [
  { sku: "A1", price: 9.9 },
  { sku: "B2", price: 19.9 },
];

// 5. 用同一个 List 组件渲染两种数据
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);
root.render(
  <div>
    <h3>用户列表</h3>
    {/* 这里 T 自动推断为 User */}
    <List
      items={users}
      render={(u) => <span>{u.id} - {u.name}</span>}
    />
    <h3>商品列表</h3>
    {/* 这里 T 自动推断为 Product */}
    <List
      items={products}
      render={(p) => <span>{p.sku}：¥{p.price}</span>}
    />
  </div>
);
\`\`\`

**关键观察**：\`List\` 组件**只写了一份**，却能渲染用户和商品两种数据，且 \`render\` 回调里 \`u\` 和 \`p\` 都有完整类型提示——这就是泛型在 React 里的威力。

## 8. 泛型与 useState

\`useState\` 本身就是个泛型函数。当你传初始值时它自动推断，传 \`null\` 时要显式指定：

\`\`\`tsx
import { useState } from "react";

// 推断：state 是 string
const [name, setName] = useState("");

// 推断：state 是 number
const [count, setCount] = useState(0);

// null 初始值时必须显式指定泛型
const [user, setUser] = useState<User | null>(null);
//                       ^^^^^^^^^^^^^^ 显式指定
\`\`\`

## 小结

- 泛型是"类型的参数"，用 \`<T>\` 声明，调用时由实参推断。
- 命名约定：T/U/K/V/E，但只是习惯，不是语法。
- 泛型可用于函数、接口、类，是消除代码重复的核心手段。
- React 中通用列表、表格、Select 等组件都会用到泛型。
- \`.tsx\` 文件里写泛型箭头函数要写 \`<T,>\`，避免被识别为 JSX 标签。

## 避坑清单

- ❌ 用 \`any\` 代替泛型（应该用 \`<T>\` 保留类型信息）
- ❌ 在 \`.tsx\` 箭头函数里写 \`<T>\`（会被当成 JSX，应写 \`<T,>\`）
- ❌ 传空数组时不显式指定泛型（推断不出 T，会得到 \`never[]\`）
- ❌ 给泛型乱起名（应遵守 T/U/K/V 的社区约定，方便他人阅读）
- ❌ 所有函数都加泛型（只用一次类型不需要泛型，普通参数即可）

下一章我们看泛型的高级用法：**约束与默认值**。`
  },

  // ============================================================
  // ch12: 泛型约束与默认值
  // ============================================================
  {
    id: "tsx3-ch12",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🔗",
    title: "ch12 泛型约束与默认值",
    content: `# ch12 泛型约束与默认值

## 为什么讲约束

上一章的泛型 \`<T>\` 是"无约束"的——T 可以是任何类型。但很多时候你需要"T 必须有某个字段"、"T 必须是某种类型"的限制。

比如你想写一个 \`getProperty(obj, key)\` 函数，要求 \`key\` 必须是 \`obj\` 真实存在的字段。无约束的泛型做不到，必须用 **extends** 给 T 加约束。

这一章我们讲透 \`extends\`、默认值、\`keyof\` 三件事，最后用它们写一个真实场景的"条件渲染组件"。

## 1. extends：给 T 加约束

\`\`\`ts
// 约束 T 必须有 length 字段
function logLength<T extends { length: number }>(x: T): T {
  console.log(x.length); // 安全访问 length
  return x;
}

logLength("hello");   // ✅ string 有 length
logLength([1, 2, 3]); // ✅ 数组有 length
// logLength(123);    // ❌ 报错：number 没有 length
\`\`\`

**理解方式**：\`T extends X\` 的意思是"T 必须是 X 的子类型"，即 T 至少要满足 X 描述的形状。

## 2. 用 extends 实现安全的 getProperty

经典场景：取对象属性时，强制 key 必须存在。

\`\`\`ts
// 无约束版本：key 是任意 string，容易拼错
function getBad(obj: any, key: string): any {
  return obj[key]; // 运行时可能 undefined
}

// 约束版本：K 必须是 obj 的 key
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // 返回类型自动是 T[K]
}

const user = { id: 1, name: "Alice", age: 18 };

const n = get(user, "name"); // n: string（自动推断）
const a = get(user, "age");  // a: number
// get(user, "emaill");      // ❌ 报错：emaill 不在 user 的 key 里
\`\`\`

**两个关键点**：

- \`K extends keyof T\` 限制 K 必须是 T 的字段名。
- 返回类型 \`T[K]\` 是**索引访问类型**，自动推导出对应字段的类型。

## 3. keyof 操作符：取出所有 key

\`\`\`ts
interface User {
  id: number;
  name: string;
  age: number;
}

// keyof User 得到 "id" | "name" | "age" 联合类型
type UserKeys = keyof User;

const k: UserKeys = "name"; // ✅
// const k2: UserKeys = "emaill"; // ❌ 报错
\`\`\`

\`keyof\` 像是"取钥匙串"——把对象所有字段名打包成联合类型，常和泛型约束配合使用。

## 4. 泛型默认值

泛型可以给默认值，调用方不传时用默认值：

\`\`\`ts
// 默认 T 为 string
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

// 不传 T，使用默认 string
const strs = createArray(3, "a"); // string[]

// 显式传 T = number
const nums = createArray<number>(3, 0); // number[]
\`\`\`

默认值在写"可选类型参数"时很有用，避免调用方每次都显式指定。

## 5. 默认值与约束的组合

\`\`\`ts
// T 必须有 id 字段，默认为 { id: number }
function getId<T extends { id: number } = { id: number }>(x: T): number {
  return x.id;
}

getId({ id: 1 });         // ✅ 用默认类型
getId({ id: 1, name: "a" }); // ✅ 扩展类型
// getId({ name: "a" });  // ❌ 报错：缺 id
\`\`\`

## 6. 多个类型参数 + 约束

\`\`\`ts
// 把 from 类型的字段拷贝到 to 上
function assign<T, U extends T>(to: T, from: U): T & U {
  return { ...to, ...from };
}

const base = { id: 1 };
const extra = { id: 1, name: "Alice" }; // U 必须满足 T

const merged = assign(base, extra);
// merged: { id: number } & { id: number; name: string }
console.log(merged.name); // "Alice"
\`\`\`

**实战提示**：多个类型参数时，**靠后的一般要 extends 前面的**，否则约束没意义。

## 7. 条件类型：泛型里的 if-else

\`\`\`ts
// 如果 T 是 string，返回 "string"
// 否则返回 "other"
type IsString<T> = T extends string ? "string" : "other";

type A = IsString<"hi">;   // "string"
type B = IsString<42>;     // "other"
type C = IsString<true>;   // "other"
\`\`\`

条件类型是工具类型的基石，下一章你会看到它如何实现 \`Exclude\`、\`Extract\`。

## 8. React 场景：泛型条件渲染组件

实战：写一个 \`<Show>\` 组件，当 \`value\` 有值时渲染 children 函数，没值时渲染 fallback。这是类型安全的"空值渲染"模式。

\`\`\`tsx
import { createRoot } from "react-dom/client";

// 1. Show 组件：value 是 T | null/undefined
//    when 有值时调用 children 函数（参数是 T，已收窄）
//    无值时渲染 fallback
function Show<T,>({ value, fallback, children }: {
  value: T | null | undefined;
  fallback: React.ReactNode;
  children: (item: T) => React.ReactNode;
}) {
  if (value == null) {
    // null 或 undefined 都走这里
    return <>{fallback}</>;
  }
  // 这里 value 已经收窄为 T，安全传给 children
  return <>{children(value)}</>;
}

// 2. 模拟数据：可能为 null 的用户
type User = { id: number; name: string } | null;

const maybeUser: User = Math.random() > 0.5
  ? { id: 1, name: "Alice" }
  : null;

// 3. 使用 Show 组件
const root = createRoot(document.getElementById("root")!);
root.render(
  <Show
    value={maybeUser}
    fallback={<div>用户未登录</div>}
  >
    {/* 这里 u 已经是 User（非 null），可以安全访问字段 */}
    {(u) => <div>欢迎，{u.name}（ID: {u.id}）</div>}
  </Show>
);
\`\`\`

**为什么这样写**：

- 不用泛型的话，\`children\` 的回调参数只能是 \`User | null\`，每次都要判空。
- 用泛型 + 收窄后，回调里 \`u\` 已经是 \`User\`，**类型系统帮你保证非空**。
- fallback 和正常渲染逻辑分离，可读性强。

## 9. React 场景：泛型 Select 组件

再来一个实战：泛型下拉选择器，options 的 value 类型由泛型决定。

\`\`\`tsx
// 1. 泛型 Select：value 是 T 类型
function Select<T extends string | number,>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        // e.target.value 是 string，需要转换回 T
        // 这里简化处理：如果是 number 就转
        const raw = e.target.value;
        const v = (typeof value === "number" ? Number(raw) : raw) as T;
        onChange(v);
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// 2. 字符串 select
const colorSelect = (
  <Select
    value="red"
    options={[
      { label: "红", value: "red" },
      { label: "蓝", value: "blue" },
    ]}
    onChange={(v) => console.log(v)} // v: string
  />
);

// 3. 数字 select
const levelSelect = (
  <Select
    value={1}
    options={[
      { label: "初级", value: 1 },
      { label: "高级", value: 2 },
    ]}
    onChange={(v) => console.log(v)} // v: number
  />
);
\`\`\`

**约束 \`<T extends string | number>\`** 是因为 \`<option value={...}>\` 的 HTML 限制——option 的 value 只能是字符串或数字。

## 小结

- \`extends\` 给泛型加约束，限制 T 必须满足某种形状。
- \`keyof T\` 取出对象所有 key，配合 \`K extends keyof T\` 做"安全取属性"。
- 泛型可以给默认值 \`<T = string>\`，调用方不传时使用默认。
- 条件类型 \`T extends X ? A : B\` 是泛型里的 if-else。
- React 中"条件渲染组件"、"通用 Select"等都是泛型约束的典型应用。

## 避坑清单

- ❌ 不加约束就访问 \`T\` 的属性（应该用 \`extends\` 限定）
- ❌ 用 \`string\` 当 key 不约束（应该用 \`K extends keyof T\`）
- ❌ 多个类型参数不加约束关系（应该让后面的 extends 前面的）
- ❌ 在 \`onChange\` 里直接用 \`e.target.value\` 当 T（DOM 事件返回的是 string，要显式转换）
- ❌ 滥用泛型默认值（默认值只在大多数场景类型一致时才加）

下一章我们看四个最常用的工具类型：**Partial / Required / Pick / Omit**。`
  },

  // ============================================================
  // ch13: 工具类型 Partial/Required/Pick/Omit
  // ============================================================
  {
    id: "tsx3-ch13",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🛠️",
    title: "ch13 工具类型 Partial/Required/Pick/Omit",
    content: `# ch13 工具类型 Partial/Required/Pick/Omit

## 为什么讲工具类型

写 React 表单时你一定遇到过这种场景：用户对象有 10 个字段，编辑表单时只想更新其中 3 个，怎么描述"部分字段"？

如果手写 \`{ name?: string; age?: number; ... }\` 把所有字段重复一遍，太啰嗦。**工具类型**就是 TS 内置的"类型转换函数"——传一个类型进去，返回一个新类型。

这一章讲最常用的四个：\`Partial\`、\`Required\`、\`Pick\`、\`Omit\`。

## 1. Partial：把所有字段变成可选

\`\`\`ts
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// Partial<User> 等价于 { id?: number; name?: string; age?: number; email?: string }
type PartialUser = Partial<User>;

// 可以只传部分字段
const update: PartialUser = { name: "Bob" }; // ✅
\`\`\`

**实现原理**（TS 内置源码）：

\`\`\`ts
// Partial 的实现：遍历每个 key，加 ? 变可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};
\`\`\`

拆解：

- \`keyof T\` 取出 T 的所有 key。
- \`[P in keyof T]\` 是**映射类型**，遍历每个 key。
- \`?:\` 给每个字段加可选标记。
- \`T[P]\` 取出原字段的值类型。

## 2. Required：把所有字段变成必填

\`Required\` 是 \`Partial\` 的反操作——把所有可选字段变成必填：

\`\`\`ts
interface User {
  id: number;
  name?: string;     // 可选
  age?: number;      // 可选
}

type RequiredUser = Required<User>;
// 等价于 { id: number; name: string; age: number }

// 必须传所有字段
const u: RequiredUser = { id: 1, name: "Alice", age: 18 }; // ✅
// const u2: RequiredUser = { id: 1 }; // ❌ 报错：缺 name、age
\`\`\`

**实现原理**：

\`\`\`ts
// -? 是移除 ? 标记的语法
type Required<T> = {
  [P in keyof T]-?: T[P];
};
\`\`\`

\`-?\` 是 TS 的"修饰符加减"语法：\`-?\` 表示移除可选，\`+?\` 表示加可选（默认就是 +）。

## 3. Pick：挑出指定字段

\`Pick<T, K>\` 从 T 中挑出 K 列出的字段：

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 只挑 name 和 email
type UserProfile = Pick<User, "name" | "email">;
// 等价于 { name: string; email: string }

const profile: UserProfile = { name: "Alice", email: "a@x.com" }; // ✅
// const bad: UserProfile = { name: "Alice", password: "123" }; // ❌ 报错
\`\`\`

**实现原理**：

\`\`\`ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]; // 只遍历 K 里的 key
};
\`\`\`

\`K extends keyof T\` 约束 K 必须是 T 的 key 联合类型之一。

## 4. Omit：排除指定字段

\`Omit<T, K>\` 是 \`Pick\` 的反面——从 T 中**排除** K 列出的字段：

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 排除 password
type SafeUser = Omit<User, "password">;
// 等价于 { id: number; name: string; email: string }

const safe: SafeUser = { id: 1, name: "Alice", email: "a@x.com" }; // ✅
// safe.password; // ❌ 报错：password 已被排除
\`\`\`

**实现原理**（间接用 Pick）：

\`\`\`ts
// 先算出 T 的所有 key，排除 K 里的，再用 Pick 挑剩下的
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
\`\`\`

\`Exclude\` 我们下章细讲，这里先理解为"从联合类型中排除某些成员"。

## 5. 四个工具类型对比

| 工具类型 | 作用 | 用法 |
| --- | --- | --- |
| \`Partial<T>\` | 全部变可选 | 表单更新、合并配置 |
| \`Required<T>\` | 全部变必填 | 严格校验必填字段 |
| \`Pick<T, K>\` | 挑选指定字段 | 提取子集 |
| \`Omit<T, K>\` | 排除指定字段 | 移除敏感字段 |

**记忆口诀**：Partial 软（可选），Required 硬（必填），Pick 挑（白名单），Omit 排（黑名单）。

## 6. React 实战：批量更新表单

下面是一个完整的"用户编辑表单"——只用 \`Partial<User>\` 就能描述"部分字段更新"：

\`\`\`tsx
import { useState } from "react";
import { createRoot } from "react-dom/client";

// 1. 用户完整类型
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// 2. 表单更新类型：用 Partial 描述"部分字段"
//    onUpdate 接收 Partial<User>，只更新传入的字段
function UserEditForm({ user, onUpdate }: {
  user: User;
  onUpdate: (patch: Partial<User>) => void;
}) {
  // 本地 state：用 Partial 是因为表单字段可能未填
  const [draft, setDraft] = useState<Partial<User>>(user);

  // 通用更新函数：传 Partial<User>
  const update = (patch: Partial<User>) => {
    setDraft((prev) => ({ ...prev, ...patch })); // 合并字段
    onUpdate(patch); // 同步给父组件
  };

  return (
    <form>
      {/* name 字段 */}
      <input
        value={draft.name ?? ""}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="姓名"
      />
      {/* age 字段：number 要转换 */}
      <input
        type="number"
        value={draft.age ?? 0}
        onChange={(e) => update({ age: Number(e.target.value) })}
        placeholder="年龄"
      />
      {/* email 字段 */}
      <input
        value={draft.email ?? ""}
        onChange={(e) => update({ email: e.target.value })}
        placeholder="邮箱"
      />
      <button type="button" onClick={() => console.log(draft)}>
        保存
      </button>
    </form>
  );
}

// 3. 使用
const initialUser: User = { id: 1, name: "Alice", age: 18, email: "a@x.com" };

const root = createRoot(document.getElementById("root")!);
root.render(
  <UserEditForm
    user={initialUser}
    onUpdate={(patch) => console.log("更新字段：", patch)}
  />
);
\`\`\`

**为什么用 \`Partial<User>\` 而不是 \`User\`**：

- 表单只更新部分字段，比如改名字时 age 和 email 不变。
- \`Partial\` 让 \`{ name: "Bob" }\` 这样的对象合法。
- 父组件收到 patch 后可以 \`{ ...user, ...patch }\` 合并。

## 7. 进阶：组合使用

工具类型可以链式组合：

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 1. 排除 password：安全展示
type SafeUser = Omit<User, "password">;

// 2. 排除多个字段：编辑表单不让用户改 id 和时间
type EditableUser = Omit<User, "id" | "createdAt" | "password">;

// 3. 部分可选：创建用户时 id 由后端生成
type CreateUserDTO = Omit<Partial<User>, "id" | "createdAt">;

// 4. 严格必填：所有字段都必须有
type StrictUser = Required<SafeUser>;
\`\`\`

组合使用能精确描述每个业务场景需要的类型。

## 8. 自己实现一遍加深理解

\`\`\`ts
// 自己实现的 Partial
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 自己实现的 Pick
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 自己实现的 Omit
type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>;

// 测试
interface User { id: number; name: string; age: number; }
type P = MyPartial<User>;   // { id?: number; name?: string; age?: number }
type Q = MyPick<User, "id" | "name">; // { id: number; name: string }
type R = MyOmit<User, "age">; // { id: number; name: string }
\`\`\`

手写一遍是理解工具类型最有效的方式。

## 小结

- \`Partial<T>\` 把所有字段变可选，常用于表单更新、合并配置。
- \`Required<T>\` 把所有字段变必填，是 \`Partial\` 的反操作。
- \`Pick<T, K>\` 挑选指定字段（白名单），\`Omit<T, K>\` 排除指定字段（黑名单）。
- 实现都基于**映射类型** \`[P in keyof T]\` 和**索引访问** \`T[P]\`。
- React 表单中 \`Partial\` 几乎是必备工具。

## 避坑清单

- ❌ 表单 state 用 \`User\` 而非 \`Partial<User>\`（应该用 Partial 描述部分更新）
- ❌ 手写一遍 \`{ name?: string; age?: number; ... }\`（应该用 \`Partial<User>\`）
- ❌ 用 \`Pick\` 后还想访问被排除的字段（应该明确 \`Pick\` 后字段已不存在）
- ❌ 把 \`Omit<User, "password">\` 当成 \`User\` 用（应该记住字段已被移除）
- ❌ 链式调用 \`Partial<Omit<Required<...>>>\` 套娃太深（应该抽个 \`type\` 起名）

下一章我们看另外四个常用工具：\`Record\`、\`Readonly\`、\`ReturnType\`、\`Parameters\`，外加 \`Exclude\`/\`Extract\`。`
  },

  // ============================================================
  // ch14: 工具类型 Record/Readonly/ReturnType/Parameters
  // ============================================================
  {
    id: "tsx3-ch14",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🧰",
    title: "ch14 工具类型 Record/Readonly/ReturnType/Parameters",
    content: `# ch14 工具类型 Record/Readonly/ReturnType/Parameters

## 为什么讲这组工具

上一章的 \`Partial\`/\`Pick\` 处理"对象字段的可选性"。这一章的工具类型关注另一组场景：

- \`Record\`：从键类型批量生成对象。
- \`Readonly\`：让对象整体不可变。
- \`ReturnType\` / \`Parameters\`：从已有函数反推类型。
- \`Exclude\` / \`Extract\`：操作联合类型。

它们组合起来能解决大量"动态类型"问题，比如根据后端返回字段动态渲染表单、根据函数签名生成 API wrapper。

## 1. Record：根据键类型生成对象

\`Record<K, V>\` 生成"键是 K、值是 V"的对象类型：

\`\`\`ts
// 键是 "a" | "b" | "c"，值是 number
type Scores = Record<"a" | "b" | "c", number>;
// 等价于 { a: number; b: number; c: number }

const s: Scores = { a: 1, b: 2, c: 3 }; // ✅
// const bad: Scores = { a: 1, b: 2 }; // ❌ 报错：缺 c
\`\`\`

**实现原理**：

\`\`\`ts
type Record<K extends keyof any, V> = {
  [P in K]: V; // 遍历 K，每个 key 都是 V 类型
};
\`\`\`

\`K extends keyof any\` 意思是 K 必须能当 key 用（string | number | symbol）。

## 2. Record 实战：状态映射表

\`\`\`ts
// 用 Record 描述"每个状态对应一个文案"
type Status = "idle" | "loading" | "success" | "error";

const statusText: Record<Status, string> = {
  idle: "请点击加载",
  loading: "加载中...",
  success: "加载成功",
  error: "加载失败",
};

// 如果加了一个新状态，TS 强制要求补上对应文案
// type Status2 = Status | "cancelled";
// const t: Record<Status2, string> = statusText; // ❌ 报错：缺 cancelled
\`\`\`

这种写法的好处：**新增状态时编译期就被强制补全所有映射**，避免遗漏。

## 3. Readonly：让对象不可变

\`\`\`ts
interface User {
  id: number;
  name: string;
  tags: string[];
}

// 把所有字段变成 readonly
type ReadonlyUser = Readonly<User>;
// 等价于 { readonly id: number; readonly name: string; readonly tags: readonly string[] }

const u: ReadonlyUser = { id: 1, name: "Alice", tags: ["a"] };
// u.id = 2;       // ❌ 报错：readonly
// u.name = "Bob"; // ❌ 报错：readonly
// u.tags.push("b"); // ❌ 报错：tags 是 readonly string[]
\`\`\`

**实现原理**：

\`\`\`ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]; // 给每个字段加 readonly
};
\`\`\`

\`Readonly\` 是函数式编程的基石——不可变数据让状态变化可追踪、可回放。

## 4. React 实战：用 Readonly 保护 props

React props 本应不可变，但 TS 默认不拦你修改。下面是一个"误改 props"的反例 + 正解：

\`\`\`tsx
import { createRoot } from "react-dom/client";

// 1. 反例：直接修改 props（运行时 React 会警告）
function BadList({ items }: { items: string[] }) {
  // items.push("new"); // ❌ 直接改 props，反模式
  return <ul>{items.map((s) => <li key={s}>{s}</li>)}</ul>;
}

// 2. 正解：用 Readonly 标记 props 不可变
function GoodList({ items }: { items: ReadonlyArray<string> }) {
  // items.push("new"); // ❌ 编译期报错：readonly
  // 只能读取，不能修改
  return <ul>{items.map((s) => <li key={s}>{s}</li>)}</ul>;
}

// 3. 调用方传入可变数组也能用（只读不写）
const data: string[] = ["a", "b", "c"];

const root = createRoot(document.getElementById("root")!);
root.render(<GoodList items={data} />);
\`\`\`

**两种 readonly**：

- \`Readonly<T>\`：把对象所有字段标 readonly。
- \`ReadonlyArray<T>\`：把数组变成只读（不能 push、pop、splice）。

React 函数组件的 props 默认就是 \`Readonly<{}\` 的近似形式，但显式标注更安全。

## 5. ReturnType：反推函数返回值类型

\`\`\`ts
function getUser() {
  return { id: 1, name: "Alice", age: 18 };
}

// 不用手写返回值类型，从函数反推
type User = ReturnType<typeof getUser>;
// 等价于 { id: number; name: string; age: number }

const u: User = { id: 2, name: "Bob", age: 20 }; // ✅
\`\`\`

**实现原理**：

\`\`\`ts
// T 是函数类型，infer R 推断返回值类型
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;
\`\`\`

\`infer R\` 是 TS 的"类型推断变量"——在条件类型里捕获某个位置的类型。这里捕获返回值类型赋给 R。

## 6. Parameters：反推函数参数类型

\`\`\`ts
function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

// 反推参数元组类型
type CreateUserArgs = Parameters<typeof createUser>;
// 等价于 [string, number, string]

const args: CreateUserArgs = ["Alice", 18, "a@x.com"];
createUser(...args); // 用 spread 调用
\`\`\`

**实现原理**：

\`\`\`ts
// infer P 推断参数元组类型
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
\`\`\`

## 7. ReturnType + Parameters 的实战场景

\`\`\`ts
// 场景：包装一个 API 调用函数，类型自动透传
async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  return { id, name: "Alice" };
}

// 自动推导 fetchUser 的返回值类型
type FetchUserReturn = ReturnType<typeof fetchUser>;
// 注意：是 Promise<{...}>，不是 {...}

// 自动推导 fetchUser 的参数类型
type FetchUserArgs = Parameters<typeof fetchUser>;
// [number]

// 写一个通用的"重试包装器"，类型完全透传
function withRetry<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    for (let i = 0; i < 3; i++) {
      try {
        return await fn(...args);
      } catch (e) {
        if (i === 2) throw e;
      }
    }
    throw new Error("unreachable");
  };
}

const retryFetchUser = withRetry(fetchUser);
// retryFetchUser 的签名自动是 (id: number) => Promise<{ id: number; name: string }>
\`\`\`

**关键**：\`withRetry\` 不需要手写返回类型，靠 \`ReturnType\` 和 \`Parameters\` 完美透传。

## 8. Exclude：从联合类型中排除

\`\`\`ts
type T = "a" | "b" | "c" | "d";

// 排除 "a" 和 "b"
type Result = Exclude<T, "a" | "b">;
// 等价于 "c" | "d"
\`\`\`

**实现原理**：

\`\`\`ts
// 如果 U 里的成员和 T 重叠，就排除（用条件类型分配）
type Exclude<T, U> = T extends U ? never : T;
\`\`\`

这依赖**分配性条件类型**：当 T 是联合类型时，条件类型会分别对每个成员判断。

## 9. Extract：从联合类型中提取

\`Extract\` 是 \`Exclude\` 的反面——提取与 U 重叠的成员：

\`\`\`ts
type T = "a" | "b" | "c" | "d" | 1 | 2;

// 提取 string 类型成员
type Strings = Extract<T, string>;
// 等价于 "a" | "b" | "c" | "d"

// 提取 number 类型成员
type Numbers = Extract<T, number>;
// 等价于 1 | 2
\`\`\`

**实现原理**：

\`\`\`ts
type Extract<T, U> = T extends U ? T : never;
\`\`\`

## 10. Exclude / Extract 实战

\`\`\`ts
// 场景：从事件类型中分离用户事件和系统事件
type AllEvents =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; top: number }
  | { type: "system_init" }
  | { type: "system_shutdown" };

// 提取系统事件：type 是 "system_*"
type SystemEvent = Extract<AllEvents, { type: \`system_\${string}\` }>;
// 等价于 { type: "system_init" } | { type: "system_shutdown" }

// 排除系统事件：得到用户事件
type UserEvent = Exclude<AllEvents, SystemEvent>;
// 等价于 click | scroll
\`\`\`

## 11. React 综合实战：动态表单配置

把本章工具类型组合起来用——根据配置对象动态渲染表单：

\`\`\`tsx
import { createRoot } from "react-dom/client";

// 1. 表单字段配置类型
type FieldConfig = {
  label: string;
  type: "text" | "number" | "email";
};

// 2. 表单配置：键是字段名，值是 FieldConfig
//    Record 保证每个字段都有完整配置
type FormConfig = Record<string, FieldConfig>;

// 3. 表单数据：键和 FormConfig 一致，值是 string
//    用 keyof 提取配置里的字段名
type FormData<C extends FormConfig> = Partial<Record<keyof C, string>>;

// 4. 通用 Form 组件：传入配置，自动渲染
function DynamicForm<C extends FormConfig>({ config, onSubmit }: {
  config: C;
  onSubmit: (data: FormData<C>) => void;
}) {
  // entries 转 array 用于 map
  const fields = Object.entries(config) as [keyof C, FieldConfig][];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // 用 FormData 收集所有字段值
        const data: FormData<C> = {};
        fields.forEach(([key]) => {
          const input = document.querySelector(\`[name="\${String(key)}"]\`) as HTMLInputElement;
          data[key] = input.value;
        });
        onSubmit(data);
      }}
    >
      {fields.map(([key, cfg]) => (
        <label key={String(key)} style={{ display: "block", margin: "8px 0" }}>
          {cfg.label}：
          <input
            name={String(key)}
            type={cfg.type}
            style={{ marginLeft: 8 }}
          />
        </label>
      ))}
      <button type="submit">提交</button>
    </form>
  );
}

// 5. 使用：定义配置，类型自动推导
const userFormConfig = {
  name: { label: "姓名", type: "text" },
  age: { label: "年龄", type: "number" },
  email: { label: "邮箱", type: "email" },
} as const;

const root = createRoot(document.getElementById("root")!);
root.render(
  <DynamicForm
    config={userFormConfig}
    onSubmit={(data) => {
      // data 类型是 Partial<Record<"name" | "age" | "email", string>>
      console.log("提交：", data);
    }}
  />
);
\`\`\`

**亮点**：

- \`Record\` 保证配置对象每个字段都有完整 \`FieldConfig\`。
- \`keyof C\` 自动从配置推导出所有字段名。
- \`Partial<Record<...>>\` 描述"部分字段已填"的表单数据。
- 父组件回调里的 \`data\` 有完整类型提示，新增字段时自动扩展。

## 小结

- \`Record<K, V>\` 根据键类型批量生成对象，常用于状态映射表。
- \`Readonly<T>\` 让对象不可变，\`ReadonlyArray<T>\` 让数组只读。
- \`ReturnType<T>\` 反推函数返回值，\`Parameters<T>\` 反推参数元组。
- \`Exclude<T, U>\` 从联合中排除，\`Extract<T, U>\` 从联合中提取。
- \`infer\` 是工具类型的核心关键字，在条件类型里捕获某个位置的类型。
- 组合使用能解决"动态配置驱动 UI"这类复杂场景。

## 避坑清单

- ❌ 用 \`{ [key: string]: V }\` 索引签名（应该用 \`Record<string, V>\` 更语义化）
- ❌ 在 React 组件里直接改 props（应该用 \`Readonly\` 标注防止修改）
- ❌ 手写函数返回值类型（应该用 \`ReturnType<typeof fn>\` 自动推导）
- ❌ 用 \`any\` 当函数 wrapper 的参数（应该用 \`Parameters<typeof fn>\` 透传）
- ❌ 误以为 \`Exclude\` 修改原类型（应该记住它返回新类型，原类型不变）
- ❌ 把 \`ReturnType<() => Promise<T>>\` 当成 \`T\`（实际是 \`Promise<T>\`，要先 \`Awaited<T>\`）

下一章我们继续讲类型系统的进阶主题——**条件类型与 infer 深入**。`
  },
];

export { chapters };
