// =============================================================
// TypeScript 交互式教程 —— 第三批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-narrowing        — 类型守卫与收窄
//   2. ts-advanced-types   — 高级类型
//   3. ts-utility-types    — 工具类型 (Utility Types)
//   4. ts-inference        — 类型推断与上下文
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
//   - 高级类型（条件类型/映射类型/infer/模板字面量类型）在转译后
//     全部被擦除，代码 demo 用 typeof 验证运行时值类型，并用注释
//     说明编译期的类型计算结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：类型守卫与收窄 (Type Guards & Narrowing)
  // =========================================================
  {
    id: "ts-narrowing",
    title: "类型守卫与收窄",
    icon: "🔍",
    group: "进阶类型",
    content: `## 类型守卫与收窄 (Type Guards & Narrowing)

类型收窄（Type Narrowing）是 TypeScript 类型系统最强大、最实用的特性之一。它指的是：**编译器根据代码中的某些检查条件，在一个代码块内把一个较宽的类型（如联合类型 \`string | number\`）缩小为一个更具体的类型（如 \`string\`）**。有了类型收窄，你可以在同一个函数里安全地处理多种类型，而无需写大量类型断言。

可以说，**没有类型收窄，联合类型就几乎无法使用**——因为联合类型只能访问所有成员共有的属性和方法，要访问特定成员的属性，就必须先"收窄"到那个成员类型。类型守卫（Type Guard）就是触发类型收窄的那些检查条件。

本章将极其详细地讲解所有种类的类型守卫，包括 \`typeof\`、\`instanceof\`、\`in\`、自定义守卫（\`x is Type\`）、真值收窄、相等收窄，以及 TypeScript 的控制流分析（Control Flow Analysis）如何把收窄结果传播到整个代码路径。最后会讨论收窄的局限性和常见陷阱。

### 什么是类型收窄

让我们先从一个最简单的例子理解"收窄"的含义：

\`\`\`ts
// padLeft 接受 string | number 类型的 padding
function padLeft(value: string, padding: string | number): string {  // 定义函数 padLeft，参数: value: string, padding: string | number，返回 string
  // 在 if 分支里，padding 被收窄为 number
  if (typeof padding === "number") {  // 类型守卫：判断是否为 number
    return " ".repeat(padding) + value;  // 返回 " ".repeat(padding) + value
  }
  // 在这里，padding 被收窄为 string
  return padding + value;  // 返回 padding + value
}

padLeft("hello", 4);      // "    hello"
padLeft("hello", ">>> "); // ">>> hello"
\`\`\`

在这个例子中，参数 \`padding\` 的类型是 \`string | number\`。在函数体入口处，编译器不知道它到底是 \`string\` 还是 \`number\`，因此只能让你调用两者共有的成员（比如 \`toString()\`）。但是当我们写下 \`typeof padding === "number"\` 这个检查后，编译器在 \`if\` 分支内就**知道** \`padding\` 是 \`number\`，于是允许调用 \`number\` 独有的方法 \`repeat\`；在 \`else\` 分支（或者说 if 块之后），编译器则**知道** \`padding\` 不是 \`number\`，因此收窄为 \`string\`，允许调用字符串拼接。

这就是类型收窄：**从宽类型到窄类型的过程**，由某个检查条件触发。

#### 为什么需要收窄

联合类型 \`A | B\` 表示"值要么是 A，要么是 B"。在不知道具体是哪个之前，TypeScript 只允许你访问 A 和 B 的**共有成员**。这是为了保证运行时安全——如果你直接调用 \`A\` 独有的方法，而运行时实际是 \`B\`，就会报错。

\`\`\`ts
type Fish = { swim: () => void };  // 定义类型别名 Fish
type Bird = { fly: () => void };  // 定义类型别名 Bird

function move(animal: Fish | Bird) {  // 定义函数 move，参数: animal: Fish | Bird
  // ❌ 错误：swim 不是 Fish 和 Bird 的共有成员
  animal.swim();  // 调用 animal.swim
  // ✅ 只能调用共有成员（两边都有 toString）
  animal.toString();  // 调用 animal.toString
}
\`\`\`

要访问 \`swim\` 或 \`fly\`，你必须先用类型守卫收窄到具体类型。

#### 收窄的本质

收窄的本质是 TypeScript 编译器在**编译期**模拟程序的执行路径，跟踪每个变量在每个位置的可能类型。这个过程叫做**控制流分析（Control Flow Analysis）**。编译器会分析 \`if/else\`、\`switch\`、三元表达式、\`return\`、\`throw\`、赋值等语句，逐步收窄或重置变量的类型。

收窄**只发生在编译期**——转译后的 JavaScript 代码里没有任何类型信息。收窄只是让编译器"更聪明地"允许或禁止你写某些代码，运行时行为完全由你的条件判断决定。

### typeof 守卫

\`typeof\` 是最基础也最常用的类型守卫。JavaScript 的 \`typeof\` 运算符在运行时返回一个表示值类型的字符串，TypeScript 能根据这个字符串做类型收窄。

#### typeof 的返回值

\`typeof\` 对不同类型的值返回以下字符串：

| 值的类型 | typeof 返回 | 备注 |
| --- | --- | --- |
| \`number\` | \`"number"\` | 包括 NaN、Infinity |
| \`string\` | \`"string"\` | 包括空字符串 |
| \`boolean\` | \`"boolean"\` | true / false |
| \`undefined\` | \`"undefined"\` | |
| \`bigint\` | \`"bigint"\` | ES2020+ |
| \`symbol\` | \`"symbol"\` | Symbol() |
| \`function\` | \`"function"\` | 包括 class、箭头函数 |
| \`null\` | \`"object"\` | ⚠️ 历史遗留 bug！ |
| 普通对象 \`{}\` | \`"object"\` | 包括数组、Date、Map 等 |
| 数组 \`[]\` | \`"object"\` | ⚠️ 数组 typeof 也是 "object" |

**重要陷阱**：\`typeof null\` 返回 \`"object"\`，这是 JavaScript 最早期的设计错误，为了向后兼容一直保留至今。判断 \`null\` 要用 \`=== null\`，不能用 \`typeof\`。同样，\`typeof []\` 返回 \`"object"\`，判断数组要用 \`Array.isArray()\`。

#### typeof 守卫示例

\`\`\`ts
function format(value: number | string | boolean): string {  // 定义函数 format，参数: value: number | string | boolean，返回 string
  if (typeof value === "number") {  // 类型守卫：判断是否为 number
    // 这里 value 被收窄为 number
    return value.toFixed(2);  // 返回 value.toFixed(2)
  }
  if (typeof value === "string") {  // 类型守卫：判断是否为 string
    // 这里 value 被收窄为 string
    return value.toUpperCase();  // 返回 value.toUpperCase()
  }
  // 这里 value 被收窄为 boolean
  return value ? "是" : "否";  // 返回 value ? "是" : "否"
}
\`\`\`

\`typeof\` 守卫最适合收窄**原始类型**（number、string、boolean、undefined、bigint、symbol、function）。对于对象类型，\`typeof\` 只能告诉你它是 \`"object"\`，无法区分是数组、Date 还是普通对象。

#### typeof 守卫的局限

1. **无法区分 null 和对象**：\`typeof null === "object"\`，需要单独用 \`=== null\` 判断。
2. **无法区分数组和对象**：\`typeof [] === "object"\`，需要用 \`Array.isArray()\`。
3. **无法区分子类**：\`typeof\` 看不到原型链，只知道基本类型。
4. **对象类型收窄能力弱**：对 \`object\` 类型，\`typeof\` 守卫只能区分 \`"function"\` 和 \`"object"\`，无法进一步区分。

\`\`\`ts
function inspect(val: number | string | null | number[] | Date) {  // 定义函数 inspect，参数: val: number | string | null | number[] | Date
  if (typeof val === "number") {  // 类型守卫：判断是否为 number
    return "数字: " + val;          // val: number
  }
  if (typeof val === "string") {  // 类型守卫：判断是否为 string
    return "字符串: " + val;        // val: string
  }
  // ⚠️ 这里 val 的类型是 null | number[] | Date
  // typeof 无法区分这三者（null 和数组都是 "object"）
  if (val === null) {  // 条件判断
    return "空值";                   // val: null
  }
  if (Array.isArray(val)) {  // 条件判断
    return "数组: " + val.length;    // val: number[]
  }
  return "日期: " + val.getTime();   // val: Date
}
\`\`\`

### instanceof 守卫

\`instanceof\` 运算符检查一个对象的原型链上是否存在某个构造函数的 \`prototype\`。TypeScript 能根据 \`instanceof\` 结果收窄类型。

#### 基本用法

\`\`\`ts
class Dog {  // 定义类 Dog
  bark() { return "汪汪!"; }  // 调用 bark
}
class Cat {  // 定义类 Cat
  meow() { return "喵~"; }  // 调用 meow
}

function speak(animal: Dog | Cat): string {  // 定义函数 speak，参数: animal: Dog | Cat，返回 string
  if (animal instanceof Dog) {  // 类型守卫：instanceof 判断实例类型
    return animal.bark();    // animal 收窄为 Dog
  }
  return animal.meow();      // animal 收窄为 Cat
}
\`\`\`

\`instanceof\` 守卫非常适合**基于类的类型体系**。当一个联合类型由多个类组成时，用 \`instanceof\` 逐个判断即可收窄。

#### instanceof 的工作原理

\`x instanceof Foo\` 的运行时逻辑是：沿着 \`x\` 的原型链（\`x.__proto__\`、\`x.__proto__.__proto__\`……）查找，如果找到 \`Foo.prototype\` 就返回 \`true\`。这意味着：

1. **子类实例 instanceof 父类** 返回 \`true\`（原型链上有父类的 prototype）。
2. **instanceof 跨 iframe / realm 可能失效**（不同全局环境中的同名构造函数是不同的对象）。
3. **没有原型的对象**（\`Object.create(null)\`）对所有 \`instanceof\` 都返回 \`false\`。

#### instanceof 守卫的局限

1. **只能用于类，不能用于 interface / type**：\`interface\` 和 \`type\` 在运行时不存在，无法用 \`instanceof\` 判断。
2. **跨 realm 失效**：在浏览器中，来自不同 iframe 的数组 \`instanceof Array\` 可能是 \`false\`。
3. **需要构造函数引用**：你必须能在代码里引用到那个类/构造函数。
4. **原型链可被篡改**：\`Object.setPrototypeOf\` 可以改变原型链，导致 \`instanceof\` 结果不符合预期。

\`\`\`ts
// interface 不能用 instanceof
interface User { name: string }  // 定义接口 User
const u: User = { name: "张三" };  // 声明常量 u，类型 User
// u instanceof User;  // ❌ 运行时 User 不存在（interface 被擦除）

// 用 typeof + 属性检查代替
if (typeof u === "object" && u !== null && "name" in u) {  // 条件判断
  console.log(u.name);  // 控制台输出
}
\`\`\`

### in 守卫

\`in\` 运算符检查一个属性是否存在于对象中（包括原型链）。TypeScript 能根据 \`in\` 检查的结果收窄联合类型——如果某个变体有该属性而另一个没有，\`in\` 检查就能区分它们。

#### 基本用法

\`\`\`ts
interface Fish { swim: () => string; name: string }  // 定义接口 Fish
interface Bird { fly: () => string; name: string }  // 定义接口 Bird

function move(animal: Fish | Bird): string {  // 定义函数 move，参数: animal: Fish | Bird，返回 string
  if ("swim" in animal) {  // 条件判断
    return animal.swim();    // animal 收窄为 Fish
  }
  return animal.fly();       // animal 收窄为 Bird
}
\`\`\`

\`in\` 守卫非常适合**接口联合类型**（interface union），因为接口在运行时不存在，不能用 \`instanceof\`，但属性名是运行时真实存在的。

#### in 守卫的原理

\`"prop" in obj\` 在运行时检查 \`obj\` 及其原型链上是否有 \`prop\` 属性。TypeScript 编译器会查看联合类型中哪些成员**类型上声明了该属性**，如果有且有的有、有的没有，就能收窄。

\`\`\`ts
interface Admin { name: string; permissions: string[] }  // 定义接口 Admin
interface User { name: string; email: string }  // 定义接口 User

function canDelete(person: Admin | User): boolean {  // 定义函数 canDelete，参数: person: Admin | User，返回 boolean
  if ("permissions" in person) {  // 条件判断
    return person.permissions.includes("delete"); // person: Admin
  }
  return false; // person: User
}
\`\`\`

#### in 守卫的陷阱

1. **可选属性**：如果一个接口的属性是可选的（\`prop?:\`），\`in\` 检查为 \`true\` 时收窄结果**仍然包含可选标记**，属性值可能是 \`undefined\`。

\`\`\`ts
interface A { x: number; y?: string }  // 定义接口 A
interface B { x: number; z: boolean }  // 定义接口 B

function test(v: A | B) {  // 定义函数 test，参数: v: A | B
  if ("y" in v) {  // 条件判断
    // v 收窄为 A，但 y 可能是 undefined
    console.log(v.y);  // 类型是 string | undefined
  }
}
\`\`\`

2. **原型链属性**：\`in\` 会检查原型链，所以 \`"toString" in {}\` 返回 \`true\`。如果你只关心自有属性，要用 \`Object.prototype.hasOwnProperty.call(obj, "prop")\`，但这不能直接触发 TypeScript 的类型收窄。

3. **两个接口都有该属性**：如果联合类型的所有成员都有该属性，\`in\` 检查无法收窄（因为不能区分）。

### 自定义类型守卫函数 (x is Type)

有时候 \`typeof\`、\`instanceof\`、\`in\` 都不够用——你可能需要更复杂的运行时检查逻辑来判断一个值的类型。TypeScript 允许你定义**自定义类型守卫函数**，用特殊的返回类型 \`x is Type\` 告诉编译器："如果这个函数返回 \`true\`，那么参数 \`x\` 的类型就是 \`Type\`"。

#### 语法

\`\`\`ts
function isString(value: unknown): value is string {  // 自定义类型守卫（返回 x is T）
  return typeof value === "string";  // 类型守卫：判断是否为 string
}
\`\`\`

关键在于返回类型 \`value is string\`——这叫**类型谓词（Type Predicate）**。它的含义是：当函数返回 \`true\` 时，参数 \`value\` 的类型被收窄为 \`string\`。

#### 为什么要自定义守卫

1. **复用检查逻辑**：把复杂的类型检查封装成函数，到处复用。
2. **表达能力更强**：可以检查多个属性、做递归检查、处理复杂结构。
3. **比类型断言更安全**：类型断言（\`as\`）是"无条件信任"，自定义守卫是"有条件收窄"，更安全。

#### 自定义守卫示例

\`\`\`ts
// 检查是否为非 NaN 的数字
function isNumber(v: unknown): v is number {  // 自定义类型守卫（返回 x is T）
  return typeof v === "number" && !Number.isNaN(v);  // 类型守卫：判断是否为 number
}

// 检查是否为 User 接口
interface User { name: string; age: number }  // 定义接口 User
function isUser(v: unknown): v is User {  // 自定义类型守卫（返回 x is T）
  return (  // 返回 (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).name === "string" &&  // 调用 typeof（注意：any 关闭了类型检查；注意：类型断言会绕过类型检查）
    typeof (v as any).age === "number"  // 调用 typeof（注意：any 关闭了类型检查；注意：类型断言会绕过类型检查）
  );
}

// 检查是否为非空数组
function isNonEmptyArray<T>(v: T[] | undefined | null): v is T[] {  // 自定义类型守卫（返回 x is T）
  return Array.isArray(v) && v.length > 0;  // 返回 Array.isArray(v) && v.length > 0
}

function process(input: unknown): string {  // 定义函数 process，参数: input: unknown，返回 string
  if (isUser(input)) {  // 条件判断
    // input 收窄为 User
    return input.name + ", " + input.age + "岁";  // 返回 input.name + ", " + input.age + "岁"
  }
  if (isNumber(input)) {  // 条件判断
    return "数字: " + input;  // 返回 "数字: " + input
  }
  return "未知";  // 返回 "未知"
}
\`\`\`

#### 自定义守卫的陷阱

1. **守卫函数的逻辑必须正确**：TypeScript 不会验证你的运行时检查逻辑是否与 \`is Type\` 声明一致。如果你写了 \`return true\` 但声明为 \`v is string\`，编译器会信任你，但运行时 \`v\` 可能不是 \`string\`，导致后续代码出错。

2. **\`as any\` 断言**：在守卫函数内部，访问属性前通常需要 \`as any\` 断言（因为参数是 \`unknown\`），这是合理的——守卫函数本身就是"不安全"的边界。

3. **泛型守卫**：可以用泛型守卫实现类型过滤，如 \`isNonEmptyArray<T>\`。

4. **箭头函数也能写守卫**：\`const isString = (v: unknown): v is string => typeof v === "string"\`。

### 真值收窄 (Truthy Narrowing)

在 JavaScript 中，\`if (x)\` 会把 \`x\` 强制转换为布尔值。TypeScript 能根据真值检查收窄类型——在 \`if\` 分支里排除掉所有"falsy"（假值）的可能性。

#### Falsy 值列表

JavaScript 中以下值是 falsy（转换为 \`false\`）：

| 值 | 类型 | 说明 |
| --- | --- | --- |
| \`false\` | boolean | |
| \`0\`、\`-0\` | number | 包括 \`0n\`（bigint） |
| \`""\` | string | 空字符串 |
| \`null\` | null | |
| \`undefined\` | undefined | |
| \`NaN\` | number | |

所有其他值都是 truthy。

#### 真值收窄示例

\`\`\`ts
function greet(name?: string | null): string {  // 定义函数 greet，参数: name?: string | null，返回 string
  if (name) {  // 条件判断
    // name 被收窄为 string
    // 排除了 undefined、null 和 ""（空字符串也是 falsy）
    return "你好，" + name.toUpperCase();  // 返回 "你好，" + name.toUpperCase()
  }
  return "你好，陌生人";  // 返回 "你好，陌生人"
}

greet("张三");  // "你好，张三"
greet("");      // "你好，陌生人"（空字符串被排除）
greet(null);    // "你好，陌生人"
greet();        // "你好，陌生人"
\`\`\`

#### 真值收窄的陷阱

1. **排除了 \`0\` 和 \`""\`**：如果你的逻辑是"传了就用，没传就用默认值"，\`0\` 和 \`""\` 是合法值，但真值检查会把它们排除掉。此时应该用 \`=== undefined\` 或 \`!= null\`。

\`\`\`ts
// ❌ 危险：count=0 时会走 else 分支
function setCount(count?: number) {  // 定义函数 setCount，参数: count?: number
  if (count) {  // 条件判断
    console.log("设置了:", count);  // 控制台输出
  } else {
    console.log("默认值: 0");  // count=0 也会到这里！
  }
}

// ✅ 正确：用 === undefined 判断
function setCountSafe(count?: number) {  // 定义函数 setCountSafe，参数: count?: number
  if (count !== undefined) {  // 条件判断
    console.log("设置了:", count);  // count=0 也能正确处理
  } else {
    console.log("默认值: 0");  // 控制台输出
  }
}
\`\`\`

2. **\`NaN\` 被排除**：\`NaN\` 是 falsy，真值检查会排除它。如果你需要处理 \`NaN\`，用 \`Number.isNaN\`。

3. **对象永远 truthy**：\`if ({})\` 为 \`true\`，\`if ([])\` 为 \`true\`。空数组和空对象都是 truthy！这是常见面试陷阱。

### 相等收窄 (=== / !==)

当用 \`===\` 或 \`!==\` 比较一个联合类型的变量和一个字面量时，TypeScript 能根据比较结果收窄类型。

#### 基本用法

\`\`\`ts
type Status = "pending" | "success" | "error";  // 定义类型别名 Status

function handle(status: Status): string {  // 定义函数 handle，参数: status: Status，返回 string
  if (status === "pending") {  // 条件判断
    return "等待中...";    // status 收窄为 "pending"
  }
  if (status === "success") {  // 条件判断
    return "成功!";        // status 收窄为 "success"
  }
  return "出错了!";        // status 收窄为 "error"
}
\`\`\`

#### switch 语句收窄

\`switch\` 语句是相等收窄的常见形式：

\`\`\`ts
function describe(x: string | number | null): string {  // 定义函数 describe，参数: x: string | number | null，返回 string
  switch (x) {  // switch 分支选择
    case null:  // case 匹配分支
      return "空值";            // x: null
    case 0:  // case 匹配分支
      return "零";              // x: 0（字面量类型）
    case "hello":  // case 匹配分支
      return "你好";            // x: "hello"
    default:  // 默认分支
      // x 收窄为 string | number（排除了以上分支）
      return "其他: " + x;  // 返回 "其他: " + x
  }
}
\`\`\`

#### == 的松散相等收窄

TypeScript 也支持 \`==\` 的收窄，但**不推荐使用 \`==\`**（因为 \`==\` 有隐式类型转换，容易出错）。最常见的 \`==\` 收窄场景是 \`x == null\`，它能同时收窄 \`null\` 和 \`undefined\`：

\`\`\`ts
function trim(x: string | null | undefined): string {  // 定义函数 trim，参数: x: string | null | undefined，返回 string
  if (x == null) {  // 条件判断（注意：建议使用 === 严格相等）
    return "";   // x 收窄为 null | undefined
  }
  return x.trim(); // x 收窄为 string
}
\`\`\`

#### === 与 typeof 的对比

| 特性 | \`=== value\` | \`typeof x === "type"\` |
| --- | --- | --- |
| 适用场景 | 字面量联合、null/undefined | 原始类型联合 |
| 能否区分子类型 | ✅ 能区分 "a" 和 "b" | ❌ 只能区分 number/string 等 |
| 能否判断 null | ✅ \`=== null\` | ❌ typeof null 是 "object" |
| 运行时开销 | 低（直接比较） | 低（typeof 运算符） |

### 流分析 (Control Flow Analysis)

TypeScript 的**控制流分析**是类型收窄的"引擎"。编译器会跟踪变量在每个代码位置的类型，根据条件分支、赋值、return、throw 等语句不断更新类型。

#### CFA 的工作方式

1. **if/else 分支**：在 \`if\` 分支收窄为类型 A，在 \`else\` 分支收窄为排除 A 后的剩余类型。
2. **赋值**：给变量赋值后，变量类型收窄为赋值表达式的类型。
3. **return/throw/break/continue**：这些语句之后的代码，变量类型会被"排除"已返回/抛出的分支。
4. **三元表达式**：\`cond ? a : b\` 中，\`a\` 分支收窄 cond 为 true 的类型，\`b\` 分支收窄 cond 为 false 的类型。
5. **\`&&\` 和 \`||\`**：\`x && expr\` 中，\`expr\` 里 \`x\` 被收窄为 truthy 类型；\`x || expr\` 中，\`expr\` 里 \`x\` 被收窄为 falsy 类型。

#### CFA 示例

\`\`\`ts
function example(x: string | number | null): string {  // 定义函数 example，参数: x: string | number | null，返回 string
  if (typeof x === "string") {  // 类型守卫：判断是否为 string
    return x.toUpperCase();   // x: string
  }
  if (x === null) {  // 条件判断
    return "null";            // x: null
  }
  // 到这里，x 的类型已被收窄为 number
  // 因为 string 和 null 都已在上面 return 掉了
  return x.toFixed(2);        // x: number
}
\`\`\`

编译器知道：经过第一个 \`if\` 后，\`x\` 不是 \`string\`（如果是就 return 了）；经过第二个 \`if\` 后，\`x\` 不是 \`null\`。所以到这里 \`x\` 只能是 \`number\`。

#### CFA 与赋值

赋值会重置/收窄变量的类型：

\`\`\`ts
let val: string | number = "hello";  // 声明变量 val，类型 string | number
console.log(val.toUpperCase());  // val: string

val = 42;  // 赋值 val
console.log(val.toFixed(0));     // val: number（赋值后收窄）

val = "world";  // 赋值 val
// val 又变回 string
\`\`\`

### 收窄的局限与陷阱

尽管类型收窄非常强大，但它有一些重要的局限性，在实际开发中容易踩坑：

#### 1. 闭包中的类型不会收窄

\`\`\`ts
function example() {  // 定义函数 example
  let x: string | number = "hello";  // 声明变量 x，类型 string | number
  if (typeof x === "string") {  // 类型守卫：判断是否为 string
    // x 在这里被收窄为 string
    setTimeout(() => {  // 箭头函数（注意：定时器需及时清理）
      // ❌ 但在回调里，x 的类型又变回 string | number
      // 因为回调可能在将来执行，期间 x 可能被重新赋值
      console.log(x.toUpperCase());  // TS 报错（但运行时不报错）
    }, 0);
  }
}
\`\`\`

TypeScript 认为：闭包回调可能在将来执行，在执行前 \`x\` 可能被重新赋值为其他类型，所以不在回调中保留 \`if\` 分支的收窄结果。**解决方案**：把 \`x\` 赋给一个 \`const\` 变量（\`const\` 不会被重新赋值，收窄结果会保留）。

#### 2. 别名不会同步收窄

\`\`\`ts
function example(x: string | null) {  // 定义函数 example，参数: x: string | null
  const alias = x;   // alias 和 x 指向同一个值
  if (x) {  // 条件判断
    // x 被收窄为 string
    console.log(x.toUpperCase());  // 控制台输出
    // ❌ 但 alias 没有被收窄，仍然是 string | null
    // console.log(alias.toUpperCase());  // TS 报错
  }
}
\`\`\`

从 TypeScript 4.4 开始，**aliased conditions**（别名条件）有了一定改善，但别名变量的类型收窄仍然不如直接变量可靠。

#### 3. 类型断言会绕过收窄

\`\`\`ts
let x: string | number = "hello";  // 声明变量 x，类型 string | number
if (typeof x === "string") {  // 类型守卫：判断是否为 string
  // x 收窄为 string
  const y = x as number;  // ❌ 类型断言覆盖了收窄结果
  // y 的类型是 number，但运行时 y 实际是 string
  // console.log(y.toFixed());  // 运行时崩溃！
}
\`\`\`

#### 4. 守卫函数的逻辑必须正确

如前所述，TypeScript 不验证守卫函数的运行时逻辑。如果守卫函数 \`return true\` 但声明为 \`v is string\`，后续代码会按 \`string\` 处理，但运行时 \`v\` 可能不是 \`string\`。

#### 5. 运行时无类型信息

所有类型收窄都是编译期的。转译后的 JavaScript 没有任何类型信息，收窄只是让编译器允许你写某些代码。如果你的运行时检查逻辑写错了（比如 \`typeof x === "string"\` 写成了 \`typeof x === "strign"\`），运行时不会按预期工作，但编译器可能不会报错（因为 \`"strign"\` 也是一个合法的字符串字面量）。

### 类型守卫总结表

| 守卫种类 | 语法 | 适用场景 | 局限 |
| --- | --- | --- | --- |
| typeof | \`typeof x === "type"\` | 原始类型联合 | 无法区分 null/array/object |
| instanceof | \`x instanceof Class\` | 类联合 | 不能用于 interface；跨 realm 失效 |
| in | \`"prop" in x\` | 接口联合（按属性区分） | 可选属性仍可能 undefined |
| 自定义守卫 | \`fn(x): x is Type\` | 复杂检查逻辑 | 逻辑需自己保证正确 |
| 真值收窄 | \`if (x)\` | 排除 falsy 值 | 排除了 0 和 "" |
| 相等收窄 | \`=== / !== / switch\` | 字面量联合 | 仅限具体值比较 |

### 本节代码演示

下面用一个综合示例演示所有种类的类型守卫：定义 \`Guest | User | Admin\` 可辨识联合，用 \`typeof\`、\`instanceof\`、\`in\`、自定义守卫、真值收窄、相等收窄分别做类型收窄，并打印每个分支的结果。代码可直接运行查看输出。`,
    code: `// ============================================================
// 第一章代码演示：类型守卫与收窄全景
// ============================================================

// ---- 1. typeof 类型守卫 ----
console.log("========== 1. typeof 类型守卫 ==========");

// 联合类型：值可能是 number 或 string
type ID = number | string;

// typeof 守卫：根据运行时类型字符串收窄
function describeId(id: ID): string {
  // 在 if 分支内，id 被收窄为 number
  if (typeof id === "number") {
    // 可以调用 number 独有的方法 toFixed
    return "数字ID: " + id.toFixed(0);
  }
  // 在 else 部分，id 被收窄为 string
  // 可以调用 string 独有的方法 toUpperCase
  return "字符串ID: " + id.toUpperCase();
}

console.log("describeId(10086):", describeId(10086));
console.log("describeId('a-12345'):", describeId("a-12345"));

// typeof 能识别的所有返回值演示
function typeOfDemo(v: unknown): string {
  // typeof 守卫逐个判断原始类型
  if (typeof v === "number") return "number";
  if (typeof v === "string") return "string";
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "undefined") return "undefined";
  if (typeof v === "bigint") return "bigint";
  if (typeof v === "symbol") return "symbol";
  if (typeof v === "function") return "function";
  if (typeof v === "object") return "object"; // null 和数组都是 object！
  return "unknown";
}

console.log("typeof 123:", typeOfDemo(123));
console.log("typeof 'hi':", typeOfDemo("hi"));
console.log("typeof true:", typeOfDemo(true));
console.log("typeof undefined:", typeOfDemo(undefined));
// 注意：typeof null === "object"（历史遗留 bug）
console.log("typeof null:", typeOfDemo(null), "（⚠️ null 的 typeof 是 object）");
console.log("typeof {}:", typeOfDemo({}));
console.log("typeof []:", typeOfDemo([]), "（⚠️ 数组的 typeof 也是 object）");
console.log("typeof (()=>{}):", typeOfDemo(function () {}));

// ---- 2. instanceof 类型守卫 ----
console.log("\\n========== 2. instanceof 类型守卫 ==========");

// 定义类的继承体系
class Animal {
  constructor(public name: string) {}
  move(): string {
    return this.name + " 在移动";
  }
}

class Dog extends Animal {
  bark(): string {
    return this.name + ": 汪汪!";
  }
}

class Cat extends Animal {
  meow(): string {
    return this.name + ": 喵~";
  }
}

// instanceof 守卫：检查原型链，收窄到具体子类
function speak(animal: Animal): string {
  if (animal instanceof Dog) {
    // animal 被收窄为 Dog，可调用 bark
    return animal.bark();
  }
  if (animal instanceof Cat) {
    // animal 被收窄为 Cat，可调用 meow
    return animal.meow();
  }
  // animal 仍为 Animal（基类）
  return animal.move();
}

console.log("Dog 旺财:", speak(new Dog("旺财")));
console.log("Cat 咪咪:", speak(new Cat("咪咪")));
console.log("Animal 小动物:", speak(new Animal("小动物")));

// instanceof 的关键特性：子类 instanceof 父类 === true
const dog = new Dog("小黑");
console.log("dog instanceof Dog:", dog instanceof Dog);   // true
console.log("dog instanceof Animal:", dog instanceof Animal); // true（原型链）

// ---- 3. in 类型守卫 ----
console.log("\\n========== 3. in 类型守卫 ==========");

// 用 interface 定义联合类型（interface 在运行时不存在，不能用 instanceof）
interface Fish {
  swim: () => string;
  name: string;
}
interface Bird {
  fly: () => string;
  name: string;
}
type Pet = Fish | Bird;

// in 守卫：检查属性是否存在来收窄联合类型
function movePet(pet: Pet): string {
  if ("swim" in pet) {
    // pet 被收窄为 Fish，可调用 swim
    return pet.name + ": " + pet.swim();
  }
  // pet 被收窄为 Bird，可调用 fly
  return pet.name + ": " + pet.fly();
}

const nemo: Fish = { name: "尼莫", swim: () => "游啊游" };
const tweety: Bird = { name: "翠儿", fly: () => "飞啊飞" };
console.log("Fish 尼莫:", movePet(nemo));
console.log("Bird 翠儿:", movePet(tweety));

// in 守卫区分带不同属性的对象
interface Admin {
  name: string;
  permissions: string[];
}
interface RegularUser {
  name: string;
  email: string;
}

function checkPermission(person: Admin | RegularUser): string {
  // in 守卫检查 permissions 属性是否存在
  if ("permissions" in person) {
    // person 被收窄为 Admin
    return person.name + " 的权限: " + person.permissions.join(", ");
  }
  // person 被收窄为 RegularUser
  return person.name + " 的邮箱: " + person.email;
}

console.log("Admin:", checkPermission({ name: "管理员", permissions: ["read", "write"] }));
console.log("User:", checkPermission({ name: "普通用户", email: "user@test.com" }));

// ---- 4. 自定义类型守卫 (x is Type) ----
console.log("\\n========== 4. 自定义类型守卫 ==========");

// isString 守卫：返回类型是 "v is string"（类型谓词）
// 含义：如果函数返回 true，则 v 的类型被收窄为 string
function isString(v: unknown): v is string {
  return typeof v === "string";
}

// isNumber 守卫：排除 NaN
function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}

// 复杂自定义守卫：检查对象是否符合 User 接口
interface User {
  name: string;
  age: number;
}

function isUser(v: unknown): v is User {
  // 必须先确认是对象（且非 null），再访问属性
  // 在守卫函数内部用 as any 是合理的——这里是"不安全"的边界
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).name === "string" &&
    typeof (v as any).age === "number"
  );
}

// 使用自定义守卫做类型收窄
function processValue(v: unknown): string {
  if (isString(v)) {
    // v 被收窄为 string，可访问 length
    return "字符串(长度 " + v.length + "): " + v;
  }
  if (isNumber(v)) {
    // v 被收窄为 number
    return "数字的两倍: " + v * 2;
  }
  if (isUser(v)) {
    // v 被收窄为 User，可访问 name 和 age
    return "用户: " + v.name + ", " + v.age + "岁";
  }
  return "未知类型: " + String(v);
}

console.log(processValue("hello"));
console.log(processValue(42));
console.log(processValue({ name: "张三", age: 30 }));
console.log(processValue(true));
console.log(processValue(NaN), "（NaN 被 isNumber 排除）");

// 箭头函数也可以写自定义守卫
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";
console.log("isBoolean(true):", isBoolean(true));
console.log("isBoolean(1):", isBoolean(1));

// ---- 5. 真值收窄 (Truthy Narrowing) ----
console.log("\\n========== 5. 真值收窄 ==========");

// 真值收窄：if 条件为真时排除 falsy 值
function greet(name?: string | null): string {
  if (name) {
    // name 被收窄为 string
    // 排除了 undefined、null 和 ""（空字符串也是 falsy）
    return "你好，" + name.toUpperCase();
  }
  return "你好，陌生人";
}

console.log("greet('张三'):", greet("张三"));
console.log("greet():", greet());           // undefined 被排除
console.log("greet(''):", greet(""));       // 空字符串被排除
console.log("greet(null):", greet(null));   // null 被排除

// 展示所有 falsy 值
const falsyValues = [0, "", null, undefined, NaN, false];
console.log("falsy 值列表及真值检查:");
falsyValues.forEach(function (v) {
  console.log("  ", JSON.stringify(v), "→", v ? "truthy" : "falsy");
});

// 真值收窄的陷阱：0 和 "" 是合法值但会被排除
function setCountBad(count?: number): string {
  if (count) {
    // ⚠️ count=0 时不会进入这里（0 是 falsy）
    return "设置了: " + count;
  }
  return "默认值: 0"; // count=0 也会走到这里！
}

function setCountGood(count?: number): string {
  // ✅ 用 === undefined 精确判断
  if (count !== undefined) {
    return "设置了: " + count; // count=0 也能正确处理
  }
  return "默认值: 0";
}

console.log("setCountBad(0):", setCountBad(0), "（⚠️ 0 被当 falsy 排除）");
console.log("setCountGood(0):", setCountGood(0), "（✅ 正确处理 0）");

// ---- 6. 相等收窄 (=== / !== / switch) ----
console.log("\\n========== 6. 相等收窄 ==========");

type Status = "pending" | "success" | "error";

function handleStatus(status: Status): string {
  // === 相等收窄
  if (status === "pending") {
    return "等待中..."; // status 收窄为 "pending"
  }
  if (status === "success") {
    return "成功!"; // status 收窄为 "success"
  }
  // status 收窄为 "error"（只剩下这种可能）
  return "出错了!";
}

console.log("handleStatus('pending'):", handleStatus("pending"));
console.log("handleStatus('success'):", handleStatus("success"));
console.log("handleStatus('error'):", handleStatus("error"));

// switch 语句收窄
function describeValue(x: string | number | null): string {
  switch (x) {
    case null:
      return "空值"; // x: null
    case 0:
      return "零"; // x: 0（字面量类型）
    case "hello":
      return "你好"; // x: "hello"
    default:
      // x 收窄为 string | number（排除了以上分支）
      if (typeof x === "string") return "其他字符串: " + x;
      return "其他数字: " + x;
  }
}

console.log("describeValue(null):", describeValue(null));
console.log("describeValue(0):", describeValue(0));
console.log("describeValue('hello'):", describeValue("hello"));
console.log("describeValue('world'):", describeValue("world"));
console.log("describeValue(42):", describeValue(42));

// ---- 7. 综合演示：Guest | User | Admin 可辨识联合 ----
console.log("\\n========== 7. 综合演示：Guest | User | Admin ==========");

// 可辨识联合：用 kind 字段（字面量类型）作为判别式
interface Guest {
  kind: "guest"; // 字面量类型作为判别式
  sessionId: string;
}
interface Member {
  kind: "user";
  name: string;
  email: string;
  loginCount: number;
}
interface AdminUser {
  kind: "admin";
  name: string;
  email: string;
  permissions: string[];
  loginCount: number;
}

type Account = Guest | Member | AdminUser;

// 用相等收窄（=== 判别式）区分三种账户
function getDisplayName(acc: Account): string {
  if (acc.kind === "guest") {
    // acc 收窄为 Guest
    return "游客(" + acc.sessionId + ")";
  }
  if (acc.kind === "user") {
    // acc 收窄为 Member
    return acc.name + " (登录 " + acc.loginCount + " 次)";
  }
  // acc 收窄为 AdminUser
  return "管理员 " + acc.name + " (登录 " + acc.loginCount + " 次)";
}

// 用 in 守卫检查是否有 permissions 属性
function getPermissions(acc: Account): string {
  if ("permissions" in acc) {
    // acc 收窄为 AdminUser（只有 AdminUser 有 permissions）
    return acc.permissions.join(", ");
  }
  return "无特殊权限";
}

// 自定义类型守卫：判断是否为管理员
function isAdmin(acc: Account): acc is AdminUser {
  return acc.kind === "admin";
}

// 自定义类型守卫：判断是否为已登录用户（非游客）
function isLoggedIn(acc: Account): acc is Member | AdminUser {
  return acc.kind === "user" || acc.kind === "admin";
}

// 用自定义守卫检查权限
function canDelete(acc: Account): boolean {
  if (isAdmin(acc)) {
    // acc 收窄为 AdminUser
    return acc.permissions.includes("delete");
  }
  return false;
}

// 真值收窄：检查登录次数
function isActiveUser(acc: Account): boolean {
  if (isLoggedIn(acc)) {
    // acc 收窄为 Member | AdminUser
    // 真值收窄：loginCount > 0 为 truthy
    return acc.loginCount > 0;
  }
  return false; // 游客不算活跃用户
}

// 创建各种账户
const accounts: Account[] = [
  { kind: "guest", sessionId: "S001" },
  { kind: "user", name: "张三", email: "zs@test.com", loginCount: 15 },
  { kind: "admin", name: "李四", email: "ls@test.com", permissions: ["read", "write", "delete"], loginCount: 99 },
];

console.log("账户信息列表:");
accounts.forEach(function (acc) {
  console.log("  ---");
  console.log("  显示名:", getDisplayName(acc));
  console.log("  权限:", getPermissions(acc));
  console.log("  可删除:", canDelete(acc));
  console.log("  活跃用户:", isActiveUser(acc));
});

// ---- 8. 控制流分析演示 ----
console.log("\\n========== 8. 控制流分析演示 ==========");

// CFA：return 之后的代码自动排除已返回的类型
function cfaExample(x: string | number | null): string {
  if (typeof x === "string") {
    return "字符串: " + x.toUpperCase(); // x: string
  }
  if (x === null) {
    return "null"; // x: null
  }
  // 到这里，string 和 null 都已 return 掉
  // CFA 推断 x 只能是 number
  return "数字: " + x.toFixed(2); // x: number
}

console.log("cfaExample('hi'):", cfaExample("hi"));
console.log("cfaExample(null):", cfaExample(null));
console.log("cfaExample(3.14):", cfaExample(3.14));

// CFA 与赋值：赋值后变量类型被收窄
let val: string | number = "hello";
console.log("赋值 'hello' 后 typeof:", typeof val); // string
val = 42;
console.log("赋值 42 后 typeof:", typeof val); // number
val = "world";
console.log("再赋值 'world' 后 typeof:", typeof val); // string

// ---- 9. 收窄的局限演示 ----
console.log("\\n========== 9. 收窄的局限演示 ==========");

// 局限 1：闭包中的类型不会保留收窄
console.log("--- 闭包中的收窄局限 ---");
let outer: string | number = "hello";
if (typeof outer === "string") {
  // outer 在这里被收窄为 string
  // 但在 setTimeout 回调中，收窄不会保留（outer 可能被重新赋值）
  // 用 const 解决：const 变量不会被重新赋值，收窄会保留
  const snapshot = outer; // const 保证收窄结果保留到回调中
  setTimeout(function () {
    // snapshot 在回调中保持 string 类型
    console.log("闭包中 snapshot（const）:", snapshot.toUpperCase());
  }, 10);
}

// 局限 2：== null 同时收窄 null 和 undefined
console.log("--- == null 收窄 ---");
function trimValue(x: string | null | undefined): string {
  // == null 同时匹配 null 和 undefined（== 的少数推荐用法）
  if (x == null) {
    return "（空）"; // x: null | undefined
  }
  return x.trim(); // x: string
}
console.log("trimValue(null):", trimValue(null));
console.log("trimValue(undefined):", trimValue(undefined));
console.log("trimValue('  hi  '):", trimValue("  hi  "));

// 局限 3：类型断言会绕过收窄
console.log("--- 类型断言绕过收窄 ---");
let maybeNum: string | number = "hello";
if (typeof maybeNum === "string") {
  // maybeNum 收窄为 string
  console.log("收窄后 typeof:", typeof maybeNum); // string
  // 类型断言 as number 会让编译器以为它是 number，但运行时仍是 string
  const forced = maybeNum as unknown as number;
  console.log("断言为 number 后 typeof（运行时不变）:", typeof forced); // 仍是 string
}

// 等待 setTimeout 回调执行完毕
setTimeout(function () {
  console.log("\\n类型守卫与收窄章节演示完成！");
}, 50);`,
  },

  // =========================================================
  // 第二章：高级类型 (Advanced Types)
  // =========================================================
  {
    id: "ts-advanced-types",
    title: "高级类型",
    icon: "🧩",
    group: "进阶类型",
    content: `## 高级类型 (Advanced Types)

TypeScript 的类型系统不仅仅是"给变量加注解"——它本身是一门**图灵完备的类型级编程语言**。你可以在类型层面编写条件判断、循环（映射）、类型提取（infer）、字符串操作（模板字面量类型）等逻辑。这些高级类型特性让你能够以**零运行时成本**表达极其复杂的类型约束，是编写高质量 TypeScript 库和框架的必备技能。

本章将极其详细地讲解：条件类型（Conditional Types）、条件类型的分发（Distributive）、\`infer\` 关键字、映射类型（Mapped Types）、映射修饰符、模板字面量类型（Template Literal Types）、索引访问类型（Indexed Access Types）和 \`keyof\` 操作符。

**重要提醒**：本章涉及的大部分特性都是**纯编译期**的——它们在 TypeScript 转译为 JavaScript 后会被完全擦除。因此代码 demo 会用 \`typeof\` 验证运行时值的类型，并用注释和值赋值来证明编译期的类型计算结果。

### 条件类型 T extends U ? X : Y

条件类型是类型层面的 \`if-else\`。它根据一个类型是否 assignable to（可赋值给）另一个类型，选择两个类型之一作为结果。

#### 基本语法

\`\`\`ts
type IsString<T> = T extends string ? "是字符串" : "非字符串";  // 定义类型别名 IsString，泛型参数 T，条件类型

type A = IsString<"hello">;  // "是字符串"
type B = IsString<42>;       // "非字符串"
type C = IsString<string>;   // "是字符串"
type D = IsString<number>;   // "非字符串"
\`\`\`

\`T extends U ? X : Y\` 的含义是：如果 \`T\` 能赋值给 \`U\`（即 \`T\` 是 \`U\` 的子类型），则结果类型为 \`X\`，否则为 \`Y\`。

#### 条件类型的用途

条件类型常用于：
1. **类型判断**：判断一个类型是否为某种特定类型。
2. **类型提取**：配合 \`infer\` 从复杂类型中提取子类型。
3. **类型分发**：对联合类型逐个处理。
4. **工具类型实现**：TypeScript 内置的 \`Exclude\`、\`Extract\`、\`NonNullable\` 等都基于条件类型。

#### extends 的含义

在条件类型中，\`T extends U\` 不是"继承"的意思，而是"**T 是否可以赋值给 U**"（也叫"T 是 U 的子类型"）。这与 \`interface A extends B\` 中的 \`extends\` 含义不同。

\`\`\`ts
// "hello" 可以赋值给 string → true
type T1 = "hello" extends string ? true : false;  // true

// number 可以赋值给 string → false
type T2 = number extends string ? true : false;   // false

// string 可以赋值给 string | number → true
type T3 = string extends string | number ? true : false;  // true

// string | number 可以赋值给 string → false（联合类型不是 string 的子类型）
type T4 = (string | number) extends string ? true : false; // false
\`\`\`

#### 嵌套条件类型

条件类型可以嵌套，实现多路分支：

\`\`\`ts
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  T extends null ? "null" :
  "object";

type T1 = TypeName<"hello">;    // "string"
type T2 = TypeName<42>;         // "number"
type T3 = TypeName<true>;       // "boolean"
type T4 = TypeName<() => {}>;   // "function"
type T5 = TypeName<null>;       // "null"
type T6 = TypeName<{}>;         // "object"
\`\`\`

### 条件类型的分发 (Distributive Conditional Types)

当条件类型的类型参数 \`T\` 是**裸类型参数**（naked type parameter，即直接使用 \`T\`，没有被包裹），且 \`T\` 被传入一个**联合类型**时，条件类型会**分发**——即对联合类型的每个成员分别求值，再把结果联合起来。

#### 分发示例

\`\`\`ts
type ToArray<T> = T extends unknown ? T[] : never;  // 定义类型别名 ToArray，泛型参数 T，条件类型

// T 是裸类型参数，传入联合类型时分发
type R1 = ToArray<string>;              // string[]
type R2 = ToArray<string | number>;     // string[] | number[]（分发！）
type R3 = ToArray<string | number | boolean>; // string[] | number[] | boolean[]
\`\`\`

\`ToArray<string | number>\` 的计算过程：
1. 分发：\`ToArray<string> | ToArray<number>\`
2. 分别求值：\`string[] | number[]\`

结果是 \`string[] | number[]\`，**不是** \`(string | number)[]\`。这两者有本质区别：前者是"要么全是 string 的数组，要么全是 number 的数组"，后者是"string 和 number 混合的数组"。

#### 如何阻止分发

如果你**不想**分发，可以用元组把 \`T\` 包裹起来，使其不再是裸类型参数：

\`\`\`ts
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;  // 定义类型别名 ToArrayNonDist，泛型参数 T，条件类型

// T 被 [T] 包裹，不再分发
type R4 = ToArrayNonDist<string | number>;  // (string | number)[]（不分发！）
\`\`\`

\`[T] extends [unknown]\` 中，\`[T]\` 是一个单元素元组，\`T\` 不再是裸类型参数，因此不会分发。结果就是 \`(string | number)[]\`——string 和 number 混合的数组。

#### 分发的实际应用

分发特性在实现 \`Exclude\`、\`Extract\` 等工具类型时非常有用：

\`\`\`ts
// Exclude 的实现：从 T 中排除可赋值给 U 的成员
type MyExclude<T, U> = T extends U ? never : T;  // 定义类型别名 MyExclude，泛型参数 T, U，条件类型

// 分发：对 T 的每个成员判断是否 extends U
type R1 = MyExclude<"a" | "b" | "c", "a">;  // "b" | "c"
// 计算过程：
//   "a" extends "a" ? never : "a"  → never
//   "b" extends "a" ? never : "b"  → "b"
//   "c" extends "a" ? never : "c"  → "c"
//   结果：never | "b" | "c" → "b" | "c"（never 被吸收）
\`\`\`

#### 分发的规则总结

| 情况 | 是否分发 | 示例 |
| --- | --- | --- |
| \`T extends U ? X : Y\`（T 是裸参数） \| ✅ 分发 \| \`ToArray<A \| B>\` → \`ToArray<A> \| ToArray<B>\` |
| \`[T] extends [U] ? X : Y\`（T 被包裹） \| ❌ 不分发 \| \`ToArrayNonDist<A \| B>\` → \`(A \| B)[]\` |
| \`T extends string ? X : Y\`（T 是裸参数，U 是具体类型） \| ✅ 分发 \| \`IsString<A \| B>\` → \`IsString<A> \| IsString<B>\` |

### infer 关键字

\`infer\` 是条件类型中最强大的特性之一。它允许你在 \`extends\` 子句中**声明一个新的类型变量**，并让 TypeScript 自动推断它的类型。\`infer\` 通常用于从复杂类型（如函数类型、Promise、数组等）中**提取**子类型。

#### 基本语法

\`\`\`ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;  // 定义类型别名 MyReturnType，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）
\`\`\`

这里的 \`infer R\` 声明了一个类型变量 \`R\`，TypeScript 会尝试从 \`T\` 中匹配 \`(...args: any[]) => R\` 的模式，并把推断出的返回类型赋给 \`R\`。如果 \`T\` 是一个函数类型，\`R\` 就是它的返回类型；如果 \`T\` 不是函数类型，条件为 false，结果是 \`never\`。

#### 常见 infer 模式

**1. 提取函数返回类型（ReturnType 的实现）**

\`\`\`ts
type MyReturnType<T extends (...args: any) => any> =  // 箭头函数（注意：any 关闭了类型检查）
  T extends (...args: any) => infer R ? R : never;  // 箭头函数（注意：any 关闭了类型检查）

type R1 = MyReturnType<() => string>;        // string
type R2 = MyReturnType<() => number>;        // number
type R3 = MyReturnType<(x: number) => boolean>; // boolean
\`\`\`

**2. 提取函数参数类型（Parameters 的实现）**

\`\`\`ts
type MyParameters<T extends (...args: any) => any> =  // 箭头函数（注意：any 关闭了类型检查）
  T extends (...args: infer P) => any ? P : never;  // 箭头函数（注意：any 关闭了类型检查）

type P1 = MyParameters<(x: number, y: string) => void>;  // [number, string]
\`\`\`

**3. 提取函数第一个参数类型**

\`\`\`ts
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;  // 定义类型别名 FirstParam，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）

type F1 = FirstParam<(x: number, y: string) => void>;  // number
\`\`\`

**4. 提取 Promise 的值类型（Awaited 的简化版）**

\`\`\`ts
type UnboxPromise<T> = T extends Promise<infer V> ? V : T;  // 定义类型别名 UnboxPromise，泛型参数 T，使用 infer 在条件类型中提取类型

type U1 = UnboxPromise<Promise<number>>;   // number
type U2 = UnboxPromise<Promise<string>>;   // string
type U3 = UnboxPromise<number>;            // number（不是 Promise，原样返回）
\`\`\`

**5. 提取数组元素类型**

\`\`\`ts
type ElementOf<T> = T extends (infer E)[] ? E : never;  // 定义类型别名 ElementOf，泛型参数 T，使用 infer 在条件类型中提取类型

type E1 = ElementOf<string[]>;             // string
type E2 = ElementOf<number[]>;             // number
\`\`\`

**6. 提取构造函数的实例类型（InstanceType 的实现）**

\`\`\`ts
type MyInstanceType<T extends abstract new (...args: any) => any> =  // 箭头函数（注意：any 关闭了类型检查）
  T extends abstract new (...args: any) => infer R ? R : never;  // 箭头函数（注意：any 关闭了类型检查）

class MyClass { x = 1; }  // 定义类 MyClass
type I1 = MyInstanceType<typeof MyClass>;  // MyClass
\`\`\`

#### infer 的位置

\`infer\` 可以出现在 \`extends\` 子句的**任何位置**——参数位置、返回值位置、数组元素位置、Promise 值位置等。TypeScript 会根据位置自动推断。

\`\`\`ts
// infer 在参数位置
type GetParams<T> = T extends (...args: infer P) => any ? P : never;  // 定义类型别名 GetParams，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）

// infer 在返回值位置
type GetReturn<T> = T extends (...args: any) => infer R ? R : never;  // 定义类型别名 GetReturn，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）

// infer 在数组元素位置
type GetElement<T> = T extends (infer E)[] ? E : never;  // 定义类型别名 GetElement，泛型参数 T，使用 infer 在条件类型中提取类型

// infer 在 Promise 值位置
type GetPromiseValue<T> = T extends Promise<infer V> ? V : never;  // 定义类型别名 GetPromiseValue，泛型参数 T，使用 infer 在条件类型中提取类型

// infer 在模板字面量类型位置
type GetPrefix<S extends string> = S extends \`\${infer P}?\` ? P : never;  // 定义类型别名 GetPrefix，泛型参数 S extends string，使用 infer 在条件类型中提取类型
type P = GetPrefix<"isReady?">;  // "isReady"
\`\`\`

#### 多个 infer

一个条件类型可以有多个 \`infer\`：

\`\`\`ts
// 同时提取第一个参数和返回值
type FirstParamAndReturn<T> =
  T extends (first: infer F, ...rest: any[]) => infer R  // 箭头函数（注意：any 关闭了类型检查）
    ? { param: F; result: R }
    : never;

type FR = FirstParamAndReturn<(x: number, y: string) => boolean>;  // 定义类型别名 FR
// { param: number; result: boolean }
\`\`\`

### 映射类型 (Mapped Types)

映射类型让你基于一个已有类型**构造**一个新类型——遍历旧类型的所有键，对每个键的值类型做变换。它类似于 JavaScript 的 \`Array.map\`，但在类型层面操作。

#### 基本语法

\`\`\`ts
type MappedType<T> = {  // 定义类型别名 MappedType，泛型参数 T
  [K in keyof T]: NewType;
};
\`\`\`

\`[K in keyof T]\` 遍历 \`T\` 的所有键，\`K\` 是每个键（作为字面量类型），冒号后是新类型的值类型。

#### 自定义 ReadOnly

\`\`\`ts
type MyReadonly<T> = {  // 定义类型别名 MyReadonly，泛型参数 T
  readonly [K in keyof T]: T[K];
};

interface Point { x: number; y: number; }  // 定义接口 Point
type ReadonlyPoint = MyReadonly<Point>;  // 定义类型别名 ReadonlyPoint
// 等价于 { readonly x: number; readonly y: number; }
\`\`\`

\`T[K]\` 是**索引访问类型**——获取 \`T\` 中键 \`K\` 对应的值类型。

#### 自定义 Partial

\`\`\`ts
type MyPartial<T> = {  // 定义类型别名 MyPartial，泛型参数 T
  [K in keyof T]?: T[K];
};

interface Point { x: number; y: number; }  // 定义接口 Point
type PartialPoint = MyPartial<Point>;  // 定义类型别名 PartialPoint
// 等价于 { x?: number; y?: number; }
\`\`\`

#### 自定义 Nullable

\`\`\`ts
type MyNullable<T> = {  // 定义类型别名 MyNullable，泛型参数 T
  [K in keyof T]: T[K] | null;
};

interface User { name: string; age: number; }  // 定义接口 User
type NullableUser = MyNullable<User>;  // 定义类型别名 NullableUser
// 等价于 { name: string | null; age: number | null; }
\`\`\`

#### 值类型变换

映射类型不仅可以保留原值类型（\`T[K]\`），还可以对它做变换：

\`\`\`ts
// 把所有属性变成函数（getter 风格）
type Getters<T> = {  // 定义类型别名 Getters，泛型参数 T
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];  // 箭头函数（注意：类型断言会绕过类型检查）
};

interface Person { name: string; age: number; }  // 定义接口 Person
type PersonGetters = Getters<Person>;  // 定义类型别名 PersonGetters
// { getName: () => string; getAge: () => number; }
\`\`\`

### 映射修饰符 +/-

映射类型可以**添加或移除** \`readonly\` 和 \`?\` 修饰符，使用 \`+\`（添加）和 \`-\`（移除）前缀。

#### 添加修饰符（+ 可省略）

\`\`\`ts
// +readonly（可省略 +，简写为 readonly）
type AddReadonly<T> = { +readonly [K in keyof T]: T[K]; };  // 定义类型别名 AddReadonly，泛型参数 T，使用 keyof 取键的联合，映射类型
// 等同于 { readonly [K in keyof T]: T[K]; }

// +?（可省略 +，简写为 ?）
type AddOptional<T> = { [K in keyof T]+?: T[K]; };  // 定义类型别名 AddOptional，泛型参数 T，使用 keyof 取键的联合，映射类型
// 等同于 { [K in keyof T]?: T[K]; }
\`\`\`

#### 移除修饰符（- 不可省略）

\`\`\`ts
// -readonly：移除只读
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };  // 定义类型别名 Mutable，泛型参数 T，使用 keyof 取键的联合，映射类型

// -?：移除可选（Required 的实现）
type MyRequired<T> = { [K in keyof T]-?: T[K]; };  // 定义类型别名 MyRequired，泛型参数 T，使用 keyof 取键的联合，映射类型
\`\`\`

#### 修饰符示例

\`\`\`ts
interface Config {  // 定义接口 Config
  readonly host: string;  // 类属性 host: string
  readonly port: number;  // 类属性 port: number
  timeout?: number;
}

// 移除 readonly
type MutableConfig = Mutable<Config>;  // 定义类型别名 MutableConfig
// { host: string; port: number; timeout?: number; }（host/port 不再只读）

// 移除 ?
type RequiredConfig = MyRequired<Config>;  // 定义类型别名 RequiredConfig
// { readonly host: string; readonly port: number; timeout: number; }（timeout 不再可选）
\`\`\`

#### 修饰符对照表

| 操作 | 语法 | 效果 | 示例 |
| --- | --- | --- | --- |
| 添加 readonly | \`+readonly [K in keyof T]\` 或 \`readonly [K in keyof T]\` | 所有属性变只读 | \`Readonly<T>\` |
| 移除 readonly | \`-readonly [K in keyof T]\` | 所有属性变可写 | \`Mutable<T>\` |
| 添加可选 | \`[K in keyof T]+?\` 或 \`[K in keyof T]?\` | 所有属性变可选 | \`Partial<T>\` |
| 移除可选 | \`[K in keyof T]-?\` | 所有属性变必填 | \`Required<T>\` |

### 模板字面量类型 (Template Literal Types)

模板字面量类型让你在类型层面做字符串拼接——类似于 JavaScript 的模板字符串，但作用于类型。它可以将字符串字面量联合类型组合成新的字符串字面量联合类型。

#### 基本语法

\`\`\`ts
type EventName = "click" | "focus" | "blur";  // 定义类型别名 EventName
// 自动生成 "onClick" | "onFocus" | "onBlur"
type HandlerName = \`on\${Capitalize<EventName>}\`;  // 定义类型别名 HandlerName
\`\`\`

\`on\${Capitalize<EventName>}\` 会对联合类型 \`EventName\` 的每个成员分别拼接：
- \`on\${Capitalize<"click">}\` → \`"onClick"\`
- \`on\${Capitalize<"focus">}\` → \`"onFocus"\`
- \`on\${Capitalize<"blur">}\` → \`"onBlur"\`

结果：\`"onClick" | "onFocus" | "onBlur"\`。

#### 内置字符串操作类型

TypeScript 提供了四个内置的工具类型用于字符串变换（它们在编译期工作）：

| 工具类型 | 功能 | 示例 |
| --- | --- | --- |
| \`Uppercase<S>\` | 转大写 | \`Uppercase<"hello">\` → \`"HELLO"\` |
| \`Lowercase<S>\` | 转小写 | \`Lowercase<"HELLO">\` → \`"hello"\` |
| \`Capitalize<S>\` | 首字母大写 | \`Capitalize<"hello">\` → \`"Hello"\` |
| \`Uncapitalize<S>\` | 首字母小写 | \`Uncapitalize<"Hello">\` → \`"hello"\` |

#### 常见模板字面量类型模式

**1. Getter/Setter 名称生成**

\`\`\`ts
type PropName = "name" | "age";  // 定义类型别名 PropName
type Getters = \`get\${Capitalize<PropName>}\`;  // "getName" | "getAge"
type Setters = \`set\${Capitalize<PropName>}\`;  // "setName" | "setAge"
\`\`\`

**2. 事件处理器名称**

\`\`\`ts
type Event = "click" | "change" | "submit";  // 定义类型别名 Event
type EventHandler = \`on\${Capitalize<Event>}\`;  // "onClick" | "onChange" | "onSubmit"
\`\`\`

**3. CSS 属性名变换**

\`\`\`ts
type CSSProperty = "font-size" | "background-color";  // 定义类型别名 CSSProperty
// 把 kebab-case 转 camelCase
type CamelCase<S extends string> =
  S extends \`\${infer Head}-\${infer Tail}\`
    ? \`\${Head}\${Capitalize<CamelCase<Tail>>}\`
    : S;

type CSSCamel = CamelCase<CSSProperty>;  // "fontSize" | "backgroundColor"
\`\`\`

**4. 键重映射（Key Remapping）**

TypeScript 4.1+ 支持在映射类型中用 \`as\` 重映射键：

\`\`\`ts
type Getters<T> = {  // 定义类型别名 Getters，泛型参数 T
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];  // 箭头函数（注意：类型断言会绕过类型检查）
};

interface Point { x: number; y: number; }  // 定义接口 Point
type PointGetters = Getters<Point>;  // 定义类型别名 PointGetters
// { getX: () => number; getY: () => number; }
\`\`\`

#### 模板字面量类型与 infer

模板字面量类型可以配合 \`infer\` 做字符串模式匹配：

\`\`\`ts
// 提取前缀（? 前面的部分）
type GetPrefix<S extends string> = S extends \`\${infer P}?\` ? P : S;  // 定义类型别名 GetPrefix，泛型参数 S extends string，使用 infer 在条件类型中提取类型

type T1 = GetPrefix<"isReady?">;  // "isReady"
type T2 = GetPrefix<"name">;      // "name"（没有 ?，原样返回）

// 解析 "key=value" 格式
type ParseKV<S extends string> =
  S extends \`\${infer K}=\${infer V}\` ? { key: K; value: V } : never;

type KV = ParseKV<"name=张三">;  // { key: "name"; value: "张三" }
\`\`\`

### 索引访问类型 T[K]

索引访问类型让你从一个类型中按键取值——类似于 JavaScript 的 \`obj[key]\`，但作用于类型。

#### 基本用法

\`\`\`ts
interface Person {  // 定义接口 Person
  name: string;
  age: number;
  address: { city: string; zip: string };
}

type T1 = Person["name"];        // string
type T2 = Person["age"];         // number
type T3 = Person["address"];     // { city: string; zip: string }
\`\`\`

#### 用联合类型取多个值

\`\`\`ts
type T4 = Person["name" | "age"];  // string | number
\`\`\`

#### 嵌套索引

\`\`\`ts
type T5 = Person["address"]["city"];  // string
type T6 = Person["address"]["zip"];   // string
\`\`\`

#### 用 keyof 动态取值

\`\`\`ts
type T7 = Person[keyof Person];  // string | number | { city: string; zip: string }
\`\`\`

\`Person[keyof Person]\` 表示"Person 的所有值类型的联合"。

#### 数组的索引访问

\`\`\`ts
type T8 = string[]["length"];    // number（数组的 length 属性类型）
type T9 = string[][number];      // string（数组元素的类型）
\`\`\`

\`string[][number]\` 表示"用 number 类型作为索引访问 string[]"，即数组元素的类型 \`string\`。

### keyof 操作符

\`keyof\` 操作符获取一个类型的所有键，组成联合类型。

#### 基本用法

\`\`\`ts
interface Person {  // 定义接口 Person
  name: string;
  age: number;
  city: string;
}

type PersonKeys = keyof Person;  // "name" | "age" | "city"
\`\`\`

#### keyof 与索引访问配合

\`\`\`ts
type PersonValues = Person[keyof Person];  // string | number（所有值类型的联合）
\`\`\`

#### keyof 在映射类型中

\`keyof\` 最常见的用途是在映射类型中遍历键：

\`\`\`ts
type Clone<T> = { [K in keyof T]: T[K] };  // 复制 T 的结构
\`\`\`

#### keyof 对不同类型的结果

| 输入类型 | keyof 结果 |
| --- | --- |
| \`{ a: 1; b: 2 }\` \| \`"a" \| "b"\` |
| \`string[]\` \| \`"length" \| "push" \| "pop" | ... \| number\` |
| \`string\` \| \`"length" \| "charAt" \| "slice" | ...\`（String 接口的所有方法） |
| \`any\` \| \`string \| number \| symbol\` |
| \`never\` | \`never\` |

### typeof 操作符（类型上下文）

在类型上下文中，\`typeof v\` 获取一个**值**的类型。这与运行时的 \`typeof\` 运算符不同——运行时 \`typeof\` 返回字符串，类型上下文的 \`typeof\` 返回 TypeScript 类型。

\`\`\`ts
const config = { host: "localhost", port: 8080 };  // 声明常量 config
type Config = typeof config;  // { host: string; port: number }

let x = 10;  // 声明变量 x
type XType = typeof x;  // number
\`\`\`

\`typeof\` 常用于从现有值推断类型，避免重复定义接口。

### 高级类型的陷阱

#### 1. 全部在编译期擦除

条件类型、映射类型、infer、模板字面量类型**全部在编译期工作**，转译后的 JavaScript 没有任何类型信息。你无法在运行时检查一个值是否满足某个条件类型。

#### 2. 类型太复杂会降低可读性

高级类型可以写出非常"聪明"的代码，但也极难阅读和维护。在团队项目中，要平衡类型表达力和可读性。

#### 3. 错误信息难以理解

高级类型的类型错误信息通常非常长且难以理解，尤其是多层嵌套的条件类型。

#### 4. 性能问题

过于复杂的类型计算会拖慢编译速度。TypeScript 编译器对递归类型有深度限制。

#### 5. 模板字面量类型会爆炸

如果联合类型成员很多，模板字面量类型会产生**笛卡尔积**，导致类型爆炸：

\`\`\`ts
// 10 个前缀 × 10 个后缀 = 100 个组合
type Prefixes = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j";  // 定义类型别名 Prefixes
type Suffixes = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0";  // 定义类型别名 Suffixes
type Combined = \`\${Prefixes}\${Suffixes}\`;  // 100 个成员的联合类型！
\`\`\`

### 本节代码演示

下面演示条件类型、分布式条件类型、infer 提取、映射类型（自定义 ReadOnly/Partial/Nullable/Required/Mutable）、映射修饰符、模板字面量类型、索引访问类型、keyof。因为类型在运行时擦除，代码用 \`typeof\` 验证运行时值类型，并用值赋值和注释说明编译期的类型计算结果。`,
    code: `// ============================================================
// 第二章代码演示：高级类型全景
// ============================================================
// 注意：条件类型、映射类型、infer、模板字面量类型都是编译期
// 概念，转译后被擦除。本 demo 用 typeof 验证运行时值的类型，
// 并用值赋值和注释说明编译期的类型计算结果。
// ============================================================

// ---- 1. 条件类型 ----
console.log("========== 1. 条件类型 ==========");

// 条件类型：类型层面的 if-else
// 语法：T extends U ? X : Y
type IsString<T> = T extends string ? "是字符串" : "非字符串";

// 编译期计算结果（运行时擦除，但可用值证明）
type Check1 = IsString<"hello">;   // "是字符串"
type Check2 = IsString<42>;        // "非字符串"

// 用值证明：Check1 的类型是字面量 "是字符串"，只能赋这个值
const c1: Check1 = "是字符串";
const c2: Check2 = "非字符串";
console.log("IsString<'hello'> 的结果:", c1);
console.log("IsString<42> 的结果:", c2);

// 嵌套条件类型：实现类型名判断
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  T extends null ? "null" :
  "object";

// 用值证明各种类型名
const tn1: TypeName<"hello"> = "string";
const tn2: TypeName<42> = "number";
const tn3: TypeName<true> = "boolean";
const tn4: TypeName<null> = "null";
const tn5: TypeName<{}> = "object";
console.log("TypeName<'hello'>:", tn1);
console.log("TypeName<42>:", tn2);
console.log("TypeName<true>:", tn3);
console.log("TypeName<null>:", tn4);
console.log("TypeName<{}>:", tn5);

// ---- 2. 分布式条件类型 ----
console.log("\\n========== 2. 分布式条件类型 ==========");

// 裸类型参数 T：对联合类型分发
type ToArray<T> = T extends unknown ? T[] : never;

// ToArray<string | number> 分发为 string[] | number[]
type Arr1 = ToArray<string | number>;  // string[] | number[]
// 用值证明：可以是 number[] 或 string[]
const distributed: Arr1 = [1, 2, 3]; // 满足 number[]
console.log("ToArray<string|number> 分发结果接受 number[]:", distributed);

// 阻止分发：用 [T] 包裹
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
// 不分发：结果是 (string | number)[]
type Arr2 = ToArrayNonDist<string | number>;  // (string | number)[]
const mixed: Arr2 = [1, "hello", 2, "world"]; // 混合类型数组
console.log("ToArrayNonDist<string|number> 不分发结果接受混合数组:", mixed);

// 分发的实际应用：实现 Exclude
type MyExclude<T, U> = T extends U ? never : T;
type Excluded = MyExclude<"a" | "b" | "c", "a">;  // "b" | "c"
const exc1: Excluded = "b";
const exc2: Excluded = "c";
console.log("MyExclude<'a'|'b'|'c', 'a'> 的可能值:", exc1, "和", exc2);

// ---- 3. infer 关键字 ----
console.log("\\n========== 3. infer 关键字 ==========");

// 3.1 提取函数返回类型（ReturnType 的实现）
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

function fetchUser(): { name: string; age: number } {
  return { name: "张三", age: 30 };
}
function greet(name: string, age: number): string {
  return "你好 " + name + ", " + age + "岁";
}

type R1 = MyReturnType<typeof fetchUser>;  // { name: string; age: number }
type R2 = MyReturnType<typeof greet>;      // string

// 用值证明
const r1: R1 = { name: "李四", age: 25 };
const r2: R2 = "你好 王五, 20岁";
console.log("MyReturnType<typeof fetchUser> 是对象类型:", r1);
console.log("MyReturnType<typeof greet> 是 string 类型:", r2);

// 3.2 提取函数参数类型（Parameters 的实现）
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type P1 = MyParameters<typeof greet>;  // [string, number]
// P1 是元组类型 [string, number]，用值证明
const params: P1 = ["赵六", 40];
console.log("MyParameters<typeof greet> 是元组 [string, number]:", params);

// 3.3 提取函数第一个参数
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type FP1 = FirstParam<typeof greet>;  // string
const firstParam: FP1 = "钱七";
console.log("FirstParam<typeof greet> 是 string:", firstParam);

// 3.4 提取 Promise 的值类型
type UnboxPromise<T> = T extends Promise<infer V> ? V : T;
type U1 = UnboxPromise<Promise<number>>;   // number
type U2 = UnboxPromise<string>;            // string（非 Promise 原样返回）
const u1: U1 = 42;
const u2: U2 = "不是 Promise";
console.log("UnboxPromise<Promise<number>> 是 number:", u1);
console.log("UnboxPromise<string> 是 string:", u2);

// 3.5 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;
type E1 = ElementOf<string[]>;   // string
type E2 = ElementOf<number[]>;   // number
const e1: E1 = "元素";
const e2: E2 = 99;
console.log("ElementOf<string[]> 是 string:", e1);
console.log("ElementOf<number[]> 是 number:", e2);

// 3.6 多个 infer：同时提取第一个参数和返回值
type FirstParamAndReturn<T> =
  T extends (first: infer F, ...rest: any[]) => infer R
    ? { param: F; result: R }
    : never;

type FR = FirstParamAndReturn<typeof greet>;  // { param: string; result: string }
const fr: FR = { param: "孙八", result: "你好 孙八" };
console.log("FirstParamAndReturn 同时提取参数和返回值:", fr);

// ---- 4. 映射类型 ----
console.log("\\n========== 4. 映射类型 ==========");

// 4.1 自定义 Readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 4.2 自定义 Partial
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 4.3 自定义 Nullable
type MyNullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface Point {
  x: number;
  y: number;
}

type ReadonlyPoint = MyReadonly<Point>;
type PartialPoint = MyPartial<Point>;
type NullablePoint = MyNullable<Point>;

// 用值证明
const rp: ReadonlyPoint = { x: 1, y: 2 };
const pp: PartialPoint = { x: 1 };  // y 可选，可省略
const np: NullablePoint = { x: 1, y: null };  // y 可为 null

console.log("MyReadonly<Point>:", rp);
console.log("MyPartial<Point>（y 可省略）:", pp);
console.log("MyNullable<Point>（y 可为 null）:", np);

// 4.4 值类型变换：把所有属性变成 getter 函数
type Getters<T> = {
  [K in keyof T]: () => T[K];
};

type PointGetters = Getters<Point>;
// { x: () => number; y: () => number; }
const pointGetters: PointGetters = {
  x: function () { return 10; },
  y: function () { return 20; },
};
console.log("Getters<Point>.x():", pointGetters.x());
console.log("Getters<Point>.y():", pointGetters.y());

// ---- 5. 映射修饰符 + / - ----
console.log("\\n========== 5. 映射修饰符 ==========");

// -readonly：移除只读
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// -?：移除可选（Required 的实现）
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

interface Config {
  readonly host: string;
  readonly port: number;
  timeout?: number;
}

type MutableConfig = Mutable<Config>;
type RequiredConfig = MyRequired<Config>;

// Mutable 后属性可修改
const mc: MutableConfig = { host: "localhost", port: 8080, timeout: 5000 };
mc.host = "changed";  // Mutable 后 host 可修改
console.log("Mutable<Config> 修改 host 后:", mc);

// Required 后 timeout 必填
const rc: RequiredConfig = { host: "localhost", port: 8080, timeout: 5000 };
console.log("MyRequired<Config>（timeout 必填）:", rc);

// 同时移除 readonly 和可选
type FullyMutable<T> = {
  -readonly [K in keyof T]-?: T[K];
};
type FullyMutableConfig = FullyMutable<Config>;
const fmc: FullyMutableConfig = { host: "localhost", port: 8080, timeout: 3000 };
fmc.host = "newhost";
console.log("FullyMutable<Config>:", fmc);

// ---- 6. 模板字面量类型 ----
console.log("\\n========== 6. 模板字面量类型 ==========");

// 6.1 基本用法：生成事件处理器名称
type EventName = "click" | "focus" | "blur";
type HandlerName = \`on\${Capitalize<EventName>}\`;  // "onClick" | "onFocus" | "onBlur"

// 用 Record 验证生成的键
const handlers: Record<HandlerName, string> = {
  onClick: "点击处理函数",
  onFocus: "聚焦处理函数",
  onBlur: "失焦处理函数",
};
console.log("HandlerName 生成的键:", Object.keys(handlers));
console.log("handlers.onClick:", handlers.onClick);

// 6.2 Getter/Setter 名称生成
type PropName = "name" | "age";
type GetterNames = \`get\${Capitalize<PropName>}\`;  // "getName" | "getAge"
type SetterNames = \`set\${Capitalize<PropName>}\`;  // "setName" | "setAge"

const getterNames: GetterNames[] = ["getName", "getAge"];
const setterNames: SetterNames[] = ["setName", "setAge"];
console.log("GetterNames:", getterNames);
console.log("SetterNames:", setterNames);

// 6.3 键重映射（Key Remapping）：生成 getter 对象类型
type PropKeys = "x" | "y";
type CoordGetters = {
  [K in PropKeys as \`get\${Capitalize<K>}\`]: () => number;
};

const coordGetters: CoordGetters = {
  getX: function () { return 10; },
  getY: function () { return 20; },
};
console.log("CoordGetters 键:", Object.keys(coordGetters));
console.log("coordGetters.getX():", coordGetters.getX());
console.log("coordGetters.getY():", coordGetters.getY());

// 6.4 内置字符串操作类型
type Upper = Uppercase<"hello">;      // "HELLO"
type Lower = Lowercase<"HELLO">;      // "hello"
type Cap = Capitalize<"hello">;       // "Hello"
type Uncap = Uncapitalize<"Hello">;   // "hello"

const upper: Upper = "HELLO";
const lower: Lower = "hello";
const cap: Cap = "Hello";
const uncap: Uncap = "hello";
console.log("Uppercase<'hello'>:", upper);
console.log("Lowercase<'HELLO'>:", lower);
console.log("Capitalize<'hello'>:", cap);
console.log("Uncapitalize<'Hello'>:", uncap);

// 6.5 模板字面量类型与 infer：解析字符串
type ParseKV<S extends string> =
  S extends \`\${infer K}=\${infer V}\` ? { key: K; value: V } : never;

type KV1 = ParseKV<"name=张三">;   // { key: "name"; value: "张三" }
type KV2 = ParseKV<"age=30">;      // { key: "age"; value: "30" }

const kv1: KV1 = { key: "name", value: "张三" };
const kv2: KV2 = { key: "age", value: "30" };
console.log("ParseKV<'name=张三'>:", kv1);
console.log("ParseKV<'age=30'>:", kv2);

// ---- 7. 索引访问类型 ----
console.log("\\n========== 7. 索引访问类型 ==========");

interface Person {
  name: string;
  age: number;
  address: {
    city: string;
    zip: string;
  };
}

// 基本索引访问
type PersonName = Person["name"];        // string
type PersonAge = Person["age"];          // number
type PersonAddress = Person["address"];  // { city: string; zip: string }

// 嵌套索引
type PersonCity = Person["address"]["city"];  // string
type PersonZip = Person["address"]["zip"];    // string

// 联合键索引
type NameOrAge = Person["name" | "age"];  // string | number

// keyof + 索引访问：获取所有值类型的联合
type AllPersonValues = Person[keyof Person];  // string | number | { city: string; zip: string }

// 用值证明
const personName: PersonName = "张三";
const personAge: PersonAge = 30;
const personCity: PersonCity = "北京";
const personZip: PersonZip = "100000";
const nameOrAge: NameOrAge = "可以是字符串";
const nameOrAge2: NameOrAge = 42;  // 也可以是数字

console.log("Person['name']:", personName);
console.log("Person['age']:", personAge);
console.log("Person['address']['city']:", personCity);
console.log("Person['address']['zip']:", personZip);
console.log("Person['name'|'age'] 可以是 string 或 number:", nameOrAge, ",", nameOrAge2);

// ---- 8. keyof 操作符 ----
console.log("\\n========== 8. keyof 操作符 ==========");

interface Product {
  id: number;
  name: string;
  price: number;
}

// keyof 获取所有键的联合类型
type ProductKeys = keyof Product;  // "id" | "name" | "price"

// 用值证明
const pk1: ProductKeys = "id";
const pk2: ProductKeys = "name";
const pk3: ProductKeys = "price";
console.log("keyof Product 的成员:", pk1, ",", pk2, ",", pk3);

// keyof 在映射类型中的应用：复制类型结构
type Clone<T> = { [K in keyof T]: T[K] };
type ClonedProduct = Clone<Product>;
const cloned: ClonedProduct = { id: 1, name: "商品", price: 99.9 };
console.log("Clone<Product>:", cloned);

// keyof + 索引访问：所有值类型的联合
type ProductValueTypes = Product[keyof Product];  // number | string
const pvt1: ProductValueTypes = 1;
const pvt2: ProductValueTypes = "字符串值";
console.log("Product[keyof Product] 可以是 number 或 string:", pvt1, ",", pvt2);

// ---- 9. typeof 在类型上下文 ----
console.log("\\n========== 9. typeof 在类型上下文 ==========");

// typeof 获取值的类型（类型上下文，与运行时 typeof 不同）
const configValue = { host: "localhost", port: 8080, debug: true };
type ConfigFromValue = typeof configValue;  // { host: string; port: number; debug: boolean }

// 用这个类型创建新变量
const anotherConfig: ConfigFromValue = { host: "example.com", port: 443, debug: false };
console.log("typeof configValue 推断的类型:", anotherConfig);

// 运行时 typeof 返回字符串（与类型上下文的 typeof 对比）
console.log("运行时 typeof configValue:", typeof configValue);  // "object"
console.log("运行时 typeof configValue.host:", typeof configValue.host);  // "string"

console.log("\\n高级类型章节演示完成！");`,
  },

  // =========================================================
  // 第三章：工具类型 (Utility Types)
  // =========================================================
  {
    id: "ts-utility-types",
    title: "工具类型 (Utility Types)",
    icon: "🛠️",
    group: "进阶类型",
    content: `## 工具类型 (Utility Types)

工具类型（Utility Types）是 TypeScript 内置的、用于类型变换的**通用模板**。它们就像是类型层面的"工具函数"——接收一个或多个类型作为"参数"，返回一个新类型。掌握了工具类型，你就能用极少的代码表达复杂的类型变换，避免重复定义大量结构相似的 interface。

TypeScript 内置了十几个常用的工具类型，本章将**逐一详细讲解每一个**，包括 \`Partial\`、\`Required\`、\`Readonly\`、\`Record\`、\`Pick\`、\`Omit\`、\`Exclude\`、\`Extract\`、\`NonNullable\`、\`Parameters\`、\`ReturnType\`、\`ConstructorParameters\`、\`InstanceType\`、\`Awaited\` 以及 \`Uppercase/Lowercase/Capitalize/Uncapitalize\`，最后还会讲解如何编写自定义工具类型。

**重要提醒**：所有工具类型都是**编译期**的——它们在转译后完全消失。代码 demo 会用 \`typeof\` 验证运行时值的类型，并通过值赋值和注释说明编译期的类型变换结果。

### 为什么需要工具类型

在实际开发中，你经常需要基于一个已有类型派生出新类型。比如：
- 有一个 \`User\` 接口，需要一个 \`UpdateUser\` 类型（所有字段可选）来表示"部分更新"。
- 有一个 \`User\` 接口，需要一个 \`UserSummary\` 类型（只包含 name 和 email）。
- 有一个 \`User\` 接口，需要一个 \`UserWithoutId\` 类型（排除 id 字段）。

如果没有工具类型，你需要手动重新定义这些接口，导致大量重复代码，且 \`User\` 改动时容易忘记同步修改。

\`\`\`ts
// ❌ 不用工具类型：重复定义，容易不同步
interface User { id: number; name: string; email: string; age: number; }  // 定义接口 User
interface UpdateUser { id?: number; name?: string; email?: string; age?: number; }  // 定义接口 UpdateUser
interface UserSummary { name: string; email: string; }  // 定义接口 UserSummary
interface UserWithoutId { name: string; email: string; age: number; }  // 定义接口 UserWithoutId

// ✅ 用工具类型：一行搞定，自动同步
type UpdateUser = Partial<User>;  // 定义类型别名 UpdateUser
type UserSummary = Pick<User, "name" | "email">;  // 定义类型别名 UserSummary，联合类型
type UserWithoutId = Omit<User, "id">;  // 定义类型别名 UserWithoutId
\`\`\`

### Partial<T>：所有属性变可选

\`Partial<T>\` 把类型 \`T\` 的所有属性变成**可选的**（加 \`?\`）。

#### 实现

\`\`\`ts
type Partial<T> = {  // 定义类型别名 Partial，泛型参数 T
  [K in keyof T]?: T[K];
};
\`\`\`

#### 示例

\`\`\`ts
interface User {  // 定义接口 User
  id: number;
  name: string;
  email: string;
  age: number;
}

type PartialUser = Partial<User>;  // 定义类型别名 PartialUser
// 等价于 { id?: number; name?: string; email?: string; age?: number; }

// Partial 最常见的用途：表示"部分更新"
function updateUser(id: number, updates: Partial<User>): void {  // 定义函数 updateUser，参数: id: number, updates: Partial<User>，返回 void
  // updates 中每个字段都是可选的，可以只传需要更新的字段
}
updateUser(1, { name: "新名字" });           // ✅ 只更新 name
updateUser(1, { name: "新名字", age: 31 });  // ✅ 更新多个字段
updateUser(1, {});                            // ✅ 啥也不更新
\`\`\`

#### Partial 的实际场景

1. **PATCH 请求体**：RESTful API 的 PATCH 请求只传需要更新的字段。
2. **配置合并**：默认配置 + 用户自定义配置（部分覆盖）。
3. **表单状态**：表单填写过程中，部分字段可能还没填。
4. **对象构造**：分步骤构建大对象。

### Required<T>：所有属性变必填

\`Required<T>\` 把类型 \`T\` 的所有属性变成**必填的**（移除 \`?\`），是 \`Partial\` 的反操作。

#### 实现

\`\`\`ts
type Required<T> = {  // 定义类型别名 Required，泛型参数 T
  [K in keyof T]-?: T[K];
};
\`\`\`

注意 \`-?\` 修饰符——它移除可选标记。

#### 示例

\`\`\`ts
interface OptionalUser {  // 定义接口 OptionalUser
  id?: number;
  name?: string;
  email?: string;
}

type RequiredUser = Required<OptionalUser>;  // 定义类型别名 RequiredUser
// 等价于 { id: number; name: string; email: string; }（全部必填）

const u: RequiredUser = { id: 1, name: "张三", email: "zs@test.com" }; // ✅
// const u2: RequiredUser = { id: 1 }; // ❌ name 和 email 必填
\`\`\`

### Readonly<T>：所有属性变只读

\`Readonly<T>\` 把类型 \`T\` 的所有属性变成**只读的**（加 \`readonly\`）。

#### 实现

\`\`\`ts
type Readonly<T> = {  // 定义类型别名 Readonly，泛型参数 T
  readonly [K in keyof T]: T[K];
};
\`\`\`

#### 示例

\`\`\`ts
interface MutablePoint {  // 定义接口 MutablePoint
  x: number;
  y: number;
}

type Point = Readonly<MutablePoint>;  // 定义类型别名 Point
// 等价于 { readonly x: number; readonly y: number; }

const p: Point = { x: 1, y: 2 };  // 声明常量 p，类型 Point
// p.x = 3;  // ❌ TS 报错：readonly 属性不能赋值
\`\`\

#### Readonly 的陷阱

1. **只读是浅层的**：\`Readonly\` 只让第一层属性只读，嵌套对象仍可修改。

\`\`\`ts
interface Config { options: { a: number; b: number } }
type ReadonlyConfig = Readonly<Config>;

const c: ReadonlyConfig = { options: { a: 1, b: 2 } };
// c.options = { a: 3, b: 4 };  // ❌ readonly
c.options.a = 3;  // ✅ 仍可修改！（嵌套对象不是 readonly）
\`\`\`

要实现深层只读，需要递归的 \`DeepReadonly\`。

2. **运行时仍可修改**：\`readonly\` 只是编译期标记，运行时用 \`Object.defineProperty\` 或直接赋值仍可修改。

### Record<K, T>：构造键值对类型

\`Record<K, T>\` 构造一个类型，其键为 \`K\`（通常是字符串字面量联合类型），值为 \`T\`。

#### 实现

\`\`\`ts
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
\`\`\

#### 示例

\`\`\`ts
// 键为字符串字面量联合，值为 string
type Theme = "light" | "dark" | "auto";  // 定义类型别名 Theme
type ThemeLabels = Record<Theme, string>;  // 定义类型别名 ThemeLabels
// 等价于 { light: string; dark: string; auto: string; }

const labels: ThemeLabels = {  // 声明常量 labels，类型 ThemeLabels
  light: "浅色主题",
  dark: "深色主题",
  auto: "跟随系统",
};

// 键为 string，值为 number
type StringToNumber = Record<string, number>;  // 定义类型别名 StringToNumber
const dict: StringToNumber = { one: 1, two: 2, three: 3 };  // 声明常量 dict，类型 StringToNumber

// 键为联合类型
type UserRole = "admin" | "user" | "guest";  // 定义类型别名 UserRole
type RolePermissions = Record<UserRole, string[]>;  // 定义类型别名 RolePermissions

const permissions: RolePermissions = {  // 声明常量 permissions，类型 RolePermissions
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
};
\`\`\`

#### Record 的常见用途

1. **枚举值到标签的映射**：\`Record<Status, string>\`。
2. **字典/哈希表**：\`Record<string, T>\`。
3. **配置对象**：\`Record<Env, Config>\`。
4. **确保所有情况都被覆盖**：如果 \`K\` 是联合类型，\`Record\` 要求每个键都必须有值，起到穷尽检查的作用。

### Pick<T, K>：挑选部分属性

\`Pick<T, K>\` 从类型 \`T\` 中挑选一组属性 \`K\`（键的子集），构造一个新类型。

#### 实现

\`\`\`ts
type Pick<T, K extends keyof T> = {  // 定义类型别名 Pick，泛型参数 T, K extends keyof T
  [P in K]: T[P];
};
\`\`\`

#### 示例

\`\`\`ts
interface User {  // 定义接口 User
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
}

// 挑选 name 和 email
type UserSummary = Pick<User, "name" | "email">;  // 定义类型别名 UserSummary，联合类型
// 等价于 { name: string; email: string; }

const summary: UserSummary = { name: "张三", email: "zs@test.com" };  // 声明常量 summary，类型 UserSummary

// 挑选单个属性
type UserId = Pick<User, "id">;  // 定义类型别名 UserId
// 等价于 { id: number; }
\`\`\`

#### Pick 的常见用途

1. **DTO（数据传输对象）**：从完整实体中挑选部分字段返回给前端。
2. **视图模型**：挑选需要显示的字段。
3. **表单字段**：挑选可编辑的字段。

### Omit<T, K>：排除部分属性

\`Omit<T, K>\` 从类型 \`T\` 中**排除**一组属性 \`K\`，构造一个新类型。它是 \`Pick\` 的反向操作。

#### 实现

\`\`\`ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;  // 定义类型别名 Omit，泛型参数 T, K extends keyof any，使用 keyof 取键的联合（注意：any 关闭了类型检查）
\`\`\`

\`Omit\` 的实现是先从 \`keyof T\` 中排除 \`K\`，再 \`Pick\` 剩下的键。

#### 示例

\`\`\`ts
interface User {  // 定义接口 User
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
}

// 排除 id（创建用户时不传 id，由后端生成）
type CreateUserDTO = Omit<User, "id">;  // 定义类型别名 CreateUserDTO
// 等价于 { name: string; email: string; age: number; role: string; }

const newUser: CreateUserDTO = { name: "张三", email: "zs@test.com", age: 30, role: "user" };  // 声明常量 newUser，类型 CreateUserDTO

// 排除多个属性
type UserPreview = Omit<User, "id" | "age" | "role">;  // 定义类型别名 UserPreview，联合类型
// 等价于 { name: string; email: string; }
\`\`\`

#### Pick vs Omit

| 特性 | \`Pick<T, K>\` | \`Omit<T, K>\` |
| --- | --- | --- |
| 方向 | 保留 K 指定的属性 | 排除 K 指定的属性 |
| K 的含义 | 要保留的键 | 要排除的键 |
| 约束 | \`K extends keyof T\` | \`K extends keyof any\`（更宽松） |
| 适合场景 | 属性少，挑选几个 | 属性多，排除几个 |

经验法则：如果要保留的属性比要排除的少，用 \`Pick\`；反之用 \`Omit\`。

### Exclude<T, U>：从联合类型中排除

\`Exclude<T, U>\` 从联合类型 \`T\` 中排除所有可赋值给 \`U\` 的成员。

#### 实现

\`\`\`ts
type Exclude<T, U> = T extends U ? never : T;  // 定义类型别名 Exclude，泛型参数 T, U，条件类型
\`\`\`

这利用了条件类型的**分发特性**——对 \`T\` 的每个成员判断是否 extends \`U\`，如果是则返回 \`never\`（被吸收），否则返回该成员。

#### 示例

\`\`\`ts
type T1 = Exclude<"a" | "b" | "c" | "d", "a" | "c">;  // "b" | "d"
type T2 = Exclude<string | number | boolean, string>;  // number | boolean
type T3 = Exclude<string | number | null | undefined, null | undefined>;  // string | number
\`\`\`

#### Exclude 的常见用途

1. **过滤联合类型**：从一个大联合中排除不想要的成员。
2. **\`Omit\` 的底层实现**：\`Omit\` 用 \`Exclude\` 排除键。
3. **\`NonNullable\` 的底层实现**：\`NonNullable<T> = Exclude<T, null | undefined>\`。

### Extract<T, U>：从联合类型中提取

\`Extract<T, U>\` 从联合类型 \`T\` 中提取所有可赋值给 \`U\` 的成员。是 \`Exclude\` 的反操作。

#### 实现

\`\`\`ts
type Extract<T, U> = T extends U ? T : never;  // 定义类型别名 Extract，泛型参数 T, U，条件类型
\`\`\`

#### 示例

\`\`\`ts
type T1 = Extract<"a" | "b" | "c" | "d", "a" | "c">;  // "a" | "c"
type T2 = Extract<string | number | boolean, string>;  // string
type T3 = Extract<"a" | 1 | "b" | 2, string>;  // "a" | "b"（提取字符串成员）
\`\`\`

#### Exclude vs Extract

| 特性 | \`Exclude<T, U>\` | \`Extract<T, U>\` |
| --- | --- | --- |
| 方向 | 排除可赋值给 U 的 | 提取可赋值给 U 的 |
| 条件 | \`T extends U ? never : T\` | \`T extends U ? T : never\` |
| 关系 | 互补 | 互补 |

\`Exclude<T, U>\` 的结果 + \`Extract<T, U>\` 的结果 = 原始的 \`T\`（在类型层面）。

### NonNullable<T>：排除 null 和 undefined

\`NonNullable<T>\` 从类型 \`T\` 中排除 \`null\` 和 \`undefined\`。

#### 实现

\`\`\`ts
type NonNullable<T> = T extends null | undefined ? never : T;  // 定义类型别名 NonNullable，泛型参数 T，联合类型，条件类型
// 等价于 Exclude<T, null | undefined>
\`\`\`

#### 示例

\`\`\`ts
type T1 = NonNullable<string | null>;           // string
type T2 = NonNullable<string | null | undefined>; // string
type T3 = NonNullable<number | null>;           // number
type T4 = NonNullable<null | undefined>;        // never
\`\`\

#### NonNullable 的常见用途

1. **解包可能为 null 的值**：从 API 响应中排除 null。
2. **函数参数预处理**：确保传入的值不为空。

### Parameters<T>：获取函数参数类型

\`Parameters<T>\` 获取函数类型 \`T\` 的参数类型，返回一个**元组类型**。

#### 实现

\`\`\`ts
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
\`\`\`

#### 示例

\`\`\`ts
function greet(name: string, age: number): string { return ""; }

type GreetParams = Parameters<typeof greet>;  // [string, number]

const params: GreetParams = ["张三", 30];

// 从函数类型字面量获取
type F = (x: number, y: string, z: boolean) => void;
type FParams = Parameters<F>;  // [number, string, boolean]
\`\`\`

### ReturnType<T>：获取函数返回类型

\`ReturnType<T>\` 获取函数类型 \`T\` 的返回值类型。

#### 实现

\`\`\`ts
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;
\`\`\

#### 示例

\`\`\`ts
function getUser() { return { name: "张三", age: 30 }; }  // 定义函数 getUser

type User = ReturnType<typeof getUser>;  // { name: string; age: number }

const u: User = { name: "李四", age: 25 };  // 声明常量 u，类型 User

// 从箭头函数推断
const fn = (x: number) => x * 2;  // 声明常量 fn
type Result = ReturnType<typeof fn>;  // number
\`\`\

#### ReturnType 的常见用途

1. **从函数推断类型**：不想手动写接口，直接从函数返回值推断。
2. **泛型工厂模式**：根据工厂函数的返回类型创建变量。
3. **React 的 useState**：\`ReturnType<typeof useState<T>>\` 推断 state 类型。

### ConstructorParameters<T>：获取构造函数参数类型

\`ConstructorParameters<T>\` 获取构造函数类型 \`T\` 的参数类型，返回一个元组类型。

#### 实现

\`\`\`ts
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;
\`\`\`

#### 示例

\`\`\`ts
class Point {
  constructor(public x: number, public y: number) {}
}

type PointCtorParams = ConstructorParameters<typeof Point>;  // [number, number]
const params: PointCtorParams = [1, 2];

// Date 构造函数的参数
type DateCtorParams = ConstructorParameters<typeof Date>;
// [(value: number | string | Date)?]
\`\`\`

### InstanceType<T>：获取构造函数的实例类型

\`InstanceType<T>\` 获取构造函数类型 \`T\` 的实例类型。

#### 实现

\`\`\`ts
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;
\`\`\`

#### 示例

\`\`\`ts
class Point {
  constructor(public x: number, public y: number) {}
  distance() { return Math.sqrt(this.x * this.x + this.y * this.y); }
}

type PointInstance = InstanceType<typeof Point>;  // Point
const p: PointInstance = new Point(3, 4);
console.log(p.distance());  // 5
\`\`\

### Awaited<T>：解包 Promise

\`Awaited<T>\` 递归地解包 \`Promise\` 类型，获取最终的值类型。它能处理嵌套的 \`Promise<Promise<T>>\`。

#### 实现（简化版）

\`\`\`ts
type Awaited<T> =
  T extends null | undefined
    ? T
    : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }  // 注意：any 关闭了类型检查
      ? F extends (value: infer V, ...args: infer _) => any  // 箭头函数（注意：any 关闭了类型检查）
        ? Awaited<V>
        : never
      : T;
\`\`\

#### 示例

\`\`\`ts
type T1 = Awaited<Promise<string>>;        // string
type T2 = Awaited<Promise<Promise<number>>>; // number（递归解包）
type T3 = Awaited<string | Promise<number>>; // string | number
type T4 = Awaited<number>;                  // number（非 Promise 原样返回）
\`\`\

#### Awaited 的常见用途

1. **async 函数返回类型推断**：\`async function\` 的返回类型是 \`Promise<T>\`，用 \`Awaited\` 获取 \`T\`。
2. **处理 \`Promise.all\` 的结果**。
3. **类型库的递归解包**。

### Uppercase / Lowercase / Capitalize / Uncapitalize

这四个工具类型对**字符串字面量类型**做大小写变换。它们在编译期工作。

| 工具类型 | 功能 | 示例 |
| --- | --- | --- |
| \`Uppercase<S>\` | 转大写 | \`Uppercase<"hello">\` → \`"HELLO"\` |
| \`Lowercase<S>\` | 转小写 | \`Lowercase<"HELLO">\` → \`"hello"\` |
| \`Capitalize<S>\` | 首字母大写 | \`Capitalize<"hello">\` → \`"Hello"\` |
| \`Uncapitalize<S>\` | 首字母小写 | \`Uncapitalize<"Hello">\` → \`"hello"\` |

#### 示例

\`\`\`ts
type Upper = Uppercase<"hello">;  // "HELLO"
type Lower = Lowercase<"WORLD">;  // "world"
type Cap = Capitalize<"foo">;     // "Foo"
type Uncap = Uncapitalize<"Bar">; // "bar"

// 对联合类型，每个成员分别变换
type Events = "click" | "focus";  // 定义类型别名 Events
type OnEvents = \`on\${Capitalize<Events>}\`;  // "onClick" | "onFocus"
type UpperEvents = Uppercase<Events>;  // "CLICK" | "FOCUS"
\`\`\

### 自定义工具类型实战

掌握了内置工具类型后，你可以组合它们编写自己的工具类型。

#### 1. DeepPartial：深层 Partial

\`\`\`ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Config {
  server: { host: string; port: number };
  db: { url: string; timeout: number };
}

type PartialConfig = DeepPartial<Config>;
// { server?: { host?: string; port?: number }; db?: { url?: string; timeout?: number } }
\`\`\

#### 2. DeepReadonly：深层 Readonly

\`\`\`ts
type DeepReadonly<T> = {  // 定义类型别名 DeepReadonly，泛型参数 T
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
\`\`\

#### 3. Mutable：移除 readonly（与 Required 类似）

\`\`\`ts
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };
\`\`\

#### 4. Get：安全嵌套属性访问

\`\`\`ts
type Get<T, K extends string> =
  K extends \`\${infer First}.\${infer Rest}\`
    ? First extends keyof T
      ? Get<T[First], Rest>
      : never
    : K extends keyof T
      ? T[K]
      : never;

interface State { user: { profile: { name: string } } }  // 定义接口 State
type UserName = Get<State, "user.profile.name">;  // string
\`\`\

#### 5. PickByValueType：按值类型挑选属性

\`\`\`ts
type PickByValueType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

interface Mixed { id: number; name: string; age: number; email: string; }
type StringProps = PickByValueType<Mixed, string>;
// { name: string; email: string; }
\`\`\

### 工具类型总结表

| 工具类型 | 功能 | 输入 | 输出 |
| --- | --- | --- | --- |
| \`Partial<T>\` | 所有属性变可选 | 对象类型 | 同结构，属性全可选 |
| \`Required<T>\` | 所有属性变必填 | 对象类型 | 同结构，属性全必填 |
| \`Readonly<T>\` | 所有属性变只读 | 对象类型 | 同结构，属性全只读 |
| \`Record<K, T>\` | 构造键值对 | 键类型 K, 值类型 T | { [P in K]: T } |
| \`Pick<T, K>\` | 挑选属性 | 对象 T, 键 K | 只含 K 指定属性 |
| \`Omit<T, K>\` | 排除属性 | 对象 T, 键 K | 不含 K 指定属性 |
| \`Exclude<T, U>\` | 排除联合成员 | 联合 T, 类型 U | T 中不赋值给 U 的成员 |
| \`Extract<T, U>\` | 提取联合成员 | 联合 T, 类型 U | T 中赋值给 U 的成员 |
| \`NonNullable<T>\` | 排除 null/undefined | T | T 去掉 null/undefined |
| \`Parameters<T>\` | 函数参数元组 | 函数类型 | 参数元组 |
| \`ReturnType<T>\` | 函数返回类型 | 函数类型 | 返回值类型 |
| \`ConstructorParameters<T>\` | 构造函数参数元组 | 构造函数类型 | 参数元组 |
| \`InstanceType<T>\` | 构造函数实例类型 | 构造函数类型 | 实例类型 |
| \`Awaited<T>\` | 解包 Promise | Promise 类型 | 内部值类型 |
| \`Uppercase<S>\` | 转大写 | 字符串字面量 | 大写字面量 |
| \`Lowercase<S>\` | 转小写 | 字符串字面量 | 小写字面量 |
| \`Capitalize<S>\` | 首字母大写 | 字符串字面量 | 首字母大写 |
| \`Uncapitalize<S>\` | 首字母小写 | 字符串字面量 | 首字母小写 |

### 本节代码演示

下面定义一个 \`User\` 接口，演示 \`Partial\`、\`Required\`、\`Readonly\`、\`Record\`、\`Pick\`、\`Omit\`、\`Exclude\`、\`Extract\`、\`NonNullable\`、\`Parameters\`、\`ReturnType\`、\`ConstructorParameters\`、\`InstanceType\`、\`Awaited\` 和字符串变换工具类型，以及自定义工具类型 \`DeepPartial\` 和 \`Mutable\`。代码可直接运行。`,
    code: `// ============================================================
// 第三章代码演示：工具类型全景
// ============================================================
// 注意：所有工具类型都是编译期的，转译后被擦除。本 demo 用
// typeof 验证运行时值类型，并用值赋值和注释说明编译期的
// 类型变换结果。
// ============================================================

// 定义一个贯穿全章的 User 接口
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
}

// ---- 1. Partial<T>：所有属性变可选 ----
console.log("========== 1. Partial<T> ==========");

type PartialUser = Partial<User>;
// 等价于 { id?: number; name?: string; email?: string; age?: number; role?: string; }

// Partial 最常见的用途：表示"部分更新"（PATCH 请求体）
function updateUser(id: number, updates: PartialUser): string {
  // updates 中每个字段都是可选的
  const fields: string[] = [];
  if (updates.name !== undefined) fields.push("name=" + updates.name);
  if (updates.age !== undefined) fields.push("age=" + updates.age);
  if (updates.email !== undefined) fields.push("email=" + updates.email);
  if (fields.length === 0) return "用户 " + id + " 无更新";
  return "用户 " + id + " 更新: " + fields.join(", ");
}

console.log(updateUser(1, { name: "新名字" }));               // 只更新 name
console.log(updateUser(1, { name: "新名字", age: 31 }));      // 更新多个字段
console.log(updateUser(1, {}));                                // 空对象

// ---- 2. Required<T>：所有属性变必填 ----
console.log("\\n========== 2. Required<T> ==========");

interface OptionalConfig {
  host?: string;
  port?: number;
  debug?: boolean;
}

type RequiredConfig = Required<OptionalConfig>;
// 等价于 { host: string; port: number; debug: boolean; }（全部必填）

// Required 后所有字段必须提供
const requiredCfg: RequiredConfig = { host: "localhost", port: 8080, debug: true };
console.log("Required<OptionalConfig>:", requiredCfg);

// ---- 3. Readonly<T>：所有属性变只读 ----
console.log("\\n========== 3. Readonly<T> ==========");

type ReadonlyUser = Readonly<User>;
// 等价于 { readonly id: number; readonly name: string; ... }

const readonlyUser: ReadonlyUser = { id: 1, name: "张三", email: "zs@test.com", age: 30, role: "user" };
// readonlyUser.name = "李四";  // ❌ TS 报错：readonly（但运行时不报错）
console.log("Readonly<User>:", readonlyUser);

// Readonly 的陷阱：只读是浅层的
interface NestedConfig {
  server: { host: string; port: number };
}
type ReadonlyNested = Readonly<NestedConfig>;
const rn: ReadonlyNested = { server: { host: "localhost", port: 8080 } };
// rn.server = { host: "new", port: 9090 };  // ❌ readonly
rn.server.host = "changed";  // ✅ 嵌套对象仍可修改（浅层只读）
console.log("Readonly 浅层陷阱（嵌套对象仍可改）:", rn);

// ---- 4. Record<K, T>：构造键值对类型 ----
console.log("\\n========== 4. Record<K, T> ==========");

// 键为字面量联合类型，值为 string
type Theme = "light" | "dark" | "auto";
type ThemeLabels = Record<Theme, string>;

const themeLabels: ThemeLabels = {
  light: "浅色主题",
  dark: "深色主题",
  auto: "跟随系统",
};
console.log("Record<Theme, string>:", themeLabels);

// Record 的穷尽检查作用：必须覆盖所有键
type UserRole = "admin" | "user" | "guest";
type RolePermissions = Record<UserRole, string[]>;

const rolePermissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
};
console.log("Record<UserRole, string[]>:", rolePermissions);

// Record<string, T> 作为字典
type ScoreMap = Record<string, number>;
const scores: ScoreMap = { math: 95, english: 88, science: 92 };
console.log("Record<string, number> 字典:", scores);

// ---- 5. Pick<T, K>：挑选部分属性 ----
console.log("\\n========== 5. Pick<T, K> ==========");

// 挑选 name 和 email
type UserSummary = Pick<User, "name" | "email">;
// 等价于 { name: string; email: string; }

const summary: UserSummary = { name: "张三", email: "zs@test.com" };
console.log("Pick<User, 'name'|'email'>:", summary);

// 挑选单个属性
type UserId = Pick<User, "id">;
const userId: UserId = { id: 42 };
console.log("Pick<User, 'id'>:", userId);

// Pick 多个属性
type UserBasic = Pick<User, "id" | "name" | "age">;
const basic: UserBasic = { id: 1, name: "李四", age: 25 };
console.log("Pick<User, 'id'|'name'|'age'>:", basic);

// ---- 6. Omit<T, K>：排除部分属性 ----
console.log("\\n========== 6. Omit<T, K> ==========");

// 排除 id（创建用户时不传 id，由后端生成）
type CreateUserDTO = Omit<User, "id">;
// 等价于 { name: string; email: string; age: number; role: string; }

const newUser: CreateUserDTO = { name: "王五", email: "ww@test.com", age: 28, role: "user" };
console.log("Omit<User, 'id'>:", newUser);

// 排除多个属性
type UserPreview = Omit<User, "id" | "age" | "role">;
// 等价于 { name: string; email: string; }
const preview: UserPreview = { name: "赵六", email: "zl@test.com" };
console.log("Omit<User, 'id'|'age'|'role'>:", preview);

// ---- 7. Exclude<T, U>：从联合类型中排除 ----
console.log("\\n========== 7. Exclude<T, U> ==========");

// 从字面量联合中排除
type SomeKeys = "a" | "b" | "c" | "d";
type ExcludedKeys = Exclude<SomeKeys, "a" | "c">;  // "b" | "d"

const ek1: ExcludedKeys = "b";
const ek2: ExcludedKeys = "d";
console.log("Exclude<'a'|'b'|'c'|'d', 'a'|'c'> 的可能值:", ek1, ",", ek2);

// 从类型联合中排除
type Mixed = string | number | boolean;
type ExcludedTypes = Exclude<Mixed, string>;  // number | boolean

const et1: ExcludedTypes = 42;
const et2: ExcludedTypes = true;
console.log("Exclude<string|number|boolean, string> 接受:", et1, "和", et2);

// NonNullable 就是 Exclude 的特例
type MaybeNull = string | number | null | undefined;
type NonNull = Exclude<MaybeNull, null | undefined>;  // string | number
const nn1: NonNull = "非空字符串";
const nn2: NonNull = 100;
console.log("Exclude<..., null|undefined> 接受:", nn1, "和", nn2);

// ---- 8. Extract<T, U>：从联合类型中提取 ----
console.log("\\n========== 8. Extract<T, U> ==========");

// 从字面量联合中提取
type ExtractedKeys = Extract<SomeKeys, "a" | "c">;  // "a" | "c"
const ek3: ExtractedKeys = "a";
const ek4: ExtractedKeys = "c";
console.log("Extract<'a'|'b'|'c'|'d', 'a'|'c'> 的可能值:", ek3, ",", ek4);

// 从混合类型中提取字符串
type MixedValues = "hello" | 42 | "world" | true;
type StringValues = Extract<MixedValues, string>;  // "hello" | "world"
const sv1: StringValues = "hello";
const sv2: StringValues = "world";
console.log("Extract<MixedValues, string> 的可能值:", sv1, ",", sv2);

// ---- 9. NonNullable<T>：排除 null 和 undefined ----
console.log("\\n========== 9. NonNullable<T> ==========");

type MaybeNull2 = string | null | undefined;
type NonNull2 = NonNullable<MaybeNull2>;  // string

const nonNullValue: NonNull2 = "安全字符串";
console.log("NonNullable<string|null|undefined>:", nonNullValue);

// 实际用途：函数参数预处理
function processValue(value: string | null | undefined): string {
  // 排除 null 和 undefined 后，value 是 string
  if (value === null || value === undefined) {
    return "空值";
  }
  // 这里 value 的类型被收窄为 NonNullable<typeof value>
  return "处理: " + value.toUpperCase();
}
console.log(processValue("hello"));
console.log(processValue(null));
console.log(processValue(undefined));

// ---- 10. Parameters<T>：获取函数参数类型 ----
console.log("\\n========== 10. Parameters<T> ==========");

function greet(name: string, age: number, active: boolean): string {
  return name + ", " + age + "岁, " + (active ? "活跃" : "非活跃");
}

// 获取 greet 的参数类型元组 [string, number, boolean]
type GreetParams = Parameters<typeof greet>;

const greetArgs: GreetParams = ["张三", 30, true];
console.log("Parameters<typeof greet>:", greetArgs);
// 用展开调用
console.log("用展开调用 greet:", greet.apply(null, greetArgs));

// 从函数类型字面量获取参数
type Fn = (x: number, y: string) => void;
type FnParams = Parameters<Fn>;  // [number, string]
const fnArgs: FnParams = [42, "hello"];
console.log("Parameters<(x:number, y:string)=>void>:", fnArgs);

// ---- 11. ReturnType<T>：获取函数返回类型 ----
console.log("\\n========== 11. ReturnType<T> ==========");

// 从函数推断返回类型，无需手写 interface
function createUser() {
  return { id: 1, name: "张三", email: "zs@test.com", age: 30 };
}

type InferredUser = ReturnType<typeof createUser>;
// { id: number; name: string; email: string; age: number; }

const inferredUser: InferredUser = { id: 2, name: "李四", email: "ls@test.com", age: 25 };
console.log("ReturnType<typeof createUser>:", inferredUser);

// 从箭头函数推断
const multiply = (a: number, b: number) => a * b;
type MultiplyResult = ReturnType<typeof multiply>;  // number
const result: MultiplyResult = 42;
console.log("ReturnType<typeof multiply> 是 number:", result);

// ---- 12. ConstructorParameters<T>：获取构造函数参数类型 ----
console.log("\\n========== 12. ConstructorParameters<T> ==========");

class Point {
  constructor(public x: number, public y: number) {}
  toString(): string {
    return "(" + this.x + ", " + this.y + ")";
  }
}

// 获取 Point 构造函数的参数类型 [number, number]
type PointCtorParams = ConstructorParameters<typeof Point>;
const pointArgs: PointCtorParams = [3, 4];
console.log("ConstructorParameters<typeof Point>:", pointArgs);

// 用构造函数参数创建实例
const point = new Point(pointArgs[0], pointArgs[1]);
console.log("用参数创建的 Point:", point.toString());

// ---- 13. InstanceType<T>：获取构造函数的实例类型 ----
console.log("\\n========== 13. InstanceType<T> ==========");

// 获取 Point 的实例类型
type PointInstance = InstanceType<typeof Point>;  // Point

const instance: PointInstance = new Point(5, 12);
console.log("InstanceType<typeof Point>:", instance.toString());
console.log("instance.x:", instance.x, "instance.y:", instance.y);

// ---- 14. Awaited<T>：解包 Promise ----
console.log("\\n========== 14. Awaited<T> ==========");

// Awaited 解包 Promise 的值类型
type Unwrapped1 = Awaited<Promise<string>>;  // string
type Unwrapped2 = Awaited<Promise<Promise<number>>>;  // number（递归解包）
type Unwrapped3 = Awaited<string | Promise<number>>;  // string | number
type Unwrapped4 = Awaited<boolean>;  // boolean（非 Promise 原样返回）

// 用值证明
const uw1: Unwrapped1 = "解包后的字符串";
const uw2: Unwrapped2 = 42;
const uw3a: Unwrapped3 = "可以是字符串";
const uw3b: Unwrapped3 = 100;  // 也可以是数字
const uw4: Unwrapped4 = true;

console.log("Awaited<Promise<string>>:", uw1);
console.log("Awaited<Promise<Promise<number>>>:", uw2);
console.log("Awaited<string|Promise<number>>:", uw3a, "或", uw3b);
console.log("Awaited<boolean>:", uw4);

// ---- 15. 字符串变换工具类型 ----
console.log("\\n========== 15. 字符串变换工具类型 ==========");

// Uppercase / Lowercase / Capitalize / Uncapitalize
type Upper = Uppercase<"hello">;       // "HELLO"
type Lower = Lowercase<"WORLD">;       // "world"
type Cap = Capitalize<"foo">           // "Foo"
type Uncap = Uncapitalize<"Bar">;      // "bar"

const upper: Upper = "HELLO";
const lower: Lower = "world";
const cap: Cap = "Foo";
const uncap: Uncap = "bar";
console.log("Uppercase<'hello'>:", upper);
console.log("Lowercase<'WORLD'>:", lower);
console.log("Capitalize<'foo'>:", cap);
console.log("Uncapitalize<'Bar'>:", uncap);

// 对联合类型，每个成员分别变换
type Events = "click" | "focus" | "blur";
type OnEvents = \`on\${Capitalize<Events>}\`;  // "onClick" | "onFocus" | "onBlur"
type UpperEvents = Uppercase<Events>;  // "CLICK" | "FOCUS" | "BLUR"

const onEvent: OnEvents = "onClick";
const upperEvent: UpperEvents = "CLICK";
console.log("Capitalize<Events> 用于生成事件名:", onEvent);
console.log("Uppercase<Events>:", upperEvent);

// 用 Record 验证所有变换后的键
const eventHandlers: Record<OnEvents, string> = {
  onClick: "点击处理",
  onFocus: "聚焦处理",
  onBlur: "失焦处理",
};
console.log("Record<OnEvents, string> 的键:", Object.keys(eventHandlers));

// ---- 16. 自定义工具类型实战 ----
console.log("\\n========== 16. 自定义工具类型 ==========");

// 16.1 DeepPartial：深层 Partial（递归把所有嵌套属性变可选）
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface AppConfig {
  server: { host: string; port: number };
  database: { url: string; poolSize: number };
  cache: { enabled: boolean; ttl: number };
}

type DeepPartialConfig = DeepPartial<AppConfig>;
// 所有嵌套属性都变可选
const partialConfig: DeepPartialConfig = {
  server: { port: 9090 },  // host 可省略
  // database 整个可省略
  cache: { enabled: true },  // ttl 可省略
};
console.log("DeepPartial<AppConfig>:", partialConfig);

// 16.2 Mutable：移除 readonly（-readonly）
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };

interface FrozenPoint {
  readonly x: number;
  readonly y: number;
}
type MutablePoint = Mutable<FrozenPoint>;
// { x: number; y: number; }（不再 readonly）

const mp: MutablePoint = { x: 1, y: 2 };
mp.x = 10;  // ✅ Mutable 后可修改
console.log("Mutable<FrozenPoint> 修改后:", mp);

// 16.3 PickByValueType：按值类型挑选属性
type PickByValueType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

interface MixedProps {
  id: number;
  name: string;
  age: number;
  email: string;
  active: boolean;
}

// 挑选所有 string 类型的属性
type StringProps = PickByValueType<MixedProps, string>;
// { name: string; email: string; }
const stringProps: StringProps = { name: "张三", email: "zs@test.com" };
console.log("PickByValueType<MixedProps, string>:", stringProps);

// 挑选所有 number 类型的属性
type NumberProps = PickByValueType<MixedProps, number>;
// { id: number; age: number; }
const numberProps: NumberProps = { id: 1, age: 30 };
console.log("PickByValueType<MixedProps, number>:", numberProps);

// ---- 17. 综合演示：用工具类型构建 API 响应类型 ----
console.log("\\n========== 17. 综合演示：API 响应类型 ==========");

// 原始实体类型
interface UserEntity {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

// 用工具类型派生各种 DTO
type UserDTO = Pick<UserEntity, "id" | "name" | "email" | "age" | "role">;  // 返回给前端
type CreateUserInput = Omit<UserEntity, "id" | "createdAt" | "updatedAt" | "passwordHash">;  // 创建用户时的输入
type UpdateUserInput = Partial<CreateUserInput>;  // 更新用户时的输入（部分更新）
type UserList = Record<string, UserDTO>;  // 用户列表（按 id 索引）
type UserResponse = { data: UserDTO; success: boolean };  // API 响应包装

// 用这些派生类型创建值
const userDTO: UserDTO = { id: 1, name: "张三", email: "zs@test.com", age: 30, role: "admin" };
const createInput: CreateUserInput = { name: "李四", email: "ls@test.com", age: 25, role: "user" };
const updateInput: UpdateUserInput = { name: "新名字" };  // 只更新 name
const userList: UserList = { "1": userDTO };
const userResponse: UserResponse = { data: userDTO, success: true };

console.log("UserDTO (Pick):", userDTO);
console.log("CreateUserInput (Omit):", createInput);
console.log("UpdateUserInput (Partial<Omit>):", updateInput);
console.log("UserList (Record):", userList);
console.log("UserResponse (组合):", userResponse);

console.log("\\n工具类型章节演示完成！");`,
  },

  // =========================================================
  // 第四章：类型推断与上下文 (Type Inference & Context)
  // =========================================================
  {
    id: "ts-inference",
    title: "类型推断与上下文",
    icon: "🧠",
    group: "进阶类型",
    content: `## 类型推断与上下文 (Type Inference & Contextual Typing)

TypeScript 最令人愉悦的特性之一就是**类型推断（Type Inference）**——大多数时候你不需要手写类型注解，编译器会自动推断出变量的类型。类型推断让 TypeScript 写起来像 JavaScript 一样流畅，同时保留类型安全。

但类型推断并非魔法——它有自己的规则、局限和陷阱。理解推断的工作原理，知道什么时候该让编译器推断、什么时候该显式标注，是写出高质量 TypeScript 代码的关键。

本章将极其详细地讲解类型推断的各个维度：变量初始化推断、\`let\` vs \`const\` 的差异、数组推断（\`T[]\` vs 元组）、函数返回值推断、最佳通用类型、上下文类型（Contextual Typing）、类型断言 vs 类型声明、推断的局限与显式注解时机，以及控制流分析对推断的影响。

### 类型推断的几个维度

TypeScript 在以下场景会自动推断类型：

1. **变量初始化**：\`let x = 10\` → 推断 \`x\` 为 \`number\`。
2. **函数返回值**：\`function f() { return 42 }\` → 推断返回类型为 \`number\`。
3. **结构化**：\`const obj = { a: 1, b: "hi" }\` → 推断 \`{ a: number; b: string }\`。
4. **数组字面量**：\`const arr = [1, 2, 3]\` → 推断 \`number[]\`。
5. **解构**：\`const { a } = obj\` → 推断 \`a\` 的类型从 \`obj\` 提取。
6. **最佳通用类型**：\`const mixed = [1, "hi", true]\` → 推断 \`(string | number | boolean)[]\`。
7. **上下文类型**：回调函数参数从外层函数签名推断。

### 变量初始化推断

当你用 \`let\` 或 \`const\` 声明变量并赋初值时，TypeScript 会根据初值推断变量类型。

\`\`\`ts
let count = 10;        // 推断为 number
let name = "张三";     // 推断为 string
let active = true;     // 推断为 boolean
let items = [1, 2, 3]; // 推断为 number[]
let obj = { x: 1, y: 2 }; // 推断为 { x: number; y: number }

// 函数返回值也参与推断
function getConfig() {  // 定义函数 getConfig
  return { host: "localhost", port: 8080 };  // 返回 { host: "localhost", port: 8080 }
}
let config = getConfig(); // 推断为 { host: string; port: number }
\`\`\`

你不需要写任何类型注解——编译器从初值"读出"类型。这就是类型推断最直观的形式。

#### 推断的基本规则

1. **字面量会被拓宽（widen）**：\`let x = 42\` 推断为 \`number\`（不是 \`42\`），\`let s = "hi"\` 推断为 \`string\`（不是 \`"hi"\`）。
2. **对象字面量推断为对象类型**：\`const obj = { a: 1 }\` 推断为 \`{ a: number }\`。
3. **数组字面量推断为数组类型**：\`const arr = [1, 2]\` 推断为 \`number[]\`（不是 \`[number, number]\`）。
4. **函数返回值从 return 语句推断**：如果所有 return 返回同类型，推断为该类型；如果返回不同类型，推断为联合类型。

### let vs const 推断差异

\`let\` 和 \`const\` 的类型推断有本质区别——\`const\` 声明的变量不会被重新赋值，因此可以推断为更窄的**字面量类型**；\`let\` 声明的变量可能被重新赋值，因此推断为更宽的**基础类型**。

#### let 的推断（拓宽）

\`\`\`ts
let x = 10;        // 推断为 number（不是 10）
let s = "hello";   // 推断为 string（不是 "hello"）
let b = true;      // 推断为 boolean（不是 true）

// 因为 let 变量可以被重新赋值，所以推断为宽类型
x = 20;            // ✅ number 可以赋给 number
x = "hi";          // ❌ string 不能赋给 number
\`\`\`

#### const 的推断（保留字面量类型）

\`\`\`ts
const x = 10;      // 推断为 10（字面量类型！）
const s = "hello"; // 推断为 "hello"（字面量类型！）
const b = true;    // 推断为 true（字面量类型！）

// 因为 const 不能被重新赋值，所以推断为精确的字面量类型
// x = 20;  // ❌ 10 不能赋给 10（类型 20 不等于类型 10）
\`\`\`

#### let vs const 推断对照表

| 声明方式 | 初值 | 推断类型 | 能否重新赋值 |
| --- | --- | --- | --- |
| \`let x = 10\` | 10 | \`number\` | ✅ 可赋其他 number |
| \`const x = 10\` | 10 | \`10\`（字面量） | ❌ 不可重新赋值 |
| \`let s = "hi"\` | "hi" | \`string\` | ✅ 可赋其他 string |
| \`const s = "hi"\` | "hi" | \`"hi"\`（字面量） | ❌ |
| \`let b = true\` | true | \`boolean\` | ✅ |
| \`const b = true\` | true | \`true\`（字面量） | ❌ |

#### const 对象的陷阱

\`const\` 只保证变量绑定不变（不能重新赋值），**不保证对象内容不变**。因此 \`const obj = { x: 1 }\` 推断为 \`{ x: number }\`（\`x\` 的类型是 \`number\` 不是 \`1\`），且 \`obj.x = 2\` 是合法的。

\`\`\`ts
const obj = { x: 1 };  // 推断为 { x: number }，不是 { x: 1 }
obj.x = 2;             // ✅ 合法（obj 的属性可变）
// obj = { x: 3 };     // ❌ 不能重新赋值 const 变量
\`\`\`

要锁定对象属性的值，用 \`as const\`：

\`\`\`ts
const obj = { x: 1 } as const;  // 推断为 { readonly x: 1 }
// obj.x = 2;  // ❌ readonly
\`\`\`

### 数组推断：T[] vs 元组

TypeScript 对数组字面量的推断默认是 \`T[]\`（元素类型数组），而不是元组（固定长度、每个位置不同类型）。但有上下文类型或显式标注时，可以推断为元组。

#### 默认推断为数组

\`\`\`ts
const arr = [1, 2, 3];      // 推断为 number[]
const mixed = [1, "hi", true]; // 推断为 (string | number | boolean)[]
\`\`\`

#### 元组推断

\`\`\`ts
// 显式标注为元组
const tuple: [number, string] = [1, "hi"];  // 声明常量 tuple，类型 [number, string]

// as const 也会推断为元组
const fixed = [1, "hi"] as const; // 推断为 readonly [1, "hi"]
\`\`\`

#### 数组 vs 元组的区别

| 特性 | \`T[]\`（数组） | \`[T, T]\`（元组） |
| --- | --- | --- |
| 长度 | 可变 | 固定 |
| 每个位置类型 | 相同 | 可不同 |
| 适用场景 | 同类型列表 | 固定结构（如坐标、KV 对） |

### 函数返回值推断

TypeScript 会根据函数体内的 \`return\` 语句推断返回值类型。

\`\`\`ts
function add(a: number, b: number) {  // 定义函数 add，参数: a: number, b: number
  return a + b;  // 推断返回类型为 number
}

function greet(name: string) {  // 定义函数 greet，参数: name: string
  return "你好，" + name;  // 推断返回类型为 string
}

// 多个 return 返回不同类型 → 联合类型
function classify(x: number) {  // 定义函数 classify，参数: x: number
  if (x > 0) return "正数";  // 条件判断
  if (x < 0) return "负数";  // 条件判断
  return 0;  // 推断返回类型为 string | number
}
\`\`\`

#### 何时显式标注返回类型

虽然返回值类型可以推断，但**公共 API 函数建议显式标注返回值类型**：

1. **防止实现变更导致返回类型意外变化**：如果返回类型是推断的，修改函数体可能导致返回类型变化，进而破坏调用方代码。
2. **更好的错误信息**：显式标注后，错误发生在函数内部而不是调用处。
3. **文档作用**：返回类型是函数签名的一部分，让使用者一眼看出返回什么。

\`\`\`ts
// ✅ 推荐：公共函数显式标注返回类型
export function getUser(id: number): User {  // 导出函数 getUser
  return db.findUser(id);  // 返回 db.findUser(id)
}

// 内部辅助函数可以省略，让推断工作
function helper(x: number) {  // 定义函数 helper，参数: x: number
  return x * 2;  // 返回 x * 2
}
\`\`\`

### 最佳通用类型 (Best Common Type)

当推断涉及多个类型时（如数组的多个元素），TypeScript 会寻找一个"最佳通用类型"——能涵盖所有类型的类型。

\`\`\`ts
// 所有元素都是 number → number[]
const nums = [1, 2, 3];  // 声明常量 nums

// 元素有 number 和 string → (number | string)[]
const mixed = [1, "hi", 2];  // 声明常量 mixed

// 元素有子类和父类 → 父类[]
class Animal {}  // 定义类 Animal
class Dog extends Animal {}  // 定义类 Dog，extends Animal
class Cat extends Animal {}  // 定义类 Cat，extends Animal
const animals = [new Dog(), new Cat()]; // 推断为 Dog[] | Cat[]？不，是 Animal[]
// 因为 Animal 是 Dog 和 Cat 的最佳通用类型
\`\`\`

如果没有最佳通用类型（类型之间没有继承关系），TypeScript 推断为联合类型：

\`\`\`ts
const items = [1, "hi", true]; // (string | number | boolean)[]
\`\`\`

### 上下文类型 (Contextual Typing)

上下文类型是类型推断的反向——通常推断是从值到类型（"这个值是什么类型"），而上下文类型是从类型到值（"这个位置期望什么类型"）。当一个表达式出现在有类型期望的位置时，它的类型会被上下文"推"出来。

#### 上下文类型的常见场景

**1. 函数参数**

\`\`\`ts
// map 的回调参数 item 被推断为 string（从 string[] 上下文）
const names = ["Alice", "Bob"];  // 声明常量 names
const upper = names.map(item => item.toUpperCase());  // 声明常量 upper
// item 的类型是 string，不需要手写注解
\`\`\`

**2. 事件处理器**

\`\`\`ts
// button 的 click 事件处理器参数 e 被推断为 MouseEvent
button.addEventListener("click", e => {  // 箭头函数
  console.log(e.clientX);  // e: MouseEvent
});
\`\`\`

**3. 对象字面量**

\`\`\`ts
interface Config { host: string; port: number; }  // 定义接口 Config
// 对象字面量在赋值给 Config 类型的变量时，被上下文类型约束
const config: Config = { host: "localhost", port: 8080 };  // 声明常量 config，类型 Config
\`\`\`

**4. 函数返回值上下文**

\`\`\`ts
function getHandler(): (e: Event) => void {  // 定义函数 getHandler，返回 (e: Event)
  // 返回值类型是 (e: Event) => void
  // 所以 e 被上下文推断为 Event
  return e => {  // 返回 e => {
    console.log(e.type);  // 控制台输出
  };
}
\`\`\`

#### 上下文类型的作用

1. **减少样板代码**：回调参数不需要手写类型注解。
2. **提供智能补全**：编辑器知道参数类型，能自动补全属性和方法。
3. **类型安全**：如果回调实现与上下文期望不匹配，编译器会报错。

### 类型断言 vs 类型声明

当你知道一个值的类型比编译器推断的更具体时，可以用**类型断言**（\`as\`）或**类型声明**（\`: Type\`）来告诉编译器。

#### 类型断言 \`as\`

\`\`\`ts
// 编译器推断为 HTMLElement，但你知道它是 HTMLCanvasElement
const canvas = document.getElementById("main") as HTMLCanvasElement;  // 声明常量 canvas（注意：类型断言会绕过类型检查）

// 断言为联合类型的一个分支
let val: string | number = "hello";  // 声明变量 val，类型 string | number
const len = (val as string).length;  // 声明常量 len（注意：类型断言会绕过类型检查）
\`\`\`

#### 类型声明 \`: Type\`

\`\`\`ts
// 直接声明变量类型
const canvas: HTMLCanvasElement = document.getElementById("main");  // 声明常量 canvas，类型 HTMLCanvasElement
// ❌ 但如果 getElementById 返回 HTMLElement，这会报错

// 更常见的用法
let val: string | number = "hello";  // 声明变量 val，类型 string | number
\`\`\`

#### 断言 vs 声明对照表

| 特性 | 类型断言 \`as\` | 类型声明 \`: Type\` |
| --- | --- | --- |
| 方向 | "我知道它是 X" | "请把它当作 X" |
| 编译器检查 | 较宽松（只要类型有交集） | 严格（必须可赋值） |
| 运行时影响 | 无 | 无 |
| 适合场景 | 缩窄类型、DOM API | 声明变量、函数参数 |

#### \`as const\` 断言

\`as const\` 是一种特殊的断言，让编译器推断最窄的字面量类型：

\`\`\`ts
const obj = { x: 1, y: 2 };        // { x: number; y: number }
const objConst = { x: 1, y: 2 } as const;  // { readonly x: 1; readonly y: 2 }

const arr = [1, 2, 3];             // number[]
const arrConst = [1, 2, 3] as const; // readonly [1, 2, 3]
\`\`\`

### 推断的局限与显式注解时机

类型推断虽然强大，但不是万能的。以下场景建议显式标注类型：

#### 1. 函数参数必须显式标注

\`\`\`ts
// ❌ 隐式 any 参数（strict 模式报错）
function add(a, b) { return a + b; }  // 定义函数 add，参数: a, b

// ✅ 显式标注
function add(a: number, b: number): number { return a + b; }  // 定义函数 add，参数: a: number, b: number，返回 number
\`\`\`

函数参数没有初值，编译器无法推断，必须显式标注（除非有上下文类型，如回调）。

#### 2. 公共 API 的返回类型建议显式标注

防止实现变更意外改变返回类型，破坏调用方。

#### 3. 复杂推断结果不确定时

\`\`\`ts
// 推断结果可能出乎意料，显式标注更安全
function getData() {  // 定义函数 getData
  return fetch(url).then(res => res.json());  // 返回 fetch(url).then(res => res.json())
  // 推断为 Promise<any>，不如显式标注 Promise<Data>
}
\`\`\`

#### 4. 联合类型需要收窄时

\`\`\`ts
// 推断为 string | number，如果你知道实际是 string，标注更安全
let val: string | number = getValue();  // 声明变量 val，类型 string | number
const len = (val as string).length;  // 声明常量 len（注意：类型断言会绕过类型检查）
\`\`\`

### 控制流分析对推断的影响

TypeScript 的控制流分析不仅影响类型收窄，也影响类型推断。在代码执行路径中，变量的类型会根据条件分支和赋值动态变化。

\`\`\`ts
function example(x: string | number) {  // 定义函数 example，参数: x: string | number
  if (typeof x === "string") {  // 类型守卫：判断是否为 string
    // x 被收窄为 string
    console.log(x.toUpperCase());  // 控制台输出
  } else {
    // x 被收窄为 number
    console.log(x.toFixed(2));  // 控制台输出
  }
}

// 赋值后类型收窄
let val: string | number = "hello";  // 声明变量 val，类型 string | number
console.log(val.length);  // val: string（收窄）
val = 42;  // 赋值 val
console.log(val.toFixed(0));  // val: number（赋值后收窄）
\`\`\`

### 推断的陷阱

#### 1. 对象字面量的过剩属性检查

\`\`\`ts
interface Config { host: string; port: number; }  // 定义接口 Config
// ❌ 直接赋值会触发过剩属性检查
// const config: Config = { host: "x", port: 1, extra: true };

// ✅ 但通过变量传递不触发（这是"类型拓宽"）
const obj = { host: "x", port: 1, extra: true };  // 声明常量 obj
const config: Config = obj;  // ✅ 合法（只要 obj 有 Config 的所有属性）
\`\`\`

#### 2. 数组推断为联合类型而非元组

\`\`\`ts
const pair = [1, "hello"];  // 推断为 (number | string)[]，不是 [number, string]
// pair[0].toFixed()  // ❌ 类型是 number | string，没有 toFixed
\`\`\`

要推断为元组，用 \`as const\` 或显式标注。

#### 3. 函数返回类型推断可能过于宽泛

\`\`\`ts
function getStatus() {  // 定义函数 getStatus
  if (condition) return "success";  // 条件判断
  return "error";  // 返回 "error"
  // 推断为 string，不是 "success" | "error"
}

// 用 as const 或显式标注
function getStatus(): "success" | "error" {  // 定义函数 getStatus，返回 "success" | "error"
  if (condition) return "success";  // 条件判断
  return "error";  // 返回 "error"
}
\`\`\`

#### 4. const 对象属性仍可变

\`const\` 只锁定变量绑定，不锁定对象内容。需要 \`as const\` 或 \`Readonly\` 才能锁定属性。

### 本节代码演示

下面演示：let/const 推断差异、数组推断 vs 元组、函数返回值推断、上下文类型（回调参数推断）、\`as const\` 断言、类型断言 vs 类型声明、控制流分析对推断的影响。用 \`typeof\` 打印运行时类型验证推断结果。`,
    code: `// ============================================================
// 第四章代码演示：类型推断与上下文全景
// ============================================================
// 注意：类型推断是编译期行为，转译后类型被擦除。本 demo 用
// typeof 打印运行时值的类型，并用注释说明编译期的推断结果。
// ============================================================

// ---- 1. let vs const 推断差异 ----
console.log("========== 1. let vs const 推断差异 ==========");

// let 推断为宽类型（基础类型）
let letNum = 10;        // 推断为 number
let letStr = "hello";   // 推断为 string
let letBool = true;     // 推断为 boolean

// const 推断为窄类型（字面量类型）
const constNum = 10;    // 推断为 10（字面量类型）
const constStr = "hello"; // 推断为 "hello"（字面量类型）
const constBool = true;   // 推断为 true（字面量类型）

// 运行时 typeof 无法区分 number 和 10（都是 "number"）
// 但编译期类型不同：letNum 是 number，constNum 是 10
console.log("let letNum = 10 → 运行时 typeof:", typeof letNum, "（编译期类型: number）");
console.log("const constNum = 10 → 运行时 typeof:", typeof constNum, "（编译期类型: 10 字面量）");
console.log("let letStr = 'hello' → 运行时 typeof:", typeof letStr, "（编译期类型: string）");
console.log("const constStr = 'hello' → 运行时 typeof:", typeof constStr, "（编译期类型: 'hello' 字面量）");

// let 变量可以重新赋值同类型的其他值
letNum = 20;            // ✅ number 赋给 number
console.log("let letNum 重新赋值 20:", letNum);

// const 变量不能重新赋值
// constNum = 20;      // ❌ 编译错误：不能赋值给 const（类型 20 不等于 10）

// ---- 2. const 对象的陷阱 ----
console.log("\\n========== 2. const 对象的陷阱 ==========");

// const 只锁定变量绑定，不锁定对象内容
const obj = { x: 1, y: 2 };  // 推断为 { x: number; y: number }
obj.x = 10;  // ✅ 属性可变（const 只锁 obj 本身）
console.log("const obj 修改属性后:", obj, "（编译期: { x: number; y: number }）");

// as const 锁定属性值和只读
const objConst = { x: 1, y: 2 } as const;  // 推断为 { readonly x: 1; readonly y: 2 }
// objConst.x = 10;  // ❌ 编译错误：readonly
console.log("as const 对象:", objConst, "（编译期: { readonly x: 1; readonly y: 2 }）");

// ---- 3. 数组推断 vs 元组 ----
console.log("\\n========== 3. 数组推断 vs 元组 ==========");

// 默认推断为数组（T[]）
const nums = [1, 2, 3];           // 推断为 number[]
const mixed = [1, "hi", true];    // 推断为 (string | number | boolean)[]
console.log("const nums = [1,2,3] → 运行时:", Array.isArray(nums) ? "数组" : "非数组", "（编译期: number[]）");
console.log("const mixed = [1,'hi',true] →", "（编译期: (string|number|boolean)[]）");
console.log("  mixed 内容:", mixed);

// 显式标注为元组
const tuple: [number, string] = [42, "hello"];
console.log("元组 [number, string]:", tuple, "（编译期: [number, string]）");

// as const 推断为只读元组
const fixed = [1, "hi"] as const;  // 推断为 readonly [1, "hi"]
console.log("as const 元组:", fixed, "（编译期: readonly [1, 'hi']）");

// ---- 4. 函数返回值推断 ----
console.log("\\n========== 4. 函数返回值推断 ==========");

// 返回值类型从 return 语句推断
function add(a: number, b: number) {
  return a + b;  // 推断返回类型为 number
}
function greetStr(name: string) {
  return "你好，" + name;  // 推断返回类型为 string
}
// 多个 return 返回不同类型 → 联合类型
function classify(x: number) {
  if (x > 0) return "正数";
  if (x < 0) return "负数";
  return 0;  // 推断返回类型为 string | number
}

console.log("add(3, 5) 返回:", add(3, 5), "（推断返回类型: number）");
console.log("greetStr('张三') 返回:", greetStr("张三"), "（推断返回类型: string）");
console.log("classify(5) 返回:", classify(5), "（推断返回类型: string | number）");
console.log("classify(-3) 返回:", classify(-3));
console.log("classify(0) 返回:", classify(0));

// 公共 API 函数建议显式标注返回类型
function getUserById(id: number): { id: number; name: string } {
  return { id: id, name: "用户" + id };
}
const user = getUserById(1);
console.log("显式标注返回类型的 getUserById(1):", user);

// ---- 5. 上下文类型 (Contextual Typing) ----
console.log("\\n========== 5. 上下文类型 ==========");

// 5.1 回调函数参数从外层函数签名推断
const names = ["Alice", "Bob", "Charlie"];
// map 的回调参数 item 被上下文推断为 string（从 string[] 来）
const uppercased = names.map(function (item) {
  return item.toUpperCase();
});
console.log("上下文类型：map 回调参数自动推断为 string:");
console.log("  原始:", names);
console.log("  大写:", uppercased);

// filter 回调也享受上下文类型
const longNames = names.filter(function (n) {
  return n.length > 4;
});
console.log("filter 过滤长度>4:", longNames);

// 5.2 对象方法上下文类型
interface Handler {
  (event: { type: string; value: number }): void;
}
const handler: Handler = function (e) {
  console.log("  事件类型:", e.type, "值:", e.value);
};
console.log("上下文类型：Handler 的参数 e 自动推断:");
handler({ type: "click", value: 42 });

// 5.3 函数返回值上下文
function getMultiplier(): (x: number) => number {
  return function (x) {
    return x * 2;
  };
}
const multiplier = getMultiplier();
console.log("函数返回值上下文：getMultiplier()(5) =", multiplier(5));

// ---- 6. 最佳通用类型 ----
console.log("\\n========== 6. 最佳通用类型 ==========");

const allNums = [1, 2, 3, 4, 5];
console.log("同类型数组 → number[]:", allNums);

const mixedTypes = [1, "hello", true, 42];
console.log("混合类型数组 → (string|number|boolean)[]:", mixedTypes);

// 子类和父类 → 父类数组
class Shape {
  area(): number { return 0; }
}
class Circle extends Shape {
  constructor(public radius: number) { super(); }
  area(): number { return Math.PI * this.radius * this.radius; }
}
class Square extends Shape {
  constructor(public side: number) { super(); }
  area(): number { return this.side * this.side; }
}

const shapes = [new Circle(2), new Square(3)];
console.log("子类数组 [Circle, Square] → 推断为父类 Shape[]:");
shapes.forEach(function (s) {
  console.log("  面积:", s.area().toFixed(2));
});

// ---- 7. as const 断言 ----
console.log("\\n========== 7. as const 断言 ==========");

// 不用 as const：属性类型被拓宽
const normalObj = { host: "localhost", port: 8080 };
console.log("普通对象:", normalObj, "（编译期: { host: string; port: number }）");

// 用 as const：属性类型为字面量且只读
const constObj = { host: "localhost", port: 8080 } as const;
console.log("as const 对象:", constObj, "（编译期: { readonly host: 'localhost'; readonly port: 8080 }）");

// 数组 as const：推断为只读元组
const normalArr = [1, 2, 3];
const constArr = [1, 2, 3] as const;
console.log("普通数组:", normalArr, "（编译期: number[]）");
console.log("as const 数组:", constArr, "（编译期: readonly [1, 2, 3]）");

// as const 用于函数返回字面量联合类型
function getStatus(cond: boolean) {
  return cond ? "success" as const : "error" as const;
}
const statusVal = getStatus(true);
console.log("as const 返回字面量联合类型:", statusVal, "（编译期: 'success' | 'error'）");

// ---- 8. 类型断言 vs 类型声明 ----
console.log("\\n========== 8. 类型断言 vs 类型声明 ==========");

// 类型断言 as
let val: string | number = "hello";
const strLen = (val as string).length;
console.log("类型断言 (val as string).length:", strLen);

// typeof 守卫收窄（比断言更安全）
let val2: string | number = "world";
if (typeof val2 === "string") {
  console.log("typeof 守卫收窄后 length:", val2.length);
}

// 双重断言 as unknown as T
let anything: unknown = 42;
const asStr = anything as unknown as string;
console.log("双重断言:", asStr, "（运行时 typeof:", typeof asStr, "）");

// ---- 9. 控制流分析对推断的影响 ----
console.log("\\n========== 9. 控制流分析 ==========");

function cfaDemo(x: string | number | null): string {
  if (typeof x === "string") {
    return "字符串: " + x.toUpperCase();
  }
  if (x === null) {
    return "空值";
  }
  return "数字: " + x.toFixed(2);
}

console.log("cfaDemo('hi'):", cfaDemo("hi"));
console.log("cfaDemo(null):", cfaDemo(null));
console.log("cfaDemo(3.14):", cfaDemo(3.14));

// 赋值后类型收窄
let cfaVal: string | number = "hello";
console.log("赋值 'hello' 后 typeof:", typeof cfaVal);
cfaVal = 42;
console.log("赋值 42 后 typeof:", typeof cfaVal);

// ---- 10. 推断陷阱演示 ----
console.log("\\n========== 10. 推断陷阱演示 ==========");

// 陷阱 1：数组推断为联合类型而非元组
const pair = [1, "hello"];
console.log("陷阱：[1, 'hello'] 推断为 (number|string)[]:", pair);
const fixedPair = [1, "hello"] as const;
console.log("修复：as const → readonly [1, 'hello']:", fixedPair);

// 陷阱 2：函数返回类型过宽
function getStatusBad(cond: boolean) {
  if (cond) return "success";
  return "error";
}
console.log("陷阱：getStatusBad 返回 string（过宽）:", getStatusBad(true));

function getStatusGood(cond: boolean): "success" | "error" {
  if (cond) return "success";
  return "error";
}
console.log("修复：显式标注返回 'success'|'error':", getStatusGood(false));

// 陷阱 3：const 对象属性可变
const config2 = { host: "localhost", port: 8080 };
config2.port = 9090;
console.log("陷阱：const 对象属性可变:", config2);
const frozenConfig = { host: "localhost", port: 8080 } as const;
console.log("修复：as const 属性只读:", frozenConfig);

// ---- 11. 综合演示：最佳实践 ----
console.log("\\n========== 11. 最佳实践 ==========");

// 内部函数：让推断工作
function double(x: number) { return x * 2; }
// 公共 API：显式标注返回类型
function parseUser(data: string): { name: string; age: number } {
  const parts = data.split(",");
  return { name: parts[0] || "", age: Number(parts[1]) || 0 };
}

console.log("公共 API 显式标注:", parseUser("张三,30"));
console.log("内部函数推断返回:", double(5));

// 上下文类型：回调参数自动推断
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(function (n) { return n * 2; });
const sum = numbers.reduce(function (acc, n) { return acc + n; }, 0);
console.log("上下文类型 map:", doubled);
console.log("上下文类型 reduce:", sum);

// as const 用于配置常量
const API_CONFIG = {
  baseUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;
console.log("as const 配置常量:", API_CONFIG);

console.log("\\n类型推断与上下文章节演示完成！");`,
  },
];