// =============================================================
// TypeScript 全解 · Batch 5：高级类型（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 类型系统的"类型编程"能力：
//   1. 条件类型           tsbook-conditional-type
//   2. infer 关键字        tsbook-infer-keyword
//   3. 内置工具类型        tsbook-utility-types
//   4. 模板字面量类型      tsbook-template-literal
//   5. keyof 与 typeof     tsbook-keyof-typeof
// 章节归属 group：高级类型
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：条件类型
  // ===========================================================
  {
    id: "tsbook-conditional-type",
    title: "条件类型",
    icon: "🔀",
    group: "高级类型",
    content: `# 🔀 条件类型

条件类型是类型层面的 **if-else**：根据类型之间的关系选择不同分支。它让 TypeScript 的类型系统具备了"逻辑判断"能力，是高级类型编程的基石。

## 一、基本语法：\`T extends U ? X : Y\`

读作："如果 T 能赋值给 U，则类型为 X，否则为 Y"。

\`\`\`ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;        // false
\`\`\`

注意：\`extends\` 在这里是**可赋值性判断**，不是继承。 \`T extends U\` 等价于"类型 T 能否安全赋值给类型 U"。

## 二、分布式条件类型

当 T 是**裸类型参数**（直接用 T，不被包装）且传入的是联合类型时，条件类型会**分发**到联合的每个成员：

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;

type R = ToArray<string | number>;
// 等价于 ToArray<string> | ToArray<number>
// = string[] | number[]
\`\`\`

**触发条件**：
1. T 必须是裸类型参数（直接用 T，不能是 \`[T]\` 或 \`T[]\` 等包装形式）
2. 传入的实参必须是联合类型

## 三、阻止分发：用元组包裹

\`\`\`ts
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type R = ToArrayNonDist<string | number>;
// = (string | number)[]，不分发
\`\`\`

\`[T]\` 把 T 装进元组，T 不再是"裸"的，分发被阻止。

## 四、手写 Exclude

\`\`\`ts
type MyExclude<T, U> = T extends U ? never : T;

type R = MyExclude<"a" | "b" | "c", "a">;  // "b" | "c"
\`\`\`

利用分布式条件类型：对每个成员判断，匹配 U 的返回 \`never\`，联合类型自动忽略 \`never\`。

## 五、手写 ReturnType（配合 infer）

\`\`\`ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

\`infer R\` 在条件类型中"捕获"返回值类型——下一章详细讲。

## 六、小结

- 条件类型 = 类型层面的 if-else
- 分布式条件类型：裸类型参数 + 联合类型 → 自动分发
- 用 \`[T]\` 阻止分发
- 是 Exclude、Extract、ReturnType 等工具类型的实现基础

> *下一章，infer 关键字——类型系统的模式匹配。*`,
    code: `// 🔀 条件类型 Demo

// ============================================================
// 1️⃣ 基本条件类型：T extends U ? X : Y
// ============================================================

// 判断 T 是否是 string 类型
type IsString<T> = T extends string ? true : false;

type T1 = IsString<"hello">;  // true
type T2 = IsString<42>;       // false

const a1: T1 = true;     // 推导为 true 字面量
const a2: T2 = false;    // 推导为 false 字面量
console.log("--- 1️⃣ IsString ---");
console.log("IsString<'hello'> =", a1);
console.log("IsString<42>      =", a2);

// ============================================================
// 2️⃣ 分布式条件类型：裸类型参数 + 联合类型
// ============================================================

// T 是裸类型参数（直接用 T，没包装）
type ToArray<T> = T extends any ? T[] : never;

// 联合类型会分发：string | number -> string[] | number[]
type Arr1 = ToArray<string | number>;

const arr1: Arr1 = ["a"];    // ✅ string[] 分支
const arr2: Arr1 = [1];      // ✅ number[] 分支
// const arr3: Arr1 = ["a", 1];  // ❌ 不能混合，因为是 string[] | number[]
console.log("--- 2️⃣ 分布式条件类型 ---");
console.log("ToArray<string|number> arr1 =", arr1);
console.log("ToArray<string|number> arr2 =", arr2);

// ============================================================
// 3️⃣ 阻止分发：用 [T] 包裹
// ============================================================

// [T] 让 T 不再是裸类型参数，阻止分发
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

// 结果是 (string | number)[]，不分发
type Arr2 = ToArrayNonDist<string | number>;

const arr3: Arr2 = ["a", 1];   // ✅ 可以混合，因为是 (string | number)[]
console.log("--- 3️⃣ 阻止分发 ---");
console.log("ToArrayNonDist<string|number> =", arr3);

// ============================================================
// 4️⃣ 手写 Exclude：T extends U ? never : T
// ============================================================

// 分布式：对联合的每个成员判断，匹配 U 的返回 never（被联合忽略）
type MyExclude<T, U> = T extends U ? never : T;

// 从联合类型中排除 U 部分
type T4 = MyExclude<"a" | "b" | "c", "a">;  // "b" | "c"

const x1: T4 = "b";
const x2: T4 = "c";
// const x3: T4 = "a";  // ❌ "a" 已被排除
console.log("--- 4️⃣ MyExclude ---");
console.log("MyExclude<'a'|'b'|'c', 'a'> =", x1, "or", x2);

// ============================================================
// 5️⃣ 手写 Extract：T extends U ? T : never
// ============================================================

// 提取联合类型中匹配 U 的成员
type MyExtract<T, U> = T extends U ? T : never;

type T5 = MyExtract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"

const y1: T5 = "a";
const y2: T5 = "b";
// const y3: T5 = "c";  // ❌ "c" 不在 U 中
console.log("--- 5️⃣ MyExtract ---");
console.log("MyExtract<'a'|'b'|'c', 'a'|'b'> =", y1, "or", y2);

// ============================================================
// 6️⃣ 手写 ReturnType：配合 infer 捕获返回值
// ============================================================

// infer R 捕获函数返回值类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(): string { return "hello"; }
function add(a: number, b: number): number { return a + b; }

type R1 = MyReturnType<typeof greet>;  // string
type R2 = MyReturnType<typeof add>;    // number

const r1: R1 = "hi";
const r2: R2 = 42;
console.log("--- 6️⃣ MyReturnType ---");
console.log("ReturnType<typeof greet> =", r1);
console.log("ReturnType<typeof add>   =", r2);

// ============================================================
// 7️⃣ 综合实战：根据入参类型返回不同类型
// ============================================================

// 如果 T 是数组，返回元素类型；否则原样返回
type UnwrapArray<T> = T extends Array<infer U> ? U : T;

type U1 = UnwrapArray<number[]>;    // number
type U2 = UnwrapArray<string>;      // string
type U3 = UnwrapArray<boolean[]>;   // boolean

const u1: U1 = 100;
const u2: U2 = "hi";
const u3: U3 = true;
console.log("--- 7️⃣ UnwrapArray ---");
console.log("UnwrapArray<number[]>  =", u1);
console.log("UnwrapArray<string>    =", u2);
console.log("UnwrapArray<boolean[]> =", u3);

// ============================================================
// 8️⃣ 嵌套条件类型：类型层面的 if-else if-else
// ============================================================

// 根据类型返回对应标签
type TypeLabel<T> =
  T extends string ? "字符串" :
  T extends number ? "数字" :
  T extends boolean ? "布尔" :
  "其他";

type L1 = TypeLabel<string>;    // "字符串"
type L2 = TypeLabel<number>;    // "数字"
type L3 = TypeLabel<boolean>;   // "布尔"
type L4 = TypeLabel<string[]>;  // "其他"

const l1: L1 = "字符串";
const l2: L2 = "数字";
const l3: L3 = "布尔";
const l4: L4 = "其他";
console.log("--- 8️⃣ 嵌套条件类型 ---");
console.log("TypeLabel<string>    =", l1);
console.log("TypeLabel<number>    =", l2);
console.log("TypeLabel<boolean>   =", l3);
console.log("TypeLabel<string[]>  =", l4);
`,
  },

  // ===========================================================
  // 第 2 章：infer 关键字
  // ===========================================================
  {
    id: "tsbook-infer-keyword",
    title: "infer 关键字",
    icon: "🎯",
    group: "高级类型",
    content: `# 🎯 infer 关键字

\`infer\` 是 TypeScript 类型系统的**模式匹配**：在条件类型的 \`extends\` 子句中声明一个类型变量，让编译器"推断"出某个位置的类型。

## 一、基本语法

\`\`\`ts
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

\`infer R\` 的含义："如果 T 能匹配 \`(...) => R\` 这个模式，就把返回值位置的类型捕获到 R 里"。

## 二、infer 是类型系统的"解构"

JavaScript 的解构从值里取值：

\`\`\`js
const { name } = obj;     // 从对象里取 name
const [first] = arr;       // 从数组里取第一个
\`\`\`

\`infer\` 在类型层面做同样的事：

\`\`\`ts
type First<T> = T extends [infer F, ...any[]] ? F : never;
type R = First<[number, string, boolean]>;  // number
\`\`\`

## 三、常见用法

| 位置 | 写法 | 推断内容 |
|------|------|---------|
| 函数返回值 | \`(...args) => infer R\` | 返回值类型 |
| 函数参数 | \`(...args: infer P) => any\` | 参数元组 |
| 数组首元素 | \`[infer F, ...any[]]\` | 第一个元素 |
| Promise 值 | \`Promise<infer V>\` | 内部值类型 |
| 模板字面量 | \`\${infer Head}\${infer Tail}\` | 拆分字符串 |

## 四、ReturnType 实现

\`\`\`ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

## 五、Parameters 实现

\`\`\`ts
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
\`\`\`

## 六、Awaited 实现（递归 infer）

\`\`\`ts
type MyAwaited<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? MyAwaited<V>     // 递归解 Promise
    : V
  : T;
\`\`\`

递归 infer 能解开嵌套 Promise： \`Promise<Promise<number>>\` → \`number\`。

## 七、First 实现

\`\`\`ts
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
\`\`\`

## 八、小结

- \`infer R\` 在条件类型中"捕获"类型
- 是类型系统的解构赋值
- 函数返回值/参数、数组、Promise、字符串都能 infer
- 配合递归可以处理嵌套结构

> *下一章，内置工具类型一览。*`,
    code: `// 🎯 infer 关键字 Demo

// ============================================================
// 1️⃣ ReturnType：infer 函数返回值
// ============================================================

// infer R 捕获函数返回值类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUserId(): number { return 42; }
function getUserName(): string { return "Alice"; }

type R1 = MyReturnType<typeof getUserId>;   // number
type R2 = MyReturnType<typeof getUserName>; // string

const r1: R1 = 42;
const r2: R2 = "Alice";
console.log("--- 1️⃣ ReturnType ---");
console.log("ReturnType<typeof getUserId>   =", r1);
console.log("ReturnType<typeof getUserName> =", r2);

// ============================================================
// 2️⃣ Parameters：infer 函数参数元组
// ============================================================

// infer P 捕获函数参数元组
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

type CreateUserParams = MyParameters<typeof createUser>;
// [string, number, string]

const params: CreateUserParams = ["Alice", 30, "a@b.com"];
console.log("--- 2️⃣ Parameters ---");
console.log("Parameters<typeof createUser> =", params);

// ============================================================
// 3️⃣ First：infer 数组首元素
// ============================================================

// [infer F, ...any[]] 捕获元组第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

type F1 = First<[number, string, boolean]>;  // number
type F2 = First<["a", "b", "c"]>;             // "a"
type F3 = First<[]>;                          // never（空数组无首元素）

const f1: F1 = 42;
const f2: F2 = "a";
console.log("--- 3️⃣ First ---");
console.log("First<[number, string, boolean]> =", f1);
console.log("First<['a','b','c']>             =", f2);

// ============================================================
// 4️⃣ Awaited：递归 infer 解 Promise
// ============================================================

// 递归解 Promise：如果是 Promise<Promise<X>> 就继续解
type MyAwaited<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? MyAwaited<V>   // 递归解嵌套 Promise
    : V
  : T;

type A1 = MyAwaited<Promise<number>>;              // number
type A2 = MyAwaited<Promise<Promise<string>>>;     // string
type A3 = MyAwaited<number>;                       // number（非 Promise 原样返回）

const a1: A1 = 42;
const a2: A2 = "hello";
const a3: A3 = 100;
console.log("--- 4️⃣ Awaited ---");
console.log("Awaited<Promise<number>>           =", a1);
console.log("Awaited<Promise<Promise<string>>>  =", a2);
console.log("Awaited<number>                    =", a3);

// ============================================================
// 5️⃣ Last：infer 数组末元素
// ============================================================

// [...any[], infer L] 捕获元组最后一个元素
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type L1 = Last<[number, string, boolean]>;  // boolean
type L2 = Last<["a", "b", "c"]>;             // "c"

const l1: L1 = true;
const l2: L2 = "c";
console.log("--- 5️⃣ Last ---");
console.log("Last<[number, string, boolean]> =", l1);
console.log("Last<['a','b','c']>             =", l2);

// ============================================================
// 6️⃣ UnwrapPromise：解单层 Promise
// ============================================================

// 简化版：直接解一层 Promise
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;

type P1 = UnwrapPromise<Promise<boolean>>;  // boolean
type P2 = UnwrapPromise<string>;            // string（非 Promise 原样返回）

const p1: P1 = true;
const p2: P2 = "hello";
console.log("--- 6️⃣ UnwrapPromise ---");
console.log("UnwrapPromise<Promise<boolean>> =", p1);
console.log("UnwrapPromise<string>           =", p2);

// ============================================================
// 7️⃣ 字符串拆分：infer 在模板字面量类型中
// ============================================================

// 提取字符串第一部分（到 "-" 之前）
type BeforeDash<S extends string> = S extends \`\${infer Head}-\${string}\` ? Head : S;

type B1 = BeforeDash<"user-name">;  // "user"
type B2 = BeforeDash<"hello">;       // "hello"（没有 -，原样返回）

const b1: B1 = "user";
const b2: B2 = "hello";
console.log("--- 7️⃣ BeforeDash ---");
console.log("BeforeDash<'user-name'> =", b1);
console.log("BeforeDash<'hello'>     =", b2);

// ============================================================
// 8️⃣ 综合实战：提取构造函数的实例类型
// ============================================================

// 推断构造函数的实例类型
type MyInstanceType<T extends new (...args: any[]) => any> =
  T extends new (...args: any[]) => infer I ? I : never;

class Dog {
  constructor(public name: string) {}
  bark(): string { return "汪！"; }
}

type DogInstance = MyInstanceType<typeof Dog>;  // Dog

const dog: DogInstance = new Dog("小白");
console.log("--- 8️⃣ MyInstanceType ---");
console.log("InstanceType<typeof Dog> =", dog.name, "| bark =", dog.bark());
`,
  },

  // ===========================================================
  // 第 3 章：内置工具类型
  // ===========================================================
  {
    id: "tsbook-utility-types",
    title: "内置工具类型",
    icon: "🧰",
    group: "高级类型",
    content: `# 🧰 内置工具类型

TypeScript 内置了一批开箱即用的工具类型，覆盖了类型变换的常见场景。掌握它们能让你少写大量样板代码。

## 一、对象类型工具

| 工具类型 | 作用 | 示例 |
|---------|------|------|
| \`Partial<T>\` | 所有属性变可选 | \`Partial<User>\` |
| \`Required<T>\` | 所有属性变必填 | \`Required<OptionalUser>\` |
| \`Readonly<T>\` | 所有属性只读 | \`Readonly<User>\` |
| \`Pick<T, K>\` | 挑选部分 key | \`Pick<User, "name" | "age">\` |
| \`Omit<T, K>\` | 排除部分 key | \`Omit<User, "email">\` |
| \`Record<K, V>\` | 构造键值对类型 | \`Record<string, User>\` |

## 二、联合类型工具

| 工具类型 | 作用 |
|---------|------|
| \`Exclude<T, U>\` | 从 T 中排除可赋值给 U 的成员 |
| \`Extract<T, U>\` | 从 T 中提取可赋值给 U 的成员 |
| \`NonNullable<T>\` | 排除 null 和 undefined |

## 三、函数相关工具

| 工具类型 | 作用 |
|---------|------|
| \`ReturnType<T>\` | 获取函数返回值类型 |
| \`Parameters<T>\` | 获取函数参数元组类型 |
| \`ConstructorParameters<T>\` | 构造函数参数类型 |
| \`InstanceType<T>\` | 构造函数实例类型 |

## 四、字符串工具

| 工具类型 | 作用 |
|---------|------|
| \`Uppercase<S>\` | 转大写 |
| \`Lowercase<S>\` | 转小写 |
| \`Capitalize<S>\` | 首字母大写 |
| \`Uncapitalize<S>\` | 首字母小写 |

## 五、其他

| 工具类型 | 作用 |
|---------|------|
| \`Awaited<T>\` | 解开 Promise（递归） |
| \`ThisType<T>\` | 标注 this 类型（需开启 noImplicitThis） |

## 六、组合使用

\`\`\`ts
type UpdateUser = Partial<Pick<User, "name" | "age">>;
// { name?: string; age?: number }
\`\`\`

工具类型可以任意组合，组成复杂变换。

## 七、小结

- 工具类型 = 类型层面的"内置函数"
- 不用自己造轮子，先用内置的
- 可组合：\`Partial<Pick<T, K>>\` 这种链式调用很常见

> *下一章，模板字面量类型——字符串层面的类型编程。*`,
    code: `// 🧰 内置工具类型 Demo

// ============================================================
// 准备：User 类型作为后续示例的基础
// ============================================================

interface User {
  name: string;
  age: number;
  email: string;
}

console.log("--- 准备：User ---");
console.log("User = { name, age, email }");

// ============================================================
// 1️⃣ Partial：所有属性变可选
// ============================================================

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string }

const u1: PartialUser = { name: "Alice" };  // 只填 name 也行
console.log("--- 1️⃣ Partial ---");
console.log("Partial<User> =", u1);

// ============================================================
// 2️⃣ Required：所有属性变必填（移除 ?）
// ============================================================

type OptionalUser = { name?: string; age?: number };
type RequiredUser = Required<OptionalUser>;
// { name: string; age: number }

const u2: RequiredUser = { name: "Alice", age: 30 };
// const u3: RequiredUser = { name: "Alice" };  // ❌ age 必填
console.log("--- 2️⃣ Required ---");
console.log("Required<OptionalUser> =", u2);

// ============================================================
// 3️⃣ Readonly：所有属性只读
// ============================================================

type ReadonlyUser = Readonly<User>;

const u3: ReadonlyUser = { name: "Alice", age: 30, email: "a@b.com" };
// u3.name = "Bob";  // ❌ 只读不可改
console.log("--- 3️⃣ Readonly ---");
console.log("Readonly<User> =", u3);

// ============================================================
// 4️⃣ Pick：挑选部分 key
// ============================================================

type UserNameAge = Pick<User, "name" | "age">;
// { name: string; age: number }

const u4: UserNameAge = { name: "Bob", age: 25 };
console.log("--- 4️⃣ Pick ---");
console.log("Pick<User, 'name'|'age'> =", u4);

// ============================================================
// 5️⃣ Omit：排除部分 key
// ============================================================

type UserWithoutEmail = Omit<User, "email">;
// { name: string; age: number }

const u5: UserWithoutEmail = { name: "Bob", age: 25 };
console.log("--- 5️⃣ Omit ---");
console.log("Omit<User, 'email'> =", u5);

// ============================================================
// 6️⃣ Record：构造键值对类型
// ============================================================

type UserMap = Record<string, User>;

const users: UserMap = {
  alice: { name: "Alice", age: 30, email: "a@b.com" },
  bob: { name: "Bob", age: 25, email: "c@d.com" },
};
console.log("--- 6️⃣ Record ---");
console.log("Record<string, User> =", users);

// ============================================================
// 7️⃣ Exclude / Extract / NonNullable：联合类型操作
// ============================================================

type Mixed = "a" | "b" | "c" | 1 | 2;

type Excluded = Exclude<Mixed, "a" | "b">;     // "c" | 1 | 2
type Extracted = Extract<Mixed, string>;        // "a" | "b" | "c"
type NonNull = NonNullable<string | null | undefined>;  // string

const ex: Excluded = 1;
const et: Extracted = "a";
const nn: NonNull = "hello";
console.log("--- 7️⃣ Exclude / Extract / NonNullable ---");
console.log("Exclude<Mixed, 'a'|'b'>                  =", ex);
console.log("Extract<Mixed, string>                   =", et);
console.log("NonNullable<string|null|undefined>       =", nn);

// ============================================================
// 8️⃣ ReturnType / Parameters：函数相关
// ============================================================

function greet(name: string, greeting: string): string {
  return greeting + ", " + name + "!";
}

type GreetReturn = ReturnType<typeof greet>;      // string
type GreetParams = Parameters<typeof greet>;      // [string, string]

const ret: GreetReturn = "Hello, Alice!";
const ps: GreetParams = ["Alice", "Hi"];
console.log("--- 8️⃣ ReturnType / Parameters ---");
console.log("ReturnType<typeof greet> =", ret);
console.log("Parameters<typeof greet> =", ps);

// ============================================================
// 9️⃣ ConstructorParameters / InstanceType
// ============================================================

class Dog {
  constructor(public name: string, public age: number) {}
  bark(): string { return "汪！"; }
}

type DogCtorParams = ConstructorParameters<typeof Dog>;  // [string, number]
type DogInstance = InstanceType<typeof Dog>;              // Dog

const dp: DogCtorParams = ["小白", 3];
const di: DogInstance = new Dog(...dp);
console.log("--- 9️⃣ ConstructorParameters / InstanceType ---");
console.log("ConstructorParams =", dp);
console.log("InstanceType bark =", di.bark());

// ============================================================
// 🔟 Awaited：解开 Promise
// ============================================================

type AwaitedNum = Awaited<Promise<number>>;             // number
type AwaitedNested = Awaited<Promise<Promise<string>>>; // string

const an: AwaitedNum = 42;
const ans: AwaitedNested = "hello";
console.log("--- 🔟 Awaited ---");
console.log("Awaited<Promise<number>>           =", an);
console.log("Awaited<Promise<Promise<string>>>  =", ans);

// ============================================================
// 1️⃣1️⃣ 字符串工具类型：Uppercase / Lowercase / Capitalize / Uncapitalize
// ============================================================

type Upper = Uppercase<"hello">;          // "HELLO"
type Lower = Lowercase<"WORLD">;          // "world"
type Cap = Capitalize<"foo">;             // "Foo"
type Uncap = Uncapitalize<"Bar">;         // "bar"

const up: Upper = "HELLO";
const lo: Lower = "world";
const cp: Cap = "Foo";
const uc: Uncap = "bar";
console.log("--- 1️⃣1️⃣ 字符串工具 ---");
console.log("Uppercase<'hello'>    =", up);
console.log("Lowercase<'WORLD'>    =", lo);
console.log("Capitalize<'foo'>     =", cp);
console.log("Uncapitalize<'Bar'>   =", uc);

// ============================================================
// 1️⃣2️⃣ 组合使用：Partial + Pick
// ============================================================

type UpdateUser = Partial<Pick<User, "name" | "age">>;
// { name?: string; age?: number }

const update: UpdateUser = { name: "NewName" };
console.log("--- 1️⃣2️⃣ 组合 ---");
console.log("Partial<Pick<User, 'name'|'age'>> =", update);
`,
  },

  // ===========================================================
  // 第 4 章：模板字面量类型
  // ===========================================================
  {
    id: "tsbook-template-literal",
    title: "模板字面量类型",
    icon: "📝",
    group: "高级类型",
    content: `# 📝 模板字面量类型

模板字面量类型 = **字符串字面量类型 + 类型变量**。它能让你在类型层面"拼接字符串"，是构建 DSL（领域特定语言）类型的核心工具。

## 一、基本语法

\`\`\`ts
type Greeting = \`Hello, \${string}!\`;

const g1: Greeting = "Hello, Alice!";   // ✅
const g2: Greeting = "Hi, Alice!";      // ❌ 必须以 Hello, 开头
\`\`\`

\`Hello, \${string}!\` 是一个模板字面量类型：\`\${string}\` 是占位符，可以是任意 string。

## 二、联合类型展开

当占位符是联合类型时，结果会**笛卡尔积**展开：

\`\`\`ts
type Side = "top" | "right" | "bottom" | "left";
type Margin = \`margin-\${Side}\`;
// "margin-top" | "margin-right" | "margin-bottom" | "margin-left"
\`\`\`

## 三、配合 Uppercase / Lowercase

\`\`\`ts
type Event = "click" | "hover";
type Handler = \`on\${Capitalize<Event>}\`;
// "onClick" | "onHover"
\`\`\`

## 四、字符串拆分：infer 配合

\`\`\`ts
type BeforeDash<S extends string> =
  S extends \`\${infer Head}-\${string}\` ? Head : S;
\`\`\`

\`infer\` 在模板字面量里能"捕获"任意子串，配合递归可以拆分字符串。

## 五、典型应用

### 1. 事件处理器命名

\`\`\`ts
type EventName = "click" | "change" | "submit";
type Handler = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onChange" | "onSubmit"
\`\`\`

### 2. CSS 属性约束

\`\`\`ts
type Side = "top" | "left" | "right" | "bottom";
type CSS = \`\${"margin" | "padding"}-\${Side}\`;
\`\`\`

### 3. 路由路径类型

\`\`\`ts
type Route = \`/users/\${number}\` | \`/posts/\${number}\`;
\`\`\`

## 六、小结

- 模板字面量类型 = 字符串字面量 + 类型变量
- 联合类型会笛卡尔展开
- 配合 Uppercase/Lowercase/Capitalize 转换大小写
- 配合 infer 可以拆分字符串
- 适合构建 DSL 类型（事件名、CSS、路由等）

> *下一章，keyof 与 typeof 操作符。*`,
    code: `// 📝 模板字面量类型 Demo

// ============================================================
// 1️⃣ 基本模板字面量类型
// ============================================================

type Greeting = \`Hello, \${string}!\`;  // 模板字面量类型：占位符是 string

const g1: Greeting = "Hello, Alice!";   // ✅ 符合模式
const g2: Greeting = "Hello, Bob!";     // ✅ 符合模式
// const g3: Greeting = "Hi, Alice!";   // ❌ 不以 "Hello, " 开头
console.log("--- 1️⃣ 基本模板字面量 ---");
console.log("Greeting 1 =", g1);
console.log("Greeting 2 =", g2);

// ============================================================
// 2️⃣ 联合类型展开：笛卡尔积
// ============================================================

type Side = "top" | "right" | "bottom" | "left";
type Margin = \`margin-\${Side}\`;
// "margin-top" | "margin-right" | "margin-bottom" | "margin-left"

const m1: Margin = "margin-top";
const m2: Margin = "margin-left";
// const m3: Margin = "margin-center";  // ❌ Side 不含 center
console.log("--- 2️⃣ 联合展开 ---");
console.log("Margin 1 =", m1);
console.log("Margin 2 =", m2);

// ============================================================
// 3️⃣ 事件处理器命名：on + Capitalize<EventName>
// ============================================================

type EventName = "click" | "change" | "submit";
type Handler = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onChange" | "onSubmit"

const h1: Handler = "onClick";
const h2: Handler = "onChange";
const h3: Handler = "onSubmit";
// const h4: Handler = "onclick";  // ❌ 必须是 onClick（首字母大写）
console.log("--- 3️⃣ 事件处理器 ---");
console.log("Handler =", h1, h2, h3);

// ============================================================
// 4️⃣ CSS 属性约束：margin | padding + 方向
// ============================================================

type CSSProp = \`\${"margin" | "padding"}-\${Side}\`;
// "margin-top" | "margin-right" | "margin-bottom" | "margin-left"
// "padding-top" | "padding-right" | "padding-bottom" | "padding-left"

const css1: CSSProp = "margin-top";
const css2: CSSProp = "padding-bottom";
// const css3: CSSProp = "border-top";  // ❌ 前缀不在 "margin" | "padding" 中
console.log("--- 4️⃣ CSS 属性 ---");
console.log("CSSProp 1 =", css1);
console.log("CSSProp 2 =", css2);

// ============================================================
// 5️⃣ 路由路径类型：用 number 约束 id
// ============================================================

type Route = \`/users/\${number}\` | \`/posts/\${number}\`;
// "/users/1" | "/users/42" | "/posts/1" ...

const r1: Route = "/users/1";
const r2: Route = "/posts/42";
// const r3: Route = "/users/abc";  // ❌ id 部分必须是数字
console.log("--- 5️⃣ 路由路径 ---");
console.log("Route 1 =", r1);
console.log("Route 2 =", r2);

// ============================================================
// 6️⃣ 字符串拆分：infer 配合
// ============================================================

// 提取 "user-name" 中 "-" 之前的部分
type BeforeDash<S extends string> =
  S extends \`\${infer Head}-\${string}\` ? Head : S;

type B1 = BeforeDash<"user-name">;  // "user"
type B2 = BeforeDash<"age">;         // "age"（没有 -，原样返回）

const b1: B1 = "user";
const b2: B2 = "age";
console.log("--- 6️⃣ 字符串拆分 ---");
console.log("BeforeDash<'user-name'> =", b1);
console.log("BeforeDash<'age'>       =", b2);

// ============================================================
// 7️⃣ 综合实战：kebab-case 转 camelCase
// ============================================================

// 递归把 "a-b-c" 转成 "aBC"
type CamelCase<S extends string> =
  S extends \`\${infer Head}-\${infer Char}\${infer Rest}\`
    ? \`\${Head}\${Uppercase<Char>}\${CamelCase<Rest>}\`
    : S;

type C1 = CamelCase<"user-name">;        // "userName"
type C2 = CamelCase<"background-color">; // "backgroundColor"
type C3 = CamelCase<"font-size">;        // "fontSize"

const c1: C1 = "userName";
const c2: C2 = "backgroundColor";
const c3: C3 = "fontSize";
console.log("--- 7️⃣ CamelCase ---");
console.log("CamelCase<'user-name'>        =", c1);
console.log("CamelCase<'background-color'> =", c2);
console.log("CamelCase<'font-size'>        =", c3);

// ============================================================
// 8️⃣ 综合实战：根据对象 key 生成 setter 函数名
// ============================================================

interface Settings {
  theme: string;
  fontSize: number;
  language: string;
}

// 生成 "setTheme" | "setFontSize" | "setLanguage"
type SetterName<K extends string> = \`set\${Capitalize<K>}\`;
type SettingsSetter = SetterName<keyof Settings & string>;

const setters: SettingsSetter[] = ["setTheme", "setFontSize", "setLanguage"];
console.log("--- 8️⃣ Setter 名生成 ---");
console.log("SettingsSetter =", setters);
`,
  },

  // ===========================================================
  // 第 5 章：keyof 与 typeof 操作符
  // ===========================================================
  {
    id: "tsbook-keyof-typeof",
    title: "keyof 与 typeof 操作符",
    icon: "🔑",
    group: "高级类型",
    content: `# 🔑 keyof 与 typeof 操作符

\`keyof\` 和 \`typeof\` 是 TypeScript 类型查询的两大入口：\`keyof\` 从**类型**里提取 key，\`typeof\` 从**值**里提取类型。

## 一、\`keyof T\`：提取类型的 key

\`\`\`ts
interface User {
  name: string;
  age: number;
}

type UserKeys = keyof User;  // "name" | "age"
\`\`\`

\`keyof\` 作用于**类型**，结果是该类型所有 key 的联合。

## 二、\`typeof v\`：从值提取类型

\`\`\`ts
const config = {
  port: 3000,
  host: "localhost",
};

type Config = typeof config;
// { port: number; host: string }
\`\`\`

\`typeof\` 作用于**值**，结果是该值的类型。常用于把对象字面量"提升"为类型。

## 三、keyof + typeof 组合

\`\`\`ts
const config = { port: 3000, host: "localhost" };

type ConfigKeys = keyof typeof config;
// "port" | "host"
\`\`\`

\`typeof config\` 得到对象类型，再 \`keyof\` 得到 key 联合。这是从对象值反向得到 key 类型最常用的写法。

## 四、enum 的 keyof

\`\`\`ts
enum Color { Red, Green, Blue }

type ColorKey = keyof typeof Color;
// "Red" | "Green" | "Blue"
\`\`\`

enum 既是类型也是值，\`typeof Color\` 是它的"值类型"，\`keyof\` 得到所有成员名。

## 五、验证函数：典型场景

\`\`\`ts
const config = { port: 3000, host: "localhost" };

function validate(key: keyof typeof config, value: any) {
  // key 只能是 "port" 或 "host"
}

validate("port", 8080);   // ✅
validate("host", "x");    // ✅
validate("foo", 1);        // ❌ "foo" 不是合法 key
\`\`\`

## 六、小结

| 操作符 | 作用对象 | 结果 |
|--------|---------|------|
| \`keyof T\` | 类型 | key 的联合 |
| \`typeof v\` | 值 | 值的类型 |
| \`keyof typeof v\` | 值 | 该值所有 key 的联合 |

- \`keyof\` 从类型取 key
- \`typeof\` 从值取类型
- 两者常组合：\`keyof typeof obj\`

> *TypeScript 类型系统的核心操作符到这里就完整了，下一 batch 进入类型体操实战。*`,
    code: `// 🔑 keyof 与 typeof 操作符 Demo

// ============================================================
// 1️⃣ keyof：从类型提取 key
// ============================================================

interface User {
  name: string;
  age: number;
  email: string;
}

type UserKeys = keyof User;  // "name" | "age" | "email"

const k1: UserKeys = "name";
const k2: UserKeys = "age";
const k3: UserKeys = "email";
// const k4: UserKeys = "phone";  // ❌ "phone" 不是 User 的 key
console.log("--- 1️⃣ keyof ---");
console.log("UserKeys =", k1, k2, k3);

// ============================================================
// 2️⃣ typeof：从值提取类型
// ============================================================

const config = {
  port: 3000,
  host: "localhost",
  debug: true,
};

type Config = typeof config;
// { port: number; host: string; debug: boolean }

const c1: Config = { port: 8080, host: "0.0.0.0", debug: false };
console.log("--- 2️⃣ typeof ---");
console.log("Config =", c1);

// ============================================================
// 3️⃣ keyof + typeof 组合：PropKeys
// ============================================================

type PropKeys = keyof typeof config;
// "port" | "host" | "debug"

const pk1: PropKeys = "port";
const pk2: PropKeys = "host";
const pk3: PropKeys = "debug";
// const pk4: PropKeys = "foo";  // ❌ 不是 config 的 key
console.log("--- 3️⃣ keyof typeof ---");
console.log("PropKeys =", pk1, pk2, pk3);

// ============================================================
// 4️⃣ ConfigKeys：从配置对象反向得到 key 类型
// ============================================================

const routes = {
  home: "/",
  about: "/about",
  contact: "/contact",
};

type RouteKey = keyof typeof routes;  // "home" | "about" | "contact"

function navigate(route: RouteKey): string {
  return routes[route];   // 用 key 索引取值，类型安全
}

console.log("--- 4️⃣ ConfigKeys ---");
console.log("navigate('home')   =", navigate("home"));
console.log("navigate('about')  =", navigate("about"));
// navigate("foo");  // ❌ "foo" 不是合法 route

// ============================================================
// 5️⃣ enum 的 keyof
// ============================================================

enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

type ColorKey = keyof typeof Color;
// "Red" | "Green" | "Blue"（成员名，不是成员值）

const ck: ColorKey = "Red";
console.log("--- 5️⃣ enum keyof ---");
console.log("ColorKey =", ck, "| Color[ck] =", Color[ck]);

// enum 既是类型也是值：用模板字面量类型取成员值
type ColorValue = \`\${Color}\`;  // "RED" | "GREEN" | "BLUE"
const cv: ColorValue = "RED";
console.log("ColorValue =", cv);

// ============================================================
// 6️⃣ 验证函数：保证 key 合法
// ============================================================

const settings = {
  theme: "dark",
  fontSize: 14,
  language: "zh-CN",
};

// 验证函数：key 必须是 settings 的合法属性
function validateSetting(
  key: keyof typeof settings,
  value: string | number,
): boolean {
  const current = settings[key as keyof typeof settings];
  console.log("  验证 " + key + ": 旧值=" + JSON.stringify(current) + ", 新值=" + JSON.stringify(value));
  return true;
}

console.log("--- 6️⃣ 验证函数 ---");
validateSetting("theme", "light");
validateSetting("fontSize", 16);
// validateSetting("foo", "x");  // ❌ "foo" 不是合法 key

// ============================================================
// 7️⃣ 类型安全的 getProperty：keyof + 索引访问类型
// ============================================================

// K extends keyof T：保证 key 合法
// 返回类型 T[K]：自动推导对应属性的类型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { name: "Alice", age: 30, email: "a@b.com" };

const name = getProperty(user, "name");    // 类型自动推导为 string
const age = getProperty(user, "age");      // 类型自动推导为 number
// const phone = getProperty(user, "phone");  // ❌ "phone" 不是 User 的 key
console.log("--- 7️⃣ getProperty ---");
console.log("name =", name, "| age =", age);

// ============================================================
// 8️⃣ 综合实战：根据 key 生成 setter（映射类型 + 模板字面量）
// ============================================================

// 把每个 key 转成 setName / setAge / setEmail 形式的方法
type Setter<T> = {
  [K in keyof T as \`set\${Capitalize<K & string>}\`]: (value: T[K]) => void;
};

type UserSetter = Setter<User>;
// { setName: (v: string) => void; setAge: (v: number) => void; setEmail: (v: string) => void }

const userSetter: UserSetter = {
  setName: (v) => console.log("  setName:", v),
  setAge: (v) => console.log("  setAge:", v),
  setEmail: (v) => console.log("  setEmail:", v),
};

console.log("--- 8️⃣ Setter 生成 ---");
userSetter.setName("Bob");
userSetter.setAge(25);
userSetter.setEmail("b@c.com");
`,
  },
];
