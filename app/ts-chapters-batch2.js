// =============================================================
// TypeScript 交互式教程 —— 第二批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-functions          — 函数 (Functions)
//   2. ts-classes            — 类 (Class)
//   3. ts-generics           — 泛型 (Generics)
//   4. ts-union-intersection — 联合与交叉类型
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
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
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
//   - isolatedModules 下 const enum 当普通枚举处理，可用
//   - 沙箱上下文自带 Math/JSON/Date/Map/Set/Array/Object 等内置对象
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：函数 (Functions)
  // =========================================================
  {
    id: "ts-functions",
    title: "函数",
    icon: "🔢",
    group: "核心",
    content: `## 函数 (Functions)

函数是 JavaScript 与 TypeScript 中最重要的代码组织单元。几乎所有的逻辑都被封装在函数里：事件处理、数据转换、异步操作、组件渲染……可以说**掌握了函数，就掌握了写出可维护代码的关键**。TypeScript 在 JavaScript 函数的基础上增加了**完整的类型系统**，让函数的输入（参数）和输出（返回值）都能被精确约束，从而在编写阶段就能发现调用错误。

本章将从最基础的函数类型注解讲起，逐步深入到函数重载、this 类型、调用签名、构造签名等高级主题，并详细对比各种定义方式的差异与陷阱。学完本章，你将能写出类型安全、表达力强、可维护性高的函数。

### 为什么函数需要类型

在纯 JavaScript 中，函数的参数和返回值没有任何约束，调用者可以传入任意类型，函数内部也可以返回任意值。这种"自由"在小型脚本里看似方便，但在真实工程中会引发大量问题：

\`\`\`js
// 纯 JS：没有任何约束
function calculateTotal(price, quantity, discount) {
  return price * quantity - discount;
}
// 下面这些调用在 JS 中全部合法，但结果可能完全错误
calculateTotal(100, 2, 10);        // 190 ✅ 正确
calculateTotal("100", 2, 10);      // "10000" - 10 = NaN ❌ 静默错误
calculateTotal(100, "2", 10);      // "1002" - 10 = 992 ❌ 字符串拼接
calculateTotal(100, 2);            // 200 - undefined = NaN ❌
\`\`\`

TypeScript 通过类型注解把这些错误**提前到编写阶段**：

\`\`\`ts
function calculateTotal(price: number, quantity: number, discount: number = 0): number {
  return price * quantity - discount;
}
calculateTotal(100, 2, 10);   // ✅
calculateTotal("100", 2, 10); // ❌ 编辑器标红：string 不能赋给 number
\`\`\`

### 函数类型注解

函数类型注解包含两部分：**参数类型**和**返回值类型**。

#### 参数类型注解

在参数名后加 \`: 类型\` 即可约束该参数的类型：

\`\`\`ts
function greet(name: string): void {
  console.log("你好，" + name);
}
greet("张三");   // ✅
greet(123);      // ❌ 类型错误：number 不能赋给 string
\`\`\`

#### 返回值类型注解

在参数列表的括号后加 \`: 类型\` 约束返回值：

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;   // 必须返回 number
}
\`\`\`

如果函数没有返回值，返回类型标注为 \`void\`。多数情况下返回值类型可以省略，让编译器自动推断，但**公共 API 函数建议显式标注返回值类型**，这样修改实现时编译器能帮你检查返回类型是否变化。

| 注解位置 | 语法示例 | 作用 |
| --- | --- | --- |
| 参数 | \`name: string\` | 约束调用时传入的实参类型 |
| 返回值 | \`)]: number\` | 约束函数返回值的类型 |
| 无返回值 | \`)]: void\` | 表示函数不返回有意义的数据 |
| 永不返回 | \`)]: never\` | 表示函数总是抛异常或无限循环 |

### 函数声明的三种方式

TypeScript 支持三种定义函数的方式，它们的类型注解语法略有不同。

#### 1. function 声明（函数声明语句）

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`

函数声明会被**提升（hoisting）**到作用域顶部，因此可以在声明之前调用（不推荐，但合法）。

#### 2. 函数表达式

\`\`\`ts
const add = function (a: number, b: number): number {
  return a + b;
};
\`\`\`

函数表达式不会被提升，必须先定义后使用。注意结尾要加分号。

#### 3. 箭头函数

\`\`\`ts
const add = (a: number, b: number): number => a + b;
\`\`\`

箭头函数是 ES6 引入的简洁写法，特别适合短小的回调和函数式编程。

#### 三种方式的对比

| 特性 | function 声明 | 函数表达式 | 箭头函数 |
| --- | --- | --- | --- |
| **提升** | ✅ 提升 | ❌ 不提升 | ❌ 不提升 |
| **this 绑定** | 动态（调用时确定） | 动态 | 词法（定义时确定） |
| **arguments 对象** | ✅ 有 | ✅ 有 | ❌ 没有 |
| **作为构造函数** | ✅ 可 new | ✅ 可 new | ❌ 不可 new |
| **prototype 属性** | ✅ 有 | ✅ 有 | ❌ 没有 |
| **语法简洁度** | 一般 | 一般 | 最简洁 |
| **适合场景** | 顶层函数 | 回调/动态 this | 回调/词法 this |

### 箭头函数 vs 普通函数（重要陷阱）

这是 JavaScript/TypeScript 面试的高频考点，也是实战中最容易踩的坑：

1. **this 绑定不同**：普通函数的 \`this\` 在调用时动态确定（谁调用就指向谁）；箭头函数**没有自己的 this**，它继承定义时外层的 \`this\`。
2. **不能用作构造函数**：箭头函数不能用 \`new\` 调用，也没有 \`prototype\`。
3. **没有 arguments**：箭头函数内访问 \`arguments\` 会取到外层函数的 \`arguments\`，要用剩余参数 \`...args\` 代替。

\`\`\`ts
const obj = {
  value: 42,
  // 普通方法：this 动态绑定
  regular: function () { return this.value; },
  // 箭头方法：this 继承外层（这里是模块作用域），不指向 obj！
  arrow: () => this,  // ⚠️ 这里的 this 不指向 obj
};
\`\`\`

**陷阱**：在对象字面量里用箭头函数定义方法，\`this\` 不会指向对象本身，而是指向定义时的外层作用域。这是非常常见的 bug 来源。**需要 \`this\` 指向对象时，用普通方法或方法简写，不要用箭头函数**。

### 可选参数 \`?\`

参数名后加 \`?\` 表示该参数可省略。**可选参数必须放在必填参数之后**：

\`\`\`ts
function greet(name: string, greeting?: string): string {
  return (greeting ?? "你好") + "，" + name;
}
greet("张三");              // "你好，张三"
greet("张三", "早上好");    // "早上好，张三"
\`\`\`

### 默认参数

直接在参数后 \`= 默认值\`，调用时不传则用默认值。**默认参数本质上是"可选的"**，类型上自动变成 \`类型 | undefined\`：

\`\`\`ts
function greet(name: string, greeting: string = "你好"): string {
  return greeting + "，" + name;
}
greet("张三");              // "你好，张三"
\`\`\`

默认参数和可选参数都可以省略，但默认参数**不需要在函数体内做 undefined 判断**，更简洁。推荐：能确定默认值就用默认参数。

### 剩余参数 \`...args\`

当参数个数不确定时，用 \`...参数名: 类型[]\` 收集剩余实参成一个数组：

\`\`\`ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3);       // 6
sum(1, 2, 3, 4, 5); // 15
\`\`\`

剩余参数必须是参数列表的**最后一个**。它替代了 \`arguments\` 对象，且带类型，更安全。

#### 参数种类对照表

| 参数种类 | 语法 | 是否必填 | 顺序要求 |
| --- | --- | --- | --- |
| 必填参数 | \`a: number\` | 必填 | 在前 |
| 可选参数 | \`a?: number\` | 可省略 | 在必填之后 |
| 默认参数 | \`a: number = 1\` | 可省略 | 在必填之后 |
| 剩余参数 | \`...a: number[]\` | 可省略 | 必须最后 |

### 参数顺序规则（陷阱）

TypeScript 要求参数顺序为：**必填参数 → 可选/默认参数 → 剩余参数**。把可选参数放在必填参数前面会报错：

\`\`\`ts
// ❌ 错误：可选参数不能在必填参数前
function bad(opt?: string, req: number) {}
// ✅ 正确
function good(req: number, opt?: string) {}
\`\`\`

### 函数重载（Overload）

在实际开发中，同一个函数名常需要根据不同参数类型返回不同类型的结果。**函数重载**让你为同一个函数提供多个**类型签名**，再加一个**统一实现**。

\`\`\`ts
// 重载签名 1：传数字返回格式化字符串
function format(value: number): string;
// 重载签名 2：传字符串返回大写字符串
function format(value: string): string;
// 实现签名：对外不可见，只用于内部实现
function format(value: number | string): string {
  if (typeof value === "number") {
    return "数字: " + value.toFixed(2);
  }
  return "字符串: " + value.toUpperCase();
}

format(3.14);     // 调用签名 1，返回 "数字: 3.14"
format("hello");  // 调用签名 2，返回 "字符串: HELLO"
\`\`\`

#### 重载的关键规则

1. **重载签名在前，实现签名在最后**，顺序不能颠倒。
2. **实现签名的参数类型必须兼容所有重载签名**（通常是联合类型）。
3. **实现签名对外部不可见**，调用方只能看到重载签名。
4. 运行时只有实现签名对应的代码，重载签名在编译后被擦除。

**陷阱**：重载签名之间不能有冲突（如两个签名接受同样的参数但返回不同类型）。重载的解析是**从上到下**匹配第一个符合的签名。

### this 类型

TypeScript 允许在函数参数列表最前面加一个特殊的 \`this\` 参数，用来**声明该函数被调用时 this 必须是什么类型**。这个 \`this\` 参数是**纯编译期的**，运行时不会真的存在，也不会被当作普通参数。

\`\`\`ts
interface Box {
  value: number;
  // this: Box 表示此方法必须通过 Box 实例调用
  getValue(this: Box): number;
}
\`\`\`

\`this\` 类型主要用于两个场景：
1. **防止 this 丢失**：当方法被"裸调用"（取出后直接调用）时，编译器会报错提醒。
2. **描述回调中 this 的绑定**：例如事件处理函数的 this。

\`\`\`ts
class Counter {
  count = 0;
  // this: Counter 注解
  increment(this: Counter): void {
    this.count++;
  }
}
const c = new Counter();
const detached = c.increment;
detached(); // ❌ 编译器报错：this 不是 Counter
\`\`\`

**陷阱**：\`this\` 类型只在编译期检查，运行时 this 仍可能丢失。要彻底解决，配合 \`bind\` 或箭头函数。

### 函数类型字面量

可以用 \`type\` 或 \`interface\` 给函数类型起名字，语法是 \`参数 => 返回值\`：

\`\`\`ts
// 用 type
type BinaryOp = (a: number, b: number) => number;
// 用 interface 的调用签名
interface BinaryOp2 {
  (a: number, b: number): number;
}

const add: BinaryOp = (a, b) => a + b;
const mul: BinaryOp2 = (a, b) => a * b;
\`\`\`

函数类型字面量常用于：回调参数类型、高阶函数类型、依赖注入。

### 调用签名（Call Signature）

普通的函数类型 \`(...)=>...\` 只能描述"可被调用"。如果一个对象**既是函数又有额外属性**，需要用**调用签名**。调用签名写在 \`interface\` 或 \`type\` 里，形如 \`(参数): 返回值\`，后面还能加其他属性：

\`\`\`ts
interface Counter {
  (start: number): string;  // 调用签名：可像函数一样调用
  interval: number;         // 额外属性
  reset(): void;            // 额外方法
}

function createCounter(): Counter {
  let current = 0;
  function counter(start: number): string {
    current = start;
    return "计数器设置为 " + start;
  }
  counter.interval = 1000;   // 给函数挂属性
  counter.reset = () => { current = 0; };
  return counter as Counter; // 断言为 Counter 类型
}

const c = createCounter();
c(10);        // 调用签名
c.interval;   // 访问属性
c.reset();    // 调用方法
\`\`\`

jQuery 的 \`$(...)\` 就是经典的"既是函数又有方法"的对象，正是用调用签名描述的。

### 构造签名（Construct Signature）

如果一个类型描述的是"可被 \`new\` 调用的构造函数"，用**构造签名**，语法是 \`new (参数): 实例类型\`：

\`\`\`ts
interface ClockConstructor {
  new (hour: number, minute: number): Clock;
}
interface Clock {
  getTime(): string;
}

class DigitalClock implements Clock {
  constructor(public h: number, public m: number) {}
  getTime() {
    return this.h + ":" + (this.m < 10 ? "0" + this.m : this.m);
  }
}

// 把构造函数赋值给构造签名类型的变量
const ClockFactory: ClockConstructor = DigitalClock;
const clock = new ClockFactory(12, 5);  // 用 new 调用
clock.getTime(); // "12:05"
\`\`\`

构造签名常用于**工厂模式**：把"构造哪种类"作为参数传入工厂函数。

### 高阶函数

接受函数作为参数、或返回函数的函数叫**高阶函数**。函数类型字面量让高阶函数的类型非常清晰：

\`\`\`ts
// 接受函数，返回函数
function compose<A, B, C>(f: (x: A) => B, g: (x: B) => C): (x: A) => C {
  return (x) => g(f(x));
}
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const addThenDouble = compose(addOne, double);
addThenDouble(3); // double(addOne(3)) = double(4) = 8
\`\`\`

数组方法 \`map\`、\`filter\`、\`reduce\` 都是高阶函数，它们的类型签名也用函数类型字面量描述。

### 函数相关陷阱总结

1. **箭头函数 this 陷阱**：对象方法别用箭头函数，this 不指向对象。
2. **可选参数顺序**：可选/默认参数必须在必填参数之后。
3. **重载实现签名对外不可见**：调用方看不到实现签名的类型。
4. **this 类型只防编译期**：运行时仍需 bind 或箭头函数保住 this。
5. **arguments 在箭头函数中不可用**：用剩余参数代替。
6. **void 返回类型不强制无 return**：可以 return 一个值，但类型仍是 void（设计如此，用于回调灵活性）。
7. **函数类型兼容性是协变的参数检查（双向协变）**：严格模式下参数是逆变的，但默认是双变的，可能导致一些不安全赋值。

### 本节代码演示

下面这段代码综合演示了：函数类型注解、三种声明方式、可选/默认/剩余参数、函数重载、this 类型与 this 丢失修复、函数类型字面量、调用签名、构造签名、高阶函数。每段都有详细中文注释，可直接运行查看输出。`,
    code: `// ============================================================
// 第一章代码演示：TypeScript 函数全景
// ============================================================

// ---- 1. 函数类型注解：参数类型 + 返回值类型 ----
console.log("========== 1. 函数类型注解 ==========");

// function 声明：参数 a、b 标注 number，返回值标注 number
function add(a: number, b: number): number {
  return a + b;
}
// void 表示没有有意义的返回值
function logMsg(msg: string): void {
  console.log("  [log]", msg);
}

console.log("add(3, 5) =", add(3, 5));
logMsg("void 函数不返回数据");

// ---- 2. 三种声明方式 ----
console.log("\\n========== 2. 三种声明方式 ==========");

// 方式一：function 声明（会被提升）
function declAdd(a: number, b: number): number {
  return a + b;
}
// 方式二：函数表达式（不会提升）
const exprAdd = function (a: number, b: number): number {
  return a + b;
};
// 方式三：箭头函数（最简洁，词法 this）
const arrowAdd = (a: number, b: number): number => a + b;

console.log("function 声明:", declAdd(10, 20));
console.log("函数表达式:", exprAdd(10, 20));
console.log("箭头函数:", arrowAdd(10, 20));

// ---- 3. 可选参数 / 默认参数 / 剩余参数 ----
console.log("\\n========== 3. 参数种类 ==========");

// 可选参数 ?：greeting 可省略
function greet(name: string, greeting?: string): string {
  // greeting 可能是 undefined，用 ?? 提供默认值
  return (greeting ?? "你好") + "，" + name;
}
console.log("可选参数省略:", greet("张三"));
console.log("可选参数提供:", greet("李四", "早上好"));

// 默认参数 =：不传时用默认值，无需在函数体内判空
function greetDefault(name: string, greeting: string = "你好"): string {
  return greeting + "，" + name;
}
console.log("默认参数省略:", greetDefault("王五"));
console.log("默认参数覆盖:", greetDefault("赵六", "晚上好"));

// 剩余参数 ...nums：收集剩余实参成数组
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}
console.log("剩余参数 sum(1,2,3):", sum(1, 2, 3));
console.log("剩余参数 sum(1..5):", sum(1, 2, 3, 4, 5));

// ---- 4. 函数重载 overload ----
console.log("\\n========== 4. 函数重载 ==========");

// 重载签名 1：传 number
function format(value: number): string;
// 重载签名 2：传 string
function format(value: string): string;
// 实现签名：参数必须是所有重载的联合类型
function format(value: number | string): string {
  if (typeof value === "number") {
    // 这里 value 被缩小为 number
    return "数字: " + value.toFixed(2);
  }
  // 这里 value 被缩小为 string
  return "字符串: " + value.toUpperCase();
}
console.log("重载 format(3.14159):", format(3.14159));
console.log("重载 format('hello'):", format("hello"));

// 重载示例 2：根据参数个数返回不同类型
function pick(arr: string[]): string;
function pick(arr: string[], index: number): string | undefined;
function pick(arr: string[], index?: number): string | undefined {
  if (index === undefined) {
    return arr[arr.length - 1]; // 不传 index 取最后一个
  }
  return arr[index]; // 传 index 取指定位置
}
console.log("pick(['a','b','c']):", pick(["a", "b", "c"]));
console.log("pick(['a','b','c'], 0):", pick(["a", "b", "c"], 0));

// ---- 5. 箭头函数 vs 普通函数：this 绑定 ----
console.log("\\n========== 5. 箭头函数 vs 普通函数 this ==========");

const counter = {
  count: 0,
  // 普通方法：this 动态绑定到调用者
  incrementRegular: function (this: typeof counter): void {
    this.count++;
  },
  // 注意：对象字面量里的箭头函数 this 不指向对象本身（陷阱！）
  // 这里仅演示，不推荐在对象方法用箭头函数
};
counter.incrementRegular();
counter.incrementRegular();
console.log("普通方法调用两次后 count:", counter.count); // 2

// 经典陷阱：把方法取出来"裸调用"，this 丢失
const detached = counter.incrementRegular;
console.log("把方法取出后裸调用，演示 this 丢失:");
try {
  detached(); // this 不再指向 counter，可能抛错或修改错误对象
  console.log("  裸调用未抛错（this 被绑到全局/undefined，行为不确定）");
} catch (e) {
  console.log("  裸调用抛错（this 丢失）:", e.message);
}

// 修复方案 1：用 bind 显式绑定 this
const bound = counter.incrementRegular.bind(counter);
bound();
console.log("bind 绑定后 count:", counter.count); // 3

// 修复方案 2：用箭头函数包装（捕获调用时的 counter）
const wrapped = () => counter.incrementRegular();
wrapped();
console.log("箭头包装后 count:", counter.count); // 4

// ---- 6. 函数类型字面量 ----
console.log("\\n========== 6. 函数类型字面量 ==========");

// 用 type 定义函数类型
type BinaryOp = (a: number, b: number) => number;
// 用 interface 调用签名定义函数类型
interface BinaryOp2 {
  (a: number, b: number): number;
}

const mul: BinaryOp = (a, b) => a * b;
const sub: BinaryOp2 = (a, b) => a - b;
console.log("BinaryOp mul(6, 7):", mul(6, 7));
console.log("BinaryOp2 sub(10, 3):", sub(10, 3));

// 函数类型作为参数类型（回调）
function apply(op: BinaryOp, x: number, y: number): number {
  return op(x, y);
}
console.log("apply(mul, 4, 5):", apply(mul, 4, 5));
console.log("apply(sub, 20, 8):", apply(sub, 20, 8));

// ---- 7. 调用签名 call signature ----
console.log("\\n========== 7. 调用签名 ==========");

// 既是函数又带额外属性的对象类型
interface Counter {
  (start: number): string; // 调用签名：可像函数一样调用
  interval: number;        // 额外属性
  reset(): void;           // 额外方法
  current(): number;       // 额外方法
}

function createCounter(): Counter {
  let count = 0;
  // 定义一个函数
  function counter(start: number): string {
    count = start;
    return "计数器设置为 " + start;
  }
  // 给函数对象挂载额外属性和方法（函数也是对象）
  counter.interval = 1000;
  counter.reset = function () {
    count = 0;
  };
  counter.current = function () {
    return count;
  };
  // 断言为 Counter 类型（函数 + 属性）
  return counter as Counter;
}

const c = createCounter();
console.log("调用签名 c(100):", c(100));   // 像函数一样调用
console.log("额外属性 c.interval:", c.interval);
console.log("额外方法 c.current():", c.current());
c.reset();
console.log("reset 后 c.current():", c.current());

// ---- 8. 构造签名 construct signature ----
console.log("\\n========== 8. 构造签名 ==========");

// 构造签名：描述可被 new 调用的构造函数
interface ClockConstructor {
  new (hour: number, minute: number): Clock;
}
interface Clock {
  getTime(): string;
}

class DigitalClock implements Clock {
  constructor(public h: number, public m: number) {}
  getTime(): string {
    // 分钟补零
    const mm = this.m < 10 ? "0" + this.m : String(this.m);
    return this.h + ":" + mm;
  }
}
class AnalogClock implements Clock {
  constructor(public h: number, public m: number) {}
  getTime(): string {
    return "指针表 " + this.h + "点" + this.m + "分";
  }
}

// 工厂函数：接收构造签名类型作为参数
function createClock(ctor: ClockConstructor, h: number, m: number): Clock {
  return new ctor(h, m); // 用 new 调用传入的构造函数
}

const digital = createClock(DigitalClock, 12, 5);
const analog = createClock(AnalogClock, 9, 30);
console.log("DigitalClock:", digital.getTime());
console.log("AnalogClock:", analog.getTime());

// ---- 9. 高阶函数 ----
console.log("\\n========== 9. 高阶函数 ==========");

// 接受函数、返回函数的高阶函数：组合 compose
function compose<A, B, C>(f: (x: A) => B, g: (x: B) => C): (x: A) => C {
  // 返回一个新函数：先执行 f，再执行 g
  return (x: A) => g(f(x));
}

const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const addThenDouble = compose(addOne, double);
console.log("compose: double(addOne(3)) =", addThenDouble(3)); // double(4)=8

// 高阶函数：once，确保函数只执行一次
function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: any;
  const wrapped = ((...args: any[]) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  }) as T;
  return wrapped;
}

const expensive = (n: number) => {
  console.log("  (执行耗时计算)");
  return n * n;
};
const cached = once(expensive);
console.log("第一次调用 cached(5):", cached(5));
console.log("第二次调用 cached(5):", cached(5), "（不会再次执行）");

console.log("\\n函数章节演示完成！");`,
  },

  // =========================================================
  // 第二章：类 (Class)
  // =========================================================
  {
    id: "ts-classes",
    title: "类 (Class)",
    icon: "🏛️",
    group: "核心",
    content: `## 类 (Class)

**类（Class）** 是面向对象编程（OOP）的核心构造。它把**数据（属性）**和**行为（方法）**封装在一起，是创建对象的蓝图。TypeScript 在 ES6 类的基础上扩展了**访问修饰符、参数属性、抽象类、存取器类型**等强大特性，让面向对象设计更加严谨和安全。

本章将从最基础的类定义讲起，逐步覆盖访问修饰符、参数属性、getter/setter、静态成员、抽象类、继承、接口实现等所有核心概念，并配以完整的实战示例（银行账户系统）。

### 类是什么

类是一个**模板**，用来创建具有相同结构和行为的对象。\`class\` 关键字定义类，\`new\` 创建实例：

\`\`\`ts
class Person {
  name: string;      // 属性声明
  age: number;
  constructor(name: string, age: number) {  // 构造函数
    this.name = name;
    this.age = age;
  }
  greet(): string {  // 方法
    return "我是 " + this.name + "，" + this.age + " 岁";
  }
}
const p = new Person("张三", 28);
p.greet(); // "我是 张三，28 岁"
\`\`\`

#### 类的组成部分

| 组成 | 说明 | 示例 |
| --- | --- | --- |
| **属性** | 实例上的数据 | \`name: string\` |
| **构造函数** | 创建实例时初始化 | \`constructor(...)\` |
| **方法** | 实例可调用的行为 | \`greet(): string\` |
| **静态成员** | 属于类本身而非实例 | \`static create()\` |
| **存取器** | 控制属性读写 | \`get x() / set x()\` |

### 属性、方法、构造函数

#### 属性声明

类的属性必须先声明（写明名字和类型），可以在声明时初始化，也可以在构造函数里赋值：

\`\`\`ts
class Point {
  x: number = 0;     // 声明 + 初始化
  y: number;         // 仅声明，构造函数里赋值
  constructor(y: number) {
    this.y = y;
  }
}
\`\`\`

#### 构造函数 constructor

\`constructor\` 是类实例化时自动调用的特殊方法，用于初始化属性。**每个类只能有一个 constructor**（但可以用默认参数和重载签名模拟多种构造方式）。

\`\`\`ts
class User {
  constructor(public id: number, public name: string) {}
}
new User(1, "张三");
\`\`\`

#### 方法

方法是定义在类上的函数，通过 \`this\` 访问实例属性：

\`\`\`ts
class Calculator {
  result = 0;
  add(n: number): this {  // 返回 this 可实现链式调用
    this.result += n;
    return this;
  }
}
new Calculator().add(1).add(2).result; // 3
\`\`\`

### 访问修饰符：public、private、protected、readonly

这是 TypeScript 相比 JavaScript 类最重要的增强之一。修饰符控制成员的**可访问范围**，是编译期检查（运行时被擦除）。

| 修饰符 | 类内部 | 子类 | 类外部 | 说明 |
| --- | --- | --- | --- | --- |
| **public**（默认） | ✅ | ✅ | ✅ | 完全公开 |
| **private** | ✅ | ❌ | ❌ | 仅类内部可访问 |
| **protected** | ✅ | ✅ | ❌ | 类内部和子类可访问 |
| **readonly** | ✅（读） | ✅（读） | ✅（读） | 只读，构造函数后不可改 |

\`\`\`ts
class Account {
  public owner: string;       // 公开：谁都能访问
  private balance: number;    // 私有：只有 Account 内部能访问
  protected type: string;     // 受保护：Account 和子类能访问
  readonly id: string;        // 只读：构造后不可改
  constructor(owner: string, balance: number, type: string, id: string) {
    this.owner = owner;
    this.balance = balance;
    this.type = type;
    this.id = id;
  }
}
\`\`\`

#### private vs # 私有字段

ES2022 引入了运行时真正的私有字段 \`#field\`，它与 TS 的 \`private\` 关键字不同：

| 维度 | TS \`private\` | ES \`#field\` |
| --- | --- | --- |
| **检查时机** | 编译期 | 运行时 |
| **运行时是否可访问** | 可访问（被擦除） | 不可访问 |
| **语法** | \`private x\` | \`#x\` |

**陷阱**：TS \`private\` 只是编译期约定，运行时仍可通过 \`any\` 绕过。需要真正的运行时封装用 \`#field\`。本教程因侧重运行结果，\`private\` 已足够。

### 参数属性（构造函数参数简写）

这是 TypeScript 的便利特性：在构造函数参数前加修饰符（\`public\`/\`private\`/\`protected\`/\`readonly\`），**TypeScript 会自动声明同名属性并赋值**，省去手写属性声明和 \`this.x = x\`：

\`\`\`ts
// 简写前
class User1 {
  public id: number;
  public name: string;
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
// 简写后（等价）
class User2 {
  constructor(public id: number, public name: string) {}
}
\`\`\`

参数属性大大减少了样板代码，是 TS 类最常用的特性之一。

### 存取器 getter / setter

用 \`get\` 和 \`set\` 关键字定义"虚拟属性"，在读取/赋值时执行自定义逻辑（校验、计算、触发副作用）：

\`\`\`ts
class Temperature {
  private _celsius = 0;
  get celsius(): number {
    return this._celsius;
  }
  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("温度不能低于绝对零度");
    }
    this._celsius = value;
  }
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;  // 只读计算属性
  }
}
const t = new Temperature();
t.celsius = 25;          // 调用 setter
t.celsius;               // 调用 getter，返回 25
t.fahrenheit;            // 77，只读（没有 setter）
\`\`\`

**注意**：
- 只有 \`get\` 没有 \`set\` 的属性自动变成只读。
- getter/setter 在编译后变成 \`Object.defineProperty\`，运行时表现为普通属性访问。
- 私有字段通常用 \`_\` 前缀（如 \`_celsius\`），这是社区约定。

### 静态成员 static

\`static\` 修饰的成员属于**类本身**，而不是实例。通过 \`类名.成员\` 访问，常用于工具方法、常量、工厂：

\`\`\`ts
class MathUtil {
  static PI = 3.14159;             // 静态属性
  static square(n: number): number { // 静态方法
    return n * n;
  }
}
MathUtil.PI;        // 3.14159
MathUtil.square(4); // 16
// new MathUtil().PI; // ❌ 实例不能访问静态成员
\`\`\`

静态方法内 \`this\` 指向类本身（而非实例），不能访问实例属性。静态成员可以被继承（子类也能访问 \`父类.静态成员\`）。

### 抽象类 abstract

\`abstract\` 修饰的类**不能被直接实例化**，只能被继承。它可以包含抽象方法（只有签名没有实现），子类必须实现。抽象类用于**定义家族类的公共接口和部分实现**：

\`\`\`ts
abstract class Animal {
  abstract sound(): void;   // 抽象方法：子类必须实现
  breathe(): void {          // 具体方法：子类直接继承
    console.log("呼吸...");
  }
}
class Dog extends Animal {
  sound(): void {            // 必须实现抽象方法
    console.log("汪汪");
  }
}
// new Animal(); // ❌ 抽象类不能实例化
new Dog().sound();   // "汪汪"
new Dog().breathe(); // "呼吸..."（继承的具体方法）
\`\`\`

**抽象类 vs 接口**：

| 维度 | 抽象类 | 接口 |
| --- | --- | --- |
| **能否有实现** | ✅ 可以有具体方法 | ❌ 纯描述，无实现 |
| **能否被实例化** | ❌ 不能 | ❌ 不能 |
| **多继承** | ❌ 单继承 | ✅ 多实现 |
| **运行时存在** | ✅ 存在（编译为类） | ❌ 擦除 |
| **适合** | 共享代码的家族 | 描述对象形状/契约 |

### 继承 extends 与 super

子类用 \`extends\` 继承父类，获得父类的所有成员。子类构造函数**必须调用 \`super()\`**（在访问 \`this\` 之前）：

\`\`\`ts
class Animal {
  constructor(public name: string) {}
  move(): string { return this.name + " 在移动"; }
}
class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);   // 必须先调用 super
  }
  bark(): string { return this.name + " 汪汪叫"; }
  // 重写父类方法
  move(): string { return super.move() + "（用四条腿）"; }
}
\`\`\`

**super 的两种用法**：
1. \`super()\`：调用父类构造函数（仅构造函数内）。
2. \`super.方法()\`：调用父类的方法（用于在重写中复用父类逻辑）。

**陷阱**：子类构造函数若访问 \`this\` 之前没调 \`super()\`，会运行时报错（\`ReferenceError: Must call super constructor\`）。

### implements 接口

类用 \`implements\` 声明它符合某个接口的形状（实例部分）。一个类可以 \`implements\` 多个接口：

\`\`\`ts
interface Loggable { log(msg: string): void; }
interface Serializable { serialize(): string; }

class Logger implements Loggable, Serializable {
  log(msg: string): void { console.log(msg); }
  serialize(): string { return "Logger{}"; }
}
\`\`\`

**implements vs extends**：
- \`implements\` 只是**类型契约**，不继承实现；接口描述的是实例形状。
- \`extends\` 是**实现继承**，子类获得父类的代码。

\`implements\` 只检查实例部分，**不检查静态部分**（构造函数签名）。如需约束构造函数，用混合类型或工厂。

### 类类型（类本身也是一种类型）

在 TypeScript 中，**类名既是值（构造函数）也是类型（实例类型）**。声明一个变量为某类类型，表示它是该类的实例：

\`\`\`ts
class Point {
  constructor(public x: number, public y: number) {}
}
const p: Point = new Point(1, 2);   // Point 作为类型
function distance(a: Point, b: Point): number {  // 参数类型
  return Math.hypot(a.x - b.x, a.y - b.y);
}
\`\`\`

如果想要"构造函数类型"（类本身），用 \`typeof Point\`：

\`\`\`ts
const PointCtor: typeof Point = Point;
const origin = new PointCtor(0, 0);
\`\`\`

### 类相关陷阱总结

1. **this 在回调中丢失**：类方法传给回调时 this 丢失，用箭头函数属性或 bind。
2. **super 必须先于 this**：子类构造函数访问 this 前必须调 super()。
3. **private 不防运行时**：TS private 只是编译期，运行时可绕过；要真私有用 #field。
4. **参数属性仅构造函数**：只有构造函数参数能简写，普通方法参数不行。
5. **抽象类不能 new**：但运行时（转译后）实际就是普通类，new 不会运行时报错，只是失去了类型保护。
6. **implements 不继承实现**：只检查形状，不获得任何代码。
7. **readonly 只在编译期**：运行时仍可修改，需配合 Object.freeze 等才真正只读。

### 本节代码演示

下面用一个**银行账户系统**综合演示类的所有特性：访问修饰符、参数属性、getter/setter、静态成员、抽象类、继承、方法重写、接口实现。代码可直接运行查看输出。`,
    code: `// ============================================================
// 第二章代码演示：TypeScript 类全景（银行账户系统）
// ============================================================

// ---- 1. 基础类：属性 / 方法 / 构造函数 / 静态成员 ----
console.log("========== 1. 基础类 Point ==========");

class Point {
  // 属性声明（public 是默认修饰符）
  public x: number;
  public y: number;
  // 静态成员：属于类本身
  static origin: Point = new Point(0, 0);
  // 类的静态计数器
  private static instanceCount: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    Point.instanceCount++;
  }
  // 实例方法
  distanceTo(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  // 静态方法：通过类名调用
  static distance(a: Point, b: Point): number {
    return a.distanceTo(b);
  }
  static get count(): number {
    return Point.instanceCount;
  }
}

const p1 = new Point(3, 4);
const p2 = new Point(6, 8);
console.log("p1 =", "(" + p1.x + "," + p1.y + ")");
console.log("p2 =", "(" + p2.x + "," + p2.y + ")");
console.log("p1.distanceTo(p2) =", p1.distanceTo(p2).toFixed(4));
console.log("Point.distance 静态方法 =", Point.distance(p1, p2).toFixed(4));
console.log("Point.origin 静态属性 =", "(" + Point.origin.x + "," + Point.origin.y + ")");
console.log("已创建 Point 实例数 =", Point.count);

// ---- 2. 访问修饰符 + 参数属性 + readonly ----
console.log("\\n========== 2. 访问修饰符与参数属性 ==========");

class Person {
  // 参数属性简写：自动声明并赋值 this.xxx
  constructor(
    public name: string,          // public：外部可访问
    public readonly id: number,   // readonly：构造后不可改
    private age: number,          // private：仅类内访问
    protected email: string       // protected：类内和子类访问
  ) {}
  // public 方法暴露 private/protected 数据
  describe(): string {
    return this.name + "（ID:" + this.id + "，年龄:" + this.age + "，邮箱:" + this.email + "）";
  }
  haveBirthday(): void {
    this.age++; // 类内部可以访问 private 成员
  }
}

const person = new Person("张三", 1001, 28, "zhangsan@example.com");
console.log("public 属性 name:", person.name);
console.log("readonly 属性 id:", person.id);
// person.age      // ❌ private，外部不可访问（运行时不报错但类型不安全）
// person.email    // ❌ protected
console.log("通过方法访问:", person.describe());
person.haveBirthday();
console.log("过完生日:", person.describe());

// ---- 3. 存取器 getter / setter ----
console.log("\\n========== 3. 存取器 getter/setter ==========");

class Temperature {
  // 私有字段，用 _ 前缀（社区约定）
  private _celsius: number = 0;
  // getter：读取时执行
  get celsius(): number {
    return this._celsius;
  }
  // setter：赋值时校验
  set celsius(value: number) {
    if (value < -273.15) {
      console.log("  ⚠️ 温度 " + value + " 低于绝对零度，已修正为 -273.15");
      this._celsius = -273.15;
    } else {
      this._celsius = value;
    }
  }
  // 只读计算属性（只有 get 没有 set）
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;
  }
  get kelvin(): number {
    return this._celsius + 273.15;
  }
}

const temp = new Temperature();
temp.celsius = 25;          // 调用 setter
console.log("设置 25°C 后：", temp.celsius + "°C =", temp.fahrenheit + "°F =", temp.kelvin + "K");
temp.celsius = -300;        // 触发校验
console.log("设置 -300°C（非法）后：", temp.celsius + "°C");
// temp.fahrenheit = 100;  // ❌ 没有 setter，只读

// ---- 4. 抽象类 + 继承 + 方法重写 ----
console.log("\\n========== 4. 抽象类与继承（银行账户） ==========");

// 抽象类：不能被 new，定义家族公共接口和部分实现
abstract class BankAccount {
  // 抽象属性：子类必须实现
  abstract accountType: string;
  // 参数属性
  constructor(
    public readonly accountNumber: string,
    protected balance: number,
    public owner: string
  ) {}
  // 抽象方法：子类必须实现
  abstract calculateInterest(): number;
  // 具体方法：子类直接继承
  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("  " + this.owner + "：存款金额必须大于 0");
      return;
    }
    this.balance += amount;
    console.log("  " + this.owner + " 存入 " + amount + "，余额 " + this.balance);
  }
  withdraw(amount: number): boolean {
    if (amount > this.balance) {
      console.log("  " + this.owner + " 余额不足（" + this.balance + "），取款失败");
      return false;
    }
    this.balance -= amount;
    console.log("  " + this.owner + " 取出 " + amount + "，余额 " + this.balance);
    return true;
  }
  // getter：受保护 balance 的只读访问
  get currentBalance(): number {
    return this.balance;
  }
  toString(): string {
    return this.accountType + "[" + this.accountNumber + "] " + this.owner + " 余额:" + this.balance;
  }
}

// 子类 1：储蓄账户
class SavingsAccount extends BankAccount {
  accountType: string = "储蓄账户";
  constructor(
    accountNumber: string,
    balance: number,
    owner: string,
    private interestRate: number  // 年利率 %
  ) {
    super(accountNumber, balance, owner);  // 必须先调 super
  }
  // 实现抽象方法
  calculateInterest(): number {
    return Math.round(this.balance * this.interestRate / 100);
  }
  // 新增方法
  applyInterest(): void {
    const interest = this.calculateInterest();
    this.balance += interest;
    console.log("  " + this.owner + " 结息 " + interest + "，余额 " + this.balance);
  }
}

// 子类 2：信用账户（重写 withdraw，允许透支）
class CreditAccount extends BankAccount {
  accountType: string = "信用账户";
  private creditLimit: number;
  constructor(
    accountNumber: string,
    balance: number,
    owner: string,
    creditLimit: number
  ) {
    super(accountNumber, balance, owner);
    this.creditLimit = creditLimit;
  }
  // 重写父类方法：允许在信用额度内透支
  withdraw(amount: number): boolean {
    if (amount > this.balance + this.creditLimit) {
      console.log("  " + this.owner + " 超过信用额度（可用 " + (this.balance + this.creditLimit) + "），取款失败");
      return false;
    }
    this.balance -= amount;
    console.log("  " + this.owner + " 信用取款 " + amount + "，余额 " + this.balance);
    return true;
  }
  // 实现抽象方法：欠款按高利率计息
  calculateInterest(): number {
    return this.balance < 0 ? Math.round(Math.abs(this.balance) * 18 / 100) : 0;
  }
}

// new BankAccount(...) // ❌ 抽象类不能实例化（类型错误；运行时转译后实际可 new，但教程不演示）
const savings = new SavingsAccount("SA-001", 10000, "张三", 3.5);
const credit = new CreditAccount("CA-001", 2000, "李四", 5000);

console.log("储蓄账户操作：");
savings.deposit(5000);
savings.withdraw(3000);
console.log("  利息：" + savings.calculateInterest());
savings.applyInterest();

console.log("信用账户操作：");
credit.deposit(1000);
credit.withdraw(5000);  // 透支
console.log("  透支利息：" + credit.calculateInterest());
credit.withdraw(99999); // 超额度

console.log("\\n账户清单：");
console.log("  " + savings.toString());
console.log("  " + credit.toString());

// ---- 5. implements 接口 ----
console.log("\\n========== 5. implements 接口 ==========");

// 接口描述类的实例形状
interface Loggable {
  log(msg: string): void;
}
interface Serializable {
  serialize(): string;
}

// 一个类可以实现多个接口
class ConsoleLogger implements Loggable, Serializable {
  constructor(public prefix: string) {}
  log(msg: string): void {
    console.log("  [" + this.prefix + "] " + msg);
  }
  serialize(): string {
    return JSON.stringify({ prefix: this.prefix });
  }
}

const logger = new ConsoleLogger("APP");
logger.log("类实现接口示例");
console.log("  序列化：" + logger.serialize());

// ---- 6. 类类型：类名既是值也是类型 ----
console.log("\\n========== 6. 类类型 ==========");

// Point 既是构造函数（值）也是实例类型（类型）
function midpoint(a: Point, b: Point): Point {
  return new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
}
const pa = new Point(2, 4);
const pb = new Point(8, 10);
const mid = midpoint(pa, pb);
console.log("中点 =", "(" + mid.x + "," + mid.y + ")");

// typeof Point 表示"构造函数类型"
const PointCtor: typeof Point = Point;
const origin = new PointCtor(0, 0);
console.log("用 typeof Point 创建实例:", "(" + origin.x + "," + origin.y + ")");

// ---- 7. this 在回调中丢失与修复 ----
console.log("\\n========== 7. 类方法 this 陷阱 ==========");

class Button {
  constructor(public label: string) {}
  // 普通方法：this 动态绑定，传给回调会丢失
  onClick(this: Button): void {
    console.log("  按钮[" + this.label + "] 被点击");
  }
  // 箭头函数属性：this 词法绑定，永远指向实例
  onClickSafe = (): void => {
    console.log("  按钮[" + this.label + "] 安全点击（箭头函数）");
  };
}

const btn = new Button("提交");
// 模拟把方法注册成回调
const callback = btn.onClick;
console.log("普通方法传给回调（this 丢失）:");
try {
  callback(); // this 不再是 btn
  console.log("  （未抛错，this 为全局）");
} catch (e) {
  console.log("  抛错：" + e.message);
}
// 修复：用箭头函数属性
const safeCallback = btn.onClickSafe;
console.log("箭头函数属性传给回调（this 安全）:");
safeCallback(); // this 仍是 btn

console.log("\\n类章节演示完成！");`,
  },

  // =========================================================
  // 第三章：泛型 (Generics)
  // =========================================================
  {
    id: "ts-generics",
    title: "泛型 (Generics)",
    icon: "🎯",
    group: "核心",
    content: `## 泛型 (Generics)

**泛型（Generics）** 是 TypeScript 类型系统中最强大、最核心的特性之一。它让你能写出**可复用、类型安全**的代码——同一个函数/类/接口可以处理多种类型，同时保留类型之间的关联关系。如果说类型注解是给变量贴标签，那泛型就是给类型留"占位符"，等到使用时再填入具体类型。

本章将深入讲解泛型的动机、语法、约束、默认参数、与 keyof 的结合等，并通过实现泛型栈、泛型 Pair、泛型 memoize 等实战来巩固理解。

### 为什么需要泛型

先看一个经典问题：写一个 \`identity\` 函数，它接收什么就返回什么。

#### 方案 1：用 any（丢失类型信息）

\`\`\`ts
function identityAny(x: any): any {
  return x;
}
const r = identityAny("hello");
// r 的类型是 any，失去了"它是 string"的信息
r.toUpperCase(); // 不报错，但 r 可能不是 string
r.toFixed();     // 也不报错，但运行时会出错
\`\`\`

\`any\` 的问题：**输入和输出之间的类型关联丢失了**。传入 string，返回的却是 any，编译器无法知道返回值的具体类型。

#### 方案 2：为每种类型写一个函数（无法复用）

\`\`\`ts
function identityString(x: string): string { return x; }
function identityNumber(x: number): number { return x; }
// ...无穷无尽
\`\`\`

这显然不可行，违背了 DRY 原则。

#### 方案 3：用泛型（类型参数化）

\`\`\`ts
function identity<T>(x: T): T {
  return x;
}
const r1 = identity<string>("hello");  // r1: string
const r2 = identity(42);               // r2: number（类型推断）
r1.toUpperCase(); // ✅ 编译器知道 r1 是 string
\`\`\`

\`<T>\` 是**类型参数**（类型变量），\`T\` 只是一个约定俗成的名字（Type 的首字母）。调用时传入具体类型（或由编译器推断），\`T\` 就被替换成那个类型。这样既复用了代码，又保留了类型关联。

#### 三种方案对比

| 方案 | 复用性 | 类型安全 | 输入输出关联 |
| --- | --- | --- | --- |
| any | ✅ | ❌ | ❌ 丢失 |
| 多个具体函数 | ❌ | ✅ | ✅ 但不可复用 |
| **泛型** | ✅ | ✅ | ✅ 完美 |

### 泛型函数

语法：在函数名后加 \`<类型参数>\`，参数和返回值都可以使用该类型参数：

\`\`\`ts
function identity<T>(x: T): T {
  return x;
}
function first<T>(arr: T[]): T {   // T 出现在参数和返回值
  return arr[0];
}
\`\`\`

#### 调用方式

1. **显式指定类型参数**：\`identity<string>("hi")\`
2. **类型推断**：\`identity("hi")\`，编译器根据实参推断 \`T = string\`

推荐：能推断就让编译器推断，只有推断不出或想"锁定"类型时才显式指定。

#### 类型参数命名约定

| 名称 | 含义 |
| --- | --- |
| \`T\` | Type，第一个类型参数 |
| \`U\`、\`V\` | 第二、第三个类型参数 |
| \`K\` | Key，对象的键类型 |
| \`V\` | Value，对象的值类型 |
| \`E\` | Element，数组/集合的元素类型 |
| \`R\` | Return，返回值类型 |

这些只是约定，你可以用任何合法标识符，但遵循约定能提升可读性。

### 泛型接口

接口也可以带类型参数：

\`\`\`ts
interface Box<T> {
  value: T;
  unwrap(): T;
}
const box: Box<number> = {
  value: 42,
  unwrap() { return this.value; }
};
\`\`\`

泛型接口让"容器型"数据结构（盒子、栈、队列、Promise、响应包装）的类型表达非常优雅。\`Promise<T>\`、\`Array<T>\`、\`Map<K,V>\` 都是泛型接口的典型例子。

### 泛型类

类也能带类型参数，最经典的例子是各种集合数据结构：

\`\`\`ts
class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
const numStack = new Stack<number>();   // 数字栈
const strStack = new Stack<string>();   // 字符串栈
\`\`\`

泛型类的类型参数作用于**整个类的所有实例成员**（不包括静态成员——静态成员不能引用类的类型参数）。

### 泛型约束 extends

默认情况下 \`T\` 可以是任何类型，但有时你想限制 \`T\` 必须满足某些条件（比如必须有某个属性）。用 \`T extends 约束\` 实现：

\`\`\`ts
interface Lengthwise { length: number; }
// T 必须有 length 属性
function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);  // ✅ 安全访问 length
  return arg;
}
logLength("hello");      // ✅ string 有 length
logLength([1, 2, 3]);    // ✅ 数组有 length
// logLength(42);        // ❌ number 没有 length
\`\`\`

#### 约束的常见形式

1. **约束到接口**：\`T extends Lengthwise\`
2. **约束到对象形状**：\`T extends { id: number }\`
3. **约束到函数类型**：\`T extends (...args: any[]) => any\`
4. **约束到另一个类型参数**：\`<T, U extends T>\`

### keyof 与泛型结合

\`keyof T\` 取类型 \`T\` 的所有键的联合类型。结合泛型约束，可以安全地访问对象属性：

\`\`\`ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "张三", age: 28 };
getProperty(user, "name"); // 返回 string
getProperty(user, "age");  // 返回 number
// getProperty(user, "email"); // ❌ "email" 不是 user 的键
\`\`\`

这是泛型最优雅的应用之一：\`K extends keyof T\` 保证 \`key\` 必须是 \`obj\` 真实存在的键，返回值类型 \`T[K]\` 还能精确反映该键对应的值类型。

\`\`\`ts
// 类型安全的 setter
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}
\`\`\`

### 多类型参数

泛型可以有多个类型参数：

\`\`\`ts
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
pair<string, number>("id", 1);     // [string, number]
pair("name", "张三");              // 推断 [string, string]
\`\`\`

泛型类 \`Map<K, V>\`、\`Pair<K, V>\` 都是多类型参数的典型。

### 默认泛型参数

类型参数可以指定默认值，调用时不传则用默认类型：

\`\`\`ts
function createArray<T = string>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}
createArray(3, "x");       // string[]
createArray<number>(3, 0); // number[]
\`\`\`

默认参数让泛型 API 更易用——常见类型不必每次都显式指定。

### 泛型在工具函数中的应用

泛型是 React、Lodash、RxJS 等库的基石。几个经典场景：

#### useState（React）

\`\`\`ts
function useState<T>(initial: T): [T, (v: T) => void] {
  let state = initial;
  const setter = (v: T) => { state = v; };
  return [state, setter];
}
const [count, setCount] = useState(0);  // 推断 T = number
\`\`\`

#### map / filter / reduce

\`\`\`ts
// Array<T>.map 的签名（简化）
function map<T, U>(arr: T[], fn: (x: T) => U): U[] {
  return arr.map(fn);
}
map([1, 2, 3], (x) => x.toString());  // T=number, U=string → string[]
\`\`\`

#### memoize（缓存函数结果）

\`\`\`ts
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  // ...
}
\`\`\`

### 泛型与数组 Array<T>

\`Array<T>\` 和 \`T[]\` 完全等价，都是泛型。数组方法本身就是泛型的最佳范例：

\`\`\`ts
const nums: Array<number> = [1, 2, 3];
nums.map((n) => n * 2);   // (n: number) => number，返回 number[]
nums.filter((n) => n > 1); // (n: number) => boolean，返回 number[]
\`\`\`

### 泛型的类型推断

当泛型函数被调用时，编译器尽量从实参推断类型参数：

\`\`\`ts
function pair<K, V>(k: K, v: V): [K, V] { return [k, v]; }
pair(1, "a");        // 推断 K=number, V=string
pair<number, any>(1, "a"); // 显式指定，覆盖推断
\`\`\`

推断失败的典型情况：当类型参数只出现在返回值而不出现在参数时，无法推断，必须显式指定。

### 泛型陷阱总结

1. **类型参数必须被使用**：纯装饰性的 \`<T>\`（参数返回值都没用到 T）没有意义。
2. **类型参数在运行时不存在**：泛型是编译期的，运行时不能 \`typeof T\` 或 \`new T()\`。要保留类型信息需传入构造函数。
3. **静态成员不能用类的类型参数**：\`static\` 成员属于类本身，实例化前 \`T\` 未定。
4. **约束不是默认值**：\`T extends X\` 是约束 \`T\` 必须满足 \`X\`，不是给 \`T\` 默认值。
5. **避免不必要的泛型**：能用具体类型就别用泛型，过度泛型反而降低可读性。
6. \`any\` 破坏泛型安全性：泛型函数里用 \`any\` 会绕过约束，慎用。
7. **推断不出时要显式**：类型参数只出现在返回值时必须显式指定。

### 本节代码演示

下面实现三个泛型实战：泛型栈 \`Stack<T>\`、泛型键值对 \`Pair<K,V>\`、泛型缓存函数 \`memoize<T>\`，并演示泛型约束（\`Lengthwise\`）、\`keyof\` 结合、默认泛型参数、多类型参数。代码可直接运行。`,
    code: `// ============================================================
// 第三章代码演示：TypeScript 泛型全景
// ============================================================

// ---- 1. 泛型函数基础 + 类型推断 ----
console.log("========== 1. 泛型函数基础 ==========");

// 泛型函数：<T> 是类型参数，调用时确定
function identity<T>(x: T): T {
  return x; // 输入和输出都是 T，类型关联保留
}
// 显式指定类型参数
console.log("identity<string>('hi'):", identity<string>("hi"));
// 类型推断：编译器根据实参推断 T
console.log("identity(42) 推断为 number:", identity(42));
console.log("identity([1,2,3]) 推断为 number[]:", identity([1, 2, 3]));

// 泛型函数：返回数组第一个元素
function first<T>(arr: T[]): T {
  return arr[0];
}
console.log("first(['a','b']):", first(["a", "b"]));
console.log("first([10,20,30]):", first([10, 20, 30]));

// 对比 any 的劣势：any 丢失类型关联
function identityAny(x: any): any {
  return x;
}
const anyResult = identityAny("hello");
console.log("any 版本返回类型是 any（丢失关联）:", anyResult);

// ---- 2. 泛型接口 ----
console.log("\\n========== 2. 泛型接口 ==========");

// 泛型接口：Box<T> 包装一个值
interface Box<T> {
  value: T;
  unwrap(): T;
  map<U>(fn: (x: T) => U): Box<U>; // 泛型方法
}

function makeBox<T>(value: T): Box<T> {
  return {
    value,
    unwrap() {
      return this.value;
    },
    map<U>(fn: (x: T) => U): Box<U> {
      return makeBox(fn(this.value));
    },
  };
}

const numBox = makeBox(42);
console.log("Box<number> unwrap:", numBox.unwrap());
const strBox = numBox.map((n) => "数字是 " + n); // T=number, U=string
console.log("map 后 Box<string> unwrap:", strBox.unwrap());

// ---- 3. 泛型类：Stack<T> ----
console.log("\\n========== 3. 泛型类 Stack<T> ==========");

class Stack<T> {
  // 私有数组，元素类型为 T
  private items: T[] = [];
  // 入栈
  push(item: T): void {
    this.items.push(item);
  }
  // 出栈
  pop(): T | undefined {
    return this.items.pop();
  }
  // 查看栈顶
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  get size(): number {
    return this.items.length;
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  toArray(): T[] {
    return this.items.slice();
  }
}

// 数字栈
const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.push(3);
console.log("数字栈 size:", numStack.size);
console.log("栈顶 peek:", numStack.peek());
console.log("出栈 pop:", numStack.pop());
console.log("出栈后 size:", numStack.size);

// 字符串栈（同一份代码，不同类型）
const strStack = new Stack<string>();
strStack.push("苹果");
strStack.push("香蕉");
console.log("字符串栈:", strStack.toArray());
console.log("出栈:", strStack.pop(), "剩:", strStack.toArray());

// ---- 4. 多类型参数：Pair<K, V> ----
console.log("\\n========== 4. 多类型参数 Pair<K,V> ==========");

class Pair<K, V> {
  constructor(public key: K, public value: V) {}
  // 泛型方法：变换 key 的类型
  mapKey<NK>(fn: (k: K) => NK): Pair<NK, V> {
    return new Pair(fn(this.key), this.value);
  }
  mapValue<NV>(fn: (v: V) => NV): Pair<K, NV> {
    return new Pair(this.key, fn(this.value));
  }
  toString(): string {
    return "(" + JSON.stringify(this.key) + " => " + JSON.stringify(this.value) + ")";
  }
}

const p1 = new Pair("id", 1001);   // K=string, V=number
console.log("Pair<string,number>:", p1.toString());
const p2 = p1.mapKey((k) => k.toUpperCase()); // NK=string
console.log("mapKey 后:", p2.toString());
const p3 = p1.mapValue((v) => "NO." + v); // NV=string
console.log("mapValue 后:", p3.toString());

// ---- 5. 泛型约束 extends ----
console.log("\\n========== 5. 泛型约束 extends ==========");

// 约束：T 必须有 length 属性
interface Lengthwise {
  length: number;
}
function logLength<T extends Lengthwise>(arg: T): T {
  console.log("  长度 =", arg.length);
  return arg;
}
console.log("string 有 length:");
logLength("hello");
console.log("数组有 length:");
logLength([1, 2, 3, 4]);

// 约束到对象形状
function getId<T extends { id: number }>(obj: T): number {
  return obj.id;
}
console.log("约束 { id: number }:", getId({ id: 7, name: "x" }));

// 约束到函数类型（memoize 会用到）
function callFn<T extends (...args: any[]) => any>(fn: T, ...args: any[]): ReturnType<T> {
  return fn(...args);
}
const result = callFn((x: number, y: number) => x + y, 3, 4);
console.log("约束到函数类型 callFn:", result);

// ---- 6. keyof 与泛型结合 ----
console.log("\\n========== 6. keyof 与泛型 ==========");

// 类型安全的属性读取
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
// 类型安全的属性设置
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}

const user = { name: "张三", age: 28, active: true };
console.log("getProperty(user,'name'):", getProperty(user, "name"));
console.log("getProperty(user,'age'):", getProperty(user, "age"));
const updated = setProperty(user, "age", 29);
console.log("setProperty 修改 age:", JSON.stringify(updated));
// getProperty(user, "email"); // ❌ 类型错误：email 不是 user 的键（运行时不报错）

// ---- 7. 默认泛型参数 ----
console.log("\\n========== 7. 默认泛型参数 ==========");

// T 默认为 string
function createArray<T = string>(length: number, value: T): T[] {
  const arr: T[] = [];
  for (let i = 0; i < length; i++) {
    arr.push(value);
  }
  return arr;
}
console.log("默认 T=string:", createArray(3, "x"));
console.log("显式 T=number:", createArray<number>(3, 0));

// 默认泛型参数在接口中
interface Response<T = unknown> {
  code: number;
  data: T;
}
const r1: Response = { code: 200, data: "未知类型" };     // data: unknown
const r2: Response<string[]> = { code: 200, data: ["a"] }; // data: string[]
console.log("Response 默认:", JSON.stringify(r1));
console.log("Response 指定:", JSON.stringify(r2));

// ---- 8. 泛型实战：memoize 缓存函数 ----
console.log("\\n========== 8. 泛型实战 memoize ==========");

// 约束 T 必须是函数类型
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  // 用 Map 缓存：key 是参数序列化，value 是结果
  const cache = new Map<string, ReturnType<T>>();
  let callCount = 0;
  let cacheHitCount = 0;

  const wrapped = ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      cacheHitCount++;
      console.log("    [缓存命中] key =", key);
      return cache.get(key);
    }
    callCount++;
    console.log("    [实际计算] key =", key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;

  // 挂载统计方法（演示函数对象可带属性）
  (wrapped as any).stats = () => ({
    实际计算次数: callCount,
    缓存命中次数: cacheHitCount,
    缓存大小: cache.size,
  });
  return wrapped;
}

// 一个"耗时"的平方函数
function slowSquare(n: number): number {
  // 模拟计算（这里实际很快，仅演示）
  return n * n;
}

const memoSquare = memoize(slowSquare);
console.log("调用 memoSquare(5):", memoSquare(5));
console.log("再次调用 memoSquare(5):", memoSquare(5));
console.log("调用 memoSquare(6):", memoSquare(6));
console.log("再次调用 memoSquare(5):", memoSquare(5));
console.log("缓存统计:", (memoSquare as any).stats());

// ---- 9. 泛型与数组方法 ----
console.log("\\n========== 9. 泛型与数组方法 ==========");

// 数组方法本身就是泛型的最佳范例
const nums: Array<number> = [1, 2, 3, 4, 5];
// map：T=number, U=string
const strings = nums.map((n) => "第" + n + "个");
console.log("map number→string:", strings);
// filter
const evens = nums.filter((n) => n % 2 === 0);
console.log("filter 偶数:", evens);
// reduce：多类型变换
const sum = nums.reduce((acc, n) => acc + n, 0);
console.log("reduce 求和:", sum);

// 自定义泛型 map 函数
function myMap<T, U>(arr: T[], fn: (x: T, i: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}
console.log("myMap<number,string>:", myMap([10, 20, 30], (x) => "值=" + x));

console.log("\\n泛型章节演示完成！");`,
  },

  // =========================================================
  // 第四章：联合与交叉类型
  // =========================================================
  {
    id: "ts-union-intersection",
    title: "联合与交叉类型",
    icon: "🔗",
    group: "核心",
    content: `## 联合与交叉类型

**联合类型（Union）** 和 **交叉类型（Intersection）** 是 TypeScript 类型系统的两大组合利器。联合类型表达"或"的关系（一个值可以是 A 或 B），交叉类型表达"与"的关系（一个值同时是 A 和 B）。配合**可辨识联合（Discriminated Union）**和**类型收窄（Narrowing）**，它们能优雅地建模复杂业务状态，是 TypeScript 进阶的必修课。

本章将系统讲解联合与交叉类型的语法、原理、收窄技巧、可辨识联合、穷尽检查，并通过实战（网络状态机、Mixin、形状面积计算）巩固理解。

### 联合类型 A | B（或的关系）

联合类型用 \`|\` 连接多个类型，表示值可以是其中**任意一个**：

\`\`\`ts
type ID = number | string;
let id: ID = 123;    // ✅ number
id = "A-001";        // ✅ string
\`\`\`

#### 联合类型的本质

\`A | B\` 表示"属于 A **或**属于 B 的值集合的并集"。对联合类型的值，**只能访问所有成员共有的成员**——因为你不确定它到底是哪个类型：

\`\`\`ts
function process(id: number | string) {
  // id.toFixed();    // ❌ string 没有 toFixed
  // id.toUpperCase(); // ❌ number 没有 toUpperCase
  console.log(id.toString()); // ✅ number 和 string 都有 toString
}
\`\`\`

这是联合类型的核心规则：**只能安全使用交集部分的成员**。要用特定类型的成员，必须先**收窄**类型。

#### 联合类型 vs 联合字面量类型

\`\`\`ts
type ID = number | string;          // 类型联合
type Status = "active" | "inactive"; // 字面量联合（枚举的轻量替代）
\`\`\`

字面量联合常用于约束变量为固定几个值，是替代枚举的轻量方案，序列化友好、tree-shaking 友好。

### 交叉类型 A & B（与的关系）

交叉类型用 \`&\` 连接多个类型，表示值**同时满足所有类型**——把多个类型的属性合并到一起：

\`\`\`ts
type Person = { name: string };
type Employee = { employeeId: number };
type EmployeePerson = Person & Employee;
// EmployeePerson 同时有 name 和 employeeId
const emp: EmployeePerson = { name: "张三", employeeId: 1001 };
\`\`\`

#### 交叉类型的本质

\`A & B\` 表示"既属于 A **又**属于 B 的值集合的交集"。对交叉类型的值，**可以访问 A 和 B 的所有成员**——因为它同时具备两者。

#### 交叉类型与同名属性

如果交叉的类型有同名属性且类型兼容，结果取**更窄**的类型；如果类型不兼容（如 \`string & number\`），该属性变成 \`never\`：

\`\`\`ts
type A = { x: string; y: number };
type B = { y: number; z: boolean };
type C = A & B; // { x: string; y: number; z: boolean }，y 都是 number，合并为 number

type P = { x: string };
type Q = { x: number };
type R = P & Q; // { x: never }，string & number = never，无法赋值
\`\`\`

**陷阱**：交叉不兼容类型会产生 \`never\`，编译能过但无法构造合法值。这种情况通常意味着类型设计有问题。

### 联合 vs 交叉对照表

| 维度 | 联合类型 \`A | B\` | 交叉类型 \`A & B\` |
| --- | --- | --- |
| **逻辑关系** | 或（A 或 B） | 与（A 且 B） |
| **可访问成员** | 只能访问共有成员 | 可访问所有成员 |
| **赋值兼容** | 值属于任一即可 | 值必须满足所有 |
| **集合运算** | 并集 | 交集 |
| **典型用途** | 多态参数、状态机 | Mixin、组合能力 |
| **对函数参数** | 接受更宽（逆变） | 接受更窄 |

### 类型收窄（Narrowing）

收窄是指编译器在特定代码块内**缩小变量类型**的能力。联合类型必须配合收窄才能使用特定成员。

#### 1. typeof 收窄

\`\`\`ts
function format(value: number | string): string {
  if (typeof value === "number") {
    return value.toFixed(2); // 这里 value: number
  }
  return value.toUpperCase(); // 这里 value: string
}
\`\`\`

\`typeof\` 能识别 \`string\`、\`number\`、\`boolean\`、\`symbol\`、\`bigint\`、\`undefined\`、\`function\`、\`object\`。注意 \`typeof null === "object"\`（历史遗留），判断 null 要用 \`=== null\`。

#### 2. 真值收窄（Truthiness）

\`\`\`ts
function len(s: string | null) {
  if (s) {           // 排除 "" 和 null
    return s.length; // 这里 s: string
  }
  return 0;
}
\`\`\`

#### 3. in 操作符收窄

\`\`\`ts\` 判断对象是否有某属性，常用于区分结构不同的对象：

\`\`\`ts
interface Bird { fly(): void; layEggs(): void; }
interface Fish { swim(): void; layEggs(): void; }
function move(pet: Bird | Fish) {
  if ("fly" in pet) {
    pet.fly();   // 这里 pet: Bird
  } else {
    pet.swim();  // 这里 pet: Fish
  }
}
\`\`\`

#### 4. instanceof 收窄

\`\`\`ts\` 判断对象是否是某类的实例：

\`\`\`ts
function speak(x: Cat | Dog) {
  if (x instanceof Cat) {
    x.meow();  // 这里 x: Cat
  } else {
    x.bark();  // 这里 x: Dog
  }
}
\`\`\`

#### 5. 自定义类型守卫（Type Predicate）

用 \`x is Type\` 返回值类型自定义收窄函数：

\`\`\`ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}
if (isString(value)) {
  value.toUpperCase(); // 这里 value: string
}
\`\`\`

类型守卫是处理复杂联合的利器，比 \`typeof\` 更灵活。

#### 收窄方式对照表

| 方式 | 适用场景 | 示例 |
| --- | --- | --- |
| \`typeof\` | 原始类型区分 | \`typeof x === "string"\` |
| 真值 | 排除 null/undefined/"" | \`if (x)\` |
| \`in\` | 区分对象结构 | \`"fly" in pet\` |
| \`instanceof\` | 区分类实例 | \`x instanceof Cat\` |
| \`=== null/undefined\` | 精确判空 | \`x === null\` |
| \`x is T\` | 自定义复杂判断 | \`isError(x)\` |

### 可辨识联合（Discriminated Union）

这是 TypeScript 类型系统最强大的模式之一。当联合类型的每个成员都有一个**共同的字面量属性（判别式/标签）**时，TS 能根据这个属性自动收窄类型，无需手写类型守卫：

\`\`\`ts
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; size: number };
type Shape = Circle | Square;

function area(s: Shape): number {
  switch (s.kind) {           // 根据 kind 判别式收窄
    case "circle":
      return Math.PI * s.radius ** 2;  // 这里 s: Circle
    case "square":
      return s.size ** 2;              // 这里 s: Square
  }
}
\`\`\`

#### 可辨识联合的三要素

1. **共同的判别式属性**：每个成员都有同名的属性。
2. **判别式是字面量类型**：如 \`"circle"\`、\`"square"\`，每个成员的判别式值不同。
3. **联合**：用 \`|\` 组合所有变体。

#### 可辨识联合的典型应用

1. **状态机**：\`loading | success | error\`。
2. **API 响应**：成功带数据、失败带错误。
3. **UI 组件变体**：按钮的不同样式。
4. **AST 节点**：不同类型的语法节点。

可辨识联合比 \`in\` 收窄更安全、更可读，是处理"同一概念有多种形态"的首选方案。

### 穷尽检查（Exhaustive Check）与 never

\`never\` 类型表示**永远不会出现的值**。在 switch 中，如果把一个 \`never\` 类型的值赋给 \`never\` 变量，编译能过；但如果联合类型新增了成员而 switch 没处理，那个分支的类型就不是 \`never\`，赋值就会报错——这就实现了**编译期穷尽检查**：

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function assertNever(x: never): never {
  throw new Error("未处理: " + JSON.stringify(x));
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    default:
      // 如果未来新增 triangle 但没处理，这里 s 不是 never，编译报错
      return assertNever(s);
  }
}
\`\`\`

穷尽检查的好处：**新增一个联合成员时，编译器强制你处理所有相关 switch**，避免遗漏分支导致的运行时 bug。

### 交叉类型的实际用途：Mixin

交叉类型非常适合描述 **Mixin 模式**——把多个能力组合到一个对象上：

\`\`\`ts
type Timestamped = { createdAt: string };
type Versioned = { version: number };
type Auditable = Timestamped & Versioned;

// 给任意对象附加审计字段
function withAudit<T extends object>(obj: T): T & Auditable {
  return Object.assign({}, obj, { createdAt: "2024-01-01", version: 1 });
}
const article = withAudit({ title: "TS", content: "..." });
// article 有 title、content、createdAt、version 四个属性
\`\`\`

### 联合类型与条件类型简介

条件类型是类型层面的"if-else"，常与联合类型配合：

\`\`\`ts
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<"hi">;  // "yes"
type B = IsString<42>;    // "no"

// 分布式条件类型：对联合类型"分发"
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>; // string[] | number[]
\`\`\`

条件类型属于高级类型编程，本节仅做简介，重点是理解它与联合类型的协同。

### 联合与交叉的陷阱总结

1. **联合类型只能访问共有成员**：要用特定成员必须收窄。
2. **交叉不兼容属性变 never**：\`{x:string} & {x:number}\` 的 x 是 never。
3. **可辨识联合要求判别式是字面量**：\`kind: string\` 不能作判别式，必须是 \`kind: "circle"\`。
4. **穷尽检查依赖 never**：忘了 default 的 assertNever 就失去保护。
5. **交叉类型不等于继承**：\`A & B\` 是类型组合，不创建类继承关系。
6. **运行时无联合/交叉**：这些都是编译期概念，运行时只有具体值。
7. **typeof null === "object"**：判空用 \`=== null\`，别用 typeof。
8. **可辨识联合的判别式必须唯一可分**：每个变体的判别式值不能重叠。

### 本节代码演示

下面演示：联合类型（ID 处理）、可辨识联合（网络状态机 + 形状面积）、类型守卫（typeof/in/instanceof/is）、交叉类型 Mixin、穷尽检查（never）。代码可直接运行。`,
    code: `// ============================================================
// 第四章代码演示：联合与交叉类型全景
// ============================================================

// ---- 1. 联合类型 ----
console.log("========== 1. 联合类型 ==========");

// 联合类型：值可以是 number 或 string
type ID = number | string;

function describeId(id: ID): string {
  // 联合类型只能访问共有成员（toString 两边都有）
  // 要用特定成员必须收窄
  if (typeof id === "number") {
    // 这里 id 被收窄为 number
    return "数字ID: " + id.toFixed(0);
  }
  // 这里 id 被收窄为 string
  return "字符串ID: " + id.toUpperCase();
}

console.log(describeId(10086));
console.log(describeId("a-12345"));

// 字面量联合：约束为固定选项（轻量枚举）
type Theme = "light" | "dark" | "auto";
type ButtonSize = "small" | "medium" | "large";

function applyTheme(theme: Theme): string {
  const labels: Record<Theme, string> = {
    light: "浅色主题",
    dark: "深色主题",
    auto: "跟随系统",
  };
  return "已应用：" + labels[theme];
}
console.log(applyTheme("dark"));
console.log(applyTheme("auto"));

// ---- 2. 交叉类型与 Mixin ----
console.log("\\n========== 2. 交叉类型与 Mixin ==========");

// 定义两个能力类型
type Timestamped = { createdAt: string };
type Versioned = { version: number };
// 交叉类型：同时具备两个能力的类型
type Auditable = Timestamped & Versioned;

// Mixin 函数：给任意对象附加审计字段
function withAudit<T extends object>(obj: T): T & Auditable {
  // Object.assign 把多个对象合并成一个，返回类型具备所有属性
  return Object.assign({}, obj, {
    createdAt: "2024-01-01",
    version: 1,
  });
}

// 原始文章对象
const rawArticle = { title: "TypeScript 入门", content: "联合与交叉类型很有用..." };
// 加上审计字段后，类型是 { title; content } & { createdAt; version }
const article = withAudit(rawArticle);
console.log("Mixin 后的文章:", JSON.stringify(article));
console.log("title:", article.title);
console.log("createdAt:", article.createdAt);
console.log("version:", article.version);

// 多重交叉：组合更多能力
type Loggable = { log(msg: string): void };
type Serializable = { serialize(): string };
type FullEntity = Auditable & Loggable & Serializable;

function makeEntity<T extends object>(data: T): FullEntity & T {
  return Object.assign({}, data, {
    createdAt: "2024-06-01",
    version: 2,
    log(msg: string) { console.log("  [实体日志] " + msg); },
    serialize() { return JSON.stringify(this); },
  }) as FullEntity & T;
}

const entity = makeEntity({ name: "订单", amount: 99.5 });
entity.log("实体已创建");
console.log("序列化:", entity.serialize());

// ---- 3. 类型收窄：typeof / in / instanceof ----
console.log("\\n========== 3. 类型收窄 ==========");

// (a) typeof 收窄
function pad(value: string | number, length: number): string {
  if (typeof value === "number") {
    return value.toFixed(length); // number
  }
  return value.padEnd(length, " "); // string
}
console.log("typeof 收窄 pad(3.14159, 2):", pad(3.14159, 2));
console.log("typeof 收窄 pad('hi', 5):", pad("hi", 5));

// (b) in 收窄：区分结构不同的对象
interface Bird {
  fly(): string;
  layEggs(): string;
}
interface Fish {
  swim(): string;
  layEggs(): string;
}
type Pet = Bird | Fish;

function petAction(pet: Pet): string {
  // 用共有成员无需收窄
  const egg = pet.layEggs();
  // 用 in 区分独有成员
  if ("fly" in pet) {
    return egg + "；" + pet.fly(); // pet: Bird
  }
  return egg + "；" + pet.swim(); // pet: Fish
}
const bird: Bird = {
  fly: () => "展翅高飞",
  layEggs: () => "下了一个蛋",
};
const fish: Fish = {
  swim: () => "摆尾游动",
  layEggs: () => "产了一窝卵",
};
console.log("in 收窄 鸟:", petAction(bird));
console.log("in 收窄 鱼:", petAction(fish));

// (c) instanceof 收窄：区分类实例
class Cat {
  meow(): string { return "喵～"; }
}
class Dog {
  bark(): string { return "汪！"; }
}
function speak(animal: Cat | Dog): string {
  if (animal instanceof Cat) {
    return "猫叫：" + animal.meow(); // animal: Cat
  }
  return "狗叫：" + animal.bark(); // animal: Dog
}
console.log("instanceof 收窄:", speak(new Cat()));
console.log("instanceof 收窄:", speak(new Dog()));

// (d) 自定义类型守卫 x is T
interface SuccessResponse { ok: true; data: string; }
interface ErrorResponse { ok: false; error: string; }
type ApiResult = SuccessResponse | ErrorResponse;

// 自定义类型守卫函数
function isSuccess(r: ApiResult): r is SuccessResponse {
  return r.ok === true;
}

function handleResult(r: ApiResult): string {
  if (isSuccess(r)) {
    return "✅ 成功：" + r.data; // r: SuccessResponse
  }
  return "❌ 失败：" + r.error; // r: ErrorResponse
}
console.log("类型守卫:", handleResult({ ok: true, data: "用户数据" }));
console.log("类型守卫:", handleResult({ ok: false, error: "权限不足" }));

// ---- 4. 可辨识联合：网络状态机 ----
console.log("\\n========== 4. 可辨识联合：网络状态 ==========");

// 每个变体都有共同的 state 字段（判别式），值是不同的字面量
type NetworkState =
  | { state: "loading" }
  | { state: "success"; data: string }
  | { state: "error"; message: string; code: number };

function renderNetwork(ns: NetworkState): string {
  // 根据 state 判别式自动收窄
  switch (ns.state) {
    case "loading":
      return "⏳ 加载中...（无数据）"; // ns: { state: "loading" }
    case "success":
      return "✅ 成功：" + ns.data; // ns: { state: "success"; data }
    case "error":
      return "❌ 错误[" + ns.code + "]：" + ns.message; // ns: { state: "error"; ... }
  }
}

const states: NetworkState[] = [
  { state: "loading" },
  { state: "success", data: "获得 42 条记录" },
  { state: "error", message: "网络超时", code: 504 },
];
states.forEach((s) => console.log(renderNetwork(s)));

// ---- 5. 可辨识联合 + 穷尽检查：形状面积 ----
console.log("\\n========== 5. 穷尽检查 never ==========");

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "triangle"; base: number; height: number };

// 穷尽检查工具：接收 never 类型参数
function assertNever(x: never): never {
  // 如果某天新增了 shape 变体但忘了在 switch 处理，
  // default 分支的 x 就不再是 never，赋值给 never 会编译报错
  throw new Error("未处理的形状: " + JSON.stringify(x));
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      // s 被收窄为 { kind: "circle"; radius }
      return Math.PI * s.radius * s.radius;
    case "square":
      // s 被收窄为 { kind: "square"; size }
      return s.size * s.size;
    case "triangle":
      // s 被收窄为 { kind: "triangle"; base; height }
      return 0.5 * s.base * s.height;
    default:
      // 穷尽检查：所有 case 都处理后，这里 s 是 never
      return assertNever(s);
  }
}

function describeShape(s: Shape): string {
  switch (s.kind) {
    case "circle":
      return "圆(半径" + s.radius + ")";
    case "square":
      return "正方形(边" + s.size + ")";
    case "triangle":
      return "三角形(" + s.base + "x" + s.height + ")";
    default:
      return assertNever(s);
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "square", size: 4 },
  { kind: "triangle", base: 6, height: 8 },
];
shapes.forEach((s) => {
  console.log(describeShape(s) + " 面积 = " + area(s).toFixed(2));
});

// 演示 assertNever 在运行时的行为（用 try/catch 包住避免中断）
console.log("\\n演示 assertNever 触发（模拟未处理分支）:");
try {
  // 伪造一个"未处理"的值传入 assertNever（绕过类型，仅演示运行时）
  assertNever({ kind: "hexagon" } as never);
} catch (e) {
  console.log("  捕获到穷尽检查异常:", e.message);
}

// ---- 6. 联合与交叉的综合：用户权限系统 ----
console.log("\\n========== 6. 综合：用户权限 ==========");

// 联合：角色
type Role = "admin" | "editor" | "viewer";
// 交叉：角色 + 能力
type User = { id: number; name: string } & { role: Role };

// 可辨识联合：操作结果
type OpResult =
  | { status: "ok"; affected: number }
  | { status: "denied"; reason: string }
  | { status: "error"; message: string };

// 根据角色判断权限（自定义类型守卫）
function canEdit(u: User): u is User & { role: "admin" | "editor" } {
  return u.role === "admin" || u.role === "editor";
}

function tryEdit(u: User, target: string): OpResult {
  if (!canEdit(u)) {
    return { status: "denied", reason: u.name + "（" + u.role + "）无编辑权限" };
  }
  // 这里 u 被收窄为可编辑角色
  if (target === "__system__" && u.role !== "admin") {
    return { status: "denied", reason: "仅管理员可编辑系统资源" };
  }
  return { status: "ok", affected: 1 };
}

function report(r: OpResult): string {
  switch (r.status) {
    case "ok":
      return "✅ 操作成功，影响 " + r.affected + " 条";
    case "denied":
      return "🚫 拒绝：" + r.reason;
    case "error":
      return "❌ 错误：" + r.message;
    default:
      return assertNever(r);
  }
}

const users: User[] = [
  { id: 1, name: "管理员张三", role: "admin" },
  { id: 2, name: "编辑李四", role: "editor" },
  { id: 3, name: "访客王五", role: "viewer" },
];
users.forEach((u) => {
  const r1 = tryEdit(u, "文章1");
  const r2 = tryEdit(u, "__system__");
  console.log(u.name + " 编辑文章:", report(r1));
  console.log(u.name + " 编辑系统:", report(r2));
});

// ---- 7. 条件类型简介 ----
console.log("\\n========== 7. 条件类型简介 ==========");

// 条件类型：类型层面的 if-else（编译期，运行时擦除）
type IsString<T> = T extends string ? "是字符串" : "非字符串";
type T1 = IsString<"hello">; // "是字符串"
type T2 = IsString<42>;      // "非字符串"

// 用条件类型做运行时无关的演示：通过变量展示推断结果
const check1: T1 = "是字符串";
const check2: T2 = "非字符串";
console.log("IsString<'hello'> =", check1);
console.log("IsString<42> =", check2);

// 分布式条件类型：对联合类型分发
type ToArray<T> = T extends unknown ? T[] : never;
type Arr = ToArray<string | number>; // string[] | number[]
const arrDemo: Arr = [1, 2, 3];
console.log("ToArray<string|number> 示例:", arrDemo);

console.log("\\n联合与交叉类型章节演示完成！");`,
  },
];
