// =============================================================
// TypeScript 2 交互式教程 —— 第三批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts2-functions-advanced  — 函数类型进阶
//   2. ts2-generics-basics     — 泛型基础与实践
//   3. ts2-generics-advanced   — 泛型高级模式
//   4. ts2-classes-oop         — 面向对象编程
//   5. ts2-decorators          — 装饰器实战
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
  // 第一章：函数类型进阶 (Advanced Function Types)
  // =========================================================
  {
    id: "ts2-functions-advanced",
    title: "函数类型进阶",
    icon: "⚡",
    group: "函数与类",
    content: `## 函数类型进阶 (Advanced Function Types)

函数是 TypeScript 应用程序的核心构建块，也是类型系统最活跃的应用场景。TypeScript 为函数提供了极其丰富的类型表达能力，远超一般的静态类型语言。本章将全面深入地讲解函数类型表达式、调用签名（Call Signatures）、构造签名（Construct Signatures）、泛型函数、函数重载（Overloads）、\`this\` 参数、剩余参数与参数解构、\`void\` 与 \`undefined\` 的微妙区别，以及 \`never\` 返回类型。

**函数类型决定了"一个函数能接受什么参数、返回什么值"**，这是类型安全的基础。掌握函数类型进阶，你将能够编写出类型精确、IDE 智能提示友好、自文档化程度极高的函数。

### 函数类型表达式（Function Type Expressions）

在 TypeScript 中，函数本身也是一种值，因此可以有自己的类型。描述函数类型的最简单方式是**函数类型表达式**，语法为 \`(param: type) => returnType\`。

#### 基本语法

\`\`\`ts
// 函数类型表达式：接收一个 string 参数，返回 void
type Greeter = (name: string) => void;

// 将这个类型赋给一个变量
const greet: Greeter = (name) => {
  console.log("Hello, " + name);
};

// 多参数版本
type MathOp = (a: number, b: number) => number;
const add: MathOp = (a, b) => a + b;
const multiply: MathOp = (a, b) => a * b;
\`\`\`

函数类型表达式与箭头函数语法相似，但它们的含义完全不同：**函数类型表达式描述的是类型，箭头函数是运行时的值**。

#### 可选参数与默认参数

函数类型表达式中可以使用 \`?\` 标记可选参数，可选参数必须放在必需参数之后：

\`\`\`ts
// 第二个参数是可选的
type Callback = (result: string, error?: Error) => void;

const cb: Callback = (result, error) => {
  if (error) {
    console.error("失败:", error.message);
  } else {
    console.log("成功:", result);
  }
};

cb("数据加载完成");                     // 可以
cb("错误", new Error("网络超时"));      // 也可以
\`\`\`

默认参数的类型会自动被 TypeScript 推断，也可以显式标注：

\`\`\`ts
type CreateUser = (name: string, age?: number, isAdmin?: boolean) => void;

const createUser: CreateUser = (name, age = 18, isAdmin = false) => {
  console.log(\`创建用户: \${name}, 年龄 \${age}, 管理员 \${isAdmin}\`);
};
\`\`\`

#### 函数类型表达式的局限性

函数类型表达式只能描述函数的参数和返回类型，**不能描述函数自身的属性**（如 \`call\`、\`apply\` 等），也不能用于描述函数的重载。这些场景需要用到**调用签名**。

### 调用签名（Call Signatures）

调用签名是面向对象风格描述函数类型的方式，语法为 \`{ (param: type): returnType }\`。它允许你描述一个**可调用对象**的类型——即这个对象本身可以被调用，同时还可以拥有自己的属性。

#### 基本语法

\`\`\`ts
// 调用签名：描述一个可调用的对象
interface DescribableFunction {
  description: string;                    // 对象自身的属性
  (someArg: number): boolean;             // 调用签名：说明这个对象可以被调用
}

// 实现一个符合 DescribableFunction 的值
function doSomething(n: number): boolean {
  return n > 0;
}
doSomething.description = "判断是否为正数";

// 赋值给类型变量
const fn: DescribableFunction = doSomething;
console.log(fn.description);  // "判断是否为正数"
console.log(fn(5));            // true
console.log(fn(-1));           // false
\`\`\`

调用签名最常见的应用场景是**回调函数需要携带额外属性**，或者**函数本身也是一个命名空间**（如 jQuery 的 \`$\` 既是函数又拥有 \`$.ajax\` 等方法）。

#### 使用 type 别名定义调用签名

除了 \`interface\`，\`type\` 别名也可以定义调用签名：

\`\`\`ts
type Validator = {
  message: string;
  (value: string): boolean;
};

const minLength: Validator = (value: string) => value.length >= 6;
minLength.message = "密码长度至少 6 位";

console.log(minLength.message);        // "密码长度至少 6 位"
console.log(minLength("abc"));         // false
console.log(minLength("abcdef"));      // true
\`\`\`

### 构造签名（Construct Signatures）

**构造签名**描述的是一个可以被 \`new\` 调用的构造函数类型。语法为 \`{ new (param: type): InstanceType }\`。

#### 为什么需要构造签名

JavaScript 中，类（class）实际上是构造函数加原型的语法糖。当你需要描述"一个可以被 \`new\` 的对象"的类型时——比如工厂函数接受一个构造函数作为参数——就需要构造签名。

\`\`\`ts
// 构造签名：描述一个可被 new 调用的对象
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

// 实例接口：描述 new 出来的实例
interface ClockInterface {
  tick(): void;
  getTime(): string;
}

// 工厂函数：接受一个构造函数，创建实例
function createClock(
  ctor: ClockConstructor,
  hour: number,
  minute: number
): ClockInterface {
  return new ctor(hour, minute);
}

// 实现类
class DigitalClock implements ClockInterface {
  constructor(private h: number, private m: number) {}
  tick() {
    console.log(\`\${this.h}:\${this.m}\`);
  }
  getTime(): string {
    return \`\${this.h}:\${this.m}\`;
  }
}

// 使用工厂函数
const clock = createClock(DigitalClock, 10, 30);
clock.tick();  // "10:30"
\`\`\`

#### 调用签名与构造签名共存

一个对象可以同时拥有调用签名和构造签名，比如 \`Date\` 既可以 \`Date()\` 调用，也可以 \`new Date()\` 构造：

\`\`\`ts
interface CallOrConstruct {
  (n?: number): string;          // 调用签名：普通调用
  new (s: string): Date;          // 构造签名：new 调用
}
\`\`\`

### 泛型函数（Generic Functions）

泛型函数是 TypeScript 函数类型系统中最强大的特性之一。它允许函数在**调用时**根据传入参数的类型自动确定返回类型，从而建立参数类型和返回类型之间的关联。

#### 基本语法

\`\`\`ts
// 泛型函数：Type 是类型参数，捕获传入参数的类型
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}

// 调用时 TypeScript 自动推断 Type 的类型
const n = firstElement([1, 2, 3]);       // Type 推断为 number, n 类型为 number | undefined
const s = firstElement(["a", "b"]);      // Type 推断为 string, s 类型为 string | undefined
const u = firstElement([]);               // Type 推断为 unknown, u 类型为 undefined
\`\`\`

泛型函数的精髓在于**类型参数捕获了输入和输出之间的类型关系**。在 \`firstElement\` 中，\`Type\` 告诉编译器："输入数组的元素类型是什么，返回值的类型就是什么"。

#### 多个类型参数

泛型函数可以定义多个类型参数：

\`\`\`ts
// 两个类型参数：Input 和 Output
function map<Input, Output>(
  arr: Input[],
  func: (arg: Input) => Output
): Output[] {
  return arr.map(func);
}

// 调用时自动推断
const parsed = map(["1", "2", "3"], (n) => parseInt(n));
// Input 推断为 string, Output 推断为 number
// parsed 的类型为 number[]
console.log(parsed);  // [1, 2, 3]
\`\`\`

#### 泛型约束（Constraints）

有时你需要限制类型参数必须满足某些条件。使用 \`extends\` 子句：

\`\`\`ts
// 约束：Type 必须包含 length 属性
function longest<Type extends { length: number }>(a: Type, b: Type): Type {
  return a.length >= b.length ? a : b;
}

const longerStr = longest("hello", "world");     // Type 推断为 string
const longerArr = longest([1, 2], [3, 4, 5]);    // Type 推断为 number[]
// const invalid = longest(10, 20);               // ❌ number 没有 length 属性
\`\`\`

### 函数重载（Function Overloads）

TypeScript 支持**函数重载**：为同一个函数提供多个类型签名，编译器会根据调用时的参数类型选择匹配的签名。

#### 重载语法

函数重载的写法是：先写多个重载签名（只有参数和返回类型，没有函数体），然后写一个实现签名（有函数体，参数类型必须兼容所有重载签名）。

\`\`\`ts
// 重载签名 1：接受 Date 对象
function formatDate(date: Date): string;
// 重载签名 2：接受时间戳 number
function formatDate(timestamp: number): string;
// 重载签名 3：接受年、月、日
function formatDate(year: number, month: number, day: number): string;
// 实现签名：参数类型必须兼容所有重载
function formatDate(
  dateOrYear: Date | number,
  month?: number,
  day?: number
): string {
  if (dateOrYear instanceof Date) {
    return \`\${dateOrYear.getFullYear()}-\${dateOrYear.getMonth() + 1}-\${dateOrYear.getDate()}\`;
  }
  if (typeof dateOrYear === "number" && month !== undefined && day !== undefined) {
    return \`\${dateOrYear}-\${month}-\${day}\`;
  }
  // 时间戳
  const d = new Date(dateOrYear);
  return \`\${d.getFullYear()}-\${d.getMonth() + 1}-\${d.getDate()}\`;
}

// 调用时，只有重载签名对外可见
console.log(formatDate(new Date()));        // 使用重载 1
console.log(formatDate(1700000000000));      // 使用重载 2
console.log(formatDate(2024, 6, 15));        // 使用重载 3
\`\`\`

#### 重载的重要规则

1. **实现签名对外不可见**：调用者只能看到重载签名，实现签名是内部使用的。
2. **实现签名必须兼容所有重载签名**：实现签名的参数类型必须是所有重载参数类型的联合，返回类型必须兼容所有重载的返回类型。
3. **重载签名之间不需要兼容**：每个重载签名可以有不同的参数个数和类型。
4. **总是优先使用联合类型**：许多场景下，联合类型比重载更简洁。只有在参数类型不同导致返回类型也不同的复杂场景下才使用重载。

### this 参数

TypeScript 允许你在函数参数列表中声明 \`this\` 的类型，但这**不是真正的参数**——它只是告诉编译器"调用这个函数时，\`this\` 应该是什么类型"。转译后 \`this\` 参数会被完全移除。

#### 基本用法

\`\`\`ts
interface User {
  name: string;
  admin: boolean;
}

// 声明 this 参数
function getInfo(this: User, prefix: string): string {
  return \`\${prefix}: \${this.name} (\${this.admin ? "管理员" : "普通用户"})\`;
}

// 正确的调用方式：使用 call 绑定 this
const user: User = { name: "张三", admin: true };
console.log(getInfo.call(user, "用户"));    // "用户: 张三 (管理员)"
// getInfo("直接调用");                      // ❌ this 上下文不正确
\`\`\`

#### 回调函数中的 this

在类方法中，如果方法被当作回调传递，\`this\` 可能会丢失。使用 \`this\` 参数可以捕获这类错误：

\`\`\`ts
class Button {
  constructor(public label: string) {}

  // 声明 this 参数，确保调用时 this 就是 Button
  click(this: Button): void {
    console.log(\`按钮 "\${this.label}" 被点击\`);
  }
}

const btn = new Button("提交");
btn.click();  // 正常

// 如果作为回调传递，this 会丢失，但 this 参数会在编译期报错
// 实际运行时，用 bind 绑定
const handler = btn.click.bind(btn);
handler();  // 运行时正常
\`\`\`

### 剩余参数与参数解构

#### 剩余参数（Rest Parameters）

剩余参数使用 \`...\` 语法将多个参数收集到一个数组中。TypeScript 中剩余参数的类型是数组类型：

\`\`\`ts
// 剩余参数 numbers 收集所有数字参数
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

console.log(sum(1, 2, 3));        // 6
console.log(sum(10, 20, 30, 40)); // 100

// 固定参数 + 剩余参数
function log(prefix: string, ...messages: string[]): void {
  for (const msg of messages) {
    console.log(\`[\${prefix}] \${msg}\`);
  }
}

log("INFO", "服务启动", "端口 3000", "数据库已连接");
\`\`\`

#### 参数解构（Parameter Destructuring）

TypeScript 允许在函数参数中直接解构对象，同时标注类型：

\`\`\`ts
// 参数解构 + 类型标注
function createUser({ name, age, email }: { name: string; age: number; email?: string }): string {
  return \`\${name}, \${age}岁\${email ? \`, 邮箱: \${email}\` : ""}\`;
}

const userInfo = { name: "李四", age: 25, email: "lisi@example.com" };
console.log(createUser(userInfo));  // "李四, 25岁, 邮箱: lisi@example.com"

// 使用 type 别名让代码更清晰
type UserParams = {
  name: string;
  age: number;
  email?: string;
  role?: "admin" | "user";
};

function registerUser({ name, age, email, role = "user" }: UserParams): string {
  return \`注册成功: \${name} (\${role})\`;
}

console.log(registerUser({ name: "王五", age: 30, role: "admin" }));
\`\`\`

### void vs undefined 的微妙区别

\`void\` 和 \`undefined\` 在函数返回类型中有着微妙但重要的区别，这是许多 TypeScript 开发者容易混淆的地方。

#### void 返回类型

当函数的返回类型是 \`void\` 时，意味着**函数的返回值不应该被使用**。TypeScript 允许 \`void\` 返回类型的函数返回任何值（返回值会被忽略）：

\`\`\`ts
// void 返回类型：返回值被忽略
function logMessage(msg: string): void {
  console.log(msg);
  // 即使 return 了一个值，调用者也不能使用
  return;  // 可以
}

// 以下也是合法的
const fn: () => void = () => 42;         // ✅ 返回值被忽略
const fn2: () => void = () => "hello";    // ✅ 同样被忽略
\`\`\`

#### undefined 返回类型

当函数的返回类型是 \`undefined\` 时，函数**必须显式 return undefined 或 return 不带值**：

\`\`\`ts
function returnsUndefined(): undefined {
  return undefined;  // 必须显式返回 undefined
}

function returnsUndefined2(): undefined {
  return;  // 也 OK（相当于 return undefined）
}
\`\`\`

#### 关键区别总结

| 特性 | void | undefined |
| --- | --- | --- |
| 赋值给 void 类型的回调 | 任何返回值都可以 | 任何返回值都可以 |
| 赋值给 undefined 类型的回调 | 只有返回 undefined 的函数才可以 | 只有返回 undefined 的函数才可以 |
| 函数体必须 return | 不需要 | 必须 return undefined 或空 return |
| 语义 | "返回值不应被使用" | "返回值就是 undefined" |

### never 返回类型

\`never\` 类型表示**永远不会发生**的类型。在函数返回类型中，\`never\` 表示函数永远不会正常返回——要么抛出异常，要么进入无限循环。

#### 基本用法

\`\`\`ts
// 抛出异常的函数，返回类型是 never
function throwError(message: string): never {
  throw new Error(message);
}

// 无限循环的函数，返回类型也是 never
function infiniteLoop(): never {
  while (true) {
    console.log("永远运行...");
  }
}

// never 类型的作用：穷尽性检查（Exhaustiveness Checking）
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    case "triangle":
      return (10 * 10) / 2;
    default:
      // 如果 Shape 新增了类型，这里的 shape 就会变成 never
      // 但类型检查会报错，因为 never 不能被赋值
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
  }
}
\`\`\`

#### never 的深层含义

\`never\` 是 TypeScript 类型系统中的**底层类型（bottom type）**——它是所有类型的子类型，但没有任何类型是 \`never\` 的子类型（除了 \`never\` 自身）。这意味着 \`never\` 可以赋值给任何类型，但没有任何类型可以赋值给 \`never\`。

这种特性使 \`never\` 在**穷尽性检查**中非常有用：当你对一个联合类型做 \`switch\` 或 \`if/else\` 全覆盖后，剩余分支中变量的类型就是 \`never\`，如果某天你新增了联合类型的成员，但忘记更新 switch 分支，编译器就会在 \`never\` 赋值处报错，提醒你处理新情况。

### 本节代码演示

下面用一个综合示例演示函数类型表达式、调用签名、构造签名、泛型函数、函数重载、\`this\` 参数、剩余参数与解构、\`void\` 与 \`never\` 的完整用法。代码涵盖了一个小型任务管理系统的核心函数类型设计。`,
    code: `// ============================================================
// 第一章代码演示：函数类型进阶全景
// ============================================================

// ---- 1. 函数类型表达式 ----
console.log("========== 1. 函数类型表达式 ==========");

// 定义函数类型
type Calculator = (a: number, b: number) => number;
type Greeter = (name: string, greeting?: string) => string;

const add: Calculator = (a, b) => a + b;
const multiply: Calculator = (a, b) => a * b;
const greet: Greeter = (name, greeting = "你好") => \`\${greeting}, \${name}!\`;

console.log("add(5, 3):", add(5, 3));
console.log("multiply(4, 7):", multiply(4, 7));
console.log("greet('张三'):", greet("张三"));
console.log("greet('李四', '欢迎'):", greet("李四", "欢迎"));

// ---- 2. 调用签名 ----
console.log("\\n========== 2. 调用签名 ==========");

// 定义一个可调用对象——既是函数，又有属性
interface TaskValidator {
  description: string;
  (taskName: string): boolean;
}

// 创建校验函数
const validateTaskName = function (this: any, taskName: string): boolean {
  return taskName.length >= 3 && taskName.length <= 50;
} as TaskValidator;
validateTaskName.description = "任务名称长度必须在 3-50 个字符之间";

console.log("校验器描述:", validateTaskName.description);
console.log("validateTaskName('买'):", validateTaskName("买"));         // false
console.log("validateTaskName('完成项目报告'):", validateTaskName("完成项目报告")); // true

// 带调用签名的 type 别名
type Logger = {
  level: string;
  (message: string): void;
};

const logger: Logger = (message: string) => {
  console.log(\`[\${logger.level}] \${message}\`);
};
logger.level = "INFO";

logger("服务启动成功");  // "[INFO] 服务启动成功"

// ---- 3. 构造签名 ----
console.log("\\n========== 3. 构造签名 ==========");

// 定义构造签名接口
interface TaskConstructor {
  new (title: string, priority: number): TaskInstance;
}

interface TaskInstance {
  title: string;
  priority: number;
  getInfo(): string;
}

// 实现类
class HighPriorityTask implements TaskInstance {
  constructor(public title: string, public priority: number) {}
  getInfo(): string {
    return \`[高优先级] \${this.title} (优先级: \${this.priority})\`;
  }
}

class NormalTask implements TaskInstance {
  constructor(public title: string, public priority: number) {}
  getInfo(): string {
    return \`[普通] \${this.title} (优先级: \${this.priority})\`;
  }
}

// 工厂函数：接受构造签名
function createTask(ctor: TaskConstructor, title: string, priority: number): TaskInstance {
  return new ctor(title, priority);
}

const task1 = createTask(HighPriorityTask, "紧急修复线上Bug", 1);
const task2 = createTask(NormalTask, "更新文档", 3);
console.log(task1.getInfo());
console.log(task2.getInfo());

// ---- 4. 泛型函数 ----
console.log("\\n========== 4. 泛型函数 ==========");

// 泛型函数：保证输入和输出类型一致
function identity<T>(value: T): T {
  return value;
}

console.log("identity<string>('hello'):", identity<string>("hello"));
console.log("identity<number>(42):", identity<number>(42));
console.log("identity<boolean>(true):", identity<boolean>(true));

// 多类型参数 + 约束
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ name: "张三", age: 30 }, { city: "北京", job: "工程师" });
console.log("合并对象:", JSON.stringify(merged));

// 泛型约束：保证有 length 属性
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log("longest('hello', 'hi'):", longest("hello", "hi"));
console.log("longest([1,2,3], [4,5]):", JSON.stringify(longest([1, 2, 3], [4, 5])));

// 泛型函数：map 实现
function myMap<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const doubled = myMap(numbers, (n) => n * 2);
const stringified = myMap(numbers, (n) => \`数字\${n}\`);
console.log("myMap 翻倍:", doubled);
console.log("myMap 转字符串:", stringified);

// ---- 5. 函数重载 ----
console.log("\\n========== 5. 函数重载 ==========");

// 重载签名：不同参数类型返回不同类型
function processTask(task: string): { title: string; status: string };
function processTask(task: { title: string; priority: number }): { title: string; priority: number; status: string };
// 实现签名
function processTask(
  task: string | { title: string; priority: number }
): { title: string; status: string } | { title: string; priority: number; status: string } {
  if (typeof task === "string") {
    return { title: task, status: "待处理" };
  }
  return { title: task.title, priority: task.priority, status: "处理中" };
}

const result1 = processTask("写周报");
const result2 = processTask({ title: "修复Bug", priority: 1 });
console.log("processTask 字符串:", JSON.stringify(result1));
console.log("processTask 对象:", JSON.stringify(result2));

// 另一个重载示例：统一格式化
function format(value: number): string;
function format(value: Date): string;
function format(value: number | Date): string {
  if (typeof value === "number") {
    return new Date(value).toISOString().split("T")[0];
  }
  return \`\${value.getFullYear()}-\${String(value.getMonth() + 1).padStart(2, "0")}-\${String(value.getDate()).padStart(2, "0")}\`;
}

console.log("format(1700000000000):", format(1700000000000));
console.log("format(new Date()):", format(new Date()));

// ---- 6. this 参数 ----
console.log("\\n========== 6. this 参数 ==========");

interface TaskContext {
  owner: string;
  taskCount: number;
}

function reportTask(this: TaskContext, taskName: string): string {
  return \`\${this.owner} 创建了任务 "\${taskName}" (当前共 \${this.taskCount} 个任务)\`;
}

const ctx: TaskContext = { owner: "张三", taskCount: 5 };
console.log(reportTask.call(ctx, "完成代码审查"));

// 类中的 this 类型
class Counter {
  constructor(public count: number = 0) {}
  increment(this: Counter): Counter {
    this.count++;
    return this;
  }
  getCount(this: Counter): number {
    return this.count;
  }
}

const counter = new Counter(10);
counter.increment().increment().increment();
console.log("计数器:", counter.getCount());

// ---- 7. 剩余参数与参数解构 ----
console.log("\\n========== 7. 剩余参数与参数解构 ==========");

// 剩余参数
function average(...nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

console.log("average(10, 20, 30):", average(10, 20, 30));
console.log("average(1, 2, 3, 4, 5):", average(1, 2, 3, 4, 5));

// 参数解构
type TaskConfig = {
  title: string;
  assignee: string;
  dueDate?: string;
  tags?: string[];
};

function createTaskEntry({ title, assignee, dueDate = "未设置", tags = [] }: TaskConfig): string {
  const tagStr = tags.length > 0 ? \` 标签: [\${tags.join(", ")}]\` : "";
  return \`任务: \${title} | 负责人: \${assignee} | 截止: \${dueDate}\${tagStr}\`;
}

console.log(createTaskEntry({ title: "需求评审", assignee: "李四" }));
console.log(createTaskEntry({ title: "代码重构", assignee: "王五", dueDate: "2024-07-01", tags: ["紧急", "后端"] }));

// ---- 8. void vs never ----
console.log("\\n========== 8. void 与 never 返回类型 ==========");

// void 返回类型：返回值被忽略
function logTask(task: string): void {
  console.log("记录任务:", task);
  // 即使 return 值，也会被忽略
}

logTask("每日站会");

// void 回调类型：可以返回任何值
const callback: () => void = () => {
  return 42;  // ✅ 合法，返回值被忽略
};
const callbackResult = callback();
console.log("void 回调返回的值:", callbackResult);  // 42，但类型上 void 承诺不使用它

// never 用于穷尽性检查
type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

function getStatusText(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "待处理";
    case "in_progress":
      return "进行中";
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      // 如果 TaskStatus 新增了值，这里会报编译错误
      const exhaustive: never = status;
      return exhaustive;
  }
}

console.log("pending 状态:", getStatusText("pending"));
console.log("completed 状态:", getStatusText("completed"));
console.log("cancelled 状态:", getStatusText("cancelled"));

// 抛出异常的函数返回 never
function fail(message: string): never {
  throw new Error(message);
}

// 演示 never 提前退出（不实际抛出，仅说明类型）
function demonstrateNever(): string {
  try {
    // 如果这里调用 fail，函数返回 never
    // fail("出错");
    return "正常执行";
  } catch (e) {
    return "捕获异常";
  }
}

console.log("demonstrateNever:", demonstrateNever());

console.log("\\n函数类型进阶章节演示完成！");`,
  },

  // =========================================================
  // 第二章：泛型基础与实践 (Generics Basics)
  // =========================================================
  {
    id: "ts2-generics-basics",
    title: "泛型基础与实践",
    icon: "🧬",
    group: "函数与类",
    content: `## 泛型基础与实践 (Generics Basics)

泛型（Generics）是 TypeScript 类型系统中最具变革性的特性，也是从"会用 TypeScript"到"精通 TypeScript"的分水岭。泛型让你能够编写**类型安全且可复用的代码**——组件、函数、类可以工作在多种类型上，而不需要预先指定具体的类型。

本章将深入讲解泛型函数、泛型接口、泛型类、泛型约束（Constraints）、在泛型约束中使用类型参数、泛型类型别名，以及 \`keyof\` 与泛型的结合。这些是构建高质量 TypeScript 库和框架的必备基础。

### 为什么需要泛型

初学 TypeScript 时，你可能会用 \`any\` 来应对"不知道类型"的场景：

\`\`\`ts
// 用 any 实现的"通用"函数
function identityAny(arg: any): any {
  return arg;
}

const result = identityAny("hello");
// result 的类型是 any——类型信息丢失了！
result.toUpperCase();  // 不会有类型检查，运行时可能出错
\`\`\`

\`any\` 的问题在于**丢失了类型信息**：你不知道 \`identityAny\` 返回的是什么类型。泛型解决了这个问题：它**捕获并保留类型信息**。

\`\`\`ts
// 泛型版本：类型信息完整保留
function identity<T>(arg: T): T {
  return arg;
}

const result = identity("hello");
// result 的类型是 "hello"（字面量类型），不是 any！
result.toUpperCase();  // ✅ 类型安全，IDE 有完整提示
\`\`\`

### 泛型函数

泛型函数是泛型最基本的应用形式。在函数名后添加 \`<Type>\`（或 \`<T>\`）来声明类型参数，然后在参数类型和返回类型中使用它。

#### 类型参数命名惯例

TypeScript 社区对类型参数有约定俗成的命名：

| 惯例 | 含义 | 示例 |
| --- | --- | --- |
| \`T\` | Type，通用类型 | \`function foo<T>(x: T)\` |
| \`K\` | Key，键类型 | \`function getProp<T, K>(obj: T, key: K)\` |
| \`V\` | Value，值类型 | \`interface Map<K, V>\` |
| \`E\` | Element，元素类型 | \`interface ArrayLike<E>\` |
| \`R\` | Return，返回类型 | 常用于回调类型参数 |

#### 类型推断

调用泛型函数时，通常不需要显式指定类型参数——TypeScript 会根据传入的参数**自动推断**：

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 自动推断：T 推断为 number
const n = first([1, 2, 3]);     // n: number | undefined

// 自动推断：T 推断为 string
const s = first(["a", "b"]);    // s: string | undefined

// 也可以手动指定
const n2 = first<number>([1, 2, 3]);  // 显式指定 T = number
\`\`\`

#### 多个类型参数

泛型函数可以有多个类型参数，用逗号分隔：

\`\`\`ts
// 两参数泛型：建立输入和输出之间的类型关系
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair("hello", 42);           // [string, number]
const p2 = pair(true, { name: "张三" }); // [boolean, { name: string }]
\`\`\`

### 泛型接口

泛型接口允许你定义一个**类型模板**——接口的部分类型由使用方决定。

#### 基本泛型接口

\`\`\`ts
// 泛型接口：定义一个容器
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(newValue: T): void;
}

// 使用 string 版本的 Container
const stringContainer: Container<string> = {
  value: "hello",
  getValue() { return this.value; },
  setValue(newValue) { this.value = newValue; },
};

// 使用 number 版本的 Container
const numberContainer: Container<number> = {
  value: 42,
  getValue() { return this.value; },
  setValue(newValue) { this.value = newValue; },
};
\`\`\`

#### 实践中的泛型接口

泛型接口在实际开发中无处不在。以分页查询结果为例：

\`\`\`ts
// 分页查询结果接口
interface PaginatedResult<T> {
  data: T[];          // 数据列表，类型由调用方决定
  total: number;      // 总数
  page: number;       // 当前页码
  pageSize: number;   // 每页数量
  hasMore: boolean;   // 是否有更多
}

// 使用泛型接口
interface User {
  id: number;
  name: string;
}

const userResult: PaginatedResult<User> = {
  data: [{ id: 1, name: "张三" }, { id: 2, name: "李四" }],
  total: 100,
  page: 1,
  pageSize: 10,
  hasMore: true,
};

// 另一个场景：API 响应
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 使用时指定 T
type UserResponse = ApiResponse<User>;
type UserListResponse = ApiResponse<User[]>;
\`\`\`

### 泛型类

泛型类与泛型接口类似，类定义中的类型参数可以在类的属性和方法中使用。

#### 基本泛型类

\`\`\`ts
// 泛型栈：元素类型由调用方指定
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// 使用
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log(numberStack.pop());  // 3
console.log(numberStack.peek()); // 2

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
console.log(stringStack.size);   // 2
\`\`\`

#### 泛型类的静态成员

**重要规则**：泛型类的**静态成员不能使用类的类型参数**。因为静态成员属于类本身，不属于实例，而类型参数是在实例化时才确定的。

\`\`\`ts
class MyClass<T> {
  // ✅ 实例成员可以使用 T
  instanceValue: T;

  // ❌ 静态成员不能使用 T
  // static staticValue: T;  // 编译错误！

  // ✅ 静态成员可以有自己的泛型参数
  static create<T>(value: T): MyClass<T> {
    const instance = new MyClass<T>();
    instance.instanceValue = value;
    return instance;
  }

  constructor() {
    this.instanceValue = undefined as unknown as T;
  }
}
\`\`\`

### 泛型约束（Generic Constraints）

有时你需要限制类型参数必须满足某些条件。使用 \`extends\` 关键字定义约束。

#### 基本约束

\`\`\`ts
// 约束：T 必须包含 .length 属性
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(\`长度: \${arg.length}\`);
  return arg;
}

logLength("hello");             // ✅ string 有 length
logLength([1, 2, 3]);           // ✅ 数组有 length
logLength({ length: 10, name: "test" }); // ✅ 有 length 属性
// logLength(123);              // ❌ number 没有 length
\`\`\`

#### 使用 keyof 作为约束

\`keyof\` 操作符提取对象类型的所有键名组成的联合类型。结合泛型约束，可以安全地访问对象属性：

\`\`\`ts
// 约束 K 必须是 T 的键名之一
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "张三", age: 30, city: "北京" };

const name = getProperty(person, "name");    // 类型: string，安全
const age = getProperty(person, "age");      // 类型: number，安全
// const invalid = getProperty(person, "email"); // ❌ email 不是 person 的键
\`\`\`

这个模式非常强大——\`getProperty\` 不仅保证传入的 \`key\` 是对象中存在的属性名，还保证**返回值的类型精确匹配该属性的类型**。

#### 约束类型参数的实践

约束在实际项目中有大量应用。例如，一个类型安全的 \`pick\` 函数：

\`\`\`ts
// 从对象中挑选指定的属性，类型安全
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

const user = { id: 1, name: "张三", email: "zhangsan@example.com", age: 30 };
const picked = pick(user, ["name", "email"]);
// picked 的类型是 { name: string; email: string }
console.log(picked.name);      // "张三"
console.log(picked.email);     // "zhangsan@example.com"
\`\`\`

### 在泛型约束中使用类型参数

你可以在一个类型参数的约束中使用另一个类型参数，创建类型参数之间的关联：

\`\`\`ts
// K 被约束为 T 的键名
function getPropertySafe<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 示例：确保传入的 key 确实是 obj 的属性
const config = { host: "localhost", port: 3000, debug: false };
const host = getPropertySafe(config, "host");  // host: string
const port = getPropertySafe(config, "port");  // port: number
// const err = getPropertySafe(config, "timeout"); // ❌ 编译错误
\`\`\`

另一个经典示例——类型安全的属性赋值：

\`\`\`ts
// 使用泛型约束确保赋值的值类型正确
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}

const settings = { theme: "dark" as "dark" | "light", fontSize: 14 };
setProperty(settings, "theme", "light");   // ✅ 值类型匹配
setProperty(settings, "fontSize", 16);     // ✅ 值类型匹配
// setProperty(settings, "theme", "blue"); // ❌ "blue" 不是 "dark" | "light"
// setProperty(settings, "fontSize", "16"); // ❌ 字符串不能赋值给 number
\`\`\`

### 泛型类型别名

\`type\` 别名也可以使用泛型，创建可复用的类型转化工具：

\`\`\`ts
// 泛型类型别名：创建可复用的类型转化
type Nullable<T> = T | null;
type Maybe<T> = T | undefined;
type NullableOrMaybe<T> = T | null | undefined;

// 使用
type NullableString = Nullable<string>;  // string | null
type MaybeNumber = Maybe<number>;        // number | undefined

const name: NullableString = null;       // ✅
const age: MaybeNumber = undefined;      // ✅

// 更复杂的泛型别名
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// 使用
type UserResult = Result<{ id: number; name: string }, string>;
const ok: UserResult = { success: true, data: { id: 1, name: "张三" } };
const fail: UserResult = { success: false, error: "用户不存在" };
\`\`\`

#### 泛型类型别名与函数类型

泛型类型别名也可以用来描述函数类型：

\`\`\`ts
// 泛型函数类型别名
type Mapper<T, U> = (item: T, index: number) => U;
type Predicate<T> = (item: T) => boolean;
type Reducer<T, U> = (accumulator: U, current: T) => U;

// 使用这些类型别名定义函数
const stringToNumber: Mapper<string, number> = (s) => parseInt(s, 10);
const isPositive: Predicate<number> = (n) => n > 0;
const sumReducer: Reducer<number, number> = (acc, cur) => acc + cur;

console.log(stringToNumber("42", 0));         // 42
console.log(isPositive(-5));                   // false
console.log([1, 2, 3, 4].reduce(sumReducer, 0)); // 10
\`\`\`

### keyof 与泛型的深度结合

\`keyof\` 是 TypeScript 类型系统的核心操作符之一，它返回一个对象类型所有键名组成的联合类型。与泛型结合后，\`keyof\` 的威力会被放大数倍。

#### keyof 基础

\`\`\`ts
type Person = {
  name: string;
  age: number;
  location: string;
};

type PersonKeys = keyof Person;  // "name" | "age" | "location"

// 泛型 + keyof 模式
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const people: Person[] = [
  { name: "张三", age: 30, location: "北京" },
  { name: "李四", age: 25, location: "上海" },
];

const names = pluck(people, "name");      // string[]
const ages = pluck(people, "age");        // number[]
console.log(names);  // ["张三", "李四"]
console.log(ages);   // [30, 25]
\`\`\`

#### 泛型 + keyof 的实际应用场景

这个组合在实际开发中极为常见：

1. **类型安全的属性访问**：确保访问的属性确实存在，且返回值类型正确。
2. **类型安全的对象操作**：如 \`pick\`、\`omit\`、\`pluck\` 等函数。
3. **事件监听器注册**：确保事件名称是合法的。
4. **配置对象的类型推导**：从配置对象推导出合法的配置选项。

### 本节代码演示

下面用一个综合示例演示泛型函数、泛型接口、泛型类、泛型约束、\`keyof\` 与泛型的结合用法。示例构建了一个小型的类型安全数据管理工具。`,
    code: `// ============================================================
// 第二章代码演示：泛型基础与实践全景
// ============================================================

// ---- 1. 泛型函数 ----
console.log("========== 1. 泛型函数 ==========");

// 基本泛型函数：identity
function identity<T>(value: T): T {
  return value;
}

console.log("identity<string>('hello'):", identity<string>("hello"));
console.log("identity<number>(42):", identity<number>(42));
// 类型推断
console.log("identity(true):", identity(true));  // T 推断为 boolean

// 多参数泛型函数
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}

const swapped = swap([1, "hello"]);
console.log("swap([1, 'hello']):", JSON.stringify(swapped));  // ["hello", 1]

// 泛型数组工具函数
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const nums = [1, 2, 3, 4, 5, 6, 7];
console.log("first(nums):", first(nums));
console.log("last(nums):", last(nums));
console.log("chunk(nums, 3):", JSON.stringify(chunk(nums, 3)));

// ---- 2. 泛型接口 ----
console.log("\\n========== 2. 泛型接口 ==========");

// 泛型仓库接口
interface Repository<T> {
  getAll(): T[];
  getById(id: number): T | undefined;
  add(item: T): void;
  remove(id: number): boolean;
}

// 实体类型
interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

// 实现泛型接口的类
class InMemoryRepository<T extends { id: number }> implements Repository<T> {
  private items: T[] = [];

  getAll(): T[] {
    return [...this.items];
  }

  getById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  add(item: T): void {
    this.items.push(item);
  }

  remove(id: number): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}

// 使用 User 仓库
const userRepo = new InMemoryRepository<User>();
userRepo.add({ id: 1, name: "张三", email: "zhangsan@example.com" });
userRepo.add({ id: 2, name: "李四", email: "lisi@example.com" });
userRepo.add({ id: 3, name: "王五", email: "wangwu@example.com" });

console.log("所有用户:", JSON.stringify(userRepo.getAll()));
console.log("ID=2 的用户:", JSON.stringify(userRepo.getById(2)));
console.log("删除 ID=1:", userRepo.remove(1));
console.log("删除后所有用户:", JSON.stringify(userRepo.getAll()));

// 使用 Product 仓库
const productRepo = new InMemoryRepository<Product>();
productRepo.add({ id: 1, title: "笔记本电脑", price: 5999 });
productRepo.add({ id: 2, title: "机械键盘", price: 399 });
console.log("所有产品:", JSON.stringify(productRepo.getAll()));

// ---- 3. 泛型类 ----
console.log("\\n========== 3. 泛型类 ==========");

// 泛型队列
class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  front(): T | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// 使用数字队列
const numberQueue = new Queue<number>();
numberQueue.enqueue(10);
numberQueue.enqueue(20);
numberQueue.enqueue(30);
console.log("队列内容:", numberQueue.toArray());
console.log("出队:", numberQueue.dequeue());
console.log("出队后:", numberQueue.toArray());
console.log("队首:", numberQueue.front());
console.log("队列大小:", numberQueue.size);

// 使用字符串队列
const taskQueue = new Queue<string>();
taskQueue.enqueue("任务A");
taskQueue.enqueue("任务B");
taskQueue.enqueue("任务C");
console.log("任务队列:", taskQueue.toArray());

// 泛型 Key-Value 存储
class KeyValueStore<K extends string | number, V> {
  private store = new Map<K, V>();

  set(key: K, value: V): void {
    this.store.set(key, value);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  getAll(): [K, V][] {
    return Array.from(this.store.entries());
  }
}

const store = new KeyValueStore<string, number>();
store.set("score", 95);
store.set("level", 3);
store.set("coins", 150);
console.log("score:", store.get("score"));
console.log("has level:", store.has("level"));
console.log("所有键值对:", JSON.stringify(store.getAll()));

// ---- 4. 泛型约束 ----
console.log("\\n========== 4. 泛型约束 ==========");

// 约束：必须包含 length 属性
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): T {
  console.log("长度:", item.length);
  return item;
}

logLength("Hello TypeScript");      // 字符串有 length
logLength([1, 2, 3, 4, 5]);         // 数组有 length
logLength({ length: 42, value: "test" });  // 对象有 length 属性

// 约束：必须包含 name 属性
interface HasName {
  name: string;
}

function greet<T extends HasName>(entity: T): string {
  return \`你好，\${entity.name}！\`;
}

console.log(greet({ name: "张三", age: 30 }));
console.log(greet({ name: "项目组", members: 10 }));

// 约束：必须包含 id 属性
interface HasId {
  id: number | string;
}

function findById<T extends HasId>(items: T[], id: T["id"]): T | undefined {
  return items.find(item => item.id === id);
}

const items = [
  { id: "a1", value: "第一项" },
  { id: "a2", value: "第二项" },
  { id: "a3", value: "第三项" },
];

const found = findById(items, "a2");
console.log("找到的项目:", JSON.stringify(found));

// ---- 5. keyof + 泛型 ----
console.log("\\n========== 5. keyof + 泛型深度结合 ==========");

// 类型安全的属性访问
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "张三",
  age: 30,
  city: "北京",
  skills: ["TypeScript", "React", "Node.js"],
};

console.log("getProperty(person, 'name'):", getProperty(person, "name"));
console.log("getProperty(person, 'age'):", getProperty(person, "age"));
console.log("getProperty(person, 'skills'):", JSON.stringify(getProperty(person, "skills")));

// 类型安全的 pluck 函数
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

interface Employee {
  name: string;
  department: string;
  salary: number;
}

const employees: Employee[] = [
  { name: "张三", department: "工程部", salary: 15000 },
  { name: "李四", department: "设计部", salary: 12000 },
  { name: "王五", department: "工程部", salary: 18000 },
];

const empNames = pluck(employees, "name");
const empDepartments = pluck(employees, "department");
const empSalaries = pluck(employees, "salary");

console.log("员工姓名:", empNames);
console.log("员工部门:", empDepartments);
console.log("员工薪资:", empSalaries);

// 类型安全的 pick 函数
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

const config = {
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "secret",
  database: "mydb",
};

const connectionConfig = pick(config, ["host", "port", "database"]);
console.log("连接配置:", JSON.stringify(connectionConfig));

// 类型安全的对象更新
function updateField<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}

const updatedPerson = updateField(person, "age", 31);
console.log("更新后的人员:", JSON.stringify(updatedPerson));

// ---- 6. 泛型实战：类型安全的 EventEmitter ----
console.log("\\n========== 6. 泛型实战：类型安全的 EventEmitter ==========");

// 定义事件映射类型
type EventMap = {
  "user:login": { userId: number; timestamp: number };
  "user:logout": { userId: number };
  "task:created": { taskId: string; title: string };
  "task:completed": { taskId: string; completedAt: number };
  "error": { message: string; code: number };
};

// 泛型 EventEmitter 类
class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Array<(data: any) => void>>();

  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  off<K extends keyof Events>(event: K): void {
    this.listeners.delete(event);
  }
}

// 使用 EventEmitter
const emitter = new TypedEventEmitter<EventMap>();

// 注册监听器——完全类型安全
emitter.on("user:login", (data) => {
  console.log(\`用户 \${data.userId} 于 \${new Date(data.timestamp).toLocaleString()} 登录\`);
});

emitter.on("task:created", (data) => {
  console.log(\`任务创建: \${data.taskId} - \${data.title}\`);
});

emitter.on("error", (data) => {
  console.log(\`错误 [\${data.code}]: \${data.message}\`);
});

// 触发事件
emitter.emit("user:login", { userId: 1001, timestamp: Date.now() });
emitter.emit("task:created", { taskId: "T-001", title: "完成项目报告" });
emitter.emit("error", { message: "连接超时", code: 500 });

console.log("\\n泛型基础与实践章节演示完成！");`,
  },

  // =========================================================
  // 第三章：泛型高级模式 (Advanced Generic Patterns)
  // =========================================================
  {
    id: "ts2-generics-advanced",
    title: "泛型高级模式",
    icon: "🔬",
    group: "函数与类",
    content: `## 泛型高级模式 (Advanced Generic Patterns)

掌握了泛型的基础用法后，TypeScript 的类型系统为你打开了一扇通往**类型级编程**的大门。本章将深入讲解泛型的高级应用：条件类型与泛型的结合、映射类型与泛型的结合、模板字面量类型与泛型的结合、\`infer\` 关键字、分发条件类型（Distributive Conditional Types），以及类型参数的变型标注（Variance Annotations）。

这些高级模式是构建工业级 TypeScript 类型工具库的核心技术，也是理解社区流行类型库（如 type-fest、ts-toolbelt）内部实现的基础。

### 条件类型与泛型

条件类型（Conditional Types）的语法是 \`T extends U ? X : Y\`，它根据类型 \`T\` 是否可以赋值给 \`U\` 来选择 \`X\` 或 \`Y\`。当条件类型与泛型结合时，它的真正威力才得以展现。

#### 基本语法

\`\`\`ts
// 条件类型：如果 T 是 string 的子类型，返回 string，否则返回 number
type StringOrNumber<T> = T extends string ? string : number;

type A = StringOrNumber<"hello">;  // string（"hello" 是 string 的子类型）
type B = StringOrNumber<42>;       // number（42 不是 string 的子类型）
type C = StringOrNumber<boolean>;  // number（boolean 不是 string 的子类型）
\`\`\`

#### 条件类型 + 泛型的实际应用

条件类型最常见的用途是**根据输入类型改变输出类型**：

\`\`\`ts
// 提取数组元素类型，非数组返回原类型
type Flatten<T> = T extends any[] ? T[number] : T;

type Str = Flatten<string[]>;    // string
type Num = Flatten<number>;      // number
type Bool = Flatten<boolean[]>;  // boolean

// 提取 Promise 内层类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type R1 = Awaited<Promise<string>>;  // string
type R2 = Awaited<number>;           // number
\`\`\`

### 分发条件类型（Distributive Conditional Types）

这是 TypeScript 类型系统中最精妙也最容易踩坑的特性之一。当条件类型 \`T extends U ? X : Y\` 中的 \`T\` 是一个**裸类型参数（naked type parameter）**且 \`T\` 是联合类型时，条件类型会被**分发（distribute）**到联合类型的每个成员上。

#### 分发机制

\`\`\`ts
// 分发条件类型
type ToArray<T> = T extends any ? T[] : never;

// 当 T 是联合类型时，分发发生
type Result = ToArray<string | number>;
// 等价于：ToArray<string> | ToArray<number>
// 即：string[] | number[]
\`\`\`

分发的本质是：\`ToArray<string | number>\` 被展开为 \`ToArray<string> | ToArray<number>\`，然后分别计算。

#### 阻止分发

有时你**不希望**分发发生。把类型参数包裹在元组或数组中即可阻止分发：

\`\`\`ts
// 不分发版本：用元组包裹类型参数
type ToArrayNoDistribute<T> = [T] extends [any] ? T[] : never;

type Result2 = ToArrayNoDistribute<string | number>;
// 结果是 (string | number)[] 而不是 string[] | number[]
\`\`\`

#### 分发条件的实用场景

分发条件类型最经典的用途是 TypeScript 内置的 \`Exclude\` 和 \`Extract\` 工具类型：

\`\`\`ts
// 从联合类型 T 中排除 U
type MyExclude<T, U> = T extends U ? never : U;

// 从联合类型 T 中提取 U
type MyExtract<T, U> = T extends U ? T : never;

type Events = "click" | "scroll" | "keydown" | "mousemove";
type MouseEvents = MyExtract<Events, "click" | "mousemove">;  // "click" | "mousemove"
type NonMouseEvents = MyExclude<Events, "click" | "mousemove">; // "scroll" | "keydown"
\`\`\`

### infer 关键字

\`infer\` 是条件类型中最强大的关键字，它允许你在条件类型的 \`extends\` 子句中**声明一个类型变量来捕获/推断类型**。

#### 基本用法

\`\`\`ts
// 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never;

type E1 = ElementType<string[]>;    // string
type E2 = ElementType<number[]>;    // number
type E3 = ElementType<boolean>;     // never（不是数组）

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type F1 = ReturnType<() => string>;        // string
type F2 = ReturnType<(x: number) => number>; // number
type F3 = ReturnType<string>;              // never
\`\`\`

#### 多个 infer 变量

\`infer\` 可以在一个条件类型中使用多次：

\`\`\`ts
// 提取 Promise 的值类型（递归）
type DeepAwaited<T> = T extends Promise<infer U>
  ? DeepAwaited<U>
  : T;

type R = DeepAwaited<Promise<Promise<number>>>; // number

// 提取函数参数类型为元组
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type P1 = Parameters<(a: string, b: number) => void>; // [string, number]
type P2 = Parameters<() => void>;                       // []
\`\`\`

#### infer 的协变与逆变位置

\`infer\` 在不同位置有不同的行为：
- **协变位置**（如返回类型、数组元素）：推断出联合类型
- **逆变位置**（如函数参数）：推断出交叉类型

\`\`\`ts
// 协变位置：推断出联合类型
type Covariant<T> = T extends { value: infer V } ? V : never;
type CV = Covariant<{ value: string } | { value: number }>; // string | number

// 逆变位置：推断出交叉类型
type Contravariant<T> = T extends { handler: (x: infer V) => void } ? V : never;
type CT = Contravariant<
  { handler: (x: string) => void } | { handler: (x: number) => void }
>; // string & number（即 never）
\`\`\`

### 映射类型与泛型

映射类型（Mapped Types）允许你**基于已有类型创建新类型**，遍历联合类型的每个成员并应用转化。与泛型结合后，映射类型成为创建可复用类型转化工具的核心机制。

#### 基本语法

\`\`\`ts
// 映射类型：将 T 的所有属性变为只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 映射类型：将 T 的所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 使用
interface User {
  name: string;
  age: number;
  email: string;
}

type ReadonlyUser = MyReadonly<User>;
type PartialUser = MyPartial<User>;
\`\`\`

#### 映射修饰符

映射类型支持 \`+\` 和 \`-\` 修饰符来控制 \`readonly\` 和 \`?\`：

\`\`\`ts
// 移除 readonly
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// 移除可选
type Required<T> = {
  [K in keyof T]-?: T[K];
};

// 组合使用
type MutableRequired<T> = {
  -readonly [K in keyof T]-?: T[K];
};
\`\`\`

#### 键名重映射（Key Remapping via as）

TypeScript 4.1 引入了 \`as\` 子句，允许在映射类型中重命名键：

\`\`\`ts
// 将所有属性名加上 get 前缀
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 过滤出特定类型的属性
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type StringFields = PickByType<Person, string>;
// { name: string }
\`\`\`

### 模板字面量类型与泛型

模板字面量类型（Template Literal Types）是 TypeScript 4.1 引入的特性，允许在类型层面进行字符串拼接和操作。与泛型结合后，可以实现极其强大的字符串类型转化。

#### 基本语法

\`\`\`ts
type World = "world";
type Greeting = \`hello \${World}\`;  // "hello world"

// 与联合类型结合：自动分发
type EventName = "click" | "focus" | "blur";
type HandlerName = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onFocus" | "onBlur"
\`\`\`

#### 泛型 + 模板字面量类型

\`\`\`ts
// 为对象创建事件处理器类型
type EventHandlers<T> = {
  [K in keyof T & string as \`on\${Capitalize<K>}Change\`]: (value: T[K]) => void;
};

interface FormState {
  name: string;
  age: number;
  email: string;
}

type FormHandlers = EventHandlers<FormState>;
// {
//   onNameChange: (value: string) => void;
//   onAgeChange: (value: number) => void;
//   onEmailChange: (value: string) => void;
// }
\`\`\`

#### 模板字面量类型的内置工具

TypeScript 提供了四个内置的字符串操作类型：

| 类型 | 作用 | 示例 |
| --- | --- | --- |
| \`Uppercase<S>\` | 转为大写 | \`Uppercase<"hello">\` → \`"HELLO"\` |
| \`Lowercase<S>\` | 转为小写 | \`Lowercase<"HELLO">\` → \`"hello"\` |
| \`Capitalize<S>\` | 首字母大写 | \`Capitalize<"hello">\` → \`"Hello"\` |
| \`Uncapitalize<S>\` | 首字母小写 | \`Uncapitalize<"Hello">\` → \`"hello"\` |

### 变型标注（Variance Annotations）

TypeScript 4.7 引入了可选的变型标注，允许在泛型类型参数上显式标注协变（\`out\`）或逆变（\`in\`）。这有助于编译器更精确地进行类型检查，并且在某些场景下可以提升性能。

#### 变型的概念

- **协变（Covariance）**：如果 \`A\` 是 \`B\` 的子类型，那么 \`F<A>\` 也是 \`F<B>\` 的子类型。标注为 \`out\`。
- **逆变（Contravariance）**：如果 \`A\` 是 \`B\` 的子类型，那么 \`F<B>\` 是 \`F<A>\` 的子类型。标注为 \`in\`。
- **不变（Invariance）**：\`F<A>\` 和 \`F<B>\` 之间没有子类型关系。

#### 变型标注语法

\`\`\`ts
// 协变：类型参数只出现在输出位置（返回值）
interface ReadonlyList<out T> {
  get(index: number): T;
  // set(index: number, value: T): void; // ❌ 协变类型不能出现在输入位置
}

// 逆变：类型参数只出现在输入位置（参数）
interface Consumer<in T> {
  consume(value: T): void;
  // get(): T; // ❌ 逆变类型不能出现在输出位置
}

// 不变：类型参数出现在输入和输出位置（默认）
interface List<T> {
  get(index: number): T;
  set(index: number, value: T): void;
}
\`\`\`

#### 变型标注的意义

1. **更精确的类型检查**：编译器能更好地理解子类型关系。
2. **性能优化**：在大型项目中，变型标注可以减少编译器需要追踪的类型关系数量。
3. **文档价值**：变型标注清楚地表达了类型参数的用途。

### 本节代码演示

下面用一个综合示例演示条件类型、分发条件类型、\`infer\` 关键字、映射类型、模板字面量类型与泛型的高级结合用法。示例实现了一个类型安全的深度对象转化工具集。`,
    code: `// ============================================================
// 第三章代码演示：泛型高级模式全景
// ============================================================

// ---- 1. 条件类型与泛型 ----
console.log("========== 1. 条件类型与泛型 ==========");

// 条件类型：根据输入类型选择输出类型
type IsString<T> = T extends string ? "是字符串" : "不是字符串";

// 验证条件类型（编译期类型计算，通过赋值验证）
const check1: IsString<string> = "是字符串";
const check2: IsString<number> = "不是字符串";
const check3: IsString<"hello"> = "是字符串";
console.log("条件类型 IsString 验证通过（编译期类型计算正确）");

// 条件类型实践：提取数组元素类型
type UnpackArray<T> = T extends (infer U)[] ? U : T;

// 通过运行时 typeof 和行为验证
function unpackArray<T>(arr: T): UnpackArray<T> {
  if (Array.isArray(arr)) {
    return (arr.length > 0 ? arr[0] : undefined) as UnpackArray<T>;
  }
  return arr as UnpackArray<T>;
}

console.log("unpackArray([1,2,3]):", unpackArray([1, 2, 3]));
console.log("unpackArray('hello'):", unpackArray("hello"));
console.log("unpackArray(42):", unpackArray(42));

// 条件类型：深度展开 Promise
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T;

async function demoUnwrap(): Promise<void> {
  const p: Promise<Promise<number>> = Promise.resolve(Promise.resolve(42));
  const result = await (await p);
  console.log("DeepUnwrap 验证（运行时）:", result, "typeof:", typeof result);
}
demoUnwrap();

// ---- 2. 分发条件类型 ----
console.log("\\n========== 2. 分发条件类型 ==========");

// 分发条件类型：将联合类型的每个成员转为数组
type ToArray<T> = T extends any ? T[] : never;

// 验证分发行为
const arr1: ToArray<string> = ["hello"];
const arr2: ToArray<string | number> = [1, 2, 3];  // 可以是 string[] 或 number[]
const arr3: ToArray<string | number> = ["a", "b"];  // 也可以是 string[] 或 number[]
console.log("分发条件类型 ToArray 验证通过");

// 阻止分发：用元组包裹
type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
const arr4: ToArrayNoDist<string | number> = ["hello", 42];  // (string | number)[]
console.log("不分发版本：可以混合类型:", arr4);

// 实现 Exclude 和 Extract
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

type AllStatus = "idle" | "loading" | "success" | "error";
type LoadingStates = MyExtract<AllStatus, "loading" | "error">;
type NonLoadingStates = MyExclude<AllStatus, "loading" | "error">;

const loading: LoadingStates = "loading";
const nonLoading: NonLoadingStates = "idle";
console.log("MyExtract 示例:", loading);
console.log("MyExclude 示例:", nonLoading);

// 分发条件类型：深度 Readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

interface Config {
  database: {
    host: string;
    port: number;
  };
  features: string[];
}

// 编译期验证（通过类型赋值）
const config: DeepReadonly<Config> = {
  database: { host: "localhost", port: 5432 },
  features: ["auth", "logging"],
};
console.log("DeepReadonly 配置:", JSON.stringify(config));

// ---- 3. infer 关键字 ----
console.log("\\n========== 3. infer 关键字深度应用 ==========");

// infer 提取函数参数类型
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

function buildUrl(base: string, path: string, query: Record<string, string>): string {
  const qs = Object.entries(query).map(([k, v]) => \`\${k}=\${v}\`).join("&");
  return \`\${base}/\${path}?\${qs}\`;
}

type BuildUrlParams = MyParameters<typeof buildUrl>;
// 运行时验证
const params: BuildUrlParams = ["https://api.example.com", "users", { page: "1", limit: "10" }];
console.log("buildUrl 参数:", params);
console.log("buildUrl 结果:", buildUrl(...params));

// infer 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type BuildUrlReturn = MyReturnType<typeof buildUrl>;
const url: BuildUrlReturn = buildUrl("https://api.example.com", "users", { page: "1" });
console.log("buildUrl 返回类型验证:", url);

// infer 提取 Promise 值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

async function fetchUser(): Promise<{ id: number; name: string }> {
  return { id: 1, name: "张三" };
}

type UserType = UnwrapPromise<ReturnType<typeof fetchUser>>;
(async () => {
  const user: UserType = await fetchUser();
  console.log("UnwrapPromise 验证:", JSON.stringify(user));
})();

// infer 提取数组元素
type ElementOf<T> = T extends (infer E)[] ? E : never;

const numbers: number[] = [1, 2, 3];
type NumElement = ElementOf<typeof numbers>;
const elem: NumElement = 42;
console.log("ElementOf 验证:", elem);

// 链式 infer：提取深层类型
type GetResponseType<T> = T extends { data: infer D } ? D : never;

interface ApiResponse {
  code: number;
  message: string;
  data: { users: { id: number; name: string }[]; total: number };
}

type ResponseData = GetResponseType<ApiResponse>;
const responseData: ResponseData = {
  users: [{ id: 1, name: "张三" }],
  total: 1,
};
console.log("GetResponseType 验证:", JSON.stringify(responseData));

// ---- 4. 映射类型高级应用 ----
console.log("\\n========== 4. 映射类型高级应用 ==========");

// 映射类型：将所有属性变为可选
type MyPartial<T> = { [K in keyof T]?: T[K] };

// 映射类型：将所有属性变为必填
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// 映射类型：属性全部变为 nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };

interface UserProfile {
  id: number;
  name: string;
  email: string;
  bio: string;
}

// 运行时创建对象验证
const partialUser: MyPartial<UserProfile> = { name: "张三" };
const requiredUser: MyRequired<UserProfile> = {
  id: 1,
  name: "李四",
  email: "lisi@example.com",
  bio: "开发者",
};
const nullableUser: Nullable<UserProfile> = {
  id: 1,
  name: "王五",
  email: null,
  bio: null,
};

console.log("Partial 用户:", JSON.stringify(partialUser));
console.log("Required 用户:", JSON.stringify(requiredUser));
console.log("Nullable 用户:", JSON.stringify(nullableUser));

// 键名重映射：添加前缀
type Prefixed<T, P extends string> = {
  [K in keyof T as \`\${P}\${Capitalize<string & K>}\`]: T[K];
};

type PrefixedUser = Prefixed<UserProfile, "user">;
const prefixed: PrefixedUser = {
  userId: 1,
  userName: "张三",
  userEmail: "zhangsan@example.com",
  userBio: "工程师",
};
console.log("Prefixed 用户:", JSON.stringify(prefixed));

// 映射类型：过滤出函数类型的属性
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type PickFunctions<T> = Pick<T, FunctionKeys<T>>;

interface Controller {
  name: string;
  version: number;
  start(): void;
  stop(): void;
  restart(): boolean;
}

// 运行时验证：函数键名
type ControllerFunctions = FunctionKeys<Controller>;
const funcKeys: ControllerFunctions = "start";  // "start" | "stop" | "restart"
console.log("FunctionKeys 示例:", funcKeys);

// ---- 5. 模板字面量类型与泛型 ----
console.log("\\n========== 5. 模板字面量类型与泛型 ==========");

// 模板字面量类型：创建事件处理器映射
type EventNames = "click" | "change" | "submit" | "focus";

type EventHandlerNames = \`on\${Capitalize<EventNames>}\`;
// "onClick" | "onChange" | "onSubmit" | "onFocus"

const handler1: EventHandlerNames = "onClick";
const handler2: EventHandlerNames = "onSubmit";
console.log("事件处理器名称:", handler1, handler2);

// 模板字面量 + 映射类型：为对象创建 getter/setter 类型
type Accessorify<T> = {
  [K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K];
} & {
  [K in keyof T & string as \`set\${Capitalize<K>}\`]: (value: T[K]) => void;
};

interface FormData {
  username: string;
  age: number;
  remember: boolean;
}

// 运行时实现
const formAccessors: Accessorify<FormData> = {
  getUsername: () => "张三",
  setUsername: (value: string) => { console.log("设置 username:", value); },
  getAge: () => 30,
  setAge: (value: number) => { console.log("设置 age:", value); },
  getRemember: () => true,
  setRemember: (value: boolean) => { console.log("设置 remember:", value); },
};

console.log("getUsername():", formAccessors.getUsername());
console.log("getAge():", formAccessors.getAge());
formAccessors.setUsername("李四");
formAccessors.setAge(25);

// 模板字面量 + 条件类型：深层路径类型
type Paths<T, P extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? Paths<T[K], \`\${P}\${K}.\`>
        : \`\${P}\${K}\`;
    }[keyof T & string]
  : never;

// 简化版：只做一层
type ObjectPaths<T> = {
  [K in keyof T & string]: \`\${K}\`;
}[keyof T & string];

interface DeepConfig {
  server: { host: string; port: number };
  database: { name: string; user: string };
}

type ConfigPaths = ObjectPaths<DeepConfig>;
const path1: ConfigPaths = "server";
const path2: ConfigPaths = "database";
console.log("对象路径:", path1, path2);

// ---- 6. 综合实战：类型安全的深度对象转化 ----
console.log("\\n========== 6. 综合实战：类型安全的深度对象转化 ==========");

// 类型定义：深度 Partial
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 类型定义：深度 Required
type DeepRequired<T> = T extends object
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T;

// 类型定义：可选链式访问的路径
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? K | \`\${K}.\${NestedKeyOf<T[K]>}\`
        : K;
    }[keyof T & string]
  : never;

// 运行时：安全获取深层属性
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && typeof current === "object" ? current[key] : undefined;
  }, obj);
}

const deepObj = {
  user: {
    profile: {
      name: "张三",
      contact: {
        email: "zhangsan@example.com",
        phone: "13800138000",
      },
    },
    settings: {
      theme: "dark",
      notifications: true,
    },
  },
};

console.log("深层访问 user.profile.name:", getNestedValue(deepObj, "user.profile.name"));
console.log("深层访问 user.profile.contact.email:", getNestedValue(deepObj, "user.profile.contact.email"));
console.log("深层访问 user.settings.theme:", getNestedValue(deepObj, "user.settings.theme"));

// 类型安全的 merge 函数（使用泛型约束）
function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = { ...target } as any;
  for (const key of Object.keys(source) as Array<keyof U>) {
    const sv = source[key];
    const tv = (target as any)[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      (result as any)[key] = deepMerge(tv, sv);
    } else {
      (result as any)[key] = sv;
    }
  }
  return result;
}

const base = { name: "基础配置", server: { host: "localhost", port: 3000 } };
const override = { server: { port: 8080, debug: true } };
const merged = deepMerge(base, override);
console.log("深度合并:", JSON.stringify(merged));

console.log("\\n泛型高级模式章节演示完成！");`,
  },

  // =========================================================
  // 第四章：面向对象编程 (Object-Oriented Programming)
  // =========================================================
  {
    id: "ts2-classes-oop",
    title: "面向对象编程",
    icon: "🏛️",
    group: "函数与类",
    content: `## 面向对象编程 (Object-Oriented Programming)

TypeScript 在 JavaScript 的类语法之上添加了完整的类型系统支持，使得面向对象编程（OOP）既安全又强大。本章将深入讲解 TypeScript 类的所有关键特性：类字段与初始化、\`readonly\` 修饰符、\`public\`/\`private\`/\`protected\` 访问控制、参数属性（Parameter Properties）、\`getters\`/\`setters\`、抽象类（Abstract Classes）、\`implements\` 接口实现、静态成员（Static Members）、\`this\` 类型，以及类表达式（Class Expressions）。

掌握这些特性，你将能够使用 TypeScript 构建出类型安全、可维护性极高的面向对象系统。

### 类字段（Class Fields）

TypeScript 支持在类中声明字段的类型，这是与 JavaScript 的一个重要区别。类字段的声明可以放在构造函数之前。

#### 字段声明与初始化

\`\`\`ts
class Person {
  // 声明字段并指定类型
  name: string;
  age: number;
  // 声明并初始化
  species = "Homo sapiens";
  // 声明但不初始化（需要在构造函数中赋值）
  id: number;

  constructor(name: string, age: number, id: number) {
    this.name = name;
    this.age = age;
    this.id = id;
  }
}
\`\`\`

#### 字段初始化顺序

字段的初始化顺序为：
1. 父类字段初始化
2. 父类构造函数执行
3. 子类字段初始化
4. 子类构造函数执行

这个顺序可能导致一些微妙的问题，特别是当子类重写父类方法时。

#### 明确赋值检查（Definite Assignment Assertion）

TypeScript 的 \`strictPropertyInitialization\` 选项（在 \`strict\` 模式下默认开启）要求每个类字段要么在声明时初始化，要么在构造函数中赋值。如果你确定字段会在使用前被赋值，但 TypeScript 无法推断，可以使用 \`!\` 明确赋值断言：

\`\`\`ts
class Component {
  // 明确赋值断言：告诉 TypeScript 这个字段会在其他地方初始化
  container!: HTMLElement;

  init() {
    this.container = document.createElement("div");
  }
}
\`\`\`

### readonly 修饰符

\`readonly\` 修饰符防止字段在构造函数之外被重新赋值。

#### 基本用法

\`\`\`ts
class Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
  readonly createdAt: Date;

  constructor(apiUrl: string, maxRetries: number = 3) {
    this.apiUrl = apiUrl;
    this.maxRetries = maxRetries;
    this.createdAt = new Date();
  }

  // ❌ 错误：不能在构造函数外修改 readonly 字段
  // updateUrl(url: string) {
  //   this.apiUrl = url;
  // }
}
\`\`\`

\`readonly\` 与 \`const\` 的区别：
- \`const\` 用于变量声明
- \`readonly\` 用于类/接口/类型的属性

#### readonly 与对象引用

\`readonly\` 只阻止**重新赋值引用**，不阻止**修改引用指向的对象**：

\`\`\`ts
class Team {
  readonly members: string[];

  constructor(members: string[]) {
    this.members = members;
  }

  addMember(name: string) {
    this.members.push(name);  // ✅ 允许：修改对象内容，没有重新赋值
  }

  // ❌ 错误：重新赋值引用
  // resetMembers() {
  //   this.members = [];
  // }
}
\`\`\`

### public / private / protected 访问控制

TypeScript 提供了三种访问修饰符来控制类成员的可见性。

#### public（默认）

\`public\` 是默认的访问级别，表示成员可以从任何地方访问：

\`\`\`ts
class Animal {
  public name: string;  // public 可省略

  public constructor(name: string) {
    this.name = name;
  }

  public move(): void {
    console.log(\`\${this.name} 移动了\`);
  }
}

const dog = new Animal("旺财");
console.log(dog.name);  // ✅ 可以直接访问
dog.move();              // ✅ 可以直接调用
\`\`\`

#### private

\`private\` 成员只能在**声明它的类内部**访问，子类也不能访问：

\`\`\`ts
class BankAccount {
  private balance: number;
  public readonly accountNumber: string;

  constructor(accountNumber: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }

  withdraw(amount: number): boolean {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  getBalance(): number {
    return this.balance;
  }
}

class SavingsAccount extends BankAccount {
  // ❌ 错误：子类不能访问 private 成员
  // addInterest(rate: number) {
  //   this.balance *= (1 + rate);
  // }
}
\`\`\`

TypeScript 的 \`private\` 是**编译期**的概念——转译后的 JavaScript 代码中，\`private\` 成员仍然是可访问的。如果你需要**真正的运行时私有**，可以使用 JavaScript 的 \`#\` 私有字段（ECMAScript 私有字段）。

#### ECMAScript 私有字段（#）

\`\`\`ts
class SecureVault {
  #secretKey: string;  // 真正的运行时私有

  constructor(secretKey: string) {
    this.#secretKey = secretKey;
  }

  verify(key: string): boolean {
    return this.#secretKey === key;
  }

  // 私有方法
  #hashKey(key: string): string {
    return key.split("").reverse().join("");
  }
}
\`\`\`

\`#\` 私有字段与 \`private\` 的关键区别：
- \`#\` 私有字段在运行时也是私有的（不可枚举，不可通过方括号访问）
- \`#\` 私有字段有"硬性隐私"——即使类型断言也无法绕过
- \`private\` 只在编译期检查，运行时可被绕过

#### protected

\`protected\` 成员可以在**声明它的类及其子类**中访问，但不能在类外部访问：

\`\`\`ts
class Vehicle {
  protected speed: number = 0;

  accelerate(amount: number): void {
    this.speed += amount;
  }

  getSpeed(): number {
    return this.speed;
  }
}

class Car extends Vehicle {
  // 子类可以访问 protected 成员
  honk(): void {
    if (this.speed > 60) {
      console.log("超速警告！");
    }
  }

  // 子类可以重写 protected 方法
  boost(): void {
    this.speed += 50;  // ✅ 子类可以访问 speed
  }
}

const car = new Car();
car.accelerate(40);
// console.log(car.speed);  // ❌ 错误：外部不能访问 protected 成员
console.log(car.getSpeed());  // ✅ 通过公共方法间接访问
\`\`\`

### 参数属性（Parameter Properties）

参数属性是 TypeScript 提供的一种语法糖，允许你在构造函数参数中同时声明和初始化类字段。

#### 语法

\`\`\`ts
// 传统写法：字段声明 + 构造函数赋值
class UserOld {
  name: string;
  age: number;
  email: string;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
}

// 参数属性写法：一步到位
class User {
  constructor(
    public name: string,
    public age: number,
    private email: string,
    protected role: string = "user"
  ) {
    // 构造函数体可以为空，赋值自动完成
  }

  getEmail(): string {
    return this.email;  // ✅ private 成员只在类内部可访问
  }
}

const user = new User("张三", 30, "zhangsan@example.com", "admin");
console.log(user.name);  // ✅ public
console.log(user.age);   // ✅ public
// console.log(user.email); // ❌ private
// console.log(user.role);  // ❌ protected
\`\`\`

参数属性支持所有三种访问修饰符（\`public\`、\`private\`、\`protected\`）以及 \`readonly\`：

\`\`\`ts
class Config {
  constructor(
    public readonly host: string,
    public readonly port: number,
    private readonly secretKey: string
  ) {}
}
\`\`\`

### Getters / Setters（存取器）

TypeScript 支持 \`get\` 和 \`set\` 存取器，允许你控制对象属性的读取和写入行为。

#### 基本用法

\`\`\`ts
class Temperature {
  private _celsius: number = 0;

  // getter：读取时计算
  get celsius(): number {
    return this._celsius;
  }

  // setter：写入时验证
  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("温度不能低于绝对零度");
    }
    this._celsius = value;
  }

  // 计算属性：只读 getter
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;
  }

  get kelvin(): number {
    return this._celsius + 273.15;
  }
}

const temp = new Temperature();
temp.celsius = 25;  // 调用 setter
console.log(temp.celsius);     // 25（调用 getter）
console.log(temp.fahrenheit);  // 77（计算属性）
console.log(temp.kelvin);      // 298.15（计算属性）
\`\`\`

#### getter 的类型

TypeScript 对 getter 有以下规则：
- 如果只有 \`get\` 没有 \`set\`，属性被自动推断为 \`readonly\`
- \`set\` 的参数类型必须与 \`get\` 的返回类型兼容
- \`get\` 和 \`set\` 的访问修饰符必须一致（或 setter 更严格）

### 抽象类（Abstract Classes）

抽象类是不能被直接实例化的类，只能作为其他类的基类。抽象类可以包含抽象方法（没有实现的方法）和具体方法（有实现的方法）。

#### 基本语法

\`\`\`ts
abstract class Shape {
  // 抽象属性（TS 4.2+）
  abstract readonly name: string;

  // 抽象方法：子类必须实现
  abstract getArea(): number;
  abstract getPerimeter(): number;

  // 具体方法：子类可以继承或重写
  describe(): string {
    return \`\${this.name}: 面积=\${this.getArea().toFixed(2)}, 周长=\${this.getPerimeter().toFixed(2)}\`;
  }
}

class Circle extends Shape {
  readonly name = "圆形";

  constructor(private radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  readonly name = "矩形";

  constructor(private width: number, private height: number) {
    super();
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// const shape = new Shape();  // ❌ 错误：不能实例化抽象类
const circle = new Circle(5);
const rect = new Rectangle(4, 6);
console.log(circle.describe());  // "圆形: 面积=78.54, 周长=31.42"
console.log(rect.describe());    // "矩形: 面积=24.00, 周长=20.00"
\`\`\`

#### 抽象类的用途

1. **定义公共接口**：强制子类实现特定方法。
2. **提供部分实现**：抽象类可以有具体方法，子类可以直接继承使用。
3. **模板方法模式**：在抽象类中定义算法骨架，子类实现具体步骤。

### implements 接口实现

\`implements\` 子句用于检查一个类是否满足某个接口的约定。它**不改变类的类型**，只是增加编译期检查。

#### 基本用法

\`\`\`ts
interface Printable {
  print(): string;
  getPageCount(): number;
}

interface Storable {
  save(): void;
  load(): boolean;
}

// 一个类可以实现多个接口
class Document implements Printable, Storable {
  constructor(private content: string, private pageCount: number) {}

  print(): string {
    return this.content;
  }

  getPageCount(): number {
    return this.pageCount;
  }

  save(): void {
    console.log("文档已保存");
  }

  load(): boolean {
    console.log("文档已加载");
    return true;
  }
}
\`\`\`

#### implements vs extends

| 特性 | implements | extends |
| --- | --- | --- |
| 用于 | 接口 | 类 |
| 功能 | 编译期检查类是否满足接口约定 | 继承父类的属性和方法 |
| 多继承 | ✅ 可以实现多个接口 | ❌ 只能继承一个类 |
| 提供实现 | ❌ 接口不提供实现 | ✅ 继承父类的实现 |
| 运行时影响 | 无（接口被擦除） | 有（原型链继承） |

### 静态成员（Static Members）

静态成员属于类本身，而不是类的实例。使用 \`static\` 关键字定义。

#### 静态属性与方法

\`\`\`ts
class MathUtils {
  // 静态常量
  static readonly PI = Math.PI;
  static readonly E = Math.E;

  // 静态方法
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 静态工厂方法
  static createDefault(): MathUtils {
    return new MathUtils();
  }

  // 实例方法
  instanceMethod(): string {
    return "我是实例方法";
  }
}

console.log(MathUtils.PI);                    // 3.141592653589793
console.log(MathUtils.clamp(50, 0, 100));     // 50
console.log(MathUtils.clamp(150, 0, 100));    // 100
console.log(MathUtils.randomInt(1, 10));      // 随机整数
\`\`\`

#### 静态成员的重要规则

1. **静态成员不能访问实例成员**（因为静态成员属于类，不属于实例）。
2. **静态成员不能使用类的泛型类型参数**（但可以有自己的泛型参数）。
3. **静态成员可以被继承**，但在子类中重写静态方法时要小心 \`this\` 指向。

\`\`\`ts
class Base {
  static greet(): string {
    return "Hello from Base";
  }

  static create(): this {
    // this 指向调用时的类（可能是子类）
    return new (this as any)();
  }
}

class Derived extends Base {
  static greet(): string {
    return "Hello from Derived";
  }
}

console.log(Base.greet());     // "Hello from Base"
console.log(Derived.greet());  // "Hello from Derived"
\`\`\`

### this 类型

TypeScript 支持将 \`this\` 用作返回类型，表示"返回当前类的类型"。这在**链式调用**（Fluent API）和**多态 this** 场景中非常有用。

#### 多态 this

\`\`\`ts
class Builder {
  private data: Record<string, any> = {};

  set(key: string, value: any): this {
    this.data[key] = value;
    return this;
  }

  build(): Record<string, any> {
    return { ...this.data };
  }
}

class AdvancedBuilder extends Builder {
  validate(): this {
    // 验证逻辑
    return this;
  }

  encrypt(): this {
    // 加密逻辑
    return this;
  }
}

// 多态 this 保证链式调用的类型正确
const builder = new AdvancedBuilder();
const result = builder
  .set("name", "张三")
  .set("age", 30)
  .validate()
  .encrypt()
  .build();

console.log(result);
\`\`\`

\`this\` 类型的关键特性：在子类中，\`this\` 类型会自动指向子类类型，使得链式调用保持类型正确。

### 类表达式（Class Expressions）

类表达式是类定义的另一种形式，可以作为表达式赋值给变量、作为参数传递或作为返回值。

#### 基本语法

\`\`\`ts
// 类表达式：将类赋值给变量
const MyClass = class<T> {
  constructor(public value: T) {}

  getValue(): T {
    return this.value;
  }
};

// 使用
const instance = new MyClass("hello");
console.log(instance.getValue());  // "hello"

// 作为函数参数
function createFactory(ctor: new () => any) {
  return new ctor();
}

const obj = createFactory(
  class {
    name = "匿名类";
    greet() {
      return \`Hello, \${this.name}\`;
    }
  }
);
console.log(obj.greet());  // "Hello, 匿名类"
\`\`\`

### 本节代码演示

下面用一个综合示例演示类字段、\`readonly\`、访问修饰符、参数属性、getter/setter、抽象类、\`implements\`、静态成员、\`this\` 类型和类表达式的完整用法，构建一个简单的任务管理系统。`,
    code: `// ============================================================
// 第四章代码演示：面向对象编程全景
// ============================================================

// ---- 1. 类字段与 readonly ----
console.log("========== 1. 类字段与 readonly ==========");

class Task {
  // 字段声明
  title: string;
  readonly id: string;
  readonly createdAt: Date;
  completed: boolean = false;
  // 明确赋值断言
  updatedAt!: Date;

  constructor(title: string, id: string) {
    this.title = title;
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  complete(): void {
    this.completed = true;
    this.updatedAt = new Date();
  }

  getInfo(): string {
    return \`[\${this.id}] \${this.title} - \${this.completed ? "已完成" : "进行中"}\`;
  }
}

const task1 = new Task("完成项目报告", "T-001");
const task2 = new Task("代码审查", "T-002");

console.log(task1.getInfo());
console.log(task2.getInfo());
task1.complete();
console.log("完成后:", task1.getInfo());
console.log("task1.id (readonly):", task1.id);
console.log("task1.createdAt:", task1.createdAt.toISOString());

// readonly 数组：引用不变，但内容可变
class Team {
  readonly members: string[];

  constructor(members: string[]) {
    this.members = members;
  }

  addMember(name: string): void {
    this.members.push(name);  // ✅ 修改内容允许
  }

  listMembers(): string {
    return this.members.join(", ");
  }
}

const team = new Team(["张三", "李四"]);
team.addMember("王五");
console.log("团队成员:", team.listMembers());

// ---- 2. public / private / protected ----
console.log("\\n========== 2. 访问修饰符 ==========");

class BankAccount {
  public readonly accountNumber: string;
  private balance: number;
  protected ownerName: string;

  constructor(accountNumber: string, ownerName: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.ownerName = ownerName;
    this.balance = initialBalance;
  }

  // 公共方法：存款
  deposit(amount: number): string {
    if (amount <= 0) return "存款金额必须大于0";
    this.balance += amount;
    return \`存款成功: \${amount} 元, 当前余额: \${this.balance} 元\`;
  }

  // 公共方法：取款
  withdraw(amount: number): string {
    if (amount <= 0) return "取款金额必须大于0";
    if (amount > this.balance) return "余额不足";
    this.balance -= amount;
    return \`取款成功: \${amount} 元, 当前余额: \${this.balance} 元\`;
  }

  // 公共方法：查看余额
  getBalance(): string {
    return \`账户 \${this.accountNumber} (\${this.ownerName}) 余额: \${this.balance} 元\`;
  }

  // 受保护方法：子类可以调用
  protected getOwnerInfo(): string {
    return \`\${this.ownerName} (\${this.accountNumber})\`;
  }
}

class SavingsAccount extends BankAccount {
  private interestRate: number;

  constructor(accountNumber: string, ownerName: string, initialBalance: number, interestRate: number) {
    super(accountNumber, ownerName, initialBalance);
    this.interestRate = interestRate;
  }

  // 子类可以访问 protected 成员
  addInterest(): string {
    const ownerInfo = this.getOwnerInfo();  // ✅ 可以调用 protected 方法
    return \`为 \${ownerInfo} 计算利息, 利率: \${this.interestRate * 100}%\`;
  }
}

const account = new BankAccount("6222021234567890", "张三", 10000);
console.log(account.deposit(5000));
console.log(account.withdraw(2000));
console.log(account.getBalance());
console.log(account.withdraw(20000));  // 余额不足
console.log("账号:", account.accountNumber);  // ✅ public

const savings = new SavingsAccount("6222029876543210", "李四", 50000, 0.035);
console.log(savings.getBalance());
console.log(savings.addInterest());

// ---- 3. 参数属性 ----
console.log("\\n========== 3. 参数属性 ==========");

class User {
  constructor(
    public readonly id: number,
    public name: string,
    private email: string,
    protected role: "admin" | "user" | "guest" = "user",
    public readonly registeredAt: Date = new Date()
  ) {}

  getProfile(): string {
    return \`\${this.name} (\${this.email}) - \${this.role}\`;
  }

  getEmail(): string {
    return this.email;
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }
}

const user1 = new User(1, "张三", "zhangsan@example.com", "admin");
const user2 = new User(2, "李四", "lisi@example.com");

console.log(user1.getProfile());
console.log("是管理员:", user1.isAdmin());
console.log(user2.getProfile());
console.log("是管理员:", user2.isAdmin());
console.log("注册时间:", user1.registeredAt.toISOString());

// ---- 4. Getters / Setters ----
console.log("\\n========== 4. Getters / Setters ==========");

class Product {
  private _price: number = 0;
  private _discount: number = 0;

  constructor(
    public readonly sku: string,
    public name: string,
    price: number
  ) {
    this.price = price;  // 触发 setter 验证
  }

  // price 的 getter/setter
  get price(): number {
    return this._price;
  }

  set price(value: number) {
    if (value < 0) {
      throw new Error("价格不能为负数");
    }
    this._price = value;
  }

  // discount 的 getter/setter
  get discount(): number {
    return this._discount;
  }

  set discount(value: number) {
    if (value < 0 || value > 100) {
      throw new Error("折扣必须在 0-100 之间");
    }
    this._discount = value;
  }

  // 计算属性：实付价格
  get finalPrice(): number {
    return this._price * (1 - this._discount / 100);
  }

  // 格式化价格
  get displayPrice(): string {
    if (this._discount > 0) {
      return \`¥\${this._price.toFixed(2)} (折扣 \${this._discount}%, 实付 ¥\${this.finalPrice.toFixed(2)})\`;
    }
    return \`¥\${this._price.toFixed(2)}\`;
  }
}

const product = new Product("SKU-001", "机械键盘", 399);
console.log(product.displayPrice);
product.discount = 15;
console.log("打折后:", product.displayPrice);
product.discount = 25;
console.log("再打折:", product.displayPrice);

// ---- 5. 抽象类 ----
console.log("\\n========== 5. 抽象类 ==========");

abstract class PaymentMethod {
  abstract readonly name: string;
  abstract readonly type: string;

  abstract processPayment(amount: number): string;
  abstract refund(transactionId: string): string;

  getDescription(): string {
    return \`\${this.name} (\${this.type})\`;
  }
}

class CreditCard extends PaymentMethod {
  readonly name = "信用卡";
  readonly type = "card";

  constructor(private cardNumber: string) {
    super();
  }

  processPayment(amount: number): string {
    const masked = "****" + this.cardNumber.slice(-4);
    return \`信用卡 \${masked} 支付 ¥\${amount.toFixed(2)} 成功\`;
  }

  refund(transactionId: string): string {
    return \`信用卡退款 [\${transactionId}] 处理中\`;
  }
}

class WeChatPay extends PaymentMethod {
  readonly name = "微信支付";
  readonly type = "wallet";

  constructor(private openId: string) {
    super();
  }

  processPayment(amount: number): string {
    return \`微信支付 ¥\${amount.toFixed(2)} 成功\`;
  }

  refund(transactionId: string): string {
    return \`微信退款 [\${transactionId}] 处理中\`;
  }
}

// 多态使用
const paymentMethods: PaymentMethod[] = [
  new CreditCard("1234567890123456"),
  new WeChatPay("wx_openid_12345"),
];

for (const pm of paymentMethods) {
  console.log(pm.getDescription());
  console.log(pm.processPayment(99.99));
}

// ---- 6. implements ----
console.log("\\n========== 6. implements 接口实现 ==========");

interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

interface Cloneable {
  clone(): this;
}

class TodoItem implements Serializable, Cloneable {
  constructor(
    public id: number,
    public title: string,
    public done: boolean = false
  ) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, title: this.title, done: this.done });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.id = parsed.id;
    this.title = parsed.title;
    this.done = parsed.done;
  }

  clone(): this {
    const cloned = new (this.constructor as any)(this.id, this.title, this.done);
    return cloned;
  }

  toString(): string {
    return \`[\${this.done ? "✓" : " "}] \${this.title}\`;
  }
}

const todo = new TodoItem(1, "学习 TypeScript 面向对象", false);
console.log("序列化:", todo.serialize());

const todoClone = todo.clone();
todoClone.done = true;
console.log("原始:", todo.toString());
console.log("克隆:", todoClone.toString());

const todo2 = new TodoItem(2, "完成代码审查", false);
todo2.deserialize(\`{"id":2,"title":"完成代码审查（已修改）","done":true}\`);
console.log("反序列化后:", todo2.toString());

// ---- 7. 静态成员 ----
console.log("\\n========== 7. 静态成员 ==========");

class IdGenerator {
  private static counter = 0;
  private static prefix = "ID";

  static setPrefix(prefix: string): void {
    IdGenerator.prefix = prefix;
  }

  static generate(): string {
    IdGenerator.counter++;
    return \`\${IdGenerator.prefix}-\${IdGenerator.counter.toString().padStart(6, "0")}\`;
  }

  static reset(): void {
    IdGenerator.counter = 0;
  }

  static get count(): number {
    return IdGenerator.counter;
  }
}

console.log("生成ID:", IdGenerator.generate());
console.log("生成ID:", IdGenerator.generate());
console.log("生成ID:", IdGenerator.generate());
IdGenerator.setPrefix("TASK");
console.log("生成ID (新前缀):", IdGenerator.generate());
console.log("已生成数量:", IdGenerator.count);

// 静态工厂方法
class Logger {
  private constructor(private context: string) {}

  static for(context: string): Logger {
    return new Logger(context);
  }

  log(message: string): void {
    console.log(\`[\${this.context}] \${message}\`);
  }

  error(message: string): void {
    console.log(\`[\${this.context}] ERROR: \${message}\`);
  }
}

const appLogger = Logger.for("App");
const dbLogger = Logger.for("Database");
appLogger.log("应用启动");
dbLogger.log("数据库连接成功");
dbLogger.error("连接超时");

// ---- 8. this 类型与链式调用 ----
console.log("\\n========== 8. this 类型与链式调用 ==========");

class QueryBuilder {
  private tableName: string = "";
  private conditions: string[] = [];
  private orderByField: string = "";
  private limitCount: number = 0;

  from(table: string): this {
    this.tableName = table;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  orderBy(field: string): this {
    this.orderByField = field;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  build(): string {
    let sql = \`SELECT * FROM \${this.tableName}\`;
    if (this.conditions.length > 0) {
      sql += " WHERE " + this.conditions.join(" AND ");
    }
    if (this.orderByField) {
      sql += \` ORDER BY \${this.orderByField}\`;
    }
    if (this.limitCount > 0) {
      sql += \` LIMIT \${this.limitCount}\`;
    }
    return sql + ";";
  }
}

class AdvancedQueryBuilder extends QueryBuilder {
  join(table: string, on: string): this {
    // 高级查询功能
    return this;
  }

  groupBy(field: string): this {
    return this;
  }
}

// 链式调用——多态 this 保证类型正确
const query = new AdvancedQueryBuilder()
  .from("users")
  .where("age > 18")
  .where("status = 'active'")
  .orderBy("created_at")
  .limit(10)
  .build();

console.log("生成的 SQL:", query);

// 简单版本的链式调用
const simpleQuery = new QueryBuilder()
  .from("tasks")
  .where("completed = false")
  .orderBy("priority")
  .limit(5)
  .build();

console.log("简单查询 SQL:", simpleQuery);

// ---- 9. 类表达式 ----
console.log("\\n========== 9. 类表达式 ==========");

// 类表达式赋值给变量
const DynamicService = class {
  private static instanceCount = 0;
  private instanceId: number;

  constructor(public name: string) {
    DynamicService.instanceCount++;
    this.instanceId = DynamicService.instanceCount;
  }

  getInfo(): string {
    return \`服务 \${this.name} (实例 #\${this.instanceId})\`;
  }
};

const svc1 = new DynamicService("用户服务");
const svc2 = new DynamicService("订单服务");
console.log(svc1.getInfo());
console.log(svc2.getInfo());

// 作为工厂函数返回值
function createAnonymousClass(prefix: string) {
  return class {
    id: string;
    constructor() {
      this.id = \`\${prefix}-\${Math.random().toString(36).slice(2, 8)}\`;
    }
    getId(): string {
      return this.id;
    }
  };
}

const AnonClass = createAnonymousClass("ANON");
const anonInstance = new AnonClass();
console.log("匿名类实例 ID:", anonInstance.getId());

console.log("\\n面向对象编程章节演示完成！");`,
  },

  // =========================================================
  // 第五章：装饰器实战 (Decorators in Practice)
  // =========================================================
  {
    id: "ts2-decorators",
    title: "装饰器实战",
    icon: "🎀",
    group: "函数与类",
    content: `## 装饰器实战 (Decorators in Practice)

装饰器（Decorators）是 TypeScript 中一个强大的元编程特性，它允许你通过**声明式语法**修改类及其成员的行为。装饰器可以附加到类声明、方法、属性、访问器（getter/setter）和参数上，让你在不修改原始代码的情况下添加横切关注点（cross-cutting concerns），如日志、缓存、权限校验、依赖注入等。

本章将全面讲解类装饰器、方法装饰器、属性装饰器、访问器装饰器、参数装饰器、装饰器工厂、装饰器组合，以及 TypeScript 5.0 引入的新装饰器标准（与 ECMAScript 提案对齐）。

### 装饰器基础

#### 什么是装饰器

装饰器本质上是一个**函数**，它在类定义时被调用，用于修改或增强类及其成员的行为。装饰器的语法是 \`@expression\`，其中 \`expression\` 必须是一个函数。

\`\`\`ts
// 装饰器就是一个函数
function sealed(target: Function) {
  Object.seal(target);
  Object.seal(target.prototype);
}

// 使用装饰器
@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
\`\`\`

#### 启用装饰器

在 \`tsconfig.json\` 中需要启用 \`experimentalDecorators\` 选项（TypeScript 5.0 之前）或使用 \`experimentalDecorators\` 保持向后兼容。

#### 装饰器的执行时机

装饰器在**类定义时**执行（而不是实例化时），这意味着装饰器函数在类被定义的那一刻就运行了，早于任何实例的创建。

#### 装饰器求值顺序

当多个装饰器应用于同一个声明时，它们的求值顺序如下：
1. 参数装饰器（对每个参数，从左到右）
2. 方法装饰器、访问器装饰器、属性装饰器（对每个成员，从上到下）
3. 类装饰器（最后）

对于同一成员上的多个装饰器，执行顺序为**从下到上**（就像数学中的函数组合）：

\`\`\`ts
function first() {
  console.log("first(): 工厂函数求值");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): 装饰器执行");
  };
}

function second() {
  console.log("second(): 工厂函数求值");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): 装饰器执行");
  };
}

class Example {
  @first()
  @second()
  method() {}
}
// 输出：
// first(): 工厂函数求值
// second(): 工厂函数求值
// second(): 装饰器执行
// first(): 装饰器执行
\`\`\`

### 类装饰器（Class Decorators）

类装饰器应用于类声明，用于观察、修改或替换类定义。类装饰器接收一个参数：类的构造函数。

#### 基本类装饰器

\`\`\`ts
// 类装饰器接收构造函数作为参数
function reportableClass<T extends new (...args: any[]) => any>(constructor: T) {
  // 返回一个新的类（扩展原类）
  return class extends constructor {
    reportingURL = "http://www.example.com/report";
    report() {
      console.log(\`Reporting \${this.reportingURL}\`);
    }
  };
}

@reportableClass
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

// 装饰后的类拥有了新方法和新属性
const bug = new BugReport("Needs dark mode");
console.log(bug.title);
(bug as any).report();  // 装饰器添加的方法
console.log((bug as any).reportingURL);  // 装饰器添加的属性
\`\`\`

#### 密封类装饰器

一个常见的类装饰器用例是防止类被扩展或修改：

\`\`\`ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class FinalClass {
  value = 42;
  getValue() { return this.value; }
}
\`\`\`

### 方法装饰器（Method Decorators）

方法装饰器应用于类的方法，接收三个参数：
1. \`target\`：静态方法时为类的构造函数，实例方法时为类的原型对象
2. \`propertyKey\`：方法名
3. \`descriptor\`：方法的属性描述符

#### 日志装饰器

\`\`\`ts
function log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(\`调用 \${propertyKey}, 参数: \${JSON.stringify(args)}\`);
    const result = originalMethod.apply(this, args);
    console.log(\`\${propertyKey} 返回: \${JSON.stringify(result)}\`);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }

  @log
  multiply(a: number, b: number): number {
    return a * b;
  }
}

const calc = new Calculator();
calc.add(2, 3);       // 自动打印日志
calc.multiply(4, 5);  // 自动打印日志
\`\`\`

#### 性能测量装饰器

\`\`\`ts
function measure(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    console.log(\`\${propertyKey} 执行耗时: \${(end - start).toFixed(2)}ms\`);
    return result;
  };

  return descriptor;
}
\`\`\`

### 属性装饰器（Property Decorators）

属性装饰器应用于类的属性声明，接收两个参数：
1. \`target\`：静态属性时为类的构造函数，实例属性时为类的原型对象
2. \`propertyKey\`：属性名

属性装饰器**没有属性描述符参数**（因为属性在声明时还没有初始化），返回值也会被忽略。

#### 必填属性装饰器

\`\`\`ts
// 属性装饰器：标记必填字段
const requiredMetadataKey = Symbol("required");

function required(target: any, propertyKey: string) {
  // 获取已存在的必填字段列表
  const existingRequired: string[] =
    Reflect.getOwnMetadata(requiredMetadataKey, target) || [];

  // 添加当前字段
  existingRequired.push(propertyKey);

  // 保存回元数据
  Reflect.defineMetadata(requiredMetadataKey, existingRequired, target);
}

// 验证函数
function validateRequired(obj: any): string[] {
  const errors: string[] = [];
  const requiredFields: string[] =
    Reflect.getOwnMetadata(requiredMetadataKey, obj) || [];

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      errors.push(\`\${field} 是必填项\`);
    }
  }
  return errors;
}

class User {
  @required
  name: string;

  @required
  email: string;

  age: number;

  constructor(name: string, email: string, age: number) {
    this.name = name;
    this.email = email;
    this.age = age;
  }
}
\`\`\`

### 访问器装饰器（Accessor Decorators）

访问器装饰器应用于 \`get\` 或 \`set\` 访问器，接收三个参数（与方法装饰器相同）：
1. \`target\`
2. \`propertyKey\`
3. \`descriptor\`

#### 配置保护装饰器

\`\`\`ts
function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number = 0;
  private _y: number = 0;

  @configurable(false)
  get x() { return this._x; }

  @configurable(false)
  get y() { return this._y; }
}
\`\`\`

### 参数装饰器（Parameter Decorators）

参数装饰器应用于方法参数，接收三个参数：
1. \`target\`：静态方法时为类的构造函数，实例方法时为原型对象
2. \`propertyKey\`：方法名
3. \`parameterIndex\`：参数在参数列表中的索引（从 0 开始）

参数装饰器通常用于**元数据收集**，例如记录哪些参数需要特殊处理。

\`\`\`ts
// 参数装饰器用于标记必需参数
const requiredParamKey = Symbol("requiredParams");

function requiredParam(target: any, propertyKey: string, parameterIndex: number) {
  const existing: number[] = Reflect.getOwnMetadata(requiredParamKey, target, propertyKey) || [];
  existing.push(parameterIndex);
  Reflect.defineMetadata(requiredParamKey, existing, target, propertyKey);
}
\`\`\`

### 装饰器工厂（Decorator Factories）

装饰器工厂是一个**返回装饰器函数的函数**，允许你传入参数来定制装饰器的行为。

#### 装饰器工厂模式

\`\`\`ts
// 装饰器工厂：接受配置参数，返回装饰器函数
function logWithLevel(level: "debug" | "info" | "warn") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.log(\`[\${level.toUpperCase()}] \${propertyKey} 被调用\`);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

class Service {
  @logWithLevel("debug")
  fetchData() { return "数据"; }

  @logWithLevel("warn")
  deleteData() { return "已删除"; }
}
\`\`\`

#### 装饰器工厂的常见用例

1. **权限控制**：\`@requireRole("admin")\`
2. **缓存**：\`@cache({ ttl: 60000 })\`
3. **重试**：\`@retry({ maxAttempts: 3, delay: 1000 })\`
4. **限流**：\`@throttle(100)\`
5. **验证**：\`@validate(schema)\`

### 装饰器组合（Decorator Composition）

当多个装饰器应用于同一个目标时，TypeScript 按以下规则组合它们：

1. **工厂函数**按从上到下的顺序**求值**（evaluate）
2. **装饰器函数**按从下到上的顺序**执行**（execute）

\`\`\`ts
function decoratorA() {
  console.log("工厂 A 求值");
  return function (...args: any[]) {
    console.log("装饰器 A 执行");
  };
}

function decoratorB() {
  console.log("工厂 B 求值");
  return function (...args: any[]) {
    console.log("装饰器 B 执行");
  };
}

@decoratorA()
@decoratorB()
class MyClass {
  @decoratorA()
  @decoratorB()
  method() {}
}
// 输出：
// 工厂 A 求值（类装饰器）
// 工厂 B 求值（类装饰器）
// 工厂 A 求值（方法装饰器）
// 工厂 B 求值（方法装饰器）
// 装饰器 B 执行（方法）
// 装饰器 A 执行（方法）
// 装饰器 B 执行（类）
// 装饰器 A 执行（类）
\`\`\`

### TypeScript 5.0+ 新装饰器

TypeScript 5.0 引入了与 ECMAScript 装饰器提案对齐的新装饰器实现。新旧装饰器的主要区别：

| 特性 | 旧装饰器（experimental） | 新装饰器（TS 5.0+） |
| --- | --- | --- |
| 启用方式 | \`experimentalDecorators\` | 默认支持（不需要特殊标志） |
| 类装饰器 | 可以返回新构造函数 | 不能返回新构造函数 |
| 方法装饰器 | 修改属性描述符 | 返回新方法替代 |
| 属性装饰器 | 无返回值 | 通过 \`accessor\` 关键字使用 |
| 参数装饰器 | 受支持 | 暂不支持 |
| 元数据 | \`reflect-metadata\` | 需要额外配置 |

新装饰器的语法保持 \`@expression\` 不变，但装饰器函数签名和行为有所不同。由于本教程基于 \`experimentalDecorators\` 模式，新装饰器在此仅作介绍。

### 实战：构建一个完整的装饰器工具集

将以上所有概念整合起来，构建一个实际可用的装饰器工具集，涵盖：
- \`@log\`：方法调用日志
- \`@measure\`：性能测量
- \`@cache\`：结果缓存（装饰器工厂）
- \`@deprecated\`：弃用警告（装饰器工厂）
- \`@readonly\`：属性只读
- \`@sealed\`：类密封

### 本节代码演示

下面用一个综合示例演示类装饰器、方法装饰器、属性装饰器、访问器装饰器、装饰器工厂和装饰器组合的完整用法。`,
    code: `// ============================================================
// 第五章代码演示：装饰器实战全景
// ============================================================

// ---- 装饰器工具函数定义 ----

// 1. 日志装饰器工厂：记录方法调用
function log(prefix: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const label = prefix ? \`[\${prefix}]\` : "";
      console.log(\`\${label} 调用 \${propertyKey}(\${args.map(a => JSON.stringify(a)).join(", ")})\`);
      const start = Date.now();
      const result = originalMethod.apply(this, args);
      const duration = Date.now() - start;
      console.log(\`\${label} \${propertyKey} 返回: \${JSON.stringify(result)} (\${duration}ms)\`);
      return result;
    };

    return descriptor;
  };
}

// 2. 缓存装饰器工厂：缓存方法返回值
function cache(ttlMs: number = 60000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const cacheMap = new Map<string, { value: any; timestamp: number }>();

    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cacheMap.get(key);

      if (cached && Date.now() - cached.timestamp < ttlMs) {
        console.log(\`[缓存命中] \${propertyKey}(\${key})\`);
        return cached.value;
      }

      console.log(\`[缓存未命中] \${propertyKey}(\${key})\`);
      const result = originalMethod.apply(this, args);
      cacheMap.set(key, { value: result, timestamp: Date.now() });
      return result;
    };

    return descriptor;
  };
}

// 3. 弃用装饰器工厂：标记方法为弃用
function deprecated(message: string = "此方法已弃用") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.warn(\`⚠️ 弃用警告: \${propertyKey} - \${message}\`);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 4. 重试装饰器工厂：方法失败时自动重试
function retry(maxAttempts: number = 3, _delayMs: number = 100) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      let lastError: Error | undefined;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = originalMethod.apply(this, args);
          if (attempt > 1) {
            console.log(\`重试成功 (第 \${attempt} 次)\`);
          }
          return result;
        } catch (e) {
          lastError = e as Error;
          if (attempt < maxAttempts) {
            console.log(\`第 \${attempt} 次失败，准备重试...\`);
          }
        }
      }
      throw lastError;
    };

    return descriptor;
  };
}

// 5. 权限校验装饰器工厂
function requireRole(role: string) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // 从上下文中获取当前用户角色（模拟）
      const currentRole = (this as any)._currentRole || "guest";
      if (currentRole !== role) {
        console.warn(\`⚠️ 权限不足: \${propertyKey} 需要 \${role} 角色, 当前为 \${currentRole}\`);
        return undefined;
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// 6. 类装饰器：给类添加元数据
function addMetadata(metadata: Record<string, any>) {
  return function <T extends new (...args: any[]) => any>(constructor: T): T {
    return class extends constructor {
      static metadata = { ...metadata, className: constructor.name };
    } as any;
  };
}

// 7. 属性装饰器：标记属性为只读（编译期约束）
function readonly(_target: any, propertyKey: string) {
  console.log(\`属性装饰器标记: \${propertyKey} 为只读\`);
}

// 8. 访问器装饰器：对 getter 结果进行格式化
function formatNumber(format: string = "0.00") {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalGetter = descriptor.get;

    if (originalGetter) {
      descriptor.get = function () {
        const value = originalGetter.call(this);
        if (typeof value === "number") {
          return value.toFixed(format === "0.00" ? 2 : parseInt(format));
        }
        return value;
      };
    }

    return descriptor;
  };
}

// ---- 装饰器应用 ----

console.log("========== 1. 日志装饰器 ==========");

class Calculator {
  @log("计算器")
  add(a: number, b: number): number {
    return a + b;
  }

  @log("计算器")
  multiply(a: number, b: number): number {
    return a * b;
  }

  @log("计算器")
  divide(a: number, b: number): number {
    if (b === 0) throw new Error("除数不能为0");
    return a / b;
  }
}

const calc = new Calculator();
console.log("add(10, 20):", calc.add(10, 20));
console.log("multiply(6, 7):", calc.multiply(6, 7));
console.log("divide(100, 4):", calc.divide(100, 4));

console.log("\\n========== 2. 缓存装饰器 ==========");

class DataService {
  private callCount = 0;

  @cache(5000)
  fetchUser(id: number): { id: number; name: string } {
    this.callCount++;
    console.log(\`  实际执行 fetchUser(\${id}) (第 \${this.callCount} 次调用)\`);
    return { id, name: \`用户\${id}\` };
  }

  @cache(5000)
  computeExpensive(params: { a: number; b: number }): number {
    this.callCount++;
    console.log(\`  实际执行 computeExpensive(\${JSON.stringify(params)}) (第 \${this.callCount} 次调用)\`);
    return params.a * params.b + Math.random();
  }
}

const dataService = new DataService();
console.log("第一次调用 fetchUser(1):", JSON.stringify(dataService.fetchUser(1)));
console.log("第二次调用 fetchUser(1) (应命中缓存):", JSON.stringify(dataService.fetchUser(1)));
console.log("调用 fetchUser(2) (不同参数):", JSON.stringify(dataService.fetchUser(2)));
console.log("再次调用 fetchUser(1) (应命中缓存):", JSON.stringify(dataService.fetchUser(1)));

console.log("\\n========== 3. 弃用装饰器 ==========");

class LegacyService {
  @deprecated("请使用 newMethod() 替代")
  oldMethod(data: string): string {
    return "旧方法处理: " + data;
  }

  @deprecated("已废弃，将在 v2.0 移除")
  legacyProcess(): string {
    return "旧版本处理";
  }

  newMethod(data: string): string {
    return "新方法处理: " + data;
  }
}

const legacy = new LegacyService();
console.log(legacy.oldMethod("测试数据"));
console.log(legacy.legacyProcess());
console.log(legacy.newMethod("测试数据"));

console.log("\\n========== 4. 重试装饰器 ==========");

class NetworkService {
  private attemptCount = 0;

  @retry(3)
  fetchData(): string {
    this.attemptCount++;
    if (this.attemptCount < 3) {
      console.log(\`  尝试 #\${this.attemptCount} 失败\`);
      throw new Error("网络错误");
    }
    return "数据获取成功";
  }

  @retry(3)
  reliablyFetch(): string {
    return "一次成功";
  }
}

const network = new NetworkService();
try {
  console.log("fetchData 结果:", network.fetchData());
} catch (e) {
  console.log("fetchData 最终失败:", (e as Error).message);
}

const network2 = new NetworkService();
console.log("reliablyFetch 结果:", network2.reliablyFetch());

console.log("\\n========== 5. 权限校验装饰器 ==========");

class AdminService {
  constructor(private _currentRole: string = "guest") {}

  @requireRole("admin")
  deleteUser(userId: number): string {
    return \`用户 \${userId} 已删除\`;
  }

  @requireRole("admin")
  createReport(): string {
    return "报告已创建";
  }

  getPublicData(): string {
    return "公开数据";
  }
}

const adminService = new AdminService();
// 默认为 guest 角色，没有权限
console.log("guest 角色 deleteUser:", adminService.deleteUser(1));
console.log("guest 角色 createReport:", adminService.createReport());

// 构造 admin 角色实例
const adminService2 = new AdminService("admin");
console.log("admin 角色 deleteUser:", adminService2.deleteUser(2));
console.log("admin 角色 createReport:", adminService2.createReport());

console.log("\\n========== 6. 类装饰器 ==========");

@addMetadata({ version: "1.0.0", author: "TypeScript教程" })
class AppConfig {
  static metadata: Record<string, any>;
  appName = "MyApp";
}

console.log("AppConfig 元数据:", (AppConfig as any).metadata);

console.log("\\n========== 7. 属性装饰器 ==========");

class FormModel {
  @readonly
  id: number = 0;

  @readonly
  createdAt: Date = new Date();

  name: string = "";
  email: string = "";

  constructor() {
    this.id = 1;
    this.createdAt = new Date("2024-01-01");
  }
}

const form = new FormModel();
console.log("FormModel id:", form.id);
console.log("FormModel createdAt:", form.createdAt.toISOString());

console.log("\\n========== 8. 访问器装饰器 ==========");

class Product {
  private _price: number;

  constructor(price: number) {
    this._price = price;
  }

  @formatNumber("0.00")
  get price(): number {
    return this._price;
  }

  @formatNumber("0.00")
  get taxPrice(): number {
    return this._price * 1.13;
  }
}

const prod = new Product(99.9);
console.log("产品价格:", prod.price);
console.log("含税价格:", prod.taxPrice);

console.log("\\n========== 9. 装饰器组合 ==========");

class CombinedService {
  @log("组合")
  @cache(3000)
  @deprecated("请使用 enhancedProcess")
  processData(input: string): string {
    return \`处理结果: \${input.toUpperCase()}\`;
  }
}

const combined = new CombinedService();
// 第一次调用：缓存未命中，执行原方法
console.log("第一次:", combined.processData("hello"));
// 第二次调用：缓存命中
console.log("第二次:", combined.processData("hello"));

console.log("\\n装饰器实战章节演示完成！");`,
  },
];