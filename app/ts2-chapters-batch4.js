// =============================================================
// TypeScript 交互式教程 —— 第二系列第四批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts2-modules            — 模块系统精通
//   2. ts2-utility-types      — 内置工具类型大全
//   3. ts2-conditional-mapped — 条件类型与映射类型
//   4. ts2-declaration-files  — 声明文件编写
//   5. ts2-tsconfig           — tsconfig 完全配置指南
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量 3000+ 中文字符）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, URLSearchParams, TextEncoder, TextDecoder,
//     Promise, __dirname, __filename, require, module, exports
//   - 代码必须自包含，不能使用浏览器 API（DOM、fetch、window）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：模块系统精通
  // =========================================================
  {
    id: "ts2-modules",
    title: "模块系统精通",
    icon: "📦",
    group: "模块与工程化",
    content: `## 模块系统精通

模块系统是现代 TypeScript 工程化的基石。这一章不是入门教程，而是**深度精通**——我们将从模块系统底层原理出发，逐层深入 ES Modules 与 CommonJS 的区别、导入导出的各种变体、类型导入导出、模块解析策略、路径映射、环境模块、全局声明和模块增强等高级主题。无论你是库作者还是大型项目维护者，本章都能帮你彻底吃透 TS 模块系统。

### ES Modules 与 CommonJS 的本质区别

要精通模块系统，必须先理解两种模块标准在**设计哲学**和**运行机制**上的根本差异——这远比"语法不同"重要得多。

#### 设计哲学

**CommonJS** 诞生于 Node.js 早期（2009 年），它遵循"同步加载"理念：服务器端文件在本地磁盘上，读取速度极快，所以 \`require()\` 可以同步阻塞地加载模块。它的核心是**运行时决议**——模块导出什么、导入什么，都是在代码执行时动态确定的。

**ES Modules** 诞生于 ECMAScript 2015 标准化进程，它遵循"静态分析"理念：模块的导入导出关系在**解析阶段**（代码执行前）就已经确定。这意味着打包器、编译器可以在不运行代码的情况下分析出模块依赖图，从而实现 tree-shaking、scope hoisting 等优化。

#### 核心差异对比

| 维度 | CommonJS | ES Modules |
| --- | --- | --- |
| 语法 | \`require()\` / \`module.exports\` | \`import\` / \`export\` |
| 加载时机 | 运行时同步加载 | 编译时静态分析，支持异步加载 |
| 导出绑定 | 值的拷贝（浅拷贝） | 值的实时引用（live binding） |
| 顶层 this | 指向 \`module.exports\` | 指向 \`undefined\` |
| 动态导入 | 本就是动态的 \`require()\` | 需要 \`import()\` 动态语法 |
| Tree-shaking | ❌ 不支持 | ✅ 原生支持 |
| 循环依赖 | 可能拿到不完整的拷贝 | 可能拿到不完整的引用（但引用是活的） |
| 默认导出 | 无此概念（靠 \`esModuleInterop\` 合成） | 原生支持一个 \`default\` |

#### 导出是"值的拷贝" vs "值的引用"——这是最大的坑！

这是理解两个模块系统差异最关键的一点，也是面试高频考点。

**CommonJS 的导出是值的拷贝**：

\`\`\`js
// counter.js (CommonJS)
let count = 0;  // 声明变量 count
function increment() { count++; }  // 定义函数 increment
module.exports = { count, increment };  // 赋值 module.exports

// main.js
const { count, increment } = require('./counter');  // 对象解构声明：从 require('./counter'); 取 count, increment
console.log(count);    // 0
increment();  // 调用 increment
console.log(count);    // 仍然是 0！因为 count 是值拷贝，不会跟着变
\`\`\`

解释：\`module.exports = { count, increment }\` 执行时，\`count\` 的值 \`0\` 被拷贝到导出对象的 \`count\` 属性上。之后 \`count\` 变量变了，但导出对象上的 \`count\` 属性不会跟着变。这是"值拷贝"的核心含义。

**ES Modules 的导出是值的实时引用（live binding）**：

\`\`\`js
// counter.mjs (ESM)
export let count = 0;  // 导出 let count
export function increment() { count++; }  // 导出函数 increment

// main.mjs
import { count, increment } from './counter.mjs';  // 导入 { count, increment }
console.log(count);    // 0
increment();  // 调用 increment
console.log(count);    // 1！因为 count 是实时引用，指向原模块的变量
\`\`\`

解释：ESM 的 \`import { count }\` 不是拿到 \`count\` 的值拷贝，而是建立了一个**指向原模块变量的绑定**。当原模块的 \`count\` 变化时，所有导入方都能看到变化。这就是"实时引用"。

⚠️ 由于绑定的只读特性，**导入方不能修改导入的变量**（\`count = 5\` 会报错），只能由原模块修改。

#### 循环依赖的行为差异

假设 A 导入 B，B 也导入 A：

**CommonJS**：当 \`require(A)\` 时，Node 会检查 A 是否已在缓存中。如果 A 正在执行（还没执行完），Node 会返回**A 当前已赋值的 exports 对象**（可能不完整）。这就是"循环依赖时拿到不完整拷贝"的原因。

**ES Modules**：ESM 的静态分析会在代码执行前先建立所有模块的"作用域图"。当 B 导入 A 的某个变量时，它拿到的是**对该变量的引用**。虽然 A 可能还没执行完，但一旦 A 执行到该变量的赋值，所有引用方都能立即看到新值。不过如果 A 还没执行到那行引用就被使用了，仍会拿到 \`undefined\`。

### 默认导出与命名导出的深度对比

#### 默认导出 export default 的陷阱

很多人不知道 \`export default\` 有几种写法，它们的行为略有不同：

\`\`\`ts
// 写法一：直接导出值（匿名）
export default function () { return 'hello'; }  // 导出 default function
// 写法二：导出表达式
const fn = function () { return 'hello'; };  // 声明常量 fn
export default fn;  // 导出 default fn
// 写法三：先声明再导出
function fn() { return 'hello'; }  // 定义函数 fn
export default fn;  // 导出 default fn
\`\`\`

差异在于：写法一在 TS 的类型系统中，导入方拿到的类型是 \`() => string\` 但**没有函数名**；写法三中，导入方虽然起任意名字，但 TS 知道这个函数叫 \`fn\`（用于类型推断和 .d.ts 生成）。

#### 为什么大型项目偏好命名导出？

1. **重构安全**：IDE 可以精确追踪命名导出的每一个引用，改名时自动更新所有导入。默认导出改名后，导入方的名字不变，容易脱节。
2. **自动导入**：IDE 的自动导入功能对命名导出支持更好，因为名字是确定的。
3. **一致性**：一个模块可能有多个导出，统一用命名导出避免风格混用。
4. **tree-shaking**：虽然现代打包器对默认导出也能做 tree-shaking，但命名导出更明确——打包器知道每个导出的名字和引用关系。

#### 重导出（re-export）的最佳实践

\`\`\`ts
// barrel 文件：统一导出入口
export { add, multiply } from './math';  // 导出成员
export { default as Calculator } from './calculator';  // 导出成员（注意：类型断言会绕过类型检查）
export * from './types';           // 重导出所有命名导出
export * as Utils from './utils';  // 重导出为命名空间

// ⚠️ export * 不会重导出默认导出，需要单独处理
// ⚠️ export * 可能造成命名冲突，建议显式列出
\`\`\`

### import type 与 export type 的深层原理

#### 为什么需要 import type？

在 \`isolatedModules: true\` 模式下，TS 要求每个文件能被独立转译。这意味着转译器（Babel、esbuild、Vite 等）在处理一个文件时，只能看到这个文件本身，不知道其他文件的内容。

问题来了：如果一个文件 \`export { SomeInterface }\`，转译器不知道 \`SomeInterface\` 是值还是类型——因为对于 \`interface\`，它在运行时不存在，应该被擦除；但对于 \`class\`，它既是类型又是值，需要保留。在没有类型信息的情况下，单文件转译器无法判断。

\`import type\` 和 \`export type\` 就是解决方案：它**明确告诉转译器"这个导入/导出是纯类型，请擦除"**。

\`\`\`ts
// ✅ 明确告诉转译器：这是纯类型，擦除就行
import type { User } from './user';  // 导入 type { User }
export type { User, Admin } from './models';

// ✅ 混合导入：inline type 修饰符（TS 4.5+）
import { add, type MathFunc } from './math';  // 导入 { add, type MathFunc }
\`\`\`

#### 编译后 import type 被完全擦除

\`\`\`ts
import type { User } from './user';  // 导入 type { User }
// 编译后：这一行消失了，不产生任何 require 调用
// 这意味着 import type 不会在运行时引入任何依赖
\`\`\`

这个特性对**打破循环依赖**也有帮助：如果 A 和 B 互相依赖但只在类型层面，可以用 \`import type\` 避免运行时的循环 \`require\`。

### 模块解析策略深度解析

TS 的 \`moduleResolution\` 控制编译器如何找到 \`import\` 语句引用的模块。这块内容经常被忽略，但理解它对于解决"找不到模块"类型错误至关重要。

#### classic 策略（已过时）

最古老的策略，查找逻辑简单：对相对路径，逐级向上找 \`.ts\`/\`.d.ts\`；对非相对路径，从当前目录向上逐级找。不支持 \`node_modules\`。现代项目基本不用。

#### node（node10）策略

模拟 Node.js 的 CommonJS 解析逻辑，是 TS 3.x 和之前的默认值。

对于相对路径 \`./math\`：
1. 尝试 \`./math.ts\`、\`./math.tsx\`、\`./math.d.ts\`
2. 尝试 \`./math/package.json\` 的 \`types\` 或 \`typings\` 字段
3. 尝试 \`./math/index.ts\`、\`./math/index.tsx\`、\`./math/index.d.ts\`

对于裸模块名 \`lodash\`：
1. 在当前目录 \`node_modules/lodash\` 中按上述逻辑查找
2. 逐级向上目录的 \`node_modules\` 中查找
3. 查找 \`@types/lodash\` 的类型声明

#### node16 / nodenext 策略

TS 4.7+ 引入，严格遵循 Node.js 现代模块解析规则。与 node10 最大的区别：
- **ESM 文件要求写全扩展名**：\`import { x } from './foo.js'\`（即使源文件是 \`.ts\`，也要写 \`.js\`）
- **支持 package.json 的 \`exports\` 字段**：Node 的 exports 条件导出完全支持
- **根据 package.json 的 \`type\` 字段判断模块格式**：\`"type": "module"\` 则视为 ESM

#### bundler 策略

TS 5.0 引入，专为打包器场景设计。它结合了 node10 的便利性（不需要写扩展名）和打包器功能（支持路径别名、条件导出等）。如果你的项目用 Vite、webpack 等打包器，这是最佳选择。

#### 选择指南

| 场景 | 推荐策略 |
| --- | --- |
| 旧 Node.js CommonJS 项目 | \`node\` (node10) |
| 现代 Node.js 项目（ESM） | \`node16\` / \`nodenext\` |
| 打包器项目（Vite/webpack） | \`bundler\` |
| 库（Library） | \`bundler\` 或 \`node16\`（取决于目标环境） |

### paths 和 baseUrl 的完整指南

路径别名是大型项目不可或缺的配置，但它在 TS 和运行时之间的"脱节"是最常见的坑。

#### 基本配置

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"],
      "@types/*": ["./types/*"]
    }
  }
}
\`\`\`

#### paths 的工作原理

\`paths\` 是**编译期路径重写**：当 TS 遇到 \`import { Button } from '@components/Button'\`，它会把 \`@components/Button\` 替换为 \`./src/components/Button\`，然后按模块解析策略查找实际文件。

⚠️ **核心陷阱**：TS 只做类型检查层面的路径重写，**不会修改编译后的 JS 代码**。所以编译产物里仍然是 \`require('@components/Button')\`，而 Node.js 不认识这个路径。这意味着你必须在运行时环境也配置别名解析：

- **Node.js**：使用 \`tsconfig-paths\`（\`ts-node -r tsconfig-paths/register\`）或 \`module-alias\` 包
- **webpack**：配置 \`resolve.alias\`
- **Vite**：配置 \`resolve.alias\`
- **esbuild**：配置 \`alias\` 选项
- **Jest**：配置 \`moduleNameMapper\`

#### baseUrl 的精确含义

\`baseUrl\` 是**非相对模块导入**的基准目录。例如 \`baseUrl: "./src"\`，那么 \`import { foo } from 'utils/helper'\` 会从 \`./src/utils/helper\` 开始查找。TS 4.1+ 起，\`paths\` 可以独立工作不依赖 \`baseUrl\`，但设置 \`baseUrl\` 能让 paths 中不写 \`./\` 的相对路径也有基准。

### 环境模块（Ambient Modules）

环境模块用于声明"不在当前项目文件系统中"的模块类型——比如 npm 包、CDN 脚本、构建工具注入的虚拟模块。

#### 为 npm 包声明类型

\`\`\`ts
// types/my-lib.d.ts
declare module 'my-lib' {
  export function doSomething(x: number): string;  // 导出函数 doSomething
  export const version: string;  // 导出 const version
  export default class MyLib {  // 导出类 MyLib
    constructor(config: object);  // 调用 constructor
    run(): void;  // 方法声明 run()，返回 void
  }
}
\`\`\`

#### 通配符模块声明

为某种模式的文件（如 \`.css\`、\`.png\`）声明类型：

\`\`\`ts
declare module '*.css' {
  const content: Record<string, string>;
  export default content;  // 导出 default content
}
declare module '*.png' {
  const src: string;
  export default src;  // 导出 default src
}
\`\`\`

#### 模块简写

\`\`\`ts
// 所有导入都是 any——不推荐，丢失类型安全
declare module 'untyped-lib';
\`\`\`

### 全局声明（Global Declarations）

#### 脚本文件中的全局声明

在**非模块文件**（没有 import/export 的 .ts 或 .d.ts）中，直接写的 \`declare\` 就是全局声明：

\`\`\`ts
// globals.d.ts（非模块文件）
declare const API_BASE: string;
declare function track(event: string, data?: object): void;
\`\`\`

#### 模块文件中的 declare global

在模块文件中（有 import/export），要扩展全局作用域必须用 \`declare global\`：

\`\`\`ts
// types/global.d.ts
export {}; // 使文件成为模块
declare global {
  interface Window {  // 定义接口 Window
    __CUSTOM_CONFIG__: { env: string };
  }
  const __VERSION__: string;
}
\`\`\`

### 模块增强（Module Augmentation）

模块增强是 TypeScript 最强大的类型扩展机制之一——它允许你**在外部给已有模块添加新的类型成员**。

#### 增强接口

\`\`\`ts
// 原始模块 types/original.d.ts
declare module 'original' {
  export interface User {  // 导出接口 User
    name: string;
    age: number;
  }
}

// 你的增强 types/augment.d.ts
declare module 'original' {
  export interface User {  // 导出接口 User
    // 新增字段，会和原始 User 合并
    email: string;
    role: 'admin' | 'user';
  }
}
// 现在 User 有 name, age, email, role 四个字段
\`\`\`

#### 增强函数

\`\`\`ts
// 增强 Express 的 Request 对象
declare module 'express' {
  interface Request {  // 定义接口 Request
    userId?: string;
    sessionData?: Record<string, unknown>;
  }
}
\`\`\`

#### 增强全局对象

\`\`\`ts
declare global {
  interface Array<T> {  // 定义接口 Array，泛型参数 T
    // 给 Array 原型添加自定义方法
    customFirst(): T | undefined;  // 方法声明 customFirst()，返回 T | undefined
  }
}
\`\`\`

### 陷阱与最佳实践

1. **ESM 的 live binding 是利器也是陷阱**：跨模块共享可变状态要小心，不要滥用。
2. **paths 必须双端配置**：TS 编译期 + 运行时环境，缺一不可。
3. **环境模块声明要精确**：能用 \`declare module\` 写完整类型就不要用简写，any 是类型毒药。
4. **模块增强不要滥用**：只在确实需要扩展第三方库类型时使用，过度使用会让类型系统难以理解。
5. **import type 打破循环依赖**：循环依赖在类型层面可以通过 import type 避免。
6. **\`export *\` 谨慎使用**：可能造成命名冲突，且不重导出默认导出。
7. **选择正确的 moduleResolution**：打包器项目用 bundler，现代 Node 用 node16。

### 本章小结

模块系统精通不仅仅是知道 \`import\` 和 \`export\` 的语法，而是深入理解 ESM 与 CommonJS 的本质差异（值拷贝 vs 实时引用）、类型导入导出的原理、模块解析策略的选择、路径映射的双端配置、环境模块与全局声明、以及模块增强的高级用法。掌握这些，你就能在大型项目中游刃有余地组织代码，也能解决各种"找不到模块"、"类型不匹配"的疑难杂症。`,

    code: `// ============================================================
// 模块系统精通 —— 代码演示
// ------------------------------------------------------------
// 沙箱是单文件执行，不能 require 本地 .ts 文件。我们使用
// "对象字面量 + 注册表"模拟完整的模块系统，演示：
// 1. ESM 命名导出 vs 默认导出
// 2. 值的实时引用 vs 值的拷贝
// 3. import type 概念
// 4. 路径映射
// 5. 环境模块声明
// 6. 模块增强
// 7. 循环依赖处理
// ============================================================

console.log("========== 1. 命名导出 vs 默认导出 ==========");

// 模拟模块注册表
const moduleRegistry: Record<string, any> = {};

// ---- 定义 math 模块（命名导出 + 默认导出）----
// 真实写法：
//   export const PI = 3.14159;
//   export function add(a, b) { return a + b; }
//   export default function square(x) { return x * x; }
moduleRegistry["math"] = {
  PI: 3.14159,
  add: function (a: number, b: number): number { return a + b; },
  multiply: function (a: number, b: number): number { return a * b; },
  default: function square(x: number): number { return x * x; }
};

// 模拟 import { add, PI } from 'math'
const mathMod = moduleRegistry["math"];
const { add, PI } = mathMod;
console.log("命名导出 add(2,3) =", add(2, 3));
console.log("命名导出 PI =", PI);

// 模拟 import square from 'math'（默认导出）
const square = mathMod.default;
console.log("默认导出 square(5) =", square(5));

// 模拟 import * as Math from 'math'（命名空间导入）
// 注意：变量名用 MathNS 而非 Math，避免覆盖全局 Math 对象，
// 否则下方 distance 函数里的 Math.sqrt 会变成 undefined 而报错
const MathNS = moduleRegistry["math"];
console.log("命名空间导入 Math.add(10,20) =", MathNS.add(10, 20));
console.log("命名空间导入 Math.PI =", MathNS.PI);
console.log("命名空间导入中的默认导出 Math.default(7) =", MathNS.default(7));

// ---- 演示 export type 概念（类型在运行时被擦除）----
console.log("\\n--- import type 概念 ---");
// 真实写法：import type { Point } from './types';
// 类型 Point 仅编译期存在，运行时不产生任何代码
type Point = { x: number; y: number };
function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
console.log("import type 的 Point 类型（编译期存在，运行时可正常使用）:");
console.log("  distance({0,0}, {3,4}) =", distance({ x: 0, y: 0 }, { x: 3, y: 4 }));

// ============================================================
// 2. 值的实时引用 vs 值的拷贝
// ============================================================
console.log("\\n========== 2. 值的实时引用（ESM）vs 值的拷贝（CJS）==========");

// ---- 模拟 CommonJS 行为：值的拷贝 ----
(function () {
  console.log("--- CommonJS 模式（值的拷贝）---");
  // CJS 导出时，值被拷贝到导出对象上
  let count = 0;
  const cjsExports = { count: count, increment: function () { count++; } };
  console.log("初始 cjsExports.count =", cjsExports.count); // 0
  cjsExports.increment();
  console.log("increment 后 cjsExports.count =", cjsExports.count); // 仍然是 0
  console.log("实际 count =", count); // 1，但导出对象没变
  console.log("结论：CJS 导出的是值的拷贝，原变量变化不影响导出对象");
})();

// ---- 模拟 ESM 行为：值的实时引用 ----
(function () {
  console.log("\\n--- ESM 模式（值的实时引用）---");
  // ESM 导出的是指向变量的"绑定"，不是值的拷贝
  // 用闭包模拟：getter 每次访问都返回最新值
  let count = 0;
  const esmBindings = {
    get count() { return count; },  // getter 实现实时引用
    increment: function () { count++; }
  };
  console.log("初始 esmBindings.count =", esmBindings.count); // 0
  esmBindings.increment();
  console.log("increment 后 esmBindings.count =", esmBindings.count); // 1
  console.log("结论：ESM 导出的是值的实时引用，原变量变化立即反映到导入方");
  // 再次验证
  esmBindings.increment();
  console.log("再次 increment 后 esmBindings.count =", esmBindings.count); // 2
})();

// ============================================================
// 3. 重导出模式
// ============================================================
console.log("\\n========== 3. 重导出（re-export）模式 ==========");

// 模拟 barrel 文件：统一导出入口
// 真实写法：export { add, multiply } from './math';
//          export * from './types';
//          export * as Utils from './utils';

// 定义多个模块
moduleRegistry["math-basic"] = {
  add: function (a: number, b: number): number { return a + b; },
  subtract: function (a: number, b: number): number { return a - b; }
};
moduleRegistry["math-advanced"] = {
  multiply: function (a: number, b: number): number { return a * b; },
  divide: function (a: number, b: number): number { return a / b; }
};

// barrel 模块：聚合所有导出
moduleRegistry["math-barrel"] = {
  ...moduleRegistry["math-basic"],      // 重导出所有命名导出
  ...moduleRegistry["math-advanced"],   // 重导出所有命名导出
  // 默认导出需要单独处理
  default: {
    add: moduleRegistry["math-basic"].add,
    multiply: moduleRegistry["math-advanced"].multiply
  }
};

const barrel = moduleRegistry["math-barrel"];
console.log("barrel.add(5,3) =", barrel.add(5, 3));
console.log("barrel.subtract(10,4) =", barrel.subtract(10, 4));
console.log("barrel.multiply(6,7) =", barrel.multiply(6, 7));
console.log("barrel.divide(20,4) =", barrel.divide(20, 4));
console.log("barrel.default.add(1,1) =", barrel.default.add(1, 1));

// ============================================================
// 4. 路径映射 paths 概念演示
// ============================================================
console.log("\\n========== 4. 路径映射 paths ==========");

// 模拟 tsconfig: { paths: { "@/*": ["./src/*"] } }
// TS 编译期把 @/utils/math 解析为 ./src/utils/math
// 但运行时需要另配！

// 在注册表中注册别名
moduleRegistry["@/utils/math"] = moduleRegistry["math"];
moduleRegistry["@/components/button"] = {
  render: function (): string { return "<Button>点击</Button>"; },
  default: function Button(): string { return "Button 组件"; }
};

// 使用别名"导入"
const { add: aliasedAdd, multiply: aliasedMultiply } = moduleRegistry["@/utils/math"];
console.log("@/utils/math 的 add(3,7) =", aliasedAdd(3, 7));
console.log("@/utils/math 的 multiply(3,7) =", aliasedMultiply(3, 7));

const button = moduleRegistry["@/components/button"];
console.log("@/components/button 的 render() =", button.render());
console.log("⚠️ 重要：paths 只在编译期生效，运行时需要 tsconfig-paths 或打包器 alias 配置！");

// ============================================================
// 5. 环境模块声明
// ============================================================
console.log("\\n========== 5. 环境模块声明 ==========");

// 真实写法（在 .d.ts 中）：
//   declare module 'my-lib' {
//     export function doSomething(x: number): string;
//     export const version: string;
//   }
// 这里用运行时对象模拟

// 模拟一个 npm 包的运行时值
moduleRegistry["my-lib"] = {
  doSomething: function (x: number): string {
    return "结果: " + (x * 2);
  },
  version: "1.4.2",
  default: {
    init: function (): void { console.log("my-lib 初始化完成"); }
  }
};

// 使用（模拟 import { doSomething, version } from 'my-lib'）
const myLib = moduleRegistry["my-lib"];
console.log("my-lib.version =", myLib.version);
console.log("my-lib.doSomething(5) =", myLib.doSomething(5));
myLib.default.init();

// 通配符模块声明示例
// 真实写法：declare module '*.css' { const content: Record<string,string>; export default content; }
console.log("\\n通配符模块声明（如 *.css, *.png）用于非 JS 资源的类型描述");
console.log("例如：declare module '*.css' { const css: Record<string,string>; export default css; }");

// ============================================================
// 6. 模块增强（Module Augmentation）
// ============================================================
console.log("\\n========== 6. 模块增强 ==========");

// 模拟一个第三方模块，只有基本类型
// 原始模块定义
moduleRegistry["original-lib"] = {
  User: function (name: string, age: number) {
    return { name: name, age: age };
  },
  createUser: function (name: string, age: number) {
    return { name: name, age: age };
  }
};

// 模块增强：给 User 添加 email 和 role 字段
// 真实写法在 .d.ts 中：
//   declare module 'original-lib' {
//     interface User { email: string; role: string; }
//   }
// 运行时模拟增强
const originalLib = moduleRegistry["original-lib"];
const enhancedCreateUser = function (name: string, age: number, email: string, role: string) {
  const user = originalLib.createUser(name, age);
  return { ...user, email: email, role: role };
};

console.log("原始 createUser:", JSON.stringify(originalLib.createUser("张三", 25)));
console.log("增强后 createUser:", JSON.stringify(enhancedCreateUser("张三", 25, "zhang@example.com", "admin")));
console.log("模块增强允许在不修改原模块代码的情况下扩展类型和功能");

// ============================================================
// 7. 循环依赖处理
// ============================================================
console.log("\\n========== 7. 循环依赖处理 ==========");

// 模拟循环依赖：A 依赖 B，B 依赖 A
// 常见解决方案：使用 import type 打破循环

// 方案一：延迟加载（lazy require）
(function () {
  console.log("--- 方案一：延迟加载 ---");
  const moduleA = {
    name: "ModuleA",
    // 不在一开始就 require B，而是在方法调用时才 require
    doWork: function () {
      const moduleB = moduleRegistry["module-b"];
      return "A 调用 B: " + moduleB.help();
    },
    help: function (): string {
      return "A 的帮助信息";
    }
  };
  const moduleB = {
    name: "ModuleB",
    doWork: function () {
      const moduleA = moduleRegistry["module-a"];
      return "B 调用 A: " + moduleA.help();
    },
    help: function (): string {
      return "B 的帮助信息";
    }
  };

  moduleRegistry["module-a"] = moduleA;
  moduleRegistry["module-b"] = moduleB;

  console.log(moduleA.doWork());
  console.log(moduleB.doWork());
})();

// 方案二：使用 import type（类型层面打破循环）
// 在 TS 中，如果 A 只在类型层面依赖 B，可以用 import type
// 这样不会产生运行时的 require 调用，打破循环
console.log("\\n--- 方案二：import type 打破循环 ---");
console.log("如果 A 只需要 B 的类型（interface/type），使用 import type 而非 import");
console.log("import type 编译后完全擦除，不产生运行时的 require，不会形成循环依赖");

// 类型层面的循环依赖演示
type UserId = string;
type Post = { id: string; author: UserId; title: string };
type UserWithPosts = { id: UserId; name: string; posts: Post[] };
console.log("类型层面的循环依赖在 TS 中完全合法，因为类型在运行时不存在");

// ============================================================
// 8. 模块解析策略对比
// ============================================================
console.log("\\n========== 8. 模块解析策略对比 ==========");

const resolutionStrategies = [
  { name: "classic", description: "最古老，不考虑 node_modules，基本已废弃", useCase: "遗留项目" },
  { name: "node (node10)", description: "模拟 Node.js CommonJS 解析，不需要扩展名", useCase: "旧 Node 项目" },
  { name: "node16/nodenext", description: "严格遵循 Node 现代解析，ESM 需要 .js 扩展名", useCase: "现代 Node ESM 项目" },
  { name: "bundler", description: "结合 node 便利性和打包器特性，不需要扩展名，支持 exports", useCase: "Vite/webpack/esbuild 项目" }
];

resolutionStrategies.forEach(function (s) {
  console.log("  • " + s.name + " — " + s.description);
  console.log("    适用: " + s.useCase);
});

console.log("\\n模块系统精通章节演示完成！");`,
  },

  // =========================================================
  // 第二章：内置工具类型大全
  // =========================================================
  {
    id: "ts2-utility-types",
    title: "内置工具类型大全",
    icon: "🛠️",
    group: "模块与工程化",
    content: `## 内置工具类型大全

TypeScript 内置了一套强大的**工具类型（Utility Types）**，它们本质上是预定义的泛型类型，用于对已有类型进行变换、提取、筛选等操作。熟练使用工具类型，可以大大减少重复的类型定义，让你的类型代码更加简洁、可维护。

本章将**逐一详解** TypeScript 几乎所有内置工具类型：从最常用的 Partial/Required/Readonly/Pick/Omit，到高级的 Exclude/Extract/NonNullable/ReturnType/Parameters，再到与类和异步相关的 ConstructorParameters/InstanceType/Awaited。每个工具类型都会讲清楚源码实现、使用场景和常见陷阱。

### 为什么需要工具类型？

假设你有一个用户类型：

\`\`\`ts
interface User {  // 定义接口 User
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}
\`\`\`

不同场景需要不同的"变体"：
- 更新用户时，所有字段都是可选的 → \`Partial<User>\`
- 展示用户列表时，不需要 password → \`Omit<User, 'password'>\`
- 创建用户时，id 和 createdAt 由后端生成 → \`Omit<User, 'id' | 'createdAt'>\`
- 缓存用户信息，所有字段不可变 → \`Readonly<User>\`

如果没有工具类型，你需要为每个场景手写一个新的 interface，维护成本极高。工具类型让你用**类型变换**代替**类型复制**。

### 修改属性可选性：Partial、Required

#### Partial<T>：全部变为可选

源码实现：

\`\`\`ts
type Partial<T> = {  // 定义类型别名 Partial，泛型参数 T
  [P in keyof T]?: T[P];
};
\`\`\`

它遍历 T 的所有键（\`keyof T\`），为每个属性添加 \`?\` 使其变为可选。

\`\`\`ts
interface User { name: string; age: number; }  // 定义接口 User
type PartialUser = Partial<User>;  // 定义类型别名 PartialUser
// 等价于 { name?: string; age?: number; }
\`\`\`

典型场景：更新接口（Update DTO）。你只想更新部分字段，不需要传递所有字段。

⚠️ **陷阱**：\`Partial\` 只做一层浅可选。如果你的对象嵌套了多层，\`Partial<{ a: { b: number } }>\` 只能让 \`a\` 可选，\`a.b\` 仍然是必填的。要深层可选，需要自定义 \`DeepPartial\`。

#### Required<T>：全部变为必填

与 Partial 相反，去掉所有可选标记：

\`\`\`ts
type Required<T> = {  // 定义类型别名 Required，泛型参数 T
  [P in keyof T]-?: T[P];
};
\`\`\`

\`-?\` 移除可选修饰符。注意这个负号操作符也可以用于 \`readonly\`：\`-readonly\` 移除只读。

\`\`\`ts
interface Config { host?: string; port?: number; }  // 定义接口 Config
type FullConfig = Required<Config>;  // 定义类型别名 FullConfig
// 等价于 { host: string; port: number; }
\`\`\`

典型场景：你有一个"选项"接口，用户在大多数场景下字段可选，但在某个核心函数里需要所有字段都有值。

### 修改属性只读性：Readonly<T>

#### Readonly<T>

\`\`\`ts
type Readonly<T> = {  // 定义类型别名 Readonly，泛型参数 T
  readonly [P in keyof T]: T[P];
};
\`\`\`

典型的不可变数据场景：

\`\`\`ts
const config: Readonly<{ host: string; port: number }> = { host: 'localhost', port: 3000 };  // 声明常量 config，类型 Readonly<{ host: string; port: number }>
// config.host = 'other'; // ❌ 类型错误
\`\`\`

⚠️ **陷阱**：与 Partial 一样，\`Readonly\` 是浅层的。\`Readonly<{ items: string[] }>\` 只防止 \`items\` 被重新赋值，但不防止 \`items.push('new')\`。要深层只读，需要自定义 \`DeepReadonly\`。

### 选取与排除：Pick、Omit、Record

#### Pick<T, K>：选取

从 T 中选取一组属性 K 组成新类型。

\`\`\`ts
type Pick<T, K extends keyof T> = {  // 定义类型别名 Pick，泛型参数 T, K extends keyof T
  [P in K]: T[P];
};
\`\`\`

\`\`\`ts
interface User { id: number; name: string; email: string; password: string; }  // 定义接口 User
type UserPreview = Pick<User, 'id' | 'name'>;  // 定义类型别名 UserPreview，联合类型
// 等价于 { id: number; name: string; }
\`\`\`

#### Omit<T, K>：排除

从 T 中排除一组属性 K，剩余的属性组成新类型。

\`\`\`ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;  // 定义类型别名 Omit，泛型参数 T, K extends keyof any，使用 keyof 取键的联合（注意：any 关闭了类型检查）
\`\`\`

\`\`\`ts
type UserWithoutPassword = Omit<User, 'password'>;  // 定义类型别名 UserWithoutPassword
// 等价于 { id: number; name: string; email: string; }
type UserPublic = Omit<User, 'password' | 'email'>;  // 定义类型别名 UserPublic，联合类型
// 等价于 { id: number; name: string; }
\`\`\`

⚠️ **陷阱**：TS 3.5 才引入 Omit，之前的版本需要自己实现。Omit 的第二个参数可以是任意字符串（不一定是 T 的键），这是为了灵活性——你可能想排除一些"可能不存在的键"。

#### Record<K, V>：构造对象类型

把一个联合类型 K 的每个成员作为键，V 作为值类型，构造出一个对象类型。

\`\`\`ts
type Record<K extends keyof any, T> = {  // 定义类型别名 Record，泛型参数 K extends keyof any, T（注意：any 关闭了类型检查）
  [P in K]: T;
};
\`\`\`

\`\`\`ts
type PageInfo = Record<'home' | 'about' | 'contact', { title: string; url: string }>;  // 定义类型别名 PageInfo，联合类型
// 等价于 {
//   home: { title: string; url: string };
//   about: { title: string; url: string };
//   contact: { title: string; url: string };
// }
\`\`\`

典型场景：
- 字典/映射：\`Record<string, User>\`
- 枚举映射：\`Record<Status, string>\`
- 缓存：\`Record<string, Promise<Data>>\`

### 联合类型操作：Exclude、Extract、NonNullable

#### Exclude<T, U>：从 T 中排除可分配给 U 的类型

\`\`\`ts
type Exclude<T, U> = T extends U ? never : T;  // 定义类型别名 Exclude，泛型参数 T, U，条件类型
\`\`\`

这是**条件类型**的分布式（distributive）用法：当 T 是联合类型时，条件类型会分布到联合的每个成员上。

\`\`\`ts
type T0 = Exclude<'a' | 'b' | 'c', 'a'>;           // 'b' | 'c'
type T1 = Exclude<'a' | 'b' | 'c', 'a' | 'b'>;     // 'c'
type T2 = Exclude<string | number | (() => void), Function>; // string | number
type T3 = Exclude<1 | 2 | 3 | null | undefined, null | undefined>; // 1 | 2 | 3
\`\`\`

#### Extract<T, U>：从 T 中提取可分配给 U 的类型

与 Exclude 相反：

\`\`\`ts
type Extract<T, U> = T extends U ? T : never;  // 定义类型别名 Extract，泛型参数 T, U，条件类型
\`\`\`

\`\`\`ts
type T0 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;     // 'a'
type T1 = Extract<string | number | (() => void), Function>; // () => void
type T2 = Extract<1 | 'a' | true, string | number>; // 1 | 'a'
\`\`\`

#### NonNullable<T>：从 T 中排除 null 和 undefined

\`\`\`ts
type NonNullable<T> = T extends null | undefined ? never : T;  // 定义类型别名 NonNullable，泛型参数 T，联合类型，条件类型
// 等价于 Exclude<T, null | undefined>
\`\`\`

\`\`\`ts
type T0 = NonNullable<string | number | undefined>;  // string | number
type T1 = NonNullable<string[] | null | undefined>;   // string[]
type T2 = NonNullable<null | undefined>;              // never
\`\`\`

### 函数类型推导：ReturnType、Parameters

#### ReturnType<T>：获取函数返回类型

\`\`\`ts
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;  // 箭头函数（注意：any 关闭了类型检查）
\`\`\`

这是条件类型 + \`infer\` 的经典用法：

\`\`\`ts
function createUser(name: string, age: number) {  // 定义函数 createUser，参数: name: string, age: number
  return { name, age, id: Math.random() };  // 返回 { name, age, id: Math.random() }
}
type User = ReturnType<typeof createUser>;  // 定义类型别名 User
// User = { name: string; age: number; id: number; }
\`\`\`

⚠️ 注意：\`ReturnType\` 需要传入**函数类型**，不是函数值。如果函数有重载，\`ReturnType\` 取的是**最后一个重载签名**的返回类型。

#### Parameters<T>：获取函数参数类型（元组）

\`\`\`ts
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;  // 箭头函数（注意：any 关闭了类型检查）
\`\`\`

\`\`\`ts
function greet(name: string, age: number): string {  // 定义函数 greet，参数: name: string, age: number，返回 string
  return \`\${name} is \${age}\`;  // 返回 \`\${name} is \${age}\`
}
type GreetParams = Parameters<typeof greet>;  // 定义类型别名 GreetParams
// [name: string, age: number]
type FirstParam = GreetParams[0]; // string
type SecondParam = GreetParams[1]; // number
\`\`\`

典型场景：高阶函数——你想写一个包装函数，参数类型和原函数完全一致，但想修改返回值。

#### ConstructorParameters<T>：获取构造函数参数类型

\`\`\`ts
type ConstructorParameters<T extends abstract new (...args: any) => any> =  // 箭头函数（注意：any 关闭了类型检查）
  T extends abstract new (...args: infer P) => any ? P : never;  // 箭头函数（注意：any 关闭了类型检查）
\`\`\`

\`\`\`ts
class Person {  // 定义类 Person
  constructor(public name: string, public age: number) {}  // 调用 constructor
}
type PersonParams = ConstructorParameters<typeof Person>;  // 定义类型别名 PersonParams
// [name: string, age: number]
\`\`\`

#### InstanceType<T>：获取类实例类型

\`\`\`ts
type InstanceType<T extends abstract new (...args: any) => any> =  // 箭头函数（注意：any 关闭了类型检查）
  T extends abstract new (...args: any) => infer R ? R : any;  // 箭头函数（注意：any 关闭了类型检查）
\`\`\`

\`\`\`ts
class Person {  // 定义类 Person
  constructor(public name: string, public age: number) {}  // 调用 constructor
}
type PersonInstance = InstanceType<typeof Person>;  // 定义类型别名 PersonInstance
// Person（即 { name: string; age: number; }）
\`\`\`

### 与异步相关的工具类型：Awaited

#### Awaited<T>：递归解包 Promise

\`\`\`ts
type Awaited<T> = T extends null | undefined ? T  // 定义类型别名 Awaited，泛型参数 T，联合类型
  : T extends object & { then(onfulfilled: infer F, ...args: any): any }  // 注意：any 关闭了类型检查
    ? F extends (value: infer V, ...args: any) => any ? Awaited<V> : never  // 箭头函数（注意：any 关闭了类型检查）
    : T;
\`\`\`

\`\`\`ts
type T0 = Awaited<Promise<string>>;           // string
type T1 = Awaited<Promise<Promise<number>>>;  // number（递归解包）
type T2 = Awaited<boolean | Promise<number>>; // boolean | number
\`\`\`

Awaited 的强大之处在于：
1. 递归解包嵌套 Promise（\`Promise<Promise<T>>\` → \`T\`）
2. 对非 Promise 类型原样返回
3. 可以处理联合类型

### 其他工具类型

#### ThisParameterType<T>：提取函数的 this 参数类型

\`\`\`ts
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;  // 定义类型别名 ThisParameterType，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）
\`\`\`

\`\`\`ts
function greet(this: { name: string }, msg: string) {  // 定义函数 greet，参数: this: { name: string }, msg: string
  return \`\${this.name}: \${msg}\`;  // 返回 \`\${this.name}: \${msg}\`
}
type ThisType = ThisParameterType<typeof greet>; // { name: string }
\`\`\`

#### OmitThisParameter<T>：移除函数的 this 参数类型

\`\`\`ts
type OmitThisParameter<T> = unknown extends ThisParameterType<T>  // 定义类型别名 OmitThisParameter，泛型参数 T
  ? T
  : T extends (...args: infer A) => infer R  // 箭头函数
    ? (...args: A) => R  // 箭头函数
    : T;
\`\`\`

\`\`\`ts
function greet(this: { name: string }, msg: string): string {  // 定义函数 greet，参数: this: { name: string }, msg: string，返回 string
  return \`\${this.name}: \${msg}\`;  // 返回 \`\${this.name}: \${msg}\`
}
type NoThisFn = OmitThisParameter<typeof greet>;  // 定义类型别名 NoThisFn
// (msg: string) => string
\`\`\`

#### Uppercase / Lowercase / Capitalize / Uncapitalize

TS 4.1+ 引入的模板字符串字面量类型工具：

\`\`\`ts
type Uppercase<S extends string> = intrinsic;  // 定义类型别名 Uppercase，泛型参数 S extends string
type Lowercase<S extends string> = intrinsic;  // 定义类型别名 Lowercase，泛型参数 S extends string
type Capitalize<S extends string> = intrinsic;  // 定义类型别名 Capitalize，泛型参数 S extends string
type Uncapitalize<S extends string> = intrinsic;  // 定义类型别名 Uncapitalize，泛型参数 S extends string
\`\`\`

\`\`\`ts
type Greeting = "hello";  // 定义类型别名 Greeting
type Shout = Uppercase<Greeting>;    // "HELLO"
type Whisper = Lowercase<"HELLO">;   // "hello"
type Title = Capitalize<"hello">;    // "Hello"
type UnTitle = Uncapitalize<"Hello">; // "hello"
\`\`\`

### 自定义工具类型实战

掌握了内置工具类型后，你可以组合它们创造更强大的自定义工具类型：

\`\`\`ts
// 深层 Partial
type DeepPartial<T> = {  // 定义类型别名 DeepPartial，泛型参数 T
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深层 Readonly
type DeepReadonly<T> = {  // 定义类型别名 DeepReadonly，泛型参数 T
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 让某些属性必填
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;  // 定义类型别名 WithRequired，泛型参数 T, K extends keyof T，交叉类型

// 让某些属性可选
type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;  // 定义类型别名 WithOptional，泛型参数 T, K extends keyof T，交叉类型

// 不可为空的 Partial
type NonNullablePartial<T> = { [P in keyof T]?: NonNullable<T[P]> };  // 定义类型别名 NonNullablePartial，泛型参数 T，使用 keyof 取键的联合，映射类型

// 提取函数类型的第一个参数
type FirstParameter<T extends (...args: any) => any> = Parameters<T>[0];  // 箭头函数（注意：any 关闭了类型检查）

// 提取 Promise 的值类型（非递归）
type PromiseValue<T> = T extends Promise<infer V> ? V : T;  // 定义类型别名 PromiseValue，泛型参数 T，使用 infer 在条件类型中提取类型
\`\`\`

### 陷阱与最佳实践

1. **Partial/Readonly 是浅层的**：需要深层效果时写 DeepPartial/DeepReadonly。
2. **ReturnType 取最后一个重载**：如果函数有多个重载声明，ReturnType 反映的是最后一个重载的返回类型。
3. **Pick 的第二个参数必须是 T 的键**：TS 会做约束检查，但 Omit 的第二个参数可以是任意字符串。
4. **Exclude/Extract 是分布式的**：\`T extends U ? never : T\` 中，如果 T 是联合类型，条件类型会分布在每个成员上。可以用 \`[T] extends [U]\` 阻止分布。
5. **Awaited 递归解包**：注意嵌套 Promise 的情况，确保你的类型逻辑能处理。
6. **Record 的值类型是统一的**：所有键的值类型必须相同，如果需要不同值类型，用映射类型。
7. **不要过度使用工具类型**：简单的 interface 直接写更清晰，复杂变换才用工具类型。

### 本章小结

TypeScript 的内置工具类型是一个强大的类型变换工具箱。掌握 Partial/Required/Readonly 的属性修饰变换、Pick/Omit/Record 的选取与构造、Exclude/Extract/NonNullable 的联合类型筛选、ReturnType/Parameters/ConstructorParameters/InstanceType 的函数类型推导，以及 Awaited 的异步解包，你就能用声明式的方式编写类型定义，极大减少重复代码，提升类型系统的表现力。`,

    code: `// ============================================================
// 内置工具类型大全 —— 代码演示
// ------------------------------------------------------------
// TypeScript 内置工具类型是纯类型层面的变换，运行时不存在。
// 这里用实际的值和类型定义来演示每个工具类型的效果。
// 所有类型定义在编译期处理，运行时代码用 console.log 输出
// 类型变换的结果。
// ============================================================

console.log("========== 1. Partial<T> 全部变为可选 ==========");

// 原始类型
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// Partial<User> 等价于每个属性都加了 ?
// type PartialUser = { id?: number; name?: string; email?: string; password?: string; createdAt?: string; }

// 模拟：更新用户时只需要部分字段
function updateUser(id: number, data: Partial<User>): User {
  // 模拟查找原用户
  const existing: User = {
    id: id,
    name: "张三",
    email: "zhang@example.com",
    password: "hashed_pwd",
    createdAt: "2026-01-01"
  };
  // 合并更新（Partial 允许只传部分字段）
  const updated = { ...existing, ...data };
  return updated;
}

const updatedUser = updateUser(1, { name: "张四", email: "zhang4@example.com" });
console.log("Partial<User> 更新后:", JSON.stringify(updatedUser));
// 只传了 name 和 email，password 和 createdAt 保持不变

// 可以传空对象（所有字段可选）
const sameUser = updateUser(1, {});
console.log("Partial<User> 空对象更新:", JSON.stringify(sameUser));

// ============================================================
// 2. Required<T> 全部变为必填
// ============================================================
console.log("\\n========== 2. Required<T> 全部变为必填 ==========");

// 原始类型：字段都是可选的
interface Config {
  host?: string;
  port?: number;
  timeout?: number;
}

// Required<Config> 将所有可选变为必填
// type FullConfig = { host: string; port: number; timeout: number; }

// 模拟：某些场景下需要完整配置
function initApp(config: Required<Config>): void {
  console.log("Required<Config> 连接 " + config.host + ":" + config.port + " (超时" + config.timeout + "ms)");
}

// 必须提供所有字段
initApp({ host: "localhost", port: 3000, timeout: 5000 });
console.log("Required<Config> 成功：所有字段必须提供");

// 验证：如果缺少字段，TS 编译期会报错（这里演示概念）
// initApp({ host: "localhost" }); // ❌ TS 报错：缺少 port 和 timeout

// ============================================================
// 3. Readonly<T> 全部变为只读
// ============================================================
console.log("\\n========== 3. Readonly<T> 全部变为只读 ==========");

// 原始类型
interface AppConfig {
  appName: string;
  version: string;
  debug: boolean;
}

// Readonly<AppConfig> = { readonly appName: string; readonly version: string; readonly debug: boolean; }

// 模拟：在运行时创建只读对象
const configRaw: AppConfig = { appName: "MyApp", version: "1.0.0", debug: false };
// 用 Object.freeze 模拟 Readonly 效果（运行时不可变）
const frozenConfig: Readonly<AppConfig> = Object.freeze(configRaw);

console.log("Readonly<AppConfig> appName:", frozenConfig.appName);
console.log("Readonly<AppConfig> version:", frozenConfig.version);
console.log("Readonly<AppConfig> debug:", frozenConfig.debug);

// 验证：尝试修改（TS 层面报错，运行时 freeze 后静默失败）
// frozenConfig.debug = true; // ❌ TS 报错
console.log("Readonly<AppConfig> 修改后 debug 仍为:", frozenConfig.debug);

// ⚠️ Readonly 是浅层的
console.log("\\n⚠️ Readonly 是浅层的：");
interface Nested { items: string[]; }
const nested: Readonly<Nested> = { items: ["a", "b"] };
// nested.items = ["c"]; // ❌ TS 报错：不能重新赋值
nested.items.push("c"); // ⚠️ 但可以修改数组内容！
console.log("Readonly<Nested> push 后 items:", JSON.stringify(nested.items));
console.log("（Readonly 只冻结了 items 引用，不冻结数组内容）");

// ============================================================
// 4. Pick<T, K> 选取属性
// ============================================================
console.log("\\n========== 4. Pick<T, K> 选取属性 ==========");

// Pick<User, 'id' | 'name'> 从 User 中选取 id 和 name
const user: User = { id: 1, name: "张三", email: "zhang@example.com", password: "123", createdAt: "2026-01-01" };

// 模拟 Pick：只取需要的属性
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const preview = pick(user, ["id", "name"]);
console.log("Pick<User, 'id'|'name'>:", JSON.stringify(preview));

const triple = pick(user, ["id", "name", "email"]);
console.log("Pick<User, 'id'|'name'|'email'>:", JSON.stringify(triple));

// ============================================================
// 5. Omit<T, K> 排除属性
// ============================================================
console.log("\\n========== 5. Omit<T, K> 排除属性 ==========");

// Omit<User, 'password'> 排除 password
// 模拟 Omit：挑出除指定键外的所有属性
function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

const safe = omit(user, ["password"]);
console.log("Omit<User, 'password'>:", JSON.stringify(safe));
console.log("  password 字段已被排除:", !("password" in safe));

const publicUser = omit(user, ["password", "email"]);
console.log("Omit<User, 'password'|'email'>:", JSON.stringify(publicUser));

// ============================================================
// 6. Record<K, V> 构造对象类型
// ============================================================
console.log("\\n========== 6. Record<K, V> 构造对象类型 ==========");

// Record<string, number> = { [key: string]: number }
const scores: Record<string, number> = {
  "张三": 95,
  "李四": 87,
  "王五": 92
};
console.log("Record<string, number> 成绩表:", JSON.stringify(scores));

// Record<特定键, 值类型>
type Page = "home" | "about" | "contact";
type PageInfo = Record<Page, { title: string; visits: number }>;

const pages: PageInfo = {
  home: { title: "首页", visits: 1000 },
  about: { title: "关于", visits: 500 },
  contact: { title: "联系我们", visits: 200 }
};
console.log("Record<Page, PageInfo> 页面信息:", JSON.stringify(pages));

// 模拟 Record 创建
function makeRecord<K extends string, V>(keys: K[], factory: (k: K) => V): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const key of keys) {
    result[key] = factory(key);
  }
  return result;
}

const roleMap = makeRecord(["admin", "user", "guest"] as const, (role) => ({
  level: role === "admin" ? 3 : role === "user" ? 2 : 1,
  permissions: role === "admin" ? ["read", "write", "delete"] : role === "user" ? ["read", "write"] : ["read"]
}));
console.log("动态创建 Record:", JSON.stringify(roleMap, null, 2));

// ============================================================
// 7. Exclude<T, U> 排除
// ============================================================
console.log("\\n========== 7. Exclude<T, U> 排除 ==========");

// 演示 Exclude 的效果（模拟联合类型变换）
type Status = "active" | "inactive" | "pending" | "deleted";
// Exclude<Status, 'deleted'> = 'active' | 'inactive' | 'pending'

function filterExcluded(values: string[], excluded: string[]): string[] {
  return values.filter(function (v) { return !excluded.includes(v); });
}

const allStatuses = ["active", "inactive", "pending", "deleted"];
const withoutDeleted = filterExcluded(allStatuses, ["deleted"]);
console.log("Exclude<Status, 'deleted'> 模拟:", JSON.stringify(withoutDeleted));

// Exclude 排除 null 和 undefined
type MaybeNumber = number | null | undefined;
// Exclude<MaybeNumber, null | undefined> = number
const mixedValues = [1, null, 2, undefined, 3, null, 4];
const nonNull = mixedValues.filter(function (v) { return v !== null && v !== undefined; });
console.log("Exclude<number|null|undefined, null|undefined> 模拟:", JSON.stringify(nonNull));

// ============================================================
// 8. Extract<T, U> 提取
// ============================================================
console.log("\\n========== 8. Extract<T, U> 提取 ==========");

// Extract 只保留匹配的类型
type Mixed = string | number | boolean | (() => void);
// Extract<Mixed, Function> = () => void

function filterByType(values: any[], type: string): any[] {
  return values.filter(function (v) { return typeof v === type; });
}

const mixed = ["hello", 42, true, function () { return "fn"; }, "world", 100];
const strings = filterByType(mixed, "string");
const numbers = filterByType(mixed, "number");
const functions = filterByType(mixed, "function");

console.log("Extract 模拟 - 提取 string:", JSON.stringify(strings));
console.log("Extract 模拟 - 提取 number:", JSON.stringify(numbers));
console.log("Extract 模拟 - 提取 function:", JSON.stringify(functions.map(function (f) { return typeof f; })));

// ============================================================
// 9. NonNullable<T> 排除 null 和 undefined
// ============================================================
console.log("\\n========== 9. NonNullable<T> 排除 null 和 undefined ==========");

// NonNullable<T> = Exclude<T, null | undefined>
function ensureNonNullable<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("值不能为 null 或 undefined");
  }
  return value as NonNullable<T>;
}

console.log("NonNullable 确保非空:", ensureNonNullable("hello"));
console.log("NonNullable 确保非空:", ensureNonNullable(42));
try {
  ensureNonNullable(null as any);
} catch (e: any) {
  console.log("NonNullable 拦截 null:", e.message);
}

// ============================================================
// 10. ReturnType<T> 获取函数返回类型
// ============================================================
console.log("\\n========== 10. ReturnType<T> 获取函数返回类型 ==========");

// 定义函数
function createUser(name: string, age: number) {
  return { name: name, age: age, id: Math.floor(Math.random() * 1000), createdAt: new Date().toISOString() };
}

// ReturnType<typeof createUser> = { name: string; age: number; id: number; createdAt: string }
const newUser = createUser("张三", 30);
console.log("createUser 返回:", JSON.stringify(newUser));
console.log("ReturnType 推导的类型成员:", Object.keys(newUser).join(", "));

// 另一个函数
function formatDate(date: Date, format: string): string {
  return date.toISOString().split("T")[0];
}
// ReturnType<typeof formatDate> = string
console.log("formatDate 返回:", formatDate(new Date(), "YYYY-MM-DD"));
console.log("ReturnType<typeof formatDate> = string");

// ============================================================
// 11. Parameters<T> 获取函数参数类型
// ============================================================
console.log("\\n========== 11. Parameters<T> 获取函数参数类型 ==========");

function greet(title: string, name: string, age: number): string {
  return title + " " + name + ", " + age + "岁";
}

// Parameters<typeof greet> = [title: string, name: string, age: number]
// 模拟：高阶函数——包装原函数
function withLogging<T extends (...args: any[]) => any>(fn: T, fnName: string): T {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    console.log("  [包装] 调用 " + fnName + "(" + args.join(", ") + ")");
    const result = fn.apply(this, args);
    console.log("  [包装] " + fnName + " 返回 " + JSON.stringify(result));
    return result;
  } as T;
}

const loggedGreet = withLogging(greet, "greet");
console.log("Parameters<T> + ReturnType<T> 高阶函数:");
loggedGreet("先生", "张三", 25);

// 提取第一个参数类型
// 类型层面：type FirstParam = Parameters<typeof greet>[0]; // string
console.log("\\nParameters<typeof greet>[0] = string (第一个参数类型)");
console.log("Parameters<typeof greet>[1] = string (第二个参数类型)");
console.log("Parameters<typeof greet>[2] = number (第三个参数类型)");

// ============================================================
// 12. ConstructorParameters 与 InstanceType
// ============================================================
console.log("\\n========== 12. ConstructorParameters 与 InstanceType ==========");

class Person {
  public name: string;
  public age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  greet(): string {
    return "你好，我是" + this.name + "，" + this.age + "岁";
  }
}

// ConstructorParameters<typeof Person> = [name: string, age: number]
// InstanceType<typeof Person> = Person

// 模拟：工厂函数——用 ConstructorParameters 推断参数类型
function createInstance<T extends new (...args: any[]) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  console.log("  创建 " + Ctor.name + "，参数: " + JSON.stringify(args));
  return new Ctor(...args);
}

const p = createInstance(Person, "张三", 30);
console.log("ConstructorParameters 创建实例:", p.greet());

// 验证类型
console.log("InstanceType<typeof Person> 实例的 name:", p.name);
console.log("InstanceType<typeof Person> 实例的 age:", p.age);

// ============================================================
// 13. Awaited<T> 解包 Promise
// ============================================================
console.log("\\n========== 13. Awaited<T> 解包 Promise ==========");

// Awaited<Promise<string>> = string
// Awaited<Promise<Promise<number>>> = number（递归解包）

// 模拟异步函数
async function fetchUser(id: number): Promise<User> {
  return { id: id, name: "用户" + id, email: "user" + id + "@example.com", password: "***", createdAt: "2026-01-01" };
}

// 使用 Awaited 获取 Promise 的返回值类型
// type FetchedUser = Awaited<ReturnType<typeof fetchUser>>; // User
(async function () {
  const userData = await fetchUser(42);
  console.log("Awaited<ReturnType<typeof fetchUser>> 解包:", JSON.stringify(userData));

  // 嵌套 Promise
  async function deepPromise(): Promise<Promise<Promise<string>>> {
    return Promise.resolve(Promise.resolve("深层值"));
  }
  // Awaited<ReturnType<typeof deepPromise>> = string（递归解包）
  const deepValue = await deepPromise();
  console.log("Awaited 递归解包嵌套 Promise:", deepValue);
})();

// ============================================================
// 14. 自定义工具类型组合
// ============================================================
console.log("\\n========== 14. 自定义工具类型组合 ==========");

// 自定义 DeepPartial（模拟）
function deepPartial<T extends object>(obj: T): Partial<T> {
  const result = { ...obj } as any;
  for (const key of Object.keys(result)) {
    if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
      result[key] = deepPartial(result[key]);
    }
  }
  return result;
}

const complexUser = {
  name: "张三",
  profile: { age: 30, city: "北京", tags: ["ts", "js"] }
};
console.log("DeepPartial 模拟:", JSON.stringify(deepPartial(complexUser)));

// 自定义 WithRequired
// type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
// 运行时模拟：确保某些属性存在
function withRequired<T extends object, K extends keyof T>(obj: T, requiredKeys: K[]): T & Required<Pick<T, K>> {
  for (const key of requiredKeys) {
    if (obj[key] === undefined || obj[key] === null) {
      throw new Error("属性 " + String(key) + " 是必填的");
    }
  }
  return obj as T & Required<Pick<T, K>>;
}

const validConfig = withRequired({ host: "localhost", port: 3000, timeout: undefined as any }, ["host", "port"]);
console.log("WithRequired 验证通过:", JSON.stringify(validConfig));

// ============================================================
// 15. Uppercase/Lowercase/Capitalize/Uncapitalize 概念
// ============================================================
console.log("\\n========== 15. 字符串工具类型概念 ==========");

// 这些是类型层面的字符串变换，运行时用普通字符串方法演示
const str = "hello";
console.log("Uppercase<'hello'> 模拟:", str.toUpperCase());
console.log("Lowercase<'HELLO'> 模拟:", "HELLO".toLowerCase());
console.log("Capitalize<'hello'> 模拟:", str.charAt(0).toUpperCase() + str.slice(1));
console.log("Uncapitalize<'Hello'> 模拟:", "Hello".charAt(0).toLowerCase() + "Hello".slice(1));
console.log("（这些在类型层面是 intrinsic 实现，这里演示运行时效果）");

// ============================================================
// 16. 工具类型速查表
// ============================================================
console.log("\\n========== 16. 工具类型速查表 ==========");

const utilityTypes = [
  { name: "Partial<T>", effect: "所有属性变为可选", signature: "[P in keyof T]?: T[P]" },
  { name: "Required<T>", effect: "所有属性变为必填", signature: "[P in keyof T]-?: T[P]" },
  { name: "Readonly<T>", effect: "所有属性变为只读", signature: "readonly [P in keyof T]: T[P]" },
  { name: "Pick<T,K>", effect: "从 T 中选取 K 属性", signature: "[P in K]: T[P]" },
  { name: "Omit<T,K>", effect: "从 T 中排除 K 属性", signature: "Pick<T, Exclude<keyof T, K>>" },
  { name: "Record<K,V>", effect: "构造 K 为键 V 为值的对象", signature: "[P in K]: V" },
  { name: "Exclude<T,U>", effect: "从 T 中排除可分配给 U 的", signature: "T extends U ? never : T" },
  { name: "Extract<T,U>", effect: "从 T 中提取可分配给 U 的", signature: "T extends U ? T : never" },
  { name: "NonNullable<T>", effect: "排除 null 和 undefined", signature: "T extends null|undefined ? never : T" },
  { name: "ReturnType<T>", effect: "获取函数返回类型", signature: "T extends (...args: any) => infer R ? R : any" },
  { name: "Parameters<T>", effect: "获取函数参数类型元组", signature: "T extends (...args: infer P) => any ? P : never" },
  { name: "Awaited<T>", effect: "递归解包 Promise", signature: "递归解包 then 回调返回类型" }
];

console.log("名称".padEnd(22) + "效果".padEnd(28) + "签名");
console.log("-".repeat(90));
utilityTypes.forEach(function (ut) {
  console.log(ut.name.padEnd(22) + ut.effect.padEnd(28) + ut.signature);
});

console.log("\\n内置工具类型大全章节演示完成！");`,
  },

  // =========================================================
  // 第三章：条件类型与映射类型
  // =========================================================
  {
    id: "ts2-conditional-mapped",
    title: "条件类型与映射类型",
    icon: "🔄",
    group: "模块与工程化",
    content: `## 条件类型与映射类型

条件类型（Conditional Types）和映射类型（Mapped Types）是 TypeScript 类型系统的两大"高阶能力"。它们让你能够编写**类型层面的程序**——根据输入类型动态生成输出类型，就像在值层面编写函数一样。理解这两者是 TypeScript 进阶的关键标志。

本章将深入讲解：条件类型的语法和分布式特性、\`infer\` 关键字、条件类型链、映射类型的基本语法、key remapping、模板字面量类型与映射类型的结合、同态与非同态映射类型，以及条件类型与映射类型的组合模式。

### 条件类型基础

#### 基本语法

条件类型的形式是：

\`\`\`ts
T extends U ? X : Y
\`\`\`

读作：如果类型 T 可以赋值给类型 U，那么结果是 X，否则结果是 Y。这类似于 JavaScript 的三元运算符 \`condition ? a : b\`，但发生在类型层面。

\`\`\`ts
type IsString<T> = T extends string ? true : false;  // 定义类型别名 IsString，泛型参数 T，条件类型
type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<'hello'>;  // true（字面量类型也是 string 的子类型）
\`\`\`

#### 分布式条件类型（Distributive Conditional Types）

这是条件类型最强大也最容易被误解的特性。当条件类型作用于**裸类型参数**（naked type parameter）且该参数是**联合类型**时，条件类型会**分布（distribute）到联合的每个成员上**。

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;  // 定义类型别名 ToArray，泛型参数 T，条件类型（注意：any 关闭了类型检查）
// 如果 T 是 string | number：
// 1. 分布：string extends any ? string[] : never → string[]
// 2. 分布：number extends any ? number[] : never → number[]
// 3. 合并：string[] | number[]
type Result = ToArray<string | number>; // string[] | number[]
\`\`\`

注意：分布式条件类型要求 T 是**裸类型参数**。如果 T 被包裹在数组、元组或其他结构中，分布就不会发生：

\`\`\`ts
type ToArrayWrapped<T> = [T] extends [any] ? T[] : never;  // 定义类型别名 ToArrayWrapped，泛型参数 T，条件类型（注意：any 关闭了类型检查）
// T 被包裹在 [T] 中，不再是裸类型参数，不分布
type Result = ToArrayWrapped<string | number>; // (string | number)[]
\`\`\`

这个"阻止分布"的技巧在需要把联合类型当作整体处理时很常用。

#### 分布式条件类型的实际应用

\`\`\`ts
// Exclude 的实现就是靠分布式条件类型
type Exclude<T, U> = T extends U ? never : T;  // 定义类型别名 Exclude，泛型参数 T, U，条件类型
// 当 T = 'a' | 'b' | 'c', U = 'a'
// 分布：'a' extends 'a' ? never : 'a' → never
// 分布：'b' extends 'a' ? never : 'b' → 'b'
// 分布：'c' extends 'a' ? never : 'c' → 'c'
// 合并：never | 'b' | 'c' → 'b' | 'c'（never 在联合类型中被吸收）
\`\`\`

### infer 关键字

\`infer\` 是条件类型中极其强大的特性——它让你在条件类型的 extends 子句中**声明一个类型变量来捕获某个位置的类型**。

#### 基本用法

\`\`\`ts
// 提取数组的元素类型
type Flatten<T> = T extends (infer U)[] ? U : T;  // 定义类型别名 Flatten，泛型参数 T，使用 infer 在条件类型中提取类型
type A = Flatten<string[]>;    // string
type B = Flatten<number>;      // number（不匹配数组，返回原类型）
type C = Flatten<string[][]>;  // string[]（只解一层）
\`\`\`

#### infer 可以用于多个位置

\`\`\`ts
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;  // 定义类型别名 ReturnType，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;  // 定义类型别名 Parameters，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）

// 提取 Promise 的值类型
type Unwrap<T> = T extends Promise<infer U> ? U : T;  // 定义类型别名 Unwrap，泛型参数 T，使用 infer 在条件类型中提取类型

// 提取构造函数的实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : any;  // 定义类型别名 InstanceType，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）

// 提取构造函数的参数类型
type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;  // 定义类型别名 ConstructorParameters，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）
\`\`\`

#### 多个 infer 和多位置推断

\`\`\`ts
// 提取函数第一个参数和返回类型
type FirstArgAndReturn<T> = T extends (first: infer F, ...rest: any[]) => infer R  // 定义类型别名 FirstArgAndReturn，泛型参数 T，使用 infer 在条件类型中提取类型（注意：any 关闭了类型检查）
  ? { first: F; return: R }
  : never;

// 提取 Promise 链的值类型（递归）
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;  // 定义类型别名 Awaited，泛型参数 T，使用 infer 在条件类型中提取类型
// 可以递归解包 Promise<Promise<Promise<number>>> → number
\`\`\`

#### infer 在协变和逆变位置

\`\`\`ts
// 协变位置：推断出联合类型
type Covariant<T> = T extends { a: infer U; b: infer U } ? U : never;  // 定义类型别名 Covariant，泛型参数 T，使用 infer 在条件类型中提取类型
type Test1 = Covariant<{ a: string; b: number }>; // string | number

// 逆变位置：推断出交叉类型
type Contravariant<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void } ? U : never;  // 定义类型别名 Contravariant，泛型参数 T，使用 infer 在条件类型中提取类型
type Test2 = Contravariant<{ a: (x: string) => void; b: (x: number) => void }>; // string & number → never
\`\`\`

### 映射类型基础

映射类型让你遍历一个类型的属性，对每个属性进行变换，从而生成新类型。

#### 基本语法

\`\`\`ts
type Mapped<T> = {  // 定义类型别名 Mapped，泛型参数 T
  [K in keyof T]: T[K]; // 遍历 T 的所有键，原样保留值类型
};
\`\`\`

#### 同态映射类型（Homomorphic Mapped Types）

同态映射类型的特征是 \`[K in keyof T]\`——它保留了原类型的结构信息（修饰符）。TS 内置的 Partial、Required、Readonly、Pick 都是同态映射类型。

\`\`\`ts
type Partial<T> = { [K in keyof T]?: T[K] };  // 定义类型别名 Partial，泛型参数 T，使用 keyof 取键的联合，映射类型
// 同态：保留了原类型中每个属性的可选性信息（然后加了 ?）

type Required<T> = { [K in keyof T]-?: T[K] };  // 定义类型别名 Required，泛型参数 T，使用 keyof 取键的联合，映射类型
// 同态：-? 移除可选修饰符

type Readonly<T> = { readonly [K in keyof T]: T[K] };  // 定义类型别名 Readonly，泛型参数 T，使用 keyof 取键的联合，映射类型
// 同态：添加 readonly 修饰符
\`\`\`

同态映射类型的优势：
1. **保留修饰符**：知道原类型哪些属性是 readonly、哪些是可选。
2. **支持原始类型**：\`Partial<string>\` 返回 \`string\`（而非 \`{[K in keyof string]: ...}\`），因为原始类型没有可遍历的键。
3. **可被 Pick 等精确追踪**：TS 知道映射的来源。

#### 非同态映射类型

当映射类型不使用 \`in keyof T\` 而是用 \`in SomeUnion\` 时，就是非同态映射：

\`\`\`ts
type NonHomomorphic = {  // 定义类型别名 NonHomomorphic
  [K in "a" | "b" | "c"]: string;
};
// 非同态：直接定义了三个属性，不保留任何原类型信息
\`\`\`

Record 是非同态映射类型的典型：

\`\`\`ts
type Record<K extends keyof any, T> = {  // 定义类型别名 Record，泛型参数 K extends keyof any, T（注意：any 关闭了类型检查）
  [P in K]: T;
};
\`\`\`

非同态映射类型不会保留原类型的修饰符信息，也不会对原始类型做特殊处理。

### Key Remapping（键重映射）

TS 4.1+ 引入了映射类型的 \`as\` 子句，允许你在映射过程中**重命名键**：

\`\`\`ts
type MappedWithRemap<T> = {  // 定义类型别名 MappedWithRemap，泛型参数 T
  [K in keyof T as NewKey]: T[K];  // 注意：类型断言会绕过类型检查
};
\`\`\`

#### 基本用法

\`\`\`ts
// 给所有属性名加 get 前缀
type Getters<T> = {  // 定义类型别名 Getters，泛型参数 T
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];  // 箭头函数（注意：类型断言会绕过类型检查）
};

interface Person {  // 定义接口 Person
  name: string;
  age: number;
}
type PersonGetters = Getters<Person>;  // 定义类型别名 PersonGetters
// { getName: () => string; getAge: () => number; }
\`\`\`

#### 用 never 过滤键

如果 \`as\` 子句返回 \`never\`，该属性会被过滤掉：

\`\`\`ts
// 只保留字符串类型的属性
type PickStringValues<T> = {  // 定义类型别名 PickStringValues，泛型参数 T
  [K in keyof T as T[K] extends string ? K : never]: T[K];  // 注意：类型断言会绕过类型检查
};

interface Mixed {  // 定义接口 Mixed
  name: string;
  age: number;
  email: string;
  active: boolean;
}
type StringFields = PickStringValues<Mixed>;  // 定义类型别名 StringFields
// { name: string; email: string; }
\`\`\`

#### 组合过滤和重命名

\`\`\`ts
// 提取所有函数类型的属性，并加 on 前缀
type EventHandlers<T> = {  // 定义类型别名 EventHandlers，泛型参数 T
  [K in keyof T as T[K] extends (...args: any[]) => any  // 箭头函数（注意：any 关闭了类型检查；注意：类型断言会绕过类型检查）
    ? \`on\${Capitalize<string & K>}\`
    : never]: T[K];
};
\`\`\`

### 模板字面量类型与映射类型

TS 4.1+ 引入模板字面量类型后，与映射类型的结合产生了强大的类型编程能力。

#### 基础组合

\`\`\`ts
// 给属性名加前缀
type WithPrefix<T, Prefix extends string> = {  // 定义类型别名 WithPrefix，泛型参数 T, Prefix extends string
  [K in keyof T as \`\${Prefix}\${Capitalize<string & K>}\`]: T[K];  // 注意：类型断言会绕过类型检查
};

// 给属性名加后缀
type WithSuffix<T, Suffix extends string> = {  // 定义类型别名 WithSuffix，泛型参数 T, Suffix extends string
  [K in keyof T as \`\${string & K}\${Suffix}\`]: T[K];  // 注意：类型断言会绕过类型检查
};
\`\`\`

#### 事件系统的类型定义

\`\`\`ts
type EventMap = {  // 定义类型别名 EventMap
  click: { x: number; y: number };
  focus: { element: string };
  blur: { element: string };
};

// 自动生成事件处理器类型
type EventHandlers = {  // 定义类型别名 EventHandlers
  [K in keyof EventMap as \`on\${Capitalize<string & K>}\`]: (event: EventMap[K]) => void;  // 箭头函数（注意：类型断言会绕过类型检查）
};
// { onClick: (event: {x: number; y: number}) => void; onFocus: ...; onBlur: ... }
\`\`\`

### 条件类型与映射类型的组合

条件类型和映射类型的组合是 TS 类型编程的最高境界之一。

#### 深层映射

\`\`\`ts
// 深层 Partial
type DeepPartial<T> = {  // 定义类型别名 DeepPartial，泛型参数 T
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

// 深层 Readonly
type DeepReadonly<T> = {  // 定义类型别名 DeepReadonly，泛型参数 T
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};
\`\`\`

#### 条件过滤 + 映射

\`\`\`ts
// 只保留可选的属性
type OptionalKeys<T> = {  // 定义类型别名 OptionalKeys，泛型参数 T
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// 只保留必填的属性
type RequiredKeys<T> = {  // 定义类型别名 RequiredKeys，泛型参数 T
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
\`\`\`

#### 类型层面的递归

\`\`\`ts
// 将嵌套对象的所有属性路径展开为联合类型
type Paths<T> = T extends object  // 定义类型别名 Paths，泛型参数 T
  ? { [K in keyof T]: K extends string
      ? \`\${K}\` | \`\${K}.\${Paths<T[K]>}\`
      : never
    }[keyof T]
  : never;
\`\`\`

### 实战模式

#### 模式一：API 响应包装

\`\`\`ts
// 为 API 响应的 data 字段自动推导类型
type ApiResponse<T> = {  // 定义类型别名 ApiResponse，泛型参数 T
  code: number;
  message: string;
  data: T;
};
type PaginatedResponse<T> = ApiResponse<{  // 定义类型别名 PaginatedResponse，泛型参数 T
  list: T[];
  total: number;
  page: number;
}>;
\`\`\`

#### 模式二：表单类型变换

\`\`\`ts
// 将规则的字段类型变为表单字段类型
type FormField<T> = {  // 定义类型别名 FormField，泛型参数 T
  value: T;
  error: string | null;
  touched: boolean;
};
type FormState<T> = {  // 定义类型别名 FormState，泛型参数 T
  [K in keyof T]: FormField<T[K]>;
};
\`\`\`

#### 模式三：构建器模式

\`\`\`ts
// 确保某个类型的所有属性都被设置
type Builder<T> = {  // 定义类型别名 Builder，泛型参数 T
  [K in keyof T]-?: (value: T[K]) => Builder<T>;  // 箭头函数
} & { build(): T };
\`\`\`

### 陷阱与最佳实践

1. **分布式条件类型只在裸类型参数上触发**：需要阻止分布时用 \`[T] extends [U]\` 包裹。
2. **infer 只能用于 extends 子句的条件类型**：不能在普通类型别名中使用。
3. **同态映射类型保留修饰符，非同态不保留**：如果你需要保留原类型的 readonly/optional 信息，用同态映射。
4. **key remapping 中的 \`never\` 用于过滤**：这是最有用的过滤模式之一。
5. **模板字面量类型里的 \`Capitalize\` 等需要 \`string & K\`**：因为 \`K\` 可能是 \`symbol\` 或 \`number\`，需要交叉 \`string\` 来约束。
6. **深层映射类型可能导致类型"爆炸"**：深层递归类型在复杂对象上会造成 TS 编译器性能问题，谨慎使用。
7. **条件类型链不要过深**：TS 对条件类型的嵌套深度有限制（约 50 层），超深可能导致类型计算超时。

### 本章小结

条件类型和映射类型是 TypeScript 类型系统的"元编程"能力。条件类型让你根据类型做判断和分支，\`infer\` 让你从类型中提取信息；映射类型让你遍历和变换类型属性，key remapping 让你重命名和过滤键；模板字面量类型与映射类型的结合让你生成精确的字符串类型。掌握这些，你就能编写高度抽象和类型安全的代码，让编译器为你自动推导和验证复杂的类型关系。`,

    code: `// ============================================================
// 条件类型与映射类型 —— 代码演示
// ------------------------------------------------------------
// 条件类型和映射类型是纯类型层面的操作，运行时不产生代码。
// 这里用运行时函数模拟类型变换的效果，展示各种模式。
// ============================================================

console.log("========== 1. 条件类型基础 ==========");

// 模拟条件类型：T extends string ? 'yes' : 'no'
function isString(value: any): string {
  if (typeof value === "string") return "yes";
  return "no";
}

console.log("isString('hello') =", isString("hello"));
console.log("isString(42) =", isString(42));
console.log("isString(true) =", isString(true));
console.log("isString([]) =", isString([]));

// 模拟条件类型分发（distributive）
// Exclude<T, U> = T extends U ? never : T
function exclude(values: any[], excluded: any[]): any[] {
  return values.filter(function (v) { return !excluded.includes(v); });
}
console.log("\\nExclude 模拟 (分布式条件类型):");
console.log("  exclude(['a','b','c'], ['a']) =", JSON.stringify(exclude(["a", "b", "c"], ["a"])));
console.log("  exclude([1,2,3,null,undefined], [null,undefined]) =", JSON.stringify(exclude([1, 2, 3, null, undefined], [null, undefined])));

// 阻止分布：包裹在元组中
// [T] extends [U] ? ... : ...
function noDistribution(value: any, check: any): string {
  // 不分开判断，而是整体判断
  if (Array.isArray(value) && Array.isArray(check)) {
    return value.every(function (v) { return check.includes(v); }) ? "all match" : "not all match";
  }
  return "not an array";
}
console.log("\\n阻止分布: [T] extends [U]");
console.log("  noDistribution(['a','b'], ['a','b','c']) =", noDistribution(["a", "b"], ["a", "b", "c"]));

// ============================================================
// 2. infer 关键字模拟
// ============================================================
console.log("\\n========== 2. infer 关键字模拟 ==========");

// 模拟 ReturnType: T extends (...args: any[]) => infer R ? R : any
function getReturnType(fn: Function): string {
  // 运行时无法真正获取 TS 类型，但可以演示概念
  return typeof fn();
}

function add(a: number, b: number): number { return a + b; }
function greet(name: string): string { return "Hello " + name; }
function getConfig(): { port: number; host: string } { return { port: 3000, host: "localhost" }; }

console.log("ReturnType 模拟:");
console.log("  typeof add() =", getReturnType(add));
console.log("  typeof greet() =", getReturnType(greet));
console.log("  结构:", JSON.stringify(getConfig()));

// 模拟 Parameters
function getParamCount(fn: Function): number {
  return fn.length;
}
console.log("\\nParameters 模拟（参数个数）:");
console.log("  add.length =", getParamCount(add));
console.log("  greet.length =", getParamCount(greet));

// 模拟 Flatten: T extends (infer U)[] ? U : T
function flatten<T>(arr: T[]): T {
  return arr[0];
}
console.log("\\nFlatten 模拟 (infer U 提取数组元素):");
console.log("  flatten([1,2,3]) =", flatten([1, 2, 3]));
console.log("  flatten(['a','b']) =", flatten(["a", "b"]));

// 模拟 Awaited: 递归解包 Promise
async function demoAwaited() {
  const p1 = Promise.resolve("hello");
  const p2 = Promise.resolve(Promise.resolve(42));
  const p3 = Promise.resolve(Promise.resolve(Promise.resolve(true)));

  console.log("Awaited 模拟 (递归解包 Promise):");
  console.log("  await Promise<string> =", await p1);
  console.log("  await Promise<Promise<number>> =", await p2);
  console.log("  await Promise<Promise<Promise<boolean>>> =", await p3);
}
demoAwaited();

// ============================================================
// 3. 映射类型基础
// ============================================================
console.log("\\n========== 3. 映射类型基础 ==========");

// 模拟映射类型: { [K in keyof T]: transform(T[K]) }
// Partial: 所有属性变为可选
// Readonly: 所有属性变为只读

const user = {
  name: "张三",
  age: 30,
  email: "zhang@example.com",
  active: true
};

// 模拟 Partial：返回一个新对象，所有属性原样保留
function partial<T extends object>(obj: T): Partial<T> {
  return { ...obj } as Partial<T>;
}

const partialUser = partial(user);
console.log("Partial 模拟:", JSON.stringify(partialUser));
console.log("  Partial 后属性仍存在:", partialUser.name, partialUser.age);

// 模拟 Readonly：用 Object.freeze
function readonly<T extends object>(obj: T): Readonly<T> {
  return Object.freeze({ ...obj }) as Readonly<T>;
}

const readonlyUser = readonly(user);
console.log("\\nReadonly 模拟:", JSON.stringify(readonlyUser));
// 尝试修改（静默失败）
// readonlyUser.name = "test"; // TS 报错
console.log("  Readonly 后 name 不变:", readonlyUser.name);

// 同态映射类型：保留原类型结构
// 模拟 Pick：选取
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const picked = pick(user, ["name", "email"]);
console.log("\\nPick (同态映射) 模拟:", JSON.stringify(picked));

// ============================================================
// 4. Key Remapping（键重映射）
// ============================================================
console.log("\\n========== 4. Key Remapping（键重映射）==========");

// 模拟: { [K in keyof T as \`get\${Capitalize<K>}\`]: () => T[K] }
// 给所有属性名加 get 前缀，值变为 getter 函数
function makeGetters<T extends object>(obj: T): Record<string, () => any> {
  const result: Record<string, () => any> = {};
  for (const key of Object.keys(obj)) {
    const getterKey = "get" + key.charAt(0).toUpperCase() + key.slice(1);
    result[getterKey] = function () { return (obj as any)[key]; };
  }
  return result;
}

const userGetters = makeGetters(user);
console.log("Key Remapping: getter 函数");
console.log("  getName() =", userGetters.getName());
console.log("  getAge() =", userGetters.getAge());
console.log("  getEmail() =", userGetters.getEmail());
console.log("  getActive() =", userGetters.getActive());

// 模拟用 never 过滤键：只保留字符串类型的属性
function pickStringValues<T extends object>(obj: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    if (typeof (obj as any)[key] === "string") {
      result[key] = (obj as any)[key];
    }
  }
  return result;
}

const stringFields = pickStringValues(user);
console.log("\\nKey Remapping + never 过滤（只保留字符串字段）:");
console.log("  ", JSON.stringify(stringFields));

// ============================================================
// 5. 模板字面量类型 + 映射类型
// ============================================================
console.log("\\n========== 5. 模板字面量类型 + 映射类型 ==========");

// 模拟事件处理器类型生成
// EventMap = { click: {x: number; y: number}; focus: {element: string} }
// → { onClick: (e: click) => void; onFocus: (e: focus) => void }

const eventMap = {
  click: { x: 100, y: 200 },
  focus: { element: "input" },
  blur: { element: "input" },
  change: { value: "hello" },
  keydown: { key: "Enter", code: "Enter" }
};

// 模拟模板字面量 + 映射类型生成事件处理器
function makeEventHandlers<E extends Record<string, any>>(events: E): Record<string, Function> {
  const handlers: Record<string, Function> = {};
  for (const key of Object.keys(events)) {
    const handlerKey = "on" + key.charAt(0).toUpperCase() + key.slice(1);
    handlers[handlerKey] = function (event: any) {
      console.log("    事件 " + key + " 触发，数据:", JSON.stringify(event));
    };
  }
  return handlers;
}

const handlers = makeEventHandlers(eventMap);
console.log("模板字面量生成的事件处理器:");
handlers.onClick(eventMap.click);
handlers.onFocus(eventMap.focus);
handlers.onKeydown(eventMap.keydown);

// 展示生成的所有处理器名称
console.log("  生成的处理器:", Object.keys(handlers).join(", "));

// ============================================================
// 6. 条件类型 + 映射类型组合
// ============================================================
console.log("\\n========== 6. 条件类型 + 映射类型组合 ==========");

// 模拟 DeepPartial: 深层可选
function deepPartial<T>(obj: T): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepPartial);
  const result: any = {};
  for (const key of Object.keys(obj as any)) {
    result[key] = deepPartial((obj as any)[key]);
  }
  return result;
}

const nested = {
  user: { name: "张三", profile: { age: 30, city: "北京" } },
  settings: { theme: "dark", notifications: { email: true, push: false } }
};

const deepPartialResult = deepPartial(nested);
console.log("DeepPartial 模拟:", JSON.stringify(deepPartialResult));

// 模拟 DeepReadonly
function deepReadonly<T>(obj: T): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return Object.freeze(obj.map(deepReadonly));
  const result: any = {};
  for (const key of Object.keys(obj as any)) {
    result[key] = deepReadonly((obj as any)[key]);
  }
  return Object.freeze(result);
}

const deepReadonlyResult = deepReadonly(nested);
console.log("\\nDeepReadonly 模拟:", JSON.stringify(deepReadonlyResult));

// ============================================================
// 7. 高级模式：类型安全的路径提取
// ============================================================
console.log("\\n========== 7. 高级模式：类型安全的路径提取 ==========");

// 模拟类型层面的 Paths<T>：提取嵌套对象的所有路径
// 运行时实现简单版本
function getPaths(obj: any, prefix: string = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  const paths: string[] = [];
  for (const key of Object.keys(obj)) {
    const newPrefix = prefix ? prefix + "." + key : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      paths.push(...getPaths(obj[key], newPrefix));
    } else {
      paths.push(newPrefix);
    }
  }
  return paths;
}

const complexObj = {
  user: { name: "张三", address: { city: "北京", zip: "100000" } },
  config: { theme: "dark", lang: "zh" }
};
console.log("Paths 模拟（所有属性路径）:");
console.log("  " + getPaths(complexObj).join(", "));

// ============================================================
// 8. 条件类型分发实战
// ============================================================
console.log("\\n========== 8. 条件类型分发实战 ==========");

// 模拟 NonNullable
function nonNullable<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("值不能为 null 或 undefined");
  }
  return value as NonNullable<T>;
}

console.log("NonNullable 分发:");
console.log("  nonNullable('hello') =", nonNullable("hello"));
console.log("  nonNullable(42) =", nonNullable(42));
try {
  nonNullable(null as any);
} catch (e: any) {
  console.log("  nonNullable(null) 抛出:", e.message);
}

// 模拟 Extract
function extract<T>(values: T[], predicate: (v: T) => boolean): T[] {
  return values.filter(predicate);
}

const mixedValues = ["hello", 42, true, "world", 100, false];
const extractedStrings = extract(mixedValues, function (v) { return typeof v === "string"; });
const extractedNumbers = extract(mixedValues, function (v) { return typeof v === "number"; });
console.log("\\nExtract 模拟:");
console.log("  extract strings:", JSON.stringify(extractedStrings));
console.log("  extract numbers:", JSON.stringify(extractedNumbers));

// ============================================================
// 9. 实现一个运行时类型变换工具库
// ============================================================
console.log("\\n========== 9. 运行时类型变换工具库 ==========");

// 模拟完整的一套类型变换工具
const TypeUtils = {
  // Partial: 所有属性可选
  partial: function <T extends object>(obj: T): Partial<T> {
    return { ...obj } as Partial<T>;
  },

  // Required: 确保所有属性存在
  required: function <T extends object>(obj: T): Required<T> {
    for (const key of Object.keys(obj)) {
      if ((obj as any)[key] === undefined || (obj as any)[key] === null) {
        throw new Error("属性 " + key + " 是必填的但值为 null/undefined");
      }
    }
    return obj as Required<T>;
  },

  // Pick: 选取
  pick: function <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      result[key] = obj[key];
    }
    return result;
  },

  // Omit: 排除
  omit: function <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj } as any;
    for (const key of keys) {
      delete result[key];
    }
    return result;
  },

  // Record: 构造
  record: function <K extends string, V>(keys: K[], factory: (k: K) => V): Record<K, V> {
    const result = {} as Record<K, V>;
    for (const key of keys) {
      result[key] = factory(key);
    }
    return result;
  }
};

const testUser = { name: "张三", age: 30, email: "zhang@example.com" };
console.log("TypeUtils.partial:", JSON.stringify(TypeUtils.partial(testUser)));
console.log("TypeUtils.pick(name,age):", JSON.stringify(TypeUtils.pick(testUser, ["name", "age"])));
console.log("TypeUtils.omit(email):", JSON.stringify(TypeUtils.omit(testUser, ["email"])));
console.log("TypeUtils.record:", JSON.stringify(
  TypeUtils.record(["a", "b", "c"], function (k) { return "值-" + k; })
));

// ============================================================
// 10. 条件类型 + 映射类型速查
// ============================================================
console.log("\\n========== 10. 条件类型 + 映射类型速查 ==========");

const patterns = [
  { name: "条件类型", syntax: "T extends U ? X : Y", use: "类型层面的 if/else" },
  { name: "分布式条件类型", syntax: "T extends U ? X : Y", use: "联合类型逐成员分发" },
  { name: "infer 推断", syntax: "T extends ... infer R ? R : ...", use: "从类型中提取部分类型" },
  { name: "映射类型", syntax: "{ [K in keyof T]: ... }", use: "遍历类型属性并变换" },
  { name: "Key Remapping", syntax: "{ [K in keyof T as NewK]: ... }", use: "重命名/过滤属性键" },
  { name: "模板字面量 + 映射", syntax: "{ [K in keyof T as \`pre\${K}\`]: ... }", use: "生成带前缀的属性名" },
  { name: "条件 + 映射组合", syntax: "映射内用条件类型判断", use: "深层变换、条件过滤" }
];

console.log("模式".padEnd(22) + "语法".padEnd(35) + "用途");
console.log("-".repeat(80));
patterns.forEach(function (p) {
  console.log(p.name.padEnd(22) + p.syntax.padEnd(35) + p.use);
});

console.log("\\n条件类型与映射类型章节演示完成！");`,
  },

  // =========================================================
  // 第四章：声明文件编写
  // =========================================================
  {
    id: "ts2-declaration-files",
    title: "声明文件编写",
    icon: "📄",
    group: "模块与工程化",
    content: `## 声明文件编写

声明文件（\`.d.ts\`）是 TypeScript 与 JavaScript 生态之间的桥梁。当你的 TypeScript 项目需要引用一个纯 JavaScript 库、全局脚本、或是想要为你的 npm 包提供类型支持时，声明文件就是必不可少的工具。本章将系统性地讲解声明文件编写的方方面面——从基础的 \`declare\` 关键字，到模块声明、全局声明、命名空间、三斜线指令，再到 DefinitelyTyped 贡献和发布类型包。

### 声明文件概述

#### 什么是声明文件

声明文件是扩展名为 \`.d.ts\` 的文件，它只包含**类型声明**，不包含任何可执行代码。它的作用是"告诉 TypeScript 编译器某个东西在运行时存在，并且具有这样的类型"。

\`\`\`ts
// my-lib.d.ts
declare function myFunction(x: number): string;
declare const VERSION: string;
declare module 'my-module' {
  export function doStuff(): void;  // 导出函数 doStuff
}
\`\`\`

#### 声明文件的三不原则

1. **不包含实现**：只有函数签名，没有函数体；只有变量声明，没有赋值。
2. **不产生 JS 代码**：编译后 \`.d.ts\` 被完全忽略或仅复制到输出目录。
3. **不改变运行时行为**：声明文件只是"描述"，不参与运行时逻辑。

#### 声明文件存在的形式

声明文件可以出现在多个地方：

| 位置 | 作用范围 | 示例 |
| --- | --- | --- |
| 项目内的 \`.d.ts\` 文件 | 被 tsconfig include 的声明文件 | \`types/globals.d.ts\` |
| \`node_modules/@types/\` | 通过 npm 安装的类型包 | \`@types/node\`, \`@types/lodash\` |
| 库自带的 \`index.d.ts\` | 随 npm 包一起发布 | \`package.json\` 的 \`types\` 字段指向 |
| 内联声明 | 在 \`.ts\` 文件里直接写 \`declare module\` | 为缺少类型的库快速补类型 |

### declare 关键字全面解析

\`declare\` 是声明文件的核心关键字。它的意思是："我声明这个东西存在，但它的实现在别处（运行时环境、另一个 JS 文件、全局脚本等），TS 编译器你不需要检查它的实现，只需要知道它的类型。"

#### declare var / let / const

用于声明全局变量。三者的区别在于：

- \`declare var\`：可变的全局变量
- \`declare let\`：块级作用域的可变全局变量（语义上，声明文件里与 var 类似）
- \`declare const\`：只读的全局常量

\`\`\`ts
// 声明全局变量
declare var __DEV__: boolean;
declare let currentUser: string | null;
declare const API_BASE_URL: string;
declare const VERSION: "1.0.0";  // 可以声明为字面量类型
\`\`\`

#### declare function

声明全局函数。注意函数体以分号结尾，而不是花括号：

\`\`\`ts
declare function greet(name: string): string;
declare function assert(condition: boolean, message?: string): asserts condition;
declare function require(moduleName: string): any;  // 注意：any 关闭了类型检查

// 函数重载
declare function getValue(key: string): string;
declare function getValue(key: number): number;
\`\`\`

#### declare class

声明一个全局可用的类：

\`\`\`ts
declare class Animal {
  constructor(name: string);  // 调用 constructor
  name: string;
  move(distance: number): void;  // 方法声明 move(distance: number)，返回 void
  static create(name: string): Animal;
}
\`\`\`

#### declare enum

声明一个全局枚举（声明文件里的枚举，编译后不会产生 JS 代码）：

\`\`\`ts
declare enum Direction {
  Up = "UP",  // 赋值 Up
  Down = "DOWN",  // 赋值 Down
  Left = "LEFT",  // 赋值 Left
  Right = "RIGHT"  // 赋值 Right
}
\`\`\`

⚠️ 注意：\`declare enum\` 与普通的 \`const enum\` 不同。\`declare enum\` 不产生任何运行时代码，而 \`const enum\` 在 \`isolatedModules: false\` 时会内联其值。

#### declare namespace

声明一个全局命名空间对象。常用于描述那些挂载在 \`window\` 上的老式 JavaScript 库：

\`\`\`ts
declare namespace MyLib {
  const version: string;
  function init(config: Config): void;  // 定义函数 init，参数: config: Config
  interface Config {  // 定义接口 Config
    apiKey: string;
    timeout?: number;
  }
  namespace Utils {  // 定义命名空间 Utils
    function formatDate(date: Date): string;  // 定义函数 formatDate，参数: date: Date
  }
}
\`\`\`

使用方式：
\`\`\`ts
MyLib.init({ apiKey: "abc" });  // 调用 MyLib.init
MyLib.Utils.formatDate(new Date());  // 调用 MyLib.Utils.formatDate
const cfg: MyLib.Config = { apiKey: "xyz" };  // 声明常量 cfg，类型 MyLib.Config
\`\`\`

### declare module：模块声明

模块声明是声明文件中最常用的形式，用于为一个模块（npm 包、本地 JS 文件等）提供类型。

#### 基本模块声明

\`\`\`ts
declare module 'my-awesome-lib' {
  // 命名导出
  export function doSomething(input: string): number;  // 导出函数 doSomething
  export const version: string;  // 导出 const version
  export interface Options {  // 导出接口 Options
    debug: boolean;
    retries: number;
  }

  // 默认导出
  const main: (config: Options) => void;  // 声明常量 main，类型 (config: Options)
  export default main;  // 导出 default main
}
\`\`\`

#### 模块简写

\`\`\`ts
// 所有导入都是 any 类型——不推荐，但可以快速让代码编译通过
declare module 'untyped-lib';
\`\`\`

⚠️ 模块简写是"类型毒药"：一旦使用，该模块的所有导入都是 \`any\`，完全失去类型安全。只在临时过渡时使用，最终应该补充完整类型声明。

#### 通配符模块声明

用于为非 JS 资源（CSS、图片、JSON 等）提供类型：

\`\`\`ts
// 为 CSS 模块声明类型
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;  // 导出 default classes
}

// 为 SCSS 模块声明类型
declare module '*.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;  // 导出 default classes
}

// 为图片声明类型
declare module '*.png' {
  const src: string;
  export default src;  // 导出 default src
}

declare module '*.jpg' {
  const src: string;
  export default src;  // 导出 default src
}

declare module '*.svg' {
  import React from 'react';  // 导入 React
  const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;  // 导出 default SVGComponent
}

// 为 JSON 声明类型
declare module '*.json' {
  const value: any;  // 注意：any 关闭了类型检查
  export default value;  // 导出 default value
}
\`\`\`

#### 模块函数声明

有些模块导出的是一个函数，函数上又挂载了属性和方法：

\`\`\`ts
declare module 'express' {
  import { Server } from 'http';  // 导入 { Server }

  // Express 本身是一个函数，又有很多方法
  function express(): Express;  // 定义函数 express

  namespace express {  // 定义命名空间 express
    interface Express {  // 定义接口 Express
      get(path: string, handler: RequestHandler): void;  // 方法声明 get(path: string, handler: RequestHandler)，返回 void
      listen(port: number, callback?: () => void): Server;  // 箭头函数
    }
    interface RequestHandler {  // 定义接口 RequestHandler
      (req: Request, res: Response, next: NextFunction): void;
    }
    // ... 更多类型
  }

  export = express;  // 赋值 export
}
\`\`\`

### declare global：扩展全局作用域

在**模块文件**（有 import/export 的文件）中，要往全局作用域添加类型，必须用 \`declare global\` 包裹：

\`\`\`ts
// global-augment.d.ts
export {}; // 这个 export 让文件成为模块

declare global {
  // 给 Window 添加自定义属性
  interface Window {  // 定义接口 Window
    __INITIAL_STATE__: Record<string, unknown>;
    analytics: {
      track(event: string, data?: object): void;  // 方法声明 track(event: string, data?: object)，返回 void
    };
  }

  // 给全局添加变量
  const __VERSION__: string;
  var __DEV__: boolean;

  // 给已有的全局类型添加属性
  interface String {  // 定义接口 String
    customMethod(): string;  // 方法声明 customMethod()，返回 string
  }

  // 给 Array 添加方法
  interface Array<T> {  // 定义接口 Array，泛型参数 T
    first(): T | undefined;  // 方法声明 first()，返回 T | undefined
    last(): T | undefined;  // 方法声明 last()，返回 T | undefined
  }
}
\`\`\`

使用：
\`\`\`ts
// 现在这些全局类型随处可用
window.__INITIAL_STATE__;
window.analytics.track('page_view');  // 调用 window.analytics.track
console.log(__VERSION__);  // 控制台输出
[1, 2, 3].first(); // 类型安全
\`\`\`

### 命名空间与声明合并

#### 声明合并（Declaration Merging）

TypeScript 允许同名的 interface、namespace 合并。这是声明文件中最强大的特性之一：

\`\`\`ts
// 原始定义
interface User {  // 定义接口 User
  name: string;
  age: number;
}

// 扩展定义（合并）
interface User {  // 定义接口 User
  email: string; // 合并后 User 有三个字段
}

// 函数与 namespace 合并
function buildURL(path: string): string {  // 定义函数 buildURL，参数: path: string，返回 string
  return buildURL.base + path;  // 返回 buildURL.base + path
}
namespace buildURL {  // 定义命名空间 buildURL
  export let base = "https://api.example.com";  // 导出 let base
  export function setBase(url: string) { base = url; }  // 导出函数 setBase
}
// buildURL 既是函数，又有 base 属性和 setBase 方法
\`\`\`

#### 模块增强（Module Augmentation）

利用声明合并，可以给第三方模块添加类型：

\`\`\`ts
// 原始模块类型
declare module 'vue' {
  interface ComponentOptions {  // 定义接口 ComponentOptions
    // Vue 原始定义...
  }
}

// 你的增强
declare module 'vue' {
  interface ComponentOptions {  // 定义接口 ComponentOptions
    // 添加你的自定义属性
    myCustomOption?: string;
  }
}
\`\`\`

### 三斜线指令

三斜线指令是声明文件的"依赖声明"机制，以 \`///\` 开头，写在文件顶部。

#### /// <reference path="..." />

声明对另一个声明文件的依赖：

\`\`\`ts
/// <reference path="./jquery.d.ts" />
/// <reference path="./lodash.d.ts" />
\`\`\`

作用：告诉编译器，在编译这个文件时，也要把 \`path\` 指向的文件纳入编译上下文。

#### /// <reference types="..." />

声明对某个 \`@types\` 包的依赖：

\`\`\`ts
/// <reference types="node" />
/// <reference types="jest" />
\`\`\`

这在声明文件中特别有用：当你写一个依赖 \`@types/node\` 的声明文件时，可以用它来声明依赖关系。

#### /// <reference lib="..." />

显式引用某个内置 lib 文件：

\`\`\`ts
/// <reference lib="es2017.string" />
/// <reference lib="dom.iterable" />
\`\`\`

### DefinitelyTyped 与 @types 生态

#### DefinitelyTyped 是什么

[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 是 TypeScript 社区维护的一个巨型仓库，为成千上万个流行的 JavaScript 库提供类型声明。这些声明以 \`@types/<包名>\` 的形式发布到 npm。

#### 如何使用 @types

\`\`\`bash
# 安装 Node.js 类型
npm install --save-dev @types/node  # 安装依赖

# 安装测试框架类型
npm install --save-dev @types/jest @types/mocha  # 安装依赖

# 安装库的类型
npm install --save-dev @types/lodash @types/express  # 安装依赖
\`\`\`

#### 如何为 @types 做贡献

如果你使用的库没有 \`@types\` 包，你可以：

1. Fork DefinitelyTyped 仓库
2. 在 \`types/<包名>/\` 目录下创建声明文件
3. 提交 Pull Request

贡献指南：
- 声明文件命名：\`index.d.ts\`
- 必须包含测试文件：\`<包名>-tests.ts\`
- 声明文件不能有 \`export =\` 和 \`export default\` 同时存在
- 遵循 DefinitelyTyped 的 lint 规则

#### 判断库的类型来源

| 场景 | 判断方式 |
| --- | --- |
| 库自带类型 | \`package.json\` 有 \`"types": "index.d.ts"\` 或 \`"typings"\` 字段 |
| 需要安装 @types | \`npm info @types/<包名>\` 查看是否存在 |
| 都没有 | 自己写 \`declare module\` 声明 |

### 发布类型包

如果你用 TypeScript 编写库，需要在发布时包含类型声明：

#### 配置 tsconfig 生成声明

\`\`\`json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "declarationDir": "./dist/types",
    "emitDeclarationOnly": false
  }
}
\`\`\`

#### 配置 package.json

\`\`\`json
{
  "name": "my-ts-lib",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
\`\`\`

### 编写声明文件的最佳实践

#### 1. 精确优于宽泛

\`\`\`ts
// ❌ 不好
declare function doSomething(...args: any[]): any;  // 注意：any 关闭了类型检查

// ✅ 好
declare function doSomething(input: string, options?: { timeout: number }): Promise<Result>;
\`\`\`

#### 2. 使用函数重载而非联合类型

\`\`\`ts
// ❌ 不好：返回值类型不精确
declare function get(key: string | number): string | number;

// ✅ 好：用重载精确关联参数和返回值
declare function get(key: string): string;
declare function get(key: number): number;
\`\`\`

#### 3. 优先使用 interface 而非 type（声明文件中）

interface 支持声明合并，更适合声明文件；type 用于需要联合类型、交叉类型等复杂场景。

#### 4. 使用 readonly 标记不可变属性

\`\`\`ts
declare const config: {
  readonly apiUrl: string;  // 类属性 apiUrl: string
  readonly timeout: number;  // 类属性 timeout: number
};
\`\`\`

#### 5. 为回调函数提供明确的 this 类型

\`\`\`ts
declare function onClick(
  element: HTMLElement,
  callback: (this: HTMLElement, event: MouseEvent) => void  // 箭头函数
): void;
\`\`\`

### 陷阱与注意事项

1. **\`declare module 'x'\` 简写是 any 毒药**：会让所有导入失去类型检查。
2. **\`declare global\` 必须在模块文件内**：没有 import/export 的文件不能使用（本来就是全局的）。
3. **声明文件不要有顶层 import/export**：除非你明确需要模块作用域。全局声明文件应该没有 import/export。
4. **三斜线指令不应在现代项目中使用**：优先用 import 和 tsconfig 的 types 字段。
5. **@types 版本要与主库版本对齐**：主版本号通常对应（lodash@4 → @types/lodash@4）。
6. **\`export =\` 和 \`export default\` 互斥**：一个模块只能使用其中一种。
7. **声明文件中的函数重载顺序重要**：TS 按从上到下的顺序匹配重载，把最具体的签名放在前面。

### 本章小结

声明文件是 TypeScript 与 JavaScript 生态之间的关键桥梁。掌握 \`declare\` 的各种形式（var/let/const/function/class/enum/namespace）、\`declare module\` 模块声明、\`declare global\` 全局扩展、声明合并（Declaration Merging）、三斜线指令、DefinitelyTyped 生态，以及发布类型包的配置，你就能为任何 JS 库补全类型，为团队提供完善的类型支持，在 TypeScript 和 JavaScript 之间自由穿梭。`,

    code: `// ============================================================
// 声明文件编写 —— 代码演示
// ------------------------------------------------------------
// .d.ts 声明文件的内容是纯类型声明，编译后被擦除。
// 这里用真实的 declare 语法（编译期存在，运行时擦除）配合
// 对象字面量模拟运行时值，演示声明文件的编写和使用。
// ============================================================

// ============================================================
// 1. declare module —— 模块声明
// ============================================================
// 以下声明告诉 TS："string-utils" 模块存在且具有以下类型
// 编译后这些声明被完全擦除，运行时由实际 JS 提供值
declare module "string-utils" {
  export function capitalize(s: string): string;
  export function repeat(s: string, n: number): string;
  export function truncate(s: string, maxLen: number): string;
  export const VERSION: string;
  export default function trim(s: string): string;
}

// 同时声明一个带配置选项的模块
declare module "config-lib" {
  export interface Config {
    host: string;
    port: number;
    ssl?: boolean;
    retries?: number;
  }
  export function loadConfig(path: string): Config;
  export function validateConfig(config: Config): boolean;
  export const defaultConfig: Config;
}

console.log("========== 1. declare module 模块声明 ==========");

// 模拟"string-utils"模块的运行时值
const stringUtilsRuntime = {
  capitalize: function (s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  repeat: function (s: string, n: number): string {
    let result = "";
    for (let i = 0; i < n; i++) result += s;
    return result;
  },
  truncate: function (s: string, maxLen: number): string {
    return s.length > maxLen ? s.slice(0, maxLen) + "..." : s;
  },
  VERSION: "2.1.0",
  default: function trim(s: string): string {
    return s.trim();
  }
};

// 模拟 import { capitalize, repeat, VERSION } from 'string-utils'
const { capitalize, repeat: repeatStr, truncate, VERSION: strVersion } = stringUtilsRuntime;
const defaultTrim = stringUtilsRuntime.default;

console.log("capitalize('hello') =", capitalize("hello"));
console.log("repeat('ab', 3) =", repeatStr("ab", 3));
console.log("truncate('long text here', 8) =", truncate("long text here", 8));
console.log("VERSION =", strVersion);
console.log("default trim('  hi  ') =", defaultTrim("  hi  "));

// 模拟 config-lib
const configLibRuntime = {
  defaultConfig: { host: "localhost", port: 3000, ssl: false, retries: 3 },
  loadConfig: function (path: string) {
    console.log("  从 " + path + " 加载配置");
    return { host: "example.com", port: 443, ssl: true, retries: 5 };
  },
  validateConfig: function (config: any): boolean {
    return !!config.host && !!config.port;
  }
};

console.log("\\ndefaultConfig:", JSON.stringify(configLibRuntime.defaultConfig));
console.log("validateConfig(defaultConfig):", configLibRuntime.validateConfig(configLibRuntime.defaultConfig));
const loadedConfig = configLibRuntime.loadConfig("/etc/app/config.json");
console.log("loadConfig 结果:", JSON.stringify(loadedConfig));

// ============================================================
// 2. declare const / var / let —— 全局变量声明
// ============================================================
// 以下告诉 TS 这些全局变量在运行时存在
declare const __APP_VERSION__: string;
declare var __DEV_MODE__: boolean;
declare let __SESSION_ID__: string | null;

// 运行时注入全局变量
(globalThis as any).__APP_VERSION__ = "3.2.0";
(globalThis as any).__DEV_MODE__ = true;
(globalThis as any).__SESSION_ID__ = "sess_abc123";

console.log("\\n========== 2. declare const/var/let 全局声明 ==========");
console.log("__APP_VERSION__ =", __APP_VERSION__);
console.log("__DEV_MODE__ =", __DEV_MODE__);
console.log("__SESSION_ID__ =", __SESSION_ID__);

// ============================================================
// 3. declare function —— 全局函数声明
// ============================================================
declare function globalLog(level: "info" | "warn" | "error", message: string): void;
declare function assert(condition: boolean, message?: string): void;

// 运行时注入
(globalThis as any).globalLog = function (level: string, message: string): void {
  const prefix = "[" + level.toUpperCase() + "]";
  console.log(prefix, message);
};
(globalThis as any).assert = function (condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error("Assertion failed" + (message ? ": " + message : ""));
  }
};

console.log("\\n========== 3. declare function 全局函数声明 ==========");
globalLog("info", "应用启动成功");
globalLog("warn", "磁盘空间不足");
try {
  assert(false, "预期为 true");
} catch (e: any) {
  console.log("assert(false) 捕获:", e.message);
}
assert(true, "这个不会报错");
console.log("assert(true) 通过");

// ============================================================
// 4. declare namespace —— 全局命名空间
// ============================================================
// 模拟一个老式 JS 库挂载在全局
declare namespace MySDK {
  const version: string;
  function init(config: SDKConfig): void;
  function track(event: string, data?: Record<string, unknown>): void;
  interface SDKConfig {
    appId: string;
    debug?: boolean;
    endpoint?: string;
  }
  namespace utils {
    function formatDate(date: Date): string;
    function generateId(): string;
  }
}

// 运行时模拟
(globalThis as any).MySDK = {
  version: "4.0.0",
  init: function (config: any): void {
    console.log("  MySDK 初始化，appId:", config.appId, "debug:", config.debug);
  },
  track: function (event: string, data?: any): void {
    console.log("  [Track]", event, data ? JSON.stringify(data) : "");
  },
  utils: {
    formatDate: function (date: Date): string {
      return date.toISOString().split("T")[0];
    },
    generateId: function (): string {
      return "id_" + Math.random().toString(36).slice(2, 10);
    }
  }
};

console.log("\\n========== 4. declare namespace 全局命名空间 ==========");
console.log("MySDK.version =", MySDK.version);
MySDK.init({ appId: "my-app-001", debug: true });
MySDK.track("page_view", { page: "/home", referrer: "google" });
console.log("MySDK.utils.formatDate:", MySDK.utils.formatDate(new Date("2026-06-29")));
console.log("MySDK.utils.generateId:", MySDK.utils.generateId());

// 使用 namespace 中的 interface 类型
const myConfig: MySDK.SDKConfig = {
  appId: "app-002",
  debug: false,
  endpoint: "https://api.example.com"
};
console.log("SDKConfig 类型:", JSON.stringify(myConfig));

// ============================================================
// 5. declare global —— 扩展全局作用域
// ============================================================
// 在模块中扩展全局类型
declare global {
  interface GlobalConfig {
    appName: string;
    env: "development" | "production" | "test";
    features: string[];
  }
  const GLOBAL_CONFIG: GlobalConfig;
}
export {}; // 让文件成为模块

// 运行时注入
(globalThis as any).GLOBAL_CONFIG = {
  appName: "MyTypeScriptApp",
  env: "development",
  features: ["auth", "logging", "i18n"]
};

console.log("\\n========== 5. declare global 扩展全局 ==========");
console.log("GLOBAL_CONFIG.appName:", GLOBAL_CONFIG.appName);
console.log("GLOBAL_CONFIG.env:", GLOBAL_CONFIG.env);
console.log("GLOBAL_CONFIG.features:", JSON.stringify(GLOBAL_CONFIG.features));

// ============================================================
// 6. 声明合并（Declaration Merging）
// ============================================================
console.log("\\n========== 6. 声明合并 ==========");

// Interface 合并
interface Animal {
  name: string;
  species: string;
}
interface Animal {
  age: number;
  habitat: string;
}
// 合并后 Animal 有 name, species, age, habitat

const tiger: Animal = {
  name: "虎子",
  species: "老虎",
  age: 5,
  habitat: "森林"
};
console.log("interface 合并后的 Animal:", JSON.stringify(tiger));

// namespace 与 function 合并
function createCounter(): number {
  return createCounter.current++;
}
namespace createCounter {
  export let current = 0;
  export function reset() { current = 0; }
  export function getCount() { return current; }
}

console.log("\\nnamespace 与 function 合并:");
console.log("createCounter() =", createCounter());
console.log("createCounter() =", createCounter());
console.log("createCounter() =", createCounter());
console.log("createCounter.getCount() =", createCounter.getCount());
createCounter.reset();
console.log("reset 后 getCount() =", createCounter.getCount());

// ============================================================
// 7. declare module 通配符模式
// ============================================================
console.log("\\n========== 7. 通配符模块声明 ==========");

// 真实写法（.d.ts 中）：
// declare module '*.css' { const css: Record<string,string>; export default css; }
// declare module '*.png' { const src: string; export default src; }
console.log("通配符模块声明用于非 JS 资源:");
console.log("  declare module '*.css' { ... }  → 为 CSS 模块提供类型");
console.log("  declare module '*.png' { ... }  → 为图片提供类型");
console.log("  declare module '*.json' { ... } → 为 JSON 提供类型");

// 模拟：如果有一个 CSS 模块的"运行时值"
const cssModule = {
  container: "container_abc123",
  header: "header_def456",
  button: "button_ghi789"
};
console.log("\\n模拟 CSS 模块类型:");
console.log("  import styles from './app.css'");
console.log("  styles.container →", cssModule.container);
console.log("  styles.header →", cssModule.header);
console.log("  styles.button →", cssModule.button);

// ============================================================
// 8. 声明文件发布配置
// ============================================================
console.log("\\n========== 8. 声明文件发布配置 ==========");

const packageJsonExample = {
  name: "my-ts-lib",
  version: "1.0.0",
  main: "./dist/index.js",
  types: "./dist/types/index.d.ts",
  exports: {
    ".": {
      types: "./dist/types/index.d.ts",
      import: "./dist/index.mjs",
      require: "./dist/index.cjs"
    }
  }
};

console.log("package.json 中的类型配置:");
console.log(JSON.stringify(packageJsonExample, null, 2));
console.log("\\ntsconfig 中的相关配置:");
console.log('  "declaration": true          → 生成 .d.ts');
console.log('  "declarationMap": true       → 生成 .d.ts.map');
console.log('  "declarationDir": "./dist"   → 声明文件输出目录');

// ============================================================
// 9. 三斜线指令
// ============================================================
console.log("\\n========== 9. 三斜线指令 ==========");
// 三斜线指令是编译期指令，运行时被擦除，这里仅展示
console.log("三斜线指令（用于 .d.ts 文件声明依赖）:");
console.log("  /// <reference path=\\"./types.d.ts\\" />   → 依赖另一个声明文件");
console.log("  /// <reference types=\\"node\\" />          → 依赖 @types/node");
console.log("  /// <reference lib=\\"es2020\\" />          → 引用 lib 文件");
console.log("（现代项目多用 import / tsconfig 的 types 替代）");

// ============================================================
// 10. 综合：为 JS 库编写完整声明
// ============================================================
console.log("\\n========== 10. 综合：为 JS 库编写完整声明 ==========");

// 假设有一个 JS 库 "analytics-lib" 的运行时值
const analyticsLibRuntime = {
  init: function (apiKey: string, options?: any): void {
    console.log("  analytics 初始化，apiKey:", apiKey, "options:", JSON.stringify(options || {}));
  },
  track: function (event: string, properties?: Record<string, any>): void {
    console.log("  [analytics]", event, properties ? JSON.stringify(properties) : "");
  },
  identify: function (userId: string, traits?: Record<string, any>): void {
    console.log("  [analytics] identify user:", userId, traits ? JSON.stringify(traits) : "");
  },
  version: "3.1.0",
  default: {
    init: function (apiKey: string) { console.log("  [default] init:", apiKey); },
    track: function (event: string) { console.log("  [default] track:", event); }
  }
};

// 对应的声明文件内容（编译期类型，运行时擦除）
declare module "analytics-lib" {
  export interface AnalyticsOptions {
    debug?: boolean;
    endpoint?: string;
    batchSize?: number;
  }
  export function init(apiKey: string, options?: AnalyticsOptions): void;
  export function track(event: string, properties?: Record<string, unknown>): void;
  export function identify(userId: string, traits?: Record<string, unknown>): void;
  export const version: string;
  export default {
    init(apiKey: string): void;
    track(event: string): void;
  };
}

// 使用（模拟 import）
const analytics = analyticsLibRuntime;
analytics.init("pk_test_abc123", { debug: true, endpoint: "https://analytics.example.com" });
analytics.track("user_signup", { method: "email", referrer: "google" });
analytics.identify("user_456", { name: "张三", plan: "pro" });
console.log("analytics.version =", analytics.version);

console.log("\\n声明文件编写章节演示完成！");`,
  },

  // =========================================================
  // 第五章：tsconfig 完全配置指南
  // =========================================================
  {
    id: "ts2-tsconfig",
    title: "tsconfig 完全配置指南",
    icon: "⚙️",
    group: "模块与工程化",
    content: `## tsconfig 完全配置指南

\`tsconfig.json\` 是 TypeScript 项目的"控制中枢"。它告诉 TypeScript 编译器：编译哪些文件、用什么编译选项、输出到哪里、如何处理模块、是否严格检查等。本章将以前所未有的深度，逐个解析 tsconfig 的每个重要配置项，涵盖 \`compilerOptions\` 的完整字段、\`include\`/\`exclude\`/\`files\` 的文件范围控制、\`extends\` 继承机制、\`references\` 项目引用（复合项目）、增量编译、以及针对不同场景的完整配置模板。

### 顶层字段详解

\`tsconfig.json\` 的顶层可以包含以下字段：

| 字段 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| \`compilerOptions\` | object | 否（但几乎总是有） | 编译选项，最核心的配置 |
| \`include\` | string[] | 否 | 要编译的文件 glob 模式 |
| \`exclude\` | string[] | 否 | 要排除的文件 glob 模式 |
| \`files\` | string[] | 否 | 精确的文件列表（优先级最高） |
| \`extends\` | string | 否 | 继承另一个 tsconfig |
| \`references\` | object[] | 否 | 项目引用（monorepo 场景） |
| \`compileOnSave\` | boolean | 否 | IDE 保存时自动编译 |
| \`watchOptions\` | object | 否 | 监听模式配置 |

### compilerOptions 完整详解

这是 tsconfig 最核心的字段，包含几十个选项。下面按功能分组逐一详解。

#### 语言与环境

**target**：编译产物的 JS 版本。决定哪些语法被降级，哪些保留。可选值从 \`ES3\` 到 \`ESNext\`。\`target: ES2020\` 保留 async/await、可选链、空值合并等；\`target: ES5\` 则转成 generator 和普通函数。

**lib**：指定可用的类型库。Node 项目应设为 \`["ES2022"]\`（不加 DOM，避免误用浏览器 API）；React 项目需要 \`["ES2020", "DOM", "DOM.Iterable"]\`。如果 target 是 ES2020，默认 lib 包含 ES2020 和 DOM。

**module**：编译产物的模块系统。\`CommonJS\` 用 require/module.exports；\`ESNext\` 保留 import/export；\`Node16/NodeNext\` 根据 package.json 的 type 字段决定；\`UMD\` 通用模块；\`Preserve\` 不转换。

**moduleResolution**：模块解析策略。\`node\`(node10) 模仿 Node CommonJS；\`node16/nodenext\` 严格遵循 Node 现代解析；\`bundler\` 专为打包器设计；\`classic\` 已过时。

**jsx**：JSX 处理方式。\`react-jsx\` 是 React 17+ 新 JSX 转换（无需 import React）；\`react\` 转成 React.createElement；\`preserve\` 保留不转换。

#### 严格模式

**strict: true** 是总开关，等价于同时开启以下 8 个子选项：

| 子选项 | 作用 |
| --- | --- |
| \`strictNullChecks\` | null/undefined 不能赋值给其他类型 |
| \`noImplicitAny\` | 禁止隐式 any（参数无类型时报错） |
| \`strictFunctionTypes\` | 函数参数逆变检查 |
| \`strictBindCallApply\` | bind/call/apply 严格类型检查 |
| \`strictPropertyInitialization\` | 类属性必须在构造函数中初始化 |
| \`noImplicitThis\` | this 不能是隐式 any |
| \`alwaysStrict\` | 输出 JS 顶部加 "use strict" |
| \`useUnknownInCatchVariables\` | catch 变量类型为 unknown |

**强烈建议所有新项目开启 strict: true**。对于老项目，可以逐步开启子项来渐进迁移。

#### 输出控制

**outDir**：输出目录，所有编译产物（.js、.d.ts、.js.map）输出到这里。

**rootDir**：源码根目录，控制输出目录结构。TS 默认取所有源文件的公共父目录。设置后，输出目录会保持 rootDir 之后的相对路径。⚠️ 如果源文件散布在 rootDir 之外，编译会报错。

**declaration**：为每个 .ts 生成对应的 .d.ts 声明文件。发布 npm 包时必备。

**declarationMap**：生成 .d.ts.map，让 IDE 跳转到 .ts 源码而非 .d.ts。

**declarationDir**：声明文件的单独输出目录（不设置则和 JS 一起输出到 outDir）。

**sourceMap**：生成 .js.map 源映射文件，便于调试。

**noEmit**：只类型检查，不输出任何文件。适用于打包器项目（转译交给打包器，tsc 只做类型检查）。

**noEmitOnError**：有类型错误时不输出文件。默认 false（有错也输出，便于开发）。

**emitDeclarationOnly**：只生成 .d.ts，不生成 .js。配合打包器场景使用。

**removeComments**：输出时移除注释，减小文件体积。

#### 模块互操作

**esModuleInterop**：允许用 \`import fs from 'fs'\` 默认导入 CommonJS 模块。开启后 TS 在编译产物中插入辅助函数来合成 default 导出。强烈建议开启。

**allowSyntheticDefaultImports**：类型层面允许默认导入（不影响编译产物）。esModuleInterop 开启时自动开启。

**resolveJsonModule**：允许 import .json 文件，并自动推导 JSON 的类型。

**allowJs**：允许编译 .js 文件（配合 checkJs 做类型检查）。

**checkJs**：在 .js 文件里做类型检查（需要 allowJs 开启）。

#### 路径映射

**baseUrl**：非相对路径导入的基准目录。\`baseUrl: "./src"\` 时，\`import 'utils/helper'\` 从 ./src/utils/helper 查找。

**paths**：路径别名映射。\`{"@/*": ["./src/*"]}\` 让 \`import from '@/utils'\` 解析到 \`./src/utils\`。⚠️ paths 只在编译期生效，运行时需要打包器或 tsconfig-paths 配合。

**rootDirs**：虚拟目录合并，让多个源码目录在编译时被视为同一个目录。

#### 工程化

**isolatedModules**：强制每个文件能被独立转译。Babel/esbuild/Vite 等单文件转译器都隐含此约束。开启后不能使用 const enum（降级为普通 enum）、类型重导出必须用 export type。

**skipLibCheck**：跳过 .d.ts 文件的类型检查，大幅提升编译速度。强烈推荐开启——第三方库的类型问题你改不了，检查它们浪费时间。

**forceConsistentCasingInFileNames**：强制文件名大小写一致。在 macOS/Windows 上避免跨平台 bug。

**noUnusedLocals**：报告未使用的局部变量。

**noUnusedParameters**：报告未使用的函数参数。

**noFallthroughCasesInSwitch**：报告 switch 缺少 break 的 fallthrough。

**noImplicitReturns**：报告函数路径缺少 return。

**noUncheckedIndexedAccess**：索引访问时自动添加 undefined（\`arr[0]\` 的类型变为 \`T | undefined\`）。

**noPropertyAccessFromIndexSignature**：禁止用点访问索引签名的属性。

#### 类型包

**types**：限制自动包含的 @types 包。不设置则自动包含所有 node_modules/@types/ 下的包。设置后只包含指定的。

**typeRoots**：自定义 @types 查找目录。默认是 \`["node_modules/@types"]\`。

#### 实验特性

**experimentalDecorators**：开启实验性装饰器语法。Angular/NestJS/TypeORM 等框架依赖此选项。

**emitDecoratorMetadata**：为装饰器成员注入类型元数据（需配合 reflect-metadata 库）。

⚠️ 这两个是实验特性，未来标准装饰器（TC39 Stage 3）落地后可能变化。

#### 增量编译

**incremental**：开启增量编译，保存编译信息到 .tsbuildinfo 文件，下次编译只重编译变化的文件。

**tsBuildInfoFile**：指定 .tsbuildinfo 文件的路径。

**composite**：标记为复合项目（可被其他项目引用）。开启后自动开启 declaration 和 incremental。

### include / exclude / files 详解

**include**：用 glob 模式指定要编译的文件。\`*\` 匹配 0 或多个字符（不含路径分隔符），\`**\` 匹配任意层级目录。默认包含所有 .ts/.tsx/.d.ts。

**exclude**：从 include 匹配的文件中排除。默认排除 node_modules、bower_components、jspm_packages 和 outDir。⚠️ exclude 不能排除被 import 的文件——被 import 的文件即使匹配 exclude 也会被编译。

**files**：精确指定文件列表，优先级高于 include。如果设置了 files，include 和默认的 include 规则都不生效。

### extends 继承机制

\`extends\` 让一个 tsconfig 继承另一个的配置：

\`\`\`json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist" }
}
\`\`\`

继承规则：
- **compilerOptions 浅合并**：子配置覆盖父配置的同名字段，不同名字段合并。
- **include/exclude/files 完全替换**：子配置的完全覆盖父配置，不合并。
- **references 完全替换**：不合并。
- 支持链式继承（A extends B extends C）。
- 支持 extends npm 包中的配置（如 \`"extends": "@tsconfig/node20/tsconfig.json"\`）。

### references 项目引用

项目引用用于 monorepo 场景，把大项目拆成多个子项目：

\`\`\`json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" }
  ],
  "files": []
}
\`\`\`

被引用的子项目必须：\`composite: true\`、有 \`declaration\`、有 \`rootDir\`。

编译用 \`tsc --build\`（或 \`tsc -b\`），它会按依赖拓扑顺序增量编译。

### 增量编译与 composite

**增量编译**（incremental: true）：
- 第一次编译保存 .tsbuildinfo 文件
- 后续编译只重新编译有变化的文件和依赖它的文件
- 大幅提升大型项目的编译速度（通常快 10-50 倍）

**复合项目**（composite: true）：
- 自动开启 declaration 和 incremental
- 要求所有源文件在 rootDir 内
- 必须生成 .d.ts
- 可被其他项目通过 references 引用

### 针对不同场景的完整配置模板

#### Node.js 项目

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "types": ["node"],
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

#### React (Vite) 项目

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
\`\`\`

#### 库（Library）

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
\`\`\`

#### Monorepo 根配置

\`\`\`json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ],
  "files": []
}
\`\`\`

### 陷阱与最佳实践

1. **Node 项目不要带 DOM lib**：否则会误用 window/document 等浏览器 API。
2. **strict 一定要开**：新项目开 strict: true，老项目逐步开启子项迁移。
3. **skipLibCheck 开启**：大幅提速，第三方类型问题你改不了。
4. **paths 必须双端配置**：TS 编译期 + 运行时（打包器 alias 或 tsconfig-paths）。
5. **noEmit 适合打包器项目**：tsc 只做类型检查，转译交给打包器。
6. **isolatedModules 适合现代工具链**：避免 Babel/esbuild 转译不了的写法。
7. **rootDir 控制输出结构**：源文件分布直接影响输出目录的层级。
8. **composite 子项目要求严格**：rootDir 内所有文件、必须生成 declaration。
9. **incremental 的 .tsbuildinfo 文件应加入 .gitignore**：它是构建产物，不应提交。
10. **extends 中 include/exclude 完全替换不合并**：子配置需要显式重新声明 include。

### 本章小结

\`tsconfig.json\` 是 TS 工程化的中枢。掌握 compilerOptions 的完整字段（target/module/lib/strict/moduleResolution/jsx/declaration/sourceMap/noEmit 等）、include/exclude/files 的文件范围控制、extends 继承、references 项目引用、增量编译与 composite 项目，以及针对 Node/React/Library/Monorepo 的配置模板，你就能为任何 TS 项目搭建正确、高效的编译环境。`,

    code: `// ============================================================
// tsconfig 完全配置指南 —— 代码演示
// ------------------------------------------------------------
// tsconfig.json 是配置文件，不是可执行代码。这里用对象字面量
// 构造完整的 tsconfig 配置，逐字段解析，并进行不同场景模板
// 对比。同时尝试读取项目根目录的真实 tsconfig.json。
// ============================================================

const fs = require("fs");
const path = require("path");

// ============================================================
// 1. 构造完整的 tsconfig 对象
// ============================================================
console.log("========== 1. 完整 tsconfig（Node 项目）==========");

const tsconfig = {
  compilerOptions: {
    // 语言与环境
    target: "ES2020",
    module: "CommonJS",
    moduleResolution: "node",
    lib: ["ES2020"],

    // 严格模式
    strict: true,
    // strict: true 等价开启：
    //   strictNullChecks, noImplicitAny, strictFunctionTypes,
    //   strictBindCallApply, strictPropertyInitialization,
    //   noImplicitThis, alwaysStrict, useUnknownInCatchVariables

    // 模块互操作
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,

    // 输出
    outDir: "./dist",
    rootDir: "./src",
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    noEmit: false,
    noEmitOnError: false,
    removeComments: false,

    // 工程化
    isolatedModules: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,

    // 路径映射
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"],
      "@utils/*": ["./src/utils/*"],
      "@components/*": ["./src/components/*"]
    },

    // 类型包
    types: ["node"],

    // 实验特性
    experimentalDecorators: true,
    emitDecoratorMetadata: true
  },
  include: ["src/**/*.ts", "src/**/*.tsx", "types/**/*.d.ts"],
  exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
};

console.log(JSON.stringify(tsconfig, null, 2));

// ============================================================
// 2. 逐字段解析 compilerOptions
// ============================================================
console.log("\\n========== 2. compilerOptions 逐字段解析 ==========");

const options = [
  { key: "target", value: tsconfig.compilerOptions.target, desc: "编译产物 JS 版本，决定语法降级程度" },
  { key: "module", value: tsconfig.compilerOptions.module, desc: "产物模块系统" },
  { key: "moduleResolution", value: tsconfig.compilerOptions.moduleResolution, desc: "模块解析策略" },
  { key: "lib", value: tsconfig.compilerOptions.lib, desc: "可用的类型库，Node 项目不加 DOM" },
  { key: "strict", value: tsconfig.compilerOptions.strict, desc: "严格模式总开关（强烈建议开启）" },
  { key: "esModuleInterop", value: tsconfig.compilerOptions.esModuleInterop, desc: "允许默认导入 CommonJS 模块" },
  { key: "outDir", value: tsconfig.compilerOptions.outDir, desc: "输出目录" },
  { key: "rootDir", value: tsconfig.compilerOptions.rootDir, desc: "源码根目录，控制输出结构" },
  { key: "declaration", value: tsconfig.compilerOptions.declaration, desc: "生成 .d.ts 声明文件" },
  { key: "sourceMap", value: tsconfig.compilerOptions.sourceMap, desc: "生成源映射文件" },
  { key: "isolatedModules", value: tsconfig.compilerOptions.isolatedModules, desc: "强制单文件可独立转译" },
  { key: "skipLibCheck", value: tsconfig.compilerOptions.skipLibCheck, desc: "跳过 .d.ts 检查，大幅提速" },
  { key: "forceConsistentCasingInFileNames", value: tsconfig.compilerOptions.forceConsistentCasingInFileNames, desc: "强制文件名大小写一致" },
  { key: "baseUrl", value: tsconfig.compilerOptions.baseUrl, desc: "路径解析基准目录" },
  { key: "paths", value: tsconfig.compilerOptions.paths, desc: "路径别名映射（仅编译期生效）" },
  { key: "types", value: tsconfig.compilerOptions.types, desc: "限制自动包含的 @types 包" },
  { key: "noEmit", value: tsconfig.compilerOptions.noEmit, desc: "只类型检查，不输出文件" },
  { key: "experimentalDecorators", value: tsconfig.compilerOptions.experimentalDecorators, desc: "开启实验性装饰器" },
  { key: "emitDecoratorMetadata", value: tsconfig.compilerOptions.emitDecoratorMetadata, desc: "注入装饰器类型元数据" }
];

options.forEach(function (item) {
  console.log("  • " + item.key + " = " + JSON.stringify(item.value) + "  → " + item.desc);
});

// ============================================================
// 3. strict 模式子项详解
// ============================================================
console.log("\\n========== 3. strict 模式 8 个子项 ==========");

const strictSubOptions = [
  { name: "strictNullChecks", desc: "null/undefined 不能赋值给其他类型", example: "let s: string = null  // ❌ 报错" },
  { name: "noImplicitAny", desc: "禁止隐式 any", example: "function f(x) {}  // ❌ x 为隐式 any" },
  { name: "strictFunctionTypes", desc: "函数参数逆变检查", example: "防止不安全的函数赋值" },
  { name: "strictBindCallApply", desc: "bind/call/apply 严格类型", example: "fn.call(null, 1) 参数要匹配" },
  { name: "strictPropertyInitialization", desc: "类属性必须初始化", example: "class C { x: number }  // ❌ 未初始化" },
  { name: "noImplicitThis", desc: "this 不能是隐式 any", example: "普通函数里的 this 需标注" },
  { name: "alwaysStrict", desc: "输出 use strict", example: "JS 顶部加 'use strict'" },
  { name: "useUnknownInCatchVariables", desc: "catch 变量为 unknown", example: "catch(e) 中 e 是 unknown" }
];

console.log("strict: true 等价于同时开启以下 8 个子项：");
strictSubOptions.forEach(function (item, i) {
  console.log("  " + (i + 1) + ". " + item.name);
  console.log("     作用: " + item.desc);
  console.log("     示例: " + item.example);
});

// ============================================================
// 4. 不同场景配置模板对比
// ============================================================
console.log("\\n========== 4. 不同场景配置模板 ==========");

// Node.js 项目
const nodeConfig = {
  target: "ES2022", module: "Node16", moduleResolution: "Node16",
  lib: ["ES2022"], strict: true, esModuleInterop: true,
  skipLibCheck: true, forceConsistentCasingInFileNames: true,
  outDir: "./dist", rootDir: "./src", resolveJsonModule: true,
  types: ["node"], declaration: true, sourceMap: true
};
console.log("--- Node.js 项目 ---");
console.log(JSON.stringify(nodeConfig, null, 2));

// React (Vite) 项目
const reactConfig = {
  target: "ES2020", lib: ["ES2020", "DOM", "DOM.Iterable"],
  module: "ESNext", moduleResolution: "bundler", jsx: "react-jsx",
  strict: true, isolatedModules: true, noEmit: true,
  skipLibCheck: true, forceConsistentCasingInFileNames: true,
  baseUrl: ".", paths: { "@/*": ["./src/*"] }
};
console.log("\\n--- React (Vite) 项目 ---");
console.log(JSON.stringify(reactConfig, null, 2));

// 库（Library）
const libConfig = {
  target: "ES2020", module: "ESNext", moduleResolution: "bundler",
  lib: ["ES2020"], strict: true, declaration: true,
  declarationMap: true, sourceMap: true, outDir: "./dist",
  rootDir: "./src", isolatedModules: true, skipLibCheck: true,
  esModuleInterop: true, forceConsistentCasingInFileNames: true
};
console.log("\\n--- 库（Library）---");
console.log(JSON.stringify(libConfig, null, 2));

// ============================================================
// 5. extends 继承配置
// ============================================================
console.log("\\n========== 5. extends 继承 ==========");

const baseConfig = {
  compilerOptions: {
    strict: true, target: "ES2020", module: "ESNext",
    moduleResolution: "bundler", skipLibCheck: true,
    esModuleInterop: true, forceConsistentCasingInFileNames: true
  }
};

const childConfig = {
  extends: "./tsconfig.base.json",
  compilerOptions: { outDir: "./dist", rootDir: "./src" },
  include: ["src"]
};

console.log("--- 基础配置 tsconfig.base.json ---");
console.log(JSON.stringify(baseConfig, null, 2));
console.log("\\n--- 子配置 tsconfig.json（extends 基础配置）---");
console.log(JSON.stringify(childConfig, null, 2));
console.log("\\n继承规则：compilerOptions 浅合并；include/exclude/files 完全替换");

// ============================================================
// 6. references 项目引用
// ============================================================
console.log("\\n========== 6. references 项目引用 ==========");

const rootRefConfig = {
  references: [
    { path: "./packages/shared" },
    { path: "./packages/server" },
    { path: "./packages/client" }
  ],
  files: []
};

const sharedConfig = {
  compilerOptions: {
    composite: true, declaration: true,
    outDir: "./dist", rootDir: "./src"
  },
  include: ["src"]
};

const serverConfig = {
  compilerOptions: { outDir: "./dist", rootDir: "./src" },
  references: [{ path: "../shared" }],
  include: ["src"]
};

console.log("--- 根 tsconfig.json ---");
console.log(JSON.stringify(rootRefConfig, null, 2));
console.log("\\n--- packages/shared/tsconfig.json（composite）---");
console.log(JSON.stringify(sharedConfig, null, 2));
console.log("\\n--- packages/server/tsconfig.json（引用 shared）---");
console.log(JSON.stringify(serverConfig, null, 2));
console.log("\\n编译命令：tsc --build（按依赖拓扑顺序增量编译）");

// ============================================================
// 7. 增量编译概念
// ============================================================
console.log("\\n========== 7. 增量编译 ==========");

const incrementalConfig = {
  compilerOptions: {
    incremental: true,
    tsBuildInfoFile: "./dist/.tsbuildinfo",
    composite: true,
    declaration: true,
    outDir: "./dist",
    rootDir: "./src"
  }
};

console.log("增量编译配置:");
console.log(JSON.stringify(incrementalConfig, null, 2));
console.log("\\n增量编译工作原理:");
console.log("  1. 首次编译：保存编译图谱到 .tsbuildinfo");
console.log("  2. 后续编译：对比文件修改时间，只重编译改变的文件");
console.log("  3. 速度提升：大型项目通常快 10-50 倍");
console.log("  ⚠️ .tsbuildinfo 应加入 .gitignore");

// ============================================================
// 8. 模块解析策略对比
// ============================================================
console.log("\\n========== 8. 模块解析策略对比 ==========");

const strategies = [
  { name: "classic", desc: "最古老，不考虑 node_modules", target: "遗留项目" },
  { name: "node (node10)", desc: "模拟 Node CommonJS 解析", target: "旧 Node 项目" },
  { name: "node16/nodenext", desc: "严格遵循 Node 现代解析，ESM 需扩展名", target: "现代 Node ESM 项目" },
  { name: "bundler", desc: "结合 node 便利性与打包器特性", target: "Vite/webpack/esbuild" }
];

strategies.forEach(function (s) {
  console.log("  • " + s.name + " → " + s.desc + "（适用：" + s.target + "）");
});

// ============================================================
// 9. 尝试读取真实 tsconfig.json
// ============================================================
console.log("\\n========== 9. 读取项目真实 tsconfig.json ==========");

const tsconfigPath = path.join(__dirname, "tsconfig.json");
console.log("查找路径: " + tsconfigPath);

try {
  const content = fs.readFileSync(tsconfigPath, "utf8");
  console.log("✅ 找到 tsconfig.json:");
  try {
    const parsed = JSON.parse(content);
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.log(content);
  }
} catch (e: any) {
  console.log("ℹ️ 当前项目没有 tsconfig.json");
  console.log("   原因: " + e.message);
  console.log("   这是一个纯 JavaScript 的 Next.js 项目，不需要 tsconfig.json。");
  console.log("   上面展示的完整配置就是典型 Node 项目的 tsconfig 示例。");
}

// ============================================================
// 10. compilerOptions 速查表
// ============================================================
console.log("\\n========== 10. compilerOptions 重要选项速查表 ==========");

const quickRef = [
  { category: "语言环境", options: "target, lib, module, moduleResolution, jsx" },
  { category: "严格模式", options: "strict, strictNullChecks, noImplicitAny, strictFunctionTypes" },
  { category: "输出控制", options: "outDir, rootDir, declaration, sourceMap, noEmit" },
  { category: "模块互操作", options: "esModuleInterop, resolveJsonModule, allowJs" },
  { category: "路径映射", options: "baseUrl, paths, rootDirs" },
  { category: "工程化", options: "isolatedModules, skipLibCheck, incremental" },
  { category: "类型包", options: "types, typeRoots" },
  { category: "实验特性", options: "experimentalDecorators, emitDecoratorMetadata" }
];

console.log("分类".padEnd(16) + "关键选项");
console.log("-".repeat(60));
quickRef.forEach(function (item) {
  console.log(item.category.padEnd(16) + item.options);
});

console.log("\\ntsconfig 完全配置指南章节演示完成！");`,
  },
];