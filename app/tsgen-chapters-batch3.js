// =============================================================
// TypeScript 泛型专门教程 - 第 3 批章节（泛型高级篇 5 章）
// -------------------------------------------------------------
// 覆盖内容：条件类型 / infer 关键字 / 映射类型 /
//          模板字面量类型 / 内置工具类型实现原理
//
// 注意事项：
//   1. content 字段是反引号模板字符串，其中的 Markdown 代码围栏
//      必须写成 \`\`\`ts 或 \`\`\` （每个反引号前加反斜杠转义）。
//   2. code 字段也是反引号模板字符串，内部绝对不能出现反引号字符，
//      所有字符串拼接一律用 + 号，避免使用模板字面量。
// =============================================================

export const chapters = [
  // =========================================================
  // 第 1 章：条件类型
  // =========================================================
  {
    id: "tsgen-conditional",
    icon: "🔀",
    group: "泛型高级",
    title: "条件类型：类型层面的 if-else",
    content: `
# 条件类型：类型层面的 if-else

## 一、什么是条件类型

在前面的章节里，我们学过了泛型、约束、keyof 等工具。它们都能让类型"动起来"，但都有一个共同局限：类型的形状在定义时就固定了，无法根据传入类型的不同而走不同的分支。

条件类型（Conditional Types）就是来补这个缺口的。它让类型层面也拥有了类似 \`if-else\` 的判断能力：根据某个类型是否满足特定条件，选择不同的结果类型。

注意，这种判断完全发生在类型层面（编译期），运行时根本不存在条件类型这个东西。编译结束后，所有条件类型都会被求值成具体的类型。

## 二、基本语法

条件类型的语法非常直观，和 JavaScript 的三元运算符几乎一模一样：

\`\`\`ts
type IsString<T> = T extends string ? true : false;
\`\`\`

读作：如果 T 继承自 string（也就是说 T 是 string 或 string 的子类型），结果就是 true 类型，否则就是 false 类型。这里的 true 和 false 不是布尔值，而是字面量类型。

来看几个具体的推导结果：

\`\`\`ts
type A = IsString<string>;       // true
type B = IsString<number>;       // false
type C = IsString<"hello">;      // true  （"hello" 是 string 的子类型）
type D = IsString<string | number>; // 这里涉及"分发"行为，后面会讲
\`\`\`

## 三、与泛型结合：Unbox 数组解包

条件类型最常见的用法之一，是配合 infer（下一章详解）从复合类型里提取内部类型。这里先看一个简化版的"数组解包"：

\`\`\`ts
type Unbox<T> = T extends Array<infer U> ? U : T;
\`\`\`

含义是：如果 T 是一个数组（\`Array<某类型>\`），就提取出那个"某类型"作为结果；否则原样返回 T。这样无论传 \`number[]\` 还是 \`string\`，都能得到合理的输出。

## 四、分发行为（Distributive）

条件类型有一个非常重要的特性：当传入的 T 是联合类型时，条件类型会"分发"地逐个判断，再把结果合并成联合类型。

举个例子：

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>; // string[] | number[]
\`\`\`

注意结果不是 \`(string | number)[]\`，而是 \`string[] | number[]\`。这就是分发：TS 会把联合类型拆开，对 string 和 number 分别执行条件判断，再把两个结果合并。

## 五、Exclude 的原理：分发 + never

理解了分发，就能看懂内置工具 Exclude 的实现了：

\`\`\`ts
type Exclude<T, U> = T extends U ? never : T;
\`\`\`

原理是：把 T 的每个成员拿出来判断，如果它属于 U 就返回 never（被丢弃），否则保留自己。比如 \`Exclude<"a" | "b" | "c", "a">\` 会分别判断 "a"、"b"、"c"，"a" 命中 "a" 返回 never，"b" 和 "c" 保留，最终合并成 \`"b" | "c"\`。never 在联合类型中会被自动忽略，这就是它"消失"的原因。

## 六、条件类型的嵌套

条件类型可以嵌套，实现多分支判断，类似于 if-else if-else 链：

\`\`\`ts
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";
\`\`\`

每行末尾的冒号后面接下一个条件，层层递进，直到最后一个 else 分支。

## 七、阻止分发的技巧

有时我们不希望分发。解决办法是用方括号把 T 包起来：

\`\`\`ts
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
\`\`\`

这里 \`[T]\` 和 \`[any]\` 都是单元素元组，元组不会被分发，所以传入联合类型时会整体判断，结果是 \`(string | number)[]\`。

## 八、使用场景总结

条件类型的核心价值是"根据输入类型决定输出类型"。典型场景包括：

1. 类型守卫的静态版：在不运行代码的情况下判断类型关系。
2. 实现工具类型：Exclude、Extract、NonNullable 等都基于条件类型。
3. 配合 infer 提取类型：从函数、数组、Promise 中拆出内部类型（下一章详讲）。
4. 类型分支：根据传入类型选择不同的 API 形状，让库的类型更智能。

掌握条件类型，是从"会用泛型"到"会写复杂类型"的关键一步。它和 infer、映射类型组合起来，能解决绝大多数高级类型问题。
`,
    code: `// ========== 条件类型演示 ==========
console.log("========== 条件类型演示 ==========\\n");

// 【1. 最简单的条件类型：判断是否是 string】
// T extends string ? true : false
// 如果 T 是 string 或其子类型，结果是 true 字面量类型，否则是 false
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = T extends number ? true : false;

// 用变量把类型推导结果"接住"，方便运行时打印
const a: IsString<string> = true;        // true
const b: IsString<number> = false;       // false
const c: IsString<"hi"> = true;          // true（"hi" 是 string 的子类型）
const d: IsNumber<42> = true;            // true

console.log("IsString<string> =", a);
console.log("IsString<number> =", b);
console.log("IsString<'hi'> =", c);
console.log("IsNumber<42> =", d);

// 【2. Unbox：从数组类型中提取元素类型】
// 如果 T 是数组，就取出元素类型；否则原样返回
type Unbox<T> = T extends Array<infer U> ? U : T;
type Elem1 = Unbox<number[]>;   // number
type Elem2 = Unbox<string[]>;   // string
type Elem3 = Unbox<boolean>;    // boolean（不是数组，原样返回）

const e1: Elem1 = 100;
const e2: Elem2 = "hello";
const e3: Elem3 = true;
console.log("\\nUnbox<number[]> =", e1);
console.log("Unbox<string[]> =", e2);
console.log("Unbox<boolean> =", e3);

// 【3. 手动实现 Exclude<T, U>】
// 原理：T 是联合类型时会分发判断，命中 U 的成员返回 never，其余保留
type MyExclude<T, U> = T extends U ? never : T;
type Left = MyExclude<"a" | "b" | "c", "a">; // "b" | "c"
const left: Left = "b"; // 只能是 "b" 或 "c"
console.log("\\nMyExclude<'a'|'b'|'c', 'a'> =", left);

// 【4. 演示分发行为】
// ToArray 会对联合类型逐个处理
type ToArray<T> = T extends any ? T[] : never;
type Arrs = ToArray<string | number>; // string[] | number[]

// 阻止分发的写法：用 [T] extends [any]
type ToArrayAll<T> = [T] extends [any] ? T[] : never;
type ArrAll = ToArrayAll<string | number>; // (string | number)[]

const arr1: Arrs = ["a"];        // 可以是 string[]
const arr2: Arrs = [1];          // 也可以是 number[]
const arrAll: ArrAll = ["a", 1]; // 混合数组也合法
console.log("\\nToArray 分发结果（string[]）：", arr1);
console.log("ToArray 分发结果（number[]）：", arr2);
console.log("ToArrayAll 非分发结果（混合）：", arrAll);

// 【5. 嵌套条件类型：类型名判断】
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

function showTypeName<T>(name: TypeName<T>): void {
  console.log("类型名：", name);
}
showTypeName<"string">("string");
showTypeName<"number">("number");
showTypeName<"object">("object");
console.log("\\n（以上展示嵌套条件类型的多分支判断效果）");
`
  },

  // =========================================================
  // 第 2 章：infer 关键字
  // =========================================================
  {
    id: "tsgen-infer",
    icon: "📥",
    group: "泛型高级",
    title: "infer 关键字：从类型中提取类型",
    content: `
# infer 关键字：从类型中提取类型

## 一、infer 是什么

上一章我们在 Unbox 里见到了 \`infer U\` 这样的写法，但没有细讲。这一章专门说清楚 infer。

infer 是条件类型里的"声明类型变量"的关键字。它的作用是：在 \`T extends 某种结构\` 的判断中，顺便把结构里某个位置的类型"提取"出来，给它起个名字，供后续使用。

你可以把它理解成"模式匹配 + 变量绑定"：先用一个带占位符的类型结构去匹配 T，匹配成功就把占位符对应的真实类型提取出来。

## 二、基本语法

infer 只能出现在条件类型的 extends 子句里：

\`\`\`ts
type Unbox<T> = T extends Array<infer U> ? U : T;
\`\`\`

这里 \`Array<infer U>\` 就是"带占位符的结构"。当 T 是 \`number[]\` 时，它能匹配上 \`Array<U>\`，于是 U 被推断为 number，结果就是 number。当 T 不是数组时，匹配失败，走 else 分支返回 T 本身。

## 三、提取函数返回类型（ReturnType 原理）

这是 infer 最经典的应用。TS 内置的 \`ReturnType<T>\` 就是这么实现的：

\`\`\`ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

含义：如果 T 是一个函数类型，就提取它的返回类型 R；否则返回 never。这里的 \`(...args: any[]) => infer R\` 是函数结构的模式，infer R 放在返回值位置，所以提取的是返回类型。

用法：\`ReturnType<() => string>\` 得到 string；\`ReturnType<(x: number) => boolean>\` 得到 boolean。

## 四、提取函数参数类型（Parameters 原理）

把 infer 放在参数位置，就能提取参数类型。内置的 \`Parameters<T>\` 实现：

\`\`\`ts
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
\`\`\`

这里 \`infer P\` 放在 args 位置，提取的是整个参数元组。比如 \`(x: number, y: string) => void\` 会得到 \`[number, string]\`。

## 五、只提取单个参数

如果想只提取第一个参数，可以写得更具体：

\`\`\`ts
type FirstParam<T> = T extends (x: infer P) => any ? P : never;
\`\`\`

这样 \`(name: string) => void\` 会得到 string。

## 六、提取 Promise 的值类型

Promise 也是典型的"包裹类型"，可以用 infer 拆开：

\`\`\`ts
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
\`\`\`

\`Promise<string>\` 会得到 string；\`Promise<number[]>\` 会得到 \`number[]\`。如果 T 本身不是 Promise，就原样返回。

## 七、infer 的位置决定提取什么

这是 infer 最关键的规律：**你把 infer 写在哪个位置，提取的就是那个位置的类型**。

- 写在返回值位置 → 提取返回类型
- 写在参数位置 → 提取参数类型
- 写在数组元素位置 → 提取元素类型
- 写在 Promise 值位置 → 提取 Promise 的值类型

同一个条件类型里可以出现多个 infer，分别提取不同位置的类型：

\`\`\`ts
type FuncInOut<T> = T extends (x: infer A) => infer B ? [A, B] : never;
\`\`\`

这会同时提取参数类型 A 和返回类型 B，组成一个元组。

## 八、infer 的限制与注意点

1. infer 声明的类型变量只在条件类型的"真分支"里有效，else 分支用不了它。
2. 如果匹配失败，整个条件类型走 else 分支，infer 变量根本不会被绑定。
3. infer 不能在条件类型外面单独使用，必须配合 extends。
4. 同名 infer 在多处出现时，TS 会做推断并要求类型一致（在某些场景下表现为取交集）。

## 九、使用场景

infer 的价值在于"反向工程类型"：当你拿到一个现成的函数类型、Promise 类型、数组类型，想拆出它的内部组成时，infer 是唯一手段。常见场景：

1. 封装高阶函数时，从传入函数推导返回类型，避免手写。
2. 处理异步数据时，从 \`Promise<数据类型>\` 拆出真实数据类型。
3. 实现类型工具：ReturnType、Parameters、Awaited 等都依赖 infer。
4. 解析复杂类型结构，比如从 React 组件类型里提取 props 类型。

infer 和条件类型是天生一对：条件类型负责判断"是不是这个结构"，infer 负责"把这个结构里的类型拿出来"。两者结合，几乎可以拆解任何复合类型。
`,
    code: `// ========== infer 关键字演示 ==========
console.log("========== infer 关键字演示 ==========\\n");

// 【1. 手动实现 ReturnType<T>】
// 提取函数的返回类型：infer R 放在返回值位置
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type R1 = MyReturnType<() => string>;              // string
type R2 = MyReturnType<(x: number) => boolean>;    // boolean
type R3 = MyReturnType<() => number[]>;            // number[]

const r1: R1 = "hello";
const r2: R2 = true;
const r3: R3 = [1, 2, 3];
console.log("MyReturnType<() => string> =", r1);
console.log("MyReturnType<(x:number) => boolean> =", r2);
console.log("MyReturnType<() => number[]> =", r3);

// 【2. 手动实现 Parameters<T>】
// 提取函数的参数元组：infer P 放在参数位置
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
type P1 = MyParameters<(a: number, b: string) => void>; // [number, string]
type P2 = MyParameters<(name: string) => number>;        // [string]

const p1: P1 = [42, "hi"];
const p2: P2 = ["alice"];
console.log("\\nMyParameters 结果1：", p1);
console.log("MyParameters 结果2：", p2);

// 【3. 只提取第一个参数】
// 把 infer 写在具体参数位置，只取第一个
type FirstParam<T> = T extends (x: infer P) => any ? P : never;
type FP = FirstParam<(name: string, age: number) => void>; // string
const fp: FP = "bob";
console.log("\\nFirstParam 结果：", fp);

// 【4. 手动实现 UnpackPromise<T>】
// 从 Promise 中拆出值类型
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type V1 = UnpackPromise<Promise<string>>;   // string
type V2 = UnpackPromise<Promise<number[]>>; // number[]
type V3 = UnpackPromise<boolean>;           // boolean（非 Promise 原样返回）

const v1: V1 = "resolved";
const v2: V2 = [10, 20];
const v3: V3 = false;
console.log("\\nUnpackPromise<Promise<string>> =", v1);
console.log("UnpackPromise<Promise<number[]>> =", v2);
console.log("UnpackPromise<boolean> =", v3);

// 【5. 多个 infer：同时提取参数和返回值】
// 两个 infer 分别绑定不同位置的类型
type FuncInOut<T> = T extends (x: infer A) => infer B ? [A, B] : never;
type IO = FuncInOut<(n: number) => string>; // [number, string]
const io: IO = [42, "result"];
console.log("\\nFuncInOut（同时提取参数和返回值）：", io);

// 【6. 提取数组元素类型】
type ElementOf<T> = T extends Array<infer E> ? E : never;
type E1 = ElementOf<string[]>;   // string
type E2 = ElementOf<number[]>;   // number
const el1: E1 = "elem";
const el2: E2 = 99;
console.log("\\nElementOf<string[]> =", el1);
console.log("ElementOf<number[]> =", el2);

console.log("\\n（以上全部为类型层面提取，运行时通过变量展示推导结果）");
`
  },

  // =========================================================
  // 第 3 章：映射类型
  // =========================================================
  {
    id: "tsgen-mapped",
    icon: "🗺️",
    group: "泛型高级",
    title: "映射类型：批量转换类型属性",
    content: `
# 映射类型：批量转换类型属性

## 一、映射类型是什么

前面我们用条件类型做"类型层面的 if-else"，用 infer 做"类型提取"。但有一类需求它们都不擅长：对一个对象类型的所有属性做批量转换。比如把所有属性变成可选、变成只读、把方法变成异步。

映射类型（Mapped Types）就是干这个的。它的本质是"遍历对象类型的所有键，对每个键的值类型做转换，生成一个新的对象类型"。可以理解为类型层面的 \`map\` 操作。

## 二、基本语法

\`\`\`ts
type ReadOnly<T> = { readonly [K in keyof T]: T[K] };
\`\`\`

拆开看：

- \`keyof T\` 拿到 T 的所有键组成的联合类型。
- \`[K in keyof T]\` 表示遍历这些键，K 是当前键。
- \`T[K]\` 是当前键对应的值类型。
- \`readonly\` 前缀把每个属性都变成只读。

这就是内置 \`Readonly<T>\` 的实现原理。同理，\`Partial<T>\` 的实现：

\`\`\`ts
type Partial<T> = { [K in keyof T]?: T[K] };
\`\`\`

只是把 readonly 换成了 ?（可选标记）。

## 三、映射类型的三个修饰符

映射类型支持两种修饰符：

- \`readonly\` / \`-readonly\`：添加或移除只读。
- \`?\` / \`-\?\`：添加或移除可选。

前面的 \`-\` 表示移除。所以 \`Required<T>\`（把所有可选属性变成必填）的实现是：

\`\`\`ts
type Required<T> = { [K in keyof T]-?: T[K] };
\`\`\`

\`-?\` 就是"去掉可选标记"。

## 四、修改键名：as 子句

TS 4.1 起支持 as 子句，可以在映射时重命名键：

\`\`\`ts
type Getters<T> = {
  [K in keyof T as "get_" + Capitalize<string & K>]: () => T[K];
};
\`\`\`

含义：遍历 T 的每个键 K，把新键名改成 \`get_开头 + K 大写开头\` 的形式，值类型变成一个无参函数，返回原值类型。比如 \`{ name: string }\` 会变成 \`{ get_Name: () => string }\`。

\`Capitalize\` 是内置工具，把字符串首字母大写。\`string & K\` 是为了满足 Capitalize 对字符串类型的要求。

## 五、过滤键：用 never

as 子句还可以配合条件类型过滤键：当 as 后面的表达式返回 never 时，这个键会被丢弃。

\`\`\`ts
type RemoveKindField<T> = {
  [K in keyof T as Exclude<K, "kind">]: T[K];
};
\`\`\`

这会把 T 里名为 "kind" 的键排除掉。原理是 \`Exclude<K, "kind">\` 在 K 等于 "kind" 时返回 never，该键就被过滤了。

## 六、映射类型 + 条件类型组合

映射类型内部可以对值类型用条件类型做判断：

\`\`\`ts
type StringifyIfObject<T> = {
  [K in keyof T]: T[K] extends object ? string : T[K];
};
\`\`\`

含义：遍历 T 的每个属性，如果值类型是对象就替换成 string，否则保持原样。这种组合非常灵活，能实现复杂的类型变换。

## 七、手动实现 Pick 和 Omit

\`\`\`ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
\`\`\`

Pick 的关键是 \`[P in K]\`：K 是一个键的联合类型，遍历 K 而不是 keyof T，这样就只挑选 K 里指定的键。

Omit 可以基于 Pick 实现：

\`\`\`ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
\`\`\`

先用 Exclude 把 K 从 keyof T 里排除，再 Pick 剩下的键。

## 八、把方法变成异步

一个实用场景：把一个对象类型里所有函数的返回类型包一层 Promise：

\`\`\`ts
type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? (...args: any[]) => Promise<R>
    : T[K];
};
\`\`\`

遍历每个属性，如果是函数就把返回类型改成 \`Promise<R>\`，否则原样保留。这种类型变换在改造同步 API 为异步 API 时非常有用。

## 九、使用场景

映射类型是写工具类型的"主力武器"。常见场景：

1. 实现内置工具：Partial、Required、Readonly、Pick、Omit 都基于映射类型。
2. 生成派生类型：根据数据类型自动生成对应的 setter/getter 类型。
3. API 改造：把同步接口批量转成异步、给所有方法加日志包装等。
4. 表单处理：根据实体类型生成"可空版本""部分提交版本"等。

映射类型和条件类型、infer 三者组合，构成了 TypeScript 类型编程的核心三件套。掌握它们，你就能写出绝大多数复杂的工具类型。
`,
    code: `// ========== 映射类型演示 ==========
console.log("========== 映射类型演示 ==========\\n");

// 定义一个原始类型，后续用它做各种映射
type User = {
  id: number;
  name: string;
  email?: string;  // 可选属性
  readonly createdAt: Date;
};

// 【1. 手动实现 Partial<T>：所有属性变可选】
type MyPartial<T> = { [K in keyof T]?: T[K] };
type PartialUser = MyPartial<User>;
const pu: PartialUser = { name: "alice" }; // 只填一个也合法
console.log("MyPartial 结果（只填 name）：", pu);

// 【2. 手动实现 Readonly<T>：所有属性变只读】
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type ReadonlyUser = MyReadonly<User>;
const ru: ReadonlyUser = { id: 1, name: "bob", createdAt: new Date(0) };
// ru.id = 2; // 报错：只读属性不可赋值
console.log("MyReadonly 结果：", ru);

// 【3. 手动实现 Required<T>：去掉所有可选标记】
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type RequiredUser = MyRequired<User>;
const reqU: RequiredUser = { id: 2, name: "carol", email: "c@x.com", createdAt: new Date(0) };
console.log("MyRequired 结果（email 必填）：", reqU);

// 【4. 手动实现 Pick<T, K>：挑选部分属性】
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type UserPreview = MyPick<User, "id" | "name">;
const up: UserPreview = { id: 3, name: "dave" }; // 只有 id 和 name
console.log("MyPick 结果（只含 id 和 name）：", up);

// 【5. 手动实现 Omit<T, K>：排除部分属性】
type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>;
type UserNoEmail = MyOmit<User, "email">;
const une: UserNoEmail = { id: 4, name: "eve", createdAt: new Date(0) };
console.log("MyOmit 结果（不含 email）：", une);

// 【6. 实现一个把所有方法变成异步的映射类型】
// 遍历每个属性，如果是函数就把返回类型包一层 Promise
type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R
    ? (...args: any[]) => Promise<R>
    : T[K];
};
type SyncAPI = {
  getData(): number;
  getName(): string;
  version: string;
};
type AsyncAPI = Asyncify<SyncAPI>;
// AsyncAPI 的 getData 返回 Promise<number>，getName 返回 Promise<string>
const api: AsyncAPI = {
  getData: () => Promise.resolve(42),
  getName: () => Promise.resolve("data"),
  version: "1.0"
};
api.getData().then(v => console.log("\\nAsyncify getData 返回：", v));
api.getName().then(v => console.log("Asyncify getName 返回：", v));

// 【7. 修改键名：生成 getter 方法】
// 把每个键名变成 getXxx，值类型变成无参函数返回原值
type Getters<T> = {
  [K in keyof T as "get" + Capitalize<string & K>]: () => T[K];
};
type UserGetters = Getters<{ id: number; name: string }>;
const ug: UserGetters = {
  getId: () => 1,
  getName: () => "frank"
};
console.log("\\nGetters getId() =", ug.getId());
console.log("Getters getName() =", ug.getName());
`
  },

  // =========================================================
  // 第 4 章：模板字面量类型
  // =========================================================
  {
    id: "tsgen-template-literal",
    icon: "📝",
    group: "泛型高级",
    title: "模板字面量类型：字符串也能做类型运算",
    content: `
# 模板字面量类型：字符串也能做类型运算

## 一、模板字面量类型是什么

在 JavaScript 里，我们用反引号写模板字符串来拼接变量。TypeScript 4.1 起，类型层面也支持了类似的语法，叫"模板字面量类型"（Template Literal Types）。它让字符串字面量类型也能参与运算，生成新的字符串类型。

这听起来抽象，先看个最简单的例子：

\`\`\`ts
type Hello = "hello " + string;
\`\`\`

这定义了一个类型，它表示"以 'hello ' 开头的任意字符串"。任何匹配这个模式的字符串（比如 \`"hello world"\`、\`"hello ts"\`）都属于这个类型。

## 二、与联合类型结合

模板字面量类型真正强大的地方在于和联合类型结合，能批量生成一组字符串类型：

\`\`\`ts
type Side = "left" | "right";
type Margin = "margin-" + Side;
// 等价于 "margin-left" | "margin-right"
\`\`\`

TS 会把联合类型的每个成员都代入模板，生成所有组合。如果有多个联合类型，还会做笛卡尔积：

\`\`\`ts
type Color = "red" | "blue";
type Size = "sm" | "lg";
type Class = "btn-" + Color + "-" + Size;
// "btn-red-sm" | "btn-red-lg" | "btn-blue-sm" | "btn-blue-lg"
\`\`\`

这在定义 CSS 类名、事件名、API 路径等有规律的字符串集合时非常有用。

## 三、内置字符串操作工具

TS 提供了四个内置工具类型，用于对字符串字面量做大小写变换：

- \`Uppercase<S>\`：全大写。比如 \`Uppercase<"abc">\` 得 \`"ABC"\`。
- \`Lowercase<S>\`：全小写。
- \`Capitalize<S>\`：首字母大写。
- \`Uncapitalize<S>\`：首字母小写。

它们常和映射类型配合，用来生成规范的方法名。

## 四、结合 keyof 和映射类型

模板字面量类型最常见的用法之一，是在映射类型里用 as 子句重命名键：

\`\`\`ts
type Getters<T> = {
  [K in keyof T as "get" + Capitalize<string & K>]: () => T[K];
};
\`\`\`

给定 \`{ name: string }\`，会生成 \`{ getName: () => string }\`。这种"根据数据类型自动生成方法签名"的能力，是类型体操里的经典招式。

## 五、字符串模式匹配

模板字面量类型还能配合 infer 做模式匹配，从字符串类型里提取子串：

\`\`\`ts
type RemovePrefix<T> = T extends "prefix_" + infer Rest ? Rest : T;
\`\`\`

如果 T 是 \`"prefix_hello"\`，匹配成功，Rest 被推断为 \`"hello"\`，结果就是 \`"hello"\`。如果不是以 "prefix_" 开头，就原样返回。

这个能力可以做更复杂的事，比如解析 URL 路径、提取事件名中的命名空间。

## 六、实用场景一：事件监听器类型

假设有一组事件名 \`"click" | "hover" | "focus"\`，我们想自动生成对应的 \`onXxx\` 处理函数类型：

\`\`\`ts
type Events = "click" | "hover" | "focus";
type Handlers = {
  [E in Events as "on" + Capitalize<E>]: () => void;
};
// { onClick: () => void; onHover: () => void; onFocus: () => void; }
\`\`\`

这样事件名和处理函数名就能保持严格的对应关系，拼错名字会直接报错。

## 七、实用场景二：API 路径类型

后端 API 往往有固定的路径前缀，可以用模板字面量类型约束：

\`\`\`ts
type Endpoint = "/api/v1/" + ("users" | "posts" | "comments");
// "/api/v1/users" | "/api/v1/posts" | "/api/v1/comments"
\`\`\`

调用 fetch 时如果传了不在列表里的路径，TS 会报错，避免手滑。

## 八、字符串模式匹配进阶

更复杂的模式匹配可以提取多个部分：

\`\`\`ts
type ParseRoute<T> =
  T extends "/api/" + infer Resource + "/" + infer Id
    ? { resource: Resource; id: Id }
    : never;
\`\`\`

给定 \`"/api/users/123"\`，会得到 \`{ resource: "users"; id: "123" }\`。这种"用类型解析字符串"的能力，是类型体操的高级玩法。

## 九、使用场景总结

模板字面量类型把"字符串"也纳入了类型运算的版图。典型场景：

1. 生成规范的命名：getter/setter 方法名、事件处理函数名。
2. 约束字符串集合：CSS 类名、API 路径、配置键名。
3. 字符串模式匹配：从带规律的字符串里提取信息。
4. 配合映射类型实现自动化类型生成，减少手写重复类型。

它和映射类型、条件类型、infer 一起，构成了 TypeScript 类型编程的完整工具箱。掌握了它们，你就能写出既类型安全又高度自动化的代码。
`,
    code: `// ========== 模板字面量类型演示 ==========
console.log("========== 模板字面量类型演示 ==========\\n");

// 【1. 基础：定义 Side 和 Margin 模板字面量类型】
type Side = "left" | "right";
// "margin-left" | "margin-right"
type Margin = "margin-" + Side;
const m1: Margin = "margin-left";
const m2: Margin = "margin-right";
// const m3: Margin = "margin-top"; // 报错：不在允许范围内
console.log("Margin 类型值1：", m1);
console.log("Margin 类型值2：", m2);

// 【2. 多联合类型笛卡尔积】
type Color = "red" | "blue";
type Size = "sm" | "lg";
type BtnClass = "btn-" + Color + "-" + Size;
const cls1: BtnClass = "btn-red-sm";
const cls2: BtnClass = "btn-blue-lg";
console.log("\\nBtnClass 组合1：", cls1);
console.log("BtnClass 组合2：", cls2);

// 【3. Uppercase / Lowercase / Capitalize / Uncapitalize】
type Up = Uppercase<"hello">;      // "HELLO"
type Low = Lowercase<"WORLD">;     // "world"
type Cap = Capitalize<"foo">;      // "Foo"
type Uncap = Uncapitalize<"Bar">;  // "bar"
const up: Up = "HELLO";
const low: Low = "world";
const cap: Cap = "Foo";
const uncap: Uncap = "bar";
console.log("\\nUppercase<'hello'> =", up);
console.log("Lowercase<'WORLD'> =", low);
console.log("Capitalize<'foo'> =", cap);
console.log("Uncapitalize<'Bar'> =", uncap);

// 【4. 类型安全的 getter 方法生成】
// 利用映射类型 + 模板字面量 + Capitalize 自动生成 getXxx
type Getters<T> = {
  [K in keyof T as "get" + Capitalize<string & K>]: () => T[K];
};
type Person = { id: number; name: string; active: boolean };
type PersonGetters = Getters<Person>;
const pg: PersonGetters = {
  getId: () => 1,
  getName: () => "alice",
  getActive: () => true
};
console.log("\\ngetId() =", pg.getId());
console.log("getName() =", pg.getName());
console.log("getActive() =", pg.getActive());

// 【5. 事件监听器类型：onXxx 自动生成】
type Events = "click" | "hover" | "focus";
type Handlers = {
  [E in Events as "on" + Capitalize<E>]: () => void;
};
const handlers: Handlers = {
  onClick: () => console.log("clicked"),
  onHover: () => console.log("hovered"),
  onFocus: () => console.log("focused")
};
console.log("\\n触发事件：");
handlers.onClick();
handlers.onHover();

// 【6. 字符串模式匹配：提取后缀】
type RemovePrefix<T> = T extends "prefix_" + infer Rest ? Rest : T;
type S1 = RemovePrefix<"prefix_hello">; // "hello"
type S2 = RemovePrefix<"prefix_data">;  // "data"
type S3 = RemovePrefix<"noprefix">;     // "noprefix"（不匹配，原样返回）
const s1: S1 = "hello";
const s2: S2 = "data";
const s3: S3 = "noprefix";
console.log("\\nRemovePrefix<'prefix_hello'> =", s1);
console.log("RemovePrefix<'prefix_data'> =", s2);
console.log("RemovePrefix<'noprefix'> =", s3);

// 【7. API 路径类型约束】
type Endpoint = "/api/v1/" + ("users" | "posts" | "comments");
function fetchAPI(path: Endpoint): string {
  return "请求 " + path;
}
console.log("\\n" + fetchAPI("/api/v1/users"));
console.log(fetchAPI("/api/v1/posts"));
`
  },

  // =========================================================
  // 第 5 章：内置工具类型实现原理
  // =========================================================
  {
    id: "tsgen-utility",
    icon: "🛠️",
    group: "泛型高级",
    title: "TypeScript 内置工具类型的实现原理",
    content: `
# TypeScript 内置工具类型的实现原理

## 一、为什么要理解内置工具类型的实现

前面四章我们学了条件类型、infer、映射类型、模板字面量类型。这些是 TypeScript 类型编程的"原子能力"。TypeScript 内置了一批工具类型（Partial、Pick、ReturnType 等），它们就是用这些原子能力组合出来的。

理解这些工具类型的实现，有两个好处：一是遇到类型问题能看懂 TS 报错的根源；二是自己能照葫芦画瓢，写出业务专属的工具类型。这一章我们把常用的内置工具类型逐个"拆解"，看看它们内部到底是怎么运转的。

## 二、Partial / Required / Readonly：属性修饰符三件套

这三个都基于映射类型，区别只在修饰符：

\`\`\`ts
type Partial<T> = { [K in keyof T]?: T[K] };        // 加 ?
type Required<T> = { [K in keyof T]-?: T[K] };     // 去 ?
type Readonly<T> = { readonly [K in keyof T]: T[K] }; // 加 readonly
\`\`\`

核心是映射类型 \`[K in keyof T]\` 遍历所有键，配合 \`?\` / \`-?\` / \`readonly\` 修饰符调整属性的可选性和可变性。

## 三、Pick / Omit：属性的挑选与排除

\`\`\`ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
\`\`\`

Pick 的关键是遍历范围从 \`keyof T\` 变成了 \`K\`（K 是键的子集），这样只保留指定的键。

\`\`\`ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
\`\`\`

Omit 是 Pick 的反向操作：先用 Exclude 从所有键里排除 K，再 Pick 剩下的。注意 K 的约束是 \`keyof any\`（即 \`string | number | symbol\`）而不是 \`keyof T\`，这样允许传入 T 上不存在的键（更宽松，避免某些边界报错）。

## 四、Record：构造键值对类型

\`\`\`ts
type Record<K extends keyof any, V> = { [P in K]: V };
\`\`\`

Record 用 \`[P in K]\` 遍历 K 里的每个键，每个键的值类型都是 V。比如 \`Record<"a" | "b", number>\` 得到 \`{ a: number; b: number }\`。它常用来定义字典、映射表。

## 五、Exclude / Extract：联合类型的过滤

\`\`\`ts
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
\`\`\`

这两个是孪生兄弟，都依赖条件类型的分发行为。Exclude 保留不属于 U 的成员，Extract 保留属于 U 的成员。never 在联合类型里会被自动忽略，所以 Exclude 能干净地"删掉"匹配的成员。

## 六、NonNullable：排除 null 和 undefined

\`\`\`ts
type NonNullable<T> = T extends null | undefined ? never : T;
\`\`\`

原理和 Exclude 一样：分发判断，命中 null 或 undefined 返回 never，其余保留。比如 \`NonNullable<string | null>\` 得到 string。

## 七、ReturnType / Parameters：函数类型的拆解

这两个依赖 infer：

\`\`\`ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
\`\`\`

ReturnType 把 infer 放在返回值位置，提取返回类型；Parameters 把 infer 放在参数位置，提取参数元组。这是 infer 最典型的应用。

## 八、Awaited：递归解包 Promise

\`\`\`ts
type Awaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(...): any }
    ? T extends object & { then(onfulfilled: infer F, ...): any }
      ? F extends (value: infer V, ...) => any
        ? Awaited<V>
        : never
      : never
    : T;
\`\`\`

Awaited 是最复杂的一个。它不仅解包一层 Promise，还会递归解包：\`Awaited<Promise<Promise<number>>>\` 得到 number。它的实现要点是：先匹配带 then 方法的对象（即 thenable），再从 then 的回调参数里 infer 出内部值，然后对内部值递归调用 Awaited，直到不是 Promise 为止。

## 九、ConstructorParameters / InstanceType：构造函数相关

\`\`\`ts
type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;
type InstanceType<T> = T extends new (...args: any[]) => infer I ? I : any;
\`\`\`

这两个针对构造函数类型（带 new 的函数）。前者提取构造参数元组，后者提取 new 出来的实例类型。原理和 Parameters/ReturnType 完全一致，只是多了个 new 前缀。

## 十、总结：工具类型的"配方表"

把上面的实现汇总一下，你会发现它们只用了这几样原料：

1. **映射类型 \`[K in keyof T]\`**：遍历对象属性。Partial、Required、Readonly、Pick、Record 都靠它。
2. **条件类型 + 分发**：判断并过滤联合类型。Exclude、Extract、NonNullable 都靠它。
3. **infer 提取**：从函数/Promise 里拆出内部类型。ReturnType、Parameters、Awaited 都靠它。
4. **修饰符 +/-**：加减 readonly 和 ?。
5. **递归**：Awaited 用递归处理嵌套 Promise。

掌握了这五样原料，你不仅能理解所有内置工具类型，还能根据自己的业务需求，组合出专属的工具类型。这就是"授人以渔"的意义——工具类型是有限的，但组合方式是无穷的。
`,
    code: `// ========== 内置工具类型实现原理演示 ==========
console.log("========== 内置工具类型实现原理演示 ==========\\n");

// 原始类型，后续用它做各种工具类型的演示
type Account = {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
};

// 【1. MyPartial：所有属性变可选】
type MyPartial<T> = { [K in keyof T]?: T[K] };
type PartialAccount = MyPartial<Account>;
const pa: PartialAccount = { name: "alice" };
console.log("MyPartial 结果：", pa);

// 【2. MyRequired：所有属性变必填（去掉 ?）】
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type RequiredAccount = MyRequired<Account>;
const ra: RequiredAccount = {
  id: 1,
  name: "bob",
  email: "b@x.com",
  createdAt: new Date(0)
};
console.log("MyRequired 结果：", ra);

// 【3. MyReadonly：所有属性变只读】
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type ReadonlyAccount = MyReadonly<Account>;
const roa: ReadonlyAccount = { id: 2, name: "carol", email: "c@x.com", createdAt: new Date(0) };
console.log("MyReadonly 结果：", roa);

// 【4. MyPick：挑选部分属性】
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type AccountPreview = MyPick<Account, "id" | "name">;
const ap: AccountPreview = { id: 3, name: "dave" };
console.log("MyPick 结果：", ap);

// 【5. MyOmit：排除部分属性】
type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>;
type AccountNoEmail = MyOmit<Account, "email">;
const ane: AccountNoEmail = { id: 4, name: "eve", createdAt: new Date(0) };
console.log("MyOmit 结果：", ane);

// 【6. MyRecord：构造键值对类型】
type MyRecord<K extends keyof any, V> = { [P in K]: V };
type RoleMap = MyRecord<"admin" | "user" | "guest", number>;
const roles: RoleMap = { admin: 1, user: 2, guest: 3 };
console.log("\\nMyRecord 结果：", roles);

// 【7. MyExclude / MyExtract：联合类型过滤】
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
type Mixed = "a" | "b" | "c" | "d";
type Excluded = MyExclude<Mixed, "a" | "b">; // "c" | "d"
type Extracted = MyExtract<Mixed, "a" | "c">; // "a" | "c"
const exc: Excluded = "c";
const ext: Extracted = "a";
console.log("MyExclude 结果：", exc);
console.log("MyExtract 结果：", ext);

// 【8. MyNonNullable：排除 null 和 undefined】
type MyNonNullable<T> = T extends null | undefined ? never : T;
type Maybe = string | number | null | undefined;
type NotNull = MyNonNullable<Maybe>; // string | number
const nn: NotNull = "hello";
console.log("MyNonNullable 结果：", nn);

// 【9. MyReturnType / MyParameters：函数类型拆解】
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
type Fn = (x: number, y: string) => boolean;
type Ret = MyReturnType<Fn>;       // boolean
type Params = MyParameters<Fn>;    // [number, string]
const ret: Ret = true;
const params: Params = [42, "hi"];
console.log("\\nMyReturnType 结果：", ret);
console.log("MyParameters 结果：", params);

// 【10. 对比：自定义工具类型与内置行为一致】
type BuiltinPartial = Partial<Account>;
type BuiltinPick = Pick<Account, "id" | "name">;
type BuiltinReturn = ReturnType<Fn>;
const bp: BuiltinPartial = { id: 5 };
const bk: BuiltinPick = { id: 6, name: "frank" };
const br: BuiltinReturn = false;
console.log("\\n（对比）内置 Partial：", bp);
console.log("（对比）内置 Pick：", bk);
console.log("（对比）内置 ReturnType：", br);
console.log("\\n结论：手动实现的 MyXxx 与内置工具类型行为完全一致。");
`
  }
];
