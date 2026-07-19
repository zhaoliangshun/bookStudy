// =============================================================
// Vite 大全集（终极版）—— 第9批章节
// 第十二部分 高级特性 + 第十三部分 部署（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   vite2-ch55 : 第五十五章 Library Mode 库模式
//   vite2-ch56 : 第五十六章 Environment API (Vite 6)
//   vite2-ch57 : 第五十七章 WASM 与 WebAssembly
//   vite2-ch58 : 第五十八章 多页应用 MPA
//   vite2-ch59 : 第五十九章 Nginx 部署
//   vite2-ch60 : 第六十章 Vercel/Netlify
//   vite2-ch61 : 第六十一章 Docker 部署
// =============================================================

export const chapters = [
  // =========================================================
  // 第五十五章：Library Mode 库模式
  // =========================================================
  {
    id: "vite2-ch55",
    group: "第十二部分 高级特性",
    icon: "📚",
    title: "第五十五章 Library Mode 库模式",
    content: `## 什么是 Library Mode

前面所有章节都在讲「应用模式」——构建一个能跑在浏览器里的 SPA/MPA。但有时候你写的是一个**给别的项目用的库**（UI 组件库、工具函数库、SDK），需要发布到 npm，让别的项目 \`import\` 使用。

**Library Mode（库模式）** 就是 Vite 为这种场景提供的专门构建模式。区别：

| 维度 | 应用模式（默认）| 库模式（build.lib）|
|------|------------------|---------------------|
| 产物 | HTML + JS + CSS，给浏览器直接用 | JS 模块（es/umd/cjs），给别人 import |
| 依赖处理 | 把 react 等打进 bundle | react 等 external 掉，由使用者提供 |
| 入口 | index.html | 你指定的源文件 |
| CSS | 自动注入 HTML | 单独抽出 .css 文件 |
| 用途 | 部署网站 | 发布到 npm |

---

## 最简配置

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.js',    // 库的入口文件
      name: 'MyLib',              // UMD 模式下的全局变量名
      formats: ['es', 'umd'],     // 输出格式
      fileName: 'my-lib'          // 输出文件名（不带扩展名）
    }
  }
})
\`\`\`

构建后 \`dist/\` 会有：

\`\`\`
dist/
├── my-lib.js       (ES 模块)
└── my-lib.umd.cjs  (UMD 模块)
\`\`\`

---

## formats 输出格式

| 格式 | 文件后缀 | 适用场景 |
|------|----------|----------|
| \`'es'\` | \`.js\` | 现代打包器（Vite/Webpack/Rollup）import |
| \`'cjs'\` | \`.cjs\` | Node.js CommonJS 环境 |
| \`'umd'\` | \`.umd.cjs\` | 浏览器 \`<script>\` 标签直接引入 |
| \`'iife'\` | \`.js\` | 立即执行函数，老浏览器 |

通常发布到 npm 至少输出 \`es\` + \`cjs\` + \`umd\` 三种：

\`\`\`js
formats: ['es', 'cjs', 'umd']
\`\`\`

---

## 单入口 vs 多入口

### 单入口

\`\`\`js
build: {
  lib: {
    entry: './src/index.ts',
    formats: ['es', 'cjs']
  }
}
\`\`\`

### 多入口（每个文件单独打包）

\`\`\`js
build: {
  lib: {
    entry: {
      index: './src/index.ts',       // 主入口
      utils: './src/utils.ts',       // 子模块
      buttons: './src/buttons.ts'    // 子模块
    },
    formats: ['es', 'cjs']
  }
}
\`\`\`

构建后：

\`\`\`
dist/
├── index.js
├── utils.js
└── buttons.js
\`\`\`

使用者可以按需引入：\`import { foo } from 'my-lib/utils'\`，只加载需要的部分。

---

## external：把依赖排除掉

库模式最重要的一点：**第三方依赖不应该打进你的库**，否则体积爆炸，还会和使用者项目的版本冲突。

\`\`\`js
import { defineConfig } from 'vite'
import pkg from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'my-lib',
      name: 'MyLib'
    },
    // 把 dependencies 和 peerDependencies 全部 external 掉
    rollupOptions: {
      external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]
    }
  }
})
\`\`\`

### dependencies vs peerDependencies

| 字段 | 含义 | 例子 |
|------|------|------|
| \`dependencies\` | 库运行时依赖，使用者安装时会自动装上 | \`lodash-es\` |
| \`peerDependencies\` | 同辈依赖，要求使用者项目里已经有 | \`react\`、\`vue\` |

UI 组件库的 \`react\` / \`vue\` 一定放 \`peerDependencies\`，避免和宿主项目版本冲突。

---

## CSS 处理

库模式默认会**单独输出 CSS 文件**（不像应用模式那样注入 HTML）。比如你的库用了 \`import './style.css'\`，构建后会生成 \`dist/my-lib.css\`。

使用者在自己的入口引入：

\`\`\`js
import 'my-lib/dist/my-lib.css'
\`\`\`

### 不想输出 CSS？内联到 JS

\`\`\`js
build: {
  cssCodeSplit: false,
  rollupOptions: {
    output: {
      // 把 CSS 内联进 JS（用 style 标签注入）
      assetFileNames: 'my-lib.[ext]'
    }
  }
}
\`\`\`

---

## 类型声明：vite-plugin-dts

TypeScript 库还需要输出 \`.d.ts\` 类型声明文件，否则使用者在 TS 项目里没有类型提示。

\`\`\`bash
npm i -D vite-plugin-dts
\`\`\`

\`\`\`js
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',          // 源码目录
      outDir: 'dist',            // 输出目录
      insertTypesEntry: true     // 自动生成 dist/index.d.ts 入口
    })
  ],
  build: {
    lib: { /* ... */ }
  }
})
\`\`\`

构建后会生成：

\`\`\`
dist/
├── index.js
├── index.d.ts          ← 类型声明
├── components/
│   └── Button.d.ts
└── ...
\`\`\`

---

## 发布到 npm

\`\`\`json
// package.json
{
  "name": "my-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/my-lib.cjs",        // CJS 入口
  "module": "./dist/my-lib.js",        // ESM 入口
  "types": "./dist/index.d.ts",        // 类型声明入口
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js"
    }
  },
  "files": ["dist"],                   // 只发布 dist 目录
  "sideEffects": ["**/*.css"],         // CSS 有副作用，别 tree-shake 掉
  "peerDependencies": {
    "react": ">=18"
  }
}
\`\`\`

发布流程：

\`\`\`bash
npm run build         # 构建
npm version patch     # 升版本号
npm publish           # 发布
\`\`\`

---

## 下一章

Library Mode 是写 npm 库的标配。下一章我们看 Vite 6 的重头戏——**Environment API**，理解它怎么把 Vite 从「前端构建工具」升级为「全栈构建框架」。`,
    code: `// 演示：模拟 Library Mode 的构建产物结构
console.log("📚 Vite Library Mode 构建模拟");
console.log("=====================================");

// 模拟 package.json
const pkg = {
  name: "my-ui-lib",
  version: "1.2.0",
  dependencies: { "lodash-es": "^4.17.21" },
  peerDependencies: { react: ">=18", "react-dom": ">=18" }
};

// 模拟 vite.config.js 中的 external 计算
const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies)
];

console.log("📦 库名:", pkg.name, "v" + pkg.version);
console.log("🚫 external（不打包进库）的依赖:");
external.forEach(dep => console.log("   -", dep));

// 模拟构建产物
console.log("\\n📁 构建产物 dist/:");
const distFiles = [
  { name: "my-ui-lib.js",        desc: "ES 模块（给现代打包器）" },
  { name: "my-ui-lib.cjs",       desc: "CommonJS（给 Node）" },
  { name: "my-ui-lib.umd.cjs",   desc: "UMD（给 <script> 标签）" },
  { name: "my-ui-lib.css",       desc: "样式文件" },
  { name: "index.d.ts",          desc: "TypeScript 类型声明" }
];
distFiles.forEach(f => {
  console.log(\`   ├── \${f.name.padEnd(22)} ← \${f.desc}\`);
});

// 模拟使用者的 imports
console.log("\\n💡 使用者代码：");
console.log("   import { Button } from 'my-ui-lib';        // 主入口");
console.log("   import { debounce } from 'my-ui-lib/utils'; // 子入口（按需加载）");
console.log("   import 'my-ui-lib/dist/my-ui-lib.css';      // 样式");`,
  },

  // =========================================================
  // 第五十六章：Environment API (Vite 6)
  // =========================================================
  {
    id: "vite2-ch56",
    group: "第十二部分 高级特性",
    icon: "🌐",
    title: "第五十六章 Environment API (Vite 6)",
    content: `## Vite 6 带来了什么

Vite 6（2024 年底发布）的标志性特性是 **Environment API**。它把 Vite 从「为浏览器服务的构建工具」升级为「**可以同时为多个运行环境服务**的构建框架」。

### 之前的问题

Vite 5 及之前，Vite 内置两个环境：
- **client**：浏览器（默认）
- **ssr**：Node.js 服务端渲染

但实际项目里运行环境越来越多：

| 环境 | 用途 |
|------|------|
| client | 浏览器 |
| ssr | Node.js SSR |
| worker | Web Worker / Service Worker |
| rsc | React Server Components（Node）|
| edge | Cloudflare Workers / Vercel Edge |

旧架构只有 client/ssr 两个槽位，加新环境要改 Vite 内部代码。Environment API 把这个能力开放出来，**任意环境都能自定义**。

---

## Environment API 核心概念

### 1. Environment 是什么

一个 Environment = 一组「模块怎么解析、怎么编译、运行在哪」的配置。每个环境有：

- \`name\`：环境名（client / ssr / worker ...）
- \`runner\`：模块执行器（怎么跑代码）
- \`hot\`：HMR 通道
- \`transform\`：编译管线

### 2. environments 配置

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  environments: {
    client: {
      // 浏览器环境（默认就有）
      define: { 'import.meta.env.SSR': false }
    },
    ssr: {
      // Node.js SSR 环境
      define: { 'import.meta.env.SSR': true }
    },
    worker: {
      // Web Worker 环境
      define: { 'import.meta.env.WORKER': true },
      build: { target: 'es2022' }
    }
  }
})
\`\`\`

### 3. 创建自定义 Environment

\`\`\`js
import { defineConfig, createEnvironment } from 'vite'

export default defineConfig({
  environments: {
    edge: {
      // 自定义一个 Edge 环境
      build: {
        target: 'es2022',
        rollupOptions: {
          external: ['node:fs']  // Edge 上没有 Node API
        }
      },
      runner: {
        // 自定义模块执行器（高级用法）
        canEvaluate: () => true
      }
    }
  }
})
\`\`\`

---

## dev / build 都能用

Environment API 同时覆盖开发和构建：

### 开发阶段

\`\`\`js
const env = server.environments.client
const mod = await env.runner.import('/src/App.tsx')
// 在 client 环境里执行这个模块
\`\`\`

\`server.environments\` 是一个 Map，里面有所有环境的实例。可以同时操作多个环境：

\`\`\`js
// 在 SSR 框架里，可能要同时跑 client + ssr
const clientMod = await server.environments.client.runner.import('/src/entry-client.tsx')
const ssrMod = await server.environments.ssr.runner.import('/src/entry-server.tsx')
\`\`\`

### 构建阶段

\`\`\`bash
vite build --ssr          # 只构建 ssr 环境
vite build --all          # 构建所有环境
\`\`\`

\`\`\`js
// vite.config.js
export default defineConfig({
  build: {
    // 可以分别为每个环境配置
    environments: {
      ssr: { outDir: 'dist/server' },
      client: { outDir: 'dist/client' }
    }
  }
})
\`\`\`

---

## 多环境典型场景

### 场景 1：SSR + CSR

React/Vue SSR 项目天然需要两个环境：
- \`client\`：跑在浏览器
- \`ssr\`：跑在 Node，渲染 HTML 字符串

### 场景 2：RSC（React Server Components）

React 19 的 RSC 架构需要三个环境：

\`\`\`js
environments: {
  client: { /* 浏览器组件 */ },
  ssr:    { /* SSR 渲染层 */ },
  rsc:    { /* React Server Components */ }
}
\`\`\`

### 场景 3：Web Worker

主线程跑 client，Worker 里跑计算密集任务：

\`\`\`js
environments: {
  client: { /* 主线程 */ },
  worker: {
    build: { target: 'es2022' }
  }
}
\`\`\`

代码里：

\`\`\`js
// 主线程
const worker = new Worker(new URL('./heavy.worker.js', import.meta.url), { type: 'module' })
worker.postMessage(data)
\`\`\`

---

## 插件适配

老的插件用 \`ssr\` 布尔值判断环境：

\`\`\`js
// 旧写法（Vite 5）
function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id, opts) {
      if (opts?.ssr) {
        // SSR 环境处理
      } else {
        // client 环境处理
      }
    }
  }
}
\`\`\`

Vite 6 推荐用 \`this.environment\`：

\`\`\`js
// 新写法（Vite 6）
function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      const env = this.environment
      // env.name 可以是 client / ssr / worker / 任意
      if (env.name === 'ssr') {
        // ...
      }
      // 也可以用 env.config 配置做判断
    }
  }
}
\`\`\`

旧的 \`opts.ssr\` 写法仍然兼容，但新插件推荐用 \`this.environment\`。

---

## 迁移指南

### 1. 升级到 Vite 6

\`\`\`bash
npm install vite@^6
\`\`\`

### 2. 检查 deprecated 警告

Vite 6 启动时会打印 deprecation 警告，告诉你哪些 API 即将移除。常见：

- \`server.ssrLoadModule\` → 用 \`server.environments.ssr.runner.import\`
- \`ssrLoadModule\` 仍可用，但推荐迁移

### 3. 框架集成

主流框架都已支持 Vite 6：
- **Nuxt 3.0+**：原生支持
- **SvelteKit 2.0+**：原生支持
- **Remix / Vike**：已迁移到 Environment API
- **Astro**：已支持

普通用户（用 React/Vue 写 SPA）基本无感，配置文件几乎不用改。

---

## 下一章

Environment API 是 Vite 6 的大杀器，让 Vite 能撑起更复杂的全栈架构。下一章我们换个方向——**WASM 与 WebAssembly**，看 Vite 怎么支持这门「接近原生速度」的技术。`,
    code: `// 演示：模拟 Environment API 的多环境管理
console.log("🌐 Vite 6 Environment API 模拟");
console.log("=====================================");

// 模拟 server.environments
const environments = {
  client: {
    name: "client",
    target: "browser",
    define: { "import.meta.env.SSR": false },
    async import(path) {
      console.log(\`   [client] 执行模块: \${path}\`);
      return { render: () => "浏览器渲染结果" };
    }
  },
  ssr: {
    name: "ssr",
    target: "node",
    define: { "import.meta.env.SSR": true },
    async import(path) {
      console.log(\`   [ssr] 执行模块: \${path}\`);
      return { renderToString: () => "<div>SSR HTML</div>" };
    }
  },
  worker: {
    name: "worker",
    target: "web-worker",
    define: { "import.meta.env.WORKER": true },
    async import(path) {
      console.log(\`   [worker] 执行模块: \${path}\`);
      return { compute: (n) => n * n };
    }
  }
};

// 同时操作多个环境
async function run() {
  console.log("\\n📦 已注册环境:", Object.keys(environments).join(", "));

  console.log("\\n1️⃣ 在 client 环境加载入口:");
  const clientMod = await environments.client.import("/src/entry-client.tsx");
  console.log("   → 拿到方法:", Object.keys(clientMod).join(", "));

  console.log("\\n2️⃣ 在 ssr 环境加载入口:");
  const ssrMod = await environments.ssr.import("/src/entry-server.tsx");
  console.log("   → 拿到方法:", Object.keys(ssrMod).join(", "));

  console.log("\\n3️⃣ 在 worker 环境加载计算模块:");
  const workerMod = await environments.worker.import("/src/heavy.worker.js");
  console.log("   → compute(9) =", workerMod.compute(9));
}

run();
console.log("\\n💡 Environment API 让 Vite 能同时管理多个运行环境");`,
  },

  // =========================================================
  // 第五十七章：WASM 与 WebAssembly
  // =========================================================
  {
    id: "vite2-ch57",
    group: "第十二部分 高级特性",
    icon: "🦀",
    title: "第五十七章 WASM 与 WebAssembly",
    content: `## 什么是 WebAssembly

**WebAssembly（WASM）** 是一种二进制指令格式，可以在浏览器里以**接近原生的速度**运行。它不是用来替代 JavaScript 的，而是**和 JS 互补**——计算密集型任务用 WASM，业务逻辑用 JS。

典型应用：
- 图像/视频处理（FFmpeg.wasm）
- 游戏（Unity、Unreal 编译为 WASM）
- 加密计算（RSA、AES）
- AI 推理（ONNX Runtime Web、TensorFlow.js WASM 后端）
- 复杂算法（PDF 渲染、SQL 解析）

这些场景 JS 慢，但 C/C++/Rust 快，编译成 WASM 就能在浏览器跑。

---

## Vite 对 WASM 的支持

Vite 内置 WASM 支持，不需要装插件。

### 基本用法：\`?init\` 后缀

\`\`\`js
// 默认导入：拿到初始化函数
import initWasm from './heavy.wasm?init'

const wasm = await initWasm()
console.log(wasm.add(1, 2))  // 调用 WASM 导出的函数
\`\`\`

\`?init\` 是 Vite 的约定，告诉 Vite 「这是一个 WASM 模块，请帮我处理加载」。\`initWasm\` 是个异步函数，调用后返回 WASM 实例。

### 默认导入（不带 ?init）

\`\`\`js
// Vite 也支持不加 ?init，直接 default import
import wasmModule from './heavy.wasm'

// wasmModule 是一个 WebAssembly.Module，需要自己 instantiate
const instance = await WebAssembly.instantiate(wasmModule, {})
console.log(instance.exports.add(1, 2))
\`\`\`

---

## 同步 vs 异步初始化

### 异步初始化（默认，推荐）

\`\`\`js
import initWasm from './heavy.wasm?init'

const wasm = await initWasm({
  // 可以传入导入对象（WASM 调用 JS 函数时用）
  env: {
    log: (ptr) => console.log('WASM 调用了 log', ptr)
  }
})
\`\`\`

### 同步初始化（不推荐）

\`\`\`js
import wasmModule from './heavy.wasm'

// 同步实例化（要求 WASM 没有外部依赖）
const instance = new WebAssembly.Instance(wasmModule)
console.log(instance.exports.add(1, 2))
\`\`\`

同步实例化**会阻塞主线程**，慎用。

---

## WASM 调用 JS 函数

WASM 默认不能直接调 JS，需要通过「导入对象」把 JS 函数传进去：

\`\`\`js
import initWasm from './lib.wasm?init'

const wasm = await initWasm({
  env: {
    // 这些函数会被 WASM 内部调用
    consoleLog: (value) => console.log('[WASM]', value),
    getRandom: () => Math.random()
  }
})

// 调用 WASM 导出的函数
wasm.doSomething()
\`\`\`

---

## 用 Rust 写 WASM

Rust 是写 WASM 最舒服的语言（工具链成熟、性能好、体积小）。

### 1. 装 Rust 工具链

\`\`\`bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
\`\`\`

### 2. 写 Rust 代码

\`\`\`rust
// src/lib.rs
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[no_mangle]
pub extern "C" fn fib(n: i32) -> i32 {
    if n < 2 { n } else { fib(n - 1) + fib(n - 2) }
}
\`\`\`

### 3. 编译为 WASM

\`\`\`bash
cargo build --target wasm32-unknown-unknown --release
\`\`\`

生成 \`target/wasm32-unknown-unknown/release/my_lib.wasm\`。

### 4. 在 Vite 项目里用

\`\`\`js
import initWasm from './my_lib.wasm?init'

const wasm = await initWasm()
console.log(wasm.add(3, 5))      // 8
console.log(wasm.fib(10))        // 55
\`\`\`

### 用 wasm-bindgen 更方便

\`\`\`bash
cargo install wasm-bindgen-cli
wasm-bindgen --target web target/wasm32-unknown-unknown/release/my_lib.wasm --out-dir pkg
\`\`\`

生成 \`pkg/my_lib.js\` + \`my_lib_bg.wasm\`，可以像普通 npm 包一样用：

\`\`\`js
import init, { add, fib } from './pkg/my_lib.js'

await init()
console.log(add(3, 5))
\`\`\`

---

## 用 C/C++ 写 WASM

\`\`\`bash
# 装 Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install latest && ./emsdk activate latest

# 编译
emcc fib.c -o fib.js -s WASM=1 -s EXPORTED_FUNCTIONS='["_fib"]'
\`\`\`

会生成 \`fib.js\` + \`fib.wasm\`，在 Vite 里 \`import\` 进来用。

---

## 性能对比：JS vs WASM

计算 \`fib(40)\` 这个递归函数：

\`\`\`js
// JS 版
function fibJs(n) {
  return n < 2 ? n : fibJs(n - 1) + fibJs(n - 2)
}
console.time('js')
fibJs(40)
console.timeEnd('js')   // ~1000ms

// WASM 版（Rust 编译）
console.time('wasm')
wasm.fib(40)
console.timeEnd('wasm') // ~400ms
\`\`\`

WASM 通常比 JS 快 2-3 倍（递归这种简单场景），复杂算法差距更大。但要注意：**WASM 加载有开销**，体积小的算法 JS 反而更快。只有计算量大、调用频繁的场景才值得用 WASM。

---

## 实际应用场景

| 场景 | 库 | 用 WASM 的原因 |
|------|-----|-----------------|
| 视频处理 | ffmpeg.wasm | C 版 ffmpeg 太复杂，JS 移植不可能 |
| PDF 渲染 | pdfium | Chrome 内部用的引擎，直接编译 |
| 图像压缩 | squoosh | MozJPEG / PNG 编码器都是 C |
| SQL 数据库 | sql.js | SQLite 编译为 WASM |
| 加密 | libsodium.js | 加密算法需要性能 |
| AI 推理 | onnxruntime-web | 模型推理计算密集 |

---

## 下一章

WASM 把 Vite 的能力延伸到了「接近原生的性能域」。下一章我们看一个更传统的场景——**多页应用 MPA**，多个 HTML 入口怎么用 Vite 管理。`,
    code: `// 演示：模拟 WASM 模块的加载和调用
console.log("🦀 Vite 加载 WASM 模块模拟");
console.log("=====================================");

// 模拟一个编译好的 WASM 模块（实际是 Rust/C 编译的二进制）
// 这里用纯 JS 模拟它的行为
const fakeWasmModule = {
  // 模拟 initWasm() 返回的实例
  exports: {
    add: (a, b) => a + b,
    fib: function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); },
    multiply: (a, b) => a * b
  }
};

// 模拟 Vite 的 ?init 导入
async function initWasm(imports = {}) {
  console.log("📥 加载 WASM 二进制...");
  console.log("   传入的 imports:", Object.keys(imports));
  await new Promise(r => setTimeout(r, 50));  // 模拟加载耗时
  console.log("✅ WASM 实例化完成\\n");
  return fakeWasmModule.exports;
}

// 测试性能
async function run() {
  const wasm = await initWasm({
    env: {
      consoleLog: (v) => console.log("  [WASM log]", v)
    }
  });

  console.log("调用 wasm.add(3, 5) =", wasm.add(3, 5));
  console.log("调用 wasm.multiply(7, 8) =", wasm.multiply(7, 8));

  // 性能对比
  console.log("\\n⏱️  fib(35) 性能对比:");
  
  const jsFib = function fib(n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); };
  const t1 = Date.now();
  jsFib(35);
  console.log("   JS:    ", (Date.now() - t1), "ms");

  const t2 = Date.now();
  wasm.fib(35);
  console.log("   WASM:  ", (Date.now() - t2), "ms (模拟值，实际更快)");
}

run();`,
  },

  // =========================================================
  // 第五十八章：多页应用 MPA
  // =========================================================
  {
    id: "vite2-ch58",
    group: "第十二部分 高级特性",
    icon: "📑",
    title: "第五十八章 多页应用 MPA",
    content: `## SPA vs MPA

### SPA（单页应用）

只有一个 \`index.html\`，所有路由在浏览器里用 JS 处理。

- ✅ 切换页面无刷新，体验流畅
- ✅ 路由逻辑全在 JS，灵活
- ❌ 首屏慢（要加载整个 SPA bundle）
- ❌ SEO 差（爬虫看不到内容，需要 SSR/SSG 补救）

### MPA（多页应用）

每个页面一个独立的 HTML 文件，页面跳转走浏览器原生导航。

- ✅ 首屏快（每个页面只加载自己的资源）
- ✅ SEO 好（HTML 直接有内容）
- ❌ 页面切换有刷新
- ❌ 公共状态需要靠 cookie/localStorage

| 场景 | 推荐 |
|------|------|
| 后台管理系统 | SPA |
| 营销官网、博客 | MPA 或 SSG |
| 电商首页 | MPA（首屏速度关键）|
| 文档站 | MPA 或 SSG |
| 混合（首页 MPA + 应用 SPA）| MPA |

---

## Vite 的 MPA 支持

Vite 通过 \`rollupOptions.input\` 配置多入口。

### 项目结构

\`\`\`
my-app/
├── index.html              # 首页
├── about.html              # 关于页
├── contact.html            # 联系页
├── src/
│   ├── pages/
│   │   ├── home/
│   │   │   ├── main.js     # 首页入口
│   │   │   └── Home.vue
│   │   ├── about/
│   │   │   ├── main.js     # 关于页入口
│   │   │   └── About.vue
│   │   └── contact/
│   │       ├── main.js     # 联系页入口
│   │       └── Contact.vue
│   └── components/         # 公共组件
└── vite.config.js
\`\`\`

### 配置 vite.config.js

\`\`\`js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 每个入口对应一个 HTML 文件
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
})
\`\`\`

---

## 每个 HTML 文件的写法

\`\`\`html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>首页</title>
</head>
<body>
  <nav>
    <a href="/">首页</a>
    <a href="/about.html">关于</a>
    <a href="/contact.html">联系</a>
  </nav>
  <div id="app"></div>
  <script type="module" src="/src/pages/home/main.js"></script>
</body>
</html>
\`\`\`

\`\`\`html
<!-- about.html -->
<!DOCTYPE html>
<html>
<head>
  <title>关于我们</title>
</head>
<body>
  <nav>
    <a href="/">首页</a>
    <a href="/about.html">关于</a>
    <a href="/contact.html">联系</a>
  </nav>
  <div id="app"></div>
  <script type="module" src="/src/pages/about/main.js"></script>
</body>
</html>
\`\`\`

每个 HTML 都指向自己专属的 JS 入口。

---

## 开发时的访问

- \`http://localhost:5173/\` → 首页
- \`http://localhost:5173/about.html\` → 关于页
- \`http://localhost:5173/contact.html\` → 联系页

Vite dev server 会自动识别多 HTML 入口。

---

## 公共模块提取

多个页面共享的代码（如 Vue、组件库）会被 Rollup **自动提取到公共 chunk**：

\`\`\`
dist/
├── index.html
├── about.html
├── contact.html
├── assets/
│   ├── index-[hash].js           # 首页专属代码
│   ├── about-[hash].js           # 关于页专属代码
│   ├── contact-[hash].js         # 联系页专属代码
│   └── vendor-[hash].js          # 公共依赖（vue 等）
\`\`\`

### 手动控制分包

\`\`\`js
build: {
  rollupOptions: {
    input: { /* 多入口 */ },
    output: {
      manualChunks: {
        'vue-vendor': ['vue', 'vue-router'],
        'ui-vendor': ['element-plus']
      }
    }
  }
}
\`\`\`

---

## 自动扫描 HTML 入口

页面多了手写 \`input\` 太麻烦，可以用 glob 自动扫描：

\`\`\`js
import { defineConfig } from 'vite'
import { resolve } from 'path'
import glob from 'glob'

const pages = glob.sync('*.html').reduce((acc, file) => {
  const name = file.replace('.html', '')
  acc[name === 'index' ? 'main' : name] = resolve(__dirname, file)
  return acc
}, {})

export default defineConfig({
  build: {
    rollupOptions: { input: pages }
  }
})
\`\`\`

把所有 \`*.html\` 自动注册为入口。

---

## 子目录结构的 MPA

页面多的时候，把每个页面放进独立子目录更清晰：

\`\`\`
my-app/
├── pages/
│   ├── home/index.html
│   ├── about/index.html
│   └── contact/index.html
\`\`\`

\`\`\`js
build: {
  rollupOptions: {
    input: {
      home: resolve(__dirname, 'pages/home/index.html'),
      about: resolve(__dirname, 'pages/about/index.html'),
      contact: resolve(__dirname, 'pages/contact/index.html')
    }
  }
}
\`\`\`

访问 \`/\` 重定向到 \`/pages/home/\`：

\`\`\`js
// vite.config.js
server: {
  rewrite: (path) => {
    if (path === '/') return '/pages/home/'
    return path
  }
}
\`\`\`

---

## 公共导航 / 布局

MPA 每个页面都是独立 HTML，公共部分（导航、页脚）怎么复用？

### 方案 1：组件里渲染

每个页面的入口 JS 都渲染同一个 \`<Nav />\` 组件：

\`\`\`js
// 每个页面 main.js 都这样写
import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')

// App.vue 里包含 <Nav /> + <PageContent />
\`\`\`

### 方案 2：构建时注入（vite-plugin-html）

\`\`\`bash
npm i -D vite-plugin-html
\`\`\`

\`\`\`js
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      pages: [
        { filename: 'index.html', template: 'src/templates/main.html' },
        { filename: 'about.html', template: 'src/templates/main.html' }
      ],
      inject: {
        data: {
          title: '我的网站',
          nav: '<nav>...</nav>'
        }
      }
    })
  ]
})
\`\`\`

模板里用 EJS 语法：

\`\`\`html
<!-- src/templates/main.html -->
<!DOCTYPE html>
<html>
<head><title><%- title %></title></head>
<body>
  <%- nav %>
  <div id="app"></div>
</body>
</html>
\`\`\`

---

## MPA 路由

MPA 路由就是浏览器原生 URL 跳转：

- \`/index.html\` 或 \`/\` → 首页
- \`/about.html\` 或 \`/about/\` → 关于页

跳转用 \`<a href>\` 或 \`location.href = '/about.html'\`。

如果想要漂亮的 URL（\`/about\` 而不是 \`/about.html\`），部署时用 Nginx \`try_files\` 重写（见下一章）。

---

## 何时选 MPA

| 情况 | 选 MPA |
|------|--------|
| 内容站（博客、文档、营销页）| ✅ |
| 首屏速度是核心 KPI | ✅ |
| 需要好 SEO 但不想做 SSR | ✅ |
| 后台管理系统 | ❌（选 SPA）|
| 交互密集型应用 | ❌（选 SPA）|

也可以**混合**：首页用 MPA（首屏快），点进后台用 SPA。

---

## 下一章

MPA 讲完了。下一章进入部署主题——最经典的 **Nginx 部署**，看看怎么把 \`dist/\` 托管到生产服务器。`,
    code: `// 演示：模拟 MPA 的多入口构建
console.log("📑 Vite MPA 多入口构建模拟");
console.log("=====================================");

// 模拟项目结构
const projectStructure = {
  "index.html": "/src/pages/home/main.js",
  "about.html": "/src/pages/about/main.js",
  "contact.html": "/src/pages/contact/main.js",
  "blog.html": "/src/pages/blog/main.js"
};

// 模拟 rollupOptions.input
console.log("📋 配置的入口:");
const input = {};
for (const [html, js] of Object.entries(projectStructure)) {
  const name = html.replace('.html', '');
  input[name === 'index' ? 'main' : name] = html;
  console.log(\`   \${html.padEnd(15)} → \${js}\`);
}

// 模拟构建产物
console.log("\\n📁 构建产物 dist/:");
const distFiles = [
  { name: "index.html",         size: "0.5 kB", desc: "首页 HTML" },
  { name: "about.html",         size: "0.5 kB", desc: "关于页 HTML" },
  { name: "contact.html",       size: "0.5 kB", desc: "联系页 HTML" },
  { name: "blog.html",          size: "0.5 kB", desc: "博客页 HTML" },
  { name: "assets/home-[hash].js",    size: "12 kB", desc: "首页专属代码" },
  { name: "assets/about-[hash].js",   size: "8 kB",  desc: "关于页专属代码" },
  { name: "assets/contact-[hash].js", size: "10 kB", desc: "联系页专属代码" },
  { name: "assets/blog-[hash].js",    size: "20 kB", desc: "博客页专属代码" },
  { name: "assets/vendor-[hash].js",  size: "140 kB", desc: "公共依赖（vue 等）" }
];

distFiles.forEach((f, i) => {
  const prefix = i === distFiles.length - 1 ? "└──" : "├──";
  console.log(\`   \${prefix} \${f.name.padEnd(28)} \${f.size.padStart(8)}  \${f.desc}\`);
});

console.log("\\n💡 4 个页面各自独立，但共享 vendor chunk");
console.log("💡 浏览器跳转: / → /about.html → /contact.html");`,
  },

  // =========================================================
  // 第五十九章：Nginx 部署
  // =========================================================
  {
    id: "vite2-ch59",
    group: "第十三部分 部署",
    icon: "🚀",
    title: "第五十九章 Nginx 部署",
    content: `## 为什么是 Nginx

\`vite build\` 产出的 \`dist/\` 是一堆静态文件，部署就是找个 HTTP 服务器托管它。Nginx 是最常见的选择：

- **性能极高**：C 写的，单机扛几万并发没压力
- **配置简单**：一个 \`nginx.conf\` 搞定
- **功能全面**：静态托管、HTTPS、反向代理、负载均衡、gzip、缓存
- **稳定**：跑几年不重启很常见

几乎所有 Linux 服务器都装了 Nginx。

---

## 最简配置：静态托管

把 \`dist/\` 上传到服务器，比如 \`/var/www/my-app/\`：

\`\`\`nginx
# /etc/nginx/conf.d/my-app.conf
server {
    listen 80;
    server_name example.com;
    root /var/www/my-app;
    index index.html;
}
\`\`\`

重载 Nginx：

\`\`\`bash
sudo nginx -t          # 检查配置语法
sudo nginx -s reload   # 重载配置
\`\`\`

访问 \`http://example.com\` 就能看到你的网站。

---

## SPA 的 try_files

SPA 只有一个 \`index.html\`，但用户可能直接访问 \`/users/123\` 这种路由。Nginx 默认会去找 \`/users/123\` 这个文件，找不到就 404。

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/my-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        # 依次尝试：具体文件 → 目录 → 兜底返回 index.html
    }
}
\`\`\`

这样 \`/users/123\` 会返回 \`index.html\`，由前端路由接管。

### MPA 的 try_files

\`\`\`nginx
location / {
    try_files $uri $uri/ $uri.html /index.html;
    # 多了 $uri.html：/about 自动找 about.html
}
\`\`\`

---

## gzip 压缩

开启 gzip 能把 JS/CSS 压缩 70%+，对首屏速度影响巨大：

\`\`\`nginx
server {
    # ... 其他配置

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
               application/xml text/xml application/xml+rss text/javascript
               application/wasm image/svg+xml;
    gzip_comp_level 6;
}
\`\`\`

效果：\`index.js\` 1MB → gzip 后 300KB，传输快 3 倍。

### 已经有 .br / .gz 预压缩文件？

Vite 可以让构建时预先生成 \`.gz\` / \`.br\` 文件：

\`\`\`bash
npm i -D vite-plugin-compression
\`\`\`

\`\`\`js
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress' })
  ]
})
\`\`\`

Nginx 直接用预压缩文件（不用实时压缩，CPU 省了）：

\`\`\`nginx
gzip_static on;        # 优先用 .gz 文件
brotli_static on;      # 优先用 .br 文件（需要 ngx_brotli 模块）
\`\`\`

---

## 缓存策略

Vite 构建产物有两类文件，缓存策略不同：

| 文件 | 文件名 | 缓存策略 |
|------|--------|----------|
| \`index.html\` | 不变 | **不缓存**（或短缓存）|
| \`assets/index-[hash].js\` | 带 hash | **永久缓存**（1 年）|
| \`assets/logo-[hash].png\` | 带 hash | **永久缓存** |

配置：

\`\`\`nginx
server {
    root /var/www/my-app;

    # HTML 不缓存，每次都拉最新的（拉到新的 index.html 才会引用新的 hash 文件）
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 带 hash 的资源永久缓存
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
\`\`\`

**为什么这样设计**：文件名带 hash，内容变了 hash 就变，URL 也变，浏览器会重新请求。所以可以放心永久缓存。

---

## HTTPS 配置

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/my-app;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP 强制跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
\`\`\`

### 用 Let's Encrypt 免费证书

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
# 自动修改 nginx.conf 并续期
\`\`\`

---

## 反向代理 API

前端经常需要把 \`/api\` 转发到后端服务：

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    # 静态资源
    location / {
        root /var/www/my-app;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到 Node 后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理
    location /ws/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
\`\`\`

---

## 性能优化

### HTTP/2

\`\`\`nginx
listen 443 ssl http2;   # 启用 HTTP/2，多路复用
\`\`\`

### Brotli 压缩（比 gzip 更狠）

需要装 \`ngx_brotli\` 模块：

\`\`\`nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json image/svg+xml;
\`\`\`

### 静态资源防盗链

\`\`\`nginx
location /assets/ {
    valid_referers none blocked example.com *.example.com;
    if ($invalid_referer) {
        return 403;
    }
}
\`\`\`

### 限流

\`\`\`nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20;
    proxy_pass http://127.0.0.1:3000;
}
\`\`\`

---

## 完整生产配置示例

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/my-app;
    index index.html;

    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
               application/xml text/xml text/javascript image/svg+xml;

    # 带 hash 的资源永久缓存
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # HTML 不缓存
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA 路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

---

## 部署流程

\`\`\`bash
# 1. 本地构建
npm run build

# 2. 上传 dist/ 到服务器
rsync -avz --delete dist/ user@example.com:/var/www/my-app/

# 3. 服务器上 reload nginx（一般不用，因为只是换了文件）
# 如果改了 nginx.conf：
ssh user@example.com "sudo nginx -t && sudo nginx -s reload"
\`\`\`

可以用脚本/CI 自动化，详见下一章。

---

## 下一章

Nginx 是「自己有服务器」的部署方案。下一章看 **Vercel / Netlify**——零配置、一键部署、不用自己运维服务器的「现代化部署」。`,
    code: `// 演示：模拟 Nginx 处理请求的过程
console.log("🚀 Nginx 处理请求模拟");
console.log("=====================================");

// 模拟 nginx.conf 配置
const nginxConfig = {
  root: "/var/www/my-app",
  routes: [
    { location: "/",           type: "spa",       handler: "try_files $uri $uri/ /index.html" },
    { location: "/assets/",    type: "static",    cache: "1 year immutable" },
    { location: "= /index.html", type: "html",    cache: "no-cache" },
    { location: "/api/",       type: "proxy",     target: "http://127.0.0.1:3000" },
    { location: "/ws/",        type: "websocket", target: "http://127.0.0.1:3000" }
  ],
  gzip: true,
  https: true
};

// 模拟几个请求
const requests = [
  { method: "GET", url: "/" },
  { method: "GET", url: "/assets/index-a1b2c3d4.js" },
  { method: "GET", url: "/users/123" },
  { method: "GET", url: "/api/products" },
  { method: "GET", url: "/index.html" }
];

function handleRequest(req) {
  console.log(\`\\n📥 \${req.method} \${req.url}\`);
  
  // 匹配 location
  for (const route of nginxConfig.routes) {
    let matched = false;
    if (route.location === "/" && req.url === "/") matched = true;
    else if (route.location.startsWith("=") && req.url === route.location.split(" ")[1]) matched = true;
    else if (route.location.endsWith("/") && req.url.startsWith(route.location)) matched = true;

    if (matched) {
      console.log(\`   匹配: \${route.location}\`);
      console.log(\`   类型: \${route.type}\`);
      if (route.cache) console.log(\`   缓存: \${route.cache}\`);
      if (route.handler) console.log(\`   处理: \${route.handler}\`);
      if (route.target) console.log(\`   代理到: \${route.target}\`);
      return;
    }
  }
}

requests.forEach(handleRequest);

console.log("\\n=====================================");
console.log("💡 /assets/ 永久缓存（文件名带 hash）");
console.log("💡 /index.html 不缓存，保证拿到最新引用");
console.log("💡 /api/ 反向代理到后端服务");`,
  },

  // =========================================================
  // 第六十章：Vercel / Netlify
  // =========================================================
  {
    id: "vite2-ch60",
    group: "第十三部分 部署",
    icon: "☁️",
    title: "第六十章 Vercel / Netlify",
    content: `## 为什么用 Vercel / Netlify

上一章讲的 Nginx 部署需要自己有服务器、自己配 Nginx、自己处理 HTTPS 和 CDN。**Vercel / Netlify** 把这些都自动化了：

- **零配置**：连 GitHub 仓库后自动识别 Vite 项目
- **自动 HTTPS**：Let's Encrypt 证书自动签发和续期
- **全球 CDN**：边缘节点加速，用户访问最近的节点
- **预览部署**：每个 PR 自动生成一个预览 URL
- **自动部署**：push 到 main 自动上线
- **免费额度**：个人项目够用

Vercel 是 Next.js 母公司，Netlify 是老牌静态托管平台。两者对 Vite 项目都完美支持。

---

## Vercel 部署

### 方式 1：通过网页（最简单）

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点 \`New Project\` → 选你的仓库
3. Vercel 自动识别为 Vite 项目，直接点 \`Deploy\`
4. 等 1 分钟，部署完成，给你一个 \`xxx.vercel.app\` 的 URL

整个过程**不用写任何配置**。

### 方式 2：vercel.json 自定义配置

\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
\`\`\`

字段说明：

| 字段 | 作用 |
|------|------|
| \`buildCommand\` | 构建命令，默认 \`vite build\` |
| \`outputDirectory\` | 输出目录，默认 \`dist\` |
| \`framework\` | 框架，Vercel 会自动检测，也可手动指定 |
| \`rewrites\` | URL 重写规则，SPA 必备 |
| \`headers\` | 自定义响应头（缓存、CORS 等）|
| \`redirects\` | 301/302 重定向 |

### 方式 3：Vercel CLI

\`\`\`bash
npm i -g vercel

cd my-app
vercel              # 部署预览环境
vercel --prod       # 部署生产环境
\`\`\`

---

## Netlify 部署

### 方式 1：通过网页

1. 打开 [netlify.com](https://netlify.com)，用 GitHub 登录
2. \`Add new site\` → \`Import an existing project\`
3. 选仓库，Netlify 自动识别 Vite，自动填好构建命令和输出目录
4. 点 \`Deploy\`

### 方式 2：netlify.toml

在项目根目录创建 \`netlify.toml\`：

\`\`\`tomm
[build]
  command = "npm run build"
  publish = "dist"

# SPA 路由回退
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 带 hash 的资源永久缓存
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
\`\`\`

> 注意是 \`toml\` 格式，不是 JSON。语法略不同。

### 方式 3：Netlify CLI

\`\`\`bash
npm i -g netlify-cli

cd my-app
netlify deploy              # 预览部署
netlify deploy --prod       # 生产部署
\`\`\`

---

## 环境变量

### Vercel

网页：项目设置 → Environment Variables
命令行：

\`\`\`bash
vercel env add VITE_API_URL
vercel env pull         # 拉到本地 .env
\`\`\`

### Netlify

网页：Site settings → Environment variables
\`netlify.toml\` 里也能定义：

\`\`\`toml
[build.environment]
  VITE_API_URL = "https://api.example.com"
  NODE_VERSION = "20"
\`\`\`

代码里访问：

\`\`\`js
const apiUrl = import.meta.env.VITE_API_URL
\`\`\`

---

## 自定义域名

### Vercel

1. 项目设置 → Domains → Add Domain
2. 输入 \`example.com\`
3. 按提示去域名商那里加 CNAME 记录：\`@ → cname.vercel-dns.com\`
4. Vercel 自动签发 HTTPS 证书，1-2 分钟生效

### Netlify

1. Site settings → Domain management → Add custom domain
2. 加 CNAME 记录：\`example.com → xxx.netlify.app\`
3. Netlify 自动启用 HTTPS

两者都支持 \`www\` 自动重定向到主域名（或反过来）。

---

## 重定向规则

### Vercel rewrites vs redirects

\`\`\`json
{
  "rewrites": [
    { "source": "/old-path", "destination": "/new-path" }
  ],
  "redirects": [
    { "source": "/legacy", "destination": "/new", "permanent": true }
  ]
}
\`\`\`

- \`rewrites\`：URL 不变，但实际返回另一个内容（透明转发）
- \`redirects\`：浏览器 URL 变成新的（HTTP 301/302）

### Netlify

\`\`\`toml
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301          # 301 永久重定向，302 临时

# SPA 回退（status = 200 表示 rewrite）
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

---

## Edge Functions

两者都支持 Edge Functions（在 CDN 边缘节点跑的轻量函数）。

### Vercel Edge Functions

\`\`\`ts
// api/geo.ts
export const config = { runtime: 'edge' }

export default function handler(req: Request) {
  const country = req.headers.get('x-vercel-ip-country')
  return new Response(\`Hello from \${country}\`)
}
\`\`\`

访问 \`/api/geo\` 就能在全球最近的边缘节点执行，延迟极低。

### Netlify Edge Functions

\`\`\`ts
// netlify/edge-functions/hello.ts
export default async (request: Request) => {
  return new Response('Hello from the edge', { status: 200 })
}

export const config = { path: '/api/hello' }
\`\`\`

Edge Functions 适合：
- A/B 测试
- 地理位置相关逻辑
- 轻量 API（不需要数据库长连接）
- 鉴权拦截

---

## 预览部署

### Vercel

每个 PR 自动生成预览 URL：\`pr-123-xxx.vercel.app\`。团队成员可以在 PR 里直接点开看效果。

### Netlify

每个 PR 自动生成 \`deploy-preview-123--xxx.netlify.app\`。

---

## Vercel vs Netlify 对比

| 维度 | Vercel | Netlify |
|------|--------|---------|
| Vite 支持 | ✅ 原生识别 | ✅ 原生识别 |
| 免费额度 | 100GB 流量/月 | 100GB 流量/月 |
| Edge Functions | ✅ | ✅ |
| Serverless Functions | ✅ Node/Go/Python | ✅ Node/Go/Rust |
| 预览部署 | ✅ | ✅ |
| 国内访问速度 | 一般（无大陆节点）| 一般 |
| 适合人群 | Next.js 用户、React 生态 | 静态站、Jamstack |

> 国内访问速度问题：两者大陆访问都不算快，需要国内业务可考虑 Cloudflare Pages、阿里云 OSS+CDN。

---

## 完整 vercel.json 示例

\`\`\`json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "redirects": [
    { "source": "/old-home", "destination": "/", "permanent": true }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
\`\`\`

---

## 下一章

Vercel / Netlify 适合不想自己运维的团队。但有些企业必须私有部署，这时候 **Docker** 就是最优解。下一章看怎么用 Docker 把 Vite 应用打包成镜像。`,
    code: `// 演示：模拟 Vercel/Netlify 的部署流程
console.log("☁️ Vercel / Netlify 部署模拟");
console.log("=====================================");

// 模拟 vercel.json 配置
const vercelConfig = {
  framework: "vite",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  rewrites: [{ source: "/(.*)", destination: "/index.html" }],
  headers: [
    { source: "/assets/(.*)", "Cache-Control": "max-age=31536000, immutable" }
  ]
};

// 模拟部署流程
console.log("📋 vercel.json 配置:");
console.log("   framework:", vercelConfig.framework);
console.log("   buildCommand:", vercelConfig.buildCommand);
console.log("   outputDirectory:", vercelConfig.outputDirectory);
console.log("   rewrites:", vercelConfig.rewrites.length, "条规则");

// 模拟部署步骤
console.log("\\n🚀 部署流程:");
const steps = [
  { step: "1", action: "git push origin main",           result: "触发自动部署" },
  { step: "2", action: "npm ci",                          result: "安装依赖（约 30s）" },
  { step: "3", action: "npm run build",                   result: "构建 dist/（约 20s）" },
  { step: "4", action: "upload to CDN edge nodes",        result: "上传到全球 CDN" },
  { step: "5", action: "issue SSL certificate",           result: "自动签发 HTTPS 证书" },
  { step: "6", action: "deploy to production",            result: "上线 https://my-app.vercel.app" }
];

steps.forEach(s => {
  console.log(\`   [\${s.step}] \${s.action}\`);
  console.log(\`       → \${s.result}\`);
});

// 模拟预览部署
console.log("\\n🌿 预览部署（每个 PR 自动生成）:");
const prs = [
  { pr: 42, branch: "feature/login", url: "pr-42-my-app.vercel.app" },
  { pr: 43, branch: "fix/header",   url: "pr-43-my-app.vercel.app" }
];
prs.forEach(pr => {
  console.log(\`   PR #\${pr.pr} (\${pr.branch}) → https://\${pr.url}\`);
});

console.log("\\n💡 全程零配置，git push 即上线");`,
  },

  // =========================================================
  // 第六十一章：Docker 部署
  // =========================================================
  {
    id: "vite2-ch61",
    group: "第十三部分 部署",
    icon: "🐳",
    title: "第六十一章 Docker 部署",
    content: `## 为什么用 Docker

Nginx 部署要在服务器上手动同步文件、配 nginx.conf、装依赖，环境一变就要重做。**Docker** 把「应用 + Nginx 配置 + 依赖」打包成一个**镜像**，任何机器装了 Docker 就能跑：

- **环境一致**：开发、测试、生产环境完全一样
- **一键部署**：\`docker run\` 启动，不用手动配
- **易扩展**：K8s 里几行配置就能水平扩展
- **回滚方便**：版本化的镜像，回滚切 tag 即可
- **CI/CD 友好**：构建镜像、推 registry、服务器 pull，全自动

---

## 最简 Dockerfile

\`\`\`dockerfile
# 阶段 1：构建
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 2：托管
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

这是一个**多阶段构建**：
- 第一阶段用 \`node:20-alpine\` 镜像构建 \`dist/\`
- 第二阶段用 \`nginx:alpine\` 托管，只复制 \`dist/\` 和 nginx 配置

最终镜像只有 Nginx + 静态文件，**几十 MB**，不带 Node、不带 node_modules。

---

## 多阶段构建详解

### 为什么分阶段

如果只用一个阶段：

\`\`\`dockerfile
# ❌ 单阶段（不推荐）
FROM node:20
COPY . .
RUN npm ci && npm run build
# 现在镜像里有 node_modules、源码、dist，体积 1GB+
\`\`\`

最终镜像包含了开发依赖、源码等生产不需要的东西，又大又不安全。

多阶段构建只把需要的产物复制到最终镜像，**最终镜像极小**。

### 阶段图解

\`\`\`
[阶段1: node:20-alpine]  →  [阶段2: nginx:alpine]
   npm ci                     COPY --from=阶段1 dist/
   npm run build              COPY nginx.conf
   生成 dist/                  最终镜像：~30MB
   （这个镜像有 500MB+，但被丢弃）
\`\`\`

---

## node:alpine vs node:slim vs node

| 镜像 | 体积 | 适用 |
|------|------|------|
| \`node:20\` | ~1GB | 完整 Debian，体积大，不推荐生产 |
| \`node:20-slim\` | ~250MB | 精简 Debian，够用 |
| \`node:20-alpine\` | ~150MB | Alpine Linux，最小，最推荐 |

Alpine 用 musl libc 而不是 glibc，某些 native 模块可能要重新编译。遇到问题再用 slim。

---

## nginx.conf 配置

在项目根目录创建 \`nginx.conf\`：

\`\`\`nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               application/xml text/javascript image/svg+xml;

    # SPA 路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 带 hash 的资源永久缓存
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # HTML 不缓存
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
\`\`\`

---

## .dockerignore

避免把 \`node_modules\`、\`.git\` 等无关文件复制进镜像：

\`\`\`
node_modules
dist
.git
.gitignore
npm-debug.log
Dockerfile
.dockerignore
.env*
.vscode
.idea
\`\`\`

特别重要：**不写 .dockerignore 会把本地 node_modules 复制进镜像**，覆盖容器里 \`npm ci\` 装的，可能导致平台不兼容（比如 Mac 上装的 node_modules 不能在 Linux 镜像里跑）。

---

## 构建与运行

\`\`\`bash
# 构建镜像
docker build -t my-app:1.0.0 .

# 运行容器（端口映射 8080 → 80）
docker run -d -p 8080:80 --name my-app my-app:1.0.0

# 访问
curl http://localhost:8080

# 查看日志
docker logs my-app

# 停止/删除
docker stop my-app
docker rm my-app
\`\`\`

---

## docker-compose

复杂场景用 \`docker-compose.yml\` 管理多个容器：

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/"]
      interval: 30s
      timeout: 5s
      retries: 3

  api:
    image: my-api:1.0.0
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
\`\`\`

启动：

\`\`\`bash
docker-compose up -d         # 后台启动所有服务
docker-compose logs -f web   # 看某个服务日志
docker-compose down          # 停止并删除
\`\`\`

---

## 健康检查

\`\`\`dockerfile
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget --spider -q http://localhost/ || exit 1
\`\`\`

Docker 会定期执行这个命令，失败就标记为 unhealthy，编排系统（K8s、Swarm）会自动重启或摘除流量。

---

## 镜像优化

### 1. 用 alpine 基础镜像

\`\`\`dockerfile
FROM nginx:alpine     # 而不是 nginx:latest
\`\`\`

\`nginx:alpine\` ~50MB，\`nginx:latest\` ~150MB。

### 2. 合并 RUN 指令

\`\`\`dockerfile
# ❌ 慢（每条 RUN 一层）
RUN npm ci
RUN npm run build

# ✅ 快（一条 RUN，一层）
RUN npm ci && npm run build
\`\`\`

### 3. 利用缓存：先 COPY package.json

\`\`\`dockerfile
# 先复制 package.json，npm ci 这一层会被缓存
COPY package*.json ./
RUN npm ci

# 再复制源码（源码常变，但 npm ci 那层不失效）
COPY . .
RUN npm run build
\`\`\`

改业务代码重新构建时，\`npm ci\` 那层用缓存，几秒就能构建完。

### 4. 多阶段构建（前面已讲）

---

## CI/CD 集成

### GitHub Actions 示例

\`\`\`yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            myuser/my-app:latest
            myuser/my-app:\${{ github.sha }}
\`\`\`

push 到 main → 自动构建镜像 → 推到 Docker Hub → 服务器 \`docker pull\` + 重启。

### 服务器自动更新

\`\`\`bash
# 服务器上
docker pull myuser/my-app:latest
docker stop my-app && docker rm my-app
docker run -d -p 80:80 --name my-app --restart unless-stopped myuser/my-app:latest
\`\`\`

用脚本或 Watchtower 自动化。

---

## 完整生产 Dockerfile

\`\`\`dockerfile
# ===== 阶段 1: 构建 =====
FROM node:20-alpine AS build
WORKDIR /app

# 利用缓存：先装依赖
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ===== 阶段 2: 运行 =====
FROM nginx:alpine

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget --spider -q http://localhost/ || exit 1

# 暴露端口
EXPOSE 80

# 启动
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

---

## 三种部署方式对比

| 方式 | 适合 | 优点 | 缺点 |
|------|------|------|------|
| Nginx 直部署 | 简单站、个人项目 | 配置灵活、性能极致 | 要自己运维服务器 |
| Vercel/Netlify | 团队、中小项目 | 零配置、自动 HTTPS、CDN | 国内访问慢、依赖第三方 |
| Docker | 企业、K8s、复杂架构 | 环境一致、易扩展、CI/CD 友好 | 有一定学习成本 |

实际项目里三者经常**混用**：Docker 打包镜像 → K8s 编排 → Ingress 做 Nginx 的活。

---

## 部署部分小结

到这里，Vite 应用的「构建 → 部署」全链路就讲完了：
- 第五十九章：自建服务器 + Nginx
- 第六十章：托管平台 Vercel/Netlify
- 第六十一章：Docker 容器化

选择哪种取决于团队规模、运维能力和业务需求。

---

## 下一章

部署部分结束，下一批章节进入**实战项目**——把前面学的所有知识用完整项目串起来。`,
    code: `// 演示：模拟 Docker 多阶段构建过程
console.log("🐳 Docker 多阶段构建模拟");
console.log("=====================================");

// 模拟阶段 1：构建
console.log("\\n📦 阶段 1: node:20-alpine (构建)");
console.log("-------------------------------------");
const stage1 = {
  base: "node:20-alpine",
  size: "~150 MB",
  steps: [
    "WORKDIR /app",
    "COPY package*.json ./",
    "RUN npm ci                  # 安装依赖（利用缓存）",
    "COPY . .                    # 复制源码",
    "RUN npm run build           # 构建 dist/"
  ]
};
console.log("基础镜像:", stage1.base, "(" + stage1.size + ")");
stage1.steps.forEach(s => console.log("  " + s));
console.log("产物: /app/dist/ (静态文件)");

// 模拟阶段 2：运行
console.log("\\n📦 阶段 2: nginx:alpine (运行)");
console.log("-------------------------------------");
const stage2 = {
  base: "nginx:alpine",
  size: "~50 MB",
  steps: [
    "COPY --from=build /app/dist /usr/share/nginx/html",
    "COPY nginx.conf /etc/nginx/conf.d/default.conf",
    "HEALTHCHECK ...",
    "EXPOSE 80",
    "CMD ['nginx', '-g', 'daemon off;']"
  ]
};
console.log("基础镜像:", stage2.base, "(" + stage2.size + ")");
stage2.steps.forEach(s => console.log("  " + s));

// 模拟构建命令
console.log("\\n🔨 构建和运行:");
const commands = [
  { cmd: "docker build -t my-app:1.0.0 .",   desc: "构建镜像" },
  { cmd: "docker images my-app",              desc: "查看镜像大小" },
  { cmd: "docker run -d -p 8080:80 my-app:1.0.0", desc: "运行容器" },
  { cmd: "curl http://localhost:8080",         desc: "访问验证" }
];
commands.forEach(c => {
  console.log("  $ " + c.cmd);
  console.log("    → " + c.desc);
});

console.log("\\n=====================================");
console.log("✅ 最终镜像只含 nginx + dist/，约 30-50 MB");
console.log("💡 多阶段构建：构建阶段的 500MB+ 镜像被丢弃");`,
  },
];
