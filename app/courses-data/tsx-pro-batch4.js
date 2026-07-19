// =============================================================
// TypeScript + React 全栈精通 - Batch 4: TS 模块与工程化
// -------------------------------------------------------------
// 章节范围（共 6 章）：
//   21. tspro-modules        模块系统（export / import）
//   22. tspro-namespaces     命名空间（namespace）
//   23. tspro-d-ts           类型声明文件（.d.ts）
//   24. tspro-triple-slash   三斜线指令
//   25. tspro-tsconfig       tsconfig.json 完整配置详解
//   26. tspro-decorators     装饰器（Decorators）
// =============================================================

export const chapters = [
  {
    id: "tspro-modules",
    group: "四、TypeScript 模块与工程化",
    icon: "📦",
    title: "模块系统（export / import）",
    content: `# 第 21 章：模块系统（export / import）

## 21.1 为什么需要模块系统

一个真实项目通常有成百上千个文件：组件、工具函数、API 封装、类型定义、配置……如果没有模块系统，所有变量都挤在全局作用域里，必然出现命名冲突、依赖混乱、加载顺序难以维护等问题。

**模块系统**解决三个核心问题：

- **隔离**：每个文件是独立作用域，不污染全局
- **依赖声明**：明确说清楚"我需要谁"、"我提供什么"
- **加载控制**：按需加载、按顺序加载、动态加载

TypeScript 默认使用 **ES Module 标准**（\`export\` / \`import\`），同时兼容 CommonJS（\`module.exports\` / \`require\`）。在现代前端项目中，ES Module 是绝对主流。

\`\`\`tsx
// math.ts —— 一个模块就是一个文件
export function add(a: number, b: number) {
  return a + b;
}

// app.ts —— 用 import 引入
import { add } from './math';
console.log(add(1, 2));
\`\`\`

一个文件 = 一个模块。只要文件里有 \`import\` 或 \`export\`，它就是模块；否则就是普通脚本（全局作用域）。

## 21.2 export 的几种形式

### 命名导出（Named Export）

一个模块可以导出多个命名成员：

\`\`\`tsx
// utils.ts
export const PI = 3.14159;

export function square(x: number) {
  return x * x;
}

export class Logger {
  log(msg: string) { console.log(msg); }
}
\`\`\`

也可以先声明，再统一导出：

\`\`\`tsx
// utils.ts
const PI = 3.14159;
function square(x: number) { return x * x; }
class Logger { log(msg: string) { console.log(msg); } }

export { PI, square, Logger };
\`\`\`

两种写法等价，统一导出更整洁，推荐在文件较长时使用。

### 默认导出（Default Export）

每个模块**最多只能有一个**默认导出：

\`\`\`tsx
// Button.tsx
export default function Button(props: { label: string }) {
  return <button>{props.label}</button>;
}

// 也可以是表达式
const config = { theme: 'dark' };
export default config;
\`\`\`

默认导出引入时**不需要花括号**，且可以任意改名：

\`\`\`tsx
import MyButton from './Button';  // 名字随便起
\`\`\`

### 默认 + 命名 混合

\`\`\`tsx
// user.ts
export const ROLE_ADMIN = 'admin';   // 命名导出
export function getRole() { return 'user'; }  // 命名导出
export default class User { }         // 默认导出

// 引入时
import User, { ROLE_ADMIN, getRole } from './user';
\`\`\`

约定：默认导出放类/组件，命名导出放工具函数和常量。

## 21.3 import 的几种形式

\`\`\`tsx
// 1. 命名导入：按名字挑
import { add, square } from './math';

// 2. 起别名（避免冲突）
import { add as plus } from './math';

// 3. 默认导入
import MyButton from './Button';

// 4. 默认 + 命名 混合
import User, { ROLE_ADMIN } from './user';

// 5. 整体导入（命名空间导入）
import * as math from './math';
math.add(1, 2);

// 6. 副作用导入（不绑定任何名字，只为执行模块代码）
import './polyfill';
import './styles.css';
\`\`\`

**命名 vs 默认**的选择建议：

| 场景 | 推荐方式 | 理由 |
| --- | --- | --- |
| React 组件 | 默认导出 | 文件名即组件名，引入简洁 |
| 工具函数集 | 命名导出 | 可按需引入，利于 Tree Shaking |
| 常量 / 枚举 | 命名导出 | 显式列出，可读性高 |
| 单一主类 | 默认导出 | 一文件一类，结构清晰 |

社区争议：不少人（包括 TS 团队成员）建议**全部用命名导出**，因为默认导出改名容易导致重构时找不到引用。两种风格都有团队采用，关键是一致。

## 21.4 export * 与 export as 重命名

### 批量重导出

\`\`\`tsx
// utils/index.ts —— 把子模块统一对外暴露
export * from './math';
export * from './string';
export * from './date';
\`\`\`

调用方只需 \`import { add, capitalize, formatDate } from './utils'\`，不必关心内部文件结构。这是"桶文件（barrel file）"模式，NPM 包普遍采用。

### 重命名后导出

\`\`\`tsx
// 把内部 add 以 sum 的名字对外暴露
export { add as sum } from './math';

// 默认导出也可以转命名导出
export { default as Button } from './Button';
\`\`\`

### export as namespace

给模块声明一个全局命名空间（UMD 模式），主要给 \`<script>\` 引入的库用：

\`\`\`tsx
// jquery.d.ts
export as namespace jQuery;
export = jQuery;
\`\`\`

这样 \`window.jQuery\` 在 TS 里也能识别。

## 21.5 CommonJS 与 ES Module 互操作

Node.js 历史上用 CommonJS（\`require\` / \`module.exports\`），前端现代项目用 ES Module。两者并存时需要互操作。

### TS 默认导入 CommonJS 模块

\`\`\`tsx
// express 是 CommonJS 写的
import express from 'express';        // 默认导入（依赖 esModuleInterop）
import * as express from 'express';   // 命名空间导入（老写法）
const express = require('express');   // CommonJS 写法（也行，但失去类型）
\`\`\`

\`esModuleInterop: true\` 让默认导入兼容 CommonJS 的 \`module.exports\`，**强烈建议开启**。

### export = 写法（老式 CommonJS）

\`\`\`tsx
// old-lib.ts
class OldLib { run() { return 42; } }
export = OldLib;

// 引入时必须用 import =
import OldLib = require('./old-lib');
new OldLib().run();
\`\`\`

新项目尽量避免 \`export =\`，用 ES Module 标准导出。

### import type 语法

\`\`\`tsx
// 只引入类型，编译后会被完全擦除
import type { User } from './types';
import { type User, getUser } from './api';  // 混合写法
\`\`\`

\`import type\` 不会出现在运行时代码里，能减少打包体积，避免循环依赖触发副作用。

## 21.6 动态 import()

静态 \`import\` 必须在文件顶层、字符串必须是字面量。需要"按条件加载"或"延迟加载"时，用动态 \`import()\`：

\`\`\`tsx
// 按需加载模块，返回 Promise
async function loadEditor() {
  const { Editor } = await import('./Editor');
  new Editor().render();
}

button.onclick = loadEditor;
\`\`\`

应用场景：

- **路由懒加载**：\`const Page = lazy(() => import('./Page'))\`
- **大体量库延迟加载**：编辑器、图表、PDF 渲染
- **条件加载**：根据用户角色、设备、特性开关决定是否加载

TS 对动态 \`import()\` 的返回类型是 \`Promise<typeof 模块>\`，类型推断完整。

## 21.7 实际项目中的模块组织

**目录结构示例**：

\`\`\`tsx
src/
  components/
    Button/
      Button.tsx       // 组件实现
      Button.module.css
      index.ts          // 桶文件：export { default as Button } from './Button'
    Input/
      ...
    index.ts            // 再一层桶：export * from './Button'; export * from './Input'
  utils/
    math.ts
    string.ts
    index.ts            // export * from './math'; export * from './string'
\`\`\`

桶文件让外部调用更简洁：\`import { Button, add } from '@/components'\`。

**循环依赖规避**：

- 类型放 \`types.ts\`，逻辑分文件，避免互相 import
- 用 \`import type\` 替代 \`import\`，类型不会触发循环
- 必要时延迟到函数内部 \`import()\`

## 21.8 常见坑

**坑 1：默认导出引入时多写了花括号**

\`\`\`tsx
// 错：把默认导出当命名导出
import { Button } from './Button';
// 正：
import Button from './Button';
\`\`\`

**坑 2：export \* 时命名冲突被静默跳过**

\`\`\`tsx
// a.ts 导出 add，b.ts 也导出 add
export * from './a';
export * from './b';  // b 的 add 会被跳过，不报错！
\`\`\`

要明确写 \`export { add as addB } from './b'\`。

**坑 3：路径大小写**

Linux 服务器大小写敏感，本地 macOS 不敏感。本地 \`import x from './Utils'\` 能跑，上线 CI 挂。建议全程用小写文件名。

## 21.9 小结

- 一个文件 = 一个模块；有 \`import\` 或 \`export\` 即为模块
- 命名导出支持多个，默认导出最多一个
- \`import * as\` 整体导入，\`import './x'\` 副作用导入
- \`export * from './x'\` 桶文件模式，\`export { a as b }\` 重命名
- \`esModuleInterop\` 让默认导入兼容 CommonJS
- 动态 \`import()\` 用于懒加载，返回 Promise
- \`import type\` 只取类型，编译后擦除
`,
    code: `// =============================================================
// 第 21 章示例：模拟模块导入导出机制
// 沙箱限制：不能用真实 import/export，用对象模拟模块结构
// =============================================================

// ---- 模拟一个 math 模块（命名导出） ----
const mathModule = {
  PI: 3.14159,                              // 命名导出常量
  add: (a, b) => a + b,                     // 命名导出函数
  square: (x) => x * x,                     // 命名导出函数
};

// ---- 模拟一个 Button 模块（默认导出） ----
const buttonModule = {
  default: function Button(props) {         // default 导出
    return { type: 'button', label: props.label };
  },
  ButtonProps: { label: 'string' },         // 同时也有命名导出
};

// ---- 模拟桶文件：聚合多个模块 ----
const utilsBarrel = {
  ...mathModule,                            // 等价于 export * from './math'
  ButtonProps: buttonModule.ButtonProps,    // 等价于 export { ButtonProps } from './Button'
};

// ---- 模拟命名导入：const { add, square } = mathModule ----
const { add, square } = mathModule;         // 等价于 import { add, square } from './math'

// ---- 模拟默认导入：直接取 .default ----
const Button = buttonModule.default;        // 等价于 import Button from './Button'

// ---- 模拟命名空间导入：import * as math ----
const math = mathModule;
console.log('math.PI      =', math.PI);
console.log('math.add(2,3)=', math.add(2, 3));

// ---- 模拟重命名导入：import { add as plus } ----
const { add: plus } = mathModule;
console.log('plus(10,20)  =', plus(10, 20));

// ---- 模拟动态 import()：返回 Promise ----
function dynamicImport(factory) {
  return Promise.resolve(factory());        // 模拟 import() 返回 Promise
}

dynamicImport(() => mathModule).then((mod) => {
  console.log('动态 import 后 mod.square(5) =', mod.square(5));
});

// ---- 模拟 import type：类型只在编译期存在，运行时被擦除 ----
// 等价于 import type { User } from './types'
// 类型 User 在运行时根本不存在，只用于类型检查
const fakeUser = { id: 1, name: 'Tom' };    // 运行时只是个普通对象

// ---- 模拟桶文件调用 ----
console.log('桶文件 utilsBarrel.add(1,1) =', utilsBarrel.add(1, 1));
console.log('桶文件 utilsBarrel.PI       =', utilsBarrel.PI);

// ---- 演示默认 + 命名混合导入 ----
console.log('\\n=== 默认 + 命名混合 ===');
const Btn = Button;
console.log('默认导出 Button 调用：', Btn({ label: '点我' }));

// ---- 副作用导入演示：只为执行代码，不绑定名字 ----
// 等价于 import './polyfill'
(function polyfill() {
  console.log('polyfill 模块执行了一次（副作用导入）');
})();

console.log('\\n=== 模块系统核心要点 ===');
console.log('1. 命名导出：export { a, b }；导入：import { a, b }');
console.log('2. 默认导出：export default X；导入：import X');
console.log('3. 整体导入：import * as ns');
console.log('4. 动态导入：import("./x") 返回 Promise');
console.log('5. import type 只取类型，编译后被擦除');
console.log('6. esModuleInterop 让默认导入兼容 CommonJS');
`,
  },
  {
    id: "tspro-namespaces",
    group: "四、TypeScript 模块与工程化",
    icon: "🏛️",
    title: "命名空间（namespace）",
    content: `# 第 22 章：命名空间（namespace）

## 22.1 为什么需要命名空间

在 ES Module 出现之前，前端项目没有原生模块系统。一个大型项目要管理几十个类、几百个函数，很容易全局命名冲突。TypeScript 早期给出了自己的方案：**namespace（命名空间）**——用一个对象把相关成员包起来，对外只暴露一个全局名字。

\`\`\`tsx
namespace App {
  export const version = '1.0.0';

  export function start() {
    console.log('App started');
  }

  export class Router { /* ... */ }
}

// 外部使用
App.start();
new App.Router();
\`\`\`

namespace 编译后就是一个 IIFE（立即执行函数）+ 全局变量：

\`\`\`tsx
// 编译产物（简化）
var App;
(function (App) {
  App.version = '1.0.0';
  App.start = function () { console.log('App started'); };
})(App || (App = {}));
\`\`\`

内部成员默认私有，加了 \`export\` 才对外可见——这点和模块一样。

## 22.2 namespace 的基本语法

### 嵌套 namespace

\`\`\`tsx
namespace App {
  export namespace Utils {
    export function clamp(v: number, min: number, max: number) {
      return Math.max(min, Math.min(max, v));
    }
  }

  export namespace Network {
    export function get(url: string) { /* ... */ }
  }
}

App.Utils.clamp(5, 0, 10);
App.Network.get('/api/user');
\`\`\`

嵌套 namespace 适合成员较多时做分层，但层数不要太深，否则调用又臭又长。

### 跨文件拆分 namespace

一个 namespace 可以拆到多个文件里，靠 \`\`/// <reference path="..." />\`\` 串联，编译时合并：

\`\`\`tsx
// validators.ts
namespace Validation {
  export function isLetter(s: string) { return /^[a-z]+$/i.test(s); }
}

// validators-number.ts
namespace Validation {
  export function isNumber(s: string) { return /^[0-9]+$/.test(s); }
}

// 调用
Validation.isLetter('abc');
Validation.isNumber('123');
\`\`\`

这是早期"巨型库"的常见写法，但维护起来麻烦，现代项目已经基本不用。

### 别名（import 简写）

\`\`\`tsx
namespace App.UI.Components { export class Button {} }

// 缩短调用路径
import Btn = App.UI.Components.Button;
new Btn();
\`\`\`

这是 TS 自己的 \`import =\` 语法，仅用于别名，不要和 ES \`import\` 混淆。

## 22.3 为什么现代 TS 不推荐 namespace

简短答案：**因为 ES Module 已经是标准**。具体原因：

| 维度 | namespace | ES Module |
| --- | --- | --- |
| 隔离方式 | 全局变量 | 文件作用域 |
| 依赖声明 | 隐式（reference path） | 显式（import） |
| Tree Shaking | 不支持 | 支持 |
| 异步加载 | 不支持 | 支持（import()） |
| 工具支持 | 弱（IDE 跳转、重构都更差） | 强 |
| 标准化 | TS 私有 | ECMAScript 标准 |

namespace 的几个老毛病：

1. **依赖隐式**：靠 \`/// <reference path>\` 串联，编译顺序难管
2. **不支持 Tree Shaking**：整个 namespace 会被打包进去
3. **不能按需加载**：所有依赖都在启动时加载
4. **IDE 体验差**：跳转、重命名经常踩坑
5. **非标准**：编译后是 IIFE，不是 ESM，未来 Node 直接跑 ESM 时会被淘汰

**新项目请一律用 ES Module**。namespace 只在维护老代码、或写 .d.ts 时还会遇到。

## 22.4 namespace vs module

这是个高频面试题。两个概念常被混淆：

| | namespace | module |
| --- | --- | --- |
| 定义方式 | \`namespace X { ... }\` | 一个含 import/export 的文件 |
| 作用域 | 全局（编译为全局变量） | 文件级（每文件独立） |
| 引入方式 | 不需要引入，直接用名字 | 必须 import |
| 文件粒度 | 跨文件可合并 | 一文件一模块 |
| 适合场景 | 老代码、.d.ts 全局扩展 | 现代项目全部场景 |

记忆要点：

- **module = 文件**：有 import/export 的文件就是 module
- **namespace = 全局对象**：编译后挂在全局
- 现代项目里 99% 都是 module

## 22.5 何时还需要 namespace

namespace 并没完全死掉，下面这些场景仍然合理：

### 1. .d.ts 给全局变量补类型

浏览器里有些库是直接挂全局的（比如 \`jQuery\`、\`moment\`），用 \`<script>\` 引入。在 TS 里给它们写类型，就得用 namespace：

\`\`\`tsx
// jquery.d.ts
declare namespace jQuery {
  export function ajax(url: string, settings?: any): void;
  export function css(selector: string, prop: string): string;
}

// 业务代码
jQuery.ajax('/api/user');
\`\`\`

### 2. declare global 扩展全局对象

需要在 \`window\` 或 \`globalThis\` 上挂自定义属性时：

\`\`\`tsx
// global.d.ts
declare global {
  interface Window {
    __APP_VERSION__: string;
    myTrack(event: string): void;
  }
}

// 业务代码
window.__APP_VERSION__ = '1.0.0';
window.myTrack('click');
\`\`\`

注意：\`declare global\` 必须写在模块文件里（至少有一个 \`export\`），否则会报错"全局增强不能在脚本中"。

### 3. 库内部类型聚合

某些库的 .d.ts 用 namespace 把类型和值打包在一起，调用时看起来像一个全局：

\`\`\`tsx
// React 的类型里
declare namespace React {
  export interface FC<P> { (props: P): any; }
  export function createElement(type: any, props?: any): any;
}
\`\`\`

## 22.6 declare global 详解

\`declare global\` 是 ES Module 时代扩展全局的官方姿势。两种典型用法：

### 扩展全局接口

\`\`\`tsx
// types/global.d.ts
export {};  // 这一行不能省，让本文件成为 module

declare global {
  // 扩展 Window
  interface Window {
    gtag: (...args: any[]) => void;
  }

  // 扩展 String 原型
  interface String {
    reverse(): string;
  }
}
\`\`\`

调用方完全无感：

\`\`\`tsx
window.gtag('event', 'click');
'abc'.reverse();  // 类型上也认
\`\`\`

### 声明全局变量

\`\`\`tsx
declare global {
  // 注意 var/let/const 的差异：var 挂 window，const 不挂
  var __DEV__: boolean;
  const APP_NAME: string;
}
\`\`\`

\`var __DEV__\` 会挂到 \`window.__DEV__\`，\`const APP_NAME\` 只是全局符号。

## 22.7 实际项目中的应用

### 场景 1：GA / Sentry 等第三方脚本

\`\`\`tsx
// types/ga.d.ts
export {};
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
    dataLayer?: any[];
  }
}

// 业务里
useEffect(() => {
  window.gtag?.('event', 'page_view', { page_path: location.pathname });
}, []);
\`\`\`

### 场景 2：环境注入的全局变量

\`vite.config\` 里 \`define: { __APP_VERSION__: JSON.stringify(version) }\`：

\`\`\`tsx
// types/env.d.ts
declare global {
  const __APP_VERSION__: string;
  const __API_BASE__: string;
}

// 业务里
fetch(\`__API_BASE__/user\`);
\`\`\`

### 场景 3：扩展第三方库类型

\`\`\`tsx
// 扩展 Express 的 Request
declare module 'express' {
  interface Request {
    user?: { id: string; name: string };
  }
}
\`\`\`

注意这其实是 \`declare module\`，不是 \`declare global\`。两者都属"模块增强"。

## 22.8 常见坑

**坑 1：在脚本里写 declare global 报错**

\`\`\`tsx
// 文件里没有 import/export 时是"脚本"，不是"模块"
// 此时 declare global 会报错
declare global { interface Window { x: number; } }  // ❌
\`\`\`

解决：加一行 \`export {}\`。

**坑 2：namespace 和 module 混用导致循环**

老代码迁移时容易出现：namespace 文件 import 了 module，module 又用 namespace。改起来很麻烦，建议一次性把 namespace 拆成 module。

**坑 3：嵌套太深 IDE 跳不动**

\`App.UI.Components.Form.Input.XXX\` 这种调用，重构时改名容易漏。层数控制在 2 层以内。

## 22.9 小结

- namespace 是 TS 早期的"伪模块"方案，编译后是全局 IIFE
- 现代 TS 推荐 ES Module，新项目不要用 namespace
- namespace 在 .d.ts 里仍然常见，用于描述全局变量
- \`declare global\` 是 ESM 时代扩展全局对象的官方姿势
- 扩展第三方库类型用 \`declare module 'xxx'\`
- 记住：一个文件有 \`import/export\` 才是模块，否则是脚本
`,
    code: `// =============================================================
// 第 22 章示例：用闭包对象模拟 namespace 行为
// 沙箱限制：不能真的用 namespace 关键字（编译产物里有，但
// 沙箱环境只跑单文件），这里用 IIFE 对象模拟 namespace
// =============================================================

// ---- 模拟一个简单 namespace：App ----
// 等价于：namespace App { export const version = ...; export function start() {...} }
const App = (function () {
  // 内部成员（未 export 的等价于私有）
  const internal = 'private';

  // export 出去的成员
  return {
    version: '1.0.0',                       // 等价于 export const version
    start() {                                // 等价于 export function start
      console.log('App ' + this.version + ' started');
    },
    Router: class {                          // 等价于 export class Router
      navigate(path) { return 'navigated to ' + path; }
    },
  };
})();

// 外部访问 namespace 的成员
console.log('App.version       =', App.version);
App.start();
console.log('App.Router        :', new App.Router().navigate('/home'));

// ---- 模拟嵌套 namespace：App.Utils.xxx ----
const App2 = {
  version: '2.0.0',
  Utils: {                                   // 嵌套 namespace
    clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
    uid() { return Math.random().toString(36).slice(2); },
  },
  Network: {
    get(url) { return 'GET ' + url; },
  },
};

console.log('\\n=== 嵌套 namespace ===');
console.log('App2.Utils.clamp(15, 0, 10) =', App2.Utils.clamp(15, 0, 10));
console.log('App2.Utils.uid()            =', App2.Utils.uid());
console.log('App2.Network.get("/api")    =', App2.Network.get('/api'));

// ---- 模拟别名：import Btn = App.Router ----
const Btn = App.Router;                       // 简化调用路径
console.log('\\n=== 别名 ===');
console.log('用别名 Btn 导航：', new Btn().navigate('/list'));

// ---- 模拟 declare global：扩展 window ----
// 真实代码：declare global { interface Window { gtag: Function } }
// 这里直接给对象挂属性模拟
const fakeWindow = {};
fakeWindow.__APP_VERSION__ = '3.1.4';          // 模拟注入的全局变量
fakeWindow.gtag = function (event, payload) {  // 模拟 GA 全局函数
  console.log('[gtag]', event, JSON.stringify(payload));
};

console.log('\\n=== 模拟 declare global ===');
console.log('window.__APP_VERSION__ =', fakeWindow.__APP_VERSION__);
fakeWindow.gtag('event', { page: '/home' });

// ---- 模拟扩展第三方库类型（declare module） ----
// 真实代码：declare module 'express' { interface Request { user?: User } }
// 这里用对象扩展模拟
const fakeReq = { url: '/api/user' };          // 原本只有 url
Object.assign(fakeReq, { user: { id: 'u1', name: 'Tom' } });  // 扩展
console.log('\\n=== 模拟 declare module 扩展 ===');
console.log('扩展后的 req =', fakeReq);

// ---- 演示 namespace 与 module 的区别 ----
console.log('\\n=== namespace vs module 关键差异 ===');
console.log('1. namespace 是全局对象（编译为 IIFE）');
console.log('2. module 是文件作用域（每文件独立）');
console.log('3. namespace 不支持 Tree Shaking');
console.log('4. namespace 不支持动态 import()');
console.log('5. 现代项目新代码都用 module');

console.log('\\n=== 仍然推荐 namespace 的场景 ===');
console.log('1. .d.ts 给 <script> 引入的库补类型');
console.log('2. declare global 扩展 window / globalThis');
console.log('3. 维护老代码（迁移时一次性改成 module）');
`,
  },
  {
    id: "tspro-d-ts",
    group: "四、TypeScript 模块与工程化",
    icon: "📄",
    title: "类型声明文件（.d.ts）",
    content: `# 第 23 章：类型声明文件（.d.ts）

## 23.1 为什么需要 .d.ts

TypeScript 项目里所有 \`.ts\` / \`.tsx\` 文件都会参与类型检查并产出 JS。但有两种情况，你拿不到 TS 源码：

1. **使用 JS 写的第三方库**（jQuery、lodash、老版 moment 等）
2. **JS 写的项目内部代码**（历史遗留、或合作方交付的 JS）

让 TS 直接 import 这些 JS，会报"找不到声明"的错。\`.d.ts\` 就是给 JS 代码"补一份类型说明书"——只描述类型，不含任何运行时逻辑，编译后会被完全擦除。

\`\`\`tsx
// math.js（无类型的 JS）
export function add(a, b) { return a + b; }

// math.d.ts（类型说明书）
declare function add(a: number, b: number): number;
export = add;
\`\`\`

TS 看到 \`.d.ts\` 就知道：哦，\`add\` 接受两个数字返回一个数字。类型检查能跑，调用有提示，编译后 \`import\` 仍然指向原始 JS。

## 23.2 declare 关键字全解

\`declare\` 的本质：**告诉编译器"某个东西已经存在，我只是告诉你它的类型，不要生成代码"**。

### 1. 声明变量

\`\`\`tsx
// global.d.ts
declare const APP_VERSION: string;     // 全局常量
declare var jQuery: any;                // 全局变量
\`\`\`

业务里直接 \`console.log(APP_VERSION)\` 不报错。

### 2. 声明函数

\`\`\`tsx
declare function gtag(command: string, action: string, params?: any): void;
\`\`\`

### 3. 声明类

\`\`\`tsx
declare class Animal {
  constructor(name: string);
  speak(): void;
}
\`\`\`

### 4. 声明模块

最常用于给 JS 文件补类型：

\`\`\`tsx
// modules/foo.d.ts
declare module 'foo' {
  export function bar(x: number): string;
  export const version: string;
}

// 业务里
import { bar, version } from 'foo';
\`\`\`

也可以用通配符：

\`\`\`tsx
declare module '*.css' { const classes: { [key: string]: string }; export default classes; }
declare module '*.svg' { const url: string; export default url; }
declare module '*.png' { const url: string; export default url; }
\`\`\`

Webpack/Vite 项目里 \`import logo from './logo.svg'\` 能跑，全靠这种声明。

### 5. 声明全局接口扩展（declare global）

\`\`\`tsx
export {};
declare global {
  interface Window { myTrack: (e: string) => void; }
}
\`\`\`

上一章已详细讲过。

## 23.3 第三方库 @types 安装

社区维护了一个大型仓库 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)，几乎覆盖所有流行 JS 库。安装命令：

\`\`\`bash
npm i -D @types/lodash
npm i -D @types/node
npm i -D @types/react
npm i -D @types/jest
\`\`\`

包名规律：\`@types/<包名>\`。装完后 TS 自动识别（\`node_modules/@types/\` 是默认查找路径）。

### 查询某个库是否有 @types

\`\`\`bash
# 看 npm 上有没有
npm info @types/lodash

# 或者直接看官方文档
\`\`\`

不少现代库（如 \`axios\`、\`zod\`、\`swr\`）已经把类型打包到产物里（\`package.json\` 的 \`types\` 字段指向 \`./dist/index.d.ts\`），这种就不需要装 \`@types\`。

### types 与 typings 字段

\`\`\`json
{
  "name": "my-lib",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "typings": "dist/index.d.ts"
}
\`\`\`

\`types\` 和 \`typings\` 等价，\`types\` 是新写法，优先用。

## 23.4 自定义 .d.ts 给 JS 模块补类型

### 场景 1：项目内部的 JS 老代码

\`\`\`tsx
// legacy/format.js（无类型）
export function formatDate(d) { /* ... */ }
export function parseDate(s) { /* ... */ }

// legacy/format.d.ts
export function formatDate(d: Date | number): string;
export function parseDate(s: string): Date;
\`\`\`

把 \`.d.ts\` 和 \`.js\` 放一起（同名），TS 自动找到。

### 场景 2：第三方库没有 @types

\`\`\`tsx
// types/some-old-lib.d.ts
declare module 'some-old-lib' {
  export function init(config: { apiKey: string }): void;
  export function track(event: string): void;
  export const version: string;
}
\`\`\`

放在项目的 \`types/\` 或 \`src/types/\` 下，\`tsconfig.json\` 默认会包含。

### 场景 3：通配符模块声明

\`\`\`tsx
// types/assets.d.ts
declare module '*.svg' {
  const url: string;
  export default url;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.md' {
  const content: string;
  export default content;
}
\`\`\`

Vite/CRA 项目默认就有这种声明，所以 \`import logo from './logo.svg'\` 才能跑。

## 23.5 .d.ts 文件的三种写法

### 写法 1：模块形式（有 import/export）

最常见，描述一个模块：

\`\`\`tsx
// types/user.d.ts
export interface User {
  id: number;
  name: string;
}

export function fetchUser(id: number): Promise<User>;
\`\`\`

\`.d.ts\` 里有 \`export\` 就是模块声明，外部要 \`import\` 才能用。

### 写法 2：全局形式（无 import/export）

只对全局生效，不绑定模块：

\`\`\`tsx
// globals.d.ts
declare const APP_VERSION: string;
declare function gtag(...args: any[]): void;
\`\`\`

业务里 \`APP_VERSION\` 直接可用，无需 import。

### 写法 3：混合形式（declare global）

文件本身是模块（有 \`export {}\`），同时扩展全局：

\`\`\`tsx
export {};

declare global {
  interface Window { myFn: () => void; }
  const __DEV__: boolean;
}
\`\`\`

## 23.6 给 JS 文件自动生成 .d.ts

如果 JS 代码已经用 JSDoc 写了类型，TS 可以自动生成 .d.ts：

\`\`\`tsx
// math.js
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) { return a + b; }
\`\`\`

\`\`\`bash
npx tsc math.js --declaration --emitDeclarationOnly --allowJs
\`\`\`

生成：

\`\`\`tsx
export function add(a: number, b: number): number;
\`\`\`

发布 NPM 库时，\`declaration: true\` 会让 \`tsc\` 自动产出 .d.ts。

## 23.7 实际项目中的应用

### 场景 1：Vite 项目入口配置

\`\`\`tsx
// vite-env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
\`\`\`

\`/// <reference types="vite/client" />\` 引入 Vite 自带类型，提供 \`import.meta.env\` 等类型。

### 场景 2：扩展 Express Request

\`\`\`tsx
// types/express.d.ts
declare module 'express' {
  interface Request {
    user?: { id: string; role: 'admin' | 'user' };
    traceId: string;
  }
}
\`\`\`

中间件里 \`req.user\` 就有类型了。

### 场景 3：注入环境变量

\`\`\`tsx
// types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_APP_TITLE: string;
  readonly MODE: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
\`\`\`

Vite 项目里 \`import.meta.env.VITE_API_BASE\` 之所以有类型，就是这个声明在起作用。

## 23.8 常见坑

**坑 1：.d.ts 里写了实现**

\`\`\`tsx
// ❌ 错：.d.ts 不能有实现
declare function add(a: number, b: number) {
  return a + b;
}

// ✅ 对：只声明，不实现
declare function add(a: number, b: number): number;
\`\`\`

\`.d.ts\` 是说明书，不能有函数体、变量赋值。

**坑 2：声明了但实际不存在**

\`\`\`tsx
declare module 'foo' { export function bar(): void; }
\`\`\`

如果 \`foo\` 里其实没有 \`bar\`，TS 不会发现，运行时却会 \`undefined is not a function\`。.d.ts 写错只能靠测试发现。

**坑 3：忘记 export {} 导致 declare global 失效**

\`\`\`tsx
// 文件没 import/export 时是"脚本"，declare global 报错
declare global { interface Window { x: number; } }  // ❌

// 加一行 export {} 就好
export {};
declare global { interface Window { x: number; } }  // ✅
\`\`\`

**坑 4：声明冲突**

多个 .d.ts 对同一模块声明不同类型，TS 报"重复声明"。要么合并，要么用 \`import\` 替代。

## 23.9 小结

- .d.ts 是 TS 的类型说明书，只描述类型，不含运行时代码
- \`declare\` 用于声明已存在的变量、函数、类、模块
- 第三方库优先装 \`@types/xxx\`，没有就自己写 .d.ts
- \`declare module '*.css'\` 等通配符声明让 import 静态资源有类型
- 给项目内 JS 代码补类型：同名 .d.ts 放一起
- \`declare global\` 必须在模块文件里（至少 \`export {}\`）
- 发布 NPM 库时开 \`declaration: true\` 自动生成 .d.ts
`,
    code: `// =============================================================
// 第 23 章示例：模拟 .d.ts 声明文件的作用
// 沙箱限制：.d.ts 编译后被擦除，这里用"模拟"展示声明与
// 实际值的关系：声明提供类型，JS 提供值
// =============================================================

// ---- 模拟给 JS 库补类型：some-old-lib ----
// 真实 .d.ts：declare module 'some-old-lib' {
//   export function init(config: { apiKey: string }): void;
//   export function track(event: string): void;
//   export const version: string;
// }
const someOldLib = {
  init(config) { console.log('init with apiKey=' + config.apiKey); },
  track(event) { console.log('track: ' + event); },
  version: '2.1.0',
};
// 业务里调用：someOldLib.init({ apiKey: 'xxx' })
// TS 会按 .d.ts 检查参数类型
someOldLib.init({ apiKey: 'AK-12345' });
someOldLib.track('click');

// ---- 模拟通配符模块声明：import logo from './logo.svg' ----
// 真实 .d.ts：declare module '*.svg' { const url: string; export default url; }
const logoUrl = '/static/logo.svg';  // 等价于 import logo from './logo.svg'
console.log('\\nlogo url:', logoUrl);

// ---- 模拟 CSS Module 类型声明 ----
// 真实 .d.ts：declare module '*.module.css' {
//   const classes: Record<string, string>; export default classes;
// }
const styles = { button: 'Button_button__a1b2', large: 'Button_large__c3d4' };
console.log('CSS Module classes:', styles);

// ---- 模拟 declare global：扩展 window ----
// 真实 .d.ts：export {}; declare global { interface Window { gtag: Function } }
const fakeWindow = {};
fakeWindow.APP_VERSION = '1.2.3';
fakeWindow.gtag = function (event, payload) {
  console.log('[gtag]', event, JSON.stringify(payload));
};
console.log('\\n=== 模拟 declare global ===');
console.log('window.APP_VERSION =', fakeWindow.APP_VERSION);
fakeWindow.gtag('page_view', { path: '/home' });

// ---- 模拟扩展第三方库类型（declare module 'express'） ----
// 真实 .d.ts：
// declare module 'express' {
//   interface Request { user?: { id: string; role: 'admin' | 'user' } }
// }
const fakeReq = { url: '/api/user' };
Object.assign(fakeReq, { user: { id: 'u1', role: 'admin' } });
console.log('\\n=== 模拟 declare module 扩展 ===');
console.log('扩展后的 req.user =', fakeReq.user);

// ---- 模拟环境变量类型（ImportMetaEnv） ----
// 真实 .d.ts：
// interface ImportMetaEnv {
//   readonly VITE_API_BASE: string;
//   readonly VITE_APP_TITLE: string;
// }
const importMetaEnv = {
  VITE_API_BASE: 'https://api.example.com',
  VITE_APP_TITLE: 'My App',
};
console.log('\\n=== 模拟 import.meta.env 类型 ===');
console.log('VITE_API_BASE  =', importMetaEnv.VITE_API_BASE);
console.log('VITE_APP_TITLE =', importMetaEnv.VITE_APP_TITLE);

// ---- 演示 .d.ts 的核心规则：只有类型，没有实现 ----
console.log('\\n=== .d.ts 关键规则 ===');
console.log('1. .d.ts 只描述类型，不含运行时代码');
console.log('2. declare 关键字告诉 TS "这个值已存在"');
console.log('3. 第三方库优先装 @types/xxx');
console.log('4. declare global 必须在 module 文件里（加 export {}）');
console.log('5. .d.ts 编译后会被完全擦除');

// ---- 演示声明与实现分离的代码组织 ----
console.log('\\n=== 声明 + 实现的典型组织 ===');
// 类型声明（实际写在 .d.ts）
const typeInfo = {
  UserShape: '{ id: number; name: string; email: string }',
  fetchUserSig: '(id: number) => Promise<User>',
};
// 运行时实现（实际写在 .ts 或 .js）
function fetchUser(id) {
  return Promise.resolve({ id: id, name: 'Tom', email: 'tom@x.com' });
}
fetchUser(1).then(function (u) {
  console.log('声明：', typeInfo.UserShape);
  console.log('实现返回：', u);
});
`,
  },
  {
    id: "tspro-triple-slash",
    group: "四、TypeScript 模块与工程化",
    icon: "➡️",
    title: "三斜线指令（Triple-Slash Directives）",
    content: `# 第 24 章：三斜线指令（Triple-Slash Directives）

## 24.1 为什么需要三斜线指令

回到 ES Module 之前的时代：那时没有 \`import\`，TS 需要一种方式告诉编译器"编译前请把另一个文件也包含进来"。这个机制就是**三斜线指令**——文件顶部以 \`///\` 开头的注释。

\`\`\`tsx
/// <reference path="./utils.ts" />
/// <reference types="node" />

console.log(process.argv);
\`\`\`

它解决两件事：

1. **依赖文件**：编译前把指定 .ts 文件加载进来（旧用法）
2. **依赖类型包**：把某个 \`@types/xxx\` 包含进当前编译（仍然常用）

三斜线指令**必须放在文件最顶部**（前面只能有空行/注释），否则会被当普通注释忽略。

## 24.2 两种主要形式

### 形式 1：/// <reference path="..." />

告诉编译器：编译当前文件前，先把 path 指向的文件也加进来。

\`\`\`tsx
/// <reference path="./validators.ts" />

namespace Validation {
  // 这里能用 validators.ts 里 namespace Validation 的成员
  export function isEmail(s: string) { return /.+@.+/.test(s); }
}
\`\`\`

这是老式 namespace 跨文件合并的标配。现代 ES Module 项目里**基本不用了**，被 \`import\` 完全替代。

### 形式 2：/// <reference types="..." />

告诉编译器：把 \`@types/xxx\` 包含进当前文件的编译范围。

\`\`\`tsx
/// <reference types="node" />

console.log(process.platform);   // process 来自 @types/node
\`\`\`

这个形式**仍然常用**，特别是在 .d.ts 文件里。Vite 项目的 \`vite-env.d.ts\` 里就有：

\`\`\`tsx
/// <reference types="vite/client" />
\`\`\`

它把 Vite 的客户端类型（\`import.meta.env\`、\`import.meta.glob\` 等）引入到项目里。

## 24.3 与 import 的关系

| 维度 | 三斜线指令 | import |
| --- | --- | --- |
| 引入对象 | 文件路径或 @types 包 | 模块 |
| 引入内容 | 类型 + 值（合并 namespace） | 类型 + 值，按需 |
| 时机 | 编译前预处理 | 编译期处理 |
| Tree Shaking | 不支持 | 支持 |
| 显式性 | 隐式依赖 | 显式依赖 |
| 现代推荐 | 仅 .d.ts 里用 \`types\` 形式 | 默认方案 |

**核心区别**：

- \`import\` 是 ES 标准，引入的是"模块"，按需加载、可 Tree Shaking
- 三斜线 \`path\` 是把整个文件"塞进"当前编译，类似 C 的 \`#include\`，没有按需
- 三斜线 \`types\` 只用于声明对 \`@types\` 的依赖，等价于在 \`tsconfig.types\` 里加一项

## 24.4 何时还要用三斜线

### 1. .d.ts 引入 @types 依赖

声明文件本身不能 \`import '@types/node'\`（会改变文件性质），用三斜线最干净：

\`\`\`tsx
// globals.d.ts
/// <reference types="node" />

declare global {
  var process: NodeJS.Process;
}
\`\`\`

### 2. Vite / Next.js 项目入口

\`\`\`tsx
// vite-env.d.ts
/// <reference types="vite/client" />
\`\`\`

\`\`\`tsx
// next-env.d.ts（自动生成）
/// <reference types="next" />
/// <reference types="next/image-types/global" />
\`\`\`

这些是脚手架自动生成的，**不要手改**。

### 3. 复杂 .d.ts 拆分到多文件

大型 .d.ts 拆成多份时，用 \`path\` 引用：

\`\`\`tsx
// lib.d.ts
/// <reference path="./lib/dom.d.ts" />
/// <reference path="./lib/node.d.ts" />
/// <reference path="./lib/es2020.d.ts" />
\`\`\`

社区库（如 \`@types/node\`）内部就这么组织。

## 24.5 与现代 import 的对比

### 同样引入类型，两种写法

\`\`\`tsx
// 写法 1：三斜线（旧）
/// <reference types="node" />
const p: NodeJS.Process = process;

// 写法 2：import type（新，推荐）
import type { Process } from 'node:process';
const p2: Process = process;
\`\`\`

新代码尽量用 \`import type\`，因为它：

- 显式声明依赖，看一眼就知道哪来的
- 支持 Tree Shaking，不影响打包
- 是 ES 标准，未来 TS 也不会弃用

### 同样引入文件，两种写法

\`\`\`tsx
// 写法 1：三斜线（旧）
/// <reference path="./utils.ts" />
console.log(add(1, 2));

// 写法 2：import（新）
import { add } from './utils';
console.log(add(1, 2));
\`\`\`

新代码 100% 用 \`import\`。

## 24.6 常见 .d.ts 中的三斜线模式

### 模式 1：依赖多个 @types

\`\`\`tsx
// types/globals.d.ts
/// <reference types="node" />
/// <reference types="jest" />
/// <reference types="vite/client" />
\`\`\`

让 \`process\`、\`test\`/\`expect\`、\`import.meta.env\` 等都在项目里可用。

### 模式 2：拆分大型 .d.ts

\`\`\`tsx
// my-lib.d.ts
/// <reference path="./my-lib/core.d.ts" />
/// <reference path="./my-lib/utils.d.ts" />
/// <reference path="./my-lib/network.d.ts" />

export * from './my-lib/core';
\`\`\`

发布大型库时常见。

### 模式 3：补丁式扩展

\`\`\`tsx
// patch.d.ts
/// <reference types="express" />

declare module 'express' {
  interface Request {
    traceId: string;
  }
}
\`\`\`

先用 \`reference types\` 把原声明拉进来，再做模块增强。

## 24.7 实际项目中的应用

### 场景 1：Next.js 项目入口

Next.js 自动生成 \`next-env.d.ts\`：

\`\`\`tsx
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
\`\`\`

每次 \`next dev\` / \`next build\` 会自动覆盖。如果你删了它，下次启动 Next 会重新生成。

### 场景 2：Vite 项目入口

\`\`\`tsx
// vite-env.d.ts
/// <reference types="vite/client" />
\`\`\`

它让 \`import.meta.env.VITE_XXX\` 有类型，让 \`?url\`、\`?raw\`、\`?worker\` 等查询语法有类型。

### 场景 3：自定义环境变量扩展

\`\`\`tsx
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
\`\`\`

先引入 Vite 默认类型，再扩展自己的环境变量。

## 24.8 常见坑

**坑 1：三斜线不在文件顶部**

\`\`\`tsx
import { x } from './x';

/// <reference types="node" />  // ❌ 已经被当作普通注释
\`\`\`

三斜线**必须**在文件最顶部（前面只能有空行、其他三斜线、注释）。一旦有 \`import\` 在前面就失效。

**坑 2：手改 next-env.d.ts / vite-env.d.ts**

下次启动框架会覆盖掉你的改动。要在 \`env.d.ts\` 等自定义文件里扩展。

**坑 3：在 .ts 里用三斜线代替 import**

\`\`\`tsx
// ❌ 老写法，不推荐
/// <reference path="./utils.ts" />
console.log(add(1, 2));

// ✅ 现代 import
import { add } from './utils';
\`\`\`

\`.ts\` 文件里 99% 用 \`import\`，三斜线只在 .d.ts 里使用。

**坑 4：types 形式和 tsconfig types 字段重复**

\`\`\`json
// tsconfig.json
{ "types": ["node", "jest"] }
\`\`\`

这时再在文件里写 \`/// <reference types="node" />\` 就多余了。两者效果一样，挑一种即可。

## 24.9 小结

- 三斜线指令是 ES Module 之前的依赖声明方式，以 \`///\` 开头
- 两种形式：\`<reference path>\` 引入文件，\`<reference types>\` 引入 @types 包
- 必须放在文件最顶部，否则失效
- 现代 .ts 项目里几乎不用，被 \`import\` 替代
- .d.ts 文件里仍然常用 \`<reference types>\`，特别是 Vite/Next 入口文件
- 新代码用 \`import type\`，不要用三斜线
- 框架自动生成的 \`next-env.d.ts\` / \`vite-env.d.ts\` 不要手改
`,
    code: `// =============================================================
// 第 24 章示例：模拟三斜线指令的行为
// 沙箱限制：三斜线在编译期处理，运行时完全消失
// 这里用注释模拟"编译期引入类型"的效果
// =============================================================

// ---- 模拟 /// <reference types="node" /> ----
// 真实 .d.ts：
//   /// <reference types="node" />
//   declare const process: { platform: string; argv: string[] };
// 这里直接构造一个等价的全局对象
const process = {
  platform: 'darwin',                       // 模拟 Node.js process.platform
  argv: ['node', 'app.js', '--port=3000'],  // 模拟命令行参数
  env: { NODE_ENV: 'development' },
};
console.log('=== 模拟 <reference types="node" /> ===');
console.log('process.platform =', process.platform);
console.log('process.argv     =', process.argv);
console.log('process.env      =', process.env);

// ---- 模拟 /// <reference types="vite/client" /> ----
// 真实作用：让 import.meta.env 有类型
const importMeta = {
  env: {
    VITE_API_BASE: 'https://api.example.com',
    VITE_APP_TITLE: 'My App',
    DEV: true,
    PROD: false,
  },
  glob(pattern) {
    return { './pages/Home.tsx': () => Promise.resolve({ default: 'Home' }) };
  },
};
console.log('\\n=== 模拟 <reference types="vite/client" /> ===');
console.log('import.meta.env.VITE_API_BASE  =', importMeta.env.VITE_API_BASE);
console.log('import.meta.env.VITE_APP_TITLE =', importMeta.env.VITE_APP_TITLE);
console.log('import.meta.env.DEV            =', importMeta.env.DEV);

// ---- 模拟 /// <reference path="./utils.ts" /> ----
// 真实作用：编译时把 utils.ts 的内容塞进来
// 这里用 inline 的方式模拟"引入了别的文件的代码"
const utilsFromReference = {
  add(a, b) { return a + b; },
  square(x) { return x * x; },
};
console.log('\\n=== 模拟 <reference path="./utils.ts" /> ===');
console.log('utilsFromReference.add(2,3)  =', utilsFromReference.add(2, 3));
console.log('utilsFromReference.square(5) =', utilsFromReference.square(5));

// ---- 演示三斜线指令的位置约束 ----
console.log('\\n=== 三斜线位置约束 ===');
console.log('1. 必须放在文件最顶部（前面只能有空行/其他三斜线/注释）');
console.log('2. 一旦前面有 import 语句，三斜线会被当普通注释忽略');
console.log('3. 必须以 /// 开头（三个斜线，不是两个）');
console.log('4. 指令和 < 之间不能有空格：/// <reference 才合法');

// ---- 演示三斜线 vs import 的对比 ----
console.log('\\n=== 三斜线 vs import 对比 ===');
console.log('三斜线 path：编译前预处理，把整个文件塞进编译');
console.log('import     ：编译期处理，按需引入，支持 Tree Shaking');
console.log('三斜线 types：引入 @types/xxx 包');
console.log('import type：引入类型，编译后被擦除');

// ---- 演示典型场景：env.d.ts 扩展 ----
console.log('\\n=== Vite 项目 env.d.ts 典型内容 ===');
const envDtsContent = [
  '/// <reference types="vite/client" />',
  '',
  'interface ImportMetaEnv {',
  '  readonly VITE_API_BASE: string;',
  '  readonly VITE_APP_TITLE: string;',
  '}',
  '',
  'interface ImportMeta {',
  '  readonly env: ImportMetaEnv;',
  '}',
].join('\\n');
console.log(envDtsContent);

// ---- 演示 Next.js 自动生成的 next-env.d.ts ----
console.log('\\n=== Next.js next-env.d.ts 自动生成 ===');
const nextEnvDts = [
  '/// <reference types="next" />',
  '/// <reference types="next/image-types/global" />',
  '',
  '// NOTE: This file should not be edited',
].join('\\n');
console.log(nextEnvDts);

console.log('\\n=== 三斜线指令核心要点 ===');
console.log('1. 现代项目 .ts 里基本不用，被 import 替代');
console.log('2. .d.ts 里仍常用 <reference types="..." />');
console.log('3. 框架自动生成的入口 .d.ts 不要手改');
console.log('4. 新代码引入类型用 import type，不用三斜线');
`,
  },
  {
    id: "tspro-tsconfig",
    group: "四、TypeScript 模块与工程化",
    icon: "⚙️",
    title: "tsconfig.json 完整配置详解",
    content: `# 第 25 章：tsconfig.json 完整配置详解

## 25.1 为什么需要 tsconfig.json

一个 TS 项目动辄几十上百个文件，编译器怎么知道哪些要编译、用什么版本、严格到什么程度、输出到哪里？答案就是 \`tsconfig.json\`——TS 项目的"编译配置说明书"。

放在项目根目录的 \`tsconfig.json\` 是 TS 编译器的入口。它决定：

- **编译范围**：哪些文件参与编译（include / exclude / files）
- **目标环境**：编译成 ES5 还是 ESNext？CommonJS 还是 ESM？
- **类型检查严格度**：要不要 strict、要不要查 null
- **JSX 支持**：react / react-jsx / preserve
- **路径映射**：\`@/components\` 指向哪个目录
- **产物输出**：输出到哪个目录、要不要 source map、要不要 .d.ts

没有 \`tsconfig.json\`，TS 会用一组默认值编译，但任何严肃项目都需要自己配。

## 25.2 顶层结构

\`\`\`json
{
  "compilerOptions": { /* 编译选项，最核心 */ },
  "include": ["src/**/*"],          /* 包含哪些文件 */
  "exclude": ["node_modules"],       /* 排除哪些文件 */
  "files": ["a.ts", "b.ts"],         /* 精确指定文件（优先级最高） */
  "extends": "./tsconfig.base.json", /* 继承另一个配置 */
  "references": [                    /* 项目引用，多包项目用 */
    { "path": "./packages/shared" }
  ]
}
\`\`\`

最常用的就两个：\`compilerOptions\` 和 \`include/exclude\`。

## 25.3 编译目标相关

### target

编译产物的 JS 版本。决定哪些语法被降级、哪些保留。

\`\`\`json
{ "compilerOptions": { "target": "ES2020" } }
\`\`\`

可选值：\`ES3\` / \`ES5\` / \`ES6\`/\`ES2015\` / \`ES2017\` / \`ES2020\` / \`ESNext\` 等。

\`\`\`tsx
// 源码
const a = 1 ?? 2;        // ES2020 空值合并
async function f() {}    // ES2017

// target: ES5 时
var a = 1 !== null && 1 !== void 0 ? 1 : 2;
// async 被编译成 generator + helper

// target: ES2020 时
const a = 1 ?? 2;        // 原样保留
\`\`\`

经验：现代浏览器都支持 ES2020，设 \`target: ES2020\` 即可。Node 14+ 也支持 ES2020。

### module

模块系统标准。决定 \`import/export\` 编译成什么。

\`\`\`json
{ "compilerOptions": { "module": "ESNext" } }
\`\`\`

可选值：\`CommonJS\` / \`ES6\`/\`ES2015\` / \`ESNext\` / \`AMD\` / \`UMD\` / \`NodeNext\` 等。

- 前端项目（Webpack/Vite）：\`ESNext\` 或 \`ESNext\` + Preserve
- Node 项目：\`CommonJS\`（老）或 \`NodeNext\`（新，支持原生 ESM）
- 库开发：跟使用方对齐

### moduleResolution

模块解析策略。决定 \`import './x'\` 怎么找文件。

\`\`\`json
{ "compilerOptions": { "moduleResolution": "Bundler" } }
\`\`\`

可选值：

| 值 | 适用场景 | 特点 |
| --- | --- | --- |
| \`node\` | Node 老项目 | 严格 CommonJS 解析 |
| \`node16\` / \`nodenext\` | Node 新项目 | 支持原生 ESM，必须带扩展名 |
| \`bundler\` | Webpack/Vite/Next | 像 bundler 一样解析，最宽松 |

Vite / Next.js / 现代 Web 项目用 \`Bundler\` 最方便，可以省略扩展名。

### lib

预置类型库。决定 \`Array\`、\`Promise\`、\`Map\`、\`DOM\` 等内置类型有哪些。

\`\`\`json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
\`\`\`

- \`ES2020\`：包含 \`Promise.allSettled\`、\`String.matchAll\` 等
- \`DOM\`：包含 \`document\`、\`window\`、\`HTMLElement\` 等
- \`DOM.Iterable\`：让 \`querySelectorAll\` 等可迭代

前端项目一定要带 \`DOM\`，否则 \`document.querySelector\` 报错。Node 项目不要带 \`DOM\`，否则能用 \`window\` 但运行时不存在。

## 25.4 严格性相关

### strict 总开关

\`\`\`json
{ "compilerOptions": { "strict": true } }
\`\`\`

\`strict: true\` 等价于同时开启 8 个子选项：

| 子选项 | 含义 |
| --- | --- |
| \`noImplicitAny\` | 禁止隐式 any |
| \`strictNullChecks\` | null/undefined 不能赋给其他类型 |
| \`strictFunctionTypes\` | 函数参数双向检查改为逆变 |
| \`strictBindCallApply\` | bind/call/apply 严格类型 |
| \`strictPropertyInitialization\` | 类属性必须初始化 |
| \`noImplicitThis\` | 禁止 this 为隐式 any |
| \`alwaysStrict\` | 编译出 \`use strict\` |
| \`useUnknownInCatchVariables\` | catch 的 e 默认是 unknown |

**新项目一律开 \`strict: true\`**，没有商量余地。

### noImplicitAny

\`\`\`tsx
// noImplicitAny: false（默认）
function f(x) { return x + 1; }  // x 隐式 any，不报错

// noImplicitAny: true
function f(x) { return x + 1; }  // ❌ x 隐式 any
function f(x: number) { return x + 1; }  // ✅
\`\`\`

### strictNullChecks

最关键的子选项之一。

\`\`\`tsx
// strictNullChecks: false
let name: string = null;        // 不报错（埋雷）
name.toLowerCase();             // 运行时炸

// strictNullChecks: true
let name: string = null;        // ❌ null 不能赋给 string
let name: string | null = null; // ✅ 显式声明可能为 null
if (name) name.toLowerCase();   // ✅ 收窄后才能用
\`\`\`

\`strictNullChecks\` 一开，所有可能为 null 的地方都得显式处理。这是 TS 价值最大的特性之一。

## 25.5 模块互操作相关

### esModuleInterop

\`\`\`json
{ "compilerOptions": { "esModuleInterop": true } }
\`\`\`

让默认导入兼容 CommonJS：

\`\`\`tsx
// 不开 esModuleInterop
import * as express from 'express';   // 只能这样
const app = express();

// 开 esModuleInterop
import express from 'express';        // 默认导入也行
const app = express();
\`\`\`

新项目必开。

### allowJs

\`\`\`json
{ "compilerOptions": { "allowJs": true } }
\`\`\`

允许 TS 项目里包含 .js 文件。迁移老项目时必开。

### checkJs

\`\`\`json
{ "compilerOptions": { "checkJs": true } }
\`\`\`

对 .js 文件也做类型检查（结合 JSDoc）。一般配合 \`allowJs\` 使用。

### jsx

\`\`\`json
{ "compilerOptions": { "jsx": "react-jsx" } }
\`\`\`

可选值：

| 值 | 产物 | 适用 |
| --- | --- | --- |
| \`preserve\` | 原样保留 JSX | 让下游处理（Babel） |
| \`react\` | 编译成 React.createElement | 老版本 React |
| \`react-jsx\` | 编译成 jsx()（自动导入 runtime） | React 17+，推荐 |
| \`react-jsxdev\` | 开发模式 jsx() | 调试用 |

React 17+ 用 \`react-jsx\`，不再需要在每个文件 \`import React\`。

### resolveJsonModule

\`\`\`json
{ "compilerOptions": { "resolveJsonModule": true } }
\`\`\`

允许 \`import pkg from './package.json'\`。读版本号、配置文件很常用。

### isolatedModules

\`\`\`json
{ "compilerOptions": { "isolatedModules": true } }
\`\`\`

每个文件独立编译（Babel / Vite / esbuild 都是这样）。开启后：

- 不能 re-export 类型而不加 \`type\`
- \`export { type T }\` 才合法

Vite / Next 项目必开，否则用 esbuild 转译会报错。

## 25.6 路径与别名

### baseUrl

\`\`\`json
{ "compilerOptions": { "baseUrl": "./src" } }
\`\`\`

非相对路径 import 的查找根目录。

### paths

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
\`\`\`

业务里：

\`\`\`tsx
import Button from '@components/Button';
import { add } from '@utils/math';
\`\`\`

\`paths\` 只影响 TS 类型检查，运行时（Webpack/Vite）也要配对应别名。

### rootDir / outDir

\`\`\`json
{ "compilerOptions": { "rootDir": "./src", "outDir": "./dist" } }
\`\`\`

输入根目录 / 输出目录。\`rootDir\` 决定编译产物的目录结构。

## 25.7 产物相关

### declaration

\`\`\`json
{ "compilerOptions": { "declaration": true } }
\`\`\`

为每个 .ts 生成对应的 .d.ts。发 NPM 库必开。

### declarationMap

\`\`\`json
{ "compilerOptions": { "declarationMap": true } }
\`\`\`

为 .d.ts 生成 source map，让 IDE 跳到源码而不是 .d.ts。库开发体验更好。

### sourceMap

\`\`\`json
{ "compilerOptions": { "sourceMap": true } }
\`\`\`

为 .js 生成 source map，调试时能映射回 TS 源码。

### outDir / noEmit

\`\`\`json
{ "compilerOptions": { "outDir": "./dist" } }
\`\`\`

输出目录。如果用 Vite/Next 等工具负责打包，TS 只做类型检查：

\`\`\`json
{ "compilerOptions": { "noEmit": true } }
\`\`\`

\`noEmit: true\` 让 TS 只检查不输出，由 bundler 处理编译。

### skipLibCheck

\`\`\`json
{ "compilerOptions": { "skipLibCheck": true } }
\`\`\`

跳过 .d.ts 文件的类型检查。能大幅加快编译速度，几乎不影响业务。推荐开启。

## 25.8 日常开发配置（参考）

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,

    "esModuleInterop": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "vite-env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

适合 Vite / Next.js / 现代 CRA 项目。 \`noEmit: true\` 因为打包交给 Vite/Webpack。

## 25.9 生产构建配置（参考，给 NPM 库）

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020"],

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "outDir": "./dist",
    "rootDir": "./src",

    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
\`\`\`

库开发的要点：开 \`declaration\`、\`sourceMap\`，不开 \`noEmit\`，测试文件排除。

## 25.10 配置项行为差异演示

\`\`\`tsx
// 配置 1：strictNullChecks: false
let name: string = JSON.parse('null');   // 不报错，但运行时 name.toLowerCase() 会炸

// 配置 2：strictNullChecks: true
let name: string = JSON.parse('null');   // ❌ null 不能赋给 string
let name: string | null = JSON.parse('null');  // ✅
\`\`\`

\`\`\`tsx
// 配置 1：noImplicitAny: false
function f(x) { return x.toFixed(2); }  // 不报错，x 隐式 any

// 配置 2：noImplicitAny: true
function f(x) { return x.toFixed(2); }  // ❌ x 隐式 any
function f(x: number) { return x.toFixed(2); }  // ✅
\`\`\`

\`\`\`tsx
// 配置 1：target: ES5
const a = 1 ?? 2;
// 编译成 var a = 1 !== null && 1 !== void 0 ? 1 : 2;

// 配置 2：target: ES2020
const a = 1 ?? 2;  // 原样保留
\`\`\`

\`\`\`tsx
// 配置 1：esModuleInterop: false
import * as fs from 'fs';   // 必须 *

// 配置 2：esModuleInterop: true
import fs from 'fs';        // 默认导入也行
\`\`\`

## 25.11 常见坑

**坑 1：include 没包含 .d.ts**

\`\`\`json
{ "include": ["src/**/*"] }
\`\`\`

\`src\` 之外的 .d.ts（如根目录 \`vite-env.d.ts\`）不会被发现。要么放 src 内，要么 include 加上。

**坑 2：paths 改了但 bundler 没改**

TS 能 \`import '@/x'\`，但 Webpack/Vite 不认 \`@\`，运行时报错。两边都要配别名。

**坑 3：strict 半开导致奇怪报错**

只开 \`noImplicitAny\` 不开 \`strictNullChecks\`，看起来"严格了"但 null 漏过去。直接 \`strict: true\` 最稳。

**坑 4：lib 没带 DOM**

前端项目忘了 \`DOM\`，\`document\` 报错；后端项目带了 \`DOM\`，\`window\` 类型能用到运行时不存在。要按目标环境配。

## 25.12 小结

- \`tsconfig.json\` 是 TS 项目编译配置入口
- \`target\` 决定 JS 版本，\`module\` 决定模块系统，\`moduleResolution\` 决定解析策略
- \`strict: true\` 必开，含 8 个严格子选项
- \`esModuleInterop\` 让默认导入兼容 CommonJS
- \`paths\` 配别名，bundler 也要同步配
- 日常项目用 \`noEmit: true\`，让 TS 只做类型检查
- 库开发开 \`declaration\` 和 \`sourceMap\`
- \`skipLibCheck\` 跳过 .d.ts 检查，加快编译
`,
    code: `// =============================================================
// 第 25 章示例：演示不同 tsconfig 配置下 TS 行为差异
// 沙箱限制：不能真的切配置，用代码模拟"如果配了 X，行为是 Y"
// =============================================================

// ---- 演示 strictNullChecks 的差异 ----
console.log('=== strictNullChecks 差异 ===');

// 模拟 strictNullChecks: false 时的行为
// 真实代码：let name: string = JSON.parse('null'); name.toLowerCase();
// 这里用变量模拟
let nameUnchecked = JSON.parse('null');  // 实际是 null，但 TS 不报错
console.log('关闭检查时 name 的实际值:', nameUnchecked);
console.log('（运行时 name.toLowerCase() 会抛 TypeError）');

// 模拟 strictNullChecks: true 时的写法
let nameChecked = JSON.parse('null');
if (typeof nameChecked === 'string') {
  console.log('开启检查后，需先收窄:', nameChecked.toLowerCase());
} else {
  console.log('开启检查后，能安全识别 null:', nameChecked);
}

// ---- 演示 noImplicitAny 的差异 ----
console.log('\\n=== noImplicitAny 差异 ===');

// 模拟关闭时：函数参数隐式 any
function unsafeFunc(x) {  // 关闭时不报错，x 是 any
  return x + 1;
}
console.log('关闭检查时 unsafeFunc(2) =', unsafeFunc(2));
console.log('（但 unsafeFunc("a") 也"合法"，运行时得 "a1"）');

// 模拟开启时：必须显式标类型
function safeFunc(x) {  // 真实代码：function safeFunc(x: number)
  return x + 1;
}
console.log('开启检查后必须显式类型，调用 safeFunc(2) =', safeFunc(2));

// ---- 演示 target 的差异 ----
console.log('\\n=== target 差异 ===');

// ES2020 空值合并
const value = null;
const result = value !== null && value !== void 0 ? value : 'default';   // 模拟 target ES5 编译结果
const resultNew = value ?? 'default';   // target ES2020 原样保留
console.log('target ES5 编译结果  :', result);
console.log('target ES2020 原样保留:', resultNew);

// ---- 演示 esModuleInterop 的差异 ----
console.log('\\n=== esModuleInterop 差异 ===');

// 模拟一个 CommonJS 模块
const cjsModule = { default: function express() { return { listen: () => 'listening' }; } };

// 关闭 esModuleInterop：只能用 import * as
const ns = cjsModule;
console.log('关闭时 import * as，需 ns.default():', ns.default() && 'ok');

// 开启 esModuleInterop：默认导入 = 取 default
const def = cjsModule.default;
console.log('开启时 import 默认导入：', def() && 'ok');

// ---- 演示 paths 别名 ----
console.log('\\n=== paths 别名机制 ===');

// 模拟 tsconfig: { paths: { "@/*": ["src/*"] } }
// 真实代码：import Button from '@/components/Button'
// 等价于：import Button from './src/components/Button'
const aliasMap = { '@/components/Button': './src/components/Button' };
function resolveAlias(spec) {
  for (const key in aliasMap) {
    if (spec.startsWith(key.split('*')[0])) {
      return spec.replace(key.split('*')[0], aliasMap[key].split('*')[0]);
    }
  }
  return spec;
}
console.log("'@/components/Button' 解析为:", resolveAlias('@/components/Button'));

// ---- 演示 declaration: true 的效果 ----
console.log('\\n=== declaration: true 效果 ===');

// 真实场景：源码 add.ts
//   export function add(a: number, b: number): number { return a + b; }
// 编译产出：
//   add.js         → function add(a, b) { return a + b; }
//   add.d.ts       → export function add(a: number, b: number): number;
const sourceContent = 'export function add(a: number, b: number): number { return a + b; }';
const jsOutput = sourceContent.replace(': number', '').replace(': number', '').replace(': number', '');
const dTsOutput = 'export function add(a: number, b: number): number;';
console.log('源码  :', sourceContent);
console.log('add.js:', jsOutput);
console.log('add.d.ts:', dTsOutput);

// ---- 演示 noEmit + bundler 协作 ----
console.log('\\n=== noEmit: true 协作模式 ===');
console.log('tsconfig 只做类型检查（noEmit: true）');
console.log('Vite/Webpack 用 esbuild 转译 TS -> JS');
console.log('两者职责分离，编译速度快');

// ---- 关键配置项总结 ----
console.log('\\n=== 关键配置速查 ===');
const configTips = [
  'strict: true                —— 严格模式总开关，新项目必开',
  'target: ES2020              —— 编译目标 JS 版本',
  'module: ESNext              —— 模块系统标准',
  'moduleResolution: Bundler   —— Vite/Next 项目用',
  'esModuleInterop: true       —— 默认导入兼容 CommonJS',
  'jsx: react-jsx              —— React 17+ 不用 import React',
  'paths: { "@/*": ["src/*"] } —— 路径别名',
  'skipLibCheck: true          —— 跳过 .d.ts 检查加速',
  'noEmit: true                —— 只类型检查，不输出',
  'declaration: true           —— 库开发生成 .d.ts',
];
configTips.forEach(function (t) { console.log('  ' + t); });
`,
  },
  {
    id: "tspro-decorators",
    group: "四、TypeScript 模块与工程化",
    icon: "🎀",
    title: "装饰器（Decorators）",
    content: `# 第 26 章：装饰器（Decorators）

## 26.1 为什么需要装饰器

写后端时常见这样的代码：

\`\`\`tsx
@Controller('/users')
class UserController {
  @Get('/:id')
  @UseGuards(AuthGuard)
  getUser(@Param('id') id: string) {
    return userService.findById(id);
  }
}
\`\`\`

\`@Controller\`、\`@Get\`、\`@UseGuards\` 这些就是**装饰器**。它们是一种"声明式"的语法：在类、方法、属性、参数上加一个 \`@xxx\`，就能改变其行为或附加元数据，而不用动业务代码。

装饰器本质是**高阶函数**——接收目标（类/方法/属性/参数），返回增强后的目标或元数据。

典型应用场景：

- **后端框架**：Nest.js 的 Controller/Service/Module、TypeORM 的 Entity/Column
- **依赖注入**：标记可注入的类、注入依赖
- **路由声明**：声明路由路径、HTTP 方法
- **权限校验**：在方法前后插入权限检查
- **日志/性能**：自动记录调用、统计耗时
- **数据校验**：class-validator 用 \`@IsString()\` 等装饰 DTO

前端 React 项目里很少用装饰器（社区已转向 Hooks），但后端 Nest.js 等框架**强制依赖装饰器**，是 TS 后端开发的必备知识。

## 26.2 装饰器的四种类型

| 类型 | 签名 | 调用时机 |
| --- | --- | --- |
| 类装饰器 | \`function (target: Function)\` | 类定义时 |
| 方法装饰器 | \`function (target, key, descriptor)\` | 方法定义时 |
| 属性装饰器 | \`function (target, key)\` | 属性定义时 |
| 参数装饰器 | \`function (target, key, paramIndex)\` | 参数定义时 |

类装饰器接收类本身，方法/属性/参数装饰器接收原型 + 成员名 + 描述符。

## 26.3 类装饰器

\`\`\`tsx
function Logged(target: Function) {
  console.log('装饰', target.name);
}

@Logged
class A {}
// 输出：装饰 A
\`\`\`

\`@Logged\` 等价于 \`A = Logged(A)\`——把类传给装饰器，返回值（如果有）替换原类。

### 类装饰器工厂

需要传参时，写成"工厂函数"——外层接收参数，返回真正的装饰器：

\`\`\`tsx
function Controller(prefix: string) {
  return function (target: Function) {
    // 把 prefix 挂到类的元数据上
    (target as any).__prefix = prefix;
  };
}

@Controller('/users')
class UserController {}
\`\`\`

\`@Controller('/users')\` 先执行 \`Controller('/users')\` 拿到真正的装饰器，再用它装饰 \`UserController\`。

### 类装饰器替换类

返回新类，完全替换原类：

\`\`\`tsx
function Extend(target: Function) {
  return class extends target {
    extra = 'added by decorator';
  };
}

@Extend
class Base {}

new (Base as any)().extra;  // 'added by decorator'
\`\`\`

## 26.4 方法装饰器

方法装饰器接收三个参数：

1. \`target\`：类的原型（实例方法）或构造函数（静态方法）
2. \`propertyKey\`：方法名
3. \`descriptor\`：属性描述符（\`value\`、\`writable\`、\`configurable\` 等）

\`\`\`tsx
function Log(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: any[]) {
    console.log('调用', key, '参数', args);
    const result = original.apply(this, args);
    console.log('返回', result);
    return result;
  };
}

class Calc {
  @Log
  add(a: number, b: number) { return a + b; }
}

new Calc().add(1, 2);
// 输出：调用 add 参数 [1, 2]
//       返回 3
\`\`\`

这就是典型的 **AOP（面向切面编程）**：在不改原方法代码的前提下，插入日志、性能、权限等横切逻辑。

### 方法装饰器工厂

\`\`\`tsx
function Get(path: string) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    (target as any).__routes = (target as any).__routes || {};
    (target as any).__routes[key] = path;
  };
}

class UserController {
  @Get('/:id')
  getUser() {}
}
\`\`\`

Nest.js 的 \`@Get\`、\`@Post\` 就是这么实现的（外加 reflect-metadata 存元数据）。

## 26.5 属性装饰器

属性装饰器接收两个参数：

1. \`target\`：类的原型或构造函数
2. \`propertyKey\`：属性名

注意：**没有 descriptor**，因为属性在原型上还没初始化。要拿初始值得在 \`__metadata\` 里存。

\`\`\`tsx
function Column(name: string) {
  return function (target: any, key: string) {
    // 把列名映射存到原型上
    target.constructor.__columns = target.constructor.__columns || {};
    target.constructor.__columns[key] = name;
  };
}

class User {
  @Column('user_id')
  id: number;

  @Column('user_name')
  name: string;
}
\`\`\`

TypeORM 的 \`@Column\` 就是这么把类的属性映射到数据库列名。

## 26.6 参数装饰器

参数装饰器接收三个参数：

1. \`target\`：类的原型或构造函数
2. \`propertyKey\`：所属方法名（静态时为 undefined）
3. \`parameterIndex\`：参数在参数列表中的位置

\`\`\`tsx
function Param(name: string) {
  return function (target: any, key: string, index: number) {
    target.constructor.__params = target.constructor.__params || {};
    target.constructor.__params[key] = target.constructor.__params[key] || {};
    target.constructor.__params[key][index] = name;
  };
}

class UserController {
  getUser(@Param('id') id: string, @Param('name') name: string) {}
}
\`\`\`

Nest.js 的 \`@Param\`、\`@Body\`、\`@Query\` 都是参数装饰器，告诉框架"把请求的哪个部分注入到这个参数"。

## 26.7 装饰器执行顺序

多个装饰器同时存在时，按规则执行：

**同一目标的多个装饰器**：从下到上、从右到左（洋葱模型）。

\`\`\`tsx
@A
@B
@C
class X {}

// 等价于 A(B(C(X)))
// 执行顺序：C → B → A
\`\`\`

**类内多种装饰器**：按以下顺序

1. 属性装饰器（按声明顺序）
2. 方法装饰器（按声明顺序）
3. 参数装饰器（按声明顺序）
4. 类装饰器（最外层最后）

实例：

\`\`\`tsx
function trace(name: string) {
  return function () { console.log(name); };
}

@trace('类')
class Demo {
  @trace('属性1') a: number;
  @trace('属性2') b: number;

  @trace('方法')
  method(@trace('参数1') p1: any) {}
}

// 输出顺序：
// 属性1
// 属性2
// 参数1
// 方法
// 类
\`\`\`

记住口诀：**实例成员 → 静态成员 → 类装饰器，多个装饰器从下到上**。

## 26.8 reflect-metadata：装饰器的"数据库"

光有装饰器不够——装饰器只是函数，没有地方存元数据。社区库 \`reflect-metadata\` 提供了一个全局的"元数据存储"，配合装饰器使用：

\`\`\`tsx
import 'reflect-metadata';

const METADATA_KEY = 'design:type';

function LogType(target: any, key: string) {
  const type = Reflect.getMetadata(METADATA_KEY, target, key);
  console.log(key, '类型是', type);
}

class User {
  @LogType
  name: string;  // 输出：name 类型是 String
}
\`\`\`

\`emitDecoratorMetadata: true\`（tsconfig 里开）会让 TS 自动给被装饰的成员加 \`design:type\`、\`design:paramtypes\`、\`design:returntype\` 三种元数据。Nest.js 的依赖注入就靠这个——读构造函数参数类型，自动 new 对应的 Service 注入进去。

\`\`\`tsx
@Injectable()
class UserService {
  // TS 自动把 [UserRepo, Logger] 写到元数据
  constructor(private repo: UserRepo, private logger: Logger) {}
}

// Nest.js 启动时
const types = Reflect.getMetadata('design:paramtypes', UserService);
// types = [UserRepo, Logger]
// 自动 new UserRepo() 和 new Logger() 注入
\`\`\`

## 26.9 实际框架中的应用

### Nest.js：依赖注入与路由

\`\`\`tsx
@Injectable()                                  // 标记为可注入
class UserService {
  findAll() { return ['u1', 'u2']; }
}

@Controller('users')                            // 路由前缀
class UserController {
  constructor(private userService: UserService) {}  // 自动注入

  @Get()                                        // GET /users
  list() { return this.userService.findAll(); }

  @Get(':id')                                   // GET /users/:id
  one(@Param('id') id: string) { return { id }; }
}
\`\`\`

Nest.js 的核心就是装饰器 + reflect-metadata + IoC 容器。所有控制器、服务、模块都靠装饰器声明。

### TypeORM：实体映射

\`\`\`tsx
@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;
}
\`\`\`

TypeORM 用装饰器把类映射到表，属性映射到列，省去手写 SQL schema。

### class-validator：DTO 校验

\`\`\`tsx
class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  age: number;
}

// Nest.js Pipe 自动校验
// body: { name: 'a', email: 'bad', age: -1 }
// → 抛 400：name 太短、email 格式错、age 必须 >= 0
\`\`\`

## 26.10 TS 5.0+ Stage 3 装饰器

老式装饰器是 TC39 Stage 2 提案（experimentalDecorators: true）。TS 5.0 起支持 **Stage 3 装饰器**（标准提案），语法一样但语义不同：

\`\`\`tsx
// Stage 2（experimentalDecorators: true）
function Logged(target: Function) {
  // target 是类本身
}

// Stage 3（TS 5.0+，不开启 experimentalDecorators）
function Logged(target: any, context: ClassDecoratorContext) {
  // target 是类，context 包含 name、kind、metadata 等
}
\`\`\`

主要区别：

| 维度 | Stage 2 | Stage 3 |
| --- | --- | --- |
| 开启方式 | \`experimentalDecorators: true\` | 默认（TS 5.0+） |
| 参数 | 多个固定参数 | 目标 + context 对象 |
| 元数据 | 靠 reflect-metadata | 内置 \`context.metadata\` |
| 参数装饰器 | 支持 | 暂未标准化（Stage 3 未含） |
| 兼容性 | Nest.js 等生态依赖 | 生态尚在迁移 |

**实际项目里**：Nest.js、TypeORM、class-validator 等主流库仍依赖 Stage 2 装饰器，必须开 \`experimentalDecorators: true\`。Stage 3 是未来标准，但生态迁移还需要时间。

## 26.11 在 tsconfig 中启用装饰器

\`\`\`json
{
  "compilerOptions": {
    "experimentalDecorators": true,    // 启用 Stage 2 装饰器
    "emitDecoratorMetadata": true      // 自动 emit design:type 等元数据
  }
}
\`\`\`

两个一起开。Nest.js / TypeORM 项目必加这两行。

## 26.12 常见坑

**坑 1：装饰器在普通函数上不生效**

装饰器只能装饰**类、类方法、类属性、类方法参数**，不能装饰顶层函数：

\`\`\`tsx
@Log                                    // ❌ 报错
function f() {}
\`\`\`

要装饰函数，包成静态方法：

\`\`\`tsx
class Util {
  @Log
  static f() {}
}
\`\`\`

**坑 2：属性装饰器拿不到初始值**

\`\`\`tsx
function Log(target: any, key: string) {
  console.log(target[key]);  // undefined，属性还没初始化
}

class A {
  @Log
  name = 'Tom';   // 初始化在装饰器之后才执行
}
\`\`\`

要拿初始值，得用 getter 重写，或在方法装饰器里读。

**坑 3：装饰器执行多次**

类被多次引用、被继承时，装饰器可能执行多次。装饰器要做幂等：第一次存元数据，第二次检查已存在就跳过。

**坑 4：忘记开 experimentalDecorators**

报错：\`Experimental support for decorators is a feature that must be enabled\`。tsconfig 加 \`experimentalDecorators: true\` 即可。

## 26.13 小结

- 装饰器是声明式语法，本质是高阶函数，4 种：类/方法/属性/参数
- 类装饰器替换或增强类，方法装饰器改写 descriptor（AOP）
- 属性装饰器只能拿名字（拿不到值），参数装饰器拿 index
- 多个装饰器：从下到上、从右到左（洋葱模型）
- \`reflect-metadata\` + \`emitDecoratorMetadata\` 是 Nest.js 依赖注入的基础
- Nest.js / TypeORM / class-validator 强依赖装饰器
- TS 5.0+ 支持 Stage 3 装饰器（标准），但生态仍以 Stage 2 为主
- tsconfig 里 \`experimentalDecorators: true\` + \`emitDecoratorMetadata: true\` 必开
`,
    code: `// =============================================================
// 第 26 章示例：模拟类装饰器、方法装饰器、属性装饰器、参数装饰器
// 沙箱限制：装饰器是语法糖，本质是函数调用，可以手写等价代码模拟
// =============================================================

// ---- 类装饰器 ----
// 真实代码：function Logged(target: Function) { ... } @Logged class A {}
function Logged(target) {
  target.__logged = true;                    // 给类挂一个标记
  console.log('[类装饰器] 装饰类:', target.name);
  return target;
}

// ---- 方法装饰器：包装方法实现日志 ----
function LogMethod(target, key, descriptor) {
  const original = descriptor.value;         // 保存原方法
  descriptor.value = function () {
    const args = Array.prototype.slice.call(arguments);
    console.log('[方法装饰器] 调用', key, '参数:', args);
    const result = original.apply(this, args);
    console.log('[方法装饰器]', key, '返回:', result);
    return result;
  };
  return descriptor;
}

// ---- 属性装饰器：记录属性名 ----
function Column(name) {
  return function (target, key) {
    target.constructor.__columns = target.constructor.__columns || {};
    target.constructor.__columns[key] = name;  // 把属性名映射到列名
  };
}

// ---- 参数装饰器：记录参数位置 ----
function Param(name) {
  return function (target, key, index) {
    target.constructor.__params = target.constructor.__params || {};
    target.constructor.__params[key] = target.constructor.__params[key] || {};
    target.constructor.__params[key][index] = name;
  };
}

// ---- 模拟 @Logged @Column @LogMethod @Param 的等价代码 ----
// 真实代码：
//   @Logged
//   class User {
//     @Column('user_name') name: string;
//     @LogMethod greet(@Param('who') who: string) { return 'hi ' + who; }
//   }
class User {
  constructor() {
    this.name = 'Tom';
  }
  greet(who) { return 'hi ' + who; }
}

// 手动应用装饰器（等价于 @Logged class User {}）
Logged(User);

// 手动应用属性装饰器（等价于 @Column('user_name') name）
Column('user_name')(User.prototype, 'name');

// 手动应用方法装饰器（等价于 @LogMethod greet）
const greetDesc = Object.getOwnPropertyDescriptor(User.prototype, 'greet');
LogMethod(User.prototype, 'greet', greetDesc);
Object.defineProperty(User.prototype, 'greet', greetDesc);

// 手动应用参数装饰器（等价于 @Param('who')）
Param('who')(User.prototype, 'greet', 0);

// ---- 调用被装饰的方法 ----
console.log('\\n=== 调用被装饰的方法 ===');
const u = new User();
u.greet('Jerry');

// ---- 查看装饰器存的元数据 ----
console.log('\\n=== 装饰器存的元数据 ===');
console.log('User.__logged   =', User.__logged);
console.log('User.__columns  =', User.__columns);
console.log('User.__params   =', User.__params);

// ---- 演示装饰器工厂（带参数） ----
console.log('\\n=== 装饰器工厂 ===');

function Controller(prefix) {                // 工厂：返回真正的装饰器
  return function (target) {
    target.__prefix = prefix;
    console.log('[Controller] 前缀:', prefix, '类:', target.name);
  };
}

function Get(path) {                          // 工厂：方法装饰器
  return function (target, key, desc) {
    target.constructor.__routes = target.constructor.__routes || {};
    target.constructor.__routes[key] = path;
  };
}

// 模拟 Nest.js 风格
class UserController {
  list() { return ['u1', 'u2']; }
  one(id) { return { id: id }; }
}
Controller('/users')(UserController);
Get('/')(UserController.prototype, 'list', Object.getOwnPropertyDescriptor(UserController.prototype, 'list'));
Get('/:id')(UserController.prototype, 'one', Object.getOwnPropertyDescriptor(UserController.prototype, 'one'));

console.log('UserController.__prefix =', UserController.__prefix);
console.log('UserController.__routes =', UserController.__routes);

// ---- 演示多个装饰器的执行顺序 ----
console.log('\\n=== 多个装饰器执行顺序 ===');

function trace(name) {
  return function () {
    console.log('  trace:', name);
  };
}

// 真实代码：
//   @trace('A') @trace('B') @trace('C') class X {}
// 等价于 A(B(C(X)))，执行顺序：C → B → A
class X {}
trace('C')(X); trace('B')(X); trace('A')(X);
console.log('口诀：多个装饰器从下到上、从右到左（洋葱模型）');

// ---- 关键要点总结 ----
console.log('\\n=== 装饰器核心要点 ===');
console.log('1. 装饰器本质是高阶函数：接收目标，返回增强后的目标');
console.log('2. 四种类型：类 / 方法 / 属性 / 参数');
console.log('3. 装饰器工厂：外层接参数，返回真正的装饰器');
console.log('4. reflect-metadata + emitDecoratorMetadata 实现元数据存储');
console.log('5. Nest.js / TypeORM / class-validator 强依赖装饰器');
console.log('6. TS 5.0+ 支持 Stage 3 装饰器（标准），但生态以 Stage 2 为主');
console.log('7. tsconfig: experimentalDecorators + emitDecoratorMetadata 必开');
`,
  },
];
