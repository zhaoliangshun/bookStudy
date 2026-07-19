// =============================================================
// TypeScript + React 全栈精通 - Batch 3: TS 高级类型
// -------------------------------------------------------------
// 章节范围（共 6 章）：
//   15. tspro-mapped-types       映射类型（Mapped Types）
//   16. tspro-conditional-types  条件类型（Conditional Types）
//   17. tspro-utility-types      内置工具类型全解（17 个）
//   18. tspro-template-literal   模板字面量类型
//   19. tspro-index-signature    索引签名与索引访问类型
//   20. tspro-type-gymnastics    类型体操实战（10 道经典题）
// =============================================================

export const chapters = [
  {
    id: "tspro-mapped-types",
    group: "三、TypeScript 高级类型",
    icon: "🗺️",
    title: "映射类型（Mapped Types）",
    content: `# 第 15 章：映射类型（Mapped Types）

## 15.1 为什么需要映射类型

在实际项目中，我们经常需要基于一个已有类型派生出新的类型：

- 把所有属性变成可选（表单部分更新场景）
- 把所有属性变成只读（不可变状态场景）
- 把所有值类型统一改写（脱敏、包装）
- 把所有 key 重命名（大写、加前缀）

如果每次都手工抄一遍，不仅代码冗长，而且原类型一改，派生类型就得跟着改，极易出错。

**映射类型（Mapped Types）** 就是 TypeScript 提供的"类型级别的 for 循环"：基于一个键的集合，对每个键生成一个属性，并可统一调整属性的可选性、只读性和值类型。一句话：**让类型也能像数据一样被遍历和变换**。

\`\`\`tsx
type User = { id: number; name: string; email: string };

// 手工写可选版本？太累，加字段就漏
type OptionalUser = { id?: number; name?: string; email?: string };

// 用映射类型一行搞定
type OptionalUser2 = { [K in keyof User]?: User[K] };
\`\`\`

## 15.2 基本语法

映射类型的语法骨架：

\`\`\`tsx
type MappedType = {
  [K in Keys]: ValueType;
};
\`\`\`

其中 \`Keys\` 必须是一个联合类型（通常是 \`keyof T\` 或字符串字面量联合），\`K\` 是循环变量，\`ValueType\` 可以引用 \`K\`。

\`\`\`tsx
type User = { id: number; name: string; email: string };

// 遍历 User 的每个 key，值类型保持不变
type CopyUser = { [K in keyof User]: User[K] };
// 等价于 { id: number; name: string; email: string }
\`\`\`

\`[K in keyof T]\` 这一行的含义：取出 T 的所有 key 组成联合类型 \`'id' | 'name' | 'email'\`，然后让 K 依次取每个值，生成对应属性。

## 15.3 修饰符 + 和 -

映射类型最强大的地方，是可以批量操作属性的两个修饰符：\`?\`（可选）和 \`readonly\`（只读）。

| 写法 | 含义 | 备注 |
| --- | --- | --- |
| \`+?\` | 加上可选 | \`+\` 可省略，等价于 \`?\` |
| \`-?\` | 去掉可选 | \`-\` 不可省 |
| \`+readonly\` | 加上只读 | \`+\` 可省略 |
| \`-readonly\` | 去掉只读 | \`-\` 不可省 |

\`\`\`tsx
// Partial 的本质：给所有属性加 ?
type MyPartial<T> = { [K in keyof T]?: T[K] };

// Required 的本质：去掉所有属性的 ?
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// Readonly 的本质：给所有属性加 readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// Mutable 的本质：去掉所有属性的 readonly
type MyMutable<T> = { -readonly [K in keyof T]: T[K] };
\`\`\`

口诀：**加修饰符用 +（可省），去修饰符用 -（不可省）**。

## 15.4 Partial / Readonly 的本质

TypeScript 内置的 \`Partial<T>\` 和 \`Readonly<T>\`，源码其实就是映射类型：

\`\`\`tsx
// lib.es5.d.ts 里的真实定义
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
  [P in K]: T;
};
\`\`\`

理解了映射类型，你就理解了 TypeScript 一半的内置工具类型。它们不是魔法，就是一行映射类型。

## 15.5 Key Remapping via as

TypeScript 4.1 起，映射类型支持 \`as\` 子句，可以在遍历时重命名 key：

\`\`\`tsx
type MappedType = {
  [K in keyof T as NewKey]: ValueType;
};
\`\`\`

典型应用：把所有 key 转大写、加前缀、过滤特定 key。

\`\`\`tsx
// 把所有 key 转成大写
type UpperKeys<T> = {
  [K in keyof T as Uppercase<K & string>]: T[K];
};

// 加前缀
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};

// 过滤掉值为函数的 key（as 返回 never 即被剔除）
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
\`\`\`

\`as\` 后面跟一个新 key 类型；如果返回 \`never\`，这个 key 就会被剔除。这是类型级别"过滤"的标准技巧。

> 注意：\`K & string\` 是为了把 \`string | number | symbol\` 收窄成 \`string\`，因为 \`Uppercase\` 只接受字符串。

## 15.6 自实现 Optional / Nullable

掌握了映射类型 + \`as\`，我们就能组合出各种实用工具：

\`\`\`tsx
// 让指定 key 变可选（其余保持必填）
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 让所有值变成可空
type Nullable<T> = { [K in keyof T]: T[K] | null };

// 把对象包装成 getter 集合
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};
\`\`\`

\`Optional<T, K>\` 是表单场景的常客：大部分字段必填，少数字段（如备注、头像）可选。

## 15.7 实际项目中的应用

**场景 1：表单状态类型**

表单初始值所有字段必填，但用户编辑时可能只填了一部分：

\`\`\`tsx
type FormValues = { name: string; age: number; email: string };
type FormState = Partial<FormValues>; // 用户可能只填了 name
\`\`\`

**场景 2：不可变状态**

Redux / Zustand 的 state 应该是不可变的：

\`\`\`tsx
type MutableState = { count: number; user: { name: string } };
type RootState = Readonly<MutableState>;
// RootState.count = 1; // 类型错误
\`\`\`

**场景 3：API 响应脱敏**

把敏感字段从响应类型中移除：

\`\`\`tsx
type User = { id: number; name: string; password: string };
type SafeUser = Omit<User, 'password'>;
\`\`\`

**场景 4：getter 工厂**

给一个对象类型自动派生出 getter 接口：

\`\`\`tsx
type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; getEmail: () => string }
\`\`\`

## 15.8 常见坑

**坑 1：映射类型会丢失修饰符**

\`\`\`tsx
type T = { a: string; b?: number; readonly c: boolean };
type Copy<T> = { [K in keyof T]: T[K] };
// 结果：{ a: string; b: number; c: boolean }
// b 的 ? 和 c 的 readonly 都丢了！
\`\`\`

如果只是 \`[K in keyof T]: T[K]\`，不加任何修饰符操作，**不会**丢失原修饰符（TS 4.8+ 保留）。但如果显式加了 \`?\` 或 \`readonly\`，就会覆盖原修饰符。

**坑 2：\`as\` 后面不能直接用 \`K\`**

\`\`\`tsx
type Wrong<T> = { [K in keyof T as Uppercase<K>]: T[K] }; // 报错
type Right<T> = { [K in keyof T as Uppercase<K & string>]: T[K] };
\`\`\`

因为 \`keyof T\` 可能包含 \`number | symbol\`，而 \`Uppercase\` 只接受 \`string\`。

## 15.9 小结

- 映射类型 = 类型级别的 for 循环
- 语法：\`[K in keyof T]: T[K]\`
- \`+?\` / \`-?\` 控制可选，\`+readonly\` / \`-readonly\` 控制只读
- \`as\` 子句可以重命名 key 或过滤 key（返回 \`never\` 即剔除）
- 内置 Partial / Required / Readonly / Pick / Record 全是映射类型
- 掌握映射类型 = 掌握 TS 类型编程的一半
`,
    code: `// =============================================================
// 第 15 章示例：映射类型自实现与演示
// =============================================================

// ---- 自实现 4 个基础工具类型 ----

// 给所有属性加 ?
type MyPartial<T> = { [K in keyof T]?: T[K] };

// 去掉所有属性的 ?
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// 给所有属性加 readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// 去掉所有属性的 readonly
type MyMutable<T> = { -readonly [K in keyof T]: T[K] };

// ---- 组合工具类型 ----

// 让指定 key 变可选（其余必填）
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 所有值变成可空
type Nullable<T> = { [K in keyof T]: T[K] | null };

// 重命名 key：所有 key 大写
type UpperKeys<T> = { [K in keyof T as Uppercase<K & string>]: T[K] };

// getter 工厂：把每个属性变成 getXxx 方法
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};

// 过滤掉值为函数的属性
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

// ---- 测试类型 ----
type User = { id: number; name: string; email: string };

// 构造各派生类型的实例
const partialUser: MyPartial<User> = { name: 'Tom' };          // 只填一个字段也合法
const readonlyUser: MyReadonly<User> = { id: 1, name: 'Tom', email: 'a@b.com' };
const requiredUser: MyRequired<{ id?: number; name?: string }> = { id: 1, name: 'Tom' };

// Optional：只让 name 变可选，id 和 email 仍必填
const optUser: Optional<User, 'name'> = { id: 1, email: 'a@b.com' };

// Nullable：每个值都可以是 null
const nullableUser: Nullable<User> = { id: 1, name: null, email: 'a@b.com' };

// UpperKeys：key 全大写
const upperUser: UpperKeys<User> = { ID: 1, NAME: 'Tom', EMAIL: 'a@b.com' };

// Getters：派生 getter 接口
const userGetters: Getters<User> = {
  getId: () => 1,
  getName: () => 'Tom',
  getEmail: () => 'a@b.com',
};

// RemoveMethods：过滤掉函数属性，只剩数据字段
type Mixed = { id: number; run: () => void; name: string };
const onlyData: RemoveMethods<Mixed> = { id: 1, name: 'Tom' };

// ---- 输出验证 ----
console.log('=== 映射类型自实现演示 ===');
console.log('MyPartial<User>     :', partialUser);
console.log('MyReadonly<User>    :', readonlyUser);
console.log('MyRequired<{id?;name?}>:', requiredUser);
console.log("Optional<User,'name'>:", optUser);
console.log('Nullable<User>      :', nullableUser);
console.log('UpperKeys<User>     :', upperUser);
console.log('Getters<User>       :', userGetters);
console.log('getId()             :', userGetters.getId());
console.log('getName()           :', userGetters.getName());
console.log('RemoveMethods<Mixed>:', onlyData);

console.log('\\n=== 修饰符 + / - 演示 ===');
type WithOptional = { a?: string; b?: number };
type MadeRequired = MyRequired<WithOptional>;        // 去掉 ?
const r1: MadeRequired = { a: 'x', b: 1 };             // 现在两个字段都必填
console.log('MyRequired 把可选变必填:', r1);

type WithReadonly = { readonly x: number; readonly y: number };
type MadeMutable = MyMutable<WithReadonly>;           // 去掉 readonly
const r2: MadeMutable = { x: 1, y: 2 };
r2.x = 100;                                            // 现在可以改了
console.log('MyMutable 把只读变可变:', r2);

console.log('\\n=== 关键点回顾 ===');
console.log('1. [K in keyof T] 是类型级别的 for 循环');
console.log('2. +? / -? 控制可选，+readonly / -readonly 控制只读');
console.log('3. as 子句可重命名或过滤 key（返回 never 即剔除）');
console.log('4. Partial/Required/Readonly/Pick/Record 全是映射类型');
`,
  },
  {
    id: "tspro-conditional-types",
    group: "三、TypeScript 高级类型",
    icon: "🔀",
    title: "条件类型（Conditional Types）",
    content: `# 第 16 章：条件类型（Conditional Types）

## 16.1 为什么需要条件类型

映射类型解决了"遍历"的问题，但类型编程里还有另一类需求：**根据输入类型的不同，输出不同的类型**。这就是条件类型——类型级别的 \`if...else\`。

典型场景：

- 函数重载的类型推导（输入数组返回元素，输入 Promise 返回内部值）
- 类型守卫的泛化（如果是字符串就做 A，否则做 B）
- 从已有类型中"提取"出一部分（提取函数返回值、数组元素、Promise 内部值）

没有条件类型，这些场景只能靠重载或者 \`any\` 硬写，既不优雅也不安全。

## 16.2 基本语法

\`\`\`tsx
type Result = T extends U ? X : Y;
\`\`\`

读作：如果 \`T\` 可以赋值给 \`U\`，则结果是 \`X\`，否则是 \`Y\`。

\`\`\`tsx
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;  // true
type B = IsString<123>;      // false
type C = IsString<string | number>;  // boolean（分布式的结果，见下节）
\`\`\`

## 16.3 分布式条件类型

**当条件类型的检查对象是"裸类型参数"（naked type parameter）时，联合类型会被分布计算**。

\`\`\`tsx
type ToArray<T> = T extends any ? T[] : never;

type R1 = ToArray<string | number>;
// 不是 (string | number)[]
// 而是 string[] | number[]
\`\`\`

分布的过程等价于：

\`\`\`tsx
type R1 = ToArray<string> | ToArray<number>;
//      = string[] | number[]
\`\`\`

**如何阻止分布？** 用方括号把 T 包起来：

\`\`\`tsx
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type R2 = ToArrayNonDist<string | number>;
// (string | number)[]
\`\`\`

记忆点：**裸 T 会分布，包起来不分布**。

## 16.4 infer 关键字

\`infer\` 是条件类型里最强大的工具：在 \`extends\` 子句里声明一个"待推断的类型变量"，然后在真分支里使用它。

\`\`\`tsx
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

读作：如果 \`T\` 能赋值给"一个函数，返回值类型记为 \`R\`"，那么结果就是 \`R\`，否则 \`never\`。

\`infer\` 的几个典型位置：

| 位置 | 写法 | 提取的内容 |
| --- | --- | --- |
| 函数返回值 | \`(...args) => infer R\` | 返回值类型 |
| 函数参数 | \`(infer A, ...) => any\` | 第一个参数类型 |
| 数组元素 | \`(infer E)[]\` | 元素类型 |
| Promise 内部 | \`Promise<infer V>\` | 解包后的值类型 |
| 元组首位 | \`[infer F, ...any[]\` | 第一个元素类型 |

\`\`\`tsx
// 提取函数返回值
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取函数参数（元组形式）
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

// 提取数组元素
type Flatten<T> = T extends (infer E)[] ? E : T;

// 解包 Promise
type Unwrap<T> = T extends Promise<infer V> ? V : T;
\`\`\`

## 16.5 嵌套条件类型

条件类型可以嵌套，实现多分支逻辑（类似 \`if...else if...else\`）：

\`\`\`tsx
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';

type A = TypeName<'hi'>;      // 'string'
type B = TypeName<123>;       // 'number'
type C = TypeName<() => void>; // 'function'
type D = TypeName<null>;      // 'object'
\`\`\`

## 16.6 infer 与元组结合

\`infer\` 配合 rest 元素，可以提取元组的"首/尾/中间"：

\`\`\`tsx
// 提取元组第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

// 提取元组最后一个元素
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

// 去掉第一个元素
type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : [];

// 去掉最后一个元素
type Pop<T extends any[]> = T extends [...infer Init, any] ? Init : [];
\`\`\`

这是类型体操里最常见的元组操作模式。

## 16.7 Awaited 的实现

\`Awaited<T>\` 是内置工具类型，用于递归解包 Promise：

\`\`\`tsx
type Awaited<T> =
  T extends null | undefined
    ? T
    : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
      ? F extends (value: infer V, ...args: infer _) => any
        ? Awaited<V>
        : never
      : T;
\`\`\`

简化版（只处理标准 Promise）：

\`\`\`tsx
type MyAwaited<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? MyAwaited<V>
    : V
  : T;
\`\`\`

\`Awaited<Promise<Promise<number>>>\` 结果是 \`number\`，会递归解到最底层。

## 16.8 实际项目中的应用

**场景 1：根据入参类型决定返回类型**

\`\`\`tsx
function fetcher<T extends string | number>(input: T): T extends string ? User : User[] {
  // ...
  return null as any;
}

const a = fetcher('1');     // User
const b = fetcher(1);       // User[]
\`\`\`

**场景 2：从组件 props 推导事件处理器类型**

\`\`\`tsx
type GetEventHandler<P> = P extends { onChange: (e: infer E) => void } ? E : never;
\`\`\`

**场景 3：API 响应解包**

\`\`\`tsx
type ApiResponse<T> = { data: T; code: number };
type UnwrapApi<T> = T extends ApiResponse<infer D> ? D : never;
\`\`\`

## 16.9 小结

- 条件类型 = 类型级别的 \`T extends U ? X : Y\`
- 裸类型参数会**分布式**计算，包起来 \`[T]\` 则不分布
- \`infer\` 在 \`extends\` 子句里声明变量，用于"提取"类型
- 条件类型可嵌套，实现多分支
- \`infer\` + rest 元组 = 元组首/尾/中间操作
- Awaited 是递归条件类型的经典案例
`,
    code: `// =============================================================
// 第 16 章示例：条件类型与 infer 自实现
// =============================================================

// ---- 自实现 4 个核心工具类型 ----

// 提取函数返回值类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取函数参数类型（元组）
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

// 递归解包 Promise
type MyAwaited<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? MyAwaited<V>
    : V
  : T;

// 拍平数组：数组返回元素类型，非数组返回自身
type MyFlatten<T> = T extends (infer E)[] ? E : T;

// ---- 元组操作 ----
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

// ---- 类型名识别（嵌套条件类型）----
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';

// ---- 分布式 vs 非分布式 ----
type ToArrayDist<T> = T extends any ? T[] : never;
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

// ---- 构造测试函数 ----
function getUser(id: number): { id: number; name: string } {
  return { id, name: 'Tom' };
}

function add(a: number, b: number, c: number): number {
  return a + b + c;
}

async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  return { id, name: 'Tom' };
}

// ---- 用自实现类型推断 ----
type GetUserReturn = MyReturnType<typeof getUser>;     // { id: number; name: string }
type AddParams = MyParameters<typeof add>;             // [number, number, number]
type FetchReturn = MyReturnType<typeof fetchUser>;     // Promise<{ id: number; name: string }>

// ---- 构造各类型实例并输出 ----
const ret: GetUserReturn = { id: 1, name: 'Tom' };
const params: AddParams = [1, 2, 3];

console.log('=== 条件类型与 infer 演示 ===');
console.log('MyReturnType<getUser> :', ret);
console.log('MyParameters<add>     :', params);

// ---- Flatten 演示 ----
const arr: number[] = [1, 2, 3];
type Elem = MyFlatten<typeof arr>;   // number
const elem: Elem = 42;
console.log('MyFlatten<number[]>   :', elem);

// ---- 元组首尾 ----
type Tuple = [string, number, boolean];
type Head = First<Tuple>;   // string
type Tail = Last<Tuple>;    // boolean
const head: Head = 'hello';
const tail: Tail = true;
console.log('First<Tuple>          :', head);
console.log('Last<Tuple>           :', tail);

// ---- TypeName 演示 ----
const n1: TypeName<'hi'> = 'string';
const n2: TypeName<123> = 'number';
const n3: TypeName<true> = 'boolean';
const n4: TypeName<null> = 'object';
const n5: TypeName<() => void> = 'function';
console.log('\\n=== TypeName 嵌套条件类型 ===');
console.log("TypeName<'hi'>    :", n1);
console.log('TypeName<123>     :', n2);
console.log('TypeName<true>    :', n3);
console.log('TypeName<null>    :', n4);
console.log('TypeName<()=>void>:', n5);

// ---- 分布式 vs 非分布式 ----
type Dist = ToArrayDist<string | number>;       // string[] | number[]
type NonDist = ToArrayNonDist<string | number>; // (string | number)[]

const d: Dist = ['a'];
const nd: NonDist = ['a', 1];
console.log('\\n=== 分布式 vs 非分布式 ===');
console.log('ToArrayDist<string|number>    :', d, '（string[] | number[]）');
console.log('ToArrayNonDist<string|number> :', nd, '（(string|number)[]）');

console.log('\\n=== Awaited 递归解包 ===');
// 模拟嵌套 Promise 的解包效果
type DeepPromise = MyAwaited<Promise<Promise<Promise<number>>>>;  // number
const unwrapped: DeepPromise = 42;
console.log('MyAwaited<Promise<Promise<Promise<number>>>> :', unwrapped);

console.log('\\n=== 关键点回顾 ===');
console.log('1. T extends U ? X : Y 是类型级别的 if-else');
console.log('2. 裸类型参数会分布式计算，[T] 包起来则不分布');
console.log('3. infer 在 extends 子句里声明变量，提取类型');
console.log('4. infer + rest 元组 = 元组首/尾/中间操作');
console.log('5. Awaited 是递归条件类型的经典案例');
`,
  },
  {
    id: "tspro-utility-types",
    group: "三、TypeScript 高级类型",
    icon: "🛠️",
    title: "内置工具类型全解（17 个）",
    content: `# 第 17 章：内置工具类型全解（17 个）

## 17.1 为什么需要内置工具类型

TypeScript 内置了 17 个常用工具类型（Utility Types），覆盖了日常开发 90% 的类型变换需求。掌握它们，你就能：

- 不用每次手写映射类型，直接调用
- 看懂第三方库的类型定义
- 在团队里用统一的语言交流类型变换

**核心原则：能用内置工具类型，就不要自己造轮子。**

## 17.2 17 个工具类型总览

按用途分 5 组：

### 第一组：属性可选性（3 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`Partial<T>\` | 所有属性变可选 | 表单部分更新 |
| \`Required<T>\` | 所有属性变必填 | 把可选数据"补全"后标记 |
| \`Readonly<T>\` | 所有属性变只读 | 不可变状态 |

\`\`\`tsx
type User = { id: number; name: string; email?: string };

type PartialUser = Partial<User>;        // { id?; name?; email? }
type RequiredUser = Required<User>;      // { id; name; email }（email 变必填）
type ReadonlyUser = Readonly<User>;      // 全部 readonly
\`\`\`

### 第二组：属性挑选（2 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`Pick<T, K>\` | 从 T 中挑选指定 key | 视图层只暴露部分字段 |
| \`Omit<T, K>\` | 从 T 中排除指定 key | 脱敏、删字段 |

\`\`\`tsx
type User = { id: number; name: string; password: string; email: string };

type SafeUser = Omit<User, 'password'>;           // 去掉 password
type ListItem = Pick<User, 'id' | 'name'>;        // 只保留 id 和 name
\`\`\`

### 第三组：对象构造（1 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`Record<K, V>\` | 构造键为 K、值为 V 的对象 | 字典、映射表 |

\`\`\`tsx
type Role = 'admin' | 'user' | 'guest';
type Permissions = Record<Role, string[]>;
// { admin: string[]; user: string[]; guest: string[] }

const perms: Permissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read'],
};
\`\`\`

\`Record\` 比索引签名 \`{ [key: string]: V }\` 更安全：它要求 key 必须是 K 联合类型中的某一个，不会多写也不会漏写。

### 第四组：函数相关（4 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`ReturnType<F>\` | 提取函数返回值类型 | 包装器、HOC |
| \`Parameters<F>\` | 提取函数参数元组 | 参数转发 |
| \`ConstructorParameters<C>\` | 提取构造函数参数元组 | 依赖注入 |
| \`InstanceType<C>\` | 提取构造函数实例类型 | 工厂模式 |

\`\`\`tsx
function fetchUser(id: number): Promise<User> { /* ... */ }

type R = ReturnType<typeof fetchUser>;     // Promise<User>
type P = Parameters<typeof fetchUser>;     // [number]

class Animal {
  constructor(public name: string, public age: number) {}
}
type CtorParams = ConstructorParameters<typeof Animal>;  // [string, number]
type Instance = InstanceType<typeof Animal>;             // Animal
\`\`\`

### 第五组：联合类型（3 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`Exclude<T, U>\` | 从 T 中排除可赋值给 U 的成员 | 联合类型裁剪 |
| \`Extract<T, U>\` | 从 T 中提取可赋值给 U 的成员 | 联合类型过滤 |
| \`NonNullable<T>\` | 排除 null 和 undefined | 信任边界处收窄 |

\`\`\`tsx
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;      // 'b' | 'c'
type T2 = Extract<string | number | boolean, number | string>;  // string | number
type T3 = NonNullable<string | null | undefined>;  // string
\`\`\`

### 第六组：异步（1 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`Awaited<T>\` | 递归解包 Promise | async 函数返回值 |

\`\`\`tsx
type T = Awaited<Promise<Promise<number>>>;  // number
type T = Awaited<Promise<User>>;              // User
\`\`\`

### 第七组：字符串变换（3 个）

| 工具类型 | 作用 | 典型场景 |
| --- | --- | --- |
| \`Uppercase<S>\` | 字符串字面量大写 | HTTP header、常量 |
| \`Lowercase<S>\` | 字符串字面量小写 | 标准化 key |
| \`Capitalize<S>\` | 首字母大写 | camelCase 转换 |

\`\`\`tsx
type A = Uppercase<'hello'>;      // 'HELLO'
type B = Lowercase<'Hello'>;      // 'hello'
type C = Capitalize<'foo'>;       // 'Foo'
\`\`\`

> 还有 \`Uncapitalize<S>\`，首字母小写，共 4 个字符串工具。本章按题目要求重点讲前 3 个 + \`Uncapitalize\`。

## 17.3 实战组合技

### 技巧 1：让指定 key 变可选

\`\`\`tsx
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type User = { id: number; name: string; email: string };
type UserWithNameOptional = Optional<User, 'name'>;
// { id: number; email: string; name?: string }
\`\`\`

### 技巧 2：让指定 key 变只读

\`\`\`tsx
type ReadonlyKey<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>;
\`\`\`

### 技巧 3：把对象转成 key-value 元组数组

\`\`\`tsx
type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];

type User = { id: number; name: string };
type UserEntries = Entries<User>;
// (['id', number] | ['name', string])[]
\`\`\`

### 技巧 4：根据值类型挑 key

\`\`\`tsx
type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;

type Mixed = { id: number; name: string; age: number };
type OnlyNumbers = PickByValue<Mixed, number>;
// { id: number; age: number }
\`\`\`

## 17.4 实际项目中的应用

**场景 1：React 组件 props 派生**

\`\`\`tsx
type ButtonProps = { size: 'sm' | 'md' | 'lg'; color: string; onClick: () => void };
// 默认 props：所有都可选
type DefaultButtonProps = Partial<ButtonProps>;
// 必填 props：onClick 必填，其余可选
type RequiredButtonProps = Pick<ButtonProps, 'onClick'> & Partial<Omit<ButtonProps, 'onClick'>>;
\`\`\`

**场景 2：API 请求/响应类型**

\`\`\`tsx
type User = { id: number; name: string; email: string; password: string; createdAt: Date };

type UserCreateInput = Omit<User, 'id' | 'createdAt'>;      // 创建时不传 id 和时间
type UserUpdateInput = Partial<UserCreateInput>;            // 更新时部分字段
type UserResponse = Omit<User, 'password'>;                 // 响应不返回密码
type UserListItem = Pick<User, 'id' | 'name'>;              // 列表只显示 id 和 name
\`\`\`

**场景 3：权限映射表**

\`\`\`tsx
type Action = 'read' | 'write' | 'delete';
type Resource = 'user' | 'post' | 'comment';
type PermissionMatrix = Record<Resource, Record<Action, boolean>>;

const matrix: PermissionMatrix = {
  user: { read: true, write: true, delete: false },
  post: { read: true, write: true, delete: true },
  comment: { read: true, write: false, delete: false },
};
\`\`\`

**场景 4：事件处理器类型提取**

\`\`\`tsx
type EventHandler<E extends React.SyntheticEvent> = (e: E) => void;
type ClickHandler = EventHandler<React.MouseEvent>;  // (e: MouseEvent) => void
\`\`\`

## 17.5 选用建议

| 需求 | 推荐工具 |
| --- | --- |
| 全部可选 | \`Partial\` |
| 全部必填 | \`Required\` |
| 全部只读 | \`Readonly\` |
| 选几个字段 | \`Pick\` |
| 去几个字段 | \`Omit\` |
| 字典/映射 | \`Record\` |
| 函数返回值 | \`ReturnType\` |
| 函数参数 | \`Parameters\` |
| 联合裁剪 | \`Exclude\` |
| 联合过滤 | \`Extract\` |
| 去 null | \`NonNullable\` |
| Promise 解包 | \`Awaited\` |

## 17.6 小结

- 17 个内置工具类型覆盖 5 大场景：可选性、挑选、构造、函数、联合、异步、字符串
- 优先用内置，不要造轮子
- 组合使用：\`Partial<Pick<...>>\`、\`Omit<T, K> & Partial<Pick<T, K>>\` 等
- 理解每个工具的"本质"= 理解映射类型 + 条件类型
`,
    code: `// =============================================================
// 第 17 章示例：17 个内置工具类型逐一演示
// =============================================================

// ---- 测试基类型 ----
type User = { id: number; name: string; email?: string; password: string };

// ---- 第一组：属性可选性 ----
type TPartial = Partial<User>;          // 全部可选
type TRequired = Required<User>;        // 全部必填（email 也变必填）
type TReadonly = Readonly<User>;        // 全部只读

const uPartial: TPartial = { name: 'Tom' };             // 只填一个也行
const uRequired: TRequired = { id: 1, name: 'Tom', email: 'a@b.com', password: '123' };
const uReadonly: TReadonly = { id: 1, name: 'Tom', email: 'a@b.com', password: '123' };

console.log('=== 第一组：属性可选性 ===');
console.log('Partial<User>          :', uPartial);
console.log('Required<User>         :', uRequired);
console.log('Readonly<User>         :', uReadonly);

// ---- 第二组：属性挑选 ----
type TOmit = Omit<User, 'password'>;            // 去掉 password
type TPick = Pick<User, 'id' | 'name'>;         // 只留 id 和 name

const uOmit: TOmit = { id: 1, name: 'Tom', email: 'a@b.com' };
const uPick: TPick = { id: 1, name: 'Tom' };

console.log('\\n=== 第二组：属性挑选 ===');
console.log("Omit<User,'password'>  :", uOmit);
console.log("Pick<User,'id'|'name'> :", uPick);

// ---- 第三组：对象构造 ----
type Role = 'admin' | 'user' | 'guest';
type TRecord = Record<Role, string[]>;

const permMatrix: TRecord = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read'],
};

console.log('\\n=== 第三组：对象构造 ===');
console.log('Record<Role, string[]> :', permMatrix);

// ---- 第四组：函数相关 ----
function fetchUser(id: number, withDetail: boolean): Promise<User> {
  return null as any;
}
class Animal {
  constructor(public name: string, public age: number) {}
}

type TReturn = ReturnType<typeof fetchUser>;            // Promise<User>
type TParams = Parameters<typeof fetchUser>;            // [number, boolean]
type TCtorParams = ConstructorParameters<typeof Animal>; // [string, number]
type TInstance = InstanceType<typeof Animal>;           // Animal

const fnReturn: TReturn = null as any;
const fnParams: TParams = [1, true];
const ctorParams: TCtorParams = ['Tom', 3];
const instance: TInstance = new Animal('Tom', 3);

console.log('\\n=== 第四组：函数相关 ===');
console.log('ReturnType<fetchUser>      : Promise<User>');
console.log('Parameters<fetchUser>      :', fnParams);
console.log('ConstructorParameters<Animal>:', ctorParams);
console.log('InstanceType<Animal>       :', instance);

// ---- 第五组：联合类型 ----
type Mixed = 'a' | 'b' | 'c' | string | number;
type TExclude = Exclude<'a' | 'b' | 'c' | 'd', 'a'>;          // 'b' | 'c' | 'd'
type TExtract = Extract<string | number | boolean, number | string>;  // string | number
type TNonNullable = NonNullable<string | null | undefined>;   // string

const ex: TExclude = 'b';
const et1: TExtract = 'x';
const et2: TExtract = 1;
const nn: TNonNullable = 'hello';

console.log('\\n=== 第五组：联合类型 ===');
console.log("Exclude<'a'|'b'|'c'|'d','a'> :", ex);
console.log('Extract<string|number|boolean, number|string>:', et1, et2);
console.log('NonNullable<string|null|undefined>:', nn);

// ---- 第六组：异步 ----
type TAwaited = Awaited<Promise<Promise<number>>>;   // number
const awaited: TAwaited = 42;

console.log('\\n=== 第六组：异步 ===');
console.log('Awaited<Promise<Promise<number>>>:', awaited);

// ---- 第七组：字符串变换 ----
type TUpper = Uppercase<'hello'>;        // 'HELLO'
type TLower = Lowercase<'Hello'>;        // 'hello'
type TCap = Capitalize<'foo'>;           // 'Foo'
type TUncap = Uncapitalize<'Foo'>;       // 'foo'

const up: TUpper = 'HELLO';
const lo: TLower = 'hello';
const cap: TCap = 'Foo';
const uncap: TUncap = 'foo';

console.log('\\n=== 第七组：字符串变换 ===');
console.log("Uppercase<'hello'>   :", up);
console.log("Lowercase<'Hello'>   :", lo);
console.log("Capitalize<'foo'>    :", cap);
console.log("Uncapitalize<'Foo'>  :", uncap);

// ---- 组合技：让指定 key 变可选 ----
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type UserCreate = { name: string; email: string; age: number };
type UserCreateWithNameOptional = Optional<UserCreate, 'name'>;
const uc: UserCreateWithNameOptional = { email: 'a@b.com', age: 18 };  // name 可省

console.log('\\n=== 组合技 ===');
console.log("Optional<UserCreate, 'name'>:", uc);

console.log('\\n=== 17 个工具类型清单 ===');
const utilities = [
  'Partial<T>            - 全部可选',
  'Required<T>           - 全部必填',
  'Readonly<T>           - 全部只读',
  'Pick<T, K>            - 挑选指定 key',
  'Omit<T, K>            - 排除指定 key',
  'Record<K, V>          - 构造字典',
  'ReturnType<F>         - 函数返回值',
  'Parameters<F>         - 函数参数元组',
  'ConstructorParameters<C> - 构造函数参数',
  'InstanceType<C>       - 构造函数实例',
  'Exclude<T, U>         - 联合裁剪',
  'Extract<T, U>         - 联合过滤',
  'NonNullable<T>        - 排除 null/undefined',
  'Awaited<T>            - 解包 Promise',
  'Uppercase<S>          - 字符串大写',
  'Lowercase<S>          - 字符串小写',
  'Capitalize<S>         - 首字母大写',
  '(附) Uncapitalize<S>  - 首字母小写',
];
utilities.forEach((u) => console.log('  ' + u));
`,
  },
  {
    id: "tspro-template-literal",
    group: "三、TypeScript 高级类型",
    icon: "📜",
    title: "模板字面量类型（Template Literal Types）",
    content: `# 第 18 章：模板字面量类型（Template Literal Types）

## 18.1 为什么需要模板字面量类型

在前端开发中，有大量"字符串模式"需要类型化：

- CSS 属性名：\`margin-top\`、\`padding-left\`、\`border-radius\`
- 事件名：\`onClick\`、\`onChange\`、\`onMouseOver\`
- API 路径：\`/users/:id\`、\`/posts/:postId/comments/:commentId\`
- HTTP header：\`Content-Type\`、\`X-Request-Id\`

传统做法是用 \`string\`，丢失了所有模式信息；手工列联合类型又太长（CSS 有几百个属性）。

**模板字面量类型（Template Literal Types）** 让你能用类似模板字符串的语法，在类型层面拼接、变换字符串字面量，自动生成精确的联合类型。

## 18.2 基本语法

\`\`\`tsx
type T = \`hello \${World}\`;
\`\`\`

其中 \`World\` 必须是字符串字面量类型或字符串联合类型。结果是把每个成员代入模板，生成新的联合类型。

\`\`\`tsx
type Greeting = 'hello' | 'hi';

type Message = \`\${Greeting}, world\`;
// 'hello, world' | 'hi, world'
\`\`\`

多个插值会做笛卡尔积：

\`\`\`tsx
type Side = 'top' | 'bottom' | 'left' | 'right';
type Margin = \`margin-\${Side}\`;
// 'margin-top' | 'margin-bottom' | 'margin-left' | 'margin-right'
\`\`\`

## 18.3 与字面量联合的区别

表面看，模板字面量类型生成的是字面量联合，但它能**自动生成**，不用手写：

\`\`\`tsx
// 手写：累，加一个 side 就要加 4 行
type MarginManual = 'margin-top' | 'margin-bottom' | 'margin-left' | 'margin-right';

// 模板字面量：加一个 side 自动扩展
type MarginAuto = \`margin-\${Side}\`;
\`\`\`

更强大的地方：可以组合内置的 \`Uppercase\`、\`Lowercase\`、\`Capitalize\`、\`Uncapitalize\`：

\`\`\`tsx
type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type ApiMethod = \`on\${Capitalize<HttpMethod>}\`;
// 'onGet' | 'onPost' | 'onPut' | 'onDelete'
\`\`\`

## 18.4 结合 keyof 做属性名变换

模板字面量类型最常见的用法：**基于对象类型的 key，派生新的 key 集合**。

\`\`\`tsx
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};

type User = { id: number; name: string };
type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string }
\`\`\`

类似地，派生 setter：

\`\`\`tsx
type Setters<T> = {
  [K in keyof T as \`set\${Capitalize<K & string>}\`]: (v: T[K]) => void;
};
\`\`\`

派生事件处理器名：

\`\`\`tsx
type EventHandlers<T> = {
  [K in keyof T as \`on\${Capitalize<K & string>}\`]: (payload: T[K]) => void;
};

type Events = { click: MouseEvent; change: Event };
type Handlers = EventHandlers<Events>;
// { onClick: (e: MouseEvent) => void; onChange: (e: Event) => void }
\`\`\`

## 18.5 典型应用 1：CSS 属性类型

CSS 的 \`margin-*\`、\`padding-*\`、\`border-*\` 等属性遵循固定模式，用模板字面量类型可以一键生成：

\`\`\`tsx
type Side = 'top' | 'right' | 'bottom' | 'left';

type MarginProperty = \`margin-\${Side}\`;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'

type PaddingProperty = \`padding-\${Side}\`;

// 配合 Record 构造样式对象
type StyleKey = MarginProperty | PaddingProperty;
type StyleObj = Partial<Record<StyleKey, string>>;
\`\`\`

更复杂的模式：\`border-{width|style|color}-{side}\`

\`\`\`tsx
type BorderPart = 'width' | 'style' | 'color';
type BorderProperty = \`border-\${BorderPart}-\${Side}\`;
// 'border-width-top' | 'border-width-right' | ... 共 12 个
\`\`\`

## 18.6 典型应用 2：API 路径类型

RESTful 路径如 \`/users/:id\`、\`/posts/:postId/comments/:commentId\`，可以用模板字面量类型精确描述：

\`\`\`tsx
type RouteParam = \`:\${string}\`;

type ExtractParams<S extends string> =
  S extends \`\${infer _Start}/\${infer Rest}\`
    ? Rest extends RouteParam
      ? Rest
      : ExtractParams<Rest>
    : S extends RouteParam
      ? S
      : never;

// 简化版：直接定义路径模式
type UserRoutes = '/users' | \`/users/:id\`;
type PostRoutes = '/posts' | \`/posts/:postId\` | \`/posts/:postId/comments\`;
type ApiPath = UserRoutes | PostRoutes;

function navigate(path: ApiPath) {
  console.log('navigating to', path);
}

navigate('/users');              // OK
navigate('/users/123');          // OK
navigate('/posts/456/comments'); // OK
// navigate('/unknown');         // 类型错误
\`\`\`

## 18.7 典型应用 3：从路径提取参数

更进阶：用条件类型 + \`infer\` 从路径模式中提取参数名：

\`\`\`tsx
type ExtractParam<S extends string> =
  S extends \`\${infer _}/:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractParam<\`/\${Rest}\`>
    : S extends \`\${infer _}/:\${infer Param}\`
      ? Param
      : never;

type Params = ExtractParam<'/users/:userId/posts/:postId'>;
// 'userId' | 'postId'
\`\`\`

这是模板字面量类型 + 条件类型 + \`infer\` 三者结合的经典用法，类型层面的"字符串解析"。

## 18.8 实际项目中的应用

**场景 1：React 组件事件 props 自动派生**

\`\`\`tsx
type NativeEvents = {
  click: React.MouseEvent;
  change: React.ChangeEvent;
  submit: React.FormEvent;
};

type EventProps<T> = {
  [K in keyof T as \`on\${Capitalize<K & string>}\`]?: (e: T[K]) => void;
};

type ButtonProps = EventProps<NativeEvents> & { disabled?: boolean };
// { onClick?: (e: MouseEvent) => void; onChange?: ...; onSubmit?: ...; disabled?: boolean }
\`\`\`

**场景 2：环境变量类型**

\`\`\`tsx
type EnvPrefix = 'VITE_' | 'NEXT_PUBLIC_';
type EnvKey = \`\${EnvPrefix}\${string}\`;

const env: Partial<Record<EnvKey, string>> = {
  VITE_API_URL: '/api',
  NEXT_PUBLIC_GA_ID: 'UA-xxx',
};
\`\`\`

**场景 3：i18n key 自动补全**

\`\`\`tsx
type Namespace = 'common' | 'user' | 'post';
type Key = 'title' | 'description' | 'button.submit';
type I18nKey = \`\${Namespace}.\${Key}\`;
// 'common.title' | 'common.description' | ... 共 9 个
\`\`\`

## 18.9 性能注意

模板字面量类型在做笛卡尔积时**会爆炸**：4 个插值各 10 个选项，结果是 10000 个联合成员，编译会变慢。

\`\`\`tsx
// 别这么干：4 维笛卡尔积，1 万个成员
type Slow = \`\${A}-${B}-${C}-${D}\`;  // A,B,C,D 各 10 个
\`\`\`

建议：单层插值控制在 100 个成员以内，多层插值慎用。

## 18.10 小结

- 模板字面量类型 = 类型层面的模板字符串
- 语法：\`\` \`\${Var}\` \`\`，自动生成字面量联合
- 结合 \`Uppercase\` / \`Capitalize\` 等做字符串变换
- 结合 \`keyof\` + \`as\` 派生属性名（getter/setter/event handler）
- 经典应用：CSS 属性、API 路径、事件名、i18n key
- 注意笛卡尔积爆炸，控制联合成员数量
`,
    code: `// =============================================================
// 第 18 章示例：模板字面量类型演示
// =============================================================

// ---- 基础：字符串拼接生成联合类型 ----
type Greeting = 'hello' | 'hi';
type Message = \`\${Greeting}, world\`;   // 'hello, world' | 'hi, world'

type Side = 'top' | 'right' | 'bottom' | 'left';
type MarginProperty = \`margin-\${Side}\`;  // 'margin-top' | ... 共 4 个
type PaddingProperty = \`padding-\${Side}\`;

// ---- 结合字符串变换工具 ----
type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type ApiHandler = \`on\${Capitalize<HttpMethod>}\`;  // 'onGet' | 'onPost' | ...

// ---- CSS 属性类型 ----
type BorderPart = 'width' | 'style' | 'color';
type BorderProperty = \`border-\${BorderPart}-\${Side}\`;  // 共 12 个

type StyleKey = MarginProperty | PaddingProperty | BorderProperty;
type StyleObj = Partial<Record<StyleKey, string>>;

// ---- 构造样式对象 ----
const style: StyleObj = {
  'margin-top': '10px',
  'padding-left': '20px',
  'border-width-top': '1px',
  'border-color-bottom': 'red',
};

console.log('=== 模板字面量类型演示 ===');
console.log('StyleObj:', style);

// ---- 事件处理器派生 ----
type NativeEvents = {
  click: { type: string; x: number; y: number };
  change: { type: string; value: string };
  submit: { type: string; data: unknown };
};

type EventProps<T> = {
  [K in keyof T as \`on\${Capitalize<K & string>}\`]?: (e: T[K]) => void;
};

type ButtonProps = EventProps<NativeEvents> & { disabled?: boolean };

const btn: ButtonProps = {
  disabled: false,
  onClick: (e) => console.log('clicked at', e.x, e.y),
  onChange: (e) => console.log('changed to', e.value),
};

console.log('\\n=== 事件处理器派生 ===');
console.log('ButtonProps:', btn);
if (btn.onClick) btn.onClick({ type: 'click', x: 100, y: 200 });
if (btn.onChange) btn.onChange({ type: 'change', value: 'hello' });

// ---- API 路径类型 ----
type UserRoutes = '/users' | \`/users/:id\`;
type PostRoutes = '/posts' | \`/posts/:postId\` | \`/posts/:postId/comments\`;
type ApiPath = UserRoutes | PostRoutes;

function navigate(path: ApiPath): void {
  console.log('navigate to:', path);
}

console.log('\\n=== API 路径类型 ===');
navigate('/users');
navigate('/users/123');
navigate('/posts/456/comments');

// ---- getter/setter 派生 ----
type User = { id: number; name: string; email: string };

type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as \`set\${Capitalize<K & string>}\`]: (v: T[K]) => void;
};

const userGetters: Getters<User> = {
  getId: () => 1,
  getName: () => 'Tom',
  getEmail: () => 'a@b.com',
};

const userSetters: Setters<User> = {
  setId: (v) => console.log('set id =', v),
  setName: (v) => console.log('set name =', v),
  setEmail: (v) => console.log('set email =', v),
};

console.log('\\n=== getter/setter 派生 ===');
console.log('getId():', userGetters.getId());
console.log('getName():', userGetters.getName());
userSetters.setName('Jerry');

// ---- 从路径模式提取参数名 ----
type ExtractParam<S extends string> =
  S extends \`\${infer _}/:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractParam<\`/\${Rest}\`>
    : S extends \`\${infer _}/:\${infer Param}\`
      ? Param
      : never;

type Params = ExtractParam<'/users/:userId/posts/:postId'>;
// 'userId' | 'postId'

const p1: Params = 'userId';
const p2: Params = 'postId';
console.log('\\n=== 路径参数提取 ===');
console.log('ExtractParam</users/:userId/posts/:postId>:', p1, p2);

// ---- HTTP header 类型 ----
type HeaderPrefix = 'X-' | 'Content-';
type HeaderKey = \`\${HeaderPrefix}\${Capitalize<string>}\` & string;

const headers: Record<string, string> = {
  'X-Request-Id': 'abc-123',
  'X-Trace-Id': 'def-456',
  'Content-Type': 'application/json',
};

console.log('\\n=== HTTP header ===');
console.log('headers:', headers);

// ---- 笛卡尔积演示 ----
type Color = 'red' | 'green' | 'blue';
type Size = 'sm' | 'md' | 'lg';
type Variant = \`\${Color}-\${Size}\`;  // 共 9 个

const variants: Variant[] = ['red-sm', 'green-md', 'blue-lg'];
console.log('\\n=== 笛卡尔积 ===');
console.log('Variant (3x3=9):', variants);

console.log('\\n=== 关键点回顾 ===');
console.log('1. 模板字面量类型语法: \\\\`...\${Var}...\\\\`');
console.log('2. 自动生成字面量联合，支持笛卡尔积');
console.log('3. 结合 Uppercase/Capitalize 做字符串变换');
console.log('4. 结合 keyof + as 派生属性名');
console.log('5. 经典应用：CSS、API 路径、事件名、i18n key');
`,
  },
  {
    id: "tspro-index-signature",
    group: "三、TypeScript 高级类型",
    icon: "📑",
    title: "索引签名与索引访问类型",
    content: `# 第 19 章：索引签名与索引访问类型

## 19.1 为什么需要索引签名与索引访问

在前端开发中，"键值对集合"无处不在：

- 配置对象：\`{ apiUrl: '/api', timeout: 3000, retry: 3 }\`
- 缓存表：\`{ user1: User; user2: User }\`
- HTTP header：\`{ 'Content-Type': 'application/json' }\`
- 字典：\`{ [word: string]: string }\`

这些场景下，属性名是动态的、不限数量的。普通对象类型（每个 key 都写死）不够用，需要一种"任意 key"的描述方式——**索引签名（Index Signature）**。

而要从对象类型里"取一个属性的类型"，则需要**索引访问类型（Indexed Access Types）**。两者一组合，就构成了 TypeScript 处理动态对象的两大利器。

## 19.2 索引签名语法

\`\`\`tsx
type StringMap = {
  [key: string]: string;
};

const m: StringMap = {
  hello: 'world',
  foo: 'bar',
  // 任意 string key 都合法
};
\`\`\`

\`[key: string]: string\` 读作："任意字符串 key，对应的值都是 string"。

索引签名的 key 类型只能是 \`string\` / \`number\` / \`symbol\`：

\`\`\`tsx
type NumMap = { [key: number]: string };
type SymMap = { [key: symbol]: boolean };
\`\`\`

> 注意：JS 里对象 key 会被自动转成字符串，所以 \`string\` 索引签名实际上也覆盖 \`number\`。

## 19.3 索引签名的约束

**约束 1：已知属性的类型必须能赋值给索引签名的值类型**

\`\`\`tsx
type Bad = {
  [key: string]: string;
  count: number;  // 报错：number 不能赋值给 string
};

type Good = {
  [key: string]: string | number;
  count: number;  // OK
};
\`\`\`

**约束 2：索引签名不保证 key 存在**

\`\`\`tsx
type Dict = { [key: string]: string };
const d: Dict = {};
d.anyKey;  // 类型是 string，但运行时是 undefined
\`\`\`

这是索引签名最大的坑：TS 会告诉你"值是 string"，但实际可能是 \`undefined\`。

## 19.4 Record<K, V> 的本质

\`Record<K, V>\` 是索引签名的"安全版"：

\`\`\`tsx
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
\`\`\`

区别在于：

| 对比项 | 索引签名 \`{ [key: string]: V }\` | \`Record<K, V>\` |
| --- | --- | --- |
| key 范围 | 任意 string | 限定 K 联合 |
| 是否要求所有 key | 否（可能为空） | 是（必须全写） |
| 类型安全 | 弱（key 可能不存在） | 强（编译期检查） |
| 适用场景 | 字典、缓存 | 枚举映射、配置 |

\`\`\`tsx
// 索引签名：可能漏 key
type RoleMap1 = { [key: string]: string[] };
const r1: RoleMap1 = { admin: ['read'] };  // 漏了 user/guest 也不报错

// Record：必须写全
type Role = 'admin' | 'user' | 'guest';
type RoleMap2 = Record<Role, string[]>;
const r2: RoleMap2 = { admin: ['read'] };  // 报错：缺 user 和 guest
\`\`\`

**结论：能用 \`Record\` 就别用索引签名。**

## 19.5 索引访问类型

索引访问类型 = 类型层面的 \`T[K]\`，从对象类型里"取一个属性的类型"。

\`\`\`tsx
type User = { id: number; name: string; email: string };

type IdType = User['id'];      // number
type NameType = User['name'];  // string
\`\`\`

K 可以是联合类型，一次取多个：

\`\`\`tsx
type ValueType = User['id' | 'name'];  // number | string
\`\`\`

K 也可以是 \`keyof T\`，取所有值类型的联合：

\`\`\`tsx
type AllValues = User[keyof User];  // number | string
\`\`\`

## 19.6 keyof 与索引访问组合

\`keyof\` + 索引访问是类型编程的基础积木：

\`\`\`tsx
// 取对象的"值类型联合"
type ValueOf<T> = T[keyof T];

type User = { id: number; name: string };
type V = ValueOf<User>;  // number | string

// 取数组元素类型
type Elem<T> = T extends (infer E)[] ? E : T[number];
// 等价于 T[number]

const arr = [{ id: 1 }, { id: 2 }];
type Item = (typeof arr)[number];  // { id: number }
\`\`\`

\`T[number]\` 是数组/元组取元素类型的标准写法：

\`\`\`tsx
type Tuple = [string, number, boolean];
type T0 = Tuple[0];  // string
type T1 = Tuple[1];  // number
type All = Tuple[number];  // string | number | boolean
\`\`\`

## 19.7 为什么不要用 \`[key: string]: any\`

这是新手最容易写的反模式：

\`\`\`tsx
// 反例：等于没写类型
type BadConfig = { [key: string]: any };

const cfg: BadConfig = {
  apiUrl: '/api',
  timeout: 3000,
  whatever: () => console.log('???'),
};
\`\`\`

问题：

1. **等于没类型**：\`any\` 关闭了所有检查，TS 退化成 JS
2. **key 不受控**：随便加什么 key 都不报错，无法发现拼写错误
3. **重构不安全**：改一个字段名，所有引用处都不会报错

**正确做法**：用 \`Record\` + 字面量联合，或者用具体属性类型。

\`\`\`tsx
// 方案 1：Record + 枚举 key
type ConfigKey = 'apiUrl' | 'timeout' | 'retry';
type Config = Record<ConfigKey, string | number>;

// 方案 2：具体属性 + 可选索引签名兜底
type StrictConfig = {
  apiUrl: string;
  timeout: number;
  retry: number;
  [key: string]: unknown;  // 允许扩展，但值是 unknown（强制收窄）
};
\`\`\`

## 19.8 实战：实现 Config 类型

\`\`\`tsx
// 严格配置：已知字段强类型，未知字段也安全
type Config = {
  apiUrl: string;
  timeout: number;
  retry: number;
  headers: Record<string, string>;
};

// 派生：部分更新
type ConfigUpdate = Partial<Config>;

// 派生：只读
type FrozenConfig = Readonly<Config>;

// 派生：取值类型联合
type ConfigValue = Config[keyof Config];  // string | number | Record<string, string>
\`\`\`

## 19.9 实战：用 Record 替代索引签名

\`\`\`tsx
// 索引签名版本（弱）
type Cache1 = { [key: string]: User };
const c1: Cache1 = {};  // 空对象也合法，c1.any 返回 User 但运行时 undefined

// Record 版本（强）
type UserId = string;  // 可以是 branded type
type Cache2 = Record<UserId, User>;
const c2: Cache2 = {} as Cache2;  // 需要断言，但后续访问有类型
\`\`\`

更安全的做法：用 \`Map<K, V>\` 在运行时也保证类型。

\`\`\`tsx
const userCache = new Map<string, User>();
userCache.set('u1', { id: 1, name: 'Tom' });
const u = userCache.get('u1');  // User | undefined（TS 知道可能不存在）
\`\`\`

## 19.10 实际项目中的应用

**场景 1：环境变量配置**

\`\`\`tsx
type EnvKey = 'API_URL' | 'NODE_ENV' | 'PORT';
type Env = Record<EnvKey, string>;

const env: Env = {
  API_URL: '/api',
  NODE_ENV: 'production',
  PORT: '3000',
};
\`\`\`

**场景 2：HTTP header**

\`\`\`tsx
type CommonHeaders = Record<'Content-Type' | 'Accept' | 'Authorization', string>;
const headers: CommonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer xxx',
};
\`\`\`

**场景 3：Redux action 类型映射**

\`\`\`tsx
type ActionMap = {
  'user/login': { userId: string };
  'user/logout': undefined;
  'post/create': { title: string };
};

type ActionType = keyof ActionMap;  // 'user/login' | 'user/logout' | 'post/create'
type ActionPayload<K extends ActionType> = ActionMap[K];
\`\`\`

**场景 4：组件 props 索引访问**

\`\`\`tsx
type ButtonProps = { size: 'sm' | 'md'; color: string; onClick: () => void };
type SizeProp = ButtonProps['size'];  // 'sm' | 'md'
type ClickHandler = ButtonProps['onClick'];  // () => void
\`\`\`

## 19.11 小结

- 索引签名 \`{ [key: string]: T }\` 描述任意 key 的对象，但弱类型
- \`Record<K, V>\` 是索引签名的安全替代，要求 key 必须属于 K
- 索引访问类型 \`T[K]\` 从对象类型取属性类型，K 可以是联合
- \`keyof\` + \`T[K]\` 组合可取值类型联合
- \`T[number]\` 取数组元素类型
- **永远不要用 \`[key: string]: any\`**，用 \`Record\` 或 \`unknown\` 代替
`,
    code: `// =============================================================
// 第 19 章示例：索引签名与索引访问类型
// =============================================================

// ---- 索引签名 ----
type StringMap = { [key: string]: string };

const dict: StringMap = {
  hello: 'world',
  foo: 'bar',
  anyKey: 'anyValue',
};

console.log('=== 索引签名 ===');
console.log('StringMap:', dict);

// ---- Record 的安全保证 ----
type Role = 'admin' | 'user' | 'guest';
type RoleMap = Record<Role, string[]>;

const rolePerms: RoleMap = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read'],
};

console.log('\\n=== Record 强制 key 完整 ===');
console.log('RoleMap:', rolePerms);

// ---- 索引访问类型 ----
type User = { id: number; name: string; email: string; tags: string[] };

type IdType = User['id'];                  // number
type NameType = User['name'];              // string
type MultiType = User['id' | 'name'];      // number | string
type AllValues = User[keyof User];         // number | string | string[]

const id: IdType = 1;
const name: NameType = 'Tom';
const multi: MultiType = 'hello';
const all1: AllValues = 1;
const all2: AllValues = 'hello';
const all3: AllValues = ['a', 'b'];

console.log('\\n=== 索引访问类型 ===');
console.log('User["id"]    :', id);
console.log('User["name"]  :', name);
console.log('User["id"|"name"]:', multi);
console.log('User[keyof User]  :', all1, all2, all3);

// ---- keyof + 索引访问组合 ----
type ValueOf<T> = T[keyof T];

type Config = {
  apiUrl: string;
  timeout: number;
  retry: number;
};

type ConfigValue = ValueOf<Config>;   // string | number

const cv1: ConfigValue = '/api';
const cv2: ConfigValue = 3000;

console.log('\\n=== ValueOf<T> ===');
console.log('ValueOf<Config>:', cv1, cv2);

// ---- 数组元素类型 ----
const arr = [{ id: 1, name: 'Tom' }, { id: 2, name: 'Jerry' }];
type ArrItem = (typeof arr)[number];   // { id: number; name: string }

const item: ArrItem = { id: 3, name: 'Spike' };
console.log('\\n=== 数组元素类型 ===');
console.log('(typeof arr)[number]:', item);

// ---- 元组索引访问 ----
type Tuple = [string, number, boolean];
type T0 = Tuple[0];      // string
type T1 = Tuple[1];      // number
type TAll = Tuple[number];  // string | number | boolean

const t0: T0 = 'hello';
const t1: T1 = 42;
const tAll: TAll = true;

console.log('\\n=== 元组索引访问 ===');
console.log('Tuple[0]     :', t0);
console.log('Tuple[1]     :', t1);
console.log('Tuple[number]:', tAll);

// ---- Config 类型实现 ----
type AppConfig = {
  apiUrl: string;
  timeout: number;
  retry: number;
  headers: Record<string, string>;
};

const config: AppConfig = {
  apiUrl: '/api/v1',
  timeout: 5000,
  retry: 3,
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token123',
  },
};

console.log('\\n=== Config 类型实现 ===');
console.log('AppConfig:', config);

// ---- 派生类型 ----
type ConfigUpdate = Partial<AppConfig>;     // 部分更新
type FrozenConfig = Readonly<AppConfig>;    // 只读
type ConfigKeys = keyof AppConfig;          // 'apiUrl' | 'timeout' | 'retry' | 'headers'

const update: ConfigUpdate = { timeout: 10000 };  // 只改一个字段
const frozen: FrozenConfig = config;
const k: ConfigKeys = 'apiUrl';

console.log('\\n=== 派生类型 ===');
console.log('Partial<AppConfig>:', update);
console.log('Readonly<AppConfig>:', frozen);
console.log('keyof AppConfig:', k);

// ---- HTTP header 安全类型 ----
type CommonHeader = Record<'Content-Type' | 'Accept' | 'Authorization', string>;
const headers: CommonHeader = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: 'Bearer xxx',
};

console.log('\\n=== HTTP header ===');
console.log('CommonHeader:', headers);

// ---- 反例对比：[key: string]: any vs Record ----
type BadConfig = { [key: string]: any };
const bad: BadConfig = {
  apiUrl: '/api',
  timeout: 3000,
  whatever: () => 0,    // 不报错，但完全失控
};

type GoodConfig = Record<'apiUrl' | 'timeout' | 'retry', string | number>;
const good: GoodConfig = {
  apiUrl: '/api',
  timeout: 3000,
  retry: 3,
  // whatever: 1,  // 报错：不在 key 范围内
};

console.log('\\n=== 反例：[key:string]:any ===');
console.log('BadConfig (失控):', bad);
console.log('GoodConfig (受控):', good);

console.log('\\n=== 关键点回顾 ===');
console.log('1. 索引签名 [key: string]: T 描述任意 key，但弱类型');
console.log('2. Record<K, V> 是索引签名的安全替代');
console.log('3. T[K] 索引访问类型从对象取属性类型');
console.log('4. T[number] 取数组/元组元素类型');
console.log('5. 永远不要用 [key: string]: any');
`,
  },
  {
    id: "tspro-type-gymnastics",
    group: "三、TypeScript 高级类型",
    icon: "🤸",
    title: "类型体操实战（10 道经典题）",
    content: `# 第 20 章：类型体操实战（10 道经典题）

## 20.1 为什么要练类型体操

类型体操（Type Gymnastics）听起来像炫技，但它有非常实际的价值：

- **理解 TS 类型系统的边界**：知道什么能做、什么不能做
- **看懂第三方库类型定义**：React、Redux、Zod 的类型都是体操产物
- **写出更安全的代码**：能把"运行时检查"前置到"编译时检查"

本章选 10 道经典题，覆盖递归、条件类型、infer、元组操作、模板字面量等核心技术。每题先讲思路，再讲实现，最后 demo 验证。

## 20.2 题目 1：DeepPartial

**需求**：递归地把对象所有层级的属性都变成可选。

**思路**：\`Partial\` 只处理第一层。要让深层也变可选，需要在映射类型的值类型上递归调用 \`DeepPartial\`。但要小心函数、数组、基本类型不要递归（避免无限循环）。

\`\`\`tsx
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
\`\`\`

**验证**：

\`\`\`tsx
type User = { id: number; profile: { name: string; address: { city: string } } };
type T = DeepPartial<User>;
// { id?: number; profile?: { name?: string; address?: { city?: string } } }
\`\`\`

## 20.3 题目 2：DeepReadonly

**需求**：递归地把所有层级属性变成只读。

**思路**：与 \`DeepPartial\` 同理，递归 \`readonly\`。

\`\`\`tsx
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
\`\`\`

**验证**：

\`\`\`tsx
type State = { count: number; user: { name: string } };
type T = DeepReadonly<State>;
// { readonly count: number; readonly user: { readonly name: string } }
\`\`\`

## 20.4 题目 3：Mutable

**需求**：去掉对象第一层的 \`readonly\`（非递归）。

**思路**：映射类型用 \`-readonly\`。

\`\`\`tsx
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
\`\`\`

**验证**：

\`\`\`tsx
type Frozen = { readonly a: number; readonly b: string };
type T = Mutable<Frozen>;  // { a: number; b: string }
\`\`\`

## 20.5 题目 4：PickByValue

**需求**：从对象类型中挑出"值类型符合条件"的属性。

**思路**：先用映射类型构造 \`{ [K]: K 是 V 的子类型 ? K : never }\`，再用 \`keyof\` 取出联合，最后用 \`Pick\`。

\`\`\`tsx
type PickByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T]>;
\`\`\`

**验证**：

\`\`\`tsx
type Obj = { id: number; name: string; age: number; active: boolean };
type T = PickByValue<Obj, number>;
// { id: number; age: number }
\`\`\`

## 20.6 题目 5：GetReturnType

**需求**：提取函数的返回值类型（自实现 \`ReturnType\`）。

**思路**：条件类型 + \`infer\`。

\`\`\`tsx
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

**验证**：

\`\`\`tsx
type T = GetReturnType<() => string>;  // string
type T2 = GetReturnType<(x: number) => boolean>;  // boolean
\`\`\`

## 20.7 题目 6：PromiseType

**需求**：解包 \`Promise<T>\` 得到 \`T\`（非递归版本）。

**思路**：条件类型 + \`infer\`。

\`\`\`tsx
type PromiseType<T> = T extends Promise<infer V> ? V : never;
\`\`\`

**递归版**（解嵌套 Promise）：

\`\`\`tsx
type DeepPromiseType<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? DeepPromiseType<V>
    : V
  : T;
\`\`\`

**验证**：

\`\`\`tsx
type T = PromiseType<Promise<number>>;  // number
type T2 = DeepPromiseType<Promise<Promise<string>>>;  // string
\`\`\`

## 20.8 题目 7：TupleToObject

**需求**：把元组转成对象，key 是索引，value 是元素类型。

**思路**：用映射类型遍历元组的索引（\`keyof T\` 对元组来说是数字索引）。

\`\`\`tsx
type TupleToObject<T extends readonly any[]> = {
  [K in keyof T]: T[K];
};
\`\`\`

**验证**：

\`\`\`tsx
type T = TupleToObject<['a', 'b', 'c']>;
// { 0: 'a'; 1: 'b'; 2: 'c' }
\`\`\`

## 20.9 题目 8：Length

**需求**：获取元组的长度。

**思路**：元组的 \`length\` 属性就是字面量数字类型。

\`\`\`tsx
type Length<T extends readonly any[]> = T['length'];
\`\`\`

**验证**：

\`\`\`tsx
type T = Length<[1, 2, 3]>;  // 3
type T2 = Length<[]>;        // 0
\`\`\`

## 20.10 题目 9：First

**需求**：获取元组的第一个元素类型。

**思路**：条件类型 + \`infer\`，匹配 \`[infer F, ...any[]]\`。

\`\`\`tsx
type First<T extends readonly any[]> = T extends [infer F, ...any[]] ? F : never;
\`\`\`

**验证**：

\`\`\`tsx
type T = First<[1, 2, 3]>;   // 1
type T2 = First<[]>;         // never
\`\`\`

## 20.11 题目 10：Last

**需求**：获取元组的最后一个元素类型。

**思路**：用 \`...any[], infer L\` 匹配"最后一个元素"。

\`\`\`tsx
type Last<T extends readonly any[]> = T extends [...any[], infer L] ? L : never;
\`\`\`

**验证**：

\`\`\`tsx
type T = Last<[1, 2, 3]>;   // 3
type T2 = Last<[]>;         // never
\`\`\`

## 20.12 综合练习建议

练完这 10 道，可以挑战更高难度的题：

- \`DeepMutable\`：递归去掉 readonly
- \`MutableKeys\`：找出非只读的 key
- \`OptionalKeys\`：找出可选的 key
- \`FunctionKeys\`：找出值为函数的 key
- \`UnionToIntersection\`：联合类型转交叉类型
- \`JoinStr\`：字符串联合类型用分隔符连接

推荐资源：[type-challenges](https://github.com/type-challenges/type-challenges)。

## 20.13 实战心法

1. **先想运行时怎么做，再想类型怎么做**：类型体操往往是运行时代码的"类型层面翻译"
2. **递归是核心武器**：DeepPartial / DeepReadonly / Awaited 都靠递归
3. **\`infer\` 是瑞士军刀**：函数返回值、数组元素、Promise 内部、元组首尾，全是 \`infer\`
4. **\`never\` 是过滤器**：在映射类型里返回 \`never\` 等于"剔除这个 key"
5. **元组用 rest 匹配**：\`[infer F, ...any[]]\` 取首，\`[...any[], infer L]\` 取尾
6. **不要为了体操而体操**：能简单就简单，可读性优先

## 20.14 小结

| 题目 | 核心技术 | 关键点 |
| --- | --- | --- |
| DeepPartial | 递归 + 映射类型 | 值类型递归调用 |
| DeepReadonly | 递归 + 映射类型 | 同上 |
| Mutable | \`-readonly\` | 去修饰符 |
| PickByValue | 映射类型 + 条件类型 + Pick | 用 never 过滤 key |
| GetReturnType | infer | \`(...args) => infer R\` |
| PromiseType | infer | \`Promise<infer V>\` |
| TupleToObject | 映射类型遍历元组 | \`[K in keyof T]\` |
| Length | 索引访问 | \`T['length']\` |
| First | infer + rest 元组 | \`[infer F, ...any[]]\` |
| Last | infer + rest 元组 | \`[...any[], infer L]\` |
`,
    code: `// =============================================================
// 第 20 章示例：类型体操 10 道经典题
// =============================================================

// ---- 题目 1：DeepPartial ----
// 递归把所有层级属性变可选
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// ---- 题目 2：DeepReadonly ----
// 递归把所有层级属性变只读
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// ---- 题目 3：Mutable ----
// 去掉第一层 readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// ---- 题目 4：PickByValue ----
// 按值类型挑 key
type PickByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T]>;

// ---- 题目 5：GetReturnType ----
// 提取函数返回值类型
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// ---- 题目 6：PromiseType ----
// 解包 Promise（递归版）
type DeepPromiseType<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? DeepPromiseType<V>
    : V
  : T;

// ---- 题目 7：TupleToObject ----
// 元组转对象
type TupleToObject<T extends readonly any[]> = {
  [K in keyof T]: T[K];
};

// ---- 题目 8：Length ----
// 元组长度
type Length<T extends readonly any[]> = T['length'];

// ---- 题目 9：First ----
// 元组首元素
type First<T extends readonly any[]> = T extends [infer F, ...any[]] ? F : never;

// ---- 题目 10：Last ----
// 元组尾元素
type Last<T extends readonly any[]> = T extends [...any[], infer L] ? L : never;

// =============================================================
// 验证 10 道题
// =============================================================

// ---- 题目 1：DeepPartial ----
type User1 = { id: number; profile: { name: string; address: { city: string } } };
type T1 = DeepPartial<User1>;
const dpUser: T1 = {};   // 全部可省，连 profile.address.city 也可省
console.log('=== 题 1：DeepPartial ===');
console.log('DeepPartial<User> 允许空对象:', dpUser);
const dpUser2: T1 = { profile: { address: {} } };  // 中间层也可省
console.log('DeepPartial<User> 部分填充:', dpUser2);

// ---- 题目 2：DeepReadonly ----
type State2 = { count: number; user: { name: string } };
type T2 = DeepReadonly<State2>;
const drState: T2 = { count: 1, user: { name: 'Tom' } };
// drState.user.name = 'Jerry';  // 类型错误：只读
console.log('\\n=== 题 2：DeepReadonly ===');
console.log('DeepReadonly<State>:', drState);

// ---- 题目 3：Mutable ----
type Frozen3 = { readonly a: number; readonly b: string };
type T3 = Mutable<Frozen3>;
const mObj: T3 = { a: 1, b: 'x' };
mObj.a = 100;   // OK，已去掉 readonly
console.log('\\n=== 题 3：Mutable ===');
console.log('Mutable<Frozen> 可修改:', mObj);

// ---- 题目 4：PickByValue ----
type Obj4 = { id: number; name: string; age: number; active: boolean };
type T4 = PickByValue<Obj4, number>;
const pbv: T4 = { id: 1, age: 18 };   // 只保留 number 类型字段
console.log('\\n=== 题 4：PickByValue ===');
console.log("PickByValue<Obj, number>:", pbv);

// ---- 题目 5：GetReturnType ----
function greet(): string { return 'hello'; }
function calc(x: number, y: number): number { return x + y; }

type R5a = GetReturnType<typeof greet>;    // string
type R5b = GetReturnType<typeof calc>;     // number
const g5a: R5a = 'hi';
const g5b: R5b = 42;
console.log('\\n=== 题 5：GetReturnType ===');
console.log('GetReturnType<greet>:', g5a);
console.log('GetReturnType<calc>  :', g5b);

// ---- 题目 6：PromiseType ----
type P6 = DeeppromiseTypeTest<Promise<Promise<number>>>;
type DeeppromiseTypeTest<T> = T extends Promise<infer V>
  ? V extends Promise<any>
    ? DeeppromiseTypeTest<V>
    : V
  : T;
const p6: P6 = 42;
console.log('\\n=== 题 6：PromiseType ===');
console.log('DeepPromiseType<Promise<Promise<number>>>:', p6);

// ---- 题目 7：TupleToObject ----
type Tup7 = ['a', 'b', 'c'];
type T7 = TupleToObject<Tup7>;
const tto: T7 = { 0: 'a', 1: 'b', 2: 'c' };
console.log('\\n=== 题 7：TupleToObject ===');
console.log('TupleToObject<["a","b","c"]>:', tto);

// ---- 题目 8：Length ----
type L8a = Length<[1, 2, 3]>;   // 3
type L8b = Length<[]>;          // 0
const l8a: L8a = 3;
const l8b: L8b = 0;
console.log('\\n=== 题 8：Length ===');
console.log('Length<[1,2,3]>:', l8a);
console.log('Length<[]>     :', l8b);

// ---- 题目 9：First ----
type F9 = First<[1, 2, 3]>;     // 1
type F9b = First<[]>;           // never
const f9: F9 = 1;
console.log('\\n=== 题 9：First ===');
console.log('First<[1,2,3]>:', f9);

// ---- 题目 10：Last ----
type L10 = Last<[1, 2, 3]>;     // 3
type L10b = Last<['a', 'b']>;   // 'b'
const l10: L10 = 3;
const l10b: L10b = 'b';
console.log('\\n=== 题 10：Last ===');
console.log('Last<[1,2,3]>  :', l10);
console.log("Last<['a','b']>:", l10b);

// ---- 综合演示：所有题目汇总 ----
console.log('\\n=== 10 道题汇总 ===');
const summary = [
  '1. DeepPartial<T>     - 递归可选',
  '2. DeepReadonly<T>    - 递归只读',
  '3. Mutable<T>         - 去掉 readonly',
  '4. PickByValue<T, V>  - 按值挑 key',
  '5. GetReturnType<T>   - 函数返回值',
  '6. DeepPromiseType<T> - 解包 Promise',
  '7. TupleToObject<T>   - 元组转对象',
  '8. Length<T>          - 元组长度',
  '9. First<T>           - 元组首元素',
  '10. Last<T>           - 元组尾元素',
];
summary.forEach((s) => console.log('  ' + s));

console.log('\\n=== 核心技术总结 ===');
console.log('1. 递归：DeepPartial / DeepReadonly / Awaited');
console.log('2. infer：ReturnType / Parameters / First / Last');
console.log('3. -readonly / -?：去修饰符');
console.log('4. never 过滤：PickByValue / RemoveMethods');
console.log('5. rest 元组：[infer F, ...any[]] 取首，[...any[], infer L] 取尾');
console.log('6. 索引访问：T["length"] / T[number] / T[K]');
`,
  },
];
