// =============================================================
// Vite 大全集（终极版）—— 第2批章节
// 第二部分 核心概念 + 第三部分 配置详解（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   vite2-ch08 : 第八章 依赖预构建（esbuild）
//   vite2-ch09 : 第九章 HMR 热更新原理
//   vite2-ch10 : 第十章 模块解析与路径别名
//   vite2-ch11 : 第十一章 配置类型与 defineConfig
//   vite2-ch12 : 第十二章 多环境配置
//   vite2-ch13 : 第十三章 resolve 配置详解
// =============================================================

export const chapters = [
  // =========================================================
  // 第八章：依赖预构建（esbuild）
  // =========================================================
  {
    id: "vite2-ch08",
    group: "第二部分 核心概念",
    icon: "🔧",
    title: "第八章 依赖预构建（esbuild）",
    content: `## 第八章　依赖预构建（esbuild）

启动 Vite 项目时，你大概率见过这一行日志：

\`\`\`
✨ new dependencies optimized: react, react-dom
\`\`\`

这就是**依赖预构建**（Dependency Pre-Bundling）。它是 Vite 启动速度的关键一环，本章把原理、配置、常见问题一次讲透。

---

## 一、什么是依赖预构建

简单说：**Vite 启动前，先把第三方依赖（node_modules 里的）用 esbuild 打包成 ESM 格式，缓存到 node_modules/.vite/deps/ 目录**。

之后浏览器请求 \`react\` 时，Vite 直接返回缓存好的 ESM 文件，而不是去原始 node_modules 里翻找。

### 为什么需要预构建？

两个核心原因：

**1. 把 CommonJS 转成 ESM**

很多 npm 包还是 CommonJS 格式（\`module.exports\`），浏览器原生 ESM 不认识。比如 \`lodash\`：

\`\`\`js
// lodash 原始代码（CommonJS）
function debounce(fn, wait) { /* ... */ }
module.exports = { debounce }
\`\`\`

浏览器看到 \`module.exports\` 会直接报错。预构建把它转成：

\`\`\`js
// 预构建后（ESM）
function debounce(fn, wait) { /* ... */ }
export { debounce }
\`\`\`

**2. 减少请求数**

\`lodash-es\` 有 600+ 个小文件。如果浏览器按原生 ESM 加载，会发出 600+ 个 HTTP 请求，浏览器直接卡死。

预构建把 \`lodash\` 合并成**一个文件**，请求减到 1 个。

---

## 二、esbuild 为什么快

Vite 用 **esbuild** 做预构建，而不是 Rollup / Webpack。原因就一个字：**快**。

| 工具 | 语言 | 速度（打包 lodash）|
|------|------|---------------------|
| Webpack | JavaScript | ~1.5s |
| Rollup | JavaScript | ~1.2s |
| esbuild | Go | ~50ms |

esbuild 快的原因：

1. **Go 语言原生**：编译成机器码，没有 JS 解释开销
2. **并行处理**：充分利用多核 CPU
3. **零抽象**：从零实现，不依赖第三方库
4. **内存高效**：复用 AST，避免重复解析

实测 esbuild 比 Webpack 快 **10-100 倍**，这就是 Vite 启动飞快的核心。

---

## 三、optimizeDeps 配置

预构建通过 \`optimizeDeps\` 选项控制：

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['lodash'],           // 强制预构建
    exclude: ['my-local-pkg'],     // 排除预构建
    esbuildOptions: {
      target: 'esnext',            // esbuild 编译目标
      plugins: []                  // esbuild 插件
    }
  }
})
\`\`\`

### include：强制预构建

某些包 Vite 没自动识别，需要手动加入：

\`\`\`js
optimizeDeps: {
  include: [
    'lodash',
    'lodash/debounce',           // 具体子模块
    'date-fns/format'
  ]
}
\`\`\`

常见场景：动态 import、运行时 require 的包，Vite 静态分析发现不了。

### exclude：排除预构建

\`\`\`js
optimizeDeps: {
  exclude: ['my-monorepo-pkg']   // 本地链接的包，不预构建
}
\`\`\`

典型场景：monorepo 里 \`npm link\` 的本地包，希望改代码即时生效，不进缓存。

---

## 四、缓存机制

预构建结果缓存在 \`node_modules/.vite/deps/\`，缓存键基于：

- 包的版本号
- 包的 lockfile（package-lock.json / pnpm-lock.yaml）
- \`vite.config.js\` 中 optimizeDeps 配置

只要这三项不变，第二次启动就直接用缓存，秒启动。

---

## 五、强制重新预构建

有时缓存出问题（比如手动改了 node_modules），需要重新预构建：

\`\`\`bash
# 方式 1：命令行加 --force
vite --force

# 方式 2：删除缓存目录
rm -rf node_modules/.vite
\`\`\`

启动后终端会显示：

\`\`\`
✨ new dependencies optimized: ...
\`\`\`

**注意**：\`--force\` 会清空整个预构建缓存，首次启动会变慢（要重新打包所有依赖）。

---

## 六、常见问题

### 1. 启动报错 "Failed to resolve dependency"

通常是包名拼错，或没装。检查 \`package.json\` 是否真的有这个依赖。

### 2. 浏览器一直刷新，提示 "new dependencies optimized"

代码里有**运行时引入**的依赖，Vite 第一次没扫到，启动后再扫描会触发重新预构建并强制刷新。

解决：把该依赖加到 \`optimizeDeps.include\`。

### 3. monorepo 子包改动不生效

\`npm link\` 的包被预构建缓存了，改代码看不到效果。

解决：把该包加到 \`optimizeDeps.exclude\`。

---

## 下一章

依赖预构建是"启动快"的秘密。下一章我们看"改代码快"的秘密——**HMR 热更新原理**。`,
    code: `// 演示：模拟 Vite 依赖预构建的过程
// ---------------------------------------------------
// 真实场景：Vite 启动时用 esbuild 扫描 import，把
// node_modules 里的依赖打包成 ESM 缓存到 .vite/deps/

console.log("🔧 依赖预构建（esbuild）模拟");
console.log("=====================================");

// 模拟 node_modules 里的依赖（CommonJS 格式）
const nodeModules = {
  "lodash": {
    format: "CommonJS",
    files: 600,                    // 600+ 个小文件
    code: "function debounce(){} module.exports = { debounce }"
  },
  "react": {
    format: "CommonJS",
    files: 1,
    code: "function useState(){} module.exports = { useState }"
  },
  "date-fns": {
    format: "ESM",
    files: 200,
    code: "export function format(){}"
  }
};

// 模拟 esbuild 预构建：把 CJS 转 ESM + 合并文件
const cache = {};
function preBundle(pkgName) {
  const pkg = nodeModules[pkgName];
  console.log(\`\\n📦 预构建: \${pkgName}\`);
  console.log(\`   原始格式: \${pkg.format}, 文件数: \${pkg.files}\`);

  // 模拟 esbuild 转换
  const start = Date.now();
  const optimized = pkg.format === "CommonJS"
    ? pkg.code.replace("module.exports =", "export")
    : pkg.code;

  cache[pkgName] = {
    format: "ESM",
    files: 1,                      // 合并成 1 个文件
    code: optimized
  };

  console.log(\`   ✅ 转为 ESM，合并为 1 个文件，耗时 \${Date.now() - start}ms\`);
}

// 执行预构建
Object.keys(nodeModules).forEach(preBundle);

console.log("\\n=====================================");
console.log("📁 缓存目录 node_modules/.vite/deps/:");
Object.entries(cache).forEach(([name, pkg]) => {
  console.log(\`   \${name}.js  (格式: \${pkg.format}, 文件数: \${pkg.files})\`);
});

console.log("\\n💡 浏览器请求 lodash 时，Vite 直接返回缓存的单文件");
console.log("💡 没有预构建，浏览器要发 600+ 个请求，直接卡死");`
  },

  // =========================================================
  // 第九章：HMR 热更新原理
  // =========================================================
  {
    id: "vite2-ch09",
    group: "第二部分 核心概念",
    icon: "🔥",
    title: "第九章 HMR 热更新原理",
    content: `## 第九章　HMR 热更新原理

HMR（Hot Module Replacement，热模块替换）是开发体验的核心。改一行代码，浏览器**不刷新**就能看到效果。本章讲清楚 Vite HMR 怎么工作、API 怎么用、常见问题怎么解决。

---

## 一、HMR 是什么

传统开发流程：改代码 → 保存 → 浏览器**整页刷新** → 状态丢失（表单清空、滚动归零、登录掉线）。

HMR 流程：改代码 → 保存 → 浏览器**只替换改动的模块** → **状态保留**。

| 维度 | 整页刷新 | HMR 热更新 |
|------|----------|------------|
| 速度 | 慢（重新加载所有资源）| 快（只换一个模块）|
| 状态 | 全部丢失 | 保留（组件 state 不丢）|
| 体验 | 闪一下 | 无感切换 |

---

## 二、Vite HMR 通信机制

Vite 通过 **WebSocket** 在浏览器和 dev server 之间通信：

\`\`\`
浏览器                     Vite Dev Server
  │                              │
  │ 1. WebSocket 连接             │
  │ ────────────────────────────>│
  │                              │
  │  ← 你保存了 App.tsx 文件      │
  │                              │
  │ 2. 推送更新消息               │
  │     { type: 'update',        │
  │       path: '/src/App.tsx' } │
  │ <────────────────────────────│
  │                              │
  │ 3. 请求新版 App.tsx          │
  │ ────────────────────────────>│
  │ 4. 返回编译后的新模块         │
  │ <────────────────────────────│
  │                              │
  │ 5. 替换旧模块，保留状态       │
\`\`\`

整个过程毫秒级完成，所以你感觉"瞬间生效"。

---

## 三、HMR API

Vite 暴露了 \`import.meta.hot\` API，让模块自己控制热更新行为。

### 1. accept：接受自身更新

\`\`\`js
// counter.js
export let count = 0

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 自身被更新时执行
    count = newModule.count
    console.log('已热更新，count =', count)
  })
}
\`\`\`

\`accept\` 接受一个回调，参数是新版模块。在这里把新数据"接续"到旧状态。

### 2. dispose：旧模块卸载前清理

\`\`\`js
// timer.js
let timer = setInterval(() => console.log('tick'), 1000)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // 模块被替换前清理定时器，避免内存泄漏
    clearInterval(timer)
  })
}
\`\`\`

\`dispose\` 用于清理副作用：定时器、事件监听器、WebSocket 连接等。

### 3. prune：模块被删除时清理

\`\`\`js
if (import.meta.hot) {
  import.meta.hot.prune(() => {
    // 模块从依赖图中移除时执行
    console.log('模块被删除')
  })
}
\`\`\`

\`prune\` 触发场景：删除文件、路由切换卸载组件。

---

## 四、HMR 边界

HMR 不会无脑替换整个模块树，而是**沿着 import 链向上找，直到遇到"接受更新"的模块**，这个模块就是 **HMR 边界**。

\`\`\`
main.tsx
  └─ App.tsx
       └─ Counter.tsx  ← 改了这里
\`\`\`

如果 \`Counter.tsx\` 自己 \`accept\`，只换它。如果没 accept，向上找 \`App.tsx\`，再向上找 \`main.tsx\`。如果一路都没人 accept，就**整页刷新**。

### React/Vue 组件自动 HMR

\`@vitejs/plugin-react\` 和 \`@vitejs/plugin-vue\` 自动帮你处理了 HMR 边界，组件文件默认 accept，state 保留。

\`\`\`jsx
// 改下面这个组件的 JSX，state 会保留
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
\`\`\`

你写 React/Vue 时基本不用手动调 HMR API。

---

## 五、常见 HMR 问题

### 1. "页面刷新了，state 丢了"

原因：改的文件没有 HMR 边界，或者改的不是组件本身（比如改了 \`main.tsx\`、改了 store 配置）。

解决：把可变逻辑放到组件文件里，main.tsx 只做挂载。

### 2. "Full page reload needed"

终端提示这个，说明 Vite 找不到 HMR 边界，只能整页刷新。常见原因：

- 改的是入口文件（main.tsx）
- 改的是 vite.config.js
- 改的模块没有 accept，且上层也没 accept

### 3. HMR 后状态不一致

某些 state（比如 \`useRef\`、闭包变量）HMR 后可能错乱。

解决：手动用 \`import.meta.hot.dispose\` 重置。

### 4. WebSocket 连接失败

终端一直报 \`WebSocket failed\`。原因：

- 防火墙拦截
- \`server.hmr\` 配置错误
- 用了代理服务器，没转发 WebSocket

\`\`\`js
// vite.config.js
export default defineConfig({
  server: {
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws'
    }
  }
})
\`\`\`

---

## 下一章

HMR 让你"改代码瞬间看到效果"。下一章学习**模块解析与路径别名**，搞清楚 \`import\` 怎么找文件、\`@/xxx\` 怎么配置。`,
    code: `// 演示：模拟 Vite HMR 的核心机制
// ---------------------------------------------------
// 真实场景：Vite 通过 WebSocket 推送更新，浏览器
// 沿 import 链找到 HMR 边界后替换模块

console.log("🔥 Vite HMR 热更新模拟");
console.log("=====================================");

// 模拟模块依赖图
const moduleGraph = {
  './main.js':    { deps: ['./App.js'], acceptHMR: false },
  './App.js':     { deps: ['./Counter.js', './Title.js'], acceptHMR: true },  // HMR 边界
  './Counter.js': { deps: [], acceptHMR: true },
  './Title.js':   { deps: [], acceptHMR: true }
};

// 模拟 WebSocket 推送：Counter.js 被修改
const changedFile = './Counter.js';
console.log(\`\\n📡 收到更新通知: \${changedFile}\`);

// 沿 import 链找 HMR 边界
function findHMRBoundary(filePath) {
  if (moduleGraph[filePath].acceptHMR) {
    return filePath;   // 自己就是边界
  }
  // 向上查找谁 import 了它
  for (const [parent, info] of Object.entries(moduleGraph)) {
    if (info.deps.includes(filePath)) {
      if (info.acceptHMR) return parent;
      return findHMRBoundary(parent);
    }
  }
  return null;
}

const boundary = findHMRBoundary(changedFile);
console.log(\`🎯 HMR 边界: \${boundary}\`);

if (boundary) {
  console.log("   → 替换模块，保留组件状态");
  console.log("   ✅ 热更新完成，浏览器不刷新");
} else {
  console.log("   ⚠️ 找不到边界，整页刷新");
}

// 模拟 accept / dispose API
console.log("\\n📝 HMR API 模拟：");
console.log("   import.meta.hot.accept((newModule) => { ... })  // 接受更新");
console.log("   import.meta.hot.dispose(() => { ... })          // 清理副作用");
console.log("   import.meta.hot.prune(() => { ... })            // 模块被删除");

console.log("\\n💡 React/Vue 插件自动处理 HMR 边界，组件 state 保留");`
  },

  // =========================================================
  // 第十章：模块解析与路径别名
  // =========================================================
  {
    id: "vite2-ch10",
    group: "第二部分 核心概念",
    icon: "🛣️",
    title: "第十章 模块解析与路径别名",
    content: `## 第十章　模块解析与路径别名

写过 \`import foo from '@/utils/foo'\` 吗？这个 \`@\` 就是路径别名。本章把模块解析规则、别名配置一次讲透。

---

## 一、Node.js 模块解析规则

Vite 开发时基本遵循 Node.js 的模块解析规则。当你写 \`import './foo'\`，Node 会按顺序找：

1. **如果是路径**（\`./\`、\`../\`、\`/\`）：当作文件路径处理
2. **如果是包名**（\`react\`、\`lodash\`）：去 \`node_modules\` 找

### 文件路径解析

\`\`\`js
import './foo'        // 找 ./foo.js → ./foo/index.js
import './foo.js'     // 直接找 ./foo.js
import './foo/'       // 找 ./foo/index.js
import '../bar'       // 找 ../bar.js → ../bar/index.js
\`\`\`

### 包名解析

\`\`\`js
import 'react'        // 找 node_modules/react/index.js
\`\`\`

Node 会按 \`package.json\` 的 \`main\` 字段找入口。现代包用 \`module\` / \`exports\` 字段优先指 ESM 版本：

\`\`\`json
// react 的 package.json
{
  "main": "./index.js",          // CommonJS 入口
  "module": "./esm/index.js",    // ESM 入口（Vite 优先用这个）
  "exports": {
    "import": "./esm/index.js",
    "require": "./index.js"
  }
}
\`\`\`

---

## 二、resolve.extensions：扩展名补全

\`import './foo'\` 不带扩展名时，Vite 会按 \`resolve.extensions\` 顺序补全尝试。

**默认值**：

\`\`\`js
resolve: {
  extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
}
\`\`\`

### 自定义扩展名

\`\`\`js
// vite.config.js
export default defineConfig({
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json']
  }
})
\`\`\`

**注意**：列表越短越快。每多一个扩展名，每个 import 都要多尝试一次文件是否存在。

---

## 三、resolve.alias：路径别名

最常用的配置。给长路径起个短名：

\`\`\`js
// vite.config.js
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
})
\`\`\`

代码里就可以这样写：

\`\`\`js
// 原来
import Button from '../../components/Button'
import { formatDate } from '../../utils/date'

// 用别名后
import Button from '@components/Button'
import { formatDate } from '@utils/date'
\`\`\`

### alias 的两种写法

**字符串写法**（推荐，最简单）：

\`\`\`js
alias: {
  '@': '/src'   // 也可以用绝对路径 path.resolve
}
\`\`\`

**数组写法**（更精细，能控制匹配规则）：

\`\`\`js
import { fileURLToPath } from 'url'

alias: [
  { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
  { find: /^@utils\\/(.*)/, replacement: fileURLToPath(new URL('./src/utils/$1', import.meta.url)) }
]
\`\`\`

数组写法支持**正则匹配**，适合复杂场景。

---

## 四、@ 别名在 TypeScript 中的配置

TS 项目里光配 Vite 还不够，TS 也要认识 \`@\`，否则类型检查会报错。

\`\`\`json
// tsconfig.json
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

\`baseUrl\` 是基准目录，\`paths\` 是别名映射。注意末尾的 \`/*\` 表示通配。

---

## 五、resolve.dedupe：去重

monorepo 里经常出现同一个包被装多份（不同版本），导致运行时出错：

\`\`\`
packages/
  app-a/  node_modules/react/   ← React 18.2
  app-b/  node_modules/react/   ← React 18.3
  shared/ node_modules/react/   ← React 18.0
\`\`\`

\`dedupe\` 强制所有 import 都用根目录的同一份：

\`\`\`js
resolve: {
  dedupe: ['react', 'react-dom', 'vue']
}
\`\`\`

这能避免 "Invalid hook call" 之类诡异的错误。

---

## 六、alias vs paths 对比

| 维度 | Vite alias | TS paths |
|------|-----------|----------|
| 作用域 | 构建时（dev + build）| 类型检查时 |
| 必要性 | 必须配 | TS 项目必须配 |
| 影响运行 | 是 | 否（只影响 TS 报错）|
| 配置位置 | vite.config.js | tsconfig.json |

**最佳实践**：两边都配，保持一致。

---

## 下一章

模块解析清楚了，下一章深入**配置类型与 defineConfig**，看看怎么写出类型安全的 Vite 配置。`,
    code: `// 演示：模拟 Vite 模块解析与路径别名
// ---------------------------------------------------
// 真实场景：import './foo' 时 Vite 按规则找文件，
// 别名把 '@' 映射到 src 目录

console.log("🛣️ 模块解析与路径别名模拟");
console.log("=====================================");

// 模拟项目结构
const projectFiles = [
  '/src/main.js',
  '/src/App.js',
  '/src/components/Button.js',
  '/src/components/Button/index.js',
  '/src/utils/date.js',
  '/src/utils/format.js'
];

// 模拟别名配置
const alias = {
  '@': '/src',
  '@components': '/src/components',
  '@utils': '/src/utils'
};

// 模拟扩展名补全
const extensions = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'];

// 解析函数
function resolveModule(importPath, fromFile = '/src/main.js') {
  console.log(\`\\n🔍 解析: \${importPath} (来自 \${fromFile})\`);

  // 1. 替换别名
  let resolved = importPath;
  for (const [key, val] of Object.entries(alias)) {
    if (importPath.startsWith(key)) {
      resolved = importPath.replace(key, val);
      console.log(\`   别名替换: \${importPath} → \${resolved}\`);
      break;
    }
  }

  // 2. 补全扩展名
  if (!resolved.includes('.')) {
    for (const ext of extensions) {
      const candidate = resolved + ext;
      if (projectFiles.includes(candidate)) {
        console.log(\`   扩展名补全: +\${ext} → \${candidate}\`);
        return candidate;
      }
      // 尝试 /index.js
      const indexCandidate = resolved + '/index' + ext;
      if (projectFiles.includes(indexCandidate)) {
        console.log(\`   找到 index: \${indexCandidate}\`);
        return indexCandidate;
      }
    }
  }

  return resolved;
}

// 测试用例
resolveModule('@/components/Button');
resolveModule('@utils/date');
resolveModule('./App');

console.log("\\n=====================================");
console.log("💡 别名让 import 更短更清晰");
console.log("💡 TS 项目要同步配置 tsconfig.json paths");`
  },

  // =========================================================
  // 第十一章：配置类型与 defineConfig
  // =========================================================
  {
    id: "vite2-ch11",
    group: "第二部分 核心概念",
    icon: "📐",
    title: "第十一章 配置类型与 defineConfig",
    content: `## 第十一章　配置类型与 defineConfig

写 Vite 配置时，第一行永远是 \`export default defineConfig(...)\`。这个 \`defineConfig\` 不是装饰，它带来完整的类型安全保障。本章讲清楚 \`defineConfig\` 的所有用法。

---

## 一、defineConfig 是什么

\`defineConfig\` 是一个**类型辅助函数**，本身不做任何事，只是把传入的对象"标记"成 \`UserConfig\` 类型：

\`\`\`ts
// Vite 源码简化版
function defineConfig(config: UserConfig | UserConfigFn): UserConfig | UserConfigFn {
  return config
}
\`\`\`

好处：

1. **类型提示**：VS Code 里输入 \`server.\` 自动补全 \`port\`、\`host\`、\`proxy\` 等
2. **错误检查**：拼错的配置项标红
3. **文档即代码**：鼠标悬停任意配置项都能看到说明

不用 \`defineConfig\` 也能跑，但**强烈推荐用**。

---

## 二、UserConfig 接口

\`UserConfig\` 是 Vite 配置的根类型，包含所有可配置字段：

\`\`\`ts
interface UserConfig {
  plugins?: PluginOption[]            // 插件
  resolve?: ResolveOptions            // 模块解析
  css?: CSSOptions                    // CSS 处理
  json?: JsonOptions                  // JSON 处理
  esbuild?: ESBuildOptions            // esbuild 配置
  server?: ServerOptions              // 开发服务器
  build?: BuildOptions                // 构建配置
  preview?: PreviewOptions            // 预览服务器
  optimizeDeps?: DepOptimizationOptions  // 依赖预构建
  envDir?: string                     // .env 文件目录
  envPrefix?: string | string[]       // 环境变量前缀
  base?: string                       // 公共基础路径
  mode?: string                       // 模式
  logLevel?: LogLevel                 // 日志级别
  // ... 更多
}
\`\`\`

每个字段都有完整的子类型定义，比如 \`ServerOptions\`：

\`\`\`ts
interface ServerOptions {
  host?: string | boolean
  port?: number
  open?: boolean | string
  proxy?: Record<string, string | ProxyOptions>
  cors?: boolean | CorsOptions
  hmr?: boolean | HMROptions
  // ...
}
\`\`\`

---

## 三、配置的三种写法

### 1. 对象写法（最常用）

\`\`\`ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: { port: 3000 }
})
\`\`\`

适合：配置不随环境变的小项目。

### 2. 函数写法（条件配置）

\`\`\`ts
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  // command: 'serve' | 'build'
  // mode: 'development' | 'production' | 自定义
  if (command === 'serve') {
    return { server: { port: 3000 } }
  }
  return { build: { sourcemap: true } }
})
\`\`\`

\`command\` 取值：

| 命令 | command |
|------|---------|
| \`vite\` | \`'serve'\` |
| \`vite preview\` | \`'serve'\` |
| \`vite build\` | \`'build'\` |

\`mode\` 默认是 \`development\`（serve）或 \`production\`（build），可用 \`--mode\` 覆盖。

### 3. 异步函数写法

\`\`\`ts
export default defineConfig(async ({ command, mode }) => {
  const data = await fetchConfigFromAPI()
  return {
    define: {
      __APP_CONFIG__: JSON.stringify(data)
    }
  }
})
\`\`\`

适合：配置需要异步加载（比如从远程拉配置）。

---

## 四、配置合并

多个配置对象怎么合并？\`defineConfig\` 本身不提供合并，要手动 merge：

\`\`\`ts
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config.base'

export default mergeConfig(baseConfig, defineConfig({
  server: { port: 4000 }
}))
\`\`\`

\`mergeConfig\` 是 Vite 提供的工具函数，做深度合并（数组拼接、对象递归合并）。

---

## 五、环境变量类型声明

\`import.meta.env\` 默认只有 \`MODE\`、\`BASE_URL\`、\`PROD\`、\`DEV\` 这几个内置变量。自定义变量没有类型提示。

### 方式 1：用 ImportMetaEnv 接口

\`\`\`ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
\`\`\`

代码里用就有提示了：

\`\`\`ts
const apiUrl = import.meta.env.VITE_API_URL  // ✅ 有类型提示
const foo = import.meta.env.VITE_FOO         // ❌ 类型报错
\`\`\`

### 方式 2：用 zod 运行时校验

\`\`\`ts
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_TITLE: z.string()
})

const env = envSchema.parse(import.meta.env)
export default env
\`\`\`

更安全，能捕获运行时配置错误。

---

## 六、配置加载顺序

Vite 按这个顺序加载配置：

1. 命令行参数（\`--port 3000\`）
2. \`vite.config.js\` / \`.ts\`
3. \`package.json\` 里的 \`vite\` 字段（少见）
4. 默认值

**优先级**：命令行 > 配置文件 > 默认值。

---

## 下一章

\`defineConfig\` 玩明白了，下一章学习**多环境配置**——怎么用 mode + .env 文件管理 development / staging / production 等多套环境。`,
    code: `// 演示：模拟 defineConfig 的三种写法
// ---------------------------------------------------
// 真实场景：defineConfig 是类型辅助函数，本身不做
// 任何事，只是把对象标记成 UserConfig 类型

console.log("📐 defineConfig 三种写法模拟");
console.log("=====================================");

// 模拟 defineConfig
const defineConfig = (config) => {
  if (typeof config === 'function') {
    return config;   // 函数写法原样返回
  }
  return config;
};

// ===== 写法 1：对象写法 =====
console.log("\\n1️⃣ 对象写法（最常用）");
const objConfig = defineConfig({
  plugins: [],
  server: { port: 3000 }
});
console.log("   配置:", JSON.stringify(objConfig, null, 2));

// ===== 写法 2：函数写法（条件配置）=====
console.log("\\n2️⃣ 函数写法（条件配置）");
const fnConfig = defineConfig(({ command, mode }) => {
  console.log(\`   command=\${command}, mode=\${mode}\`);
  if (command === 'serve') {
    return { server: { port: 3000, open: true } };
  }
  return { build: { sourcemap: true } };
});
// 模拟调用：vite build
console.log("   模拟 vite build:");
console.log("   结果:", JSON.stringify(fnConfig({ command: 'build', mode: 'production' })));

// ===== 写法 3：异步函数写法 =====
console.log("\\n3️⃣ 异步函数写法");
const asyncConfig = defineConfig(async ({ command }) => {
  // 模拟异步加载远程配置
  await new Promise(r => setTimeout(r, 100));
  return { define: { __APP_CONFIG__: '"loaded"' } };
});
console.log("   配置类型:", typeof asyncConfig);
console.log("   是异步函数:", asyncConfig.constructor.name === 'AsyncFunction');

console.log("\\n=====================================");
console.log("💡 command: 'serve'(dev/preview) | 'build'");
console.log("💡 mode 默认 'development'/'production'，可用 --mode 覆盖");
console.log("💡 TS 项目用 ImportMetaEnv 接口给 env 加类型");`
  },

  // =========================================================
  // 第十二章：多环境配置
  // =========================================================
  {
    id: "vite2-ch12",
    group: "第二部分 核心概念",
    icon: "🌍",
    title: "第十二章 多环境配置",
    content: `## 第十二章　多环境配置

实际项目通常有多个环境：开发（dev）、测试（staging）、生产（production）。每个环境的 API 地址、特性开关、日志级别都不一样。Vite 通过 \`mode\` + \`.env\` 文件优雅解决。

---

## 一、mode 模式

Vite 内置两个模式：

| 模式 | 默认触发命令 | \`import.meta.env.PROD\` | \`import.meta.env.DEV\` |
|------|--------------|--------------------------|-------------------------|
| \`development\` | \`vite\` | \`false\` | \`true\` |
| \`production\` | \`vite build\` | \`true\` | \`false\` |

用 \`--mode\` 参数指定其他模式：

\`\`\`bash
vite build --mode staging    # 测试环境构建
vite build --mode preview    # 预发布环境构建
vite --mode local            # 本地自定义模式启动 dev
\`\`\`

---

## 二、.env 文件

Vite 会按 \`mode\` 加载对应的 \`.env\` 文件。

### 文件命名规则

\`\`\`
.env                  # 所有环境都加载
.env.local            # 所有环境都加载，但不提交到 git
.env.[mode]           # 特定 mode 加载
.env.[mode].local     # 特定 mode 加载，不提交到 git
\`\`\`

### 加载优先级（高 → 低）

\`\`\`
.env.[mode].local
.env.[mode]
.env.local
.env
\`\`\`

高优先级覆盖低优先级。

### 典型项目结构

\`\`\`
my-app/
├── .env                  # 公共：VITE_APP_TITLE=My App
├── .env.development      # 开发：VITE_API_URL=http://localhost:3000
├── .env.staging          # 测试：VITE_API_URL=https://api.staging.com
├── .env.production       # 生产：VITE_API_URL=https://api.prod.com
├── .env.local            # 本地覆盖（gitignore）
└── ...
\`\`\`

### 文件内容

\`\`\`bash
# .env（公共）
VITE_APP_TITLE=我的应用

# .env.development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

# .env.production
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
\`\`\`

---

## 三、import.meta.env

代码里通过 \`import.meta.env\` 读取：

\`\`\`js
console.log(import.meta.env.MODE)         // 'development' / 'production' / 'staging'
console.log(import.meta.env.DEV)          // true / false
console.log(import.meta.env.PROD)         // true / false
console.log(import.meta.env.BASE_URL)     // '/' (base 配置)
console.log(import.meta.env.VITE_API_URL) // 自定义变量
\`\`\`

**关键规则**：只有以 \`VITE_\` 开头的变量才会暴露给代码！这是为了防止误把数据库密码等敏感信息泄露到前端。

\`\`\`bash
# .env
VITE_API_URL=http://api.com    # ✅ 前端能用
DB_PASSWORD=secret             # ❌ 前端用不了（仅 server 配置可用）
\`\`\`

---

## 四、条件构建

在 \`vite.config.js\` 里根据 \`mode\` 走不同配置：

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    // 生产环境才压缩、才加 sourcemap
    build: {
      sourcemap: !isProd,            // 开发/测试才生成 sourcemap
      minify: isProd ? 'esbuild' : false
    },

    // 生产环境才加分析插件
    plugins: [
      isProd && visualizer()
    ].filter(Boolean),

    // 注入环境变量
    define: {
      __DEV__: mode !== 'production'
    }
  }
})
\`\`\`

---

## 五、多环境配置实践

### 实践 1：package.json scripts

\`\`\`json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:prod": "vite build --mode production",
    "preview:staging": "vite preview --mode staging"
  }
}
\`\`\`

### 实践 2：环境感知的 API 客户端

\`\`\`ts
// src/api/client.ts
const baseURL = import.meta.env.VITE_API_URL

export async function request(path: string, options?: RequestInit) {
  const res = await fetch(\`\${baseURL}\${path}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })
  return res.json()
}
\`\`\`

### 实践 3：开发时打印日志，生产时静默

\`\`\`ts
// src/utils/log.ts
const isDev = import.meta.env.DEV

export const log = (...args: any[]) => {
  if (isDev) console.log('[app]', ...args)
}

export const warn = (...args: any[]) => {
  if (isDev) console.warn('[app]', ...args)
}
\`\`\`

---

## 六、envDir 与 envPrefix

### envDir：自定义 .env 目录

\`\`\`js
export default defineConfig({
  envDir: 'config'   // 从 ./config 读 .env，而不是根目录
})
\`\`\`

### envPrefix：自定义变量前缀

\`\`\`js
export default defineConfig({
  envPrefix: ['VITE_', 'APP_']   // VITE_ 和 APP_ 开头都暴露
})
\`\`\`

注意：\`VITE_\` 是默认前缀，改前缀要慎重，避免和 Node 内置变量冲突。

---

## 下一章

mode + .env 玩明白了，下一章深入 **resolve 配置详解**，把模块解析的所有选项一次讲清楚。`,
    code: `// 演示：模拟 Vite 多环境配置
// ---------------------------------------------------
// 真实场景：用 --mode 参数 + .env 文件管理多套环境

console.log("🌍 Vite 多环境配置模拟");
console.log("=====================================");

// 模拟 .env 文件内容
const envFiles = {
  '.env':               { VITE_APP_TITLE: '我的应用' },
  '.env.development':   { VITE_API_URL: 'http://localhost:3000', VITE_DEBUG: 'true' },
  '.env.staging':       { VITE_API_URL: 'https://api.staging.com', VITE_DEBUG: 'true' },
  '.env.production':    { VITE_API_URL: 'https://api.prod.com', VITE_DEBUG: 'false' }
};

// 模拟 Vite 加载 .env 的优先级（高 → 低）
function loadEnv(mode) {
  const result = {};
  const filesToLoad = [
    '.env',
    '.env.local',
    \`.env.\${mode}\`,
    \`.env.\${mode}.local\`
  ];

  console.log(\`\\n📦 加载 mode=\${mode} 的 .env 文件:\`);
  filesToLoad.forEach(f => {
    if (envFiles[f]) {
      console.log(\`   读取 \${f}:\`, envFiles[f]);
      Object.assign(result, envFiles[f]);   // 后加载覆盖先加载
    }
  });

  return result;
}

// 模拟 import.meta.env
function createImportMetaEnv(mode, envVars) {
  return {
    MODE: mode,
    DEV: mode === 'development',
    PROD: mode === 'production',
    BASE_URL: '/',
    ...envVars    // 只暴露 VITE_ 开头的
  };
}

// 测试不同 mode
['development', 'staging', 'production'].forEach(mode => {
  const envVars = loadEnv(mode);
  const importMetaEnv = createImportMetaEnv(mode, envVars);

  console.log(\`\\n   → import.meta.env:\`);
  Object.entries(importMetaEnv).forEach(([k, v]) => {
    console.log(\`     \${k} = \${v}\`);
  });
});

console.log("\\n=====================================");
console.log("💡 只有 VITE_ 开头的变量会暴露给前端");
console.log("💡 加载优先级: .env.[mode].local > .env.[mode] > .env.local > .env");
console.log("💡 命令行: vite build --mode staging");`
  },

  // =========================================================
  // 第十三章：resolve 配置详解
  // =========================================================
  {
    id: "vite2-ch13",
    group: "第二部分 核心概念",
    icon: "🧭",
    title: "第十三章 resolve 配置详解",
    content: `## 第十三章　resolve 配置详解

\`resolve\` 控制模块怎么被解析。本章把所有 \`resolve\` 子选项讲清楚，配置模块解析不再迷茫。

---

## 一、resolve.alias 详解

最常用的选项。给长路径起短名，或重定向模块。

### 字符串别名

\`\`\`js
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@utils': '/src/utils'
  }
}
\`\`\`

代码里 \`import '@/foo'\` 实际加载 \`/src/foo\`。

### 数组别名（支持正则）

\`\`\`js
import path from 'path'

resolve: {
  alias: [
    // 精确匹配
    { find: '@', replacement: path.resolve(__dirname, 'src') },
    // 正则匹配
    { find: /^@utils\\/(.*)/, replacement: path.resolve(__dirname, 'src/utils/$1') }
  ]
}
\`\`\`

### 重定向模块

把某个包替换成另一个：

\`\`\`js
resolve: {
  alias: {
    // 替换 react 为 preact/compat
    'react': 'preact/compat',
    'react-dom': 'preact/compat',
    // 用 ESM 版 lodash
    'lodash': 'lodash-es'
  }
}
\`\`\`

### 注意事项

\`alias\` 是**字符串前缀匹配**。看这个坑：

\`\`\`js
// ❌ 错误写法
alias: {
  '@': '/src'
}
// import '@foo' 会变成 '/srcfoo'，不是 '/src/foo'

// ✅ 正确写法
alias: {
  '@': '/src/'      // 加结尾斜杠，或
  '@/': '/src/'
}
// 或用数组 + 正则
alias: [
  { find: '@', replacement: '/src' },          // 精确匹配
  { find: /^@\\/(.*)/, replacement: '/src/$1' } // 路径匹配
]
\`\`\`

---

## 二、resolve.extensions

控制不带扩展名的 import 怎么补全。

\`\`\`js
resolve: {
  extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
}
\`\`\`

**默认值**：\`['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']\`

### 调整建议

- **Vue 项目**：加上 \`.vue\`
- **Svelte 项目**：加上 \`.svelte\`
- **追求速度**：删掉用不到的扩展名（每个都要文件系统 stat）

\`\`\`js
// Vue 项目推荐配置
resolve: {
  extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.vue', '.json']
}
\`\`\`

---

## 三、resolve.dedupe

去重。同一份依赖只保留一份，避免 monorepo 里多版本冲突。

\`\`\`js
resolve: {
  dedupe: ['react', 'react-dom', 'vue', 'vue-router']
}
\`\`\`

### 为什么需要

monorepo 里经常这样：

\`\`\`
my-monorepo/
├── node_modules/react/        ← v18.3.0
├── packages/
│   ├── app/
│   │   └── node_modules/react/  ← v18.2.0
│   └── shared/
│       └── node_modules/react/  ← v18.0.0
\`\`\`

不同子包 import 时拿到不同版本的 React，会导致：

- "Invalid hook call" 错误
- Context 失效（Provider 用 v18.3，Consumer 用 v18.0）
- 实例 instanceof 检查失败

\`dedupe\` 强制所有 import 都用根目录的版本。

---

## 四、resolve.conditions

ESM 的 \`exports\` 字段支持条件导出：

\`\`\`json
// 包的 package.json
{
  "exports": {
    ".": {
      "import": "./esm/index.js",
      "require": "./cjs/index.js",
      "browser": "./browser/index.js",
      "default": "./index.js"
    }
  }
}
\`\`\`

\`conditions\` 决定用哪个条件：

\`\`\`js
resolve: {
  conditions: ['browser', 'import', 'module', 'default']
}
\`\`\`

### dev vs build 默认值

- **dev**：\`['browser', 'module', 'development', 'import', 'default']\`
- **build**：\`['browser', 'module', 'production', 'import', 'default']\`

注意 \`development\` / \`production\` 这两个条件。React 包就用了它：

\`\`\`json
// react 的 package.json
{
  "exports": {
    ".": {
      "development": "./development.js",   // 含警告的 dev 版
      "production": "./production.js",     // 精简的生产版
      "default": "./index.js"
    }
  }
}
\`\`\`

所以 dev 时拿到带警告的 React，build 时拿到精简版，自动切换。

---

## 五、resolve.mainFields

旧式 CommonJS 包没有 \`exports\`，用 \`main\` / \`module\` / \`browser\` 字段。 \`mainFields\` 控制读取顺序：

\`\`\`js
resolve: {
  mainFields: ['browser', 'module', 'jsnext:main', 'jsnext']
}
\`\`\`

**默认值**：\`['browser', 'module', 'jsnext:main', 'jsnext']\`

| 字段 | 含义 |
|------|------|
| \`browser\` | 浏览器专用入口 |
| \`module\` | ESM 入口（Vite 优先用）|
| \`main\` | CommonJS 入口（兜底）|
| \`jsnext:main\` | 老式 ESM 入口（已废弃）|

通常不用改。

---

## 六、resolve.preserveSymlinks

控制是否解析符号链接（symlink）。

\`\`\`js
resolve: {
  preserveSymlinks: false   // 默认，解析 symlink 到真实路径
}
\`\`\`

### 为什么需要

\`pnpm\` 用 symlink 组织 node_modules，结构像这样：

\`\`\`
node_modules/
├── react -> ../../.pnpm/react@18.3.0/node_modules/react   (symlink)
\`\`\`

- \`preserveSymlinks: false\`（默认）：\`react\` 被解析到真实路径 \`/.pnpm/react@18.3.0/...\`
- \`preserveSymlinks: true\`：\`react\` 保持为 \`node_modules/react\`

**默认 false 即可**，除非你的项目依赖 symlink 的具体路径（比如 webpack 的 \`resolve.modules\` 配置）。

---

## 七、完整配置示例

\`\`\`js
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    // 别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    },
    // 扩展名
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.vue', '.json'],
    // 去重（monorepo 必备）
    dedupe: ['react', 'react-dom'],
    // 条件导出
    conditions: ['browser', 'module', 'import', 'default'],
    // mainFields 通常用默认
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
    // symlink 解析（默认即可）
    preserveSymlinks: false
  }
})
\`\`\`

---

## 下一章

\`resolve\` 全部选项都讲完了。第二部分核心概念到此结束，下一章进入**第三部分 配置详解**，深入 \`server\`、\`build\`、\`css\` 等配置项。`,
    code: `// 演示：模拟 Vite resolve 配置的所有子选项
// ---------------------------------------------------
// 真实场景：resolve 控制模块解析行为，包括别名、
// 扩展名、去重、条件导出、mainFields、symlink

console.log("🧭 resolve 配置详解模拟");
console.log("=====================================");

// 模拟完整 resolve 配置
const resolveConfig = {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@utils': '/src/utils'
  },
  extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.vue', '.json'],
  dedupe: ['react', 'react-dom'],
  conditions: ['browser', 'module', 'import', 'default'],
  mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
  preserveSymlinks: false
};

// 逐个演示
console.log("\\n1️⃣ alias - 路径别名:");
const importPath = '@/components/Button';
let resolved = importPath;
for (const [find, replace] of Object.entries(resolveConfig.alias)) {
  if (importPath.startsWith(find)) {
    resolved = importPath.replace(find, replace);
    break;
  }
}
console.log(\`   \${importPath} → \${resolved}\`);

console.log("\\n2️⃣ extensions - 扩展名补全:");
console.log("   顺序:", resolveConfig.extensions.join(' → '));
console.log("   import './foo' 会依次尝试: foo.mjs, foo.js, foo.ts, ...");

console.log("\\n3️⃣ dedupe - 去重（monorepo 必备）:");
console.log("   强制使用根目录的:", resolveConfig.dedupe.join(', '));

console.log("\\n4️⃣ conditions - 条件导出:");
console.log("   顺序:", resolveConfig.conditions.join(' → '));
console.log("   包 exports.import 优先于 exports.require");

console.log("\\n5️⃣ mainFields - 旧式包入口字段:");
console.log("   顺序:", resolveConfig.mainFields.join(' → '));
console.log("   browser > module > main");

console.log("\\n6️⃣ preserveSymlinks - symlink 解析:");
console.log("   false (默认): 解析到真实路径 (pnpm 友好)");
console.log("   true: 保持 symlink 路径");

console.log("\\n=====================================");
console.log("💡 alias 是字符串前缀匹配，注意结尾斜杠");
console.log("💡 extensions 越短越快，每项多一次文件系统 stat");
console.log("💡 monorepo 必配 dedupe，避免多版本冲突");`
  },
];
