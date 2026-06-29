// =============================================================
// 前端工程化教程 - 第 1 批章节（基础概念篇 5 章）
// -------------------------------------------------------------
// 覆盖前端工程化的核心概念：什么是工程化、模块化体系、包管理、
// 目录结构规范、开发环境配置。是后续构建、质量、现代化章节的基础。
// =============================================================

export const chapters = [
  {
    id: "fe-eng-overview",
    group: "基础概念",
    icon: "🏗️",
    title: "前端工程化总览：从手写到自动化",
    content: `

# 前端工程化总览：从手写到自动化

## 一、为什么需要前端工程化

### 1.1 前端的演化简史

前端开发经历了从「写页面」到「做工程」的根本转变：

| 阶段 | 时期 | 典型特征 | 痛点 |
|------|------|----------|------|
| 刀耕火种 | 2005 前 | HTML+CSS+零散 JS，内联在页面 | 代码无组织，无法复用 |
| jQuery 时代 | 2006-2013 | jQuery 插件满天飞，前端开始膨胀 | 全局变量污染、依赖混乱 |
| 模块化时代 | 2013-2016 | RequireJS/SeaJS、CommonJS 出现 | 构建工具缺失、浏览器不认模块 |
| 工程化时代 | 2016-2020 | Webpack 一统天下，框架 CLI 普及 | 配置复杂、上手成本高 |
| 现代工程化 | 2020 至今 | Vite/esbuild/SWC，零配置 + 极速 | 工具链碎片化、选择困难 |

### 1.2 工程化要解决的核心问题

前端工程化的本质是把「写代码」变成「可持续交付的软件产品」。它要解决五个核心问题：

1. **模块化** —— 把巨石代码拆成可维护、可复用的小块
2. **构建** —— 把开发态的源码转换成浏览器能运行的产物
3. **质量** —— 用规范、类型、测试保证代码质量
4. **协作** —— 让多人协作有统一的代码风格与流程
5. **部署** —— 让代码从仓库到线上是自动、可重复的

### 1.3 没有工程化的世界

想象一个没有工程化的项目会怎样：

\`\`\`html
<!-- index.html -->
<script src="https://cdn.com/jquery.js"></script>
<script src="https://cdn.com/lodash.js"></script>
<script src="https://cdn.com/moment.js"></script>
<script src="js/utils.js"></script>
<script src="js/auth.js"></script>
<script src="js/cart.js"></script>
<script src="js/main.js"></script>
\`\`\`

问题清单：

- **加载顺序硬编码**：依赖顺序错了就报错
- **全局污染**：每个文件都往 \`window\` 上挂变量
- **无法用 npm 包**：只能引 CDN，版本不可控
- **没有压缩**：上线体积大，加载慢
- **无法写 ES2024**：浏览器只认老语法
- **没有类型检查**：运行时才暴露 bug

工程化就是系统性地解决这些问题。

---

## 二、前端工程化的技术全景

### 2.1 工程化的四大支柱

\`\`\`
┌──────────────────────────────────────────────────┐
│                 前端工程化技术栈                    │
├──────────┬──────────┬──────────┬─────────────────┤
│  模块化   │  构建打包  │  代码质量  │  持续交付        │
├──────────┼──────────┼──────────┼─────────────────┤
│ ES Module│ Webpack  │ ESLint   │ GitHub Actions  │
│ CommonJS │ Vite     │ Prettier │ GitLab CI       │
│ 动态import│ Rollup   │ TypeScript│ Jenkins        │
│ CSS Module│ esbuild  │ Jest     │ Docker         │
│ Sass/Less│ SWC      │ Vitest   │ Vercel         │
└──────────┴──────────┴──────────┴─────────────────┘
\`\`\`

### 2.2 一个现代前端项目的典型结构

\`\`\`bash
my-app/
├── public/              # 静态资源（不经过构建处理）
├── src/
│   ├── assets/         # 会被构建处理的资源（图片、字体）
│   ├── components/     # 通用组件
│   ├── pages/          # 页面组件
│   ├── hooks/          # 自定义 React Hooks
│   ├── utils/          # 工具函数
│   ├── services/       # API 请求封装
│   ├── styles/         # 全局样式
│   ├── App.tsx
│   └── main.tsx        # 入口
├── tests/              # 测试文件
├── .eslintrc           # ESLint 配置
├── .prettierrc         # Prettier 配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # 构建工具配置
├── package.json
└── pnpm-lock.yaml
\`\`\`

### 2.3 工程化的衡量指标

判断一个项目工程化做得好不好，看这几个指标：

| 指标 | 优秀 | 合格 | 不合格 |
|------|------|------|--------|
| 冷启动时间 | < 1s | < 5s | > 10s |
| 热更新（HMR） | < 100ms | < 500ms | > 1s |
| 生产构建时间 | < 10s | < 60s | > 3min |
| 类型覆盖率 | > 90% | > 70% | < 50% |
| 单元测试覆盖率 | > 80% | > 50% | 0% |
| 首屏产物体积 | < 150KB | < 300KB | > 500KB |

---

## 三、工程化的发展趋势

### 3.1 从 Webpack 到 Vite 的范式转移

**Webpack 时代**：基于 bundle 的构建。开发时也要先把所有模块打包成 bundle，项目越大启动越慢。

**Vite 时代**：基于 ESM 的按需加载。开发时利用浏览器原生 ES Module，请求哪个模块才编译哪个，启动几乎是即时的。

\`\`\`js
// Vite 开发模式：浏览器直接请求源文件，Vite 按需编译
// 浏览器请求 /src/main.ts → Vite 实时编译 → 返回编译后的 JS

// Vite 生产模式：用 Rollup 打包成优化后的产物
import { build } from 'vite';
await build({ root: './' });
\`\`\`

### 3.2 用原生语言重写工具链

JavaScript 写的构建工具越来越慢，新一代工具纷纷用 Rust/Go 重写：

| 工具 | 语言 | 用途 | 相对速度 |
|------|------|------|----------|
| esbuild | Go | 打包/压缩 | Webpack 的 100 倍 |
| SWC | Rust | 代码转译（替代 Babel）| Babel 的 20 倍 |
| Rspack | Rust | Webpack 兼容的打包器 | Webpack 的 10 倍 |
| Turbopack | Rust | Next.js 的新打包器 | Webpack 的 10 倍 |
| Oxc | Rust | Lint/解析/压缩全家桶 | ESLint 的 50-100 倍 |

### 3.3 零配置与约定优于配置

现代工具越来越倾向于「开箱即用」：

- **Vite** 默认配置就能跑 React/Vue
- **Next.js** 默认配置就能做 SSR
- **Create React App** 隐藏所有 Webpack 配置
- **Astro** 默认支持各种框架混用

代价是定制能力受限，但换来了极低的上手成本。

---

## 四、本教程的学习路径

本教程共 15 章，按由浅入深、由概念到实战的顺序组织：

| 篇章 | 章节 | 重点 |
|------|------|------|
| 基础概念（1-5）| 工程化总览、模块化、包管理、目录规范、开发环境 | 打地基 |
| 构建与打包（6-10）| Webpack、Vite、Babel、CSS 工程化、性能优化 | 核心能力 |
| 质量与现代化（11-15）| ESLint、TypeScript、测试、CI/CD、Monorepo | 进阶实战 |

每章都配有可运行/可参考的代码示例。建议按顺序学习，遇到工具实操章节可以配合项目实战。

---

## 五、小结

前端工程化不是某个具体技术，而是一种**用工程思维解决前端开发问题**的方法论。它的核心目标是：

1. **提升开发效率** —— 自动化重复劳动
2. **保证代码质量** —— 用工具代替人肉检查
3. **改善协作体验** —— 统一规范、流程
4. **优化用户体验** —— 压缩、按需加载、性能监控
5. **降低维护成本** —— 类型、测试、文档

后续章节将逐一展开这些主题。下一章我们深入模块化——这是所有工程化的基石。
`,
  },
  {
    id: "fe-eng-module",
    group: "基础概念",
    icon: "📦",
    title: "模块化体系：CommonJS、ESM 与动态导入",
    content: `

# 模块化体系：CommonJS、ESM 与动态导入

## 一、为什么需要模块化

### 1.1 没有模块化的世界

在模块化出现之前，JavaScript 没有原生的方式拆分代码。开发者只能用 \`<script>\` 标签和全局变量：

\`\`\`js
// utils.js
var utils = {
  formatDate: function (d) { /* ... */ }
};

// main.js
utils.formatDate(new Date()); // 依赖 utils 全局变量
\`\`\`

这种方式的致命问题：

1. **全局污染**：所有变量都挂在 \`window\` 上，容易冲突
2. **依赖顺序**：必须人工保证加载顺序，错了就崩
3. **无法复用**：难以把代码发布到 npm 共享
4. **无法按需加载**：要么全引，要么不引

### 1.2 模块化的核心价值

模块化解决三件事：

- **作用域隔离**：每个模块有自己的私有作用域，不污染全局
- **显式依赖**：通过 \`import\`/\`require\` 声明依赖，工具自动分析
- **复用与分发**：模块可以独立发布、独立测试、独立版本管理

---

## 二、CommonJS：Node.js 的模块规范

### 2.1 基本用法

CommonJS 是 Node.js 的默认模块规范，使用 \`require\` 导入、\`module.exports\` 导出：

\`\`\`js
// math.js —— 定义模块
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// 导出（两种写法等价）
module.exports = { add, multiply };
// 或
// exports.add = add;
// exports.multiply = multiply;
\`\`\`

\`\`\`js
// main.js —— 使用模块
const { add, multiply } = require('./math');

console.log(add(2, 3));        // 5
console.log(multiply(2, 3));   // 6
\`\`\`

### 2.2 CommonJS 的关键特性

**1. 同步加载**：\`require\` 会立即读取并执行模块，得到导出值。

\`\`\`js
const fs = require('fs'); // 同步读文件
\`\`\`

**2. 值的拷贝**：导出的是值的副本，不是引用。修改不影响原始值。

\`\`\`js
// counter.js
let count = 0;
module.exports = {
  count,
  increment() { count++; }
};

// main.js
const { count, increment } = require('./counter');
console.log(count);  // 0
increment();
console.log(count);  // 仍是 0！（导出的是 0 的副本）
\`\`\`

**3. 缓存机制**：同一个模块无论 require 多少次，只执行一次。

\`\`\`js
// single.js
console.log('模块执行了一次');
module.exports = {};

// main.js
require('./single'); // 打印 "模块执行了一次"
require('./single'); // 不打印（命中缓存）
require('./single'); // 不打印
\`\`\`

可以利用缓存实现单例模式：

\`\`\`js
// db.js —— 利用 CommonJS 缓存实现单例
class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    Database.instance = this;
    this.connection = connect();
  }
}
module.exports = new Database(); // 永远返回同一个实例
\`\`\`

### 2.3 CommonJS 的局限

- **不能直接用于浏览器**：浏览器没有 \`require\` 和文件系统
- **同步加载不适合异步场景**：阻塞后续代码
- **静态分析困难**：\`require\` 可以是动态字符串，构建工具难以做 tree-shaking

---

## 三、ES Modules：JavaScript 的官方模块标准

### 3.1 基本语法

ES Modules（ESM）是 ES6 引入的标准，使用 \`import\`/\`export\`：

\`\`\`js
// math.js —— 导出
export function add(a, b) {
  return a + b;
}

export const PI = 3.14159;

// 默认导出（每个模块只能有一个）
export default function multiply(a, b) {
  return a * b;
}
\`\`\`

\`\`\`js
// main.js —— 导入
import multiply, { add, PI } from './math.js';

console.log(add(2, 3));     // 5
console.log(multiply(2, 3)); // 6
console.log(PI);             // 3.14159
\`\`\`

### 3.2 ESM 与 CommonJS 的本质区别

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| 加载方式 | 同步、运行时 | 异步、编译时（静态）|
| 导出值 | 值的拷贝 | 值的引用（live binding）|
| 是否可静态分析 | 否（动态 require）| 是（import 必须在顶层）|
| Tree-shaking | 不支持 | 支持 |
| 顶层 this | module 对象 | undefined |
| 循环引用 | 返回已执行部分 | 通过引用避免死循环 |
| 浏览器原生支持 | 否 | 是（\`<script type="module">\`）|

### 3.3 值的引用（Live Binding）

这是 ESM 最重要的特性之一：

\`\`\`js
// counter.js
export let count = 0;
export function increment() {
  count++;
}
\`\`\`

\`\`\`js
// main.js
import { count, increment } from './counter.js';

console.log(count); // 0
increment();
console.log(count); // 1！（ESM 是引用，会同步更新）
\`\`\`

为什么 ESM 能做到？因为 \`import\` 建立的是模块作用域的「实时绑定」，不是值的快照。这让循环依赖也能安全工作。

### 3.4 静态分析的能力

ESM 的 \`import\` 必须在顶层、必须是字符串字面量，这让构建工具能在**不执行代码**的情况下分析依赖关系：

\`\`\`js
// 这些是合法的，构建工具能静态分析
import fs from 'fs';
import { add } from './math';

// 这些是非法的，会报错
if (condition) {
  import x from './a'; // SyntaxError: import must be top-level
}
const mod = './' + name;
import y from mod;     // SyntaxError: import must be static string
\`\`\`

静态分析带来的能力：

- **Tree-shaking**：删除没用到的导出
- **预打包分析**：构建前知道所有依赖
- **类型检查**：TypeScript 依赖静态导入做类型推断
- **摇树优化**：打包体积大幅缩小

---

## 四、动态导入：按需加载

### 4.1 静态导入的局限

\`\`\`js
import _ from 'lodash'; // 一开始就加载，即使不用
\`\`\`

对于大依赖（图表库、编辑器、视频播放器），希望「用到时才加载」。

### 4.2 动态 import() 语法

\`import()\` 是一个返回 Promise 的函数，可以出现在任何位置：

\`\`\`js
// 点击按钮时才加载图表库
button.addEventListener('click', async () => {
  const { Chart } = await import('chart.js'); // 动态加载
  new Chart(canvas, { /* ... */ });
});
\`\`\`

\`\`\`js
// 按条件加载
async function getParser(type) {
  if (type === 'json') {
    return await import('./json-parser.js');
  } else {
    return await import('./yaml-parser.js');
  }
}
\`\`\`

### 4.3 与 React 懒加载结合

React 18+ 的 \`lazy\` 基于 \`import()\` 实现组件级按需加载：

\`\`\`jsx
import { lazy, Suspense } from 'react';

// 只有访问 /dashboard 路由时才加载 Dashboard 代码
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Dashboard />
    </Suspense>
  );
}
\`\`\`

构建工具会把 \`import()\` 的参数路径自动拆成单独的 chunk（独立文件），用户访问时才请求。

### 4.4 动态导入与魔法注释

Webpack/Vite 支持用注释给动态 chunk 命名、分组：

\`\`\`js
// 给 chunk 命名
const mod = await import(
  /* webpackChunkName: "dashboard" */
  './Dashboard'
);

// 把多个模块打包到一个 chunk
const mod = await import(
  /* webpackChunkName: "charts" */
  /* webpackMode: "lazy-once" */
  './ChartLibrary'
);

// 预加载（浏览器空闲时提前拉取）
const mod = await import(
  /* webpackPrefetch: true */
  './NextPage'
);
\`\`\`

---

## 五、模块化的实际工程建议

### 5.1 新项目应该选 ESM

- 浏览器原生支持 \`<script type="module">\`
- 主流构建工具（Vite、Webpack 5、Rollup）默认 ESM
- 支持 tree-shaking，产物更小
- TypeScript、ESLint 都基于 ESM 静态分析

### 5.2 在 Node.js 中使用 ESM

Node.js 12+ 支持 ESM，有两种方式：

**方式一：\`.mjs\` 后缀**

\`\`\`js
// math.mjs
export const add = (a, b) => a + b;
\`\`\`

**方式二：\`package.json\` 声明 \`"type": "module"\`**

\`\`\`json
{
  "name": "my-pkg",
  "type": "module",
  "main": "./index.js"
}
\`\`\`

\`\`\`js
// index.js —— 即使是 .js 后缀，也会被当作 ESM
import fs from 'fs';
\`\`\`

### 5.3 ESM 与 CommonJS 互操作

在 ESM 中导入 CommonJS：

\`\`\`js
// ESM 导入 CommonJS（默认导出）
import lodash from 'lodash'; // 等价于 require('lodash')

// ESM 导入 CommonJS 的命名导出（用 named import 可能失败）
import { debounce } from 'lodash'; // 在某些版本下可能拿不到
\`\`\`

在 CommonJS 中导入 ESM（只能用动态 import）：

\`\`\`js
// CommonJS 不能用静态 import ESM
// const x = require('./a.mjs'); // ❌ 不允许

// 必须用动态 import()
async function main() {
  const { add } = await import('./a.mjs');
}
\`\`\`

### 5.4 包的「双模式」发布

让一个 npm 包同时支持 CommonJS 和 ESM：

\`\`\`json
{
  "name": "my-lib",
  "main": "./dist/index.cjs",       // CommonJS 入口
  "module": "./dist/index.mjs",     // ESM 入口（构建工具用）
  "exports": {
    "import": "./dist/index.mjs",   // import 时用
    "require": "./dist/index.cjs"   // require 时用
  }
}
\`\`\`

\`exports\` 字段是 Node.js 12+ 的新规范，能精确控制不同环境拿到哪个文件。

---

## 六、小结

| 规范 | 适用场景 | 是否推荐新项目 |
|------|----------|----------------|
| CommonJS | Node.js 服务端、老项目 | 维持现状，不推荐新项目 |
| ES Modules | 浏览器、现代 Node、所有新项目 | ✅ 强烈推荐 |
| AMD | 已淘汰（RequireJS）| ❌ 不用 |
| UMD | 兼容老环境的库 | 仅库作者考虑 |

掌握模块化是理解后续构建工具的前提：Webpack、Vite 的核心工作就是把 ESM 模块图打包成浏览器能用的产物。下一章我们看包管理——模块的「分发与依赖管理」。
`,
  },
  {
    id: "fe-eng-pkg",
    group: "基础概念",
    icon: "📚",
    title: "包管理：npm、yarn 与 pnpm 的演进",
    content: `

# 包管理：npm、yarn 与 pnpm 的演进

## 一、包管理器解决什么问题

### 1.1 没有包管理器之前

早期前端开发者要么自己手写所有功能，要么从 CDN 下载 JS 文件丢进项目。问题：

- 版本升级麻烦（要手动替换文件）
- 依赖之间互相依赖无法管理
- 没有锁定版本，今天能跑明天可能就崩

### 1.2 包管理器的核心职责

一个完整的包管理器要做四件事：

1. **包仓库**：集中存放所有包（npm registry）
2. **依赖解析**：根据 \`package.json\` 自动安装所有依赖
3. **版本管理**：用 semver 语义化版本，锁定文件保证一致性
4. **脚本执行**：\`npm run\` 执行定义在 \`package.json\` 里的脚本

---

## 二、npm：最早的包管理器

### 2.1 基本工作流

\`\`\`bash
# 初始化项目
npm init -y

# 安装依赖
npm install lodash           # 安装到 dependencies
npm install -D vitest        # 安装到 devDependencies（开发依赖）
npm install -g typescript    # 全局安装

# 卸载
npm uninstall lodash

# 运行脚本
npm run dev
npm run build
\`\`\`

### 2.2 package.json 关键字段

\`\`\`json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.50.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
\`\`\`

### 2.3 语义化版本（SemVer）

npm 的版本号遵循 \`主版本.次版本.修订号\`（Major.Minor.Patch）：

- **Major**：不兼容的 API 变更（breaking change）
- **Minor**：向后兼容的新功能
- **Patch**：向后兼容的 bug 修复

版本范围符号：

\`\`\`
^1.2.3   →  >=1.2.3 <2.0.0   允许 minor 和 patch 升级（最常用）
~1.2.3   →  >=1.2.3 <1.3.0   只允许 patch 升级
1.2.3    →  精确版本
>=1.2.3  →  大于等于
* 或 x   →  任意版本
1.x      →  >=1.0.0 <2.0.0
\`\`\`

\`^\` 是默认符号，\`npm install lodash\` 等价于 \`npm install lodash@^\`。

### 2.4 锁文件 package-lock.json

\`package.json\` 只声明版本范围，\`package-lock.json\` 锁定实际安装的精确版本：

\`\`\`json
{
  "node_modules/lodash": {
    "version": "4.17.21",  // 实际安装的版本
    "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
    "integrity": "sha512-..."
  }
}
\`\`\`

**为什么需要锁文件**：\`^1.2.3\` 允许安装 \`1.2.3\` 到 \`1.99.99\`。如果今天 \`1.2.4\` 发布了，团队成员安装时可能拿到不同版本，导致「我这能跑，你那报错」。锁文件保证所有人安装一致的版本。

### 2.5 npm 的痛点：node_modules 嵌套地狱

npm v2 的依赖结构是嵌套的，导致「依赖地狱」：

\`\`\`
node_modules/
└── A/
    └── node_modules/
        └── C@1.0/      ← A 依赖 C@1.0
└── B/
    └── node_modules/
        └── C@2.0/      ← B 依赖 C@2.0
\`\`\`

一个项目可能有几百兆的 \`node_modules\`，大量重复的包。npm v3+ 改成扁平化，但仍有问题（见 pnpm 部分）。

---

## 三、yarn：解决 npm 早期痛点

### 3.1 yarn 的核心改进

2016 年 Facebook 发布 yarn，主要解决 npm 当时的几个痛点：

1. **速度**：并行下载，比 npm v3 快很多
2. **yarn.lock**：自动生成锁文件（npm 后来才加 package-lock）
3. **离线缓存**：装过的包缓存起来，断网也能装
4. **工作区**：原生支持 monorepo（yarn workspaces）

### 3.2 yarn 的工作区

\`\`\`json
// monorepo 根 package.json
{
  "private": true,
  "workspaces": ["packages/*"]
}
\`\`\`

\`\`\`bash
# 在根目录执行一次，所有子包的依赖都装好
yarn install

# 在特定子包运行脚本
yarn workspace @my/app run build
\`\`\`

---

## 四、pnpm：现代包管理器的最优解

### 4.1 pnpm 的核心创新：硬链接 + 内容寻址

pnpm 最大的特点是**不用复制文件**，而是用硬链接指向全局存储：

\`\`\`
# npm/yarn 的方式：每个项目都复制一份
~/proj1/node_modules/lodash/   ← 完整拷贝（4MB）
~/proj2/node_modules/lodash/   ← 完整拷贝（4MB）重复！

# pnpm 的方式：硬链接到全局存储
~/proj1/node_modules/lodash/   ← 硬链接（0 字节，指向全局）
~/proj2/node_modules/lodash/   ← 硬链接（0 字节，指向全局）
~/.pnpm-store/v3/lodash/4.17.21/  ← 全局唯一存储
\`\`\`

实测效果：10 个项目都用 lodash，npm 占 40MB，pnpm 只占 4MB。

### 4.2 pnpm 的非扁平 node_modules

npm/yarn 的扁平结构有个隐患：项目可以 import 没在 \`package.json\` 里声明的包（幽灵依赖）。

\`\`\`bash
# 项目只声明了 express
# 但 express 依赖了 body-parser
# 扁平结构下，body-parser 也出现在 node_modules 顶层
\`\`\`

\`\`\`js
// 项目代码可以「免费」用 body-parser，但它没在 package.json 里
import bodyParser from 'body-parser'; // 能跑，但很危险
\`\`\`

如果哪天 express 升级去掉了 body-parser 依赖，项目代码就崩了。

**pnpm 的解决方案**：用符号链接构建严格的结构：

\`\`\`
node_modules/
├── .pnpm/                     ← 真实的包，按 @scope/name@version 命名
│   ├── express@4.18.0/
│   │   └── node_modules/
│   │       ├── express/       ← 真实文件
│   │       └── body-parser/   ← express 才能访问
│   └── body-parser@1.20.0/
│       └── node_modules/
│           └── body-parser/
├── express -> .pnpm/express@4.18.0/node_modules/express  ← 软链接
└── (没有 body-parser，无法 import 它！)
\`\`\`

只有 \`package.json\` 里声明的包才会出现在 \`node_modules\` 顶层，彻底消灭幽灵依赖。

### 4.3 pnpm 的常用命令

\`\`\`bash
# 安装 pnpm
npm install -g pnpm

# 基本用法与 npm 兼容
pnpm install              # 安装所有依赖
pnpm add lodash           # 加依赖
pnpm add -D vite          # 加开发依赖
pnpm remove lodash        # 卸载
pnpm run dev              # 运行脚本

# Monorepo（workspace）
pnpm -r add lodash        # 给所有子包加依赖
pnpm --filter @my/app add react  # 给特定子包加依赖
pnpm -r run build         # 所有子包并行执行 build
\`\`\`

### 4.4 三者对比

| 特性 | npm | yarn (classic) | pnpm |
|------|-----|----------------|------|
| 安装速度 | 慢 | 较快 | 最快 |
| 磁盘占用 | 高 | 高 | 极低（硬链接）|
| 幽灵依赖 | 有 | 有 | 无 |
| Monorepo | workspaces | workspaces | workspace（最强）|
| 锁文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |
| 并行安装 | 部分 | 是 | 是 |
| 即插即用 | 否 | 否（PnP 实验性）| 是 |

**推荐选择**：新项目优先 pnpm；老项目维持现状，不必为迁移付代价。

---

## 五、npx 与 pnpm dlx：执行一次性命令

有时只想运行某个包提供的命令，不想把它装成项目依赖：

\`\`\`bash
# 创建一个 React 项目，但不想全局装 create-react-app
npx create-react-app my-app

# pnpm 等价命令
pnpm dlx create-react-app my-app

# 运行 cowsay 一次（不会污染全局）
npx cowsay "Hello"
\`\`\`

\`npx\` 会临时下载包到缓存，执行完不留痕迹。npm 5.2+ 自带，无需单独安装。

---

## 六、私有 npm registry

企业内部开发的包不想公开发到 npm，可以搭建私有 registry：

\`\`\`bash
# 用 Verdaccio（开源）一行命令起一个私有 registry
npm install -g verdaccio
verdaccio  # 启动在 http://localhost:4873

# 切换 registry
npm config set registry http://localhost:4873/

# 或在项目内用 .npmrc 配置
echo "registry=http://localhost:4873/" > .npmrc

# 登录并发布
npm login
npm publish
\`\`\`

.npmrc 还能按 scope 区分 registry：

\`\`\`ini
# 默认走 npm 官方
registry=https://registry.npmjs.org/
# @mycompany scope 走私有
@mycompany:registry=http://npm.internal.company.com/
\`\`\`

---

## 七、依赖安全审计

### 7.1 npm audit

\`\`\`bash
# 检查依赖中的已知漏洞
npm audit

# 自动修复能修的漏洞
npm audit fix

# 强制升级（可能 breaking）
npm audit fix --force
\`\`\`

### 7.2 pnpm audit

\`\`\`bash
pnpm audit
\`\`\`

### 7.3 推荐实践

- CI 流程里加 \`npm audit\` 或专门的 Snyk/Socket 检查
- 定期升级依赖：\`pnpm update -L\`（含 major）
- 关注锁文件 diff，PR 里 review 依赖变更

---

## 八、小结

包管理是工程化的基础设施。记住几个关键点：

1. **新项目用 pnpm**，省磁盘、防幽灵依赖、monorepo 友好
2. **必须提交锁文件**，保证团队安装一致
3. **理解 semver**：\`^\` 允许 minor 升级，\`~\` 只允许 patch
4. **devDependencies vs dependencies**：构建工具、测试框架放 dev，运行时需要的放 deps
5. **私有包用 registry + scope**，企业内部包不外泄

下一章我们看项目目录结构——这是工程化「约定优于配置」的起点。
`,
  },
  {
    id: "fe-eng-structure",
    group: "基础概念",
    icon: "📁",
    title: "项目目录结构与命名规范",
    content: `

# 项目目录结构与命名规范

## 一、为什么目录结构很重要

### 1.1 一个混乱的项目长什么样

\`\`\`bash
my-project/
├── 1.js
├── 处理用户.js
├── test-final.js
├── test-final-2.js
├── api.js
├── api-backup.js
├── utils.js
├── utils-new.js
├── README.md
└── index.html
\`\`\`

问题：

- 文件名中英文混用、带数字
- 没有分层，所有文件堆在根目录
- 备份文件散落各处
- 新人进来不知道从哪开始看

### 1.2 好的目录结构应该满足

1. **可预测**：看到功能名就能猜到代码在哪
2. **可扩展**：加新功能不用重构现有结构
3. **低耦合**：相关文件聚在一起，无关的分开
4. **有约定**：命名风格统一，避免 \`utils2\`、\`utils_v3\`

---

## 二、按「类型」分 vs 按「功能」分

### 2.1 按类型分（type-first）

把同类文件放一起：

\`\`\`bash
src/
├── components/      # 所有组件
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── UserList.jsx
│   └── UserProfile.jsx
├── hooks/           # 所有 hooks
├── utils/           # 所有工具函数
├── pages/           # 所有页面
│   ├── Home.jsx
│   ├── User.jsx
│   └── Settings.jsx
└── services/        # 所有 API
\`\`\`

**优点**：结构简单，新人易理解。
**缺点**：单个功能的代码散落在多个目录（UserList 组件、useUser hook、userApi 在 services），改一个功能要跳多个目录。

适合：**小型项目、组件库**。

### 2.2 按功能分（feature-first）

按业务功能聚合所有相关文件：

\`\`\`bash
src/
├── features/
│   ├── user/                # 用户功能模块
│   │   ├── components/      # 用户相关组件
│   │   │   ├── UserList.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── hooks/
│   │   │   └── useUser.js
│   │   ├── services/
│   │   │   └── userApi.js
│   │   ├── utils.js
│   │   └── index.js         # 模块入口，对外暴露
│   ├── cart/                # 购物车功能
│   │   └── ...
│   └── order/               # 订单功能
│       └── ...
├── components/              # 跨功能的通用组件
│   ├── Button.jsx
│   └── Card.jsx
└── App.jsx
\`\`\`

**优点**：高内聚，删一个功能只删一个目录；可独立测试、复用。
**缺点**：层级深，通用 vs 专用的边界需要团队约定。

适合：**中大型项目、长期维护的产品**。

### 2.3 实践建议

- **小型项目**（< 20 个组件）：type-first 足够
- **中大型项目**：feature-first，再加一个 \`shared/\` 放跨功能复用的代码
- **组件库**：按组件类型分（inputs/、layouts/、feedback/）

---

## 三、推荐的现代项目结构

### 3.1 React 项目（feature-first）

\`\`\`bash
my-app/
├── public/                  # 静态资源，原样拷贝
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── app/                # 应用级配置（路由、store、provider）
│   │   ├── router.jsx
│   │   ├── store.js
│   │   └── providers.jsx
│   ├── features/           # 按功能模块组织
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── authSlice.js
│   │   │   └── index.js
│   │   └── dashboard/
│   ├── components/         # 通用组件（跨功能复用）
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   └── index.js
│   │   └── Modal/
│   ├── hooks/              # 通用 hooks
│   ├── layouts/            # 布局组件
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── lib/                # 第三方库的封装
│   │   ├── axios.js        # axios 实例配置
│   │   └── i18n.js
│   ├── routes/             # 路由定义（如用 React Router）
│   ├── styles/             # 全局样式
│   │   ├── globals.css
│   │   └── variables.css
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── App.jsx
│   └── main.jsx            # 入口
├── tests/                  # 测试（也可放各 feature 内 __tests__）
├── .env                    # 环境变量
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
\`\`\`

### 3.2 组件的「就近原则」

每个组件相关文件放一起，方便查找和迁移：

\`\`\`bash
components/
└── UserCard/
    ├── UserCard.jsx           # 组件实现
    ├── UserCard.module.css    # 组件样式（CSS Modules）
    ├── UserCard.test.jsx      # 组件测试
    ├── UserCard.stories.jsx   # Storybook 文档
    └── index.js               # 入口，export { default } from './UserCard'
\`\`\`

引用时简洁：

\`\`\`js
import UserCard from '@/components/UserCard'; // 不用写文件名
\`\`\`

### 3.3 路径别名

用 \`@\` 指向 \`src/\`，避免出现 \`../../../utils\` 这种相对路径地狱：

\`\`\`js
// 没有别名
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/Button';

// 有别名
import { formatDate } from '@/utils/date';
import { Button } from '@/components/Button';
\`\`\`

配置（Vite + jsconfig）：

\`\`\`json
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
\`\`\`

\`\`\`js
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
\`\`\`

---

## 四、命名规范

### 4.1 文件命名

| 类型 | 命名风格 | 示例 |
|------|----------|------|
| 组件文件 | PascalCase | \`UserProfile.jsx\` |
| 普通模块 | camelCase | \`dateUtils.js\` |
| 类型定义 | camelCase 或 PascalCase.type | \`user.ts\` / \`User.ts\` |
| 常量文件 | camelCase | \`apiEndpoints.js\` |
| 测试文件 | 同名 + \`.test\` | \`dateUtils.test.js\` |
| 配置文件 | 小写 + 点分 | \`.eslintrc.cjs\`、\`vite.config.ts\` |
| 样式文件 | 同名 + \`.module\` | \`Button.module.css\` |

**重要原则**：一个项目内只选一种风格并坚持，不要混用。

### 4.2 React 组件命名

- **组件名**：PascalCase，且文件名与组件名一致
- **props 类型**：以 \`Props\` 结尾，如 \`ButtonProps\`
- **hook**：以 \`use\` 开头，如 \`useUser\`、\`useDebounce\`

\`\`\`jsx
// Button.jsx —— 文件名 = 组件名
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
\`\`\`

### 4.3 变量与函数命名

| 概念 | 风格 | 示例 |
|------|------|------|
| 变量、函数 | camelCase | \`userName\`、\`fetchUser\` |
| 常量 | UPPER_SNAKE | \`MAX_RETRY\`、\`API_BASE_URL\` |
| 类 | PascalCase | \`class User {}\` |
| 私有成员 | 前缀下划线 | \`_internalCache\` |
| 布尔值 | is/has/should 开头 | \`isLoading\`、\`hasError\` |
| 事件处理 | on/handle 前缀 | \`onClick\`、\`handleSubmit\` |

### 4.4 CSS 类命名

**BEM 规范**（Block Element Modifier）：

\`\`\`css
/* Block: 独立块 */
.card { }

/* Element: 块内元素，用 __ 连接 */
.card__title { }
.card__body { }

/* Modifier: 修饰状态，用 -- 连接 */
.card--highlighted { }
.card__title--large { }
\`\`\`

\`\`\`html
<div class="card card--highlighted">
  <h2 class="card__title card__title--large">标题</h2>
  <div class="card__body">内容</div>
</div>
\`\`\`

CSS Modules 自动局部化，不必担心命名冲突，但仍建议遵循 BEM 思路。

---

## 五、配置文件的组织

### 5.1 配置分层

把不同环境的配置分开，避免误用：

\`\`\`bash
.env                # 通用配置
.env.local          # 本地开发（不提交 git）
.env.development    # 开发环境
.env.staging        # 预发环境
.env.production     # 生产环境
\`\`\`

\`\`\`bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_DEVTOOLS=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_DEVTOOLS=false
\`\`\`

### 5.2 不要把密钥放 .env

\`.env\` 文件最终会打包进前端代码，**所有用户都能在浏览器里看到**。密钥应该：

- API Key 类敏感信息放后端，前端调后端代理
- 真要前端用的（如第三方公开 Key），用环境变量区分环境，但知道它是公开的

\`\`\`js
// ❌ 危险：把数据库密码放前端
const DB_PASSWORD = process.env.DB_PASSWORD;

// ✅ 安全：前端只持有公开的、可暴露的 key
const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY; // 公开 key
\`\`\`

---

## 六、Git 忽略规则

\`\`\`gitignore
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
build/
.next/
.nuxt/
.cache/

# 环境变量（含密钥的）
.env.local
.env.*.local

# 编辑器
.vscode/
.idea/
*.swp

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# 测试覆盖率
coverage/

# 临时文件
*.tmp
\`\`\`

**核心原则**：

- \`node_modules\` 永远不进 git（用锁文件保证一致性）
- 构建产物不进 git（CI 重新构建）
- 含密钥的 \`.env.local\` 不进 git

---

## 七、小结

目录结构是工程化「软规范」的体现，关键点：

1. **小型项目 type-first，中大型项目 feature-first**
2. **就近原则**：组件相关的代码（jsx/css/test）放一起
3. **路径别名 \`@\`**：消灭 \`../../../\` 地狱
4. **命名统一**：组件 PascalCase、变量 camelCase、常量 UPPER_SNAKE
5. **CSS 用 BEM 或 CSS Modules**：避免命名冲突
6. **配置分层**：\`.env.development\` / \`.env.production\` 隔离
7. **密钥不进前端代码**：前端能拿到的就是公开的

下一章我们看开发环境配置——编辑器、Node 版本、调试工具怎么统一。
`,
  },
  {
    id: "fe-eng-dev-env",
    group: "基础概念",
    icon: "🛠️",
    title: "开发环境统一：编辑器、Node 版本与调试",
    content: `

# 开发环境统一：编辑器、Node 版本与调试

## 一、为什么要在意环境统一

### 1.1 「我这能跑」的根源

新人入职拉下代码，跑不起来。原因往往不是代码 bug，而是环境差异：

- 你用 Node 20，他用 Node 16，某个 API 不存在
- 你装了 Prettier 插件，他没装，保存不格式化
- 你用 macOS，他用 Windows，路径分隔符 \\ vs /

工程化的目标是「环境可复现」—— 同样的代码 + 同样的环境 = 同样的结果。

### 1.2 环境统一的三个层次

1. **运行时**：Node 版本、包管理器版本
2. **编辑器**：插件、配置、代码风格
3. **外部依赖**：数据库、Redis、第三方 API（用 Docker 解决）

---

## 二、Node 版本管理

### 2.1 为什么需要版本管理器

不同项目可能依赖不同 Node 版本：

- 老项目还在 Node 14
- 新项目用 Node 20 的原生 fetch、Top-level await
- 某个库要求 Node 18+

直接全局装一个版本不够用，需要版本管理器随时切换。

### 2.2 主流版本管理器

| 工具 | 特点 | 推荐场景 |
|------|------|----------|
| nvm | 最老牌，shell 脚本实现 | macOS / Linux |
| nvm-windows | nvm 的 Windows 移植 | Windows |
| fnm | Rust 写的，速度极快 | 通用（推荐）|
| volta | 自动切换（基于 package.json）| 团队统一 |
| n | 简单直接 | 偶尔用 |

### 2.3 nvm 基本用法

\`\`\`bash
# 安装版本
nvm install 20           # 装 Node 20 最新小版本
nvm install 18.19.0      # 装指定版本

# 切换版本
nvm use 20
nvm use 18

# 查看已装
nvm ls

# 设置默认
nvm alias default 20
\`\`\`

### 2.4 自动切换：.nvmrc

每个项目根目录放一个 \`.nvmrc\`，写明需要的 Node 版本：

\`\`\`bash
# .nvmrc
20.20.0
\`\`\`

配合 shell 钩子，进入目录自动切换：

\`\`\`bash
# ~/.bashrc 或 ~/.zshrc
# 进入含 .nvmrc 的目录自动 nvm use
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
\`\`\`

### 2.5 Volta：基于 package.json 自动锁定

Volta 更激进——直接读 \`package.json\` 的 \`engines\` 字段，自动切版本：

\`\`\`json
{
  "name": "my-app",
  "engines": {
    "node": "20.20.0"
  }
}
\`\`\`

\`\`\`bash
# 一次性配置
volta install node@20

# 之后无论在哪个目录，volta 自动按 package.json 切换
cd my-app
node -v  # 自动是 20.20.0
\`\`\`

适合团队对版本一致性要求高的场景。

---

## 三、编辑器配置统一

### 3.1 EditorConfig：跨编辑器的统一

不同编辑器对 Tab/Space、换行符、文件编码有不同默认。EditorConfig 用一个 \`.editorconfig\` 文件统一：

\`\`\`ini
# .editorconfig
root = true                     # 标记这是项目根，不再向上查找

[*]
charset = utf-8                 # 文件编码
end_of_line = lf                # 换行符（避免 Windows 的 CRLF）
indent_style = space            # 缩进用空格（不用 tab）
indent_size = 2                 # 缩进 2 空格
insert_final_newline = true     # 文件末尾留一个空行
trim_trailing_whitespace = true # 删除行尾空格

[*.md]
trim_trailing_whitespace = false # Markdown 行尾两个空格表示换行，保留

[Makefile]
indent_style = tab               # Makefile 必须用 tab
\`\`\`

主流编辑器（VS Code、JetBrains、Vim、Sublime）都支持 EditorConfig（VS Code 装个同名插件即可）。

### 3.2 VS Code 工作区配置

项目根放 \`.vscode/settings.json\`，统一项目级设置：

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\\n",
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "pnpm-lock.yaml": true
  }
}
\`\`\`

### 3.3 VS Code 推荐插件

\`.vscode/extensions.json\` 声明推荐插件，新人打开项目会收到提示：

\`\`\`json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "eamodio.gitlens",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
\`\`\`

### 3.4 项目内嵌工具配置

**关键原则**：构建工具、Lint、格式化器版本都写在 \`package.json\` 里，不用全局装。这样：

- 团队所有人用同一版本
- 升级时改 \`package.json\` 全员同步
- CI 装项目依赖即可，无需额外配置

\`\`\`json
{
  "devDependencies": {
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  }
}
\`\`\`

---

## 四、Node 调试技巧

### 4.1 console.log 之外

\`console.log\` 是最朴素的调试，但 Node 提供了更强大的工具：

\`\`\`js
// console.dir：详细打印对象
console.dir(obj, { depth: null, colors: true });

// console.table：表格形式打印数组
console.table([{ name: 'Alice', age: 28 }, { name: 'Bob', age: 30 }]);

// console.time/timeEnd：计时
console.time('loop');
for (let i = 0; i < 1e6; i++) {}
console.timeEnd('loop'); // loop: 4.5ms

// util.inspect：自定义深度
import { inspect } from 'util';
console.log(inspect(deepObj, { depth: 10, colors: true }));
\`\`\`

### 4.2 Node Inspector（断点调试）

\`\`\`bash
# 启动带 inspector 的 Node
node --inspect server.js
node --inspect-brk server.js  # 第一行就断住

# 然后在 Chrome 打开 chrome://inspect，点 inspect 进入 DevTools
\`\`\`

VS Code 直接按 F5 启动调试器，配置 \`.vscode/launch.json\`：

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug App",
      "program": "\${workspaceFolder}/src/index.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"]
    }
  ]
}
\`\`\`

### 4.3 浏览器端调试

**Source Map 是关键**：构建后的代码压缩成一行，断点无法对应源码。开启 source map 后，浏览器能映射回原始 TypeScript/JSX：

\`\`\`js
// vite.config.ts
export default {
  build: {
    sourcemap: true, // 生产构建也开（注意：会暴露源码，权衡）
  },
};
\`\`\`

开发模式下默认开 source map，可以直接在浏览器 Sources 面板里给 TSX 文件打断点。

### 4.4 React DevTools

安装 React DevTools 浏览器插件，可以：

- 查看 React 组件树
- 检查每个组件的 props/state
- 实时编辑 state 触发重渲染
- Profiler 录制渲染性能

### 4.5 网络调试

\`\`\`js
// 用 debug 库分类打印日志
import debug from 'debug';
const logApi = debug('app:api');
const logDb = debug('app:db');

logApi('GET /users');   // 只在 DEBUG=app:api 时打印
logDb('query users');   // 只在 DEBUG=app:db 时打印
\`\`\`

\`\`\`bash
# 启动时指定要看的日志分类
DEBUG=app:* node server.js
DEBUG=app:api node server.js
\`\`\`

---

## 五、用 Docker 锁定外部依赖

### 5.1 解决「我电脑能跑」的终极方案

前端项目通常依赖后端 API、数据库。不同人本地装的版本不同，行为有差异。Docker 把这些外部依赖容器化，保证一致：

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    image: node:20
    volumes:
      - ./server:/app
    working_dir: /app
    command: npm run dev
    ports:
      - "3000:3000"

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"
\`\`\`

\`\`\`bash
docker compose up -d   # 启动后端 + DB + Redis
docker compose down    # 停止
\`\`\`

团队成员无论 macOS、Windows、Linux，跑出来的后端环境完全一致。

### 5.2 前端项目本身的 Dockerfile

\`\`\`dockerfile
# 多阶段构建，减小最终镜像体积
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 用 nginx 跑静态产物
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
\`\`\`

---

## 六、环境检查脚本

### 6.1 用 npm scripts 强制 Node 版本

\`\`\`js
// scripts/check-node.js
const required = require('./package.json').engines.node;
const current = process.versions.node;
const [maj] = current.split('.').map(Number);

if (maj < 18) {
  console.error(\`❌ 需要 Node \${required}，当前是 \${current}\`);
  process.exit(1);
}
console.log(\`✅ Node \${current} 满足要求\`);
\`\`\`

\`\`\`json
{
  "scripts": {
    "preinstall": "node scripts/check-node.js"
  }
}
\`\`\`

\`\`\`bash
# npm install 前自动检查
npm install
\`\`\`

### 6.2 用 only-allow 强制包管理器

防止有人用 npm 装、有人用 yarn 装导致锁文件冲突：

\`\`\`json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
\`\`\`

\`\`\`bash
# 用 npm 装会被拒绝
npm install
# npm run preinstall 输出：Use pnpm for installation in this project
\`\`\`

---

## 七、小结

环境统一是工程化的「基本功」：

1. **Node 版本**：\`.nvmrc\` 锁定，或用 Volta 自动切换
2. **EditorConfig**：跨编辑器统一缩进/换行/编码
3. **VS Code 配置**：\`.vscode/\` 目录提交 git，团队共享
4. **工具版本内嵌**：构建/Lint 工具放 devDependencies，不全局装
5. **Source Map**：开发必备，生产按需
6. **Docker**：外部依赖容器化，彻底消灭环境差异
7. **强制脚本**：\`preinstall\` 检查 Node 版本、包管理器

基础概念篇到此结束。下一章开始进入构建与打包篇，看 Webpack 如何把模块图打包成浏览器能用的产物。
`,
  },
];
