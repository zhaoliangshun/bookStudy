// =============================================================
// TypeScript 交互式教程 —— 第四批章节（共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-modules      — 模块与命名空间
//   2. ts-decorators   — 装饰器 (Decorators)
//   3. ts-tsconfig     — tsconfig 配置
//   4. ts-declaration  — 声明文件与实战
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
//     setImmediate, URL, URLSearchParams, TextEncoder, TextDecoder,
//     Promise, __dirname, __filename, require, module, exports
//   - V8 内置对象(globalThis/Reflect/JSON/Math/Date/Map/Set/WeakMap
//     等)在 vm 上下文中也可用
//   - 沙箱不能 require 本地文件，所以"模块"相关 demo 用对象字面量
//     + 自制 require 注册表来模拟模块系统；namespace 用真实语法
//   - 装饰器章节用真实装饰器语法(experimentalDecorators 已开启)
//   - tsconfig 章节用对象字面量构造配置并 JSON.stringify 打印，
//     并用 fs 尝试读取项目根目录的 tsconfig.json(本项目是纯 JS
//     的 Next.js 项目，可能不存在，用 try/catch 兜底)
//   - 声明文件章节用 declare module/declare const 等真实语法(转译后
//     被擦除)，再用对象字面量模拟运行时值来演示使用效果
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：模块与命名空间 (Modules & Namespaces)
  // =========================================================
  {
    id: "ts-modules",
    title: "模块与命名空间",
    icon: "📦",
    group: "工程化",
    content: `## 模块与命名空间 (Modules & Namespaces)

模块是组织大型 TypeScript 代码库的核心机制。随着项目规模增长，把所有代码塞进一个文件既不可读也无法维护——你需要把代码拆分成多个文件，每个文件负责一块独立的功能，再通过"导入/导出"把它们组装起来。这正是模块系统要解决的问题。

TypeScript 在模块这块几乎完全沿用 JavaScript 的 **ES Modules** 标准（\`export\` / \`import\`），并在其上叠加了"类型导出"等类型系统特性。除了 ES Modules，TypeScript 历史上还有一套"命名空间（namespace）"机制，它是 ES Modules 普及前的旧方案，现在官方明确建议**避免使用 namespace，改用 ES Modules**，但你在阅读老代码或类型声明文件时仍会遇到它，因此有必要理解。

本章将极其详细地讲解：ES Modules 的导出与导入、命名导出与默认导出、重命名导入、命名空间导入、类型导出、动态导入、命名空间、模块解析策略、路径映射、三斜线指令，以及 TS 与 CommonJS 的互操作。每一节都会讲原理、举例子、列陷阱。

### 模块系统概览

#### 什么是模块

在 TypeScript/JavaScript 中，**一个文件就是一个模块**（前提是文件里有顶层的 \`import\` 或 \`export\`）。模块拥有自己独立的作用域——模块里声明的变量、函数、类、类型默认都是"私有"的，外部无法直接访问。要对外暴露，必须用 \`export\` 显式导出；要使用别的模块的东西，必须用 \`import\` 显式导入。

这与传统的"全局脚本"截然不同。在脚本（非模块）文件里，顶层的 \`var\` 声明会污染全局作用域；而在模块里，顶层声明是模块私有的，不会泄漏到全局。这是模块系统的第一原则：**封装**。

\`\`\`ts
// math.ts —— 这是一个模块（因为有顶层 export）
export function add(a: number, b: number): number {  // 导出函数 add
  return a + b;  // 返回 a + b
}
// subtract 没有导出，是模块私有的，外部访问不到
function subtract(a: number, b: number): number {  // 定义函数 subtract，参数: a: number, b: number，返回 number
  return a - b;  // 返回 a - b
}
\`\`\`

#### 内部模块 vs 外部模块（历史）

早期 TypeScript（1.5 之前）有两种"模块"：

- **内部模块（Internal Modules）**：用 \`module\` 或 \`namespace\` 关键字声明，用于在同一文件内（或跨文件通过 \`/// <reference>\`）组织代码。1.5 之后改名为"命名空间（namespace）"。
- **外部模块（External Modules）**：就是文件级别的模块，对应现在的 ES Modules。

现在的术语里，"模块"专指外部模块（文件级模块），"命名空间"专指 \`namespace\`。官方推荐一律用模块，namespace 只在少数场景（如声明文件里为旧库补充类型）还有用武之地。

| 概念 | 关键字 | 作用域 | 推荐度 |
| --- | --- | --- | --- |
| 模块（外部模块） | \`export\` / \`import\` | 文件级，独立 | ✅ 强烈推荐 |
| 命名空间（内部模块） | \`namespace\` | 文件内/全局 | ⚠️ 避免新代码使用 |

### ES Modules 基础：导出

ES Modules 提供两种导出方式：**命名导出（Named Export）** 和 **默认导出（Default Export）**。一个模块可以同时拥有任意多个命名导出和**至多一个**默认导出。

#### 命名导出

命名导出是最常用的方式。你可以在声明的同时导出，也可以先声明再统一导出。

\`\`\`ts
// ===== 方式一：声明时直接导出 =====
export const PI = 3.14159;  // 导出 const PI
export function add(a: number, b: number): number {  // 导出函数 add
  return a + b;  // 返回 a + b
}
export class Calculator {  // 导出类 Calculator
  /* ... */
}
export type Point = { x: number; y: number };  // 导出类型 Point
export interface Logger {  // 导出接口 Logger
  log(msg: string): void;  // 方法声明 log(msg: string)，返回 void
}

// ===== 方式二：先声明，再用 export { } 统一导出 =====
function multiply(a: number, b: number): number {  // 定义函数 multiply，参数: a: number, b: number，返回 number
  return a * b;  // 返回 a * b
}
function divide(a: number, b: number): number {  // 定义函数 divide，参数: a: number, b: number，返回 number
  return a / b;  // 返回 a / b
}
export { multiply, divide };  // 导出成员
\`\`\`

命名导出的好处是**明确、可命名、便于自动补全**。导入方必须用**完全相同的名字**（或用 \`as\` 重命名），IDE 能精确地追踪每个导出的来源。

#### 默认导出

默认导出用 \`export default\`，每个模块**只能有一个**默认导出。它常用于"这个模块的主要功能"——比如一个工具模块默认导出它的核心类。

\`\`\`ts
// 默认导出一个函数
export default function square(x: number): number {  // 导出函数 square
  return x * x;  // 返回 x * x
}

// 默认导出一个类
export default class Person {  // 导出类 Person
  constructor(public name: string) {}  // 调用 constructor
}

// 默认导出一个值
const config = { timeout: 5000 };  // 声明常量 config
export default config;  // 导出 default config
\`\`\`

默认导出的特点：

1. **导入时可以任意命名**：因为默认导出没有"名字"，导入方自己起名。
2. **每个模块只能有一个默认导出**。
3. **导入语法不同**：默认导入不用花括号，命名导入用花括号。

#### 命名导出 vs 默认导出

这是 TS/JS 社区长期争论的话题。两种风格各有优劣：

| 对比项 | 命名导出 | 默认导出 |
| --- | --- | --- |
| 导入是否需要花括号 | 需要 \`import { add }\` | 不需要 \`import add\` |
| 导入时能否重命名 | 用 \`as\` 重命名 | 直接起任意名字 |
| 重构安全性 | ✅ 改名会同步影响导入 | ❌ 改名不影响导入名，易脱节 |
| IDE 自动导入 | ✅ 名字精确匹配 | ⚠️ 需要猜测默认名 |
| 每模块数量 | 任意多个 | 至多一个 |
| 是否便于 tree-shaking | ✅ 明确 | ⚠️ 略差 |
| 适合场景 | 工具函数库、多入口 | 单一主功能的模块 |

**最佳实践**：优先使用命名导出。它更利于重构、自动补全和静态分析。默认导出适合"一个模块就是一个东西"的场景（比如 React 组件文件、一个类）。许多团队规范甚至完全禁用默认导出。

### import 的各种形式

#### 默认导入

\`\`\`ts
// 导入默认导出（名字自定，无需花括号）
import square from './math';  // 导入 square
import Person from './person';  // 导入 Person
\`\`\`

#### 命名导入

\`\`\`ts
// 导入命名导出（名字必须与导出一致，用花括号）
import { add, PI } from './math';  // 导入 { add, PI }
\`\`\`

#### 重命名导入 import { x as y }

如果想避免命名冲突，或想让名字更符合当前上下文，可以用 \`as\` 重命名：

\`\`\`ts
import { add as plus, PI as PI_VALUE } from './math';  // 导入 { add as plus, PI as PI_VALUE }（注意：类型断言会绕过类型检查）
// 之后用 plus、PI_VALUE，而不是 add、PI
\`\`\`

这在你同时引入两个模块的同名导出时特别有用：

\`\`\`ts
import { open as openFile } from './file-utils';  // 导入 { open as openFile }（注意：类型断言会绕过类型检查）
import { open as openModal } from './modal-utils';  // 导入 { open as openModal }（注意：类型断言会绕过类型检查）
\`\`\`

#### 命名空间导入 import * as ns

把一个模块的所有命名导出作为一个对象导入：

\`\`\`ts
import * as MathUtils from './math';  // 导入 * as MathUtils（注意：类型断言会绕过类型检查）
MathUtils.add(1, 2);  // 调用 MathUtils.add
MathUtils.PI;
\`\`\`

注意：命名空间导入得到的是一个**只读的命名空间对象**，不能给它赋值（\`MathUtils = {}\` 会报错），也不能修改它的属性。另外，默认导出**不会**出现在命名空间对象里——要拿默认导出得用 \`import ns from\` 或 \`import { default as ns }\`。

⚠️ **陷阱**：\`import * as ns\` 与 CommonJS 互操作时有坑。如果被导入的是 CommonJS 模块，\`ns\` 会被合成成 \`{ default: module.exports, ...module.exports 的命名属性 }\`（在 \`esModuleInterop\` 开启时）。行为取决于配置，容易踩坑，后面互操作一节详述。

#### 混合导入（默认 + 命名）

\`\`\`ts
// 同时导入默认导出和命名导出
import square, { add, multiply } from './math';  // 导入 square, { add, multiply }
// square 是默认导出，add/multiply 是命名导出
\`\`\`

#### 副作用导入 import 'xxx'

不绑定任何名字，只为了执行模块的副作用（如注册全局 polyfill、加载 CSS）：

\`\`\`ts
import './polyfill';        // 执行该模块代码，但不导入任何名字
import 'reflect-metadata'; // 引入装饰器元数据支持
\`\`\`

### 类型导出 export type / import type

TypeScript 区分**值**和**类型**。函数、类、变量、枚举既是值也是类型；而 \`interface\`、\`type\` 别名纯粹是类型，运行时不存在。

\`export type\` 用于**只导出类型**，\`import type\` 用于**只导入类型**。它们在编译后会被完全擦除，不产生任何运行时代码。

\`\`\`ts
// types.ts
export type Point = { x: number; y: number };  // 导出类型 Point
export interface Logger { log(msg: string): void }  // 导出接口 Logger

// 也可以从别的模块"再导出"类型
export type { Result } from './result';
\`\`\`

\`\`\`ts
// consumer.ts
import type { Point, Logger } from './types';  // 导入 type { Point, Logger }
// Point 和 Logger 只能用在类型位置，运行时不存在
const p: Point = { x: 1, y: 2 };  // 声明常量 p，类型 Point
\`\`\`

#### 为什么要用 export type / import type

1. **isolatedModules 兼容**：当开启 \`isolatedModules\`（Babel、esbuild、Vite 等单文件转译器都隐含此约束）时，如果一个 \`export { Foo }\` 既是值又是类型，转译器无法判断该不该擦除，会报错。用 \`export type { Foo }\` 明确告诉它"这是纯类型，请擦除"。
2. **明确意图**：让读代码的人知道这个导入只用于类型，不会产生运行时依赖。
3. **利于 tree-shaking**：打包器能确定这些导入没有运行时副作用。

\`\`\`ts
// ⚠️ isolatedModules 下，interface 的重导出必须用 export type
export type { Logger } from './types'; // ✅
// export { Logger } from './types';   // ❌ 报错：Logger 只是类型
\`\`\`

#### 值与类型的混合导出

一个模块可以同时导出值和类型，导入时也可以混合：

\`\`\`ts
import { add, type Point } from './math';  // 导入 { add, type Point }
// add 是值，Point 是类型（编译后被擦除，add 保留）
\`\`\`

这种内联 \`type\` 修饰符是 TS 4.5+ 引入的，能在一次 import 里区分值导入和类型导入，非常实用。

### 动态导入 import()

静态 \`import\` 在编译期就确定了依赖关系，且会被提升到模块顶部。但有时你希望**运行时按需加载**模块——比如一个重型计算库只在用户点了某个按钮后才需要，或者要根据配置决定加载哪个模块。这时用动态导入 \`import()\`。

\`\`\`ts
// import() 返回一个 Promise，异步加载模块
const moduleRef = await import('./heavy-lib');  // 声明常量 moduleRef
moduleRef.doHeavyWork();  // 调用 moduleRef.doHeavyWork

// 也可以用 .then
import('./heavy-lib').then((mod) => {  // 箭头函数
  mod.doHeavyWork();  // 调用 mod.doHeavyWork
});
\`\`\`

#### 动态导入的典型用途

| 场景 | 说明 |
| --- | --- |
| 按需加载 | 路由级代码分割、懒加载大组件 |
| 条件加载 | 根据运行时环境加载不同实现（如 web/worker） |
| 规避循环依赖 | 把强耦合的导入推迟到使用时 |
| 插件系统 | 运行时根据名字加载插件模块 |

#### 动态导入的注意事项

1. \`import()\` 的参数通常是**字符串字面量**，打包器靠它做静态分析。如果你用变量（\`import(name)\`），打包器可能无法分析，会退化成"运行时解析"。
2. 动态导入返回的是**模块命名空间对象**（类似 \`import * as\`），默认导出在 \`.default\` 上。
3. 动态导入是异步的，要用 \`await\` 或 \`then\`。

### 命名空间 namespace

命名空间是 TS 早期的代码组织方式，用 \`namespace\` 关键字声明。它本质上是一个**编译期生成的全局/局部对象**，把一组相关的类型和值装进一个命名的作用域里。

#### 基本语法

\`\`\`ts
namespace Geometry {  // 定义命名空间 Geometry
  export const PI = 3.14159;        // 用 export 暴露
  export function area(r: number) {  // 不 export 就是私有的
    return PI * r * r;  // 返回 PI * r * r
  }
  export interface Point {           // 也可以装类型
    x: number;
    y: number;
  }
}

// 使用
Geometry.area(5);  // 调用 Geometry.area
Geometry.PI;
const p: Geometry.Point = { x: 1, y: 2 };  // 声明常量 p，类型 Geometry.Point
\`\`\`

编译后，namespace 变成一个立即调用函数表达式（IIFE），生成一个对象：

\`\`\`js
var Geometry;
(function (Geometry) {
  Geometry.PI = 3.14159;  // 赋值 Geometry.PI
  function area(r) { return Geometry.PI * r * r; }  // 定义函数 area，参数: r
  Geometry.area = area;  // 赋值 Geometry.area
})(Geometry || (Geometry = {}));
\`\`\`

#### 嵌套命名空间

命名空间可以嵌套，形成层级结构：

\`\`\`ts
namespace App {  // 定义命名空间 App
  export namespace Utils {  // 导出 namespace Utils
    export function formatDate(d: Date): string {  // 导出函数 formatDate
      return d.toISOString();  // 返回 d.toISOString()
    }
  }
  export namespace Config {  // 导出 namespace Config
    export const version = '1.0.0';  // 导出 const version
  }
}

App.Utils.formatDate(new Date());  // 调用 App.Utils.formatDate
App.Config.version;
\`\`\`

#### 命名空间合并

同名的命名空间会**合并**——你可以跨文件（甚至同文件）多次声明同一个 namespace，它们的内容会拼到一起：

\`\`\`ts
namespace Validator {  // 定义命名空间 Validator
  export function isString(x: unknown): x is string {  // 自定义类型守卫（返回 x is T）
    return typeof x === 'string';  // 类型守卫：判断是否为 string
  }
}
namespace Validator {  // 定义命名空间 Validator
  export function isNumber(x: unknown): x is number {  // 自定义类型守卫（返回 x is T）
    return typeof x === 'number';  // 类型守卫：判断是否为 number
  }
}
// 合并后 Validator 既有 isString 也有 isNumber
Validator.isString('a');  // 调用 Validator.isString
Validator.isNumber(1);  // 调用 Validator.isNumber
\`\`\`

#### namespace vs module 对比

| 对比项 | namespace | 模块 (ES Modules) |
| --- | --- | --- |
| 作用域 | 全局或文件内对象 | 文件级独立作用域 |
| 导入方式 | 直接用名字或 \`/// reference\` | \`import\` 语句 |
| 编译产物 | IIFE 对象 | require/exports |
| 依赖管理 | 弱（依赖全局/合并） | 强（显式 import） |
| Tree-shaking | ❌ 困难 | ✅ 友好 |
| 现代推荐 | ❌ 避免新代码使用 | ✅ 首选 |

**结论**：新代码一律用模块。namespace 主要在声明文件（.d.ts）里为老式全局库补充类型时还有用。

### 模块解析策略

当你在代码里写 \`import { add } from './math'\`，TypeScript 需要知道 \`./math\` 实际对应磁盘上的哪个文件。这个查找过程叫**模块解析（Module Resolution）**。解析策略由 \`moduleResolution\` 选项控制。

#### classic 策略

最古老的策略，基本只考虑 \`.ts\` / \`.tsx\` / \`.d.ts\` 扩展名，不关心 \`node_modules\`。现代项目几乎不用。

#### node (node10) 策略

模仿 Node.js 的 CommonJS 解析逻辑。对于相对路径 \`./math\`：

1. 尝试 \`./math.ts\`、\`./math.tsx\`、\`./math.d.ts\`
2. 尝试 \`./math/package.json\` 里的 \`types\` 字段
3. 尝试 \`./math/index.ts\` 等目录默认文件

对于裸模块名 \`lodash\`：

1. 在 \`./node_modules/lodash.ts\` 等查找
2. 逐级向上目录的 \`node_modules\` 查找
3. 查找 \`@types/lodash\` 类型声明

#### node16 / nodenext 策略

严格遵循 Node.js 现代解析规则（支持 ESM、\`exports\` 字段、强制扩展名等）。这是 TS 4.7+ 引入的、面向未来的策略。它要求 ESM 模块导入时写全扩展名（\`import x from './math.js'\`），更接近 Node 真实行为。

#### bundler 策略

TS 5.0 引入，针对 Vite/esbuild/webpack 等打包器场景：结合了 \`node\` 的便利性和打包器对扩展名/路径别名的宽松处理。如果你的项目用打包器且不输出 Node 可执行代码，推荐 \`bundler\`。

| 策略 | 适用场景 | 是否要求扩展名 | 支持 exports 字段 |
| --- | --- | --- | --- |
| classic | 遗留 | 否 | 否 |
| node (node10) | 旧 Node CommonJS | 否 | 部分 |
| node16/nodenext | 现代 Node | ESM 要求 | 是 |
| bundler | 打包器项目 | 否 | 是 |

### 路径映射 paths / baseUrl

大型项目里，深层嵌套的相对路径（\`import { x } from '../../../../utils'\`）既难写又难维护。TS 提供 \`paths\` 选项做路径别名映射。

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@utils/*": ["./src/utils/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
\`\`\`

之后就能写：

\`\`\`ts
import { add } from '@utils/math';  // 导入 { add }
import Button from '@components/Button';  // 导入 Button
\`\`\`

⚠️ **陷阱**：\`paths\` 只是 TS 编译期的解析规则，**运行时（Node/打包器）并不知道这些别名**。你需要在运行时也配置对应的别名解析：

- Node：用 \`tsconfig-paths\` 或 \`module-alias\`
- 打包器（webpack/vite/esbuild）：各自配置 alias
- 否则运行时会报 \`Cannot find module '@utils/math'\`

\`baseUrl\` 是路径映射的"基准目录"，TS 解析非相对路径时也会先从 \`baseUrl\` 找起。设置 \`paths\` 不一定要设 \`baseUrl\`（TS 4.1+ 起 paths 可独立工作）。

### 三斜线指令

三斜线指令（Triple-Slash Directives）是 TS 早期的依赖声明方式，以 \`///\` 开头，单行写在文件顶部。它在 ES Modules 普及前用于声明文件间的依赖。现在主要在 .d.ts 文件里还能见到。

#### /// <reference path="..." />

告诉编译器"本文件依赖另一个文件"，编译时把那个文件也纳入。

\`\`\`ts
/// <reference path="./types.d.ts" />
/// <reference path="./utils.ts" />
\`\`\`

#### /// <reference types="..." />

声明对某个 \`@types\` 包的依赖（类似于隐式 \`import 'node'\`）。

\`\`\`ts
/// <reference types="node" />
\`\`\`

#### /// <reference lib="..." />

显式引用某个 lib（如 \`es2020\`、\`dom\`）：

\`\`\`ts
/// <reference lib="es2017.string" />
\`\`\`

⚠️ 现代 ES Modules 项目基本不需要三斜线指令，用 \`import\` / \`tsconfig\` 的 \`types\` / \`lib\` 选项替代即可。它主要保留给 .d.ts 文件使用。

### 与 CommonJS 的互操作

Node.js 生态有大量 CommonJS 模块（\`module.exports\` / \`require\`）。TS/ES Modules 与 CommonJS 的互操作是工程实践中绕不开的话题，也是最容易踩坑的地方。

#### CommonJS 基础

\`\`\`js
// CommonJS 模块
module.exports = { add: function (a, b) { return a + b; } };  // 赋值 module.exports
// 或
exports.add = function (a, b) { return a + b; };  // 赋值 exports.add

// 导入
const math = require('./math');  // 声明常量 math
math.add(1, 2);  // 调用 math.add
\`\`\`

\`module.exports\` 是整个模块的导出对象，\`exports\` 是它的别名（初始时）。\`require\` 同步加载并返回该对象。

#### esModuleInterop

当 \`module: CommonJS\` 时，TS 把 \`import\` 编译成 \`require\`。但 ES Modules 的默认导入语义和 CommonJS 不完全一致：

- ES Modules：\`import x from 'cjs-module'\` 等价于 \`import { default as x } from ...\`，期望模块有 \`default\` 导出。
- CommonJS：\`module.exports\` 是整个对象，没有 \`default\` 概念。

\`esModuleInterop: true\` 让 TS 在编译时**合成**一个 \`default\` 属性：把 CommonJS 的 \`module.exports\` 包装成 \`{ default: module.exports, ...module.exports 的命名属性 }\`，从而允许 \`import x from 'cjs'\` 拿到整个 \`module.exports\`。

\`\`\`ts
// esModuleInterop: true 时
import fs from 'fs';           // ✅ 可以这样默认导入
import * as fs from 'fs';      // ✅ 命名空间导入也行
import { readFileSync } from 'fs'; // ✅ 命名导入

// esModuleInterop: false 时
import * as fs from 'fs';      // ✅
import fs = require('fs');     // ✅ 要用 import = 语法
// import fs from 'fs';        // ❌ 报错：fs 没有 default 导出
\`\`\`

#### allowSyntheticDefaultImports

\`allowSyntheticDefaultImports: true\` 只影响**类型检查**——允许你在类型层面写 \`import x from 'cjs'\` 而不报错，但不影响编译产物。\`esModuleInterop\` 开启时会自动开启它。

#### import = 和 export = 语法

TS 特有的、专门为 CommonJS 互操作设计的语法：

\`\`\`ts
// import = 等价于 require
import fs = require('fs');  // 导入模块

// export = 等价于 module.exports =
export = function add(a: number, b: number) {  // 赋值 export
  return a + b;  // 返回 a + b
};
\`\`\`

#### 互操作陷阱表

| 陷阱 | 说明 | 解决 |
| --- | --- | --- |
| 默认导入 CJS 报错 | \`esModuleInterop\` 关闭时 | 开启 \`esModuleInterop\` |
| 命名空间导入拿不到方法 | CJS 的方法挂在 \`module.exports\` 上 | 用 \`esModuleInterop\` 或 \`import = require\` |
| 动态 import CJS 拿不到默认 | 动态 import 返回命名空间对象，默认在 \`.default\` | 用 \`mod.default\` 或 \`mod\` |
| 运行时路径别名失效 | paths 只在编译期生效 | 配置运行时 alias |

### 陷阱与最佳实践

1. **不要混用 namespace 和模块**：在现代模块项目里写 \`namespace\` 会让代码风格混乱，统一用模块。
2. **优先命名导出**：利于重构、自动补全、tree-shaking。
3. **类型导入用 \`import type\`**：在 isolatedModules 下更安全，意图更清晰。
4. **路径别名要双端配置**：tsconfig 的 paths 只是编译期，运行时也要配。
5. **警惕循环导入**：模块 A 导入 B，B 又导入 A，可能导致 B 拿到的是 A 还未完成的导出。可用动态 import 或重构拆分解耦。
6. **side-effect import 要谨慎**：\`import './x'\` 会执行副作用，可能影响打包体积。

### 本章小结

模块是工程化的基石。掌握 ES Modules 的导入导出、类型导出、动态导入，理解模块解析和路径映射，以及与 CommonJS 的互操作，你就能组织起任何规模的 TS 项目。namespace 作为历史产物了解即可，新代码请坚定地使用 ES Modules。

下面的代码 demo 因为沙箱是单文件执行、不能 require 本地文件，我们用"对象字面量 + 自制 require 注册表"来模拟一个真实的模块系统，演示各种导入形式的概念；namespace 部分用真实的 \`namespace\` 语法（它会编译成 IIFE 对象，运行正常）。`,
    code: `// ============================================================
// 模块与命名空间 —— 代码演示
// ------------------------------------------------------------
// 沙箱是单文件执行，不能 require 本地 .ts 文件，所以我们用
// "对象字面量 + 自制 require 注册表"模拟一个完整的模块系统，
// 演示 ES Modules 各种导入导出的概念。namespace 用真实语法。
// ============================================================

// ---- 1. 模拟一个模块系统：注册表 + 自制 require ----
console.log("========== 1. 模拟模块系统 ==========");

// 模块注册表：键是模块 id，值是该模块"导出"的对象
// 这模拟了 Node 的 require 缓存 / ES Modules 的模块记录
const moduleRegistry: Record<string, any> = {};

// 自制 require：从注册表里取出模块的导出对象
// 真实环境里 Node/打包器会读取磁盘文件并执行，这里用注册表替代
function fakeRequire(moduleId: string): any {
  if (moduleId in moduleRegistry) {
    return moduleRegistry[moduleId];
  }
  throw new Error("Cannot find module '" + moduleId + "'");
}

// ---- 2. 定义一个模块：模拟 math-utils.ts 的内容 ----
// 这个文件同时有【命名导出】和一个【默认导出】
// 真实写法：
//   export const PI = 3.14159;
//   export function add(a, b) { return a + b; }
//   export function multiply(a, b) { return a * b; }
//   export default function square(x) { return x * x; }
// 这里用对象字面量表示它的"导出对象"：
moduleRegistry["math-utils"] = {
  // 以下是命名导出
  add: function (a: number, b: number): number { return a + b; },
  multiply: function (a: number, b: number): number { return a * b; },
  PI: 3.14159,
  // 以下是默认导出（ES Modules 的 default 是一个特殊的命名导出）
  default: function square(x: number): number { return x * x; },
};

// 同时模拟一个"类型导出"的概念
// 真实写法： export type Point = { x: number; y: number };
// 类型在运行时被擦除，所以这里只声明（仅编译期存在）
type Point = { x: number; y: number };
function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
console.log("类型导出 Point 的 distance({0,0},{3,4}) =", distance({ x: 0, y: 0 }, { x: 3, y: 4 }));

// ---- 3. 演示各种 import 形式（用解构/属性访问模拟）----
console.log("\\n========== 2. 各种 import 形式 ==========");

// ① 命名导入： import { add, multiply, PI } from 'math-utils'
const { add, multiply, PI } = fakeRequire("math-utils");
console.log("① 命名导入 add(2,3) =", add(2, 3));
console.log("① 命名导入 multiply(4,5) =", multiply(4, 5));
console.log("① 命名导入 PI =", PI);

// ② 重命名导入： import { add as plus } from 'math-utils'
const { add: plus } = fakeRequire("math-utils");
console.log("② 重命名导入 plus(10,20) =", plus(10, 20));

// ③ 命名空间导入： import * as MathUtils from 'math-utils'
const MathUtils = fakeRequire("math-utils");
console.log("③ 命名空间导入 MathUtils.add(7,8) =", MathUtils.add(7, 8));
console.log("③ 命名空间导入 MathUtils.PI =", MathUtils.PI);
// 注意：默认导出 default 也存在于命名空间对象里
console.log("③ 命名空间导入里的默认导出 MathUtils.default(9) =", MathUtils.default(9));

// ④ 默认导入： import square from 'math-utils'
// 等价于取 .default 属性
const square = fakeRequire("math-utils").default;
console.log("④ 默认导入 square(6) =", square(6));

// ⑤ 混合导入： import square, { add } from 'math-utils'
// 取默认导出 + 命名导出
const MathMod = fakeRequire("math-utils");
const defaultSquare = MathMod.default;
const { add: addAgain } = MathMod;
console.log("⑤ 混合导入 defaultSquare(5) =", defaultSquare(5), " addAgain(1,1) =", addAgain(1, 1));

// ⑥ 副作用导入： import 'math-utils' —— 只执行不绑定名字
// 这里就相当于调用一次 fakeRequire 但不赋值（执行模块代码）
fakeRequire("math-utils"); // 模拟副作用导入
console.log("⑥ 副作用导入（已执行，不绑定名字）");

// ---- 4. 动态导入 import() 的模拟 ----
console.log("\\n========== 3. 动态导入 import() ==========");

// 真实代码： const mod = await import('./heavy-module');
// import() 是异步的，返回 Promise<ModuleNamespace>
// 沙箱里没有真实模块加载器，用 Promise + setTimeout 模拟异步加载
function dynamicImport(moduleId: string): Promise<any> {
  return new Promise(function (resolve, reject) {
    // 模拟异步加载：10ms 后才"加载完成"
    setTimeout(function () {
      if (moduleId in moduleRegistry) {
        console.log("  [动态] 模块 '" + moduleId + "' 加载完成");
        resolve(moduleRegistry[moduleId]);
      } else {
        reject(new Error("动态加载失败：找不到模块 " + moduleId));
      }
    }, 10);
  });
}

// 用 .then 消费动态导入
console.log("开始动态导入...");
dynamicImport("math-utils").then(function (mod) {
  // mod 是模块命名空间对象，命名导出直接可用，默认导出在 .default
  console.log("  动态导入拿到 add(100,200) =", mod.add(100, 200));
  console.log("  动态导入拿到 default(11) =", mod.default(11));
});

// 用 async/await 消费（沙箱支持顶层 await）
(async function () {
  console.log("  用 await 动态导入...");
  const mod = await dynamicImport("math-utils");
  console.log("  await 拿到 multiply(3,3) =", mod.multiply(3, 3));
})();

// ---- 5. 命名空间 namespace（真实语法，编译成 IIFE）----
console.log("\\n========== 4. 命名空间 namespace ==========");

// namespace 编译后会变成一个 IIFE 生成的对象，运行时真实存在
// 这里演示：命名导出、私有成员、嵌套命名空间、类型
namespace Geometry {
  // 不 export 的是命名空间私有的
  const _internal = "我是私有的";

  // export 的对外暴露
  export const PI = 3.14159;

  export function area(r: number): number {
    return PI * r * r;
  }

  export function perimeter(r: number): number {
    return 2 * PI * r;
  }

  // 命名空间里也可以放类型（编译期存在，运行时擦除）
  export interface Point {
    x: number;
    y: number;
  }

  export function distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 嵌套命名空间
  export namespace Shape {
    export function circleInfo(r: number): string {
      // 内层可以访问外层的 area/perimeter
      return "半径=" + r + " 面积=" + area(r).toFixed(2) + " 周长=" + perimeter(r).toFixed(2);
    }
    export const TYPE = "shape";
  }
}

// 使用命名空间
console.log("Geometry.PI =", Geometry.PI);
console.log("Geometry.area(5) =", Geometry.area(5));
console.log("Geometry.perimeter(5) =", Geometry.perimeter(5));
console.log("Geometry.distance =", Geometry.distance({ x: 0, y: 0 }, { x: 6, y: 8 }));
console.log("嵌套 Geometry.Shape.circleInfo(3) =", Geometry.Shape.circleInfo(3));
console.log("嵌套 Geometry.Shape.TYPE =", Geometry.Shape.TYPE);
// Geometry._internal  // ❌ 私有，外部访问不到（类型错误）

// ---- 6. 命名空间合并 ----
console.log("\\n========== 5. 命名空间合并 ==========");

// 同名 namespace 会合并：第一段
namespace Validator {
  export function isString(x: unknown): x is string {
    return typeof x === "string";
  }
}
// 同名 namespace 第二段：合并进去
namespace Validator {
  export function isNumber(x: unknown): x is number {
    return typeof x === "number";
  }
  export function isBoolean(x: unknown): x is boolean {
    return typeof x === "boolean";
  }
}

// 合并后 Validator 同时拥有三个方法
console.log("Validator.isString('a') =", Validator.isString("a"));
console.log("Validator.isNumber(1) =", Validator.isNumber(1));
console.log("Validator.isBoolean(true) =", Validator.isBoolean(true));
console.log("Validator.isString(1) =", Validator.isString(1));

// ---- 7. CommonJS 互操作概念演示 ----
console.log("\\n========== 6. CommonJS 互操作概念 ==========");

// 模拟一个 CommonJS 模块（module.exports 是整个对象）
moduleRegistry["cjs-math"] = {
  add: function (a: number, b: number): number { return a + b; },
  sub: function (a: number, b: number): number { return a - b; },
  // CommonJS 没有 default 概念，整个对象就是导出
};
// 模拟 esModuleInterop 的合成 default：把整个 module.exports 包成 default
moduleRegistry["cjs-math-interop"] = {
  add: moduleRegistry["cjs-math"].add,
  sub: moduleRegistry["cjs-math"].sub,
  default: moduleRegistry["cjs-math"], // 合成的 default 指向整个对象
  __esModule: true, // 标记这是合成的 ES 模块
};

// esModuleInterop: true 时的默认导入 import cjsMath from 'cjs-math'
const cjsMath = fakeRequire("cjs-math-interop").default;
console.log("esModuleInterop 默认导入 cjsMath.add(20,5) =", cjsMath.add(20, 5));

// 命名导入 import { add } from 'cjs-math'
const { add: cjsAdd } = fakeRequire("cjs-math-interop");
console.log("命名导入 cjsAdd(50,7) =", cjsAdd(50, 7));

// import = require 语法（TS 特有，等价于 require）
// 真实代码： import cjsMod = require('cjs-math');
const cjsMod = fakeRequire("cjs-math");
console.log("import=require 方式 cjsMod.sub(30,12) =", cjsMod.sub(30, 12));

// ---- 8. 路径映射 paths 概念演示 ----
console.log("\\n========== 7. 路径映射 paths 概念 ==========");

// 模拟 tsconfig: { paths: { "@utils/*": ["./src/utils/*"] } }
// 编译期 TS 把 @utils/math 解析成 ./src/utils/math
// 这里用注册表模拟：注册一个别名指向同一模块
moduleRegistry["@utils/math"] = moduleRegistry["math-utils"];
moduleRegistry["@components/Button"] = {
  render: function (): string { return "<Button>"; },
  default: function Button(): string { return "Button 组件"; },
};

// 用别名"导入"（实际是别名解析到真实模块）
const aliasedAdd = fakeRequire("@utils/math").add;
console.log("路径别名 @utils/math 的 add(8,8) =", aliasedAdd(8, 8));
console.log("⚠️ 提示：paths 只在编译期生效，运行时需要 tsconfig-paths 或打包器 alias 配置");

// ---- 9. 三斜线指令概念（仅注释展示）----
console.log("\\n========== 8. 三斜线指令概念 ==========");
// 三斜线指令是编译期指令，运行时完全无效，这里仅用注释展示：
// /// <reference path="./types.d.ts" />   // 声明文件依赖
// /// <reference types="node" />          // 声明 @types 依赖
// /// <reference lib="es2017.string" />   // 引用 lib
console.log("三斜线指令（/// reference）是编译期指令，运行时被擦除，主要用于 .d.ts 文件");
console.log("现代 ES Modules 项目用 import / tsconfig 的 types/lib 替代");

// 等待异步动态导入回调执行完毕后再打印完成消息
// （动态导入模拟用 10ms 延迟，这里用 15ms 确保排在它们之后）
setTimeout(function () {
  console.log("\\n模块与命名空间章节演示完成！");
}, 15);`,
  },

  // =========================================================
  // 第二章：装饰器 (Decorators)
  // =========================================================
  {
    id: "ts-decorators",
    title: "装饰器 (Decorators)",
    icon: "🎨",
    group: "工程化",
    content: `## 装饰器 (Decorators)

装饰器是 TypeScript 一项**实验性**特性，它让你能用一种声明式的方式"装饰"类、方法、属性、参数，在不修改原代码逻辑的前提下为它们添加额外行为（日志、性能监控、权限校验、依赖注入等）。装饰器语法源自 ES7 提案，在 Angular、NestJS、TypeORM 等框架中被大量使用。

装饰器本质上是一种**高阶函数**——它接收目标（类/方法/属性/参数），返回一个（可能被修改的）目标。理解装饰器的关键在于理解"它在何时被调用、收到什么参数、能修改什么"。

> **重要前置**：本章代码运行环境已开启 \`experimentalDecorators: true\` 和 \`emitDecoratorMetadata: true\`，所以下面所有装饰器语法都能真实编译运行。注意当前 JS 标准装饰器（TC39 Stage 3）与 TS 实验性装饰器有差异，本章讲的是**实验性装饰器**（TS 传统用法）。

### 装饰器是什么

#### 一句话定义

装饰器是一种用 \`@expression\` 形式书写的特殊声明，其中 \`expression\` 求值后必须是一个函数，这个函数在运行时被调用，接收被装饰的目标作为参数。

\`\`\`ts
// @sealed 是一个装饰器，sealed 必须是函数
@sealed  // 装饰器 sealed
class Greeter {  // 定义类 Greeter
  @log  // 装饰器 log
  greet() {}  // 调用 greet
}
\`\`\`

#### 装饰器的本质：高阶函数

\`\`\`ts
// 装饰器就是一个函数：接收类构造函数，返回（可能新的）构造函数
function sealed(constructor: Function) {  // 定义函数 sealed，参数: constructor: Function
  Object.seal(constructor);  // 调用 Object.seal
  Object.seal(constructor.prototype);  // 调用 Object.seal
}

@sealed  // 装饰器 sealed
class Foo {}  // 定义类 Foo
// 等价于：class Foo {} 然后 sealed(Foo);
\`\`\`

编译后，装饰器调用由 TS 注入的 \`__decorate\` 辅助函数完成。你写的 \`@sealed class Foo\` 会被编译成类似 \`Foo = __decorate([sealed], Foo)\` 的代码——也就是在类定义完成后，把类传给装饰器函数。

### 装饰器工厂

直接用 \`@decoratorName\` 时，装饰器名必须求值为一个函数。但很多时候我们想给装饰器**传参**（比如 \`@log('标签')\`）。这时用**装饰器工厂**——写一个函数，它接收参数，返回真正的装饰器函数。

\`\`\`ts
// log 是装饰器工厂：接收参数，返回装饰器
function log(label: string) {  // 定义函数 log，参数: label: string
  // 返回的才是真正的装饰器
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {  // 返回 function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {（注意：any 关闭了类型检查）
    const original = descriptor.value;  // 声明常量 original
    descriptor.value = function (...args: any[]) {  // 赋值 descriptor.value（注意：any 关闭了类型检查）
      console.log(\`[\${label}] 调用 \${propertyKey}\`);  // 控制台输出
      return original.apply(this, args);  // 返回 original.apply(this, args)
    };
  };
}

class Calc {  // 定义类 Calc
  @log('计算器')   // 先调用 log('计算器') 得到装饰器，再用装饰器装饰 add
  add(a: number, b: number) { return a + b; }  // 调用 add
}
\`\`\`

区分清楚两步：
1. **求值**：\`log('计算器')\` 被调用，返回内层装饰器函数。
2. **应用**：内层装饰器函数被 \`__decorate\` 调用，装饰 \`add\`。

### 类装饰器 ClassDecorator

类装饰器作用于 \`class\` 声明，接收**类的构造函数**作为参数。

#### 签名

\`\`\`ts
type ClassDecorator = <TFunction extends new (...args: any[]) => any>(  // 定义类型别名 ClassDecorator（注意：any 关闭了类型检查）
  target: TFunction
) => TFunction | void;  // 箭头函数
\`\`\`

- \`target\` 是类的构造函数。
- 返回值：如果返回一个新的构造函数，它会**替换**原类；返回 \`void\` 则保持原类不变。

#### 用途

1. **替换/扩展构造函数**：返回一个继承原类的子类，在构造时添加逻辑。
2. **给类添加元数据**：在构造函数上挂属性。
3. **注册类**：把类注册到某个容器（依赖注入）。

#### 示例：给类打标记

\`\`\`ts
const classes: Function[] = [];  // 声明常量 classes，类型 Function[]
function registered(target: Function) {  // 定义函数 registered，参数: target: Function
  classes.push(target);  // 调用 classes.push
}

@registered  // 装饰器 registered
class A {}  // 定义类 A
@registered  // 装饰器 registered
class B {}  // 定义类 B
// classes 现在是 [A, B]
\`\`\`

#### 示例：替换构造函数（添加日志）

\`\`\`ts
function logged(constructor: new (...args: any[]) => any) {  // 定义函数 logged，参数: constructor: new (...args: any[]（注意：any 关闭了类型检查）
  return class extends constructor {  // 返回 class extends constructor {
    constructor(...args: any[]) {  // 调用 constructor（注意：any 关闭了类型检查）
      console.log('创建 ' + constructor.name);  // 控制台输出
      super(...args);  // 调用 super
    }
  };
}

@logged  // 装饰器 logged
class Person {  // 定义类 Person
  constructor(public name: string) {}  // 调用 constructor
}
new Person('张三'); // 打印"创建 Person"
\`\`\`

### 方法装饰器 MethodDecorator

方法装饰器作用于类的方法，接收三个参数。

#### 签名

\`\`\`ts
type MethodDecorator = (  // 定义类型别名 MethodDecorator
  target: Object,                 // 静态方法是构造函数；实例方法是原型对象
  propertyKey: string | symbol,   // 方法名
  descriptor: PropertyDescriptor  // 属性描述符，descriptor.value 是方法本身
) => PropertyDescriptor | void;  // 箭头函数
\`\`\`

- \`target\`：对于**实例方法**是类的原型对象（\`ClassName.prototype\`）；对于**静态方法**是构造函数本身。
- \`descriptor.value\` 是被装饰的方法函数。修改它（或整个 descriptor）就能改变方法行为。

#### 返回值

如果返回一个 \`PropertyDescriptor\`，TS 会用它重新定义该方法。常见做法是修改 \`descriptor.value\` 后返回 \`descriptor\`。

#### 经典应用：@log 日志装饰器

\`\`\`ts
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {  // 定义函数 log，参数: target: any, propertyKey: string, descriptor: PropertyDescriptor（注意：any 关闭了类型检查）
  const original = descriptor.value;  // 声明常量 original
  descriptor.value = function (...args: any[]) {  // 赋值 descriptor.value（注意：any 关闭了类型检查）
    console.log(\`调用 \${propertyKey}(\${args.join(', ')})\`);  // 控制台输出
    const result = original.apply(this, args);  // 声明常量 result
    console.log(\`\${propertyKey} 返回 \${result}\`);  // 控制台输出
    return result;  // 返回 result
  };
  return descriptor;  // 返回 descriptor
}

class Calc {  // 定义类 Calc
  @log  // 装饰器 log
  add(a: number, b: number) { return a + b; }  // 调用 add
}
new Calc().add(2, 3);  // 创建 Calc 实例
// 输出：调用 add(2, 3) / add 返回 5
\`\`\`

#### 经典应用：@bound 自动绑定 this

回调里 \`this\` 丢失是常见 bug。\`@bound\` 让方法每次访问都返回一个绑定了 \`this\` 的版本：

\`\`\`ts
function bound(target: any, propertyKey: string, descriptor: PropertyDescriptor) {  // 定义函数 bound，参数: target: any, propertyKey: string, descriptor: PropertyDescriptor（注意：any 关闭了类型检查）
  const original = descriptor.value;  // 声明常量 original
  // 改成 getter：每次访问方法时返回绑定 this 的版本
  delete descriptor.value;
  delete descriptor.writable;
  descriptor.get = function () {  // 赋值 descriptor.get
    return original.bind(this);  // 返回 original.bind(this)
  };
}
\`\`\`

### 属性装饰器 PropertyDecorator

属性装饰器作用于类的属性，接收两个参数（**没有 descriptor**）。

#### 签名

\`\`\`ts
type PropertyDecorator = (  // 定义类型别名 PropertyDecorator
  target: Object,                // 实例属性是原型，静态属性是构造函数
  propertyKey: string | symbol
) => void;  // 箭头函数
\`\`\`

⚠️ **重要陷阱**：属性装饰器**拿不到属性描述符**（第三参数是 undefined）。因为实例属性的描述符在实例上，不在原型上——装饰器运行时实例还没创建。所以属性装饰器**无法直接读取/修改属性值**，只能拿到"原型 + 属性名"。它主要用于**收集元数据**（配合 reflect-metadata 或自己的存储），把信息记下来供别处（如类装饰器、序列化器）使用。

#### 示例：收集只读属性标记

\`\`\`ts
const readonlyProps = new WeakMap<Object, Set<string>>();  // 声明常量 readonlyProps
function readonly(target: any, propertyKey: string) {  // 定义函数 readonly，参数: target: any, propertyKey: string（注意：any 关闭了类型检查）
  let set = readonlyProps.get(target);  // 声明变量 set
  if (!set) { set = new Set(); readonlyProps.set(target, set); }  // 条件判断
  set.add(propertyKey);  // 调用 set.add
}
\`\`\`

要真正"只读"，需要配合一个类装饰器，在实例创建后把标记的属性改成不可写（见代码 demo）。

### 参数装饰器 ParameterDecorator

参数装饰器作用于方法参数，接收三个参数。

#### 签名

\`\`\`ts
type ParameterDecorator = (  // 定义类型别名 ParameterDecorator
  target: Object,                 // 实例方法是原型，静态方法是构造函数
  propertyKey: string | symbol,   // 方法名（构造函数参数是 undefined）
  parameterIndex: number          // 参数在参数列表中的索引
) => void;  // 箭头函数
\`\`\`

参数装饰器同样**不能直接修改参数行为**，主要用于收集元数据（如标记某参数是必填、是请求体、是路由参数等）。NestJS 的 \`@Body()\`、\`@Param()\` 就是参数装饰器。

#### 示例：标记必填参数

\`\`\`ts
const requiredParams = new WeakMap<Object, Map<string, number[]>>();  // 声明常量 requiredParams
function required(target: any, propertyKey: string, parameterIndex: number) {  // 定义函数 required，参数: target: any, propertyKey: string, parameterIndex: number（注意：any 关闭了类型检查）
  let map = requiredParams.get(target);  // 声明变量 map
  if (!map) { map = new Map(); requiredParams.set(target, map); }  // 条件判断
  let arr = map.get(propertyKey);  // 声明变量 arr
  if (!arr) { arr = []; map.set(propertyKey, arr); }  // 条件判断
  arr.push(parameterIndex);  // 调用 arr.push
}
\`\`\`

之后配合方法装饰器在调用时校验这些参数。

### 多个装饰器的执行顺序

这是面试高频考点，也是实战易错点。

#### 同一处多个装饰器

对于同一处堆叠的多个装饰器：

\`\`\`ts
@A  // 装饰器 A
@B  // 装饰器 B
class C {  // 定义类 C
  @X  // 装饰器 X
  @Y  // 装饰器 Y
  method() {}  // 调用 method
}
\`\`\`

执行分两步：

1. **求值（自顶向下）**：装饰器表达式按从上到下的顺序求值。\`A\` → \`B\` → \`X\` → \`Y\`（如果是工厂，先调用工厂得到装饰器）。
2. **应用（自底向上）**：得到的装饰器函数按从下到上的顺序调用。\`Y\` 先应用，再 \`X\`；\`B\` 先应用，再 \`A\`。

口诀：**求值自顶向下，应用自底向上**。

#### 不同成员之间的顺序

在一个类里：

1. 先应用所有**实例成员**的装饰器（按成员在类体中出现的顺序，每个成员内部自底向上）。
2. 再应用所有**静态成员**的装饰器。
3. 最后应用**类装饰器**（多个时自底向上）。
4. **参数装饰器**在其所属方法的装饰器之前应用。

#### 直观例子

\`\`\`ts
function step(name: string) {  // 定义函数 step，参数: name: string
  console.log('求值 ' + name);  // 控制台输出
  return function () { console.log('应用 ' + name); };  // 返回 function () { console.log('应用 ' + name); }
}

@step('A')  // 装饰器 step
@step('B')  // 装饰器 step
class C {  // 定义类 C
  @step('X')  // 装饰器 step
  @step('Y')  // 装饰器 step
  m() {}  // 调用 m
}
\`\`\`

输出顺序：
\`\`\`
求值 X
求值 Y
应用 Y
应用 X
求值 A
求值 B
应用 B
应用 A
\`\`\`

### reflect-metadata 简介

\`reflect-metadata\` 是一个 polyfill 库，它给 \`Reflect\` 对象扩展了 \`defineMetadata\` / \`getMetadata\` 等方法，让你能在任意对象上存取"元数据"（键值对）。配合 \`emitDecoratorMetadata: true\`，TS 会在编译时自动把每个被装饰成员的**类型信息**（参数类型、返回类型、属性类型）通过 \`Reflect.metadata\` 写入。

\`\`\`ts
import 'reflect-metadata';  // 导入模块（仅副作用）

function logParamTypes(target: any, key: string) {  // 定义函数 logParamTypes，参数: target: any, key: string（注意：any 关闭了类型检查）
  const types = Reflect.getMetadata('design:paramtypes', target, key);  // 声明常量 types
  console.log(types); // [Number, String]
}

class Demo {  // 定义类 Demo
  @logParamTypes  // 装饰器 logParamTypes
  do(a: number, b: string) {}  // 调用 do
}
\`\`\`

\`emitDecoratorMetadata\` 会注入三种元数据键：

| 键 | 含义 |
| --- | --- |
| \`design:type\` | 属性的类型 |
| \`design:paramtypes\` | 方法参数的类型数组 |
| \`design:returntype\` | 方法的返回类型 |

⚠️ **陷阱**：
1. \`reflect-metadata\` 不是标准库，需要 \`npm i reflect-metadata\` 并在入口 \`import 'reflect-metadata'\`。
2. 类型信息是**设计期类型**，对联合类型/泛型只能拿到 \`Object\`（因为运行时无法保留）。
3. 本沙箱未安装 \`reflect-metadata\`，所以 \`Reflect.metadata\` 不存在——TS 注入的 \`__metadata\` 调用会优雅地返回 \`undefined\`（不影响装饰器本身运行）。下面的 demo 用自建的 \`WeakMap\` 存储元数据，不依赖 reflect-metadata。

### 实战：常用装饰器

| 装饰器 | 类型 | 作用 |
| --- | --- | --- |
| \`@log\` | 方法 | 记录方法调用与返回值 |
| \`@readonly\` | 属性 | 标记属性只读 |
| \`@deprecated\` | 方法/类 | 调用时提示已废弃 |
| \`@bound\` | 方法 | 自动绑定 this |
| \`@required\` | 参数 | 标记参数必填 |
| \`@sealed\` | 类 | 冻结构造函数 |
| \`@logged\` | 类 | 在构造时打印日志 |

### 陷阱与最佳实践

1. **属性装饰器拿不到值和描述符**：只能收集元数据，要修改行为需配合类装饰器。
2. **参数装饰器不能改参数**：只用于标记，校验逻辑要放在方法装饰器里读取标记后执行。
3. **执行顺序反直觉**：记住"求值自顶向下、应用自底向上"。
4. **类装饰器返回新构造函数会改变 \`instanceof\`**：因为原型链变了，\`new Sub() instanceof Original\` 仍为 true（因为继承），但要注意静态属性继承行为。
5. **实验性特性**：标准装饰器（TC39 Stage 3）与实验性装饰器语法不完全兼容，迁移时要注意。TS 5.0+ 可通过 \`--target ES2022\` + 不开 \`experimentalDecorators\` 使用标准装饰器。
6. **性能**：装饰器在类定义时执行一次（不是每次调用），开销可忽略；但 \`@bound\` 这种每次访问都 bind 的写法有额外开销。

### 本章小结

装饰器是声明式编程的利器，在框架开发中极其常用。掌握类/方法/属性/参数四种装饰器的签名与能力边界、装饰器工厂的写法、多个装饰器的执行顺序，以及 reflect-metadata 元数据机制，你就能读懂 Angular/NestJS 的源码，也能自己造出优雅的装饰器。下面的 demo 实现了 \`@log\`、\`@readonly\`+类装饰器强制只读、\`@deprecated\`、\`@bound\`、\`@required\` 参数装饰器，并演示执行顺序。`,
    code: `// ============================================================
// 装饰器 (Decorators) —— 代码演示
// ------------------------------------------------------------
// 运行环境已开启 experimentalDecorators + emitDecoratorMetadata
// 装饰器会真实编译并运行。沙箱未装 reflect-metadata，所以我们
// 用 WeakMap 自建元数据存储，不依赖 Reflect.metadata。
// ============================================================

console.log("========== 1. 类装饰器：@logged 打印实例化 ==========");

// ---- 类装饰器：在每次 new 时打印日志 ----
// target 是类的构造函数；返回一个子类替换原类
function logged<T extends new (...args: any[]) => any>(target: T): T {
  // 返回一个继承 target 的子类，在构造时打印日志
  return class extends target {
    constructor(...args: any[]) {
      console.log("  [logged] 正在创建 " + target.name + "，参数: " + JSON.stringify(args));
      super(...args); // 调用原构造函数
      console.log("  [logged] " + target.name + " 创建完成");
    }
  };
}

// ---- 元数据存储：用 WeakMap 存"只读属性"和"必填参数"标记 ----
// WeakMap 的键是对象（原型/构造函数），不会阻止垃圾回收
const readonlyProps = new WeakMap<object, Set<string>>();
const requiredParams = new WeakMap<object, Map<string | symbol, number[]>>();

// ---- 属性装饰器：@readonly 标记属性只读 ----
// 属性装饰器只能拿到 (target, propertyKey)，没有 descriptor
// 所以这里只是"记录"该属性需要只读，真正的强制由类装饰器完成
function readonly(target: any, propertyKey: string) {
  let set = readonlyProps.get(target);
  if (!set) {
    set = new Set();
    readonlyProps.set(target, set);
  }
  set.add(propertyKey);
  console.log("  [readonly] 标记属性 " + propertyKey + " 为只读");
}

// ---- 类装饰器：@enforceReadonly 配合 @readonly 真正强制只读 ----
// 包装构造函数：实例化后把标记为 readonly 的属性改成不可写
// 注意：当类上有多个类装饰器时，本装饰器收到的 target 可能已是
// 别的装饰器返回的子类，其 prototype 并非 @readonly 记录元数据的
// 原始原型。因此沿原型链向上查找，确保能找到原始原型上的标记。
function enforceReadonly<T extends new (...args: any[]) => any>(target: T): T {
  return class extends target {
    constructor(...args: any[]) {
      super(...args); // 先正常构造（此时实例属性已被赋值）
      // 沿原型链向上查找所有标记为只读的属性
      // （target.prototype 可能是某层子类原型，原始标记在其上层）
      let proto: any = target.prototype;
      while (proto) {
        const set = readonlyProps.get(proto);
        if (set) {
          for (const key of set) {
            const value = (this as any)[key]; // 拿到构造时赋的值
            // 用 Object.defineProperty 把它改成不可写、不可配置
            Object.defineProperty(this, key, {
              value: value,
              writable: false,
              configurable: false,
              enumerable: true,
            });
          }
        }
        proto = Object.getPrototypeOf(proto); // 继续向上找
      }
    }
  };
}

// ---- 方法装饰器工厂：@log(label) 记录方法调用与返回值 ----
// 工厂接收参数(label)，返回真正的装饰器
function log(label: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value; // 保存原方法
    // 替换方法：在调用前后打印日志
    descriptor.value = function (...args: any[]) {
      console.log("  [" + label + "] 调用 " + propertyKey + "(" + args.join(", ") + ")");
      const result = original.apply(this, args); // 调用原方法，保持 this
      console.log("  [" + label + "] " + propertyKey + " 返回 " + JSON.stringify(result));
      return result;
    };
    return descriptor; // 返回修改后的描述符
  };
}

// ---- 方法装饰器工厂：@deprecated(msg) 废弃提示 ----
function deprecated(msg: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // 调用时给出废弃警告
      console.warn("⚠️ [deprecated] 方法 " + propertyKey + " 已废弃: " + msg);
      return original.apply(this, args);
    };
    return descriptor;
  };
}

// ---- 方法装饰器：@bound 自动绑定 this ----
// 把方法改成 getter，每次访问返回绑定 this 的版本
function bound(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  delete descriptor.value;
  delete descriptor.writable;
  descriptor.get = function () {
    // this 是实例，bind 后即使被解构调用 this 也不丢
    return original.bind(this);
  };
}

// ---- 参数装饰器：@required 标记参数必填 ----
// 只收集信息：记录"哪个方法的第几个参数"是必填的
function required(target: any, propertyKey: string, parameterIndex: number) {
  let map = requiredParams.get(target);
  if (!map) {
    map = new Map();
    requiredParams.set(target, map);
  }
  let arr = map.get(propertyKey);
  if (!arr) {
    arr = [];
    map.set(propertyKey, arr);
  }
  arr.push(parameterIndex);
  console.log("  [required] 标记 " + propertyKey + " 的第 " + parameterIndex + " 个参数必填");
}

// ---- 方法装饰器：@validateRequired 配合 @required 做运行时校验 ----
function validateRequired(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    // 从元数据读取该方法的必填参数索引
    const map = requiredParams.get(target);
    const requiredIdx = map ? map.get(propertyKey) : undefined;
    if (requiredIdx) {
      for (const idx of requiredIdx) {
        // undefined / null 视为未传
        if (args[idx] === undefined || args[idx] === null) {
          throw new Error(propertyKey + " 的第 " + idx + " 个参数是必填的");
        }
      }
    }
    return original.apply(this, args);
  };
  return descriptor;
}

// ============================================================
// 应用装饰器：注意执行顺序——属性/方法装饰器先应用，类装饰器后应用
// ============================================================
console.log("\\n========== 2. 定义被装饰的类（观察装饰器应用顺序）==========");

@enforceReadonly
@logged
class Calculator {
  // 属性装饰器：标记 version 只读
  @readonly
  version: string = "1.0.0";

  // 方法装饰器工厂：带标签的日志
  @log("加法")
  add(a: number, b: number): number {
    return a + b;
  }

  @log("乘法")
  multiply(a: number, b: number): number {
    return a * b;
  }

  // 废弃方法：调用时警告
  @deprecated("请改用 add")
  sum(a: number, b: number): number {
    return a + b;
  }

  // 自动绑定 this 的方法
  // 注意：类装饰器 @enforceReadonly 会返回匿名子类替换原类，
  // 所以 this.constructor.name 会是空串，这里用 this.version 即可
  // 演示 this 被正确绑定（解构调用仍能访问实例属性）
  @bound
  getDescription(): string {
    return "我是计算器，版本 " + this.version;
  }

  // 配合参数装饰器：第二个参数必填
  @validateRequired
  divide(a: number, @required b: number): number {
    return a / b;
  }
}

// ============================================================
// 使用被装饰的类
// ============================================================
console.log("\\n========== 3. 调用被装饰的方法 ==========");

const calc = new Calculator();

console.log("\\n--- 调用 @log 装饰的 add ---");
console.log("结果:", calc.add(2, 3));

console.log("\\n--- 调用 @log 装饰的 multiply ---");
console.log("结果:", calc.multiply(4, 5));

console.log("\\n--- 调用 @deprecated 装饰的 sum ---");
console.log("结果:", calc.sum(10, 20));

console.log("\\n--- @readonly 强制只读测试 ---");
console.log("原始 version:", calc.version);
try {
  // 尝试修改只读属性
  (calc as any).version = "2.0.0";
  // 非严格模式下静默失败，version 不变；严格模式会抛错
  console.log("尝试修改后 version:", calc.version, "(若仍是 1.0.0 说明只读生效)");
} catch (e: any) {
  console.log("修改只读属性抛出异常:", e.message);
  console.log("version 仍是:", calc.version);
}

console.log("\\n--- @bound 自动绑定 this 测试 ---");
// 把方法解构出来单独调用，this 仍指向 calc
const desc = calc.getDescription;
console.log("解构调用 getDescription():", desc());

console.log("\\n--- @required 参数校验测试 ---");
console.log("divide(10, 2) =", calc.divide(10, 2));
try {
  // 第二个参数必填，传 undefined 应抛错
  console.log("divide(10, undefined) =", calc.divide(10, undefined as any));
} catch (e: any) {
  console.log("参数校验拦截:", e.message);
}

// ============================================================
// 多个装饰器的执行顺序演示
// ============================================================
console.log("\\n========== 4. 多个装饰器执行顺序 ==========");

// 工厂：求值时打印"求值"，应用时打印"应用"
function step(name: string) {
  console.log("  [求值] step('" + name + "')");
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const where = propertyKey ? "方法 " + propertyKey : "类";
    console.log("  [应用] " + name + " -> " + where);
  };
}

@step("A")
@step("B")
class Order {
  @step("X")
  @step("Y")
  process(): void {}
}

console.log("（注意：求值自顶向下，应用自底向上；成员装饰器先于类装饰器）");

// ============================================================
// 类装饰器返回新构造函数示例（@mixin 风格）
// ============================================================
console.log("\\n========== 5. 类装饰器：添加能力（mixin）==========");

// 用类装饰器给类"混入"一个静态方法
function withTimestamp<T extends new (...args: any[]) => any>(target: T): T {
  // 在原类上添加静态方法 now（返回当前时间戳）
  (target as any).now = function (): number {
    return Date.now();
  };
  // 也可以加原型方法
  (target.prototype as any).createdAt = function (): number {
    return Date.now();
  };
  return target; // 返回原类（只是给它加了成员）
}

@withTimestamp
class Event {}

// 访问被装饰器添加的静态方法
console.log("Event.now() =", (Event as any).now());
const ev = new Event();
console.log("ev.createdAt() =", (ev as any).createdAt());

console.log("\\n装饰器章节演示完成！");`,
  },

  // =========================================================
  // 第三章：tsconfig 配置
  // =========================================================
  {
    id: "ts-tsconfig",
    title: "tsconfig 配置",
    icon: "⚙️",
    group: "工程化",
    content: `## tsconfig 配置

\`tsconfig.json\` 是 TypeScript 项目的"控制面板"——它告诉 TypeScript 编译器（\`tsc\`）**编译哪些文件**、**用哪些编译选项**、**输出什么形态**。一个项目可以没有 \`tsconfig.json\`（用命令行参数编译），但任何认真的 TS 项目都会有一份 \`tsconfig.json\`，因为配置项实在太多，命令行参数无法管理。

理解 \`tsconfig.json\` 是 TS 工程化的基本功。本章会极其详细地讲解每个顶层字段和 \`compilerOptions\` 里几乎所有常用选项，给出推荐配置模板，并列出常见陷阱。

### tsconfig.json 的作用

#### 它做什么

1. **划定项目边界**：通过 \`include\` / \`exclude\` / \`files\` 指定哪些 \`.ts\` 文件属于本项目。
2. **配置编译行为**：通过 \`compilerOptions\` 控制 target、module、strict、输出目录等几十个选项。
3. **支持工具链**：IDE（VS Code）、打包器、lint 工具都会读 \`tsconfig.json\` 来理解项目的类型环境。
4. **继承与组合**：通过 \`extends\` 复用基础配置，通过 \`references\` 做项目引用。

#### 没有 tsconfig 会怎样

- \`tsc\` 默认编译当前目录所有 \`.ts\` 文件，用默认选项（target ES3、不严格）。
- IDE 无法提供准确的类型提示和路径别名解析。
- 团队成员的编译行为可能不一致。

### 顶层字段

\`tsconfig.json\` 的顶层有这些字段：

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| \`compilerOptions\` | object | 编译选项，最核心的字段 |
| \`include\` | string[] | 要编译的文件 glob 模式 |
| \`exclude\` | string[] | 要排除的文件 glob 模式 |
| \`files\` | string[] | 精确指定要编译的文件列表（优先级最高） |
| \`extends\` | string | 继承另一个 tsconfig 的配置 |
| \`references\` | object[] | 项目引用（复合项目） |
| \`compileOnSave\` | boolean | 让 IDE 在保存时自动编译（需 IDE 支持） |
| \`watchOptions\` | object | 监听模式的配置 |

#### include / exclude

\`include\` 和 \`exclude\` 用 glob 模式指定文件范围：

\`\`\`json
{
  "include": ["src/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
\`\`\`

- \`*\` 匹配 0 或多个字符（不含路径分隔符）。
- \`**/\` 匹配任意层级目录。
- \`?\` 匹配单个字符。
- 默认 \`include\` 是当前目录所有 \`.ts/.tsx/.d.ts\`。
- 默认 \`exclude\` 包含 \`node_modules\`、\`bower_components\`、\`jspm_packages\`、\`outDir\`。

⚠️ \`exclude\` 只影响"哪些文件被自动纳入编译"，**不影响**显式 \`import\` 进来的文件——被 import 的文件即使匹配 exclude 也会被编译。

#### files

\`files\` 是精确的文件列表，优先级高于 \`include\`。当你只想编译少数几个文件时用它：

\`\`\`json
{
  "files": ["src/index.ts", "src/cli.ts"]
}
\`\`\`

如果同时有 \`files\` 和 \`include\`，\`files\` 优先生效。

#### extends

\`extends\` 让一个 tsconfig 继承另一个的配置，实现复用：

\`\`\`json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext"
  }
}

// tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
\`\`\`

继承规则：子配置覆盖父配置（\`compilerOptions\` 是浅合并，顶层 \`include/exclude/files\` 完全替换不合并）。许多团队维护一份 \`tsconfig.base.json\`，各子项目各自 extends。

也可以 extends 来自 npm 包的配置，如 \`"extends": "@tsconfig/node20/tsconfig.json"\`。

#### references（项目引用）

\`references\` 用于把一个大项目拆成多个**子项目**，各自有独立 tsconfig，互相引用。每个子项目可以独立增量编译，提升大型项目的编译速度，也能更好地分离类型边界。

\`\`\`json
// 根 tsconfig.json
{
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ],
  "files": []
}

// packages/server/tsconfig.json
{
  "compilerOptions": { "composite": true, "outDir": "./dist" },
  "references": [{ "path": "../shared" }],
  "include": ["src"]
}
\`\`\`

被引用的子项目必须开启 \`composite: true\`。编译时用 \`tsc --build\` 而非 \`tsc\`，它会按依赖关系增量编译。

### compilerOptions 详解

这是 tsconfig 最核心的字段，包含几十个选项。下面按功能分组详解。

#### target

\`\`\`json
"target": "ES2020"
\`\`\`

指定编译后的 JS 目标版本。决定哪些语法被"降级"为旧语法，哪些保留。例如 \`target: ES5\` 会把 \`async/await\` 转成 generator，把箭头函数转成 function；\`target: ES2020\` 则保留 \`async/await\`、可选链、空值合并等现代语法。

可选值：\`ES3\`（默认，已废弃）、\`ES5\`、\`ES6/ES2015\`、\`ES2016\`…\`ES2022\`、\`ESNext\`。

⚠️ \`target\` 影响默认的 \`lib\`：\`target: ES2020\` 默认含 \`lib: ["ES2020", "DOM"]\`。如果你的代码跑在 Node（无 DOM），要手动改 \`lib\`。

#### module

\`\`\`json
"module": "CommonJS"
\`\`\`

指定编译产物的模块系统。常见值：

| 值 | 产物 | 适用 |
| --- | --- | --- |
| \`CommonJS\` | \`require\`/\`module.exports\` | Node 传统 |
| \`ES6/ES2015/ES2020/ESNext\` | \`import\`/\`export\` | 打包器、现代 Node ESM |
| \`Node16/NodeNext\` | 根据 package.json type 选择 | 现代 Node |
| \`UMD\` | 通用模块 | 库 |
| \`System\` | SystemJS | 特定场景 |

#### moduleResolution

模块解析策略，见上一章。常见值：\`node\`（node10）、\`node16\`、\`nodenext\`、\`bundler\`、\`classic\`。

#### lib

\`\`\`json
"lib": ["ES2020", "DOM", "DOM.Iterable"]
\`\`\`

指定可用的类型库（内置 API 的类型声明）。

- \`ES2020\`：含 \`Promise.allSettled\`、\`BigInt\`、\`globalThis\` 等 ES2020 API 类型。
- \`DOM\`：含 \`document\`、\`window\`、\`HTMLElement\` 等浏览器 API 类型。
- \`DOM.Iterable\`：让 DOM 集合可被 \`for...of\` 遍历。
- \`ScriptHost\`：Windows Script Host 环境。

⚠️ Node 项目应去掉 \`DOM\`（用 \`@types/node\` 替代），否则你会误用浏览器 API。

#### strict 及其子项

\`\`\`json
"strict": true
\`\`\`

\`strict: true\` 是一个总开关，等价于同时开启以下所有子选项：

| 子选项 | 作用 |
| --- | --- |
| \`strictNullChecks\` | \`null\`/\`undefined\` 不再赋值给其他类型，必须显式处理 |
| \`noImplicitAny\` | 禁止隐式 \`any\`（参数/变量无类型且无法推断时报错） |
| \`strictFunctionTypes\` | 函数参数类型双向检查改为逆变检查 |
| \`strictBindCallApply\` | \`bind\`/\`call\`/\`apply\` 严格类型检查 |
| \`strictPropertyInitialization\` | 类属性必须在构造函数里初始化 |
| \`noImplicitThis\` | 禁止 \`this\` 类型为隐式 \`any\` |
| \`alwaysStrict\` | 输出 JS 顶部加 \`"use strict"\` |
| \`useUnknownInCatchVariables\` | catch 子句变量类型为 \`unknown\` 而非 \`any\` |

**强烈建议新项目开启 \`strict: true\`**。它把 TS 从"可选类型注解"升级为"真正的类型安全"，能拦截大量潜在 bug。

#### esModuleInterop / allowSyntheticDefaultImports

\`\`\`json
"esModuleInterop": true,
"allowSyntheticDefaultImports": true
\`\`\`

见模块章节"与 CommonJS 互操作"。简言之：开启 \`esModuleInterop\` 后可以舒服地用 \`import fs from 'fs'\` 默认导入 CommonJS 模块。\`esModuleInterop\` 开启时自动开启 \`allowSyntheticDefaultImports\`。

#### experimentalDecorators / emitDecoratorMetadata

\`\`\`json
"experimentalDecorators": true,
"emitDecoratorMetadata": true
\`\`\`

- \`experimentalDecorators\`：开启实验性装饰器语法（本章上一节用到）。
- \`emitDecoratorMetadata\`：编译时为被装饰的成员注入类型元数据（需配合 \`reflect-metadata\`）。

⚠️ 这两个是**实验特性**，未来标准装饰器（TC39 Stage 3）落地后可能调整。新项目若不需要老式装饰器，可不开。

#### sourceMap / declaration / outDir / rootDir

\`\`\`json
"sourceMap": true,
"declaration": true,
"outDir": "./dist",
"rootDir": "./src"
\`\`\`

- \`sourceMap\`：生成 \`.js.map\` 源映射文件，便于调试时定位到 TS 源码。
- \`declaration\`：为每个 \`.ts\` 生成对应的 \`.d.ts\` 类型声明文件（发布库时必备）。
- \`declarationMap\`：生成 \`.d.ts.map\`，让 IDE 跳转到 TS 源码而非 \`.d.ts\`。
- \`outDir\`：输出目录。
- \`rootDir\`：源码根目录，控制输出目录结构（输出会保持 \`rootDir\` 之后的相对路径）。

⚠️ \`rootDir\` 默认是所有源文件的公共父目录。如果你把 \`.ts\` 放在 \`src/\`，又有个 \`scripts/x.ts\` 在 \`src/\` 外，\`rootDir\` 会变成项目根，导致输出多一层 \`src/\`。

#### jsx

\`\`\`json
"jsx": "react-jsx"
\`\`\`

JSX 处理方式：

| 值 | 行为 |
| --- | --- |
| \`preserve\` | 保留 \`.jsx\`，不转换 |
| \`react\` | 转成 \`React.createElement\` |
| \`react-jsx\` | 转成 \`_jsx\`（React 17+ 新 JSX 转换，无需 import React） |
| \`react-jsxdev\` | 开发版新 JSX 转换（带源码位置） |
| \`react-native\` | 保留 \`.jsx\` |

#### isolatedModules

\`\`\`json
"isolatedModules": true
\`\`\`

强制每个文件能被**独立转译**（不依赖其他文件的类型信息）。Babel、esbuild、Vite、swc 等单文件转译器都隐含此约束。开启后：

- \`const enum\` 当普通 enum 处理（因为单文件转译器看不到 const enum 的具体值）。
- 类型再导出必须用 \`export type\`。
- 不能用 \`export { SomeType }\`（SomeType 仅是类型）。

现代项目（尤其用 Vite/esbuild）建议开启 \`isolatedModules: true\`。

#### skipLibCheck / forceConsistentCasingInFileNames

\`\`\`json
"skipLibCheck": true,
"forceConsistentCasingInFileNames": true
\`\`\`

- \`skipLibCheck\`：跳过 \`.d.ts\` 文件的类型检查，大幅提升编译速度。强烈推荐开启——第三方库的类型问题你改不了，检查它们浪费时间。
- \`forceConsistentCasingInFileNames\`：强制文件名大小写一致（\`./Foo\` 和 \`./foo\` 视为不同）。在大小写不敏感的文件系统（macOS/Windows）上避免跨平台 bug。

#### paths / baseUrl

见模块章节"路径映射"。示例：

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
\`\`\`

#### noEmit / noEmitOnError

\`\`\`json
"noEmit": true,
"noEmitOnError": false
\`\`\`

- \`noEmit\`：只做类型检查，不输出 JS 文件。适合用打包器（webpack/vite）处理转译、tsc 只当类型检查器的场景。
- \`noEmitOnError\`：有类型错误时不输出文件。默认 false（有错也输出，便于开发）。

#### 其他常用选项

| 选项 | 作用 |
| --- | --- |
| \`allowJs\` | 允许编译 \`.js\` 文件 |
| \`checkJs\` | 在 \`.js\` 文件里做类型检查（配合 allowJs） |
| \`resolveJsonModule\` | 允许 import \`.json\` 文件 |
| \`esModuleInterop\` | 见上 |
| \`noUnusedLocals\` | 报错：未使用的局部变量 |
| \`noUnusedParameters\` | 报错：未使用的函数参数 |
| \`noFallthroughCasesInSwitch\` | 报错：switch 缺少 break 的 fallthrough |
| \`noImplicitReturns\` | 报错：函数路径缺少 return |
| \`types\` | 限制自动包含的 \`@types\` 包 |
| \`typeRoots\` | 自定义 \`@types\` 查找目录 |
| \`removeComments\` | 输出时移除注释 |
| \`importHelpers\` | 用 \`tslib\` 而非内联辅助函数（减小体积） |

### include/exclude 模式匹配细节

\`\`\`json
{
  "include": [
    "src/**/*.ts",          // src 下所有 .ts（含子目录）
    "src/**/*.tsx",         // src 下所有 .tsx
    "types/**/*.d.ts"       // 自定义声明文件
  ],
  "exclude": [
    "node_modules",         // 依赖
    "**/*.spec.ts",         // 所有测试文件
    "dist",                 // 产物
    "e2e/**/*"              // e2e 测试
  ]
}
\`\`\`

匹配规则：
- 模式相对于 \`tsconfig.json\` 所在目录。
- \`*\` 不跨目录，\`**\` 跨任意层目录。
- 不写扩展名时，\`.ts\`/\`.tsx\`/\`.d.ts\` 都会被匹配。

### extends 继承配置

继承是大型项目复用配置的关键。规则：

1. 父配置先加载，子配置的 \`compilerOptions\` **浅合并**覆盖父配置。
2. 顶层的 \`include\`/\`exclude\`/\`files\`/\`references\` 在子配置中**完全替换**父配置（不合并）。
3. \`extends\` 可以链式继承（A extends B extends C）。
4. 可以 extends 来自 npm 包的配置（如 \`@tsconfig/strictest\`）。

\`\`\`json
// 团队基础配置 tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

// 子项目 tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
\`\`\`

### project references（项目引用）

monorepo 场景下，把大项目拆成多个子项目，每个子项目有独立 tsconfig，通过 \`references\` 声明依赖关系：

\`\`\`json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,           // 必须开启，表示这是可被引用的子项目
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// packages/server/tsconfig.json
{
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "references": [
    { "path": "../shared" }      // 引用 shared 子项目
  ],
  "include": ["src"]
}
\`\`\`

编译用 \`tsc --build\`，它会：
1. 按依赖拓扑顺序编译。
2. 只重编译有变化的子项目（增量编译）。
3. 子项目产物（\`.d.ts\`）供引用方使用。

\`composite: true\` 要求：必须设 \`rootDir\`、必须生成 \`declaration\`、所有输入文件必须在 \`rootDir\` 内。

### 常见配置模板

#### Node 项目

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
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

#### React 项目（Vite）

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
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
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
\`\`\`

### 陷阱与最佳实践

1. **Node 项目别带 DOM lib**：会误用 \`window\`/\`document\`。
2. **strict 一定要开**：新项目开 \`strict: true\`，老项目逐步开启子项迁移。
3. **skipLibCheck 开启**：提速，且第三方类型问题你改不了。
4. **路径别名要双端配**：paths 只在编译期，运行时要配 alias。
5. **noEmit 适合打包器项目**：tsc 只做类型检查，转译交给打包器。
6. **isolatedModules 适合现代工具链**：避免 Babel/esbuild 转译不了的写法。
7. **rootDir 控制输出结构**：源文件分布影响输出层级。
8. **composite 子项目要规范**：rootDir/declaration 强制要求。

### 本章小结

\`tsconfig.json\` 是 TS 工程化的中枢。掌握 \`compilerOptions\` 的核心选项（target/module/lib/strict/moduleResolution/jsx 等）、include/exclude 模式、extends 继承、references 项目引用，以及针对不同场景的配置模板，你就能为任何 TS 项目搭好骨架。下面的 demo 会构造完整的 tsconfig 对象并用 JSON.stringify 打印解析，再尝试读取项目根目录的真实 tsconfig.json。`,
    code: `// ============================================================
// tsconfig 配置 —— 代码演示
// ------------------------------------------------------------
// tsconfig.json 本身是配置文件，不是可执行代码。这里用对象字面量
// 构造完整的 tsconfig 配置，JSON.stringify 打印并逐字段解析；
// 再用 fs 尝试读取项目根目录的真实 tsconfig.json（本项目是纯
// JS 的 Next.js 项目，可能不存在，用 try/catch 兜底）。
// ============================================================

const fs = require("fs");
const path = require("path");

// ============================================================
// 1. 构造一个完整的 tsconfig 对象（Node 项目模板）
// ============================================================
console.log("========== 1. 完整的 tsconfig（Node 项目模板）==========");

const tsconfig = {
  compilerOptions: {
    // ---- 语言与目标 ----
    target: "ES2020",          // 编译产物的 JS 版本，ES2020 保留 async/await、可选链等
    module: "CommonJS",        // 产物模块系统，CommonJS 用 require/module.exports
    moduleResolution: "node",  // 模块解析策略，node 模仿 Node CommonJS 解析
    lib: ["ES2020"],           // 可用的类型库；Node 项目不加 DOM，避免误用浏览器 API

    // ---- 严格性 ----
    strict: true,              // 总开关，等价于开启下面所有严格子项
    // strict: true 隐含开启：
    //   strictNullChecks        null/undefined 不能赋值给其他类型
    //   noImplicitAny           禁止隐式 any
    //   strictFunctionTypes     函数参数逆变检查
    //   strictBindCallApply     bind/call/apply 严格类型
    //   strictPropertyInitialization  类属性必须初始化
    //   noImplicitThis          this 不能是隐式 any
    //   alwaysStrict            输出 "use strict"
    //   useUnknownInCatchVariables  catch 变量为 unknown

    // ---- 模块互操作 ----
    esModuleInterop: true,           // 允许 import fs from 'fs' 默认导入 CommonJS
    allowSyntheticDefaultImports: true, // 类型层面允许合成默认导入（esModuleInterop 自动开）
    resolveJsonModule: true,         // 允许 import xxx from './data.json'

    // ---- 装饰器（实验特性）----
    experimentalDecorators: true,    // 开启实验性装饰器语法
    emitDecoratorMetadata: true,     // 为装饰器注入类型元数据（需 reflect-metadata）

    // ---- 输出 ----
    sourceMap: true,           // 生成 .js.map 源映射，便于调试
    declaration: true,         // 生成 .d.ts 声明文件（库必备）
    outDir: "./dist",          // 输出目录
    rootDir: "./src",          // 源码根目录，控制输出结构

    // ---- JSX（本项目不涉及，列出供参考）----
    // jsx: "react-jsx",       // React 17+ 新 JSX 转换

    // ---- 工程化 ----
    isolatedModules: true,     // 强制单文件可独立转译（Babel/esbuild/Vite 约束）
    skipLibCheck: true,        // 跳过 .d.ts 检查，大幅提速
    forceConsistentCasingInFileNames: true, // 强制文件名大小写一致

    // ---- 路径别名 ----
    baseUrl: ".",              // 路径解析基准目录
    paths: {
      "@/*": ["./src/*"],          // @/x 解析到 src/x
      "@utils/*": ["./src/utils/*"],
      "@components/*": ["./src/components/*"]
    },

    // ---- 类型包 ----
    types: ["node"],           // 只自动包含 @types/node，不自动包含其他 @types

    // ---- 输出控制 ----
    noEmit: false,             // false=输出 JS；true=只类型检查不输出
    noEmitOnError: false,      // 有类型错误也输出（便于开发）
    removeComments: false      // 保留注释
  },

  // ---- 文件范围 ----
  include: [
    "src/**/*.ts",       // src 下所有 .ts
    "src/**/*.tsx",      // src 下所有 .tsx
    "types/**/*.d.ts"    // 自定义声明文件
  ],
  exclude: [
    "node_modules",      // 依赖
    "dist",              // 产物
    "**/*.test.ts",      // 测试文件
    "**/*.spec.ts"
  ]
};

console.log(JSON.stringify(tsconfig, null, 2));

// ============================================================
// 2. 逐字段解析
// ============================================================
console.log("\\n========== 2. 逐字段解析 ==========");

const explanations: { key: string; value: any; desc: string }[] = [
  { key: "target", value: tsconfig.compilerOptions.target, desc: "编译产物 JS 版本，决定哪些语法被降级" },
  { key: "module", value: tsconfig.compilerOptions.module, desc: "产物模块系统（CommonJS/ESNext 等）" },
  { key: "moduleResolution", value: tsconfig.compilerOptions.moduleResolution, desc: "模块解析策略" },
  { key: "lib", value: tsconfig.compilerOptions.lib, desc: "可用的类型库；Node 项目不加 DOM" },
  { key: "strict", value: tsconfig.compilerOptions.strict, desc: "严格模式总开关，强烈建议开启" },
  { key: "esModuleInterop", value: tsconfig.compilerOptions.esModuleInterop, desc: "允许默认导入 CommonJS 模块" },
  { key: "experimentalDecorators", value: tsconfig.compilerOptions.experimentalDecorators, desc: "开启实验性装饰器" },
  { key: "emitDecoratorMetadata", value: tsconfig.compilerOptions.emitDecoratorMetadata, desc: "为装饰器注入类型元数据" },
  { key: "sourceMap", value: tsconfig.compilerOptions.sourceMap, desc: "生成源映射文件" },
  { key: "declaration", value: tsconfig.compilerOptions.declaration, desc: "生成 .d.ts 声明文件" },
  { key: "outDir", value: tsconfig.compilerOptions.outDir, desc: "输出目录" },
  { key: "rootDir", value: tsconfig.compilerOptions.rootDir, desc: "源码根目录，控制输出结构" },
  { key: "isolatedModules", value: tsconfig.compilerOptions.isolatedModules, desc: "强制单文件可独立转译" },
  { key: "skipLibCheck", value: tsconfig.compilerOptions.skipLibCheck, desc: "跳过 .d.ts 检查提速" },
  { key: "forceConsistentCasingInFileNames", value: tsconfig.compilerOptions.forceConsistentCasingInFileNames, desc: "强制文件名大小写一致" },
  { key: "baseUrl", value: tsconfig.compilerOptions.baseUrl, desc: "路径解析基准目录" },
  { key: "paths", value: tsconfig.compilerOptions.paths, desc: "路径别名映射（仅编译期生效）" },
  { key: "types", value: tsconfig.compilerOptions.types, desc: "限制自动包含的 @types 包" },
  { key: "noEmit", value: tsconfig.compilerOptions.noEmit, desc: "只类型检查不输出 JS" }
];

explanations.forEach(function (item) {
  console.log("  • " + item.key + " = " + JSON.stringify(item.value) + " —— " + item.desc);
});

// ============================================================
// 3. 不同项目模板对比
// ============================================================
console.log("\\n========== 3. 不同项目模板对比 ==========");

// Node 项目模板
const nodeConfig = {
  target: "ES2022",
  module: "Node16",
  moduleResolution: "Node16",
  lib: ["ES2022"],
  strict: true,
  types: ["node"],
  outDir: "./dist",
  rootDir: "./src"
};
console.log("--- Node 项目模板 ---");
console.log(JSON.stringify(nodeConfig, null, 2));

// React (Vite) 项目模板
const reactConfig = {
  target: "ES2020",
  lib: ["ES2020", "DOM", "DOM.Iterable"],
  module: "ESNext",
  moduleResolution: "bundler",
  jsx: "react-jsx",
  strict: true,
  isolatedModules: true,
  noEmit: true,
  paths: { "@/*": ["./src/*"] }
};
console.log("\\n--- React (Vite) 项目模板 ---");
console.log(JSON.stringify(reactConfig, null, 2));

// 库（Library）模板
const libConfig = {
  target: "ES2020",
  module: "ESNext",
  moduleResolution: "bundler",
  lib: ["ES2020"],
  strict: true,
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  outDir: "./dist",
  rootDir: "./src",
  isolatedModules: true
};
console.log("\\n--- 库 (Library) 模板 ---");
console.log(JSON.stringify(libConfig, null, 2));

// ============================================================
// 4. extends 继承配置示例
// ============================================================
console.log("\\n========== 4. extends 继承配置 ==========");

const baseConfig = {
  compilerOptions: {
    strict: true,
    target: "ES2020",
    module: "ESNext",
    moduleResolution: "bundler",
    skipLibCheck: true
  }
};

const childConfig = {
  extends: "./tsconfig.base.json",
  compilerOptions: {
    outDir: "./dist",     // 子配置覆盖/新增
    rootDir: "./src"
  },
  include: ["src"]        // 顶层 include 完全替换父配置
};

console.log("--- 基础配置 tsconfig.base.json ---");
console.log(JSON.stringify(baseConfig, null, 2));
console.log("\\n--- 子配置 tsconfig.json（extends 基础配置）---");
console.log(JSON.stringify(childConfig, null, 2));
console.log("\\n继承规则：compilerOptions 浅合并；顶层 include/exclude/files 完全替换");

// ============================================================
// 5. project references 项目引用示例
// ============================================================
console.log("\\n========== 5. project references 项目引用 ==========");

const rootConfig = {
  references: [
    { path: "./packages/shared" },
    { path: "./packages/server" },
    { path: "./packages/client" }
  ],
  files: []        // 根项目不直接编译文件，只做引用编排
};

const sharedConfig = {
  compilerOptions: {
    composite: true,       // 被引用的子项目必须开启 composite
    declaration: true,
    outDir: "./dist",
    rootDir: "./src"
  },
  include: ["src"]
};

const serverConfig = {
  compilerOptions: { outDir: "./dist", rootDir: "./src" },
  references: [{ path: "../shared" }],   // server 依赖 shared
  include: ["src"]
};

console.log("--- 根 tsconfig.json ---");
console.log(JSON.stringify(rootConfig, null, 2));
console.log("\\n--- packages/shared/tsconfig.json（被引用，composite）---");
console.log(JSON.stringify(sharedConfig, null, 2));
console.log("\\n--- packages/server/tsconfig.json（引用 shared）---");
console.log(JSON.stringify(serverConfig, null, 2));
console.log("\\n编译命令：tsc --build（按依赖拓扑增量编译）");

// ============================================================
// 6. 尝试读取项目根目录的真实 tsconfig.json
// ============================================================
console.log("\\n========== 6. 读取项目根目录的真实 tsconfig.json ==========");

// 沙箱里 __dirname 是 process.cwd()（项目根目录）
const tsconfigPath = path.join(__dirname, "tsconfig.json");
console.log("尝试读取: " + tsconfigPath);

try {
  // 同步读取文件内容
  const content = fs.readFileSync(tsconfigPath, "utf8");
  console.log("✅ 找到 tsconfig.json，内容如下：");
  // 尝试解析并美化输出
  try {
    const parsed = JSON.parse(content);
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    // 解析失败就直接打印原文
    console.log(content);
  }
} catch (e) {
  // 文件不存在会抛 ENOENT
  console.log("ℹ️ 当前项目没有 tsconfig.json");
  console.log("   原因: " + (e as Error).message);
  console.log("   这是一个纯 JavaScript 的 Next.js 项目，不需要 tsconfig.json。");
  console.log("   上面展示的完整配置就是典型 Node 项目的 tsconfig 示例。");
}

// ============================================================
// 7. strict 各子项演示
// ============================================================
console.log("\\n========== 7. strict 模式子项说明 ==========");

const strictSubOptions: { name: string; desc: string; example: string }[] = [
  { name: "strictNullChecks", desc: "null/undefined 不能赋值给其他类型", example: "let s: string = null 会报错" },
  { name: "noImplicitAny", desc: "禁止隐式 any", example: "function f(x) {} 的 x 报错" },
  { name: "strictFunctionTypes", desc: "函数参数逆变检查", example: "防止不安全的函数赋值" },
  { name: "strictBindCallApply", desc: "bind/call/apply 严格类型", example: "fn.call(null, 1) 参数要匹配" },
  { name: "strictPropertyInitialization", desc: "类属性必须初始化", example: "class C { x: number; } 报错" },
  { name: "noImplicitThis", desc: "this 不能是隐式 any", example: "普通函数里的 this 需标注" },
  { name: "alwaysStrict", desc: "输出 use strict", example: "JS 顶部加 'use strict'" },
  { name: "useUnknownInCatchVariables", desc: "catch 变量为 unknown", example: "catch (e) 中 e 是 unknown" }
];

console.log("strict: true 等价于同时开启以下 " + strictSubOptions.length + " 个子项：");
strictSubOptions.forEach(function (item, i) {
  console.log("  " + (i + 1) + ". " + item.name);
  console.log("     作用: " + item.desc);
  console.log("     示例: " + item.example);
});

// ============================================================
// 8. 模块解析策略对比
// ============================================================
console.log("\\n========== 8. 模块解析策略对比 ==========");

const resolutions: { name: string; desc: string; useCase: string }[] = [
  { name: "classic", desc: "最古老，不考虑 node_modules", useCase: "遗留项目" },
  { name: "node (node10)", desc: "模仿 Node CommonJS 解析", useCase: "旧 Node 项目" },
  { name: "node16/nodenext", desc: "遵循 Node 现代解析，ESM 要求扩展名", useCase: "现代 Node" },
  { name: "bundler", desc: "结合 node 便利性与打包器特性", useCase: "Vite/webpack/esbuild" }
];

resolutions.forEach(function (item) {
  console.log("  • " + item.name + " —— " + item.desc + "（适用：" + item.useCase + "）");
});

console.log("\\ntsconfig 配置章节演示完成！");`,
  },

  // =========================================================
  // 第四章：声明文件与实战
  // =========================================================
  {
    id: "ts-declaration",
    title: "声明文件与实战",
    icon: "📄",
    group: "工程化",
    content: `## 声明文件与实战

JavaScript 生态有海量现成的库（npm 上几百万个），但绝大多数是纯 JS 写的，没有类型信息。TypeScript 要使用这些库，就需要有人为它们提供"类型描述"——这就是**声明文件（Declaration Files，\`.d.ts\`）**的使命。声明文件只包含类型信息，不含任何可执行代码，编译后会被完全擦除。

理解声明文件是 TS 工程化的进阶能力。本章会极其详细地讲解：声明文件是什么、为什么需要、如何编写（\`declare\` 各种形式、\`declare module\`、\`declare global\`）、\`@types\` 生态、自动生成声明文件、三斜线指令，以及为 JS 模块补充类型的实战。

### 什么是声明文件

#### 定义

声明文件是扩展名为 \`.d.ts\` 的文件，里面**只有类型声明**（interface、type、declare 等），没有实际实现。它的作用是告诉 TypeScript"某个变量/模块/全局存在，并且具有这样的类型"。

\`\`\`ts
// types.d.ts —— 声明文件
declare const VERSION: string;          // 声明一个全局常量
declare function greet(name: string): string;  // 声明一个全局函数
declare module 'math-lib' {             // 声明一个模块的类型
  export function add(a: number, b: number): number;  // 导出函数 add
}
\`\`\`

#### 特点

1. **纯类型，无实现**：声明文件里的函数只有签名没有函数体；变量只有类型没有值。
2. **编译后完全擦除**：\`.d.ts\` 不产生任何 JS 代码。
3. **可被自动消费**：TS 编译器会自动把项目里的 \`.d.ts\` 纳入类型环境（只要在 \`include\` 范围或 \`@types\` 里）。
4. **用于描述外部**：主要描述"非 TS 写的"或"已编译的"代码的类型。

### 为什么需要声明文件

#### 场景一：使用纯 JS 库

假设你 \`\`npm i lodash\`\`，但 lodash 是纯 JS。直接在 TS 里 \`import _ from 'lodash'\` 会报错："找不到模块 'lodash' 的声明"。因为 TS 不知道 lodash 有什么 API、什么类型。

解决办法：安装 \`@types/lodash\`（来自 DefinitelyTyped 社区），它提供了 lodash 的 \`.d.ts\` 声明文件，TS 就能识别 lodash 的所有方法了。

#### 场景二：全局变量

HTML 里通过 \`<script>\` 引入的库（如 jQuery）会挂全局变量 \`$\`。TS 默认不认识 \`$\`，会报错。需要声明：

\`\`\`ts
// globals.d.ts
declare const $: (selector: string) => any;  // 箭头函数（注意：any 关闭了类型检查）
\`\`\`

#### 场景三：为 JS 项目渐进迁移

老项目从 JS 迁移到 TS 时，可以先用 \`.d.ts\` 给现有 JS 文件补类型（配合 \`allowJs\` + \`checkJs\`），逐步过渡。

#### 场景四：发布库的类型

你用 TS 写了一个库，发布到 npm 时除了 \`.js\`，还要发布 \`.d.ts\`，让使用方（即使是 TS 项目）能获得类型提示。开启 \`declaration: true\` 即可自动生成。

### 编写声明文件：declare 的各种形式

\`declare\` 关键字用于"声明一个已存在但 TS 不知道的东西"。它告诉 TS："相信我，这个东西在运行时存在，类型是这样。"

#### declare var / let / const

声明一个全局变量。三者区别在于是否只读（const 只读）：

\`\`\`ts
declare var __DEV__: boolean;     // 可变全局变量
declare const __VERSION__: string; // 只读全局常量
\`\`\`

#### declare function

声明一个全局函数：

\`\`\`ts
declare function greet(name: string): string;
declare function assert(cond: boolean, msg?: string): void;
\`\`\`

注意：函数只有签名，没有函数体（以 \`;\` 结尾而非 \`{}\`）。

#### declare class

声明一个全局可用的类：

\`\`\`ts
declare class Animal {
  constructor(name: string);  // 调用 constructor
  name: string;
  move(distance: number): void;  // 方法声明 move(distance: number)，返回 void
}
\`\`\`

#### declare enum

声明一个全局枚举（一般少用，因为枚举通常在模块内）：

\`\`\`ts
declare enum Color { Red, Green, Blue }
\`\`\`

#### declare namespace

声明一个全局命名空间（常用于描述挂载在 window 上的库对象）：

\`\`\`ts
declare namespace MyApp {
  const version: string;
  function init(config: object): void;  // 定义函数 init，参数: config: object
  interface Options { timeout?: number }  // 定义接口 Options
}
\`\`\`

#### declare module 'xxx'（模块声明）

最常用！为一个**模块**（裸模块名）提供类型：

\`\`\`ts
// 声明一个 CommonJS/ESM 模块的类型
declare module 'math-lib' {
  export function add(a: number, b: number): number;  // 导出函数 add
  export function multiply(a: number, b: number): number;  // 导出函数 multiply
  export const PI: number;  // 导出 const PI
  // 默认导出
  const square: (x: number) => number;  // 声明常量 square，类型 (x: number)
  export default square;  // 导出 default square
}

// 简写形式：模块任意导出，类型为 any（不推荐，丢失类型安全）
declare module 'untyped-lib';
\`\`\`

之后就能 \`import { add } from 'math-lib'\` 而不报错，且 \`add\` 有正确类型。

#### declare global

在模块文件里（有顶层 import/export 的文件）往全局作用域添加类型：

\`\`\`ts
// global.d.ts
declare global {
  interface Window {  // 定义接口 Window
    myApp: { version: string };
  }
  const __DEV__: boolean;
}
export {}; // 这个 export 让文件成为模块，从而能用 declare global
\`\`\`

⚠️ \`declare global\` 必须在**模块**文件里使用（文件要有 import/export）。在纯脚本文件里直接写全局声明即可，不需要 \`declare global\`。

### @types 生态（DefinitelyTyped）

#### DefinitelyTyped 是什么

[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 是一个巨大的 GitHub 仓库，社区为成千上万个流行的 JS 库维护类型声明。这些声明以 \`@types/<包名>\` 的形式发布到 npm。

\`\`\`bash
npm install --save-dev @types/lodash @types/node @types/jest  # 安装依赖
\`\`\`

安装后，TS 会自动把 \`node_modules/@types/*/index.d.ts\` 纳入类型环境（前提是 \`typeRoots\` 默认或包含 \`@types\`）。

#### types / typeRoots 选项

\`\`\`json
{
  "compilerOptions": {
    "types": ["node", "jest"],      // 只自动包含这两个 @types
    "typeRoots": ["./node_modules/@types", "./my-types"]
  }
}
\`\`\`

- \`types\`：限制自动包含的 @types 包（不设则自动包含所有 @types）。
- \`typeRoots\`：自定义 @types 查找目录。

#### 库自带类型

越来越多的库自带 \`.d.ts\`（在 \`package.json\` 的 \`types\` 或 \`typings\` 字段指向）。这种库不需要装 @types。判断方法：\`package.json\` 有 \`types\`/ \`typings\` 字段，或 \`index.d.ts\` 存在。

| 库的类型来源 | 安装方式 |
| --- | --- |
| 自带 .d.ts | 直接 npm i 库即可 |
| @types 包 | npm i -D @types/库名 |
| 都没有 | 自己写 declare module |

### 自动生成声明文件

如果你用 TS 写库，开启 \`declaration: true\`，tsc 会为每个 \`.ts\` 自动生成对应的 \`.d.ts\`：

\`\`\`json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,   // 生成 .d.ts.map，便于跳转源码
    "emitDeclarationOnly": true, // 只生成 .d.ts 不生成 .js（转译交给打包器）
    "outDir": "./dist"
  }
}
\`\`\`

\`\`\`ts
// src/index.ts
export function add(a: number, b: number): number {  // 导出函数 add
  return a + b;  // 返回 a + b
}
\`\`\`

自动生成 \`dist/index.d.ts\`：

\`\`\`ts
export declare function add(a: number, b: number): number;  // 导出 declare function
\`\`\`

注意自动生成的声明会**剥离私有实现**，只保留导出的 API 类型。

### 三斜线指令

声明文件里常用三斜线指令声明依赖（见模块章节）：

\`\`\`ts
/// <reference path="./types.d.ts" />   // 依赖另一个声明文件
/// <reference types="node" />          // 依赖 @types/node
/// <reference lib="es2020" />          // 依赖某个 lib
\`\`\`

在 .d.ts 里，如果它依赖其他 .d.ts，用 \`/// <reference path>\` 声明。现代项目更多用 \`import\` / \`tsconfig\` 的 \`types\` 替代。

### 实战：为一个 JS 模块写 .d.ts

假设有个纯 JS 模块 \`string-utils.js\`：

\`\`\`js
// string-utils.js
exports.capitalize = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };  // 赋值 exports.capitalize
exports.repeat = function (s, n) { return s.repeat(n); };  // 赋值 exports.repeat
exports.default = function (s) { return s.trim(); };  // 赋值 exports.default
\`\`\`

为它写声明 \`string-utils.d.ts\`：

\`\`\`ts
declare module 'string-utils' {
  export function capitalize(s: string): string;  // 导出函数 capitalize
  export function repeat(s: string, n: number): string;  // 导出函数 repeat
  export default function trim(s: string): string;  // 导出函数 trim
}
\`\`\`

之后 \`import trim, { capitalize } from 'string-utils'\` 就有类型了。

### typeof 获取已有变量的类型

\`typeof\` 在类型位置可以获取一个**值**的类型，常用于从现成对象推导类型，避免重复定义：

\`\`\`ts
const config = { port: 3000, host: 'localhost' };  // 声明常量 config
type Config = typeof config;            // { port: number; host: string }
type ConfigKeys = keyof typeof config;  // 'port' | 'host'
\`\`\`

这在声明文件和类型编程里非常有用——你可以先写一个"示例对象"，再用 \`typeof\` 提取类型，比手写 interface 更不容易脱节。

### 声明合并（Declaration Merging）

TS 允许多个同名声明**合并**：

- **interface 合并**：同名 interface 的成员会合并到一起。
- **namespace 合并**：同名 namespace 的内容会合并。
- **namespace 与 function/class/enum 合并**：namespace 可以给函数/类/枚举"添加"静态成员。

\`\`\`ts
interface Window { foo: string; }   // 合并到全局 Window
interface Window { bar: number; }  // 定义接口 Window
// 现在 Window 同时有 foo 和 bar
\`\`\`

声明合并常用于扩展第三方库的类型（如给 Express 的 Request 加属性）。

### 陷阱与最佳实践

1. **别滥用 any**：写声明时尽量精确，泛滥的 any 等于没类型。
2. **declare module 简写 \`declare module 'x';\` 是 any 毒药**：会让该模块所有导入都是 any，丢失类型安全。尽量写完整声明。
3. **全局声明污染**：\`declare global\` 会污染全局命名空间，谨慎使用，优先用模块。
4. **优先自动生成**：自己的库用 \`declaration: true\` 自动生成，手写容易和实现脱节。
5. **@types 版本要对齐**：\`@types/foo\` 的版本要和 \`foo\` 主版本匹配，否则类型可能不准。
6. **isolatedModules 下注意**：纯类型重导出用 \`export type\`。
7. **declare 与 export 的区别**：\`declare\` 描述"已存在"的东西；\`export\` 是"导出自己定义的"。声明文件里用 declare。

### 本章小结

声明文件是 TS 与 JS 生态的桥梁。掌握 \`declare\` 的各种形式、\`declare module\` 模块声明、\`declare global\` 全局扩展、\`@types\` 生态的使用、\`declaration: true\` 自动生成，以及 \`typeof\` 提取类型，你就能为任何 JS 库补全类型，也能发布带类型的 TS 库。下面的 demo 用真实的 \`declare\` 语法（编译后被擦除）配合对象字面量模拟运行时值，演示声明文件的编写与使用。`,
    code: `// ============================================================
// 声明文件与实战 —— 代码演示
// ------------------------------------------------------------
// .d.ts 内容是纯类型声明，转译后被完全擦除。这里用真实的
// declare module / declare const / declare global 语法（编译期
// 存在，运行时擦除），再用对象字面量模拟"被声明的模块/全局"
// 的运行时值，演示声明文件如何为 JS 代码补充类型。
// ============================================================

// ============================================================
// 1. declare module —— 为一个模块声明类型
// ============================================================
// 下面这段在编译期是类型声明，转译后会被完全擦除。
// 它模拟 string-utils.d.ts 文件的内容：
declare module "string-utils" {
  // 命名导出
  export function capitalize(s: string): string;
  export function repeat(s: string, n: number): string;
  export const VERSION: string;
  // 默认导出
  export default function trim(s: string): string;
  // 也可以导出类型
  export interface StringUtilsOptions {
    trim?: boolean;
    lowercase?: boolean;
  }
}

// 模拟"运行时"的 string-utils 模块（实际由 JS 文件提供）
// 真实环境里 require('string-utils') 会加载该 JS 文件；
// 这里用对象字面量模拟它的运行时值。
const stringUtilsModule = {
  capitalize: function (s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  repeat: function (s: string, n: number): string {
    let result = "";
    for (let i = 0; i < n; i++) result += s;
    return result;
  },
  VERSION: "1.2.0",
  default: function trim(s: string): string {
    return s.trim();
  }
};

console.log("========== 1. declare module 模块声明 ==========");
// 模拟 import { capitalize, repeat, VERSION } from 'string-utils'
const { capitalize, repeat, VERSION } = stringUtilsModule;
// 模拟 import trim from 'string-utils'（默认导入）
const trim = stringUtilsModule.default;

console.log("capitalize('hello') =", capitalize("hello"));
console.log("repeat('ab', 3) =", repeat("ab", 3));
console.log("VERSION =", VERSION);
console.log("trim('  hi  ') =", trim("  hi  "));

// ============================================================
// 2. declare const / var / function —— 全局声明
// ============================================================
// 以下声明在编译期存在（让 TS 认识这些全局），运行时擦除：
declare const __APP_VERSION__: string;
declare var __DEV__: boolean;
declare function globalGreet(name: string): string;

// 模拟这些全局变量/函数在运行时被注入（如由构建工具或脚本注入）
// globalThis 是 vm 上下文的全局对象，给它挂属性即"全局变量"
(globalThis as any).__APP_VERSION__ = "2.1.0";
(globalThis as any).__DEV__ = true;
(globalThis as any).globalGreet = function (name: string): string {
  return "Hello, " + name + "!";
};

console.log("\\n========== 2. declare const/var/function 全局声明 ==========");
// 此时这些"全局"在运行时已存在，可直接使用
console.log("__APP_VERSION__ =", __APP_VERSION__);
console.log("__DEV__ =", __DEV__);
console.log("globalGreet('World') =", globalGreet("World"));

// ============================================================
// 3. declare namespace —— 描述一个全局对象库
// ============================================================
// 模拟 jQuery 这种挂载在全局的库：declare namespace $
declare namespace MyLib {
  const version: string;
  function init(config: object): void;
  interface Options {
    timeout?: number;
    retries?: number;
  }
  namespace utils {
    function formatDate(d: Date): string;
  }
}

// 运行时模拟：把 MyLib 挂到全局
(globalThis as any).MyLib = {
  version: "3.0.0",
  init: function (config: object): void {
    console.log("MyLib.init 收到配置:", JSON.stringify(config));
  },
  utils: {
    formatDate: function (d: Date): string {
      return d.toISOString().slice(0, 10);
    }
  }
};

console.log("\\n========== 3. declare namespace 全局对象库 ==========");
console.log("MyLib.version =", MyLib.version);
MyLib.init({ timeout: 1000, retries: 3 });
console.log("MyLib.utils.formatDate =", MyLib.utils.formatDate(new Date("2026-06-27")));

// ============================================================
// 4. declare global —— 扩展全局作用域
// ============================================================
// 在模块文件里用 declare global 扩展全局接口（如给 Window 加属性）
// 这里演示扩展一个全局接口 GlobalConfig
declare global {
  interface GlobalConfig {
    apiBaseUrl: string;
    timeout: number;
  }
  const GLOBAL_CONFIG: GlobalConfig;
}
// 这个 export 让文件成为"模块"，才能使用 declare global
export {};

// 运行时注入 GLOBAL_CONFIG
(globalThis as any).GLOBAL_CONFIG = {
  apiBaseUrl: "https://api.example.com",
  timeout: 5000
};

console.log("\\n========== 4. declare global 扩展全局 ==========");
console.log("GLOBAL_CONFIG.apiBaseUrl =", GLOBAL_CONFIG.apiBaseUrl);
console.log("GLOBAL_CONFIG.timeout =", GLOBAL_CONFIG.timeout);

// ============================================================
// 5. typeof 获取已有变量的类型
// ============================================================
console.log("\\n========== 5. typeof 获取类型 ==========");

// 定义一个"示例对象"
const defaultUser = {
  name: "匿名",
  age: 0,
  roles: ["guest"],
  isActive: false
};

// 用 typeof 从值推导类型（编译期类型，运行时擦除）
type User = typeof defaultUser;       // { name: string; age: number; roles: string[]; isActive: boolean }
type UserKeys = keyof typeof defaultUser;  // "name" | "age" | "roles" | "isActive"

// 运行时验证：typeof 运算符返回值类型字符串
console.log("defaultUser 的运行时 typeof:", typeof defaultUser);
console.log("defaultUser 的 keys:", Object.keys(defaultUser));

// 用推导出的类型创建新对象
const realUser: User = {
  name: "张三",
  age: 30,
  roles: ["admin", "user"],
  isActive: true
};
console.log("用 typeof 推导类型创建的 realUser:", JSON.stringify(realUser));

// keyof typeof 应用：类型安全的属性访问
function getUserProp(key: UserKeys): any {
  return defaultUser[key];
}
console.log("getUserProp('name') =", getUserProp("name"));
console.log("getUserProp('age') =", getUserProp("age"));

// ============================================================
// 6. 声明合并（Declaration Merging）
// ============================================================
console.log("\\n========== 6. 声明合并 ==========");

// 同名 interface 会合并：第一段
interface Animal {
  name: string;
  age: number;
}
// 同名 interface 第二段：合并进去
interface Animal {
  color: string;
  speak(): void;
}

// 合并后 Animal 同时有 name/age/color/speak
const cat: Animal = {
  name: "小橘",
  age: 3,
  color: "橙色",
  speak: function (): void {
    console.log("喵~");
  }
};
console.log("声明合并后的 Animal:", JSON.stringify(cat));
cat.speak();

// namespace 与 function 合并：给函数添加静态属性
function counter(): number {
  return counter.current++;
}
namespace counter {
  export let current: number = 0;
  export function reset(): void {
    current = 0;
  }
}

console.log("\\nnamespace 与 function 合并：");
console.log("counter() =", counter());
console.log("counter() =", counter());
console.log("counter() =", counter());
console.log("counter.current =", counter.current);
counter.reset();
console.log("reset 后 counter.current =", counter.current);

// ============================================================
// 7. @types 生态概念演示
// ============================================================
console.log("\\n========== 7. @types 生态概念 ==========");

// 模拟 @types/node 提供的 process 类型声明（节选）
// 真实 @types/node 里 process 有完整类型；这里演示概念
declare module "fake-node-types" {
  export const version: string;
  export const platform: string;
  export function cwd(): string;
  export interface ProcessEnv {
    [key: string]: string | undefined;
  }
  export const env: ProcessEnv;
}

// 模拟运行时的 process（沙箱已注入 process 全局）
console.log("process.version =", process.version);
console.log("process.platform =", process.platform);
console.log("process.cwd() =", process.cwd());
console.log("process.env.NODE_ENV =", process.env.NODE_ENV);
console.log("（这些类型由 @types/node 提供，是声明文件的典型应用）");

// ============================================================
// 8. 三斜线指令概念（注释展示）
// ============================================================
console.log("\\n========== 8. 三斜线指令概念 ==========");
// 三斜线指令在 .d.ts 文件里声明依赖，运行时完全无效，这里用注释展示：
// /// <reference path="./types.d.ts" />    // 依赖另一个声明文件
// /// <reference types="node" />          // 依赖 @types/node
// /// <reference lib="es2020" />          // 引用 lib
console.log("三斜线指令（/// reference）用于 .d.ts 文件声明依赖，运行时被擦除");
console.log("现代项目多用 import / tsconfig 的 types 选项替代");

// ============================================================
// 9. 自动生成声明文件概念演示
// ============================================================
console.log("\\n========== 9. 自动生成声明文件概念 ==========");

// 模拟一个用 TS 写的库源码
const librarySource = [
  "// src/math-lib.ts",
  "export function add(a: number, b: number): number {",
  "  return a + b;",
  "}",
  "export function multiply(a: number, b: number): number {",
  "  return a * b;",
  "}"
].join("\\n");

// 模拟 tsc --declaration 自动生成的 .d.ts
const generatedDeclaration = [
  "// dist/math-lib.d.ts（由 declaration: true 自动生成）",
  "export declare function add(a: number, b: number): number;",
  "export declare function multiply(a: number, b: number): number;"
].join("\\n");

console.log("库源码 src/math-lib.ts：");
console.log(librarySource);
console.log("\\n自动生成的声明 dist/math-lib.d.ts：");
console.log(generatedDeclaration);
console.log("\\n（开启 declaration: true 后，tsc 为每个 .ts 生成对应 .d.ts，剥离实现只保留类型）");

// ============================================================
// 10. 综合：为 JS 模块补全类型并使用
// ============================================================
console.log("\\n========== 10. 综合：为 JS 模块补全类型 ==========");

// 假设有个纯 JS 模块 logger.js（运行时值）
const loggerModule = {
  log: function (level: string, msg: string): void {
    console.log("[" + level + "] " + msg);
  },
  info: function (msg: string): void {
    console.log("[INFO] " + msg);
  },
  error: function (msg: string): void {
    console.log("[ERROR] " + msg);
  },
  levels: ["debug", "info", "warn", "error"],
  default: function (msg: string): void {
    console.log("[LOG] " + msg);
  }
};

// 为它写声明（编译期类型，运行时擦除）
declare module "logger" {
  export type LogLevel = "debug" | "info" | "warn" | "error";
  export function log(level: LogLevel, msg: string): void;
  export function info(msg: string): void;
  export function error(msg: string): void;
  export const levels: LogLevel[];
  export default function (msg: string): void;
}

// 使用（模拟 import）
const { log: logMsg, info, error: logError, levels } = loggerModule;
const defaultLog = loggerModule.default;

console.log("可用日志级别:", JSON.stringify(levels));
logMsg("warn", "这是一条警告");
info("这是一条信息");
logError("这是一条错误");
defaultLog("默认日志输出");

// typeof 提取 logger 模块的类型，复用
type LoggerModule = typeof loggerModule;
type LoggerKeys = keyof LoggerModule;
console.log("\\nlogger 模块的导出键:", Object.keys(loggerModule));

console.log("\\n声明文件与实战章节演示完成！");
// 注意：导出的 logger 类型让使用方即使在 TS 项目里也能获得完整提示。`
  },
];
