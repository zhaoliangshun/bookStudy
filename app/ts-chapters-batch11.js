// =============================================================
// TypeScript 交互式教程 —— 第十一批章节（共 5 章 · 类型系统补全）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-assert-functions       — 断言函数与类型谓词深入
//   2. ts-unique-symbol          — symbol 与 unique symbol 深入
//   3. ts-index-signature-deep   — 索引签名、Record 与映射类型对比
//   4. ts-overloading-deep       — 函数重载深入
//   5. ts-runtime-validation     — 运行时类型校验
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 10 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器, isolatedModules)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, URLSearchParams, TextEncoder, TextDecoder,
//     Promise, __dirname, __filename, require, module, exports
//   - 沙箱不能 require 外部模块（zod/react 等），第 5 章运行时
//     校验 demo 用手写的简化校验函数模拟 zod 概念
//   - 高级类型（条件类型/映射类型/infer/模板字面量类型/断言函数
//     返回的谓词）在转译后全部被擦除，代码 demo 用 typeof 验证
//     运行时值类型，并用注释说明编译期的类型计算结果
//   - 类型错误不会阻止运行（教程侧重运行结果）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：断言函数与类型谓词深入
  // =========================================================
  {
    id: "ts-assert-functions",
    title: "断言函数与类型谓词深入",
    icon: "🔍",
    group: "进阶类型",
    content: `## 断言函数与类型谓词深入 (Assertion Functions & Type Predicates)

TypeScript 的类型系统主要在**编译期**工作，但真实程序里很多类型判断必须发生在**运行时**——比如判断一个值是不是字符串、一个对象是否符合某接口。TypeScript 提供了两种把"运行时判断"和"编译期类型收窄"打通的机制：**类型谓词（Type Predicates，\`x is Type\`）** 和 **断言函数（Assertion Functions，\`asserts x is Type\` / \`asserts condition\`）**。它们让自定义的判断函数也能触发类型收窄，是写类型安全代码的关键工具。

本章将极其详细地讲解这两种机制的语法、控制流行为、二者的区别、与 Node.js \`assert\` 模块的结合、实战场景（校验 API 响应、不变式检查、测试断言），以及常见陷阱。

### 1. 类型谓词：\`x is Type\`

#### 基础语法

类型谓词用在**函数的返回类型位置**，语法是 \`parameterName is Type\`：

\`\`\`ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}
\`\`\`

\`x is string\` 读作"返回 true 时，参数 x 的类型收窄为 string"。这是一个**特殊的返回类型**——它告诉 TypeScript：当这个函数返回 \`true\` 时，你可以安全地把 \`x\` 当作 \`string\` 使用；返回 \`false\` 时，\`x\` 不是 \`string\`。

#### 与普通布尔返回的区别

\`\`\`ts
// 普通布尔返回：没有类型收窄
function isStringPlain(x: unknown): boolean {
  return typeof x === "string";
}

// 类型谓词：有类型收窄
function isStringTyped(x: unknown): x is string {
  return typeof x === "string";
}

function demo(x: unknown) {
  if (isStringPlain(x)) {
    // x 仍是 unknown，不能直接用 string 方法
    // x.toUpperCase(); // ❌ 编译错误
    console.log("是字符串");
  }
  if (isStringTyped(x)) {
    // x 被收窄为 string，可以用 string 方法
    x.toUpperCase(); // ✅
  }
}
\`\`\`

类型谓词的价值就在这里：它让自定义的判断函数能像 \`typeof\`、\`instanceof\` 一样触发类型收窄。

#### 自定义类型守卫

类型谓词最常见的用途是**自定义类型守卫**，用于收窄联合类型：

\`\`\`ts
interface Dog { kind: "dog"; bark: () => void; }
interface Cat { kind: "cat"; meow: () => void; }
type Pet = Dog | Cat;

function isDog(pet: Pet): pet is Dog {
  return pet.kind === "dog";
}

function speak(pet: Pet) {
  if (isDog(pet)) {
    pet.bark(); // ✅ pet 收窄为 Dog
  } else {
    pet.meow(); // ✅ pet 收窄为 Cat
  }
}
\`\`\`

\`isDog\` 用类型谓词声明，调用时 TypeScript 就知道：\`if (isDog(pet))\` 分支里 \`pet\` 是 \`Dog\`，\`else\` 分支里 \`pet\` 是 \`Cat\`。

#### 收窄规则

类型谓词的收窄遵循**反演规则**：
- 在 \`if (isX(x))\` 的真分支里，\`x\` 收窄为谓词声明的类型。
- 在 \`else\` 分支或 \`if (!isX(x))\` 的真分支里，\`x\` 收窄为**原类型减去谓词类型**（即排除）。

\`\`\`ts
type A = { tag: "a"; va: number };
type B = { tag: "b"; vb: string };
type AB = A | B;

function isA(x: AB): x is A { return x.tag === "a"; }

function f(x: AB) {
  if (isA(x)) {
    x.va; // ✅ A
  } else {
    x.vb; // ✅ B（被排除 A 后剩余）
  }
}
\`\`\`

### 2. 断言函数：\`asserts x is Type\`

#### 基础语法

断言函数用 \`asserts\` 关键字声明返回类型，语法是 \`asserts parameterName is Type\`：

\`\`\`ts
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") {
    throw new Error("Expected string, got " + typeof x);
  }
}
\`\`\`

\`asserts x is string\` 读作"如果这个函数正常返回（没抛异常），那么 x 就是 string"。注意：断言函数**不返回值**（返回 \`void\` 或 \`never\`），它通过**抛异常**来表示"断言失败"。

#### 与类型谓词的区别

| 维度 | 类型谓词 \`x is T\` | 断言函数 \`asserts x is T\` |
| --- | --- | --- |
| 返回值 | 布尔值 | 不返回（抛异常表示失败） |
| 控制流 | \`if (isX(x))\` 双分支 | 调用后**后续代码**自动收窄 |
| 失败处理 | 返回 false | 抛异常 |
| 典型场景 | 条件判断、过滤 | 前置校验、不变式 |
| 调用方式 | 必须在 if 里用 | 直接调用即可触发收窄 |

\`\`\`ts
// 类型谓词：必须在 if 里用才收窄
function isString(x: unknown): x is string { return typeof x === "string"; }
function use1(x: unknown) {
  if (isString(x)) { x.toUpperCase(); } // ✅ 在 if 分支里收窄
  // x.toUpperCase(); // ❌ 出了 if 就不收窄了
}

// 断言函数：调用后后续代码自动收窄
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("not string");
}
function use2(x: unknown) {
  assertString(x);     // 调用后...
  x.toUpperCase();     // ✅ 后续代码自动收窄为 string
}
\`\`\`

这是两者最大的区别：断言函数是"声明式"的——调用一下就完成了类型保证，后续代码无需包裹在 if 里；类型谓词是"条件式"的——必须配合 if/三元等控制流才能收窄。

### 3. 简单条件断言：\`asserts condition\`

除了 \`asserts x is Type\`，还有更简单的 \`asserts condition\`：

\`\`\`ts
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg || "Assertion failed");
}

function divide(a: number, b: number): number {
  assert(b !== 0, "除数不能为 0");
  // 调用后，b !== 0 这个事实被"记住"
  return a / b;
}
\`\`\`

\`asserts condition\` 不收窄具体类型，但它告诉 TypeScript：调用后 \`condition\` 为真。常用于不变式检查（断言某个条件成立）。

### 4. Assertion Functions 提案背景

断言函数的概念来自 TC39 的 [Assertion Functions 提案](https://github.com/microsoft/TypeScript/pull/32695)，它源于 JavaScript 的实际需求——很多库（如 Node.js 的 \`assert\` 模块、Chai 的 \`expect\`）都有"断言失败就抛异常"的函数，但这些函数返回 \`void\`，TypeScript 无法知道调用后类型发生了变化。断言函数让这类函数能**表达"调用后类型收窄"的语义**，使它们能像类型守卫一样工作。

### 5. 与 Node.js \`assert\` 模块结合

Node.js 的 \`assert\` 模块是典型的断言函数库。在 TypeScript 中，可以用断言函数签名包装它，获得类型收窄：

\`\`\`ts
import assert from "assert";

// 包装：让 assert.ok 触发类型收窄
function assertNonNull<T>(x: T, msg?: string): asserts x is NonNullable<T> {
  if (x === null || x === undefined) {
    throw new Error(msg || "Expected non-null");
  }
}

function process(x: string | null) {
  assertNonNull(x);
  x.toUpperCase(); // ✅ x 收窄为 string
}
\`\`\`

\`NonNullable<T>\` 是内置工具类型，排除 \`null\` 和 \`undefined\`。结合 \`asserts\` 可以做"非空断言"。

### 6. 实战：校验 API 响应

外部 API 响应、JSON.parse 的结果都是 \`unknown\`，用断言函数做边界校验是经典模式：

\`\`\`ts
interface User { id: number; name: string; email?: string; }

function assertUser(x: unknown): asserts x is User {
  if (typeof x !== "object" || x === null) throw new Error("not object");
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") throw new Error("id missing");
  if (typeof obj.name !== "string") throw new Error("name missing");
  if (obj.email !== undefined && typeof obj.email !== "string") {
    throw new Error("email invalid");
  }
}

function handleApiResponse(data: unknown) {
  assertUser(data);   // 校验 + 收窄
  console.log(data.id, data.name);   // ✅ 后续按 User 用
  return data;
}
\`\`\`

这个模式把"运行时校验"和"类型保证"统一——校验函数既做运行时检查，又通过 \`asserts\` 让后续代码获得类型。

### 7. 实战：不变式检查

不变式（Invariant）是程序某处必须成立的条件，违反就是 bug。断言函数是表达不变式的自然方式：

\`\`\`ts
function assertUnreachable(x: never): never {
  throw new Error("Should not reach: " + JSON.stringify(x));
}

type Shape = "circle" | "square";
function area(s: Shape, n: number): number {
  switch (s) {
    case "circle": return Math.PI * n * n;
    case "square": return n * n;
    default:
      // 如果未来加了新 case 忘了处理，这里编译期就报错
      return assertUnreachable(s);
  }
}
\`\`\`

\`assertUnreachable\` 接收 \`never\`——如果 switch 漏了某个 case，\`s\` 在 default 分支就不是 \`never\`，编译期就报错。这是"穷尽性检查"的标准技巧。

### 8. 实战：测试断言

测试框架的断言（\`expect(x).toBe(y)\`）也是断言函数的典型场景：

\`\`\`ts
function expectTruthy(x: unknown): asserts x {
  if (!x) throw new Error("Expected truthy, got " + x);
}

function test() {
  const x: string | undefined = maybeGet();
  expectTruthy(x);
  x.length; // ✅ x 收窄为 string（因为 undefined 是 falsy）
}
\`\`\`

### 9. 断言函数的控制流分析行为

断言函数的收窄规则：
1. **调用后**：后续代码（同一作用域）按收窄后的类型处理。
2. **函数返回后**：如果断言函数返回，说明条件成立；如果抛异常，控制流中断。
3. **在条件分支里**：\`if (cond) { assertX(x); ... }\` 里收窄只在 if 分支内有效。
4. **循环里**：循环体内的断言函数调用，每次迭代都重新收窄。

\`\`\`ts
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error();
}

function demo(arr: unknown[]) {
  for (const item of arr) {
    assertString(item);
    item.toUpperCase(); // ✅ 每次迭代都收窄
  }
}
\`\`\`

### 10. 常见陷阱

#### 陷阱 1：断言函数必须有 throw 路径

\`\`\`ts
// ❌ 错误：没有 throw，断言函数形同虚设
function badAssert(x: unknown): asserts x is string {
  // 没有 throw，即使条件不满足也不抛
  if (typeof x !== "string") {
    console.log("不是字符串"); // 只是 log，不抛
  }
}
\`\`\`

断言函数的语义是"抛异常 = 失败"，如果没 throw，即使条件不满足也会被 TypeScript 当作收窄成功——这会导致**类型谎言**，运行时拿到的可能不是声明的类型。务必确保失败路径抛异常。

#### 陷阱 2：类型谓词返回值必须真实

\`\`\`ts
// ❌ 错误：返回值与谓词不符
function isString(x: unknown): x is string {
  return typeof x === "number"; // 返回 number 时声称是 string！
}
\`\`\`

TypeScript 不会检查类型谓词的实现是否正确——它信任你。如果实现错了，类型系统会基于错误的假设收窄，导致运行时 bug。**类型谓词是"程序员对编译器的承诺"，必须自己保证实现正确。**

#### 陷阱 3：断言函数不能在异步中隐式收窄

\`\`\`ts
async function assertAsync(x: unknown): Promise<asserts x is string> {
  // ❌ 这种写法不工作！asserts 不能和 Promise 组合
}
\`\`\`

断言函数的收窄依赖同步控制流，异步函数（返回 Promise）的收窄行为有限。如需异步校验，用类型谓词 + 显式 if 更可靠。

#### 陷阱 4：谓词里的参数名必须匹配

\`\`\`ts
function isString(value: unknown): value is string { ... } // ✅ value 匹配
function isString(x: unknown): y is string { ... } // ❌ y 不是参数名
\`\`\`

\`x is T\` 里的 \`x\` 必须是函数的某个参数名。

### 11. 最佳实践

1. **优先用类型谓词做条件判断**：\`if (isX(x))\` 双分支场景用谓词更自然。
2. **用断言函数做前置校验**：函数入口、API 边界用断言函数更简洁。
3. **断言函数务必 throw**：失败路径必须抛异常，否则类型谎言。
4. **校验函数集中管理**：把校验逻辑（含 \`asserts\`）放在边界层，内部代码信任类型。
5. **结合 \`NonNullable\`**：用 \`asserts x is NonNullable<T>\` 做非空断言。
6. **用 \`assertUnreachable\` 做穷尽性检查**：防止 enum/联合漏 case。
7. **不要过度用断言**：能用类型守卫 + if 解决的，不必上断言函数。

### 对比总结表

| 特性 | 类型谓词 \`x is T\` | 断言函数 \`asserts x is T\` | 简单断言 \`asserts cond\` |
| --- | --- | --- | --- |
| 返回值 | 布尔 | 无（抛异常） | 无（抛异常） |
| 收窄触发 | if 分支 | 调用后自动 | 调用后自动 |
| 失败处理 | 返回 false | 抛异常 | 抛异常 |
| 典型场景 | 联合收窄、过滤 | 入口校验、不变式 | 条件断言 |
| 控制流 | 双分支 | 单分支（后续） | 单分支（后续） |
| 异步支持 | 较好 | 受限 | 受限 |

### 本章小结

类型谓词和断言函数是 TypeScript 把"运行时判断"和"编译期类型"打通的两座桥梁。类型谓词适合条件分支场景（\`if (isX(x))\`），断言函数适合前置校验场景（\`assertX(x); ...后续...\`）。掌握它们能让你写出既类型安全又运行时可靠的代码。下面代码演示两者的各种用法。`,
    code: `// ============================================================
// 断言函数与类型谓词深入 —— 代码演示
// ============================================================
// 类型谓词和断言函数的"收窄"是编译期行为，转译后擦除。
// 我们用变量声明 + 注释展示编译期收窄，用运行时函数
// 模拟校验逻辑。

console.log("========== 断言函数与类型谓词深入 ==========");

// ---- 1. 类型谓词：x is Type ----
console.log("\\n---- 1. 类型谓词：x is Type ----");

// isString：返回 true 时，x 收窄为 string
function isString(x: unknown): x is string {
  return typeof x === "string";
}

// isNumber：返回 true 时，x 收窄为 number
function isNumber(x: unknown): x is number {
  return typeof x === "number";
}

// 使用类型谓词收窄联合类型
function processValue(x: unknown): string {
  if (isString(x)) {
    // ✅ 编译期：x 在这里收窄为 string
    return "字符串: " + x.toUpperCase();
  }
  if (isNumber(x)) {
    // ✅ 编译期：x 在这里收窄为 number
    return "数字: " + (x * 2);
  }
  return "其他: " + String(x);
}

console.log("processValue('hello'):", processValue("hello"));
console.log("processValue(42):", processValue(42));
console.log("processValue(true):", processValue(true));

// ---- 2. 自定义类型守卫：收窄联合类型 ----
console.log("\\n---- 2. 自定义类型守卫 ----");

interface Dog { kind: "dog"; bark(): string; }
interface Cat { kind: "cat"; meow(): string; }
type Pet = Dog | Cat;

// 类型谓词：判断是不是 Dog
function isDog(pet: Pet): pet is Dog {
  return pet.kind === "dog";
}

// 类型谓词：判断是不是 Cat
function isCat(pet: Pet): pet is Cat {
  return pet.kind === "cat";
}

function speak(pet: Pet): string {
  if (isDog(pet)) {
    // ✅ pet 收窄为 Dog
    return pet.bark();
  } else {
    // ✅ pet 收窄为 Cat（else 分支自动排除）
    return pet.meow();
  }
}

const dog: Dog = { kind: "dog", bark: function () { return "汪汪!"; } };
const cat: Cat = { kind: "cat", meow: function () { return "喵喵!"; } };
console.log("speak(dog):", speak(dog));
console.log("speak(cat):", speak(cat));

// ---- 3. 类型谓词用于过滤数组 ----
console.log("\\n---- 3. 类型谓词过滤数组 ----");

// 定义混合数组类型
const mixed: (string | number)[] = ["a", 1, "b", 2, "c", 3];

// Array.filter 接受类型谓词，能收窄结果数组类型
const onlyStrings = mixed.filter(isString);
// 编译期：onlyStrings 类型是 string[]
const onlyNumbers = mixed.filter(isNumber);
// 编译期：onlyNumbers 类型是 number[]

console.log("过滤出字符串:", onlyStrings);
console.log("过滤出数字:", onlyNumbers);
console.log("onlyStrings[0].toUpperCase():", onlyStrings[0].toUpperCase());
console.log("onlyNumbers[0] * 2:", onlyNumbers[0] * 2);

// ---- 4. 断言函数：asserts x is Type ----
console.log("\\n---- 4. 断言函数：asserts x is Type ----");

// assertString：不抛异常时，x 收窄为 string
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") {
    throw new Error("Expected string, got " + typeof x + " (" + String(x) + ")");
  }
}

// assertNumber：不抛异常时，x 收窄为 number
function assertNumber(x: unknown): asserts x is number {
  if (typeof x !== "number") {
    throw new Error("Expected number, got " + typeof x);
  }
}

// 使用：调用后后续代码自动收窄
function useAssertString(x: unknown): string {
  assertString(x);    // 调用断言函数
  // ✅ 编译期：调用后 x 收窄为 string，后续可直接用
  return x.toUpperCase() + x.toLowerCase();
}

console.log("useAssertString('Hello'):", useAssertString("Hello"));

// 断言失败会抛异常
try {
  useAssertString(123);
} catch (e: any) {
  console.log("useAssertString(123) 抛异常:", e.message);
}

// ---- 5. 简单条件断言：asserts condition ----
console.log("\\n---- 5. 简单条件断言 ----");

// assert：通用断言，condition 为假时抛异常
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || "Assertion failed");
  }
}

// divide：用 assert 保证除数不为 0
function divide(a: number, b: number): number {
  assert(b !== 0, "除数不能为 0");
  // 调用后 b !== 0 这个事实被"记住"
  return a / b;
}

console.log("divide(10, 2):", divide(10, 2));
try {
  divide(10, 0);
} catch (e: any) {
  console.log("divide(10, 0) 抛异常:", e.message);
}

// assertNonNull：非空断言
function assertNonNull<T>(x: T, msg?: string): asserts x is NonNullable<T> {
  if (x === null || x === undefined) {
    throw new Error(msg || "Expected non-null");
  }
}

function processMaybe(x: string | null | undefined): string {
  assertNonNull(x, "x 不能为空");
  // ✅ x 收窄为 string
  return x.repeat(3);
}

console.log("processMaybe('ab'):", processMaybe("ab"));
try {
  processMaybe(null);
} catch (e: any) {
  console.log("processMaybe(null) 抛异常:", e.message);
}

// ---- 6. 实战：校验 API 响应 ----
console.log("\\n---- 6. 实战：校验 API 响应 ----");

interface User {
  id: number;
  name: string;
  email?: string;
  roles: string[];
}

// assertUser：校验未知数据是否符合 User 接口
function assertUser(x: unknown): asserts x is User {
  if (typeof x !== "object" || x === null) {
    throw new Error("User 必须是对象");
  }
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") throw new Error("id 必须是 number");
  if (typeof obj.name !== "string") throw new Error("name 必须是 string");
  if (obj.email !== undefined && typeof obj.email !== "string") {
    throw new Error("email 必须是 string");
  }
  if (!Array.isArray(obj.roles)) throw new Error("roles 必须是数组");
  // 进一步校验数组元素
  for (const role of obj.roles) {
    if (typeof role !== "string") throw new Error("roles 元素必须是 string");
  }
}

// 模拟 API 响应
const goodResponse = { id: 1, name: "张三", email: "zs@example.com", roles: ["admin", "user"] };
const badResponse1 = { id: "1", name: "李四" }; // id 类型错
const badResponse2 = { id: 2, name: "王五", roles: "admin" }; // roles 不是数组

// 处理 API 响应
function handleApiResponse(data: unknown): User {
  assertUser(data);    // 校验 + 收窄
  // ✅ 后续代码按 User 用
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    roles: data.roles,
  };
}

console.log("handleApiResponse(goodResponse):", JSON.stringify(handleApiResponse(goodResponse)));
try {
  handleApiResponse(badResponse1);
} catch (e: any) {
  console.log("badResponse1 校验失败:", e.message);
}
try {
  handleApiResponse(badResponse2);
} catch (e: any) {
  console.log("badResponse2 校验失败:", e.message);
}

// ---- 7. 与 Node.js assert 模块结合 ----
console.log("\\n---- 7. 与 Node assert 模块结合 ----");

// Node.js 内置 assert 模块
const assert = require("assert") as {
  ok: (cond: unknown, msg?: string) => void;
  equal: (a: unknown, b: unknown, msg?: string) => void;
  strictEqual: (a: unknown, b: unknown, msg?: string) => void;
  throws: (fn: () => void, msg?: string) => void;
};

// 包装 Node assert.ok 为类型断言函数
function assertOk<T>(x: T, msg?: string): asserts x {
  assert.ok(x, msg);
}

// 包装为非空断言
function assertNotNull<T>(x: T, msg?: string): asserts x is NonNullable<T> {
  assert.ok(x !== null && x !== undefined, msg || "Expected non-null");
}

function findUser(id: number): { id: number; name: string } | null {
  // 模拟查找
  if (id === 1) return { id: 1, name: "张三" };
  return null;
}

function greetUser(id: number): string {
  const user = findUser(id);
  assertNotNull(user, "用户不存在");
  // ✅ user 收窄为非 null
  return "你好, " + user.name;
}

console.log("greetUser(1):", greetUser(1));
try {
  greetUser(999);
} catch (e: any) {
  console.log("greetUser(999) 抛异常:", e.message);
}

// 用 Node assert 做测试断言
function testAddition(): void {
  const result = 1 + 2;
  assert.strictEqual(result, 3, "1+2 应该等于 3");
  console.log("  ✓ 1 + 2 = 3 测试通过");
}

function testStringOps(): void {
  const s = "hello";
  assert.ok(s.length === 5, "hello 长度应该是 5");
  assert.ok(s.toUpperCase() === "HELLO", "大写转换测试");
  console.log("  ✓ 字符串操作测试通过");
}

console.log("运行测试:");
testAddition();
testStringOps();

// ---- 8. 穷尽性检查：assertUnreachable ----
console.log("\\n---- 8. 穷尽性检查 ----");

// assertUnreachable：接收 never，永远抛异常
function assertUnreachable(x: never): never {
  throw new Error("Should not reach: " + JSON.stringify(x));
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "triangle"; base: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius * s.radius;
    case "square":
      return s.size * s.size;
    case "triangle":
      return 0.5 * s.base * s.height;
    default:
      // ✅ 如果未来加了新 case 没处理，这里编译期就报错
      // 因为 default 分支 s 应该是 never，漏 case 就不是 never
      return assertUnreachable(s);
  }
}

console.log("area(circle, r=2):", area({ kind: "circle", radius: 2 }).toFixed(2));
console.log("area(square, s=3):", area({ kind: "square", size: 3 }));
console.log("area(triangle, b=4, h=5):", area({ kind: "triangle", base: 4, height: 5 }));

// ---- 9. 类型谓词 vs 断言函数对比 ----
console.log("\\n---- 9. 类型谓词 vs 断言函数对比 ----");

// 同一个判断，两种写法
function isUserPredicate(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return typeof obj.id === "number" && typeof obj.name === "string";
}

function assertUserFunc(x: unknown): asserts x is User {
  if (typeof x !== "object" || x === null) throw new Error("not object");
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") throw new Error("id missing");
  if (typeof obj.name !== "string") throw new Error("name missing");
}

// 类型谓词：双分支处理
function handleWithPredicate(data: unknown): string {
  if (isUserPredicate(data)) {
    // ✅ data 收窄为 User
    return "有效用户: " + data.name;
  } else {
    return "无效数据";
  }
}

// 断言函数：直接调用，失败抛异常
function handleWithAssert(data: unknown): string {
  assertUserFunc(data);    // 失败抛异常
  // ✅ data 收窄为 User
  return "有效用户: " + data.name;
}

const validData = { id: 1, name: "张三", roles: [] };
const invalidData = { id: "1", name: 123 };

console.log("谓词处理有效数据:", handleWithPredicate(validData));
console.log("谓词处理无效数据:", handleWithPredicate(invalidData));
console.log("断言处理有效数据:", handleWithAssert(validData));
try {
  handleWithAssert(invalidData);
} catch (e: any) {
  console.log("断言处理无效数据抛异常:", e.message);
}

// ---- 10. 综合应用：分层校验 ----
console.log("\\n---- 10. 综合应用：分层校验 ----");

// 第一层：基础类型守卫
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function hasStringProp(x: Record<string, unknown>, key: string): x is Record<string, unknown> & { [K in typeof key]: string } {
  return typeof x[key] === "string";
}

// 第二层：组合断言
function assertUserFull(x: unknown): asserts x is User {
  if (!isObject(x)) throw new Error("User 必须是对象");
  if (typeof x.id !== "number") throw new Error("id 必须是 number");
  if (typeof x.name !== "string") throw new Error("name 必须是 string");
  if (x.email !== undefined && typeof x.email !== "string") throw new Error("email 必须是 string");
  if (!Array.isArray(x.roles)) throw new Error("roles 必须是数组");
}

// 第三层：业务逻辑信任类型
function formatUser(user: User): string {
  // 内部代码信任类型，不再重复校验
  const roleStr = user.roles.length > 0 ? " [" + user.roles.join(",") + "]" : "";
  return "#" + user.id + " " + user.name + roleStr;
}

// 系统边界：校验后内部信任
function processApiData(raw: unknown): string {
  assertUserFull(raw);     // 边界校验
  return formatUser(raw);  // 内部信任类型
}

console.log("processApiData(有效):", processApiData({ id: 1, name: "张三", roles: ["admin"] }));
try {
  processApiData({ id: "x", name: "李四", roles: [] });
} catch (e: any) {
  console.log("processApiData(无效) 抛异常:", e.message);
}

console.log("\\n断言函数与类型谓词深入章节演示完成！");`,
  },

  // =========================================================
  // 第二章：symbol 与 unique symbol 深入
  // =========================================================
  {
    id: "ts-unique-symbol",
    title: "symbol 与 unique symbol 深入",
    icon: "🔣",
    group: "进阶类型深入",
    content: `## symbol 与 unique symbol 深入 (Symbols & Unique Symbols)

\`symbol\` 是 JavaScript 的原始类型之一，ES6 引入。它表示**全局唯一**的值——每个 \`Symbol()\` 调用都产生一个独一无二的值，即使描述相同。TypeScript 在此基础上扩展了 \`unique symbol\` 类型，把"运行时唯一性"提升到了**编译期类型层面**——每个 \`unique symbol\` 声明都是一个独立的类型，这让 symbol 能用作类型层面的"品牌"。

本章将极其详细地讲解 symbol 基础、Symbol.for 全局注册表、unique symbol 的编译期唯一性、unique symbol 的限制、well-known symbols、symbol 与品牌类型的关系，以及对比表与最佳实践。

### 1. symbol 基础

#### 创建与唯一性

\`\`\`ts
const s1 = Symbol("desc");
const s2 = Symbol("desc");
console.log(s1 === s2); // false —— 即使描述相同，每个 Symbol() 都是唯一的
\`\`\`

\`Symbol("desc")\` 的参数 \`"desc"\` 只是**描述**（用于调试和 toString），不影响唯一性。两个 \`Symbol("desc")\` 是不同的值。

#### 作为对象键

symbol 最常见的用途是作为对象的"私有"键——它们不会出现在 \`for...in\`、\`Object.keys\`、\`JSON.stringify\` 中：

\`\`\`ts
const privateKey = Symbol("private");
const obj = {
  [privateKey]: "secret",
  name: "public",
};
console.log(Object.keys(obj));        // ["name"] —— 不含 symbol 键
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(private)] —— 单独获取
\`\`\`

这让 symbol 键天然适合存储"元数据"或"内部状态"。

#### symbol 类型

在 TypeScript 中，\`symbol\` 是所有 symbol 值的类型：

\`\`\`ts
let s: symbol = Symbol("x");
\`\`\`

\`symbol\` 类型是宽类型，所有 symbol 值都属于它。但具体的 symbol 值（如 \`Symbol("x")\`）有更精确的类型——这就要用到 \`unique symbol\`。

### 2. Symbol.for 全局注册表 vs Symbol() 局部 symbol

\`Symbol.for(key)\` 是全局注册表：相同的 key 返回**同一个** symbol。

\`\`\`ts
const a = Symbol.for("shared");
const b = Symbol.for("shared");
console.log(a === b); // true —— 全局共享

const c = Symbol("shared");
const d = Symbol("shared");
console.log(c === d); // false —— 局部不共享
\`\`\`

\`Symbol.for\` 会在全局 symbol 注册表中查找 key 对应的 symbol，存在就返回，不存在就创建并注册。\`Symbol()\` 每次都创建新的，不注册。

#### Symbol.keyFor

\`Symbol.keyFor(sym)\` 返回全局注册表中 symbol 对应的 key：

\`\`\`ts
const s = Symbol.for("myKey");
console.log(Symbol.keyFor(s)); // "myKey"

const local = Symbol("local");
console.log(Symbol.keyFor(local)); // undefined —— 局部 symbol 没注册
\`\`\`

#### 对比表

| 特性 | \`Symbol(desc)\` | \`Symbol.for(key)\` |
| --- | --- | --- |
| 唯一性 | 每次唯一 | 相同 key 返回同一 symbol |
| 作用域 | 局部 | 全局注册表 |
| \`Symbol.keyFor\` | 返回 undefined | 返回 key |
| 典型场景 | 私有键、内部状态 | 跨模块共享 symbol |

### 3. unique symbol 的编译期唯一性

\`unique symbol\` 是 TypeScript 的扩展，它把 symbol 的唯一性提升到**类型层面**。每个 \`unique symbol\` 声明都是一个独立的类型。

#### 基础语法

\`\`\`ts
const s1: unique symbol = Symbol();
const s2: unique symbol = Symbol();

// s1 和 s2 是不同的类型！
let a: typeof s1 = s1; // ✅
let b: typeof s2 = s2; // ✅
// let c: typeof s1 = s2; // ❌ 编译错误：s2 不能赋值给 typeof s1
\`\`\`

\`typeof s1\` 和 \`typeof s2\` 是两个不同的类型——它们在类型层面就是不同的。\`unique symbol\` 让 symbol 的身份成为类型系统的一部分。

#### 声明方式

\`unique symbol\` 只能用 \`const\` 声明（或 \`readonly\` 属性）：

\`\`\`ts
const sym: unique symbol = Symbol(); // ✅ const 声明
let sym2: unique symbol = Symbol();  // ❌ 不能用 let
\`\`\`

因为 \`let\` 变量可以被重新赋值，而 \`unique symbol\` 要求"这个变量永远指向同一个 symbol"——只有 \`const\` 能保证。

#### 用 declare 声明跨文件 unique symbol

\`\`\`ts
// symbols.ts
export const MY_SYMBOL: unique symbol = Symbol();

// other.ts
import { MY_SYMBOL } from "./symbols";
// MY_SYMBOL 的类型是 typeof MY_SYMBOL，即那个独特的 unique symbol 类型
\`\`\`

跨文件共享 unique symbol 需要 \`import\`，因为类型信息必须从声明处获取。

### 4. unique symbol 作为对象键

\`\`\`ts
const myKey: unique symbol = Symbol("myKey");
interface MyObj {
  [myKey]: string;  // ✅ 用 unique symbol 作为已知键
  name: string;
}

const obj: MyObj = {
  [myKey]: "secret",
  name: "public",
};

console.log(obj[myKey]); // ✅ 类型安全访问
\`\`\`

用 \`unique symbol\` 作为对象键，TypeScript 能在编译期知道这个键存在，并提供类型安全的访问。这是普通 \`symbol\` 类型做不到的——\`symbol\` 类型的键是开放的，TypeScript 不知道具体是哪个 symbol。

### 5. unique symbol 作为枚举成员

\`\`\`ts
enum Color {
  Red = Symbol("red") as any,
  Green = Symbol("green") as any,
  Blue = Symbol("blue") as any,
}
\`\`\`

注意：TypeScript 的 enum 对 symbol 值的支持有限，需要 \`as any\` 断言。更推荐用 \`const\` 对象 + unique symbol 的方式：

\`\`\`ts
const Color = {
  Red: Symbol("red") as unique symbol,
  Green: Symbol("green") as unique symbol,
  Blue: Symbol("blue") as unique symbol,
} as const;
\`\`\`

### 6. well-known symbols

JavaScript 内置了一组"知名 symbol"，它们定义在 \`Symbol\` 对象上，用于自定义对象的内部行为：

#### Symbol.iterator：自定义可迭代对象

\`\`\`ts
class Range {
  constructor(public start: number, public end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

const range = new Range(1, 5);
for (const n of range) {
  console.log(n); // 1, 2, 3, 4, 5
}
\`\`\`

实现 \`Symbol.iterator\` 让对象可以用 \`for...of\` 遍历、用 \`...\` 展开。

#### Symbol.asyncIterator：异步迭代

\`\`\`ts
class AsyncRange {
  async *[Symbol.asyncIterator]() {
    for (let i = 1; i <= 3; i++) {
      await new Promise(r => setTimeout(r, 100));
      yield i;
    }
  }
}
\`\`\`

#### Symbol.hasInstance：自定义 instanceof

\`\`\`ts
class Even {
  static [Symbol.hasInstance](x: number): boolean {
    return typeof x === "number" && x % 2 === 0;
  }
}
console.log(4 instanceof Even); // true
console.log(3 instanceof Even); // false
\`\`\`

#### Symbol.toPrimitive：自定义类型转换

\`\`\`ts
class Temperature {
  constructor(public celsius: number) {}
  [Symbol.toPrimitive](hint: string): number | string {
    if (hint === "number") return this.celsius;
    if (hint === "string") return this.celsius + "°C";
    return this.celsius.toString();
  }
}
const t = new Temperature(25);
console.log(+t);        // 25（number hint）
console.log(\`\${t}\`);    // "25°C"（string hint）
console.log(t + "");    // "25"（default hint）
\`\`\`

#### Symbol.dispose：资源清理（ES2024）

\`\`\`ts
class Resource implements Disposable {
  [Symbol.dispose]() {
    console.log("清理资源");
  }
}

using r = new Resource();
// 作用域结束时自动调用 [Symbol.dispose]
\`\`\`

\`using\` 声明是 ES2024 引入的资源管理语法，类似 Python 的 \`with\`。

#### 常用 well-known symbols 列表

| Symbol | 用途 | 触发方式 |
| --- | --- | --- |
| \`Symbol.iterator\` | 同步迭代 | \`for...of\`、\`...\`、\`Array.from\` |
| \`Symbol.asyncIterator\` | 异步迭代 | \`for await...of\` |
| \`Symbol.hasInstance\` | 自定义 instanceof | \`x instanceof C\` |
| \`Symbol.toPrimitive\` | 类型转换 | \`+x\`、\`\${x}\`、\`x + y\` |
| \`Symbol.toStringTag\` | 自定义 toString | \`Object.prototype.toString.call(x)\` |
| \`Symbol.isConcatSpreadable\` | 数组 concat 行为 | \`[].concat(x)\` |
| \`Symbol.dispose\` | 资源清理 | \`using\` 声明 |
| \`Symbol.asyncDispose\` | 异步资源清理 | \`await using\` |

### 7. symbol 与 brand types 的关系

在品牌类型章节，我们用 \`__brand: string\` 属性做品牌。更安全的做法是用 \`unique symbol\` 做品牌——因为 \`unique symbol\` 无法被外部伪造：

\`\`\`ts
declare const brand: unique symbol;
type Branded<T> = T & { readonly [brand]: true };

type UserId = Branded<number>;
type OrderId = Branded<number>;

// UserId 和 OrderId 的品牌键是同一个 symbol？
// 不！每个 Branded<T> 用的是同一个 brand symbol，所以要为每种品牌用不同的 symbol
\`\`\`

更精确的做法是为每种品牌用独立的 unique symbol：

\`\`\`ts
declare const userIdBrand: unique symbol;
declare const orderIdBrand: unique symbol;
type UserId = number & { readonly [userIdBrand]: true };
type OrderId = number & { readonly [orderIdBrand]: true };
\`\`\`

这样 \`UserId\` 和 \`OrderId\` 在类型层面彻底不同，无法互相赋值。

### 8. unique symbol 的限制

\`unique symbol\` 只能在以下位置使用：

| 位置 | 是否允许 | 说明 |
| --- | --- | --- |
| \`const\` 声明 | ✅ | \`const s: unique symbol = Symbol();\` |
| \`readonly\` 属性 | ✅ | \`class C { readonly s: unique symbol = Symbol(); }\` |
| 泛型默认参数 | ✅ | \`type T<S extends symbol = unique symbol>\` |
| \`let\` 声明 | ❌ | let 变量可重赋值，违反唯一性 |
| 函数参数 | ❌ | 参数可变，不能保证唯一 |
| 普通属性 | ❌ | 属性可写，需 readonly |

### 9. 对比表：symbol vs unique symbol vs string

| 维度 | \`symbol\` | \`unique symbol\` | \`string\` |
| --- | --- | --- | --- |
| 运行时类型 | symbol | symbol | string |
| 编译期唯一性 | 无 | 有（每个声明是独立类型） | 无 |
| 作为已知键 | 不能 | 能 | 能 |
| 跨文件共享 | 任意 | 需 import 类型 | 任意 |
| 可枚举性 | for...in 不可见 | for...in 不可见 | 可见 |
| 典型场景 | 私有键、迭代器 | 品牌类型、类型安全键 | 普通属性 |

### 10. 常见陷阱

1. **\`Symbol()\` 不等于 \`Symbol.for()\`**：前者每次新值，后者全局共享。
2. **\`unique symbol\` 必须 \`const\`**：\`let\` 不行。
3. **跨文件 unique symbol 需 import 类型**：类型信息不能凭空获得。
4. **symbol 不能用 new**：\`new Symbol()\` 抛错，只能 \`Symbol()\`。
5. **symbol 不能转 number**：\`+Symbol()\` 抛 TypeError，需先 \`String(sym)\` 或 \`sym.description\`。
6. **JSON.stringify 丢失 symbol 键**：序列化时 symbol 键被忽略。

### 11. 最佳实践

1. **私有键用 \`Symbol()\`**：避免与普通字符串键冲突，且不污染枚举。
2. **跨模块共享用 \`Symbol.for()\`**：但要注意命名冲突，用前缀避免。
3. **品牌类型用 \`unique symbol\`**：比 \`string\` 品牌更安全，无法伪造。
4. **实现 well-known symbols 自定义行为**：如 \`Symbol.iterator\` 让对象可迭代。
5. **不要滥用 symbol**：简单场景用字符串键更直观。

### 本章小结

\`symbol\` 是 JavaScript 的原始类型，运行时唯一；\`unique symbol\` 是 TypeScript 的扩展，编译期唯一。前者适合私有键和迭代器实现，后者适合品牌类型和类型安全的 symbol 键。well-known symbols 让你能自定义对象的内部行为（迭代、instanceof、类型转换）。下面代码演示这些概念。`,
    code: `// ============================================================
// symbol 与 unique symbol 深入 —— 代码演示
// ============================================================
// symbol 运行时存在，unique symbol 的"唯一类型"是编译期
// 行为，转译后擦除。用 typeof 验证运行时值，用注释说明
// 编译期类型计算。

console.log("========== symbol 与 unique symbol 深入 ==========");

// ---- 1. symbol 基础与唯一性 ----
console.log("\\n---- 1. symbol 基础与唯一性 ----");

// 每个 Symbol() 都是唯一的，即使描述相同
const s1 = Symbol("desc");
const s2 = Symbol("desc");
console.log("s1 === s2:", s1 === s2, "← 即使描述相同也是不同的 symbol");
console.log("s1.toString():", s1.toString());
console.log("s1.description:", s1.description);

// symbol 是原始类型
console.log("typeof s1:", typeof s1);

// symbol 不能用 new
try {
  // new Symbol(); // TypeError
  const x = Symbol();
  console.log("Symbol() 创建成功:", typeof x);
} catch (e: any) {
  console.log("Symbol 创建异常:", e.message);
}

// symbol 不能转 number
try {
  // +s1; // TypeError
  console.log("（symbol 不能转 number，需用 .description）");
  console.log("Number(s1.description):", Number("123"));
} catch (e: any) {
  console.log("转换异常:", e.message);
}

// ---- 2. symbol 作为对象键 ----
console.log("\\n---- 2. symbol 作为对象键 ----");

const privateKey = Symbol("private");
const obj: { [key: symbol]: string; name: string; } = {
  [privateKey]: "secret value",
  name: "public value",
};

// symbol 键不出现在 Object.keys / for...in / JSON.stringify
console.log("Object.keys(obj):", Object.keys(obj), "← 不含 symbol 键");
console.log("JSON.stringify(obj):", JSON.stringify(obj), "← symbol 键被忽略");

// 用 Object.getOwnPropertySymbols 获取 symbol 键
const symbols = Object.getOwnPropertySymbols(obj);
console.log("Object.getOwnPropertySymbols(obj):", symbols.map(s => s.toString()));

// 用 symbol 键访问
console.log("obj[privateKey]:", obj[privateKey]);

// for...in 不遍历 symbol 键
console.log("for...in 遍历:");
for (const key in obj) {
  console.log("  ", key, "=", (obj as any)[key]);
}

// ---- 3. Symbol.for 全局注册表 ----
console.log("\\n---- 3. Symbol.for 全局注册表 ----");

// Symbol.for：相同 key 返回同一 symbol
const shared1 = Symbol.for("app.shared");
const shared2 = Symbol.for("app.shared");
console.log("Symbol.for('app.shared') === Symbol.for('app.shared'):", shared1 === shared2, "← 全局共享");

// Symbol() 不共享
const local1 = Symbol("app.shared");
const local2 = Symbol("app.shared");
console.log("Symbol('app.shared') === Symbol('app.shared'):", local1 === local2, "← 局部不共享");

// Symbol.keyFor：获取全局注册的 key
console.log("Symbol.keyFor(shared1):", Symbol.keyFor(shared1));
console.log("Symbol.keyFor(local1):", Symbol.keyFor(local1), "← 局部 symbol 返回 undefined");

// 实战：跨模块共享 symbol
const configKey = Symbol.for("app.config");
const globalConfig = (globalThis as any);
globalConfig[configKey] = { env: "production", port: 3000 };

// 另一处代码用同样的 key 获取
const sameKey = Symbol.for("app.config");
console.log("跨模块读取 globalConfig[sameKey]:", JSON.stringify(globalConfig[sameKey]));

// ---- 4. unique symbol 作为对象键 ----
console.log("\\n---- 4. unique symbol 作为对象键 ----");

// 声明 unique symbol
const myKey: unique symbol = Symbol("myKey");

// 用 unique symbol 作为对象类型的关键键
interface MyObj {
  [myKey]: string;   // ✅ 已知的 symbol 键
  name: string;
  age: number;
}

const obj2: MyObj = {
  [myKey]: "类型安全的 symbol 键",
  name: "张三",
  age: 30,
};

// 类型安全访问
console.log("obj2[myKey]:", obj2[myKey], "← 类型系统知道这个键存在");
console.log("obj2.name:", obj2.name);

// ---- 5. well-known symbols：Symbol.iterator ----
console.log("\\n---- 5. well-known symbols：Symbol.iterator ----");

// 实现 Symbol.iterator 让对象可迭代
class Range {
  constructor(public start: number, public end: number) {}

  // 实现 Symbol.iterator 方法
  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

const range = new Range(1, 5);
console.log("Range(1,5) 用 for...of 遍历:");
for (const n of range) {
  console.log("  ", n);
}

// 用 ... 展开
console.log("Range(1,5) 用 ... 展开:", [...new Range(1, 5)]);
console.log("Array.from(new Range(1,3)):", Array.from(new Range(1, 3)));

// 自定义可迭代集合
class Fibonacci {
  constructor(public count: number) {}
  [Symbol.iterator](): Iterator<number> {
    let a = 0, b = 1, i = 0;
    const count = this.count;
    return {
      next(): IteratorResult<number> {
        if (i++ < count) {
          const value = a;
          [a, b] = [b, a + b];
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

console.log("Fibonacci(10):", [...new Fibonacci(10)]);

// ---- 6. Symbol.hasInstance：自定义 instanceof ----
console.log("\\n---- 6. Symbol.hasInstance ----");

class Even {
  static [Symbol.hasInstance](x: unknown): boolean {
    return typeof x === "number" && x % 2 === 0;
  }
}

class Odd {
  static [Symbol.hasInstance](x: unknown): boolean {
    return typeof x === "number" && x % 2 === 1;
  }
}

console.log("4 instanceof Even:", 4 instanceof Even);
console.log("3 instanceof Even:", 3 instanceof Even);
console.log("3 instanceof Odd:", 3 instanceof Odd);
console.log("4 instanceof Odd:", 4 instanceof Odd);

// ---- 7. Symbol.toPrimitive：自定义类型转换 ----
console.log("\\n---- 7. Symbol.toPrimitive ----");

class Temperature {
  constructor(public celsius: number) {}

  [Symbol.toPrimitive](hint: string): number | string {
    if (hint === "number") return this.celsius;
    if (hint === "string") return this.celsius + "°C";
    return this.celsius.toString(); // default
  }

  toString(): string {
    return this.celsius + "°C";
  }
}

const t = new Temperature(25);
console.log("+t (number hint):", +t);
console.log("\`\${t}\` (string hint):", \`\${t}\`);
console.log("t + '' (default hint):", t + "");
console.log("String(t):", String(t));

// ---- 8. Symbol.toStringTag：自定义 toString 标签 ----
console.log("\\n---- 8. Symbol.toStringTag ----");

class MyClass {
  get [Symbol.toStringTag]() {
    return "MyClass";
  }
}

const mc = new MyClass();
console.log("Object.prototype.toString.call(mc):", Object.prototype.toString.call(mc));

// 对比默认行为
class PlainClass {}
console.log("Object.prototype.toString.call(new PlainClass()):", Object.prototype.toString.call(new PlainClass()));

// ---- 9. symbol 作为 brand type ----
console.log("\\n---- 9. symbol 作为 brand type ----");

// 用 unique symbol 做品牌，比 string 品牌更安全
declare const userIdBrand: unique symbol;
declare const orderIdBrand: unique symbol;

type UserId = number & { readonly [userIdBrand]: true };
type OrderId = number & { readonly [orderIdBrand]: true };

// 工厂函数：创建品牌类型
function createUserId(n: number): UserId {
  return n as UserId;
}
function createOrderId(n: number): OrderId {
  return n as OrderId;
}

function getUser(id: UserId): string {
  return "查询用户 #" + id;
}
function getOrder(id: OrderId): string {
  return "查询订单 #" + id;
}

const uid = createUserId(1001);
const oid = createOrderId(2001);

console.log("getUser(uid):", getUser(uid));
console.log("getOrder(oid):", getOrder(oid));

// ❌ 编译错误：UserId 不能赋给 OrderId
// getUser(oid);  // 编译期报错
// getOrder(uid); // 编译期报错
console.log("（编译期：getUser(oid) 和 getOrder(uid) 会报错，品牌类型防止混淆）");

// symbol 品牌的运行时表现：品牌属性不存在
console.log("uid 运行时:", uid, "← 仍是普通 number");
console.log("typeof uid:", typeof uid);

// ---- 10. Symbol.isConcatSpreadable ----
console.log("\\n---- 10. Symbol.isConcatSpreadable ----");

// 默认数组 concat 会展开数组
const arr1 = [1, 2];
const arr2 = [3, 4];
console.log("[1,2].concat([3,4]):", arr1.concat(arr2));

// 用 Symbol.isConcatSpreadable 阻止展开
const obj3 = {
  length: 2,
  0: "a",
  1: "b",
  [Symbol.isConcatSpreadable]: true,
};
console.log("[1].concat(类数组,展开):", [1].concat(obj3 as any));

const obj4 = {
  length: 2,
  0: "x",
  1: "y",
  [Symbol.isConcatSpreadable]: false,
};
console.log("[1].concat(类数组,不展开):", [1].concat(obj4 as any));

// ---- 11. 综合应用：用 symbol 实现私有字段 ----
console.log("\\n---- 11. 综合应用：symbol 私有字段 ----");

// 用 symbol 模拟私有字段（在 #private 语法出现前的常用模式）
const privateFields = {
  _data: Symbol("_data"),
  _count: Symbol("_count"),
};

class Counter {
  [privateFields._data]: number[] = [];
  [privateFields._count]: number = 0;

  add(n: number): void {
    this[privateFields._data].push(n);
    this[privateFields._count]++;
  }

  get count(): number {
    return this[privateFields._count];
  }

  get data(): number[] {
    return [...this[privateFields._data]];
  }

  // 用 Symbol.iterator 让 Counter 可迭代
  [Symbol.iterator](): Iterator<number> {
    let i = 0;
    const data = this[privateFields._data];
    return {
      next(): IteratorResult<number> {
        if (i < data.length) {
          return { value: data[i++], done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

const counter = new Counter();
counter.add(10);
counter.add(20);
counter.add(30);

console.log("counter.count:", counter.count);
console.log("counter.data:", counter.data);
console.log("用 for...of 遍历 counter:");
for (const n of counter) {
  console.log("  ", n);
}

// symbol 字段不出现在 keys 里
console.log("Object.keys(counter):", Object.keys(counter), "← symbol 字段隐藏");
console.log("Object.getOwnPropertySymbols(counter):",
  Object.getOwnPropertySymbols(counter).map(s => s.toString()));

// JSON.stringify 忽略 symbol 键
console.log("JSON.stringify(counter):", JSON.stringify({ count: counter.count, data: counter.data }));

console.log("\\nsymbol 与 unique symbol 深入章节演示完成！");`,
  },

  // =========================================================
  // 第三章：索引签名、Record 与映射类型对比
  // =========================================================
  {
    id: "ts-index-signature-deep",
    title: "索引签名、Record 与映射类型对比",
    icon: "📇",
    group: "进阶类型深入",
    content: `## 索引签名、Record 与映射类型对比 (Index Signatures vs Record vs Mapped Types)

在 TypeScript 中表示"键值对集合"有三种主要方式：**索引签名**（\`[key: string]: T\`）、**Record 工具类型**（\`Record<K, V>\`）、**映射类型**（\`{ [K in Union]: T }\`）。它们看起来相似，实际语义、精确度、灵活性差异很大。选错工具会导致类型不安全或代码冗长。

本章将极其详细地讲解这三者的语法、本质区别、常见陷阱（number 键 toString、原型链泄漏、修饰符冲突）、何时用哪个，以及对比表与最佳实践。

### 1. 索引签名 \`[key: string]: T\`

#### 语义

索引签名表示"任意 \`string\`（或 \`number\`）键，值都是 \`T\`"——键是**开放的、无限的**：

\`\`\`ts
interface StringMap {
  [key: string]: number;
}

const m: StringMap = { a: 1, b: 2, hello: 99 };
const m2: StringMap = { x: 1, y: 2, z: 3, foo: 4 };
\`\`\`

\`StringMap\` 接受任意 string 键，值必须是 number。键集合没有限制。

#### 与显式属性共存

索引签名可以和显式属性共存，但**显式属性的值类型必须能赋给索引签名的值类型**：

\`\`\`ts
interface Person {
  name: string;        // 显式属性
  age: number;         // 显式属性
  [key: string]: string | number; // 索引签名：所有值是 string|number
}
// ✅ name 和 age 的类型都是 string|number 的子类型
\`\`\`

\`\`\`ts
interface Bad {
  name: string;
  [key: string]: number; // ❌ 错误：name 是 string，不能赋给 number 索引
}
\`\`\`

这个限制是为了保证"任何键查询都返回兼容的类型"——因为你不知道运行时会有什么键，索引签名承诺所有值都是 \`number\`，但 \`name\` 是 \`string\`，矛盾。

### 2. 陷阱 1：number 键被 toString 转换

JavaScript 对象的键只能是 \`string\` 或 \`symbol\`——数字键会被自动转为字符串：

\`\`\`ts
const obj = {};
obj[1] = "a";
console.log(Object.keys(obj)); // ["1"] —— 数字 1 变成字符串 "1"
console.log(obj["1"]);         // "a"
\`\`\`

TypeScript 的索引签名对此的处理：

\`\`\`ts
interface NumMap {
  [key: number]: string;
}
const m: NumMap = {};
m[1] = "a";
// m["1"] 也被允许，因为运行时 "1" 和 1 是同一个键
\`\`\`

\`\`\`ts
interface StringMap {
  [key: string]: number;
}
const m: StringMap = {};
m[1] = 1; // ✅ 数字键被接受（因为会 toString）
\`\`\`

\`keyof\` 一个有索引签名的类型：

\`\`\`ts
type K1 = keyof { [key: string]: number }; // string | number
type K2 = keyof { [key: number]: string }; // number
\`\`\`

\`keyof { [key: string]: number }\` 是 \`string | number\`——因为数字键会被转为 string，所以 number 也能用作键查询。

### 3. 陷阱 2：原型链属性泄漏

索引签名让"任何键都返回 T"，但对象原型链上的属性也会被查询，可能导致意外：

\`\`\`ts
interface Dict { [key: string]: number; }
const d: Dict = { a: 1 };
console.log(d.toString); // function —— 原型链上的方法，不是 number！
console.log(d.hasOwnProperty); // function
\`\`\`

\`d.toString\` 在运行时是函数（来自 Object.prototype），但 TypeScript 根据索引签名认为它是 \`number\`——这是**类型谎言**。实际访问 \`toString\` 等内置属性时，运行时返回的不是 \`number\`。

这就是为什么用 \`Object.create(null)\` 创建"纯净字典"——它没有原型链，不会有这个问题：

\`\`\`ts
const pure = Object.create(null) as Dict;
pure.a = 1;
// pure.toString 是 undefined，不是函数
\`\`\`

### 4. 陷阱 3：索引签名与显式属性冲突

如前所述，显式属性的类型必须兼容索引签名：

\`\`\`ts
interface Good {
  [key: string]: string | number | boolean;
  name: string;       // ✅ string 是 string|number|boolean 的子类型
  age: number;        // ✅
  active: boolean;    // ✅
}

interface Bad {
  [key: string]: string;
  count: number;      // ❌ number 不是 string 的子类型
}
\`\`\`

这个限制有时很烦人——比如想"大部分键是 string，但 count 是 number"，索引签名就难表达。解决方法是用联合类型做值类型，或用 Record。

### 5. Record<K, V> 的本质

\`Record<K, V>\` 是 TypeScript 的内置工具类型，它的定义是：

\`\`\`ts
type Record<K extends keyof any, V> = {
  [P in K]: V;
};
\`\`\`

所以 \`Record<K, V>\` 本质是**映射类型的语法糖**——\`K\` 是键的联合，\`V\` 是值类型。

#### Record 能限制键集合

\`\`\`ts
type ABC = Record<"a" | "b" | "c", number>;
// 等价于 { a: number; b: number; c: number; }

const m: ABC = { a: 1, b: 2, c: 3 }; // ✅
// const m2: ABC = { a: 1, b: 2 }; // ❌ 缺 c
// const m3: ABC = { a: 1, b: 2, c: 3, d: 4 }; // ❌ 多 d
\`\`\`

这是 Record 相对索引签名的最大优势——**能精确限制键集合**。索引签名是开放的（任意键），Record 是封闭的（必须是 K 中的键）。

#### Record 与索引签名对比

\`\`\`ts
// 索引签名：任意 string 键
type Open = { [key: string]: number };
const o: Open = { a: 1, b: 2, anything: 99 }; // ✅ 任意键

// Record：固定键集合
type Closed = Record<"a" | "b", number>;
const c: Closed = { a: 1, b: 2 }; // ✅
// const c2: Closed = { a: 1, b: 2, c: 3 }; // ❌ 多了 c
\`\`\`

| 维度 | 索引签名 \`{ [key: string]: T }\` | \`Record<K, V>\` |
| --- | --- | --- |
| 键集合 | 开放（任意 string/number） | 封闭（必须是 K） |
| 缺键检查 | 无 | 有（必须包含所有 K） |
| 多键检查 | 无 | 有（不能有 K 外的键） |
| 精确度 | 低 | 高 |
| 适用场景 | 字典、缓存、动态键 | 配置、固定结构 |

### 6. 只读索引签名

\`\`\`ts
interface ReadonlyMap {
  readonly [key: string]: number;
}

const m: ReadonlyMap = { a: 1 };
// m.a = 2; // ❌ 只读
\`\`\`

\`readonly\` 修饰符可以加在索引签名前，让所有键值只读。

\`Readonly<Record<K, V>>\` 或 \`Record<K, Readonly<...>>\` 也能做只读，但语义略不同。

### 7. keyof 索引签名

\`\`\`ts
type K1 = keyof { [key: string]: number };  // string | number
type K2 = keyof { [key: number]: string };  // number
type K3 = keyof Record<"a" | "b", number>;  // "a" | "b"
\`\`\`

- 索引签名的 \`keyof\` 是 \`string | number\`（因为 number 会被 toString）。
- Record 的 \`keyof\` 是 \`K\`（精确的键联合）。

### 8. Record 与映射类型的等价与差异

\`Record<K, V>\` 就是映射类型 \`{ [P in K]: V }\` 的语法糖。但映射类型能做更多：

#### 映射类型能基于已有类型转换

\`\`\`ts
type Stringify<T> = { [K in keyof T]: string };
// 把 T 的所有属性值变成 string
\`\`\`

Record 做不到——Record 的值类型是固定的，不能根据原类型变化。

#### 映射类型能保留修饰符（同态）

\`\`\`ts
interface Original { readonly id: number; name?: string; }
type Homomorphic = { [K in keyof Original]: Original[K] };
// 保留 readonly 和 ?：{ readonly id: number; name?: string; }
\`\`\`

Record 不保留修饰符。

#### 映射类型能用 as 重映射键

\`\`\`ts
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
// { getName: () => string; ... }
\`\`\`

Record 做不到键重映射。

#### 映射类型能修改修饰符

\`\`\`ts
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
\`\`\`

Record 不行。

### 9. 对比表：索引签名 / Record / 映射类型

| 特性 | 索引签名 | Record | 映射类型 |
| --- | --- | --- | --- |
| 语法 | \`{ [key: string]: T }\` | \`Record<K, V>\` | \`{ [K in Union]: T }\` |
| 键集合 | 开放 | 封闭（K） | 封闭（Union） |
| 值类型 | 固定 T | 固定 V | 可变（基于 T） |
| 修饰符保留 | N/A | 不保留 | 同态时保留 |
| 键重映射 | 不支持 | 不支持 | 支持（as） |
| 修饰符修改 | 不支持 | 不支持 | 支持（+/-） |
| 缺键检查 | 无 | 有 | 有 |
| 典型场景 | 字典、缓存 | 配置、固定结构 | 工具类型、转换 |

### 10. 常见陷阱

#### 陷阱 1：用索引签名表示"固定结构"

\`\`\`ts
// ❌ 反模式：用索引签名表示固定配置
interface Config { [key: string]: string; }
const cfg: Config = { host: "localhost", port: "3000" };
// port 是 string，不是 number！而且 cfg.anyKey 也"合法"
\`\`\`

应该用 Record 或显式接口：

\`\`\`ts
type Config = Record<"host" | "port", string>;
// 或
interface Config { host: string; port: string; }
\`\`\`

#### 陷阱 2：忘记 number 键的 toString

\`\`\`ts
const m: { [key: number]: string } = {};
m[1] = "a";
console.log(m["1"]); // "a" —— 运行时是同一个键
\`\`\`

#### 陷阱 3：原型链属性类型谎言

如前所述，\`d.toString\` 在索引签名下被认为是 \`number\`，但运行时是函数。访问时用 \`Object.create(null)\` 或显式判断。

#### 陷阱 4：Record 的键不能是任意 string

\`\`\`ts
type T = Record<string, number>; // ✅ 等价于索引签名
type T2 = Record<"a" | "b", number>; // ✅ 固定键
// Record<string, number> 失去了"固定键"的优势
\`\`\`

\`Record<string, V>\` 等价于索引签名 \`{ [key: string]: V }\`——键集合是 \`string\`，开放的。只有用字面量联合做 K 时，Record 才有"封闭键"的优势。

### 11. 最佳实践

1. **固定结构用 Record 或显式接口**：不要用索引签名表示配置等固定结构。
2. **动态键字典用索引签名**：缓存、计数器等键不确定的场景用索引签名。
3. **需要键检查用 Record<字面量联合, V>**：编译期保证键完整。
4. **需要基于原类型转换用映射类型**：如 Partial、Readonly、Pick。
5. **小心原型链**：用 \`Object.create(null)\` 创建纯净字典。
6. **小心 number 键**：记住 number 会被 toString。

### 本章小结

索引签名、Record、映射类型都能表示键值对集合，但适用场景不同：索引签名适合动态键字典（开放），Record 适合固定结构（封闭键），映射类型适合基于原类型转换（灵活）。理解三者区别能让你选对工具，写出更类型安全的代码。下面代码演示这些概念和陷阱。`,
    code: `// ============================================================
// 索引签名、Record 与映射类型对比 —— 代码演示
// ============================================================

console.log("========== 索引签名、Record 与映射类型对比 ==========");

// ---- 1. 索引签名基础 ----
console.log("\\n---- 1. 索引签名基础 ----");

// 索引签名：任意 string 键，值都是 number
interface StringNumberMap {
  [key: string]: number;
}

const snm: StringNumberMap = { a: 1, b: 2, hello: 99 };
console.log("StringNumberMap:", JSON.stringify(snm));

// 索引签名是开放的：可以加任意键
snm.anyKey = 42;
console.log("加任意键后:", JSON.stringify(snm));

// 与显式属性共存
interface Person {
  name: string;
  age: number;
  [key: string]: string | number; // 索引签名
}

const p: Person = { name: "张三", age: 30, extra: "hello", num: 42 };
console.log("Person with index signature:", JSON.stringify(p));

// ---- 2. 陷阱1：number 键被 toString ----
console.log("\\n---- 2. 陷阱1：number 键 toString ----");

// JavaScript 对象键只能是 string 或 symbol，数字会被 toString
const obj: { [key: number]: string } = {};
obj[1] = "一";
obj[2] = "二";

console.log("obj[1]:", obj[1]);
console.log("obj['1']:", (obj as any)["1"], "← 数字键 1 和字符串键 '1' 是同一个");
console.log("Object.keys(obj):", Object.keys(obj), "← 键被 toString");

// keyof 索引签名
type KeyOfString = keyof { [key: string]: number }; // string | number
type KeyOfNumber = keyof { [key: number]: string }; // number
const k1: KeyOfString = "a";
const k2: KeyOfString = 1; // ✅ number 也是 keyof string 索引
const k3: KeyOfNumber = 1;
console.log("keyof {[key:string]:number} 接受 'a' 和 1:", k1, k2);
console.log("keyof {[key:number]:string} 接受 1:", k3);

// 实战陷阱：用数字索引查询
interface NumKeyed {
  [key: number]: string;
}
const nk: NumKeyed = { 1: "a", 2: "b" };
console.log("nk[1]:", nk[1]);
// nk["1"] 也能访问，但类型层面不直接允许
console.log("(nk as any)['1']:", (nk as any)["1"]);

// ---- 3. 陷阱2：原型链属性泄漏 ----
console.log("\\n---- 3. 陷阱2：原型链属性泄漏 ----");

interface Dict {
  [key: string]: number;
}

const d: Dict = { a: 1, b: 2 };
console.log("d.a:", d.a);
console.log("d.b:", d.b);

// 原型链上的属性类型谎言
// d.toString 在类型层面是 number，但运行时是 function
console.log("typeof d.toString:", typeof d.toString, "← 实际是 function，不是 number！");
console.log("typeof d.hasOwnProperty:", typeof d.hasOwnProperty);

// 用 Object.create(null) 创建纯净字典
const pure = Object.create(null) as Dict;
pure.a = 1;
pure.b = 2;
console.log("pure.toString:", pure.toString, "← undefined（无原型链）");
console.log("pure.a:", pure.a);

// ---- 4. 陷阱3：索引签名与显式属性冲突 ----
console.log("\\n---- 4. 陷阱3：显式属性冲突 ----");

// 显式属性必须兼容索引签名的值类型
interface Good {
  name: string;
  age: number;
  [key: string]: string | number; // ✅ name 和 age 都兼容
}
const g: Good = { name: "张三", age: 30, extra: "hello" };
console.log("Good interface:", JSON.stringify(g));

// 以下代码会编译错误（注释掉，仅说明）：
// interface Bad {
//   name: string;
//   [key: string]: number; // ❌ name 是 string，不能赋给 number 索引
// }
console.log("（编译期：name: string 与 [key: string]: number 冲突会报错）");

// ---- 5. Record 限制键集合 ----
console.log("\\n---- 5. Record 限制键集合 ----");

// Record<"a"|"b"|"c", number>：固定键集合
type ABC = Record<"a" | "b" | "c", number>;
const abc: ABC = { a: 1, b: 2, c: 3 }; // ✅
console.log("ABC:", JSON.stringify(abc));

// 缺键检查
// const abcBad1: ABC = { a: 1, b: 2 }; // ❌ 缺 c
console.log("（编译期：{ a: 1, b: 2 } 缺 c 会报错）");

// 多键检查
// const abcBad2: ABC = { a: 1, b: 2, c: 3, d: 4 }; // ❌ 多 d
console.log("（编译期：{ a:1, b:2, c:3, d:4 } 多 d 会报错）");

// Record 与索引签名对比
type OpenMap = { [key: string]: number }; // 开放
const om: OpenMap = { a: 1, b: 2, anything: 99 }; // ✅ 任意键
console.log("OpenMap (索引签名):", JSON.stringify(om), "← 任意键都合法");

type ClosedMap = Record<"a" | "b", number>; // 封闭
const cm: ClosedMap = { a: 1, b: 2 }; // ✅
// const cmBad: ClosedMap = { a: 1, b: 2, c: 3 }; // ❌ 多 c
console.log("ClosedMap (Record):", JSON.stringify(cm), "← 只能是 a 和 b");

// ---- 6. Record<string, V> 等价于索引签名 ----
console.log("\\n---- 6. Record<string, V> 等价于索引签名 ----");

type RecordStringNum = Record<string, number>;
const rsn: RecordStringNum = { a: 1, b: 2, anyKey: 99 }; // ✅ 任意键
console.log("Record<string, number>:", JSON.stringify(rsn), "← 等价于索引签名，键开放");

// 只有字面量联合做 K 时，Record 才有"封闭键"优势
type FixedKeys = Record<"host" | "port" | "db", string>;
const fk: FixedKeys = { host: "localhost", port: "3000", db: "test" };
console.log("FixedKeys:", JSON.stringify(fk));
// const fkBad: FixedKeys = { host: "x", port: "y" }; // ❌ 缺 db

// ---- 7. 只读索引签名 ----
console.log("\\n---- 7. 只读索引签名 ----");

interface ReadonlyMap {
  readonly [key: string]: number;
}

const rm: ReadonlyMap = { a: 1, b: 2 };
console.log("ReadonlyMap:", JSON.stringify(rm));
// rm.a = 10; // ❌ 编译错误：只读
console.log("（编译期：rm.a = 10 会报错，只读）");

// Readonly<Record<K, V>>
type ReadonlyRecord = Readonly<Record<"a" | "b", number>>;
const rr: ReadonlyRecord = { a: 1, b: 2 };
// rr.a = 10; // ❌ 编译错误
console.log("Readonly<Record>:", JSON.stringify(rr));

// 运行时模拟只读：Object.freeze
const frozen = Object.freeze({ a: 1, b: 2 });
console.log("Object.isFrozen(frozen):", Object.isFrozen(frozen));
try {
  frozen.a = 10; // 严格模式下抛错，非严格模式静默失败
} catch (e: any) {
  console.log("修改 frozen 抛错:", e.message);
}
console.log("frozen.a 仍是:", frozen.a);

// ---- 8. keyof 索引签名 vs keyof Record ----
console.log("\\n---- 8. keyof 对比 ----");

type K1 = keyof { [key: string]: number };   // string | number
type K2 = keyof Record<"a" | "b", number>;   // "a" | "b"
type K3 = keyof Record<string, number>;      // string | number（等价索引签名）

const k1v: K1 = "x";
const k1v2: K1 = 1;
console.log("keyof {[key:string]:number}: 接受 'x' 和 1:", k1v, k1v2);

const k2v: K2 = "a";
// const k2v2: K2 = "c"; // ❌ 只能是 "a" | "b"
console.log("keyof Record<'a'|'b', number>: 只接受 'a' 或 'b':", k2v);

// ---- 9. 映射类型的额外能力 ----
console.log("\\n---- 9. 映射类型的额外能力 ----");

// 映射类型能基于原类型转换
type Stringify<T> = { [K in keyof T]: string };

interface User {
  id: number;
  name: string;
  active: boolean;
}
type StringUser = Stringify<User>;
// 等价于 { id: string; name: string; active: string; }
const su: StringUser = { id: "1", name: "张三", active: "true" };
console.log("Stringify<User>:", JSON.stringify(su));

// 映射类型能保留修饰符（同态）
interface Original {
  readonly id: number;
  name?: string;
}
type Homomorphic = { [K in keyof Original]: Original[K] };
// 保留 readonly 和 ?
const h: Homomorphic = { id: 1 }; // ✅ name 可选
console.log("同态映射保留修饰符:", JSON.stringify(h));

// 映射类型能修改修饰符
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };

interface Point { x: number; y: number; }
const rp: MyReadonly<Point> = { x: 1, y: 2 };
// rp.x = 10; // ❌ readonly
console.log("MyReadonly<Point>:", JSON.stringify(rp));

const pp: MyPartial<Point> = { x: 1 }; // ✅ y 可选
console.log("MyPartial<Point>:", JSON.stringify(pp));

// 映射类型能用 as 重映射键
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; getActive: () => boolean; }
const ug: UserGetters = {
  getId: function () { return 1; },
  getName: function () { return "张三"; },
  getActive: function () { return true; },
};
console.log("Getters<User>:", ug.getId(), ug.getName(), ug.getActive());

// Record 做不到这些
console.log("（Record 做不到：基于原类型转换、保留修饰符、键重映射）");

// ---- 10. 实战：选对工具 ----
console.log("\\n---- 10. 实战：选对工具 ----");

// 场景1：缓存（动态键）→ 用索引签名
interface Cache {
  [key: string]: unknown;
}
const cache: Cache = {};
cache["user:1"] = { name: "张三" };
cache["user:2"] = { name: "李四" };
cache["temp:xyz"] = "临时数据";
console.log("Cache (索引签名):", JSON.stringify(cache));

// 场景2：配置（固定结构）→ 用 Record
type DbConfig = Record<"host" | "port" | "user" | "password", string>;
const dbConfig: DbConfig = {
  host: "localhost",
  port: "3306",
  user: "root",
  password: "secret",
};
console.log("DbConfig (Record):", JSON.stringify(dbConfig));

// 场景3：基于原类型转换 → 用映射类型
type UserOptional = MyPartial<User>;
const partialUser: UserOptional = { name: "王五" }; // ✅ 所有字段可选
console.log("MyPartial<User>:", JSON.stringify(partialUser));

// 场景4：HTTP 状态码映射 → 用 Record
type HttpStatus = Record<200 | 404 | 500, string>;
const statusMessages: HttpStatus = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
};
console.log("HttpStatus (Record):", JSON.stringify(statusMessages));

// 场景5：事件计数器（动态键）→ 用索引签名
interface EventCounter {
  [eventName: string]: number;
}
const counter: EventCounter = {};
function recordEvent(name: string): void {
  counter[name] = (counter[name] || 0) + 1;
}
recordEvent("click");
recordEvent("click");
recordEvent("scroll");
recordEvent("click");
console.log("EventCounter:", JSON.stringify(counter));

// ---- 11. 综合对比演示 ----
console.log("\\n---- 11. 综合对比演示 ----");

// 同一个"用户映射"需求，三种实现

// 实现1：索引签名（开放，不安全）
interface UserMap1 {
  [key: string]: { id: number; name: string };
}
const um1: UserMap1 = {
  alice: { id: 1, name: "Alice" },
  bob: { id: 2, name: "Bob" },
  anything: { id: 99, name: "X" }, // ✅ 任意键都合法
};
console.log("索引签名实现（开放）:", Object.keys(um1));

// 实现2：Record（封闭，安全）
type UserMap2 = Record<"alice" | "bob", { id: number; name: string }>;
const um2: UserMap2 = {
  alice: { id: 1, name: "Alice" },
  bob: { id: 2, name: "Bob" },
  // anything: { id: 99, name: "X" }, // ❌ 多键
};
console.log("Record 实现（封闭）:", Object.keys(um2));

// 实现3：映射类型（基于原类型）
interface UserSource {
  alice: { id: number; name: string };
  bob: { id: number; name: string };
}
type UserMap3 = { [K in keyof UserSource]: UserSource[K] };
const um3: UserMap3 = {
  alice: { id: 1, name: "Alice" },
  bob: { id: 2, name: "Bob" },
};
console.log("映射类型实现:", Object.keys(um3));

// 三者的 keyof 对比
type K_Idx = keyof UserMap1; // string | number
type K_Rec = keyof UserMap2; // "alice" | "bob"
type K_Map = keyof UserMap3; // "alice" | "bob"
const testK_Idx: K_Idx = "anything"; // ✅ 任意 string
const testK_Rec: K_Rec = "alice";    // ✅ 只能是 alice 或 bob
console.log("keyof 对比 - 索引签名接受任意 string:", testK_Idx);
console.log("keyof 对比 - Record 只接受 'alice'|'bob':", testK_Rec);

console.log("\\n索引签名、Record 与映射类型对比章节演示完成！");`,
  },

  // =========================================================
  // 第四章：函数重载深入
  // =========================================================
  {
    id: "ts-overloading-deep",
    title: "函数重载深入",
    icon: "📚",
    group: "核心补充",
    content: `## 函数重载深入 (Function Overloading Deep Dive)

函数重载（Function Overloading）是 TypeScript 让一个函数有多种调用签名的能力。同一个函数名，根据传入参数的数量或类型不同，返回不同类型的结果。这在 JavaScript 库设计中极其常见——\`document.createElement\`、\`fetch\`、\`Object.assign\`、\`jQuery\` 都用重载表达"不同输入不同输出"的语义。

本章将极其详细地讲解重载签名与实现签名、重载与联合类型的取舍、重载在库设计中的应用、重载与泛型结合、陷阱（Parameters/ReturnType 只取最后签名）、实现守则、用条件类型替代部分重载、重载顺序、方法重载 vs 函数重载，以及最佳实践。

### 1. 重载签名 vs 实现签名

#### 基础语法

TypeScript 的函数重载由**多个重载签名**（overload signatures）和一个**实现签名**（implementation signature）组成：

\`\`\`ts
// 重载签名：对外可见的调用方式
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;
// 实现签名：内部实现，对外不可见
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month - 1, day);
  }
  return new Date(yearOrTimestamp);
}

makeDate(1234567890);      // ✅ 用第一个签名
makeDate(2024, 6, 15);     // ✅ 用第二个签名
// makeDate(2024, 6);       // ❌ 没有匹配的重载签名
\`\`\`

关键点：
- **重载签名**：声明函数的"对外接口"，调用方只能用这些签名。可以有多个。
- **实现签名**：真正的实现，**对外不可见**——调用方不能直接用实现签名的参数组合。
- 实现签名必须**兼容所有重载签名**（能处理所有重载的情况）。

#### 实现签名对外不可见

\`\`\`ts
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number { // 实现签名
  return x;
}

f("a");   // ✅ string → string
f(1);     // ✅ number → number
// f(true); // ❌ 没有重载签名接受 boolean，即使实现签名可能接受
\`\`\`

实现签名 \`f(x: string | number)\` 对外不可见，调用方只能用 \`f("a")\` 或 \`f(1)\`，不能用 \`f(true)\`。

### 2. 重载与联合类型的取舍

#### 联合类型的问题

不用重载，用联合类型会怎样？

\`\`\`ts
function f(x: string | number): string | number {
  return x;
}

const r = f("a"); // r 的类型是 string | number，不是 string！
// r.toUpperCase(); // ❌ 类型是 string | number，不能用 string 方法
\`\`\`

\`f("a")\` 返回 \`string | number\`，即使传入的是 \`string\`——因为联合类型丢失了"输入与输出的对应关系"。

#### 重载解决精确返回类型

\`\`\`ts
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number {
  return x;
}

const r1 = f("a"); // r1 类型是 string ✅
r1.toUpperCase();  // ✅
const r2 = f(1);   // r2 类型是 number ✅
r2.toFixed(2);     // ✅
\`\`\`

重载让"输入 string → 输出 string，输入 number → 输出 number"的对应关系在类型层面保留。

#### 取舍表

| 维度 | 联合类型 | 重载 |
| --- | --- | --- |
| 返回类型精确度 | 低（联合） | 高（按输入分支） |
| 实现复杂度 | 低 | 中 |
| 调用方类型推断 | 一般 | 精确 |
| 适用场景 | 简单场景 | 需要精确返回 |

### 3. 重载在库设计中的应用

#### createElement 风格

\`\`\`ts
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag) as HTMLElement;
}

const div = createElement("div"); // HTMLDivElement
const span = createElement("span"); // HTMLSpanElement
\`\`\`

不同标签返回不同元素类型——这是 React/DOM 库的常见模式。

#### Object.assign 的重载

\`\`\`ts
interface ObjectConstructor {
  assign<T, U>(target: T, source: U): T & U;
  assign<T, U, V>(target: T, source: U, source: V): T & U & V;
  assign<T, U, V, W>(target: T, source: U, source: V, source: W): T & U & V & W;
  assign(target: object, ...sources: any[]): any;
}
\`\`\`

不同参数数量，返回不同交叉类型。

#### fetch 的重载

\`\`\`ts
function fetch(input: string, init?: RequestInit): Promise<Response>;
function fetch(input: URL, init?: RequestInit): Promise<Response>;
function fetch(input: Request, init?: RequestInit): Promise<Response>;
\`\`\`

不同输入类型（string、URL、Request），统一返回 Promise<Response>。

### 4. 重载与泛型结合

\`\`\`ts
function first<T>(arr: T[]): T;
function first<T>(arr: readonly T[]): T;
function first<T>(arr: readonly T[]): T {
  return arr[0];
}

const a = first([1, 2, 3]);     // number
const b = first(["a", "b"]);    // string
\`\`\`

重载与泛型结合让"不同输入精确推断泛型"成为可能。

#### 泛型 + 字面量类型

\`\`\`ts
function prop<T, K extends keyof T>(obj: T, key: K): T[K];
function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const v = prop({ a: 1, b: "x" }, "a"); // v: number
const w = prop({ a: 1, b: "x" }, "b"); // w: string
\`\`\`

### 5. 陷阱：Parameters/ReturnType 只取最后签名

这是重载最隐蔽的陷阱：

\`\`\`ts
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number {
  return x;
}

type P = Parameters<typeof f>; // [string | number] —— 只取实现签名！
type R = ReturnType<typeof f>; // string | number —— 只取实现签名！
\`\`\`

\`Parameters\` 和 \`ReturnType\` 对重载函数**只取最后一个签名（实现签名）**，不会取重载签名。这导致提取的类型与实际调用不匹配。

#### 解决方法

用 \`OverloadParameters\` / \`OverloadReturnType\` 工具类型（需自己实现，较复杂）：

\`\`\`ts
type OverloadReturnType<T> =
  T extends {
    (...a: infer A1): infer R1;
    (...a: infer A2): infer R2;
    (...a: infer A3): infer R3;
    (...a: any): any;
  } ? R1 | R2 | R3 :
  T extends {
    (...a: infer A1): infer R1;
    (...a: infer A2): infer R2;
    (...a: any): any;
  } ? R1 | R2 :
  T extends (...a: infer A) => infer R ? R : never;
\`\`\`

但这种实现有限制——重载数量固定，且实现签名必须显式列出。更实际的做法是避免在重载函数上用 Parameters/ReturnType，或用具体的重载签名类型。

### 6. 实现守则：实现签名要兼容所有重载

实现签名必须能处理所有重载签名的情况：

\`\`\`ts
// ✅ 正确：实现签名参数兼容所有重载
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number { // 兼容 string 和 number
  return x;
}

// ❌ 错误：实现签名不兼容
function g(x: string): string;
function g(x: number): number;
function g(x: boolean): boolean { // ❌ 不兼容 string 和 number
  return x;
}
\`\`\`

实现签名的参数必须是所有重载参数的**超集**（联合），返回必须是所有重载返回的**超集**。

### 7. 用条件类型替代部分重载

有些重载场景可以用条件类型替代，更简洁：

\`\`\`ts
// 重载版本
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number { return x; }

// 条件类型版本
function f<T extends string | number>(x: T): T extends string ? string : number {
  return x as any;
}

const a = f("a"); // string
const b = f(1);   // number
\`\`\`

条件类型版本只需一个签名，类型推断也能得到精确返回。但条件类型的可读性较差，且复杂场景下可能不如重载直观。

#### 取舍

- **重载**：直观、可读性好、IDE 提示清晰，但代码冗长。
- **条件类型**：简洁、可扩展，但可读性差、调试难。

### 8. 重载顺序：更具体的签名放前面

TypeScript 按顺序匹配重载签名，**第一个匹配的签名胜出**。所以更具体的签名要放前面：

\`\`\`ts
// ✅ 正确顺序：具体在前
function f(x: "a"): "A";
function f(x: string): string;
function f(x: string): string {
  return x === "a" ? "A" : x;
}

// ❌ 错误顺序：宽泛在前，具体永不被匹配
function g(x: string): string;
function g(x: "a"): "A"; // 永远不会被匹配，因为 string 已经匹配
\`\`\`

### 9. 方法重载 vs 函数重载

#### 函数重载

\`\`\`ts
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number { return x; }
\`\`\`

#### 方法重载（在类或接口中）

\`\`\`ts
class Counter {
  add(x: number): number;
  add(x: number, y: number): number;
  add(x: number, y?: number): number {
    return y !== undefined ? x + y : x;
  }
}

interface EventEmitter {
  on(event: string, cb: Function): void;
  on(event: "data", cb: (data: Buffer) => void): void;
}
\`\`\`

方法重载的语法是在类/接口里写多个同名方法签名，然后一个实现签名。

#### 区别

| 维度 | 函数重载 | 方法重载 |
| --- | --- | --- |
| 语法 | function 多签名 + 实现 | 类/接口里多签名 + 实现 |
| 类型声明 | function 关键字 | 方法简写或 interface |
| 适用 | 独立函数 | 类方法、对象方法 |

### 10. 常见陷阱

1. **实现签名对外可见的误解**：调用方不能用实现签名的参数组合，只能用重载签名。
2. **Parameters/ReturnType 只取实现签名**：提取重载函数的参数/返回类型要小心。
3. **重载顺序错误**：宽泛签名放前面会让具体签名永不匹配。
4. **实现签名不兼容**：实现签名必须能处理所有重载。
5. **过度重载**：能用条件类型或联合类型解决的，不必堆重载。
6. **重载签名与实现签名不一致**：实现返回的类型必须能赋给重载声明的返回类型。

### 11. 最佳实践

1. **优先用联合类型/泛型**：能用联合或泛型解决的不上重载。
2. **需要精确返回类型时用重载**：如 createElement、不同输入不同输出。
3. **更具体的签名放前面**：避免被宽泛签名"截胡"。
4. **实现签名用最宽泛的参数**：\`any\` 或联合类型，兼容所有重载。
5. **避免在重载函数上用 Parameters/ReturnType**：除非你清楚只取实现签名。
6. **重载数量适度**：3-5 个重载为宜，太多说明设计可能有问题。
7. **方法重载在类/接口中**：用方法简写语法。

### 本章小结

函数重载让一个函数有多种调用签名，是表达"不同输入不同输出"的精确工具。重载签名对外可见，实现签名对外不可见但必须兼容所有重载。重载与联合类型、条件类型的取舍要看场景——需要精确返回类型用重载，简单场景用联合，复杂类型计算用条件类型。注意 Parameters/ReturnType 只取实现签名的陷阱。下面代码演示重载的各种用法。`,
    code: `// ============================================================
// 函数重载深入 —— 代码演示
// ============================================================

console.log("========== 函数重载深入 ==========");

// ---- 1. 基础重载：makeDate 经典例子 ----
console.log("\\n---- 1. 基础重载：makeDate ----");

// 重载签名：对外可见
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;
// 实现签名：对外不可见
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month - 1, day);
  }
  return new Date(yearOrTimestamp);
}

const d1 = makeDate(1234567890000); // 用第一个签名
const d2 = makeDate(2024, 6, 15);   // 用第二个签名
console.log("makeDate(timestamp):", d1.toISOString());
console.log("makeDate(2024,6,15):", d2.toISOString());

// makeDate(2024, 6); // ❌ 没有匹配的重载（编译期错误）
console.log("（编译期：makeDate(2024, 6) 报错，没有两参数重载）");

// ---- 2. 重载 vs 联合类型对比 ----
console.log("\\n---- 2. 重载 vs 联合类型 ----");

// 联合类型版本：返回类型是联合，丢失输入输出对应
function fUnion(x: string | number): string | number {
  return x;
}
const rUnion1 = fUnion("a");
const rUnion2 = fUnion(1);
console.log("联合类型 fUnion('a'):", rUnion1, "类型推断为 string | number");
console.log("联合类型 fUnion(1):", rUnion2, "类型推断为 string | number");

// 重载版本：返回类型精确
function fOverload(x: string): string;
function fOverload(x: number): number;
function fOverload(x: string | number): string | number {
  return x;
}
const rOverload1 = fOverload("a");
const rOverload2 = fOverload(1);
console.log("重载 fOverload('a'):", rOverload1, "类型推断为 string ✅");
console.log("重载 fOverload(1):", rOverload2, "类型推断为 number ✅");

// 重载版本可以调用 string/number 特有方法
console.log("  fOverload('a').toUpperCase():", fOverload("a").toUpperCase());
console.log("  fOverload(1).toFixed(2):", fOverload(1).toFixed(2));

// ---- 3. createElement 风格的重载 ----
console.log("\\n---- 3. createElement 风格重载 ----");

// 模拟 DOM 元素类型
interface HTMLElement { tag: string; }
interface HTMLDivElement extends HTMLElement { tag: "div"; align?: string; }
interface HTMLSpanElement extends HTMLElement { tag: "span"; }
interface HTMLInputElement extends HTMLElement { tag: "input"; type?: string; }

// 重载：不同标签返回不同元素类型
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  if (tag === "div") return { tag: "div" } as HTMLDivElement;
  if (tag === "span") return { tag: "span" } as HTMLSpanElement;
  if (tag === "input") return { tag: "input" } as HTMLInputElement;
  return { tag } as HTMLElement;
}

const div = createElement("div");   // HTMLDivElement
const span = createElement("span"); // HTMLSpanElement
const input = createElement("input"); // HTMLInputElement
const other = createElement("section"); // HTMLElement

console.log("createElement('div'):", JSON.stringify(div), "← HTMLDivElement");
console.log("createElement('span'):", JSON.stringify(span), "← HTMLSpanElement");
console.log("createElement('input'):", JSON.stringify(input), "← HTMLInputElement");
console.log("createElement('section'):", JSON.stringify(other), "← HTMLElement");

// 类型精确：div.align 可访问，div.type 不可
div.align = "center";
input.type = "text";
console.log("div.align:", div.align, "← 只在 HTMLDivElement 上有");
console.log("input.type:", input.type, "← 只在 HTMLInputElement 上有");

// ---- 4. 重载与泛型结合 ----
console.log("\\n---- 4. 重载与泛型结合 ----");

// prop：根据键返回对应值类型
function prop<T, K extends keyof T>(obj: T, key: K): T[K];
function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const userObj = { id: 1, name: "张三", active: true };
const idVal = prop(userObj, "id");     // number
const nameVal = prop(userObj, "name"); // string
const activeVal = prop(userObj, "active"); // boolean

console.log("prop(user,'id'):", idVal, "← number");
console.log("prop(user,'name'):", nameVal, "← string");
console.log("prop(user,'active'):", activeVal, "← boolean");

// first：泛型 + 重载（readonly vs mutable）
function first<T>(arr: readonly T[]): T;
function first<T>(arr: readonly T[]): T {
  return arr[0];
}

const n = first([1, 2, 3]);
const s = first(["a", "b"]);
console.log("first([1,2,3]):", n, "← number");
console.log("first(['a','b']):", s, "← string");

// ---- 5. Parameters/ReturnType 陷阱 ----
console.log("\\n---- 5. Parameters/ReturnType 陷阱 ----");

function overloadedFn(x: string): string;
function overloadedFn(x: number): number;
function overloadedFn(x: string | number): string | number {
  return x;
}

// Parameters 只取实现签名！
type P = Parameters<typeof overloadedFn>;
// P = [string | number]，不是 [string] | [number]
const testP: P = ["hello"]; // ✅ 接受 string | number
const testP2: P = [1];      // ✅ 也接受
console.log("Parameters<typeof overloadedFn>:", "接受 string 和 number");

// ReturnType 只取实现签名！
type R = ReturnType<typeof overloadedFn>;
// R = string | number，不是 string | number（恰好相等，但语义不同）
const testR: R = "hello";
const testR2: R = 42;
console.log("ReturnType<typeof overloadedFn>:", "string | number（实现签名）");

console.log("（陷阱：Parameters/ReturnType 只取实现签名，不是重载签名）");

// 自定义工具类型：提取所有重载的返回类型
type OverloadReturnTypes<T> =
  T extends {
    (...a: infer A1): infer R1;
    (...a: infer A2): infer R2;
    (...a: any): any;
  } ? R1 | R2 :
  T extends (...a: infer A) => infer R ? R : never;

type AllReturns = OverloadReturnTypes<typeof overloadedFn>;
// AllReturns = string | number
const testAll: AllReturns = "hello";
console.log("OverloadReturnTypes (自定义):", "string | number");

// ---- 6. 实现签名兼容性 ----
console.log("\\n---- 6. 实现签名兼容性 ----");

// ✅ 正确：实现签名兼容所有重载
function process(x: string): string;
function process(x: number): number;
function process(x: string | number): string | number {
  return typeof x === "string" ? x.toUpperCase() : x * 2;
}

console.log("process('hello'):", process("hello")); // HELLO
console.log("process(5):", process(5));             // 10

// 实现签名内部需要处理所有重载情况
function multiFunc(x: string, y?: number): string;
function multiFunc(x: number, y: string): number;
function multiFunc(x: string | number, y?: string | number): string | number {
  if (typeof x === "string" && (y === undefined || typeof y === "number")) {
    return x + (y !== undefined ? y : "");
  }
  if (typeof x === "number" && typeof y === "string") {
    return x + y.length;
  }
  throw new Error("Invalid arguments");
}

console.log("multiFunc('abc'):", multiFunc("abc"));
console.log("multiFunc('a', 5):", multiFunc("a", 5));
console.log("multiFunc(10, 'hello'):", multiFunc(10, "hello"));

// ---- 7. 重载顺序 ----
console.log("\\n---- 7. 重载顺序 ----");

// ✅ 正确顺序：具体在前
function classify(x: "a"): "A";
function classify(x: "b"): "B";
function classify(x: string): "OTHER";
function classify(x: string): string {
  if (x === "a") return "A";
  if (x === "b") return "B";
  return "OTHER";
}

console.log("classify('a'):", classify("a"), "← 匹配第一个签名");
console.log("classify('b'):", classify("b"), "← 匹配第二个签名");
console.log("classify('c'):", classify("c"), "← 匹配第三个签名（宽泛）");

// ---- 8. 用条件类型替代重载 ----
console.log("\\n---- 8. 条件类型替代重载 ----");

// 用条件类型实现"输入 string → string，输入 number → number"
function fCond<T extends string | number>(x: T): T extends string ? string : number {
  return x as any;
}

const cR1 = fCond("a"); // string
const cR2 = fCond(1);   // number
console.log("fCond('a'):", cR1, "← string");
console.log("fCond(1):", cR2, "← number");

// 更复杂的条件类型替代
type Result<T> = T extends string ? { type: "str"; value: T } : { type: "num"; value: T };
function wrap<T extends string | number>(x: T): Result<T> {
  return (typeof x === "string"
    ? { type: "str", value: x }
    : { type: "num", value: x }) as Result<T>;
}

const w1 = wrap("hello");
const w2 = wrap(42);
console.log("wrap('hello'):", JSON.stringify(w1), "← { type: 'str'; value: string }");
console.log("wrap(42):", JSON.stringify(w2), "← { type: 'num'; value: number }");

// ---- 9. 方法重载 ----
console.log("\\n---- 9. 方法重载 ----");

class Counter {
  private count = 0;

  // 方法重载：不同参数数量
  add(): number;
  add(n: number): number;
  add(n?: number): number {
    if (n !== undefined) {
      this.count += n;
    } else {
      this.count += 1;
    }
    return this.count;
  }

  // 方法重载：不同参数类型
  reset(to: number): void;
  reset(to: "default"): void;
  reset(to: number | "default"): void {
    this.count = to === "default" ? 0 : to;
  }
}

const cnt = new Counter();
console.log("cnt.add():", cnt.add());       // +1 → 1
console.log("cnt.add(10):", cnt.add(10));   // +10 → 11
cnt.reset("default");
console.log("cnt.reset('default') 后 cnt.add():", cnt.add()); // 1
cnt.reset(100);
console.log("cnt.reset(100) 后:", cnt.add()); // 101

// ---- 10. 接口中的方法重载 ----
console.log("\\n---- 10. 接口中的方法重载 ----");

interface TypedEventEmitter {
  on(event: "data", cb: (data: string) => void): void;
  on(event: "error", cb: (err: Error) => void): void;
  on(event: "close", cb: () => void): void;
  on(event: string, cb: Function): void;
}

class MyEmitter implements TypedEventEmitter {
  private handlers: Record<string, Function[]> = {};

  on(event: "data", cb: (data: string) => void): void;
  on(event: "error", cb: (err: Error) => void): void;
  on(event: "close", cb: () => void): void;
  on(event: string, cb: Function): void {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(cb);
  }

  emit(event: string, ...args: any[]): void {
    (this.handlers[event] || []).forEach(cb => cb(...args));
  }
}

const emitter = new MyEmitter();
emitter.on("data", function (data) {
  console.log("  收到 data:", data, "← data 已收窄为 string");
});
emitter.on("error", function (err) {
  console.log("  收到 error:", err.message, "← err 已收窄为 Error");
});
emitter.on("close", function () {
  console.log("  收到 close 事件");
});

emitter.emit("data", "hello");
emitter.emit("error", new Error("出错了"));
emitter.emit("close");

// ---- 11. Object.assign 风格的重载 ----
console.log("\\n---- 11. Object.assign 风格重载 ----");

// 模拟 Object.assign 的重载
function myAssign<T, U>(target: T, source: U): T & U;
function myAssign<T, U, V>(target: T, source: U, source2: V): T & U & V;
function myAssign<T, U, V, W>(target: T, source: U, source2: V, source3: W): T & U & V & W;
function myAssign(target: any, ...sources: any[]): any {
  return Object.assign(target, ...sources);
}

const assigned1 = myAssign({ a: 1 }, { b: 2 });
console.log("myAssign({a:1}, {b:2}):", JSON.stringify(assigned1), "← { a; b }");
const assigned2 = myAssign({ a: 1 }, { b: 2 }, { c: 3 });
console.log("myAssign({a:1},{b:2},{c:3}):", JSON.stringify(assigned2), "← { a; b; c }");
const assigned3 = myAssign({ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 });
console.log("myAssign(4个源):", JSON.stringify(assigned3), "← { a; b; c; d }");

console.log("\\n函数重载深入章节演示完成！");`,
  },

  // =========================================================
  // 第五章：运行时类型校验
  // =========================================================
  {
    id: "ts-runtime-validation",
    title: "运行时类型校验",
    icon: "🛡️",
    group: "工程化进阶",
    content: `## 运行时类型校验 (Runtime Type Validation)

TypeScript 的类型系统是**编译期**的——类型注解在转译成 JavaScript 后被完全擦除，运行时没有任何类型信息。这意味着：编译期通过类型检查，**不代表运行时数据真的符合类型**。对于来自系统外部的数据（API 响应、用户输入、localStorage、JSON.parse），类型保证是空的——必须做**运行时校验**。

本章将极其详细地讲解 TS 类型擦除的后果、外部数据为何不能信类型、运行时校验库对比（zod / yup / io-ts / ajv / class-validator）、zod 基础与 \`z.infer\`、手写类型守卫的繁琐、系统边界校验模式、性能考量，以及最佳实践。

> **注意**：本章代码 demo 运行在沙箱中，沙箱**没有安装 zod 库**，所以代码用**手写的简化校验函数**演示概念，并用注释说明 zod 的等价写法。这样代码能实际运行，概念也能讲透。

### 1. TS 类型运行时擦除的后果

#### 类型擦除示例

\`\`\`ts
interface User { id: number; name: string; }

// 转译前
function greet(user: User) {
  return "Hello, " + user.name;
}

// 转译后（类型完全消失）
function greet(user) {
  return "Hello, " + user.name;
}
\`\`\`

转译后的 JavaScript 里，\`User\` 接口、\`user: User\` 注解全部消失。运行时 \`greet\` 接收任何参数，类型检查不再起作用。

#### 后果：类型不保证运行时

\`\`\`ts
interface User { id: number; name: string; }

// 从 API 获取数据
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user/1");
  return res.json(); // ← 类型标注是 Promise<User>，但运行时返回的是什么？
}

const user = await fetchUser();
// user.name 在类型层面是 string，但运行时可能是 undefined（如果 API 返回 { id: 1 }）
console.log(user.name.toUpperCase()); // 运行时可能抛 TypeError: Cannot read property 'toUpperCase' of undefined
\`\`\`

\`fetch().json()\` 返回 \`any\`，被类型标注为 \`Promise<User>\` 后，TypeScript 信任标注，但运行时数据可能根本不是 \`User\`。这就是类型擦除的代价——**类型是"承诺"，不是"保证"**。

### 2. 外部数据为何不能信类型

以下数据来源都**不可信**：

| 数据来源 | 风险 |
| --- | --- |
| API 响应 | 后端可能改字段、返回错误格式 |
| 用户输入 | 表单、URL 参数、命令行参数 |
| localStorage | 可能被手动修改、版本过期 |
| JSON.parse | 任意 JSON，类型是 \`any\` |
| 第三方库返回 | 类型定义可能不准确 |
| 文件读取 | 配置文件可能被编辑 |

\`\`\`ts
// localStorage 读取
const saved = localStorage.getItem("user");
const user: User = JSON.parse(saved); // ← 类型是 User，但实际可能是任何东西

// JSON.parse 的类型是 any
const data = JSON.parse('{"a": 1}'); // any
data.b.toUpperCase(); // 不报错，运行时炸
\`\`\`

### 3. 运行时校验库对比

主流的运行时校验库：

| 库 | 风格 | TS 集成 | 生态 | 性能 | 学习曲线 |
| --- | --- | --- | --- | --- | --- |
| **zod** | Schema 优先 | 优秀（z.infer） | 丰富 | 中 | 低 |
| **yup** | Schema 优先 | 一般 | 表单生态 | 中 | 低 |
| **io-ts** | 函数式 | 优秀 | 一般 | 高 | 高 |
| **ajv** | JSON Schema | 一般 | JSON Schema 标准 | 极高 | 中 |
| **class-validator** | 装饰器 | 优秀 | NestJS | 中 | 低 |
| **runtypes** | Schema 优先 | 优秀 | 一般 | 中 | 低 |
| **valibot** | Schema 优先 | 优秀 | 新兴 | 高 | 低 |

#### zod 的优势

zod 是当前最流行的选择：
- **Schema 优先**：声明式定义数据结构。
- **z.infer**：从 schema 自动推导 TS 类型，避免重复定义。
- **丰富 API**：object/array/string/number/enum/union/optional/default/transform。
- **生态丰富**：与 React Hook Form、TRPC、OpenAPI 等集成。
- **错误信息友好**：详细的错误路径。

### 4. zod 基础（概念演示）

> 沙箱没有 zod，以下用注释说明 zod 写法，代码用手写校验函数模拟。

#### zod schema 定义

\`\`\`ts
import { z } from "zod"; // 沙箱没有，仅说明

// 定义 schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
  age: z.number().min(0).max(150),
  roles: z.array(z.string()),
});

// parse：校验失败抛异常
const user = UserSchema.parse(unknownData);

// safeParse：返回结果对象，不抛异常
const result = UserSchema.safeParse(unknownData);
if (result.success) {
  console.log(result.data);  // 已校验的数据
} else {
  console.log(result.error); // 错误信息
}
\`\`\`

#### 从 schema 推导类型：z.infer

\`\`\`ts
type User = z.infer<typeof UserSchema>;
// 等价于
// { id: number; name: string; email?: string; age: number; roles: string[] }
\`\`\`

\`z.infer<typeof Schema>\` 从 schema 推导 TS 类型，**避免重复定义**——schema 是单一数据源，类型自动跟随。

### 5. zod 的常用方法

\`\`\`ts
// 基础类型
z.string();
z.number();
z.boolean();
z.bigint();
z.date();

// 字面量与枚举
z.literal("hello");
z.enum(["red", "green", "blue"]);

// 复合类型
z.object({ ... });
z.array(z.string());
z.tuple([z.string(), z.number()]);

// 联合与可选
z.union([z.string(), z.number()]);
z.string().optional();   // string | undefined
z.string().nullable();   // string | null
z.string().default("x"); // 带默认值

// 转换
z.string().transform(s => s.length); // string → number

// 约束
z.string().min(3).max(20);
z.string().email();
z.number().int().positive();
z.array(z.string()).nonempty();
\`\`\`

### 6. 手写类型守卫的繁琐（对比动机）

不用 zod，手写类型守卫校验复杂对象非常繁琐：

\`\`\`ts
interface User {
  id: number;
  name: string;
  email?: string;
  age: number;
  roles: string[];
  address: {
    city: string;
    zip: string;
  };
}

function isUser(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") return false;
  if (typeof obj.name !== "string") return false;
  if (obj.email !== undefined && typeof obj.email !== "string") return false;
  if (typeof obj.age !== "number") return false;
  if (!Array.isArray(obj.roles)) return false;
  if (!obj.roles.every(r => typeof r === "string")) return false;
  if (typeof obj.address !== "object" || obj.address === null) return false;
  const addr = obj.address as Record<string, unknown>;
  if (typeof addr.city !== "string") return false;
  if (typeof addr.zip !== "string") return false;
  return true;
}
\`\`\`

这有几个问题：
1. **冗长**：每个字段都要手动检查，嵌套结构更繁琐。
2. **易错**：写漏一个检查，类型守卫就"撒谎"。
3. **维护难**：接口改了，守卫要同步改。
4. **错误信息差**：守卫只返回布尔，不知道哪里错。

zod 等库用声明式 schema 解决这些问题——一行定义，自动校验、自动推导类型、详细错误信息。

### 7. 手写简化校验函数（沙箱可用）

既然沙箱没有 zod，我们手写一个简化版校验器，演示概念：

\`\`\`ts
// 简化版 schema 类型
type Schema =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "array"; element: Schema }
  | { kind: "object"; fields: Record<string, Schema>; optionals?: string[] };

// 校验函数
function validate(data: unknown, schema: Schema): true | string {
  // 根据 schema.kind 校验 data，返回 true 或错误信息
  // ...
}
\`\`\`

这种手写校验器不如 zod 强大，但能演示核心概念。

### 8. 校验 API 响应实战

\`\`\`ts
// 模拟 zod 风格的 schema 定义
const UserSchema = {
  kind: "object",
  fields: {
    id: { kind: "number" },
    name: { kind: "string" },
    email: { kind: "string" },  // optional
  },
  optionals: ["email"],
} as const;

// 校验函数
function validateUser(data: unknown): User {
  if (!isObject(data)) throw new Error("not object");
  if (typeof data.id !== "number") throw new Error("id missing");
  if (typeof data.name !== "string") throw new Error("name missing");
  if (data.email !== undefined && typeof data.email !== "string") {
    throw new Error("email invalid");
  }
  return data as User;
}

// 从 schema 推导类型（手写模拟 z.infer）
type User = {
  id: number;
  name: string;
  email?: string;
};
\`\`\`

### 9. 系统边界校验模式

**核心原则：在系统边界校验，内部信任类型。**

\`\`\`ts
// 边界层：API 客户端
async function fetchUser(id: number): Promise<User> {
  const raw = await fetch("/api/users/" + id).then(r => r.json());
  return validateUser(raw); // 边界校验
}

// 内部层：业务逻辑
function processUser(user: User) {
  // 内部信任类型，不再重复校验
  return user.name.toUpperCase();
}
\`\`\`

边界（API、文件读取、用户输入）做校验，内部代码信任类型——避免每个函数都重复校验，既安全又简洁。

### 10. 与 OpenAPI/JSON Schema 互转

zod schema 可以转 OpenAPI/JSON Schema，反之亦然：

\`\`\`ts
import { z } from "zod";
import { zodToOpenAPI } from "zod-openapi";

const UserSchema = z.object({ ... });
const openApiSchema = zodToOpenAPI(UserSchema); // 转 OpenAPI
\`\`\`

这让 API 文档、类型、校验**三者一致**——schema 是单一数据源。

### 11. 性能考量

- **schema 编译开销**：复杂 schema 编译有成本，但通常一次性。
- **树摇**：zod 支持树摇，按需引入减小体积。
- **校验性能**：ajv（基于 JSON Schema 编译）最快，zod 中等，io-ts 较快。
- **缓存**：schema 复用，不要每次校验都新建 schema。

### 12. 手写类型守卫 vs zod 的取舍

| 维度 | 手写类型守卫 | zod |
| --- | --- | --- |
| 开发效率 | 低（冗长） | 高（声明式） |
| 类型推导 | 需手动维护 | z.infer 自动 |
| 错误信息 | 差（布尔） | 好（详细路径） |
| 性能 | 高（无抽象） | 中 |
| 依赖 | 无 | 需要 |
| 灵活性 | 极高 | 中 |
| 适用场景 | 简单、性能敏感 | 复杂、需维护 |

#### 何时手写
- 校验逻辑极简单。
- 性能敏感（每秒百万次校验）。
- 不想引入依赖。

#### 何时用 zod
- 校验逻辑复杂（嵌套对象、联合、枚举）。
- 需要详细错误信息。
- schema 与类型需要同步。
- API 边界校验。

### 13. 最佳实践

1. **在系统边界校验**：API、文件、用户输入等入口处校验，内部信任类型。
2. **用 schema 作为单一数据源**：从 schema 推导类型（z.infer），避免重复定义。
3. **优先用 zod 等库**：复杂场景手写易错，库更可靠。
4. **safeParse 处理错误**：不要让校验失败抛异常中断程序，用 safeParse 收集错误。
5. **缓存 schema**：不要每次校验都新建 schema。
6. **类型守卫用于简单场景**：单一字段判断用类型守卫更轻量。
7. **测试边界校验**：校验逻辑本身要有测试覆盖。

### 本章小结

TypeScript 的类型在运行时被擦除，外部数据不能信类型——必须做运行时校验。zod 等库提供声明式 schema 校验，配合 z.infer 实现类型与校验统一。核心原则是**在系统边界校验，内部信任类型**，既安全又简洁。下面代码用手写校验函数演示这些概念（沙箱无 zod，用注释说明 zod 等价写法）。`,
    code: `// ============================================================
// 运行时类型校验 —— 代码演示
// ============================================================
// 沙箱没有 zod 库，代码用手写的简化校验函数演示概念，
// 并用注释说明 zod 的等价写法。这样代码能实际运行。

console.log("========== 运行时类型校验 ==========");

// ---- 1. 类型擦除的后果演示 ----
console.log("\\n---- 1. 类型擦除的后果 ----");

// TypeScript 类型在运行时被完全擦除
interface User {
  id: number;
  name: string;
  email?: string;
}

// 模拟 fetch 返回的数据（运行时可能不符合 User 接口）
function mockFetchUser(): unknown {
  // 模拟后端返回了错误格式的数据
  return { id: "1", name: 123, extra: "unexpected" }; // id 是 string，name 是 number！
}

// ❌ 危险写法：直接断言信任类型
function dangerousGetUser(): User {
  const data = mockFetchUser();
  return data as User; // 类型断言，但运行时数据不对！
}

const user = dangerousGetUser();
console.log("危险写法返回的 user:", JSON.stringify(user));
console.log("user.id 类型:", typeof user.id, "← 声明是 number，实际是 string！");
console.log("user.name 类型:", typeof user.name, "← 声明是 string，实际是 number！");

// 这种代码运行时可能崩溃
try {
  // user.name.toUpperCase() // 运行时炸：number 没有 toUpperCase
  console.log("（user.name.toUpperCase() 会运行时崩溃，因为 name 是 number）");
} catch (e: any) {
  console.log("运行时崩溃:", e.message);
}

// ---- 2. 手写类型守卫的繁琐 ----
console.log("\\n---- 2. 手写类型守卫的繁琐 ----");

// 手写类型守卫：校验 unknown 是否是 User
function isUser(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") return false;
  if (typeof obj.name !== "string") return false;
  if (obj.email !== undefined && typeof obj.email !== "string") return false;
  return true;
}

// 用类型守卫安全处理
function safeGetUser(): User | null {
  const data = mockFetchUser();
  if (isUser(data)) {
    return data; // ✅ 类型收窄为 User
  }
  console.log("  校验失败：数据不符合 User 接口");
  return null;
}

const safeUser = safeGetUser();
console.log("safeGetUser() 结果:", safeUser);

// 模拟合法数据
function mockFetchValidUser(): unknown {
  return { id: 1, name: "张三", email: "zs@example.com" };
}

const validUser = mockFetchValidUser();
if (isUser(validUser)) {
  console.log("合法数据校验通过:", JSON.stringify(validUser));
  console.log("  user.name.toUpperCase():", validUser.name.toUpperCase(), "✅");
}

// ---- 3. 嵌套对象的类型守卫（更繁琐） ----
console.log("\\n---- 3. 嵌套对象的类型守卫 ----");

interface UserWithAddress {
  id: number;
  name: string;
  address: {
    city: string;
    zip: string;
    geo?: { lat: number; lng: number };
  };
  roles: string[];
}

// 手写嵌套校验：非常繁琐
function isUserWithAddress(x: unknown): x is UserWithAddress {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") return false;
  if (typeof obj.name !== "string") return false;
  // 校验 address 嵌套对象
  if (typeof obj.address !== "object" || obj.address === null) return false;
  const addr = obj.address as Record<string, unknown>;
  if (typeof addr.city !== "string") return false;
  if (typeof addr.zip !== "string") return false;
  // 校验可选的 geo
  if (addr.geo !== undefined) {
    if (typeof addr.geo !== "object" || addr.geo === null) return false;
    const geo = addr.geo as Record<string, unknown>;
    if (typeof geo.lat !== "number") return false;
    if (typeof geo.lng !== "number") return false;
  }
  // 校验 roles 数组
  if (!Array.isArray(obj.roles)) return false;
  if (!obj.roles.every(r => typeof r === "string")) return false;
  return true;
}

// 测试嵌套校验
const nestedGood = {
  id: 1,
  name: "张三",
  address: { city: "北京", zip: "100000", geo: { lat: 39.9, lng: 116.4 } },
  roles: ["admin", "user"],
};
const nestedBad = {
  id: 2,
  name: "李四",
  address: { city: "上海", zip: "200000" }, // 缺 geo 没问题（可选）
  roles: "admin", // roles 不是数组！
};

console.log("嵌套校验 good:", isUserWithAddress(nestedGood) ? "通过" : "失败");
console.log("嵌套校验 bad:", isUserWithAddress(nestedBad) ? "通过" : "失败", "← roles 不是数组");
console.log("（手写嵌套守卫非常繁琐，这正是 zod 等库的价值）");

// ---- 4. 简化版 schema 校验器（模拟 zod 概念） ----
console.log("\\n---- 4. 简化版 schema 校验器 ----");

// 简化版 schema 类型（模拟 zod 的 schema 概念）
type Schema =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "array"; element: Schema }
  | { kind: "object"; fields: Record<string, Schema>; optionals?: string[] };

// 校验结果
type ValidationResult =
  | { success: true; data: unknown }
  | { success: false; error: string };

// 校验函数（模拟 zod 的 safeParse）
function validate(data: unknown, schema: Schema, path: string = ""): ValidationResult {
  switch (schema.kind) {
    case "string":
      if (typeof data !== "string") {
        return { success: false, error: path + " 应为 string，实际 " + typeof data };
      }
      return { success: true, data };
    case "number":
      if (typeof data !== "number") {
        return { success: false, error: path + " 应为 number，实际 " + typeof data };
      }
      return { success: true, data };
    case "boolean":
      if (typeof data !== "boolean") {
        return { success: false, error: path + " 应为 boolean，实际 " + typeof data };
      }
      return { success: true, data };
    case "array":
      if (!Array.isArray(data)) {
        return { success: false, error: path + " 应为 array，实际 " + typeof data };
      }
      for (let i = 0; i < data.length; i++) {
        const r = validate(data[i], schema.element, path + "[" + i + "]");
        if (!r.success) return r;
      }
      return { success: true, data };
    case "object":
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return { success: false, error: path + " 应为 object，实际 " + typeof data };
      }
      const obj = data as Record<string, unknown>;
      const optionals = schema.optionals || [];
      for (const key of Object.keys(schema.fields)) {
        const fieldPath = path + (path ? "." : "") + key;
        if (!(key in obj)) {
          if (optionals.includes(key)) continue;
          return { success: false, error: fieldPath + " 缺失" };
        }
        const r = validate(obj[key], schema.fields[key], fieldPath);
        if (!r.success) return r;
      }
      return { success: true, data };
  }
}

// 定义 schema（模拟 zod 的 z.object）
const UserSchema: Schema = {
  kind: "object",
  fields: {
    id: { kind: "number" },
    name: { kind: "string" },
    email: { kind: "string" },
    roles: { kind: "array", element: { kind: "string" } },
  },
  optionals: ["email"],
};

// 测试校验
const goodData = { id: 1, name: "张三", email: "zs@example.com", roles: ["admin"] };
const badData1 = { id: "1", name: "李四", roles: [] }; // id 类型错
const badData2 = { id: 2, name: "王五" }; // 缺 roles
const badData3 = { id: 3, name: "赵六", roles: ["admin", 123] }; // roles 元素类型错

console.log("校验 goodData:", validate(goodData, UserSchema).success ? "通过 ✅" : "失败");
console.log("校验 badData1:", validate(badData1, UserSchema));
console.log("校验 badData2:", validate(badData2, UserSchema));
console.log("校验 badData3:", validate(badData3, UserSchema));

// ---- 5. 从 schema 推导类型（模拟 z.infer） ----
console.log("\\n---- 5. 从 schema 推导类型 ----");

// 手写：根据 Schema 类型推导 TS 类型（模拟 z.infer）
type InferSchema<S extends Schema> =
  S extends { kind: "string" } ? string :
  S extends { kind: "number" } ? number :
  S extends { kind: "boolean" } ? boolean :
  S extends { kind: "array"; element: infer E extends Schema } ? InferSchema<E>[] :
  S extends { kind: "object"; fields: infer F } ? { [K in keyof F]: InferSchema<F[K]> } :
  never;

// zod 等价：type User = z.infer<typeof UserSchema>
// 这里手写 User 类型
type UserFromSchema = {
  id: number;
  name: string;
  email?: string;
  roles: string[];
};

// 验证类型推导（编译期）
const inferredUser: UserFromSchema = { id: 1, name: "张三", roles: ["admin"] };
console.log("从 schema 推导的类型 UserFromSchema:", JSON.stringify(inferredUser));
console.log("（zod 的 z.infer<typeof UserSchema> 自动推导，无需手写类型）");

// ---- 6. 校验 API 响应实战 ----
console.log("\\n---- 6. 校验 API 响应实战 ----");

// 模拟 API 客户端：在边界校验
function fetchUserFromApi(id: number): UserFromSchema {
  // 模拟 API 返回的 unknown 数据
  const raw: unknown = { id: id, name: "用户" + id, roles: ["user"] };
  // 边界校验
  const result = validate(raw, UserSchema);
  if (!result.success) {
    throw new Error("API 响应校验失败: " + result.error);
  }
  // 校验通过后，信任类型
  return result.data as UserFromSchema;
}

console.log("fetchUserFromApi(1):", JSON.stringify(fetchUserFromApi(1)));
console.log("fetchUserFromApi(2):", JSON.stringify(fetchUserFromApi(2)));

// 模拟 API 返回错误数据
function fetchBadUser(): UserFromSchema {
  const raw: unknown = { id: "bad", name: 123 }; // 类型错误
  const result = validate(raw, UserSchema);
  if (!result.success) {
    throw new Error("API 响应校验失败: " + result.error);
  }
  return result.data as UserFromSchema;
}

try {
  fetchBadUser();
} catch (e: any) {
  console.log("fetchBadUser 抛异常:", e.message);
}

// ---- 7. 系统边界校验模式 ----
console.log("\\n---- 7. 系统边界校验模式 ----");

// 边界层：所有外部数据入口都校验
class ApiClient {
  // 边界校验：API 响应
  async getUser(id: number): Promise<UserFromSchema> {
    // 模拟 fetch
    const raw: unknown = { id: id, name: "用户" + id, roles: ["user"] };
    const result = validate(raw, UserSchema);
    if (!result.success) {
      throw new Error("API 校验失败: " + result.error);
    }
    return result.data as UserFromSchema;
  }

  // 边界校验：localStorage 读取
  loadFromStorage(key: string): UserFromSchema | null {
    // 模拟 localStorage
    const stored = '{"id":1,"name":"缓存用户","roles":["admin"]}';
    if (!stored) return null;
    let raw: unknown;
    try {
      raw = JSON.parse(stored);
    } catch {
      return null;
    }
    const result = validate(raw, UserSchema);
    if (!result.success) return null;
    return result.data as UserFromSchema;
  }

  // 边界校验：用户输入
  parseUserInput(input: string): UserFromSchema {
    let raw: unknown;
    try {
      raw = JSON.parse(input);
    } catch (e: any) {
      throw new Error("JSON 解析失败: " + e.message);
    }
    const result = validate(raw, UserSchema);
    if (!result.success) {
      throw new Error("输入校验失败: " + result.error);
    }
    return result.data as UserFromSchema;
  }
}

// 内部层：业务逻辑信任类型
class UserService {
  constructor(private api: ApiClient) {}

  // 内部代码信任类型，不再重复校验
  formatUser(user: UserFromSchema): string {
    return "#" + user.id + " " + user.name + " [" + user.roles.join(",") + "]";
  }

  async greetUser(id: number): Promise<string> {
    const user = await this.api.getUser(id); // 边界校验
    return this.formatUser(user);            // 内部信任
  }

  greetCachedUser(): string | null {
    const user = this.api.loadFromStorage("user"); // 边界校验
    if (!user) return null;
    return this.formatUser(user);                   // 内部信任
  }
}

const client = new ApiClient();
const service = new UserService(client);

// 测试边界校验
service.greetUser(1).then(function (greeting) {
  console.log("greetUser(1):", greeting);
});

const cached = service.greetCachedUser();
console.log("greetCachedUser():", cached);

// 测试用户输入校验
try {
  const inputUser = client.parseUserInput('{"id":99,"name":"输入用户","roles":["guest"]}');
  console.log("parseUserInput(合法):", service.formatUser(inputUser));
} catch (e: any) {
  console.log("parseUserInput(合法) 异常:", e.message);
}

try {
  client.parseUserInput('{"id":"bad"}'); // 非法输入
} catch (e: any) {
  console.log("parseUserInput(非法) 异常:", e.message);
}

// ---- 8. 手写类型守卫 vs schema 校验对比 ----
console.log("\\n---- 8. 手写守卫 vs schema 校验 ----");

// 同样的校验，两种实现对比

// 实现A：手写类型守卫
function isUserGuard(x: unknown): x is UserFromSchema {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  if (typeof obj.id !== "number") return false;
  if (typeof obj.name !== "string") return false;
  if (obj.email !== undefined && typeof obj.email !== "string") return false;
  if (!Array.isArray(obj.roles)) return false;
  if (!obj.roles.every(function (r) { return typeof r === "string"; })) return false;
  return true;
}

// 实现B：schema 校验
function isUserSchema(x: unknown): x is UserFromSchema {
  return validate(x, UserSchema).success;
}

const testData: unknown = { id: 1, name: "测试", roles: ["a"] };
console.log("手写守卫:", isUserGuard(testData) ? "通过" : "失败");
console.log("schema 校验:", isUserSchema(testData) ? "通过" : "失败");

// schema 校验的优势：错误信息详细
const badTestData: unknown = { id: "x", name: 123, roles: [1] };
console.log("手写守卫(错误数据):", isUserGuard(badTestData) ? "通过" : "失败（无错误详情）");
const schemaResult = validate(badTestData, UserSchema);
console.log("schema 校验(错误数据):", schemaResult.success ? "通过" : "失败 - " + (schemaResult as any).error);

// ---- 9. 复杂 schema：嵌套对象 ----
console.log("\\n---- 9. 复杂 schema：嵌套对象 ----");

// 嵌套 schema（模拟 zod 嵌套）
const AddressSchema: Schema = {
  kind: "object",
  fields: {
    city: { kind: "string" },
    zip: { kind: "string" },
  },
};

const UserWithAddressSchema: Schema = {
  kind: "object",
  fields: {
    id: { kind: "number" },
    name: { kind: "string" },
    address: AddressSchema,
    roles: { kind: "array", element: { kind: "string" } },
  },
};

// 测试嵌套校验
const goodNested = {
  id: 1,
  name: "张三",
  address: { city: "北京", zip: "100000" },
  roles: ["admin"],
};
const badNested = {
  id: 2,
  name: "李四",
  address: { city: "上海" }, // 缺 zip
  roles: [],
};

console.log("嵌套校验 good:", validate(goodNested, UserWithAddressSchema).success ? "通过 ✅" : "失败");
console.log("嵌套校验 bad:", validate(badNested, UserWithAddressSchema));

// ---- 10. 联合类型校验 ----
console.log("\\n---- 10. 联合类型校验 ----");

// 模拟 z.union 的概念：尝试多个 schema，第一个成功的胜出
function validateUnion(data: unknown, schemas: Schema[]): ValidationResult {
  for (const schema of schemas) {
    const r = validate(data, schema);
    if (r.success) return r;
  }
  return { success: false, error: "不匹配任何 schema" };
}

// 定义联合 schema：可以是 string 或 number
const StringOrNumber: Schema[] = [{ kind: "string" }, { kind: "number" }];

console.log("联合校验 'hello':", validateUnion("hello", StringOrNumber).success ? "通过" : "失败");
console.log("联合校验 42:", validateUnion(42, StringOrNumber).success ? "通过" : "失败");
console.log("联合校验 true:", validateUnion(true, StringOrNumber));

// ---- 11. transform 概念演示 ----
console.log("\\n---- 11. transform 概念演示 ----");

// 模拟 zod 的 transform：校验 + 转换
// z.string().transform(s => s.length) 的等价写法
function validateAndTransform(
  data: unknown,
  schema: Schema,
  transform: (data: unknown) => unknown
): ValidationResult {
  const r = validate(data, schema);
  if (!r.success) return r;
  try {
    return { success: true, data: transform(r.data) };
  } catch (e: any) {
    return { success: false, error: "转换失败: " + e.message };
  }
}

// 示例：字符串 → 长度
const lengthResult = validateAndTransform(
  "hello world",
  { kind: "string" },
  function (s) { return (s as string).length; }
);
console.log("transform 'hello world' → 长度:", lengthResult);

// 示例：字符串数组 → 去重
const dedupResult = validateAndTransform(
  ["a", "b", "a", "c", "b"],
  { kind: "array", element: { kind: "string" } },
  function (arr) { return Array.from(new Set(arr as string[])); }
);
console.log("transform 去重:", dedupResult);

// ---- 12. 总结：手写校验 vs zod ----
console.log("\\n---- 12. 总结：手写校验 vs zod ----");

console.log("手写校验的特点:");
console.log("  + 无依赖，沙箱可用");
console.log("  + 性能高（无抽象）");
console.log("  + 灵活（可定制）");
console.log("  - 冗长（每个字段手写）");
console.log("  - 易错（漏写检查）");
console.log("  - 错误信息差（仅布尔）");
console.log("  - 类型与校验分离（需手写 interface）");

console.log("\\nzod 的特点:");
console.log("  + 声明式（一行定义）");
console.log("  + z.infer 自动推导类型");
console.log("  + 错误信息详细（带路径）");
console.log("  + 生态丰富（表单、API、文档）");
console.log("  - 需引入依赖");
console.log("  - 性能中等");
console.log("  - 学习曲线");

console.log("\\n最佳实践: 在系统边界用 schema 校验，内部信任类型");

console.log("\\n运行时类型校验章节演示完成！");`,
  },
];