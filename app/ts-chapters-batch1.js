// =============================================================
// TypeScript 交互式教程 —— 第一批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-intro        — TypeScript 简介
//   2. ts-basic-types  — 基础类型
//   3. ts-annotations  — 类型注解与推断
//   4. ts-interface    — 接口 (Interface)
//   5. ts-type-alias   — 类型别名 (Type Alias)
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
//     (target ES2020, module CommonJS, 支持装饰器)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：TypeScript 简介
  // =========================================================
  {
    id: "ts-intro",
    title: "TypeScript 简介",
    icon: "📘",
    group: "基础",
    content: `## 什么是 TypeScript？

**TypeScript（简称 TS）** 是由微软（Microsoft）开发并开源的一门**强类型的 JavaScript 超集编程语言**。它在 JavaScript 的基础之上增加了**静态类型系统**以及对现代 ECMAScript 特性的支持，最终会被编译（转译）成普通的 JavaScript 代码运行在任何浏览器、Node.js 环境或 JavaScript 引擎中。一句话概括：**TypeScript = JavaScript + 静态类型系统**。

### 诞生背景与历史

TypeScript 于 **2012 年 10 月**由微软正式对外发布。它的首席架构师是 **Anders Hejlsberg（安德斯·海尔斯伯格）**——一位在编程语言领域享有盛誉的大师级人物。在创造 TypeScript 之前，Anders 已经拥有极为辉煌的履历：

- 他在 1980 年代为 Borland 设计了 **Turbo Pascal** 编译器，让 Pascal 语言在个人电脑上大放异彩。
- 随后他主导设计了 **Delphi**，一个革命性的快速应用开发（RAD）工具。
- 1996 年加入微软后，他成为了 **C# 语言和 .NET 框架的首席架构师**，C# 至今仍是世界上使用最广泛的语言之一。

当 Anders 把目光投向 JavaScript 时，他看到了一个矛盾的现实：**JavaScript 已经成为世界上最流行的语言，被用于从网页到服务器、从桌面到移动端的几乎所有领域，但它天生是一个动态弱类型语言，缺乏类型约束，在大型项目中维护极其困难。** 于是他带领团队创造了 TypeScript，试图在不破坏 JavaScript 生态的前提下，为它补上静态类型这一块短板。

### 为什么需要 TypeScript？

要理解 TypeScript 的价值，首先要理解 JavaScript 的"痛点"。

#### JavaScript 是动态类型语言

在 JavaScript 中，变量没有固定的类型，类型是在**运行时**才确定的。这意味着：

\`\`\`js
// 这段代码在 JS 中完全合法，但运行时会得到意想不到的结果
let value = 42;        // 此时 value 是数字
value = "hello";       // 此时 value 变成了字符串，JS 不会报错
value = true;          // 又变成了布尔值
// 函数参数也没有类型约束
function add(a, b) {
  return a + b;        // 如果传入 "1" 和 2，得到 "12" 而不是 3
}
\`\`\`

这种灵活性在写小脚本时很方便，但当项目规模变大（几十万行代码、数十人协作）时，问题就暴露出来了：

1. **错误延迟到运行时才暴露**：一个拼写错误的属性名 \`user.namme\` 要等到代码真正执行到那一行才会抛出 \`undefined is not a function\`，可能在测试中根本没覆盖到。
2. **重构如同噩梦**：你想把一个字段从 \`name\` 改名为 \`fullName\`，但你不知道有多少处代码引用了它，IDE 也不敢放心地自动重构。
3. **缺乏智能提示**：在大型代码库中，你必须频繁查阅文档或源码才能知道一个函数接受什么参数、返回什么类型。
4. **团队协作困难**：别人写的函数，你不知道参数类型，只能靠猜或者读注释（注释还经常过时）。

#### TypeScript 的解决思路

TypeScript 的核心思想是：**在编译期（写代码时）就通过类型系统发现潜在错误，而不是等到运行时。** 它在 JavaScript 之上增加了一层**类型注解**，让编辑器能在你敲键盘的同时检查类型是否匹配。

\`\`\`ts
// TypeScript 版本：类型错误在编写时就会被编辑器标红
function add(a: number, b: number): number {
  return a + b;
}
add(1, 2);        // ✅ 正确
add("1", 2);      // ❌ 编辑器报错：字符串不能赋给 number 类型参数
\`\`\`

### JavaScript vs TypeScript 全面对比

| 对比维度 | JavaScript | TypeScript |
| --- | --- | --- |
| **类型系统** | 动态类型，运行时确定 | 静态类型，编译期检查 |
| **类型检查时机** | 运行时 | 编译期（写代码时由 IDE 实时检查） |
| **是否需要编译** | 不需要，直接运行 | 需要 tsc 转译成 JS 才能运行 |
| **IDE 智能提示** | 较弱（基于 JSDoc 或推断） | 极强（基于完整类型信息） |
| **重构支持** | 弱，容易遗漏 | 强，类型系统保证重构安全 |
| **学习曲线** | 平缓，上手快 | 较陡，需理解类型系统概念 |
| **生态成熟度** | 极其成熟 | 非常成熟，主流框架都支持 |
| **运行性能** | 直接运行，无编译开销 | 运行时与 JS 等价（编译后就是 JS） |
| **大型项目适用性** | 维护困难 | 维护友好 |
| **浏览器支持** | 原生支持 | 不支持，需编译为 JS |
| **错误发现时机** | 运行时（可能用户遇到） | 编译期（开发阶段就能发现） |
| **自文档化** | 弱（需靠注释） | 强（类型即文档） |

### TypeScript 的核心优势详解

#### 1. 静态类型检查 —— 提前发现错误

这是 TypeScript 最根本的价值。大量研究表明，**修复一个错误的成本与发现它的时间成正比**：在编码阶段发现只需几分钟，在测试阶段发现需要几小时，到了生产环境可能需要几天甚至造成事故。TypeScript 让大量低级错误（类型不匹配、拼写错误、空值访问）在编码阶段就被拦截。

#### 2. 卓越的 IDE 智能提示

有了完整的类型信息，编辑器可以做到：
- 输入 \`obj.\` 后自动列出所有可用属性和方法
- 函数调用时显示参数类型和返回类型
- 悬停在变量上显示其类型
- 自动导入模块
- 跨文件跳转到定义、查找所有引用

这些能力在纯 JavaScript 中只能"猜"，而在 TypeScript 中是"确定"的。

#### 3. 重构友好

当你修改一个接口的字段名，TypeScript 会立即在所有使用了旧字段名的地方报错，你可以逐一修复，**不会遗漏**。这是纯 JS 无法做到的——JS 编辑器只能靠模糊的文本搜索，准确率有限。

#### 4. 自文档化

类型注解本身就是最好的文档。看到一个函数签名 \`function parseConfig(raw: string): Config\`，你立刻知道它接受字符串、返回 Config 对象，不需要额外查文档。

#### 5. 渐进式类型（Gradual Typing）

TypeScript 不会强迫你给所有东西都标注类型。你可以只在关键部分加类型，其余的让编译器自动推断，甚至用 \`any\` 跳过检查。这种"渐进式"设计让你可以**逐步把现有的 JS 项目迁移到 TS**，而不是一次性重写。

### TypeScript 的设计理念

#### 结构化类型系统（Structural Typing）

这是 TypeScript 区别于 Java/C# 等语言的一个重要特性。Java/C# 使用**名义类型（Nominal Typing）**：两个类型即使结构完全相同，只要名字不同就不能互相赋值。而 TypeScript 使用**结构化类型**：**只要结构（形状）匹配，就认为类型兼容**，不管它们的名字是否相同。

\`\`\`ts
// 两个不同名字但结构相同的类型
interface Point2D { x: number; y: number; }
interface Coordinate { x: number; y: number; }

const p: Point2D = { x: 1, y: 2 };
const c: Coordinate = p;  // ✅ 在 TS 中合法！因为结构相同
// 在 Java/C# 中这会报错，因为类型名不同
\`\`\`

这种设计让 TypeScript 与 JavaScript 的"鸭子类型（Duck Typing）"传统高度一致——JS 本来就是"如果它走起路来像鸭子、叫起来像鸭子，那它就是鸭子"。结构化类型把这个理念提升到了编译期。

#### 渐进式类型（Gradual Typing）

TypeScript 允许你在"完全无类型"和"完全强类型"之间任意选择。你可以用 \`any\` 关闭类型检查，也可以用精确的类型让编译器严格校验。这种灵活性是 TypeScript 能在 JS 生态中迅速普及的关键原因之一。

#### JavaScript 的严格超集

TypeScript 被设计为 JavaScript 的**超集**：任何合法的 JavaScript 代码都是合法的 TypeScript 代码。这意味着你可以把一个 \`.js\` 文件直接改名为 \`.ts\`，它就能被 TypeScript 处理（可能在严格模式下有些类型警告，但不会语法报错）。这个特性让迁移成本极低。

### TypeScript 与 ECMAScript 的关系

**ECMAScript（ES）** 是 JavaScript 的语言标准，由 ECMA 国际组织通过 TC39 委员会维护。每年会发布一个新版本（ES2015/ES6、ES2016……ES2024 等），新增语言特性。

TypeScript 与 ECMAScript 的关系是：

1. **TypeScript 是 ES 的超集**：所有 ES 语法（箭头函数、解构、async/await、可选链等）TypeScript 都支持。
2. **TypeScript 额外增加类型层**：类型注解、接口、泛型、枚举等是 TS 独有的，不属于 ES 标准。
3. **TypeScript 可降级编译**：你可以用最新的 ES 语法写代码，然后通过 tsc 编译成旧版 ES（如 ES5），以兼容老旧浏览器。类型注解在编译时会被全部擦除。
4. **TypeScript 跟随 ES 标准演进**：TC39 进入 Stage 3（候选阶段）的提案，TypeScript 通常就会尽快支持。

### 安装与使用

#### 安装 TypeScript

TypeScript 通过 npm 安装。可以全局安装以便随处使用 \`tsc\` 命令：

\`\`\`bash
npm install -g typescript
# 验证安装
tsc --version
\`\`\`

也可以在项目本地安装：

\`\`\`bash
npm install --save-dev typescript
\`\`\`

#### tsc 编译命令

\`tsc\` 是 TypeScript 的编译器命令行工具。基本用法：

\`\`\`bash
# 编译单个文件：hello.ts → hello.js
tsc hello.ts

# 监听模式：文件修改后自动重新编译
tsc --watch

# 使用配置文件 tsconfig.json 编译整个项目
tsc
\`\`\`

#### ts-node

\`ts-node\` 是一个让 Node.js 直接执行 TypeScript 文件的工具，它内部会先编译再运行，省去手动编译步骤：

\`\`\`bash
npm install -g ts-node
ts-node hello.ts   # 直接运行 .ts 文件
\`\`\`

#### Deno

**Deno** 是 Ryan Dahl（Node.js 之父）创建的新一代 JavaScript/TypeScript 运行时，它**原生支持 TypeScript**——无需编译，直接运行 \`.ts\` 文件：

\`\`\`bash
deno run hello.ts
\`\`\`

### tsc 编译流程

TypeScript 的编译流程可以简化为：

1. **解析（Parse）**：把源代码字符串解析成抽象语法树（AST）。
2. **绑定（Bind）**：建立符号表，连接声明与引用。
3. **类型检查（Type Check）**：根据类型注解和推断结果检查类型错误。
4. **发射（Emit）**：擦除类型信息，输出 JavaScript 代码（以及可选的 .d.ts 类型声明文件）。

注意第 4 步：**类型信息只存在于编译期，运行时的 TS 代码和普通 JS 没有任何区别**。这就是为什么说"TypeScript 是编译时的语言，运行时不存在类型"。

### 在线运行环境：TS Playground

微软官方提供了 **TypeScript Playground**（https://www.typescriptlang.org/play），一个在线的 TS 编辑器，可以即时编写、编译和运行 TypeScript 代码，还能看到编译后的 JS 输出，非常适合学习和实验。

### Hello World 示例

最经典的 TypeScript 程序：

\`\`\`ts
// hello.ts
const message: string = "Hello, TypeScript!";
console.log(message);
\`\`\`

编译并运行：

\`\`\`bash
tsc hello.ts      # 生成 hello.js
node hello.js     # 输出: Hello, TypeScript!
\`\`\`

### 本节代码演示

下面这段代码综合演示了 TypeScript 的典型写法：带类型的变量、带类型注解的函数、接口描述对象形状、泛型函数、枚举。你可以在编辑器中修改后点击"运行代码"查看输出。虽然类型注解会在运行前被擦除，但你可以直观感受 TS 的书写风格。`,
    code: `// ============================================================
// 第一章代码演示：TypeScript 写法全景体验
// ============================================================
// 说明：这些类型注解在运行前会被 TypeScript 编译器擦除，
// 最终运行的其实是普通的 JavaScript。但类型信息能帮你在
// 编写时发现错误、获得智能提示。下面我们感受 TS 的写法。

// ---- 1. 带类型注解的变量 ----
// 语法：let 变量名: 类型 = 值;
let userName: string = "张三";      // 字符串类型
let age: number = 28;               // 数字类型
let isActive: boolean = true;       // 布尔类型
let hobbies: string[] = ["阅读", "编程", "音乐"];  // 字符串数组

console.log("========== 1. 带类型的变量 ==========");
console.log("姓名:", userName);
console.log("年龄:", age);
console.log("是否活跃:", isActive);
console.log("爱好:", hobbies.join("、"));

// ---- 2. 带类型注解的函数 ----
// 参数后面加 :类型，括号后面加 :返回值类型
function greet(name: string, age: number): string {
  // 返回值被约定为 string，函数体内必须返回字符串
  return "你好，" + name + "！你今年 " + age + " 岁。";
}

console.log("\\n========== 2. 类型化函数 ==========");
console.log(greet(userName, age));

// ---- 3. 用 interface 描述对象的形状 ----
// interface 定义一个"契约"，对象必须符合这个形状
interface Person {
  name: string;       // 必须有 name，且为 string
  age: number;        // 必须有 age，且为 number
  greet(): void;      // 必须有 greet 方法，无返回值
}

// 创建符合 Person 接口的对象
const person: Person = {
  name: "李四",
  age: 30,
  greet() {
    // this 指向对象本身
    console.log("我是 " + this.name + "，今年 " + this.age + " 岁");
  },
};

console.log("\\n========== 3. 接口与对象 ==========");
person.greet();

// ---- 4. 泛型函数 ----
// <T> 是类型参数，调用时传入具体类型
// 泛型让函数可以处理多种类型，同时保持类型安全
function identity<T>(value: T): T {
  return value;
}

console.log("\\n========== 4. 泛型 ==========");
console.log("泛型传 string:", identity<string>("类型安全的字符串"));
console.log("泛型传 number:", identity<number>(42));
console.log("泛型传数组:", identity<number[]>([1, 2, 3]));

// ---- 5. 枚举 enum ----
// 枚举为一组数值赋予友好的名字
enum Color {
  Red,    // 默认从 0 开始
  Green,  // 1
  Blue,   // 2
}

console.log("\\n========== 5. 枚举 ==========");
console.log("Color.Red =", Color.Red);
console.log("Color.Green =", Color.Green);
console.log("Color.Blue =", Color.Blue);
// 枚举支持反向映射：通过数值拿到名字字符串
console.log("Color[0] =", Color[0]);
console.log("Color[2] =", Color[2]);

// ---- 6. 联合类型与字面量类型 ----
// 联合类型用 | 表示，变量可以是多种类型之一
type ID = number | string;
function printId(id: ID): void {
  console.log("ID 是:", id, "，类型是:", typeof id);
}

console.log("\\n========== 6. 联合类型 ==========");
printId(10086);
printId("A-12345");

// ---- 7. 类型推断演示 ----
// 不写类型注解时，TypeScript 会自动推断类型
let inferred = "自动推断为 string 类型";
// inferred = 123;  // 类型错误：不能把 number 赋给 string（运行时不报错，但 IDE 会提示）
console.log("\\n========== 7. 类型推断 ==========");
console.log(inferred);

console.log("\\n以上就是 TypeScript 的典型写法，你可以修改代码后重新运行！");`,
  },

  // =========================================================
  // 第二章：基础类型
  // =========================================================
  {
    id: "ts-basic-types",
    title: "基础类型",
    icon: "🔢",
    group: "基础",
    content: `## 基础类型

TypeScript 的类型系统是构建一切复杂类型的基石。本章将逐一讲解 TypeScript 中的所有基础类型，每种类型都配有示例、原理说明和常见陷阱。

### 布尔类型 boolean

最基本的数据类型，只有两个值：\`true\` 和 \`false\`。

\`\`\`ts
let isDone: boolean = false;
let hasPermission: boolean = true;
\`\`\`

注意：在 JavaScript/TypeScript 中，\`Boolean\`（大写）是构造函数对象类型，\`boolean\`（小写）才是原始类型。**始终使用小写的 \`boolean\`**。

### 数字类型 number

TypeScript 和 JavaScript 一样，所有数字都是**浮点数**（底层是 IEEE 754 双精度浮点）。没有单独的整数类型。除了十进制，还支持二进制、八进制、十六进制字面量：

\`\`\`ts
let decimal: number = 6;       // 十进制
let hex: number = 0xff;        // 十六进制，等于 255
let binary: number = 0b1010;   // 二进制，等于 10
let octal: number = 0o12;      // 八进制，等于 10
let float: number = 3.14;      // 浮点数
\`\`\`

**陷阱**：由于浮点精度问题，\`0.1 + 0.2\` 在 JS/TS 中等于 \`0.30000000000000004\` 而不是 \`0.3\`。涉及金额计算时建议用整数（分）或专门的高精度库。

### 字符串类型 string

\`\`\`ts
let name: string = "张三";
let sentence: string = '单引号也可以';
// 模板字符串：用反引号包裹，支持 \${} 插值和多行
let greeting: string = \`你好，\${name}！\`;
\`\`\`

模板字符串是 ES6 引入的特性，TypeScript 完全支持。它让字符串拼接变得清晰，尤其在多行文本和变量插值时。

### 数组类型

TypeScript 有两种声明数组的方式：

\`\`\`ts
// 方式一：元素类型后加 []
let list1: number[] = [1, 2, 3];
// 方式二：泛型数组 Array<元素类型>
let list2: Array<string> = ["a", "b", "c"];
// 只读数组：不能修改元素
let readonlyList: readonly number[] = [1, 2, 3];
// readonlyList.push(4);  // ❌ 类型错误
\`\`\`

**只读数组** \`readonly number[]\`（等价于 \`ReadonlyArray<number>\`）保证数组内容不可变，有助于函数式编程和避免意外修改。

### 元组类型 tuple

元组是**已知长度和每个位置类型的数组**。普通数组所有元素类型相同，而元组每个位置可以是不同类型：

\`\`\`ts
// 一个 string 后跟一个 number
let pair: [string, number] = ["张三", 28];
console.log(pair[0]);  // "张三"
console.log(pair[1]);  // 28
\`\`\`

**陷阱**：元组在运行时本质就是数组，TS 的类型检查只在编译期。访问越界元素（如 \`pair[2]\`）在严格模式下会报类型错误。另外，对元组调用 \`push\` 在 TS 中有时被允许（历史原因），容易绕过类型检查，使用时要小心。

### 枚举类型 enum

枚举是对一组命名常量的集合，让代码更具可读性。TypeScript 支持几种枚举：

#### 数值枚举

\`\`\`ts
enum Direction {
  Up,      // 默认从 0 开始
  Down,    // 1
  Left,    // 2
  Right,   // 3
}
// 也可以指定起始值
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}
\`\`\`

数值枚举有**反向映射**：既可以用名字取数值（\`Direction.Up\` → 0），也可以用数值取名字（\`Direction[0]\` → \`"Up"\`）。

#### 字符串枚举

\`\`\`ts
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
\`\`\`

字符串枚举**没有反向映射**——你不能用 \`Color["RED"]\` 取回 \`"Red"\`。字符串枚举的好处是序列化后仍可读（数值枚举序列化成数字后意义不明）。

#### 异构枚举（Heterogeneous Enum）

数值和字符串混用，不推荐使用，容易引起混淆：

\`\`\`ts
enum Mixed {
  No = 0,
  Yes = "YES",
}
\`\`\`

#### const enum

\`const enum\` 是一种特殊枚举，编译时会被**完全内联**成具体的值，不会生成额外的枚举对象代码，体积更小、性能更好：

\`\`\`ts
const enum Direction { Up, Down }
let d = Direction.Up;  // 编译后直接变成 let d = 0;
\`\`\`

### any 类型

\`any\` 是类型系统的"逃生舱"，表示**任意类型**，编译器会跳过对该值的类型检查。它是从 JavaScript 迁移到 TypeScript 时的过渡工具：

\`\`\`ts
let notSure: any = 4;
notSure = "现在变成字符串";  // 不报错
notSure = false;            // 不报错
notSure.ifItExists();       // 不报错（运行时可能出错）
\`\`\`

**陷阱**：滥用 \`any\` 会让你失去 TypeScript 的所有好处，相当于回到了写 JavaScript。应该尽量避免，只在确实无法确定类型时（如第三方库无类型定义）临时使用。

### unknown 类型

\`unknown\` 是**类型安全的 any**。它也接受任意值，但在使用前**必须先进行类型检查**：

\`\`\`ts
let value: unknown = "hello";
// value.toUpperCase();  // ❌ 错误：unknown 类型不能直接调用方法
if (typeof value === "string") {
  console.log(value.toUpperCase());  // ✅ 类型缩小后才允许
}
\`\`\`

\`unknown\` 比 \`any\` 安全得多，推荐在"不确定类型"的场景优先用 \`unknown\` 而不是 \`any\`。

### never 类型

\`never\` 表示**永远不会出现的值**。常用于两种场景：

1. **永不返回的函数**：抛出异常或无限循环的函数。
2. **穷尽检查（Exhaustive Check）**：在 switch 中确保所有情况都被处理。

\`\`\`ts
// 永不返回：抛异常
function fail(msg: string): never {
  throw new Error(msg);
}
// 永不返回：无限循环
function infiniteLoop(): never {
  while (true) {}
}
\`\`\`

### void 类型

\`void\` 表示函数**没有返回值**（或者说返回 \`undefined\`）。常用于回调函数的返回类型：

\`\`\`ts
function log(msg: string): void {
  console.log(msg);
  // 没有 return 语句
}
\`\`\`

\`void\` 和 \`undefined\` 的区别：\`void\` 表示"我不关心返回值"，\`undefined\` 表示"返回值就是 undefined"。

### null 和 undefined

在 TypeScript 中，\`null\` 和 \`undefined\` 各自有对应的类型：

\`\`\`ts
let u: undefined = undefined;
let n: null = null;
\`\`\`

默认情况下 \`null\` 和 \`undefined\` 可以赋给任何类型。但开启 \`strictNullChecks\` 后，它们只能赋给 \`null\`、\`undefined\` 和 \`any\`，不能赋给 \`string\` 等。这能避免大量"空指针"错误。建议始终开启此选项。

### 字面量类型

字面量类型把一个具体的值当作类型。通常和联合类型搭配，约束变量只能是某几个固定值：

\`\`\`ts
let direction: "left" | "right" | "up" | "down";
direction = "left";  // ✅
// direction = "sideways";  // ❌ 不是允许的值
\`\`\`

### bigint 类型

用于表示超大整数（超过 Number.MAX_SAFE_INTEGER 即 2^53-1）：

\`\`\`ts
let big: bigint = 9007199254740991n;
let another: bigint = BigInt(123);
\`\`\`

注意 \`bigint\` 不能和 \`number\` 直接混合运算。

### symbol 类型

\`symbol\` 是 ES6 引入的原始类型，表示全局唯一不可变的值，常作为对象属性键：

\`\`\`ts
let sym: symbol = Symbol("key");
\`\`\`

### 类型赋值兼容性

TypeScript 的类型兼容性基于**结构化子类型**。简单规则：
- 子类型可以赋给父类型（如具体字面量赋给 string）。
- 结构匹配即可赋值（结构化类型）。
- \`any\` 兼容所有类型（双向）。
- \`unknown\` 只能赋给 \`unknown\` 和 \`any\`。
- \`never\` 可以赋给任何类型（因为它永远不会出现）。

### 本节代码演示

下面这段代码演示了上述所有基础类型，你可以运行查看每种类型的行为，尤其注意枚举的反向映射、元组的用法、联合类型与字面量类型的配合。`,
    code: `// ============================================================
// 第二章代码演示：TypeScript 基础类型全景
// ============================================================

// ---- 1. 布尔类型 boolean ----
console.log("========== 1. 布尔类型 ==========");
let isDone: boolean = false;
let hasPermission: boolean = true;
console.log("isDone:", isDone, "类型:", typeof isDone);
console.log("hasPermission:", hasPermission, "类型:", typeof hasPermission);

// ---- 2. 数字类型 number ----
console.log("\\n========== 2. 数字类型 ==========");
let decimal: number = 6;        // 十进制
let hex: number = 0xff;         // 十六进制，等于 255
let binary: number = 0b1010;    // 二进制，等于 10
let octal: number = 0o12;       // 八进制，等于 10
let float: number = 3.14;       // 浮点数
console.log("十进制 6:", decimal);
console.log("十六进制 0xff:", hex);
console.log("二进制 0b1010:", binary);
console.log("八进制 0o12:", octal);
console.log("浮点数:", float);
// 演示浮点精度陷阱
console.log("注意 0.1 + 0.2 =", 0.1 + 0.2, "（不等于 0.3！）");

// ---- 3. 字符串类型 string ----
console.log("\\n========== 3. 字符串类型 ==========");
let name: string = "张三";
// 模板字符串：反引号包裹，支持插值
let greeting: string = \`你好，\${name}！欢迎学习 TypeScript。\`;
console.log("普通字符串:", name);
console.log("模板字符串:", greeting);

// ---- 4. 数组类型 ----
console.log("\\n========== 4. 数组类型 ==========");
let numbers: number[] = [10, 20, 30];               // number[] 写法
let names: Array<string> = ["Alice", "Bob"];        // Array<T> 写法
let readonlyArr: readonly number[] = [1, 2, 3];     // 只读数组
console.log("number[]:", numbers);
console.log("Array<string>:", names);
console.log("readonly:", readonlyArr);
console.log("数组求和:", numbers.reduce((a, b) => a + b, 0));

// ---- 5. 元组 tuple ----
console.log("\\n========== 5. 元组 tuple ==========");
// 元组：已知长度和每个位置类型的数组
let pair: [string, number] = ["张三", 28];
console.log("元组:", pair);
console.log("姓名(元组[0]):", pair[0]);
console.log("年龄(元组[1]):", pair[1]);
// 三元素元组
let triple: [string, number, boolean] = ["李四", 30, true];
console.log("三元素元组:", triple);

// ---- 6. 数值枚举与反向映射 ----
console.log("\\n========== 6. 数值枚举 ==========");
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}
console.log("Direction.Up =", Direction.Up);
console.log("Direction.Down =", Direction.Down);
// 反向映射：数值 → 名字
console.log("Direction[0] =", Direction[0]);
console.log("Direction[3] =", Direction[3]);

// 指定起始值的数值枚举
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}
console.log("HttpStatus.OK =", HttpStatus.OK);
console.log("HttpStatus[404] =", HttpStatus[404]);

// ---- 7. 字符串枚举（无反向映射）----
console.log("\\n========== 7. 字符串枚举 ==========");
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
console.log("Color.Red =", Color.Red);
console.log("Color.Green =", Color.Green);
// 字符串枚举没有反向映射，下面得到 undefined
console.log("Color['RED'] =", Color["RED"], "（字符串枚举无反向映射）");

// ---- 8. const enum（编译时内联）----
console.log("\\n========== 8. const enum ==========");
const enum Status {
  Active = 1,
  Inactive = 2,
}
let s: Status = Status.Active;  // 编译后直接变成 let s = 1
console.log("const enum Status.Active =", s);

// ---- 9. any 与 unknown ----
console.log("\\n========== 9. any 与 unknown ==========");
let anything: any = 42;       // any：任意类型，不检查
console.log("any 值:", anything, "类型:", typeof anything);
anything = "变成字符串";       // any 允许任意赋值
console.log("any 再赋值:", anything);

let unsure: unknown = "hello";  // unknown：安全的 any
console.log("unknown 值:", unsure);
// unknown 必须先做类型检查才能使用
if (typeof unsure === "string") {
  console.log("unknown 类型缩小后:", unsure.toUpperCase());
}

// ---- 10. never 类型 ----
console.log("\\n========== 10. never 类型 ==========");
// never 表示永不返回的函数（抛异常或无限循环）
// 注意：要演示 never，必须用 try/catch 包住，否则异常会中断整个脚本
function fail(msg: string): never {
  // 函数声明返回 never，意味着它永远不会正常返回
  throw new Error(msg);
}

// 演示：never 类型的值可以赋给任何类型（编译期特性）
// 运行时 fail 会抛异常，所以必须放在 try/catch 里
try {
  // 调用 fail 会抛出异常，try/catch 捕获后继续执行
  let result: string = fail("这是一个 never 函数抛出的错误");
  // 这一行永远到不了（fail 抛出了异常）
  console.log("不会执行到这里:", result);
} catch (e) {
  console.log("捕获到 never 函数的异常:", e.message);
}
// 演示 never 用于穷尽检查的思路（运行时只看 switch）
type TaskState = "pending" | "done";
function assertNever(state: TaskState): never {
  throw new Error("未知状态: " + state);
}
function handle(state: TaskState): string {
  switch (state) {
    case "pending":
      return "任务待处理";
    case "done":
      return "任务已完成";
    default:
      // 如果未来新增了状态但忘了处理，这里会在编译期报错
      return assertNever(state);
  }
}
console.log("穷尽检查 handle('done'):", handle("done"));

// ---- 11. void 类型 ----
console.log("\\n========== 11. void 类型 ==========");
function logMessage(msg: string): void {
  // void 表示没有返回值
  console.log("void 函数输出:", msg);
}
logMessage("我返回 void");
let voidResult: void = logMessage("再次调用");
console.log("void 函数的返回值:", voidResult, "类型:", typeof voidResult);

// ---- 12. null 与 undefined ----
console.log("\\n========== 12. null 与 undefined ==========");
let u: undefined = undefined;
let n: null = null;
console.log("undefined:", u, "类型:", typeof u);
console.log("null:", n, "类型:", typeof n, "（typeof null 是 object，历史遗留）");

// ---- 13. 字面量类型与联合 ----
console.log("\\n========== 13. 字面量类型 ==========");
type Direction2 = "left" | "right" | "up" | "down";
function move(dir: Direction2): string {
  return "向" + dir + "移动";
}
console.log(move("left"));
console.log(move("up"));

// ---- 14. bigint 与 symbol ----
console.log("\\n========== 14. bigint 与 symbol ==========");
let big: bigint = 9007199254740991n;  // 超大整数
let big2: bigint = BigInt(100);
console.log("bigint:", big, "运算:", big + big2);

let sym: symbol = Symbol("唯一标识");
let sym2: symbol = Symbol("唯一标识");
console.log("symbol 是否相等:", sym === sym2, "（每个 Symbol 都唯一）");
console.log("symbol 类型:", typeof sym);

console.log("\\n以上就是 TypeScript 全部基础类型的演示！");`,
  },

  // =========================================================
  // 第三章：类型注解与推断
  // =========================================================
  {
    id: "ts-annotations",
    title: "类型注解与推断",
    icon: "🏷️",
    group: "基础",
    content: `## 类型注解与推断

TypeScript 的类型信息有两个来源：**你显式写的类型注解**和**编译器自动的类型推断**。理解两者区别、何时该用哪种，是写出优雅 TypeScript 代码的关键。

### 类型注解（Type Annotation）

类型注解是你**主动告诉编译器**某个变量/参数/返回值是什么类型，语法是在标识符后加 \`:\` 和类型。

#### 变量注解

\`\`\`ts
let count: number = 10;
let name: string = "张三";
let items: string[] = [];
\`\`\`

#### 函数注解

函数可以注解**参数类型**和**返回值类型**：

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;
}
// 箭头函数
const multiply = (a: number, b: number): number => a * b;
\`\`\`

### 类型推断（Type Inference）

如果你不写类型注解，TypeScript 会根据上下文**自动推断**类型。这是 TypeScript 智能的体现——大多数时候你不需要手写类型。

\`\`\`ts
let count = 10;          // 推断为 number
let name = "张三";        // 推断为 string
let items = [1, 2, 3];   // 推断为 number[]
function add(a: number, b: number) {
  return a + b;          // 返回值推断为 number
}
\`\`\`

### 类型推断的常见场景

1. **变量初始化**：\`let x = 5\` 推断 x 为 number。
2. **函数返回值**：根据 return 表达式推断。
3. **结构化赋值**：\`const { name } = obj\` 根据 obj 的类型推断。
4. **数组元素**：\`[1, 2, 3]\` 推断为 number[]。

### const 与推断的关系

用 \`const\` 声明时，对于原始类型会推断为**字面量类型**，因为 const 变量不能重新赋值：

\`\`\`ts
let x = "hello";   // 推断为 string
const y = "hello"; // 推断为 "hello"（字面量类型）
\`\`\`

### 何时必须显式注解，何时可以省略

**必须显式注解的情况**：
- 函数参数：参数没有初始值，无法推断，必须注解。
- 复杂返回类型：当返回类型不直观时，显式注解能避免推断出错。
- 想"锁定"类型：如 \`let x: string | number = "hi"\`，不注解会被推断为 string。

**可以省略的情况**：
- 变量有明确初始值：让推断工作即可。
- 函数返回值简单：能从 return 推断出来。

### 类型断言（Type Assertion）

类型断言是**你告诉编译器"我比你更清楚这个值的类型"**，相当于手动覆盖推断结果。有两种语法：

\`\`\`ts
// 方式一：as 语法（推荐，JSX 中必须用这种）
let strLength: number = (someValue as string).length;

// 方式二：尖括号语法
let strLength: number = (<string>someValue).length;
\`\`\`

#### 两种语法的差异

\`<T>value\` 和 \`value as T\` 功能相同，但：
- 在 **JSX/TSX** 文件中，\`<string>someValue\` 会被当作 JSX 标签解析，导致歧义，所以**必须用 \`as\` 语法**。
- 因此社区约定**统一使用 \`as\` 语法**，避免在不同文件类型中切换习惯。

### 非空断言（Non-null Assertion）\`!\`

后缀 \`!\` 告诉编译器"我确定这个值不是 null/undefined"：

\`\`\`ts
function getLength(value: string | null): number {
  return value!.length;  // 断言 value 一定非空
}
\`\`\`

**陷阱**：非空断言会**关闭编译器的空值检查**，如果运行时确实是 null，就会抛错。要谨慎使用，优先用条件判断或可选链 \`?.\`。

### const 断言 \`as const\`

\`as const\` 让一个值被推断为**最窄的字面量类型**，并把所有属性变成 \`readonly\`：

\`\`\`ts
const config = { host: "localhost", port: 3000 };
// config 的类型是 { host: string; port: number }
const config2 = { host: "localhost", port: 3000 } as const;
// config2 的类型是 { readonly host: "localhost"; readonly port: 3000 }
\`\`\`

\`as const\` 常用于：
- 让数组变成只读元组：\`[1, 2, 3] as const\` → \`readonly [1, 2, 3]\`。
- 让对象属性变成字面量类型和只读。
- 配合字面量联合类型使用。

### 类型断言的陷阱

1. **不安全**：断言只是"骗过"编译器，运行时不会做任何检查。如果断言错误，运行时会出错。
2. **编译期存在，运行时消失**：断言不会影响运行时行为。
3. **不能断言成不兼容类型**：\`let x = "hi" as number\` 会报错（string 和 number 不够重叠），需要先转 any：\`"hi" as unknown as number\`（这是危险做法）。

### 最佳实践

1. **推断优先**：能推断就让编译器推断，减少冗余注解。
2. **函数参数必注解**：这是惯例，也利于可读性。
3. **公共 API 显式注解返回值**：让调用方清楚返回类型。
4. **谨慎使用断言**：每用一次断言，都该问自己"是否真的需要"。
5. **优先用类型守卫而非断言**：\`if (typeof x === "string")\` 比断言更安全。
6. **少用非空断言**：除非有充分理由。

### 本节代码演示

下面演示注解与推断的对比、\`as\` 断言、\`as const\`、非空断言的实际效果。`,
    code: `// ============================================================
// 第三章代码演示：类型注解与推断
// ============================================================

// ---- 1. 类型注解 vs 类型推断 ----
console.log("========== 1. 注解 vs 推断 ==========");

// 显式注解：明确写出类型
let explicitCount: number = 10;
let explicitName: string = "张三";
let explicitArr: number[] = [1, 2, 3];

// 类型推断：不写类型，编译器自动推断
let inferredCount = 10;        // 推断为 number
let inferredName = "张三";      // 推断为 string
let inferredArr = [1, 2, 3];   // 推断为 number[]

console.log("显式注解 count:", explicitCount);
console.log("推断 count:", inferredCount);
console.log("显式注解 name:", explicitName);
console.log("推断 name:", inferredName);
// 运行时两者完全一样，类型信息在编译期被擦除

// ---- 2. 函数注解与返回值推断 ----
console.log("\\n========== 2. 函数注解与推断 ==========");

// 参数必须注解（无初始值无法推断）
function add(a: number, b: number): number {
  return a + b;  // 显式标注返回值 number
}
// 返回值可以省略注解，编译器会推断
function multiply(a: number, b: number) {
  return a * b;  // 推断返回 number
}
// 无返回值的函数
function logIt(msg: string): void {
  console.log("  logIt:", msg);
}

console.log("add(3, 5) =", add(3, 5));
console.log("multiply(4, 6) =", multiply(4, 6));
logIt("void 函数没有返回值");

// ---- 3. const 与字面量推断 ----
console.log("\\n========== 3. const 与字面量推断 ==========");
let letStr = "hello";   // let 推断为 string（可变）
const constStr = "hello"; // const 推断为字面量 "hello"（不可变）
console.log("let 变量:", letStr);
console.log("const 变量:", constStr);
letStr = "world";  // ✅ let 可以重新赋值
console.log("let 重新赋值后:", letStr);

// ---- 4. 类型断言 as ----
console.log("\\n========== 4. 类型断言 as ==========");

// unknown 类型的值，使用前需要断言或类型缩小
let someValue: unknown = "这是一段字符串";
// someValue.length  // ❌ unknown 不能直接访问属性
let strLength: number = (someValue as string).length;
console.log("断言为 string 后取长度:", strLength);

// 断言成更具体的类型
let values: any = [10, 20, 30];
let first: number = values[0] as number;
console.log("断言数组首元素为 number:", first);

// ---- 5. as const 断言 ----
console.log("\\n========== 5. as const 断言 ==========");

// 不用 as const：属性是可变的宽类型
const config = { host: "localhost", port: 3000 };
// config.port = 8080;  // ✅ 允许（类型是 number）

// 用 as const：属性变成只读的字面量类型
const configConst = { host: "localhost", port: 3000 } as const;
// configConst.port = 8080;  // ❌ 类型错误：readonly
console.log("as const 配置:", configConst);

// 数组用 as const 变成只读元组
const tuple = [1, 2, 3] as const;
// tuple[0] = 99;  // ❌ 只读
console.log("as const 元组:", tuple);

// ---- 6. 非空断言 ! ----
console.log("\\n========== 6. 非空断言 ! ==========");

// 模拟一个可能为 null 的值
function findName(id: number): string | null {
  if (id === 1) return "张三";
  return null;
}

// 用非空断言：告诉编译器"我确定不是 null"
let name1: string | null = findName(1);
// name1 可能是 null，但用 ! 断言非空后可以取 length
let len: number = name1!.length;
console.log("非空断言取长度:", len);

// 更安全的做法：用条件判断代替非空断言
let name2: string | null = findName(2);
if (name2 !== null) {
  console.log("条件判断后:", name2.length);
} else {
  console.log("name2 是 null，用条件判断更安全");
}

// ---- 7. 可选链 ?. 替代非空断言 ----
console.log("\\n========== 7. 可选链 ?. ==========");
interface User {
  profile?: {
    age?: number;
  };
}
const user: User = { profile: { age: 25 } };
const emptyUser: User = {};
// 可选链：遇到 null/undefined 短路返回 undefined
console.log("user.profile?.age:", user.profile?.age);
console.log("emptyUser.profile?.age:", emptyUser.profile?.age);
// 空值合并运算符 ?? 提供默认值
console.log("默认值:", emptyUser.profile?.age ?? "未设置");

// ---- 8. 类型守卫比断言更安全 ----
console.log("\\n========== 8. 类型守卫 ==========");
function formatValue(value: string | number): string {
  // typeof 类型守卫：自动缩小类型
  if (typeof value === "string") {
    // 这里 value 被缩小为 string
    return "字符串:" + value.toUpperCase();
  } else {
    // 这里 value 被缩小为 number
    return "数字:" + value.toFixed(2);
  }
}
console.log(formatValue("hello"));
console.log(formatValue(3.14159));

console.log("\\n类型注解与推断演示完成！");`,
  },

  // =========================================================
  // 第四章：接口 (Interface)
  // =========================================================
  {
    id: "ts-interface",
    title: "接口 (Interface)",
    icon: "🔌",
    group: "基础",
    content: `## 接口 (Interface)

**接口（Interface）** 是 TypeScript 中描述**对象形状（Shape）**的核心工具。它定义了一组属性和方法的契约，任何实现该接口的对象都必须符合这个形状。接口是 TypeScript 类型系统最常用的特性之一。

### 接口是什么

接口本质上是一份**类型契约**，它规定了一个对象应该有哪些属性、属性是什么类型、哪些方法是必须的。接口在编译时会被完全擦除，运行时不存在——它是纯粹的编译期概念。

\`\`\`ts
interface Person {
  name: string;
  age: number;
}
const p: Person = { name: "张三", age: 28 };
\`\`\`

### interface 与 type 的区别

两者都能描述对象类型，但有细微差别（详细对比见下一章）。简而言之：
- \`interface\` 更适合描述对象形状和类的契约，支持声明合并、继承。
- \`type\` 更灵活，能定义联合类型、交叉类型、原始类型别名等。

### 基本用法：描述对象形状

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
}
const user: User = { id: 1, name: "张三", email: "z@x.com" };
\`\`\`

如果对象少了属性或多了属性，编译器会报错（多余属性检查）。

### 可选属性 \`?\`

属性名后加 \`?\` 表示该属性可选，可以不存在：

\`\`\`ts
interface User {
  id: number;
  name: string;
  age?: number;  // 可选
}
const u1: User = { id: 1, name: "张三" };       // ✅ 没有 age 也行
const u2: User = { id: 2, name: "李四", age: 30 }; // ✅ 有 age 也行
\`\`\`

### 只读属性 \`readonly\`

\`readonly\` 表示属性只能在对象创建时赋值，之后不可修改：

\`\`\`ts
interface Point {
  readonly x: number;
  readonly y: number;
}
const p: Point = { x: 10, y: 20 };
// p.x = 5;  // ❌ 只读属性不能修改
\`\`\`

\`readonly\` 只是编译期检查，运行时无法阻止修改。它和 \`const\` 的区别：\`const\` 作用于变量，\`readonly\` 作用于属性。

### 索引签名 \`[key: string]: type\`

当对象可能有任意数量的属性，且属性名不确定时，用索引签名：

\`\`\`ts
interface StringMap {
  [key: string]: string;
}
const map: StringMap = { a: "1", b: "2", anything: "x" };
\`\`\`

索引签名有两种：
- \`[key: string]\`：字符串索引
- \`[key: number]\`：数字索引

**陷阱**：一旦定义了索引签名，所有已声明属性的类型都必须能赋给索引签名的类型。例如 \`[key: string]: string\` 时，不能有 \`age: number\` 属性。

### 函数类型接口

接口也可以描述函数的类型：

\`\`\`ts
interface SearchFunc {
  (source: string, sub: string): boolean;
}
const contains: SearchFunc = (src, sub) => src.includes(sub);
\`\`\`

这种写法等价于 \`type SearchFunc = (source: string, sub: string) => boolean\`。

### 可索引类型

结合索引签名可以创建字典/映射类型：

\`\`\`ts
interface NumberDictionary {
  [index: string]: number;
  length: number;  // 必须和索引签名类型兼容
}
\`\`\`

### 类类型接口（implements）

接口可以描述类的实例形状，类用 \`implements\` 实现接口：

\`\`\`ts
interface Comparable {
  compareTo(other: any): number;
}
class Score implements Comparable {
  constructor(public value: number) {}
  compareTo(other: Score): number {
    return this.value - other.value;
  }
}
\`\`\`

\`implements\` 只检查实例部分，不检查静态部分。一个类可以实现多个接口（逗号分隔）。

### 接口继承 extends

接口可以继承一个或多个接口，复用类型定义：

\`\`\`ts
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }
// Dog 有 name 和 breed 两个属性
\`\`\`

多继承：

\`\`\`ts
interface A { a: number; }
interface B { b: number; }
interface C extends A, B { c: number; }
// C 有 a、b、c 三个属性
\`\`\`

### 接口合并（Declaration Merging）

这是 interface 独有的特性：**同名接口会自动合并**。这在扩展第三方库类型时非常有用：

\`\`\`ts
interface Window { myProp: string; }  // 扩展全局 Window
interface Window { anotherProp: number; }
// 最终 Window 有 myProp 和 anotherProp
\`\`\`

注意：\`type\` 不支持声明合并，同名 \`type\` 会报错。

### interface vs type 何时用哪个

| 维度 | interface | type |
| --- | --- | --- |
| **描述对象形状** | ✅ 推荐 | ✅ 可以 |
| **联合/交叉类型** | ❌ 不支持 | ✅ 支持 |
| **原始类型别名** | ❌ 不支持 | ✅ 支持 |
| **声明合并** | ✅ 自动合并 | ❌ 同名报错 |
| **继承** | extends | 通过 & 交叉 |
| **扩展第三方类型** | ✅ 合并方便 | 需重新定义 |

**经验法则**：描述对象/类的形状用 \`interface\`，需要联合、交叉、原始别名等用 \`type\`。两者在多数场景可互换，团队统一风格即可。

### 本节代码演示

下面演示接口的各种用法：可选属性、只读、索引签名、函数类型、继承、声明合并、类实现接口。`,
    code: `// ============================================================
// 第四章代码演示：接口 Interface
// ============================================================

// ---- 1. 基本接口：描述对象形状 ----
console.log("========== 1. 基本接口 ==========");

interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = { id: 1, name: "张三", email: "zhangsan@example.com" };
console.log("用户:", JSON.stringify(user));

// ---- 2. 可选属性 ? ----
console.log("\\n========== 2. 可选属性 ==========");

interface Profile {
  id: number;
  name: string;
  age?: number;        // 可选
  bio?: string;        // 可选
}

const p1: Profile = { id: 1, name: "李四" };              // 不写可选属性
const p2: Profile = { id: 2, name: "王五", age: 30 };     // 写部分可选属性
console.log("不带可选属性:", JSON.stringify(p1));
console.log("带可选属性:", JSON.stringify(p2));
console.log("p1.age:", p1.age, "（可选属性不存在时为 undefined）");

// ---- 3. 只读属性 readonly ----
console.log("\\n========== 3. 只读属性 ==========");

interface Point {
  readonly x: number;
  readonly y: number;
}

const point: Point = { x: 10, y: 20 };
console.log("初始点:", point);
// point.x = 5;  // ❌ 类型错误：只读属性不可修改（运行时不报错但 IDE 会提示）
// 演示只读数组 ReadonlyArray
let arr: number[] = [1, 2, 3];
let roArr: ReadonlyArray<number> = arr;
console.log("只读数组:", roArr);
// roArr.push(4);  // ❌ 只读数组不能修改

// ---- 4. 索引签名 [key: string] ----
console.log("\\n========== 4. 索引签名 ==========");

interface StringMap {
  [key: string]: string;  // 任意字符串键，值为 string
}

const colorMap: StringMap = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  custom: "#abcdef",
};
console.log("字符串映射:", colorMap);
console.log("red =", colorMap.red);
console.log("custom =", colorMap["custom"]);

// 数字索引签名
interface NumberArray {
  [index: number]: string;
}
const names: NumberArray = { 0: "张三", 1: "李四", 2: "王五" };
console.log("数字索引:", names[0], names[1], names[2]);

// ---- 5. 函数类型接口 ----
console.log("\\n========== 5. 函数类型接口 ==========");

interface SearchFunc {
  (source: string, sub: string): boolean;
}

// 实现这个函数接口
const contains: SearchFunc = (src, sub) => src.indexOf(sub) !== -1;
const startsWith: SearchFunc = (src, sub) => src.startsWith(sub);

console.log("contains('hello world', 'world'):", contains("hello world", "world"));
console.log("startsWith('hello world', 'hello'):", startsWith("hello world", "hello"));

// ---- 6. 接口继承 extends ----
console.log("\\n========== 6. 接口继承 ==========");

interface Animal {
  name: string;
  age: number;
}

// 单继承
interface Dog extends Animal {
  breed: string;  // 新增品种属性
}

const dog: Dog = { name: "旺财", age: 3, breed: "柴犬" };
console.log("单继承 Dog:", JSON.stringify(dog));

// 多继承
interface Swimmer {
  swim(): void;
}
interface Flyer {
  fly(): void;
}
// 鸭子既能游泳又能飞，同时还是动物
interface Duck extends Animal, Swimmer, Flyer {
  quack(): void;
}

const duck: Duck = {
  name: "唐老鸭",
  age: 2,
  swim() { console.log("  " + this.name + " 在游泳"); },
  fly() { console.log("  " + this.name + " 在飞"); },
  quack() { console.log("  " + this.name + "：嘎嘎嘎！"); },
};
console.log("多继承 Duck:");
duck.swim();
duck.fly();
duck.quack();

// ---- 7. 声明合并（Declaration Merging）----
console.log("\\n========== 7. 声明合并 ==========");

// 同名接口会自动合并属性
interface Box {
  width: number;
}
interface Box {
  height: number;
}
interface Box {
  depth: number;
}
// 最终 Box 有 width、height、depth 三个属性
const box: Box = { width: 100, height: 200, depth: 50 };
console.log("合并后的 Box:", JSON.stringify(box));
console.log("体积:", box.width * box.height * box.depth);

// ---- 8. 类实现接口 implements ----
console.log("\\n========== 8. 类实现接口 ==========");

interface Comparable {
  compareTo(other: any): number;
}

class Score implements Comparable {
  // 构造函数参数属性简写：自动创建并赋值 this.value
  constructor(public value: number) {}
  compareTo(other: Score): number {
    // 返回正数表示 this > other，负数表示 this < other，0 表示相等
    return this.value - other.value;
  }
}

const s1 = new Score(90);
const s2 = new Score(85);
const s3 = new Score(95);
console.log("分数1:", s1.value, "分数2:", s2.value, "分数3:", s3.value);
console.log("s1 compareTo s2:", s1.compareTo(s2), "（正数表示 s1 更大）");
console.log("s1 compareTo s3:", s1.compareTo(s3), "（负数表示 s1 更小）");

// 一个类实现多个接口
interface Printable {
  toString(): string;
}
interface Sortable {
  compareTo(other: any): number;
}
// Grade 同时实现 Printable 和 Sortable
class Grade implements Printable, Sortable {
  constructor(public value: number, public label: string) {}
  toString(): string {
    return this.label + ":" + this.value;
  }
  compareTo(other: Grade): number {
    return this.value - other.value;
  }
}

const grades = [
  new Grade(90, "优秀"),
  new Grade(70, "良好"),
  new Grade(85, "良+"),
];
// 按 value 排序
grades.sort((a, b) => a.compareTo(b));
console.log("排序后:");
grades.forEach((g) => console.log("  " + g.toString()));

console.log("\\n接口演示完成！");`,
  },

  // =========================================================
  // 第五章：类型别名 (Type Alias)
  // =========================================================
  {
    id: "ts-type-alias",
    title: "类型别名 (Type Alias)",
    icon: "🔤",
    group: "基础",
    content: `## 类型别名 (Type Alias)

**类型别名（Type Alias）** 通过 \`type\` 关键字为一个类型起一个新名字。它和 \`interface\` 一样是描述类型的重要工具，但比 interface 更灵活——能表达 interface 无法表达的形式（联合、交叉、原始类型别名等）。

### type 是什么

\`type\` 不会创建新的类型，只是给已有类型起一个**别名**，方便复用和理解：

\`\`\`ts
type Name = string;
type ID = number | string;
\`\`\`

这里 \`Name\` 和 \`string\` 完全等价，\`ID\` 和 \`number | string\` 完全等价。

### 基本用法

\`\`\`ts
// 原始类型别名
type Score = number;
// 对象类型别名
type Point = { x: number; y: number };
// 函数类型别名
type Callback = (data: any) => void;
\`\`\`

### 联合类型（Union）\`|\`

联合类型表示一个值可以是**多种类型之一**，用 \`|\` 连接：

\`\`\`ts
type ID = number | string;
let id: ID = 123;     // ✅ number
id = "A-001";         // ✅ string
\`\`\`

联合类型常配合**字面量类型**使用，约束值为固定几个选项：

\`\`\`ts
type Status = "active" | "inactive" | "banned";
type Direction = "up" | "down" | "left" | "right";
\`\`\`

**使用联合类型时，只能访问所有类型共有的成员**。要使用特定类型的成员，需要类型缩小（type narrowing）：

\`\`\`ts
function process(id: number | string) {
  // id.toUpperCase();  // ❌ number 没有 toUpperCase
  if (typeof id === "string") {
    console.log(id.toUpperCase());  // ✅ 这里 id 被缩小为 string
  }
}
\`\`\`

### 交叉类型（Intersection）\`&\`

交叉类型用 \`&\` 把多个类型**合并成一个**，新类型拥有所有类型的全部属性：

\`\`\`ts
type Person = { name: string };
type Employee = { employeeId: number };
type EmployeePerson = Person & Employee;
// EmployeePerson 同时有 name 和 employeeId
const emp: EmployeePerson = { name: "张三", employeeId: 1001 };
\`\`\`

交叉类型常用于**混入（Mixin）模式**和组合多个接口的能力。

**陷阱**：如果交叉的两个类型有同名但类型不兼容的属性，该属性会变成 \`never\`：

\`\`\`ts
type A = { x: string };
type B = { x: number };
type C = A & B;  // C 的 x 是 string & number = never
\`\`\`

### 用 type 描述对象、函数

\`\`\`ts
// 对象
type User = {
  id: number;
  name: string;
  readonly createdAt: Date;
};
// 函数
type Handler = (event: string) => boolean;
\`\`\`

### type 与 interface 的全面对比

| 维度 | type | interface |
| --- | --- | --- |
| **原始类型别名** | ✅ \`type X = string\` | ❌ 不支持 |
| **联合类型** | ✅ \`A \| B\` | ❌ 不支持 |
| **交叉类型** | ✅ \`A & B\` | ✅ extends 多继承 |
| **对象类型** | ✅ \`type X = {...}\` | ✅ \`interface X {...}\` |
| **函数类型** | ✅ \`type F = () => void\` | ✅ \`interface F { (): void }\` |
| **元组类型** | ✅ \`type T = [string, number]\` | ❌ 不直接支持 |
| **条件类型** | ✅ 支持 | ❌ 不支持 |
| **映射类型** | ✅ 支持 | ❌ 不支持 |
| **声明合并** | ❌ 同名报错 | ✅ 自动合并 |
| **扩展（继承）** | 用 \`&\` 交叉 | 用 \`extends\` |
| **被类 implements** | ✅ 可以 | ✅ 可以 |
| **可读性** | 灵活但有时晦涩 | 表达对象形状更直观 |
| **扩展第三方类型** | 需重新定义 | 合并方便 |

### 何时用 type 何时用 interface

1. **需要联合/交叉/原始别名/元组/条件类型** → 用 \`type\`（interface 做不到）。
2. **描述对象形状、类的契约** → 两者都行，\`interface\` 更直观。
3. **需要声明合并（扩展第三方库）** → 用 \`interface\`。
4. **团队/库的既有风格** → 保持一致。

社区常见做法：**对象形状优先用 interface，其他场景用 type**。但这不是硬性规则。

### 常见用法

#### 联合字面量类型

\`\`\`ts
type Theme = "light" | "dark" | "auto";
type ButtonSize = "small" | "medium" | "large";
\`\`\`

#### 可辨识联合（Discriminated Union）

这是 type 最强大的用法之一。当联合类型的每个成员都有一个**共同的字面量属性（标签/判别式）**，TS 能根据这个属性自动缩小类型：

\`\`\`ts
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; size: number };
type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;  // 这里 shape 被缩小为 Circle
    case "square":
      return shape.size ** 2;              // 这里 shape 被缩小为 Square
  }
}
\`\`\`

可辨识联合在处理状态机、API 响应、配置变体时极其有用，是 TypeScript 类型系统的精华。

### 本节代码演示

下面演示类型别名、联合类型、交叉类型、可辨识联合的实际运行效果。`,
    code: `// ============================================================
// 第五章代码演示：类型别名 Type Alias
// ============================================================

// ---- 1. 基本类型别名 ----
console.log("========== 1. 基本类型别名 ==========");

// 给原始类型起别名，提升可读性
type Name = string;
type Score = number;
type ID = number | string;

const userName: Name = "张三";
const mathScore: Score = 95;
const userId: ID = "A-12345";  // ID 可以是 number 或 string

console.log("姓名(Name):", userName, "类型:", typeof userName);
console.log("分数(Score):", mathScore, "类型:", typeof mathScore);
console.log("ID:", userId, "类型:", typeof userId);

// ---- 2. 用 type 描述对象和函数 ----
console.log("\\n========== 2. type 描述对象和函数 ==========");

type User = {
  id: number;
  name: string;
  readonly createdAt: string;  // 只读属性
};

type Handler = (data: string) => void;  // 函数类型别名

const u: User = { id: 1, name: "李四", createdAt: "2024-01-01" };
const logHandler: Handler = (data) => console.log("  处理:", data);

console.log("用户:", JSON.stringify(u));
logHandler("调用 Handler 类型的函数");

// ---- 3. 联合类型 ----
console.log("\\n========== 3. 联合类型 ==========");

// 联合类型：值可以是多种类型之一
type StringOrNumber = string | number;

function doubleIt(value: StringOrNumber): string {
  // 联合类型只能访问共有成员，需要类型缩小
  if (typeof value === "number") {
    return "数字翻倍: " + (value * 2);
  } else {
    return "字符串重复: " + value + value;
  }
}

console.log(doubleIt(21));
console.log(doubleIt("Hi"));

// 联合字面量类型：约束为固定选项
type Theme = "light" | "dark" | "auto";
type ButtonSize = "small" | "medium" | "large";

function applyTheme(theme: Theme): string {
  const map = { light: "浅色主题", dark: "深色主题", auto: "跟随系统" };
  return "已应用" + map[theme];
}
console.log(applyTheme("dark"));
console.log(applyTheme("auto"));

// ---- 4. 交叉类型 ----
console.log("\\n========== 4. 交叉类型 ==========");

// 交叉类型：合并多个类型的全部属性
type Person = {
  name: string;
  age: number;
};

type Employee = {
  employeeId: number;
  department: string;
};

// EmployeePerson 同时拥有 Person 和 Employee 的所有属性
type EmployeePerson = Person & Employee;

const emp: EmployeePerson = {
  name: "王五",
  age: 35,
  employeeId: 1001,
  department: "技术部",
};
console.log("交叉类型 EmployeePerson:", JSON.stringify(emp));

// 交叉类型实现 Mixin 模式
type Timestamps = {
  createdAt: string;
  updatedAt: string;
};
type WithTimestamps<T> = T & Timestamps;

type Article = WithTimestamps<{ title: string; content: string }>;
const article: Article = {
  title: "TypeScript 入门",
  content: "类型别名很有用...",
  createdAt: "2024-01-01",
  updatedAt: "2024-06-01",
};
console.log("带时间戳的文章:", JSON.stringify(article));

// ---- 5. 可辨识联合（Discriminated Union）----
console.log("\\n========== 5. 可辨识联合 ==========");

// 每个类型都有一个共同的 kind 属性作为判别式
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; size: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Shape = Circle | Square | Rectangle;

// 根据 kind 判别式，TS 能自动缩小类型
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // 这里 shape 被缩小为 Circle，可以安全访问 radius
      return Math.PI * shape.radius * shape.radius;
    case "square":
      // 这里 shape 被缩小为 Square，可以访问 size
      return shape.size * shape.size;
    case "rectangle":
      // 这里 shape 被缩小为 Rectangle
      return shape.width * shape.height;
  }
}

function describeShape(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return "圆形，半径 " + shape.radius;
    case "square":
      return "正方形，边长 " + shape.size;
    case "rectangle":
      return "矩形，" + shape.width + "x" + shape.height;
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "square", size: 4 },
  { kind: "rectangle", width: 3, height: 6 },
];

shapes.forEach((shape) => {
  console.log(describeShape(shape) + "，面积 = " + area(shape).toFixed(2));
});

// ---- 6. 可辨识联合：模拟 API 响应状态 ----
console.log("\\n========== 6. 可辨识联合：API 响应 ==========");

type ApiResponse =
  | { status: "success"; data: string }
  | { status: "error"; message: string }
  | { status: "loading" };

function handleResponse(res: ApiResponse): string {
  switch (res.status) {
    case "success":
      return "✅ 成功：" + res.data;
    case "error":
      return "❌ 错误：" + res.message;
    case "loading":
      return "⏳ 加载中...";
  }
}

const responses: ApiResponse[] = [
  { status: "loading" },
  { status: "success", data: "用户数据获取成功" },
  { status: "error", message: "网络连接失败" },
];

responses.forEach((res) => console.log(handleResponse(res)));

// ---- 7. type 与 interface 都能被 implements ----
console.log("\\n========== 7. type 实现 class ==========");

type Loggable = {
  log(msg: string): void;
};

class Logger implements Loggable {
  log(msg: string): void {
    console.log("  [Logger] " + msg);
  }
}

const logger = new Logger();
logger.log("type 别名也能被 class implements");

console.log("\\n类型别名演示完成！");`,
  },
];
