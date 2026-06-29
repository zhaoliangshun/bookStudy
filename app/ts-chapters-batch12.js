// =============================================================
// TypeScript 交互式教程 —— 第十二批章节（共 7 章 · 泛型深度专题）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-generics-essentials         — 泛型本质与核心机制
//   2. ts-generics-constraints-deep   — 泛型约束与 keyof 深入
//   3. ts-generics-inference-deep     — 泛型类型推断机制
//   4. ts-generics-conditional-infer  — 条件类型、infer 与分布式条件类型
//   5. ts-generics-mapped-templates   — 映射类型与模板字面量类型
//   6. ts-generics-variance           — 协变、逆变与变型原理
//   7. ts-generics-patterns-pitfalls  — 泛型设计模式、陷阱与最佳实践
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为"泛型专题"）
//   content : Markdown 格式的详细讲解（侧重原理与机制）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器, isolatedModules)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 高级类型（条件类型/映射类型/infer/模板字面量类型/变型）
//     在转译后全部被擦除，代码 demo 用 typeof / 运行时值验证
//     运行行为，并用注释说明编译期的类型计算结果
//   - 类型错误不会阻止运行（教程侧重运行结果）
//   - 泛型是编译期特性：运行时不存在类型参数，不能 typeof T
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：泛型本质与核心机制
  // =========================================================
  {
    id: "ts-generics-essentials",
    title: "泛型本质与核心机制",
    icon: "🧬",
    group: "泛型专题",
    content: `## 泛型本质与核心机制

前面"泛型 (Generics)"一章已经展示了泛型的基本用法。本章换一个视角，从**机制与原理**层面重新审视泛型：泛型到底是什么？它在编译期和运行期分别发生了什么？为什么有些事泛型能做、有些不能？理解了这些，你才能从"会用泛型"进阶到"理解泛型"。

### 1. 泛型的本质：类型的参数化

普通函数把**值**参数化——调用时传入具体的值，函数体用占位符引用：

\`\`\`ts
// 值的参数化：x 是值的占位符
function double(x: number) { return x * 2; }
double(21); // 传入具体值 21
\`\`\`

泛型则把**类型**也参数化——定义时声明"类型参数"，调用时传入具体类型，函数体用类型占位符引用：

\`\`\`ts
// 类型的参数化：T 是类型的占位符
function identity<T>(x: T): T { return x; }
identity<string>("hi"); // 传入具体类型 string
\`\`\`

所以**泛型 = 类型层面的函数**。它接收类型作为参数，产出新的类型/函数签名。这种"类型层面的计算"是 TypeScript 类型系统图灵完备特性的基础。

### 2. 核心机制：类型擦除

这是理解泛型最关键的一点：**泛型只存在于编译期，运行时完全消失**。

TypeScript 的编译过程对泛型做了两件事：

1. **类型检查**：在编译期用类型参数做类型检查，发现类型错误。
2. **类型擦除**：生成 JS 时，把所有类型注解、类型参数、interface/type/泛型签名**全部删除**。

\`\`\`ts
// 源码
function identity<T>(x: T): T { return x; }
const r = identity<string>("hi");
\`\`\`

编译后大致变成：

\`\`\`js
function identity(x) { return x; }
const r = identity("hi");
\`\`\`

\`<T>\`、\`: T\`、\`<string>\` 全部不见了。这意味着：

- 运行时**不能** \`typeof T\`——T 在运行时不存在。
- 运行时**不能** \`new T()\`——没有 T 这个值。
- 运行时**不能**用 \`instanceof\` 检查 T。
- \`Array<string>\` 和 \`Array<number>\` 在运行时**完全是同一个 Array**，泛型参数不影响运行时结构。

如果运行时需要类型信息，必须**显式传入**（传入构造函数、传入类型标签字符串、传入校验函数）。这是泛型编程的一条铁律。

### 3. 泛型的四种载体

类型参数可以出现在四种位置：

#### 3.1 泛型函数

\`\`\`ts
function first<T>(arr: T[]): T { return arr[0]; }
// 箭头函数写法
const first2 = <T,>(arr: T[]): T => arr[0];
// 注意 .tsx 文件里 <T> 会被当成 JSX，要写成 <T,> 或 <T extends unknown>
\`\`\`

#### 3.2 泛型接口

\`\`\`ts
interface Box<T> { value: T; }
const b: Box<number> = { value: 42 };
\`\`\`

#### 3.3 泛型类

\`\`\`ts
class Stack<T> {
  private items: T[] = [];
  push(x: T) { this.items.push(x); }
}
\`\`\`

类的类型参数作用于**所有实例成员**，但**不能**用于静态成员——静态成员属于类本身，在实例化前 T 还未确定。

#### 3.4 泛型类型别名

\`\`\`ts
type Pair<K, V> = { key: K; value: V };
type Container<T> = T[] | Set<T>;
\`\`\`

类型别名比接口更灵活：可以用联合、交叉、条件类型等组合，而接口只能描述对象形状。

### 4. 类型参数的命名与作用域

**命名约定**（只是约定，非强制）：

| 名字 | 含义 | 典型场景 |
| --- | --- | --- |
| \`T\` | Type | 第一个通用类型参数 |
| \`U\`、\`V\` | 第二、三个 | 需要多个类型时 |
| \`K\` | Key | 对象的键 |
| \`V\` | Value | 对象的值 |
| \`E\` | Element | 数组/集合元素 |
| \`R\` | Return | 返回值（\`ReturnType<T>\` 用） |
| \`A\`、\`Args\` | Arguments | 参数元组 |

**作用域**：类型参数在其声明的整个签名/类型体内可见。函数的类型参数只在那个函数可见；类的类型参数在所有实例成员可见。

### 5. 多类型参数与默认值

\`\`\`ts
// 多类型参数
function pair<K, V>(k: K, v: V): [K, V] { return [k, v]; }

// 默认类型参数
function createArray<T = string>(len: number, v: T): T[] { /* ... */ }
createArray(3, "x");          // T 默认 string
createArray<number>(3, 0);    // 显式 number

// 默认参数可以引用前面的类型参数
interface Api<R = unknown, E = Error> { result: R; error: E | null; }
\`\`\`

默认参数的规则：**有默认值的类型参数后面不能再跟没有默认值的**，和函数默认参数一致。

### 6. 类型参数 vs 函数重载

处理多种类型有两种思路：重载和泛型。

\`\`\`ts
// 重载：为每种类型写一个签名
function parse(x: string): string;
function parse(x: number): number;
function parse(x: any) { return x; }

// 泛型：用一个签名表达"输入输出类型相同"
function parseG<T>(x: T): T { return x; }
\`\`\`

**选择原则**：

- 不同输入类型的**实现逻辑不同** → 用重载。
- 输入输出类型**有关联**、实现逻辑统一 → 用泛型。
- 两者可以结合：重载签名对外提供精确 API，泛型实现内部复用。

### 7. 本节代码演示

下面用可运行代码验证泛型的核心机制：泛型函数、泛型接口/类/别名、多参数与默认值，并用运行时证据展示**类型擦除**——\`Array<string>\` 与 \`Array<number>\` 运行时是同一个构造器，\`typeof T\` 不可用，需要类型信息时必须显式传入构造函数。`,
    code: `// ============================================================
// 第一章代码演示：泛型本质与核心机制
// 重点：泛型是编译期特性，运行时被擦除
// ============================================================

// ---- 1. 泛型函数：类型的参数化 ----
console.log("========== 1. 泛型函数 ==========");

// T 是类型占位符，调用时确定
function identity<T>(x: T): T {
  return x; // 输入 T，输出 T，类型关联保留
}
// 显式指定类型参数
console.log("identity<string>('hi'):", identity<string>("hi"));
// 类型推断：编译器根据实参推断 T
console.log("identity(42) 推断 number:", identity(42));
console.log("identity([1,2]) 推断 number[]:", identity([1, 2]));

// 泛型函数：返回数组第一个元素
function first<T>(arr: T[]): T {
  return arr[0];
}
console.log("first(['a','b']):", first(["a", "b"]));
console.log("first([10,20]):", first([10, 20]));

// ---- 2. 泛型的四种载体 ----
console.log("\\n========== 2. 泛型接口/类/别名 ==========");

// 泛型接口
interface Box<T> {
  value: T;
  unwrap(): T;
}
const numBox: Box<number> = {
  value: 42,
  unwrap() { return this.value; }
};
console.log("Box<number>:", numBox.unwrap());

// 泛型类
class Stack<T> {
  private items: T[] = [];
  push(x: T): void { this.items.push(x); }
  pop(): T | undefined { return this.items.pop(); }
  get size(): number { return this.items.length; }
}
const s = new Stack<string>();
s.push("a"); s.push("b");
console.log("Stack<string> pop:", s.pop(), "size:", s.size);

// 泛型类型别名（可用联合/交叉，比接口更灵活）
type Pair<K, V> = { key: K; value: V };
type Container<T> = T[] | Set<T>;
const p: Pair<string, number> = { key: "id", value: 1 };
const c: Container<number> = [1, 2, 3];
console.log("Pair:", JSON.stringify(p), "Container:", c);

// ---- 3. 多类型参数与默认值 ----
console.log("\\n========== 3. 多参数与默认值 ==========");

// 多类型参数
function makePair<K, V>(k: K, v: V): [K, V] { return [k, v]; }
console.log("makePair<string,number>:", makePair<string, number>("id", 1));
console.log("makePair 推断:", makePair("name", "张三"));

// 默认类型参数
function createArray<T = string>(len: number, v: T): T[] {
  const arr: T[] = [];
  for (let i = 0; i < len; i++) arr.push(v);
  return arr;
}
console.log("默认 T=string:", createArray(3, "x"));
console.log("显式 T=number:", createArray<number>(3, 0));

// 默认参数可引用前面的类型参数
interface ApiResult<T = unknown, E = Error> {
  ok: boolean;
  data: T;
  error: E | null;
}
const r1: ApiResult = { ok: false, data: null, error: new Error("x") };
const r2: ApiResult<string[]> = { ok: true, data: ["a"], error: null };
console.log("ApiResult 默认:", r1.ok, r1.error?.message);
console.log("ApiResult 指定:", r2.ok, r2.data);

// ---- 4. 核心机制：类型擦除的运行时证据 ----
console.log("\\n========== 4. 类型擦除证据 ==========");

// 证据 1：Array<string> 与 Array<number> 运行时是同一个构造器
const strArr: Array<string> = ["a"];
const numArr: Array<number> = [1];
// 泛型参数在运行时被擦除，两个数组的构造器完全相同
console.log("strArr.constructor === numArr.constructor:",
  strArr.constructor === numArr.constructor); // true
console.log("都是 Array:", strArr.constructor === Array); // true

// 证据 2：运行时不能 typeof T
function checkType<T>(x: T): void {
  // 以下写法在编译期就会报错（T 只是类型，不是值）：
  //   if (typeof x === T) { ... }     // ❌ T 不是值
  //   const t = new T();              // ❌ 不能 new 类型参数
  // 运行时只能拿到 x 的值类型
  console.log("  运行时 typeof x =", typeof x, "（typeof T 不可用）");
}
checkType("hello"); // string
checkType(42);      // number

// 证据 3：需要类型信息时，必须显式传入构造函数
class Animal {
  name = "动物";
  speak() { return "..."; }
}
class Dog extends Animal {
  name = "狗";
  speak() { return "汪汪"; }
}
// 泛型工厂：传入构造函数，才能在运行时 new
function createInstance<Ctor extends new (...args: any[]) => any>(
  ctor: Ctor,
  ...args: any[]
): InstanceType<Ctor> {
  return new ctor(...args); // 用传入的构造函数创建实例
}
const dog = createInstance(Dog);
console.log("通过构造函数创建实例:", dog.name, dog.speak());

// 证据 4：泛型签名被擦除后，函数就是普通 JS 函数
function genericFn<T>(x: T): T { return x; }
// 函数的 length 属性反映形参个数，与泛型无关
console.log("genericFn.length（形参数）:", genericFn.length);
console.log("genericFn.name:", genericFn.name);

console.log("\\n泛型本质章节演示完成！");`,
  },

  // =========================================================
  // 第二章：泛型约束与 keyof 深入
  // =========================================================
  {
    id: "ts-generics-constraints-deep",
    title: "泛型约束与 keyof 深入",
    icon: "🔗",
    group: "泛型专题",
    content: `## 泛型约束与 keyof 深入

默认情况下类型参数 \`T\` 可以是**任何东西**，这意味着在函数体内你**对 T 几乎什么都做不了**——不能访问任何属性（因为不能保证它有），不能调用任何方法。约束（\`extends\`）就是用来给 \`T\` 设定下界，告诉编译器"T 至少具备这些能力"，从而在函数体内安全使用 T 的部分功能。

### 1. 为什么需要约束

\`\`\`ts
function getLength<T>(arg: T): number {
  return arg.length; // ❌ 错误：T 上不存在属性 length
}
\`\`\`

\`T\` 是任意类型，编译器无法保证它有 \`length\`。用 \`extends\` 加约束：

\`\`\`ts
interface Lengthwise { length: number; }
function getLength<T extends Lengthwise>(arg: T): number {
  return arg.length; // ✅ 约束保证 T 有 length
}
getLength("hi");      // ✅ string 有 length
getLength([1, 2]);    // ✅ 数组有 length
// getLength(42);     // ❌ number 没有 length
\`\`\`

**关键理解**：\`T extends Lengthwise\` 不是"T 继承 Lengthwise"，而是"T 必须**可赋值给** Lengthwise"——即 T 至少包含 Lengthwise 描述的结构。约束是**下界**：T 可以比约束更"大"，但不能更"小"。

### 2. 约束的四种常见形式

\`\`\`ts
// ① 约束到接口
function a<T extends Lengthwise>(x: T): T { return x; }

// ② 约束到对象形状（内联类型）
function b<T extends { id: number }>(x: T): number { return x.id; }

// ③ 约束到函数类型
function c<T extends (...args: any[]) => any>(fn: T): T { return fn; }

// ④ 约束到字面量/原始类型
function d<T extends string | number>(x: T): T { return x; }
\`\`\`

### 3. 多重约束

一个类型参数可以同时满足多个约束，用交叉类型 \`&\` 连接：

\`\`\`ts
interface HasId { id: number; }
interface HasName { name: string; }
// T 必须同时有 id 和 name
function label<T extends HasId & HasName>(x: T): string {
  return x.id + ":" + x.name;
}
\`\`\`

### 4. 约束链：类型参数相互约束

类型参数可以约束在**另一个类型参数**上：

\`\`\`ts
// U 必须能赋值给 T —— 常用于"复制属性"场景
function copyFields<T, U extends T>(target: T, source: U): T {
  return { ...target, ...source };
}
\`\`\`

更经典的是 \`keyof\` 约束，下面专门讲。

### 5. keyof 操作符

\`keyof T\` 取类型 T 的**所有公有属性名的联合类型**：

\`\`\`ts
interface User { name: string; age: number; }
type UserKeys = keyof User; // "name" | "age"
\`\`\`

\`keyof\` 是泛型约束最强大的搭档。它让"访问对象属性"这件事变得**类型安全**：

\`\`\`ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const u: User = { name: "张三", age: 28 };
getProperty(u, "name"); // 返回 string
getProperty(u, "age");  // 返回 number
// getProperty(u, "email"); // ❌ "email" 不是 keyof User
\`\`\`

这里发生的三件事：

1. \`K extends keyof T\`：K 必须是 T 的某个键。
2. \`T[K]\`：**索引访问类型**，取 T 中键 K 对应的属性类型。
3. 由此 \`key\` 与返回值类型**精确关联**——传 "name" 返回 string，传 "age" 返回 number。

### 6. 索引访问类型 T[K]

\`T[K]\` 像对象取值一样取类型：

\`\`\`ts
type User = { name: string; age: number };
type NameType = User["name"]; // string
type Both = User["name" | "age"]; // string | number
\`\`\`

配合 \`keyof\`，能在类型层面做很多精巧的运算。

### 7. 约束与默认值结合

\`\`\`ts
// T 默认 string，且必须可赋值给 Lengthwise
function logLen<T extends Lengthwise = string>(x: T): number { return x.length; }
\`\`\`

默认值必须满足约束，否则报错。

### 8. 条件中的约束

约束常和条件类型一起用，做"如果 T 满足某形状就…"的分支（见条件类型章节）。这里先记一个模式：

\`\`\`ts
// 提取数组元素类型：如果 T 是数组，取元素；否则取 never
type ElementOf<T> = T extends (infer E)[] ? E : never;
type R1 = ElementOf<string[]>; // string
type R2 = ElementOf<number>;   // never
\`\`\`

\`infer E\` 在约束位置"声明"一个新的类型变量，等条件类型章节详解。

### 9. 约束的局限与陷阱

1. **约束不等于默认值**：\`T extends X\` 是限制，不是给 T 一个值。
2. **约束不能访问"具体"属性**：约束后只能用约束保证的属性，T 上额外的属性仍不可访问。
3. **不要过度约束**：约束越宽泛，泛型越通用；约束越窄，复用性越低。约束应**最小化**——只约束你真正要用到的能力。
4. **约束会被擦除**：运行时没有任何约束信息，约束只在编译期做检查。

### 10. 本节代码演示

下面演示：约束四种形式、多重约束、约束链、\`keyof\` + \`T[K]\` 的类型安全属性访问、约束与默认值结合，并通过运行时验证 \`keyof\` 的安全性（运行时 \`keyof\` 不存在，但属性访问的"约束效果"通过编译期类型检查体现）。`,
    code: `// ============================================================
// 第二章代码演示：泛型约束与 keyof 深入
// ============================================================

// ---- 1. 基础约束：T 必须有 length ----
console.log("========== 1. 基础约束 extends ==========");

interface Lengthwise { length: number; }

// T extends Lengthwise：T 必须可赋值给 Lengthwise（即至少有 length）
function getLength<T extends Lengthwise>(arg: T): number {
  return arg.length; // ✅ 约束保证 T 有 length
}
console.log("getLength('hello'):", getLength("hello"));    // string 有 length
console.log("getLength([1,2,3]):", getLength([1, 2, 3]));  // 数组有 length
// getLength(42); // ❌ 编译期报错：number 没有 length（运行时不会执行）

// ---- 2. 约束的四种形式 ----
console.log("\\n========== 2. 约束的四种形式 ==========");

// ① 约束到接口
function a<T extends Lengthwise>(x: T): T { return x; }
// ② 约束到对象形状
function getId<T extends { id: number }>(x: T): number { return x.id; }
// ③ 约束到函数类型
function callFn<T extends (...args: any[]) => any>(fn: T, ...args: any[]): any {
  return fn(...args);
}
// ④ 约束到原始类型联合
function echo<T extends string | number>(x: T): T { return x; }

console.log("约束对象形状 getId:", getId({ id: 7, name: "x" }));
console.log("约束函数类型 callFn:", callFn((x: number, y: number) => x + y, 3, 4));
console.log("约束原始类型 echo:", echo("hi"), echo(42));

// ---- 3. 多重约束（& 连接）----
console.log("\\n========== 3. 多重约束 ==========");

interface HasId { id: number; }
interface HasName { name: string; }
// T 必须同时有 id 和 name
function label<T extends HasId & HasName>(x: T): string {
  return x.id + ":" + x.name;
}
console.log("多重约束 label:", label({ id: 1, name: "张三", extra: true }));

// ---- 4. 约束链：U extends T ----
console.log("\\n========== 4. 约束链 ==========");

// source 必须可赋值给 target 的类型（即 source 至少包含 target 的结构）
function merge<T, U extends T>(target: T, source: U): T {
  return { ...target, ...source };
}
const base = { name: "张三", age: 28 };
const extra = { name: "李四", age: 29, active: true }; // 含 base 的全部字段
console.log("约束链 merge:", JSON.stringify(merge(base, extra)));

// ---- 5. keyof 操作符 ----
console.log("\\n========== 5. keyof 操作符 ==========");

interface User { name: string; age: number; active: boolean; }
// keyof User 在编译期等价于 "name" | "age" | "active"
// 运行时 keyof 被擦除，但我们可以用 Object.keys 看到对应的键
const u: User = { name: "张三", age: 28, active: true };
console.log("User 的键（运行时 Object.keys）:", Object.keys(u));

// ---- 6. 类型安全的属性访问：K extends keyof T + T[K] ----
console.log("\\n========== 6. keyof + 索引访问类型 ==========");

// 经典泛型函数：类型安全的属性读取
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
// 类型安全的属性设置
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}

console.log("getProperty(u, 'name'):", getProperty(u, "name")); // 返回 string
console.log("getProperty(u, 'age'):", getProperty(u, "age"));   // 返回 number
console.log("getProperty(u, 'active'):", getProperty(u, "active")); // 返回 boolean
// getProperty(u, "email"); // ❌ 编译期：email 不是 keyof User

const updated = setProperty(u, "age", 29);
console.log("setProperty 改 age:", JSON.stringify(updated));
// setProperty(u, "age", "二十九"); // ❌ 编译期：age 必须是 number

// ---- 7. 索引访问类型的应用：键值对映射 ----
console.log("\\n========== 7. 索引访问类型应用 ==========");

// 把对象的每个值取出来组成数组（保持类型关联）
function values<T>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][];
}
const v = values(u);
console.log("values（值数组）:", v);

// ---- 8. 约束与默认值结合 ----
console.log("\\n========== 8. 约束 + 默认值 ==========");

// T 默认 string，且必须可赋值给 Lengthwise（string 满足）
function logLen<T extends Lengthwise = string>(x: T): number {
  return x.length;
}
console.log("logLen 默认 T=string:", logLen("hello"));
console.log("logLen 显式 T=number[]:", logLen<number[]>([1, 2, 3]));

// ---- 9. 约束最小化原则演示 ----
console.log("\\n========== 9. 约束最小化 ==========");

// ❌ 反例：过度约束，只需要 length 却要求是数组，导致字符串不能用
//   function bad<T extends any[]>(x: T) { return x.length; }
//   bad("hi"); // ❌ string 不是数组
// ✅ 正例：只约束真正用到的能力（length）
function good<T extends Lengthwise>(x: T): number { return x.length; }
console.log("最小约束 good('hi'):", good("hi"));
console.log("最小约束 good([1,2]):", good([1, 2]));

console.log("\\n泛型约束与 keyof 章节演示完成！");`,
  },

  // =========================================================
  // 第三章：泛型类型推断机制
  // =========================================================
  {
    id: "ts-generics-inference-deep",
    title: "泛型类型推断机制",
    icon: "🧠",
    group: "泛型专题",
    content: `## 泛型类型推断机制

调用泛型函数时，你常常不必显式写出类型参数——编译器会根据实参**推断**它。理解推断的规则和边界，是写出"好用"的泛型 API 的关键：好的泛型 API 让调用者几乎不需要显式指定类型参数，而推断失败的 API 会让调用者每次都得手写一长串类型。

### 1. 推断的本质：求解类型参数

推断本质上是编译器在解一个"方程"：把调用实参的类型代入函数签名的参数位置，反解出类型参数。

\`\`\`ts
function pair<K, V>(k: K, v: V): [K, V] { return [k, v]; }
pair(1, "a");
// 实参 1 的类型是 number，代入参数 k: K → K = number
// 实参 "a" 的类型是 string，代入参数 v: V → V = string
// 结果：[number, string]
\`\`\`

编译器把 K、V 当作未知量，用实参类型做"代入求解"。

### 2. 推断的来源：参数位置

**类型参数只有出现在参数位置时才能被推断**。这是最核心的规则。

\`\`\`ts
function makeArray<T>(len: number): T[] {
  return new Array(len) as T[];
}
makeArray(3); // ❌ 推断不出 T —— T 不在任何参数里
makeArray<string>(3); // ✅ 必须显式指定
\`\`\`

\`T\` 只出现在返回值（\`T[]\`），没有实参能提供 T 的线索，推断失败。这类 API 必须要求调用者显式指定，或者给 T 一个默认值。

### 3. 推断与约束的交互

推断会考虑约束，但**优先用实参类型**：

\`\`\`ts
function logLen<T extends { length: number }>(x: T): T { return x; }
logLen("hi"); // T 推断为 string（string 满足约束）
logLen([1, 2]); // T 推断为 number[]
\`\`\`

如果实参类型**不满足约束**，编译器报错：

\`\`\`ts
logLen(42); // ❌ number 不满足 { length: number }
\`\`\

### 4. 多候选推断：最佳公共类型

当一个类型参数从**多个实参**推断时，编译器要找一个能同时兼容所有候选的类型——这叫**最佳公共类型（best common type）**。

\`\`\`ts
function merge<T>(a: T, b: T): T[] { return [a, b]; }
merge(1, 2);        // T = number（都是 number）
merge(1, "a");      // T = number | string（找联合）
\`\`\`

对于类层级，推断会找**公共超类型**：

\`\`\`ts
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}
merge(new Dog(), new Cat()); // T = Animal（Dog、Cat 的公共超类型）
\`\`\`

如果没有公共超类型，会退化成联合类型或 \`never\`。这就是为什么 \`[1, 2, 3].map(...)\` 能推断得很准，而混合类型数组常常需要显式标注。

### 5. 推断失败的典型场景

\`\`\`ts
// 场景 1：T 只在返回值
function createState<T>(): [T, (v: T) => void] { /* ... */ }
const [s, setS] = createState(); // ❌ 推断 T = unknown

// 场景 2：T 只在回调参数
function on<T>(event: string, handler: (v: T) => void) {}
on("data", (v) => v); // ❌ 推断 T = unknown（回调参数没有来源）

// 场景 3：实参是字面量但被宽化
const x = null;
identity(x); // T 推断为 null
\`\`\`

### 6. 默认类型参数的触发

当推断失败（或没有实参）时，使用默认值：

\`\`\`ts
function createArray<T = string>(len: number, v?: T): T[] { /* ... */ }
createArray(3); // T 推断不出 → 用默认 string
\`\`\`

### 7. 何时该显式指定

- **推断不出**时（T 只在返回值）。
- 想**锁定**一个比推断结果更窄/更宽的类型时：
  \`\`\`ts
  identity<string>("hi");     // 锁定 string 而非字面量 "hi"
  const u: unknown = "x";
  identity<string>(u);        // 强制断言（注意：这会绕过检查）
  \`\`\`
- 推断的联合类型不够用时：\`merge<number | string>(1, "a")\`。

### 8. 高阶推断：函数参数推断

TypeScript 支持从函数参数（回调）推断类型：

\`\`\`ts
function map<T, U>(arr: T[], fn: (x: T, i: number) => U): U[] { /* ... */ }
map([1, 2, 3], (x) => x.toString()); // T=number（从 arr），U=string（从回调返回值）
\`\`\

这是 React \`useState\`、\`useReducer\`、数组方法能精确推断的基础。

### 9. NoInfer 模式（TS 5.4+）

有时你希望某个参数**不参与推断**（只接受已推断出的类型），可以用 \`NoInfer<T>\`（TS 5.4 内置）。在没有 \`NoInfer\` 时，社区常用一个技巧：把参数包装在条件类型里阻止它成为推断候选。

\`\`\`ts
// 没 NoInfer：下面的调用会把 T 推断成 string | number，导致类型不安全
function createState<T>(init: T, setter: (v: T) => void) {}
// 用 NoInfer 让 setter 不参与推断（仅校验）
declare function createStateSafe<T>(init: T, setter: (v: NoInfer<T>) => void): void;
\`\`\`

### 10. 本节代码演示

下面演示推断的机制：参数位置推断、返回值无法推断、多候选的最佳公共类型、显式指定、默认值触发。注意：推断是编译期行为，运行时被擦除，demo 用 \`typeof\` 观察运行时值类型，用注释说明编译期推断结果。`,
    code: `// ============================================================
// 第三章代码演示：泛型类型推断机制
// 推断是编译期行为，运行时被擦除
// ============================================================

// ---- 1. 推断本质：从参数位置反解类型参数 ----
console.log("========== 1. 参数位置推断 ==========");

function pair<K, V>(k: K, v: V): [K, V] { return [k, v]; }
// 实参 1:number → K=number；"a":string → V=string
const p1 = pair(1, "a");
console.log("pair(1,'a') 推断 [number,string]:", p1);
// 编译期 K=number, V=string；运行时只是普通数组
console.log("  运行时类型:", typeof p1[0], typeof p1[1]);

// ---- 2. T 只在返回值时无法推断 ----
console.log("\\n========== 2. 返回值无法推断 ==========");

function makeArray<T>(len: number): T[] {
  return new Array(len) as T[]; // 运行时 T 不存在，用 as 断言
}
// makeArray(3); // ❌ 编译期：推断不出 T
const arr = makeArray<string>(3); // ✅ 必须显式
console.log("makeArray<string>(3):", arr, "长度:", arr.length);

// 给默认值后可以不指定
function makeArrayD<T = string>(len: number): T[] {
  return new Array(len) as unknown as T[];
}
const arrD = makeArrayD(3); // T 用默认 string
console.log("makeArrayD 默认 T=string:", arrD);

// ---- 3. 推断与约束 ----
console.log("\\n========== 3. 推断与约束 ==========");

function logLen<T extends { length: number }>(x: T): T {
  console.log("  length =", x.length);
  return x;
}
const r1 = logLen("hello"); // T 推断 string（满足约束）
const r2 = logLen([1, 2, 3]); // T 推断 number[]
console.log("  logLen 返回:", r1, r2);
// logLen(42); // ❌ 编译期：number 不满足 { length: number }

// ---- 4. 多候选推断：最佳公共类型 ----
console.log("\\n========== 4. 最佳公共类型 ==========");

function mergeT<T>(a: T, b: T): T[] { return [a, b]; }
console.log("mergeT(1,2) → T=number:", mergeT(1, 2));
console.log("mergeT(1,'a') → T=number|string:", mergeT(1, "a"));

// 类层级：推断公共超类型
class Animal { constructor(public name = "动物") {} speak() { return "..."; } }
class Dog extends Animal { constructor() { super("狗"); } speak() { return "汪汪"; } }
class Cat extends Animal { constructor() { super("猫"); } speak() { return "喵喵"; } }
const zoo = mergeT(new Dog(), new Cat()); // T 推断为 Animal
console.log("mergeT(Dog,Cat) → T=Animal:", zoo.map((a) => a.name + ":" + a.speak()));

// ---- 5. 高阶推断：从回调参数推断 ----
console.log("\\n========== 5. 从回调推断 ==========");

function mapT<T, U>(arr: T[], fn: (x: T, i: number) => U): U[] {
  const out: U[] = [];
  arr.forEach((x, i) => out.push(fn(x, i)));
  return out;
}
// T=number（从 arr），U=string（从回调返回值）
const nums = mapT([1, 2, 3], (x) => "值" + x);
console.log("mapT 推断 T=number,U=string:", nums);

// ---- 6. useState 风格的高阶推断 ----
console.log("\\n========== 6. useState 风格推断 ==========");

function useState<T>(initial: T): [T, (v: T) => void] {
  let state = initial;
  const setter = (v: T) => { state = v; };
  return [state, setter];
}
// 推断 T=number（从 initial:0）
const [count, setCount] = useState(0);
console.log("useState(0) 推断 T=number:", count);
setCount(42);
console.log("  setCount(42) 后:", count);

// 推断 T=string
const [name, setName] = useState("张三");
console.log("useState('张三') 推断 T=string:", name);

// ---- 7. 显式指定 vs 推断 ----
console.log("\\n========== 7. 显式指定 ==========");

function identity<T>(x: T): T { return x; }
// 推断：T = "hi"（字面量类型，const 上下文下）
const a1 = identity("hi");
// 显式：T = string（锁定更宽的类型）
const a2 = identity<string>("hi");
console.log("推断 vs 显式 运行时相同:", a1, a2);

// ---- 8. 推断失败的回调场景 ----
console.log("\\n========== 8. 回调推断失败 ==========");

// T 只在回调参数出现，无实参来源 → 推断为 unknown
function onEvent<T>(event: string, handler: (v: T) => void) {
  console.log("  注册事件:", event);
}
// onEvent("data", (v) => v.foo); // ❌ v 是 unknown
// 解决：显式指定
onEvent<string>("data", (v) => console.log("  收到:", v.toUpperCase()));

console.log("\\n泛型类型推断章节演示完成！");`,
  },

  // =========================================================
  // 第四章：条件类型、infer 与分布式条件类型
  // =========================================================
  {
    id: "ts-generics-conditional-infer",
    title: "条件类型、infer 与分布式条件类型",
    icon: "🔀",
    group: "泛型专题",
    content: `## 条件类型、infer 与分布式条件类型

如果说泛型是"类型层面的函数"，那**条件类型**就是"类型层面的 if-else"，**infer** 就是"类型层面的解构赋值"。它们让 TypeScript 能在类型层面做真正的**计算**——根据输入类型动态产出不同的类型。这是类型体操（type gymnastics）的核心工具，也是 Utility Types（\`ReturnType\`、\`Parameters\`、\`Awaited\` 等）的实现基础。

### 1. 条件类型语法

\`\`\`ts
T extends U ? X : Y
\`\`\

读作"如果 T 可赋值给 U，则类型为 X，否则为 Y"。像三元表达式，但在类型层面。

\`\`\`ts
type IsString<T> = T extends string ? true : false;
type A = IsString<"hi">;   // true
type B = IsString<42>;     // false
\`\`\`

### 2. 分布式条件类型（核心难点）

这是条件类型最容易踩坑的特性。当 \`T\` 是一个**裸类型参数（naked type parameter）**，且被传入一个**联合类型**时，条件类型会**分发**到联合的每个成员上，再把结果合并成联合。

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>;
// 分发过程：ToArray<string> | ToArray<number>
//        = string[] | number[]
// 结果：string[] | number[]（不是 (string|number)[]）
\`\`\

注意区别：

\`\`\`ts
type R1 = ToArray<string | number>;      // string[] | number[]（分发）
type R2 = (string | number)[];           // (string|number)[]（不分发）
\`\`\`

**如何阻止分发**？把裸类型参数"包起来"，让它不再是裸的：

\`\`\`ts
type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
type R = ToArrayNoDist<string | number>; // (string|number)[]（不分发）
\`\`\`

\`[T]\` 是一个单元素元组，T 不再是裸的，分发被禁用。这是类型体操的常用技巧。

### 3. 分布式的实际威力

利用分布式可以做"过滤联合类型"的操作：

\`\`\`ts
// 从联合 T 中排除可赋值给 U 的成员
type Exclude<T, U> = T extends U ? never : T;
type R = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
\`\`\

原理：分发后 \`"a" extends "a" ? never : "a"\` = \`never\`，\`never\` 在联合中自动消失。

\`\`\`ts
// 提取可赋值给 U 的成员
type Extract<T, U> = T extends U ? T : never;
// 排除 null/undefined
type NonNullable<T> = T extends null | undefined ? never : T;
\`\`\`

这三个都是 TS 内置 Utility Types 的实现原理。

### 4. infer 关键字：类型层面的解构

\`infer R\` 在条件类型的 extends 子句中"声明"一个类型变量 R，并让它**自动推断**为匹配到的部分。像运行时的解构赋值 \`const {x} = obj\`，但在类型层面。

\`\`\`ts
// 提取函数返回值类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
//                  函数类型 T  ----------------------  R 推断为返回值

// 提取函数参数类型（元组）
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
\`\`\`

\`infer R\` 出现在哪个位置，R 就推断成那个位置的类型。

### 5. infer 的常见位置

\`\`\`ts
// 函数返回值
type R1 = ReturnType<(x: number) => string>; // string

// 函数参数
type P = Parameters<(a: number, b: string) => void>; // [number, string]

// 数组元素
type ElementOf<T> = T extends (infer E)[] ? E : never;
type E = ElementOf<boolean[]>; // boolean

// Promise 的值
type Awaited<T> = T extends Promise<infer U> ? U : T;
type V = Awaited<Promise<number>>; // number

// 构造函数实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer I ? I : never;
\`\`\`

### 6. 嵌套 infer 与多个 infer

\`\`\`ts
// 同时提取参数和返回值
type FnInfo<T> = T extends (...args: infer P) => infer R
  ? { params: P; result: R }
  : never;
type Info = FnInfo<(x: number) => string>;
// { params: [number]; result: string }
\`\`\

### 7. 递归条件类型

条件类型可以**递归**调用自身（TS 4.1+ 支持递归类型别名）。比如实现 \`DeepReadonly\`：

\`\`\`ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
\`\`\`

对象递归地变成只读。这是类型体操的高阶用法。

### 8. 重新实现 Utility Types

理解条件类型和 infer 的最好方式是亲手实现 TS 内置工具类型：

\`\`\`ts
type Exclude<T, U>    = T extends U ? never : T;
type Extract<T, U>    = T extends U ? T : never;
type NonNullable<T>   = T extends null | undefined ? never : T;
type ReturnType<T>    = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T>    = T extends (...args: infer P) => any ? P : never;
type Awaited<T>       = T extends Promise<infer U> ? Awaited<U> : T;
type InstanceType<T>  = T extends new (...args: any[]) => infer I ? I : never;
\`\`\`

### 9. 陷阱

1. **裸类型参数才分发**：\`[T] extends [U]\` 不分发，\`T extends U\` 分发。这是 bug 高发区。
2. **infer 必须在条件类型的 extends 子句内**，不能单独使用。
3. **递归有深度限制**：TS 对递归类型有实例深度限制（约 50 层），过深会报错。
4. **条件类型求值是惰性的**：未确定（T 还是类型参数）时，条件类型保持未求值状态。

### 10. 本节代码演示

下面重新实现一批 Utility Types（Exclude/Extract/NonNullable/ReturnType/Parameters/Awaited/InstanceType），并用运行时代码验证它们提取出的类型在运行时的表现。注意：条件类型/infer 在转译后被擦除，demo 用 \`typeof\` 观察运行时值，用注释标注编译期类型计算结果。`,
    code: `// ============================================================
// 第四章代码演示：条件类型、infer 与分布式条件类型
// 高级类型在转译后被擦除，demo 用运行时值验证行为
// ============================================================

// ---- 1. 条件类型基础 ----
console.log("========== 1. 条件类型基础 ==========");

// 类型层面：T extends string ? true : false
type IsString<T> = T extends string ? true : false;
// 编译期：IsString<"hi"> = true，IsString<42> = false
// 运行时：类型被擦除，无运行时痕迹
const checkIsString = <T,>(x: T): string => {
  // 运行时用 typeof 模拟编译期的条件类型判断
  return typeof x === "string" ? "true" : "false";
};
console.log("IsString<'hi'> → true:", checkIsString("hi"));
console.log("IsString<42> → false:", checkIsString(42));

// ---- 2. 分布式条件类型 ----
console.log("\\n========== 2. 分布式条件类型 ==========");

// 裸类型参数 T：联合类型会分发
type ToArray<T> = T extends any ? T[] : never;
// ToArray<string | number> = string[] | number[]（分发）
// 运行时验证：分发后每个成员单独成数组
function toArrayDist<T>(x: T): T extends any ? T[] : never {
  return [x] as any;
}
const d1 = toArrayDist("hi");     // string[]
const d2 = toArrayDist(42);       // number[]
console.log("ToArray<string>:", d1, "ToArray<number>:", d2);

// 阻止分发：用 [T] 包起来
type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
// ToArrayNoDist<string|number> = (string|number)[]
function toArrayNoDist<T>(x: T): T[] {
  return [x];
}
console.log("ToArrayNoDist:", toArrayNoDist("hi"));

// ---- 3. Exclude / Extract / NonNullable 实现 ----
console.log("\\n========== 3. Exclude / Extract / NonNullable ==========");

// 类型层面实现（编译期）
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
type MyNonNullable<T> = T extends null | undefined ? never : T;

// 编译期结果（注释说明）：
//   MyExclude<"a"|"b"|"c", "a"> = "b" | "c"
//   MyExtract<"a"|"b"|"c", "a"|"b"> = "a" | "b"
//   MyNonNullable<string | null> = string

// 运行时模拟 Exclude：过滤数组
function excludeVal<T, U extends T>(arr: T[], toExclude: U[]): T[] {
  return arr.filter((x) => !toExclude.includes(x as unknown as U)) as T[];
}
console.log("Exclude<'a','b','c', 'a'> → ['b','c']:",
  excludeVal(["a", "b", "c"], ["a"]));
console.log("Exclude 过滤多个:",
  excludeVal(["a", "b", "c", "d"], ["a", "c"]));

// 运行时模拟 NonNullable：排除 null/undefined
function nonNullable<T>(arr: T[]): NonNullable<T>[] {
  return arr.filter((x) => x != null) as NonNullable<T>[];
}
console.log("NonNullable 过滤 null/undefined:",
  nonNullable(["a", null, "b", undefined, "c"]));

// ---- 4. infer：提取函数返回值 / 参数 ----
console.log("\\n========== 4. infer 提取函数类型 ==========");

// 类型层面（编译期）
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

// 示例函数
function greet(name: string, age: number): string {
  return "你好," + name + "(" + age + "岁)";
}
// 编译期：
//   MyReturnType<typeof greet> = string
//   MyParameters<typeof greet> = [string, number]

// 运行时模拟：用函数对象信息
console.log("greet 的返回值（运行时调用）:", greet("张三", 28));
console.log("greet.length（形参数，对应 Parameters 长度）:", greet.length);
console.log("greet.name（函数名）:", greet.name);

// ---- 5. infer 提取数组元素 / Promise 值 ----
console.log("\\n========== 5. infer 提取元素 ==========");

type ElementOf<T> = T extends (infer E)[] ? E : never;
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// 编译期：
//   ElementOf<number[]> = number
//   Awaited<Promise<string>> = string
// 运行时：泛型擦除，数组元素运行时可见
const numArray: number[] = [1, 2, 3];
console.log("ElementOf<number[]> 运行时元素:", numArray[0], typeof numArray[0]);

// Promise 的值类型运行时通过 resolve 值体现
async function demoAwaited() {
  const p: Promise<string> = Promise.resolve("hello");
  const v = await p; // Awaited<Promise<string>> = string
  console.log("Awaited<Promise<string>> 运行时值:", v, typeof v);
}
demoAwaited();

// ---- 6. 嵌套 infer：同时提取参数和返回值 ----
console.log("\\n========== 6. 嵌套 infer ==========");

type FnInfo<T> = T extends (...args: infer P) => infer R
  ? { params: P; result: R }
  : never;
// FnInfo<typeof greet> = { params: [string, number]; result: string }
// 运行时模拟
function describeFn(fn: Function): string {
  return "函数（形参数=" + fn.length + "，名=" + fn.name + "）";
}
console.log("FnInfo<typeof greet>:", describeFn(greet));

// ---- 7. 递归条件类型：DeepReadonly 思路 ----
console.log("\\n========== 7. 递归条件类型 DeepReadonly ==========");

// 类型层面（编译期递归）
// type DeepReadonly<T> = {
//   readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
// };
// 运行时模拟：深度冻结
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object") {
    Object.freeze(obj);
    Object.values(obj).forEach(deepFreeze);
  }
  return obj;
}
const config = { db: { host: "localhost", port: 3306 }, debug: true };
const frozen = deepFreeze(config);
console.log("DeepReadonly（深度冻结）:", JSON.stringify(frozen));
console.log("  是否冻结:", Object.isFrozen(frozen), Object.isFrozen(frozen.db));
// frozen.db.port = 3307; // 运行时严格模式下静默失败/报错

// ---- 8. InstanceType：提取构造函数实例类型 ----
console.log("\\n========== 8. InstanceType ==========");

type MyInstanceType<T> = T extends new (...args: any[]) => infer I ? I : never;

class Point {
  constructor(public x: number, public y: number) {}
  toString() { return "(" + this.x + "," + this.y + ")"; }
}
// MyInstanceType<typeof Point> = Point
// 运行时：new 创建实例
function createInstance<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: any[]
): InstanceType<T> {
  return new ctor(...args);
}
const pt = createInstance(Point, 3, 4);
console.log("InstanceType<typeof Point> 实例:", pt.toString());

console.log("\\n条件类型与 infer 章节演示完成！");`,
  },

  // =========================================================
  // 第五章：映射类型与模板字面量类型
  // =========================================================
  {
    id: "ts-generics-mapped-templates",
    title: "映射类型与模板字面量类型",
    icon: "🗺️",
    group: "泛型专题",
    content: `## 映射类型与模板字面量类型

**映射类型（Mapped Types）** 让你"遍历"一个类型的所有键，对每个键的值类型做变换，产出一个新类型——本质是"类型层面的 map"。**模板字面量类型（Template Literal Types）** 则让你在类型层面做字符串拼接。两者结合泛型，是构建类型安全 API 的终极武器：\`Partial<T>\`、\`Readonly<T>\`、\`Pick<T,K>\`、\`Record<K,V>\` 全是映射类型实现的。

### 1. 映射类型语法

\`\`\`ts
type Mapped<T> = {
  [K in keyof T]: NewType;
};
\`\`\

\`[K in keyof T]\` 像 for 循环遍历 T 的所有键，每个键 K 的值类型被替换成 \`NewType\`。\`K\` 可以在值类型位置使用。

\`\`\`ts
// 把所有属性变成 string
type Stringify<T> = { [K in keyof T]: string };
type R = Stringify<{ a: number; b: boolean }>;
// { a: string; b: string }
\`\`\

### 2. 同态映射类型：保留修饰符

如果映射的源是一个泛型 \`T\`（\`keyof T\`），映射结果会**保留 T 的可选性和只读性**——这叫**同态映射类型（homomorphic mapped type）**。

\`\`\`ts
type Homomorphic<T> = { [K in keyof T]: T[K] }; // 原样复制，保留修饰符
\`\`\

非同态映射（源不是 keyof T）则不保留修饰符。

### 3. 修饰符增删：+readonly / -readonly / +? / -?

映射类型可以用 \`+\` / \`-\` 增删 \`readonly\` 和可选 \`?\`：

\`\`\`ts
// 加 readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
// 去掉 readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
// 加可选
type MyPartial<T> = { [K in keyof T]?: T[K] };
// 去掉可选（必选化）
type MyRequired<T> = { [K in keyof T]-?: T[K] };
\`\`\

\`+\` 可省略（默认加），\`-\` 表示移除。这四个就是 TS 内置 \`Readonly\`、\`Mutable\`（无内置，社区常用）、\`Partial\`、\`Required\` 的实现。

### 4. 键重映射 as（TS 4.1+）

\`as\` 子句可以变换键名：

\`\`\`ts
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type R = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
\`\`\

\`as\` 后面是一个模板字面量类型，能基于原键名生成新键名。如果重映射结果为 \`never\`，该键被过滤掉：

\`\`\`ts
// 过滤掉函数类型的属性
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
\`\`\

### 5. 模板字面量类型

字符串类型层面拼接：

\`\`\`ts
type Greeting = \`hello \${string}\`;
const g: Greeting = "hello world"; // ✅
\`\`\

配合联合类型，会做**笛卡尔积**：

\`\`\`ts
type Side = "top" | "right" | "bottom" | "left";
type Margin = \`\${Capitalize<Side>}Margin\`;
// "TopMargin" | "RightMargin" | "BottomMargin" | "LeftMargin"
\`\`\

### 6. 内置字符串工具类型

\`\`\`ts
type A = Uppercase<"abc">;    // "ABC"
type B = Lowercase<"ABC">;    // "abc"
type C = Capitalize<"abc">;   // "Abc"
type D = Uncapitalize<"Abc">; // "abc"
\`\`\

### 7. 重新实现核心 Utility Types

\`\`\`ts
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyRecord<K extends keyof any, V> = { [P in K]: V };
type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
\`\`\

\`Pick\` 用 \`[P in K]\`（K 是键的联合，不是 keyof T），\`Record\` 用 \`[P in K]\` 配合 \`keyof any\`（= string|number|symbol）。

### 8. 实战：类型安全的事件系统

\`\`\`ts
type EventMap = { click: MouseEvent; input: string; focus: void };
type OnHandlers<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}\`]: (e: T[K]) => void;
};
// { onClick: (e: MouseEvent) => void; onInput: (e: string) => void; onFocus: (e: void) => void }
\`\`\

映射 + 模板字面量 + Capitalize，自动生成事件处理器类型。这是 React 类型、Vue 类型的基础模式。

### 9. 陷阱

1. **映射类型只在对象类型上工作**，原始类型联合不会被映射。
2. **同态性取决于源**：\`keyof T\` 同态，\`K\`（独立联合）不同态。
3. **键重映射的 K 须是 string|number|symbol**，所以常写 \`string & K\`。
4. **模板字面量类型对大联合可能爆炸**：组合数是笛卡尔积，过大联合会报错。

### 10. 本节代码演示

下面重新实现 Partial/Required/Readonly/Pick/Record/Omit，演示修饰符增删、键重映射 \`as\`、模板字面量类型的事件系统生成，并用运行时代码验证映射后的对象结构。映射类型在转译后被擦除，demo 用运行时对象体现结果结构。`,
    code: `// ============================================================
// 第五章代码演示：映射类型与模板字面量类型
// 映射类型在转译后被擦除，demo 用运行时对象体现结果
// ============================================================

// ---- 1. 映射类型基础 ----
console.log("========== 1. 映射类型基础 ==========");

// 类型层面：把所有属性值类型变成 string
type Stringify<T> = { [K in keyof T]: string };
// Stringify<{ a: number; b: boolean }> = { a: string; b: string }
// 运行时：类型擦除，但我们可以构造对应结构
const stringified = { a: "1", b: "true" }; // 满足 Stringify 结构
console.log("Stringify 结构:", stringified);

// ---- 2. 同态映射：保留修饰符 ----
console.log("\\n========== 2. 同态映射 ==========");

// 原样复制（保留 readonly 和 ?）
type Identity<T> = { [K in keyof T]: T[K] };
interface Source {
  readonly id: number;
  name?: string;
}
// Identity<Source> 仍是 { readonly id: number; name?: string }
const copy: Identity<Source> = { id: 1, name: "x" };
console.log("同态映射（保留修饰符）:", copy);

// ---- 3. 修饰符增删：Partial / Required / Readonly ----
console.log("\\n========== 3. 修饰符增删 ==========");

// 类型层面实现
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyMutable<T>  = { -readonly [K in keyof T]: T[K] };

interface User { id: number; name: string; age: number; }

// Partial：所有属性可选
const patch: MyPartial<User> = { name: "新名字" }; // 只填一个也合法
console.log("Partial<User>（部分填）:", patch);

// Readonly：只读
const ro: MyReadonly<User> = { id: 1, name: "张三", age: 28 };
console.log("Readonly<User>:", ro);
// ro.id = 2; // ❌ 编译期只读（运行时严格模式静默失败）

// Required：必选化
interface OptUser { id?: number; name?: string; }
const req: MyRequired<OptUser> = { id: 1, name: "x" }; // 必须都填
console.log("Required<OptUser>（全填）:", req);

// ---- 4. Pick / Record / Omit 实现 ----
console.log("\\n========== 4. Pick / Record / Omit ==========");

type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyRecord<K extends keyof any, V> = { [P in K]: V };
type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;

// Pick：挑部分键
const picked: MyPick<User, "id" | "name"> = { id: 1, name: "张三" };
console.log("Pick<User,'id'|'name'>:", picked);

// Record：构造键值映射
const dict: MyRecord<"a" | "b" | "c", number> = { a: 1, b: 2, c: 3 };
console.log("Record<'a'|'b'|'c', number>:", dict);

// Omit：排除部分键
const omitted: MyOmit<User, "age"> = { id: 1, name: "张三" }; // 无 age
console.log("Omit<User,'age'>:", omitted);

// ---- 5. 键重映射 as ----
console.log("\\n========== 5. 键重映射 as ==========");

// 生成 getXxx 方法
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
// Getters<User> = { getId: () => number; getName: () => string; getAge: () => number }
// 运行时构造对应对象
const getters = {
  getId: () => 1,
  getName: () => "张三",
  getAge: () => 28
};
console.log("Getters<User>:", getters.getId(), getters.getName(), getters.getAge());

// 过滤函数属性
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
// 运行时模拟：挑出非函数属性
const objWithMethods = { id: 1, name: "x", greet() { return "hi"; } };
const noMethods = Object.fromEntries(
  Object.entries(objWithMethods).filter(([_, v]) => typeof v !== "function")
);
console.log("RemoveMethods（过滤函数）:", noMethods);

// ---- 6. 模板字面量类型 ----
console.log("\\n========== 6. 模板字面量类型 ==========");

// 类型层面：\`on\${Capitalize<Event>}\`
type EventName = "click" | "input" | "focus";
type HandlerName = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onInput" | "onFocus"
// 运行时验证：生成处理器名
const handlerNames: HandlerName[] = ["onClick", "onInput", "onFocus"];
console.log("模板字面量类型生成:", handlerNames);

// 笛卡尔积
type Side = "top" | "bottom";
type Axis = "X" | "Y";
type Combined = \`\${Side}-\${Axis}\`;
// "top-X" | "top-Y" | "bottom-X" | "bottom-Y"
const combined: Combined[] = ["top-X", "top-Y", "bottom-X", "bottom-Y"];
console.log("笛卡尔积:", combined);

// ---- 7. 字符串工具类型 ----
console.log("\\n========== 7. 字符串工具类型 ==========");

// 类型层面：Uppercase/Lowercase/Capitalize/Uncapitalize
// 运行时用对应字符串方法模拟
type Upp = Uppercase<"abc">;    // "ABC"
type Cap = Capitalize<"abc">;   // "Abc"
console.log("Uppercase<'abc'>:", "abc".toUpperCase());
console.log("Capitalize<'abc'>:", "abc".charAt(0).toUpperCase() + "abc".slice(1));

// ---- 8. 实战：类型安全的事件系统 ----
console.log("\\n========== 8. 类型安全事件系统 ==========");

// 事件映射
interface EventMap { click: { x: number; y: number }; input: string; focus: void; }
// 自动生成 onXxx 处理器类型
type OnHandlers<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}\`]: (e: T[K]) => void;
};
// OnHandlers<EventMap> = { onClick: (e:{x,y})=>void; onInput:(e:string)=>void; onFocus:(e:void)=>void }

// 运行时实现一个简易事件总线（类型安全）
function createEventBus<Handlers extends Record<string, (e: any) => void>>(
  initial: Handlers
): Handlers {
  return initial;
}
const bus = createEventBus({
  onClick: (e) => console.log("  点击:", e.x, e.y),
  onInput: (e) => console.log("  输入:", e),
  onFocus: () => console.log("  聚焦")
});
bus.onClick({ x: 10, y: 20 });
bus.onInput("hello");
bus.onFocus();

console.log("\\n映射类型与模板字面量类型章节演示完成！");`,
  },

  // =========================================================
  // 第六章：协变、逆变与变型原理
  // =========================================================
  {
    id: "ts-generics-variance",
    title: "协变、逆变与变型原理",
    icon: "↔️",
    group: "泛型专题",
    content: `## 协变、逆变与变型原理

**变型（Variance）** 描述的是：当 \`Dog\` 是 \`Animal\` 的子类型时，由它们构造出的复合类型（比如 \`Array<Dog>\`、\`(x: Dog) => void\`）之间，子类型关系如何变化？理解变型，才能看懂 TypeScript 里那些"明明类型有继承关系却不能赋值"的报错，也才能理解 \`strictFunctionTypes\` 到底在严格什么。

### 1. 子类型关系回顾

如果 \`Dog extends Animal\`，那 \`Dog\` 是 \`Animal\` 的**子类型（subtype）**——任何需要 \`Animal\` 的地方都能用 \`Dog\`：

\`\`\`ts
let a: Animal = new Dog(); // ✅ Dog 可赋值给 Animal
\`\`\

子类型关系是变型讨论的基础。问题是：构造出的复合类型之间，子类型关系如何？

### 2. 协变 Covariance

如果 \`Dog <: Animal\` 蕴含 \`Array<Dog> <: Array<Animal>\`，即复合类型的子类型关系**方向一致**，叫**协变**。

\`\`\`ts
const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs; // ✅ 数组协变
animals.push(new Cat()); // ⚠️ 运行时把 Cat 塞进了 Dog[]！
\`\`\

TypeScript 的数组是协变的（沿用 Java/C# 的设计，为了兼容性）。这其实**类型不安全**——上面把 \`Cat\` 塞进 \`Dog[]\` 编译期不报错，但逻辑上错了。这是协变的固有代价。

**只读容器可以安全协变**（因为不会写入），可写容器严格说应该**不变**。

### 3. 逆变 Contravariance

函数**参数**位置的关系是反的：如果 \`Dog <: Animal\`，那么 \`(x: Animal) => void <: (x: Dog) => void\`——参数类型关系**反向**，叫**逆变**。

直观理解：一个"能处理任意 Animal 的函数"当然能处理 Dog（Dog 是 Animal），所以 \`(x: Animal) => void\` 可以赋值给 \`(x: Dog) => void\`。

\`\`\`ts
const handleAnimal = (a: Animal) => console.log(a.name);
const handleDog: (d: Dog) => void = handleAnimal; // ✅ 参数逆变
handleDog(new Dog()); // 实际调用 handleAnimal，Dog 是 Animal，安全
\`\`\

反过来就不行：

\`\`\`ts
const handleDog = (d: Dog) => d.bark();
const handleAnimal: (a: Animal) => void = handleDog; // ❌ 不安全
handleAnimal(new Cat()); // 调用 handleDog(new Cat())，Cat 没有 bark！
\`\`\

### 4. 双向协变 Bivariance 与 strictFunctionTypes

TypeScript 默认对**方法（method）**和**函数属性**采用**双向协变**——参数既协变又逆变，比较宽松。这是历史兼容性决定（旧 JS 代码大量依赖此行为）。

开启 \`strictFunctionTypes\`（strict 模式默认开）后，**函数属性**会严格按逆变检查，但**方法（用 \`method()\` 语法定义）**仍是双向协变。

\`\`\`ts
interface A { m(x: Animal): void; }   // 方法：双向协变
interface B { m: (x: Animal) => void; } // 函数属性：严格逆变（strict 下）
\`\`\

这是为什么很多类型定义用 \`method(): void\` 而非 \`method: () => void\`——方法语法更宽松，兼容性更好。

### 5. 不变 Invariance

如果子类型关系**既不协变也不逆变**——必须类型完全相同——叫**不变**。可读写的泛型容器严格说应该是不变的（防止写入破坏类型）。但 TS 为了实用性，对数组等采用协变，牺牲了部分安全性。

\`\`\`ts
// 理论上 Array<Dog> 和 Array<Animal> 应该不变，但 TS 协变
// 这就是为什么 TS 数组有"协变陷阱"
\`\`\

### 6. 变型与泛型的关系

泛型类型本身没有固定的变型——变型取决于类型参数出现在**哪些位置**：

- 出现在**输出位置**（返回值、只读属性）→ 协变
- 出现在**输入位置**（参数、可写属性）→ 逆变
- 同时出现在输入和输出 → 不变

\`\`\`ts
interface Producer<T> { get(): T; }      // T 只在输出 → 协变
interface Consumer<T> { put(x: T): void; } // T 只在输入 → 逆变
interface Holder<T> { value: T; }        // T 既读又写 → 不变
\`\`\

### 7. 实际影响

- **回调/事件处理**：回调参数是逆变场景，strict 模式下能发现"处理函数参数过窄"的错误。
- **数组写入**：协变导致 \`Dog[]\` 能当 \`Animal[]\` 用，但 \`push\` 不安全。
- **Promise**：\`Promise<T>\` 的 T 只在输出（resolve 值），所以协变，\`Promise<Dog>\` 可赋值给 \`Promise<Animal>\`。

### 8. 变型标注（TS 5.x 探索）

TS 5.x 在探索显式变型标注（\`in\`、\`out\` 修饰符）：

\`\`\`ts
interface Producer<out T> { get(): T; }   // 显式协变
interface Consumer<in T> { put(x: T): void; } // 显式逆变
\`\`\

目前主要用于类型定义库的精确性，普通业务代码很少用。

### 9. 陷阱

1. **数组协变不安全**：\`Dog[]\` 当 \`Animal[]\` 后 \`push(new Cat())\` 编译期不报错。
2. **方法 vs 函数属性**：方法语法双向协变更宽松，可能掩盖错误；追求严格用函数属性 + \`strictFunctionTypes\`。
3. **不要混淆"子类型"与"赋值"**：变型讨论的是子类型关系，赋值兼容性是其推论。
4. **逆变只对函数参数**：返回值是协变，别记反。

### 10. 本节代码演示

下面用类层级（Animal/Dog/Cat）演示协变（数组）、逆变（函数参数）、双向协变（方法 vs 函数属性）、Promise 协变，并通过运行时把"不安全操作"的后果展示出来。变型是编译期检查，运行时被擦除，demo 用运行时行为说明"为什么需要这些规则"。`,
    code: `// ============================================================
// 第六章代码演示：协变、逆变与变型原理
// 变型是编译期检查，运行时擦除；demo 展示规则的"必要性"
// ============================================================

// ---- 类层级：Animal > Dog / Cat ----
class Animal {
  constructor(public name = "动物") {}
  speak(): string { return "..."; }
}
class Dog extends Animal {
  constructor() { super("狗"); }
  speak() { return "汪汪"; }
  bark() { return "汪!"; }
}
class Cat extends Animal {
  constructor() { super("猫"); }
  speak() { return "喵喵"; }
}

console.log("========== 1. 子类型基础 ==========");
const a: Animal = new Dog(); // Dog 是 Animal 子类型
console.log("Dog 可赋值给 Animal:", a.name);

// ---- 2. 协变：数组 ----
console.log("\\n========== 2. 数组协变（及其陷阱）==========");

const dogs: Dog[] = [new Dog(), new Dog()];
// 数组协变：Dog[] 可赋值给 Animal[]
const animals: Animal[] = dogs;
console.log("协变：Dog[] 当 Animal[] 用，读取 OK:", animals.map((a) => a.name));

// ⚠️ 协变陷阱：把 Cat 塞进 Dog[]，编译期不报错，但逻辑错了
animals.push(new Cat() as unknown as Dog); // 模拟编译期放行
console.log("  ⚠️ 协变陷阱：Cat 被塞进了 Dog[]，dogs 现在有:", dogs.map((d) => d.name));
// 现在 dogs[2] 实际是 Cat，但类型系统认为是 Dog
try {
  // @ts-ignore 演示协变不安全
  (dogs[2] as Dog).bark(); // Cat 没有 bark
} catch (e) {
  console.log("  运行时调用 bark 失败:", e.message);
}
console.log("  → 结论：可写容器严格说应不变，TS 数组协变是兼容性妥协");

// ---- 3. 逆变：函数参数 ----
console.log("\\n========== 3. 函数参数逆变 ==========");

// 能处理任意 Animal 的函数
const handleAnimal = (a: Animal): void => {
  console.log("  处理动物:", a.name, "叫声:", a.speak());
};
// 逆变：(x: Animal) => void 可赋值给 (x: Dog) => void
const handleDog: (d: Dog) => void = handleAnimal;
handleDog(new Dog()); // 安全：Dog 是 Animal，handleAnimal 能处理

// 反过来不安全（strictFunctionTypes 下会报错）：
//   const handleDogOnly = (d: Dog) => d.bark();
//   const handleAny: (a: Animal) => void = handleDogOnly; // ❌ 逆变失败
//   handleAny(new Cat()); // 会调用 handleDogOnly(new Cat())，Cat 没 bark
// 运行时模拟这个不安全场景：
function unsafeCall(animal: Animal, fn: (d: Dog) => void) {
  // 如果把 fn 当成 (a: Animal) => void 来用，传 Cat 就会出问题
  // 这里我们遵守类型，只传 Dog
  if (animal instanceof Dog) fn(animal);
  else console.log("  跳过非 Dog:", animal.name);
}
unsafeCall(new Dog(), (d) => console.log("  Dog 专用:", d.bark()));
unsafeCall(new Cat(), (d) => console.log("  不会执行"));

// ---- 4. 方法 vs 函数属性（双向协变）----
console.log("\\n========== 4. 方法 vs 函数属性 ==========");

// 方法语法：双向协变（更宽松，兼容旧代码）
interface WithMethod {
  handle(x: Animal): void;
}
// 函数属性语法：strictFunctionTypes 下严格逆变
interface WithFuncProp {
  handle: (x: Animal) => void;
}

// 方法定义能接受更宽松的类型（兼容性）
const methodObj: WithMethod = {
  handle(x: Animal) { console.log("  方法 handle:", x.name); }
};
methodObj.handle(new Dog());

const funcPropObj: WithFuncProp = {
  handle: (x: Animal) => console.log("  函数属性 handle:", x.name)
};
funcPropObj.handle(new Cat());

console.log("  → 方法语法双向协变更宽松；函数属性更严格");

// ---- 5. 协变/逆变/不变的泛型容器 ----
console.log("\\n========== 5. 协变/逆变/不变的容器 ==========");

// 协变容器：T 只在输出（只读）
interface Producer<T> { get(): T; }
function makeProducer<T>(v: T): Producer<T> {
  return { get: () => v };
}
const dogProducer: Producer<Dog> = makeProducer(new Dog());
const animalProducer: Producer<Animal> = dogProducer; // ✅ 协变
console.log("协变 Producer<Dog> → Producer<Animal>:", animalProducer.get().name);

// 逆变容器：T 只在输入
interface Consumer<T> { put(x: T): void; }
function makeConsumer<T>(): Consumer<T> {
  const items: T[] = [];
  return {
    put(x: T) { items.push(x); console.log("  put:", (x as any).name || x); },
    getAll() { return items; }
  };
}
// 逆变：Consumer<Animal> 可赋值给 Consumer<Dog>
const animalConsumer: Consumer<Animal> = makeConsumer<Animal>();
const dogConsumer: Consumer<Dog> = animalConsumer; // ✅ 逆变
dogConsumer.put(new Dog()); // 安全

// ---- 6. Promise 协变 ----
console.log("\\n========== 6. Promise 协变 ==========");

// Promise<T> 的 T 只在输出（resolve 值），所以协变
async function getDog(): Promise<Dog> { return new Dog(); }
async function getAnimal(): Promise<Animal> {
  // Promise<Dog> 协变赋值给 Promise<Animal>
  return getDog();
}
getAnimal().then((a) => console.log("Promise 协变：getAnimal() 返回:", a.name));

// ---- 7. 变型总结 ----
setTimeout(() => {
  console.log("\\n========== 7. 变型总结 ==========");
  console.log("  协变（输出位置）: Array<Dog> → Array<Animal> 方向一致");
  console.log("  逆变（输入位置）: (a:Animal)=>void → (d:Dog)=>void 方向相反");
  console.log("  双向协变: 方法语法默认宽松（兼容性）");
  console.log("  不变: 可读可写容器严格应不变（TS 数组协变是妥协）");
  console.log("  strictFunctionTypes: 让函数属性严格逆变，方法仍双向协变");
  console.log("\\n协变逆变与变型原理章节演示完成！");
}, 50);`,
  },

  // =========================================================
  // 第七章：泛型设计模式、陷阱与最佳实践
  // =========================================================
  {
    id: "ts-generics-patterns-pitfalls",
    title: "泛型设计模式、陷阱与最佳实践",
    icon: "🧩",
    group: "泛型专题",
    content: `## 泛型设计模式、陷阱与最佳实践

前面几章讲了泛型的机制。本章把视角拉回**工程实践**：泛型在真实项目里怎么用才好？有哪些经典模式？又有哪些坑会让你的泛型代码变成"看着高级、实则难用"的负担？

### 1. 经典模式：Result<T, E> 错误处理

把"成功值"和"错误"都放进返回类型，让错误成为类型的一部分（Rust 风格）：

\`\`\`ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "除零" };
  return { ok: true, value: a / b };
}
const r = divide(10, 0);
if (r.ok) console.log(r.value);       // value: number
else console.log(r.error);            // error: string
\`\`\

可辨识联合 + 泛型，让分支后的类型自动收窄，是类型安全错误处理的标准范式。

### 2. 经典模式：Option<T> 可空值

\`\`\`ts
type Option<T> = { some: true; value: T } | { some: false };
function find<T>(arr: T[], pred: (x: T) => boolean): Option<T> { /* ... */ }
\`\`\`

把 \`null/undefined\` 从类型里赶出去，用显式的"有/无"表达。

### 3. 经典模式：Builder（类型安全的链式调用）

利用泛型在**类型层面累积状态**，让链式调用的每一步都类型精确：

\`\`\`ts
class QueryBuilder<T> {
  private data: T[];
  filter(pred: (x: T) => boolean): this { /* ... */ return this; }
  map<U>(fn: (x: T) => U): QueryBuilder<U> { /* ... */ return new QueryBuilder(); }
}
\`\`\

\`this\` 类型让 \`filter\` 返回当前子类型，\`map\` 切换元素类型。这是 Lodash、RxJS 链式 API 的基础。

### 4. 经典模式：类型安全的事件发射器

\`\`\`ts
class Emitter<Events extends Record<string, any>> {
  private handlers: { [K in keyof Events]?: ((e: Events[K]) => void)[] } = {};
  on<K extends keyof Events>(event: K, fn: (e: Events[K]) => void) { /* ... */ }
  emit<K extends keyof Events>(event: K, e: Events[K]) { /* ... */ }
}
const bus = new Emitter<{ click: { x: number }; input: string }>();
bus.on("click", (e) => e.x);   // e 自动是 { x: number }
bus.emit("input", "hello");    // 参数必须是 string
\`\`\`

\`Events extends Record<string, any>\` + \`keyof Events\` + \`Events[K]\`，三件套实现完全类型安全的事件总线。

### 5. 经典模式：泛型 Repository / Factory

\`\`\`ts
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}
class UserRepo implements Repository<User> { /* ... */ }
\`\`\

约束 \`T extends { id: string }\` 让 Repository 假设实体有 id，复用于所有有 id 的实体。

### 6. 泛型陷阱大全

#### 陷阱 1：运行时不能 typeof T / new T()

\`\`\`ts
function create<T>(): T {
  return new T(); // ❌ T 是类型，不是值
}
// 正确：传入构造函数
function create<T>(ctor: new () => T): T { return new ctor(); }
\`\`\

#### 陷阱 2：静态成员不能用类的类型参数

\`\`\`ts
class Box<T> {
  static default: T; // ❌ 静态成员不能引用 T
}
\`\`\

#### 陷阱 3：装饰性泛型（无意义的 <T>）

\`\`\`ts
// ❌ T 没被使用，纯装饰，没带来任何类型安全
function log<T>(msg: string): void { console.log(msg); }
\`\`\

类型参数必须**在参数或返回值中被使用**，否则毫无意义。

#### 陷阱 4：过度泛型

\`\`\`ts
// ❌ 过度抽象，可读性极差
function process<T, U, V, W>(a: T, b: U, c: V): W { /* ... */ }
\`\`\

能用具体类型就别用泛型。泛型的代价是可读性和编译速度。

#### 陷阱 5：any 破坏泛型安全

\`\`\`ts
function first<T>(arr: T[]): T { return arr[0] as any; } // ❌ as any 绕过检查
\`\`\

#### 陷阱 6：协变数组写入不安全

见变型章节：\`Dog[]\` 当 \`Animal[]\` 后 \`push(new Cat())\` 不报错但错误。

#### 陷阱 7：推断不出时静默变 unknown

\`\`\`ts
function makeState<T>(): [T, (v: T) => void] { /* ... */ }
const [s, setS] = makeState(); // T = unknown，类型安全丢失
\`\`\

#### 陷阱 8：泛型不会"自动"跨函数传播

\`\`\`ts
function parse<T>(s: string): T { return JSON.parse(s); }
const u = parse<User>('{"name":"x"}'); // 必须显式，否则 T=unknown
\`\`\

### 7. 最佳实践

1. **泛型要保留类型关联**：输入输出类型有联系时才用泛型，否则用具体类型。
2. **优先推断**：让调用者少写类型参数；推断不出时考虑重新设计 API（让 T 出现在参数）。
3. **约束最小化**：只约束真正用到的能力，约束越宽泛复用性越强。
4. **命名遵循约定**：T/U/V/K/E/R，让读者一眼看懂意图。
5. **公共 API 的泛型要文档化**：复杂泛型签名配示例，说明类型参数代表什么。
6. **运行时需要类型信息时显式传入**：构造函数、类型标签、校验函数。
7. **避免装饰性泛型和过度泛型**：宁可重复，不要无意义的抽象。
8. **可辨识联合 + 泛型做错误处理**：Result/Option 比抛异常更类型安全。
9. **工具类型优先**：用 Partial/Pick/Omit/Record 替代手写映射。
10. **开启 strict + strictFunctionTypes**：让泛型安全检查到位。

### 8. 本节代码演示

下面实现 Result/Option、类型安全 EventEmitter、Builder 链式 API、泛型 Repository，并演示几个典型陷阱（typeof T 不可用、装饰性泛型、协变写入不安全）及其正确写法。`,
    code: `// ============================================================
// 第七章代码演示：泛型设计模式、陷阱与最佳实践
// ============================================================

// ---- 1. Result<T, E> 错误处理 ----
console.log("========== 1. Result<T, E> 错误处理 ==========");

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "除零错误" };
  return { ok: true, value: a / b };
}
function handleResult(r: Result<number, string>): string {
  // 可辨识联合：r.ok 收窄类型
  if (r.ok) return "结果:" + r.value;        // r: { ok: true; value: number }
  return "错误:" + r.error;                  // r: { ok: false; error: string }
}
console.log(handleResult(divide(10, 2)));  // 结果:5
console.log(handleResult(divide(10, 0)));  // 错误:除零错误

// ---- 2. Option<T> 可空值 ----
console.log("\\n========== 2. Option<T> ==========");

type Option<T> = { some: true; value: T } | { some: false };

function findFirst<T>(arr: T[], pred: (x: T) => boolean): Option<T> {
  for (const x of arr) if (pred(x)) return { some: true, value: x };
  return { some: false };
}
const found = findFirst([1, 2, 3], (x) => x > 2);
const none = findFirst([1, 2, 3], (x) => x > 10);
console.log("找到:", found.some ? found.value : "无");
console.log("没找到:", none.some ? none.value : "无");

// ---- 3. 类型安全的 EventEmitter ----
console.log("\\n========== 3. 类型安全 EventEmitter ==========");

class Emitter<Events extends Record<string, any>> {
  // 每个事件名对应一组处理器
  private handlers: { [K in keyof Events]?: Array<(e: Events[K]) => void> } = {};

  // 注册处理器：event 必须是 Events 的键，回调参数类型 = Events[event]
  on<K extends keyof Events>(event: K, fn: (e: Events[K]) => void): this {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event]!.push(fn);
    return this;
  }

  // 触发事件：参数类型必须匹配 Events[event]
  emit<K extends keyof Events>(event: K, e: Events[K]): void {
    const fns = this.handlers[event];
    if (fns) fns.forEach((fn) => fn(e));
  }
}

// 定义事件映射
interface AppEvents {
  click: { x: number; y: number };
  input: string;
  submit: { form: string };
}

const bus = new Emitter<AppEvents>();
bus.on("click", (e) => console.log("  点击:", e.x, e.y))   // e: {x,y}
   .on("input", (e) => console.log("  输入:", e))          // e: string
   .on("submit", (e) => console.log("  提交:", e.form));    // e: {form}

bus.emit("click", { x: 10, y: 20 });
bus.emit("input", "hello");
bus.emit("submit", { form: "login" });
// bus.emit("click", "wrong"); // ❌ 编译期：参数类型不匹配

// ---- 4. Builder 链式 API（this 类型 + map 切换类型）----
console.log("\\n========== 4. Builder 链式 API ==========");

class QueryBuilder<T> {
  private items: T[] = [];
  private preds: Array<(x: T) => boolean> = [];

  static from<T>(arr: T[]): QueryBuilder<T> {
    const q = new QueryBuilder<T>();
    q.items = arr.slice();
    return q;
  }

  // filter 保持元素类型，返回 this 支持链式
  filter(pred: (x: T) => boolean): this {
    this.preds.push(pred);
    return this;
  }

  // map 切换元素类型 → 返回 QueryBuilder<U>
  map<U>(fn: (x: T) => U): QueryBuilder<U> {
    const result = new QueryBuilder<U>();
    const filtered = this.items.filter((x) => this.preds.every((p) => p(x)));
    result.items = filtered.map(fn);
    return result;
  }

  toArray(): T[] { return this.items.slice(); }
}

const r = QueryBuilder.from([1, 2, 3, 4, 5])
  .filter((x) => x > 1)
  .filter((x) => x < 5)
  .map((x) => "值" + x)   // T 从 number 切换到 string
  .toArray();
console.log("Builder 链式:", r);

// ---- 5. 泛型 Repository ----
console.log("\\n========== 5. 泛型 Repository ==========");

interface Identifiable { id: string; }
// 约束 T 必须有 id
interface Repository<T extends Identifiable> {
  findById(id: string): T | null;
  save(entity: T): T;
}

interface User extends Identifiable { id: string; name: string; }

class InMemoryRepo<T extends Identifiable> implements Repository<T> {
  private store = new Map<string, T>();
  findById(id: string): T | null { return this.store.get(id) || null; }
  save(entity: T): T { this.store.set(entity.id, entity); return entity; }
}

const userRepo = new InMemoryRepo<User>();
userRepo.save({ id: "u1", name: "张三" });
console.log("Repository findById:", userRepo.findById("u1"));
console.log("Repository 未找到:", userRepo.findById("u2"));

// ---- 6. 陷阱演示 ----
console.log("\\n========== 6. 陷阱演示 ==========");

// 陷阱 1：不能 new T() / typeof T —— 需传入构造函数
function createInstance<T>(ctor: new (...args: any[]) => T, ...args: any[]): T {
  // 不能写 new T()，T 是类型不是值
  return new ctor(...args);
}
class Point { constructor(public x: number, public y: number) {} }
console.log("陷阱1 正解（传构造函数）:", createInstance(Point, 1, 2));

// 陷阱 2：装饰性泛型（T 没被使用，无意义）
// ❌ function log<T>(msg: string) { console.log(msg); }  // T 装饰性
// ✅ 去掉 T
function logMsg(msg: string) { console.log("  陷阱2 去装饰泛型:", msg); }
logMsg("hello");

// 陷阱 3：推断不出 → unknown
function makeState<T>(): [T, (v: T) => void] {
  let s: T;
  return [
    undefined as unknown as T,
    (v: T) => { s = v; }
  ];
}
// const [s, setS] = makeState(); // T = unknown（类型安全丢失）
// 正解：让 T 出现在参数，或显式指定
const [s, setS] = makeState<number>();
setS(42);
console.log("  陷阱3 正解（显式指定 T=number）:", s);

// 陷阱 4：any 破坏泛型安全
function firstBad<T>(arr: T[]): T { return arr[0] as any; } // ❌ as any
function firstGood<T>(arr: T[]): T { return arr[0]; }       // ✅
console.log("  陷阱4 正解（不用 any 断言）:", firstGood([1, 2, 3]));

// ---- 7. 最佳实践总结 ----
console.log("\\n========== 7. 最佳实践总结 ==========");
console.log("  1. 泛型保留类型关联（输入输出有联系才用）");
console.log("  2. 优先推断，推断不出时重设计 API");
console.log("  3. 约束最小化（只约束真正用到的能力）");
console.log("  4. 运行时需类型信息 → 显式传入构造函数/标签");
console.log("  5. 可辨识联合 + 泛型做错误处理（Result/Option）");
console.log("  6. 工具类型优先（Partial/Pick/Omit/Record）");
console.log("  7. 避免 装饰性泛型 / 过度泛型 / any 泄漏");
console.log("  8. 开启 strict + strictFunctionTypes");

console.log("\\n泛型设计模式、陷阱与最佳实践章节演示完成！");`,
  },
];
