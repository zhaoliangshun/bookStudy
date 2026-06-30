// =============================================================
// TypeScript 类型体操深入教程 —— 第一批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts3-type-gymnastics-intro — 类型体操入门：从基础到递归
//   2. ts3-string-manipulation    — 字符串类型魔法
//   3. ts3-number-arithmetic      — 类型级数学运算
//   4. ts3-advanced-patterns      — 高级类型模式
//   5. ts3-challenges             — 类型挑战实战
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（全部为"类型体操深入"）
//   content : Markdown 格式的详细讲解（3000+ 中文字符）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - TypeScript 先被转译为 JS (target ES2020, module CommonJS)
//   - 在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require Node.js 内置模块
//   - 类型注解在编译后擦除，通过运行时值验证类型行为
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：类型体操入门：从基础到递归
  // =========================================================
  {
    id: "ts3-type-gymnastics-intro",
    title: "类型体操入门：从基础到递归",
    icon: "🧩",
    group: "类型体操深入",
    content: `## 类型体操入门：从基础到递归

### 什么是"类型体操"？

如果你曾经在 TypeScript 项目中见过诸如 \`DeepReadonly<T>\`、\`TupleToUnion<T>\`、\`Parameters<F>\` 这样的类型定义，并且对它们背后的工作原理感到好奇——那么恭喜你，你已经站在了"类型体操"（Type Gymnastics）的大门口。

"类型体操"是中文 TypeScript 社区对**类型层面编程**（Type-Level Programming）的戏称。它指的是利用 TypeScript 类型系统提供的各种高级特性——条件类型、映射类型、模板字面量类型、递归类型等——在**编译阶段**完成复杂的类型计算和变换。类型体操的本质，是把 TypeScript 的类型系统当作一门**纯粹的函数式编程语言**来使用。

为什么要学习类型体操？在日常开发中，你可能直接使用 TypeScript 内置的 \`Partial<T>\`、\`Required<T>\`、\`Pick<T, K>\` 等工具类型而无需自己实现。但当你需要：
- 为复杂的业务场景构建类型安全的 API
- 编写库或框架时提供极致的类型推导
- 解决那些"明明运行时没问题，类型就是通不过"的难题
- 在类型层面消除一整类 bug

此时，类型体操的能力就变得不可或缺。它不仅能让你的代码更安全，还能让你从根本上理解 TypeScript 类型系统的运作方式，成为真正的 TypeScript 高手。

### 类型系统作为一门编程语言

要理解类型体操，首先要建立一个关键认知：**TypeScript 的类型系统本身就是一门图灵完备的编程语言**。这意味着在理论上，任何可计算的问题都可以在类型层面解决（虽然可能极其复杂且不实用）。

在类型层面编程中：
- **类型** 相当于值（value）
- **泛型** 相当于函数（接收类型参数，返回新类型）
- **条件类型** 相当于 if/else 分支
- **映射类型** 相当于对象的变换/遍历
- **递归类型** 相当于循环/递归
- **元组类型** 常被用来表示"计数器"或"堆栈"

让我们从最基础的工具类型开始，逐步深入。

### 条件类型：类型层面的 if/else

条件类型是类型体操中最基础也是最重要的构建块。它的语法是：

\`\`\`ts
type SomeType<T> = T extends U ? X : Y;
\`\`\`

这可以读作："如果 T 可以赋值给 U（即 T 是 U 的子类型），那么类型是 X，否则是 Y。"

\`extends\` 关键字在这里的含义不是"继承"，而是"类型约束检查"或"是否可赋值"。让我们看几个例子：

\`\`\`ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
type C = IsString<string>;   // true
\`\`\`

条件类型最强大的特性之一是**分配律**（Distributive Conditional Types）。当传入的 T 是联合类型时，条件类型会自动分配到每个成员上：

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArr = ToArray<string | number>;
// 等价于 string[] | number[]（而不是 (string | number)[]）
\`\`\`

这个特性非常重要，是很多高级类型技巧的基础。如果你想阻止分配，可以用方括号包裹：

\`\`\`ts
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Result = ToArrayNonDist<string | number>;
// (string | number)[]
\`\`\`

### infer 关键字：类型提取

\`infer\` 是条件类型中的"模式匹配"工具。它允许你在 extends 子句中声明一个类型变量，TypeScript 会自动推断出该位置的实际类型：

\`\`\`ts
type ReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

type Fn = (x: number) => string;
type R = ReturnType<Fn>;  // string
\`\`\`

这里的 \`infer R\` 告诉 TypeScript："如果 F 是一个函数类型，那么把它的返回值类型提取出来，命名为 R。"\`infer\` 可以出现在任何你想提取类型的位置——函数参数、Promise 的内部类型、数组元素类型等。

### 映射类型：对象类型变换

映射类型允许你基于一个已有的对象类型，创建一个新的对象类型，对每个属性进行变换：

\`\`\`ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Partial<T> = {
  [K in keyof T]?: T[K];
};
\`\`\`

\`keyof T\` 产生 T 的所有键的联合类型，\`[K in keyof T]\` 则遍历每个键。你可以添加修饰符（\`readonly\`、\`?\`），也可以通过 \`-\` 前缀移除它们：

\`\`\`ts
type Required<T> = {
  [K in keyof T]-?: T[K];  // -? 移除可选修饰符
};

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];  // -readonly 移除只读修饰符
};
\`\`\`

### 元组长度技巧：类型层面的计数器

类型系统没有天然的"数字"概念——数字字面量类型（如 \`1\`、\`2\`、\`3\`）只是标记，不能直接做加减乘除。但我们可以利用**元组的长度**来模拟数字运算。

关键思路：\`[any, any, any]['length']\` 的类型是 \`3\`。通过构建不同长度的元组，我们可以"数"到某个数字。通过向元组中添加或移除元素，我们可以实现加减运算。

\`\`\`ts
// 构建长度为 N 的元组
type BuildTuple<N extends number, T extends any[] = []> =
  T['length'] extends N ? T : BuildTuple<N, [...T, any]>;

type Tuple3 = BuildTuple<3>;  // [any, any, any]
type Len3 = Tuple3['length']; // 3
\`\`\`

这是一个**递归类型别名**的例子。TypeScript 4.1+ 支持在类型别名中使用递归，这是类型体操的核心技巧之一。递归有终止条件（\`T['length'] extends N\`），否则会无限递归。

### 递归类型家族：DeepReadonly 与 DeepPartial

基础的 \`Readonly<T>\` 和 \`Partial<T>\` 只处理第一层属性。如果对象有嵌套结构，我们需要递归地处理每一层：

\`\`\`ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
\`\`\`

递归类型的核心模式是：
1. 定义基本情况（base case）：当类型不再需要递归时直接返回
2. 定义递归情况（recursive case）：对需要深入的部分继续应用自身

需要注意的是，\`T[K] extends object\` 这个判断需要小心处理——函数、数组也是 object，通常你需要更精细的判断。例如，数组应该保留其结构：

\`\`\`ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T  // 函数保持不变
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>  // 数组变为只读数组
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;  // 原始类型直接返回
\`\`\`

### TupleToUnion：元组转联合类型

将元组类型转换为其所有元素类型的联合类型，是一个经典的类型体操入门题。最简洁的实现方式是利用索引访问：

\`\`\`ts
type TupleToUnion<T extends readonly any[]> = T[number];

type Colors = TupleToUnion<['red', 'green', 'blue']>;
// 'red' | 'green' | 'blue'
\`\`\`

\`T[number]\` 的含义是：用 \`number\` 索引类型 T，得到的就是所有数字索引位置上的元素类型的联合。这就像在运行时用数字索引访问数组可以得到任意元素一样，在类型层面用 \`number\` 索引元组就得到所有可能元素类型的联合。

### 类型体操的思维方式

学习类型体操最大的障碍不是语法，而是**思维方式的转变**。在运行时编程中，你习惯于：
1. 接收输入值
2. 根据条件做判断
3. 循环或递归处理数据
4. 返回输出值

在类型层面编程中，你需要做完全相同的事情，只是"值"变成了"类型"，"函数"变成了"泛型"，"if/else"变成了"条件类型"，"循环"变成了"递归"。每次写一个类型工具时，问自己：
- 输入是什么类型？（泛型参数）
- 需要做什么判断？（extends 条件）
- 需要遍历什么？（映射类型、infer 模式匹配）
- 需要在什么时候停止递归？（终止条件）

### 本章实践建议

1. **从内置工具类型开始**：尝试自己实现 \`Partial\`、\`Required\`、\`Readonly\`、\`Pick\`、\`Record\`、\`Exclude\`、\`Extract\`、\`Omit\`——这些是最好的练习题。
2. **理解分配条件类型**：搞清楚为什么 \`T extends U\` 在 T 是联合类型时会分配。
3. **熟练使用 infer**：练习从各种复杂类型中提取子类型。
4. **掌握递归模式**：从 DeepReadonly、DeepPartial 开始，逐渐理解递归类型的写法。

下面的代码示例将一步步演示这些概念的实际用法，通过运行时的输出来验证类型计算的结果。`,
    code: `// ============================================================
// 第一章代码演示：类型体操入门 —— 从基础到递归
// ============================================================
// 说明：类型体操主要在编译期生效，但我们可以通过运行时值来
// 演示这些类型工具的效果。使用"类型断言+赋值"模式来验证
// 类型计算是否正确。

console.log("========== 1. 基础条件类型 ==========");

// 条件类型：IsString —— 判断类型是否为 string
// 原理：T extends string ? true : false
//        如果 T 可以赋值给 string，返回字面量类型 true，否则 false
type IsString<T> = T extends string ? true : false;

// 编译期验证：如果类型不匹配，TS 会报错
const _test1a: IsString<"hello"> = true;
const _test1b: IsString<42> = false;
const _test1c: IsString<string> = true;
const _test1d: IsString<boolean> = false;
console.log("IsString<'hello'> = true  ✓");
console.log("IsString<42> = false      ✓");
console.log("IsString<string> = true   ✓");

// 运行时演示：模拟类型判断
function isString(value: unknown): boolean {
  return typeof value === "string";
}
console.log("\\n运行时 isString 演示:");
console.log("  isString('hello'):", isString("hello"));
console.log("  isString(42):", isString(42));
console.log("  isString(true):", isString(true));

console.log("\\n========== 2. 分配条件类型 ==========");

// 分配条件类型：当 T 是联合类型时，条件类型会分配到每个成员
type ToArray<T> = T extends any ? T[] : never;
// string | number 被分配为 string[] | number[]
type StrOrNumArr = ToArray<string | number>;
const _test2a: StrOrNumArr = ["a", "b"];
const _test2b: StrOrNumArr = [1, 2];
console.log("ToArray<string | number> = string[] | number[]  ✓");

// 阻止分配：用方括号包裹
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type NonDistResult = ToArrayNonDist<string | number>;
const _test2c: NonDistResult = ["a", 1];
console.log("ToArrayNonDist<string | number> = (string|number)[]  ✓");

// Exclude 和 Extract 的实现原理
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type Excluded = MyExclude<"a" | "b" | "c", "a">;  // "b" | "c"
type Extracted = MyExtract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"
const _test2d: Excluded = "b";
const _test2e: Extracted = "a";
console.log("MyExclude<'a'|'b'|'c', 'a'> = 'b'|'c'  ✓");
console.log("MyExtract<'a'|'b'|'c', 'a'|'b'> = 'a'|'b'  ✓");

// 运行时演示 Exclude/Extract 行为
function myExcludeValues(arr: string[], exclude: string[]): string[] {
  return arr.filter((x) => !exclude.includes(x));
}
console.log("\\n运行时 Exclude 演示:", myExcludeValues(["a", "b", "c"], ["a"]));

console.log("\\n========== 3. infer 关键字：类型提取 ==========");

// ReturnType：提取函数返回值类型
// 原理：用 infer R 在 extends 中声明一个待推断的类型变量
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

function greet(name: string): string {
  return "Hello, " + name;
}
function add(a: number, b: number): number {
  return a + b;
}

type GreetReturn = MyReturnType<typeof greet>;  // string
type AddReturn = MyReturnType<typeof add>;      // number
const _test3a: GreetReturn = "hello";
const _test3b: AddReturn = 42;
console.log("MyReturnType<typeof greet> = string  ✓");
console.log("MyReturnType<typeof add> = number    ✓");

// Parameters：提取函数参数类型为元组
type MyParameters<F> = F extends (...args: infer P) => any ? P : never;
type GreetParams = MyParameters<typeof greet>;  // [string]
type AddParams = MyParameters<typeof add>;      // [number, number]
const _test3c: GreetParams = ["world"];
const _test3d: AddParams = [1, 2];
console.log("MyParameters<typeof greet> = [string]  ✓");
console.log("MyParameters<typeof add> = [number, number]  ✓");

// Awaited：提取 Promise 包裹的类型
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
type NestedPromise = MyAwaited<Promise<Promise<string>>>;  // string
const _test3e: NestedPromise = "resolved";
console.log("MyAwaited<Promise<Promise<string>>> = string  ✓");

// 运行时演示
console.log("\\n运行时函数结果:");
console.log("  greet('World'):", greet("World"));
console.log("  add(1, 2):", add(1, 2));

console.log("\\n========== 4. 映射类型：对象变换 ==========");

// 实现内置工具类型
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;

interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = MyReadonly<User>;
type PartialUser = MyPartial<User>;
type UserNoEmail = MyOmit<User, "email">;
type UserNameOnly = MyPick<User, "name">;

const _test4a: ReadonlyUser = { id: 1, name: "张三", email: "z@e.com" };
const _test4b: PartialUser = { name: "李四" };
const _test4c: UserNoEmail = { id: 2, name: "王五" };
const _test4d: UserNameOnly = { name: "赵六" };
console.log("MyReadonly<User> — 所有属性只读  ✓");
console.log("MyPartial<User> — 所有属性可选  ✓");
console.log("MyOmit<User, 'email'> — 排除 email 属性  ✓");
console.log("MyPick<User, 'name'> — 只保留 name 属性  ✓");

// 运行时演示对象变换
function pickObj<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}
function omitObj<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

const user: User = { id: 1, name: "张三", email: "zhang@example.com" };
console.log("\\n运行时对象变换:");
console.log("  pick:", JSON.stringify(pickObj(user, ["id", "name"])));
console.log("  omit:", JSON.stringify(omitObj(user, ["email"])));

console.log("\\n========== 5. 元组长度技巧：类型层面的数字 ==========");

// BuildTuple：构建长度为 N 的元组
// 原理：递归地向元组添加元素，直到长度达到 N
type BuildTuple<N extends number, T extends any[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, any]>;

type Tuple0 = BuildTuple<0>;  // []
type Tuple3 = BuildTuple<3>;  // [any, any, any]
type Tuple5 = BuildTuple<5>;  // [any, any, any, any, any]
const _test5a: Tuple0["length"] = 0;
const _test5b: Tuple3["length"] = 3;
const _test5c: Tuple5["length"] = 5;
console.log("BuildTuple<0> 长度 = 0  ✓");
console.log("BuildTuple<3> 长度 = 3  ✓");
console.log("BuildTuple<5> 长度 = 5  ✓");

// 用元组实现加法：将两个元组合并，取长度
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];

type Sum2_3 = Add<2, 3>;  // 5
const _test5d: Sum2_3 = 5;
console.log("Add<2, 3> =", typeof 5, " ✓");

// 运行时演示：元组长度
console.log("\\n运行时元组操作:");
const tuple3 = [1, 2, 3] as const;
const tuple2 = [4, 5] as const;
console.log("  元组长度:", tuple3.length);
console.log("  合并后长度:", [...tuple3, ...tuple2].length);

console.log("\\n========== 6. 递归类型：DeepReadonly 与 DeepPartial ==========");

// DeepReadonly：递归地将所有属性变为只读
// 处理三种情况：函数（保持不变）、数组（变为只读数组）、对象（递归）、原始类型（直接返回）
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// DeepPartial：递归地将所有属性变为可选
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface NestedConfig {
  app: {
    name: string;
    port: number;
    db: {
      host: string;
      port: number;
      credentials: {
        user: string;
        pass: string;
      };
    };
  };
  features: string[];
}

type ReadonlyConfig = DeepReadonly<NestedConfig>;
type PartialConfig = DeepPartial<NestedConfig>;

const _test6a: ReadonlyConfig = {
  app: {
    name: "MyApp",
    port: 3000,
    db: {
      host: "localhost",
      port: 5432,
      credentials: { user: "admin", pass: "secret" },
    },
  },
  features: ["auth", "cache"],
};
const _test6b: PartialConfig = {
  app: { db: { host: "remotehost" } },
};
console.log("DeepReadonly<NestedConfig> — 嵌套属性全部只读  ✓");
console.log("DeepPartial<NestedConfig> — 嵌套属性全部可选  ✓");

// 运行时演示 deepFreeze（运行时等价物）
function deepFreeze<T>(obj: T): DeepReadonly<T> {
  if (obj === null || typeof obj !== "object") return obj as DeepReadonly<T>;
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (typeof value === "object" && value !== null) {
      deepFreeze(value);
    }
  });
  return obj as DeepReadonly<T>;
}

const config = deepFreeze({
  app: { name: "Test", port: 3000, db: { host: "localhost" } },
});
console.log("\\n运行时 deepFreeze 演示:");
console.log("  对象已冻结:", Object.isFrozen(config));

console.log("\\n========== 7. TupleToUnion：元组转联合 ==========");

// 方法1：利用 T[number] 索引访问
type TupleToUnion<T extends readonly any[]> = T[number];

// 方法2：递归实现（更通用）
type TupleToUnionRec<T extends readonly any[]> =
  T extends readonly [infer First, ...infer Rest]
  ? First | TupleToUnionRec<Rest>
  : never;

type ColorTuple = readonly ["red", "green", "blue", "yellow"];
type ColorUnion = TupleToUnion<ColorTuple>;
type ColorUnion2 = TupleToUnionRec<ColorTuple>;

const _test7a: ColorUnion = "red";
const _test7b: ColorUnion = "green";
const _test7c: ColorUnion = "blue";
const _test7d: ColorUnion2 = "yellow";
console.log("TupleToUnion<['red','green','blue','yellow']> = 'red'|'green'|'blue'|'yellow'  ✓");

// 反过来：UnionToTuple（更复杂，后续章节讲解）
// 这里先展示运行时效果
function tupleToUnionRuntime<T extends readonly any[]>(tuple: T): T[number] {
  return tuple[Math.floor(Math.random() * tuple.length)];
}
const colors = ["red", "green", "blue"] as const;
const randomColor = tupleToUnionRuntime(colors);
console.log("\\n运行时随机颜色:", randomColor);

console.log("\\n========== 8. 综合实战：DeepOmit ==========");

// DeepOmit：递归地移除指定的键
type DeepOmit<T, K extends PropertyKey> = T extends object
  ? { [P in MyExclude<keyof T, K>]: DeepOmit<T[P], K> }
  : T;

interface ApiResponse {
  id: string;
  __typename: string;
  data: {
    id: string;
    __typename: string;
    user: {
      id: string;
      __typename: string;
      name: string;
    };
  };
}

type CleanResponse = DeepOmit<ApiResponse, "__typename">;
// { id: string; data: { id: string; user: { id: string; name: string } } }

const _test8: CleanResponse = {
  id: "resp1",
  data: {
    id: "data1",
    user: { id: "u1", name: "张三" },
  },
};
console.log("DeepOmit<ApiResponse, '__typename'> — 递归移除 __typename  ✓");
console.log("结果结构:", JSON.stringify(_test8, null, 2));

// 运行时 deepOmit
function deepOmit<T extends Record<string, any>, K extends string>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = {} as any;
  for (const key of Object.keys(obj)) {
    if (keys.includes(key as K)) continue;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = deepOmit(value, keys);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const dirty: ApiResponse = {
  id: "resp1",
  __typename: "Response",
  data: {
    id: "data1",
    __typename: "Data",
    user: { id: "u1", __typename: "User", name: "张三" },
  },
};
console.log("\\n运行时 deepOmit 结果:", JSON.stringify(deepOmit(dirty, ["__typename"]), null, 2));

console.log("\\n类型体操入门演示完成！");
console.log("接下来你将学习字符串类型魔法、类型级数学、高级模式和类型挑战。");`,
  },

  // =========================================================
  // 第二章：字符串类型魔法
  // =========================================================
  {
    id: "ts3-string-manipulation",
    title: "字符串类型魔法",
    icon: "✂️",
    group: "类型体操深入",
    content: `## 字符串类型魔法

### 模板字面量类型的革命

TypeScript 4.1 引入的**模板字面量类型**（Template Literal Types）是类型系统中最具革命性的特性之一。它让我们能够在类型层面进行字符串的拼接、解析和变换，开启了字符串类型体操的大门。在此之前，类型系统几乎无法对字符串字面量类型进行任何有意义的操作；而在此之后，从简单的大小写转换到复杂的路由解析，都可以在类型层面完成。

模板字面量类型的语法和运行时的模板字符串非常相似：

\`\`\`ts
type Greeting = \`Hello, \${"World"}!\`;  // "Hello, World!"
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ClickEvent = EventName<"click">;  // "onClick"
\`\`\`

但它的真正威力在于与 \`infer\` 关键字的结合——你可以用模式匹配的方式从字符串类型中"解构"出子串，就像正则表达式捕获组一样。

### 字符串模式匹配：infer 在模板类型中的应用

在条件类型的 extends 子句中，你可以用模板字面量类型进行模式匹配，并用 \`infer\` 捕获其中的部分：

\`\`\`ts
type GetLastName<T> = T extends \`\${infer _FirstName} \${infer LastName}\`
  ? LastName
  : never;

type L1 = GetLastName<"Michael Jordan">;  // "Jordan"
type L2 = GetLastName<"Kobe Bryant">;    // "Bryant"
\`\`\`

\`\`\`ts
// 匹配前缀
type StartsWith<T extends string, Prefix extends string> =
  T extends \`\${Prefix}\${string}\` ? true : false;

type SW1 = StartsWith<"hello world", "hello">;  // true
type SW2 = StartsWith<"hello world", "world">;  // false

// 匹配后缀
type EndsWith<T extends string, Suffix extends string> =
  T extends \`\${string}\${Suffix}\` ? true : false;

type EW1 = EndsWith<"hello world", "world">;  // true
\`\`\`

这里的 \`\${string}\` 是一个通配符——它匹配任意字符串。你可以把它想象成正则表达式中的 \`.*\`。

### 内置字符串工具类型

TypeScript 提供了几个内置的字符串操作工具类型：

| 工具类型 | 描述 | 示例 |
| --- | --- | --- |
| \`Uppercase<S>\` | 将字符串转为大写 | \`Uppercase<'hello'>\` → \`'HELLO'\` |
| \`Lowercase<S>\` | 将字符串转为小写 | \`Lowercase<'HELLO'>\` → \`'hello'\` |
| \`Capitalize<S>\` | 首字母大写 | \`Capitalize<'hello'>\` → \`'Hello'\` |
| \`Uncapitalize<S>\` | 首字母小写 | \`Uncapitalize<'Hello'>\` → \`'hello'\` |

这些类型在编译器内部实现（intrinsic types），性能极好，但功能有限。要实现更复杂的字符串变换，我们需要递归。

### Split：类型层面的字符串分割

在运行时，\`String.prototype.split()\` 可以按分隔符将字符串拆分为数组。在类型层面，我们可以用递归 + 模式匹配来实现同样的功能：

\`\`\`ts
type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
  ? [Head, ...Split<Tail, D>]
  : [S];

type Parts = Split<"a-b-c-d", "-">;  // ["a", "b", "c", "d"]
\`\`\`

这个类型的工作原理：
1. 检查 S 是否匹配 \`{Head}{D}{Tail}\` 模式
2. 如果匹配，将 Head 作为结果元组的第一个元素，然后递归处理 Tail
3. 如果不匹配（没有更多分隔符），将剩余的 S 作为单元素元组返回

这是一个典型的递归类型，每次递归"消费"字符串的一部分，直到无法继续匹配。

### Join：类型层面的字符串拼接

Join 是 Split 的逆操作——将元组中的字符串元素用分隔符连接起来：

\`\`\`ts
type Join<T extends string[], D extends string> =
  T extends [infer First extends string, ...infer Rest extends string[]]
  ? Rest extends []
    ? First
    : \`\${First}\${D}\${Join<Rest, D>}\`
  : "";

type Result = Join<["a", "b", "c"], "-">;  // "a-b-c"
\`\`\`

这里我们需要处理边界情况：当元组为空时返回空字符串；当元组只有一个元素时直接返回该元素；否则拼接第一个元素、分隔符和递归处理剩余元素的结果。

### ReplaceAll：类型层面的全局替换

实现 Replace 需要注意避免无限递归。关键是每次只替换第一个匹配项，然后递归处理剩余部分：

\`\`\`ts
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends \`\${infer Before}\${From}\${infer After}\`
  ? \`\${Before}\${To}\${ReplaceAll<After, From, To>}\`
  : S;

type Replaced = ReplaceAll<"hello world hello", "hello", "hi">;
// "hi world hi"
\`\`\`

注意这里 From 不能是空字符串——否则 Before 和 After 的匹配会产生歧义，导致无限递归。

### 大小写转换：CamelCase / SnakeCase / kebab-case 互转

这是字符串类型体操中最经典的实战场景之一。在 API 开发中，后端常用 snake_case，前端常用 camelCase，URL 路径常用 kebab-case。类型安全的转换可以避免大量的命名不一致问题。

**SnakeCase 转 CamelCase：**

\`\`\`ts
type SnakeToCamel<S extends string> =
  S extends \`\${infer Head}_\${infer Letter}\${infer Tail}\`
  ? \`\${Head}\${Uppercase<Letter>}\${SnakeToCamel<Tail>}\`
  : S;

type CamelName = SnakeToCamel<"user_name">;  // "userName"
type CamelFull = SnakeToCamel<"first_name_and_last_name">;
// "firstNameAndLastName"
\`\`\`

原理：每次匹配 \`{任意字符}_{一个字母}{剩余部分}\` 的模式，将下划线后的字母转为大写，然后递归处理剩余部分。

**CamelCase 转 SnakeCase：**

这个方向稍微复杂，因为我们需要识别大写字母并在其前面加下划线：

\`\`\`ts
type CamelToSnake<S extends string> =
  S extends \`\${infer First}\${infer Rest}\`
  ? First extends Uppercase<First>
    ? \`_\${Lowercase<First>}\${CamelToSnake<Rest>}\`
    : \`\${First}\${CamelToSnake<Rest>}\`
  : "";
\`\`\`

但这种方式每次只处理一个字符，效率较低且在首字符处会产生前导下划线。更优雅的方式是利用 TypeScript 的内在大写映射特性：

实际上，更常见的做法是逐字符检查：

\`\`\`ts
type CamelToSnake<S extends string, Acc extends string = ""> =
  S extends \`\${infer C}\${infer Rest}\`
  ? C extends Uppercase<C>
    ? CamelToSnake<Rest, \`\${Acc}_\${Lowercase<C>}\`>
    : CamelToSnake<Rest, \`\${Acc}\${C}\`>
  : Acc extends \`_\${infer T}\`  // 去掉首字母可能的下划线
  ? T
  : Acc;
\`\`\`

### StringToUnion：字符串转字符联合

将字符串字面量类型拆分为其所有字符的联合类型：

\`\`\`ts
type StringToUnion<S extends string> =
  S extends \`\${infer C}\${infer Rest}\`
  ? C | StringToUnion<Rest>
  : never;

type Chars = StringToUnion<"abc">;  // "a" | "b" | "c"
\`\`\`

每次递归提取第一个字符 C，然后与剩余字符串的字符联合类型组成联合。

### Trim：去除首尾空白

实现 Trim 需要递归地从两端移除空白字符：

\`\`\`ts
type Whitespace = " " | "\\n" | "\\t" | "\\r";

type TrimLeft<S extends string> =
  S extends \`\${Whitespace}\${infer Rest}\` ? TrimLeft<Rest> : S;

type TrimRight<S extends string> =
  S extends \`\${infer Rest}\${Whitespace}\` ? TrimRight<Rest> : S;

type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type Trimmed = Trim<"  hello world  ">;  // "hello world"
\`\`\`

### 实战：类型安全的路由系统

字符串类型魔法最强大的应用场景之一是构建类型安全的路由系统。通过模板字面量类型，我们可以：
1. 定义路由模式（如 \`/users/:id/posts/:postId\`）
2. 从路由模式中提取参数名称
3. 生成对应的参数类型
4. 确保路径参数和函数参数的一致性

\`\`\`ts
// 从路由路径中提取参数名
type ExtractParams<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
  ? Param | ExtractParams<\`/\${Rest}\`>
  : Path extends \`\${string}:\${infer Param}\`
  ? Param
  : never;

// 生成参数对象类型
type RouteParams<Path extends string> = {
  [K in ExtractParams<Path>]: string;
};

type UserPostParams = RouteParams<"/users/:id/posts/:postId">;
// { id: string; postId: string }
\`\`\`

### 字符串类型体操的通用模式

通过以上例子，我们可以总结出字符串类型体操的几个通用模式：

1. **模式匹配 + 递归消费**：用 \`extends \`\${infer X}...\${infer Y}\`\` 匹配模式，递归"消费"字符串。
2. **累加器模式**：使用额外的泛型参数作为累加器（Accumulator），在递归中逐步构建结果。
3. **首字符特殊处理**：很多字符串操作可以逐字符进行，每次处理第一个字符，然后递归处理剩余部分。
4. **边界条件处理**：空字符串是递归的终止条件；首尾字符的特殊情况需要单独处理。

掌握这些模式后，几乎所有字符串层面的变换都可以实现。下一节的代码将逐一演示这些类型工具，并通过运行时验证它们的行为。`,
    code: `// ============================================================
// 第二章代码演示：字符串类型魔法
// ============================================================

console.log("========== 1. 模板字面量类型基础 ==========");

// 基础拼接
type Greet<T extends string> = \`Hello, \${T}!\`;
type GreetWorld = Greet<"World">;  // "Hello, World!"
const _test1a: GreetWorld = "Hello, World!";
console.log("Greet<'World'> = 'Hello, World!'  ✓");

// 事件名称生成
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ClickEvent = EventName<"click">;     // "onClick"
type ChangeEvent = EventName<"change">;   // "onChange"
type SubmitEvent = EventName<"submit">;   // "onSubmit"
const _test1b: ClickEvent = "onClick";
const _test1c: ChangeEvent = "onChange";
console.log("EventName<'click'> = 'onClick'  ✓");
console.log("EventName<'change'> = 'onChange'  ✓");
console.log("EventName<'submit'> = 'onSubmit'  ✓");

// 动态生成 CSS 属性类型
type CssProperty = "margin" | "padding" | "border";
type CssDirection = "top" | "right" | "bottom" | "left";
type SpacingKey = \`\${CssProperty}-\${CssDirection}\`;
const _test1d: SpacingKey = "margin-top";
console.log("SpacingKey 示例: margin-top, padding-left  ✓");

// 运行时拼接演示
function eventName<T extends string>(event: T): \`on\${Capitalize<T>}\` {
  return ("on" + event.charAt(0).toUpperCase() + event.slice(1)) as any;
}
console.log("\\n运行时事件名:");
console.log("  click ->", eventName("click"));
console.log("  change ->", eventName("change"));
console.log("  mouseDown ->", eventName("mouseDown"));

console.log("\\n========== 2. 模式匹配：StartsWith / EndsWith / Includes ==========");

// StartsWith：检查是否以指定前缀开头
type StartsWith<T extends string, Prefix extends string> =
  T extends \`\${Prefix}\${string}\` ? true : false;

type SW1 = StartsWith<"hello world", "hello">;  // true
type SW2 = StartsWith<"hello world", "world">;  // false
type SW3 = StartsWith<"TypeScript", "Type">;    // true
const _test2a: SW1 = true;
const _test2b: SW2 = false;
const _test2c: SW3 = true;
console.log("StartsWith<'hello world', 'hello'> = true   ✓");
console.log("StartsWith<'hello world', 'world'> = false  ✓");
console.log("StartsWith<'TypeScript', 'Type'> = true     ✓");

// EndsWith：检查是否以指定后缀结尾
type EndsWith<T extends string, Suffix extends string> =
  T extends \`\${string}\${Suffix}\` ? true : false;

type EW1 = EndsWith<"hello world", "world">;  // true
type EW2 = EndsWith<"hello world", "hello">;  // false
const _test2d: EW1 = true;
const _test2e: EW2 = false;
console.log("EndsWith<'hello world', 'world'> = true   ✓");
console.log("EndsWith<'hello world', 'hello'> = false  ✓");

// 运行时实现
function startsWith(str: string, prefix: string): boolean {
  return str.startsWith(prefix);
}
function endsWith(str: string, suffix: string): boolean {
  return str.endsWith(suffix);
}
console.log("\\n运行时检查:");
console.log("  'hello world' startsWith 'hello':", startsWith("hello world", "hello"));
console.log("  'hello world' endsWith 'world':", endsWith("hello world", "world"));

console.log("\\n========== 3. Split：字符串分割 ==========");

// Split：按分隔符将字符串拆分为元组
// 原理：模式匹配 {Head}{Delimiter}{Tail}，递归处理
type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
  ? [Head, ...Split<Tail, D>]
  : S extends ""
  ? []
  : [S];

type Parts1 = Split<"a-b-c-d", "-">;      // ["a", "b", "c", "d"]
type Parts2 = Split<"hello/world/foo", "/">;  // ["hello", "world", "foo"]
type Parts3 = Split<"single", "-">;       // ["single"]
type Parts4 = Split<"", "-">;            // []
const _test3a: Parts1 = ["a", "b", "c", "d"];
const _test3b: Parts2 = ["hello", "world", "foo"];
const _test3c: Parts3 = ["single"];
const _test3d: Parts4 = [];
console.log("Split<'a-b-c-d', '-'> = ['a','b','c','d']  ✓");
console.log("Split<'hello/world/foo', '/'> = ['hello','world','foo']  ✓");
console.log("Split<'single', '-'> = ['single']  ✓");
console.log("Split<'', '-'> = []  ✓");

// 运行时 Split
function splitString(str: string, delimiter: string): string[] {
  return str.split(delimiter);
}
console.log("\\n运行时 split:");
console.log("  'a-b-c-d'.split('-'):", splitString("a-b-c-d", "-"));
console.log("  'hello/world'.split('/'):", splitString("hello/world", "/"));

console.log("\\n========== 4. Join：字符串拼接 ==========");

// Join：将字符串元组用分隔符连接起来
type Join<T extends readonly string[], D extends string> =
  T extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
  ? Rest extends readonly []
    ? First
    : \`\${First}\${D}\${Join<Rest, D>}\`
  : "";

type Joined1 = Join<["a", "b", "c"], "-">;       // "a-b-c"
type Joined2 = Join<["hello", "world"], " ">;     // "hello world"
type Joined3 = Join<["single"], "-">;             // "single"
type Joined4 = Join<[], "-">;                     // ""
const _test4a: Joined1 = "a-b-c";
const _test4b: Joined2 = "hello world";
const _test4c: Joined3 = "single";
const _test4d: Joined4 = "";
console.log("Join<['a','b','c'], '-'> = 'a-b-c'  ✓");
console.log("Join<['hello','world'], ' '> = 'hello world'  ✓");
console.log("Join<['single'], '-'> = 'single'  ✓");
console.log("Join<[], '-'> = ''  ✓");

// 运行时 Join
function joinStrings(arr: string[], delimiter: string): string {
  return arr.join(delimiter);
}
console.log("\\n运行时 join:");
console.log("  ['a','b','c'].join('-'):", joinStrings(["a", "b", "c"], "-"));

console.log("\\n========== 5. Replace 与 ReplaceAll ==========");

// Replace：替换第一个匹配项
type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends \`\${infer Before}\${From}\${infer After}\`
  ? \`\${Before}\${To}\${After}\`
  : S;

// ReplaceAll：替换所有匹配项（递归）
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = From extends ""
  ? S
  : S extends \`\${infer Before}\${From}\${infer After}\`
  ? \`\${Before}\${To}\${ReplaceAll<After, From, To>}\`
  : S;

type Replaced1 = Replace<"hello world", "world", "TypeScript">;  // "hello TypeScript"
type Replaced2 = ReplaceAll<"a-b-c-d", "-", "_">;  // "a_b_c_d"
type Replaced3 = ReplaceAll<"the cat sat on the mat", "the", "a">;
// "a cat sat on a mat"
const _test5a: Replaced1 = "hello TypeScript";
const _test5b: Replaced2 = "a_b_c_d";
const _test5c: Replaced3 = "a cat sat on a mat";
console.log("Replace<'hello world','world','TypeScript'> = 'hello TypeScript'  ✓");
console.log("ReplaceAll<'a-b-c-d','-','_'> = 'a_b_c_d'  ✓");
console.log("ReplaceAll<'the cat...','the','a'> = 'a cat sat on a mat'  ✓");

// 运行时 replace
console.log("\\n运行时 replace:");
console.log("  'hello world'.replace:", "hello world".replace("world", "TypeScript"));
console.log("  'a-b-c-d'.split+join:", "a-b-c-d".split("-").join("_"));

console.log("\\n========== 6. 大小写转换：CamelCase / SnakeCase ==========");

// SnakeCase to CamelCase
type SnakeToCamel<S extends string> =
  S extends \`\${infer Head}_\${infer Letter}\${infer Tail}\`
  ? \`\${Head}\${Uppercase<Letter>}\${SnakeToCamel<Tail>}\`
  : S;

type Camel1 = SnakeToCamel<"user_name">;           // "userName"
type Camel2 = SnakeToCamel<"first_name">;          // "firstName"
type Camel3 = SnakeToCamel<"created_at">;          // "createdAt"
type Camel4 = SnakeToCamel<"some_long_field_name">; // "someLongFieldName"
const _test6a: Camel1 = "userName";
const _test6b: Camel2 = "firstName";
const _test6c: Camel3 = "createdAt";
const _test6d: Camel4 = "someLongFieldName";
console.log("SnakeToCamel<'user_name'> = 'userName'  ✓");
console.log("SnakeToCamel<'first_name'> = 'firstName'  ✓");
console.log("SnakeToCamel<'created_at'> = 'createdAt'  ✓");
console.log("SnakeToCamel<'some_long_field_name'> = 'someLongFieldName'  ✓");

// CamelCase to SnakeCase（逐字符处理 + 累加器）
type CamelToSnake<S extends string, Acc extends string = ""> =
  S extends \`\${infer C}\${infer Rest}\`
  ? C extends Uppercase<C>
    ? C extends Lowercase<C>  // 非字母字符（大写=小写，如数字、标点）
      ? CamelToSnake<Rest, \`\${Acc}\${C}\`>
      : CamelToSnake<Rest, \`\${Acc}_\${Lowercase<C>}\`>
    : CamelToSnake<Rest, \`\${Acc}\${C}\`>
  : UncapitalizeSnake<Acc>;

// 处理可能的首下划线
type UncapitalizeSnake<S extends string> =
  S extends \`_\${infer T}\` ? T : S;

type Snake1 = CamelToSnake<"userName">;      // "user_name"
type Snake2 = CamelToSnake<"firstName">;     // "first_name"
type Snake3 = CamelToSnake<"createdAt">;     // "created_at"
const _test6e: Snake1 = "user_name";
const _test6f: Snake2 = "first_name";
const _test6g: Snake3 = "created_at";
console.log("CamelToSnake<'userName'> = 'user_name'  ✓");
console.log("CamelToSnake<'firstName'> = 'first_name'  ✓");
console.log("CamelToSnake<'createdAt'> = 'created_at'  ✓");

// kebab-case 转 CamelCase
type KebabToCamel<S extends string> =
  S extends \`\${infer Head}-\${infer Letter}\${infer Tail}\`
  ? \`\${Head}\${Uppercase<Letter>}\${KebabToCamel<Tail>}\`
  : S;

type KebabResult = KebabToCamel<"font-size">;     // "fontSize"
type KebabResult2 = KebabToCamel<"background-color">; // "backgroundColor"
const _test6h: KebabResult = "fontSize";
const _test6i: KebabResult2 = "backgroundColor";
console.log("KebabToCamel<'font-size'> = 'fontSize'  ✓");
console.log("KebabToCamel<'background-color'> = 'backgroundColor'  ✓");

// 运行时转换函数
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
}
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

console.log("\\n运行时大小写转换:");
console.log("  snakeToCamel('user_name'):", snakeToCamel("user_name"));
console.log("  camelToSnake('userName'):", camelToSnake("userName"));
console.log("  kebabToCamel('font-size'):", kebabToCamel("font-size"));

console.log("\\n========== 7. StringToUnion & StringLength ==========");

// StringToUnion：字符串转字符联合类型
type StringToUnion<S extends string> =
  S extends \`\${infer C}\${infer Rest}\`
  ? C | StringToUnion<Rest>
  : never;

type Chars1 = StringToUnion<"abc">;   // "a" | "b" | "c"
type Chars2 = StringToUnion<"hello">; // "h" | "e" | "l" | "o"
const _test7a: Chars1 = "a";
const _test7b: Chars1 = "b";
const _test7c: Chars2 = "h";
console.log("StringToUnion<'abc'> = 'a'|'b'|'c'  ✓");
console.log("StringToUnion<'hello'> = 'h'|'e'|'l'|'o'  ✓");

// 运行时字符串处理
console.log("\\n运行时字符:");
console.log("  'abc' 字符:", "abc".split(""));
console.log("  'hello' 字符:", "hello".split(""));

console.log("\\n========== 8. Trim：去除首尾空白 ==========");

type Whitespace = " " | "\\n" | "\\t" | "\\r";

type TrimLeft<S extends string> =
  S extends \`\${Whitespace}\${infer Rest}\` ? TrimLeft<Rest> : S;

type TrimRight<S extends string> =
  S extends \`\${infer Rest}\${Whitespace}\` ? TrimRight<Rest> : S;

type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type Trimmed1 = Trim<"  hello  ">;         // "hello"
type Trimmed2 = Trim<"\\n\\thello world\\r\\n">; // "hello world"
type Trimmed3 = Trim<"no-whitespace">;     // "no-whitespace"
const _test8a: Trimmed1 = "hello";
const _test8b: Trimmed3 = "no-whitespace";
console.log("Trim<'  hello  '> = 'hello'  ✓");
console.log("Trim<'no-whitespace'> = 'no-whitespace'  ✓");

// 运行时 trim
console.log("\\n运行时 trim:");
console.log("  '  hello  '.trim():", "  hello  ".trim());
console.log("  '\\thello\\n'.trim():", "\\thello\\n".trim());

console.log("\\n========== 9. 实战：类型安全的路由系统 ==========");

// 从路由模式中提取 :param 参数名
type ExtractRouteParams<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
  ? Param | ExtractRouteParams<\`/\${Rest}\`>
  : Path extends \`\${string}:\${infer Param}\`
  ? Param
  : never;

// 为路由生成参数对象类型
type RouteParamsObj<Path extends string> = {
  [K in ExtractRouteParams<Path>]: string;
};

type UserPostParams = RouteParamsObj<"/users/:id/posts/:postId">;
// { id: string; postId: string }
type UserParams = RouteParamsObj<"/api/users/:userId">;
// { userId: string }
type NoParams = RouteParamsObj<"/api/users">;
// never（空对象）

const _test9a: UserPostParams = { id: "123", postId: "456" };
const _test9b: UserParams = { userId: "789" };
console.log("RouteParamsObj<'/users/:id/posts/:postId'> = { id, postId }  ✓");
console.log("RouteParamsObj<'/api/users/:userId'> = { userId }  ✓");

// 类型安全的路由构建函数
function buildRoute<Path extends string>(
  path: Path,
  params: RouteParamsObj<Path>
): string {
  let result = path as string;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(":" + key, value);
  }
  return result;
}

// 运行时路由构建（类型安全！）
const url1 = buildRoute("/users/:id/posts/:postId", { id: "123", postId: "456" });
const url2 = buildRoute("/api/users/:userId", { userId: "789" });
console.log("\\n运行时路由构建:");
console.log("  URL1:", url1);
console.log("  URL2:", url2);

console.log("\\n========== 10. 综合实战：深度对象键转换 ==========");

// 递归地将对象的所有键从 snake_case 转为 camelCase
type CamelCaseKeys<T> = T extends any[]
  ? { [K in keyof T]: CamelCaseKeys<T[K]> }
  : T extends object
  ? { [K in keyof T as SnakeToCamel<K & string>]: CamelCaseKeys<T[K]> }
  : T;

interface SnakeUser {
  user_id: number;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  contact_info: {
    email_address: string;
    phone_number: string;
  };
}

type CamelUser = CamelCaseKeys<SnakeUser>;
// {
//   userId: number;
//   firstName: string;
//   lastName: string;
//   isActive: boolean;
//   createdAt: string;
//   contactInfo: {
//     emailAddress: string;
//     phoneNumber: string;
//   };
// }

const _test10: CamelUser = {
  userId: 1,
  firstName: "张",
  lastName: "三",
  isActive: true,
  createdAt: "2025-01-01",
  contactInfo: {
    emailAddress: "zhang@example.com",
    phoneNumber: "13800138000",
  },
};
console.log("CamelCaseKeys<SnakeUser> — 递归转换所有键为 camelCase  ✓");
console.log("结果:", JSON.stringify(_test10, null, 2));

// 运行时键转换
function camelCaseKeys<T extends Record<string, any>>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = camelCaseKeys(value);
    }
    return result;
  }
  return obj;
}

const snakeData: SnakeUser = {
  user_id: 1,
  first_name: "张",
  last_name: "三",
  is_active: true,
  created_at: "2025-01-01",
  contact_info: {
    email_address: "zhang@example.com",
    phone_number: "13800138000",
  },
};
console.log("\\n运行时 camelCaseKeys 结果:", JSON.stringify(camelCaseKeys(snakeData), null, 2));

console.log("\\n字符串类型魔法演示完成！");`,
  },

  // =========================================================
  // 第三章：类型级数学运算
  // =========================================================
  {
    id: "ts3-number-arithmetic",
    title: "类型级数学运算",
    icon: "🔢",
    group: "类型体操深入",
    content: `## 类型级数学运算

### 为什么要在类型层面做数学？

看到这个标题，你可能会问："为什么要在类型系统里做数学运算？运行时的 JavaScript 不是已经有完整的算术能力了吗？"这是一个完全合理的问题。类型级数学运算的价值不在于替代运行时计算，而在于：

1. **表示类型层面的数量关系**：比如"一个至少有3个元素的元组"、"字符串长度不超过255"。
2. **构建更强大的类型工具**：很多高级类型技巧（如 Currying、Pipe、LRU 缓存类型）都需要类型级数字作为基础。
3. **验证数组和元组的长度约束**：在类型层面确保函数参数的数量正确。
4. **纯粹的智力挑战**：类型体操的很多乐趣来自于用不直观的方式解决问题。

类型级数学的核心技巧是**元组长度编码**（Tuple Length Encoding）。因为 TypeScript 类型系统没有原生的数字运算能力，但元组的 \`length\` 属性是一个数字字面量类型。通过构建和操作元组，我们可以间接实现数字运算。

### 基础：构建指定长度的元组

一切类型级数字运算的基础是能够构建一个长度为 N 的元组。我们在第一章已经见过 \`BuildTuple\` 的基本实现：

\`\`\`ts
type BuildTuple<N extends number, T extends any[] = []> =
  T["length"] extends N
  ? T
  : BuildTuple<N, [...T, any]>;
\`\`\`

这个类型通过递归地向元组添加 \`any\` 元素，直到元组长度等于 N。例如 \`BuildTuple<3>\` 产生 \`[any, any, any]\`，其 \`length\` 类型是字面量 \`3\`。

需要注意的是，TypeScript 对递归深度有默认限制（通常是 50 层左右），所以这种方式在数字较大时会报错。但对于类型体操的大多数场景（数字通常不超过 50），这已经足够。

### 加法：元组拼接

加法的实现非常直观——把两个元组合并，然后取长度：

\`\`\`ts
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];

type Sum = Add<3, 5>;  // 8
\`\`\`

这里利用了 TypeScript 的展开运算符（variadic tuple types），可以在类型层面合并两个元组。

### 减法：元组解构

减法稍微复杂一点。我们可以通过同时"消耗"两个元组来实现：

\`\`\`ts
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
  ? Rest["length"]
  : never;

type Diff = Subtract<5, 3>;  // 2
\`\`\`

原理：如果从长度为 A 的元组中"减去"长度为 B 的前缀，剩余部分（Rest）的长度就是 A - B。当 B > A 时，无法匹配，返回 never。

### 乘法：重复加法

乘法可以理解为"多次加法"——A × B 等于把 B 累加 A 次：

\`\`\`ts
type Multiply<A extends number, B extends number, Acc extends any[] = []> =
  A extends 0
  ? Acc["length"]
  : Multiply<Subtract<A, 1>, B, [...Acc, ...BuildTuple<B>]>;

type Product = Multiply<3, 4>;  // 12
\`\`\`

这里使用了累加器模式：Acc 累积结果元组，每次递归把 B 个元素加入 Acc，同时 A 减 1，直到 A 为 0。

### 比较运算：GreaterThan / LessThan

比较两个数字的大小，可以利用元组的"前缀匹配"特性：

\`\`\`ts
type GreaterThan<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, any, ...any[]]
  ? true
  : false;

type GT1 = GreaterThan<5, 3>;  // true
type GT2 = GreaterThan<2, 7>;  // false
\`\`\`

原理：如果长度为 A 的元组在匹配长度为 B 的前缀之后，至少还有一个元素（\`any\`），则说明 A > B。

同理，可以实现小于、大于等于、小于等于：

\`\`\`ts
type LessThan<A extends number, B extends number> = GreaterThan<B, A>;
type GreaterOrEqual<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...any[]] ? true : false;
\`\`\`

### 斐波那契数列：类型级递归

斐波那契数列是递归的经典案例。在类型层面实现它，需要同时跟踪前两个数：

\`\`\`ts
type Fibonacci<
  N extends number,
  Prev extends any[] = [],    // F(n-1)
  Curr extends any[] = [any], // F(n)
  Count extends any[] = [any] // 当前计数（从1开始）
> = Count["length"] extends N
  ? Curr["length"]
  : Fibonacci<N, Curr, [...Prev, ...Curr], [...Count, any]>;

type Fib5 = Fibonacci<5>;   // 5
type Fib10 = Fibonacci<10>; // 55
\`\`\`

类型参数说明：
- \`Prev\`：前一个斐波那契数对应的元组
- \`Curr\`：当前斐波那契数对应的元组
- \`Count\`：当前计算到第几个数

递推关系：F(n) = F(n-1) + F(n-2)，在类型层面就是 [...Prev, ...Curr]。

### Range：生成数字范围类型

Range 类型可以生成从 Min 到 Max（不含 Max）的所有数字字面量的联合类型：

\`\`\`ts
type Range<
  Min extends number,
  Max extends number,
  Acc extends number[] = []
> = Min extends Max
  ? Acc[number]
  : Range<Add<Min, 1>, Max, [...Acc, Min]>;

type ZeroToFive = Range<0, 6>;  // 0 | 1 | 2 | 3 | 4 | 5
\`\`\`

这个类型在定义"有限数字"时非常有用，比如"HTTP 状态码"、"月份"、"日期"等。

### 数字字面量运算的实践意义

虽然类型级数学看起来像是"学术游戏"，但它在实际开发中确实有重要应用：

1. **函数参数数量验证**：确保柯里化函数的参数总数正确。
2. **数组长度约束**：\`type NonEmptyArray<T> = [T, ...T[]]\` 确保数组至少有一个元素。
3. **类型安全的数学表达式**：在 DSL（领域特定语言）中确保表达式的维度正确。
4. **构建更复杂的类型**：很多高级类型（如 Curry、Pipe、InclusiveRange）都建立在类型级数字的基础上。

### 递归深度问题与优化

TypeScript 对类型实例化的深度有限制（TypeScript 4.5+ 中类型递归深度限制约为 1000）。对于简单的类型运算这通常足够，但如果你的类型运算链路过长，可能会遇到"Type instantiation is excessively deep and possibly infinite"错误。

优化策略：
1. 使用尾递归形式（累加器模式），TypeScript 对尾递归有更好的优化。
2. 避免在一个类型中做太多嵌套运算。
3. 对于大数运算，考虑使用二进制编码而非一元编码（更复杂但更高效）。

### 实战：类型安全的 Curry 类型

类型级数学的一个重要应用是柯里化（Currying）函数的类型。一个柯里化的 n 元函数，其类型需要追踪已经接收了多少个参数：

\`\`\`ts
type Curry<F extends (...args: any[]) => any> =
  <T extends any[]>(...args: T) =>
    T["length"] extends Parameters<F>["length"]
    ? ReturnType<F>
    : Curry<(...args: DropFirst<Parameters<F>, T["length"]>) => ReturnType<F>>;
\`\`\`

其中 \`DropFirst\` 需要从元组中移除前 N 个元素，这也依赖于类型级数字。

下面的代码将演示所有这些类型级数学运算，并通过运行时值验证结果。虽然类型运算在编译后擦除，但我们可以用"类型断言赋值"模式来确认每个类型计算的正确性。`,
    code: `// ============================================================
// 第三章代码演示：类型级数学运算
// ============================================================

console.log("========== 1. 基础：BuildTuple ==========");

// BuildTuple：构建长度为 N 的元组
type BuildTuple<N extends number, T extends any[] = []> =
  T["length"] extends N ? T : BuildTuple<N, [...T, any]>;

type Tuple0 = BuildTuple<0>;   // []
type Tuple1 = BuildTuple<1>;   // [any]
type Tuple3 = BuildTuple<3>;   // [any, any, any]
type Tuple5 = BuildTuple<5>;   // [any, any, any, any, any]

const _test1a: Tuple0["length"] = 0;
const _test1b: Tuple1["length"] = 1;
const _test1c: Tuple3["length"] = 3;
const _test1d: Tuple5["length"] = 5;
console.log("BuildTuple<0> 长度 = 0  ✓");
console.log("BuildTuple<1> 长度 = 1  ✓");
console.log("BuildTuple<3> 长度 = 3  ✓");
console.log("BuildTuple<5> 长度 = 5  ✓");

// 运行时：创建指定长度的数组
function buildArray(n: number, fillValue: any = null): any[] {
  return Array(n).fill(fillValue);
}
console.log("\\n运行时 buildArray:");
console.log("  长度为3的数组:", buildArray(3, 0));
console.log("  长度为5的数组:", buildArray(5, "x"));

console.log("\\n========== 2. 加法 Add ==========");

// 加法：合并两个元组，取长度
type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"] & number;

type Sum2_3 = Add<2, 3>;    // 5
type Sum0_5 = Add<0, 5>;    // 5
type Sum4_6 = Add<4, 6>;    // 10
type Sum7_8 = Add<7, 8>;    // 15
const _test2a: Sum2_3 = 5;
const _test2b: Sum0_5 = 5;
const _test2c: Sum4_6 = 10;
const _test2d: Sum7_8 = 15;
console.log("Add<2, 3> =", 5, " ✓");
console.log("Add<0, 5> =", 5, " ✓");
console.log("Add<4, 6> =", 10, " ✓");
console.log("Add<7, 8> =", 15, " ✓");

// 运行时加法
console.log("\\n运行时加法:");
console.log("  2 + 3 =", 2 + 3);
console.log("  4 + 6 =", 4 + 6);

console.log("\\n========== 3. 减法 Subtract ==========");

// 减法：从 A 元组中去掉 B 元组长度的前缀
type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
  ? Rest["length"]
  : never;

type Diff5_3 = Subtract<5, 3>;   // 2
type Diff10_4 = Subtract<10, 4>; // 6
type Diff7_0 = Subtract<7, 0>;   // 7
const _test3a: Diff5_3 = 2;
const _test3b: Diff10_4 = 6;
const _test3c: Diff7_0 = 7;
console.log("Subtract<5, 3> =", 2, " ✓");
console.log("Subtract<10, 4> =", 6, " ✓");
console.log("Subtract<7, 0> =", 7, " ✓");

// 运行时减法
console.log("\\n运行时减法:");
console.log("  5 - 3 =", 5 - 3);
console.log("  10 - 4 =", 10 - 4);

console.log("\\n========== 4. 乘法 Multiply ==========");

// 乘法：累加器模式，每次加 B，共加 A 次
type Multiply<A extends number, B extends number, Acc extends any[] = []> =
  A extends 0
  ? Acc["length"]
  : Multiply<Subtract<A, 1> & number, B, [...Acc, ...BuildTuple<B>]>;

type Mul2_3 = Multiply<2, 3>;   // 6
type Mul4_5 = Multiply<4, 5>;   // 20
type Mul3_7 = Multiply<3, 7>;   // 21
type Mul0_5 = Multiply<0, 5>;   // 0
const _test4a: Mul2_3 = 6;
const _test4b: Mul4_5 = 20;
const _test4c: Mul3_7 = 21;
const _test4d: Mul0_5 = 0;
console.log("Multiply<2, 3> =", 6, " ✓");
console.log("Multiply<4, 5> =", 20, " ✓");
console.log("Multiply<3, 7> =", 21, " ✓");
console.log("Multiply<0, 5> =", 0, " ✓");

// 运行时乘法
console.log("\\n运行时乘法:");
console.log("  2 * 3 =", 2 * 3);
console.log("  4 * 5 =", 4 * 5);

console.log("\\n========== 5. 比较运算 ==========");

// GreaterThan：A > B ?
// 原理：BuildTuple<A> 如果能匹配 [...BuildTuple<B>, any, ...any[]]
//       说明去掉 B 的长度后还有至少一个元素，即 A > B
type GreaterThan<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, infer _First, ...any[]]
  ? true
  : false;

type GT1 = GreaterThan<5, 3>;   // true
type GT2 = GreaterThan<2, 7>;   // false
type GT3 = GreaterThan<4, 4>;   // false
const _test5a: GT1 = true;
const _test5b: GT2 = false;
const _test5c: GT3 = false;
console.log("GreaterThan<5, 3> = true   ✓");
console.log("GreaterThan<2, 7> = false  ✓");
console.log("GreaterThan<4, 4> = false  ✓");

// LessThan：A < B
type LessThan<A extends number, B extends number> = GreaterThan<B, A>;

type LT1 = LessThan<3, 5>;   // true
type LT2 = LessThan<7, 2>;   // false
const _test5d: LT1 = true;
const _test5e: LT2 = false;
console.log("LessThan<3, 5> = true   ✓");
console.log("LessThan<7, 2> = false  ✓");

// GreaterOrEqual：A >= B
type GreaterOrEqual<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...any[]] ? true : false;

type GE1 = GreaterOrEqual<5, 3>;   // true
type GE2 = GreaterOrEqual<4, 4>;   // true
type GE3 = GreaterOrEqual<2, 7>;   // false
const _test5f: GE1 = true;
const _test5g: GE2 = true;
const _test5h: GE3 = false;
console.log("GreaterOrEqual<5, 3> = true   ✓");
console.log("GreaterOrEqual<4, 4> = true   ✓");
console.log("GreaterOrEqual<2, 7> = false  ✓");

// 运行时比较
console.log("\\n运行时比较:");
console.log("  5 > 3:", 5 > 3);
console.log("  4 >= 4:", 4 >= 4);
console.log("  2 < 7:", 2 < 7);

console.log("\\n========== 6. 斐波那契数列 Fibonacci ==========");

// Fibonacci：尾递归实现
// Prev = F(n-2) 的元组, Curr = F(n-1) 的元组, Count = 当前计算到第几个
type Fibonacci<
  N extends number,
  Prev extends any[] = [],
  Curr extends any[] = [any],
  Count extends any[] = [any]
> = Count["length"] extends N
  ? Curr["length"]
  : Fibonacci<N, Curr, [...Prev, ...Curr], [...Count, any]>;

type Fib1 = Fibonacci<1>;   // 1
type Fib2 = Fibonacci<2>;   // 1
type Fib3 = Fibonacci<3>;   // 2
type Fib5 = Fibonacci<5>;   // 5
type Fib8 = Fibonacci<8>;   // 21
type Fib10 = Fibonacci<10>; // 55
const _test6a: Fib1 = 1;
const _test6b: Fib2 = 1;
const _test6c: Fib3 = 2;
const _test6d: Fib5 = 5;
const _test6e: Fib8 = 21;
const _test6f: Fib10 = 55;
console.log("Fibonacci<1> =", 1, "  ✓");
console.log("Fibonacci<2> =", 1, "  ✓");
console.log("Fibonacci<3> =", 2, "  ✓");
console.log("Fibonacci<5> =", 5, "  ✓");
console.log("Fibonacci<8> =", 21, " ✓");
console.log("Fibonacci<10> =", 55, " ✓");

// 运行时斐波那契
function fibonacci(n: number): number {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

console.log("\\n运行时斐波那契数列(前10项):");
const fibResults: number[] = [];
for (let i = 1; i <= 10; i++) {
  fibResults.push(fibonacci(i));
}
console.log(" ", fibResults.join(", "));

console.log("\\n========== 7. Range：数字范围类型 ==========");

// Range：生成 [Min, Max) 范围内所有数字的联合类型
type Range<
  Min extends number,
  Max extends number,
  Acc extends number[] = []
> = Min extends Max
  ? Acc[number]
  : Range<Add<Min, 1> & number, Max, [...Acc, Min]>;

type ZeroToFive = Range<0, 6>;    // 0 | 1 | 2 | 3 | 4 | 5
type OneToTen = Range<1, 11>;     // 1 | 2 | ... | 10
type Month = Range<1, 13>;        // 1-12 月份
type HttpError = Range<400, 600>; // 400-599 HTTP 错误码

const _test7a: ZeroToFive = 3;
const _test7b: OneToTen = 7;
const _test7c: Month = 12;
const _test7d: HttpError = 404;
console.log("Range<0, 6> = 0|1|2|3|4|5  ✓");
console.log("Range<1, 11> = 1~10  ✓");
console.log("Range<1, 13> = 1~12(月份)  ✓");
console.log("Range<400, 600> = HTTP 错误码  ✓");

// InclusiveRange：包含两端
type InclusiveRange<Min extends number, Max extends number> = Range<Min, Add<Max, 1> & number>;
type OneToFiveInc = InclusiveRange<1, 5>;  // 1 | 2 | 3 | 4 | 5
const _test7e: OneToFiveInc = 5;
console.log("InclusiveRange<1, 5> = 1|2|3|4|5  ✓");

// 运行时 range
function range(min: number, max: number): number[] {
  const result: number[] = [];
  for (let i = min; i < max; i++) {
    result.push(i);
  }
  return result;
}
console.log("\\n运行时 range:");
console.log("  range(0, 6):", range(0, 6));
console.log("  range(1, 11):", range(1, 11));

console.log("\\n========== 8. 数字运算工具：除法与取模 ==========");

// 整数除法（整除）：A 里包含多少个 B
type Divide<
  A extends number,
  B extends number,
  Count extends any[] = []
> = B extends 0
  ? never
  : BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
  ? Divide<Rest["length"] & number, B, [...Count, any]>
  : Count["length"];

type Div10_3 = Divide<10, 3>;  // 3（10/3 整除得3）
type Div8_2 = Divide<8, 2>;    // 4
type Div7_7 = Divide<7, 7>;    // 1
const _test8a: Div10_3 = 3;
const _test8b: Div8_2 = 4;
const _test8c: Div7_7 = 1;
console.log("Divide<10, 3> =", 3, "（整除）✓");
console.log("Divide<8, 2> =", 4, " ✓");
console.log("Divide<7, 7> =", 1, " ✓");

// 取模 Modulo
type Modulo<A extends number, B extends number> =
  B extends 0
  ? never
  : BuildTuple<A> extends [...BuildTuple<B>, ...infer Rest]
  ? Modulo<Rest["length"] & number, B>
  : A;

type Mod10_3 = Modulo<10, 3>;  // 1（10%3=1）
type Mod8_2 = Modulo<8, 2>;    // 0
type Mod7_5 = Modulo<7, 5>;    // 2
const _test8d: Mod10_3 = 1;
const _test8e: Mod8_2 = 0;
const _test8f: Mod7_5 = 2;
console.log("Modulo<10, 3> =", 1, " ✓");
console.log("Modulo<8, 2> =", 0, " ✓");
console.log("Modulo<7, 5> =", 2, " ✓");

// 运行时整除和取模
console.log("\\n运行时整除/取模:");
console.log("  Math.floor(10/3) =", Math.floor(10 / 3), " 10%3 =", 10 % 3);
console.log("  Math.floor(8/2) =", Math.floor(8 / 2), "  8%2 =", 8 % 2);

console.log("\\n========== 9. 实战：元组操作类型 ==========");

// DropFirst：从元组中移除前 N 个元素
type DropFirst<T extends any[], N extends number> =
  N extends 0
  ? T
  : T extends [any, ...infer Rest]
  ? DropFirst<Rest, Subtract<N, 1> & number>
  : [];

type Dropped2 = DropFirst<[1, 2, 3, 4, 5], 2>;  // [3, 4, 5]
type Dropped0 = DropFirst<["a", "b", "c"], 0>;  // ["a", "b", "c"]
const _test9a: Dropped2 = [3, 4, 5];
const _test9b: Dropped0 = ["a", "b", "c"];
console.log("DropFirst<[1,2,3,4,5], 2> = [3,4,5]  ✓");

// Take：取元组前 N 个元素
type Take<T extends any[], N extends number, Acc extends any[] = []> =
  N extends 0
  ? Acc
  : T extends [infer First, ...infer Rest]
  ? Take<Rest, Subtract<N, 1> & number, [...Acc, First]>
  : Acc;

type Taken3 = Take<[1, 2, 3, 4, 5], 3>;  // [1, 2, 3]
const _test9c: Taken3 = [1, 2, 3];
console.log("Take<[1,2,3,4,5], 3> = [1,2,3]  ✓");

// NonEmptyArray：至少有一个元素的数组
type NonEmptyArray<T> = [T, ...T[]];
function first<T>(arr: NonEmptyArray<T>): T {
  return arr[0];
}
const _test9d = first([1, 2, 3]);
// first([]) 会报类型错误！
console.log("NonEmptyArray<T> 确保数组非空  ✓");

// FixedLengthArray：固定长度的数组
type FixedLengthArray<T, N extends number> =
  N extends N
  ? number extends N
  ? T[]
  : BuildTuple<N> extends any[]
  ? { [K in keyof BuildTuple<N>]: T }
  : never
  : never;

type Triple<T> = FixedLengthArray<T, 3>;
const triple: Triple<number> = [1, 2, 3];
console.log("FixedLengthArray<T, 3> = [T, T, T]  ✓");

// 运行时数组操作
function dropFirst<T>(arr: T[], n: number): T[] {
  return arr.slice(n);
}
function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}
console.log("\\n运行时数组操作:");
console.log("  dropFirst([1,2,3,4,5], 2):", dropFirst([1, 2, 3, 4, 5], 2));
console.log("  take([1,2,3,4,5], 3):", take([1, 2, 3, 4, 5], 3));

console.log("\\n========== 10. 实战：类型安全的 Add 函数 ==========");

// 使用类型级数字确保参数在范围内
type DiceValue = Range<1, 7>;  // 1-6

function rollDice(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

function addDice(a: DiceValue, b: DiceValue): number {
  return a + b;
}

const dice1 = rollDice();
const dice2 = rollDice();
console.log("骰子1:", dice1);
console.log("骰子2:", dice2);
console.log("骰子和:", addDice(dice1, dice2));

// 类型安全的 Repeat：构造重复 N 次的元组
function repeat<T, N extends number>(value: T, count: N): BuildTuple<N> & T[] {
  return Array(count).fill(value) as any;
}

const threeHellos = repeat("hello", 3);
console.log("\\nrepeat('hello', 3):", threeHellos);
console.log("长度:", threeHellos.length);

console.log("\\n类型级数学运算演示完成！");`,
  },

  // =========================================================
  // 第四章：高级类型模式
  // =========================================================
  {
    id: "ts3-advanced-patterns",
    title: "高级类型模式",
    icon: "🎭",
    group: "类型体操深入",
    content: `## 高级类型模式

### 超越基础类型体操

掌握了条件类型、映射类型、递归和字符串/数字类型体操之后，我们来到了 TypeScript 类型系统的更深水区。本章将探讨一些真正将类型系统推向极限的高级模式：HKT（高等种类类型）模拟、类型类（Type Classes）、幻影类型（Phantom Types）、烙印类型（Branded Types）、型变（Variance）深度解析、以及柯里化/管道的类型推导。

这些模式大多源自函数式编程语言（如 Haskell、Scala），TypeScript 虽然没有原生支持这些概念，但通过类型系统的灵活表达力，我们可以模拟出它们的效果。理解这些模式不仅能让你写出更安全、更具表达力的代码，还能让你从更高的维度理解类型系统的本质。

### 烙印类型（Branded Types）： nominal typing 的模拟

TypeScript 使用结构化类型系统（structural typing）——只要两个类型的结构相同，它们就被认为是兼容的。这在大多数时候是方便的，但有时我们需要**名义类型**（nominal typing）：即使两个类型结构完全相同，也不应该互相赋值。

典型场景：\`UserId\`（字符串）和 \`OrderId\`（字符串）不应该混用。

**烙印类型**通过在类型中添加一个"不可能在运行时存在"的唯一标记来实现：

\`\`\`ts
type Brand<T, B> = T & { __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function createUserId(id: string): UserId {
  return id as UserId;
}
function createOrderId(id: string): OrderId {
  return id as OrderId;
}

const uid: UserId = createUserId("u1");
const oid: OrderId = createOrderId("o1");
// const bad: UserId = oid;  // ❌ 类型错误！
\`\`\`

\`__brand\` 属性在运行时不存在（我们只是用 \`as\` 断言），但在类型层面它创造了不兼容的"品牌"。更精细的实现可以使用 symbol 作为品牌键，确保绝对不会与真实属性冲突。

### 幻影类型（Phantom Types）：类型参数不出现于运行时

幻影类型是指那些在类型中声明但在运行时值中不存在的泛型参数。它们纯粹用于在类型层面携带额外的信息，以实现编译期的约束：

\`\`\`ts
// 货币单位作为幻影类型
type Currency = "USD" | "EUR" | "CNY";

interface Money<C extends Currency> {
  amount: number;
  // C 不在运行时结构中——它是幻影类型参数
}

function usd(amount: number): Money<"USD"> {
  return { amount };
}
function eur(amount: number): Money<"EUR"> {
  return { amount };
}

function add<C extends Currency>(a: Money<C>, b: Money<C>): Money<C> {
  return { amount: a.amount + b.amount };
}

const dollars = usd(100);
const euros = eur(100);
// add(dollars, euros);  // ❌ 类型错误：货币不同！
const sum = add(dollars, usd(50));  // ✅ 正确
\`\`\`

幻影类型的核心思想：**用不存储在运行时的类型参数来编码额外的不变量（invariants），让类型检查器在编译期强制遵守这些约束**。

### 型变（Variance）深度解析：协变、逆变、不变

型变是 TypeScript 中最容易被误解但又极其重要的概念之一。它描述了当类型之间存在子类型关系时，由它们构造的复杂类型（如函数、数组、泛型）之间的子类型关系如何变化。

假设有两个类型 \`Dog extends Animal\`（Dog 是 Animal 的子类型）：

- **协变（Covariance）**：如果 \`Box<Dog> extends Box<Animal>\`，则 Box 在其类型参数上是协变的。数组、Promise、ReadonlyArray 都是协变的。
- **逆变（Contravariance）**：如果 \`Box<Animal> extends Box<Dog>\`（方向反转），则 Box 是逆变的。函数参数类型在严格模式下是逆变的。
- **不变（Invariant）**：如果两种关系都不成立，则 Box 是不变的。可变数组在技术上是不变的（但 TS 允许协变，存在类型安全隐患）。
- **双变（Bivariance）**：两种方向都成立。在 \`strictFunctionTypes\` 关闭时，函数参数是双变的。

函数的型变规则：
- **参数是逆变的**：\`(a: Animal) => void\` 可以赋值给 \`(a: Dog) => void\`，因为后一个函数只需要处理 Dog，而前一个能处理所有 Animal（包含 Dog）。
- **返回值是协变的**：\`() => Dog\` 可以赋值给 \`() => Animal\`，因为 Dog 是 Animal 的子类型。

理解型变对于编写正确的泛型类型至关重要。TypeScript 的 \`strictFunctionTypes\` 选项（strict 模式自动开启）会强制函数参数的逆变性，这是类型安全的重要保障。

### HKT（高等种类类型）模拟

在 Haskell 等函数式语言中，HKT（Higher-Kinded Types）允许你定义"接受类型构造器作为参数"的类型构造器。例如 \`Functor\`、\`Monad\` 等类型类都需要 HKT。

TypeScript 没有原生的 HKT 支持，但社区发展出了一种基于"种类编码"的模拟方式。核心思路是用一个接口来注册类型构造器：

\`\`\`ts
// HKT 编码
interface HKT<F, A> {
  _F: F;
  _A: A;
}

// 注册类型构造器
interface ArrayKind {
  kind: "Array";
}
// 这里用 URI 到类型的映射
interface Kind<URI, A> {
  Array: Array<A>;
}[URI];

// Functor 类型类
interface Functor<F> {
  map: <A, B>(f: (a: A) => B, fa: Kind<F, A>) => Kind<F, B>;
}

// Array 的 Functor 实现
const ArrayFunctor: Functor<"Array"> = {
  map: (f, arr) => arr.map(f),
};
\`\`\`

HKT 模拟在 TypeScript 中是一个高级话题，fp-ts 等函数式库大量使用了这种模式。虽然模拟的代码较为繁琐，但它使得在 TypeScript 中进行函数式编程成为可能。

### 类型类（Type Classes）模式

类型类是 Haskell 中的核心概念，是一种"特设多态"（ad-hoc polymorphism）机制。与 OOP 中的接口不同，类型类允许你为已存在的类型"后补"实现。

在 TypeScript 中模拟类型类的基本模式：

\`\`\`ts
// 类型类定义
interface Eq<T> {
  equals(a: T, b: T): boolean;
}

// 为具体类型实现类型类
const EqNumber: Eq<number> = {
  equals: (a, b) => a === b,
};

const EqString: Eq<string> = {
  equals: (a, b) => a === b;
};

// 使用类型类
function contains<T>(arr: T[], item: T, eq: Eq<T>): boolean {
  return arr.some((x) => eq.equals(x, item));
}
\`\`\`

类型类的优势在于：
1. 不需要修改原始类型的定义
2. 同一个类型可以有多个类型类实例（不同场景不同实现）
3. 可以自动推导（如为 \`Eq<A>\` 自动实现 \`Eq<A[]>\`）

### Currying 类型：柯里化函数类型

柯里化是将多参数函数转化为一系列单参数函数的过程。在类型层面实现柯里化的类型推导是一个经典挑战：

\`\`\`ts
type Curry<P extends any[], R> =
  P extends [infer First, ...infer Rest]
  ? Rest extends []
    ? (arg: First) => R
    : (arg: First) => Curry<Rest, R>
  : () => R;

type CurriedAdd = Curry<[a: number, b: number, c: number], number>;
// (a: number) => (b: number) => (c: number) => number
\`\`\`

支持可选参数、rest 参数和泛型推导的柯里化类型更为复杂，是高阶类型模式的经典练习。

### Pipe / Compose 类型：函数组合类型

\`pipe\`（从左到右）和 \`compose\`（从右到左）是函数式编程中的核心组合子。它们的类型需要保证"前一个函数的输出类型是后一个函数的输入类型"：

\`\`\`ts
function pipe<A, B>(a: A, f: (a: A) => B): B;
function pipe<A, B, C>(a: A, f: (a: A) => B, g: (b: B) => C): C;
function pipe<A, B, C, D>(a: A, f: (a: A) => B, g: (b: B) => C, h: (c: C) => D): D;
function pipe(value: any, ...fns: Array<(x: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}
\`\`\`

通过重载实现的 pipe 可以处理有限长度的函数链，每一步都正确推导类型。

### 本章小结

高级类型模式是 TypeScript 类型系统中最深奥也最具威力的部分。Branded Types 和 Phantom Types 让你能用类型编码业务不变量；Variance 帮助你理解子类型关系的传播；HKT 和 Type Classes 将函数式编程的强大模式带入 TypeScript；Curry 和 Pipe 的类型推导则展示了类型体操在实际函数式库中的应用。

掌握这些模式后，你将能够：
- 设计类型安全的领域模型，防止不同概念的类型混用
- 理解复杂库（如 fp-ts、effect-ts）的类型定义
- 编写具有极强类型推导能力的工具函数
- 以全新的视角看待类型系统的可能性

接下来的代码示例将逐一演示这些高级模式。`,
    code: `// ============================================================
// 第四章代码演示：高级类型模式
// ============================================================

console.log("========== 1. 烙印类型（Branded Types）==========");

// Brand 类型：给基础类型打上唯一的"品牌"标记
type Brand<T, B extends string> = T & { readonly __brand: B };

// 定义不同的 ID 类型（底层都是 string，但不兼容）
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type ProductId = Brand<string, "ProductId">;

// 工厂函数（推荐：确保只有通过工厂才能创建）
function UserId(id: string): UserId {
  return id as UserId;
}
function OrderId(id: string): OrderId {
  return id as OrderId;
}
function ProductId(id: string): ProductId {
  return id as ProductId;
}

// 使用烙印类型的函数
function getUser(id: UserId): { id: UserId; name: string } {
  return { id, name: "用户" + id };
}
function getOrder(id: OrderId): { id: OrderId; total: number } {
  return { id, total: 99.9 };
}

const uid = UserId("u-001");
const oid = OrderId("o-001");
const pid = ProductId("p-001");

const user = getUser(uid);
const order = getOrder(oid);
// getUser(oid);      // ❌ 类型错误！OrderId 不能赋值给 UserId
// getOrder(pid);    // ❌ 类型错误！

console.log("用户:", JSON.stringify(user));
console.log("订单:", JSON.stringify(order));
console.log("Branded Types 防止不同类型的 ID 混用  ✓");

// 更安全的品牌：使用 Symbol（防止结构冲突）
const UserIdBrand = Symbol("UserId");
type UserIdSafe = Brand<string, typeof UserIdBrand>;
// 这种方式确保 __brand 不会与其他属性意外冲突

// 数值品牌：PositiveNumber
type PositiveNumber = Brand<number, "PositiveNumber">;
function PositiveNumber(n: number): PositiveNumber {
  if (n <= 0) throw new Error("必须是正数");
  return n as PositiveNumber;
}
function sqrt(n: PositiveNumber): number {
  return Math.sqrt(n);
}
const positive = PositiveNumber(16);
console.log("sqrt(16):", sqrt(positive));
// sqrt(-1) 编译期和运行时都会阻止
console.log("PositiveNumber 确保参数为正  ✓");

console.log("\\n========== 2. 幻影类型（Phantom Types）==========");

// 货币类型作为幻影参数
type Currency = "USD" | "EUR" | "CNY" | "JPY";

interface Money<C extends Currency> {
  amount: number;
  // C 不在运行时数据中——它是幻影类型参数
}

// 工厂函数
function money<C extends Currency>(amount: number, currency: C): Money<C> {
  return { amount };
}

// 类型安全的加法：只能加相同货币
function addMoney<C extends Currency>(a: Money<C>, b: Money<C>): Money<C> {
  return { amount: a.amount + b.amount };
}

const usd100 = money(100, "USD");
const usd50 = money(50, "USD");
const eur100 = money(100, "EUR");
const cny200 = money(200, "CNY");

const usdTotal = addMoney(usd100, usd50);
// addMoney(usd100, eur100);  // ❌ 类型错误！货币不匹配
console.log("USD 总计:", usdTotal.amount, "USD");
console.log("EUR:", eur100.amount, "EUR");
console.log("CNY:", cny200.amount, "CNY");
console.log("幻影类型确保不同货币不能直接相加  ✓");

// 另一个幻影类型例子：排序方向
type SortOrder = "asc" | "desc";
interface SortedArray<T, O extends SortOrder> {
  items: T[];
}
function sortArray<T, O extends SortOrder>(arr: T[], order: O): SortedArray<T, O> {
  const sorted = [...arr].sort();
  if (order === "desc") sorted.reverse();
  return { items: sorted };
}
const ascSorted = sortArray([3, 1, 2], "asc");
const descSorted = sortArray([3, 1, 2], "desc");
// 编译期知道数据是按升序还是降序排列的
console.log("升序排列:", ascSorted.items);
console.log("降序排列:", descSorted.items);

console.log("\\n========== 3. 型变（Variance）：协变与逆变 ==========");

// 定义动物类型层级
class Animal {
  name: string;
  constructor(name: string) { this.name = name; }
}
class Dog extends Animal {
  bark() { return this.name + "汪汪"; }
}
class Cat extends Animal {
  meow() { return this.name + "喵喵"; }
}

// 协变（Covariance）：子类型关系保持方向
// Box<Dog> 可以赋值给 Box<Animal>
interface Producer<out T> {  // out 标记协变（TS 中用 readonly/属性位置模拟）
  get(): T;
}

const dogProducer: Producer<Dog> = {
  get: () => new Dog("旺财"),
};
const animalProducer: Producer<Animal> = dogProducer;
// Dog 是 Animal 的子类型，Producer<Dog> 是 Producer<Animal> 的子类型
const animal = animalProducer.get();
console.log("协变：Producer<Dog> -> Producer<Animal> ✓");
console.log("动物名:", animal.name);

// 逆变（Contravariance）：子类型关系反转
// Consumer<Animal> 可以赋值给 Consumer<Dog>
interface Consumer<in T> {  // in 标记逆变（函数参数位置）
  set(value: T): void;
}

const animalConsumer: Consumer<Animal> = {
  set: (a: Animal) => console.log("  消费动物:", a.name),
};
const dogConsumer: Consumer<Dog> = animalConsumer;
// Consumer<Animal> 可以赋值给 Consumer<Dog>（方向反转）
// 因为能处理任意动物的函数当然能处理狗
dogConsumer.set(new Dog("来福"));
console.log("逆变：Consumer<Animal> -> Consumer<Dog> ✓");

// 函数的型变规则演示
type Func<Arg, Ret> = (arg: Arg) => Ret;
// 参数逆变，返回值协变
const dogToAnimal: Func<Dog, Animal> = (dog: Dog) => dog;
// 这满足：参数 Dog 是... 等一下，让我们用例子说明
// 能接受 Animal 的函数可以赋值给接受 Dog 的变量吗？
type AnimalFunc = (a: Animal) => void;
type DogFunc = (d: Dog) => void;
// AnimalFunc 可以赋值给 DogFunc（参数逆变）
const feedAnimal: AnimalFunc = (a) => console.log("  喂:", a.name);
const feedDog: DogFunc = feedAnimal;  // ✅ 允许！因为 feedAnimal 能处理所有动物
feedDog(new Dog("旺财"));
console.log("函数参数逆变演示 ✓");

// 运行时验证
console.log("\\n运行时型变演示:");
console.log("  Dog instanceof Animal:", new Dog("x") instanceof Animal);
console.log("  Dog.prototype instanceof Animal:", Dog.prototype instanceof Animal);

console.log("\\n========== 4. 类型类（Type Classes）==========");

// Eq 类型类：相等性比较
interface Eq<T> {
  equals(a: T, b: T): boolean;
}

// 为不同类型实现 Eq
const EqNumber: Eq<number> = {
  equals: (a, b) => a === b,
};
const EqString: Eq<string> = {
  equals: (a, b) => a === b,
};
const EqBoolean: Eq<boolean> = {
  equals: (a, b) => a === b,
};

// 为数组派生 Eq（如果元素有 Eq，数组也有 Eq）
function makeEqArray<T>(eqT: Eq<T>): Eq<T[]> {
  return {
    equals: (a, b) =>
      a.length === b.length && a.every((v, i) => eqT.equals(v, b[i])),
  };
}

// 使用 Eq 类型类的泛型函数
function elem<T>(arr: T[], item: T, eq: Eq<T>): boolean {
  return arr.some((x) => eq.equals(x, item));
}
function unique<T>(arr: T[], eq: Eq<T>): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (!elem(result, item, eq)) result.push(item);
  }
  return result;
}

console.log("Eq 类型类演示:");
console.log("  5 == 5:", EqNumber.equals(5, 5));
console.log("  'hello' == 'world':", EqString.equals("hello", "world"));
console.log("  elem([1,2,3], 2):", elem([1, 2, 3], 2, EqNumber));

const EqNumArray = makeEqArray(EqNumber);
console.log("  [1,2,3] == [1,2,3]:", EqNumArray.equals([1, 2, 3], [1, 2, 3]));
console.log("  [1,2,3] == [1,2,4]:", EqNumArray.equals([1, 2, 3], [1, 2, 4]));

// Ord 类型类：可比较性
interface Ord<T> extends Eq<T> {
  compare(a: T, b: T): -1 | 0 | 1;
}

const OrdNumber: Ord<number> = {
  equals: EqNumber.equals,
  compare: (a, b) => (a < b ? -1 : a > b ? 1 : 0),
};
const OrdString: Ord<string> = {
  equals: EqString.equals,
  compare: (a, b) => (a < b ? -1 : a > b ? 1 : 0),
};

function sort<T>(arr: T[], ord: Ord<T>): T[] {
  return [...arr].sort((a, b) => ord.compare(a, b));
}
function max<T>(a: T, b: T, ord: Ord<T>): T {
  return ord.compare(a, b) >= 0 ? a : b;
}

console.log("\\nOrd 类型类演示:");
console.log("  sort([3,1,4,1,5]):", sort([3, 1, 4, 1, 5], OrdNumber));
console.log("  sort(['c','a','b']):", sort(["c", "a", "b"], OrdString));
console.log("  max(3, 7):", max(3, 7, OrdNumber));

console.log("\\n========== 5. Currying 类型：柯里化 ==========");

// Curry 类型：将多参数函数类型转为柯里化形式
type Curry<F extends (...args: any[]) => any> =
  F extends (...args: infer Args) => infer Ret
  ? Args extends [infer First, ...infer Rest]
  ? Rest extends []
  ? (arg: First) => Ret
  : (arg: First) => Curry<(...args: Rest) => Ret>
  : () => Ret
  : never;

// 柯里化函数
function curry<F extends (...args: any[]) => any>(fn: F): Curry<F> {
  const arity = fn.length;
  return function curried(...args: any[]): any {
    if (args.length >= arity) {
      return fn(...args);
    }
    return (...more: any[]) => curried(...args, ...more);
  } as Curry<F>;
}

// 三参数函数
function add3(a: number, b: number, c: number): number {
  return a + b + c;
}

const curriedAdd = curry(add3);
// 类型：(a: number) => (b: number) => (c: number) => number
const add1 = curriedAdd(1);       // (b: number) => (c: number) => number
const add1_2 = add1(2);           // (c: number) => number
const result = add1_2(3);         // 6
console.log("curry(add3)(1)(2)(3) =", result);

// 两参数函数
function multiply(a: number, b: number): number {
  return a * b;
}
const curriedMul = curry(multiply);
const double = curriedMul(2);
console.log("double(5):", double(5));
console.log("double(10):", double(10));

// 运行时验证
console.log("\\n运行时柯里化:");
const curriedResult = curry(add3)(10)(20)(30);
console.log("  curry(add3)(10)(20)(30) =", curriedResult);

console.log("\\n========== 6. Pipe 类型：函数管道 ==========");

// Pipe 的类型重载（支持2-4个函数的管道）
function pipe<A, B>(value: A, fn1: (a: A) => B): B;
function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): E;
function pipe(value: any, ...fns: Array<(x: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// Compose（从右到左）
function compose<A, B>(fn1: (a: A) => B): (a: A) => B;
function compose<A, B, C>(fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => C;
function compose<A, B, C, D>(fn3: (c: C) => D, fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => D;
function compose(...fns: Array<(...args: any[]) => any>): (...args: any[]) => any {
  return (...args: any[]) => {
    const reversed = [...fns].reverse();
    return pipe(args[0], ...reversed.slice(1));
  };
}

// 管道示例：字符串处理
const toUpper = (s: string) => s.toUpperCase();
const trim = (s: string) => s.trim();
const addExclaim = (s: string) => s + "!";
const length = (s: string) => s.length;

const result1 = pipe("  hello world  ", trim, toUpper, addExclaim);
console.log("pipe('  hello  ', trim, toUpper, addExclaim) =", result1);

const result2 = pipe("hello", toUpper, length);
console.log("pipe('hello', toUpper, length) =", result2);

// 数字管道
const square = (n: number) => n * n;
// 重命名为 add1b：上方柯里化演示已声明过 const add1，同作用域重复声明会报 SyntaxError
const add1b = (n: number) => n + 1;
const toString = (n: number) => "Result: " + n;

const numResult = pipe(3, square, add1b, square, toString);
console.log("pipe(3, square, add1b, square, toString) =", numResult);

// Compose 示例
const transform = compose(addExclaim, toUpper, trim);
console.log("compose(addExclaim, toUpper, trim)('  hi  ') =", transform("  hi  "));

console.log("\\n========== 7. HKT 模拟：Functor 演示 ==========");

// 简化版 HKT 编码（展示核心思想）
// Functor 接口：支持 map 的类型
interface FunctorInstance<F> {
  map<A, B>(f: (a: A) => B, fa: Container<F, A>): Container<F, B>;
}

// 使用具体类型而非 URI 映射（简化版，便于理解）
type Container<F, A> =
  F extends "Array" ? A[] :
  F extends "Maybe" ? { tag: "some"; value: A } | { tag: "none" } :
  never;

// Array Functor
const ArrayFunctor: FunctorInstance<"Array"> = {
  map: (f, arr) => arr.map(f),
};

// Maybe Functor
type Maybe<A> = { tag: "some"; value: A } | { tag: "none" };
function some<A>(value: A): Maybe<A> {
  return { tag: "some", value };
}
function none<A>(): Maybe<A> {
  return { tag: "none" };
}

const MaybeFunctor: FunctorInstance<"Maybe"> = {
  map: (f, ma) => ma.tag === "some" ? some(f(ma.value)) : none(),
};

// 使用 Functor
function incrementAll(cont: Container<"Array", number>): Container<"Array", number> {
  return ArrayFunctor.map((n) => n + 1, cont);
}

function incrementMaybe(cont: Maybe<number>): Maybe<number> {
  return MaybeFunctor.map((n) => n + 1, cont as Container<"Maybe", number>) as Maybe<number>;
}

console.log("ArrayFunctor.map(n => n+1, [1,2,3]):", incrementAll([1, 2, 3]));
console.log("MaybeFunctor.map(n => n+1, some(5)):", JSON.stringify(incrementMaybe(some(5))));
console.log("MaybeFunctor.map(n => n+1, none()):", JSON.stringify(incrementMaybe(none())));
console.log("HKT 模拟与 Functor 模式  ✓");

console.log("\\n========== 8. 综合实战：类型安全的表单验证 ==========");

// 使用 Branded Types + Phantom Types 构建类型安全的验证系统
type Validated<T, Brand extends string> = Brand<T, Brand>;
type ValidEmail = Validated<string, "ValidEmail">;
type ValidPhone = Validated<string, "ValidPhone">;
type ValidAge = Validated<number, "ValidAge">;

// 验证结果类型
type ValidationResult<T> =
  | { success: true; value: T }
  | { success: false; errors: string[] };

// 类型安全的验证器
function validateEmail(input: string): ValidationResult<ValidEmail> {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (emailRegex.test(input)) {
    return { success: true, value: input as ValidEmail };
  }
  return { success: false, errors: ["邮箱格式不正确"] };
}

function validatePhone(input: string): ValidationResult<ValidPhone> {
  const phoneRegex = /^1[3-9]\\d{9}$/;
  if (phoneRegex.test(input)) {
    return { success: true, value: input as ValidPhone };
  }
  return { success: false, errors: ["手机号格式不正确"] };
}

function validateAge(input: number): ValidationResult<ValidAge> {
  if (input >= 0 && input <= 150) {
    return { success: true, value: input as ValidAge };
  }
  return { success: false, errors: ["年龄必须在0-150之间"] };
}

// 只有通过验证的值才能传给需要 ValidXxx 类型的函数
function sendWelcomeEmail(email: ValidEmail): string {
  return "发送欢迎邮件到: " + email;
}
function sendSms(phone: ValidPhone, msg: string): string {
  return "发送短信到 " + phone + ": " + msg;
}
function canDrive(age: ValidAge): boolean {
  return age >= 18;
}

// 测试验证
const emailResult = validateEmail("zhang@example.com");
if (emailResult.success) {
  console.log(sendWelcomeEmail(emailResult.value));
}
const badEmail = validateEmail("invalid");
if (!badEmail.success) {
  console.log("邮箱验证失败:", badEmail.errors);
}

const phoneResult = validatePhone("13800138000");
if (phoneResult.success) {
  console.log(sendSms(phoneResult.value, "欢迎注册"));
}

const ageResult = validateAge(25);
if (ageResult.success) {
  console.log("年龄:", ageResult.value, ",可以开车:", canDrive(ageResult.value));
}

console.log("类型安全的表单验证：未验证的数据无法传给业务函数  ✓");

console.log("\\n高级类型模式演示完成！");`,
  },

  // =========================================================
  // 第五章：类型挑战实战
  // =========================================================
  {
    id: "ts3-challenges",
    title: "类型挑战实战",
    icon: "🏋️",
    group: "类型体操深入",
    content: `## 类型挑战实战

### 从理论到实战：解决真实的类型难题

学习了前面的类型体操技巧之后，现在是时候用它们来解决真实的类型挑战了。type-challenges 仓库（github.com/type-challenges/type-challenges）收集了大量从简单到极端困难的类型题目，是练习和检验类型体操能力的最佳资源。

本章精选了最具代表性的类型挑战题目，从 Get Required Keys 到 PathGetter，逐一实现并深入解析。每一道题都代表了一类重要的类型技巧模式。掌握这些题目，你就具备了应对绝大多数类型级编程问题的能力。

### Get Required Keys：获取必需属性键

题目：给定一个对象类型 T，获取其所有必需（非可选）属性的键组成的联合类型。

这道题的关键是利用**可选属性的特殊性质**：可选属性的值类型包含 \`undefined\`，但更可靠的方式是利用"可选属性在 extends 检查中的行为"：

\`\`\`ts
type GetRequired<T> = {
  [K in keyof T as T[K] extends { [P in K]: T[K] } ? K : never]: T[K]
};
// 或者使用更简洁的方式：判断 {} extends Pick<T, K>
type RequiredKeys<T> = keyof {
  [K in keyof T as {} extends Pick<T, K> ? never : K]: T[K]
};
\`\`\`

核心思路：如果一个属性 K 是可选的，那么 \`{}\`（空对象）可以赋值给 \`Pick<T, K>\`，因为 K 可以不存在。如果 K 是必需的，\`{}\` 不能赋值给 \`Pick<T, K>\`，因为缺少必需属性 K。

### Get Optional Keys：获取可选属性键

与 RequiredKeys 对称，获取所有可选属性的键：

\`\`\`ts
type OptionalKeys<T> = keyof {
  [K in keyof T as {} extends Pick<T, K> ? K : never]: T[K]
};
\`\`\`

逻辑与 RequiredKeys 相反：当 \`{} extends Pick<T, K>\` 成立时，K 是可选键。

### DeepPick：深度选择属性

\`Pick<T, K>\` 只能选择第一层属性。\`DeepPick\` 支持用点号路径选择嵌套属性，类似于 lodash 的 \`_.get\` 或 GraphQL 的查询字段：

\`\`\`ts
type DeepPick<T, Path extends string> =
  Path extends \`\${infer Key}.\${infer Rest}\`
  ? Key extends keyof T
  ? { [K in Key]: DeepPick<T[K], Rest> }
  : never
  : Path extends keyof T
  ? { [K in Path]: T[K] }
  : never;
\`\`\`

例如 \`DeepPick<{ a: { b: { c: number } } }, "a.b.c">\` 得到 \`{ a: { b: { c: number } } }\`。

### UnionToIntersection：联合转交叉

这是类型体操中最著名的题目之一。给定联合类型 A | B | C，将其转为交叉类型 A & B & C。

解题关键是利用**函数参数的逆变性**和**条件类型在逆变位置的分配行为**：

\`\`\`ts
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;
\`\`\`

原理解析：
1. \`U extends any ? (x: U) => void : never\`：将联合类型 U 的每个成员变为一个函数参数，得到函数类型的联合。
   例如 \`A | B\` 变为 \`((x: A) => void) | ((x: B) => void)\`。
2. 这个函数联合在 extends \`(x: infer I) => void\` 时，由于参数位置是逆变的，TypeScript 会推导出交叉类型 I = A & B。

这是类型体操中最巧妙的技巧之一，利用了逆变位置的类型推导行为来"合并"类型。

### Permutation：排列组合

给定一个联合类型，生成其所有元素排列的元组类型联合。例如 \`Permutation<'A'|'B'>\` 得到 \`['A','B'] | ['B','A']\`。

核心技巧是利用**条件类型分配律**和**递归分发**：

\`\`\`ts
type Permutation<T, C = T> =
  [T] extends [never]
  ? []
  : T extends any
  ? [T, ...Permutation<Exclude<C, T>>]
  : never;
\`\`\`

解析：
1. \`[T] extends [never]\` 是终止条件：当 T 是 never（所有元素已用完），返回空元组。这里用方括号阻止分配。
2. \`T extends any\` 利用条件类型的分配律，遍历联合 T 中的每个成员。
3. 对于每个成员 T，将其作为元组第一个元素，然后递归处理剩余元素（\`Exclude<C, T>\`）。
4. 额外的泛型参数 C 保持原始联合，因为 T 在每次分配时是单个成员。

### IsNever：判断类型是否为 never

看起来简单，实际上有陷阱。你可能会想写：

\`\`\`ts
// ❌ 错误！
type IsNeverWrong<T> = T extends never ? true : false;
// IsNeverWrong<never> 得到的是 never，不是 true！
\`\`\`

问题在于：当 T 是 never 时，条件类型直接返回 never（因为 never 是空联合，分配后没有成员）。正确做法是用元组阻止分配：

\`\`\`ts
type IsNever<T> = [T] extends [never] ? true : false;
\`\`\`

### IsUnion：判断类型是否为联合类型

如何判断一个类型是联合类型（如 \`A | B\`）而不是单一类型？核心思路：联合类型 \`T\` 与其自身的某些性质会产生"分裂"：

\`\`\`ts
type IsUnion<T, C = T> =
  T extends any
  ? [C] extends [T] ? false : true
  : never;
\`\`\`

原理：利用条件类型对联合的分配特性。当 T 是联合类型时，\`T extends any\` 会分配到每个成员上。对于每个成员 T（单独的），\`[C]\`（原始完整联合）不 extends \`[T]\`（单个成员），所以返回 true。当 T 不是联合类型时，\`[C] extends [T]\` 成立，返回 false。

### Trim：去除字符串首尾空白

我们在字符串章节已经见过 Trim。这里给出更完整的实现，包括去除多种空白字符：

\`\`\`ts
type Whitespace = " " | "\\n" | "\\t" | "\\r";
type TrimLeft<S extends string> = S extends \`\${Whitespace}\${infer R}\` ? TrimLeft<R> : S;
type TrimRight<S extends string> = S extends \`\${infer R}\${Whitespace}\` ? TrimRight<R> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;
\`\`\`

### Capitalize 实现

TypeScript 内置了 \`Capitalize<S>\`，但手动实现它是一个好练习：

\`\`\`ts
interface CapitalMap {
  a: "A"; b: "B"; c: "C"; d: "D"; e: "E"; f: "F"; g: "G"; h: "H";
  i: "I"; j: "J"; k: "K"; l: "L"; m: "M"; n: "N"; o: "O"; p: "P";
  q: "Q"; r: "R"; s: "S"; t: "T"; u: "U"; v: "V"; w: "W"; x: "X";
  y: "Y"; z: "Z";
}

type MyCapitalize<S extends string> =
  S extends \`\${infer C}\${infer Rest}\`
  ? C extends keyof CapitalMap ? \`\${CapitalMap[C]}\${Rest}\` : S
  : S;
\`\`\`

原理：匹配第一个字符，在映射表中查找其大写形式。这说明在类型层面也可以做"查表"操作。

### PathGetter：类型安全的 lodash get

\`_.get\` 是 lodash 中最常用的函数之一。我们可以在类型层面实现它的类型安全版本：给定对象 T 和点号路径 P，返回路径指向的值的类型。

\`\`\`ts
type PathGetter<T, P extends string> =
  P extends \`\${infer Key}.\${infer Rest}\`
  ? Key extends keyof T
  ? PathGetter<T[Key], Rest>
  : undefined
  : P extends keyof T
  ? T[P]
  : undefined;
\`\`\`

更完整的版本需要支持数组索引（\`"a.0.b"\`），这需要将数字字符串索引转换为 number 类型。

### 类型安全的查询构造器

最后一个综合实战：用类型体操构建一个类型安全的 SQL 查询构造器（类似 Prisma 或 Kysely 的查询 API）。通过类型系统确保：
1. 查询的表名存在于数据库 schema 中
2. SELECT 的字段属于该表
3. WHERE 条件中的字段名和值类型正确
4. 排序字段合法

\`\`\`ts
interface Database {
  users: {
    id: number;
    name: string;
    email: string;
    age: number;
  };
  posts: {
    id: number;
    title: string;
    content: string;
    author_id: number;
  };
}

type TableName = keyof Database;

type QueryBuilder<T extends TableName> = {
  select<K extends keyof Database[T]>(...fields: K[]): QueryBuilder<T>;
  where<K extends keyof Database[T]>(field: K, value: Database[T][K]): QueryBuilder<T>;
  orderBy<K extends keyof Database[T]>(field: K, dir: "asc" | "desc"): QueryBuilder<T>;
  execute(): void;
};
\`\`\`

这种类型安全的 API 让错误在编译期就被捕获，而不是等到运行时 SQL 报错。

### 挑战题的解题方法论

通过本章的所有题目，我们可以总结出类型挑战的通用解题思路：

1. **识别输入输出**：明确泛型参数是什么，期望返回什么类型。
2. **寻找模式匹配点**：是用条件类型 extends、infer 提取，还是映射类型遍历？
3. **考虑分配律**：联合类型是否需要分配？如果需要阻止分配，用方括号包裹。
4. **设计递归终止条件**：递归类型必须有明确的终止条件，避免无限递归。
5. **利用特殊性质**：如函数参数的逆变性（UnionToIntersection）、可选属性的 {} extends 行为（RequiredKeys）。
6. **使用累加器**：复杂的递归计算通常需要额外的泛型参数作为累加器。
7. **分步验证**：每写一步就用具体类型测试，确保中间结果正确。

类型体操的学习曲线虽然陡峭，但每掌握一个技巧，你对 TypeScript 类型系统的理解就深一层。当你能独立解决 Medium 和 Hard 难度的 type-challenges 题目时，你已经具备了 TypeScript 专家级的类型编程能力。`,
    code: `// ============================================================
// 第五章代码演示：类型挑战实战
// ============================================================

console.log("========== 1. Get Required / Optional Keys ==========");

// RequiredKeys：获取必需属性的键
// 原理：对于可选属性 K，{} 可以赋值给 Pick<T, K>（因为属性可以不存在）
//       对于必需属性 K，{} 不能赋值给 Pick<T, K>（缺少必需属性）
type RequiredKeys<T> = keyof {
  [K in keyof T as {} extends Pick<T, K> ? never : K]: T[K];
};

// OptionalKeys：获取可选属性的键
type OptionalKeys<T> = keyof {
  [K in keyof T as {} extends Pick<T, K> ? K : never]: T[K];
};

interface User {
  id: number;
  name: string;
  email?: string;
  age?: number;
}

type ReqKeys = RequiredKeys<User>;  // "id" | "name"
type OptKeys = OptionalKeys<User>;  // "email" | "age"

const _test1a: ReqKeys = "id";
const _test1b: ReqKeys = "name";
const _test1c: OptKeys = "email";
const _test1d: OptKeys = "age";
console.log("RequiredKeys<User> = 'id' | 'name'  ✓");
console.log("OptionalKeys<User> = 'email' | 'age'  ✓");

// GetRequired：提取只包含必需属性的对象类型
type GetRequired<T> = {
  [K in RequiredKeys<T>]: T[K];
};

// GetOptional：提取只包含可选属性的对象类型
type GetOptional<T> = {
  [K in OptionalKeys<T>]?: T[K];
};

type RequiredPart = GetRequired<User>;  // { id: number; name: string }
type OptionalPart = GetOptional<User>;  // { email?: string; age?: number }

const _test1e: RequiredPart = { id: 1, name: "张三" };
const _test1f: OptionalPart = { email: "z@e.com" };
console.log("GetRequired<User> = { id, name }  ✓");
console.log("GetOptional<User> = { email?, age? }  ✓");

// 运行时验证
function getRequiredKeys<T extends object>(obj: T): (keyof T)[] {
  const result: (keyof T)[] = [];
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) {
      result.push(key);
    }
  }
  return result;
}
console.log("\\n运行时 keys:", Object.keys({ id: 1, name: "张三", email: undefined }));

console.log("\\n========== 2. DeepPick：深度选择属性 ==========");

// DeepPick：支持点号路径的深度选择
type DeepPick<T, Path extends string> =
  Path extends \`\${infer Key}.\${infer Rest}\`
  ? Key extends keyof T
  ? { [K in Key]: DeepPick<T[K], Rest> }
  : never
  : Path extends keyof T
  ? { [K in Path]: T[K] }
  : never;

interface NestedObj {
  a: {
    b: {
      c: number;
      d: string;
    };
    e: boolean;
  };
  f: string;
}

type PickedC = DeepPick<NestedObj, "a.b.c">;  // { a: { b: { c: number } } }
type PickedF = DeepPick<NestedObj, "f">;       // { f: string }
type PickedE = DeepPick<NestedObj, "a.e">;     // { a: { e: boolean } }

const _test2a: PickedC = { a: { b: { c: 42 } } };
const _test2b: PickedF = { f: "hello" };
const _test2c: PickedE = { a: { e: true } };
console.log("DeepPick<NestedObj, 'a.b.c'> = { a: { b: { c: number } } }  ✓");
console.log("DeepPick<NestedObj, 'f'> = { f: string }  ✓");
console.log("DeepPick<NestedObj, 'a.e'> = { a: { e: boolean } }  ✓");

// 运行时 deepPick（类似 lodash get，但返回嵌套对象）
function deepPick<T extends Record<string, any>>(obj: T, path: string): any {
  const keys = path.split(".");
  let value: any = obj;
  const result: any = {};
  let current = result;
  for (let i = 0; i < keys.length; i++) {
    value = value[keys[i]];
    if (i === keys.length - 1) {
      current[keys[i]] = value;
    } else {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
  }
  return result;
}

const testObj: NestedObj = {
  a: { b: { c: 42, d: "world" }, e: true },
  f: "hello",
};
console.log("\\n运行时 deepPick('a.b.c'):", JSON.stringify(deepPick(testObj, "a.b.c")));
console.log("运行时 deepPick('f'):", JSON.stringify(deepPick(testObj, "f")));

console.log("\\n========== 3. UnionToIntersection：联合转交叉 ==========");

// UnionToIntersection：利用函数参数逆变性
// 原理：
// 1. 把联合类型 U 的每个成员包装为函数参数类型: (x: U) => void
// 2. 这个函数联合在 extends (x: infer I) => void 时，
//    参数位置是逆变的，TypeScript 推导 I 为所有成员的交叉类型
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

type Intersection1 = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number } = { a: string; b: number }

type Intersection2 = UnionToIntersection<
  | { name: string }
  | { age: number }
  | { email: string }
>;
// { name: string } & { age: number } & { email: string }

const _test3a: Intersection1 = { a: "hello", b: 42 };
const _test3b: Intersection2 = { name: "张三", age: 25, email: "z@e.com" };
console.log("UnionToIntersection<{a}|{b}> = {a,b}  ✓");
console.log("UnionToIntersection<{name}|{age}|{email}> = {name,age,email}  ✓");

// 应用：合并函数类型
type Fn1 = (x: string) => void;
type Fn2 = (x: number) => void;
type Merged = UnionToIntersection<Fn1 | Fn2>;
// ((x: string) => void) & ((x: number) => void)
// 这等价于一个重载函数
console.log("UnionToIntersection 可以合并函数类型  ✓");

// 运行时：Object.assign 实现对象合并
const obj1 = { a: "hello" };
const obj2 = { b: 42 };
const merged = Object.assign({}, obj1, obj2);
console.log("\\n运行时合并:", JSON.stringify(merged));

console.log("\\n========== 4. Permutation：排列组合 ==========");

// Permutation：生成联合类型的所有排列
// 原理：
// 1. 利用条件类型分配律遍历联合的每个成员
// 2. 对每个成员 T，将其作为元组首元素
// 3. 递归处理 Exclude<C, T>（剩余元素）
// 4. [T] extends [never] 作为终止条件
type Permutation<T, C = T> =
  [T] extends [never]
  ? []
  : T extends any
  ? [T, ...Permutation<Exclude<C, T>>]
  : never;

type PermAB = Permutation<"A" | "B">;
// ["A", "B"] | ["B", "A"]
type PermABC = Permutation<"A" | "B" | "C">;
// ["A","B","C"] | ["A","C","B"] | ["B","A","C"] | ["B","C","A"]
// | ["C","A","B"] | ["C","B","A"]

const _test4a: PermAB = ["A", "B"];
const _test4b: PermAB = ["B", "A"];
const _test4c: PermABC = ["A", "B", "C"];
const _test4d: PermABC = ["C", "A", "B"];
console.log("Permutation<'A'|'B'> = ['A','B'] | ['B','A']  ✓");
console.log("Permutation<'A'|'B'|'C'> = 6种排列  ✓");

// 运行时：生成数组全排列
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}
console.log("\\n运行时排列 [1,2,3]:");
permutations([1, 2, 3]).forEach((p) => console.log(" ", JSON.stringify(p)));

console.log("\\n========== 5. IsNever & IsUnion ==========");

// IsNever：判断类型是否为 never
// 注意：不能用 T extends never，因为 never 在条件类型中会直接返回 never
//       必须用 [T] extends [never] 阻止分配
type IsNever<T> = [T] extends [never] ? true : false;

type IsNever1 = IsNever<never>;   // true
type IsNever2 = IsNever<string>; // false
type IsNever3 = IsNever<null>;   // false
const _test5a: IsNever1 = true;
const _test5b: IsNever2 = false;
const _test5c: IsNever3 = false;
console.log("IsNever<never> = true   ✓");
console.log("IsNever<string> = false  ✓");

// IsUnion：判断类型是否为联合类型
// 原理：条件类型分配时，每个成员单独匹配
//       如果 T 是联合，T extends any 分配后每个成员是单独的
//       此时 [C]（完整联合）不 extends [T]（单个成员），返回 true
//       如果 T 不是联合，[C] extends [T] 成立，返回 false
type IsUnion<T, C = T> =
  T extends any
  ? [C] extends [T] ? false : true
  : never;

type IsUnion1 = IsUnion<"a" | "b">;  // true
type IsUnion2 = IsUnion<string>;      // false
type IsUnion3 = IsUnion<1 | 2 | 3>;   // true
type IsUnion4 = IsUnion<never>;       // never（never 没有成员）
const _test5d: IsUnion1 = true;
const _test5e: IsUnion2 = false;
const _test5f: IsUnion3 = true;
console.log("IsUnion<'a'|'b'> = true   ✓");
console.log("IsUnion<string> = false   ✓");
console.log("IsUnion<1|2|3> = true     ✓");

// 运行时判断值是否为联合类型的成员... 运行时没有联合类型概念
// 但可以检查变量类型
console.log("\\n运行时类型检查:");
console.log("  typeof 'hello':", typeof "hello");

console.log("\\n========== 6. Join & Trim & Capitalize ==========");

// Join：数组元素用分隔符连接成字符串
type Join<T extends readonly string[], D extends string> =
  T extends readonly [infer F extends string, ...infer R extends readonly string[]]
  ? R extends readonly []
  ? F
  : \`\${F}\${D}\${Join<R, D>}\`
  : "";

type Joined = Join<["a", "b", "c"], "-">;  // "a-b-c"
const _test6a: Joined = "a-b-c";
console.log("Join<['a','b','c'], '-'> = 'a-b-c'  ✓");

// Trim：去除首尾空白
type Whitespace = " " | "\\n" | "\\t" | "\\r";
type TrimLeft<S extends string> =
  S extends \`\${Whitespace}\${infer R}\` ? TrimLeft<R> : S;
type TrimRight<S extends string> =
  S extends \`\${infer R}\${Whitespace}\` ? TrimRight<R> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type Trimmed = Trim<"  hello  ">;  // "hello"
const _test6b: Trimmed = "hello";
console.log("Trim<'  hello  '> = 'hello'  ✓");

// MyCapitalize：手动实现首字母大写
interface CapitalMap {
  a: "A"; b: "B"; c: "C"; d: "D"; e: "E"; f: "F"; g: "G"; h: "H";
  i: "I"; j: "J"; k: "K"; l: "L"; m: "M"; n: "N"; o: "O"; p: "P";
  q: "Q"; r: "R"; s: "S"; t: "T"; u: "U"; v: "V"; w: "W"; x: "X";
  y: "Y"; z: "Z";
}
type MyCapitalize<S extends string> =
  S extends \`\${infer C}\${infer Rest}\`
  ? C extends keyof CapitalMap ? \`\${CapitalMap[C]}\${Rest}\` : S
  : S;

type Cap1 = MyCapitalize<"hello">;  // "Hello"
type Cap2 = MyCapitalize<"world">;  // "World"
const _test6c: Cap1 = "Hello";
const _test6d: Cap2 = "World";
console.log("MyCapitalize<'hello'> = 'Hello'  ✓");
console.log("MyCapitalize<'world'> = 'World'  ✓");

// 运行时字符串操作
console.log("\\n运行时字符串:");
console.log("  ['a','b','c'].join('-'):", ["a", "b", "c"].join("-"));
console.log("  '  hello  '.trim():", "  hello  ".trim());
console.log("  'hello'.charAt(0).toUpperCase():", "hello".charAt(0).toUpperCase() + "hello".slice(1));

console.log("\\n========== 7. PathGetter：类型安全的路径访问 ==========");

// PathGetter：类似 lodash get 的类型版本
// 支持点号路径，返回路径指向的值的类型
type PathGetter<T, P extends string> =
  P extends \`\${infer Key}.\${infer Rest}\`
  ? Key extends keyof T
  ? PathGetter<T[Key], Rest>
  : undefined
  : P extends keyof T
  ? T[P]
  : undefined;

interface Data {
  user: {
    name: string;
    address: {
      city: string;
      zip: string;
    };
  };
  posts: { title: string }[];
}

type NameType = PathGetter<Data, "user.name">;           // string
type CityType = PathGetter<Data, "user.address.city">;  // string
type InvalidType = PathGetter<Data, "user.age">;        // undefined
type PostsType = PathGetter<Data, "posts">;             // { title: string }[]

const _test7a: NameType = "张三";
const _test7b: CityType = "北京";
const _test7c: InvalidType = undefined;
console.log("PathGetter<Data, 'user.name'> = string  ✓");
console.log("PathGetter<Data, 'user.address.city'> = string  ✓");
console.log("PathGetter<Data, 'user.age'> = undefined  ✓");

// 运行时 pathGetter（类似 lodash.get）
function getByPath<T>(obj: T, path: string): any {
  return path.split(".").reduce((acc: any, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

const data: Data = {
  user: {
    name: "张三",
    address: { city: "北京", zip: "100000" },
  },
  posts: [{ title: "第一篇" }],
};
console.log("\\n运行时 getByPath:");
console.log("  user.name:", getByPath(data, "user.name"));
console.log("  user.address.city:", getByPath(data, "user.address.city"));
console.log("  user.age:", getByPath(data, "user.age"));

console.log("\\n========== 8. 综合实战：类型安全的查询构造器 ==========");

// 定义数据库 Schema
interface Database {
  users: {
    id: number;
    name: string;
    email: string;
    age: number;
  };
  posts: {
    id: number;
    title: string;
    content: string;
    author_id: number;
  };
}

type TableName = keyof Database;

// 查询构造器类型
interface QueryBuilder<T extends TableName> {
  select<K extends keyof Database[T]>(...fields: K[]): QueryBuilder<T>;
  where<K extends keyof Database[T]>(field: K, value: Database[T][K]): QueryBuilder<T>;
  orderBy<K extends keyof Database[T]>(field: K, dir: "asc" | "desc"): QueryBuilder<T>;
  limit(n: number): QueryBuilder<T>;
  execute(): { sql: string; params: any[] };
}

// 实现查询构造器
function createQueryBuilder<T extends TableName>(table: T): QueryBuilder<T> {
  const state: any = {
    table,
    fields: ["*"],
    conditions: [],
    order: null,
    limitCount: null,
  };

  const builder: QueryBuilder<T> = {
    select(...fields: any[]) {
      state.fields = fields;
      return builder;
    },
    where(field: any, value: any) {
      state.conditions.push({ field, value });
      return builder;
    },
    orderBy(field: any, dir: any) {
      state.order = { field, dir };
      return builder;
    },
    limit(n: number) {
      state.limitCount = n;
      return builder;
    },
    execute() {
      let sql = "SELECT " + state.fields.join(", ") + " FROM " + state.table;
      const params: any[] = [];
      if (state.conditions.length > 0) {
        sql += " WHERE " + state.conditions.map((c: any) => c.field + " = ?").join(" AND ");
        state.conditions.forEach((c: any) => params.push(c.value));
      }
      if (state.order) {
        sql += " ORDER BY " + state.order.field + " " + state.order.dir;
      }
      if (state.limitCount) {
        sql += " LIMIT " + state.limitCount;
      }
      return { sql, params };
    },
  };

  return builder;
}

// 使用查询构造器（类型安全！）
const userQuery = createQueryBuilder("users")
  .select("id", "name", "email")
  .where("age", 25)
  .orderBy("name", "asc")
  .limit(10);

const { sql, params } = userQuery.execute();
console.log("生成的 SQL:", sql);
console.log("参数:", params);

// 以下会报类型错误（取消注释试试看）：
// createQueryBuilder("users").select("invalid_field");  // ❌
// createQueryBuilder("users").where("age", "young");   // ❌ age 需要 number
// createQueryBuilder("invalid_table");                  // ❌

const postQuery = createQueryBuilder("posts")
  .select("title", "content")
  .where("author_id", 1)
  .orderBy("id", "desc");
const postResult = postQuery.execute();
console.log("\\n文章查询 SQL:", postResult.sql);
console.log("文章查询参数:", postResult.params);
console.log("类型安全的查询构造器  ✓");

console.log("\\n========== 9. 终极挑战：UnionToTuple ==========");

// UnionToTuple：联合类型转元组类型
// 这是最困难的类型体操之一，依赖函数交叉类型的重载行为
// 交叉类型的函数在调用时 TypeScript 会选择最后一个重载签名
// 利用这个特性可以从联合中"逐个取出"元素

type UnionToTuple<U, L = LastInUnion<U>> =
  [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, L>>, L];

// LastInUnion：获取联合类型中的"最后一个"成员
// 利用函数交叉类型的逆变位置推导
type LastInUnion<U> =
  UnionToIntersection<U extends any ? (x: U) => void : never> extends (x: infer L) => void
  ? L
  : never;

type TupleFromUnion = UnionToTuple<1 | 2 | 3>;
// 可能是 [1, 2, 3] 或其他排列（顺序不保证，但包含所有成员）

// 验证
type TupleLength = TupleFromUnion["length"];
const _test9a: TupleLength = 3;
console.log("UnionToTuple<1|2|3> 长度为 3  ✓");
console.log("（注意：联合类型没有顺序，元组顺序不保证）");

// 运行时：Set 转数组
const unionValues = new Set([1, 2, 3]);
const tupleFromSet = [...unionValues];
console.log("\\n运行时 Set 转数组:", tupleFromSet);

console.log("\\n========== 10. 总结：类型体操核心技巧清单 ==========");

const techniques = [
  "条件类型: T extends U ? X : Y (if/else)",
  "分配条件类型: 联合类型自动分发到每个成员",
  "infer 关键字: 模式匹配提取子类型",
  "映射类型: { [K in keyof T]: ... } 对象变换",
  "keyof 操作符: 获取对象所有键的联合",
  "递归类型: 类型别名中引用自身实现循环",
  "模板字面量: 字符串模式匹配与拼接",
  "元组长度: 用 [any, any, ...]['length'] 编码数字",
  "逆变技巧: 函数参数位置推导交叉类型",
  "累加器模式: 额外泛型参数累积递归结果",
  "方括号包裹: [T] extends [U] 阻止分配",
  "Branded Types: T & { __brand: B } 名义类型",
];

console.log("类型体操核心技巧:");
techniques.forEach((t, i) => console.log("  " + (i + 1) + ". " + t));

console.log("\\n类型挑战实战演示完成！");
console.log("恭喜你完成了 TypeScript 类型体操深入教程的全部 5 章！");`,
  },
];
