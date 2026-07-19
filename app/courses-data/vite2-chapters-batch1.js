// =============================================================
// Vite 大全集（终极版）—— 第1批章节
// 开篇 + 第一部分 入门基础（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch01 : 第一章 开篇导读
//   vite2-ch02 : 第二章 Vite 是什么 & 为什么快
//   vite2-ch03 : 第三章 安装与创建项目
//   vite2-ch04 : 第四章 项目目录结构详解
//   vite2-ch05 : 第五章 dev/build/preview 三件套
//   vite2-ch06 : 第六章 vite.config.js 配置入门
//   vite2-ch07 : 第七章 浏览器原生 ESM 原理
//
// 设计说明：
//   - content 字段是 Markdown 正文，包含可直接复制到项目的
//     vite.config.js / 命令行 / .env 等实战配置。
//   - code 字段是「可在 Node 中独立运行」的演示脚本，点 ▶ 运行
//     会有控制台输出，用来直观理解该章核心概念。
//   - 所有讲解使用简体中文，聚焦「马上用得上」的实战知识。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：开篇导读
  // =========================================================
  {
    id: "vite2-ch01",
    group: "开篇",
    icon: "📖",
    title: "第一章 开篇导读",
    content: `## 欢迎来到 Vite 大全集

这是一本**大而全**的 Vite 教程，覆盖从入门到精通的**所有知识点**。无论你是第一次接触 Vite，还是已经用过但想深入理解原理，这本书都适合你。

### 这本书的特点

1. **大而全**：65 章覆盖 Vite 所有知识点，从创建项目到部署上线
2. **demo 驱动**：每章都有可运行的演示代码，点击 ▶ 运行即可看到结果
3. **配置可复制**：所有 vite.config.js / .env / 命令行配置都可直接复制到项目使用
4. **循序渐进**：从「什么是 Vite」开始，逐步深入到插件开发、SSR、构建优化
5. **语言简洁**：讲清楚不拖沓，每句话都有信息量

### 全书结构

| 部分 | 内容 | 章节范围 |
|------|------|----------|
| 第一部分 | 入门基础 | 第 1-7 章 |
| 第二部分 | 核心概念 | 第 8-13 章 |
| 第三部分 | 配置详解 | 第 14-19 章 |
| 第四部分 | 静态资源 | 第 20-23 章 |
| 第五部分 | 环境与变量 | 第 24-26 章 |
| 第六部分 | 服务器配置 | 第 27-31 章 |
| 第七部分 | 构建优化 | 第 32-37 章 |
| 第八部分 | 插件系统 | 第 38-43 章 |
| 第九部分 | 框架集成 | 第 44-47 章 |
| 第十部分 | 工程化 | 第 48-52 章 |
| 第十一部分 | SSR/SSG | 第 53-54 章 |
| 第十二部分 | 高级特性 | 第 55-58 章 |
| 第十三部分 | 部署 | 第 59-61 章 |
| 第十四部分 | 实战项目 | 第 62-64 章 |
| 结尾 | 结语与进阶 | 第 65 章 |

### 适合谁读

- **前端新手**：从零开始，跟着章节动手操作
- **Webpack 用户**：想迁移到 Vite，需要理解差异
- **Vite 用户**：想深入理解原理、插件开发、构建优化
- **团队负责人**：选型评估，需要全面了解 Vite 能力

### 阅读建议

1. **第一遍**：按顺序读，每章运行 demo，理解概念
2. **第二遍**：跳到感兴趣的章节深入，把配置用到项目里
3. **第三遍**：把这本书当手册，遇到问题随时查阅

### 版本说明

本书基于 **Vite 5/6 LTS**，所有配置和 API 都适用于最新版本。Vite 6 引入了 Environment API 等新特性，会在第 56 章专门讲解。

---

准备好了吗？下一章我们从「Vite 是什么 & 为什么快」开始。`,
    code: `// 开篇演示：打印全书目录
console.log("📚 Vite 大全集（终极版）目录");
console.log("=====================================");
console.log("第一部分 入门基础（1-7 章）");
console.log("第二部分 核心概念（8-13 章）");
console.log("第三部分 配置详解（14-19 章）");
console.log("第四部分 静态资源（20-23 章）");
console.log("第五部分 环境与变量（24-26 章）");
console.log("第六部分 服务器配置（27-31 章）");
console.log("第七部分 构建优化（32-37 章）");
console.log("第八部分 插件系统（38-43 章）");
console.log("第九部分 框架集成（44-47 章）");
console.log("第十部分 工程化（48-52 章）");
console.log("第十一部分 SSR/SSG（53-54 章）");
console.log("第十二部分 高级特性（55-58 章）");
console.log("第十三部分 部署（59-61 章）");
console.log("第十四部分 实战项目（62-64 章）");
console.log("结尾（65 章）");
console.log("=====================================");
console.log("✅ 共 65 章，覆盖 Vite 所有知识点");`,
  },

  // =========================================================
  // 第二章：Vite 是什么 & 为什么快
  // =========================================================
  {
    id: "vite2-ch02",
    group: "第一部分 入门基础",
    icon: "⚡",
    title: "第二章 Vite 是什么 & 为什么快",
    content: `## 一句话理解 Vite

**Vite**（发音 /viːt/，类似"维特"）是 Vue 作者尤雨溪在 2020 年开源的**下一代前端构建工具**。核心卖点只有两个字：**快**。

一个典型的 Vite 项目，开发服务器**毫秒级启动**，改一行代码**瞬间热更新**，不用等 Webpack 那漫长的编译进度条。

> **定位**：Vite 是开发阶段的开发服务器（dev server）+ 生产阶段的打包器（bundler，基于 Rollup）的**一体化工具链**。你可以把它理解为"比 Webpack 快得多的替代品"。

---

## 为什么 Vite 这么快？

这是理解 Vite 的关键，也是面试常考点。原因分两个阶段：

### 1. 开发阶段：利用浏览器原生 ES Module

传统工具（Webpack、Rollup）启动开发服务器时，会**先把所有模块打包成一个 bundle**，再交给浏览器。项目越大，打包越慢。

Vite 完全不同。它启动时**不打包**，直接启动服务器。浏览器请求某个文件时，Vite 才**按需编译**这一个文件并返回。浏览器原生支持 ES Module（\`<script type="module">\`），所以可以直接加载：

\`\`\`html
<!-- 浏览器看到这个，会发起对 /src/main.js 的请求 -->
<script type="module" src="/src/main.js"></script>
\`\`\`

如果 \`main.js\` 里 \`import\` 了 \`./App.vue\`，浏览器再发请求要 \`App.vue\`，Vite 即时编译返回。**用到哪个文件才编译哪个文件**，所以项目再大，启动时间都几乎不变。

### 2. 生产阶段：用 Rollup 打包

生产环境不能用一堆零散的 ESM 请求（HTTP 请求数太多、旧浏览器不支持），所以 \`vite build\` 时切换成 **Rollup** 打包，输出优化过的静态资源（tree-shaking、压缩、分包都靠 Rollup）。

### 3. 预构建：esbuild 加速依赖

第三方依赖（react、lodash 等）通常是 CommonJS 格式，且依赖很多。Vite 启动时用 **esbuild**（Go 写的超快打包器，比 Node 写的快 10-100 倍）把它们预编译成 ESM 缓存起来。这就是为什么 \`npm install\` 后第一次启动稍慢，之后就飞快。

---

## Vite vs Webpack 对比

| 维度 | Webpack | Vite |
|------|---------|------|
| 开发启动 | 需打包全部模块，项目越大越慢 | 不打包，按需编译，秒级启动 |
| 热更新 | 重新构建受影响的模块链 | 精确到单文件，近乎瞬时 |
| 配置复杂度 | 复杂（loader/plugin 一大堆） | 简洁，开箱即用 |
| 生产打包 | 自家打包器 | Rollup |
| 生态 | 极其丰富 | 足够用，且持续增长 |

---

## 什么时候用 Vite？

- 启动**任何新的前端项目**（React / Vue / Svelte / 原生 JS / 库）
- 老的 Webpack 项目觉得太慢，想迁移提速
- 写一个 npm 库，需要打包发布

现在 Vite 已是**新项目的默认选择**，Vue 官方脚手架、Nuxt、SvelteKit、Remix（部分）、Astro 都内置或基于 Vite。

---

## 下一章

理解了"为什么快"，下一章我们**动手创建第一个 Vite 项目**，30 秒跑起来。`,
    code: `// 演示：用 Node 模拟 Vite 的"按需编译"思想
// ---------------------------------------------------
// 传统打包：把所有模块先合并成一个大文件再执行
// Vite 思路：只在被请求时才编译该模块，用到才处理

// 模拟项目里的三个模块
const modules = {
  "./main.js": 'import { hello } from "./greet.js"; hello();',
  "./greet.js": 'export function hello(){ console.log("你好，Vite！"); }',
  "./unused.js": 'console.log("我从没被引用，Vite 根本不会编译我");',
};

// 模拟 Vite 的"按需编译"：只有被 import 链路引用到的才处理
const compiled = new Set();
function loadAndCompile(modulePath) {
  if (compiled.has(modulePath)) return;       // 已编译则跳过（缓存）
  compiled.add(modulePath);
  console.log("🔧 即时编译:", modulePath);
}

// 浏览器请求入口 main.js → 触发整条引用链的按需编译
console.log("浏览器请求 ./main.js");
loadAndCompile("./main.js");
loadAndCompile("./greet.js");   // main.js 依赖它，被编译

console.log("\\n✅ 启动完成，仅编译了被引用的模块");
console.log("未被引用的 ./unused.js 一次都没被编译，这就是 Vite 快的秘密");`,
  },

  // =========================================================
  // 第三章：安装与创建项目
  // =========================================================
  {
    id: "vite2-ch03",
    group: "第一部分 入门基础",
    icon: "🚀",
    title: "第三章 安装与创建项目",
    content: `## 最快的方式：npm create vite

打开终端，执行这一条命令就能创建项目：

\`\`\`bash
npm create vite@latest my-app
\`\`\`

执行后会进入交互式选择，依次选：

1. **Framework**（框架）：Vanilla / Vue / React / Preact / Lit / Svelte / Others
2. **Variant**（语言）：JavaScript / TypeScript

比如选 React + TypeScript，就会生成一个开箱即用的 React+TS 项目。

### 一步到位（跳过交互）

\`\`\`bash
# 直接指定项目名 + 模板
npm create vite@latest my-app -- --template react-ts

# 其他模板：
# vanilla / vanilla-ts
# vue / vue-ts
# react / react-ts
# preact / preact-ts
# lit / lit-ts
# svelte / svelte-ts
\`\`\`

### 用其他包管理器

\`\`\`bash
# pnpm（推荐，快且省磁盘）
pnpm create vite my-app

# yarn
yarn create vite my-app

# bun
bun create vite my-app
\`\`\`

---

## 创建后要做的事

\`\`\`bash
cd my-app       # 进入项目目录
npm install     # 安装依赖（或 pnpm install）
npm run dev     # 启动开发服务器
\`\`\`

看到这样的输出就成功了：

\`\`\`
  VITE v5.x.x  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
\`\`\`

浏览器打开 \`http://localhost:5173/\`，就能看到项目首页。

---

## package.json 里的关键信息

\`\`\`json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",              // 启动开发服务器（最常用）
    "build": "vite build",      // 打包构建生产版本
    "preview": "vite preview"   // 本地预览构建产物
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
\`\`\`

**注意**：\`vite\` 和框架插件（如 \`@vitejs/plugin-react\`）在 \`devDependencies\` 里。因为构建产物是纯静态文件，部署时不需要 Vite。

---

## 全局安装 vite（不推荐）

\`\`\`bash
npm i -g vite
# 然后可以在任意目录用 vite 命令
\`\`\`

不推荐原因：每个项目的 Vite 版本可能不同，全局安装会导致版本冲突。**用 npx 或项目本地安装更安全**。

---

## 模板列表速查

| 模板 | 命令 | 适用场景 |
|------|------|----------|
| vanilla | \`--template vanilla\` | 原生 JS，无框架 |
| vue | \`--template vue\` | Vue 3 |
| react | \`--template react\` | React 18 |
| svelte | \`--template svelte\` | Svelte |
| lit | \`--template lit\` | Lit（Web Components）|
| preact | \`--template preact\` | Preact（轻量 React）|

加 \`-ts\` 后缀即 TypeScript 版本，如 \`react-ts\`。

---

## 下一章

项目创建好了，下一章我们看看**项目目录里每个文件是干什么的**。`,
    code: `// 演示：解析 npm create vite 生成的典型 package.json
const packageJson = {
  name: "my-app",
  private: true,
  version: "0.0.0",
  type: "module",   // 关键：使用 ESM
  scripts: {
    dev: "vite",              // 启动开发服务器（最常用）
    build: "vite build",      // 打包构建生产版本
    preview: "vite preview"   // 本地预览构建产物
  },
  devDependencies: {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
};

console.log("📦 项目 package.json 关键字段：");
console.log("  name:", packageJson.name);
console.log("  type:", packageJson.type, "← 使用 ESM 模块系统");
console.log("  scripts.dev:", packageJson.scripts.dev, "← 启动开发服务器");
console.log("  scripts.build:", packageJson.scripts.build, "← 构建生产版本");
console.log("  scripts.preview:", packageJson.scripts.preview, "← 预览构建产物");
console.log("\\n💡 vite 和框架插件（如 @vitejs/plugin-react）在 devDependencies");`,
  },

  // =========================================================
  // 第四章：项目目录结构详解
  // =========================================================
  {
    id: "vite2-ch04",
    group: "第一部分 入门基础",
    icon: "📁",
    title: "第四章 项目目录结构详解",
    content: `## 典型 Vite 项目结构

以 React + TypeScript 模板为例：

\`\`\`
my-app/
├── node_modules/          # 依赖（npm install 生成，别提交）
├── public/                # 静态资源（不经过 Vite 处理）
│   └── vite.svg           #   原样复制到 dist/
├── src/                   # 源代码（都在这里写）
│   ├── assets/            #   会被 Vite 处理的资源（图片等）
│   │   └── react.svg
│   ├── App.css            #   根组件样式
│   ├── App.tsx            #   根组件
│   ├── index.css          #   全局样式
│   ├── main.tsx           #   入口文件（挂载到 #root）
│   └── vite-env.d.ts      #   Vite 类型声明
├── .gitignore             # Git 忽略配置
├── index.html             # 入口 HTML（Vite 特有）
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # 给 vite.config.ts 用的 TS 配置
└── vite.config.ts         # Vite 配置文件
\`\`\`

---

## 关键文件详解

### 1. index.html（入口 HTML）

**这是 Vite 的特色**：\`index.html\` 在项目根目录（不在 \`public/\`），是应用的入口。

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- 关键：这里用 type="module" 加载 src/main.tsx -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\`

**为什么这样设计**：Vite 开发时直接以 \`index.html\` 为入口，浏览器请求 \`/src/main.tsx\`，Vite 即时编译返回。这比 Webpack 的"先打包再注入 HTML"简单得多。

### 2. src/main.tsx（入口文件）

\`\`\`tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'   // 直接 import CSS，Vite 会处理

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
\`\`\`

### 3. vite.config.ts（配置文件）

\`\`\`ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
\`\`\`

### 4. src/vite-env.d.ts（类型声明）

\`\`\`ts
/// <reference types="vite/client" />
\`\`\`

这一行让 TypeScript 认识 \`import.meta.env\` 等 Vite 特有 API。

---

## public/ vs src/assets/

| 目录 | 用途 | 处理方式 | 引用方式 |
|------|------|----------|----------|
| \`public/\` | 不需要处理的静态文件 | 原样复制到 \`dist/\` | \`/文件名\`（绝对路径）|
| \`src/assets/\` | 需要被 Vite 处理的资源 | 编译、hash、内联 | \`import\` 进来用 |

\`\`\`tsx
// public/ 里的文件：直接用绝对路径
<img src="/vite.svg" />

// src/assets/ 里的文件：import 进来
import logo from './assets/react.svg'
<img src={logo} />
\`\`\`

**经验法则**：需要 hash 指纹、小图内联 base64 的放 \`src/assets/\`；favicon、robots.txt 这种放 \`public/\`。

---

## .gitignore 必备项

\`\`\`
node_modules
dist
dist-ssr
*.local
.DS_Store
.vscode/*
!.vscode/extensions.json
\`\`\`

---

## 下一章

目录结构清楚了，下一章学习**dev / build / preview 三个命令**的用法和区别。`,
    code: `// 演示：模拟 Vite 项目的目录结构
const projectStructure = {
  "my-app/": {
    "public/": {
      "vite.svg": "静态资源，原样复制到 dist/"
    },
    "src/": {
      "assets/": {
        "react.svg": "会被 Vite 处理的资源（hash、内联等）"
      },
      "App.tsx": "根组件",
      "App.css": "根组件样式",
      "index.css": "全局样式",
      "main.tsx": "入口文件（挂载到 #root）",
      "vite-env.d.ts": "Vite 类型声明"
    },
    "index.html": "入口 HTML（Vite 特有，在根目录）",
    "package.json": "项目配置",
    "vite.config.ts": "Vite 配置文件"
  }
};

console.log("📁 Vite 项目目录结构：");
console.log("=====================================");

function printTree(obj, indent = "") {
  for (const [key, value] of Object.entries(obj)) {
    console.log(indent + "├── " + key);
    if (typeof value === "object" && value !== null) {
      printTree(value, indent + "│   ");
    } else if (typeof value === "string") {
      console.log(indent + "│   └── " + value);
    }
  }
}

printTree(projectStructure);
console.log("\\n💡 关键：index.html 在根目录，是应用入口");
console.log("💡 public/ 原样复制，src/assets/ 会被处理");`,
  },

  // =========================================================
  // 第五章：dev / build / preview 三件套
  // =========================================================
  {
    id: "vite2-ch05",
    group: "第一部分 入门基础",
    icon: "🛠️",
    title: "第五章 dev/build/preview 三件套",
    content: `## 三个核心命令

Vite 只有三个核心命令，覆盖前端开发的完整生命周期：

| 命令 | 作用 | 使用场景 |
|------|------|----------|
| \`vite\` (\`npm run dev\`) | 启动开发服务器 | 日常开发，支持 HMR 热更新 |
| \`vite build\` (\`npm run build\`) | 构建生产版本 | 准备部署，输出 dist/ |
| \`vite preview\` (\`npm run preview\`) | 预览构建产物 | 检查 build 结果是否符合预期 |

---

## 1. vite（开发服务器）

\`\`\`bash
# 基本启动
npm run dev

# 指定端口
vite --port 3000

# 自动打开浏览器
vite --open

# 暴露到局域网（手机可访问）
vite --host

# 组合使用
vite --port 3000 --open --host
\`\`\`

启动后终端显示：

\`\`\`
  VITE v5.x.x  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
\`\`\`

**按 h 显示帮助**，可以查看快捷键：
- \`r\` 重启服务器
- \`u\` 显示服务器 URL
- \`o\` 打开浏览器
- \`c\` 清空控制台
- \`q\` 退出

### 开发服务器特点

- **毫秒级启动**：不打包，按需编译
- **HMR 热更新**：改代码浏览器不刷新，只更新改动部分
- **依赖预构建**：首次启动稍慢（esbuild 处理依赖），之后飞快
- **错误覆盖**：代码报错时浏览器叠加层显示错误

---

## 2. vite build（构建生产版本）

\`\`\`bash
# 基本构建
npm run build

# 指定输出目录（默认 dist）
vite build --outDir=build

# 指定模式（默认 production）
vite build --mode staging

# 清空输出目录再构建
vite build --emptyOutDir

# 不生成 sourcemap
vite build --sourcemap=false
\`\`\`

典型输出：

\`\`\`
vite v5.x.x building for production...
✓ 42 modules transformed.
dist/index.html                  0.46 kB │ gzip:  0.30 kB
dist/assets/index-a1b2c3d4.css   1.23 kB │ gzip:  0.45 kB
dist/assets/index-e5f6g7h8.js  143.67 kB │ gzip: 46.12 kB
✓ built in 1.23s
\`\`\`

**构建过程**：
1. Vite 切换到 Rollup 打包
2. Tree-shaking 删除未使用代码
3. 代码压缩（esbuild minify）
4. 文件名加 hash（基于内容）
5. 输出到 \`dist/\` 目录

### 构建产物结构

\`\`\`
dist/
├── index.html              # 入口 HTML
├── assets/
│   ├── index-a1b2c3d4.css  # CSS（hash 基于内容）
│   ├── index-e5f6g7h8.js   # JS（hash 基于内容）
│   └── logo-i9j0k1l2.png   # 图片（hash 基于内容）
└── vite.svg                # public/ 里的文件原样复制
\`\`\`

---

## 3. vite preview（预览构建产物）

\`\`\`bash
# 基本预览
npm run preview

# 指定端口
vite preview --port 4000

# 暴露到局域网
vite preview --host
\`\`\`

**为什么要 preview**：

\`vite build\` 后，\`dist/\` 是纯静态文件。直接用浏览器打开 \`dist/index.html\` 会因为 \`file://\` 协议导致 ES Module 加载失败。\`vite preview\` 启动一个静态服务器托管 \`dist/\`，模拟生产环境。

**典型工作流**：

\`\`\`bash
npm run build      # 构建
npm run preview    # 预览，检查效果
# 确认没问题后再部署
\`\`\`

---

## 三个命令的对比

| 特性 | dev | build | preview |
|------|-----|-------|---------|
| 作用 | 开发服务器 | 打包 | 预览打包结果 |
| 输出 | 内存中 | \`dist/\` 目录 | 启动服务器托管 dist/ |
| HMR | ✅ | ❌ | ❌ |
| 压缩 | ❌ | ✅ | ✅（已经是压缩的）|
| 速度 | 毫秒级启动 | 几秒到几十秒 | 毫秒级启动 |
| 用途 | 日常开发 | 准备部署 | 验证构建结果 |

---

## package.json scripts 进阶

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "build:staging": "vite build --mode staging",
    "build:analyze": "vite build --mode analyze",
    "preview:dist": "vite preview --port 4000"
  }
}
\`\`\`

---

## 下一章

三个命令会用了吗？下一章深入**vite.config.js 配置文件**，看看怎么定制 Vite 行为。`,
    code: `// 演示：模拟三个命令的工作流
console.log("🛠️ Vite 三件套工作流");
console.log("=====================================");

// 1. dev
console.log("\\n1️⃣ vite (dev) - 开发服务器");
console.log("   命令: npm run dev");
console.log("   作用: 启动开发服务器，支持 HMR");
console.log("   速度: 毫秒级启动");
console.log("   场景: 日常开发");

// 2. build
console.log("\\n2️⃣ vite build - 构建生产版本");
console.log("   命令: npm run build");
console.log("   作用: 打包到 dist/，压缩、tree-shaking、hash");
console.log("   速度: 几秒到几十秒");
console.log("   场景: 准备部署");

// 模拟构建输出
console.log("\\n   构建输出示例:");
const buildOutput = [
  { file: "dist/index.html", size: "0.46 kB", gzip: "0.30 kB" },
  { file: "dist/assets/index-a1b2c3d4.css", size: "1.23 kB", gzip: "0.45 kB" },
  { file: "dist/assets/index-e5f6g7h8.js", size: "143.67 kB", gzip: "46.12 kB" }
];
buildOutput.forEach(f => {
  console.log(\`   \${f.file.padEnd(35)} \${f.size.padStart(10)} │ gzip: \${f.gzip.padStart(8)}\`);
});

// 3. preview
console.log("\\n3️⃣ vite preview - 预览构建产物");
console.log("   命令: npm run preview");
console.log("   作用: 启动静态服务器托管 dist/");
console.log("   速度: 毫秒级启动");
console.log("   场景: 验证构建结果");

console.log("\\n✅ 典型工作流: build → preview → 部署");`,
  },

  // =========================================================
  // 第六章：vite.config.js 配置入门
  // =========================================================
  {
    id: "vite2-ch06",
    group: "第一部分 入门基础",
    icon: "⚙️",
    title: "第六章 vite.config.js 配置入门",
    content: `## 配置文件基础

项目根目录下创建 \`vite.config.js\`（或 \`.ts\` / \`.mjs\`），Vite 启动时会自动读取。

### 最简配置

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
\`\`\`

### 为什么要用 defineConfig

\`defineConfig\` 提供两个好处：
1. **类型提示**：在 VS Code 里输入 \`export default defineConfig({\` 后，会有自动补全
2. **配置错误早发现**：拼写错误的配置项会标红

不用 \`defineConfig\` 也能跑，但强烈推荐用。

---

## 常用配置预览

\`\`\`js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 1. 插件
  plugins: [react()],

  // 2. 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // 3. 开发服务器
  server: {
    port: 3000,           // 端口
    open: true,           // 自动打开浏览器
    proxy: {              // 代理
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  // 4. 构建配置
  build: {
    outDir: 'dist',       // 输出目录
    sourcemap: true,      // 生成 sourcemap
    rollupOptions: {      // Rollup 配置
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },

  // 5. CSS 配置
  css: {
    modules: {            // CSS Modules
      localsConvention: 'camelCase'
    },
    preprocessorOptions: { // 预处理器
      scss: {
        additionalData: \`$primary: #409eff;\`
      }
    }
  }
})
\`\`\`

后续章节会逐个展开这些配置。本章你只需要记住：**配置文件叫 \`vite.config.js\`，用 \`defineConfig\` 包裹，plugins 放插件，server 管开发服务器，build 管构建**。

---

## 配置文件的几种写法

### 1. vite.config.js（ESM，推荐）

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig({
  // 配置
})
\`\`\`

前提：\`package.json\` 里有 \`"type": "module"\`。

### 2. vite.config.ts（TypeScript，推荐）

\`\`\`ts
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'

export default defineConfig({
  // 配置
} satisfies UserConfig)
\`\`\`

Vite 内置支持 TS，不需要额外配置。

### 3. vite.config.cjs（CommonJS）

\`\`\`cjs
const { defineConfig } = require('vite')

module.exports = defineConfig({
  // 配置
})
\`\`\`

老旧项目用这个。

### 4. 配置拆分（大型项目）

\`\`\`js
// vite.config.base.js - 公共配置
export const baseConfig = {
  plugins: [react()],
  resolve: { alias: { '@': '/src' } }
}

// vite.config.dev.js - 开发配置
import { baseConfig } from './vite.config.base'
export default defineConfig({
  ...baseConfig,
  server: { port: 3000 }
})

// vite.config.prod.js - 生产配置
import { baseConfig } from './vite.config.base'
export default defineConfig({
  ...baseConfig,
  build: { sourcemap: true }
})
\`\`\`

然后 \`package.json\` 里：

\`\`\`json
{
  "scripts": {
    "dev": "vite --config vite.config.dev.js",
    "build": "vite build --config vite.config.prod.js"
  }
}
\`\`\`

---

## 条件配置（函数写法）

\`defineConfig\` 也接受函数，根据命令返回不同配置：

\`\`\`js
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // dev / preview 时用
    return {
      server: { port: 3000 }
    }
  } else {
    // build 时用
    return {
      build: { sourcemap: true }
    }
  }
})
\`\`\`

\`command\` 有两个值：
- \`'serve'\`：\`vite\` 和 \`vite preview\`
- \`'build'\`：\`vite build\`

\`mode\` 是当前模式（development / production / 自定义），下一章详解。

---

## 异步配置

配置可以异步加载：

\`\`\`js
export default defineConfig(async ({ command, mode }) => {
  const data = await fetchSomeConfig()
  return {
    // 用 data 拼配置
  }
})
\`\`\`

---

## 下一章

配置文件会用了吗？下一章深入理解**浏览器原生 ESM 原理**，这是 Vite 快的根基。`,
    code: `// 演示：defineConfig 的类型提示模拟
const defineConfig = (config) => config;

// 模拟一个典型的 vite.config.js
const config = defineConfig({
  plugins: ['react()'],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});

console.log("⚙️ vite.config.js 配置预览：");
console.log("=====================================");
console.log("plugins:", config.plugins);
console.log("resolve.alias:", JSON.stringify(config.resolve.alias));
console.log("server.port:", config.server.port);
console.log("server.open:", config.server.open);
console.log("server.proxy:", JSON.stringify(config.server.proxy, null, 2));
console.log("build.outDir:", config.build.outDir);
console.log("build.sourcemap:", config.build.sourcemap);

console.log("\\n💡 defineConfig 提供类型提示，强烈推荐使用");`,
  },

  // =========================================================
  // 第七章：浏览器原生 ESM 原理
  // =========================================================
  {
    id: "vite2-ch07",
    group: "第一部分 入门基础",
    icon: "🌐",
    title: "第七章 浏览器原生 ESM 原理",
    content: `## 什么是浏览器原生 ESM

现代浏览器（Chrome 61+、Firefox 60+、Safari 11+）原生支持 ES Module。不需要 Webpack/Babel，浏览器自己就能解析 \`import\` / \`export\`。

### 最简示例

\`\`\`html
<!-- index.html -->
<script type="module">
  import { greet } from './greet.js'
  greet()  // 输出: Hello, ESM!
</script>
\`\`\`

\`\`\`js
// greet.js
export function greet() {
  console.log('Hello, ESM!')
}
\`\`\`

关键点：\`<script type="module">\` 告诉浏览器用 ESM 模式加载。浏览器会：
1. 请求 \`./greet.js\`
2. 解析其中的 \`export\`
3. 把 \`greet\` 函数导入当前作用域

---

## 浏览器怎么加载 ESM

### 加载流程

\`\`\`
1. 浏览器请求 index.html
2. 解析到 <script type="module" src="./main.js">
3. 请求 ./main.js
4. 解析 main.js，发现 import { foo } from './foo.js'
5. 请求 ./foo.js
6. 解析 foo.js，发现 import bar from './bar.js'
7. 请求 ./bar.js
8. bar.js 没有 import，执行
9. foo.js 执行
10. main.js 执行
\`\`\`

**特点**：
- **按需加载**：用到哪个文件才请求哪个
- **深度优先**：先加载依赖，再执行自己
- **每个文件一次请求**：浏览器缓存已加载的模块

### 与传统打包的区别

| 维度 | 传统打包（Webpack）| 浏览器原生 ESM |
|------|---------------------|-----------------|
| 启动 | 先打包所有模块 | 直接启动，按需加载 |
| 请求数 | 1 个大 bundle | N 个小文件 |
| 缓存 | 改一行代码，整个 bundle 失效 | 改一个文件，只该文件失效 |
| 启动速度 | 项目越大越慢 | 几乎不受项目大小影响 |

---

## Vite 怎么利用原生 ESM

### 开发阶段

\`\`\`
浏览器                    Vite Dev Server
  │                           │
  │ 1. GET /                  │
  │ ─────────────────────────>│
  │ 2. 返回 index.html        │
  │ <─────────────────────────│
  │                           │
  │ 3. GET /src/main.tsx      │
  │ ─────────────────────────>│
  │ 4. 即时编译 TSX → JS       │
  │    返回编译后的 ESM        │
  │ <─────────────────────────│
  │                           │
  │ 5. GET /src/App.tsx       │
  │ ─────────────────────────>│
  │ 6. 即时编译，返回 ESM      │
  │ <─────────────────────────│
\`\`\`

**关键**：Vite 不打包，只编译单个文件。浏览器自己负责加载依赖链。

### 为什么生产环境不用原生 ESM

1. **请求数太多**：一个项目几百个文件，几百个 HTTP 请求
2. **旧浏览器不支持**：IE11 和部分老版本不支持 \`type="module"\`
3. **没有 tree-shaking**：原生 ESM 不能删除未使用代码
4. **没有压缩**：每个文件单独压缩不如整体压缩效率高
5. **没有 chunk 优化**：不能分包、合并

所以生产环境用 Rollup 打包成少数几个文件。

---

## import map（浏览器原生模块映射）

浏览器支持 \`import map\`，可以给模块起别名：

\`\`\`html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18",
    "react-dom": "https://esm.sh/react-dom@18"
  }
}
</script>

<script type="module">
  import React from 'react'           // 实际加载 https://esm.sh/react@18
  import ReactDOM from 'react-dom'    // 实际加载 https://esm.sh/react-dom@18
</script>
\`\`\`

Vite 开发时也用了类似机制，把 \`react\` 映射到预构建后的缓存文件。

---

## 动态 import

原生 ESM 支持动态 \`import()\`：

\`\`\`js
// 静态 import：加载时立即请求
import { heavy } from './heavy.js'

// 动态 import：用到时才请求
button.addEventListener('click', async () => {
  const { heavy } = await import('./heavy.js')
  heavy()
})
\`\`\`

Vite 开发时，\`import('./heavy.js')\` 会触发浏览器请求 \`./heavy.js\`，Vite 即时编译返回。

生产构建时，Rollup 会把动态 \`import()\` 拆成单独的 chunk，实现懒加载。

---

## 下一章

理解了原生 ESM，下一章学习**依赖预构建**——Vite 怎么处理第三方依赖（CommonJS 格式、大量子依赖）。`,
    code: `// 演示：模拟浏览器加载 ESM 的过程
console.log("🌐 浏览器原生 ESM 加载过程");
console.log("=====================================");

// 模拟模块依赖图
const moduleGraph = {
  './main.js': ['./greet.js', './utils.js'],
  './greet.js': [],
  './utils.js': ['./helpers.js'],
  './helpers.js': [],
  './unused.js': []  // 未被引用
};

// 模拟浏览器的加载过程
const loaded = new Set();
function loadModule(modulePath, depth = 0) {
  if (loaded.has(modulePath)) return;
  loaded.add(modulePath);
  
  const indent = '  '.repeat(depth);
  console.log(\`\${indent}📦 请求 \${modulePath}\`);
  
  // 先加载依赖
  const deps = moduleGraph[modulePath] || [];
  deps.forEach(dep => {
    loadModule(dep, depth + 1);
  });
  
  console.log(\`\${indent}✅ 执行 \${modulePath}\`);
}

console.log("\\n浏览器解析 <script type='module' src='./main.js'>:");
console.log("-------------------------------------");
loadModule('./main.js');

console.log("\\n=====================================");
console.log("✅ 共加载 " + loaded.size + " 个模块");
console.log("💡 ./unused.js 未被引用，浏览器不会请求它");
console.log("💡 这就是 Vite 快的秘密：按需加载");`,
  },
];
