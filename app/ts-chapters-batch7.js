// =============================================================
// TypeScript 交互式教程 —— 第七批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-conditional-deep  — 条件类型深入
//   2. ts-mapped-deep       — 映射类型深入
//   3. ts-template-literal  — 模板字面量类型
//   4. ts-infer-deep        — infer 关键字深入
//   5. ts-type-gymnastics   — 类型体操
//   6. ts-brand-types       — 品牌类型与名义类型
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（进阶类型深入）
//   content : Markdown 格式的详细讲解（文字量是普通教程的 10 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器, isolatedModules)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 沙箱上下文自带 Math/JSON/Date/Map/Set/Array/Object 等内置对象
//   - 高级类型（条件类型/映射类型/infer/模板字面量类型）在转译后
//     全部被擦除，代码 demo 用 typeof 验证运行时值类型，并用注释
//     说明编译期的类型计算结果
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：条件类型深入 (Conditional Types Deep Dive)
  // =========================================================
  {
    id: "ts-conditional-deep",
    title: "条件类型深入",
    icon: "🔀",
    group: "进阶类型深入",
    content: `## 条件类型深入 (Conditional Types Deep Dive)

条件类型（Conditional Types）是 TypeScript 类型系统中最具表达力的特性之一，它让我们能在**类型层面**编写 \`if-else\` 逻辑。可以说，没有条件类型，TypeScript 的类型系统就只能做"描述"，而无法做"计算"——条件类型是几乎所有高级工具类型（Exclude、Extract、NonNullable、ReturnType、Parameters、Awaited 等）的实现基石，也是类型体操的基础工具。

本章将极其详细地讲解条件类型的方方面面：基础语法、\`extends\` 的真实含义、**分布式条件类型**（这是最容易踩坑也最强大的特性）、如何阻止分布、条件类型与联合类型的复杂交互、递归条件类型、\`infer\` 在条件类型中的角色、链式调用，以及条件类型在实际工程中的应用（API 类型推导、深度 Partial 等）。

### 条件类型基础语法

条件类型的语法是：

\`\`\`ts
T extends U ? X : Y
\`\`\`

读作："如果 \`T\` 可以赋值给 \`U\`（即 \`T\` 是 \`U\` 的子类型），则结果类型为 \`X\`，否则为 \`Y\`。" 这就是类型层面的三元表达式。

#### 最简单的例子

\`\`\`ts
type IsString<T> = T extends string ? "是字符串" : "非字符串";

type A = IsString<"hello">;  // "是字符串"
type B = IsString<42>;       // "非字符串"
type C = IsString<string>;   // "是字符串"
type D = IsString<number>;   // "非字符串"
\`\`\`

\`IsString<T>\` 接收一个类型参数 \`T\`，根据 \`T\` 是否能赋值给 \`string\` 返回不同的字面量类型。注意结果 \`"是字符串"\` 本身也是一个**类型**（字面量类型），不是字符串值。条件类型完全发生在编译期，运行时没有任何痕迹。

### extends 在条件类型中的真实含义

这里有一个非常常见的混淆点：条件类型里的 \`T extends U\` 和面向对象里的 \`class Dog extends Animal\` 含义**完全不同**。

| 语法位置 | \`extends\` 的含义 |
| --- | --- |
| \`class A extends B\` | 类继承：A 继承 B 的所有成员 |
| \`interface A extends B\` | 接口继承：A 继承 B 的成员签名 |
| \`T extends U ? X : Y\` | **可赋值性判断**：T 是否能赋值给 U（T 是 U 的子类型） |
| \`function f<T extends U>(x: T)\` | 泛型约束：T 必须是 U 的子类型 |

在条件类型中，\`T extends U\` 等价于"在编译期问一个问题：\`T\` 类型的值能不能安全地赋值给 \`U\` 类型的变量？"如果能，条件为真。

\`\`\`ts
// "hello" 能赋值给 string → true
type T1 = "hello" extends string ? true : false;            // true

// number 能赋值给 string → false
type T2 = number extends string ? true : false;             // false

// string 能赋值给 string | number → true（string 是联合的成员）
type T3 = string extends string | number ? true : false;    // true

// string | number 能赋值给 string → false（联合类型不是 string 的子类型）
type T4 = (string | number) extends string ? true : false;  // false

// never 能赋值给任何类型 → true（never 是所有类型的子类型）
type T5 = never extends string ? true : false;              // true

// any 能赋值给任何类型，且任何类型能赋值给 any → true
type T6 = any extends string ? true : false;                // true（特殊情况：any 和 boolean 分支）
\`\`\`

#### 子类型规则速查

理解 "可赋值" 关键在于理解子类型（subtyping）规则：

- **原始类型**：\`"hello"\` 是 \`string\` 的子类型；\`42\` 是 \`number\` 的子类型。
- **字面量是宽类型的子类型**：\`"a"\` 是 \`string\` 的子类型，\`true\` 是 \`boolean\` 的子类型。
- **联合类型**：\`A | B\` 的子类型包括 \`A\`、\`B\`、以及它们的子类型。
- **对象类型**：结构兼容的更具体对象是更宽泛对象的子类型。\`{ name: string; age: number }\` 是 \`{ name: string }\` 的子类型（多出来的属性不算违反）。
- **函数类型**：参数更少/更宽的函数是参数更多/更窄的函数的子类型（逆变与协变）。
- **never**：是所有类型的子类型（底部类型）。
- **any**：既是所有类型的子类型也是父类型（逃生舱，会绕过类型检查）。

### 嵌套条件类型（多路分支）

条件类型可以嵌套，实现类似 \`switch\` 的多路分支：

\`\`\`ts
type TypeName<T> =
  T extends string   ? "string"   :
  T extends number   ? "number"   :
  T extends boolean  ? "boolean"  :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  T extends null     ? "null"     :
  "object";

type T1 = TypeName<"hello">;     // "string"
type T2 = TypeName<42>;          // "number"
type T3 = TypeName<true>;        // "boolean"
type T4 = TypeName<() => {}>;    // "function"
type T5 = TypeName<null>;        // "null"
type T6 = TypeName<{ a: 1 }>;    // "object"
\`\`\`

嵌套条件类型的求值是**短路**的：从上到下逐个判断，遇到第一个 \`extends\` 为真的分支就返回，不再继续判断后面的分支。这与 \`if-else if-else\` 的语义一致。

### 分布式条件类型（Distributive Conditional Types）—— 核心！

这是条件类型最重要、也最容易踩坑的特性。**当条件类型的类型参数是"裸类型参数"（naked type parameter），且被传入一个联合类型时，条件类型会"分发"到联合的每个成员上分别求值，再把结果联合起来。**

#### 分布的演示

\`\`\`ts
type ToArray<T> = T extends unknown ? T[] : never;

// T 是裸类型参数，传入联合 "a" | "b" 会分发：
//   ToArray<"a"> = "a"[]
//   ToArray<"b"> = "b"[]
//   结果 = "a"[] | "b"[]
type R1 = ToArray<"a" | "b">;        // ("a" | "b")[] —— 等价写法
type R2 = ToArray<string | number>;  // string[] | number[]

// 对比：如果不分发，直接对整个联合判断
type R3 = (string | number) extends unknown ? (string | number)[] : never;
// R3 = (string | number)[]
\`\`\`

注意 \`R1\` 的结果是 \`("a" | "b")[]\`，而不是 \`"a"[] | "b"[]\` 的某种奇怪形式——因为 \`"a"[] | "b"[]\` 在 TypeScript 里会规范化为 \`("a" | "b")[]\`。但 \`R2\` 的结果是 \`string[] | number[]\`，**不会**合并成 \`(string | number)[]\`，因为 \`string[]\` 和 \`number[]\` 是不兼容的数组类型。

#### 分布的步骤

分布的内部过程可以理解为：

1. 把联合 \`A | B | C\` 拆成 \`A\`、\`B\`、\`C\` 三个成员。
2. 对每个成员单独应用条件类型：\`F<A>\`、\`F<B>\`、\`F<C>\`。
3. 把三个结果用 \`|\` 联合起来：\`F<A> | F<B> | F<C>\`。

#### 分布的妙用：Exclude / Extract / NonNullable

分布特性是 \`Exclude\`、\`Extract\`、\`NonNullable\` 这些核心工具类型的实现基础：

\`\`\`ts
// Exclude<T, U>：从 T 中排除可赋值给 U 的成员
type MyExclude<T, U> = T extends U ? never : T;
type R = MyExclude<"a" | "b" | "c", "a">;  // "b" | "c"

// 内部过程：
//   "a" extends "a" ? never : "a"  → never
//   "b" extends "a" ? never : "b"  → "b"
//   "c" extends "a" ? never : "c"  → "c"
//   结果：never | "b" | "c" → "b" | "c"（never 自动被吸收）

// Extract<T, U>：从 T 中提取可赋值给 U 的成员
type MyExtract<T, U> = T extends U ? T : never;
type R2 = MyExtract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"

// NonNullable<T>：排除 null 和 undefined
type MyNonNullable<T> = T extends null | undefined ? never : T;
type R3 = MyNonNullable<string | null | number | undefined>;  // string | number
\`\`\`

\`never\` 在联合中会被自动吸收（\`never | X\` 等于 \`X\`），这正是 \`Exclude\` 能"删除"成员的原因——被排除的成员变成了 \`never\`，然后被联合吸收掉。

### 裸类型 vs 包裹类型：阻止分布

分布只在类型参数是"裸"的时候发生。如果你把 \`T\` 包裹在元组 \`[T]\` 或数组 \`T[]\` 里，分布就不会发生。

\`\`\`ts
// 裸类型参数：会分布
type ToArrayNaked<T> = T extends unknown ? T[] : never;
type N1 = ToArrayNaked<string | number>;  // string[] | number[]

// 包裹在元组里：不分布
type ToArrayWrapped<T> = [T] extends [unknown] ? T[] : never;
type N2 = ToArrayWrapped<string | number>;  // (string | number)[]
\`\`\`

\`[T] extends [unknown]\` 是阻止分布的标准技巧——把 \`T\` 包进单元素元组里，它就不再是"裸"的了，整个联合会作为一个整体参与判断。

#### 什么时候需要阻止分布？

1. **当你想对整个联合做判断，而不是逐个成员**：比如判断一个联合是否是某种类型。
2. **当你想保留联合的整体性**：比如 \`ToArrayWrapped\` 想得到 \`(string | number)[]\`。
3. **避免意外行为**：有些工具类型不希望分布。

\`\`\`ts
// 判断 T 是否是联合类型（需要阻止分布，否则永远返回 false）
type IsUnion<T> = [T] extends [UnionToTuple<T>] ? false : true;
// （上面是个简化概念，实际 IsUnion 实现更复杂）

// 判断 T 是否是 never（必须阻止分布！因为 never 的特殊性）
type IsNever<T> = [T] extends [never] ? true : false;
type X1 = IsNever<never>;      // true
type X2 = IsNever<string>;     // false
// 如果不阻止分布：never extends never ? true : false → 直接返回 never（不会进入分支）
\`\`\`

\`never\` 是分布的特殊情况：当 \`T\` 是 \`never\` 时，裸条件类型 \`T extends U ? X : Y\` **直接返回 \`never\`**，不会进入任何一个分支。这就是为什么判断 \`never\` 必须用 \`[T] extends [never]\`。

### 条件类型与联合的更多交互

#### 联合作为 U（判断目标）

当 \`U\` 是联合类型时，\`T extends U\` 检查的是 \`T\` 是否能赋值给联合中的**任意一个**成员。

\`\`\`ts
type IsStringOrNumber<T> = T extends string | number ? true : false;
type R = IsStringOrNumber<"a" | 42 | true>;  // 分布后：true | true | false → true | false → boolean
\`\`\`

注意这里 \`"a" | 42 | true\` 会被分布，每个成员分别判断，最后结果 \`true | true | false\` 会被 TypeScript 简化为 \`boolean\`。

#### 联合作为结果

条件类型的两个分支 \`X\` 和 \`Y\` 可以是任意类型，包括联合：

\`\`\`ts
type Box<T> = T extends string ? { value: string } : { value: number; extra: T };
type R = Box<"a" | 42>;
// 分布后：
//   Box<"a"> = { value: string }
//   Box<42>  = { value: number; extra: 42 }
//   结果：{ value: string } | { value: number; extra: number }
\`\`\`

### 递归条件类型

TypeScript 4.1+ 支持条件类型递归——条件类型可以引用自身，从而实现类型层面的"循环"。递归条件类型常用于处理嵌套结构（深度 Partial、深度只读、Promise 解包等）。

\`\`\`ts
// 深度 Partial：把对象所有属性（包括嵌套）都变成可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 解包 Promise：递归取出最内层的类型
type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;
type R = Unwrap<Promise<Promise<Promise<number>>>>;  // number
\`\`\`

#### 递归深度限制

TypeScript 对递归类型有深度限制（大约 50 层，具体版本不同），超过会报错 \`Type instantiation is excessively deep\`。从 TypeScript 4.5 开始，对尾递归的条件类型做了优化，可以支持更深的递归（最高 1000 层左右），前提是写成尾递归形式。

\`\`\`ts
// 非尾递归（深度受限）
type Repeat<T, N extends number, Acc extends T[] = []> =
  Acc['length'] extends N ? Acc : Repeat<T, N, [...Acc, T]>;

// 尾递归形式（更高效，支持更深）
// 上面的写法已经是尾递归——条件类型的两个分支都直接返回，没有额外包装
\`\`\`

### infer 在条件类型中的角色

\`infer\` 关键字只能在条件类型的 \`extends\` 子句中使用，用于"捕获"某个类型。它是类型层面的"模式匹配"。

\`\`\`ts
// 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取函数参数类型（元组）
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type F = (a: string, b: number) => boolean;
type R1 = MyReturnType<F>;    // boolean
type R2 = MyParameters<F>;     // [string, number]
\`\`\`

\`infer R\` 的含义是："假设 \`T\` 能赋值给 \`(...args: any[]) => R\` 这个模式，那么把 \`R\` 绑定到这个位置的实际类型，并在条件为真的分支里使用它。" 如果 \`T\` 不匹配这个模式（比如 \`T\` 不是函数），条件为假，走 \`never\` 分支。

\`infer\` 是条件类型的"灵魂"——没有 \`infer\`，条件类型只能做判断；有了 \`infer\`，条件类型能做**提取**。我们将在 \`infer\` 专章深入讲解。

### 条件类型链式调用

多个条件类型可以串联使用，形成类型层面的"管道"：

\`\`\`ts
type NonNullable<T> = T extends null | undefined ? never : T;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 链式：先解包 Promise，再排除 null/undefined
type Clean<T> = NonNullable<UnwrapPromise<T>>;
type R = Clean<Promise<string | null>>;  // string
\`\`\`

链式调用的求值顺序是从内到外：先求 \`UnwrapPromise<Promise<string | null>>\` 得到 \`string | null\`，再求 \`NonNullable<string | null>\` 得到 \`string\`。

### 条件类型的实际应用

#### 1. API 响应类型推导

\`\`\`ts
// 模拟 API 响应：成功或失败
interface Success<T> { status: "success"; data: T; }
interface Failure { status: "error"; error: string; }
type ApiResponse<T> = Success<T> | Failure;

// 根据状态提取 data 类型
type ExtractData<T> = T extends { data: infer D } ? D : never;
type R = ExtractData<ApiResponse<User>>;  // User
\`\`\`

#### 2. 深度 Partial（递归条件类型 + 映射类型）

\`\`\`ts
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
\`\`\`

#### 3. 函数重载的最后一个签名提取

\`\`\`ts
// TypeScript 的 Parameters/ReturnType 对重载函数只取最后一个签名
type LastOverload<T> = T extends {
  (...a: infer A1): infer R1;
  (...a: infer A2): infer R2;
} ? A2 : never;
\`\`\`

#### 4. 根据输入类型选择输出类型

\`\`\`ts
type Result<T> = T extends Error
  ? { ok: false; error: T }
  : { ok: true; value: T };
\`\`\`

### 常见陷阱

1. **忘记分布导致意外结果**：当你写 \`type F<T> = T extends string ? ... : ...\`，如果 \`T\` 是联合，会分布。如果你不想要分布，用 \`[T] extends [string]\`。
2. **never 的特殊性**：\`never extends U ? X : Y\` 直接返回 \`never\`（不进入任何分支）。判断 never 必须用 \`[T] extends [never]\`。
3. **any 在条件类型中**：\`any extends U ? X : Y\` 会同时匹配 \`X\` 和 \`Y\`，结果可能是 \`X | Y\`。这是 any 的"逃生舱"行为。
4. **递归深度爆炸**：递归条件类型要小心深度限制，尽量写成尾递归。
5. **分布只对裸类型参数生效**：\`T extends string\` 中的 \`T\` 是裸的会分布；\`T extends string[]\` 中 \`string[]\` 不是 \`T\`，不会分布；\`[T] extends [string]\` 中 \`T\` 被包裹，不会分布。

### 最佳实践

1. **实现工具类型时，明确是否需要分布**：如果工具类型的语义是"对每个成员分别处理"（如 Exclude），就用裸类型；如果是"对整体判断"（如 IsNever），就包裹。
2. **用 \`never\` 表示"删除"**：在映射类型和条件类型中，\`never\` 常被用来"过滤掉"某些成员。
3. **递归写尾递归形式**：让条件类型的两个分支都直接返回递归调用，避免在分支内做额外包装。
4. **配合 \`infer\` 做模式匹配**：这是条件类型最强大的用法。
5. **测试边界情况**：never、any、联合、字面量类型都要测一遍。

下面通过代码演示条件类型的核心用法，包括实现 Exclude/Extract/NonNullable 的简化版，并用 typeof 和变量声明验证编译期的类型计算结果。`,
    code: `// ============================================================
// 条件类型深入 —— 代码演示
// ============================================================
// 注意：高级类型在转译后会被擦除，这里用 typeof 验证运行时
// 值类型，用变量声明 + 注释展示编译期的类型计算结果。

console.log("========== 条件类型深入 ==========");

// ---- 1. 条件类型基础：T extends U ? X : Y ----
console.log("\\n---- 1. 条件类型基础 ----");

// 编译期：IsString<T> 根据 T 是否可赋值给 string 返回不同字面量类型
type IsString<T> = T extends string ? "是字符串" : "非字符串";
// type IsString<"hello"> = "是字符串"
// type IsString<42>       = "非字符串"

// 运行时：用一个函数模拟条件类型的"判断"行为
function isStringRuntime(v: unknown): "是字符串" | "非字符串" {
  return typeof v === "string" ? "是字符串" : "非字符串";
}

// 用变量声明捕获编译期类型，并赋值验证
const r1: IsString<"hello"> = "是字符串"; // ✅ 类型匹配
const r2: IsString<42> = "非字符串";       // ✅ 类型匹配
console.log("IsString<'hello'> 的类型结果:", r1);
console.log("IsString<42> 的类型结果:", r2);
console.log("运行时 isStringRuntime('hi'):", isStringRuntime("hi"));
console.log("运行时 isStringRuntime(100):", isStringRuntime(100));

// ---- 2. extends 是"可赋值性"判断 ----
console.log("\\n---- 2. extends 的可赋值性 ----");

// 编译期判断（注释展示结果）
// type E1 = "hello" extends string ? true : false;        // true
// type E2 = number extends string ? true : false;         // false
// type E3 = string extends string | number ? true : false; // true
// type E4 = never extends string ? true : false;          // true（never 是所有类型子类型）

// 运行时模拟：用 instanceof / typeof 体现"可赋值"
function assignableDemo(): void {
  const a: string = "hello"; // "hello" 可赋值给 string
  const b: string | number = "hi"; // string 可赋值给 string | number
  console.log("'hello' 可赋值给 string:", typeof a === "string");
  console.log("string 可赋值给 string|number:", typeof b === "string" || typeof b === "number");
}
assignableDemo();

// ---- 3. 分布式条件类型（核心！） ----
console.log("\\n---- 3. 分布式条件类型 ----");

// ToArray<T>：把 T 变成 T[]。T 是裸类型参数，会分布
type ToArray<T> = T extends unknown ? T[] : never;
// 编译期：ToArray<"a" | "b"> = "a"[] | "b"[] = ("a" | "b")[]
// 编译期：ToArray<string | number> = string[] | number[]（不合并！）

// 运行时模拟分布过程：对联合的每个成员分别处理
function toArrayRuntime<T>(values: T[]): T[][] {
  // 这里只是模拟"对每个成员处理"的思路
  return values.map(function (v) { return [v]; });
}
console.log("ToArray 分布演示:", toArrayRuntime(["a", "b", "c"]));
console.log("（编译期：ToArray<'a'|'b'|'c'> = ('a'|'b'|'c')[]）");

// ---- 4. 实现 Exclude / Extract / NonNullable ----
console.log("\\n---- 4. 实现 Exclude / Extract / NonNullable ----");

// Exclude<T, U>：从 T 中排除可赋值给 U 的成员（依赖分布）
type MyExclude<T, U> = T extends U ? never : T;
// 编译期：MyExclude<"a" | "b" | "c", "a"> = "b" | "c"
//   分布过程：
//     "a" extends "a" ? never : "a"  → never
//     "b" extends "a" ? never : "b"  → "b"
//     "c" extends "a" ? never : "c"  → "c"
//     never | "b" | "c" → "b" | "c"（never 被吸收）

// Extract<T, U>：从 T 中提取可赋值给 U 的成员
type MyExtract<T, U> = T extends U ? T : never;
// 编译期：MyExtract<"a" | "b" | "c", "a" | "b"> = "a" | "b"

// NonNullable<T>：排除 null 和 undefined
type MyNonNullable<T> = T extends null | undefined ? never : T;
// 编译期：MyNonNullable<string | null | number | undefined> = string | number

// 运行时验证：用变量声明捕获类型，再赋值
type Letters = "a" | "b" | "c";
const excluded: MyExclude<Letters, "a"> = "b"; // ✅ 只能是 "b" 或 "c"
const extracted: MyExtract<Letters, "a" | "b"> = "a"; // ✅ 只能是 "a" 或 "b"
type MaybeNull = string | null | number | undefined;
const nonNull: MyNonNullable<MaybeNull> = "hello"; // ✅ string | number
console.log("MyExclude<Letters,'a'> 赋值 'b':", excluded);
console.log("MyExtract<Letters,'a'|'b'> 赋值 'a':", extracted);
console.log("MyNonNullable<MaybeNull> 赋值 'hello':", nonNull);

// 运行时模拟 Exclude 的"过滤"行为
function excludeRuntime<T>(items: T[], toExclude: T[]): T[] {
  return items.filter(function (item) { return !toExclude.includes(item); });
}
console.log("运行时模拟 Exclude(['a','b','c'], ['a']):", excludeRuntime(["a", "b", "c"], ["a"]));
console.log("运行时模拟 Extract(['a','b','c'], ['a','b']):", ["a", "b", "c"].filter(function (x) { return ["a", "b"].includes(x); }));

// ---- 5. 阻止分布：[T] extends [U] 技巧 ----
console.log("\\n---- 5. 阻止分布 ----");

// 裸类型：会分布
type ToArrayNaked<T> = T extends unknown ? T[] : never;
// 编译期：ToArrayNaked<string | number> = string[] | number[]

// 包裹类型：不分布
type ToArrayWrapped<T> = [T] extends [unknown] ? T[] : never;
// 编译期：ToArrayWrapped<string | number> = (string | number)[]

// IsNever：必须阻止分布（否则 never 直接返回 never，不进分支）
type IsNever<T> = [T] extends [never] ? true : false;
// 编译期：IsNever<never> = true
// 编译期：IsNever<string> = false

const isNever1: IsNever<never> = true;
const isNever2: IsNever<string> = false;
console.log("IsNever<never>:", isNever1);
console.log("IsNever<string>:", isNever2);

// 运行时模拟：判断值是否"等价于空"
function isNeverRuntime(v: unknown): boolean {
  return v === undefined || v === null;
}
console.log("运行时 isNeverRuntime(undefined):", isNeverRuntime(undefined));
console.log("运行时 isNeverRuntime('x'):", isNeverRuntime("x"));

// ---- 6. 嵌套条件类型（多路分支） ----
console.log("\\n---- 6. 嵌套条件类型 ----");

// TypeName<T>：返回类型名字符串字面量
type TypeName<T> =
  T extends string    ? "string"    :
  T extends number    ? "number"    :
  T extends boolean   ? "boolean"   :
  T extends undefined ? "undefined" :
  T extends Function  ? "function"  :
  T extends null      ? "null"      :
  "object";

// 编译期：TypeName<"hello"> = "string"
// 编译期：TypeName<42> = "number"
// 编译期：TypeName<{ a: 1 }> = "object"

const tn1: TypeName<"hello"> = "string";
const tn2: TypeName<42> = "number";
const tn3: TypeName<true> = "boolean";
const tn4: TypeName<{ a: 1 }> = "object";
console.log("TypeName<'hello'>:", tn1);
console.log("TypeName<42>:", tn2);
console.log("TypeName<true>:", tn3);
console.log("TypeName<{a:1}>:", tn4);

// 运行时实现
function typeNameRuntime(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "string") return "string";
  if (typeof v === "number") return "number";
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "undefined") return "undefined";
  if (typeof v === "function") return "function";
  return "object";
}
console.log("运行时 typeName(null):", typeNameRuntime(null));
console.log("运行时 typeName({}):", typeNameRuntime({}));
console.log("运行时 typeName(function(){}):", typeNameRuntime(function () {}));

// ---- 7. 条件类型与 infer 配合 ----
console.log("\\n---- 7. 条件类型 + infer ----");

// MyReturnType<T>：提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
// 编译期：MyReturnType<(a: string) => number> = number

// MyParameters<T>：提取函数参数类型（元组）
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
// 编译期：MyParameters<(a: string, b: number) => void> = [string, number]

type SampleFn = (name: string, age: number) => boolean;
const retType: MyReturnType<SampleFn> = true; // ✅ boolean
const paramType: MyParameters<SampleFn> = ["张三", 30]; // ✅ [string, number]
console.log("MyReturnType<SampleFn> 赋值 true:", retType);
console.log("MyParameters<SampleFn> 赋值 ['张三', 30]:", paramType);

// 运行时模拟：调用函数看返回值
const sampleFn: SampleFn = function (name, age) { return age >= 18; };
console.log("运行时调用 sampleFn('张三', 30):", sampleFn("张三", 30));

// ---- 8. 递归条件类型 ----
console.log("\\n---- 8. 递归条件类型 ----");

// Unwrap<T>：递归解包 Promise
type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;
// 编译期：Unwrap<Promise<Promise<Promise<number>>>> = number

// DeepPartial<T>：递归把所有属性变可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Config {
  host: string;
  port: number;
  db: {
    name: string;
    pool: { min: number; max: number };
  };
}
// 编译期：DeepPartial<Config> 让所有属性（含嵌套）可选
type PartialConfig = DeepPartial<Config>;
const cfg: PartialConfig = { db: { pool: { max: 10 } } }; // ✅ 所有都可选
console.log("DeepPartial<Config> 赋值:", JSON.stringify(cfg));

// 运行时模拟递归解包
function unwrapRuntime(v: unknown): unknown {
  if (v && typeof v === "object" && typeof (v as any).then === "function") {
    // 这里只是演示思路，真正递归需要 await
    return "Promise（运行时需 await 才能解包）";
  }
  return v;
}
console.log("运行时 unwrapRuntime(42):", unwrapRuntime(42));
console.log("运行时 unwrapRuntime(Promise.resolve(42)):", unwrapRuntime(Promise.resolve(42)));

// ---- 9. 条件类型链式调用 ----
console.log("\\n---- 9. 条件类型链式调用 ----");

type NonNullable<T> = T extends null | undefined ? never : T;
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
// Clean<T> = NonNullable<UnwrapPromise<T>>
type Clean<T> = NonNullable<UnwrapPromise<T>>;
// 编译期：Clean<Promise<string | null>> = string

// 求值过程：
//   UnwrapPromise<Promise<string | null>> = string | null
//   NonNullable<string | null> = string
const cleaned: Clean<Promise<string | null>> = "hello"; // ✅ string
console.log("Clean<Promise<string|null>> 赋值 'hello':", cleaned);

// ---- 10. 实际应用：API 响应类型推导 ----
console.log("\\n---- 10. API 响应类型推导 ----");

interface Success<T> { status: "success"; data: T; }
interface Failure { status: "error"; error: string; }
type ApiResponse<T> = Success<T> | Failure;

// ExtractData<T>：从响应中提取 data 类型
type ExtractData<T> = T extends { data: infer D } ? D : never;
// 编译期：ExtractData<ApiResponse<User>> = User

interface User { id: number; name: string; }
type UserData = ExtractData<ApiResponse<User>>; // User
const userData: UserData = { id: 1, name: "张三" }; // ✅
console.log("ExtractData<ApiResponse<User>> 赋值:", JSON.stringify(userData));

// 运行时模拟 API 响应处理
function handleResponse<T>(resp: ApiResponse<T>): string {
  if (resp.status === "success") {
    return "成功: " + JSON.stringify(resp.data);
  }
  return "失败: " + resp.error;
}
const okResp: ApiResponse<User> = { status: "success", data: { id: 1, name: "张三" } };
const errResp: ApiResponse<User> = { status: "error", error: "未找到用户" };
console.log("handleResponse(成功):", handleResponse(okResp));
console.log("handleResponse(失败):", handleResponse(errResp));

console.log("\\n条件类型深入章节演示完成！");`,
  },

  // =========================================================
  // 第二章：映射类型深入 (Mapped Types Deep Dive)
  // =========================================================
  {
    id: "ts-mapped-deep",
    title: "映射类型深入",
    icon: "🗺️",
    group: "进阶类型深入",
    content: `## 映射类型深入 (Mapped Types Deep Dive)

映射类型（Mapped Types）是 TypeScript 类型系统中用于**批量转换对象类型属性**的机制。如果说条件类型是类型层面的 \`if-else\`，那么映射类型就是类型层面的 \`for...in\` 循环——它让你能遍历一个对象类型的所有键，对每个键的值类型做统一的转换。

映射类型是几乎所有对象相关工具类型（\`Partial\`、\`Required\`、\`Readonly\`、\`Pick\`、\`Record\`）的实现方式，也是编写类型安全 API 的核心工具。本章将极其详细地讲解映射类型的语法、键修饰符、键重映射（\`as\` 子句）、过滤键、同态映射类型、深层映射，以及它们与索引签名的区别。

### 映射类型基础语法

映射类型的基本语法是：

\`\`\`ts
type MappedType = {
  [K in SomeUnion]: ValueType;
};
\`\`\

\`[K in SomeUnion]\` 读作"对于 \`SomeUnion\` 中的每个成员 \`K\`，定义一个属性 \`K\`，其值类型为 \`ValueType\`"。这非常像 JavaScript 的 \`for...in\` 循环，但发生在类型层面。

#### 最简单的映射类型

\`\`\`ts
// Stringify：把任何键的值都变成 string
type Stringify<T> = {
  [K in keyof T]: string;
};

interface User { id: number; name: string; active: boolean; }
type StringUser = Stringify<User>;
// 等价于：
// { id: string; name: string; active: string; }
\`\`\`

\`keyof T\` 得到 \`T\` 所有键的联合（\`"id" | "name" | "active"\`），\`[K in keyof T]\` 遍历这个联合，对每个键 \`K\` 定义一个属性，值类型统一为 \`string\`。

#### 映射类型 vs 索引签名

初学者容易把映射类型和索引签名混淆：

\`\`\`ts
// 索引签名：所有键都是 string，值都是 number
type IndexSig = {
  [key: string]: number;
};

// 映射类型：键来自某个联合，值是转换后的类型
type Mapped = {
  [K in "a" | "b" | "c"]: number;
};
// 等价于 { a: number; b: number; c: number; }
\`\`\`

关键区别：
- **索引签名** \`[key: string]: T\` 表示"任意 string 键，值都是 T"——键是开放的、无限的。
- **映射类型** \`[K in Union]: T\` 表示"键必须是 Union 中的成员"——键是封闭的、有限的。

索引签名用 \`:\`，映射类型用 \`in\`，这是最直观的区分。

### 同态映射类型（Homomorphic Mapped Types）

当映射类型基于 \`keyof T\`（即 \`[K in keyof T]\`）时，它被称为**同态映射类型**。同态映射类型有一个重要特性：**它会保留原类型 \`T\` 的属性修饰符（readonly、可选）**。

\`\`\`ts
interface Original {
  readonly id: number;
  name?: string;
}

// 同态映射：基于 keyof T
type Homomorphic = {
  [K in keyof Original]: Original[K];
};
// 结果保留修饰符：{ readonly id: number; name?: string; }
\`\`\`

而非同态映射（基于其他联合）则不会保留修饰符：

\`\`\`ts
// 非同态：基于自定义联合
type NonHomomorphic = {
  [K in "id" | "name"]: Original[K];
};
// 结果不保留修饰符：{ id: number; name: string; }（readonly 和 ? 都丢了）
\`\`\`

同态性是 TypeScript 类型系统的一个重要概念，它让映射类型"尊重"原类型的结构。

### 键修饰符：+readonly / -readonly / +? / -?

映射类型允许你**添加或移除**属性的修饰符（\`readonly\` 和 可选 \`?\`）。语法是在 \`[K in ...]\` 前面加修饰符：

| 语法 | 含义 |
| --- | --- |
| \`{ readonly [K in keyof T]: ... }\` | 添加 readonly（等价于 \`+readonly\`） |
| \`{ +readonly [K in keyof T]: ... }\` | 显式添加 readonly |
| \`{ -readonly [K in keyof T]: ... }\` | 移除 readonly |
| \`{ [K in keyof T]?: ... }\` | 添加可选（等价于 \`+?\`） |
| \`{ [K in keyof T]+?: ... }\` | 显式添加可选 |
| \`{ [K in keyof T]-?: ... }\` | 移除可选 |

\`+\` 表示添加（可省略），\`-\` 表示移除（不可省略）。

#### Readonly：添加 readonly

\`\`\`ts
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

interface Point { x: number; y: number; }
type ReadonlyPoint = MyReadonly<Point>;
// { readonly x: number; readonly y: number; }
\`\`\`

#### Partial：添加可选

\`\`\`ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type PartialPoint = MyPartial<Point>;
// { x?: number; y?: number; }
\`\`\`

#### Required：移除可选

\`\`\`ts
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

interface Optional { x?: number; y?: number; }
type RequiredOptional = MyRequired<Optional>;
// { x: number; y: number; }（? 被移除）
\`\`\`

#### Mutable：移除 readonly

\`\`\`ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type MutablePoint = Mutable<ReadonlyPoint>;
// { x: number; y: number; }（readonly 被移除）
\`\`\`

#### 组合修饰符

可以同时操作 readonly 和可选：

\`\`\`ts
type ReadonlyPartial<T> = {
  +readonly [K in keyof T]+?: T[K];
};
\`\`\`

### 键重映射：as 子句（TypeScript 4.1+）

TypeScript 4.1 引入了 \`as\` 子句，允许在映射类型中**重命名键**：

\`\`\`ts
type MappedWithNewKeys<T> = {
  [K in keyof T as NewKeyType]: T[K];
};
\`\`\`

\`as\` 后面的表达式必须是一个类型，通常是模板字面量类型。如果重映射的结果是 \`never\`，该键会被**过滤掉**。

#### Getters：把属性名加 get 前缀

\`\`\`ts
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person { name: string; age: number; }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }
\`\`\`

\`Capitalize<string & K>\` 把键名首字母大写（\`name\` → \`Name\`），再拼上 \`get\` 前缀。这里的 \`string & K\` 是因为 \`K\` 可能是 \`string | number | symbol\`，而 \`Capitalize\` 只接受 \`string\`，所以用交叉类型收窄。

#### Setters：把属性名加 set 前缀

\`\`\`ts
type Setters<T> = {
  [K in keyof T as \`set\${Capitalize<string & K>}\`]: (v: T[K]) => void;
};
\`\`\`

#### 过滤键：用 as never

\`\`\`ts
// 只保留函数类型的属性
type RemoveNonFunctions<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Mixed { name: string; run: () => void; id: number; }
type OnlyFunctions = RemoveNonFunctions<Mixed>;
// { run: () => void; }（name 和 id 被过滤）
\`\`\`

当 \`as\` 后的表达式求值为 \`never\` 时，该键不会出现在结果类型里——这是过滤键的标准技巧。

### 映射类型实现工具类型

TypeScript 内置的许多工具类型都是用映射类型实现的：

\`\`\`ts
// Partial：所有属性可选
type MyPartial<T> = { [K in keyof T]?: T[K]; };

// Required：所有属性必选
type MyRequired<T> = { [K in keyof T]-?: T[K]; };

// Readonly：所有属性只读
type MyReadonly<T> = { readonly [K in keyof T]: T[K]; };

// Pick<T, K>：只保留指定的键
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Record<K, T>：构造键为 K、值为 T 的对象类型
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
\`\`\`

注意 \`Pick\` 和 \`Record\` 的映射源不是 \`keyof T\`，而是一个**类型参数 \`K\`**。这意味着它们不是同态映射——\`Pick\` 不会保留原类型的修饰符。

### 深层映射类型（Deep Mapped Types）

映射类型默认只处理对象的第一层属性。要处理嵌套对象，需要用递归：

\`\`\`ts
// 深度只读：所有层级的属性都变 readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// 深度可变：移除所有层级的 readonly
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepMutable<T[K]> : T[K];
};

// 深度 Partial：所有层级的属性都变可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
\`\`\`

这三个深层映射类型结合了映射类型（遍历键）和条件类型（判断是否继续递归），是类型体操的经典题目。

#### 深层映射的陷阱：函数和数组

\`\`T[K] extends object\` 会把函数和数组也匹配进去，因为函数和数组都是对象。这会导致：

\`\`\`ts
interface Config {
  fn: () => void;
  arr: number[];
}
type BadDeepReadonly = DeepReadonly<Config>;
// fn 会被递归处理，变成 DeepReadonly<() => void>，结果很奇怪
// arr 会变成 DeepReadonly<number[]>，而不是 readonly number[]
\`\`\

更健壮的实现要排除函数：

\`\`\`ts
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
\`\`\`

### 映射类型与索引签名

映射类型可以基于索引签名生成，也可以生成索引签名：

\`\`\`ts
// 基于索引签名
interface StringMap { [key: string]: number; }
type Mapped = { [K in keyof StringMap]: string }; // 仍是索引签名

// 生成索引签名（用 string 作为键联合）
type StringRecord = { [K in string]: number }; // { [key: string]: number }
\`\`\`

但要注意，基于 \`keyof\` 一个有索引签名的类型时，\`keyof\` 会返回 \`string | number\`（因为数字键会被强制转为字符串）。

### 映射类型的限制与注意事项

1. **不能映射出 private/protected 成员**：映射类型只能访问 public 成员。
2. **同态映射保留修饰符，非同态不保留**：这是设计决策，理解它很重要。
3. **键重映射的 as 子句必须是类型**：通常是模板字面量类型。
4. **递归深度有限**：深层映射要小心递归深度。
5. **映射类型是"纯类型"操作**：运行时没有任何代码生成，完全在编译期完成。

下面通过代码演示映射类型的各种用法，包括实现自定义工具类型和用键重映射实现 Getters/Setters。`,
    code: `// ============================================================
// 映射类型深入 —— 代码演示
// ============================================================
// 映射类型在转译后会被完全擦除（它们只在编译期存在）。
// 我们用变量声明 + 赋值来验证编译期类型计算，并用运行时
// 对象模拟映射类型的"效果"。

console.log("========== 映射类型深入 ==========");

// ---- 1. 映射类型基础 ----
console.log("\\n---- 1. 映射类型基础 ----");

// Stringify<T>：把所有属性值变成 string
type Stringify<T> = {
  [K in keyof T]: string;
};

interface User {
  id: number;
  name: string;
  active: boolean;
}
// 编译期：Stringify<User> = { id: string; name: string; active: string; }
type StringUser = Stringify<User>;
const su: StringUser = { id: "1", name: "张三", active: "true" }; // ✅ 全是 string
console.log("Stringify<User> 赋值:", JSON.stringify(su));

// 运行时模拟：把对象所有值转成字符串
function stringifyRuntime<T extends Record<string, any>>(obj: T): { [K in keyof T]: string } {
  const result: any = {};
  for (const key in obj) {
    result[key] = String(obj[key]);
  }
  return result;
}
console.log("运行时 stringify:", JSON.stringify(stringifyRuntime({ id: 1, name: "张三", active: true })));

// ---- 2. 同态 vs 非同态映射 ----
console.log("\\n---- 2. 同态 vs 非同态映射 ----");

interface Original {
  readonly id: number;
  name?: string;
}

// 同态映射：基于 keyof T，保留修饰符
type Homomorphic = {
  [K in keyof Original]: Original[K];
};
// 编译期：{ readonly id: number; name?: string; }（保留 readonly 和 ?）

// 非同态映射：基于自定义联合，不保留修饰符
type NonHomomorphic = {
  [K in "id" | "name"]: Original[K];
};
// 编译期：{ id: number; name: string; }（丢失 readonly 和 ?）

const h: Homomorphic = { id: 1 }; // ✅ name 可选，id readonly
console.log("同态映射保留修饰符:", JSON.stringify(h));
const nh: NonHomomorphic = { id: 1, name: "张三" }; // ✅ name 必填，id 可变
nh.id = 2; // ✅ 非 readonly
console.log("非同态映射丢失修饰符:", JSON.stringify(nh));

// ---- 3. 键修饰符：readonly / ? / -readonly / -? ----
console.log("\\n---- 3. 键修饰符 ----");

// MyReadonly：添加 readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// MyPartial：添加可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// MyRequired：移除可选
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// MyMutable：移除 readonly
type MyMutable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface Point { x: number; y: number; }
interface OptionalPoint { x?: number; y?: number; }

const rp: MyReadonly<Point> = { x: 1, y: 2 };
// rp.x = 10; // ❌ 编译错误：readonly（运行时不阻止，但类型检查会报错）
console.log("MyReadonly<Point>:", JSON.stringify(rp));

const pp: MyPartial<Point> = { x: 1 }; // ✅ y 可选
console.log("MyPartial<Point>:", JSON.stringify(pp));

const reqP: MyRequired<OptionalPoint> = { x: 1, y: 2 }; // ✅ 都必填
console.log("MyRequired<OptionalPoint>:", JSON.stringify(reqP));

const mutP: MyMutable<MyReadonly<Point>> = { x: 1, y: 2 };
mutP.x = 10; // ✅ 移除了 readonly
console.log("MyMutable 移除 readonly 后:", JSON.stringify(mutP));

// 运行时模拟：Object.freeze 模拟 readonly
const frozenPoint: Point = { x: 1, y: 2 };
Object.freeze(frozenPoint);
console.log("运行时 Object.freeze (模拟 readonly):", Object.isFrozen(frozenPoint));

// ---- 4. 实现 Pick 和 Record ----
console.log("\\n---- 4. 实现 Pick 和 Record ----");

// MyPick<T, K>：只保留指定的键
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
// 编译期：MyPick<User, "id" | "name"> = { id: number; name: string; }
type PickedUser = MyPick<User, "id" | "name">;
const picked: PickedUser = { id: 1, name: "张三" }; // ✅
console.log("MyPick<User, 'id'|'name'>:", JSON.stringify(picked));

// MyRecord<K, T>：构造键为 K、值为 T 的对象
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
// 编译期：MyRecord<"a" | "b", number> = { a: number; b: number; }
type NumRecord = MyRecord<"a" | "b" | "c", number>;
const nr: NumRecord = { a: 1, b: 2, c: 3 }; // ✅
console.log("MyRecord<'a'|'b'|'c', number>:", JSON.stringify(nr));

// 运行时模拟 Pick
function pickRuntime<T extends Record<string, any>, K extends keyof T>(
  obj: T, keys: K[]
): Pick<T, K> {
  const result: any = {};
  keys.forEach(function (k) { result[k] = obj[k]; });
  return result;
}
console.log("运行时 Pick:", JSON.stringify(pickRuntime({ id: 1, name: "张三", active: true }, ["id", "name"])));

// ---- 5. 键重映射：as 子句 ----
console.log("\\n---- 5. 键重映射 as 子句 ----");

// Getters<T>：把属性名变成 getName 形式，值变成函数
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
// 编译期：Getters<User> = { getId: () => number; getName: () => string; getActive: () => boolean; }
type UserGetters = Getters<User>;
const ug: UserGetters = {
  getId: function () { return 1; },
  getName: function () { return "张三"; },
  getActive: function () { return true; },
};
console.log("Getters<User> 调用:", ug.getId(), ug.getName(), ug.getActive());

// Setters<T>：把属性名变成 setName 形式，值变成赋值函数
type Setters<T> = {
  [K in keyof T as \`set\${Capitalize<string & K>}\`]: (v: T[K]) => void;
};
type UserSetters = Setters<User>;
const us: UserSetters = {
  setId: function (v) { console.log("  设置 id:", v); },
  setName: function (v) { console.log("  设置 name:", v); },
  setActive: function (v) { console.log("  设置 active:", v); },
};
console.log("Setters<User> 调用:");
us.setId(100);
us.setName("李四");

// 运行时模拟 Getters 生成
function makeGetters<T extends Record<string, any>>(obj: T): { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] } {
  const result: any = {};
  for (const key in obj) {
    const getterName = "get" + key.charAt(0).toUpperCase() + key.slice(1);
    result[getterName] = function () { return obj[key]; };
  }
  return result;
}
const runtimeGetters = makeGetters({ id: 1, name: "张三" });
console.log("运行时 makeGetters:", runtimeGetters.getId(), runtimeGetters.getName());

// ---- 6. 过滤键：as never ----
console.log("\\n---- 6. 过滤键 ----");

// RemoveNonFunctions<T>：只保留函数类型的属性
type RemoveNonFunctions<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

interface Mixed {
  name: string;
  run: () => void;
  id: number;
  jump: () => string;
}
// 编译期：RemoveNonFunctions<Mixed> = { run: () => void; jump: () => string; }
type OnlyFunctions = RemoveNonFunctions<Mixed>;
const of: OnlyFunctions = {
  run: function () { console.log("  运行!"); },
  jump: function () { return "跳!"; },
};
console.log("RemoveNonFunctions<Mixed> 调用:");
of.run();
console.log("  jump() 返回:", of.jump());

// 运行时模拟：过滤函数属性
function pickFunctions<T extends Record<string, any>>(obj: T): Record<string, Function> {
  const result: Record<string, Function> = {};
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      result[key] = obj[key];
    }
  }
  return result;
}
const mixedObj: Mixed = {
  name: "张三", id: 1,
  run: function () { return "run"; },
  jump: function () { return "jump"; },
};
console.log("运行时 pickFunctions 键:", Object.keys(pickFunctions(mixedObj)));

// ---- 7. 深层映射类型 ----
console.log("\\n---- 7. 深层映射类型 ----");

// DeepReadonly：所有层级 readonly
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// DeepPartial：所有层级可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// DeepMutable：移除所有层级 readonly
type DeepMutable<T> = T extends Function
  ? T
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;

interface Config {
  host: string;
  port: number;
  db: {
    name: string;
    pool: { min: number; max: number };
  };
}

// DeepPartial<Config>：所有属性（含嵌套）可选
type PartialConfig = DeepPartial<Config>;
const pc: PartialConfig = { db: { pool: { max: 10 } } }; // ✅ 全可选
console.log("DeepPartial<Config>:", JSON.stringify(pc));

// DeepReadonly<Config>：所有属性（含嵌套）只读
type ReadonlyConfig = DeepReadonly<Config>;
const rc: ReadonlyConfig = {
  host: "localhost", port: 3306,
  db: { name: "test", pool: { min: 1, max: 10 } },
};
// rc.db.pool.max = 100; // ❌ 编译错误：深层 readonly
console.log("DeepReadonly<Config>:", JSON.stringify(rc));

// 运行时模拟 DeepReadonly：用 Object.freeze 递归
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    Object.freeze(obj);
    Object.keys(obj).forEach(function (key) {
      deepFreeze((obj as any)[key]);
    });
  }
  return obj;
}
const frozenConfig = deepFreeze({
  host: "localhost", port: 3306,
  db: { name: "test", pool: { min: 1, max: 10 } },
});
console.log("运行时 deepFreeze:", Object.isFrozen(frozenConfig), Object.isFrozen(frozenConfig.db), Object.isFrozen(frozenConfig.db.pool));

// ---- 8. 映射类型与索引签名 ----
console.log("\\n---- 8. 映射类型与索引签名 ----");

// 用 string 作为键联合生成索引签名
type StringNumberMap = {
  [K in string]: number;
};
// 编译期：{ [key: string]: number; }
const snm: StringNumberMap = { a: 1, b: 2, hello: 99 };
console.log("StringNumberMap:", JSON.stringify(snm));

// 基于已有索引签名映射
interface StringMap { [key: string]: number; }
type StringMapToString = {
  [K in keyof StringMap]: string;
};
// 编译期：{ [key: string]: string; }
const smts: StringMapToString = { a: "1", b: "2" };
console.log("StringMapToString:", JSON.stringify(smts));

// ---- 9. 综合应用：类型安全的事件总线 ----
console.log("\\n---- 9. 综合应用：类型安全的事件总线 ----");

// 用映射类型 + 键重映射构造事件处理器类型
type EventHandler<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}\`]: (payload: T[K]) => void;
};

interface Events {
  click: { x: number; y: number };
  change: { value: string };
  submit: { formData: Record<string, string> };
}
// 编译期：EventHandler<Events> = {
//   onClick: (p: { x: number; y: number }) => void;
//   onChange: (p: { value: string }) => void;
//   onSubmit: (p: { formData: Record<string, string> }) => void;
// }
type EventHandlers = EventHandler<Events>;

const handlers: EventHandlers = {
  onClick: function (p) { console.log("  点击:", p.x, p.y); },
  onChange: function (p) { console.log("  变更:", p.value); },
  onSubmit: function (p) { console.log("  提交:", JSON.stringify(p.formData)); },
};
console.log("EventHandler<Events> 调用:");
handlers.onClick({ x: 10, y: 20 });
handlers.onChange({ value: "新值" });
handlers.onSubmit({ formData: { name: "张三" } });

console.log("\\n映射类型深入章节演示完成！");`,
  },

  // =========================================================
  // 第三章：模板字面量类型 (Template Literal Types)
  // =========================================================
  {
    id: "ts-template-literal",
    title: "模板字面量类型",
    icon: "📝",
    group: "进阶类型深入",
    content: `## 模板字面量类型 (Template Literal Types)

模板字面量类型（Template Literal Types）是 TypeScript 4.1 引入的特性，它把 JavaScript 的模板字符串语法搬到了**类型层面**——让你能基于已有的字符串字面量类型，构造出新的字符串字面量类型。这听起来简单，但它打开了类型层面字符串编程的大门，让类型安全的路由系统、事件系统、CSS-in-JS、SQL 类型等都成为可能。

本章将极其详细地讲解模板字面量类型的语法、与联合类型的自动展开、内置的字符串操作工具（\`Uppercase\`/\`Lowercase\`/\`Capitalize\`/\`Uncapitalize\`）、模板字面量与 \`keyof\`/\`infer\` 的结合，以及在实际工程中的应用（路由路径类型、事件监听器、CSS 属性、SQL 类型）。

### 模板字面量类型基础语法

模板字面量类型的语法和 JavaScript 的模板字符串几乎一样，只是用在类型位置：

\`\`\`ts
type Greeting = \`Hello \${string}\`;
\`\`\

\`Greeting\` 是一个**字符串字面量类型族**——它表示所有以 \`"Hello "\` 开头、后面跟任意字符串的字符串。比如 \`"Hello World"\`、\`"Hello TypeScript"\` 都属于 \`Greeting\` 类型。

#### 几个基本例子

\`\`\`ts
type World = "world";
type Greeting = \`Hello \${World}\`;  // "Hello world"（确定的字面量）

type S = string;
type Greeting2 = \`Hello \${S}\`;  // \`Hello \${string}\`（字符串族）

type N = number;
type Id = \`id-\${N}\`;  // \`id-\${number}\`（如 "id-1"、"id-42"）
\`\`\

当插值位置是**确定的字面量类型**（如 \`"world"\`），结果是确定的字面量；当插值位置是**宽类型**（如 \`string\`、\`number\`），结果是一个"模式"类型，匹配所有符合该模式的字符串。

### 与联合类型的自动展开

这是模板字面量类型最强大的特性之一：当插值位置是**联合类型**时，模板会自动展开成所有组合的联合。

\`\`\`ts
type Side = "left" | "right";
type Direction = \`top-\${Side}\` | \`bottom-\${Side}\`;
// 等价于：
// "top-left" | "top-right" | "bottom-left" | "bottom-right"
\`\`\

展开规则类似于笛卡尔积：每个联合的每个成员都会被代入，生成所有组合。

#### 多个联合的展开

\`\`\`ts
type Color = "red" | "green" | "blue";
type Size = "sm" | "md" | "lg";
type ClassName = \`\${Color}-\${Size}\`;
// "red-sm" | "red-md" | "red-lg" | "green-sm" | ... 共 9 种
\`\`\

#### 嵌套展开

模板字面量类型可以嵌套使用：

\`\`\`ts
type T1 = \`\${"a" | "b"}-\${"x" | "y"}-\${1 | 2}\`;
// "a-x-1" | "a-x-2" | "a-y-1" | ... 共 8 种
\`\`\

### 内置字符串操作工具

TypeScript 提供了 4 个内置的工具类型用于操作字符串字面量类型：

| 工具类型 | 作用 | 示例 |
| --- | --- | --- |
| \`Uppercase<S>\` | 全部大写 | \`Uppercase<"hello">\` = \`"HELLO"\` |
| \`Lowercase<S>\` | 全部小写 | \`Lowercase<"HELLO">\` = \`"hello"\` |
| \`Capitalize<S>\` | 首字母大写 | \`Capitalize<"hello">\` = \`"Hello"\` |
| \`Uncapitalize<S>\` | 首字母小写 | \`Uncapitalize<"Hello">\` = \`"hello"\` |

这 4 个工具类型只对字符串字面量类型有效（对 \`string\` 类型无效，结果仍是 \`string\`）。它们是类型层面的字符串操作，运行时没有任何对应代码。

#### 配合模板字面量使用

\`\`\`ts
type EventName = "click" | "change" | "submit";
type HandlerName = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onChange" | "onSubmit"
\`\`\

这是构造事件处理器名称的标准模式。

### 模板字面量与 keyof 结合

模板字面量类型常和 \`keyof\` 一起用，基于对象类型的键构造新的字符串类型：

\`\`\`ts
interface Person { name: string; age: number; }
type Getter = \`get\${Capitalize<keyof Person & string>}\`;
// "getName" | "getAge"
\`\`\

注意这里 \`keyof Person & string\` 的用法——\`keyof Person\` 是 \`"name" | "age"\`（都是 string），但在某些情况下键可能是 \`number\` 或 \`symbol\`，而 \`Capitalize\` 只接受 \`string\`，所以用 \`& string\` 收窄。

### 模板字面量与 infer 结合

模板字面量类型可以用 \`infer\` 做"模式匹配"，提取字符串的某部分：

\`\`\`ts
// 提取前缀
type GetPrefix<S> = S extends \`\${infer P}-\${string}\` ? P : never;
type R = GetPrefix<"top-left">;  // "top"

// 提取后缀
type GetSuffix<S> = S extends \`\${string}-\${infer S}\` ? S : never;
type R2 = GetSuffix<"top-left">;  // "left"

// 同时提取多部分
type Split<S> = S extends \`\${infer A}-\${infer B}\` ? [A, B] : never;
type R3 = Split<"top-left">;  // ["top", "left"]
\`\`\

\`infer\` 在模板字面量类型里就像正则表达式的捕获组——你定义一个"模式"，TypeScript 尝试匹配，匹配成功就把捕获的部分绑定到 \`infer\` 变量。

### 实际应用 1：类型安全的路由系统

这是模板字面量类型最经典的应用——构造类型安全的路由路径：

\`\`\`ts
type Routes = "/users" | "/users/:id" | "/posts" | "/posts/:id/comments";

// 提取路径参数
type GetParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | GetParams<\`/\${Rest}\`>
    : T extends \`\${string}:\${infer Param}\`
    ? Param
    : never;

type Params = GetParams<"/users/:id">;  // "id"
type Params2 = GetParams<"/posts/:id/comments">;  // "id"
\`\`\

更复杂的实现可以构造一个对象类型，键是参数名，值是参数类型：

\`\`\`ts
type RouteParams<T extends string> = {
  [K in GetParams<T>]: string;
};
// RouteParams<"/users/:id"> = { id: string }
\`\`\

### 实际应用 2：事件监听器类型

\`\`\`ts
type Events = "click" | "change" | "submit";
type Listener = \`on\${Capitalize<Events>}\`;
// "onClick" | "onChange" | "onSubmit"

interface EventEmitter {
  on<E extends Events>(event: E, cb: (payload: EventPayload<E>) => void): void;
}
\`\`\

### 实际应用 3：CSS 属性类型

\`\`\`ts
type CSSProperty = "margin" | "padding" | "border";
type CSSDirection = "Top" | "Right" | "Bottom" | "Left";
type SpacingProperty = \`\${CSSProperty}\${CSSDirection}\`;
// "marginTop" | "marginRight" | ... 共 12 种
\`\`\

### 实际应用 4：SQL 类型

\`\`\`ts
type SelectClause = \`SELECT \${string} FROM \${string}\`;
type Query = SelectClause;  // 匹配所有 SELECT ... FROM ... 字符串
\`\`\

### 模板字面量类型的限制

1. **只能匹配字符串**：模板字面量类型只对 \`string\` 类型有效，不能匹配 \`number\`、\`boolean\` 等。
2. **递归深度有限**：用模板字面量做递归（如 Split）要小心深度限制。
3. **性能问题**：过度复杂的模板字面量类型会导致编译变慢。
4. **不能在运行时使用**：模板字面量类型纯编译期，运行时没有任何对应物。

### 最佳实践

1. **用 \`Capitalize\` 构造命名规范**：如 \`on\${Capitalize<Event>}\`、\`set\${Capitalize<Key>}\`。
2. **用 \`infer\` 做模式匹配**：提取字符串的特定部分。
3. **配合联合类型自动展开**：构造枚举式的字符串类型。
4. **避免过度复杂**：模板字面量类型很容易写出"看起来很酷但难维护"的类型，要权衡可读性。

下面通过代码演示模板字面量类型的各种用法，包括类型安全的路由系统、事件系统和 CSS 属性类型。`,
    code: `// ============================================================
// 模板字面量类型深入 —— 代码演示
// ============================================================
// 模板字面量类型纯编译期，转译后擦除。我们用变量声明 +
// 注释展示编译期类型计算，用运行时对象模拟效果。

console.log("========== 模板字面量类型深入 ==========");

// ---- 1. 模板字面量类型基础 ----
console.log("\\n---- 1. 模板字面量类型基础 ----");

// 编译期：
// type Greeting = \`Hello \${string}\`;  // 匹配 "Hello xxx"
// type Id = \`id-\${number}\`;            // 匹配 "id-1"、"id-42"
// type Fixed = \`Hello \${"world"}\`;     // "Hello world"（确定字面量）

// 用变量声明验证编译期类型
type Greeting = \`Hello \${string}\`;
const g1: Greeting = "Hello World"; // ✅ 匹配模式
const g2: Greeting = "Hello TypeScript"; // ✅
console.log("Greeting 类型值:", g1, "|", g2);

type Id = \`id-\${number}\`;
const id1: Id = "id-1"; // ✅
const id2: Id = "id-42"; // ✅
console.log("Id 类型值:", id1, "|", id2);

type FixedGreeting = \`Hello \${"world"}\`;
const fg: FixedGreeting = "Hello world"; // ✅ 只能是这个确切字符串
console.log("FixedGreeting 类型值:", fg);

// ---- 2. 与联合类型自动展开 ----
console.log("\\n---- 2. 与联合类型自动展开 ----");

type Side = "left" | "right";
type Direction = \`top-\${Side}\` | \`bottom-\${Side}\`;
// 编译期："top-left" | "top-right" | "bottom-left" | "bottom-right"

const d1: Direction = "top-left"; // ✅
const d2: Direction = "bottom-right"; // ✅
console.log("Direction 类型值:", d1, "|", d2);

type Color = "red" | "green" | "blue";
type Size = "sm" | "md" | "lg";
type ClassName = \`\${Color}-\${Size}\`;
// 编译期：9 种组合
const cn1: ClassName = "red-sm";
const cn2: ClassName = "blue-lg";
console.log("ClassName 类型值:", cn1, "|", cn2);

// 运行时模拟：生成所有组合
function combinations(arr1: string[], arr2: string[]): string[] {
  const result: string[] = [];
  arr1.forEach(function (a) {
    arr2.forEach(function (b) { result.push(a + "-" + b); });
  });
  return result;
}
console.log("运行时组合 red|green|blue × sm|md|lg:", combinations(["red", "green", "blue"], ["sm", "md", "lg"]));

// ---- 3. 内置字符串操作工具 ----
console.log("\\n---- 3. 内置字符串操作工具 ----");

// Uppercase / Lowercase / Capitalize / Uncapitalize
type Up = Uppercase<"hello">;       // "HELLO"
type Low = Lowercase<"HELLO">;      // "hello"
type Cap = Capitalize<"hello">;     // "Hello"
type Uncap = Uncapitalize<"Hello">; // "hello"

const up: Up = "HELLO";
const low: Low = "hello";
const cap: Cap = "Hello";
const uncap: Uncap = "hello";
console.log("Uppercase<'hello'>:", up);
console.log("Lowercase<'HELLO'>:", low);
console.log("Capitalize<'hello'>:", cap);
console.log("Uncapitalize<'Hello'>:", uncap);

// 运行时对应
const str = "hello";
console.log("运行时 toUpperCase:", str.toUpperCase());
console.log("运行时 toLowerCase:", "HELLO".toLowerCase());
console.log("运行时 首字母大写:", str.charAt(0).toUpperCase() + str.slice(1));
console.log("运行时 首字母小写:", "Hello".charAt(0).toLowerCase() + "Hello".slice(1));

// ---- 4. 模板字面量 + keyof ----
console.log("\\n---- 4. 模板字面量 + keyof ----");

interface Person {
  name: string;
  age: number;
  email: string;
}

// 构造 get{Name} 形式的方法名
type Getters = \`get\${Capitalize<keyof Person & string>}\`;
// 编译期："getName" | "getAge" | "getEmail"

const getterName: Getters = "getName";
const getterAge: Getters = "getAge";
const getterEmail: Getters = "getEmail";
console.log("Getters 类型值:", getterName, "|", getterAge, "|", getterEmail);

// ---- 5. 模板字面量 + infer（模式匹配） ----
console.log("\\n---- 5. 模板字面量 + infer ----");

// GetPrefix：提取 - 前面的部分
type GetPrefix<S> = S extends \`\${infer P}-\${string}\` ? P : never;
// 编译期：GetPrefix<"top-left"> = "top"
type Prefix = GetPrefix<"top-left">;
const prefix: Prefix = "top";
console.log("GetPrefix<'top-left'>:", prefix);

// GetSuffix：提取 - 后面的部分
type GetSuffix<S> = S extends \`\${string}-\${infer Suf}\` ? Suf : never;
// 编译期：GetSuffix<"top-left"> = "left"
type Suffix = GetSuffix<"top-left">;
const suffix: Suffix = "left";
console.log("GetSuffix<'top-left'>:", suffix);

// Split：分割字符串（递归）
type Split<S, D extends string> =
  S extends \`\${infer A}\${D}\${infer B}\` ? [A, ...Split<B, D>] : [S];
// 编译期：Split<"a,b,c", ","> = ["a", "b", "c"]
type Parts = Split<"a,b,c", ",">;
const parts: Parts = ["a", "b", "c"];
console.log("Split<'a,b,c', ','>:", JSON.stringify(parts));

// 运行时对应
console.log("运行时 split:", "a,b,c".split(","));
console.log("运行时提取前缀:", "top-left".split("-")[0]);
console.log("运行时提取后缀:", "top-left".split("-")[1]);

// ---- 6. 类型安全的路由系统 ----
console.log("\\n---- 6. 类型安全的路由系统 ----");

type Routes = "/users" | "/users/:id" | "/posts" | "/posts/:id/comments";

// 提取路径参数名（递归处理多参数）
type GetRouteParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | GetRouteParams<\`/\${Rest}\`>
    : T extends \`\${string}:\${infer Param}\`
    ? Param
    : never;

// 编译期：GetRouteParams<"/users/:id"> = "id"
// 编译期：GetRouteParams<"/posts/:id/comments"> = "id"
type Params1 = GetRouteParams<"/users/:id">;
type Params2 = GetRouteParams<"/posts/:id/comments">;
const p1: Params1 = "id";
const p2: Params2 = "id";
console.log("GetRouteParams<'/users/:id'>:", p1);
console.log("GetRouteParams<'/posts/:id/comments'>:", p2);

// 构造参数对象类型
type RouteParams<T extends string> = {
  [K in GetRouteParams<T>]: string;
};
// 编译期：RouteParams<"/users/:id"> = { id: string }
type UsersParams = RouteParams<"/users/:id">;
const up2: UsersParams = { id: "123" }; // ✅
console.log("RouteParams<'/users/:id'>:", JSON.stringify(up2));

// 运行时模拟：路由匹配 + 参数提取
function matchRoute(
  pattern: string, path: string
): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const actual = pathParts[i];
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = actual;
    } else if (pp !== actual) {
      return null;
    }
  }
  return params;
}
console.log("运行时 matchRoute('/users/:id', '/users/123'):", matchRoute("/users/:id", "/users/123"));
console.log("运行时 matchRoute('/posts/:id/comments', '/posts/42/comments'):", matchRoute("/posts/:id/comments", "/posts/42/comments"));
console.log("运行时 matchRoute('/users', '/posts'):", matchRoute("/users", "/posts"));

// ---- 7. 类型安全的事件系统 ----
console.log("\\n---- 7. 类型安全的事件系统 ----");

type EventNames = "click" | "change" | "submit";
type HandlerNames = \`on\${Capitalize<EventNames>}\`;
// 编译期："onClick" | "onChange" | "onSubmit"

type EventPayload<E extends EventNames> =
  E extends "click" ? { x: number; y: number } :
  E extends "change" ? { value: string } :
  E extends "submit" ? { formData: Record<string, string> } :
  never;

// 构造事件处理器对象类型
type EventListenerMap = {
  [K in EventNames as \`on\${Capitalize<K>}\`]: (payload: EventPayload<K>) => void;
};
// 编译期：{
//   onClick: (p: { x: number; y: number }) => void;
//   onChange: (p: { value: string }) => void;
//   onSubmit: (p: { formData: Record<string, string> }) => void;
// }

const listeners: EventListenerMap = {
  onClick: function (p) { console.log("  点击事件:", p.x, p.y); },
  onChange: function (p) { console.log("  变更事件:", p.value); },
  onSubmit: function (p) { console.log("  提交事件:", JSON.stringify(p.formData)); },
};
console.log("事件系统调用:");
listeners.onClick({ x: 100, y: 200 });
listeners.onChange({ value: "新值" });
listeners.onSubmit({ formData: { name: "张三" } });

// 运行时模拟事件总线
class SimpleEventBus {
  private handlers: Record<string, Function[]> = {};
  on(event: string, cb: Function): void {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(cb);
  }
  emit(event: string, payload: unknown): void {
    (this.handlers[event] || []).forEach(function (cb) { cb(payload); });
  }
}
const bus = new SimpleEventBus();
bus.on("click", function (p: any) { console.log("  总线 click:", p.x, p.y); });
bus.emit("click", { x: 10, y: 20 });

// ---- 8. CSS 属性类型 ----
console.log("\\n---- 8. CSS 属性类型 ----");

type CSSProperty = "margin" | "padding" | "border";
type CSSDirection = "Top" | "Right" | "Bottom" | "Left";
type SpacingProperty = \`\${CSSProperty}\${CSSDirection}\`;
// 编译期：12 种组合 "marginTop" | "marginRight" | ... | "borderLeft"

const css1: SpacingProperty = "marginTop";
const css2: SpacingProperty = "paddingBottom";
const css3: SpacingProperty = "borderLeft";
console.log("SpacingProperty 类型值:", css1, "|", css2, "|", css3);

// 运行时模拟：CSS 属性应用
function applyStyle(el: Record<string, any>, prop: string, value: string): void {
  el[prop] = value;
}
const fakeEl: Record<string, any> = {};
applyStyle(fakeEl, "marginTop", "10px");
applyStyle(fakeEl, "paddingLeft", "5px");
console.log("运行时 applyStyle:", JSON.stringify(fakeEl));

// ---- 9. 字符串操作类型体操 ----
console.log("\\n---- 9. 字符串操作类型体操 ----");

// Join：用分隔符连接字符串元组
type Join<T extends string[], D extends string> =
  T extends [infer F extends string, ...infer R extends string[]]
    ? R extends []
      ? F
      : \`\${F}\${D}\${Join<R, D>}\`
    : "";
// 编译期：Join<["a", "b", "c"], "-"> = "a-b-c"
type Joined = Join<["a", "b", "c"], "-">;
const joined: Joined = "a-b-c";
console.log("Join<['a','b','c'], '-'>:", joined);

// Repeat：重复字符串 N 次
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc["length"] extends N ? "" : \`\${S}\${Repeat<S, N, [...Acc, ""]>}\`;
// 编译期：Repeat<"ab", 3> = "ababab"
type Repeated = Repeat<"ab", 3>;
const repeated: Repeated = "ababab";
console.log("Repeat<'ab', 3>:", repeated);

// 运行时对应
console.log("运行时 join:", ["a", "b", "c"].join("-"));
console.log("运行时 repeat:", "ab".repeat(3));

console.log("\\n模板字面量类型深入章节演示完成！");`,
  },

  // =========================================================
  // 第四章：infer 关键字深入 (infer Deep Dive)
  // =========================================================
  {
    id: "ts-infer-deep",
    title: "infer 关键字深入",
    icon: "🔮",
    group: "进阶类型深入",
    content: `## infer 关键字深入 (infer Deep Dive)

\`infer\` 关键字是 TypeScript 类型系统中最具"魔法感"的特性。它让你能在条件类型的 \`extends\` 子句中**声明一个类型变量并自动推断它的类型**——就像 JavaScript 的解构赋值，但发生在类型层面。可以说，没有 \`infer\`，条件类型只能做"判断"；有了 \`infer\`，条件类型能做"提取"和"模式匹配"。

\`infer\` 是实现 \`ReturnType\`、\`Parameters\`、\`ConstructorParameters\`、\`Awaited\` 等核心工具类型的关键，也是类型体操中提取嵌套类型的核心工具。本章将极其详细地讲解 \`infer\` 的语法、在各种位置使用 \`infer\`（函数参数、返回类型、数组、Promise、元组）、多重 \`infer\`、递归 \`infer\`、\`infer\` 的约束，以及实际工程中的应用。

### infer 基础语法

\`infer\` 只能在条件类型的 \`extends\` 子句中使用，语法是：

\`\`\`ts
type F<T> = T extends SomePatternWithInfer ? ExtractedType : OtherType;
\`\`\

\`infer X\` 声明一个类型变量 \`X\`，TypeScript 会尝试用 \`T\` 去匹配 \`SomePatternWithInfer\` 这个模式，匹配成功就把 \`X\` 绑定到对应位置的实际类型，然后在条件为真的分支里使用 \`X\`。

#### 最简单的例子：提取函数返回类型

\`\`\`ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type F = (a: string, b: number) => boolean;
type R = MyReturnType<F>;  // boolean
\`\`\

\`(...args: any[]) => infer R\` 是一个"函数模式"——它匹配任何函数，并把返回类型绑定到 \`R\`。当 \`T\` 是函数时，条件为真，返回 \`R\`（即 \`T\` 的返回类型）；当 \`T\` 不是函数时，条件为假，返回 \`never\`。

### 在函数参数中 infer

\`\`\`ts
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type F = (name: string, age: number) => void;
type P = MyParameters<F>;  // [string, number]
\`\`\

\`infer P\` 绑定的是参数元组。\`P\` 的类型是 \`[string, number]\`——一个元组类型，按顺序对应每个参数。

#### 提取第一个参数

\`\`\`ts
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type F = (name: string, age: number) => void;
type First = FirstParameter<F>;  // string
\`\`\

利用元组的展开语法 \`...rest\`，可以只提取第一个参数。

### 在返回类型中 infer（ReturnType）

\`\`\`ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type F = () => Promise<string>;
type R = MyReturnType<F>;  // Promise<string>
\`\`\

注意 \`ReturnType\` 只提取**直接**返回类型，不会递归解包 Promise。如果 \`T\` 返回 \`Promise<string>\`，\`ReturnType<T>\` 是 \`Promise<string>\`，不是 \`string\`。要解包 Promise，需要递归（见下文 \`Awaited\`）。

### 在数组中 infer（ElementOf）

\`\`\`ts
type ElementOf<T> = T extends (infer E)[] ? E : never;

type R1 = ElementOf<string[]>;     // string
type R2 = ElementOf<number[]>;     // number
type R3 = ElementOf<(string | number)[]>;  // string | number
\`\`\

\`(infer E)[]\` 是"数组模式"——匹配任何数组，把元素类型绑定到 \`E\`。注意要用括号 \`()\` 包裹 \`infer E\`，否则会被解析为其他含义。

### 在 Promise 中 infer（UnwrapPromise / Awaited）

\`\`\`ts
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type R1 = Unwrap<Promise<string>>;  // string
type R2 = Unwrap<Promise<number>>;  // number
type R3 = Unwrap<string>;           // string（不是 Promise，原样返回）
\`\`\

\`Unwrap\` 只解包一层 Promise。要解包多层嵌套的 Promise，需要递归：

\`\`\`ts
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T;

type R = DeepUnwrap<Promise<Promise<Promise<number>>>>;  // number
\`\`\

TypeScript 4.5 引入的内置 \`Awaited\` 类型就是这个递归版本的标准化实现，它能正确处理 \`Promise<Promise<T>>\`、\`Promise<T | Promise<U>>\` 等复杂情况。

### 在元组中 infer

元组的 \`infer\` 可以精确匹配每个位置：

\`\`\`ts
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type Second<T extends any[]> = T extends [any, infer S, ...any[]] ? S : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type Tuple = [string, number, boolean];
type F = First<Tuple>;   // string
type S = Second<Tuple>;  // number
type L = Last<Tuple>;    // boolean
\`\`\

\`[infer F, ...any[]]\` 匹配"第一个元素是 F，后面是任意元素"。\`[...any[], infer L]\` 匹配"最后一个元素是 L，前面是任意元素"——这是 TypeScript 4.0+ 支持的元组展开。

### 多重 infer

一个条件类型可以有多个 \`infer\`：

\`\`\`ts
type FirstAndLast<T extends any[]> =
  T extends [infer F, ...any[], infer L] ? [F, L] : never;

type R = FirstAndLast<[1, 2, 3, 4]>;  // [1, 4]
\`\`\

多重 \`infer\` 让我们能同时提取多个位置的类型。如果同一个 \`infer\` 变量在多个位置出现，TypeScript 会取它们的**联合类型**：

\`\`\`ts
type AllReturns<T> = T extends (...args: any[]) => (infer R | infer R) ? R : never;
// （这个写法不常用，主要理解联合语义）
\`\`\

### infer 与递归（DeepReturnType）

递归 \`infer\` 用于处理嵌套结构。除了上面提到的 \`DeepUnwrap\`，还有：

\`\`\`ts
// DeepReturnType：递归提取最内层函数的返回类型
type DeepReturnType<T> =
  T extends (...args: any[]) => infer R
    ? R extends (...args: any[]) => any
      ? DeepReturnType<R>
      : R
    : never;

type F = () => () => () => number;
type R = DeepReturnType<F>;  // number
\`\`\

递归 \`infer\` 的关键是在 \`infer\` 提取出的类型上再次应用条件类型，形成递归。

### infer 的约束（infer T extends U）

TypeScript 4.7+ 允许给 \`infer\` 添加约束：

\`\`\`ts
type FirstString<T> =
  T extends [infer F extends string, ...any[]] ? F : never;

type R1 = FirstString<["hello", 1, 2]>;  // "hello"
type R2 = FirstString<[1, 2, 3]>;        // never（第一个不是 string）
\`\`\

\`infer F extends string\` 表示"提取 F，但要求 F 必须是 string 的子类型；如果不满足，整个条件为假"。这在需要约束提取结果时很有用。

### 实际应用 1：提取 API 响应类型

\`\`\`ts
interface ApiSpec {
  "/users": { response: { id: number; name: string } };
  "/posts": { response: { title: string; content: string } };
}

type ApiResponse<E extends keyof ApiSpec> = ApiSpec[E]["response"];
type UsersResponse = ApiResponse<"/users">;  // { id: number; name: string }
\`\`\

### 实际应用 2：提取组件 Props 类型

\`\`\`ts
type PropsOf<T> = T extends new (...args: any[]) => { props: infer P } ? P : never;

class MyComponent { props: { name: string; age: number }; }
type P = PropsOf<MyComponent>;  // { name: string; age: number }
\`\`\

### 实际应用 3：提取 Promise 链的结果

\`\`\`ts
async function fetchUser(): Promise<User> { /* ... */ }
type User2 = Awaited<ReturnType<typeof fetchUser>>;  // User
\`\`\

### infer 的常见陷阱

1. **infer 只能在 extends 子句里**：不能在别的地方用 \`infer\`。
2. **infer 变量在假分支不可用**：\`infer X\` 只在条件为真的分支里有定义。
3. **infer 匹配失败返回假分支**：如果模式不匹配，走 \`else\` 分支。
4. **同名的 infer 取联合**：如果同一 \`infer\` 变量匹配多个位置，结果是这些位置的联合类型。
5. **递归 infer 的深度限制**：要小心递归深度，尽量写尾递归。

### 最佳实践

1. **用 infer 做模式匹配**：把复杂类型拆解成你需要的部分。
2. **递归 infer 处理嵌套**：如 Promise 解包、深度返回类型。
3. **结合约束提高精度**：用 \`infer T extends U\` 限定提取结果。
4. **测试边界情况**：null、undefined、never、联合、字面量都要测。

下面通过代码演示 \`infer\` 的各种用法，包括实现 ReturnType/Parameters/ConstructorParameters/Awaited 的简化版。`,
    code: `// ============================================================
// infer 关键字深入 —— 代码演示
// ============================================================
// infer 纯编译期，转译后擦除。用变量声明 + 注释展示编译期
// 类型计算，用运行时函数模拟 infer 的"提取"效果。

console.log("========== infer 关键字深入 ==========");

// ---- 1. infer 基础：提取函数返回类型 ----
console.log("\\n---- 1. infer 基础：ReturnType ----");

// MyReturnType<T>：提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
// 编译期：MyReturnType<(a: string) => number> = number

type SampleFn = (name: string, age: number) => boolean;
type RetType = MyReturnType<SampleFn>; // boolean
const rt: RetType = true; // ✅ boolean
console.log("MyReturnType<SampleFn> 赋值 true:", rt);

// 运行时模拟：调用函数看返回值类型
function getReturnTypeRuntime<T extends (...args: any[]) => any>(fn: T): ReturnType<T> {
  // 注意：这只是演示思路，运行时无法真正"提取类型"
  // 这里返回 undefined 占位，真实场景需要调用 fn
  return undefined as any;
}
const sampleFn: SampleFn = function (name, age) { return age >= 18; };
console.log("运行时调用 sampleFn('张三', 30):", sampleFn("张三", 30));

// ---- 2. 提取函数参数类型：Parameters ----
console.log("\\n---- 2. 提取参数类型：Parameters ----");

// MyParameters<T>：提取函数参数类型（元组）
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
// 编译期：MyParameters<SampleFn> = [string, number]

type Params = MyParameters<SampleFn>; // [string, number]
const params: Params = ["张三", 30]; // ✅
console.log("MyParameters<SampleFn> 赋值:", JSON.stringify(params));

// 提取第一个参数
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
// 编译期：FirstParameter<SampleFn> = string
type FirstParam = FirstParameter<SampleFn>;
const fp: FirstParam = "李四"; // ✅ string
console.log("FirstParameter<SampleFn>:", fp);

// 运行时模拟：获取函数参数数量
function getParamCount(fn: Function): number {
  return fn.length;
}
console.log("运行时 sampleFn.length（参数数量）:", getParamCount(sampleFn));

// ---- 3. 在数组中 infer：ElementOf ----
console.log("\\n---- 3. 在数组中 infer：ElementOf ----");

// ElementOf<T>：提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;
// 编译期：ElementOf<string[]> = string
// 编译期：ElementOf<(string|number)[]> = string | number

type Elem1 = ElementOf<string[]>;
type Elem2 = ElementOf<number[]>;
type Elem3 = ElementOf<(string | number)[]>;

const e1: Elem1 = "hello";
const e2: Elem2 = 42;
const e3: Elem3 = "test"; // ✅ string | number
console.log("ElementOf<string[]>:", e1);
console.log("ElementOf<number[]>:", e2);
console.log("ElementOf<(string|number)[]>:", e3);

// 运行时模拟：取数组第一个元素看类型
function firstElement<T>(arr: T[]): T {
  return arr[0];
}
console.log("运行时 firstElement([1,2,3]):", firstElement([1, 2, 3]));
console.log("运行时 firstElement(['a','b']):", firstElement(["a", "b"]));

// ---- 4. 在 Promise 中 infer：Unwrap / Awaited ----
console.log("\\n---- 4. 在 Promise 中 infer：Unwrap ----");

// Unwrap<T>：解包一层 Promise
type Unwrap<T> = T extends Promise<infer U> ? U : T;
// 编译期：Unwrap<Promise<string>> = string
// 编译期：Unwrap<string> = string（不是 Promise，原样返回）

type Unwrapped1 = Unwrap<Promise<string>>;
type Unwrapped2 = Unwrap<Promise<number>>;
type Unwrapped3 = Unwrap<boolean>;
const uw1: Unwrapped1 = "hello";
const uw2: Unwrapped2 = 42;
const uw3: Unwrapped3 = true;
console.log("Unwrap<Promise<string>>:", uw1);
console.log("Unwrap<Promise<number>>:", uw2);
console.log("Unwrap<boolean>:", uw3);

// DeepUnwrap<T>：递归解包多层 Promise
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T;
// 编译期：DeepUnwrap<Promise<Promise<Promise<number>>>> = number
type Deep = DeepUnwrap<Promise<Promise<Promise<number>>>>;
const deep: Deep = 999;
console.log("DeepUnwrap<Promise^3<number>>:", deep);

// 运行时模拟：递归 await 解包
async function deepUnwrapRuntime(p: Promise<unknown>): Promise<unknown> {
  let v = await p;
  while (v instanceof Promise) {
    v = await v;
  }
  return v;
}
// 注意：沙箱中 async/await 可用
deepUnwrapRuntime(Promise.resolve(Promise.resolve(Promise.resolve(42)))).then(function (v) {
  console.log("运行时 deepUnwrapRuntime(Promise^3(42)):", v);
});

// ---- 5. 在元组中 infer ----
console.log("\\n---- 5. 在元组中 infer ----");

type Tuple = [string, number, boolean];

// First：提取第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type F1 = First<Tuple>; // string

// Second：提取第二个元素
type Second<T extends any[]> = T extends [any, infer S, ...any[]] ? S : never;
type S1 = Second<Tuple>; // number

// Last：提取最后一个元素（TypeScript 4.0+ 元组展开）
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type L1 = Last<Tuple>; // boolean

const f1: F1 = "hello";
const s1: S1 = 42;
const l1: L1 = true;
console.log("First<Tuple>:", f1);
console.log("Second<Tuple>:", s1);
console.log("Last<Tuple>:", l1);

// 运行时对应
const tuple: Tuple = ["hello", 42, true];
console.log("运行时 tuple[0]:", tuple[0], "| tuple[1]:", tuple[1], "| tuple[tuple.length-1]:", tuple[tuple.length - 1]);

// ---- 6. 多重 infer ----
console.log("\\n---- 6. 多重 infer ----");

// FirstAndLast：同时提取第一个和最后一个
type FirstAndLast<T extends any[]> =
  T extends [infer F, ...any[], infer L] ? [F, L] : never;
// 编译期：FirstAndLast<[1, 2, 3, 4]> = [1, 4]
type FL = FirstAndLast<[1, 2, 3, 4]>;
const fl: FL = [1, 4];
console.log("FirstAndLast<[1,2,3,4]>:", JSON.stringify(fl));

// 构造函数类型提取
type ConstructorParameters<T> =
  T extends new (...args: infer P) => any ? P : never;
// 编译期：ConstructorParameters<typeof Date> = []

class Animal {
  constructor(public name: string, public age: number) {}
}
type AnimalCtorParams = ConstructorParameters<typeof Animal>;
const acp: AnimalCtorParams = ["旺财", 3];
console.log("ConstructorParameters<typeof Animal>:", JSON.stringify(acp));
const animal = new Animal(acp[0], acp[1]);
console.log("用提取的参数构造 Animal:", animal.name, animal.age);

// InstanceType：提取构造函数的实例类型
type MyInstanceType<T> = T extends new (...args: any[]) => infer I ? I : never;
// 编译期：MyInstanceType<typeof Animal> = Animal
type AnimalInstance = MyInstanceType<typeof Animal>;
const inst: AnimalInstance = new Animal("小黑", 5);
console.log("MyInstanceType<typeof Animal>:", inst.name, inst.age);

// ---- 7. 递归 infer：DeepReturnType ----
console.log("\\n---- 7. 递归 infer：DeepReturnType ----");

// DeepReturnType：递归提取最内层函数的返回类型
type DeepReturnType<T> =
  T extends (...args: any[]) => infer R
    ? R extends (...args: any[]) => any
      ? DeepReturnType<R>
      : R
    : never;
// 编译期：DeepReturnType<() => () => () => number> = number

type NestedFn = () => () => () => number;
type DeepRet = DeepReturnType<NestedFn>; // number
const dr: DeepRet = 42;
console.log("DeepReturnType<()=>()=>()=>number>:", dr);

// 运行时模拟：递归调用嵌套函数
function nestedFn(): () => () => number {
  return function () {
    return function () { return 42; };
  };
}
const result = nestedFn()()();
console.log("运行时 nestedFn()()():", result);

// ---- 8. infer 的约束（infer T extends U） ----
console.log("\\n---- 8. infer 的约束 ----");

// FirstString：提取第一个 string 类型的元素
type FirstString<T extends any[]> =
  T extends [infer F extends string, ...any[]] ? F : never;
// 编译期：FirstString<["hello", 1, 2]> = "hello"
// 编译期：FirstString<[1, 2, 3]> = never（第一个不是 string）

type FS1 = FirstString<["hello", 1, 2]>;
type FS2 = FirstString<[1, 2, 3]>;
const fs1: FS1 = "hello";
console.log("FirstString<['hello',1,2]>:", fs1);
// FS2 是 never，不能赋值任何非 never 的值
console.log("FirstString<[1,2,3]> 类型:", "never（第一个元素不是 string）");

// ---- 9. 实际应用：提取 API 响应类型 ----
console.log("\\n---- 9. 实际应用：提取 API 响应类型 ----");

interface ApiSpec {
  "/users": { response: { id: number; name: string } };
  "/posts": { response: { title: string; content: string } };
}

// 提取某个端点的响应类型
type ApiResponse<E extends keyof ApiSpec> = ApiSpec[E]["response"];
// 编译期：ApiResponse<"/users"> = { id: number; name: string }
type UsersResponse = ApiResponse<"/users">;
type PostsResponse = ApiResponse<"/posts">;

const ur: UsersResponse = { id: 1, name: "张三" };
const pr: PostsResponse = { title: "标题", content: "内容" };
console.log("ApiResponse<'/users'>:", JSON.stringify(ur));
console.log("ApiResponse<'/posts'>:", JSON.stringify(pr));

// 运行时模拟：路由分发
function fetchApi<E extends keyof ApiSpec>(endpoint: E): ApiResponse<E> {
  const db: Record<string, any> = {
    "/users": { id: 1, name: "张三" },
    "/posts": { title: "标题", content: "内容" },
  };
  return db[endpoint];
}
console.log("运行时 fetchApi('/users'):", JSON.stringify(fetchApi("/users")));
console.log("运行时 fetchApi('/posts'):", JSON.stringify(fetchApi("/posts")));

// ---- 10. 提取 async 函数的结果类型 ----
console.log("\\n---- 10. 提取 async 函数结果类型 ----");

async function fetchUser(): Promise<{ id: number; name: string }> {
  return { id: 1, name: "张三" };
}

// Awaited<ReturnType<typeof fetchUser>> 解包 Promise
type FetchUserResult = Awaited<ReturnType<typeof fetchUser>>;
// 编译期：FetchUserResult = { id: number; name: string }
const fur: FetchUserResult = { id: 1, name: "张三" };
console.log("Awaited<ReturnType<typeof fetchUser>>:", JSON.stringify(fur));

// 运行时：真正调用 async 函数
fetchUser().then(function (user) {
  console.log("运行时 fetchUser().then:", JSON.stringify(user));
});

// 等待异步操作完成
setTimeout(function () {
  console.log("\\ninfer 关键字深入章节演示完成！");
}, 100);`,
  },

  // =========================================================
  // 第五章：类型体操 (Type Gymnastics)
  // =========================================================
  {
    id: "ts-type-gymnastics",
    title: "类型体操",
    icon: "🤸",
    group: "进阶类型深入",
    content: `## 类型体操 (Type Gymnastics)

"类型体操"（Type Gymnastics）是 TypeScript 社区对**用类型系统做复杂计算**这一实践的戏称。它指的是利用条件类型、映射类型、\`infer\`、递归、模板字面量类型等特性，在**纯类型层面**实现算法和数据结构——比如在类型层面实现 \`TupleToUnion\`、\`DeepReadonly\`、\`IsEqual\`、字符串的 \`Split\`/\`Join\`/\`Replace\`，甚至实现一个类型层面的斐波那契数列。

虽然类型体操看起来"炫技"，但它有实际意义：它是编写高质量 TypeScript 库（如 \`type-fest\`、\`utility-types\`）的必备技能，也是理解 TypeScript 内置工具类型实现原理的钥匙。本章将极其详细地讲解类型体操的核心技巧和经典题目。

### 类型体操的意义

1. **理解类型系统的边界**：类型体操让你知道 TypeScript 类型系统能做什么、不能做什么。
2. **编写更强大的工具类型**：很多实际场景需要自定义工具类型，类型体操是基础。
3. **面试和开源贡献**：很多 TypeScript 库的 PR 涉及复杂类型，类型体操是必备技能。
4. **纯粹的智力乐趣**：在类型层面"编程"本身就是一种有趣的挑战。

### 类型层面的条件判断

类型层面没有 \`if-else\`，但有条件类型 \`T extends U ? X : Y\`。这是所有类型体操的基础。

\`\`\`ts
// 类型层面的 "如果 T 是 string 返回 true 否则 false"
type IsString<T> = T extends string ? true : false;

// 类型层面的 "如果 T 是 never 返回 true"
type IsNever<T> = [T] extends [never] ? true : false;
\`\`\

### 类型层面的循环：递归

类型层面没有 \`for\` 循环，但有递归。TypeScript 4.1+ 支持递归类型，4.5+ 对尾递归做了优化。

\`\`\`ts
// 类型层面的 "重复 S 字符串 N 次"
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc["length"] extends N ? "" : \`\${S}\${Repeat<S, N, [...Acc, ""]>}\`;
\`\`\

这里用 \`Acc\`（累加器）元组的 \`length\` 作为计数器，每次递归往 \`Acc\` 里加一个 \`""\`，直到 \`length\` 等于 \`N\`。这是类型层面循环的标准模式。

### 类型层面的字符串操作

结合模板字面量类型和 \`infer\`，可以在类型层面操作字符串：

\`\`\`ts
// Split：分割字符串
type Split<S extends string, D extends string> =
  S extends \`\${infer A}\${D}\${infer B}\` ? [A, ...Split<B, D>] : [S];

// Join：连接字符串元组
type Join<T extends string[], D extends string> =
  T extends [infer F extends string, ...infer R extends string[]]
    ? R extends [] ? F : \`\${F}\${D}\${Join<R, D>}\`
    : "";

// Replace：替换字符串
type Replace<S extends string, F extends string, T extends string> =
  S extends \`\${infer A}\${F}\${infer B}\` ? \`\${A}\${T}\${B}\` : S;
\`\`\

### 经典题目 1：TupleToUnion

\`\`\`ts
type TupleToUnion<T extends any[]> = T[number];
// 或者
type TupleToUnion2<T extends any[]> = T extends Array<infer E> ? E : never;

type R = TupleToUnion<[1, 2, 3]>;  // 1 | 2 | 3
\`\`\

\`T[number]\` 是索引访问类型，得到所有数字索引处的值的联合。

### 经典题目 2：DeepPartial / DeepReadonly / DeepMutable

\`\`\`ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

type DeepMutable<T> = T extends Function
  ? T
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;
\`\`\

注意排除 \`Function\`——因为函数也是 \`object\`，递归处理函数会出错。

### 经典题目 3：IsEqual / IsAny / IsNever

这三个是类型体操的基础工具，实现起来有讲究：

\`\`\`ts
// IsAny：判断 T 是否是 any
type IsAny<T> = 0 extends 1 & T ? true : false;
// 原理：1 & any = any，0 extends any = true；1 & 其他类型 ≠ any

// IsNever：判断 T 是否是 never（必须用 [T] extends [never] 阻止分布）
type IsNever<T> = [T] extends [never] ? true : false;

// IsEqual：判断两个类型是否相等（处理 any 和 never 的边界情况）
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
\`\`\

\`IsEqual\` 的实现很巧妙——用函数类型的兼容性判断两个类型是否严格相等，能正确处理 \`any\` 和 \`never\`。

### 经典题目 4：IsUnion / IsTuple

\`\`\`ts
// IsUnion：判断 T 是否是联合类型
type IsUnion<T, C = T> = (
  T extends C ? [C] extends [T] : never
) extends never ? false : true;

// IsTuple：判断 T 是否是元组（有 length 属性且 length 是字面量数字）
type IsTuple<T> =
  T extends readonly any[]
    ? number extends T["length"] ? false : true
    : false;
\`\`\

### 经典题目 5：UnionToTuple（概念性）

把联合类型转成元组是类型体操的"圣杯"之一，严格意义上**不可能完美实现**（因为联合类型是无序的），但可以用一些技巧近似实现：

\`\`\`ts
// 概念性实现（依赖联合类型的内部顺序，不保证稳定）
type LastOfUnion<T> = UnionToTuple<T> extends [...any[], infer L] ? L : never;
// 完整实现很长且依赖内部行为，这里只展示概念
\`\`\

### 递归深度限制与尾递归优化

TypeScript 对递归类型有深度限制。非尾递归形式大约支持 50 层，尾递归形式（TypeScript 4.5+）支持约 1000 层。

尾递归的条件：条件类型的两个分支都**直接返回**递归调用结果，不在分支内做额外包装。

\`\`\`ts
// 非尾递归（深度受限，因为结果被包在元组里）
type BadRepeat<T, N extends number, Acc extends T[] = []> =
  Acc["length"] extends N ? Acc : [...BadRepeat<T, N, Acc>, T];

// 尾递归（支持更深，分支直接返回递归调用）
type GoodRepeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc["length"] extends N ? "" : \`\${S}\${GoodRepeat<S, N, [...Acc, ""]>}\`;
\`\`\

### 类型体操的实战技巧

1. **用元组的 length 做计数器**：这是类型层面"循环计数"的标准方式。
2. **用 \`...\` 展开元组**：\`[...Acc, T]\` 往元组追加元素。
3. **用条件类型做分支**：\`T extends U ? X : Y\` 是唯一的"if"。
4. **用 \`infer\` 做模式匹配**：提取类型的某部分。
5. **用 \`never\` 做过滤**：\`never\` 在联合中会被吸收，在映射中会被移除。
6. **用 \`[T] extends [U]\` 阻止分布**：判断整体类型时必须包裹。
7. **测试边界情况**：\`any\`、\`never\`、\`unknown\`、联合、元组都要测。

### 类型体操的局限

1. **性能**：复杂的类型计算会显著拖慢编译速度。
2. **可读性**：类型体操代码很难读懂，需要权衡。
3. **递归深度**：超出限制会报 \`Type instantiation is excessively deep\`。
4. **不能完美模拟所有运行时行为**：比如 \`UnionToTuple\` 的顺序问题。

### 何时该用 / 不该用类型体操

**该用**：
- 编写公共库的工具类型。
- 需要类型安全的 API（路由、事件、配置）。
- 学习和理解 TypeScript 类型系统。

**不该用**：
- 业务代码中过度炫技，影响可读性。
- 用类型做运行时计算（类型在运行时被擦除）。
- 团队不熟悉类型体操，导致维护困难。

下面通过代码演示多个经典类型体操题目的实现，并用变量声明验证编译期类型计算结果。`,
    code: `// ============================================================
// 类型体操 —— 代码演示
// ============================================================
// 类型体操纯编译期，转译后全部擦除。我们用变量声明 + 赋值
// 验证编译期类型计算，并用运行时函数对照展示效果。

console.log("========== 类型体操 ==========");

// ---- 1. TupleToUnion：元组转联合 ----
console.log("\\n---- 1. TupleToUnion ----");

// TupleToUnion<T>：把元组类型转成联合类型
type TupleToUnion<T extends any[]> = T[number];
// 编译期：TupleToUnion<[1, 2, 3]> = 1 | 2 | 3

type TU1 = TupleToUnion<[1, 2, 3]>;
const tu1: TU1 = 1;   // ✅
const tu2: TU1 = 2;   // ✅
const tu3: TU1 = 3;   // ✅
console.log("TupleToUnion<[1,2,3]> 赋值 1:", tu1);
console.log("TupleToUnion<[1,2,3]> 赋值 2:", tu2);
console.log("TupleToUnion<[1,2,3]> 赋值 3:", tu3);

// 运行时对照：把数组元素收集到 Set（模拟联合的去重）
function tupleToUnionRuntime<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
console.log("运行时去重 [1,2,3,2,1]:", tupleToUnionRuntime([1, 2, 3, 2, 1]));

// ---- 2. DeepPartial / DeepReadonly / DeepMutable ----
console.log("\\n---- 2. DeepPartial / DeepReadonly / DeepMutable ----");

// DeepPartial：所有层级可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// DeepReadonly：所有层级只读（排除函数）
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// DeepMutable：移除所有层级只读
type DeepMutable<T> = T extends Function
  ? T
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;

interface AppConfig {
  host: string;
  port: number;
  db: {
    name: string;
    pool: { min: number; max: number };
  };
  fn: () => void;
}

// DeepPartial：所有属性（含嵌套）可选
type PartialConfig = DeepPartial<AppConfig>;
const pCfg: PartialConfig = { db: { pool: { max: 10 } } }; // ✅ 全可选
console.log("DeepPartial<AppConfig>:", JSON.stringify(pCfg));

// DeepReadonly：所有属性（含嵌套）只读
type ReadonlyConfig = DeepReadonly<AppConfig>;
const rCfg: ReadonlyConfig = {
  host: "localhost", port: 3306,
  db: { name: "test", pool: { min: 1, max: 10 } },
  fn: function () {},
};
// rCfg.db.pool.max = 100; // ❌ 编译错误：深层 readonly
console.log("DeepReadonly<AppConfig>:", JSON.stringify(rCfg));

// DeepMutable：移除所有只读
type MutableConfig = DeepMutable<{ readonly a: { readonly b: number } }>;
const mCfg: MutableConfig = { a: { b: 1 } };
mCfg.a.b = 999; // ✅ 可变
console.log("DeepMutable 移除深层 readonly:", JSON.stringify(mCfg));

// 运行时对照：递归 Object.freeze
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    Object.freeze(obj);
    Object.keys(obj).forEach(function (k) { deepFreeze((obj as any)[k]); });
  }
  return obj;
}
const frozen = deepFreeze({ a: { b: 1 } });
console.log("运行时 deepFreeze:", Object.isFrozen(frozen) && Object.isFrozen(frozen.a));

// ---- 3. IsEqual / IsAny / IsNever ----
console.log("\\n---- 3. IsEqual / IsAny / IsNever ----");

// IsAny：判断 T 是否是 any
type IsAny<T> = 0 extends 1 & T ? true : false;
// 原理：1 & any = any，0 extends any = true；1 & 其他 = 该类型，0 不 extends 它
// 编译期：IsAny<any> = true
// 编译期：IsAny<string> = false

// IsNever：判断 T 是否是 never（必须阻止分布）
type IsNever<T> = [T] extends [never] ? true : false;
// 编译期：IsNever<never> = true
// 编译期：IsNever<string> = false

// IsEqual：判断两个类型是否严格相等
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
// 编译期：IsEqual<string, string> = true
// 编译期：IsEqual<string, number> = false
// 编译期：IsEqual<any, string> = false（能正确处理 any）

const isAny1: IsAny<any> = true;
const isAny2: IsAny<string> = false;
console.log("IsAny<any>:", isAny1);
console.log("IsAny<string>:", isAny2);

const isNever1: IsNever<never> = true;
const isNever2: IsNever<string> = false;
console.log("IsNever<never>:", isNever1);
console.log("IsNever<string>:", isNever2);

const isEqual1: IsEqual<string, string> = true;
const isEqual2: IsEqual<string, number> = false;
const isEqual3: IsEqual<any, string> = false;
console.log("IsEqual<string,string>:", isEqual1);
console.log("IsEqual<string,number>:", isEqual2);
console.log("IsEqual<any,string>:", isEqual3, "（正确处理 any）");

// 运行时对照：用 === 模拟相等判断
console.log("运行时 'a'==='a':", "a" === "a");
console.log("运行时 1===1:", 1 === 1);

// ---- 4. IsUnion / IsTuple ----
console.log("\\n---- 4. IsUnion / IsTuple ----");

// IsUnion：判断 T 是否是联合类型
type IsUnion<T, C = T> = (
  T extends C ? [C] extends [T] : never
) extends never ? false : true;
// 编译期：IsUnion<string | number> = true
// 编译期：IsUnion<string> = false

// IsTuple：判断 T 是否是元组
type IsTuple<T> =
  T extends readonly any[]
    ? number extends T["length"] ? false : true
    : false;
// 编译期：IsTuple<[1, 2]> = true
// 编译期：IsTuple<number[]> = false（length 是 number，不是字面量）

const isUnion1: IsUnion<string | number> = true;
const isUnion2: IsUnion<string> = false;
console.log("IsUnion<string|number>:", isUnion1);
console.log("IsUnion<string>:", isUnion2);

const isTuple1: IsTuple<[1, 2]> = true;
const isTuple2: IsTuple<number[]> = false;
console.log("IsTuple<[1,2]>:", isTuple1);
console.log("IsTuple<number[]>:", isTuple2);

// 运行时对照
console.log("运行时 Array.isArray([1,2]):", Array.isArray([1, 2]));

// ---- 5. 字符串操作：Split / Join / Replace ----
console.log("\\n---- 5. 字符串操作类型体操 ----");

// Split：分割字符串
type Split<S extends string, D extends string> =
  S extends \`\${infer A}\${D}\${infer B}\` ? [A, ...Split<B, D>] : [S];
// 编译期：Split<"a,b,c", ","> = ["a", "b", "c"]
type SplitResult = Split<"a,b,c", ",">;
const sr: SplitResult = ["a", "b", "c"];
console.log("Split<'a,b,c', ','>:", JSON.stringify(sr));

// Join：连接字符串元组
type Join<T extends string[], D extends string> =
  T extends [infer F extends string, ...infer R extends string[]]
    ? R extends [] ? F : \`\${F}\${D}\${Join<R, D>}\`
    : "";
// 编译期：Join<["a", "b", "c"], "-"> = "a-b-c"
type JoinResult = Join<["a", "b", "c"], "-">;
const jr: JoinResult = "a-b-c";
console.log("Join<['a','b','c'], '-'>:", jr);

// Replace：替换字符串（首次匹配）
type Replace<S extends string, F extends string, T extends string> =
  S extends \`\${infer A}\${F}\${infer B}\` ? \`\${A}\${T}\${B}\` : S;
// 编译期：Replace<"hello world", "world", "TS"> = "hello TS"
type ReplaceResult = Replace<"hello world", "world", "TS">;
const rr: ReplaceResult = "hello TS";
console.log("Replace<'hello world', 'world', 'TS'>:", rr);

// 运行时对照
console.log("运行时 split:", "a,b,c".split(","));
console.log("运行时 join:", ["a", "b", "c"].join("-"));
console.log("运行时 replace:", "hello world".replace("world", "TS"));

// ---- 6. Repeat：类型层面循环 ----
console.log("\\n---- 6. Repeat：类型层面循环 ----");

// 用 Acc 元组的 length 做计数器
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc["length"] extends N ? "" : \`\${S}\${Repeat<S, N, [...Acc, ""]>}\`;
// 编译期：Repeat<"ab", 3> = "ababab"
type RepeatResult = Repeat<"ab", 3>;
const repR: RepeatResult = "ababab";
console.log("Repeat<'ab', 3>:", repR);

// 运行时对照
console.log("运行时 repeat:", "ab".repeat(3));

// ---- 7. IsAny 的原理演示 ----
console.log("\\n---- 7. IsAny 原理演示 ----");

// IsAny 利用 any 的特殊性：1 & any = any，0 extends any = true
// 而 1 & string = string，0 不 extends string
// 所以 0 extends (1 & T) 只有 T=any 时为 true
type Test1 = 1 & any;      // any
type Test2 = 1 & string;   // string
type Test3 = 1 & number;   // number

// 验证：0 extends Test1 (any) = true
const t1: 0 extends Test1 ? true : false = true;
// 验证：0 extends Test2 (string) = false
const t2: 0 extends Test2 ? true : false = false;
console.log("0 extends (1 & any):", t1);
console.log("0 extends (1 & string):", t2);

// ---- 8. 综合应用：类型安全的配置 ----
console.log("\\n---- 8. 综合应用：类型安全配置 ----");

// 用 DeepPartial 让配置全部可选
interface DefaultConfig {
  port: number;
  host: string;
  db: { name: string; pool: { min: number; max: number } };
}
type PartialDefaultConfig = DeepPartial<DefaultConfig>;

function mergeConfig(defaults: DefaultConfig, override: PartialDefaultConfig): DefaultConfig {
  return Object.assign({}, defaults, override);
}
const defaults: DefaultConfig = {
  port: 3000, host: "localhost",
  db: { name: "app", pool: { min: 1, max: 10 } },
};
const override: PartialDefaultConfig = { port: 8080 };
const merged = mergeConfig(defaults, override);
console.log("合并配置:", JSON.stringify(merged));

console.log("\\n类型体操章节演示完成！");`,
  },

  // =========================================================
  // 第六章：品牌类型与名义类型 (Brand Types & Nominal Types)
  // =========================================================
  {
    id: "ts-brand-types",
    title: "品牌类型与名义类型",
    icon: "🏷️",
    group: "进阶类型深入",
    content: `## 品牌类型与名义类型 (Brand Types & Nominal Types)

TypeScript 默认采用**结构化类型系统**（Structural Type System）——只要两个类型的结构（属性名和类型）兼容，它们就被视为相同的类型，可以互相赋值。这与 Java、C# 等语言的**名义类型系统**（Nominal Type System）不同——后者要求类型必须通过显式声明（如继承）才能兼容。

结构化类型让 TypeScript 更灵活，但也带来一个问题：**不同语义的相同基础类型无法区分**。比如 \`UserId\` 和 \`OrderId\` 在底层都是 \`number\`，结构化类型系统认为它们可以互相赋值，但语义上把一个 \`UserId\` 当作 \`OrderId\` 用是 bug。**品牌类型（Brand Types）** 就是解决这个问题的模式。

本章将极其详细地讲解结构化类型 vs 名义类型、品牌类型的概念与实现、品牌类型的应用场景（防止 ID 混淆、单位系统、状态验证）、Symbol 品牌与 unique symbol，以及品牌类型的优缺点。

### 结构化类型 vs 名义类型

#### 结构化类型（TypeScript 默认）

\`\`\`ts
interface UserA { id: number; name: string; }
interface UserB { id: number; name: string; }

const a: UserA = { id: 1, name: "张三" };
const b: UserB = a; // ✅ 结构相同，可以赋值
\`\`\

\`UserA\` 和 \`UserB\` 虽然名字不同，但结构完全一样，TypeScript 认为它们是兼容的——这就是结构化类型。

#### 名义类型（Java/C# 风格）

在名义类型系统中，即使两个类型结构完全一样，只要名字不同，就不能互相赋值：

\`\`\`java
// Java 伪代码
class UserA { int id; String name; }
class UserB { int id; String name; }
UserA a = new UserA(1, "张三");
UserB b = a; // ❌ 编译错误：类型不兼容
\`\`\

#### 结构化类型的问题

\`\`\`ts
type UserId = number;
type OrderId = number;

function getUser(id: UserId): string { return "用户 " + id; }
function getOrder(id: OrderId): string { return "订单 " + id; }

const userId: UserId = 1001;
getOrder(userId); // ✅ 不报错！但语义上是 bug——把用户 ID 当订单 ID
\`\`\

\`UserId\` 和 \`OrderId\` 都是 \`number\`，TypeScript 无法区分它们。这就是结构化类型的"过度宽松"。

### 品牌类型（Brand Types）概念

品牌类型通过**给类型添加一个独有的"标签"属性**，让结构化类型系统区分语义上不同的类型。这个标签属性在运行时不存在（或不存在有意义），只用于类型层面的区分。

\`\`\`ts
// 品牌类型的实现
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<number, "UserId">;
type OrderId = Brand<number, "OrderId">;

// 现在 UserId 和 OrderId 结构不同（__brand 不同），不能互相赋值
const userId: UserId = 1001 as UserId; // 需要 as 断言"创建"
getOrder(userId); // ❌ 编译错误！不能把 UserId 当 OrderId
\`\`\

\`Brand<T, B>\` 用交叉类型 \`T & { __brand: B }\` 把 \`T\` 和一个独有属性组合起来。\`UserId\` 的结构是 \`number & { __brand: "UserId" }\`，\`OrderId\` 是 \`number & { __brand: "OrderId" }\`——它们的 \`__brand\` 不同，结构不同，所以不能互相赋值。

### Brand 工具的实现

\`\`\`ts
type Brand<T, B extends string> = T & { readonly __brand: B };
\`\`\

这是最简单的实现。更完善的版本会：

1. **用 unique symbol 防止伪造**：用 \`unique symbol\` 作为品牌属性，避免他人构造同结构的对象。
2. **提供构造函数**：用函数封装 \`as Brand\` 断言，集中管理"创建"逻辑。
3. **提供验证函数**：在创建品牌类型时做运行时验证。

#### 用 unique symbol 的品牌

\`\`\`ts
declare const brandSymbol: unique symbol;
type Branded<T> = T & { readonly [brandSymbol]: true };
\`\`\

\`unique symbol\` 是 TypeScript 的特性，每个 \`unique symbol\` 声明都是独一无二的，无法被外部伪造。但 \`unique symbol\` 的使用稍复杂，通常 \`__brand: string\` 的简单实现已足够。

### 品牌类型的应用

#### 应用 1：防止 ID 混淆

\`\`\`ts
type UserId = Brand<number, "UserId">;
type OrderId = Brand<number, "OrderId">;
type ProductId = Brand<number, "ProductId">;

function getUser(id: UserId) { /* ... */ }
function getOrder(id: OrderId) { /* ... */ }

const uid = 1 as UserId;
// getOrder(uid); // ❌ 编译错误，防止混淆
getUser(uid); // ✅ 正确
\`\`\

#### 应用 2：数字单位

\`\`\`ts
type Meters = Brand<number, "Meters">;
type Seconds = Brand<number, "Seconds">;

function speed(distance: Meters, time: Seconds): number {
  return (distance as number) / (time as number);
}

const d = 100 as Meters;
const t = 10 as Seconds;
speed(d, t); // ✅
// speed(t, d); // ❌ 编译错误，单位搞反了
\`\`\

#### 应用 3：状态验证（ValidatedEmail）

\`\`\`ts
type Email = Brand<string, "Email">;
type ValidatedEmail = Brand<Email, "Validated">;

function validateEmail(s: string): ValidatedEmail | null {
  if (/^[^@]+@[^@]+\\.[^@]+$/.test(s)) {
    return s as ValidatedEmail;
  }
  return null;
}

function sendEmail(email: ValidatedEmail) { /* ... */ }
const raw = "test@example.com";
const valid = validateEmail(raw);
if (valid) sendEmail(valid); // ✅ 只有验证过的邮箱才能发送
// sendEmail(raw); // ❌ 不能直接传 string
\`\`\

这把"运行时验证"和"类型系统"结合——只有通过验证的值才能获得 \`ValidatedEmail\` 品牌类型，函数签名要求 \`ValidatedEmail\`，从而在类型层面保证"传给 sendEmail 的邮箱一定是合法的"。

### 品牌类型的优缺点

#### 优点

1. **零运行时成本**：品牌属性在运行时不存在（或为 undefined），不占内存、不影响性能。
2. **编译期安全**：在编译期防止语义混淆，提前发现 bug。
3. **可读性强**：类型名（\`UserId\`、\`ValidatedEmail\`）直接表达语义。
4. **与现有代码兼容**：品牌类型底层仍是基础类型，需要时用 \`as\` 解包。

#### 缺点

1. **需要 \`as\` 断言**：创建品牌类型时需要断言，稍显繁琐。
2. **序列化/反序列化麻烦**：JSON 序列化时品牌属性会丢失，反序列化时需要重新断言。
3. **\`as\` 是逃生舱**：\`as\` 断言绕过了类型检查，如果滥用会失去安全保证。
4. **不能阻止 \`as any\`**：\`as any\` 能绕过一切，品牌类型也无法防。

### 最佳实践

1. **集中管理 \`as\` 断言**：用工厂函数封装创建逻辑，避免 \`as\` 散落各处。
2. **结合运行时验证**：对于有约束的品牌（如 ValidatedEmail），在工厂函数里做验证。
3. **用有意义的品牌名**：品牌名应直接表达语义（\`"UserId"\`、\`"Meters"\`）。
4. **不要滥用**：只有需要区分语义相同但底层类型相同的场景才用品牌。

下面通过代码演示品牌类型的实现和应用。`,
    code: `// ============================================================
// 品牌类型与名义类型 —— 代码演示
// ============================================================
// 品牌类型在转译后会被擦除（__brand 属性运行时不存在）。
// 我们用变量声明 + 赋值验证编译期类型约束，用运行时函数
// 模拟"创建"和"使用"品牌类型的效果。

console.log("========== 品牌类型与名义类型 ==========");

// ---- 1. 结构化类型的问题演示 ----
console.log("\\n---- 1. 结构化类型的问题 ----");

// 没有品牌：UserId 和 OrderId 都是 number，可以混用
type PlainUserId = number;
type PlainOrderId = number;

function getPlainUser(id: PlainUserId): string { return "用户#" + id; }
function getPlainOrder(id: PlainOrderId): string { return "订单#" + id; }

const plainUid: PlainUserId = 1001;
// ⚠️ 结构化类型允许这种"语义错误"的调用
console.log("（无品牌）getPlainOrder(plainUid):", getPlainOrder(plainUid), "← 语义错误但不报错！");

// ---- 2. Brand 工具的实现 ----
console.log("\\n---- 2. Brand 工具实现 ----");

// Brand<T, B>：给 T 加一个独有的 __brand 属性
type Brand<T, B extends string> = T & { readonly __brand: B };

// 创建品牌类型
type UserId = Brand<number, "UserId">;
type OrderId = Brand<number, "OrderId">;
type ProductId = Brand<string, "ProductId">;

// 工厂函数：封装 as 断言，集中管理创建逻辑
function createUserId(n: number): UserId {
  return n as UserId;
}
function createOrderId(n: number): OrderId {
  return n as OrderId;
}

const uid: UserId = createUserId(1001);
const oid: OrderId = createOrderId(2001);
console.log("UserId:", uid, "（运行时仍是 number，__brand 不存在）");
console.log("OrderId:", oid, "（运行时仍是 number）");
console.log("typeof uid:", typeof uid, "← 品牌属性运行时被擦除");

// ---- 3. 品牌类型防止混淆 ----
console.log("\\n---- 3. 品牌类型防止混淆 ----");

function getUser(id: UserId): string { return "查询用户#" + id; }
function getOrder(id: OrderId): string { return "查询订单#" + id; }

// ✅ 正确：用对应品牌类型调用
console.log("getUser(uid):", getUser(uid));
console.log("getOrder(oid):", getOrder(oid));

// ❌ 以下代码会在编译期报错（类型错误不阻止运行，但 IDE 会标红）：
// getUser(oid);   // 编译错误：OrderId 不能赋值给 UserId
// getOrder(uid);  // 编译错误：UserId 不能赋值给 OrderId
console.log("（编译期：getUser(oid) 和 getOrder(uid) 会报错，防止混淆）");

// 模拟一个"错误调用"的尝试（用 as 强制绕过，演示风险）
function buggyCall(): string {
  // 如果有人滥用 as，品牌类型也无法阻止
  const forced = oid as unknown as UserId;
  return getUser(forced);
}
console.log("（滥用 as 绕过）buggyCall():", buggyCall(), "← as 是逃生舱");

// ---- 4. 品牌类型与数字单位 ----
console.log("\\n---- 4. 品牌类型与数字单位 ----");

type Meters = Brand<number, "Meters">;
type Seconds = Brand<number, "Seconds">;
type Kilometers = Brand<number, "Kilometers">;

function createMeters(n: number): Meters { return n as Meters; }
function createSeconds(n: number): Seconds { return n as Seconds; }
function createKilometers(n: number): Kilometers { return n as Kilometers; }

// 计算速度：米 / 秒
function speed(distance: Meters, time: Seconds): number {
  return (distance as number) / (time as number);
}
const distance = createMeters(100);
const time = createSeconds(10);
console.log("speed(100m, 10s):", speed(distance, time), "m/s");

// ❌ 以下调用会在编译期报错：
// speed(time, distance);  // 单位搞反了
// speed(createKilometers(1), time); // 千米不能当米用
console.log("（编译期：speed(time, distance) 会报错，防止单位混淆）");

// 单位转换函数：返回正确的品牌类型
function kmToM(km: Kilometers): Meters {
  return createMeters((km as number) * 1000);
}
const oneKm = createKilometers(1);
console.log("kmToM(1km)=", kmToM(oneKm), "m");
console.log("speed(kmToM(1km), 10s):", speed(kmToM(oneKm), time), "m/s");

// ---- 5. 状态验证：ValidatedEmail ----
console.log("\\n---- 5. 状态验证：ValidatedEmail ----");

// Email 是基础品牌，ValidatedEmail 是验证过的 Email
type Email = Brand<string, "Email">;
type ValidatedEmail = Brand<Email, "Validated">;

// 验证函数：只有合法邮箱才能获得 ValidatedEmail 品牌
function validateEmail(s: string): ValidatedEmail | null {
  // 简单的邮箱格式验证
  const emailRegex = /^[^@]+@[^@]+\\.[^@]+$/;
  if (emailRegex.test(s)) {
    return s as ValidatedEmail;
  }
  return null;
}

// sendEmail 只接受验证过的邮箱
function sendEmail(email: ValidatedEmail): string {
  return "发送邮件到 " + (email as unknown as string);
}

const raw1 = "test@example.com";
const raw2 = "invalid-email";
const valid1 = validateEmail(raw1);
const valid2 = validateEmail(raw2);

console.log("validateEmail('test@example.com'):", valid1 ? "验证通过" : "验证失败");
console.log("validateEmail('invalid-email'):", valid2 ? "验证通过" : "验证失败");

if (valid1) {
  console.log("sendEmail(valid1):", sendEmail(valid1));
}
// ❌ sendEmail(raw1); // 编译错误：string 不能当 ValidatedEmail
console.log("（编译期：sendEmail(raw1) 会报错，必须先验证）");

// ---- 6. 品牌类型与工厂函数 ----
console.log("\\n---- 6. 品牌类型与工厂函数 ----");

// 用工厂函数集中管理品牌创建，避免 as 散落
class IdFactory {
  static userId(n: number): UserId {
    if (n <= 0) throw new Error("UserId 必须为正数");
    return n as UserId;
  }
  static orderId(n: number): OrderId {
    if (n <= 0) throw new Error("OrderId 必须为正数");
    return n as OrderId;
  }
  static productId(s: string): ProductId {
    if (!s.startsWith("P-")) throw new Error("ProductId 必须以 P- 开头");
    return s as ProductId;
  }
}

try {
  const goodUid = IdFactory.userId(100);
  console.log("IdFactory.userId(100):", goodUid);
} catch (e: any) {
  console.log("IdFactory.userId(100) 异常:", e.message);
}

try {
  IdFactory.userId(-1); // 运行时验证失败
} catch (e: any) {
  console.log("IdFactory.userId(-1) 异常:", e.message);
}

try {
  const goodPid = IdFactory.productId("P-001");
  console.log("IdFactory.productId('P-001'):", goodPid);
} catch (e: any) {
  console.log("IdFactory.productId('P-001') 异常:", e.message);
}

try {
  IdFactory.productId("X-001"); // 运行时验证失败
} catch (e: any) {
  console.log("IdFactory.productId('X-001') 异常:", e.message);
}

// ---- 7. 多个品牌组合 ----
console.log("\\n---- 7. 多个品牌组合 ----");

// ValidatedEmail = Brand<Email, "Validated"> 已经是双重品牌
// 还可以做更多层级
type VerifiedEmail = Brand<ValidatedEmail, "Verified">;

function verifyEmail(email: ValidatedEmail): VerifiedEmail | null {
  // 模拟二次验证（如点击确认链接）
  if ((email as unknown as string).endsWith("@example.com")) {
    return email as unknown as VerifiedEmail;
  }
  return null;
}

function sendToVerified(email: VerifiedEmail): string {
  return "发送到已验证邮箱: " + (email as unknown as string);
}

const validated = validateEmail("admin@example.com");
if (validated) {
  const verified = verifyEmail(validated);
  if (verified) {
    console.log("sendToVerified:", sendToVerified(verified));
  } else {
    console.log("verifyEmail 失败（非 example.com 域名）");
  }
}

// ---- 8. 品牌属性的运行时表现 ----
console.log("\\n---- 8. 品牌属性的运行时表现 ----");

// 品牌属性 __brand 在运行时根本不存在
const brandUid: UserId = createUserId(42);
console.log("brandUid:", brandUid);
console.log("brandUid.__brand:", (brandUid as any).__brand, "← undefined，运行时不存在");
console.log("Object.keys(brandUid):", Object.keys(brandUid), "← 空数组，品牌属性不占空间");
console.log("JSON.stringify(brandUid):", JSON.stringify(brandUid), "← 就是普通数字");

// ---- 9. 综合应用：类型安全的 API ----
console.log("\\n---- 9. 综合应用：类型安全 API ----");

type SessionToken = Brand<string, "SessionToken">;
type ApiKey = Brand<string, "ApiKey">;

function createSessionToken(s: string): SessionToken | null {
  if (s.length >= 32) return s as SessionToken;
  return null;
}

function callApi(token: SessionToken, endpoint: string): string {
  return "用 SessionToken 调用 " + endpoint + "（token: " + (token as string).slice(0, 8) + "...)";
}

function callAdminApi(key: ApiKey, endpoint: string): string {
  return "用 ApiKey 调用管理接口 " + endpoint;
}

const token = createSessionToken("a".repeat(32));
if (token) {
  console.log(callApi(token, "/users"));
}
// ❌ callApi(apiKey, "/users"); // 编译错误：ApiKey 不能当 SessionToken
console.log("（编译期：SessionToken 和 ApiKey 不能混用）");

console.log("\\n品牌类型与名义类型章节演示完成！");`,
  },
];