// =============================================================
// TypeScript 全解 · Batch 4：泛型体系（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 泛型从基础到映射类型的完整链路：
//   1. 泛型基础           tsbook-generic-basic
//   2. 泛型约束 extends   tsbook-generic-constraint
//   3. 多泛型参数与默认值  tsbook-multi-generic
//   4. 泛型推导           tsbook-generic-inference
//   5. 映射类型           tsbook-mapped-type
// 章节归属 group：泛型体系
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：泛型基础
  // ===========================================================
  {
    id: "tsbook-generic-basic",
    title: "泛型基础",
    icon: "🧬",
    group: "泛型体系",
    content: `# 🧬 泛型基础

泛型是 TypeScript 最核心的特性之一：让一个函数、接口或类**不绑定到具体类型**，而是把类型当作"参数"传进来。

## 一、为什么需要泛型

假设我们要写一个 \`identity\` 函数：传入什么，返回什么。

\`\`\`ts
// ❌ 方案 A：用 any
function identity(value: any): any {
  return value;
}
const r = identity(42);
r.toUpperCase();  // 编译通过！但运行时炸
\`\`\`

\`any\` 把类型信息扔了——入参是 \`number\`，但返回值变成 \`any\`，编译器再也不知道它原来是什么，于是任何调用都不报错。这相当于关掉了类型检查。

\`\`\`ts
// ✅ 方案 B：用泛型
function identity<T>(value: T): T {
  return value;
}
const r = identity(42);  // T 推导为 number
r.toUpperCase();  // ❌ 编译报错：number 没有 toUpperCase
\`\`\`

泛型的核心价值就一句话：**既灵活又保留类型信息**——同一份代码能服务于多种类型，每种类型都享受完整的类型检查。

## 二、泛型函数与 \`<T>\` 声明

\`<T>\` 是**类型参数声明**：\`T\` 是占位符，调用时由编译器填入具体类型。

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);    // 返回 number
first(["a", "b"]);   // 返回 string
\`\`\`

\`T\` 只是惯例命名，也可以叫 \`U\`、\`V\`、\`TItem\`、\`TValue\`，但 \`T\`（Type）最常见。

## 三、调用时显式指定类型参数

\`\`\`ts
const r1 = identity<string>("hello");  // 显式指定 T = string
const r2 = identity(42);              // 让编译器推导 T = number
\`\`\`

什么时候必须显式？**当泛型只出现在返回值，或推导结果不符合预期时**——第 4 章会展开。

## 四、泛型接口

\`\`\`ts
interface Box<T> {
  value: T;
  label: string;
}
const numBox: Box<number> = { value: 42, label: "数字盒" };
const strBox: Box<string> = { value: "hi", label: "字符串盒" };
\`\`\`

\`Box<number>\` 和 \`Box<string>\` 是**两个不同的类型**，互不兼容。

## 五、泛型类

\`\`\`ts
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
const numStack = new Stack<number>();
numStack.push(1);  // 只能放 number
\`\`\`

泛型类把类型参数作用到整个类，所有方法共享同一个 \`T\`。

## 六、多个类型参数

\`\`\`ts
class Pair<T, U> {
  constructor(public first: T, public second: U) {}
}
const p = new Pair(1, "hello");  // T = number, U = string
\`\`\`

\`T\` 和 \`U\` 互相独立，可以分别填入任何类型。

## 七、小结

- 泛型 = 类型层面的"参数化"
- \`<T>\` 声明类型参数，调用时填入具体类型
- 替代 \`any\`：既灵活又保留类型信息
- 函数、接口、类都能泛型化

> *下一章，给泛型加约束：\`T extends U\`。*`,
    code: `// 🧬 泛型基础 Demo

// ============================================================
// 1️⃣ 为什么需要泛型：any 的陷阱
// ============================================================

// ❌ 用 any：丢失类型信息
function badIdentity(value: any): any {   // 入参 any，返回 any
  return value;
}
const bad = badIdentity(42);   // 类型是 any，丢失了"是 number"
// bad.toUpperCase();  // 编译通过但运行时报错（这正是 any 的危害）

// ✅ 用泛型：保留类型信息
function identity<T>(value: T): T {      // <T> 是类型参数声明
  return value;                          // 返回值类型 = 入参类型
}
const ok = identity(42);       // T 自动推导为 number
// ok.toUpperCase();  // ❌ 编译报错：number 没有 toUpperCase
console.log("identity(42) =", ok, "| 类型:", typeof ok);

// 显式指定类型参数：identity<string>(...)
const explicit = identity<string>("hello");  // 显式声明 T = string
console.log("identity<string>('hello') =", explicit);

// ============================================================
// 2️⃣ 泛型函数：保留入参与返回值的关联
// ============================================================

// first：返回数组第一个元素，返回类型与数组元素一致
function first<T>(arr: T[]): T | undefined {  // 入参 T[]，返回 T
  return arr[0];
}
const n = first([1, 2, 3]);     // T = number，返回 number
const s = first(["a", "b"]);    // T = string，返回 string
console.log("first([1,2,3]) =", n);
console.log("first(['a','b']) =", s);

// ============================================================
// 3️⃣ 泛型接口
// ============================================================

// 一个"盒子"接口：装什么由 T 决定
interface Box<T> {
  value: T;          // 盒子里装的东西
  label: string;
}

const numBox: Box<number> = { value: 42, label: "数字盒" };     // 显式 T = number
const strBox: Box<string> = { value: "hi", label: "字符串盒" };  // 显式 T = string
console.log("numBox =", numBox);
console.log("strBox =", strBox);

// ============================================================
// 4️⃣ 泛型类：泛型栈
// ============================================================

class Stack<T> {
  private items: T[] = [];     // 用 T[] 存储元素

  push(item: T): void {        // 入栈元素必须是 T
    this.items.push(item);
  }

  pop(): T | undefined {        // 出栈返回 T
    return this.items.pop();
  }

  peek(): T | undefined {       // 看栈顶元素
    return this.items[this.items.length - 1];
  }

  get size(): number {           // 栈大小
    return this.items.length;
  }
}

// 数字栈：显式指定 T = number
const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.push(3);
console.log("numStack pop =", numStack.pop(), "| size =", numStack.size);

// 字符串栈：显式指定 T = string
const strStack = new Stack<string>();
strStack.push("a");
strStack.push("b");
console.log("strStack peek =", strStack.peek());

// ============================================================
// 5️⃣ 泛型类：泛型 Pair（两个不同类型）
// ============================================================

class Pair<T, U> {                       // 两个独立类型参数
  constructor(public first: T, public second: U) {}

  swap(): Pair<U, T> {                   // 交换后类型也跟着换
    return new Pair(this.second, this.first);
  }

  toString(): string {
    // 用字符串拼接，避免模板字面量转义
    return "(" + this.first + ", " + this.second + ")";
  }
}

const p1 = new Pair(1, "hello");   // T = number, U = string
console.log("p1 =", p1.toString());
const p2 = p1.swap();              // 返回 Pair<string, number>
console.log("p1.swap() =", p2.toString());
`,
  },

  // ===========================================================
  // 第 2 章：泛型约束 extends
  // ===========================================================
  {
    id: "tsbook-generic-constraint",
    title: "泛型约束 extends",
    icon: "🔗",
    group: "泛型体系",
    content: `# 🔗 泛型约束 extends

默认情况下 \`T\` 可以是任何类型——但"任何类型"意味着**编译器对 \`T\` 几乎一无所知**，连访问属性都会报错。约束就是用来**限定 \`T\` 的范围**，让编译器知道 \`T\` 至少具备哪些能力。

## 一、问题：泛型里访问属性会报错

\`\`\`ts
function getLength<T>(value: T): number {
  return value.length;  // ❌ 报错：T 不一定有 length
}
\`\`\`

编译器只看到 \`T\` 是某个未知类型，不能假设它有 \`length\` 属性。

## 二、\`T extends U\`：限定类型范围

\`\`\`ts
interface HasLength {
  length: number;
}

function getLength<T extends HasLength>(value: T): number {
  return value.length;  // ✅ 现在 T 至少有 length
}

getLength("hello");           // ✅ string 有 length
getLength([1, 2, 3]);        // ✅ array 有 length
getLength({ length: 10 });    // ✅ 对象有 length
getLength(42);                // ❌ number 没有 length
\`\`\`

\`T extends HasLength\` 读作"T 必须满足 HasLength 的形状"——不是继承，是**类型层面的一致性约束**。

## 三、\`keyof\` 约束：保证 key 存在

\`\`\`ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];  // ✅ key 一定是 obj 的属性
}

const user = { name: "Alice", age: 30 };
getProperty(user, "name");   // ✅
getProperty(user, "phone");  // ❌ "phone" 不是 user 的 key
\`\`\`

\`K extends keyof T\` 保证传入的 key 一定是对象的合法属性——这是 TS 里**最常用的约束模式**之一。

## 四、返回类型跟随约束：\`T[K]\`

\`T[K]\` 是**索引访问类型**：取出 \`T\` 中 \`K\` 对应的属性类型。

\`\`\`ts
const name = getProperty(user, "name");  // 推导为 string
const age = getProperty(user, "age");    // 推导为 number
\`\`\`

约束不仅保证安全，还能让返回值类型精确推导。

## 五、条件类型约束：\`T extends U ? X : Y\`

\`\`\`ts
type ElementType<T> = T extends Array<infer U> ? U : T;
// number[] -> number
// string  -> string
\`\`\`

配合 \`infer\` 关键字，能在条件分支中"捕获"类型变量，是类型体操的核心工具。

## 六、约束的作用总结

| 痛点 | 没有约束 | 加约束 |
|------|---------|--------|
| 访问属性 | 编译报错 | 编译通过 |
| 入参合法性 | 不检查 | 编译期校验 |
| 返回类型推导 | 不精确 | 精确到具体属性类型 |

> *下一章，多类型参数和默认值。*`,
    code: `// 🔗 泛型约束 extends Demo

// ============================================================
// 1️⃣ getProperty：约束 + keyof + 索引类型
// ============================================================

// K extends keyof T：K 必须是 T 的某个 key
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];    // 安全：key 一定是 obj 的合法属性
}

const user = { name: "Alice", age: 30, email: "a@b.com" };
const name = getProperty(user, "name");    // T = typeof user, K = "name"
const age = getProperty(user, "age");      // 返回类型自动推导为 number
// getProperty(user, "phone");  // ❌ 编译报错：phone 不是 user 的 key
console.log("name =", name, "| age =", age);

// ============================================================
// 2️⃣ length 约束：T extends { length: number }
// ============================================================

interface HasLength {
  length: number;       // 必须有 length 属性
}

// T extends HasLength：T 至少要有 length 属性
function logLength<T extends HasLength>(value: T): T {
  console.log("  length =", value.length);  // 安全访问 .length
  return value;                              // 返回原值，保留具体类型
}

console.log("--- logLength 测试 ---");
logLength("hello");                 // string 有 length
logLength([1, 2, 3]);               // array 有 length
logLength({ length: 10, name: "x" });  // 自定义对象有 length
// logLength(42);  // ❌ 编译报错：number 没有 length

// ============================================================
// 3️⃣ 工厂函数：约束 T 必须是构造函数
// ============================================================

// T extends new (...args) => any：T 必须是一个可 new 的构造函数
function createInstance<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>   // 自动推导构造函数的参数类型
): InstanceType<T> {                   // 自动推导实例类型
  return new ctor(...args);            // 用 new 调用构造函数
}

class Dog {
  constructor(public name: string = "旺财") {}  // 带默认值的构造函数
  bark(): string { return "汪汪！"; }
}

const dog = createInstance(Dog, "小白");   // 返回 Dog 实例
console.log("dog.name =", dog.name, "| bark =", dog.bark());

const defaultDog = createInstance(Dog);    // 不传参，用默认值
console.log("defaultDog.name =", defaultDog.name);

// ============================================================
// 4️⃣ 条件类型约束：T extends U ? X : Y
// ============================================================

// 如果 T 是数组，返回数组元素类型；否则返回 T 本身
type ElementType<T> = T extends Array<infer U> ? U : T;
//                                ↑ infer 捕获数组元素类型到 U

type A1 = ElementType<number[]>;     // number
type A2 = ElementType<string>;       // string
type A3 = ElementType<boolean[]>;     // boolean

const a1: A1 = 42;
const a2: A2 = "hello";
const a3: A3 = true;
console.log("ElementType<number[]>  ->", typeof a1);
console.log("ElementType<string>     ->", typeof a2);
console.log("ElementType<boolean[]>  ->", typeof a3);

// ============================================================
// 5️⃣ 综合约束：pick + 约束组合
// ============================================================

// T extends object：T 必须是对象类型
function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]                          // keys 必须是 T 的合法属性数组
): Pick<T, K> {                      // 返回类型用 Pick 工具类型
  const result = {} as Pick<T, K>;   // 先断言为最终类型
  keys.forEach(k => {
    result[k] = obj[k];              // 安全：k 一定是合法 key
  });
  return result;
}

const picked = pickKeys(user, ["name", "age"]);
console.log("picked =", picked);
// pickKeys(user, ["phone"]);  // ❌ 编译报错：phone 不是 user 的 key
`,
  },

  // ===========================================================
  // 第 3 章：多泛型参数与默认值
  // ===========================================================
  {
    id: "tsbook-multi-generic",
    title: "多泛型参数与默认值",
    icon: "🎚️",
    group: "泛型体系",
    content: `# 🎚️ 多泛型参数与默认值

一个泛型声明里可以放多个类型参数 \`<T, U, V>\`，也可以给类型参数设**默认值** \`<T = string>\`，让调用方少写一些样板代码。

## 一、多个类型参数

\`\`\`ts
class Triple<T, U, V> {
  constructor(public a: T, public b: U, public c: V) {}
}
const t = new Triple(1, "hello", true);
// T=number, U=string, V=boolean
\`\`\`

每个类型参数互相独立，按声明顺序填入。

## 二、默认类型参数

\`\`\`ts
interface Result<T, E = string> {  // E 默认是 string
  data: T;
  error?: E;
}

const r1: Result<number> = { data: 42, error: "net error" };     // E = string
const r2: Result<number, Error> = { data: 42, error: new Error() };  // E = Error
\`\`\`

调用方不传 \`E\` 时使用默认值，传了就用传入的。和函数默认参数一个道理。

## 三、默认值的规则

1. **带默认值的参数必须放在不带默认值的参数后面**——和函数参数默认值规则一致：

   \`\`\`ts
   // ✅ 合法
   interface A<T, U = string> { ... }
   // ❌ 报错：带默认值的 U 不能放在 T 前面
   interface B<U = string, T> { ... }
   \`\`\`

2. **默认值可以引用前面的类型参数**：

   \`\`\`ts
   interface Store<T, V = T[]> {  // V 默认是 T[]
     current: T;
     history: V;
   }
   \`\`\`

3. **约束 + 默认值可以组合**：

   \`\`\`ts
   interface Config<T extends string | number = string> {
     value: T;
   }
   \`\`\`

   注意：约束写在默认值前面（\`T extends X = Y\`）。

## 四、实战：简易 Map 类型

\`\`\`ts
interface SimpleMap<K, V> {
  set(key: K, value: V): void;
  get(key: K): V | undefined;
}
\`\`\`

\`K\`、\`V\` 两个类型参数分别对应键和值，组合出任意映射关系。

## 五、何时用默认值

- 该类型参数在 80% 场景下都是同一个类型 → 给默认值
- 通用工具想给"合理 fallback" → 给默认值
- 内部用得多、外部不常覆盖 → 给默认值

> *下一章，让编译器自动推导类型参数。*`,
    code: `// 🎚️ 多泛型参数与默认值 Demo

// ============================================================
// 1️⃣ 多个泛型参数：<T, U, V>
// ============================================================

// 三元组：三个独立类型
class Triple<T, U, V> {
  constructor(
    public a: T,
    public b: U,
    public c: V,
  ) {}

  toString(): string {
    return "(" + this.a + ", " + this.b + ", " + this.c + ")";
  }
}

const t1 = new Triple(1, "hello", true);  // T=number, U=string, V=boolean
console.log("Triple =", t1.toString());

// ============================================================
// 2️⃣ 简易 Map 类型：<K, V>
// ============================================================

interface SimpleMap<K, V> {
  set(key: K, value: V): void;       // 设置键值对
  get(key: K): V | undefined;        // 取值
  has(key: K): boolean;              // 判断 key 是否存在
  keys(): K[];                       // 所有 key
}

class MyMap<K, V> implements SimpleMap<K, V> {
  private store = new Map<K, V>();   // 内部用原生 Map 存储

  set(key: K, value: V): void {       // 设置键值对
    this.store.set(key, value);
  }

  get(key: K): V | undefined {        // 取值
    return this.store.get(key);
  }

  has(key: K): boolean {              // 判断 key 是否存在
    return this.store.has(key);
  }

  keys(): K[] {                       // 所有 key
    return [...this.store.keys()];
  }
}

// string -> number 的 Map
const scoreMap = new MyMap<string, number>();
scoreMap.set("Alice", 90);
scoreMap.set("Bob", 85);
console.log("Alice score =", scoreMap.get("Alice"));
console.log("has Bob?", scoreMap.has("Bob"));
console.log("keys =", scoreMap.keys());

// number -> string 的 Map
const idMap = new MyMap<number, string>();
idMap.set(1, "Alice");
idMap.set(2, "Bob");
console.log("id=1 ->", idMap.get(1));

// ============================================================
// 3️⃣ 默认类型参数：<T, E = string>
// ============================================================

// E 默认为 string 类型
interface Result<T, E = string> {
  ok: boolean;
  data: T;
  error?: E;       // 不指定 E 时默认 string
}

// 显式指定 E = Error
const r1: Result<number, Error> = {
  ok: true,
  data: 42,
  error: new Error("oops"),
};

// 不指定 E，E 默认为 string
const r2: Result<number> = {
  ok: false,
  data: 0,
  error: "network error",   // E 自动是 string
};
console.log("r1 =", r1.ok, r1.data, r1.error);
console.log("r2 =", r2.ok, r2.data, r2.error);

// ============================================================
// 4️⃣ 默认值 + 约束组合：T extends X = Y
// ============================================================

// T 必须是 string | number，默认 string
interface Config<T extends string | number = string> {
  value: T;
  label: string;
}

const c1: Config = { value: "default", label: "x" };       // T 用默认 = string
const c2: Config<number> = { value: 42, label: "y" };     // T 显式指定为 number
// const c3: Config<boolean> = { value: true, label: "z" };  // ❌ 不在约束内
console.log("c1 =", c1);
console.log("c2 =", c2);

// ============================================================
// 5️⃣ 默认值引用前一个类型参数：V = T[]
// ============================================================

// V 的默认值是 T[] —— 后面参数可以引用前面的参数
interface Store<T, V = T[]> {
  current: T;
  history: V;
}

const s1: Store<number> = {            // V 默认为 number[]
  current: 1,
  history: [1, 2, 3],
};

const s2: Store<string, string> = {    // 显式覆盖 V 为 string
  current: "hello",
  history: "prev-value",
};
console.log("s1 =", s1);
console.log("s2 =", s2);

// ============================================================
// 6️⃣ 默认值的顺序规则：带默认值必须放后面
// ============================================================

// ✅ 合法：带默认值的 V 放在 T 后面
interface Pair2<T, U, V = U> {
  first: T;
  second: U;
  third: V;          // 默认等于 U
}

const p1: Pair2<number, string> = {           // V 默认为 string
  first: 1,
  second: "hello",
  third: "world",
};

const p2: Pair2<number, string, boolean> = {   // V 显式指定为 boolean
  first: 1,
  second: "hello",
  third: true,
};
console.log("p1 =", p1);
console.log("p2 =", p2);
`,
  },

  // ===========================================================
  // 第 4 章：泛型推导
  // ===========================================================
  {
    id: "tsbook-generic-inference",
    title: "泛型推导",
    icon: "🔮",
    group: "泛型体系",
    content: `# 🔮 泛型推导

调用泛型函数时，TS 会从入参**自动推导**类型参数——这是泛型最舒服的特性：你写 \`identity(42)\`，编译器自动知道 \`T = number\`。但推导不是万能的，有些场景必须显式指定。

## 一、自动推导：从入参推导 \`T\`

\`\`\`ts
function identity<T>(value: T): T { return value; }

identity(42);          // T = number
identity("hello");    // T = string
identity([1, 2, 3]);  // T = number[]
identity({ x: 1 });   // T = { x: number }
\`\`\`

编译器从入参字面量反推 \`T\`，调用方一行多余代码都不用写。

## 二、推导失败：传入 \`null\` / \`undefined\`

\`\`\`ts
const r = identity(null);  // T 推导为 null，丢失可空语义
\`\`\`

\`null\` 没有类型信息，编译器只能推导出 \`T = null\`——后续无法再赋值为 \`number\`。这种情况要**显式指定兜底**：

\`\`\`ts
const r = identity<number | null>(null);  // 显式声明可空类型
\`\`\`

## 三、推导冲突：多个入参推导出不同 \`T\`

\`\`\`ts
function merge<T>(a: T, b: T): T[] { return [a, b]; }

merge(1, 2);          // T = number，没问题
merge(1, "hello");    // T = number | string（联合类型）
\`\`\`

多个入参同时推导 \`T\` 时，编译器取**公共父类型**——通常是联合类型，往往不是你想要的。这种情况要么改函数签名（用两个独立类型参数 \`<T, U>\`），要么显式指定。

## 四、推导出"宽类型"：字面量丢失

\`\`\`ts
function first<T>(arr: T[]): T { return arr[0]; }

first(["a", "b", "c"]);  // T = string，不是 "a"|"b"|"c"
\`\`\`

数组字面量默认推导为元素类型而非字面量联合。需要窄类型时用 \`as const\`：

\`\`\`ts
first(["a", "b", "c"] as const);  // T = "a"|"b"|"c"
\`\`\`

## 五、推导不出：泛型只出现在返回值

\`\`\`ts
function makeArray<T>(): T[] { return []; }

const arr = makeArray();  // ❌ 没有入参，推导不出 T
const arr = makeArray<number>();  // ✅ 必须显式指定
\`\`\`

编译器只能从**入参**推导，没有入参就无能为力。

## 六、什么时候能推导，什么时候必须显式

| 场景 | 能否推导 |
|------|---------|
| 泛型出现在入参 | ✅ 自动推导 |
| 泛型只出现在返回值 | ❌ 必须显式 |
| 入参是 \`null\` / \`undefined\` | ⚠️ 推导不精确，建议显式 |
| 多个入参推导冲突 | ⚠️ 推导为联合，按需显式 |
| 想要字面量类型 | ⚠️ 用 \`as const\` 或显式指定 |

## 七、显式 vs 推导：取舍

- **能推导就别写显式**——少写代码、少出错
- **推导结果不对才显式**——比如联合类型、字面量丢失
- **泛型只出现在返回值**——必须显式

> *下一章，TypeScript 类型系统的核心：映射类型。*`,
    code: `// 🔮 泛型推导 Demo

// ============================================================
// 1️⃣ 自动推导：从入参推导 T
// ============================================================

function identity<T>(value: T): T {
  return value;
}

// 不显式指定 T，TS 从入参字面量自动推导
const a1 = identity(42);          // 推导 T = number
const a2 = identity("hello");     // 推导 T = string
const a3 = identity([1, 2, 3]);   // 推导 T = number[]
const a4 = identity({ x: 1 });    // 推导 T = { x: number }

console.log("--- 1️⃣ 自动推导 ---");
console.log("a1 =", a1, "|", typeof a1);
console.log("a2 =", a2, "|", typeof a2);
console.log("a3 =", a3, "| isArray:", Array.isArray(a3));
console.log("a4 =", a4);

// ============================================================
// 2️⃣ 推导失败：null / undefined
// ============================================================

console.log("--- 2️⃣ 推导失败兜底 ---");

// 传入 null 时推导出 null，丢失了"可空"语义
const b1 = identity(null);        // T = null
console.log("b1 =", b1, "| typeof:", typeof b1);

// ✅ 显式指定兜底：声明可空类型
const b2 = identity<number | null>(null);   // 显式 T = number | null
console.log("b2 =", b2, "| 后续可以赋值为 number");

// ============================================================
// 3️⃣ 推导冲突：多个入参推导出不同 T
// ============================================================

function merge<T>(a: T, b: T): T[] {
  return [a, b];
}

console.log("--- 3️⃣ 推导冲突 ---");

// 多个入参都推导 T：取公共父类型
const m1 = merge(1, 2);            // T = number
console.log("merge(1, 2) =", m1);

// 数字和字符串混合：T 推导为 number | string（联合类型）
const m2 = merge(1, "hello");      // T = number | string
console.log("merge(1, 'hello') =", m2);

// 显式指定避免意外联合
const m3 = merge<number>(1, 2);    // 强制 T = number
console.log("merge<number>(1, 2) =", m3);

// ============================================================
// 4️⃣ 推导出宽类型：字面量丢失
// ============================================================

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log("--- 4️⃣ 字面量推导 ---");

// 数组字面量推导为元素类型，不是字面量联合
const f1 = first(["a", "b", "c"]);   // T = string，不是 "a"|"b"|"c"
console.log("first(['a','b','c']) =", f1, "| typeof:", typeof f1);

// ✅ 用 as const 让推导更窄
const f2 = first(["a", "b", "c"] as const);  // T = "a"|"b"|"c"
console.log("first([...as const]) =", f2);

// ============================================================
// 5️⃣ 推导不出：必须显式指定
// ============================================================

console.log("--- 5️⃣ 必须显式 ---");

// 泛型只用在返回值时，TS 没法推导
function makeArray<T>(): T[] {
  return [] as T[];                 // 内部断言为 T[]
}

// const x = makeArray();   // ❌ 编译报错：推导不出 T
const arr1 = makeArray<number>();   // ✅ 显式指定
arr1.push(1);
console.log("makeArray<number>() =", arr1);

// 工厂函数：传入构造函数，推导实例类型
function create<T>(ctor: new () => T): T {
  return new ctor();
}

class Cat {
  name = "小猫";
  meow(): string { return "喵"; }
}

// 从构造函数推导 T = Cat
const cat = create(Cat);
console.log("cat.name =", cat.name, "| meow =", cat.meow());

// ============================================================
// 6️⃣ 显式 vs 推导：对比
// ============================================================

console.log("--- 6️⃣ 显式 vs 推导 ---");

function pair<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}

// 推导：T、U 都从入参推导
const p1 = pair(1, "hi");          // [number, string]
// 显式：完全显式指定 T、U
const p2 = pair<number, string>(1, "hi");
// 部分显式：前面的 T 显式，后面的 U 由入参推导
const p3 = pair<number>(1, "hi");  // T=number, U 推导为 string

console.log("p1 (推导)    =", p1);
console.log("p2 (全显式)  =", p2);
console.log("p3 (半显式)  =", p3);
`,
  },

  // ===========================================================
  // 第 5 章：映射类型
  // ===========================================================
  {
    id: "tsbook-mapped-type",
    title: "映射类型",
    icon: "🗺️",
    group: "泛型体系",
    content: `# 🗺️ 映射类型

映射类型是 TypeScript 类型系统的**核心武器**：它能基于一个类型，按规则生成另一个类型。所有内置工具类型 \`Partial\`、\`Required\`、\`Readonly\`、\`Pick\`、\`Record\` 都是用映射类型实现的。

## 一、\`[K in keyof T]\`：遍历 key

\`\`\`ts
type Copy<T> = {
  [K in keyof T]: T[K];   // K 遍历 T 的所有 key
};
\`\`\`

读作："对 \`T\` 的每个 key \`K\`，新类型的 \`K\` 属性类型为 \`T[K]\`"。结果是 \`T\` 的同构拷贝。

## 二、修饰符：\`?\` 和 \`readonly\`

映射类型能在每个 key 上加修饰符：

| 修饰符 | 加 | 移除 |
|--------|-----|------|
| 可选 \`?\` | \`[K in keyof T]?: ...\` | \`[K in keyof T]-?: ...\` |
| 只读 \`readonly\` | \`readonly [K in keyof T]: ...\` | \`-readonly [K in keyof T]: ...\` |

\`\`\`ts
// Partial：所有属性变可选
type MyPartial<T> = { [K in keyof T]?: T[K]; };

// Required：所有属性变必填
type MyRequired<T> = { [K in keyof T]-?: T[K]; };

// Readonly：所有属性只读
type MyReadonly<T> = { readonly [K in keyof T]: T[K]; };

// Mutable：移除只读
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };
\`\`\`

\`-\` 是**修饰符移除符**：\`-?\` 移除可选，\`-readonly\` 移除只读。

## 三、\`Pick\`：挑选部分 key

\`\`\`ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];    // P 遍历 K（K 是 T 的子集）
};

type UserName = MyPick<User, "name">;            // { name: string }
type UserNameAge = MyPick<User, "name" | "age">;  // { name: string; age: number }
\`\`\`

\`K extends keyof T\` 保证只能挑 \`T\` 已有的 key。

## 四、\`Record\`：固定 value 类型

\`\`\`ts
type MyRecord<K extends string | number | symbol, V> = {
  [P in K]: V;       // 每个 key 都是 V 类型
};

type Score = MyRecord<"math" | "english" | "cs", number>;
// { math: number; english: number; cs: number }
\`\`\`

\`K\` 是 key 的集合，\`V\` 是统一的 value 类型。

## 五、为什么映射类型是核心

- **零运行时开销**：纯类型层面的变换，编译后被擦除
- **可组合**：映射类型可以嵌套、组合，生成复杂类型
- **同构性**：基于原类型推导，原类型变了新类型自动跟着变

## 六、高级：变换 value 类型

\`\`\`ts
// 把所有属性变成函数
type Functionize<T> = {
  [K in keyof T]: (value: T[K]) => T[K];
};
\`\`\`

映射类型不仅能复制 key，还能改变 value 类型——这是类型体操的基础。

> *映射类型开启了类型编程的大门，下一 batch 进入高级类型。*`,
    code: `// 🗺️ 映射类型 Demo

// ============================================================
// 1️⃣ 最朴素的映射：[K in keyof T]
// ============================================================

// 把 T 的每个 key 复制一份（结果类型与 T 相同）
type Copy<T> = {
  [K in keyof T]: T[K];       // K 遍历 T 的所有 key
};

type User = { name: string; age: number; email: string };
type UserCopy = Copy<User>;      // 完全相同的类型（同构拷贝）

const u1: UserCopy = { name: "Alice", age: 30, email: "a@b.com" };
console.log("--- 1️⃣ Copy ---");
console.log("UserCopy =", u1);

// ============================================================
// 2️⃣ Partial：所有属性变可选（加 ?）
// ============================================================

type MyPartial<T> = {
  [K in keyof T]?: T[K];      // 每个属性后加 ?，变成可选
};

type PartialUser = MyPartial<User>;

// 全部可省略
const u2: PartialUser = { name: "Bob" };   // 只填 name 也行
const u3: PartialUser = {};                 // 空也行
console.log("--- 2️⃣ Partial ---");
console.log("PartialUser 1 =", u2);
console.log("PartialUser 2 =", u3);

// ============================================================
// 3️⃣ Required：所有属性变必填（用 -? 移除 ?）
// ============================================================

type MyRequired<T> = {
  [K in keyof T]-?: T[K];      // -? 表示移除可选 ?
};

type OptionalUser = { name?: string; age?: number };
type RequiredUser = MyRequired<OptionalUser>;

// 全部必填
const u4: RequiredUser = { name: "Alice", age: 30 };
console.log("--- 3️⃣ Required ---");
console.log("RequiredUser =", u4);
// const u5: RequiredUser = { name: "Alice" };  // ❌ age 必填

// ============================================================
// 4️⃣ Readonly：所有属性只读（加 readonly）
// ============================================================

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];   // 每个属性前加 readonly
};

type ReadonlyUser = MyReadonly<User>;
const u5: ReadonlyUser = { name: "Alice", age: 30, email: "a@b.com" };
// u5.name = "Bob";  // ❌ 只读，不能修改
console.log("--- 4️⃣ Readonly ---");
console.log("ReadonlyUser =", u5);

// ============================================================
// 5️⃣ Mutable：移除 readonly（用 -readonly）
// ============================================================

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];   // -readonly 移除只读修饰符
};

type MutableUser = Mutable<ReadonlyUser>;
const u6: MutableUser = { name: "Alice", age: 30, email: "a@b.com" };
u6.name = "Bob";     // ✅ 可修改
console.log("--- 5️⃣ Mutable ---");
console.log("MutableUser (改名后) =", u6);

// ============================================================
// 6️⃣ Pick：挑选部分 key（结合映射 + 约束）
// ============================================================

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];             // P 遍历 K（K 必须是 T 的子集）
};

type UserName = MyPick<User, "name">;
type UserNameAge = MyPick<User, "name" | "age">;

const u7: UserName = { name: "Alice" };
const u8: UserNameAge = { name: "Bob", age: 25 };
console.log("--- 6️⃣ Pick ---");
console.log("Pick name =", u7);
console.log("Pick name|age =", u8);

// ============================================================
// 7️⃣ Record：把每个 key 映射成同一个类型
// ============================================================

type MyRecord<K extends string | number | symbol, V> = {
  [P in K]: V;                // P 遍历 K，每个 key 都是 V
};

type Score = MyRecord<"math" | "english" | "cs", number>;
const scores: Score = {
  math: 90,
  english: 85,
  cs: 95,
};
console.log("--- 7️⃣ Record ---");
console.log("Record =", scores);

// ============================================================
// 8️⃣ 综合应用：把所有属性变成函数
// ============================================================

type Functionize<T> = {
  [K in keyof T]: (value: T[K]) => T[K];   // 每个属性变成函数
};

type UserFns = Functionize<User>;
const fns: UserFns = {
  name: (v) => v.toUpperCase(),       // v: string
  age: (v) => v + 1,                  // v: number
  email: (v) => v.toLowerCase(),      // v: string
};
console.log("--- 8️⃣ Functionize ---");
console.log("Functionize name  =", fns.name("alice"));
console.log("Functionize age   =", fns.age(30));
console.log("Functionize email =", fns.email("ABC@D.COM"));
`,
  },
];
