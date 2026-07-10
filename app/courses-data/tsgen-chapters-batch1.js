// =============================================================
// TypeScript 泛型专门教程 —— 第一批章节（泛型基础篇，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. tsgen-why   — 为什么需要泛型？从重复代码说起
//   2. tsgen-fn    — 泛型函数：语法与调用方式
//   3. tsgen-iface — 泛型接口：定义可复用的数据结构
//   4. tsgen-class — 泛型类：类型安全的容器与工厂
//   5. tsgen-alias — 泛型类型别名与组合
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（统一为 "泛型基础"）
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时，会排空事件循环
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：为什么需要泛型？从重复代码说起
  // =========================================================
  {
    id: "tsgen-why",
    icon: "🤔",
    group: "泛型基础",
    title: "为什么需要泛型？从重复代码说起",
    content: `## 一个让人头疼的现实：重复的函数定义

如果你写过一段时间的 TypeScript，大概率会遇到这样一种场景：你需要写一个函数，它的逻辑完全一样，只是处理的数据类型不同。最经典的例子就是 identity 函数——它接收一个参数，原样返回。

听起来再简单不过了对吧？但在没有泛型的时候，为了同时支持数字、字符串、布尔值，你不得不把同一段逻辑抄三遍：

\`\`\`ts
function identityNumber(x: number): number { return x; }
function identityString(x: string): string { return x; }
function identityBoolean(x: boolean): boolean { return x; }
\`\`\`

这三个函数的函数体完全相同，都是 return x，唯一的区别是类型注解不同。这种写法有两个明显的问题：一是代码冗余，改一处逻辑要改三处；二是类型不灵活，以后要支持 Date 类型又得再抄一遍。你的直觉可能会说：那就用一个 any 通吃所有类型好了！

## any 看似省事实则埋雷

很多人第一次接触泛型前，会用 any 来"偷懒"：

\`\`\`ts
function identity(x: any): any { return x; }
\`\`\`

确实，这一行代码能处理所有类型，写起来很爽。但 any 是 TypeScript 类型系统的"逃生舱"——它本质上等于关闭了类型检查。这会带来三个严重的隐患：

第一，丢失类型信息。你传入一个 number，拿回来的值在类型上变成了 any，编辑器再也不会提示它有哪些方法。你调用结果值的 toUpperCase 方法时编辑器不会报错，但运行时如果它真是数字就会直接崩。

第二，编译期不报错。any 跳过了静态检查，意味着原本能在写代码时就发现的类型错误，被推迟到运行时才暴露。这违背了 TypeScript"把错误拦截在编译期"的初衷。

第三，错误难以追踪。在大型项目里，一个 any 沿着调用链传播下去，会让一整片代码失去类型保护，出了 bug 很难定位到底是哪一环传错了类型。

## 泛型的核心思想：让类型也变成参数

我们需要的是一种机制：既能用一份代码处理多种类型，又不会丢掉类型信息。这就是泛型要做的事。

泛型的核心思想非常优雅——**把类型也当作参数来传递**。你熟悉的函数参数让代码逻辑可以复用（同一个 add 函数能算 1+2 也能算 3+4），泛型参数则让类型也可以复用（同一个 identity 函数能处理 number 也能处理 string）。

来看泛型版本：

\`\`\`ts
function identity<T>(x: T): T { return x; }
\`\`\`

这里的 T 叫做类型参数（type parameter），它是一个占位符。调用时你传入什么类型，T 就被替换成什么类型。调用时把 T 指定为 number，T 就是 number；把 T 指定为 string，T 就是 string。函数体一行没变，但它现在能安全地处理任意类型。

## 一个关键认知：泛型只在编译期起作用

很多初学者会误以为泛型会在运行时做些什么，其实不会。**泛型纯粹是编译期的类型约束，运行时会被完全擦除。** 编译后，带泛型的 identity 函数会变成普通的 function identity(x) { return x; }，和你写 any 版本的运行产物一模一样。

换句话说，泛型不改变运行时行为，它只是让你在写代码时多了一层类型保护。这层保护帮你：在编辑器里获得准确的智能提示、在编译时拦截类型不匹配的调用、让代码自带类型文档。这就是泛型的价值——零运行时成本，换来编译期的类型安全。

## 类比理解：两种参数的对照

把函数参数和泛型参数放在一起对照，能帮你建立直觉：

- **函数参数**（写在括号里的 value）：让函数的"逻辑"可以复用。同一个 add 函数，传入不同的值，得到不同的结果。
- **泛型参数**（写在尖括号里的 T）：让函数的"类型"可以复用。同一个 identity 函数，指定不同的类型，处理不同类型的数据。

两者一个是"值的参数化"，一个是"类型的参数化"，思想完全一致。理解了这一点，泛型就不再神秘。

本节代码会依次演示三种写法的对比，你可以运行感受一下它们运行结果完全相同，差别只在编译期的类型保护强度。`,
    code: `// ============================================================
// 第一章代码演示：为什么需要泛型 —— 三种写法对比
// ============================================================
// 我们用三种方式实现同一个 identity 函数（原样返回输入），
// 对比它们在"代码复用"和"类型安全"上的差异。

// ---- 方式一：为每种类型各写一个函数（重复代码）----
// 逻辑完全一样，只是类型注解不同，改一处要改多处，维护痛苦。
function identityNumber(x: number): number { return x; }
function identityString(x: string): string { return x; }
function identityBoolean(x: boolean): boolean { return x; }

console.log("========== 方式一：每个类型一个函数 ==========");
console.log("数字:", identityNumber(42));
console.log("字符串:", identityString("hello"));
console.log("布尔:", identityBoolean(true));

// ---- 方式二：用 any 通吃（丢失类型信息）----
// 写起来爽，但 any 关闭了类型检查，编辑器不再提示方法，
// 错误会被推迟到运行时才暴露。
function identityAny(x: any): any { return x; }

console.log("========== 方式二：用 any 通吃 ==========");
const n = identityAny(42);        // 返回类型是 any，丢失了 number 信息
const s = identityAny("hello");   // 返回类型也是 any
console.log("数字结果:", n, "字符串结果:", s);
// 危险：下面这行编译能过（因为 any 不检查），运行时会出错
// console.log(identityAny(42).toUpperCase());  // 数字没有 toUpperCase 方法

// ---- 方式三：用泛型（类型作为参数，安全且可复用）----
// T 是类型参数（占位符），调用时传入什么类型，T 就替换成什么类型。
function identity<T>(x: T): T { return x; }

console.log("========== 方式三：泛型版本 ==========");
// 显式指定类型参数：明确告诉 TS 这里的 T 是 number
const a = identity<number>(42);
// 让 TS 自动推断：不指定类型，TS 根据实参 "hi" 推断出 T 是 string
const b = identity("hi");
const c = identity(true);          // 推断 T 为 boolean

console.log("显式指定 number:", a);
console.log("自动推断 string:", b);
console.log("自动推断 boolean:", c);

// 证明运行时行为不变：泛型被擦除后和普通函数一样
console.log("========== 运行时行为对比 ==========");
console.log("泛型版本返回值:", identity(100), "类型:", typeof identity(100));
console.log("any 版本返回值:", identityAny(100), "类型:", typeof identityAny(100));
// 两者运行结果完全相同，泛型只在编译期提供类型保护，不改变运行时行为`,
  },

  // =========================================================
  // 第二章：泛型函数：语法与调用方式
  // =========================================================
  {
    id: "tsgen-fn",
    icon: "🔧",
    group: "泛型基础",
    title: "泛型函数：语法与调用方式",
    content: `## 泛型函数的完整语法

上一章我们见识了泛型的价值，这一章来正式学习泛型函数的语法。一个泛型函数的完整长相是这样的：

\`\`\`ts
function name<T>(arg: T): T {
  // 函数体
}
\`\`\`

把它拆开看：function 是关键字，name 是函数名，紧跟着的尖括号里声明类型参数（可以有多个），括号里用类型参数标注形参类型，冒号后的是返回值类型，最后是函数体。T 只是一个占位符，在函数内部代表"调用时才确定的某个类型"。

## 类型参数的命名约定

虽然类型参数可以随便起名（甚至叫 A、Foo 都行），但社区有一套约定俗成的命名规范，遵守它能让代码更易读：

- **T**（Type）：最通用的类型参数，表示"某个类型"
- **U、V**：当需要第二个、第三个类型参数时依次使用
- **K**（Key）：表示对象的键类型
- **V**（Value）：表示对象的值类型（和 K 搭配）
- **E**（Element）：表示集合中的元素类型
- **R**（Return）：表示函数返回值类型

这些单字母命名来自 Java、C# 等语言的泛型传统。当然，如果你的类型参数有明确含义，也可以写全名，比如声明一个表示"条目类型"的参数 TItem，也完全合法，可读性在某些场景下更好。

## 调用泛型函数的两种方式

调用泛型函数时有两种写法。第一种是显式指定类型参数：

\`\`\`ts
identity<string>("hello");  // 明确告诉 TS：T 是 string
\`\`\`

第二种是让 TS 自动推断（类型推断）：

\`\`\`ts
identity("hello");  // TS 根据实参 "hello" 推断出 T 是 string
\`\`\`

绝大多数情况下推荐用第二种——让 TS 推断，代码更简洁。但有些场景下你必须显式指定：当 TS 推断不出来（比如函数只接收一个回调、无法从实参直接推断返回类型），或者推断的结果不符合你的预期（比如你传入一个字面量 42 但希望 T 是更宽泛的 number）。这时显式指定类型参数就是救命的钥匙。

## 多个类型参数

一个函数可以有多个类型参数。比如做一个把两个值配成对的函数：

\`\`\`ts
function pair<K, V>(k: K, v: V): [K, V] {
  return [k, v];
}
\`\`\`

这里 K 和 V 是两个独立的类型参数，调用时把 K 指定为 string、V 指定为 number。多类型参数在 Map、字典这类"键值成对"的场景极为常见。

## 箭头函数的泛型写法

现代 TS 代码大量使用箭头函数，泛型箭头函数的写法是把类型参数放在参数列表前面：

\`\`\`ts
const identity = <T>(x: T): T => x;
\`\`\`

但有一个坑：在 .tsx 文件（React JSX）里，单独的尖括号泛型会被解析成 JSX 标签，导致歧义。解决办法是写成带逗号的形式，或者加上 extends unknown 约束，明确告诉编译器这是泛型不是 JSX。在普通 .ts 文件里没有这个问题，直接写即可。

## 一个容易混淆的点：类型参数不是变量

最后澄清一个初学者常有的误解：类型参数 T 不是运行时变量，你不能在函数体里读取它的值。T 只存在于编译期，运行时已经被擦除。你不能写 if (T === number) 这样的代码——这是没有意义的，因为运行时根本不存在 T。T 的作用仅仅是"在编译期约束参数和返回值的类型关系"。

本节代码会把这些用法都演示一遍，包括多个泛型函数、显式指定与推断的对比、多类型参数、箭头函数泛型。`,
    code: `// ============================================================
// 第二章代码演示：泛型函数的语法与调用方式
// ============================================================

// ---- 1. 最基本的泛型函数 ----
// <T> 声明类型参数，参数和返回值都用 T 标注
function identity<T>(x: T): T { return x; }

// ---- 2. 取数组第一个元素 ----
// T 表示"数组元素的类型"，返回这个类型
function first<T>(arr: T[]): T { return arr[0]; }

// ---- 3. 多个类型参数：把两个值配成对 ----
// K 和 V 是两个独立的类型参数
function pair<K, V>(k: K, v: V): [K, V] { return [k, v]; }

// ---- 4. 用类型参数构造数组 ----
function makeArray<T>(...items: T[]): T[] { return items; }

console.log("========== 1. 基本泛型函数 ==========");
// 显式指定类型参数：identity<number>(42)
console.log("显式指定:", identity<number>(42));
// 让 TS 自动推断：根据 "hi" 推断 T 为 string
console.log("自动推断:", identity("hi"));

console.log("========== 2. 取数组第一个元素 ==========");
console.log("数字数组:", first([10, 20, 30]));        // 推断 T 为 number
console.log("字符串数组:", first(["a", "b", "c"]));   // 推断 T 为 string

console.log("========== 3. 多个类型参数 ==========");
// 显式指定 K=string, V=number
const p1 = pair<string, number>("age", 18);
// 自动推断：K=string, V=boolean
const p2 = pair("active", true);
console.log("显式指定 pair:", p1[0], p1[1]);
console.log("自动推断 pair:", p2[0], p2[1]);

console.log("========== 4. 构造数组 ==========");
console.log("数字数组:", makeArray(1, 2, 3));          // 推断 T 为 number
console.log("字符串数组:", makeArray("x", "y"));       // 推断 T 为 string

// ---- 5. 箭头函数的泛型写法 ----
// .ts 文件里直接写 <T> 即可；.tsx 文件需写 <T,> 避免和 JSX 歧义
const identityArrow = <T>(x: T): T => x;
console.log("========== 5. 箭头函数泛型 ==========");
console.log("箭头函数:", identityArrow("arrow"));

// ---- 6. 何时必须显式指定类型参数 ----
// 演示：当字面量推断太窄时，显式指定更宽的类型
function wrap<T>(x: T): T[] { return [x]; }
// 不指定：T 被推断为字面量类型 42
const narrow = wrap(42);
// 显式指定：T 为 number，语义更宽更符合预期
const wide = wrap<number>(42);
console.log("========== 6. 显式指定类型参数 ==========");
console.log("推断结果:", narrow, "显式指定结果:", wide);

// ---- 7. 多类型参数实战：简易字典 ----
function makeDict<K extends string, V>(entries: [K, V][]): Map<K, V> {
  const m = new Map<K, V>();
  for (const [k, v] of entries) m.set(k, v);
  return m;
}
console.log("========== 7. 多类型参数实战 ==========");
const dict = makeDict([["a", 1], ["b", 2]]);
console.log("字典 a:", dict.get("a"), "字典 b:", dict.get("b"));`,
  },

  // =========================================================
  // 第三章：泛型接口：定义可复用的数据结构
  // =========================================================
  {
    id: "tsgen-iface",
    icon: "📋",
    group: "泛型基础",
    title: "泛型接口：定义可复用的数据结构",
    content: `## 从一个"装东西的盒子"说起

假设你要定义一个数据结构，它就是简单地"装一个值"。最直觉的写法是：

\`\`\`ts
interface NumberBox { value: number; }
\`\`\`

但这只能装 number。如果还要装 string、装 Date，你又得定义 StringBox、DateBox……这和上一章"为每种类型写一遍函数"是同一个问题。解决办法也一样——用泛型。泛型接口让接口本身变成"可复用的模板"：

\`\`\`ts
interface Box<T> { value: T; }
\`\`\`

Box 加上类型参数读作"Box of T"，表示"装着 T 类型值的盒子"。需要装数字就用 Box 指定为 number，需要装字符串就指定为 string。一个接口定义，覆盖所有类型。

## 泛型接口的基本语法

泛型接口的语法很直白：在接口名后面加尖括号声明类型参数，然后在接口内部用 T 当作一个类型来用。T 可以出现在属性类型、方法参数、方法返回值等任何需要类型的位置：

\`\`\`ts
interface Repository<T> {
  find(id: string): T;       // 方法返回值用 T
  save(item: T): void;       // 方法参数用 T
  list(): T[];               // T 也可以出现在数组里
}
\`\`\`

这个 Repository 描述了一个通用的"仓储"接口——能查找、保存、列出某种类型的对象。T 就是它管理的实体类型。

## 实现泛型接口

类可以用 implements 关键字实现泛型接口。实现时要把类型参数固定成具体类型：

\`\`\`ts
class MyBox implements Box<string> { value: string = ""; }
\`\`\`

这里 MyBox 实现的是装 string 的 Box，所以 value 必须是 string。如果你想让自己的类也保持泛型，可以让类本身也带类型参数（下一章讲泛型类时会详细展开）。

## 真实案例：你早就在用泛型接口

泛型接口不是理论玩具，TypeScript 标准库里到处都是。最常用的几个：

- **Array**：表示"由某种类型元素组成的数组"，指定为 number 就是数字数组
- **Promise**：表示"将来会产出某种类型值的异步操作"，指定为 string 就是会 resolve 一个字符串的 Promise
- **Map**：表示"键类型 K、值类型 V 的映射表"，键指定为 string、值指定为 User 就是用字符串键存 User 的字典

你每次写 const arr: number[] 其实等价于 Array 指定为 number，每次写 async function 返回 Promise 都在用泛型接口。掌握泛型接口后，你就能看懂这些标准类型的"形状"了。

## 多个类型参数

和泛型函数一样，泛型接口也能有多个类型参数：

\`\`\`ts
interface KeyValuePair<K, V> { key: K; value: V; }
\`\`\`

键指定为 string、值指定为 number 表示"键是 string、值是 number"的一对。多类型参数让接口能描述更丰富的数据关系。

## 泛型接口 vs 普通接口

什么时候该用泛型接口？一个简单的判断标准：**如果一个接口里的某些类型"会变"，就应该把它抽成类型参数**。比如 Box 的 value 类型会变、Repository 管理的实体类型会变、Map 的键值类型都会变——它们都该是泛型接口。反过来，如果一个接口的所有类型都固定不变（比如 User 接口的 name 永远是 string），就不需要泛型，普通接口足够。

本节代码会定义 Box、Repository、KeyValuePair 三种泛型接口，并实现一个 UserRepository 来演示实际用法，还会展示标准库 Array 和 Promise 的类型推断。`,
    code: `// ============================================================
// 第三章代码演示：泛型接口定义可复用的数据结构
// ============================================================

// ---- 1. 最简单的泛型接口：装一个值的盒子 ----
interface Box<T> { value: T; }

// 用 Box 描述不同类型的盒子
const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };

console.log("========== 1. Box<T> 装值盒子 ==========");
console.log("数字盒子:", numberBox.value);
console.log("字符串盒子:", stringBox.value);

// ---- 2. 带方法的泛型接口：通用仓储 ----
interface Repository<T> {
  find(id: string): T;       // 按 id 查找，返回实体
  save(item: T): void;       // 保存实体
  list(): T[];               // 列出所有实体
}

// 定义一个 User 实体类型
interface User { id: string; name: string; }

// 实现一个 UserRepository：用内存数组模拟数据库
class UserRepository implements Repository<User> {
  private store: User[] = [];            // 内部存储
  find(id: string): User {               // 实现 find
    const u = this.store.find(item => item.id === id);
    if (!u) throw new Error("用户不存在: " + id);
    return u;
  }
  save(item: User): void {               // 实现 save
    this.store.push(item);
  }
  list(): User[] {                       // 实现 list
    return this.store;
  }
}

console.log("========== 2. UserRepository 实现 ==========");
const userRepo = new UserRepository();
userRepo.save({ id: "u1", name: "张三" });
userRepo.save({ id: "u2", name: "李四" });
console.log("所有用户:", userRepo.list());
console.log("查找 u1:", userRepo.find("u1"));

// ---- 3. 多个类型参数：键值对 ----
interface KeyValuePair<K, V> { key: K; value: V; }

console.log("========== 3. 多类型参数 KeyValuePair ==========");
const kv1: KeyValuePair<string, number> = { key: "age", value: 28 };
const kv2: KeyValuePair<number, string> = { key: 1, value: "第一条" };
console.log("string->number:", kv1.key, "=>", kv1.value);
console.log("number->string:", kv2.key, "=>", kv2.value);

// ---- 4. 标准库里的泛型接口：Array<T> / Promise<T> ----
console.log("========== 4. 标准库泛型接口 ==========");
// Array<T>：T 是元素类型，TS 根据字面量自动推断
const nums: Array<number> = [1, 2, 3];
const names = ["张三", "李四"];          // 推断为 string[]
console.log("Array<number>:", nums);
console.log("推断的字符串数组:", names);

// Promise<T>：T 是 resolve 的值类型
function fetchName(): Promise<string> {
  return Promise.resolve("异步取到的名字");
}

// 用 then 消费这个 Promise，回调参数被推断为 string
fetchName().then((name) => {
  console.log("Promise<string> 结果:", name);
});`,
  },

  // =========================================================
  // 第四章：泛型类：类型安全的容器与工厂
  // =========================================================
  {
    id: "tsgen-class",
    icon: "🏫",
    group: "泛型基础",
    title: "泛型类：类型安全的容器与工厂",
    content: `## 泛型类：给整个类装上类型参数

前面学的泛型函数让一个函数可复用，泛型接口让一个数据结构契约可复用。泛型类则更进一步——给一整个类装上类型参数，让类的所有实例属性和方法都享受类型保护。最典型的场景是"容器类"：栈、队列、缓存、事件总线等，它们存储的元素类型在不同业务里不同，但操作逻辑完全一致。

## 泛型类的语法

泛型类的语法是在类名后面加尖括号声明类型参数：

\`\`\`ts
class Stack<T> {
  items: T[] = [];         // 实例属性用 T
  push(x: T): void { /*...*/ }  // 方法参数用 T
  pop(): T { /*...*/ }          // 方法返回值用 T
}
\`\`\`

类型参数 T 作用于整个类的实例属性和方法。一旦你用 new Stack 指定 T 为 number 创建实例，这个实例里所有和 T 相关的位置都会被替换成 number——push 只能传 number，pop 返回 number，items 是 number 数组。换一个实例指定 T 为 string，它就变成字符串栈，互不干扰。

## 类型参数只作用于实例，不作用于静态成员

这是一个重要的规则：**类的静态成员（static）不能使用类型参数 T**。原因是静态成员属于"类"本身，不属于某个实例；而类型参数 T 是在实例化时才确定的。一个类可能同时存在两种不同类型的实例，但 static 成员只有一份，它根本不知道该用哪个 T，所以 TS 直接禁止这种写法：

\`\`\`ts
class Bad<T> {
  static defaultValue: T;  // 错误：静态成员不能引用类型参数
}
\`\`\`

静态成员应该使用具体类型，比如 static defaultValue: number。如果你确实需要"和实例类型相关的默认值"，应该用实例方法或工厂函数，而不是静态属性。

## 实例化：显式指定 vs 推断

和泛型函数一样，实例化泛型类时也有两种方式：

\`\`\`ts
new Stack<number>();   // 显式指定 T 为 number
new Stack();           // 不指定，TS 往往推断为 unknown
\`\`\`

实际开发中，泛型类通常推荐显式指定类型参数，因为类的实例化往往不携带足够的信息让 TS 准确推断 T（不像函数有实参可以推断）。比如直接 new Stack() 时 TS 拿不到任何线索，T 会被推断成 unknown，后续 push 就受限了。

## 泛型类实现泛型接口

泛型类可以实现泛型接口，保持自身的类型参数：

\`\`\`ts
class MyStack<T> implements IStack<T> { /*...*/ }
\`\`\`

这样 MyStack 既是泛型类又满足 IStack 契约。这是工程上很常见的组合——先用接口定义"能做什么"的契约，再用类实现"怎么做"的细节，两者都保持泛型。

## 真实案例

泛型类在标准库和框架里随处可见：

- **Array**：本质上就是一个泛型类，你用的数组方法 push、pop、map 都是泛型类的实例方法。
- **EventEmitter**：事件总线，类型参数通常是事件名到事件参数的映射，让 on 和 emit 的类型对得上。
- **Promise**：异步容器，类型参数是 resolve 的值类型。

本节代码会实现一个完整的泛型 Stack（带 push/pop/peek/size）、一个泛型 Queue，以及一个简单的泛型 Repository 类，并演示静态成员的坑。`,
    code: `// ============================================================
// 第四章代码演示：泛型类 —— 类型安全的容器与工厂
// ============================================================

// ---- 1. 泛型栈 Stack<T> ----
// T 是元素类型，作用于整个类的所有实例属性和方法
class Stack<T> {
  private items: T[] = [];        // 内部用数组存储，类型是 T[]
  push(x: T): void {              // 入栈：参数必须是 T
    this.items.push(x);
  }
  pop(): T {                      // 出栈：返回 T
    const last = this.items.pop();
    if (last === undefined) throw new Error("栈为空");
    return last;
  }
  peek(): T {                     // 查看栈顶（不移除）
    const last = this.items[this.items.length - 1];
    if (last === undefined) throw new Error("栈为空");
    return last;
  }
  size(): number {                // 栈大小
    return this.items.length;
  }
}

console.log("========== 1. 泛型栈 Stack<number> ==========");
const numStack = new Stack<number>();   // 显式指定 T 为 number
numStack.push(10);
numStack.push(20);
numStack.push(30);
console.log("栈大小:", numStack.size());
console.log("栈顶元素:", numStack.peek());
console.log("出栈:", numStack.pop(), "剩余大小:", numStack.size());

console.log("========== 1b. 泛型栈 Stack<string> ==========");
const strStack = new Stack<string>();   // 同一个类，换一种类型
strStack.push("甲");
strStack.push("乙");
console.log("出栈:", strStack.pop());

// ---- 2. 泛型队列 Queue<T> ----
class Queue<T> {
  private items: T[] = [];
  enqueue(x: T): void { this.items.push(x); }   // 入队
  dequeue(): T {                                  // 出队（先进先出）
    const first = this.items.shift();
    if (first === undefined) throw new Error("队列为空");
    return first;
  }
  size(): number { return this.items.length; }
}

console.log("========== 2. 泛型队列 Queue<string> ==========");
const q = new Queue<string>();
q.enqueue("第一个");
q.enqueue("第二个");
q.enqueue("第三个");
console.log("出队:", q.dequeue(), "剩余:", q.size());
console.log("出队:", q.dequeue());

// ---- 3. 泛型 Repository 类（实现泛型接口）----
interface IRepository<T> {
  save(item: T): void;
  findBy(predicate: (item: T) => boolean): T | undefined;
  list(): T[];
}

class Repository<T> implements IRepository<T> {
  private store: T[] = [];
  save(item: T): void { this.store.push(item); }
  findBy(predicate: (item: T) => boolean): T | undefined {
    return this.store.find(predicate);
  }
  list(): T[] { return this.store; }
}

console.log("========== 3. 泛型 Repository 类 ==========");
interface Product { id: string; name: string; price: number; }
const productRepo = new Repository<Product>();
productRepo.save({ id: "p1", name: "鼠标", price: 99 });
productRepo.save({ id: "p2", name: "键盘", price: 199 });
console.log("所有商品:", productRepo.list());
console.log("查找价格为 199 的:", productRepo.findBy(p => p.price === 199));

// ---- 4. 静态成员不能引用类型参数 T ----
// 下面这行如果取消注释会报错（这里只演示说明，注释掉保证可运行）：
// class Bad<T> { static defaultValue: T; }  // 错误：静态成员不能使用类型参数
console.log("========== 4. 静态成员限制说明 ==========");
console.log("静态成员属于类本身，不属于实例，因此不能引用实例类型参数 T");
console.log("静态成员应使用具体类型，如 static defaultValue: number = 0");

// 正确做法：静态成员用具体类型
class Config {
  static defaultName: string = "默认名称";
  static maxSize: number = 100;
}
console.log("静态默认名:", Config.defaultName, "静态最大值:", Config.maxSize);`,
  },

  // =========================================================
  // 第五章：泛型类型别名与组合
  // =========================================================
  {
    id: "tsgen-alias",
    icon: "🏷️",
    group: "泛型基础",
    title: "泛型类型别名与组合",
    content: `## 类型别名：另一种定义泛型的方式

前面我们用 interface 定义泛型接口，TypeScript 还提供了另一种方式——type 类型别名。它的泛型写法是在别名后加尖括号声明类型参数：

\`\`\`ts
type Box<T> = { value: T };
\`\`\`

这和泛型接口的 Box 写法看起来几乎一样，确实在很多场景下两者可以互换。但类型别名有一些 interface 做不到的能力，使它在某些场景下更灵活。

## 类型别名比接口更灵活的地方

类型别名可以表示 interface 表示不了的东西：

第一，**联合类型**。type Result 等于 T 或 null 表示"要么是 T，要么是 null"，interface 没法直接表达"或"的关系。

第二，**元组类型**。type Pair 等于两个 T 组成的元组，interface 做不到。

第三，**基本类型别名**。type ID 等于 string 给基本类型起个有意义的名字，interface 不能给基本类型起别名。

第四，**递归引用自身**。类型别名可以引用自己，构造树形等递归结构（interface 也能递归，但类型别名写起来更直接）。

## 泛型类型别名的常见模式

实际工程中，有几个泛型类型别名模式反复出现，几乎成了"惯用法"：

\`\`\`ts
// Result 模式：统一表示成功或失败的结果
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Callback 模式：Node 风格的回调签名
type Callback<T> = (err: Error | null, data: T) => void;

// AsyncResult 模式：异步结果
type AsyncResult<T> = Promise<T | Error>;
\`\`\`

注意 Result 的第二个类型参数 E = Error 用了默认类型参数（不传 E 时默认是 Error），这种"带默认值的泛型"在工具类型里极为常见。Result 模式用联合类型加上字面量 ok 做出"可辨识联合"，是函数式错误处理的经典套路——调用方必须同时处理成功和失败两种情况，类型系统会强制你覆盖。

## 递归类型：树形结构

类型别名可以引用自身，构造递归结构。比如一棵树：

\`\`\`ts
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];   // 引用自身
};
\`\`\`

TreeNode 的 children 是 TreeNode 数组，于是可以无限嵌套下去，正好对应树形数据。这种递归类型在解析配置、AST、菜单等场景非常实用。你只要定义一次，就能描述任意深度的树。

## 类型别名与接口怎么选

简单建议：描述对象的"形状"且需要被类 implements 时，用 interface（interface 更贴近面向对象、支持声明合并）；需要联合、元组、基本类型别名、递归组合时，用 type。现代 TS 项目里 type 用得越来越多，因为它表达力更强，而且能把各种类型像积木一样组合起来。

一个实用的判断技巧：如果你写下这个类型时脑海里想的是"它是一个什么东西"（is-a，对象形状），用 interface；如果你脑海里想的是"它是这样几个类型的组合"（组合关系），用 type。当然两者大多数时候都能用，不必纠结，团队统一风格即可。

本节代码会定义 Result、Callback、TreeNode 三种类型别名并演示它们的用法，还会展示类型别名独有的联合、元组、基本类型别名能力。`,
    code: `// ============================================================
// 第五章代码演示：泛型类型别名与组合
// ============================================================

// ---- 1. 最基本的泛型类型别名 ----
// 和 interface Box<T> 等价，但写法更简洁
type Box<T> = { value: T };

console.log("========== 1. 泛型类型别名 Box<T> ==========");
const numBox: Box<number> = { value: 42 };
const strBox: Box<string> = { value: "hello" };
console.log("数字盒子:", numBox.value);
console.log("字符串盒子:", strBox.value);

// ---- 2. Result 模式：统一表示成功或失败 ----
// 用联合类型 + 字面量 ok 做出"可辨识联合"
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 构造成功结果
function ok<T>(value: T): Result<T> {
  return { ok: true, value: value };
}
// 构造失败结果
function fail<E>(error: E): Result<never, E> {
  return { ok: false, error: error };
}

console.log("========== 2. Result<T, E> 模式 ==========");
const r1: Result<number> = ok(100);
const r2: Result<number, string> = fail("数字解析失败");
// 处理结果：必须同时覆盖成功和失败两种情况
function handle(r: Result<number, string>): string {
  if (r.ok) {
    return "成功，值是 " + r.value;   // 这里 r.value 是 number
  } else {
    return "失败，原因 " + r.error;   // 这里 r.error 是 string
  }
}
console.log(handle(r1));
console.log(handle(r2));

// ---- 3. Callback 模式：Node 风格回调签名 ----
type Callback<T> = (err: Error | null, data: T) => void;

// 模拟一个读取函数，用 Callback<T> 作为回调类型
function readData<T>(fakeData: T, cb: Callback<T>): void {
  // 真实场景这里会有 IO，这里直接同步调用回调演示类型
  cb(null, fakeData);
}

console.log("========== 3. Callback<T> 模式 ==========");
readData("这是一条数据", (err, data) => {
  if (err) {
    console.log("出错了:", err.message);
  } else {
    console.log("读到数据:", data);   // data 被推断为 string
  }
});

// ---- 4. 递归类型：树形结构 ----
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];           // 引用自身，可无限嵌套
};

// 构造一棵小树
const tree: TreeNode<string> = {
  value: "根",
  children: [
    { value: "子1", children: [] },
    { value: "子2", children: [
      { value: "孙1", children: [] },
    ] },
  ],
};

// 递归遍历树并打印
function printTree<T>(node: TreeNode<T>, depth: number): void {
  const indent = "--".repeat(depth);
  console.log(indent + " " + node.value);
  for (const child of node.children) {
    printTree(child, depth + 1);
  }
}

console.log("========== 4. 递归类型 TreeNode<T> ==========");
printTree(tree, 0);

// ---- 5. 类型别名 vs 接口：独有能力对比 ----
// 类型别名能表示联合、元组、基本类型别名，接口不能
type StringOrNumber = string | number;   // 联合类型
type Pair<T> = [T, T];                    // 元组类型
type ID = string;                         // 基本类型别名

console.log("========== 5. 类型别名独有能力 ==========");
const id: ID = "user-001";
const pair: Pair<number> = [1, 2];
const mix: StringOrNumber = Math.random() > 0.5 ? "字符串" : 42;
console.log("ID:", id, "元组:", pair, "联合值:", mix);`,
  },
];
