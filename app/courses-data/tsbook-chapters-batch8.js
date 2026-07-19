// =============================================================
// TypeScript 全解 · Batch 8：模块工程化（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 模块化与工程化配置的完整链路：
//   1. ES 模块与 CommonJS   tsbook-module-system
//   2. 命名空间 namespace    tsbook-namespace
//   3. 声明文件 .d.ts        tsbook-declaration-file
//   4. tsconfig.json 详解    tsbook-tsconfig
//   5. 严格模式详解          tsbook-strict-mode
// 章节归属 group：模块工程化
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：ES 模块与 CommonJS
  // ===========================================================
  {
    id: "tsbook-module-system",
    title: "ES 模块与 CommonJS",
    icon: "📦",
    group: "模块工程化",
    content: `# 📦 ES 模块与 CommonJS

JavaScript 历史上出现过两套模块系统：**CommonJS**（Node.js 传统方案）和 **ES Modules**（ES6 标准）。TypeScript 两者都支持，理解它们的差异是写工程化代码的前提。

## 一、ES 模块：\`import\` / \`export\`

ES 模块是**官方标准**，浏览器、Node、Deno、Bun 都支持。核心语法：

\`\`\`ts
// === 导出（一个文件就是一个模块）===
export const name = "ts";              // 命名导出：变量
export function add(a: number, b: number) { return a + b; }  // 命名导出：函数
export class User { }                  // 命名导出：类
export type ID = string;               // 命名导出：类型

// 默认导出：一个模块只能有一个
export default function main() { }
\`\`\`

\`\`\`ts
// === 导入 ===
import { name, add } from "./util";    // 命名导入
import * as Util from "./util";        // 命名空间导入：整个模块当成一个对象
import main from "./app";              // 默认导入：不用花括号
import main, { add } from "./app";     // 默认 + 命名混合导入
import type { ID } from "./util";      // 只导入类型（编译后被擦除）
\`\`\`

## 二、CommonJS：\`require\` / \`module.exports\`

\`\`\`ts
// 导出
module.exports = { add: (a, b) => a + b };
// 等价写法
exports.add = (a, b) => a + b;

// 导入
const fs = require("fs");
const { add } = require("./util");
\`\`\`

CommonJS 是**运行时加载**（\`require\` 是函数），可以动态决定加载哪个模块；ES 模块是**静态声明**（\`import\` 必须在顶层），编译时就能确定依赖关系——这也是为什么 tree-shaking 只对 ES 模块有效。

## 三、TypeScript 的 \`module\` 编译选项

\`tsconfig.json\` 里的 \`module\` 决定编译产物用哪种模块格式：

| 值 | 适用场景 |
|------|---------|
| \`commonjs\` | Node.js 传统项目 |
| \`esnext\` / \`es2022\` | 现代打包器（Vite / webpack / esbuild） |
| \`node16\` / \`nodenext\` | Node.js 现代 ESM 项目 |
| \`system\` | SystemJS（已少见） |

## 四、\`esModuleInterop\`：互操作的关键

CommonJS 模块没有"默认导出"的概念——\`module.exports\` 本身就是整个对象。但 ES 模块的 \`import x from "cjs-module"\` 期望拿到默认导出。开了 \`esModuleInterop\`，TS 会自动包一层，让两种写法都能工作：

\`\`\`ts
// esModuleInterop: false 时报错（React 没有 default）
import React from "react";
// 此时只能这样写
import * as React from "react";
\`\`\`

> ⭐ 新项目一律开启 \`esModuleInterop: true\`，省掉一堆麻烦。

## 五、动态 \`import()\`

\`\`\`import()\` 是表达式（不是语句），返回 Promise，可以**按需加载**：

\`\`\`ts
const mod = await import("./heavy-module");
mod.runHeavyTask();
\`\`\`

适合路由懒加载、按需加载大依赖（如 monaco-editor、echarts）。

## 六、一句话总结

- **新项目统一用 ES 模块**：\`import\` / \`export\` + \`module: "esnext"\`。
- 老项目混用时**开 \`esModuleInterop\`**。
- 按需加载用 \`import()\`，别用 \`require\`。

> *下一章，命名空间——TS 早期的"模块"方案。*`,
    code: `// 📦 ES 模块与 CommonJS 互操作 Demo

// ============================================================
// 1️⃣ export 的多种写法（演示用 namespace 隔离，真实场景在文件顶层）
// ============================================================

// 命名导出：变量、函数、类、类型都可以 export
namespace MathUtil {
  export const PI = 3.14159;                  // 导出常量
  export function add(a: number, b: number): number {  // 导出函数
    return a + b;
  }
  export function mul(a: number, b: number): number {
    return a * b;
  }
  const _internal = "私有，外部访问不到";     // 不导出 = 模块私有
}

// 演示访问
console.log("--- 1️⃣ 命名导出 ---");
console.log("MathUtil.PI   =", MathUtil.PI);  // 3.14159
console.log("MathUtil.add  =", MathUtil.add(2, 3));  // 5
console.log("MathUtil.mul  =", MathUtil.mul(2, 3));  // 6

// ============================================================
// 2️⃣ 默认导出与命名导出的区别（语法演示）
// ============================================================
// 在真实 .ts 文件顶层可以这样写：
//   export default function main() { /* ... */ }
//   export function helper() { /* ... */ }
// 导入方写法：
//   import main, { helper } from "./app";   // default 不用花括号
//   import * as App from "./app";           // 命名空间导入
//   import type { Config } from "./app";    // 只导入类型，编译后被擦除

console.log("--- 2️⃣ 默认导出语法（见注释）---");
console.log("export default 一个模块只能有一个，导入时不加花括号");

// ============================================================
// 3️⃣ 动态 import()：返回 Promise，按需加载
// ============================================================

// import() 是表达式，可以在任意位置调用，返回 Promise<Module>
// 这里用 try/catch 包裹，因为示例环境可能没有对应模块文件
async function loadDynamic(): Promise<void> {
  console.log("--- 3️⃣ 动态 import() ---");
  try {
    // 动态加载 Node.js 内置模块（演示真实可用场景）
    // 等价于: import fs from "fs"，但运行时才执行
    const fsModule = await import("fs");
    console.log("动态加载 fs 模块成功，类型：", typeof fsModule);
    console.log("fs.existsSync 存在：", typeof fsModule.existsSync === "function");
  } catch (err) {
    // 模块不存在时降级处理
    console.log("动态 import 失败：", (err as Error).message);
  }
}

// 同步演示动态 import 的 Promise 特性
console.log("调用 loadDynamic() 前");
loadDynamic().then(() => {
  console.log("loadDynamic() 完成");
});

// ============================================================
// 4️⃣ CommonJS 互操作：require 与 import 的转换
// ============================================================

// 声明 require 函数（让 TS 不报错；真实环境 Node 自带）
declare function require(id: string): any;

// CommonJS 模块导出方式：module.exports = ...
// 在 TS 里用 export = 模拟（编译后变成 module.exports）
// 真实文件：export = { add: (a, b) => a + b };
// 对应 import 写法（esModuleInterop 开启时）：
//   import lib = require("./cjs-lib");
//   或 import lib from "./cjs-lib";  （需要 esModuleInterop）

// 演示 require 与 import 等价场景
console.log("--- 4️⃣ CommonJS 互操作 ---");

// require 是运行时函数，可以动态决定加载哪个模块
function loadModuleConditionally(useNew: boolean): unknown {
  // 真实场景：根据配置加载新旧版本
  // const mod = require(useNew ? "./v2" : "./v1");
  // 这里用内置模块演示
  const path = require("path");
  return typeof path;  // "object"
}
console.log("require('path') 类型：", loadModuleConditionally(true));

// ============================================================
// 5️⃣ import type 与 import 的区别
// ============================================================

// import type 只导入类型信息，编译后整行被擦除，不会出现在 JS 产物里
// 适合只用来做类型注解、不实际调用的情况
interface UserConfig {
  // 类型定义：编译后会被擦除
  id: number;
  name: string;
  settings: {
    theme: "light" | "dark";
    lang: string;
  };
}

// 用类型注解（不会产生运行时代码）
function renderConfig(cfg: UserConfig): string {
  return \`#\${cfg.id} \${cfg.name}（\${cfg.settings.theme}）\`;
}

console.log("--- 5️⃣ import type ---");
console.log(renderConfig({
  id: 1,
  name: "张三",
  settings: { theme: "dark", lang: "zh-CN" }
}));

// ============================================================
// 6️⃣ 命名空间导入：import * as
// ============================================================

// 真实场景：import * as React from "react";
// 把整个模块当成一个对象，通过 . 访问
const ReactLike = {
  createElement: (tag: string) => \`<\${tag} />\`,
  Fragment: "Fragment",
};

// 命名空间导入后，所有访问都要带前缀
const el = ReactLike.createElement("div");
console.log("--- 6️⃣ 命名空间导入 ---");
console.log("ReactLike.createElement('div') =", el);
console.log("ReactLike.Fragment =", ReactLike.Fragment);

// ============================================================
// 7️⃣ 模块的副作用导入
// ============================================================
// 真实场景：import "./polyfill";  不绑定任何名字，只执行模块副作用
// 常用于：加载 CSS、注册全局 polyfill、初始化配置
console.log("--- 7️⃣ 副作用导入（见注释）---");
console.log('import "./styles.css" —— 不绑定名字，只为执行模块代码');
`,
  },

  // ===========================================================
  // 第 2 章：命名空间 namespace
  // ===========================================================
  {
    id: "tsbook-namespace",
    title: "命名空间 namespace",
    icon: "🗂️",
    group: "模块工程化",
    content: `# 🗂️ 命名空间 namespace

\`namespace\` 是 TypeScript 早期的"模块化"方案，在 ES 模块标准化之前用于组织代码。**现代代码应该用 ES 模块（\`import\`/\`export\`）替代**，但老项目和 \`.d.ts\` 文件里仍能见到，必须能看懂。

## 一、namespace 是什么

\`\`\`ts
namespace Utils {
  export function clamp(x: number, min: number, max: number) {
    return Math.max(min, Math.min(x, max));
  }
  export const VERSION = "1.0";
}

Utils.clamp(15, 0, 10);  // 10
\`\`\`

\`namespace\` 把一组相关的变量、函数、类装进一个**全局对象**（编译后是 IIFE）。内部成员默认私有，加 \`export\` 才能外部访问——和模块的 \`export\` 思路一样。

## 二、嵌套命名空间

\`\`\`ts
namespace App {
  export namespace Config {
    export const apiBase = "https://api.example.com";
  }
  export namespace Auth {
    export function login() { /* ... */ }
  }
}

App.Config.apiBase;   // 嵌套访问
App.Auth.login();
\`\`\`

适合组织大型库的命名层级，但层级过深会很啰嗦。

## 三、声明合并：同名 namespace 自动合并

\`\`\`ts
namespace Utils {
  export function fn1() { }
}
namespace Utils {
  export function fn2() { }   // 合并到同一个 Utils 对象
}

Utils.fn1();
Utils.fn2();   // 都能访问
\`\`\`

声明合并让不同文件可以**分散贡献**到同一个命名空间——这是 \`namespace\` 在 \`.d.ts\` 里仍广泛使用的原因（比如 jQuery 的 \$.fn 扩展）。

## 四、namespace 还能合并到函数 / 类 / 枚举

\`\`\`ts
function counter() { return counter.count++; }
namespace counter {
  export let count = 0;          // 给函数加静态属性
  export function reset() { count = 0; }
}

counter();          // 0
counter.count;      // 1
counter.reset();
\`\`\`

这是给函数加"静态成员"的老套路，现代代码用 class 静态成员替代。

## 五、namespace vs module：什么时候用哪个

| 对比项 | namespace | ES module |
|------|-----------|-----------|
| 加载方式 | 全局对象，编译进同一文件 | 文件即模块，按需加载 |
| 依赖管理 | 隐式（依赖加载顺序） | 显式（\`import\` 声明） |
| Tree-shaking | 不支持 | 支持 |
| 现代项目 | ❌ 不推荐 | ✅ 首选 |
| \`.d.ts\` 全局扩展 | ✅ 仍常用 | — |

> ⭐ **新代码统一用 ES module**，只在两种场景保留 namespace：(1) 维护老项目；(2) 在 \`.d.ts\` 里给全局对象扩展类型。

## 六、一句话总结

\`namespace\` 是 ES 模块之前的过渡方案，编译后是个全局对象。**现代项目别用**，但老代码和声明文件里到处都是，得能看懂、能改。

> *下一章，声明文件——TS 与 JS 的桥梁。*`,
    code: `// 🗂️ 命名空间 namespace Demo

// ============================================================
// 1️⃣ 基础 namespace：把相关功能装进一个对象
// ============================================================

namespace Utils {
  // export 才能被外部访问；不 export 就是 namespace 私有
  export const VERSION = "1.0.0";                    // 导出常量

  export function clamp(x: number, min: number, max: number): number {
    // 把 x 限制在 [min, max] 区间
    return Math.max(min, Math.min(x, max));
  }

  export function randomInt(min: number, max: number): number {
    // 生成 [min, max] 的整数
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 私有：没 export，外部访问不到
  const _seed = Date.now();
}

console.log("--- 1️⃣ 基础 namespace ---");
console.log("Utils.VERSION        =", Utils.VERSION);
console.log("Utils.clamp(15,0,10) =", Utils.clamp(15, 0, 10));   // 10
console.log("Utils.clamp(-3,0,10) =", Utils.clamp(-3, 0, 10));   // 0
console.log("Utils.randomInt(1,6) =", Utils.randomInt(1, 6));    // 1~6

// ============================================================
// 2️⃣ 嵌套 namespace：组织大型库的命名层级
// ============================================================

namespace App {
  export namespace Config {
    // 配置子命名空间
    export const apiBase = "https://api.example.com";    // API 基地址
    export const timeout = 5000;                          // 超时毫秒
  }

  export namespace Auth {
    // 鉴权子命名空间
    export let token: string | null = null;              // 当前 token

    export function login(user: string): string {
      token = \`token-for-\${user}\`;                       // 模拟登录
      return token;
    }

    export function logout(): void {
      token = null;                                       // 清空 token
    }
  }
}

console.log("--- 2️⃣ 嵌套 namespace ---");
console.log("App.Config.apiBase =", App.Config.apiBase);
console.log("App.Config.timeout =", App.Config.timeout);
console.log("登录 token =", App.Auth.login("zhangsan"));
console.log("当前 token =", App.Auth.token);
App.Auth.logout();
console.log("登出后 token =", App.Auth.token);

// ============================================================
// 3️⃣ 声明合并：同名 namespace 自动合并
// ============================================================

namespace Validator {
  // 第一份：字符串相关校验
  export function isString(x: unknown): x is string {
    return typeof x === "string";
  }
  export function isNonEmpty(s: string): boolean {
    return s.trim().length > 0;
  }
}

namespace Validator {
  // 第二份：数字相关校验——合并到同一个 Validator 对象
  export function isNumber(x: unknown): x is number {
    return typeof x === "number";
  }
  export function isPositive(n: number): boolean {
    return n > 0;
  }
}

console.log("--- 3️⃣ 声明合并 ---");
// 两份 namespace 的成员都能访问
console.log("Validator.isString('hi')   =", Validator.isString("hi"));
console.log("Validator.isNumber(42)     =", Validator.isNumber(42));
console.log("Validator.isNonEmpty('  ') =", Validator.isNonEmpty("  "));
console.log("Validator.isPositive(-1)   =", Validator.isPositive(-1));

// ============================================================
// 4️⃣ namespace 合并到函数：给函数加"静态成员"
// ============================================================

// 先定义函数
function counter(): number {
  return counter.count++;   // 调用一次 count +1
}

// 再用同名 namespace 给它加静态属性
namespace counter {
  export let count = 0;                  // 静态状态
  export function reset(): void {
    count = 0;                            // 重置计数器
  }
  export function peek(): number {
    return count;                         // 查看但不增加
  }
}

console.log("--- 4️⃣ namespace 合并到函数 ---");
console.log("counter()    =", counter());   // 0（返回旧值后自增）
console.log("counter()    =", counter());   // 1
console.log("counter()    =", counter());   // 2
console.log("counter.peek() =", counter.peek());  // 3
counter.reset();
console.log("reset 后 peek =", counter.peek());   // 0

// ============================================================
// 5️⃣ namespace 合并到类：给类加静态方法
// ============================================================

class Logger {
  constructor(private prefix: string) {}

  log(msg: string): void {
    console.log(\`[\${this.prefix}] \${msg}\`);
  }
}

// 同名 namespace 给类加静态成员
namespace Logger {
  export const LEVELS = ["debug", "info", "warn", "error"] as const;
  export function create(prefix: string): Logger {
    return new Logger(prefix);           // 工厂方法
  }
}

console.log("--- 5️⃣ namespace 合并到类 ---");
console.log("Logger.LEVELS =", Logger.LEVELS);
const l = Logger.create("APP");          // 用 namespace 上的工厂方法
l.log("启动成功");

// ============================================================
// 6️⃣ 现代写法对比：ES module 替代 namespace
// ============================================================
// 老写法（namespace）：
//   namespace Utils { export function clamp(...) {} }
//   Utils.clamp(...)
//
// 现代写法（ES module，文件 utils.ts）：
//   export function clamp(...) {}
//   // 使用方：import { clamp } from "./utils";
//   clamp(...)
//
// 区别：
// - ES module 显式 import，依赖清晰
// - 支持 tree-shaking，未用到的代码会被打包器删掉
// - namespace 是全局对象，无法 tree-shake
console.log("--- 6️⃣ 现代写法（见注释，建议用 ES module）---");
console.log("新项目请用 export/import，namespace 仅保留在 .d.ts 扩展场景");
`,
  },

  // ===========================================================
  // 第 3 章：声明文件 .d.ts
  // ===========================================================
  {
    id: "tsbook-declaration-file",
    title: "声明文件 .d.ts",
    icon: "📜",
    group: "模块工程化",
    content: `# 📜 声明文件 .d.ts

\`.d.ts\` 文件是 TypeScript 与 JavaScript 世界的桥梁：它**只描述类型，不产生运行时代码**，让 TS 项目能享受类型检查的同时，依然使用任意 JS 库。

## 一、为什么需要声明文件

JS 库没有类型信息，直接在 TS 里用会报错：

\`\`\`ts
import { foo } from "./legacy.js";  // ❌ Could not find a declaration file
foo(42);
\`\`\`

解决方式有两种：
1. 给库写 \`.d.ts\` 描述类型
2. 用社区维护的 \`@types\` 包

## 二、\`declare\` 关键字：声明已存在的变量

\`declare\` 告诉编译器："这个东西运行时存在，我只是告诉你它的类型"，不会生成任何 JS 代码。

\`\`\`ts
declare const VERSION: string;       // 全局常量
declare function gtag(...args: any[]): void;   // 全局函数
declare const jQuery: (sel: string) => any;    // 全局变量
\`\`\`

\`\`\`ts
VERSION;        // ✅ 编译器认识
gtag("event");  // ✅
jQuery("div");  // ✅
\`\`\`

## 三、\`.d.ts\` 文件结构

\`\`\`ts
// legacy.d.ts —— 描述一个 JS 库的类型
declare module "legacy-lib" {
  export function add(a: number, b: number): number;
  export const VERSION: string;
  export interface Options { timeout: number; }
}
\`\`\`

\`\`\`ts
// 使用方
import { add, VERSION, Options } from "legacy-lib";
\`\`\`

## 四、\`@types\` 包：社区维护的声明

大多数流行 JS 库都有官方或社区维护的类型包，装在 \`node_modules/@types/\` 下：

\`\`\`bash
npm install --save-dev @types/lodash @types/node
\`\`\`

TS 会自动从 \`node_modules/@types/\` 查找声明，无需手动 \`reference\`。

## 五、\`declare global\`：扩展全局类型

在模块文件里（有 \`import\`/\`export\` 的文件就是模块），想往全局加类型：

\`\`\`ts
declare global {
  interface Window {
    myApp: { init(): void };   // 给 Window 加自定义属性
  }
  const __DEV__: boolean;       // 全局常量（构建工具注入）
}

window.myApp.init();   // ✅
if (__DEV__) { /* dev-only */ }
\`\`\`

## 六、\`declare module\`：声明模块 / 扩展模块

\`\`\`ts
// 给 *.css 模块加类型（webpack/css-loader 场景）
declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 扩展已有模块（模块扩展）
declare module "express" {
  interface Request {
    user?: { id: string };    // 给 express.Request 加 user 字段
  }
}
\`\`\`

## 七、\`/// <reference>\` 指令

显式引入另一个声明文件：

\`\`\`ts
/// <reference path="./legacy.d.ts" />
/// <reference types="node" />
\`\`\`

现代项目用 \`tsconfig\` 的 \`include\` 自动扫描，\`reference\` 已少见，但在手动管理的 \`.d.ts\` 里仍可能碰到。

## 八、一句话总结

\`.d.ts\` = "类型说明书"：用 \`declare\` 告诉 TS 已存在的 JS 代码长什么样。新项目优先用 \`@types\`，特殊场景手写 \`.d.ts\`。

> *下一章，tsconfig.json——TS 工程化的中枢。*`,
    code: `// 📜 声明文件 .d.ts 演示
// 注意：本文件演示在 .ts 文件里写 declare 语法
// 真实项目通常把声明单独放在 .d.ts 文件里

// ============================================================
// 1️⃣ declare 全局变量：告诉 TS 运行时已经存在的全局
// ============================================================

// 假设页面通过 <script> 注入了全局变量
declare const APP_VERSION: string;          // 全局常量
declare function gtag(...args: unknown[]): void;   // 全局函数（埋点）
declare const __DEV__: boolean;             // 构建工具注入的环境变量

console.log("--- 1️⃣ declare 全局变量 ---");
// 这些变量运行时由环境提供，这里用模拟值演示
const APP_VERSION_SIM = "1.2.3";
const __DEV___SIM = true;
console.log("APP_VERSION =", APP_VERSION_SIM);
console.log("__DEV__     =", __DEV___SIM);
// gtag 调用示意（注释掉，避免运行时未定义）
// gtag("event", "page_view", { page: "/home" });

// ============================================================
// 2️⃣ declare module：为无类型的 JS 库声明类型
// ============================================================

// 模拟一个老 JS 库 legacy-math.js 没有 .d.ts
// 我们手写一份声明，让 TS 认识它
declare module "legacy-math" {
  // 导出函数
  export function add(a: number, b: number): number;
  export function sub(a: number, b: number): number;
  // 导出常量
  export const VERSION: string;
  // 导出接口（类型）
  export interface CalcOptions {
    precision?: number;       // 可选属性
    round?: boolean;
  }
  // 默认导出
  export default function calc(expr: string, opts?: CalcOptions): number;
}

// 现在使用方可以享受类型检查（这里只演示类型推导）
// 真实场景：import { add, VERSION } from "legacy-math";
type LegacyMathModule = typeof import("legacy-math");
console.log("--- 2️⃣ declare module ---");
console.log("声明模块 legacy-math 完成，import 时有类型提示");

// ============================================================
// 3️⃣ declare module "*.css"：给非 JS 资源加类型
// ============================================================

// 打包器（webpack/vite）允许 import css，但 TS 默认不认识
declare module "*.css" {
  // CSS Modules 场景：默认导出类名映射
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  // SVG 通常作为 URL 或组件导入
  const src: string;
  export default src;
}

console.log("--- 3️⃣ declare 非JS资源 ---");
console.log('import styles from "./app.css" —— 现在有类型了');
console.log('import logo from "./logo.svg"  —— 现在有类型了');

// ============================================================
// 4️⃣ declare global：在模块文件里扩展全局
// ============================================================

// 文件里有 import/export 就是"模块"，模块里默认不能定义全局
// 用 declare global 块来扩展全局类型
declare global {
  // 给 Window 接口加自定义属性
  interface Window {
    myApp?: {
      init(): void;
      version: string;
    };
  }

  // 给 String 接口加扩展方法（不推荐，仅演示）
  interface String {
    reverse(): string;
  }
}

// 模拟一个 export，让本文件成为"模块"（否则 declare global 报错）
export {};

console.log("--- 4️⃣ declare global ---");
// 模拟 window.myApp
const fakeWindow = {
  myApp: {
    init: () => console.log("myApp 初始化"),
    version: "0.1.0"
  }
};
console.log("window.myApp.version =", fakeWindow.myApp?.version);
fakeWindow.myApp?.init();

// String.reverse（模拟实现，真实环境用 prototype 挂载）
function reverseStr(s: string): string {
  return s.split("").reverse().join("");
}
console.log('reverseStr("hello") =', reverseStr("hello"));

// ============================================================
// 5️⃣ 模块扩展：给已有库加字段
// ============================================================

// 假设 express 默认 Request 没有 user 字段，我们扩展它
declare module "express" {
  // 同名 interface 自动合并
  interface Request {
    user?: {
      id: string;
      name: string;
      roles: string[];
    };
  }
}

console.log("--- 5️⃣ 模块扩展 ---");
console.log('扩展 express.Request，添加 user 字段（见注释）');

// ============================================================
// 6️⃣ 三斜杠指令：/// <reference />
// ============================================================
// 老式写法：显式引用其他 .d.ts 文件
//   /// <reference path="./base.d.ts" />
//   /// <reference types="node" />
// 现代项目用 tsconfig 的 include 自动扫描，少用 reference
console.log("--- 6️⃣ 三斜杠指令 ---");
console.log("现代项目用 tsconfig include 自动加载 .d.ts，无需手写 reference");

// ============================================================
// 7️⃣ @types 包：社区维护的声明
// ============================================================
// 安装：npm i -D @types/lodash @types/node
// TS 会自动从 node_modules/@types/ 查找
// 项目里直接 import 即可享受类型
console.log("--- 7️⃣ @types 包 ---");
console.log("npm i -D @types/xxx —— TS 自动识别，无需手动 reference");
`,
  },

  // ===========================================================
  // 第 4 章：tsconfig.json 配置详解
  // ===========================================================
  {
    id: "tsbook-tsconfig",
    title: "tsconfig.json 配置详解",
    icon: "⚙️",
    group: "模块工程化",
    content: `# ⚙️ tsconfig.json 配置详解

\`tsconfig.json\` 是 TypeScript 项目的中枢：告诉编译器**编译哪些文件、用什么规则、输出到哪里**。一份合理的配置能让团队代码风格统一、错误尽早暴露。

## 一、最简配置

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
\`\`\`

\`compilerOptions\` 是核心，\`include\` 指定编译范围。

## 二、常用 compilerOptions 速查

| 选项 | 作用 | 推荐值 |
|------|------|--------|
| \`target\` | 编译产物的 JS 语法版本 | \`ES2022\`（Node 18+ / 现代浏览器） |
| \`module\` | 产物模块格式 | \`ESNext\`（打包器）/ \`NodeNext\`（Node） |
| \`moduleResolution\` | 模块解析策略 | \`Bundler\`（前端）/ \`NodeNext\`（Node） |
| \`lib\` | 可用的类型库（DOM、ES2022 等） | \`["ES2022", "DOM", "DOM.Iterable"]\` |
| \`strict\` | 开启所有严格检查（见第 5 章） | \`true\` |
| \`esModuleInterop\` | CommonJS 互操作辅助 | \`true\` |
| \`skipLibCheck\` | 跳过 .d.ts 文件检查（提速） | \`true\` |
| \`forceConsistentCasingInFileNames\` | 文件名大小写一致 | \`true\` |
| \`resolveJsonModule\` | 允许 import JSON | \`true\` |
| \`isolatedModules\` | 每文件独立编译（打包器要求） | \`true\` |
| \`noEmit\` | 只做类型检查，不输出 JS | \`true\`（用打包器时） |
| \`jsx\` | JSX 处理方式 | \`"react-jsx"\`（React 17+） |
| \`sourceMap\` | 生成 source map | \`true\` |
| \`declaration\` | 生成 .d.ts（库项目用） | 库项目 \`true\` |

## 三、\`target\` 与 \`lib\` 的区别

- \`target\`：**输出产物的语法级别**——决定 \`async\` 是否被编译成 \`Promise\` 等。
- \`lib\`：**类型检查可用的 API**——决定 \`Promise.all\` / \`Array.flat\` 这些类型是否存在。

常见坑：\`target: "ES5"\` 但用了 \`Promise\`——产物语法降级了，但运行时没有 \`Promise\`，需要 \`lib: ["ES2015", "DOM"]\` 或加 polyfill。

## 四、路径别名：\`baseUrl\` + \`paths\`

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils": ["src/utils/index.ts"]
    }
  }
}
\`\`\`

\`\`\`ts
// 之前：相对路径深了就乱
import { add } from "../../../utils/math";

// 之后：别名清晰
import { add } from "@utils/math";
import { Button } from "@components/Button";
\`\`\`

> ⚠️ \`paths\` 只影响 TS 类型检查，运行时还要打包器（Vite / webpack / tsconfig-paths）配合解析。

## 五、\`extends\`：继承基础配置

\`\`\`json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext"
  }
}

// tsconfig.json（项目专属）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
\`\`\`

monorepo 里常用：一份 base 配置 + 各 package 继承覆盖。

## 六、项目引用（Project References）

大型项目拆成多个子项目，每个子项目独立编译、增量加速：

\`\`\`json
// tsconfig.json（根）
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/app" }
  ]
}

// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,        // 必须开 composite
    "outDir": "./dist"
  },
  "include": ["src"]
}
\`\`\`

构建命令：\`tsc --build\` 自动按依赖顺序编译。

## 七、\`include\` / \`exclude\` / \`files\`

- \`include\`：glob 模式包含文件，如 \`["src", "types/**/*.d.ts"]\`
- \`exclude\`：排除文件，默认含 \`node_modules\` / \`dist\` / \`out\`
- \`files\`：显式列出文件（少用）

## 八、一句话总结

\`tsconfig.json\` 三大件：\`target\`/\`module\`/\`lib\` 定语法级别，\`strict\` 系列定严格度，\`paths\`/\`references\` 组织大型项目。**新项目从 \`strict: true\` + \`ESNext\` + \`Bundler\` 起步**。

> *下一章，严格模式——\`strict\` 背后的 8 个开关。*`,
    code: `// ⚙️ tsconfig.json 配置演示
// 本文件演示如何在 TS 代码里使用 tsconfig 配置的能力
// 完整的 tsconfig.json 见下方注释块

/*
// ============================================================
// 📄 典型 tsconfig.json（前端 + Vite 项目）
// ============================================================
{
  "compilerOptions": {
    // === 语法与模块 ===
    "target": "ES2022",              // 编译产物语法版本（Node 18+/现代浏览器）
    "module": "ESNext",              // 产物模块格式（让打包器处理）
    "moduleResolution": "Bundler",   // 模块解析策略（前端用 Bundler）
    "lib": ["ES2022", "DOM", "DOM.Iterable"],  // 可用类型库

    // === 严格性 ===
    "strict": true,                  // 总开关：开启所有严格检查
    "noUnusedLocals": true,          // 未使用的局部变量报错
    "noUnusedParameters": true,      // 未使用的函数参数报错
    "noImplicitReturns": true,       // 函数分支必须显式 return
    "noFallthroughCasesInSwitch": true,  // switch case 必须有 break

    // === 模块互操作 ===
    "esModuleInterop": true,         // CommonJS 互操作（import cjs 默认导出）
    "allowSyntheticDefaultImports": true,  // 允许合成默认导入
    "resolveJsonModule": true,       // 允许 import xxx from "./data.json"
    "isolatedModules": true,         // 每文件独立编译（打包器要求）

    // === 输出 ===
    "noEmit": true,                  // 不输出 JS（让 Vite/esbuild 处理）
    "sourceMap": true,               // 生成 source map
    "removeComments": false,         // 保留注释

    // === 路径别名 ===
    "baseUrl": ".",                  // 路径解析基准
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils": ["src/utils/index.ts"]
    },

    // === 其他 ===
    "skipLibCheck": true,            // 跳过 .d.ts 检查（提速）
    "forceConsistentCasingInFileNames": true,  // 文件名大小写一致
    "jsx": "react-jsx"               // JSX 处理方式（React 17+ 不用 import React）
  },
  "include": ["src", "types"],      // 编译范围
  "exclude": ["node_modules", "dist"]  // 排除
}
*/

// ============================================================
// 1️⃣ 路径别名演示：tsconfig paths 让 import 更清晰
// ============================================================

// 假设 tsconfig.json 配置了：
//   "baseUrl": "."
//   "paths": { "@utils/*": ["src/utils/*"] }
//
// 旧写法（相对路径深了难维护）：
//   import { add } from "../../../utils/math";
//
// 新写法（别名）：
//   import { add } from "@utils/math";

// 这里用 namespace 模拟"模块"，演示思路
namespace MathLib {
  export function add(a: number, b: number): number { return a + b; }
  export function sub(a: number, b: number): number { return a - b; }
}

console.log("--- 1️⃣ 路径别名（模拟）---");
console.log("tsconfig paths 配置：'@utils/*' -> 'src/utils/*'");
console.log("MathLib.add(2,3) =", MathLib.add(2, 3));
console.log("MathLib.sub(5,2) =", MathLib.sub(5, 2));

// ============================================================
// 2️⃣ resolveJsonModule：直接 import JSON
// ============================================================

// 配置 resolveJsonModule: true 后可以这样写：
//   import pkg from "./package.json";
//   console.log(pkg.version);
//
// TS 会按 JSON 结构推导类型，访问不存在的字段会报错

console.log("--- 2️⃣ resolveJsonModule ---");
// 模拟 JSON 导入
const mockPkgJson = {
  name: "my-app",
  version: "1.0.0",
  dependencies: { react: "^18.0.0" }
};
console.log("package.json.name    =", mockPkgJson.name);
console.log("package.json.version =", mockPkgJson.version);

// ============================================================
// 3️⃣ strict 系列选项的效果（详见下一章）
// ============================================================

console.log("--- 3️⃣ strict 系列选项 ---");
// strict: true 等价于同时开启：
//   strictNullChecks          —— null/undefined 不能赋给其他类型
//   noImplicitAny             —— 不允许隐式 any
//   strictFunctionTypes       —— 函数参数反变检查
//   strictBindCallApply       —— bind/call/apply 严格类型
//   strictPropertyInitialization  —— class 属性必须初始化
//   alwaysStrict              —— 输出 'use strict'
//   useUnknownInCatchVariables  —— catch 变量为 unknown
//   noImplicitThis            —— this 必须有明确类型

// 演示 strictNullChecks 的效果
function greet(name: string | null): string {
  // strict 模式下，必须处理 null 的情况
  if (name === null) {
    return "Hello, stranger";          // 显式处理 null
  }
  return \`Hello, \${name.toUpperCase()}\`;  // 这里 name 收窄为 string
}
console.log("greet('Tom')   =", greet("Tom"));
console.log("greet(null)    =", greet(null));

// ============================================================
// 4️⃣ extends 继承：monorepo 常用模式
// ============================================================

/*
// tsconfig.base.json（共享配置）
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// packages/app/tsconfig.json（继承 + 覆盖）
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
*/

console.log("--- 4️⃣ extends 继承 ---");
console.log("monorepo: 共享 base 配置，各 package 用 extends 继承");

// ============================================================
// 5️⃣ 项目引用 Project References
// ============================================================

/*
// 根 tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },   // 先编译
    { "path": "./packages/app" }       // 后编译（依赖 shared）
  ]
}

// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,                 // 必须开 composite 才能被引用
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}

// 构建命令：tsc --build（自动按依赖顺序构建，增量编译）
*/

console.log("--- 5️⃣ 项目引用 ---");
console.log("大型项目拆分子项目，用 references + tsc --build 增量编译");

// ============================================================
// 6️⃣ noEmit + 打包器分工
// ============================================================
// 现代前端项目分工：
//   - tsc（tsconfig.json）—— 只做类型检查（noEmit: true）
//   - Vite/esbuild/webpack —— 实际编译打包
// 好处：类型检查用完整的 tsc，打包用更快的 esbuild
console.log("--- 6️⃣ noEmit 模式 ---");
console.log("tsc 负责类型检查（noEmit: true），Vite/esbuild 负责打包");

// ============================================================
// 7️⃣ 常见踩坑：target 与 lib 不匹配
// ============================================================
// target: "ES5" 但用了 Promise —— 产物降级了，但运行时没 Promise
// 解决：lib: ["ES2015", "DOM"] 或加 polyfill
console.log("--- 7️⃣ target vs lib ---");
console.log("target 决定语法级别，lib 决定可用 API，两者要匹配");
`,
  },

  // ===========================================================
  // 第 5 章：严格模式详解
  // ===========================================================
  {
    id: "tsbook-strict-mode",
    title: "严格模式详解",
    icon: "🔒",
    group: "模块工程化",
    content: `# 🔒 严格模式详解

\`strict: true\` 是 TypeScript 的"全家桶"严格开关，背后实际是 8 个子选项的总和。**新项目一律开 \`strict\`**——前期多写点类型，后期少踩无数运行时坑。

## 一、\`strict\` 总开关背后是什么

\`\`\`json
{
  "strict": true
}
\`\`\`

等价于：

\`\`\`json
{
  "strictNullChecks": true,
  "noImplicitAny": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "useUnknownInCatchVariables": true
}
\`\`\`

可以单独关掉某个，但**不建议**——除非有明确理由。

## 二、\`strictNullChecks\`：最值钱的选项

\`\`\`ts
// 关闭时：null/undefined 可以赋给任何类型
let name: string = null;   // ✅ 不报错（运行时炸）

// 开启后：null 是独立类型
let name: string = null;   // ❌ Type 'null' is not assignable to type 'string'
let name: string | null = null;   // ✅ 显式声明可能为 null
\`\`\`

这一条解决了 JS 最经典的 \`Cannot read property 'x' of null\` 错误。**这是 strict 系列里收益最大的选项**。

## 三、\`noImplicitAny\`：禁止隐式 any

\`\`\`ts
// 关闭时：参数没标类型就默认 any
function add(a, b) { return a + b; }   // a, b 是 any

// 开启后：必须显式标类型，或显式写 any
function add(a: number, b: number) { return a + b; }   // ✅
function add(a: any, b: any) { return a + b; }          // ✅ 显式 any
function add(a, b) { return a + b; }                    // ❌ 隐式 any
\`\`\`

**陷阱**：迁移老 JS 代码时这个开关会刷一堆错误。建议先开 \`noImplicitAny: false\` 迁完，再开 true。

## 四、\`strictFunctionTypes\`：函数参数反变

\`\`\`ts
// 关闭时：函数参数双变（不安全）
let fn: (x: Animal) => void = (x: Dog) => { };   // ✅ 不报错

// 开启后：函数参数严格反变
let fn: (x: Animal) => void = (x: Dog) => { };   // ❌ Dog 不能赋给 Animal 参数位置
\`\`\`

**反变**听起来玄乎，本质就一句：**接受更具体类型的函数，不能赋给接受更宽泛类型的函数变量**——因为调用方可能传一个非 Dog 的 Animal。

## 五、\`strictBindCallApply\`：bind/call/apply 严格类型

\`\`\`ts
function add(a: number, b: number) { return a + b; }

// 关闭时：参数 any，传错不报
add.call(null, "1", "2");   // ✅ 不报错（运行时 NaN）

// 开启后：参数严格匹配
add.call(null, "1", "2");   // ❌ Argument of type 'string' not assignable to 'number'
\`\`\`

## 六、\`strictPropertyInitialization\`：class 属性必须初始化

\`\`\`ts
class User {
  name: string;   // ❌ Property 'name' has no initializer
}

class User {
  name: string = "anon";          // ✅ 直接初始化
  age!: number;                   // ✅ 非空断言：我保证会赋值
  constructor(public email: string) {}
}
\`\`\`

\`age!\` 的 \`!\` 是"非空断言"：告诉编译器"我会负责赋值，别管"。

## 七、\`noImplicitThis\`：this 必须有类型

\`\`\`ts
// 关闭时：this 是 any
function onClick() { this.value = 1; }   // this: any

// 开启后：必须显式声明 this
function onClick(this: HTMLElement) { this.value = 1; }   // ✅
\`\`\`

回调场景特别有用——避免 \`this\` 指向 \`undefined\` 的运行时坑。

## 八、\`alwaysStrict\` 与 \`useUnknownInCatchVariables\`

- \`alwaysStrict\`：编译产物自动加 \`"use strict"\`。
- \`useUnknownInCatchVariables\`：\`catch (e)\` 的 \`e\` 是 \`unknown\` 而非 \`any\`，强制你先做类型守卫再用：

\`\`\`ts
try { } catch (e) {
  e.message;   // ❌ e 是 unknown，不能直接访问属性
  if (e instanceof Error) {
    e.message; // ✅ 类型守卫后才能用
  }
}
\`\`\`

## 九、启用代价与建议

| 阶段 | 建议 |
|------|------|
| 新项目 | 一律 \`strict: true\`，从第一天就严格 |
| 老项目迁移 | 先 \`strictNullChecks\` 单开，再逐步加 |
| 库项目 | 必须 \`strict: true\`，否则用户被你的类型坑 |

## 十、一句话总结

\`strict\` 是 8 个子选项的合集，**新项目无脑开**。其中 \`strictNullChecks\` 收益最大、\`noImplicitAny\` 最痛但最值、\`strictFunctionTypes\` 最难理解。开严格模式前期多写类型，后期少踩运行时坑——稳赚。`,
    code: `// 🔒 严格模式详解 Demo
// 本文件演示 strict 系列各子选项的效果对比
// 假设 tsconfig.json 中 "strict": true

// ============================================================
// 1️⃣ strictNullChecks：null/undefined 是独立类型
// ============================================================

console.log("--- 1️⃣ strictNullChecks ---");

// ❌ 关闭时可以这样写（运行时崩溃）：
//   let name: string = null;
//   name.toUpperCase();   // 运行时抛错

// ✅ 开启后必须显式声明可能为 null
function greet(name: string | null): string {
  // 必须先处理 null 的情况
  if (name === null) {
    return "Hello, stranger";                          // null 分支
  }
  // 这里 name 被 TS 收窄为 string，可以安全调用方法
  return \`Hello, \${name.toUpperCase()}\`;
}
console.log("greet('Tom')  =", greet("Tom"));
console.log("greet(null)   =", greet(null));

// 可选参数 / 可选属性自动加上 | undefined
interface User {
  name: string;
  email?: string;              // 可选：string | undefined
}
const u: User = { name: "张三" };
// u.email 是 string | undefined，必须先判空
const emailLen = u.email ? u.email.length : 0;        // 显式判空
console.log("emailLen =", emailLen);

// ============================================================
// 2️⃣ noImplicitAny：禁止隐式 any
// ============================================================

console.log("--- 2️⃣ noImplicitAny ---");

// ❌ 关闭时：参数没标类型默认 any
//   function add(a, b) { return a + b; }

// ✅ 开启后必须显式标类型
function add(a: number, b: number): number {
  return a + b;                                        // 类型明确
}
console.log("add(2,3) =", add(2, 3));

// 也支持显式 any（虽然不推荐，但合法）
function logAny(x: any): void {
  console.log("显式 any：", x);
}
logAny("可以传任何值");

// 陷阱：JSON.parse 返回 any，要手动断言或守卫
const data: unknown = JSON.parse('{"id":1,"name":"Tom"}');
// data.id 会报错，因为 unknown 不能直接访问属性
if (typeof data === "object" && data !== null && "id" in data) {
  console.log("JSON id =", (data as { id: number }).id);
}

// ============================================================
// 3️⃣ strictFunctionTypes：函数参数反变
// ============================================================

console.log("--- 3️⃣ strictFunctionTypes ---");

// 类继承关系
class Animal { name: string = "animal"; }
class Dog extends Animal { bark(): string { return "woof"; } }

// Animal 是父类，Dog 是子类：Dog 可以赋给 Animal
const a: Animal = new Dog();   // ✅ 子类赋给父类（协变）

// 函数类型反变：参数位置反着来
// ❌ 关闭时：fn1 可以赋给 fn2（不安全）
//   let fn1: (x: Animal) => void = (x: Dog) => { x.bark(); };

// ✅ 开启后：参数必须是父类或更宽
let handler: (x: Animal) => void = (x: Animal) => {
  console.log("处理 Animal:", x.name);                 // 只用 Animal 的属性
};
// ❌ 不允许：(x: Dog) => void 不能赋给 (x: Animal) => void
//   handler = (x: Dog) => { x.bark(); };  // 因为调用方可能传 Cat

// 调用 handler 时可以传 Dog（子类可以当父类用）
handler(new Dog());

// 返回值是协变（正常方向）
let getter: () => Animal = () => new Dog();            // ✅ 返回 Dog 也算 Animal
console.log("getter() =", getter().name);

// ============================================================
// 4️⃣ strictBindCallApply：bind/call/apply 严格匹配
// ============================================================

console.log("--- 4️⃣ strictBindCallApply ---");

function formatName(prefix: string, name: string): string {
  return \`\${prefix} \${name}\`;
}

// ✅ 严格检查参数类型和数量
console.log("formatName.call =", formatName.call(null, "Mr.", "Smith"));
console.log("formatName.apply =", formatName.apply(null, ["Ms.", "Jones"]));

// bind 出来的函数也带正确类型
const bound = formatName.bind(null, "Dr.");            // 预填第一个参数
console.log("bound('Watson') =", bound("Watson"));

// ❌ 开启后这些都会报错：
//   formatName.call(null, 1, 2);          // 参数类型错
//   formatName.call(null, "Mr.");         // 参数少一个
//   formatName.apply(null, ["a", "b", "c"]);  // 参数多

// ============================================================
// 5️⃣ strictPropertyInitialization：class 属性必须初始化
// ============================================================

console.log("--- 5️⃣ strictPropertyInitialization ---");

class Config {
  // ✅ 方式 1：直接初始化
  host: string = "localhost";

  // ✅ 方式 2：构造函数里赋值
  port: number;
  constructor(port: number) {
    this.port = port;                                  // 构造函数里赋值
  }

  // ✅ 方式 3：非空断言（"我保证会赋值"）
  dbUrl!: string;                                      // ! 表示"先信我，会赋值"

  // ✅ 方式 4：可选属性（自动 | undefined）
  timeout?: number;

  setUrl(url: string): void {
    this.dbUrl = url;                                  // 后续赋值
  }
}

const cfg = new Config(3306);
cfg.setUrl("mysql://localhost");
console.log("cfg.host   =", cfg.host);
console.log("cfg.port   =", cfg.port);
console.log("cfg.dbUrl  =", cfg.dbUrl);
console.log("cfg.timeout =", cfg.timeout);             // undefined

// ============================================================
// 6️⃣ noImplicitThis：this 必须有明确类型
// ============================================================

console.log("--- 6️⃣ noImplicitThis ---");

// ❌ 关闭时：this 是 any，运行时可能 undefined
//   function onClick() { console.log(this.value); }

// ✅ 开启后：必须显式声明 this 的类型
interface ButtonEl {
  value: string;
  click(): void;
}

function onClick(this: ButtonEl): void {
  // this 类型明确，可以安全访问 .value
  console.log("button value:", this.value);
}

const btn: ButtonEl = {
  value: "submit",
  click: onClick
};
btn.click();                                            // this 绑定到 btn

// ============================================================
// 7️⃣ useUnknownInCatchVariables：catch 变量是 unknown
// ============================================================

console.log("--- 7️⃣ useUnknownInCatchVariables ---");

function safeRun(): string {
  try {
    // 可能抛错的代码
    if (Math.random() > 0.5) {
      throw new Error("随机失败");
    }
    return "成功";
  } catch (err) {
    // err 是 unknown（不是 any），不能直接访问属性
    // ❌ err.message;  // 报错：err 是 unknown

    // ✅ 必须先做类型守卫
    if (err instanceof Error) {
      return "失败：" + err.message;                   // 守卫后才能访问
    }
    return "未知错误：" + String(err);                  // 兜底转换
  }
}
console.log("safeRun() =", safeRun());

// ============================================================
// 8️⃣ alwaysStrict：编译产物加 'use strict'
// ============================================================
// 输出的 JS 文件第一行会自动加 "use strict";
// 作用：启用 JS 严格模式（禁止 with、未声明变量、arguments.callee 等）
// 是 ES5+ 默认行为，对现代代码影响很小
console.log("--- 8️⃣ alwaysStrict ---");
console.log("编译产物自动加 'use strict'，启用 JS 严格模式");

// ============================================================
// 9️⃣ strict 总开关：一键开启全部严格检查
// ============================================================
console.log("--- 9️⃣ strict 总开关 ---");
console.log('tsconfig: "strict": true  等价于同时开启上述 8 个子选项');
console.log("新项目无脑开，老项目可以先开 strictNullChecks 再逐步加");
`,
  },
];
