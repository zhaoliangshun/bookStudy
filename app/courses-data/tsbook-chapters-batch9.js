// =============================================================
// TypeScript 全解 · Batch 9：类型体操（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 类型体操的核心套路与经典实现：
//   1. 深度 Partial / Required   tsbook-deep-partial
//   2. 元组类型体操              tsbook-tuple-type
//   3. 对象类型体操              tsbook-object-type
//   4. 联合类型体操              tsbook-union-type
//   5. 递归类型与深度限制        tsbook-recursive-type
// 章节归属 group：类型体操
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：深度 Partial 与 Required
  // ===========================================================
  {
    id: "tsbook-deep-partial",
    title: "深度 Partial 与 Required",
    icon: "🌊",
    group: "类型体操",
    content: `# 🌊 深度 Partial 与 Required

内置的 \`Partial<T>\` 和 \`Required<T>\` 是**浅层**的——只把第一层属性变成可选 / 必选，嵌套对象原封不动。真实业务里表单、配置、PATCH 接口经常需要把**所有层级**都变成可选，这时就要写递归版本。

## 一、为什么内置 Partial 是浅层的

\`\`\`ts
interface User {
  name: string;
  profile: {
    age: number;
    address: {
      city: string;
    };
  };
}

// 内置 Partial：只有第一层变可选
type ShallowPartial = Partial<User>;
// 等价于：
// {
//   name?: string;
//   profile?: {        // ← 这里还是必选
//     age: number;      // ← 这里还是必选
//     address: { city: string };  // ← 完全没动
//   };
// }
\`\`\`

表单场景里你只想改 \`profile.address.city\`，但 \`age\` 还是必填——这就尴尬了。需要 \`DeepPartial\`。

## 二、DeepPartial：递归把所有嵌套变可选

\`\`\`ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
\`\`\`

拆解：
- \`[K in keyof T]?\` —— 映射类型 + \`?\`，把每个属性变可选。
- \`T[K] extends object ? ... : ...\` —— 条件类型：如果属性值是对象，**递归** \`DeepPartial\`；否则原样保留。
- 注意 \`?\` 写在 \`]\` 后面，是映射类型的修饰。

## 三、DeepReadonly / DeepMutable

\`\`\`ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepMutable<T[K]> : T[K];
};
\`\`\`

- \`readonly\` 加在 \`[\` 前 —— 加只读修饰。
- \`-readonly\` —— 移除只读修饰（\`-\` 是删修饰符）。
- \`DeepMutable\` 是 \`DeepReadonly\` 的反操作，常用于"先把对象冻结成只读，再选择性解冻"。

## 四、DeepRequired：把所有层级的可选去掉

\`\`\`ts
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};
\`\`\`

\`-?\` 是关键：移除 \`?\` 可选修饰。常用于"接收一份可能缺字段的配置，但内部代码假设字段都齐全"——入口处 \`DeepRequired\` 一下，后续就当全必选用。

## 五、一个常见的坑：函数也是 object

\`\`\`extends object\` 会把函数、数组、Date 都判为 \`true\`，递归下去类型可能变怪。生产级实现通常更严格：

\`\`\`ts
type DeepPartial<T> = T extends (...args: any[]) => any
  ? T                                        // 函数：不递归
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }   // 对象：递归
  : T;                                       // 原始类型：原样
\`\`\`

类型体操的"分情况讨论"通常用嵌套的条件类型 + \`extends\` 来表达。

## 六、一句话总结

- 内置 \`Partial\` / \`Required\` / \`Readonly\` 都是**浅层**的。
- 深度版本靠**映射类型 + 条件类型 + 递归**三件套。
- \`?\` / \`readonly\` 前加 \`-\` 表示移除修饰。
- 函数、数组也是 \`object\`，生产实现要单独处理。

> *下一章，元组类型体操——递归在元组上的精彩发挥。*`,
    code: `// 🌊 深度 Partial / Readonly / Required 演示

// ============================================================
// 1️⃣ 定义一个多层嵌套的类型（用于后续演示）
// ============================================================

interface User {
  name: string;                       // 第一层：原始类型
  age: number;
  profile: {                          // 第一层：对象
    bio: string;
    address: {                        // 第二层：对象
      city: string;
      zip: string;
    };
    hobbies: string[];                // 数组（也是 object）
  };
}

// 原始数据
const user: User = {
  name: "Tom",
  age: 18,
  profile: {
    bio: "Hello",
    address: { city: "Shanghai", zip: "200000" },
    hobbies: ["coding", "music"]
  }
};
console.log("--- 1️⃣ 原始 User ---");
console.log(JSON.stringify(user, null, 2));

// ============================================================
// 2️⃣ 浅层 Partial（内置）：只有第一层变可选
// ============================================================

type ShallowPartialUser = Partial<User>;
// 等价于：
//   { name?: string; age?: number; profile?: { bio; address; hobbies } }
// profile 内部依旧是必选，改不了 address.city 单独一个字段

const shallow: ShallowPartialUser = { name: "Jerry" };   // ✅ 只给 name
console.log("--- 2️⃣ 浅层 Partial ---");
console.log("只填 name 也能通过：", shallow);

// ============================================================
// 3️⃣ DeepPartial：递归把所有层级变可选
// ============================================================

// 核心实现：映射类型 + 条件类型 + 递归
type DeepPartial<T> = {
  [K in keyof T]?:                    // 每个属性加 ?（变可选）
    T[K] extends object               // 如果属性值是 object
      ? DeepPartial<T[K]>             //   递归 DeepPartial
      : T[K];                         // 否则原样保留（string/number 等）
};

// 用法：表单初始值，所有字段都可选
type DeepPartialUser = DeepPartial<User>;

// ✅ 可以只填很深的某一个字段，其余全省略
const form: DeepPartialUser = {
  profile: {
    address: { city: "Beijing" }      // 只改 city，zip / bio / hobbies 都不用填
  }
};
console.log("--- 3️⃣ DeepPartial ---");
console.log("只填 profile.address.city：", JSON.stringify(form));

// ============================================================
// 4️⃣ DeepReadonly：递归把所有层级变只读
// ============================================================

type DeepReadonly<T> = {
  readonly [K in keyof T]:            // 每个属性加 readonly
    T[K] extends object               // 如果是 object
      ? DeepReadonly<T[K]>            //   递归 DeepReadonly
      : T[K];                         // 否则原样
};

type ReadonlyUser = DeepReadonly<User>;
const frozen: ReadonlyUser = {
  name: "Tom",
  age: 18,
  profile: { bio: "x", address: { city: "SH", zip: "200" }, hobbies: [] }
};

// ❌ 以下都会编译报错（演示用，注释掉）：
// frozen.name = "Jerry";                       // 第一层只读
// frozen.profile.address.city = "BJ";          // 深层也只读
console.log("--- 4️⃣ DeepReadonly ---");
console.log("DeepReadonly 后所有层级都不可改：", frozen.name, frozen.profile.address.city);

// ============================================================
// 5️⃣ DeepMutable：递归移除只读（DeepReadonly 的反操作）
// ============================================================

type DeepMutable<T> = {
  -readonly [K in keyof T]:           // -readonly 表示移除 readonly
    T[K] extends object
      ? DeepMutable<T[K]>
      : T[K];
};

// 先把对象 DeepReadonly，再 DeepMutable 解冻
type MutableAgain = DeepMutable<ReadonlyUser>;
const thawed: MutableAgain = {
  name: "Tom",
  age: 18,
  profile: { bio: "x", address: { city: "SH", zip: "200" }, hobbies: [] }
};
thawed.profile.address.city = "Beijing";   // ✅ 可以改了
console.log("--- 5️⃣ DeepMutable ---");
console.log("解冻后可改 city：", thawed.profile.address.city);

// ============================================================
// 6️⃣ DeepRequired：递归移除可选 ?
// ============================================================

type DeepRequired<T> = {
  [K in keyof T]-?:                   // -? 表示移除 ?（变必选）
    T[K] extends object
      ? DeepRequired<T[K]>
      : T[K];
};

// 入口可能字段缺失，但内部希望全部必填
type StrictForm = DeepRequired<DeepPartialUser>;
// 所有层级的 ? 都被去掉了，全部必填

const strict: StrictForm = {
  name: "Tom",
  age: 18,
  profile: {
    bio: "hello",
    address: { city: "SH", zip: "200" },
    hobbies: ["a"]
  }
};
console.log("--- 6️⃣ DeepRequired ---");
console.log("DeepRequired 后所有字段必填：", strict.name, strict.profile.address.city);

// ============================================================
// 7️⃣ 生产级实现：函数 / 数组单独处理
// ============================================================

// 简单版 DeepPartial 把函数也当对象递归，类型可能变怪
// 生产版用嵌套条件类型分情况：
type SafeDeepPartial<T> =
  T extends (...args: any[]) => any    // 情况 1：函数
    ? T                                //   原样返回，不递归
    : T extends object                 // 情况 2：对象（含数组）
      ? { [K in keyof T]?: SafeDeepPartial<T[K]> }  // 递归
      : T;                             // 情况 3：原始类型，原样

interface HasFn {
  name: string;
  callback: (x: number) => void;       // 函数属性
  nested: { value: number };
}

type PartialHasFn = SafeDeepPartial<HasFn>;
// callback 依旧是 (x: number) => void，不会被递归搞坏
const demo: PartialHasFn = {
  callback: (x) => console.log(x),     // 函数类型保持不变
  nested: { value: 42 }                // 嵌套对象依旧递归 Partial
};
console.log("--- 7️⃣ 生产级 SafeDeepPartial ---");
console.log("函数保持原样，对象继续递归：");
demo.callback?.(99);
console.log("nested.value =", demo.nested?.value);

// ============================================================
// 8️⃣ 实战场景：PATCH 接口 + 表单初始值
// ============================================================

// 后端 PATCH /user/:id 接口：只传需要改的字段
interface UpdateUserDTO extends DeepPartial<User> {}

// 前端表单：用户只填了一部分
const patch: UpdateUserDTO = {
  profile: {
    address: { city: "Hangzhou" }      // 只改城市
  }
};
console.log("--- 8️⃣ PATCH DTO 场景 ---");
console.log("提交给后端的 patch：", JSON.stringify(patch));
`,
  },

  // ===========================================================
  // 第 2 章：元组类型体操
  // ===========================================================
  {
    id: "tsbook-tuple-type",
    title: "元组类型体操",
    icon: "🎲",
    group: "类型体操",
    content: `# 🎲 元组类型体操

元组（tuple）是 TypeScript 里**长度固定、每个位置类型可不同**的数组。元组体操的核心技巧只有一句话：**用递归把元组拆成"第一个 + 剩下的"**，几乎所有元组操作都是这个套路。

## 一、为什么元组体操要靠递归

TS 没有循环，但类型可以**自引用**——也就是递归。元组天然适合递归拆解：

\`\`\`ts
type Tuple = [1, 2, 3];

// 用模式匹配把元组拆成 head + tail
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
// Head<[1,2,3]> = 1
\`\`\`

\`T extends [infer H, ...any[]]\` 是关键：
- 这是在问：\`T\` 能不能匹配 \`[第一个, ...剩下的任意]\` 的形状？
- \`infer H\` 声明一个类型变量 \`H\`，自动绑定为"第一个元素的类型"。
- \`...any[]\` 是剩余元素（rest pattern），匹配后面的所有。

## 二、First / Last / Pop / Push / Shift

\`\`\`ts
type First<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Last<T extends any[]>  = T extends [...any[], infer L] ? L : never;
type Pop<T extends any[]>   = T extends [...infer Rest, any] ? Rest : [];
type Shift<T extends any[]> = T extends [any, ...infer Rest] ? Rest : [];
type Push<T extends any[], V> = [...T, V];
type Unshift<T extends any[], V> = [V, ...T];
\`\`\`

注意 \`Last\` 和 \`Pop\` 用的是 \`[...any[], infer L]\`——**rest 在前**，捕获最后一个。这是 TS 4.0+ 才支持的"剩余元素在任意位置"语法。

## 三、Concat：两个元组拼接

\`\`\`ts
type Concat<A extends any[], B extends any[]> = [...A, ...B];
// Concat<[1, 2], [3, 4]> = [1, 2, 3, 4]
\`\`\`

直接用展开语法，无需递归。

## 四、Reverse：递归反转

\`\`\`ts
type Reverse<T extends any[]> =
  T extends [infer H, ...infer Rest]
    ? [...Reverse<Rest>, H]     // Rest 反转后，把 H 接到末尾
    : [];
// Reverse<[1, 2, 3]> = [3, 2, 1]
\`\`\`

经典递归：取头部 \`H\`，递归反转 \`Rest\`，然后把 \`H\` 拼到结果**末尾**。

## 五、Drop / Take / Slice

\`\`\`ts
type Drop<T extends any[], N extends number> =
  N extends 0
    ? T
    : T extends [any, ...infer Rest]
      ? Drop<Rest, Sub<N, 1>>      // 需要减法（见下文）
      : [];

type Take<T extends any[], N extends number> =
  N extends 0
    ? []
    : T extends [infer H, ...infer Rest]
      ? [H, ...Take<Rest, Sub<N, 1>>]
      : [];
\`\`\`

涉及数字递减的体操很麻烦，因为 TS **没有原生的减法**——得用元组长度模拟。这部分通常借助 \`type-fest\` 等工具库。

## 六、实战：TupleToObject / Zip

\`\`\`ts
// 元组转对象：键值来自两个元组
type Zip<K extends string[], V extends any[]> =
  K extends [infer KK extends string, ...infer KR]
    ? V extends [infer VV, ...infer VR]
      ? { [P in KK]: VV } & Zip<KR, VR>
      : {}
    : {};
\`\`\`

复杂场景里 \`infer X extends Y\` 这种"约束推断"很常用——既推断又约束类型。

## 七、一句话总结

- 元组体操的万能套路：\`T extends [infer H, ...infer Rest] ? ... : ...\`。
- \`infer\` 是声明"占位类型变量"的关键字。
- \`[...any[], infer L]\` 捕获最后一个元素。
- 复杂操作（Drop / Slice 涉及数字）通常借助元组长度模拟，生产场景直接用 \`type-fest\`。

> *下一章，对象类型体操——keyof + 映射 + 条件三件套。*`,
    code: `// 🎲 元组类型体操演示

// ============================================================
// 1️⃣ First / Last：取首尾元素
// ============================================================

// First：用 infer H 捕获第一个元素
type First<T extends any[]> =
  T extends [infer H, ...any[]]       // 匹配 [第一个, ...任意]
    ? H                               // 返回第一个
    : never;                          // 空元组返回 never

// Last：rest 放前面，捕获最后一个
type Last<T extends any[]> =
  T extends [...any[], infer L]       // 匹配 [...任意, 最后一个]
    ? L
    : never;

type T1 = [string, number, boolean];
type F1 = First<T1>;   // string
type L1 = Last<T1>;    // boolean

console.log("--- 1️⃣ First / Last ---");
const f1: F1 = "hello";
const l1: L1 = true;
console.log("First<[string, number, boolean]> =", typeof f1, f1);
console.log("Last<[string, number, boolean]>  =", typeof l1, l1);

// ============================================================
// 2️⃣ Pop / Shift：去掉首尾
// ============================================================

// Pop：去掉最后一个
type Pop<T extends any[]> =
  T extends [...infer Rest, any]      // 匹配 [...前面的, 最后一个]
    ? Rest                            // 返回前面的
    : [];

// Shift：去掉第一个
type Shift<T extends any[]> =
  T extends [any, ...infer Rest]      // 匹配 [第一个, ...后面的]
    ? Rest                            // 返回后面的
    : [];

type T2 = [1, 2, 3, 4];
type P2 = Pop<T2>;     // [1, 2, 3]
type S2 = Shift<T2>;   // [2, 3, 4]

console.log("--- 2️⃣ Pop / Shift ---");
const p2: P2 = [1, 2, 3];
const s2: S2 = [2, 3, 4];
console.log("Pop<[1,2,3,4]>   =", p2);
console.log("Shift<[1,2,3,4]> =", s2);

// ============================================================
// 3️⃣ Push / Unshift：追加元素
// ============================================================

// Push：在末尾追加（直接展开）
type Push<T extends any[], V> = [...T, V];
// Unshift：在开头追加
type Unshift<T extends any[], V> = [V, ...T];

type T3 = [1, 2];
type PU3 = Push<T3, 3>;       // [1, 2, 3]
type UN3 = Unshift<T3, 0>;    // [0, 1, 2]

console.log("--- 3️⃣ Push / Unshift ---");
const pu3: PU3 = [1, 2, 3];
const un3: UN3 = [0, 1, 2];
console.log("Push<[1,2], 3>   =", pu3);
console.log("Unshift<[1,2], 0> =", un3);

// ============================================================
// 4️⃣ Concat：拼接两个元组
// ============================================================

type Concat<A extends any[], B extends any[]> = [...A, ...B];

type T4a = [1, 2];
type T4b = [3, 4];
type C4 = Concat<T4a, T4b>;   // [1, 2, 3, 4]

console.log("--- 4️⃣ Concat ---");
const c4: C4 = [1, 2, 3, 4];
console.log("Concat<[1,2],[3,4]> =", c4);

// ============================================================
// 5️⃣ Reverse：递归反转（经典中的经典）
// ============================================================

type Reverse<T extends any[]> =
  T extends [infer H, ...infer Rest]    // 取头 H 和尾 Rest
    ? [...Reverse<Rest>, H]             // Rest 反转后，把 H 接到末尾
    : [];                               // 空元组返回空

type T5 = [1, "two", true, 4];
type R5 = Reverse<T5>;                  // [4, true, "two", 1]

console.log("--- 5️⃣ Reverse（递归）---");
const r5: R5 = [4, true, "two", 1];
console.log("Reverse<[1,'two',true,4]> =", r5);

// ============================================================
// 6️⃣ Length：取元组长度（用 T['length']）
// ============================================================

type Length<T extends any[]> = T["length"];

type T6 = [string, number, boolean, null];
type L6 = Length<T6>;    // 4（字面量类型 4）

console.log("--- 6️⃣ Length ---");
const len: L6 = 4;
console.log("Length<[string,number,boolean,null]> =", len);

// ============================================================
// 7️⃣ Flatten：把嵌套元组拍平（递归）
// ============================================================

type Flatten<T extends any[]> =
  T extends [infer H, ...infer Rest]
    ? H extends any[]                    // 如果 H 本身是元组
      ? [...Flatten<H>, ...Flatten<Rest>]  // 拍平 H + 拍平 Rest
      : [H, ...Flatten<Rest>]            // H 不是元组：原样保留 + 拍平 Rest
    : [];

type T7 = [1, [2, 3], [4, [5, 6]], 7];
type Flat7 = Flatten<T7>;               // [1, 2, 3, 4, 5, 6, 7]

console.log("--- 7️⃣ Flatten（递归拍平）---");
const flat7: Flat7 = [1, 2, 3, 4, 5, 6, 7];
console.log("Flatten<[1,[2,3],[4,[5,6]],7]> =", flat7);

// ============================================================
// 8️⃣ 实战：TupleToObject + Zip
// ============================================================

// 元组转联合类型
type TupleToUnion<T extends any[]> = T[number];
type T8 = ["a", "b", "c"];
type U8 = TupleToUnion<T8>;   // "a" | "b" | "c"

console.log("--- 8️⃣ TupleToUnion ---");
const u8: U8 = "b";           // 只能是 "a" / "b" / "c"
console.log("TupleToUnion<['a','b','c']> =", u8);

// Zip：两个元组按位置配对成对象
type Zip<
  K extends (string | number | symbol)[],
  V extends any[]
> =
  K extends [infer KK extends (string | number | symbol), ...infer KR extends any[]]
    ? V extends [infer VV, ...infer VR extends any[]]
      ? { [P in KK]: VV } & Zip<KR, VR>   // 当前一对 + 递归剩下的
      : {}
    : {};

type Keys = ["name", "age", "city"];
type Vals = [string, number, string];
type Zipped = Zip<Keys, Vals>;
// 推导出：{ name: string } & { age: number } & { city: string }

// 交叉类型可以赋给一个具名对象
const zipped: Zipped = { name: "Tom", age: 18, city: "SH" };
console.log("--- 8️⃣ Zip 元组配对 ---");
console.log("Zip<['name','age','city'],[string,number,string]> =");
console.log("  name =", zipped.name, "age =", zipped.age, "city =", zipped.city);

// ============================================================
// 9️⃣ 实战：Tuple 类型守卫函数签名
// ============================================================

// 利用元组保留参数列表，避免 any[] 丢失信息
function callTuple<T extends any[], R>(
  fn: (...args: T) => R,
  args: T                          // args 严格匹配 fn 的参数元组
): R {
  return fn(...args);              // 展开调用，类型安全
}

const result = callTuple(
  (a: number, b: string) => \`\${a}-\${b}\`,
  [42, "hello"]                    // ✅ 严格匹配 [number, string]
);
console.log("--- 9️⃣ Tuple 保留参数列表 ---");
console.log("callTuple 结果 =", result);

// ❌ 传错顺序 / 数量都会编译报错：
//   callTuple((a: number, b: string) => "", ["hello", 42]);   // 顺序错
//   callTuple((a: number, b: string) => "", [42]);            // 数量少
`,
  },

  // ===========================================================
  // 第 3 章：对象类型体操
  // ===========================================================
  {
    id: "tsbook-object-type",
    title: "对象类型体操",
    icon: "🧩",
    group: "类型体操",
    content: `# 🧩 对象类型体操

对象体操的"三件套"是：\`keyof\`（取键的联合）+ **映射类型**（重写每个属性）+ **条件类型**（按条件分支）。三者组合能玩出花来：可选键提取、只读键提取、改键名、按值过滤属性……

## 一、keyof + in：基础映射

\`\`\`ts
type T = { a: string; b: number };
type Keys = keyof T;            // "a" | "b"

type Optional<T> = {
  [K in keyof T]?: T[K];        // 遍历每个键，加 ?
};
\`\`\`

- \`keyof T\` 得到键的**联合类型**。
- \`[K in keyof T]\` 是映射类型：遍历每个键 \`K\`，重写属性签名。
- \`T[K]\` 是索引访问：取键 \`K\` 对应的值类型。

## 二、OptionalKeys / RequiredKeys：分离可选与必选

\`\`\`ts
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;  // 关键判断
}[keyof T];
\`\`\`

这是体操里**最绕**的一个套路，拆开看：

1. \`{} extends Pick<T, K>\` —— 问问"空对象能赋给 \`{ K: T[K] }\` 吗？"
   - 如果 \`K\` 是**可选**的，\`{ K?: ... }\` 可以被 \`{}\` 赋值 → \`extends\` 成立 → 返回 \`K\`。
   - 如果 \`K\` 是**必选**的，\`{}\` 不能赋给 \`{ K: ... }\` → 不成立 → 返回 \`never\`。
2. \`[keyof T]\` —— 把对象的所有值取出来组成联合。\`never\` 在联合里会被忽略。

\`RequiredKeys\` 把判断反过来即可。

## 三、Get<T, K>：嵌套路径取值

\`\`\`ts
type Get<T, K extends string> =
  K extends \`\${infer Head}.\${infer Tail}\`
    ? Head extends keyof T
      ? Get<T[Head], Tail>           // 递归往下取
      : never
    : K extends keyof T
      ? T[K]
      : never;

// Get<User, "profile.address.city">
\`\`\`

用模板字面量类型把 \`"a.b.c"\` 拆成 \`Head="a"\` + \`Tail="b.c"\`，递归取值。**模板字面量 + infer** 是路径体操的核心。

## 四、OmitNever：去掉值为 never 的键

\`\`\`ts
type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
\`\`\`

\`as\` 子句是**键重映射**（TS 4.1+）：可以保留、改名或丢弃键。重映射成 \`never\` 就等于删除。

## 五、MutableKeys / ReadonlyKeys

\`\`\`ts
type MutableKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [P in K]: T[K] },
    { -readonly [P in K]: T[K] },
    K, never
  >;
}[keyof T];

type IfEquals<X, Y, A, B = never> =
  (<U>() => U extends X ? 1 : 2) extends (<U>() => U extends Y ? 1 : 2) ? A : B;
\`\`\`

判断"只读 vs 可变"没有直接 API，要用 \`IfEquals\` 这种**多重 extends 函数**的奇技淫巧——这是体操里最难的部分，能看懂就行，不用强记。

## 六、Set<T, K, V>：路径赋值

\`\`\`ts
type SetType<T, K extends string, V> =
  K extends \`\${infer Head}.\${infer Tail}\`
    ? Head extends keyof T
      ? { [P in keyof T]: P extends Head ? SetType<T[P], Tail, V> : T[P] }
      : T
    : K extends keyof T
      ? { [P in keyof T]: P extends K ? V : T[P] }
      : T;
\`\`\`

和 \`Get\` 互为对偶：一个取路径值，一个改路径值。常用于 immutability-helper 这类库。

## 七、一句话总结

- 三件套：\`keyof\` 取键联合、\`[K in keyof T]\` 映射、\`extends ? :\` 条件。
- \`{} extends Pick<T,K>\` 判断可选；\`IfEquals\` 判断只读。
- 模板字面量 + \`infer\` 解析路径字符串。
- \`as\` 子句重映射键，重映射成 \`never\` 等于删除键。

> *下一章，联合类型体操——分布式条件类型的"魔法"。*`,
    code: `// 🧩 对象类型体操演示

// ============================================================
// 1️⃣ 准备一个演示类型：混合可选 / 只读 / 必选属性
// ============================================================

interface User {
  id: number;                  // 必选、可变
  name: string;                // 必选、可变
  readonly createdAt: Date;    // 必选、只读
  nickname?: string;           // 可选、可变
  readonly tags?: string[];    // 可选、只读
}

console.log("--- 1️⃣ 演示类型 User ---");
console.log("id, name       —— 必选 + 可变");
console.log("createdAt      —— 必选 + 只读");
console.log("nickname?      —— 可选 + 可变");
console.log("tags?          —— 可选 + 只读");

// ============================================================
// 2️⃣ OptionalKeys：提取所有可选键
// ============================================================

// 关键判断：{} extends Pick<T, K>
//   - 如果 K 可选：{ K?: T[K] } 能被空对象 {} 赋值 → extends 成立 → 返回 K
//   - 如果 K 必选：{} 不能赋给 { K: T[K] } → 不成立 → 返回 never
// 最后 [keyof T] 把所有值取出来，never 在联合里被忽略
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type OK = OptionalKeys<User>;   // "nickname" | "tags"
console.log("--- 2️⃣ OptionalKeys ---");
const okKey: OK = "nickname";   // ✅ 只能是 "nickname" 或 "tags"
console.log("OptionalKeys<User> =", okKey);

// ============================================================
// 3️⃣ RequiredKeys：提取所有必选键（判断反过来）
// ============================================================

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;   // 反过来
}[keyof T];

type RK = RequiredKeys<User>;   // "id" | "name" | "createdAt"
console.log("--- 3️⃣ RequiredKeys ---");
const rkKey: RK = "id";          // ✅ "id" / "name" / "createdAt"
console.log("RequiredKeys<User> =", rkKey);

// ============================================================
// 4️⃣ Get<T, Path>：按点分路径取嵌套值类型
// ============================================================

// 用模板字面量类型拆 "a.b.c" -> Head="a", Tail="b.c"
type Get<T, K extends string> =
  K extends \`\${infer Head}.\${infer Tail}\`   // 路径里有点
    ? Head extends keyof T                    // Head 是 T 的键
      ? Get<T[Head], Tail>                    //   递归往下取
      : never                                 //   不是键返回 never
    : K extends keyof T                       // 路径没点
      ? T[K]                                  //   直接取值
      : never;                                //   不是键返回 never

interface Profile {
  address: { city: string; zip: number };
  bio: string;
}
interface GetUser {
  profile: Profile;
  name: string;
}

type CityType = Get<GetUser, "profile.address.city">;   // string
type ZipType = Get<GetUser, "profile.address.zip">;     // number
type NameType = Get<GetUser, "name">;                   // string

console.log("--- 4️⃣ Get 路径取值 ---");
const city: CityType = "Shanghai";
const zip: ZipType = 200000;
const uname: NameType = "Tom";
console.log("Get<User, 'profile.address.city'> =", city);
console.log("Get<User, 'profile.address.zip'>  =", zip);
console.log("Get<User, 'name'>                 =", uname);

// ============================================================
// 5️⃣ OmitNever：去掉值为 never 的键（用 as 重映射）
// ============================================================

// as 子句：把键重新映射；映射成 never 等价于删除该键
type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

// 构造一个带 never 的类型
type WithNever = {
  keep: string;
  drop: never;
  stay: number;
};
type Clean = OmitNever<WithNever>;   // { keep: string; stay: number }

console.log("--- 5️⃣ OmitNever ---");
const clean: Clean = { keep: "x", stay: 1 };
// @ts-expect-error  drop 已经被移除，赋值会报错（演示用）
const wrong: Clean = { keep: "x", stay: 1, drop: 1 as never };
console.log("OmitNever 后剩余键：", Object.keys(clean));

// ============================================================
// 6️⃣ MutableKeys：提取可变（非只读）键
// ============================================================

// 判断只读没有直接 API，要用 IfEquals 比较两种写法是否相同
type IfEquals<X, Y, A, B = never> =
  (<U>() => U extends X ? 1 : 2) extends (<U>() => U extends Y ? 1 : 2)
    ? A
    : B;

// 思路：把 K 单独拿出来，
//   版本 A：原样（保留 readonly）
//   版本 B：加 -readonly（去掉 readonly）
// 如果两者相等 → 原本就没 readonly → 可变
type MutableKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [P in K]: T[K] },              // 原样
    { -readonly [P in K]: T[K] },    // 去掉 readonly
    K,                                // 相等：可变键
    never                             // 不等：只读键
  >;
}[keyof T];

type MK = MutableKeys<User>;   // "id" | "name" | "nickname"
console.log("--- 6️⃣ MutableKeys ---");
const mkKey: MK = "name";       // ✅ "id" / "name" / "nickname"
console.log("MutableKeys<User> =", mkKey);

// ============================================================
// 7️⃣ ReadonlyKeys：提取只读键（反过来）
// ============================================================

type ReadonlyKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [P in K]: T[K] },
    { -readonly [P in K]: T[K] },
    never,                          // 相等：可变 → never
    K                               // 不等：只读 → K
  >;
}[keyof T];

type RoK = ReadonlyKeys<User>;   // "createdAt" | "tags"
console.log("--- 7️⃣ ReadonlyKeys ---");
const rokKey: RoK = "createdAt";  // ✅ "createdAt" / "tags"
console.log("ReadonlyKeys<User> =", rokKey);

// ============================================================
// 8️⃣ PickByValue：按值类型挑键
// ============================================================

// as 子句 + 条件类型：值匹配的键保留，否则 never
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface Mix {
  id: number;
  name: string;
  age: number;
  email: string;
  active: boolean;
}

type StringKeys = PickByValue<Mix, string>;   // { name; email }
type NumberKeys = PickByValue<Mix, number>;   // { id; age }

console.log("--- 8️⃣ PickByValue ---");
const sk: StringKeys = { name: "Tom", email: "t@t.com" };
const nk: NumberKeys = { id: 1, age: 18 };
console.log("PickByValue<Mix, string> =", JSON.stringify(sk));
console.log("PickByValue<Mix, number> =", JSON.stringify(nk));

// ============================================================
// 9️⃣ 实战：表单字段提取（可选字段集合）
// ============================================================

// 业务场景：一个表单的所有可选字段，初始值可以全不填
type OptionalFields = OptionalKeys<User>;
type OptionalUserFields = Pick<User, OptionalFields>;

const initForm: OptionalUserFields = {};   // ✅ 全空也能通过
console.log("--- 9️⃣ 表单可选字段初始值 ---");
console.log("OptionalUserFields 初始值：", JSON.stringify(initForm));

const partialForm: OptionalUserFields = {
  nickname: "Tommy",                       // ✅ 只填可选字段
};
console.log("部分填写：", JSON.stringify(partialForm));
`,
  },

  // ===========================================================
  // 第 4 章：联合类型体操
  // ===========================================================
  {
    id: "tsbook-union-type",
    title: "联合类型体操",
    icon: "🔗",
    group: "类型体操",
    content: `# 🔗 联合类型体操

联合类型 \`A | B | C\` 在条件类型里有一种**魔法行为**：分布式条件类型（distributive conditional）。这一行为是几乎所有联合体操的基石——理解了它，UnionToIntersection / UnionToTuple 这些"反人类"的实现就能看懂。

## 一、分布式条件类型：联合会"拆开"再"合上"

\`\`\`ts
type T1 = string | number extends string | number ? "yes" : "no";
// 不对！这里 extends 不分布，因为左边不是裸类型参数

type IsString<T> = T extends string ? "yes" : "no";
type T2 = IsString<string | number>;
// = IsString<string> | IsString<number>
// = "yes" | "no"
\`\`\`

**关键规则**：当 \`T extends U ? X : Y\` 中 \`T\` 是**裸类型参数**（naked type parameter，即直接写 \`T\` 而非 \`T[]\` / \`[T]\` / \`Promise<T>\`）时，对联合类型会**分布**——把联合的每个成员单独代入，最后再联合起来。

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>;   // string[] | number[]
// 不是 (string | number)[]！
\`\`\`

## 二、UnionToIntersection：联合转交叉

\`\`\`ts
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
    ? I
    : never;
\`\`\`

经典套路：
1. \`U extends any ? (k: U) => void : never\` —— 把联合 \`A | B\` 转成函数联合 \`(k: A) => void | (k: B) => void\`。
2. 函数联合在 \`infer\` 时会**取交叉**：\`(k: A) => void | (k: B) => void\` 的 \`infer I\` 推出 \`A & B\`。
3. 这是因为函数参数位置是反变的，多个函数类型的"共同参数"必须是它们的交叉。

效果：\`A | B | C\` → \`A & B & C\`。

## 三、LastInUnion：取联合最后一个

\`\`\`ts
type LastInUnion<U> =
  UnionToIntersection<U extends any ? (x: U) => void : never> extends
    ((x: infer L) => void) ? L : never;
\`\`\`

把联合转成交叉后，再用 \`infer L\` 取最后一个"函数参数"。注意这只能取**最后一个**，且对顺序有依赖——TS 里联合顺序未严格定义，但实践中通常稳定。

## 四、UnionToTuple：联合转元组

\`\`\`ts
type UnionToTuple<U, Last = LastInUnion<U>> =
  [U] extends [never]              // 联合空了就停
    ? []
    : [Last, ...UnionToTuple<Exclude<U, Last>>];
\`\`\`

递归取最后一个，然后 \`Exclude\` 掉它，再继续取，直到联合为空。注意 \`[U] extends [never]\` 用方括号包起来是**阻止分布式**——空联合判断必须这么写。

## 五、注意事项

- **联合顺序未保证**：\`A | B\` 和 \`B | A\` 在 TS 内部是同一个类型，\`UnionToTuple\` 的结果顺序**不保证稳定**。
- **性能**：\`UnionToTuple\` 对大联合（10+ 成员）可能让编译变慢。
- **限制**：\`never\` 在联合里会被忽略——\`string | never\` 等于 \`string\`。

## 六、实战：Dispatch 表 / 路由表

\`\`\`ts
type Events = "click" | "hover" | "focus";
type Handlers = {
  [E in Events]: (e: E) => void;
};
// 等价于把联合"展开"成对象键
\`\`\`

\`UnionToTuple\` 真实业务用得少，但理解它背后"分布 + 反变 + 递归"的组合，对掌握类型系统极有价值。

## 七、一句话总结

- 裸类型参数的 \`extends\` 会**分布**到联合的每个成员。
- \`UnionToIntersection\` 利用函数参数反变把联合转成交叉。
- \`LastInUnion\` + \`Exclude\` + 递归 = \`UnionToTuple\`。
- \`[U] extends [never]\` 包方括号 = 阻止分布，用来判断空联合。
- 联合顺序不保证，生产环境别依赖 \`UnionToTuple\` 的顺序。

> *下一章，递归类型与深度限制——TS 类型系统的边界。*`,
    code: `// 🔗 联合类型体操演示

// ============================================================
// 1️⃣ 分布式条件类型：联合会"拆开"再"合上"
// ============================================================

// 裸类型参数 T 在 extends 时会分布到联合的每个成员
type ToArray<T> = T extends any ? T[] : never;

// 对联合：分别代入再联合
type R1 = ToArray<string | number | boolean>;
// = ToArray<string> | ToArray<number> | ToArray<boolean>
// = string[] | number[] | boolean[]
// 不是 (string | number | boolean)[]！

const r1: R1 = ["a"];   // ✅ 是 string[]
console.log("--- 1️⃣ 分布式条件类型 ---");
console.log("ToArray<string|number|boolean> = string[] | number[] | boolean[]");
console.log("r1 =", r1);

// ============================================================
// 2️⃣ 阻止分布：用方括号把 T 包起来
// ============================================================

// [T] extends [any] —— T 不再是"裸"参数，不会分布
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type R2 = ToArrayNonDistributive<string | number>;
// = (string | number)[]  —— 整体变成数组，不是分别

const r2: R2 = ["a", 1];   // ✅ 可以混 string 和 number
console.log("--- 2️⃣ 阻止分布 ---");
console.log("NonDistributive<string|number> = (string | number)[]");
console.log("r2 =", r2);

// ============================================================
// 3️⃣ UnionToIntersection：联合转交叉（核心套路）
// ============================================================

// 步骤 1：U extends any ? (k: U) => void : never
//   把 A | B 变成 (k: A) => void | (k: B) => void
// 步骤 2：函数联合 extends ((k: infer I) => void)
//   infer I 在函数参数位置（反变），推出 A & B
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
    ? I
    : never;

type U1 = { name: string } | { age: number } | { city: string };
type Cross1 = UnionToIntersection<U1>;
// = { name: string } & { age: number } & { city: string }

// 交叉类型需要同时满足所有成员
const obj: Cross1 = { name: "Tom", age: 18, city: "SH" };
console.log("--- 3️⃣ UnionToIntersection ---");
console.log("UnionToIntersection<{name}|{age}|{city}> = 三者交叉");
console.log("obj =", JSON.stringify(obj));

// ============================================================
// 4️⃣ 函数参数反变的直观演示
// ============================================================

// 为什么函数联合的 infer 会得到交叉？
// 因为只有同时满足所有函数参数的类型，才能赋给"任意一个函数"
type FnUnion = ((x: string) => void) | ((x: number) => void);
type ParamOf = UnionToIntersection<FnUnion> extends never ? never : FnUnion extends never ? never : "see code";

// 直观理解：要找一个类型 X，使得 X 既能赋给 (x: string)=>void 的参数位置
// 又能赋给 (x: number)=>void 的参数位置 → X 必须是 string & number
// （string & number 实际为 never，这里仅作示意）
console.log("--- 4️⃣ 函数参数反变 ---");
console.log("函数联合 (x:A)=>void | (x:B)=>void 的参数推断为 A & B");
console.log("（因为参数位置反变，要同时满足两个函数的约束）");

// ============================================================
// 5️⃣ LastInUnion：取联合的"最后一个"成员
// ============================================================

type LastInUnion<U> =
  UnionToIntersection<U extends any ? (x: U) => void : never> extends
    ((x: infer L) => void)
      ? L
      : never;

// 对顺序敏感（TS 联合顺序在实践中通常稳定但未严格保证）
type U2 = "a" | "b" | "c";
type Last2 = LastInUnion<U2>;   // 通常是 "c"

console.log("--- 5️⃣ LastInUnion ---");
const last2: Last2 = "c";        // ✅ 通常是 "c"
console.log("LastInUnion<'a'|'b'|'c'> =", last2);

// ============================================================
// 6️⃣ UnionToTuple：递归把联合转元组
// ============================================================

// [U] extends [never] —— 方括号阻止分布，用来判断空联合
type UnionToTuple<U, Last = LastInUnion<U>> =
  [U] extends [never]               // 联合空了
    ? []                            //   返回空元组
    : [Last, ...UnionToTuple<Exclude<U, Last>>];  // 取最后一个 + 递归剩下的

type U3 = 1 | 2 | 3;
type T3 = UnionToTuple<U3>;        // 通常是 [3, 2, 1]（顺序反向）

console.log("--- 6️⃣ UnionToTuple ---");
// 演示：把元组打印出来
const t3: T3 = [3, 2, 1];          // ✅ 顺序通常是反的（因为每次取 Last）
console.log("UnionToTuple<1|2|3> =", t3, "（顺序依赖 LastInUnion，可能反向）");

// ============================================================
// 7️⃣ Exclude / Extract：内置的联合操作
// ============================================================

// Exclude：从联合中排除某些成员
type E1 = Exclude<"a" | "b" | "c", "a">;   // "b" | "c"
// Extract：从联合中提取某些成员
type E2 = Extract<string | number | boolean, string | number>;   // string | number

console.log("--- 7️⃣ Exclude / Extract ---");
const e1: E1 = "b";    // ✅ "b" 或 "c"
const e2: E2 = "x";    // ✅ string 或 number
console.log("Exclude<'a'|'b'|'c', 'a'> =", e1);
console.log("Extract<string|number|boolean, string|number> =", e2);

// ============================================================
// 8️⃣ 实战 1：联合转对象 Dispatch 表
// ============================================================

type EventName = "click" | "hover" | "focus";
type EventHandler<E extends string> = (e: E) => void;

// 把联合"展开"成对象键（用映射类型）
type DispatchTable<E extends string> = {
  [K in E]: EventHandler<K>;        // 每个事件名对应一个 handler
};

type Table = DispatchTable<EventName>;
// = { click: (e: "click") => void; hover: ...; focus: ... }

const table: Table = {
  click: (e) => console.log("clicked:", e),     // e 自动收窄为 "click"
  hover: (e) => console.log("hovered:", e),     // e 自动收窄为 "hover"
  focus: (e) => console.log("focused:", e)      // e 自动收窄为 "focus"
};
console.log("--- 8️⃣ Dispatch 表 ---");
table.click("click");
table.hover("hover");

// ============================================================
// 9️⃣ 实战 2：用 UnionToIntersection 合并 mixin
// ============================================================

// 多个 mixin 类型合并成一个交叉类型
type WithName = { name: string };
type WithAge = { age: number };
type WithId = { id: number };

type Mixin = WithName | WithAge | WithId;
type Combined = UnionToIntersection<Mixin>;
// = { name: string } & { age: number } & { id: number }

const entity: Combined = { name: "Tom", age: 18, id: 1 };
console.log("--- 9️⃣ UnionToIntersection 合并 mixin ---");
console.log("Combined =", JSON.stringify(entity));

// ============================================================
// 🔟 never 在联合里被忽略的演示
// ============================================================

type WithNever = string | number | never | boolean;
// 实际等价于 string | number | boolean
type WN = WithNever;   // never 被吸收

const wn: WN = "x";    // ✅
console.log("--- 🔟 never 被吸收 ---");
console.log("string | number | never | boolean === string | number | boolean");
console.log("wn =", wn);
`,
  },

  // ===========================================================
  // 第 5 章：递归类型与深度限制
  // ===========================================================
  {
    id: "tsbook-recursive-type",
    title: "递归类型与深度限制",
    icon: "🌀",
    group: "类型体操",
    content: `# 🌀 递归类型与深度限制

类型可以引用自己，这就是递归类型——比如树、链表、JSON 结构。但 TS 对递归深度有**硬上限**（约 50 层左右，具体随版本和场景变化），超过会报 \`Type instantiation is excessively deep\`。本章讲清楚递归类型的写法、深度限制的成因、绕过方法。

## 一、递归类型的两种形态

**直接自引用**：

\`\`\`ts
type Tree<T> = {
  value: T;
  children: Tree<T>[];     // 直接引用自己
};
\`\`\`

**条件类型 + infer 递归**（体操常用）：

\`\`\`ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
\`\`\`

第二种是体操的核心——递归发生在条件类型的分支里。

## 二、深度限制：为什么有，是多少

TS 编译器实例化递归类型时是**展开式**的——每递归一次就"复制"一份类型。为防止编译器卡死，有递归深度上限：

- TS 4.5+ 大约 **50 层左右**（不同场景有差异，部分场景能到 100）。
- 超过会报 \`Type instantiation is excessively deep and possibly infinite. ts(2589)\`。
- 还有一个**实例数上限**（约 5,000,000 个类型实例），大联合 + 递归容易触发。

\`\`\`ts
type Deep<T> = { next: Deep<T> };
type D = Deep<unknown>["next"]["next"]["next"]["next"]["next"]["next"];
// 写到 50 层左右就开始报错
\`\`\`

## 三、尾递归优化（TS 4.5+）

TS 4.5 起，**尾递归**的类型会被优化为循环，深度上限大幅提高。判定条件：递归调用是分支的**最后一步**，没有外层包裹。

\`\`\`ts
// ✅ 尾递归：递归调用直接返回，没有外层包裹
type Reverse<T extends any[]> =
  T extends [infer H, ...infer R]
    ? [...Reverse<R>, H]   // ❌ 不是尾递归！外层有 [..., H]
    : [];

// 改写成尾递归（带累加器）
type ReverseTR<T extends any[], Acc extends any[] = []> =
  T extends [infer H, ...infer R]
    ? ReverseTR<R, [H, ...Acc>]   // ✅ 尾递归：递归调用是最后一步
    : Acc;
\`\`\`

尾递归版本能处理**上千层**的元组，性能差异巨大。

## 四、@ts-ignore 兜底

某些场景下深度限制绕不过去，只能用 \`@ts-ignore\` 临时压制：

\`\`\`ts
// @ts-expect-error 递归深度超限，运行时正确，类型层面放弃
const value: SomeDeepType = something;
\`\`\`

**优先策略**：
1. 优化成尾递归。
2. 拆分类型，减少递归层数。
3. 实在不行用 \`any\` 或 \`unknown\` 兜底。
4. 最后才是 \`@ts-ignore\`。

## 五、Json\<T> 类型：递归的经典应用

\`\`\`ts
type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [K: string]: Json };
\`\`\`

描述任意 JSON 值的形状。注意 \`Json\` 在联合里自引用——这是合法的。

更精细的 \`Json<T>\` 能保留对象的具体键：

\`\`\`ts
type Json<T> =
  T extends string | number | boolean | null ? T
  : T extends (infer U)[] ? Json<U>[]
  : T extends object ? { [K in keyof T]: Json<T[K]> }
  : never;
\`\`\`

## 六、Path\<T>：对象所有路径的联合

\`\`\`ts
type Path<T, P extends string = ""> =
  T extends object
    ? {
        [K in keyof T & string]:
          Path<T[K], \`\${P extends "" ? "" : P + "."}\${K}\`>;
      }[keyof T & string]
    : P;
\`\`\`

生成形如 \`"profile" | "profile.address" | "profile.address.city"\` 的路径联合。常用于 i18n、表单校验、ORM 查询构建器。

## 七、性能考虑

- 大联合 + 递归 = 编译变慢。 \`UnionToTuple\` 对 20+ 成员的联合可能让单次类型检查慢 1 秒以上。
- \`type-fest\` 等库里的工具都经过尾递归优化，能用库就别自己写。
- \`skipLibCheck: true\` 跳过 .d.ts 检查，能减少递归开销。

## 八、一句话总结

- 递归类型有深度上限（~50 层），超限报 ts(2589)。
- 尾递归（TS 4.5+）能处理上千层，优先改写成尾递归。
- \`@ts-ignore\` 是最后兜底，别滥用。
- \`Json<T>\` / \`Path<T>\` 是递归类型的经典应用。
- 大联合 + 递归性能差，能用工具库就用工具库。

> *至此，类型体操 5 章完结。下一 batch 我们进入实战模式。*`,
    code: `// 🌀 递归类型与深度限制演示

// ============================================================
// 1️⃣ 直接自引用：树形结构
// ============================================================

type Tree<T> = {
  value: T;
  children?: Tree<T>[];        // 自引用，可选实现"叶子节点无 children"
};

// 构造一棵树
const tree: Tree<string> = {
  value: "root",
  children: [
    { value: "a", children: [{ value: "a1" }, { value: "a2" }] },
    { value: "b" }
  ]
};

console.log("--- 1️⃣ 递归类型：树 ---");
console.log(JSON.stringify(tree, null, 2));

// ============================================================
// 2️⃣ 链表：经典递归类型
// ============================================================

type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;   // 自引用 + null 终止
};

const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } }
};

console.log("--- 2️⃣ 递归类型：链表 ---");
let cur: LinkedList<number> | null = list;
const arr: number[] = [];
while (cur !== null) {
  arr.push(cur.value);
  cur = cur.next;
}
console.log("链表转数组：", arr);

// ============================================================
// 3️⃣ 深度限制演示（注释保留，运行时不触发）
// ============================================================

// 这个类型如果展开到 50 层左右会触发 ts(2589)
// type Deep<T> = { next: Deep<T> };
// type D50 = Deep<unknown>["next"]["next"]["next"]["next"]["next"]
//   ["next"]["next"]["next"]["next"]["next"]
//   /* ... 重复 50 次 ... */;

console.log("--- 3️⃣ 深度限制 ---");
console.log("TS 递归深度上限约 50 层");
console.log("超过会报 ts(2589): Type instantiation is excessively deep");

// ============================================================
// 4️⃣ 非尾递归 vs 尾递归（Reverse 对比）
// ============================================================

// ❌ 非尾递归版本：递归调用外层有 [..., H] 包裹
type ReverseNaive<T extends any[]> =
  T extends [infer H, ...infer R]
    ? [...ReverseNaive<R>, H]      // 递归调用在 [..., H] 内部，不是尾位置
    : [];

// ✅ 尾递归版本：带累加器 Acc，递归调用直接返回
type ReverseTR<T extends any[], Acc extends any[] = []> =
  T extends [infer H, ...infer R]
    ? ReverseTR<R, [H, ...Acc]>    // 递归调用是最后一步，TS 4.5+ 会优化成循环
    : Acc;

type Src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
type Rev1 = ReverseNaive<Src>;     // 小元组没问题
type Rev2 = ReverseTR<Src>;        // 尾递归版本，大元组也能扛

console.log("--- 4️⃣ 尾递归优化 ---");
const rev1: Rev1 = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const rev2: Rev2 = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
console.log("ReverseNaive<[1..10]> =", rev1);
console.log("ReverseTR<[1..10]>    =", rev2);
console.log("（大元组时尾递归版本远优于非尾递归）");

// ============================================================
// 5️⃣ DeepFlatten：递归拍平嵌套元组
// ============================================================

type DeepFlatten<T extends any[]> =
  T extends [infer H, ...infer R]
    ? H extends any[]                              // H 是元组
      ? [...DeepFlatten<H>, ...DeepFlatten<R>]     // 拍平 H + 拍平 R
      : [H, ...DeepFlatten<R>]                     // H 不是元组：保留 + 拍平 R
    : [];

type Nested = [1, [2, [3, [4]]], 5];
type Flat = DeepFlatten<Nested>;   // [1, 2, 3, 4, 5]

console.log("--- 5️⃣ DeepFlatten ---");
const flat: Flat = [1, 2, 3, 4, 5];
console.log("DeepFlatten<[1,[2,[3,[4]]],5]> =", flat);

// ============================================================
// 6️⃣ Json 类型：递归描述任意 JSON 值
// ============================================================

// 通用 Json 类型：递归联合
type Json =
  | null                       // null
  | boolean                    // 布尔
  | number                     // 数字
  | string                     // 字符串
  | Json[]                     // 数组（元素也是 Json）
  | { [K: string]: Json };     // 对象（值也是 Json）

// 任何 JSON 都能赋给 Json
const data: Json = {
  name: "Tom",
  age: 18,
  tags: ["a", "b"],
  address: { city: "SH", zip: 200000 },
  active: true,
  note: null
};

console.log("--- 6️⃣ Json 类型 ---");
console.log("任意 JSON 都能赋给 Json：");
console.log(JSON.stringify(data, null, 2));

// ============================================================
// 7️⃣ Json<T>：保留对象结构的"精修版"
// ============================================================

// 把 class / function / Date 等转成 JSON 兼容的类型
type JsonT<T> =
  T extends string | number | boolean | null
    ? T                                    // 原始类型：原样
    : T extends (infer U)[]                 // 数组
      ? JsonT<U>[]
      : T extends object                   // 对象
        ? { [K in keyof T]: JsonT<T[K]> }  //   递归每个属性
        : never;                           // 其他（function / class 等）丢弃

interface UserWithDate {
  name: string;
  createdAt: Date;          // Date 在 JSON 化时通常转 string
  tags: string[];
}

// 演示 JsonT 把 Date 转成 never（说明这种简单版本需要扩展）
type UserJsonShape = JsonT<UserWithDate>;
// name: string, createdAt: never, tags: string[]

console.log("--- 7️⃣ Json<T> 保留结构 ---");
console.log("JsonT<User> 把非 JSON 类型（Date / Function）转成 never");
console.log("（生产实现会做更细致的转换，例如把 Date 转成 string）");

// ============================================================
// 8️⃣ Path<T>：生成对象所有路径联合（递归 + 模板字面量）
// ============================================================

type Path<T, P extends string = ""> =
  T extends object
    ? {
        // 遍历每个键，递归生成更深路径
        [K in keyof T & string]:
          Path<
            T[K],
            \`\${P extends "" ? "" : \`\${P}.\`}\${K}\`   // 拼接路径：a.b.c
          >;
      }[keyof T & string]                   // 取所有值组成联合
    : P;                                    // 非对象：返回当前路径

interface UserPath {
  profile: {
    address: {
      city: string;
      zip: number;
    };
    bio: string;
  };
  name: string;
}

type AllPaths = Path<UserPath>;
// = "profile" | "profile.address" | "profile.address.city"
//  | "profile.address.zip" | "profile.bio" | "name"

console.log("--- 8️⃣ Path<T> 路径联合 ---");
const p1: AllPaths = "profile.address.city";   // ✅
const p2: AllPaths = "name";                    // ✅
const p3: AllPaths = "profile.bio";             // ✅
console.log("Path<UserPath> 包含：", p1, "|", p2, "|", p3);

// ============================================================
// 9️⃣ 实战：get(obj, path) 类型安全的路径访问
// ============================================================

// 结合 Get<T, P>（上一章实现）和 Path<T>，实现类型安全的 lodash.get
type Get<T, K extends string> =
  K extends \`\${infer Head}.\${infer Tail}\`
    ? Head extends keyof T
      ? Get<T[Head], Tail>
      : never
    : K extends keyof T
      ? T[K]
      : never;

function get<T, P extends Path<T> & string>(
  obj: T,
  path: P
): Get<T, P> {
  // 运行时实现：按点拆分逐层访问
  return path.split(".").reduce((acc: any, key) => acc?.[key], obj);
}

const user = {
  profile: { address: { city: "Shanghai", zip: 200000 }, bio: "hello" },
  name: "Tom"
};

const city = get(user, "profile.address.city");   // 类型：string
const zip = get(user, "profile.address.zip");     // 类型：number
const name = get(user, "name");                   // 类型：string

console.log("--- 9️⃣ 类型安全的 get ---");
console.log("city =", city);
console.log("zip  =", zip);
console.log("name =", name);

// ❌ 传不存在的路径会编译报错：
//   get(user, "profile.address.street");   // 不在 Path<UserPath> 里
//   get(user, "name.first");               // name 不是对象

// ============================================================
// 🔟 @ts-ignore 兜底示例（仅在递归实在绕不过时用）
// ============================================================

// 假设某个超深递归类型编译报 ts(2589)，运行时是正确的：
// type SuperDeep = /* ... 50 层以上的递归 ... */;
// const value: SuperDeep = someValue;
// // @ts-expect-error 递归深度超限，类型层面放弃，运行时已验证
// const value2: SuperDeep = someValue;

console.log("--- 🔟 @ts-ignore 兜底 ---");
console.log("递归深度超 ts(2589) 时，最后手段是用 @ts-ignore / @ts-expect-error 压制");
console.log("优先级：尾递归优化 > 拆分类型 > any/unknown 兜底 > @ts-ignore");
`,
  },
];
